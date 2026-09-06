/**
 * The one key `signOut` puts on the URL and the sign-in page reads — shared so a rename on
 * either side fails `tsc` rather than silently losing the "You've been signed out." sentence
 * (the owner's third test, finding 2). A plain module: the `'use server'` file may export only
 * async functions.
 */
export const SIGNED_OUT = 'signed-out'
export const SIGNED_OUT_PATH = `/sign-in?${SIGNED_OUT}=1`
