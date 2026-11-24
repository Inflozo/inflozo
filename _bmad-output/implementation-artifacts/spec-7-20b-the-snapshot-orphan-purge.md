---
title: 'Story 7.20b — The snapshot orphan purge'
type: 'feature'
created: '2026-10-26'
status: 'in-review'
baseline_commit: 'c77b737a5093cab805ccdb1940f09c2983b8bbbb'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-20a-the-backup-gate-and-the-pre-inflozo-snapshot.md']
---

## In plain English

After this story, when you disconnect a site, your **Sites** page lists the theme that site had before Inflozo (the
"original" Story 7.20a saved), with the date it will be deleted and a **Download** button, until that date. Two weeks before
the date, Inflozo sends you **one email** saying which site's theme is going and when, with a way to download it; reconnect
the site before then and the theme is kept. On the date, a nightly clean-up deletes it, whether or not you downloaded it.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 7.20a saves each site's original theme and keeps it through a disconnect, for ever. FR-C6 says a
disconnected site's saved theme is deleted after 90 days, after a notice and a download offer, and that the deletion happens
on its date whether or not the offer was taken. Nothing warns the customer, offers the file or deletes it yet (DW-75), and the
90 days are written in two places (DW-79).

**Approach:** One daily job (AD-33's snapshot orphan purge) finds every saved theme whose site has been disconnected long
enough. It sends the notice when the notice is due. It deletes the theme (objects before rows) when its date has passed and
the notice went out. The date is derived from `sites.disconnected_at` and `ORPHAN_SNAPSHOT_DAYS`, the one home of the 90. The
Sites page lists every theme still kept for a disconnected site, with its date and a Download. **How and when the notice is
sent was the owner's (R-281): he ruled Question 1 option 1 on 2026-10-27, R-285.** The notice is one email, two weeks
before. "Ruled values" holds it.

**Frame:** none is drawn (the epics.md card). The section is extrapolated (R-74) from two sources:
- `S11 Sites.dc.html` S11a, the page it sits on;
- `/restore`'s "Your original themes" rows (Story 2.5), the same thing already drawn in the app's own vocabulary.

The email rides `lib/email-shell.ts`, as the other two app emails do.

The epic's criteria, word for word (R-195):
- **Given** a pre-Inflozo snapshot (Story 7.20a) whose site record is disconnected, **when** the purge's notice is sent,
  **then** how and when the user is warned is put to the owner at this story's Create (R-281).
- **FR-C6's 90-day orphan purge is built here** *(moved from Story 3.5 by the owner's ruling, 2026-09-09; DW-75, AD-33)*: a
  snapshot whose site record has been disconnected for 90 days is purged after a notice and a download offer. The deadline is
  **derived from `sites.disconnected_at`**, which Story 3.5 already writes, never from `site_snapshots.purge_after`. **The
  purge proceeds on its deadline whether or not the offer was taken**, objects before rows, through `drainPrefix`, as
  `purge-accounts` does.
- The purge's 90 days and the Sites card's "kept for 90 days" have one home: the job takes `ORPHAN_SNAPSHOT_DAYS` rather
  than a second literal in SQL, and `connect-rule.test.ts`'s agreement test follows it (DW-79).
- *(DW-390, Story 7.20a's Review, 2026-10-26)* The database's own comment on `sites.hosted_by_ghost`, applied at 7.20a's
  Schema, still describes a Ghost(Pro) gate and "both paths". Since R-283 the column names only the Backup step's sub line.
  This story's Schema push corrects it with one `comment on column`, plus `SCHEMA.sql`'s mirror.

## Boundaries & Constraints

**Always:**
- **One clock, one home.**
  - The deadline is `sites.disconnected_at + ORPHAN_SNAPSHOT_DAYS` (`lib/connect-rule.ts`), computed in TypeScript by one
    pure function. The page, the email and the job all call it.
  - No SQL writes the 90 days. `site_snapshots.purge_after` stays FR-A5's 14-day clock alone (DW-43).
- **The notice is never skipped and always gives its full window.**
  - A theme is deleted only once its notice has gone out, and never sooner than `ORPHAN_NOTICE_DAYS` after it. On time,
    that is exactly the 90-day deadline.
  - If a send failed for days and the notice goes out late, the date it states is the real date: today plus
    `ORPHAN_NOTICE_DAYS`.
  - "Proceeds whether or not the offer was taken" means a download never postpones anything.
- **Objects before rows** (AD-32): `drainPrefix(site-snapshots, '{userId}/{siteId}/')`, then the row. A failed drain leaves
  the row, counts as failed and is due again tomorrow.
- **A reconnected site is never touched.** Just before the drain, the site's `disconnected_at` is read again. If it is
  null, or differs from the value read at the start, the theme is skipped. A later disconnect restarts the clock, and its
  notice is owed again.
- **An account waiting to be deleted is skipped** (`profiles.deleted_at is not null`). FR-A5's purge owns it, and the date
  in its deletion email stands.
- **The door:** `authorized()` from `lib/cron-auth.ts` runs before any read. The job answers 500 if anything failed (Vercel
  neither retries nor alerts). Logs carry ids, steps and codes, never an address, key, title or theme name.
- **The notice is claimed before it is sent,** never sent twice:
  1. Compare-and-set `orphan_notice_at` from the value read to now.
  2. Send.
  3. If the send fails, put the old value back.
  4. The address comes from GoTrue's admin API, as `server/site-health.ts`'s `notify` reads it.
- **Every word lives in one object** in `lib/orphan-rule.ts` (R-170). No digit appears in it: the days are passed in from
  the two constants (standing rule 4). The thing is called **"original theme"**, the name `/restore` and the deletion email
  already use.
- The page reads through the caller's own session; RLS scopes it (`site_snapshots_owner_read`). Only the cron route uses
  the service role.

**Ask First:**
- Anything on production or T1 outside the harness's own fixtures, and the Schema apply. Each needs an in-session go from
  the owner (R-99, R-82), run in the main session, never through a subagent.
- Anything that would add a deletion path beyond AD-29's five. This job is one of the five, built where AD-33 puts it.
- Any change to R-285's notice: one email, two weeks before the deadline.

**Never:**
- No notification-bell row: the bell is E13's. No new enum value. No GoTrue template for the email.
- No signed Storage URL in an email. AD-13's URLs are short-lived, so the email links to the app.
- No change to S11a's site cards (DW-57's layout).
- No change to the disconnect confirm's words: the list appears on the page the disconnect lands on.
- No edit to an applied migration. `20260907150000`'s prose about the 90 days stays as written.
- Never delete a connected site's original theme, and never touch the `sites` row.

## I/O & Edge-Case Matrix

