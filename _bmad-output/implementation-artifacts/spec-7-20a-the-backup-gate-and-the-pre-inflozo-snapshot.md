---
title: 'Story 7.20a — The backup gate and the pre-Inflozo snapshot'
type: 'feature'
created: '2026-10-26'
status: 'ready-for-dev'
baseline_commit: 'ad888249da79baed684a7ddff994cbcd6b7b981c'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-19-the-first-deploy-credential-step-and-its-decline-path.md', '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/BACKUP-GATE.md']
---

## In plain English

After this story, the first time you ship to a Ghost site the deploy wizard adds a **Backup** step. It tells you plainly
that Inflozo only ever writes your theme and `routes.yaml`, lists the seven things worth backing up (with a one-tick
shortcut for self-hosted sites and Download buttons for your theme and routes file), and keeps **Run checks** off until you
confirm you hold your own copy. Then, the moment before Inflozo uploads its first theme to that site, it quietly saves a
copy of the theme that is live there now — you see "Archiving your current theme first" for a few seconds — and if it
cannot (no Staff Access Token, or Ghost refuses), it tells you why and lets you add the token, ship without the copy, or
cancel.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Questions 1 and 2 were ruled by the owner (2026-10-26), each option 1: R-281 and R-282.** This is **Story 7.20a**: the
Backup step and the snapshot taken at a site's first upload. Restore-to-original moved word for word to Story 7.23, which
draws its button (D2a). FR-C6's 90-day orphan purge and DW-79 moved to Story 7.20b, straight after this one. `routes.yaml`
is offered on every connected site. "Ruled values" in Design Notes is the one table the two rulings set.

**Problem:**
- **Nothing asks for the customer's own backup.** `BACKUP-GATE.md` and EXPERIENCE F7 specify a consent gate at step 3 of a
  first deploy. D1d, D1d′ and D1e draw it. `STEPS` stops at Safety net (`lib/deploy.ts:35-44`, "Story 7.20 adds Backup
  after it").
- **Nothing archives the live theme.** `site_snapshots`, the `site-snapshots` bucket, the download route and the
  pre-purge offer have all existed since Stories 1.2 and 2.5. No product code writes a row (`run-verify-ghost-admin.py:4404`).
  The first upload (`server/deploy/run.ts:456`) replaces the site's theme with no copy taken. So FR-J13's "safe installs"
  promise, and D1b's lead, promise something nothing does.
- **Nothing knows the host.** D1d (self-hosted) and D1e (Ghost(Pro)) differ. The probe reads `hostSettings`
  (`server/site-probe.ts:103-108`) and stores nothing that says which host it is.

**Approach:**
- **A Backup step, D1d / D1d′ / D1e, after Safety net and before Check.** It shows while the site has no recorded
  confirmation (`sites.backup_confirmed_at`), so it is once per site. Disconnect clears the record, so a reconnect shows it
  again (F7).
  - **The checklist:** seven rows, the `ghost backup` shortcut on a self-hosted site, Ghost(Pro)'s block in its place there,
    and both shortcut and block on a host not yet known.
  - **The master confirm:** greyed until the last row is ticked. When it becomes available, that is announced politely
    (UX-DR12). Run checks stays greyed until the master confirm is ticked.
  - **Downloads:** the Theme row offers one when a Staff Access Token is held. `routes.yaml` offers one on every connected
    site (R-282).
- **A snapshot at the site's first upload.** In `ship()`, before the upload, a new `snapshotting` stage runs whenever no
  project of the user has uploaded to the site yet.
  - **The read:** `GET themes/` with the Staff Access Token finds the active theme. If its `package.json` carries
    `"inflozo": true`, nothing is captured. Otherwise `GET themes/{name}/download/` fetches the zip. It is stored in
    `site-snapshots/{userId}/{siteId}/…` and recorded on the site's one `site_snapshots` row (B12a).
  - **With no token:** the same list is asked with the Admin key. Ghost 5 answers 501 and Ghost 6 answers 403, and both are
    read as one code.
  - **On any failure:** the job rests before uploading anything and the wizard shows B12b. Its three actions are Add token,
    Deploy without a snapshot, and Cancel.
- **The host.** The probe, which already reads `config`, records `sites.hosted_by_ghost`: `true` when `hostSettings` is
  present, `false` when it is absent. Until a site is probed, the value is null, which is the "unknown host" state.

## Boundaries & Constraints

**Always:**
- **Frames (R-74).** Everything lives in `claude-design-export/Inflozo/`. Design Notes holds every string under "Words".
  - **D1d** (self-hosted, token given), `D1 First-Deploy Gates.dc.html:208-358`:
    - the card is 780px wide and scrolls inside the wizard's viewport;
    - the rail is `:224-236`;
    - the title and sub line are `:239-240`;
    - the "What Inflozo writes" panel is `:243-246`, followed by the lead `:248`;
    - the shortcut panel is `:250-260`, and the seven rows are `:262-342`;
    - a rule `:344` separates the rows from the master confirm `:346-349`;
    - the footer `:351-355` carries the reason, Back, and Run checks with its chevron.
  - **D1d′** (the shortcut ticked), `:360-397`. The shortcut's box ticks in coral (`#C2381F` in the frame, a
    `coral-text`-family token in the product). Each row collapses to one line ending "in the archive", the master
    confirm turns live, and the reason reads "One confirmation left."
  - **D1e** (Ghost(Pro)), `:399-533`:
    - the sky block `:430-436` and the ink line `:438` replace the shortcut;
    - Images has its Ghost(Pro) wording `:495-503`;
    - Database has no checkbox, a "—", and a grey "NOT YOURS TO TAKE" chip `:505-515`;
    - so the count excludes Database.
  - **B12a**, `B Missing Surfaces.dc.html:1044-1078`, has four rows:
    - "Reading the live theme from Ghost", with the theme's name and version as a mono chip;
    - "Writing the snapshot", with its real size;
    - "Uploading the new theme";
    - "Checking your theme (Ghost will love it)".

    The footer is "Kept outside your version limit." and Cancel.
  - **B12b**, `:1080-1102`, has:
    - the danger tile and title;
    - the body for its cause;
    - an inset with the request and Ghost's status in mono, and the place Ghost keeps the old theme;
    - the actions Add token (primary), Deploy without a snapshot (secondary), and Cancel (ghost).
  - **Tiles and glyphs.** Every tile glyph is the Kit's (`Check`, `AlertTriangle`, `InfoCircle`, `ChevronRight`). The
    Download glyph is the frame's tray-and-arrow, added to `kit/icons.tsx` as `Download`, from Tabler's outline in
    `packages/library/icons/tabler.json` (R-130's pattern).
  - **Widths.** Backup is 780px, B12a and B12b are 600px, and every other step keeps its width. Below `tablet`, each
    row's Download stacks under its text, inside the wizard's `max-w-[calc(100vw-72px)]`.
  - **No ✕** on Backup, B12a or B12b, as on D1b.
- **Ticks.** Each row and the shortcut is a native `<input type="checkbox">` inside its own `<label>`, drawn as the frame's
  18px box. `link-picker.tsx:320-327` is the app's one precedent. The Kit gains no component, because one surface needs
  this.
  - Ticking the shortcut covers every row. Unticking it returns each row to its own tick, so nothing the user ticked is
    lost.
  - Unticking any row while the master confirm is ticked also unticks the master confirm.
- **Greyed, never `disabled` (R-98, DESIGN.md:582-585).**
  - **The master confirm** is greyed while a row is owed. It gets `aria-disabled` and its reason through `greyedProps`
    (`components/kit/greyed.ts:26`), and the frame's opacity. A press does nothing.
  - **Run checks** is greyed the same way until the master confirm is ticked. The frame's native `disabled` is not
    followed.
  - **The reason line** names what remains: "{n} rows still to tick, then the confirmation above." with the singular at
    one, then "One confirmation left."
- **UX-DR12.** When the master confirm becomes available, the wizard's polite region (`useSaid`,
  `deploy-wizard.tsx:353, :1467`) says the "Confirm available" sentence once.
