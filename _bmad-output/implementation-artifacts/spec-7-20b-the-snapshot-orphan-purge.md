---
title: 'Story 7.20b — The snapshot orphan purge'
type: 'feature'
created: '2026-10-26'
status: 'ready-for-dev'
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
sent is the owner's (R-281, Question 1, open).** This spec plans option 1 (one email, two weeks before), and "Ruled values"
holds what a different answer changes.

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
- If Question 1 is ruled other than option 1, change only "Ruled values" and what it lists, then build.

**Never:**
- No notification-bell row: the bell is E13's. No new enum value. No GoTrue template for the email.
- No signed Storage URL in an email. AD-13's URLs are short-lived, so the email links to the app.
- No change to S11a's site cards (DW-57's layout).
- No change to the disconnect confirm's words: the list appears on the page the disconnect lands on.
- No edit to an applied migration. `20260907150000`'s prose about the 90 days stays as written.
- Never delete a connected site's original theme, and never touch the `sites` row.

## I/O & Edge-Case Matrix

*N* = `ORPHAN_SNAPSHOT_DAYS`, *n* = `ORPHAN_NOTICE_DAYS`. The rows are option 1's; "Ruled values" changes the notice rows.

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

**Dev gate.** Question 1 must be ruled before Dev. Then the Schema push is made, green, and applied to production on the
owner's in-session go (R-99), before any code that reads `orphan_notice_at` is pushed. A ruling other than option 1 changes
"Ruled values" first; under option 3 the column is dropped from the Schema push.

**Execution — the `Schema` push (alone, first; R-99):**
- [ ] `supabase/migrations/20261028120000_snapshot_orphans.sql` -- re-runnable. It holds:
  - `alter table public.site_snapshots add column if not exists orphan_notice_at timestamptz`;
  - a `comment on column` saying that column records when FR-C6's notice was last sent, that it is compared against
    `sites.disconnected_at`, and that only the purge job writes it;
  - DW-390's `comment on column public.sites.hosted_by_ghost`, saying it is whether Ghost's public config carries
    `hostSettings`, that it names the Backup step's sub line alone, and that null means not yet probed;
  - a header saying no new grant is needed and why.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the column in
  `site_snapshots` and both comments. The gate diffs them.
- [ ] `…/RLS-TEST.sql`, copied byte-identical to `supabase/tests/rls.sql`:
  - 7.20a's `hosted_by_ghost` check matches the new comment (`%hostSettings%sub line%null = not yet probed%`);
  - a **7.20b block** checks the column's type, that it is nullable with no default, and its comment;
  - in the same block, the tenant reads its own row's column and not another tenant's, and its update of it is refused
    (42501);
  - with the migration withheld, the block aborts at its first check (the control).

**Execution — `Dev`:**
- [ ] `apps/web/lib/orphan-rule.ts` -- new, pure (no Next, no Supabase import):
  - the constants: `ORPHAN_NOTICE_DAYS = 14`, `CRON_PATH = '/api/cron/purge-snapshots'`, `BATCH`, `BUDGET_MS`;
  - the dates: `orphanDeadline(disconnectedAt)` (from `ORPHAN_SNAPSHOT_DAYS`) and `purgeDateOf({ disconnectedAt, noticeAt })`
    (the later of the deadline and notice + n);
  - `decide(row, now)`, answering `'wait' | 'notice' | 'purge'` from "Ruled values";
  - `ORPHANS`, every word of the section and the email (Design Notes);
  - `runOrphans(deps, log, now)`, the loop in `runPurge`'s shape. Each theme is its own `try`:
    - for a notice: claim, address, send, and unclaim on failure;
    - for a purge: re-read, drain, delete row;
    - it answers `{ noticed, purged, failed }`.
- [ ] `apps/web/lib/orphan-email.ts` -- new. `orphanEmail({ site, theme, date, disconnected, url })` on `emailShell`; the site
  and theme are escaped in the HTML, and a plain `text` part is built too. Pure.
