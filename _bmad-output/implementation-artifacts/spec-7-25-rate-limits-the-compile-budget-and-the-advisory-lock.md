---
title: 'Story 7.25 — Rate limits, the compile budget and the advisory lock'
type: 'feature'
created: '2026-11-27'
status: 'done'
owner_test: none
review_loop_iteration: 1
baseline_commit: '6d2a6c7bd95b19721587ffd753dcca1634a27f59'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-24-theme-naming-frozen-per-site.md']
---

## In plain English

Inflozo now sends one theme at a time to each Ghost site. If two of your projects ship to it at once, the second waits up to
half a minute for the first to finish instead of the two colliding. The same holds for two Inflozo accounts connected to the
same Ghost, and for a Roll back, a Restore original or a site switch.

To stop a broken script or a misuse from running up costs, there are two limits. One Ghost site takes at most 10 deploys an hour.
One account runs at most 60 theme builds an hour, and every Run checks is one build. A customer who reaches a limit is told in one
sentence when they can go again, for example: "Inflozo ships to one site at most 10 times an hour. You can ship to
ghost6.inflozo.com again in 12 minutes."

There is no owner's test: nothing new is drawn, and the epic's card says none. Walk step 125 proves the story on production and T1.
The owner ruled the 60 on 2026-11-27 (Question 1, R-295), and at the Review that a Ship it which waited too long ends on the
failure screen and runs checks again (Question 2, R-296). No question is open.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nothing makes two writes to one Ghost wait for each other, and nothing counts deploys or compiles.
- **Ghost has no lock of its own.** Two uploads of one name at once answer `200` and a raw `500 EEXIST` (VERIFY 39,
  MEASUREMENTS §25f).
- **The races left open by earlier stories:**
  - two projects that pick the same free name in the same minutes. Since Story 7.24 this includes two accounts on one Ghost,
    where the second upload replaces the first's theme;
  - a switch that moves a site while a deploy to it is uploading (DW-379);
  - a ship that starts during a Roll back, and two Roll backs at once (`put-back.ts:121-127`);
  - a second Pre-flight running beside one still compiling (DW-373).
- **The limits:** FR-J11's 10 deploys an hour per site, and the per-account compile budget, exist only on paper.

**Approach:**
- **One lock, `withSiteLock`.** It is a Postgres transaction-scoped advisory lock:
  - keyed on the site's ADDRESS;
  - held on its own short-lived pooler connection;
  - waited for at most `LOCK_WAIT_MS`.

  Every path that changes what a Ghost serves takes it, and each holds it over the reads its decisions rest on: Ship it,
  Re-activate, History's Roll back and Re-activate, Restore original, and the site switch.
- **Two counts.** Each is one pure rule over one read:
  - Ship it is refused once the site record has had 10 uploads Ghost accepted in the last hour, unless the record is exempt;
  - Run checks is refused once the account has started `ACCOUNT_COMPILES_PER_HOUR` compiles in the last hour.
- **DW-373.** A new Pre-flight cancels one of the same project × site that is still running, as it already clears one resting at
  `awaiting_ship`.

**Frame (R-74): none — the card names none.** Nothing new is drawn:
- the two limit sentences and the switch's refusal appear in the refusal lines Story 7.18a built under Run checks, under Ship it
  and in the site picker, with the same components and tokens;
- a timed-out Ship it ends on S8d′ with `deploy_running`'s existing sentence;
- the wait itself shows as the pressed button's own busy state (R-98).

