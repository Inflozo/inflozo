---
title: 'Story 7.23 — Deploy history, rollback and restore-to-original (planned as 7.23a: Roll back and Re-activate from History)'
type: 'feature'
created: '2026-11-25'
status: 'ready-for-dev'
baseline_commit: 'e3ea8624b9bf53b9d06b4aff50aec7ad648c2781'
owner_test: pending
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

**Dev gate:** Question 1 below must be ruled before Dev. This spec plans its recommended option (the story split in three);
a different ruling moves the restore and the phone card back into this spec at the Record, before Dev.

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

**Moved by Question 1, if ruled as recommended (R-195; each pasted word for word into its story's card at the Record):**
- to a new **Story 7.23b, Restore original** — the original-theme row (D2a `:58-73`), R-281's restore paragraph, R-284,
  DW-389, both DW-391 paragraphs, and the Verification's "a real snapshot restored on T1";
- to a new **Story 7.23c, the phone's Deploy history card** (D4f) — the Small Screen Notice paragraph.

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
- [ ] `supabase/migrations/<Dev's date>120000_deploys_accepted_at.sql` -- create it:
  - `add column if not exists accepted_at timestamptz`;
  - backfill `coalesce(activated_at, created_at)` on `uploaded`/`live` rows;
  - `comment on column`, naming DW-400 and R-287.

  The column is not client-writable (AD-8).
- [ ] Architecture `SCHEMA.sql` -- the same, in place. Then `RLS-TEST.sql`, copied byte for byte to `supabase/tests/rls.sql`:
  - the protected list gains `accepted_at`;
  - one assertion that the column exists.

*Server:*
- [ ] `apps/web/lib/retention.ts` -- add the following, every word from `HISTORY_WORDS`:
  - `newestFirst` by `accepted_at` (`created_at` as the tie-break);
  - `actionOf`, the emphasised row (the one right after the site's Live row);
  - `changedLine`;
  - `HistoryAnswer`/`HistoryRow` gain `acceptedAt`, `changed`, `drops`, `action`, `emphasis`;
  - `timeLabel(acceptedAt)`;
  - the new words: tooltip, the menu caption, Roll back and Rolling back…, the confirm's title and its two bodies, the D2d
    chip "Uploaded, not live", Re-activate, the outcomes, the refusal, `elsewhere`/`live`/`disconnected`/`busy`, and the "and
    {k} more" and "No changes since" forms.
- [ ] `apps/web/lib/preflight.ts` -- extract `droppedKeys(previous, now)` and use it in the dropped row.
- [ ] `apps/web/server/deploy/put-back.ts` (new) -- `putBack(io, { userId, projectId, deployId, now })` as Always states. It
  returns `live | uploaded | gone | elsewhere | live-already | disconnected | busy | { refused: DeployError }`. Its io is
  `deploy-io.ts`' own, plus four reads:
  - the row;
  - the site's newest accepted row;
  - the linked site with its `disconnected_at`;
  - fresh moving jobs.

  It joins `server-wiring.test.ts`' lists.
- [ ] `apps/web/server/deploy/run.ts`, `deploy-io.ts`:
  - `accepted_at` is written with `uploaded` (`:667`) and with `goLive`'s live write when the upload was accepted (`:666`);
  - `baseline` orders by `accepted_at`;
  - `DEPLOY_COLUMNS` gains it;
  - export `callTwice` and `activateStep`'s answer handling, or the minimal shared helper, so the put-back sends exactly what
    Ship it sends.
- [ ] `apps/web/server/retention-io.ts` and `api/cron/prune-artifacts/route.ts` -- version reads select and order by
  `accepted_at`.
- [ ] `history/route.ts`:
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
- [ ] `apps/web/components/editor/deploy-history.tsx`:
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
- [ ] Kit `button.tsx` -- add the quiet Roll back variant (`D2:98`) if no existing variant matches, recorded on the Kit page.
- [ ] `editor.tsx`:
  - the clock's `title` becomes the tooltip; its label stays "History";
  - `actHistory` posts the act, and the harness gets its seam `historyAct`.

  `deploy-wizard.tsx`: the ▾ row's caption becomes S4d's.
- [ ] Harness `layout.tsx`/`actions.ts` -- the `x-inflozo-harness-history` header gains these values:
  - `rollback`: v3 live, v2, v1 with Changed lines; v1 drops a setting;
  - `uploaded`: D2d's v3, then v2 and v1;
  - `refused`;
  - `elsewhere`;
  - `busy`.

  `harnessAct` answers by header. A seam for the rows' new fields.

*Tests* (each assertion seen red under a planted reversion):
- [ ] `apps/web/retention.test.ts`, `put-back.test.ts` (new, at `apps/web/`'s root), `deploy-run.test.ts`, `drift.test.ts`,
  `deploy.test.ts`, `busy.test.ts`, `server-wiring.test.ts` -- every row of the I/O matrix. A source test proves the put-back
  module and the route's act branch name no `holdsLock`, `resolveEntitlement` or gscan gate.
- [ ] `tools/keyboard/journey.spec.mjs` -- the 7.23 journeys:
  - (a) the expanded and compact rows, the tooltip, the caption;
  - (b) Enter on Roll back opens the confirm, focus on Cancel; Esc returns focus to that Roll back;
  - (c) Roll back confirmed: "Rolling back…", said once, focus on ✕;
  - (d) Re-activate on D2d's row;
  - (e) refused, `elsewhere` (no Roll back), `busy`;
  - (f) the dropped-settings block.

  `floor.spec.mjs`: the expanded rows and the confirm at 1440, 1280 and 820, with no sideways scroll.
- [ ] `tools/probe/run-verify-editor.cjs` step 121 -- the Verification's real-infra run, with a `STEP121_PLANT` mode for
  Deploy.

*Propagation* (standing rules 3 and 7; end with a grep over `apps/web` for `order('created_at'` on `deploys` version reads):
- [ ] Planning documents:
  - FR-J9: a dated note;
  - EXPERIENCE F8: the order, the rows, R-189's by-line, another site's rows, the dropped-settings line;
  - AD-19's note and Story 7.25's card: the put-back takes the per-site lock when it lands;
  - Story 7.32's card: D2d's row is built by 7.23;
  - MEASUREMENTS: a new § for the rollback executed on T1;
  - VERIFY-AT-BUILD 10's rollback half.
- [ ] `deferred-work.md` -- resolve DW-400.

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

## Spec Change Log

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

**Ruled:** _(awaiting the owner)_

## Owner's manual test

**Before you start:** Deploy plants a Free test account on your go and fills in the address and links below. The account is
connected to T1 (`ghost6.inflozo.com`), and its project **Rollback test** holds three versions:
- **v1** and **v2** were shipped live, and each version's home page headline names its number ("Version 1", "Version 2").
- T1 was then put back on Casper, as you would do in Ghost Admin.
- **v3** was shipped with **Deploy only**, so it is on T1 but not live. v3's headline is "Version 3".
- v1's stored zip was swapped for one Ghost refuses, so that step 7 can show the refusal.

Sign in at `https://app.inflozo.com/sign-in` with `{address filled at Deploy}` and open the link that arrives. Use a desktop
browser at least **1366 px** wide. Keep a second tab on `https://ghost6.inflozo.com`.

1. **URL:** `https://app.inflozo.com/projects/{id filled at Deploy}`. **Screen:** the editor. **Do:** rest the pointer on the
   clock icon just left of **Ship it**, then press it. **Type:** nothing. **See:**
   - the tooltip reads "History — every version, one click back";
   - a panel titled **HISTORY — ROLLBACK TEST** opens, and nothing in it names a person.
   - **v3** at the top has a blue **Uploaded, not live** chip, the line "Your theme is on your site but isn't live yet." and
     a red **Re-activate** button.
   - **v2** and **v1** each show a small picture, a "Changed:" line (v1 says "First deploy"), a yellow **0 · 1** chip, a time,
     a **Roll back** button and a pin.
   - Nothing shows a green **Live** dot.
2. **URL:** `https://ghost6.inflozo.com`. **Screen:** your test site. **Do:** reload it. **See:** Casper.
3. **URL:** the same editor. **Do:** press **Re-activate** on v3. **See:** the button says "Activating…", then v3 shows the
   green **Live** dot, and v2's Roll back becomes the outlined red one. Reload ghost6.inflozo.com: the headline reads
   "Version 3".
4. **URL:** the same editor. **Do:** press **Roll back** on v2. **See:** a box "**Roll back to v2?**" with "Your live site
   switches to v2 instantly. v3 stays in history — nothing is lost.", v2's chip, time and **0 · 1**, and **Cancel** already
   highlighted. **Do:** press **Enter**. **See:** the box closes and nothing changed.
5. **URL:** the same editor. **Do:** press **Roll back** on v2 again, then the box's **Roll back**. **See:** "Rolling back…",
   then the panel lists **v2** (Live) first and **v3** second with the outlined Roll back. Reload ghost6.inflozo.com: the
   headline reads "Version 2".
6. **URL:** the same editor. **Do:** press **Roll back** on v3 and confirm. **See:** v3 is Live again and first; ghost6.inflozo.com
   says "Version 3".
7. **URL:** the same editor. **Do:** press **Roll back** on v1 and confirm. **See:** under v1, a line saying Ghost's own theme
   check refused v1, followed by Ghost's message in small grey type. v3 stays Live, and ghost6.inflozo.com still says
   "Version 3".
8. **URL:** the same editor. **Do:** close the panel, open the small ▾ on **Ship it**. **See:** the **History** row's second
   line reads "Versions, gscan reports, rollback".
9. **URL:** the same editor, **keyboard only.** **Do:**
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

## Verification

**Commands:**
- `pnpm check` -- expected: green. This is lint, typecheck and every package test, among them the retention, put-back,
  deploy-run, drift, deploy, busy and server-wiring tests. The run prints its own counts; never write one down.
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, with `accepted_at` protected and present.
- `python3 tools/doc-audit.py --check`, run twice -- expected: green.
- `pnpm keyboard` -- expected: journeys 7.23 (a)–(f), 7.22's unchanged, and the floor all green.
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
