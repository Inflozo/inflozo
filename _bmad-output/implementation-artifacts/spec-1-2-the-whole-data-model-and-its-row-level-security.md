---
title: 'Story 1.2 — The whole data model and its row-level security'
type: 'feature'
created: '2026-09-04'
status: 'done'
review_loop_iteration: 1
baseline_commit: '17c86c77fb6e459606ad87d7e9d69d79e2a793b0'
owner_test: none
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md', '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md']
---

## In plain English

Nothing changes on screen in this story: it builds the product's filing cabinet, the database, all of it in one go, so that no later feature has to bolt a drawer on afterwards. Every drawer is locked to its owner from the first day — one person can never read or touch another's projects, sites or settings — and a self-checking test proves those locks hold, refusing to pass if even one is missing. You will see no new page; what you get is a foundation that later stories can safely build every screen on.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The complete schema and its row-level security have been designed and proven against real hosted Supabase (`MEASUREMENTS.md` §16), but they have no home in the repository. The spine mandates one `supabase/migrations` directory as the only way schema changes and `supabase/tests/rls.sql` as the runnable proof (AD-26); today neither exists, and CI runs no database gate. Without this story every later epic — E3, E7, E12 all write `notifications` before E13 renders it — carries an un-storied migration.

**Approach:** Give the proven schema its operational home. Copy the architecture's `SCHEMA.sql`, `RLS-TEST.sql` and `PRELUDE.sql` verbatim into `supabase/` at the spine's mandated paths, guard the copies byte-identical to their design authority so the two can never drift, and wire the RLS proof into CI as a gate keyed on its exit code. Do not re-author the schema — it is the design authority and is proven; localising it would violate "propagate, never localise."

## Boundaries & Constraints

**Always:**
- The architecture's `SCHEMA.sql` / `RLS-TEST.sql` / `PRELUDE.sql` remain the design authority (`live` in `INDEX.md`; cited by `record` documents by path, so they cannot move). The `supabase/` files are byte-identical copies, and a guard asserts it (standing rule 7 — a propagation list cannot audit itself).
- The RLS proof is a GATE, not a report: a failing assertion aborts the run and CI keys on the exit code (AD-26). RLS is verified over the whole catalogue, not a subset.
- Every RLS table carries `user_id` and the one AD-6 policy shape; server-only data is a table with RLS on and no policy in the `private` schema (AD-7); immutable columns are frozen by trigger (AD-9).
- Real-infrastructure verification per R-82: the schema must exist on the Supabase project the deployed app reads.

**Never:**
- Never apply `PRELUDE.sql` to hosted Supabase — its `auth.uid()` stand-in returns NULL and would silently disable every policy. It is container-only.
- Never hand-edit a migration in the Supabase dashboard (AD-26). Never re-derive or "tidy" the schema SQL — copy it verbatim.
- No screen, no frame, no UI. This story adds no route and no component.
</frozen-after-approval>

## Code Map

- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the design authority: every table, policy, grant, trigger, bucket. Applies clean to a bare container and to hosted Supabase (§16a). Copy verbatim into the migration. Read-only source.
- `.../RLS-TEST.sql` -- dual-target proof (installs container stand-ins only where it owns the `auth` schema). E1's exit gate. Copy verbatim into `supabase/tests/rls.sql`. Read-only source.
- `.../PRELUDE.sql` -- container stand-ins for the Supabase-provided objects (auth, storage, roles). Copy verbatim into `supabase/tests/prelude.sql`. Container-only. Read-only source.
- `.github/workflows/ci.yml` -- today runs `pnpm check` + `pnpm build` on push to `main`; the RLS gate job is added here.
- `apps/web/vercel.json`, `pnpm-workspace.yaml` -- the spine's Structural Seed puts `supabase/` at repo root beside `apps/` and `packages/`; `tools/doc-audit.py` `BASES` does not walk `supabase/`, so no catalogue row is needed.
- `tools/probe/.env` (never printed) -- `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_URL` for the app's project; the Vercel project also holds `SUPABASE_URL`/`SUPABASE_SECRET_KEY`. Planning assumed these were **Sensitive** env vars the API would never return, so identity could only be inferred by result; executed, they are `type: encrypted` and `GET /v1/projects/{id}/env/{envId}` returns them decrypted, so identity is confirmed by comparing in memory and printing a boolean (see Design Notes).

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/20260904120000_complete_schema.sql` -- byte-identical copy of the architecture's `SCHEMA.sql` -- AD-26's operational home for the whole model; the schema is proven, not re-authored
- [x] `supabase/tests/rls.sql` -- byte-identical copy of `RLS-TEST.sql` -- the spine's Structural Seed names this exact path; E1's exit gate
- [x] `supabase/tests/prelude.sql` -- byte-identical copy of `PRELUDE.sql` -- container stand-ins so the gate runs on a bare container; never hosted
- [x] `supabase/tests/run-rls-gate.sh` -- start `postgres:17-alpine`, `cmp -s` each `supabase/` file against its architecture original (drift exits non-zero -- standing rule 7), then `psql -v ON_ERROR_STOP=1 -f prelude.sql -f <migration> -f rls.sql`; the run's exit is the gate. One mechanism for laptop and CI (both have docker)
- [x] `.github/workflows/ci.yml` -- add an `rls` job on push to `main`: `bash supabase/tests/run-rls-gate.sh`; a non-zero exit fails the workflow (AD-26: CI keys on the exit code)
- [x] Real Supabase (R-82) -- confirm the project the deployed app reads (Vercel `SUPABASE_URL`) carries this schema: every §5 table, the `private` schema, the two signup triggers, four buckets; apply the migration there if it does not. Keys read only into a command's environment, recorded by variable name

**Acceptance Criteria:**
- Given a fresh `postgres:17` container, when `bash supabase/tests/run-rls-gate.sh` runs, then it exits 0 with zero SQL errors; and when any single assertion's fix in `supabase/tests/rls.sql` is reverted, then the gate exits non-zero (it is a gate, not a report -- AD-26).
- Given the `supabase/` copies, when each is compared byte-for-byte to its architecture original, then they are identical, and the gate refuses to run if they are not.
- Given the applied schema, when RLS-TEST's structural blocks run, then every RLS-protected table carries `user_id` and the AD-6 policy shape, every server-only table has RLS on with zero policies in the `private` schema (AD-7), every immutable column is frozen by trigger (AD-9), and RLS is asserted over the whole catalogue rather than a subset.
- Given the app's real Supabase project, when its schema is inspected on the real infrastructure (R-82), then it carries every table §5 implies -- explicitly `notifications`, `edit_locks`, `entitlements`, `deploy_jobs`, `asset_usages`, `site_snapshots`, `project_site_bindings`, the theme-settings definitions, translation overrides, the export record, routes state on `sites`, and the per-deploy variant manifest.
- Given a push to `main`, when CI runs, then the `rls` job is green, and a schema change that breaks a policy turns it red.

## Design Notes

**Why copy-and-guard rather than move.** The architecture's three SQL files are the design authority and are cited by `record` documents by path, which standing rule 5 forbids editing — so they cannot move. The spine names `supabase/migrations/` and `supabase/tests/rls.sql` as real files that must exist. The reconciliation is the repo's established pattern (`ux-designs/prototype/build.py` asserts every lifted region byte-identical to its source): the `supabase/` files are copies, and `cmp -s` in the gate is the standing-rule-7 audit that keeps them from drifting. A future schema change edits the authority and re-copies; the gate catches a stale copy.

**No Supabase CLI here** (`supabase` is not installed). "Apply the migration" means run the SQL through `psql`: against an ephemeral `postgres:17` container for the repeatable gate, and once against the hosted project (already done and recorded in §16a). The destructive fixture in `rls.sql` therefore runs against throwaway containers, never repeatedly against the production database.

**Two Supabase projects, one to confirm — confirmed, and the planning assumption about how was wrong.** `tools/probe/.env` points at the project the schema was proven on. Planning assumed the Vercel copies were **Sensitive** env vars the API would never decrypt, so identity could only be inferred by result. Executed: they are `type: encrypted`, and `GET /v1/projects/{id}/env/{envId}` returns them in the clear (`?decrypt=true` on the *list* endpoint does not — it still hands back the blob, which is why a first comparison read `DIFFERS` for both and was a broken test, not a result). Compared in memory, printed as a boolean only: **both match `tools/probe/.env`**, so the deployed app reads the schema-bearing project and there is nothing to reconcile. Recorded because the next story that reads a Vercel secret should reach for the per-variable endpoint rather than re-deriving this.

## Verification

**Container gate — executed 2026-09-04 on `postgres:17-alpine` against the architecture SQL (the copies will be byte-identical):**

| Command | Result |
|---|---|
| `psql -v ON_ERROR_STOP=1 -f PRELUDE.sql -f SCHEMA.sql -f RLS-TEST.sql` | **exit 0**, zero SQL errors; every assertion PASS/NOTICE, none raised |
| catalogue counts after apply | 29 base tables + `suggestions_public` view (30 relations) · 43 policies · 3 `private` tables (`site_credentials`, `billing_events`, `credential_audit`) |

Counts are cited as executed evidence, not as the requirement — the requirement is "every table §5 implies", and the files are their own count (standing rule 4).

**Real Supabase (R-82) — REST introspection of the app's project 2026-09-04, keys read only into the command's environment:**

| Check | Returned |
|---|---|
| exposed relations over `/rest/v1/` | 30 including `suggestions_public`; `owns_project` RPC present |
| `profiles` · `projects` rows | 4 · 2 (the signup triggers fired for the RLS-TEST fixture users, confirming `auth_user_profile` + `auth_user_entitlement` live) |
| four storage buckets · signup triggers | present |

**Dev phase — executed 2026-09-05 on this machine. Every service below is the real one; each key is
named by its variable in `tools/probe/.env` and no value was printed or logged.**

*The gate itself, `postgres:17-alpine` in docker (the image carries the client, so no local `psql` is needed):*

| Command | Result |
|---|---|
| `bash supabase/tests/run-rls-gate.sh` | **exit 0** — 70 `PASS` notices, zero `ERROR` lines |
| `cmp -s` on all three copies vs. their architecture originals | identical; the guard is the first thing the gate runs |

*The gate is a gate, not a report — mutation-tested with its control (AD-26 §21n, standing rule 2). Both runs
were made against throwaway copies under the scratch directory, so nothing in the repository was mutated:*

| Mutation | Exit | Reads |
|---|---|---|
| A — `alter table public.notifications disable row level security;` appended to the migration copy | **3** | `ERROR: FAIL: RLS is disabled on notifications` |
| B — the same break, plus that assertion's `raise exception` reverted to the pre-Round-4 `raise notice` | **0** | `NOTICE: FAIL: RLS is disabled on notifications` |

B is the control. It reproduces the historic defect exactly — the failure prints and the run still succeeds —
which is what proves the `raise exception` in A, and not `ON_ERROR_STOP` alone, is what makes this a gate.

*The drift guard, mutated in place and restored (`cmp -s` re-checked green afterwards):*

| Mutation | Result |
|---|---|
| one line appended to `supabase/tests/rls.sql` | **exit 1**, `DRIFT: … is not byte-identical to RLS-TEST.sql`; no container started |
| one byte appended to `supabase/migrations/20260904120000_complete_schema.sql` | **exit 1**, same refusal |

*Real Supabase (R-82) — read-only, `SUPABASE_DB_URL` over `psql` in a throwaway container, and `SUPABASE_URL`
+ `SUPABASE_SECRET_KEY` over PostgREST:*

| Check | Returned |
|---|---|
| public base tables · views | 29 · `suggestions_public` |
| `private` schema | `billing_events`, `credential_audit`, `site_credentials` — and **none of them carries a policy** (AD-7) |
| public tables without RLS | **(none)** · 43 policies over `public` |
| signup triggers on `auth.users` | `auth_user_entitlement`, `auth_user_profile` |
| storage buckets | `assets`, `deploy-artifacts`, `site-snapshots`, `suggestion-images` |
| the tables the AC names | all present: `asset_usages`, `custom_settings`, `deploy_jobs`, `edit_locks`, `entitlements`, `exports`, `notifications`, `project_site_bindings`, `routes_config`, `site_snapshots`, `translation_overrides` |
| routes state on `sites` | `routes_last_offered`, `routes_live_sha256`, `routes_verified_at` |
| `deploys.variant_manifest` | `jsonb` |
| non-internal triggers on `public` | 22 (the AD-9 immutability guards and their kin) |
| `GET /rest/v1/` with `SUPABASE_SECRET_KEY` | HTTP 200, 30 exposed relations; **no `private` table is exposed** |

The hosted project already carried the schema, so nothing was applied to it — the migration is its recorded
home, not a fresh apply. Counts are executed evidence, never the requirement (standing rule 4).

*Real Vercel (R-82) — read-only, `VERCEL_TOKEN` · `VERCEL_PROJECT` · `VERCEL_TEAM_ID`:*

| Check | Returned |
|---|---|
| `GET /v9/projects/{VERCEL_PROJECT}/env` | HTTP 200 — `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, `type: encrypted`, target `production` |
| `GET /v1/projects/{VERCEL_PROJECT}/env/{envId}` for each | HTTP 200, decrypted; compared in memory against `tools/probe/.env` — **both MATCH**, so the deployed app reads the project proven above |

