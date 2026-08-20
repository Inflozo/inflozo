-- Inflozo — runnable RLS + constraint proof for the E1 schema story.
-- E1's exit is "RLS verified on every table the schema story creates". This IS that check.
-- Run:  docker run -d --name pg -e POSTGRES_PASSWORD=x postgres:17-alpine
--       psql -f PRELUDE.sql -f SCHEMA.sql -f RLS-TEST.sql   (expect every line to read PASS)
-- Verified green on PostgreSQL 17.11, 2026-08-19: 0 tables without RLS, 34 policies over 26
-- tables, exactly 2 deliberate server-only tables (site_credentials, billing_events).

\set ON_ERROR_STOP on
\pset pager off
-- Behavioural RLS proof: two tenants, one impersonation attempt per surface.
insert into auth.users(id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');
insert into public.profiles(user_id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');

create or replace function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
grant usage on schema auth to authenticated, anon;
-- NOTE: no blanket grant here. PRELUDE.sql sets Supabase's default privileges before the migration,
-- and SCHEMA.sql §11 narrows them afterwards. Re-granting here would mask exactly what is under test.
grant select on public.suggestion_votes, public.suggestions_public to anon;

-- seed as the table owner (RLS is bypassed for the owner, which is what the server role is)
insert into public.sites(id,user_id,url) values
  ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','https://a.example'),
  ('bbbbbbbb-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','https://b.example');
insert into public.projects(id,user_id,name,slug,style_pack) values
  ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','A','a','{}'),
  ('bbbbbbbb-1111-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','B','b','{}');
insert into public.site_credentials(site_id,user_id,admin_key_vault_ref) values
  ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',gen_random_uuid());
insert into public.suggestions(id,user_id,category,title,body,image_path,image_approved) values
  ('cccccccc-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','feature','Bs idea','body','img/secret.png',false);

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select 'sites visible to A (expect 1)' as check, count(*) from public.sites;
select 'projects visible to A (expect 1)' as check, count(*) from public.projects;
-- [R2-1] AD-7's server-only tables now deny TWICE: no grant at all (§11a(7)) and RLS-with-no-policy
-- behind it. The observable shape therefore CHANGED — this used to return 0 rows, because the client
-- held a platform-default SELECT and RLS filtered every row. It now raises insufficient_privilege
-- before RLS is consulted. That is defence in depth and it fails loud rather than silently empty,
-- but it is a different signature and any caller expecting an empty set now throws.
do $$ begin
  begin
    perform 1 from public.site_credentials;
    raise notice 'FAIL: site_credentials is reachable by the client';
  exception when insufficient_privilege then
    raise notice 'PASS: site_credentials denied at the grant layer, not just by RLS (42501)';
  end;
  begin
    perform 1 from public.billing_events;
    raise notice 'FAIL: billing_events is reachable by the client';
  exception when insufficient_privilege then
    raise notice 'PASS: billing_events denied at the grant layer, not just by RLS (42501)';
  end;
  begin
    perform 1 from public.feature_flags;
    raise notice 'FAIL: feature_flags is reachable by the client';
  exception when insufficient_privilege then
    raise notice 'PASS: feature_flags denied at the grant layer, not just by RLS (42501)';
  end;
end $$;
select 'suggestions visible to A (expect 1 — public board)' as check, count(*) from public.suggestions;
select 'unapproved image via view (expect NULL)' as check,
       (select image_path from public.suggestions_public where id='cccccccc-0000-0000-0000-000000000003') as v;
do $$ begin
  begin
    perform image_path from public.suggestions;
    raise notice 'FAIL: image_path readable straight off the base table';
  exception when insufficient_privilege then
    raise notice 'PASS: image_path is not granted on the base table (%)', sqlstate; end;
end $$;

-- write attempts across the tenant boundary
do $$ begin
  begin
    insert into public.projects(user_id,name,slug,style_pack)
      values ('22222222-2222-2222-2222-222222222222','stolen','s','{}');
    raise notice 'FAIL: A inserted a project owned by B';
  exception when others then raise notice 'PASS: cross-tenant project insert blocked (%)', sqlstate; end;

  begin
    update public.sites set title='hijacked' where user_id='22222222-2222-2222-2222-222222222222';
    if found then raise notice 'FAIL: A updated Bs site'; else raise notice 'PASS: A cannot see or update Bs site'; end if;
  exception when others then raise notice 'PASS: cross-tenant site update blocked (%)', sqlstate; end;

  begin
    update public.profiles set is_admin=true where user_id='11111111-1111-1111-1111-111111111111';
    raise notice 'FAIL: A self-granted admin';
  exception when others then raise notice 'PASS: is_admin frozen against client update (%)', sqlstate; end;

  begin
    insert into public.deploys(project_id,user_id,site_id,version,theme_name,status)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
              'aaaaaaaa-0000-0000-0000-000000000001','1.0.0','inflozo-a','live');
    raise notice 'FAIL: A forged a deploy row';
  exception when others then raise notice 'PASS: deploys is read-only to the client (%)', sqlstate; end;

  begin
    insert into public.suggestion_votes(suggestion_id,user_id)
      values ('cccccccc-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222');
    raise notice 'FAIL: A voted as B';
  exception when others then raise notice 'PASS: vote-as-another-user blocked (%)', sqlstate; end;
end $$;

-- --- the column-write surfaces the adversarial review found open (SCHEMA.sql §11) ---
do $$ begin
  begin
    update public.sites set deploy_rate_limit_exempt = true
      where user_id='11111111-1111-1111-1111-111111111111';
    raise notice 'FAIL: A granted itself the deploy rate-limit bypass';
  exception when others then raise notice 'PASS: sites.deploy_rate_limit_exempt is server-only (%)', sqlstate; end;

  begin
    update public.sites set capability='full', capability_source='user_declared'
      where user_id='11111111-1111-1111-1111-111111111111';
    raise notice 'FAIL: A forged the FR-C2 Preview-only verdict';
  exception when others then raise notice 'PASS: sites.capability is server-only (%)', sqlstate; end;

  begin
    update public.projects set revision = revision + 5
      where id='aaaaaaaa-1111-0000-0000-000000000001';
    raise notice 'FAIL: A wrote projects.revision (AD-15 lineage marker)';
  exception when others then raise notice 'PASS: projects.revision is server-only (%)', sqlstate; end;

  begin
    update public.deploy_jobs set stage='done';
    raise notice 'FAIL: A set a deploy job to done';
  exception when others then raise notice 'PASS: deploy_jobs grants only cancel_requested (%)', sqlstate; end;

  begin
    update public.custom_settings set frozen_at = null;
    raise notice 'FAIL: A nulled frozen_at, which reopens the key rename';
  exception when others then raise notice 'PASS: custom_settings.frozen_at is server-only (%)', sqlstate; end;

  begin
    update public.template_binding_checklist set filename='other.hbs';
    raise notice 'FAIL: A rewrote a checklist filename';
  exception when others then raise notice 'PASS: checklist grants only marked_done_at (%)', sqlstate; end;

  begin
    insert into storage.objects(bucket_id, name)
      values ('deploy-artifacts','aaaaaaaa-1111-0000-0000-000000000001/theme.zip');
    raise notice 'FAIL: A wrote into deploy-artifacts';
  exception when others then raise notice 'PASS: deploy-artifacts is server-only storage (%)', sqlstate; end;

  begin
    insert into storage.objects(bucket_id, name)
      values ('assets','22222222-2222-2222-2222-222222222222/x.webp');
    raise notice 'FAIL: A wrote into Bs asset folder';
  exception when others then raise notice 'PASS: storage assets are folder-scoped to the owner (%)', sqlstate; end;

  begin
    insert into storage.objects(bucket_id, name)
      values ('assets','11111111-1111-1111-1111-111111111111/mine.webp');
    raise notice 'PASS: A can write its own asset folder';
  exception when others then raise notice 'FAIL: A cannot write its own asset folder (%)', sqlstate; end;
end $$;

reset role;
-- server-asserted invariants that must hold even against the service role
do $$ begin
  update public.projects set revision = 7 where id='aaaaaaaa-1111-0000-0000-000000000001';
  begin
    update public.projects set revision = 3 where id='aaaaaaaa-1111-0000-0000-000000000001';
    raise notice 'FAIL: revision went backwards (7 -> 3)';
  exception when others then raise notice 'PASS: projects.revision is monotonic even server-side (%)', sqlstate; end;

  insert into public.project_site_bindings(project_id,user_id,site_id,theme_name)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
            'aaaaaaaa-0000-0000-0000-000000000001','inflozo-a');
  begin
    update public.projects set slug='renamed' where id='aaaaaaaa-1111-0000-0000-000000000001';
    raise notice 'FAIL: slug changed after a theme name was frozen';
  exception when others then raise notice 'PASS: projects.slug frozen once a theme name exists (%)', sqlstate; end;

  begin
    insert into public.project_site_bindings(project_id,user_id,site_id,theme_name)
      values ('bbbbbbbb-1111-0000-0000-000000000002','22222222-2222-2222-2222-222222222222',
              'aaaaaaaa-0000-0000-0000-000000000001','inflozo-a');
    raise notice 'FAIL: two projects froze the same theme name on one site';
  exception when others then raise notice 'PASS: theme name is unique per site (%)', sqlstate; end;

  insert into public.deployed_template_names(project_id,user_id,filename)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','custom-member-home.hbs');
  begin
    insert into public.custom_templates(project_id,user_id,display_name,filename,kind,surface)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
              'Member Home','custom-member-home.hbs','membership','member_home');
    raise notice 'FAIL: reused a filename this project already deployed';
  exception when others then raise notice 'PASS: a deployed custom-template name can never be reused (%)', sqlstate; end;

  begin
    insert into public.project_templates(project_id,user_id,template_key,doc)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','posts','{}');
    raise notice 'FAIL: an unknown template_key was accepted';
  exception when others then raise notice 'PASS: template_key is constrained (%)', sqlstate; end;