**The epic's criteria, word for word (R-195), and how this story meets each:**
- **Given** deploys and exports **When** the limit is applied **Then** deploys are rate-limited **10/hour per site** and are
  idempotent
  - **The limit:** `SITE_DEPLOYS_PER_HOUR`, at Ship it.
  - **Idempotent:**
    - one Ship it and one Re-activate per row (7.18a's claim, as built);
    - one Pre-flight per project × site (DW-373);
    - put-backs, restores and switches re-read inside the lock, so a second press finds the first one's result.
- **And** **the count is per-account over compiles, whatever they are called**, with the per-site deploy limit sitting inside it —
  because export runs **the same compile pipeline** and writes a row with a null `site_id`, so a per-site count would miss it
  entirely and an account could compile without limit by exporting
  - The budget counts `deploy_jobs` by `user_id`, whatever the site. Every Pre-flight is a row, and rows are never deleted.
  - The schema already says `site_id` is "null for FR-J12 export" (`complete_schema.sql:415`).
  - Story 7.26's card gains the line that its export runs on such a row and asks this budget first.
- **And** the per-account compile budget is **billing hygiene, not capacity**, sized against a measured number — one deploy costs
  $0.000427 — and sized to be invisible to every honest user
  - Question 1, ruled option 1 (owner, 2026-11-27, R-295): 60 an hour on every plan, which caps a runaway at about $18.45 a
    month per account at a full deploy's cost.
  - A refusal leaves a log line naming the account, so a runaway is visible.
- **And** **deploy + activate holds a per-site Postgres advisory lock**, so two projects targeting the same site **serialize
  rather than interleave** — theme activation is globally stateful and **a rate limit is not a mutex**
  - `withSiteLock`, held over Ship it's whole span (Design Notes).
- **And** a failed upload **never leaves a partially active theme**
  - As built:
    - Ghost's refusals leave the site untouched (VERIFY 39's four `422`s; MEASUREMENTS §91's fatal theme);
    - an upload accepted whose activation then fails is `uploaded` and not live (FR-J8).
  - The lock adds that no second upload or activation interleaves with either.
- **And** **the §4 test targets are exempt from the rate limit**, because a single DoD run is 30 serialized deploys which the limit
  alone would stretch past three hours before compile time.
  - `sites.deploy_rate_limit_exempt` is server-only (`rls.sql:216-224`). Only the per-site count reads it.
- **And** *(R-254, R-259)* the lock's span also covers `offerRoutes` … this story's Create settles how it is held
  - The routes step is inside Ship it's span.
  - The lock is held on its own connection, never on `db.ts`' pooled one (Design Notes).
- **And** *(7.18a's Review)* a Pre-flight never runs beside another of the same project to the same site (DW-373) — `start()`.
- **And** *(7.18b's Review)* a switch never moves a site while a deploy to it is uploading or activating (DW-379)
  - The switch takes the chosen site's lock.
- **And** *(7.23a, 7.23b)* the put-back and Restore original take the same per-site lock — they do, over their whole body.
- **And** *(7.24's Create)* key the lock on the site's address, or say why not
  - It is keyed on the address: `sites.url`, `normaliseSiteUrl`'s lowercased origin.
  - This is the same "one Ghost" as 7.24's `heldNamesIn`.

## Boundaries & Constraints

**Always:**
- **The lock: `withSiteLock(siteId, run)` in `server/site-lock.ts` (new)**, over a dedicated client from `db.ts`' new `lockSql()`.
  In one transaction, in this order:
  1. `select set_config('lock_timeout', '<LOCK_WAIT_MS>ms', true), set_config('statement_timeout', '<LOCK_WAIT_MS + 5000>ms',
     true), set_config('idle_in_transaction_session_timeout', '<STALLED_MS>ms', true)`;
  2. `select pg_advisory_xact_lock(hashtextextended('site:' || coalesce((select url from public.sites where id = $1), $1::text),
     0))`;
  3. `run()`;
  4. commit, with the client ended in `finally`.
  - `LOCK_WAIT_MS = 30_000`. `STALLED_MS` is `run.ts`' own. Both are named once.
  - **Not held:** SQLSTATE `55P03` or `57014` on step 2 answers `{ held: false }`, and `run` is never called.
  - **A throw from `run`:** rolled back and rethrown unchanged.
  - **A transaction that fails AFTER `run` returned** (the connection lost): logged `site-lock: the lock was lost`, and `run`'s
    value is returned. Finished work never becomes a failure.
  - The answer type `Locked<T> = { held: true; value: T } | { held: false }` lives in `lib/deploy.ts`.
- **Who takes it:**

  | Path | Keyed on | Inside the lock | Not held within `LOCK_WAIT_MS` |
  |---|---|---|---|
  | Ship it, `run.ts` `ship` | the job's site | everything after its first read, unchanged and in order: the cancel check, R-264 (a), the deploy read, DW-374's link re-read, the project read (7.24's held names), the stale re-make, the capture, the upload, the bind, the activation, the routes step | a claim off `awaiting_ship` to `failed` with `deploy_running`, and only if it moved the row, the deploy `failed`. A row another invocation moved (a double press) is left alone. Nothing is sent to Ghost |
  | Re-activate, `run.ts` `activate` | the job's site | everything after its first read | a claim off its stage to `failed` with `deploy_running`; the deploy stays `uploaded` (D2e, its Re-activate still offered) |
  | History's Roll back and Re-activate, `putBack` | the project's linked site, read once for the key | the whole body, unchanged (its reads run again inside) | `busy` |
  | Restore original, `restoreOriginal` | the same | the whole body | `busy` |
  | The switch, `switchWith` | the chosen site | the read, plan and write loop, after `holds()` | `{ refused: DEPLOY_WORDS.running }`, nothing written |

  Pre-flight, the check before a Roll back and every read take no lock.
  - A linked site of none runs the body unlocked; the body answers it as today.
- **The counts: pure rules in `lib/deploy.ts`.**
  - **The constants:** `SITE_DEPLOYS_PER_HOUR = 10` and `ACCOUNT_COMPILES_PER_HOUR = 60`. The 60 is Question 1's ruled value
    (R-295), and this is its one place.
  - **`overLimit(times, cap, now)`:**
    - it reads the timestamps within the last hour;
    - fewer than `cap` → null;
    - otherwise the minutes until the oldest counted one leaves the hour, rounded up, at least 1.
  - **Ship it: `siteLimit(a, io)` in `run.ts`.** The route's ship arm calls it after its existing refusals and before `after()`.
    - It counts the site record's `deploys.accepted_at` within the hour (`user_id`-scoped): every upload Ghost accepted, Roll
      backs included.
    - `sites.deploy_rate_limit_exempt` → never refused.
    - Over → 429 with `deployError('deploy_rate_limited', { host, minutes })`.
  - **Run checks: `compileBudget(a, io)` in `run.ts`.** The route's preflight arm calls it before `start`.
    - It counts the account's `deploy_jobs.started_at` within the hour, any site or none.
    - Over → 429 with `deployError('compile_budget', { minutes })`, and the log line `deploy: compile budget reached` with the
      user's id.
  - **Never refused by either:** Re-activate, History's Roll back and Re-activate, Restore original and Cancel. They compile
    nothing and they are the way back.
  - **Words, in `DEPLOY_WORDS` (R-170, R-283).** The numbers come from the constants; `1 minute`, otherwise `{n} minutes`.
    - `siteLimit(host, minutes)`: "Inflozo ships to one site at most 10 times an hour. You can ship to {host} again in {minutes}."
    - `budget(minutes)`: "Your account has built 60 themes in the last hour, the most Inflozo builds in an hour. You can run
      checks again in {minutes}."
  - **The route** answers each 429 with the envelope as JSON (AD-24). The wizard's `post` keeps a 429's `message`.
    `runChecks` and `press` say it in their refusal line (`setRefused` and `say`), as they say a 423 or a 422.
- **DW-373, in `start()`.** `jobs.resting` also returns the project × site's jobs still at `queued`, `compiling` or `checking`.
  - Those are flagged through `cancel()`, and clear themselves at their next edge, as after a Cancel.
  - The resting ones are cleared as today, then the new row is inserted.
  - A flagged job still counts in the budget, since it compiled.
- **`put-back.ts`' `moving` read stays.** It is the check's `busy`. Inside the lock it can only see a ship that was killed
  mid-span.

**Ask First:**
- **Every production and T1 write needs the owner's in-session go**, asked in R-83's shape, run in the main session, never by a
  subagent, and worded for the run's whole set. That covers:
  - the lock recorder on the production pooler (MEASUREMENTS §92);
  - walk step 125, with its seeded rows, the exempt flag and its cleanup.

**Never:**
- **A schema change.** There is no lock table, no counter table and no index, so there is no Schema phase. Each count's
  `ponytail:` names its ceiling: `deploy_jobs (user_id, started_at)` and `deploys (site_id, accepted_at)`.
- **The lock on `db.ts`' pooled `sql()` client.** With `max: 1`, a `begin` there waits on its own `call()` (`db.ts:23-28`).
- **A session-level `pg_advisory_lock`.** The transaction pooler keeps no session.
- **A wait longer than `LOCK_WAIT_MS`**, or a retry of a lock that timed out.
- **A lock taken by Pre-flight, by the check before a Roll back, or by any read.**
- **A per-plan budget.** R-295 rules one budget on every plan.
- **New UI:** no frame, no stage and no "waiting" line.
- **Counting `exports` rows.** Story 7.26's export runs on a `deploy_jobs` row.
- **Locking the site a switch leaves** (Design Notes).
- **A changed sentence for Ghost's `EEXIST`.** It stays `deploy_running`: it can now come only from outside Inflozo.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| One ship | nothing else on the Ghost | lock at once; the ship as today | N/A |
| Two ships, one Ghost, two accounts, one free name | X and Y both resolved `inflozo-lock-test` at Pre-flight; Ship it pressed in both within a second | the second waits; inside, its held-names read sees the first's binding, the artefact is stale, it is re-made as `-2` and shipped; nothing overwritten; no `taken`, no `EEXIST` | N/A |
| Wait runs out | the holder takes more than 30 s | the waiter's row is claimed off `awaiting_ship` to `failed` with `deploy_running` (S8d′), the deploy is `failed`, and nothing is sent | logged |
| Double press, holder slow | the same row's second invocation times out | its claim finds the row moved; the first invocation's ship is untouched | N/A |
| Re-activate waits it out | the lock is not held in 30 s | `failed` with `deploy_running`, the deploy stays `uploaded`, D2e's Re-activate is offered | N/A |
| Roll back during a ship | the same site, the ship in its span | the put-back waits, then runs on the site as the ship left it; past 30 s → `busy` | N/A |
| Two Roll backs at once | two tabs | serialized; the second re-reads, finds its version `live`, and answers `live-already` | N/A |
| Switch during a ship | the chosen site's ship in its span | the switch waits; past 30 s → the running sentence, nothing written. Inside, Ship it's link re-read sees a switch that came first and refuses `site_changed` | N/A |
| Holder dies mid-span | the invocation killed, the connection dropped | the lock is released (§92 H2); at the latest, the idle ceiling ends the session at `STALLED_MS` | `view()` fails the stalled job (as built) |
| Connection lost after the work | the commit fails | the work's outcome stands, and the loss is logged | N/A |
| Site limit, under | 9 accepted uploads in the hour | Ship it is accepted (202) | N/A |
| Site limit, reached | 10 in the hour, the oldest 48 min ago | 429: "…You can ship to {host} again in 12 minutes."; the job stays at `awaiting_ship`, and Ship it can be pressed again later | N/A |
| Exempt record | `deploy_rate_limit_exempt` true, 10+ in the hour | Ship it is accepted | N/A |
| Roll back at the limit | 10 in the hour | a Roll back is never refused for it (and its upload counts) | N/A |
| Budget, under | 59 jobs in the hour | Run checks starts | N/A |
| Budget, reached | 60 jobs in the hour, any sites | 429: the budget sentence with its minutes; a log line names the account; no job is inserted | N/A |
| Count read fails | a query error | the route answers 502 and nothing is handed on | logged by code |
| Second Pre-flight while compiling | the first is still at `checking` | the first is flagged and clears itself (no `deploys` row, no object); the second runs | N/A |
| Site record gone | `sites` row deleted | the key falls back to the id; the body answers as today | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/server/ghost-admin/db.ts`:
  - `:23-28`: `max: 1`, and "nothing inside a `begin` block may call `sql()`";
  - `sql()` `:87-107`, with the client's options to copy;
  - the header gains the second, per-hold connection and its reason.
- `apps/web/server/deploy/run.ts`:
  - `DeployIo` `:79-158`, with `jobs.resting` `:96`;
  - `STALLED_MS` `:163`;
  - `start` `:571-574`, `firstRead` `:596`;
  - `ship` `:626-724`, with the claim `:661`, the bind and `taken` `:702-709`, and the routes step via `goLive` `:781-790`;
  - `activate` `:737-756`, `cancel` `:846-864`.
- `apps/web/server/deploy/deploy-io.ts`:
  - `jobs` `:59-75`, with `resting` `:73` (stage `awaiting_ship` only);
  - the header lists the service-role reads.
- `apps/web/server/deploy/put-back.ts`:
  - the header `:31-33` ("NO JOB ROW AND NO LOCK OF ITS OWN");
  - `PutBackIo` `:70-91`, `admit` `:115-130` (its `moving` and ponytail `:121-127`);
  - `putBack` `:156`, `restoreOriginal` `:240`, its ponytail `:256`.
- `apps/web/server/deploy/put-back-io.ts:63` -- the `moving` query (it stays).
- `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/route.ts`:
  - the header `:21` ("AD-19's advisory lock over the upload is Story 7.25's");
  - the preflight arm `:59-73`, the ship arm `:79-91`, the activate arm `:93-95`;
  - `json()` `:31`.
- `apps/web/lib/deploy.ts`:
  - `DeployCode` `:165`, EEXIST → `deploy_running` `:217`;
  - `DEPLOY_WORDS.running` `:390`, `infrastructure` `:398`;
  - `deployError` `:569-…`, the `deploy_running` arm `:577`;
  - the stage sets `:59-64`;
  - `nextVersion`'s comment `:121` ("Story 7.25's per-site lock removes the race").
- `apps/web/lib/retention.ts:438` -- `HISTORY_WORDS.busy`, History's timeout sentence (unchanged).
- `apps/web/lib/site-switch.ts` -- `SwitchIo` `:112-122`, `switchWith` `:129-147`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts:196` -- `switchSite`, which builds `SwitchIo`.
- `apps/web/app/(app)/app/harness/editor/actions.ts:43` -- `harnessSwitch` and its `x-inflozo-harness-switch` values.
- `apps/web/components/editor/deploy-wizard.tsx`:
  - `post` `:577-586`, which keeps the status only;
  - `runChecks` `:709-724`, `press` `:870-890`, both of which say refusals through `setRefused`.
- `apps/web/server/deploy/held-names.ts` -- its header: why the address, and what one address cannot see.
- **Schema, read-only:**
  - `supabase/migrations/20260904120000_complete_schema.sql`: `sites.deploy_rate_limit_exempt` `:168`; `deploy_jobs` `:411-425`
    (`site_id` "null for FR-J12 export" `:415`, `started_at` `:422`); `exports` `:478-485`;
  - `20261125120100_deploys_accepted_at.sql` (`deploys.accepted_at`);
  - `supabase/tests/rls.sql:216-224`: the exempt flag is server-only.
- **Tests to extend:**
  - `apps/web/deploy.test.ts` -- route source rules `:451-470` (`sliceOf`);
  - `apps/web/deploy-run.test.ts` -- every stage over a fake `DeployIo`;
  - `apps/web/put-back.test.ts` -- `moving` `:44`, `:99-101`, `:310`, `:404`, `:641`;
  - `apps/web/site-switch.test.ts` -- `holds` `:108`, `:178`;
  - `apps/web/server-wiring.test.ts` -- postgres's one importer `:368-382`, the chokepoint's importer list `:507-…`.
- `tools/keyboard/journey.spec.mjs` -- keyboard only below the sentinel `:165`. The harness never reaches the deploy route:
  journeys answer it through `page.route`.
- `tools/probe/run-verify-editor.cjs` -- the last step is 124 (`:17022`, `STEP124_PLANT`, `T1_WRITES=1` `:492`).
- **Evidence:**
  - MEASUREMENTS §21 (one deploy: 12.7 s wall, $0.000427), §17 (Fluid's concurrency), §25f (`EEXIST`) and §91 (the fatal
    theme `422`);
  - VERIFY-AT-BUILD 35 and 39;
  - the last section is §91, so this story's is §92.

## Tasks & Acceptance

**Dev gate:** none left with the owner. Question 1 was ruled option 1 (R-295), which this plan builds. Dev still asks his
in-session go for the production and T1 writes (Ask First).

**Execution:**

*The lock:*
- [x] `apps/web/server/ghost-admin/db.ts` -- `lockSql()`: a fresh `postgres` client with `sql()`'s URL, pinned root, `prepare: false`
  and `max: 1`, one per hold, ended by its caller. The header says why it is a second connection.
- [x] `apps/web/server/site-lock.ts` (new) -- `withSiteLock`, `LOCK_WAIT_MS`, exactly as in Always. Its header carries:
  - the key (the address, held-names' reason);
  - the span rule;
  - H1–H4 (§92).
- [x] `apps/web/lib/deploy.ts` -- `Locked<T>`.
- [x] `apps/web/server-wiring.test.ts` -- `server/site-lock.ts` joins the chokepoint importer list, with its reason: it holds one
  advisory lock on a dedicated connection and decrypts nothing. `db.ts` stays postgres's only importer.

*Who takes it:*
- [x] `apps/web/server/deploy/run.ts`:
  - `DeployIo.lock`;
  - `ship` and `activate` wrapped as in the table, with the timeout's claim;
  - `start` flags moving checks (DW-373).
- [x] `apps/web/server/deploy/deploy-io.ts`:
  - `lock` bound to `withSiteLock`;
  - `jobs.resting` returns `queued`/`compiling`/`checking` beside `awaiting_ship`;
  - the count reads: `deploys` accepted since, `sites` exempt and `deploy_jobs` started since, all `user_id`-scoped.
- [x] `apps/web/server/deploy/put-back.ts` and `put-back-io.ts`:
  - `PutBackIo.lock`;
  - `putBack` and `restoreOriginal` keyed on the linked site and wrapped whole; timeout → `busy`;
  - the header `:31-33` and the ponytails `:121-127` and `:256` rewritten.
- [x] `apps/web/lib/site-switch.ts` -- `SwitchIo.lock`; `switchWith` locks its loop after `holds()`; timeout → the running sentence.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts` -- `switchSite` binds `lock` to the chosen site.
- [x] `apps/web/app/(app)/app/harness/editor/actions.ts` -- `x-inflozo-harness-switch: busy` answers the running sentence.
  Document it in the harness header.

*The counts:*
- [x] `apps/web/lib/deploy.ts`:
  - the two constants and `overLimit`;
  - `deploy_rate_limited` and `compile_budget` in `DeployCode` and `deployError`;
  - `DEPLOY_WORDS.siteLimit` and `budget`;
  - `nextVersion`'s comment updated.
- [x] `apps/web/server/deploy/run.ts` -- `siteLimit` and `compileBudget` (doors over `io`, like `uploadOnlyRefused`).
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/route.ts`:
  - `compileBudget` before `start`, and `siteLimit` before `after(() => ship(`;
  - 429 as JSON, 502 on a failed count;
  - the header `:21` rewritten.
- [x] `apps/web/components/editor/deploy-wizard.tsx` -- `post` keeps a 429's `message`; `runChecks` and `press` say it.

*Tests* (each new assertion seen red under a planted reversion):
- [x] `apps/web/site-lock.test.ts` (new), over a fake client:
  - the statement order and the key text;
  - `55P03` and `57014` → not held, with `run` never called;
  - a throw from `run` rethrown;
  - a commit failure after `run` → its value returned, and the log line;
  - `end()` on every path.
- [x] `apps/web/deploy-run.test.ts`, with a fake lock (a promise chain per key that records enter and leave, plus a never-held
  one):
  - two ships of two projects on one site: the second's first Ghost call comes after the first's routes step; its held read sees
    the first's binding; it is re-made under `-2`; no `taken`;
  - never held: zero Ghost calls, the job `failed`/`deploy_running`, the deploy `failed`; a row moved by another invocation is
    untouched;
  - `activate` under the lock; never held → `failed`/`deploy_running`, the deploy `uploaded`;
  - a throw inside leaves the lock;
  - `start`: a `checking` job is flagged, an `awaiting_ship` one is cleared, then the insert;
  - `siteLimit`: exempt; 9; 10 with its minutes;
  - `compileBudget`: 59; 60, with its log line.
- [x] `apps/web/put-back.test.ts`:
  - the put-back and the restore enter the lock, keyed on the linked site, before their reads;
  - never held → `busy`, zero Ghost calls, nothing written;
  - `moving` held as today.
- [x] `apps/web/site-switch.test.ts` -- never held → the running sentence, nothing written; held → as today.
- [x] `apps/web/deploy.test.ts`:
  - `overLimit`: none; cap − 1; cap, with the minutes from the oldest; one outside the hour ignored; rounding up; a floor of 1;
  - the words derive from the constants;
  - the route source: the preflight arm asks `compileBudget` before `start(`, the ship arm asks `siteLimit` before `after(() =>
    ship(`, and both answer `json(429`.
- [x] `tools/keyboard/journey.spec.mjs` -- 7.25, keyboard only:
  - (a) Run checks answered 429 with the budget envelope: the sentence in the refusal line, announced, and Run checks reachable
    again;
  - (b) Ship it answered 429 with the site-limit envelope: the sentence, and the check still ready to ship;
  - (c) `x-inflozo-harness-switch: busy`: the running sentence in the picker.
- [x] `tools/probe/record-site-lock.mjs` (new), recording MEASUREMENTS §92, with a catalogue row in `tools/doc-audit.py`:
  - **What it runs:** H1–H4 (Design Notes), on a probe key that names no site, and nothing else. It reads and writes no table.
  - **Where:** first against a throwaway `postgres:17` container, then against the production pooler.
  - **How it reads the pooler URL:** from `tools/probe/.env` in-process, never through argv.
  - **The driver:** `postgres` through `apps/web`'s install.
- [x] `tools/probe/run-verify-editor.cjs` -- step 125 (the Verification's), under `T1_WRITES=1`, written at Dev and never run
  there.

*Propagation* (standing rules 3 and 7; end with `grep -rn "Story 7.25's\|lock of its own\|7.25's per-site" apps/web tools`):
- [x] PRD FR-J11 (`prd.md:430`), a dated note covering:
  - what each count reads;
  - that the way back is never refused;
  - the lock's key and span.
- [x] `ARCHITECTURE-SPINE.md`:
  - AD-19, a dated rule: the address key, the dedicated connection, the wait, the idle ceiling, and the span over Ship it's whole
    invocation, with its reason;
  - the sentences "AD-19's lock covers uploading and activating only" at `:191` and `:258`, dated;
  - AD-24's `EEXIST` line, dated: it is now unreachable from Inflozo across accounts too.
- [x] `VERIFY-AT-BUILD.md` 35 and 39, a dated "built by Story 7.25" each.
- [x] `EXPERIENCE.md` -- the Deploy Wizard row `:190`, a dated note covering:
  - the two sentences and where they appear;
  - that the wait is the press's busy state;
  - the timeout's S8d′ sentence;
  - the picker's refusal.
- [x] `epics.md` Story 7.26's card, a dated line: its export runs on a `deploy_jobs` row with `site_id` null and asks
  `compileBudget` first. Its refusal reuses `budget`'s first sentence.
- [x] `deferred-work.md` -- DW-373 and DW-379 done (Story 7.25), with resolution lines.
- [x] MEASUREMENTS §92, from the recorder. *(Written by the main session's `--pooler` run on the owner's in-session go, 2026-11-27 — every row held behind its controls.)*

**Acceptance Criteria:**
- **Matches the frame (R-74: none drawn).** Given journeys 7.25 (a)–(c), when each refusal is said, then it appears in 7.18a's
  existing refusal line or the picker's, in their own type and tokens, and nothing new is drawn.
- **The lock holds on the real pooler.** Given the recorder on the container and then on the production pooler, then each of these
  holds, each beside its control:
  - H1: a second holder of one key gives up with `55P03` after its `lock_timeout`, while a holder of another key takes its lock at
    once;
  - H2: a holder killed mid-hold frees the key;
  - H3: a transaction left idle 150 s commits through the pooler, and the pooler role's `statement_timeout` and
    `idle_in_transaction_session_timeout` are recorded;
  - H4: the local idle ceiling ends an abandoned holder.
- **Two accounts, one Ghost, really.** Given walk step 125 (a), when X and Y both ship `inflozo-lock-test` within a second, then:
  - both jobs are `done`;
  - the bindings are `inflozo-lock-test` and `inflozo-lock-test-2`;
  - the later job's `uploading` began after the earlier's last edge, and its `compiling` ran a second time;
  - T1 lists both themes, and the earlier one's download equals its `content_manifest`;
  - no `deploy_running` and no `taken`.
- **The limits, really.** Given walk step 125 (b)–(c):
  - 9 accepted uploads → Ship it ships; 10 → the site-limit sentence with its minutes; the record exempt → it ships;
  - 59 jobs → Run checks starts; 60 → the budget sentence, plus Vercel's log line for that POST.
- **One Pre-flight.** Given walk step 125 (d), when Run checks runs, the wizard is closed during Checking, and Run checks runs
  again, then the first job ends `cancelled` with no `deploys` row and no object, and the second rests at `awaiting_ship`.
- **Nothing else takes it.** Given the tree, `grep -rn "withSiteLock" apps/web` finds it only in `site-lock.ts`, `deploy-io.ts`,
  `put-back-io.ts`, the editor's `actions.ts` and tests.

### Review Findings

*Story 7.25's Review (2026-11-27): five layers — Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier (its read-only half a subagent; every production and T1 call in the main session, on the owner's in-session goes) — then
walk step 125 on the Dev head and the lock recorder at 290 s on the production pooler (Verification). One question for the owner
(Question 2, ruled R-296: as built), three items deferred, twelve findings dismissed. Each patch is Spec Change Log "Review".*

- [x] [Review][Patch] **A SILENT idle hold has lost its lock through the pooler** — §92's H3 rerun at 290 s on the owner's go: the
  key taken by a waiter at 280 s, the holder's COMMIT on a new session (`25P01`); the same hold on Postgres 17 kept it, and a second
  290 s run (the owner's second go) kept it on the pooler too — an intermittent loss, not a fixed timeout. A hold can be idle ~270 s
  (a 30 s wait, then the rest of AD-11's 300), so a slow ship could lose its lock unseen. The Design Notes' remedy, built: the hold
  beats `select 1` every `KEEP_ALIVE_MS` (20 s) while its work runs — H3k, held at 290 s on the pooler with its own waiter control
  [`server/site-lock.ts` · `tools/probe/record-site-lock.mjs` · MEASUREMENTS §92's dated note]
- [x] [Review][Patch] A Re-activate press on a job whose deploy is NOT uploaded (live already, or a check that failed its gate) was
  claimed `failed`/`deploy_running` — its findings overwritten — whenever the lock was busy past its wait [`server/deploy/run.ts` `activate`]
- [x] [Review][Patch] A lock that could not be TAKEN (the connection, not the wait) was never retried, against AD-20's rule
  [`server/site-lock.ts`]; nor was DW-373's flag (`cancel()`'s reads) inside `start()` [`server/deploy/run.ts` `start`]
- [x] [Review][Patch] The put-back and Restore original keyed the lock on a link read BEFORE the wait, then acted on the link read
  after it: a switch landing during the wait had them write to a site whose lock they did not hold. They now answer `busy`
  [`server/deploy/put-back.ts` `locked`]
- [x] [Review][Patch] The wizard said ANY 429's `message` word for word, a 429 from in front of the route included; and the route's
  two 502s on a failed count logged nothing [`components/editor/deploy-wizard.tsx` `post` · `deploy/route.ts`]
- [x] [Review][Patch] **R-294's line did not show on production** — walk 125a run 2: the later ship landed as `inflozo-lock-test-2`
  and its ending said nothing more. The ending compared the landed name with the LIVE ship state, which a page re-read under the
  wizard updates (once the ship's own binding is written it says no theme is to be created at all). The wizard now freezes the
  state D1a's box showed when Run checks leaves Destination [`components/editor/deploy-wizard.tsx` `shown`]
- [x] [Review][Patch] Walk 125a had no control that the two presses RACED (two ships one after the other pass every term), and
  bundled R-294 into the AC's check; 125d passed by the older abandon path, its "no deploys row, no object" vacuous when the first
  job's deploy id was read null; one account's cleanup failing stranded the others [`tools/probe/run-verify-editor.cjs` step 125]
- [x] [Review][Patch] Verification gaps: the S8d′ landings of a lock refusal untested (journeys 7.25 (d), (e)); DW-373's race
  fallback untested; the "way back" source test sliced `activate`'s wrapper only; `deploy-io.ts`' `resting` stages and the counts'
  scopes reached nothing but the walk (source rules) [tests]
- [x] [Review][Patch] Words that overstated: the put-back's time budget (the wait comes out of the same 300 s); "a flagged job still
  counts: it compiled"; "Roll backs included" (one row per version, its latest acceptance); "job rows are never deleted"; `db.ts`'
  "starves nothing"; the History route's "no lock" (it means the edit lock); the recorder's secret list taking an empty part
  [`put-back.ts`, `run.ts`, `db.ts`, `history/route.ts`, `prd.md` FR-J11, `record-site-lock.mjs`]
- [x] [Review][Decision] A Ship it whose wait ran out throws its checked artefact away: it ends on S8d′ ("Uploading to Ghost failed",
  though nothing was sent) and the customer runs checks again — one more of the hour's 60 builds. As the frozen table built it.
  Question 2, ruled option 1 (R-296): kept as built.
- [x] [Review][Defer] Every hold pins one pooler backend for its span, every waiter one for its wait; nothing caps concurrent holds
  (production: `max_connections` 60) [`server/site-lock.ts`] — deferred, a capacity ceiling with no load near it (DW-408)
- [x] [Review][Defer] A project's job rows are deleted with it, so deleting projects frees budget [`deploy_jobs.project_id … on
  delete cascade`] — deferred to Story 7.26, a schema change this story forbids (DW-409)
- [x] [Review][Defer] A Ship it or Re-activate failing as ours before any shipping stage (the lock not taken at all among them) is
  titled by the wrong step [`deploy-wizard.tsx` `failedAt`] — deferred, pre-existing for the whole class since 7.18a (DW-410)

Dismissed, each with its reason: a `Retry-After` header (no machine client; the sentence says when); the switch taking the chosen
site's lock before its RLS read (a site id is an unguessable UUID never shown to another account, and the hold is one read long);
two presses at a count's edge both passing (the counts are at the route by the spec — "a rate limit is not a mutex" — and bounded by
concurrent presses); a Pre-flight killed mid-run re-flagged by each new one (one idempotent write, no effect); the wizard silent
during the wait (the spec: the press's busy state, no "waiting" line, R-98); `STALLED_MS` imported from `run.ts` (the spec names it
run.ts' own); no `application_name` on the lock connection (nothing reads it); `jobs.resting` keeping its name (its type's comment
says what it returns); the switch's 35 s against the function's limit (the project's default is 300 s, read 2026-10-26); DW-373
cancelling a Ship it's stale re-make from a second tab that took the edit lock (the newer request wins, before anything reaches
Ghost); a double press re-running a ship that rested after B12b (the same press's own flags, the same outcome); a holder whose backend
ends mid-work (the spec: logged, the value kept; bounded by H2 and H4, and now prevented for idleness by H3k); Restore original
acting on another site after a switch (it answered `gone` — the snapshot is per site — and now `busy`).

## Spec Change Log

Story 7.25's Dev (2026-11-27) — routine calls, none of them a frozen decision moved:
- **Ship it and Re-activate read their row TWICE:** once outside the lock for its key (the job's site), and again as the first
  thing inside it, so the old body runs unchanged on the row as it stands after the wait. Without the second read, a double
  press whose second invocation waited out the first would run DW-374's link check on a stale row, and a switch let in between
  would fail a deploy that had already gone live.
- **`overLimit` past the cap:** "the oldest counted one" is exact at `cap`; above it (a Roll back is never refused, so a site
  can stand above its limit) the minutes are until the stamp whose leaving brings the count under `cap`, so the sentence never
  names a time the customer would be refused again. Minutes are 1–60, and a stamp a moment ahead of the server's clock (the
  database's `now()`) is counted.
- **`lockSql()` has no `idle_timeout`:** postgres.js ends a connection idle that long even inside an open transaction
  (`index.js`' `move`), and the hold's connection is idle for the whole span. **And it hands its notices to the caller:** a
  dropped connection is reconnected by postgres.js for the `COMMIT`, which then lands on a session with no transaction — Postgres'
  `25P01` warning, not an error — so `withSiteLock` reads that warning as the lost lock it is (logged, the value kept).
- **A lock that cannot be taken at all** (no connection): Ship it and Re-activate make the same claim as a timeout, with
  `deploy_infrastructure`; the put-back, the restore and the switch answer ours. Nothing is sent to Ghost in either.
- **The wizard lands a `deploy_running` failure on S8d′** though no shipping stage was entered: "Uploading to Ghost failed" for
  Ship it, "Activating failed" for a Re-activate whose deploy is still `uploaded` (as DW-374's refusal already does) — the
  frozen "ends on S8d′", with no new words.
- **DW-373:** a check that reached `awaiting_ship` between `start()`'s read and its flag is abandoned as a resting one — the
  same ending.
- **Walk step 125 (c)** notes Vercel's log line for the budget POST with its time and the user's id for the main session to read
  (`npx vercel@latest logs`, the memory's way); the walk never puts the Vercel token on argv.
- **The recorder's H4** reads the abandoned holder's end by its own `COMMIT` — refused, or landing on a fresh session with
  `25P01` — rather than "its next statement refused", because postgres.js reconnects under an idle client.

Story 7.25's Review (2026-11-27) — patches, each outside the frozen block (the frozen table's behaviour is unchanged; Question 2 asks
about the one place it could change):
- **The hold beats (H3 failed once).** On the owner's go the recorder held a silent transaction 290 s on the production pooler: its
  key was taken by a waiter at 280 s and its COMMIT landed on a new session (`25P01`), while Postgres 17 alone kept it. On a second
  go, the same silent hold KEPT its lock — the loss is intermittent (the pooler, or the network between the recorder and it), not a
  fixed timeout. The Design Notes' own remedy: `withSiteLock` runs `select 1` every `KEEP_ALIVE_MS` (20 s) while the work runs,
  stopped when it returns or throws; the second run's H3k held it 290 s on the pooler. The recorder now asserts the silent holder on
  the container only and OBSERVES it on the pooler (its first H3k design made it a control that must lose there, and that run
  voided when it did not); §92 carries a dated note with both runs, since neither wrote the section (Verification).
- **AD-20 at the lock.** A lock that could not be TAKEN (a connection or statement error that is not `55P03`/`57014`) is tried once
  more on a fresh connection before anything runs; a wait that ran out is still never retried. `start()`'s DW-373 flag runs through
  `twice` like every other read there.
- **Re-activate asks its deploy first.** `activate()` returns unless the job's deploy is `uploaded` (as `activateHeld` asks again
  inside), so a stray press on a live or gate-failed job is never failed by a lock wait.
- **The put-back and the restore hold the site they write to.** `locked` hands the key to the body, which answers `busy` when its own
  link read (inside the lock) names another site — a switch that landed during the wait.
- **Our 429s only.** `post` keeps a 429's `message` only for `deploy_rate_limited` and `compile_budget`; the route logs a failed
  count's code before its 502.
- **R-294, frozen at Run checks.** The ending's "It was uploaded as …" compares the landed name with the ship state as Run checks
  left Destination (`shown`), never the live prop a page re-read replaces (walk 125a run 2 found the line missing on production).
- **Walk step 125.** (a) records each POST's time and checks that they raced (under a second apart, both before the earlier ship
  ended) as its own control, and checks R-294's line apart from the AC, printing every page re-read and server action from the
  presses to the endings; (d) sends the second Pre-flight as the server's half — POSTed from the tab, with its lock session, the
  moment the first reads moving — and counts only a first job FLAGGED (`cancel_requested`) whose deploys row and object are gone
  (counted by the project before and after, not by an id that may read null); the cleanup's accounts each in their own try.
- **The recorder's H3 is H3/H3k at 290 s**, two holders at once on two keys, one silent and one beating as the product does.

## Design Notes

**Why its own connection.** `db.ts` holds one pooled connection (`max: 1`), and every `call()` decrypts and audits through it. So
a transaction held there waits on its own upload.
- Raising `max` lets concurrent holders starve the decrypts their own spans need.
- A connection per hold costs one TLS handshake per ship, and starves nothing.

**Why transaction-scoped, with an idle ceiling.** The pooler is in transaction mode, so a session-level lock would not survive.
- A transaction-scoped lock ends with its transaction or its connection.
- The idle ceiling (`STALLED_MS`, the stalled-job rule's own number) is the belt: a holder whose death the pooler never noticed
  still frees the site within it.
- **H1–H4 are hypotheses until §92 executes them (standing rule 1):**
  - H1: `lock_timeout` bounds an advisory-lock wait, with `55P03`;
  - H2: a dropped connection frees the lock through the pooler;
  - H3: the pooler keeps an idle transaction open for at least 300 s;
  - H4: `set_config(…, true)` sets the idle ceiling.
- **If H3 fails,** the lock connection runs `select 1` every 20 s while held. **If H2 fails,** H4 still bounds it. If both fail,
  stop and say so.

**Why the address.** It is 7.24's "one Ghost":
- theme activation is per Ghost, not per Inflozo account;
- two accounts' records of one Ghost share `sites.url`, `normaliseSiteUrl`'s lowercased origin.

What one address cannot see is what `heldNamesIn` cannot see: one Ghost reached under two addresses.

**Why Ship it's whole span, and not "uploading and activating only" (AD-20's F-075 sentence).** The lock protects decisions, and
each decision is a read: the link (DW-379), the free name (7.24's race) and R-264 (a)'s live project. A read taken before the lock
may be stale by the time it is acted on. Holding the lock through the stale re-make and the capture adds seconds to the span, and
the wait stays bounded.

**Why 30 s.**
- A typical span is about 13 s: a 3.9 s compile plus 8.8 s to upload and activate (MEASUREMENTS §21). 30 s is twice that.
- A waiter that waits 30 s still has 270 s of AD-11's 300 for its own work.
- A longer wait risks the invocation's own budget.

**Why the site count is accepted uploads per site record, at Ship it.**
- **Accepted uploads:** that is what lands on the Ghost.
- **At Ship it:** refusing there keeps the checked artefact, so Ship it works again once the minutes pass.
- **Per site record, not per address:** the exemption and every query's scope are per record, and a per-address count would let
  one account spend another's limit.

**Why `deploy_jobs` for the budget.**
- Job rows are never deleted: cancelled and abandoned ones stay, one per Pre-flight.
- `deploys` rows are deleted with an abandoned check, so a count over them misses checks.
- The export rides a job row.

**Why the way back is never refused.** A Roll back, a Re-activate or a Restore original compiles nothing, and refusing one while a
site is broken would be the wrong way round. A Roll back's upload still counts toward the next Ship it.

**DW-373, flag rather than hand back the running job.**
- Handing the running check back would show Pre-flight results for inputs the customer has just changed.
- Flagging it reuses Cancel's own path. The flagged compile stops at its next edge, within seconds.

**The switch locks only the chosen site.** A ship already uploading to the site the project LEAVES finishes there. That was the
project's site when it was sent, which is DW-374's own line.

**Owner test: none, as the card says.** Nothing is drawn. The sentences appear only past a limit, or past a 30 s wait that no
manual step can time. Walk step 125 proves each one on production and T1.

## Questions for the owner

Question 1 was ruled option 1 by the owner on 2026-11-27 (R-295). `ACCOUNT_COMPILES_PER_HOUR` holds it. Question 2 was raised at
the Review (2026-11-27) and ruled option 1 the same day (R-296): kept as built. None is open.

### Question 1 — How many theme builds may one account run in an hour?

Every **Run checks** builds the customer's theme on our servers, and from Story 7.26 so will every theme ZIP export. Each build
costs us a fraction of a cent. The budget is a ceiling that no honest customer ever meets. It exists so that a broken script, or
someone misusing an account, is stopped and shows up in our logs instead of quietly running up the bill. It counts every build
the account starts, on any site.

**Example:** with 60, a customer who has pressed Run checks 60 times since 2:00 PM and presses it again at 2:50 PM sees "Your
account has built 60 themes in the last hour, the most Inflozo builds in an hour. You can run checks again in 10 minutes." The
most one account could then cost us in a month is 60 × 24 × 30 builds × $0.000427, about **$18.45**. That uses the measured cost
of a whole deploy; a build alone costs about a third of it.

1. **60 an hour, on every plan — one build a minute for a whole hour; at most about $18.45 a month per account. (RECOMMENDED)**
2. 100 an hour, on every plan — at most about $30.74 a month per account.
3. 30 an hour on Free and 100 on Pro — follows the plan; every Run checks also reads the account's plan first.
4. 30 an hour, on every plan — at most about $9.22 a month; a busy designer iterating quickly could meet it.

**Ruled: option 1 (owner, 2026-11-27) — R-295.** *"1"*, which is *"60 an hour, on every plan — one build a minute for a whole
hour; at most about $18.45 a month per account."*

### Question 2 — When your Ship it has to wait more than 30 seconds for another deploy to the same site, should it keep your check?

Inflozo now ships to one Ghost site one deploy at a time. When a second deploy to the same site is pressed while the first is still
running, the second waits. If it is still waiting after 30 seconds, it gives up and sends nothing. Today it then shows the failure
screen — "Uploading to Ghost failed" and "Another deploy to this site is already running — try again in a moment." — and to try
again you go back and press **Run checks** again (about 4 seconds; it counts as one of the 60 builds an account may run in an hour).

**Example:** two people on your team ship two different projects to blog.example.com at the same moment. The first is the site's
first ship, so it also saves your original theme and takes 40 seconds. The second person sees the failure screen after 30 seconds,
presses Back, Run checks, then Ship it again. (In the Review's real test, the first of two such ships took 19 seconds, so the
second simply waited and shipped.)

1. **Keep it as built — the failure screen, then Run checks again. Nothing new to build; it happens only when two deploys reach one
   site at the same moment and the first runs past 30 seconds. (RECOMMENDED)**
2. Keep the check ready — the second stays on the Check screen with "Another deploy to this site is already running — try again in
   a moment." under Ship it (as the hourly limit already does), and pressing Ship it again just works, without a new build. A small
   new state in the wizard, its tests and a walk check, built in this story.

**Ruled: option 1 (owner, 2026-11-27) — R-296.** *"1"*, which is *"Keep it as built — the failure screen, then Run checks again."*
Nothing changes in the code.

## Verification

**Commands:**
- `pnpm check` -- expected: green. That includes `site-lock.test.ts`, `deploy-run.test.ts`, `put-back.test.ts`,
  `site-switch.test.ts`, `deploy.test.ts` and `server-wiring.test.ts`. The run prints its own counts.
- `bash supabase/tests/run-rls-gate.sh` -- expected: green, unchanged (no migration). The exempt flag's server-only PASS is among
  it.
- `pnpm keyboard` -- expected: journeys 7.25 (a)–(c) green, and 7.18a's, 7.18b's, 7.23a's and 7.23b's unchanged.
- `node tools/probe/record-site-lock.mjs --local` (a `postgres:17` container) -- expected: H1–H4 each PASS beside its control.
- `python3 tools/doc-audit.py --check`, run twice -- expected: green.
- `grep -rn "Story 7.25's\|lock of its own\|7.25's per-site" apps/web tools` -- expected: nothing that still promises the lock.

**Real infrastructure** (R-82; each on the owner's in-session go, in the main session, from a clean worktree at the deployed
sha):
- **The recorder on the production pooler:** `node tools/probe/record-site-lock.mjs --pooler`. It uses a probe key only, reads
  the URL in-process, and touches no table. Expected: H1–H4 on Supavisor, recorded as MEASUREMENTS §92.
- **Walk step 125 on production and T1**, with three throwaway Free accounts X, Y and Z, each connecting T1 through the wizard
  with a project "Lock test":
  - (a) the cross-account race, as in the AC. Deploy only, so T1 stays on `casper`;
  - (b) Z's site limit:
    - service-role rows on Z's record: 9 accepted uploads in the hour (the control: Ship it ships, the 10th);
    - then Run checks and Ship it → the sentence, with minutes between 1 and 60;
    - then `deploy_rate_limit_exempt = true` on Z's record → the same press ships;
  - (c) Z's budget:
    - service-role `deploy_jobs` rows up to 59 in the hour (the control: Run checks starts, the 60th);
    - then Run checks → the budget sentence, and Vercel's log line for the POST;
  - (d) DW-373, as in the AC;
  - finally: every `inflozo-lock-test*` theme deleted from T1 (RESET-PROTOCOL's way), T1 on `casper`, `routes.yaml` unchanged,
    the three accounts deleted, and users and projects counted back.

  **Ghost 5's half** (T3, R-238) is postponed to DW-326's pass at Story 15.7.
- **Vercel:** the deployment is READY from the Dev head, and CI's `check`, `rls` and `deploy` are green.

**Executed — Dev (2026-11-27, Node 24):**
- `pnpm check` -- green, on the final tree in the main session: lint, typecheck and every package's tests (`apps/web` 1203 of
  1203, the run's own count). Planted reversions, each seen red then restored: the implementation subagent's list (an unlocked
  ship, activate, put-back, restore and switch; the claim's result ignored; DW-373 off; the exemption ignored; no budget log;
  `Math.floor`; the oldest always; literal words; `57014` not a timeout; a commit error rethrown; no `end()`; the key on the id;
  `25P01` ignored; `site-lock.ts` off the importer list), and the main session's own: `ship` without `underLock` → 3 of
  `deploy-run.test.ts` red.
- `bash supabase/tests/run-rls-gate.sh` -- green and unchanged, "deploy_rate_limit_exempt is server-only" among it (the
  subagent's run; no migration).
- **The product's own `withSiteLock` on a real Postgres** (a scratch script importing `apps/web/server/site-lock.ts`, a throwaway
  `postgres:17` with a minimal `public.sites`, every check beside its control): a hold keys on the record's ADDRESS and not its
  id; two records of one address serialize (B entered 2 ms after A left); another address does not wait (entered while A held);
  a record that is gone keys on its id; a key held elsewhere answers `{ held: false }` after 30031 ms with `run` never called,
  and is held at once once released; no "lock was lost" line on a clean commit. All held. This is where the statement's
  `coalesce` subquery and its `$1` (sent untyped by postgres.js, so Postgres reads it as `uuid` then `text`) were executed.
- Keyboard journeys, `bash tools/keyboard/run-keyboard-gate.sh --grep "7\.25|7\.18a|7\.18b|7\.23a|7\.23b|7\.24"` -- 91 passed, 1
  failed: journeys 7.25 (a)–(c) green, with 7.18a's, 7.18b's, 7.23a's, 7.23b's and 7.24's. The one failure was `floor.spec.mjs`
  7.18a "Ship it by pointer", the run's FIRST test, its canvas not painted within 5 s on a cold dev server at load average ~40
  (another session's work). Alone with `--repeat-each 3` it failed run 1 and passed runs 2 and 3, the same line both times, before
  any wizard interaction. It is cold start, not this story: CI's whole `pnpm keyboard` runs other floor tests before it.
- `python3 tools/doc-audit.py --check`, twice -- green (the main session, before the commit).
- `grep -rn "Story 7.25's\|lock of its own\|7.25's per-site" apps/web tools` -- in source, only lines that describe what is
  built ("Ghost has no lock of its own" is Ghost's). `grep -rln "withSiteLock" apps/web` (source) -- `site-lock.ts`,
  `deploy-io.ts`, `put-back-io.ts`, the editor's `actions.ts` and three tests.

**Real infrastructure — Dev (R-82):**
- **Supabase, the production transaction pooler** (`SUPABASE_DB_POOLER_URL`, read in-process from tools/probe/.env and never
  printed), on the owner's in-session go (AskUserQuestion, "1. Go"): `node tools/probe/record-site-lock.mjs --pooler`, after its
  local `postgres:17` half. A probe key naming no site; no table read or written.
  - **Run 1 VOID.** The pooler's H1–H3 and H4's control held; H4 itself read `held true, 2103 ms` against "taken at once (< 2 s)",
    the clock counting a fresh TLS connection to the pooler (~2 s). The behaviour held — the key taken, the abandoned holder's
    COMMIT landing on a new session with `25P01` — but a control that cannot pass is not a result (standing rule 2), so nothing
    was written. Fixed: the waiter's clock starts once its connection is up (`wait()`'s comment says why).
  - **Run 2, on a second in-session go ("1. Go"): every row held, behind its controls; §92 written.** On Supavisor (Postgres
    17.6; the `postgres` role's `statement_timeout` 2min, `idle_in_transaction_session_timeout` 0): H1 — another key taken in
    286 ms, the held key given up with `55P03` after 30449 ms, taken in 288 ms once committed; H2 — the child really held it
    (`55P03`), and SIGKILLed it freed the key in 302 ms; H3 — still held after 140 s idle (`55P03`), and committed at 150 s with no
    `25P01`; H4 — no ceiling: still held after 8 s idle, and committed; a 3 s ceiling: the key taken in 291 ms, the holder's COMMIT
    on a new session (`25P01`). So no `select 1` keep-alive is owed (H3 held), and H2 and H4 each bound a dead holder.
  - The role's 2-minute `statement_timeout` is overridden inside each hold by the hold's own `set_config('statement_timeout', …)`,
    which bounds only the lock connection's own statements; the work runs on other connections.
- **Not run at Dev, by the spec:** walk step 125 on production and T1 (written, `node --check` clean, `T1_WRITES=1`; the
  Review's, on its own in-session go), and the Vercel deployment and CI of the Dev head (read at Review — R-81's push is this
  phase's last act). T3 (Ghost 5) is retired (R-238); its half waits for DW-326 at Story 15.7.

**Executed — Review (2026-11-27, Node 24):**
- **CI and Vercel on the Dev head** (`22d9c9d4`, read with `GITHUB_TOKEN` / `VERCEL_TOKEN` in-process): CI run 46010822451 —
  `check` (the full `pnpm keyboard`), `rls`, `deploy` all success; the Render matrix success; READY as
  `dpl_Dhw1bjMrUzdDpxvZDKwa1VE6TpaF`. The control: an all-zero sha answers no runs.
- **R-99 on production** (read-only, `SUPABASE_DB_POOLER_URL` in-process, on the owner's go): every column the new code reads is
  there — `sites.url`, `sites.deploy_rate_limit_exempt`, `sites.user_id`, `deploys.accepted_at`/`site_id`/`user_id`,
  `deploy_jobs.started_at`/`user_id`/`site_id`/`stage`/`project_id`; the control `deploys.no_such_column_control` absent. No
  migration in the diff. `max_connections` 60; the pooler's config `pool_mode: transaction`, `default_pool_size` null (DW-408).
- **Walk step 125 on production and T1, on the owner's go ("1. Go", up to three runs)**, a cut of steps 1–5 + 125 from a clean
  worktree at `22d9c9d4`:
  - run 1 VOID: started on Node 22 and stopped by the main session within its first minute; it had made account A alone (empty —
    no project, no site), deleted by hand (users 27 → 26), nothing on T1.
  - **run 2: 52 PASS, 1 FAIL.** Every 7.25 claim held: T1 on `casper`, no lock-test theme or binding at the start; (a) X and Y both
    named `inflozo-lock-test` and compiled it, Y bound it and X — compiling again after the press (14:22:17.06 > 14:21:57.22),
    uploading at 14:22:19.90 after Y's last edge 14:22:16.37 — bound `inflozo-lock-test-2`, both `done` with no error, T1 listing
    both with `casper` live and Y's download equal to its manifest; (d) the first check flagged and `cancelled` with no deploys row
    or object, the second at `awaiting_ship` (the first read at `compiling`); (b) 9 planted → the 10th shipped
    (`inflozo-lock-test-3`), the 11th refused "…You can ship to ghost6.inflozo.com again in 20 minutes.", still `awaiting_ship`,
    then exempt → shipped; (c) 2 real + 57 planted → the 60th started, the 61st refused "Your account has built 60 themes in the
    last hour, … again in 60 minutes.", no job inserted; finally T1 back on `casper` (`racer`, `source`, `inflozo-ghost6` beside it,
    every run theme deleted, `routes.yaml` 130 → 130 bytes), each account's objects gone, T1 disconnected on each, the three
    accounts deleted, users 28 → 28, projects back; zero CSP violations. **The one FAIL: R-294's line was not on X's ending** (the
    later ship, moved to `-2`) — patched (the frozen `shown` state), and the walk now checks it apart from the AC.
- **Vercel's log line for the budget POST** (`vercel logs --json`, the token in the child's environment, never on argv):
  `2026-11-27T14:23:59.784Z` POST `/projects/7426f9aa-…/deploy` on `dpl_Dhw1bjMr…`, level error: `deploy: compile budget reached
  { user: 'e6ea8ee1-…', minutes: 60 }` — Z's id, the walk's noted POST.
- **The lock recorder at 290 s on the production pooler** (two runs, each on its own in-session go): run A — H3 silent LOST (the key
  free at 280 s, the COMMIT on a new session with `25P01`); run B — the silent holder KEPT it, H3k (beating) KEPT it and committed;
  H1, H2, H4 held in both, every container row held in both. Both VOID by design (A on H3, B on a control written to expect the
  loss), so MEASUREMENTS §92 carries a dated note with both runs' lines.
- `pnpm check` — green on the patched tree (`apps/web` 1208 of 1208, the run's own count). Planted reversions, each red then
  restored: Re-activate's deploy check; the flag's `twice`; the race fallback; the lock's one retry; both put-back key guards; the
  429's own-codes filter; the route's log line; the frozen `shown`; a limit read inside `activateHeld`; no beat; a beat never cleared
  (the test hangs).
- Keyboard: `--grep "7\.25|7\.24 · \(f\)|7\.18b · the Review \(DW-378\)|7\.18b · DW-374"` — 7 passed, 1 failed: journeys
  7.25 (a)–(e), 7.24 (f) and DW-378 green; the run's FIRST test (7.18b DW-374) failed at `open` (the canvas not painted in 5 s),
  and alone with `--repeat-each 2` failed run 1 and passed run 2 at the same line, before any wizard interaction — cold start.
- `git diff 6d2a6c7b HEAD --name-only -- supabase/migrations` — none; CI's `rls` job green on the Dev head (no schema changes here).
- **The Review's deploy:** CI run 46025376223 green on `bf039423` (`check` with the full `pnpm keyboard`, `rls`, `deploy`), the
  Render matrix green; READY as `dpl_GnNNa2Sxo8g4TDqPvUM3gPAmVgVh`.
- **Walk step 125 run 3 (the go's third), from a clean worktree at `bf039423`: 54 PASS, 1 FAIL.** (a) the race control held — the
  two POSTs 8 ms apart, both before the earlier ship ended (16:05:05.01); Y bound `inflozo-lock-test`, X compiled again after the
  press (16:05:05.55) and uploaded after Y's last edge (16:05:08.56 > 16:05:05.01) as `inflozo-lock-test-2`, both `done`, T1 listing
  both with `casper` live, Y's download equal to its manifest; **R-294's line now on X's ending and not on Y's** — and the
  re-reads it printed show why run 2 lost it: both pages fetched `/projects/:id`, `/` and `/projects/:id/settings` as RSC at
  16:05:10, right after the endings, replacing the ship state the old comparison read. (d) the first check FLAGGED at `compiling`
  (`cancel_requested` true) and `cancelled`, the second POST 202 and resting at `awaiting_ship`, the only new deploys row and object
  the second's. (b) 9 planted → the 10th shipped, the 11th refused "…again in 20 minutes." resting, exempt → shipped. (c) 59 → the
  60th started; **the FAIL: the 61st Run checks said the infrastructure sentence** — and Vercel holds no request row for that press,
  no budget log line, and no job was inserted: the request died in the browser (DW-404's harness class, its sighting recorded). The
  refusal itself is run 2's (the server's 429 and its log line on production), the wizard's reading of our 429 envelope on this head
  is 125b's real 429 and journey 7.25 (a) in CI. Finally T1 back on `casper` (`routes.yaml` 130 → 130 bytes, every run theme
  deleted), each account's objects gone, T1 disconnected on each, the three accounts deleted, users 28 → 28, projects 21 → 21; zero
  CSP violations. The go's runs are spent; 125c's press is not re-run without a new one.

**Deploy (2026-11-27), on the real infrastructure (R-82).** Keys read only into each command's environment, by name
(`GITHUB_TOKEN`; `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`); no value printed; no write to any service. The story
carries no migration (`git diff 6d2a6c7b HEAD --name-only -- supabase/` — none), so there is nothing to apply and no RLS-TEST.sql
run beyond CI's own `rls` job.
- `Deployment: dpl_FoPpXUti7eb4UYcVRx5ufJuPinWZ` (`inflozo-h2xn6zaco-umangkagathara.vercel.app`), `READY`, target production,
  built from the Review head `c1e3bb62` (a documents-only commit over `bf039423`, whose code the Review's walk run 3 exercised).
- **GitHub Actions on `c1e3bb62`** (`actions/runs?head_sha=…`): CI run `46032843407` — `check` (the full `pnpm keyboard`), `rls`
  and `deploy` success; the render matrix run `46032843387` success. Control: an all-zero sha returns `total_count` 0.
- **Aliases** (`/v4/aliases/app.inflozo.com`, `/v4/aliases/inflozo.com`): both point at `dpl_FoPpXUti7eb4UYcVRx5ufJuPinWZ`.
  Live: `app.inflozo.com/sign-in` 200, `inflozo.com/` 200.
- `owner_test: none` — nothing new is drawn and the epic's card names no test, so the story is Done at Deploy.

**The I/O matrix, row by row → the check that ran:**
- One ship → every existing ship test in `deploy-run.test.ts`, now through the fake lock (held); `withSiteLock` uncontended
  enters at once on Postgres (the scratch run).
- Two ships, one Ghost, two accounts → "7.25: two projects ship to one Ghost at once — they SERIALIZE …" (with its no-lock
  control); two records of one address serialize on Postgres (the scratch run); walk 125 (a) at Review.
- Wait runs out → "7.25: the lock NOT HELD within its wait — Ship it sends nothing …"; `site-lock.test.ts` "55P03 or 57014 … NOT
  HELD"; `{ held: false }` after 30031 ms on Postgres; §92 H1 on the pooler.
- Double press, holder slow → the same test's "a row another invocation moved meanwhile … is left alone".
- Re-activate waits it out → "7.25: Re-activate runs under the site's lock … the deploy stays `uploaded`".
- Roll back during a ship → "7.25: the put-back and Restore original each ENTER THE SITE'S LOCK before their reads — keyed on the
  project's linked site" and "… NOT HELD … `busy`", over the same address key Ship it takes (one `withSiteLock`, keyed by
  `sites.url`, serializing two records of one address on Postgres).
- Two Roll backs at once → "7.25: two Roll backs at once serialize — the second re-reads inside and finds its version live
  already".
- Switch during a ship → `site-switch.test.ts` "switchWith (Story 7.25, DW-379) … not held … the running sentence and nothing
  read or written" and "switchSite binds the lock to the CHOSEN site"; the existing DW-374 `site_changed` tests, now inside the
  lock; journey 7.25 (c).
- Holder dies mid-span → §92 H2 and H4 (container and pooler); the existing `view()` stalled-job test.
- Connection lost after the work → `site-lock.test.ts` "finished work never becomes a failure … (25P01) …"; §92 H4 shows that
  `25P01` shape on a real reconnect.
- Site limit under / reached / exempt → "7.25 — FR-J11 at Ship it (`siteLimit`) …" and `deploy.test.ts`' `overLimit` test;
  journey 7.25 (b) says the sentence in the wizard with the check still ready to ship.
- Roll back at the limit → "7.25: the way back is never counted — Re-activate, Cancel and the put-back ask no limit …"; the
  put-back's `accepted_at` stamp is 7.23a's existing tests.
- Budget under / reached → "7.25 — R-295's compile budget at Run checks (`compileBudget`) …" with its log line; the route test
  "Run checks asks `compileBudget` before `start(`" (no job inserted); journey 7.25 (a).
- Count read fails → the route test "… a 502 when the count cannot be read".
- Second Pre-flight while compiling → "7.25 (DW-373): a new Pre-flight FLAGS one … still moving …".
- Site record gone → `site-lock.test.ts` "… the lock keyed on the site's ADDRESS (the id when the record is gone)"; a gone record
  keyed on its id on Postgres (the scratch run).
