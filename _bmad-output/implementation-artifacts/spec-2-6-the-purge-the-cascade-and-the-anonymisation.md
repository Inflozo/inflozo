---
title: 'Story 2.6 — The purge, the cascade and the anonymisation'
type: 'feature'
created: '2026-09-07'
status: 'ready-for-dev'
review_loop_iteration: 0
owner_test: none
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md']
---

## In plain English

Nothing new appears on screen in this story: it builds the background job that runs once a day, finds
every account whose 14-day countdown has run out, and removes it for good — the projects, the sites and
their keys, the uploaded images, the archived original themes, the deploy files, the votes and the
notifications, and finally the sign-in itself. A suggestion that person posted on the ideas board
stays, with the author shown as "Deleted user" and any picture they attached taken down. No email is
sent, and an account that pressed **Restore** in time is never touched, because Restore cleared its
countdown.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2.5 opens the window — `request_account_deletion()` stamps `profiles.deleted_at`
and `purge_after`, `/restore` holds the door — and nothing closes it. An account whose deadline has
passed stays pending for ever, which is precisely the indefinite retention FR-A5 (`prd.md:184`)
forbids. AD-33 (spine `:354-359`) names the **account purge** as E2's one cron and closes the v1 set;
today there is no `apps/web/app/api/` at all and `vercel.json` carries no `crons`.

**Approach:** One route handler at the spine's home, `apps/web/app/api/cron/purge-accounts/route.ts`,
scheduled daily in `vercel.json` and guarded by Vercel's own `CRON_SECRET` bearer. For each account
whose `purge_after` has passed it removes every Storage object under that account's prefixes in all
four buckets **before any row** (AD-32), anonymises the account's suggestions, then deletes the auth
user through GoTrue's admin API, whose `auth.users` row is what every table in the schema cascades
from. The job is idempotent and reconciliation-based — every run reprocesses whatever is due — one
account's failure never stops the rest, and a failed account is simply still due tomorrow. No email,
no notification, no second client, no schema change.

## Boundaries & Constraints

**Always:**
- **The home and the owner (AD-33).** The route is `apps/web/app/api/cron/purge-accounts/route.ts`,
  `GET`, its header naming **E2, FR-A5, AD-32, AD-33** and this story; its schedule is the one `crons`
  entry in `apps/web/vercel.json` — `{ "path": "/api/cron/purge-accounts", "schedule": "15 3 * * *" }`,
  daily at 03:15 UTC (the timezone is always UTC; a daily expression is legal on every Vercel plan).
  A test reads the route's path constant and `vercel.json` back and asserts the two agree and the
  expression runs once a day. Vercel invokes it with `GET` on the production deployment URL
  (`https://*.vercel.app/api/cron/purge-accounts`), which `routing.ts`'s `route()` passes straight
  through — no rewrite, no routing change.
- **The secret is Vercel's mechanism, fail-closed.** Vercel sends `Authorization: Bearer $CRON_SECRET`
  when the project carries that variable (docs, read 2026-09-07). The route answers **401 before any
  database read** unless the header equals `Bearer ${process.env.CRON_SECRET}` — compared with
  `timingSafeEqual` after a length check — and an **unset `CRON_SECRET` is a 401 too**, never an open
  endpoint. `export const dynamic = 'force-dynamic'` and `Cache-Control: no-store` on every response:
  a cached cron response is skipped and unlogged (docs), which is a purge that silently did not run.
- **The third privileged reader, named.** The route imports `supabaseAdmin()` — the docstring in
  `lib/supabase/server.ts:61-72` foresaw exactly this — and `server-wiring.test.ts:80`'s `allowed`
  gains the route with its reason; the docstring's "Two so far" becomes three. No session, no cookie,
  no user client: nothing here acts on anyone's behalf.
