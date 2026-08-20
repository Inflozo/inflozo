-- ============================================================================
-- Inflozo — reset the PROBE Supabase project, for the SQL editor
-- ============================================================================
--
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- It runs as `postgres`, which is what this needs.
--
-- ⚠️ THIS IS IRREVERSIBLE AND DELETES EVERYTHING IN THE PROJECT.
--    Only run it against the disposable probe project. Inventory taken 2026-08-20:
--      auth.users 6 · public tables 30 · storage buckets 4 · storage objects 1
--      41 rows total, all probe fixtures (2 test projects, 2 test suggestions, 6 test users)
--
-- ── DO THIS FIRST, IN THE DASHBOARD, NOT HERE ───────────────────────────────
--    Storage → open each bucket → delete any files (there was 1).
--    A Postgres cascade deletes the storage.objects ROW and leaves the BYTES, still billed and
--    still counted against quota. That is the exact trap AD-32 exists for, and falling into it on
--    our own reset would be embarrassing. Two clicks in the UI does it properly.
--
-- ── THEN run this script, and afterwards run these two, in this order ───────
--    1) SCHEMA.sql       (architecture-Inflozo-2026-08-19/SCHEMA.sql)
--    2) RLS-TEST.sql     (architecture-Inflozo-2026-08-19/RLS-TEST.sql)
--    RLS-TEST is a GATE now: it either finishes clean or it raises. If it raises, stop and paste
--    me the error rather than continuing — that is the harness doing its job.
--    Do NOT run PRELUDE.sql against hosted: its auth.uid() stub would overwrite Supabase's own
--    with one that returns NULL, silently disabling every policy while the proof still said PASS.
-- ============================================================================

-- 1. Buckets. Objects must already be gone via the dashboard (see above).
delete from storage.buckets
 where id in ('assets','deploy-artifacts','site-snapshots','suggestion-images');

-- 2. Accounts. This cascades into profiles, entitlements and everything owned by them.
delete from auth.users;

-- 3. The schemas this project owns. `private` is new in Round 4 and holds the Vault references,
--    the billing payloads and the credential audit log; it may not exist yet, hence IF EXISTS.
drop schema if exists private cascade;
drop schema public cascade;
create schema public;

-- 4. Hand `public` back in the state Supabase expects to find it.
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres;

-- 5. Model the post-2026-05-30 grant default explicitly rather than trusting the project's age.
--    Supabase stopped exposing new public tables to anon/authenticated automatically — optional
--    from 2026-04-28, default for new projects 2026-05-30, ENFORCED on existing projects on
--    2026-10-30. SCHEMA.sql §0a sets this too; doing it here as well means the reset lands in the
--    same state whichever side of that cutover this project was created on.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- 6. Confirm the ground is clear before the schema goes back on.
select 'public tables (expect 0)'  as check, count(*)::text as n from pg_tables where schemaname = 'public'
union all
select 'auth users (expect 0)',      count(*)::text from auth.users
union all
select 'storage buckets (expect 0)', count(*)::text from storage.buckets
union all
select 'storage objects — if this is NOT 0, delete the files in the dashboard first',
                                     count(*)::text from storage.objects;
