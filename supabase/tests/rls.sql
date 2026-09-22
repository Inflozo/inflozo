-- Inflozo — runnable RLS + constraint proof for the E1 schema story.
-- E1's exit is "RLS verified on every table the schema story creates". This IS that check.
--
-- ── HOW TO RUN IT — three targets, and the file is PURE SQL so all three work ──
--
--   1. a bare container
--        docker run -d --name pg -e POSTGRES_PASSWORD=x postgres:17-alpine
--        psql -v ON_ERROR_STOP=1 -f PRELUDE.sql -f SCHEMA.sql -f RLS-TEST.sql
--
--   2. hosted Supabase over psql — OMIT PRELUDE.sql. The platform provides everything it stands
--      in for, and its auth.uid() stub would overwrite the real one with a NULL-returning
--      function, silently disabling every policy while this proof still said PASS.
--        psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f SCHEMA.sql -f RLS-TEST.sql
--
--   3. the Supabase dashboard SQL editor — paste SCHEMA.sql, run it, then paste this, run it.
--
-- ⚠️ THIS FILE CONTAINS NO psql META-COMMANDS, AND THAT IS DELIBERATE.
-- It used to open with `\set ON_ERROR_STOP on` and `\pset pager off`. Those are psql client
-- directives, not SQL: the dashboard SQL editor sends raw SQL to the server, which rejects them
-- with `42601: syntax error at or near "\"` on the very first line. ON_ERROR_STOP belongs on the
-- psql COMMAND LINE (`-v ON_ERROR_STOP=1`, as shown above), where it works for targets 1 and 2 and
-- is unnecessary for target 3 — the editor runs the script as one transaction and an exception
-- aborts it outright, which is the same contract by a different mechanism.
-- Verified green on PostgreSQL 17.11, 2026-08-19: 0 tables without RLS, 34 policies over 26
-- tables, exactly 2 deliberate server-only tables (site_credentials, billing_events).
--
-- ⚠️ THIS FILE IS A GATE, NOT A REPORT.  [Round 4, F0 -- MEASUREMENTS §21n]
-- It used to be the other way round and nobody noticed for three rounds. It carried 2
-- `raise exception` against 36 `raise notice 'FAIL...'`, and the structural checks at the bottom
-- were bare SELECTs that returned their findings as ROWS. `ON_ERROR_STOP` aborts on a SQL ERROR;
-- a NOTICE is not one and neither is a returned row. Executed with this file's own shapes:
--
--     $ psql -v ON_ERROR_STOP=1 -f fail-shape.sql   # a FAIL notice + a sentinel finding row
--     $ echo $?
--     0                                             <- success, after printing FAIL
--
-- So every assertion below could fail while CI went green -- which is the reason six structural
-- holes survived three rounds of "verified by execution". Every FAIL now RAISES, and every
-- structural query is wrapped in a block that raises on a non-empty result. A non-zero exit is
-- the contract; "expect every line to read PASS" was never enforceable and is no longer the test.

-- ── The fixture cleans up after itself, so a second run is not a confusing failure ──
-- Several assertions below are stateful: the FR-Q2 cap inserts 17 settings, the theme-name test
-- claims a binding, the takeover test advances a lock generation. Re-run against a database that
-- already has them and the first duplicate key aborts the whole script — which reads as "the schema
-- is broken" when it means "the fixture is still here". The dashboard SQL editor makes an
-- accidental re-run one click away, so the file removes its own fixture before laying it down.
--
-- These six ids are fixed, structured and obviously synthetic. Deleting the users cascades to
-- everything they own — profiles, sites, projects and every child row of those.
delete from auth.users where id in (
  '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'
);