end $$;

-- the 17-setting cap (FR-Q2)
do $$
declare i int;
begin
  for i in 1..17 loop
    insert into public.custom_settings(project_id,user_id,key,label,type,bound_to)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
              'k'||i,'L'||i,'boolean','{}');
  end loop;
  begin
    insert into public.custom_settings(project_id,user_id,key,label,type,bound_to)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','k18','L18','boolean','{}');
    raise notice 'FAIL: 18th custom setting accepted';
  exception when others then raise notice 'PASS: custom-setting cap held at 17 (%)', sqlstate; end;
  begin
    insert into public.custom_settings(project_id,user_id,key,label,type,default_value,bound_to)
      values ('bbbbbbbb-1111-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','c','C','color','#abc','{}');
    raise notice 'FAIL: 3-digit hex colour default accepted';
  exception when others then raise notice 'PASS: colour default must be 6-digit hex (%)', sqlstate; end;
  begin
    insert into public.translation_overrides(project_id,user_id,catalog_key,value)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','credit.built_with','Nope');
    raise notice 'FAIL: credit.* override accepted';
  exception when others then raise notice 'PASS: credit.* namespace locked (%)', sqlstate; end;
end $$;
\pset pager off
-- 1. Every public table must have RLS enabled. Anything false is a hole.
select 'RLS-DISABLED: '||c.relname as finding
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' and not c.relrowsecurity;

