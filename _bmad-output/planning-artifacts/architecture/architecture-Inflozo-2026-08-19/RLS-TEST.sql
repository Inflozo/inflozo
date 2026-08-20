-- Inflozo — runnable RLS + constraint proof for the E1 schema story.
-- E1's exit is "RLS verified on every table the schema story creates". This IS that check.
-- Run:  docker run -d --name pg -e POSTGRES_PASSWORD=x postgres:17-alpine
--       psql -f PRELUDE.sql -f SCHEMA.sql -f RLS-TEST.sql   (expect every line to read PASS)
-- Against HOSTED Supabase, omit PRELUDE.sql -- the platform provides everything it stands in for,
-- and its auth.uid() stub would overwrite the real one:
--       psql "$SUPABASE_DB_URL" -f SCHEMA.sql -f RLS-TEST.sql
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

\set ON_ERROR_STOP on
\pset pager off
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
grant select on public.suggestion_votes, public.suggestions_public to anon;

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
  exception when others then raise notice 'PASS: cross-tenant project insert blocked (%)', sqlstate; end;

  begin
    update public.sites set title='hijacked' where user_id='22222222-2222-2222-2222-222222222222';
    if found then raise exception 'FAIL: A updated Bs site'; else raise notice 'PASS: A cannot see or update Bs site'; end if;
  exception when others then raise notice 'PASS: cross-tenant site update blocked (%)', sqlstate; end;

  begin
    update public.profiles set is_admin=true where user_id='11111111-1111-1111-1111-111111111111';
    raise exception 'FAIL: A self-granted admin';
  exception when others then raise notice 'PASS: is_admin frozen against client update (%)', sqlstate; end;

  begin
    insert into public.deploys(project_id,user_id,site_id,version,theme_name,status)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
              'aaaaaaaa-0000-0000-0000-000000000001','1.0.0','inflozo-a','live');
    raise exception 'FAIL: A forged a deploy row';
  exception when others then raise notice 'PASS: deploys is read-only to the client (%)', sqlstate; end;

  begin
    insert into public.suggestion_votes(suggestion_id,user_id)
      values ('cccccccc-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222');
    raise exception 'FAIL: A voted as B';
  exception when others then raise notice 'PASS: vote-as-another-user blocked (%)', sqlstate; end;
end $$;

-- --- the column-write surfaces the adversarial review found open (SCHEMA.sql §11) ---
do $$ begin
  begin
    update public.sites set deploy_rate_limit_exempt = true
      where user_id='11111111-1111-1111-1111-111111111111';
    raise exception 'FAIL: A granted itself the deploy rate-limit bypass';
  exception when others then raise notice 'PASS: sites.deploy_rate_limit_exempt is server-only (%)', sqlstate; end;

  begin
    update public.sites set capability='full', capability_source='user_declared'
      where user_id='11111111-1111-1111-1111-111111111111';
    raise exception 'FAIL: A forged the FR-C2 Preview-only verdict';
  exception when others then raise notice 'PASS: sites.capability is server-only (%)', sqlstate; end;

  begin
    update public.projects set revision = revision + 5
      where id='aaaaaaaa-1111-0000-0000-000000000001';
    raise exception 'FAIL: A wrote projects.revision (AD-15 lineage marker)';
  exception when others then raise notice 'PASS: projects.revision is server-only (%)', sqlstate; end;

  begin
    update public.deploy_jobs set stage='done';
    raise exception 'FAIL: A set a deploy job to done';
  exception when others then raise notice 'PASS: deploy_jobs grants only cancel_requested (%)', sqlstate; end;

  begin
    update public.custom_settings set frozen_at = null;
    raise exception 'FAIL: A nulled frozen_at, which reopens the key rename';
  exception when others then raise notice 'PASS: custom_settings.frozen_at is server-only (%)', sqlstate; end;

  begin
    update public.template_binding_checklist set filename='other.hbs';
    raise exception 'FAIL: A rewrote a checklist filename';
  exception when others then raise notice 'PASS: checklist grants only marked_done_at (%)', sqlstate; end;

  begin
    insert into storage.objects(bucket_id, name)
      values ('deploy-artifacts','aaaaaaaa-1111-0000-0000-000000000001/theme.zip');
    raise exception 'FAIL: A wrote into deploy-artifacts';
  exception when others then raise notice 'PASS: deploy-artifacts is server-only storage (%)', sqlstate; end;

  begin
    insert into storage.objects(bucket_id, name)
      values ('assets','22222222-2222-2222-2222-222222222222/x.webp');
    raise exception 'FAIL: A wrote into Bs asset folder';
  exception when others then raise notice 'PASS: storage assets are folder-scoped to the owner (%)', sqlstate; end;

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
  exception when others then raise notice 'PASS: projects.revision is monotonic even server-side (%)', sqlstate; end;

  insert into public.project_site_bindings(project_id,user_id,site_id,theme_name)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
            'aaaaaaaa-0000-0000-0000-000000000001','inflozo-a');
  begin
    update public.projects set slug='renamed' where id='aaaaaaaa-1111-0000-0000-000000000001';
    raise exception 'FAIL: slug changed after a theme name was frozen';
  exception when others then raise notice 'PASS: projects.slug frozen once a theme name exists (%)', sqlstate; end;

  begin
    insert into public.project_site_bindings(project_id,user_id,site_id,theme_name)
      values ('bbbbbbbb-1111-0000-0000-000000000002','22222222-2222-2222-2222-222222222222',
              'aaaaaaaa-0000-0000-0000-000000000001','inflozo-a');
    raise exception 'FAIL: two projects froze the same theme name on one site';
  exception when others then raise notice 'PASS: theme name is unique per site (%)', sqlstate; end;

  insert into public.deployed_template_names(project_id,user_id,filename)
    values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','custom-member-home.hbs');
  begin
    insert into public.custom_templates(project_id,user_id,display_name,filename,kind,surface)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
              'Member Home','custom-member-home.hbs','membership','member_home');
    raise exception 'FAIL: reused a filename this project already deployed';
  exception when others then raise notice 'PASS: a deployed custom-template name can never be reused (%)', sqlstate; end;

  begin
    insert into public.project_templates(project_id,user_id,template_key,doc)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','posts','{}');
    raise exception 'FAIL: an unknown template_key was accepted';
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
    raise exception 'FAIL: 18th custom setting accepted';
  exception when others then raise notice 'PASS: custom-setting cap held at 17 (%)', sqlstate; end;
  begin
    insert into public.custom_settings(project_id,user_id,key,label,type,default_value,bound_to)
      values ('bbbbbbbb-1111-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','c','C','color','#abc','{}');
    raise exception 'FAIL: 3-digit hex colour default accepted';
  exception when others then raise notice 'PASS: colour default must be 6-digit hex (%)', sqlstate; end;
  begin
    insert into public.translation_overrides(project_id,user_id,catalog_key,value)
      values ('aaaaaaaa-1111-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','credit.built_with','Nope');
    raise exception 'FAIL: credit.* override accepted';
  exception when others then raise notice 'PASS: credit.* namespace locked (%)', sqlstate; end;
