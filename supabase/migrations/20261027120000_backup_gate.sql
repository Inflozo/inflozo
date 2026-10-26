-- Story 7.20a — the first deploy's backup gate, the host it is drawn for, and the stage that archives the live theme.
--
-- F7 (BACKUP-GATE.md, D1d/D1d′/D1e) asks the customer to confirm their own backup at a site's first deploy, ONCE PER SITE,
-- and again after a disconnect and reconnect. A reconnect re-adopts the site record and keeps its bindings, so neither the
-- bindings nor the deploys can say "owed": `sites.backup_confirmed_at` is that record, null meaning owed, and
-- `disconnectSite` sets it back to null. It is a consent gate, not a technical control (AD-29): nothing refuses a deploy on it.
--
-- `sites.hosted_by_ghost` is which gate is drawn: Ghost(Pro) (D1e) when Ghost's public config carries `hostSettings`,
-- self-hosted (D1d) when it does not, and null — not yet probed — which draws both paths. `probeSite` writes it.
--
-- `job_stage` gains `snapshotting`, BEFORE `uploading`: FR-J13's archive of the live theme at a site's first upload runs as
-- its own stage so B12a's Cancel stays live until the upload begins. The tenant's cancel policy is keyed by stage, so it
-- gains `snapshotting` too — in the SECOND file, because PostgreSQL refuses a new enum value's use inside the transaction
-- that adds it (`20261027120100_snapshot_cancel.sql`).
--
-- NO NEW GRANT, deliberately, as for 7.19's `staff_token_declined_at`: `authenticated` keeps its table-wide select (the
-- editor's read draws the gate from the tenant's own row) and its column-limited update (title, favicon_url, updated_at)
-- gains neither column — only the server writes them, with the service role (`confirmBackup`, `probeSite`, `disconnectSite`).
--
-- Pushed ALONE, before the code that reads them (R-99): nothing in CI runs a migration.
-- RE-RUNNABLE: `add value if not exists` and `add column if not exists`; `comment on` replaces.

alter type public.job_stage add value if not exists 'snapshotting' before 'uploading';

alter table public.sites
  add column if not exists backup_confirmed_at timestamptz,
  add column if not exists hosted_by_ghost boolean;

comment on column public.sites.backup_confirmed_at is
  'When the customer confirmed their own backup on the first-deploy Backup step (Story 7.20a, FR-J13, F7: once per site, re-shown after a reconnect). Null = owed; disconnectSite sets it back to null. A consent gate, not a technical control (AD-29). Written only by the server.';
comment on column public.sites.hosted_by_ghost is
  'Whether Ghost''s public config for this site carries hostSettings (Story 7.20a): true = Ghost(Pro), the D1e gate; false = self-hosted, D1d; null = not yet probed, both paths offered. Written only by probeSite.';
