---
title: 'Story 2.6 — The purge, the cascade and the anonymisation'
type: 'feature'
created: '2026-09-07'
status: 'done'
review_loop_iteration: 1
baseline_commit: '868c19644344434056b7236fc8f499370e061bd2'
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
- [x] `app/api/cron/purge-accounts/purge-rule.ts` + `lib/storage-drain.ts` + `apps/web/purge.test.ts`
      -- the secret compare, the four prefixes, the walker, and the source-reading tests, all green
      before the route exists -- the contract before anything reads it
- [x] `tools/probe/run-verify-account-purge.py --check` + its `doc-audit.py` row -- put → `list-v2` →
      delete in each of the four buckets on the live project -- the `list-v2` hypothesis executed
      before the walker is trusted; a 404 here means the v1 `list()` recursion the walker's header
      describes, and the Spec Change Log says so
- [x] `app/api/cron/purge-accounts/route.ts` + `server-wiring.test.ts` + `lib/supabase/server.ts` --
      the route, and the third reader named where the second was -- FR-A5's purge
- [x] `apps/web/vercel.json` -- the one `crons` entry -- AD-33's schedule beside its home
- [x] `tools/probe/.env.example` + Vercel production env + `tools/probe/.env` -- `CRON_SECRET` by name
      in all three -- the door has a key before the door is deployed -- **all three, 2026-09-07.** The
      API write was refused by this machine's sandbox twice, so the owner added it in the Vercel
      dashboard (Question 1, ruled): read back by name as `CRON_SECRET`, target `production`, type
      `sensitive` — the dashboard's default, which is stricter than the API's `encrypted` in that the
      value cannot be read back at all
- [x] `tools/probe/run-verify-account-purge.py` (the full run) -- against the deployed commit, controls
      first -- R-82, re-runnable, the epic's exit -- **the Review run's, executed 2026-09-07** against the
      deployed Dev commit with the patched harness and again against the deployed Review commit
      `1489654f`, every step PASS both times (`## Verification`); the Deploy run runs it once more
      against its own deployment
- [x] `deferred-work.md` + `epic-2-context.md` -- DW-44, DW-45, DW-46 and the Create line, landed at
      Create -- propagate, never localise
- [x] Run `## Verification` on the real infrastructure and record every command and result by variable
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

### Review Findings

*Review run 2026-09-07, five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor,
Real-infra verifier). Every claim held on the real infrastructure; 19 patches applied, 1 deferred to the
ledger, 10 dismissed as noise, no decision for the owner.*

- [x] [Review][Patch] The "each account is its own try" assertion was inert — a missing match returned
      -1 and still passed — and the loop ran under no executing test [apps/web/purge.test.ts:183] — the
      loop is now `runPurge(deps, due)` in `purge-rule.ts`, pure over a four-method `PurgeDeps`, with
      four executing tests: the order inside one account, one failure never stopping the rest, a refused
      drain leaving the rows alone and naming its bucket, nothing due
- [x] [Review][Patch] Every harness run left two suggestion rows on the live ideas board — six orphans
      were found [tools/probe/run-verify-account-purge.py, `finally`] — deleted by id in `finally`, and any
      stale one swept by body text at the start and after cleanup; the six were swept on the first patched run
- [x] [Review][Patch] `--check` seeded the whole fixture and a DUE account on the live project, while its
      docstring, `--help` and catalogue row called it plumbing alone [harness] — `--check` now creates one
      user and seeds nothing the route would purge
- [x] [Review][Patch] C's `vote_count` was asserted to have been 1 without a read [harness `rows-gone`] —
      `seeded` reads it and requires 1
- [x] [Review][Patch] The 401 controls could not tell the route's 401 from a platform's [harness
      `no-header`, `wrong-secret`] — body `Unauthorized` and `x-matched-path` naming the route required
- [x] [Review][Patch] `objects-gone` read an errored listing as an empty one, and only `assets` had a
      positive control [harness] — HTTP 200 required per bucket; `seeded` lists all four of A's prefixes
      and requires exactly one object in each; the bucket set is checked against the app's
- [x] [Review][Patch] The stranger check looked at now only [harness `seeded`] — fifteen minutes ahead,
      so a real deadline passing mid-run stops the run
- [x] [Review][Patch] `call_route` followed redirects with the bearer [harness] — redirects disabled; a
      3xx is a FAIL
