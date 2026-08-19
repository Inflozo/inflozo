-- Minimal stand-ins for the Supabase-provided objects SCHEMA.sql references, so the schema and its
-- RLS proof can be applied to a bare PostgreSQL container. Supabase provides all of these for real.
create schema if not exists auth;
create table auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
create role anon; create role authenticated;
-- Supabase grants these by default to every table in `public`. They exist BEFORE a migration runs,
-- which is why SCHEMA.sql §11 narrows by revoke-then-grant rather than by granting from nothing.
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;

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
