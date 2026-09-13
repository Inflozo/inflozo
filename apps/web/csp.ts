// The two policies, kept free of `next/server` so `node --test` can prove them — the same
// reason `routing.ts` exists (`import 'next/server'` is unresolvable outside Next's own
// resolver, executed 2026-09-04).
//
// MEASUREMENTS §18, executed on Vercel Pro: setting a CSP header in `proxy.ts` does NOT
// force dynamic rendering — READING the nonce does. So marketing carries a policy AND stays
// prerendered (`x-vercel-cache: PRERENDER` while serving a CSP), and only the app host pays,
// because only the app reads `x-nonce` — `app/(app)/app/layout.tsx`, and since Story 4.4 the
// style-guide's `frame/route.ts`, which stamps it on Ghost's card scripts.
//
// The shape is the probe's (`tools/probe/csp/proxy.ts:9-49`), with one addition it did not
// carry: `form-action 'self'` on BOTH policies. The app posts a server action from the sign-in
// form and marketing has forms coming in E14; without it a CSP-aware browser would let either
// page post anywhere.

import { APP } from './routing.ts'

/**
 * WHERE THE APP HOST'S SCRIPTS MAY CONNECT. `'self' https:` since Story 3.2, and the two test
 * Ghosts that stood here before it are gone with the placeholder's promise that "the session's
 * real list arrives with Epic 3".
 *
 * A STORED LIST CANNOT SERVE THE CONNECT MOMENT. FR-C2 verifies the Content API key from the
 * BROWSER, direct to the customer's Ghost — and at that moment the origin being checked is by
 * definition not stored yet, and it can be any host on the public web. Enumerating stored origins
 * per request would also put a database read on every navigation for a second-line control:
 * `script-src` with a nonce and `'strict-dynamic'` is what stops an injected script from running
 * at all, and `img-src` is already `https:`.
 *
 * `http:` IS LEFT OUT ON PURPOSE. A page served over https cannot fetch a plain-http origin
 * anyway (mixed content), the connect screen warns the moment the field says `http://`, and both
 * test Ghosts send a plain-http admin call that carries a key on to https with a 301, which the
 * chokepoint never follows (MEASUREMENTS §38c as corrected at Review, 2026-09-08).
 */
const APP_CONNECT = "'self' https:"

/**
 * `host` is the raw Host header. `nonce` is the per-request value the app host stamps into
 * `x-nonce`; marketing never gets one. `dev` relaxes `script-src` for `next dev`'s eval-based
 * refresh — §18c is explicit that `'unsafe-eval'` must never reach production, so it is a
 * parameter here rather than an environment read, and `csp.test.ts` asserts both sides.
 */
export function policy(host: string, nonce: string, dev = false): string {
  const isApp = host.toLowerCase().split(':')[0] === APP

  // Localhost has no host-based split — `next dev` serves the app directly at /app — so the
  // nonce is what decides there: a request that carries one is an app request.
  const app = isApp || Boolean(nonce)

  /* THE MARKETING HOST TAKES `'unsafe-inline'` AND THE APP HOST NEVER DOES — the owner's ruling
     at Story 3.9's Question 1, option 1 (2026-09-11), closing DW-18's marketing half.
     Marketing is PRERENDERED, so its HTML was written at build time and carries no nonce; under
     `script-src 'self'` the browser therefore blocked Next's own inline bootstrap and the page
     threw an uncaught minified React error 412 (written without its `#`: `tokens.test.ts` reads a
     three-digit hash as a colour literal and the tokens are the only colour vocabulary) — two
     blocked scripts, re-measured on
     production 2026-09-11 before this change. Nothing on that page needs a script today, so
     nobody could see it; the moment Epic 14 puts a "Start free" button there, the button would
     do nothing, silently.
     THE RELAXATION CANNOT REACH THE APP. It is a different origin, and the branch below is the
     host split itself — but a shared function is exactly where a later edit walks a relaxation
     across a split, so `csp.test.ts` asserts that the app policy can NEVER carry
     `'unsafe-inline'` in `script-src`, in both directions.
     ONE CLAIM EXECUTED RATHER THAN ASSERTED (standing rule 1): CSP Level 3's inline-checking
     algorithm IGNORES `'unsafe-inline'` whenever the policy also carries a nonce-source or a
     hash-source, so the relaxation would be INERT on the app host rather than dangerous there.
     That is a reason to be less worried, not a reason to relax the app policy — the test above
     holds the split by assertion, and the claim itself was EXECUTED at Story 3.9's Dev
     (2026-09-11, the spec's `## Verification`): an unnonced inline script injected into the served
     document RAN on inflozo.com and was REFUSED on app.inflozo.com. No harness repeats that read;
     the test above is what stands guard. */
  const scriptSrc = app
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`
    : `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`

  return [
    `default-src 'self'`,
    scriptSrc,
    // Tailwind ships a stylesheet, but next/font injects an inline <style> for the three
    // self-hosted faces and React inlines critical CSS. A style nonce would have to reach
    // both, and neither is ours to stamp.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    ...(app ? [`connect-src ${APP_CONNECT}`] : []),
    // No `font-src`: next/font self-hosts all three faces, so `default-src 'self'` already
    // covers them and a second directive saying the same thing is one more thing to drift.
    // NOT 'none': AD-21's editing canvas is a same-origin iframe of this very host.
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')
}

/**
 * THE TWO REQUEST HEADERS AN APP REQUEST CARRIES, returned as one value so they cannot drift
 * apart. `x-nonce` is for our own layout; `content-security-policy` on the REQUEST is how Next
 * finds the nonce to stamp onto the framework's own <script> tags. Dropping the second is §18's
 * stated SILENT failure: every Next script ships unnonced, `'strict-dynamic'` blocks the lot, and
 * the response still carries a policy that looks exactly right. `proxy.ts` is beyond `node --test`
 * (it imports `next/server`), so the pair lives here where `csp.test.ts` can hold it — the same
 * reason `routing.ts` and `policy()` are here rather than there.
 */
export function requestHeaders(nonce: string, csp: string): Record<string, string> {
  return nonce ? { 'x-nonce': nonce, 'content-security-policy': csp } : {}
}

/** The header `proxy.ts` sets so the review surface can tell the two apart by looking. */
export const policyName = (host: string, nonce: string) =>
  host.toLowerCase().split(':')[0] === APP || nonce ? 'app-nonce' : 'marketing-static'
