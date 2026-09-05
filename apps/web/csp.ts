// The two policies, kept free of `next/server` so `node --test` can prove them — the same
// reason `routing.ts` exists (`import 'next/server'` is unresolvable outside Next's own
// resolver, executed 2026-09-04).
//
// MEASUREMENTS §18, executed on Vercel Pro: setting a CSP header in `proxy.ts` does NOT
// force dynamic rendering — READING the nonce does. So marketing carries a policy AND stays
// prerendered (`x-vercel-cache: PRERENDER` while serving a CSP), and only the app host pays,
// because only `app/(app)/app/layout.tsx` reads `x-nonce`.
//
// The shape is the probe's (`tools/probe/csp/proxy.ts:9-49`), with one addition it did not
// carry: `form-action 'self'` on BOTH policies. The app posts a server action from the sign-in
// form and marketing has forms coming in E14; without it a CSP-aware browser would let either
// page post anywhere.

import { APP } from './routing.ts'

/** The connected Ghost origins a session may talk to. Today the two test servers; the
 *  session's real list arrives with Epic 3, which is why this is per-request already. */
const GHOST_ORIGINS = 'https://ghost5.inflozo.com https://ghost6.inflozo.com'

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

  const scriptSrc = app
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`
    : `script-src 'self'${dev ? " 'unsafe-eval'" : ''}`

  return [
    `default-src 'self'`,
    scriptSrc,
    // Tailwind ships a stylesheet, but next/font injects an inline <style> for the three
    // self-hosted faces and React inlines critical CSS. A style nonce would have to reach
    // both, and neither is ours to stamp.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    ...(app ? [`connect-src 'self' ${GHOST_ORIGINS}`] : []),
    // No `font-src`: next/font self-hosts all three faces, so `default-src 'self'` already
    // covers them and a second directive saying the same thing is one more thing to drift.
    // NOT 'none': AD-21's editing canvas is a same-origin iframe of this very host.
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')
}

/** The header `proxy.ts` sets so the review surface can tell the two apart by looking. */
export const policyName = (host: string, nonce: string) =>
  host.toLowerCase().split(':')[0] === APP || nonce ? 'app-nonce' : 'marketing-static'
