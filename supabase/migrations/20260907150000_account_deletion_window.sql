-- Story 2.5 — FR-A5's soft-delete window: the two functions that own it.
--
-- `profiles.deleted_at` and `profiles.purge_after` have existed since the schema story and
-- nothing has ever written them. They are also, correctly, NOT client-writable: SCHEMA.sql §11
-- grants `authenticated` UPDATE on `display_name, autosave_enabled, updated_at` and nothing else,
-- because "which project stays editable" and "when this account is purged" are the server's calls
-- and Round 1 found all three client-writable. That grant is right and it stays.
--
-- So the window is owned by two `security definer` functions rather than by the app, in the shape
-- `provision_entitlement` already uses (`language plpgsql security definer set search_path =
-- public`). Three things follow, and each is why this is not a `supabaseAdmin()` write:
--
--   * THE FOURTEEN DAYS ARE A DATABASE FACT. `interval '14 days'` is written once, here, and
--     `apps/web/deletion-rule.test.ts` reads this file back and asserts `DELETION_WINDOW_DAYS`
--     agrees with it. A number written twice is a number that goes stale once.
--   * THE PROFILE AND ITS SNAPSHOTS MOVE TOGETHER. Two PostgREST writes are not a transaction;
--     one function body is.
--   * `SUPABASE_SECRET_KEY` KEEPS ITS ONE READER (`lib/flags.ts`). The caller is the user's own
--     session and `auth.uid()` is the only row key either function will touch — no secret key
--     goes near a user row.
--
-- `freeze_columns('is_admin')` on `profiles` binds that column alone (SCHEMA.sql :885-886, read
-- rather than assumed), so neither update trips it.
--
-- The 2026-09-04 migration is FROZEN — it has been applied to the live database — so this is a
-- new file (owner's ruling, 2026-09-05); `SCHEMA.sql` gains the same block in the same commit and
-- the RLS gate's schema diff is the proof the two agree.
--
-- The PURGE itself is Story 2.6's cron and is deliberately not here. This story stops at the
-- deadline.

-- FR-A5: open the window. Returns the deadline when THIS call opened it, and `null` when it was
-- already open — which is how `requestDeletion` knows not to send a second email, and how a stale
-- second tab cannot move a deadline the user is already looking at.
--
-- `now()` is transaction-stable, so `purge_after` is `deleted_at + interval '14 days'` EXACTLY,
-- which is what RLS-TEST.sql asserts rather than a tolerance.
--
-- FR-J13's pre-Inflozo themes come down with the account, and they are OFFERED first: the restore
-- page lists them for download throughout the window. `least(…)` never LENGTHENS a snapshot's
-- existing 90-day orphan clock (FR-C6) — a snapshot already due before the deadline keeps its
-- earlier date. THE COMMENT IS HERE AND NOT IN THE BODY: pg_dump emits a function body verbatim,
-- comments included, so a line inside it that SCHEMA.sql does not also carry is schema DRIFT and
-- the gate says so (executed, 2026-09-07).
create or replace function public.request_account_deletion() returns timestamptz
language plpgsql security definer set search_path = public as $$
declare deadline timestamptz;
begin
  update public.profiles
     set deleted_at  = now(),
         purge_after = now() + interval '14 days',
         updated_at  = now()
   where user_id = auth.uid()
     and deleted_at is null
  returning purge_after into deadline;

  if deadline is null then
    return null;
  end if;

  update public.site_snapshots
     set purge_after         = least(coalesce(purge_after, deadline), deadline),
         download_offered_at = coalesce(download_offered_at, now())
   where user_id = auth.uid();

  return deadline;
end $$;

-- FR-A5's "signing in restores everything". True only while the deadline is AHEAD: once it has
-- passed, 2.6's purge owns the account and this answers `false` rather than clearing a state the
-- purge may already be halfway through.
--
-- ponytail: restore clears every snapshot's purge_after, the 90-day orphan clock included; E3
-- re-stamps it when it exists (DW-43).
create or replace function public.restore_account() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set deleted_at  = null,
         purge_after = null,
         updated_at  = now()
   where user_id = auth.uid()
     and deleted_at is not null
     and purge_after > now();

  if not found then
    return false;
  end if;

  update public.site_snapshots
     set purge_after = null
   where user_id = auth.uid();

  return true;
end $$;

-- A definer function is granted to PUBLIC by default, which would hand both to `anon`. Neither is
-- reachable without a session: `auth.uid()` is null for anon and the update would match nothing,
-- but "matches nothing" is not the same as "cannot be called", and RLS-TEST.sql asserts the
-- second (42501) rather than the first.
revoke execute on function public.request_account_deletion() from public, anon;
revoke execute on function public.restore_account() from public, anon;
grant  execute on function public.request_account_deletion() to authenticated;
grant  execute on function public.restore_account() to authenticated;