- **Once per site.** The step shows while Run checks would show (`full`, or R-270's refused upload) and
  `backup_confirmed_at` is null. Run checks on Backup records the confirmation, and the record is never awaited, as Not
  now's decline is not (7.19). Disconnect sets it back to null, in the same `patchSite` write that stamps `disconnected_at`
  (`sites/actions.ts:1122-1126`).
  - **This is a consent gate, not a technical control (AD-29, BACKUP-GATE.md).** The server neither enforces nor checks
    the backup.
- **The rail counts the steps that show (UX-DR19).** `stepsFor({ safety, backup })` gives:
  - Destination · Safety net · Backup · Check · Ship · Live on a first deploy with neither answered;
  - five steps where one is skipped;
  - four steps otherwise.

  Destination's button reads **Next** while Safety net or Backup is owed. D1c's Continue and a kept Add token go on to
  Backup when it is owed, and to Run checks otherwise (`afterSafety`, one function). Backup's Back returns to Destination
  with Next focused, and an answered Safety net stays ticked. A Backup confirmed in this session stays ticked and is not
  shown again on a reopen. The editor holds it, as it holds `answered`.
- **One capture rule (`server/snapshot.ts`).** The Theme row's Download and `ship()` call the same capture.
  - **The read:** `GET themes/` with the Staff Access Token, through the chokepoint (`kind: 'staff'`). The active theme is
    the entry with `active: true`. A `package[THEME_MARKER] === true` there means nothing is captured and nothing written
    (FR-J13, keyed on the marker and never on the name).
  - **The download:** `GET themes/{name}/download/` with the same token and its own read budget. The ship's worst case
    (download, store, upload, activate) must stay inside the route's `maxDuration` of 300.
  - **The write, object first:** a new object at `site-snapshots/{userId}/{siteId}/{capturedAt}-{name}.zip`, then the
    row upserted on `site_id`, setting `storage_path`, `theme_name`, `bytes` and `captured_at`. Only then is the previous
    object removed. A failed removal is logged, and the prefix drains sweep it later.
  - **What the row leaves alone:** `purge_after` and `download_offered_at`, which carry FR-A5's clock.
  - **The service role** writes both, as AD-8 and AD-32 require. The file joins both `server-wiring.test.ts` lists, with
    its reasons.
- **The snapshot's trigger is per site record.** It runs when no `project_site_bindings` row exists for the job's site,
  from any of the user's projects (FR-J13, R-278's grain). The Deploy only mode is included. It re-captures, replacing any
  earlier row, until that first binding exists. After that, no deploy captures, so a disconnect and reconnect keeps the
  original (bindings and the row both survive it). Rollback and Re-activate never capture.
- **B12a only while `snapshotting`.** It shows the rail at Ship and B12a's card. From `uploading` on, the wizard shows S8c
  as 7.18a built it. B12a's Cancel is live (`CANCELLABLE` and the `deploy_jobs_owner_cancel` policy both gain
  `snapshotting`). `ship()` reads `cancel_requested` after the capture and before the upload. Esc closes the wizard but
  not the job, as during Check.
- **A capture that does not finish uploads nothing.** The job goes back to `awaiting_ship` with the capture's answer in
  `deploy_jobs.error`: code, request and status. B12b draws that answer. **Deploy without a snapshot** posts `ship` with
  `withoutSnapshot: true`, and the server skips the capture and records `stage_timings.snapshotting = { skipped: true }`.
  **Cancel** cancels the job, as Pre-flight's Cancel does. **Add token** opens D1b's view inside the wizard, with 7.19's
  `addSafetyToken`. A kept token ships again, now capturing, and Back returns to B12b.
- **One Inflozo code for an unreadable theme list (VERIFY 9, MEASUREMENTS §15h).** With no Staff Access Token stored, the
  capture asks `GET themes/` with the Admin key, so B12b's inset prints the site's real answer. Ghost 5's 501 and Ghost 6's
  403 are both `snapshot_needs_token`, with one body sentence. A 200 there (a future Ghost lifting the allowlist) captures
  with that key.
- **B12b's place line is a link, read in both majors' admin bundles.** "Ghost keeps your previous theme under Settings →
  Design & branding, so you can put it back yourself if you need to." The link goes to `adminAt(url, 'design')`
  (`lib/paywall.ts:125`, VERIFY 75). The frame's "Settings → Design" is not Ghost's label on either major (read at this
  Create: 6.58.0's `settings-KSWWQanQ.js` has `title:\`Design & branding\``, and 5.130.6's admin-x-settings carries
  `"Design & branding"` beside `"Change theme"`). E-5's own rule moves it to a description plus a link.
- **Downloads.**
  - **Theme:** this is Story 2.5's route, `/snapshots/{id}/download` (AD-13, a 60-second signed URL). The capture returns
    the row's id, and the browser follows the route. A marked live theme answers with the "Inflozo's own" sentence and
    nothing is stored.
  - **`routes.yaml`:** read through `routes-upload.ts`' `readLive` (`:65`), with the Staff Access Token when one is stored
    and the Admin key otherwise (R-282). It is handed to the browser as a `routes.yaml` file, as B16's download is
    (`routes-fallback.tsx:75`). It is small, so it is not an artifact under AD-13.
  - **Busy and failure:** each button swaps to "Preparing…" while it works (R-98). A failure leaves its sentence under the
    row, and the row's help link stays the way forward.
- **Ghost's help, never a menu path (BACKUP-GATE.md:10-25).** Each row keeps the frame's description and links to Ghost's
  unversioned help, as resolved on 2026-10-26 ("Links" in Design Notes). The frame's `ghost.org/help/themes/` answers 404,
  so the Theme row links to Ghost's "Installing a theme" page, which says where installed themes are downloaded.
- **The host (`sites.hosted_by_ghost`).** `probeSite` writes it from the `config` body it already parses: `hostSettings`
  present means true, absent means false. An unparsed body writes nothing (`site-probe.ts:103-108`). Read in source:
  `public-config/config.js:61` puts `hostSettings: config.get('hostSettings')` in the answer, and no self-hosted default
  sets it. It is unobserved on a Ghost(Pro) site until the Ghost(Pro) launch gate. The values map to D1e when true, D1d
  when false, and the unknown-host state when null.
- **Excluded from quota, exempt from pruning, kept per site record:** all by construction. The snapshot lives in its own
  table and bucket, never in `deploys` or `deploy-artifacts`. It is keyed on `site_id` with no project key, and it survives
  project deletion, disconnect and reconnect. The RLS gate holds the project-deletion half.
- **R-82, R-238.** Dev's recorder is read-only on T1. The Review's walk writes to T1 (uploads, activations) and puts it
  back. Ghost 5's half goes to DW-326.

**Ask First:**
- Questions 1 and 2 were ruled (R-281, R-282). Dev builds them from "Ruled values".
- Applying the Schema migrations to production (R-99) is an in-session R-83 ask, then the pooler.
- Any T1 call, the read-only recorder included, needs an in-session go before the first one. The walk's writes need their
  own go, worded for the whole run.
- Any string beyond "Words".

**Never:**
- **Other stories' scope:**
  - restore-to-original and its fallback (7.23, R-281);
  - the 90-day orphan purge, its notice and DW-79 (7.20b, R-281);
  - the drift check (7.21);
  - D2a's original-theme row (7.23);
  - retention and pinning (7.22);
  - theme naming (7.24).
- **Out of bounds here:**
  - a server refusal of a deploy whose gate is unconfirmed (AD-29: consent, not control);
  - a capture on any deploy after the site's first upload;
  - capturing a theme that carries the marker;
  - a progress bar without a byte count (DESIGN.md:518-522; see Design Notes);
  - a hard-coded Ghost Admin menu path in the gate;
  - bytes of a theme through a function body (AD-13).
- Never edit `claude-design-export/`, a `record` document or a generated file, and never write a count down.

## I/O & Edge-Case Matrix

