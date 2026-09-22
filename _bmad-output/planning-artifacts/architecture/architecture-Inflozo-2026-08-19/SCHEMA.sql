-- Inflozo v1 — complete Postgres schema + RLS.
-- Companion to ARCHITECTURE-SPINE.md. Derived from PRD §5 (not from §7.5's sketch, which
-- the PRD itself labels illustrative). Every table is named by the FR that requires it.
-- Consumed by E1's schema story, whose exit is "RLS verified on every table this creates".
--
-- Conventions fixed by AD-6 / AD-7 / AD-8 of the spine and assumed everywhere below:
--   * every RLS-protected table carries user_id directly; no policy traverses a join
--   * every policy body wraps auth.uid() as (select auth.uid()) so the planner hoists it
--   * ids are uuid v4 defaulted in Postgres; timestamps are timestamptz; money never appears
--   * a table with no policy is server-only (service role); that is the deny mechanism

-- ============================================================================
-- 0a. Default privileges — grant IN, never out.  [R2-4]
-- ============================================================================
--
-- Round 1 found `suggestions_public` writable cross-tenant because `authenticated` held write
-- privileges nobody in this file ever granted: they were inherited from a platform default and
-- §11 narrowed only the objects it happened to think of. Round 2 found the same root cause on
-- every table. Narrowing per object is a list you must remember; this is a floor.
--
-- Every object created from here on confers NOTHING on anon/authenticated until this file grants
-- it explicitly (§11a). That also matches where the platform is going -- see PRELUDE.sql (b).
--
-- Note this governs FUTURE objects only, which is exactly the point: it is the rule every later
-- migration inherits without having to know it exists. AD-26's per-migration checklist covers
-- views and functions too, because this statement does not reach objects created by another role.

-- NOTE the shape: ALTER DEFAULT PRIVILEGES takes ONE object type per statement. Round 1's rider was
-- written as a single `on tables, sequences, functions` clause, which Postgres rejects with a syntax
-- error at the first comma. Three statements, verified on PostgreSQL 17.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

create extension if not exists "pgcrypto";

-- ============================================================================
-- 0b. The `private` schema — off the data API entirely.  [Round 4, F6]
-- ============================================================================
--
-- AD-7 reads "reachable only by the service role INSIDE A SERVER ROUTE". Round 4 executed that
-- claim and it was false in its second half: the secret key reads these tables straight over
-- /rest/v1/, no route involved, because `public` is what PostgREST exposes.
--
--     (authenticated) GET /rest/v1/site_credentials -> 403 42501     <- the half that held
--     (secret key)    GET /rest/v1/site_credentials -> 200, rows=1   <- the half that did not
--
-- A schema PostgREST does not expose cannot be reached by ANY key, which is what makes the
-- "inside a server route" half true rather than aspirational: a server route holds a direct
-- database connection, the data API does not reach here at all.
--
-- `private` MUST NOT be added to PGRST_DB_SCHEMAS. RLS-TEST.sql asserts that, because this
-- control is a configuration value and configuration drifts.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;
alter default privileges in schema private revoke all on tables    from anon, authenticated;
alter default privileges in schema private revoke all on sequences from anon, authenticated;
alter default privileges in schema private revoke all on functions from anon, authenticated;

-- ============================================================================
-- 0. helpers
-- ============================================================================

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- Protected columns are never client-writable (AD-9). Used on profiles.is_admin,
-- custom_settings.key, deployed_template_names.filename.
create or replace function public.freeze_columns() returns trigger
language plpgsql as $$
declare col text;
begin
  foreach col in array tg_argv loop
    if to_jsonb(new) -> col is distinct from to_jsonb(old) -> col then
      raise exception 'column %.% is immutable', tg_table_name, col using errcode = '42501';
    end if;
  end loop;
  return new;
end $$;

-- FR-Q2's freeze, which AD-9 names and which was never created.  [Round 4, F12]
--
-- AD-9 lists four frozen columns. Three had their trigger; custom_settings had only the cap.
-- Executed as the TABLE OWNER -- i.e. what a server bug is -- `key` renamed and `frozen_at` nulled,
-- while profiles.is_admin correctly refused. The column GRANT already stops a client, so this
-- closes the server-side half AD-31 requires ("they hold against the service role too").
--
-- The semantics are not freeze_columns(): frozen_at must be settable ONCE, null -> timestamp, when
-- the project first deploys or exports. What must never happen is a change AFTER it is set --
-- including back to null, which is the two-statement bypass AD-9 names by name.
create or replace function public.guard_custom_setting_freeze() returns trigger
language plpgsql as $$
begin
  if old.frozen_at is not null then
    if new.key is distinct from old.key then
      raise exception 'custom_settings.key is frozen once the setting has been deployed or exported (% -> %)', old.key, new.key
        using errcode = '42501';
    end if;
    if new.frozen_at is distinct from old.frozen_at then
      raise exception 'custom_settings.frozen_at is immutable once set -- nulling it would reopen the key rename'
        using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

-- ============================================================================
-- 1. identity  — FR-A1..A6, FR-M4
-- ============================================================================

create table public.profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  is_admin      boolean not null default false,          -- FR-M4; owner seeded at setup, migrates at cutover
  -- FR-L3: on Free in an over-limit state, exactly one project stays editable
  free_editable_project_id uuid,
  autosave_enabled boolean not null default true,        -- FR-D10: the toggle is per USER, not per device
  -- FR-A5 soft delete: 14-day window, then hard purge
  deleted_at    timestamptz,
  purge_after   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.profiles (purge_after) where deleted_at is not null;

-- FR-A3: passkeys are auto-named from the AAGUID and renameable. THERE IS NO TABLE HERE, and
-- that is the finding rather than an omission. `passkey_labels` existed until 2026-09-07 on the
-- premise that "Supabase Auth's passkey API is Beta and carries no user-editable label, so the
-- label is ours". EXECUTION FALSIFIED IT (Story 2.1, 2026-09-06, DW-30): the installed
-- `@supabase/auth-js` 2.115.0 carries `friendly_name` on every passkey and a `PATCH
-- /passkeys/{id}` that sets it, max 120 characters (`dist/module/lib/types.d.ts:2404-2410,
-- 2437-2442`; `GoTrueClient.js:5668-5730`). Story 2.1 writes the auto-name there; Story 2.2
-- writes the rename there and revokes with `DELETE /passkeys/{id}`. The table never held a row
-- and Story 2.2 dropped it (`supabase/migrations/20260907120000_drop_passkey_labels.sql`): one
-- store beats two that can disagree, and nothing of ours now stores a credential id.

-- ============================================================================
-- 2. sites & connections — FR-C1..C8
-- ============================================================================

create type public.site_capability as enum ('full', 'preview_only');
create type public.capability_source as enum ('probe', 'deploy_error', 'user_declared');
create type public.site_health as enum ('healthy', 'unhealthy');

create table public.sites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  url           text not null,                            -- FR-C8: immutable; a domain move is disconnect+reconnect
  title         text,
  favicon_url   text,
  ghost_version text,                                     -- FR-C2: 5.x/6.x accepted, 4.x rejected
  capability        public.site_capability not null default 'full',
  capability_source public.capability_source,             -- FR-C2: probed, not asked, except on fallback
  content_key   text,                                     -- browser-safe by Ghost's design; delivered to the client
  credentials_present jsonb not null default
    '{"content":false,"admin":false,"staff":false}'::jsonb, -- FR-C1 partially-credentialed is first-class
  -- FR-C2/C4/C5: the snapshot the canvas shims and the pre-deploy checks both read
  site_settings jsonb not null default '{}'::jsonb,
  settings_read_at timestamptz,
  code_injection_notice_shown_at timestamptz,            -- FR-C2's notice is one-time, so it needs a fact
  health        public.site_health not null default 'healthy',
  last_checked_at   timestamptz,
  last_health_email_at timestamptz,                       -- FR-C5: ≤1 email per site per rolling 7 days
  -- FR-I4: routes state lives on the site, and there is no "unverified" limbo
  routes_last_offered      text,
  routes_live_sha256       text,
  routes_verified_at       timestamptz,
  deploy_rate_limit_exempt boolean not null default false, -- §4: T1–T4 exempt from FR-J11
  disconnected_at timestamptz,                            -- FR-C6: record survives; 90-day orphan rule
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, url)
);
create index on public.sites (user_id) where disconnected_at is null;
create index on public.sites (last_checked_at) where disconnected_at is null;

-- SERVER-ONLY (no RLS policy, ever). NFR-3: Admin key and Staff token are never sent to
-- any client. Keeping the Vault refs off `sites` makes that structural rather than a
-- column-list discipline every future SELECT has to remember.
create table private.site_credentials (
  site_id                uuid primary key references public.sites(id) on delete cascade,
  user_id                uuid not null references auth.users(id) on delete cascade,
  admin_key_vault_ref    uuid,                            -- vault.secrets(id)
  staff_token_vault_ref  uuid,                            -- nullable: deferred to first deploy, declinable
  admin_key_rotated_at   timestamptz,
  staff_token_rotated_at timestamptz,
  updated_at             timestamptz not null default now(),
  -- Story 3.6: the Admin key's PUBLIC id half (`id:secret`, the part before the colon). It is not
  -- a secret -- it travels in the header of every JWT Inflozo mints -- and it is what Manage keys
  -- draws as the key's mask and what a new connect matches to print FR-C8's "Moved domains?" hint.
  -- `text`, because Ghost's key id is a 24-character ObjectID hex string and not a uuid. LAST,
  -- because `alter table ... add column` appends and the gate diffs the two databases.
  admin_key_id           text
);

