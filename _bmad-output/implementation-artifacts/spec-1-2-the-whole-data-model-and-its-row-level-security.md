---
title: 'Story 1.2 — The whole data model and its row-level security'
type: 'feature'
created: '2026-09-04'
status: 'ready-for-dev'
review_loop_iteration: 0
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
- `tools/probe/.env` (never printed) -- `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_URL` for the app's project; the Vercel project also holds `SUPABASE_URL`/`SUPABASE_SECRET_KEY` as Sensitive env vars whose values the API will not return, so Dev confirms project identity by result, not by reading the value.

## Tasks & Acceptance

**Execution:**
- [ ] `supabase/migrations/20260904120000_complete_schema.sql` -- byte-identical copy of the architecture's `SCHEMA.sql` -- AD-26's operational home for the whole model; the schema is proven, not re-authored
- [ ] `supabase/tests/rls.sql` -- byte-identical copy of `RLS-TEST.sql` -- the spine's Structural Seed names this exact path; E1's exit gate
- [ ] `supabase/tests/prelude.sql` -- byte-identical copy of `PRELUDE.sql` -- container stand-ins so the gate runs on a bare container; never hosted
- [ ] `supabase/tests/run-rls-gate.sh` -- start `postgres:17-alpine`, `cmp -s` each `supabase/` file against its architecture original (drift exits non-zero -- standing rule 7), then `psql -v ON_ERROR_STOP=1 -f prelude.sql -f <migration> -f rls.sql`; the run's exit is the gate. One mechanism for laptop and CI (both have docker)
- [ ] `.github/workflows/ci.yml` -- add an `rls` job on push to `main`: `bash supabase/tests/run-rls-gate.sh`; a non-zero exit fails the workflow (AD-26: CI keys on the exit code)
- [ ] Real Supabase (R-82) -- confirm the project the deployed app reads (Vercel `SUPABASE_URL`) carries this schema: every §5 table, the `private` schema, the two signup triggers, four buckets; apply the migration there if it does not. Keys read only into a command's environment, recorded by variable name

**Acceptance Criteria:**
- Given a fresh `postgres:17` container, when `bash supabase/tests/run-rls-gate.sh` runs, then it exits 0 with zero SQL errors; and when any single assertion's fix in `supabase/tests/rls.sql` is reverted, then the gate exits non-zero (it is a gate, not a report -- AD-26).
- Given the `supabase/` copies, when each is compared byte-for-byte to its architecture original, then they are identical, and the gate refuses to run if they are not.
- Given the applied schema, when RLS-TEST's structural blocks run, then every RLS-protected table carries `user_id` and the AD-6 policy shape, every server-only table has RLS on with zero policies in the `private` schema (AD-7), every immutable column is frozen by trigger (AD-9), and RLS is asserted over the whole catalogue rather than a subset.
- Given the app's real Supabase project, when its schema is inspected on the real infrastructure (R-82), then it carries every table §5 implies -- explicitly `notifications`, `edit_locks`, `entitlements`, `deploy_jobs`, `asset_usages`, `site_snapshots`, `project_site_bindings`, the theme-settings definitions, translation overrides, the export record, routes state on `sites`, and the per-deploy variant manifest.
- Given a push to `main`, when CI runs, then the `rls` job is green, and a schema change that breaks a policy turns it red.

## Design Notes

**Why copy-and-guard rather than move.** The architecture's three SQL files are the design authority and are cited by `record` documents by path, which standing rule 5 forbids editing — so they cannot move. The spine names `supabase/migrations/` and `supabase/tests/rls.sql` as real files that must exist. The reconciliation is the repo's established pattern (`ux-designs/prototype/build.py` asserts every lifted region byte-identical to its source): the `supabase/` files are copies, and `cmp -s` in the gate is the standing-rule-7 audit that keeps them from drifting. A future schema change edits the authority and re-copies; the gate catches a stale copy.

**No Supabase CLI here** (`supabase` is not installed). "Apply the migration" means run the SQL through `psql`: against an ephemeral `postgres:17` container for the repeatable gate, and once against the hosted project (already done and recorded in §16a). The destructive fixture in `rls.sql` therefore runs against throwaway containers, never repeatedly against the production database.

**Two Supabase projects, one to confirm.** `tools/probe/.env` points at the project the schema was proven on. The Vercel project stores `SUPABASE_URL`/`SUPABASE_SECRET_KEY` as Sensitive env vars whose values the API will not decrypt, so Dev confirms — on the real infrastructure — that the app reads the schema-bearing project, and reconciles if not. This is a verification, not a decision.

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

**To run at Dev/Review:**
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0.
- Revert one fix in `supabase/tests/rls.sql`, re-run -- expected: non-zero exit (mutation property, AD-26 §21n). Restore.
- Introduce a one-byte change in `supabase/migrations/<file>` -- expected: the gate's `cmp -s` refuses to run, non-zero. Restore.
