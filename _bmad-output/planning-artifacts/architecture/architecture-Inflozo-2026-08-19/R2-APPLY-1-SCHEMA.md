---
title: Apply Round 2 decisions — the SQL batch
type: implementation prompt, self-contained
covers: R2-1, R2-3, R2-4, R2-11 (and clears Round 1 decisions 3, 13, 14, 15, 16)
run: FIRST — this batch has an external deadline
created: 2026-08-19
---

# Apply the Round 2 SQL batch

You are changing two files: `SCHEMA.sql` and `PRELUDE.sql`. Everything you need is in this prompt.
**Read it whole before you start.** Do not go looking for the Round 2 report — its conclusions are quoted here.

Base path: `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/`

| File | Role |
|---|---|
| `SCHEMA.sql` | the schema you are editing |
| `PRELUDE.sql` | the Supabase stand-in you are correcting |
| `RLS-TEST.sql` | the runnable proof — your acceptance test |
| `ARCHITECTURE-SPINE.md` | AD-6, AD-7, AD-9, AD-26, AD-31, AD-32 — read only these ADs |
| `ROUND-2-DECISIONS.md` | the decision record this prompt implements |

**This directory is not a git repository.** Copy both files to `*.bak` before your first edit.

## The one rule that governs this project

A claim about an external platform is a hypothesis until read in that platform's source or executed
against it. Five such claims have entered this project as normative text and been verified false.
**Cite or execute. Never assert.** This batch exists because that rule was broken inside the test
harness itself.

---

## Why this batch is urgent

Supabase is removing automatic exposure of new `public` tables to `anon` and `authenticated`:
optional from **2026-04-28**, the default for all new projects from **2026-05-30**, and **enforced on
existing projects from 2026-10-30**. Source: Supabase changelog "Tables not exposed to Data and
GraphQL API automatically" (discussion 45329). Today's project therefore already has the new
behaviour, and the existing one loses the old behaviour on that date.

`SCHEMA.sql` §11 narrows privileges by **revoke-then-grant**, a pattern that assumes a broad grant
already exists to narrow. It issues explicit grants on only seven relations, and those are
*column-level UPDATE*. Every `SELECT`, `INSERT` and `DELETE` the product performs currently relies on
the Supabase default that is going away.

**Executed 2026-08-19.** With the automatic grant removed from `PRELUDE.sql`, `SCHEMA.sql` applied
with **0 errors** and left **29 of 30 public tables with no table-level privilege for
`authenticated`** — including `projects`, `sites`, `profiles`, `project_templates`, `deploys`,
`assets`, `edit_locks` and `entitlements`. `RLS-TEST.sql` then aborted in its fixture block with
**0 assertions run** and `ERROR: permission denied for table sites`.

This lands on **AD-26**, which provisions a *fresh* Supabase project for Live at go-live. That fresh
project gets the new default while Test still has the old one — so Test passes and Live is dead,
which is the exact failure AD-26 was written to prevent, arriving through a door it does not guard.

---

## What to change

### R2-3 — correct `PRELUDE.sql` (do this first; it changes what your tests prove)

`PRELUDE.sql` currently declares:

```sql
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
```

with the comment *"Supabase grants these by default to every table in `public`."* That is wrong in
two ways and both matter.

1. Supabase's documented default is **SELECT, INSERT, UPDATE, DELETE** — not `all`. `grant all`
   additionally hands `authenticated` **TRUNCATE**, and **TRUNCATE is not subject to RLS**. Executed
   against the current prelude, an ordinary `authenticated` user with a valid JWT truncated
   `site_credentials` and `billing_events` (both AD-7 server-only, both correctly denying
   SELECT/INSERT/UPDATE/DELETE) and cascaded `projects` to 16 further tables.
   **This is not claimed to be live in production** — real Supabase does not grant TRUNCATE. The
   defect is that normative test infrastructure states an uncited external fact, and states it wrong.
2. That default is being removed anyway (above).

**Change `PRELUDE.sql` to model the NEW default**: no automatic grant on `public` tables at all.
Put the citation and its capture date in the comment beside it, per AD-23. Keep the `storage` and
`auth` stand-ins as they are — the changelog states `storage`, `auth` and `realtime` are unaffected.

The point of modelling the *new* default is that `PRELUDE.sql` then proves R2-1 for free: if the
schema works against it, the schema works after 30 October.

### R2-1 — `SCHEMA.sql` grants in, never out

Add an explicit **table-level** `GRANT` for every table, stating the privileges that table's clients
actually need. Do not blanket-grant. The shape per table is the one §11 already uses for
`suggestions`: grant what is needed, then narrow columns where AD-31 requires it.

Constraints that must survive, all currently asserted by `RLS-TEST.sql`:

- **AD-8 select-only tables** get `SELECT` and nothing else: `deploys`, `exports`,
  `project_site_bindings`, `deployed_template_names`, `asset_usages`, `subscriptions`,
  `entitlements`. `deploy_jobs` gets `SELECT` plus column-level `UPDATE (cancel_requested)`.
  `template_binding_checklist` gets `SELECT` plus column-level `UPDATE (marked_done_at)`.
