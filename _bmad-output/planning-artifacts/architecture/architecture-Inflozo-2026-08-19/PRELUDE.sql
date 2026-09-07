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
  -- service_role is NOT optional, and its absence was a live break. [Round 4]
  -- Round 3's §19d fix added `grant ... to service_role` to SCHEMA.sql §11a(7). This file never
  -- created that role, so from that commit until now SCHEMA.sql ABORTED against a bare container:
  --     ERROR:  role "service_role" does not exist
  -- The hosted path kept working (Supabase provides the role), so the break was invisible to the
  -- run everyone was doing. `bypassrls` matches the platform, and it is what makes the AD-7 and
  -- AD-8 server-role assertions in RLS-TEST.sql mean the same thing on both targets.
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role bypassrls;
  end if;
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
grant usage on schema public to anon, authenticated, service_role;

create schema if not exists storage;
create table storage.buckets (id text primary key, name text, public boolean default false);
-- Real Supabase ships storage.buckets with RLS ON and ZERO policies, which is what makes AD-32's
-- "no bucket is public" true by default -- executed and recorded in MEASUREMENTS §16b. This
-- stand-in did not model that, so RLS-TEST.sql's storage.buckets assertion (one of the only two
-- that could ever abort) failed on every container run. [Round 4]
alter table storage.buckets enable row level security;
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text, owner uuid, created_at timestamptz default now());
alter table storage.objects enable row level security;
-- Hosted Supabase REFUSES a direct SQL DELETE on storage.objects, and this stand-in used to permit
-- one. That divergence was found the expensive way on 2026-09-05: SQL written and dry-run green
-- against this container failed against the live database with
--     ERROR 42501: Direct deletion from storage tables is not allowed. Use the Storage API instead.
-- The body below is `storage.protect_delete()` READ FROM THE HOSTED CATALOGUE (pg_proc.prosrc on the
-- app's project, 2026-09-05), not written from memory -- AD-23: a claim about an external platform is
-- a hypothesis until read in its source. Note the escape hatch is real and part of the platform's
-- behaviour: `set storage.allow_delete_query = 'true'` permits the delete, which is how a deliberate
-- SQL cleanup is done. Modelling both halves is the point; a stand-in that only refuses would be a
-- different lie from one that only permits.
create or replace function storage.protect_delete() returns trigger language plpgsql as $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;
create trigger protect_objects_delete before delete on storage.objects
  for each statement execute function storage.protect_delete();
create or replace function storage.foldername(name text) returns text[]
  language sql immutable as $$ select string_to_array(name, '/') $$;
grant usage on schema storage to anon, authenticated, service_role;
grant select, insert, update, delete on storage.objects to authenticated;

-- ── `vault`, modelling MEASUREMENTS §21j rather than the extension. [Story 3.1]
-- Supabase ships `supabase_vault` 0.3.1; a bare container has neither it nor pgsodium, and the
-- gate must still be able to prove DW-44's trigger. What the trigger and `store()` actually
-- depend on is a small surface, and these stand-ins are that surface WITH ITS GRANTS: probed
-- live, `vault.secrets` and `vault.decrypted_secrets` are granted to `service_role` only
-- (SELECT, DELETE) and answer 404 over PostgREST, which is what bounds a leaked API secret key
-- to opaque references. A stand-in that granted them widely would prove the trigger against a
-- permission model the real database does not have.
--
-- The secret is stored in the clear here and `decrypted_secret` is the same column: this models
-- the SHAPE, never the cryptography. Nothing in the gate asserts anything about encryption, and
-- a fake that pretended to encrypt would be a different lie.
create schema if not exists vault;
create table vault.secrets (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  description text not null default '',
  secret text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());
alter table vault.secrets enable row level security;
create view vault.decrypted_secrets as
  select id, name, description, secret, secret as decrypted_secret, created_at, updated_at
    from vault.secrets;
-- The POSITIONAL shape the docs give (read 2026-09-07): the secret, then an optional unique name,
-- then a description. Story 3.1 passes a null name on purpose — names are unique and a rotation
-- must not collide with the key it replaces.
create or replace function vault.create_secret(
  new_secret text, new_name text default null, new_description text default '')
  returns uuid language sql as $$
  insert into vault.secrets (secret, name, description)
  values (new_secret, new_name, coalesce(new_description, ''))
  returning id $$;
grant usage on schema vault to service_role;
grant select, delete on vault.secrets to service_role;
grant select on vault.decrypted_secrets to service_role;
