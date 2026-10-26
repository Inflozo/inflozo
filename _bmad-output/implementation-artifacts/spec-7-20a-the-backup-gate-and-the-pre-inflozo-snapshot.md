---
title: 'Story 7.20a — The backup gate and the pre-Inflozo snapshot'
type: 'feature'
created: '2026-10-26'
status: 'in-review'
baseline_commit: 'ad888249da79baed684a7ddff994cbcd6b7b981c'
owner_test: pending
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-19-the-first-deploy-credential-step-and-its-decline-path.md', '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/BACKUP-GATE.md']
---

## In plain English

After this story, the first time you ship to a Ghost site the deploy wizard adds a **Backup** step. It tells you plainly
that Inflozo only ever writes your theme and `routes.yaml`, gently recommends (never requires) a backup of the rest of
your site from Ghost Admin, asks you to keep a copy of just those two files (with a Download button for each), and keeps
**Run checks** off until you confirm you have them. Then, the moment before Inflozo uploads its first theme to that site, it quietly saves a
copy of the theme that is live there now — you see "Archiving your current theme first" for a few seconds — and if it
cannot (no Staff Access Token, or Ghost refuses), it tells you why and lets you add the token, ship without the copy, or
cancel.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Questions 1 and 2 were ruled by the owner (2026-10-26), each option 1: R-281 and R-282.** This is **Story 7.20a**: the
Backup step and the snapshot taken at a site's first upload. Restore-to-original moved word for word to Story 7.23, which
draws its button (D2a). FR-C6's 90-day orphan purge and DW-79 moved to Story 7.20b, straight after this one. `routes.yaml`
is offered on every connected site. "Ruled values" in Design Notes is the one table the two rulings set.

**Renegotiated by the owner after Dev (2026-10-26) — R-283, Questions 3 and 4. Where any line below still describes the
seven rows, it is superseded by this paragraph.** The gate asks for **two rows only**: Theme and `routes.yaml`, the two
things Inflozo writes. Each keeps its tick and its Download. Above them sits a friendly, optional piece of advice,
"OPTIONAL, BUT RECOMMENDED". It names what Ghost Admin can download (content, members, redirects and post analytics) and
links Ghost's help on exports. A lead-in line then introduces the two rows. The master confirm stays, reworded to the
two files (Question 3, option 2). **Dropped:**
- the `ghost backup` shortcut (D1d′);
- the Ghost(Pro) sky block and its ink line (D1e);
- the rows Content, Members, Redirects, "Images, files and media" and Database.

Every host sees the same card; the sub line still names the host. The owner's reason: Inflozo changes nothing else, and a
database dump or a server copy is too technical for the customer and must not be a hard gate.

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
  - **The checklist (R-283):** the optional advice, then two rows, Theme and `routes.yaml`, the same on every host.
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
    - the shortcut panel is `:250-260` (**dropped, R-283**; the advice takes its place in the same panel vocabulary), and
      the seven rows are `:262-342` (**only Theme `:262-283` and `routes.yaml` stay, R-283**);
    - a rule `:344` separates the rows from the master confirm `:346-349`;
    - the footer `:351-355` carries the reason, Back, and Run checks with its chevron.
  - **D1d′** (the shortcut ticked), `:360-397` — **dropped with the shortcut (R-283).** The shortcut's box ticks in coral (`#C2381F` in the frame, a
    `coral-text`-family token in the product). Each row collapses to one line ending "in the archive", the master
    confirm turns live, and the reason reads "One confirmation left."
  - **D1e** (Ghost(Pro)), `:399-533` — **dropped (R-283): every host draws D1d's two rows.** As drawn:
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
- **Ticks.** Each row (and, before R-283, the shortcut) is a native `<input type="checkbox">` inside its own `<label>`, drawn as the frame's
  18px box. `link-picker.tsx:320-327` is the app's one precedent. The Kit gains no component, because one surface needs
  this.
  - *(Before R-283: ticking the shortcut covered every row. The shortcut is gone.)*
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
| Self-hosted *(R-283)* | `hosted_by_ghost = false` | the optional advice, then two tickable rows, Theme and `routes.yaml`; "2 rows still to tick…"; sub line "Self-hosted Ghost · {host}" | — |
| Ghost(Pro) *(R-283)* | `true` | the same card; sub line "Ghost(Pro) · {host}" | — |
| Unknown host *(R-283)* | `null` | the same card; sub line is the host alone | — |
| Partly ticked | some rows | the reason counts the rest; the master confirm and Run checks are greyed with their reasons; a press does nothing | — |
| Last row ticked | — | the master confirm turns live; "Confirm available" said once, politely | — |
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
- [x] `supabase/migrations/20261027120000_backup_gate.sql` -- all re-runnable (`if not exists`). PostgreSQL refuses a new
  enum value's use in the transaction that adds it, so the policy is a second file:
  - `alter type public.job_stage add value if not exists 'snapshotting' before 'uploading'`;
  - `sites.backup_confirmed_at timestamptz` (null means owed; `comment on` naming F7's "once per site, re-shown after a
    reconnect");
  - `sites.hosted_by_ghost boolean` (null means not yet probed; `comment on` naming `hostSettings`).

  The header says there is no new grant, as `staff_token_declined_at`'s does: the tenant reads both columns through
  table-wide select, and only the server writes them.
- [x] `supabase/migrations/20261027120100_snapshot_cancel.sql` -- `deploy_jobs_owner_cancel` is recreated with
  `snapshotting` among its stages -- B12a's Cancel.
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the enum value, the
  two columns beside `staff_token_declined_at`, and the policy. The gate diffs them.
- [x] `…/RLS-TEST.sql`, then copied byte-identical to `supabase/tests/rls.sql` -- a **7.20 block**, one gate in Postgres:
  - the two columns' types, nullability and comments, and `snapshotting` in `job_stage`, ordered before `uploading`;
  - as the tenant:
    - an update of `backup_confirmed_at` or `hosted_by_ghost` is refused (42501);
    - `cancel_requested` can be set at `snapshotting` but not at `uploading` (the control);
    - an insert, update or delete on `site_snapshots` is refused;
  - deleting a project leaves its site's `site_snapshots` row (FR-J13's "survive project deletion");
  - as another tenant, none of it is visible.

**Execution — Dev:**
- [x] `lib/deploy.ts` -- the rule, pure:
  - `STEPS` gains `{ id: 'backup', label: 'Backup' }` after `safety`. `stepsFor({ safety, backup })` replaces the boolean,
    with the four steps as its all-false case. The `:35-37` comment is updated;
  - `stepOf('snapshotting')` is `'ship'`;
  - `CANCELLABLE` and `MOVING` gain `snapshotting`;
  - `ShipState.site` gains `backupConfirmed` and `host: 'self' | 'ghost_pro' | null`, and `shipStateOf` reads them;
  - `backupOwed(ship)` is the matrix's "Owed";
  - `afterSafety` decides between Backup and Run checks;
  - `BACKUP_WORDS` and `SNAPSHOT_WORDS` hold every string in "Words";
  - the snapshot codes and their B12b bodies are in `deployError`'s table.
