// The cookie options, kept free of `next/headers` so `node --test` can prove them: the
// `maxAge: 0` branch below is what makes Sign out actually sign out, and that is not a branch
// to leave uncovered.
import type { CookieOptions } from '@supabase/ssr'

/** 30 days, in seconds — FR-A6. */
export const SESSION_MAX_AGE = 2_592_000

/**
 * FR-A6'S 30 DAYS ARE APPLIED HERE, NOT VIA `cookieOptions`.
 *
 * `createServerClient({ cookieOptions: { maxAge } })` looks like the way to set the session
 * lifetime and is INERT — executed against 0.12.6: the library builds each write as
 * `{ ...DEFAULT_COOKIE_OPTIONS, ...options.cookieOptions, maxAge: DEFAULT_COOKIE_OPTIONS.maxAge }`
 * (`dist/main/cookies.js:231`), so its own 400-day default is re-applied last and wins. The cookie
 * came back `Max-Age=34560000` with no error anywhere. The only place we actually control the
 * write is our own `setAll`, so every one of them goes through this.
 *
 * `httpOnly` is the library's `false` for a reason that is not ours: a browser client has to be
 * able to read the session. This app has none, so the cookie is closed to script.
 *
 * `maxAge: 0` is a DELETION — sign-out — and is passed straight through. Stretching that one to
 * 30 days would leave the user signed in after pressing Sign out.
 */
export function sessionCookie(options: CookieOptions): CookieOptions {
  return {
    ...options,
    ...(options.maxAge ? { maxAge: SESSION_MAX_AGE } : {}),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }
}
