---
title: 'Story 3.1 — The server-side Admin proxy and Vault credential storage'
type: 'feature'
created: '2026-09-07'
status: 'done'
baseline_commit: '929494bd17cbd0c5444fac2164898f924b3bbee3'
review_loop_iteration: 1
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
- `apps/web/server/ghost-admin/verify-queries.ts` -- **new** (Dev): the verify route's three READS — `grants`,
  `auditRows`, `secretExists` — moved out of the route because the wiring contract forbids SQL naming `vault.` or a
  `private` table outside this directory. DW-48 scaffolding; 3.2 deletes it with the route.
- `apps/web/ghost-admin.test.ts` -- **new** (Review): the ORDER inside the chokepoint without a pooler — a malformed
  credential is `credential_malformed` out of both `store` and `fetchWithKey`, never `credential_store_unavailable`
  or `ghost_unreachable`.
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
- [x] `apps/web/server/ghost-admin/admin-rule.ts` + `apps/web/ghost-admin-rule.test.ts` -- the mint, the
      allowlist literal, the denials, the URL builder, the cause map -- the contract green before anything
      connects to anything
- [x] `apps/web/package.json` + lockfile -- `postgres@3.4.9` -- the only new dependency
- [x] `apps/web/server/ghost-admin/db.ts` + `index.ts` -- the lazy connection and `store` / `remove` / `call` /
      `fetchWithKey` with their audit rows -- the chokepoint
- [x] `apps/web/server-wiring.test.ts` -- the five new read-from-the-tree contracts -- the chokepoint enforced,
      not described
- [x] `supabase/migrations/20260907200000_vault_secret_lifecycle.sql` + `SCHEMA.sql` + `PRELUDE.sql` +
      `RLS-TEST.sql` + the two `supabase/tests/` copies -- DW-44's trigger, the `vault` stand-in and the three
      path proofs -- `bash supabase/tests/run-rls-gate.sh` green, and red with the trigger commented out (the
      control)
- [x] `apps/web/app/api/ghost-admin/verify/route.ts` -- the five ops behind the bearer -- the deployed proof
- [x] `tools/probe/run-verify-ghost-admin.py` + its `doc-audit.py` row + `tools/probe/.env.example` --
      the harness and the env name -- R-82, re-runnable
- [x] `tools/probe/.env` (`SUPABASE_DB_POOLER_URL`, derived) + Vercel production (the owner) -- read
      back by name, never printed -- **done:** in `tools/probe/.env` and executed from this machine, and in Vercel
      production since the owner ruled Question 1 (option 1, 2026-09-08); the deployed function reads it
- [x] `deferred-work.md` (DW-44 closed at Dev) + `epic-3-context.md` -- propagate, never localise
- [x] Run `## Verification` on the real infrastructure and record every command and result by variable name -- ran at Dev,
      at Review and again at Deploy; **at Deploy every step of the harness passed, the three trigger-dependent ones included**

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

### Review Findings

Review 1, 2026-09-07 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier) over the diff `929494bd..ec51423d`. Every patch below is applied and checked in this review's commit;
every defer has its ledger row.

