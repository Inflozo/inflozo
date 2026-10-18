-- Story 7.18a — the deploy wizard: the stage Ship it resumes, the quality verdict's column, and the staleness test.
--
-- AD-20's F-075 (2026-09-03): Pre-flight and Ship it are TWO server calls on ONE `deploy_jobs` row. Pre-flight compiles,
-- runs both gates and stores the artefact, then parks the row at `awaiting_ship`; Ship it resumes that same row. Without
-- the stage the row has nowhere to wait between the two calls. It sits after `checking` because that is where it falls.
--
-- `deploys.quality` is Story 7.8's verdict (the `QualityVerdict` from `qualityGate`) beside 7.7's `gscan`: a blocked
-- Pre-flight keeps BOTH verdicts on its `failed` row. `deploys.inputs_sha256` is the staleness test: a sha-256 over every
-- row the compile read plus the release, so Ship it re-makes the artefact on the same row only when that hash moved.
--
-- DW-355: `custom_settings.bound_to`'s inline comment named two shapes; Story 7.10 stores a third. The three shapes are
-- `custom-settings.ts`'s `Binding` type, which is the one statement of them.
--
-- NO NEW GRANT, deliberately: `authenticated` holds a table-wide SELECT on `deploys` (it reads its own deploy's verdicts,
-- RLS scoping the rows) and no INSERT or UPDATE on it at all — only the server's deploy route writes them, with the
-- service role, whose full CRUD on `deploys` the frozen migration already grants.
--
-- Pushed ALONE, before the code that writes it (R-99): nothing in CI runs a migration.
-- RE-RUNNABLE: `add value if not exists` and `add column if not exists`; `comment on` replaces.

alter type public.job_stage add value if not exists 'awaiting_ship' after 'checking';

alter table public.deploys
  add column if not exists quality jsonb,
  add column if not exists inputs_sha256 text;

comment on column public.custom_settings.bound_to is
  'What the setting was promoted from: {kind:''control'', instanceId, controlKey} | {kind:''prop'', instanceId, path} | {kind:''token'', token:''accent''} — custom-settings.ts''s Binding is the one statement of the shapes.';
