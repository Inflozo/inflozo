-- Minimal stand-ins for the Supabase-provided objects SCHEMA.sql references, so the schema and its
-- RLS proof can be applied to a bare PostgreSQL container. Supabase provides all of these for real.
create schema if not exists auth;
create table auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
-- Roles are CLUSTER-wide, not per-database, so a second run against the same container would abort
-- here under ON_ERROR_STOP and leave the storage stand-ins below uncreated. Idempotent so the proof
-- can be re-run without recreating the container.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
end $$;
-- Schema usage is still granted; table privileges are NOT. [R2-3, corrected 2026-08-19]
--
-- The previous form of this file declared `grant all on tables to authenticated` and asserted in a
-- comment that Supabase does this by default. Both halves were wrong, and the second is the kind of
-- uncited external claim AD-23 exists to keep out of the tree.
--
--   (a) Supabase's documented default was SELECT, INSERT, UPDATE, DELETE -- never `all`. `grant all`
--       additionally confers TRUNCATE, and TRUNCATE is NOT subject to row-level security. Executed
--       against the old prelude, an ordinary `authenticated` session truncated site_credentials and
--       billing_events -- both AD-7 server-only, both correctly denying SELECT/INSERT/UPDATE/DELETE --
--       and cascaded `projects` to 16 further tables. That hole was an artifact of this file, not of
--       Supabase; but every RLS assertion was being proved against it.
--       Cited: supabase.com/docs/guides/troubleshooting/database-api-42501-errors  (read 2026-08-19)
--
--   (b) That default is being withdrawn. Supabase is removing automatic exposure of new `public`
--       tables to anon/authenticated: optional 2026-04-28, the default for new projects 2026-05-30,
--       and ENFORCED on existing projects 2026-10-30.
--       Cited: supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
--              (read 2026-08-19)
--
-- This file therefore models the NEW default: no automatic table privileges at all. SCHEMA.sql must
-- grant every privilege it needs explicitly (R2-1). If the schema applies and RLS-TEST.sql passes
-- against this prelude, it also works after 2026-10-30 -- which is the whole point of modelling the
-- new default rather than the old one.
--
-- `storage`, `auth` and `realtime` are explicitly unaffected by that change (same changelog), so the
-- storage grants further down stay as they are.
grant usage on schema public to anon, authenticated;

create schema if not exists storage;
create table storage.buckets (id text primary key, name text, public boolean default false);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text, owner uuid, created_at timestamptz default now());
alter table storage.objects enable row level security;
create or replace function storage.foldername(name text) returns text[]
  language sql immutable as $$ select string_to_array(name, '/') $$;
grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on storage.objects to authenticated;
