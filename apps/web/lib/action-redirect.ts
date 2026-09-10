/**
 * A SERVER ACTION THAT REDIRECTS REJECTS THE AWAITED PROMISE. Next's action reducer navigates on
 * its own and rejects the caller with a `NEXT_REDIRECT` error so a render-time boundary can handle
 * it (`server-action-reducer.js:241-262`, read 2026-09-06); in an event handler there is no
 * boundary, so the rejection lands in `catch` and must not be reported as a failure.
 *
 * ONE COPY, because three callers need it and the first two were written twice by hand: a
 * successful passkey sign-in was told "No passkey on this device yet" for the instant before the
 * dashboard arrived, which is the bug this predicate exists to prevent (review, 2026-09-06). It is
 * pure and it is here so `node --test` reaches it — the third caller, the nudge, had no guard at
 * all and turned an expired session into an error boundary (review, 2026-09-06).
 */
export const isRedirect = (error: unknown): boolean =>
  typeof (error as { digest?: unknown })?.digest === 'string' &&
  (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')

/**
 * …AND THE SAME FOR `notFound()`. Its digest is `NEXT_HTTP_ERROR_FALLBACK;404` (Next 16.3.1,
 * `http-access-fallback/http-access-fallback.js`, read 2026-09-10); an action called directly
 * from an event handler rejects with it exactly as it does with a redirect, and the caller has to
 * recognise it to give the customer the not-found page rather than a sentence about a save.
 */
export const isNotFound = (error: unknown): boolean =>
  typeof (error as { digest?: unknown })?.digest === 'string' &&
  (error as { digest: string }).digest.startsWith('NEXT_HTTP_ERROR_FALLBACK;404')

