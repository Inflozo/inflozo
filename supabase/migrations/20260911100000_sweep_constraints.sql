-- Story 3.9 — four constraints the deferred-work ledger asked for, one hand-application.
--
-- FOUR STATEMENTS, ONE MIGRATION, and they are unrelated to each other on purpose: each is named
-- exactly by its own ledger entry, each makes a sentence that already existed STRUCTURAL, and none
-- of them needs the others. They travel together because a hand-applied migration is a chore with a
-- fixed cost (R-99: the operator applies it through `SUPABASE_DB_POOLER_URL` before the code that
-- needs it is pushed), not because they share a subject.
--
-- READ AGAINST PRODUCTION BEFORE IT WAS WRITTEN (2026-09-11, through `SUPABASE_DB_POOLER_URL`):
-- no `(user_id, slug)` duplicated in `public.projects`; no `linked_site_id` carried by two rows;
-- every one of the 2,605 `private.credential_audit` rows already inside `('ok','denied','error')`;
-- no non-null `entitlements.restored_by`. So all four are added VALID, not `not valid` — a
-- constraint that would have failed on live data was to stop the run and become a question for the
-- owner, and none of them did.
--
-- EVERY STATEMENT IS RE-RUNNABLE, for the reason 20260909180000 wrote down and this file inherits:
-- the direct host is IPv6-only, so this is applied BY HAND through the pooler, and a hand-apply is
-- exactly the kind that gets retried — after a dropped connection, or when the operator is not sure
-- the first one landed. Without the guards a retry aborts on `duplicate_object` and the operator
-- cannot tell "already applied" from "failed". `add constraint` has no `if not exists` form in
-- PostgreSQL, so the two that need one are wrapped in a `do $$ … exception when duplicate_object $$`
-- block; a unique CONSTRAINT also raises `duplicate_table` for the index it owns, so (1) catches
-- both. The other two are already idempotent by shape.
--
-- The 2026-09-04 migration is FROZEN (DW-8) — it has been applied to the live database — so this is
-- a new file and not an edit to that one.

-- (1) DW-24 — `projects.slug` is a read-then-write with no backstop.
--     FR-J10 makes the slug the theme's name and correctly keeps `slug` out of the update grant, so
--     a collision can never be repaired by a rename either: `uniqueSlug` reads the taken slugs and
--     then inserts, and the window is the milliseconds between the two. This is the backstop, and
--     `createProject`/`duplicateProject` catch `23505` on it and retry (the Dev phase's code).
--     Scoped to the OWNER, not global: two customers may each have a `blog`, and FR-J10's theme
--     name is only ever emitted within one account's deploy.
do $$ begin
  alter table public.projects
    add constraint projects_user_id_slug_key unique (user_id, slug);
exception when duplicate_table or duplicate_object then null; end $$;

-- (2) DW-69 — FR-B5's "at most one" was a column comment, not a constraint.
--     `linked_site_id` carried a PLAIN index, so two "Use your brand" presses in flight together
--     could both read "no project yet" and both write one. The application's idempotence is real
--     and is proved live (`brand-rerun`, `brand-picker`); this is the structural floor under it.
--     REPLACES the plain index rather than joining it — a unique index serves every read the plain
--     one served, and two indexes on one column is a second thing to keep in step.
--     Partial, because `null` is the ordinary state of a project that was never brand-linked and
--     PostgreSQL would treat every such row as distinct anyway; `where linked_site_id is not null`
--     says so rather than relying on it.
create unique index if not exists projects_linked_site_id_key
  on public.projects (linked_site_id) where linked_site_id is not null;
drop index if exists public.projects_linked_site_id_idx;

-- (3) DW-53 — the audit log's `outcome` accepted any text.
--     `action` is an enum; `outcome` held its three values in a COMMENT, with the TypeScript union
--     in `server/ghost-admin/index.ts` as the only guard. A guard that lives in the caller is not a
--     guard on the table.
do $$ begin
  alter table private.credential_audit
    add constraint credential_audit_outcome_check check (outcome in ('ok','denied','error'));
exception when duplicate_object then null; end $$;

-- (4) DW-45 — the one bare `references auth.users(id)` in the schema.
--     Every other user reference cascades or set-nulls; this one refuses the delete, so purging a
--     user named in `restored_by` answers `23503` and `/api/cron/purge-accounts` logs a refusal and
--     returns 500 EVERY DAY until someone acts. E12's dispute-restore path is the only writer and
--     it does not exist yet, so the column is empty (read above) — which is why this is cheaper and
--     less risky now than it will be with rows in it. `set null` is what the entry names: the
--     entitlement record survives, the name of the staff account that restored it does not.
alter table public.entitlements
  drop constraint if exists entitlements_restored_by_fkey;
alter table public.entitlements
  add constraint entitlements_restored_by_fkey
  foreign key (restored_by) references auth.users(id) on delete set null;