-- FR-J13 / FR-C6: keyed on user_id (the RLS key) and holding the site RECORD id, never the URL.
create table public.site_snapshots (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  site_id       uuid not null references public.sites(id) on delete cascade,
  storage_path  text not null,                            -- site-snapshots/{userId}/{siteId}/…
  theme_name    text,
  bytes         bigint,
  captured_at   timestamptz not null default now(),
  -- FR-A5's 14-DAY ACCOUNT-DELETION CLOCK, AND ONLY THAT (Story 3.5, 2026-09-09 — DW-43 closed).
  -- FR-C6's 90-day ORPHAN clock is DERIVED from `public.sites.disconnected_at` and is never
  -- stamped here: two clocks in one column is what made `restore_account()`'s `purge_after = null`
  -- ambiguous. `disconnectSite` is `disconnected_at`'s only writer; Story 7.20 reads the derived
  -- deadline (DW-75). See the comment beside `restore_account()` in
  -- `supabase/migrations/20260907150000_account_deletion_window.sql`.
  purge_after   timestamptz,
  download_offered_at timestamptz,
  unique (site_id)                                        -- one pre-Inflozo snapshot per site record
);

-- ============================================================================
-- 3. projects & canvases — FR-B1..B7, FR-D5..D22, FR-E1..E5, FR-Q1
-- ============================================================================

create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  slug          text not null,                            -- FR-J10: theme name derives from this. IMMUTABLE once any
                                                          -- project_site_bindings row exists (trigger below): a rename
                                                          -- must not give one project two unrelated theme names.
  style_pack    jsonb not null,                           -- FR-E1/E3: preset id + per-project token overrides, per mode
  dark_enabled  boolean not null default true,            -- FR-D7: Light+Dark is the default
  language      text not null default 'en',               -- FR-Q6: seeded from @site.locale, user-editable
  posts_per_page integer not null default 12               -- FR-Q1; emitted as a JSON number (FR-J2)
                 check (posts_per_page >= 1),
  credit_enabled boolean not null default true,           -- FR-J15: Pro may disable; locked on for Free at the exit
  linked_site_id uuid references public.sites(id) on delete set null,  -- FR-B5: at most one — the partial
                                                          -- unique index below, not this sentence, is what enforces it
  thumb_path    text,                                     -- FR-B1: unused in v1, retained so capture needs no migration
  -- AD1: the single monotonic revision every local doc carries as its base_revision
  revision      bigint not null default 0,
  rtl_ack_at    timestamptz,                              -- FR-Q6: blocking acknowledgement for an RTL language
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.projects (user_id, updated_at desc);
-- STORY 3.9, DW-24: the backstop under `uniqueSlug`'s read-then-write. FR-J10 makes the slug the
-- theme's name and keeps `slug` out of the update grant, so a collision could never be repaired by
-- a rename either. Scoped to the OWNER: two customers may each have a `blog`.
alter table public.projects add constraint projects_user_id_slug_key unique (user_id, slug);
-- STORY 3.9, DW-69: FR-B5's "at most one" made structural. This REPLACES the plain index that stood
-- here — a unique index serves every read the plain one served, and two indexes on one column is a
-- second thing to keep in step. Partial because `null` is the ordinary state of a project that was
-- never brand-linked.
create unique index projects_linked_site_id_key
  on public.projects (linked_site_id) where linked_site_id is not null;
alter table public.profiles add constraint profiles_free_editable_fk
  foreign key (free_editable_project_id) references public.projects(id) on delete set null;

-- One row per DESIGNED template. Absence of a row IS "untouched" (FR-D6) — which is why
-- per-canvas preferences live in their own table and cannot accidentally materialize a stack.
create table public.project_templates (
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  template_key  text not null,   -- site|home|index|post|page|tag|author|error|private|tag-paged|author-paged|custom:{filename}
  doc           jsonb not null,  -- ordered instances: {instanceId, layerName, designId, content,
                                 --  controls, parkedControls, darkOverrides, hidden, isMainFeed}
  updated_at    timestamptz not null default now(),
  primary key (project_id, template_key),
  -- Page 2 is a design of its own on every canvas that paginates (R-178, R-179): Home's under `index`, the file Ghost
  -- serves at /page/N/, and Tag's and Author's under `tag-paged` and `author-paged`, since an archive has no second
  -- file. Mirrors `supabase/migrations/20260922120000_page_two_template_keys.sql` on both tables (Story 5.16).
  constraint template_key_shape check (
    template_key in ('site','home','index','post','page','tag','author','error','private','tag-paged','author-paged')
    or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$')   -- ONE backslash: DW-193
);

-- FR-D22 preview subject, FR-D16 member-state coverage. Set-and-forget context that must NOT
-- count as "designed": storing it here keeps FR-D6's untouched/synthesized distinction intact.
create table public.project_template_prefs (
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  template_key  text not null,
  preview_subject jsonb,                                   -- {kind:'post'|'page'|'tag'|'author', id, slug}
  member_states_viewed text[] not null default '{}',       -- FR-D16's "states you have not looked at" nudge
  updated_at    timestamptz not null default now(),
  primary key (project_id, template_key),
  -- The same keys as `project_templates`, page 2's `tag-paged` and `author-paged` included (Story 5.16).
  constraint template_key_shape check (
    template_key in ('site','home','index','post','page','tag','author','error','private','tag-paged','author-paged')
    or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$')   -- ONE backslash: DW-193
);

-- FR-I3 + §7.4: custom-{name}.hbs is a FROZEN PUBLIC API. Two tables, deliberately:
-- one for live surfaces, one that is append-only and never deleted.
create type public.custom_template_kind as enum ('routes', 'membership');
create type public.membership_surface   as enum ('signup', 'signin', 'member_home');

create table public.custom_templates (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  display_name  text not null,
  filename      text not null,                            -- custom-{slug}.hbs, derived, shown live at the naming step
  kind          public.custom_template_kind not null,
  surface       public.membership_surface,                -- FR-D13: A30's explicit non-mechanical partition
  created_at    timestamptz not null default now(),
  unique (project_id, filename),                          -- §7.4 collision kind (1)
  constraint membership_has_surface check (kind <> 'membership' or surface is not null)
);

-- §7.4 collision kind (2): a name this project has ALREADY DEPLOYED can never be reused,
-- including one whose surface was since deleted. Append-only; nothing deletes from here.
create table public.deployed_template_names (
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  filename      text not null,
  first_deployed_at timestamptz not null default now(),
  primary key (project_id, filename)
);
create trigger deployed_template_names_frozen before update on public.deployed_template_names
  for each row execute function public.freeze_columns('filename');

-- FR-Q2: user-defined Ghost @custom settings. The three FR-Q5 dark built-ins are NOT rows —
-- the compiler emits them on every project unconditionally — so the cap here is 17, not 20.
create type public.ghost_setting_type  as enum ('select','boolean','color','image','text');
create type public.ghost_setting_group as enum ('site_wide','homepage','post');

create table public.custom_settings (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  key           text not null                             -- FR-Q2: immutable once deployed OR exported
                 check (key ~ '^[a-z][a-z0-9_]*$'),
  label         text not null,
  type          public.ghost_setting_type not null,
  options       jsonb,                                    -- select only
  default_value text,                                     -- FR-Q2: colour defaults must be 6-digit hex
  group_name    public.ghost_setting_group not null default 'site_wide',
  visibility_condition jsonb,
  bound_to      jsonb not null,                           -- {kind:'control'|'token', instanceId?, controlKey?, token?}
  position      integer not null default 0,
  frozen_at     timestamptz,                              -- set at first deploy or export; key immutable after
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (project_id, key),
  constraint no_image_default check (type <> 'image' or default_value is null),
  constraint hex6_colour     check (type <> 'color' or default_value ~ '^#[0-9A-Fa-f]{6}$')
);

-- FR-Q2's visible meter: 20 Ghost slots − 3 always-emitted built-ins (FR-Q5) = 17.
create or replace function public.enforce_custom_setting_cap() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.custom_settings where project_id = new.project_id) >= 17 then
    raise exception 'custom setting cap reached (17 user-defined + 3 reserved dark built-ins = Ghost''s 20)'
      using errcode = '23514';
  end if;
  return new;
end $$;
create trigger custom_settings_cap before insert on public.custom_settings
  for each row execute function public.enforce_custom_setting_cap();

-- FR-Q6/FR-Q8: per-project catalog overrides, keyed on the dotted catalog key.
create table public.translation_overrides (
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  catalog_key   text not null,
  value         text not null,
  superseded_from text,                                   -- FR-J14 migration map carried the override forward
  updated_at    timestamptz not null default now(),
  primary key (project_id, catalog_key),
  -- credit.* is a locked namespace on every plan (FR-Q6); an override reaching the compiler fails the build,
  -- so it never reaches storage either.
  constraint credit_namespace_locked check (catalog_key not like 'credit.%')
);

-- FR-I2: the Routes Manager's own state. The builder emits NQL and never parses it.
create table public.routes_config (
  project_id    uuid primary key references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  config        jsonb not null default '{}'::jsonb,       -- collections | channels | routes | taxonomies
  yaml          text,                                     -- the live preview pane's rendering, byte-compared on upload
  updated_at    timestamptz not null default now()
);

-- ============================================================================
-- 4. assets — FR-K1..K6
-- ============================================================================

create table public.assets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  path          text not null,                            -- assets/{userId}/…
  display_name  text not null,
  bytes         bigint not null,                         -- the primary object
  stored_bytes  bigint not null,                         -- primary + EVERY rendition. FR-K3's meter and the F.1 cap
                                                         -- are enforced on THIS, because AD-12 stores four objects.
  mime          text not null,
  w             integer, h integer,
  hash          text not null,                            -- content hash; FR-J3's hashed filenames derive from it
  -- AD-12: the 400/800/1600+original rendition set (FR-J3) is generated at UPLOAD, in the
  -- browser, by the same canvas.toBlob pass FR-K2 already mandates. Compile only copies bytes.
  renditions    jsonb not null default '{}'::jsonb,       -- {"400":path,"800":path,"1600":path,"original":path}
  renditions_version smallint not null default 1,        -- bump when the encoder, quality or 2400px cap changes;
                                                         -- part of the identity key so a re-upload can supersede
  created_at    timestamptz not null default now(),
  unique (user_id, hash, renditions_version)
);
create index on public.assets (user_id, created_at desc);