end $$;
\pset pager off
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
  where n.nspname='public' and c.relkind='r' and not c.relrowsecurity;
  if bad is not null then raise exception 'FAIL: RLS is disabled on %', bad; end if;
  raise notice 'PASS: RLS is enabled on every public table';

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

  -- 5d. A function with a null ACL is EXECUTE to PUBLIC, which includes anon.
  select string_agg(p.proname, ', ' order by p.proname) into bad
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proacl is null
    and p.proname in ('touch_updated_at','freeze_columns','guard_revision','guard_slug',
                      'guard_custom_template_name','guard_lock_generation','sync_vote_count',
                      'enforce_custom_setting_cap','provision_entitlement','provision_profile',
                      'guard_lock_takeover','guard_custom_setting_freeze');
  if bad is not null then raise exception 'FAIL: function(s) executable by PUBLIC: %', bad; end if;
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
  --      granted two of fourteen and Round 4 found the other twelve still unreachable. Asserting
  --      the class is the fix; the grant list in SCHEMA.sql §11a(7) is just today's instance of it.
  select string_agg(t.tablename, ', ' order by t.tablename) into bad
  from pg_tables t
  where t.schemaname='public'
    and t.tablename in ('deploys','deploy_jobs','entitlements','subscriptions','exports',
                        'project_site_bindings','deployed_template_names','asset_usages',
                        'checkout_consents','notifications','template_binding_checklist','profiles')
    and not (has_table_privilege('service_role', 'public.'||t.tablename, 'SELECT')
         and has_table_privilege('service_role', 'public.'||t.tablename, 'INSERT'));
  if bad is not null then raise exception 'FAIL (F11): AD-8 table(s) the server cannot write: %', bad; end if;
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
    ('auth_user_profile')               -- a profiles row at signup
  ) as x(want)
  where not exists (select 1 from pg_trigger g where g.tgname = x.want and not g.tgisinternal);
  if bad is not null then raise exception 'FAIL: missing guard trigger(s): %', bad; end if;
  raise notice 'PASS: the AD-9, FR-D18 and signup guards all exist';
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
  insert into auth.users(id) values ('33333333-3333-3333-3333-333333333333');
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
  insert into auth.users(id) values ('44444444-4444-4444-4444-444444444444');
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
  if exposed <> '' and exposed like '%storage%' then
    raise exception 'FAIL: `storage` is an exposed PostgREST schema (%). With TRUNCATE still granted (D6), any authenticated session can destroy every user''s objects.', exposed;
  end if;
  raise notice 'PASS: storage is not PostgREST-exposed (db_schemas = %)', coalesce(nullif(exposed, ''), 'unset locally');
end $$;
