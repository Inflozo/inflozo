import postgres from 'postgres'
import { AdminError } from './admin-rule.ts'

/**
 * THE ONE DIRECT DATABASE CONNECTION IN THE APP, and the only thing that can decrypt a Ghost
 * credential. `supabaseAdmin()` is the right client for `public.*` and Storage and the wrong one
 * here: PostgREST cannot see `vault` or `private` — `GET /rest/v1/decrypted_secrets` answers 404
 * and `vault.*` is granted to `service_role` only (MEASUREMENTS §21j, executed). That 404 is what
 * BOUNDS a leaked API secret key to opaque references rather than to every customer's Ghost key,
 * and a `security definer` RPC in `public` that decrypted for the service role would hand exactly
 * that bound back. So decryption sits behind a second secret that only this file reads.
 *
 * `server-wiring.test.ts` asserts both halves out of the file tree: this is the only importer of
 * `postgres` and the only reader of `SUPABASE_DB_POOLER_URL`, in `apps/web` entire.
 *
 * THE TRANSACTION POOLER, NOT THE DIRECT HOST. `aws-[region].pooler.supabase.com:6543` is
 * Supabase's documented shape for "serverless and edge functions" (docs table, read 2026-09-07),
 * it is IPv4 (the direct host is IPv6-only and unreachable from the build machine — spec-2-1:603),
 * and it is the one this project has actually reached (`PostgreSQL 17.6`, executed in 2.1 and 2.5).
 * `prepare: false` because transaction mode is PgBouncer-style and postgres.js's README says
 * prepared statements must be off there (§Prepared statements, read 2026-09-07).
 *
 * LAZY AND ONCE. `next build` runs with no environment at all, so a client built at module load
 * would fail the build rather than the request; and one client per invocation would open a pooler
 * connection per call. `max: 1`: the project runs Fluid Compute (`resourceConfig.fluid: true`,
 * read from the Vercel API 2026-09-07), so one instance CAN serve concurrent invocations, and
 * they queue on this single connection — safe and serialised; nothing inside a `begin` block may
 * call `sql()` or it waits on itself. ponytail: raise `max` when a queue is measured.
 *
 * `ssl: 'require'` ENCRYPTS BUT DOES NOT VERIFY THE CHAIN — postgres.js sets
 * `rejectUnauthorized: false` for it — and `'verify-full'` was executed from this driver on
 * 2026-09-07 and failed `SELF_SIGNED_CERT_IN_CHAIN`: the pooler's certificate chains to
 * Supabase's own CA, not to Node's bundle. Verifying it means bundling that CA (DW-50), owed with
 * DW-49 at the next credential rotation.
 *
 * ponytail: the URL is the `postgres` user's — the platform's own serverless shape — and a role
 * holding only `vault` and `private` grants is owed at the next password rotation (DW-49).
 */

let client: postgres.Sql | undefined

export function sql(): postgres.Sql {
  if (!client) {
    const url = process.env.SUPABASE_DB_POOLER_URL
    // The loud failure `lib/supabase/server.ts`'s `env()` promises: a missing variable must never
    // resolve to something that looks like "this site has no credentials".
    if (!url) {
      throw new AdminError({
        code: 'credential_store_unavailable',
        message: 'SUPABASE_DB_POOLER_URL is not set',
      })
    }
    client = postgres(url, {
      max: 1,
      prepare: false,
      ssl: 'require',
      connect_timeout: 5,
      idle_timeout: 20,
    })
  }
  return client
}
