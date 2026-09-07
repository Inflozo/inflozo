/**
 * THE SIGN-OUT URL CONTRACT, both halves, in one module: the keys `signOut` puts on the URL and
 * the pages that read them. Shared so a rename on either side fails `tsc` rather than silently
 * losing a sentence the owner asked for (his third test, finding 2; his ruling at question 8).
 * A plain module: the `'use server'` file may export only async functions.
 *
 * THE KEY WAS SHARED AND THE VALUE WAS NOT: `?signed-out=1` was written here and compared to a
 * literal `'1'` on the page, so changing one to `=true` left `tsc` and every test green and the
 * owner's sentence gone (review, 2026-09-06). Both halves therefore export a VALUE and a READER,
 * and `signed-out.test.ts` walks each real round trip.
 */
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