- **Due means the index already drawn.** `profiles where deleted_at is not null and purge_after <=
  now()` (`:125`), oldest deadline first, `limit(BATCH)` with `BATCH = 25` — a day's churn for this
  product, and the next run takes the rest. A restored account has both columns null
  (`restore_account()`, 2.5) and is invisible to the query by construction.
- **Objects before rows, by prefix, in all four buckets (AD-32).** For each account: every object
  under `assets/{uid}/`, `site-snapshots/{uid}/`, `suggestion-images/{uid}/` (schema `:1549-1559`) and
  `deploy-artifacts/{projectId}/` for **every project the account owns** (`:430`, the one layout the
  schema states for that bucket). Listed with storage-js 2.115.0's `listV2({ prefix })` — flat, full
  keys, `limit` 1000, paged — and removed in the same batches, **repeated until the listing is empty**
  and bounded by a round limit that throws. Prefix-driven and not row-driven, so an object whose row
  never landed goes too; the bucket names live in one module with the schema line each comes from.
- **Suggestions are anonymised, never deleted** (FR-A5, `:628`). AFTER the account's images are gone:
  `update suggestions set user_id = null, anonymized_at = now(), image_path = null, image_approved =
  false where user_id = uid`. The board renders "Deleted user" for a null author — that rendering is
  the board's story; this story lands the data fact. Votes (`:646`) and notifications (`:671`) are
  **deleted**, by the cascade below.
- **Then the user, through GoTrue.** `supabaseAdmin().auth.admin.deleteUser(uid)` — auth-js 2.115.0,
  `GoTrueAdminApi.js:732`, `DELETE /admin/users/{id}` with `should_soft_delete: false`. The
  `auth.users` delete cascades `profiles`, `sites`, `private.site_credentials`, `site_snapshots`,
  `projects` and everything under a project, `assets`, `deploys`, `exports`, `subscriptions`,
  `entitlements`, `checkout_consents`, `suggestion_votes`, `notifications` (every `references
  auth.users(id) on delete cascade` in the schema). `private.billing_events.user_id` goes null
  (`:602`) and `private.credential_audit` has no FK (`:744`) — both outlive the account by design.
- **Order within an account is objects → suggestions → user, and each account is its own try.** A
  failure at any step logs `{ userId, step, code, message }` — never an email address — and the run
  continues with the next account; the account stays due. The response is `{ purged, failed }`, **500
  whenever `failed > 0`** so the invocation shows red in Vercel's cron log (Vercel does not retry, and a
  red log line is the only alarm that exists today — DW-46). A run with nothing due answers 200
  `{ purged: 0, failed: 0 }`.