*Not touched, and why:* Resend, Dodo and the Ghost servers T1/T3. This story adds no email, no billing call and
no Ghost call; hitting them would prove nothing about a schema.

*Real GitHub Actions (R-82) — the `rls` job is added to `.github/workflows/ci.yml` and runs the same one
command. Queried with `GITHUB_TOKEN` after the Dev push:*

| Check | Returned |
|---|---|
| run for `acc46ee10b6aae3d74020ead6d8a8b18ba37d5b0` | `CI` — status `completed`, conclusion **success** |
| its jobs | `check` **success** · `rls` **success** |

So the gate is green on a clean runner, not only on this machine. `pnpm check` is unaffected: ESLint lints
`.ts`/`.tsx`/`.js` only, and nothing this story adds is one.


## Review (2026-09-05)

**Every layer ran, the Real-infra verifier included (R-82). The story's central claim did not hold as
delivered and was fixed inside this story; everything else re-executed green.**

*The defect, proved by execution rather than by reading (standing rule 1):*

| Mutation | Before the fix | After the fix |
|---|---|---|
| a real cross-tenant hole — `create policy projects_hole on public.projects for insert to authenticated with check (true)` | **exit 0**, `NOTICE: PASS: cross-tenant project insert blocked (P0001)` | **exit 3**, `ERROR: FAIL: A inserted a project owned by B` |