*N* = `ORPHAN_SNAPSHOT_DAYS`, *n* = `ORPHAN_NOTICE_DAYS`. The rows are R-285's (option 1).

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Not yet due | site disconnected < N−n days | Nothing sent or deleted. The Sites list shows it with its date. | — |
| Notice due | disconnected ≥ N−n days, no notice since the disconnect | One email naming the site, the theme and the date. `orphan_notice_at` is stamped. | Send refused or no address: the claim is put back, `failed`+1, the job answers 500, and the notice is owed again tomorrow. |
| Notice late | deadline passed, no notice since the disconnect | The email goes now, dated today + n. Nothing is deleted. | as above |
| Purge due | deadline passed, notice sent ≥ n days ago | Objects drained, then the row deleted. Gone from the Sites list. | Drain refused: the row stays, `failed`+1, the job answers 500, due again tomorrow. |
| Object already gone | purge due, prefix empty | The drain removes 0, then the row is deleted. | — |
| Reconnected | `disconnected_at` null (or changed) at the re-read | Skipped, untouched. | — |
| Disconnected again | a new `disconnected_at` later than the old notice | The clock restarts. The old notice no longer counts, and a new one is owed at the new date. | — |
| Account deleting | `profiles.deleted_at` set | Neither notice nor purge. | — |
| Bad door | no or wrong bearer, or `CRON_SECRET` unset | 401 before any read. | — |
| Page read fails | the originals read errors | The section is absent and the failure logged. The cards are unaffected. | — |
| Stale Download | a purged theme's link pressed | The download route's existing 404. | — |

</frozen-after-approval>

## Code Map

- `apps/web/app/api/cron/purge-accounts/route.ts` · `purge-rule.ts` -- **the pattern to copy**:
  - a thin route that builds the deps from `supabaseAdmin()`;
  - a pure loop (`runPurge`) over an interface, driven by `node --test`;
  - `dynamic = 'force-dynamic'`, `maxDuration = 300`, `BUDGET_MS`;
  - `failure(step, error)`;
  - `{ … }` answered with 500 when anything failed.
- `apps/web/lib/storage-drain.ts` -- `drainPrefix(bucket, prefix)` refuses an empty prefix and throws with `step: 'objects'`.
  Its header already names this story as a caller.
- `apps/web/lib/cron-auth.ts` -- `authorized(header, secret)`, fail-closed.
- `apps/web/app/(app)/app/(authed)/account/deletion-rule.ts:72-93` -- `deadlineLabel` (UTC, "Jan 24, 2027"),
  `SNAPSHOT_BUCKET`, `snapshotObjectKey`.
- `apps/web/server/snapshot.ts:148` -- the object key is `{userId}/{siteId}/{stamp}-{name}.zip`, so a site's prefix is
  `{userId}/{siteId}/`.
- `apps/web/lib/connect-rule.ts:268-276` -- `ORPHAN_SNAPSHOT_DAYS = 90` and its docblock, which says the job is 7.20b's. Also
  `KEYS.movedDomains(days)`, the shape this story's words follow, and the digit/spelled-number sweeps in
  `connect-rule.test.ts:234-272`.
- `apps/web/connect-rule.test.ts:704-747` -- DW-79's agreement test. Today it reads `disconnected_at + interval 'N days'`
  out of every migration, comments included. **It is rewritten** (Task 9).
- `apps/web/lib/email.ts` -- `sendEmail` never throws and answers `{ ok, status }`. `lib/email-shell.ts`'s `emailShell`
  and `escape`. `lib/health-email.ts` is the closest email: one site, one date, one button, "only email" note.
- `apps/web/server/site-health.ts:310-340` -- `notify`: the address from `auth.admin.getUserById`, the
  `https://${APP}…` link (`APP` from `@/routing`), and the log shape.
- `apps/web/app/(app)/app/restore/page.tsx:97-125` -- **the row this story's section reuses**:
  - the "Your original themes" h2 (`text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft`);
  - the helper caption;
  - per row, the mono theme name, the "site · …" caption, and a Download link drawn with `buttonClasses('secondary', 32)`
    to `/snapshots/{id}/download`.
- `apps/web/app/(app)/app/snapshots/[id]/download/route.ts` -- the RLS-scoped 303 to a 60-second signed URL. It is reused
  unchanged.
- `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx`:
  - `:183-217` is the one `Promise.all` of reads, and the originals read joins it;
  - `:253-262` is `sitesScreen`'s four screens (`unread` returns early);
  - `:266-312` is the empty screen;
  - `:313-` is the list and `noMatch`.

  The header records every departure from S11a, and this section is one.
- `apps/web/vercel.json` -- `crons` (03:15 and 05:40 are taken). `apps/web/purge.test.ts:340-370` --
  `CRON_CONSTANTS` and the check that every scheduled path is a constant with a `route.ts`.
- `apps/web/server-wiring.test.ts:174-186` -- the `supabaseAdmin()` allowed list (`PURGE_ROUTE`, `HEALTH_ROUTE`, …).
- `supabase/migrations/20261027120000_backup_gate.sql:31-32` -- the `hosted_by_ghost` comment DW-390 corrects. Applied;
  never edited.