"Owed" means Run checks would show and the site has no `backup_confirmed_at`. "First upload" means no binding exists for
the job's site.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Rail, both owed | first deploy, no token, no decline, gate owed | Destination · Safety net · Backup · Check · Ship · Live; Next | — |
| Rail, gate only | token stored, or a decline recorded; gate owed | Destination · Backup · Check · Ship · Live; Next | — |
| Rail, neither | gate confirmed, Safety net not offered | the four steps; Run checks | a failed read of the site counts as owed |
| Self-hosted | `hosted_by_ghost = false` | D1d: shortcut, seven tickable rows, "7 rows still to tick…" | — |
| Ghost(Pro) | `true` | D1e: sky block and ink line, no shortcut, Database "NOT YOURS TO TAKE" with no box, "6 rows still to tick…" | — |
| Unknown host | `null` | the sky block, then the shortcut; D1d's seven rows, all tickable; sub line is the host alone | — |
| Partly ticked | some rows | the reason counts the rest; the master confirm and Run checks are greyed with their reasons; a press does nothing | — |
| Last row ticked | — | the master confirm turns live; "Confirm available" said once, politely | — |
| Shortcut ticked | self-hosted or unknown | D1d′: every row collapses to one ticked line ending "in the archive"; "One confirmation left." | unticking restores each row's own tick |
| Row unticked after confirm | — | the master confirm unticks; Run checks greyed | — |
| Confirmed, Run checks | — | the confirmation is written without waiting; the checks start; Backup ticked | a failed write is logged, and the gate shows again on a later open |
| Back (Backup) | — | Destination, Next focused; ticks kept while the wizard stays mounted | — |
| Theme Download, token held | live theme unmarked | "Preparing…", then the capture writes the object and the row, and the browser follows `/snapshots/{id}/download` (303 to a signed URL) | Ghost or Storage failure: the row's failure sentence; nothing half-written |
| Theme Download, marked | live theme carries `"inflozo": true` | the "Inflozo's own" sentence; nothing stored | — |
| Theme Download, no token | — | no Download on the Theme row (could never act: absent, DESIGN.md:582) | — |
| routes.yaml Download | connected site | "Preparing…", then `routes.yaml` saved; staff read when stored, else the Admin key | a failed read gives the row's failure sentence |
| Ship, first upload, token | unmarked live theme | `snapshotting`, B12a rows 1 → 2 with name, version and size; then upload as 7.18a | — |
| Ship, first upload, marked | live theme is an Inflozo theme | no capture; the existing row is untouched; B12a's row 2 reads the "Inflozo's own" line; then upload | — |
| Ship, first upload, no token | Admin-key `GET themes/` 403 (6) or 501 (5) | nothing uploaded; the job rests at `awaiting_ship`; B12b with the no-token body and "GET /ghost/api/admin/themes/ → 403" (or 501) | — |
| Ship, stored token refused | staff `GET` 401 | B12b, "token no longer recognised" body, the request and 401 | — |
| Ship, Ghost or Storage fails | 5xx, timeout, 403 on download, put refused | B12b with the request (or "Storage") and the status, same three actions | — |
| Deploy without a snapshot | B12b | `ship` with `withoutSnapshot`; no capture; upload as 7.18a | — |
| Add token from B12b | B12b | D1b's view; a kept token ships again, capturing; Back returns to B12b | 7.19's refusals, unchanged |
| Cancel during B12a | `snapshotting` | the job is cancelled after the capture and before the upload; Destination | a row written by the capture stays (it is the live theme) |
| Not the first upload | a binding exists | no `snapshotting`; S8c as 7.18a | — |
| Deploy only, first upload | mode `upload` | captures exactly as Ship it | — |
| Disconnect, reconnect | — | `backup_confirmed_at` null, so the gate shows again; bindings and the snapshot row survive, so no capture | — |
| Project deleted | its bindings cascade | the snapshot row survives; the site's next first upload re-captures unless the live theme is marked | — |
| Probe | `config` with or without `hostSettings` | `hosted_by_ghost` true or false | an unparsed body writes nothing |

</frozen-after-approval>

## Code Map

Paths are under `apps/web/` unless written in full. `E` = `app/(app)/app/(authed)/projects/[id]/(editor)/`.

**The wizard and its rule (7.18a and 7.19, the base).**
- `lib/deploy.ts`:
  - `STEPS` is `:35-44`, and `stepsFor(safety)` is `:50`, which filters `safety` only;
  - `CANCELLABLE`, `MOVING` and `UNSTOPPABLE` are `:53-58`, `stepOf` is `:67`, and `stepNumber` is `:87`;
  - `DEPLOY_WORDS` is `:219` and `SAFETY_WORDS` is `:375-403`;
  - `Mode`, `MODES`, `DeployIntent` and `INTENTS` are `:600-604`;
  - `ShipState` is `:618-662` (`site.staff` `:654`, `site.declined` `:656`, `firstDeploy` `:638`);
  - `shipStateOf` is `:667`, with `firstDeploy` at `:731`;
  - `safetyOffered` is `:744`.
- `components/editor/deploy-wizard.tsx`:
  - `Rail` is `:174`; it ticks `safety` when it has been answered (`:185`);
  - `safety`, `steps` and `safeAnswered` are `:364-370`, `local` is `:372`, and the `at` mapping is `:443`;
  - `runChecks` is `:510`, `addSafety` is `:550` (it calls `runChecks()` at `:566`), and `notNow` is `:572`;
  - the focus and announcement for each `local` are `:578-586`;
  - Destination's `#deploy-next` and `#deploy-run` are `:936-951`;
  - D1b is `:1291-1370`, D1c is `:1373-1418`, and Continue at `:1407` calls `runChecks()`;
  - S8c is `:1129-1152` (`StageRow` `:159`) and S8d′ is `:1154-1181`;
  - the step switch is `:1420-1426`, the width rule is `:1461-1462`, and the polite region is `:1467` (`useSaid`, `:353`).
- `E/read.ts`:
  - the site select is `:328`;
  - the bindings for the site are `:343` (`select('project_id, theme_name').eq('site_id', linked)`);
  - `shipStateOf` is called at `:548-562`.
- `E/actions.ts`:
  - `linkedSite` is `:264`, `addSafetyToken` is `:280`, and `declineSafetyNet` is `:298`, the pattern for
    `confirmBackup`;
  - the file is on the service-role list.
- `E/editor.tsx` holds `answered` and passes it to the wizard (7.19).

**The deploy shell.**
- `server/deploy/run.ts`:
  - `ship` is `:419`, and the claim is `:442` (`awaiting_ship` → `compiling` | `uploading`);
  - `io.artifacts.get` is `:451`, then the upload `:452-456`, then the binding at the first accepted upload `:467-474`;
  - `cancelled` is `:255`, `clear` is `:243`, and `cancel` is `:591`;
  - the capture goes after the claim (and after a stale recompile), before `:451`.
- `server/deploy/deploy-io.ts`:
  - `call` is `:147` and hard-codes `kind: 'admin'`;
  - `bind` is `:119-126`;
  - a new `snapshot` member hands `captureSnapshot` its real io, so `run.ts` stays off the chokepoint, as
    `server-wiring.test.ts:492-497` holds.
- `app/(app)/app/(authed)/projects/[id]/deploy/route.ts`:
  - `INTENTS` is `:47`, and `ship` is `:75-84`, which gains `withoutSnapshot`;
  - `maxDuration` is 300 (`:26-28`).
- `server/deploy/project-input.ts:47-48, :113, :125`: `read.bound` is per project×site, so the per-site test is a new read.

**Ghost and storage.**
- `server/ghost-admin/index.ts`:
  - `call` is `:345` (`kind`, and `credential_missing` at `:356-362`);
  - `CallResult.bytes` (`:49-70`) is the raw body, so a zip is usable as-is;
  - each call writes an audit row (`:488`).
- `server/ghost-admin/admin-rule.ts`:
  - `CALL_TIMEOUT_MS`, `ITEM_TIMEOUT_MS` and `timeoutFor` are `:139-141`, keyed by write items only;
  - the download needs a read budget there, and it must not become a fifth `ADMIN_WRITES` key (`:120-129`);
  - `adminRequest` (`:244`) sends `redirect: 'manual'`, and `ghostCode` is `:277`.
- `server/routes-upload.ts:43-51, :65-80`: `readLive` and the `credential_missing` → `no_token` mapping, the pattern for the
  staff read. `server/routes-io.ts:52` passes `kind` through.
- `server/staff-token.ts:27-35`: the injectable io, the testability pattern for `server/snapshot.ts`.
- `app/(app)/app/snapshots/[id]/download/route.ts:40-80`: Story 2.5's download. It does an RLS read, then a 60-second signed
  URL, then a 303, and a missing object is a 404. Reused, unchanged.
- `app/(app)/app/(authed)/account/deletion-rule.ts:91-93`: `SNAPSHOT_BUCKET` and `snapshotObjectKey`. Import them; never
  copy them.
- `app/(app)/app/restore/page.tsx:61-70, :119`: the pre-purge list, which shows this story's rows unchanged (FR-A5).
- `lib/paywall.ts:125` `adminAt(url, 'design')` · `lib/routes-upload.ts:50` `GHOST_ROUTES_HELP` ·
  `lib/connect-rule.ts:115` `hostOf`.
- `packages/theme-compiler/src/compile.ts:298` `THEME_MARKER = 'inflozo'`, re-exported from `src/index.ts:13`.

**The site record.**
- `server/site-probe.ts:103-130`: `body` and `verdict` (`:103-108`), and the `patchSite` write (`:125-128`), which gains
  `hosted_by_ghost`.