Twenty-one assertions were written `<attack>; raise exception 'FAIL…'; exception when others then raise
notice 'PASS…'`. When the attack **succeeded**, the block's own `FAIL` was caught by its own `when others`
and reported as a PASS. This is exactly the F0 defect the file's INDEX row says it was rebuilt to remove
("it used to print FAIL and exit 0, which is why six holes survived three rounds"), reintroduced by the
handler idiom. Fixed in the design authority `RLS-TEST.sql` and re-copied: each of the 21 handlers now
re-raises its own sentinel (`if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;`) and is
otherwise unchanged, so every legitimate denial (42501 · 23505 · 23514) still reads PASS.

*Also fixed in the same pass, each against an acceptance criterion the delivered artifact did not meet:*

| Fix | Why |
|---|---|
| `run-rls-gate.sh` applies **every** `supabase/migrations/*.sql` in filename order, not one hardcoded name | at migration #2 the gate silently proved the 2026-09-04 catalogue instead of the repository's — AD-26's own failure mode, and CLAUDE.md's "derive, never assert membership" |
| sweep 1 covers `private` and partitioned tables; new AD-7 sweep asserts every `private` table is RLS-on-with-zero-policies, derived from the catalogue | the AC says "the whole catalogue rather than a subset"; every structural sweep filtered `nspname='public'`, so a fourth `private` table would inherit no assertion |
| new AD-6 sweep asserts the **hoisted** `( SELECT auth.uid())` form | the old test matched the substring `user_id`, so the bare `user_id = auth.uid()` — the per-row form AD-6 exists to prevent — passed |
| the `pgrst.db_schemas` check gained its `private` arm | `SCHEMA.sql` §0 and `ARCHITECTURE-SPINE.md` AD-7 both state "RLS-TEST.sql asserts that"; it asserted only `%storage%` |
| the proof no longer re-grants `suggestion_votes`/`suggestions_public` to `anon` | `SCHEMA.sql` §11 already grants both; the re-grant masked a dropped grant, against the file's own note two lines above it |
| `trap cleanup EXIT INT TERM`; the readiness loop reports `docker logs` instead of exiting 1 in silence; `timeout-minutes: 15` on the `rls` job | a cancelled run orphaned a container; a dead container gave 60s of nothing and a bare exit 1 |