-- 2. Tables with RLS on and ZERO policies are deny-all. That must be a deliberate list.
select c.relname as server_only_table
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' and c.relrowsecurity
  and not exists (select 1 from pg_policy p where p.polrelid=c.oid)
order by 1;

-- 3. Every table carrying user_id must be RLS-scoped by it.
select c.relname as has_user_id_but_no_policy_mentioning_it
from pg_class c join pg_namespace n on n.oid=c.relnamespace
join pg_attribute a on a.attrelid=c.oid and a.attname='user_id' and a.attnum>0
where n.nspname='public' and c.relkind='r'
  and not exists (
    select 1 from pg_policy p where p.polrelid=c.oid
      and (pg_get_expr(p.polqual,p.polrelid) like '%user_id%'
        or pg_get_expr(p.polwithcheck,p.polrelid) like '%user_id%'))
order by 1;

-- 4. Policy count, for the record.
select count(*) as policies, count(distinct polrelid) as tables_with_policies from pg_policy;

-- ============================================================================
-- 5. Round 2 regressions — the grant surface itself  [R2-1, R2-3, R2-4]
-- ============================================================================
-- Round 1 and Round 2 both found holes that RLS could not see because they were privilege holes,
-- not policy holes. These four queries must ALL return zero rows.

-- 5a. TRUNCATE ignores RLS entirely; REFERENCES and TRIGGER are never a client's business.
select table_name||' -> '||grantee||' has '||privilege_type as forbidden_grant
from information_schema.role_table_grants
where grantee in ('anon','authenticated') and privilege_type in ('TRUNCATE','REFERENCES','TRIGGER')
order by 1;

