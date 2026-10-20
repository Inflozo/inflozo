-- Story 7.19 — the site remembers a "Not now" on the first-deploy credential step, so it is never asked again.
--
-- FR-C1 asks for the Staff Access Token at a site's first deploy (D1b, "Safety net") and lets the customer decline it.
-- D1c is "raised once, never again": a first deploy that stops before its upload (a gscan error, a closed wizard) writes
-- no `project_site_bindings` row, so without a record the next open would ask again. The grain is the SITE RECORD
-- (R-278, Question 1): a decline on one site never silences another, any project of the user's reads it, and it stays
-- through a disconnect and reconnect because connect re-adopts the record. Null means never declined. A stored token
-- also skips the step, so this column is read only while `credentials_present.staff` is false.
--
-- NO NEW GRANT, deliberately, as for 7.17's `routes_fallback`: `authenticated` keeps its table-wide select (the editor's
-- read decides the offer from the tenant's own row) and its column-limited update (title, favicon_url, updated_at) does
-- not gain this column — only the server's `declineSafetyNet` writes it, with the service role, scoped by `user_id`.
--
-- Pushed ALONE, before the code that writes it (R-99): nothing in CI runs a migration.
-- RE-RUNNABLE: `add column if not exists`; `comment on` replaces.

alter table public.sites add column if not exists staff_token_declined_at timestamptz;

comment on column public.sites.staff_token_declined_at is
  'When the customer pressed Not now on the first-deploy Staff Access Token step (Story 7.19, FR-C1, D1c: raised once, never again). Per site record (R-278): no project of the user''s asks again on this site, through disconnect and reconnect; another site still asks once. Null = never declined. Written only by the server.';