-- FR-K4: recomputed on doc upsert, never derived by scanning every doc. Known-stale by up to
-- one sync interval (FR-D10) — delete re-verifies against the client's live doc before committing.
create table public.asset_usages (
  asset_id      uuid not null references public.assets(id) on delete cascade,
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  updated_at    timestamptz not null default now(),
  primary key (asset_id, project_id)
);
create index on public.asset_usages (project_id);

-- ============================================================================
-- 5. compile, deploy, rollback — FR-J1..J17, FR-I6
-- ============================================================================

create type public.deploy_status as enum ('compiling','checking','uploaded','live','failed');
create type public.deploy_kind   as enum ('normal','rollback','snapshot_restore','compat_redeploy','library_update');
create type public.job_stage     as enum ('queued','compiling','checking','uploading','activating','done','failed','cancelled');

-- FR-J8: written from the FIRST stage, not on success — FR-J7 stores artifacts only on success,
-- so without this a failed compile has nothing for the five-stage UI to poll.
create table public.deploy_jobs (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  site_id       uuid references public.sites(id) on delete set null,  -- null for FR-J12 export
  kind          public.deploy_kind not null default 'normal',
  stage         public.job_stage not null default 'queued',
  cancel_requested boolean not null default false,        -- honoured in compiling/checking only (FR-J8)
  deploy_id     uuid,                                     -- set once a deploys row exists
  error         jsonb,                                    -- FR-J6's mapped explanation, never a raw stack trace
  stage_timings jsonb not null default '{}'::jsonb,       -- NFR-9 structured deploy logs
  started_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.deploy_jobs (project_id, started_at desc);

create table public.deploys (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  site_id       uuid not null references public.sites(id) on delete cascade,
  version       text not null,                            -- FR-J10: auto-incremented semver per deploy
  theme_name    text not null,                            -- the frozen name for this project×site
  kind          public.deploy_kind not null default 'normal',
  status        public.deploy_status not null,            -- 'uploaded' is FR-J8's first-class partial success
  activated     boolean not null default false,
  artifact_path text,                                     -- deploy-artifacts/{projectId}/… ; null while compiling
  artifact_bytes bigint,
  gscan         jsonb,
  -- FR-J16: path → {sha256, fingerprint}. Fingerprint is why a layer RENAME produces no drift.
  content_manifest jsonb,
  -- FR-J14/FR-J16 substrate: what this deploy actually shipped
  library_version  text,
  variant_manifest jsonb,                                 -- [{sectionId, designId, template}]
  emitted_custom_templates text[] not null default '{}',  -- FR-I6's post-deploy checklist reads this
  -- AD-27(a): sites.site_settings as it stood WHEN THIS DEPLOY COMPILED. AD-14 forbids the compile
  -- re-fetching it, so the value it was handed has to be recorded here or the deploy is not
  -- reproducible and FR-J9's rollback replays against settings that have since moved. [R1 decision 15]
  settings_snapshot jsonb,
  -- FR-J7 retention, owner decision 2026-08-21: at most 10 stored versions per project on Pro and
  -- 3 on Free, PINNED INCLUDED IN THAT COUNT. A pin is "keep this one, it was good" — it survives
  -- pruning. Server-asserted: `deploys` is select-only to the client (AD-8), so a pin is set by a
  -- server route, never by the browser. The route is where the plan-specific cap lives, because
  -- AD-28 makes resolveEntitlement the ONLY thing that decides plan state and a trigger that read
  -- `entitlements` to find the limit would be a second decider.
  pinned        boolean not null default false,
  created_at    timestamptz not null default now(),
  activated_at  timestamptz
);
create index on public.deploys (project_id, site_id, created_at desc);
create index on public.deploys (site_id, created_at desc) where status = 'live';

-- FR-J10: the frozen theme name per project×site. EXEMPT from FR-J7's artifact pruning —
-- its only other derivation is the earliest deploys row, which pruning destroys.
create table public.project_site_bindings (
  project_id     uuid not null references public.projects(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  site_id        uuid not null references public.sites(id) on delete cascade,
  theme_name     text not null,
  frozen_at      timestamptz not null default now(),
  first_upload_at timestamptz,                            -- FR-J13's snapshot trigger: first UPLOAD, deploy-only included
  primary key (project_id, site_id),
  -- FR-J10's collision suffix (inflozo-blog-2) is a rule the database holds, not a convention the code remembers
  unique (site_id, theme_name)
);

-- FR-J12: export leaves a trace, because FR-Q2 freezes setting keys "once deployed OR exported".
create table public.exports (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  version       text not null,
  artifact_path text not null,
  created_at    timestamptz not null default now()
);

-- FR-I6: a checklist, not a notification. Inflozo cannot verify a binding and says so.
create table public.template_binding_checklist (
  deploy_id     uuid not null references public.deploys(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  filename      text not null,
  marked_done_at timestamptz,
  primary key (deploy_id, filename)
);

-- ============================================================================
-- 6. edit lock — FR-D18 / addendum §AD2
-- ============================================================================

create table public.edit_locks (
  project_id       uuid primary key references public.projects(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  holder_session_id text not null,
  lock_generation  bigint not null default 1,             -- AD1: the takeover test, independent of revision
  heartbeat_at     timestamptz not null default now(),    -- ~15 s (AD4 default)
  unsynced_edits   integer not null default 0,            -- AD2: EDITS, never ops. The only surfaced count.
  nudge_requested_by text,
  nudge_requested_at timestamptz,
  created_at       timestamptz not null default now()
);
create index on public.edit_locks (heartbeat_at);

-- FR-D18's takeover protocol, decided in Round 4 by the owner.  [F4]
--
-- The ruling: a takeover is ALLOWED, and the displaced device is then told it lost the session and
-- how much unsynced work went with it. That ruling is what closes the security hole, because the
-- displaced device can only be told if it can DETECT the takeover -- and AD-15's detection signal is
-- lock_generation advancing. Executed in Round 4: the holder could be reseated at an unchanged
-- generation, so the displaced device saw nothing and both sides believed they held the lock.
--
-- So: changing holder_session_id REQUIRES advancing lock_generation, in the same statement. The UX
-- decision and the invariant are the same rule, which is why this is a trigger and not a convention.
-- `unsynced_edits` is read by the displaced device for the count in that message (AD-16: EDITS,
-- never ops), so a takeover must not silently reset it -- the incoming holder writes its own count
-- on its own heartbeats afterwards.
create or replace function public.guard_lock_takeover() returns trigger
language plpgsql as $$
begin
  if new.holder_session_id is distinct from old.holder_session_id
     and new.lock_generation <= old.lock_generation then
    raise exception 'a takeover must advance lock_generation (holder % -> %, generation % -> %); the displaced device detects takeover from that number and would otherwise never be told it lost the session',
      old.holder_session_id, new.holder_session_id, old.lock_generation, new.lock_generation
      using errcode = '42501';
  end if;
  return new;
end $$;

-- ============================================================================
-- 7. billing — FR-L1..L5
-- ============================================================================

create type public.entitlement_state as enum ('free','pro_active','pro_past_due');
create type public.plan_interval     as enum ('monthly','yearly');

create table public.subscriptions (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  dodo_customer_id     text,
  dodo_subscription_id text,
  plan                 public.plan_interval,
  status               text,                              -- Dodo's own vocabulary, stored verbatim
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- FR-P1's sixth email — the renewal reminder.  [Round 4, owner decision 2026-08-20]
--
-- Dodo DOES send an "Upcoming Renewal Reminder", ~2 days ahead, off by default. The owner's
-- decision is to send our own AND to leave Dodo's on — and the two do not collide, because they
-- fire at different moments: ours is the heads-up (30 days before an annual renewal), Dodo's
-- ~2-day note is the final nudge.
--
-- ANNUAL ONLY, as of ruling R-89 (owner, 2026-09-04, at step 6). The 2026-08-20 decision also sent
-- one 7 days before a MONTHLY renewal; that leg is WITHDRAWN. Twelve reminders a year to a monthly
-- subscriber is the nudge pattern FR-P2 forbids, and the statutory basis is the annual term. No DDL
-- changes: the table and its key are unchanged, and monthly rows simply are not written.
--
-- Owning it is about CONTROL rather than redundancy. The compliance exposure is in the TIMING —
-- ~2 days is very likely short of the statutory window for an annual term, and Appendix F assumes
-- a 60% yearly mix, so the annual plan is the majority case — and Dodo's timing is not ours to
-- set. 30 days is.
--
-- This table exists for one reason: to make "never twice for the same renewal" a database fact
-- rather than something the cron has to remember. The primary key IS the idempotency rule — one
-- row per subscription per renewal date — so a cron that runs twice, runs late, or overlaps itself
-- cannot double-send. Without it the failure mode is a customer receiving the same email every day
-- for a month. Keying on the renewal being announced (not the send time) also means a renewal date
-- that MOVES correctly earns a fresh reminder.
create table public.renewal_reminders (
  user_id       uuid not null references auth.users(id) on delete cascade,
  period_end    timestamptz not null,                    -- the renewal this announces
  plan          public.plan_interval not null,           -- which window applied: 30d or 7d
  sent_at       timestamptz not null default now(),
  primary key (user_id, period_end)
);
create index on public.renewal_reminders (user_id);

-- FR-L2 names entitlements directly; the state machine needs a home that is not a status string.
create table public.entitlements (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  state             public.entitlement_state not null default 'free',
  grace_expires_at  timestamptz,                          -- Inflozo's own 7-day window, reconciled against Dodo on_hold
  -- the dispute edges, both directions (FR-L2)
  disputed_at       timestamptz,
  restored_at       timestamptz,
  restored_by       uuid references auth.users(id) on delete set null,  -- deliberately manual: an unverified
                                                          -- auto-restore flips twice. STORY 3.9, DW-45: `on delete
                                                          -- set null` — the one bare user reference in this schema,
                                                          -- which refused the purge of the account it named.
  restored_reason   text,
  restored_term_end timestamptz,                          -- restores the REMAINDER of the original paid term
  last_event_id     text,
  updated_at        timestamptz not null default now()
);

-- SERVER-ONLY. FR-L2: idempotent, signature-verified webhooks.
create table private.billing_events (
  id             uuid primary key default gen_random_uuid(),
  dodo_event_id  text not null unique,                    -- the idempotency key
  type           text not null,
  user_id        uuid references auth.users(id) on delete set null,
  payload        jsonb not null,
  signature_ok   boolean not null,
  processed_at   timestamptz,
  received_at    timestamptz not null default now()
);

-- FR-L1: without this record the no-refund policy is not lawfully enforceable in EU/UK.
create table public.checkout_consents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  dodo_order_id text,
  immediate_delivery_consented boolean not null,
  withdrawal_right_waived      boolean not null,
  consented_at  timestamptz not null default now()
);

-- ============================================================================
-- 8. suggestions — FR-M1..M4
-- ============================================================================

create type public.suggestion_category as enum ('section','feature','integration');
create type public.suggestion_status   as enum ('open','planned','building','shipped');

create table public.suggestions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,  -- FR-A5: anonymized, not deleted
  category      public.suggestion_category not null,
  title         text not null check (char_length(title) between 3 and 120),
  body          text not null check (char_length(body) <= 4000),
  image_path    text,
  image_approved boolean not null default false,          -- FR-M3: public only after admin approval
  status        public.suggestion_status not null default 'open',
  vote_count    integer not null default 0,               -- denormalized so the public board needs no vote read
  merged_into   uuid references public.suggestions(id) on delete set null,
  hidden        boolean not null default false,
  anonymized_at timestamptz,
  created_at    timestamptz not null default now()
);
create index on public.suggestions (status, vote_count desc);
create index on public.suggestions (created_at desc);

create table public.suggestion_votes (
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (suggestion_id, user_id)
);

create or replace function public.sync_vote_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.suggestions s set vote_count = (
    select count(*) from public.suggestion_votes v where v.suggestion_id = s.id
  ) where s.id = coalesce(new.suggestion_id, old.suggestion_id);
  return null;
end $$;
create trigger suggestion_votes_count after insert or delete on public.suggestion_votes
  for each row execute function public.sync_vote_count();

-- ============================================================================
-- 9. notifications — FR-B7
-- ============================================================================

create type public.notification_kind as enum
  ('deploy','site_health','ghost_compat','billing','library_update','announcement');

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  kind          public.notification_kind not null,
  title         text not null,
  body          text,
  link          text,
  data          jsonb,
  read_at       timestamptz,
  -- FR-B7: site-health and compatibility notices are EXEMPT from the 90-day prune, because the
  -- population they are written for is exactly the population that deployed once and stopped signing in.
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);
create index on public.notifications (user_id) where read_at is null;
create index on public.notifications (created_at)
  where kind not in ('site_health','ghost_compat');

-- ============================================================================
-- 9b. Surfaces the first draft dropped, and the flag store
-- ============================================================================

-- FR-Q7 / FR-Q9 / FR-H6 / FR-L3: the 28 NON-PLACEABLE treatments and the card design module.
-- These are *selected*, not placed, so project_templates.doc cannot hold them — and FR-Q9 requires
-- the pagination and card selections to survive when no host section exists at all.
create table public.project_treatments (
  project_id        uuid primary key references public.projects(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  paywall_design_id    text,   -- A32, one active per project (FR-H6's Paywall editor)
  card_treatment_id    text,   -- A33, one active per project (FR-Q7 / FR-Q9)
  pagination_design_id text,   -- A34, one active per project (FR-H2 / FR-Q9)
  -- FR-Q7: per-Koenig-card control values. Keys are Ghost's own card names; the compiler derives
  -- package.json's card_assets.exclude from exactly the keys present here.
  card_designs      jsonb not null default '{}'::jsonb,
  updated_at        timestamptz not null default now()
);

-- FR-A2: the passkey module must be disableable WITHOUT a redeploy. A Vercel environment variable
-- cannot do that — env-var changes apply only to new deployments — so flags are rows, read
-- server-side per request. Server-only: a client-flippable flag is not a flag.
create table public.feature_flags (
  key         text primary key,
  enabled     boolean not null default false,
  note        text,
  updated_at  timestamptz not null default now()
);
insert into public.feature_flags(key, enabled, note) values
  ('passkeys', false, 'FR-A2 — Supabase Auth passkey API is Beta; §7.6 item 4'),
  ('ghostpro_preview_probe', false, 'FR-C2 — hostSettings.limits shape is unobserved until the §4 T4 gate');

-- ============================================================================
-- 9b. The credential audit log — server-only, append-only.  [Round 4, F10]
-- ============================================================================
--
-- Round 4 executed what a stored Ghost Admin key actually permits, on both live majors: it reads
-- every subscriber's EMAIL, reads staff, reads all settings, and creates posts. Ghost has no scoped
-- integration -- the Admin JWT carries no scope claim -- so P8's four-write allowlist is a real
-- invariant about Inflozo's own behaviour and NOT a boundary on the credential.
--
-- The blast radius therefore cannot be reduced. What was missing is the other half: nothing recorded
-- that the credential had been used at all. The pre-mortem's answer to "how long before anyone
-- noticed" was "until a customer asked why their subscribers were getting spam" -- external
-- detection, unbounded dwell. Of every fix Round 4 produced, this is the only one that DETECTS
-- rather than prevents.
--
-- It lives in `private` for the same reason site_credentials does: an audit log readable over the
-- data API is a map of which sites are worth attacking.
-- `credential_change` joined the list in Story 3.6 (DW-76, the owner's ruling of 2026-09-09):
-- `store()` and `remove()` both wrote NO row at all, so the log was silent about every key that
-- went in and every key that came out. ONE value for both writers, named for the change with
-- `{ kind, direction }` in `detail` -- which is this enum's own convention, as `entitlement_change`
-- and `admin_flag_change` already are. It is LAST because `alter type ... add value` appends, and
-- the RLS gate diffs this file's database against the migrations'.
create type public.credential_action as enum (
  'admin_write','admin_read','vault_decrypt','entitlement_change','admin_flag_change','moderation',
  'credential_change');

create table private.credential_audit (
  id             bigint generated always as identity primary key,
  occurred_at    timestamptz not null default now(),
  action         public.credential_action not null,
  user_id        uuid,                                   -- no FK: the log outlives the account (FR-A5)
  site_id        uuid,
  route          text not null,                          -- the server route that acted
  allowlist_item text,                                   -- P8's item, for action = 'admin_write'
  outcome        text not null                           -- STORY 3.9, DW-53: the three values were a COMMENT and
                 check (outcome in ('ok','denied','error')),  -- the TypeScript union was their only guard,
  detail         jsonb not null default '{}'::jsonb      -- never a secret, never a credential
);
create index on private.credential_audit (occurred_at desc);
create index on private.credential_audit (site_id, occurred_at desc);
alter table private.credential_audit enable row level security;   -- no policy: server-only

-- AD-6's parent-ownership term.  [Round 4, F2]
--
-- The uniform owner policy authorises by the CHILD row's own user_id and never asked whether the
-- parent belongs to the caller. Executed: tenant A inserted a project_templates row carrying its own
-- user_id and tenant B's project_id and got HTTP 201, while a random project_id returned 23503 --
-- which also made the FK error a cross-tenant existence oracle.
--
-- This function is deliberately NOT `security definer`. Read as `authenticated`, `public.projects`
-- is itself RLS-scoped, so a project the caller does not own is simply not visible and `exists`
-- returns false. "Can I see it" and "do I own it" are the same question, so the check needs no
-- privilege of its own and cannot leak one.
create or replace function public.owns_project(pid uuid) returns boolean
language sql stable as $$ select exists (select 1 from public.projects p where p.id = pid) $$;
revoke execute on function public.owns_project(uuid) from public;
grant  execute on function public.owns_project(uuid) to authenticated;

-- ============================================================================
-- 10. RLS — every table, every policy shaped identically (AD-6/AD-7)
-- ============================================================================

alter table public.profiles                  enable row level security;
alter table public.sites                     enable row level security;
alter table private.site_credentials         enable row level security;  -- no policy: server-only (and off the data API, §0b)
alter table public.site_snapshots            enable row level security;
alter table public.projects                  enable row level security;
alter table public.project_templates         enable row level security;
alter table public.project_template_prefs    enable row level security;
alter table public.custom_templates          enable row level security;
alter table public.deployed_template_names   enable row level security;
alter table public.custom_settings           enable row level security;
alter table public.translation_overrides     enable row level security;
alter table public.routes_config             enable row level security;
alter table public.assets                    enable row level security;
alter table public.asset_usages              enable row level security;
alter table public.deploy_jobs               enable row level security;
alter table public.deploys                   enable row level security;
alter table public.project_site_bindings     enable row level security;
alter table public.exports                   enable row level security;
alter table public.template_binding_checklist enable row level security;
alter table public.edit_locks                enable row level security;
alter table public.renewal_reminders         enable row level security;
alter table public.subscriptions             enable row level security;
alter table public.entitlements              enable row level security;
alter table private.billing_events           enable row level security;  -- no policy: server-only (and off the data API, §0b)
alter table public.checkout_consents         enable row level security;
alter table public.suggestions               enable row level security;
alter table public.suggestion_votes          enable row level security;
alter table public.notifications             enable row level security;
alter table public.project_treatments        enable row level security;
alter table public.feature_flags             enable row level security;  -- no policy: server-only

-- 10a. The uniform owner policy. Applied to every table carrying user_id whose rows the
-- client may both read and write. One shape, so a reviewer checks a list rather than N policies.
do $$
declare t text;
begin
  foreach t in array array[
    'sites','projects','project_templates',
    'project_template_prefs','custom_templates','custom_settings','translation_overrides',
    'routes_config','assets','edit_locks','project_treatments'
  ] loop
    execute format(
      'create policy %1$s_owner on public.%1$s for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- 10a-ii. The parent-ownership term. One shape, added in one place.  [Round 4, F2]
--
-- AD-6 said "no policy traverses a foreign key", and that rule is AMENDED rather than broken here:
-- the whole point of the uniform policy is that a reviewer checks ONE shape instead of N policies,
-- and that property survives, because every project-child table gets exactly the same extra term
-- from the same loop. What does not survive is the claim that ownership of the child implies
-- ownership of the parent -- executed in Round 4, it does not.
--
-- Cost is one primary-key lookup on `projects` per row, which is why the traversal ban existed
-- (planner cost) and why it is affordable here. owns_project() is stable and non-definer, so it
-- reads `projects` under the caller's own RLS.
do $$
declare t text;
begin
  foreach t in array array[
    'project_templates','project_template_prefs','custom_templates','custom_settings',
    'translation_overrides','routes_config','edit_locks','project_treatments'
  ] loop
    execute format(
      'create policy %1$s_parent_owned on public.%1$s as restrictive for all to authenticated
         using (public.owns_project(project_id))
         with check (public.owns_project(project_id))', t);
  end loop;
end $$;

-- 10b. Read-only to the owner; written by the server only. The client polls these but must
-- never forge one — a client-writable deploys row is a forged deploy history.
do $$
declare t text;
begin
  foreach t in array array[
    'deploy_jobs','deploys','project_site_bindings','exports','deployed_template_names',
    'asset_usages','subscriptions','entitlements','checkout_consents','template_binding_checklist',
    'renewal_reminders',       -- [Round 4] a send record the client must never forge or clear
    -- site_snapshots joins the read-only set.  [Round 4, F14]
    -- AD-32 makes the site-snapshots BUCKET server-only with no policy at all, because "a snapshot
    -- the client could write defeats FR-J13 entirely". The bucket was governed and the row pointing
    -- into it was not: `authenticated` held SELECT, INSERT, UPDATE and DELETE. A user could not
    -- touch the bytes and could still destroy the record of where they are.
    'site_snapshots'
  ] loop
    execute format(
      'create policy %1$s_owner_read on public.%1$s for select to authenticated
         using (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- FR-I6: the one server-written table the user marks themselves.
create policy tbc_owner_mark on public.template_binding_checklist
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- FR-J8: cancel is the one deploy_jobs field a client may set, in the first two stages only.
create policy deploy_jobs_owner_cancel on public.deploy_jobs
  for update to authenticated
  using (user_id = (select auth.uid()) and stage in ('queued','compiling','checking'))
  with check (user_id = (select auth.uid()));

-- profiles: own row, and is_admin is not client-writable.
create policy profiles_owner on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy profiles_owner_update on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create trigger profiles_privilege_frozen before update on public.profiles
  for each row execute function public.freeze_columns('is_admin');

-- notifications: read + mark-read only.
create policy notifications_owner_read on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_owner_mark on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- FR-M3: public read-only board. anon sees non-hidden rows; the IMAGE is gated by
-- image_approved in the view the public board reads, never by row visibility.
create policy suggestions_public_read on public.suggestions for select to anon, authenticated
  using (hidden = false);
create policy suggestions_author_write on public.suggestions for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy suggestions_author_update on public.suggestions for update to authenticated
  using (user_id = (select auth.uid()) and status = 'open')
  with check (user_id = (select auth.uid()));
-- FR-M4 moderation (status, merge, hide, image approval) is NOT an RLS policy. It runs in a
-- server route under the service role, gated on profiles.is_admin — because every one of those
-- fields is a fact the server asserts (AD-8), and an admin RLS policy would additionally have to
-- re-open the image column the gate below closes.

create policy votes_owner on public.suggestion_votes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy votes_public_count on public.suggestion_votes for select to anon using (true);

-- FR-M3: the public board's image gate, expressed once rather than in every client query.
-- FR-M3: "an attached image renders on the public board only after admin approval (until then
-- it is visible in-app to its author and to the admin)". Two mechanisms, because the view alone
-- is not enough — a client that queries the base table directly would read image_path around it.
--
-- (1) image_path is removed from the base table's grant. NOTE, because the intuitive form is a
--     silent no-op: a column-level REVOKE does nothing while a table-level GRANT stands. The
--     table grant must be revoked and the allowed column list granted explicitly. Verified on
--     PostgreSQL 17.11 — see MEASUREMENTS.md §10.
revoke select on public.suggestions from anon, authenticated;
grant  select (id, user_id, category, title, body, status, vote_count, created_at, image_approved)
  on public.suggestions to anon, authenticated;

-- INSERT and UPDATE are column-narrowed, not whole-row.  [Round 4, F1]
--
-- This file narrowed UPDATE carefully on eight tables in §11 and left INSERT whole-row everywhere,
-- which handed back exactly what §11 had taken away. Executed in Round 4:
--
--     POST /rest/v1/suggestions {image_approved:true, vote_count:99999, status:'shipped'}
--       -> HTTP 201, and an ANONYMOUS read of suggestions_public returned all three.
--
-- So FR-M3's admin approval gate, the vote count and the roadmap status were all set by the person
-- posting. `image_approved` is the one that matters most: combined with the client-side-only
-- sanitizer (§16c/F8), it puts an unreviewed file in front of every board visitor.
-- The same hole existed on UPDATE (finding F15), reachable while status = 'open' via
-- suggestions_author_update — the same class one verb over, which is why both grants are narrowed.
revoke insert, update on public.suggestions from authenticated;
grant  insert (id, user_id, category, title, body, image_path) on public.suggestions to authenticated;
grant  update (title, body, category, image_path)              on public.suggestions to authenticated;

-- (2) A SECURITY DEFINER view is the only path to image_path. Definer, deliberately: it must read
--     a column its callers cannot, so it carries its own row filter rather than inheriting RLS.
create view public.suggestions_public as
  select id, category, title, body, status, vote_count, created_at,
         case when image_approved or user_id = (select auth.uid())
              then image_path else null end as image_path
  from public.suggestions where hidden = false;
-- Grants for this view live in §11a(8): SELECT only, to anon and authenticated.
--
-- [R1 decision 3, CORRECTED 2026-08-19 -- the decision as written is refuted by execution.]
-- Decision 3 said "make suggestions_public security_invoker = true and revoke write grants through
-- it". The second half is right and is what actually closes Round 1's hole. The first half breaks
-- the view outright, and the two halves were never separable in testing because nobody ran them.
--
-- Executed, clean database, schema as shipped:
--   * BASELINE   user A updated AND DELETED user B's suggestion through this view. Confirmed:
--                B's row count went 1 -> 0. The cause is the WRITE GRANT, not the definer-ness:
--                `authenticated` held INSERT/UPDATE/DELETE on the view, and a definer view executes
--                them as the owner, around RLS.
--   * DECIDED    alter view ... set (security_invoker = true)
--                -> "ERROR: permission denied for table suggestions" for BOTH anon and authenticated,
--                on plain SELECT. An invoker view needs the CALLER to hold privileges on the base
--                table, and §10 deliberately revokes image_path from the caller's column grant. The
--                view selects image_path, so every read fails. The public board goes dark.
--   * CORRECTED  keep SECURITY DEFINER; revoke all, grant select.
--                -> A reads the board and the approved image renders; A's UPDATE and DELETE both
--                   return "permission denied for view suggestions_public"; B's row is intact.
--
-- So the definer-ness is load-bearing exactly as this file's original comment said -- the view must
-- read a column its callers cannot -- and the fix is to take the verbs away, not the definer.
-- §0a makes this the default for every future view, which is the durable half.

-- 10c. updated_at triggers
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','sites','projects','project_templates','project_template_prefs',
    'custom_settings','translation_overrides','routes_config','asset_usages','deploy_jobs',
    'subscriptions','entitlements'
  ] loop
    execute format('create trigger %1$s_touch before update on public.%1$s
                    for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;
-- site_credentials moved to `private` in §0b and keeps its touch trigger there.  [Round 4, F6]
create trigger site_credentials_touch before update on private.site_credentials
  for each row execute function public.touch_updated_at();

-- DW-44 (Story 3.1): the Vault secret behind a ref goes when the ref does — on the purge's
-- cascade, on a disconnect, and on a rotation that replaces it. `security definer` because the
-- cascade fires under GoTrue's role and only the owner and `service_role` may delete a secret
-- (§21j); EXECUTE revoked from every client, so nothing but this trigger can reach it. The body
-- is byte-identical to `supabase/migrations/20260907200000_vault_secret_lifecycle.sql` — the RLS
-- gate diffs the two databases and pg_dump emits bodies verbatim.
create or replace function private.drop_vault_secrets() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    delete from vault.secrets where id in (old.admin_key_vault_ref, old.staff_token_vault_ref);
    return old;
  end if;
  if old.admin_key_vault_ref is distinct from new.admin_key_vault_ref then
    delete from vault.secrets where id = old.admin_key_vault_ref;
  end if;
  if old.staff_token_vault_ref is distinct from new.staff_token_vault_ref then
    delete from vault.secrets where id = old.staff_token_vault_ref;
  end if;
  return new;
end $$;

revoke execute on function private.drop_vault_secrets() from public, anon, authenticated;

create trigger site_credentials_drop_vault_secrets
  before update or delete on private.site_credentials
  for each row execute function private.drop_vault_secrets();

-- ============================================================================
-- 11a. Table-level grants — the schema grants IN, and names every privilege  [R2-1]
-- ============================================================================
--
-- Nothing below is inherited. §0a revoked the default, so a table absent from this section is
-- unreachable by the client -- which is the intended failure mode for the three server-only tables
-- and a build error for anything else.
--
-- Executed 2026-08-19: with the platform default removed, the previous form of this file applied
-- with ZERO errors and left 29 of 30 tables with no privilege at all, because §11 below narrows
-- UPDATE and nothing ever granted SELECT/INSERT/DELETE. RLS-TEST.sql then aborted in its fixture
-- block having run 0 assertions. That is what this section fixes.
--
-- RLS still decides WHICH ROWS. These grants decide which VERBS. Both are required; neither
-- substitutes for the other. TRUNCATE, REFERENCES and TRIGGER are granted to nobody, ever --
-- TRUNCATE in particular is not subject to RLS, so it would bypass every policy in §10.

-- (1) Owner read/write. The uniform AD-6 policy in §10a scopes the rows.
do $$
declare t text;
begin
  foreach t in array array[
    'project_templates','project_template_prefs',
    'custom_templates','translation_overrides','routes_config','project_treatments'
  ] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- (2) Owner read/write, but UPDATE is column-narrowed in §11 below. INSERT and DELETE are whole-row
--     and stay here; the UPDATE grant is deliberately absent so §11 is the only place that confers it.
-- INSERT is column-narrowed on these four for the same reason UPDATE is in §11.  [Round 4, F3]
--
-- The class assertion added to RLS-TEST.sql found these three the moment it existed: §11 revoked
-- UPDATE on sites, projects and custom_settings and named the exact columns a client may write,
-- and then §11a granted whole-row INSERT beside it -- so `capability`, `deploy_rate_limit_exempt`,
-- `revision` and `frozen_at` were all settable at creation, which is the whole of what §11 forbade,
-- available one verb over. A client creates these rows legitimately; what it does not do is assert
-- the server's facts about them.
do $$
declare t text;
begin
  foreach t in array array['sites','projects','custom_settings','edit_locks'] loop
    execute format('grant select, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- sites: the client supplies the connection and its presentation. The SERVER asserts capability,
-- health, credential presence, the routes verification result and the rate-limit exemption.
grant insert (id, user_id, url, title, favicon_url) on public.sites to authenticated;

-- projects: `revision` is AD-15's lineage marker and starts at 0 by default -- a client that chose
-- its opening value could start above any revision a legitimate sync would produce.
grant insert (id, user_id, name, slug, style_pack, dark_enabled, language, posts_per_page,
              credit_enabled, linked_site_id, rtl_ack_at)
  on public.projects to authenticated;

-- custom_settings: `frozen_at` is FR-Q2's stamp and is the server's to set, at the moment the
-- project first deploys or exports. The guard trigger above makes it immutable once set; this
-- keeps a client from arriving with it already set.
grant insert (id, project_id, user_id, key, label, type, options, default_value, group_name,
              visibility_condition, bound_to, position)
  on public.custom_settings to authenticated;

-- assets: the client may read and delete its own rows, but does NOT create them.  [Round 4, F3]
--
-- §11 below locks `stored_bytes` against UPDATE because "a writable meter is not a meter", and the
-- comment there already admitted the hole this closes: the row is INSERTed by the client, so the
-- meter could simply be understated at creation. Executed:
--
--     POST /rest/v1/assets {bytes: 9999999, stored_bytes: 1}  -> HTTP 201
--     PATCH .. {stored_bytes: 5e8}                            -> HTTP 403
--
-- Locked afterwards, wide open at the start. This is also FR-K3's quota lever: the objects land in
-- Storage for real and only the number meant to stop them is fiction.
--
-- Column-narrowing INSERT is the fix everywhere else in this section and it CANNOT express the rule
-- here, which is worth stating rather than hiding: `stored_bytes` has no server-side source at
-- insert time -- every value in the request is client-supplied, so no trigger over the row can
-- correct it. The only trustworthy source is Storage itself. So the row becomes a server write:
-- FR-K2's browser upload still goes DIRECT to the bucket (AD-32 and P5 are untouched, the bytes
-- never round-trip), and is followed by a small server route that stats the uploaded objects and
-- writes this row with a true stored_bytes. That is one extra request per upload, not one extra
-- copy of the bytes.
grant select, delete on public.assets to authenticated;

-- edit_locks: lock_generation is not client-set AT INSERT either.  [Round 4, F3]
-- It defaults to 1 and only ever advances through the takeover guard above; a client that could
-- choose its opening value could start at a number no legitimate takeover would beat.
revoke insert on public.edit_locks from authenticated;
grant  insert (project_id, user_id, holder_session_id, heartbeat_at, unsynced_edits,
               nudge_requested_by, nudge_requested_at)
  on public.edit_locks to authenticated;

-- (3) profiles: the row is created at signup and never deleted by the client (FR-A5 is a soft
--     delete performed by a server route). SELECT here; UPDATE is column-narrowed in §11.
grant select on public.profiles to authenticated;

-- (4) AD-8 select-only. These are facts the server asserts; a client-writable row here is a forged
--     deploy history, a self-granted entitlement or an invented export record.
do $$
declare t text;
begin
  foreach t in array array[
    'deploys','project_site_bindings','exports','deployed_template_names','asset_usages',
    'subscriptions','entitlements','checkout_consents','deploy_jobs','template_binding_checklist',
    'site_snapshots',                                           -- [Round 4, F14]
    'renewal_reminders'                                         -- [Round 4]
  ] loop
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;
-- deploy_jobs.cancel_requested and template_binding_checklist.marked_done_at are the two exceptions,
-- granted per-column in §11.

-- (5) notifications: read and mark-read. `read_at` is the only column the client sets -- everything
--     else is written by the emitting epic (AD-25), and `resolved_at` in particular is what makes
--     the prune exemption safe, so a client that could clear it would defeat FR-B7.
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- (6) FR-M3's public board. `suggestions` already has its explicit column grant in §10 (the
--     image_path gate); votes are owner-writable and publicly countable.
-- A vote is cast or withdrawn, never moved.  [Round 4, F16 -- owner chose option 2]
-- sync_vote_count() fires on INSERT and DELETE only, so an UPDATE that changed suggestion_id left
-- both counts wrong. The table has no column a user could legitimately edit -- it is
-- (suggestion_id, user_id, created_at) -- so removing UPDATE closes the desync at the grant layer
-- rather than growing the trigger.
grant select, insert, delete on public.suggestion_votes to authenticated;
grant select on public.suggestion_votes to anon;

-- (7) AD-7 server-only. site_credentials and billing_events now live in `private` (§0b), which
--     PostgREST does not expose at all, so no key of any kind reaches them over the data API.
--     feature_flags stays in `public` and is granted NOTHING, deliberately and by omission.
--     RLS-on-with-no-policy remains behind both, as defence in depth.

-- ⚠️ "NOTHING" MUST NOT INCLUDE service_role, and the first version of this file did.
-- [Round 3, 2026-08-20 -- MEASUREMENTS §19d, executed against real hosted Supabase]
--
-- AD-7 reads "reachable only by the service role inside a server route". On real Supabase the
-- service role could not reach them at all: it held REFERENCES, TRIGGER, TRUNCATE and no
-- SELECT/INSERT, so FR-L2's Dodo webhook handler could not write the payload it exists to store
-- and the entitlements state machine had no input. Executed with a real secret key:
--     ERROR: permission denied for table billing_events (42501)
-- RLS was never the obstacle -- service_role carries bypassrls = true. The missing TABLE GRANT was,
-- which is Round 1's "a view is not access control while the table grant stands" from the other side.
-- Invisible against PRELUDE.sql, which never creates a service_role.
-- ⚠️ AND ROUND 3 FIXED THE INSTANCE, NOT THE CLASS.  [Round 4, F11 -- MEASUREMENTS §21o]
--
-- The two tables below were granted in Round 3. Round 4 read the same catalogue for every OTHER
-- AD-8 table and found the identical signature -- REFERENCES, TRIGGER, TRUNCATE and no
-- SELECT/INSERT -- on twelve more:
--
--     deploys, deploy_jobs, entitlements, subscriptions, exports, project_site_bindings,
--     deployed_template_names, asset_usages, checkout_consents, notifications,
--     template_binding_checklist, profiles
--
-- AD-8 says these are "written by server routes under the service role". None of them could be.
-- E7's first deploy and E12's first entitlement write both fail with 42501 -- a build-stopper that
-- was invisible because nothing asserted it. RLS-TEST.sql now asserts the CLASS, so a thirteenth
-- table cannot repeat this: that assertion, not this grant list, is the actual fix.
--
-- DELETE is included deliberately: AD-33's crons prune notifications, purge accounts and enforce
-- FR-J7's artifact retention, and every one of those deletes rows under this role.
do $$
declare t text;
begin
  foreach t in array array[
    'deploys','deploy_jobs','entitlements','subscriptions','exports','project_site_bindings',
    'deployed_template_names','asset_usages','checkout_consents','notifications',
    'template_binding_checklist','profiles','site_snapshots','assets','suggestions',
    'renewal_reminders',
    'suggestion_votes','projects','sites','custom_settings','custom_templates',
    'project_templates','project_template_prefs','translation_overrides','routes_config',
    'project_treatments'
  ] loop
    execute format('grant select, insert, update, delete on public.%I to service_role', t);
  end loop;
end $$;

grant select, insert, update, delete on private.site_credentials, private.billing_events
  to service_role;
grant select, insert on private.credential_audit to service_role;   -- append-only: no update, no delete
-- feature_flags is read server-side per request (the Feature-flags convention), so it needs SELECT.
grant select on public.feature_flags to service_role;

-- (8) suggestions_public: SELECT only.  [R1 decision 3, CORRECTED -- see the note in §10 above]
revoke all on public.suggestions_public from anon, authenticated;
grant  select on public.suggestions_public to anon, authenticated;

-- ============================================================================
-- 11. Column-level write surfaces — RLS is row-level and CANNOT express these
-- ============================================================================
--
-- AD-8 and AD-9 bind COLUMNS, not tables. Several tables are legitimately owner-writable while
-- carrying facts only the server may assert. RLS has no column granularity, so the mechanism is
-- column-level GRANT plus a guard trigger — and the intuitive form is a silent no-op:
--
--     revoke update (col) on t from authenticated;   -- DOES NOTHING while a table GRANT stands
--
-- The table grant must be revoked and the writable column list granted back. Verified on
-- PostgreSQL 17.11; see MEASUREMENTS.md §10.

-- sites: the owner edits presentation; the SERVER asserts capability, health, credential presence,
-- the routes verification result and the rate-limit exemption. Without this a client grants itself
-- AD-19's deploy-rate-limit bypass and forges FR-C2's Preview-only verdict.
revoke update on public.sites from authenticated;
grant  update (title, favicon_url, updated_at) on public.sites to authenticated;

-- projects: `revision` is AD-15's lineage marker and `slug` feeds FR-J10's frozen theme name.
revoke update on public.projects from authenticated;
grant  update (name, style_pack, dark_enabled, language, posts_per_page,
               credit_enabled, linked_site_id, rtl_ack_at, updated_at)
  on public.projects to authenticated;

-- custom_settings: FR-Q2 freezes the key once deployed or exported. Freezing only `key` left the
-- bypass open — null `frozen_at`, then rename — so `frozen_at` is frozen too, and neither is granted.
revoke update on public.custom_settings from authenticated;
grant  update (label, options, default_value, group_name, visibility_condition,
               bound_to, position, updated_at)
  on public.custom_settings to authenticated;

-- deploy_jobs: FR-J8 gives the client exactly one lever. A whole-row UPDATE let it set
-- stage='done', rewrite error and forge stage_timings.
revoke update on public.deploy_jobs from authenticated;
grant  update (cancel_requested) on public.deploy_jobs to authenticated;

-- profiles: the owner edits their own presentation and their autosave preference. The SERVER
-- asserts is_admin (FR-M4), free_editable_project_id (FR-L3 — which project stays editable in an
-- over-limit state is the entitlement resolver's call, not the client's) and the FR-A5 soft-delete
-- stamps. Round 1 found all three client-writable. is_admin additionally keeps its AD-9 trigger,
-- because a grant cannot express "and not by the service role either".  [R1 decision 13]
revoke update on public.profiles from authenticated;
grant  update (display_name, autosave_enabled, updated_at) on public.profiles to authenticated;

-- assets: the owner renames. Everything else describes bytes the client already uploaded, and
-- stored_bytes in particular IS FR-K3's quota meter — a writable meter is not a meter.  [R1 decision 13]
--
-- NOTE, and it is not closed by this grant: `assets` rows are INSERTed by the client (AD-32 makes
-- the assets bucket the one the browser writes directly), so a client can still understate
-- stored_bytes AT INSERT. Locking UPDATE stops it being edited afterwards; it does not make the
-- meter trustworthy. Closing that needs either a server-side insert path or a trigger that recomputes
-- stored_bytes from `renditions` — a design question this batch deliberately does not invent.
revoke update on public.assets from authenticated;
grant  update (display_name) on public.assets to authenticated;

-- edit_locks: project_id and user_id are the lock's identity — a client that could rewrite them
-- re-parents someone else's lock onto its own project. The rest is the live protocol and stays
-- writable by the holder. lock_generation additionally carries the monotonic trigger AD-31 already
-- promises and Round 1 found absent.  [R1 decision 13]
--
-- NOTE: this does NOT close the whole of Round 1's edit-lock finding. Forging holder_session_id
-- without advancing lock_generation is a PROTOCOL question, and R1 decision 32 explicitly defers the
-- protocol to a state diagram before E5 builds it. What is closed here is the rewind and the
-- re-parent; what remains open is named so it is not mistaken for done.
revoke update on public.edit_locks from authenticated;
grant  update (holder_session_id, lock_generation, heartbeat_at, unsynced_edits,
               nudge_requested_by, nudge_requested_at)
  on public.edit_locks to authenticated;

-- template_binding_checklist: FR-I6 is a checklist the user marks. The filename is the server's.
revoke update on public.template_binding_checklist from authenticated;
grant  update (marked_done_at) on public.template_binding_checklist to authenticated;

-- FR-J7's pin floor.  [owner decision 2026-08-21]
--
-- The rule the owner set is "at most N-1 pinned", N being 10 on Pro and 3 on Free — so a customer
-- who pins every slot can never be left unable to deploy. N is plan-dependent and AD-28 reserves
-- plan decisions to one resolver, so the split follows AD-9's established shape: **the server route
-- enforces the plan-specific cap, and this trigger is the floor underneath it.**
--
-- The floor is stated plan-independently, which is what lets it live in the database at all:
-- **at least one version must remain unpinned.** A project whose every version is pinned has
-- nowhere to put its next build, and the only ways out would be refusing the deploy or silently
-- unpinning something the customer explicitly asked to keep. Both are worse than refusing the pin.
create or replace function public.guard_pin_leaves_a_slot() returns trigger
language plpgsql as $$
declare unpinned_left int;
begin
  if new.pinned and not old.pinned then
    select count(*) into unpinned_left
      from public.deploys d
     where d.project_id = new.project_id and not d.pinned and d.id <> new.id;
    if unpinned_left = 0 then
      raise exception 'cannot pin every version of a project: at least one must stay unpinned so the next deploy has a slot (project %)', new.project_id
        using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger deploys_pin_leaves_a_slot before update on public.deploys
  for each row execute function public.guard_pin_leaves_a_slot();

-- AD-15 depends on `revision` being monotonic and server-asserted. A trigger, not a convention.
create or replace function public.guard_revision() returns trigger
language plpgsql as $$
begin
  if new.revision < old.revision then
    raise exception 'projects.revision is monotonic (% -> %)', old.revision, new.revision
      using errcode = '42501';
  end if;
  return new;
end $$;
create trigger projects_revision_monotonic before update on public.projects
  for each row execute function public.guard_revision();

-- FR-J10: once a project has a frozen theme name on any site, its slug is the source of that name.
create or replace function public.guard_slug() returns trigger
language plpgsql as $$
begin
  if new.slug is distinct from old.slug
     and exists (select 1 from public.project_site_bindings b where b.project_id = old.id) then
    raise exception 'projects.slug is immutable once a theme name is frozen against any site'
      using errcode = '42501';
  end if;
  return new;
end $$;
create trigger projects_slug_frozen before update on public.projects
  for each row execute function public.guard_slug();

-- §7.4 collision kind (2), enforced across BOTH surfaces that mint a filename — E5's membership
-- canvases and E7's Routes Manager. A unique index on custom_templates alone could not see it.
create or replace function public.guard_custom_template_name() returns trigger
language plpgsql as $$
begin
  if exists (select 1 from public.deployed_template_names d
             where d.project_id = new.project_id and d.filename = new.filename)
     and tg_op = 'INSERT' then
    raise exception 'custom template % was already deployed by this project and can never be reused', new.filename
      using errcode = '23505';
  end if;
  return new;
end $$;
-- [R1 decision 16] INSERT-only left the rule trivially bypassable: insert a throwaway filename,
-- then UPDATE it to the reused one. The guard is the floor under §7.4 collision kind (2), so it has
-- to see both verbs. tg_op is already tested inside the function; widen it to check on UPDATE too.
create or replace function public.guard_custom_template_name() returns trigger
language plpgsql as $$
begin
  if exists (select 1 from public.deployed_template_names d
             where d.project_id = new.project_id and d.filename = new.filename)
     and (tg_op = 'INSERT' or new.filename is distinct from old.filename) then
    raise exception 'custom template % was already deployed by this project and can never be reused', new.filename
      using errcode = '23505';
  end if;
  return new;
end $$;
create trigger custom_templates_name_guard before insert or update on public.custom_templates
  for each row execute function public.guard_custom_template_name();

-- AD-31 states lock_generation is trigger-guarded monotonic. Round 1 executed a rewind from 999 to 1
-- and found no trigger at all. AD-15's takeover test reads "has the generation advanced past the one
-- this device held" — a rewind therefore un-clears a journal that must stay cleared.  [R1 decision 13]
create or replace function public.guard_lock_generation() returns trigger
language plpgsql as $$
begin
  if new.lock_generation < old.lock_generation then
    raise exception 'edit_locks.lock_generation is monotonic (% -> %)', old.lock_generation, new.lock_generation
      using errcode = '42501';
  end if;
  return new;
end $$;
create trigger edit_locks_generation_monotonic before update on public.edit_locks
  for each row execute function public.guard_lock_generation();

-- FR-D18's takeover rule, from the function defined beside the table.  [Round 4, F4]
create trigger edit_locks_takeover_advances before update on public.edit_locks
  for each row execute function public.guard_lock_takeover();

-- AD-9's fourth frozen column, which never had its trigger.  [Round 4, F12]
create trigger custom_settings_key_frozen before update on public.custom_settings
  for each row execute function public.guard_custom_setting_freeze();

-- ============================================================================
-- 11b. Signup — AD-28's entitlements row has a writer  [R1 decision 14]
-- ============================================================================
--
-- AD-28 says "an entitlements row is created at signup and the absent-row case resolves to free".
-- Round 1 found zero triggers on auth.users, so nothing created it: the first half was aspirational
-- and only the fallback was real. E5, E7 and E8 all read plan state before E12 ships a writer, which
-- is exactly the divergence one resolver was meant to prevent.
create or replace function public.provision_entitlement() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.entitlements (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;
revoke execute on function public.provision_entitlement() from public;
create trigger auth_user_entitlement after insert on auth.users
  for each row execute function public.provision_entitlement();

-- ...and the profiles row, which nothing created at all.  [Round 4, F13]
--
-- The entitlement half above was added in Round 1 and the profile half was never noticed, because
-- the only evidence anyone looked at was a row count that happened to look right. Executed against
-- the live project in Round 4:
--
--     auth.users = 6    entitlements = 6    profiles = 2
--
-- Six signups, two profiles -- and those two exist only because RLS-TEST.sql seeds them by hand.
-- Round 3's §16a read "profiles = 2" as confirming the design; it was confirming the fixture.
--
-- This is not cosmetic. `autosave_enabled` defaults to true ON THE ROW, so with no row at all the
-- editor reads NULL for the setting AD-15 uses to decide whether a user's work is being saved --
-- and `is_admin` and `free_editable_project_id` are equally absent.
create or replace function public.provision_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;
revoke execute on function public.provision_profile() from public;
create trigger auth_user_profile after insert on auth.users
  for each row execute function public.provision_profile();

-- ============================================================================
-- 11c. Function EXECUTE — the same grant-in rule, applied to callables
-- ============================================================================
--
-- A function with a null ACL is EXECUTE to PUBLIC, which includes anon. Round 1 reported
-- sync_vote_count as reachable by `authenticated`; Round 2 found it is reachable by PUBLIC, and so
-- is every guard function here. §0a fixes this for future functions only, so the ones this file
-- already created are revoked explicitly.  [R1 decision 16, widened by R2-11]
--
-- These are all trigger functions. Nothing calls them directly and nothing should be able to:
-- sync_vote_count is SECURITY DEFINER, so a direct call executes as its owner.
do $$
declare f text;
begin
  foreach f in array array[
    'public.touch_updated_at()','public.freeze_columns()','public.guard_revision()',
    'public.guard_slug()','public.guard_custom_template_name()','public.guard_lock_generation()',
    'public.sync_vote_count()','public.enforce_custom_setting_cap()',
    -- Round 4's three new guards. RLS-TEST asserts this list against the catalogue, which is how
    -- the first two were caught here rather than in a later round.
    'public.guard_lock_takeover()','public.guard_custom_setting_freeze()','public.provision_profile()',
    'public.guard_pin_leaves_a_slot()'
  ] loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;
end $$;

-- pgcrypto is created into `public` by this file's header, so its ~40 functions are also EXECUTE to
-- PUBLIC. That is not a hole on its own — a caller still needs the ciphertext and the key — but it
-- is the same hygiene class, and AD-7 keeps Vault references in site_credentials. Left as-is
-- deliberately: moving the extension to its own schema changes the search_path every migration and
-- every server route resolves against, which is a bigger change than this batch should make. Raised
-- rather than done.

-- ============================================================================
-- 11d. RLS needs an index to stand on.  [Round 4, P1 -- MEASUREMENTS §21g]
-- ============================================================================
--
-- Every policy in §10 is `user_id = (select auth.uid())`, so RLS rewrites every tenant-scoped query
-- into a filter on user_id. Round 4 found 21 of 29 RLS tables had no index whose first key is
-- user_id, which turns "list my rows" into a scan of EVERY tenant's rows. Measured on the live
-- project, 200k rows with 50k for the target tenant:
--
--     with a user_id index :  11.2 ms
--     without one          : 320.9 ms      <- 14x, and it grows with total rows, not the tenant's
--
-- The same run also settled AD-6's other claim, which had never been checked: the `(select ...)`
-- wrapper really does hoist -- it emits `Index Cond: (user_id = (InitPlan 1).col1)` and evaluates
-- auth.uid() ONCE, where the bare form re-evaluates it per row. Keep the wrapper; it is what holds
-- the unindexed case to 320 ms instead of far worse. But hoisting removes the per-row CALL, not the
-- scan, and only an index removes the scan.
--
-- Indexes on empty tables are instant and cost nothing to carry, which is why this is done before
-- launch rather than as a migration against live customer data.
do $$
declare t text;
begin
  foreach t in array array[
    'asset_usages','checkout_consents','custom_settings','custom_templates','deploy_jobs',
    'deployed_template_names','deploys','edit_locks','exports','project_site_bindings',
    'project_template_prefs','project_templates','project_treatments','routes_config',
    'site_snapshots','suggestion_votes','suggestions','template_binding_checklist',
    'translation_overrides'
  ] loop
    execute format('create index if not exists %1$s_user_id_idx on public.%1$s (user_id)', t);
  end loop;
end $$;
create index if not exists site_credentials_user_id_idx on private.site_credentials (user_id);

-- ============================================================================
-- 12. Storage — four buckets, and RLS on storage.objects is a separate system
-- ============================================================================
--
-- Postgres RLS on public.* says nothing about storage.objects, and a Postgres cascade deletes rows,
-- never bytes. Both were missing from the first draft.

insert into storage.buckets (id, name, public) values
  ('assets', 'assets', false),
  ('deploy-artifacts', 'deploy-artifacts', false),
  ('site-snapshots', 'site-snapshots', false),
  ('suggestion-images', 'suggestion-images', false)
on conflict (id) do nothing;

-- No bucket is public. Every read the browser performs is a short-lived signed URL minted by a
-- server route (AD-13), which is also the only thing that can be revoked.

-- ── Round 3, decision D6 ──────────────────────────────────────────────────────
-- Supabase's OWN storage migration grants more than its docs describe. Read verbatim
-- from storage-api v1.61.7, migrations/tenant/0046-buckets-objects-grants.sql:
--
--     grant all on storage.buckets, storage.objects
--       to <service_role>, <authenticated_role>, <anon_role>
--
-- `grant all` confers TRUNCATE, and TRUNCATE is not subject to RLS -- the same trap
-- R2-3 found in PRELUDE.sql, this time in the real platform, on the two tables AD-32
-- governs. Executed 2026-08-20 (storage-api v1.61.7 over supabase/postgres 17.6.1.140),
-- as `authenticated`:  `truncate storage.objects cascade;`  -- SUCCEEDED.
--
-- What HELD: `storage.buckets` ships RLS enabled with ZERO policies, so `select`
-- returns 0 rows and `update storage.buckets set public = true` affects 0 rows. A
-- client cannot list buckets or flip `public` on site-snapshots. **AD-32's "no bucket
-- is public" holds by default and needs no policy of its own.** (VERIFY-AT-BUILD 29.)
--
-- ⚠️ AND THE INTUITIVE FIX IS A SILENT NO-OP -- the third time this project has hit
-- that shape, after the column-level REVOKE (MEASUREMENTS §10) and PRELUDE's grants.
-- Executed: run from a migration as `postgres`,
--
--     revoke truncate on storage.buckets, storage.objects from anon, authenticated;
--
-- reports success and changes NOTHING. Postgres only lets a role revoke grants it
-- itself made, and the grantor here is `supabase_storage_admin`:
--
--     supabase_storage_admin granted TRUNCATE on objects to authenticated
--
-- On the local image `postgres` is not a superuser (rolsuper = f), is not a member of
-- supabase_storage_admin, and `REVOKE ... GRANTED BY supabase_storage_admin` fails
-- with "grantor must be current user". After the revoke "succeeded", TRUNCATE still
-- succeeded as `authenticated`.
--
-- So this block ATTEMPTS the revoke and REPORTS whether it took, rather than assuming
-- it. Whether hosted Supabase grants `postgres` the membership that makes it work is
-- unverified and is an open probe item -- do not treat a clean migration run as proof.
do $$
declare still_granted int;
begin
  begin
    execute 'revoke truncate on storage.buckets, storage.objects from anon, authenticated';
  exception when others then
    raise notice 'D6: revoke raised % -- expected where postgres is not the grantor', sqlerrm;
  end;
  select count(*) into still_granted from information_schema.role_table_grants
   where table_schema = 'storage' and table_name in ('buckets','objects')
     and grantee in ('anon','authenticated') and privilege_type = 'TRUNCATE';
  if still_granted > 0 then
    raise warning 'D6 NOT APPLIED: TRUNCATE remains granted on % storage grants. The grantor is supabase_storage_admin and this role cannot revoke it. The control that holds today is that `storage` is not an exposed PostgREST schema -- keep it that way, and never add a SECURITY INVOKER function in `public` that touches storage.', still_granted;
  else
    raise notice 'D6 applied: TRUNCATE revoked on both storage tables.';
  end if;
end $$;

-- MUST BE RE-CHECKED AFTER ANY SUPABASE STORAGE UPGRADE: migration 0046 re-runs and
-- re-grants. `RLS-TEST.sql` asserts the OUTCOME so a regression is caught, not assumed.

-- assets/{userId}/… — the one bucket the client writes directly, because FR-K2's optimization
-- happens in the browser and a server round-trip would double the egress P5 exists to avoid.
create policy assets_owner on storage.objects for all to authenticated
  using      (bucket_id = 'assets' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'assets' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- deploy-artifacts/{projectId}/… and site-snapshots/{userId}/{siteId}/… are SERVER-ONLY: no policy.
-- An artifact the client could write is a theme the client could substitute before it uploads to
-- Ghost, and a snapshot the client could write defeats FR-J13's whole purpose.

-- suggestion-images/{userId}/… — write your own; nobody reads directly (FR-M3's approval gate is
-- in suggestions_public, and the public board is served a signed URL only for approved images).
create policy suggestion_images_owner_write on storage.objects for insert to authenticated
  with check (bucket_id = 'suggestion-images'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy suggestion_images_owner_manage on storage.objects for delete to authenticated
  using (bucket_id = 'suggestion-images'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ============================================================================
-- 13. Story 2.5 — FR-A5's soft-delete window has two writers
-- ============================================================================
--
-- `profiles.deleted_at` and `profiles.purge_after` are declared in §1 and, until this story,
-- nothing wrote them. They are not client-writable either — §11 grants `authenticated` UPDATE on
-- `display_name, autosave_enabled, updated_at` alone, which is right and stays — so the window is
-- owned by two `security definer` functions in `provision_entitlement`'s shape.
--
-- `interval '14 days'` is written ONCE, in the migration this block mirrors
-- (`supabase/migrations/20260907150000_account_deletion_window.sql`), and `apps/web/
-- deletion-rule.test.ts` reads it back so the app's `DELETION_WINDOW_DAYS` cannot drift from it.
-- Both functions touch `auth.uid()`'s rows and no others; the profile and its snapshots move in
-- one transaction, which two PostgREST writes could not. `freeze_columns('is_admin')` binds that
-- column alone, so neither update trips it.

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

revoke execute on function public.request_account_deletion() from public, anon;
revoke execute on function public.restore_account() from public, anon;
grant  execute on function public.request_account_deletion() to authenticated;
grant  execute on function public.restore_account() to authenticated;

-- ============================================================================
-- 14. Story 5.8 — AD-15's flush, as the only thing that can perform it
-- ============================================================================
--
-- `authenticated` is granted UPDATE on eight columns of `public.projects` in §11 and `revision` is not
-- one of them — AD-31's deliberate choice, because a client that picks its own revision can start above
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
-- Mirrors `supabase/migrations/20260919120000_doc_sync_and_template_key_shape.sql`; the RLS gate
-- diffs the database the migrations build against the one this file builds, so the two move together.
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
