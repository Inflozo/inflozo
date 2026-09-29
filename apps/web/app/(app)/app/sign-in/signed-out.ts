/**
 * THE SIGN-OUT URL CONTRACT, both halves, in one module: the keys `signOut` puts on the URL and
 * the pages that read them. Shared so a rename on either side fails `tsc` rather than silently
 * losing a sentence the owner asked for (his third test, finding 2; his ruling at question 8).
 * A plain module: the `'use server'` file may export only async functions — and it imports no
 * Next, so `node --test` loads it, which is why `signOutFailed` below lives here too (DW-41).
 *
 * THE KEY WAS SHARED AND THE VALUE WAS NOT: `?signed-out=1` was written here and compared to a
 * literal `'1'` on the page, so changing one to `=true` left `tsc` and every test green and the
 * owner's sentence gone (review, 2026-09-06). Both halves therefore export a VALUE and a READER,
 * and `signed-out.test.ts` walks each real round trip.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export const SIGNED_OUT = 'signed-out'
export const SIGNED_OUT_VALUE = '1'
export const SIGNED_OUT_PATH = `/sign-in?${SIGNED_OUT}=${SIGNED_OUT_VALUE}`

/** What the sign-in page asks of `searchParams[SIGNED_OUT]`. A repeated key arrives as an array. */
export const isSignedOut = (value: string | string[] | undefined) => value === SIGNED_OUT_VALUE

/**
 * THE SAME KEY, A SECOND VALUE — Story 2.4's sign-out-everywhere, which lands on the same card
 * and says a different sentence. A second KEY would be a second thing to keep disjoint from the
 * first; one key with two values is disjoint by construction, because a URL carries one value
 * per key and each reader compares its own. `signed-out.test.ts` walks both round trips and
 * asserts neither reads as the other.
 */
export const SIGNED_OUT_EVERYWHERE_VALUE = 'all'
export const SIGNED_OUT_EVERYWHERE_PATH = `/sign-in?${SIGNED_OUT}=${SIGNED_OUT_EVERYWHERE_VALUE}`

/** What the sign-in page asks of the same `searchParams[SIGNED_OUT]` for the everywhere sentence. */
export const isSignedOutEverywhere = (value: string | string[] | undefined) =>
  value === SIGNED_OUT_EVERYWHERE_VALUE

/**
 * THE OTHER HALF, and it lands on the DASHBOARD rather than the sign-in page, because a failed
 * sign-out leaves the user signed IN — sending them to `/sign-in` would only bounce them back
 * (the owner's ruling at question 8, option 1, 2026-09-06). The session is still live, so this
 * says only that the attempt failed and to try again; it never claims anything happened.
 */
export const SIGN_OUT_FAILED = 'sign-out-failed'
export const SIGN_OUT_FAILED_VALUE = '1'
export const SIGN_OUT_FAILED_PATH = `/?${SIGN_OUT_FAILED}=${SIGN_OUT_FAILED_VALUE}`

/** What the dashboard asks of `searchParams[SIGN_OUT_FAILED]`. */
export const isSignOutFailed = (value: string | string[] | undefined) =>
  value === SIGN_OUT_FAILED_VALUE

/**
 * WHICH OF THE TWO `signOut` TAKES, here rather than in the `'use server'` file, because that is
 * the half `node --test` could not reach: `signed-out.test.ts` pinned both constants and both
 * readers, so inverting the ternary in `actions.ts` swapped the owner's two sentences — a
 * successful sign-out redirected to `/?sign-out-failed=1`, where the guard bounced the now
 * sessionless user to `/sign-in` with no banner at all, and a failure sent a still-signed-in user
 * to `/sign-in`, which bounced them straight back to the dashboard silently: the exact "watched
 * `Signing out…`, told nothing" defect questions 6 and 8 exist to close — and every test stayed
 * green, because both constants were untouched (review, 2026-09-06). The move `shell-user.ts`,
 * `sentStateFor` and this module's own value+reader split each made, applied to the last half of
 * this contract that a mutation could still take away in silence.
 *
 * Note the two path shapes are NOT interchangeable and neither is a typo for the other: this is
 * a BROWSER destination, so it is written as the public path `/` that `proxy.ts` rewrites onto
 * `/app`, while `revalidatePath` in `projects/actions.ts` addresses the internal route tree and
 * is therefore `/app`.
 */
export const signOutPathFor = (failed: boolean) => (failed ? SIGN_OUT_FAILED_PATH : SIGNED_OUT_PATH)

/**
 * WHETHER A SIGN-OUT FAILED, DECIDED BY THE SESSION IT LEFT ON THIS DEVICE — never by whether
 * `/logout` answered an error (DW-41, Story 5.24b). Both actions call it: the avatar menu's Sign out
 * with `['local']`, Sign out everywhere with `['others', 'local']`.
 *
 * WHAT THE INSTALLED CLIENT DOES, which is why the error alone cannot decide it. `@supabase/auth-js`
 * 2.115.0's `_signOut` (`GoTrueClient.js:3415-3445`):
 * - `/logout` failing with anything but a 401, 403 or 404 REMOVES this device's session before it
 *   returns the error, for every scope but `others` (`:3431-3437`): `@supabase/ssr` deletes the
 *   cookie through `setAll`. So the error said "still signed in" while the device was signed out,
 *   and the dashboard's guard bounced the user to `/sign-in` with nothing said.
 * - `others` never touches this device's session (`:3434`, `:3441`).
 * - An EXPIRED access token whose refresh fails returns that error before any `/logout` at all
 *   (`:3421-3423`). A 500-504, a 520-530 or no answer at all is retryable (`lib/fetch.js:29-54`,
 *   `:125-131`), a retryable refresh failure keeps the session (`:4281-4300`), and `getSession()`
 *   then answers the refresh's error instead of a session (`:2561-2582`) while the cookie stays.
 *   That device is still signed in.
 * `sign-out-landing.test.ts` executes each path against a local server.
 *
 * So the calls are made in order and the first failure stops them. A failure before the last call
 * is a failure whatever is left, because the calls after it were never made. That is why `others`
 * goes first: its failure leaves this device signed in, so "try again" is true. After the last
 * call, `getSession()` decides: a session, or an error loading the one still stored, means still
 * signed in.
 */
export async function signOutFailed(
  client: Pick<SupabaseClient, 'auth'>,
  scopes: readonly ('others' | 'local')[],
): Promise<boolean> {
  for (const [index, scope] of scopes.entries()) {
    const { error } = await client.auth.signOut({ scope })
    if (!error) continue
    console.error('sign-out: failed', { scope, status: error.status, code: error.code })
    if (index < scopes.length - 1) return true
  }
  const { data, error } = await client.auth.getSession()
  return Boolean(data.session || error)
}