- [ ] `apps/web/app/api/cron/purge-snapshots/route.ts` -- new. The owning epic (E7, AD-33, FR-C6) is named in its header.
  - The door comes first.
  - Then one inner-joined read, oldest first: the `site_snapshots` rows whose site was disconnected at least N−n days ago,
    with their `sites(title, url, disconnected_at)`.
  - Then `profiles.deleted_at` for those users.
  - The deps are built from `supabaseAdmin()`: `getUserById`, compare-and-set on `orphan_notice_at`, the
    `disconnected_at` re-read, `drainPrefix`, and a row delete by id.
  - It answers JSON with 500 when anything failed.
- [ ] `apps/web/vercel.json` -- `{ "path": "/api/cron/purge-snapshots", "schedule": "30 4 * * *" }`.
- [ ] `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx` -- the originals read (the caller's session; the
  disconnected sites' rows with `sites!inner(title, url, disconnected_at)`) joins the `Promise.all`.
  - **"Original themes from disconnected sites"** is drawn after the cards (list and `noMatch`) and under the empty
    screen's Connect button, with the id `original-themes`. It is shown only when there is at least one row.
  - The rows are newest disconnect first. Each is the /restore row with the caption "{site} · deleted on {date}"
    (`purgeDateOf`).
  - The header records this departure from S11a and from UX-DR6's "the connect card is the whole page".
- [ ] `apps/web/lib/connect-rule.ts` -- `ORPHAN_SNAPSHOT_DAYS`'s docblock says the job now reads it. The value is unchanged.
  `apps/web/lib/storage-drain.ts`' header says the second caller is built.
- [ ] `apps/web/orphans.test.ts` -- new. It holds:
  - every I/O row through `decide` and `runOrphans` with stubs, the call order logged (drain before delete; claim before
    send; unclaim after a failed send);
  - a failure that never stops the rest;
  - an account waiting to be deleted is skipped;
  - the re-read skip;
  - the late-notice date;
  - `ORPHANS` holding no digit or spelled number (the sweep `connect-rule.test.ts` uses);
  - the email escaping a hostile site title and naming the date.

  Each new assertion is seen red against a planted reversion.
- [ ] `apps/web/connect-rule.test.ts` -- DW-79's test now asserts:
  - (a) `orphanDeadline(t) − t` is `ORPHAN_SNAPSHOT_DAYS` days;
  - (b) no migration's executable SQL computes the orphan clock (`--` comments stripped, `disconnected_at\s*\+\s*interval`
    absent);
  - (c) as the control, the regex does find it in the applied migration's comment before stripping.
- [ ] `apps/web/purge.test.ts` (`CRON_CONSTANTS` gains `purge-snapshots (Epic 7, Story 7.20b)`) ·
  `apps/web/server-wiring.test.ts` (the route joins `allowed`, with its reason).
- [ ] `tools/probe/run-verify-snapshot-orphans.py` -- new, in `run-verify-account-purge.py`'s shape. It has three modes:
  - `--check`, which runs offline;
  - the full run (Review, Deploy), which seeds one fixture user with four disconnected sites and their objects and rows:
    one not yet due, one notice due, one purge due with the notice n+1 days old, and one reconnected control. It refuses
    unless the due set is exactly the fixture. It runs a 401 control, calls the route, asserts each outcome off the wire
    and in Storage, and cleans up;
  - `--owner-test <alias>`, which plants the owner's three sites (below) and runs the route once.

  It needs a row in `tools/doc-audit.py`'s catalogue.
- [ ] `tools/probe/run-verify-editor.cjs` -- **walk step 118** on production, with planted rows read back:
  - the section at 1440 and 390, with each row's words and date;
  - Tab reaches each Download, and its 303 leads to a zip;
  - the section is absent with no orphan, and on the list screen sits after the cards.
- [ ] Propagation (standing rule 3):
  - PRD FR-P1 gains the ninth email and FR-C6 the notice's form;
  - the spine's AD-33 says it is built at its path;
  - `EXPERIENCE.md`'s Sites row names the section;
  - `epics.md`'s 7.20b card carries the ruling;
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
- Given Question 1 ruled, when Dev starts, then "Ruled values" matches the ruling and every task it names follows it.