- [x] [Review][Patch] The `--check` probe keys were never registered for cleanup [harness] — every key
      is registered before its put
- [x] [Review][Patch] `buckets()` matched any quoted lowercase string with a trailing comment and
      accepted three or more [harness] — reads the `USER_BUCKETS` block; exactly three plus one
- [x] [Review][Patch] The cascade table list was restated, not derived [harness `rows-gone`] — read out of
      `supabase/migrations/*.sql` in order with drops honoured: 26 columns derived, 25 tables read with A
      in none; `edit_locks` answers 403 to the service role by design (the schema grants that role the
      server-written tables only, `:1160`) and is printed as unprovable, never hidden
- [x] [Review][Patch] The `secret` step was printed under `--check` only [harness] — both modes
- [x] [Review][Patch] An empty id would make a prefix `/`, and `/` is the whole bucket
      [apps/web/lib/storage-drain.ts] — refused before anything is listed; tested for `''`, `/`, `//`
- [x] [Review][Patch] The "nothing sends mail" regex saw only a path ending in `email`
      [apps/web/purge.test.ts] — any import or require whose specifier mentions `mail` or `resend`
- [x] [Review][Patch] Nothing proved `CRON_PATH` is where `route.ts` sits [apps/web/purge.test.ts] —
      `existsSync(join('app', CRON_PATH, 'route.ts'))`
- [x] [Review][Patch] `no-store` was proven on the 401 only [harness `purge`] — checked on the 200 too
- [x] [Review][Patch] Three comments: "a million objects" is a hundred thousand
      [apps/web/lib/storage-drain.ts], "300 seconds" was uncited [purge-rule.ts], the route header did
      not name Story 2.6 [route.ts]
- [x] [Review][Patch] `.env.example` said "put the SAME value here", and its one-liner printed the secret
      onto the screen — the event that forced a rotation in the Dev run [tools/probe/.env.example] —
      generate straight into the gitignored file; the template never carries a value
- [x] [Review][Patch] The record: the bare-curl 401 was attributed to the unset-secret branch, the
      full-run task said the route was not deployed, two Verification rows read NOT RUN though the
      review could execute them, the redeploy hypothesis had its evidence, and "the logged line is
      unchanged" was wrong [this spec] — corrected in `## Verification` and the Spec Change Log
- [x] [Review][Defer] BATCH permanently failing accounts would starve every account behind them
      [apps/web/app/api/cron/purge-accounts/route.ts] — deferred, **DW-47**: the frozen approach retries
      tomorrow with no claim column; the fix is a migration the Ask First reserves

## Spec Change Log

- **The `list-v2` hypothesis HELD, so there is no fallback to record** (Dev, 2026-09-07). `--check`
  put an object two folders deep under a harness prefix in each of the four buckets and listed it:
  `POST /object/list-v2/{bucket}` answered HTTP 200 with `objects[0].name` = the **full key**
  (`purge-check-<stamp>/deep/probe.bin`) — flat, not a basename and not a folder row — in `assets`,
  `site-snapshots`, `suggestion-images` and `deploy-artifacts` alike, and the service role's `remove`
  emptied each prefix. `lib/storage-drain.ts` removes `objects[].name` on that evidence; the v1
  `list()` recursion its header describes stays a documented fallback and was not needed.
- **The walker cannot name its own bucket, so the route names it** (Dev). The Code Map has
  `drainPrefix` throw `{ step: 'objects', bucket, prefix, code }`, but its `bucket` argument is a
  handle of two methods (`{ listV2, remove }`) and storage-js keeps `bucketId` `protected`. The
  walker therefore throws `{ step, prefix, code }` and the route's drain loop — which has the name
  from `prefixesFor` — attaches `bucket` before rethrowing. The logged line is unchanged.
- **One test beyond the Code Map's list** (Dev, after the matrix audit). Three matrix rows — more
  than `BATCH` due, `deleteUser` fails, Storage refuses a removal — turn on promises only the route's
  source makes, and no unit test can reach the route. `purge.test.ts` reads them out of it in
  `server-wiring.test.ts`'s idiom: `.order('purge_after')`, `.limit(BATCH)`, `status: failed ? 500 :
  200`, the `try` opening INSIDE the loop, and the log line keyed by `userId`.
- **The Dev run's curl executed the pass-through, not the 401** (Dev). The route is not on the
  deployed commit, so `https://inflozo.com/api/cron/purge-accounts` answers 404 — but it is the
  apex's OWN Next app answering, with the app's CSP header, while the control
  `https://inflozo.com/app/account` is a 308 to `app.inflozo.com`. That is `routing.ts`'s
  pass-through claim executed. The 401 is the Deploy run's, and `## Verification` says so.
