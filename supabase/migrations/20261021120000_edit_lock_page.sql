-- Story 7.18c — the edit lock remembers WHICH PAGE last wrote it, so a closing page's leave matches its own page (DW-307).
--
-- A going page's `leave` used to match only the beat it last HEARD (`heartbeat_at = <heard>`): a beat still in flight moved
-- the row past it, the close matched nothing, and the other window waited ~60 s instead of a grace and one poll (R-228's
-- ceiling); the reverse order — the leave lands, then the in-flight beat — revived the row. Now every beat writes its page
-- (`page_id`, a random id the browser mints per page load, compared only) and a leave marks that page gone (`page_left`):
--
--   beat/acquire(X):  set heartbeat_at = now, page_id = X, page_left = false
--                     where holder = S and (page_left = false or page_id <> X)
--   leave(P):         set heartbeat_at = leaveStamp(now), page_left = true
--                     where holder = S and page_id = P and page_left = false and heartbeat_at > leaveStamp(now)
--
-- so a leave matches its own page in either order, a late beat from a page that left matches nothing, and a reload's new
-- page keeps the row (DW-240 unchanged). Null `page_id`: a row no page-sending client has written yet.
--
-- NO SERVICE-ROLE GRANT, deliberately: `edit_locks` is absent from the service role's grant loop and every read and write
-- of it is the user's own session's, through `lock/route.ts` (`server/edit-lock.ts`, MEASUREMENTS §50). So the two
-- columns are granted to `authenticated` only — `page_id` at INSERT (an acquire's first row names its page; `page_left`
-- defaults false), both at UPDATE. Neither is server-asserted: they are the holder's own protocol, like `heartbeat_at`.
--
-- Pushed ALONE, before the code that writes it (R-99): nothing in CI runs a migration.
-- RE-RUNNABLE: `add column if not exists`; `comment on` replaces; a grant repeated is a no-op.

alter table public.edit_locks
  add column if not exists page_id text check (char_length(page_id) between 1 and 64);
alter table public.edit_locks
  add column if not exists page_left boolean not null default false;

grant insert (page_id) on public.edit_locks to authenticated;
grant update (page_id, page_left) on public.edit_locks to authenticated;

comment on column public.edit_locks.page_id is
  'The page that last wrote this lock (Story 7.18c, DW-307): a random id the browser mints per page load (and again on a back-forward restore), compared only. A leave matches its own page; null until a page-sending client writes the row.';
comment on column public.edit_locks.page_left is
  'Whether the page in page_id has gone (Story 7.18c, DW-307): set by its leave, cleared by any beat. A late beat from a page that left matches nothing; a reload''s new page keeps the row.';