- [x] [Review][Patch] The spec lost everything from the DW-44 bullet to `## Design Notes` in the first Dev commit (the frozen block never closed, the matrix, Code Map, Tasks, Acceptance Criteria and Design Notes gone, Question 1's heading glued into a bullet so the board could not surface it) — restored from the Create baseline `929494bd`, byte-identical inside the frozen block [spec]
- [x] [Review][Patch] A malformed credential was minted INSIDE the fetch try, so `credential_malformed` came out as `ghost_unreachable` with an `admin_read error` row [apps/web/server/ghost-admin/index.ts `fetchWithKey`]
- [x] [Review][Patch] `store()` wrote any string into Vault; `parseCredential` now refuses before Vault (the matrix row *Malformed credential*) [index.ts `store`]
- [x] [Review][Patch] `decrypt()` inner-joined `site_credentials`, so a site with no credentials row wrote no `vault_decrypt error` row (the matrix row *Call, no admin ref*, AD-10 F10) — left join [index.ts `decrypt`]
- [x] [Review][Patch] `remove()`, the `staff` kind and the route's sixth op (`remove`, added at Dev outside the five the Ask-First named) were executed nowhere — harness steps `staff-removed`, `malformed`, `credential-missing`; the gate's null-ref path (1b) [tools/probe/run-verify-ghost-admin.py, RLS-TEST.sql]
- [x] [Review][Patch] The importer contract matched `…/ghost-admin'` and `/index.ts'` only (an import of `db.ts` — the decrypting connection — from anywhere passed), and the driver contract matched single quotes only — both widened, each proved red by a mutant [apps/web/server-wiring.test.ts]
- [x] [Review][Patch] The gate's three DW-44 paths ran as the container superuser, so `security definer` was asserted as a catalogue bit and never load-bearing — step (1b) nulls a ref under a probe role holding SELECT/UPDATE on the credentials row and nothing on `vault`; **the control run with `security invoker` in the migration and SCHEMA.sql is red at (1b): `permission denied for schema vault`** [RLS-TEST.sql]
- [x] [Review][Patch] `store()` took `userId` on trust; it is now checked against `sites` inside the transaction (`site_not_found`) [index.ts `store`]
- [x] [Review][Patch] `adminUrl` resolved against the origin and threw a subdirectory install's path away (`https://example.com/blog`), admitted dot segments the allowlist's `[^/]+` lets through (`themes/../activate/`), and let a client-written `sites.url` that is not a URL escape as a TypeError — `site_url_invalid` [apps/web/server/ghost-admin/admin-rule.ts `adminUrl`]
- [x] [Review][Patch] A GET with a body made `fetch` throw and read as `ghost_unreachable`; redirects were followed with the bearer — no body on GET, `redirect: 'manual'`, 3xx → `ghost_redirected` [index.ts `fetchWithKey`, admin-rule.ts `ghostCode`]
- [x] [Review][Patch] `write-denied` executed one of the three denials the matrix names; `allowlist()` restated a count (`len(names) != 4`); `config-versioned` implied it could see the header (Ghost answers 200 to `v99.0` and `nonsense` on both majors — executed) — three denial steps, the count derived, the step's wording corrected [run-verify-ghost-admin.py]
- [x] [Review][Patch] The §21j 404 control was a hand run — now the `vault-off-rest` step of `--check`, with `/rest/v1/sites` as its positive control (PASS on the live project) [run-verify-ghost-admin.py]
- [x] [Review][Patch] `PRELUDE.sql`'s stand-in enabled RLS on `vault.secrets`; the live table has it off with no policy (read through the pooler) — removed, so the stand-in models what is there [PRELUDE.sql, supabase/tests/prelude.sql]
- [x] [Review][Patch] `.env.example` offered the Management API's pooler route as a derivation; it answered 403 to this token at Dev — the dashboard is the only source now [tools/probe/.env.example]
- [x] [Review][Patch] `epic-3-context.md` still listed DW-44 as open and named neither DW-49 nor DW-50 [epic-3-context.md]
- [x] [Review][Patch] `AuditDetail` claimed to be "the whole guard" while the decrypt CTE writes `reason`; `ghostError`'s docstring said only `type` is kept — the type carries `reason?: 'missing'`, the sentence says what happens [admin-rule.ts]
- [x] [Review][Patch] The rotation proof did not assert the untouched Staff secret survived (an over-deleting trigger passed step 1) [RLS-TEST.sql]
- [x] [Review][Patch] A 2xx with a non-JSON body raised an uncaught `ValueError` before the harness's cleanup [run-verify-ghost-admin.py `call_route`]
- [x] [Review][Patch] `db.ts` rested `max: 1` on "a serverless function serves one request at a time" — the project runs Fluid Compute (`resourceConfig.fluid: true`, read from the Vercel API), so invocations queue on the one connection; and `ssl: 'require'` does not verify the chain — both facts executed and written beside the options; the verification itself is DW-50 [apps/web/server/ghost-admin/db.ts]
- [x] [Review][Patch] `vault.create_secret`'s four-argument signature (read from the live catalogue at Dev) had reached `PRELUDE.sql` and nothing else; the frozen Boundaries still say three — recorded in the change log below and propagated to `MEASUREMENTS.md` §21j with the rest of the 2026-09-07 re-probe [MEASUREMENTS.md, this spec]
- [x] [Review][Patch] The Verification header named deployment `dpl_A3nB…` / `80fa5cdd`; production is at `ec51423d` (`dpl_AaSWiAY35KeizJu6mAksWXmY2vzT`, READY, CI `check` · `rls` · `deploy` success) — the review section below says so [spec]
- [x] [Review][Defer] The pooler's TLS chain is not verified (`'verify-full'` fails `SELF_SIGNED_CERT_IN_CHAIN` — Supabase's own CA) [db.ts] — deferred, **DW-50**, rides with DW-49's rotation
- [x] [Review][Defer] `fetchWithKey` serialises every body as JSON; `theme_upload` is multipart [index.ts] — deferred, **DW-51**, Epic 7 executes the upload
- [x] [Review][Defer] `ghostCode` folds 404, 429 and 5xx into `ghost_refused` [admin-rule.ts] — deferred, **DW-52**, 3.3 and E7 see those statuses
- [x] [Review][Defer] `private.credential_audit.outcome` is free text with no check constraint [SCHEMA.sql:748] — deferred, pre-existing, **DW-53**

