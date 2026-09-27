---
title: 'Story 5.22 — The editor''s responsive floor'
type: 'feature'
created: '2026-09-27'
status: 'in-progress'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '78fe2112233e63813f2a08acbfa1cac0566a8d4b'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Open one of your projects on your phone and, instead of an editor squeezed onto a screen it cannot fit, you get a clear
page saying the editor needs a bigger screen, with a way to what does work there — your sites today, and your deploy
history and billing as those screens are built. On a tablet, in a narrower laptop window, or with the browser zoomed to
200%, the editor now rearranges itself instead of breaking: the Layers list becomes a strip of thumbnails down the left,
a section's settings slide over the page from the right when you pick it, and Remix, dark mode, the device, Theme
settings and Preview move into one **⋯** menu. On a tablet every button is big enough for a finger, and at any width the
top bar's buttons never run into each other and the page-2 pill never runs into the size chip.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The editor has one shape on every device and at every width.

- **Nothing responds today.** Layers is a fixed 240px and Controls a fixed 280px (`editor.tsx:3762`, `:4096`). The
  top bar's centred group is absolutely centred, and its right-hand cluster meets it below about 1195px. The
  `coarse` variant is defined and used by nothing (`globals.css:318-321`).
- **A phone mounts the whole editor.** Opening a project there takes the edit lock and starts the heartbeat, the sync,
  IndexedDB and the live reads, all from `Editor`'s effects, into a screen the editor cannot fit.
- **Touch and zoom are unhandled.** A tablet gets 28px targets, and a desktop at 200% zoom gets both panels squeezing
  the canvas.
- **On page 2 the pill meets the chip.** D5d's pill meets the viewport chip below about 1205px with both panels open.

**Approach:**

- **A phone never gets the editor.** A phone is a touch screen whose shorter side is under 500px (R-201). `Editor`
  decides once, in the browser, as the project opens, and draws D4f's Small Screen Notice instead. The notice offers
  what works from a phone today, which is the sites list. Deploy history and Billing are absent until Stories 7.23 and
  12.5 add them (R-118).
- **Every other touch screen, and every fine-pointer window narrower than 1280px (R-202), gets D8's one rearrangement.**
  - Layers becomes the icon rail and opens over the canvas.
  - Controls becomes an overlay on the right, opened by a selection, with a scrim that stops at the rail.
  - The top bar keeps Template and View as and moves its right-hand cluster, whole, into one ⋯ menu.
  - A touch screen gets 44px targets (D8a). A fine pointer keeps its 28–32px ones (D8b).
- **Two things can no longer meet by construction.** The top bar becomes a three-column grid, so its centred group
  cannot meet either side. The chip and the page-2 pill share one grid row.
- **Nothing reads or blocks browser zoom.** No migration, so there is no Schema phase.

## Boundaries & Constraints

**Always:**

- **One source per rule.** `lib/floor.ts` holds the phone and compact media queries and their pure predicates.
  `globals.css`'s `phone` and `compact` custom variants carry the same strings, and a test holds them equal.
- **The phone decision is made once, in the browser, before any editor effect runs.** The server always renders the
  skeleton, drawn by CSS in the shape this device will get (R-98).
- **Opening a panel never resizes the canvas.** In the compact layout the stage's measured size is unchanged when a
  panel opens, so the fit and the chip are unchanged (`D8:161`, `:298`).
- **Only one overlay is open at a time** (`D8:283`): the Layers overlay, the Controls overlay, or a bar menu.
- **A collapsed control stays mounted, and its ⋯ row calls the control's own handler** (R-141).
  - The rows carry the controls' own words (R-170).
  - A row is absent where its control is absent (UX-DR3): there is no dark row on a Light-only project, and no Remix
    or Preview row on a template surface.
- **R-192 holds in the compact layout.** Reading along:
  - These stay live: selection, the rail, both overlays, dark mode, the device, View as and Preview.
  - These are greyed: Remix and Add section.
- **Everything this story adds is hidden in Preview**, never unmounted (Story 5.15).

**Ask First:**

- The notice: any word other than D4f's, and any row other than D4f's.
- A layout for a satellite that the frames do not draw at 720 or 834, such as the Section Picker or a confirm. Fix
  only what overflows.
- Moving undo and redo (R-143), or making the rail's thumbnails real renders (DW-281).

**Never:**

- **Never block, read or undo browser zoom** (FR-D14, UX-DR17, WCAG 1.4.4).
  - No `maximum-scale` and no `user-scalable`.
  - No ctrl-wheel interception and no gesture interception.
  - No canvas zoom control.
- **Never mount `EditorShell` on a phone.** That means no lock, heartbeat, sync, IndexedDB, live read or Ghost re-read.
  Never add a redirect or a route for the notice.
- **Never grey out Deploy history or Billing on the notice.** They are absent until their stories.
- **Never shrink or relabel the two centred buttons.** Template and View as keep their size and their labels, and undo
  and redo stay in the bar, out of ⋯.
- **Never 44px targets on a fine pointer.** And no 44px pass over the dashboard or any other screen.
- **Never a second menu or panel vocabulary** (R-74).
- **Never edit the design export.**

## I/O & Edge-Case Matrix

