-- ============================================================================
-- Inflozo — reset the PROBE Supabase project, for the SQL editor
-- ============================================================================
--
-- Run in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- ⚠️ IRREVERSIBLE. Only against the disposable probe project.
--
-- ── v2, 2026-08-20 — the first version failed, and the reason is worth knowing ──
--
--     ERROR: 42501: Direct deletion from storage tables is not allowed.
--            Use the Storage API instead.
--     CONTEXT: PL/pgSQL function storage.protect_delete()
--
-- Supabase now ships `protect_buckets_delete` and `protect_objects_delete` triggers that refuse
-- DELETE on the storage tables **even to `postgres`** — exactly the "a row delete orphans the
-- bytes" trap AD-32 is written about, enforced by the platform. Good behaviour by them.
--
-- So this script no longer deletes buckets at all, and it does not need to:
--   * the FILES are removed in the dashboard (step 0 below — you have already done this)
--   * the BUCKET ROWS can stay. SCHEMA.sql §12 inserts them `on conflict (id) do nothing`, so a
--     re-apply is happy to find them already there, `public = false`, which is what they are.
--   * only the storage POLICIES have to go, because `create policy` fails if one already exists.
--     DROP POLICY is not a DELETE, so the guard does not block it.
--
-- ── STEP 0 — in the dashboard, not here.  ✅ ALREADY DONE, verified 2026-08-20 ──
--    Storage → each bucket → delete all files.
--    Verified: assets 0 · deploy-artifacts 0 · site-snapshots 0 · suggestion-images 0 objects.
--    Nothing is orphaned.
--
-- ── STEP 1 — run THIS script ──
--
-- ── STEP 2 — then run these two, in this order, as separate queries ──
--    a) SCHEMA.sql     (architecture-Inflozo-2026-08-19/SCHEMA.sql)
--    b) RLS-TEST.sql   (architecture-Inflozo-2026-08-19/RLS-TEST.sql)
--
--    RLS-TEST.sql is a GATE now, not a report: it finishes clean or it raises. If it raises,
--    stop and send me the error rather than continuing — that is the harness doing its job.
--
--    Do NOT run PRELUDE.sql against hosted. Its `auth.uid()` stub would overwrite Supabase's own
--    with one returning NULL, silently disabling every policy while the proof still said PASS.
--
--    One expected WARNING during SCHEMA.sql, and it is not a failure:
--      "D6 NOT APPLIED: TRUNCATE remains granted on storage grants"
--    Supabase re-grants TRUNCATE on the storage tables from its own migration and `postgres` is
--    not the grantor, so the revoke is a no-op. Re-tested today: the new DELETE guards do **not**
--    cover TRUNCATE, so this stays open and the control that actually holds is that `storage` is
--    not a PostgREST-exposed schema. RLS-TEST.sql asserts that.
-- ============================================================================

-- 1. Storage policies. SCHEMA.sql §12 recreates these; `create policy` errors if they exist.
drop policy if exists assets_owner                   on storage.objects;
drop policy if exists suggestion_images_owner_write  on storage.objects;
drop policy if exists suggestion_images_owner_manage on storage.objects;

-- 2. Accounts. Cascades into profiles, entitlements and everything owned by them.
--    (auth is not a storage table, so no delete guard applies.)
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
--    2026-04-28, default for new projects 2026-05-30, ENFORCED on existing projects 2026-10-30.
--    SCHEMA.sql §0a sets this too; doing it here means the reset lands in the same state whichever
--    side of that cutover this project was created on.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- 6. Confirm the ground is clear before the schema goes back on.
select 'public tables (expect 0)'        as check, count(*)::text as n from pg_tables where schemaname = 'public'
union all
select 'auth users (expect 0)',            count(*)::text from auth.users
union all
select 'storage objects (expect 0)',       count(*)::text from storage.objects
union all
select 'storage policies (expect 0)',      count(*)::text from pg_policy p
         join pg_class c on c.oid = p.polrelid
         join pg_namespace nsp on nsp.oid = c.relnamespace where nsp.nspname = 'storage'
union all
select 'buckets (expect 4, kept on purpose)', count(*)::text from storage.buckets;
