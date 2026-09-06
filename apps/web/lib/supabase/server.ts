import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sessionCookie } from './cookies.ts'

/**
 * THE ONLY PLACE A SUPABASE CLIENT IS MADE in the app.
 *
 * Three keys reach the server and none is public: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`
 * and — since Story 2.1 — `SUPABASE_SECRET_KEY`. There is no `NEXT_PUBLIC_*` and no
 * browser-side client — the spine's "secrets never in `NEXT_PUBLIC_*`" holds here by there
 * being nothing to expose.
 *
 * `SUPABASE_SECRET_KEY` HAS EXACTLY ONE READER, and it is named: `supabaseAdmin()` below,
 * called only by `lib/flags.ts` to read the `feature_flags` row that no user-scoped key can
 * see (DW-12). That client is cookie-less, is never handed user input and never makes a
 * user-scoped call; everything else in the app keeps the publishable key.
 *
 * The guard is always `getUser()`, never `getSession()`: `getSession()` reads the cookie and
 * believes it, `getUser()` asks GoTrue whether the token is real.
 */

function env(name: 'SUPABASE_URL' | 'SUPABASE_PUBLISHABLE_KEY' | 'SUPABASE_SECRET_KEY'): string {
  const value = process.env[name]
  // A missing key must fail loudly at the first call, not resolve to a client that 401s
  // every request and looks like a signed-out user.
  if (!value) throw new Error(`${name} is not set`)
  return value
}

export async function supabaseServer() {
  const store = await cookies()
  return createServerClient(env('SUPABASE_URL'), env('SUPABASE_PUBLISHABLE_KEY'), {
    // THE PASSKEY API IS OPT-IN AND THROWS WITHOUT THIS. `auth-js` 2.115.0 asserts the flag at
    // the top of every `auth.passkey.*` method (`lib/helpers.js:450` —
    // `assertPasskeyExperimentalEnabled`), so the four ceremonies would throw at call time
    // rather than return an error envelope. `@supabase/ssr` spreads `options.auth` into the
    // client it builds (`dist/main/createServerClient.js:32-36`), which is what carries it
    // through; the library's own `flowType`/`storage`/`persistSession` are applied after and
    // are untouched by this.
    auth: { experimental: { passkey: true } },
    cookies: {
      getAll: () => store.getAll(),
      setAll(written) {
        // In a server component `cookies()` is read-only and this throws; the refresh in
        // `proxy.ts` has already written the same cookies on that request, so swallowing it
        // is correct rather than convenient. A server action or a route handler CAN write,
        // and that is where sign-in and sign-out actually set them — including the passkey
        // assertion's, which `verifyAuthentication` saves through this same storage.
        try {
          for (const { name, value, options } of written) store.set(name, value, sessionCookie(options))
        } catch {
          /* read-only cookie store — see above */
        }
      },
    },
  })
}

/**
 * THE ONE PRIVILEGED CLIENT, for the one read no session can make.
 *
 * `feature_flags` is granted to `service_role` alone (schema :1175) with RLS on and no policy,
 * and the spine requires the flag to be a ROW read per request rather than an env var that
 * needs a redeploy. So one cookie-less client holds the secret key, and DW-12's two candidates
 * were settled in favour of it over a `security definer` function: the key is already in
 * production, the function would be a migration plus a SCHEMA.sql change plus an RLS-TEST
 * assertion plus the gate, and the next privileged server reads (2.6's purge, E3's Vault) want
 * this client anyway.
 *
 * Built LAZILY and ONCE: `next build` runs with no environment in CI, so reading the key at
 * module load would fail the build; module scope caches it for the life of the server process,
 * which is right because it holds no per-request state at all.
 *
 * `persistSession` and `autoRefreshToken` are off because there is no session to persist and
 * nothing to refresh — with them on the client would reach for `localStorage`, which does not
 * exist here, and start a timer per instance.
 */
let admin: SupabaseClient | null = null
export function supabaseAdmin(): SupabaseClient {
  admin ??= createClient(env('SUPABASE_URL'), env('SUPABASE_SECRET_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return admin
}

/**
 * The signed-in user, server-verified, or null.
 *
 * `cache()` because one dashboard render asks three times — the layout's guard, the page, and
 * the type narrowing after it — and each was a separate verifying call to GoTrue. React's
 * request cache collapses them to one and changes nothing else: a server action is a different
 * request and verifies again (review, 2026-09-05).
 */
export const currentUser = cache(async function currentUser() {
  const { data } = await (await supabaseServer()).auth.getUser()
  return data.user
})