Dismissed as noise or by design, ten: a denied write decrypts first (the frozen Code Map's order; the decrypt supplies
the audit row's `user_id`); a second paste of the migration errors on the duplicate trigger (loud and harmless, and
migrations apply once); a unique index on the refs (every ref is minted by one `store`); `remove()` on a site with no
row answers `removed` (idempotent); `call()` on a disconnected site (3.5 removes the credentials on disconnect); an
audit insert failing after Ghost accepted a write surfaces as `credential_store_unavailable` (by design — an
unrecorded call must not look like success); a malformed `SUPABASE_DB_POOLER_URL` throwing from the driver's
constructor (the route's envelope catches it); the harness not being in CI (R-82's harnesses run by phase); no
`admin_read` row beside the decrypt row when `adminUrl` refuses a path (Inflozo's own path, not a Ghost call); and the
verify route's `Accept-Version` being unobservable from outside (executed: both Ghosts ignore an unsupported value).

## Spec Change Log

- **2026-09-07, Review 1.** The file as committed at `80fa5cdd` and `ec51423d` had lost lines 124–368 of the Create
  baseline (the tail of the DW-44 bullet through `## Design Notes`, the frozen block's closing tag included); restored
  from `929494bd`. The frozen block is byte-identical to the baseline again; nothing in it was rewritten.
- **2026-09-07, Review 1 — the frozen text overtaken by execution, recorded here rather than edited there:**
  (a) `vault.create_secret` has FOUR arguments with three defaults (`new_secret, new_name, new_description,
  new_key_id`) — the Boundaries say three, the docs' shape; the app's three-positional call resolves through the
  defaults and `PRELUDE.sql` models the four. (b) The verify route carries a sixth op, `remove`, which the Dev added
  outside the Ask-First's five; the review kept it because it is the one way to execute `remove()` and the `staff`
  kind on the live project (harness step `staff-removed`), and the whole route is DW-48 scaffolding that 3.2 deletes.
  (c) `ssl: 'require'` encrypts without verifying the chain, and `'verify-full'` fails against the pooler's
  Supabase-CA certificate — DW-50. (d) Fluid Compute is on for the project, so `max: 1` serialises concurrent
  invocations rather than matching one-request-per-instance.
- **2026-09-07, Review 1 — codes added beside AD-24's:** `site_not_found` (a `store` for a site that is not the
  caller's), `site_url_invalid` (a `sites.url` that is not a URL), `ghost_redirected` (a 3xx, answered and never
  followed). Each is Inflozo's, one per cause, and none carries a credential.

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

## Questions for the owner

### Question 1 — one setting to add in Vercel, and the story cannot be proved without it

Story 3.1 builds the locked box for a site's Ghost keys. The server opens it with one database
setting — a long connection address, like a password for the key store. It is already on my
machine and it works there (I connected and read back `PostgreSQL 17.6`). It is **not** in Vercel,
which is where the live site runs, and I cannot add it: Vercel's "add a setting" call is refused by
this machine's safety sandbox, exactly as it was for `CRON_SECRET` in Story 2.6, which you added by
hand.

Until it is there, the live site can do everything else but cannot open the key store, so the last
part of this story's proof — a real Ghost key going in and coming out on the deployed site — cannot
run.

**An example of what you would do:** Vercel → the `inflozo` project → Settings → Environment
Variables → **Add New**. Name: `SUPABASE_DB_POOLER_URL`. Value: the line I will give you (it is in
`tools/probe/.env` on my machine; I never print it). Environment: **Production** only. Save.
That is the same five clicks as `CRON_SECRET`.

1. **Add it now, before the review (RECOMMENDED).** I give you the value; you paste it; I run the
   proof and the story goes to review with the whole round trip executed, on both Ghost test
   servers. This is what R-82 asks for and it is one paste.
2. **Add it at Deploy, with the database change.** You are already applying one SQL file by hand at
   Deploy; add the setting in the same sitting. The story goes to review with the Vault half
   unproven and the proof runs a phase later — which means a problem in it is found later too.
3. **Give me a Vercel token that the sandbox will let me use.** Fastest in future stories, but it
   hands an automated session the ability to change production settings, which I do not recommend.

**Ruled: option 1 (owner, 2026-09-08).** The owner added `SUPABASE_DB_POOLER_URL` to Vercel production by hand; read back
by name (target `production`, type `sensitive`). This commit re-publishes so the live function reads it, and the
full harness runs against that deployment.

---

## Verification

Run on the real infrastructure (R-82). Every key was read into a command's environment by its
variable NAME and never printed; each is recorded here by that name only.

**Deployment: `dpl_2VbaoUt63r9BwfgY16sMJBYkHcRP`** — commit `c52c3787` (HEAD at Deploy), state
**READY**, `target: production`, aliases `inflozo.com`, `app.inflozo.com`, `www.inflozo.com`; read via
`GET /v6/deployments?target=production` and `GET /v13/deployments/{uid}` with **`VERCEL_TOKEN`**,
**`VERCEL_TEAM_ID`**. Publishing happens from GitHub Actions (DW-7): the CI run for `c52c3787`
finished **success** with `check` **success**, `rls` **success**, then `deploy` **success** — so the
RLS gate and `pnpm check` are green on CI's runner as well as on this machine. (The Dev and Review
runs recorded below ran against the earlier production deployments `dpl_A3nB2fXkWZWFwP9Z63jDnLnmXWTN`
at `80fa5cdd`, `dpl_AaSWiAY35KeizJu6mAksWXmY2vzT` at `ec51423d` and
`dpl_4d5b6nfU7zPvEBZ6BMpMjwU5DWdw` at `441131de`; no app code changed after `441131de`.)

