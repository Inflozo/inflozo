-- Story 5.20 — the paywall is a design of its own, and it needs a key to be stored under.
--
-- The owner's ruling R-197 (2026-09-26) builds the Paywall canvas now, as the first TEMPLATE SURFACE: the box Ghost
-- renders where a members-only post stops, at `partials/content-cta.hbs`. The choice of paywall design, its content and
-- its controls live in a doc like every other canvas's — one row per stored state, not a second store (AD-27) — so the
-- doc and its prefs row (View as's "looked at" record) take one new key: `paywall`. `project_treatments.paywall_design_id`
-- cannot hold content or controls and stays unwritten (DW-267). Every other key, and the `custom:` pattern, is unchanged.
--
-- Pushed ALONE, before the code that writes this key, and applied by hand through `SUPABASE_DB_POOLER_URL` (R-99):
-- nothing in CI runs a migration, and CI publishes the code on every push.
--
-- RE-RUNNABLE, for 20260919120000's reason (a hand-apply is the kind that gets retried after a dropped connection):
-- `drop constraint if exists` then `add constraint` is idempotent by shape.
--
-- STRICTLY WIDER than the constraint it replaces — every key the old list accepted, the new one accepts — so no row
-- in production can violate it, and both are added VALID. BOTH tables carry the identical constraint: the prefs row
-- is keyed the same way as the doc it belongs to.

alter table public.project_templates      drop constraint if exists template_key_shape;
alter table public.project_templates      add  constraint template_key_shape check (
  template_key in ('site','home','index','post','page','tag','author','error','private','tag-paged','author-paged','paywall')
  or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$');

alter table public.project_template_prefs drop constraint if exists template_key_shape;
alter table public.project_template_prefs add  constraint template_key_shape check (
  template_key in ('site','home','index','post','page','tag','author','error','private','tag-paged','author-paged','paywall')
  or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$');
