/**
 * The one key `signOut` puts on the URL and the sign-in page reads — shared so a rename on
 * either side fails `tsc` rather than silently losing the "You've been signed out." sentence
 * (the owner's third test, finding 2). A plain module: the `'use server'` file may export only
 * async functions.
 *
 * THE KEY WAS SHARED AND THE VALUE WAS NOT: `?signed-out=1` was written here and compared to a
 * literal `'1'` on the page, so changing one to `=true` left `tsc` and every test green and the
 * owner's sentence gone (review, 2026-09-06). `isSignedOut` is the reader, so the two sides
 * cannot disagree about the value either, and `signed-out.test.ts` walks the real round trip.
 */
export const SIGNED_OUT = 'signed-out'
export const SIGNED_OUT_VALUE = '1'
export const SIGNED_OUT_PATH = `/sign-in?${SIGNED_OUT}=${SIGNED_OUT_VALUE}`

/** What the page asks of `searchParams[SIGNED_OUT]`. A repeated key arrives as an array. */
export const isSignedOut = (value: string | string[] | undefined) => value === SIGNED_OUT_VALUE