### Review 1, 2026-09-07 — what the review ran, and what it returned

The review ran on the real infrastructure again (R-82) and executed what the Dev run could not or did not.
Keys by variable NAME only; nothing printed; nothing changed in Vercel or on the live database.

| Command | Result |
|---|---|
| `GET /v9/projects/{VERCEL_PROJECT}/env` and `/v6/deployments?target=production&limit=1` with **`VERCEL_TOKEN`**, **`VERCEL_TEAM_ID`** | the same eight names, **`SUPABASE_DB_POOLER_URL` still absent** — Question 1 is unruled; production is `dpl_AaSWiAY35KeizJu6mAksWXmY2vzT` at **`ec51423d`**, READY, CI `check` · `rls` · `deploy` all success. `GET /v9/projects/{VERCEL_PROJECT}`: `resourceConfig.fluid` **true** |
| `python3 tools/probe/run-verify-ghost-admin.py --check` (`https://inflozo.com`), before and after the harness patches | `keys` PASS · `no-header` PASS (401, `x-matched-path`, `no-store`) · `wrong-secret` PASS · **`vault-off-rest` PASS** (the new step: `/rest/v1/{decrypted_secrets,secrets,site_credentials}` → 404 ×3 with **`SUPABASE_SECRET_KEY`**, `/rest/v1/sites` → 200) · `grants` **FAIL by design**, `credential_store_unavailable` from inside the deployed function. Exit 1, correctly |
| the TypeScript mint straight at both Ghosts (**`GHOST6_ADMIN_API_KEY`**, **`GHOST5_ADMIN_API_KEY`**, node 24, script deleted) | **T1** and **T3**: no `Accept-Version` → 200 (6.58.0 / 5.130.6); `v6.0` / `v5.0` → 200; **control (c)** a `kid` never issued → 401 `Unknown Admin API Key` → `ghost_unknown_key`; **control (d), new** the real `kid` with a wrong secret → 401 `Invalid token: invalid signature` → `ghost_bad_signature`; and `Accept-Version: v99.0`, `v1.0`, `nonsense` → **200 on both**, so the header is not observable from outside (the harness step now says so) |
| read-only catalogue through the pooler with **`SUPABASE_DB_POOLER_URL`** (`docker run … postgres:17-alpine psql`) | `current_user` postgres, `rolbypassrls` t; `vault.secrets` `relrowsecurity` **f**, no policies, owner `supabase_admin`, grants `postgres` DELETE/SELECT/REFERENCES/TRUNCATE and `service_role` DELETE/SELECT only; `supabase_auth_admin` no grant, no bypassrls; `vault.create_secret` 4 args / 3 defaults / definer; `credential_action` enum carries `admin_write, admin_read, vault_decrypt`; `outcome` is unconstrained text (DW-53); `site_credentials`, `credential_audit`, `vault.secrets` all **0 rows**; trigger **absent** (the owner's Deploy step) |
| the pooler's TLS from the app's own driver (`postgres` 3.4.9, **`SUPABASE_DB_POOLER_URL`**) | `ssl: 'require'` **connects**; `ssl: 'verify-full'` **fails `SELF_SIGNED_CERT_IN_CHAIN`** — DW-50. `pg_stat_ssl` through the pooler reports the backend leg only |
| `bash supabase/tests/run-rls-gate.sh` after the review's patches | **exit 0, 82 PASS notices**, five of them DW-44: definer + pinned `search_path`; rotation deletes only the replaced secret (and the Staff secret survives it — new); **(1b) nulling a ref deletes its secret under a probe role holding SELECT/UPDATE on the credentials row and nothing on `vault`** — new; site deleted; account deleted |
| **the control:** `security invoker` in the migration and `SCHEMA.sql`, step (0) softened to a notice, gate re-run | **exit 3** at (1b): `ERROR: permission denied for schema vault`. The definer bit is load-bearing and the proof now shows it; files restored, copies byte-identical, migration untouched |
| `pnpm check` (Node 24) | **exit 0**; `apps/web` **187/187** — the two new `ghost-admin.test.ts` order tests among them, which fail twice against the pre-patch module (control run) |
| two mutants against `server-wiring.test.ts` — `lib/zz-mutant-db.ts` importing `@/server/ghost-admin/db`, and a double-quoted `import postgres from "postgres"` | **each turned its own contract red** (`not ok 10` the importer list; `not ok 7` the driver), then removed; the widened regexes catch what the first ones let through |

### Review 1, continued 2026-09-08 — the Vault round trip on the live project, after the owner's ruling

| Command | Result |
|---|---|
| `GET /v9/projects/{VERCEL_PROJECT}/env` with **`VERCEL_TOKEN`**, **`VERCEL_TEAM_ID`** | **`SUPABASE_DB_POOLER_URL` present**, target `production`, type `sensitive` (the owner, by hand — Question 1, option 1) |
| the re-publish: commit `441131de` pushed; CI run completed **success**; `GET /v6/deployments?target=production` | **`dpl_4d5b6nfU7zPvEBZ6BMpMjwU5DWdw`, READY, at `441131de`** — the first deployment that carries the variable (the GitHub token may not re-run a workflow: HTTP 403, so a real commit published it) |
| `python3 tools/probe/run-verify-ghost-admin.py --check` | **exit 0, all steps passed** — `grants` → `{"who": "postgres", "may_delete": true}` from inside the Vercel function. **The Vercel → pooler hypothesis is executed and held** |
| `python3 tools/probe/run-verify-ghost-admin.py` (full, T1 6.58.0 and T3 5.130.6) | **Every step PASS except the five that need the migration, which FAIL exactly as predicted.** Per Ghost: `credential-missing` (500 `credential_missing`, and its `vault_decrypt error {reason: missing}` row found by `audit`) · `store` (ref, `credentials_present.admin` true) · `malformed` (500 `credential_malformed`, no ref) · `config-no-version` 200 with the version · `config-versioned` 200 · `write-denied` ×3 (no item, wrong item, guarded body — each `write_not_allowed`, each audit row without a `status`, so no network call) · `bogus-key` (`{ok: false, status: 401, code: ghost_unknown_key}`) · `audit` (13 rows: 6 `vault_decrypt ok`, 1 `vault_decrypt error`, 2 `admin_read ok`, 1 `admin_read error` at 401, 3 `admin_write denied`; every `detail` a jsonb object; every row stamped `api/ghost-admin/verify`; **no row that looks like a key**). Once: `user-gone` 404 · `no-secret-leak` (34 response bodies, neither key appeared) · users **5 before, 5 after**. **FAIL, expected until Deploy:** `rotated` ×2 (the bogus secret survived the re-store), `staff-removed` ×2 (the secret survived `remove`; `credentials_present.staff` did flip to false), `secret-gone` (both refs still in the vault after the account went) |
| **DW-44 observed on the live project:** after the cascade, `vault.secrets` held **8** orphans — per Ghost the real key twice, the bogus one, the staff-shaped one — with `site_credentials` at 0 rows | swept through the pooler with **`SUPABASE_DB_POOLER_URL`** after the count and the description shape (`^site <uuid> (admin|staff)$`) were checked: `DELETE 8`, vault rows **0**. The trigger, once applied, is what makes this sweep unnecessary; the harness docstring says so |

**Closed at Deploy — see the Deploy section below.** As at the end of Review: **what is still unexecuted, and only this:** the three trigger-dependent steps — `rotated`, `staff-removed`,
`secret-gone` — which pass the moment the owner applies `20260907200000_vault_secret_lifecycle.sql` in the SQL
editor at Deploy and the harness is re-run. Everything else the story claims has now run on the deployed site
against both real Ghosts. The story stays **in review** until then; Done is the owner's after Deploy.

### Deploy, 2026-09-08 — the migration on the live database, and the whole harness green

Deploy for this story is two things: the app code (already published by CI on the push) and the one
schema change. Keys by variable NAME only; no value printed.

| Command | Result |
|---|---|
| `GET /v6/deployments?target=production` and `GET /v13/deployments/{uid}` with **`VERCEL_TOKEN`**, **`VERCEL_TEAM_ID`** | production is **`dpl_2VbaoUt63r9BwfgY16sMJBYkHcRP`** at **`c52c3787`**, `readyState` **READY**, `target` production, aliases `inflozo.com`, `app.inflozo.com`, `www.inflozo.com`. The `## Verification` header above records it |
| `GET /repos/Inflozo/inflozo/actions/runs` and the run's jobs with **`GITHUB_TOKEN`** | the CI run for `c52c3787` **success**: `check` success, `rls` success, `deploy` success (DW-7's shape — nothing publishes past a red gate) |
| the live catalogue read through the pooler with **`SUPABASE_DB_POOLER_URL`** (`docker run … postgres:17-alpine psql`) — `pg_get_triggerdef`, `pg_get_functiondef`, `prosecdef`, `proconfig`, `has_function_privilege` | **the migration is already applied** — the owner ran `20260907200000_vault_secret_lifecycle.sql` in the SQL editor. `site_credentials_drop_vault_secrets` is `BEFORE DELETE OR UPDATE ON private.site_credentials FOR EACH ROW`; `private.drop_vault_secrets()` is `SECURITY DEFINER` with `search_path` pinned to `''` and a body **byte-identical to the migration's**; `has_function_privilege` for `authenticated` and `anon` is **f** for both. This session therefore **verified rather than re-applied**, so nothing was written to production DDL from here. (There is no `supabase_migrations.schema_migrations` table on this project — it does not exist, executed — so applied-ness is read from the catalogue, which is the stronger read anyway) |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0**, and the five DW-44 notices among the passes: the trigger function is `security definer` with a pinned `search_path`; a rotation deletes the replaced secret **and only that one**; nulling a ref deletes its secret **under a role that may not touch the vault itself**; deleting a site takes both of its secrets; deleting an account takes its sites' secrets |
| `python3 tools/probe/run-verify-ghost-admin.py` (full, against `https://inflozo.com`, T1 6.58.0 and T3 5.130.6) | **exit 0 — `RESULT: all steps passed`.** Every step of Review's run passes again, and **the three that were failing by prediction now pass**: `rotated` (T1 and T3 — the bogus ref gone, the new one there), `staff-removed` (T1 and T3 — the staff secret gone from the vault, `credentials_present.staff` false), `secret-gone` (`{"T1": false, "T3": false}` — both refs gone from the vault after the throwaway account was deleted). Also `grants` `{"who": "postgres", "may_delete": true}`; `vault-off-rest` 404 ×3 with `/rest/v1/sites` 200; `audit` 13 rows per Ghost with **0 rows that look like a key**; `no-secret-leak` over 34 response bodies; users **5 before, 5 after** |
| the vault swept for orphans after the run, with **`SUPABASE_DB_POOLER_URL`** | **nothing to sweep.** `vault.secrets` **0**, `private.site_credentials` **0**, `public.sites` **0**, `auth.users` **5** — where the same run at Review left **8** orphans that had to be deleted by hand. That difference *is* DW-44's trigger working on the live database |