- [x] `lib/backup-gate.ts` (**new**) -- the gate's pure rule. It is the one source the wizard, the harness and the tests
  read:
  - `GATE_ROWS` gives the two rows, Theme and `routes.yaml`, on every host (R-283; `gateRows(host)` and seven rows before it);
  - `remaining(rows, ticks)`, `confirmAvailable` and `reasonOf` give the footer;
  - *(before R-283, `blocksFor(host)` chose the shortcut or the sky block; both are gone)*;
  - `HELP` holds the links.
- [x] `server/snapshot.ts` (**new**) -- `captureSnapshot({ siteId, userId, route }, io?)`, with its io handed in:
  - `GET themes/` with the staff token, or with the Admin key when none is stored;
  - the marker check;
  - the download;
  - the object put, then the row upsert, then the old object's removal.

  It answers `{ ok: true; id; theme; version; bytes } | { ok: true; marked: true } | { ok: false; code; request; status }`.
  It names the request it failed on: `GET /ghost/api/admin/themes/`, `GET /ghost/api/admin/themes/{name}/download/`, or
  `Storage`. It joins both `server-wiring.test.ts` lists with numbered reasons -- the one capture.
- [x] `server/ghost-admin/admin-rule.ts` -- a read budget for the theme download, keyed so it never becomes an
  `ADMIN_WRITES` item. The ship's worst case is noted beside it against `maxDuration` 300.
- [x] `server/deploy/run.ts` · `deploy-io.ts` · `projects/[id]/deploy/route.ts`:
  - `ship` takes `withoutSnapshot`;
  - on a first upload it claims `snapshotting` before `uploading`, calls `io.snapshot`, and writes
    `stage_timings.snapshotting` (`theme`, `version`, `bytes`, or `marked` / `skipped`);
  - it reads `cancel_requested`, then uploads;
  - a failed capture rests the job at `awaiting_ship` with the answer in `error`, and nothing is uploaded or bound;
  - `io.siteBound(siteId)` is the per-site test;
  - `view` answers the snapshot's timings and error -- the capture in the deploy.
- [x] `server/site-probe.ts` -- `hosted_by_ghost: body.hostSettings != null` in the probe's write when `body` was parsed --
  the host.
- [x] `sites/actions.ts` -- `disconnectSite`'s stamp sets `backup_confirmed_at: null` -- the gate shows again after a
  reconnect.
