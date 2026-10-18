---
title: 'Story 7.18a — The deploy wizard'
type: 'feature'
created: '2026-10-18'
status: 'ready-for-dev'
owner_test: pending
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
- [ ] `supabase/migrations/20261019120000_deploy_wizard.sql` — change the schema:
  - `alter type public.job_stage add value 'awaiting_ship' after 'checking'`;
  - add `deploys.quality jsonb` (the `QualityVerdict`) and `deploys.inputs_sha256 text`;
  - set DW-355's comment: `comment on column public.custom_settings.bound_to is` the three shapes (`control`, `prop`,
    `token`) as `custom-settings.ts:288-291` states them;
  - if the tenant's SELECT on `deploys` is column-granted, add the two columns to it.

  Rationale: AD-20's F-075 stage, 7.8's column, the staleness test, and DW-355.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` — identical: the enum in
  that order, the two columns, the corrected inline comment and the same `comment on`. Rationale: the gate diffs
  `pg_dump -s`.
- [ ] `supabase/tests/rls.sql` and `RLS-TEST.sql` (byte-identical) — the tenant reads the new columns of its own deploy,
  never another's, and writes neither. The server-asserted list (`:596-603`) names them. Rationale: AD-31, with the
  withheld-migration control aborting at the 7.18 block.

**Execution — Dev:**
- [ ] `packages/section-runtime/src/core.ts` — DW-349: in the `data-prop` loop, an EMPTY non-catalog typed text in
  `fallback` mode removes its element on both emitters, as `hide` does. Catalog-linked props are unchanged.
  `agreement.test.ts` and `ad36.test.ts` gain that vector, with a non-empty control. Every design snapshot stays
  byte-identical. Rationale: the ruling of 2026-10-08, so V1 can no longer fire on an emptied heading.
- [ ] `packages/theme-compiler/src/compile.ts` — export `REFUSAL`, the leading words of each customer-caused throw, and
  throw through it. No behaviour changes. Rationale: one spelling the plain-words table keys on, held by a test that
  reaches each throw for real.
- [ ] `routes.ts`, `routes.test.ts`, `projects/[id]/routes/{page.tsx,routes-manager.tsx}` — routing:
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
- [ ] `apps/web/lib/routes-upload.ts` and `server/routes-upload.ts` — DW-371:
  - `routes_unverified` writes `routes_last_offered` = F with no cause, so Verify upload can compare;
  - `kept` over Ghost's default, when the project is at the default, clears `routes_fallback`;
  - `settle`'s failed write keeps the outcome and logs.

  Rationale: routine calls 15a–d.
- [ ] `apps/web/lib/deploy.ts` (new, pure, no imports from `server/`) — the whole rule:
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
- [ ] `apps/web/lib/style-pack.ts` — `enginePackOf(style_pack)` returns `{ pack, pairing }` by the editor's rule.
  `editor.tsx:925-938` calls it. Rationale: one rule for the canvas and the compile.
- [ ] `apps/web/server/deploy/zip.ts` (new) — a deterministic ZIP writer: sorted entries, DOS time 1980-01-01, deflate
  through `node:zlib`'s `deflateRawSync` and `crc32`. Rationale: no dependency, and identical bytes for identical files
  (AD-14).
- [ ] `apps/web/server/deploy/project-input.ts` (new) — `compileInputOf({ projectId, siteId, userId })`. It reads,
  owned, the raw `project_templates` (through `parseDoc`/`docRefusal`, skipping orphan route docs), `projects`,
  `custom_settings`, `translation_overrides`, `card_designs`, `routes_config` and the current `custom_templates`, and
  the site. It returns `CompileInput` and the reads for the hash. Library, fonts (`files/` and `licences/`), modules and
  Ghost's cards come through `PACKAGES()`, as `pilot-theme.mjs` reads them. Rationale: the shell the compile has never
  had.
- [ ] `apps/web/server/deploy/run.ts` (new) — `preflight`, `ship`, `activate`, `cancel` and `view`, each taking a
  `DeployIo` handed in (the `offerRoutes` pattern). Each writes the stage and `stage_timings` at every edge, checks
  `cancel_requested` between stages, applies the retry rule, writes the binding on the first accepted upload, and calls
  `offerRoutes(…, ROUTES_IO)` after activation. Rationale: one testable shell.
- [ ] `apps/web/server/deploy/deploy-io.ts` (new) — the real io: the service role scoped by `user_id`, storage,
  `call()` with a per-item timeout, the gates and `JSDOM`. Rationale: named on both `server-wiring.test.ts` lists.
- [ ] `apps/web/server/ghost-admin/index.ts` — a per-item timeout (`theme_upload` 120 s; every other item keeps 15 s).
  Rationale: one 15 s budget covers DNS, the upload and Ghost's own gscan.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/route.ts` (new) — handles POST
  `{ intent, session, job?, mode? }` and GET `?job=`. It checks the lock (the user's own client), answers the job id,
  and runs the work in `after()`. `export const maxDuration = 300`. Rationale: one door, the lock route's pattern.
- [ ] `apps/web/package.json`, `next.config.ts`, `vercel.json`, `tools/check-traces.mjs` — wire the function:
  - depend on `@inflozo/theme-compiler` and `jsdom` (30.0.1, already locked);
  - `serverExternalPackages: ['jsdom', 'gscan4', 'gscan6']`;
  - set AD-11's 4096 MB where Vercel lets it be set (read in the project's settings through the API first);
  - check-traces holds `fonts/licences`, `library/modules`, `vendor/cards` and both gscan trees reaching the route.

  Rationale: 7.7's "proved on Vercel within the function's limits".
