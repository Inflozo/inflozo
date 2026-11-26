---
title: 'Story 7.23a — Roll back and Re-activate from History (split from Story 7.23 by R-290)'
type: 'feature'
created: '2026-11-25'
status: 'done'
baseline_commit: 'e3ea8624b9bf53b9d06b4aff50aec7ad648c2781'
owner_test: passed
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-22-artifacts-retention-and-pinning.md']
---

## In plain English

After this story, the **History** panel in the editor can put any version Inflozo still keeps back on your live Ghost site:
press **Roll back** on that version, confirm in a small box that opens with **Cancel** selected, and your site switches to it
in seconds — nothing is rebuilt, and the version you left stays in the list so you can switch straight back. A version that
was uploaded to Ghost but never made live shows a blue **Uploaded, not live** chip and a **Re-activate** button that makes it
live in one press. The newest three versions show a small picture and a line saying what changed, every version has a Roll
back button, the clock's tooltip now reads "History — every version, one click back", and if Ghost itself refuses an old
version the panel says so in Ghost's own words while your site stays exactly as it was.

Question 1 was ruled option 1 (R-290, owner, 2026-11-25): Story 7.23 is split in three, and this spec is 7.23a. Restore
original is Story 7.23b and the phone's Deploy history card is Story 7.23c, each with its criteria word for word in `epics.md`.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 7.22 built the History drawer, but every row in it is a compact row with only a pin:
- nobody can put an earlier version back on their site, though "one click back" is the reason the history exists (FR-J9);
- an upload Ghost holds but never made live has no way back to live from the history (FR-J8's row);
- the list orders versions by when their checks ran (`deploys.created_at`), so a version checked before a re-link and shipped
  after one can be pruned the moment Ghost accepts it (DW-400);
- the drift baseline (R-287) is "the newest upload Ghost accepted", but it too is read by `created_at`, so an upload of an
  OLDER stored version would never become the baseline.

**Approach:**
- **One action, "put back".** A history row's action puts its stored artefact back on its site. If Ghost already holds this
  version's files — it is the newest upload Ghost accepted for this project and site — it activates it (**Re-activate**, D2d).
  Otherwise it re-uploads the stored zip under the site's frozen name (**Roll back**). Ghost makes an upload under the active
  name live at once (R-264); an upload under an inactive name is followed by an activation. The working document, the edit
  lock, Inflozo's gscan gate and the plan are never consulted (FR-J9, FR-L3, FR-J13).
- **The row is updated, never copied.** Putting a version back updates that version's own `deploys` row: it becomes `live`,
  and a new column `deploys.accepted_at` records when Ghost last accepted its files. The list, retention and the drift baseline
  all order by `accepted_at`. `accepted_at` is pushed first, as its own `Schema` (R-99).
- **The drawer gains D2a's expanded rows** (the newest three: picture, Changed line, Roll back), **D2d's row**, a Roll back on
  every compact row, **S8e's Roll back confirm** (focus on Cancel, UX-DR14), Ghost's refusal said under the row, S8e's full
  tooltip and S4d's caption.

**Frame (R-74):**
- `S8 Deploy.dc.html` S8e `:264-347`:
  - the clock's tooltip `:280`;
  - the expanded rows `:300-323`, with the Live row `:300-307`, the emphasised Roll back `:313` and the quiet one `:321`;
  - the compact row `:324-333`;
  - the confirm `:337-345`.
- `D2 Deploy History Completed.dc.html`:
  - D2a `:28-156`: the expanded rows `:75-100`, their thumbnail `:76` and Changed line `:79`, the pinned expanded row `:84-91`;
  - D2c `:209-287`: Free, every row expanded `:256-281`, v1's "First deploy" `:278`;
  - D2d `:190-205`: the partial-success row, its chip `:197`, its line `:198`, Re-activate `:199`; the same row under D2e/D2f
    `:400-413`.
- `S4 Editor.dc.html` S4d: the ▾ row's caption, "Versions, gscan reports, rollback".

**Moved by Question 1 (R-290, owner, 2026-11-25; each pasted word for word into its story's card, R-195):**
- to a new **Story 7.23b, Restore original** — the original-theme row (D2a `:58-73`), R-281's restore paragraph, R-284,
  DW-389, both DW-391 paragraphs, and the Verification's "a real snapshot restored on T1";
- to a new **Story 7.23c, the phone's Deploy history card** (D4f) — the Small Screen Notice paragraph;
- to both 7.23a and 7.23b — the criteria naming rollback and restore alike (the edit lock, the Pro exit exemption,
  R-287's newest accepted upload).

**The epic's criteria this story keeps, word for word (R-195):**
- **Given** deploy history per project × site, **when** I open it, **then** each row lists version, timestamp, gscan summary
  and an active badge, and **any retained artifact redeploys in one click**.
- Each row carries a **pin control** obeying the three retention rules *(built by Story 7.22; kept as built)*.
- The list carries **two rows that are not ordinary versions**: **the pre-Inflozo snapshot**, above the versions, outside the
  count, actioned as **restore original** *(→ Story 7.23b)*; and an **`uploaded`-but-not-`activated` row**, shown **without
  an active badge** and actioned as **re-activate rather than as a recompile**.
- **Rollback is exempt from the Pro exit gating** — restoring an artifact that already ran is always allowed, on any plan.
- **Rollback and snapshot restore redeploy stored artifacts, not the working document, so they never require the edit
  lock.**
- *(Story 7.21's Dev, 2026-11-24, under R-287)* A rollback or a restore that **uploads a stored artefact records that upload
  as the newest accepted one** — a `deploys` row with status `uploaded` or `live` carrying **the artefact's own
  `content_manifest`** — because Ghost replaces every file under the theme's name on that upload, and the next drift check
  compares the site with the newest upload Ghost accepted (`deploys.baseline`).
- The Roll back confirm **opens with focus on the cancelling action** (UX-DR14).
- With no deploys the empty state is "Nothing shipped yet" **and the limit is stated anyway** (UX-DR6) *(built by Story
  7.22; kept)*.
- The screens match S8e and D2a Pro pinning, D2b pin refusal and D2c Free.
- *(Story 7.22's Dev, 2026-11-25)* **The drawer is 7.22's.** **This story adds** D2a's expanded rows (thumbnail, Changed
  line, by-line, Roll back), the original-theme row *(→ 7.23b)*, D2d's Re-activate row, S8e's Roll back confirm and the phone
  card *(→ 7.23c)* — and S8e's full clock tooltip, "History — every version, one click back", and the ▾ row's "rollback" in
  its caption.
- *(Story 7.22's Dev)* **One list per project, across every site**: a row of another site says "on {host}", and this story
  decides what its Roll back does there.
- *(Story 7.22's Dev)* **A rollback row that shares its object with an older row prunes by object.** Settled here by never
  writing a second row: see Design Notes.
- *(DW-400, Story 7.22's Review)* **"Newest" for retention is decided here**: newest is the upload Ghost accepted
  (`accepted_at`), and the row's time label says when Ghost accepted it.

## Boundaries & Constraints

**Always:**
- **Who may act.** A row's action exists only when all of these hold:
  - the row is a stored version (`isStoredVersion`);
  - its site is the project's linked site;
  - it is not the site's Live row.

  The action is **Re-activate** when the row is `uploaded` and is the newest `accepted_at` among this project × site's
  stored-or-pruned `uploaded`/`live` rows; otherwise it is **Roll back**. One pure rule, `actionOf`, decides this, in
  `lib/retention.ts`. The server re-decides with the same rule and never trusts the client's choice.
- **Put back** (`server/deploy/put-back.ts`, its io handed in). The steps, in order:
  1. Read the row, the user's own (else `gone`).
  2. Refuse, with nothing sent to Ghost, when:
     - the site is not the linked site (`elsewhere`);
     - the row is live (`live`);
     - the site is disconnected (`disconnected`);
     - a job of this project × site is at `snapshotting`, `uploading` or `activating` and was updated within `STALLED_MS`
       (`busy`).
  3. **Re-activate:** `PUT themes/{theme_name}/activate/` alone.
  4. **Roll back:**
     - `artifacts.get(artifact_path)`;
     - upload it as `${theme_name}.zip` through `callTwice` and `uploadAnswer`, exactly as `ship()` does;
     - `active` true → live with no PUT (R-264); otherwise the activation, exactly as `activateStep` does.
- **The records, when Ghost answers.**
  - **Upload accepted:** `accepted_at = now`.
  - **Live:** `status live`, `activated true`, `activated_at now`, then `demote` the site's other live rows.
  - **Uploaded, not live:** `status uploaded`, which becomes D2d's row.
  - **Ghost refused:** nothing changes.

  Rows are never inserted, copied or deleted by putting back, and a put-back runs no prune: it adds no object.
- **`accepted_at`** is written by `ship()` whenever Ghost accepts an upload (`run.ts:666`, `:667`) and by a Roll back's
  accepted upload. It is the order of:
  - `newestFirst` (retention);
  - `deploys.baseline` (R-287);
  - the history GET;
  - `timeLabel`.

  `created_at` stays the Pre-flight's time and orders nothing a customer sees.
- **The Changed line** is computed on the server and is one pure function. It compares this row's `content_manifest` with
  that of the same project × site row holding the highest version below it. Pruned rows count: their manifest is kept.
  - With no such row, the line is "First deploy".
  - With either manifest null, there is no line.
  - Otherwise `compareManifests`. Section partials are named by the manifest's own `layer` (what shipped, not today's name),
    templates by `fileLabel` with "added "/"removed " before a template the other lacks, and every other file by
    `labelOf`'s kind word. The names are deduped and joined "Changed: A, B · added C" (the frame's shape). Past three names
    the line ends "and {k} more". With no difference it reads "No changes since v{p}".
- **Ghost will forget settings.** The confirm says which custom settings Ghost will delete when this version goes live
  (VERIFY 76): the keys in the site's Live row's `preflight.custom` that are absent from this row's. That is Pre-flight's own
  rule, extracted from `lib/preflight.ts:237-242` as `droppedKeys` and used by both. It shows Pre-flight's own words
  (`dropped`, `droppedBody`, `ghostName`).
- **R-98:**
  - the confirm's Roll back shows "Rolling back…" and the row's Re-activate shows "Activating…" (`DEPLOY_WORDS.activating`),
    each with `aria-busy` and `aria-disabled`;
  - while the request is out, Cancel and Esc do nothing ("Once it starts, it finishes", S8c's rule);
  - the confirm carries `data-unstoppable` while the request is out, so R-192's lost-lock sweep (`editor.tsx:2826-2830`) cannot
    close it.
- **UX-DR12:** each outcome is said once, politely, in the drawer's one region.
- **R-170:** every word is in `HISTORY_WORDS`. D2d's line is `DEPLOY_WORDS.notLiveTitle`, and the dropped-settings words are
  Pre-flight's.
- **History controls stay live in a read-only editor**, as the pin is (R-192's view-control side; `history/route.ts:23-24`).

**Ask First:**
- **Every production write and every T1 write needs the owner's in-session go**, asked in R-83's shape and run in the main
  session, never by a subagent. That covers:
  - the migration's apply (R-99, `SUPABASE_DB_POOLER_URL`);
  - walk step 121;
  - Deploy's plant.

  Word each ask for the run's whole set of writes.
- Any change to what a Roll back sends to Ghost beyond upload and activate (AD-10's list). A `routes.yaml` upload is one such
  change.
- A Roll back on another site's row (Design Notes give the reason it is not built).

**Never:**
- Insert, copy or delete a `deploys` row to record a put-back. Never re-point an artefact, recompile, or read the working
  document.
- Call `holdsLock`, `resolveEntitlement` or any plan read on the put-back path. Never run Inflozo's gscan gate on it.
- Retry Ghost's 422. Say its detail (VERIFY 10).
- Draw a person's name: the frame's "by Maya" is not drawn (R-189).
- Render a version to make its thumbnail.
- Build what belongs to other stories:
  - Story 7.23b: the original-theme row, Restore original, DW-389 and DW-391;
  - Story 7.23c: the phone card;
  - Story 7.25: the per-site advisory lock (AD-19), which the put-back joins when it lands;
  - Story 7.31: the deploy-failure email (a put-back sends none);
  - Story 7.26: a zip download of a version.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Roll back over the live theme | v3 live (this theme active on Ghost); Roll back v2 | v2's zip uploaded as `{theme_name}.zip`; Ghost answers `active` → no PUT; v2 `live`, `accepted_at`/`activated_at` now; v3 demoted; drawer re-reads: v2 Live first, v3 next with the emphasised Roll back; "v2 is live on {host}." said | N/A |
| Roll back, theme not active | another theme active on Ghost; Roll back v2 | upload, then `PUT activate` → live as above | activation refused → v2 `uploaded`, `accepted_at` now → D2d's row; "v2 is on {host} but isn't live yet." |
| Re-activate | v3 `uploaded`, newest accepted on the site | `PUT activate` only, no upload; v3 live; others demoted | Ghost refuses again → row unchanged; sentence under it |
| Ghost refuses the upload | 422 `ThemeValidationError` | nothing recorded; site untouched; under the row: the refusal sentence and Ghost's detail in mono | logged by code; never retried |
| Other Ghost failures | 401, plan limit, unreachable, `EEXIST` | nothing recorded beyond what Ghost accepted; `deployError(code).message` under the row | logged by code |
| Undo | after rolling back to v2, Roll back v3 | v3 live again; the list returns to v3, v2, … | N/A |
| Another site's row | row's site ≠ linked site | "on {host}", pin, no Roll back | POST → 409 `elsewhere` |
| Live row | the site's live row | no action drawn | POST → 409 `live` |
| Disconnected | linked site disconnected | Roll back drawn | 409 `disconnected` → "Reconnect {host} in Sites to roll back." |
| A ship under way | job on this project × site at `snapshotting`/`uploading`/`activating`, fresh | nothing sent | 409 `busy` → "A deploy to {host} is under way. Try again when it ends." |
| Gone | pruned, failed, or not the user's | — | 404 → re-read, row absent, sentence said, focus on ✕ |
| Reading along | another session holds the lock | Roll back and Re-activate work | N/A |
| Any plan | a lapsed or Free account | works; no plan is read | N/A |
| Dropped settings | Live row declares custom keys the target lacks | confirm adds Pre-flight's marigold "Ghost will forget N settings on {host}" with the names and its body; the body ends "v3 stays in history." | N/A |
| Nothing live on the site | confirm | body "Your live site switches to v{n} instantly." only | N/A |
| Request fails | network or 5xx | row unchanged; one sentence | logged by code |
| Lock lost mid-request | R-192 sweep | confirm stays (`data-unstoppable`); outcome still said | N/A |
| DW-400 | a check made before a re-link, shipped after; cap reached | `accepted_at` now → newest → kept; label shows the accepted time | N/A |
| Baseline after Roll back | Roll back to v2, then Run checks | drift compares with v2's manifest: D3c "Nothing changed on your site since v2" | N/A |
| Number after Roll back | v3 exists, v2 rolled back | next ship is v4 (`nextVersion`, unchanged) | N/A |
| Changed line | v1 / v2 vs v1 / a null manifest / identical files | "First deploy" / "Changed: Hero · added 404 template" / no line / "No changes since v1" | N/A |
| Order and shape | any list | `accepted_at` newest first; first three rows expanded, the rest compact, each with its action | N/A |
| Drift check, clean *(R-291)* | Roll back pressed; the live theme equals the newest accepted upload | the confirm opens on Cancel, says "Comparing with your live theme…" with its Roll back waiting, then D3c's "Nothing changed on your site since v{n}" | N/A |
| Drift check, found *(R-291)* | a file on the site differs from the newest accepted upload (a hand edit in Ghost Admin) | D3a's list — changed, added, removed, named as they shipped — the foot, "Download the live theme first" (the live copy, its own key); the Roll back still available and confirmed as usual | a live zip past the store's size: the list without the Download |
| Drift check, couldn't verify *(R-291)* | no Staff Access Token, a refused or weak token, the theme gone, Ghost unreachable, or the check's request failing | D3b's "Couldn't check whether your live theme changed." and its reason; the Roll back goes on | N/A |
| Drift check, no verdict *(R-291)* | the newest accepted upload has no manifest (before Story 7.21) | nothing drawn; Roll back available | N/A |
| Re-activate *(R-291)* | D2d's row | no check: it replaces nothing | N/A |

</frozen-after-approval>

## Code Map

- `supabase/migrations/20261125120000_pin_version.sql` -- the latest migration and the pattern: column, comment, revoke,
  `if not exists`. The new migration follows it.
- Architecture `SCHEMA.sql` `deploys` `:486-535` (live index `:538`) -- edited in place. `supabase/tests/rls.sql` is
  byte-identical to `RLS-TEST.sql`; its protected-column list `:604-607` gains `('deploys','accepted_at','BOTH')`.
- `apps/web/lib/retention.ts`:
  - `isStoredVersion` `:29`;
  - `newestFirst` `:36` (by `created_at` today; not exported);
  - `prunable` `:40`;
  - `HistoryAnswer` `:49`, `HistoryRow` `:67`, `historyRows` `:79-93`;
  - `pinOutcomeOf` `:96`, `timeLabel` `:106`;
  - `HISTORY_WORDS` `:124-162` (`open` and `menuCaption` `:125-128` are held back for this story).
- `apps/web/lib/drift.ts` -- `compareManifests` `:100`, `labelOf` `:119` (pass no `names`, so a partial is its manifest
  `layer`), `DRIFT_WORDS.labels`.
- `apps/web/lib/preflight.ts` -- the dropped row `:237-242`, words `:95-96`, `ghostName`.
- `apps/web/lib/deploy.ts`:
  - `uploadAnswer` `:195-211` (2xx → `{ok, active}`; another 4xx → `ghost_theme_refused` with `detail`);
  - `activateAnswer` `:216-222`, `thrownCode` `:226-232`, `deployError` `:542-581`;
  - `DEPLOY_WORDS.notLiveTitle` `:374`, `activating` `:381`;
  - `MOVING` `:60`, `versionLabel` `:112`, `nextVersion` `:121`.
- `apps/web/server/deploy/run.ts`:
  - `callTwice` `:200-211`, `STALLED_MS` `:155`;
  - `ship()`'s upload `:636-641` (filename `${deploy.theme_name}.zip`), its accepted paths `:666-667`;
  - `activateStep` `:710-726`, `goLive` `:731-738`;
  - `activate()` `:687` (the wizard's per-job Re-activate, behind the lock; left as is).
- `apps/web/server/deploy/deploy-io.ts`:
  - `DEPLOY_COLUMNS` `:35`;
  - `demote` `:90-92`;
  - `previousCustom` `:97-103`;
  - `baseline` `:105-109` (orders by `created_at` today);
  - `artifacts.get` `:126-129`;
  - `call` `:173`.

  Upload and activate are on `ADMIN_WRITES` (`ghost-admin/admin-rule.ts:120-129`): upload 120 s, activate 15 s.
- `apps/web/server/retention-io.ts` `versions` `:26-36` -- selects for `prunable` and gains `accepted_at`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/history/route.ts`:
  - GET `:45-82` (the user's session, RLS);
  - POST `:84-127` (pin and unpin);
  - no lock (`:23-24`).

  `deploy/route.ts` is the door pattern, with `maxDuration = 300` `:28`.
- `apps/web/app/api/cron/prune-artifacts/route.ts` -- `held()` `:183-190` and the version reads: re-read any `created_at` order
  over versions.
- `apps/web/components/editor/deploy-history.tsx`:
  - props `:38-45`;
  - `toggle` `:86-103`;
  - the row closure `:107-176`, with the pin `:136-151` and D2b `:152-173`;
  - the dialog `:179-205`;
  - the live region `:240-242`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:
  - `readHistory`/`pinHistory` `:2590-2606`;
  - the clock `:6050-6068`;
  - the mount `:7005-7014`;
  - harness seams `:576-579`;
  - R-192's sweep `:2826-2830`.
- `apps/web/components/editor/deploy-wizard.tsx`:
  - `ShipButton`'s History row `:160`;
  - the switch-site confirm `:988-1029`, the one `w-[410px]` S8e dialog, nested in a dialog: this confirm's pattern;
  - D2e's Re-activate `:1578-1591`.
- Kit: `button.tsx` variants `:29-40` (`coral-outline` is the emphasised Roll back, `coral` is Re-activate, `primary` is the
  confirm's ink; the frame's quiet Roll back `D2:98` has no variant yet), `dialog.ts` `openOnCancel` `:68`, `submit.tsx`
  `BusyLabel` `:102`, `badge.tsx` `LiveBadge`/`ResultChip`.
- Harness: `app/(app)/app/harness/editor/layout.tsx` (the history header `:167-171`, the editor props `:361`), `actions.ts`
  `stored`/`harnessHistory`/`harnessPin` `:123-169`, `sites.ts` `HARNESS_SITES` `:58-66`.
- Tests:
  - `tools/keyboard/journey.spec.mjs`: the sentinel `:34`; 7.22's block runs `:11031`–EOF, with helpers `:11037-11065`;
  - `tools/keyboard/floor.spec.mjs` 7.22 `:1066-1110`;
  - `apps/web/busy.test.ts` 7.22 `:415-431`;
  - `tools/probe/run-verify-editor.cjs` step 120 `:14257-14736`, including the `STEP120_PLANT` pattern; the last step is 120.
- Ghost 6.58.0, read in source (the npm tarball):
  - `services/themes/storage.js` `setFromZip`: an upload under the active name goes live at once, and a fatal gscan result
    → 422 `ThemeValidationError` with `errorDetails`;
  - `activate.js:55-60`: activation runs `checkSafe` too;
  - `frontend/services/rendering/templates.js:191`: a route whose template is missing renders its default template. A
    Roll back therefore leaves `routes.yaml` as it is.

## Tasks & Acceptance

**Execution:**

*Schema — its own push, first (R-99):*
- [x] `supabase/migrations/<Dev's date>120000_deploys_accepted_at.sql` -- create it *(Dev: `20261125120100_deploys_accepted_at.sql`, because `20261125120000` is 7.22's `pin_version`)*:
  - `add column if not exists accepted_at timestamptz`;
  - backfill `coalesce(activated_at, created_at)` on `uploaded`/`live` rows;
  - `comment on column`, naming DW-400 and R-287.

  The column is not client-writable (AD-8).
- [x] Architecture `SCHEMA.sql` -- the same, in place. Then `RLS-TEST.sql`, copied byte for byte to `supabase/tests/rls.sql`:
  - the protected list gains `accepted_at`;
  - one assertion that the column exists.

*Server:*
- [x] `apps/web/lib/retention.ts` -- add the following, every word from `HISTORY_WORDS`:
  - `newestFirst` by `accepted_at` (`created_at` as the tie-break);
  - `actionOf`, the emphasised row (the one right after the site's Live row);
  - `changedLine`;
  - `HistoryAnswer`/`HistoryRow` gain `acceptedAt`, `changed`, `drops`, `action`, `emphasis`;
  - `timeLabel(acceptedAt)`;
  - the new words: tooltip, the menu caption, Roll back and Rolling back…, the confirm's title and its two bodies, the D2d
    chip "Uploaded, not live", Re-activate, the outcomes, the refusal, `elsewhere`/`live`/`disconnected`/`busy`, and the "and
    {k} more" and "No changes since" forms.
- [x] `apps/web/lib/preflight.ts` -- extract `droppedKeys(previous, now)` and use it in the dropped row.
- [x] `apps/web/server/deploy/put-back.ts` (new) -- `putBack(io, { userId, projectId, deployId, now })` as Always states. It
  returns `live | uploaded | gone | elsewhere | live-already | disconnected | busy | { refused: DeployError }`. Its io is
  `deploy-io.ts`' own, plus four reads:
  - the row;
  - the site's newest accepted row;
  - the linked site with its `disconnected_at`;
  - fresh moving jobs.

  It joins `server-wiring.test.ts`' lists. *(Dev: the real io is `server/deploy/put-back-io.ts` — `deploy-io.ts`' own update, demote,
  stored-zip read and `call()`, held equal to them by `put-back.test.ts`, plus the four reads — so the History route's function
  carries none of the compile; it is the file on both lists.)*
- [x] `apps/web/server/deploy/run.ts`, `deploy-io.ts`:
  - `accepted_at` is written with `uploaded` (`:667`) and with `goLive`'s live write when the upload was accepted (`:666`);
  - `baseline` orders by `accepted_at`;
  - `DEPLOY_COLUMNS` gains it;
  - export `callTwice` and `activateStep`'s answer handling, or the minimal shared helper, so the put-back sends exactly what
    Ship it sends. *(Dev: `sendUpload` and `sendActivate`, the two requests both send, with `callTwice`, `twice` and `STALLED_MS`
    exported; each reads Ghost's answer with `uploadAnswer`/`activateAnswer`.)*
- [x] `apps/web/server/retention-io.ts` and `api/cron/prune-artifacts/route.ts` -- version reads select and order by
  `accepted_at`. *(Dev: the cron's only `created_at` order is pass 2's over non-version rows, which stays.)*
- [x] `history/route.ts`:
  - GET returns each stored row's `acceptedAt`, `changed`, `drops` and `action`, newest accepted first. It reads at most twice
    the plan's cap manifests: the listed rows and each one's predecessor.
  - POST `{ deploy, act: 'live' }`: `currentUser`, `isUuid`, `putBack`. The answers:
    - 200 `{ outcome }`;
    - 404 gone;
    - 409 `{ code }`;
    - 422 `{ code: 'ghost_theme_refused', detail }`;
    - 502 `{ code, message }`.

    Every answer is `no-store`, and the route sets `maxDuration = 300`. The pin branch is unchanged.

*UI:*
- [x] `apps/web/components/editor/deploy-history.tsx`:
  - **Expanded rows** for the first three rows (S8e `:300-323`):
    - the thumbnail, one aria-hidden component in the frame's shape `D2:76`;
    - chip, Live badge or PINNED, the time;
    - the Changed line;
    - the gscan chip, then the action and the pin.
  - **Compact rows**, as 7.22 built them, plus the quiet Roll back before the pin.
  - **D2d's row**, for `action = reactivate`: the sky border and wash, the chip, `notLiveTitle`, and the Kit `coral`
    Re-activate (26px, Bolt) with its busy form.
  - **Roll back** buttons: `coral-outline` on the emphasised row, the quiet variant elsewhere. Each names its version and,
    where the row is on another site, its host.
  - **The confirm**, a nested `<dialog>` in the switch-site confirm's shape:
    - opened by `openOnCancel`, so focus lands on Cancel;
    - the title "Roll back to v{n}?" and the body;
    - the summary row: chip, time, gscan chip, no by-line;
    - the dropped-settings block when `drops` is non-empty;
    - Cancel, then Roll back with the ink and the icon, busy "Rolling back…".
    - Cancel or Esc closes it and returns focus to the Roll back that opened it.
  - **Outcomes:** said once; the list re-reads; focus goes to ✕.
  - **Refusals:** each is said under its row in a `role="status"` line. Ghost's detail is shown in mono.
- [x] Kit `button.tsx` -- add the quiet Roll back variant (`D2:98`) if no existing variant matches, recorded on the Kit page.
- [x] `editor.tsx`:
  - the clock's `title` becomes the tooltip; its label stays "History";
  - `actHistory` posts the act, and the harness gets its seam `historyAct`.

  `deploy-wizard.tsx`: the ▾ row's caption becomes S4d's.
- [x] Harness `layout.tsx`/`actions.ts` -- the `x-inflozo-harness-history` header gains these values:
  - `rollback`: v3 live, v2, v1 with Changed lines; v1 drops a setting;
  - `uploaded`: D2d's v3, then v2 and v1;
  - `refused`;
  - `elsewhere`;
  - `busy`.

  `harnessAct` answers by header. A seam for the rows' new fields. *(Dev: `rollback` lists five versions — v5 live, v4, v3, v2
  pinned, v1 dropping a setting — so the compact rows and their Roll back are walked too; 7.22's values carry no action.)*

*Tests* (each assertion seen red under a planted reversion):
- [x] `apps/web/retention.test.ts`, `put-back.test.ts` (new, at `apps/web/`'s root), `deploy-run.test.ts`, `drift.test.ts`,
  `deploy.test.ts`, `busy.test.ts`, `server-wiring.test.ts` -- every row of the I/O matrix. A source test proves the put-back
  module and the route's act branch name no `holdsLock`, `resolveEntitlement` or gscan gate.
- [x] `tools/keyboard/journey.spec.mjs` -- the 7.23a journeys:
  - (a) the expanded and compact rows, the tooltip, the caption;
  - (b) Enter on Roll back opens the confirm, focus on Cancel; Esc returns focus to that Roll back;
  - (c) Roll back confirmed: "Rolling back…", said once, focus on ✕;
  - (d) Re-activate on D2d's row;
  - (e) refused, `elsewhere` (no Roll back), `busy`;
  - (f) the dropped-settings block.

  `floor.spec.mjs`: the expanded rows and the confirm at 1440, 1280 and 820, with no sideways scroll.
- [x] `tools/probe/run-verify-editor.cjs` step 121 -- the Verification's real-infra run, with a `STEP121_PLANT` mode for
  Deploy.

*Propagation* (standing rules 3 and 7; end with a grep over `apps/web` for `order('created_at'` on `deploys` version reads):
- [x] Planning documents:
  - FR-J9: a dated note;
  - EXPERIENCE F8: the order, the rows, R-189's by-line, another site's rows, the dropped-settings line;
  - AD-19's note and Story 7.25's card: the put-back takes the per-site lock when it lands;
  - Story 7.32's card: D2d's row is built by 7.23a;
  - MEASUREMENTS: a new § for the rollback executed on T1; *(§91, written by `tools/probe/record-rollback.mjs`' `--t1` run in
    the main session)*
  - VERIFY-AT-BUILD 10's rollback half.
- [x] `deferred-work.md` -- resolve DW-400.

**Acceptance Criteria:**
- **Matches the frame.** Given the editor at 1440, when History opens on a project with stored versions:
  - the expanded rows match S8e `:300-323` and D2a `:75-100`;
  - the compact rows match `:101-150` plus the quiet Roll back;
  - D2d's row matches `D2:194-201`;
  - the confirm matches S8e `:338-345` without the by-line;
  - the tooltip matches S8e `:280`.
- **One click back, really.** Given a project with three stored versions on T1, when v1 is rolled back, then Ghost's active
  theme is v1's files (its download's manifest equals v1's `content_manifest`), v1's row is `live` with the newest
  `accepted_at`, and the site's other live row is `uploaded`.
- **The baseline follows.** Given a Roll back, when the next Pre-flight runs on an untouched site, then D3c passes "since"
  the rolled-back version.
- **No lock, no plan, no gscan.** Given a session reading along on a Free account, when Roll back is confirmed, then it
  completes, and the source test holds that the path consults none of the three.
- **Ghost says no, nothing changes.** Given Ghost answers 422 to a Roll back's upload, then no row changes, the site's
  active theme is unchanged, and Ghost's detail is said under the row.
- **DW-400.** Given a version accepted after newer-checked versions, when the prune runs, then it is kept as the newest.

*Review — R-291 (owner, 2026-11-25), the drift check before a Roll back:*
- [x] One comparison shared by `driftStep` and the put-back's check; `checkBeforePutBack` with the put-back's refusals, the newest
  accepted baseline, the staff-token read, the manifest's own labels, the live copy at `historyCopyPath`.
- [x] The History route's `act: 'check'` (no lock, plan or gscan, held by the source test) and `history/live` (AD-13's signed
  303), on `server-wiring.test.ts`' service-role list.
- [x] The confirm: "Comparing with your live theme…" with its Roll back waiting, then D3c, D3a (the Download, the foot) or D3b;
  the harness's `harnessCheck`; every 7.23a journey waits for the check; journeys (m)–(p) and the floor at 1440/1280/820.
- [x] Walk 121: the clean line before (c)'s Roll back, and 121i — a hand edit on T1, D3a's list in the confirm, the Download's
  zip equal to the live theme, the Roll back anyway; `STEP121_PLANT` leaves the same invisible hand edit for the owner's test.

### Review Findings

Story 7.23a's Review, 2026-11-25: five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, the read-only
Real-infra verifier), then walk step 121 on production and T1 on the owner's in-session go. Every patch below is applied; one
decision was the owner's (Question 2, ruled option 1 — R-291, built in this Review); three items are deferred to the stories that own them; the rest are dismissed below.

- [x] [Review][Decision] **Roll back replaces the theme on the site without FR-J16's drift check** — FR-J16 runs the check "before
  every deploy after the first", and the spec never says whether a Roll back is one. Question 2 below — **ruled option 1, R-291**:
  the check runs first, in the confirm, and is built in this Review (the tasks below)
- [x] [Review][Patch] **Every failed Re-activate was "Ghost's own theme check refused vN"** — `activateAnswer`'s `notLive` covers a
  5xx, a 429 and Ghost saying it does not hold the theme. A 429/5xx is now `ghost_unavailable`; Ghost's `ValidationError` "…cannot
  be activated because it was not found in the theme directory" (`activate.js:46-54`, read in source in 6.58.0 and 5.130.6) falls
  through to the Roll back path — the spec's own "otherwise re-upload" — so a theme deleted in Ghost Admin is no dead end; a
  `ThemeValidationError` stays Ghost's check with its detail [`put-back.ts`, `lib/deploy.ts` `themeNotHeld`, `put-back.test.ts`,
  walk 121e2]
- [x] [Review][Patch] **A record write that failed after Ghost acted was said as "…before anything reached your site"** — and,
  found by the new test, never reached the catch at all: `return goLive(…)` without `await` threw out of `putBack` (a 500). Every
  call is `return await` now, and once Ghost accepted the upload or the activation the refusal says
  `HISTORY_WORDS.unrecorded` ("v2 reached {host}, but History couldn't record it. Try again.") [`put-back.ts`, `lib/retention.ts`,
  `put-back.test.ts`]. The stale record itself is DW-397's class (below)
- [x] [Review][Patch] Ghost's refusals on the put-back path were not logged (the matrix's "logged by code"); `ghostSaid` logs the
  code alone [`put-back.ts`, `put-back.test.ts`]
- [x] [Review][Patch] D2d's row lost its chip and line past the first three rows (three newer rows of another site above it); it is
  always drawn expanded [`lib/retention.ts` `historyRows`, `retention.test.ts`]
- [x] [Review][Patch] The undo row's raised shadow was not drawn (S8e `:308`, exactly `shadow-md`; D2a `:84` and D2c `:265` draw
  .06 on the same row, and S8e's drawer frame decides) [`deploy-history.tsx`, journey (a)]
- [x] [Review][Patch] The undo was "the row after Live" even when that row was another site's; it is the next row on the linked
  site [`lib/retention.ts`, `retention.test.ts`]
- [x] [Review][Patch] **"— nothing is lost." was promised when the dropped settings were unknown** (a row kept before Story 7.18b's
  facts). `drops` is tri-state — `[]` known, `null` unknown — and the body stops at "stays in history." unless it is known empty;
  `confirmBody` takes the drops themselves [`lib/retention.ts`, `deploy-history.tsx`, `retention.test.ts`, journeys (b)(f)(k)]
- [x] [Review][Patch] "v{n} stays in history" was said of a Live row whose zip was pruned; `liveVersion` is null unless the Live row
  is a stored version [`lib/retention.ts`, `retention.test.ts`]
- [x] [Review][Patch] Only an ending read the list again: a 409 `live`/`elsewhere` (another tab acted) and a request whose fate is
  unknown now re-read, then say the sentence once — under the row while it still has an action, else in the drawer's region with
  focus on ✕; a lost answer whose re-read shows the row live says it is live [`deploy-history.tsx`, journey (i)]. *The "landed"
  branch is not walked: the harness answers every read alike.*
- [x] [Review][Patch] The drawer's own Esc guard during a Re-activate (no confirm on top) was never pressed; journey (d) presses Esc
  twice while it is held [`journey.spec.mjs`]
- [x] [Review][Patch] Executed checks where only source text held: the prune's REAL `versions` select run on production after the
  Roll back to v1 (v2 pruned, never v1; the control without `accepted_at` prunes v1 — walk 121c); another account's POST to this
  project's version → 404 with T1 untouched (121h); the confirm's dropped-settings block fed by the real route (v3's planted
  `walk121_probe`, restored — 121b/c) [`run-verify-editor.cjs`]
- [x] [Review][Patch] `put-back.test.ts`: zero Ghost calls asserted for every refusal (it was three of eight), the fake-only
  assertion replaced by `putBack` itself, and `queries.length >= 5` derived from the file's own `supabaseAdmin()` calls
- [x] [Review][Patch] `harnessAct` sat between `harnessPin`'s doc and `harnessPin`; the Roll back's dead "on {host}" branch is gone
  (another site's row has no action); the `ponytail:` moved to the `busy` refusal and names both races (a ship during a put-back,
  two put-backs at once); a `ponytail:` at the History GET's one light read names PostgREST's `max_rows` = 1000 ceiling and the
  upgrade path; `deploy-io.ts`' comment says rows of R-99's window carry a null `accepted_at` too [`actions.ts`,
  `deploy-history.tsx`, `put-back.ts`, `history/route.ts`, `deploy-io.ts`]
- [x] [Review][Patch] The manifest bound is "twice the cap and one Live row per site", not "twice the cap" — recorded in the Spec
  Change Log
- [x] [Review][Defer] A record write failing twice after Ghost acted leaves `accepted_at` unstamped (the drift baseline wrong) or,
  when only the demote fails, two `live` rows; Ship it's `failInfra` says the same false "before anything reached your site"
  [`put-back.ts`, `run.ts` `failInfra`] — added to DW-397, owner Story 7.32
- [x] [Review][Defer] Two put-backs at once, or a ship starting during one, can race (Ghost's `EEXIST` to one) [`put-back.ts`] —
  Story 7.25's card, which already carried the ship's half, gains the two-put-backs half
- [x] [Review][Defer] A version compiled for a Ghost major the site has since left is put back unchecked (Ship it reads the site's
  major; no deploy records the one it compiled for) [`put-back.ts`] — DW-401, owner Story 15.7

**Dismissed, each in one line:** Re-activate without a dropped-settings warning (while a row is the newest accepted, no other
upload happened on the site since, so Pre-flight or the Roll back confirm already warned of exactly this pair) · a job resting at
`awaiting_ship` not blocking a put-back (refusing would hold every Roll back behind a resting check; Ship it after one still ships
what the customer pressed) · `elsewhere` naming three states (only a stale drawer meets the other two, and it now re-reads) · the
prune deleting the zip between the row read and the download (a polite "ours" sentence on a window of milliseconds) · a
re-read failing right after a success (its sentence is true) · the harness lacking `uploaded`, 502-with-message and 409-`live`
answers (the same branches journeys (c), (e) and (l) walk; the sentences are `retention.test.ts`') · an empty host on an early
failure (the infrastructure sentence names none) · a Live row stale after a switch in Ghost Admin drawing no action (the spec's
frozen rule; any other row's Roll back, or Ship it, reaches the site) · the activation refusal after a Roll back's accepted upload
said as D2d's (the matrix's row and the Change Log; Re-activate then says Ghost's reason) · the confirm's 38px buttons and the
native-title tooltip (the switch-site confirm's shape and the task's `title`, as the spec asked) · the four ACs not yet proven
through the product (the walk is this Review's, below).

## Spec Change Log

- **2026-11-25, Dev — what landed beside the plan, each a routine call.**
  - **The put-back's real io is its own file**, `server/deploy/put-back-io.ts`: `deploy-io.ts`' update, demote, stored-zip read
    and `call()` (held equal to `deploy-io.ts`' own by `put-back.test.ts`) plus the four reads. Importing `deploy-io.ts` would
    have put jsdom and both gates into the History route's function for nothing.
  - **Two exported requests**, `sendUpload` and `sendActivate` (`run.ts`): Ship it and the put-back both build their Ghost writes
    through them, so "exactly what Ship it sends" is one piece of code, held by a source test.
  - **Re-activate refused** by Ghost's activation (`activateAnswer`'s not-live answer, which runs Ghost's own check,
    `activate.js:55-60`) is said as Ghost's own check with its detail — the same 422 words as an upload Ghost refuses. A **Roll back
    whose upload Ghost accepted but whose activation it did not** ends `uploaded` whatever the activation answered (the theme is on
    the site: D2d's row, Re-activate from there); an infrastructure failure, twice, is `deploy_infrastructure` (502).
  - **The drawer waits too.** The confirm is nested in the drawer, so while a put-back is out the drawer also carries
    `data-unstoppable`, and its Esc, ✕ and backdrop wait; every pin and action waits as the pins already waited for each other.
  - **A compact row too full for one line** — PINNED plus the quiet Roll back does not fit 420 — moves its time, Roll back and pin
    TOGETHER to a second line (unpinned rows stay on one).
  - **The Changed line** names a template by `fileLabel` ("Home page 2", "404"), "added {label} template" / "removed {label}
    template" where the other version lacks it (the frame's "added 404 template"), and draws the plain names first.
  - **Three tokens** for frame values with none (R-236), recorded in DESIGN.md: `mint-wash` (the Live row), `sky-wash` (D2d's
    row) and `sky-ink` (its chip's words). The thumbnail's accent block is `coral-deep` (`#E84B34` for the frame's `#E8450A`).
  - **The harness's `rollback`** lists five versions (v5 live, v4, v3, v2 pinned, v1 dropping a setting) so the compact rows'
    Roll back is walked; 7.22's header values keep no action, so 7.22's journeys walk the drawer as 7.22 drew it.
  - **Two of 7.22's unit tests re-expected**, each by the rule this spec changed: `deploy.test.ts`' GET reads "newest first" from
    `historyAnswer` (DW-400) instead of the query's `created_at`, and `busy.test.ts`' pin also waits while a put-back is out.
  - **Walk step 121's D2d state and the owner's plant.** R-264 (a) refuses a Deploy only while Inflozo's own record says this
    project's theme is live on the site, and putting T1 back on Casper outside Inflozo does not change that record. So both write
    the record as a refused activation leaves it (v3 `uploaded`, `activated` false) with the service key after Casper is put back,
    and say so; the owner's "Before you start" now describes that. The planted refused zip is v1's own files plus one template
    Handlebars cannot parse (`GS005-TPL-ERR`, fatal) — the case §91 executed on T1 — proved fatal on gscan 6.4.2 locally before the
    step stores it.
- **2026-11-25, Review — what the review changed beside the plan, each a routine call.**
  - **Re-activate falls through to the Roll back** when Ghost says it does not hold the theme (`ValidationError`, `activate.js:46-54`
    in both majors, read in source; executed by walk 121e2): "put back" uploads whenever Ghost lacks the files, as Approach says.
  - **The manifest bound** is the listed rows, each one's predecessor and each site's Live row (the dropped settings need it) — at
    most twice the cap and one per site, not "twice the cap".
  - **`drops` is tri-state** (`null` when a row has no Pre-flight facts) and `confirmBody` takes the drops themselves, so the body
    never says "nothing is lost" of settings nobody read.
  - **One new word**, `HISTORY_WORDS.unrecorded`, for a record write that failed after Ghost acted (R-170, R-283's plain voice).
  - **D2d's row is always expanded**, and the undo is the next row on the linked site, raised with `shadow-md` (S8e `:308`).
- **2026-11-25, Review — R-291 (owner, Question 2, option 1): a Roll back runs FR-J16's drift check first.** The owner renegotiated
  the intent, so the I/O matrix gains its five rows. The comparison is Story 7.21's own, extracted from `driftStep` into one
  function both call; the put-back's check answers the same refusals as the put-back, reads the newest accepted upload as its
  baseline and Ghost's live theme with the Staff Access Token, names files by the manifest's own names (the working document is
  still never read), and keeps a found drift's live copy under its own key (`historyCopyPath`), served by `history/live` as
  `deploy/live` serves D3a's. In the confirm it is D3's components and words, extrapolated (R-74). Re-activate runs none.

## Design Notes

**The row is updated, never copied — so "prune by object" never arises.** The card's "records that upload as the newest
accepted one — a `deploys` row with status `uploaded` or `live`" can be read two ways: a new row, or the version's own row
updated. A new row naming the same object would make every count wrong at once, and each would need grouping by object:
- the cap and the history's length (`prunable`);
- `pin_version`'s N−1 (it counts rows in SQL);
- the list;
- the sweep's dead-zip pass.

Updating the version's own row keeps one row per object, so 7.22's prune, pins and sweep hold unchanged. The upload is still
recorded as the newest accepted, with the artefact's own `content_manifest`, through `accepted_at`. The `deploy_kind` values
`rollback`/`snapshot_restore` stay unwritten. No story reads a rollback count (G8 has no owner in `epics.md`).

**Newest is the upload Ghost accepted (DW-400).**
- `accepted_at` is the time Ghost last took this artefact's files. The list, the prune and the drift baseline all order by
  it, and the row's time label shows it.
- After a Roll back, the version put back sits on top with Live, and the version it replaced is second with the emphasised
  Roll back — the undo. That is S8e's shape, where the row after Live carries the coral Roll back (`:313`).
- Version numbers are untouched: `nextVersion` is still the highest plus one.

**Roll back on every row, though the frame draws it on three** (a routine call, R-74 as scoped by standing rule 6). FR-J9
decides behaviour: "any retained artifact redeploys in one click". The export decides what the row is built from, so the
compact row gains the expanded row's quiet Roll back, sized as drawn.

**Another site's rows have no Roll back** (a routine call; the card leaves it to this story).
- Each zip is built for its site's frozen name and is that site's drift baseline.
- Since R-267 that site may now be linked to another project. Rolling back there would replace that project's live theme
  without its history knowing.
- The row keeps "on {host}" and its pin.
- To roll back there, link this project to that site first (S8a's Switch).

**No by-line, a static thumbnail.**
- "by Maya" names a person. R-189 rules that no surface names one, because a project has one user.
- No record holds a version's look, and rendering one per version is out of proportion. The thumbnail is therefore the
  frame's schematic, drawn alike on every expanded row (`D2:76`), aria-hidden.

**The confirm tells the truth about Ghost's settings.** Ghost deletes a custom setting's value when a theme that no longer
declares the key goes live (VERIFY 76, read in source, executed at §78). So "nothing is lost" would be false whenever the
version put back lacks a setting the live one declares. Pre-flight already says this for a ship (Story 7.10's Question 2).
The confirm reuses that rule and those words, and its body stops at "stays in history." when it does.

**No job row; Story 7.25 closes the race.**
- A put-back is one request: at most two uploads of 120 s and an activation of 15 s, inside the route's 300 s.
- It refuses while a ship on the same site is moving.
- A ship that starts during a put-back can still race it. Ghost then answers `EEXIST` (`deploy_running`) to one of them.
- AD-19's per-site advisory lock, built by Story 7.25, closes this race. Its card gains the put-back.
- `ponytail:` comment at the refusal, naming that ceiling.

**`routes.yaml` is left alone.** A Roll back to a version without a template that a route names renders that route with
its default template (`templates.js:191`). It never breaks the page. Uploading the old routes would also undo collections
the customer still wants (FR-I4).

**Why split (Question 1).** The card holds three surfaces, each with its own owner test:
- the drawer's actions;
- Restore original, which carries Ghost 422 fallback paths, DW-389's default-theme activation, DW-391's download following
  across three buttons, and a real snapshot restore on T1;
- the phone card at 390.

Story 7.22 alone was one drawer. The project has split stories of this size before: R-259 and R-281.

## Questions for the owner

### Question 1 — Split Story 7.23 into three smaller stories?

**In plain English.** Story 7.23 asks for three different things:
1. **Roll back** and **Re-activate** buttons inside the History panel.
2. A **Restore original** button that puts your site's old, pre-Inflozo theme back. This has its own tricky cases: Ghost may
   refuse an old theme, Casper must be switched on rather than uploaded, and downloads must not throw you out of the editor.
3. A **Deploy history card on a phone**, where opening a project shows "Roll back to v4".

Each has its own screen and its own test by you. Doing all three at once makes one very large story, and one long test.

**An example.** With the split, you would test them one at a time:
- **7.23a** — open History on a laptop, roll your test site back from v3 to v2, and see Ghost serve v2.
- **7.23b** — press **Restore original** and see Casper come back.
- **7.23c** — open the project on your phone, tap **Roll back to v2**, and see it switch.

Without the split, all of that is one test after one long build.

1. **(RECOMMENDED) Split in three, done in order: 7.23a (Roll back and Re-activate in History — this spec), 7.23b (Restore
   original), 7.23c (the phone card).** Each piece's requirements move word for word into its own card (R-195).
2. **Split in two:** 7.23a takes Roll back, Re-activate and the phone card; 7.23b takes Restore original.
3. **Keep one story** with everything in it.

**Ruled: option 1 (owner, 2026-11-25) — R-290.** *"1. (RECOMMENDED) Split in three, done in order: 7.23a (Roll back and
Re-activate in History; this spec), then 7.23b (Restore original), then 7.23c (the phone card). Each piece's requirements
move word for word into its own card."* `epics.md` carries the three cards and Epic 7's moved list.

### Question 2 — Should Roll back first check whether someone changed your theme in Ghost Admin?

**In plain English.** Before every **Ship it**, Inflozo compares the theme on your site with the version it last uploaded there
(the "drift check", FR-J16). If someone changed the theme outside Inflozo, Ship it stops, lists the changed files, and offers to
download the current theme before replacing it. **Roll back** also replaces the theme on your site, but today it skips that check.
The PRD says the check runs "before every deploy after the first", and this story's spec never said whether a Roll back counts —
so the choice is yours.

**An example.** Your designer downloads your live theme (v3), edits the post template, and uploads it in Ghost Admin. A week later
you press **Roll back** to v2.
- **Today:** v2 goes live, and the designer's edit is gone — no warning, no copy kept.
- **With the check:** the Roll back box says "Something changed on ghost6.inflozo.com since v3: Post template" and offers
  **Download current theme** before you confirm. You can still roll back.

1. **(RECOMMENDED) Check first, in this story.** Pressing Roll back reads your site's theme first (about a second, as Run checks
   does). If it changed since Inflozo's last upload, the box names the changed files and offers Download current theme; you can
   still roll back. If the check cannot run (no Staff Access Token, Ghost busy), the box says "couldn't verify" and lets you go on,
   as Ship it does. Re-activate is unchanged: it switches on files Ghost already holds and replaces nothing.
2. **No check.** Roll back stays instant. The box adds one line: "Anything changed in Ghost Admin since v3 is replaced." The PRD
   gets a dated note that Roll back is exempt from the drift check.
3. **Check, but later.** 7.23a ships as it is now, and the check is built with Story 7.23b (Restore original), which also replaces
   the theme on your site.

**Ruled: option 1 (owner, 2026-11-25) — R-291.** *"(RECOMMENDED) Check first, in this story. Roll back checks your site first
(about a second). If something changed, the box lists it and offers the download; you can still roll back. If the check can't run,
it says "couldn't verify" and lets you continue, as Ship it does."* Built in this Review (the Spec Change Log, the I/O rows, the
tasks below); Story 7.23b's card carries the same question for Restore original.

## Owner's manual test

**Before you start:** Deploy planted a Free test account on your go (2026-11-25), `umngkmr+rollback723a@gmail.com`. The account is
connected to T1 (`ghost6.inflozo.com`), and its project **Rollback test** holds three versions:
- **v1**, **v2** and **v3** were shipped live in turn, and each version's home page headline names its number ("Version 1",
  "Version 2", "Version 3").
- T1 was then put back on Casper, as you would do in Ghost Admin, and Inflozo's record of v3 marked "uploaded, not live" — the
  state a Deploy only, or an activation Ghost refused, leaves. So v3 is on T1 but not live.
- v1's stored zip was swapped for one Ghost refuses, so that step 7 can show the refusal.
- v3's files on T1 were then changed by one invisible line, as if someone had edited the theme in Ghost Admin, so that Roll back's
  check has something to find in steps 4 and 5 (R-291).

Sign in at `https://app.inflozo.com/sign-in` with `umngkmr+rollback723a@gmail.com` and open the link that arrives. Use a desktop
browser at least **1366 px** wide. Keep a second tab on `https://ghost6.inflozo.com`.

1. **URL:** `https://app.inflozo.com/projects/31885d91-cea5-4043-b0b2-30ae4545d93f`. **Screen:** the editor. **Do:** rest the pointer on the
   clock icon just left of **Ship it**, then press it. **Type:** nothing. **See:**
   - the tooltip reads "History — every version, one click back";
   - a panel titled **HISTORY — ROLLBACK TEST** opens, and nothing in it names a person.
   - **v3** at the top has a blue **Uploaded, not live** chip, the line "Your theme is on your site but isn't live yet." and
     a red **Re-activate** button.
   - **v2** and **v1** each show a small picture, a "Changed:" line (v1 says "First deploy"), a yellow **0 · 1** chip, a time,
     a **Roll back** button and a pin.
   - Nothing shows a green **Live** dot.
2. **URL:** `https://ghost6.inflozo.com`. **Screen:** your test site. **Do:** reload it. **See:** Casper.
3. **URL:** `https://app.inflozo.com/projects/31885d91-cea5-4043-b0b2-30ae4545d93f` (the same editor). **Do:** press **Re-activate** on v3. **See:** the button says "Activating…", then v3 shows the
   green **Live** dot, and v2's Roll back becomes the outlined red one. Reload ghost6.inflozo.com: the headline reads
   "Version 3".
4. **URL:** `https://app.inflozo.com/projects/31885d91-cea5-4043-b0b2-30ae4545d93f` (the same editor). **Do:** press **Roll back** on v2. **See:** a box "**Roll back to v2?**" with "Your live site
   switches to v2 instantly. v3 stays in history — nothing is lost.", v2's chip, time and **0 · 1**, and **Cancel** already
   highlighted. For a moment it says "Comparing with your live theme…", then a warning with a yellow "**1 file differs**", the one file
   the plant changed listed under **Changed**, the line "Rolling back replaces it with v2's. Take a copy of the live theme first if
   you want to keep those edits.", and **Download the live theme first**. **Do:** press
   **Download the live theme first**. **See:** a zip downloads (your site's theme as it is now). **Do:** press **Cancel**.
   **See:** the box closes and nothing changed.
5. **URL:** `https://app.inflozo.com/projects/31885d91-cea5-4043-b0b2-30ae4545d93f` (the same editor). **Do:** press **Roll back** on v2 again, wait for "1 file differs", then press the box's **Roll
   back**. **See:** "Rolling back…", then the panel lists **v2** (Live) first and **v3** second with the outlined Roll back.
   Reload ghost6.inflozo.com: the headline reads "Version 2".
6. **URL:** `https://app.inflozo.com/projects/31885d91-cea5-4043-b0b2-30ae4545d93f` (the same editor). **Do:** press **Roll back** on v3. **See:** this time the box says "**Nothing changed on your site
   since v2**". **Do:** confirm. **See:** v3 is Live again and first; ghost6.inflozo.com says "Version 3".
7. **URL:** `https://app.inflozo.com/projects/31885d91-cea5-4043-b0b2-30ae4545d93f` (the same editor). **Do:** press **Roll back** on v1 and confirm. **See:** under v1, a line saying Ghost's own theme
   check refused v1, followed by Ghost's message in small grey type. v3 stays Live, and ghost6.inflozo.com still says
   "Version 3".
8. **URL:** `https://app.inflozo.com/projects/31885d91-cea5-4043-b0b2-30ae4545d93f` (the same editor). **Do:** close the panel, open the small ▾ on **Ship it**. **See:** the **History** row's second
   line reads "Versions, gscan reports, rollback".
9. **URL:** `https://app.inflozo.com/projects/31885d91-cea5-4043-b0b2-30ae4545d93f` (the same editor), **keyboard only.** **Do:**
   - open History from the clock with Enter;
   - press Tab until v2's Roll back is focused, then press Enter;
   - in the box, press Esc.

   **See:** the box opens with focus on Cancel, and Esc puts focus back on v2's Roll back.
10. **URL:** `https://app.inflozo.com/projects/5b9724e4-5fab-4dc6-8853-56cec9a4bd44`, signed in as
    `umngkmr+prohistory722@gmail.com` (Story 7.22's Pro account, in a second browser). **Do:** open History. **See:** the top
    three rows are the big kind, and the seven below are the slim kind, each with a small **Roll back** before its pin.
    **Do:** press one slim row's Roll back, then **Cancel**.

**After the test:** say "passed", or list what you saw. Your Re-activate leaves an Inflozo theme live on T1, so Claude puts T1
back on Casper on your go.

## Owner's test findings

**Owner's test (owner, 2026-11-26): passed.** The owner replied *"passed"* on the deployed site (`dpl_CP7B8vxvzRzWPfSdxvxRpJeT3mPY`,
`https://app.inflozo.com`). No findings.

**What production showed, and the owner's ruling on it.** Before recording, a read of production (`SUPABASE_SECRET_KEY`, GET only)
found the planted account `umngkmr+rollback723a@gmail.com` never signed in after the plant. His first "passed" came from his own
account instead: at 02:40 and 02:41 UTC, signed in as his main address, he rolled **Ghost 6 Project** back to v1 and then to v2
on ghost6, each a re-upload (`accepted_at` moved), v2 left live. Asked in R-83's shape, the owner ruled *"1. Walk 3 steps
(RECOMMENDED)"*: the planted steps 3 (Re-activate), 4–5 (the drift warning, its download, then the Roll back) and 7 (Ghost's
refusal). He walked them and replied *"passed"* again. Production and Vercel's request rows (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`,
the request-logs endpoint) show each one, 2026-11-26 UTC:
- 03:33:32 his sign-in (`POST /sign-in` 200, the account's `last_sign_in_at` 03:33:58);
- 03:34:34 **Re-activate v3**: `POST …/history` 200, and v3's `activated_at` 03:34:34 with `accepted_at` unchanged (Re-activate
  re-uploads nothing);
- 03:34:50 v2's confirm **check** (`POST …/history` 200), then 03:35:03 **Download the live theme first** (`GET …/history/live`
  303 to the signed zip);
- 03:35:09 **Roll back to v2**: `POST …/history` 200, v2 `live` with a new `accepted_at` 03:35:10, T1's Home reading "Version 2"
  with `inflozo-rollback-test` active;
- 03:35:27 v1's confirm check (200), then 03:35:36 **Roll back to v1: 422**, v1's row unchanged and v2 still live.

Steps 1–2 and 8–10 (the drawer's first look, the ▾ menu row, keyboard and the Pro list) were not walked by him; walk step 121's runs
on production and T1 at Review are their executed proof, and its journeys run in `pnpm keyboard` on every push.

**Afterwards T1 was put back** on the owner's in-session go (*"1. Casper back (RECOMMENDED)"*), with `GHOST6_STAFF_ACCESS_TOKEN` read
in-process: Casper activated (200), `inflozo-rollback-test` deleted (204), and the read-back shows `casper*`, `racer`, `source` and
`inflozo-ghost6` (his own Ghost 6 Project's theme, kept, no longer live), with `routes.yaml` at 130 bytes, byte for byte the same
before and after. Every account and project, his own and the planted one, was left as it is.

## Verification

**Commands:**
- `pnpm check` -- expected: green. This is lint, typecheck and every package test, among them the retention, put-back,
  deploy-run, drift, deploy, busy and server-wiring tests. The run prints its own counts; never write one down.
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, with `accepted_at` protected and present.
- `python3 tools/doc-audit.py --check`, run twice -- expected: green.
- `pnpm keyboard` -- expected: journeys 7.23a (a)–(f), 7.22's unchanged, and the floor all green.
- `grep -rn "holdsLock\|resolveEntitlement" apps/web/server/deploy/put-back.ts` -- expected: nothing.

**Real infrastructure** (R-82; on the owner's in-session go, in the main session):
- **Supabase production database:** the migration is applied through `SUPABASE_DB_POOLER_URL`. Read back the column, its
  backfill, and that `authenticated` cannot write it. Control: the column is absent before the apply.
- **Walk step 121, production + T1** (a throwaway Free account), from a clean worktree at the deployed sha:
  - three ships;
  - a Roll back to v1: T1's active theme downloaded (staff token) and its manifest equal to v1's `content_manifest`, the
    records as the ACs say, then the next Pre-flight's D3c "since v1";
  - an undo;
  - Casper put back, then a Deploy only, then D2d's Re-activate making it live;
  - a planted zip Ghost refuses: 422 said with its detail, and T1's active theme unchanged (control: the same Roll back with
    the real zip is accepted);
  - a Roll back from a second session that does not hold the lock;
  - `elsewhere` and `busy` answer 409;
  - finally T1 back on `casper*`, the account deleted, and the users and projects counted back.

  **Ghost 5's half** (T3, R-238) is postponed to DW-326's pass at Story 15.7.
- **Vercel:** the deployment is READY from the Dev head.
- **The owner's test above (R-80).**

**Executed — Dev, the main session (2026-11-25, Node 24; the real services by their variable names, every key read inside the
script from `tools/probe/.env`, never on argv, no value printed; the owner's in-session go to both writes, "1. Go" and "1. Go"):**
- **Supabase production database** (`SUPABASE_DB_POOLER_URL`):
  - **Before, read-only:** a catalogue of `public` and `private` (columns; functions without the extension-owned ones, each with
    `md5(prosrc)`; triggers; policies; indexes; enums; constraints; the client's column privileges on `deploys`) read on
    production inside a `read only` transaction, against a PostgreSQL 17 container built from the prelude and every migration
    except 7.23a's. Both had 576 rows, and `diff` was empty: production had drifted nowhere (7.22's lesson). `accepted_at` was absent
    on production — the control.
  - **First attempt — nothing applied:** the apply script's own "before" read named `accepted_at`, so it stopped with 42703
    before any statement of the migration ran. The read was fixed and the script run again.
  - **The apply, one transaction, then read back:**
    - the column is `timestamp with time zone`, nullable, no default, and its comment names DW-400, R-287 and AD-8's
      select-only;
    - the backfill: of 5 `live` rows and 14 `uploaded` rows, all 19 carry `accepted_at = coalesce(activated_at, created_at)`; the 2
      `checking` rows stay null;
    - privileges: `authenticated` INSERT false, UPDATE false, SELECT true (the table-wide read); `service_role` UPDATE true;
    - as a signed-in customer (`set local role authenticated` with a JWT sub, in a transaction rolled back): a read of the column
      is allowed (the control), and `update public.deploys set accepted_at = now()` is refused, **42501**.
  - **After:** production's catalogue against a container built from every migration, 7.23a's applied twice (it re-runs
    cleanly): 578 rows each, and `diff` empty. Production before against after differs in exactly two lines: the column and the
    customer's SELECT on it.
- **The RLS gate's control:** the architecture's `SCHEMA.sql` at HEAD with the 7.23a migration withheld: **exit 3**, stopping
  at the F3 list (`column "accepted_at" of relation "deploys" does not exist`). With it: exit 0 (below).
- **T1 `ghost6.inflozo.com`** (`GHOST6_URL`, `GHOST6_ADMIN_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN`):
  - first, read-only, `GET themes/` with the staff token: 200, `casper` active, with `racer` and `source` beside it, and no probe
    theme;
  - then `node --experimental-strip-types tools/probe/record-rollback.mjs --t1`: exit 0, every row held behind its control →
    **MEASUREMENTS §91**:
    - the local half: v1 and v2 zipped by `zipTheme` read back with zero differences; v2 against v1 is exactly `home.hbs`;
      gscan 6.4.2 scores v1 0 · 0 and blocks the planted theme on `GS005-TPL-ERR`.
    - Step 1: v1 uploaded under the inactive probe name → `active false` (the control).
    - Step 2: activated → 200, and the download equals v1.
    - Step 3: v2 under the ACTIVE name → `active true` with no PUT (R-264), and the download is v2's.
    - **Step 4, the Roll back:** v1's same zip again under the active name → `active true`, no PUT, and the download equals v1's
      manifest again.
    - **Step 5, Ghost refuses:** the planted fatal theme → **422 `ThemeValidationError`** (`GS005-TPL-ERR` fatal, `GS120`),
      read by `uploadAnswer` as `ghost_theme_refused` with Ghost's detail. The download still equals v1's, and the probe is still
      active: Ghost replaced nothing.
    - **Step 6, Re-activate:** `casper` activated (the control), then the probe's activation ALONE → active, and its files are
      still v1's.
    - Step 7, in the `finally`: `casper` active again, the probe deleted, read back.
- **CI on the Schema push 43392c29** (`GITHUB_TOKEN`): run 45598344309 — `check`, `rls` and `deploy` success; the Render matrix
  success. **Vercel** (`VERCEL_TOKEN`): `dpl_8f4iMHA7BRB1bDx2Nsii4RG5AfhY` READY on production, built from 43392c29.
- **The main session's own gates, on the final tree:** `pnpm check` exit 0 (every package 0 failing, each printing its own
  count); `bash supabase/tests/run-rls-gate.sh` exit 0 with the 7.23a PASS line.
- **`pnpm keyboard`, the whole gate, on the final tree:** every 7.23a journey (a)–(l), the 7.23a floor, 7.22's journeys and the
  no-pointer sentinel passed; 2 others failed:
  - `DW-273 (the review of 5.24e)`, waiting 5 s for the Paywall's URL;
  - `7.18a · an activation that did not complete`, waiting 5 s for the editor's first canvas child in `open()`.

  Both stopped on a page load before their own first step, as the implementation pass's floor failure did. Neither touches a
  file this story changed: `deploy-wizard.tsx` gained a comment only. Re-run with `-g` on the two titles and
  `--repeat-each=5`: **10 of 10 passed**, so both are intermittent. CI's full run on the Dev push is the next reading.
- **Not hit in Dev:** Resend and Dodo (a put-back sends no email and reads no plan). Walk step 121 (production + T1) and
  `STEP121_PLANT` are written and have never run: they are the Review's and Deploy's, from a clean worktree at the deployed sha,
  each on the owner's in-session go.

**Executed — Dev, the implementation pass (2026-11-25, Node 24; local only — it made no production, Vercel, Resend, Dodo or T1
call):**
- **`pnpm check`:** green (exit 0) — lint, typecheck and every package's tests, each printing its own count, the web package's
  run with the retention, put-back, deploy-run, drift, deploy, busy and server-wiring tests among them. (On Node 22 the shell's
  default, `live-content.test.ts` is cancelled by the runner before it runs; on Node 24, the project's, it passes.)
- **Each new assertion seen red under a planted reversion**, then restored:
  - `retention.test.ts`: `newestFirst` by `created_at` alone (3 red), `changedLine` without its dedupe (1), `actionOf` on any
    site (2);
  - `put-back.test.ts`: no demote (4), a PUT even when the upload is live (3), Re-activate uploading (1), no `disconnected`
    refusal (1), no `accepted_at` on an accepted upload (1), Ghost's 422 detail dropped (1), a plan read in the route's act
    branch (1);
  - `deploy-run.test.ts`: Ship it's `uploaded` write without `accepted_at` (2); `drift.test.ts`: the baseline by `created_at`
    (1); `busy.test.ts`: the confirm without `data-unstoppable` (1).
- **`bash supabase/tests/run-rls-gate.sh`:** exit 0, with "PASS (7.23a): deploys.accepted_at is a nullable timestamptz with no
  default, commented and client-unwritable".
- **`grep -rn "holdsLock\|resolveEntitlement" apps/web/server/deploy/put-back.ts`:** nothing (and nothing in `put-back-io.ts`).
- **The propagation grep** for `order('created_at'` on `deploys` version reads in `apps/web`: only the tie-breaks after
  `accepted_at` (the drift baseline, the put-back's newest accepted); the sweep's pass 2 orders non-version rows and stays.
- **The journeys, against a harness dev server:** 7.23a (a)–(l) and the floor's 7.23a at 1440/1280/820 green; with
  `deploy-history.tsx` and `editor.tsx` put back to HEAD all nine red; 7.22's journeys, its floor, R-266's centring stop, 7.18a's
  ▾-menu journey and the no-pointer sentinel unchanged and green.
- **`pnpm keyboard`** (the full gate, on the working tree, Node 24): 349 passed and 1 failed — every 7.23a journey, the 7.23a and
  7.22 floors, 7.22's journeys, R-266's centring stop and 7.18a's ▾-menu journey among the passes. The failure was the floor's
  "the bar at every width from 720 … fine" at its first line: the Paywall's canvas frame was not there within 5 s, the page still
  on its "Opening the editor…" skeleton — it never reached the bar's measurement. Re-run, `-g "the bar at every width from 720"
  --repeat-each=3`: 5 of 6 passed, and the one failure was the same skeleton at the same line in the touch variant, on Home. This
  story changes nothing the editor loads before that line (the clock's `title` is its only bar change), so it is read as the dev
  server's intermittent first paint; CI's full run on the Dev push is the next reading.
- **After the matrix audit's additions:** `pnpm keyboard -g "7\.23a" --repeat-each 3` (journeys (a)–(l) and the 7.23a floor):
  the first run, 44 passed and 1 failed — (b) once, the confirm reopened before its last `close` event, fixed above; after the
  fix, 45 passed. `pnpm check` green again (exit 0). The whole keyboard gate is the main session's.
- **`python3 tools/doc-audit.py --check`**, twice: the first regenerated the story board (STALE), the second PASS.
- **The matrix audit** (each row to a check that ran in that row's state; widened after the coordinator's audit found seven rows
  checked only by words, a status code or a static read — each new check seen red under a planted reversion, then restored):
  - Roll back over the live theme; theme not active (and the activation refused); Re-activate (and Ghost refusing again);
    Ghost's 422; other Ghost failures; the undo; elsewhere, live, disconnected and busy as the server answers them → `put-back.test.ts`.
  - **Number after Roll back** → `put-back.test.ts`' first test: v3 exists, v2 is put back with the newest `accepted_at`, and
    `nextVersion` over the rows still answers 4 (red under a planted put-back that renumbers the row).
  - Another site's row (no Roll back), the Live row (no action), order and shape, the confirm's focus, Cancel and Esc,
    "Rolling back…", Re-activate's "Activating…", Ghost's refusal and `busy` under the row, the dropped settings → journeys 7.23a
    (a)–(f) and `retention.test.ts`.
  - **Gone** → journey (g): v4 pruned while its confirm is open (`rollback-gone`): the confirm closes, the re-read drops v4,
    `said.gone(4)` is said once in the drawer's region and focus is on ✕ (red with `gone` treated as a refusal).
  - **Reading along** → journey (h): `x-inflozo-harness-lock: reader` (the control: `#editor-add-section` disabled), a Roll back
    confirmed and a Re-activate pressed there, each outcome said (red with the editor refusing a put-back while not holding);
    and the act branch's source test (no lock, no plan). Walk step 121g repeats it on production once it runs.
  - **Any plan** → the act branch's source test (no plan read); walk step 121 runs on a Free account.
  - **Request fails** → journey (i): the put-back's request dropped by the network (`route.abort`): v4 unchanged, `actFailed(4)`
    under it, focus back on its Roll back, nothing in the drawer's region (red with the drawer's `catch` removed); a 5xx's
    reading is `actOutcomeOf`'s rows.
  - **Lock lost mid-request** → journey (j): the put-back held (`page.route`), another session takes the lock through DW-241's lock
    route and `took-over` broadcast, the bar goes up, and the confirm and the drawer stay open; released, the outcome is said and
    focus is on ✕ (red with `data-unstoppable` removed from either dialog); and `busy.test.ts`' static read.
  - **Dropped settings** → journey (f). **Nothing live on the site** → journey (k): `uploaded`'s v2 confirm reads "Your live site
    switches to v2 instantly." alone (red with a live version invented for it).
  - **A confirm closed and opened again at once** (found by the ×3 run below, not a matrix row) → journey (b)'s last block: Cancel
    then an immediate second press, five times, opens the confirm each time. The dialog's `close` event is queued, so the second
    press could land while `asking` still held the same row and React rendered nothing; the drawer now counts its openings
    (`opens`) and a late `close` event for a confirm already open again does nothing. Red 3 of 3 with those lines reverted.
  - **Disconnected** → journey (l): `disconnected` answers the 409, and "Reconnect harness.example in Sites to roll back." is said
    under v4 with focus back on its Roll back (red with the sentence's branch removed).
  - DW-400 → `retention.test.ts`; the baseline after a Roll back → `deploy-run.test.ts`; the Changed line's four →
    `retention.test.ts`; order and shape → `retention.test.ts` and journey (a).
- **Written, the main session's to run on the owner's in-session go:** walk step 121 (production + T1, `T1_WRITES=1`, from a
  clean worktree at the deployed sha — it has never run; iterate it as a cut of steps 1–5 + 121) and `STEP121_PLANT=<address>`
  for Deploy. Its T1 writes: three ships, the put-backs' re-uploads and activations, one refused upload, one Re-activate and a
  staff-token activation of T1's own theme, then the `finally`'s activation and deletes.

**Executed — Review (2026-11-25, Node 24; every key read inside the script from `tools/probe/.env` by its variable name, never on
argv, no value printed; the owner's in-session go to walk step 121's whole run, "1. Go", and to 121e2's four added T1 writes,
"1. Go"):**
- **CI on the Dev head `1e706298`** (`GITHUB_TOKEN`): run 45616356749 — `rls` success, `check` **failure** at "Run pnpm keyboard"
  (355 passed, 1 failed: `journey.spec.mjs:2382`, "choosing a Layers row scrolls the canvas…", 111 received for 24), `deploy`
  **skipped**; the Render matrix (45616356751) success. Every 7.23a line in that log passed. Nothing of the Dev phase reached
  production, which still served the Schema push (`dpl_8f4iMHA7BRB1bDx2Nsii4RG5AfhY`, 43392c29). Re-run cold here, `-g "choosing a
  Layers row scrolls the canvas" --repeat-each 5`: 5 of 5 passed — intermittent, nothing this story touches (DW-402).
- **The Real-infra verifier, read-only** (`SUPABASE_DB_POOLER_URL` in a `read only` transaction, `SUPABASE_URL` +
  `SUPABASE_SECRET_KEY`, `GHOST6_STAFF_ACCESS_TOKEN`, `GITHUB_TOKEN`, `VERCEL_*`): production's schema is at least as new as the
  code (R-99) — `deploys.accepted_at` `timestamptz`, nullable, no default, its comment word for word; the backfill 5 `live` + 14
  `uploaded` all equal to `coalesce(activated_at, created_at)`, 2 `checking` null; `authenticated` SELECT true, INSERT/UPDATE false
  (a real UPDATE and INSERT in a rolled-back transaction: **42501**; the SELECT allowed, the control), `service_role` all true;
  every column, enum value, foreign key and function the new code names present in the catalogue and in PostgREST's schema cache
  (six GETs 200, the misspelt control 400/42703); T1 on `casper`, no probe or inflozo theme left by §91's run (a forged key 401,
  the control).
- **The main session's gates on the patched tree:** `pnpm check` exit 0, every package 0 failing (each printing its own count).
  The implementation pass's runs, each new assertion seen red under a planted reversion and restored (byte for byte by sha256):
  `run-keyboard-gate.sh -g "7\.23a" --repeat-each 2` and `-g "7\.22 ·"` green, the no-pointer sentinel green, `node --check` on the
  walk and on its cut (steps 1–5 + 121).
- **`pnpm keyboard`, the whole gate, on the final tree:** 356 passed, 0 failed — the 7.23a journeys (a)–(l), the floor, 7.22's
  journeys, the Layers-row reveal (DW-402's) and the no-pointer sentinel among them.
- **CI on the Review push `35dd0275`** (`GITHUB_TOKEN`): run 45637908026 — `check` (the whole keyboard gate among it), `rls` and
  `deploy` success; the Render matrix (45637907949) success. **Vercel** (`VERCEL_TOKEN`): `dpl_BRYtVpKpfGHVXA7C549ZPmwAyKhB` READY on
  production, built from 35dd0275 — the first deployment carrying 7.23a's code.
- **R-99's window, read-only** (`SUPABASE_DB_POOLER_URL`, a `read only` transaction, once the deployment was READY): `uploaded` 14 and
  `live` 5 rows, **0** with a null `accepted_at` — no customer shipped while production ran the Schema push's code, so no backfill
  was owed; the control, `accepted_at` set on a row of any other status: 0.
- **Walk step 121, production + T1** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_POOLER_URL`, `VERCEL_TOKEN`,
  `VERCEL_TEAM_ID`, and the step's own `GHOST6_*` read in-process), a cut of steps 1–5 + 121 run from a detached worktree at the
  deployed 35dd0275 (`tools/probe/.env` linked in, never copied), each run's first line naming the READY deployment:
  - **Run 1: 2 FAIL, 68 PASS** — both 121e's checks, each the WALK's own expectation written at Dev and never run: it wanted the
    drawer as v3 v2 v1 and v2 as the undo, but after (c)'s Roll back to v1 and (d)'s undo the newest ACCEPTED order is v3, v1, v2
    and the undo is v1, the version live before — the product right, by DW-400's own rule. The check now derives the order from
    the rows' `accepted_at` and names the next row; the app untouched. Every other check passed, the finally included.
  - **Run 2: 1 FAIL, 44 PASS** — stopped in 121a ("ship 3 ended awaiting_ship"), before anything 7.23a draws. Classified by
    Vercel's request rows: the third Pre-flight's POST answered 202 at 15:23:25 and its reads followed, then NO Ship it POST ever
    arrived while the page's lock beats kept arriving every 15 s — the press never left the browser (the walk's harness-hold
    class, DW-204's), on a path run 1 had passed three times on the same deployment. Its finally put T1 back and counted back.
  - **Run 3: 0 FAIL, 70 PASS**, the corrected 121e included: (a) three ships "Version 1–3"; (b) the drawer, three expanded rows,
    Changed lines, the undo emphasised; (c) the planted `walk121_probe` dropped by v2 and v1 through the REAL route, the keyboard
    Roll back to v1 — the confirm on Cancel, stopping at "stays in history." over Pre-flight's block "Walk121 probe" — T1's
    download at ZERO differences from v1's `content_manifest`, v1's own row live with the newest `accepted_at` (3 rows → 3), the
    prune's REAL `retention-io.ts` select pruning v2 never v1 (the control without `accepted_at` prunes v1), the next Run checks
    D3c "Nothing changed on your site since v1", the plant restored; (d) the undo; (e) D2d as v3 v1 v2 and Re-activate with
    `accepted_at` unchanged, v1 the new undo; **(e2) `inflozo-rollback-test` deleted on T1 (204), Re-activate on v3: Ghost's
    not-found refusal, the stored zip up again, v3 live with a NEWER `accepted_at`, zero differences, "Version 3"**; (f) the planted
    fatal zip proved blocked locally, Ghost's 422 said under v1 with its words and nothing changed, the real zip the control; (g)
    a Roll back from a second session reading along; (h) `busy` 409, `elsewhere` 409 with its control, **another account's POST
    404 with T1 untouched**, and L's own POST 200 (the control); finally T1 `casper*` with `racer` and `source`, every
    `inflozo-` theme deleted, `routes.yaml` 130 → 130 bytes, L's objects 0, T1 disconnected, users 24 → 24, projects 17 → 17; zero
    CSP violations.
  - Three runs, the owner's limit. The walk's 121e fix is in this commit; the cut used was built from it, with the app modules the
    deployed ones.
- **Not hit in Review:** Resend and Dodo (a put-back sends no email and reads no plan). `STEP121_PLANT` is Deploy's.

**Executed — Review, R-291 (2026-11-25, Node 24; local only until the deploy below):**
- **Each new assertion seen red under a planted reversion**, then restored byte for byte (sha256): the check reading Ghost before
  its refusals (6 red), with no manifest (1), its copy at Ship it's key (2) or not kept (1), the decline unapplied (1), labels by
  current names (1), the size limit doubled (2), a 400 not read as `missing` (2, both checks), the route refusing `check` (1), a plan
  read in it (1), `history/live` signing Ship it's copy (1) or an unvalidated `?theme=` (1), the io's baseline by `created_at` (1)
  or its read with the Admin key (1), `driftStep` reading on its own (1); in the journeys, no check sent (16 of 21), the Roll back
  not waiting (1), the region not `role="status"` (1), the foot missing (1), a `kept: false` copy still offered (1), "Shipping
  anyway." appended (1) and a late answer drawn into a reopened confirm (1).
- **`pnpm check`:** exit 0, every package 0 failing. **`pnpm keyboard`, the whole gate:** 361 passed, 1 failed — Story 5.23a's "every
  whole-page change repaints the whole page" timing out at "a subject", which this change does not touch; re-run cold, `-g "every
  whole-page change repaints the whole page" --repeat-each 5`: 5 of 5 — its second sighting (CI at Story 7.22's Deploy), now DW-403.
- **The walk's hand edit** uploads with the Admin API key, as step 119's does on T1 (executed at Story 7.21); a staff-token upload
  was never executed, so it is not the one relied on.
- **CI on `650c8899`** (`GITHUB_TOKEN`): run 45657380696 — `check` (the whole keyboard gate), `rls` and `deploy` success; the Render
  matrix (45657380809) success. **Vercel:** `dpl_Ggf9cXuGVwJaNqkBR4ymy39wTJNW` READY on production, built from 650c8899.
- **Walk step 121 with the check, production + T1** (the owner's in-session go to the re-test, "1. Go", at most three runs; the same
  keys by name, a cut of steps 1–5 + 121 from a detached worktree at 650c8899):
  - **Run 1: 1 FAIL, 44 PASS** — stopped in 121a, "ship 2 ended awaiting_ship", before anything 7.23a draws: Vercel's rows show the
    Pre-flight's POST 202 at 17:17:31 and its reads, then no Ship it POST while the lock beats kept arriving — the second such stop
    (DW-404). Its finally restored T1 and counted back.
  - **Run 2: 0 FAIL, 76 PASS.** Its debug copy (never committed) would have recorded and re-pressed a silent Ship it; it met none,
    so every press here was the walk's own. Beside run 3 of the first set's checks, each passing again: **121c, R-291 real on T1** —
    the confirm's status region said "Comparing with your live theme…" with its Roll back waiting, then D3c "Nothing changed on your
    site since v3", focus on Cancel; **121e** — Re-activate ran no confirm and no check; **121i** — a hand edit uploaded on T1 (the
    Admin API key; `home.hbs` with a Handlebars comment, live at once, "Version 3" unchanged, T1 differing from v3 by exactly that
    file), then Roll back v2: the check FOUND it — D3a's block, "1 file differs", Changed "Home" over `home.hbs`, the foot "Rolling
    back replaces it with v2's. Take a copy…" and Download; the Download on L's session a 303 to a signed URL serving
    `inflozo-rollback-test-live.zip`, its manifest equal to T1's live one, the hand edit in it, kept under `-history.zip`, never
    Ship it's key; the Roll back still went — v2 at zero differences, "Version 2"; the control, the next Roll back to v3 checking
    clean "since v2" and going. Finally: T1 `casper*`, every `inflozo-` theme deleted, `routes.yaml` 130 → 130 bytes, objects 0,
    T1 disconnected, users 24 → 24, projects 17 → 17.
  - The committed walk now RECORDS a Ship it press that sends nothing within 20 s (the button, the refusal caption, a screenshot)
    and never presses again (DW-404).

**Executed — Deploy (2026-11-25, Node 24; keys by their variable names, read in-process, no value printed; the production and T1
writes on the owner's in-session go, "1. Go", run in the main session):**
- **Deployment: `dpl_CP7B8vxvzRzWPfSdxvxRpJeT3mPY`** (`inflozo-jwgrkebk3-umangkagathara.vercel.app`), READY, target production,
  built from `dc59385e` (the Review's last commit), aliased to `app.inflozo.com`, `inflozo.com` and `www.inflozo.com` (`VERCEL_TOKEN`,
  `VERCEL_TEAM_ID`, `VERCEL_PROJECT`, `v6/deployments` and `v13/deployments/{id}`); `https://app.inflozo.com/sign-in` and
  `https://inflozo.com/` answer 200. `git diff --stat 650c8899 dc59385e -- apps packages supabase` is empty, so this is the app
  code walk step 121 ran 0 FAIL 76 PASS on at Review.
- **CI on `dc59385e`** (`GITHUB_TOKEN`, read only): run 45665349342 — `check` (the whole keyboard gate among it), `rls` and `deploy`
  success; the Render matrix (45665349513) success.
- **Schema:** applied on production at Dev (the Schema push, R-99) and read back at Dev and at Review; nothing since.
  **`bash supabase/tests/run-rls-gate.sh`: exit 0**, with "PASS (7.23a): deploys.accepted_at is a nullable timestamptz with no
  default, commented and client-unwritable".
- **Before the plant, read only:** T1's themes with `GHOST6_STAFF_ACCESS_TOKEN` (`GET themes/`, 200): `casper*`, `racer`, `source`,
  no `inflozo-` theme; `umngkmr+rollback723a@gmail.com` not among production's 22 users (`SUPABASE_SECRET_KEY`); Story 7.22's
  **Pro history test** (`5b9724e4-…`, owner step 10) still there, its ghost6 site connected.
- **The owner's test plant** — walk step 121's `STEP121_PLANT=umngkmr+rollback723a@gmail.com` with `T1_WRITES=1`, as a cut copy
  (steps 1–5, then 121, then the walk's `finally`) from a clean detached worktree at the deployed `dc59385e` (`tools/probe/.env`
  linked in, never copied), the launcher reading `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_POOLER_URL`, `VERCEL_TOKEN`
  and `VERCEL_TEAM_ID` in-process and the step its own `GHOST6_URL`, `GHOST6_ADMIN_API_KEY`, `GHOST6_CONTENT_API_KEY` and
  `GHOST6_STAFF_ACCESS_TOKEN`. **First run: 0 FAIL, 44 PASS** (one `stall` note in step 5, a 30 s page load retried once):
  - T1 connected through the wizard; **Rollback test** (`31885d91-cea5-4043-b0b2-30ae4545d93f`) shipped three times, T1's Home
    reading "Version 1", "Version 2", "Version 3" after each, every version 0 errors and 1 warning (`page_switch_unused`);
  - then `casper` activated with the staff token (200), v3's row written `uploaded`, v1's stored zip swapped for the planted one
    (removed 200, stored 200, read back equal) after the pinned gscan 6.4.2 proved it blocked locally (`GS005-TPL-ERR` fatal,
    `GS120-NO-UNKNOWN-GLOBALS`; v1 itself 0 errors), and v3's files with the invisible hand edit to `home.hbs` uploaded under
    `inflozo-rollback-test` with the Admin API key: 200, **not active**, T1's download differing from v3 by `home.hbs` alone;
  - the history route on the account's own session listing `v3:reactivate v2:rollback v1:rollback`, nothing live; zero CSP
    violations; the throwaway A and B deleted, users 22 → 23 and projects 15 → 16 (one each kept by the plant).
  - The walk's check label and helper comment said the hand edit went up "with the staff token"; the code uses the Admin API key
    (as the Review recorded), so both now say so. Wording only.
- **Read back afterwards, GET only** (`GHOST6_STAFF_ACCESS_TOKEN`, `SUPABASE_SECRET_KEY`): T1's themes `casper*`, `racer`, `source`,
  `inflozo-rollback-test`, and its Home carrying no A4 #13 headline (Casper); the account on `free`, Rollback test linked to a
  connected site; deploys 1.0.0 `uploaded` (activated), 2.0.0 `uploaded` (activated), 3.0.0 `uploaded` (never activated), each
  with its zip and an `accepted_at`; the last job `done`.
- **The Owner's manual test** carries the address and the project's URL in every step. `owner_test` stays `pending`. Afterwards T1
  goes back to Casper (and `inflozo-rollback-test` is deleted) on his go.
- **Not hit in Deploy:** Resend and Dodo (a put-back sends no email and reads no plan).
