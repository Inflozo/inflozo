---
title: 'Story 7.17 — Uploading `routes.yaml`, and the guided fallback'
type: 'feature'
created: '2026-10-18'
status: 'in-review'
baseline_commit: '2fa1efe2a64aa08f2e5f499e0bc2460dfdc0c3c7'
owner_test: pending
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, when you ship a site (Ship it arrives in Story 7.18), Inflozo uses your Staff Access Token to put your
routing onto your Ghost site itself (your collections, channels and custom routes), then reads it back to check that Ghost
holds exactly that file. When it can't (there is no token, the token has stopped working, or the token belongs to a staff
account below Administrator), Routes & Templates and the site's card on Sites show a card called "Upload routes.yaml
yourself": you download the file, upload it in Ghost and press **Verify upload**. Also, an editor left open in another tab
of the same browser now takes in a template you make or delete on Routes & Templates, without saying "This project was
changed somewhere else".

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:**
- **Nothing uploads `routes.yaml`.**
  - `saveRoutes` stores the file in `routes_config.yaml` (`routes/actions.ts:99`), and no product code reads it.
  - The chokepoint sends JSON only (`ghost-admin/index.ts:410`, `:447`; DW-51).
  - `call` decrypts only the Admin key (`:344`).
  - Nothing writes `sites.routes_last_offered` (`site-health.ts:80-83`).
- **B16 is built nowhere.** `apps/web/` contains no `B16`.
- **Story 7.17's card leaves four readings to this story:**
  - FR-I4's "a non-Owner connection" against FR-C1's "an Administrator's token carries everything" (`prd.md:202`, `:350`;
    `epic-7-context.md:662`);
  - what a site that is already routed receives when the project's routing is Ghost's default;
  - whether to upload an unchanged file again, given that Ghost 6 keeps a dated copy of the file on every upload;
  - FR-I5's two routes emitted on demand. No library design links to either, and FR-F8 (owner, 2026-09-03) says a link
    to such a page is typed by the customer.
- **FR-I5's lint is not built.** Nothing refuses a module that binds ⌘K, or a `{{ghost_head}}` that carries an argument.
- **The README has no routes step** (`compile.ts:1186-1203`). DW-346 leaves that step to this story.
- **The routes page has three deferred items:** DW-366, DW-367 and DW-370.
- **Ship it does not exist until Story 7.18,** so no product path deploys anything yet.

**Approach:**
- **One routes step: a pure rule and a server shell.**
  - `routesToOffer` picks the file (Question 2), and `routesAnswer` reads Ghost's answer.
  - `offerRoutes` reads the live bytes, and skips the upload when Ghost already holds that file.
  - Otherwise it uploads the file with the site's Staff Access Token, as `multipart/form-data`, through the chokepoint.
  - It reads the file back byte for byte with the same token, then writes the site's routes state.
  - Story 7.18's Ship it calls this step after activation (Question 1).
- **The chokepoint:**
  - passes a `FormData` body through untouched (DW-51's transport, landed here because this is its first multipart
    write);
  - returns the answer's raw bytes;
  - lets `call` take the kind of credential.
- **B16, built from the frame,** with F3's three causes.
  - It shows on Routes & Templates and on the Sites card for as long as the site still needs its routing.
  - **Verify upload** reads the live file with the Admin key and compares bytes.
- **One migration,** `sites.routes_fallback` (the cause), pushed first and alone as the Schema phase (R-99).
- **FR-I5's lint,** in `modules.ts` and `checkGhostMarkup`.
- **The README's routes step.**
- **The three deferred items:** DW-366 is Question 4, DW-370 is Question 5, and DW-367 is a routine call.
- **Questions 1 to 5 were all ruled option 1 by the owner (2026-10-18), R-254 to R-258.** The ruled values live in one
  table (Design Notes, "Ruled values"). No question is left open.

## Boundaries & Constraints

**Always:**
- **Frame (R-74).** Build from `B Missing Surfaces.dc.html` **B16** (`:1229-1270`), as EXPERIENCE corrects it
  (`EXPERIENCE.md:742`; F3 `:1082-1127`):
  - the 600px card and its header tile and icon;
  - three numbered steps, the first carrying the file chip;
  - the footer: a primary button, a secondary button and a footnote;
  - the frame's tokens.

  The no-token case uses the frame's copy verbatim. The revoked and role cases change only the body, the secondary
  button and the footnote (Design Notes, "Words"). It is a card. It is never a toast or a `Banner` (F3 `:1124`). It
  sits where B15 does: as the last child of the site's card on Sites (`site-notices.tsx`), and at the top of Routes &
  Templates.
- **One rule, one list.**
  - Only `routesToOffer` and `routesAnswer` (pure, `apps/web/lib/routes-upload.ts`) decide the file and the cause.
  - `offerRoutes` is the only uploader.
  - Every sentence lives in `ROUTES_FALLBACK_WORDS` (R-170).
- **Ghost's semantics, read in source (Design Notes, "Facts").**
  - An upload is validated before it is stored, is stored as sent, and is live at once (F2).
  - Only an Owner's or an Administrator's token may write it (F3).
  - A refused upload stores nothing.
- **The same credential reads it back** (FR-I4). The read-back uses the staff token that uploaded, and compares raw
  bytes, never decoded text.
- **AD-10.**
  - Every Admin call goes through `apps/web/server/ghost-admin/*` as `routes_upload` (`admin-rule.ts:123`), with its
    audit row.
  - Every new importer is named in `server-wiring.test.ts`, with its reason.
- **AD-36.**
  - The file goes to Ghost as the bytes `routesYaml` emitted from a config that `validateRoutes` accepts. It is never
    spliced together again.
  - The README carries it as an indented code block, which Markdown cannot leave.
  - `ad36.test.ts` gains the README sink's inert-and-legitimate pair.
- **R-98.** **Verify upload** is the Kit's `Submit` with its busy label. No new route is added.
- **R-82, R-238.**
  - The Review and the test run on production and T1 only.
  - Every T1 write needs the owner's go in the Dev session, asked once for the recorder's whole run, and runs in the
    main session.
  - The Ghost 5 half is DW-326's.

**Ask First:**
- **Questions 1–5 were ruled option 1 (owner, 2026-10-18), R-254 to R-258.** The spec is written to them, and the ruled
  values live in one place: Design Notes' "Ruled values".
- The production apply of the migration (R-99) and every T1 write (§85). Each needs a go in that session.
- Any string beyond Design Notes' "Words", and any place for B16 other than its two hosts.

**Never:**
- **Uploading `routes.yaml` without the theme that carries its templates, or from any control except Ship it** (Story
  7.18). There is no "upload now" button. Before 7.18, only the T1 recorder uploads.
- **Building Ship it, Pre-flight, the deploy job or its stages.** Those are 7.18's (Question 1).
- **A `/search/` route, `{{ghost_head exclude=…}}`, or an all-tags or all-authors page** (Question 3).
- **A role read (`GET users/me`).** That is 7.19's. This story reads the role from Ghost's answer.
- **A merge path in the sync route** (Question 5), or any change to `sync_project_doc`.
- Editing `claude-design-export/`, a `record` document or a generated file, or writing a count down.

## I/O & Edge-Case Matrix

F is the project's file, `routesYaml(config)`. "State" means `sites.routes_last_offered`, `routes_live_sha256`,
`routes_verified_at` and `routes_fallback`.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Upload | F, a staff token; the site holds G ≠ F | POST F; GET answers F's bytes → `uploaded`; state F, sha(F), now, null | — |
| Already there | the site holds F | no POST, so Ghost makes no dated copy → `unchanged`; the same state | — |
| No token | `credentials_present.staff` false | no POST → `fallback: no_token`; `routes_last_offered` F, `routes_fallback` `no_token`; B16 on both hosts | — |
| Token stopped working | POST answers 401 | `fallback: revoked`; B16's revoked body and **Update the token** | — |
| Role below Administrator | POST answers 403 | `fallback: role`; B16's role body, with no button | — |
| Ghost refuses the file | POST answers 400 or 422 | `failed: ghost_refused`, with Ghost's message as `detail`; state unchanged | AD-24 envelope |
| Ghost busy or away | 429 or 5xx, or no answer | `failed: ghost_unavailable` / `ghost_unreachable`; state unchanged | — |
| Read-back differs | the GET's bytes ≠ F | `failed: routes_unverified`; state unchanged | — |
| Back to default, Inflozo's file live | no F; live = `routes_last_offered` ≠ Ghost's default | offers Ghost's default (Question 2); then as Upload | — |
| Default, someone else's file | no F; `routes_last_offered` null or ≠ live | `kept`: nothing sent and nothing written | — |
| Default everywhere | no F; live = Ghost's default | `kept` | — |
| Stored routing unfit | `config` fails to parse or `validateRoutes` refuses it, or `yaml` ≠ `routesYaml(config)` | `failed: routes_invalid`; nothing sent | — |
| First read fails | the live read throws or is not 2xx | with F: upload anyway (the read-back decides); without F: `kept` | — |
| Verify, Ghost has it | live bytes = `routes_last_offered` | the card becomes one line, `verified`; `routes_fallback` null, with the sha and the time; gone at the next load | — |
| Verify, not yet | live bytes differ | `notYet` under the steps; the card stays | — |
| Verify, no answer | the read fails | `unreachable`; the card stays; it never claims success | — |
| Daily check | live sha = sha(`routes_last_offered`) while `routes_fallback` is set | `writePlan` clears `routes_fallback` | — |
| ⌘K lint | a module source reading `metaKey`, `ctrlKey` or `getModifierState` | `searchKeyRefusals` names it; `compileTheme` refuses its `main.js` | — |
| Head lint | a `{{ghost_head …}}` carrying any argument | `checkGhostMarkup`'s rule 1 names it | — |
| README | `routes` handed in non-null | `## Routes`, with the sentence and the file indented four spaces; null → no section | — |
| DW-366 | the routing is unreadable; Tutorials List's stored doc flags a17/1 | the flag is kept; Count reads Posts per page; the next edit keeps it. **Control:** a readable routing that does not list the file strips the flag | — |
| DW-367 | `writeListedStart`'s `syncDocs` fails | `listedStartFailed(name)`; the sheet keeps the template it made chosen; Save again writes the grid, then the config | the server writes a starting grid only to this project's template with no doc that no stored route names |
| DW-370 | the editor holds the lock at base r; the routes page moves r → r+1 | the editor takes the docs in and drops the gone templates; base r+1; journal kept; no dialog; the Template menu refreshes. **Control:** a message whose `from` ≠ base is ignored, and the 409 follows as R-253 | a reader tab ignores it |