- **AD-7 server-only tables** get **nothing**: `site_credentials`, `billing_events`, `feature_flags`.
  RLS-on-with-no-policy stays, but it is no longer the only thing standing between a client and the
  table — which is the improvement.
- **AD-31 column-narrowed tables** keep their existing revoke-then-grant column lists exactly:
  `sites`, `projects`, `custom_settings`, `deploy_jobs`, `template_binding_checklist`, `suggestions`.
  Note the revoke half becomes a no-op once nothing is granted broadly; keep it anyway, or replace it
  with a comment saying why it is gone. Do not silently delete it.
- Never grant `TRUNCATE`, `REFERENCES` or `TRIGGER` to `anon` or `authenticated` on anything.

### R2-4 — take Round 1's open rider

Add to `SCHEMA.sql`:

```sql
alter default privileges in schema public
  revoke all on tables, sequences, functions from anon, authenticated;
```

so every future object grants **in** rather than out. This is the root-cause fix for the whole family
of findings in R2-11 below, and it is the same direction the platform is moving.

### R2-11 — clear Round 1's approved-but-unapplied decisions

All five were re-executed on 2026-08-19 and all five are still open in the shipped schema.

| R1 # | Change | Verified still open |
|---|---|---|
| 3 | `suggestions_public` → `security_invoker = true`, and revoke write grants through the view | `reloptions` is null; `authenticated` holds INSERT/UPDATE/DELETE **and TRUNCATE** on the view |
| 13 | Column-lock `edit_locks`, `profiles`, `assets` by revoke-then-grant; add the `lock_generation` monotonic trigger AD-31 already promises | `edit_locks` has **zero** non-internal triggers; all 12 columns are client-updatable |
| 14 | Create the `entitlements` row at signup via a trigger on `auth.users` | zero non-internal triggers on `auth.users` |
| 15 | Add the settings-snapshot column to `deploys` | 18 columns, none matching `%setting%` or `%snapshot%` |
| 16 | Extend the custom-template rename guard to UPDATE; remove browser EXECUTE on `sync_vote_count` | guard is `BEFORE INSERT` only |

**One correction to Round 1's wording, found in Round 2.** `sync_vote_count` has a *null ACL*, which
means `EXECUTE` to **PUBLIC** — not merely to `authenticated`. So do all the guard trigger functions
(`freeze_columns`, `guard_revision`, `guard_slug`, `guard_custom_template_name`,
`enforce_custom_setting_cap`, `touch_updated_at`) and all 30-odd `pgcrypto` functions, because
pgcrypto is installed into `public`. Revoke `EXECUTE` from `PUBLIC` on the project's own functions and
grant it back only where a client genuinely calls it. Consider moving `pgcrypto` to its own schema;
if you do not, say why in a comment.

---

## Acceptance — you must execute this, not reason about it

```bash
docker run -d --name izpg -e POSTGRES_PASSWORD=x -p 55432:5432 postgres:17-alpine
docker exec izpg psql -U postgres -c "create database iz"
docker exec -i izpg psql -U postgres -d iz -v ON_ERROR_STOP=1 -q < PRELUDE.sql
docker exec -i izpg psql -U postgres -d iz -v ON_ERROR_STOP=1 -q < SCHEMA.sql
docker exec -i izpg psql -U postgres -d iz -q < RLS-TEST.sql
```

**Pass conditions, all of them:**

1. `PRELUDE.sql` and `SCHEMA.sql` apply with zero errors.
2. `RLS-TEST.sql` runs **every** assertion — count the `PASS:` lines and confirm none are missing.
   Round 1's baseline is **23 assertions**; your changes add more, so the number should go up, never
   down. **Zero passes is a failure, not a pass** — that is exactly how the current schema fails.
3. This query returns **zero rows**:
   ```sql
   select t.tablename from pg_tables t where t.schemaname='public'
    and t.tablename not in ('site_credentials','billing_events','feature_flags')
    and not exists (select 1 from information_schema.role_table_grants g
                    where g.table_schema='public' and g.table_name=t.tablename
                      and g.grantee='authenticated');
   ```
4. This query returns **zero rows** — no TRUNCATE anywhere:
   ```sql
   select table_name, grantee from information_schema.role_table_grants
    where grantee in ('anon','authenticated') and privilege_type in ('TRUNCATE','REFERENCES','TRIGGER');
   ```
5. Add new assertions to `RLS-TEST.sql` for each of R2-11's five items and for condition 4, so the
   next round re-runs them as regressions rather than rediscovering them.

Tear down with `docker rm -f izpg` when done.

## Do not

- Do not touch `ARCHITECTURE-SPINE.md` — a separate session (`R2-APPLY-2-SPINE.md`) owns it.
- Do not touch `MEASUREMENTS.md`. Round 1 decision 24 says the spine quotes it verbatim; if your work
  changes a number in it, report that rather than editing it here.
- Do not re-litigate any decision in `ROUND-2-DECISIONS.md`. If you find one **wrong on new
  evidence**, stop and say so — that is in scope and valuable. Re-arguing one is not.
- Do not weaken an AD to make a test pass.

## Report

What you changed, the acceptance output pasted verbatim, the new assertion count against the old, and
anything you found that this prompt did not predict.
