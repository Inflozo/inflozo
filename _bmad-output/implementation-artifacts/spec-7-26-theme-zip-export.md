---
title: 'Story 7.26 — Theme ZIP export'
type: 'feature'
created: '2026-11-27'
status: 'in-progress'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '0e06d9b3e78fa041efa6566f42c2ebeff64aa521'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-25-rate-limits-the-compile-budget-and-the-advisory-lock.md']
---

## In plain English

You can now download any project's theme as a zip, on any plan and with or without a connected site, from Ship it's menu
(**Download theme**), and install it on any Ghost yourself. A small window builds and checks the theme, then your browser
downloads `inflozo-{project}.zip`, whose README says how to install it, which Style Pack and fonts it uses, and where to change it.
A site whose Ghost(Pro) plan refuses custom themes now offers **Export theme zip** on its Sites card and **Download theme** in Ship
it, and once a theme has been shipped or exported, its Theme settings keys lock so Ghost keeps their values.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A customer cannot get their theme out of Inflozo. FR-J12's export exists only on paper:
- no route builds a zip without a site, nothing records an export, and `custom_settings.frozen_at` (FR-Q2: keys freeze "once
  deployed **or exported**") is written by nothing — not by export, and, found at this Create, not by Ship it either (Story 7.9's
  spec gave the stamp to 7.18 and 7.26; 7.18a never wrote it);
- B15 and the Preview-only Destination draw an export the app cannot do (DW-60), so a Ghost(Pro) site that refuses custom themes
  is a dead end;
- the theme's README carries only Scripts, Styles and Routes (DW-346), a layer named `con` makes a zip Windows cannot extract
  (DW-336), and two signed Downloads still leave the page or say their failure in another shape (DW-405).

**Approach:**
- **One export run on a `deploy_jobs` row with `site_id` null** (R-295's budget asked first): the project's compile input read
  with no site, compiled, gated by BOTH pinned gscans and the quality gate, zipped, stored as the project's one export object,
  recorded in `exports`, and the shipped setting keys frozen. A route answers at once; the editor polls; the zip comes down by a
  signed URL followed through `followSigned`.
- **Doors, one handler (R-141):** Ship it ▾'s **Download theme** (S4d), the Preview-only Destination's **Download theme** (S8a′),
  and B15's **Export theme zip** (which opens the project's editor with the export asked). A session reading along meets D8g in
  export words first; unsent edits are flushed first, as Run checks does.
- **Ship it stamps the freeze too**, at the upload Ghost accepts.

**Frames (R-74):**
- **Download theme** row: `S4 Editor.dc.html` S4d `:384` ("Download theme" · "Zip of the compiled Ghost theme"), in S4d's order —
  after Deploy only, before Download routes.yaml. (The card's "S8e (Ship it ▾)" is S8e's caption naming this menu; S4d draws it.)
- **Preview-only Destination:** `S8 Deploy.dc.html` S8a′ `:245-262` — the site card with its Preview-only pill, the sentence,
  **Download theme** and **Which Ghost plans work? ↗**.
- **B15:** `B Missing Surfaces.dc.html` B15 `:1187-1226`, its control row `:1219-1225` — **Export theme zip** (ink primary),
  **Re-check plan**, and a greyed **Ship it** at the right.
- **D8g:** `D8 Editor Below 1440.dc.html` D8g `:459-489`, whose own caption `:489` names Export — B5c's `LockTakeover` in export
  words.
