---
title: 'Story 7.23b — Restore original (split from Story 7.23 by R-290)'
type: 'feature'
created: '2026-11-26'
status: 'in-review'
baseline_commit: '59dcf65c983ae848809b244898f3adb2e796c3a8'
owner_test: pending
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-23a-roll-back-and-re-activate-from-history.md']
---

## In plain English

After this story, the editor's **History** panel shows **Your original theme** at the top: the theme your Ghost site had before
Inflozo replaced it, with its name and version, the date Inflozo saved it, and a **Restore original** button. One press switches
your site back to that theme in seconds; your Inflozo versions stay in the list, and the one that was live shows **Re-activate**,
so going back to Inflozo is one press too. If Ghost refuses your old theme because it no longer passes Ghost's own checks, the
panel says so in Ghost's words, offers the theme as a download and links to Ghost's Design & branding settings — and every
Download button in the editor now says what went wrong beside the button instead of leaving the page.

Question 1 was ruled option 1 (R-292, owner, 2026-11-26): Restore original switches on the copy of your old theme Ghost already
has, and uploads Inflozo's saved copy only if Ghost no longer has it, so nothing is overwritten and there is no check. Nothing
waits on the owner before Dev but the in-session gos for the writes.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 7.20a saves each site's pre-Inflozo theme (`site_snapshots`), but nothing can put it back:
- FR-J13's safety net — "trying Inflozo never costs me the site I had" — has no button;
- the History drawer lacks D2a's original-theme row (R-290 moved it here);
- the only download of the saved theme, the Backup step's Theme Download, replaces the whole editor with a bare error page
  when Story 2.5's route answers anything but the zip — and D3a's and the Roll back confirm's "Download the live theme first"
  do the same (DW-391).

**Approach:**
- **D2a's original-theme row** sits above the versions, outside the count, for the project's linked site when that site has a
  snapshot. Its **Restore original** is one press with no confirm, as drawn.
- **How it puts the theme back (Question 1, ruled option 1 — R-292; see "What Question 1 decided" in Design Notes):** activate the
  theme by its name first (`PUT themes/{name}/activate/`). Only when Ghost no longer holds that name, upload the saved zip as
  `{name}.zip`, then activate it. Ghost's own Casper and Source are only ever activated (DW-389). Nothing on the site is
  overwritten, so no check runs.
- **The records.** The site's `live` deploys rows are demoted to `uploaded`. Inflozo's version therefore shows as 7.23a's D2d row,
  "Uploaded, not live", with **Re-activate** — the undo. No `deploys` row is written, so the drift baseline does not move.
- **Ghost refuses** (its 422): nothing changes, and the row says so with Ghost's detail, a **Download your original theme**
  button and Ghost's **Design & branding ↗** link (R-281's fallback).
- **One way to follow a signed download** (DW-391) serves all four Downloads: the Backup step's Theme Download, D3a's, the Roll
  back confirm's and this row's.

**Frame (R-74):**
- `D2 Deploy History Completed.dc.html`:
  - D2a `:58-73` is the original-theme row: the archive tile, "Your original theme", the mono name and version, "Archived {date}",
    the quiet line and Restore original. The rule after it is `:75`.
  - D2c `:240-252` is the same row on Free.
- No frame draws the restore's refusal. It is extrapolated from the nearest frames:
  - 7.23a's per-row `role="status"` refusal line, with Ghost's detail in mono;
  - D3a's secondary Download button;
  - B12b's linked "Design & branding ↗" (`SNAPSHOT_WORDS.placeLink`, `adminAt(url, 'design')`).

**The epic's criteria, word for word (R-195), and how this story meets each:**
- **Given** deploy history per project × site, on a site with a pre-Inflozo snapshot (Story 7.20a), **when** I open it, **then**
  the list carries **two rows that are not ordinary versions**: **the pre-Inflozo snapshot**, above the versions, outside the
  count, actioned as **restore original**; and an **`uploaded`-but-not-`activated` row**, shown **without an active badge** and
  actioned as **re-activate rather than as a recompile** *(Story 7.23a's, R-290)*.
  — The original row is this story's. D2d's row is 7.23a's, kept as built.
- **Rollback is exempt from the Pro exit gating** — restoring an artifact that already ran is always allowed, on any plan.
  — The restore reads no plan.
- **Rollback and snapshot restore redeploy stored artifacts, not the working document, so they never require the edit lock.**
  — The restore reads no lock and no working document.
- *(R-281)* Restoring is a one-click redeploy that skips *Inflozo's* gscan gate — but **Ghost validates every upload with its own
  gscan**, so an old fork can be rejected on the way back in; that case has a designed fallback too, offering the zip as a download
  and pointing at Settings → Design.
  — The refusal row described above.
- *(R-284)* "Restore original" puts back the site's one saved snapshot, which is **the theme Inflozo replaced most recently**.
  — `site_snapshots`' one row per site, as 7.20a keeps it. Question 1 decides whether Ghost's own copy of that theme or the
  saved copy goes back.
- *(DW-389)* Restoring a default theme as the original is an activation of Ghost's installed copy, never a re-upload of the
  snapshot.
- *(DW-391)* The snapshot's download is followed so that a failure of Story 2.5's route — a 404 when the row has gone, a 502 when
  signing fails, the sign-in redirect — is said where the button is and never replaces the page; one way for D2a's
  original-theme row and the Backup step's Theme Download (`deploy-wizard.tsx` `follow`).
- *(DW-391, extended)* The same way serves D3a's **Download the live theme first** (`#deploy-drift-download` →
  `projects/[id]/deploy/live`): its 404, 502 and sign-in redirect are said under the button, never in place of the editor.
  — The same way also serves 7.23a's confirm Download (`#history-drift-download` → `history/live`), which has the same shape.
