---
title: 'Story 7.21 — Pre-deploy drift detection'
type: 'feature'
created: '2026-11-24'
status: 'ready-for-dev'
baseline_commit: '9a139db609248e3c733ca714bc52fb3845e813a9'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-20a-the-backup-gate-and-the-pre-inflozo-snapshot.md']
---

## In plain English

After this story, every time you ship to a site you have shipped to before, Inflozo first reads its own theme on your Ghost
site and compares it, file by file, with what it put there last time. If someone changed that theme outside Inflozo, the
deploy stops and lists exactly which files changed, were added or were removed — named by your own section names — with a
**Download the live theme first** button before you choose **Overwrite and ship anyway**. If nothing changed you see one
quiet "Nothing changed on your site since v4 — pass" line among the other checks, and if Inflozo cannot read the theme it
says so in a blue row and lets you ship.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A customer (or another tool) can edit the Inflozo theme on their Ghost site by hand. Today the next deploy
overwrites that work without a word. FR-J16 requires a check before every deploy after the first. `deploys.content_manifest`
has existed since Story 1.2, and nothing writes or reads it.

**Approach:**
- **Write the manifest.** Every stored artefact gets a content manifest: path → SHA-256 of its bytes with line endings
  normalized, plus a fingerprint (a section partial's layer id, else its path).
- **Read the live theme at Pre-flight.** After the two gates pass, the Check step reads the theme under this project's
  frozen name with the Staff Access Token, unzips it and hashes it the same way.
- **Compare.** The live manifest is compared with the manifest of the **newest upload Ghost accepted** from this project to
  this site (Question 1).
- **Show one of three results.** A difference stops the deploy on D3a. A failed read is D3b, and the deploy goes on. A match
  is D3c, one passing row.
- **Overwrite only on the customer's word.** The server refuses a Ship it over a difference unless the customer pressed
  **Overwrite and ship anyway**.
- **DW-338.** The same story caps a layer name at the Layers rename field.

**Frame (R-74):** `D3 The Drift Report.dc.html`:
- D3a drift found, `:28-151`, 600 wide over the editor;
- D3b could not verify, `:157-203`;
- D3c no drift, `:206-225`;
- the "What drift is not" note, `:227`.

Everything else is S8b's Pre-flight as built (`S8 Deploy.dc.html` S8b), whose step card, rows and footer D3 inherits
(EXPERIENCE A3).

**The epic's criteria, word for word (R-195):**
- **Given** any deploy after the first to a given site, **when** the drift check runs, **then** it reads the live theme with
  the Staff Access Token and compares a **content manifest — relative path → SHA-256 of file contents, line endings
  normalized** — against the manifest of what Inflozo **last deployed there**.
- **Zip bytes are never compared**, because Ghost re-zips on download and a byte comparison would report drift on every
  single deploy.
- The comparison targets **the frozen theme name for this project × site**, not merely whatever theme happens to be active,
  so a user who activated something else is not misread.
- On any difference the deploy **stops** and shows exactly which files changed, were added or were removed — **named by the
  user's own layer names wherever a file is a section partial, never by raw paths** — and offers to download the live theme
  before overwriting it.
- **The check fails open**: a revoked token, a network failure, a missing theme or a 403 reports **"couldn't verify" and the
  deploy proceeds** — drift is never asserted without two manifests in hand.
- It is **skipped on the first deploy**, where there is nothing of Inflozo's to compare against.
- The requirement is **zero false positives**, which binds the compiler as much as the check: **a compiled filename must
  never change when the user changed nothing**.
- **Identity is content, not path**: every generated file carries a fingerprint, so **a layer rename produces no drift
  signal at all** — a path-keyed manifest would read a rename as a deletion plus an addition.
- The "Overwrite and ship anyway" confirm **opens with focus on the cancelling action** (UX-DR14).
- The three states match D3a drift found, D3b could not verify and D3c no drift — **and D3c is a passing row, present rather
  than absent**.
- *(FR-J1 — from Story 7.1's Create, 2026-10-05)* The per-file fingerprint lives in the deploy's content manifest
  (`deploys.content_manifest`), **never inside an emitted file**. FR-J1 forbids builder fingerprints anywhere in the output,
  and a content hash can match a renamed file without any mark in it.
- *(DW-338 — from Story 7.1's review, 2026-10-06)* A layer name has no length cap, so the boundary comment
  `{{!-- {Layer name} · … --}}` has none while the file name is cut to 60. The cap lands at the input, in the Layers rename
  flow, so the file and the label agree.

## Boundaries & Constraints

**Always:**
- **Two manifests or no verdict.** Drift is asserted only from a stored baseline manifest and a live manifest read in this
  run. Any failure on the live side is D3b and the deploy proceeds. A baseline with a null manifest (a deploy made before
  this story) is treated as no baseline: skipped, like a first deploy.
- **The baseline is Ruled value 1** (Design Notes). The live side is the theme under the bound name
  (`project_site_bindings.theme_name`, `ProjectRead.bound`), whether or not it is active. No binding means a first deploy:
  no read and no row.
- **One hash rule on both sides.** Both manifests come from `lib/drift.ts`: SHA-256 (Web Crypto) over the file's UTF-8
  bytes, every CR byte directly before an LF dropped. The same function runs on text and binary files.
- **The fingerprint never enters a file** (FR-J1). It lives only in `deploys.content_manifest`. The compiler hands it out as
  data beside the files (`CompiledTheme.sections`). The emitted bytes are unchanged by this story.
- **The read is the capture's read.** `GET themes/{name}/download/` goes through the Admin chokepoint with the staff
  credential and `READ_TIMEOUT_MS.theme_download`, using `server/snapshot.ts`' `downloadPath`. A thrown `credential_missing`
  is "no token". The live zip is untrusted input: it is read from its central directory, stored and deflated entries only,
  under a stated total-size cap. It is never written to disk.
- **Bytes never pass through a function body to a browser (AD-13).** D3a's Download is a 303 to a short-lived signed URL
  over a copy stored in `deploy-artifacts`.
- **The server is the control.** The route answers 409 to a Ship it over a found drift without `overwrite: true`. `ship()`
  asks again after a stale re-make. The wizard's buttons are a courtesy.
- **The check never fails the job.** Every Ghost answer and every unzip failure is a D3b cause. Only our own store and
  database follow AD-20's retry-once-then-`deploy_infrastructure` rule.
- R-98 (busy labels, `aria-disabled` + `aria-busy`), UX-DR12 (each outcome said once, politely), UX-DR14 (D3a opens with
  focus on Cancel) and R-170 (one name per thing: "Add token", `KEYS.staff.add`).
- **Every word lives in one list.** `DRIFT_WORDS`, with no count of designs or categories.

**Ask First:**
- **Every T1 write and every production write needs the owner's in-session go**, asked in R-83's shape and run in the main
  session, never by a subagent:
  - the recorder's probe uploads and deletes on T1;
  - walk step 119;
  - Deploy's plant for the owner's test.

  Word the ask for each run's whole set of writes.
- Any change to Ruled value 1 once the owner rules Question 1.
- A T1 round trip that is not clean: the pilot theme uploaded, downloaded and compared must show zero differences. If Ghost
  adds or drops a file, stop and report it before any ignore rule is written.

**Never:**
- Compare zip bytes or zip metadata.
- Put a fingerprint, id, hash or date into an emitted file.
- Block a deploy on a read that failed.
- Name a section partial by its raw path. A non-partial file is named by its kind word (Design Notes).
- Add a `job_stage` value or a migration. The read runs inside `checking`, and the outcome rides `stage_timings.drift`, as
  `snapshotting` and `routes` do.
- Re-check at Ship it when the artefact is not stale, or check on Re-activate (no upload happens).
- Touch `site_snapshots` or the capture's rules (7.20a).
- Change `doc-schema.ts`' `layerName`. A stored name over the cap still parses.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First deploy | no binding for project × site | no read, no drift row; first deploys unchanged (7.19/7.20a) | N/A |
| Baseline predates the manifest | binding; newest accepted upload has `content_manifest` null | no read, no row (as first) | N/A |
| No token, not declined | `call` throws `credential_missing`; `ShipState.site.declined` false | D3b `no_token`, **Add token**; Ship it enabled | N/A |
| No token, declined | same, decline recorded (R-278) | D3b `declined` words, **no link** (the decline is never raised again) | N/A |
| Token refused | download 401 | D3b `token_refused`, Add token | N/A |
| Token's user cannot read themes | 403 | D3b `role`, Add token | N/A |
| Theme gone | 404 | D3b `missing`, naming the bound theme | N/A |
| Site down / slow / other | thrown `ghost_unreachable`, timeout, 5xx, any other status | D3b `unreachable` (status said when Ghost gave one) | logged by code |
| Not a theme zip | no `PK`, bad central directory, method not 0/8, past the size cap | D3b `unreadable` | logged |
| Clean | live == baseline | D3c pass row "Nothing changed on your site since v{n}" (n = the baseline's version) | N/A |
| CRLF only | a live file differs only by CRLF vs LF | clean | N/A |
| Changed | same path, other hash | D3a Changed row: label = the layer's CURRENT name (fingerprint → instance in the read docs), else the manifest's stored name, else the kind word | N/A |
| Added | a live path not in the baseline | D3a Added: "A template Inflozo didn't write" (`.hbs`) / "A file Inflozo didn't write" | N/A |
| Removed | a baseline path not live | D3a Removed: the baseline's label | N/A |
| Moved | a removed and an added path with one hash | no row for either (identity is content) | N/A |
| Renamed in Inflozo, site untouched | a layer renamed since the last upload | clean — nothing on the site changed (D3 "What drift is not") | N/A |
| Last upload was Deploy only | newest accepted upload `uploaded`, not live | that upload is the baseline (Ruled value 1) | N/A |
| Another theme active | the bound theme is not the active one | still compared; the active theme is never read | N/A |
| Ship it over drift, no consent | POST `ship` with `stage_timings.drift.kind === 'found'`, no `overwrite` | 409 "Drift found", nothing uploaded | N/A |
| Overwrite | POST `ship` `overwrite: true` | ships; uploads replace the theme | N/A |
| Stale at Ship it | inputs moved since Pre-flight | re-made and re-read; found without `overwrite` rests at `awaiting_ship` on D3a | N/A |
| Cancel while reading | Cancel during the read (`checking`) | honoured after the read, as today (objects, then row) | N/A |
| Long rename | the Layers rename field past 60 characters | the field stops at 60; `renameSection` refuses a longer name with its sentence | N/A |

</frozen-after-approval>

## Code Map

- `packages/theme-compiler/src/compile.ts:216` -- `CompiledTheme`. It gains `sections`, the partition loop's record
  (`:1084-1092`). For each `partials/sections/{dir}/{name}.hbs` it holds `{ id: first.instance.instanceId, layer:
  first.instance.layerName || first.entry.name, category: first.entry.category }`, the placement the file is slugged from
  (`sectionSlug`, `slug.ts`). The emitted files are unchanged.
- `packages/theme-compiler/src/slug.ts:10` -- `SLUG_MAX = 60`. It becomes `LAYER_NAME_MAX` (one number, one home, DW-338).
- `packages/section-runtime/src/doc-edit.ts:125` -- `renameSection`, the one rename rule. It gains the cap's refusal.
  `LAYER_NAME_MAX` is exported beside it.
- `apps/web/components/controls/layers.tsx:632` -- the rename `TextInput` (`NAME_FIELD`). It gets `maxLength`.
- `apps/web/server/deploy/run.ts` -- the shell:
  - `compileAndCheck` `:307-390` stores the artefact (`:382-387`, where the manifest joins the patch);
  - `clock` `:202-256` (`progress`'s best-effort write is the pattern for the drift record);
  - `ship` `:446-542` (the stale branch `:480-486`; `withoutSnapshot` is the flag pattern);
  - `DeployIo` `:71-133`; `DeployRow` `:45-59`.
- `apps/web/server/deploy/deploy-io.ts` -- the real io: `previous` `:101`, `artifacts` `:109`, `BUCKET`. It gains
  `deploys.baseline` and `liveTheme`.
- `apps/web/server/deploy/zip.ts` -- the deterministic writer. The reader goes beside it, and `zip.test.ts` already inflates
  entries back.
- `apps/web/server/snapshot.ts` -- `downloadPath`, `requestOf`, `SnapshotAnswer`, and the credential's causes. Reuse them;
  do not import the capture.
- `apps/web/server/ghost-admin/admin-rule.ts:152` -- `READ_TIMEOUT_MS.theme_download` (45 s).
- `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/route.ts` -- the one door. POST validates the body, then branches on
  `act === 'ship'` (`:59-90`).
- `apps/web/app/(app)/app/snapshots/[id]/download/route.ts` -- the signed-URL 303 to copy: `SIGNED_URL_TTL_S`, `NoSuchKey` →
  404, `{ download: filename }`.
- `apps/web/lib/deploy.ts` -- the wizard's and the server's one module:
  - `Timings` `:70` (gains `drift`);
  - `DeployRequest` (gains `overwrite`);
  - `DEPLOY_WORDS` `:230` (S8b's words);
  - `SNAPSHOT_WORDS` `:454` (its `tokenRefused` cause, reused by R-170);
  - `checkRows` `:667` (the passes D3c joins);
  - `fileLabel`/`placeOf` (a root template's canvas label);
  - `versionLabel`, `versionNumber`.
- `apps/web/components/editor/deploy-wizard.tsx` -- S8b `:1092-1250`:
  - `checksDone` `:506`;
  - the passes box `:1149-1164`;
  - the routes row `:1165`;
  - the footer and Ship button `:1198-1247`;
  - B12b's `retoken` (D1b's view over a resting job, Back returning, focus `:655-663`), D3b's Add token pattern;
  - widths per view `:1797`, `:1833`.
- `apps/web/components/kit/layers-row.tsx:121` -- `glyphOf(category)` and `LayerThumb`, D3a's row icon for a section
  partial (the frame's Layers-row icons).
- `apps/web/app/(app)/app/harness/editor/{layout.tsx,actions.ts}` -- the harness's fake ship (`x-inflozo-harness-ship`,
  `-snapshot`, `-token`). It gains `x-inflozo-harness-drift`.
- `apps/web/server-wiring.test.ts` -- the service-role and chokepoint lists. The new live route signs with
  `supabaseAdmin()`.
- `tools/keyboard/journey.spec.mjs` (pointer-free), `tools/keyboard/floor.spec.mjs` -- the journeys and the widths.
- `tools/probe/run-verify-editor.cjs` -- the walk; the last step is 118 (`:13576`).
- `tools/probe/record-snapshot.mjs` (§89) -- the recorder pattern for `record-drift.mjs` (§90).
- **Read in source at Create (Ghost 6.58.0 and `@tryghost/zip` 3.5.1 npm tarballs, read-only):**
  - `core/server/services/themes/storage.js:95-107`: `setFromZip` renames an existing theme of the same name (active or not)
    to `{name}_{ObjectID}` and saves the new extraction in its place. The theme under a name is therefore the last accepted
    upload's files, all of them. Question 1 rests on this.
  - `theme-storage.js:23-55`: `serve()` zips the theme folder with `compress(themePath, zipPath)`.
  - `@tryghost/zip/lib/compress.js`: `glob '**/*'` with `cwd` at the theme folder, `dot: true`, ignoring `node_modules/**`.
    Entries are rooted at the theme folder, and directory entries may appear.

  5.130.6 is Dev's to read, and its execution goes to DW-326 (R-238).

## Tasks & Acceptance

**Dev gate:** none left with the owner. Question 1 was ruled option 1 (R-287), which this plan builds as Ruled value 1. Dev
still asks his in-session go for the T1 and production writes (Ask First).

**Execution:**
- [ ] `packages/section-runtime/src/doc-edit.ts` -- export `LAYER_NAME_MAX = 60`. `renameSection` refuses a trimmed name
  longer than it with `` `Keep the name to ${LAYER_NAME_MAX} characters.` `` and still refuses an empty one. -- DW-338: the
  cap at the input.
- [ ] `packages/theme-compiler/src/slug.ts` -- `SLUG_MAX = LAYER_NAME_MAX` (imported), so the file name and the label have
  one cap. Re-read `slug.test.ts`.
- [ ] `apps/web/components/controls/layers.tsx` -- `maxLength={LAYER_NAME_MAX}` on the rename field. -- DW-338.
- [ ] `packages/theme-compiler/src/compile.ts` -- add `sections` to `CompiledTheme` (Code Map), filled in the partition loop.
  Add tests in `compile.test.ts`:
  - two compiles of one input give identical paths, bytes and `sections` (the compiler's half of zero false positives);
  - a renamed layer moves its partial's path while `sections[path].id` stays the instance's.
- [ ] `apps/web/lib/drift.ts` (new, pure, no runtime imports beyond `lib/deploy.ts`' words and labels):
  - the types: `ManifestEntry` `{ sha256, fingerprint, layer?, category? }`, `ContentManifest`, `DriftFile`, `DriftCause`,
    `DriftRecord` (`reading` · `clean` · `found` · `unverified`);
  - `normalizedBytes`, `sha256Hex`;
  - `contentManifest(files, sections)`;
  - `liveManifest(entries)`;
  - `compareManifests(baseline, live)` → `{ changed, added, removed }` in path code order, a same-hash removed+added pair
    dropped;
  - `labelOf(file, kind, names)`, using the kind-word table;
  - `driftSaid(record, ctx)` → the polite sentence;
  - `DRIFT_WORDS` (Design Notes' table).

  `lib/deploy.ts`' `Timings` gains `drift?: DriftRecord` (a type-only import), and `DeployRequest` gains
  `overwrite?: boolean`.
- [ ] `apps/web/server/deploy/zip.ts` -- `unzipTheme(bytes, cap)` → path → bytes:
  - read through the end-of-central-directory record and the central directory;
  - methods 0 and 8, inflated with `inflateRawSync` under `maxOutputLength`;
  - directory entries skipped;
  - a total past `LIVE_MAX_BYTES` (stated with its reason), ZIP64, an encrypted entry or any other method throws;
  - the caller reads every throw as `unreadable`.
- [ ] `apps/web/server/deploy/run.ts`:
  - **Write the manifest.** `compileAndCheck` writes `content_manifest: await contentManifest(theme.files,
    theme.sections)` in the artefact's patch. The re-made-artefact reset nulls it.
  - **Then the drift step,** inside `checking` and only when nothing blocked:
    - close `checking`'s `ms`, so the check row shows done, and write `{ kind: 'reading' }` best effort;
    - if `read.bound` is null, or the baseline is null or has no manifest, write nothing more (the record is removed);
    - else call `io.liveTheme`, map the answer to a cause or `unzipTheme` → `liveManifest` → `compareManifests`;
    - name each changed file by its fingerprint over `read.input`'s docs (current layer name), else the stored name;
    - on `found`, put the live zip at `{projectId}/live/{siteId}.zip` (`twice`, overwriting) before the record;
    - the record rides the next edge, and Cancel is read after the step.
  - `ship()` takes `overwrite`. After a stale re-make, a `found` record without it ends at `awaiting_ship` with no error.
  - `DeployRow` and the update patch gain `content_manifest`.
  - `DeployIo` gains `deploys.baseline` and `liveTheme`, with `clock.drift(record)`.
- [ ] `apps/web/server/deploy/deploy-io.ts`:
  - `deploys.baseline({ projectId, siteId, userId, except })` → `{ version, content_manifest }` of the newest row with
    status `uploaded` or `live`, `created_at` desc, the job's own deploy excepted (Ruled value 1);
  - `liveTheme({ siteId, userId, name, route })` → the chokepoint's `call` with `kind: 'staff'`, `read: 'theme_download'`,
    `path: downloadPath(name)`;
  - `artifacts.put` gains an overwrite (upsert) for the live copy's fixed key.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/route.ts`:
  - POST takes `overwrite` (a boolean or absent);
  - `ship` answers 409 `Drift found` when the row's `stage_timings.drift?.kind === 'found'` and `overwrite !== true`;
  - it hands `overwrite` to `ship()`.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/live/route.ts` (new) -- GET `?job=`:
  - the job read is the caller's (as the poll reads it), its project this one, and its drift record `found`, else 404;
  - sign `{projectId}/live/{siteId}.zip` in `deploy-artifacts` for 60 s with `download: {theme}-live.zip`, and answer 303;
  - `NoSuchKey` → 404; any other signing failure → 502;
  - add it to `server-wiring.test.ts`' service-role list, with the reason (the bucket has no policy, AD-29).
- [ ] `apps/web/components/editor/deploy-wizard.tsx` -- D3, built from the frame (R-74):
  - **D3a, while `stage === 'awaiting_ship'` and the record is `found`:**
    - the view is 600 wide, with D3a's heading and body in place of S8b's;
    - the "Comparing with your live theme" row carries its "{n} files differ" chip, the marigold mark and the frame's
      bordered list. The list has Changed / Added on your site / Removed from your site group headers, each with its glyph
      and count, and only non-empty groups show. Each row has an icon (`LayerThumb glyphOf(category)` for a section
      partial, the frame's file glyph otherwise), a label, and the path in mono beneath;
    - then the routes row, then the footer sentence;
    - then **Cancel** (ghost; closes the wizard; **focused on open**), **Download the live theme first** (secondary, a plain
      link to the live route, the frame's download glyph) and **Overwrite and ship anyway** (Kit `primary`, ink, never coral
      or danger; busy "Shipping…"). Overwrite posts `ship` with the chosen mode and `overwrite: true`;
    - ⌘⏎ never presses Overwrite.
  - **D3b:** the sky row after the check rows and before the routes row: D3b's title, the cause's body, and Add token where
    Design Notes' table says. Add token opens D1b's token view over Pre-flight (B12b's `retoken` pattern; Back returns, focus
    as B12b's). A kept token runs the checks again ("Starting…"). Ship it stays as it is.
  - **D3c:** "Nothing changed on your site since v{n}" in the passes box, second, after the major's line (the frame's order).
  - **While reading:** a running row "Comparing with your live theme…".
  - Each outcome is said once in the polite region (`driftSaid`).
- [ ] `apps/web/app/(app)/app/harness/editor/{layout.tsx,actions.ts}` -- `x-inflozo-harness-drift`:
  - the values: `found`, `clean`, `reading`, `unverified-<cause>` for each cause, and `declined`;
  - the fake ship answers 409 to a ship without `overwrite` while `found`;
  - the fake live route answers a 303 to a tiny zip.
- [ ] `apps/web/drift.test.ts` (new) -- every I/O row this layer owns. Each assertion is first seen red under a planted
  reversion:
  - CRLF;
  - move;
  - ordering;
  - labels (current name, stored name, kind words, the two "didn't write" labels);
  - the words, with no digit outside `n` and the version;
  - `driftSaid`.

  `zip.test.ts`:
  - `zipTheme` → `unzipTheme` round trip;
  - an archiver-shaped zip (data descriptors, directory entries) read right;
  - the cap, ZIP64, method and not-a-zip throw.

  `deploy-run.test.ts`, over the fake io:
  - first deploy and a null manifest: no read;
  - every cause maps;
  - clean, and found with the live copy put before the record;
  - the baseline is the newest `uploaded`/`live` row (a newer Deploy-only upload wins over an older live one);
  - stale + found without `overwrite` rests;
  - Cancel after the read;
  - the manifest is written with the artefact and nulled on reset;
  - `read.bound` is the name asked, not the active theme.

  `deploy.test.ts`: the route's 409 and `overwrite` validation (the route source read, as `lock.test.ts` does).
- [ ] `tools/keyboard/journey.spec.mjs` -- journeys 7.21 (a)–(f). Each new assertion is first seen red at HEAD:
  - (a) D3a: focus on Cancel; the group headers and counts; a renamed layer's current name; the two "didn't write" labels;
    the footer's count word; Download's href;
  - (b) Overwrite sends `overwrite: true` and goes to Shipping; a ship without it is refused (the control);
  - (c) D3b `no_token`: Add token → D1b → Back → D3b; a kept token runs the checks again;
  - (d) D3b `declined`: no link;
  - (e) D3c's row in the passes box, second;
  - (f) the rename field stops at 60, and Save refuses a programmatic 61.

  `floor.spec.mjs`: D3a at 1440 and 390, and D3b at 1440.
- [ ] `tools/probe/record-drift.mjs` (new, §90; VERIFY-AT-BUILD 79) -- `--t1` writes, its local half the default; read
  `record-snapshot.mjs`' shape first. On T1, with a probe theme name, never the active theme:
  - upload the pilot theme zipped by `zipTheme`, download it with the staff token, and compare: **zero differences (the zero
    false positive control)**, with the directory and dot entries Ghost adds named;
  - upload a hand-edited copy (one section partial's text, `custom-handmade.hbs` added, `README.md` removed) under the same
    INACTIVE name: the download shows exactly those three;
  - upload a third copy without a file: it is gone from the download (a full replacement, `storage.js:95-107` executed);
  - one flipped digit → 401; the Admin key → 403; an unknown name → 404 (the controls);
  - delete the probe theme, and put T1 back as found.
- [ ] `tools/probe/run-verify-editor.cjs` -- step 119, production plus T1 writes, put back in `finally`:
  - a throwaway account connects T1 through the wizard with the staff token;
  - (a) the first deploy is **Deploy only**: no drift row;
  - (b) Run checks → D3c "since v1", which proves Ruled value 1;
  - (c) Deploy & activate → Live, then rename a layer → Run checks → D3c (nothing on the site changed);
  - (d) hand-edit T1 as the recorder does, under the bound name → Run checks → D3a with the three rows, Download → 303 → the
    zip holds the edit;
  - (e) a ship POST without `overwrite` → 409 (the control); Overwrite → Live; Run checks → D3c;
  - (f) Casper activated and the `inflozo-…` theme deleted → Run checks → D3b `missing`; Ship it → Live;
  - `finally`: Casper active, `inflozo-*` deleted, the site disconnected, the account deleted.

  `STEP119_PLANT=<email>` runs it as that address and stops after (d)'s plant, for the owner's test.
- [ ] **Propagation**, each a dated note (Story 7.21's Dev). R-287's own targets (FR-J8's (3), EXPERIENCE's
  partial-success item 3, 7.32's and 7.21's cards, the register) landed with the ruling at the Create. Dev ticks the
  register's last target.
  - FR-J16 in `prd.md`;
  - 7.23's card: a rollback or restore that uploads a stored artefact records that upload as the newest accepted one, with
    the artefact's manifest;
  - SCHEMA.sql's `content_manifest` comment, `path → {sha256, fingerprint, layer?, category?}` (a `--` comment: no
    migration);
  - DW-338 `done`;
  - VERIFY-AT-BUILD 79;
  - MEASUREMENTS §90;
  - EXPERIENCE's Drift Report row (`:190`) and its D3b word corrections.

  End by grepping for "baseline does not move" and "last put live".

**Acceptance Criteria:**
- Given a deploy after the first, when its Check step finishes, then the wizard matches the frame: D3a `:28-151`, D3b
  `:157-203` or D3c `:206-225`, with S8b's inherited rows unchanged (R-74).
- Given a stored artefact, when its row is read, then `content_manifest` holds every file of the zip that was uploaded, and
  no emitted file contains a fingerprint, id or hash (FR-J1; the compile's existing fingerprint scan stays green).
- Given the pilot theme uploaded to T1 by Inflozo and downloaded again, when the two manifests are compared, then there are
  zero differences (§90).
- Given D3a, when it appears, then focus is on Cancel. Neither Enter on open nor ⌘⏎ overwrites, and Overwrite and ship anyway
  is the only control that sends `overwrite: true` (UX-DR14).
- Given D3a, when Download the live theme first is followed, then the browser receives a 303 to a signed URL that serves the
  zip read at this check, named `{theme}-live.zip`, and no function body carries its bytes (AD-13).
- Given any outcome, when it lands, then the polite region says it once (UX-DR12). Overwrite reads "Shipping…" with
  `aria-disabled` + `aria-busy` while the request is out (R-98; `busy.test.ts` green).
- Given the Layers rename field, when a name past 60 characters is typed or pasted, then the field holds 60 and the rule
  refuses a longer one (DW-338).
- Given Question 1, when the owner rules, then Ruled value 1 holds his option, and the documents in the propagation task say
  the same (R-83, standing rule 3).

## Spec Change Log

## Design Notes

**Ruled value 1 — the baseline (Question 1, ruled option 1, R-287, owner, 2026-11-24).** This project's newest `deploys` row
to this site with status `uploaded` or `live`, ordered by `created_at`, other than the job's own. Every upload Ghost accepted
is one of these (`demote` writes `uploaded`). A Deploy only upload and an upload whose activation failed both count, because
`storage.js:95-107` replaces every file under the name.

**Why the fingerprint is the layer's id.** The live theme carries no fingerprint (FR-J1), so live files can only be matched
to the baseline by path or by content.
- **A rename shows no drift because of the baseline,** not the fingerprint. A rename changes what Inflozo uploads next, never
  what is on the site.
- **The fingerprint names the row.** Through the layer's id, a changed partial is labelled with the layer's name today.
- **Content identity drops a moved file.** A removed and an added path with one hash are the same file.

ponytail: `found` is read at Pre-flight only, so a hand edit made between Run checks and Ship it is missed. The window is
minutes, and catching it would add a second download to every ship. Re-read at Ship it if it matters.

ponytail: an upload Ghost accepted whose binding then lost a race (`bind` → `taken`, `run.ts:525`) is marked `failed`, so
it is not a baseline. That case is a concurrent first upload, which Story 7.25's advisory lock removes.

**The live copy** is one object per project × site, `deploy-artifacts/{projectId}/live/{siteId}.zip`, overwritten by each
found drift. It is bounded by construction and outside 7.22's count. It is drained with the project's prefix at account purge
(`purge-rule.ts`' `deploy-artifacts/{projectId}/`).

**Labels (never a raw path as the label):**

| File | Label |
|---|---|
| `partials/sections/**` | the layer's current name, else the manifest's `layer` |
| a root `.hbs` Inflozo wrote | `fileLabel(file, names)` (its canvas: "Home", "Post"…), else "Template" |
| `partials/content-cta.hbs` | `fileLabel`'s, else "Paywall" |
| other `partials/*.hbs` | "Shared part of your sections" |
| `*.css` | "Stylesheet" |
| `*.js` | "Script" |
| `*.woff2` | "Font" |
| an image | "Image" |
| `package.json` | "Theme settings" |
| `locales/*.json` | "Translations" |
| `README.md` | "Read me" |
| an added `.hbs` | "A template Inflozo didn't write" |
| any other added file | "A file Inflozo didn't write" |

**Words (`DRIFT_WORDS`).**
- **D3a:**
  - the title "Something changed on your site since we last shipped.";
  - the body "We compare what's live against what we put there. These files are different — someone edited the theme in
    Ghost, or another tool did.";
  - the row "Comparing with your live theme", its chip `{n} file(s) differ(s)`;
  - the groups "Changed", "Added on your site", "Removed from your site" (shown in caps by style);
  - the footer `Shipping replaces {all n | it} with Inflozo's version(s). Take a copy of the live theme first if you want to
    keep those edits.` The number word comes from the list: "both" for 2, "all three" … "all ten" up to 10, numerals above;
  - the buttons "Cancel", "Download the live theme first", "Overwrite and ship anyway".
- **D3b:** the title "Couldn't check whether your live theme changed." Each cause's body ends "Shipping anyway.":

  | Cause | Body | Add token? |
  |---|---|---|
  | `no_token` | "We need a Staff Access Token from the site Owner or an Administrator to read the live theme, and this site doesn't have one." | yes |
  | `declined` | "You chose to ship without a Staff Access Token on this site, so Inflozo can't read the live theme." | no |
  | `token_refused` | `SNAPSHOT_WORDS.tokenRefused`'s first clause: "Ghost no longer recognises the Staff Access Token stored for this site." | yes |
  | `role` | "The Staff Access Token stored for this site can't read themes — it needs the site Owner or an Administrator." | yes |
  | `missing` | "{host} no longer has {theme}, the theme Inflozo last put there." | no |
  | `unreachable` | "{host} didn't hand over the live theme{ ({status})}." | no |
  | `unreadable` | "The live theme {host} handed over couldn't be read." | no |

  The link is "Add token" (`KEYS.staff.add`, R-170).
- **D3c:** "Nothing changed on your site since v{n}", with "pass".
- **While reading:** "Comparing with your live theme…".

**Corrections to the frame, by earlier rulings:** "this site" for D3b's "this project" (R-278, as `SNAPSHOT_WORDS` already
says), and "Add token" for "Add the token" (R-170). The frame's `partials/section-hero-1.hbs` paths are illustrative. Real
paths are `partials/sections/{dir}/{slug}.hbs` (Story 7.1's slug rule).

## Owner's manual test

You test as **`umngkmr+drift721@gmail.com`** on the Ghost 6 test site (T1). **Deploy plants the start on your go:** the
account, ghost6 connected with your keys, a project called **Drift test** shipped once and live, and then a hand edit made
on ghost6 behind Inflozo's back. The edit changes one section's file, adds a template called `custom-handmade.hbs` and
removes `README.md`. Deploy fills in the addresses and the section's name. Addresses that need the project's id are written
`<P>`.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the alias and open the link in your inbox. | `umngkmr+drift721@gmail.com` | Projects, with **Drift test**. |
| 2 | `https://app.inflozo.com/projects/<P>` | Editor | Open Drift test, press **Ship it**, then **Run checks**. | — | "Theme compiled", the theme check, then **"Comparing with your live theme…"** for a moment. |
| 3 | the same | Drift report | Wait for the checks to finish. | — | A wider card: **"Something changed on your site since we last shipped."** A "3 files differ" chip, then three groups. **Changed**: the section's own name (the one Deploy names), with its file path in small grey text under it. **Added on your site**: "A template Inflozo didn't write" / `custom-handmade.hbs`. **Removed from your site**: "Read me" / `README.md`. Then "routes.yaml is valid — pass", "Shipping replaces all three with Inflozo's versions…", and **Cancel**, **Download the live theme first**, and a black **Overwrite and ship anyway**. |
| 4 | the same | Drift report | Without clicking, press **Tab** once, then **Shift+Tab** once. | — | Focus starts on **Cancel** (a ring around it). Tab moves to Download, and Shift+Tab returns to Cancel. |
| 5 | the same | Drift report | Press **Download the live theme first**. Open the zip. | — | A zip named `inflozo-drift-test-live.zip` downloads. Inside are `custom-handmade.hbs` and no `README.md`. |
| 6 | the same | Drift report | Press **Overwrite and ship anyway**. | — | "Shipping…", then Shipping and **Live**. |
| 7 | the same | Pre-flight | Close the wizard. Press **Ship it**, then **Run checks**. | — | The ordinary Pre-flight. Among the passing lines, second: **"Nothing changed on your site since v2 — pass"**. No drift card. |
| 8 | the same | Layers | Close the wizard. In **Layers**, open a section's ⋯ → **Rename**. Clear the name and paste the long text, then press Save. | `A very long section name that keeps going well past the sixty character limit` | The field keeps only the first 60 characters, and Save renames the section to them. |
| 9 | the same | Pre-flight | Press **Ship it**, then **Run checks**. | — | Still **"Nothing changed on your site since v2 — pass"**. A rename changes nothing on your site, so it is never drift. |
| 10 | `https://ghost6.inflozo.com/ghost/` | Ghost Admin | **Settings → Design & branding → Change theme**: activate **Casper**, then delete the `inflozo-drift-test` theme. | — | Casper is active; the Inflozo theme is gone. |
| 11 | `https://app.inflozo.com/projects/<P>` | Pre-flight | Back in Inflozo, press **Ship it**, then **Run checks**. | — | A blue row: **"Couldn't check whether your live theme changed."** "ghost6.inflozo.com no longer has inflozo-drift-test, the theme Inflozo last put there. Shipping anyway." Ship it is **not** greyed. |
| 12 | the same | Ship | Press **Ship it**. | — | Shipping, then **Live**. The theme is back on ghost6. |
| 13 | `https://ghost6.inflozo.com/ghost/`, then `https://app.inflozo.com/sites` | Cleanup | In Ghost: activate **Casper** and delete `inflozo-drift-test`. In Inflozo: ⋯ → **Disconnect** on ghost6. | — | T1 is back as it was, and Inflozo holds no key of yours. |

**Not in this test:**
- The token causes (no token, a refused token, a declined site). Changing the token on T1 would break the test kit's keys,
  so journeys 7.21 (c) and (d) prove those rows.
- "Deploy only" as the baseline. Walk step 119 (a)–(b) proves it.

## Questions for the owner

Question 1 was ruled option 1 by the owner on 2026-11-24 (R-287). None is open. Ruled value 1 in Design Notes holds it.

### Question 1 — After a "Deploy only", what does the next check compare with?

**In plain English.** The drift check compares the theme on your site with Inflozo's own record of what it put there. In
October the rules said: when a theme is uploaded but not made live ("Deploy only", or an activation Ghost refused), that
record does **not** move, because "drift compares against what Inflozo last put **live**" (FR-J8, consequence 3). But the
check reads Inflozo's theme **by its name**, and Ghost's own code replaces every file under that name on every upload, live
or not (read in Ghost 6.58.0's source, `storage.js`). So after a Deploy only, the theme on your site is the new upload, while
the record would still be the older live one.

**An example.** You ship v1 with **Deploy only**, to look at it in Ghost before making it live. Nobody touches it. Next week
you change a heading and run checks for v2.
- **With option 1,** Inflozo compares your site with v1, the files it put there. You see "Nothing changed on your site since
  v1 — pass", and if someone had edited v1 in Ghost, the check would catch it.
- **With the October rule,** v1 never went live, so there is nothing to compare with. The check is skipped, and an edit to v1
  would be overwritten without a word.
- **Worse, with the October rule:** if an older version of this project had once been live (say v1), and v2 was then
  uploaded with Deploy only, the v3 check would compare your site (v2's files) with v1's. It would report Inflozo's own
  v2 changes as "Something changed on your site", which breaks the "never a false alarm" rule.

1. **(RECOMMENDED) Compare with the newest upload Ghost accepted, live or not.** This matches what is on your site, file for
   file, and keeps "never a false alarm". FR-J8's consequence 3 and the same sentence in EXPERIENCE and Story 7.32's card are
   corrected to say so. Nothing else about Deploy only changes: it is still not live, has no active badge and sends no
   email.
2. **Keep the October rule: compare with the newest LIVE deploy only.** The check is skipped when this project never went
   live there. After a Deploy only that followed a live version, it may show Inflozo's own changes as edits.

**Ruled: option 1 (owner, 2026-11-24) — R-287.** *"1"*, which is *"Compare with the newest upload Ghost accepted, live or
not. This matches what is on your site, file for file, and keeps 'never a false alarm'."*

## Verification

R-82's real services for this story:
- **T1** (`ghost6.inflozo.com`), all on the owner's in-session go and put back:
  - the recorder's probe-theme uploads, downloads and delete;
  - walk step 119's deploys, hand edit, activation and deletes;
  - Deploy's plant;
- production **Supabase**: `deploys.content_manifest` written and read; `deploy-artifacts/{projectId}/live/…` written and
  signed;
- **Vercel** (`app.inflozo.com`).

Ghost 5's half goes to DW-326 (R-238). There is no migration, so there is no Schema phase, and the RLS gate is unchanged.

**Commands:**
- `pnpm check` -- expected: green, with the new `drift`, `zip`, `deploy-run`, `deploy`, `compile`, `slug` and
  `section-runtime` cases among each package's own printed count.
- `pnpm keyboard` -- expected: green, with journeys 7.21 (a)–(f) and the floor's D3a/D3b widths passing, and 7.18–7.20a's
  journeys unchanged. Each new assertion is first seen red at HEAD.
- `node --experimental-strip-types tools/probe/record-drift.mjs` (the local half) -- expected: every row PASS, and `--help`
  exits 2 without touching T1.
- `node --experimental-strip-types tools/probe/record-drift.mjs --t1` (keys read in-process by name; the owner's
  in-session go) -- expected:
  - the clean round trip shows **zero differences**;
  - the hand-edited copy shows exactly one changed, one added and one removed file;
  - the third upload drops its file;
  - 401, 403 and 404 on the controls;
  - the probe theme deleted, and T1's active theme as found.

  Any other answer stops Dev (Ask First).
- `node tools/probe/run-verify-editor.cjs` from a clean worktree at the deployed sha (the owner's in-session go) --
  expected: step 119 PASS (a)–(f), its `finally` leaving Casper active, no `inflozo-*` theme on T1, and the throwaway account
  gone; steps 113–118 unchanged.
- `bash supabase/tests/run-rls-gate.sh` -- expected: green and unchanged (no migration).
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.
- `grep -rn --exclude=.env -e 'baseline does not move' -e 'last put \*\*live' -e 'baseline unmoved' apps tools _bmad-output/planning-artifacts _bmad-output/implementation-artifacts/epic-7-context.md`
  -- expected: only dated notes that record the old wording. The record documents keep theirs.
