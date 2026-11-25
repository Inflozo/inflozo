-- Story 7.23a — `deploys.accepted_at`: when Ghost last accepted this artefact's files.
--
-- A version's place in the History list, in retention ("newest") and as the drift baseline (R-287: the newest upload Ghost
-- accepted) is the moment Ghost last TOOK its files — not when its checks ran. Ordering by `created_at` (the Pre-flight's
-- time) let a version checked before a re-link and shipped after one be pruned the moment Ghost accepted it (DW-400), and
-- would never make an upload of an OLDER stored version (a Roll back) the baseline.
--
-- Written by the server alone: by `ship()` whenever Ghost accepts an upload, and by a Roll back's accepted upload (a Roll
-- back updates the version's own row; it never inserts, copies or deletes one). A Re-activate sends no upload and leaves it.
-- Null on a row Ghost never accepted (checks, failures, cancelled).
--
-- NO NEW GRANT, as for 7.18b's `preflight`: `authenticated` holds a table-wide SELECT on `deploys` (RLS scoping the rows to
-- its own) and no INSERT or UPDATE on it at all (AD-8); the service role's full CRUD comes from the frozen migration.
--
-- The backfill gives every row Ghost accepted before this story its best known time: when it went live, else when it was
-- made. Rows that are neither `uploaded` nor `live` stay null.
--
-- Pushed ALONE, before the code that writes it (R-99): nothing in CI runs a migration.
-- RE-RUNNABLE: `add column if not exists`; the backfill touches only null rows; `comment on` replaces.

alter table public.deploys add column if not exists accepted_at timestamptz;

update public.deploys set accepted_at = coalesce(activated_at, created_at)
 where accepted_at is null and status in ('uploaded', 'live');

comment on column public.deploys.accepted_at is
  'When Ghost last accepted this artefact''s files (Story 7.23a): written by the server when Ghost accepts a Ship it''s upload or a Roll back''s re-upload. Orders the History list, retention''s newest (DW-400) and the drift baseline (R-287: the newest upload Ghost accepted). Null on a row Ghost never accepted; select-only to the client (AD-8).';

notify pgrst, 'reload schema';