</frozen-after-approval>

## Code Map

- **The chokepoint.**
  - `apps/web/server/ghost-admin/admin-rule.ts`:
    - `:120-129` `ADMIN_WRITES` (`routes_upload` `:123`, path `/^settings\/routes\/yaml\/?$/`, body unchecked);
    - `:151-164` `permitted`;
    - `:99-107` `mintJwt`, which signs a staff token unchanged (V:193-194: `id:secret` like the Admin key);
    - `headers`, `adminUrl`, `ghostCode` (`:229-244`) and `ghostError`.
  - `apps/web/server/ghost-admin/index.ts`:
    - `:36` `CredentialKind`, `:44-47` `COLUMNS`, `:306-328` `decrypt` (already takes `'staff'`);
    - `:336-364` `call` (`'admin'` hard-coded at `:344`);
    - `:371-484` `fetchWithKey` (`:410` the JSON-only payload, `:447` `Content-Type`, `:478-480` the audit row);
    - `:50-63` `CallResult` (`text` is decoded and `body` is null for YAML).
  - Tests: `apps/web/ghost-admin-rule.test.ts:83` (`routes_upload` permitted). `apps/web/server-wiring.test.ts:425-465` is the
    importer list (`CONNECT_ACTIONS`, `SITE_PROBE`, `SITE_HEALTH`, `KEYS_SCREEN`), and `:470+` holds the `console.error` shapes.
- **Routes state.**
  - `supabase/migrations/20260904120000_complete_schema.sql:164-167` has `routes_last_offered`, `routes_live_sha256` and
    `routes_verified_at`, with the comment "no 'unverified' limbo". It also has `:155-156` `credentials_present` and
    `:357-363` `routes_config` (`config`, `yaml`).
  - `apps/web/server/site-health.ts`:
    - `:71` `ROUTES_PATH`;
    - `:89-108` `readRoutes` (Admin key; it hashes `answer.text`);
    - `:80-83` the comment saying nothing writes `routes_last_offered`.
  - `apps/web/lib/health-rule.ts:151-176` `writePlan` (`:169`).
  - The last migration's shape is `20261016120000_card_designs.sql`, with `SCHEMA.sql`, `RLS-TEST.sql` and
    `supabase/tests/rls.sql` beside it (commit `4ded429c`).