- `…/architecture-Inflozo-2026-08-19/SCHEMA.sql:186-197` (sites' 7.20a columns and comments) and `:221-237`
  (`site_snapshots`). Grants: `site_snapshots` is table-wide select for `authenticated`, no write (`:1214-1224`), so a new
  column is readable and unwritable with no new grant.
- `supabase/tests/rls.sql:3128-3170` (= `RLS-TEST.sql`, byte-identical; `run-rls-gate.sh` refuses drift) -- 7.20a's block.
  Its `like '%hostSettings%null = not yet probed%'` must follow the new comment.
- `tools/probe/run-verify-account-purge.py` -- **the harness pattern**:
  - `--check` for the plumbing;
  - seeds fixtures through the service key;
  - refuses to press unless the route's due set is exactly its fixture;
  - calls the deployed route with `CRON_SECRET`, with a 401 control;
  - cleans up.

  `tools/probe/run-verify-site-health.py` is the email half: the fixture address shape, and the app's own email composed in
  Node.
- `tools/probe/run-verify-editor.cjs` -- the deployed walk. Step 117 is 7.20a's last. Its plant-through-the-service-key
  helpers are at `:12400-12660`.

## Tasks & Acceptance

**Dev gate.** Question 1 is ruled (option 1, R-285). The Schema push is made first, green, and applied to production on the
owner's in-session go (R-99), before any code that reads `orphan_notice_at` is pushed.

**Execution — the `Schema` push (alone, first; R-99):**
- [x] `supabase/migrations/20261028120000_snapshot_orphans.sql` -- re-runnable. It holds:
  - `alter table public.site_snapshots add column if not exists orphan_notice_at timestamptz`;
  - a `comment on column` saying that column records when FR-C6's notice was last sent, that it is compared against
    `sites.disconnected_at`, and that only the purge job writes it;
  - DW-390's `comment on column public.sites.hosted_by_ghost`, saying it is whether Ghost's public config carries
    `hostSettings`, that it names the Backup step's sub line alone, and that null means not yet probed;
  - a header saying no new grant is needed and why.
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the column in
  `site_snapshots` and both comments. The gate diffs them.
- [x] `…/RLS-TEST.sql`, copied byte-identical to `supabase/tests/rls.sql`:
  - 7.20a's `hosted_by_ghost` check matches the new comment (`%hostSettings%sub line%null = not yet probed%`);
  - a **7.20b block** checks the column's type, that it is nullable with no default, and its comment;
  - in the same block, the tenant reads its own row's column and not another tenant's, and its update of it is refused
    (42501);
  - with the migration withheld, the block aborts at its first check (the control).

**Execution — `Dev`:**
- [x] `apps/web/lib/orphan-rule.ts` -- new, pure (no Next, no Supabase import):
  - the constants: `ORPHAN_NOTICE_DAYS = 14`, `CRON_PATH = '/api/cron/purge-snapshots'`, `BATCH`, `BUDGET_MS`;
  - the dates: `orphanDeadline(disconnectedAt)` (from `ORPHAN_SNAPSHOT_DAYS`) and `purgeDateOf({ disconnectedAt, noticeAt })`
    (the later of the deadline and notice + n);
  - `decide(row, now)`, answering `'wait' | 'notice' | 'purge'` from "Ruled values";
  - `ORPHANS`, every word of the section and the email (Design Notes);
  - `runOrphans(deps, log, now)`, the loop in `runPurge`'s shape. Each theme is its own `try`:
    - for a notice: claim, address, send, and unclaim on failure;
    - for a purge: re-read, drain, delete row;
    - it answers `{ noticed, purged, failed }`.
- [x] `apps/web/lib/orphan-email.ts` -- new. `orphanEmail({ site, theme, date, disconnected, url })` on `emailShell`; the site
  and theme are escaped in the HTML, and a plain `text` part is built too. Pure.
- [x] `apps/web/app/api/cron/purge-snapshots/route.ts` -- new. The owning epic (E7, AD-33, FR-C6) is named in its header.
  - The door comes first.
  - Then one inner-joined read, oldest first: the `site_snapshots` rows whose site was disconnected at least N−n days ago,
    with their `sites(title, url, disconnected_at)`.
  - Then `profiles.deleted_at` for those users.
  - The deps are built from `supabaseAdmin()`: `getUserById`, compare-and-set on `orphan_notice_at`, the
    `disconnected_at` re-read, `drainPrefix`, and a row delete by id.
  - It answers JSON with 500 when anything failed.
- [x] `apps/web/vercel.json` -- `{ "path": "/api/cron/purge-snapshots", "schedule": "30 4 * * *" }`.
- [x] `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx` -- the originals read (the caller's session; the
  disconnected sites' rows with `sites!inner(title, url, disconnected_at)`) joins the `Promise.all`.
  - **"Original themes from disconnected sites"** is drawn after the cards (list and `noMatch`) and under the empty
    screen's Connect button, with the id `original-themes`. It is shown only when there is at least one row.
  - The rows are newest disconnect first. Each is the /restore row with the caption "{site} · deleted on {date}"
    (`purgeDateOf`).
  - The header records this departure from S11a and from UX-DR6's "the connect card is the whole page".
- [x] `apps/web/lib/connect-rule.ts` -- `ORPHAN_SNAPSHOT_DAYS`'s docblock says the job now reads it. The value is unchanged.
  `apps/web/lib/storage-drain.ts`' header says the second caller is built.
- [x] `apps/web/orphans.test.ts` -- new. It holds:
  - every I/O row through `decide` and `runOrphans` with stubs, the call order logged (drain before delete; claim before
    send; unclaim after a failed send);
  - a failure that never stops the rest;
  - an account waiting to be deleted is skipped;
  - the re-read skip;
  - the late-notice date;
  - `ORPHANS` holding no digit or spelled number (the sweep `connect-rule.test.ts` uses);
  - the email escaping a hostile site title and naming the date.

  Each new assertion is seen red against a planted reversion.
- [x] `apps/web/connect-rule.test.ts` -- DW-79's test now asserts:
  - (a) `orphanDeadline(t) − t` is `ORPHAN_SNAPSHOT_DAYS` days;
  - (b) no migration's executable SQL computes the orphan clock (`--` comments stripped, `disconnected_at\s*\+\s*interval`
    absent);
  - (c) as the control, the regex does find it in the applied migration's comment before stripping.
- [x] `apps/web/purge.test.ts` (`CRON_CONSTANTS` gains `purge-snapshots (Epic 7, Story 7.20b)`) ·
  `apps/web/server-wiring.test.ts` (the route joins `allowed`, with its reason).
- [x] `tools/probe/run-verify-snapshot-orphans.py` -- new, in `run-verify-account-purge.py`'s shape. It has three modes:
  - `--check`, which runs offline;
  - the full run (Review, Deploy), which seeds one fixture user with four disconnected sites and their objects and rows:
    one not yet due, one notice due, one purge due with the notice n+1 days old, and one reconnected control. It refuses
    unless the due set is exactly the fixture. It runs a 401 control, calls the route, asserts each outcome off the wire
    and in Storage, and cleans up;
  - `--owner-test <alias>`, which plants the owner's three sites (below) and runs the route once.

  It needs a row in `tools/doc-audit.py`'s catalogue.
- [x] `tools/probe/run-verify-editor.cjs` -- **walk step 118** on production, with planted rows read back:
  - the section at 1440 and 390, with each row's words and date;
  - Tab reaches each Download, and its 303 leads to a zip;
  - the section is absent with no orphan, and on the list screen sits after the cards.
- [x] Propagation (standing rule 3). R-285 already reached the register, `prd.md` FR-P1 (9) and FR-C6, and `epics.md`'s
  card at the Create. Dev adds:
  - the spine's AD-33 says it is built at its path;
  - `EXPERIENCE.md`'s Sites row names the section;
  - R-285's ⬜ target ticked in the register;
  - `deferred-work.md` closes DW-75, DW-79 and DW-390;
  - `epic-7-context.md` gets a sub-bullet;
  - finish with a grep for `Story 7.20's`, `7.20b's (DW-75)` and `both paths offered`.

**Acceptance Criteria:**
- Given the deployed app, when Vercel's project is read, then it schedules `/api/cron/purge-snapshots` daily. A call without
  `CRON_SECRET` is 401, and a call with it answers `{ noticed, purged, failed }`.
- Given a planted notice-due theme on production, when the job runs, then exactly one email arrives with the site, the theme,
  the date and the button, and a second run sends nothing.
- Given a planted purge-due theme on production, when the job runs, then its `{userId}/{siteId}/` prefix lists empty and its
  row is gone. The not-yet-due theme and the reconnected control are byte-identical.
- **Matches the frame (R-74).** Given an account with a disconnected site's saved theme, when `/sites` renders, then the
  section is drawn only from S11a's page tokens and /restore's row: the same h2, caption, mono name and secondary-32
  Download. No S11a card moves. The email is `emailShell`'s, as the other two app emails are.
- **R-98.** Given the section, when Download is pressed, then the browser follows a link to the route's 303, as on
  `/restore`. No work starts in the app, so no busy label is owed. `/sites` keeps its own `loading.tsx`, unchanged: the
  section may be absent, so the skeleton does not draw it, and `busy.test.ts` stays green.
- Given R-285, when the job runs, then a disconnected site's owner gets exactly one email per disconnect,
  `ORPHAN_NOTICE_DAYS` before the deadline. The theme is never deleted before that email has gone out, nor sooner than
  `ORPHAN_NOTICE_DAYS` after it.

### Review Findings

Five layers: the Blind Hunter, the Edge Case Hunter, the Verification Gap reviewer and the Acceptance Auditor as subagents;
the Real-infra verifier's read-only half as a subagent, and every production write (the harness, the walk) in the main
session. One decision for the owner (Question 2), 14 patches (all applied), 4 deferred (DW-392 to DW-395), 12 dismissed.
Among the dismissed:
- the purge draining `{userId}/{siteId}/` rather than the row's `storage_path`: `server/snapshot.ts:163` writes every key
  under that prefix by construction, and `rls.sql`'s fixture path is SQL-only;
- the email's button losing `#original-themes` through sign-in: the spec's own Design Note, and the owner's test step 5
  walks it;
- the copy's "reconnect" with no link beside it: Connect site is on the same page, and `connectSite` re-adopts the
  record by its URL (`actions.ts:279`, `KEPT`);
- the "deleted on" date of a theme whose purge failed reading as past: a failure path the job answers 500 for;
- a CR/LF site title in the subject: the health email's subject carries the title the same way;
- the RLS gate not reading the page's `sites!inner` embed through a session: walk step 118 does, on production;
- the counts in comments ("the TWELFTH", "AD-29's five"): the file's own ordinal convention and the spec's own words;
- `lib/` importing `deadlineLabel` from `account/deletion-rule.ts`: where the Code Map put the one home;
- FR-C6's "proceeds on its deadline": the same sentence carries R-285's amendment;
- DW-75/79 closed at Dev: this Review runs the proof;
- `sprint-status.yaml` at `in-progress`: the board reads the phase from `git log`;
- the plain-text footer literal: `health-email.ts`' own.

- [x] [Review][Decision] When Inflozo cannot tell whether the one warning email went out (a function killed between the
  claim and the send, or a send that timed out after Resend took it), it guesses one way in each case: the first counts as
  sent, so the theme can go with no email; the second as not sent, so the "only" email can go twice. "The notice is never
  skipped" and "claimed before it is sent, never twice" pull apart only there, and the notice is "Ask First", so it is the
  owner's (Question 2) [`lib/orphan-rule.ts` `runOrphans`] — **ruled option 1, keep it as built (R-286, owner,
  2026-11-24)**: the code is unchanged, the rule is written beside it
