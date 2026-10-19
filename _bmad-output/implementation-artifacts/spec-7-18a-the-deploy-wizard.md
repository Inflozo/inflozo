---
title: 'Story 7.18a — The deploy wizard'
type: 'feature'
created: '2026-10-18'
status: 'in-review'
baseline_commit: 'ceaae4068372bef46d2745fc450f8625b83c6eea'
owner_test: issues
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story the editor's top bar has a coral **Ship it** button (⌘⏎ does the same) that builds your site into a
Ghost theme, checks it, uploads it to your own Ghost site and switches it on — or only uploads it, if you choose
**Deploy only**. You watch four steps (Destination, Check, Ship, Live), every problem is said in plain words with how
to fix it (warnings never stop you, real errors do), and a successful ship ends on "Live! Your site just got gorgeous."
with confetti. If Inflozo cannot upload your routing for you, the ending shows the "Upload routes.yaml yourself" card,
and a heading you empty now simply disappears from the page instead of stopping the build.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Questions 1–3 were ruled by the owner (2026-10-18): R-259, R-260, R-261.** "Ruled values" in Design Notes is the one
table they set. **This is Story 7.18a — shipping a project (R-259).** The card's other halves moved word for word
(`epics.md`, R-195): **7.18b** (choosing the site, and Pre-flight's warning-only rows) and **7.18c** (the editor's lock
and save leftovers: DW-304, DW-307, DW-308). The wizard half of Story 7.32 (D2e and D2f) came in here.

**Problem:**
- **Nothing ships.** No Ship it exists. `editor.tsx:335` lists it as "ABSENT, NOT GREYED … Ship it (7.18)". No code reads
  or writes `deploy_jobs` or `deploys`. `compileTheme` has no product caller: only `tools/pilot-theme.mjs` and the
  recorders call it. `apps/web` does not depend on `@inflozo/theme-compiler`.