- [ ] `apps/web/components/kit/button.tsx` — `SplitButton` takes `onPress`, `busy`, `menu` (the Kit's `Menu`) and
  `label`. Rationale: S4's control, used once.
- [ ] `apps/web/components/editor/deploy-wizard.tsx` (new) — the modal, the rail, the four steps, and the endings (Live,
  S8d′, D2e, D2f, and the routes outcome with B16). It polls `view` while the stage is not terminal, announces each
  stage, and draws the static confetti under reduced motion. While the server checks run, it reads the linked site's
  published posts in the browser through `lib/live-content.ts`'s reader (the canvas's own path and Content key; 100 a
  page, within the reader's request ceiling) and draws R-260's row from `unlistedPosts`. Rationale: S8, D2, R-260.
- [ ] `editor.tsx` — the editor's half:
  - Ship it after `#editor-more`, visible at every width, labelled "Ship it" or "Ship update";
  - the ▾ menu's rows;
  - ⌘⏎;
  - D8g through `<LockTakeover>` for a reader;
  - Run checks awaiting `flush`;
  - "Fix in editor" closing the wizard on that canvas;
  - delete the absence entry at `:335`.

  Rationale: DW-238, R-145.
- [ ] `apps/web/lib/lock.ts` — D8g's strings in `LOCK_COPY` (Words). Rationale: one list.
- [ ] `apps/web/lib/keymap.ts`, `keymap.test.ts`, `tools/keyboard/journey.spec.mjs` — the `ship` gesture classified in
  `EDITS`, the row bound (`keys: ['enter'], meta: true`), and "the map is complete" asserted. The wizard's journeys run
  against canned job states through `page.route`, each behind its control. Rationale: R-145.
- [ ] Tests — the I/O matrix:
  - `apps/web/deploy.test.ts` (the rule);
  - `apps/web/deploy-run.test.ts` (`run.ts` over a fake io: every stage, cancel, abandon, stale, retry, binding,
    routes);
  - `apps/web/zip.test.ts` (read back with `inflateRawSync`; byte-identical twice);
  - `compile.test.ts` (each `REFUSAL` reached);
  - `server-wiring.test.ts`;
  - `busy.test.ts`.
- [ ] `tools/probe/record-deploy.mjs` (new; §86; the main session, on the owner's go) — on T1:
  1. the pilot theme, zipped by `zip.ts`, uploaded and activated with the ADMIN key through `adminRequest`, and its page
     read;
  2. two concurrent uploads of one name, mapped by `uploadAnswer`;
  3. a planted fatal theme's 422, mapped;
  4. R-260's index filter listing an untagged post on Home (the old filter as its control, listing it nowhere);
  5. Casper restored and the probes deleted, both read back.

  Rationale: DW-51's theme half; standing rule 1 on the Admin key's upload right.
- [ ] `tools/probe/run-verify-editor.cjs` — step 113, the Review's: production, a throwaway account connecting T1,
  the whole wizard, DW-54's denied row beside the upload's `admin_write ok`, and T1 restored.
- [ ] Propagation at Dev:
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
- failed: "We couldn't send your routing to Ghost: {reason}. Your theme is live; ship again to retry."
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
6. Ship it: Live, and B16 at the ending (no token). The page has no heading, and Home lists the untagged post.
7. Deploy only, then Re-activate.
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
| 8 | same (B) | Destination | Press **Run checks**. | — | **Compiling your theme…**, then **Checking your theme…** (Cancel works here). Then "Theme compiled", and "Checking your theme (Ghost will love it)" with **0 errors** and at least the warning "The switch that hides a page's title and feature image does nothing on this site.". Then "routes.yaml is valid · pass", "Every post appears on Home or a collection · pass" and "Warnings won't block your deploy.". |
| 9 | same (B) | Pre-flight | Press **Ship it**. | — | "Shipping v1…", "Uploading to Ghost", then "Activating v1". **Cancel** is greyed with "Once it starts, it finishes". |
| 10 | same (B) | Live | Look, then press **View site ↗**. | — | Confetti, and "Live! Your site just got gorgeous.". Below it: "Upload routes.yaml yourself". The site in the new tab shows your design, and the newsletter has no heading. |
| 11 | ghost6's Ghost Admin, then the wizard (B) | B16 at the ending | Press **Download the file we generated**, upload it in Ghost where the card says, then press **Verify upload**. | the downloaded `routes.yaml` | "Ghost has your routes.yaml. Your routing is live." Press **Done**. Routes & Templates and Sites show no card. |
| 12 | `…/projects/<your project>` (B) | Editor → Style pack | Make the text colour a pale grey, and accept the editor's "hard to read" warning. Then press **⌘⏎**. | `#DDDDDD` | The bar now says **Ship update**. ⌘⏎ opens the wizard (v1 → v2). After Run checks, Checking shows the contrast warning in the Style pack editor's own words, and Ship it is still pressable. Press **Back** and put the colour back. |
| 13 | same (B) | ▾ → **Deploy only** | Run checks, then press **Ship it**. | — | "Uploaded. Not live yet." with "Activating v2 · Not requested". Press **Re-activate v2**: you see Live and confetti. |
| 14 | ghost6's Ghost Admin → Integrations → Owner test 7.18, then the editor (B) | — | Press **Regenerate** on the Admin API key. In the editor, press **Ship it**, **Run checks**, then **Ship it**. | — | It fails at Ship: "Ghost said no — this Admin API key no longer works." with **Reconnect site**, which opens Manage keys. Paste the new key and ship again: Live. |
| 15 | ghost6's Ghost Admin, then `https://app.inflozo.com/sites` | Cleanup | In Ghost: **Settings → Design → Change theme → Casper → Activate**, delete the `inflozo-…` theme, upload the `routes.yaml` you saved at the start, and delete the Owner test 7.18 integration. In Inflozo: ⋯ → **Disconnect** on ghost6. | — | T1 is back as it was. |

## Questions for the owner

All three were ruled on 2026-10-18 (R-259–R-261); none is open.

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