- [x] [Review][Patch] The email went a day late and named a date a day past the deadline for every disconnect after 04:30
  UTC: `decide` compared exact instants while the job runs once a day, so R-285's own example (16 Jan → "Jan 30") came out
  17 Jan → "Jan 31", and the Sites row's date moved when the email went. The notice is now owed from the start of the
  deadline's UTC day − n (`noticeFrom`), `dueSince` reaches back to that day's start, and a test walks five times of day
  through the daily run (seen red against the old threshold) [`lib/orphan-rule.ts` · `orphans.test.ts`]
- [x] [Review][Patch] The route named the site with its own copy of "title, else host"; one `siteLabel` now serves the Sites
  row and the email (R-170) [`lib/orphan-rule.ts` · `app/api/cron/purge-snapshots/route.ts`]
- [x] [Review][Patch] Every row's link read "Download" alone to a screen reader's list of links; each is now described by
  its row (WCAG 2.4.4), on Sites and on the `/restore` row it reuses [`sites/(list)/page.tsx` · `app/restore/page.tsx`]
- [x] [Review][Patch] No test ran past one batch, a throwing claim, or a put-back that itself fails; three tests now do
  [`orphans.test.ts`]
- [x] [Review][Patch] DW-79's test let the usual due-query shape (`disconnected_at <= now() - interval …`) through, and
  nothing proved the comment stripper keeps executable SQL; the pattern now matches either order in one statement, with
  the stripper's own control [`connect-rule.test.ts`]
- [x] [Review][Patch] The harness never ran a claim from a stale notice, an account waiting to be deleted, the
  compare-and-set's put-back, or read back the email Resend received; fixtures S and D and the `claims` and `delivered`
  steps do [`tools/probe/run-verify-snapshot-orphans.py`]
- [x] [Review][Patch] The harness's "once a day" check passed `* * * * *` [`run-verify-snapshot-orphans.py` `offline`]
- [x] [Review][Patch] The harness's W fixture (one day short of its notice day) could be owed in the first hour of a UTC
  day under `noticeFrom`; it is two days short [`run-verify-snapshot-orphans.py`]
