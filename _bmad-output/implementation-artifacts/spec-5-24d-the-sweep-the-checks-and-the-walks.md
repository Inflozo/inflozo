---
title: 'Story 5.24d — The sweep: the checks and the walks'
type: 'chore'
created: '2026-10-01'
status: 'in-review'
owner_test: none
review_loop_iteration: 0
baseline_commit: '03d7393a4228bf29e92556aa151a892f2a1c486b'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

After this story, the automatic checks that guard every push, and the long walks run against the live site, stop
failing for reasons that have nothing to do with the product — Google's font service hiccupping, a page answering a
moment late, a film frame that will not decode — because each one now waits for the thing it means rather than a fixed
moment. The places nothing checked are now checked: the sign-in guard on the internal preview pages, the arrows and
Shuffle on a section's own pill, the 40-character limit on a heading, the design files every published server needs,
the database's hidden areas, and the test-site scripts' own safety. Nothing on your screens changes — the fonts are now
served by Inflozo itself, and a pixel-by-pixel comparison before and after proves they look exactly the same — and you
will see it on the story board, where each item closes with its proof.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Group D of the sweep's triage (R-211) is the ledger's open entries about the automatic checks and the
deployed walks: flaky stops that fail on unchanged code, checks that read source text instead of executing, behaviour
only a hand-run walk sees, a build that fetches fonts from Google, server functions that get their design files by
accident, and test-site tooling that reports the wrong thing. Re-derived at this Create from `deferred-work.md` at
`03d7393a`, it matches this story's card exactly: DW-117, 162, 174, 182, 183, 201, 204, 208, 211, 216, 219, 220, 222,
236, 245, 246, 251, 257, 269, 279, 284, 285, 287, 291, 292, 294, 295, 298, 299 and 301.

**Approach:** Close each entry by a change that makes its claim false, with a control seen red when the change is
reverted (standing rule 2). Five read-only passes checked Story 5.24a's plan against HEAD and ran each fix and control
in a scratch copy; where the plan was wrong, the task below is the corrected one (Design Notes list the corrections).
The order follows the dependencies:
1. **offline** — the app's small changes, the build, the keyboard gate, the tools, each with its control;
2. **the walks** — each walk edit's planted control run against production as a LOCAL RUN, before the push;
3. **the push**, then the clean committed walks on the deployed build (Verification).

No question is the owner's (Design Notes, routine calls).

## Boundaries & Constraints

**Always:**