-- Behavioural RLS proof: two tenants, one impersonation attempt per surface.
insert into auth.users(id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;   -- re-runnable: on hosted Supabase the fixture users persist
insert into public.profiles(user_id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222')
on conflict do nothing;

-- auth.uid() and the auth-schema grant are CONTAINER-ONLY. On real Supabase the
-- `auth` schema is owned by supabase_admin, `postgres` holds USAGE but not CREATE,
-- and both statements fail with "permission denied for schema auth".
--
-- They are also unnecessary there, and running them would be actively harmful:
-- `create or replace function auth.uid()` would OVERWRITE Supabase's own. Read
-- from a live project 2026-08-20, the platform's implementation is
--     coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
--              (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid
-- whose FIRST branch is the exact setting this file already sets below. So the
-- impersonation mechanism is identical on both, and the stub is a stand-in for a
-- function the platform provides -- the same shape as PRELUDE.sql itself.
--
-- One file, both targets: apply the stand-ins only where we own the schema.
do $$
begin
  if has_schema_privilege(current_user, 'auth', 'CREATE') then
    execute 'create or replace function auth.uid() returns uuid language sql stable as '
         || '$q$ select nullif(current_setting(''request.jwt.claim.sub'', true),'''')::uuid $q$';
    execute 'grant usage on schema auth to authenticated, anon';
    raise notice 'container target: auth.uid() stand-in installed';
  else
    raise notice 'hosted Supabase detected: using the platform auth.uid(); no stand-in installed';
  end if;
end $$;
-- NOTE: no blanket grant here. PRELUDE.sql sets Supabase's default privileges before the migration,
-- and SCHEMA.sql §11 narrows them afterwards. Re-granting here would mask exactly what is under test.
-- (SCHEMA.sql section 11 already grants both to anon; re-granting here masked a dropped grant.)

-- seed as the table owner (RLS is bypassed for the owner, which is what the server role is)
insert into public.sites(id,user_id,url) values
  ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','https://a.example'),
  ('bbbbbbbb-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','https://b.example')
on conflict do nothing;
insert into public.projects(id,user_id,name,slug,style_pack) values
  ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','A','a','{}'),
  ('bbbbbbbb-1111-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','B','b','{}')
on conflict do nothing;
insert into private.site_credentials(site_id,user_id,admin_key_vault_ref) values
  ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',gen_random_uuid())
on conflict do nothing;
insert into public.suggestions(id,user_id,category,title,body,image_path,image_approved) values
  ('cccccccc-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','feature','Bs idea','body','img/secret.png',false)
on conflict do nothing;
-- assets rows are server-written from Round 4 (F3), so the fixture seeds one as the owner for the
-- column-lock probes below to have something to aim at.
insert into public.assets(id,user_id,path,display_name,bytes,stored_bytes,mime,hash) values
  ('dddddddd-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111',
   'assets/11111111-1111-1111-1111-111111111111/a.webp','A',100,400,'image/webp','h1')
on conflict do nothing;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select 'sites visible to A (expect 1)' as check, count(*) from public.sites;
select 'projects visible to A (expect 1)' as check, count(*) from public.projects;
-- [R2-1] AD-7's server-only tables now deny TWICE: no grant at all (§11a(7)) and RLS-with-no-policy
-- behind it. The observable shape therefore CHANGED — this used to return 0 rows, because the client
-- held a platform-default SELECT and RLS filtered every row. It now raises insufficient_privilege
-- before RLS is consulted. That is defence in depth and it fails loud rather than silently empty,
-- but it is a different signature and any caller expecting an empty set now throws.
-- AD-7's tables now deny THREE ways: no schema USAGE (§0b), no grant, and RLS-with-no-policy.
-- Round 4 moved site_credentials and billing_events out of `public` because the secret key read
-- them straight over /rest/v1/ -- a schema PostgREST does not expose is reachable by no key at all.
do $$ begin
  begin
    perform 1 from private.site_credentials;
    raise exception 'FAIL: site_credentials is reachable by the client';
  exception when insufficient_privilege then
    raise notice 'PASS: site_credentials denied -- no USAGE on schema private (42501)';
  end;
  begin
    perform 1 from private.billing_events;
    raise exception 'FAIL: billing_events is reachable by the client';
  exception when insufficient_privilege then
    raise notice 'PASS: billing_events denied -- no USAGE on schema private (42501)';
  end;
  begin
    perform 1 from private.credential_audit;
    raise exception 'FAIL: the credential audit log is reachable by the client';
  exception when insufficient_privilege then
    raise notice 'PASS: credential_audit denied -- an audit log a client can read is a target list (42501)';
  end;
  begin
    perform 1 from public.feature_flags;
    raise exception 'FAIL: feature_flags is reachable by the client';
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
    raise exception 'FAIL: image_path readable straight off the base table';
  exception when insufficient_privilege then
    raise notice 'PASS: image_path is not granted on the base table (%)', sqlstate; end;
end $$;

-- write attempts across the tenant boundary
do $$ begin
  begin
    insert into public.projects(user_id,name,slug,style_pack)
      values ('22222222-2222-2222-2222-222222222222','stolen','s','{}')
on conflict do nothing;
    raise exception 'FAIL: A inserted a project owned by B';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: cross-tenant project insert blocked (%)', sqlstate; end;

  begin
    update public.sites set title='hijacked' where user_id='22222222-2222-2222-2222-222222222222';
    if found then raise exception 'FAIL: A updated Bs site'; else raise notice 'PASS: A cannot see or update Bs site'; end if;
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: cross-tenant site update blocked (%)', sqlstate; end;

  begin
    update public.profiles set is_admin=true where user_id='11111111-1111-1111-1111-111111111111';
    raise exception 'FAIL: A self-granted admin';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: is_admin frozen against client update (%)', sqlstate; end;

  begin
    insert into public.deploys(project_id,user_id,site_id,version,theme_name,status)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
              'aaaaaaaa-0000-0000-0000-000000000001','1.0.0','inflozo-a','live');
    raise exception 'FAIL: A forged a deploy row';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: deploys is read-only to the client (%)', sqlstate; end;

  begin
    insert into public.suggestion_votes(suggestion_id,user_id)
      values ('cccccccc-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222');
    raise exception 'FAIL: A voted as B';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: vote-as-another-user blocked (%)', sqlstate; end;
end $$;

-- --- the column-write surfaces the adversarial review found open (SCHEMA.sql §11) ---
do $$ begin
  begin
    update public.sites set deploy_rate_limit_exempt = true
      where user_id='11111111-1111-1111-1111-111111111111';
    raise exception 'FAIL: A granted itself the deploy rate-limit bypass';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: sites.deploy_rate_limit_exempt is server-only (%)', sqlstate; end;

  begin
    update public.sites set capability='full', capability_source='user_declared'
      where user_id='11111111-1111-1111-1111-111111111111';
    raise exception 'FAIL: A forged the FR-C2 Preview-only verdict';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: sites.capability is server-only (%)', sqlstate; end;

  begin
    update public.projects set revision = revision + 5
      where id='aaaaaaaa-1111-0000-0000-000000000001';
    raise exception 'FAIL: A wrote projects.revision (AD-15 lineage marker)';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: projects.revision is server-only (%)', sqlstate; end;

  begin
    update public.deploy_jobs set stage='done';
    raise exception 'FAIL: A set a deploy job to done';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: deploy_jobs grants only cancel_requested (%)', sqlstate; end;

  begin
    update public.custom_settings set frozen_at = null;
    raise exception 'FAIL: A nulled frozen_at, which reopens the key rename';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: custom_settings.frozen_at is server-only (%)', sqlstate; end;

  begin
    update public.template_binding_checklist set filename='other.hbs';
    raise exception 'FAIL: A rewrote a checklist filename';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: checklist grants only marked_done_at (%)', sqlstate; end;

  begin
    insert into storage.objects(bucket_id, name)
      values ('deploy-artifacts','aaaaaaaa-1111-0000-0000-000000000001/theme.zip');
    raise exception 'FAIL: A wrote into deploy-artifacts';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: deploy-artifacts is server-only storage (%)', sqlstate; end;

  begin
    insert into storage.objects(bucket_id, name)
      values ('assets','22222222-2222-2222-2222-222222222222/x.webp');
    raise exception 'FAIL: A wrote into Bs asset folder';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: storage assets are folder-scoped to the owner (%)', sqlstate; end;

  begin
    insert into storage.objects(bucket_id, name)
      values ('assets','11111111-1111-1111-1111-111111111111/mine.webp');
    raise notice 'PASS: A can write its own asset folder';
  exception when others then raise exception 'FAIL: A cannot write its own asset folder (%)', sqlstate; end;
end $$;

reset role;
-- server-asserted invariants that must hold even against the service role
do $$ begin
  update public.projects set revision = 7 where id='aaaaaaaa-1111-0000-0000-000000000001';
  begin
    update public.projects set revision = 3 where id='aaaaaaaa-1111-0000-0000-000000000001';
    raise exception 'FAIL: revision went backwards (7 -> 3)';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: projects.revision is monotonic even server-side (%)', sqlstate; end;

  insert into public.project_site_bindings(project_id,user_id,site_id,theme_name)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
            'aaaaaaaa-0000-0000-0000-000000000001','inflozo-a');
  begin
    update public.projects set slug='renamed' where id='aaaaaaaa-1111-0000-0000-000000000001';
    raise exception 'FAIL: slug changed after a theme name was frozen';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: projects.slug frozen once a theme name exists (%)', sqlstate; end;

  begin
    insert into public.project_site_bindings(project_id,user_id,site_id,theme_name)
      values ('bbbbbbbb-1111-0000-0000-000000000002','22222222-2222-2222-2222-222222222222',
              'aaaaaaaa-0000-0000-0000-000000000001','inflozo-a');
    raise exception 'FAIL: two projects froze the same theme name on one site';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: theme name is unique per site (%)', sqlstate; end;

  insert into public.deployed_template_names(project_id,user_id,filename)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','custom-member-home.hbs');
  begin
    insert into public.custom_templates(project_id,user_id,display_name,filename,kind,surface)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
              'Member Home','custom-member-home.hbs','membership','member_home');
    raise exception 'FAIL: reused a filename this project already deployed';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: a deployed custom-template name can never be reused (%)', sqlstate; end;

  begin
    insert into public.project_templates(project_id,user_id,template_key,doc)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','posts','{}');
    raise exception 'FAIL: an unknown template_key was accepted';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: template_key is constrained (%)', sqlstate; end;
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
    raise exception 'FAIL: 18th custom setting accepted';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: custom-setting cap held at 17 (%)', sqlstate; end;
  begin
    insert into public.custom_settings(project_id,user_id,key,label,type,default_value,bound_to)
      values ('bbbbbbbb-1111-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','c','C','color','#abc','{}');
    raise exception 'FAIL: 3-digit hex colour default accepted';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: colour default must be 6-digit hex (%)', sqlstate; end;
  begin
    insert into public.translation_overrides(project_id,user_id,catalog_key,value)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','credit.built_with','Nope');
    raise exception 'FAIL: credit.* override accepted';
  exception when others then
    -- the block's own FAIL sentinel must ABORT, never be swallowed and reported as a PASS.
    if sqlstate = 'P0001' and sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS: credit.* namespace locked (%)', sqlstate; end;
end $$;
-- ============================================================================
-- 5. Structural invariants — every one of these RAISES.  [Round 4, F0]
-- ============================================================================
-- These were bare SELECTs whose findings came back as ROWS, so a regression printed a table and
-- psql still exited 0. Each is now a block that raises on a non-empty result.

do $$
declare bad text;
begin
  -- 1. Every public table must have RLS enabled. Anything false is a hole.
  select string_agg(c.relname, ', ' order by c.relname) into bad
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname in ('public','private') and c.relkind in ('r','p') and not c.relrowsecurity;
  if bad is not null then raise exception 'FAIL: RLS is disabled on %', bad; end if;
  raise notice 'PASS: RLS is enabled on every public and private table';

  -- 2. Tables with RLS on and ZERO policies are deny-all. That must be a DELIBERATE list.
  --    site_credentials and billing_events moved to `private` in Round 4 (F6), so the public
  --    deny-all set is now feature_flags alone. A new name appearing here is a table someone
  --    forgot to give a policy, which reads as "secure" and is usually an accident.
  select string_agg(c.relname, ', ' order by c.relname) into bad
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r' and c.relrowsecurity
    and not exists (select 1 from pg_policy p where p.polrelid=c.oid)
    and c.relname not in ('feature_flags');
  if bad is not null then raise exception 'FAIL: undeclared server-only table(s): %', bad; end if;
  raise notice 'PASS: the public deny-all set is exactly the declared one';

  -- 3. Every table carrying user_id must be RLS-scoped by it.
  select string_agg(c.relname, ', ' order by c.relname) into bad
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  join pg_attribute a on a.attrelid=c.oid and a.attname='user_id' and a.attnum>0
  where n.nspname='public' and c.relkind='r'
    and not exists (
      select 1 from pg_policy p where p.polrelid=c.oid
        and (pg_get_expr(p.polqual,p.polrelid) like '%user_id%'
          or pg_get_expr(p.polwithcheck,p.polrelid) like '%user_id%'));
  if bad is not null then raise exception 'FAIL: user_id table(s) with no policy scoping them: %', bad; end if;
  raise notice 'PASS: every user_id table is RLS-scoped by it';

  -- 3b. AD-6 is `user_id = (select auth.uid())` WRAPPED, so the planner hoists it out of the
  --     per-row loop. The bare `user_id = auth.uid()` scopes correctly and re-evaluates per row;
  --     asserting only the substring `user_id` above cannot tell the two apart.
  select string_agg(distinct c.relname, ', ' order by c.relname) into bad
  from pg_policy p join pg_class c on c.oid=p.polrelid join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public'
    and (pg_get_expr(p.polqual,p.polrelid) like '%user_id%'
      or pg_get_expr(p.polwithcheck,p.polrelid) like '%user_id%')
    and coalesce(pg_get_expr(p.polqual,p.polrelid),'')||coalesce(pg_get_expr(p.polwithcheck,p.polrelid),'')
        not like '%( SELECT auth.uid()%';
  if bad is not null then raise exception 'FAIL (AD-6): policy body is not the hoisted (select auth.uid()) form on %', bad; end if;
  raise notice 'PASS (AD-6): every user_id policy body is the hoisted (select auth.uid()) form';

  -- 3c. AD-7: a `private` table is RLS on with ZERO policies. Derived from the catalogue, so a
  --     fourth private table is caught the day it lands rather than inheriting no assertion.
  select string_agg(c.relname, ', ' order by c.relname) into bad
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='private' and c.relkind in ('r','p')
    and (not c.relrowsecurity or exists (select 1 from pg_policy p where p.polrelid=c.oid));
  if bad is not null then raise exception 'FAIL (AD-7): private table(s) not RLS-on-with-zero-policies: %', bad; end if;
  raise notice 'PASS (AD-7): every private table is RLS on with zero policies';
end $$;

select count(*) as policies, count(distinct polrelid) as tables_with_policies from pg_policy;

-- ============================================================================
-- 5b. The grant surface itself — privilege holes RLS cannot see  [R2-1, R2-3, R2-4]
-- ============================================================================
do $$
declare bad text;
begin
  -- 5a. TRUNCATE ignores RLS entirely; REFERENCES and TRIGGER are never a client's business.
  select string_agg(table_name||' -> '||grantee||' has '||privilege_type, ', ') into bad
  from information_schema.role_table_grants
  where table_schema='public' and grantee in ('anon','authenticated')
    and privilege_type in ('TRUNCATE','REFERENCES','TRIGGER');
  if bad is not null then raise exception 'FAIL: forbidden grant(s): %', bad; end if;
  raise notice 'PASS: no TRUNCATE/REFERENCES/TRIGGER granted to anon or authenticated';

  -- 5b. A table that falls off §11a is silently dead to the client, and SCHEMA.sql applies with
  --     zero errors either way.
  -- NOTE the privilege function rather than role_table_grants: that view lists TABLE-level grants
  -- only, and Round 4 moved `suggestions` to column-level INSERT/UPDATE (F1). The first run of this
  -- assertion after that change reported `suggestions` unreachable, which was the view's blind spot
  -- and not a real hole -- has_any_column_privilege sees both levels.
  -- The OID form, not a constructed 'schema.name' string: the planner is free to evaluate the
  -- privilege qual BEFORE the schema qual, and building the name from a pg_catalog row it had not
  -- filtered out yet failed with `relation "public.pg_statistic" does not exist`. An oid carries
  -- its own identity and cannot be mis-resolved.
  select string_agg(c.relname, ', ' order by c.relname) into bad
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r' and c.relname not in ('feature_flags')
    and not (has_any_column_privilege('authenticated', c.oid, 'SELECT')
          or has_any_column_privilege('anon',          c.oid, 'SELECT'));
  if bad is not null then raise exception 'FAIL: table(s) unreachable by any client: %', bad; end if;
  raise notice 'PASS: every non-server-only public table is client-reachable';

  -- 5c. The inverse: a server-only table must hold NO client grant at all.
  select string_agg(x.tbl||' -> '||x.who, ', ') into bad
  from (select n.nspname||'.'||c.relname as tbl, r.who
        from pg_class c join pg_namespace n on n.oid=c.relnamespace
        cross join (values ('anon'),('authenticated')) as r(who)
        where c.relname in ('site_credentials','billing_events','feature_flags','credential_audit')
          and n.nspname in ('public','private')
          -- column privileges are SELECT/INSERT/UPDATE/REFERENCES only -- DELETE is table-level,
          -- so it is checked separately rather than passed to has_any_column_privilege.
          and (has_any_column_privilege(r.who, c.oid, 'SELECT,INSERT,UPDATE')
            or has_table_privilege(r.who, c.oid, 'DELETE'))) x;
  if bad is not null then raise exception 'FAIL: server-only table is granted to a client: %', bad; end if;
  raise notice 'PASS: no server-only table holds a client grant';

  -- 5c'. STORY 3.6's NEW COLUMN, AND THE SAME QUESTION ASKED OF IT ON ITS OWN. `admin_key_id`
  -- holds the Admin key's PUBLIC id half, and it is drawn on Manage keys -- so the temptation the
  -- day someone wants it in a page is a column grant, which 5c above would catch only while every
  -- OTHER column of the table stayed ungranted (`has_any_column_privilege` answers for the table).
  -- Asserted per column, and its EXISTENCE with it: a migration that silently did not apply would
  -- otherwise leave every assertion here passing over a column that is not there.
  if not exists (select 1 from pg_attribute a
                 where a.attrelid = 'private.site_credentials'::regclass
                   and a.attname = 'admin_key_id' and a.attnum > 0 and not a.attisdropped) then
    raise exception 'FAIL: private.site_credentials has no admin_key_id column (Story 3.6''s migration)';
  end if;
  select string_agg(r.who, ', ') into bad from (values ('anon'),('authenticated')) as r(who)
  where has_column_privilege(r.who, 'private.site_credentials', 'admin_key_id', 'SELECT,INSERT,UPDATE');
  if bad is not null then
    raise exception 'FAIL: private.site_credentials.admin_key_id is granted to a client: %', bad;
  end if;
  raise notice 'PASS: admin_key_id exists and no client holds a privilege on it';

  -- 5c''. …AND THE MIGRATION'S OTHER HALF, asked the same question. `credential_change` is the enum
  -- value both `store()` and `remove()` write (DW-76), and it was the half production lacked on
  -- 2026-09-09 (`22P02`, the incident behind R-99). A migration that applied one statement and
  -- not the other would leave every assertion above passing (Story 3.6's review, 2026-09-10).
  if not exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
                 join pg_namespace n on n.oid = t.typnamespace
                 where n.nspname = 'public' and t.typname = 'credential_action'
                   and e.enumlabel = 'credential_change') then
    raise exception 'FAIL: public.credential_action has no credential_change value (Story 3.6''s migration)';
  end if;
  raise notice 'PASS: credential_change is a value of public.credential_action';

  -- 5d. A function with a null ACL is EXECUTE to PUBLIC, which includes anon.
  --
  -- ⚠️ Also de-hardcoded 2026-08-21, for the same reason and found by the same audit:
  -- `guard_pin_leaves_a_slot()` was revoked in SCHEMA.sql and never added here, so a guard could
  -- have been left world-executable with the harness green. Derived now: **every function in
  -- `public` that RETURNS TRIGGER** must not be EXECUTE to PUBLIC. That covers every guard, freeze
  -- and provisioning function automatically, and correctly excludes `pgcrypto`'s ~40 functions,
  -- which SCHEMA.sql §11c leaves alone deliberately and explains why.
  -- ⚠️ AND THE TEST ITSELF WAS TESTING THE WRONG THING, which the same audit surfaced.
  -- It asked `proacl is null` — "has this function never been granted or revoked?" — as a PROXY for
  -- "can a client execute it?". The proxy has a hole: an EXPLICIT `grant execute … to public` sets a
  -- non-null ACL, so the function becomes world-executable and the assertion goes quiet. Proved by
  -- mutation: granting the pin guard to PUBLIC was NOT caught by the old form.
  -- Ask the real question instead. anon and authenticated inherit PUBLIC's grants, so testing those
  -- two covers a null ACL, an explicit grant to PUBLIC, and a direct grant to either role.
  -- ⚠️ EXTENDED to `private` by Story 3.1, and it had to be: DW-44's `drop_vault_secrets()` is a
  -- SECURITY DEFINER function that DELETES Vault secrets, and it lives in `private` — outside the
  -- one schema this assertion looked at. `alter default privileges ... in schema private revoke
  -- all on functions from anon, authenticated` (SCHEMA.sql :59) does not touch PUBLIC's default
  -- EXECUTE grant, so the function was world-executable until its explicit revoke, with this
  -- assertion green. Both schemas now, and the name is qualified so a failure says which.
  select string_agg(n.nspname || '.' || p.proname, ', ' order by n.nspname, p.proname) into bad
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'private') and p.prorettype = 'trigger'::regtype
    and (has_function_privilege('anon', p.oid, 'EXECUTE')
      or has_function_privilege('authenticated', p.oid, 'EXECUTE'));
  if bad is not null then raise exception 'FAIL: trigger function(s) a client can execute: %', bad; end if;
  raise notice 'PASS: no guard function is executable by PUBLIC';
end $$;

-- ============================================================================
-- 5c. Round 4 — the six findings, asserted as CLASSES rather than instances
-- ============================================================================
-- Every one of these describes a hole that existed while this file reported PASS. They are written
-- over catalogues rather than over named objects, so the NEXT table to get it wrong is caught too.

do $$
declare bad text;
begin
  -- F11: AD-8 says these tables are written by server routes under the service role. Round 3
  --      granted two of fourteen and Round 4 found the other twelve still unreachable.
  --
  -- ⚠️ THIS ASSERTION USED TO HARDCODE ITS OWN MEMBER LIST, and a second audit (2026-08-21) found
  -- it had already drifted: `site_snapshots` joined the class in Round 4 (F14) and
  -- `renewal_reminders` was added a day later, and NEITHER was being checked. A class assertion
  -- that names its members is an instance assertion wearing a class costume — the exact defect
  -- this assertion exists to catch, occurring inside the assertion itself.
  --
  -- It is now DERIVED, and the derivation is self-evidently true rather than a list to maintain:
  -- **if the client can read a table but cannot insert into it, the server must be able to insert,
  -- or no row can ever come into existence.** Any table that joins the class in future is covered
  -- the moment it is created, with no edit here.
  select string_agg(c.relname, ', ' order by c.relname) into bad
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
    and has_any_column_privilege('authenticated', c.oid, 'SELECT')
    and not has_any_column_privilege('authenticated', c.oid, 'INSERT')
    and not (has_table_privilege('service_role', c.oid, 'SELECT')
         and has_table_privilege('service_role', c.oid, 'INSERT'));
  if bad is not null then raise exception 'FAIL (F11): client-readable but neither client- nor server-insertable: %', bad; end if;
  raise notice 'PASS: every AD-8 server-written table is reachable by service_role';

  -- F3/F1: §11 narrows UPDATE column-by-column and INSERT was left whole-row everywhere, which
  --        handed back exactly what §11 took away. A server-asserted column must be absent from
  --        BOTH grants. Named per table because "server-asserted" is a design fact, not a catalogue one.
  -- 'BOTH' means the column is the server's on either verb; a named verb means the other one is
  -- legitimately the client's and is policed by a trigger instead of by the grant.
  select string_agg(v.t||'.'||v.c||' ('||p.priv||')', ', ') into bad
  from (values
    ('suggestions','image_approved','BOTH'),('suggestions','vote_count','BOTH'),
    ('suggestions','status','BOTH'),('suggestions','hidden','BOTH'),
    ('suggestions','merged_into','BOTH'),('suggestions','anonymized_at','BOTH'),
    ('assets','stored_bytes','BOTH'),('assets','bytes','BOTH'),
    ('edit_locks','lock_generation','INSERT'),
    ('profiles','is_admin','BOTH'),('profiles','free_editable_project_id','BOTH'),
    ('sites','deploy_rate_limit_exempt','BOTH'),('sites','capability','BOTH'),
    ('projects','revision','BOTH'),
    ('custom_settings','frozen_at','BOTH'),
    ('deploy_jobs','stage','BOTH'),('deploy_jobs','error','BOTH'),
    ('deploys','pinned','BOTH'),
    ('template_binding_checklist','filename','BOTH')
  ) as v(t,c,verbs)
  cross join lateral (values ('INSERT'),('UPDATE')) as p(priv)
  where (v.verbs = 'BOTH' or v.verbs = p.priv)
    and has_column_privilege('authenticated', ('public.'||v.t)::regclass, v.c, p.priv);
  if bad is not null then raise exception 'FAIL (F3): server-asserted column(s) client-writable: %', bad; end if;
  raise notice 'PASS: no server-asserted column is client-writable, on INSERT or UPDATE';

  -- P1: RLS rewrites every tenant query to a filter on user_id. Without an index whose FIRST key is
  --     user_id, that is a scan of every tenant's rows (measured 320.9 ms vs 11.2 ms).
  select string_agg(c.relname, ', ' order by c.relname) into bad
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  join pg_attribute a on a.attrelid=c.oid and a.attname='user_id' and a.attnum>0
  where n.nspname='public' and c.relkind='r' and c.relrowsecurity
    and not exists (
      select 1 from pg_index i join pg_attribute ia
        on ia.attrelid=c.oid and ia.attnum=i.indkey[0]
      where i.indrelid=c.oid and ia.attname='user_id');
  if bad is not null then raise exception 'FAIL (P1): RLS table(s) with no user_id index: %', bad; end if;
  raise notice 'PASS: every RLS table has an index leading on user_id';

  -- F2: the uniform owner policy authorises the child and never the parent. Every project-child
  --     table must carry the restrictive parent-ownership policy from §10a-ii.
  select string_agg(c.relname, ', ' order by c.relname) into bad
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  join pg_attribute a on a.attrelid=c.oid and a.attname='project_id' and a.attnum>0
  where n.nspname='public' and c.relkind='r' and c.relrowsecurity
    and has_table_privilege('authenticated', c.oid, 'INSERT')
    and not exists (select 1 from pg_policy p
                    where p.polrelid=c.oid and not p.polpermissive
                      and pg_get_expr(p.polwithcheck,p.polrelid) like '%owns_project%');
  if bad is not null then raise exception 'FAIL (F2): project-child table(s) with no parent-ownership check: %', bad; end if;
  raise notice 'PASS: every writable project-child table checks parent ownership';

  -- F6: AD-7's tables must not sit in a schema PostgREST exposes. This is the assertion that makes
  --     "inside a server route" true rather than aspirational.
  select string_agg(c.relname, ', ') into bad
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname in ('site_credentials','billing_events','credential_audit');
  if bad is not null then raise exception 'FAIL (F6): AD-7 table(s) still in the data-API schema: %', bad; end if;
  raise notice 'PASS: the AD-7 tables live outside the data-API schema';

  -- F12/F4/F13: three guards the architecture NAMES and the schema did not have.
  select string_agg(x.want, ', ') into bad from (values
    ('custom_settings_key_frozen'),     -- AD-9's fourth frozen column
    ('edit_locks_takeover_advances'),   -- FR-D18's takeover must advance the generation
    ('auth_user_profile'),              -- a profiles row at signup
    ('deploys_pin_leaves_a_slot'),      -- FR-J7: a project cannot pin away its last free slot
    ('site_credentials_drop_vault_secrets')  -- DW-44: a Vault secret dies with its ref (Story 3.1)
  ) as x(want)
  where not exists (select 1 from pg_trigger g where g.tgname = x.want and not g.tgisinternal);
  if bad is not null then raise exception 'FAIL: missing guard trigger(s): %', bad; end if;
  raise notice 'PASS: the AD-9, FR-D18, signup and DW-44 guards all exist';
end $$;

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
    else raise exception 'FAIL: deploys has no settings snapshot column'; end if;

  -- d14: AD-28's entitlements row has a writer.
  insert into auth.users(id) values ('33333333-3333-3333-3333-333333333333')
    on conflict (id) do nothing;   -- re-runnable: the editor has no fresh-container guarantee
  select count(*) into n from public.entitlements where user_id='33333333-3333-3333-3333-333333333333';
  if n = 1 then raise notice 'PASS: entitlements row provisioned at signup (AD-28)';
          else raise exception 'FAIL: no entitlements row created at signup'; end if;

  -- d13: lock_generation is monotonic, and against the OWNER too (AD-31).
  insert into public.edit_locks(project_id,user_id,holder_session_id,lock_generation)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','s1',5);
  begin
    update public.edit_locks set lock_generation = 1
      where project_id='aaaaaaaa-1111-0000-0000-000000000001';
    raise exception 'FAIL: lock_generation rewound';
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
    raise exception 'FAIL: a deployed template name was reused via UPDATE';
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
  exception when others then raise exception 'FAIL: suggestions_public unreadable (%)', sqlstate; end;
  begin
    update public.suggestions_public set title='PWNED';
    raise exception 'FAIL: cross-tenant write through suggestions_public';
  exception when insufficient_privilege then
    raise notice 'PASS: suggestions_public is not writable (42501)'; end;
  begin
    delete from public.suggestions_public;
    raise exception 'FAIL: cross-tenant delete through suggestions_public';
  exception when insufficient_privilege then
    raise notice 'PASS: suggestions_public rows cannot be deleted by a client (42501)'; end;
  -- d13: the three column locks Round 1 found open.
  begin
    update public.profiles set free_editable_project_id = gen_random_uuid();
    raise exception 'FAIL: profiles.free_editable_project_id is client-writable';
  exception when insufficient_privilege then
    raise notice 'PASS: profiles.free_editable_project_id is server-only (42501)'; end;
  begin
    update public.assets set stored_bytes = 1;
    raise exception 'FAIL: assets.stored_bytes is client-writable';
  exception when insufficient_privilege then
    raise notice 'PASS: assets.stored_bytes is server-only (42501)'; end;
  begin
    update public.edit_locks set user_id = '22222222-2222-2222-2222-222222222222';
    raise exception 'FAIL: an edit lock can be re-parented onto another user';
  exception when insufficient_privilege then
    raise notice 'PASS: edit_locks identity columns are frozen (42501)'; end;
end $$;
reset role;

-- ============================================================================
-- 7. Round 4 — the findings, as BEHAVIOURAL regressions
-- ============================================================================
-- The catalogue assertions in §5c prove the shape. These prove the behaviour, by attempting the
-- exact attack that worked in Round 4 and requiring it to fail.

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
do $$ begin
  -- F1: self-approve onto the public board. Executed in Round 4: HTTP 201, and an anonymous read
  -- of suggestions_public returned the image, a vote count of 99999 and status 'shipped'.
  begin
    insert into public.suggestions(user_id,category,title,body,image_approved)
      values ('11111111-1111-1111-1111-111111111111','feature','self approved','x',true);
    raise exception 'FAIL (F1): a user set image_approved at INSERT -- the FR-M3 admin gate is bypassed';
  exception when insufficient_privilege then
    raise notice 'PASS (F1): image_approved is not client-settable at INSERT (42501)'; end;
  begin
    insert into public.suggestions(user_id,category,title,body,vote_count,status)
      values ('11111111-1111-1111-1111-111111111111','feature','forged','x',99999,'shipped');
    raise exception 'FAIL (F1): a user forged vote_count and status at INSERT';
  exception when insufficient_privilege then
    raise notice 'PASS (F1): vote_count and status are not client-settable at INSERT (42501)'; end;
  -- ...and the same hole one verb over, which suggestions_author_update left reachable.
  begin
    update public.suggestions set image_approved = true
      where user_id='11111111-1111-1111-1111-111111111111';
    raise exception 'FAIL (F1): a user self-approved its image by UPDATE';
  exception when insufficient_privilege then
    raise notice 'PASS (F1): image_approved is not client-settable on UPDATE either (42501)'; end;

  -- F2: attach a child row to ANOTHER tenant's project. Executed in Round 4: HTTP 201.
  begin
    insert into public.project_templates(project_id,user_id,template_key,doc)
      values ('bbbbbbbb-1111-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','home','{}');
    raise exception 'FAIL (F2): A attached a child row to Bs project -- the owner policy never checked the parent';
  exception when insufficient_privilege or check_violation then
    raise notice 'PASS (F2): a child row cannot target another tenant''s project (%)', sqlstate; end;
  -- and the same insert against its OWN project must still work, or the fix broke the product.
  begin
    insert into public.project_templates(project_id,user_id,template_key,doc)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','home','{}');
    raise notice 'PASS (F2): a child row against the user''s OWN project still inserts';
  exception when others then
    raise exception 'FAIL (F2): the parent-ownership term broke a legitimate insert (%)', sqlstate; end;

  -- F3: understate the storage meter at creation. Executed in Round 4: HTTP 201.
  begin
    insert into public.assets(user_id,path,display_name,bytes,stored_bytes,mime,hash)
      values ('11111111-1111-1111-1111-111111111111','assets/1/x','x',9999999,1,'image/webp','h2');
    raise exception 'FAIL (F3): a user created an asset row and set its own quota meter';
  exception when insufficient_privilege then
    raise notice 'PASS (F3): assets rows are server-written; the meter cannot be understated (42501)'; end;

  -- F3: the three tables the class assertion caught after the first four were fixed.
  begin
    insert into public.sites(user_id,url,capability,deploy_rate_limit_exempt)
      values ('11111111-1111-1111-1111-111111111111','https://x.example','full',true);
    raise exception 'FAIL (F3): a user asserted sites.capability and the rate-limit exemption at INSERT';
  exception when insufficient_privilege then
    raise notice 'PASS (F3): sites server-asserted columns are not settable at INSERT (42501)'; end;
  begin
    insert into public.projects(user_id,name,slug,style_pack,revision)
      values ('11111111-1111-1111-1111-111111111111','p','p-rev','{}',9999);
    raise exception 'FAIL (F3): a user chose its own opening projects.revision';
  exception when insufficient_privilege then
    raise notice 'PASS (F3): projects.revision is not settable at INSERT (42501)'; end;

  -- F16: a vote is cast or withdrawn, never moved.
  begin
    update public.suggestion_votes set suggestion_id = 'cccccccc-0000-0000-0000-000000000003';
    raise exception 'FAIL (F16): a vote was moved, which desyncs vote_count on both suggestions';
  exception when insufficient_privilege then
    raise notice 'PASS (F16): suggestion_votes carries no UPDATE grant (42501)'; end;
end $$;
reset role;

-- F4: the takeover protocol the owner decided in Round 4 -- takeover is ALLOWED, and it must
-- advance lock_generation, because that number is how the displaced device learns it was displaced
-- and how much unsynced work it lost. Asserted against the OWNER, since AD-31 requires these to
-- hold against the service role too.
do $$
declare gen bigint;
begin
  update public.edit_locks set holder_session_id='s1', lock_generation=5
    where project_id='aaaaaaaa-1111-0000-0000-000000000001';
  begin
    update public.edit_locks set holder_session_id='s2-seized'
      where project_id='aaaaaaaa-1111-0000-0000-000000000001';
    raise exception 'FAIL (F4): the holder was reseated without advancing lock_generation -- the displaced device is never told';
  exception when insufficient_privilege then
    raise notice 'PASS (F4): a holder change must advance lock_generation (42501)'; end;
  -- the takeover the owner asked for must still WORK when it advances the generation.
  update public.edit_locks set holder_session_id='s2', lock_generation=6
    where project_id='aaaaaaaa-1111-0000-0000-000000000001';
  select lock_generation into gen from public.edit_locks
    where project_id='aaaaaaaa-1111-0000-0000-000000000001';
  if gen <> 6 then raise exception 'FAIL (F4): a legitimate takeover was blocked'; end if;
  raise notice 'PASS (F4): a takeover that advances the generation succeeds (gen now %)', gen;
end $$;

-- FR-J7's pin floor, against the OWNER — the plan-specific cap lives in the server route, so this
-- is the database floor underneath it and must hold even against the service role (AD-31).
do $$
declare d1 uuid; d2 uuid;
begin
  insert into public.deploys(project_id,user_id,site_id,version,theme_name,status)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
            'aaaaaaaa-0000-0000-0000-000000000001','1.0.0','inflozo-a','live') returning id into d1;
  insert into public.deploys(project_id,user_id,site_id,version,theme_name,status)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
            'aaaaaaaa-0000-0000-0000-000000000001','1.0.1','inflozo-a','live') returning id into d2;

  -- pinning one of two is fine: one unpinned slot remains
  update public.deploys set pinned = true where id = d1;
  raise notice 'PASS (FR-J7): a version can be pinned while an unpinned slot remains';

  -- pinning the LAST unpinned one must be refused
  begin
    update public.deploys set pinned = true where id = d2;
    raise exception 'FAIL (FR-J7): every version was pinned — the next deploy has nowhere to go';
  exception when insufficient_privilege then
    raise notice 'PASS (FR-J7): the last unpinned version cannot be pinned (42501)'; end;

  -- and unpinning must always work, or a customer could trap themselves
  update public.deploys set pinned = false where id = d1;
  raise notice 'PASS (FR-J7): unpinning is always allowed';
  delete from public.deploys where id in (d1,d2);
end $$;

-- F12: AD-9's fourth frozen column, against the OWNER -- a server bug is what this guards.
do $$ begin
  update public.custom_settings set frozen_at = now() where key='k1';
  begin
    update public.custom_settings set key='renamed' where key='k1';
    raise exception 'FAIL (F12): a frozen custom_settings.key was renamed -- this erases the site owner''s stored value';
  exception when insufficient_privilege then
    raise notice 'PASS (F12): custom_settings.key is frozen once deployed (42501)'; end;
  begin
    update public.custom_settings set frozen_at = null where key='k1';
    raise exception 'FAIL (F12): frozen_at was nulled -- the two-statement bypass AD-9 names';
  exception when insufficient_privilege then
    raise notice 'PASS (F12): frozen_at is immutable once set (42501)'; end;
end $$;

-- F13: a profiles row at signup. Round 4 found 6 users, 6 entitlements and 2 profiles on the live
-- project -- and the 2 were this file's own fixture, which is why a plausible-looking count hid it.
do $$
declare n int;
begin
  insert into auth.users(id) values ('44444444-4444-4444-4444-444444444444')
    on conflict (id) do nothing;   -- re-runnable, same reason
  select count(*) into n from public.profiles where user_id='44444444-4444-4444-4444-444444444444';
  if n <> 1 then raise exception 'FAIL (F13): no profiles row was created at signup -- autosave_enabled reads NULL'; end if;
  select count(*) into n from public.entitlements where user_id='44444444-4444-4444-4444-444444444444';
  if n <> 1 then raise exception 'FAIL (F13): no entitlements row was created at signup'; end if;
  raise notice 'PASS (F13): signup provisions BOTH the profile and the entitlement';
end $$;

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
  if exposed <> '' and exposed like '%private%' then
    raise exception 'FAIL (AD-7): `private` is an exposed PostgREST schema (%). Server-only tables carry no policy, so exposure is a direct read of every credential row.', exposed;
  end if;
  if exposed <> '' and exposed like '%storage%' then
    raise exception 'FAIL: `storage` is an exposed PostgREST schema (%). With TRUNCATE still granted (D6), any authenticated session can destroy every user''s objects.', exposed;
  end if;
  raise notice 'PASS: storage is not PostgREST-exposed (db_schemas = %)', coalesce(nullif(exposed, ''), 'unset locally');
end $$;

-- ============================================================================
-- Story 2.5 — FR-A5's soft-delete window, before anything in the app calls it
-- ============================================================================
--
-- `request_account_deletion()` and `restore_account()` are `security definer`, which is the whole
-- reason they need this: a definer function runs as its OWNER and RLS does not constrain it, so
-- "it only ever touches auth.uid()'s rows" is a claim about the WHERE clause and nothing else.
-- Asserted here as two tenants, exactly as every other surface in this file is.
--
-- What is proved: A's call stamps A's profile and A's snapshot with the SAME deadline, exactly
-- fourteen days after `deleted_at`, and leaves B's row and B's snapshot alone; a snapshot of A's
-- whose FR-C6 orphan clock is already due EARLIER keeps its earlier date (`least`, the branch the
-- migration's comment promises — review, 2026-09-07); a second call returns null and does not move
-- the deadline (which is how the action knows not to send a second email); `restore_account()`
-- clears the profile and EVERY snapshot of A's and answers true; with the deadline moved into the
-- past it answers false and clears NOTHING; and `anon` cannot execute either.

reset role;

-- The fixture: one pre-Inflozo snapshot per tenant, plus a second site of A's whose snapshot is
-- already on the 90-day clock, and both profiles known-clean, so this block is re-runnable on a
-- hosted project where the users at the top of the file persist.
update public.profiles set deleted_at = null, purge_after = null
 where user_id in ('11111111-1111-1111-1111-111111111111',
                   '22222222-2222-2222-2222-222222222222');
insert into public.sites(id,user_id,url) values
  ('aaaaaaaa-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','https://a3.example')
on conflict do nothing;
delete from public.site_snapshots
 where id in ('aaaaaaaa-5555-0000-0000-000000000001','aaaaaaaa-5555-0000-0000-000000000003',
              'bbbbbbbb-5555-0000-0000-000000000002');
insert into public.site_snapshots(id,user_id,site_id,storage_path,theme_name,purge_after) values
  ('aaaaaaaa-5555-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'site-snapshots/11111111-1111-1111-1111-111111111111/aaaaaaaa-0000-0000-0000-000000000001/theme.zip','casper',null),
  ('aaaaaaaa-5555-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000003',
   'site-snapshots/11111111-1111-1111-1111-111111111111/aaaaaaaa-0000-0000-0000-000000000003/theme.zip','alto',
   now() + interval '3 days'),
  ('bbbbbbbb-5555-0000-0000-000000000002','22222222-2222-2222-2222-222222222222',
   'bbbbbbbb-0000-0000-0000-000000000002',
   'site-snapshots/22222222-2222-2222-2222-222222222222/bbbbbbbb-0000-0000-0000-000000000002/theme.zip','source',null);

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

do $$
declare deadline timestamptz; again timestamptz; d timestamptz; p timestamptz;
        snap_p timestamptz; snap_offered timestamptz; early timestamptz; early_after timestamptz;
begin
  select purge_after into early from public.site_snapshots where id = 'aaaaaaaa-5555-0000-0000-000000000003';
  deadline := public.request_account_deletion();
  if deadline is null then
    raise exception 'FAIL (2.5): request_account_deletion() returned null on an account with no window open';
  end if;

  select deleted_at, purge_after into d, p from public.profiles where user_id = auth.uid();
  if d is null then raise exception 'FAIL (2.5): deleted_at was not stamped'; end if;
  -- EXACTLY, not within a tolerance: `now()` is transaction-stable, so the two expressions in the
  -- function body are the same instant. A tolerance here would pass a function that computed the
  -- deadline from a second clock.
  if p is distinct from d + interval '14 days' then
    raise exception 'FAIL (2.5): purge_after (%) is not deleted_at (%) + 14 days', p, d;
  end if;
  if p is distinct from deadline then
    raise exception 'FAIL (2.5): the function returned % but stored %', deadline, p;
  end if;

  select purge_after, download_offered_at into snap_p, snap_offered
    from public.site_snapshots where id = 'aaaaaaaa-5555-0000-0000-000000000001';
  if snap_p is distinct from deadline then
    raise exception 'FAIL (2.5): A''s snapshot purge_after is % and the account deadline is %', snap_p, deadline;
  end if;
  if snap_offered is null then
    raise exception 'FAIL (2.5): the snapshot was never marked as offered for download (FR-J13)';
  end if;

  -- `least(...)`: a snapshot already due BEFORE the deadline keeps its earlier date. A function
  -- that stamped `purge_after = deadline` unconditionally would lengthen FR-C6's clock here.
  select purge_after into early_after from public.site_snapshots where id = 'aaaaaaaa-5555-0000-0000-000000000003';
  if early_after is distinct from early then
    raise exception 'FAIL (2.5): a snapshot already due on % was moved to % by the deletion', early, early_after;
  end if;

  -- A SECOND CALL IS NOT A SECOND WINDOW. A stale tab pressing Delete again must not move the
  -- date the user is looking at, and the null is what tells the action to send no second email.
  again := public.request_account_deletion();
  if again is not null then
    raise exception 'FAIL (2.5): a second call re-opened the window and returned %', again;
  end if;
  select purge_after into p from public.profiles where user_id = auth.uid();
  if p is distinct from deadline then
    raise exception 'FAIL (2.5): the second call moved the deadline from % to %', deadline, p;
  end if;

  raise notice 'PASS (2.5): request_account_deletion() stamps the profile and its snapshot 14 days out, once';
end $$;

reset role;

-- B is a different tenant and the function is a definer: this is the assertion that its WHERE
-- clause, and not RLS, is what keeps the two apart.
do $$
declare n int;
begin
  select count(*) into n from public.profiles
   where user_id = '22222222-2222-2222-2222-222222222222'
     and (deleted_at is not null or purge_after is not null);
  if n <> 0 then raise exception 'FAIL (2.5): A''s deletion stamped B''s profile'; end if;
  select count(*) into n from public.site_snapshots
   where id = 'bbbbbbbb-5555-0000-0000-000000000002'
     and (purge_after is not null or download_offered_at is not null);
  if n <> 0 then raise exception 'FAIL (2.5): A''s deletion stamped B''s snapshot'; end if;
  raise notice 'PASS (2.5): B''s profile and B''s snapshot were untouched by A''s deletion';
end $$;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

do $$
declare cleared boolean; n int;
begin
  cleared := public.restore_account();
  if not cleared then raise exception 'FAIL (2.5): restore_account() answered false inside the window'; end if;
  select count(*) into n from public.profiles
   where user_id = auth.uid() and (deleted_at is not null or purge_after is not null);
  if n <> 0 then raise exception 'FAIL (2.5): restore left the profile stamped'; end if;
  select count(*) into n from public.site_snapshots
   where user_id = auth.uid() and purge_after is not null;
  if n <> 0 then raise exception 'FAIL (2.5): restore left a snapshot''s purge_after set (% of them)', n; end if;
  raise notice 'PASS (2.5): restore_account() clears the profile and every snapshot, and answers true';
end $$;

reset role;

-- The deadline moved into the PAST, as the owner: from here 2.6's purge owns the account, and
-- restore must refuse rather than clear a state the purge may already be halfway through.
update public.profiles
   set deleted_at = now() - interval '15 days', purge_after = now() - interval '1 day'
 where user_id = '11111111-1111-1111-1111-111111111111';
update public.site_snapshots
   set purge_after = now() - interval '1 day'
 where id = 'aaaaaaaa-5555-0000-0000-000000000001';

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

do $$
declare cleared boolean; n int;
begin
  cleared := public.restore_account();
  if cleared then raise exception 'FAIL (2.5): restore_account() answered true after the deadline had passed'; end if;
  select count(*) into n from public.profiles
   where user_id = auth.uid() and deleted_at is not null and purge_after is not null;
  if n <> 1 then raise exception 'FAIL (2.5): a refused restore cleared the profile anyway'; end if;
  select count(*) into n from public.site_snapshots
   where id = 'aaaaaaaa-5555-0000-0000-000000000001' and purge_after is not null;
  if n <> 1 then raise exception 'FAIL (2.5): a refused restore cleared the snapshot anyway'; end if;
  raise notice 'PASS (2.5): past the deadline restore_account() answers false and clears nothing';
end $$;

reset role;

-- Neither function is anon's. `revoke execute … from public, anon` is what makes this 42501 —
-- without it a definer function is granted to PUBLIC by default. The claim is not "it would find
-- no row"; it is "it cannot be called at all", so the subject is cleared first: an errant EXECUTE
-- would then change nothing and this block would fail for the RIGHT reason.
set request.jwt.claim.sub = '';
set role anon;

do $$
declare answered text;
begin
  begin
    answered := public.request_account_deletion()::text;
    raise exception 'FAIL (2.5): anon executed request_account_deletion() and got %', coalesce(answered, 'null');
  exception when insufficient_privilege then
    null;
  end;
  begin
    answered := public.restore_account()::text;
    raise exception 'FAIL (2.5): anon executed restore_account() and got %', coalesce(answered, 'null');
  exception when insufficient_privilege then
    null;
  end;
  raise notice 'PASS (2.5): anon cannot execute either deletion-window function (42501)';
end $$;

reset role;

-- The fixture's own tidy-up: leave A as an account with no window open, so a re-run starts where
-- this one did.
update public.profiles set deleted_at = null, purge_after = null
 where user_id = '11111111-1111-1111-1111-111111111111';

-- ============================================================================
-- Story 3.1 — DW-44: a Vault secret dies with the row that references it
-- ============================================================================
--
-- `private.site_credentials` holds UUIDs into `vault.secrets`, and until this trigger existed
-- NOTHING deleted the secret behind a ref that went away. The account purge, a disconnect and a
-- key rotation each drop the ref, and each would have left a customer's Ghost Admin key
-- encrypted-but-alive in the project's Vault for ever — invisible to every assertion in this
-- file, because every assertion was about ROWS.
--
-- Three paths, one trigger, and all three are proved by COUNTING SECRETS rather than by reading
-- the trigger's definition: a ref replaced (rotation), the site deleted (FR-C6 disconnect and the
-- 90-day orphan purge), and the ACCOUNT deleted (FR-A5), which reaches the credentials row
-- through two cascades and fires the trigger under the deleter's role — which is why the function
-- is `security definer` and why that bit is asserted here too.
--
-- `vault` on a bare container is PRELUDE.sql's stand-in, modelling §21j's grants. The gate diffs
-- only `public` and `private`, so the stand-in never enters the schema comparison.

reset role;

do $$
declare
  a    uuid = '44444444-4444-4444-4444-444444444444';
  site uuid = 'aaaaaaaa-0000-0000-0000-000000000044';
  r_admin uuid; r_staff uuid; r_new uuid; n int;
begin
  -- (0) The function is what the migration says it is. `security definer` is the load-bearing
  --     word — an invoker function would raise 42501 inside GoTrue's cascade and take the whole
  --     account deletion down with it — and a definer with an unpinned search_path is a hole.
  select count(*) into n
    from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'private' and p.proname = 'drop_vault_secrets'
     and p.prosecdef
     and p.proconfig is not null
     and exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%');
  if n <> 1 then
    raise exception 'FAIL (DW-44): private.drop_vault_secrets() is not a security definer with a pinned search_path';
  end if;
  raise notice 'PASS (DW-44): the vault-secret trigger function is security definer with a pinned search_path';

  -- The fixture, re-runnable: its own account, its own site, two secrets it created itself.
  delete from auth.users where id = a;
  insert into auth.users(id) values (a);
  insert into public.sites(id, user_id, url) values (site, a, 'https://vault-44.example');
  select vault.create_secret('kid44:aa', null, 'site 44 admin') into r_admin;
  select vault.create_secret('sid44:bb', null, 'site 44 staff') into r_staff;
  insert into private.site_credentials(site_id, user_id, admin_key_vault_ref, staff_token_vault_ref)
    values (site, a, r_admin, r_staff);
  select count(*) into n from vault.secrets where id in (r_admin, r_staff);
  if n <> 2 then
    raise exception 'FAIL (DW-44): the fixture did not create two secrets (found %) — the assertions below would pass over nothing', n;
  end if;

  -- (1) ROTATION. Story 3.6 re-enters a key; `store()` replaces the ref and remembers nothing
  --     about Vault, so the OLD secret has no other reference the moment the update commits.
  select vault.create_secret('kid44:cc', null, 'site 44 admin') into r_new;
  update private.site_credentials set admin_key_vault_ref = r_new where site_id = site;
  select count(*) into n from vault.secrets where id = r_admin;
  if n <> 0 then raise exception 'FAIL (DW-44): the replaced Admin key secret is still in the vault'; end if;
  select count(*) into n from vault.secrets where id = r_new;
  if n <> 1 then raise exception 'FAIL (DW-44): the rotation deleted the NEW secret as well as the old one'; end if;
  select count(*) into n from vault.secrets where id = r_staff;
  if n <> 1 then raise exception 'FAIL (DW-44): rotating the Admin key deleted the untouched Staff token secret'; end if;
  raise notice 'PASS (DW-44): a rotation deletes the secret behind the ref it replaced, and only that one';

  -- (1b) THE REMOVE PATH — `remove()` nulls a ref — AND THE DEFINER CONTROL (review, 2026-09-07).
  --      The update runs under a probe role holding UPDATE on the credentials row and NOTHING on
  --      `vault` (bypassrls, as service_role is, so the row is reachable at all). With `security
  --      definer` the trigger deletes as its owner; with `security invoker` this statement raises
  --      42501 — the one thing step (0)'s catalogue bit cannot show.
  execute 'create role dw44_probe bypassrls';
  execute 'grant usage on schema private to dw44_probe';
  execute 'grant select, update on private.site_credentials to dw44_probe';
  execute 'set role dw44_probe';
  update private.site_credentials set staff_token_vault_ref = null where site_id = site;
  execute 'reset role';
  execute 'drop owned by dw44_probe';
  execute 'drop role dw44_probe';
  select count(*) into n from vault.secrets where id = r_staff;
  if n <> 0 then raise exception 'FAIL (DW-44): the removed Staff token secret is still in the vault'; end if;
  raise notice 'PASS (DW-44): nulling a ref deletes its secret, under a role that may not touch the vault itself';

  -- (2) THE SITE DELETED — FR-C6's disconnect and the 90-day orphan purge. `site_credentials`
  --     cascades from `sites`, and BOTH kinds go, not just the one a caller happened to name.
  select vault.create_secret('sid44:ff', null, 'site 44 staff') into r_staff;
  update private.site_credentials set staff_token_vault_ref = r_staff where site_id = site;
  delete from public.sites where id = site;
  select count(*) into n from vault.secrets where id in (r_new, r_staff);
  if n <> 0 then raise exception 'FAIL (DW-44): % secret(s) survived the site being deleted', n; end if;
  raise notice 'PASS (DW-44): deleting a site takes both of its secrets out of the vault';

  -- (3) THE ACCOUNT DELETED — FR-A5's purge, the path the trigger is `security definer` FOR: the
  --     delete arrives through `auth.users`, under GoTrue's role, and reaches here by cascade.
  insert into public.sites(id, user_id, url) values (site, a, 'https://vault-44.example');
  select vault.create_secret('kid44:dd', null, 'site 44 admin') into r_admin;
  select vault.create_secret('sid44:ee', null, 'site 44 staff') into r_staff;
  insert into private.site_credentials(site_id, user_id, admin_key_vault_ref, staff_token_vault_ref)
    values (site, a, r_admin, r_staff);
  delete from auth.users where id = a;
  select count(*) into n from vault.secrets where id in (r_admin, r_staff);
  if n <> 0 then raise exception 'FAIL (DW-44): % secret(s) survived the account being deleted', n; end if;
  select count(*) into n from public.sites where id = site;
  if n <> 0 then raise exception 'FAIL (DW-44): the site row survived the account being deleted'; end if;
  raise notice 'PASS (DW-44): deleting an account takes its sites'' secrets out of the vault';
end $$;

-- ── STORY 3.9 — the four constraints of 20260911100000, and the rollback DW-80 named ─────────────
--
-- BEHAVIOURAL, NOT CATALOGUE. Each of the first four does the thing the constraint forbids and
-- insists on the refusal, so reverting one statement in the migration turns exactly one assertion
-- red — which is the control the Schema phase runs (revert in a scratch copy, watch the gate fail).
-- A `select … from pg_constraint` would pass on a constraint that existed and did not bite.
--
-- The fifth is DW-80's, and it is a different shape: it INDUCES the failure the claim is about.
-- "A store that rolls back leaves no audit row" was asserted in the migration, the spec, the ledger
-- and the code, and induced nowhere — a structural claim with no control is still a claim without
-- a control (standing rule 2). This is the container's job precisely because inducing the failure
-- means reaching past the application into its transaction.
do $$
declare
  a    uuid = '55555555-5555-5555-5555-555555555555';
  b    uuid = '66666666-6666-6666-6666-666666666666';
  site uuid = 'aaaaaaaa-0000-0000-0000-000000000039';
  n int;
begin
  delete from auth.users where id in (a, b);
  insert into auth.users(id) values (a), (b);
  insert into public.sites(id, user_id, url) values (site, a, 'https://sweep-39.example');

  -- (1) DW-24 — `unique (user_id, slug)`, scoped to the OWNER and not global.
  insert into public.projects(user_id, name, slug, style_pack) values (a, 'One', 'blog', '{}');
  begin
    insert into public.projects(user_id, name, slug, style_pack) values (a, 'Two', 'blog', '{}');
    raise exception 'FAIL (DW-24): one account took the slug `blog` twice';
  exception when unique_violation then
    raise notice 'PASS (DW-24): a second project with a taken slug is refused by the database (%)', sqlstate;
  end;
  -- and the half that would be a bug if the constraint were global: B may have a `blog` too.
  insert into public.projects(user_id, name, slug, style_pack) values (b, 'Theirs', 'blog', '{}');
  raise notice 'PASS (DW-24): the same slug under a DIFFERENT account is still allowed';

  -- (2) DW-69 — the partial unique index on `linked_site_id`, FR-B5's "at most one" made structural.
  update public.projects set linked_site_id = site where user_id = a and slug = 'blog';
  begin
    insert into public.projects(user_id, name, slug, style_pack, linked_site_id)
      values (a, 'Second brand', 'blog-2', '{}', site);
    raise exception 'FAIL (DW-69): two projects claimed the same linked_site_id';
  exception when unique_violation then
    raise notice 'PASS (DW-69): a second project on one linked site is refused by the database (%)', sqlstate;
  end;
  -- PARTIAL, so the ordinary state — no brand link at all — is not made unique by accident.
  insert into public.projects(user_id, name, slug, style_pack) values (a, 'Unlinked one', 'u1', '{}');
  insert into public.projects(user_id, name, slug, style_pack) values (a, 'Unlinked two', 'u2', '{}');
  raise notice 'PASS (DW-69): two projects with a null linked_site_id are still allowed';

  -- (3) DW-53 — the audit log's `outcome` refuses a fourth word.
  begin
    insert into private.credential_audit(action, user_id, route, outcome)
      values ('admin_read', a, '/sweep-39', 'maybe');
    raise exception 'FAIL (DW-53): private.credential_audit accepted an outcome outside ok/denied/error';
  exception when check_violation then
    raise notice 'PASS (DW-53): the audit log refuses an unknown outcome (%)', sqlstate;
  end;
  insert into private.credential_audit(action, user_id, route, outcome)
    values ('admin_read', a, '/sweep-39', 'ok');
  raise notice 'PASS (DW-53): the three real outcomes still write';

  -- (4) DW-45 — `restored_by` set-nulls instead of refusing the purge.
  update public.entitlements set restored_by = b where user_id = a;
  delete from auth.users where id = b;
  select count(*) into n from public.entitlements where user_id = a and restored_by is null;
  if n <> 1 then
    raise exception 'FAIL (DW-45): purging the account named in restored_by did not null the column';
  end if;
  select count(*) into n from public.entitlements where user_id = a;
  if n <> 1 then
    raise exception 'FAIL (DW-45): the entitlement row did not survive the purge of the account it named';
  end if;
  raise notice 'PASS (DW-45): purging the restorer nulls the column and the entitlement row survives';

  -- (5) DW-80 — INDUCE the rollback. `store()` writes the credential row and its audit row inside
  --     one `sql().begin()`; the claim is that a failure anywhere in that block leaves NO audit row
  --     behind. The savepoint below is that transaction, the division by zero is the failure, and
  --     the counts on both sides are the control: the audit row is visible INSIDE the block (so the
  --     assertion is not passing over a write that never happened) and gone after the rollback.
  select count(*) into n from private.credential_audit where route = '/sweep-39-rollback';
  if n <> 0 then raise exception 'FAIL (DW-80): the fixture route already carries a row'; end if;
  begin
    insert into private.site_credentials(site_id, user_id, admin_key_vault_ref)
      values (site, a, gen_random_uuid());
    insert into private.credential_audit(action, user_id, site_id, route, outcome)
      values ('credential_change', a, site, '/sweep-39-rollback', 'ok');
    select count(*) into n from private.credential_audit where route = '/sweep-39-rollback';
    if n <> 1 then
      raise exception 'FAIL (DW-80): the audit row was not visible inside its own transaction — this proof would pass over nothing';
    end if;
    perform 1 / 0;                     -- the store failing after both writes
  exception
    when division_by_zero then null;   -- the implicit savepoint rolls both writes back
    when others then raise;
  end;
  select count(*) into n from private.credential_audit where route = '/sweep-39-rollback';
  if n <> 0 then
    raise exception 'FAIL (DW-80): a rolled-back store left % audit row(s) claiming it happened', n;
  end if;
  select count(*) into n from private.site_credentials where site_id = site;
  if n <> 0 then
    raise exception 'FAIL (DW-80): the rolled-back credential row survived — the fixture is not modelling one transaction';
  end if;
  raise notice 'PASS (DW-80): a store that fails inside its transaction leaves no audit row behind';

  delete from auth.users where id in (a, b);
end $$;

-- ── STORY 5.8 — DW-193's constraint, and `sync_project_doc()`'s compare-and-set ──────────────────
--
-- TWO CLAIMS, BOTH BEHAVIOURAL. Neither is a catalogue read: a `select … from pg_constraint` passes
-- on a constraint that exists and bites the wrong string, and a `has_function_privilege` passes on a
-- function that is executable and writes the wrong rows.
--
-- (A) DW-193 — `template_key_shape` used to carry two backslashes, which under
--     `standard_conforming_strings = on` is "a literal backslash, then any character" and not an
--     escaped dot, so it refused EVERY `custom:` key. Executed on production 2026-09-18 and green on
--     this gate the whole time, because nothing here had ever inserted one. That is the hole this
--     block closes: the key that used to be refused is inserted, and a key that must STILL be refused
--     is attempted beside it, so a regression in either direction turns exactly one assertion red.
--
-- (B) AD-15's flush. `public.sync_project_doc()` is `security definer`, which is the whole reason it
--     needs this: a definer function runs as its OWNER and RLS does not constrain it, so "it only ever
--     touches auth.uid()'s project" is a claim about the WHERE clause and nothing else. Proved as two
--     tenants, exactly as every other surface in this file is: the compare-and-set writes on a
--     matching base, writes NOTHING on a stale one and says so, answers NULL for a project that is
--     not the caller's, and cannot be called by `anon` at all.

reset role;

delete from auth.users where id in ('77777777-7777-7777-7777-777777777777',
                                    '88888888-8888-8888-8888-888888888888');
insert into auth.users(id) values ('77777777-7777-7777-7777-777777777777'),
                                  ('88888888-8888-8888-8888-888888888888');
insert into public.projects(id,user_id,name,slug,style_pack) values
  ('cccccccc-5588-0000-0000-000000000001','77777777-7777-7777-7777-777777777777','Pilot','pilot-58','{}');
insert into public.projects(id,user_id,name,slug,style_pack) values
  ('dddddddd-5588-0000-0000-000000000002','88888888-8888-8888-8888-888888888888','Theirs','theirs-58','{}');

set role authenticated;
set request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';

do $$
declare
  c_proj uuid = 'cccccccc-5588-0000-0000-000000000001';
  answer jsonb; rev bigint; stored jsonb; n int;
begin
  -- (A) DW-193. All three membership keys, because all three were refused.
  insert into public.project_templates(project_id,user_id,template_key,doc) values
    (c_proj,'77777777-7777-7777-7777-777777777777','custom:custom-signup.hbs','{"instances":[]}'),
    (c_proj,'77777777-7777-7777-7777-777777777777','custom:custom-signin.hbs','{"instances":[]}'),
    (c_proj,'77777777-7777-7777-7777-777777777777','custom:custom-member-home.hbs','{"instances":[]}');
  raise notice 'PASS (DW-193): the three custom: membership keys insert';

  -- and the control that names the old cause: a literal backslash and any character used to be
  -- ACCEPTED by the broken pattern and must be refused by the repaired one.
  begin
    insert into public.project_templates(project_id,user_id,template_key,doc)
      values (c_proj,'77777777-7777-7777-7777-777777777777','custom:custom-signup\xhbs','{}');
    raise exception 'FAIL (DW-193): `custom:custom-signup\xhbs` was accepted — the pattern still reads its backslash as an escape';
  exception when check_violation then
    raise notice 'PASS (DW-193): a literal backslash in place of the dot is refused (%)', sqlstate;
  end;

  -- (B1) the compare-and-set writes on a matching base, and moves the revision by exactly one.
  select revision into rev from public.projects where id = c_proj;
  answer := public.sync_project_doc(c_proj,
              jsonb_build_object('home', '{"instances":[{"instanceId":"a"}]}'::jsonb), rev);
  if answer is null then raise exception 'FAIL (5.8): sync_project_doc() answered null for the caller''s own project'; end if;
  if (answer->>'applied')::boolean is not true then
    raise exception 'FAIL (5.8): a matching base_revision was refused (%)', answer;
  end if;
  if (answer->>'revision')::bigint <> rev + 1 then
    raise exception 'FAIL (5.8): the revision moved by % and not by one', (answer->>'revision')::bigint - rev;
  end if;
  select doc into stored from public.project_templates where project_id = c_proj and template_key = 'home';
  if stored is null or stored->'instances'->0->>'instanceId' <> 'a' then
    raise exception 'FAIL (5.8): the applied call did not write the doc it was given';
  end if;
  raise notice 'PASS (5.8): a matching base_revision upserts the doc and advances revision by one';

  -- (B2) a STALE base writes nothing and hands back the revision that is actually there. The stale
  --      value used is `rev` — the one that has just been superseded — which is the real shape of
  --      the conflict: a second tab flushed once while this one was editing.
  answer := public.sync_project_doc(c_proj,
              jsonb_build_object('home', '{"instances":[{"instanceId":"CLOBBER"}]}'::jsonb), rev);
  if (answer->>'applied')::boolean is not false then
    raise exception 'FAIL (5.8): a stale base_revision was applied (%)', answer;
  end if;
  if (answer->>'revision')::bigint <> rev + 1 then
    raise exception 'FAIL (5.8): the refusal reported revision % rather than the current %', answer->>'revision', rev + 1;
  end if;
  select doc into stored from public.project_templates where project_id = c_proj and template_key = 'home';
  if stored->'instances'->0->>'instanceId' <> 'a' then
    raise exception 'FAIL (5.8): a refused call overwrote the doc anyway';
  end if;
  select revision into n from public.projects where id = c_proj;
  if n <> rev + 1 then raise exception 'FAIL (5.8): a refused call moved the revision'; end if;
  raise notice 'PASS (5.8): a stale base_revision writes nothing and reports the current revision';

  -- (B2a) AND THE COLLISION THE RETURN SHAPE EXISTS FOR. `applied` is what tells the two apart:
  --       a success and this refusal both carry the number `rev + 1`, so a bigint return would be
  --       read as a success and the unsent work dropped.
  if (answer->>'revision')::bigint <> rev + 1 then
    raise exception 'FAIL (5.8): this assertion is no longer standing on the collision it was written for';
  end if;
  raise notice 'PASS (5.8): the refusal and a success carry the same number — `applied` is the only thing that separates them';
end $$;

-- (B3) ANOTHER USER'S PROJECT. B is a real account with a real project, so this is the cross-tenant
--      question and not "no such row": the definer function must answer NULL and write nothing.
set request.jwt.claim.sub = '88888888-8888-8888-8888-888888888888';

do $$
declare
  c_proj uuid = 'cccccccc-5588-0000-0000-000000000001';
  answer jsonb; stored jsonb; n int;
begin
  answer := public.sync_project_doc(c_proj,
              jsonb_build_object('home', '{"instances":[{"instanceId":"B_WAS_HERE"}]}'::jsonb), 1::bigint);
  if answer is not null then
    raise exception 'FAIL (5.8): B got % for A''s project — a definer function answered across the tenant line', answer;
  end if;
  reset role;
  select doc into stored from public.project_templates where project_id = c_proj and template_key = 'home';
  if stored->'instances'->0->>'instanceId' <> 'a' then
    raise exception 'FAIL (5.8): B wrote into A''s project through the RPC';
  end if;
  select count(*) into n from public.project_templates where project_id = c_proj and user_id <> '77777777-7777-7777-7777-777777777777';
  if n <> 0 then raise exception 'FAIL (5.8): % row(s) of B''s were left in A''s project', n; end if;
  raise notice 'PASS (5.8): another user''s project id answers null and writes nothing — the same answer as no such project';

  -- and an id that exists nowhere answers identically, so the null is no existence oracle.
  set role authenticated;
  answer := public.sync_project_doc('00000000-0000-0000-0000-0000000058ff',
              jsonb_build_object('home','{}'::jsonb), 0::bigint);
  if answer is not null then
    raise exception 'FAIL (5.8): a project that does not exist answered % rather than null', answer;
  end if;
  raise notice 'PASS (5.8): a nonexistent project answers exactly what another user''s does';
end $$;

reset role;

-- (B4) anon cannot call it at all. `revoke execute … from public, anon` is what makes this 42501 —
--      without it a definer function is granted to PUBLIC by default. The claim is not "it would
--      return null"; it is "it cannot be called", which is why the subject is cleared first: an
--      errant EXECUTE would then change nothing and this block would fail for the RIGHT reason.
set request.jwt.claim.sub = '';
set role anon;

do $$
declare answered text;
begin
  answered := public.sync_project_doc('cccccccc-5588-0000-0000-000000000001','{}'::jsonb,0::bigint)::text;
  raise exception 'FAIL (5.8): anon executed sync_project_doc() and got %', coalesce(answered,'null');
exception
  when insufficient_privilege then
    raise notice 'PASS (5.8): anon cannot execute sync_project_doc() (42501)';
end $$;

reset role;

delete from auth.users where id in ('77777777-7777-7777-7777-777777777777',
                                    '88888888-8888-8888-8888-888888888888');

-- ── STORY 5.16 — page 2's keys, on both tables ────────────────────────────────────────────────
--
-- BEHAVIOURAL, for 5.8's reason: a `select … from pg_constraint` passes on a constraint that exists
-- and refuses the wrong string. Page 2 is a design of its own on every canvas that paginates (R-178,
-- R-179): Home's under `index`, Tag's and Author's under `tag-paged` and `author-paged`. A list that
-- does not name them refuses every write of one — the doc AND its prefs row — so all three are
-- inserted into BOTH tables as the tenant, through RLS, and a near miss that must STILL be refused is
-- attempted beside them on each table. A regression in either direction turns one assertion red.

reset role;

delete from auth.users where id = '99999999-5516-0000-0000-000000000009';
insert into auth.users(id) values ('99999999-5516-0000-0000-000000000009');
insert into public.projects(id,user_id,name,slug,style_pack) values
  ('eeeeeeee-5516-0000-0000-000000000001','99999999-5516-0000-0000-000000000009','Paged','paged-516','{}');

set role authenticated;
set request.jwt.claim.sub = '99999999-5516-0000-0000-000000000009';

do $$
declare
  c_proj uuid = 'eeeeeeee-5516-0000-0000-000000000001';
  c_user uuid = '99999999-5516-0000-0000-000000000009';
begin
  insert into public.project_templates(project_id,user_id,template_key,doc) values
    (c_proj,c_user,'index','{"instances":[]}'),
    (c_proj,c_user,'tag-paged','{"instances":[]}'),
    (c_proj,c_user,'author-paged','{"instances":[]}');
  insert into public.project_template_prefs(project_id,user_id,template_key) values
    (c_proj,c_user,'index'), (c_proj,c_user,'tag-paged'), (c_proj,c_user,'author-paged');
  raise notice 'PASS (5.16): index, tag-paged and author-paged insert on both tables';

  begin
    insert into public.project_templates(project_id,user_id,template_key,doc)
      values (c_proj,c_user,'home-paged','{}');
    raise exception 'FAIL (5.16): `home-paged` was accepted on project_templates — Home''s page 2 is `index`, and the list is exact';
  exception when check_violation then
    raise notice 'PASS (5.16): a key the list does not name is still refused on project_templates (%)', sqlstate;
  end;

  begin
    insert into public.project_template_prefs(project_id,user_id,template_key)
      values (c_proj,c_user,'tag-page');
    raise exception 'FAIL (5.16): `tag-page` was accepted on project_template_prefs';
  exception when check_violation then
    raise notice 'PASS (5.16): a key the list does not name is still refused on project_template_prefs (%)', sqlstate;
  end;
end $$;

reset role;

delete from auth.users where id = '99999999-5516-0000-0000-000000000009';