- **`CRON_SECRET` did not reach Vercel `production`** (Dev). See Question 1, and its ruling: the
  owner adds it in the dashboard from the value in `tools/probe/.env`. Until he does, the deployed
  route answers 401 to Vercel's own cron — fail-closed, so nothing breaks and nothing purges.
- **The Dev push deployed the route** (Dev). CI's `deploy` job ran on the Dev commit, so
  `/api/cron/purge-accounts` is live and answering 401 ahead of this story's Deploy phase.
- **HYPOTHESIS, NOT YET EXECUTED (standing rule 1): whether a deployment already built can see an
  environment variable added afterwards.** Vercel's documentation says variables are applied to a
  deployment at build time and a change needs a redeploy; this run asserted that in an earlier
  draft and has now demoted it, because it was never executed here — the one call that would settle
  it was refused by the sandbox. It costs nothing either way: the Deploy run redeploys, which is
  the state the Deploy verification describes, and the Review run's harness reports a 401 on its
  `purge` step if the claim is true and the redeploy has not happened yet.
- **SETTLED FOR PRODUCTION, BY TIMING** (Review, 2026-09-07). `CRON_SECRET`'s `updatedAt` in Vercel
  is 13:51:11Z; the deployment serving `inflozo.com` was created 13:56:53Z — the Dev push, which CI
  built with `vercel pull --environment=production` after the owner's change — and the bearer call
  answered **200 `{ purged: 0, failed: 0 }`** with `cache-control: no-store`. The narrower claim
  ("a deployment built BEFORE the variable sees it") was never executed and no longer matters here:
  every later push rebuilds with the variable present. The same 200 is the runtime reading a
  **`sensitive`** variable, so that claim is executed too.
- **The bare `curl -si` 401 was attributed to the wrong branch** (Review). A call with no
  `Authorization` header is `authorized()`'s `!header` branch whatever the secret is; the
  unset-secret branch's evidence is the unit test, and the production 401s are the harness's two
  controls — no header, wrong bearer — each with body `Unauthorized` and `x-matched-path` naming the
  route, so a 401 from anything in front of the route cannot pass for them.
- **The cascade HELD, and `sync_vote_count` fired inside it** (Review). `rows-gone` reads every
  public table whose column `references auth.users(id) on delete cascade` — derived from the applied
  migrations, drops honoured — and found A in none of the 25 the service role can read; C's
  `vote_count` went from 1 (read after the vote was seeded) to 0. `edit_locks` is the 26th and answers
  403 to the service role: the schema grants that role the server-written tables only (`:1160`), the
  edit lock is the client's, and the cascade is Postgres's and needs no grant — the harness names it
  unprovable rather than hiding it.
- **The loop is pure, and executed** (Review). "Each account is its own try" was asserted by reading
  the route's source, and the assertion could not fail: `indexOf` of a missing `try {` is -1, which is
  less than any index. The loop is now `runPurge(deps, due)` in `purge-rule.ts` over a four-method
  `PurgeDeps` (`projectIds`, `drain`, `anonymise`, `deleteUser`) that the route builds from
  `supabaseAdmin()`; `purge.test.ts` drives it with a stub whose second of three accounts is refused
  and asserts `{ purged: 2, failed: 1 }` with the third reached. The route keeps the due query, the
  deps and the response; nothing on the wire changed (the patched harness passed every step against
  the deployed Dev commit before the review commit was pushed).
- **`drainPrefix` refuses an empty prefix** (Review). An empty id would make `prefixesFor` emit `/`,
  and `listV2({ prefix: '/' })` is every user's objects; the guard lives in the one walker every
  purge routes through. Ids come from uuid columns and cannot be empty; the guard is against the day
  a caller passes something else.
- **"The logged line is unchanged" was wrong** (Review): the catch adds `bucket` to it, which is the
  point of attaching the name. Nothing else about the line moved.