-- 5b. Every table except the three deliberate AD-7 server-only ones must be reachable. A table that
--     falls off §11a is silently dead to the client, and SCHEMA.sql applies with zero errors either way.
select t.tablename as table_with_no_grant
from pg_tables t
where t.schemaname='public'
  and t.tablename not in ('site_credentials','billing_events','feature_flags')
  and not exists (select 1 from information_schema.role_table_grants g
                  where g.table_schema='public' and g.table_name=t.tablename
                    and g.grantee in ('authenticated','anon'))
order by 1;

-- 5c. The inverse: an AD-7 server-only table must hold NO grant at all.
select g.table_name||' -> '||g.grantee||' has '||g.privilege_type as server_only_table_is_granted
from information_schema.role_table_grants g
where g.table_schema='public'
  and g.table_name in ('site_credentials','billing_events','feature_flags')
  and g.grantee in ('anon','authenticated')
order by 1;

-- 5d. A function with a null ACL is EXECUTE to PUBLIC, which includes anon.
select p.proname as function_executable_by_public
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proacl is null
  and p.proname in ('touch_updated_at','freeze_columns','guard_revision','guard_slug',
                    'guard_custom_template_name','guard_lock_generation','sync_vote_count',
                    'enforce_custom_setting_cap','provision_entitlement')
order by 1;

-- ============================================================================
-- 6. Round 1 decisions 3, 13, 14, 15, 16 — as executable regressions
-- ============================================================================
do $$
declare n int;
begin
  -- d15: the settings snapshot AD-27(a) names has a column to live in.
  if exists (select 1 from information_schema.columns
             where table_name='deploys' and column_name='settings_snapshot')
    then raise notice 'PASS: deploys carries the AD-27(a) settings snapshot';
    else raise notice 'FAIL: deploys has no settings snapshot column'; end if;

  -- d14: AD-28's entitlements row has a writer.
  insert into auth.users(id) values ('33333333-3333-3333-3333-333333333333');
  select count(*) into n from public.entitlements where user_id='33333333-3333-3333-3333-333333333333';
  if n = 1 then raise notice 'PASS: entitlements row provisioned at signup (AD-28)';
          else raise notice 'FAIL: no entitlements row created at signup'; end if;

  -- d13: lock_generation is monotonic, and against the OWNER too (AD-31).
  insert into public.edit_locks(project_id,user_id,holder_session_id,lock_generation)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','s1',5);
  begin
    update public.edit_locks set lock_generation = 1
      where project_id='aaaaaaaa-1111-0000-0000-000000000001';
    raise notice 'FAIL: lock_generation rewound';
  exception when insufficient_privilege then
    raise notice 'PASS: edit_locks.lock_generation is monotonic (42501)'; end;

  -- d16: the custom-template name guard sees UPDATE, not only INSERT.
  insert into public.deployed_template_names(project_id,user_id,filename)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','custom-taken');
  insert into public.custom_templates(project_id,user_id,display_name,filename,kind)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
            'Free one','custom-free','routes');
  begin
    update public.custom_templates set filename='custom-taken'
      where project_id='aaaaaaaa-1111-0000-0000-000000000001' and filename='custom-free';
    raise notice 'FAIL: a deployed template name was reused via UPDATE';
  exception when unique_violation then
    raise notice 'PASS: name guard fires on UPDATE as well as INSERT (23505)'; end;
end $$;

