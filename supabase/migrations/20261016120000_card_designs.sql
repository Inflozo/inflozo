-- Story 7.13 — the editor's save carries the project's card designs, in the same compare-and-set as the docs; and
-- `project_treatments.paywall_design_id` goes.
--
-- FR-Q7's card design module stores its values in `project_treatments.card_designs` (Story 1.2's column): one record
-- per designed Koenig card, each holding only the controls whose value differs from the card's start. A value change
-- and a reset are each ONE edit (FR-D9, §AD1, AD-16) — a journal key like a Style Pack, sent by the flush that sends
-- the docs, the preset and the packs: one call, one compare-and-set, one revision bump, and a refused call writes none
-- of them. Pushed ALONE, before any code (R-99): nothing in CI runs a migration.
--
-- `p_cards` IS THE WHOLE RECORD, as `p_packs` is the whole map: the journal's entries carry the whole record, so a card
-- reset to Ghost's default is a key the next record no longer has. It is upserted into the project's one
-- `project_treatments` row (primary key `project_id`), whose other columns it leaves alone; `updated_at` is set here
-- because `project_treatments` carries no `_touch` trigger (§10c). A `p_cards` that is not an object answers null and
-- writes nothing, as a non-object `p_docs` or `p_packs` does: the route validates the record with `parseCardDesigns`
-- before the call (AD-36), so only a hand-made call can send one.
--
-- THE FIVE-ARGUMENT FUNCTION IS DROPPED, NOT KEPT BESIDE THIS ONE, for 20261004120000's reason: two overloads where one
-- has defaults make a call ambiguous to PostgREST, and the code deployed until this story's Dev push calls with three,
-- four or five names. With one function whose sixth argument defaults to null every such call still resolves, and
-- still writes no card designs. Drop and create sit in one transaction when applied as one file, so no request can
-- find neither. `notify pgrst, 'reload schema'` is delivered at commit.
--
-- `paywall_design_id` (A32) has had no reader and no writer since Story 5.20 made the paywall a `paywall` doc (DW-267);
-- it is dropped here, in this story's own Schema phase, as epics.md's Story 7.13 records.
--
-- EVERY STATEMENT IS RE-RUNNABLE, for 20260911100000's reason: `drop … if exists`, `create or replace`, `revoke`,
-- `grant` and `notify` are idempotent by shape.
--
-- COMMENTS LIVE OUTSIDE THE BODY: pg_dump emits a function body verbatim and the RLS gate diffs these migrations against
-- SCHEMA.sql, so a line inside it that SCHEMA.sql does not also carry is drift.

alter table public.project_treatments drop column if exists paywall_design_id;

drop function if exists public.sync_project_doc(uuid, jsonb, bigint, text, jsonb);

create or replace function public.sync_project_doc(p_project uuid, p_docs jsonb, p_base bigint, p_preset text default null, p_packs jsonb default null, p_cards jsonb default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  owner_id uuid = auth.uid();
  current_rev bigint;
  k text;
begin
  if owner_id is null or p_docs is null or jsonb_typeof(p_docs) <> 'object'
     or (p_packs is not null and jsonb_typeof(p_packs) <> 'object')
     or (p_cards is not null and jsonb_typeof(p_cards) <> 'object') then
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

  if p_cards is not null then
    insert into public.project_treatments(project_id, user_id, card_designs)
      values (p_project, owner_id, p_cards)
    on conflict (project_id) do update set card_designs = excluded.card_designs, updated_at = now();
  end if;

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

revoke execute on function public.sync_project_doc(uuid, jsonb, bigint, text, jsonb, jsonb) from public, anon;
grant  execute on function public.sync_project_doc(uuid, jsonb, bigint, text, jsonb, jsonb) to authenticated;

notify pgrst, 'reload schema';
