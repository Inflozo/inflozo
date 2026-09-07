---
title: 'Story 3.1 — The server-side Admin proxy and Vault credential storage'
type: 'feature'
created: '2026-09-07'
status: 'in-progress'
baseline_commit: '929494bd17cbd0c5444fac2164898f924b3bbee3'
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
  was; between Dev and Deploy the code is live before the trigger is, and `## Questions for the owner

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

---

## Verification

Run on the real infrastructure (R-82). Every key was read into a command's environment by its
variable NAME and never printed; each is recorded here by that name only.

**Deployment: `dpl_A3nB2fXkWZWFwP9Z63jDnLnmXWTN`** — commit `80fa5cdd`, state **READY**, serving
`inflozo.com` and `app.inflozo.com`; read via `GET /v6/deployments?target=production` with
**`VERCEL_TOKEN`**, **`VERCEL_TEAM_ID`**. Publishing happens from GitHub Actions (DW-7): the run for
`80fa5cdd` finished **success** with `rls` **success**, `check` **success**, then `deploy` — so the
RLS gate and `pnpm check` are green on CI's runner as well as on this machine.

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