- `app/(app)/app/(authed)/sites/actions.ts`:
  - the `disconnectSite` stamp `:1122-1126` gains `backup_confirmed_at: null`;
  - re-adoption at connect is `:352-361` (keeps the site id, its bindings and its snapshot).

**The schema.**
- `supabase/migrations/20260904120000_complete_schema.sql`:
  - `sites` `:145-175`;
  - `site_snapshots` `:190-210`, with `unique (site_id)` at `:209` and the policy select-only at `:855-875`;
  - the `site-snapshots` bucket `:1490-1495`, which has no policy (`:1563-1565`);
  - `job_stage` `:405-407`, and `deploy_jobs_owner_cancel` `:883-886`;
  - `project_site_bindings` `:465-475`.
- `20261019120000_deploy_wizard.sql:21` is the precedent for a new `job_stage` value.
- `20261022120000_staff_token_decline.sql` is the precedent for a server-written column with no grant.
- SCHEMA.sql mirrors: `sites` `:173-183`, `site_snapshots` `:211`, `job_stage` `:446`, the bucket `:1596`. `run-rls-gate.sh`
  diffs both.

**Ghost, read in source (6.58.0 and 5.130.6 npm tarballs, this Create).**
- **The download.** `GET themes/:name/download` is `api.themes.download` with `permissions: { method: 'read' }`
  (6.58.0 `api/endpoints/themes.js:140-160`; 5.130.6 `:150`). It is served by `theme-storage.js` `serve()`, which zips the
  theme into a temporary directory and streams it as `application/zip` with
  `Content-disposition: attachment; filename={name}.zip`. It is a direct 200, not a redirect.