- **DW-47** (Review): BATCH permanently failing accounts at the head of the oldest-first queue would
  starve every account behind them, and today that is a red log line (DW-46) and nothing else. The
  frozen approach — reconciliation, no claim column, "still due tomorrow" — is right for the
  one-off failures the matrix names; the fix is a migration the Ask First reserves.

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

## Questions for the owner

### Question 1 — the cron's password could not be put into Vercel from here

**What this is about.** The daily purge job is started by Vercel itself, once a day. To prove the
request really came from Vercel and not from a stranger, Vercel sends a password with it — a single
long random word called `CRON_SECRET`. The job refuses to run without it, on purpose: if the password
is missing, the door stays shut rather than standing open.

I generated that password and saved it in the two places on this machine that need it. The third
place is your Vercel project, and **this machine's safety sandbox refused to let me write to Vercel**
— it blocks changes to live production settings. I tried twice and stopped rather than working around
it.

**Why it matters.** Until the password is in Vercel, the job will be deployed but will never actually
run: Vercel will call it without a password and the job will politely refuse. Nothing breaks; the
purge simply never happens.

**An example of what needs to happen.** In Vercel: your project → **Settings** → **Environment
Variables** → **Add New**. Name: `CRON_SECRET`. Value: the long random word I generated. Environment:
**Production** only. Save. That is the whole change — one row in a settings table.

**Your options:**

1. **I do it, once you allow it (RECOMMENDED).** Reply "allow the Vercel write" and I will run the
   one command that adds it, then read the variable back by name to prove it is there. It is one API
   call and it adds a single row. The value never appears in any file that is committed, and I never
   print it.
2. **You do it in the Vercel dashboard.** I will paste the exact value into this chat for you to copy.
   Slower, and it means the password passes through the chat window.
3. **Skip it and let the job stay switched off.** The story deploys, the daily job appears in Vercel's
   list, and it refuses every invocation. Accounts that ask to be deleted are never actually removed,
   which is the thing FR-A5 forbids — so this is only sensible if you want to hold the story back.

*(Option 1 keeps the password out of the chat entirely, which is why it is recommended.)*

**Ruled (owner, 2026-09-07): option 2, with a condition — he adds it in the Vercel dashboard
himself, and the value is copied out of `tools/probe/.env` rather than pasted into the chat.** The
file carries the copy instruction in a box directly above the line. The value was rotated once
before he copied it, after a `sed` in the Dev run printed the first one to the session transcript;
that first value never left this machine — the Vercel write it was generated for is the one the
sandbox refused — so nothing anywhere needs updating, and the line in `tools/probe/.env` is the
only value that has ever existed as far as any service is concerned.

## Verification

Run on the real infrastructure (R-82). Every key is read into a command's environment by name and
never printed; each is recorded by its variable name only. **The Dev run's results are below.**