- [x] [Review][Patch] `--owner-test` planted orphan-a at 80 days, so the owner's one email was a LATE notice naming
  disconnect + 94 days beside "keeps it for 90 days"; A is now planted on time (the last second of the UTC day 76 days ago)
  [`run-verify-snapshot-orphans.py` `owner_test` · Owner's manual test]
- [x] [Review][Patch] `--owner-test` left a half-planted alias behind on a failed plant, which its `fresh` guard then
  refused for ever; it takes back what it put [`run-verify-snapshot-orphans.py` `owner_test`]
- [x] [Review][Patch] The harness's docstring carried the owner's address, claimed `noticed` counts only a send with an id
  (it counts Resend's 2xx), and never said a full run refuses once a real theme is due [`run-verify-snapshot-orphans.py`]
- [x] [Review][Patch] The Owner's manual test listed orphan-a before ghost6; the section is newest disconnect first
  [Owner's manual test, step 2]
- [x] [Review][Patch] The epics.md card still said the notice's form was the Create's question [`epics.md` Story 7.20b]
- [x] [Review][Patch] Two harness docstrings said the app host answers a cron path with a 404; signed out it is the authed
  layout's 307 to `/sign-in`, and Vercel's schedule calls the deployment's own host (the Real-infra verifier, read on
  production) [`run-verify-snapshot-orphans.py` · `run-verify-site-health.py`]
- [x] [Review][Defer] A notice that can never be delivered keeps its theme and answers 500 every day [`lib/orphan-rule.ts`
  `runOrphans`] — deferred, DW-392 (R-285: the purge waits for the email)
- [x] [Review][Defer] Every tried id rides the due query's URL; a few hundred noticed themes waiting out their window
  outgrow it [`route.ts` `due`] — deferred, DW-393 (marked `ponytail:`)
- [x] [Review][Defer] A site reconnected in the seconds between the due read and its notice still gets the email
  [`lib/orphan-rule.ts` `runOrphans`] — deferred, DW-394
- [x] [Review][Defer] A late notice says "keeps it for 90 days, so on {a later date}" [`ORPHANS.emailBody`, `.caption`] —
  deferred, DW-395

## Spec Change Log

**Review (2026-11-24) — one reading of the frozen I/O matrix, told in one line.** Its "disconnected ≥ N−n days" is read
at the job's own granularity, the UTC day: the notice is owed from the start of the deadline's day − n (`noticeFrom`), so
the on-time email goes on R-285's ruled day and names the deadline's day. Nothing is ever deleted sooner: the purge still
waits for the exact deadline and the notice's full `ORPHAN_NOTICE_DAYS`, so it lands on that day's 04:30 UTC run or the
next, as FR-A5's does.

## Design Notes

**Ruled values — the one table Question 1 set.** Dev builds option 1, ruled by the owner on 2026-10-27 (R-285). The other
rows are kept as the record of what was declined.

| Option | Emails | `orphan_notice_at` | Deleted when |
|---|---|---|---|
| **1 (ruled, R-285)** | one, from deadline − n | the send | the later of the deadline and notice + n |
| 2 | one, at the first run after the disconnect (the horizon becomes 0 days) | the send | as 1 (on time, simply the deadline) |
| 3 | none. The Sites list is the notice, from the moment of disconnect | dropped from the Schema push | the deadline |
| 4 | two: the first run after the disconnect, and from deadline − n | the latest send | as 1, counted from the second |

FR-P1 gains its ninth email (`prd.md`, written with the ruling). Under option 4 one column is enough: the second notice is owed when
`now ≥ deadline − n` and the latest notice is older than `deadline − n`.

**Why a column, not `download_offered_at`.** `request_account_deletion()` already stamps that column for FR-A5. Sharing it
would let an account deletion silently count as the 90-day notice. That is DW-43's lesson (one column, one meaning).

**Words** (`ORPHANS`; `{days}` from the constants, `{date}` from `deadlineLabel(purgeDateOf(…))`):
- **Section heading:** "Original themes from disconnected sites".
- **Section caption:** "The theme each of these sites had before Inflozo. Inflozo keeps it for {days} days after you
  disconnect, then deletes it. Reconnect a site to keep its theme."
- **Row:** "{theme}" (mono; "Original theme" when unnamed), then "{site} · deleted on {date}", then **Download**.
- **Email subject:** "Your original theme from {site} will be deleted on {date}".
- **Email preheader:** "Download it from Inflozo before {date}."
- **Email heading:** "Your original theme from {site} will be deleted on {date}".
- **Email body:**
  - "When {site} was disconnected from Inflozo on {disconnected}, Inflozo kept the theme it had before Inflozo, {theme}.
    It keeps it for {days} days, so on {date} it will be permanently deleted."
  - "Want to keep it? Download it from your Sites page, or reconnect {site} before then and Inflozo keeps it."
- **Email button:** "Download it from Sites", linking to `https://app.inflozo.com/sites#original-themes`.
- **Email note:** "This is the only email we'll send about this.", the sentence the other two app emails end on (one
  home).

**Why the email links to Sites, not to the file.** A signed Storage URL in an inbox would outlive AD-13's 60 seconds. The
download route needs a session, and sign-in lands on Projects whichever link was followed. Sites is where the file is.

## Owner's manual test

You test as **`umngkmr+orphan720b@gmail.com`**, a fresh alias. **Deploy has done all three things below (2026-11-24, on
your go):**

1. It created the alias and ran `run-verify-snapshot-orphans.py --owner-test`. That planted three disconnected sites, each
   holding a small saved theme named **casper**:

   | Site | Disconnected | What the run does to it |
   |---|---|---|
   | `orphan-a.example` | 76 days ago (the last second of that day) | Due for its warning: the run emails you, on time. |
   | `orphan-b.example` | 100 days ago, warned 15 days ago | Past its date: the run deletes it. |
   | `ghost6.inflozo.com` | 10 days ago | Not due yet. |

2. It ran the clean-up once: orphan-a's email went (Resend: delivered, 13:07 UTC), orphan-b's theme was deleted, and
   ghost6's was left alone.
3. The two dates: **A's date = Dec 8, 2026** (orphan-a was disconnected on Sep 9, 2026) and **ghost6's date = Feb 12,
   2027**.

In **ghost6.inflozo.com's Ghost Admin** (`https://ghost6.inflozo.com/ghost/`), make a custom integration called **Owner test
7.20b** and keep its Admin API key and Content API key open.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the alias and open the link in your inbox. | `umngkmr+orphan720b@gmail.com` | Inflozo's first-run screen (the alias has no project). |
| 2 | `https://app.inflozo.com/sites` | Sites | Look under **Connect site**. | — | The empty Sites screen. Under it, **"ORIGINAL THEMES FROM DISCONNECTED SITES"** and the line "…keeps it for 90 days after you disconnect, then deletes it. Reconnect a site to keep its theme." Then two rows, newest disconnect first: **casper** · ghost6.inflozo.com · deleted on **Feb 12, 2027**, and **casper** · orphan-a.example · deleted on **Dec 8, 2026**, each with **Download**. **orphan-b.example is not there.** |
| 3 | `https://app.inflozo.com/sites` | Sites | Press **Download** on orphan-a's row. | — | A file **orphan-a.example-casper.zip** downloads. |
| 4 | `https://mail.google.com/` (the inbox `umngkmr+orphan720b@gmail.com` lands in) | Email | Open the email from Inflozo. | — | Exactly one email about this: **"Your original theme from orphan-a.example will be deleted on Dec 8, 2026"**. It names casper and the day it was disconnected (**Sep 9, 2026**), has a **Download it from Sites** button, and ends "This is the only email we'll send about this." Nothing about ghost6 or orphan-b. |
| 5 | the email's button → `https://app.inflozo.com/sites#original-themes` | Sites | Press **Download it from Sites**. | — | Inflozo opens, after sign-in if asked; if it lands elsewhere, open **Sites**. The same two rows as step 2. |
| 6 | `https://app.inflozo.com/sites` | Sites | Press **Connect site** and finish the wizard with the integration's two keys. | `https://ghost6.inflozo.com` + the two keys | ghost6 is **Connected**. The list now shows **only orphan-a**: ghost6's theme stays because the site is connected again. |
| 7 | `https://app.inflozo.com/sites` | Sites | On ghost6's card, **⋯ → Disconnect**, then confirm. | — | ghost6's card goes. The list shows ghost6 again, now **deleted on a date 90 days from the day you disconnect** (Feb 22, 2027 if that is Nov 24). |
| 8 | `https://ghost6.inflozo.com/ghost/` | Cleanup | Delete the **Owner test 7.20b** integration. | — | Done. Leave the alias: its two themes delete themselves on their dates. |

## Questions for the owner

Question 1 was ruled on 2026-10-27, option 1 (R-285). "Ruled values" in Design Notes holds what it set. Question 2, from
the Review, was ruled on 2026-11-24, option 1 (R-286). None is open.

### Question 1 — How and when do we warn someone before a disconnected site's original theme is deleted?

**In plain English.** When you disconnect a site, Inflozo keeps the theme it saved from that site (Story 7.20a's "original")
for 90 days, then deletes it. The rules say you must be warned first and offered a download, but not how or when. **In every
option below, your Sites page lists each kept theme with its deletion date and a Download button, from the moment you
disconnect until it is deleted.** The options differ only in email. Inflozo's plan says it sends "exactly eight" emails
today; any email here is a new one. It is sent once per disconnect, never repeated, so it is not the "nudge" kind the plan
forbids.

**An example.** You disconnect `blog.example.com` on **1 November**. Its original theme, **Casper**, will be deleted on
**30 January**. From 1 November your Sites page shows "casper · blog.example.com · deleted on Jan 30, 2027 · Download".
- Option 1: on **16 January** you get one email: "Your original theme from blog.example.com will be deleted on Jan 30,
  2027".
- Option 2: you get that email on **1 November** instead, and nothing later.
- Option 3: no email.
- Option 4: both emails.

1. **(RECOMMENDED) One email, two weeks before the deletion.** It arrives when it matters, even if you never sign in again
   after disconnecting. This makes nine emails.
2. **One email on the day you disconnect.** Also nine emails. But three months later it is easy to have forgotten it.
3. **No email, the Sites page only.** Still eight emails. But someone who disconnects and never signs in again loses the
   theme without hearing about it.
4. **Two emails, on the day you disconnect and two weeks before.** The most warning, and ten emails.

**Ruled: option 1 (owner, 2026-10-27) — R-285.** *"1"* — one email, two weeks before the deletion.

### Question 2 — If Inflozo can't tell whether the warning email went out, which mistake should it risk?

**In plain English.** Inflozo writes down "warning sent" a moment before it hands the email to the email service, so two
nightly runs can never both send it. Very rarely it cannot be sure the email went: Inflozo crashes in that moment, or the
email service takes the email but answers too slowly. Today it guesses one way for each:
- **A crash in that moment counts as sent.** No email goes, and the theme is deleted two weeks later anyway. The Sites page
  still showed it with its date the whole time.
- **A slow answer counts as not sent.** The next night sends it again, so you get the "only email we'll send about this"
  twice.

Both need a failure in the same second as the send.

**An example.** `blog.example.com`'s theme is due to go on **Jan 30**. On **Jan 16** Inflozo notes the warning as sent.
- If it crashes before the email leaves, you get no email, and Casper is deleted on Jan 30.
- If the email service is slow to answer, you get the email on Jan 16 and again on Jan 17.

1. **(RECOMMENDED) Keep it as built.** Both cases are very rare. The Sites page lists the theme and its date from the day you
   disconnect, so the email is not the only warning. The slow answer is logged, and the job reports a failure that night.
2. **Never delete without proof the email went.** Inflozo keeps the email service's receipt in a new database column and
   deletes only a theme whose warning has one. A warning without a receipt is sent again, so a second email stays possible
   in the rare case. This needs a database change and about a day's work.
3. **Never send twice.** A slow answer counts as sent too. The duplicate goes, but in that rare case a theme can also be
   deleted with no email.

**Ruled: option 1 (owner, 2026-11-24) — R-286.** *"1 (RECOMMENDED) Keep it as built. Both need a failure in the same
second as the send, and the Sites page is a second warning."*

## Verification

R-82's real services for this story:
- production's **Supabase**:
  - the migration, applied through `SUPABASE_DB_POOLER_URL` on the owner's in-session go and read back;
  - the `site-snapshots` bucket, seeded, drained and listed;
- **Vercel** (`app.inflozo.com`): the cron's schedule and the route;
- **Resend**: the notice really sent.

T1 is touched only by the owner's own reconnect, which is a read.

**Commands:**
- `bash supabase/tests/run-rls-gate.sh` -- expected: green, with the 7.20b block's PASS line and 7.20a's on the new comment.
  On a scratch copy without the migration, it aborts at the 7.20b block's first check.
- Production, after the apply -- expected:
  - `information_schema.columns` shows `site_snapshots.orphan_notice_at` (`timestamp with time zone`, nullable, no
    default);
  - `col_description` shows its comment, and `hosted_by_ghost`'s new one.
- `pnpm check` -- expected: green, with the new `orphans` cases and the rewritten DW-79 test among the package's own printed
  count.
- `python3 tools/probe/run-verify-snapshot-orphans.py --check`, then the full run against the deployment -- expected: every
  step PASS:
  - the 401 control;
  - the due set equals the fixture;
  - one email (Resend's id logged by the route);
  - `orphan_notice_at` stamped;
  - the purge-due prefix empty and its row gone;
  - the not-due and reconnected fixtures unchanged;
  - a second call noticing and purging nothing;
  - the cleanup.
- Vercel's project crons, read with `VERCEL_TOKEN` -- expected: `/api/cron/purge-snapshots` at `30 4 * * *` beside the two
  existing ones.
- `node tools/probe/run-verify-editor.cjs` from a clean worktree at the deployed sha -- expected: step 118 PASS, and steps
  113–117 unchanged.
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.

**Executed — Dev (2026-11-24 IST, Node 24; the real services by their variable names, no value printed):**
- **Supabase (local gate):** `bash supabase/tests/run-rls-gate.sh` — green. The 7.20b block printed six PASS lines:
  - the column is a nullable timestamptz with no default, commented, and the client cannot write it;
  - the service role records a notice;
  - the tenant reads its own `orphan_notice_at` and not another tenant's;
  - the tenant's update is refused (42501);
  - the other tenant sees none of it, and reads its own notice (the control);
  - the refused write changed nothing.

  7.20a's `hosted_by_ghost` check passes on the new comment. **Controls**, on scratch copies:
  - (a) the 7.20b migration withheld, with HEAD's `SCHEMA.sql`: exit 3 at `FAIL (7.20a): sites.hosted_by_ghost's comment does
    not name hostSettings, the sub line and the unprobed state`. That is DW-390's line, the first check to need the file.
  - (b) only the column withheld, with DW-390's comment kept: exit 3 at `FAIL (7.20b): site_snapshots.orphan_notice_at
    (timestamptz, nullable, no default) is missing`, the block's first check, right after 7.20a's last PASS.
- **GitHub CI** (`GITHUB_TOKEN`, read only), on the Schema push `de69ef1c47f19672c3bc85a9357214f4efde2a43`: CI's `rls`,
  `check` and `deploy` all ✓, and the Render matrix ✓.
- **Supabase production, the apply** (`SUPABASE_DB_POOLER_URL`, read in-process; the owner's in-session go, "1. Go"):
  - Before, as the control: no `orphan_notice_at` column, no comment for it, and `hosted_by_ghost` still carried the old
    comment.
  - Applied in one transaction.
  - Read back:
    - `information_schema.columns`: `orphan_notice_at` is `timestamp with time zone`, nullable, with no default;
    - both `col_description`s equal the file's text byte for byte;
    - `authenticated` has SELECT on the column and neither INSERT nor UPDATE;
    - `site_snapshots` holds 0 rows on production, so there is nothing to back-fill.
- **Supabase production, read only** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, read in-process; no
  write). PostgREST was handed the two new query shapes as the code builds them:
  - the cron's due read, `sites!inner(…)` with `.lte('sites.disconnected_at', since)` and `.order('sites(disconnected_at)')`,
    with and without the `not id in (…)` exclusion → 200, 0 rows each;
  - the Sites page's read, `.not('sites.disconnected_at', 'is', null)`, newest first → 200, 0 rows with the service key. With
    the publishable key it answered 401 `42501`, because anon has no grant; the page reads as the signed-in user.
  - **Control:** the same embed ordered by a column it lacks → refused, 400 `42703`. So the 200s above are PostgREST
    accepting the shapes, not a client hiding errors.

  That the filter keeps exactly the due rows is the harness's `seeded` step at Review, which runs on real rows.
- `pnpm check` (Node 24): green, 0 failed. Each package prints its own count. This includes `orphans.test.ts`, the
  rewritten DW-79 test with its control, and `purge.test.ts`/`server-wiring.test.ts`' additions.
- `python3 tools/probe/run-verify-snapshot-orphans.py --check`: every step PASS (keys by name, the app's figures and words,
  the schedule, `decide` over the fixture, the email composed and not sent). The deployed route was not called.
- `node --check tools/probe/run-verify-editor.cjs`: clean.
- `pnpm build` then `node tools/check-traces.mjs` (Node 24, CI's own two steps): green. `/api/cron/purge-snapshots` is built as
  a dynamic function (`ƒ`), and every route carries its files.
- The subagent's controls, each seen red and then restored:
  - a stale notice counting;
  - rows deleted before objects;
  - no unclaim, and no claim;
  - the purge date taken as the deadline alone;
  - a deleting account not skipped;
  - no re-read skip;
  - the run stopping at the first failure;
  - a digit in `ORPHANS`;
  - the site title not escaped;
  - the route always answering 200;
  - for DW-79, a planted SQL view and a regex that matches nothing.
- **The matrix audit (main session).** Every I/O row maps to a check that ran:

  | Row | Check |
  |---|---|
  | Not yet due | `decide — not yet due…` (wait); `the Sites rows…`; walk 118b (Review) |
  | Notice due (and its error column) | `notice due: claimed, then the address, then ONE email…`; `a refused send puts the claim back…`; `no address puts the claim back…`; `a claim another run took first…`; the route's `failed ? 500 : 200` |
  | Notice late | `notice late: the email goes now, dated today + n…`; `a late notice names the real date…` |
  | Purge due (and its error column) | `purge due: re-read, then the prefix drained, then the row`; `a refused drain leaves the row…`; walk 118d (Review) |
  | Object already gone | `purge: the object already gone — the drain removes 0…` **(added at the audit)**; `purge.test.ts`'s empty-prefix drain |
  | Reconnected | `purge: a reconnected site (null, or a different disconnect…)`; `decide`'s reconnected case |
  | Disconnected again | `decide — disconnected again…`; `the stale notice is claimed FROM its own value…` |
  | Account deleting | `an account waiting to be deleted is skipped…` |
  | Bad door | `purge.test.ts`'s `authorized` cases (the shared door); `the route: the door before any read…`; the harness's two 401 controls (Review) |
  | Page read fails | `page read fails: no section…` **(added at the audit**, with the rows lifted into `originalRows` so they run under `node --test`) |
  | Stale Download | walk **118d (added at the audit)**: a theme is purged as the job does it, object then row; the section drops it, and its Download answers the route's 404 (Review) |

  Each audit addition was seen red against a planted reversion and then restored with `cmp`:
  - the loop skipping the row delete when the drain removed 0;
  - `originalRows` keeping a connected site's theme;
  - the page's failure log deleted.
- **Judgement calls**, routine, so no question for the owner:
  - `purgeDateOf` takes an optional `now`. A theme not yet noticed then shows the date its notice will name, rather than a date
    already past.
  - A notice claimed by a function that is killed before it sends stays recorded as sent. The theme would then go after
    `ORPHAN_NOTICE_DAYS` with no email. This is the spec's claim-before-send order, chosen so an email is never sent twice; it
    is marked `ponytail:` in `runOrphans`.
  - The job runs once a day, so a purge can land on the run after the stated date. FR-A5's deletion email has the same
    property.
- **Not run at Dev, all needing the Dev push deployed:**
  - **Resend** (the one real notice);
  - the harness's full run, and its `--owner-test` (production writes, with their own in-session go);
  - **Vercel**'s cron list;
  - walk step 118.

  These belong to the Review and Deploy phases. T1 is not touched by this story's code.
- `python3 tools/doc-audit.py --check` (twice): PASS.

**Executed — Review (2026-11-24 IST, Node 24; the real services by their variable names, no value printed):**
- **The Dev head first.** `44e161f9` was green before any review layer ran: CI's `rls`, `check` and `deploy`, and the Render
  matrix (`GITHUB_TOKEN`, read in-process). Vercel served it READY (`dpl_B8dzAqkC5bkDwn3bV4xtbd81wMNJ`).
- **The Review's patches, deployed.** The first Review commit `d353e320` was green on CI's `check`, `rls` and `deploy`, and on
  the Render matrix. Vercel serves it READY as `dpl_9pov5av26Mtg9dS4SmzG2WT8jmJc`. Every run below is against that deployment.
- **`pnpm check`** (Node 24), with the patches: green, 0 failed in every package. Each prints its own count.
  - The new daily-run test went red against the old exact-instant threshold, then was restored (`cmp`).
  - DW-79's widened pattern still finds the applied migration's comment, which is its control.
  - Its stripper control keeps `disconnected_at <= now() - interval …` and drops comments.
- **The read-only real-infra layer** (a subagent; `GITHUB_TOKEN`, `VERCEL_*`, `SUPABASE_*` and `CRON_SECRET`'s length only,
  all in-process; no write):
  - **Vercel's project crons.** `/api/cron/purge-snapshots` at `30 4 * * *`, beside `purge-accounts` (`15 3`) and
    `site-health` (`40 5`), `disabledAt` null. Each cron's `host` is the deployment's `*.vercel.app` URL, which reaches the
    route as the apex does (401, `x-matched-path: /api/cron/purge-snapshots`).
  - **The door, on `https://inflozo.com/api/cron/purge-snapshots`.** No bearer → 401, `no-store`, `x-matched-path` the
    route. A wrong bearer of the same shape → the same.
  - **The door's controls.**
    - `/api/cron/no-such-job` → 404 (`/404`), so a 401 is the route's own.
    - `app.inflozo.com/api/cron/purge-snapshots` → 307 to `/sign-in` (`/app/[...unbuilt]`). That host is not the route.
      Both harness docstrings that said "a 404 there" are corrected.
  - **R-99, production's schema, through `SUPABASE_DB_POOLER_URL`** in a `read only` transaction:
    - `orphan_notice_at` is a nullable `timestamptz` with no default.
    - Both comments equal the migration's text byte for byte.
    - `authenticated` has SELECT only.
    - Every other column the code reads exists.
    - Controls: a column that does not exist reads as absent, and `service_role`'s UPDATE reads true.
  - **PostgREST.** The route's due query → 200, 0 rows; production held no theme at all, so nothing real was due. Control:
    the embed ordered by a column it lacks → 400 `42703`.
- **The harness's full run, `python3 tools/probe/run-verify-snapshot-orphans.py`, on production** (the main session, its
  own fixtures only): every step PASS.
  - **`seeded`.** The route's own due query, fifteen minutes ahead, selected exactly T, S, P and D. D's
    `profiles.deleted_at` read back set. Six prefixes listed one object each.
  - **`no-header` and `wrong-secret`.** 401 from the route (`x-matched-path`, `no-store`), with nothing moved.
  - **`run`.** HTTP 200 `{"noticed": 2, "purged": 1, "failed": 0}`, `no-store`.
  - **`noticed`.** T stamped `2026-11-24T12:06:58.686+00:00`. S moved FROM its stale `2026-08-16T12:06:28+00:00` to
    `…12:06:59.087+00:00`: a claim from a non-null value, at the route.
  - **`delivered`** (`RESEND_READ_API_KEY`). Resend holds exactly two emails for the fixture address, both
    `last_event: delivered`. Each subject and plain text equals the app's own `orphanEmail` composed from the row as
    stamped: "Your original theme from orphan-harness-…-t.example will be deleted on Dec 8, 2026", and S's.
  - **`purged`.** P's prefix lists empty (HTTP 200), and its row is gone.
  - **`untouched`.** W (not yet due), R (reconnected) and D (an account waiting to be deleted) are row-for-row the same, and
    their objects' bytes hash the same.
  - **`claims`,** the route's compare-and-set as postgrest-js sends it, on R:
    - from the value read → 1 row;
    - the same claim again → 0 rows;
    - from null → 0 rows (the control);
    - the put-back → 1 row, and R reads back exactly as it was.
  - **`idempotent`.** A second call → `{"noticed": 0, "purged": 0, "failed": 0}`, with both stamps unmoved.
  - **`cleanup`.** Users 18 → 18, no stray fixture, every prefix empty.
- **Walk step 118 on production.** `run-verify-editor.cjs`, cut to steps 1–5 + 118 and its `finally`, run from a clean
  worktree at `d353e320`. Its first line names `dpl_9pov5av26Mtg9dS4SmzG2WT8jmJc`, built from that HEAD. 50 PASS, 0 FAIL:
  - **118a.** With nothing planted, the empty screen and no section: the control.
  - **118b.**
    - At 1440, under Connect site: the heading, the caption, and newest disconnect first, each row "casper", "{site} ·
      deleted on {date}" (the app's own `purgeDateOf`) and Download.
    - Tab from Connect site reaches each Download in turn.
    - Each Download → 303 to a zip (`PK`).
    - At 390, the same rows inside the viewport with no sideways scroll.
  - **118c.** With a connected site's card, the section sits after the cards, and that site's theme is not in it.
  - **118d.** X purged object-then-row: the section lists Y alone, and X's stale Download is the route's 404.
  - Zero CSP violations, account I deleted, users and projects counted back.
  - The `/sites` read through a signed-in session (`sites!inner`, RLS) is what drew those rows.
- **Not run at Review, by design:** `--owner-test` (Deploy's, on the owner's alias with his go), and T1 (this story's code
  never touches it).

**Executed — Deploy (2026-11-24 IST, Node 24; the real services by their variable names, no value printed):**
- **Deployment: `dpl_2KraX3BWZorTHDxAo1Km1AYidA39`** (`inflozo-gmd9ixnp1-umangkagathara.vercel.app`), READY. Built from
  `ad64013c`, it serves both `app.inflozo.com` and `inflozo.com` (Vercel's `v13/deployments/{host}`, `VERCEL_TOKEN` read
  in-process). The only app change since is R-286's comment in `lib/orphan-rule.ts` (`git diff --stat ad64013c HEAD --
  apps packages`), so this deployment is the story as shipped.
- **The two pushes since, red on two keyboard-gate flakes.** Neither touched app code, so CI's `check` failed and `deploy`
  was skipped both times. Each fix is in the gate's own test:
  - **`d1924b8c` (R-286's ruling).** `floor.spec.mjs` 7.19 · the Safety net read its picture once, before the bytes landed.
    It now waits for the picture. Control: with the picture blocked, all three widths fail with the same message.
  - **`8729f8ef` (that fix).** `journey.spec.mjs` DW-241 compared the journal's count for equality, and an earlier typed
    entry synced away meanwhile (1 → 0). It now asserts no new entry; the draft's own trace (`paper` not kept) is
    unchanged.
  - Both ran green locally: 12 of 12, three repeats each.
  - This Deploy commit is the re-push. Its own CI run is read after the push.
- **The schema.** The migration was applied to production at Schema (R-99), and read back byte for byte at the Review.
  `bash supabase/tests/run-rls-gate.sh` (PostgreSQL 17 container): exit 0, and 7.20b's six PASS lines among the rest. CI's
  `rls` was green on every push of this story.
- **The owner's test plant**, `python3 tools/probe/run-verify-snapshot-orphans.py --owner-test <the alias>`, ran on the
  owner's in-session go ("1. Go"). Every step PASS:
  - the alias was created;
  - the due set was exactly A and B across production;
  - the route answered 200 `{"noticed": 1, "purged": 1, "failed": 0}`;
  - A is stamped, B's row is gone and its prefix empty, and ghost6's row is untouched;
  - the dates: **A's = Dec 8, 2026, ghost6's = Feb 12, 2027**.

  Resend (`RESEND_READ_API_KEY`, read only) holds exactly one email for the alias, `delivered` at 13:07 UTC: "Your
  original theme from orphan-a.example will be deleted on Dec 8, 2026".
- **The Owner's manual test** carries the live URL and both dates in every step. `owner_test` stays `pending`.