- *(Story 7.21's Dev, under R-287)* A rollback or a restore that **uploads a stored artefact records that upload as the newest
  accepted one** — a `deploys` row with status `uploaded` or `live` carrying **the artefact's own `content_manifest`** — because
  Ghost replaces every file under the theme's name on that upload, and the next drift check compares the site with the newest
  upload Ghost accepted (`deploys.baseline`).
  — A restore never uploads under the frozen name the baseline describes, so it writes no row and the baseline holds (Design
  Notes).
- *(Story 7.22's Dev, moved by R-290)* **This story adds** the original-theme row. — Built here.
- The original-theme row matches D2a (R-290). — The first acceptance criterion.
- *(Story 7.23a's Review)* Whether Restore original runs FR-J16's drift check is this story's to ask the owner (R-83).
  — Question 1, ruled option 1 (R-292): no check, because a restore overwrites nothing.

## Boundaries & Constraints

**Always:**
- **The row.** It is drawn when the project's linked site has a `site_snapshots` row. It is one per site and never another site's,
  for 7.23a's reason: that site may be another project's now (R-267).
  - It sits above the version list, outside its `<ol>` (outside the count), followed by D2a's rule.
  - It is drawn also above "Nothing shipped yet". The limit line stays at the foot.
  - Its contents, every word from `HISTORY_WORDS`:
    - the archive tile;
    - "Your original theme";
    - the mono line: `{theme_name} {theme_version}`, or the name alone when the version is null;
    - "Archived {date}": `captured_at` as `timeLabel`'s date half ("Aug 2"; the year when not this year; "Archived today");
    - the frame's quiet line, verbatim;
    - Restore original.
- **Restore** (`restoreOriginal` in `server/deploy/put-back.ts`, over `PutBackIo` handed in). The steps, in order:
  1. The project's linked site (`io.linked`). Then the site's snapshot (`io.original`): its id must equal the asked id, else
     `gone`.
  2. Refuse with nothing sent to Ghost, in 7.23a's order: `disconnected`; `busy` (a fresh moving job on this project × site,
     `STALLED_MS`).
  3. **Activate first:** `sendActivate(io, { themeName: theme_name })` read by `activateAnswer`:
     - `ok` → live;
     - 429 or 5xx → `ghost_unavailable`;
     - Ghost's check (`ThemeValidationError`) → `ghost_theme_refused` with its detail;
     - `themeNotHeld` → step 4. For `casper` or `source` it is instead Ghost's words, and nothing is uploaded (DW-389).
  4. **Upload the saved zip:** the `site-snapshots` object (`snapshotObjectKey(storage_path)`) through `sendUpload` as
     `{theme_name}.zip`, read by `uploadAnswer`:
     - refused → said with its detail, never retried (VERIFY 10);
     - `active` → live;
     - otherwise `sendActivate` → live, or `uploaded` (on the site, not live).
- **The records, when it goes live:** `deploys.demote({ siteId, userId })` with no `except` — every `live` row on the site, any
  project of the user's, becomes `uploaded`; `activated`, `activated_at` and `accepted_at` are left untouched. Ghost refusing,
  or `uploaded`: nothing is written.
- **R-264 (a) reads the record truthfully.** "This project's theme is live on the site" is the site's latest activated deploy
  **that is still `live`**: `deploy-io.ts`' `liveProject` and `(editor)/read.ts:346` gain `status = 'live'`. So after a restore,
  Deploy only is offered again.
- **The outcomes, said once (UX-DR12), every word in `HISTORY_WORDS` (R-170):**
  - **Live:** "Your original theme is live on {host}." — then the list is read again and focus goes to ✕.
  - **Uploaded:** "Your original theme is on {host} but isn't live yet." — same handling.
  - **Gone:** the list is read again; then "Your saved original theme has changed since you opened History. Check it and try
    again." or, with none left, "Your original theme is no longer kept."; focus on ✕.
  - **Refusals, said under the row** in its `role="status"` line, with focus back on Restore original:
    - `disconnected`: "Reconnect {host} in Sites to restore your original theme.";
    - `busy`: 7.23a's `refused.busy`;
    - Ghost's other answers and ours: `deployError`'s message, or "Your original theme didn't go back on your site. Try again.";
    - after Ghost acted, a record write failing twice: "Your original theme reached {host}, but History couldn't record it. Try
      again."
  - **Ghost's check refused it:** under the row, "Ghost's own theme check refused your original theme, so nothing on your site
    changed." Then Ghost's detail in mono. Then **Download your original theme** (secondary, Download icon, through DW-391's
    one way). Then "Download it to keep a copy, or to have it updated for this version of Ghost — then upload it in Ghost under
    **Design & branding ↗**" (new tab, the site's own Design panel).
- **R-98:** Restore original says "Restoring…" with `aria-busy` and `aria-disabled` while out. Every action and pin waits (7.23a's
  `acting`). The drawer carries `data-unstoppable`, and Esc, ✕ and the backdrop wait.
- **R-192:** Restore original stays live in a read-only editor, as the pin does — it changes no design.
- **The History GET** adds `original: { id, theme, version, capturedAt, siteUrl } | null`. It is read through the user's own
  session (RLS `site_snapshots_owner_read`) for the linked site.
- **`site_snapshots.theme_version`** (new, nullable) is written by `captureSnapshot` from the `version` it already reads. It is
  pushed first, as its own `Schema` (R-99).
- **DW-391 — one way to follow a signed download.**
  - The three routes:
    - `snapshots/[id]/download`;
    - `projects/[id]/deploy/live`;
    - `projects/[id]/history/live`.
  - When asked with `Accept: application/json`, each answers `200 { url }` (the same 60-second signed URL), or `401` when
    signed out. Otherwise it answers exactly as today: a 303, which the `/restore` page's plain links still follow.
  - One client function, `followSigned(href)`, fetches that answer and clicks a link to `url`. The signed URL is an attachment,
    so the page stays. It answers null, or one of three sentences in one list:
    - gone (404);
    - signed out (401, or a fetch redirected to `/sign-in`);
    - couldn't prepare it (anything else).
  - Each of the four Downloads stays an `<a href>`, its click intercepted. Its sentence goes under that button in a
    `role="status"` line. Its words say "Preparing…" while the fetch is out (R-98).

**Ask First:**
- **Every production write and every T1 write needs the owner's in-session go**, asked in R-83's shape, run in the main session
  and never by a subagent. Word each ask for the run's whole set of writes. That covers:
  - the migration's apply (`SUPABASE_DB_POOLER_URL`);
  - walk step 122;
  - Deploy's plant.
- Anything a restore sends to Ghost beyond activate and upload (AD-10's list) — `routes.yaml` included.

**Never:**
- Write, copy or delete a `deploys` row for a restore. Never touch `accepted_at` or `content_manifest`.
- Upload `casper.zip` or `source.zip`; Ghost refuses both (`storage.js:53-56`).
- Call `holdsLock`, `resolveEntitlement` or any plan read on the restore path, or run Inflozo's gscan gate.
- Retry Ghost's 422.
- Draw an original row for another site, or a Live badge on the original row: no record says it is live, and the outcome sentence
  says it once.
- Build what belongs to other stories:
  - 7.23c: the phone card;
  - 7.25: the per-site lock — the restore joins it when it lands, beside the put-back;
  - 7.26: a version's zip download;
  - 7.20b: the orphan purge.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Restore, Ghost holds it | v2 live; the snapshot is `casper` (or any theme Ghost still holds) | `PUT themes/{name}/activate/` only; live; the site's live rows demoted (v2 `uploaded`, `activated`/`accepted_at` untouched); "Your original theme is live on {host}."; re-read: the original row, then v2 as D2d's row with Re-activate | N/A |
| Ghost no longer holds it | non-default name, deleted in Ghost Admin (activation → `themeNotHeld`) | the saved zip uploaded as `{name}.zip` → `active` false → `PUT activate` → live, as above | activation refused after the upload → `uploaded`: "…on {host} but isn't live yet."; nothing written |
| Default theme | snapshot `casper`/`source` | activation only — never an upload | `themeNotHeld` (never seen: Ghost never deletes them, `storage.js:167-170`) → Ghost's words, no upload |
| Ghost's check refuses | 422 `ThemeValidationError` on the activation or the upload | nothing changes; under the row: the refusal, Ghost's detail in mono, Download your original theme, Design & branding ↗ | logged by code; never retried |
| Other Ghost failures | 401, 429/5xx, unreachable | `deployError(code).message` under the row; nothing written | logged by code |
| The undo | after a restore, Re-activate on v2 (7.23a) | v2 live; Ghost's copy of Inflozo's theme untouched by the restore | N/A |
| The original already live | switched back by hand in Ghost Admin | activation answers live; any stale live row demoted; said | N/A |
| Disconnected | linked site disconnected | row drawn | 409 `disconnected` → its sentence under the row |
| A ship under way | fresh `snapshotting`/`uploading`/`activating` job | nothing sent | 409 `busy` → 7.23a's sentence |
| Gone | snapshot replaced (a later Theme Download) or purged since the read, or not the linked site's | — | 404 → re-read; "changed" or "no longer kept"; focus ✕ |
| No row | no linked site, or no snapshot | no original row | N/A |
| Nothing shipped | a snapshot, no versions | the row above "Nothing shipped yet" and the limit line | N/A |
| Reading along, any plan | another session holds the lock; Free or lapsed | Restore works | N/A |
| Baseline after a restore | restore, Re-activate v2, Run checks | D3c "Nothing changed on your site since v2" — no row written, baseline unchanged | N/A |
| Deploy only after a restore | restore, then Ship it ▾ | Deploy only offered (no `live` row of this project on the site, R-264 (a)) | N/A |
| Version unknown | a snapshot captured before the column | mono line is the name alone | N/A |
| Request fails | network | row unchanged; "didn't go back… Try again." | logged |
| Unrecorded | Ghost acted, then the demote fails twice | "Your original theme reached {host}, but History couldn't record it. Try again." | logged |
| DW-391 served | any of the four Downloads; the route signs | the zip downloads; the page stays | N/A |
| DW-391 failed | 404 / 401 or `/sign-in` / 502 or network | that sentence under that button; the page stays | logged by status |

</frozen-after-approval>

## Code Map

- `supabase/migrations/20261125120100_deploys_accepted_at.sql` -- the latest migration; the pattern to follow: header, `add column
  if not exists`, `comment on column`, `notify pgrst`.
- Architecture `SCHEMA.sql` `site_snapshots` `:222-245` -- edited in place (`theme_version` after `theme_name`'s comment, LAST
  by `add column`'s order — 7.20b's note). `RLS-TEST.sql` 7.20a's snapshot block `:3327-3450`, copied byte for byte to
  `supabase/tests/rls.sql`.
- `apps/web/server/snapshot.ts`:
  - `SnapshotIo.upsert` `:54`;
  - `version` `:124`;
  - the upsert `:163`.

  `server/snapshot-io.ts` upsert `:43-47`.
- `apps/web/server/deploy/put-back.ts`:
  - `PutBackIo` `:54-70`;
  - `admit` `:90-104` (the refusal order to mirror);
  - `putBack` `:131-200`, with its `ghostSaid`, `acted` and the Re-activate fall-through `:159-175` — the restore's shape;
  - `ROUTE` `:83`.

  `put-back-io.ts`: `linked` `:50-57`, `moving` `:58-61`, `demote` `:66-68`, `call` `:79`. `deploy-io.ts` `demote` `:90-92`
  (held equal to put-back-io's by `put-back.test.ts:502-520`) and `liveProject` `:93-96`.
- `apps/web/server/deploy/run.ts` `sendUpload`/`sendActivate`/`twice`/`STALLED_MS` (exported by 7.23a);
  `uploadOnlyRefused` `:803-808`.
- `apps/web/lib/deploy.ts`:
  - `uploadAnswer` `:195-211`, `activateAnswer`, `themeNotHeld`, `deployError`;
  - `SNAPSHOT_WORDS.placeLink` `:493`;
  - `ShipState.liveHere` `:785-787`, `uploadOnlyBlock` `:903-908`.
- `apps/web/app/(app)/app/(authed)/account/deletion-rule.ts` -- `SNAPSHOT_BUCKET` `:91`, `snapshotObjectKey` `:92`.
- `apps/web/lib/paywall.ts` `adminAt(url, 'design')` `:125` -- the Design panel link.
- `apps/web/lib/backup-gate.ts` `snapshotDownloadPath` `:75`.
- `apps/web/lib/retention.ts`:
  - `HistoryAnswer` `:116-142`;
  - `timeLabel` `:283-298`;
  - `HISTORY_WORDS` `:301-385`, with `said` `:335-345` and `refused` `:372-377`;
  - `actOutcomeOf` `:401-412`, `actSaid` `:414-429` (the restore reads the same answers).
- `apps/web/app/(app)/app/(authed)/projects/[id]/history/route.ts`:
  - GET `:60-109`;
  - POST `:111-141` — the `deploy` uuid check `:125` comes after the new restore branch.

  `history/live/route.ts` `:35-66` and `deploy/live/route.ts` (the same shape); `app/(app)/app/snapshots/[id]/download/route.ts`
  `:39-87` (Story 2.5's; `/restore`'s links keep its 303).
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts:346` -- R-264's live read.
- `apps/web/components/editor/deploy-history.tsx`:
  - props `:87-100`;
  - `settle` `:196-228` (the endings and refusals pattern);
  - the per-row `status` line `:332-341`;
  - the list `:499-523`;
  - the confirm's Download `:600-603`;
  - `acting` `:113`.
- `apps/web/components/editor/deploy-wizard.tsx`:
  - `follow` `:121-127` (replaced);
  - `fetchRow` `:814-830`;
  - D3a's Download `:1446`;
  - B12b's linked place line `:1968` (the link's pattern).
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:
  - harness seams `:575-587`;
  - the fetchers `:2598-2633`;
  - the mount `:7034-7041`.
- Kit:
  - `button.tsx`: `sizes` `:54-62` has no 28 — the frame's button is 28 high, radius 10, 12px, 600;
  - `icons.tsx` `Download` `:541` (there is no archive icon; the frame's svg is `D2:60`).
- Harness `app/(app)/app/harness/editor/layout.tsx` (the history header's doc `:167`) and `actions.ts` (`harnessHistory`
  `:160`, `harnessAct` `:201`, `harnessCheck` `:230`).
- Tests:
  - `tools/keyboard/journey.spec.mjs` 7.23a's block `:11262`–EOF;
  - `tools/keyboard/floor.spec.mjs` 7.23a `:1112`;
  - `tools/probe/run-verify-editor.cjs` step 121 `:14761` with `STEP121_PLANT` (the pattern); the last step is 121.
- **Ghost, read in source or executed:**
  - Ghost keeps the previous theme installed beside the active one (VERIFY 61, §15h, executed both majors);
  - an activation of a held name is live (§91 step 6);
  - a name Ghost does not hold answers `ValidationError` "not found in the theme directory" (`activate.js:46-54`; walk 121e2);
  - activation runs `checkSafe` (`activate.js:55-60`), so a theme failing today's check is refused at activation and at upload
    alike;
  - `setFromZip` refuses `casper.zip`/`source.zip` (`storage.js:53-56`), and `destroy` refuses to delete them (`:167-170`);
  - an upload under an inactive name answers `active` false (§91 step 1);
  - a fatal theme answers 422 and replaces nothing (§91 step 5).

## Tasks & Acceptance

**Dev gate:** Question 1 is ruled (option 1, R-292); Dev builds exactly that. Nothing else waits on the owner but the in-session
gos for the writes.

**Execution:**

*Schema — its own push, first (R-99):*
- [x] `supabase/migrations/<Dev's date>120000_site_snapshots_theme_version.sql` -- create it *(Dev: `20261126120000_site_snapshots_theme_version.sql`)*:
  - `add column if not exists theme_version text`;
  - a `comment on column`: the active theme's `package.json` version at capture, null before Story 7.23b or when the theme
    declares none; written by the capture alone; select-only to the client.

  No grant change (the table is in the client's read-only set) and no backfill (the version was never stored).
- [x] Architecture `SCHEMA.sql` -- the same, in place. Then `RLS-TEST.sql`, copied byte for byte to `supabase/tests/rls.sql`:
  one assertion that the column exists, and that `authenticated` cannot update it.

*Server:*
- [x] `apps/web/server/snapshot.ts`, `snapshot-io.ts` -- the upsert writes `theme_version: version`.
- [x] `apps/web/lib/retention.ts`:
  - `HistoryAnswer.original`;
  - `archivedLabel(at, now, tz?)`;
  - every word in Always, in `HISTORY_WORDS` — the frame's line verbatim, and "Restoring…";
  - `restoreSaid(outcome, host)` over `actOutcomeOf`'s outcomes.
- [x] `apps/web/server/deploy/put-back.ts` -- `restoreOriginal(io, { userId, projectId, snapshotId, now })`, exactly as Always
  states. It returns `live | uploaded | gone | disconnected | busy | { refused: DeployError }`. `PutBackIo` gains:
  - `original({ siteId, userId })` → `{ id, theme_name, storage_path } | null`;
  - `snapshots.get(key)`;
  - `deploys.demote`'s `except` becomes optional.

  The header comment names the restore, DW-389 and the baseline note.
- [x] `apps/web/server/deploy/put-back-io.ts`, `deploy-io.ts`:
  - `original`, with the service role and `user_id` plus `site_id` clauses;
  - `snapshots.get`, from `SNAPSHOT_BUCKET` by key;
  - `demote` with an optional `except`, the same in both files;
  - `liveProject` gains `.eq('status', 'live')`, with a comment naming R-264 (a) and the restore.
- [x] `(editor)/read.ts:346` -- the same `status = 'live'`. `lib/deploy.ts` `liveHere`'s comment says "still live".
- [x] `history/route.ts`:
  - GET adds `original`: the user's `site_snapshots` rows (RLS) with `sites(url)`, the linked site's picked.
  - POST `{ act: 'restore', snapshot }`, checked before `deploy`. It validates `snapshot` with `isUuid` and calls
    `restoreOriginal`. The answers are the act branch's own: 200 `{ outcome }`, 404, 409 `{ code }`, 422, 502.
  - Its header says the restore reads no plan, lock or gscan.
- [x] DW-391 -- one server helper answers a signed URL as `200 { url }` or a 303, and sign-in as `401` or a 303, by `Accept`.
  The three routes use it. A client `followSigned(href)` with its three words goes in one module.
  *(Dev: both in `apps/web/lib/signed-download.ts` — the helper answers with the platform's `Response`, so no `next/server` import and
  `node --test` reads it.)*

*UI:*
- [x] `apps/web/components/editor/deploy-history.tsx`:
  - the original row (D2a `:58-71` and the rule `:73`) above the list, outside its `<ol>`, with Restore original
    (`Button` secondary, 28);
  - its busy state, outcomes, refusals and the refusal's fallback, as Always says;
  - the confirm's Download (`#history-drift-download`) clicks through `followSigned`, its sentence under it.
  - New props: `restore`, `originalHref`.
- [x] Kit -- `button.tsx` size `28` (`h-7 px-[11px] text-[12px] rounded-thumb`). `icons.tsx` `Archive` from `D2:60`. Both are
  recorded on the Kit page.
- [x] `apps/web/components/editor/deploy-wizard.tsx`:
  - `follow` is replaced by `followSigned`; the Theme Download's failure is said under its row through the existing `fetched`;
  - D3a's Download (`#deploy-drift-download`) clicks through `followSigned`, its sentence under it.
- [x] `editor.tsx`:
  - `restoreHistory(snapshot)` POSTs `{ snapshot, act: 'restore' }`;
  - `originalHref(id)` is the `/app` prefix plus `snapshotDownloadPath`;
  - the harness seam is `historyRestore`.
- [x] Harness `layout.tsx`/`actions.ts`:
  - `x-inflozo-harness-history` gains `original` (casper with a version, v2 live, v1), `original-unversioned` and
    `original-empty` (a snapshot, no versions);
  - `harnessRestore` answers by `x-inflozo-harness-restore: live | refused | gone | disconnected | busy`, with no database and no
    Ghost.

*Tests* (each assertion seen red under a planted reversion):
- [x] `put-back.test.ts` -- every I/O row of the restore, including:
  - zero Ghost calls on each refusal;
  - never an upload of `casper.zip`;
  - no `deploys` insert and no `accepted_at` write;
  - a source test that the restore and the route's restore branch name no `holdsLock`, `resolveEntitlement` or gscan gate.

  Also `retention.test.ts` (`archivedLabel`, `restoreSaid`, the original passed through), `snapshot.test.ts` (the version
  written), `deploy-run.test.ts` and `read.test.ts` (a demoted row is not "live here"), `deploy.test.ts` (the three routes' JSON
  and 303 answers), `busy.test.ts` (Restoring…, Preparing…), `server-wiring.test.ts` (the snapshot bucket read on put-back-io's
  service-role reason), and a test for `followSigned` over a fake fetch.
- [x] `tools/keyboard/journey.spec.mjs` -- the 7.23b journeys:
  - (a) the row's anatomy, outside the list's count; the unversioned mono line; the row above "Nothing shipped yet";
  - (b) Enter on Restore original: "Restoring…", the drawer unstoppable, said once, focus on ✕, v2 drawn as D2d's row;
  - (c) refused: the note, the mono detail, the Download and the link (its `href` is `adminAt`'s, new tab);
  - (d) `gone`, `disconnected` and `busy`;
  - (e) DW-391: each of the four Downloads with `page.route` answering 404, 401 and 502 — the sentence under the button, the URL
    unchanged — and 200 `{ url }` firing a download.

  `floor.spec.mjs`: the drawer with the original row, and the refused row, at 1440, 1280 and 820, with no sideways scroll.
- [x] `tools/probe/run-verify-editor.cjs` step 122 -- the Verification's real-infra run, with a `STEP122_PLANT` mode for Deploy.
  *(Dev: written and syntax- and name-checked; never run — it writes to T1 and production, the main session's on the owner's go.)*

*Propagation* (standing rules 3 and 7; end with a grep for `follow(` and for the `liveHere`/`liveProject` reads):
- [x] Planning documents:
  - FR-J9 and FR-J13: dated notes (as built; Question 1's ruling);
  - EXPERIENCE F8's original row and F1's Restore row;
  - VERIFY-AT-BUILD 10's snapshot half, from walk 122 — a real customer theme still open, and Ghost 5's half to DW-326;
  - Story 7.25's card and AD-19's note: the restore joins the per-site lock beside the put-back.
- [x] `deferred-work.md` -- resolve DW-389 and DW-391.

### Review Findings

*Story 7.23b's Review (2026-11-26): five layers — Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier — then walk step 122 on production and T1 (Verification).*

- [x] [Review][Decision] After Restore original, Inflozo's `routes.yaml` stays on the site — Question 2 below (the owner's).
- [x] [Review][Patch] A later capture keeps the snapshot's id (the capture upserts on `site_id`), so the matrix's "Gone — snapshot
  replaced" could never fire and a stale drawer restored a theme it did not name: the restore now carries the row's `captured_at`
  and answers gone when it moved [`server/deploy/put-back.ts` `restoreOriginal`; `history/route.ts`; `editor.tsx`; `deploy-history.tsx`]
- [x] [Review][Patch] Deploy only stayed greyed after a restore until a reload (owner test step 4): closing History after a put-back
  or a restore that landed re-reads the page, as the wizard's close does [`editor.tsx` `historyLanded`]
- [x] [Review][Patch] After a restore the wizard still said v2 was what the site serves ("keep v2 active", "still serving v2", "live:
  v2", "v2 → v3"): `previous` and the ship state's `prev` count a version only while the latest activated deploy is still `live`
  [`deploy-io.ts` `previous`; `lib/deploy.ts` `shipStateOf`]
- [x] [Review][Patch] A saved zip gone from the store (purged, or replaced mid-capture) was a 502 "Try again" that can never work: it
  is gone [`put-back-io.ts` `snapshots.get`; `put-back.ts`]
- [x] [Review][Patch] A snapshot row with no name (the column is nullable) would be sent to Ghost as `null` and drawn as nothing: gone,
  and no row drawn [`put-back.ts`; `lib/retention.ts` `originalOf`]
- [x] [Review][Patch] Nothing checked which snapshot the editor sends: the harness answers gone for any other row, and the request's
  body is pinned by a source test [`harness/editor/actions.ts` `harnessRestore`; `deploy.test.ts`]
- [x] [Review][Patch] Journey 7.23b (a) would turn red on 2027-01-01 ("Archived Nov 2" gains its year); (c) hard-coded "(opens in a
  new tab)" instead of `DEPLOY_WORDS.newTab` [`tools/keyboard/journey.spec.mjs`]
- [x] [Review][Patch] Walk 122c read Deploy only only after a reload: now in the same page with History closed, then reloaded, and its
  caption "keep your current theme active"; 122i's direct POSTs carry `captured`; and 122b read the button's hidden busy word
  (`textContent`, found by run 1) — it reads `innerText` [`tools/probe/run-verify-editor.cjs`]
- [x] [Review][Patch] R-264 (a)'s old meaning in Story 7.18a's criterion (`epics.md`) and the epic context; the epic context's Held list
  missing journeys (f) and (g); D2a's line citations one or two off (the rule is `:73`, the title `:62`, the button `:69`, D2c's
  `:239-252`/`:250`) in the code, journeys, EXPERIENCE and this spec's Tasks and criteria (the frozen Intent keeps its `:75`)
- [x] [Review][Defer] The Sites page's original-theme Download is still a plain link, and the Backup step's Theme row says its
  failure in a line mounted with its words, in grey — DW-405, owned by Story 7.26 [`sites/(list)/page.tsx`; `deploy-wizard.tsx`] —
  deferred, pre-existing

**Acceptance Criteria:**
- **Matches the frame.** Given the editor at 1440 on a project whose linked site has a snapshot, when History opens:
  - the original row matches D2a `:58-71` and its rule `:73` (D2c `:239-252` on Free), with no Live badge;
  - the refused row is drawn in the extrapolated shape: 7.23a's note, D3a's Download, B12b's link.
- **One press back to the original, really.** Given a project with v1 and v2 shipped live to T1 and a casper snapshot, when
  Restore original is pressed:
  - T1's active theme is `casper`;
  - Inflozo's theme is still installed, and its download's manifest equals v2's `content_manifest`;
  - v2's row is `uploaded`, with `accepted_at` unchanged;
  - no `deploys` row was inserted.
- **The saved copy goes back when Ghost lost it.** Given a non-default snapshot Ghost does not hold, when Restore original is
  pressed, then T1's active theme is that name, and its download's files equal the saved zip's.
- **The baseline holds.** Given a restore and then Re-activate on v2, when Pre-flight runs, then D3c passes "since v2".
- **No lock, no plan, no gscan.** Given a Free account reading along, when Restore original is pressed, then it completes, and
  the source test holds.
- **Ghost says no, nothing changes.** Given a fatal snapshot, then Ghost's 422 detail is said with the Download and the link,
  T1's active theme is unchanged, and no row changed.
- **DW-391.** Given any of the four Downloads, when its route answers 404, 401 or 502, then its sentence is said under it and
  the editor stays.

## Spec Change Log

- **2026-11-26, Dev — what landed beside the plan, each a routine call.**
  - **One module for DW-391**, `apps/web/lib/signed-download.ts`: `signedAnswer` and `signInAnswer` for the three routes, and
    `followSigned` with its three sentences, in one pure file. The route helper answers with the platform's own `Response`
    (`Response.json`, a 303 with `Location`), because `next/server` does not resolve under `node --test`; the routes' 404s and 502s
    are unchanged. A press with a modifier key stays the browser's own (`followsHere`), so a new tab still follows the 303.
  - **The three sentences** (no frame draws them; R-170, one list): "This file is no longer kept, so there's nothing to download.",
    "You've been signed out. Sign in again, then download it.", "We couldn't prepare that download. Try again." — and "Preparing…" is
    the Backup step's own word.
  - **`SignedDownload`** (`deploy-wizard.tsx`, exported) is the one `<a href>` the three link Downloads share: D3a's (40), the Roll
    back confirm's (40) and the original row's "Download your original theme" (28, the row's own button size). Its words sit in the
    `BusyLabel` grid, so 7.23a's journey (n) now reads the Download's accessible name rather than its text.
  - **The route's answers are one function**, `answered()`, shared by the act branch and the restore branch; `deploy.test.ts`' 7.23a
    test reads them there. A failed `site_snapshots` read fails the History GET (502), as a failed deploys read does — never a
    missing row.
  - **`restoreSaid(outcome, host, kept)`**: `gone` says "changed", or "no longer kept" when the re-read has no original left.
  - **A request that fails** (the network) is said under the row with focus back on Restore original, and the list is not read
    again — the matrix's "row unchanged".
  - **The original row's tile** is `paper-sunk` with `ink-soft-aa` (D2 `:60`'s `#EFECE7` and `#6B6459`), the row `paper-raised`
    with the `line` hairline (`:58`); no new token.
  - **The harness** answers `original-restored` (v2 demoted to D2d's row) for a journey to switch to while the press is held, as
    7.23a's `rollback-gone` is used; `harnessRestore` with no header answers live.
  - **Re-expected journeys**, each by the rule this story changed: 7.20a (h)'s and 7.21's fake download routes now answer the
    follower's JSON then a signed stand-in (`fakeSigned`), and 7.23a (n) reads the Download's name.
  - **The main session's matrix audit** moved the linked site's pick into `historyAnswer` (`originalOf`), so "never another site's"
    is a unit test rather than the route's inline line, and added journeys 7.23b (f) (reading along, R-192) and (g) (the request
    failing) beside the plan's (a)–(e).
  - **Walk step 122** puts the saved copy back under the name `walk-original` and plants the fatal original as `walk-fatal` (both
    T1-deleted by its finally); `STEP122_PLANT` plants B's original as `old-magazine` 2.1.0 — the saved Casper renamed, plus one
    template Handlebars cannot parse, proved blocked on gscan 6.4.2 before anything is stored — as the owner's test names it.
- **2026-11-26, Review — what the review changed, each a routine call (Review Findings above has the list).**
  - **Restore original names the row by its id AND its `captured_at`.** The frozen Always says "its id must equal the asked id, else
    `gone`", written on the belief that a later capture writes a new row. It does not: `captureSnapshot` upserts on `site_id`, so the
    id stays and only `captured_at` (and the path, name and version) move. POST `{ act: 'restore', snapshot, captured }`; a missing
    or unreadable `captured` is a 400, a moved one is gone. The walk's repoints (122e/f) keep `captured_at`, so they still restore.
  - **A saved zip the store no longer has is `gone`** (Storage's `NoSuchKey`, `statusCode` "404" — storage-js 2.115.0's
    `StorageApiError`, read in source; the download route reads the same answer off the wire), and a row with no name is gone too.
  - **Closing History after a put-back or a restore that landed re-reads the page** (`router.refresh()`), so Ship it's state
    follows without a reload — the owner test's step 4 reads it in the same page.
  - **`previous` and `prev` follow the record too**: the wizard's "keep vN active", "still serving vN", "live: vN" and "vN → vM" name a
    version only while the latest activated deploy is still `live`. A ship, a Roll back and a refused activation read exactly as
    before; a restore (or another project's ship to the site) now reads "your current theme".
  - **D2a's lines, read again:** the row is `:58-71` and its rule `:73` (`:75` is the v10 row); D2c is `:239-252`. The frozen Intent
    keeps its `:75`; the code, the journeys, EXPERIENCE and the Tasks and criteria here say `:73`.

## Design Notes

**What Question 1 decided — option 1, R-292 (owner, 2026-11-26).** Options 2 and 3 are kept here as the record of what was declined.

| | Option 1 (ruled, built) | Option 2 (declined) | Option 3 (declined) |
|---|---|---|---|
| A held non-default original | activated as Ghost holds it | the saved zip uploaded over it, after a check | the saved zip uploaded over it |
| An original Ghost no longer holds | the saved zip uploaded, then activated | the same | the same |
| Casper or Source (DW-389) | activated | activated | activated |
| Check / confirm | none — nothing is overwritten | S8e's confirm shape: Ghost's copy of the original compared with the saved zip's manifest (`unzipTheme`, `compareManifests`), D3a's list and Ghost's copy as a download; restore still allowed | none |

**Why Roll back's own check does not apply.** R-291's check compares Inflozo's theme under the frozen name with its newest
accepted upload. It exists because a Roll back overwrites those files. A restore never does:
- it activates another theme (Ghost keeps Inflozo's installed — VERIFY 61), or it uploads under the original's own name;
- Re-activate then brings Inflozo's back, hand edits and all (§91 step 6).

So that check would warn about losses that cannot happen. The only thing a restore could overwrite is a changed copy of the old
theme, and only under options 2 and 3.

**No `deploys` row, and the baseline holds.** The 7.21 criterion's own "because" names its scope: Ghost replaces the files under
the name the drift check reads. A restore activates or uploads under the original's name, never the frozen one (AD-19). So the
newest accepted upload under the frozen name is unchanged, and the next check compares the right two manifests. A row carrying the
snapshot's manifest would compare Inflozo's theme with the old one: a false drift on every ship, which FR-J16's zero false
positives forbids. `deploy_kind` `snapshot_restore` stays unwritten, as 7.23a left `rollback`.

**The demote, and R-264 (a).** After a restore no Inflozo theme is live on the site, so the record must stop saying so:
- the site's `live` rows become `uploaded` (D2d's row and its Re-activate follow from 7.23a's `actionOf`);
- "live here" needs the row still `live`. A Roll back, a ship and a refused activation behave exactly as before.

`activated`/`activated_at` stay, so Pre-flight's dropped settings (`previousCustom`) still compare with the last version this project
had live. That is still right: Ghost keeps theme settings per name (VERIFY 76). *(Story 7.23b's Review: `previous` — the version the
wizard says the site serves — no longer follows `activated` alone. It counts only while the latest activated deploy is still
`live`, so after a restore the wizard says "your current theme", never "v2".)*

**No confirm.** The frame draws none, and the PRD says "one-click". The undo is one press of Re-activate. 7.23a's Re-activate
needs no confirm for the same reason. A confirm arrives only with Question 1's option 2, which has something to show in it.

**The refusal's honest sentence.** R-281's "points the user at Settings → Design, where Ghost still holds the previous theme" is
half true. Ghost's activation runs the same check as its upload (`activate.js:55-60`), so a theme refused here cannot be switched
on there either. The row therefore offers the zip "to keep a copy, or to have it updated", and links Ghost's Design & branding as
the place to upload it.

**`theme_version` is a column** because the frame draws `casper 5.9.4`. The capture already reads the version (`snapshot.ts:124`),
and reading it back out of a stored zip on every History open is out of proportion.

**DW-391 by `Accept`, not `redirect: 'manual'`.** A manual fetch sees an opaque redirect for both the signed URL and the sign-in
303, so it cannot tell them apart. A JSON answer names the URL, and plain links keep their 303. That covers `/restore`, scripts-off
forms and middle-click.

## Questions for the owner

### Question 1 — Should Restore original check your site first, as Roll back does?

**In plain English.** Roll back checks your site first (your ruling R-291), because it overwrites Inflozo's theme there, and
someone may have changed that theme in Ghost Admin. **Restore original never overwrites Inflozo's theme.** Ghost keeps it
installed, and History then shows it as "Uploaded, not live" with **Re-activate**, so one press brings it back, changes and all.
Roll back's check would look at files Restore never touches.

The one thing Restore *could* overwrite is your **old** theme: Ghost may still have it, and someone may have changed it after
Inflozo replaced it. How Restore puts the old theme back decides whether that can happen. Your R-284 already chose *which* theme
counts as your original. This question is about which copy of it goes back: Ghost's own copy, or the copy Inflozo saved.

**An example.** In March, Inflozo replaced your "Edition" theme and saved a copy. In April, your designer uploaded a fixed Edition
in Ghost Admin but did not switch it on. In May you press **Restore original**.
- **Option 1:** Edition comes back **with** the April fix.
- **Option 2:** a box says "Edition changed on your site since Inflozo saved it" and offers to download Ghost's copy first; if you
  go on, the **March** copy comes back.
- **Option 3:** the March copy comes back, and the April fix is gone without a warning.

1. **(RECOMMENDED) Switch on the copy Ghost already has; upload Inflozo's saved copy only if Ghost no longer has it.** Nothing on
   your site is ever overwritten, so there is no check and no box: one press, as the design draws it, and Re-activate undoes it.
   Casper and Source always work this way, because Ghost refuses them as uploads.
2. **Always put back Inflozo's saved copy, and check first.** A box like Roll back's opens and compares your old theme on Ghost with
   the saved copy. If they differ, it lists the files and offers Ghost's copy as a download; you can still restore.
3. **Always put back Inflozo's saved copy, with no check.** One press. Anything changed in the old theme since it was saved is
   replaced without a warning.

**Ruled: option 1 (owner, 2026-11-26) — R-292.** *"(RECOMMENDED) Switch on the copy Ghost already has; upload Inflozo's saved copy
only if Ghost no longer has it. Edition comes back with the April fix. Nothing is ever overwritten, so there is no check and no box:
one press, as the design draws it. Casper and Source always work this way."* The register, FR-J13, FR-J16, EXPERIENCE F1 and F8,
the card, the epic context and DW-389 follow; the code is Dev's.

### Question 2 — After Restore original, should your site's old routes file come back too?

**In plain English.** Besides the theme, Inflozo uploads a small settings file to your Ghost site, `routes.yaml`. It lists your
site's addresses (for example a `/podcast/` page) and which page design each one uses. **Restore original switches your old theme
back on but leaves Inflozo's routes file in place**, exactly as Roll back already does. No page breaks because of it: where a route
names a page design your old theme does not have, Ghost uses that theme's ordinary page instead (Ghost's own code,
`templates.js:191`, read for Story 7.23a). Inflozo keeps no copy of the routes file your site had before Inflozo; the Backup step
before your first ship offers it as a download.

**An example.** Before Inflozo your site was plain Casper with Ghost's standard addresses. In Inflozo you added a "Podcast" page at
`/podcast/`. You press **Restore original**:
- **Option 1:** Casper comes back. `/podcast/` still opens, as Casper's ordinary list page. Nothing mentions the routes file.
- **Option 2:** the same, and the "is live" message adds one line saying your site still uses the addresses you set in Inflozo, and
  that the routes file you downloaded before your first ship puts your old ones back if you upload it in Ghost.
- **Option 3:** Inflozo also puts back Ghost's standard routes file, so `/podcast/` disappears — and so would any non-standard address
  your site had before Inflozo.
- **Option 4:** Inflozo starts keeping your site's own routes file when it first saves your old theme, and Restore original puts both
  back together.

1. **(RECOMMENDED) Leave the routes file as it is, as Roll back does.** One press, as built and as the design draws it; every address
   still opens. The limit is written into FR-J13's note so it is never a surprise.
2. **Leave it, and add the one-line note to the "is live" message.** No frame draws that line, so it would be extrapolated and
   checked in your test.
3. **Put back Ghost's standard routes file with the theme.** One more write to your site on every restore; any address made in
   Inflozo or before it stops working.
4. **Keep and restore your site's own routes file.** The fullest "never costs me the site I had", and a new saved file plus a new
   step, so it would become its own later story; this story ships as option 1 meanwhile.

**Ruled: option 1 (owner, 2026-11-26) — R-293.** *"Leave it, as built (RECOMMENDED). One press, as the design draws it, and every
address still opens. The limit gets written into FR-J13's note so it never surprises anyone."* Asked in-session after the Deploy. The
register and FR-J13's note follow; no code changes, since option 1 is as built.

## Owner's manual test

**Before you start:** Deploy planted two Free test accounts on your go (2026-11-26), both connected to T1 (`ghost6.inflozo.com`):
- **A — `umngkmr+restore723b@gmail.com`, project "Restore test".** v1 and then v2 were shipped live. v2's home page headline reads
  "Version 2". The first ship saved T1's Casper as this site's original theme.
- **B — `umngkmr+restorerefused723b@gmail.com`, project "Restore refused".** It is linked to T1 and nothing has been shipped. Its
  saved original was swapped for a planted theme, `old-magazine`, which T1 does not have and which Ghost's own check refuses.

Sign in at `https://app.inflozo.com/sign-in` with each address and open the link that arrives: A in one browser, B in a second.
Use a desktop window at least **1366 px** wide. Keep a tab on `https://ghost6.inflozo.com`.

1. **URL:** `https://app.inflozo.com/projects/d6676488-452b-4db5-9149-dcd0ad96b3a8` (signed in as A). **Screen:** the editor. **Do:** press
   the clock icon left of **Ship it**. **Type:** nothing. **See:**
   - At the top of the History panel, a pale box with a small archive icon, **Your original theme**, `casper` and `5.12.1`
     in small code type, **Archived today** (on a later day, **Archived Nov 26**), a grey line starting "Kept outside your version
     limit…", and a white **Restore original** button.
   - A thin line under it, then **v2** with a green **Live** dot, then **v1**.
2. **URL:** `https://ghost6.inflozo.com`. **Do:** reload it. **See:** the headline reads "Version 2".
3. **URL:** `https://app.inflozo.com/projects/d6676488-452b-4db5-9149-dcd0ad96b3a8` (A's editor, as in step 1). **Do:** press **Restore original**. **See:**
   - The button says "Restoring…".
   - Then the panel reloads its list: the original box is still on top, **v2** now shows a blue **Uploaded, not live** chip and a
     red **Re-activate** button, and nothing shows a green **Live** dot.
   - Reload ghost6.inflozo.com: it is **Casper** again.
4. **URL:** `https://app.inflozo.com/projects/d6676488-452b-4db5-9149-dcd0ad96b3a8` (A's editor). **Do:** close the panel, then open the small **▾** beside **Ship it**. **See:** the **Deploy only** row is
   not greyed out, and under it "Upload v3, keep your current theme active". **Do:** press Esc.
5. **URL:** `https://app.inflozo.com/projects/d6676488-452b-4db5-9149-dcd0ad96b3a8` (A's editor). **Do:** open History, then press **Re-activate** on v2. **See:** "Activating…", then v2 shows the green
   **Live** dot. ghost6.inflozo.com reads "Version 2".
6. **URL:** `https://app.inflozo.com/projects/d6676488-452b-4db5-9149-dcd0ad96b3a8` (A's editor), **keyboard only.** **Do:** close History and open it again with Enter on the clock; press Tab until
   **Restore original** is focused; press Enter. **See:** "Restoring…", then focus lands on the panel's **✕**, and
   ghost6.inflozo.com shows Casper.
7. **URL:** `https://app.inflozo.com/projects/5acdf051-1c42-4c33-beaa-54f43b73248b` (signed in as B, in the second browser). **Do:** open
   History. **See:** the original box reads `old-magazine` and `2.1.0`, and under it are "Nothing shipped yet" and the limit line.
8. **URL:** `https://app.inflozo.com/projects/5acdf051-1c42-4c33-beaa-54f43b73248b` (B's editor). **Do:** press **Restore original**. **See:**
   - "Restoring…".
   - Then, under the box: "Ghost's own theme check refused your original theme, so nothing on your site changed.", Ghost's own
     message in small grey code type, a **Download your original theme** button, and a line ending in a **Design & branding ↗**
     link.
   - ghost6.inflozo.com is unchanged (Casper).
9. **URL:** `https://app.inflozo.com/projects/5acdf051-1c42-4c33-beaa-54f43b73248b` (B's editor). **Do:** press **Download your original theme**. **See:** a zip downloads, and the editor stays where it
   was.
10. **URL:** `https://app.inflozo.com/projects/5acdf051-1c42-4c33-beaa-54f43b73248b` (B's editor). **Do:** press **Design & branding ↗**. **See:** a new tab opens ghost6.inflozo.com's Ghost Admin, on its
    Design & branding settings. Sign in to Ghost Admin there if it asks.

**After the test:** say "passed", or list what you saw. On your go, Claude then removes the test theme `inflozo-restore-test` from
T1 (the plant uploaded no other; Ghost never accepts `old-magazine`). Casper stays live.

## Verification

**Commands:**
- `pnpm check` -- expected: green. That is lint, typecheck and every package test, among them the put-back, retention, snapshot,
  deploy-run, read, deploy, busy and server-wiring tests. The run prints its own counts; never write one down.
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, with `theme_version` present and not client-writable.
- `python3 tools/doc-audit.py --check`, run twice -- expected: green.
- `pnpm keyboard` -- expected: journeys 7.23b (a)–(e), 7.23a's and 7.22's unchanged, and the floor all green.
- `grep -n "holdsLock\|resolveEntitlement" apps/web/server/deploy/put-back.ts` -- expected: nothing.

**Real infrastructure** (R-82; each on the owner's in-session go, in the main session):
- **Supabase production database.** Apply the migration through `SUPABASE_DB_POOLER_URL`. Read back the column and its comment,
  and that `authenticated` cannot write it. Control: the column is absent before the apply.
- **Walk step 122, on production and T1**, with a throwaway Free account, from a clean worktree at the deployed sha:
  - connect T1 (Casper live) and ship v1 — the capture writes `casper` with its version — then ship v2;
  - the History GET's `original`;
  - Restore original: read T1's active theme (`GET themes/`, staff token) as `casper`; download Inflozo's theme and compare its
    manifest with v2's; v2 `uploaded` with `accepted_at` unchanged; the `deploys` row count unchanged; the editor's
    `liveHere` false;
  - Re-activate, then Pre-flight's D3c "since v2";
  - the saved copy put back: the snapshot swapped for Casper's files renamed `walk-original`, not held by T1. Restore uploads,
    activates, and `walk-original`'s download equals the saved zip. This is VERIFY 10's snapshot half, executed;
  - a planted fatal original: 422 said with its detail, T1's active theme unchanged (control: the same press with the real zip is
    accepted);
  - DW-391 on production: the snapshot route's JSON answer, then its signed URL serving a `PK` zip; a removed row answering 404;
  - a second session without the lock;
  - another account's restore of this snapshot answering 404, and a disconnected site 409;
  - finally T1 back on `casper*`, `walk-original` and the probe themes deleted, the account deleted, the users and projects counted
    back.

  **Ghost 5's half** (T3, R-238) is postponed to DW-326's pass at Story 15.7.
- **Vercel:** the deployment is READY from the Dev head.
- **The owner's test above (R-80).**

**Executed — Dev, the main session (2026-11-26, Node 24; the real services by their variable names, every key read inside the
script from `tools/probe/.env`, never on argv, no value printed; the owner's in-session go to the one write, "1. Go"):**
- **Supabase production database** (`SUPABASE_DB_POOLER_URL`):
  - **Before, read-only:** the catalogue of `public` and `private` (columns; functions without the extension-owned ones; triggers;
    policies; indexes; enums; constraints) read on production inside a `read only` transaction, against a PostgreSQL 17 container
    built from the prelude and every migration except 7.23b's: 575 rows each, and `diff` empty — production had drifted nowhere.
    `theme_version` was absent on production — the control.
  - **The apply, one transaction, then read back:** the column is `text`, nullable, no default; its comment equals the file's;
    `authenticated` INSERT false, UPDATE false, SELECT true (the table-wide read); `service_role` UPDATE true; of the 5 snapshot
    rows, none carries a version (no backfill, as planned).
  - **As a signed-in customer**, in a transaction rolled back (a throwaway user, site and snapshot; `set local role authenticated`
    with a JWT sub): the customer reads its own `theme_version` (`5.9.4`, the control), and `update public.site_snapshots set
    theme_version = …` is refused, **42501**. Proof rows left behind: 0.
  - **After:** production's catalogue against a container built from every migration, 7.23b's applied twice (it re-runs
    cleanly): 576 rows each, and `diff` empty. Production before against after differs in exactly one line: the column.
- **The RLS gate's control** (the Schema push): the architecture's `SCHEMA.sql` at the Create head with the 7.23b migration
  withheld: **exit 3**, stopping at "FAIL (7.23b): site_snapshots.theme_version (text, nullable, no default) is missing". With it:
  exit 0 and the 7.23b PASS line.
- **CI on the Schema push ce08ed50** (`GITHUB_TOKEN`): run 45771995849 — `check`, `rls` and `deploy` success; the Render matrix
  success. **Vercel** (`VERCEL_TOKEN`): `dpl_5NuP2SK5LgZ4QuTbBYYSRetrd89Q` READY on production, built from ce08ed50.
- **The matrix audit** (each row to a check that ran in that row's state). Two rows were checked by words or a static read alone,
  and one by the route's inline code; each now has a check, seen red under a planted reversion, then restored:
  - *No row* (no linked site, or another site's snapshot): the pick moved out of the route into `historyAnswer` (`originalOf`,
    `lib/retention.ts`), and `retention.test.ts` holds the linked site's picked out of the user's, never another site's, none with
    no link or no snapshot. Red (1) with the pick reverted to the first row; `deploy.test.ts`' route test reads the hand-over.
  - *Reading along, any plan*: journey **7.23b (f)** — the editor read-only (the control: Add section disabled), Restore original
    live, pressed and said. Red with the restore refusing while the lock bar shows.
  - *Request fails*: journey **7.23b (g)** — "didn't go back… Try again." under the row, focus on Restore original, the list
    unchanged, nothing said in the drawer's region. Red with a failure re-reading the list and saying it in the region.
  - Every other row maps as follows: the four Ghost rows, the default theme, the original already live, gone, disconnected, busy,
    unrecorded and the no-row-written baseline to `put-back.test.ts`' 7.23b tests; Deploy only after a restore to `read.test.ts`'
    and `deploy-run.test.ts`' R-264 (a) tests; the version unknown and nothing shipped to journey (a); the refusal to (c); gone,
    disconnected and busy to (d); DW-391 served and failed to (e1)–(e4), `signed-download.test.ts` and `deploy.test.ts`. The
    undo and the baseline's D3c on real Ghost are walk step 122's (Review).
  - **Matches the frame:** the row's tokens read against `D2:58-75` — `line` `#E7E2DB`, `paper-raised` `#FBF9F5`, `paper-sunk`
    `#EFECE7`, `ink-soft-aa` `#6B6459`, `ink-soft` `#6E6A64`, `radius` 12 px, `radius-sm` 8 px (`globals.css`); the 28 button and the
    26 × 26 tile measured by the floor at 1440, 1280 and 820.
- **The main session's own gates, on the final tree:** `pnpm check` exit 0 (every package 0 failing, each printing its own count);
  `pnpm keyboard -g "7\.23b"`: 13 of 13 green — (a)–(g) with (e1)–(e4), and the floor at 1440, 1280 and 820.
- **Not hit in Dev:** T1, Resend and Dodo (nothing of this Dev sends to Ghost; a restore sends no email and reads no plan). Walk
  step 122 (production + T1) and `STEP122_PLANT` are written and have never run: they are the Review's and Deploy's, from a clean
  worktree at the deployed sha, each on the owner's in-session go. Vercel's READY from the Dev head is read after the push (the
  Review reads CI on the Dev head first).

**Executed — Dev, the implementation pass (2026-11-26, Node 24; local only — no production, Vercel, Resend, Dodo or T1 call):**
- **`pnpm check`:** exit 0 — lint, typecheck and every package's tests, each printing its own count with 0 failing; the web
  package's run includes the put-back, retention, snapshot, deploy-run, read, deploy, busy, server-wiring and the new
  signed-download tests.
- **`bash supabase/tests/run-rls-gate.sh`:** exit 0, with "PASS (7.23b): site_snapshots.theme_version is a nullable text with no
  default, commented and client-unwritable" (no schema change at Dev; the Schema push's own gate and its control stand).
- **`python3 tools/doc-audit.py --check`**, twice: the first regenerated the story board (STALE), the second PASS.
- **`grep -n "holdsLock\|resolveEntitlement" apps/web/server/deploy/put-back.ts`:** nothing.
- **The propagation greps:** no `follow(` left in `apps/web`; both of R-264 (a)'s reads (`deploy-io.ts` `liveProject`, `(editor)/read.ts`)
  carry `status = 'live'`, and `previous`/`previousCustom` keep `activated` alone, as the Design Notes say.
- **Each new unit assertion seen red under a planted reversion**, then restored byte for byte (sha256): Casper uploaded on a
  not-found (2 red), the restore's demote removed (5), no `disconnected` refusal (1), the snapshot id unchecked (1), a `deploys`
  write on the restore (3), "Archived today" lost (1), `gone` ignoring `kept` (1), `original` not passed through (1), no 401 to the
  follower (1), no JSON answer (1), `liveProject` without `status = 'live'` (1), `read.ts` likewise (1), `theme_version` not written
  (2), Restore original without `aria-busy` (1), the Theme Download not followed (1), the original read from the wrong bucket (1).
- **The journeys** (`run-keyboard-gate.sh -g "7\.23b"`): 7.23b (a)–(d), (e1)–(e4) and the 7.23b floor at 1440/1280/820, 11 of 11
  green; with `deploy-history.tsx` and `deploy-wizard.tsx` put back to HEAD, 11 of 11 red; restored (sha256 equal), green.
- **The neighbours** (`-g "7\.2[0-3]|pointer"`): 7.20a's, 7.21's, 7.22's and 7.23a's journeys and floors and the no-pointer sentinel —
  89 green once 7.23a (n) read the Download's name (its first run read the text, which now holds the hidden "Preparing…").
- **`pnpm keyboard`, the whole gate, on the final tree:** 373 passed, 0 failed — 7.23b (a)–(e4) and its floor, 7.23a's, 7.22's, 7.21's
  and 7.20a's journeys and floors, and the no-pointer sentinel among them.
- **Walk step 122:** `node --check` and a `no-undef` lint pass (its control, a planted undefined name, red); never run.
- **Written, the main session's to run on the owner's in-session go:** the migration's production apply (before this code is
  pushed, R-99), walk step 122 (`T1_WRITES=1`, from a clean worktree at the deployed sha — a cut of steps 1–5 + 122), and
  `STEP122_PLANT=<a>,<b>` for Deploy. Step 122's T1 writes: two ships of "Restore test" (uploads and activations under its frozen
  name), about five Restore original presses (activations of T1's own theme, and uploads of `walk-original` and the refused
  `walk-fatal` under their own names), two Re-activates, then the finally's activation of T1's own theme and deletion of every
  `inflozo-`/`walk-` theme it uploaded. Its production writes: the throwaway account, its site, project, jobs and deploys through
  the product; the snapshot row repointed twice and deleted, two objects stored under its prefix, its site's `disconnected_at`
  stamped and cleared — all removed by the finally.

**Executed — Review, the main session (2026-11-26, Node 24; every key read inside the process from `tools/probe/.env` by its variable
name, never on argv, no value printed; the owner's in-session go to walk step 122, "1. Go, up to 3 runs"):**
- **CI on the Dev head `d15ab252`** (`GITHUB_TOKEN`): run 45782292897 — `rls`, `check` (the whole `pnpm keyboard` gate with it) and
  `deploy` success; the Render matrix success. **Vercel** (`VERCEL_TOKEN`): `dpl_2R4G8cmLktt56q5wZKkYWNzwu6y6` READY from `d15ab252`.
  So the Dev's "on the final tree" stands on CI's whole keyboard gate, not only the local `-g "7\.23b"` run.
- **The Real-infra verifier (read-only):**
  - **R-99 holds.** Production read through `SUPABASE_DB_POOLER_URL` inside a `read only` transaction: `site_snapshots.theme_version`
    `text`, nullable, no default, its comment the migration's word for word; every column the diff names on `site_snapshots`,
    `deploys` and `deploy_jobs` present; `deploy_status` carries `uploaded` and `live`; `site_snapshots_owner_read` present; 5 snapshot
    rows, none versioned, none nameless. Control: a column that does not exist counts 0.
  - `authenticated` INSERT/UPDATE on `theme_version` false, SELECT true; `service_role` UPDATE true.
  - **DW-391's three routes signed out on production** (`/snapshots/…/download`, `/projects/…/deploy/live`, `/projects/…/history/live`):
    `Accept: application/json` → **401** `Not signed in`, no-store; as a link → **303** `/sign-in`. Control: the same nine asks while
    production still served `ce08ed50` were all 303.
  - T1's themes (staff token): `casper` active, `racer`, `source`, `inflozo-ghost6` (the owner's own, kept), no `walk-` theme. Control:
    the same read with no token, 403.
- **The review's patches, locally (Node 24):** `pnpm check` — lint and typecheck clean; its one red test (`server-wiring.test.ts` still
  expecting the original read without `captured_at`) re-expected, then the web package's 1159 tests 0 failing. Each new assertion
  seen red under a planted reversion, then restored: the `captured_at` compare, the nameless row, the missing object (one each in
  `put-back.test.ts`), and `previous`'s still-`live` rule (`deploy-run.test.ts`). `pnpm keyboard`, whole: 373 passed, 2 failed — both
  the browser crashing under another session's load ("Page crashed" at a `goto`, "Target crashed" at a key press, in 7.18c's R-275
  and 7.10's rich Heading journeys, neither touching History); the two re-run alone, 2 of 2 green. Every 7.23b and 7.23a journey and
  floor green in the whole run. `python3 tools/doc-audit.py --check`, twice: PASS.
- **Walk step 122, run 1 — on the Dev head's deployment `d15ab252`** (a cut of steps 1–5 and 122 from a clean worktree at that sha,
  the review's patched walk in its `tools/probe-debug/`): **63 PASS, 3 FAIL**. Every restore claim held on real Ghost:
  - (a) two ships; the capture wrote `casper` **5.12.1** (`theme_version`);
  - (b) the History GET's `original` on R's own session;
  - (c) Restore original by the keyboard — "Restoring…", said, focus on ✕; T1 `casper*` with `inflozo-restore-test` still installed at
    **zero** differences from v2's manifest; v2 `uploaded` with `activated`, `activated_at` and `accepted_at` untouched; no row added;
  - (d) Re-activate v2 ("Version 2"), then Run checks: D3c **"since v2"** — the baseline held;
  - (e) **VERIFY 10's snapshot half, executed**: `walk-original` (not held — the control) uploaded from the saved zip and activated,
    its download at zero differences from the saved zip;
  - (f) a planted fatal original (gscan 6.4.2 GS005-TPL-ERR, proved locally first, the real zip clean): Ghost's 422 said under the
    row with its detail, the Download pressed — a zip downloaded and the editor stayed (DW-391 through the product) — Design &
    branding at the site's own Design panel, nothing on T1 or in the rows changed; the control, the row back as captured, accepted;
  - (g) DW-391 signed in: `200 { url }`, a `PK` zip as an attachment; as a link the opaque 303; signed out 401;
  - (h) a second session reading along (`[data-readonly]`, the first holding the lock): Restore original said;
  - (i) another account's POST 404 with T1 untouched; a disconnected site 409 `disconnected`; the row deleted — download 404,
    restore 404, the GET's `original` null;
  - finally: T1 `casper*` with `inflozo-ghost6` kept, every theme the run uploaded deleted, `routes.yaml` 130 → 130 bytes; R deleted,
    objects 0; users 25 → 25, projects 18 → 18; zero CSP violations.

  **The three FAILs, each classified:**
  - **122b** read the button's `textContent`, which carries the BusyLabel's hidden "Restoring…" — the walk's own read; it now reads
    `innerText`.
  - **122c, in the same page** — Deploy only still **greyed** after the restore, with "v2 is already live…". This is the review's
    finding on production: the page kept its load-time ship state. The control for the fix.
  - **122c, reloaded** — free, but its caption read **"Upload v3, keep v2 active"** while Casper was live. Also the review's finding,
    and the control for the `previous`/`prev` fix.
- **CI on the Review head `78a3e182`** (`GITHUB_TOKEN`): run 45791908548 — `check` (the whole keyboard gate), `rls` and `deploy`
  success. **Vercel** (`VERCEL_TOKEN`): `dpl_EFUsZnuk3VH2TkRUZoMQiTzJcbBM` READY from `78a3e182`.
- **Walk step 122, run 2 — on the Review's deployment `78a3e182`** (the same cut, the worktree moved to that sha): **66 PASS, 0 FAIL.**
  Everything run 1 held, held again, and the three run-1 FAILs passed:
  - 122b: D2a's row reads "Your original theme", `casper 5.12.1`, "Archived today", "Restore original", no Live dot, outside the list,
    then its rule;
  - 122c, the same page: History closed after the restore, Ship it ▾'s Deploy only **not greyed**, reading "Upload v3, keep your current
    theme active" — the close re-read the page (run 1's control: greyed, "v2 is already live…");
  - 122c, reloaded: the same, free, "keep your current theme active" (run 1's control: "keep v2 active").
  - Finally: T1 `casper*` with `inflozo-ghost6` kept, every uploaded theme deleted, `routes.yaml` 130 → 130 bytes; R deleted, objects 0;
    users 25 → 25, projects 18 → 18; zero CSP violations.
  Two of the owner's three runs used; nothing left on T1 or production. **Not run:** `STEP122_PLANT` — Deploy's, on its own go.

**Executed — Deploy (2026-11-26, Node 24; keys by their variable names, read in-process, no value printed; the production and T1
writes on the owner's in-session go, "1. Go", up to 3 runs, run in the main session):**
- **Deployment: `dpl_4ZooiyFvvyX2igk2Mx81FwQrPpUK`** (`inflozo-9burfyem5-umangkagathara.vercel.app`), READY, target production,
  built from `e98a03ab` (the Review's last commit), aliased to `app.inflozo.com`, `inflozo.com` and `www.inflozo.com` (`VERCEL_TOKEN`,
  `VERCEL_TEAM_ID`, `VERCEL_PROJECT`, `v6/deployments` and `v13/deployments/{id}`); `https://app.inflozo.com/sign-in` and
  `https://inflozo.com/` answer 200. `git diff --stat 78a3e182 e98a03ab -- apps packages supabase` is empty, so this is the app
  code walk step 122 ran 0 FAIL 66 PASS on at Review.
- **CI on `e98a03ab`** (`GITHUB_TOKEN`, read only): run 45797368887 — `check` (the whole keyboard gate among it), `rls` and `deploy`
  success; the Render matrix (45797368847) success.
- **Schema:** applied on production at Dev (the Schema push, R-99) and read back at Dev and at Review; nothing since.
  **`bash supabase/tests/run-rls-gate.sh`: exit 0**, with "PASS (7.23b): site_snapshots.theme_version is a nullable text with no
  default, commented and client-unwritable".
- **Before the plant, read only:** T1's themes with `GHOST6_STAFF_ACCESS_TOKEN` (`GET themes/`, 200): `casper*`, `racer`, `source`,
  `inflozo-ghost6`, no `walk-` or test theme; neither plant address among production's 23 users (`SUPABASE_SECRET_KEY`).
- **The owner's test plant** — walk step 122's `STEP122_PLANT=umngkmr+restore723b@gmail.com,umngkmr+restorerefused723b@gmail.com`
  with `T1_WRITES=1`, as a cut copy (steps 1–5, then 122, then the walk's `finally`) from a clean detached worktree at the deployed
  `e98a03ab` (`tools/probe/.env` linked in, never copied), the launcher reading `SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
  `SUPABASE_DB_POOLER_URL`, `VERCEL_TOKEN` and `VERCEL_TEAM_ID` in-process and the step its own `GHOST6_*` keys. Three runs, the
  owner's limit:
  - **Run 1: 1 FAIL, 45 PASS** — "ship 2 ended awaiting_ship". Classified with Vercel's request rows (`VERCEL_TOKEN`, the
    `request-logs` endpoint, 20 s windows, none capped): ship 1's Pre-flight and Ship it POSTs answered 202 and landed; ship 2's
    Pre-flight POST answered 202 at 13:54:28Z, and after it **no `POST …/deploy` row** — only the editor's lock beats every 15 s until
    the walk gave up at 13:59:32Z. The press was issued (no DW-404 note) and never reached Vercel: the harness-hold class of DW-204,
    not the product. Its `finally` put T1 back (`casper*`, the run's theme deleted, `routes.yaml` 130 → 130 bytes), deleted the failed
    plant's account (objects 0, T1 disconnected), users 25 → 25 and projects 18 → 18 inside the step, 23 → 23 and 16 → 16 overall.
  - **Run 2: died in step 2** (`page.waitForURL` 30 s on opening the project card), before step 122 — no T1 write; both throwaway
    accounts deleted, users 23 → 23.
  - **Run 3: 0 FAIL, 44 PASS** (one `stall` note, a 30 s editor load retried once):
    - **A — `umngkmr+restore723b@gmail.com`**, Free, **Restore test** (`d6676488-452b-4db5-9149-dcd0ad96b3a8`): T1 connected through
      the wizard; v1 then v2 shipped (Deploy & activate), T1's Home reading "Version 1" then "Version 2"; the first ship's capture
      saved `casper` with `theme_version` **5.12.1**;
    - **B — `umngkmr+restorerefused723b@gmail.com`**, Free, **Restore refused** (`5acdf051-1c42-4c33-beaa-54f43b73248b`): T1
      connected, the project linked, nothing shipped; its saved original planted as `old-magazine` 2.1.0 (stored 200, row 201) —
      A's saved Casper renamed plus one template the pinned gscan 6.4.2 blocks (`GS005-TPL-ERR` fatal, `GS120-NO-UNKNOWN-GLOBALS`;
      the original itself 0 errors), a theme T1 does not hold;
    - each history route answering its original (`casper 5.12.1`, `old-magazine 2.1.0`, B with no rows); zero CSP violations; the
      step-1 throwaways deleted, users 23 → 25 and projects 16 → 18 (two each kept by the plant).
- **Read back afterwards, GET only** (`GHOST6_STAFF_ACCESS_TOKEN`, `SUPABASE_SECRET_KEY`): T1's themes `casper`, `racer`, `source`,
  `inflozo-ghost6`, `inflozo-restore-test*`, its Home reading "Version 2"; A on `free`, Restore test linked to a connected ghost6,
  deploys 1.0.0 `uploaded` (activated) and 2.0.0 `live`, each with its zip, the snapshot `casper 5.12.1`; B on `free`, Restore
  refused linked to a connected ghost6, no deploys, the snapshot `old-magazine 2.1.0`.
- **The Owner's manual test** carries both projects' URLs in every step, `casper 5.12.1` and `old-magazine 2.1.0`, and "Archived
  today" (Nov 26 on a later day). Its closing line said "the two test themes"; the plant uploads one, `inflozo-restore-test`
  (Ghost never accepts `old-magazine`), so it now says so. `owner_test` stays `pending`. Afterwards `inflozo-restore-test` is
  deleted from T1 on his go, Casper live.
- **Not hit in Deploy:** Resend and Dodo (a restore sends no email and reads no plan). Ghost 5's half stays postponed to DW-326.
- **Question 2 is still open** (routes.yaml after a restore); the build ships option 1, as built, meanwhile.