*Controls (standing rule 2 — a result whose control did not pass is not a result):*

| Control | Expected | Got |
|---|---|---|
| the patched gate, clean | exit 0 | **exit 0**, 72 `PASS`, 0 `ERROR` (70 before the two new sweeps) |
| the cross-tenant hole, patched gate | non-zero | **exit 3** (it was exit 0 before the fix — the control that found the defect) |
| a second migration adding `public.gate_glob_probe` with RLS off | non-zero | **exit 3**, `FAIL: RLS is disabled on gate_glob_probe`; the pre-patch script never applied it at all |
| `cmp -s` on all three copies after the re-copy | identical | identical |

*Real infrastructure, re-executed independently for the review (read-only; keys named by variable, never printed):*

| Check | Returned |
|---|---|
| hosted Supabase over `SUPABASE_DB_URL` | 29 public base tables + `suggestions_public`; `private` = `billing_events`, `credential_audit`, `site_credentials`, each RLS on with **0** policies; **no** public table without RLS; 43 policies; both `auth.users` signup triggers; four buckets; every table the AC names; the three `routes_*` columns; `deploys.variant_manifest` `jsonb` |
| hosted table **set** vs. the migration's `create table` names | **identical** under `LC_ALL=C diff` — stronger than the counts Dev recorded, which could not tell "same 29" from "29" |
| `GET /rest/v1/` with `SUPABASE_SECRET_KEY` | HTTP 200, 30 relations, no `private` table exposed |
| Vercel `GET /v1/projects/{VERCEL_PROJECT}/env/{envId}` for both vars | HTTP 200, decrypted, compared in memory — **both match** `tools/probe/.env` |
| GitHub Actions | `acc46ee1` → run 33908002428 **success**; HEAD `a7490b37` → run 33908127990 **success**, `check` and `rls` both green |
| negative controls | a non-existent table → exit 1; a bare container → 0 tables not 29; a wrong REST key → 401; a wrong Vercel project → 404; an all-zero SHA → 0 runs |
| GitHub Actions for the review commit `cc355abf` | run 33910932923 **success** — `check` and `rls` both green, so the **patched** gate passes on a clean runner, not only on this machine |

