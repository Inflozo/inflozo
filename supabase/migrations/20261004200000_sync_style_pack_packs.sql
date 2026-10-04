-- Story 6.4 — the editor's save carries the project's own Style Packs, in the same compare-and-set as the docs.
--
-- FR-E3 makes a pack editable per project: a preset recoloured in this project, or a pack the project made. Each is a
-- full authored record, stored whole under `style_pack.packs[id]`, and every gesture that changes one is ONE edit
-- (FR-D9, §AD1, AD-16) — a journal key like a doc, sent by the flush that sends the docs and the pending preset: one
-- call, one compare-and-set, one revision bump, and a refused call writes none of them. Pushed ALONE, before any code
-- (R-99): nothing in CI runs a migration. Applied on 2026-10-04 through `SUPABASE_DB_POOLER_URL` on the owner's go
-- (Story 6.4's Question 3) and read back: one `sync_project_doc` on production, its body byte-identical to the one below.
--
-- ONLY `preset` AND `packs` ARE WRITTEN, each only when its argument is not null. "Use your brand" writes `brand` into
-- the same column from the Sites page without the editor, so the body merges the keys it was given into the stored
-- object and leaves every other. `p_packs` is the WHOLE map — the journal's entries carry the whole map, so a pack
-- reset to its library defaults is a key the next map no longer has. A `style_pack` that is not an object (only a
-- hand-written scalar through the owner's column grant can be one) starts from `{}` rather than raising, because a
-- raise here is a save the editor retries for ever. A `p_packs` that is not an object answers null and writes nothing,
-- as a non-object `p_docs` does: the route validates every record before the call (AD-36), so only a hand-made call can
-- send one.
--
-- THE FOUR-ARGUMENT FUNCTION IS DROPPED, NOT KEPT BESIDE THIS ONE, for 20261004120000's reason: two overloads where one
-- has defaults make a call ambiguous to PostgREST (it picks by argument names, and both match), and the code deployed
-- until this story's Dev push calls with exactly four names. With one function whose fifth argument defaults to null
-- that call still resolves, and still writes no packs; so do the three-name calls the settings page makes. Drop and
-- create sit in one transaction when applied as one file, so no request can find neither. `notify pgrst, 'reload
-- schema'` is delivered at commit, so PostgREST learns the new signature once it is there.
--
-- EVERY STATEMENT IS RE-RUNNABLE, for 20260911100000's reason: `drop … if exists`, `create or replace`, `revoke`,
-- `grant` and `notify` are idempotent by shape.
--
-- COMMENTS LIVE OUTSIDE THE BODY: pg_dump emits a function body verbatim and the RLS gate diffs these migrations against
-- SCHEMA.sql, so a line inside it that SCHEMA.sql does not also carry is drift.

drop function if exists public.sync_project_doc(uuid, jsonb, bigint, text);

create or replace function public.sync_project_doc(p_project uuid, p_docs jsonb, p_base bigint, p_preset text default null, p_packs jsonb default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  owner_id uuid = auth.uid();
  current_rev bigint;
  k text;
begin
  if owner_id is null or p_docs is null or jsonb_typeof(p_docs) <> 'object'
     or (p_packs is not null and jsonb_typeof(p_packs) <> 'object') then
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
           when p_preset is null and p_packs is null then style_pack
           else (case when jsonb_typeof(style_pack) = 'object' then style_pack else '{}'::jsonb end)
             || (case when p_preset is null then '{}'::jsonb else jsonb_build_object('preset', p_preset) end)
             || (case when p_packs is null then '{}'::jsonb else jsonb_build_object('packs', p_packs) end)
         end
   where id = p_project;

  return jsonb_build_object('applied', true, 'revision', current_rev + 1);
end $$;

revoke execute on function public.sync_project_doc(uuid, jsonb, bigint, text, jsonb) from public, anon;
grant  execute on function public.sync_project_doc(uuid, jsonb, bigint, text, jsonb) to authenticated;

notify pgrst, 'reload schema';
