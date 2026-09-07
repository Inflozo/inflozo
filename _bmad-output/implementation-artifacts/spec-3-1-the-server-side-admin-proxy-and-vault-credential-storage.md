---
title: 'Story 3.1 — The server-side Admin proxy and Vault credential storage'
type: 'feature'
created: '2026-09-07'
status: 'ready-for-dev'
review_loop_iteration: 0
owner_test: none
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

Nothing new appears on screen in this story: it builds the locked box where a site's Ghost keys will
live, and the one door through which Inflozo talks to a Ghost site's admin side — a key goes into
Supabase's encrypted store, comes out only on the server for the seconds it takes to sign one request,
and every use is written to a log that never contains the key itself. The next story's connect screen
is what puts keys into the box; after this one, a key can never reach a browser or a log by
construction, and deleting a site or an account takes its keys out of the store too. The proof is a
script that puts a real key for the Ghost 6 and Ghost 5 test sites into the live store, calls each site
through the deployed door, is refused when it tries a write Inflozo is not allowed, and watches the key
vanish when the throwaway account is deleted.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Epic 3's connect wizard (3.2) is next and nothing today can hold a Ghost credential or
reach Ghost's Admin API: `private.site_credentials` and `private.credential_audit` exist and are empty,
`apps/web/server/ghost-admin/` — the spine's single chokepoint (AD-10) — does not exist, and the one
privileged client the app has, `supabaseAdmin()`, is a PostgREST client that **cannot** reach `vault.*`
(404, executed, MEASUREMENTS §21j) or the `private` schema (unexposed by design, AD-7 F6). DW-44 adds
that the first story to write Vault must also delete the secret when its row goes, or the purge and the
disconnect leave every customer's Ghost key behind.

