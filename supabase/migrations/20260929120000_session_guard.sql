-- Story 5.24b — R-223: the database refuses a ticket whose sign-in session has ended, at once. And DW-293.
--
-- TWO CHANGES, ONE MIGRATION. (1) is the owner's ruling R-223 (2026-09-28): after Sign out everywhere, GoTrue refused
-- the old access token at once but `/rest/v1` answered it until the token's own `exp` (3,600 s), because PostgREST
-- checks a JWT's signature and expiry and never the session row behind it (DW-40, executed on every run by
-- `run-verify-sign-out-everywhere.py`). (2) is DW-293, found at this story's Create: `authenticated` could still
-- INSERT a `sites` row over `/rest/v1`, skipping connect and every check it makes. Pushed ALONE, before any code (R-99):
-- nothing in CI runs a migration. Applied on 2026-09-29 by the owner through Supabase's SQL editor (Story 5.24b's
-- Question 2, option 2) — this machine's permission check refused the pooler apply — and read back through
-- `SUPABASE_DB_POOLER_URL`: the function's body on production is byte-identical to the one below (MEASUREMENTS §56).
--
-- EVERY STATEMENT IS RE-RUNNABLE, for 20260911100000's reason (a hand-apply is the kind that gets retried after a
-- dropped connection): `create or replace`, `revoke`, `grant` and `alter role … set` are idempotent by shape.
--
-- ─── (1) THE GUARD. PostgREST's pre-request function, chosen from its source (PostgREST 14.5, the version production
-- runs) and run locally against it with Supabase's own Postgres image before this was written:
--   * it runs INSIDE every request's transaction, after the role and the claims are set — every read, write, HEAD and
--     `/rpc` call, the `security definer` RPCs included (the editor's save is one, `sync_project_doc`). A check in the
--     row policies would be one more term per row on every table and would still miss those RPCs;
--   * it is one index-only lookup on `auth.sessions`' primary key per request;
--   * it covers `/rest/v1` only. Storage and Realtime are not PostgREST: this app reaches Storage through the service
--     role alone and has no Realtime (R-191).
--
-- ONLY `authenticated` IS JUDGED. `anon` and `service_role` (the publishable and secret keys) carry no session and pass
-- at once. A user's ticket passes when its `session_id` claim is a uuid with a row in `auth.sessions` — GoTrue deletes
-- that row on every sign-out, which is exactly what `session_not_found` means at `/auth/v1/user`. A missing, malformed
-- or ended `session_id` is refused with the same code GoTrue uses, so a client meets ONE answer for one fact.
--
-- THE RAISE MUST BE WHOLE. PostgREST 14.5 answers a `PGRST` raise whose message lacks `code`, or whose detail lacks
-- `status` or `headers`, with `500 PGRST121` — and the examples on Supabase's own page lack them. Executed locally:
-- this exact pair answers `401`, `WWW-Authenticate: Bearer error="invalid_token"`, body code `session_not_found`.
--
-- WHY `public` AND A DEFINER. PostgREST calls the function as the REQUEST's role, so anon, authenticated and
-- service_role need EXECUTE and USAGE on its schema; in `private` that would undo §0b (and there, locally, it failed on
-- some requests and not others). `auth.sessions` has RLS on and no policy, so the lookup must run as an owner that
-- bypasses RLS — `postgres` does. `set search_path = ''` for every definer's reason: an unqualified name in the body
-- would resolve in the caller's path. It can be called as `/rpc/session_guard`, which does nothing.
--
-- COMMENTS LIVE OUTSIDE THE BODY: pg_dump emits function bodies verbatim and the RLS gate diffs these migrations
-- against SCHEMA.sql, so a comment inside would have to be byte-identical in both (Story 2.5's lesson).
--
-- IT COMES OFF IN ONE STATEMENT, and that statement is the runbook if a live session's read ever fails after this:
--     alter role authenticator reset pgrst.db_pre_request; notify pgrst, 'reload config';

create or replace function public.session_guard() returns void
language plpgsql security definer set search_path = '' as $$
declare
  claims jsonb = nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  sid text = claims ->> 'session_id';
begin
  if claims ->> 'role' is distinct from 'authenticated' then
    return;
  end if;
  if pg_input_is_valid(sid, 'uuid') then
    if exists (select 1 from auth.sessions where id = sid::uuid) then
      return;
    end if;
  end if;
  raise sqlstate 'PGRST' using
    message = '{"code":"session_not_found","message":"Session from session_id claim in JWT does not exist"}',
    detail = '{"status":401,"headers":{"WWW-Authenticate":"Bearer error=\"invalid_token\""}}';
end $$;

revoke execute on function public.session_guard() from public;
grant  execute on function public.session_guard() to anon, authenticated, service_role;

-- The wiring, after the function exists. `NOTIFY` is delivered at commit, so PostgREST reloads its configuration only
-- once the function is there to call. `postgres` holds ADMIN on `authenticator` and Supabase's supautils allows the
-- `pgrst.*` settings (read on production at this story's Create).
alter role authenticator set pgrst.db_pre_request = 'public.session_guard';
notify pgrst, 'reload config';

-- ─── (2) DW-293. Connect writes `sites` on the server through the secret key only (`sites/actions.ts`), and every
-- harness seeds through the service role, so the column INSERT grant had no user left — while it let a signed-in user
-- create a row holding any `url` over `/rest/v1`, skipping connect and every check it makes. Revoking the privilege on
-- the table revokes its column grants too.
revoke insert on public.sites from authenticated;
