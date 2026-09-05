import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sessionCookie } from './cookies.ts'

export { SESSION_MAX_AGE, sessionCookie } from './cookies.ts'

/**
 * THE ONLY PLACE A SUPABASE CLIENT IS MADE in the app.
 *
 * Two keys reach the server and neither is public: `SUPABASE_URL` and
 * `SUPABASE_PUBLISHABLE_KEY`. There is no `NEXT_PUBLIC_*` and no browser-side client — the
 * spine's "secrets never in `NEXT_PUBLIC_*`" holds here by there being nothing to expose.
 * `SUPABASE_SECRET_KEY` is set in production for later server-side work; nothing in the app
 * reads it in this story.
 *
 * The guard is always `getUser()`, never `getSession()`: `getSession()` reads the cookie and
 * believes it, `getUser()` asks GoTrue whether the token is real.
 */

function env(name: 'SUPABASE_URL' | 'SUPABASE_PUBLISHABLE_KEY'): string {
  const value = process.env[name]
  // A missing key must fail loudly at the first call, not resolve to a client that 401s
  // every request and looks like a signed-out user.
  if (!value) throw new Error(`${name} is not set`)
  return value
}

export async function supabaseServer() {
  const store = await cookies()
  return createServerClient(env('SUPABASE_URL'), env('SUPABASE_PUBLISHABLE_KEY'), {
    cookies: {
      getAll: () => store.getAll(),
      setAll(written) {
        // In a server component `cookies()` is read-only and this throws; the refresh in
        // `proxy.ts` has already written the same cookies on that request, so swallowing it
        // is correct rather than convenient. A server action or a route handler CAN write,
        // and that is where sign-in and sign-out actually set them.
        try {
          for (const { name, value, options } of written) store.set(name, value, sessionCookie(options))
        } catch {
          /* read-only cookie store — see above */
        }
      },
    },
  })
}

/** The signed-in user, server-verified, or null. */
export async function currentUser() {
  const { data } = await (await supabaseServer()).auth.getUser()
  return data.user
}