- **The ledger is the source.** Dev re-derives Group D at HEAD first (Verification's first command); a verdict that no
  longer holds is re-made, never forced. An entry closes only on evidence — a change whose control was seen red with it
  reverted — as `status: done <date>` with a `resolution:` naming Story 5.24d and that evidence. **No entry is deleted
  or renumbered.** DW-251 stays open for Story 9.1's half.
- **A walk edited in the commit it verifies proves less.** Each walk change's control is a planted run against
  production with `APP_ORIGIN=https://app.inflozo.com` (it prints "LOCAL RUN"), the plant reverted; the clean committed
  walk on the deployed build is the result. Walks run alone, nothing heavy beside them; a run that dies prints no
  result and is re-run (the editor-harness rule: the SAME line dying twice is a signal).
- **A retry never re-spends a single-use magic link and never repeats `goBack`** (DW-183's two exclusions, executed).
- **Nothing on screen changes.** The font families keep their names (`Inter`, `inflozo-chrome Inter` are read by the
  journey and the editor walk); the screenshot comparison is pixel-identical or the run stops.
- Keys by variable name only (`docs/project-context.md`); `--exclude=.env` on every recursive grep over `tools/`.
- Counts are derived (standing rule 4). Every rename ends with a grep for the old name (standing rule 7).

**Ask First:**

- **Before the live-content walk** (DW-251): it switches T3's Subscription access for under a minute and, unless
  `NO_429=1`, holds this network off T1's Content API for an hour. Ask the owner in the session itself — "Write to the
  test sites for 5.24d" — and run it in the main session, never a subagent.
- **DW-204's diagnosis:** a stall the logs place on the product's side whose remedy costs money (Vercel plan, region,
  compute) is the owner's; and if no stall occurs across the story's walks, DW-204 stays open — stop and say so.
- **A closure bigger than its triage says** stops, and the entry is re-homed to one named later story whose card gains
  the sentence with its DW id.
- **A screenshot that differs** after one re-run.

**Never:**

- No edit to the design export (R-74). No migration, so no Schema phase (R-99). No new npm dependency (the font files
  are assets). No BMAD update (R-91).
- No live run of `record-edit-lock.py` (it writes to production and rewrites MEASUREMENTS §50) or `record-cards.py`
  (it writes to T1 and T3): both controls are offline self-checks. Never `--help` on a `record-*.py`.
- No `next/font/local`: it renames the families and computes its own fallback metrics (executed).
- No edit to a finished story's spec; a correction lands in `MEASUREMENTS.md` or the ledger.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| A frame route, signed out | `GET /controls/frame`, `/style-guide/frame`, `/canvas` | 303, `location` ending `/sign-in` | — |
| A frame route, signed in | the same three | 200 `text/html`; `/style-guide/frame?view=variations` 200 | no `x-nonce` → 500 |
| zod on Projects | `lib/style-pack.ts` imported with `Function` trapped | the trap never fires | — |
| The canvas cache rule | `v` = `abc` in production · `null`, `''`, `dev` · any `v` outside production | immutable · `no-store` · `no-store` | — |
| A stall on an idempotent signed-in load | the first `goto`, `reload` or `request.get` times out | one retry and a `stall` note with the ISO time and the path alone | a second timeout → `HARNESS ERROR` with its time |
| A held magic link | `/auth/confirm` held 35 s | the walk dies; never retried | `HARNESS ERROR` |
| A bad film frame | one truncated screencast frame | skipped and counted, the check measures the rest | every frame bad → the frame floor FAILs |
| A forged preview subject | bad project id, key, slug (`''`, 192 chars), kind, `source`; another user's project | `SUBJ.SAVE_REFUSED`; both projects' rows unchanged | — |
| A heading past its limit | a 41st character in the fixture heading | "Heading holds 40 characters."; the text stays 40 | — |
| A window that lost focus | `top.document.hasFocus()` false, then a blur | the editing session stays | — |
| Late panel renders | the Design block's tiles painting after the selection | counted only once renders have settled; ⌥↓ draws no Design block | — |
| A trace missing design files | `PACKAGES` built from `import.meta.url` | `check-traces.mjs` exits 1 naming route and file | — |
| The exposed schemas | `Accept-Profile: private`, `storage`, `vault` | 406 PGRST106; `public` and `graphql_public` not 406 | FAIL names the schema |
| A recorder row changed by hand | an owned tag renamed | the run voids naming its slug, before anything is published | `Void` |
| A probe's own bug | a `KeyError` in `record-edit-lock.py` | "PROBE ERROR", exit 2; a fixture user created before it is deleted | traceback |
| F4 after a generation bump | `lock_generation` 40 before F4 | F4 passes | — |
| A dead seed image | any `IMG` address not 200 | `seed-ghost.py --check` exits 1 naming it | — |
| Connect under `next dev` | StrictMode on, Connect pressed | the connect action's POST leaves | — |
| A build with no network | `pnpm build` inside `unshare -rn` (loopback up) | passes | — |

</frozen-after-approval>

## The triage

Derived at this Create from the ledger at `03d7393a`: exactly the card's list, and no open entry added since names
Story 5.24d. Each entry was read in full and its plan (Story 5.24a's § The four stories after this one) checked against
HEAD by five read-only passes that ran the fix and its control in a scratch copy.

| Entry | Closed by | Its evidence lands at |
|---|---|---|
| DW-117, DW-162 | one executed test of all three frame routes; the text tests deleted; the walk's signed-out loop gains two routes | Dev; the walk at Review |
| DW-174, DW-201 | `lib/zod.ts` sets `jitless` before any schema; every app import goes through it; ESLint keeps it so | Dev; the editor walk's dashboard filter removed |
| DW-182 | a journey stop: the limit note, and the lost-window rule | Dev |
| DW-183 | `steady` retries every idempotent signed-in load once, says so, and never the magic link | Dev (planted) |
| DW-204 | each stall timed and classified from Vercel's request logs after the walk | Review |
| DW-208 | `canvasCaching()` both routes call, a unit test and a route test | Dev |
| DW-211 | a floor stop presses the pill's ◀ ▶ and Shuffle, then ⌘Z | Dev |
| DW-216 | one `die-pips.cjs` the journey and both walks import | Dev |
| DW-219 | step 89 replays forged subject saves, and gains the Author and Page canvases | Dev (planted); Review |
| DW-220 | 66b waits out the editor's own sync budget, exported once | Dev (planted) |
| DW-222 | step 36 measures against the hovered root | Dev (planted) |
| DW-236 | a frame that will not decode is skipped and counted | Dev (planted) |
| DW-245 | a probe bug is not "RUN VOID"; the fixture user cleaned up; F4 seeded relative | Dev |
| DW-246 | the three faces served from the app as plain `@font-face`; an offline build | Dev; the deployed Projects pair |
| DW-251 | the capped lines read under a simulated total; **the ring-tile half moves to Story 9.1** | Dev (live-content walk, Ask First); Story 9.1 |
| DW-257 | `designateAll()` shared; the hydrate repair and the edit read each a journey | Dev |
| DW-269 | a post-build trace check in CI; `/controls` given its own trace; the inert lists deleted | Dev; CI on the push |
| DW-279 | a harness-only re-read and a journey that sees the redraw | Dev |
| DW-284, DW-291 | step 90 and step 89 wait until no server action is in flight, then poll the row | Dev (planted) |
| DW-285 | the harness editor gets a shell user; the floor stop reads the avatar | Dev |
| DW-287 | every `networkidle` in the walks becomes `load` | Dev (planted) |
| DW-292 | the render-count stops settle on "no render pending" | Dev |
| DW-294 | a `--check` step reads the exposed schemas over the wire; the SQL block says what it cannot see | Dev |
| DW-295 | the wizard's `alive` ref set in the effect's body | Dev, under `next dev` |
| DW-298 | the dead address swapped; `seed-ghost.py --check` | Dev |
| DW-299 | the three hand changes written down as the owner's, from Ghost's own log | Dev |
| DW-301 | each owned row checked before the run publishes anything | Dev |

## Code Map

All anchors are at `03d7393a`. Node 24 for app code: `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`.

**The app** (`apps/web/`)

- Frame routes: `app/(app)/app/(authed)/controls/frame/route.ts:17`, `…/style-guide/frame/route.ts:18`,
  `…/canvas/route.ts:18`. Their text tests: `controls.test.ts:17-27`, `style-guide.test.ts:81-91` (also reads
  `variationsDocument(` and `x-nonce` as text), `pilots.test.ts:15-25`. `next` has no `exports`, so a bare
  `next/server` and the `@/` alias do not resolve under `node --test`; `next/server.js` itself loads and answers 303.
  `mock.module` resolves first and fails the same way.
- zod: one copy, 4.4.3 (`pnpm-lock.yaml:2897`); its config lives on `globalThis.__zod_globalConfig` (`core.js:72-73`);
  the probe runs when an object schema is built (`zod/v4/core/schemas.js:970-972`, `util.js:145-160`). On `/`:
  `(dashboard)/page.tsx:15` → `new-project-sheet.tsx:13` (`PRESETS`) → `lib/style-pack.ts:43`'s `z.object`.
  `packages/section-runtime/src/doc-schema.ts:19` sets `jitless` but never loads on `/`. The eight zod importers:
  `lib/style-pack.ts`, `lib/projects.ts`, `lib/health-rule.ts`, `sign-in/email.ts`, `account/passkey-name-rule.ts`,
  `account/actions.ts`, `sites/actions.ts`, `snapshots/[id]/download/route.ts`. `doc-schema-jitless.test.ts` holds the
  runtime's half. `eslint.config.js` has no `apps/web` block (`no-restricted-imports` covers the core, `:116`).
- Canvas cache: `(authed)/canvas/route.ts:27-31,38,49` and `harness/canvas/route.ts:31-35,42,55` (the same eight-line
  comment twice); `pilots.test.ts:128-131` reads it by regex; `lib/canvas.ts:144` (`V`) is the home.
- `sites/connect-wizard.tsx:134` `useRef(true)`, `:135` the cleanup-only effect, `:167` `if (!alive.current) return`.
  The editor's shape to copy: `editor.tsx:3426-3433`. `next.config.ts` leaves `reactStrictMode` at its default (on).
- The sync budget: `editor.tsx:1596` `flush('unload')` is a keepalive fetch with a literal 20 s abort `:1601`;
  `lib/journal.ts:259` exports `BACKOFF_S` and no budget.
- `components/shell/shell.tsx:46-47` (`ShellUserContext`, not exported; comment `:42-45`);
  `components/editor/small-screen-notice.tsx` (comment `:20-22`).
- The re-read: `(editor)/actions.ts:154` `recheckSite`, called at `editor.tsx:965` and refused in the harness at
  `signedIn()`; the redraw `drawShims(doc)` `editor.tsx:976`.
- The main feed: `(editor)/read.ts:290` (`designate` per doc); `lib/editor.ts` (no section-runtime import today); the
  hydrate's `designated(k, d)` `editor.tsx:3360`; `paint()`'s `editReads` branch.
- The harness: `app/(app)/app/harness/editor/layout.tsx` — `MAIN_FEED` `:86`, `docOf`'s feed index `:105-107`, a stale
  comment `:111` ("CSP admits it nowhere": the harness CSP is `connect-src 'self' https:`, so its site reads reach
  `page.route`), `<Editor>` `:230`.
- Fonts: `app/layout.tsx:2` (the only `next/font`): Bricolage Grotesque `:11-16` (`subsets:['latin']`,
  `axes:['opsz']`, `--font-bricolage`), Inter `:18-23` (400/500/600, `--font-inter`), JetBrains Mono `:25-30` (400/500,
  `--font-jetbrains-mono`), on `<html>` `:38`; comment `:5-10`. `globals.css:139-144` builds `--font-display`, `-ui`,
  `-mono`. `lib/canvas-layer.ts:64-104` copies the editor's `@font-face` rules into the canvas as `inflozo-chrome …`.
  Read by name: `tools/keyboard/journey.spec.mjs:1589` (`/Inter/`), `run-verify-editor.cjs:770`
  (`/^"inflozo-chrome Inter"/`) and step 2. Guard to rewrite: `tokens.test.ts:214-224` (reads `variable:` from
  `layout.tsx`), with the directory walk to reuse at `:136-150`. Stale comments: `csp.ts:79-86`, `csp.test.ts:121`,
  `components/kit/badge.tsx:43-44`, `run-verify-editor.cjs:768-769`. `routing.test.ts:92-100` keeps `public/` folders
  outside the proxy matcher, so the files live in `app/fonts/`.
- Traces: `next.config.ts:8-12` (the comment saying the lists are inert), `:13-41` (the lists), `:71-79`
  (`outputFileTracingIncludes`); `lib/style-guide.ts:38-41` (`PACKAGES`, working directory first);
  `lib/pilots.ts:15,22` and `lib/controls-review.ts:21` (`import.meta.url`); the text tests `pilots.test.ts:137-148`,
  `controls.test.ts:46-62`, `style-guide.test.ts:93-115`.

**What Google serves for those options** (fetched with next's own User-Agent, `fetch-resource.js:24`, Mac Chrome 104):
three subsets of Bricolage (`wght 200 800`), Inter seven subsets × three weights, JetBrains Mono six × two — every file a
variable font, byte-identical to what HEAD's build ships; only the three latin files are preloaded. Licences:
`google/fonts` `ofl/{inter,bricolagegrotesque,jetbrainsmono}/OFL.txt`.

**The build and CI**

- `pnpm build` (apps/web, Turbopack 16.3.1) writes `apps/web/.next/server/app/**/{page,route}.js.nft.json`; each
  `files[]` entry is relative to its own `.nft.json`. The canvas route, `/pilots` and the editor's `(editor)/page` and
  `[template]/page` traces hold every tracked file the canvas reads; `/controls` and `/controls/frame` hold none of
  their own (they work only because Vercel bundles them into the shared `app.func`).
- `.github/workflows/ci.yml:61` — `check`'s `pnpm build`; `:91` — `deploy`'s `vercel build`, which only ever adds files.
- Offline: `unshare -rn sh -c 'ip link set lo up && exec …'` (without the loopback Turbopack panics — a broken test).

**The keyboard gate** (`tools/keyboard/`)

- `journey.spec.mjs`: header `:13` (the synthesized presses); `panelsSettle` `:66` (two frames and 150 ms); the die's
  pips `:1279-1295`; the 5.23a press precedent `:3700-3725`; `resetRenders` `:3881`; the six render-count stops
  `:3890-4006`, the ⌥↓ stop `:3949-3964` (`own[3]` is the fixture ring); the Design block's tiles commit late inside
  `<Profiler id="design">` (`design-picker.tsx:165,203`; `section-preview.tsx:91-112,160`).
- `floor.spec.mjs`: the pointer rule `:4`; the phone stop's avatar note `:80`.
- `packages/library/fixtures/controls/content.json:6` — the fixture heading, richtext, `maxChars: 40`.
- `editor.tsx`: `onRefused` `:2870`; the pill's `pillPrev`, `pillNext`, `pillShuffle` `:4351-4353`.
  `lib/inline.ts:271` — `onFocusOut`'s `hasFocus` guard.
- Server actions drop unused arguments from the request: a harness action that ignores `projectId` sends `[]`.

**The deployed walks** (`tools/probe/`)

- `run-verify-editor.cjs`: `recorder(context, violations)` `:362`; `steady` `:374` (page `goto` only; it wraps the
  phone, tablet, zoom, step-100 and cross pages BEFORE their magic-link `goto` — `:6421`, `:6464`, `:6557`, `:6596`,
  `:6629` — so a single-use token is retried today); unwrapped: every `context.request.get` (step 2 `:463`, step 5
  `:609`, step 79 `:5871`, step 6 `:5975`, `:5978`, `:5985`, `fourOhFour` `:5989`), step 9's
  `streamContext.request.get` `:6676`, every `page.reload` (`:924`, `:1561`, `:4293`, `:4613`, `:4635`) and the pages
  `pilotsPage` `:572`, `noIdbPage` `:6083`, `axePage` `:6124`, `touchPage` `:6283`, step 9's `:6669`.
  Decoders: `drift` `:973-978`, `stuckRows` `:1045-1050`. Step 36 `:1927-1985` (`settled36` against `onScreen(GRID)`;
  the pill re-places on its next frame, `section-pill.tsx:131-165`). 66b `:3181-3205` (`stateIs58`, 15 s); 66c's raw
  action POST `:3207` is the replay precedent. The die's pips `:3987-4000`. Step 89 `:4070-4362` (Home, Post, Tag; the
  wait-reload-wait `:4292-4294`, `stored513` `:4298`). Step 90's poll `:4602-4610`. Step 79 `:5867`. The signed-out
  loop `:5999-6003` (`/canvas` alone). The dashboard eval filters: step 5 `:5907` (comment `:5904-5906`), step 70
  `:6117`, step 14 `:6287` (`:6286`), step 97 `:6459`. Step 9 `:6667`.
- `(editor)/actions.ts:41-63` — `setPreviewSubject`'s guards (uuid, `canvasOfTemplateKey`, slug empty or over 191,
  `subjectKindOf`, `source` undefined or `'site'`), then the upsert under the caller's session (RLS). `chooseSubject`
  `editor.tsx:2251-2281`; `recordViewed`'s serial chain `:1321-1336`. Page has one subject row; Author has many.
- `run-verify-controls.cjs`: Playwright required from an absolute path outside the repo `:28` (the others use
  `@playwright/test`); the pips `:700-713`; `networkidle` `:79`, `:82`, `:472`, `:513`, each followed by a landmark
  wait. `run-verify-pilots.cjs:89`, `:92`, the same. `run-verify-passkeys.py:358-581`, seven more (standing rule 7).
- `run-verify-live-content.cjs`: `NO_429` `:74`; the three-failures session block `:716` (the shape to copy); the
  vacuous capped check `:550` (`[data-source-capped]`, `source-pill.tsx:298`); the header's "THE ONE SIMULATED
  CONDITION" `:675`; T3's real switch `:943`; T1's 429 step `:1298-1299`. `[data-link-capped]`
  (`link-picker.tsx:227`) is read by no harness. `LIST_LIMIT` and the words `live-content.ts:579,629`.
- `npx vercel@latest logs --project inflozo --environment production --since … --until … --json` (CLI 62.1.0) reads past
  request lines — `timestamp`, `requestPath`, `responseStatusCode`, `source`, `domain`, no duration — for about two
  hours only.

**The database and the test sites**

- `tools/probe/record-edit-lock.py`: `fixture()` creates the account `:449-455` and raises `Void` on a failed project
  POST `:461-462` with `user_id` never bound in main (`:573`, guarded `:603`), so the account leaks; the fold
  `:599-601` (`ValueError`, `KeyError` reported as "RUN VOID"); the help branch `:568`. A live run writes an auth user,
  two projects and a lock row to production.
- `RLS-TEST.sql` (live; `supabase/tests/rls.sql` is its copy, `cmp -s` in `run-rls-gate.sh:37-48`): F4 seeds absolutes
  — `=5` `:822`, `=6` `:831`, `gen <> 6` `:835`, `lock_generation = 10` `:846`, the CAS `:850-851`, `:859-860`,
  `gen <> 11` `:864`. The exposure block `:981-994` prints "PASS: storage is not PostgREST-exposed (db_schemas = unset
  locally)" while checking nothing; projects cascade from `auth.users` (`SCHEMA.sql:223`).
- `run-verify-ghost-admin.py --check`'s `vault-off-rest` `:5110-5122` sends no `Accept-Profile`, so it asks `public`;
  `_deletion._request(..., extra={…})` takes a header. MEASUREMENTS §16b (`:816-818`) has the same flaw.
- `seed-ghost.py:74-76` (`IMG`, a `ponytail:` comment `:76`); every argument is read as a major `:186`.
- `record-cards.py`: `OWNED_TAGS` `:85`, `OWNED_POSTS` `:86-87`, `--self-check` `:229-269` (in `pnpm test`,
  `package.json:15`), `publish_owned` `:308-324` (re-writes each post's `published_at` and `tags`; the tag's `name` is
  found by slug and never re-written). Admin answers carry tags and `.000Z` dates; the Content API `+00:00`.
- `RESET-PROTOCOL.md` § Ghost `:79-107` is a procedure and holds no list of the sites' contents.
  `packages/library/contexts/fixtures/ghost5.json` holds the three changes. Ghost's actions log
  (`GET /ghost/api/admin/actions/`, `routes.js:331`) records browser edits only: a staff-token write sets
  `context.integration = {id: null}` (api-framework 1.0.2 `http.js:29-36`), `getActor` (`user-type.js:13-19`) reads a
  null actor and the NOT NULL `actor_id` (`schema.js:822`) drops the row.

## Tasks & Acceptance

**Execution — the app (offline):**

- [x] `apps/web/frame-guard.test.ts` (new), `controls.test.ts`, `style-guide.test.ts`, `pilots.test.ts` — **DW-117,
  DW-162:** `registerHooks` from `node:module` maps `next/server` → `next/server.js`, `@/x` → `./x.ts`, and
  `@/lib/supabase/server` → the test file itself, which exports `currentUser`. Each route's `GET(new NextRequest(url,
  {headers: {'x-nonce': 'n'}}))`: signed out 303 with `location` ending `/sign-in`; signed in 200 `text/html`;
  style-guide's `?view=variations` 200 and no nonce 500 (moved from its text test). The three text tests and their dead
  `ROUTE` constants go. One comment beside `registerHooks` says why (no other test uses it). **Control:** the guard line
  deleted from the canvas route → 200 where 303 is expected.
- [x] `apps/web/lib/zod.ts` (new), the eight importers, `eslint.config.js` — **DW-174, DW-201:** `import { z } from
  'zod'; z.config({ jitless: true }); export { z }`. Node-tested files import it by relative `.ts` path
  (`style-pack.ts`, `projects.ts`, `health-rule.ts` → `./zod.ts`; `sign-in/email.ts`, `account/passkey-name-rule.ts` by
  their relative depth); the rest by `@/lib/zod`. A new `apps/web/**` block: `no-restricted-imports` of `zod` and
  `zod/*`, `apps/web/lib/zod.ts` ignored. **Control:** a new `apps/web/zod-jitless.test.ts`, in its own file because it
  must be the process's first zod evaluation, traps `Function` and imports `./lib/style-pack.ts`: 0 probes (HEAD 1), plus
  a `jitless:false` arm proving the trap live; reverting `style-pack.ts`'s import turns it and ESLint red.
- [x] `apps/web/lib/canvas.ts`, both canvas routes, `pilots.test.ts`, `frame-guard.test.ts` — **DW-208:**
  `canvasCaching(v, live = process.env.NODE_ENV === 'production')` beside `V`, returning `{document, image}`; both
  routes call it, one comment left. Unit rows replace the regex; `frame-guard.test.ts` runs `/canvas?v=abc123` both
  ways (a unit test alone missed `live = true`). **Control:** dropping `v !== 'dev'`, and the default flipped, each red.
- [x] `apps/web/app/(app)/app/(authed)/sites/connect-wizard.tsx:135` — **DW-295:** `useEffect(() => { alive.current =
  true; return () => { alive.current = false } }, [])`, the editor's shape. **Control** (main session, a throwaway
  account as every walk makes): `run-verify-ghost-admin.py --url http://localhost:3000 --only connect` against
  `next dev` with StrictMode on — red at HEAD (no action POST leaves, "Connecting…" stays), green fixed.
- [x] `apps/web/lib/journal.ts`, `editor.tsx:1601` — **DW-220's app half:** `export const SYNC_TIMEOUT_MS = 20_000`,
  used for the unload flush's abort.
- [x] `components/shell/shell.tsx`, `harness/editor/layout.tsx`, `floor.spec.mjs:80`, the two comments — **DW-285:**
  `export const ShellUserContext`; the harness wraps `<Editor>` in `<ShellUserContext value={{ email:
  'harness@example.com', displayName: null }}>`; the floor's phone stop asserts the avatar reads "H" at 32×32.
  **Control:** without the provider, red.
- [x] `lib/editor.ts`, `(editor)/read.ts:290`, `harness/editor/layout.tsx` — **DW-257's server door:** `designateAll()`
  in `lib/editor.ts`, called by `read.ts` and the harness; the harness's own `MAIN_FEED` and feed index go, so
  `designate` picks the main feed for it. The stale comment `:111` is corrected. **Control:** a no-op `designateAll`
  turns the main-feed journeys red.
- [x] `editor.tsx:965`, `harness/editor/actions.ts` (new), `harness/editor/sites.ts` (new) — **DW-279:** `EditorProps`
  gains `reread?: typeof recheckSite` defaulting to `recheckSite`; a harness `'use server'` `harnessReread(projectId)`
  answers `{members: null, surfaces: …}` only for the harness project under `x-inflozo-harness-site: surfaces-later` (a
  site whose stored snapshot is empty), and refuses otherwise. It reads `projectId` (an unused argument is dropped from
  the request). The harness's site fixtures move to `sites.ts` (a `'use server'` file exports only async functions).
- [x] `apps/web/app/fonts/` (new), `app/layout.tsx`, `tokens.test.ts`, the stale comments — **DW-246:**
  - every `.woff2` file Google serves for today's options, fetched with next's own User-Agent, each hash equal to
    HEAD's build output; the three `OFL.txt` licences beside them;
  - `fonts.css`: Google's `@font-face` rules word for word with local URLs, the three `… Fallback` rules copied from
    HEAD's built CSS, and `:root { --font-inter: 'Inter', 'Inter Fallback'; … }` for the three variables;
  - `layout.tsx` drops `next/font`, imports `./fonts/fonts.css`, and preloads the three latin files with
    `preload(new URL('./fonts/<file>.woff2', import.meta.url).pathname, { as: 'font', type: 'font/woff2', crossOrigin: '' })`;
  - `tokens.test.ts:214-224` becomes: every `--font-*` the theme reads is declared in `fonts.css`, every `url()` there
    exists, and no `apps/web` source imports `next/font`;
  - the comments at `layout.tsx:5-10`, `globals.css:139`, `csp.ts:79-86`, `csp.test.ts:121`, `badge.tsx:43-44`,
    `run-verify-editor.cjs:768-769`, and the keyboard gate's font-fetch notes, say the fonts are the app's own.
  - **Controls:** the built CSS's `@font-face` rules equal HEAD's by descriptors and file hash; the screenshot
    comparison (Verification) pixel-identical, and red with Inter's 600 rewritten as 500; `pnpm build` offline fails
    at HEAD and passes fixed.

**Execution — the build and CI:**

- [x] `tools/check-traces.mjs` (new), `ci.yml`, `lib/style-guide.ts`, `lib/controls-review.ts`, `lib/pilots.ts`,
  `next.config.ts`, the three text tests — **DW-269:**
  - the check reads `git ls-files` for every directory the canvas reads (`packages/library/designs`, the orbit-weekly
    images and vendor files, `reference-tokens.css`, `control-groups.json`, `fixtures/controls`, `fixtures/paywall`,
    `apps/web/lib/canvas-chrome.css`), resolves each `.nft.json`'s `files[]` against its own directory, and exits 1
    naming route and file: the canvas route, `/pilots`, `(editor)/page` and `[template]/page` must hold the full set;
    `/controls` and `/controls/frame` the designs and `fixtures/controls`;
  - `style-guide.ts` exports `PACKAGES`; `controls-review.ts` and `pilots.ts` import it — one place finds `packages/`;
  - `ci.yml`: `- run: node tools/check-traces.mjs` straight after `check`'s `pnpm build`;
  - the inert `outputFileTracingIncludes` and its lists go, with the three text tests that held them; the check
    replaces them. A catalogue row for the new tool in `tools/doc-audit.py`.
  - **Control:** `PACKAGES` from `import.meta.url` → the build still exits 0 and the check exits 1 on all four routes.

**Execution — the keyboard gate:**

- [x] `tools/keyboard/journey.spec.mjs` — **DW-292:** `rendersSettle(page)` beside `resetRenders`: the Design block's
  visible preview frames all drawn, then `window.__inflozoRenders` still for three frame-plus-50 ms ticks; it replaces
  `panelsSettle` in the six render-count stops (R-210's stops keep theirs). **Control:** the old settle plus a wait for
  the tiles before the read is red every time; the new is green on `--repeat-each 4`.
- [x] `tools/probe/die-pips.cjs` (new), `journey.spec.mjs`, `run-verify-controls.cjs`, `run-verify-editor.cjs`,
  `globals.css:275-276` — **DW-216:** `module.exports = function diePips(faces)` returning `{layers, distinct, box}`;
  the journey `import diePips from '../probe/die-pips.cjs'` with `evaluateAll`; the two walks `require` it in their own
  `evaluateAll`. `run-verify-controls.cjs:28` requires `@playwright/test` as the other walks do. **Control:**
  `background-size: auto` at `globals.css:277` (R-164's regression) → "face 2's pips must land in 2 different places".
- [x] `journey.spec.mjs` — **DW-182:** a stop on the fixture ring: start a canvas session with the canvas document's
  own pointer events (5.23a's precedent), focus the heading, type past 40; the canvas's `[data-chrome="note"]` reads
  "Heading holds 40 characters." and the text stays 40; with `document.hasFocus = () => false` on the top page a blur
  keeps `[data-inflozo-editing]`; restored, a blur ends it. The header names the third synthesized press.
  **Control:** cutting `onRefused` (`editor.tsx:2870`) and the `hasFocus` guard (`inline.ts:271`) each red.
- [x] `floor.spec.mjs` — **DW-211:** a describe at 1280×720: select the ring's Layers row, hover its root, Next →
  `#editor-design-count` "2 of 3" and `#editor-said` "Design 2 of 3 — …"; Previous → "1 of 3"; Shuffle → not "1 of";
  ⌘Z → "1 of 3". The header's "TAPS ARE ALLOWED" says a pointer. **Control:** the arrows swapped, and Shuffle cut, red.
- [x] `journey.spec.mjs` — **DW-279:** a stop under `surfaces-later` holds the re-read POST with `page.route` until the
  empty snapshot paints no shims, releases it, and polls for both. **Control:** `drawShims(doc)` cut → red (without the
  hold the answer lands before the first paint and the cut stays green — executed).
- [x] `journey.spec.mjs` — **DW-257's other two:** the hydrate door — wait for IndexedDB `inflozo-doc-harness`'s `meta`,
  set every `docs.home` `isMainFeed` false, reload, exactly one main-feed chip (control: `designated` removed at
  `editor.tsx:3360`, red); the edit read — `page.route` answers the harness site like `live-content.test.ts:400-412`'s
  `fakeSite`, and an edit needing a new query requests it exactly once (control: the `editReads` branch cut, red).

**Execution — the walks (each control planted against production as a LOCAL RUN, then reverted):**

- [x] `run-verify-editor.cjs` — **DW-183, DW-204** (the retry and the control's reliability in separate commits, the
  walk run twice after each, step 5's control passing every time):
  - `steady` rethrows on `/\/auth\/confirm\?/`, wraps `reload` (retried as `go(p.url(), o)`), and on a first failure
    notes `stall` with the ISO start time, the method and the pathname only; `goBack` stays unretried;
  - `context.request.get` and `streamContext.request.get` wrapped once each, the same note; the unwrapped pages wrapped
    at creation; `main().catch`'s `HARNESS ERROR` carries its time.
  - **Controls:** step 79's first GET planted `{timeout: 1}` → a stall note and PASS (HEAD: HARNESS ERROR); `editorUrl()`
    held 35 s once → the same; `/auth/confirm` held 35 s on the phone context → the walk dies.
- [x] `run-verify-editor.cjs` step 89 — **DW-219, DW-291:** an `actionsSettle(ms)` helper beside `steady` (a Set of
  `next-action` POSTs, quiet for ~500 ms); step 89 settles and polls `stored513` until the slug matches, then reloads.
  Then it captures the subject save (`page.waitForRequest`), replays it once with another valid slug (`{"ok":true}`,
  the row moves — the replay's control), then forges each refusal in the I/O matrix — B's project id among them — each
  answering `SUBJ.SAVE_REFUSED`, A's row byte-identical and B's `project_template_prefs` still `[]`. Author: the pill
  names its fixture subject, another is chosen and its row polled. Page: the pill names its one subject and the menu
  holds exactly that row. **Control:** the subject POST held 4 s → red at HEAD's wait, green settled.
- [x] `run-verify-editor.cjs` steps 90, 66b, 36, the decoders, the signed-out loop, the filters —
  - **DW-284:** `actionsSettle(30000)` before step 90's poll, naming any still in flight on timeout. Control: the
    `"states"` POSTs held 4 s.
  - **DW-220:** 66b polls `revisionNow58()` until it moves, for `SYNC_TIMEOUT_MS + BACKOFF_S[0] * 1000` and a margin,
    then reads the state, noting a Retrying seen. Control: the hide flush held 17 s (first confirm `page.route` sees the
    keepalive POST; otherwise CDP latency).
  - **DW-222:** step 36's settled check measures against the root carrying `data-inflozo-hover` a frame later, and the
    sampler skips a frame whose hovered root changed. Controls: a 1 px `mouse.move` after the wheel forces the re-hover
    (old red, new green); `[data-section-pill]{translate:0 40px}` planted stays red.
  - **DW-236:** each `img.decode()` in `drift` and `stuckRows` is caught, skipped and counted in the detail; the floors
    stay. Controls: one frame's base64 truncated → "1 skipped", PASS; every frame → the floor FAILs.
  - **DW-117:** the signed-out loop `:5999` gains `/controls/frame` and `/style-guide/frame`, each 303.
  - **DW-174:** the four dashboard filters (`:5907`, `:6117`, `:6287`, `:6459`) go, so a CSP report on `/` fails —
    red on production before the push, which is its control.
- [x] `run-verify-controls.cjs`, `run-verify-pilots.cjs`, `run-verify-passkeys.py` — **DW-287:** every `networkidle`
  becomes `load`; each in the two `.cjs` walks already has a landmark wait after it, and each in the passkeys walk gains
  one where none follows. **Control:** a request held open so the network never goes quiet → timeout at HEAD, PASS.
- [x] `run-verify-live-content.cjs` — **DW-251's capped half** (Ask First): a session block before T1's 429 step,
  shaped like `:716`'s, routes `${origin}/ghost/api/content/posts/` at `limit === LIST_LIMIT` with no filter, sets
  `meta.pagination.total` to `LIST_LIMIT + 1` and fulfils; the source pill's line and the link picker's capped line read
  their words. The header names it a simulated condition without a count. **Control:** the same session unrouted reads
  both lines absent.

**Execution — the database and the test-site tools:**

- [x] `tools/probe/record-edit-lock.py`, `package.json` — **DW-245:** `fixture()` deletes the user it created if
  anything after fails, then re-raises; `(Void, SubprocessError, OSError)` stays "RUN VOID" exit 1, anything else
  prints "PROBE ERROR" with its traceback, exit 2; an offline `--self-check` (before the help branch, in `pnpm test`)
  asserts a failed project POST issues the user's DELETE and the classifier's two exits.
- [x] `RLS-TEST.sql`, then `cp` to `supabase/tests/rls.sql` — **DW-245's F4:** both halves seeded relative (`select
  lock_generation + 1 into strict g`, the CAS `g → g + 1`, asserting `g + 1`). **Control:** `lock_generation = 40`
  planted before F4 → red at HEAD (`monotonic (40 -> 10)`), green relative.
- [x] `run-verify-ghost-admin.py`, `RLS-TEST.sql` → `rls.sql`, `MEASUREMENTS.md` — **DW-294:** a `schemas-off-rest` step
  in `--check` beside `vault-off-rest`: `GET /rest/v1/<a table that does not exist>` with the publishable key and
  `Accept-Profile` `private`, `storage`, `vault` → 406 PGRST106, the hint printed; `public` and `graphql_public` not 406
  as its control. The SQL block keeps its FAIL branches for a database-level `pgrst.db_schemas` and, when unset, prints
  "NOT ASSERTED HERE" naming the `--check` step. A new MEASUREMENTS section records the reading and corrects §16b and
  the entry's "covered over the wire" (§16b is left as written). **Control:** `graphql_public` planted in the
  must-be-unexposed list → FAIL.
- [x] `tools/probe/seed-ghost.py:74-76` — **DW-298:** the third address becomes
  `https://static.ghost.org/v4.0.0/images/writing-posts-with-ghost.png` (200 at Create) and the `ponytail:` comment
  goes; a `--check` handled before the majors loop HEADs every `IMG` address and exits 1 on any non-200. **Control:** red
  at HEAD, green fixed.
- [x] `tools/probe/record-cards.py` — **DW-301:** the owned tags' names checked right after `by_slug`, before anything
  is published; each owned post's PUT answer checked for its `published_at` and `tags[0]` after `docs.append`, so the
  `finally` still drafts it; a mismatch raises `Void` naming the slug. **Control:** `--self-check` gains a fake whose tag
  is renamed and asserts `publish_owned` raises naming `inflozo-defaults-b`.
- [x] `tools/probe/RESET-PROTOCOL.md` § Ghost, `MEASUREMENTS.md` — **DW-299:** a short "hand changes on the test sites"
  paragraph: `probe-gated-post` retitled with an Unsplash image (2026-09-25 04:48–04:49 UTC), "Reading the margins"'s
  uploaded image (04:50 UTC), and `portal_button_icon` `icon-5` (**2026-09-26** 16:35 UTC), each by the owner in Ghost
  Admin per T3's actions log, kept, and recorded in `ghost5.json`. MEASUREMENTS gains the actions-log fact: browser edits
  are logged, staff-token writes are not.

**Execution — the close:**

- [x] **`deferred-work.md`.** Written at this Create: DW-251's owner line naming Stories 5.24d and 9.1, 9.1's card
  carrying the ring-tile half. At Dev every entry whose evidence exists closes; DW-251 stays open, owned by Story 9.1
  alone; DW-204 closes only on a classified stall (Ask First).
- [x] **The registers.** `epic-5-context.md` gains a sub-bullet for this story's Dev; the memory notes on CI's font flake
  and Vercel's logs are the Dev session's to update.
- [x] **Standing rule 7.** Grep for `next/font`, `networkidle`, `outputFileTracingIncludes`, `panelsSettle`, `from
  'zod'`, `/home/ghost/Dev/BMAD`, and every DW id this story touched.
- [x] **The gates.** `pnpm check` (Node 24), `pnpm keyboard`, `bash supabase/tests/run-rls-gate.sh`, `node
  tools/check-traces.mjs` after `pnpm build`, and `python3 tools/doc-audit.py --check` twice: all green, every new
  check seen red on its control first.

**Acceptance Criteria:**

- **The group.**
  - *Given* Group D re-derived at HEAD,
  - *when* this story is done,
  - *then* every entry is closed by a change whose control was seen red with the change reverted, and its
    `resolution:` names that evidence;
  - *and* DW-251 stays open for Story 9.1's ring tile, whose card names it, and no entry was deleted or renumbered.
- **The flaky stops.**
  - *Given* the stops the ledger names flaky (DW-183, 204, 220, 222, 236, 284, 287, 291, 292),
  - *when* each one's fault is planted,
  - *then* it waits for the condition it means and passes, and with the old wait it fails.
- **The missing checks.**
  - *Given* each check this story adds (DW-117, 162, 174, 182, 208, 211, 216, 219, 245, 251, 257, 269, 279, 285, 294,
    295, 298, 301),
  - *when* the thing it protects is reverted,
  - *then* it goes red.
- **The fonts.**
  - *Given* the app built from its own font files,
  - *when* home, sign-in, the editor at 1440 and 390, an editor hover and Projects are photographed before and after,
  - *then* every pair is pixel-identical, and `pnpm build` passes with no network.
- **The frame.** None — no surface is built (this story's card). *Given* the deployed build, *when* any screen is
  opened, *then* it draws what it drew before, as the fonts comparison holds.
- **The gates.** *Given* `pnpm check`, `pnpm keyboard`, the RLS gate, the trace check and the documentation gate, *when*
  the Dev push is built, *then* all are green; and the deployed editor, controls, pilots, live-content and passkeys
  walks pass with no `FAIL`.

### Review Findings

*Code review, 2026-10-01 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier on `app.inflozo.com`, Supabase, Vercel, GitHub Actions, T1 and T3), then the clean committed walks on the
deployed build in the main session. Every patch is applied in the Review commit, each new check seen red on its control.
No question is the owner's; two findings are deferred to the ledger with a named owner; 22 dismissed as noise or as
calls the spec already made.*

- [x] [Review][Patch] **The controls walk failed its first clean deployed run** — step 2, "the canvas scrolls inside its
  own frame — canvas range 0px, bar 0px", 1 FAIL / 114 PASS, then 0 FAIL / 115 PASS twice. `networkidle` had been hiding
  a wait the walk never had: the runtime sets the sample picture's address after the frame loads, and with `load`
  (DW-287) step 2 could read the canvas before the picture gave it its height. The landmark at all three loads is now
  the picture loaded. Control, the picture held 3 s: HEAD's walk red at step 2, a first fix (the frame's `readyState`)
  still red, this one 0 FAIL / 115 PASS [tools/probe/run-verify-controls.cjs:88]
- [x] [Review][Patch] **The live-content walk failed its clean deployed run on T3** — "the choice is stored per canvas —
  null" and, after the reload, "Style-guide article": 2 FAIL / 155 PASS. DW-291's fault in the walk this story did not
  convert: the subject save is a background server action queued behind the looked-at record, and the walk read the row
  after a fixed second, then reloaded over it. It now polls the row until it names the choice. Control, the save held
  5 s on T3 (stopped before any Ghost write): the poll waited 5.9 s and both checks PASS
  [tools/probe/run-verify-live-content.cjs:569]
- [x] [Review][Patch] `check-traces.mjs` refused an empty git listing for two of its eight paths only, so a moved file
  shrank the set and still printed PASS: every path is now asked on its own (control: `canvas-chrome.css` misnamed →
  REFUSED, exit 2) [tools/check-traces.mjs:31]
- [x] [Review][Patch] `check-traces.mjs` did not hold the style-guide's routes, whose text test this story deleted: its
  page, frame and variations are checked for Orbit Weekly's images, vendored cards and the reference tokens — PASS on
  the build [tools/check-traces.mjs:63]
- [x] [Review][Patch] `schemas-off-rest`'s control passed on anything but 406 (a 401 or a 500 too) and printed
  PostgREST's hint without reading it: the exposed pair must answer 404 PGRST205 and the hint must name exactly
  `public, graphql_public` (controls: PGRST000 wanted → FAIL; `public` alone expected → FAIL)
  [tools/probe/run-verify-ghost-admin.py:5135]
- [x] [Review][Patch] `record-edit-lock.py`'s clean-up DELETE could raise the way the POST had, and the account's id was
  then never printed — the leak DW-245 set out to close: caught and printed, with a self-check row (red with the guard
  removed) [tools/probe/record-edit-lock.py:474]
- [x] [Review][Patch] `record-cards.py` could create a missing owned tag and then void on the next one's name: every
  name is checked before anything is created [tools/probe/record-cards.py:347]
- [x] [Review][Patch] The editor walk's `reload` retry went round the single-use-link exclusion (a page still standing
  on `/auth/confirm?` would have been asked for its link twice): it rethrows there [tools/probe/run-verify-editor.cjs:407]
- [x] [Review][Patch] A `stall` note dropped the error, so a timeout could not be told from a refused connection when
  DW-204's notes are classified: its first line rides with the note, any query string cut
  [tools/probe/run-verify-editor.cjs:392]
- [x] [Review][Patch] The signed-out loop — grown from two GETs to four by this story — was the one request context left
  without the retry [tools/probe/run-verify-editor.cjs:6230]
- [x] [Review][Patch] 66b's deadline is built from two of the app's exports; a renamed one made it NaN and the wait
  endless: it throws instead. Step 89's Author read-back now names what was still in flight
  [tools/probe/run-verify-editor.cjs:3313]
- [x] [Review][Patch] `frame-guard.test.ts` asked each route signed out on its bare address only; the deleted text tests
  had held the guard ahead of the picture branch: `?image=`, `?design=` and `?view=variations` are asked too
  [apps/web/frame-guard.test.ts:51]
- [x] [Review][Patch] `tokens.test.ts` did not hold the layout's import of `fonts.css` (removed, every face falls back
  and the test passed), and saw `next/font` only after `from`: both held [apps/web/tokens.test.ts:228]
- [x] [Review][Patch] The live walk's simulated total threw on an answer that was no list (a 401, a 429): it passes
  through as Ghost sent it [tools/probe/run-verify-live-content.cjs:1322]
- [x] [Review][Patch] `designateAll`'s comment claimed `pnpm keyboard` sees the server door break; it sees the function,
  and `editorData`'s call is seen only by the deployed walk's step 94 — the comment says so
  [apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts:81]
- [x] [Review][Patch] DW-287's resolution said no walk waits for a quiet network: one swallowed `networkidle` stays in
  `run-verify-ghost-admin.py`'s `ownership` step on purpose, and the resolution now says so and records the controls
  walk's race [_bmad-output/implementation-artifacts/deferred-work.md DW-287]
- [x] [Review][Defer] No automatic gate holds "the `private` schema is not exposed" — `schemas-off-rest` is hand-run and
  CI has no Supabase key [.github/workflows/ci.yml] — deferred, pre-existing (the SQL block never asserted it): DW-302,
  Story 5.24e
- [x] [Review][Defer] DW-295's fix has no automated check; its control was a hand run under `next dev`
  [apps/web/app/(app)/app/(authed)/sites/connect-wizard.tsx:137] — deferred, pre-existing: DW-303, Story 5.24e

## Spec Change Log

- **2026-10-01 (Dev) — `designateAll` lives in `(editor)/read.ts`, not `lib/editor.ts`.** The Shell imports
  `lib/editor.ts`, and the runtime import took Projects' client script from 384,773 to 922,553 bytes (97 → 182 KB
  gzip), measured on the production build; `read.ts` is server-only and the harness layout imports it from there.
- **2026-10-01 (Dev) — DW-257's edit read goes through Source → By tag.** A duplicated feed asks no new read (its query
  is cached), so it could not go red; the tag source asks reads the feed has not made, and the stop asserts each
  distinct read is requested exactly once (the `editReads` branch cut: red).
- **2026-10-01 (Dev) — DW-182's press focuses the heading itself** (`el.focus()` after the synthesized
  pointerdown/mousedown/mouseup: a synthesized press moves no focus); **DW-292's control slows the tile previews
  800 ms** with `page.route` — on a warm server `panelsSettle` passed 4 of 4, so the race was made certain: old red 4/4,
  `rendersSettle` green 4/4.
- **2026-10-01 (Dev) — DW-287's passkeys landmark is Next's route announcer.** `next-route-announcer` is appended by the
  App Router from an effect, so it exists only once the page has hydrated — the handlers the walk's presses need.
- **2026-10-01 (Dev) — DW-236's control spoils the frame's header instead of truncating it.** Executed first: Chromium
  decodes a PNG cut short anywhere past its header (half, a tenth, 64 characters — each 1440×900), so a truncated frame
  never reaches the new branch; a frame whose first byte is changed is refused with the entry's own `EncodingError`.
- **2026-10-01 (Dev) — DW-222's controls, re-planted where they can cross a section.** The 1 px move after the 300 px
  wheel cannot cross on today's seed (the grid fills the reachable window; even 1066 px left it under the pointer), so
  HEAD stayed green under it; the crossing control is a wheel up to the top and the pointer onto the sticky header.
  `translate:0 40px` stays inside the tall grid, so the off-section plant is `translate:40px 0`. The sampler starts from
  the root hovered as it begins, so only a real move counts as "rehovered". Its own old red was not reproduced (a
  pointer-driven re-hover re-places the pill in the same frame); DW-222's resolution says so.
- **2026-10-01 (Dev) — DW-291's and DW-284's holds lengthened to 12 s.** At 4 s (and DW-284 at 6 s) HEAD stayed green:
  step 89's later checks outlast the hold before its reload, and step 90's ten-second poll caught both queued writes.
- **2026-10-01 (Dev) — the walks prefer the repository's own Playwright and axe-core** (`run-verify-passkeys.py`,
  `run-verify-core.py`), the BMAD paths kept as fallbacks — standing rule 7's grep for `/home/ghost/Dev/BMAD`.
- **2026-10-01 (Dev) — `record()` publishes the recorder's own rows first** (DW-301). The I/O matrix's "voids … before
  anything is published" holds only if `publish_owned` runs before the fixture documents, so it moved there; the
  defaults are read by id, so the order moves nothing recorded. Held by `--self-check`; never run live.
- **2026-10-01 (Dev, main session) — DW-183's "separate commits" are separate hunks in the one Dev commit.** R-81 gives a
  phase one commit, and `tools/hooks/commit-msg` refuses a Dev commit while a task is open, so the retry (`steady`,
  `steadyRequests`) and the change to step 5's reads (DW-174's filters) land together, in separate hunks. What the ledger
  wanted the split for — telling which change broke step 5's control — did not arise: the control passed in every walk.
- **2026-10-01 (Dev, main session) — DW-295's control is `--only brand-none`, reached as `app.inflozo.com`.** The harness
  has no block named `connect`; every T1 seed is a connect walked through the wizard, and `brand-none` needs nothing
  else. On `localhost` the app lives under `/app` and its redirects do not, so `next dev` was reached as
  `http://app.inflozo.com:3000` through Chromium's host-resolver rule (one line, in a scratch copy of the harness), with
  `allowedDevOrigins: ['app.inflozo.com']` set for the run and reverted — without it Next 16's dev server refused its own
  chunks, the page never hydrated, and the form posted natively and connected at HEAD: a broken control, caught in the
  server's log and re-run.
- **2026-10-01 (Dev, main session) — the live-content walk's R-192 reader check tells a section's ⋯ from a Ghost
  surface's.** Its first run here failed it on both majors, and so did HEAD's walk on production: Story 5.21's Review gave
  Ghost's strip and button rows (`ghost:…`) a ⋯ holding only Hide / Show — a look this browser keeps — which stays live
  for a reader as R-192 keeps every view control, and the check, written at 5.19, read every ⋯ as a section's. It now
  asserts every section row's ⋯ disabled and every surface row's live (diagnosed read-only on T3 first: the two section
  rows' ⋯ disabled, "Announcement bar" and "Subscribe button" live). Outside Group D, fixed here because this story's
  acceptance needs the walk at 0 FAIL; the comment beside the check says why.

## Design Notes

**No question is the owner's.** Every call below is technical or already ruled, so it is stated here in one line each.

**Routine calls made here.**

1. **DW-251's ring tile moves to Story 9.1.** Every shipped category has one design, so production draws no ring
   strip; 9.1 ships A1's ring of four and its live-content walk reads the tile. 5.24c's DW-224 → 6.1 is the precedent.
2. **DW-299's changes are kept and written down.** T3's actions log names the owner in Ghost Admin as their author
   (his test of Story 5.18 on 2026-09-25, and of 5.21's Portal on 2026-09-26); putting them back would be a test-site
   write the entry does not ask for.
3. **DW-246 uses plain `@font-face`, not `next/font/local`.** It is the only way that kept every rule identical;
   the fonts are frozen at today's versions, so Google's future updates no longer arrive unasked.
4. **DW-269 deletes the inert lists.** The trace check is the proof; text tests over a setting that does nothing proved
   nothing. The check runs in `check`, since `pnpm check` runs before any build and `vercel build` only adds files.
5. **DW-287 reaches the passkeys walk too** (standing rule 7): the same wait, seven more calls.
6. **DW-257's edit read is a journey with a fake Ghost**, not a `unasked()` unit row: the row would hold the predicate,
   not the branch's wiring, and the harness CSP lets the route answer.
7. **DW-279 adds one prop to `Editor`** — a re-read seam defaulting to the real action — the smallest way a database-less
   harness sees a landed answer.
8. **Projects is photographed on the deployed site**, before the Dev push and after its deploy, because it needs a
   database; the local set covers every face and weight.

**Where 5.24a's plan was wrong at HEAD.**
- DW-117/162: nothing in `next/server` needs stubbing — only the module names mapped; and `run-verify-controls.cjs`
  never fetched signed out — the one executed 303 is the editor walk's, for `/canvas` alone.
- DW-174/201: no second zod copy; the cause is load order. `style-pack.ts:43` is the only client-side object schema.
- DW-183: `steady` already retries the single-use magic link on five pages, and silently.
- DW-220: `lib/journal.ts` exports no budget, and "Synced" says nothing about a server action (DW-291).
- DW-246: `next/font/local` cannot reproduce today's fonts.
- DW-251: a ring tile cannot be drawn on production today.
- DW-269: the file set is wider than `designs/`, `[template]/page` has its own trace, and `/controls` carries nothing.
- DW-182: the harness CAN reach the limit (the fixture heading is 40) and a lost window CAN be simulated.
- DW-245: the unbound name is unreachable; the real gap is a leaked fixture user, and F4 has two absolute seeds.
- DW-294: `vault-off-rest` never asked another schema, so `private` was not covered over the wire either.
- DW-299: the icon changed on 2026-09-26, and the inventory is a paragraph to add, not a list to extend.
- DW-292: the cause is found — the ringed section's Design tiles commit late — not a slow runner alone.

## Verification

**Commands** (Node 24: `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`):

- The group, re-derived at HEAD from each entry's living owners. Expected: § The triage's list.
  `python3 -c "import re, importlib.util as u; s=u.spec_from_file_location('b','tools/story-board.py'); b=u.module_from_spec(s); s.loader.exec_module(b); d=b.load_deferred(open('_bmad-output/implementation-artifacts/deferred-work.md').read()); print(sorted((x['id'] for x in d if not b.dw_closed(x) and '5.24d' in b.story_refs(re.sub(r'\*\(.*?\)\*', '', x.get('owner') or '', flags=re.S))), key=lambda i: int(i[3:])))"`
- `pnpm check` — expected: exit 0, `frame-guard.test.ts`, `zod-jitless.test.ts` and the self-checks among the tests.
- `pnpm keyboard` — expected: every journey and floor stop green, the new ones included; the 5.23b describe green on
  `--repeat-each 4`.
- `pnpm build && node tools/check-traces.mjs` — expected: exit 0; with `PACKAGES` from `import.meta.url`, exit 1.
- `unshare -rn sh -c 'ip link set lo up && exec pnpm build'` — expected: passes (HEAD fails on
  `fonts.googleapis.com`).
- The screenshot comparison, a one-off in the scratchpad: a production harness build (`INFLOZO_HARNESS=1` on build and
  start) of HEAD and of the fix, home, `/app/sign-in`, the harness editor at 1440 and 390 and an editor hover —
  expected: every pair byte- or pixel-identical (one re-run allowed); red with Inter's 600 as 500. Projects on
  `app.inflozo.com` with a throwaway account, before the Dev push and after its deploy — expected: identical.
- `bash supabase/tests/run-rls-gate.sh` — expected: exit 0, the exposure block saying what it cannot see.
- `python3 tools/probe/run-verify-ghost-admin.py --check` — expected: `schemas-off-rest` PASS.
- `python3 tools/probe/record-edit-lock.py --self-check`, `python3 tools/probe/record-cards.py --self-check`,
  `python3 tools/probe/seed-ghost.py --check` — expected: exit 0.
- After the push, on the deployed build: `node tools/probe/run-verify-editor.cjs`, `run-verify-controls.cjs`,
  `run-verify-pilots.cjs`, `python3 tools/probe/run-verify-passkeys.py`, and `NO_429=1 node
  tools/probe/run-verify-live-content.cjs` (Ask First) — expected: `0 FAIL` each; the editor walk's stall notes, if any,
  classified with `npx vercel@latest logs --project inflozo --environment production --since <t-5s> --until <t+60s>
  --json` within the hour (no line: client or network; 5xx: product; 2xx: answered — client or a slow stream). The
  passkeys walk: exit 0 and no `FAIL` line.
- `python3 tools/doc-audit.py --check`, twice — expected: PASS.

**Real services (R-82).**
- `app.inflozo.com`: every deployed walk, the planted controls as LOCAL RUNs, Projects photographed.
- Vercel: the request logs for DW-204; CI on GitHub Actions for DW-269's step and `pnpm keyboard`.
- Supabase production, read-only: the exposed schemas over PostgREST and the Management API.
- T1 and T3: the live-content walk (Ask First); T3's Admin API read-only for DW-299 and DW-301.
- `static.ghost.org` and Google Fonts, read-only.

**Executed at Create (2026-10-01), read-only.** Nothing was written to the repository except this story's documents,
and nothing to any server.

- **Group D at `03d7393a`:** the open entries owned by 5.24d are exactly the card's list.
- **The app pass**, a scratch copy: `frame-guard.test.ts` green, red with the canvas guard deleted; `style-pack.ts`
  fired zod's probe once at HEAD and none through `lib/zod.ts`; `canvasCaching` red on both plants; `apps/web`'s suite,
  `tsc` and ESLint green with all four fixes.
- **The keyboard pass:** the ⌥↓ stop failed 2 of 4 at HEAD on a warm server (`design` 1 and 2), and the new settle
  passed 48 of 48; the DW-182, 211, 216, 257, 279 and 285 stops each green fixed and red on their plants.
- **The build pass:** `pnpm build` 11.4 s; the four canvas traces hold every tracked file the canvas reads, `/controls`
  none; the check red with `PACKAGES` from `import.meta.url`. HEAD failed offline in 8.7 s on three
  `fonts.googleapis.com` errors; the plain `@font-face` build passed offline, its 39 rules equal to HEAD's, and seven
  screens pixel-identical on two runs (red on five with Inter 600 as 500).
- **The walks pass:** read only. `npx vercel@latest logs` returned production request lines up to ~99 minutes old.
- **Supabase production:** `GET /rest/v1/nonexistent_probe_table?limit=0` with the publishable key — `Accept-Profile:
  storage` and `private` 406 PGRST106 ("Only the following schemas are exposed: public, graphql_public"); `public` and
  `graphql_public` 404 PGRST205. The Management API's `GET /v1/projects/{ref}/postgrest`: 200, `db_schema:
  "public,graphql_public"`. The RLS gate in its container: exit 0, and the planted `lock_generation = 40` red at HEAD,
  green seeded relative.
- **T3 and T1, Admin API GETs:** the actions log names the owner for all three changes; the four owned recorder rows
  match their design on both majors. `static.ghost.org`: `v5.0.0/…/writing-posts-with-ghost.png` 404, the `v4.0.0`
  address 200, the other two 200.

**Executed at Dev (2026-10-01).** Node 24.18.1; keys by variable name only; GETs only on T1 and T3, and no live run of
`record-cards.py` or `record-edit-lock.py`. Every walk was a LOCAL RUN against production from a planted copy outside
the repository (the working tree's walk, or HEAD's from a `git archive`), its throwaway accounts deleted (users 13 → 13
every run); the repository's walks carry no plant.

- **The gates, on the final tree:** `pnpm check` exit 0 (`apps/web` 627 tests, `frame-guard.test.ts`,
  `zod-jitless.test.ts` and the three self-checks among them); `pnpm keyboard` 126 passed; `bash
  supabase/tests/run-rls-gate.sh` exit 0, F4 seeded relative and the exposure block "NOT ASSERTED HERE" naming
  `schemas-off-rest`; `pnpm build` then `node tools/check-traces.mjs` PASS on every route; the doc gate STALE once (the
  board), then PASS.
- **Controls seen red, offline:** the canvas guard deleted ("/app/canvas answered 200 to a stranger"); `canvasCaching`'s
  `v !== 'dev'` dropped and its default flipped; a direct `zod` import (ESLint) and `jitless` off (the probe fires);
  `next/font` imported (`tokens.test.ts`); `PACKAGES` from `import.meta.url` (the trace check red on every route while
  the build passed); the keyboard stops on their plants — `onRefused` and the `hasFocus` guard cut (DW-182), the pill's
  arrows swapped and Shuffle cut (DW-211), the provider removed (DW-285), `background-size: auto` (DW-216), `drawShims`
  cut (DW-279), `designated` removed, `designateAll` a pass-through and the `editReads` branch cut (DW-257); DW-292's
  describe with the tiles slowed 800 ms, old 4 of 4 red, `rendersSettle` 4 of 4 green. The subagent's database and
  test-site tools each red on their control (`lock_generation = 40` before F4; `graphql_public` planted;
  HEAD's `IMG` list; a renamed owned tag; HEAD's `fixture()`).
- **The fonts:** 16 files equal by hash to the last `next/font` build, 39 rules equal in order, the three preloads the
  same latin files; seven screens of a production harness build byte-identical against HEAD's (one 13-pixel diff on the
  first run was HEAD's own run-to-run variance), red on five with Inter's 600 as 500; offline, HEAD exit 1 on three
  `fonts.googleapis.com` fetches and the fix exit 0. Projects photographed on production before the push
  (1440 and 390); the after-deploy pair is the main session's.
- **The editor walk, planted (LOCAL RUNs):** the new walk under DW-183's, 219's, 220's, 284's and 291's plants, 670 PASS
  and 4 FAIL — the four CSP reads of production's `/` eval, DW-174's red before the push; under DW-236's undecodable
  frames, 59 frames · 1 skipped PASS, 57 · 1 PASS and 0 · 61 FAIL, then the phone's magic link held 35 s killed it as
  planted; DW-222's header plant green (both checks) and `translate:40px 0` red (both); 12 s holds on steps 89 and 90
  green (`inFlight []`, `stillInFlight []`). HEAD's walk under the same plants: 66b red, step 79 HARNESS ERROR, step 36's
  settled check red, steps 89 and 90 red at 12 s (green at 4 s and 6 s — the holds were lengthened, Spec Change Log),
  one undecodable frame `EncodingError`. HEAD's walk also died once at step 53 on a Clear button left busy and once
  failed 69b — neither line is this story's, and both passed on HEAD's other runs.
- **DW-287:** with one request held open on every page, HEAD's controls and pilots walks died at their first load and
  the new ones passed whole (0 FAIL / 115 PASS, 0 FAIL / 152 PASS); `land()` on `/sign-in` 586 ms against
  `networkidle`'s 30 s TimeoutError.
- **DW-204:** thirteen real stall notes across these runs, read in Vercel's request rows (DW-204's resolution); none has
  a row for its first attempt.
- **Not run here — the main session's:** DW-295's control under `next dev`; the live-content walk (DW-251, Ask First);
  the passkeys walk whole (it flips production's passkeys flag); the Projects pair after the deploy; the clean deployed
  walks after the push.

**Executed at Dev, in the main session (2026-10-01)** — what the spec keeps out of a subagent, then the gates again on the
final tree. Keys by variable name only, read into each command's environment from `tools/probe/.env`.

- **The owner's go**, asked in this session before any test-site write ("May I write to the test sites for 5.24d?"):
  option 2, "Yes, including T1's hour block". Both live walks ran with `NO_429=1` all the same — this story does not touch
  the 429 step, and an hour's hold on T1 from this network would land on the Review's own live walk.
- **DW-295's control:** `next dev` (StrictMode on, its default) with `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SECRET_KEY` and `SUPABASE_DB_POOLER_URL`; `run-verify-ghost-admin.py --url http://app.inflozo.com:3000 --only
  brand-none` (Spec Change Log), its T1 seed a connect through the wizard; users 13 → 13 on every run.
  - HEAD's wizard: FAIL, "seed T1: the connect never reached S2c in 60s; the form ends "… Back Connecting…"", and the dev
    server logged the keys step's GET and no POST.
  - The fix: `POST /sites/connect?step=keys 200 in 9.9s`, S2c, `brand-none` PASS, RESULT all steps passed.
  - The broken control first: without `allowedDevOrigins` the server logged "Blocked cross-origin request to Next.js dev
    resource" for every chunk, the page never hydrated, and HEAD connected through the form's native post. Hydration was
    then checked before the control ran (`next-route-announcer` present in 869 ms). Both accommodations were reverted, and
    `next-env.d.ts` restored.
- **DW-251's capped half — the live-content walk**, LOCAL RUNs on `app.inflozo.com` (`APP_ORIGIN`, `NO_429=1`, both
  majors; `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `GHOST{5,6}_URL`, `GHOST{5,6}_CONTENT_API_KEY`, `GHOST{5,6}_ADMIN_API_KEY`,
  `GHOST{5,6}_STAFF_ACCESS_TOKEN`):
  - Run 1: 5 FAIL, 152 PASS. The new block PASSED on T3 — "Showing your newest 100 posts." under the subjects and
    "Showing your newest 100 posts. Paste an older post's address to link it." in the Link Picker — and so did its control,
    both lines `null` unrouted. The five FAILs were outside it, on checks this story had not changed, and production still
    ran HEAD's app: R-192's reader check on both majors, and on T3 three Tag-canvas checks whose canvas had not painted
    inside the walk's 20 s.
  - Diagnosed read-only before anything changed: a scratch copy of the walk on T3 that stopped before its first Ghost
    write. The Tag canvas painted in 1.4 s and the short tag's pick landed in 0.8 s, so run 1's three were a slow read,
    not a fault. R-192's check was stale, and is fixed (Spec Change Log): the reader's two section rows had their ⋯
    disabled, and Ghost's "Announcement bar" and "Subscribe button" rows were live by design.
  - Run 2, with that fix: **0 FAIL, 157 PASS**, the capped lines and their control PASS again, R-192's check PASS on both
    majors, users 13 → 13.
  - Each run set T3's Subscription access to Nobody and turned T1's Portal button on with its bar emptied, for under a
    minute each, then put both back and read them back from Ghost: `members_signup_access` `all` and `paid_enabled`
    true; `portal_button` false and `announcement_visibility` `["visitors"]`.
- **The gates, re-run here on the final tree:**
  - `pnpm check`: exit 0. `apps/web` ran 627 tests, 0 failed, the frame-guard, zod-jitless, canvasCaching and fonts
    tests among them, then the three self-checks and `check-snapshots`.
  - `bash supabase/tests/run-rls-gate.sh`: exit 0. F4 PASSES seeded relative ("gen now 7"), and the exposure block
    prints NOT ASSERTED HERE.
  - `pnpm build`, then `node tools/check-traces.mjs`: PASS on all six routes (101 files for the canvas four, 30 for
    `/controls` and its frame). Its control, re-run here with `PACKAGES` planted to the module's address: the build
    exit 0 and the check exit 1 on all six ("100 of the 101 files it reads are not in …"); restored, rebuilt, PASS.
  - `pnpm keyboard`: 126 passed (4.4 min), every new stop among them — DW-182, DW-211 (the floor), DW-257's two, DW-279,
    R-164's pips through `die-pips.cjs` — and the 5.23b render-count stops on `rendersSettle`.
  - The build inside `unshare -rn` (loopback up): exit 0. `curl` to fonts.googleapis.com from inside it answered
    nothing, so the namespace really was offline.
  - `python3 tools/probe/seed-ghost.py --check`: three 200s, PASS.
  - `schemas-off-rest`: PASS in each of the three harness runs above, with the same five answers as MEASUREMENTS §60.
  - `python3 tools/doc-audit.py --check`, twice after the story board was regenerated: PASS both times, 0 warnings.
  - The group re-derived (the first command above): `['DW-246']` — open on the deployed Projects pair alone; DW-251 is
    Story 9.1's.
- **After the Dev push `5f78f6d8`** (`GITHUB_TOKEN`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT` by name):
  - CI: `ci.yml` run 36872679951 — `check` (doc gate, `pnpm keyboard`, `pnpm check`, `pnpm build`, and the new
    `node tools/check-traces.mjs`), `rls` and `deploy` all success; `matrix.yml` success.
  - Vercel: `dpl_BauVQ66Tsn618CDBcQeyfLnw4Krs` READY on `app.inflozo.com`. `/sign-in` answers 200, its `<html>` carries no
    next/font class, and it preloads `/_next/static/media/{bricolage-grotesque,inter,jetbrains-mono}-latin.*.woff2`.
  - **The fonts' deployed pair:** Projects photographed at 1440 and 390 with a throwaway account (users 13 → 13) —
    byte-identical to the photographs taken before the push. The first attempt died on its magic link's 30 s `goto`; it
    was no result, and the re-run was clean.
  - The same Projects load reported 0 securitypolicyviolation events on `/`; before the push, production reported 3,
    zod's eval probe (DW-174).
  - DW-246 closes on that pair; the re-derivation now prints `[]`.
- **Real services touched at Dev (R-82):**
  - Supabase production: every walk's and the connect control's throwaway account (users 13 → 13 each time),
    PostgREST's exposed schemas, and the Management API's `postgrest` setting, read.
  - Vercel: the request logs, read (DW-204).
  - T1 and T3: the connect's Admin API reads; both live walks' writes, approved, put back and read back; the actions
    log and the recorder's owned rows, read with GETs.
  - `app.inflozo.com`: every LOCAL RUN.
  - `static.ghost.org` and Google Fonts: read only.
  - Not touched: Resend and Dodo — this story changes no email and no payment. GitHub Actions and the Vercel deployment
    run on the Dev push, and the Review reads them with the deployed walks.

**Executed at Review (2026-10-01), in the main session** — the clean committed walks on the deployed build
(`dpl_9vw7p3MpzSfwtccMq92jNivk6cRK`, READY, built from `2c37d986`, read through `VERCEL_TOKEN`), run one at a time
before any patch touched the tree. Keys by variable name only.

- **The owner's go**, asked in this session before the live-content walk: option 1, "Yes, short writes" — so `NO_429=1`.
- **CI on `2c37d986`** (`GITHUB_TOKEN`): `ci.yml` run 36874347970 — `check` (with `node tools/check-traces.mjs` among its
  steps), `rls` and `deploy` success; `matrix.yml` run 36874347850 success.
- **`node tools/probe/run-verify-editor.cjs`:** 0 FAIL, 674 PASS, users 13 → 13. Three `stall` notes, each retried once
  and the walk went on (`GET /projects/<id>` at 17:04:56Z, 17:10:46Z and 17:11:57Z). In Vercel's request rows
  (`npx vercel@latest logs … --json`) none has a row for its first attempt and each retry answered 200 about 45 s later —
  never reached Vercel, as DW-204's resolution found.
- **`node tools/probe/run-verify-pilots.cjs`:** 0 FAIL, 152 PASS.
- **`python3 tools/probe/run-verify-passkeys.py`:** exit 0, "all steps passed", no FAIL line; the passkeys flag put back
  to True and read back, users 13 after.
- **`node tools/probe/run-verify-controls.cjs`:** run 1 — 1 FAIL, 114 PASS (step 2, the first Review item); runs 2 and
  3 — 0 FAIL, 115 PASS. Planted with the picture held 3 s: HEAD's walk red at step 2; the fixed walk 0 FAIL, 115 PASS
  (its first planted run died on a 30 s `page.reload` and was no result).
- **`NO_429=1 node tools/probe/run-verify-live-content.cjs`:** 2 FAIL, 155 PASS — both on T3's subject read-back (the
  second Review item); the capped lines and their control PASS; T3's Subscription access and T1's Portal button and bar
  put back and read back. The fix's control ran as a LOCAL RUN on T3 that stops before any Ghost write: the save held
  5 s, the poll waited, both checks PASS, the fixture account deleted. A first plant that routed every request aborted
  the editor's lock beats — a broken control, discarded.
- **The Real-infra verifier, read-only:** signed out, `/canvas`, `/controls/frame` and `/style-guide/frame` each 303 to
  `/sign-in` (`/sign-in` 200 the control); `<html>` carries no class, the three latin files preloaded through the `Link`
  header, the deployed CSS's 39 `@font-face` rules over 16 files each 200 `font/woff2`, no Google address in the page or
  the CSS, and no `font-src` (so `default-src 'self'`); `run-verify-ghost-admin.py --check` all steps passed —
  `private`, `storage`, `vault` 406 PGRST106, `public` and `graphql_public` 404 PGRST205, and the Management API's
  `db_schema` `public,graphql_public` (a made-up token 401, the negative control); `seed-ghost.py --check` three 200s;
  T3's actions log names the owner for DW-299's three changes to the minute, and the recorder's four owned rows match
  the design on both majors (GETs only; a made-up key 401). No migration in the diff, so R-99 has nothing to compare.
- **The gates on the Review tree:** `pnpm check` exit 0; `node tools/check-traces.mjs` PASS on every route, the
  style-guide's among them; both recorders' `--self-check` exit 0; `python3 tools/doc-audit.py --check` twice.
- **Owed after the Review push:** the two repaired walks, clean, on the build that push deploys.
