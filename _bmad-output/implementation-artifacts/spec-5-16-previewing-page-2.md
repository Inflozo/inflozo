---
title: 'Story 5.16 — Previewing page 2'
type: 'feature'
created: '2026-09-22'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
baseline_commit: 'af70bf0bd3757760c86264ce857f76ae4aa6ef80'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Where a page lists your posts in pages — Home, a Tag page or an Author page — you can now look at its page 2: select
the post grid that page lists its posts with, and at the foot of its settings switch **Preview page** from **1** to
**2**. The canvas then shows what a visitor gets at `/page/2/`: the next twelve posts, the grid's pager reading
**"← Newer posts · 2 / 5 · Older posts →"**, the header's Home link no longer marked as the page you are on, and on
Home only the part of your page from the post grid down, because that is what Ghost serves there, all under a dark
**Page 2 · Back to page 1** pill at the top. While you are there you change the post grid's own settings and watch page
2 update, a Tag or Author page with too few posts for a page 2 says so instead of inventing one, and there is
deliberately no keyboard shortcut.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-D21 is unbuilt, and nothing on the canvas can show a pager's page-2 state.

- **The editor paints every canvas at page 1.** Every section is rendered with `feed: 'first'` (`editor.tsx:961`). A
  pager's meaningful state — a Newer and an Older link, "2 / 5" — is never on screen, so a pagination treatment cannot
  be designed at all.
- **The runtime has no page 2 to hand out.** `FeedState` is `first · middle · last · empty` (`orbit-weekly.ts:211`),
  and `middle` is `ceil(pages / 2)`, which is page 3 of the bundled feed's five.
- **What page 2 of Home is made of has no caller.** R-127's `indexStack` (`synthesize.ts:141-145`) is the one
  function Story 7.3's compiler and this story must share, and nothing in `apps/web` calls it.
- **The page's address is wrong past page 1 and on every archive.** `templateContext` answers `currentUrl: '/'` in
  every branch and `paginationBase: '/'` on archives (`orbit-weekly.ts:232`, `:260`, DW-218), and the site-wide
  header is rendered at `default.hbs`, which always gets `/`. So Rail marks Home as the current page where Ghost marks
  nothing.

**Approach:**

- **Page 2 is a canvas state**, beside the mode, the device, View as and Preview: session state, never in the URL,
  never stored, never an edit, and back to page 1 on a change of canvas.
- **The stack knows the page.** On Home, page 2's own rows are `indexStack(home)` (R-127), rendered at `index.hbs`,
  the file Ghost serves at `/page/2/`. On Tag and Author they are the page's own rows. So every reader of the stack
  (picks, marks, restamps, the panel) agrees with what is painted.
- **`templateContext` gains page 2 (`'second'`) and the page's true address**, both read in Ghost's own source on both
  majors. The editor hands that one address to every section of the page, the site-wide header included. This closes
  DW-218.
- **It is offered where it can exist.** The entry is D5d's **Preview page 1 | 2** row at the foot of the page's main
  feed's panel. The main feed is the section `isMainFeed` marks: synthesis sets it today, and Story 5.19's lifecycle
  will set it on a placed feed. The row's **2** is greyed, with its reason, where the page has no page 2.
