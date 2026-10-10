-- Story 7.9 — deleting a theme setting clears every condition that names it in the SAME transaction.
--
-- FR-Q2 / the spec's I/O matrix: "Visibility's target deleted — one confirm, one transaction: the row goes and the
-- condition is cleared". Through PostgREST that was two writes (the conditions, then the row), so a failure between
-- them left the setting standing with its dependents' conditions already gone. The owner ruled one save (Story 7.9's
-- Question 7, option 2, 2026-10-10): this function does both, and a plpgsql call is one statement, so either both land
-- or neither does. Pushed ALONE, before the code that calls it (R-99): nothing in CI runs a migration.
--
-- SECURITY INVOKER, deliberately: the caller's own RLS and column grants decide exactly as the two writes did — the
-- uniform owner policy and the parent-ownership term scope every row to the caller's projects, the update grant already
-- carries `visibility_condition`, and `delete` is granted. Another tenant's setting is invisible to the first read, so
-- the answer is false and nothing is written. `updated_at` is `touch_updated_at()`'s, as on every write to the table.
-- A row that vanishes between the read and the delete (a second tab) raises, which rolls the cleared conditions back.
--
-- EVERY STATEMENT IS RE-RUNNABLE: `create or replace`, `revoke`, `grant` and `notify` are idempotent by shape.
--
-- COMMENTS LIVE OUTSIDE THE BODY: pg_dump emits a function body verbatim and the RLS gate diffs these migrations against
-- SCHEMA.sql, so a line inside it that SCHEMA.sql does not also carry is drift.

create or replace function public.delete_custom_setting(p_project uuid, p_setting uuid)
returns boolean
language plpgsql security invoker set search_path = public as $$
declare
  target_key text;
begin
  select key into target_key from public.custom_settings where id = p_setting and project_id = p_project;
  if target_key is null then
    return false;
  end if;

  update public.custom_settings
     set visibility_condition = null
   where project_id = p_project and visibility_condition->>'key' = target_key;

  delete from public.custom_settings where id = p_setting and project_id = p_project;
  if not found then
    raise exception 'custom setting % went before it could be deleted', p_setting using errcode = 'P0002';
  end if;
  return true;
end $$;

revoke execute on function public.delete_custom_setting(uuid, uuid) from public, anon;
grant  execute on function public.delete_custom_setting(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
