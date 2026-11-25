-- Story 7.22 — FR-J7's pin cap, enforced in the database with the number the server hands it (AD-28).
--
-- FR-J7: at most N−1 of a project's stored versions may be pinned (9 of 10 on Pro, 2 of 3 on Free), enforced in the
-- database so deploying can never be blocked by pinning. N is plan-dependent and AD-28 makes `plan.ts` the one decider, so
-- a trigger reading `entitlements` would be a second one (MEASUREMENTS §26). `pin_version` satisfies both: the route reads
-- N through `plan.ts` and passes it in; the database counts and pins in ONE serialized step, so two tabs cannot both take
-- the last slot.
--
-- A stored version is a `deploys` row with status `uploaded` or `live` and `artifact_path` not null — `isStoredVersion` in
-- `apps/web/lib/retention.ts` is the same predicate. Answers:
--   'gone'   — not one of this user's stored versions (pruned, failed, another tenant's), nothing changed;
--   'cap'    — the project already holds p_cap − 1 pinned stored versions besides this one, nothing changed;
--   'pinned' — pinned (pinning a pinned row answers 'pinned' again).
-- The pin's update re-checks the stored predicate, so a pin that meets a prune's conditional clear (which only clears
-- `pinned = false` rows) is either pinned and kept or answers 'gone' — never pinned without its object.
-- Unpinning is a plain update by the server and is never refused.
--
-- It RETIRES `guard_pin_leaves_a_slot()` ("at least one row stays unpinned"), which contradicted the owner's N−1 twice: it
-- refused pinning a project's only version, which N−1 allows, and it counted failed and pruned rows as unpinned, so it
-- mostly never fired.
--
-- Only the service role executes it: the history route calls it after `resolveEntitlement`. SECURITY INVOKER — the
-- service role bypasses RLS and `p_user` scopes the row.
--
-- Pushed ALONE, before the code that calls it (R-99): nothing in CI runs a migration.
-- RE-RUNNABLE: `drop … if exists`, `create or replace`, `revoke`, `grant` and `comment on` are idempotent by shape.
-- COMMENTS LIVE OUTSIDE THE BODY: the RLS gate diffs these migrations against SCHEMA.sql through pg_dump.

-- PRODUCTION NEVER HAD `deploys.pinned`. Read through the pooler at this story's apply (2026-11-25, the owner's go): the
-- first apply stopped at `comment on column public.deploys.pinned` with 42703 and rolled back whole, and a catalogue diff
-- of production against every migration here (columns, functions, triggers, policies, indexes, enums, constraints in
-- `public` and `private`) found exactly three objects missing — this column, `guard_pin_leaves_a_slot()` and its trigger —
-- and nothing else. The frozen migration declares all three; nothing had ever read or written `pinned`, so nothing broke.
-- `add column if not exists` restores it on production and is a no-op on every database the migrations built.
alter table public.deploys add column if not exists pinned boolean not null default false;

drop trigger if exists deploys_pin_leaves_a_slot on public.deploys;
drop function if exists public.guard_pin_leaves_a_slot();

create or replace function public.pin_version(p_deploy uuid, p_user uuid, p_cap int)
returns text
language plpgsql security invoker set search_path = public as $$
declare
  v_project uuid;
  v_pinned int;
begin
  select project_id into v_project from public.deploys
   where id = p_deploy and user_id = p_user
     and status in ('uploaded', 'live') and artifact_path is not null;
  if v_project is null then
    return 'gone';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('pin_version:' || v_project::text, 0));

  select count(*) into v_pinned from public.deploys
   where project_id = v_project and pinned and id <> p_deploy
     and status in ('uploaded', 'live') and artifact_path is not null;
  if v_pinned >= p_cap - 1 then
    return 'cap';
  end if;

  update public.deploys set pinned = true
   where id = p_deploy and user_id = p_user
     and status in ('uploaded', 'live') and artifact_path is not null;
  if not found then
    return 'gone';
  end if;
  return 'pinned';
end $$;

revoke execute on function public.pin_version(uuid, uuid, int) from public, anon, authenticated;
grant  execute on function public.pin_version(uuid, uuid, int) to service_role;

comment on column public.deploys.pinned is
  'FR-J7 (Story 7.22): keep this stored version through pruning. At most N−1 of a project''s stored versions are pinned (N = PLANS[plan].history: 10 Pro, 3 Free), pinned ones counted in N. Set only through pin_version(), which counts and pins in one serialized step with the N the server''s plan resolver hands it (AD-28); cleared by a plain server update, never refused.';

notify pgrst, 'reload schema';