**Reproducibility note the record needed:** the hosted database host is **IPv6-only**, so the `psql`
container needs `--network host`; on the default bridge it returns `Network unreachable`, which reads
like an outage and is not one.

*Still not touched, and why:* Resend, Dodo, T1/T3 — this story adds no email, no billing call and no Ghost call.

## Deploy (2026-09-05)

**Deployment: `dpl_HmwvgnzVR1Mr6exhqm7YEJ8Pm8MX`** — production, `readyState: READY`, built from
`da9a620c` (`inflozo-5bvivucbg-umangkagathara.vercel.app`). This story ships no app code; the
deployment is recorded because the push builds the production project either way.

*What "live" means for a schema story — the migration applied and `RLS-TEST.sql` green (build-sequence
step 7). Both re-confirmed at this commit, read-only, keys named by variable and never printed:*

| Check | Returned |
|---|---|
| hosted Supabase over `SUPABASE_DB_URL` | 29 public base tables · **no** public table without RLS · **no** `private` table carrying a policy (AD-7) · 43 policies over `public` · signup triggers `auth_user_entitlement` + `auth_user_profile` · buckets `assets`, `deploy-artifacts`, `site-snapshots`, `suggestion-images` |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0**, 72 `PASS`, 0 `ERROR` |
| the three production domains | `inflozo.com` **200** · `app.inflozo.com` **200** · `www.inflozo.com` **308** (redirect, as configured) |

The hosted project already carried this schema, so nothing was applied at Deploy — the migration is its
recorded home, and the checks above are the confirmation the phase asks for.

**No screen, so `owner_test: none` and the story goes straight to Done on this commit** (build-sequence
step 7). The three review rulings that outlived the story are carried by DW-7, DW-8 and DW-9.

## Questions for the owner

**1. Should a broken database lock be able to stop a release, or only report one?**

Right now the RLS check runs on GitHub *after* the code is already on `main`. So if a lock breaks, the
code is live first and the red light comes on second. Story 1.1 did the opposite for the code checks:
those run *during* the deploy, so a failure stops the release.

*Example:* someone changes a table next month and accidentally removes the lock that stops one customer
reading another's site. Today: it pushes, it goes live, GitHub turns red a few minutes later, and the
hole is live until someone notices. With option 1: the deploy refuses to publish and nothing goes live.

1. **Make the database check block the release too, like the code checks (RECOMMENDED)** — the strongest
   protection, and it makes the two checks behave the same way, which is one less thing to remember. It
   adds roughly a minute to each deploy.
2. Also run the drift check (not the full database check) before each commit — very fast, catches a
   copy that no longer matches the architecture, but does not catch a broken lock.
3. Leave it as it is — the red light on GitHub is enough, and we rely on noticing it.

