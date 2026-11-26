-- Story 7.23b — `site_snapshots.theme_version`: the saved original theme's version, for History's original-theme row.
--
-- D2a draws the original as its name AND version (`casper 5.9.4`). The capture already reads the active theme's
-- `package.json` version (`server/snapshot.ts`); this column keeps it, so History never has to open a stored zip to draw a
-- row. Null on every snapshot captured before Story 7.23b (the version was never stored, so there is nothing to backfill)
-- and when the theme declares none — History then draws the name alone.
--
-- NO NEW GRANT, deliberately, as for 7.20b's `orphan_notice_at`: `authenticated` has a table-wide SELECT on
-- `site_snapshots` and no write at all, so the column is readable to its tenant (RLS's `site_snapshots_owner_read`) and
-- unwritable with nothing added. Only the capture writes it, with the service role.
--
-- Pushed ALONE, before the code that writes it (R-99): nothing in CI runs a migration.
-- RE-RUNNABLE: `add column if not exists`; `comment on` replaces.

alter table public.site_snapshots add column if not exists theme_version text;

comment on column public.site_snapshots.theme_version is
  'The saved original theme''s package.json version at capture (Story 7.23b): drawn beside theme_name on History''s original-theme row (D2a). Null before Story 7.23b, or when the theme declares none. Written only by the capture (captureSnapshot); select-only to the client.';

notify pgrst, 'reload schema';