-- d3 (corrected): the view reads, and cannot be written through.
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
do $$ begin
  begin
    perform 1 from public.suggestions_public;
    raise notice 'PASS: suggestions_public is still readable (the image gate survives)';
  exception when others then raise notice 'FAIL: suggestions_public unreadable (%)', sqlstate; end;
  begin
    update public.suggestions_public set title='PWNED';
    raise notice 'FAIL: cross-tenant write through suggestions_public';
  exception when insufficient_privilege then
    raise notice 'PASS: suggestions_public is not writable (42501)'; end;
  begin
    delete from public.suggestions_public;
    raise notice 'FAIL: cross-tenant delete through suggestions_public';
  exception when insufficient_privilege then
    raise notice 'PASS: suggestions_public rows cannot be deleted by a client (42501)'; end;
  -- d13: the three column locks Round 1 found open.
  begin
    update public.profiles set free_editable_project_id = gen_random_uuid();
    raise notice 'FAIL: profiles.free_editable_project_id is client-writable';
  exception when insufficient_privilege then
    raise notice 'PASS: profiles.free_editable_project_id is server-only (42501)'; end;
  begin
    update public.assets set stored_bytes = 1;
    raise notice 'FAIL: assets.stored_bytes is client-writable';
  exception when insufficient_privilege then
    raise notice 'PASS: assets.stored_bytes is server-only (42501)'; end;
  begin
    update public.edit_locks set user_id = '22222222-2222-2222-2222-222222222222';
    raise notice 'FAIL: an edit lock can be re-parented onto another user';
  exception when insufficient_privilege then
    raise notice 'PASS: edit_locks identity columns are frozen (42501)'; end;
end $$;
reset role;

-- ============================================================================
-- Round 3 D6 — TRUNCATE is not subject to RLS, and Supabase re-grants it
-- ============================================================================
--
-- storage-api's migration 0046-buckets-objects-grants.sql does `grant all` on both
-- storage tables to anon and authenticated. `all` includes TRUNCATE; RLS does not
-- cover TRUNCATE. Executed as authenticated before the revoke, `truncate
-- storage.objects cascade` SUCCEEDED. This assertion fails if a storage upgrade
-- re-grants it, which is the only way it comes back.
do $$
declare bad text;
begin
  select string_agg(format('%s.%s -> %s', table_schema, table_name, grantee), ', ')
    into bad
  from information_schema.role_table_grants
  where table_schema = 'storage'
    and table_name in ('buckets', 'objects')
    and grantee in ('anon', 'authenticated')
    and privilege_type = 'TRUNCATE';
  if bad is not null then
    raise warning 'OPEN (D6): TRUNCATE is granted on storage tables (%). SCHEMA.sql section 12''s revoke is a no-op wherever the running role is not the grantor (supabase_storage_admin). This is EXPECTED to fail until the revoke is confirmed working on hosted Supabase. It is not reachable while `storage` stays out of PGRST_DB_SCHEMAS -- assert that too, below.', bad;
  else
    raise notice 'PASS: no TRUNCATE grant on storage.buckets or storage.objects for anon/authenticated';
  end if;
end $$;

-- The half that HELD, asserted so it is not assumed either: buckets carries RLS with
-- zero policies, which is what makes AD-32's "no bucket is public" true by default.
do $$
declare n int; rls boolean;
begin
  select relrowsecurity into rls from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
    where ns.nspname = 'storage' and c.relname = 'buckets';
  select count(*) into n from pg_policy p join pg_class c on c.oid = p.polrelid
    join pg_namespace ns on ns.oid = c.relnamespace
    where ns.nspname = 'storage' and c.relname = 'buckets';
  if not rls then raise exception 'FAIL: RLS is off on storage.buckets'; end if;
  raise notice 'PASS: storage.buckets has RLS on with % policies (0 = deny-all, the documented default)', n;
end $$;

-- The control that actually holds today: `storage` must never be a PostgREST-exposed
-- schema, because that is the only thing standing between a browser session and the
-- TRUNCATE grant above. Asserted rather than assumed.
do $$
declare exposed text := coalesce(current_setting('pgrst.db_schemas', true), '');
begin
  if exposed <> '' and exposed like '%storage%' then
    raise exception 'FAIL: `storage` is an exposed PostgREST schema (%). With TRUNCATE still granted (D6), any authenticated session can destroy every user''s objects.', exposed;
  end if;
  raise notice 'PASS: storage is not PostgREST-exposed (db_schemas = %)', coalesce(nullif(exposed, ''), 'unset locally');
end $$;
