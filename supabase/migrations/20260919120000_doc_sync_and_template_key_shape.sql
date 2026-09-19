-- Story 5.8 — the first writer of `project_templates` brings both things that writing needs.
--
-- TWO STATEMENTS, ONE MIGRATION, and unlike 20260911100000's four these ARE related: (1) repairs the
-- constraint that would refuse three of the keys (2) is about to start upserting, and (2) creates the
-- only function that may move `projects.revision`. Applied by hand through `SUPABASE_DB_POOLER_URL`
-- before the code that needs them is pushed (R-99).
--
-- The 2026-09-04 migration is FROZEN (DW-8) — it has been applied to the live database — so this is a
-- new file and not an edit to that one.
--
-- EVERY STATEMENT IS RE-RUNNABLE. The direct host is IPv6-only, so this is applied by hand through the
-- pooler, and a hand-apply is exactly the kind that gets retried after a dropped connection. `drop
-- constraint if exists` then `add constraint` is idempotent by shape; `create or replace function` is.

-- ---------------------------------------------------------------------------------------------
-- (1) DW-193 — `template_key_shape` carries two backslashes and therefore refuses every `custom:` key.
-- ---------------------------------------------------------------------------------------------
--
-- EXECUTED ON PRODUCTION BEFORE THIS WAS WRITTEN (Story 5.5's review, 2026-09-18, through
-- `SUPABASE_DB_POOLER_URL`, every insert inside a rolled-back transaction): `custom:custom-signup.hbs`,
-- `custom:custom-signin.hbs` and `custom:custom-member-home.hbs` are each refused with `23514
-- template_key_shape`; `index` is accepted (the control that the probe could insert at all); and
-- `custom:custom-signup\xhbs` — a literal backslash and any character — is ACCEPTED, which is the
-- control that names the cause.
--
-- With `standard_conforming_strings = on` (the PostgreSQL 17 default, and Supabase's) the two
-- backslashes in `'…\\.hbs$'` reach the regex engine as an escaped backslash followed by `.` — "a
-- literal backslash, then any character" — and never as an escaped dot. One backslash is the fix.
--
-- BOTH tables carry the identical constraint and therefore the identical bug. `project_template_prefs`
-- has no writer yet; it gets the same repair now rather than a second migration when it does.
--
-- Nothing in production can violate the repaired constraint: it is strictly WIDER than the one it
-- replaces (every key the old pattern accepted, the new one accepts — a literal backslash is not a
-- legal `custom:` key and no row carries one), so both are added VALID.

alter table public.project_templates      drop constraint if exists template_key_shape;
alter table public.project_templates      add  constraint template_key_shape check (
  template_key in ('site','home','index','post','page','tag','author','error','private')
  or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$');

alter table public.project_template_prefs drop constraint if exists template_key_shape;
alter table public.project_template_prefs add  constraint template_key_shape check (
  template_key in ('site','home','index','post','page','tag','author','error','private')
  or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$');

-- ---------------------------------------------------------------------------------------------
-- (2) AD-15's flush, as the only thing that can perform it.
-- ---------------------------------------------------------------------------------------------
--
-- `authenticated` is granted UPDATE on eight columns of `public.projects` and `revision` is not one of
-- them (§11) — AD-31's deliberate choice, because a client that picks its own revision can start above
-- any legitimate one. So `revision` can only move inside a `security definer` function, and once the
-- function exists the upserts belong inside it too: one plpgsql body is one transaction, which is
-- exactly what DW-197 found missing from the project-level "Clear dark overrides".
--
-- COMPARE-AND-SET, and it is the whole contract. `p_base` is the caller's `base_revision`; the call
-- writes if and only if the project's `revision` still equals it. A mismatch writes NOTHING and hands
-- back the revision that is actually there, which is the second row of `addendum.md` §AD1.1 arriving
-- at the client as a fact rather than as a guess.
--
-- THE RETURN IS `jsonb`, NOT `bigint`, and the reason is a collision that a bigint cannot survive:
-- on success the answer is `p_base + 1`, and the COMMONEST conflict — one other tab having flushed
-- exactly once — leaves the current revision at `p_base + 1` as well. The two would be the same
-- number, and the client would read a refusal as a success and drop the work it had not sent. So the
-- verdict is carried separately from the number: `{"applied": bool, "revision": bigint}`. §AD1.1's
-- sentence is unchanged — a mismatch still "writes nothing and returns the current revision"; it is
-- `revision` in the object.
--
-- `auth.uid()` keys it, and the `user_id` term is not redundant: a definer function runs as its owner
-- and RLS does not constrain it, so ownership is asserted in the WHERE clause or it is not asserted at
-- all. Another user's project id — and an id that does not exist — both reach zero rows and both answer
-- NULL, which is the same answer to both questions and therefore no existence oracle.
--
-- `for update` holds the project row for the body, so two concurrent flushes of the same project
-- serialise on it and the second sees the first's revision rather than racing past the check.
--
-- `updated_at` is set by the `_touch` triggers on both tables (§10c), so nothing here sets it.
--
-- THE COMMENT IS HERE AND NOT IN THE BODY: pg_dump emits a function body verbatim, comments included,
-- so a line inside it that SCHEMA.sql does not also carry is schema DRIFT and the gate says so.
create or replace function public.sync_project_doc(p_project uuid, p_docs jsonb, p_base bigint)
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

  update public.projects set revision = current_rev + 1 where id = p_project;

  return jsonb_build_object('applied', true, 'revision', current_rev + 1);
end $$;

-- A definer function is granted to PUBLIC by default, which would hand this to `anon`. It is not
-- reachable without a session — `auth.uid()` is null for anon and the body returns null on the first
-- line — but "returns null" is not the same as "cannot be called", and RLS-TEST.sql asserts the second
-- (42501) rather than the first.
revoke execute on function public.sync_project_doc(uuid, jsonb, bigint) from public, anon;
grant  execute on function public.sync_project_doc(uuid, jsonb, bigint) to authenticated;
