-- Story 7.18b — Pre-flight's warnings: the facts only the compile knows, kept on the Deploy row.
--
-- `deploys.preflight` is `{ templates, custom, noindex, freeAsks }`: every `.hbs` file the theme ships, `config.custom` as
-- the emitted `package.json` declares it, FR-H2's feed-guarded contexts (`CompiledTheme.noindex`), and the files that
-- carry a free member ask (`@site.allow_self_signup`). `lib/preflight.ts` turns them into warning rows at READ, so a word
-- change needs no migration; and they are kept per deploy so "since your last deploy" — this project's latest ACTIVATED
-- deploy to the site — has an earlier `custom` to compare (dropped settings, changed built-ins). Null on every earlier row.
--
-- NO NEW GRANT, deliberately, as for 7.18a's `quality` and `inputs_sha256`: `authenticated` holds a table-wide SELECT on
-- `deploys` (RLS scoping the rows to its own) and no INSERT or UPDATE on it at all — only the server's deploy route
-- writes it, with the service role, whose full CRUD on `deploys` the frozen migration already grants.
--
-- Pushed ALONE, before the code that writes it (R-99): nothing in CI runs a migration.
-- RE-RUNNABLE: `add column if not exists`; `comment on` replaces.

alter table public.deploys add column if not exists preflight jsonb;

comment on column public.deploys.preflight is
  'Pre-flight''s compile facts (Story 7.18b): {templates: string[], custom: object, noindex: string[], freeAsks: string[]} — every .hbs file shipped, config.custom as shipped, FR-H2''s feed-guarded contexts, and the files carrying @site.allow_self_signup. Written only by the server; null before 7.18b.';