**Approach:** Build the chokepoint module over **one lazy direct Postgres connection through Supabase's
transaction pooler** — the only thing in the app that can decrypt — with the pure rules beside it (the
Admin JWT mint, P8's write allowlist as a literal with a membership test), `store` / `remove` for the two
Vault-held kinds, and `call`, which decrypts, mints, fetches and writes an audit row per decryption and
per call. Land DW-44's `security definer` trigger by migration with the gate's `vault` stand-in and its
assertions, and prove the whole round trip on the **deployed** site with a bearer-gated verify route
driven by a Python harness against the real Vault and both Ghost test servers (R-82).

## Boundaries & Constraints

**Always:**
- **The chokepoint, enforced the way `supabaseAdmin()` is.** Everything lives under
  `apps/web/server/ghost-admin/`: `db.ts` is the **only** importer of `postgres` and the **only** file
  that reads `SUPABASE_DB_POOLER_URL`; SQL text naming `vault.`, `private.site_credentials` or
  `private.credential_audit` appears in **no** `apps/web` source outside that directory; and the module's
  importers are a named list in `server-wiring.test.ts` with a reason each — today the verify route
  alone; 3.2 adds the connect action. Each is read out of the file tree by a test, never restated.
- **Why a direct connection, and which.** `vault.secrets` / `vault.decrypted_secrets` are granted to
  `service_role` only and answer **404 over PostgREST** (§21j, executed); that is what bounds a leaked
  API secret key to references rather than credentials, and a decrypting RPC in `public` would undo it.
  So: `postgres` **3.4.9** (npm registry, read 2026-09-07), created **lazily and once** in `db.ts` —
  `next build` runs with no environment — as `postgres(url, { max: 1, prepare: false, ssl: 'require',
  connect_timeout: 5, idle_timeout: 20 })`. `prepare: false` because the shared pooler's transaction
  mode is PgBouncer-style and the driver's README says prepared statements must be off there
  (§Prepared statements, read 2026-09-07); the pooler is Supabase's documented shape for "serverless and
  edge functions" (`aws-[region].pooler.supabase.com:6543`, IPv4 — docs table, read 2026-09-07) and the one
  this machine has reached in 2.1 and 2.5 (`PostgreSQL 17.6`, executed). **HYPOTHESIS until the verify
  route runs (standing rule 1): the Vercel function reaches the pooler.** If Next's bundler cannot bundle
  the driver, `serverExternalPackages: ['postgres']` in `next.config.ts` is the documented fallback.
- **One env name, one meaning.** `SUPABASE_DB_POOLER_URL` — the transaction-pooler URL for the
  `postgres` user — in `tools/probe/.env.example` (with the derivation in its comment: same password as
  `SUPABASE_DB_URL`, host from the dashboard's Connect → Transaction pooler, port 6543), in
  `tools/probe/.env`, and in Vercel production, which **the owner adds in the dashboard at Deploy**
  exactly as `CRON_SECRET` was; the Dev run reads it back **by name**. `SUPABASE_DB_URL` keeps its
  meaning (the direct host, for psql) and is never reused. `db.ts` reads the variable itself and throws
  `SUPABASE_DB_POOLER_URL is not set` at first use, the loud failure `server.ts`'s `env()` promises.
- **Storage shape (AD-7).** `store({ siteId, userId, kind: 'admin' | 'staff', secret, route })` runs in
  **one transaction** (`sql.begin`): `select vault.create_secret($1, null, $2)` with description
  `site <siteId> <kind>` and **no name** (names are unique in Vault; a rotation must not collide) → the
  uuid; `insert into private.site_credentials … on conflict (site_id) do update set <kind>_vault_ref =
  excluded.<kind>_vault_ref, <kind>_rotated_at = now()`; `update public.sites set credentials_present =
  credentials_present || jsonb_build_object(<kind>, true)`. `remove({ siteId, kind, route })` nulls the
  ref, stamps `<kind>_rotated_at`, and flips the flag false. **The trigger deletes the old secret on both
  paths**, so no caller remembers Vault. The `kind` union has **no `content` member**: `sites.content_key`
  stays a plain column under the owner's SELECT, browser-safe by Ghost's design and delivered
  deliberately (FR-C3) — this story writes no code for it.
- **The mint (AD-10, as the probe executes it).** `admin-rule.ts`: a credential is `kid:secret`; header
  `{ alg: 'HS256', typ: 'JWT', kid }`, payload `{ iat, exp: iat + 300, aud: '/admin/' }`, HMAC-SHA256
  over the **hex-decoded** secret with `node:crypto`, base64url, sent as `Authorization: Ghost <jwt>`
  with `Accept-Version: v<major>.0` when `sites.ghost_version` is known and **no header when it is null**
  (the harness executes the no-header case on both majors — 3.2 validates before a version exists). A
  Staff Access Token is `id:secret` and mints identically (`kind: 'staff'`, E7's). Minted **per call**,
  never cached; `now` is a parameter so the test can pin `exp − iat`. A credential without `:` or with a
  non-hex secret is refused **before** Vault or the network: `credential_malformed`.
- **The allowlist is a literal with a membership test.** `ADMIN_WRITES` in `admin-rule.ts` has exactly
  four keys — `theme_upload`, `theme_activate`, `routes_upload`, `announcement_clear` — each with a
  method, a path pattern and, for `announcement_clear`, a body guard admitting only the three
  `announcement_*` settings keys. Any non-`GET` call must name an item **and** match its method, path and
  guard, or it is refused **with no network call** and an `admin_write` audit row with outcome `denied`.
  `GET` never needs an item. The method/path shapes are read from docs.ghost.org/admin-api (Dev records
  the read date beside the literal) and are **executed by E7 and 3.3**, not here; this story executes
  the **denial** control (`POST posts/` is refused three ways: no item, wrong item, guarded body).
- **The audit log is the only control that detects (AD-10 F10).** Every decryption writes
  `private.credential_audit` (`action: 'vault_decrypt'`), every call writes `admin_read` or `admin_write`
  with `allowlist_item`, `route` (the caller's name, e.g. `api/ghost-admin/verify`, later `connect`),
  `site_id`, `user_id`, `outcome` (`ok` | `denied` | `error`) and `detail` built from a typed
  `{ status?: number, ms: number, ghost_type?: string }` — **nothing else can reach that column**.
- **Never a credential in a log, a row, a response or an error.** The module's only `console.*` is
  `console.error('ghost-admin: <what>', { code | name | status })`, asserted by a test that reads every
  `console.` line in the directory; thrown envelopes are `{ code, message, detail?, action? }` (AD-24)
  carrying Ghost's `errors[0].type` at most; response bodies are **returned to the caller and stored
  nowhere** — 3.3 computes its `codeinjection_*` boolean from one and discards it (spine, Logging).
  Ghost's own causes map one row per code: `401 Unknown Admin API Key` → `ghost_unknown_key` (the key
  was regenerated or the integration deleted — "expired" is a failure that does not exist, §37);
  `401 Invalid token` → `ghost_bad_signature` (**our** bug, never the user's); timeout / DNS / TLS →
  `ghost_unreachable`; the pooler or the env → `credential_store_unavailable`, never a 200.
- **DW-44 lands here (AD-7, AD-26).** New migration `supabase/migrations/20260907200000_vault_secret_lifecycle.sql`:
  `private.drop_vault_secrets()` — `security definer`, `set search_path = ''`, EXECUTE revoked from
  `public`, `anon`, `authenticated` — deletes `vault.secrets` rows for a ref being **removed or
  replaced**, on `before update or delete` of `private.site_credentials`. Definer because the purge's
  cascade fires under GoTrue's role, not ours, and only the owner / `service_role` may delete a secret
  (§21j). The 2026-09-04 migration stays frozen; `SCHEMA.sql` gains the identical block in the same
  commit; `PRELUDE.sql` gains a **`vault` stand-in** modelling §21j (`vault.secrets`,
  `vault.decrypted_secrets` with `decrypted_secret`, `vault.create_secret(secret, name, description)`
  returning the uuid — the docs' positional shape, read 2026-09-07 — and `select, delete` to
  `service_role`); `RLS-TEST.sql` asserts the trigger and its definer bit, extends 5d to `private`
  functions, and proves the three paths — site deleted, user deleted, ref replaced — each ending in
  `count(*) = 0` for the old secret; `supabase/tests/prelude.sql` and `rls.sql` are re-copied
  byte-identical. **Applied to the hosted database by the owner in the SQL editor at Deploy**, as 2.5's
  was; between Dev and Deploy the code is live before the trigger is, and `## Verification` says so.
- **The proof is deployed, not local (R-82).** `apps/web/app/api/ghost-admin/verify/route.ts`, `POST`,
  `authorized()` from `purge-rule.ts` on `CRON_SECRET` **before any other statement** (401, fail-closed,
  `force-dynamic`, `no-store`), one zod body, five ops — `grants` (`current_user`,
  `has_table_privilege(current_user, 'vault.secrets', 'DELETE')`), `store`, `call`, `audit` (the site's
  rows, `detail` included — it holds no secret), `secret-exists` (a count on `vault.secrets`) — and it
  returns **refs and statuses only, never a secret**. `tools/probe/run-verify-ghost-admin.py` drives it in
  the 2.6 harness's shape: creates a throwaway GoTrue user and a `sites` row over REST with
  `SUPABASE_SECRET_KEY`, runs the 401 controls **first**, then per Ghost (T1 6.58.0 and T3 5.130.6,
  keys by name): `store` → `call GET config/` with no version (200, `version`) → `PATCH sites.ghost_version`
  → `call` again (200 with `Accept-Version`) → `call POST posts/` (refused, no network) → `store` a
  **bogus** key of the right shape → `call` (401 from Ghost, `ghost_unknown_key`) → `store` the real key
  again (rotation: the bogus ref gone, the new one present) → `audit` (decrypt ok ×n, read ok, read error
  401, write denied) → delete the user through GoTrue → `secret-exists` **false** (the cascade path) →
  `users before == after`. Every step PASS or FAIL, non-zero exit on any FAIL. It is verification
  scaffolding: **3.2 removes the route** once the connect action is the caller (DW-48).

**Ask First:**
- Any fifth key in `ADMIN_WRITES`, or a body guard loosened — the allowlist bounds Inflozo, not the
  credential, and every added write widens a radius Ghost cannot narrow (AD-10, R-22).
- A second Postgres connection, a second reader of `SUPABASE_DB_POOLER_URL`, or any `vault.` /
  `private.` SQL outside `server/ghost-admin/`.
- Any RPC or view in `public` that reads `vault.decrypted_secrets`.
- Keeping the verify route beyond 3.2, or widening it beyond the five ops.
- Any change to `vault.*` grants on the live project, or any read of `vault.decrypted_secrets` from a
  context that is not `call`.

**Never:**
- No Admin API call from a browser, and no generic browser-facing proxy endpoint — callers are server
  actions and routes, and the module is a library they import (AD-10: no third path).
- No Content API call from the server (P5): the module builds `/ghost/api/admin/` URLs only, asserted.
- No `supabaseAdmin()` for Vault or `private.*`; no `NEXT_PUBLIC_*`; no key, JWT, header or body in
  any log or thrown error; no `codeinjection_*` payload stored.
- No `content` kind — the Content API key is not a secret and never enters Vault.
- No edit to the frozen 2026-09-04 migration; no hand-edit to generated files.
- Not this story: 3.2's wizard and `GET /admin/config/` version floor, 3.3's probes, 3.4's settings read,
  3.5's disconnect, 3.6's Manage keys, 3.7's health cron, E7's staff-token request and the four writes
  themselves. No screen, no email, no notification.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Store an admin key | `store({ siteId, userId, kind: 'admin', secret: 'kid:hex' })` | one Vault secret, `admin_key_vault_ref` set, `admin_key_rotated_at = now()`, `sites.credentials_present.admin = true`; returns `{ ref }` | N/A |
| Store again (rotation) | same site, a second key | new ref; the **old secret row is gone** (trigger); `rotated_at` advanced | N/A |
| Malformed credential | no `:`, or a non-hex secret | refused before Vault and network | `credential_malformed` |
| Call with a stored key | `call({ siteId, method: 'GET', path: 'config/' })` | 200, `body.version`; audit `vault_decrypt ok` + `admin_read ok { status: 200, ms }` | N/A |
| Call, version unknown | `sites.ghost_version` null | no `Accept-Version` header; T1 and T3 both answer 200 (executed by the harness) | N/A |
| Call, no admin ref | row missing or ref null | no network; audit `vault_decrypt error { reason: 'missing' }` | `credential_missing` |
| Non-GET without an item | `POST posts/` | no network; audit `admin_write denied` | `write_not_allowed` |
| Non-GET, wrong item | `POST posts/` as `theme_upload` | same | `write_not_allowed` |
| Guarded body | `PUT settings/` as `announcement_clear` with a `title` key | same | `write_not_allowed` |
| Ghost refuses the key | a regenerated / bogus key | `{ ok: false, status: 401 }`; audit `admin_read error { status: 401, ghost_type }`; the stored key untouched | `ghost_unknown_key` |
| Ghost unreachable | DNS, TLS, or > 15 s | audit `admin_read error { ms }` | `ghost_unreachable` |
| Pooler unreachable / env unset | first use with no `SUPABASE_DB_POOLER_URL` or a refused connection | loud throw; never a 200 | `credential_store_unavailable` |
| Remove the staff token | `remove({ siteId, kind: 'staff' })` | ref null, secret gone, `credentials_present.staff = false`, `staff_token_rotated_at` set | N/A |
| Site deleted / user purged | `delete from public.sites` · GoTrue `DELETE /admin/users/{id}` | cascade → trigger → **both** secrets gone | N/A |
| Verify route, no header / wrong bearer | `POST /api/ghost-admin/verify` | 401 `Unauthorized`, `no-store`, before any DB read | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/server/ghost-admin/admin-rule.ts` -- **new, pure**: `parseCredential`, `mintJwt(credential, now)`,
  `ADMIN_WRITES` (the four-item literal, read date beside it), `permitted(method, path, body, item)`,
  `adminUrl(siteUrl, path)`, `headers(jwt, major?)`, the `AuditDetail` type and the Ghost-cause → code map.
  Node `crypto` only. The shape `purge-rule.ts` set: everything `node --test` can reach lives here.
- `apps/web/server/ghost-admin/db.ts` -- **new**: `sql()` — the lazy, once-built `postgres` client with the
  options above; the only importer of `postgres`, the only reader of `SUPABASE_DB_POOLER_URL`.
- `apps/web/server/ghost-admin/index.ts` -- **new**: `store`, `remove`, `call` (decrypt → audit → allowlist →
  mint → fetch with `AbortSignal.timeout(15_000)` → audit), and `fetchWithKey` (the explicit-key variant
  `call` delegates to, which 3.2 uses to validate before a site row exists — `site_id` null on its audit
  row). All SQL here and in `db.ts`; parameterised, never interpolated.
- `apps/web/ghost-admin-rule.test.ts` -- **new**: the mint verified with `createHmac` (`kid` in the header,
  `aud`, `exp − iat === 300`), `ADMIN_WRITES` exact membership, the three denials, `GET` needs no item,
  `adminUrl` never yields `/content/`, the cause map, `parseCredential` refusals.
- `apps/web/server-wiring.test.ts:80` -- the `allowed` idiom to copy for four new contracts: `postgres` import
  → `db.ts` only; `SUPABASE_DB_POOLER_URL` → `db.ts` only; `vault.` / `private.` SQL → `server/ghost-admin/`
  only; importers of `server/ghost-admin/index.ts` → the verify route only, with its reason; every
  `console.` line under `server/ghost-admin/` matches the allowed shape.
- `apps/web/app/api/ghost-admin/verify/route.ts` -- **new**: bearer first (`authorized` from
  `app/api/cron/purge-accounts/purge-rule.ts:35`), `export const dynamic = 'force-dynamic'`, `NO_STORE`,
  one zod discriminated union over the five ops; header names **E3 · FR-C3 · AD-7 · AD-10 · DW-48**.
- `apps/web/app/api/cron/purge-accounts/route.ts` -- the route shape to mirror (bearer, no-store, 500 on any
  failure, the `failure()` helper that never logs an address or a key).
- `apps/web/lib/flags.ts:52` -- `AbortSignal.timeout` on a platform read, and the one-code log line.
- `apps/web/lib/supabase/server.ts:5-33` -- `env()`'s loud-throw shape; `supabaseAdmin()` is **not** used here.
- `apps/web/package.json` -- `"postgres": "3.4.9"`; lockfile by `pnpm install` (Node 24 on `PATH`).
- `apps/web/next.config.ts` -- untouched unless the bundler refuses the driver (`serverExternalPackages`).
- `supabase/migrations/20260907200000_vault_secret_lifecycle.sql` -- **new**: the function, the revokes, the
  trigger `site_credentials_drop_vault_secrets`. Comments **outside** the body (pg_dump emits bodies
  verbatim and the gate diffs them — 2.5's lesson).
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql:181-190` -- the table;
  append the identical trigger block after `:988` (`site_credentials_touch`).
- `…/PRELUDE.sql` -- the `vault` stand-in, beside the `storage` one; `…/RLS-TEST.sql:104` the existing
  `site_credentials` fixture (its `gen_random_uuid()` ref matches nothing — fine under the trigger);
  `:483` (5c's table list), `:608-616` (the guard-trigger literal gains `site_credentials_drop_vault_secrets`),
  5d (`nspname in ('public','private')`). Then `cp` both into `supabase/tests/`.
- `supabase/tests/run-rls-gate.sh` -- unchanged; it applies every migration and diffs the two schemas.
- `tools/probe/run-verify-ghost-admin.py` -- **new**, in `run-verify-account-purge.py`'s shape (docstring
  naming every step, `--check`, `--url`, keys by name, users before/after, own rows cleaned) + its row in
  `tools/doc-audit.py:247-266`.
- `tools/probe/.env.example:76` -- `SUPABASE_DB_POOLER_URL=` with the derivation comment.
- `_bmad-output/implementation-artifacts/deferred-work.md` -- DW-44 closed by the Dev run; **DW-48** (the verify
  route is scaffolding; 3.2 removes it and retargets the harness at the connect action) and **DW-49** (the
  pooler URL is the `postgres` user's; a narrower role with `vault` + `private` grants at the next
  password rotation) added at Create.
- `_bmad-output/implementation-artifacts/epic-3-context.md` -- the "Vault, and the connection 3.1 must choose"
  bullet rewritten with the decision, at Create.
- Executed facts this rests on: `MEASUREMENTS.md` §21j (Vault grants, 404 over REST), §37 (401 causes,
  keys never expire), the JWT as `tools/probe/run-verify-all.py:37-44` mints it; the pooler from this
  machine `spec-2-1:603`, `spec-2-5:583`.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/server/ghost-admin/admin-rule.ts` + `apps/web/ghost-admin-rule.test.ts` -- the mint, the
      allowlist literal, the denials, the URL builder, the cause map -- the contract green before anything
      connects to anything
- [ ] `apps/web/package.json` + lockfile -- `postgres@3.4.9` -- the only new dependency
- [ ] `apps/web/server/ghost-admin/db.ts` + `index.ts` -- the lazy connection and `store` / `remove` / `call` /
      `fetchWithKey` with their audit rows -- the chokepoint
- [ ] `apps/web/server-wiring.test.ts` -- the five new read-from-the-tree contracts -- the chokepoint enforced,
      not described
- [ ] `supabase/migrations/20260907200000_vault_secret_lifecycle.sql` + `SCHEMA.sql` + `PRELUDE.sql` +
      `RLS-TEST.sql` + the two `supabase/tests/` copies -- DW-44's trigger, the `vault` stand-in and the three
      path proofs -- `bash supabase/tests/run-rls-gate.sh` green, and red with the trigger commented out (the
      control)
- [ ] `apps/web/app/api/ghost-admin/verify/route.ts` -- the five ops behind the bearer -- the deployed proof
- [ ] `tools/probe/run-verify-ghost-admin.py` + its `doc-audit.py` row + `tools/probe/.env.example` --
      the harness and the env name -- R-82, re-runnable
- [ ] `tools/probe/.env` (`SUPABASE_DB_POOLER_URL`, derived) + Vercel production (the owner, at Deploy) -- read
      back by name, never printed
- [ ] `deferred-work.md` (DW-44 closed at Dev) + `epic-3-context.md` -- propagate, never localise
- [ ] Run `## Verification` on the real infrastructure and record every command and result by variable name

**Acceptance Criteria:**
- Given a stored Ghost credential, when any Admin API call is made through `call`, then a JWT is minted for
  that request alone (`exp − iat = 300`, `aud: /admin/`, `kid` from the stored key), the request goes to
  `<site url>/ghost/api/admin/<path>` and nowhere else, and a `vault_decrypt` row and an `admin_read` /
  `admin_write` row exist in `private.credential_audit` for it, neither carrying the key
- Given the Admin API key and the Staff Access Token, when they are stored, then each is a `vault.secrets`
  row referenced from `private.site_credentials`, and no `apps/web` code path outside
  `server/ghost-admin/` can name either table (asserted), so neither can reach a client
- Given `sites.content_key`, when this story is done, then it is unchanged — a plain column under the owner's
  SELECT, never in Vault (the `kind` union has no `content` member, asserted)
- Given the two Ghost APIs, when the module builds a URL, then it is always `/ghost/api/admin/` (asserted),
  and `ADMIN_WRITES` has exactly `theme_upload`, `theme_activate`, `routes_upload`, `announcement_clear`
  (asserted by deep-equal) — a `POST posts/` is refused with no network call whether it names no item, the
  wrong item, or a guarded body
- Given the deployed verify route with `SUPABASE_DB_POOLER_URL` in production, when the harness runs
  against T1 and T3, then every step passes in the docstring's order: the two 401 controls first; `grants`
  reads `DELETE` on `vault.secrets` true; `store` returns a ref; `call GET config/` is 200 with `version`,
  with no `Accept-Version` and then with `v6.0` / `v5.0`; `POST posts/` is `write_not_allowed` with an
  `admin_write denied` row; the bogus key answers 401 `ghost_unknown_key`; re-storing the real key leaves
  the bogus ref **absent** and the new one present; deleting the throwaway user through GoTrue leaves
  `secret-exists` **false**; users before == after; and no response body anywhere contains a `kid:secret`
- Given the RLS gate, when it runs, then `site_credentials_drop_vault_secrets` exists on a `security
  definer` function no client may execute, and a secret referenced by a credentials row is gone after the
  site is deleted, after the user is deleted, and after the ref is replaced — and the gate is **red** with
  the trigger removed
- Given the module's source, when the never-log test reads every `console.` line under
  `server/ghost-admin/`, then each matches `console.error('ghost-admin: …', { code | name | status })` and
  nothing else

## Spec Change Log

## Design Notes

**Why not `supabaseAdmin()`.** It is the right client for `public.*` and Storage and the wrong one here:
PostgREST cannot see `vault` or `private`, by design and by execution (§21f, §21j). The
alternative — a `security definer` RPC in `public` granted to `service_role` — would let a leaked API
secret key decrypt every customer's Ghost key over REST, which is exactly the leak §21j proved
*bounded*. A direct connection keeps decryption behind a second secret that nothing but this module
holds. The cost is one dependency and one env var; the module's importer list stays as short as
`supabaseAdmin()`'s.

**The mint, as executed** (`run-verify-all.py:37-44`, in TypeScript):

```ts
export function mintJwt(credential: string, now = Date.now()): string {
  const { kid, secret } = parseCredential(credential)            // throws credential_malformed
  const b64 = (s: string) => Buffer.from(s).toString('base64url')
  const iat = Math.floor(now / 1000)
  const head = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT', kid }))
  const body = b64(JSON.stringify({ iat, exp: iat + 300, aud: '/admin/' }))
  const sig = createHmac('sha256', Buffer.from(secret, 'hex')).update(`${head}.${body}`).digest('base64url')
  return `${head}.${body}.${sig}`
}
```

**The allowlist, as code.** One literal, one test on `Object.keys`, one `permitted()`:

```ts
export const ADMIN_WRITES = {                       // read at docs.ghost.org/admin-api, <date>
  theme_upload:       { method: 'POST', path: /^themes\/upload\/?$/ },
  theme_activate:     { method: 'PUT',  path: /^themes\/[^/]+\/activate\/?$/ },
  routes_upload:      { method: 'POST', path: /^settings\/routes\/yaml\/?$/ },
  announcement_clear: { method: 'PUT',  path: /^settings\/?$/, keys: ['announcement_content', 'announcement_visibility', 'announcement_background'] },
} as const
```

**The trigger (DW-44), the one home for every path:**

```sql
create or replace function private.drop_vault_secrets() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    delete from vault.secrets where id in (old.admin_key_vault_ref, old.staff_token_vault_ref);
    return old;
  end if;
  if old.admin_key_vault_ref is distinct from new.admin_key_vault_ref then
    delete from vault.secrets where id = old.admin_key_vault_ref;
  end if;
  if old.staff_token_vault_ref is distinct from new.staff_token_vault_ref then
    delete from vault.secrets where id = old.staff_token_vault_ref;
  end if;
  return new;
end $$;
```

**Decrypt in one round trip**, the audit row in the same statement so a decryption can never go unrecorded:

```sql
with cred as (
  select s.url, s.ghost_version, s.user_id, c.admin_key_vault_ref as ref, v.decrypted_secret
  from public.sites s
  join private.site_credentials c on c.site_id = s.id
  left join vault.decrypted_secrets v on v.id = c.admin_key_vault_ref
  where s.id = $1
), logged as (
  insert into private.credential_audit (action, user_id, site_id, route, outcome, detail)
  select 'vault_decrypt', user_id, $1, $2,
         case when decrypted_secret is null then 'error' else 'ok' end,
         case when decrypted_secret is null then '{"reason":"missing"}'::jsonb else '{}'::jsonb end
  from cred
)
select url, ghost_version, user_id, decrypted_secret from cred
```

**ponytail:** the connection is the `postgres` user's, the platform's own serverless shape; a role holding only
`vault` and `private` grants when the password is next rotated (DW-49). No connection cache across
invocations beyond the module singleton; a pooled client the day cold starts are measured to cost something.

## Verification

Run on the real infrastructure (R-82). Every key is read into a command's environment by name and never
printed; each is recorded by its variable name only.

**Deployment: `<filled at Deploy>`** — the production deployment serving `inflozo.com` and
`app.inflozo.com`, read via `GET /v13/deployments/{uid}` with `VERCEL_TOKEN`, `VERCEL_TEAM_ID`.

**Commands:**

| Command | Expected |
|---|---|
| `export PATH=…/node/v24.x/bin:$PATH && pnpm check` (repository root) | exit 0; `ghost-admin-rule.test.ts` and the five new `server-wiring.test.ts` contracts among the passes |
| `pnpm build` (`apps/web`) | exit 0; `ƒ /api/ghost-admin/verify` in the route table |
| `bash supabase/tests/run-rls-gate.sh` | exit 0: schema diff empty, `PASS: the vault-secret lifecycle trigger …` for site-deleted, user-deleted and ref-replaced |
| the same with the `create trigger` line commented out in a scratch copy of the migration | **non-zero** — the control that proves the three assertions test the trigger, not the stand-in |
| `python3 tools/doc-audit.py --check` (twice) | PASS after the first regeneration |
| `GET https://api.vercel.com/v9/projects/{VERCEL_PROJECT}/env` with `VERCEL_TOKEN`, `VERCEL_TEAM_ID` | names only; `SUPABASE_DB_POOLER_URL` absent at Dev, present with target `production` after the owner adds it at Deploy |
| `python3 tools/probe/run-verify-ghost-admin.py --check` | exit 0: keys present by name (`CRON_SECRET`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `GHOST6_*`, `GHOST5_*`); the two 401 controls on the deployed route; `grants` op answers `current_user` and `DELETE` on `vault.secrets` **true** — the first execution of the Vercel → pooler hypothesis |
| `python3 tools/probe/run-verify-ghost-admin.py` (full) | exit 0, every step PASS in the docstring's order, for T1 (6.58.0) and T3 (5.130.6): `store` · `config-no-version` 200 · `config-versioned` 200 · `write-denied` · `bogus-key` 401 `ghost_unknown_key` · `rotated` (old ref absent, new present) · `audit` rows as expected · `user-gone` 404 · `secret-gone` false · `users before == after` |
| `GET /rest/v1/decrypted_secrets` and `GET /rest/v1/secrets` with `SUPABASE_SECRET_KEY` | **404** both — §21j still holds after this story (the control that the direct connection added no REST path) |

**Between Dev and Deploy** (as 2.5 recorded): CI deploys the code on the Dev push, so the verify route is
live while the trigger is not; `rotated` and `secret-gone` are expected to **FAIL** on the live project until
the owner applies `20260907200000_vault_secret_lifecycle.sql` in the Supabase SQL editor at Deploy — the
Dev run records that as the expected pre-migration state, never as a pass. `--check` and every other step
need only the code and the env var.

**Manual checks (if no CLI):**
- Supabase dashboard → Integrations → Vault: after the full harness run, **no** secret whose description
  names a throwaway site remains.
- Vercel dashboard → the project → Settings → Environment Variables: `SUPABASE_DB_POOLER_URL`, production.