**So the story's last three unexecuted steps are executed, and DW-44 is closed on the real project as
well as in the gate.** No app code and no SQL changed at Deploy; the only edits in this commit are this
record, the two task boxes, `deferred-work.md`'s DW-44 note and `sprint-status.yaml`. The story carries
`owner_test: none` — it has no screen — so it goes to **done** on this commit, per the loop's rule for a
story with nothing for the owner to look at.

### What ran on this machine, and what it returned

| Command | Result |
|---|---|
| `export PATH=…/node/v24.18.1/bin:$PATH && pnpm check` (repository root) | **exit 0.** `ghost-admin-rule.test.ts` 8/8; `server-wiring.test.ts` 12/12 — the six existing contracts plus **six** new ones (the Code Map named five; the sixth asserts `CredentialKind` has no `content` member, which an acceptance criterion requires) |
| `pnpm build` (`apps/web`) | **exit 0**, "Compiled successfully", and `ƒ /api/ghost-admin/verify` in the route table. The bundler took `postgres` 3.4.9 with no `serverExternalPackages` entry — the documented fallback was **not** needed |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0.** Schema diff empty (the migrations and `SCHEMA.sql` describe the same database), **81 PASS notices**, four of them new: the trigger function is `security definer` with a pinned `search_path`; a rotation deletes the secret behind the ref it replaced **and only that one**; deleting a site takes **both** of its secrets; deleting an account takes its sites' secrets (the cascade path) |
| the same with the `create trigger` line commented out in a scratch copy of the migration **and** of `SCHEMA.sql` (`INFLOZO_ARCH_DIR`) | **exit 3 — the control, run FOUR times.** (1) with the guard-trigger list intact: `FAIL: missing guard trigger(s): site_credentials_drop_vault_secrets`. (2) with that name removed so the run reaches the three paths: `FAIL (DW-44): the replaced Admin key secret is still in the vault`. (3) with the rotation assertion softened to a notice: `FAIL (DW-44): 2 secret(s) survived the site being deleted`. (4) with that one softened too: `FAIL (DW-44): 2 secret(s) survived the account being deleted`. **Each of the three paths fails on its own without the trigger** — they test the trigger, not the stand-in |
| six mutation controls on `server-wiring.test.ts` (a second `postgres` importer, a second `SUPABASE_DB_POOLER_URL` reader, a `private.credential_audit` query, an undeclared importer of the chokepoint, `console.error('…', thrown)`, a `content` member on `CredentialKind`) | **each mutation turned its own contract red, and only its own**; tree restored, 12/12 green afterwards |
| `python3 tools/doc-audit.py --check` (twice) | first run **STALE** — it regenerated `INDEX.md`/`INDEX.html` and asked for the board — then `python3 tools/story-board.py`, then **PASS (0 warnings)** |
| `python3 -c "…"` → `docker run --rm -e PGURL postgres:17-alpine psql "$PGURL" …` with **`SUPABASE_DB_POOLER_URL`** | **exit 0**, and it is the first execution of the derived URL: `current_user` = `postgres`, `PostgreSQL 17.6 on aarch64-unknown-linux-gnu`, `has_table_privilege(current_user, 'vault.secrets', 'DELETE')` = **t**, `has_table_privilege(current_user, 'private.site_credentials', 'INSERT')` = **t**. §21j's grant model holds and this connection is inside it |
| `GET https://api.supabase.com/v1/projects/{ref}/config/database/pooler` with **`SUPABASE_ACCESS_TOKEN`** | **HTTP 403.** Story 2.1 read this route; this token no longer may. So the pooler host is **not** taken from it: it is the one this project has already reached and recorded (`aws-0-eu-central-1.pooler.supabase.com:6543`, spec-2-1:603 and spec-2-5:583), and the line above **executes** it rather than trusting the record |
| `GET https://api.vercel.com/v9/projects/{VERCEL_PROJECT}/env` with **`VERCEL_TOKEN`**, **`VERCEL_TEAM_ID`** | **HTTP 200**, eight variables **by name**: `CRON_SECRET`, `DODO_WEBHOOK_SECRET`, `ENABLE_EXPERIMENTAL_COREPACK`, `RESEND_API_KEY`, `RESEND_FROM`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_URL`. **`SUPABASE_DB_POOLER_URL` is absent**, exactly as the Boundaries predicted. No value was printed |
| `python3 tools/probe/run-verify-ghost-admin.py --check` (**before** the push) | **exit 1, and correctly:** `keys` PASS (`CRON_SECRET`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `GHOST6_URL`, `GHOST6_ADMIN_API_KEY`, `GHOST6_MAJOR`, `GHOST5_URL`, `GHOST5_ADMIN_API_KEY`, `GHOST5_MAJOR`, all by name); the allowlist read out of `admin-rule.ts` = `theme_upload, theme_activate, routes_upload, announcement_clear`; then `no-header`, `wrong-secret` and `grants` all **HTTP 404** — the route is not deployed yet, which is what this commit changes |

### What ran against the real infrastructure

| Command | Result |
|---|---|
| `python3 tools/probe/run-verify-ghost-admin.py --check` (**after** the push, against `https://inflozo.com`) | `keys` **PASS**; `no-header` **PASS** — `POST` with no `Authorization` → **HTTP 401 `Unauthorized`**, `x-matched-path /api/ghost-admin/verify`, `cache-control: no-store`, so the 401 is **the route's** and not a platform's; `wrong-secret` **PASS** — a wrong bearer of the same shape → **401** the same way; `grants` **FAIL by design** → **HTTP 500 `{"code":"credential_store_unavailable","message":"SUPABASE_DB_POOLER_URL is not set"}`**. That 500 is itself the execution of the matrix's last row — *env unset → loud throw, never a 200* — from inside the deployed function |
| the TypeScript mint driven straight at both Ghosts (`mintJwt`, `headers`, `adminUrl`, `ghostCode` from `admin-rule.ts`, keys **`GHOST6_ADMIN_API_KEY`** and **`GHOST5_ADMIN_API_KEY`**, run under `node` 24 and deleted afterwards) | **T1 `ghost6.inflozo.com`**: `GET /ghost/api/admin/config/` with **no** `Accept-Version` → **200, version 6.58.0**; with `Accept-Version: v6.0` → **200, 6.58.0**; a `kid` Ghost never issued → **401 `Unknown Admin API Key`** → `ghost_unknown_key`. **T3 `ghost5.inflozo.com`**: no header → **200, version 5.130.6**; `v5.0` → **200, 5.130.6**; bogus `kid` → **401 `Unknown Admin API Key`** → `ghost_unknown_key`. The mint written in TypeScript is the one both majors accept, the no-version case Story 3.2 validates in is executed on both, and §37's cause map is confirmed against the live servers |
| the pooler's grant surface, read with **`SUPABASE_DB_POOLER_URL`** through the app's own `postgres` 3.4.9 | `current_user` **postgres**; EXECUTE on `vault.create_secret` **true**; SELECT on `vault.decrypted_secrets` **true**; DELETE on `vault.secrets` **true**; INSERT on `private.credential_audit` **true**; UPDATE on `public.sites` **true**; `site_credentials_drop_vault_secrets` present **0** — the trigger is not on the live database yet, which is the owner's Deploy step |
| `select p.pronargs, p.pronargdefaults, pg_get_expr(p.proargdefaults, 0), p.prosecdef` for `vault.create_secret` | **READ IN ITS SOURCE, and it corrected the spec.** `supabase_vault` **0.3.1** ships `create_secret(new_secret text, new_name text DEFAULT NULL, new_description text DEFAULT '', new_key_id uuid DEFAULT NULL) RETURNS uuid`, `security definer` — **four** arguments with three defaults, not the three the docs' shape suggested. The app's three-positional-argument call resolves through the defaults and is unchanged; `PRELUDE.sql`'s stand-in was **wrong** and now models the four-argument signature, so the gate proves the call against the signature the live database actually has (the same divergence class as the storage-delete stand-in, caught before it cost anything) |
| `GET /rest/v1/decrypted_secrets`, `/rest/v1/secrets` and `/rest/v1/site_credentials` with **`SUPABASE_SECRET_KEY`** | **404 all three** (`PGRST205`). §21j still holds after this story: the direct connection added **no** REST path to Vault, and `site_credentials` is not on the data API either |

