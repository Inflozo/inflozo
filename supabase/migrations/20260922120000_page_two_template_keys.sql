-- Story 5.16 — page 2 of a Tag or an Author page is a design of its own, and it needs a key to be stored under.
--
-- The owner's rulings R-178 and R-179 (2026-09-22) make page 2 a design of its own on every canvas that paginates:
-- Home, Tag and Author. Home's page 2 is stored under `index` — the file Ghost serves at `/page/N/`, a key this
-- constraint has accepted since 20260904120000 — but an archive has no second file, so its page 2 takes two new
-- keys: `tag-paged` and `author-paged`. Every other key, and the `custom:` pattern, is unchanged.
--
-- Pushed ALONE, before the code that writes these keys, and applied by hand through `SUPABASE_DB_POOLER_URL` (R-99):
-- nothing in CI runs a migration, and CI publishes the code on every push.
--
-- RE-RUNNABLE, for 20260919120000's reason (a hand-apply is the kind that gets retried after a dropped connection):
-- `drop constraint if exists` then `add constraint` is idempotent by shape.
--
-- STRICTLY WIDER than the constraint it replaces — every key the old list accepted, the new one accepts — so no row
-- in production can violate it, and both are added VALID. BOTH tables carry the identical constraint: the prefs row
-- (the preview subject and the "looked at" record) is keyed the same way as the doc it belongs to.

alter table public.project_templates      drop constraint if exists template_key_shape;
alter table public.project_templates      add  constraint template_key_shape check (
  template_key in ('site','home','index','post','page','tag','author','error','private','tag-paged','author-paged')
  or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$');

alter table public.project_template_prefs drop constraint if exists template_key_shape;
alter table public.project_template_prefs add  constraint template_key_shape check (
  template_key in ('site','home','index','post','page','tag','author','error','private','tag-paged','author-paged')
  or template_key ~ '^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$');
