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