- [x] `E/actions.ts`:
  - `confirmBackup(projectId, siteId)`: the service role sets `backup_confirmed_at = now()`, scoped by `user_id` and the
    still-linked, still-connected site (7.19's Review shape);
  - `downloadLiveTheme(projectId, siteId)`: `linkedSite`, then `captureSnapshot` through a chokepoint-side module, answering
    the id, the "Inflozo's own" sentence, or the failure sentence;
  - `downloadRoutes(projectId, siteId)`: `linkedSite`, then `readLive` through `routes-io.ts`, answering the text or a
    sentence;

  none of them takes the lock -- the gate's three server actions.
- [x] `E/read.ts` -- the site select gains `backup_confirmed_at, hosted_by_ghost` -- server truth for the gate.
- [x] `components/kit/icons.tsx` -- `Download` from Tabler's outline in `packages/library/icons/tabler.json` -- the
  frame's glyph.
- [x] `components/editor/deploy-wizard.tsx`:
  - `backup` is fixed at mount from `backupOwed` and the editor's confirmed site; `local` gains `'backup'`, and the `at`
    mapping, the step switch and the width rule (780) follow it;
  - Destination shows Next while either step is owed; D1c's Continue and a kept Add token go through `afterSafety`;
  - the Backup view draws D1d's card with R-283's advice and two rows, on every host, from `lib/backup-gate.ts`:
    - the ticks, the greyed master confirm and Run checks with their reasons;
    - the polite "Confirm available";
    - the Theme and `routes.yaml` Downloads ("Preparing…"), with each row's failure sentence;
  - Run checks there calls `void confirmBackup()`, then `onBackup(siteId)`, then `runChecks()`;
  - focus moves to the first checkbox on entry, and to Next after Back;
  - while `snapshotting`, B12a: the rail at Ship, its title, lead and four rows (row 1's meta is the name and version, row
    2's is the size), its footer and its live Cancel;
  - a capture failure resting the job draws B12b for its cause (`deploy_jobs.error`), with Add token (D1b's view, Back to
    B12b), Deploy without a snapshot (`ship` with `withoutSnapshot`, "Starting…") and Cancel;
  - each view at its frame's width

  -- D1d as R-283 cut it, B12a, B12b and the rail.
- [x] `E/editor.tsx` -- hold the confirmed site beside `answered`, so a reopen in the same page skips Backup.
- [x] `app/(app)/app/harness/editor/layout.tsx` and `actions.ts`:
  - `x-inflozo-harness-backup: self | pro | unknown` makes the gate owed for that host, and a `first` ship with
    `x-inflozo-harness-token: held` holds a token;
  - `x-inflozo-harness-snapshot: ok | marked | no_token | refused | failed` cans the ship's capture;
  - the canned gate actions are `harnessConfirm`, `harnessTheme` and `harnessRoutes`

  -- the journeys' state.
- [x] `deploy.test.ts` · `backup-gate.test.ts` (**new**) · `snapshot.test.ts` (**new**) · `deploy-run.test.ts` ·
  `read.test.ts` · `admin-rule.test.ts` · `site-probe` / `probe-rule` tests -- every pure row of the matrix, each assertion
  first seen red:
  - the rails for each combination;
  - `backupOwed`, the two rows on every host, the counts and reasons, and an untick after confirm (R-283);
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
- [x] `busy.test.ts` -- the wizard's press list gains the two Downloads ("Preparing…"), Backup's Run checks ("Starting…"),
  Deploy without a snapshot, and B12b's Add token -- R-98.
- [x] `tools/keyboard/journey.spec.mjs`, pointer-free (Space ticks, Enter presses), each step with its control:
  - (a) `first` + `backup: self`, token held:
    - the six labels, Next → Safety net → … → Backup with the first box focused;
    - the reason counts down;
    - the master confirm and Run checks are `aria-disabled` with their reasons;
    - the polite sentence fires once when the last row is ticked;
    - confirm → Run checks → the canned Pre-flight with Safety net and Backup ticked;
    - a reopen shows Run checks with no Backup;
    - the control is a confirmed site, which shows four steps;
  - (b) `pro`: the same two rows and the advice, the sub line "Ghost(Pro) · {host}", "2 rows still to tick" (R-283);
  - (c) `unknown`: the same card, the sub line the host alone (R-283);
  - (d) no token: no Theme Download, and `routes.yaml`'s present (R-282);
  - (e) `snapshot: ok`, held: B12a's four rows with the name and version, Cancel live, then S8c;
  - (f) `no_token` → B12b with the 403 line and the Design & branding link → Deploy without a snapshot → S8c;
  - (g) `failed` → B12b's request and status → Add token → D1b → Back → B12b;
  - (h) Theme Download → the navigation to `/snapshots/{id}/download`, canned.
- [x] `tools/keyboard/floor.spec.mjs` -- Backup at 1440 (780 card, scrolling inside the dialog), 820 and 390 (no
  horizontal scroll; each Download under its text), and B12a and B12b at 1440 and 390 -- the frames' widths.
- [x] `tools/probe/record-snapshot.mjs` (**new**; a `doc-audit.py` catalogue row) -- §89, T1, read-only, keys read
  in-process by name, through the product's own `adminRequest`. It prints status, type and lengths only:
  - `GET themes/` with `GHOST6_STAFF_ACCESS_TOKEN` gives 200, the active theme's name and version, and its
    `package.inflozo` flag;
  - `GET themes/{active}/download/` with the same token gives 200, `application/zip`, the disposition, byte length, the
    `PK` magic and a sha256;
  - the same download with the token's last hex flipped gives 401 (the control);
  - the same download with `GHOST6_ADMIN_API_KEY` gives 403;
  - `GET themes/` with the Admin key gives 403 (the one code's Ghost 6 half);
  - `GET settings/routes/yaml/` with the Admin key gives 200 (R-282's premise, §37 re-run)

  -- standing rule 1, executed. *(Dev: written; its local half holds. The `--t1` half — §89, which moves VERIFY-AT-BUILD 78 to
  EXECUTED — is the main session's, on the owner's in-session go.)*
- [x] `tools/probe/run-verify-editor.cjs` -- steps 113a and 114 answer Backup as they answer Safety net (the column set
  through the service key, read back). **Step 117**, on production, writes to T1 and puts it back:
  - (a) a throwaway account connects T1 through the wizard, and `hosted_by_ghost` reads `false`:
    - Ship it → Next → Add token (`GHOST6_STAFF_ACCESS_TOKEN`) → Backup shows D1d with both Downloads;
    - Theme Download gives a `site_snapshots` row (`casper`, bytes > 0), and its signed URL's bytes equal Ghost's download;
    - `routes.yaml` Download equals `GET settings/routes/yaml/`;
    - tick both rows and the confirmation, then Run checks: `backup_confirmed_at` is set;
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

  -- R-82 on the real stack. *(Dev: written, gated on `T1_WRITES=1`; steps 113a, 114 and 116 now confirm the gate through the
  service key. The run is the Review's, at the deployed sha, on an in-session go worded for the whole run.)*
- [x] Docs -- each finding reaches its document:
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
  copy of the theme and `routes.yaml`, its two rows (R-283), under advice that recommends, and never requires, a backup of
  the rest of the site from Ghost Admin. The master confirm and Run checks stay greyed with their reasons
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
  - the gate matches D1d in `D1 First-Deploy Gates.dc.html` (`:208-358`) as R-283 cut it — the panel, the advice in the
    shortcut panel's place, the Theme and `routes.yaml` rows, the rule, the master confirm and the footer — at 780px;
  - the running and degraded snapshot states match B12a and B12b as corrected (`B Missing Surfaces.dc.html:1044-1102`), at
    600px;
  - the rail matches D1's six-step rail (`:51-63`) when both first-deploy steps show.

  The departures are those in Design Notes, each told.
- Given the migrations are withheld, when the RLS gate runs, then the 7.20 block aborts at its first check.

### Review Findings

Five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the Real-infra verifier as subagents;
walk step 117, T1's put-back and every T1 write in the main session, on the owner's in-session go). One decision for the
owner (Question 5), 14 patches (all applied), 2 deferred, 18 dismissed — among them: B12b's Deploy without a snapshot is
honoured on a ship that never rested on B12b (AD-29: a consent gate, not a control — it is the customer's own copy); the
Theme Download's server action has no stated `maxDuration` (read from Vercel's project API: Fluid compute,
`functionDefaultTimeout` 300 s, so the capture's 15 + 45 s of Ghost reads fit); a skipped capture leaves no trace (every Ghost
call writes its audit row, `ghost-admin/index.ts`); two captures at once leaving an object behind (the prefix drains sweep it,
as the capture's docblock says); B12b's "→ 200" for a list with no usable theme (true: Ghost answered 200 with nothing to
take); B12b's "Settings → Design & branding" (the spec's Words, the label linked to the site's own panel — the doc comment
that said "never a menu path" is corrected); the first upload after every linked project is deleted re-capturing (the I/O
matrix's own "Project deleted" row — and Question 5's subject); the theme download's 45 s budget untested through `call()`
(read: `ghost-admin/index.ts:377` hands `read` on and `:444` budgets by it); the route's `withoutSnapshot` and the server's
writes proved only by source text (walk 117 executes both on production, below).

- [ ] [Review][Decision] A Theme Download on a gate shown again after a reconnect replaces the snapshot the first upload took — AC5 says that snapshot "stays, through that"; Design Notes say the Download writes the site's row. Two approved texts disagree, so it is the owner's (Question 5) [`(editor)/actions.ts` `downloadLiveTheme` · `server/snapshot.ts`]
- [x] [Review][Patch] B12a's Cancel pressed while a capture that then FAILED was running was lost: the job rested on B12b with `cancel_requested` still set, and B12b's next press (Deploy without a snapshot, or a kept token's re-ship) found it and cleared the job the customer had just asked to ship; the flag is now read before the job rests [`server/deploy/run.ts` `ship` · `deploy-run.test.ts`]
- [x] [Review][Patch] A re-ship after B12b whose artefact had gone stale kept the failed capture's `at` through the recompile, so a compile or check failure then was named "Archiving your current theme failed" at Ship; a capturing re-ship now starts the archive's record afresh [`run.ts` · `deploy-run.test.ts`]
- [x] [Review][Patch] B12b blamed Ghost ("Ghost didn't hand over your live theme") for a refusal of our own store; a `Storage` answer now says the infrastructure sentence, as the Theme Download already did [`lib/deploy.ts` `snapshotError` · `deploy.test.ts` · `deploy-run.test.ts`]
- [x] [Review][Patch] The Theme Download read Ghost's status before the capture's cause, so a revoked token said "Ghost didn't hand over the file (401)" and a token removed meanwhile "(403)"; the mapping is now one pure function, causes first, and tested [`server/snapshot.ts` `downloadSaid` · `(editor)/actions.ts` · `snapshot.test.ts`]
- [x] [Review][Patch] The `routes.yaml` Download asked again with the Admin key after the staff read found no Ghost at all — two 15-second waits before "unreachable" — and `liveRoutesFile` had no test; it now falls back only on Ghost's own refusal, with a test of every branch [`server/routes-upload.ts` · `routes-upload.test.ts`]
- [x] [Review][Patch] A failed read of the site's current snapshot row was swallowed silently; it is now logged before the capture goes on [`server/snapshot.ts`]
- [x] [Review][Patch] B12a ticked "Writing the snapshot" done as soon as its size was known, before the write; the frame draws it still running beside the size, and journeys (e) and (e3) now hold both states [`components/editor/deploy-wizard.tsx` · `journey.spec.mjs`]
- [x] [Review][Patch] B12b's Add token started a re-ship that no control said was working (R-98); the button now says "Starting…" and is `aria-busy` until the row moves [`deploy-wizard.tsx` · `busy.test.ts`]
- [x] [Review][Patch] Live's total time left out the archive's [`deploy-wizard.tsx` S8d]
- [x] [Review][Patch] No test ran a stale artefact at a first upload (recompile, then archive, then upload), or a capture that throws [`deploy-run.test.ts`]
- [x] [Review][Patch] `hostedByGhost` was inserted between `capabilityOf` and its docblock, orphaning it, and still said an unknown host "draws both paths" [`lib/probe-rule.ts`]
- [x] [Review][Patch] Comments R-281 and R-283 left stale: the marker "gates restore scope" (7.23's since R-281), `addSafety`'s "straight on to the checks", the Backup actions' "D1d/D1d′/D1e", `SNAPSHOT_WORDS`' "never as a menu path", and `record-snapshot.mjs`' "six GETs and the capture's own two" (a count, already wrong) [`theme-compiler/src/compile.ts` · `deploy-wizard.tsx` · `(editor)/actions.ts` · `lib/deploy.ts` · `record-snapshot.mjs`]
- [x] [Review][Patch] R-283 never reached `epics.md`: Story 7.20a's card still matched D1d′ and D1e; a dated note now says the gate as cut, and R-283's target list carries it [`epics.md` · `reconcile-designs-decisions.md`]
- [x] [Review][Patch] `deploy-run.test.ts` built B12b's expected body from the actual one, so no body was ever checked; it now names each cause's sentence [`deploy-run.test.ts`]
- [x] [Review][Defer] The database's own comment on `sites.hosted_by_ghost` (applied at Schema) and `SCHEMA.sql`'s mirror still describe a D1e gate and "both paths" [`20261027120000_backup_gate.sql` · `SCHEMA.sql`] — deferred, a production DDL apply of its own (DW-390, Story 7.20b's Schema)
- [x] [Review][Defer] The Theme Download follows Story 2.5's route as a link, so its improbable 404, 502 or sign-in answer replaces the editor page instead of a sentence under the row [`deploy-wizard.tsx` `follow`] — deferred to the story that offers the same download again (DW-391, Story 7.23)

## Spec Change Log

**Dev (2026-10-26) — readings and departures, each a routine call told in one line (none changes what a surface does):**
- **`ShipState.site.hosting`, not `host`**: `host` was already the site's address (`hostOf`); the host KIND is `hosting`
  (`'self' | 'ghost_pro' | null`).
- **The capture is two files, `server/snapshot.ts` and `server/snapshot-io.ts`** — `routes-upload.ts`/`routes-io.ts`' split: the
  rule takes its io handed in and is what `node --test` reaches (a file that imports the service role cannot load there); the
  real io is the file on both `server-wiring.test.ts` lists, with its reasons. `deploy-io.ts`' `snapshot` and `downloadLiveTheme`
  hand it in.
- **The download's read budget is 45 s** (`READ_TIMEOUT_MS.theme_download`); the ship's worst case of Ghost time (list 15 +
  download 45 + upload 120 + activation 15 + routes 3 × 15) is 240 s, held by `ghost-admin-rule.test.ts` against 300.
- **B12a's rows learn as the capture does**: `captureSnapshot` hands progress (the theme, then the size) that `ship()` writes to
  `stage_timings.snapshotting` at once, best effort — without it row 1's name could never be seen before the upload.
- **D1d′'s collapsed rows are a list, not boxes**: the shortcut holds them, as the frame draws them (no pointer on the ticked
  marks); unticking the shortcut returns each row's own box and tick.
- **"Confirm available" is said each time the confirm becomes available** — once per becoming, so an untick and a re-tick say it
  again; a shortcut toggle over rows already ticked says nothing.
- **Run checks greyed is S8b's greyed Ship it** (`opacity-35`, `greyedProps`, the footer's reason), not the frame's grey fill: a
  caller's fill loses to the Kit's stylesheet order (7.19's reading).
- **B12b's Add token view has no Not now**: over B12b, the way on without a token is B12b's own Deploy without a snapshot; Back
  returns to B12b, and the rail stays at Ship.
- **B12b's Cancel cancels a job RESTING with a capture's answer** (`cancel()` moves it off `awaiting_ship` first, then clears the
  object and the deploy row, AD-29); a clean resting Pre-flight still refuses a Cancel, as 7.18a holds.
- **The Theme Download's failure words**: Ghost's status → "Ghost didn't hand over the file ({status})…"; the store → the
  infrastructure sentence; no answer → `DEPLOY_WORDS.unreachable(host)`; a token gone meanwhile → B12b's no-token body. Each from an
  approved list; the row's help link stays the way forward.
- **Two derived strings**: an infrastructure failure while archiving is "{B12a's title less "first"} failed" (`STAGE_NAMES`), and
  the stage is said politely as it starts with B12a's title as a sentence (DW-378's rule). No new words.
- **The harness's `x-inflozo-harness-snapshot` drives the Theme Download** (`harnessTheme`); Ship it's capture is the deploy
  route's, which the harness never reaches, so the journeys can its `snapshotting` and B12b views through `page.route`, as every
  other stage.
- **Walk step 116 is re-expected too**: its planted site and G's T1 record are confirmed through the service key, so D1c's
  Continue and a kept token still go straight to the checks; 117 walks the gate.
- **The main session's matrix audit (2026-10-26) added two checks a row had no test for:**
  - "Ship, first upload, marked" — `marked` reached the job only with the upload's edge, so B12a's row 2 could never say "No
    snapshot needed" before S8c took over. `ship()` now writes it at once, as the capture's progress is
    (`deploy-run.test.ts`, first seen red at the old line), and journey **(e3)** draws it (red with the wizard ignoring it);
  - "Disconnect, reconnect" — `server-wiring.test.ts` holds that the reset rides the disconnect stamp's own write (red with it
    removed); the walk's 117c proves it on production.
- **For the Review to weigh, not a change:** a Theme Download on a gate RE-SHOWN after a reconnect writes the site's row (this
  section's "The Theme Download writes the site's snapshot row"). A marked live theme writes nothing, so the usual case keeps the
  first upload's original; only a customer who put a non-Inflozo theme live in Ghost Admin since would replace it with that one.
- **Walk step 117a's byte comparison stands:** §89's capture downloaded Casper a second time and the bytes were identical
  (sha256), so Ghost's zip-on-the-fly is deterministic on T1.

**R-283 (owner, 2026-10-26, after Dev) — the gate cut to two rows.** What changes, and what each Dev line above it no
longer holds:
- **The rows.** `gateRows` gives Theme and `routes.yaml` on every host. Content, Members, Redirects, "Images, files and
  media" and Database are gone, and so is the Ghost(Pro) Database chip.
- **The shortcut, D1d′ and the Ghost(Pro) block are gone,** and so are the collapsed list, the coral shortcut tick and
  `blocksFor`. The two Dev lines on D1d′'s list and on a shortcut toggle no longer apply.
- **The advice replaces the frame's lead.** It sits in the shortcut panel's place, in the "What Inflozo writes" panel's
  vocabulary: its eyebrow, its body, and Ghost's help on exports. The lead-in line then introduces the rows.
- **The master confirm is reworded** to the two files.
- **`hosted_by_ghost` stays** (the probe writes it, already applied to production); it now decides the sub line alone.
- **Read in source before writing the advice** (6.58.0 and 5.130.6 npm tarballs, standing rule 1): Ghost Admin's download
  routes for each thing it names exist on both majors:
  - `GET /posts/export` (`posts.exportCSV`, the post-analytics CSV; 6.58.0's settings bundle draws it beside "Content &
    settings");
  - `GET /members/upload` (`members.exportCSV`);
  - `GET /redirects/download` (6.58.0 "Download current redirects");
  - `GET /db` (the content export).

  No menu path is named (BACKUP-GATE.md).
- **The Backup footer wraps below `tablet`** (main session, after R-283's screenshots): at 390 the reason beside Back and Run
  checks squeezed Run checks' label onto two lines. The reason now takes its own line there. The floor holds "Run checks on
  one line" at 1440, 820 and 390, and it was seen red at 390 with the old row.
- **Built under R-283 (Dev, 2026-10-26), each a routine call:** the rows are `GATE_ROWS`, a constant — no row depends on the
  host any more, so `gateRows(host)` would carry a parameter nothing reads — and `remaining`, `reasonOf`, `toggleRow` and
  `toggleConfirm` take the ticks alone. The advice is D1d's panel (`:243-246`) drawn a second time with its own eyebrow, its words
  and the link; the frame's lead (`:248`) is not drawn. The floor's Backup case holds the card to "scrolls inside the wizard
  wherever it is taller than the window" (cut to two rows, it may fit whole at 1440 × 900, which the floor does not assert;
  stacked at 390 it is taller and scrolls, which it does).

**Review (2026-10-26) — readings, each a routine call told in one line (none changes what a surface does):**
- **Our store's refusal says the infrastructure sentence** (`DEPLOY_WORDS.infrastructure`), on B12b as on the Theme row — an
  approved sentence, never "Ghost didn't hand over"; the inset still names `Storage`.
- **A revoked token's Theme Download says B12b's "no longer recognises" body** (`SNAPSHOT_WORDS.tokenRefused`), and a token
  removed meanwhile its no-token body, whatever Ghost's status.
- **B12a's row 2 stays running beside its size** until the upload's own view takes over, as the frame draws it; a marked theme's
  row 2 is done at once.
- **B12b's Add token says "Starting…"** while the re-ship its kept token started is out.
- **Live's total counts the archive's time.**
- **The `routes.yaml` Download asks once when Ghost does not answer** — the Admin key's fallback is for Ghost's own refusal.
- **Weighed, and put to the owner (Question 5):** Dev's "For the Review to weigh" line above. AC5 and Design Notes disagree, so
  the code is unchanged until he rules.

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
| ~~Lead~~ | *replaced by R-283's advice and lead-in, below* |
| Advice *(R-283, the owner's wording, Question 4)* | eyebrow OPTIONAL, BUT RECOMMENDED · We recommend keeping a backup of your Ghost site. In Ghost Admin you can download your content, members, redirects and post analytics at any time. Inflozo never changes any of these, so this is up to you. · Ghost's help on exports ↗ |
| Lead-in *(R-283)* | To continue, save a copy of the two things Inflozo writes: |
| ~~Shortcut~~ | *dropped by R-283* |
| ~~Shortcut ticked caption~~ | *dropped by R-283* |
| ~~Ghost(Pro) block~~ | *dropped by R-283* |
| Theme | INFLOZO REPLACES THIS · Look for the theme marked as active in Ghost Admin and download it as a zip. · ⚠ The one thing that makes rollback possible. · Ghost's help on themes ↗ |
| routes.yaml | INFLOZO MAY OVERWRITE THIS · Wherever Ghost Admin accepts a routes file, it also offers the current one as a download. · Ghost's docs on dynamic routing ↗ |
| ~~Content~~ | *dropped by R-283* |
| ~~Members~~ | *dropped by R-283* |
| ~~Redirects~~ | *dropped by R-283* |
| ~~Images, files and media~~ | *dropped by R-283* |
| ~~Database~~ | *dropped by R-283* |
| Download · busy | Download · Preparing… *(busy, R-98)* |
| Download failed *(extrapolated)* | Ghost didn't hand over the file ({status}). Use the help link on this row to download it from Ghost Admin. |
| Live theme is Inflozo's *(extrapolated)* | Your live theme is already an Inflozo theme, so there's no original to download here. |
| Master confirm *(R-283, Question 3)* | I have a copy of my theme and routes.yaml, and I understand Inflozo will replace my theme. |
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
| The advice *(R-283)* | `https://ghost.org/help/exports/` |
| ~~Redirects~~ | *dropped by R-283* |

**Routine calls**, each a reading of an approved source, told to the owner in one line each; none is put to him:
- **"Add token" on B12b,** not "Add the token". R-170 makes it the one name, as 7.19 ruled D1b's.
- **"This site", not "this project",** in B12b's body. The token belongs to the site (R-278).
- **The Theme row links Ghost's "Installing a theme" page.** The frame's address is gone (404).
- **"Settings → Design & branding" in B12b,** linked to the site's own Design panel. That is Ghost's label on both majors,
  and E-5's own rule moves a wrong label to a description plus a link.
- **No coral progress bar on B12a.** DESIGN.md:518-522 allows one only where a real byte count exists, and the server
  reports none while it works. Row 2 carries the real size once it is known.
- **Greyed, not `disabled`.** The frames' native `disabled` on Run checks loses the reason and the focus (R-98).
- *(Before R-283: an unknown host showed both blocks. Every host now draws the same card.)*
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
- **the Ghost(Pro) and unknown-host sub lines of the Backup step.** Since R-283 every host draws the same card, and T1 is
  self-hosted, so the keyboard journeys prove the other two sub lines;
- **"the live theme is already Inflozo's".** The walk (step 117b) proves it.

**Part A — with the token**

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the first alias and open the link in your inbox. | `umngkmr+backup720@gmail.com` | Start. |
| 2 | `https://app.inflozo.com/sites` | Sites | Press **Connect a site** and finish the wizard with the integration's two keys. | `https://ghost6.inflozo.com` + the two keys | ghost6 is **Connected**, and a project linked to it opens. |
| 3 | `https://app.inflozo.com/projects/<P>` | Editor | Press **Ship it**. | — | The button reads **Next**, and the steps read **Destination · Safety net · Backup · Check · Ship · Live**. |
| 4 | `https://app.inflozo.com/projects/<P>` | Safety net | Press **Next**, paste your profile's token, and press **Add token**. | your token | "Adding…", then a wide card: **"Back your site up before we replace the theme"**, with "Self-hosted Ghost · ghost6.inflozo.com" under it. |
| 5 | `https://app.inflozo.com/projects/<P>` | Backup | Read down the card. | — | A panel saying Inflozo writes only your theme and routes.yaml. Then **"OPTIONAL, BUT RECOMMENDED"**: a friendly note that you can download your content, members, redirects and post analytics from Ghost Admin, with **Ghost's help on exports ↗**. Then "To continue, save a copy of the two things Inflozo writes:" and **two rows only**, Theme and routes.yaml, each with a box, a line of help, a "↗" link and **Download**. No `ghost backup` box, and no Content, Members, Redirects, Images or Database rows. At the bottom: a grey confirmation, **"2 rows still to tick, then the confirmation above."**, Back, and a grey **Run checks**. |
| 6 | `https://app.inflozo.com/projects/<P>` | Backup | Press **Download** on the Theme row. | — | "Preparing…", then a zip named for ghost6 and **casper** downloads. Open it: Casper's files. |
| 7 | `https://app.inflozo.com/projects/<P>` | Backup | Press **Download** on routes.yaml. Then click **Ghost's help on themes ↗**. | — | A `routes.yaml` file downloads. Ghost's "Installing a theme" page opens in a new tab. |
| 8 | `https://app.inflozo.com/projects/<P>` | Backup | Tick **Theme** only. Then press the grey **Run checks**. Then click **Ghost's help on exports ↗**. | — | **"1 row still to tick, then the confirmation above."** Run checks does nothing. Ghost's exports help page opens in a new tab. |
| 9 | `https://app.inflozo.com/projects/<P>` | Backup | Tick **routes.yaml**. Tick the confirmation. Then untick **routes.yaml**, and tick it again. | — | With both rows ticked, the footer reads **"One confirmation left."** and the confirmation is no longer grey. Ticking it makes Run checks no longer grey. Unticking routes.yaml unticks the confirmation and greys Run checks again; ticking routes.yaml again brings back "One confirmation left." |
| 10 | `https://app.inflozo.com/projects/<P>` | Backup | Tick the confirmation and press **Run checks**. | — | "Starting…", then Pre-flight, with **Safety net** and **Backup** both ticked in the steps. |
| 11 | `https://app.inflozo.com/projects/<P>` | Ship | Press **Ship it**. | — | For a moment, **"Archiving your current theme first"**: "Reading the live theme from Ghost" with **casper** and its version, "Writing the snapshot" with a size, and "Kept outside your version limit." Then Shipping, then Live. |
| 12 | `https://app.inflozo.com/projects/<P>` | Destination | Close the wizard and press **Ship it** again. | — | No Safety net and no Backup: **Run checks**, four steps. |
| 13 | `https://app.inflozo.com/account` | Account | Press **Delete account**, type the phrase, and press **Delete account**. | `delete my account` | "Your account is set to be deleted", listing ghost6's **casper** with **Download**. An email arrives listing the same theme. |
| 14 | the same page | Account deletion | Press **Download**, then **Restore account**. | — | The casper zip downloads. Your account is back. |

**Part B — without the token** (a second account, so its first upload is a first one)

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 15 | `https://app.inflozo.com/sign-in`, then `/sites` | Sites | Sign out, sign in with the second alias, and connect ghost6 with the same two keys. | `umngkmr+backup720b@gmail.com` | ghost6 **Connected**; a project opens. |
| 16 | `https://app.inflozo.com/projects/<P>` | Safety net | Press **Ship it**, **Next**, **Not now**, then **Continue**. | — | The Backup card again — the same two rows — now with **no Download on Theme** and a Download on routes.yaml (R-282). |
| 17 | `https://app.inflozo.com/projects/<P>` | Backup | Tick both rows, then the confirmation, then **Run checks**, then **Ship it**. | — | **"We could not archive your current theme"**, the line **GET /ghost/api/admin/themes/ → 403**, "Ghost keeps your previous theme under Settings → **Design & branding**…", and **Add token**, **Deploy without a snapshot** and **Cancel**. |
| 18 | `https://app.inflozo.com/projects/<P>` | Snapshot failed | Press **Add token**, then **Back**. | — | The token box from Safety net, then back to the same card. |
| 19 | `https://app.inflozo.com/projects/<P>`, then `https://ghost6.inflozo.com` | Ship | Click **Design & branding ↗**. Then press **Deploy without a snapshot**. | — | Ghost Admin's Design panel for ghost6 opens in a new tab. Then "Starting…", Shipping, and Live. |
| 20 | `https://ghost6.inflozo.com/ghost/`, then `https://app.inflozo.com/sites` | Cleanup | In Ghost: **Settings → Design & branding → Change theme → Casper → Activate**, delete the `inflozo-…` themes, and delete the Owner test 7.20 integration. In Inflozo, on each alias: ⋯ → **Disconnect** on ghost6. | — | T1 is back as it was, and Inflozo holds no key of yours. |

## Questions for the owner

Questions 1 and 2 were ruled on 2026-10-26, each option 1 (R-281, R-282). Questions 3 and 4 were ruled the same day after
Dev, when the owner cut the gate to two rows (R-283). **Question 5, from the Review, is open.** "Ruled values" in Design Notes holds what 1 and 2 set;
the Intent's R-283 paragraph and "Words" hold what 3 and 4 set.

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

### Question 3 — With two rows left, is there still a separate confirmation?

**The owner's instruction (2026-10-26, after Dev), in his words:** *"Cut it to only two rows. And add a disclaimer at top,
that we advise to take a backup of your Ghost site. They might not be technical to use tools to take DB backup, etc. But just
inform that they can take backup like they can do via Ghost Admin to take backup like redirects, content, members, post
analytics. This is a hard gate and taking a DB backup using Mysql dump is too technical for users which I want to avoid.
Just add two rows and allow them to download it. The top advice should not be like a harsh wording so they get scared, just
inform them that it is advisable and not a mandatory step. Use friendly and formal English - simple to understand."*

**In plain English.** With only Theme and routes.yaml left, should the customer tick the two rows and go on, or tick them
and then one more confirmation box?

**An example.** A customer downloads both files and ticks them. Under option 1, Run checks turns on. Under option 2, they
also tick "I have a copy of my theme and routes.yaml, and I understand Inflozo will replace my theme."

1. **(RECOMMENDED) Two ticks only.** No extra box; with two rows it would repeat what the ticks say.
2. **Two ticks and a confirmation,** as the design draws it, reworded to the two files.

**Ruled: option 2 (owner, 2026-10-26) — R-283.**

### Question 4 — The wording of the friendly advice

**In plain English.** The advice at the top says a full backup is optional and names only what Ghost Admin can download.

**An example.** *"OPTIONAL, BUT RECOMMENDED — We recommend keeping a backup of your Ghost site. In Ghost Admin you can
download your content, members, redirects and post analytics at any time. Inflozo never changes any of these, so this is up
to you. Ghost's help on exports ↗"*, then *"To continue, save a copy of the two things Inflozo writes:"*

1. **(RECOMMENDED) Use this wording.**
2. **Shorter:** one sentence and the link, no lead-in line.

**Ruled: option 1 (owner, 2026-10-26) — R-283.**

### Question 5 — Once Inflozo has saved your original theme, can anything replace it?

**In plain English.** The first time Inflozo uploads to a site, it saves a copy of the theme that was live there — your
"original", the one "Restore original" (Story 7.23) puts back. Two things can replace that saved copy today: pressing
**Download** on the Backup step's Theme row (it saves whatever theme is live at that moment, then hands it to you), and the
first upload after every project linked to that site has been deleted. Usually nothing changes, because the live theme by
then is Inflozo's own and is never saved. It changes only if someone has put a different, non-Inflozo theme live in Ghost
Admin in between. The acceptance criteria say the first copy "stays, through" a disconnect and reconnect; the design notes
say the Download writes the copy. They disagree, so this is yours.

**An example.** Your site ran **Casper** when you first shipped with Inflozo, so Casper is saved. Later you disconnect, switch
the site to a theme you bought, **Edition**, in Ghost Admin, and reconnect. The Backup step shows again, and you press
**Download** on Theme.
- Under option 1, you get your saved **Casper**, and Casper stays the original.
- Under option 2, Inflozo saves **Edition**, hands it to you, and Edition becomes the original — Casper's copy is gone from
  Inflozo (Ghost itself still keeps Casper installed).

1. **(RECOMMENDED) Keep the first copy for ever.** Once a site has a saved original, nothing replaces it: the Theme row's
   Download hands that saved copy back, and a later first upload (after projects are deleted) saves nothing new. It is what
   "the original" means, and what the acceptance criteria promise.
2. **Keep it as built.** The Download, and the first upload after every linked project is deleted, save whatever
   non-Inflozo theme is live then, replacing the earlier copy — "what we roll back to" is the theme Inflozo replaced most
   recently.

**Ruled:** _(awaiting the owner)_

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

**Executed — Dev, the main session (2026-10-26 IST, Node 24; the real services by their variable names):**
- **Supabase (local gate):** `bash supabase/tests/run-rls-gate.sh` — green, the 7.20a block's 14 PASS lines (the columns, comments
  and stage; the tenant's own read and not another's; 42501 on both columns with the title control; Cancel at `snapshotting`
  with `uploading` refused as the control; `site_snapshots` insert, update and delete 42501; another tenant sees none of it, its
  own snapshot the control; the refused writes changed nothing; the project's deletion left its site's snapshot). 7.18a's stage
  check now sets `snapshotting` aside, so it still proves 7.18a's alone. **Control:** a scratch copy without both 7.20a
  migrations (and HEAD's `SCHEMA.sql`) — exit 3 at `FAIL (7.20a): sites.backup_confirmed_at (timestamptz) or
  sites.hosted_by_ghost (boolean), nullable with no default, is missing`, the block's first check, right after 7.19's last PASS.
- **GitHub CI** (`GITHUB_TOKEN`, read only) on the Schema push `b5c151e689bbb6debe94d1d0f4e30254e525a9a9`: CI `rls` ✓,
  `check` ✓, `deploy` ✓; Render matrix ✓.
- **Supabase production** (`SUPABASE_DB_POOLER_URL`, read in-process; the owner's in-session go, "1. Yes, apply both"): before
  the apply, neither column existed, `job_stage` had no `snapshotting` and `deploy_jobs_owner_cancel` held (queued, compiling,
  checking) — the control. Both files applied, each in its own transaction. Read back:
  - `information_schema.columns`: `backup_confirmed_at` `timestamp with time zone` and `hosted_by_ghost` `boolean`, both
    nullable with no default; `col_description` gives each migration comment verbatim;
  - `enum_range`: `{queued,compiling,checking,awaiting_ship,snapshotting,uploading,activating,done,failed,cancelled}`;
  - `pg_policies`: `deploy_jobs_owner_cancel` with `snapshotting` among its stages;
  - `authenticated` has no UPDATE on either column, and `sites`' UPDATE columns are still `favicon_url, title, updated_at`.
- **T1** `ghost6.inflozo.com` (`GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_ADMIN_API_KEY`, read in-process; GETs only,
  nothing written; the owner's in-session go, "1. Go, read-only"): `node --experimental-strip-types
  tools/probe/record-snapshot.mjs --t1` — every row PASS, MEASUREMENTS §89 written. Nine GETs in all: the six rows, plus
  `captureSnapshot`'s own three (two staff, one Admin). The results:
  - `GET themes/` with the staff token → **200**, `casper` 5.12.1 active, `package.inflozo` false;
  - `GET themes/casper/download/` with it → **200 `application/zip`**, `attachment; filename=casper.zip`, no `Location`, 291174
    bytes opening with `PK`;
  - the same download with one flipped digit → **401 `UnauthorizedError`** (the control, which held);
  - the Admin key → **403 `NoPermissionError`** on the download and on the list;
  - `GET settings/routes/yaml/` with the Admin key → **200** `application/yaml`, 130 bytes (R-282's premise);
  - `captureSnapshot` read them as captured (object before row, recorded and not written), and as `snapshot_needs_token` with
    the 403. Its own download was byte-identical to the first.

  VERIFY-AT-BUILD 78 is moved to EXECUTED, and the capture's plan stands as built. Ghost 5's 501 goes to DW-326 (R-238).
- `pnpm check` (Node 24): green — lint, typecheck, every package's tests, 0 failed. Each package prints its own count. Re-run
  green after the audit's two additions.
- `pnpm keyboard` (Node 24), the whole gate on the subagent's tree: 319 passed and 1 failed, in 18.2 min. The failure was the
  bar-width floor (`floor.spec.mjs:610`): a canvas not painted in time, while a source file was briefly edited under `next dev`
  for the disconnect test's red run. Re-run alone, it passed 2 of 2. Then `-g '7\.20a · \((e|e3)\)'` passed 2 of 2.
  - **(e3)'s control:** with the wizard drawing "Writing the snapshot" whatever the stage says, (e3) FAILS at row 2. The file
    was restored byte-identical (`cmp`).
  - The subagent's own runs: journeys (a)–(h) with (e2), the floor, and 7.18/7.19's neighbours all PASS. Its spot controls each
    went red: no marker check, Ghost 5's 501 unmapped, a capture on a bound site, no polite sentence, and a Theme Download
    without a token.
- `node --experimental-strip-types tools/probe/record-snapshot.mjs` (the local half): every row PASS. `--help` exits 2.
- `node --check tools/probe/run-verify-editor.cjs`: clean. Steps 117 and the re-expected 113a, 114 and 116 are the Review's
  part, on the Dev push's deployed sha, from a clean worktree, with their own T1 go.
- The grep for "Story 7.20a adds Backup", "less Backup", "Settings → Design," and `stepsFor(true)` finds only dated notes, the
  frames and the prototypes lifted from them, the Appendix A prompts (a record of what was asked), PRD backups, and build
  caches. Nothing stale.
- **Vercel** (`app.inflozo.com`) and the walk's step 117 are the Review's.

**Executed — the R-283 rework (2026-10-26 IST, Node 24; no T1 or production call):**
- **Read in source, standing rule 1, before the advice was written.** These are Ghost's own npm tarballs for 6.58.0 and
  5.130.6, read-only from registry.npmjs.org. Ghost Admin's download routes exist on both majors:
  - `GET /posts/export` (`posts.exportCSV`, filename `…analytics…csv`; 6.58.0's `settings-KSWWQanQ.js` draws it beside
    "Content & settings", `post-analytics-export-button`);
  - `GET /members/upload` (`members.exportCSV`);
  - `GET /redirects/download` (6.58.0 "Download current redirects");
  - `GET /db` (the content export).

  So "content, members, redirects and post analytics" names what Ghost Admin really downloads, and Ghost's exports help page
  answered 200 at this Create.
- `pnpm check` — green, 0 failed (each package prints its own count).
- `pnpm keyboard`, the whole gate on the R-283 tree — **321 passed, 0 failed** (21.8 min). After the footer fix,
  `-g '7\.20a|7\.19'` — 26 passed, and `pnpm lint` is clean.
  - The Backup floor's first run after the fix lost one case to a cold compile (`toBeVisible`); re-run, it passed 7 of 7.
  - **The footer's control:** with the old single row, "Run checks on one line" FAILS at 390 and holds at 1440. The wizard
    was restored byte-identical (`cmp`).
- The subagent's controls, each seen red then green: five extra rows counted, the confirm not unticking, the wrong exports
  link, the old lead in the advice's place, a third row, and the old confirm sentence. It also caught that the floor missed a
  third row, and it now counts every row. Journey (a)'s "said" count is polled after it flaked 2 in 5; then 8 of 8.
- **Screenshots** of the harness card at 1440 and 390: the panel, the advice, the lead-in, two rows with Download, the
  reworded confirm and the footer, as R-283 rules.
- Walk step 117 (re-expected for two rows) is still the Review's, on the deployed sha, with its own T1 go.


**Executed — Review (2026-10-26 IST, Node 24; the owner's in-session go, "1. Go, the whole run", then "1. Yes, reset and
re-run" for T1's leftover theme; keys read in-process by their variable names):**
- **GitHub CI and Vercel** (`GITHUB_TOKEN`, `VERCEL_TOKEN`, read only) on the Dev head `c9b34168`: CI `rls` ✓, `check` ✓,
  `deploy` ✓, Render matrix ✓; `dpl_8X8gdULkf7JJRPpdzBBA1M24PFpu` READY and serving `app.inflozo.com` and `inflozo.com`. The
  project's function default, read from Vercel's API: Fluid compute, `functionDefaultTimeout` 300 s (the Theme Download's
  server action runs under it).
- **Supabase production, read only** (`SUPABASE_DB_POOLER_URL`, every read inside `BEGIN READ ONLY`): both columns
  (`timestamp with time zone`, `boolean`, nullable, no default, their comments), `authenticated` reading and updating
  neither (its UPDATE columns still `favicon_url, title, updated_at`), `job_stage` with `snapshotting` (3.75) between
  `awaiting_ship` and `uploading`, `deploy_jobs_owner_cancel` on `{queued,compiling,checking,snapshotting}`, `site_snapshots`'
  columns and `UNIQUE (site_id)`, its one select policy, and the `site-snapshots` bucket private with no Storage policy.
  Controls: `hosted_on_ghost_pro` and `restoring` absent, `uploading` not in the cancel policy, `title` updatable. **R-99
  holds: production is at least as new as the code.**
- **Vercel, unauthenticated:** `GET /snapshots/{zero uuid}/download` → 303 to `/sign-in` (the route's own guard); `POST
  /projects/{zero uuid}/deploy` with `withoutSnapshot: true` → 401 "Not signed in" (the route's own refusal; the control, a
  route that does not exist, is the proxy's 307).
- **T1, read only, through the product's `adminRequest`:** staff `GET themes/` → 200, `casper` 5.12.1 active,
  `package.inflozo` false; staff `GET themes/casper/download/` → 200 `application/zip`, `attachment; filename=casper.zip`,
  291174 bytes from `PK`; the same with one hex digit flipped → **401** (the control); the Admin key → **403** on the list
  and on the download; `GET settings/routes/yaml/` with the Admin key → 200, 130 bytes; `GET config/` → no `hostSettings`
  (`hostedByGhost` false). `captureSnapshot` with real T1 reads and recorded writes: captured (object, then row), and
  `snapshot_needs_token` 403 with no token, `snapshot_token_refused` 401 with the flipped one, nothing written by either.
- **Walk step 117 on production and T1** (a cut of steps 1–5 + 117, from a clean worktree at `c9b34168`, `T1_WRITES=1`):
  - **Run 1** wrote nothing: its start guard read `inflozo-ghost6` live on T1 (left by an earlier test) and refused, as it
    must. On the owner's go T1 was put back with the staff token: Casper activated (200), `inflozo-ghost6` deleted (204),
    the list read back `casper* racer source`.
  - **Run 2: 117a, 117b and 117c all PASS** (59 PASS, 1 FAIL). The gate on the real stack: `hosted_by_ghost` false at
    connect; the six-step rail and Next; Add token → Backup with the advice, two rows and both Downloads; the Theme Download
    wrote the row (`casper`, 291174 bytes) and Story 2.5's route answered 303 to a signed URL whose bytes equal Ghost's own
    (sha256 595f6552…); `routes.yaml` saved byte for byte (130); `backup_confirmed_at` set by Run checks; Ship it archived
    in its own stage (`casper` 5.12.1, 291174 bytes, 1.07 s), re-captured with the old object gone, and went Live. 117b:
    four steps, the live `inflozo-` theme `marked`, the row unchanged. 117c: disconnect cleared `backup_confirmed_at` and
    kept the row, reconnect re-adopted the record, the gate showed again with no Theme Download and `routes.yaml`'s, Ship it
    rested on B12b with `GET /ghost/api/admin/themes/ → 403` and nothing uploaded, then Deploy without a snapshot went Live
    with `{ skipped: true }`. **117d died** at its first `waitForURL` (the account's deletion request never reached
    `/restore` within 30 s). `finally` put T1 back (`casper*`, no `inflozo-` theme), deleted account H and counted users and
    projects back.
  - **117d alone** (a T1-free cut: a throwaway account, `/account` → Delete account → the phrase → `/restore`, then Restore
    account): **PASS both** — `POST /account → 200`, redirected to `/restore`, then `/?restored=1`; the account deleted.
    The surface is Story 2.5's and holds; 117d is re-run whole on the Review's deployment (below).
- **Patches, each test first seen red at the unpatched line** (`apps/web`, `node --test`; the file restored byte-identical
  after each): the Cancel during a failing capture (`run.ts`), the stale re-ship's record (`run.ts`), the store's body
  (`lib/deploy.ts`), `downloadSaid`'s order (`server/snapshot.ts`), `liveRoutesFile`'s one wait (`routes-upload.ts`) — all
  five RED, then green; `busy.test.ts` RED without B12b's busy Add token; journey (e) RED at "running" with the old row-2
  rule (`cmp` after).
- `pnpm check` (Node 24): green, 0 failed (each package prints its own count).
- `pnpm keyboard -g '7\.20a'`: 17 passed. Then `pnpm keyboard` whole on the patched tree: 313 passed, 8 failed in 21.9 min —
  all eight floor cases (7.3's bin, 7.13's card clicks, the bar's widths, DW-283, 7.18a's narrow bar) waiting for a painted
  canvas, while a server file was edited under `next dev` mid-run (the Dev run's own cause). `--last-failed`: 8 passed.
  `pnpm check` re-run green after that edit.
