// Host routing, the CSP and the session refresh for the one deployment that serves both
// domains. Next 16 renamed middleware.ts to proxy.ts and runs it on the Node.js runtime,
// which is what both the session-aware CSP and `@supabase/ssr` need.
//
// The two decisions that can be proved without a browser live in their own pure files —
// `./routing.ts` (which host gets which path) and `./csp.ts` (the policy string) — because
// `import 'next/server'` is unresolvable outside Next's own resolver, so anything in THIS
// file is beyond `node --test`. Keep it thin on purpose.
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isApp as isAppPath, route, SEARCH_HEADER } from './routing.ts'
import { policy, policyName, requestHeaders } from './csp.ts'
// `cookies.ts`, not `server.ts`: the leaf exists so this symbol is reachable without dragging
// `next/headers` and the whole server client into the proxy bundle (review, 2026-09-05).
import { sessionCookie } from './lib/supabase/cookies.ts'

/**
 * Reissue the session cookies on every app request, so the 30-day window starts again from
 * this visit (FR-A6's client half) and an expired access token is refreshed before any page
 * asks who the user is.
 *
 * `getUser()`, not `getSession()`: only the first verifies the token with GoTrue. It is also
 * what triggers the refresh, so the call is the work, not a check on it.
 */
async function refreshSession(req: NextRequest, res: NextResponse) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(written) {
        for (const { name, value, options } of written) res.cookies.set(name, value, sessionCookie(options))
      },
    },
  })
  await supabase.auth.getUser()
}

export async function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const { pathname, search } = req.nextUrl
  const decision = route(host, pathname, search)

  // A redirect carries no page, so it needs neither a nonce nor a session read.
  if (decision.kind === 'redirect') {
    return NextResponse.redirect(new URL(decision.url), 308)
  }

  // An app request is one the app host rewrote, or — on localhost, which has no host split —
  // one that reaches the internal prefix directly. On both real hosts `/app/…` has already
  // redirected above, so this second clause can only be a local one.
  const isApp = decision.kind === 'rewrite' || isAppPath(pathname)

  // §18: emitting the header is free; READING the nonce costs prerendering. Marketing is
  // therefore given no nonce at all — not an unused one — so nothing downstream can read one.
  // The probe's own base64 form, kept (tools/probe/csp/proxy.ts:15): a CSP nonce-value is a
  // base64 value, and a bare UUID is not one.
  const nonce = isApp ? Buffer.from(crypto.randomUUID()).toString('base64') : ''
  const csp = policy(host, nonce, process.env.NODE_ENV !== 'production')

  // TWO request headers, and the second is load-bearing — `requestHeaders` in csp.ts says why and
  // is where `csp.test.ts` holds the pair together. Set as two loose calls here, either one could
  // be deleted by a later edit with lint, types, every test and the build all still green.
  const headers = new Headers(req.headers)
  for (const [name, value] of Object.entries(requestHeaders(nonce, csp))) headers.set(name, value)
  // A THIRD, AND IT IS NOT THE CSP'S — `SEARCH_HEADER` in routing.ts says why a layout needs the
  // query string handed to it. Set on every app request, EMPTY INCLUDED, so a header a client sent
  // is always overwritten rather than believed.
  if (isApp) headers.set(SEARCH_HEADER, search)

  const res =
    decision.kind === 'rewrite'
      ? NextResponse.rewrite(new URL(decision.path, req.url), { request: { headers } })
      : isApp
        ? NextResponse.next({ request: { headers } })
        : NextResponse.next()

  res.headers.set('content-security-policy', csp)
  res.headers.set('x-inflozo-policy', policyName(host, nonce))

  if (isApp) await refreshSession(req, res)

  return res
}

// `icon.svg`, `icon.png`, `apple-icon.png` and `brand/` join the exclusion with Story 1.6's
// identity — `icon.png` with Story 3.9's DW-35, the tab icon for a Safari older than 26, which
// shows nothing at all for an SVG one — and `connect/` with Story 3.2's Ghost Admin screenshot: on
// app.inflozo.com every path the proxy sees is rewritten to /app/… (`routing.ts`), which would
// send the root-served icons, the email's
// mark and the wizard's picture to a 404. Excluded here they are served by Next's own static
// handling on both hosts; `routing.test.ts` covers `route()`, so the control is the deployed curl
// in the story's Verification — and `routing.test.ts` reads this literal back, walks every folder
// under `public/`, and runs it (review, 2026-09-06). It stays a literal here: Next extracts
// `config` statically, so it cannot be imported from `routing.ts` — and the dots stay unescaped,
// as in Next's own docs, so the text the test reads is the pattern Next runs. Each excluded folder
// is a PREFIX reserved for static files: a page route must never be placed under `brand/` or
// `connect/`, because it would escape the proxy — no rewrite, no CSP, no session refresh.
export const config = { matcher: ['/((?!_next/|favicon.ico|icon.svg|icon.png|apple-icon.png|brand/|connect/).*)'] }