- **The pieces exist, separately.**
  - The compiler: Stories 7.1–7.17.
  - The two gates: `gscanGate` and `qualityGate`.
  - The chokepoint's `theme_upload` and `theme_activate` (`admin-rule.ts:120-129`).
  - The `FormData` transport, proved only by the routes upload (DW-51).
  - Story 7.17's `offerRoutes` and B16.
  - The lock take-over component (`lock-takeover.tsx`, waiting for D8g's strings).
  - ⌘⏎'s reserved row (`keymap.ts:126`).
- **The schema lacks three things.**
  - AD-20's `awaiting_ship` stage (`job_stage`, `20260904120000_complete_schema.sql:407`).
  - A column for the quality verdict beside `deploys.gscan` (Story 7.8's card).
  - Any way to tell a stale artefact.
- **Six items need this story.**
  - **DW-349:** a typed text the customer empties ships the design's sample English, so the compile throws V1.
  - **DW-353** and **DW-358:** the compile's own sentences would reach the customer.
  - **DW-362:** an unreadable routing has no way out.
  - **DW-364:** an untagged post is listed nowhere under a Primary-tag collection.
  - **DW-371:** an upload that cannot be read back says nothing.

**Approach:**
- **Two server calls on ONE `deploy_jobs` row** (AD-20's F-075). Both run in one route handler,
  `projects/[id]/deploy/route.ts`.
  - Each POST answers at once with the job id, and the work continues in Next's `after()` inside the same invocation
    (AD-11's 300 s; AD-13: no artefact is ever a response body).
  - The wizard reads the row by GET until it ends.
- **Pre-flight** (Run checks), in order:
  1. Flush the editor.
  2. `queued` → `compiling`: owned reads → `CompileInput` → `compileTheme`.
  3. `checking`: `gscanGate` for the site's major, then `qualityGate`.
  4. If nothing blocks: zip, then store the artefact in `deploy-artifacts` on a `deploys` row.
  5. `awaiting_ship`.
- **Ship it**, in order:
  1. A stale artefact re-runs `compiling` and `checking` on the same row.
  2. `uploading`: `POST themes/upload/` as multipart, with the Admin key.
  3. `activating`: `PUT themes/{name}/activate/`, when Deploy & activate was chosen.
  4. Then `offerRoutes`.
  5. `done`, or `failed`.
- **One pure rule module, `apps/web/lib/deploy.ts`,** decides the stages, the rail, the version, the hash, every answer
  and every sentence.
- **The UI.** Ship it is Story 7.18's coral split button, with the S4d ▾ menu. The wizard is a modal over the editor,
  built from S8a–d and S8d′, plus D2e/D2f for "on your site but not live". D8g comes first for a session reading along.
- **The six items.**
  - DW-349 is fixed in the runtime: both emitters hide an emptied typed text.
  - DW-353 and DW-358 become plain words.
  - DW-362 is R-261: a "Start again" on Routes & Templates.
  - DW-364 is R-260: the index filter is fixed so Home lists posts with no primary tag, proved first, **and** a
    Pre-flight check names any post no page would list.
  - DW-371 is settled by four routine calls.

## Boundaries & Constraints

**Always:**
- **Frames (R-74).** Every frame lives in `claude-design-export/Inflozo/`. Design Notes, "Words", holds every string.
  - **Ship it and its menu:** `S4 Editor.dc.html:157-160` (the split button) and S4d `:366-395` (the ▾ menu). At narrow
    widths, `D8 Editor Below 1440.dc.html` D8a/D8b `:55-57`, `:185-187`.
  - **The wizard:** `S8 Deploy.dc.html` S8a `:23-72`, S8b `:76-131`, S8c `:133-170`, S8d `:175-212` and S8d′
    `:214-242`.
  - **The endings:** `D2 Deploy History Completed.dc.html` D2e `:291-346` and D2f `:347-400`.
  - **The take-over:** D8g `:459-489`, with R-189's "your other session" in place of a person.
  - **The routing card:** B16, reused as Story 7.17 built it.
  - **Undrawn states are extrapolated from the nearest frame**, in the same tokens and components: the running stages,
    a blocking row, the no-site Destination and the reset sheet.
- **One compile per deploy, on one row (AD-20).**
  - The artefact Ship it uploads is the one Pre-flight checked, byte for byte. It is re-made only when
    `inputs_sha256` differs, and then on the same row.
  - Cancel exists in `queued`, `compiling` and `checking` only.
  - A gate result is a result and is never retried. An infrastructure failure (storage, database, a thrown chokepoint
    error) is retried once.
- **The compile reads STORED rows, never `editorData`.** `editorData` adds synthesised docs and designates them
  (`read.ts:440-450`), which would change what ships.
  - Page-2 rows route through `canvasOfPageTwoKey` into `pageTwo`. `index.hbs` is never a `templates` key.
  - Only the CURRENT Routes Manager templates' `custom:` docs ship (7.16b's reading).
  - `lists` comes from `listsOf(config)`, `routed` from `routedOf(config)` and `routes` from `routesYaml(config)`, all
    over the same stored routing.
- **AD-10.**
  - Every Ghost call goes through `call()`: `theme_upload` and `theme_activate` with `kind: 'admin'`, routes as Story 7.17
    built them.
  - Every new importer of the chokepoint or the service role is named in `server-wiring.test.ts`'s two lists, with its
    reason.
  - `ADMIN_WRITES` stays four (R-22).
- **AD-24.**
  - Every failure is `{ code, message, detail?, action? }`, stored in `deploy_jobs.error`.
  - Ghost's text is only ever `detail`, rendered as text.
  - The compile's own sentences never reach the customer: each class has its plain words, or the "our fault" sentence.
- **The lock.** Both POSTs check that the caller's tab session holds a fresh `edit_locks` row (`STALE_MS`), and answer
  423 otherwise. From a session reading along, Ship it opens D8g first, and the wizard never opens without the lock.
- **R-98.**
  - Each control in flight swaps to its present-tense label, `aria-disabled` + `aria-busy`, never `disabled`.
  - The wizard is a modal with no route, so it has no `loading.tsx`.
  - `busy.test.ts` must stay green.
- **Accessibility (EXPERIENCE).**
  - Stages are announced politely in one live region.
  - Focus moves in on open and returns to Ship it on close.
  - The confetti is static under `prefers-reduced-motion: reduce`.
  - A greyed control says its reason in the caption slot (UX-DR3).
- **R-82, R-238.**
  - Review and test run on production and T1 only. Every T1 write needs the owner's go in the session that runs it, and
    runs in the main session.
  - The Ghost 5 half of every check goes to DW-326, Story 15.7.

**Ask First:**
- Questions 1–3 were ruled (R-259–R-261). Dev builds the ruled options.
- Applying the Schema migration to production (R-99), and every T1 write (§86, the walk's step 113).
- If the deploy function cannot carry `gscan4`, `gscan6` and `jsdom` within Vercel's limits, or AD-11's memory cannot be
  set, stop. Do not split the function or drop a checker without asking.
- If R-260's emission cannot be expressed in Ghost's NQL, as proved by Ghost's own code and T1, stop (the owner's own
  words).
- A fifth `ADMIN_WRITES` entry, a fourth `routes_fallback` value, or any string beyond "Words".

**Never:**
- **7.18b's or 7.18c's scope.** That means: the Switch picker and site linking; the locale warnings; every
  warning-only Pre-flight row (FR-D16, FR-H2, FR-H6, DW-297, the dropped settings, the changed built-ins, the
  untouched words, RTL); DW-304's sentence; DW-307's column; DW-308.
- **Other stories' scope:**
  - the first-deploy steps Safety net and Backup (7.19, 7.20);
  - D1a, the collision suffix and its hand test (7.24);
  - the advisory lock and the rate limit (7.25);
  - retention and pinning (7.22);
  - history and rollback, including D2d's row (7.23);
  - the deploy-failure email and notifications (7.31);
  - Download theme and S8a′ (7.26);
  - the Pro exit sheet (12.3);
  - the drift check (7.21);
  - the template checklist (7.30).
- **The wizard never:**
  - shows a byte-progress bar (no real byte count exists);
  - shows a spinner;
  - promises "we'll ping you" before 7.31;
  - writes the theme's or the routes' bytes anywhere but `deploy-artifacts` and Ghost.
- **No new dependency** where `node:zlib` does it. The zip writer is ours.
- Editing `claude-design-export/`, a `record` document or a generated file; writing a count down.

## I/O & Edge-Case Matrix

"Job" is the `deploy_jobs` row. "Deploy" is its `deploys` row. **n** is this project's uploads to this site plus one.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ship it, holder | lock held, linked site connected and `full` | the wizard opens on Destination; Deploy & activate is chosen | — |
| Ship it, reader | another session holds the lock | D8g opens on **Wait**. **Take over and ship** takes the lock, then opens the wizard. | the take-over refused → its existing sentence, no wizard |
| ⌘⏎ | anywhere in the editor, a field included | the same as pressing Ship it | — |
| ▾ → Deploy only | — | the wizard opens with Deploy only chosen | — |
| No site to ship to | no `linked_site_id`, or the site disconnected | Destination says so and links to Sites; no Run checks | — |
| Preview-only site | `capability = 'preview_only'` | Destination shows B15's own words; no Run checks | — |
| Ghost major outside 5–6 | `majorOf(ghost_version)` ∉ {5, 6} | Pre-flight blocks: the version sentence | `ghost_version_unsupported` |
| Unsynced edits | the journal holds edits | Run checks flushes first. If the flush leaves edits unsent, nothing starts and the wizard says why. | — |
| Pre-flight, clean | — | `queued → compiling → checking → awaiting_ship`. The Deploy holds `gscan`, `quality`, `artifact_path`, `artifact_bytes`, `inputs_sha256`, `settings_snapshot`. Ship it is live. | — |
| Warnings only | the gates find warnings | as clean; each warning is a row with its sentence | — |
| A gate error | `gscan.blocked` or `quality.blocked` | stage `failed`; the Deploy is `failed` with both verdicts; no artefact stored; Ship it greyed, reason in its caption | `deploy_jobs.error` = the first blocking finding |
| Routing unfit | `validateRoutes` returns problems | blocked before compile: S9b's line-numbered error and its line; Ship it greyed with the reason | `routes_invalid` |
| Routing unreadable | `parseRoutesConfig` fails | as unfit, and the reason links to Question 3's way out | `routes_unreadable` |
| Customer-caused refusal | the compile throws a classified prefix | `failed`; the class's plain words and its link; nothing stored | `compile_refused` |
| Inflozo's own refusal | an unclassified throw | `failed`; "our fault" sentence; the compile's message kept in `detail` for us, never shown | `compile_failed` |
| Infrastructure failure | storage or database throws | retried once, then `failed` | `deploy_infrastructure` |
| Cancel | stage `queued`, `compiling` or `checking` | `cancel_requested` set; the work stops at the next stage edge; job `cancelled`; Deploy row and object deleted (objects first) | — |
| Abandoned check | a newer Pre-flight starts while one sits at `awaiting_ship` | the older one becomes `cancelled`; its Deploy and object are deleted | — |
| Stale at Ship | `inputs_sha256` ≠ a fresh hash | the same row re-runs `compiling` then `checking`. If still clean, it uploads; if now blocked, it stops as "A gate error". | — |
| Upload + activate | Ghost 200 then 200 | Deploy `live`, `activated` true, `activated_at`. Binding written on the first upload. Routes offered. Live with confetti. | — |
| Deploy only | Ghost 200; no activate | Deploy `uploaded`, `activated` false; D2f; no routes offered | — |
| Re-activate | the D2e/D2f button | `PUT activate`, then `live`, routes offered, Live with confetti | a failure stays D2e |
| Activation fails | upload 200, activate non-2xx | Deploy `uploaded`, `activated` false; D2e; no routes offered; nothing called failed | — |
| Key refused | upload or activate 401 | `failed`; S8d′'s key sentence with **Reconnect site** (`keysPath`) | `ghost_key_refused` |
| Same name in flight | 500 whose text carries `EEXIST` | `failed`: AD-24's sentence, never Ghost's text | `deploy_running` |
| Ghost's own check refuses | 422 `ThemeValidationError` | `failed`: Ghost found what our checks missed (ours); Ghost's first message as `detail` | `ghost_theme_refused` |
| Plan refuses custom themes | the host-limit refusal read in Ghost's source at Dev | `failed`: FR-C2's sentence and its link; `capability` `preview_only`, `capability_source` `deploy_error` | `ghost_plan_refused` |
| Busy, away, moved | 429/5xx · unreachable · 3xx | `failed`, each with its sentence | `ghost_unavailable` · `ghost_unreachable` · `ghost_redirected` |
| Too large | 413, or `*_TOO_LARGE` | `failed`: the size sentence (the budget is 7.29's) | `theme_too_large` |
| Routes: uploaded/unchanged | after activation | the ending says routing is live | — |
| Routes: fallback | `no_token` · `revoked` · `role` | B16 at the ending with that cause | — |
| Routes: unverified | the read-back failed or differed | `routes_last_offered` = F (no cause); the ending's line plus **Verify upload** | — |
| Routes: failed | refused · unavailable · unreachable · redirected · invalid · site gone | the ending's line and its fix; the theme stays live | — |
| Routes: thrown | a chokepoint error escapes `offerRoutes` | retried once, then "failed" | — |
| Routes: back at default | the project is at Ghost's default, and the site holds Ghost's default | `kept`, and `routes_fallback` cleared | — |
| Unlisted posts, none (R-260) | the routing has a filtered collection; every published post is listed by its owner | "Every post appears on Home or a collection" · pass | — |
| Unlisted posts, some (R-260) | a post a collection or Home owns but whose filter does not list it | a warning row naming them; Ship it stays pressable | — |
| Unlisted posts, unread | the site's posts cannot be read | a warning row saying the check could not run; never blocks | — |
| Off-list write (DW-54) | the deploy path asked for a write outside `ADMIN_WRITES` | `write_not_allowed`; an `admin_write / denied` audit row; nothing sent | — |
| Emptied typed text (DW-349) | a non-catalog text prop in fallback mode emptied | its element is removed on the canvas and in the theme; the sidebar's text box brings it back; a catalog text still returns as `{{t}}` | — |

</frozen-after-approval>

## Code Map

**Deploy tables (no code reads them yet).** `supabase/migrations/20260904120000_complete_schema.sql` is frozen, and
`SCHEMA.sql` is identical for this block (`S:434-528`).
- **Enums** (`:405-407`): `deploy_status` (`compiling, checking, uploaded, live, failed`) and `job_stage` (no
  `awaiting_ship`).
- **`deploy_jobs`** (`:411-425`): `site_id`, `stage`, `cancel_requested`, `deploy_id` (no FK), `error jsonb`,
  `stage_timings jsonb`.
- **`deploys`** (`:427-461`): `version`, `theme_name`, `status`, `activated`, `artifact_path`, `artifact_bytes`,
  `gscan jsonb`, `settings_snapshot`, `activated_at`.
- **`project_site_bindings`** (`:465-475`): PK `(project_id, site_id)`, `unique (site_id, theme_name)`. Its existence
  freezes `projects.slug` (`guard_slug`, `:1306-1317`).
- **Grants.**
  - The tenant may read only. It may update `cancel_requested` alone, and only while `stage` is `queued`, `compiling`
    or `checking` (`:883-886`, `:1223-1224`).
  - The service role has full CRUD (`:1163-1177`).
  - The buckets: `deploy-artifacts` is private and server-only (`:1490-1495`, `:1563-1565`).
- **`custom_settings.bound_to`** carries an inline `--` comment and no `COMMENT ON` (`:319`, `S:348`).
- **The RLS gate.** `supabase/tests/rls.sql` is byte-identical to `RLS-TEST.sql`. Its deploy blocks are at `:196-203`,
  `:245-250`, `:270-275`, `:305-317` and `:596-603`.

**The spine.**
- AD-11 (`ARCHITECTURE-SPINE.md:185-187`): 300 s, 4096 MB, and "one invocation".
- AD-13 (`:198`).
- AD-19 (`:242-244`): the lock is 7.25's.
- AD-20 with F-075 (`:251-252`): `awaiting_ship`; Ship it resumes the same row.
- AD-24 (`:288`): the `EEXIST` sentence.
- The Stack table's stale 2048 MB (`:489`).

**The chokepoint, `apps/web/server/ghost-admin/`.**
- `admin-rule.ts`:
  - `ADMIN_WRITES` `:120-129` (`theme_upload` `POST /^themes\/upload\/?$/`, `theme_activate`
    `PUT /^themes\/[^/]+\/activate\/?$/`);
  - `permitted` `:151`;
  - `majorOf` `:204`;
  - `adminRequest` `:234-257` (a `FormData` passes with no Content-Type);
  - `ghostCode` `:267`.
- `index.ts`:
  - `CallResult` `:48-67` (`text`, `bytes`);
  - `TIMEOUT_MS = 15_000` `:69`, covering the whole call; there is no per-item override, and §76's uploads ran with
    180 s;
  - `call` `:345` (`kind`);
  - `fetchWithKey` `:382`;
  - the denied path `:403-411` (`admin_write / denied`, then a throw of `write_not_allowed`).
- `db.ts` is the only `postgres` importer (`max: 1`).

**Story 7.17's routes step.**
- `apps/web/server/routes-upload.ts`:
  - `offerRoutes({projectId, siteId, userId, route}, io)` `:90`;
  - `verifyRoutes` `:146`, which needs only `routes_last_offered`;
  - `RoutesIo` `:53`;
  - other chokepoint errors are thrown on for this story's retry (`:74-82`).
- `server/routes-io.ts:15` `ROUTES_IO` is the pattern for the deploy io: the service role, scoped by `user_id`, with
  `disconnected_at is null`.
- `apps/web/lib/routes-upload.ts`:
  - the outcomes `:24-29`;
  - `routesAnswer` `:84`;
  - `routesWrite`;
  - `routesForm` `:124`;
  - `downloadHref`;
  - `ROUTES_FALLBACK_WORDS` `:138`.
- `components/routes-fallback.tsx:34` `<RoutesFallback siteId cause file heading />`, whose Verify posts
  `verifyRoutesAction` (`sites/actions.ts:1510`).

**`apps/web/server-wiring.test.ts`.** The service-role list is `:105` (`allowed` `:150`). The chokepoint list is `:424`
(`allowed` `:467`).

**The compiler and its gates.**
- `packages/theme-compiler/src/compile.ts`:
  - `CompileInput` `:110-171`;
  - `CompiledTheme` `:212` (`files`, `css`, `js`, `custom`);
  - `requiredTemplates` `:252`;
  - `compileTheme` `:869`;
  - the refusals: language `:873`; bad keys `:875-881`; routed/lists `:884-897`; `noC0` `:900-902`; card designs
    `:915`; a stale design `:969-972`; render `:1002`; the dark-hook collision `:1010`; markup and V1 `:1252` (via
    `checkChromeText` `:557-580`); settings `:1259`, plus `:784-810` through `SETTING_WORDS`.
- `gate/index.ts:14` `gscanGate(files, major)` returns a `Verdict` (`verdict.ts:31`, `Finding` `:18-30`;
  `page_switch_unused` is `:79-84`).
- `gate/quality.ts:859` `qualityGate(files, {pack, library})`.
- `gate/gscan.ts:62-87` writes a fresh `mkdtemp` and loads `gscan4`/`gscan6` with a dynamic `require`.

**`tools/pilot-theme.mjs` is the only full assembly.**
- `library()` `:85`.
- `poolFonts` `:101`, which reads `files/` and `licences/`.
- `moduleSources()` `:106`.
- `ghostCards()` `:118`.
- `SCAFFOLD` `:132` is CI's alone.
- `new JSDOM(…)` `:207`. `jsdom` is a devDependency only.

**The app's readers.**
- `lib/pilots.ts`: `pilotIds` `:38`, `pilot` `:48`, `docRefusal` `:74`, `poolFont` `:143` (`files/` only).
- `lib/style-guide.ts:47` `PACKAGES()` is how disk files reach a function. `tools/check-traces.mjs:52-80` covers neither
  `fonts/licences` nor `library/modules`.
- The pack rule: `lib/style-pack.ts` (`ownPacksOf` `:137`, `packIdOf` `:142`, `presetRecord` `:151`), `presetOf`
  (`packages/library/src/packs.ts:126`), and `packOf`/`pairingFonts` (`lib/pack-edit.ts`). The client composes them at
  `editor.tsx:925-938`; no server helper does yet.
- `lib/editor.ts`: `CANVASES` `:34`, `labelOf` `:99`, `canvasOfPageTwoKey` `:194`, `fileOfKey` `:203`.
  `fileOfKey('index')` is `index.hbs`, which the compile refuses.
- `(editor)/read.ts:285` `editorData`: the reads to mirror, never the docs to ship.
- `apps/web/next.config.ts:30` `transpilePackages`; there is no `serverExternalPackages`.
- `apps/web/vercel.json` has crons only, and no `functions` block.

**The editor.**
- `editor.tsx`:
  - the absence comment `:335`;
  - the bar's right column `:5694`; the hidden cluster `:5701-5743`; Preview's comment `:5733`;
  - ⋯ `#editor-more` `:5745-5765`; the `more` rows `:5355-5370`;
  - `flush` `:2001-2125` (401 at `:2043`, 423 at `:2072-2099`, other non-ok at `:2101`, retry at `:2122`);
  - `land()` `:2280`; `takeOver` `:2346-2430`; the poll `:2458-2490`;
  - `<LockTakeover>` `:6640`.
- `components/kit/button.tsx:70-89` `SplitButton({children, menuLabel})`: no `onClick`, no menu, no busy state.
- Also in the Kit: `radio-card.tsx` (`RadioCards` `:10`, `RadioCard` `:82`), `submit.tsx:124` `Submit`, and
  `dialog.ts:47` `wideSheet` (520px).
- `globals.css:386-397`: 44px under `pointer: coarse` inside `[data-editor]`.
- `lib/keymap.ts`: `Gesture` `:33-39`, `EDITS` `:44-51` (exhaustive), the Ship it row `:126`, `sheetRows` `:136`,
  `shortcutFor` `:188-208`.
- The tests that pin ⌘⏎ as owed: `keymap.test.ts:107-119`, and `tools/keyboard/journey.spec.mjs:2051` and `:2058`.
- `lib/lock.ts` `LOCK_COPY` `:271-309`: `willBeLost`, `lossIsFinal`, `takingOver` and `wait` are reused.
- `components/editor/lock-takeover.tsx`: its strings are props.
- `lock/route.ts` reads with the user's own client, because `edit_locks` has no service-role grant.

**Sentences already in the app.**
- `lib/health-rule.ts:39`: "Ghost said no — this Admin API key no longer works. It was regenerated or removed in Ghost
  Admin."
- `lib/connect-rule.ts:532`: `keysPath`.
- `lib/probe-rule.ts:477` `capabilityOf`, and `:501` B15's own words (`PREVIEW_COPY`).

**Routing.**
- `packages/section-runtime/src/routes.ts`:
  - `ROUTE_WORDS.unreadable` `:162`;
  - `RESERVED_SEGMENTS` `:195`, which already refuses `paged`, `index`, `tag` and `author` (DW-369);
  - `negate` `:306`, `indexNode` `:332`, `indexFilter` `:338`;
  - `routesYaml` `:503`, `validateRoutes` `:543`;
  - `routedOf` `:637`, `listsOf` `:696`, `holdsFor` `:757`.
- `routes.test.ts:142` covers static routes only.
- `projects/[id]/routes/page.tsx:79-90`: unreadable leaves `config` null. In `routes-manager.tsx`, the list `:256`, the
  YAML pane `:283`, the sheet `:287` and the confirm `:310` are then all absent.

**DW-349's mechanism.**
- `packages/section-runtime/src/core.ts`: `guardMode` `:567-570` (text defaults to `fallback`), and the `data-prop`
  loop `:1310-1319` (fallback keeps the authored text; only `hide` removes the element).
- Promoted texts already hide (`:244`, `:1286-1288`).
- The affected props: A22 #1's `heading`, `proofLine`, `subscribedText` and `manageLabel`, and A4 #13's `headline`.

## Tasks & Acceptance

**Dev gate:** Questions 1–3 are ruled (R-259–R-261). The Schema phase is its own push, before any code (R-99).

**Execution — Schema phase (pushed first, alone):**
- [x] `supabase/migrations/20261019120000_deploy_wizard.sql` — change the schema:
  - `alter type public.job_stage add value 'awaiting_ship' after 'checking'`;
  - add `deploys.quality jsonb` (the `QualityVerdict`) and `deploys.inputs_sha256 text`;
  - set DW-355's comment: `comment on column public.custom_settings.bound_to is` the three shapes (`control`, `prop`,
    `token`) as `custom-settings.ts:288-291` states them;
  - if the tenant's SELECT on `deploys` is column-granted, add the two columns to it.

  Rationale: AD-20's F-075 stage, 7.8's column, the staleness test, and DW-355.
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` — identical: the enum in
  that order, the two columns, the corrected inline comment and the same `comment on`. Rationale: the gate diffs
  `pg_dump -s`.
- [x] `supabase/tests/rls.sql` and `RLS-TEST.sql` (byte-identical) — the tenant reads the new columns of its own deploy,
  never another's, and writes neither. The server-asserted list (`:596-603`) names them. Rationale: AD-31, with the
  withheld-migration control aborting at the 7.18 block.

**Execution — Dev:**
- [x] `packages/section-runtime/src/core.ts` — DW-349: in the `data-prop` loop, an EMPTY non-catalog typed text in
  `fallback` mode removes its element on both emitters, as `hide` does. Catalog-linked props are unchanged.
  `agreement.test.ts` and `ad36.test.ts` gain that vector, with a non-empty control. Every design snapshot stays
  byte-identical. Rationale: the ruling of 2026-10-08, so V1 can no longer fire on an emptied heading.
- [x] `packages/theme-compiler/src/compile.ts` — export `REFUSAL`, the leading words of each customer-caused throw, and
  throw through it. No behaviour changes. Rationale: one spelling the plain-words table keys on, held by a test that
  reaches each throw for real.
- [x] `routes.ts`, `routes.test.ts`, `projects/[id]/routes/{page.tsx,routes-manager.tsx}` — routing:
  - DW-364 per R-260: `indexNode`/`indexFilter` emit the ruled form, `holdsFor`'s listing reading follows, and every
    fixture stays accepted by both pinned NQLs;
  - R-260's check: `unlistedPosts(config, posts, now)` beside `holdsFor` — for each post, the collection that owns it
    (YAML order, the index last; ownership reading) and whether its filter LISTS it (listing reading). A post owned and
    not listed is named. Its test holds the old index filter naming an untagged post (the control) and the new one
    naming none;
  - DW-369's collection and channel rows at `/paged/`, `/index/`, `/tag/` and `/author/`;
  - S9b's line "Deploys are blocked until routing is valid — the Ship button explains why." shown whenever the stored
    routing has problems;
  - DW-362 per R-261: the reset sheet and `resetRoutes` in `routes/actions.ts`, through the same save path and
    `sync_project_doc` rule.
- [x] `apps/web/lib/routes-upload.ts` and `server/routes-upload.ts` — DW-371:
  - `routes_unverified` writes `routes_last_offered` = F with no cause, so Verify upload can compare;
  - `kept` over Ghost's default, when the project is at the default, clears `routes_fallback`;
  - `settle`'s failed write keeps the outcome and logs.

  Rationale: routine calls 15a–d.
- [x] `apps/web/lib/deploy.ts` (new, pure, no imports from `server/`) — the whole rule:
  - `STEPS` (Destination · Check · Ship · Live, a list 7.19 and 7.20 add to);
  - the stage → step map;
  - `versionOf(n)` (`${n}.0.0`) and `versionLabel` (`v${n}`), and `themeNameOf(slug)` (`inflozo-${slug}`);
  - `inputsHash(reads, release)`: sha-256 over canonical JSON of every row the compile read, plus
    `VERCEL_GIT_COMMIT_SHA`;
  - `uploadAnswer(result)` and `activateAnswer(result)`, each to an outcome or an AD-24 code;
  - `refusalWords(error)` over `REFUSAL`;
  - `fileLabel(file, names)` (a template or section partial to its canvas label, else null);
  - `checkRows(verdicts, major, required)`;
  - `DEPLOY_WORDS`.

  Rationale: one rule module (R-170), unit-tested over the matrix.
- [x] `apps/web/lib/style-pack.ts` — `enginePackOf(style_pack)` returns `{ pack, pairing }` by the editor's rule.
  `editor.tsx:925-938` calls it. Rationale: one rule for the canvas and the compile.
- [x] `apps/web/server/deploy/zip.ts` (new) — a deterministic ZIP writer: sorted entries, DOS time 1980-01-01, deflate
  through `node:zlib`'s `deflateRawSync` and `crc32`. Rationale: no dependency, and identical bytes for identical files
  (AD-14).
- [x] `apps/web/server/deploy/project-input.ts` (new) — `compileInputOf({ projectId, siteId, userId })`. It reads,
  owned, the raw `project_templates` (through `parseDoc`/`docRefusal`, skipping orphan route docs), `projects`,
  `custom_settings`, `translation_overrides`, `card_designs`, `routes_config` and the current `custom_templates`, and
  the site. It returns `CompileInput` and the reads for the hash. Library, fonts (`files/` and `licences/`), modules and
  Ghost's cards come through `PACKAGES()`, as `pilot-theme.mjs` reads them. Rationale: the shell the compile has never
  had.
- [x] `apps/web/server/deploy/run.ts` (new) — `preflight`, `ship`, `activate`, `cancel` and `view`, each taking a
  `DeployIo` handed in (the `offerRoutes` pattern). Each writes the stage and `stage_timings` at every edge, checks
  `cancel_requested` between stages, applies the retry rule, writes the binding on the first accepted upload, and calls
  `offerRoutes(…, ROUTES_IO)` after activation. Rationale: one testable shell.
- [x] `apps/web/server/deploy/deploy-io.ts` (new) — the real io: the service role scoped by `user_id`, storage,
  `call()` with a per-item timeout, the gates and `JSDOM`. Rationale: named on both `server-wiring.test.ts` lists.
- [x] `apps/web/server/ghost-admin/index.ts` — a per-item timeout (`theme_upload` 120 s; every other item keeps 15 s).
  Rationale: one 15 s budget covers DNS, the upload and Ghost's own gscan.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/route.ts` (new) — handles POST
  `{ intent, session, job?, mode? }` and GET `?job=`. It checks the lock (the user's own client), answers the job id,
  and runs the work in `after()`. `export const maxDuration = 300`. Rationale: one door, the lock route's pattern.
- [x] `apps/web/package.json`, `next.config.ts`, `vercel.json`, `tools/check-traces.mjs` — wire the function:
  - depend on `@inflozo/theme-compiler` and `jsdom` (30.0.1, already locked);
  - `serverExternalPackages: ['jsdom', 'gscan4', 'gscan6']`;
  - set AD-11's 4096 MB where Vercel lets it be set (read in the project's settings through the API first);
  - check-traces holds `fonts/licences`, `library/modules`, `vendor/cards` and both gscan trees reaching the route.

  Rationale: 7.7's "proved on Vercel within the function's limits".
- [x] `apps/web/components/kit/button.tsx` — `SplitButton` takes `onPress`, `busy`, `menu` (the Kit's `Menu`) and
  `label`. Rationale: S4's control, used once.
- [x] `apps/web/components/editor/deploy-wizard.tsx` (new) — the modal, the rail, the four steps, and the endings (Live,
  S8d′, D2e, D2f, and the routes outcome with B16). It polls `view` while the stage is not terminal, announces each
  stage, and draws the static confetti under reduced motion. While the server checks run, it reads the linked site's
  published posts in the browser through `lib/live-content.ts`'s reader (the canvas's own path and Content key; 100 a
  page, within the reader's request ceiling) and draws R-260's row from `unlistedPosts`. Rationale: S8, D2, R-260.
- [x] `editor.tsx` — the editor's half:
  - Ship it after `#editor-more`, visible at every width, labelled "Ship it" or "Ship update";
  - the ▾ menu's rows;
  - ⌘⏎;
  - D8g through `<LockTakeover>` for a reader;
  - Run checks awaiting `flush`;
  - "Fix in editor" closing the wizard on that canvas;
  - delete the absence entry at `:335`.

  Rationale: DW-238, R-145.
- [x] `apps/web/lib/lock.ts` — D8g's strings in `LOCK_COPY` (Words). Rationale: one list.
- [x] `apps/web/lib/keymap.ts`, `keymap.test.ts`, `tools/keyboard/journey.spec.mjs` — the `ship` gesture classified in
  `EDITS`, the row bound (`keys: ['enter'], meta: true`), and "the map is complete" asserted. The wizard's journeys run
  against canned job states through `page.route`, each behind its control. Rationale: R-145.
- [x] Tests — the I/O matrix:
  - `apps/web/deploy.test.ts` (the rule);
  - `apps/web/deploy-run.test.ts` (`run.ts` over a fake io: every stage, cancel, abandon, stale, retry, binding,
    routes);
  - `apps/web/zip.test.ts` (read back with `inflateRawSync`; byte-identical twice);
  - `compile.test.ts` (each `REFUSAL` reached);
  - `server-wiring.test.ts`;
  - `busy.test.ts`.
- [x] `tools/probe/record-deploy.mjs` (new; §86; the main session, on the owner's go) — on T1:
  1. the pilot theme, zipped by `zip.ts`, uploaded and activated with the ADMIN key through `adminRequest`, and its page
     read;
  2. two concurrent uploads of one name, mapped by `uploadAnswer`;
  3. a planted fatal theme's 422, mapped;
  4. R-260's index filter listing an untagged post on Home (the old filter as its control, listing it nowhere);
  5. Casper restored and the probes deleted, both read back.

  Rationale: DW-51's theme half; standing rule 1 on the Admin key's upload right.
- [x] `tools/probe/run-verify-editor.cjs` — step 113, the Review's: production, a throwaway account connecting T1,
  the whole wizard, DW-54's denied row beside the upload's `admin_write ok`, and T1 restored.
- [x] Propagation at Dev:
  - **The spine:** AD-11 (a dated note: F-075 makes Ship it a second invocation; memory 4096), the Stack table's row,
    AD-10 (the theme upload is the second multipart write), AD-20 (`awaiting_ship` landed) and AD-24 (the new codes).
  - **The PRD:** FR-J8's dated note.
  - **EXPERIENCE:** D2f's heading, S8c's line, and no byte bar.
  - **The registers:** VERIFY-AT-BUILD (the Admin key's upload executed; the plan refusal read in source) and
    MEASUREMENTS §86.
  - **The ledger:** DW-51, 54, 238, 349, 353, 355, 358, 362, 364, 369 and 371 closed or re-owned.
  - **The epics:** R-259's moves already landed at the Create's Record (7.18b, 7.18c, 7.32, 7.19, 7.20 and 7.25's
    cards, Epic 7's preamble, R-195); Dev's story bullet goes in the epic context.
  - Finish with a grep for the old names (standing rule 7).

**Acceptance Criteria:**
- Given the editor at any width, when it loads, then Ship it is the coral split button of S4 after ⋯, 32px with a
  pointer and 44px on touch, with "Deploy options" as its ▾. Its label reads "Ship update" once the project has an
  uploaded or live deploy to its site. It **matches S4, S4d and D8a/D8b**.
- Given the ▾ menu, when it opens, then it carries:
  - Deploy & activate (⌘⏎), captioned "Ship v{n} and make it live";
  - Deploy only, captioned "Upload v{n}, keep v{prev} active";
  - Download routes.yaml, only while the project has routing.

  Download theme and History are absent (UX-DR3).
- Given ⌘⏎ anywhere in the editor, when pressed, then it does what Ship it does. The `?` card lists it, `sheetRows()`
  carries no deferred row, and the map is complete (R-145).
- Given a session reading along, when Ship it is pressed, then D8g opens with focus on **Wait** and **matches D8g**
  (R-189's wording). The wizard opens only after a successful take-over.
- Given the wizard open, when each step shows:
  - it **matches S8a, S8b, S8c, S8d and S8d′**, and D2e or D2f for "uploaded, not live";
  - the rail numbers its steps from `STEPS`;
  - focus is trapped and returns to Ship it on close;
  - Esc closes it except while uploading or activating.
- Given Pre-flight, when the checks finish:
  - "Theme compiled" shows the compile's time and the zip's size;
  - "Checking your theme (Ghost will love it)" carries "{e} errors · {w} warnings" over BOTH gates, with the three pass
    lines derived when they hold;
  - each finding is a collapsible row: its message, `detail` and `action` as text; `refs[0]` by its canvas label;
    "Fix in editor" where it has a canvas; the message alone when `refs[0]` is no template;
  - "routes.yaml is valid" shows when the project has routing;
  - "Warnings won't block your deploy." shows when nothing blocks.
- Given a routing with a filtered collection, when Pre-flight runs, then R-260's row shows: a pass when every published
  post is listed by Home or the collection that owns it, else a warning naming the posts, and a "could not check" warning
  when the site's posts cannot be read. None of the three blocks.
- Given any blocking row, when Pre-flight ends, then Ship it is greyed with the reason in its caption slot. The reason
  is S9b's for routing, and the class's plain words for a refusal. Nothing is uploaded.
- Given Compiling or Checking running, when the user presses Cancel, then the job ends `cancelled`, no Deploy row or
  object is left, and the wizard returns to Destination. Given Uploading or Activating, Cancel is greyed with "Once it
  starts, it finishes".
- Given each stage, when it starts, then the polite region announces it, and the outcome is announced once.
- Given a Live ending, when it shows, then the confetti plays once, and is static under reduced motion. "View site ↗"
  opens the site in a new tab and says so.
- Given a deploy that compiled the project, when it reaches Ghost, then Ghost received the artefact Pre-flight checked
  (same sha-256), the upload carried no Inflozo-set Content-Type, and one `admin_write ok` audit row exists per write.
  DW-51 closes on §86.
- Given the deploy function on Vercel, when Pre-flight runs on production, then both pinned checkers ran for the
  site's major within the function's limits. The function's size and memory are recorded from Vercel.
- Given a project with an emptied A22 #1 heading, when it is viewed on the canvas, in Preview and on the shipped site,
  then the heading is absent from all three. Typing in the sidebar's text box brings it back.
- Given the README, when the project has routing, then the compile was handed `routes` and the README carries Story
  7.17's routes step.

## Spec Change Log

**Dev (2026-10-18) — readings and departures, each a routine call told in one line (none changes what a surface does):**
- **`REFUSAL` is a tag, not a prefix match.** Four of the customer-caused sentences open with the customer's own words (a
  layer's or a setting's name), which cannot be parsed back out reliably. So `packages/theme-compiler/src/refusal.ts` holds
  the classes with their leading words, and every customer-caused throw goes through `refused(kind, message, parts)`: the
  compile's sentence is unchanged (the Error's name stays `Error`), and the class and its parts ride on the Error.
  `refusalWords` keys on the class. `compile.test.ts` reaches every class for real, with two unclassified throws as the
  control. DW-353's "why" is read at the throw (`unreadWhy`): two rows for one binding, a section that rendered nothing, or a
  prop left out with its element.
- **`enginePackOf` is server-only (DW-323), so the editor shares its RULE rather than calling it.** `lib/style-pack.ts` is
  imported by no client module, because it carries the font pool's record. The one rule is `lib/pack-edit.ts`'s
  `recordInForce` (the project's own record under the id, else the library's), which `enginePackOf` runs on the server.
- **The checkers load by their literal names.** `packages/theme-compiler/gate/gscan.ts`' computed `require(pkg)` made
  Turbopack bundle gscan's own files, and the build then failed on gscan's `lib/checks/` read (executed in a scratch build).
  One `LOAD` table now requires `gscan4` and `gscan6` literally, so they match `serverExternalPackages`. `apps/web` declares
  both aliases (one copy each in the store), and the route's trace carries their trees and Turbopack's `.next/node_modules`
  links (`tools/check-traces.mjs`, held against the scratch build).
- **`vercel.json` is unchanged.** Vercel sets memory only project-wide (R-262 below), and `vercel.json` cannot set it.
  `maxDuration = 300` is the route's own export.
- **One test file beyond the list:** `deploy-input.test.ts` runs the compile's shell over a fake database holding real stored
  rows, then the REAL compile and both REAL gates (0 errors on both pins). That is the proof that the shell assembles what
  `tools/pilot-theme.mjs` assembles.
- **R-260 reached two more files:** `apps/web/live-content.test.ts` (Home now lists the untagged post) and
  `tools/probe/record-theme-assembly.py` leg 19 (its DW-364 rows now assert R-260: on Home, not on the collection).
- **The release in the staleness hash** is the build's own `INFLOZO_CANVAS_V`. The CLI-built deployment carries
  `VERCEL_GIT_COMMIT_SHA` as an empty string (`next.config.ts`), and with that every release would hash alike.
- **The editor's roster keeps its own form of the pack rule.** `rosterOf`'s own-record test is `recordInForce`'s first branch
  and its library branch is the preset itself, so `editor.tsx:925-938` is left as it was (no behaviour to move) — the rule
  `enginePackOf` runs is the same.
- **Ship it's drawing, where the frames and the floor met:** 14px padding (the Kit frame's; S4's 16 cannot keep D8b's 720
  group centred), the ▾ 44px wide on touch (D8a draws 34, but D8a's own "≥ 44" touch rule is what the floor sweep holds), and
  the label as wide as the wider of "Ship it" and "Opening…" (R-98's `BusyLabel`). Kit `Button` gains heights 40 and 42 for
  S8's footers and the endings. S4d's divider is absent (the Kit `Menu` has none); Download routes.yaml carries no caption
  (none is in Words). The running stage rows are static (no spinner, no byte bar); a blocked Pre-flight greys Ship it at
  S8c's 35% with its reason under it. A Preview-only Destination is S8a′'s chip and B15's panel (title and body).
- **⌘⏎ from a focused Layers row** ships: `components/controls/layers.tsx` no longer takes a MODIFIED Enter as the row's.
- **Sizes step to MB** (`themeSize`): the frames draw "2.4 MB", which `sizeLabel` (a `routes.yaml`'s KB) could not say.
- **The harness** takes `x-inflozo-harness-ship: full | shipped | live | preview` for the journeys (`live` is R-264 (a)'s
  case); with no header it links no site.
- **Step 113 is written, never run.** It links the walk's project to T1 through the service key (the connect wizard's
  Skip links nothing; the product's site picker is 7.18b's), reads Home's listing through the Content API (with no staff token
  no `routes.yaml` is uploaded, so T1's `/` keeps its own routing), proves the artefact unchanged from Pre-flight to Live
  on Inflozo's side (Ghost answers no hash), and runs only with `T1_WRITES=1` — a fresh go per run. The Review iterates it
  as a cut copy (steps 1–5 + 113) first.
- **The recorder's `--t1` run** (MEASUREMENTS §86) ran in the main session on the owner's go and held every row; it
  closed DW-51 and DW-364 and recorded R-264's `themes[0].active` (below).
- **The routes outcome at the ending** rides in `deploy_jobs.stage_timings.routes` (NFR-9's structured log; no migration).
  B16's file is `sites.routes_last_offered`, read by the wizard's GET.

**Dev (2026-10-18) — the three questions Dev raised, each ruled option 1 by the owner the same day:**
- **R-262 (Question 4) — the deploy runs at 4 GB.** The Vercel project's Function CPU is Performance (4 GB / 2 vCPU) for every
  function, set through Vercel's API and read back by the main session; AD-11's 4096 MB is in force. The spine's AD-11 note,
  its Stack row and VERIFY-AT-BUILD 73 say so. No code changed.
- **R-263 (Question 5) — the bar below 768 on touch.** On a touch screen that is not a phone and narrower than 768px, Undo and
  Redo move to the top of ⋯ (the same handlers and availability, `aria-disabled` when unavailable) and the centre group hides
  the words "Template" and "View as" (their values and the eye stay, the full accessible names kept); at 768 and up nothing
  changes. It amends R-143 at that width only. `floor.spec.mjs` sweeps 600, 640 and 720 on touch, Home and the Paywall,
  beside the DW-283 stop and a control showing the overflow without the rule.
- **R-264 (Question 6) — Deploy only's two guards.** (a) `lib/deploy.ts`' `uploadOnlyBlock` greys the ▾ row and S8a's card,
  with R-264's sentence in each caption slot, while `ShipState.liveHere` holds (the site's latest activated deploy is this
  project's, read in `read.ts`); a greyed press opens nothing, and the route refuses a `ship` in mode `upload` with 422
  (`run.ts`' `uploadOnlyRefused`, asked again in `ship`). (b) `uploadAnswer` reads `themes[0].active`, and an upload Ghost
  answers active is live at once in both modes — no `PUT activate`, routes offered, the ending Live (`goLive`). The owner's
  manual test now sees D2f on the FIRST deploy (steps 8–10) and Deploy only greyed after it (steps 12–13); walk step 113 and
  this spec's Walk list follow the same order; `record-deploy.mjs` leg 1b records the flag (the first upload, under an
  inactive name, answers false — the control). Fact F8 records the source reading.

**Dev (2026-10-18) — the main session's audit of the implementation, each a routine call:**
- **Question 5's options were re-measured before the owner saw them.** The first draft's recommendation (Undo and Redo into ⋯
  alone) fitted only from 720 on touch, and 720 itself — the editor's floor — was already broken on touch with no test
  measuring it; the question carried the measured table and the combination that fits from 600 (R-263).
- **One Ship it per row.** Two presses could each start `ship()` on the same `awaiting_ship` row and upload twice. `run.ts`'
  clock gains `claim(stage)` — the stage write made only while the row still stands where it was read
  (`deploy_jobs.update … eq('stage', from)`, `jobs.claim` in `deploy-io.ts`) — and `ship()` claims the row off
  `awaiting_ship` (to `compiling` when stale, else `uploading`) before any work, `activate()` claims it to `activating`. A
  second press's invocation finds the row moved and does nothing. `deploy-run.test.ts` holds it (two concurrent ships, one
  upload; two re-activates, one PUT; a later row still ships — the control), and fails with the claim removed.
- **R-260 on Home, end to end (§86 leg 6).** The recorder's leg 4 judged Ghost's SQL through the Content API alone, while
  this spec asks for the untagged post "on Home". Leg 6 uploads the emitted `routes.yaml` with the staff token, reads every
  page of `/` for it, uploads the old-filter control (the only hand edit, checked to be one line) and finds it on none, and
  restores T1's own file byte for byte. Its first T1 run voided on the recorder's own `indexFilter(config)` call (the
  function takes the collections), with the theme `finally` restoring Casper; the second held every row.
- **The owner's step 9** said to press View site on D2f, which has no such button (Words); it opens the site in a new tab.

**Fix (2026-10-19) — the owner's two findings, before the Review** (`## Owner's test findings`): jsdom bundled, not an external
(`next.config.ts`, `patches/jsdom@30.0.1.patch`, `tools/check-traces.mjs`); every gscan check file preloaded by its literal
name so the trace carries what the checks require (`gate/gscan.ts`' `preloadChecks`, its test, check-traces' touched-files
guard); a copied tab a session of its own
(`lib/lock-client.ts`, the two settings pages, a journey, DW-242's plant). The Wiring task's `serverExternalPackages: ['jsdom',
…]` is superseded by the first.

**Review (2026-10-19) — five layers (Blind Hunter over the product and over the tests and tools, Edge Case Hunter, Verification
Gap, Acceptance Auditor) and the real-infra checks in the main session; every patch a routine call, none changing what a
surface is meant to do:**
- **Routes "failed" at the ending named Ghost's reason, then looked it up again** as if it were a key, so every failed routing
  upload said "something went wrong on our side". The wizard now shows the stored reason (a new journey, with the old sentence
  as its control).
- **Pre-flight drew "Theme compiled" for a compile that never ran** (a routing or version block closes the compiling stage
  before any compile) **and a green "0 errors · 0 warnings" for checks that stored no verdict.** "Theme compiled" now needs the
  zip's size, and the checks are finished only when their verdicts are stored; otherwise the row is "{Stage} failed".
- **A checker that could not run** (`theme_check_failed`, production's first Pre-flight at the Fix) **showed "Required templates
  present" and "No deprecated helpers" as passes and "Fix the error above to ship."** `checkRows` draws no pass line for a check
  that did not run, and the caption is the gate's own "Try again in a moment." (`deploy.test.ts`, a journey).
- **S8d′'s heading** is the frame's "Uploading to Ghost failed" (`STAGE_NAMES.uploading` is S8c's row name).
- **The wizard no longer closes when the lock is lost while it uploads or activates** (DW-241's sweep spares `[data-unstoppable]`),
  and **closing it after any job that reached Ghost re-reads the page**, so "Ship update" and the versions follow a failed
  activation too.
- **Cancel** writes its flag only while the row still stands where it was read (the service role skips the policy's stage test),
  Pre-flight asks once more after writing `awaiting_ship`, and Ship it honours a Cancel already set (three `deploy-run.test.ts`
  tests, each failing with its line removed).
- **The wizard's read** answers 502, not 404, when the job cannot be read, so a database hiccup no longer sends it back to
  Destination mid-upload; a 409 at Run checks says Destination's "isn't linked" sentence.
- **The compile's reads are ordered** (templates by key, settings in the editor's own order, translations by key), so unchanged
  rows never hash apart and force a re-compile at Ship it (`deploy-input.test.ts` holds every read's project, site, owner and
  order).
- **Every door's first read is under the retry rule**, R-264's re-ask at Ship it sits inside the job's failure handling (a throw
  there fails the job instead of leaving it resting under "Shipping…"), and clearing a refused plan's mark after an accepted
  upload is best-effort (a failed write is logged, never the ship's failure).
- **The copied-tab rule (the owner's finding 2) judged only pages that read the lock,** so a reload on Projects left the mark and a
  project ⌘-clicked from there shared the first tab's session again. The shell now judges every signed-in page load
  (`tab-session.test.ts`, with the unjudged load as its control).
- **⌘⏎ on a Ghost row in Layers** ships, as on a section's row; `lib/deploy.ts` drops three unused imports (one pulled `cards.ts`
  into the wizard's bundle).
- **Checks that could not fail:** `preloadChecks`' test compares the literal names with each pin's `lib/checks/` (the module cache
  it read was already full; with one name duplicated it now fails); the refusal-words test derives its classes from its own
  cases; the "never `disabled`" pattern now sees `disabled>` and `disabled/>`; `check-traces`' control is derived (every check
  file seen loading) instead of a written-down count, and a checker that throws is a FAIL line; the rail's numbering is anchored.
- **The walk's step 113e walks the server's Cancel** — a Pre-flight and its Cancel sent back to back through the route — because a
  whole Pre-flight on production (about 2.5 s) finishes before a press of the wizard's Cancel can land (five attempts lost the
  race at this Review: four found the checks already done, and one press was refused as past cancelling, which is right); the
  wizard's Cancel stays the journeys' and the owner's.
- **The walk's step 113 and §86's recorder, for T1's sake:** the start guard refuses ANY `inflozo-walk-113-` theme left by a killed
  run; DW-54's off-list write is a `DELETE` of a post id no Ghost holds (a real `POST posts/` would have made a post had the
  allowlist regressed); 113j waits for the step's last job to rest before restoring T1; 113c asks the route for a Pre-flight from
  the window that lost the lock (423, no job — the server's half of the lock, until now walked only as D8g); the recorder's
  restore runs each call in its own try, and every committed cell is scrubbed.
- **Deferred, each with an owner on its card** (`deferred-work.md`): DW-372 (the version count under 7.22's retention), DW-373 (a
  second Pre-flight beside a running one, 7.25), DW-374 (Ship it re-checking the project's link, 7.18b), DW-375 (a plan-refused
  site's way back, 7.18b), DW-376 (a failure after Ghost took the theme, 7.31's sentence), DW-377 (R-260's read on a very large
  site, 7.18b), DW-378 (the checks still unexecuted, 7.18b).
- **The owner's rulings at the Review (2026-10-19):** R-265 approves the seven routing reasons as written (Words), and R-266
  draws the bar's Theme settings link as a gear with its words kept as its name and tooltip, and spaces the bar's right side at
  S4's 8px — `editor.tsx`, `kit/icons.tsx` (`ThemeSettingsGear`, Tabler's `settings`, one more of R-92's stated exceptions),
  `editor.test.ts` (the paths against `tabler.json`) and a journey holding the centring at 1536, 1440, 1366 and 1280 beside
  "Ship it" and "Ship update".
- **AD-24's envelope carries `href` beside `action`** — the fix's address, as `lib/deploy.ts`' header states; Ghost's text is still
  only `detail`. **A job that failed at activating leaves its deploy `uploaded`**, not `failed` as the stage table's last row
  reads: the theme is on the site (the matrix's "Key refused" row), and the history's reading is 7.23's.

## Design Notes

### Rulings this spec is written to

- **R-22, R-74, R-80–R-83, R-98, R-99, R-145, R-170, R-189, R-195, R-238.**
- **AD-20's F-075** (2026-09-03) is the dated ruling over AD-11's "one invocation":
  - Pre-flight and Ship it are two invocations on one row.
  - Cancel ends where Uploading starts.
  - AD-19's lock covers uploading and activating only.
- **R-254** (Ship it calls `offerRoutes` after activation; B16 at the ending) and **R-255** (Ghost's default goes back
  only over Inflozo's own file).
- **7.6's Question 2** (DW-349, hide), **7.7's** (the gscan rows, warnings deploy), **7.8's** (the quality rows,
  customer-caused findings as warnings) and **7.10's Review** (DW-353).
- **R-259, R-260, R-261** (owner, 2026-10-18): Questions 1–3 below.

### Ruled values (the one table a ruling changes)

| Question | Planned | What it sets |
|---|---|---|
| Q1 · R-259 | option 1 — three stories | This spec is 7.18a. 7.18b takes the Switch picker, the site linking and every warning-only row, with DW-297's question. 7.18c takes DW-304 (with its question), DW-307 (its own Schema) and DW-308. 7.32's "the wizard state matches D2e … the deploy-only ending matches D2f", (4), (5) and the one-click activate come here; 7.32 keeps D2d, (1)–(3) and (6). The rail's two first-deploy steps stay 7.19's and 7.20's. 7.25's lock span gains the routes upload. |
| Q2 · R-260 | option 1, plus option 2's check | `indexNode` keeps a post with no primary tag (and no primary author) on the index's LIST. The exact NQL is chosen at Dev from Ghost's own code and is proved on T1 (§86 leg 4) before any Ship it uploads a routing. **And** Pre-flight's check names any post no page would list (`unlistedPosts`, read in the browser). |
| Q3 · R-261 | option 1 — reset | Routes & Templates offers "Start again from Ghost's default routing" when the stored routing cannot be read. The Ship button's reason links there. |
| Q4 · R-262 | option 1 — Performance | The Vercel project's Function CPU is Performance (4 GB / 2 vCPUs), set through Vercel's API at Dev and read back; it is the only way Vercel sets memory (project-wide, never in `vercel.json`). AD-11's 4096 MB is then in force for every function. |
| Q5 · R-263 | option 1 — both, below 768 on touch | On a touch screen that is not a phone and narrower than 768 CSS px, Undo and Redo move to the top of ⋯ (same handlers, same availability, `aria-disabled` when unavailable), and the centre group hides the words "Template" and "View as" (the values and the eye stay; each control keeps its full accessible name). Amends R-143's "the pair will not collapse" at that width only. `floor.spec.mjs` sweeps 600, 640 and 720 on touch, Home and Paywall, with no bar control outside the window. |
| Q7 · R-265 | option 1 — the seven as written | The routes "failed" ending's `{reason}` is one of seven phrases (`ROUTES_REASONS`, Words below), the failure screen's own words for each cause. |
| Q8 · R-266 | option 1 — a gear and 8px | The bar's "Theme settings" link is Tabler's `settings` gear, 28px, its words kept as its accessible name, ⋯'s row and its `title`; the bar's right side is spaced at S4's 8px (from 10). S4's centred group is centred beside Ship it from about 1300px up, 6px off at 1280. |
| Q6 · R-264 | option 1 — both guards | (a) "Deploy only" is greyed — the ▾ row and S8a's card — while Inflozo's own record says this project's theme is the one live on the site (the site's latest activated deploy is this project's), with the reason in its caption slot: "v{prev} is already live on {host}, so Ghost would switch to v{n} the moment it uploads. Use Deploy & activate." (b) Whenever Ghost's answer to an upload says the theme is active (`themes[0].active`), the deploy is live and activated, routes are offered and the ending is Live with confetti — never D2f — and no separate activation is sent. |

### Routine calls, one line each (said to the owner, not asked)

1. **Where the wizard lives.** It is a modal over the editor with no URL (S8a; EXPERIENCE `:233-235`: modes are never
   in the address).
2. **The two choices.** "Deploy & activate" and "Deploy only" are S8a's two radio cards, each a distinct choice, as
   FR-J8 asks. S4d's two menu rows each open the wizard with that card chosen.
3. **Confetti.** It shows on every Live ending: S8d draws it on v5. EXPERIENCE `:849`'s "first deploy that makes the
   site live" separates a deploy-only from its later activation, and both readings agree.
4. **Which credential.** The theme upload and the activation use the Admin API key, because 7.19 says a declined token
   still ships. No T1 run has executed it yet; every earlier upload used the staff token. So it is proved on T1 at Dev
   (standing rule 1).
5. **Two invocations.** Ship it is a second invocation, per F-075 over AD-11's sentence, which gets a dated note. Each
   POST answers with the job id and continues in `after()`.
6. **The artefact and staleness.** The artefact is stored at Pre-flight, and only when nothing blocks. Staleness is a
   hash of every row the compile read, plus the release. That covers "revision, library or pack" and more.
7. **One sentence for a refused key.** The 401 sentence is health's "no longer works" (`health-rule.ts:39`) — one
   sentence for one cause (R-170). The frame's "we'll pick up right here" becomes "then ship again", because nothing
   resumes a failed job.
8. **No byte bar.** The upload is one server-side request, so no real byte count exists (DESIGN `:518`). The row shows
   the size alone.
9. **S8c's second sentence waits for 7.31.** Its "we'll ping you" needs 7.31's notification. Until then S8c says
   "Usually under a minute.", and the wizard cannot be closed while it ships.
10. **The theme's name and version.**
    - The name is `inflozo-{slug}`, claimed in `project_site_bindings` at the first upload Ghost accepts (AD-19,
      VERIFY 30; deploy-only included).
    - The version is `{n}.0.0`, shown as "v{n}".
    - A 23505 on the binding is refused with a sentence.
    - The suffix, D1a and its test stay 7.24's.
11. **The advisory lock is 7.25's.** 7.25's card gains the routes upload inside its span, and `db.ts`'s fact (one
    connection; a `begin` cannot call `sql()`).
12. **The plan refusal.** Ghost(Pro)'s plan refusal is read in Ghost's source at Dev (the host-limit error on upload or
    activate, both majors) and mapped to FR-C2's sentence. It is executed when the Ghost(Pro) gate opens (VERIFY 1–2).
13. **"Version mismatch" (FR-J8)** is a site whose Ghost major is outside 5–6. It blocks at Pre-flight.
14. **No site, or a Preview-only site.**
    - With no connected linked site, Destination says so and links to Sites.
    - A Preview-only site shows B15's own words.
    - Neither has Run checks, and Switch is absent until 7.18b (UX-DR3).
15. **DW-371, decided as its ledger asks.**
    - (a) The unverified ending is a line plus Verify upload, with `routes_last_offered` = F and no cause, so no
      migration.
    - (b) A failed `settle` write keeps the outcome and logs it.
    - (c) A project back at Ghost's default, over a site that already holds the default, clears the card.
    - (d) No "last confirmed" column. The earlier-file edge is a stated ceiling.
16. **DW-353's unique `bound_to`.** Not added. Pre-flight's plain words name the two-promote case, and a delete in
    Theme settings ends it. A constraint would need every writer of `bound_to` traced first.
17. **DW-369** has held since 7.16a (`RESERVED_SEGMENTS`). This story adds its collection and channel test rows.
18. **Memory.** AD-11's 4096 MB is the dated ruling. The Stack table's 2048 is corrected.
19. **D2f's heading** is the frame's "Uploaded. Not live yet.". EXPERIENCE `:856`'s quote is corrected.
20. **A blocked Pre-flight** leaves a `failed` Deploy row with both verdicts and no artefact. A cancelled or abandoned
    one leaves nothing. The history's filtering is 7.23's.
21. **The Pro exit sheet** (12.3, B13a "before the snapshot gate") plugs in between Destination and Pre-flight. Nothing
    is built for it.
22. **The ▾ menu.** "Download routes.yaml" is built here: S4d draws it, no story owned it, and it uses 7.17's
    `downloadHref`.
23. **R-260's "no page".** The check counts Home and the collections, the pages that list the site's posts as its
    stream. Tag, author and channel pages list by subject, so an author page listing every post does not hide the gap.
    The read happens in the browser, through the canvas's own Content API path, so no new server fetch is added.

### The stages (AD-20, F-075)

| Job `stage` | Deploy `status` | Step | Cancel | Ship it |
|---|---|---|---|---|
| `queued` → `compiling` → `checking` | `compiling` → `checking` | Check | live | busy |
| `awaiting_ship` | `checking` | Check | — (Back) | live, or greyed with the reason |
| `uploading` → `activating` | `checking` → `uploaded` | Ship | greyed "Once it starts, it finishes" | — |
| `done` | `live` (activated) or `uploaded` (deploy only, or activation failed) | Live / D2e / D2f | — | — |
| `failed` | `failed` | Check (blocked) or Ship (S8d′) | — | — |
| `cancelled` | row deleted | Destination | — | — |

### Words

**Ship it and the menu.**
- The button: "Ship it", or "Ship update" after the first deploy; "Deploy options" for the ▾; busy "Opening…".
- The menu rows: "Deploy & activate" / "Ship v{n} and make it live", and "Deploy only" / "Upload v{n}, keep v{prev}
  active". On a first deploy the second caption is "Upload v1, keep your current theme active".
- "Download routes.yaml".
- Deploy only greyed (R-264), the reason in the ▾ row's and S8a card's caption slot: "v{prev} is already live on {host}, so
  Ghost would switch to v{n} the moment it uploads. Use Deploy & activate."

**D8g.**
- "Take over to ship?" and "Shipping needs the edit lock, and your other session is holding it."
- `willBeLost(n)` and `lossIsFinal`.
- "Take over and ship" (busy "Taking over…"), and "Wait".

**Destination.**
- The header and step names: "Ship it" · "Destination" · "Check" · "Ship" · "Live" · "Connected".
- The cards: "Deploy & activate" / "v{n} goes live the moment it's done.", and "Deploy only" / "Upload v{n}, keep v{prev}
  active for now." On a first deploy: "Upload v1, keep your current theme active for now."
- "Theme" and the mono name.
- The chip "v{prev} → v{n}", or "v1".
- "Run checks", busy "Starting…".
- No site: "This project isn't linked to a connected Ghost site yet." with "Go to Sites".
- Preview-only: B15's `PREVIEW_COPY`.

**Pre-flight.**
- "Pre-flight check." and "We compile and test everything before it touches your site."
- Running rows: "Compiling your theme…" and "Checking your theme…". Cancel's busy label is "Cancelling…".
- "Theme compiled" with "{t}s · {size}".
- "Checking your theme (Ghost will love it)" with "{e} error(s) · {w} warning(s)".
- The pass lines: "Ghost {major}.x compatible" · "Required templates present ({stems})" · "No deprecated helpers" ·
  "pass".
- "Fix in editor".
- "routes.yaml is valid".
- "Warnings won't block your deploy." · "Back" · "Ship it" (busy "Shipping…").

**R-260's row.**
- "Every post appears on Home or a collection" · "pass".
- One post: "“{title}” appears on no page — not on Home, not in any collection. Its own address still works."
- Several: "{n} posts appear on no page — not on Home, not in any collection: {first five titles}{, and {k} more}. Their
  own addresses still work."
- Unread: "We couldn't read your posts from {host}, so we couldn't check that every one appears on a page."

**Blocking reasons (the caption under a greyed Ship it).**
- Gate errors: "Fix the error above to ship." / "Fix the {e} errors above to ship."
- Routing: "Line {line}: {message}" and "Deploys are blocked until routing is valid — the Ship button explains why."
- Unreadable routing: "Your saved routing can't be read." with "Start again on Routes & Templates".
- Unsent edits: "Your latest edits haven't reached Inflozo yet, so we can't check them. Try again once they're saved."
- Version: "Inflozo ships to Ghost 5 and 6. {host} runs Ghost {version}."

**Plain words for the compile's refusals (`refusalWords`).**
- **Card designs (DW-358):** "Your card designs can't be read, so the theme can't be built. Open Editor cards and change
  any card, or press Reset to Ghost default on one — that saves a readable copy." with "Open Editor cards".
- **A setting nothing reads (DW-353):** "{Setting} is in Theme settings, but nothing on your site shows it any more —
  {why}. Delete it in Theme settings, or put back what it controlled." The `{why}` is one of:
  - "its hand-picked list has nothing picked";
  - "its section has no picture to describe";
  - "{Section} now uses a design where it works differently";
  - "two settings were made for it at the same moment".
- **A dropped condition** (a warning): "{Setting}'s "Only show when" names {Other}, which is parked, so Ghost will
  always show it."
- **The cap, a hidden setting, a deleted one, a changed one:** `SETTING_WORDS` as they are.
- **The dark-hook collision:** the compile's sentence, prefixed with the canvas label.
- **Translations:** "The translation of "{label}" can't be used: {overrideRefusal}. Fix it in Translations."
- **Language:** "Your project's language "{code}" isn't one Ghost accepts. Choose it again in Translations."
- **A stale design:** "{Layer} on {Canvas} uses a design Inflozo no longer has. Replace it, then ship."
- **Anything unclassified:** "Something in Inflozo went wrong while building your theme. It's our fault, and nothing
  reached your site."

**Shipping.**
- "Shipping v{n}…" and "Usually under a minute."
- "Uploading to Ghost" with "{size}"; "Activating v{n}".
- "checks passed · {e} errors" and "Once it starts, it finishes" beside "Cancel".

**Live.**
- "Live! Your site just got gorgeous."
- The chips "v{n}" · "{e} errors · {w} warnings" · "{t}s".
- "View site ↗", with "(opens in a new tab)", and "Done".

**Routes at the ending.**
- uploaded/unchanged: "Your routing is live on {host}."
- unverified: "Ghost took your routing, but we couldn't read it back to confirm it." with "Verify upload".
- failed: "We couldn't send your routing to Ghost: {reason}. Your theme is live; ship again to retry." — `{reason}` is one of
  (R-265): "Ghost refused the file" · "your site is busy or down" · "your site didn't answer" · "your site now answers at a
  different address" · "the routing isn't valid" · "the site is no longer connected" · "something went wrong on our side".
- fallback: B16.

**Failure (S8d′).**
- "{Stage} failed".
- Key: "Ghost said no — this Admin API key no longer works." / "It was regenerated or removed in Ghost Admin. Paste the
  new key, then ship again." with "Reconnect site".
- Same name: "Another deploy to this site is already running — try again in a moment."
- Ghost's check: "Ghost's own theme check refused this theme, which our checks should have caught. It's our fault." with
  Ghost's message as detail.
- Plan: FR-C2's "Your Ghost(Pro) plan doesn't accept custom themes — check or upgrade your plan (Publisher or higher)."
  with "Which Ghost plans work? ↗".
- Busy: "{host} is busy or down right now. Try again in a few minutes."
- Unreachable: "We couldn't reach {host}. Check it's online, then try again."
- Moved: "{host} now answers at a different address. Reconnect it in Sites."
- Too big: "Your theme is larger than {host} accepts."
- Infrastructure: "Something went wrong on our side before anything reached your site. Try again."
- Buttons: "Close", plus the fix.

**D2e.**
- "Your theme is on your site but isn't live yet."
- "v{n} uploaded cleanly. Ghost didn't switch to it, so {host} is still serving v{prev} — nothing on your site changed."
  On a first deploy: "…still serving its current theme…".
- The rows "Uploaded to Ghost · {size} · {t}s" and "Activating v{n} · Didn't complete".
- The chip "live: v{prev}".
- "Re-activate v{n}" (busy "Activating…") and "Leave it for now".

**D2f.**
- "Uploaded. Not live yet."
- "v{n} is on {host} and v{prev} is still what readers see. Make it live whenever you are ready." On a first deploy:
  "…and your current theme is still what readers see…".
- "Activating v{n} · Not requested", and the same two buttons.

**The routing reset (Question 3; undrawn, from S9's sheets).**
- "Start again from Ghost's default routing?"
- "Your saved routing can't be read, so this page can't show it. Starting again replaces it with Ghost's default. Your
  templates are kept."
- "Start again" (busy "Starting again…") and "Cancel", with focus on Cancel (UX-DR14).

**Announcements.**
- "Compiling your theme." · "Checking your theme." · "Checks finished: {e} errors, {w} warnings."
- "Uploading to Ghost." · "Activating v{n}."
- The ending's heading.

### Walk (step 113, production, the Review's; the owner's go for its T1 writes)

1. A throwaway account connects T1 through the wizard, with no staff token.
2. It places A22 #1, empties its heading, and adds a primary-tag collection. R-260's row reads pass, and with the old
   index filter planted it names T1's untagged post (the control).
3. A second window takes over through D8g.
4. Pre-flight's rows are compared with the two gates' verdicts. A planted unreadable routing blocks (a control), and so
   does a planted `card_designs`, through the service key.
5. Cancel during Checking leaves no row.
6. The first ship is ▾ → Deploy only (R-264): D2f, v1 uploaded and not activated, and T1 still on the theme it served before
   (the control). Re-activate v1: Live, and B16 at the ending (no token). The page has no heading, and the index filter's
   listing holds the untagged post.
7. "Ship update": ▾ shows Deploy only greyed with R-264's caption, and a press opens nothing and sends no deploy POST; S8a's
   card is greyed the same. Deploy & activate ships v2: Ghost's upload answer says it is active, so it is Live with no
   separate activation, and v1 is demoted.
8. DW-54: the product's `call()` is asked for an off-list write on the walk's site. The step reads its `denied` row and
   the earlier `admin_write ok`, and T1's theme list is unchanged.
9. Restore: Casper active, the probe theme deleted, T1's `routes.yaml` back byte for byte, the site disconnected and the
   account deleted.

Users and projects are counted back unchanged.

### T1 (§86, `record-deploy.mjs`, Dev, the main session, the owner's go)

- **The local half.** It compiles the pilot theme and the planted fatal theme, zips each twice (equal bytes), and
  gates them, with gscan's verdict as the control.
- **The T1 half** runs the legs in Tasks.
- **Its guards are `record-shim.py`'s.**
  - `start_guard` refuses a run when an `inflozo-probe-` theme is installed or active.
  - A `finally` restores Casper.
- **It reads keys in-process, never on argv.**

### Facts this spec rests on

- **F1. A same-name upload replaces the theme** (VERIFY 61). Its name is the zip's filename, not `package.json`'s name
  (VERIFY 30).
- **F2. Ghost's answers to an upload** (§25f, §15j, §76c):
  - 200 gives `themes[0]`;
  - a fatal gscan result gives 422 `ThemeValidationError`;
  - a corrupt zip gives 422 `ValidationError`;
  - two concurrent uploads give one 200 and one 500 "EEXIST … mkdir '/var/…'";
  - no failure leaves a half-applied theme.
- **F3. Activating a missing theme** gives 422 (`record-shim.py:191-198`, read in source). The body of a successful
  activation was never recorded, so §86 records it.
- **F4. The Admin key's right to `POST`/`PUT` themes** is a source reading only (`tokenPermissionCheck`), and so is §86
  leg 1's. The Admin key cannot `GET themes/` (403 on Ghost 6, 501 on Ghost 5; VERIFY 9).
- **F5. Ghost forgets a dropped setting's value at activation, and keeps a stored one across a new default** (§78g).
  That is 7.18b's warning, and nothing this spec writes changes it.
- **F6. The index filter `primary_tag:-'x'`** lists no post without a public primary tag in SQL, while ownership in
  memory holds (§84, `post.js:291-310`).
- **F7. Ghost(Pro)'s theme limits and the Starter refusal are unobserved** (VERIFY 1–3 ⛔). No T2 exists (R-238).
- **F8. An upload under the ACTIVE theme's name is live at once** *(read in source at Dev, 2026-10-18; R-264)*:
  `core/server/services/themes/storage.js`' `setFromZip` calls `activateFromAPIOverride` when the name is the active theme's
  (6.58.0 `:111-116`, 5.130.6 `:81-86`), and the answer carries `themes[0].active: true` (VERIFY-AT-BUILD 74; §86 leg 1b
  executes it).

## Owner's manual test

You test as a fresh account on the Ghost 6 test site (T1). Before you start, in **ghost6.inflozo.com's Ghost Admin**:
- make a new custom integration called **Owner test 7.18** and keep its Admin API key and Content API key open;
- download T1's current `routes.yaml` (the routes download in Ghost's settings — Deploy confirms the exact place on T1
  and writes it here).

Addresses that need your new project's id are written `…/projects/<your project>`. Copy the id from the address bar
after step 2.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the alias, and open the link in your inbox. | `umngkmr+ship718@gmail.com` | You land in the app, on Start. |
| 2 | `https://app.inflozo.com/sites` | Sites | Press **Connect a site** and finish the wizard with the integration's two keys. | `https://ghost6.inflozo.com` + the two keys | ghost6 is **Connected**, and a project linked to it opens. |
| 3 | `…/projects/<your project>` | Editor, Home | Look at the top bar. Then press ⌘K, add the newsletter design **Inline Row**, select it, and in the sidebar delete every word of its heading. | — | **Ship it** is a coral button after ⋯, with a ▾ beside it. The heading disappears from the canvas, and the rest of the section stays. |
| 4 | same | Editor, Home | In the sidebar's heading box, type a heading. Then delete it again. | `Get the Thursday letter` | The heading comes back as you type, and disappears again. |
| 5 | `…/projects/<your project>/routes` | Routes & Templates | Press **+ New collection**. Add **Primary tag** and type the tag. For Template choose **New template…** and type the name. Press **Create collection**. | `/tutorials/` · `craft` · `Tutorials List` | The collection is listed. |
| 6 | `…/projects/<your project>` in a second window (B) | Editor | In B, press **Ship it**. | — | "Take over to ship?" opens with **Wait** focused. |
| 7 | same (B) | Take over to ship? | Press **Take over and ship**. | — | Window A becomes read-only. In B the wizard opens on **1 Destination**: ghost6 **Connected**, **Deploy & activate** chosen, Theme `inflozo-…`, chip **v1**. |
| 8 | same (B) | Destination | Choose the **Deploy only** card, then press **Run checks**. | — | The card reads "Upload v1, keep your current theme active for now.". Then **Compiling your theme…**, then **Checking your theme…** (Cancel works here). Then "Theme compiled", and "Checking your theme (Ghost will love it)" with **0 errors** and at least the warning "The switch that hides a page's title and feature image does nothing on this site.". Then "routes.yaml is valid · pass", "Every post appears on Home or a collection · pass" and "Warnings won't block your deploy.". |
| 9 | same (B), then `https://ghost6.inflozo.com` in a new tab | Pre-flight | Press **Ship it**. When it ends, open the site in a new tab. | — | "Shipping v1…" and "Uploading to Ghost"; **Cancel** is greyed with "Once it starts, it finishes". Then "Uploaded. Not live yet." with "Activating v1 · Not requested", **Re-activate v1** and **Leave it for now**, and no confetti. The site in the new tab still shows its own theme (Casper). |
| 10 | same (B) | Uploaded. Not live yet. | Press **Re-activate v1**, then **View site ↗**. | — | "Activating…", then confetti and "Live! Your site just got gorgeous.". Below it: "Upload routes.yaml yourself". The site in the new tab now shows your design, and the newsletter has no heading. |
| 11 | ghost6's Ghost Admin, then the wizard (B) | B16 at the ending | Press **Download the file we generated**, upload it in Ghost where the card says, then press **Verify upload**. | the downloaded `routes.yaml` | "Ghost has your routes.yaml. Your routing is live." Press **Done**. Routes & Templates and Sites show no card. |
| 12 | `…/projects/<your project>` (B) | Editor → ▾ | Press the ▾ beside **Ship update**, then press **Deploy only**. | — | The bar now says **Ship update**. In the menu **Deploy only** is greyed, its caption reading "v1 is already live on ghost6.inflozo.com, so Ghost would switch to v2 the moment it uploads. Use Deploy & activate.". Pressing it opens nothing. |
| 13 | same (B) | Editor → Style pack, then the wizard | Make the text colour a pale grey, and accept the editor's "hard to read" warning. Then press **⌘⏎**, **Run checks**, then **Ship it**. | `#DDDDDD` | ⌘⏎ opens the wizard (v1 → v2) with **Deploy & activate** chosen, and the **Deploy only** card greyed with the same caption. After Run checks, Checking shows the contrast warning in the Style pack editor's own words, and Ship it is still pressable. Ship it ends on Live with confetti, and the site shows the pale text. Put the colour back afterwards. |
| 14 | ghost6's Ghost Admin → Integrations → Owner test 7.18, then the editor (B) | — | Press **Regenerate** on the Admin API key. In the editor, press **Ship it**, **Run checks**, then **Ship it**. | — | It fails at Ship: "Ghost said no — this Admin API key no longer works." with **Reconnect site**, which opens Manage keys. Paste the new key and ship again: Live. |
| 15 | ghost6's Ghost Admin, then `https://app.inflozo.com/sites` | Cleanup | In Ghost: **Settings → Design → Change theme → Casper → Activate**, delete the `inflozo-…` theme, upload the `routes.yaml` you saved at the start, and delete the Owner test 7.18 integration. In Inflozo: ⋯ → **Disconnect** on ghost6. | — | T1 is back as it was. |

## Owner's test findings

**Finding 1 (owner, 2026-10-19), before the Review — fixed in the Fix commit, re-test owed.** Run checks answered "Something
went wrong on our side before anything reached your site. Try again.", the browser's console showing `POST …/deploy 500`.
- **What production said** (Vercel's request log for `dpl_6167myuo9fcHFwcwrP7mthistAcd`, read with `VERCEL_TOKEN`): both
  POSTs (04:06:48Z and 04:07:28Z) died at the route's first import — `Failed to load external module jsdom-…: Error
  [ERR_REQUIRE_ESM]: require() of ES Module …/@exodus/bytes/encoding-lite.js from …/html-encoding-sniffer.js not
  supported`, nodejs24.x. Every deploy POST and GET answered 500, before reading anything.
- **The cause:** the deploy route loaded jsdom as a server external, so Node `require()`d it at run time, and jsdom 30 and its
  dependencies `require()` ES modules (`@exodus/bytes`, `css-tree`, `@asamuzakjp/*`) — which Vercel's functions refuse,
  though Node 24 allows it locally. That is why every local check passed. Reproduced locally: the production build under
  `next start` with `NODE_OPTIONS=--no-experimental-require-module` answered the same 500 with the same log line.
- **The fix:** jsdom is BUNDLED. `transpilePackages: [..., 'jsdom']` takes it off Next's own never-bundle list
  (`next/dist/lib/server-external-packages.jsonc`), and `patches/jsdom@30.0.1.patch` moves the one file it read at load
  (`default-stylesheet.css`, read through `__dirname`, which a bundle fixes at `/ROOT/…`) to its first use — only
  `getComputedStyle`, which no compile calls. Executed: the same probe answers 401 "Not signed in" (the route loads); a real
  compile through the built function (the shell, the compile, both gscans, the quality gate, the zip) gives 0/0/not
  blocked and the SAME zip bytes as the unbundled jsdom every test uses (sha-256 `28839a97407be7ca…`). `check-traces`
  now fails if the deploy route carries a jsdom link again.
- **A second cause, found before the owner's re-test** (the main session's production check, on the owner's in-session go,
  2026-10-19): with the route loading, one real Pre-flight on production — a throwaway account, the seeded project linked to
  a site row, the editor holding the lock, Run checks through the route — compiled (319992 bytes, 904 ms) and passed the
  quality gate, then failed at Checking: "We couldn't check your theme" (`theme_check_failed`, gscan 6.4.2). gscan lists
  `lib/checks/` and `require()`s each file by a computed path (6.4.2 `checker.js:13-19`; 4.49.7 through `require-dir`), so
  the route's trace carried the check files but not what they require: the deployed function's own file list (Vercel's
  `.vc-config.json` `filePathMap`) lacked 128 of the 258 files gscan 6.4.2 touches while it checks — semver, validator,
  date-fns, Ghost's NQL packages and lodash's modules. The local trace had the same gap; `check-traces` had held three
  files per checker. **The fix:** `gate/gscan.ts`' `preloadChecks` requires every check file by its literal name before gscan
  does, so the build follows their imports; `apps/web/deploy-input.test.ts` fails when that list and a pin's `lib/checks/`
  part; `check-traces` now runs each pinned checker in a child over a minimal theme, records every file it touches under
  `node_modules`, and fails on any the route lacks — red on the build before the fix (128 missing for each checker), green
  after (all 568 and 258).
- **Re-test:** steps 6–10 of "Owner's manual test" once the Fix deploy is live.

**Finding 2 (owner, 2026-10-19), before the Review — fixed in the Fix commit, re-test owed.** A second window opened from the
first (the owner's answer, in session: duplicated, or opened from a link in it) did not show "Take over to ship?" — Ship it
opened the wizard straight away.
- **The cause:** the lock's "this tab" is an id in `sessionStorage`, and the browser COPIES `sessionStorage` into a tab made from
  another (Duplicate, ⌘-click, `window.open`). So the copy carried the first tab's id and was its lock's holder too — two tabs
  editing as one session (the Theme settings and Translations pages read the same id). Older than this story (Story 5.17's
  lock); Ship it's D8g is what showed it.
- **The fix:** `lib/lock-client.ts` marks the id LEFT as a page goes (`pagehide`) and keeps a stored id on load only when the
  mark is on it — a reload, the take-over's own reload. A copy is taken while the first tab is open, so it carries no mark and
  becomes a session of its own; it reads along, and Ship it there opens D8g. The settings pages read through the same rule
  (`storedTabSession`). A new journey copies an open editor with `window.open` (the storage really copied — its control),
  asserts the copy's id differs and that a reload keeps the first tab's; it fails with the rule switched off. DW-242's journey
  now plants the mark a real reload leaves.
- **Re-test:** steps 6–7 of "Owner's manual test" — the second window may be duplicated or typed fresh; either now reads along.

## Questions for the owner

Questions 1–3 were ruled on 2026-10-18 (R-259–R-261), Questions 4–6, raised at Dev, the same day (R-262–R-264), and Questions 7
and 8, raised at the Review, on 2026-10-19 (R-265, R-266); none is open.

### Question 1 — This story is three stories. May I split it?

**In plain English.** The card asks for three different things:
- **shipping**: the Ship it button, the four steps, the checks, the upload, and every ending;
- **Pre-flight's warnings**: eleven reminders that never stop a deploy, plus choosing a different site;
- **three fixes to the editor's lock and save messages**, which only sit here because shipping needs the lock.

Together they would be the largest story yet, with the longest test you have run. There are also two loose ends.
"Deploy only" needs an ending, which is drawn in Story 7.32's frames. And Ghost's "uploaded but not switched on" state
is that same ending.

**An example.** After the first part, you press Ship it and see "Live! Your site just got gorgeous." on ghost6. After
the second, Pre-flight also says, for example, "Members are switched off on ghost6…" beside your sign-up form. After
the third, closing a tab frees your editing lock at once, instead of after a minute.

1. **(RECOMMENDED) Split it in three.**
   - **7.18a** (this spec) is shipping.
   - **7.18b**, straight after, is choosing the site and Pre-flight's warnings. Free sign-ups below Ghost 5.62 is asked
     there.
   - **7.18c**, after it, is the lock and save leftovers. The sentence for a save refused for good is asked there.

   Story 7.32's two "on your site but not live yet" endings come into 7.18a, and 7.32 keeps its history row. The two
   extra first-deploy steps stay with Stories 7.19 and 7.20, which draw them. Each moved sentence goes word for word to
   its new story.
2. **Split in two.** 7.18a takes shipping and every warning; 7.18b takes the lock and save leftovers.
3. **One story.** I re-plan this spec and ask the two moved questions now.

**Ruled: option 1 (owner, 2026-10-18) — R-259.** *"Split it in three"*

### Question 2 — A post with no tags disappears from every list once a collection uses "Primary tag". What should happen?

**In plain English.** Ghost's own test (T1, Story 7.16c) found this. When a collection picks posts by their primary
tag, the filter Inflozo writes for your home page drops every post that has no tag at all. That post then shows on no
page, although its own address still works. Nothing has uploaded a routing file yet, so no site has this today.

**An example.** You make `/tutorials/` for posts whose primary tag is **craft**. You publish "Office hours" with no tags.
Today it would be on no page, neither Home nor `/tutorials/`. With option 1 it is on Home.

1. **(RECOMMENDED) Fix what Inflozo writes.** Home also lists posts with no primary tag. I prove the exact wording with
   Ghost's own code and on T1 before any Ship it uploads a routing. If Ghost cannot say it, I stop and ask you.
2. **Keep it, and warn.** Pre-flight names the posts no page would list.
3. **Remove "Primary tag" and "Primary author"** from a collection's conditions, offering "Tag" and "Author" only.

**Ruled: option 1, and option 2's check beside it (owner, 2026-10-18) — R-260.** *"Fix what Inflozo writes. Home also
lists posts with no primary tag. I prove the exact wording with Ghost's own code and on T1 before any Ship it uploads a
routing. If Ghost cannot say it, I stop and ask you. Also add a check on Pre-flight and it names the posts no page would
list."*

### Question 3 — If your saved routing ever can't be read, how do you get out?

**In plain English.** Routes & Templates only saves routing it can read. A routing written another way — by hand in
the database, or by a future version of Inflozo — could be unreadable. The page then shows nothing to edit, and Ship
it must refuse to ship.

**An example.** Ship it says "Your saved routing can't be read." With option 1, that message links to Routes &
Templates, which offers **Start again from Ghost's default routing**. After you confirm, your templates are kept and
the routing is plain Ghost again.

1. **(RECOMMENDED) A "Start again" on Routes & Templates**, confirmed first, which replaces the unreadable routing with
   Ghost's default and keeps your templates.
2. **The reason alone.** Ship it explains, and fixing it is ours, by hand.

**Ruled: option 1 (owner, 2026-10-18) — R-261.** *"A "Start again" on Routes & Templates, confirmed first, which
replaces the unreadable routing with Ghost's default and keeps your templates."*

### Question 4 — The deploy's memory: switch the whole Vercel project to 4 GB?

**In plain English.** The architecture (AD-11) gives the theme builder 4 GB of memory, because several deploys can land
on one Vercel server at once and each needs room. Vercel lets us set memory **only for the whole project, never for one
function**: its docs say "You cannot set your memory size using `vercel.json`", and the setting is Settings → Functions →
Advanced Settings → Function CPU. The project reads **Standard (2 GB, 1 CPU)** today (`defaultResourceConfig.
functionDefaultMemoryType: standard`, read through Vercel's API at Dev). So AD-11's 4 GB is in force nowhere.

**An example.** One theme build peaks at about 486 MB (MEASUREMENTS §14), and Vercel was measured putting up to four
requests on one server (§17a). Four builds at once then use 95% of 2 GB (§17b), or 47% of 4 GB. Performance (4 GB, 2 CPUs)
applies to every function — the editor's pages too — and Vercel bills more memory while requests run.

1. **(RECOMMENDED) Switch the project to Performance (4 GB / 2 CPUs) now.** It is AD-11's ruling, applied the only way
   Vercel allows. I change it through Vercel's API in this session and read it back; the next deploy picks it up, and the
   Review records the function's memory from Vercel.
2. **Stay on Standard (2 GB) for now.** The Review measures a real build on production, and AD-11 gets a dated note that
   2 GB is in force until a measurement says otherwise.
3. **Move the deploy into its own Vercel project** (AD-11's stated way out), so only it runs at 4 GB — a larger change, its
   own story.

**Ruled: option 1 (owner, 2026-10-18) — R-262.** *"1. Switch to 4 GB now"*

### Question 5 — On a small upright tablet, Ship it does not fit in the top bar. What gives way?

**In plain English.** The criteria say Ship it shows at every width. An earlier rule (DW-283) says no button of the
editor's top bar may hang off the screen. On a touch screen narrower than about 760 pixels both cannot hold today: with
Ship it added, the ▾ (and at 600, Ship it itself) falls off the right edge. Measured at Dev in the harness, on Home and on
the Paywall alike, at three widths a real tablet has:

| Width (touch) | As built | Undo and Redo into ⋯ | "Template" and "View as" words hidden | Both |
|---|---|---|---|---|
| 600 (small Android, upright) | Ship it and ▾ off | both still off | ▾ off | **fits** |
| 640 (Galaxy Tab S9, upright) | both off | ▾ off | fits | **fits** |
| 720 (the editor's floor) | ▾ off | fits | fits | **fits** |

Your R-143 says Undo and Redo stay in the bar when the rest of the right side collapses ("the pair will not collapse with
it"), and an earlier rule keeps Template and View as whole. Any option below changes one of those, so it is yours.

**An example.** On a 640 tablet held upright with option 1, the bar reads: back · the save dot · "Paywall ▾" · "👁 Logged
out user ▾" · ⋯ · Ship it ▾ — and ⋯ now holds Undo and Redo at the top of its list. A screen reader still hears
"Template, Paywall" and "View as, Logged out user". At 768 and wider, nothing changes.

1. **(RECOMMENDED) Below 768 pixels on a touch screen, do both:** Undo and Redo move to the top of ⋯, and the words
   "Template" and "View as" are hidden (their values and the eye stay; screen readers keep the names). It is the only one
   of the three that fits from 600 up. A gate sweep at 600, 640 and 720 holds it.
2. **Below 768 on touch, Undo and Redo move into ⋯ only.** Fits at 720; at 640 and 600 the ▾ still falls off.
3. **Below 768 on touch, Ship it moves into ⋯.** The bar fits, but "visible at every width" breaks there.

**Ruled: option 1 (owner, 2026-10-18) — R-263.** *"1. Both, below 768 touch"*

### Question 6 — "Deploy only" cannot keep the old version live once this project's theme is the live one. What should it do?

**In plain English.** A project ships to a site under ONE theme name for good (`inflozo-<project>`, AD-19 — Ghost names a
theme by its file). Read at Dev in Ghost's own code: when the uploaded file has the name of the theme that is live right
now, Ghost replaces that theme's files AND makes them live at once (`core/server/services/themes/storage.js` — 6.58.0
`:111-116`, 5.130.6 `:81-86`, `activateFromAPIOverride`), and its answer says so (`themes[0].active: true`,
`to-json.js`). So after your first Deploy & activate, every later "Deploy only" to that site goes live the moment it
uploads, and D2f's "v1 is still what readers see" would be untrue. "Deploy only" works as drawn while the site shows a
different theme (a first deploy, or after you switch back in Ghost). §86's T1 run records Ghost's answer.

**An example.** You ship v1 with Deploy & activate: your site shows v1. You change a colour and choose ▾ → Deploy only,
hoping to look first. Ghost receives `inflozo-field-notes.zip`, sees that theme is live, and your readers see v2 straight
away, while the wizard would say "Uploaded. Not live yet."

1. **(RECOMMENDED) Both guards.** Grey "Deploy only" while Inflozo's own record says this project's theme is the one live
   on the site, with the reason in its caption: "v{prev} is already live on {host}, so Ghost would switch to v{n} the
   moment it uploads. Use Deploy & activate." (a new sentence, for your approval). And whenever Ghost's own answer says the
   upload went live (you may have switched themes in Ghost since), the ending is Live with confetti, never D2f.
2. **Grey "Deploy only" only**, by Inflozo's record.
3. **Truthful ending only:** Deploy only stays pressable; when Ghost says it went live, the ending is Live.
4. **Upload "Deploy only" under a second name** (`inflozo-field-notes-next`) and make Re-activate switch to it — a second
   Inflozo theme on your site, and AD-19's one-name rule changes.

**Ruled: option 1 (owner, 2026-10-18) — R-264.** *"1. Both guards"* — the caption sentence as written in option 1, approved with it.

### Question 7 — When your routing can't be sent at the end of a ship, may the line say why in these words?

**In plain English.** After Ship it makes your theme live, Inflozo sends your routing file to Ghost. If that fails, the ending
says "We couldn't send your routing to Ghost: {reason}. Your theme is live; ship again to retry." The spec's word list has
that sentence but never said what `{reason}` may be, and Dev wrote seven short reasons without asking you — which the spec
says needs your approval. (The Review also fixed a bug that showed the last one, "something went wrong on our side", for
every cause.)

**An example.** Your site is down for maintenance when you ship. Today the ending reads: "We couldn't send your routing to
Ghost: your site is busy or down. Your theme is live; ship again to retry."

The seven reasons, by cause:
- Ghost refused the file → "Ghost refused the file"
- busy or down → "your site is busy or down"
- no answer → "your site didn't answer"
- moved → "your site now answers at a different address"
- the routing itself → "the routing isn't valid"
- site gone → "the site is no longer connected"
- anything else → "something went wrong on our side"

1. **(RECOMMENDED) Approve the seven as written.** They reuse the words the failure screen already uses for the same causes.
2. **One line for every cause:** "We couldn't send your routing to Ghost. Your theme is live; ship again to retry." — no reason.
3. **Your own words:** tell me any you want changed.

**Ruled: option 1 (owner, 2026-10-19) — R-265.** *"1. Approve the seven as written. They reuse the words the failure screen
already uses for the same causes."*

### Question 8 — Ship it pushes "Template" and "View as" off the middle of the top bar on laptop screens. What gives way?

**In plain English.** The design (S4) keeps the two dropdowns "Template · Home" and "View as" exactly in the middle of the
editor's top bar. The right side of the bar has grown over several stories (Remix, the sun, the devices, "Theme settings",
Preview), and with Ship it added it no longer fits beside a centred middle below about 1480 pixels wide, so the middle slides
left. The deployed walk caught it at 1440 (its check of S4 now fails). Before this story it stayed centred down to 1280, where
the editor switches to its compact bar. Measured in the editor, how far left of centre the middle sits:

| Screen width | As built | Option 1 | Option 2 | Option 3 |
|---|---|---|---|---|
| 1536 | centred | centred | centred | centred |
| 1440 (the frame's width) | 17 px left | centred | centred | 17 px left |
| 1366 (a common laptop) | 54 px left | centred | centred | 54 px left |
| 1280 | 97 px left | 6 px left | centred | 97 px left |

**An example.** On a 1366 laptop today, "Template · Home ▾ · 👁 View as ▾" sits about a thumb's width left of the middle of
the bar.

1. **(RECOMMENDED) "Theme settings" becomes an icon in the bar** (a gear, its full name kept for screen readers and as its
   tooltip), **and the right side's spacing becomes S4's own 8 px** (from 10). Every control stays in the bar; centred from
   about 1300 up, 6 px off at 1280.
2. **Use the compact bar below about 1490 instead of below 1280.** Always centred, but on most laptops Remix, the sun, the
   devices and "Theme settings" move into ⋯, as they do on a small screen today.
3. **Leave it.** The middle sits a little left on laptop screens, and the walk's check is changed to expect that.

**Ruled: option 1 (owner, 2026-10-19) — R-266.** *""Theme settings" becomes an icon in the bar (a gear, its full name kept
for screen readers and as its tooltip), and the right side's spacing becomes S4's own 8 px (from 10). Every control stays in
the bar; centred from about 1300 up, 6 px off at 1280."*

## Verification

**Commands:**
- `python3 tools/doc-audit.py --check` — expected: exit 0, run twice after any new document.
- `pnpm check` — expected: exit 0, with the new tests and `agreement.test.ts`/`ad36.test.ts` passing and every snapshot
  unchanged.
- `bash supabase/tests/run-rls-gate.sh` — expected: exit 0. With the 7.18 migration withheld, it aborts at the 7.18
  block (the control).
- `pnpm keyboard` — expected: exit 0, with the wizard's journeys and ⌘⏎ live.
- `node tools/check-traces.mjs` — expected: the deploy route's trace holds the fonts' licences, the modules, Ghost's
  cards and both gscan trees.
- `node --experimental-strip-types tools/probe/record-deploy.mjs` — the local half: expected 0/0 on the pilot theme,
  the planted theme blocked, and zip bytes equal twice. The `--t1` half writes §86, on the owner's go.

**Real infrastructure (R-82; T1 only, R-238):**
- **The Schema phase:** applied through `SUPABASE_DB_POOLER_URL` on the owner's go, and read back.
- **§86 on T1** at Dev.
- **The walk's step 113 on production** at Review, plus the deployed function's size and memory read from Vercel
  (`VERCEL_TOKEN`), and CI's `check`, `rls`, `deploy` and the render matrix green on the Review head.
- **Ghost 5:** postponed to DW-326 (Story 15.7).

**Executed — Schema phase (2026-10-18, pushed alone as `5cd03f0c` before any code, R-99):**
- `bash supabase/tests/run-rls-gate.sh` — exit 0: no SCHEMA DRIFT, every earlier block passing, and the 7.18a block's PASS
  lines: `job_stage` carries `awaiting_ship` after `checking`; `deploys.quality` (jsonb) and `deploys.inputs_sha256` (text)
  exist; `bound_to`'s comment names the `prop` shape (DW-355); the tenant reads both columns on its own deploy and not on
  another's; it cannot write either (42501) nor set a job's stage (42501); no cancel at `awaiting_ship`, with a cancel in
  `checking` as the control; the refused writes leave the server's values.
- Controls, over a scratch copy without `20261019120000_deploy_wizard.sql` and with HEAD's `SCHEMA.sql`
  (`INFLOZO_ARCH_DIR`): exit 3 at the server-asserted list (`column "quality" of relation "deploys" does not exist`); and,
  with that list's one line reverted, exit 3 at the 7.18a block itself ("job_stage is {queued,…,cancelled} — awaiting_ship
  is missing or out of place"), 7.17's block passing first.

**Executed — Dev, the main session on the final tree (2026-10-18, Node 24):**
- `pnpm check` — exit 0: library 285 / ghost-shim 47 / section-runtime 441 / theme-compiler 219 / app 877 / tools 13 passing,
  0 failing (each suite's own count, as it printed). `pnpm lint` re-run after the last journey edit — exit 0.
- `pnpm keyboard` — exit 0, 269 passed (14.0 min). Its first full run had one red journey (R-264 (a)): the ▾ menu focuses its
  first row a frame after it opens (`lib/menu.ts`) and the journey pressed ArrowDown before then; the same race sat in two
  more journeys, all three now wait for that focus. Then `--grep "7\.18a|R-263|R-145|DW-283" --repeat-each 3` — 90 passed,
  and the full gate above.
- `pnpm build` — exit 0, `/app/projects/[id]/deploy` built. `node tools/check-traces.mjs` — "every route carries its files":
  the deploy route carries all 273 files it reads, and `gscan4`, `gscan6` and `jsdom` with their links; no client chunk of 50
  carries the font pool's record.
- `python3 tools/doc-audit.py --check` — PASS on the second run (the first regenerated the index and the board).
- `node --test --experimental-strip-types deploy-run.test.ts` — 21/21; with `ship()`'s claim removed, the double-press test
  fails (the mutation check), and passes again restored.
- `node --experimental-strip-types tools/probe/record-deploy.mjs` (the local half) — every row held: zip bytes equal twice
  (321346 bytes), the pilot theme 0 errors · 0 warnings on gscan 4.49.7 and 6.4.2 and the quality gate, the planted theme
  blocked on both on `GS005-TPL-ERR` (the control).

**Real services the story hit (R-82; T1 only, R-238):**
- **Supabase production** (`SUPABASE_DB_POOLER_URL`, read inside the script, never on argv; the owner's in-session go): before
  — `job_stage` without `awaiting_ship`, no `quality`/`inputs_sha256`, no comment on `bound_to`; the migration applied;
  after — the enum in order with `awaiting_ship` after `checking`, both columns nullable, the comment naming three shapes,
  and 0 deploys and 0 deploy jobs before and after.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): the project read through `GET /v9/projects` —
  `defaultResourceConfig.functionDefaultMemoryType: standard`, `functionDefaultTimeout: 300`, `fluid: true` (Question 4);
  then, on the owner's ruling R-262, `PATCH /v9/projects` with `resourceConfig.functionDefaultMemoryType: performance` —
  HTTP 200, and both `resourceConfig` and `defaultResourceConfig` read back `performance`. The deployed function's memory and
  size are the Review's reading.
- **T1 `ghost6.inflozo.com`, 6.58.0** — read only first (`GHOST6_CONTENT_API_KEY`): 33 published posts, one with no tags
  (`probe-gated-post`). Then `record-deploy.mjs --t1` (MEASUREMENTS §86; the owner's in-session go for the whole run;
  `GHOST6_ADMIN_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY` read in process). Its first run voided at leg
  4 on the recorder's own `indexFilter(config)` call, with Casper restored and no routing touched; the second held every row:
  - the ADMIN key uploaded the pilot theme (200, no Content-Type of Inflozo's own, `themes[0].active` false — R-264's
    control) and activated it (200, `active` true); the home page carried the run's page word;
  - leg 1b: the re-upload under the ACTIVE name answered `themes[0].active: true` and the probe stayed active with no PUT
    (R-264 b, VERIFY-AT-BUILD 74);
  - two concurrent uploads of one name answered 200 and 200 (§25f's EEXIST did not recur; `uploadAnswer` reads either);
  - the planted fatal theme: 422 `ThemeValidationError`, read as `ghost_theme_refused`;
  - leg 4 (Ghost's SQL): the new index filter listed `probe-gated-post` (27 posts), the old `primary_tag:-'craft'` did not
    (26, the control); the collection's own post on neither; its address 200;
  - leg 6 (Home, end to end): the emitted `routes.yaml` uploaded with the staff token (200), `/probe-gated-post/` linked from
    a page of `/`; the old-filter control (200) left it on none, its address 200; T1's own 130-byte file restored and read
    back byte for byte;
  - Casper active again and no `inflozo-probe-` theme installed, read back.
- **Resend, Dodo:** not touched — this story sends no email and takes no payment.
- **Ghost 5:** postponed to DW-326 (Story 15.7), R-238.
- **Still the Review's:** walk step 113 on production (written, never run; `T1_WRITES=1` and a fresh go naming its T1
  writes), the deployed function's size and memory from Vercel, and CI's `check`, `rls`, `deploy` and the render matrix on
  the Review head.

**Executed — Fix (2026-10-19, the owner's two findings; the main session, Node 24):**
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`): the request log of `dpl_6167myuo9fcHFwcwrP7mthistAcd` — two POSTs to
  `/projects/1ba29378-…/deploy`, both 500, each carrying the function's own `ERR_REQUIRE_ESM` line for jsdom's
  `@exodus/bytes`, `functionMemorySize: 4096` (R-262 in force).
- **The control, locally:** the Dev build under `next start` with `NODE_OPTIONS=--no-experimental-require-module` (Vercel's
  behaviour) — POST and GET 500 with the same `Failed to load external module jsdom-…` line. Plain `require('jsdom')` loads
  under Node 24's default and fails with the flag; `gscan4` and `gscan6` load either way.
- **The fix, locally, the same way:** POST and GET 401 "Not signed in", no require-of-ESM line. A temporary route (deleted,
  never committed) ran the compile shell, `compileTheme`, both gscans, the quality gate and `zipTheme` inside the built
  function: 26 files, 0 errors on gscan 4.49.7 and 6.4.2, quality not blocked, 319855 bytes, sha-256 `28839a97407be7ca…` —
  the same bytes the same input gives through the unbundled jsdom.
- `pnpm build` — exit 0. `node tools/check-traces.mjs` — "every route carries its files", the new "the deploy route bundles
  jsdom" line passing (the Dev build's trace carried the `jsdom-be25fed40bc74da3` link it now refuses).
- `pnpm check` — exit 0: library 285 / ghost-shim 47 / section-runtime 441 / theme-compiler 219 / app 877 / tools 13, 0 failing.
- `pnpm keyboard` — exit 0, 270 passed (17.0 min), the copied-tab journey among them. Before it: `--grep` over the lock
  journeys `--repeat-each 3` — 81 passed; the copied-tab journey with the rule switched off — FAILED on "and it is not the
  first tab's" (the mutation check), passing again restored.
- **Still the owner's:** the re-test of steps 6–10 on the Fix deploy.
- **The second cause (gscan's untraced check imports):** a production Pre-flight as a throwaway account (Supabase
  `SUPABASE_URL`/`SUPABASE_SECRET_KEY` for the account, seed and cleanup; app.inflozo.com through Playwright) — 202, then
  `failed` at Checking with `theme_check_failed` after compiling 319992 bytes; quality not blocked; no artefact stored; the
  account deleted and production's counts (11 projects, 6 sites, 0 deploys, 0 jobs) back as before. The deployed function's
  `filePathMap` (`VERCEL_TOKEN`, `GET /v7/deployments/dpl_6qVoGkajduaV6msxj26oZPNhmUDa/files/<uid>`, 2754 entries) lacked 128
  of the 258 files gscan 6.4.2 touches while checking (recorded locally with an fs hook). Fixed by `preloadChecks`; the new
  check-traces guard FAILED on the pre-fix build (128 missing for gscan4's 568 and gscan6's 258) and PASSES after.
  `pnpm check` — exit 0, app 878 (the preload test among them; with one check file dropped from the list it fails).
- **After the second Fix deployed (`f11efbeb`, CI check, rls and deploy green):** the same production Pre-flight as a
  throwaway account — 202, then `awaiting_ship` after 6 s: compiled 319992 bytes in 1657 ms, checked in 922 ms; gscan 6.4.2
  0 errors and one warning, `page_switch_unused` ("The switch that hides a page's title and feature image does nothing on
  this site." — the owner's step 8 expects it); quality 0/0, not blocked; the artefact stored (319992 bytes). The artefact and
  the account deleted; production's counts (11 projects, 6 sites, 0 deploys, 0 jobs) back as before. The owner's re-test of
  steps 6–10 is next.

**Executed — Review (2026-10-19, the main session, Node 24; five review layers as subagents, every real-infra call here):**
- **CI on the Fix head** `fc85175a` (`GITHUB_TOKEN`): CI's `check`, `rls` and `deploy` success, the render matrix success; Vercel
  `dpl_8X9viKbL1o2X59aA1GhQWmkKtfye` READY on `fc85175a` (`VERCEL_TOKEN`).
- **R-99, production's schema** (`SUPABASE_DB_POOLER_URL`, read in process; the owner's in-session go): `job_stage` is
  `queued,compiling,checking,awaiting_ship,uploading,activating,done,failed,cancelled`; `deploys.quality` (jsonb) and
  `deploys.inputs_sha256` (text) exist, nullable, and `authenticated` holds SELECT on both; `bound_to` carries its comment;
  every column the new code writes on `deploys`, `deploy_jobs` and `project_site_bindings` is there.
- **The deployed function** (`VERCEL_TOKEN`, the deployment's `.vc-config.json` for `app/projects/[id]/deploy.func`):
  `nodejs24.x`, `maxDuration` 300, its `filePathMap` 2939 files (gscan's trees, jsdom's two links, the fonts' licences, the
  modules, Ghost's cards); memory is project-wide (R-262) and the Fix's request log read `functionMemorySize: 4096`. Vercel's
  files API carries no sizes, so the function's size in bytes is not readable there.
- **The owner's own run on production this morning** (read only, the pooler): one account's project shipped to T1 —
  Pre-flight, Deploy only (uploading 1115 ms, no activation), Re-activate (activating 911 ms, `live`), then v2 by Deploy &
  activate going live on Ghost's upload answer with NO activating stage (R-264 b, uploading 1279 ms); the binding
  `inflozo-ghost6` stamped at the first upload; `private.credential_audit` holds exactly `theme_upload ok`, `theme_activate
  ok`, `theme_upload ok` for that site, in that order — one row per write, no PUT for v2. Routes ended `kind: none` (`kept`)
  each time. A second account's Pre-flight of its own project rests at `awaiting_ship`. These are the owner's test, and his
  findings are his to record.
- **Walk step 113, run 1** (a cut copy: steps 1–5 + 113, from a clean worktree at `fc85175a`, `T1_WRITES=1` on the owner's
  in-session go): steps 1–5 PASS; step 113's start guard REFUSED and wrote nothing to T1 — T1's active theme was
  `inflozo-ghost6`, the owner's test's v2 (the guard's own control, held); account C, its project and both walk accounts
  deleted, users and projects counted back unchanged.
- **The Review's patches, locally:** `pnpm check` — exit 0 (library 285, ghost-shim 47, section-runtime 441, theme-compiler
  219, app 886, tools 13; 0 failing); each new test failed with its line of code removed (the cancel race, the conditional
  Cancel, a Cancel honoured at Ship it, `preloadChecks`' names with one duplicated); `pnpm build` — exit 0; `node
  tools/check-traces.mjs` — "every route carries its files", 568 and 258 files touched by gscan4 and gscan6 all carried, and
  with its recorder silenced the derived control FAILS both checkers; `pnpm keyboard` — exit 0, 272 passed (14.9 min), the
  two review journeys among them.
- **T1 put back for the walk** (the owner's in-session go, option 1, staff token): `casper` activated (200) and `inflozo-ghost6`
  deleted (204), read back — Casper active, no Inflozo theme installed; T1's `routes.yaml` 130 bytes, unchanged by the owner's
  test (his routing ended `kept`). His accounts and projects are untouched.
- **The Review's deploy** `6e5afd91` (CI `check`, `rls`, `deploy` and the render matrix success; Vercel
  `dpl_2FDA7yfrz8kYjmHPqWy5vSK1iorw` READY).
- **Walk step 113, run 2** (the cut: steps 1–5 + 113, from a worktree at `6e5afd91`, `T1_WRITES=1` on the owner's go): every
  check of 113 held but 113e — T1 connected through the wizard; R-260 over T1's 33 posts (no post named; the old filter names
  `probe-gated-post`, the control); DW-349's emptied heading gone from the canvas and from T1's `/`; D8g in a second window,
  and the window that lost the lock refused by the route (423, no job); Pre-flight resting at `awaiting_ship` with both verdicts,
  its rows the stored verdicts, R-260's pass row; the planted unreadable routing and card designs each blocking with their
  words and links, put back; Deploy only on the first deploy → D2f with Casper still live (the control), the uploaded zip the
  one Pre-flight checked (same sha-256, compiling never re-entered), the binding claimed; Re-activate → Live, B16 `no_token`;
  "Ship update" with Deploy only greyed in the ▾ row and on S8a's card (a press sends nothing); the route's 422 for Deploy only
  while live; v2 by Deploy & activate live on Ghost's upload answer with NO activating stage; DW-54's off-list `DELETE` refused
  (`write_not_allowed`) with one `denied` audit row beside `theme_upload, theme_activate, theme_upload` ok; T1 restored (Casper
  active, the walk's theme deleted, routes.yaml 130 → 130 bytes), the site disconnected, every account deleted and counted back.
  **113e** lost its race twice: a whole Pre-flight takes about 2.5 s on production, and by the wizard's next one-second read
  the checks had already finished. Run 3 (pressing from Compiling on) lost it three times: twice the same way, and once a press
  that landed after the checks and was refused as past cancelling (which is right).
- **113e reworked and run 4** (a cut with 113f–113i left out, so no T1 write at all): a Pre-flight and its Cancel sent back to
  back through the route with the tab's lock session — 202, 200, the job `cancelled` with no deploy attached, the project's
  deploy count as before and its bucket empty (113d's listing held one: the control). The wizard's own Cancel is the keyboard
  journeys' (canned stages) and the owner's step 8.
- **Step 2 FAILS in every run, at the Dev head too** (`fc85175a`): S4's centred group sits 17 px left of the bar's middle at
  1440 — Ship it widened the right side past half the bar. Measured in the harness at 1536/1440/1366/1280 with each option
  applied: **Question 8**, the owner's.

**Executed — the owner's rulings at the Review (2026-10-19, R-265 and R-266; the main session, Node 24):**
- `pnpm check` — exit 0 (library 285, ghost-shim 47, section-runtime 441, theme-compiler 219, app 887, tools 13; 0 failing),
  `editor.test.ts`' R-266 test holding the gear path for path against `tabler.json`.
- `pnpm keyboard` — exit 0, 273 passed (28.7 min). The new centring journey measures "Ship it" and "Ship update" at 1536, 1440,
  1366 and 1280: centred to within a pixel from 1366 up, within the ruled 6px at 1280. Its control: with the words drawn
  again beside the gear it FAILS at 1440 (45px off), passing again restored.
- **Still owed:** the walk's step 2 on the next deploy (steps 1–5 only — no T1 write), recorded in the next commit.