- **No email, no notification, no reminder — deliberately** (FR-A5's last sentence, FR-P2 `:466`). A
  source-reading test asserts the route and its modules never import `lib/email` or
  `lib/deletion-email`.
- **The pure parts are pure and tested.** `authorized(header, secret)`, `prefixesFor(uid, projectIds)`
  and the bucket list in `app/api/cron/purge-accounts/purge-rule.ts`; `drainPrefix(bucket, prefix)`
  over the `{ listV2, remove }` interface in `lib/storage-drain.ts` so E3's snapshot orphan purge and
  E7's artifact retention import the one walker rather than writing a second; both held by
  `apps/web/purge.test.ts` under `node --test` with stubs.
- **Proved on the real infrastructure, end to end (R-82, the epic's exit).**
  `tools/probe/run-verify-account-purge.py` seeds three users on the live project — **A** due
  (`purge_after` yesterday), **B** pending but not due, **C** live — with A's rows and one object in
  each of the four buckets (the `assets` one nested two folders deep), a suggestion by A carrying an
  approved image, A's vote on a suggestion of C's, and a notification for A; calls the route on
  `https://inflozo.com/api/cron/purge-accounts` (the apex passes every non-app path through,
  `routing.ts`, so the production domain reaches the handler that Vercel reaches on `*.vercel.app`);
  **controls first** — no header and a wrong secret each answer 401 with A still there; then the
  bearer: 200 `{ purged: 1, failed: 0 }`, A's user gone, every row of A's gone, every prefix empty,
  A's suggestion present with the four columns as above, C's `vote_count` back down, B and C
  untouched, and a second call `{ purged: 0, failed: 0 }`. Cleanup deletes B and C and their objects
  and compares the Admin-API user count before and after. `--check` is plumbing: keys present, one
  admin create-read-delete, and one put → `list-v2` → delete under a harness prefix in **each** bucket —
  which is also the first execution of the `list-v2` hypothesis.
- **`CRON_SECRET` exists in three places, by name.** Generated once (`python3 -c "import secrets;
  print(secrets.token_urlsafe(32))"`), added to Vercel `production` by the Dev run through `POST
  /v10/projects/{id}/env` exactly as 2.5 added `RESEND_*`, written to `tools/probe/.env`, and named in
  `tools/probe/.env.example` under the VERCEL block with that command. Never printed; the pre-commit
  secret scan stands.

**Ask First:**
- GoTrue refuses the delete on a foreign key the schema does not cascade — `entitlements.restored_by`
  (`:590`) is the one — for a **real** account: stop and ask rather than nulling someone's audit column
  in a cron (DW-45 names the fix and its owner).
- Anything that would need a migration: a claim column, a second `purge_after`, a `security definer`
  purge function. None is planned; a schema change is SCHEMA.sql + RLS-TEST + the gate and a design
  change to flag.
- The Vercel project rejects the daily expression at deploy (it is Hobby-legal and the env template
  says Pro) — say so; do not loosen the schedule silently.

**Never:**
- No email, no notification row, no nudge of any kind (FR-P2). No Dodo call (DW-42; E12's).
- No second Supabase client and no reader of `SUPABASE_SECRET_KEY` outside `supabaseAdmin()`; no SQL
  `delete from auth.users`; no definer function; no migration; no touch of `SCHEMA.sql`.
- No deletion driven by row pointers alone (`site_snapshots.storage_path`, `assets.path`,
  `suggestions.image_path`) — the prefix walk is the rule and the pointers are not trusted to be
  complete; `snapshotObjectKey()` is therefore not what this story imports.
- No deleting of a suggestion, no touching of columns beyond the four named, no `hidden = true`.
- No `maxDuration` export (the default is 300 s on every plan with fluid compute, docs 2026-08-24) and
  no lock table — overlapping runs are harmless by construction (matrix) and marked `ponytail:`.
- No UI, no frame, no owner's manual test (`owner_test: none`). Not the snapshot orphan purge (E3,
  FR-C6), not artifact retention (E7, FR-J7), not the notification prune (E13, FR-B7) — each is its
  own cron with its own owner (AD-33), and this route purges accounts only.
- No Vault cleanup: nothing writes `vault.secrets` yet and Story 3.1 owns the rows that will
  (DW-44).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Due account with objects everywhere | A: `deleted_at` set, `purge_after < now()`, objects in four buckets, rows in every table | Objects gone, suggestions anonymised, user gone, cascade empties every table of A's; 200 `{ purged: 1, failed: 0 }` | N/A |
| Pending, not due | B: `purge_after > now()` | Not selected; nothing of B's touched | N/A |
| Restored | both columns null | Invisible to the query | N/A |
| Due account with no objects | A owns rows, no Storage objects | Every listing empty; straight to anonymise and delete | N/A |
| Suggestion with image, vote on another's post | A's suggestion `image_approved = true`; A voted on C's | A's row stays: `user_id` null, `anonymized_at` set, `image_path` null, `image_approved` false, image object gone; A's vote row gone and C's `vote_count` decremented by `sync_vote_count` | N/A |
| No `Authorization`, wrong secret, or `CRON_SECRET` unset | any due account | **401**, no database read, nothing changes | the control |
| Storage refuses a removal | one prefix of A's errors | A logged `{ step: 'objects' }` and skipped this run — rows kept, objects partly gone is fine, tomorrow re-lists; others proceed; 500 | logged, retried daily |
| `deleteUser` fails | 23503 on a non-cascading FK, or transient | A logged `{ step: 'user' }`; objects already gone, suggestions already anonymised, both idempotent; A still due tomorrow | FK → **Ask First**; transient → retried daily |
| Duplicate or overlapping invocation (Vercel: best-effort, may repeat) | two runs see A | second finds listings empty, anonymise a no-op, `deleteUser` 404 → logged as failed, 500, nothing wrong | `ponytail:` no claim column |
| More than `BATCH` due | 40 due | 25 purged, oldest deadlines first; the rest tomorrow | N/A |
| Signed-in tab of a purged account | session cookie survives the delete | next request: `getUser()` 403 `session_not_found` → bounced to `/sign-in` (2.4's finding) | N/A |
| Missed run (Vercel: best-effort delivery) | a day skipped | tomorrow's run purges everything due, the skipped day's included | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/api/cron/purge-accounts/route.ts` (new) -- `export const dynamic = 'force-dynamic'`;
  `GET(request)`: `authorized(request.headers.get('authorization'), process.env.CRON_SECRET)` else
  401 `no-store`; `supabaseAdmin().from('profiles').select('user_id').not('deleted_at', 'is',
  null).lte('purge_after', new Date().toISOString()).order('purge_after').limit(BATCH)` (the index
  `:125`); per row, in a `try`: `from('projects').select('id').eq('user_id', uid)` → `for (const
  [bucket, prefix] of prefixesFor(uid, ids)) await drainPrefix(admin.storage.from(bucket), prefix)`
  → `from('suggestions').update({ user_id: null, anonymized_at, image_path: null, image_approved:
  false }).eq('user_id', uid)` → `admin.auth.admin.deleteUser(uid)` (error → throw with `step:
  'user'`); `console.log('purge: account removed', { userId })`; `catch` → `console.error('purge:
  failed', { userId, step, code, message })` and `failed++`; respond `Response.json({ purged, failed },
  { status: failed ? 500 : 200, headers: { 'Cache-Control': 'no-store' } })`. Header comment in the
  download route's voice (`snapshots/[id]/download/route.ts:6-33`): E2, FR-A5, AD-32, AD-33, why
  objects first, why GoTrue and not SQL, why 500, and `// ponytail: no lock — an overlapping run
  meets empty listings and a 404, both harmless; a claim column the day two runs cost money`
- `apps/web/app/api/cron/purge-accounts/purge-rule.ts` (new, pure, no Next import) -- `CRON_PATH =
  '/api/cron/purge-accounts'`; `BATCH = 25`; `authorized(header: string | null, secret: string |
  undefined): boolean` — `secret` non-empty, `header` = `Bearer ` + secret, lengths equal, then
  `timingSafeEqual` from `node:crypto`; `BUCKETS` with the schema line beside each name (`assets`
  `:1549`, `site-snapshots` `:1555`, `suggestion-images` `:1559`, `deploy-artifacts` `:430`);
  `prefixesFor(uid, projectIds): [bucket, prefix][]` — the three `{uid}/` prefixes and one
  `{projectId}/` per project, every prefix ending in `/`. `SNAPSHOT_BUCKET` in
  `account/deletion-rule.ts:91` stays the download route's; the list here is the purge's and names all
  four
- `apps/web/lib/storage-drain.ts` (new, pure over an interface) -- `drainPrefix(bucket: { listV2,
  remove }, prefix, limit = 1000): Promise<number>`: loop `listV2({ prefix, limit })` (storage-js
  2.115.0 `dist/index.mjs:1599-1603` → `POST /object/list-v2/{bucket}`; options `index.d.mts:366-390`,
  `with_delimiter` default `false` = flat listing; result `{ hasNext, objects, nextCursor }`
  `:448-453`) → error → throw `{ step: 'objects', bucket, prefix, code }`; `objects` empty → return the
  count; `remove(objects.map((o) => o.name))` (`:1393-1396` → `DELETE /object/{bucket}` with
  `prefixes`) → error → throw; more than `MAX_ROUNDS = 100` rounds → throw (a listing that never
  empties is a bug, not a loop). Header: AD-32, who else will import it (E3's orphan purge, E7's
  retention), and the v1 `list()` fallback's two gotchas should `list-v2` ever be withdrawn (folders
  come back with `id: null`; names are relative to the folder)
- `apps/web/purge.test.ts` (new) -- `authorized`: the exact header true; wrong secret, different
  length, missing header, empty secret and undefined secret all false; `prefixesFor`: four entries for
  one project, three for none, every prefix ends in `/` and starts with the id; `drainPrefix` with a
  stub bucket: two pages then empty → `remove` called with the full names, count right; a listing
  error → throws with `step: 'objects'`; a stub that never empties → throws after `MAX_ROUNDS`;
  SOURCE-READING: `vercel.json`'s `crons` has exactly one entry whose `path` is `CRON_PATH` and whose
  `schedule` has five fields with a numeric minute and hour and `*` in the last three (once a day);
  the route file and its two modules contain no import of `lib/email` or `lib/deletion-email`
- `apps/web/vercel.json` -- ADD `"crons": [{ "path": "/api/cron/purge-accounts", "schedule": "15 3 * *
  *" }]` (the shape from the docs' own example)
- `apps/web/server-wiring.test.ts:16, 80` -- a `PURGE_ROUTE` constant beside `SNAPSHOT_ROUTE`; `allowed`
  gains it with its reason (the THIRD reader: the purge acts for nobody, so no session can make its
  reads, and `deleteUser` is an admin-API call by definition)
- `apps/web/lib/supabase/server.ts:61-66` -- the docstring's "Two so far" sentence gains the purge
  route as the third named reader; nothing else in the file moves
- `tools/probe/.env.example:91-95` -- `CRON_SECRET=` under the VERCEL block, with the generation
  command and the sentence that Vercel sends it as `Authorization: Bearer` (docs, 2026-09-07); the
  value the Dev run generates lands in `tools/probe/.env` (gitignored) and in Vercel `production`
- **Vercel (real)** -- `GET /v9/projects/{VERCEL_PROJECT}/env` names only, then `POST
  /v10/projects/{VERCEL_PROJECT}/env` `{ key: 'CRON_SECRET', value, type: 'encrypted', target:
  ['production'] }` with `VERCEL_TOKEN` and `VERCEL_TEAM_ID` — 2.5's exact pattern; read back by name.
  The Deploy run's build registers the cron (a `crons` change needs a redeploy, docs)
- `tools/probe/run-verify-account-purge.py` (new, tool → a `doc-audit.py` catalogue row in `:312`'s
  shape) -- `_sibling('run-verify-account-deletion')` for `_request` and `rest`;
  `_sibling('run-verify-passkeys')` for `Admin` and `load_env` (`:104-160`); bucket-parametrised
  `storage_put/list_v2/delete(sb, secret, bucket, key)` in this file (the sibling's are bound to one
  bucket); fixture pattern `^purge-harness-\d+(-b|-c)?@inflozo\.com$` swept first; the steps as the
  Always names them — `secret`, `seeded`, `no-header`, `wrong-secret`, `purge`, `user-gone`,
  `rows-gone`, `objects-gone`, `anonymised`, `others-untouched`, `idempotent` — each PASS/FAIL, exit
  non-zero on any FAIL; `--check` as the Always describes it; `--url` defaults to
  `https://inflozo.com` so a Review run can point it at a deployment URL. Seeds through PostgREST with
  the secret key: `profiles` PATCH `{ deleted_at, purge_after }` for A (yesterday) and B (tomorrow) —
  the service role holds update on every public table (`:1167`) and `freeze_columns` binds neither
  column (`:293`, `:886`); `sites`, `site_snapshots`, `projects`, `assets`, `suggestions` (one by A
  with `image_path`/`image_approved`, one by C), `suggestion_votes` (A on C's), `notifications`. No
  key printed
- `tools/doc-audit.py:312` -- the harness's catalogue row, after the account-deletion harness's
- `_bmad-output/implementation-artifacts/deferred-work.md` -- **DW-44** Vault secrets orphaned by the
  `site_credentials` cascade (3.1's), **DW-45** `entitlements.restored_by` does not cascade (E12's),
  **DW-46** a failed purge reaches nobody until NFR-9's Sentry — all three written at Create
- `_bmad-output/implementation-artifacts/epic-2-context.md` -- the "since compiled" section gains what
  2.6 decided at Create, as 2.5's line does
- read-only: `routing.ts` (`route()`: the apex and any unknown host pass a non-`/app` path through,
  which is why both `inflozo.com` and `*.vercel.app` reach the route and `app.inflozo.com` does not —
  it rewrites everything to `/app/…`); `proxy.ts` (the matcher includes `/api/…`, which only adds the
  CSP header on a `pass`); `app-routes.test.ts` (walks `page.tsx` only; a route handler outside
  `(app)` trips nothing); `lib/flags.ts:42-47` (the admin-read shape); `lib/with-timeout.ts` (not
  used — the function's 300 s ceiling is the timeout, and tomorrow retries); schema `:112-125`,
  `:181-190`, `:192-200`, `:362-365`, `:420-431`, `:471-476`, `:583-591`, `:598-602`, `:626-648`,
  `:650-659`, `:669-671`, `:740-744`, `:1167`, `:1482-1486`, `:1549-1559`; auth-js
  `GoTrueAdminApi.js:700-745`; spine AD-13 `:181-185`, AD-32 `:346-352`, AD-33 `:354-359`; PRD FR-A5
  `:184`, FR-C6 `:212`, FR-P2 `:466`, NFR-8 `:492`, NFR-9 `:493`; `epics.md:831-856`; Vercel docs read
  2026-09-07 — `/docs/cron-jobs` (GET on the production deployment URL, `vercel-cron/1.0`),
  `/docs/cron-jobs/manage-cron-jobs` (`CRON_SECRET` → `Authorization: Bearer`; no retry; best-effort
  and possibly duplicate delivery; redirects not followed; cached responses unlogged; `vercel crons`
  lists and triggers on demand), `/docs/cron-jobs/usage-and-pricing` (Hobby once a day ±59 min, Pro
  per minute), `/docs/functions/configuring-functions/duration` (default 300 s on every plan),
  `/docs/deployment-protection` (Standard Protection leaves production domains public and restricts
  the generated production URL)

## Tasks & Acceptance

**Execution:**
- [ ] `app/api/cron/purge-accounts/purge-rule.ts` + `lib/storage-drain.ts` + `apps/web/purge.test.ts`
      -- the secret compare, the four prefixes, the walker, and the source-reading tests, all green
      before the route exists -- the contract before anything reads it
- [ ] `tools/probe/run-verify-account-purge.py --check` + its `doc-audit.py` row -- put → `list-v2` →
      delete in each of the four buckets on the live project -- the `list-v2` hypothesis executed
      before the walker is trusted; a 404 here means the v1 `list()` recursion the walker's header
      describes, and the Spec Change Log says so
- [ ] `app/api/cron/purge-accounts/route.ts` + `server-wiring.test.ts` + `lib/supabase/server.ts` --
      the route, and the third reader named where the second was -- FR-A5's purge
- [ ] `apps/web/vercel.json` -- the one `crons` entry -- AD-33's schedule beside its home
- [ ] `tools/probe/.env.example` + Vercel production env + `tools/probe/.env` -- `CRON_SECRET` by name
      in all three -- the door has a key before the door is deployed
- [ ] `tools/probe/run-verify-account-purge.py` (the full run) -- against the deployed commit, controls
      first -- R-82, re-runnable, the epic's exit
- [ ] `deferred-work.md` + `epic-2-context.md` -- DW-44, DW-45, DW-46 and the Create line, landed at
      Create -- propagate, never localise
- [ ] Run `## Verification` on the real infrastructure and record every command and result by variable
      name

**Acceptance Criteria:**
- Given a seeded account A on the live project whose `purge_after` is in the past, with one object in
  each of the four buckets (the `assets` one two folders deep), rows in `sites`, `site_snapshots`,
  `projects`, `assets`, `notifications`, a suggestion carrying an approved image and a vote on another
  user's suggestion, when `GET /api/cron/purge-accounts` runs with the bearer, then the response is 200
  `{ purged: 1, failed: 0 }`, `GET /auth/v1/admin/users/{A}` answers 404, every one of A's rows is gone
  from every table above, every prefix of A's lists empty in every bucket, A's suggestion row remains
  with `user_id` null, `anonymized_at` set, `image_path` null and `image_approved` false, and the other
  user's `vote_count` has decreased by one
- Given the same request with no `Authorization` header, then with a wrong bearer, when each runs
  before the one above, then each answers 401 and A's user, rows and objects are all still there (the
  control)
- Given B pending but not due and C never deleted, when the purge runs, then B's profile still carries
  its window and its object, and C's user, suggestion and objects are untouched
- Given the purge already ran, when it runs again, then 200 `{ purged: 0, failed: 0 }` and nothing
  changes
- Given `vercel.json` and the route's path constant, when `purge.test.ts` runs, then the one `crons`
  entry names that path and runs once a day; and when the route or either module imports `lib/email`,
  then a test fails
- Given the deployed commit, when Vercel's own schedule (or `vercel crons` on demand) invokes the route,
  then the runtime log for `/api/cron/purge-accounts` shows the `vercel-cron/1.0` request answered 200
  — the mechanism executed, not assumed
- Given `pnpm check`, `pnpm build` and `doc-audit --check`, then all green, and `next build` lists
  `/api/cron/purge-accounts` as `ƒ`

## Spec Change Log

## Design Notes

**Routine calls made here, not the owner's** (each one line). *Once a day, at 03:15 UTC:* a fourteen-day
window gains nothing from an hourly sweep, a daily expression deploys on every Vercel plan, and a
quarter past the hour avoids the on-the-hour crowd; the ±59-minute Hobby imprecision would still be
inside the promise. *A prefix walk, not the rows' pointers:* "everything of mine actually gone" is a
statement about the buckets, and a pointer describes only the objects whose row insert succeeded; the
walk is complete by construction and the pointer stays what it is, the download route's. *`list-v2`,
not a recursive `list()`:* the installed client carries it, it lists a prefix flat with full keys and a
cursor, and the v1 call returns folders as rows with `id: null` and names relative to the folder — two
ways for a walker to lie; the v1 recursion is the documented fallback, not the design. *GoTrue's admin
delete, not SQL:* it is the one documented way to remove a user, the client is already in the app, the
Postgres cascade fires under any deleter, and a definer function would be a migration for a job the
service role already can do. *Anonymise before the user, not after:* `on delete set null` would null
`user_id` anyway, but nothing would stamp `anonymized_at` or drop the image, and the order is the whole
promise. *500 on any failure:* Vercel neither retries nor alerts, so the red log line is the alarm; a
200 that hides a failed account is a purge that quietly became retention. *`BATCH = 25`:* the run has
300 seconds and a solo-founder product's daily deletions are counted in ones; the guard is against a
pathological day, not a normal one. *No lock:* an overlapping run meets empty listings, an idempotent
update and a 404 — marked `ponytail:` in the route. *The harness on `inflozo.com`:* the apex passes any
non-`/app` path through, so the production domain reaches the handler without a Vercel API lookup for
the generated URL, and Standard Protection would restrict that URL but not this one.

**What is a hypothesis until executed** (standing rule 1). That the hosted storage-api serves `POST
/object/list-v2/{bucket}` flat, with full keys and a cursor — `--check` executes it in every bucket
before the walker is trusted. That the service role's `remove()` deletes in the two policy-less
buckets and in `assets` and `suggestion-images` alike (2.5 proved put, list and delete in
`site-snapshots` only). That `DELETE /admin/users/{id}` cascades `public.*` through the schema's
foreign keys — every table of A's empty afterwards is the proof, and `sync_vote_count` firing during
the cascade is read off C's `vote_count`. That Vercel sends the bearer and invokes the generated
production URL where `route()` passes through — the Deploy run's log line. That
`inflozo.com/api/cron/purge-accounts` reaches the same handler — the Dev run's first curl against the
deployed commit, expecting 401. Each lands under `## Verification`; the first that fails is an **Ask
First** only where the Boundaries say so, and a documented fallback otherwise.

**What this story leaves in the ledger, and why not here.** DW-44: `private.site_credentials` carries
`vault.secrets` ids (`:184-185`) and the cascade removes the row, not the secret — nothing writes Vault
until Story 3.1, and a `before delete` trigger on that table is the one home that serves the purge,
disconnect and every later path alike, so 3.1 owns it. DW-45: `entitlements.restored_by` (`:590`) is
the only `references auth.users(id)` without a cascade, so purging the account named there — the
owner's own admin account, in practice — is refused by Postgres; E12 writes that column first and
decides `on delete set null` then. DW-46: a failed purge is a red line in Vercel's cron log and nothing
else until NFR-9's Sentry lands; the 500 is what makes the line red.

`// ponytail: BATCH = 25 and no lock; a claim column and a bigger batch the day a purge run is observed
to overlap or overflow` · `// ponytail: one walker over listV2; the v1 recursion only if list-v2 is
withdrawn`

## Verification

Run on the real infrastructure (R-82). Every key is read into a command's environment by name and
never printed; each is recorded by its variable name only. **The Dev run fills every result.**

**Commands:**
- `export PATH=…/node/v24.18.1/bin:$PATH && pnpm check` (repository root) -- expected: exit 0;
  `purge.test.ts`'s cases among the green, `server-wiring`'s allowlist test naming three readers
- `pnpm build` -- expected: exit 0; `/api/cron/purge-accounts` listed as `ƒ`
- `python3 tools/doc-audit.py --check` (twice — the new tool's row) -- expected: PASS, 0 warnings
- `GET https://api.vercel.com/v9/projects/{VERCEL_PROJECT}/env` with `VERCEL_TOKEN`, `VERCEL_TEAM_ID`
  -- expected: names only; no `CRON_SECRET` before, `CRON_SECRET` (`production`, `encrypted`) after the
  `POST /v10/projects/{VERCEL_PROJECT}/env` that adds it (HTTP 201)
- `python3 tools/probe/run-verify-account-purge.py --check` -- expected: exit 0; keys present; one admin
  create-read-delete; put → `list-v2` → delete in each of `assets`, `deploy-artifacts`,
  `site-snapshots`, `suggestion-images`; users before == after
- `curl -si https://inflozo.com/api/cron/purge-accounts` (against the deployed commit) -- expected:
  `401`, `cache-control: no-store` — the door exists, is shut, and is not cached
- `python3 tools/probe/run-verify-account-purge.py` (Review and Deploy runs, against the deployed
  commit) -- expected: every step PASS in the order the Always lists them; users before == after
- Deploy run: `vercel crons ls` (or the project's Cron Jobs settings) -- expected: the one job,
  `/api/cron/purge-accounts`, `15 3 * * *`; then one invocation — on demand, or the next 03:15 UTC —
  in the runtime logs filtered to that path, user agent `vercel-cron/1.0`, status 200

**Manual checks (if no CLI):**
- The Vercel dashboard's Cron Jobs page lists the job against the deployed commit, and its View Logs
  shows the invocation above. No owner's test: `owner_test: none` — a background job with no screen.
