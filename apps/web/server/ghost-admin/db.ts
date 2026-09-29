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
 * THE FAR END IS VERIFIED, AGAINST SUPABASE'S OWN ROOT (DW-50, Story 5.24b). `ssl: 'require'`
 * encrypted and verified nothing — postgres.js sets `rejectUnauthorized: false` for it — and
 * `'verify-full'` fails `SELF_SIGNED_CERT_IN_CHAIN` (executed 2026-09-07), because the pooler's
 * chain ends in Supabase's own CA, which is not in Node's bundle: leaf `*.pooler.supabase.com` ←
 * Supabase Intermediate 2021 CA ← Supabase Root 2021 CA. So the root is pinned below and
 * `rejectUnauthorized` is on; postgres.js 3.4.9 hands `tls.connect` the host as `servername`
 * (`src/connection.js:274-285`), so the chain AND the host name are both checked. Executed from
 * this driver against `aws-0-eu-central-1.pooler.supabase.com:6543` at the story's Create: the
 * pinned root connects; a self-made CA, Node's own bundle and a wrong servername are each refused
 * (MEASUREMENTS §57). `run-verify-ghost-admin.py --check` re-executes the pair on every run,
 * reading the PEM out of THIS file.
 *
 * ponytail: the URL is the `postgres` user's — the platform's own serverless shape — and a role
 * holding only `vault` and `private` grants is owed at the next password rotation (DW-49).
 */

/**
 * SUPABASE ROOT 2021 CA — the certificate the owner downloaded from the dashboard's database settings, committed as
 * `supabase/prod-ca-2021.crt` for its provenance and INLINED here, because a file read at run time would not ship with
 * the function (DW-269: `outputFileTracingIncludes` is inert under Turbopack). A PUBLIC certificate — `CA:TRUE`, no key —
 * valid 2021-04-28 to 2031-04-26; `VERIFY-AT-BUILD.md` carries the expiry, and a Supabase CA rotation before then would
 * fail every decryption loudly (`credential_store_unavailable`) rather than silently trust a stranger.
 */
const SUPABASE_ROOT_CA = `-----BEGIN CERTIFICATE-----
MIIDxDCCAqygAwIBAgIUbLxMod62P2ktCiAkxnKJwtE9VPYwDQYJKoZIhvcNAQEL
BQAwazELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5l
dyBDYXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJh
c2UgUm9vdCAyMDIxIENBMB4XDTIxMDQyODEwNTY1M1oXDTMxMDQyNjEwNTY1M1ow
azELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5ldyBD
YXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJhc2Ug
Um9vdCAyMDIxIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqQXW
QyHOB+qR2GJobCq/CBmQ40G0oDmCC3mzVnn8sv4XNeWtE5XcEL0uVih7Jo4Dkx1Q
DmGHBH1zDfgs2qXiLb6xpw/CKQPypZW1JssOTMIfQppNQ87K75Ya0p25Y3ePS2t2
GtvHxNjUV6kjOZjEn2yWEcBdpOVCUYBVFBNMB4YBHkNRDa/+S4uywAoaTWnCJLUi
cvTlHmMw6xSQQn1UfRQHk50DMCEJ7Cy1RxrZJrkXXRP3LqQL2ijJ6F4yMfh+Gyb4
O4XajoVj/+R4GwywKYrrS8PrSNtwxr5StlQO8zIQUSMiq26wM8mgELFlS/32Uclt
NaQ1xBRizkzpZct9DwIDAQABo2AwXjALBgNVHQ8EBAMCAQYwHQYDVR0OBBYEFKjX
uXY32CztkhImng4yJNUtaUYsMB8GA1UdIwQYMBaAFKjXuXY32CztkhImng4yJNUt
aUYsMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAB8spzNn+4VU
tVxbdMaX+39Z50sc7uATmus16jmmHjhIHz+l/9GlJ5KqAMOx26mPZgfzG7oneL2b
VW+WgYUkTT3XEPFWnTp2RJwQao8/tYPXWEJDc0WVQHrpmnWOFKU/d3MqBgBm5y+6
jB81TU/RG2rVerPDWP+1MMcNNy0491CTL5XQZ7JfDJJ9CCmXSdtTl4uUQnSuv/Qx
Cea13BX2ZgJc7Au30vihLhub52De4P/4gonKsNHYdbWjg7OWKwNv/zitGDVDB9Y2
CMTyZKG3XEu5Ghl1LEnI3QmEKsqaCLv12BnVjbkSeZsMnevJPs1Ye6TjjJwdik5P
o/bKiIz+Fq8=
-----END CERTIFICATE-----`

let client: postgres.Sql | undefined

/**
 * WHAT A WRITER MAY BE HANDED TO WRITE ON: the pooled client, or a transaction inside it. Both are
 * `ISql` — callable as a tagged template, with `json()` on them — and neither is assignable to the
 * other, so a helper that must work inside `begin()` and outside it takes this. Exported from here
 * because `postgres` has exactly one importer and this file is it (`server-wiring.test.ts`).
 */
export type Client = postgres.ISql

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
      ssl: { ca: SUPABASE_ROOT_CA, rejectUnauthorized: true },
      connect_timeout: 5,
      idle_timeout: 20,
    })
  }
  return client
}
