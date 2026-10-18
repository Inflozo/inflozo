-- Story 7.17 — the site stores WHY Inflozo could not upload its routes.yaml, so the guided fallback (B16) names it.
--
-- FR-I4: Inflozo uploads `routes.yaml` with the site's Staff Access Token, and when it cannot, the customer is shown the
-- manual card. EXPERIENCE.md F3 gives that card three causes, each with its own body and button: no token on the
-- connection, a token that has stopped working (Ghost's 401), and a token whose staff user is below Administrator
-- (Ghost's 403 — only an Owner or an Administrator may edit settings, read in Ghost 6.58.0's and 5.130.6's
-- `can-this.js` and `fixtures.json`). The revoked and the role cases cannot be told apart later without re-asking Ghost,
-- so the cause is stored when the upload answers (the spec's routine call 8). Null means nothing is owed: the card shows
-- only while this is set. Pushed ALONE, before the code that writes it (R-99): nothing in CI runs a migration.
--
-- NO NEW GRANT, deliberately: `authenticated` keeps its table-wide select (the card is drawn from the tenant's own row)
-- and its column-limited update (title, favicon_url, updated_at) does not gain this column — only the server's routes
-- step and Verify upload write it, with the service role.
--
-- RE-RUNNABLE: `add column if not exists` skips the column and its check together.

alter table public.sites
  add column if not exists routes_fallback text check (routes_fallback in ('no_token', 'revoked', 'role'));