**Deployment: `https://inflozo.com`** — Vercel deployment `dpl_JCUWqg6gQR53pioMfD9nWdf2uS1S`, commit
`216b7903` (HEAD, the last Story 2.6 commit; no app code changed since the `1489654f` Review commit
already verified above), `readyState: READY`, `target: production`, aliases `inflozo.com`,
`app.inflozo.com`, `www.inflozo.com`; the deployment's own `crons` field reads `[{ path:
/api/cron/purge-accounts, schedule: 15 3 * * * }]` — read via `GET /v13/deployments/{uid}` with
`VERCEL_TOKEN`, `VERCEL_TEAM_ID`.

**Commands:**

*Run 2026-09-07 on commit `868c1964` + this working tree. Every key by variable name; no value printed.*

| Command | Expected | **What it returned** |
|---|---|---|
| `export PATH=…/node/v24.18.1/bin:$PATH && pnpm check` (repository root) | exit 0 | **exit 0.** `apps/web` 166 tests, 166 pass, 0 fail — `purge.test.ts`'s ten among them; `server-wiring.test.ts`'s allowlist test green with three readers (`lib/flags.ts`, the snapshot download route, `app/api/cron/purge-accounts/route.ts`) |
| `pnpm build` | exit 0; `/api/cron/purge-accounts` listed as `ƒ` | **exit 0.** Next 16.3.1, compiled, TypeScript finished; the route table lists `ƒ /api/cron/purge-accounts` |
| `python3 tools/doc-audit.py --check` (twice) | PASS, 0 warnings | first run **FAIL** on the two generated artifacts (expected — the new tool's catalogue row); after `python3 tools/story-board.py`, **`documentation gate: PASS (0 warning(s))`, exit 0**, twice |
| `GET https://api.vercel.com/v9/projects/{VERCEL_PROJECT}/env` with `VERCEL_TOKEN`, `VERCEL_TEAM_ID` | names only; no `CRON_SECRET` before | **HTTP 200**, seven variables by name — `RESEND_FROM`, `RESEND_API_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `ENABLE_EXPERIMENTAL_COREPACK`, `DODO_WEBHOOK_SECRET`, `SUPABASE_SECRET_KEY`, `SUPABASE_URL`. **No `CRON_SECRET`** |
| `POST https://api.vercel.com/v10/projects/{VERCEL_PROJECT}/env` `{ key: 'CRON_SECRET', type: 'encrypted', target: ['production'] }` | HTTP 201, then the name reads back | **NOT RUN — refused by this machine's sandbox classifier, twice** (inline and as a script file). No workaround attempted. **The owner added it in the dashboard instead** (Question 1, ruled) |
| `GET https://api.vercel.com/v9/projects/{VERCEL_PROJECT}/env` again, after the owner's change | `CRON_SECRET` present, `production` | **HTTP 200** — eight variables now, `CRON_SECRET` among them: target `['production']`, type **`sensitive`** (the dashboard's default; unlike `encrypted` its value cannot be read back through the API at all, which is stricter and changes nothing about how the runtime receives it) |
| `GET /rest/v1/profiles?deleted_at=not.is.null` with `SUPABASE_SECRET_KEY`, before touching the bearer | the safety precondition the harness re-checks | **HTTP 200, zero rows.** No account on the live project is pending, so none is due; the Review run's harness seeds its own and refuses to fire if it finds a stranger |
| `curl -H "Authorization: Bearer $CRON_SECRET" https://inflozo.com/api/cron/purge-accounts` | 200 `{ purged: 0, failed: 0 }` if the running deployment can see a variable added after it was built | Dev run: **NOT RUN** (sandbox). **Review run: HTTP 200 `{"purged":0,"failed":0}`, `cache-control: no-store`** — the serving deployment was built after the variable was added (Spec Change Log). **Never by hand from now on:** outside the harness this call has no stranger-refusal control and would purge any real due account; the harness makes it, controls first |
| `python3 tools/probe/run-verify-account-purge.py --check` | exit 0; keys present; one admin create-read-delete; put → `list-v2` → delete in each of the four buckets; users before == after | **exit 0, all steps passed.** `users before: 5` → `users after: 5`. `PASS secret` · `PASS admin-round-trip: create, read back -> HTTP 200` · `PASS list-v2 assets` · `PASS list-v2 site-snapshots` · `PASS list-v2 suggestion-images` · `PASS list-v2 deploy-artifacts` — each `put -> HTTP 200; list-v2 -> HTTP 200 ['purge-check-<stamp>/deep/probe.bin']; delete -> HTTP 200; the prefix now lists 0` |
| `curl -si https://inflozo.com/api/cron/purge-accounts` | `401`, `cache-control: no-store` | **run twice.** Before the Dev push: **HTTP 404** — but the apex's own Next app answering, with the app's `content-security-policy` header, while the control `curl -si https://inflozo.com/app/account` is **HTTP 308** to `https://app.inflozo.com/account`; that is `routing.ts`'s pass-through executed. After the Dev push, which CI deployed: **HTTP/2 401**, `cache-control: no-store`, `x-matched-path: /api/cron/purge-accounts`. The door exists, is shut and is not cached. *(Review correction: a call with no header is the `!header` branch whatever the secret is — this row never executed the unset-secret branch, whose evidence is the unit test; the harness's two controls are the production 401s.)* |
| `python3 tools/probe/run-verify-account-purge.py` (full) | every step PASS in the Always's order; users before == after | Dev run: nothing deployed to call. **Review run: every step PASS, three times — the unpatched harness against the deployed Dev commit `61fa12d9` (the verifier's run), the patched harness against the same deployment, then the patched harness against the deployed Review commit `1489654f` (both below)**. **Deploy run: every step PASS a fourth time, against the deployed commit `216b7903` above (below)** |
| Deploy run: `vercel crons ls`, then one invocation in the runtime logs | the one job, `/api/cron/purge-accounts`, `15 3 * * *`; `vercel-cron/1.0`, status 200 | **`vercel` CLI not installed in this environment; no workaround attempted.** Confirmed instead via `GET /v13/deployments/{uid}` (above): the serving deployment's own `crons` field carries the one entry. **HYPOTHESIS, NOT YET EXECUTED (standing rule 1):** the schedule's next firing is 2026-09-08 03:15 UTC — no `vercel-cron/1.0` invocation exists yet to read from the runtime log, and none is asserted here. The owner can see it appear on the Vercel dashboard's Cron Jobs → View Logs page after that time, or trigger it on demand from there sooner |

