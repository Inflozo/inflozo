'use client'

// RELATIVE, AND WITH THE EXTENSION, like every other plain module a test reaches
// (`account/deletion-rule.ts` says the same): `node --test` strips types but does not read
// tsconfig `paths`, so an `@/` here would resolve under `next build` and throw
// `ERR_MODULE_NOT_FOUND` the moment `connect-rule.test.ts` imported this file.
import { isPlainHttp, normaliseSiteUrl } from '../../../../../lib/connect-rule.ts'

/**
 * FR-C2's browser-side half: the Content API key is checked FROM THE BROWSER, direct to the
 * customer's Ghost, because that is the path the editor will use. A server-side 200 would prove
 * the wrong thing — no CORS, no mixed content, no browser.
 *
 * EXECUTED ON BOTH MAJORS (MEASUREMENTS §38b): `GET /ghost/api/content/settings/?key=…` with
 * `Accept-Version: v5.0` answers 200 and `access-control-allow-origin: *` on T1 (6.58.0) and T3
 * (5.130.6), the preflight allows `accept-version`, and a key Ghost never issued is a 401
 * `Unknown Content API Key`. `v5.0` is deliberate and not a placeholder: it is the version this
 * shape of the Content API was pinned to, and both majors serve it.
 *
 * IT NEVER THROWS. A refusal, a DNS failure and the ten seconds are three answers, and only the
 * first is the user's to fix — everything else lets the submit through, so the SERVER's own answer
 * is what the customer reads rather than a guess made in their browser.
 */
export type ContentVerdict = 'ok' | 'unknown_key' | 'unreachable' | 'skipped_http'

const TIMEOUT_MS = 10_000

export async function checkContentKey(siteUrl: string, key: string): Promise<ContentVerdict> {
  const origin = normaliseSiteUrl(siteUrl)
  if (!origin || !key.trim()) return 'unreachable'
  // A page served over https cannot fetch a plain-http origin at all (mixed content), and the
  // CSP does not admit `http:` either — so the check is SKIPPED rather than reported as a
  // refusal, and Ghost's own 403 answers the connect instead (§38c).
  if (isPlainHttp(siteUrl)) return 'skipped_http'

  try {
    const response = await fetch(
      `${origin}/ghost/api/content/settings/?key=${encodeURIComponent(key.trim())}`,
      { headers: { 'Accept-Version': 'v5.0' }, signal: AbortSignal.timeout(TIMEOUT_MS) },
    )
    if (response.status === 401) return 'unknown_key'
    return response.ok ? 'ok' : 'unreachable'
  } catch {
    return 'unreachable'
  }
}
