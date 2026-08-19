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

create extension if not exists "pgcrypto";

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

-- FR-A3: passkeys are auto-named from the AAGUID and renameable. Supabase Auth's passkey
-- API is Beta (§7.6 item 4) and carries no user-editable label, so the label is ours.
create table public.passkey_labels (
  user_id       uuid not null references auth.users(id) on delete cascade,
  credential_id text not null,
  label         text not null,
  created_at    timestamptz not null default now(),
  primary key (user_id, credential_id)
);

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
create table public.site_credentials (
  site_id                uuid primary key references public.sites(id) on delete cascade,
  user_id                uuid not null references auth.users(id) on delete cascade,
  admin_key_vault_ref    uuid,                            -- vault.secrets(id)
  staff_token_vault_ref  uuid,                            -- nullable: deferred to first deploy, declinable
  admin_key_rotated_at   timestamptz,
  staff_token_rotated_at timestamptz,
  updated_at             timestamptz not null default now()
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
  purge_after   timestamptz,                              -- FR-C6: 90 days after disconnect; FR-A5: 14 days at delete
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
  linked_site_id uuid references public.sites(id) on delete set null,  -- FR-B5: at most one
  thumb_path    text,                                     -- FR-B1: unused in v1, retained so capture needs no migration
  -- AD1: the single monotonic revision every local doc carries as its base_revision
  revision      bigint not null default 0,
  rtl_ack_at    timestamptz,                              -- FR-Q6: blocking acknowledgement for an RTL language
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.projects (user_id, updated_at desc);
create index on public.projects (linked_site_id);
alter table public.profiles add constraint profiles_free_editable_fk
  foreign key (free_editable_project_id) references public.projects(id) on delete set null;

-- One row per DESIGNED template. Absence of a row IS "untouched" (FR-D6) — which is why
-- per-canvas preferences live in their own table and cannot accidentally materialize a stack.
create table public.project_templates (
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  template_key  text not null,   -- home|index|post|page|tag|author|error|private|custom:{filename}
  doc           jsonb not null,  -- ordered instances: {instanceId, layerName, designId, content,
                                 --  controls, parkedControls, darkOverrides, hidden, isMainFeed}
  updated_at    timestamptz not null default now(),
  primary key (project_id, template_key),
  constraint template_key_shape check (
    template_key in ('site','home','index','post','page','tag','author','error','private')
    or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\\.hbs$')
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
  constraint template_key_shape check (
    template_key in ('site','home','index','post','page','tag','author','error','private')
    or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\\.hbs$')
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

-- FR-L2 names entitlements directly; the state machine needs a home that is not a status string.
create table public.entitlements (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  state             public.entitlement_state not null default 'free',
  grace_expires_at  timestamptz,                          -- Inflozo's own 7-day window, reconciled against Dodo on_hold
  -- the dispute edges, both directions (FR-L2)
  disputed_at       timestamptz,
  restored_at       timestamptz,
  restored_by       uuid references auth.users(id),       -- deliberately manual: an unverified auto-restore flips twice
  restored_reason   text,
  restored_term_end timestamptz,                          -- restores the REMAINDER of the original paid term
  last_event_id     text,
  updated_at        timestamptz not null default now()
);

-- SERVER-ONLY. FR-L2: idempotent, signature-verified webhooks.
create table public.billing_events (
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
-- 10. RLS — every table, every policy shaped identically (AD-6/AD-7)
-- ============================================================================

alter table public.profiles                  enable row level security;
alter table public.passkey_labels            enable row level security;
alter table public.sites                     enable row level security;
alter table public.site_credentials          enable row level security;  -- no policy: server-only
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
alter table public.subscriptions             enable row level security;
alter table public.entitlements              enable row level security;
alter table public.billing_events            enable row level security;  -- no policy: server-only
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
    'passkey_labels','sites','site_snapshots','projects','project_templates',
    'project_template_prefs','custom_templates','custom_settings','translation_overrides',
    'routes_config','assets','edit_locks','project_treatments'
  ] loop
    execute format(
      'create policy %1$s_owner on public.%1$s for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- 10b. Read-only to the owner; written by the server only. The client polls these but must
-- never forge one — a client-writable deploys row is a forged deploy history.
do $$
declare t text;
begin
  foreach t in array array[
    'deploy_jobs','deploys','project_site_bindings','exports','deployed_template_names',
    'asset_usages','subscriptions','entitlements','checkout_consents','template_binding_checklist'
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
grant  insert, update on public.suggestions to authenticated;

-- (2) A SECURITY DEFINER view is the only path to image_path. Definer, deliberately: it must read
--     a column its callers cannot, so it carries its own row filter rather than inheriting RLS.
create view public.suggestions_public as
  select id, category, title, body, status, vote_count, created_at,
         case when image_approved or user_id = (select auth.uid())
              then image_path else null end as image_path
  from public.suggestions where hidden = false;
grant select on public.suggestions_public to anon, authenticated;

-- 10c. updated_at triggers
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','sites','site_credentials','projects','project_templates','project_template_prefs',
    'custom_settings','translation_overrides','routes_config','asset_usages','deploy_jobs',
    'subscriptions','entitlements'
  ] loop
    execute format('create trigger %1$s_touch before update on public.%1$s
                    for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

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

-- template_binding_checklist: FR-I6 is a checklist the user marks. The filename is the server's.
revoke update on public.template_binding_checklist from authenticated;
grant  update (marked_done_at) on public.template_binding_checklist to authenticated;

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
create trigger custom_templates_name_guard before insert on public.custom_templates
  for each row execute function public.guard_custom_template_name();

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
