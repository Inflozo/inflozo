-- Story 7.20b — the snapshot orphan purge's notice record (FR-C6, AD-33, R-285), and DW-390's corrected note.
--
-- FR-C6 deletes a disconnected site's saved original theme on its date, after ONE email two weeks before it (R-285). The
-- date is derived from `sites.disconnected_at` and `ORPHAN_SNAPSHOT_DAYS` in TypeScript (`lib/orphan-rule.ts`), never
-- written here: `site_snapshots.purge_after` stays FR-A5's 14-day clock alone (DW-43). What the job must remember is the
-- one thing it cannot derive — WHEN the notice went out — so it never sends twice and never deletes before the notice's
-- full window. `orphan_notice_at` is that record. A notice older than the site's latest `disconnected_at` belongs to an
-- earlier disconnect and no longer counts, so a reconnect needs no reset. It is not `download_offered_at`, which
-- `request_account_deletion()` stamps for FR-A5: one column, one meaning (DW-43's lesson).
--
-- DW-390: since R-283 every host draws the same Backup card, so `sites.hosted_by_ghost` names the Backup step's sub line
-- alone. 7.20a's applied comment still describes two gates and "both paths"; this replaces it. The migration that wrote it
-- is applied and stays as written.
--
-- NO NEW GRANT, deliberately: `authenticated` has a table-wide SELECT on `site_snapshots` and no write at all, so the new
-- column is readable to its tenant (RLS's `site_snapshots_owner_read`) and unwritable with nothing added. Only the purge
-- job writes it, with the service role.
--
-- Pushed ALONE, before the code that reads it (R-99): nothing in CI runs a migration.
-- RE-RUNNABLE: `add column if not exists`; `comment on` replaces.

alter table public.site_snapshots add column if not exists orphan_notice_at timestamptz;

comment on column public.site_snapshots.orphan_notice_at is
  'When FR-C6''s orphan notice (Story 7.20b, R-285: one email two weeks before the deletion) was last sent for this original theme. Compared against sites.disconnected_at: a notice older than the latest disconnect no longer counts. Null = never sent. Written only by the purge job (purge-snapshots).';
comment on column public.sites.hosted_by_ghost is
  'Whether Ghost''s public config for this site carries hostSettings (Story 7.20a): true = Ghost(Pro), false = self-hosted. Since R-283 every host draws the same Backup card, and this names the Backup step''s sub line alone. null = not yet probed. Written only by probeSite.';