- **D5d's ink pill** ("Page 2" · "Back to page 1") sits at the top of the canvas ground.
- **On page 2 you work on the main feed only, as D5d draws it** (Question 2's recommended option).
- **No key.** No migration, so there is **no Schema phase**.

## Boundaries & Constraints

**Always:**

- **One implementation of what page 2 is made of** (R-127, AD-27(d)). Home's page 2 is exactly
  `indexStack(docs.home, library).instances`, never re-derived and never filtered here. DW-194's `compileTarget`
  filter, when Story 7.3 puts it inside `indexStack`, reaches the canvas with no change here.
- **Page 2 exists only where Ghost serves one** (read in source, both majors — Design Notes):
  - Home's page 2 is `index.hbs`.
  - An archive's page 2 is the same `tag.hbs` or `author.hbs`, with that archive's own posts 13 to 24.
  - Past the last page Ghost answers 404. So a one-page archive has no page 2, and none is invented (FR-H3: "no post
    is invented").
- **Offered only on the canvas's own shown main feed.** That is the first instance of the canvas's own doc with
  `isMainFeed`, which is also the one `indexStack` takes.
  - `isMainFeed` is read here, never written (Story 5.19 owns its lifecycle).
  - So `indexStack`'s fallback (rows no doc holds, such as `auto-index-1`) is never painted, and every instance on
    page 2 is one a doc holds.
- **The page's address is Ghost's, computed in one place and handed to every section of the page:**
  - `/` on Home page 1 and `/page/2/` on its page 2
  - `/tag/<slug>/` and `/tag/<slug>/page/2/` (and `/author/…`) on archives, which is also the pager's base
  - So `{{navigation}}` marks what Ghost marks: `nav-current` only on an exact match.
  - Post, Page and 404 keep today's `/` (a new DW below).
- **Session state.**
  - Not in the URL: `/projects/<id>` is still Home, and `/index` stays a 404 (R-127).
  - Never stored and never journalled.
  - View as, the mode, the device and the preview subject all carry into it.
  - A change of canvas returns to page 1.
- **When page 2 stops existing, the canvas returns to page 1 before it paints, and `#editor-said` says why.** That
  happens when the main feed is removed or hidden (by an undo or a redo), or when the preview subject changes
  to a one-page archive.
- **Question 2, option 1 (as D5d draws it).** On page 2:
  - The canvas takes no presses and draws no editing chrome: Preview's canvas rules.
  - Layers greys every row but the main feed's, and a greyed row cannot be pressed, dragged or opened. The main
    feed's row still selects.
  - The main feed's panel works as it does on page 1.
  - ⌘K, ⌘D and Delete/Backspace do nothing.
  - Undo, redo, save, Remix, the design ring, the mode, the device, View as, the preview subject and Preview act as
    on page 1.
- **No key** (FR-D21, FR-D11, `EXPERIENCE.md:392-393`): no `KEYMAP` row, and nothing on the `?` card.
- **One name each** (R-170), `EXPERIENCE.md:270`'s canonical strings, written once in `lib/page-two.ts`:
  - **Page 2** on the pill and in the announcement
  - **Back to page 1** on the pill's button and in its announcement
  - **Preview page** on the row
- **The pill never covers the page card** on any device (R-138's invariant, extended). The ground's top padding grows
  on page 2 to hold it.
- **Tokens only** in `.tsx` (`tokens.test.ts:125`). Every glyph is read from the frame (R-92).

**Ask First:**

- **Any change under `packages/` beyond** `orbit-weekly.ts`'s `'second'`, its page-count query and the page addresses,
  with their tests. None of those moves a rendered byte where no page 2 or subject is asked for.
- **Any change to** `indexStack`, `synthesize`, or anything that writes `isMainFeed` (DW-194 is Story 5.19's and 7.3's).
- **Any migration.**
- **Any write to the owner's own projects.**

**Never:**

- **A keyboard shortcut** for page 2.
- **An invented page, post or page count.** No deeper `pagination` on the canvas, and no page-1 rows relabelled.
- **A row of numbered page links** (R-109). D5d's drawn `1 2 3 … 7` row is superseded, and a17/1's pager reads
  "2 / 5".
- **Other stories' surfaces:** designating a main feed, the Pagination style control, the MAIN FEED marker (Story
  5.19, and Epic 10's A34), and Theme Settings' posts per page (Epic 7).
- **Page 2 on `/pilots`, `/controls`, the Section Picker's cards or the design ring's tiles.** They stay on page 1.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Offered | Select the main feed: the Post grid of an untouched Home, Tag or Author page, or of a Home that kept its auto-generated grid | Its panel ends, above "Reset this design", with D5d's row: **Preview page**, **1 · 2**, 1 on | N/A |
| Not offered | Any other section; a Post, Page or 404 canvas; a Home whose grid carries no `isMainFeed` (the owner's Pilot sections) | No row | N/A |
| Enter, Home | **2** on the row | One repaint. The page's own rows are `indexStack(home)`, rendered at `index.hbs` with page 2's context: every section above the feed is gone; the grid shows posts 13–24, starting "The paragraph is the unit"; its pager reads "← Newer posts · 2 / 5 · Older posts →"; Rail's Home link carries no `nav-current`. D5d's pill sits at the top of the ground, and `#editor-said` says "Page 2." | N/A |
| Enter, archive with two pages | Tag canvas, subject Field Notes (14 posts) | The archive's real page 2 (**Question 1, option 1**): its 2 posts, the pager reading "← Newer posts · 2 / 2", and no Older link | N/A |
| One page | Author canvas, Tomas Lindqvist (6 posts) | **2** greyed. Under it: "Tomas Lindqvist's 6 posts fit on one page, so there is no page 2." | N/A |
| Hidden main feed | Select a hidden main feed through Layers | **2** greyed. Under it: "This section is hidden, so there is no page 2 to show." | N/A |
| The canvas on page 2 | Hover, click or tap the page | Nothing is outlined, tagged or selected, and no inline editing starts. Links and forms stay trapped, as always. | N/A |
| Layers on page 2 | The rows | Every row but the main feed's is greyed (`aria-disabled`). A greyed row has no ⋯, no grip, no move and no Space. "+ Add section" is absent. The main feed's row selects. | N/A |
| The panel on page 2 | Change one of the main feed's controls, then ⌘Z | Page 2 repaints with the change. ⌘Z takes it back, still on page 2. | N/A |
| Keys on page 2 | ⌘K, ⌘D, Delete, Backspace | Nothing. Every other key acts as on page 1. | N/A |
| Leave | **Back to page 1** on the pill, or **1** on the row | One repaint to page 1. From the pill, focus goes to the canvas; from the row, it stays on the row. `#editor-said` says "Back to page 1." | N/A |
| Page 2 disappears | While on page 2: an undo or redo removes or hides the main feed, or the subject changes to a one-page archive | Page 1 at once. `#editor-said` says "Back to page 1." with the reason. | Never a paint of a page that does not exist |
| Canvas switch | Template to another canvas while on page 2 | It opens on page 1, and so does this canvas on the way back | N/A |
| Preview | P on page 2 | Preview shows page 2 with no pill; Esc or P return to page 2 with it | N/A |
| No key | Every printable key, Space and Enter, with the shell focused | Nothing changes the page. The `?` card lists no page key. | N/A |
| The control | `/pilots`, `check-snapshots`, the render matrix, the picker's cards, the ring's tiles | Unchanged. They never ask for `'second'` or pass an address. | N/A |

</frozen-after-approval>

## Code Map

**The runtime** (`packages/library/src/orbit-weekly.ts`, Story 4.4 / 5.13):

- `postsPerPage` `:85` is the dataset's 12, and `paginationOver` `:90-95` throws past the last page. `feedPagination`
  `:98-100` and `feedPage` `:103-106` already take any page: page 2 is `{page 2, pages 5, limit 12, total 52}`, and its
  rows run from "The paragraph is the unit" to "Editing as subtraction" (evaluated at Create).
- `FeedState` `:211` is `first · middle · last · empty`, and `middle` is page 3 (`:263-264`).
- `templateContext` `:226-270`:
  - `base.currentUrl: '/'` at `:232`.
  - The non-paginated targets return at `:240`, so `default.hbs`, where the header renders, always gets `/`.
  - The archive branch is `:245-262`. `paginationBase: '/'` and the inherited `/` at `:259-260` are DW-218.
  - The home branch is `:263-269`.
- **Field Notes has 14 posts, so it has 2 pages**; its page 2 is "How long a page should take to load" and "What we
  learned from four hundred renewals". Reporting has 13 (2 pages). Every other tag, and every one of the 16 writers
  (6 or 7 posts each), fits on one page.
- `orbit-weekly.test.ts`:
  - `:42-52` is FR-H3 rule 1: a middle page exists.
  - `:396-415` is 5.13's control: no subject equals `undefined` or `null`.
  - `:430-446` is the fixture tag's size.
  - `:448-474` is the archive's own pagination.

**What page 2 is made of** (`packages/section-runtime/src/synthesize.ts`):

- `indexStack` `:141-145`: the slice from the first `isMainFeed` instance, or `synthesize('index.hbs')` when there is
  none.
- `FEED` `:59`: a17/1 "Post grid", `isMainFeed: true`, on home, index, tag and author (`:63-84`). The library holds no
  a29, so an untouched Tag or Author page is that one grid.
- Tested in `synthesize.test.ts:119-161` and against the real library in `apps/web/canvas-switch.test.ts:150-159`.
- DW-194 (open, owners 5.19 and 7.3) already records that `indexStack` never checks `compileTarget`, takes the first
  of several flags, and counts a hidden feed.

**The pager and the address on the canvas:**

- `packages/section-runtime/src/core.ts:914-940`:
  - `numbers` writes `page / pages` (R-109).
  - The canvas sets prev and next `href` from `pageUrl(n, site.paginationBase ?? '/')` and removes a link that has
    no page.
- `packages/ghost-shim/src/index.ts`:
  - `navigationItems` `:389-406` marks an item current only when `url === currentUrl` (`:395`).
  - `paginationContext` `:422-435` and `pageUrl` `:440-444`.
  - The page-2 context is recorded on both majors: `packages/ghost-shim/fixtures/ghost{5,6}/index-page-2.json`, read
    by `contract.test.ts:538-546, 803-820`.
- `packages/library/designs/a17/1/`:
  - `index.html:37-41` is the only built pager (`data-pagination="prev|numbers|next"`, "Newer posts" and "Older
    posts" from the catalog).
  - `design.json:4-5`: `bindingContext ["posts"]`, and a `compileTarget` that includes `index.hbs`.
  - a22/1 and a4/13 do not list `index.hbs` (DW-194's case).
- `a1/1/index.html:10` renders `{{navigation}}`, and `style.css:29-30` draws `.nav-current` as a 2px accent underline.
  So the address is **visible**.

**The render door** (`apps/web/lib/canvas.ts:65-104`): `renderSection` calls
`templateContext(o.target, o.feed, o.subject)` at `:85` and hands `site` at `:97`. `/pilots` (`review.tsx:124`), the
picker's cards (`section-preview.tsx:133-142`) and the ring's tiles (`design-picker.tsx:78-88`) all pass
`feed: 'first'` and no address.

**The editor** (`apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`):

- **State.** `mode`, `device`, `viewAs` and `preview` are at `:328`, `:333`, `:339` and `:344`, each commented as
  session state. `latest` (`:510-511`) lists its fields twice, and a new one goes on both lines.
  - `chooseVisitor` (`:878-884`) is the shape to copy: write `latest`, set the state, `paint()`, then `setSaid`.
  - `enterPreview` and `leavePreview` are `:891-905`.
- **The stack.** `stackOf` (`:272-276`) stamps each canvas row with `CANVASES[key].file`, through `canvasStack`
  (`lib/editor.ts:127-130`). It has four call sites, and all must pass the page: `:317` (render), `:550` (`commit`),
  `:634` (`restore`) and `:1517` (hydrate).
  - `roots` is index-aligned with the last painted stack (`:451-452`, `:973`).
  - `pickAt` (`:992-996`), `mark` (`:775-793`), `restampAll` (`:805-814`), `rootOf` (`:1617-1620`), `chosen` and
    `pointed` (`:1644-1645`), and the Sidebar's fast path (`:2052-2054`) all read it.
- **Paint** (`:923-989`). The call at `:961` passes `feed: 'first'` and `subject: now.subject`.
  `frame.current.dataset.painted = now.key` at `:985` is what the deployed walk waits on (`run-verify-editor.cjs:309`),
  and a same-canvas repaint does not change it.
- **The canvas change** is the `[key]` effect (`:1409-1416`). The mode, device, View as and Preview survive it.
- **Preview's canvas rules**, reused on page 2:
  - The handlers bail at `:1296` (mousedown), `:1334` and `:1337` (pointer), `:1360` (touch) and `:1390-1393` (click).
  - `showing` (`:1664-1677`) drops the chrome layer, so there is no outline, tag, badge, lock pill or chip.
  - `InlineTools` (`:2382`) and `SectionPill` (`:2386`) are `hidden` when their condition holds.
  - `mark()` writes no state mark while `!on` (`:779`).
- **Keys.** `onShortcut` (`:1213-1234`) filters Preview at `:1228` through `IN_PREVIEW`. `run('add')` (`:1181`) and
  `invokedAt` (`:1952`) do stack-index arithmetic that a sliced stack would break. They are unreachable on page 2
  because ⌘K does nothing there.
- **The stage** (`:2237-2412`):
  - Class `px-7 py-8` at `:2268` (R-138, R-139); the card is at `:2275-2279`, and the fit is `fitFor(size, device)`
    (`:497`, `lib/device.ts:40-41`) over the stage's content box (`:1590-1595`), so padding shrinks it.
  - `ViewportChip` is top-left, 4px/4px (`device-switch.tsx:100`). `SourcePill` is bottom-centre, 24px
    (`source-pill.tsx:84-101`).
  - Both come after the card and sit inside `<div hidden={preview} className="contents">` (`:2363-2379`), because
    the card must stay the ground's `firstElementChild`.
- **The panel.** `Sidebar` is mounted at `:2457-2485`. R-124's `visibility` row is the precedent for a row the editor
  injects; `onClearDark` is the precedent for a plain callback that is not an edit. `isMainFeed` is written only at
  `:1948` (a placement, always `false`) and read nowhere.
- **Layers** is mounted at `:2201`, fed by `rowsOf` (`:1725-1732`) in doc order.

**The panels and the Kit:**

- `apps/web/components/controls/sidebar.tsx`:
  - Props `:79-97`. Every group is an accordion that starts closed (`:220`, `:394-409`), so a row inside a group
    would be hidden.
  - The always-visible slot is between the groups (`:412`) and the foot (`:414`: "Reset this design" `:415-427`,
    "Clear dark overrides" `:440-462`).
- `apps/web/components/kit/segmented.tsx`:
  - API `:50-70`; the radio group and `radioKeys`/`tabStop` `:27-48`, `:85-111`; the greyed value and its caption
    slot `:117`.
  - The label always sits above the track, the items are `flex-1` at 11.5px, and the current one carries `shadow-sm`.
  - `:7` says "NAMED VALUES ONLY, never numbers (Appendix C)".
- `apps/web/components/controls/layers.tsx`: `LayerRow` `:65-76`, `LayersProps` `:83-114`, the row keys (select,
  ⌥↑↓, Space) `:201-223`, `drawRow` `:227+`. `kit/layers-row.tsx:28-50`.
- `apps/web/components/kit/icons.tsx`: `ChevronLeft` (`:85-89`) is D5d's `:394` chevron exactly. D5d's page glyph
  (`:390`) is not in the Kit.
- `apps/web/components/kit/canvas-pill.tsx:10-37`: `role="toolbar"`, `gap-px`, `shadow-lg`, icon-only buttons, used
  only on `/kit`. `preview-toggle.tsx:56` (B3b) is the precedent for drawing an ink pill in its own component with
  `shadow-modal`.
- `apps/web/app/globals.css`: `ink` `:35`, `ink-soft` `:38`, `ink-faint` `:40`, `paper-sunk` `:33`, `rounded-thumb`
  (10px) `:91`, `shadow-modal` `:102`.

**The key map** (`apps/web/lib/keymap.ts`): `Gesture` `:32-38`, `KEYMAP` `:66-121`, `IN_PREVIEW` `:135`.
`keymap.test.ts:147-162` requires the only keyless live row to be `deselect`, so no row is added for page 2.

**The harness and the walks:**

- `apps/web/app/(app)/app/harness/editor/page.tsx`:
  - Its Home is `[a17/1, a22/1, a4/13, controls/1]` (`:78-83`), and nothing carries `isMainFeed` (`:51-59`).
  - `synthesized: []` (`:103-108`).
  - Tag and Author are unreachable there (authed routes answer 500 without Supabase).
- `tools/keyboard/journey.spec.mjs`:
  - `open` `:43-51`; the canvas is read through `iframe[title$="canvas"]`.
  - The UX-DR9 Tab budget, counted off the page, is `:191-217`.
  - The "no key binds it" pattern is `:549-572`.
  - Story 5.15's journeys are `:1291-1674`.
  - `KEYBOARD ONLY BELOW` is enforced at `:150-159`.
- `tools/probe/run-verify-editor.cjs`:
  - `check` `:176`; `painted` `:309`; step 4's `/pilots` comparison (Home and Post) `:468-500`.
  - Step 6's `index` 404 `:4764-4769`; step 38 returns Home to its default stack `:1864-1878`.
  - Step 89 derives the Tag rows from `templateContext` `:4062-4074`, and is the pattern for page 2's.
  - Step 91 is the last; **step 92** is new. The seeded Home carries no `isMainFeed` (`seed-editor-project.mjs:29-33`).

**Ghost, read in the npm tarballs of 5.130.6 and 6.58.0** (paths inside `package/`; same lines on both majors unless
marked):

- **Template choice.** `core/frontend/services/rendering/templates.js:67` puts `home` first only when the path is
  exactly `/`, so `/page/2/` renders `index.hbs`. The collection router's `frontPageTemplate: 'home'` is at
  5:`routing/CollectionRouter.js:107` and 6:`routing/collection-router.js:117`.
- **Archives** keep `tag-<slug> → tag → index` on every page (`templates.js:52-57`).
- **`nav-current`.** `helpers/tpl/navigation.hbs:3` is `link_class for=(url)`, and
  `services/theme-engine/handlebars/utils.js:61` sets `nav-current` on an exact match of `relativeUrl` only.
  - Executed on both: the `/` item on `/page/2/` gets `nav-home` alone.
  - On an archive's page 2, an item for that archive gets `nav-current-parent` (`:63`), which the shim does not draw.
- **The pager.** On page 2 of 52 at 12 the context is `{page 2, pages 5, limit 12, total 52, next 3, prev 1}`.
  - `helpers/page_url.js:16` → `meta/paginated-url.js:15-36`: on `/tag/news/page/2/`, `prev` is `/tag/news/` and
    `next` is `/tag/news/page/3/`.
- **Past the last page is a 404.** `routing/controllers/channel.js:55-60` and `collection.js:55-60`:
  `if (pathOptions.page > result.meta.pagination.pages)`.
- **No canvas reader:**
  - `body_class` adds `paged` and drops `home-template` (`helpers/body_class.js:21-22, :44-46`).
  - `meta_title` adds " (Page 2)" (`meta/title.js:22-24`).
- **Already recorded on T3** (`packages/library/contexts/fixtures/ghost5.json`): `/` renders `home.hbs` with
  `nav-ghost-5-home nav-current` (`:1657`), and `/page/2/` renders `index.hbs` with `nav-ghost-5-home` alone (`:2340`).

**Production, read at Create** (Supabase, `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, read-only, 2026-09-22). All three
of the owner's projects store `posts_per_page` 12.

- **"Ghost 5 Project"** (`99d4d277-…`): Home is [Newsletter — Inline Row, **Post grid with `isMainFeed`**], and the
  site header is Rail.
- **"Pilot sections"** (`b6d4db35-…`):
  - Home is [Latest Post, Three Up, Inline Row], none carrying `isMainFeed`.
  - Tag and Author are untouched, and the stored subjects are `field-notes` and `tomas-lindqvist`.
- **"Ghost 6 Project"**: every canvas is untouched.

**The frames and documents:**

- **`D5 Canvas Markers and Template Switcher.dc.html` D5d, `:358-434`:**
  - The caption is `:360`: "reached from the Pagination control, never a shortcut".
  - The pill (`:388-396`):
    - `#1C1B1A`, 10px radius, 4px padding, a 4px gap, `0 12px 40px rgba(28,27,26,.25)`.
    - "Page 2": 30px high, `0 12px`, a 7px radius, fill `rgba(255,255,255,.08)`, the 13px glyph at stroke 1.8 in
      `#B8B3AA`, the words at 12.5/600 in white.
    - "Back to page 1": 30px high, `0 12px`, a 7px radius, a 7px gap, the 12px chevron at stroke 2, 12.5px in
      `#B8B3AA`, and a hover fill of white at .08.
  - Layers (`:374-386`): every row but the main feed's is `#8B857C`, with no pointer.
  - The pager (`:411-419`): the numbered row R-109 supersedes.
  - The row (`:429`): "Preview page" at 12/500 `#6E6A64`. Its track is `#EFECE7`, radius 24, padding 3; each item is
    34 × 26 at 12px, and the current one is white, radius 20, 12/600.
- **D5c `:351`** draws the same row's page-1 state as "Preview page 2 · Open". D5c is Story 5.19's frame.
- **`EXPERIENCE.md`:** `:165` (the IA row), `:270` (the canonical strings), `:392-393` (no shortcut, deliberately),
  `:1793-1797` (FRAME 4).
- **`prd.md`:** FR-D21 `:245`, FR-H2 `:312`, FR-H3 `:313-315`, FR-Q1 `:358`, and the canvas-state markers `:1337`.
- **`reconcile-designs-decisions.md`:** R-127 `:2591-2621`, whose ledger still owes "epics.md … Story 5.16" and
  `sections-inventory.md`'s §3 heading. R-109 `:2089-2101`.
- **`A34 Pagination Styles - Spec.md`:** every frame is drawn on page 2 (`:218-219`), and one page shows its reason in
  the editor (`:86-89`).

## Tasks & Acceptance

**Execution:**

- [ ] `packages/library/src/orbit-weekly.ts` — three changes, all within Ask First:
  - `FeedState` gains `'second'`: page 2 of the list the target renders.
    - On `home.hbs` and `index.hbs` it is the bundled feed's page 2.
    - On an archive with a subject it is that archive's page 2.
    - It throws where that list has one page, as `paginationOver` already does; the caller asks first.
  - `feedPages(target, subject?)`: how many pages that list has, and 1 on a target that does not paginate. It is the
    one question the editor asks before offering page 2.
  - **The page's address, from one function that `templateContext` itself uses:**
    - `currentUrl` is `pageUrl(n, base)` on every page of the home and archive branches.
    - The archive's `paginationBase` is `/tag/<slug>/` or `/author/<slug>/`.
    - Every other branch keeps `/`.
    - No rendered byte changes where no subject and no `'second'` is asked for: only `{{navigation}}` reads the
      address, and only a1/1 renders it, at `default.hbs`.
- [ ] `packages/library/src/orbit-weekly.test.ts`:
  - **FR-D21's promise, asserted:** at the dataset's `posts_per_page`, `'second'` on `index.hbs` is page 2 of 5 with
    both a prev and a next, and its rows are `feedPage(2)`.
  - An archive's `'second'` is its own page 2 (Field Notes: `2 / 2`, no next). `feedPages` agrees with `paginationOver`
    on every tag and every author.
  - The addresses: Home page 2 is `/page/2/`; the Tag canvas is `/tag/field-notes/` and `/tag/field-notes/page/2/`,
    and its `paginationBase` is `/tag/field-notes/`.
  - 5.13's control (`:396-415`) is untouched and green.
- [ ] `apps/web/lib/canvas.ts` — `renderSection` takes an optional `url`, the page being previewed, which is handed to
      `site.currentUrl`. Leaving it out is exactly today's render, which is why `/pilots`, the picker's cards and the
      ring's tiles do not change.
- [ ] `apps/web/lib/page-two.ts` — **new**, and pure. It holds:
  - **The words, each written once (R-170):** "Page 2", "Back to page 1" and "Preview page". The announcements
    "Page 2." and "Back to page 1.", each followed by its reason when the return was not asked for.
  - **The two reasons** a greyed 2 carries:
    - one page: "{Name}'s {n} posts fit on one page, so there is no page 2." on an archive, and "All {n} posts fit on
      one page, so there is no page 2." on Home;
    - hidden: "This section is hidden, so there is no page 2 to show."
  - **The main feed of a canvas:** the first instance of its own doc carrying `isMainFeed`.
  - **The page in force.** It answers 2 only while 2 was asked for, that main feed is shown, and `feedPages ≥ 2`, and
    otherwise names why not.
  - **The stack, page-aware.** `stackOf` moves here beside `canvasStack`. On Home's page 2 the canvas's own rows are
    `indexStack(docs.home, library).instances`, each stamped `index.hbs`; on every other page and canvas nothing
    changes.
- [ ] `apps/web/page-two.test.ts` — **new**. Against the real library, as `canvas-switch.test.ts` does:
  - The Home page-2 stack is the site's rows around `indexStack`'s, stamped `index.hbs`, and drops what sits above the
    feed.
  - Page 1 is `stackOf` exactly as before.
  - No main feed, a hidden one, or a one-page archive answers page 1 with the right reason. The words are
    EXPERIENCE's.
  - No instance of a page-2 stack is absent from the docs.
- [ ] `apps/web/lib/keymap.ts` and `keymap.test.ts`:
  - `OFF_PAGE_TWO`: the gestures that do nothing on page 2 are `add`, `duplicate` and `remove`, beside `IN_PREVIEW`.
  - **No `KEYMAP` row**, which `keymap.test.ts:147-162` keeps.
- [ ] `apps/web/components/kit/icons.tsx` — D5d's page glyph (`:390`: a rounded square with two lines, stroke 1.8),
      copied verbatim (R-92), as `PageLines`.
- [ ] `apps/web/components/kit/segmented.tsx` — an **inline** layout for D5d's row: the label on the left and the
      track on the right, with fixed 34 × 26 items at 12px.
  - The radio group, its keys, the greyed-value pattern and its caption slot stay the Kit's own. That is one
    vocabulary (R-74), not a second segmented.
  - Scope the `:7` comment: it governs a design's controls (Appendix C: a count is a number picker). This row's values
    are pages, and the row is editor state.
- [ ] `apps/web/components/editor/page-two-pill.tsx` — **new**. D5d's pill:
  - The canvas pill's recipe: `bg-ink`, `rounded-thumb`, `p-1`, D5d's 4px gap, and its drawn .25 shadow, which is
    `shadow-modal` (B3b's precedent).
  - "Page 2" with `PageLines`, as words, not a control.
  - **Back to page 1**: a 30px button with `ChevronLeft`.
  - `#B8B3AA` is not a token, so it is `surface` at the alpha that reproduces it on ink (about .66). B3b's white
    alphas are the precedent.
  - `CanvasPill` itself is untouched.
- [ ] `apps/web/components/controls/sidebar.tsx` — an optional `page` prop: the value, the greyed reason or none, and a
      plain callback, never an edit. It draws D5d's row between the groups and the foot. With no prop there is no row,
      so `/controls` and `/pilots` do not change.
- [ ] `apps/web/components/controls/layers.tsx` and `apps/web/components/kit/layers-row.tsx` — **page 2's mode**, given
      the one live row's key:
  - Every other row is greyed (`text-ink-faint`) and `aria-disabled`, with no select, grip, ⌥↑↓, Space or ⋯.
  - "+ Add section" is absent.
  - The live row selects and carries no ⋯.
- [ ] `editor.tsx`:
  - **The state.** `page` is session state beside `preview`, and is in `latest` on both lines.
    - `enterPageTwo` and `leavePageTwo` take `chooseVisitor`'s shape.
    - The pill's button moves focus to the stage. The row keeps focus on itself.
  - **The stack.** All four `stackOf` sites pass the page in force.
    - When the answer is 1 while 2 was asked for, the editor sets page 1 and `setSaid`s "Back to page 1." with the
      reason, before the paint.
    - The `[key]` effect returns to page 1.
  - **Paint.** `feed` is `'second'` on page 2.
    - Every section gets `url`: the canvas's own address from `orbit-weekly.ts`, for the canvas's file (`index.hbs` on
      Home's page 2).
    - `frame.current.dataset.page` is set beside `painted`, so the walk can wait on a same-canvas repaint.
  - **The canvas on page 2** takes Preview's rules: every handler that bails on `preview` also bails on page 2, and
    `showing`, `mark`, `InlineTools` and `SectionPill` treat page 2 as they treat Preview.
  - **Keys.** `onShortcut` drops `OFF_PAGE_TWO` on page 2. `onEscape` is unchanged, so Esc deselects, and the main
    feed's Layers row selects it again.
  - **The pill** is mounted after the card, top-centre of the ground, 4px from its top (the chip's inset, R-138), and
    `hidden` in Preview. On page 2 the ground's top padding becomes the pill's bottom plus R-138's 8px, so no page card
    meets it. It is measured at Dev.
  - **The row** is passed to `Sidebar` only for the canvas's main feed.
  - **Layers** gets page 2's mode.
- [ ] `apps/web/app/(app)/app/harness/editor/page.tsx` — the harness Home's a17/1 carries `isMainFeed: true`, with a
      comment saying why: CI's one main feed. Every other journey stays green.
- [ ] `tools/keyboard/journey.spec.mjs` — new journeys, keyboard-only:
  - On the main feed's panel, the row is found and **2** is chosen.
  - Page 2 is proved with values derived from `templateContext`, never written down: the canvas holds exactly the page
    2 rows, the pager reads `2 / 5` with both links, and Rail's Home link has no `nav-current`.
  - One section is moved above the grid with ⌥↑ first, so it is gone on page 2 and back on page 1.
  - The pill's words and focus, and "Page 2." and "Back to page 1." in `#editor-said`.
  - On page 2, Layers is greyed but the feed's row, ⌘K ⌘D and Delete do nothing, and a panel change and its ⌘Z stay on
    page 2.
  - An undo that removes the feed returns to page 1 with its reason.
  - Preview on page 2 shows no pill, and Esc comes back to it.
  - No printable key changes the page (the `:549-572` pattern), and the Tab budget stays derived.
- [ ] `tools/probe/run-verify-editor.cjs` — **step 92**, the deployed walk:
  - Plant `isMainFeed` on the seeded Home's a17/1, using step 38's planted-doc pattern, and restore the doc after.
  - Home's page 2 drops Latest Post and keeps the Inline Row. Its rows and pager are derived from `templateContext`
    (step 89's pattern). The Home link has no `nav-current`.
  - The Tag canvas shows Field Notes' page 2. The Author canvas shows Rosa Menendez's greyed 2 and its sentence.
  - The pill and the row match D5d.
  - The pill never meets the page card or the chip at all three devices at 1440 and at 1280.
  - Step 5's CSP session goes in and out of page 2, and step 8 scans axe on page 2.
- [ ] **Documents** (standing rule 3), then a grep for `feed: 'first'`, `currentUrl: '/'`, `paginationBase: '/'` and
      `Preview page 2` (standing rule 7):
  - `epics.md`:
    - Story 5.16's card gains R-127 (what page 2 is made of) and the owner's two rulings.
    - Story 7.34 carries FR-D21's orphaned "NFR-6(c3)'s comparison exercises a page-2 URL".
    - Story 5.22 gets the pill against the viewport chip, as measured.
  - `reconcile-designs-decisions.md`: R-127's ledger ticks "Story 5.16", plus the owner's rulings as R-176 and on.
  - `sections-inventory.md` § Synthesis Defaults §3's heading, which R-127's ledger owes "at those stories".
  - `prd.md` FR-D21, only as Question 1 is ruled.
  - `MEASUREMENTS.md`: a new § with the Ghost facts above (read in source on both majors), plus Review's read-only T1
    and T3 run.
  - `deferred-work.md`:
    - Close DW-218.
    - Append to DW-194: now reachable (the owner's Ghost 5 Project, every materialised Home) and visible on page 2;
      a22/1 and a4/13 on `index.hbs`; a second native feed paginating on the canvas.
    - New entries:
      - Post, Page and 404 still hand the header `/`.
      - The shim draws no `nav-current-parent`.
      - The Synthesis Defaults name A34 #1 Numbers against the all-Free rule.
      - The four Pagination style value lists disagree (A34, A17 and A18, FR-H2, D5c and D5d). Owner: Story 5.19.
  - `epic-5-context.md`: the as-built sub-bullet.

**Acceptance Criteria:**

- **Given** the main feed is selected, **when** its panel is read, **then** it ends, above "Reset this design", with
  **Preview page · 1 · 2**. **It matches the frame**, D5d `:429`: label left, the pill track right, and 34 × 26 items.
- **Given** page 2, **when** the canvas is looked at, **then** D5d's pill sits at the top centre of the ground: ink,
  10px radius, 4px padding, the page glyph with **Page 2**, then **‹ Back to page 1**, with no coral. **It matches the
  frame**, D5d `:388-396`. It never covers the page card or the viewport chip at Desktop, Tablet and Mobile in a 1440
  window.
- **Given** page 2 of a feed with five pages, **when** it renders, **then** the pager shows its full range: a Newer
  link, "2 / 5" (R-109) and an Older link. That is FR-D21's middle page.
- **Given** Home's page 2, **when** it renders, **then** every section is exactly `indexStack(home)` around the site's
  rows, rendered at `index.hbs`, and nothing above the main feed is drawn (R-127).
- **Given** any page 2, **when** the header renders `{{navigation}}`, **then** it marks what Ghost marks on that
  address. **And given** the Tag or Author canvas at page 1, **then** Home is no longer marked (DW-218).
- **Given** the shell holds focus, **when** any key is pressed, **then** nothing switches the page, and the `?` card
  lists no page key (FR-D21).
- **Given** the page switch, **when** it is pressed, **then** the canvas has repainted before a busy label could say
  anything. No route is added, so no skeleton is owed (R-98), and `busy.test.ts` stays green.
- **Given** `pnpm check`, **when** it runs, **then** `check-snapshots` and the render matrix are unchanged, and
  5.13's control is green.

## Spec Change Log

## Design Notes

**Why this is built before Story 5.19, and where it lives until then.** A routine call, stated to the owner in one
line.

- **The epic's lean.** The epic context records "5.16's page 2 still needs 5.19". 5.19 owns the main feed's lifecycle
  and its Pagination control. D5d says page 2 is "reached from the Pagination control".
- **What exists already is enough.** `isMainFeed` has existed since 5.5, and synthesis sets it on every untouched
  Home, Tag and Author page. The owner's own Ghost 5 Project kept it on a designed Home.
- **So the row lands now** on the panel of the feed that already carries the mark. The Pagination control and the
  lifecycle arrive above it with 5.19, which rebuilds nothing here. That is R-118's rule for a control, and R-165's
  shape for a lean.
- **The Pilot sections Home shows no row.** Its grid was placed before the mark could be written. The manual test
  says so, and uses the Ghost 5 Project's Home.

**Why the stack, not the paint, knows the page.**

- The roots, `pickAt`, `mark`, `restampAll`, `chosen`, `rootOf` and the panel's fast path are all index-aligned with
  `latest.stack`.
- A paint that drew a different list than `stackOf` returned would outline, restamp and edit the wrong sections.
- So the page enters at the one function all four `stackOf` call sites use.

**Why `index.hbs`, and why the address travels to every section.**

- Ghost chooses `home.hbs` only at exactly `/` (`templates.js:67`). The context of the two files is the same
  (`templateContext` treats them alike), but FR-H7's binding check and R-7's pagination check read the target, and
  the truthful target is the one that ships.
- `{{navigation}}` reads the request's `relativeUrl`, while the header is compiled into `default.hbs`. A per-section
  target can never tell it which page it is on, so the page's address is handed to every section.
- Rail draws `.nav-current`, so this is visible: Home stops being underlined on page 2, and on the Tag and Author
  pages at page 1 too.

**Why `'second'` and not `'middle'`.** FR-D21 and D5d name **page 2**. On the bundled feed page 2 of 5 is already a
middle page (prev 1, next 3), while `middle` is page 3. `/pilots`, the snapshots and the matrix keep their four states.

**Why a one-page archive shows no page 2** (Question 1, recommended).

- Ghost answers 404 past the last page (`channel.js:55-60`).
- FR-H3 says no post is invented.
- A34's own spec already gives the editor a sentence for one page.

**Why only the main feed on page 2** (Question 2, recommended).

- D5d greys every other layer and draws no outline.
- FR-D21 exists for the pagination treatment, which is the main feed's.
- On Home, R-127 drops everything above the feed, so a section picked there would change a page 1 you cannot see.
- The arithmetic in ⌘K's insert position (`:1181`, `invokedAt`) assumes page 1's stack, and ⌘K does nothing here.

**The row: D5d's control for both states.**

- D5c draws the page-1 state as "Preview page 2 · Open", and D5d draws the page-2 state as a segmented control. One
  control for one choice keeps one name (R-170), and D5d is this story's frame.
- The Kit's "never numbers" line is Appendix C's rule for a count in a design's controls. These are pages, and this is
  editor state.
- It sits at the panel's foot because R-113's groups start closed.

**The pill, as built.**

- Top centre, as drawn, but 4px from the ground's top rather than D5d's 16px, for the reason R-138 tucked the chip.
- The ground grows on page 2 instead of the pill shrinking. R-166's 24px trade would cost the 30px targets.
- Below roughly 1235px with both panels open it can meet the chip. That is Story 5.22's floor, and its card gets the
  measured figure.
- `shadow-modal` is D5d's own .25. `CanvasPill` (the `lg` shadow, a toolbar role, icon-only buttons) stays `/kit`'s.

**D5d's pager is not built.** R-109 ruled the numbered row out. a17/1 draws "2 / 5".

**What the owner can and cannot see.**

- Only a17/1 has a pager, and on Orbit Weekly only Home's feed reaches five pages.
- Field Notes and Reporting reach two, and no writer reaches two.
- The canvas uses the dataset's 12 per page. That equals every project's stored value, read on production, and Story
  5.19 threads the project's own.

**Known ceilings, recorded as DWs, not code:**

- DW-194's cases are now visible on page 2.
- Post, Page and 404 keep `/`.
- The shim has no `nav-current-parent`.

## Verification

**Commands** (under Node 24):

- `pnpm check`. Expected:
  - lint and typecheck green;
  - every package test green, including `orbit-weekly.test.ts`, `page-two.test.ts`, `keymap.test.ts` and
    `canvas-switch.test.ts`;
  - `node tools/check-snapshots.mjs` **unchanged**.
- `pnpm keyboard`. Expected: the page-2 journeys green in CI's `check` job, with the Tab budget derived.
- `bash tools/matrix/run-matrix-gate.sh`. Expected: green and unchanged.
- `node tools/probe/run-verify-editor.cjs` against `https://app.inflozo.com`, with `SUPABASE_URL`,
  `SUPABASE_SECRET_KEY`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID` and `VERCEL_PROJECT`. Expected:
  - 0 FAIL, including step 4 (Home at page 1 is still `/pilots`'), step 6 (`/index` is still 404) and step 92;
  - step 5 at zero violations with page 2 in its session, behind its `EvalError` control;
  - step 8 at zero axe violations on page 2.
- `python3 tools/doc-audit.py --check`, run twice. Expected: exit 0.

**Real services this story touches (R-82):**

- **Vercel production**, `app.inflozo.com`: the deployed editor and the walk.
- **Supabase production**:
  - at Create, read-only, the owner's three projects;
  - at Review, the walk's throwaway accounts, with the seeded Home's planted main feed, which is restored.
- **T1 `ghost6.inflozo.com` and T3 `ghost5.inflozo.com`**, read-only public `GET /page/2/` at Review, with no key.
  - Where the site's menu holds `/`, the `/` item carries no `nav-current`.
  - `pagination.prev` is `/`.
  - The result is recorded beside the source reading in `MEASUREMENTS.md`, under standing rule 1.
- **Not touched, and not claimed:** Resend and Dodo.

## Owner's manual test

Do this on the real site after Deploy confirms the build, in a desktop browser window about 1440 wide. It uses two of
your projects:

- **Ghost 5 Project.** Its Home has a newsletter band above a post grid that is the page's main list of posts.
- **Pilot sections**, for its Tag and Author pages.

**These steps assume both questions are ruled option 1.** If you rule otherwise, the steps change to match your ruling
before Deploy.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Click the post grid ("Everything Orbit Weekly published this spring"). Look at the foot of its settings on the right. | — | Above "Reset this design", a row **Preview page** with **1** and **2**, and 1 on. |
| 2 | same | Editor, Home | Press **2**. | — | A dark pill at the top: **Page 2 · ‹ Back to page 1**. The newsletter band above the grid is gone. The first post is "The paragraph is the unit". The pager under the grid reads **← Newer posts · 2 / 5 · Older posts →**. The header's **Home** link has no underline. |
| 3 | same | Page 2 | Look at Layers on the left, then click the newsletter row. | — | Every row but the post grid's is grey. Clicking the newsletter row does nothing. |
| 4 | same | Page 2 | Point at the page, then click a post card. | — | No outline, no name tag, and nothing else becomes selected. |
| 5 | same | Page 2 | In the settings open **Layout** and set **Per row** to **Two**. Then press **⌘Z**. | — | Page 2 shows two cards a row, and after ⌘Z three again, still on page 2. |
| 6 | same | Page 2 | Press **⌘K**, then **⌘D**, then **Delete**. | — | Nothing happens. |
| 7 | same | Page 2 | Press the **phone** button in the top bar, then the **desktop** one. | — | The page becomes phone-sized with the pill above it, never over it. Then it is desktop again. |
| 8 | same | Page 2 | Press **P**, then **Esc**. | — | Preview shows page 2 with no pill. Esc brings the editor back on page 2, with the pill. |
| 9 | same | Page 2 | Press **Back to page 1** on the pill. | — | Page 1: the newsletter band is back, the first post is "The night shift at the Port of Algeciras", the pager reads **1 / 5 · Older posts →**, and Home is underlined again. The row shows 1. |
| 10 | same | Editor, Home | Press **2**, then switch **Template** to **Post**, then back to **Home**. | — | Home opens on page 1. |
| 11 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/tag` | Editor, Tag (Field Notes) | Look at the header. Click the post grid and press **2**. | — | Home is not underlined, even on page 1, because on a tag page Ghost underlines nothing. Page 2 shows two posts, "How long a page should take to load" and "What we learned from four hundred renewals", and the pager reads **← Newer posts · 2 / 2**, with no Older link. |
| 12 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/author` | Editor, Author (Tomas Lindqvist) | Click the post grid. | — | **2** is grey. Under it: "Tomas Lindqvist's 6 posts fit on one page, so there is no page 2." |
| 13 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click "Post Grids — Three Up". | — | No Preview page row. This grid was placed before a page's main post list could be marked, and Story 5.19 adds the way. |
| 14 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Click the grey ground beside the page and press **?**. | — | The shortcuts card has no row for page 2. |

## Questions for the owner

### Question 1 — On a Tag or Author page with too few posts for a page 2, what should page 2 show?

**In plain English.** Page 2 shows a page the way a visitor sees your site's second page of posts. On Home the sample
publication has 52 posts, 12 to a page, so page 2 is a middle page with both a "Newer posts" and an "Older posts" link,
which is what the requirement asks for. A Tag or Author page, though, lists only that tag's or writer's own posts, and
the sample ones are small.

- No sample writer has more than 7 posts, so no writer has a page 2 at all. Ghost itself answers "page not found"
  there.
- The two biggest tags have 13 and 14 posts, so their page 2 is the last page: it has a "Newer posts" link and no
  "Older posts" link.

**An example.** Your Pilot sections project's Author page previews Tomas Lindqvist, who has 6 posts, and all six fit on
page 1. Its Tag page previews Field Notes, which has 14 posts. Its page 2 holds the last 2, and the pager reads
"← Newer posts · 2 / 2".

1. **Show the real page 2, and say so plainly when there is none (RECOMMENDED).**
   - Field Notes shows its real last page.
   - For Tomas, the **2** is grey with "Tomas Lindqvist's 6 posts fit on one page, so there is no page 2."
   - The full "2 / 5" middle page is always there on Home.
   - Nothing is invented, and once your real site is connected (Story 5.18) the same rule shows your own tags and
     writers truthfully.
2. **Grow the sample so the default Tag and Author pages each run to three pages.**
   - Field Notes and Rosa Menendez, the default writer, get enough posts for a true middle page 2, by tagging and
     co-authoring existing ones.
   - A tag or writer you pick yourself stays as it is.
   - This changes the sample publication you ruled on at Story 4.4.

**Ruled:** _(awaiting the owner)_

### Question 2 — While you are on page 2, what can you change?

**In plain English.** Page 2 exists so you can see, and design, how your post list looks past the first page: the next
posts, and the pager with both of its links. The drawing for this screen shows page 2 as a focused view. The post list
stays selected with its settings, and every other layer is grey. The requirement does not say whether the rest of the
page can be changed while you are there.

**An example.** On Home, page 2 drops everything above your post list (your ruling R-127). A welcome banner above the
list is not on page 2 at all. If you could pick it while on page 2, its settings would change page 1, where you cannot
see it.

1. **Only the post list, as drawn (RECOMMENDED).**
   - On page 2 you change the post list's settings in its panel and watch page 2 update.
   - The page itself takes no clicks, and the other layers are grey.
   - Adding, copying, deleting or moving sections waits until you are back on page 1.
   - Undo, redo, save, Remix, light and dark, the device, View as and Preview all still work.
2. **Everything page 2 shows.**
   - You can pick and change any section page 2 shows, on the page or in Layers, as on page 1.
   - Only the layers page 2 leaves out are grey.
3. **Look only.**
   - Nothing can be changed on page 2.
   - Go back to page 1 to change anything.

**Ruled:** _(awaiting the owner)_
