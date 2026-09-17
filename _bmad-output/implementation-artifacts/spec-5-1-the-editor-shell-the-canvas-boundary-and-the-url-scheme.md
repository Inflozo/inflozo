---
title: 'Story 5.1 — The editor shell, the canvas boundary and the URL scheme'
type: 'feature'
created: '2026-09-17'
status: 'in-review'
baseline_commit: 'e14f58f3cdbd48b82584e2ce5b94fc20ec6b10ea'
owner_test: pending
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

You can now open a project: clicking its card on Projects takes you into the editor, at an address of its own that
the browser's Back button understands. The editor has the four parts of the S4a drawing — a slim bar across the top,
the list of sections on the left, the page itself in the middle and a settings panel on the right — and both side
panels fold away. The page in the middle is your site exactly as a visitor on a computer sees it, with no outlines,
labels or buttons on it; the hover buttons, the template switcher, saving and the rest of the bar arrive with the
stories after this one.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A project cannot be opened. The dashboard card links nowhere (`project-card.tsx:13`: "Opening a project is
Story 5.1's"), and no editor route exists. `EXPERIENCE.md` left two decisions to the architect: the URL scheme across
project, template and template surface, and which chrome lives inside the canvas iframe. As AD-21 is worded ("only the
floating mark toolbar and its pickers sit outside"), Story 5.2's clickable hover actions have nowhere they are allowed
to go. The spine's no-`'unsafe-eval'` half of the CSP is still unproven on a real canvas (§18c).

**Approach:** Add a project-scoped editor route. Its layout guards with a real 404, reads the project's template docs
through AD-27's one schema (`doc-schema.ts`, first written here) and holds one client editor shell drawn from S4a. The
canvas is the same-origin, script-free canvas document that `/pilots` and the render matrix already use. Each section
is rendered through one per-section function shared with `/pilots`, at the Desktop viewport, scaled to fit. The Design
Notes record the URL scheme and the inside/outside ruling. A deployed harness proves zero chrome at rest, faithful
sections, the scheme's statuses and Back, and a CSP session with no violation.

## Boundaries & Constraints

**Always:**
- The URL scheme and the canvas-boundary ruling in Design Notes are this story's deliverable. The code follows them,
  and one pure module (`apps/web/lib/editor.ts`) holds the scheme so `node --test` reaches it.
- One canvas document, one per-section render: the editor, `/pilots` and the render matrix serve
  `pilotsCanvasDocument()`'s bytes, and the editor and `/pilots` render every section through the same function.
- Every reader of `project_templates.doc` parses through `packages/section-runtime/src/doc-schema.ts` (AD-27). Nothing
  indexes into the raw jsonb. The schema is strict, so a field this reader does not know fails loudly instead of being
  silently dropped.
- Zero chrome at rest, by construction: every rule in the editor chrome stylesheet is keyed on a `data-inflozo-*`
  attribute, and no element carries one while nothing is hovered or selected.
- An S4a control whose behaviour belongs to a later story is **absent, not greyed** (the Shell's precedent, UX-DR3).
  Design Notes lists each one with the story that adds it.
- The window never scrolls. The canvas scrolls inside its own frame and each panel scrolls on its own, with the slim
  8px bars (`slimScrollbar`).
- R-98: the editor route's skeleton has the editor's own shape and sits below the layout's 404 guard.
- R-74: the shell matches S4a. The Layers header and both fold controls are extrapolated from D8 and from `/controls`'
  docked panel, never invented.

**Ask First:**
- Any dependency beyond adding `zod` to `packages/section-runtime`, at apps/web's pinned 4.4.3, which AD-27 names.
- Any edit under `packages/library/designs/`, and any render-matrix baseline change. The chrome stylesheet must leave
  every baseline as it is.
- Writing a project into the owner's own account (Question 1). **Ruled option 1 (owner, 2026-09-17):** one
  "Pilot sections" project, added once by the Deploy run. Anything more is still asked first.

**Never:**
- No writer of `project_templates` in the app (5.8 and 5.10 write first). No hover, selection, inline editing,
  reordering, visibility toggle, template-switcher UI, save indicator, device, mode, member-state or deploy behaviour.
- No script in the canvas document, no `'unsafe-eval'`, no `srcdoc`, and no `sandbox` that drops same-origin.
- No `redirect()` or `notFound()` below a Suspense boundary (R-98's second effect, DW-67).
- No colour or shadow literal in a `.ts`/`.tsx` under `apps/web` (`tokens.test.ts`). A new one is named in `DESIGN.md`
  first.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Open a project | signed in, own project, card clicked | `/projects/<id>` 200: the editor on Home, laid out as S4a | N/A |
| Another canvas | `/projects/<id>/post` · `page` · `tag` · `author` · `error` | the same editor on that canvas; the Layers header names it | N/A |
| Canvas with no doc | no `project_templates` row for that template | the site-wide sections alone, or a blank page when there are none; nothing is invented (synthesis is 5.5's) | N/A |
| Home by name | `/projects/<id>/home` | 308 to `/projects/<id>` | N/A |
| Reserved or unknown canvas | `index` · `private` · `paywall` · `cards` · `custom-x` · `nonsense` | real HTTP 404, the app's not-found | N/A |
| Not yours, not there, not a uuid | another user's project id · a random uuid · `abc` | the identical real 404 for all three, so a project's existence is never revealed | the uuid is checked before any query, so Postgres never sees `abc` (22P02) |
| Signed out | `/projects/<id>` · `/canvas` | 307 · 303 to `/sign-in` | N/A |
| Bad doc | a row failing `doc-schema`, naming a design not in `packages/library/designs/`, or placing a design on a template its `compileTarget` excludes | fails loudly through the app's error boundary; never a partly drawn canvas | the thrown message names the template key and the offending instance or field |
| Back | Projects → editor → `/post` → Back → Back | Home's canvas at `/projects/<id>`, then Projects | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/app/(authed)/project-card.tsx` — `THE CARD IS NOT A LINK` (:13-14). It becomes the
  way in, and `ProjectMenu` stays pressable.
- `apps/web/app/(app)/app/(authed)/layout.tsx:26-59` — the sign-in guard, the `/restore` door and `<Shell>`. The editor
  sits under it, so the guard and the door still apply.
- `apps/web/components/shell/shell.tsx` — already branches per path (`BARS[path]` :253, through `stripApp`) and owns the
  `<main>` (:403). On an editor path it draws that `<main>` and nothing else.
- `apps/web/app/(app)/app/(authed)/not-found.tsx` — where every editor `notFound()` lands. It carries a Link to `/`, so
  it still works with the Shell stepped aside.
- `apps/web/app/(app)/app/(authed)/pilots/review.tsx` — the render to extract:
  - `paint()` + `shown()` (~:105-160): target, `templateContext`, rows for the stored Order and limit, assets, icons,
    member, visibility, `innerHTML`, `js-enabled`.
  - the fit (`scale = min(1, pane/width)`, `origin-top-left`, :220-262) and `src="pilots/frame"` (:256).
- `apps/web/app/(app)/app/(authed)/pilots/frame/route.ts` — the guard-first handler (303) serving
  `pilotsCanvasDocument()` and `?image=`.
- `apps/web/lib/pilots.ts`:
  - `pilot(id)` assembles and validates, and throws.
  - `pilotRows`, `pilotImage`.
  - `pilotsCanvasDocument()` (:90-100): style blocks `1-tokens` · `2-document` · `3-pilots`, no script.
  - Files are resolved from the module's own address, never `new URL(…, import.meta.url)`.
- `apps/web/next.config.ts` — `outputFileTracingIncludes` names, per route, the files read off disk. A route that reads
  designs without an entry throws ENOENT when deployed.
- `apps/web/app/(app)/app/(authed)/controls/review.tsx:177-223` — the docked 280px panel: "Collapse controls", the 44px
  "Show controls" rail, and focus moving between the two toggles. This is DW-114's pattern.
- `apps/web/components/kit/`:
  - `layers-row.tsx`: `LayersRow` always draws `DragGrip`, a name `<button>`, `Visibility` and a hover wash; `LayerThumb`
    is the 30×21 thumb.
  - `icons.tsx`: has `Panel` (D8's "Show layers"), no chevron-left.
  - `labels.tsx`: `PanelLabel` (S4a's "Page", 13/600/0.04em).
  - `loading.tsx`: `Skeleton`.
  - `greyed.ts`: `slimScrollbar`, `ring`.
- `apps/web/app/globals.css` + `ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` front matter — token names are twins, both
  ways (`apps/web/tokens.test.ts:70-86`). S4a's canvas ground `#EDEAE6` (:62) and page shadow
  `0 4px 16px rgba(28,27,26,.10)` (:63) have no token yet.
- `apps/web/csp.ts:72-91` · `apps/web/proxy.ts:54-81` — app policy: `script-src 'self' 'nonce-…' 'strict-dynamic'`,
  `frame-ancestors 'self'`, `'unsafe-eval'` only in dev. Route handlers carry it. This story does not change it.
  Deployed and read 2026-09-17: `/sign-in` answers exactly that, with `x-inflozo-policy: app-nonce`.
- `apps/web/routing.ts` — `isApp`/`stripApp`. `usePathname()` reads `/app/…` on localhost and the public path on the
  app host. A relative iframe `src` resolves differently at `/projects/<id>` and at `/projects/<id>/post`, so it has to
  be computed.
- `apps/web/app-routes.test.ts` (:136-147 no `<main>` in an `(authed)` page · :177-197 one catch-all · :207-218
  metadata) · `apps/web/busy.test.ts` (`NO_SKELETON` :123-173, the loading rules :175-258).
- `packages/section-runtime/src/controls.ts:30-37` — `ControlState {content, controls, darkOverrides, data}`: "an
  instance's slice, as the project doc stores it". `index.ts` exports `renderCanvas`, `defaultContent`, `withData`.
- `supabase/migrations/20260904120000_complete_schema.sql:216-272`:
  - `projects` has no doc column.
  - `project_templates (project_id, user_id, template_key, doc jsonb)`; the key check is at :252-254.
  - Owner RLS, plus `owns_project`.
- `packages/library/designs/*/*/design.json` `compileTarget`:
  - a1/1 Rail → `default.hbs`
  - a4/13 Latest Post → `home.hbs`
  - a17/1 Three Up → `home`/`index`/`tag`/`author`
  - a22/1 Inline Row → `home`/`page`/`post`
  - a24/1 Centred → `post.hbs`
- `tools/matrix/serve.mjs`, `cases.mjs` — serve `pilotsCanvasDocument()`. `tools/matrix/manifest.json` pins the runner,
  never the document's bytes.
- `tools/probe/run-verify-pilots.cjs` — the harness shape to copy:
  - keys through `env` only
  - a throwaway account via the Auth Admin API
  - refuses to start unless Vercel serves HEAD
  - axe with a positive control
  - cleanup in `finally`
- `node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js:145-160` — `allowsEval` probes `new Function("")`
  unless `jitless`. Its own comment says strict CSPs report the caught call as a `securitypolicyviolation`.
- Frames:
  - `S4 Editor.dc.html:28-133` (S4a) and `:293` (S4c's selected outline: 1.5px `#FF5941`)
  - `D8 Editor Below 1440.dc.html:64` and `:193-194` (the "Show layers" rail), `:372-373` (the Layers header)

## Tasks & Acceptance

**Execution:**
- [x] `packages/section-runtime/src/doc-schema.ts` (+ `doc-schema.test.ts`, export from `src/index.ts`, `zod` 4.4.3 in
  `package.json`) -- the one zod schema:
  - Shape: `{schemaVersion: 1, instances: [{instanceId, layerName, designId (/^a\d+\/\d+$/), content, controls, data,
    darkOverrides}]}`, strict at both levels.
  - The instance type is assignable to `ControlState`.
  - Tests: a valid doc parses; an unknown field, a missing field and a malformed `designId` each fail naming the path.
  - Why: AD-27's single definition. The stories that write `hidden`, `parkedControls`, `isMainFeed` and the rest add their
    rows here.
- [x] `apps/web/lib/editor.ts` (+ `apps/web/editor.test.ts`) -- the scheme as data:
  - The canvases this story opens, each with its template file and D5b label: `home` (no segment, Home), `post` (Post),
    `page` (Page), `tag` (Tag archive), `author` (Author archive), `error` (404).
  - `canvasPath(projectId, key?)`.
  - `canvasFromSegment(segment)` → the canvas key, or `null` for a reserved or unknown segment. `'home'` is a key, and
    the route answers it with the 308.
  - `isEditorPath(pathname)`, true for `/projects/<anything>` and below and false for `/projects`.
  - `canvasStack(site, own)`: every site-wide instance outside `a3/` first, then the canvas's own, then the `a3/`
    footers, each group in doc order.
  - Tests: every key round-trips; every reserved segment is refused; the stack order holds.
  - Why: the route, the Shell and the harness all read the scheme from here.
- [x] `apps/web/lib/canvas.ts` + `apps/web/app/(app)/app/(authed)/pilots/review.tsx` -- move `paint`/`shown`'s
  per-section render and the mount step (`innerHTML`, then `js-enabled` on every `[data-module]`) into one client-safe
  module (no `node:` imports). `/pilots` calls it and behaves exactly as before -- the editor and `/pilots` render one
  way.
- [x] `apps/web/lib/canvas-chrome.css` + `apps/web/lib/pilots.ts` + `apps/web/pilots.test.ts` -- the editor chrome
  stylesheet with one rule: `[data-inflozo-selected]{outline:1.5px solid #FF5941;outline-offset:-1.5px}` (S4c :293).
  - `pilotsCanvasDocument()` appends it as `<style data-order="4-editor">`, read the way `reference-tokens.css` is read.
  - Tests: every selector in the file carries `[data-inflozo-`; the document still carries no `<script`.
  - Why: AD-21's mechanism, and the control that makes "zero chrome at rest" a result rather than a vacuous pass.
- [x] `apps/web/app/(app)/app/(authed)/canvas/route.ts` (moved from `pilots/frame/route.ts`, which is deleted) +
  `pilots/review.tsx` + `apps/web/next.config.ts` -- the one canvas document route.
  - Both pages compute the iframe `src` as `<prefix>/canvas` (prefix `/app` when `isApp(usePathname())`) and map
    pictures to `canvas?image=`.
  - `outputFileTracingIncludes`: `/app/pilots/frame` becomes `/app/canvas`, and the editor routes get `PILOTS_FILES`
    plus `./lib/canvas-chrome.css`, which `/app/pilots` and `/app/canvas` get too.
  - Grep the repo for `pilots/frame` (harness, matrix comments, tests) and update every hit.
  - Why: one URL, so both pages emit byte-identical markup.
- [x] `apps/web/components/kit/layers-row.tsx` + `icons.tsx` -- Kit reuse, absent not greyed:
  - `LayersRow` takes `interactive` (default `true`, so `/kit` is unchanged). With `false` it draws only the thumb and
    the name as text: no grip, no button, no eye, no hover.
  - Add a `ChevronLeft` glyph from S4a :30's polyline.
- [x] `ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` front matter + `apps/web/app/globals.css` -- the two tokens,
  satisfying `tokens.test.ts` both ways:
  - `colors.canvas-ground: '#EDEAE6'` with `--color-canvas-ground`
  - `elevation.canvas-page: '0 4px 16px rgba(28,27,26,.10)'` with `--shadow-canvas-page`
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/layout.tsx` -- the guard, then the editor:
  - If `id` is not a uuid, or `projects` (`id, name`, through the session client) returns nothing, `notFound()` — before
    any Suspense.
  - Then `<Suspense fallback={<EditorSkeleton/>}>` around an async loader. The loader reads every `project_templates`
    row of the project, parses each through `doc-schema`, checks each canvas instance's `compileTarget` includes its
    template file, and assembles `pilot()` + `pilotRows()` for each design used.
  - The loader renders `<Editor>`.
  - `{children}` renders **outside and before** the Suspense. The pages draw nothing, and the `[template]` layout's
    `permanentRedirect()`/`notFound()` must run in the part of the response rendered before any Suspense boundary,
    before the first flush. Placed inside the boundary, they would stream as a 200 (DW-67, executed in Story 3.8).
    That placement *outside* keeps the real status is a claim about Next that nothing has run yet: the harness's
    step 6 reads the statuses.
  - The project read is `cache`d, so the pages' metadata reuses it.
  - Why: real 404s and 308s above the only boundary, and the docs read once per open.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/page.tsx` + `[template]/layout.tsx` + `[template]/page.tsx` -- the
  route shape.
  - Both pages render `null` and export `generateMetadata`: `{project} · {label} — Inflozo`, noindex.
  - `[template]/layout.tsx` sends `home` to the project URL with `permanentRedirect`, and `notFound()`s every segment
    `canvasFromSegment` refuses.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` + `editor-skeleton.tsx` -- the client shell, from S4a,
  in a `flex h-dvh flex-col overflow-hidden` root:
  - **Top bar:** a 48px `<header>` with a bottom rule, the back link (`ChevronLeft`, `aria-label="Back to dashboard"`,
    href `/`) and the project name (13/600, plain text).
  - **Layers:** `<aside aria-label="Layers">`, 240px border-box, right rule. Header "Layers" plus mono
    "THIS PAGE · {LABEL}" (D8e) and a "Collapse layers" button (`Panel`). Rows in `canvasStack` order show the thumb and
    `layerName` and are not interactive. Folded, it is a 44px rail with one "Show layers" button.
  - **Canvas:** `<section aria-label="Canvas">` on the canvas ground (the Shell's `<main>` wraps the whole editor).
    - The page card is 24px from the top, 28px from each side and flush with the bottom, with a 6px top radius and the
      page shadow; it is centred when wider than 1440.
    - The card holds the iframe at 1440 CSS px wide and card-height ÷ scale tall, with `transform: scale(min(1,
      card/1440))` from the top left, re-measured by `ResizeObserver`.
  - **Controls:** `<aside aria-label="Page settings">`, 280px border-box, left rule, 16px padding, `PanelLabel` "Page" and a
    "Collapse controls" button. Folded, it is a 44px "Show controls" rail.
  - **Folding:** focus moves to the counterpart toggle. Fold state lives in this layout-held component, so 5.5's
    switcher, a soft navigation, will keep it. A typed address is a document load and starts unfolded.
  - **Painting:**
    - The active canvas comes from `usePathname()` through `lib/editor.ts`.
    - Each paint renders `canvasStack` through `lib/canvas.ts` with that canvas's template file (site-wide:
      `default.hbs`), member `anonymous`, visibility `everyone`, `data-mode="light"`.
  - **Skeleton:** the same regions with `Skeleton` blocks in the card, `aria-hidden` and an `sr-only` sentence, no
    spinner.
  - Why: FR-D1's layout.
- [x] `apps/web/components/shell/shell.tsx` -- when `isEditorPath(stripApp(here))`, return
  `<main className="flex min-h-dvh flex-col">{children}</main>` before any chrome.
  - Comment it: the editor owns the window.
  - The Shell's `<main>` is still the only one (the `app-routes.test.ts` rule stands), and an editor-path 404 lands
    inside it.
- [x] `apps/web/app/(app)/app/(authed)/project-card.tsx` -- the card links to `canvasPath(project.id)`
  through a link stretched over the card, with `ProjectMenu` stacked above it and still pressable. Replace the
  "not a link" comment.
- [x] `apps/web/busy.test.ts` -- `NO_SKELETON` gets `projects/[id]` and `projects/[id]/[template]`, with the reason:
  both pages render nothing, and the editor's skeleton is its layout's Suspense fallback, below the 404 guard. The
  contract then says what is true.
- [x] `tools/probe/seed-editor-project.mjs` -- `seed({ email, name = 'Pilot sections' })` builds the fixture for the
  harness, and for the owner's own account at Deploy (Question 1, ruled option 1):
  - Creates one project, with the slug and style pack made the way `createProject` makes them
    (`projects/actions.ts:117,143-148`).
  - Inserts `project_templates` rows: `site` [a1/1 "Header — Rail"], `home` [a4/13 "Hero — Latest Post",
    a17/1 "Post Grid — Three Up", a22/1 "Newsletter — Inline Row"], `post` [a24/1 "Post Header — Centred"].
  - Every instance has `defaultContent(contentSchema)` and empty `controls`/`data`/`darkOverrides`, and every doc is
    parsed through `doc-schema` before insert.
  - The CLI refuses to run without `--email` (never `--help`-triggered), prints the project URL and prints no key.
  - If the account already holds a project with that name, it prints that project's URL and writes nothing, so a
    repeated Deploy never adds a second one.
- [x] `tools/probe/run-verify-editor.cjs` -- the deployed walk under Verification, in `run-verify-pilots.cjs`' shape.
- [x] `tools/doc-audit.py` -- catalogue rows for the two new `tools/probe/` files, then `--generate`.
- [x] Propagation (standing rules 3 and 7) -- carry what this story settled to the documents that own it:
  - `ARCHITECTURE-SPINE.md` AD-21: the canvas-boundary ruling, dated and citing this spec.
  - The spine's CSP row: `connect-src` is the static `'self' https:` that Story 3.2 set (`epic-3-context.md`), not
    "composed per session". The no-`'unsafe-eval'` half is recorded as verified only after the harness passes on the
    deployed app (Verification, last step).
  - `EXPERIENCE.md` § Editor shell: the "Open for the architect" paragraph states both answers and points here.
  - `epic-5-context.md`: sub-bullets under the canvas-boundary and URL bullets.
  - `deferred-work.md`: DW-114 done (both panels fold); DW-167's owner becomes Story 5.2 (5.1 mounts no section panel);
    DW-117 stays open, noting this harness executes the 303 on `/canvas`.
  - End with `git grep -n "pilots/frame\|NOT A LINK" -- apps packages tools docs`, which must find no live reference
    (`git grep`, so a stale `.next/` source map is not read as drift). Specs and the deferred-work ledger keep their
    history.

### Review Findings

Review, 2026-09-17, on `c60776c4`: five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor,
Real-infra verifier) and none failed. The real-infra layer ran `run-verify-editor.cjs` against `https://app.inflozo.com`
(`dpl_6TrZZpMamDMPzbGJAQan8Vf9i5Ze`, built from `c60776c4`) and production Supabase: every step PASS (59 PASS, 0 FAIL),
the CSP control held in both documents, users 9 → 9, and `project_templates` read through `SUPABASE_DB_POOLER_URL`
carries every column and the key check the seed writes. No acceptance criterion or boundary is violated; no question
is the owner's. Patches, all applied:

- [x] [Review][Patch] `docSchema` refuses a duplicate `instanceId` (the editor keys rows on it, 5.8's journal will too), with a test [`packages/section-runtime/src/doc-schema.ts`]
- [x] [Review][Patch] `jitless` has a regression guard in `pnpm check`: `Function` trapped while the runtime is imported, with the jitless-off control [`apps/web/doc-schema-jitless.test.ts`]
- [x] [Review][Patch] The render matrix calls `shownRows()` instead of copying it, so a limit or order change reaches the baselines by construction [`tools/matrix/cases.mjs`]
- [x] [Review][Patch] The harness derives the stack, the design list and the row count from the seed's exported `TEMPLATES`; asserts B's project is a uuid before the identical-404 check; refuses a failed `generate_link`; names a missing canvas frame; and survives an unreadable user list in `finally` [`tools/probe/run-verify-editor.cjs`]
- [x] [Review][Patch] Step 6b: a `tag` row placing a post-only design shows the error boundary and no canvas, then is removed — the matrix's "Bad doc" row, unexercised before [`tools/probe/run-verify-editor.cjs`]
- [x] [Review][Patch] The seed derives the slug-attempt count, guards a non-list answer, reports a failed rollback honestly and takes `APP_ORIGIN` for a local run [`tools/probe/seed-editor-project.mjs`]
- [x] [Review][Patch] `scale` guards a card measured at 0 (Infinity in the iframe height); `paint()`'s early return is commented as intended [`apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx`]
- [x] [Review][Patch] `fileOf` notes that `paywall` and `cards` rows will throw for the whole editor until their story extends it [`apps/web/app/(app)/app/(authed)/projects/[id]/read.ts`]
- [x] [Review][Patch] `LayersRow interactive={false}` documents that `selected` and `shown` are ignored [`apps/web/components/kit/layers-row.tsx`]
- [x] [Review][Patch] AD-21's rule sentence no longer says every outline is `::after`; the tree's `proxy.ts` comment no longer claims a session-aware CSP [`ARCHITECTURE-SPINE.md`]
- [x] [Review][Patch] Wording: `docs/render-matrix.md`'s render sentence, `pilots.test.ts`'s trace test title, `cases.mjs`'s "frame route", this spec's card path and the propagation grep (`git grep`, so a stale `.next/` map is not drift), DW-174's `health-rule.ts` guess (server-only, checked)

Dismissed as noise or as the spec's own decision: an empty-state sentence for a project with no rows (the matrix's
"Canvas with no doc" row says blank, and 5.5 synthesises); `layerName` `min(1)` (5.4 renames, a blank mid-rename must
parse); the 308 dropping a query string (nothing of the editor's is ever in the URL); `/controls`' own `frame?image=`
(its own frame by design); external `pilots/frame` links (an internal route with no external user); the Layers header
stacking (recorded in the change log); the Deploy seed and screenshot location (Deploy's).

**Acceptance Criteria:**
- Given a signed-in owner of a project, when they click its card on Projects, then `/projects/<id>` answers 200 with a
  slim top bar, a collapsible left Layers panel, a centre canvas and a right Controls sidebar, and none of the
  dashboard's sidebar, phone bar or drawer.
- Given a project whose docs are still loading, when its editor route streams, then the editor's own skeleton (bar,
  both panels, skeleton blocks in the page card, an `sr-only` sentence) is what arrives first, never the dashboard's
  cards (R-98).
- Given the seeded project at a 1440×900 window, when nothing is hovered or selected, then the shell **matches frame
  S4a** (`S4 Editor.dc.html` S4a) region by region: 48px bar and its rule, 240px Layers, the canvas ground and page
  card at S4a's offsets, radius and shadow, 280px Controls with 16px padding, paper panels, Inter at S4a's sizes.
  Every S4a control not built here is absent, as Design Notes lists.
- Given the same state, when the canvas document is read, then no element carries a `data-inflozo-*` attribute. And
  when `data-inflozo-selected` is set on a section root, then that root's computed outline changes, which proves the
  stylesheet is live and the rest state is a real result.
- Given the seeded Home and Post canvases, when each section root is compared with `/pilots`' render of the same
  design at Desktop · Light · Signed out · Everyone · First, then their outerHTML is equal. And when the render matrix
  gate runs, then it is green with no baseline written.
- Given the deployed editor and its canvas document, when their responses are read, then both carry the app nonce
  policy with `frame-ancestors 'self'` and no `'unsafe-eval'`. When a scripted session runs (open, fold and restore
  both panels, open `/post`, Back), then it records zero `securitypolicyviolation` events in either document. When
  `new Function('')` runs in either document, then it throws `EvalError`, which is the control.
- Given the editor, when Layers or Controls is folded, then it becomes a 44px rail with its one Show button, the page
  card widens and re-scales, and focus lands on the counterpart toggle.
- Given any editor state, when the wheel turns over the canvas, then the canvas document scrolls and the window never
  does.
- Given the URL scheme table in Design Notes, when each row is requested on the deployed app, then its status,
  destination and Back behaviour hold.
- Given the editor at 1440, when axe-core runs at WCAG 2.1 AA after its positive control, then it reports zero
  violations.

## Spec Change Log

- **Dev, 2026-09-17 — zod's JIT probe runs at CONSTRUCTION, not on first parse (executed; supersedes the Design Note's
  "should never reach the browser").** A local production build under the harness recorded a `script-src` eval violation
  on every editor load from zod's core chunk: `$ZodObject` reads `allowsEval.value` when a schema is built
  (`zod/v4/core/schemas.js:970-972`), and `doc-schema.ts` is in the client bundle through the runtime's index. The Design
  Note's remedy was applied: `z.config({ jitless: true })` before the schemas in `doc-schema.ts`; the session then recorded
  zero. Projects has the same violation from `lib/style-pack.ts` (reached through the New Project Sheet) — outside this
  story, recorded as DW-174 and in the spine's CSP row.
- **Dev, 2026-09-17 — the harness's CSP control, rebuilt as step 5 allowed.** `new Function('')` inside a Playwright
  evaluate — even from a nonce-carrying script appended there — answered `allowed` under the policy that refused zod's
  probe: V8 lets code generate from strings during a DevTools evaluation. The nonce script now runs the test on a timer,
  and the control reads `EvalError` in both documents; the recorder sees both refusals, so its zero is a result.
- **Dev, 2026-09-17 — three harness facts, executed.** Playwright's screenshot leaves `style=""` on a focusable input, so
  the section roots are read before any screenshot (Inline Row differed by exactly that). Whether the skeleton streams is
  a race between the docs read and the first flush — a local run saw it both ways — so step 9 opens up to five times and
  needs the skeleton ahead of the editor in one and the dashboard's cards in none. On localhost the app's links and
  redirects carry no `/app` prefix, so `APP_ORIGIN`/`APP_PREFIX` runs re-enter under it and are never a deployed result.
- **Dev, 2026-09-17 — routine calls.** The Layers header puts D8e's mono "THIS PAGE · …" under "Layers" rather than beside
  it: "THIS PAGE · AUTHOR ARCHIVE" and the fold button do not fit beside the title in 240. `outputFileTracingIncludes`
  names the editor routes `/app/projects/**`, because the keys are picomatch globs (`collect-build-traces.js`) where
  `[id]` is a character class. The Code Map's `(dashboard)/project-card.tsx` is `(authed)/project-card.tsx`.

## Design Notes

### The URL scheme (UX-DR22 — settled here)

| Address | Opens | Back from it |
|---|---|---|
| `/projects/<project uuid>` | the editor on Home | wherever the user came from |
| `/projects/<uuid>/post` · `page` · `tag` · `author` · `error` | that template's canvas (`error` is the 404 page) | the canvas before it, then out |
| `/projects/<uuid>/home` | 308 → `/projects/<uuid>` | — |
| `index` (5.5 decides whether it has a canvas) · `private` (5.5) · `custom-<slug>` for custom and membership templates, from `custom:custom-<slug>.hbs` (5.5) · `paywall` (5.20) · `cards` (7.13) | reserved: 404 until their story opens them | — |

- **The address names the project and the canvas, and nothing else.** Selection, hover, device, light/dark, View as,
  Preview, page 2, panel folds and open sheets are modes. They are never in the URL and never add a history entry.
- **Changing canvas is navigation** ("navigation, not a mode", EXPERIENCE.md), so it is a push, and Back walks the
  canvases visited and then leaves.
  - It is a soft navigation inside the `[id]` layout, so the editor — its folds now, its journal and lock later (5.8,
    5.17) — stays mounted.
  - Leaving `/projects/<id>` unmounts it, which is where 5.8's flush hooks.
- **A canvas that stops existing while open is replaced, not pushed** (7.16's "switches to Home with a notice"), so
  Back never lands on a dead address. A dead address loaded fresh is a 404.
- **The uuid, never `slug`.** The slug is the emitted theme's identity and freezes once bound, names change, and a
  uuid tells a stranger nothing. Another user's project and a missing one answer the same 404.
- **Other project screens** (Routes Manager, Theme Settings, …) take static segments. A canvas key can never collide
  with one, because custom canvases always start `custom-`.

### The canvas boundary (AD-21 — amended here)

**Inside the canvas document:** the site, meaning its site-wide sections, the canvas's own sections, and 5.21's two
inert Ghost shims. It also holds chrome that belongs to a section's own box and never takes a press: outlines, the
name tag, the insertion hairline, a behaviour's PAUSED chip, and the empty icon slot's dashed placeholder. All of it is
CSS keyed on `data-inflozo-*`: it adds no node and is never serialised.

**Outside, in the editor document:** everything that can be pressed or focused and is not the site's own content:
- the top bar and its menus
- Layers
- the Controls sidebar
- the canvas container and its skip link (5.9)
- the fit chip (5.7)
- the content-source pill (5.13)
- the reading-along bar (5.17)
- every sheet
- **the hover quick actions (◀ ▶, Duplicate, Delete, the drag handle) and the "+"**, as one floating bar anchored to
  the hovered section. This is the mechanism the mark toolbar and its pickers already use: Floating UI with the
  in-frame element as `contextElement`, and a positioning loop only while the bar is shown.

**Why:** a pseudo-element cannot be a button or take focus (UX-DR18, 5.9). A real button injected into the site would
sit inside the markup §7.3 compares node by node. In one sentence: *inside is the site and what is painted on it;
outside is what you press.*

### Choices made here, one line each

- **Desktop is 1440 CSS px, scaled to fit, filling the card's height.** That is what `/pilots` shows and what B11a's
  Desktop is. The fit chip, Tablet and Mobile are 5.7's. S4a's `max-width:864px` is 1440 − 240 − 280 − 56 at that
  window: it is the fit, not a cap.
- **The selected outline is the root's own `outline`**, not a positioned `::after` box, so a sticky or fixed root keeps
  its positioning. `::after` stays for chrome that draws content (5.2's name tag).
- **Absent in 5.1, by story:**
  - "Saved" and Undo/Redo — 5.8
  - the Template pill and switcher — 5.5
  - View as — 5.14
  - the dark-preview sun — 5.6
  - the device switch — 5.7
  - Ship it ▾ — 7.18
  - the name's rename underline — no story owns it yet
  - Layers' grip and eye — 5.4
  - "+ Add section" — 5.10
  - the rail's thumbnails — 5.2 and 5.4
  - the Page panel's Style Pack card — 6.3
  - its Dark mode row — 5.6 (D6a)
  - S4a's posts-per-page note is never built: FR-Q1 reversed it.
- **DW-114 is built, the `/controls` way.** The owner asked for the settings panel to fold (Story 4.5's test,
  finding 3), and S4a draws no Controls fold at 1440. The rail mirrors D8's Layers rail, as `/controls` already does.
- **Layers is a flat list in canvas order, as S4a draws it.** B7's pinned Site-wide card is 5.4's.
- **The pages render nothing and the layout holds the editor.** A layout survives a change of its child segment and a
  page does not. The active canvas is read from the pathname through `lib/editor.ts`.
- **zod's JIT probe is the first suspect** if the harness records a violation. `allowsEval` (read in zod's source,
  above) runs `new Function("")` on a schema's first browser-side parse. The remedy is
  `z.config({ jitless: true })` where the schema is defined. The layout parses on the server, so the probe should never
  reach the browser; the harness decides.
- **DW-117 stays open.** `/canvas` keeps the same guard shape, `next/server` still cannot load under `node --test`, and
  this harness executes the 303.

## Verification

**Commands:**
- `pnpm check` (Node 24 on PATH) -- expected: lint, typecheck and every package test green, including
  `doc-schema.test.ts`, `editor.test.ts`, `pilots.test.ts`, `tokens.test.ts`, `app-routes.test.ts`, `busy.test.ts`
- `bash tools/matrix/run-matrix-gate.sh` -- expected: green, with no baseline written. The chrome stylesheet changes no
  pixel at rest in any case.
- `python3 tools/doc-audit.py --check`, run twice -- expected: exit 0
- `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs) node tools/probe/run-verify-editor.cjs`,
  after CI deploys HEAD -- expected: every step PASS. It refuses to start unless Vercel serves HEAD.

**What the harness hits** — `https://app.inflozo.com`, and production Supabase through the Auth Admin API. It uses two
throwaway accounts, both deleted in `finally`, with the user count read before and after.
1. Seed account A with `seed-editor-project.mjs` and give account B one bare project; sign A in.
2. Projects → the seeded card → `/projects/<id>` 200. Check the four landmarks and S4a's measured sizes at 1440×900,
   and save screenshots for the owner's comparison.
3. Rest: zero `data-inflozo-*` in the canvas document. Control: `data-inflozo-selected` on a root changes its computed
   outline.
4. Faithful: each section root's outerHTML equals `/pilots`' for the same design at Desktop · Light · Signed out ·
   Everyone · First.
5. CSP:
   - The headers of `/projects/<id>` and `/canvas` carry the app nonce policy, `frame-ancestors 'self'` and no
     `'unsafe-eval'`.
   - An init script in every frame records `securitypolicyviolation`, and the acceptance session records none.
   - `new Function('')` throws `EvalError` in both documents. This is the control, and unproven: if Playwright's
     evaluation turns out to be exempt from the page's policy, the control has failed. Rebuild it (for example, a
     script carrying the page's own nonce) before any zero-violation result counts.
   - The fold buttons work, which proves the bundle ran under the nonce.
6. Scheme:
   - `/post`, `/page`, `/tag`, `/author`, `/error` answer 200, and `/home` answers 308.
   - `index`, `private`, `paywall`, `cards`, `custom-x`, `nonsense` answer 404.
   - B's project id, a random uuid and `abc` answer identical 404s.
   - Signed out: `/projects/<id>` 307 and `/canvas` 303 to `/sign-in`.
   - Projects → editor → `/post` → Back lands on `/projects/<id>` showing Home's sections; Back again lands on Projects.
7. Scroll: the window's scroll height equals its height, and a wheel over the canvas moves the canvas document's
   scroll.
8. axe-core, WCAG 2.1 AA, on the editor at 1440: zero violations, after the positive control.
9. Skeleton: the raw streamed HTML of `/projects/<id>` carries the skeleton's `sr-only` sentence ahead of the editor.

**Result, Dev (2026-09-17):** `pnpm check` green (Node 24); `bash tools/matrix/run-matrix-gate.sh` green, no baseline
written; `python3 tools/doc-audit.py --check` PASS twice. Pushed `d427e190`: CI run 35201397709 (`rls`, `check`,
`deploy` success) and Render matrix run 35201397526 success; Vercel `dpl_Dshfdk2pfh4gmvyZCoxkq6tVB5QX` READY for
`d427e190`. `run-verify-editor.cjs` against `https://app.inflozo.com` and production Supabase (two throwaway accounts,
user count 9 → 9): every step PASS, 0 FAIL. Its one note is DW-174 — Projects (`/`) reports zod's eval probe while
`/pilots` is read; the editor's session recorded none. The no-`'unsafe-eval'` proof is in the spine's CSP row.

**Result, Review (2026-09-17):** the five review layers on `c60776c4` (Real-infra: `dpl_6TrZZpMamDMPzbGJAQan8Vf9i5Ze`,
59 PASS, 0 FAIL, users 9 → 9). Patches pushed as `52be51cf`: `pnpm check` green (Node 24, the jitless guard and the
duplicate-instanceId test included); `bash tools/matrix/run-matrix-gate.sh` green with the matrix now calling
`shownRows()`, no baseline written; doc gate PASS twice; CI and Render matrix runs for `52be51cf` success. The patched
`run-verify-editor.cjs` against `https://app.inflozo.com` (`dpl_8eidg8GaVgm2HiQpKsXMNC4sewXQ`, built from `52be51cf`)
and production Supabase: 62 PASS, 0 FAIL — step 6b's bad `tag` row showed the error boundary with no canvas and Home
painted again once it was removed; users 9 → 9. The one note is still DW-174 on `/`. The story stays in review: Deploy
and the owner's test follow (R-80).

**After the harness passes:** record the no-`'unsafe-eval'` proof in the spine's CSP row, with the date and the
harness's name. §18c said "it stays unproven until E5 has a canvas to test", and this closes it.

**At Deploy — Question 1, ruled option 1 (owner, 2026-09-17):** once the harness has passed on the deployed commit,
run the seed exactly once for the owner's own account:
- `env $(grep -E '^SUPABASE_(URL|SECRET_KEY)=' tools/probe/.env | xargs) node tools/probe/seed-editor-project.mjs --email <the owner's sign-in address>`
- The address comes from the owner in that session. It goes on the command line only, never into a committed file
  or any output recorded here.
- Expected: one "Pilot sections" project with three `project_templates` rows (`site`, `home`, `post`). The printed URL
  replaces `<id>` in the owner's manual test.

**Result, Deploy (2026-09-17, HEAD `e8745189`):**
- **What shipped:** app code and tooling only. `git diff e14f58f3 e8745189 -- supabase/` is empty, so there is no
  migration, R-99 has nothing to apply, and RLS-TEST.sql is not owed. `git diff 52be51cf e8745189 -- apps packages tools
  supabase` is empty too: HEAD is the reviewed code plus the Review commit's spec and board.
- **GitHub Actions** (`GITHUB_TOKEN`): CI run 35204674435 for `e8745189` — `rls`, `check` and `deploy` all success.
  Render matrix run 35204674253: success.
- **Deployment:** `dpl_2r2ERRnFejqV3F5H4dxejKH7gc4y`, production, READY, built from `e8745189`, aliased to
  `app.inflozo.com`, `inflozo.com` and `www.inflozo.com` (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`).
- **The deployed harness:** `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs)
  node tools/probe/run-verify-editor.cjs`, against `https://app.inflozo.com` and production Supabase. Five runs, **0 FAIL
  in every one**, and none finished: each stopped on a 30-second timeout where production sent no answer at all
  (DW-175). Run 3 reached **61 PASS, covering steps 1 to 8** (step 6b included), and stopped signing in for step 9.
  Step 9 then ran on its own as a scratch copy of the harness's code, with a retry around the stall only:
  **PASS**. Of two opens, the first rendered the editor straight into the shell and the second streamed the skeleton's
  sentence at 2957, ahead of the canvas at 109354. Neither carried the dashboard's cards. The only note, as before,
  is DW-174 on `/`. Every run deleted its throwaway accounts; afterwards: 9 users, 0 leftover `editor-harness-*`
  accounts.
- **DW-175, found here:** about one request in a hundred from this machine to `app.inflozo.com` connects, completes
  TLS and never gets a first byte. The probes that measured it are in the ledger entry: signed-out and signed-in pages
  alike, Supabase direct never, and 600 later interleaved requests across the previous and current deployments with
  none. The route that stalls most in the probes (`/sign-in`) predates this story. It is not a Story 5.1 regression,
  and it does not block Deploy.
- **The seed, once** (Question 1): `env $(grep -E '^SUPABASE_(URL|SECRET_KEY)=' tools/probe/.env | xargs) node
  tools/probe/seed-editor-project.mjs --email <the owner's sign-in address>`. The address is not recorded here;
  beforehand it matched exactly one production account, which held 2 projects and no "Pilot sections". Printed
  `seeded: https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51`. Read back through the service key:
  one project named "Pilot sections" (slug `pilot-sections`), the account now at 3 projects, and `project_templates`
  rows `site` [a1/1], `home` [a4/13, a17/1, a22/1] and `post` [a24/1]. Signed out, that address answers 307 to
  `/sign-in`.
- **The Deploy commit's own CI (`b96452f5`, documentation only):** GitHub refused to start the runs, so they did not
  fail on our code. CI run 35209869404 has `rls` and `check` failed with zero steps and no runner (finished 2 and
  13 seconds after starting), so `deploy` was skipped. Render matrix run 35209869288 is the same. Every run up to
  `e8745189` at 09:21 UTC succeeded. `app.inflozo.com` still serves `dpl_2r2ERRnFejqV3F5H4dxejKH7gc4y`, the deployment
  verified above, so the owner's test is unaffected. GitHub's reason cannot be read with `GITHUB_TOKEN`: annotations,
  the check-run output and GraphQL all answer 403 "Resource not accessible by personal access token", and
  githubstatus.com showed Actions operational. Question 2.

## Owner's manual test

You ruled Question 1 option 1, so the Deploy run added "Pilot sections" to your own account on 2026-09-17. The
addresses below are that project's, checked on the deployment built from `e8745189`. Sign in as you normally do. The project is an ordinary one: rename or
delete it whenever you like, but Stories 5.2 to 5.9 reuse it for their tests.

If a page stays blank and never finishes loading, refresh once and tell us it happened. About one request in a
hundred did that during Deploy, on old pages as well as new ones (DW-175).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/` | Projects | Click the **Pilot sections** card anywhere except its ⋯ menu. | — | The editor opens, and the address becomes `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51`. |
| 2 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the whole screen, with `S4 Editor.dc.html` S4a open beside it. | — | **Top:** a slim bar with ‹ and "Pilot sections". **Left:** "Layers · THIS PAGE · HOME" above four rows — Header — Rail, Hero — Latest Post, Post Grid — Three Up, Newsletter — Inline Row. **Middle:** a page card on a warm grey ground, showing the Rail header, Latest Post ("The personal page never disappeared. It went quiet."), Three Up's cards and Inline Row's signup, as a visitor on a computer sees them. **Right:** a panel headed PAGE. The Projects sidebar is gone. |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Canvas | Move the mouse over the page, then scroll inside it with the wheel. | — | Nothing appears on the page: no outline, label or button (those arrive with Story 5.2). The page scrolls inside its card, and the bar and both panels stay still. |
| 4 | `https://app.inflozo.com/pilots`, in a second tab | Pilots review | Set each pilot to Desktop · Light · Signed out and compare it with the same section in the editor. | — | The same section. The editor shows it smaller, because it fits a whole desktop page into the card. |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51`, the editor tab | Layers | Press the fold button at the top of Layers, then **Show layers**. | — | Layers folds to a thin strip with one button and the page card grows; then it comes back. |
| 6 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Page panel | Press the fold button beside PAGE, then **Show controls**. | — | The same thing, on the right. |
| 7 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/post`: add `/post` to the end of the address and press Enter | Editor, Post | Look at the canvas. | — | "THIS PAGE · POST", the Rail header, then the top of the article "The four hundred domains that refuse to move". |
| 8 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/post` | Browser | Press the browser's Back button, then Back again. | — | First Home's canvas again, then Projects. |
| 9 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/tag`: click the **Pilot sections** card again, then add `/tag` to the end of the address and press Enter | Editor, Tag archive | Look at the canvas. | — | Only the Rail header. The Tag archive has no sections yet; its starting sections arrive with Story 5.5. |
| 10 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/nonsense`: change the end of the address to `/nonsense` | — | Press Enter. | — | "Page not found", with a button back to Projects. |
| 11 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Top bar and panels | Look for what S4a draws that is not here. | — | Absent until its story: the template switcher (5.5), View as (5.14), "Saved" and Undo/Redo (5.8), the sun (5.6), the device switch (5.7), Ship it (7.18), Layers' grip, eye and "+ Add section" (5.4, 5.10), the Style Pack card (6.3) and Dark mode (5.6). Say whether any of these absences matters to you. |

## Questions for the owner

### Question 1 — may the Deploy run add a sample project to your account?

**Plain English:** No story before 5.10 (the Section Picker) can put sections on a page, and a new project's pages get
their starting sections only in Story 5.5. So a project opened in this story shows an empty page. To let you see the
editor showing a real site, and check it against the drawing, the Deploy run can add one project. Its Home page would
already hold the pilot sections you reviewed on `/pilots`, and its Post page the article header. Development can start
before you answer; only the Deploy run needs it.

**Example:** you open Projects and see a new card, "Pilot sections", beside your own. You click it, and the editor
shows the Rail header, Latest Post, Three Up and Inline Row stacked like a real home page.

1. **Add "Pilot sections" to your own account** when this story deploys. It is an ordinary project: rename or delete it
   any time. It counts toward your project limit like any other. Stories 5.2 to 5.9 reuse it for their tests, until
   you can add sections yourself. **(RECOMMENDED)**
2. **Put it in a separate test account** on an address you choose, for example your usual address with `+editor`
   before the `@`, so the sign-in email still reaches your normal inbox. Your own account stays untouched, but every
   editor test starts by signing in as that account.
3. **No sample project.** You test the editor on your own projects, which show empty pages until Story 5.5, and the
   check that the canvas matches `/pilots` is done by the automated harness alone.

**Ruled: option 1 (owner, 2026-09-17).** The Deploy run adds one "Pilot sections" project to the owner's own account
with `tools/probe/seed-editor-project.mjs`, after the harness passes, and never a second (Verification, At Deploy).
Stories 5.2 to 5.9 run their owner tests on it until Story 5.10 lets him add sections himself.

### Question 2 — GitHub stopped running our checks. Can you look at why?

**Plain English:** Every push makes GitHub run our checks and, when they pass, put the new version live. At 10:19 UTC
today (3:49 pm your time), GitHub refused to start them for the Deploy commit. Each check was stopped within seconds,
before GitHub gave it a machine, so none of our code ran. The live site is safe: it still shows the version tested
above, and your test runs on it. But until this is fixed nothing new reaches the site, so Story 5.2 can be built and
never deployed. GitHub shows its reason only to the account owner; our read-only key is told "not accessible".

**Example:** open `https://github.com/Inflozo/inflozo/actions/runs/35209869404`. Beside a red check, GitHub writes one
sentence, for example "The job was not started because recent account payments have failed or your spending limit
needs to be increased." That is a guess at what yours says, not a reading of it; the key cannot see it.

1. **Read the sentence and fix it where it points.** If it names billing or a spending limit, open the Inflozo
   organisation's Settings → Billing, and raise the limit or settle the payment. Then press **Re-run all jobs** on that
   page. **(RECOMMENDED)**
2. **Wait for next month's allowance, if that is what it names.** It costs nothing, but nothing goes live until then:
   Epic 5's stories stop at Deploy.
3. **The sentence says something else.** Paste it here and I will write the options for that.

**Ruled:** _(awaiting the owner)_