Both questions were ruled option 1 by the owner on 2026-09-27: **R-201** (a phone is a touch screen whose shorter side
is under 500px, decided once as the project opens) and **R-202** (a fine pointer takes D8's rearrangement below 1280px).

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Phone opens a project | Coarse pointer, 390 × 844, `/projects/{id}` | D4f: back link, name, avatar, "The editor needs a bigger screen.", then **What works here** holding **Your sites**. No request to `…/lock` or `…/sync`, and no `edit_locks` row. | N/A |
| Phone held sideways | Coarse pointer, 844 × 390 | The notice. Its short side, 390, is under 500. | N/A |
| Phone turned after opening | Notice up, then the device turns | Still the notice: the decision was made at open. | N/A |
| Small tablet | Coarse pointer, 768 × 1024 | The compact editor with 44px targets. | N/A |
| Tablet | Coarse pointer, 834 × 1194 | D8a: a 56px bar, a 56px rail of 44px items with 34 × 24 thumbs, a 44px ⋯, and Controls as an overlay on selection. Every pressable is at least 44px; switches are 52 × 30 in 44px rows. | N/A |
| Large tablet, sideways | Coarse pointer, 1366 × 1024 | D8a. A touch screen always gets the compact layout. | N/A |
| Desktop | Fine pointer, 1440 × 900 | S4a unchanged: both panels docked, the cluster in the bar, no ⋯. | N/A |
| Laptop | Fine pointer, 1280 × 800 | The full editor. | N/A |
| Narrow window | Fine pointer, 1279 × 800 | D8b: a 44px rail of 32px items, the cluster in ⋯, Controls as an overlay, 28–32px targets, hover live. | N/A |
| 200% zoom | A 1440 window at 200%, so 720 × about 406 | D8b as above, and no notice. | N/A |
| Resize across the line | Editor open, a section selected, window crosses 1280 | The layout switches live and any overlay closes. The selection, the journal, the lock and the canvas scroll all survive, and nothing remounts. | N/A |
| Select in compact | A tap or click on a section, a rail item or a Layers row, or its key | The Controls overlay opens, with the scrim from the rail's edge. The fit and the chip do not change. | N/A |
| Close an overlay | Close, a press on the scrim, or Esc | It closes and the selection is kept. Focus returns to what opened it, or to the canvas. | N/A |
| Re-open | A press on the selected section's rail item | The overlay opens again. | N/A |
| Layers overlay | "Show layers", or L, in compact | The Layers panel opens over the canvas. A row press selects that section, closes the panel and opens Controls. | N/A |
| ⋯ menu | Press ⋯ | Rows, each running the control's own action: Site Remix (⇧R), Preview dark mode or Back to light mode (.), Device — {current}, Theme settings, Preview (P). Pressing Device moves to the next device. | A Light-only project has no dark row. The Paywall canvas has no Remix and no Preview, and has a Back to post row. |
| Remix from ⋯ | Confirm Remix | The confirm is visible, the re-roll lands, and one undo takes it back. | The dice is collapsed, so the roll lands at once. Executed: a hidden subtree fires no `transitionend`. |
| Page 2, narrow | Fine pointer, 720, page 2 | The pill is centred, or slides right of the chip. It never overlaps it. | N/A |
| Page 2, tablet | Coarse pointer, 834, page 2 | The pill's two parts are 44px, and the ground's top padding grows so the pill clears the card. | N/A |
| Long project name | 1440 and 720, a 60-character name | It truncates with an ellipsis before the centred group. | N/A |
| Reading along, compact | The lock is held elsewhere | The Remix row and Add section are greyed (R-192). The rail, both overlays, dark mode, the device and Preview stay live. | N/A |
| Harness | `pnpm keyboard`, 1280 × 720, no touch | Today's full editor. Every existing journey is unchanged. | N/A |

</frozen-after-approval>

## Code Map

**Executed at planning** (2026-09-27, the repo's Playwright 1.61.1 on Chromium 149, from the scratchpad; standing rule 1):

- **Pointer emulation.** `hasTouch: true` makes `(pointer: coarse)` true and removes `(any-pointer: fine)`.
  - With `isMobile` and no viewport meta, the layout is 980 wide. Every app page carries `width=device-width`.
  - **With `isMobile`, `innerWidth` grows to fit overflowing content**: a planted 600px box read `innerWidth` 608, while
    `documentElement.clientWidth` and media queries stayed at 390. So:
    - **gate on `matchMedia`, never `innerWidth`**;
    - **measure sideways overflow against `clientWidth`**.
  - A `matchMedia` `change` listener fires on `setViewportSize`.
- **Real 200% zoom.**
  - How: `launchPersistentContext` with `channel: 'chromium'` and `Preferences` →
    `partition.default_zoom_level = ln 2 / ln 1.2`, with the user-data directory on a short path.
  - Result: `innerWidth` 720, DPR 2, `(pointer: fine)`.
  - Control: the same launch without the preference read 1440.
  - `Emulation.setPageScaleFactor` is a pinch, not browser zoom.
- **The phone line.** Playwright's device list:
  - every portrait tablet is under 834 except the iPad Pro 11, including the iPad Mini at 768 and the Galaxy Tab S9 at
    640;
  - many landscape phones are 834 or wider, including the Pixel 7 at 863 × 360 and the iPhone 16 Pro Max at 838 × 390;
  - phones' short sides are at most 484 (a folding phone's cover screen);
  - tablets' short sides are at least 600.
- **A hidden subtree.**
  - A `<dialog>` inside a `hidden` ancestor opens with `open: true`, but it is **invisible (0 × 0) and still modal**,
    and focus does not enter it.
  - A transition inside `display: none` fires **no** `transitionrun`, `transitionend` or `transitioncancel`.
  - Inside `visibility: hidden` the transition runs and ends.

**The editor** — `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (a client component). Anchors:

| Symbol | Line | What it is |
|---|---|---|
| `export function Editor` | :345 | The gate goes here. The body becomes `EditorShell`, so both callers keep importing `Editor`. |
| `layout.tsx`'s `Loaded` | layout :37-49 | One caller. |
| The harness | `app/(app)/app/harness/editor/layout.tsx:207` | The other caller. It mounts `Editor` directly, so it gets the gate. |
| `useFold` | :258-273 | The fold, with its focus handoff and updater. |
| `Rail` | :276-293 | 44px wide, holding one 32px Show button. |
| `stack` | :438 | "The stack a page paints". It is the rail's order. |
| `layers`, `controls` | :779-780 | The two folds. |
| `latest` | :854 | The latest-state ref. |
| `choose` | :1883-1901 | The Paywall canvas maps `choose(null)` to its one instance. Only a non-null `asked` is a customer's pick. |
| `toChrome` | :2353 | Where the skip link and Esc rung 3 land. |
| `run('layers')` | :2376 | The `L` key. |
| `onEscape` | :2427-2451 | The Esc ladder. |
| `reveal` | :2878 | Brings a picked section into view. |
| `remixDice` | :3260 | The handle `⇧R` presses. |
| The header | :3574-3739 | `relative flex h-12`. |
| The name | :3606-3615 | `max-w-[calc(50%-360px)]`. Its own comment asks for a `1fr auto 1fr` grid. |
| `#editor-centre` | :3668 | Absolutely centred. |
| The right-hand cluster | :3681-3738 | See the order below. |
| The body row | :3761 | Holds the Layers aside, the canvas column and the Controls aside. |
| Layers aside | :3762-3825 | `w-[240px]`. |
| Layers rail | :3826 | The folded rail. |
| Canvas column | :3830 | The paywall strip, then the stage. |
| Stage | :3845-3881 | Paddings at :3881: `px-7 py-8`, or `pt-[50px]` on page 2. |
| Card | :3888 | The page card. |
| Chip and pill wrapper | :3998-4040 | Holds `ViewportChip`, `PageTwoPill`, `PaywallNotice` and `SourcePill`. They come after the card, which stays the ground's `firstElementChild`. |
| Controls rail | :4078 | The folded rail on the right. |
| Controls aside | :4090-4247 | `w-[280px]`. The collapse button is at :4118. `EmptyPanel`, "Nothing selected", is at :4245. |

- **The cluster, in order:**
  1. the MEMBERS OFF chip (Paywall only);
  2. `RemixDice` inside `ReadOnly` (absent on a surface);
  3. `ModeToggle`, if dark is on;
  4. `DeviceSwitch`;
  5. the Theme settings `Link`;
  6. `PreviewButton` (absent on a surface);
  7. Back to post (Paywall only).
- **Three things read the bar's source or its children, so keep them.**
  - `dark-mode.test.ts:72` regex-matches the `{darkEnabled ? <ModeToggle … /> : null}` line.
  - The deployed walk's steps 46 and 54 read the cluster's order off the bar's own children.
  - Step 2 reads `#editor-centre`'s box.
- **Every mount side effect lives in `EditorShell`'s effects**, so not mounting it stops them all. The effects:
  - the lock acquire (:1403-1438) and the heartbeat (:1451);
  - the `tabSession` layout effect (:1388);
  - the IndexedDB hydrate (:2714-2790);
  - the autosave and the flushes (:2797-2835);
  - the Ghost re-read (:607-614);
  - the live reads (:2630-2646);
  - the "looked at" write (:865-881).

**Its neighbours:**

- `editor-skeleton.tsx:9-43` — the Suspense fallback. It draws fixed 240/280 panels.
- `busy.test.ts:181-190` — lists the editor in `NO_SKELETON` with its reason. The notice renders inside the route,
  so it needs no `loading.tsx`.
- `apps/web/lib/device.ts:26-49` — `DEVICES`, and `fitFor` = `min(1, w/W, h/H)` over the stage's content box, which
  excludes padding. So bigger touch paddings shrink the fit on their own.
- `components/editor/remix-dice.tsx:58-175`:
  - the `<dialog>` is a sibling of the button in the component's own fragment;
  - `go` starts the cube and `settle` fires `onRemix` on `transitionend`;
  - `onClose` focuses the dice. That is a no-op on a `display:none` die, so focus stays where the platform restores it:
    the ⋯.
  - `/controls` renders it too (R-162).
- `components/editor/page-two-pill.tsx:28` — `absolute left-1/2 top-1`, 38px tall.
- `components/editor/device-switch.tsx`:
  - `ViewportChip` is at :94-105, `absolute left-1 top-1`, with R-138's 4px inset;
  - `DeviceSwitch` is at :33-76.
- `components/editor/source-pill.tsx:125` — `absolute bottom-1`, `h-6`, R-166's 24px.
- The words the ⋯ rows reuse:
  - `components/editor/mode-toggle.tsx:44` — its label is the destination: "Preview dark mode" / "Back to light mode";
  - `lib/remix.ts:88` — `REMIX_WORDS`;
  - `lib/preview.ts:11` — `PREVIEW`;
  - the device labels in `lib/device.ts`.

**The Kit and the menus:**

- `components/kit/select.tsx:174-223` — `Menu` and `MenuItem`: 210px wide, rows with a label and an icon, `onSelect`,
  `active` and `danger`. It is the ⋯ menu's vocabulary; D8a's menu is the same card.
- `lib/menu.ts:69-155` — `openMenu` places and clamps the menu and focuses its first row. `arrowKeys` and `closeMenus`
  are the other two exports.
- `components/kit/shortcut-row.tsx` — the mono `kbd` chip class.
- `lib/keymap.ts` — `KEYMAP`'s `chips` per gesture. `L` is at :109.
- `components/kit/button.tsx:134` — `IconButton` is `size-7`.
- `components/kit/toggle.tsx:32-47` — a 36 × 20 `role="switch"`.
- `components/kit/layers-row.tsx:124-132` — `LayerThumb`, the one generic mini-thumbnail every Layers row draws.
- `components/kit/icons.tsx` — `ChevronLeft` :98, `ChevronRight` :103, `X` :378, `Globe` :593, `Card` :646, `Laptop` :699
  (D8a's Device glyph) and `Panel` :761.

**Shell, tokens and tests:**

- `components/shell/shell.tsx:297` — on an editor path the shell draws `<main>` alone.
  - The user is in scope there, as `Shell`'s prop. It is the notice's avatar.
  - `Avatar` is at `components/shell/account-menu.tsx`; `nameOf` is at `lib/shell-user.ts:11`.
  - The drawer at :416-445 is the precedent for a scrimmed panel.
- `app/globals.css`:
  - `--color-scrim` is `rgba(28,27,26,.4)` (:78), so `bg-scrim/70` is D8's .28;
  - the shadows are at :107-114;
  - the breakpoints, `mobile` 390, `tablet` 834 and `desktop` 1440, are at :126-128;
  - `@custom-variant coarse` is at :321.
- `tokens.test.ts`:
  - :225-230 asserts exactly three breakpoints, so neither 500 nor 1280 is a breakpoint token;
  - :232-235 asserts the `coarse` variant;
  - :44 checks that every shadow token occurs verbatim in the export.
- `editor.test.ts:138-175` — the device tests under `node --test`.
- `components/editor/section-picker.tsx:383` — the one hover-only control in the chrome, already
  `[@media(hover:none)]:opacity-100`. Tailwind 4 already compiles `hover:` inside `@media (hover: hover)`.

**Gates:**

- `tools/keyboard/`:
  - `playwright.config.mjs:17-35` — no viewport, which is 1280 × 720, and `hasTouch: false`;
  - `journey.spec.mjs:150-158` — its first test fails if a pointer API appears in that file;
  - `run-keyboard-gate.sh` — boots the harness and runs in CI's `check` job.
- `tools/probe/run-verify-editor.cjs`:
  - env names at :196-205;
  - step 2 at :436 (S4a regions and the centred group);
  - step 5 at :585 (the folds);
  - **step 14 at :6162-6240**, a `hasTouch` context at 1440 × 900 (pointer coarse), which **now opens the compact
    editor**;
  - step 90 at :4257-4424 (1440 and 1280);
  - step 92 at :4966-4993 (the page-2 pill at 1440 and 1280);
  - the highest step is 96.

## Tasks & Acceptance

**Execution:**

- [x] **`apps/web/lib/floor.ts`** (new — pure and importless, like `lib/device.ts`) — the phone and compact rules.
  - `PHONE = '(pointer: coarse) and (width < 500px), (pointer: coarse) and (height < 500px)'`.
  - `COMPACT = '(pointer: coarse), (width < 1280px)'`.
  - `isPhone({ coarse, width, height })` and `isCompact({ coarse, width })`.
  - A header comment cites R-76, R-87, R-201 and R-202.
  - The two numbers are R-201's and R-202's, and nothing else in the code states them.
- [x] **`apps/web/app/globals.css`** — the variants, the 44px rule and one shadow token.
  - `@custom-variant phone (@media …)` and `@custom-variant compact (@media …)`, each with the same string as
    `floor.ts`.
  - **ONE touch rule** under `@media (pointer: coarse)`, scoped to the editor root (`[data-editor]`). It gives
    `min-block-size` and `min-inline-size` of 44px to:
    - `button`, `a[href]`, `summary`, `select`, `textarea`, and `input` except hidden, checkbox and radio;
    - `[role=button|menuitem|radio|tab|option]`;
    - not `[role=switch]`, and not `[data-skip-canvas]`.

    It is written in `:where()`, so a component can still win. Inline text links stay exempt, because `min-*` does
    not apply to an inline box.
  - Add `--shadow-panel-overlay: -12px 0 40px rgba(28,27,26,.18)`, which is `D8:121` verbatim.
    - **Record its name in `DESIGN.md`'s `elevation:` block as `panel-overlay`** in the same task.
    - `tokens.test.ts:78-86` holds each `--shadow-*` and `DESIGN.md`'s `elevation:` names equal both ways, so a
      token DESIGN.md does not name fails the test.
  - Rewrite the `coarse` comment at :318-320: the editor's ladder now exists.
  - `/kit`'s app-floor row (`app/(app)/app/(authed)/kit/page.tsx:145`) names `PHONE` instead of `pointer: coarse`.
  - `tokens.test.ts:232-235`'s "app-floor is a coarse-pointer condition" asserts the `phone` variant.
- [x] **`apps/web/tokens.test.ts`, `apps/web/editor.test.ts`** — the tests.
  - The two variants' media text equals `floor.ts`'s strings.
  - `isPhone` edges: short side 499 is a phone and 500 is not; portrait and landscape are the same; a fine pointer is
    never a phone.
  - `isCompact`: 1279 is compact and 1280 is not, and coarse is compact at any width.
- [x] **`apps/web/components/editor/small-screen-notice.tsx`** (new) — D4f (`D4:378-430`).
  - A 60px top bar:
    - a 44 × 44 back link to `/`, "Back to dashboard", with a 20px `ChevronLeft`;
    - the project name at 15/600;
    - a 32px `Avatar` from the shell's user. It is decorative, as D4f draws it with no role, and it is absent where
      there is no shell, such as the harness.
  - The message card:
    - D4f's laptop drawing inline, in token colours;
    - "The editor needs a bigger screen." in Bricolage 700 at 22px;
    - "Dragging sections and a 300-pixel control panel don't fit on a phone yet. Open this project on a laptop or
      tablet."
  - **WHAT WORKS HERE**, holding the nav card with **one** row: **Your sites**. It is a 56px `<Link href="/sites">`
    with the `Globe` tile and a `ChevronRight`.
  - The Deploy history card and the Billing row are **absent** (R-118, UX-DR3). Stories 7.23 and 12.5 add them.
- [x] **`apps/web/components/shell/shell.tsx`** — hand the user down on the editor path. The `<main>` it draws there
  provides `user` through a small context (`useShellUser()`), for the notice's avatar.
- [x] **`.../(editor)/editor-skeleton.tsx`** — the skeleton in the device's shape (R-98).
  - A `phone:` twin is drawn in D4f's shape.
  - `compact:` hides the 240/280 panels and draws the rail's column in their place.
  - `aria-hidden` and the one `sr-only` sentence stay.
- [x] **`apps/web/components/editor/remix-dice.tsx`** — make the dice work from ⋯.
  - The `<dialog>` is portalled once mounted, so no collapsed ancestor can hide it.
    - Its target is the dice's `closest('[data-editor]')`, so the 44px rule still reaches its buttons on a tablet.
    - Where there is no editor root it falls back to `document.body`; that is `/controls`.
  - `go()` calls `onRemix()` at once when the die is not rendered (`!die.current?.checkVisibility()`).
  - Both are the executed pitfalls above.
- [x] **`apps/web/components/kit/select.tsx`** — `MenuItem` gains two options.
  - `keys?: string[]`, drawn as the kbd chip, as D8a's "Undo ⌘Z".
  - `href?`, which renders the row as a `next/link`. Theme settings and Back to post are navigations.
- [x] **`apps/web/components/editor/page-two-pill.tsx`, `device-switch.tsx`** (`ViewportChip`) — one row for the chip
  and the pill. The ground holds a single absolute row, `inset-x-1 top-1 grid grid-cols-[1fr_auto_1fr]`, with the
  chip in column 1 and the pill in column 2. The pill is centred when there is room and slides right of the chip when
  there is not, and never overlaps it. The row is `pointer-events-none` and the pill `pointer-events-auto`, so a press
  on the ground under the row still deselects (R-123).
- [x] **`.../(editor)/editor.tsx`** — the gate and the compact layout.
  - **The gate.**
    - `Editor` reads `PHONE` once in the browser, with no subscription.
    - Before it knows, it renders `EditorSkeleton`, as the server does.
    - A phone gets `SmallScreenNotice`. Everything else gets `EditorShell`, which is the old body unchanged.
  - **`compact`** is `useSyncExternalStore` over `matchMedia(COMPACT)`, which is live.
  - **The root** `div` carries `data-editor`: the 44px rule's scope, the dice's portal target and the sweep's.
  - The file's header comment at :203 ("D8b's collapse into `⋯` below 1440") is rewritten for R-202.
  - **The bar.**
    - It becomes `grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]`. The name's `calc(50%-360px)` and
      `calc(50%-510px)` go (R-143), and the name truncates in the left column.
    - `#editor-centre` stays in the middle column.
    - `coarse:h-14`, for D8a's 56px bar.
  - **The cluster in compact.**
    - It stays mounted and `hidden`.
    - The MEMBERS OFF chip stays in the bar.
    - A ⋯ `IconButton`, "More editor actions", opens the Kit `Menu` in a `popover="auto"`, placed by
      `openMenu(…, { side: 'down', align: 'right' })`.
    - The rows, in the cluster's order:
      - Site Remix (`remixDice.current.press()`, inside `ReadOnly`);
      - the dark row (`flip`, words from `ModeToggle`);
      - "Device — {label}" (`pickDevice` to the next of `DEVICES`, with `Laptop`);
      - Theme settings (`href`);
      - Preview (`enterPreview`);
      - on the Paywall canvas, Back to post (`href`).
    - Chips come from `KEYMAP`, and absences follow the controls'.
  - **The left rail.** It is D8's icon rail whenever it is drawn: folded at full width, and always in compact.
    - Its parts, in order: "Show layers", a 1px divider, then one button per `stack` row, then "Add section" (`+`,
      inside `ReadOnly`, only where `canAdd`).
    - Each row button carries `LayerThumb` and is named by `layerName`. The selected row carries `aria-current` and
      `coral-tint`. A hidden row is dimmed and named "…, hidden".
    - Pressing a row button is `choose(pick)`, then `reveal(pick)`.
    - The rail is `coarse:w-14`, with 34 × 24 thumbs on coarse and 26 × 19 on fine.
    - It scrolls on the slim scrollbar.
  - **The overlays** (compact only).
    - One `sheet` state: `'layers' | 'controls' | null`.
    - The existing `#editor-layers` and `#editor-controls` asides are positioned absolutely over the canvas column.
      Controls is 280 on the right with `shadow-panel-overlay`; Layers sits beside the rail.
    - A scrim, `bg-scrim/70`, covers the canvas column only, never the bar or the rail.
    - The canvas column is `inert` while a sheet is open.
    - Controls' collapse button becomes `X`, "Close controls", and Layers' becomes "Close layers".
    - **Opening:**
      - a customer's pick (`choose` with a non-null `asked`) opens `'controls'`;
      - pressing the selected row's rail button re-opens it;
      - "Show layers" and `L` toggle `'layers'`;
      - a Layers-row pick opens `'controls'`, and a bar menu opening closes any sheet (one capturing `toggle`
        listener).
    - **Closing:** the close button, a press on the scrim, Esc, or a new first rung of `onEscape`. Focus returns to
      the element that opened the sheet, or to the stage.
    - `toChrome` in compact opens `'controls'` and focuses its close button.
    - Crossing 1280 closes the sheet.
  - **Paddings.**
    - On coarse, the ground's bottom is 52px, for the source pill's 44px.
    - On coarse page 2, the top is 64px: 4px + 52 + 8.
- [x] **`tools/keyboard/journey.spec.mjs`, `playwright.config.mjs`** — keyboard journeys at 720 × 900.
  - Pin the config's `viewport` to 1280 × 720, saying so, because the gate's width is now load-bearing.
  - Add keyboard-only journeys in a `describe` at 720 × 900:
    - Tab reaches ⋯; its rows arrow and act;
    - a rail item selects and the overlay opens;
    - Esc closes it and returns focus;
    - `L` opens the Layers overlay;
    - the skip link lands in Controls;
    - a Light-only project has no dark row.
- [x] **`tools/keyboard/floor.spec.mjs`** (new; add it to the config's `testMatch`; taps are allowed here, not in
  `journey.spec.mjs`) — the touch journeys. Playwright's iPhone and iPad descriptors default to WebKit; drop
  `defaultBrowserType` so they run in the gate's Chromium.
  - A phone draws the notice and **sends no `…/lock` or `…/sync` request**. The control: the tablet context sends one.
  - Turning the phone keeps the notice.
  - At 768 × 1024 and at 834 × 1194, a tablet draws the compact editor and passes the **44px sweep**.
    - The sweep covers every visible pressable in `[data-editor]`, including the ⋯ menu's rows once it is open.
    - Its only exemptions are inline links, the skip link and switches; switches must be 52 × 30 in 44px rows.
  - 1279 is compact and 1280 is not.
  - At 720 page 2, the pill's box and the chip's box do not intersect.
- [x] **`tools/probe/run-verify-editor.cjs`** — the deployed walk (R-82).
  - **Step 14** is re-expected: its context is coarse, so the editor is compact. The Controls overlay opens on the
    tap, so close it before the tap into the headline.
  - **Step 97, a phone on production** (the iPhone 13 descriptor, in Chromium):
    - the notice matches D4f;
    - Your sites reaches `/sites`;
    - **no `edit_locks` row** for the project after 5s. The control is step 98's tablet, which leaves one.
  - **Step 98, the iPad Pro 11 descriptor:**
    - the page matches D8a;
    - the 44px sweep passes;
    - the overlay leaves `fitFor`'s chip words unchanged;
    - ⋯ and its rows work.
  - **Step 99, real 200% zoom** (the persistent-context method above): D8b, `(pointer: fine)`, no notice, hover live.
  - **Step 100, the 390 sweep** at 390 × 844 with touch:
    - Dashboard, sign-in, `/sites` and `inflozo.com/`;
    - `scrollWidth <= clientWidth` on each;
    - zero axe violations on each.
- [x] **Docs** — each change is also a Dev-phase edit, and the words here are exact.
  - **`epics.md`, Story 7.23:** after "…because it is what the Small Screen Notice offers", add ", and this story adds
    D4f's Deploy history card to that notice — the live version and a one-tap Roll back to the one before it — which
    Story 5.22 built without it (R-118)".
  - **`epics.md`, Story 12.5:** after "…one of the three things the Small Screen Notice offers", add ", and this story
    adds D4f's Billing row to that notice, which Story 5.22 built without it (R-118)".
  - **`epics.md`, Story 13.1:** add "**And** the board is **fully usable at 390** (UX-DR16, FR-D1)".
  - **`epics.md`, Story 7.18:** add "**And** in the compact bar (Story 5.22, D8a · D8b) Ship it stays in the bar,
    right of ⋯, and is 44px on a touch screen".
  - **`epics.md`, Story 1.3's "collapse ladder is `R Responsive System`'s":** add "*(the app's own ladder is D8 —
    Story 5.22; R Responsive System is the library's, `EXPERIENCE.md:78-81`)*".
  - **`EXPERIENCE.md:59-60`:** move **Sites** and **Deploy History** into the 390 row, because the notice offers both
    and R-76 names "the sites list" as working from a phone. `DESIGN.md:380` already says so.
  - The rulings' own words already landed at Create, in every place R-201's and R-202's targets list. Dev does not
    repeat them.
  - **`tools/doc-audit.py`:** a catalogue row for `tools/keyboard/floor.spec.mjs`.

**Acceptance Criteria:**

- Given a phone (R-201), when a project opens, then the page **matches frame D4f**. The differences are only the
  recorded ones: Deploy history and Billing are absent, and the avatar is the user's initial. The server's first paint
  is the notice-shaped skeleton, never the editor's.
- Given a touch screen that is not a phone, when a project opens, then the editor **matches frame D8a**. The recorded
  deviations are in Design Notes. Every visible pressable in the editor is at least 44 × 44, and switches are 52 × 30
  in 44px rows.
- Given a fine pointer below 1280 (R-202), including a 1440 display at 200% browser zoom, when a project opens,
  then the editor **matches frame D8b**. Hover is live, targets stay at 28–32px, and the notice never appears.
- Given a fine pointer at 1280 or wider, when a project opens, then the editor is S4a as it is today. The deployed
  walk's steps 2, 5, 46, 54, 90 and 92 still pass.
- Given any width from 720 up with either pointer, on a page canvas and on the Paywall canvas, when the bar is drawn,
  then the centred group's box intersects neither side of the bar. When page 2 is shown, the pill's box never
  intersects the chip's box.
- Given browser zoom at any level, when a page loads or the zoom changes, then nothing in the app sets `maximum-scale`
  or `user-scalable`, and nothing intercepts ctrl-wheel or pinch. The chip reports the fit in CSS pixels, so browser
  zoom and the canvas scale never meet.
- Given a phone, when the Dashboard, Sign In, the sites list or a marketing page opens, then it is fully usable at 390:
  no sideways overflow measured against `clientWidth`, and zero axe violations. Billing and Suggestions are not built;
  their stories carry the criterion.
- Given an open editor, when the window is resized across 1280 or the zoom changes, then the layout follows. Nothing
  remounts: the lock row, the journal and the selection are unchanged.
- Given the finished story, when the gates run, then `pnpm check`, `pnpm keyboard` (the journeys and `floor.spec.mjs`)
  and the doc gate are green.

## Spec Change Log

**Dev (2026-09-27).** Each entry is outside the frozen block and was made where the build met a fact the plan did not
have; none changes what a surface does.

1. **The bar's side tracks are `minmax(min-content, 1fr)`, not `minmax(0, 1fr)`.** Measured in the harness at every
   width and on both canvases: with `minmax(0, 1fr)` a side's fixed controls can overflow their track and be drawn over
   the centred group — on the Paywall at 720 the NOT A PAGE SECTION chip alone does, and on touch the left column's 44px
   controls need about 762px. So each side keeps its content's minimum, and the three things that may give way — the
   project name, the Paywall's chip and the MEMBERS OFF chip — contribute nothing to it (`w-0 grow max-w-fit`: they grow
   to their own width and no further, and truncate first). `#editor-centre` is `w-max`, so Template and View as never
   shrink ("never shrink or relabel"). On touch the bar takes D8a's own 6px padding and gaps (`D8:42`). Result: at every
   width from 720 (fine) and 768 (touch) up, on Home and on the Paywall with members off, no control meets the group, and
   the group is centred (the Paywall's slides at most 8px). Below the AC's floor, only the Paywall with members switched
   off runs short, under about 654px on touch: DW-283. The back link is `shrink-0` — at 720 it was squeezed to 15px.
2. **The MEMBERS OFF chip moved from the cluster's first child to the right column, just before the cluster**, so it stays
   in the bar while the cluster is hidden. Steps 46 and 54 read the cluster's children by id, which the chip has none of.
3. **Three reads of the bar's source or children beyond the three the Code Map lists.** Step 90 found the name as
   `header > span.truncate`; the grid puts it in the left column, so the walk reads `header span.truncate`. Step 9
   asserted the editor's canvas streams in the server HTML; the gate means the server never draws the editor (the Design
   Notes' "check each one"), so it now asserts the skeleton's sentence and no canvas on every open. Step 14 is
   re-expected as the Tasks say.
4. **The icon rail draws its right rule with `after:`** rather than a border, so "Show layers" sits in a head exactly 44
   wide: step 5 reads the Show button's parent for "a 44px rail with one Show button", and a border would have made it 43.
5. **`MenuItem` gains a third option, `readOnly`**, beside `keys` and `href`: the Remix row "inside `ReadOnly`" is that
   row's button in the Kit's fieldset, and rows carry `disabled:opacity-35` so a greyed row reads greyed (R-192).
   `lib/menu.ts`'s `openMenu` and `arrowKeys` now skip a disabled row — `focus()` on one is a no-op, so reading along the
   ⋯ opened with focus outside it and the arrows stuck. The Kit's kbd chip class is exported from `shortcut-row.tsx` and
   shared, so the card's chips and the menu's are one.
6. **A tap that opens the Controls overlay cancels its own `touchend`.** Executed on the harness with the guard taken out:
   the tap's compatibility click was hit-tested again after the overlay drew, landed on the scrim and closed it at once;
   under the finger on the right it would press whatever control the overlay put there. `floor.spec.mjs` taps where the
   scrim lands and counts the clicks, and goes red without the guard.
7. **Three components' own sizes outrank the 44px rule** (a utility beats `@layer base`, as designed), and each is sized for
   touch inside the editor only (`coarse:in-[[data-editor]]:`): the Kit's `Toggle` is D8a's 52 × 30 with a 24px knob in a
   44px row; the link picker's `min-h-[38px]` becomes 44; and a Layers row's gaps drop to 4px, because on the main feed's
   row D5c's chip left the name 32px to press. The sweep found nothing else, over every section's panel with every
   group open.
8. **The Section Picker, on touch** (the Ask First case): its card foot is a fixed 41px strip, so the 44px Add overflowed
   it and the tier pill spilled over the Add. Fixed only that: the strip is 64px on touch, and the right column is
   clipped to its track. Its cards are still too narrow at 720–834 to show a name — pre-existing at 720 on a mouse — which
   is a layout the frames do not draw: Question 3.
9. **The ⋯ rows' glyphs** are the controls' own where they draw one — Remix the Kit's `Refresh` (B8's), the sun's
   `Sun`/`Moon`, D8a's `Laptop` for the device, B3a's eye for Preview — and an empty glyph slot for Theme settings and
   Back to post, which are words at 1440 (R-92), so every row's words line up as D8a's do.
10. **D4f's two grey bars** are a warm grey no token carries; they are drawn in `grey-track`, the nearest, and the
    rounding is named in the component, as `ViewportChip` names its.
11. **The keyboard harness gains a fourth header**, `x-inflozo-harness-dark: off`, for the Light-only journey.
12. **Story 1.3's note cites `EXPERIENCE.md:79-82`**, where the "R Responsive System is not this app's responsive spec"
    blockquote actually is; the Docs task's words said 78-81.
13. **Two findings are recorded, not fixed:** DW-282 (a pre-existing duplicate React key in the settings panel, seen
    while driving the compact editor and confirmed at 1440 on untouched code) and DW-283 (item 1's short Paywall).
14. **A confirm open in a panel closes as the window crosses 1280** (found at the task audit, executed in the harness).
    At 1280 the panel's "Reset this design?" confirm was opened, and the window narrowed to 1000: the Controls aside became
    `hidden`, and the modal `<dialog>` inside it stayed open, modal and 0 × 0, so every press on the editor was blocked by a
    confirm nobody could see (the planning's hidden-subtree pitfall, met by a resize instead of a collapse). The layout
    effect now closes any open dialog in the editor that is no longer rendered, which is the Cancel it would have been, and
    the matrix's "any overlay closes" holds for confirms too. A journey proves it, and goes red with the line taken out.
15. **The Paywall's NOT A PAGE SECTION chip is whole or absent** — this supersedes item 1 for that chip. Shrinking beside
    the name, it read "NO" at 720 while the name had shrunk to nothing, and "NOT…" beside a one-letter name on an iPad Pro
    11 (measured). It never shrinks now, and below 1280 it is not drawn (`compact:hidden`): the ink bar and the strip under
    it already say the canvas is not a page. The name gets the room back (22px → a readable few letters at 720, 53px at 834
    on touch), the group is centred on the Paywall at 720 too, and DW-283's short Paywall moves from about 654px to about
    628px (re-measured, and DW-283 rewritten to say so).
16. **The matrix audit added coverage the Tasks did not list.** `floor.spec.mjs`: a phone opened sideways (844 × 390), a
    large tablet sideways (1366 × 1024, touch) that is compact at a width a mouse would get the full editor at, and D8b's
    sizes at 1279 (a 44px rail of 32px items, 26 × 19 thumbs, a 28px ⋯), hover lighting a rail item, a click opening the
    overlay with the scrim at the rail's edge, and the scrim's click closing it. The journey: the crossing test now carries
    an edit made below 1280 and undone at 1280 (the journal) and the canvas's scroll across the line; the rail test presses
    Controls' own Close and measures the scrim's edge; reading along acts on the device, dark and Preview rows and opens
    Layers with `L`; and item 14's confirm. A last `floor.spec.mjs` test is the fifth criterion itself: the bar at 720, 900,
    1100, 1279, 1280 and 1440 on a mouse and at 768, 834, 1024 and 1366 on touch, on Home and on the Paywall, with the
    centred group meeting neither side and no control outside the window — red when the group is moved over the left side
    (the control, executed), and green with the spec's own `minmax(0, 1fr)` too now that item 15 took the chip out of the
    compact bar. The deployed walk gains **step 101**: a 1440 window with a section chosen,
    narrowed to 1279 and widened again, with the lock row read before and after each crossing (the holder and the
    generation unchanged) and an expando on the editor root and on the canvas window surviving both — the criterion's
    "nothing remounts: the lock row, the journal and the selection are unchanged", on the real database.

## Design Notes

**Why the gate lives inside `Editor`, and not in a route or a redirect.**

- Every mount effect, the lock above all, starts in `Editor`'s effects, so a phone is kept out only by never mounting
  it.
- The server cannot know the pointer, and R-98's second effect makes a `redirect()` behind the Suspense boundary a
  client navigation anyway.
- The harness mounts `Editor` directly, so the gate is testable in CI.
- The cost: `EditorShell` no longer renders on the server, and the skeleton stays until hydration. TTI is interactive
  time, which that HTML never gave (5.23 measures it). Any walk step that reads the editor's server HTML now finds the
  skeleton; check each one.

**Why the phone is decided once, at open** (R-201). The layout viewport changes under an editor in use: the device
turns, split view, and some browsers' on-screen keyboards. A live re-check would unmount the editor mid-edit.
Deciding at open costs one case: a small tablet opened in a narrow split view keeps the notice until a reload.

**One rearrangement, and the pointer changes only target sizes.** This is `D8:33`: "What separates the two frames is
the pointer, not the layout".

- The 44px rule is one CSS rule because D8a's caption says 44px is "the only thing this width changes about the
  controls themselves" (`D8:167`). A per-component pass would miss the next control.
- Switches are drawn 52 × 30 in 44px rows (`D8:152`, `:156`), so they are exempt from the rule and sized to the frame.
- UX-DR16's "Layers collapses first" is read as D8a's order. Both panels are drawn collapsed at both widths, so they
  change together at one line.

**Recorded deviations from D8a and D8b** (routine calls, R-74):

- The Controls overlay is the sidebar's own 280px. The frame's text says "at its usual width" and "its 280px"
  (`D8:33`, `:298`), while its drawings measure 320 at 834 and 288 at 720.
- The persistence indicator is R-142's icon, inline. D8a stacks "Saved" under the name.
- Undo and redo stay beside the indicator (R-143). D8a puts them in ⋯.
- There is no Export row. S4a's bar has no export control, and Ship it's own menu carries "Download theme" (S4d, Story
  7.18).
- Ship it is absent until 7.18 (R-118).
- View as keeps its chevron at 720. R-171 gives both triggers one look.
- D8a's and D8b's foot cards are designer annotations and are not built. D8b's reads "Hover states are live here".
- The rail's thumbnails are the Layers rows' own generic `LayerThumb`. D8a draws one per category (DW-281).
- The folded Layers rail at full width becomes D8's rail too: one rail, not two.
- The ⋯ rows follow the cluster, which postdates D8. So the rows are Remix, dark mode, the device, Theme settings and
  Preview.
- "Device — Tablet" is one row that moves to the next device, because the menu is "one item deep" (`D8:293`).

**Why a grid, twice.**

- **The bar.** `minmax(0,1fr) auto minmax(0,1fr)` centres the group on the bar at 1440, as S4a draws. A grid never
  overlaps its columns, so "never meets" holds by construction, and the name truncates in its column. That retires
  the `360px` constant, which its own comment said would need this (R-143's "re-tunes the name's truncation").
- **The chip and the page-2 pill.** A `1fr auto 1fr` row keeps D5d's pill centred while there is room. It then slides
  it right of the chip instead of letting the two meet. That is "one of the two moves", decided by the floor.

**The notice.**

- Deploy history and Billing are absent (R-118, UX-DR3). 7.23 and 12.5 already name the notice; the Docs task makes
  them add their rows.
- The avatar is decorative, as D4f draws it with no role. The owner's ruling of 2026-09-05 moved the dashboard's phone
  avatar into ☰ because it duplicated the drawer's; the notice has no drawer to duplicate.
- The copy is D4f's verbatim, including "300-pixel".
- Its sites row is why **Sites is a 390 surface**. R-76 and `DESIGN.md:380` already say so. `EXPERIENCE.md:60`'s
  tablet-only row is the stale one.

**What the rulings changed at Create** (2026-09-27).

- **R-201** amends R-87's 834. It reached:
  - the register (its entry, and R-76's and R-87's rows);
  - `epics.md` (FR-D1's summary, UX-DR16 and this story's card);
  - `EXPERIENCE.md` (§ Foundation, the IA row, the Editor states row and § Responsive & Platform);
  - `DESIGN.md` (`app-floor` and § Layout & Spacing);
  - the R-76 summaries in `HANDOVER.md` and `build-sequence.md`;
  - the walkthrough: `app.js`'s `needsBigScreen` now takes the height, and `_selfcheck.html`'s five floor checks pass
    in Chromium.
- **R-202** reached the register (its entry, and R-143's consequence), UX-DR16, this story's card, `EXPERIENCE.md`
  and `DESIGN.md`.
- **`prd.md` FR-D1 is unchanged.** It states the device test with no number, as R-87 left it.

**Deferred work this story leaves as it is.**

- DW-222 and DW-236 name "Story 5.22's responsive pass" as a likely owner. This story touches neither step 36, nor the
  pill's placement at full width, nor `film()`. Their owner lines now say so.
- `inflozo.com/terms` and `/privacy` still answer 404 from the sign-in footer. Epic 14 owns them
  (`sign-in/page.tsx:73`).

## Verification

**Commands** (Node 24 on PATH):

- `pnpm check` — expected: green, including `editor.test.ts`, `tokens.test.ts`, `busy.test.ts`, `dark-mode.test.ts` and
  `placeholder-menu.test.ts`.
- `pnpm keyboard` — expected: every journey green, including the 720 ones, and `floor.spec.mjs` green.
- `python3 tools/doc-audit.py --check`, run twice — expected: exit 0.
- `node tools/probe/run-verify-editor.cjs`, with `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `VERCEL_TOKEN` and
  `VERCEL_TEAM_ID` from `tools/probe/.env`, by name — expected: 0 FAIL, including steps 97–101 and the re-expected
  steps 9, 14 and 90.
- `pnpm build` (CI's own step) — expected: exit 0.

**Results (Dev, 2026-09-27, Node 24; the counts are the runs' own output, not restated).**

- **`pnpm check`** — exit 0: lint, typecheck, and every package test; `tokens.test.ts` (the variants equal to
  `lib/floor.ts`, the phone variant a coarse pointer in every branch, `panel-overlay` named in DESIGN.md) and
  `editor.test.ts` (R-201's and R-202's edges) among them, with `busy.test.ts`, `dark-mode.test.ts` and
  `placeholder-menu.test.ts` green; `check-snapshots: PASS`.
- **`pnpm keyboard`** — 97 passed, 0 failed, in one run of the final tree: every existing journey unchanged at the pinned
  1280 × 720, the Story 5.22 journeys at 720 × 900 and the confirm-on-crossing one, and every `floor.spec.mjs` test.
- **`pnpm build`** — exit 0 (a local production build, CI's own step).
- **`python3 tools/doc-audit.py --check`**, twice — PASS, after the first run regenerated INDEX and the story board.
- **Controls executed, each red with its fix taken out and green with it:** the tap guard (change log 6 — the tap's click
  landed on the scrim); the confirm on crossing (14 — `dialog[open]` stayed, 0 × 0 and modal, and a press on ⋯ timed
  out); the bar sweep (16 — red with the centred group moved over the left side).
- **Executed in the harness, beyond the gates:**
  - the server's HTML is the skeleton on every open (no `data-editor`, no canvas), and with JavaScript OFF the skeleton
    already takes each shape by CSS: D4f's 60px bar on the iPhone 13, a 56px bar and the rail's column on the iPad Pro
    11, S4a's 48px bar at 1440;
  - REAL 200% browser zoom (a persistent profile zooming every page): a 720 window at DPR 2, a fine pointer, ⋯ and the
    rail with 32px items, hover lighting a rail item, and no notice — against the same launch at 100%, a 1440 window with
    the full editor;
  - screenshots against the frames: D4f on the iPhone 13 (the harness has no shell, so no avatar), D8a on the iPad Pro 11
    at rest, with ⋯ open and with Controls over the page, D8b at 720 with Controls over the page, and S4a at 1440;
  - the bar at 720, 900, 1024, 1100, 1279, 1280 and 1440 on a mouse and at 600–1366 on touch, on Home and on the
    Paywall, members on and off (change log 1 and 15; DW-283 re-measured at about 628px);
  - on touch: a Layers row's tap hands over to Controls, which stays open; a rail item's tap opens it; ⋯'s Device row's
    tap moves the device and closes the menu;
  - Question 3's claim: the Section Picker's cards are 85px wide at 720 on a mouse and 97px on the iPad Mini, each name
    cut to one letter (225px and whole at 1280);
  - Sign In and the marketing home at 390: the home has no sideways overflow and zero axe violations; Sign In answers 500
    in the harness (no Supabase), so step 100 is its first real reading.
- **The deployed walk runs after this push**, once CI's `deploy` has put this commit on `app.inflozo.com`: the walk
  refuses to start unless Vercel serves HEAD and the tree is clean. Its results — steps 97–101 and the re-expected 9, 14
  and 90 — are recorded here by the next Dev commit.

**Real infrastructure** (R-82):

- **Vercel** — the deployment READY for the Dev commit.
- **`app.inflozo.com`** — the editor as a phone, a tablet, 1280 and 1279, and real 200% zoom.
- **`inflozo.com/`** — the 390 sweep.
- **Supabase** — the walk's throwaway accounts, and `edit_locks` read for the phone's no-row claim and the tablet's
  control.
- **Not touched and not claimed:** Ghost T1 and T3, Resend and Dodo. This story calls no Ghost API. The Ghost 5
  Project's surfaces are Story 5.21's, and only appear in its canvas.

## Owner's manual test

Do this on the real site after Deploy confirms the build. You need your phone and your laptop; an iPad is optional.
Both questions are ruled (R-201, R-202), and these steps follow them.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Pilot sections, on your **phone** | Open the link. Sign in if asked. | — | No editor. A card with a laptop drawing: **The editor needs a bigger screen.** Under **What works here**, one row: **Your sites**. The project's name is at the top with a back arrow. |
| 2 | same | Phone | Turn the phone sideways, then back. | — | The same card both ways, never the editor. |
| 3 | same | Phone | Tap **Your sites**. | — | Your sites list, readable without sideways scrolling. |
| 4 | `https://app.inflozo.com/` | Phone, Projects | Go back, and tap the notice's back arrow. Scroll the page. | — | Your projects, nothing cut off at the right edge. |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | **Laptop**, window about 1440 wide | Open the project. | — | Today's editor, unchanged: Layers on the left, settings on the right, every top-bar button in view. |
| 6 | same | Laptop | Drag the window narrower than about 1280 (half your screen is enough). | — | The Layers list becomes a thin strip of small tiles on the left. The settings panel is gone. The top bar shows **Template**, **View as** and a **⋯** button on the right. |
| 7 | same | Narrow window | Click a section on the page. | — | Its settings slide in over the page from the right. The page behind goes darker except the tile strip, and it does not move or shrink. |
| 8 | same | Narrow window | Click the darker page area. Then click a different tile in the strip. | — | The panel closes and the section stays outlined. Clicking the tile selects that section, brings it into view and opens its settings. |
| 9 | same | Narrow window | Press **L**. Click a row in the list that appears. | — | The full Layers list opens over the page. Clicking a row closes it and opens that section's settings. |
| 10 | same | Narrow window | Click **⋯**, then **Device — Desktop**. Open **⋯** again. | — | The menu lists Site Remix, Preview dark mode, **Device — Desktop**, Theme settings and Preview. After the click the page becomes tablet-sized, and the menu now reads **Device — Tablet**. |
| 11 | same | Narrow window | Click **⋯ → Site Remix**. | — | The Remix question appears, the same one the dice asks. Close it. |
| 12 | same | Laptop | Widen the window back. | — | Everything is back where it was, and the section is still selected. |
| 13 | same | Full width | Press **⌘ +** five times, to 200%. Point at the tiles. Then press **⌘ 0**. | — | At 200% the narrow layout with bigger text, tiles lighting under the pointer, and no "bigger screen" card. ⌘ 0 brings the full editor back. |
| 14 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Ghost 5 Project, Home, narrow window | Click the post grid, choose **Preview page 2**, then narrow the window slowly. | — | The dark **Page 2 · Back to page 1** pill and the small size label in the corner never overlap. The pill moves right to make room. |
| 15 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | **iPad**, if you have one | Open the project. Tap a section, then **⋯**. | — | The narrow layout with bigger, finger-sized buttons. Settings slide over on a tap. |

## Questions for the owner

### Question 1 — Which touch screens count as a phone and get the notice instead of the editor?

**In plain English.** Your ruling R-87 draws the line at 834 pixels wide. A touch screen narrower than that is a phone
and gets the "The editor needs a bigger screen" notice; one 834 or wider is a tablet and gets the editor. I checked it
against the device sizes the test browser records (Playwright's device list, 2026-09-27). That line puts most real
tablets, and many phones, on the wrong side:

- **Held upright, every tablet in the list except the iPad Pro 11 is narrower than 834.** An iPad Mini is 768, a
  7th-generation iPad 810, a Galaxy Tab S9 640. They would get the phone notice.
- **Turned sideways, many phones are wider than 834.** A Pixel 7 is 863 × 360, an iPhone 16 Pro Max 838 × 390. They
  would get the tablet editor, squeezed into a strip about 360 pixels tall.
- **The short side separates them.** Every phone in the list is under 500 pixels on its short side; the widest, a
  folding phone's cover screen, is 484. Every tablet is 600 or more.

**An example.** Someone opens their project on an iPad Mini held upright. Under R-87 as written they are told to "open
this project on a laptop or tablet" — while holding a tablet.

1. **Go by the short side, decided once when the project opens (RECOMMENDED).**
   - A touch screen whose shorter side is under 500 pixels is a phone, and it gets the notice whichever way it is held.
   - Every tablet gets the editor both ways, and a folding phone opened flat counts as a tablet.
   - Deciding once means turning the device, or the keyboard sliding up, never swaps the editor out from under you
     mid-edit.
2. **Keep R-87's 834 on the width, decided once when the project opens.**
   - Only a tablet 834 or wider gets the editor held upright: the iPad Pro 11 does, and most tablets do sideways.
   - A phone opened sideways gets the tablet editor.
3. **Keep R-87's 834 on the width, checked again whenever the device turns.**
   - As option 2, but turning a small tablet sideways swaps the notice for the editor.
   - Turning it back swaps the editor for the notice. Anything unsaved is sent first.

**Ruled: option 1 (owner, 2026-09-27)** — *"Go by the short side, decided once when the project opens."* Recorded as
**R-201**, amending R-87's 834.

### Question 2 — From what window width does the editor switch to its compact layout?

**In plain English.** The drawings give the editor two layouts.

- **The full one** (S4a, drawn at 1440) keeps the Layers list on the left, the settings panel on the right, and every
  top-bar button in view.
- **The compact one** (D8, drawn at 834 and at 720) changes three things:
  - Layers shrinks to a strip of thumbnails;
  - the settings panel slides over the page when you pick a section;
  - the top bar's right-hand buttons — Remix, dark mode, device, Theme settings and Preview — move into one ⋯ menu.

The story already says a touch tablet always gets the compact one. The drawings do not say at what width a
mouse-and-keyboard window should switch.

**An example.** On a 13-inch laptop 1280 wide, today's full editor fits and shows your page at about half size (49%).
The compact one would show it at about three quarters (76%). The Layers names and those five buttons would then be one
click away instead of in view.

1. **Below 1280 (RECOMMENDED).**
   - Every laptop 1280 or wider keeps today's editor.
   - Narrower windows, and 200% zoom, get the compact one.
   - Everything still fits at 1280 today. The top bar's buttons are 44px apart, and the page-2 pill clears the size chip
     by 38px (measured 2026-09-22).
2. **Below 1440, as the D8 drawing's title reads ("The editor below 1440").** 1280 and 1366 laptops get the compact
   editor too.

**Ruled: option 1 (owner, 2026-09-27)** — *"Below 1280."* Recorded as **R-202**.

### Question 3 — On a tablet, the Section Picker's cards are too narrow to show their names. How should it lay them out?

**In plain English.** When you press **+ Add section** on a tablet, or in a laptop window narrower than about 1,000
pixels, the picker still lays its cards out in the columns it uses on a big screen. Each card is then only about 85–120
pixels wide, so a design's name is cut to its first letter and its Free or Pro tag is cut off.

- It is not new on a narrow laptop window, but a tablet now opens the picker too, and the drawings show the picker only at
  full width.
- This story made the card's **+** finger-sized on a touch screen and stopped the tag spilling over it. It did not change
  the layout, because the story says to ask first.

**An example.** On an iPad mini, the Latest Post card shows "L." beside its **+**, and its Pro tag is hidden.

1. **Fewer, wider cards on narrower screens (RECOMMENDED).** Below 1280 the picker shows two columns of cards, and one
   below about 600 pixels, so every card has room for its name, its **+** and its Free or Pro tag. The same cards and the
   same words; only the number of columns changes.
2. **Keep the columns, and give each card's foot two lines.** The name on the first line, the tag and the **+** on the
   second.
3. **Leave it as it is** until Claude Design draws the picker at 834.

**Ruled:** _(awaiting the owner)_