- **Who may download.** Only Administrator and Owner hold `theme: read` (7.19's reading of `fixtures.json`). An Editor's
  token gets a 403 on the download.
- **The integration key.** `tokenPermissionCheck` (`web/api/endpoints/admin/middleware.js:17-74`, both majors) lets
  integration keys use `themes: ['POST','PUT']` only, and `settings: ['GET']`.
- **Default themes.** `setFromZip` refuses `casper.zip` and `source.zip` with a `ValidationError` ("Please rename your zip,
  it's not allowed to override the default theme.", `services/themes/storage.js:53-56` on both majors). So a restore of a
  default theme must be an activation, not an upload. That is DW-389, Story 7.23's.

**Tests, the harness and the walk.**
- `deploy.test.ts:23-31` pins the rail (`stepsFor(true)` deep-equals `STEPS`), `:260-280` is the `safetyOffered` matrix,
  and the words.
- `purge.test.ts` and `deletion-rule.test.ts:77-82` (`snapshotObjectKey`).
- `server-wiring.test.ts`: the service-role list `:108-190` (the latest is "TENTH", 7.19) and the chokepoint list `:440-510`.
- `busy.test.ts:354-377` holds the wizard's busy rules.
- `app/(app)/app/harness/editor/layout.tsx`:
  - `x-inflozo-harness-ship` is documented at `:123-147` and parsed at `:327`, with `shipOf` at `:393`;
  - the site is at `:398`, and `first` at `:409`;
  - `harness/editor/actions.ts:59-82` is the canned-action pattern.
- `tools/keyboard/journey.spec.mjs`: 7.19's section runs from `:10024` to the end of the file (`:10288`).
- `tools/keyboard/floor.spec.mjs:835-860` holds 7.19's widths.
- `tools/probe/run-verify-editor.cjs`:
  - step 116 is `:12854-13203`, and the stale-account sweep is `:484` (`[abcdefg]`);
  - steps 113a (`:11794-11797`) and 114 (`:12389-12391`) answer Safety net through the service key, and gain Backup the same
    way.
- `tools/probe/record-deploy.mjs:128-180` (`loadEnv`, `ghost(env)`, `themesOf`) and `record-staff-token.mjs`: the recorder
  pattern. The last MEASUREMENTS section is §88.
- `supabase/tests/rls.sql:1043-1171` holds the `site_snapshots` fixtures.

## Tasks & Acceptance

**Dev gate.** Questions 1 and 2 are ruled (R-281, R-282). The Schema push is made, green, and applied to production on the
owner's in-session go (R-99), before any code that reads the columns or the stage is pushed.

**Execution — the `Schema` push (alone, first; R-99):**
- [ ] `supabase/migrations/20261027120000_backup_gate.sql` -- all re-runnable (`if not exists`). PostgreSQL refuses a new
  enum value's use in the transaction that adds it, so the policy is a second file:
  - `alter type public.job_stage add value if not exists 'snapshotting' before 'uploading'`;
  - `sites.backup_confirmed_at timestamptz` (null means owed; `comment on` naming F7's "once per site, re-shown after a
    reconnect");
  - `sites.hosted_by_ghost boolean` (null means not yet probed; `comment on` naming `hostSettings`).

  The header says there is no new grant, as `staff_token_declined_at`'s does: the tenant reads both columns through
  table-wide select, and only the server writes them.
- [ ] `supabase/migrations/20261027120100_snapshot_cancel.sql` -- `deploy_jobs_owner_cancel` is recreated with
  `snapshotting` among its stages -- B12a's Cancel.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the enum value, the
  two columns beside `staff_token_declined_at`, and the policy. The gate diffs them.
- [ ] `…/RLS-TEST.sql`, then copied byte-identical to `supabase/tests/rls.sql` -- a **7.20 block**, one gate in Postgres:
  - the two columns' types, nullability and comments, and `snapshotting` in `job_stage`, ordered before `uploading`;
  - as the tenant:
    - an update of `backup_confirmed_at` or `hosted_by_ghost` is refused (42501);
    - `cancel_requested` can be set at `snapshotting` but not at `uploading` (the control);
    - an insert, update or delete on `site_snapshots` is refused;
  - deleting a project leaves its site's `site_snapshots` row (FR-J13's "survive project deletion");
  - as another tenant, none of it is visible.

**Execution — Dev:**
- [ ] `lib/deploy.ts` -- the rule, pure:
  - `STEPS` gains `{ id: 'backup', label: 'Backup' }` after `safety`. `stepsFor({ safety, backup })` replaces the boolean,
    with the four steps as its all-false case. The `:35-37` comment is updated;
  - `stepOf('snapshotting')` is `'ship'`;
  - `CANCELLABLE` and `MOVING` gain `snapshotting`;
  - `ShipState.site` gains `backupConfirmed` and `host: 'self' | 'ghost_pro' | null`, and `shipStateOf` reads them;
  - `backupOwed(ship)` is the matrix's "Owed";
  - `afterSafety` decides between Backup and Run checks;
  - `BACKUP_WORDS` and `SNAPSHOT_WORDS` hold every string in "Words";
  - the snapshot codes and their B12b bodies are in `deployError`'s table.
- [ ] `lib/backup-gate.ts` (**new**) -- the gate's pure rule. It is the one source the wizard, the harness and the tests
  read:
  - `gateRows(host)` gives the seven rows (Database untickable on `ghost_pro`);
  - `remaining(rows, ticks, shortcut)`, `confirmAvailable` and `reasonOf` give the footer;
  - `blocksFor(host)` decides between the shortcut, the sky block, or both;
  - `HELP` holds the links.
- [ ] `server/snapshot.ts` (**new**) -- `captureSnapshot({ siteId, userId, route }, io?)`, with its io handed in:
  - `GET themes/` with the staff token, or with the Admin key when none is stored;
  - the marker check;
  - the download;
  - the object put, then the row upsert, then the old object's removal.

  It answers `{ ok: true; id; theme; version; bytes } | { ok: true; marked: true } | { ok: false; code; request; status }`.
  It names the request it failed on: `GET /ghost/api/admin/themes/`, `GET /ghost/api/admin/themes/{name}/download/`, or
  `Storage`. It joins both `server-wiring.test.ts` lists with numbered reasons -- the one capture.
- [ ] `server/ghost-admin/admin-rule.ts` -- a read budget for the theme download, keyed so it never becomes an
  `ADMIN_WRITES` item. The ship's worst case is noted beside it against `maxDuration` 300.
- [ ] `server/deploy/run.ts` · `deploy-io.ts` · `projects/[id]/deploy/route.ts`:
  - `ship` takes `withoutSnapshot`;
  - on a first upload it claims `snapshotting` before `uploading`, calls `io.snapshot`, and writes
    `stage_timings.snapshotting` (`theme`, `version`, `bytes`, or `marked` / `skipped`);
  - it reads `cancel_requested`, then uploads;
  - a failed capture rests the job at `awaiting_ship` with the answer in `error`, and nothing is uploaded or bound;
  - `io.siteBound(siteId)` is the per-site test;
  - `view` answers the snapshot's timings and error -- the capture in the deploy.
- [ ] `server/site-probe.ts` -- `hosted_by_ghost: body.hostSettings != null` in the probe's write when `body` was parsed --
  the host.
- [ ] `sites/actions.ts` -- `disconnectSite`'s stamp sets `backup_confirmed_at: null` -- the gate shows again after a
  reconnect.
- [ ] `E/actions.ts`:
  - `confirmBackup(projectId, siteId)`: the service role sets `backup_confirmed_at = now()`, scoped by `user_id` and the
    still-linked, still-connected site (7.19's Review shape);
  - `downloadLiveTheme(projectId, siteId)`: `linkedSite`, then `captureSnapshot` through a chokepoint-side module, answering
    the id, the "Inflozo's own" sentence, or the failure sentence;
  - `downloadRoutes(projectId, siteId)`: `linkedSite`, then `readLive` through `routes-io.ts`, answering the text or a
    sentence;

  none of them takes the lock -- the gate's three server actions.
- [ ] `E/read.ts` -- the site select gains `backup_confirmed_at, hosted_by_ghost` -- server truth for the gate.
- [ ] `components/kit/icons.tsx` -- `Download` from Tabler's outline in `packages/library/icons/tabler.json` -- the
  frame's glyph.
- [ ] `components/editor/deploy-wizard.tsx`:
  - `backup` is fixed at mount from `backupOwed` and the editor's confirmed site; `local` gains `'backup'`, and the `at`
    mapping, the step switch and the width rule (780) follow it;
  - Destination shows Next while either step is owed; D1c's Continue and a kept Add token go through `afterSafety`;
  - the Backup view draws D1d, D1d′ and D1e, and the unknown-host state, from `lib/backup-gate.ts`:
    - the ticks, the shortcut, the greyed master confirm and Run checks with their reasons;
    - the polite "Confirm available";
    - the Theme and `routes.yaml` Downloads ("Preparing…"), with each row's failure sentence;
  - Run checks there calls `void confirmBackup()`, then `onBackup(siteId)`, then `runChecks()`;
  - focus moves to the first checkbox on entry, and to Next after Back;
  - while `snapshotting`, B12a: the rail at Ship, its title, lead and four rows (row 1's meta is the name and version, row
    2's is the size), its footer and its live Cancel;
  - a capture failure resting the job draws B12b for its cause (`deploy_jobs.error`), with Add token (D1b's view, Back to
    B12b), Deploy without a snapshot (`ship` with `withoutSnapshot`, "Starting…") and Cancel;
  - each view at its frame's width

  -- D1d, D1d′, D1e, B12a, B12b and the rail.
- [ ] `E/editor.tsx` -- hold the confirmed site beside `answered`, so a reopen in the same page skips Backup.
- [ ] `app/(app)/app/harness/editor/layout.tsx` and `actions.ts`:
  - `x-inflozo-harness-backup: self | pro | unknown` makes the gate owed for that host, and a `first` ship with
    `x-inflozo-harness-token: held` holds a token;
  - `x-inflozo-harness-snapshot: ok | marked | no_token | refused | failed` cans the ship's capture;
  - the canned gate actions are `harnessConfirm`, `harnessTheme` and `harnessRoutes`

  -- the journeys' state.
- [ ] `deploy.test.ts` · `backup-gate.test.ts` (**new**) · `snapshot.test.ts` (**new**) · `deploy-run.test.ts` ·
  `read.test.ts` · `admin-rule.test.ts` · `site-probe` / `probe-rule` tests -- every pure row of the matrix, each assertion
  first seen red:
  - the rails for each combination;
  - `backupOwed`, the rows per host, the counts and reasons, the shortcut's cover and restore, and an untick after confirm;
  - the capture:
    - staff ok puts the object before the row and removes the old object last;
    - a marked theme writes nothing;
    - an Admin-key 403 and a 501 give the one code (the control is a 200 capturing);
    - a 401, a 5xx and a put failure each leave no row;
  - the ship:
    - a first upload captures before the upload and a bound site does not;
    - a failure rests the job with nothing uploaded;
    - `withoutSnapshot` skips;
    - a cancel at `snapshotting` uploads nothing;
    - Deploy only captures;
  - `hosted_by_ghost` from a `config` with, without and unparsed `hostSettings`;
  - the download budget is not an `ADMIN_WRITES` key.
- [ ] `busy.test.ts` -- the wizard's press list gains the two Downloads ("Preparing…"), Backup's Run checks ("Starting…"),
  Deploy without a snapshot, and B12b's Add token -- R-98.
- [ ] `tools/keyboard/journey.spec.mjs`, pointer-free (Space ticks, Enter presses), each step with its control:
  - (a) `first` + `backup: self`, token held:
    - the six labels, Next → Safety net → … → Backup with the first box focused;
    - the reason counts down;
    - the master confirm and Run checks are `aria-disabled` with their reasons;
    - the polite sentence fires once when the last row is ticked;
    - the shortcut collapses the rows, and unticking it restores them;
    - confirm → Run checks → the canned Pre-flight with Safety net and Backup ticked;
    - a reopen shows Run checks with no Backup;
    - the control is a confirmed site, which shows four steps;
  - (b) `pro`: D1e, no shortcut, Database has no box, "6 rows still to tick";
  - (c) `unknown`: both blocks;
  - (d) no token: no Theme Download, and `routes.yaml`'s present (R-282);
  - (e) `snapshot: ok`, held: B12a's four rows with the name and version, Cancel live, then S8c;
  - (f) `no_token` → B12b with the 403 line and the Design & branding link → Deploy without a snapshot → S8c;
  - (g) `failed` → B12b's request and status → Add token → D1b → Back → B12b;
  - (h) Theme Download → the navigation to `/snapshots/{id}/download`, canned.
- [ ] `tools/keyboard/floor.spec.mjs` -- Backup at 1440 (780 card, scrolling inside the dialog), 820 and 390 (no
  horizontal scroll; each Download under its text), and B12a and B12b at 1440 and 390 -- the frames' widths.
- [ ] `tools/probe/record-snapshot.mjs` (**new**; a `doc-audit.py` catalogue row) -- §89, T1, read-only, keys read
  in-process by name, through the product's own `adminRequest`. It prints status, type and lengths only:
  - `GET themes/` with `GHOST6_STAFF_ACCESS_TOKEN` gives 200, the active theme's name and version, and its
    `package.inflozo` flag;
  - `GET themes/{active}/download/` with the same token gives 200, `application/zip`, the disposition, byte length, the
    `PK` magic and a sha256;
  - the same download with the token's last hex flipped gives 401 (the control);
  - the same download with `GHOST6_ADMIN_API_KEY` gives 403;
  - `GET themes/` with the Admin key gives 403 (the one code's Ghost 6 half);
  - `GET settings/routes/yaml/` with the Admin key gives 200 (R-282's premise, §37 re-run)

  -- standing rule 1, executed.
- [ ] `tools/probe/run-verify-editor.cjs` -- steps 113a and 114 answer Backup as they answer Safety net (the column set
  through the service key, read back). **Step 117**, on production, writes to T1 and puts it back:
  - (a) a throwaway account connects T1 through the wizard, and `hosted_by_ghost` reads `false`:
    - Ship it → Next → Add token (`GHOST6_STAFF_ACCESS_TOKEN`) → Backup shows D1d with both Downloads;
    - Theme Download gives a `site_snapshots` row (`casper`, bytes > 0), and its signed URL's bytes equal Ghost's download;
    - `routes.yaml` Download equals `GET settings/routes/yaml/`;
    - tick everything, then Run checks: `backup_confirmed_at` is set;
    - Ship it: `stage_timings.snapshotting` names `casper` and its version, and the row is re-captured (`captured_at`
      moved, the old object gone);
    - Live;
  - (b) the project is deleted and a new one linked (the token kept, the gate confirmed): Ship it, `snapshotting` reads
    the live `inflozo-…` theme as marked, and the `casper` row is unchanged;
  - (c) Remove token; disconnect (`backup_confirmed_at` back to null); reconnect; delete the project and link a new one:
    - the gate shows again, with no Theme Download and with `routes.yaml`'s;
    - Ship it: B12b with `GET /ghost/api/admin/themes/ → 403`, and nothing uploaded;
    - Deploy without a snapshot → Live;
  - (d) the account's deletion request: `/restore` lists the `casper` snapshot, and its Download answers 303, then the
    zip; then Restore account;
  - `finally`: Casper active again, every `inflozo-*` theme the run uploaded deleted, the list read back, and the
    throwaway disconnected and deleted (`[abcdefgh]`)

  -- R-82 on the real stack.
- [ ] Docs -- each finding reaches its document:
  - **PRD:**
    - FR-J13 gets a dated note: the gate as drawn (seven rows, the shortcut, the host from `hostSettings`, the record
      cleared at disconnect); the `snapshotting` stage; the one code; and B12b's "Design & branding" link (R-282's
      `routes.yaml` sentence and R-281's moves are already there, dated 2026-10-26);
    - FR-J8's progress line gains the first upload's "Archiving" stage.
  - **EXPERIENCE:**
    - the IA rows `:185`, `:188` and `:194` (the rail counts the steps that show, and Backup is skipped once confirmed);
    - F7's states (unknown host and confirmed, as built);
    - F1 (the stage, B12b's place link);
    - the Theme row's link.
  - **BACKUP-GATE.md:** the status line (the Theme link, the paths described and never hard-coded). F-077's note was
    closed by R-282 at the ruling.
  - **The spine:** AD-10 (the capture's two reads with the staff token, and the Admin-key list read for the one code) and
    AD-24's code table (`snapshot_needs_token`).
  - **VERIFY-AT-BUILD:**
    - item 78: the theme download with the staff token, EXECUTED by §89;
    - item 10's open half moved with restore to Story 7.23 (DW-389, R-281);
    - a dated note on E-5's B12b half, settled by reading both bundles.
  - **MEASUREMENTS:** §89, from the recorder.
  - **The epic context:** the 7.20 sub-bullet.

  Then `grep -rn --exclude=.env` for "Story 7.20a adds Backup", "less Backup", "Settings → Design" and "stepsFor(true)"
  outside their records, and expect nothing stale (standing rule 7).

**Acceptance Criteria:**
- Given the first deploy to a site, when the wizard reaches Backup, then it asks the user to confirm they hold their own
  copy of the theme and `routes.yaml` among the seven rows. The master confirm and Run checks stay greyed with their reasons
  until the last row is ticked and confirmed, and the master confirm becoming available is announced politely.
- Given a Staff Access Token is held, when the gate draws, then the Theme row offers a Download, and that Download is the
  archived live theme handed back through a short-lived signed URL. Without the token, the Theme row offers none and names
  what to look for in Ghost Admin, with Ghost's help linked rather than a hard-coded path.
- Given the first upload to a site (Ship it or Deploy only), when it runs, then the live theme is downloaded with the Staff
  Access Token and archived on the site's own record before anything is uploaded. The archive is excluded from asset quota
  and exempt from pruning, and a theme carrying `"inflozo": true` is never captured.
- Given no token, or a refused capture, when Ship it runs, then nothing is uploaded until the user chooses. B12b names the
  request and Ghost's status, says Ghost keeps the previous theme under Design & branding (linked), and offers Add token,
  Deploy without a snapshot and Cancel. Ghost 5's 501 and Ghost 6's 403 read as one Inflozo code.
- Given a confirmed gate, when the site is disconnected and reconnected, then the gate shows again. The snapshot taken at
  the first upload stays, through that and through project deletion, and is listed on `/restore` during an account
  deletion window.
- Given each surface, when compared with its frame, then it matches:
  - the gate matches D1d (self-hosted), D1d′ (shortcut ticked) and D1e (Ghost(Pro)) in `D1 First-Deploy Gates.dc.html`
    (`:208-533`), at 780px;
  - the running and degraded snapshot states match B12a and B12b as corrected (`B Missing Surfaces.dc.html:1044-1102`), at
    600px;
  - the rail matches D1's six-step rail (`:51-63`) when both first-deploy steps show.

  The departures are those in Design Notes, each told.
- Given the migrations are withheld, when the RLS gate runs, then the 7.20 block aborts at its first check.

## Spec Change Log

## Design Notes

**Ruled values — the one table Questions 1 and 2 set.** Dev builds this table, and a different ruling changes it and
nothing else. *(Ruled: option 1 of each — R-281 and R-282, owner, 2026-10-26.)*

| Key | Value (option 1) | Where |
|---|---|---|
| Scope (Q1) | **7.20a** is this spec. **Restore-to-original** moves word for word to **Story 7.23**: "restoring is a one-click redeploy that skips *Inflozo's* gscan gate — but **Ghost validates every upload with its own gscan**, so an old fork can be rejected on the way back in; that case has a designed fallback too, offering the zip as a download and pointing at Settings → Design", plus Verification's "and restored". **FR-C6's 90-day orphan purge** (its criterion and DW-79's "one home") moves word for word to a new **Story 7.20b**, straight after. | `epics.md` 7.20a, 7.20b, 7.23 · `sprint-status.yaml` · DW-75, DW-79, DW-389 *(all done at the ruling)* |
| `routes.yaml` without the token (Q2) | Offered, read with the Admin key (MEASUREMENTS §37, both majors). D1e then shows one Download, on `routes.yaml`. | `downloadRoutes` · BACKUP-GATE F-077 |

**Words** (the frame's own unless marked).

| Key | Value |
|---|---|
| Rail label | Backup |
| Gate title | Back your site up before we replace the theme |
| Sub line | Self-hosted Ghost · {host} — Ghost(Pro) · {host} — {host} *(unknown, extrapolated)* |
| Panel eyebrow · body | WHAT INFLOZO WRITES TO YOUR SITE · Inflozo writes exactly two things to your Ghost site: your theme, and routes.yaml. It never writes posts, pages, members, tags, settings or redirects. |
| Lead | A full backup is still the right thing to have. A theme change is reversible only if you can put the old theme back — and that means holding a copy of it before we replace it. |
| Shortcut | chip `ghost backup` · one archive: content, members, every installed theme, images, files, media, routes and redirects. · I have run ghost backup and saved the archive somewhere off the server. · Ticking this ticks every row below and leaves them on screen, so you can see what you now hold. |
| Shortcut ticked caption | Everything the archive holds, still on screen and ticked. · each row: in the archive |
| Ghost(Pro) block | On Ghost(Pro), themes, content, members, routes and redirects all download from Ghost Admin. Images and media do not — Ghost Admin has no bulk export for them, and there is no server to copy them from. Ghost's own documentation points you at your host's support for this. ¶ Ghost(Pro) also takes its own platform backups; that is a Ghost service, not an Inflozo one, and it is worth confirming with Ghost what it covers and how to request a restore. · ink: This is not something Inflozo can fix, and we are not going to pretend otherwise. |
| Theme | INFLOZO REPLACES THIS · Look for the theme marked as active in Ghost Admin and download it as a zip. · ⚠ The one thing that makes rollback possible. · Ghost's help on themes ↗ |
| routes.yaml | INFLOZO MAY OVERWRITE THIS · Wherever Ghost Admin accepts a routes file, it also offers the current one as a download. · Ghost's docs on dynamic routing ↗ |
| Content | Ghost Admin exports posts, pages, tags and settings as a single JSON file. Look for the export control in your site's settings. · ⚠ The JSON export does not include your images. · Ghost's help on exports ↗ |
| Members | Your member list downloads as a CSV from the members area of Ghost Admin, including their subscription status. · Ghost's help on member exports ↗ |
| Redirects | Ghost Admin offers your current redirects file as a download next to the control that accepts a new one. · Ghost's help on redirects ↗ |
| Images, files and media | self-hosted: These live on your server rather than in any export. Copy the images, files and media folders out of your Ghost content directory yourself. · Ghost's docs on the content directory ↗ — Ghost(Pro): Save what matters by hand from Ghost Admin, one item at a time. There is no bulk export on Ghost(Pro), and no server to copy them from. · Ghost's help on exports ↗ — ⚠ The gap most people miss. |
| Database | self-hosted: Take a dump of the MySQL database your Ghost install points at, from the server it runs on. · Ghost's docs on backing up ↗ — Ghost(Pro): NOT YOURS TO TAKE · Ghost holds the database on Ghost(Pro). There is nothing here for you to download, so there is nothing to tick. · Ghost's help on exports ↗ |
| Download · busy | Download · Preparing… *(busy, R-98)* |
| Download failed *(extrapolated)* | Ghost didn't hand over the file ({status}). Use the help link on this row to download it from Ghost Admin. |
| Live theme is Inflozo's *(extrapolated)* | Your live theme is already an Inflozo theme, so there's no original to download here. |
| Master confirm | I confirm I have a complete backup of my site and understand Inflozo will replace my theme. |
| Reason | {n} rows still to tick, then the confirmation above. · 1 row still to tick, then the confirmation above. *(singular, extrapolated)* · One confirmation left. |
| Confirm available *(polite, extrapolated)* | Every row is ticked. You can confirm now. |
| Buttons | Back (`DEPLOY_WORDS.back`) · Run checks (`DEPLOY_WORDS`'s, chevron) · Starting… |
| B12a | Archiving your current theme first · If anything about the new theme is wrong, this is what we roll back to. It takes a few seconds, and we only do it the first time you upload to a site. · Reading the live theme from Ghost [{name} {version}] · Writing the snapshot [{size}] · Uploading the new theme · Checking your theme (Ghost will love it) · Kept outside your version limit. · Cancel |
| B12a row 2, marked *(extrapolated)* | No snapshot needed: the live theme is already Inflozo's |
| B12b title | We could not archive your current theme |
| B12b body, no token | Reading your live theme needs a Staff Access Token from the site Owner or an Administrator, and this site doesn't have one. That's how Ghost works on every version and every host — there's no permission to switch on. *("this project" → "this site", R-278's grain)* |
| B12b body, token refused *(extrapolated)* | Ghost no longer recognises the Staff Access Token stored for this site, so no copy was made. |
| B12b body, other *(extrapolated)* | Ghost didn't hand over your live theme, so no copy was made. |
| B12b inset | `{METHOD} {path} → {status}` (mono) · Ghost keeps your previous theme under Settings → **Design & branding** ↗, so you can put it back yourself if you need to. |
| B12b buttons | **Add token** (`KEYS.staff.add`, R-170; B12b draws "Add the token") · Deploy without a snapshot · Cancel |

**Links** (resolved 2026-10-26, each answering 200; the frame's own unless marked):

| Row | Address |
|---|---|
| Theme | `https://ghost.org/help/installing-a-theme/` *(the frame's `ghost.org/help/themes/` answers 404; this page says "Select the Installed option … You can also download copies of your themes")* |
| routes.yaml | `GHOST_ROUTES_HELP` (`https://docs.ghost.org/themes/routing/`, where the frame's address redirects) |
| Content · Members · Ghost(Pro) rows | `https://ghost.org/help/exports/` |
| Redirects | `https://ghost.org/help/redirects/` |
| Images (self-hosted) | `https://docs.ghost.org/config/` |
| Database (self-hosted) | `https://docs.ghost.org/ghost-cli/` (the frame's `#ghost-backup` anchor kept) |

**Routine calls**, each a reading of an approved source, told to the owner in one line each; none is put to him:
- **"Add token" on B12b,** not "Add the token". R-170 makes it the one name, as 7.19 ruled D1b's.
- **"This site", not "this project",** in B12b's body. The token belongs to the site (R-278).
- **The Theme row links Ghost's "Installing a theme" page.** The frame's address is gone (404).
- **"Settings → Design & branding" in B12b,** linked to the site's own Design panel. That is Ghost's label on both majors,
  and E-5's own rule moves a wrong label to a description plus a link.
- **No coral progress bar on B12a.** DESIGN.md:518-522 allows one only where a real byte count exists, and the server
  reports none while it works. Row 2 carries the real size once it is known.
- **Greyed, not `disabled`.** The frames' native `disabled` on Run checks loses the reason and the focus (R-98).
- **Unknown host shows both blocks.** F7 says "both paths offered, neither assumed". It is extrapolated from D1d and D1e,
  and the Database row is tickable.
- **Sites already shipped to before this story show the gate once on their next deploy.** Consent was never collected
  there. Only test sites exist, because the product is pre-launch.
- **The Theme Download writes the site's snapshot row,** because AD-13 serves bytes only from Storage. A later first upload
  re-captures and replaces it. `ponytail:` a failed capture at ship leaves the gate-time row in place, labelled by its
  `captured_at`.
- **D1b's copy and D1c's first row** (7.19) become true with this story. Neither changes.

**Why a column for the gate, and not the bindings.** F7 shows it again after a disconnect and reconnect, and a reconnect
keeps the bindings (`sites/actions.ts:352-361`). Bindings alone would therefore never show it again.

**Why the stage, and not a timing under `uploading`.** B12a's Cancel is live until the upload begins.
`deploy_jobs_owner_cancel` and `CANCELLABLE` are keyed by stage. `snapshotting` keeps "the client may cancel" as a rule the
database holds.

**Why ask Ghost with the Admin key when no token is held.** B12b prints the request and the status. Without a call, that
line would claim an answer nobody asked for. One read per site, at its first upload only, makes it the site's own answer,
and gives the 7.7-assigned "one code" a real caller.

**DW-389 (new, this Create).** Ghost refuses an upload named `casper.zip` or `source.zip` on both majors (read in source,
above), and T1's live theme is Casper. Restoring a default theme as an original must therefore be
`PUT themes/{name}/activate/` of the installed copy, or an upload under another name. A plain re-upload of the snapshot zip
is never enough. The owner is Story 7.23 (R-281).

## Owner's manual test

You test as **`umngkmr+backup720@gmail.com`** (Part A) and **`umngkmr+backup720b@gmail.com`** (Part B), both fresh, on
the Ghost 6 test site (T1). Deploy fills in the URLs and checks that both aliases are unused. Before you start, in
**ghost6.inflozo.com's Ghost Admin** (`https://ghost6.inflozo.com/ghost/`):
- **Casper** must be the active theme;
- make a custom integration called **Owner test 7.20**, and keep its Admin API key and Content API key open;
- open your avatar → **Your profile**, find **Staff access token**, and keep it ready to copy.

Addresses that need your project's id are written `<P>`: copy it from the address bar after step 2.

**Not in this test:**
- **the Ghost(Pro) and unknown-host versions of the Backup step.** T1 is self-hosted, so the keyboard journeys prove both;
- **"the live theme is already Inflozo's".** The walk (step 117b) proves it.

**Part A — with the token**

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the first alias and open the link in your inbox. | `umngkmr+backup720@gmail.com` | Start. |
| 2 | `https://app.inflozo.com/sites` | Sites | Press **Connect a site** and finish the wizard with the integration's two keys. | `https://ghost6.inflozo.com` + the two keys | ghost6 is **Connected**, and a project linked to it opens. |
| 3 | `https://app.inflozo.com/projects/<P>` | Editor | Press **Ship it**. | — | The button reads **Next**, and the steps read **Destination · Safety net · Backup · Check · Ship · Live**. |
| 4 | `https://app.inflozo.com/projects/<P>` | Safety net | Press **Next**, paste your profile's token, and press **Add token**. | your token | "Adding…", then a wide card: **"Back your site up before we replace the theme"**, with "Self-hosted Ghost · ghost6.inflozo.com" under it. |
| 5 | `https://app.inflozo.com/projects/<P>` | Backup | Read down the card. | — | A panel saying Inflozo writes only your theme and routes.yaml. Then a coral-bordered **ghost backup** box. Then seven rows (Theme, routes.yaml, Content, Members, Redirects, Images files and media, Database), each with a box, a line of help and a "↗" link. **Download** sits on Theme and routes.yaml. At the bottom: a grey confirmation, **"7 rows still to tick, then the confirmation above."**, Back, and a grey **Run checks**. |
| 6 | `https://app.inflozo.com/projects/<P>` | Backup | Press **Download** on the Theme row. | — | "Preparing…", then a zip named for ghost6 and **casper** downloads. Open it: Casper's files. |
| 7 | `https://app.inflozo.com/projects/<P>` | Backup | Press **Download** on routes.yaml. Then click **Ghost's help on themes ↗**. | — | A `routes.yaml` file downloads. Ghost's "Installing a theme" page opens in a new tab. |
| 8 | `https://app.inflozo.com/projects/<P>` | Backup | Tick Theme, routes.yaml, Members and Redirects. Then press the grey **Run checks**. | — | **"3 rows still to tick, then the confirmation above."** Run checks does nothing. |
| 9 | `https://app.inflozo.com/projects/<P>` | Backup | Tick the **ghost backup** box. Then untick it. Then tick it again. | — | Ticked: every row shrinks to one ticked line ending "in the archive", and the footer reads **"One confirmation left."** The confirmation is no longer grey. Unticked: the four rows you ticked are back as they were. |
| 10 | `https://app.inflozo.com/projects/<P>` | Backup | Tick the confirmation and press **Run checks**. | — | "Starting…", then Pre-flight, with **Safety net** and **Backup** both ticked in the steps. |
| 11 | `https://app.inflozo.com/projects/<P>` | Ship | Press **Ship it**. | — | For a moment, **"Archiving your current theme first"**: "Reading the live theme from Ghost" with **casper** and its version, "Writing the snapshot" with a size, and "Kept outside your version limit." Then Shipping, then Live. |
| 12 | `https://app.inflozo.com/projects/<P>` | Destination | Close the wizard and press **Ship it** again. | — | No Safety net and no Backup: **Run checks**, four steps. |
| 13 | `https://app.inflozo.com/account` | Account | Press **Delete account**, type the phrase, and press **Delete account**. | `delete my account` | "Your account is set to be deleted", listing ghost6's **casper** with **Download**. An email arrives listing the same theme. |
| 14 | the same page | Account deletion | Press **Download**, then **Restore account**. | — | The casper zip downloads. Your account is back. |

**Part B — without the token** (a second account, so its first upload is a first one)

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 15 | `https://app.inflozo.com/sign-in`, then `/sites` | Sites | Sign out, sign in with the second alias, and connect ghost6 with the same two keys. | `umngkmr+backup720b@gmail.com` | ghost6 **Connected**; a project opens. |
| 16 | `https://app.inflozo.com/projects/<P>` | Safety net | Press **Ship it**, **Next**, **Not now**, then **Continue**. | — | The Backup card again, now with **no Download on Theme** and a Download on routes.yaml (R-282). |
| 17 | `https://app.inflozo.com/projects/<P>` | Backup | Tick all seven rows one by one, then the confirmation, then **Run checks**, then **Ship it**. | — | **"We could not archive your current theme"**, the line **GET /ghost/api/admin/themes/ → 403**, "Ghost keeps your previous theme under Settings → **Design & branding**…", and **Add token**, **Deploy without a snapshot** and **Cancel**. |
| 18 | `https://app.inflozo.com/projects/<P>` | Snapshot failed | Press **Add token**, then **Back**. | — | The token box from Safety net, then back to the same card. |
| 19 | `https://app.inflozo.com/projects/<P>`, then `https://ghost6.inflozo.com` | Ship | Click **Design & branding ↗**. Then press **Deploy without a snapshot**. | — | Ghost Admin's Design panel for ghost6 opens in a new tab. Then "Starting…", Shipping, and Live. |
| 20 | `https://ghost6.inflozo.com/ghost/`, then `https://app.inflozo.com/sites` | Cleanup | In Ghost: **Settings → Design & branding → Change theme → Casper → Activate**, delete the `inflozo-…` themes, and delete the Owner test 7.20 integration. In Inflozo, on each alias: ⋯ → **Disconnect** on ghost6. | — | T1 is back as it was, and Inflozo holds no key of yours. |

## Questions for the owner

Questions 1 and 2 were ruled on 2026-10-26, each option 1 (R-281, R-282). None is open. "Ruled values" in Design Notes
holds what they set.

### Question 1 — One story or two (and restore with Deploy History)?

**In plain English.** Story 7.20's card holds four separate pieces:
1. the **Backup step**, where you confirm your own backup;
2. the **automatic copy** of your live theme at the first upload;
3. **"Restore original"**, one click to put that copy back;
4. a **nightly clean-up** that deletes a copy 90 days after its site is disconnected, after warning you and offering a
   download.

The first two are one flow in the deploy wizard. "Restore original" has no button in this story's designs. Its button is
drawn in Deploy History (D2a), which is Story 7.23. The clean-up has no screen and needs a decision of its own (when and how
you are warned).

**An example.** As one story, your test would cover the new Backup step and the copy. It would have no way to press
Restore, and nothing to look at for the clean-up. As 7.20a, your test is the twenty steps above. You would press Restore
in 7.23's test, beside Roll back.

1. **(RECOMMENDED) Split it.** 7.20a (this spec) is the Backup step and the copy. "Restore original" moves, word for word,
   to Story 7.23, which already draws its button. The 90-day clean-up becomes Story 7.20b, straight after 7.20a, and asks
   you how the warning is sent.
2. **Three stories.** 7.20a as above; 7.20b builds Restore with its own button ahead of 7.23's Deploy History; 7.20c is
   the clean-up.
3. **Keep it one story.** This spec is re-planned to include Restore (its button drawn early, ahead of 7.23) and the
   clean-up.

**Ruled: option 1 (owner, 2026-10-26) — R-281.** *"Split it. 7.20a (this spec) is the Backup step and the copy. "Restore
original" moves, word for word, to Story 7.23, which already draws its button. The 90-day clean-up becomes Story 7.20b,
straight after 7.20a, and asks you how the warning is sent."*

### Question 2 — Offer routes.yaml as a download even without the token?

**In plain English.** On the Backup step, the Theme and routes.yaml rows can each offer a **Download** button. On
2026-09-03 you ruled that both appear only when Inflozo holds your Staff Access Token, because without it Ghost will not
hand over the theme. Later, Inflozo tested routes.yaml on both Ghost versions. Ghost hands it over with the ordinary
integration key alone (MEASUREMENTS §37), so a routes.yaml Download can work for everyone. That loosening was left for you
to take.

**An example.** You pressed **Not now** on the token. On the Backup step, the Theme row says where to find your theme in
Ghost Admin, with no button. Should the routes.yaml row still give you the file in one click?

1. **(RECOMMENDED) Yes, always offer routes.yaml.** The Theme row offers its Download only with the token. routes.yaml
   offers its Download on every connected site. On a Ghost(Pro) site with no token, that adds one button the design drew
   without.
2. **No, keep the 2026-09-03 rule.** Without the token, neither row offers a Download, and both point to Ghost Admin.

**Ruled: option 1 (owner, 2026-10-26) — R-282.** *"Yes, always offer routes.yaml. The Theme row offers its Download only
with the token. routes.yaml offers its Download on every connected site. On a Ghost(Pro) site with no token, that adds one
button the design drew without."*

## Verification

R-82's real services for this story:
- production's **Supabase**: the two migrations, applied through `SUPABASE_DB_POOLER_URL` on the owner's in-session go and
  read back; the `site-snapshots` bucket, written and signed;
- **Vercel** (`app.inflozo.com`);
- **T1** (`ghost6.inflozo.com`):
  - the recorder is read-only (`GET themes/`, the download, `GET settings/routes/yaml/`);
  - walk step 117 uploads and activates, then puts Casper back;
  - Ghost 5's half goes to DW-326 (R-238).

**Commands:**
- `bash supabase/tests/run-rls-gate.sh` -- expected: green, with the 7.20 block's PASS lines. On a scratch copy without
  the migrations, it aborts at the 7.20 block's first check.
- Production, after the apply -- expected:
  - `information_schema.columns` shows `sites.backup_confirmed_at` (`timestamp with time zone`) and
    `sites.hosted_by_ghost` (`boolean`), both nullable, and `col_description` shows both comments;
  - `enum_range(null::job_stage)` holds `snapshotting` before `uploading`;
  - `pg_policies` shows `deploy_jobs_owner_cancel` with `snapshotting`.
- `pnpm check` -- expected: green, with the new `deploy`, `backup-gate`, `snapshot`, `deploy-run`, `read`, `admin-rule`
  and probe cases among the package's own printed count.
- `pnpm keyboard` -- expected: green, with journeys (a)–(h) and their controls passing, each new assertion first seen red at
  HEAD (`first` draws five labels there).
- `node --experimental-strip-types tools/probe/record-snapshot.mjs --t1` (keys read in-process by name) -- expected:
  - the staff list answers 200 with the active theme and `inflozo` false;
  - the staff download answers 200 `application/zip` with `PK` and a size;
  - the flipped token answers 401 (the control);
  - the Admin key answers 403 on both the download and the list;
  - `settings/routes/yaml/` with the Admin key answers 200.

  Any other answer to the download changes the capture's plan before Dev ships it.
- `node tools/probe/run-verify-editor.cjs` from a clean worktree at the deployed sha -- expected: step 117 PASS, with its
  `finally` leaving Casper active and no `inflozo-*` theme on T1, and steps 113–116 unchanged.
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.
- `grep -rn --exclude=.env -e 'Story 7.20a adds Backup' -e 'less Backup' -e 'Settings → Design,' apps tools _bmad-output/planning-artifacts`
  -- expected: nothing stale. The record documents keep theirs.