**Review run, 2026-09-07, on the deployed Dev commit `61fa12d9` (Vercel deployment `READY`, aliases
`inflozo.com` and `app.inflozo.com`, its `crons` reading `[{ path: /api/cron/purge-accounts, schedule:
15 3 * * * }]`, plan `pro`).** Every key by variable name; no value printed.

| Command | **What it returned** |
|---|---|
| `export PATH=…/node/v24.18.1/bin:$PATH && pnpm check` (root), after the patches | **exit 0**; `apps/web` all tests pass, `purge.test.ts`'s fifteen among them (four of them execute `runPurge`) |
| `pnpm build` (`apps/web`) | **exit 0**; `ƒ /api/cron/purge-accounts` |
| `GET /v9/projects/{VERCEL_PROJECT}/env` with `VERCEL_TOKEN`, `VERCEL_TEAM_ID` | eight names; `CRON_SECRET` target `production`, type `sensitive`, `updatedAt` 13:51:11Z |
| `GET /v6/deployments?projectId=…` | the serving deployment `createdAt` 13:56:53Z, sha `61fa12d9`, `READY` — built after the variable |
| `curl -si https://inflozo.com/api/cron/purge-accounts` · the same with `Bearer not-the-secret-but-the-same-shape` | **401** each, body `Unauthorized`, `cache-control: no-store`, `x-matched-path: /api/cron/purge-accounts` |
| `env $(grep '^CRON_SECRET=' tools/probe/.env \| xargs) sh -c 'curl … -H "Authorization: Bearer $CRON_SECRET" …'` | **200 `{"purged":0,"failed":0}`**, `no-store` (zero accounts pending, read first) |
| `GET /rest/v1/edit_locks?select=user_id&limit=1` with `SUPABASE_SECRET_KEY` | **403** — the one cascade table the service role cannot read (by design, schema `:1160`); `deploy_jobs` 200 |
| `python3 tools/probe/run-verify-account-purge.py --check` (patched) | **exit 0.** `PASS secret` · `swept 6 stale purge-harness suggestion row(s)` · `users before: 5` · one user created · `PASS admin-round-trip` · `PASS list-v2` in `assets`, `site-snapshots`, `suggestion-images`, `deploy-artifacts` (put 200 → list-v2 200 `['purge-check-<stamp>/deep/probe.bin']` → delete 200 → the prefix lists 0) · `users after: 5` |
| `python3 tools/probe/run-verify-account-purge.py` (patched, full) | **exit 0, every step PASS:** `secret` · `users before: 5` · A, B, C created · 6 objects across 4 buckets · `seeded: the route would purge 1 account(s) within 15 min, exactly A; A's prefixes list {assets 1, site-snapshots 1, suggestion-images 1, deploy-artifacts 1} (HTTP [200]); C's vote_count is 1` · `no-header: 401 'Unauthorized', x-matched-path '/api/cron/purge-accounts', cache-control 'no-store'; A still there` · `wrong-secret: 401 'Unauthorized' …; A still there` · `purge: 200 {"purged": 1, "failed": 0}, cache-control 'no-store'` · `user-gone: 404` · `rows-gone: 25 cascade tables read, A left in none` (vote_count 1 → 0; `edit_locks` unprovable) · `objects-gone: every prefix of A's [] (HTTP [200])` · `anonymised: {"user_id": null, "anonymized_at": "2026-09-07T14:15:09…", "image_path": null, "image_approved": false}` · `others-untouched: B keeps its window and 1 object; C 200, 1 object, suggestion still C's` · `idempotent: 200 {"purged": 0, "failed": 0}` · `users after: 5` |
| `python3 tools/probe/run-verify-account-purge.py` (full) **again, against the deployed Review commit `1489654f`** — CI's `deploy` ran on the review push; `GET /v13/deployments/{uid}` read `READY`, aliases `inflozo.com`, `app.inflozo.com`, `www.inflozo.com`, `crons [{ /api/cron/purge-accounts, 15 3 * * * }]` | **exit 0, every step PASS** in the same order, `users before: 5` → `users after: 5`; `rows-gone: 25 cascade tables read, A left in none; C's vote_count is 0 (it was 1); unprovable under the service role (no grant, schema :1160): ['edit_locks']`; `anonymised: {"user_id": null, "anonymized_at": "2026-09-07T14:22:04…", "image_path": null, "image_approved": false}` |

**What was executed against the real services, and what it proved.** Supabase (`SUPABASE_URL`,
`SUPABASE_SECRET_KEY`): three GoTrue admin users created and deleted with the count balanced; rows
seeded and read back in `sites`, `projects`, `site_snapshots`, `assets`, `notifications`,
`suggestions` and `suggestion_votes`; `profiles` PATCHed on `deleted_at`/`purge_after`, which
executes that `freeze_columns` binds neither column; and **`POST /object/list-v2/{bucket}` in all
four buckets** — the story's central hypothesis — answering flat, full keys. Vercel (`VERCEL_TOKEN`,
`VERCEL_TEAM_ID`, `VERCEL_PROJECT`): the environment read by name; the write refused (Question 1).
`inflozo.com`: the apex's pass-through, with its `/app` control. Resend, Dodo and the Ghost servers
T1/T3: **not touched, deliberately** — this story sends nothing (FR-A5, FR-P2) and compiles nothing.

**Deploy run, 2026-09-07, on the deployed commit `216b7903` (Vercel deployment `dpl_JCUWqg6gQR53pioMfD9nWdf2uS1S`,
`READY`, aliases `inflozo.com`, `app.inflozo.com`, `www.inflozo.com`, `target: production`).** Every
key by variable name; no value printed.

| Command | **What it returned** |
|---|---|
| CI run for commit `216b7903` (`gh run list --branch main`, `GITHUB_TOKEN`) | `completed`, `success` — `check` and `rls` both green, so `deploy` ran |
| `GET /v6/deployments?projectId={VERCEL_PROJECT}&teamId={VERCEL_TEAM_ID}` with `VERCEL_TOKEN` | the serving deployment for `216b7903` is `dpl_JCUWqg6gQR53pioMfD9nWdf2uS1S`, `readyState: READY` |
| `GET /v13/deployments/{uid}?teamId={VERCEL_TEAM_ID}` | `readyState READY`; `alias` includes `inflozo.com`, `app.inflozo.com`; `crons [{ path: /api/cron/purge-accounts, schedule: 15 3 * * * }]`; `target production` |
| `python3 tools/probe/run-verify-account-purge.py` (full, patched, against `https://inflozo.com`) with `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `CRON_SECRET` | **exit 0, every step PASS:** `secret` · `users before: 5` · A, B, C created · 6 objects across 4 buckets · `seeded: the route would purge 1 account(s) within 15 min, exactly A; A's prefixes list {assets 1, site-snapshots 1, suggestion-images 1, deploy-artifacts 1} (HTTP [200]); C's vote_count is 1` · `no-header: 401 'Unauthorized', x-matched-path '/api/cron/purge-accounts', cache-control 'no-store'; A still there` · `wrong-secret: 401 'Unauthorized' …; A still there` · `purge: 200 {"purged": 1, "failed": 0}, cache-control 'no-store'` · `user-gone: 404` · `rows-gone: 25 cascade tables read, A left in none` (C's `vote_count` 1 → 0; `edit_locks` unprovable) · `objects-gone: every prefix of A's [] (HTTP [200])` · `anonymised: {"user_id": null, "anonymized_at": "2026-09-07T14:27:29…", "image_path": null, "image_approved": false}` · `others-untouched: B keeps its window and 1 object; C 200, 1 object, suggestion still C's` · `idempotent: 200 {"purged": 0, "failed": 0}` · `users after: 5` |

**Manual checks (if no CLI):**
- The Vercel dashboard's Cron Jobs page lists the job against the deployed commit, and its View Logs
  shows the invocation once the 2026-09-08 03:15 UTC schedule fires (or the owner triggers it on
  demand from that page). No owner's test: `owner_test: none` — a background job with no screen.