**Ruled (owner, 2026-09-05): option 1 — the database check blocks the release too.** Logged as DW-7.
The mechanism in option 1's description was wrong and is corrected here rather than quietly: the code
checks block because they run *inside* the Vercel build (`apps/web/vercel.json`'s `buildCommand`), and
the database gate cannot join them there — Vercel's build image is Amazon Linux 2023 with `dnf` and no
Docker daemon (Vercel, *Build image overview*, read 2026-09-05), while the gate starts a `postgres:17`
container. Vercel's own documented way to gate a release is to stop deploying on push and deploy from
GitHub Actions instead (*Deploying GitHub Projects with Vercel* → "Using GitHub Actions"). That changes
how every production deploy is triggered — Story 1.1's deliverable, and a setting inside the owner's
Vercel project — so it is not a review patch. It is DW-7 and question 4 below.

**2. Where does the *next* database change come from?**

Today's file `supabase/migrations/20260904120000_complete_schema.sql` is an exact copy of the
architecture's `SCHEMA.sql`, and the gate refuses to run if the two ever differ. That works for one
file. It does not say what happens for the second one.

*Example:* in a few weeks a story adds a "scheduled posts" table. Do we (a) edit the architecture's
`SCHEMA.sql`, re-copy it over today's migration file and re-run everything, or (b) leave today's file
frozen forever and add a small second file that only adds the new table?

1. **(b) — today's file is frozen; every change is a new small file (RECOMMENDED)** — this is what the
   architecture already says migrations are, it is how the hosted database will actually be updated, and
   the gate now applies every file in the folder in order, so it is already supported. The architecture's
   `SCHEMA.sql` stays the readable picture of the whole database.
2. (a) — keep one file that is always the whole database, re-copied each time. Simpler to read, but it
   means editing a file that has already been run against the live database, which the architecture
   forbids.
3. Decide later, when the second change actually arrives.

**Ruled (owner, 2026-09-05): option b — today's migration file is frozen; every later change is a new
small file.** Already supported: the gate applies every `supabase/migrations/*.sql` in filename order,
proved by a control (a second migration adding an RLS-off table turns it red). One consequence follows
and is logged as DW-8: the gate currently asserts today's migration is *byte-identical* to the
architecture's `SCHEMA.sql`. Under this ruling `SCHEMA.sql` keeps growing into "the readable picture of
the whole database" while the migration stays frozen, so the day `SCHEMA.sql` first changes that check
fires `DRIFT` when nothing is wrong. The check that survives the ruling compares the *resulting schema*
of all migrations against `SCHEMA.sql`, not the bytes of one file.

**3. Four test users are sitting in the live database. Leave them or clear them?**

Building the proof created four fake users (and their 2 projects, 2 sites, 1 uploaded file). They are
still in the real database — verified today: 4 users, 4 profiles, 2 projects, 2 sites, 1 stored object.
They are harmless and invisible to customers, but they are not real people.

*Example:* the first time you look at a "how many users do we have" number, it will say 4 before a single
real person has signed up.

1. **Clear them before launch, not now (RECOMMENDED)** — they cost nothing today, and removing rows from
   the live database is worth doing once, deliberately, with a written-down step, rather than as a side
   effect of a code review.
2. Clear them now — I would rather the live database be empty from here on.
3. Leave them permanently as a smoke-test fixture.

**Ruled (owner, 2026-09-05): option 1 — clear them before launch, not now.** Logged as DW-9, which
carries the trigger (before the first real signup) so it cannot be lost.

**4. Your "block the release" ruling needs one more choice from you, because it touches your Vercel
project — which of these two ways?**

Both give you what you asked for: a broken database lock stops the release. They differ in what changes.

*Example:* the lock that stops one customer reading another's site gets broken. Way 1: the release
simply never publishes, and the site keeps serving yesterday's working version. Way 2: the same, but
the publish waits for the check to finish first, so each deploy takes a couple of minutes longer.

1. **Move publishing into GitHub, so it only publishes after both checks pass (RECOMMENDED)** — this is
   the method Vercel documents for exactly this. You would turn off "deploy on every push" in your
   Vercel project once, and afterwards nothing changes for you day to day: you push, the checks run,
   and it publishes only if they are green. It is the sturdier of the two because the publish never
   starts until the checks have finished.
2. Keep publishing as it is, and make the build ask GitHub whether the database check passed before it
   finishes — no Vercel setting to change, but every publish now waits on GitHub, so a slow or unhappy
   GitHub delays or fails a deploy that is otherwise fine.
3. Not yet — leave it as it is until after launch.

**Ruled (owner, 2026-09-05): option 1 — publishing moves into GitHub and only runs after both checks
pass.** DW-7 carries the mechanism and the order of operations. It is a story of its own, not a patch
inside this one: it changes how every production deploy is triggered, and R-80 wants the owner's test
on it. One consequence to know before it is built — the Vercel deploy token has to be stored as a
GitHub Actions secret, so that credential will live in two places instead of one.