- **Routing.**
  - `packages/section-runtime/src/routes.ts`:
    - `:452-495` `yamlLines`;
    - `:497-506` `isDefaultRouting` and `routesYaml` (null at the default, one trailing LF);
    - `:244-249` `parseRoutesConfig`;
    - `:543-596` `validateRoutes`;
    - `:195-218` `RESERVED_SEGMENTS` (`search` at `:218`, so `/search/` has been held since 7.16a);
    - `:696-698` `listsOf(null)`.
  - `apps/web/app/(app)/app/(authed)/projects/[id]/routes/`:
    - `actions.ts` — `:21-22` the header, `:92-106` `writeConfig`, `:110-143` `insertTemplate`, `:151-163`
      `writeListedStart`, `:175-194` `syncDocs`, `:203-238` `saveRoutes` (`:223-227` DW-367's branch), `:264-308`
      `deleteTemplate` and `:320-366` `restoreTemplate`;
    - `page.tsx` — `:54`, and `:58` the linked site's read (add `routes_fallback`, `routes_last_offered`), and `:80` the
      pane;
    - `routes-manager.tsx` — the calls at `:136` (save), `:149` (`undoNow`), `:176` (`dropTemplate`) and `:844` (the
      sheet), plus `:811-813` and `:843-848` (the re-save path);
    - `apps/web/lib/routes.ts` — `:149` `couldNot` and `ROUTES_WORDS`;
    - `apps/web/routes.test.ts:129-226`, which holds these call shapes by regex.
- **B16's hosts and Kit.**
  - `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx` (`:32-37` "B15 IS NOT A BANNER", `:215` B15's block) and
    `lib/probe-rule.ts` `PREVIEW_COPY`. This is the pattern to follow.
  - `apps/web/lib/connect-rule.ts`:
    - `:532` `keysPath`;
    - `:351-375` `KEYS.staff`;
    - `:401-402` `routesWithToken` / `routesWithoutToken`.
  - `sites/actions.ts` — an allowed importer; `:1278` carries a stale endpoint comment.
  - `components/kit/`:
    - `button.tsx` (primary, secondary);
    - `submit.tsx` (`Submit`, `busy`);
    - `icons.tsx`, which has no square-arrow or download icon, so add both verbatim from the frame.
- **Lints and README.**
  - `packages/library/src/modules.ts:359` `moduleKeyRefusals` (the pattern) and `modules.test.ts`.
  - `packages/library/modules/core.js`, the only module, which binds no key.
  - `packages/theme-compiler/src/compile.ts`:
    - `:447-464` `checkGhostMarkup` (rule 1 counts `{{ghost_head}}` by name);
    - `:106-164` `CompileInput` (`routed` `:116`, `lists` `:122`);
    - `:1186-1203` the README.
  - `tools/pilot-theme.mjs:313` `themeFailures` (it refuses the builder's name in any file).
- **DW-366.**
  - `.../(editor)/read.ts` — `:337-341` `routes`, `:166-167` and `:426` `designateAll`.
  - `editor.tsx` — `:855` `listed`, `:1003` `designated`, `:868` `mainRole`.
  - `packages/section-runtime/src/main-feed.ts:69-73` `designate` (it strips every flag off an unlisted file).
  - `packages/library/src/vocabulary.ts:194`, `:206-207` (`Listed`, `isPaginated`).
- **DW-370.**
  - `apps/web/lib/journal.ts`:
    - `:428-445` `SENT_CHANNEL`, `SentMessage`, `isSentMessage` (the precedent);
    - `:509-510` `hydrationFor`;
    - `:563-578` `ownFlushLanded`.
  - `editor.tsx`:
    - `:2134-2158` `heardSent`, which adopts a revision with no hydrate;
    - `:2049-2057` the 409;
    - `:2093-2100` the `left` path (`withoutDoc`, the move to Home);
    - `:6507-6540` the conflict dialog;
    - `:4125-4238` the hydrate;
    - `:1346` `base`;
    - `:1738-1756` `store`;
    - `:2004` (a reader never flushes).
  - `projects/[id]/sync/route.ts:193-223`.
  - `lib/lock-client.ts:74-100` `lockSignals`.
  - AD-15 at `ARCHITECTURE-SPINE.md:207-215` (R-253's rule is `:215`).
- **Probes.**
  - `tools/probe/record-routes.mjs`:
    - `:261-298` `ghost(env)`;
    - `:276-282` `yamlGet` / `yamlPost`, the FormData shape DW-51 names;
    - `:313-316` the original saved first;
    - `:400-410` the restore in `finally`.
  - `tools/probe/run-verify-editor.cjs` — step 111 is at `:10697`, the header at `:300`, and step 112 goes after it.

## Tasks & Acceptance

**Execution:**
- [x] **Schema, pushed first and alone (R-99):**
  - `supabase/migrations/20261018120000_routes_fallback.sql`, `SCHEMA.sql`, `RLS-TEST.sql` and `supabase/tests/rls.sql`.
  - `sites.routes_fallback text`, nullable, `check (routes_fallback in ('no_token','revoked','role'))`, commented with
    FR-I4 and F3. `authenticated` keeps its table-wide select and gains no write.
  - The RLS gate is green, with a control that withholds the migration.
  - Apply it to production through the pooler on the owner's go in that session, and read it back.

  -- the cause B16 names (routine call 8).
- [x] `admin-rule.ts`, `ghost-admin/index.ts`, `ghost-admin-rule.test.ts`, `server-wiring.test.ts`:
  - `adminRequest({ credential, siteUrl, method, path, body, major })` → `{ url, init }`. It is pure, it is the one request
    builder, and `fetchWithKey` uses it. A `FormData` body passes untouched with no `Content-Type`.
  - `CallResult.bytes` holds the answer's raw bytes (`text` is decoded from them).
  - `call` takes `kind` (default `'admin'`).

  Tests:
  - a `FormData` body leaves with no `Content-Type` of Inflozo's own;
  - a JSON body is unchanged (**control**);
  - `kind: 'staff'` decrypts `staff_token_vault_ref`.

  -- DW-51's transport.
- [x] `apps/web/lib/routes-upload.ts` + `routes-upload.test.ts` (pure, AD-1):
  - `GHOST_DEFAULT_ROUTES`: F4's bytes, with its sha asserted in the test;
  - `routesToOffer({ project, live, lastOffered })`;
  - `routesAnswer(status, ghostType)`;
  - `routesWrite(outcome, file)`, the state each outcome writes;
  - `bytesEqual`;
  - `sizeLabel`;
  - `ROUTES_FALLBACK_WORDS`.

  Every matrix row from Upload to First read sits behind its control. -- one rule (Question 2).
- [x] `apps/web/server/routes-upload.ts`:
  - `offerRoutes({ projectId, siteId, userId, route })` runs, in order:
    1. read `routes_config`, the project's templates and the site row;
    2. check the stored routing (matrix, "Stored routing unfit");
    3. read the live file (staff token if present, else the Admin key);
    4. `routesToOffer`;
    5. POST through `call({ kind: 'staff', item: 'routes_upload' })`;
    6. read it back with the staff token;
    7. `routesWrite`.
  - `verifyRoutes({ siteId, userId, route })` reads with the Admin key and compares the bytes to `routes_last_offered`.
  - `server-wiring.test.ts` names this file. Tests over an injected `call` hold the order and every outcome.

  -- the step Story 7.18 calls (Question 1).
- [x] `server/site-health.ts`, `lib/health-rule.ts`, `health-rule.test.ts`: `writePlan` clears `routes_fallback` when the live
  sha equals that of `routes_last_offered`. **Control:** it is left alone when the sha differs.
- [x] **B16:**
  - `apps/web/components/routes-fallback.tsx` — the card per the frame and Design Notes' "Words".
    - The download is `<a download="routes.yaml" href="data:application/yaml;charset=utf-8,…">`, with its size from
      `sizeLabel`.
    - "Show me where ↗" goes to `GHOST_ROUTES_HELP`.
    - **Add the token instead** and **Update the token** go to `keysPath(siteId)`.
    - **Verify upload** is a form calling `verifyRoutesAction` in `sites/actions.ts`, and shows its result line.
  - `components/kit/icons.tsx` — the frame's two icons, verbatim.
  - Mount it in `sites/site-notices.tsx` (with `routes_fallback` and `routes_last_offered` added to the list page's site
    read) and at the top of `projects/[id]/routes/page.tsx`, for the linked site.
  - `busy.test.ts` holds Verify.

  -- F3, R-74.
- [x] **Lints** (`modules.ts`, `modules.test.ts`, `compile.ts`, `compile.test.ts`):
  - `searchKeyRefusals(sources)` names a module source that reads `metaKey`, `ctrlKey` or `getModifierState`.
    `compileTheme` refuses a theme whose `main.js` it names.
  - `checkGhostMarkup`'s rule 1 refuses a `{{ghost_head}}` that carries any argument.
  - Each sits behind its control: `core.js` passes, and so does a plain `{{ghost_head}}`.

  -- FR-I5's lint, on the emitter.
- [x] **README** (`compile.ts`, `compile.test.ts`, `ad36.test.ts`):
  - `CompileInput.routes?: string | null`, which 7.18 hands in.
  - When it is non-null, `## Routes` follows `## Styles`: the sentence, then the file, every line indented four spaces.
  - When it is null, no section (**control**).
  - `themeFailures` passes, with no builder name.

  -- DW-346's routes step.
- [x] **DW-366** (`main-feed.ts`, `read.ts`, `editor.tsx`, tests):
  - `flaggedListing(docs)` lists the Routes Manager files whose stored doc flags a main feed.
  - When the routing is unreadable, `read.ts` passes `designateAll` that listing and hands it to the editor as
    `EditorData.unreadListed`.
  - The editor's `listed` becomes `new Map(files.map((f) => [f, []]))`, so the Count falls back to Posts per page.

  -- Question 4.
- [x] **DW-367** (`routes/actions.ts`, `routes-manager.tsx`, `lib/routes.ts`, `apps/web/routes.test.ts`):
  - When the starting grid fails, `saveRoutes` answers `{ error: listedStartFailed(name), made: file }`.
  - The sheet then shows the template it made as its chosen template, and sends `start_file` on its next Save.
  - The server writes `listedStart` first, and only to this project's template that has no `project_templates` row and
    that no stored route names; then it writes the config.
  - **Control:** an existing template chosen in the ordinary way is left as it is (7.16c's routine call 2).

  -- routine call 6.
- [x] **DW-370** (`lib/journal.ts`, `routes/actions.ts`, `routes-manager.tsx`, `editor.tsx`, `journal.test.ts`,
  `routes.test.ts`):
  - `journal.ts` gains `MOVED_CHANNEL(projectId)`, `MovedMessage` (`{ from, to, docs, gone }[]`), `isMovedMessage`, and
    `takeMoves(base, moves)`, a pure function that applies the moves in order from the base the editor holds.
  - `syncDocs` answers `{ from, to }`. Every result of the routes page carries `moved`, an error result included when an
    earlier write moved the revision. The page posts `moved`.
  - The editor that holds the lock listens beside `heardSent`, and for a message from its own base:
    - takes the docs in as the server judged them;
    - drops each gone key through the `left` path;
    - `store()`s;
    - calls `router.refresh()`;
    - closes a conflict dialog that came first, and flushes again.
  - The spine's AD-15 gains Question 5's rule.

  -- Question 5.
- [x] `tools/probe/record-routes.mjs --upload`: §85, run in the main session on the owner's go (Design Notes, "T1"). --
  standing rule 1 for F2–F4, and R-82. *(Dev, 2026-10-18: built by the subagent; run on T1 in the main session on the owner's go, Question 7 — every row held, §85 written.)*
- [x] `tools/probe/run-verify-editor.cjs`: step 112 (Design Notes, "Walk"), which the Review runs. -- R-82.
- [x] **Propagation** (standing rules 3 and 7):
  - **`prd.md`, dated notes on:**
    - FR-I4: the role reading, B16 for "the guided Labs card", Question 2, the skip, Verify with the Admin key, and the
      transport;
    - FR-I5: Question 3, and the lints built;
    - `:459`, `:712` and `:845`, which describe a world where only the manual card existed.
  - **`EXPERIENCE.md`:** F3, where NE-S-1 is answered by §37 and the link and hosts are named; and IA row `:202`.
  - **`ARCHITECTURE-SPINE.md`:** AD-15 (Question 5) and AD-10 (the `FormData` transport and `call`'s kind).
  - **`MEASUREMENTS.md`:** §85.
  - **`VERIFY-AT-BUILD.md`:** item 69. Re-read the upload's auth and its 401 and 403 at every major. The 403 for an Editor's
    token is read in source only.
  - **`deferred-work.md`:**
    - DW-51: the transport is done here, and 7.18 proves the theme upload;
    - DW-366, DW-367 and DW-370 close;
    - a new entry for anything left.
  - **`epics.md`:** 7.35's card gets a dated note that the automatic upload is primary. (7.18's card, with Question 1's moved
    items and `routes` beside `routed` and `lists`, 9.12's card with Question 3's, and the Epic 7 and Epic 9 preambles' lists
    were written when the owner ruled, R-254 and R-256.)
  - **`reconcile-designs-decisions.md`:** tick R-254 to R-258's Dev targets.
  - **`epic-7-context.md`.**
  - **Comments:** `sites/actions.ts:1278`, `site-health.ts:80-83` and `routes/actions.ts:21-22`.
  - **Finish with greps:** `git grep -n "Labs card"` and `git grep -n "non-Owner"`. Every hit that remains carries the dated
    reading.
- [x] Run `python3 tools/doc-audit.py --check` twice, then `pnpm check`, `pnpm keyboard` and `pnpm build`.

**Acceptance Criteria:**
- **Matches the frame (R-74).** Given each cause planted on production (Walk), when Routes & Templates and Sites are drawn
  at 1440, then B16 on both hosts matches `B Missing Surfaces.dc.html:1229-1270` in components, layout, copy and tokens,
  with only "Words"' changed lines per cause; the Review records the side-by-side check.
- Given T1 and the product's own `adminRequest` with T1's staff token (§85), when the probe file is offered, then it
  uploads and the read-back returns the same bytes; when Ghost already holds a file, then nothing is posted; when the
  project goes back to Ghost's default, then Ghost's default file goes up; and T1's own file is put back byte for byte.
- Given the same POST with the Admin key, when Ghost answers, then it is 403 `NoPermissionError`, the shape `routesAnswer`
  reads as `role`; given a well-formed staff token unknown to T1, then 401, read as `revoked`; and neither one writes.
- Given the editor open in one window and Routes & Templates in another of the same browser, when a template is made,
  deleted or restored there, then the editor takes it in: no "This project was changed somewhere else" appears, nothing it
  owed is lost, and its undo history is kept (Owner's manual test).
- Given the card, when **Verify upload** is pressed, then it reads "Verifying…" and is `aria-busy` and `aria-disabled`
  until the answer lands (R-98).

## Spec Change Log

- **Dev, 2026-10-18 — the step's real `io` is its own file, `server/routes-io.ts`.** `server/routes-upload.ts` takes `io` handed
  in (`site-settings.ts`'s shape): `node --test` cannot resolve the app's `@/` alias, and the step then reaches neither the
  service role nor the chokepoint — `routes-upload.test.ts` and `server-wiring.test.ts` hold both. So `server-wiring.test.ts`
  names `routes-io.ts` on its two importer lists, with its reason, where the Tasks say "names this file".
- **Dev, 2026-10-18 — the README sink's AD-36 pair is in `compile.test.ts`, not `ad36.test.ts`** (Boundaries' AD-36 bullet and
  the README task name the latter). `packages/section-runtime` cannot import the compiler, which depends on it — a cycle — and
  every other compile-side AD-36 pair already lives in `compile.test.ts`. The pair is the same: hostile lines stay in the
  indented block and C0 controls other than `\n` are refused (CommonMark ends a line at `\r`); a real `routesYaml` file comes
  back byte for byte. `tools/pilot-theme.mjs` passes `routes` through so `check-snapshots` holds `themeFailures` over a README
  that carries one (and its control: a collection at `/inflozo/` is named).
- **Dev, 2026-10-18 — readings the build needed, each beside its test (routine calls, said to the owner, not asked):**
  - a 403 is `role` only when Ghost's error is `NoPermissionError`; any other 403 (a firewall's) is `ghost_refused`, so a
    customer is never told his token's role is wrong by something that is not Ghost (`routesAnswer`);
  - two failure codes beyond the matrix's: `ghost_redirected` for a 3xx (the chokepoint's own code) and `site_not_found` when
    the project or the site is not the caller's (the owned read comes before any call);
  - a staff token gone from the store between the read and the upload (`credential_missing`) is B16's `no_token`; every other
    chokepoint error (the store, a malformed key, a bad address) is thrown on, for Story 7.18's job to retry (AD-20);
  - Verify with no file offered says `notYet`, and a site that is not the caller's `unreachable` — never a success;
  - an editor flush whose 409 answers a base it has since moved past (a move taken in while the request was out) is sent
    again, never the conflict dialog — the other order of R-258's race;
  - B16's title is an `h3` on a Sites card and an `h2` under Routes & Templates' `h1` (`heading`), and its download link is
    named by step 1's own words and the file chip (`aria-labelledby`) — no new string.
- **Review, 2026-10-18 — the live file is read with the Admin key when the staff token's read fails** (Tasks' step 3 said
  "staff token if present, else the Admin key"). A token that had stopped working was taken for an unreadable site: a file
  Ghost already held was offered, met the 401 and stored `revoked`, so B16 would ask for a hand upload of a file Ghost has;
  and back at the default, Inflozo's own file was `kept` with no cause stored. The Admin key reads `routes.yaml` on both
  majors (§37). The matrix's "First read fails" row now means both reads failed.
- **Review, 2026-10-18 — `routesForm(file)` is the one upload body** (`lib/routes-upload.ts`): `offerRoutes` and
  `record-routes.mjs --upload` both call it. The recorder had copied the two lines while claiming `offerRoutes`' body; §85's
  run used that copy, which builds the same form, so T1 is not re-run (no §85 row changes).
- **Review, 2026-10-18 — DW-370's editor, three additions the layers found** (AD-15 carries them): a move from the revision
  the editor's own save is landing at, heard before that save's answer, is held until the answer sets the base, then taken
  (`heldMoves`) — the third ordering of the race, which met R-253's dialog; a doc the editor still owes an edit to keeps the
  editor's own and is sent from the new base (the AC's "nothing it owed is lost"), and only a Routes Manager canvas is ever
  taken in; and a routes-page SUCCESS that wrote no doc is told with no moves, so the editor re-reads its Template menu and
  routing — "+ New template", a config-only save, the delete of a template with no doc (the AC's "a template is made,
  deleted or restored"). Walk step 112i walks the two races on a held sync request and the doc-less template.
- **Review, 2026-10-18 — B16's list and link.** The steps' `<ol>` carries `role="list"` (Safari drops a list's semantics
  under `list-style: none`; B15's beside it too), and "Show me where ↗" says "(opens in a new tab)" to a screen reader, as
  C3b's link does. No visible string changes.
- **Review, 2026-10-18 — accepted as built, recorded here:** the README sink's AD-36 pair lives in `compile.test.ts` (Dev's
  entry above: the runtime cannot import the compiler), and README's heading and sentence live in `compile.ts` for the same
  reason a core package reads no app's word list — `check-snapshots` now holds README's guide address equal to
  `GHOST_ROUTES_HELP`, its control a different address FAILing. `routesWrite` takes `(outcome, at)`: the file travels in the
  outcome (the Tasks wrote `(outcome, file)`).
- **Dev, 2026-10-18 — DW-371 (new, Story 7.18's).** The matrix rules a read-back that differs or fails `failed:
  routes_unverified` with the state unchanged, so EXPERIENCE F3's *could not verify* state has no card; 7.18's Ship it says it
  at its ending, or puts a stored cause to the owner.

## Design Notes

### Rulings this spec is written to

- **R-74.** The frame is B16. **R-170** sets one list for the words. **R-98** sets busy. **R-82** and **R-238** set the
  test servers.
- **R-99** sets the Schema phase. **R-81** sets one commit per phase.
- **R-24** and **R-25** come from FR-I5: no `/search/`, and the two routes on demand. **FR-F8**'s link rule is the
  owner's, from 2026-09-03.
- **R-253** (7.16c's Question 2) is what Question 5 builds on.
- **F-063** (`reconcile-designs-decisions.md:1329`): an Administrator's token suffices. **F-077:** the backup gate's
  downloads need the staff token.
- **R-254 to R-258** are this story's own five rulings (Questions 1 to 5).

### Ruled values (the one table a ruling changes)

Ruled option 1, all five (owner, 2026-10-18): *"Agree with all recommended."*

| Question | Ruled, and built |
|---|---|
| 1 — where the card is tested, since Ship it is 7.18's (**R-254**) | **Built here; 7.18 calls it.** This story builds the step and B16 on its two hosts. Story 7.18's Ship it runs `offerRoutes` after activation, inside AD-19's lock, and opens B16 at its ending on a `fallback`. The card's hand test moves to 7.18 word for word, and this story's hand test is DW-370's. |
| 2 — the project's routing is Ghost's default, and the site's file differs (**R-255**) | **Ghost's default goes back only over Inflozo's own file**, meaning a live file equal to `routes_last_offered`. A file someone else wrote stays (`kept`). |
| 3 — the all-tags and all-authors pages (**R-256**) | **Moved word for word to Story 9.12**, whose A3 #13 "All 34 tags" is the library's first link to a tag index. Its Create settles FR-F8 against FR-I5. Nothing is built here. |
| 4 — DW-366, an unreadable routing (**R-257**) | **Each template keeps its stored main feed** (`flaggedListing`), sized by Posts per page until the routing reads again. |
| 5 — DW-370's approach (**R-258**) | **The routes page tells an editor open in the same browser what it changed** (`MOVED_CHANNEL`), and the editor takes it in from its own base, keeping its journal. Other devices keep R-253's 409. AD-15 gains the rule. |

### Routine calls, one line each (said to the owner, not asked)

1. **"A non-Owner connection" means a role below Administrator.** FR-C1's own definition (`prd.md:202`), F-063 and F3
   say so, and so does Ghost's source on both majors (F3). FR-I4 gets a dated note.
2. **An unchanged file is not uploaded again.** When Ghost already holds the exact bytes, nothing is posted, so Ghost
   makes no dated copy and Inflozo makes no write.
3. **"The guided Labs card" is B16.** It names no menu path (§33). "Show me where ↗" opens `https://docs.ghost.org/themes/routing/`
   on both majors: Ghost publishes one page, and Ghost 6.58.0 links that page beside its own "Upload routes file" (F6).
4. **Verify upload reads with the Admin key,** as the daily check has done since 3.7. §37 shows the integration key reads
   `routes.yaml` on both majors, which answers F3's NE-S-1. It compares the bytes with what was offered.
5. **DW-51's transport lands here,** because this is the first multipart write. 7.18's theme upload uses it, and the proof
   of that upload stays 7.18's.
6. **DW-367: the refusal says what was left, and the next Save fixes it.** The server re-checks the template before
   writing anything.
7. **`/search/` has been held since 7.16a** (`RESERVED_SEGMENTS`). The step also re-validates the stored routing before
   offering it.
8. **The cause is stored** in `sites.routes_fallback`, because the revoked and role cases cannot be told apart later.
   The migration is pushed first.
9. **The README carries the file as an indented block** and names no builder.
10. **The download is a `data:` link on the card,** so there is no new route and nothing new is stored.

### Words

Every string below is new unless quoted. They live in `ROUTES_FALLBACK_WORDS`, except DW-367's line, which goes in
`ROUTES_WORDS`.

- **No token (the frame, verbatim):**
  - title: "Upload routes.yaml yourself";
  - body: "We normally upload this for you. Uploading a routing file needs a Staff Access Token from the site Owner or an
    Administrator, and this project doesn't have one — so this once you will need to do it by hand. It takes about a
    minute.";
  - steps: "Download the file we generated"; "In Ghost, find the routes upload for your version", with the link "Show me
    where ↗"; and "Come back and press Verify — we check that your collections resolve";
  - buttons: "Verify upload" and "Add the token instead";
  - footnote: "Adding the token makes this automatic from now on."
- **Revoked:**
  - body: "We normally upload this for you, but this site's Staff Access Token has stopped working — so this once you will
    need to do it by hand. It takes about a minute.";
  - button: "Update the token";
  - footnote: "Updating the token makes this automatic again."
- **Role:**
  - body: "We normally upload this for you, but this site's Staff Access Token belongs to a staff account that can't write
    settings. Only an Owner's or an Administrator's token can — so this once you will need to do it by hand. It takes about
    a minute.";
  - no button and no footnote (F3).
- **Verify:**
  - busy: "Verifying…";
  - `verified`: "Ghost has your routes.yaml. Your routing is live.";
  - `notYet`: "Ghost doesn't have this file yet. Upload it, then press Verify upload again.";
  - `unreachable`: "We couldn't reach your site to check. Press Verify upload again in a moment."
- **The size:** "{n} bytes" below 1,024, and "{n.n} KB" from there up, as the frame's "1.4 KB".
- **DW-367:** `listedStartFailed(name)`: "{name} was made, but its post grid wasn't added. Press Save again to add it."
- **README:**
  - heading: "## Routes";
  - sentence: "Ghost keeps this theme's routing outside the theme, in `routes.yaml`. Upload the file below wherever Ghost
    Admin accepts a routes file; Ghost's guide is https://docs.ghost.org/themes/routing/."

### Walk (step 112, production, the Review)

1. **Plant the card.** For the walk's user, plant a `sites` row with an address that answers nothing and no keys, link
   the project to it, set `routes_last_offered` to a three-line file, and set `routes_fallback` to `no_token`.
   - Routes & Templates and Sites both show B16 in the frame's copy.
   - The size is right.
   - The download's `data:` link decodes to the planted bytes.
   - **Add the token instead** goes to `keysPath`.
   - **Control:** with `routes_fallback` null, neither page shows the card.
2. **The other causes.** `revoked` shows its body and **Update the token**. `role` shows its body with no button.
3. **Verify.** **Verify upload** shows its busy label, then `unreachable`. The card stays, and a service read shows
   `routes_fallback` unchanged.
4. **Resolved.** Write what Verify writes (the planted file's sha, and `routes_fallback` null). The card is gone at the
   next load.
5. **DW-370.** Open two pages in one browser context: the editor on Home, and the routes page.
   - Make a collection with a new template. In the editor, ⌘S raises no dialog, and a service read shows the doc saved at
     the moved base. The Template menu lists the new template, with its grid.
   - Delete the template while the editor shows it: the editor moves to Home with `TEMPLATE_GONE`. Undo the delete: the
     template is back.
   - **Control:** stub the routes page's `BroadcastChannel.postMessage`. ⌘S then meets the conflict dialog (R-253).
6. **Clean up.** Users and projects are left unchanged.

### T1 (§85, `record-routes.mjs --upload`, the main session, the owner's go)

1. **Read** T1's `routes.yaml` through `adminRequest` with `GHOST6_STAFF_ACCESS_TOKEN`, and keep its bytes and sha. The
   expected value is F4's, and the file is restored whatever it holds.
2. **No POST.** `routesToOffer` with the project's file equal to T1's live file posts nothing. The leg counts its POSTs.
3. **Upload a probe file.** Offer the `routesYaml` of a probe collection `/inflozo-probe-up/` (a tag filter, the index
   last). The answer is 2xx, the read-back has the same bytes, and the probe's address answers 200, live at once (F2).
4. **Back to the default.** `routesToOffer({ project: null, live: probe, lastOffered: probe })` gives Ghost's default.
   Upload it: the read-back has F4's bytes, and the probe's address answers 404.
5. **Controls.**
   - The same POST with `GHOST6_ADMIN_API_KEY` gets 403 `NoPermissionError` (§39's shape).
   - A well-formed staff token unknown to T1 gets 401.
   - Neither one writes: the read-back is unchanged.
6. **Restore** (`finally`). Put T1's original back and read it back byte for byte. Each upload leaves Ghost 6 a dated copy
   in `content/settings` (F5), and §85 says how many.

### Facts this spec rests on

Read at this Create (2026-10-18) in Ghost 6.58.0's and 5.130.6's source, freshly extracted from the npm tarballs into the
scratchpad. T1 was not touched. Paths are under `package/core/server/`.

- **F1 — the route.**
  - `POST /settings/routes/yaml` runs `upload.single('routes')`, then `upload.validation({type: 'routes'})`
    (`web/api/endpoints/admin/routes.js:89-95`; 5.x `:76-80`).
  - `api/endpoints/settings.js:167-178` has `upload` with `permissions: { method: 'edit' }`. The download is `:180-196`
    (5.x `:150`, `:164`).
- **F2 — validated, stored as sent, live at once.**
  - `services/route-settings/dynamic-routing-service.js:80-97` parses and validates before `store.replace`, then
    `bridge.reloadFrontend`.
  - The download returns `settings.yamlSource` (`:74-78`).
  - `FileStore.js:93` stores the source "rather than the validated schema output".
  - A file that will not parse is a 4xx `IncorrectUsageError` (`yaml-parser.js:44`, `YAML_PARSER_ERROR`).
  - §82 to §84 show addresses answering straight after an upload.
- **F3 — who may write.**
  - `services/permissions/can-this.js:68-104` (5.x `:70-86`): the Owner always may. A staff key uses the USER's
    permissions and ignores the key's. A refusal is `NoPermissionError`, "You do not have permission to perform this
    action".
  - `data/schema/fixtures/fixtures.json` is the same on both majors: Administrator `setting: all`. Editor, Super Editor,
    Author and Contributor have `setting: [browse, read]`.
  - The integration key is refused at 403 on Ghost 6 and 501 on Ghost 5 (§39).
- **F4 — Ghost's default file.** `services/route-settings/default-routes.yaml` is 130 bytes, sha256
  `b2d675260a6071be426ac6a67ea60da9428f6169e03e25cb14cc2d7ed74381a1`, and identical on both majors. T1's live file has the
  same sha (spec 3.7; §82).
- **F5 — backups** (7.16a's Review). Ghost 6.58.0's `adapters/route-settings/FileStore.js:106-117` writes a dated copy on
  every upload. 5.130.6 writes one name fixed at boot.
- **F6 — Ghost 6's own upload.** The built admin bundle (`core/built/admin/assets/settings-*.js`) shows "Routes · Upload
  routes file · Download current routes" and links `https://docs.ghost.org/themes/routing/` (200). That page still says
  "Settings » Labs", which is Ghost 5's path.

## Owner's manual test

Do this on the real site after Deploy, on a laptop. Use **Pilot sections** (`b6d4db35-8e5e-45e1-a70f-4daa28916d51`) and
two windows of the same browser side by side. First turn autosave off: **Account → Saving**. If a /tutorials/ collection
or a Tutorials List template is left from an earlier test, delete it first on Routes & Templates. This test is your
ruling on Question 5; the routing card's own test is in Story 7.18 (Question 1).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | A: `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` · B: `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Editor, Home · Routes & Templates | Open both. | — | Home in A, and Routes & Templates in B. |
| 2 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates (B) | Press **+ New collection**. Type the path. Add **Primary tag** and type the tag. For Template, choose **New template…** and type the name. Press **Create collection**. | `/tutorials/` · `tools` · `Tutorials List` | The collection is listed, and Tutorials List says "Used by /tutorials/". |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home (A) | Don't reload. Click Home's headline, type the text, then press ⌘S. | `Hello from window A` | No "This project was changed somewhere else". The editor says it is saved. |
| 4 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor (A) | Open the Template menu, and choose Tutorials List. | — | Tutorials List is in the menu. It opens with a post grid tagged **MAIN FEED**. |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home (A) | Go back to Home. Press ⌘Z, then ⌘⇧Z, then ⌘S. | — | ⌘Z puts back the old headline, and ⌘⇧Z brings "Hello from window A" back. Your undo history was kept. |
| 6 | A: `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/custom-tutorials-list` · B: `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Editor · Routes & Templates | In A, open Tutorials List. In B, delete it from Templates (**⋯ → Delete**, then confirm). | — | A moves to Home with the notice that the template was deleted. B offers **Undo**. |
| 7 | B: `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | Press **Undo**. Then, in A, open the Template menu. | — | Tutorials List is back in A's menu, and its grid still says **MAIN FEED**. |
| 8 | B: `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | Delete /tutorials/, then Tutorials List. In A, put Home's headline back and press ⌘S. Turn autosave back on. | — | Back to how step 1 found it. No step showed "changed somewhere else". |

## Questions for the owner

### Question 1 — Ship it arrives in Story 7.18. Where do you test the routing card by hand?

**In plain English.** This story's upload runs when you ship. The "Upload routes.yaml yourself" card appears after a
ship that could not upload. Ship it is built in the next story, 7.18, so in this story nothing on the live site can make
the card appear for you yet. The automatic checks and the test Ghost site would prove the upload, and the card would be
checked on production with a planted site.

**An example.** You connect a site without a Staff Access Token, make a /tutorials/ collection, and press Ship it. From
Story 7.18 on, your site goes live and the card opens: download, upload in Ghost, then Verify upload.

1. **(RECOMMENDED) Build the upload and the card here, and 7.18 calls them.** This story builds the upload, its check and
   the card, and shows the card on Routes & Templates and on Sites while a site still needs its routing. Story 7.18's
   Ship it runs the upload after it switches your theme on, and opens the card at its end. Your hand test of the card
   moves word for word to 7.18. Here, you test the second-tab fix (Question 5).
2. **Build Story 7.18 first, then this story whole.** The next run plans 7.18. This spec waits, and is re-read against the
   Ship it that 7.18 builds.

**Ruled: option 1 (owner, 2026-10-18).** *"Agree with all recommended."* Recorded as **R-254**.

### Question 2 — Your project uses Ghost's default routing, but your site already has a different routing file. What happens when you ship?

**In plain English.** Ghost keeps a site's routing in one file. If your project has no collections and no routes,
Inflozo builds your theme for Ghost's default routing. Your site may already have a different file: either one an
earlier Inflozo ship put there, or one your site's owner wrote in Ghost before Inflozo.

**An example.** Before Inflozo, your site's owner wrote a file that moves tag pages from /tag/travel/ to /topic/travel/.
You never open Routes & Templates, and you ship.

1. **(RECOMMENDED) Put Ghost's default back only over a file Inflozo put there.** A file someone else wrote stays, so
   /topic/travel/ keeps working. If you once had a /tutorials/ collection in Inflozo and deleted it, the next ship puts
   Ghost's default back.
2. **Always put Ghost's default back.** /topic/travel/ stops working and becomes /tag/travel/ again. The backup step in
   Story 7.20 asks you to keep a copy first.
3. **Never upload when your routing is Ghost's default.** Whatever is on the site stays, including a /tutorials/
   collection you deleted in Inflozo.

**Ruled: option 1 (owner, 2026-10-18).** *"Agree with all recommended."* Recorded as **R-255**.

### Question 3 — "All tags" and "All authors" pages: who makes them?

**In plain English.** Ghost has no page that lists every tag or every author. Your rule FR-I5 (R-24, R-25) says Inflozo
adds such a page by itself when a design you place links to one. Your later rule FR-F8 (2026-09-03) says a link to a page
Ghost doesn't publish is one you type, and it stays hidden until you set it. The two disagree. No design in Inflozo's
library links to either page yet. The first one that does is the "Tags" footer (A3 #13, "All 34 tags"), in Story 9.12.

**An example.** You place the Tags footer. Under FR-I5, Inflozo adds a /tags/ page to your site. Under FR-F8, you type
where "All 34 tags" goes, and the link stays hidden until you do.

1. **(RECOMMENDED) Move both pages, word for word, to Story 9.12,** the first story with a design that links to one. Its
   Create settles FR-F8 against FR-I5 with that design in hand. This story builds nothing for them.
2. **Build them now,** and test them on a made-up design.
3. **Drop them: FR-F8 wins everywhere.** You type each link, and Inflozo never adds a page.

**Ruled: option 1 (owner, 2026-10-18).** *"Agree with all recommended."* Recorded as **R-256**.

### Question 4 — If Inflozo can't read your routes for a moment, should a collection's post grid stay its main feed?

**In plain English.** If Inflozo ever fails to read your saved routes (for example, during a passing database error),
every collection's or channel's template opens as if no route used it. Its post grid stops being the **Main feed**, and
your next edit there saves it that way (DW-366).

**An example.** The read fails while you edit Tutorials List. Its grid loses **MAIN FEED**. You change its heading, and
the grid is saved as an ordinary list. When the routes read again, the first grid becomes the main feed again.

1. **(RECOMMENDED) Keep each template's main feed while the routes can't be read.** The grid keeps **MAIN FEED**, shows
   your theme's Posts per page until the routes read again, and nothing is saved differently.
2. **Leave it as it is today.**

**Ruled: option 1 (owner, 2026-10-18).** *"Agree with all recommended."* Recorded as **R-257**.

### Question 5 — An editor open in a second tab: how should it take in a template made on Routes & Templates?

**In plain English.** Since Story 7.16c, if the editor is open in one tab and you make, delete or undo-delete a template
on Routes & Templates in another, the editor's next save says "This project was changed somewhere else" and asks you to
reload (R-253). You asked for a later fix, and this story is it (DW-370).

**An example.** The editor is open on Home in one window, and Routes & Templates is open in another. You make /tutorials/
with a new template. Back in the editor, you change Home's headline and press ⌘S.

1. **(RECOMMENDED) Routes & Templates tells an editor open in the same browser what it changed, and the editor takes it
   in.** The headline saves, nothing asks you to reload, Tutorials List is in the Template menu with its grid, and ⌘Z
   still works. An editor on another computer still asks you to reload, as it does now. This adds one small rule to the
   architecture's saving rule (AD-15).
2. **The editor saves what it owes, then reloads by itself.** Nothing asks you, but the editor reloads and its undo
   history starts again. The architecture does not change.
3. **The editor fetches a template it has never had from the cloud when it opens it, and Routes & Templates stops marking
   the whole project as changed.** This also works on other computers, but the editor doesn't see the new template until
   you reopen it. It is a bigger change to AD-15 and to how the editor loads. It is option 2 of 7.16c's Question 2.

**Ruled: option 1 (owner, 2026-10-18).** *"Agree with all recommended."* Recorded as **R-258**.

### Question 6 — May this story's database change go on the live database now? (R-99)

**In plain English.** Each Ghost site gets one new empty field that remembers why Inflozo could not upload its routing
file (no token, a token that stopped working, or a token whose staff account is below Administrator), so the "Upload
routes.yaml yourself" card can say the right thing. It passes every check on a copy of the database, and with it left
out the check fails exactly where it should. Nothing on the live database had changed when this was asked.

**An example.** Today a site row has no such field. After this, every existing site has it, empty, and nothing you see
in the app changes until Story 7.18 starts filling it.

1. **(RECOMMENDED) Go.** I apply it through the database connection in this session and read it back, before any code.
2. **I'll paste it into Supabase's SQL editor myself.**
3. **Stop the story here.**

**Ruled: option 1 (owner, 2026-10-18).** *"1. Go"*, asked in the Dev session before any production call. Applied
through `SUPABASE_DB_POOLER_URL` in this session and read back before any code (`## Verification`).

### Question 7 — May this Dev run write to the Ghost test site T1? (R-82, R-238)

**In plain English.** The new recorder proves the real upload on T1. Its whole run: it saves T1's own `routes.yaml`
first; checks that an identical file is not uploaded; uploads a test file with a probe collection `/inflozo-probe-up/`
and reads it back byte for byte; uploads Ghost's default back and reads it back; tries two uploads Ghost must refuse
(the Admin key → 403, a made-up staff token → 401) and checks neither changed anything; then, whatever happened, puts
T1's original back and reads it back byte for byte. No post, tag, theme, member or setting is touched.

**An example.** For a minute or two `ghost6.inflozo.com/inflozo-probe-up/` exists; afterwards T1's routing is exactly
what it was.

1. **(RECOMMENDED) Go** — the whole run above, in the main session only, never a subagent.
2. **Skip T1 in Dev**; run it at Review instead.
3. **Stop the story here.**

**Ruled: option 1 (owner, 2026-10-18).** *"1. Go"*, asked in the Dev session before any T1 write; a second run after a
fix gets its own ask.

## Verification

**Executed — Schema phase (2026-10-18), before any code:**
- `bash supabase/tests/run-rls-gate.sh` -- exit 0: no SCHEMA DRIFT, every earlier block still passing, and Story 7.17's
  five PASS lines — `sites.routes_fallback` a nullable text taking `no_token`, `revoked`, `role` and null; a cause F3
  does not name refused (23514); the tenant reads its own cause and not another tenant's site; the tenant cannot write
  it (42501); the refused write leaves the server's value.
- Control: the same gate over a scratch copy of `supabase/` without `20261018120000_routes_fallback.sql` and HEAD's
  `SCHEMA.sql` (`INFLOZO_ARCH_DIR`) -- exit 3 at the 7.17 block ("public.sites.routes_fallback is missing, not text, or
  not nullable"), with 7.13's block passing first.
- Supabase production, through `SUPABASE_DB_POOLER_URL` (read inside the script, never on argv), on the owner's go
  (Question 6): before — no `routes_fallback` column and no constraint; applied in one transaction; after —
  `routes_fallback text`, nullable, the table's last column, `sites_routes_fallback_check` =
  `CHECK ((routes_fallback = ANY (ARRAY['no_token'::text, 'revoked'::text, 'role'::text])))`, column UPDATE held by
  `postgres` and `service_role` only, SELECT by `authenticated`; every existing site's value null.

**Commands (Dev):**
- `bash supabase/tests/run-rls-gate.sh` -- green, with its withheld-migration control aborting at the 7.17 block (Schema).
- `pnpm check` -- exit 0: lint, typecheck and every package's suite. The suites include:
  - the app's `routes-upload`, `ghost-admin-rule`, `server-wiring`, `health-rule`, `routes`, `journal`, `editor` and `busy`
    tests;
  - the library's `modules`;
  - the compiler's `compile`;
  - the runtime's `main-feed` and `ad36`.
- `pnpm keyboard` -- every journey passes. `pnpm build` -- exit 0. `node tools/check-traces.mjs` -- passes.
- `node tools/probe/record-routes.mjs --upload` (the main session, on the owner's in-session go; T1 only; keys read in
  process by name):
  - the §85 rows hold, each behind its control;
  - T1's file is restored and read back byte for byte;
  - the Ghost 5 half is DW-326's (R-238).
- `python3 tools/doc-audit.py --check` -- PASS, twice.
- `git grep -n "Labs card"` and `git grep -n "non-Owner"` -- every remaining hit carries the dated reading.

**Re-run by the main session on the final tree (2026-10-18, Node 24), after the T1 run, before the commit:**
- `pnpm check` -- exit 0, 0 failing, every suite printing its own count (the Review took the counts out of this spec:
  standing rule 4), the story's `(7.17)` and `Story 7.17` tests among them.
- `pnpm build` -- exit 0. `node tools/check-traces.mjs` -- "every route carries its files", and no client chunk carries the
  font pool's record.
- `pnpm keyboard` -- exit 0, every journey passed.
- `python3 tools/doc-audit.py --check` -- PASS on the second run (the first regenerated the index after §85 landed).

**Results (Dev, 2026-10-18, on the final tree, under Node 24; the T1 run is the main session's):**
- `pnpm check` -- exit 0: lint, typecheck and every package's suite, each printing its own count, with every 7.17 test named in
  the table below.
- `pnpm keyboard` -- exit 0, every journey passed. `pnpm build` -- exit 0. `node tools/check-traces.mjs` -- "every route carries
  its files", and no client chunk carries the font pool's record.
- `python3 tools/doc-audit.py --check` -- PASS twice (the run before regenerated the story board, as it does after a change; an
  earlier run named DW-371 orphaned until Story 7.18's card carried it, R-195).
- `git grep -n "Labs card"` and `git grep -n "non-Owner"` -- every live hit carries the dated reading (`prd.md` FR-I4 and the
  Admin API line, `epics.md`'s coverage line and Story 7.17's card, `epic-7-context.md`'s open item); the rest are `record`
  documents (`validation-report.md`, `review-rubric.md`, `encode-propagation-map.md`, `reconcile-designs.md` and its findings,
  `review-st2-ghost-truth.md`, the v4.0 backup), left as written.
- **Controls planted (standing rule 2)**, each failing its test and restored: `routesToOffer` offering an unchanged file; a 403
  read as `role` whatever its type; Ghost's default put back over a file nobody offered; the read-back with the Admin key; a
  stored file that is not `routesYaml(config)` let through; `writePlan` clearing the cause whatever the live sha; `takeMoves`
  ignoring a move's `from`; `adminRequest` typing a `FormData` body as JSON. The packages' (the ⌘K throw, the head rule, the
  README's indent, its section and a `\r` let through) were planted the same way.
- **`tools/probe/record-routes.mjs --upload`** (§85) is built: every Admin call through the product's `adminRequest`, every
  decision `routesToOffer`/`routesAnswer`/`bytesEqual`, the body `offerRoutes`' FormData; before any write
  `GHOST_DEFAULT_ROUTES` is held byte-identical to both tarballs' `default-routes.yaml` and the probe and Ghost's default read
  back as meant through both majors' own parsers. Its plain local half passed (`node tools/probe/record-routes.mjs`, npm reads
  only); any other argument prints the header and exits 2. The whole leg ran against an in-process fake Ghost in the scratchpad
  (the JWT, the headers, no `Content-Type` on the POST, the FormData part, the counts, the restore) — no request reached T1.
- **T1 `ghost6.inflozo.com` (6.58.0), executed in the main session on the owner's go (Question 7), 2026-10-18** —
  `node tools/probe/record-routes.mjs --upload` (Node 24; `GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN` and
  `GHOST6_ADMIN_API_KEY` read in-process, never printed) -- exit 0, every row held, MEASUREMENTS §85 written:
  - before any write: `GHOST_DEFAULT_ROUTES` byte-identical to both tarballs' `default-routes.yaml` (130 bytes, F4's sha
    `b2d67526…`); the probe file and Ghost's default each accepted and read back as meant by 6.58.0's and 5.130.6's own
    parsers; T1's own file read with the staff token through `adminRequest` and saved — F4's bytes; Casper active, no
    `custom-inflozo-probe-up.hbs`; tag `craft` (9 published); `/inflozo-probe-up/` 404 (the control);
  - step 2: `routesToOffer` with the project's file equal to T1's live file → `unchanged`, 0 POSTs;
  - step 3: the probe (284 bytes) POSTed with the staff token → HTTP 200, `routesAnswer` `ok`; read back with the same token
    byte for byte; `/inflozo-probe-up/` 200 after 1 s (F2: live at once);
  - step 4: `routesToOffer({ project: null, live: probe, lastOffered: probe })` → offer `GHOST_DEFAULT_ROUTES`; POST 200; read
    back F4's bytes; `/inflozo-probe-up/` 404 again;
  - step 5 (controls): the probe POSTed with `GHOST6_ADMIN_API_KEY` → 403 `NoPermissionError`, read `role`; with a random
    well-formed staff token → 401 `UnauthorizedError`, read `revoked`; the read-back after both byte-identical to step 4's;
  - step 6: T1's own file restored in the `finally` with the staff token, HTTP 200, read back byte for byte (sha `b2d67526…`).
    Three stored uploads and two refused; Ghost 6 keeps three dated copies in `content/settings` (F5). The Ghost 5 server
    half is DW-326's (R-238).
- **The walk:** step 112 is written (`run-verify-editor.cjs`, `node --check` clean), and step 110h re-expected: its routes page
  now opens in a context of its own, because an editor in the same context hears the delete (DW-370) and moves to Home before
  110h's next press. Both are the Review's, on production.

**Matrix row → check** (each ran in that row's state; the T1 rows ran at Dev, the walk rows and the Verify presses on
production at the Review):

| I/O row | The check that ran in it |
|---|---|
| Upload | `routes-upload.test.ts`: `routesToOffer` offers F over G; `offerRoutes`' order read → GET [staff] → POST [staff, `routes_upload`, FormData `routes`/`routes.yaml`/`text/yaml` carrying F's bytes] → GET [staff] → write F, sha, now, null; §85 step 3 |
| Already there | `routes-upload.test.ts`: `unchanged`, no POST, the same state written; §85 step 2 (its POST counter) |
| No token | `routes-upload.test.ts`: the live read with the Admin key, no POST, `no_token` and the file written; walk 112a |
| Token stopped working | `routes-upload.test.ts`: 401 → `revoked` written, no read-back; `routesAnswer`; §85's unknown-token control; walk 112b |
| Role below Administrator | `routes-upload.test.ts`: 403 `NoPermissionError` → `role`, and any other 403 a refusal (the control); §85's Admin-key control; walk 112b |
| Ghost refuses the file | `routes-upload.test.ts`: 422 → `ghost_refused` with Ghost's message as `detail`, nothing written |
| Ghost busy or away | `routes-upload.test.ts`: 503 → `ghost_unavailable`, a thrown `ghost_unreachable` → `ghost_unreachable`, nothing written; any other chokepoint error thrown on |
| Read-back differs | `routes-upload.test.ts`: G read back → `routes_unverified`, and a read-back that fails too, nothing written (DW-371) |
| Back to default, Inflozo's file live | `routes-upload.test.ts`: `routesToOffer` and `offerRoutes` upload `GHOST_DEFAULT_ROUTES`; §85 step 4 |
| Default, someone else's file | `routes-upload.test.ts`: `kept`, no POST, no write (never offered, or offered something else) |
| Default everywhere | `routes-upload.test.ts`: `kept`, even when the default was offered last |
| Stored routing unfit | `routes-upload.test.ts`: a config that does not parse, a template the project lacks, a spliced file — each `routes_invalid` with only the read made |
| First read fails | `routes-upload.test.ts`: with F the upload goes and the read-back decides; without F `kept` — since the Review, when the staff read AND the Admin key's fail (a staff read that fails alone is answered by the Admin key: its own test, with a staff read that answers as the control) |
| Verify, Ghost has it | `routes-upload.test.ts`: the Admin key, bytes equal → `verified`, the cause cleared with the sha and the time; **the Review's T1 run: Verify PRESSED on production over T1's live bytes, the card's one line, `routes_fallback` read back null with T1's sha**; walk 112d draws the card gone after that write (made there through the service key) |
| Verify, not yet | `routes-upload.test.ts`: bytes differ → `notYet`, nothing written; the Review's T1 run: Verify pressed over a file T1 does not hold → `notYet`, the row unchanged |
| Verify, no answer | `routes-upload.test.ts`: a read that fails or throws → `unreachable`, nothing written, and since the Review a site that is not the caller's (no call) and a match whose write fails; walk 112c on production (its planted site holds no key, so the chokepoint refuses before any request), the columns read back unchanged |
| Daily check | `health-rule.test.ts` (7.17): the cause cleared when the live sha is the offered one's, left with a different sha, no read, no cause, nothing offered; the shell's select, hash and bytes read from its source |
| ⌘K lint | `modules.test.ts` (7.17): each of the three names and a bracketed read named, comments not; `compile.test.ts`: a bundled module that reads one throws, `core.js` and a comment the control; `check-snapshots`: every real module file passes, a planted one is named |
| Head lint | `compile.test.ts`: `exclude="search"` and four spellings named, a bare and a `~`-trimmed `{{ghost_head}}` pass, `{{ghost_foot}}` unaffected |
| README | `compile.test.ts`: `## Routes` after `## Styles`, the file indented four spaces and byte-equal once unindented, null and absent give the old README; the AD-36 pair; `check-snapshots`: `themeFailures` clean over the pilots' README with routes, a builder-named path its control |
| DW-366 | `main-feed.test.ts` (7.17): `flaggedListing` lists only a flagged Routes Manager file; the flag kept through a read and an edit; a readable routing that does not list it strips it (the control); `editor.test.ts`: `read.ts` and the editor's `listed` |
| DW-367 | `routes.test.ts` (7.17): `listedStartFailed`, `made`, the re-check (no doc, no stored route, listed), each clause's removal failing (the control), the grid before the config, the sheet's `start_file` |
| DW-370 | `journal.test.ts` (7.17): `takeMoves` from the editor's base, a move from another base taking nothing (the control), the message's shape, the routes page's `told` on every action, the editor's `heardMoved` (holder only, journal kept, the refresh, the dialog) and the 409 retry; walk 112e–112g, the stubbed `postMessage` meeting R-253's dialog; since the Review, walk 112i: both races on a held sync request, and a doc-less template told with no moves |

**Real services (R-82):**
- **Dev:** T1 `ghost6.inflozo.com` (6.58.0) via §85, and the production database for the migration's apply.
- **Review:** production `app.inflozo.com` via walk step 112 and Verify pressed end to end; production's schema through the
  pooler; T1 read-only (no §85 row changed, so §85 was not re-run).

**Review (2026-10-18) — the real infrastructure, the main session (R-82), keys read in-process by name, none printed:**
- **CI on the Dev head `1af3b36b`:** `check`, `rls`, `deploy` and the render matrix all succeeded; Vercel's production
  deployment `dpl_Gp262PfgdQtEpCG1JfoRvGwPZQwk` READY, built from it.
- **Production's schema (R-99)**, through `SUPABASE_DB_POOLER_URL`: `sites.routes_fallback text`, nullable;
  `sites_routes_fallback_check` = `CHECK ((routes_fallback = ANY (ARRAY['no_token', 'revoked', 'role'])))`; on that column
  `authenticated` holds SELECT alone and `service_role` INSERT, SELECT and UPDATE; every site's value null. Control: a column
  the code does not name reads absent.
- **T1, read-only**, through the product's `adminRequest`: `GET settings/routes/yaml/` 200 with `GHOST6_STAFF_ACCESS_TOKEN` and
  with `GHOST6_ADMIN_API_KEY`, the same 130 bytes, F4's sha `b2d67526…` — Dev's restore holds; `/inflozo-probe-up/` 404.
  Control: a random well-formed staff token → 401 `UnauthorizedError`, which `routesAnswer` reads `revoked`.
- **The walk on the Dev deployment**, cut to steps 1–5 + 109–112 (a scratchpad copy of `run-verify-editor.cjs` in a detached
  worktree at `1af3b36b`, the launcher reading the four names in-process): **0 FAIL, first time** — 109–111 still hold and
  110h's re-expectation with them; 112a–h hold: the control with no cause draws no card on either host; each cause on both
  hosts in its own words (Sites' card's last child, an h3; under the routes page's bar, an h2); the chip's "63 bytes" (the
  file's bytes, not its 61 characters) and the `data:` link decoding to the planted bytes; Verify's "Verifying…" with
  `aria-busy` and `aria-disabled`, then `unreachable` with nothing written; the resolved card gone; DW-370's collection, its
  template's delete and Undo told to the editor with no dialog and the journal kept; the stubbed `postMessage` meeting R-253's
  dialog (the control); users and projects counted back unchanged.
- **Verify upload pressed end to end against T1** (scratchpad `verify-t1.cjs`): a throwaway account connected T1 through the
  product's wizard (Admin and Content keys; read-only on T1), the routes columns planted through the service key, and Verify
  pressed on Sites — over a file T1 does not hold: "Ghost doesn't have this file yet…", the row unchanged (the control); over
  T1's live bytes: "Ghost has your routes.yaml. Your routing is live.", `routes_fallback` read back null with T1's sha and the
  time; the next load draws no card. Cleanup: disconnected through the product (`credentials_present` all false), the
  account deleted with its rows, the user count unchanged. The first run died on a stalled `/sites` load after its `notYet`
  half passed; the second, retrying an idempotent load once (a `note`), passed whole.
- **R-74's side-by-side** — B16 at 1440 on both hosts (the walk's `b16-<cause>-<host>-1440x900.png`) against the frame's B16
  rendered from the export: the same 600px card, tile and glyph, title, body, three numbered steps with the file chip, the
  coral "Show me where ↗", Verify upload and the secondary. The differences, each a Kit convention: step text and file name in
  ink `#1C1B1A` where the frame has `#3A3835` (no Kit token; B15 maps it the same); the Kit's size-36 buttons (radius 12, 13px)
  against the frame's 10 and 12.5px; the Kit's icons with round joins; and a footer that wraps — the footnote takes its own
  line, where the frame at the same 600px squeezes each button's label onto two lines; on a Sites card the buttons stack.
- **The Review's patches, locally:** `pnpm check` exit 0; each new `routes-upload.test.ts` case FAILs with the old code planted
  back (the staff-only read; Verify ignoring a failed write) and passes restored; `check-snapshots`' README guide row FAILs
  with a different `GHOST_ROUTES_HELP` planted; `bash supabase/tests/run-rls-gate.sh` exit 0 with the 7.17 block's two new
  controls (the tenant still writes its own title; the service role writes the cause); `pnpm keyboard` exit 0, every journey
  passed, run whole before the push.
- **After the Review's push — the walk on the Review's own deployment** (`1f25d883`, CI's `check`, `rls`, `deploy` and the render
  matrix all succeeded, Vercel `dpl_E1hxrXsBzWoHE52L7Nogp8BB18ZK` READY; a fresh detached worktree at that commit, the same
  launcher), every run recorded:
  - **steps 1–5 + 112: 0 FAIL, first time and whole on the third run** — 112a–h as on the Dev deployment, now with B16's
    `role="list"` and "Show me where ↗ (opens in a new tab)" read on both hosts, and **112i held**: (a) the request held
    before the server, the delete taken in while the save was out, the 409 answering the old base sent again, landing two past
    it, no dialog; (b) the request applied and its answer held, the Undo's move from the new revision HELD (the menu not yet
    listing the template) and taken once the answer landed, the next ⌘S one past it, no dialog; (c) "+ New template" and its
    delete each told with no moves, the editor's menu listing and then dropping the doc-less template, the revision unmoved.
    The first run of the cut failed 112g alone — its toast not seen within 15 s while the delete itself landed and the
    control's dialog opened — and the second died at step 2's sign-in navigation (a HARNESS ERROR before any story step).
  - **steps 1–5 + 109–111: 0 FAIL on the second run** — 109–111 and 110h's re-expectation hold beside the Review's `told`
    change. The first run's 110g delete never reached Vercel (its request rows end at the routes page's GET at 09:22:48Z with
    no POST after it — DW-204's class, never the product), and the walk then died on the toast it waited for.
  - **the first whole 1–5 + 109–112 runs** died the same ways: one at step 2's magic-link load; one where 109h's last control
    save and 109i's delete never reached Vercel (no request row after 09:14:45Z).
  - Users and projects counted back unchanged after every run, the dead ones included.
- **Not run anywhere, held by regexes over the source only:** DW-367's `start_file` retry (production offers no lever to fail a
  grid write) and `heardMoved`'s branches beyond what step 112i drives.

**Deploy (2026-10-18).**

- `Deployment: dpl_CVaYzc6kzpJtwk6qgSfNPDUJAuh1` — READY, production, built from `b900744c` (the head). The last code change is
  `1f25d883`'s `dpl_E1hxrXsBzWoHE52L7Nogp8BB18ZK`, also READY, the one the Review's walk ran on; the head after it changed the spec
  and the story board only. The head's deployment is aliased to `app.inflozo.com` and `inflozo.com` (Vercel API, `VERCEL_TOKEN`,
  `VERCEL_TEAM_ID` and `VERCEL_PROJECT` read in-process by a script, never on argv). CI at `b900744c` and at `1f25d883`: `CI`
  (`check`, `rls`, `deploy`) and the Render matrix completed success (GitHub API, `GITHUB_TOKEN`).
- Schema: `sites.routes_fallback` was pushed first as the Schema phase (`02d659c2`, R-99), applied to production through the pooler
  on the owner's go (Question 6) and read back at the Schema and again at the Review; `bash supabase/tests/run-rls-gate.sh` is
  green on every push since, including the head's `rls` job. Nothing to apply at Deploy.
- Signed out, `https://app.inflozo.com/` answers 307 to `https://app.inflozo.com/sign-in` and `https://inflozo.com/` answers 200,
  so both addresses are live. Nothing was written to any database or Ghost site at Deploy; T1 was not touched.
- The owner's test above carries the live URL in every step. `owner_test` stays `pending`.
