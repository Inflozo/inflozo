-- Story 6.3 — the editor's save carries the Style Pack's preset, in the same compare-and-set as the docs.
--
-- FR-D9 lists "Style Pack changes" in the undo history, `addendum.md` §AD1 counts a Style Pack change as one edit, and
-- AD-16 makes every edit one transaction counted in `unsynced_edits`. So the pack is a journal key like a doc, and the
-- flush that sends the docs sends the pending preset with them: one call, one compare-and-set, one revision bump, and a
-- refused call writes neither. Written straight to the column instead (as `dark_enabled` is, from the settings page), it
-- could not be undone, and with no revision moving a device whose revision still matched would keep its old pack over the
-- server's. Pushed ALONE, before any code (R-99): nothing in CI runs a migration. Applied on 2026-10-04 through
-- `SUPABASE_DB_POOLER_URL` on the owner's go (Story 6.3's Question 1) and read back: one `sync_project_doc` on production,
-- its body byte-identical to the one below.
--
-- ONLY `preset` IS WRITTEN. `style_pack` is one `jsonb not null` column holding `{preset}` or `{brand, preset}` on every
-- production project (read at this story's Create), and "Use your brand" writes `brand` into it from the Sites page
-- without the editor — so the body sets the one key with `jsonb_set` and leaves every other. A value that is not an
-- object (only a hand-written scalar through the owner's column grant can be one) is replaced by `{preset}` rather than
-- raising, because a raise here is a save the editor retries for ever.
--
-- THE THREE-ARGUMENT FUNCTION IS DROPPED, NOT KEPT BESIDE THIS ONE. Two overloads where one has a default make a
-- three-argument call ambiguous to PostgREST (it picks by argument names, and both match), and the code deployed until
-- this story's Dev push calls with exactly those three names. With one function whose fourth argument defaults to null
-- that call still resolves, and still writes no preset. Drop and create sit in one transaction when applied as one file,
-- so no request can find neither. `notify pgrst, 'reload schema'` is delivered at commit (5.24b's precedent), so
-- PostgREST learns the new signature once it is there.
--
-- EVERY STATEMENT IS RE-RUNNABLE, for 20260911100000's reason: `drop … if exists`, `create or replace`, `revoke`,
-- `grant` and `notify` are idempotent by shape.
--
-- COMMENTS LIVE OUTSIDE THE BODY: pg_dump emits a function body verbatim and the RLS gate diffs these migrations against
-- SCHEMA.sql, so a line inside it that SCHEMA.sql does not also carry is drift.

drop function if exists public.sync_project_doc(uuid, jsonb, bigint);

create or replace function public.sync_project_doc(p_project uuid, p_docs jsonb, p_base bigint, p_preset text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  owner_id uuid = auth.uid();
  current_rev bigint;
  k text;
begin
  if owner_id is null or p_docs is null or jsonb_typeof(p_docs) <> 'object' then
    return null;
  end if;

  select p.revision into current_rev
    from public.projects p
   where p.id = p_project and p.user_id = owner_id
     for update;

  if not found then
    return null;
  end if;

  if current_rev is distinct from p_base then
    return jsonb_build_object('applied', false, 'revision', current_rev);
  end if;

  for k in select jsonb_object_keys(p_docs) loop
    insert into public.project_templates(project_id, user_id, template_key, doc)
      values (p_project, owner_id, k, p_docs -> k)
    on conflict (project_id, template_key) do update set doc = excluded.doc;
  end loop;

  update public.projects
     set revision = current_rev + 1,
         style_pack = case
           when p_preset is null then style_pack
           when jsonb_typeof(style_pack) = 'object' then jsonb_set(style_pack, '{preset}', to_jsonb(p_preset))
           else jsonb_build_object('preset', p_preset)
         end
   where id = p_project;

  return jsonb_build_object('applied', true, 'revision', current_rev + 1);
end $$;

revoke execute on function public.sync_project_doc(uuid, jsonb, bigint, text) from public, anon;
grant  execute on function public.sync_project_doc(uuid, jsonb, bigint, text) to authenticated;

notify pgrst, 'reload schema';