- **The export window:** undrawn — extrapolated from S8's 520px modal and S8b's rows (`S8 Deploy.dc.html:89-99`: "Theme
  compiled · 1.4s · 2.4 MB", "Checking your theme (Ghost will love it) · 0 errors · 2 warnings"), in the wizard's components and
  tokens (`StageRow`, `SignedDownload`).
- **DW-405's Sites-page Download:** Story 7.20b's extrapolated row, as built, followed through `SignedDownload` at its 32px.

**The epic's criteria, word for word (R-195), and how this story meets each:**
- **Given** any project **When** I export **Then** I download its compiled theme zip, **Free included** — **including a project
  that is read-only because the account is over its Free project cap**, because read-only means not editable, never locked in
  - No plan, entitlement or project-cap state is asked by the export's door; a Free account and a project with no site export.
  - The over-cap read-only state is Story 12.4's and does not exist yet. Its card gains a dated line at this Create: the export
    door asks for the edit lock, and 12.4's read-only project must still reach it (D4e draws **Export theme zip** on it).
- **And** a project containing Pro sections on a Free account is blocked per the exit rule, and **export gating mirrors deploy
  gating exactly**
  - The export runs every gate Pre-flight runs (RTL, routing, compile refusals, gscan, quality) with the same sentences.
  - The Pro exit gate is Story 12.3's, over deploy AND export (its card says so). Its card gains a dated line naming the export
    route's door beside Run checks'.
- **And** **every export is recorded** — project, version, timestamp — because setting keys freeze "once deployed **or
  exported**" and that rule needs a fact to test against
  - One `exports` row per finished export (`project_id`, `user_id`, `version`, `artifact_path`, `created_at`).
  - The rows whose key the shipped `package.json` declares get `frozen_at`, at export and at Ship it's accepted upload.
- **And** export requires the edit lock, and from a read-only session it first prompts a take-over
  - The route answers 423 without this tab's fresh lock (`holdsLock`); the editor opens D8g in export words first.
- **And** the exported theme includes the `locales/` files — by construction (Story 7.12's compile); checked on the real zip.
- **And** B15's Preview-only card gains the frame's **Export theme zip** beside **Re-check plan** and a greyed **Ship it** with
  its reason, `PREVIEW_COPY.body` regains its export sentence, and `probe-rule.test.ts`'s absence assertion flips in the same
  change (DW-60) — as written (Design Notes, B15).
- **And** *(DW-336)* the export suffixes a reserved Windows device slug — `claim` treats `con`, `prn`, `aux`, `nul`,
  `com0`–`com9` and `lpt0`–`lpt9` as taken, in every theme (the compile, not the export alone, so a deploy and an export of one
  project never differ).
- **And** *(DW-346)* README states, after Styles and before Routes, the install steps, the Style Pack and font pairing in use,
  and where to re-import (Design Notes, Words).
- **And** *(DW-405)* the export's Download follows `followSigned`; the Sites page's original-theme Download joins it
  (`SignedDownload`); the Backup step's two rows say a failure in a mounted `role="status"` line in `text-danger-text`.
- **And** *(Story 7.25)* the export runs on a `deploy_jobs` row with `site_id` null and asks `compileBudget` first; a refused
  export says the budget's first sentence with when it can export again.
- **And** *(DW-409)* decided at this Create, no Schema: the budget keeps counting live rows only. Each option costs the customer
  nothing (the card's test), and the bypass needs deliberate project deletion at under $0.0005 a build. DW-409 closes
  won't-fix with that reason.

## Boundaries & Constraints

**Always:**
- **The export run, in `server/deploy/run.ts`, over `DeployIo` (no new io file):**
  - `startExport({ projectId, userId }, io)` inserts the job (`site_id: null`, `twice`).
  - `exportTheme({ jobId, userId }, io)` runs `queued → compiling → checking → done`, or `failed`, writing every edge through
    `clock`:
    1. `readProject` with `siteId: null`;
    2. the same pre-compile refusals as `compileAndCheck` (RTL, routing), through one shared helper;
    3. `io.compile`, its throw said by `refusalWords`, then `io.zip`, with the size noted;
    4. `checking`: `io.gscan(files, 5)`, `io.gscan(files, 6)` and `io.quality`. Any blocked → `failed` with the first error
       finding (Pre-flight's rule, gscan 6's before 5's, then quality's), and nothing stored, recorded or frozen. The distinct
       warning codes are noted on `checking`;
    5. the zip put at `exportPath(projectId)` with `replace: true`; then the `exports` row; then the freeze; then `done`.
  - A throw no step answers → `failInfra`, with the export's own sentence (`EXPORT_WORDS.infrastructure`).
  - `exportView` reads the job and fails it past `STALLED_MS`, as `view()` does.
- **The read:** `compileInputOf` takes `siteId: string | null`. With null it reads no site, deploys, binding or held names:
  - the name is `themeNameFor({ slug, bound: null, held: [] })`, i.e. `inflozo-{slug}`;
  - the version is `versionOf(nextVersion(the project's exports rows))`;
  - `ProjectRead.site` is null, and only an export reads with null.
  Every deploy caller is unchanged.
- **The freeze, one io member `freeze({ projectId, userId, keys, at })`:** `custom_settings.frozen_at = at` where `project_id`,
  `user_id`, `frozen_at is null` and `key in keys`. `keys` are the shipped `config.custom` keys:
  - export: `preflightFacts(theme).custom`;
  - Ship it: `deploy.preflight.custom`, right after the bind, before either ending. Best effort there (`twice`, then a log
    line) — Ghost already holds the theme, so it is never the job's failure.
- **The route `projects/[id]/export/route.ts`** (the deploy route's shape):
  - POST `{ session }`: 401 · 404 · 400 · **423** without the lock · `compileBudget` (the same code, `compile_budget`, asked
    for the export's sentence) → **429** as JSON, a failed count **502** · `startExport` → **202** `{ job }`, the work in
    `after()`, `maxDuration` 300.
  - GET `?job=`: `exportView`, 404 unless the job is this project's with `site_id` null; 502 on a failed read.
- **The download `projects/[id]/export/download/route.ts`** (`deploy/live`'s shape):
  - signed out: `signInAnswer`;
  - the newest `exports` row of this project, on the caller's own session (RLS); none → 404;
  - `supabaseAdmin()` signs `exportPath(projectId)` for 60 s, `download: {themeNameOf(slug)}.zip`;
  - `NoSuchKey` → 404, any other failure → 502, else `signedAnswer`.
- **The editor (one handler, `openExport`):**
  - **The doors:** the ▾ row, S8a′'s button through the wizard's `onExport` (it closes the wizard first), and `?export` on load
    (read once on mount, removed with `history.replaceState`).
  - **The lock:** a session reading along meets D8g (`LOCK_COPY.export*`), opened on Wait. **Take over and export** reuses
    `takeOver` with `SHIP_AFTER` holding `mode: 'export'`, so the editor that comes back opens the export.
  - **The window, `components/editor/export-dialog.tsx`:**
    1. `flush()` first; unsent → its sentence, and nothing starts;
    2. POST, then a poll each second while `isMoving`;
    3. the rows say each stage politely (UX-DR12);
    4. done → `followSigned(download href)`, then the ready line and **Download again** (`SignedDownload`);
    5. failed → S8d′'s failed row with the envelope's `message`, and its `action`/`href` as a link when present;
    6. 429/423/502 → their sentence.
    Close returns focus to `#editor-ship`.
- **Words (R-170):** in `EXPORT_WORDS` (`lib/deploy.ts`), `LOCK_COPY` and `PREVIEW_COPY`, exactly as Design Notes' Words. The
  budget's first sentence is one constant both sentences use.
- **README** (`compile.ts`, core): three sections between Styles and Routes, from `CompileInput`'s new `packName`, `pairing`'s
  faces and `theme.description`. Each name is put on one line (`\s+` → one space). Every `compileTheme` caller hands `packName`.
- **B15** (`site-notices.tsx`): the Sites page reads `projects (id, name, linked_site_id)` and hands each card its linked
  projects. The control row then shows:
  - one project → **Export theme zip** as a link to `/projects/{id}?export=1`;
  - several → the same label opening a popover menu (site ⋯ menu's `lib/menu.ts` pattern) with one link per project by name;
  - none → no export control;
  - **Re-check plan** unchanged;
  - **Ship it** greyed per P0-0 (`greyedProps`, `reason()`).

**Ask First:**
- **Every production and T1 write needs the owner's in-session go**, asked in R-83's shape, run in the main session, never by a
  subagent, worded for the run's whole set: walk step 126 (its plant, the seeded budget rows, the export uploaded to T1 and
  deleted, and the cleanup).

**Never:**
- **A Schema change.** `exports`, `deploy_jobs.site_id` null and the `frozen_at` grant to the service role all exist, and DW-409
  is decided without one.
- **The Pro exit gate or the over-cap read-only state** — Stories 12.3 and 12.4.
- **Counting `exports` rows** in the budget, a per-plan export rule, or a Cancel for an export.
- **An export list or history surface.** Only the newest export is kept, as one object per project.
- **Exporting a stored deploy artefact.** An export always compiles the project as it stands.
- **D8a's Export row in ⋯.** Ship it ▾ carries Download theme at every width (Story 5.22's decision, kept).
- **Changes to `/restore`'s links** (Story 2.5's plain links, outside DW-405).
- **Naming Ghost(Pro)'s tier** (DW-60's other half is Story 15.7's).
- **A new bucket or Storage policy.**

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Export, holder | Download theme; nothing unsent | job `site_id` null `queued → compiling → checking → done`; zip at `{project}/export.zip`; `exports` v1; shipped keys frozen; the zip downloads as `inflozo-{slug}.zip` | N/A |
| No site | the project links none | the same | N/A |
| Second export | an earlier export exists | the object replaced; `exports` v2; package.json `2.0.0` | N/A |
| Reading along | another session holds the lock | D8g "Take over to export?", focus on Wait; Wait → nothing; Take over → reload → the export runs | a refused take-over says its sentence |
| Unsent edits | the flush leaves work unsent | its sentence in the window; no POST | N/A |
| No lock at the route | a stale session | 423; nothing inserted | `LOCK_COPY.reading` |
| Budget reached | 60 jobs in the hour | 429: "Your account has built 60 themes in the last hour, the most Inflozo builds in an hour. You can export again in {n} minutes."; no job | count unread → 502 |
| Gate blocked | gscan 5 or 6, or quality, blocks | `failed` with the first error finding; nothing stored, recorded or frozen | N/A |
| Compile refusal | a stale design, unreadable cards, a refused translation | `refusalWords`' sentence; nothing stored | `compile_failed` logged |
| RTL / routing | unacknowledged RTL, invalid routing | Pre-flight's refusal and its action | N/A |
| Infrastructure | storage or database fails twice | `failed` with the export's infra sentence | logged by code |
| Killed invocation | the job untouched past `STALLED_MS` | the poll fails it | as `view()` |
| Download gone | the object missing, or no export | under the button: "This file is no longer kept, so there's nothing to download."; the page stays | 404 |
| Signed out / signing fails | 401, a fetch sent to `/sign-in`; or 502 | the signed-out or couldn't-prepare sentence; the page stays | logged by status |
| Layer named `con` | a section layer `Con` | `partials/sections/{stem}/con-2.hbs`, a deploy and an export alike | N/A |
| Ship it accepted | Ghost took the upload | the shipped keys frozen; the job's ending unchanged | a failed stamp logged, the job unharmed |
| B15, one project | a Preview-only site linked by one project | Export theme zip → `/projects/{id}?export=1` → the window runs there | N/A |
| B15, several / none | two projects / none | a menu of both by name / no export control | N/A |
| S8a′ | Destination on a probe's Preview-only site | the sentence, Download theme, Which Ghost plans work? ↗; no theme row or Run checks | N/A |
| S8a′, refused plan | `capability_source` `deploy_error` (R-270) | S8a′'s block, then R-270's line, the theme row and Run checks, as today | N/A |
| Sites original theme | its object purged meanwhile | the gone sentence under that Download; the Sites page stays | 404 |

</frozen-after-approval>

## Code Map

- `apps/web/server/deploy/run.ts`:
  - `DeployIo` `:84-180` gains `exports.insert` and `freeze`; `read`'s `siteId` becomes `string | null`;
  - `clock` `:265-330` (`note` `:295` takes `{ bytes?, warnings? }`);
  - `readProject` `:201`, `twice` `:215`, `fail` `:334`, `failInfra` `:634` (the export passes its own sentence);
  - `compileAndCheck` `:389-479`, with its pre-compile refusals `:396-420` (the shared helper);
  - `preflightFacts` `:373` (the freeze's keys);
  - `ship`'s bind `:749-755`, then the capability clear `:757` — the stamp goes right after;
  - `compileBudget` `:817`, `view` `:980` (the stall rule), `STALLED_MS` `:185`.
- `apps/web/server/deploy/project-input.ts`:
  - `compileInputOf` `:102-211`: the reads `:104-115`, `held` `:130`, the name `:164`, `version` `:163`, `site` `:200`;
  - `enginePackOf` gives `pairing`; the pack's `name` must be added beside it (`apps/web/lib/style-pack.ts:160-165`,
    `record.name`).
- `apps/web/server/deploy/deploy-io.ts` -- `DEPLOY_IO` `:54-…`: `exports.insert` and `freeze` (both `user_id`-scoped, `ok()`),
  and `artifacts.put`'s `replace`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/route.ts` -- the shape to copy: `no`/`json` `:34-35`, the lock `:58`,
  the budget `:66-73`, `after()` `:80`, the GET `:117-134`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/live/route.ts` -- the signed download to copy (`SIGNED_URL_TTL_S`,
  `NoSuchKey` → 404).
- `apps/web/lib/signed-download.ts` -- `followSigned`, `signedAnswer`, `signInAnswer`, `SIGNED_WORDS`.
- `apps/web/lib/deploy.ts`:
  - `DEPLOY_WORDS` `:297-…`: `budget` `:430`, `plans` `:433`, `editsUnsent`, `compilingRow`/`compiled`/`compiledMeta`/
    `checkingRow`/`checked`/`checkedMeta`;
  - `GHOST_PLANS_HELP` `:585`, `DeployCode` `:165-182`, `deployError` `:600-…`;
  - `versionOf` `:111`, `ARTIFACT_BUCKET` `:115`, `nextVersion` `:124`, `themeNameOf` `:131`, `themeNameFor` `:139`;
  - `isMoving` `:62`.
- `apps/web/lib/drift.ts:255-262` -- `liveCopyPath`, the pattern for `exportPath` (one fixed key per project, bounded by
  construction).
- `apps/web/lib/lock.ts:294-299` -- `LOCK_COPY.ship*`; the export words go beside them.
- `apps/web/components/editor/deploy-wizard.tsx`:
  - `SignedDownload` `:127-158` moves to `components/signed-download.tsx`, with a 32px size, so the Sites page imports no wizard;
  - `ShipButton` `:176-203`, `StageRow` `:226`;
  - Destination's Preview-only panel `:1219-1228`, `refusedPlan` `:1161`, `themeRow` `:1172`;
  - `fetchRow` `:863-881`; the Backup rows' line `:1932` is mounted only after a failure, in `text-ink-soft`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:
  - `SHIP_AFTER` `:844`, `openShip` `:2601-2608`, `takeOverToShip` `:2620-2624`, and the `SHIP_AFTER` effect `:2691-2705`
    (holder-only today; mode `export` → `openExport`);
  - `ShipButton` `:6084`, D8g's `LockTakeover` `:6969-6978`, the wizard's mount `:6981-7015`;
  - the ⋯ comment `:5629-5638` (D8a's Export row stays absent).
- `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx`:
  - the header `:32-38` ("ABSENT rather than greyed");
  - `PreviewOnly` `:227-300`, its control row `:282-299`.
- `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx`:
  - the projects read `:264` (`linked_site_id` only, the tally `:297`);
  - `<SiteNotices>` `:601`;
  - `OriginalThemes` `:168-200`, whose Download `:188-196` is a plain `<a>`.
- `apps/web/app/(app)/app/(authed)/sites/site-menu.tsx` -- the popover menu to lift (`lib/menu.ts`' `openMenu`, `arrowKeys`, `item`).
- `apps/web/lib/probe-rule.ts:507-532` -- `PREVIEW_COPY`, and its comment on the two departures.
- `apps/web/probe-rule.test.ts:205-218` -- the absence assertion to flip.
- `apps/web/components/kit/greyed.ts` -- `greyedProps`, `reason` (P0-0: the reason under the control, never a tooltip).
- `packages/theme-compiler/src/slug.ts:34-40` -- `claim`; the compile's one caller `compile.ts:1099`.
- `packages/theme-compiler/src/compile.ts`:
  - `CompileInput.theme` `:42-44` (via its type block) and `pairing` `:153`;
  - README `:1264-1284`, `ROUTES_HEADING`/`ROUTES_SENTENCE` `:297-299`, `noC0` `:289`;
  - `pairingFaces` (imported `:95`).
- **Every `compileTheme` caller** (they hand `packName`): `deploy-io.ts`, `tools/pilot-theme.mjs`, `tools/stress/compile.js`'s
  adapter, and the tests — `grep -rn "compileTheme(" apps packages tools --include=*.ts --include=*.mjs --include=*.js`.
- **Schema, read-only:**
  - `supabase/migrations/20260904120000_complete_schema.sql`: `exports` `:477-485` (owner read `:861`, select-only `:1103`);
    `deploy_jobs.site_id` "null for FR-J12 export" `:415`; `guard_custom_setting_freeze` `:88-110`; `frozen_at` "the
    server's to set … first deploys or exports" `:1057-1062`;
  - the service role's grant on `custom_settings` and `exports` `:1167-1176`.
- **Tests to extend:**
  - `apps/web/deploy-run.test.ts` (every stage over a fake `DeployIo`), `deploy-input.test.ts` (`compileInputOf`),
    `deploy.test.ts` (route source rules and words);
  - `signed-download.test.ts`, `busy.test.ts` `:359-384`;
  - `server-wiring.test.ts` (the service-role list `:120-…`: the download route joins with its reason);
  - `packages/theme-compiler/src/slug.test.ts` and `compile.test.ts` (README `:1232-1318`, `:2092`).
- `tools/keyboard/journey.spec.mjs` -- keyboard only below the sentinel `:165`; the harness never reaches the routes, so
  journeys answer `/export` and `/export/download` through `page.route`. Pointer rows go in `floor.spec.mjs`.
- `tools/probe/run-verify-editor.cjs` -- the last step is 125 (`:17425`, `T1_WRITES=1` `:501`).
- **Evidence:**
  - VERIFY 30 (Ghost names a theme by the zip's filename);
  - EXPERIENCE.md:771 (Starter refuses custom themes in Ghost Admin too, read in source);
  - MEASUREMENTS §21 (a compile's cost), and §92 as the last section, so this story's is §93.

## Tasks & Acceptance

**Dev gate:** no question open; no Schema phase. Dev asks the owner's in-session go for walk step 126's writes (Ask First).

**Execution:**

*The compile:*
- [x] `packages/theme-compiler/src/slug.ts` -- `RESERVED` (Windows' device names, Design Notes) taken in `claim`, with DW-336
  in its comment.
- [x] `packages/theme-compiler/src/compile.ts` -- `CompileInput.packName`; README's three sections (Design Notes, Words) between
  Styles and Routes, the names on one line; `noC0` over `packName`.
- [x] Every `compileTheme` caller hands `packName` (Code Map's grep).
- [x] `apps/web/lib/style-pack.ts` -- `enginePackOf` answers the record's `name`.

*The export run:*
- [x] `apps/web/server/deploy/project-input.ts` -- `compileInputOf` with `siteId: string | null` (Always).
- [x] `apps/web/server/deploy/run.ts`:
  - `startExport`, `exportTheme`, `exportView`, and the shared pre-compile refusals;
  - `note`'s `warnings`; `failInfra`'s sentence;
  - `compileBudget` said with the export's sentence when the export asks (its log line unchanged);
  - Ship it's stamp after the bind;
  - `DeployIo.exports.insert` and `freeze`.
- [x] `apps/web/server/deploy/deploy-io.ts` -- the two members.
- [x] `apps/web/lib/deploy.ts`:
  - `EXPORT_WORDS`; `compileBudget`'s refusal (`compile_budget`) said with the export's sentence when the export asks;
  - `exportPath`, `exportHref`, `exportDownloadPath`;
  - the shared budget sentence;
  - DEPLOY_WORDS' S8a′ sentence.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/export/route.ts` (new) -- POST and GET (Always). Header: the deploy route's
  pattern, the lock, the budget, AD-13.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/export/download/route.ts` (new) -- the signed download (Always).
- [x] `apps/web/server-wiring.test.ts` -- the download route joins the service-role list with its reason: the bucket has no
  Storage policy (AD-29); whose export it is is read on the caller's session.

*The editor:*
- [x] `apps/web/components/signed-download.tsx` (new) -- `SignedDownload` moved whole, with size 32 added. `deploy-wizard.tsx`
  and `deploy-history.tsx` import it from there.
- [x] `apps/web/components/editor/export-dialog.tsx` (new) -- the window (Always), in S8's modal and S8b's rows.
- [x] `apps/web/components/editor/deploy-wizard.tsx`:
  - `ShipButton`'s Download theme row (`onExport`);
  - S8a′ in place of B15's panel on a Preview-only Destination, its Download theme calling `onExport`;
  - the Backup rows' line mounted empty first, in `text-danger-text` (DW-405).
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:
  - `openExport`; D8g's second `LockTakeover` in export words;
  - `SHIP_AFTER` with `export`; `?export` on mount;
  - the window's mount, with focus back to Ship it.
- [x] `apps/web/lib/lock.ts` -- `LOCK_COPY.exportTitle`, `exportBody`, `exportConfirm`.

*B15 and the Sites page:*
- [x] `apps/web/lib/probe-rule.ts` -- `PREVIEW_COPY.body` with its export clause, `exportZip`, `shipBlocked`; the comment's two
  departures rewritten as built.
- [x] `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx` -- B15's control row (Always); the header rewritten.
- [x] `apps/web/app/(app)/app/(authed)/sites/export-menu.tsx` (new, client) -- the several-projects popover, lifted from
  `site-menu.tsx`.
- [x] `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx`:
  - the projects read gains `id, name` (the tally unchanged);
  - each card's linked projects handed to `<SiteNotices>`;
  - `OriginalThemes`' Download becomes `SignedDownload` at 32.

*Tests* (each new assertion seen red under a planted reversion):
- [x] `apps/web/deploy-run.test.ts`:
  - **the run:** the happy path (both gscans asked, 5 and 6; put with `replace`; the row's version; the freeze over the emitted
    keys only — a parked or unread row not frozen; `done`);
  - **blocked and refused:** each gate blocking (nothing put, recorded or frozen); a compile refusal; RTL; routing;
  - **the rest:** infra twice → the export's sentence; `exportView`'s stall;
  - **Ship it:** the stamp after the bind, and a failed stamp that leaves the ending untouched.
- [x] `apps/web/deploy-input.test.ts` -- `siteId: null` reads no site, deploys, binding or held names; the name `inflozo-{slug}`;
  the version from exports rows (none → 1, `[3.0.0]` → 4).
- [x] `apps/web/deploy.test.ts`:
  - **the export route's source:** `holdsLock` → 423 before `compileBudget`, which comes before `startExport(`, and `json(429`;
  - **the download's source:** `signedAnswer`, `signInAnswer`, `NoSuchKey`;
  - **the words:** the two budget sentences share their first; `EXPORT_WORDS` derive from the constants.
- [x] `apps/web/probe-rule.test.ts` -- the flip: the body says it exports a theme zip, `exportZip` is "Export theme zip", and
  "Creator" stays absent.
- [x] `apps/web/busy.test.ts` -- D8g's export confirm busy, the window's Download again busy (`SignedDownload`'s).
- [x] `apps/web/b15-export.test.ts` (new) -- B15's export control: one → the link, two → the menu's two links, none → absent;
  the greyed Ship it carries its reason id.
- [x] `packages/theme-compiler/src/slug.test.ts` -- each reserved name and its suffix; `console`, `com10` and `lpt` untouched.
- [x] `packages/theme-compiler/src/compile.test.ts` -- README's sections in order, the pack's name and the faces, a name with a
  line break on one line, and the Routes section still after them.
- [x] `tools/keyboard/journey.spec.mjs` -- 7.26, keyboard only:
  - (a) ▾ Download theme → the window's rows → done → the download followed, then Download again;
  - (b) reading along → D8g in export words, opened on Wait;
  - (c) a 429 → the budget sentence;
  - (d) a blocked finding → the failed row;
  - (e) S8a′'s Download theme opens the window;
  - (f) the download answered 404 → the gone sentence, the editor unmoved.
- [x] `tools/keyboard/floor.spec.mjs` -- the window at 1440 and 820, and S8a′.
- [x] `tools/probe/run-verify-editor.cjs` -- step 126 and `STEP126_PLANT` (Verification), under `T1_WRITES=1`, written at Dev and
  never run there.

*Propagation* (standing rules 3 and 7; end with `grep -rn "ABSENT rather than greyed\|absent until Story 7.26\|Download theme is
ABSENT\|7\.26's\|no \`frozen_at\` write" apps/web packages tools`):
- [x] PRD FR-J12 (`prd.md:434`), a dated note covering the job row, both gscans, the name and version, the one object per project,
  and the record and freeze.
- [x] PRD FR-Q2, a dated note: the stamp is written at Ship it's accepted upload and at export.
- [x] PRD FR-J11, a dated line: DW-409 decided.
- [x] `ARCHITECTURE-SPINE.md` -- AD-13's signed export download and AD-29's layout, `{projectId}/export.zip`, each dated.
- [x] `EXPERIENCE.md`:
  - a "Theme Export" row in the Information Architecture (the window, extrapolated from S8b; its doors);
  - the Preview-Only Destination `:205` and Notice `:206` rows, dated, as built;
  - the Edit Lock row `:164`: D8g's export words.
- [x] `deferred-work.md`:
  - DW-60 (7.26's half done; 15.7's stays), DW-336, DW-346 and DW-405 done;
  - DW-409 won't-fix with its reason;
  - each with a resolution line.
- [x] MEASUREMENTS §93, from walk 126b and the README's Ghost Admin words read in both majors' source. *(Dev: the source half
  written; walk 126b's upload and the `stage_timings` times can only run on the deployed sha, so they are appended to §93 as a dated
  note when walk 126 runs at Review — Verification.)*

**Acceptance Criteria:**
- **Matches the frames.** Given journeys 7.26 and the floor, then:
  - the ▾ row is S4d's — its words, glyph, caption and place;
  - Destination on a Preview-only site is S8a′'s block;
  - D8g is B5c's component in its export words;
  - the window draws S8b's rows in the wizard's own components and tokens.
  Given walk 126c on production, B15's control row is the frame's — Export theme zip ink primary, Re-check plan, the greyed
  Ship it with its reason under it.
- **R-98.** Given the window and every Download, then each press says it is working (`aria-busy`, a present-tense label), and
  `busy.test.ts` holds it.
- **A real export, really.** Given walk 126a on production, when the plant exports twice, then:
  - two `deploy_jobs` rows with `site_id` null end `done`;
  - two `exports` rows read `1.0.0` and `2.0.0`, both naming `{project}/export.zip`;
  - the planted promoted setting has `frozen_at`, and a direct key change on it is refused `42501`;
  - the downloaded zip carries `package.json` named `inflozo-{slug}` at `2.0.0`, `locales/en.json`, and README's sections;
  - a layer renamed `Con` is `con-2.hbs`.
- **Ghost takes it.** Given walk 126b, when the exported zip is uploaded to T1 through the Admin API and not activated, then
  Ghost answers 200 with the theme `inflozo-{slug}`; it is deleted after, and Casper stays active. The Ghost 5 half is
  postponed to DW-326 (R-238); the export's own gscan 4.49.7 pass is its local stand-in.
- **The refusals, really.** Given walk 126f–h, then:
  - 60 seeded jobs → the export's budget sentence;
  - a POST without the lock → 423;
  - the Sites page's orphan Download with its object gone → the gone sentence, the page unmoved.

## Spec Change Log

Story 7.26's Dev (2026-11-27) — routine calls, none of them a frozen decision moved:
- **README's builder-naming sentence is a NAMED MARK** (`README_MARK`, exported by the compiler): the Words name Inflozo, and FR-J1's
  "no builder fingerprints" scan (`tools/pilot-theme.mjs`' `textFailures`, `compile.test.ts`' `unmarked`) would refuse it. It is
  exempted exactly as `package.json`'s three marks and a locale's `credit.*` are — the sentence's words removed from that one line,
  the project's name between them still scanned — the reading 7.1 settled ("the specified marks are named exceptions"), and FR-J15
  puts the name in README with the credit anyway.
- **Each name on one line** replaces every run of white space AND every C0 character with one space (a superset of `\s+`): the
  description reaches README, which passes `UserText.substitute`, whose markers are C0 characters. `noC0` refuses one in `packName`.
- **`JobRow.site_id` is `string | null`**, with a `SiteJob` type for the deploy doors: `firstRead` hands them no export row, `view`
  answers none, and the deploy route 404s one (so the two routes never move each other's rows).
- **`tools/stress/compile.js` calls no `compileTheme`** (its adapter wraps the runtime and the gate), so it hands no `packName`.
- **`tools/check-traces.mjs`** holds the export route's trace to the deploy route's files and both gscans' — the export compiles and
  gates on Vercel exactly as Pre-flight does, and 7.18a's owner test found what a short trace costs.
- **The window presses its own Download again** at done, so the first follow and every later one are the one `SignedDownload` — its
  "Preparing…", its `role="status"` sentence (the gone sentence of journey (f)) — and the ready line shows only once a follow
  answered null (`onFollowed`). `SignedDownload` gains `describedBy` for the Sites page's row (WCAG 2.4.4, as its link had).
- **`?export` waits for the lock to settle** (this session acquired it, or another holds it): opened on mount it would race the
  first acquire and meet a 423.
- **The window's key is `export-{n}`:** keyed by a bare count beside the wizard's own count, React duplicated it when S8a′'s press
  mounted it while the wizard was still closing (journey 7.26 (e), two windows) — two siblings with the key "1".
- **S8a′'s block also stands over a refused upload's Preview-only** (R-270's line, the theme row and Run checks under it), as the
  matrix's row says.
- **The Backup rows' line keeps the marked theme's sentence in ink** — it is a fact, not a failure — and every failure in
  `text-danger-text`; mounted empty (`empty:absolute`, so it stays in the accessibility tree and takes no room).
- **B15's door rule is `lib/probe-rule.ts`' `exportDoor`/`exportAsk`**, beside `PREVIEW_COPY`, so `b15-export.test.ts` runs it in Node;
  the card's wiring is read from its source (a server render with server actions).
- **Walk step 126's promoted setting is planted with the service key** in step 104's row shape (Latest Post's Primary action, "Show
  the button") rather than through the Promote form — the owner's test's setting, the same row.

## Design Notes

**Why both gscans, always.** The theme declares `engines.ghost: ">=5.0.0"` (Story 7.2), and an exported zip goes to whichever
Ghost the customer picks. So a Ghost 5 error is a real defect of this theme, and Ghost 5 would refuse it. Pre-flight checks one
major because it knows the site; an export knows none.

**Name, version, object.**
- **The name:** `inflozo-{slug}` — `projects.slug` is frozen, and Ghost names an uploaded theme by its zip's filename (VERIFY 30).
- **The version:** exports number on their own, 1 + the highest `exports.version`. A per-site deploy number would mean nothing
  for a zip with no site.
- **The object:** one per project, `{projectId}/export.zip`, replaced by each export — bounded by construction, drained with the
  project's prefix at purge (`purge-rule.ts`), and never touched by the prune or the sweep. An older row's `artifact_path` names
  the newest zip; only the newest is ever offered. ponytail: two tabs exporting at once both download the later zip — the same
  project, seconds apart.

**Why freeze at Ship it here.** FR-Q2 needs a fact for "deployed" as much as for "exported". Story 7.9 handed the stamp to 7.18
and 7.26, and 7.18a never wrote it. One io member stamps both; the stamp is idempotent (`frozen_at is null`), and the guard
trigger allows null → a time once.

**B15's targets.** Export needs the edit lock, which lives in the editor, so B15 opens the editor with the export asked rather
than building from the Sites page. Two or more projects on one site is Pro-only (Free holds one project); the menu names each.

**DW-336's rule.** Windows reserves `con`, `prn`, `aux`, `nul`, `com0`–`com9` and `lpt0`–`lpt9`, with or without an extension
and in any case. `partialSlug` already lowercases and NFKD-folds (`com¹` → `com1`), so treating these as taken in `claim` covers
every section partial, in deploys and exports alike.

**Words (R-170)** — each in its one list:
- `EXPORT_WORDS.row` / `title`: "Download theme"; `caption`: "Zip of the compiled Ghost theme" (S4d `:384`).
- `EXPORT_WORDS.body`: "We compile and check your theme, then your browser downloads it as a zip."
- The rows: `DEPLOY_WORDS.compilingRow`, `compiled` + `compiledMeta`, `checkingRow`, `checked` + `checkedMeta(0, warnings)`.
- `EXPORT_WORDS.ready`: "Your theme is downloading. The README inside says how to install it."; `again`: "Download again".
- `EXPORT_WORDS.infrastructure`: "Something went wrong on our side while building your theme. Try again."
- **The budget.** `BUDGET_FIRST` is "Your account has built 60 themes in the last hour, the most Inflozo builds in an hour."
  `DEPLOY_WORDS.budget` follows it with "You can run checks again in {n}.", and `EXPORT_WORDS.budget` with "You can export
  again in {n}."
- `LOCK_COPY.exportTitle`: "Take over to export?"; `exportBody`: "Exporting needs the edit lock, and your other session is
  holding it."; `exportConfirm`: "Take over and export".
- `DEPLOY_WORDS.previewOnly` (S8a′): "This site's Ghost(Pro) plan doesn't accept custom themes at all — not over the API, and not
  in Ghost Admin. Download your theme — it installs on a self-hosted Ghost, or on a Ghost(Pro) plan that allows custom themes."
  Beside it: Download theme, and `DEPLOY_WORDS.plans` → `GHOST_PLANS_HELP`, in a new tab.
- **B15.**
  - `PREVIEW_COPY.body`: "Ghost restricts theme uploads on this plan, so we cannot deploy to this site. You can design and
    preview everything here, and export a theme zip whenever you want."
  - `exportZip`: "Export theme zip"; the greyed button reads `DEPLOY_WORDS.ship`.
  - `shipBlocked`: "This site's plan doesn't accept custom themes, so Inflozo can't ship to it."
- **README** — headings and sentences; the Admin path is checked in 6.58.0's and 5.130.6's admin source at Dev, and corrected
  to what both carry:
  - `## Install`: 1. "In Ghost Admin, open Settings → Theme → Change theme." 2. "Choose Upload theme and pick this zip." 3.
    "Activate it when Ghost asks, or later from the same list."
  - `## Style Pack and fonts`: "- Style Pack: {packName}" · "- Fonts: {heading} for headings, {body} for text".
  - `## Changing this theme`: "This theme was built in Inflozo from the project “{description}”. To change it, edit that project
    in Inflozo and export it again, or ship it from there. Inflozo builds the theme from the project, so edits made to these
    files by hand are not read back."
  - "Where to re-import" is read both ways: where the zip goes back in (the install steps) and where the design lives (the
    project). Both are one sentence, so neither reading is guessed away.

## Owner's manual test

**Before you start:** Deploy plants, on your go, one new Free test account (`STEP126_PLANT`; Deploy fills in its address and the
ids below). It has:
- a project **"Export test"** linked to T1 (`ghost6.inflozo.com`), with one Theme setting promoted (Header → Show the button);
- T1's card on that account marked **Preview-only**, as a Ghost(Pro) plan that refuses custom themes would be;
- a disconnected site whose original theme is listed but whose file is already gone.

You sign in only as that account.

1. **URL:** `https://app.inflozo.com/sign-in`. **Screen:** Sign in. **Do:** sign in with the plant's address and open the link
   that arrives. **Type:** the address Deploy gives. **See:** Projects, with "Export test".
2. **URL:** `https://app.inflozo.com/projects/{export-test-id}`. **Screen:** the editor. **Do:** open **Ship it ▾** (the small
   arrow beside Ship it) and choose **Download theme**. **Type:** nothing. **See:**
   - a window titled **Download theme** with two rows: "Compiling your theme…" turning into **Theme compiled · …s · … KB**, then
     "Checking your theme…" turning into **Checking your theme (Ghost will love it) · 0 errors · …**;
   - then "Your theme is downloading. The README inside says how to install it." and a **Download again** button;
   - `inflozo-export-test.zip` in your Downloads.
3. **Do:** open that zip on your computer. **See:**
   - `README.md` with, in order: Scripts, Styles, **Install** (three steps), **Style Pack and fonts** (the pack's name and two
     fonts), **Changing this theme** (naming "Export test");
   - a `locales` folder with `en.json`;
   - `package.json` showing `"version": "1.0.0"`.
4. **URL:** `https://app.inflozo.com/projects/{export-test-id}/settings`. **Screen:** Theme settings. **Do:** look at "Show the
   button". **See:** "Key frozen since" with today's date, and its name no longer editable.
5. **URL:** the editor URL from step 2, in a **second** window. **Do:** in the second window, open **Ship it ▾ → Download
   theme**. **See:** "Take over to export?", "Exporting needs the edit lock, and your other session is holding it.", with **Wait**
   already focused. **Do:** press **Wait** — the box closes. Ask again and press **Take over and export**. **See:** the second
   window reloads and its Download theme window runs; the first window now says you are reading along.
6. **URL:** `https://app.inflozo.com/sites`. **Screen:** Sites. **See:**
   - on T1's card, the blue Preview-only box, saying "…You can design and preview everything here, and export a theme zip
     whenever you want.";
   - under it **Export theme zip** (dark), **Re-check plan**, and on the right a pale **Ship it** with "This site's plan doesn't
     accept custom themes, so Inflozo can't ship to it." under it.
   **Do:** press **Export theme zip**. **See:** the editor of "Export test" opens and the Download theme window runs; the new
   zip's `package.json` says `"version": "2.0.0"`.
7. **URL:** the editor URL. **Do:** press **Ship it**. **See:**
   - the T1 card with its **Preview-only** pill;
   - "This site's Ghost(Pro) plan doesn't accept custom themes at all — not over the API, and not in Ghost Admin. Download your
     theme — …";
   - **Download theme** and **Which Ghost plans work? ↗**, and no Run checks.
   **Do:** press **Download theme**. **See:** the wizard closes and the Download theme window runs.
8. **URL:** `https://app.inflozo.com/sites`. **Screen:** Sites, "Original themes from disconnected sites". **Do:** press that
   row's **Download**. **See:** "This file is no longer kept, so there's nothing to download." under it, and the Sites page still
   there.

## Verification

**Commands:**
- `pnpm check` -- expected: green, every new test included, each seen red under its planted reversion.
- `pnpm keyboard` (journeys 7.26 (a)–(f) and the floor rows) -- expected: green. A Chrome crash is another session's load;
  re-run alone.
- `cd tools/stress && npm install && node build.js && node gate.js theme` (Node 24) -- expected: 0 errors / 0 warnings on both
  majors, since `packName` reached the adapter.
- `python3 tools/doc-audit.py --check` (twice) -- expected: pass.
- After the Dev push: CI `check`, `rls`, `deploy` green and the deployment READY (`GITHUB_TOKEN`, `VERCEL_*` from
  `tools/probe/.env`).
- `T1_WRITES=1 node tools/probe/run-verify-editor.cjs --grep 126` from a clean worktree at the deployed sha, on the owner's
  in-session go -- expected: step 126 all PASS, against production Supabase, Vercel and T1:
  - **126a:** the export twice through the UI. Two `deploy_jobs` rows (`site_id` null, `done`), two `exports` rows
    (`1.0.0`, `2.0.0`, the one path), `frozen_at` on the promoted key, its key change refused `42501`. The zip read: name,
    version, `locales/en.json`, README's sections, `con-2.hbs`.
  - **126b:** the zip `POST`ed to T1's `themes/upload/` → 200 `inflozo-{slug}`, never activated; `DELETE themes/{name}/` →
    204; Casper active. The control: a zip with `package.json` removed is refused 422.
  - **126c:** B15 on the Sites page — the row, the reason, the body sentence; Export theme zip → the editor → a third
    `exports` row.
  - **126d:** S8a′ in the wizard; its Download theme opens the window.
  - **126e:** two contexts — the reader's Download theme opens D8g in export words.
  - **126f:** 60 seeded `deploy_jobs` rows → the 429 sentence, and Vercel's `deploy: compile budget reached` line for that POST.
  - **126g:** a POST with a stale session → 423, no row.
  - **126h:** the orphan Download → 404 said under it, the URL unchanged.
  - **Cleanup:** the plant accounts deleted, and T1 back on Casper with no `inflozo-` theme of the plant's.
- Vercel `request-logs` for the export POST, its polls and the download -- expected: rows with durations; MEASUREMENTS §93
  records the compile and both gscans' times from `stage_timings`.

**Executed — Dev (2026-11-27, Node 24):**
- `pnpm check` -- green on the final tree: lint, typecheck and every package's tests (`apps/web` 1223 pass, 0 fail;
  `packages/theme-compiler` 227), then `check-baseline`, `check-catalog` and `check-snapshots` (the pilot themes' README carries the
  three sections; `themeFailures` clean, its builder's-name controls still caught).
- `pnpm check`, again by the main session on the same tree before the commit (2026-11-28, Node 24.18.1) -- exit 0 in 3m30s.
- **Each new assertion seen red under a planted reversion** (a script that plants, runs the one test file and restores): 22
  reversions — `claim`'s `RESERVED` (slug and compile tests), README's sections, the one-line rule, `packName`'s `noC0`; the export's
  freeze, gscan 5 asked, the first-error order, `put`'s `replace`, the export's infra sentence, Ship it's stamp and its best effort,
  `exportView`'s stall; the null read reading a site, the export's version; the route's lock before the budget; the budget's words;
  B15's body, the greyed Ship it, the one-project link; D8g's busy; the wiring list — every one red, every file restored.
- `pnpm build` then `node tools/check-traces.mjs` -- green: the export route carries the deploy route's 273 files, bundles jsdom,
  carries `gscan4` and `gscan6` with their links and every file each touches while it checks the pilot theme.
- Keyboard: `bash tools/keyboard/run-keyboard-gate.sh -g "7\.26" --repeat-each 2` -- 17 passed, 1 failed: the run's FIRST test (the
  1440 floor row) at `painted()` cold, the known cold start; its repeat passed. Journey (e) first found two windows (the duplicated
  key, Spec Change Log); after the fix every 7.26 journey and floor row passed both repeats. The re-expected rows (7.18a's ▾ menu,
  7.22 (d), 7.23b (e1)) passed.
- Keyboard, wider: `-g "uses no pointer|7\.1[89]|7\.2[0-6]"` (174 tests) was VOIDED by the machine, not the code — another
  user's processes held the 4-core machine at a load average of 26–38, and every failure (12 of the first 78) was the same
  `painted()` / `data-painted` 5 s wait at page load, before any step of the test; a focused re-run with `--retries=1` failed the
  same way on rows that had passed at lower load, so it was stopped. Two more journeys were RE-EXPECTED after that run's source read
  (7.18a "no site to ship to … Preview-only" and 7.18b "R-270", both now S8a′'s block in place of B15's words) and journey 7.26 (g)
  (unsent edits) was added — those three had not run when the subagent stopped. **The main session ran them (2026-11-28, Node 24, load
  ~13):** `bash tools/keyboard/run-keyboard-gate.sh -g "no site to ship to|R-270: a site a refused|7\.26 · \(g\)" --repeat-each 2`
  -- 6 passed; and (g) seen red under a planted reversion (the window's `unsent` check removed: `expect(locator).toHaveText` failed,
  1 failed), the file restored and `cmp`-checked.
- `python3 tools/doc-audit.py --check`, twice -- green (after `tools/story-board.py`).
- The propagation grep -- in source, only lines that describe what is built ("Story 7.26's export …"); `new-project-sheet.tsx`,
  `account/page.tsx`, the Sites page's ⋯ history and `run-verify-ghost-admin.py` say "ABSENT rather than greyed" of other controls.
- **Read in source, both majors** (MEASUREMENTS §93): Ghost Admin's Theme card, Change theme, Upload theme and "Do you want to activate
  it now?" in 6.58.0's and 5.130.6's built admin — README's Install words hold as written.

**Not run at Dev, by the spec:**
- Walk step 126 on production and T1 (written, `node --check` clean, `T1_WRITES=1`, `STEP126_PLANT`), and with it MEASUREMENTS §93's
  126b half and the `stage_timings` times — the main session's, on the owner's in-session go (Ask First).
- `cd tools/stress && npm install && node build.js && node gate.js theme` — the stress fixture compiles through the runtime's own
  adapter, never `compileTheme` (no `packName` reaches it, nothing of this story changes it), and its `node_modules` is root-owned.
- CI and the Vercel deployment of the Dev head (read at Review — R-81's push is the main session's).

**The I/O matrix, row by row → the check that ran:**
- Export, holder → `deploy-run` "7.26 the export, clean" (both gscans, `replace`, the row, the freeze over the emitted keys, done);
  journey 7.26 (a) (the window's rows, the follow, `inflozo-pilot-sections.zip`); walk 126a.
- No site → the same run test (the job's `site_id` null, the read with `siteId: null`); `deploy-input` "7.26" (no site, deploys,
  binding or held names).
- Second export → `deploy-input` "7.26" (`[3.0.0]` → 4.0.0); `deploy-run` "the version is the read's"; walk 126a (`2.0.0`).
- Reading along → journey 7.26 (b); `busy.test.ts` "Story 7.26"; walk 126e.
- Unsent edits → the window's `flush()` first (`export-dialog.tsx`), Run checks' own `flushForShip`; journey 7.26 (g) (green twice,
  red under its planted reversion — see above) and 7.18a's unsent row, which holds the shared flush.
- No lock at the route → `deploy.test.ts` "7.26 — the export's door" (423 before the budget and the insert); walk 126g.
- Budget reached → journey 7.26 (c); `deploy.test.ts` words and `deployError(…, { for: 'export' })`; walk 126f.
- Gate blocked → `deploy-run` "7.26 a gate blocks" (each gate, the order, nothing stored, recorded or frozen); journey 7.26 (d).
- Compile refusal / RTL / routing → `deploy-run` "7.26 refused before or at the compile".
- Infrastructure / killed invocation → `deploy-run` "7.26 infrastructure" (twice → the export's sentence; the poll past `STALLED_MS`).
- Download gone / signed out / signing fails → journey 7.26 (f); `signed-download.test.ts` (the one follower, unchanged); walk 126h.
- Layer named `con` → `slug.test.ts` and `compile.test.ts` "DW-336"; walk 126a.
- Ship it accepted → `deploy-run` "7.26 Ship it stamps" (after the bind, before the ending; a failed stamp leaves the ending).
- B15, one / several / none → `b15-export.test.ts`; walk 126c.
- S8a′ / S8a′ refused plan → journey 7.26 (e), the floor's S8a′ row, journeys 7.18a and 7.18b (R-270) re-expected; walk 126d.
- Sites original theme → `busy.test.ts` "Story 7.26" (the Sites page's `SignedDownload`); walk 126h.