### What needs the deployment, and what it is waiting on

`SUPABASE_DB_POOLER_URL` is not in Vercel production and this session cannot put it there
(**Question 1**; the same sandbox refusal 2.6 recorded for `CRON_SECRET`, spec-2-6:559). So on the
deployed site the two 401 controls and the route's own plumbing **ran and passed**, and `grants` —
and therefore every step after it — **could not**: it answered `credential_store_unavailable`, the
**loud failure the module promises** rather than a 200, and the harness stopped there by design
instead of printing a cascade of failures that all mean one thing.

**What is therefore still unexecuted, and only this:** the Vault round trip on the live project —
`store`, the two `config/` calls *through the module*, the denied write's audit row, the bogus-key
rotation, the audit rows and the cascade. Every hypothesis those steps rest on that does **not**
need the Vercel-side variable has been executed above: the mint on both majors, the cause map, the
pooler's grants, and the module's own env-unset failure from inside the deployed function.

**Between Dev and Deploy** the code is live before the SQL is: CI deploys this commit, and
`supabase/migrations/20260907200000_vault_secret_lifecycle.sql` is applied by the owner in the
Supabase SQL editor at Deploy (this machine's sandbox refuses writes to the live database, and the
direct host is IPv6-only from here). Until it is applied the `rotated` and `secret-gone` steps are
expected to **FAIL**, and the harness prints that expectation beside each of them so a
pre-migration run is never mistaken for a pass.

**Manual checks (if no CLI):**
- Supabase dashboard → Integrations → Vault: after a full harness run, **no** secret whose
  description names a throwaway site remains.
- Vercel dashboard → the `inflozo` project → Settings → Environment Variables:
  `SUPABASE_DB_POOLER_URL`, Production.