## Spec Change Log

## Design Notes

**Ruled values — the one table Question 1 sets.** Dev builds the row the owner rules, and option 1 is planned.

| Option | Emails | `orphan_notice_at` | Deleted when |
|---|---|---|---|
| **1 (planned)** | one, from deadline − n | the send | the later of the deadline and notice + n |
| 2 | one, at the first run after the disconnect (the horizon becomes 0 days) | the send | as 1 (on time, simply the deadline) |
| 3 | none. The Sites list is the notice, from the moment of disconnect | dropped from the Schema push | the deadline |
| 4 | two: the first run after the disconnect, and from deadline − n | the latest send | as 1, counted from the second |

Under options 1, 2 and 4, FR-P1 gains a ninth email. Under option 4 one column is enough: the second notice is owed when
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

You test as **`umngkmr+orphan720b@gmail.com`**, a fresh alias. Before you start, Deploy does three things:

1. It creates the alias and runs `run-verify-snapshot-orphans.py --owner-test` on your go. That plants three disconnected
   sites, each holding a small saved theme named **casper**:

   | Site | Disconnected | What the run does to it |
   |---|---|---|
   | `orphan-a.example` | 80 days ago | Due for its warning: the run emails you. |
   | `orphan-b.example` | 100 days ago, warned 15 days ago | Past its date: the run deletes it. |
   | `ghost6.inflozo.com` | 10 days ago | Not due yet. |

2. It runs the clean-up once.
3. It writes the two dates here: **A's date = `<filled at Deploy>`** and **ghost6's date = `<filled at Deploy>`**.

In **ghost6.inflozo.com's Ghost Admin** (`https://ghost6.inflozo.com/ghost/`), make a custom integration called **Owner test
7.20b** and keep its Admin API key and Content API key open.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the alias and open the link in your inbox. | `umngkmr+orphan720b@gmail.com` | Projects (the first-run screen). |
| 2 | `https://app.inflozo.com/sites` | Sites | Look under **Connect site**. | — | The empty Sites screen. Under it, **"ORIGINAL THEMES FROM DISCONNECTED SITES"** and the line "…keeps it for 90 days after you disconnect, then deletes it. Reconnect a site to keep its theme." Then two rows: **casper** · orphan-a.example · deleted on *A's date*, and **casper** · ghost6.inflozo.com · deleted on *ghost6's date*, each with **Download**. **orphan-b.example is not there.** |
| 3 | the same page | Sites | Press **Download** on orphan-a's row. | — | A zip named for orphan-a and casper downloads. |
| 4 | your Gmail inbox | Email | Open the email from Inflozo. | — | Exactly one new email: **"Your original theme from orphan-a.example will be deleted on *A's date*"**. It names casper and the date it was disconnected, has a **Download it from Sites** button, and ends "This is the only email we'll send about this." Nothing about ghost6 or orphan-b. |
| 5 | the email | Sites | Press **Download it from Sites**. | — | Inflozo opens, after sign-in if asked; if it lands on Projects, open **Sites**. The same two rows as step 2. |
| 6 | `https://app.inflozo.com/sites` | Sites | Press **Connect site** and finish the wizard with the integration's two keys. | `https://ghost6.inflozo.com` + the two keys | ghost6 is **Connected**. The list now shows **only orphan-a**: ghost6's theme stays because the site is connected again. |
| 7 | `https://app.inflozo.com/sites` | Sites | On ghost6's card, **⋯ → Disconnect**, then confirm. | — | ghost6's card goes. The list shows ghost6 again, now **deleted on a date 90 days from today**. |
| 8 | `https://ghost6.inflozo.com/ghost/` | Cleanup | Delete the **Owner test 7.20b** integration. | — | Done. Leave the alias: its two themes delete themselves on their dates. |

## Questions for the owner

One question is open, and it is needed before Dev. "Ruled values" in Design Notes holds what it sets.

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

**Ruled:** _(awaiting the owner)_

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
