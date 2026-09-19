---
title: 'Story 5.7 — Device preview, and the canvas as a viewport'
type: 'feature'
created: '2026-09-19'
status: 'in-review'
owner_test: pending
baseline_commit: '5f3b60cb7ff0925e9f19ce964fc5a40c1e7fe0d0'
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

After this story you can check a design on a phone or a tablet without leaving the editor: three small
device buttons appear at the right of the top bar, and pressing one turns the page in the middle into a
real phone-shaped or tablet-shaped screen — the right width **and** the right height, so a sticky header
sticks, a full-screen hero fills a screen, and the fold is where the fold will actually be.

A small grey chip over the canvas tells you the true size and how much it has been shrunk to fit your
monitor — "viewport 390 × 844 · shown at 55%". There is deliberately no zoom knob: the shrinking is worked
out for you and only reported, because a second knob that changes apparent size invites people to mistake
it for the first.

**Desktop changes too, and you will see it the moment you open the editor** (your ruling R-137): the page
now sits in the middle of the grey as a real 1440 × 900 screen with a rounded bottom edge, instead of
filling the window down to the bottom. You see about a third less of your page at once — and in exchange
the fold on desktop is where a visitor's fold will actually be.

## Intent

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

**Problem:** The canvas is 1440 CSS pixels wide and as tall as whatever space is left in the window. Nothing
can be checked at a phone or a tablet size, and no height on the canvas is a height a visitor will ever
have — so `100vh`, `position: sticky`, `position: fixed` and the fold are all being designed blind. More
than twenty designs across fifteen categories depend on that geometry (`prd.md:565`).

**Approach:** Give the canvas a **device viewport** — a width *and* a height picked from three named
devices — and fit that viewport into the space available with a single automatic scale, reported in a mono
chip and controlled by nothing. The iframe keeps real CSS pixel dimensions so media queries fire and `vh`
resolves honestly; the CSS `transform: scale()` that fits it on screen never touches the CSS pixel viewport,
so it cannot change which breakpoint applies (`prd.md:569`).

## Boundaries & Constraints

**Always:**
- The iframe's **CSS pixel size is the device size**, and the fit is a `transform` over it. Never scale by
  changing the iframe's width.
- **Fit to BOTH axes, capped at 1:** `fit = min(1, stage.width / device.width, stage.height / device.height)`.
  Never magnify.
- A device change is **a style change, never a repaint**: the canvas document is not reloaded, `paint()` is
  not called, nothing re-stamps. Every section root is the same node before and after, so the selection, the
  stamps, the inline caret and the canvas scroll all survive it — 5.6's flip is the precedent
  (`editor.tsx`'s `flip`), and this is the weaker, cheaper case.
- The device is **session state**, like the mode: it lives in `editor.tsx`, survives a canvas switch because
  the component stays mounted, and resets to Desktop on reload. No column, no migration, **no Schema phase**.
- The three buttons are a **radio group**, keyboard-operable through the Kit's own `radioKeys` / `tabStop`,
  each with an accessible name and a hover `title` (R-136's carve-out — a 48 px bar cannot hold three words).
- The chip carries **words, not only a percentage** (UX-DR8), and it re-reads whenever the stage changes —
  a fold, a window resize, a device change.
- **R-137: Desktop is a viewport too — 1440 × 900.** The page card takes the active device's size rather
  than the room available, is centred in the ground, and carries its 6 px radius on **all four** corners
  instead of standing on the bottom of the window. One rule for three devices; no state where the card
  fills the height.
- R-123 survives: the ground around the page card still deselects on a primary press. The centring must not
  introduce a third element between the `<section aria-label="Canvas">` and the card, or `e.target ===
  e.currentTarget` stops being true and a press on the ground stops working.

**Ask First:**
- Any second scale, zoom, or "Fit / %" control — B11 draws one and UX-DR17 removed it. If the fit is ever
  genuinely unusable, that is a question, not a control.
- Anything that would change the resting canvas beyond what **R-137** settles. The card's geometry is
  B11a's; its ground, ink, shadow and 6 px radius are S4a's and are not in play.

**Never:**
- **No zoom control.** B11's drawn "Fit / 55%" picker is not built (UX-DR17, UX-DR20).
- **No per-breakpoint editing.** Sections are auto-responsive; a control changed at 390 is the same value at
  1440 (FR-D8).
- **No `1` `2` `3` shortcuts here.** The global map is Story 5.9's, entire — the same reason 5.6 built the
  sun and not `.` (FR-D11, EXPERIENCE.md:387).
- **No overflow-menu collapse.** D8b draws "Device — Tablet" inside the `⋯` at 834/720; that is Story 5.22's
  responsive floor (UX-DR18). This story builds the bar at 1440 as S4a draws it.
- **No scroll restoration.** Re-laying the page out at a new width moves the scroll; leave the browser's own
  behaviour rather than inventing a policy nothing specifies.
- **No fps measurement.** NFR-1's 60 fps / p95 ≤ 16.7 ms / no-long-task-over-50 ms gate is manual-only on the
  reference laptop at 4× throttle and belongs to Story 5.23. This story owns FR-D14's other two clauses: that
  **nothing caps sections per template**, and the **lockup bound** — no main-thread block over 5 s — which is
  measurable where the fps gate is not.
- Device preview is **display only** and has nothing to do with a Preview-only connection (Appendix I).

## I/O & Edge-Case Matrix

The worked stage is the owner's own 1440 laptop: 1440 − 240 (Layers) − 280 (Controls) − 56 (`px-7`) = **864
wide**, and 900 − 48 (top bar) − 24/48 (`pt-6`/`py-6`) ≈ **828 tall**.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Desktop (the default) | stage 864 × 828, device 1440 × 900 | `fit = min(1, .600, .920) = .600`; chip *"viewport 1440 × 900 · shown at 60%"*; iframe 1440 × 900 | N/A |
| Tablet | same stage, device 834 × 1112 | `fit = min(1, 1.036, .745) = .745`; card 621 × 828; chip *"… 834 × 1112 · shown at 74%"* | N/A |
| Mobile | same stage, device 390 × 844 | `fit = min(1, 2.215, .981) = .981`; card 383 × 828; chip *"… 390 × 844 · shown at 98%"* | N/A |
| Fit would exceed 1 | a tall monitor, Mobile | capped at **1**; chip *"shown at 100%"*; the viewport is never magnified | N/A |
| Layers or Controls folded, or the window resized | stage box changes | the fit and the chip's percentage recompute on the `ResizeObserver`; **no repaint** | N/A |
| Device changed with a section selected | Mobile pressed | the selection, its outline, the name tag and the stamps survive; the chrome boxes re-place on the next frame; **every section root is the same node object** | N/A |
| Device changed while typing in a text prop | caret mid-word | the caret survives — the canvas DOM is untouched, so `inline.ts`'s controller never sees it | N/A |
| A press on the ground beside a letterboxed card | Mobile, 240 px of ground each side | deselects, exactly as it does today (R-123) | N/A |
| A 40-section canvas | a doc planted through the service key | loads, and a device change completes with **no main-thread task over 5 s** (FR-D14's pass/fail condition) | slower is acceptable; a lockup is not |
| A Light-only project | `dark_enabled = false` | the device switch is unaffected — it is beside the sun, not part of it (R-135 scopes dark, nothing else) | N/A |

</frozen-after-approval>

## Code Map

**The frames, read**
- `S4 Editor.dc.html:36-40` — **the device track, and the one this story builds**: `#EFECE7` pill,
  `border-radius:8px`, `padding:2px`; three 28 × 26 buttons at `border-radius:6px`; the active one
  `#FFFFFF` + `0 1px 2px rgba(28,27,26,.06)`; 14 px glyphs, `stroke-width:1.5`, active `#1C1B1A` /
  inactive `#6E6A64`. Icons: desktop `rect 2,4,20,13 rx2` + `M8 21h8M12 17v4` · tablet `rect 5,3,14,18 rx2`
  · mobile `rect 8,3,8,18 rx2`. It sits **immediately right of `:35`'s sun** (which 5.6 built), before
  undo/redo (5.8) and Ship it (Epic 7).
- `S4 Editor.dc.html:62-63` — the canvas stage and the page card **as built today**: ground `#EDEAE6`,
  `padding:24px 28px 0`; card `max-width:864px; margin:0 auto; border-radius:6px 6px 0 0; height:100%`.
  **R-137 keeps the ground, the ink, the shadow and the 6 px radius from here and takes the card's geometry
  from B11a** — so `height:100%`, the top-only radius and the 864 ceiling are the three things that go, and
  nothing else on this line does.
- `B Missing Surfaces.dc.html:720-827` — **B11**. B11a's chip `VIEWPORT 1440 × 900 · SHOWN AT 46%` and
  B11b's `VIEWPORT 390 × 844 · SHOWN AT 55%`, each a mono pill drawn at `top:9px; left:12px` of the stage —
  **the BUILT chip is at 4px/4px, which is R-138 (Question 2), and the ground's top padding is 32px with it** —:
  `9.5px`, ink `#6B6459`, `background:#F4F1EC`, `border:1px solid #D8D2C7`, `border-radius:24px`,
  `padding:2px 8px`. Its device track is the explainer's own toolbar, **not** the editor's — S4a's is.
  The drawn "Fit / 55%" picker is **not built** (UX-DR17).
- `D8 Editor Below 1440.dc.html:39` — **`D8a · TABLET · 834 × 1112`**, the project's own statement of what a
  tablet is, twice (`EXPERIENCE.md:62`). D8b draws the device control collapsed into `⋯` as "Device —
  Tablet": Story 5.22's, not this one.

**Normative text, read**
- `prd.md:225` FR-D8 · `:231` **FR-D14** (no zoom, no cap, the 5 s lockup bound) · `:565` canvas geometry ·
  **`:569`** the mechanism in one sentence: real CSS pixels for the viewport, a separate transform for the
  fit · `:66` the desktop-height carve-out, which Question 1 must be read against · `:473` NFR-1.
- `epics.md:302` **UX-DR17** (the chip's words verbatim) · `:305` UX-DR20 · `:293` UX-DR8 · `:1727-1749`
  the story.
- `EXPERIENCE.md:608-623` the same, plus the two-zooms warning · `:387` `1` `2` `3` is Story 5.9's ·
  `:62`, `:143` the IA row.
- `reconcile-designs-decisions.md:1426` — A7 item 6: B11a/B11b **corrected**, and both chips, **1440 × 900
  included**, deliberately **kept** through the correction pass. This is the strongest evidence on
  Question 1's side.

**The editor — five anchors, and nothing else changes**
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (1235 lines):
  - `:142` `const DESKTOP = 1440` — becomes the device table's Desktop row.
  - `:251` `const [size, setSize]` and `:285` `const scale = Math.min(1, size.width / DESKTOP)` — **the one
    line the fit replaces**.
  - `:729-734` the `ResizeObserver` — it watches `card`, which is about to stop being the measured box.
    **Move it to the stage `<section>`**; its content box is the room available.
  - `:1022-1042` the stage and the card. The stage carries R-123's `onPointerDown` guard
    (`e.target === e.currentTarget`) — read the comment at `:1024-1029` before touching the markup.
  - `:952` the top bar; `:975` is where `ModeToggle` sits, and the switch goes beside it.
  - `:268` `said` / `:349` `setSaid(modeShown(next))` — the one live region (`:1157`), and the pattern for
    announcing the new device politely.
  - `:459-470` `onScreen` and `fitOf` **already derive the fit** from `rect.width / offsetWidth`, so the
    mark toolbar and the pill are device-correct with no change. Do not add a second source of truth.
- `apps/web/components/editor/mode-toggle.tsx` — **the exact neighbour to copy**: the icon button, `ring`,
  `title` + `aria-label`, and `onMouseDown={e => e.preventDefault()}` so pressing it never takes focus out
  of the canvas (a caret in a text prop survives). Its comment already names "the device switch" as the
  thing still to land in that bar.
- `apps/web/components/kit/segmented.tsx:23-48` — `choices`, `tabStop`, **`radioKeys`**: the arrow-key
  behaviour of a WAI-ARIA radio group, already built and already tested. Reuse it; the Kit's `Segmented`
  itself is a labelled sidebar control and is the wrong shape for a 28 px icon track.
- `apps/web/components/kit/icons.tsx:300-308` `Sun` / `Moon` — the house style for a new icon (`IconProps`,
  `size`, `strokeWidth`). There is no device icon yet.
- `apps/web/lib/canvas-layer.ts:139-163` `place(el, root, fit, how)` — takes the fit as an argument and
  clamps against `documentElement.clientWidth`, which becomes 390 on Mobile. **Correct as it stands**; only
  the value passed at `editor.tsx:781` changes.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor-skeleton.tsx:23-24` — mirrors the card's
  classes. Follows whatever Question 1 settles.

**Read-only evidence**
- `apps/web/app/(app)/app/(authed)/pilots/review.tsx:199,231-240` — the working precedent for a fixed-size
  iframe under a transform, `data-width` and all. Its **height grows to the section**, deliberately: a
  section review page is not a viewport, so copy the mechanism and not the geometry.
- `apps/web/app/globals.css:83` `--color-canvas-ground` · `:101` `--shadow-canvas-page` · `:39`
  `--color-ink-soft-aa: #6B6459` (**exactly the chip's ink**) · `:90` `--radius-pill: 24px` (**exactly its
  radius**) · `:130` `--font-mono`. `tokens.test.ts:7-9,30` forbids a colour literal in `apps/web`, so the
  chip's `#F4F1EC` / `#D8D2C7` round to the nearest token pair (`bg-paper`, `border-line-strong`) and the
  rounding is named in the component's comment, as Story 3.8 named its own.
- **No section cap exists** — `MAX_SECTIONS`, `maxSections`, `instances.length >=` all return nothing across
  `packages/` and `apps/web`. FR-D14's "no hard cap" is a property to keep and assert, not one to build.
- `tools/probe/run-verify-editor.cjs` — 53 steps; every gesture step runs **inside step 5's CSP session**
  (`:313`). New steps take **54+**, appended before the step-6 banner. `:2059-2063` is how a stored doc is
  planted through the service key, which is how the 40-section fixture gets in front of the editor
  (nothing persists a canvas edit before Story 5.8).
- `apps/web/busy.test.ts` — no new route and no control that starts work, so R-98 adds nothing here; a
  device change is instant client state.

**Ledger** — nothing open about device preview or canvas geometry. Adjacent: DW-167 (the editor's first
browser test in `pnpm check`, Story 5.9's), DW-169 (one token set until Epic 6).

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/components/kit/icons.tsx` -- add `DeviceDesktop`, `DeviceTablet`, `DeviceMobile` from
      `S4 Editor.dc.html:37-39`'s paths, in `Sun`/`Moon`'s shape -- the Kit is where every glyph lives, and
      S4a's device glyphs differ from B11's explainer toolbar; S4a's are the editor's.
- [x] `apps/web/lib/device.ts` -- **new, and the reason it is a `lib/*.ts` is in the Spec Change Log.** `DEVICES`
      (the table: name, label, width, height, each height's source cited in a comment), the pure
      `fitFor(stage, device)`, `viewportWords` and `deviceShown`. Pure and importless, so `editor.test.ts` can reach
      the arithmetic -- `node --test` cannot load a `.tsx`.
- [x] `apps/web/components/editor/device-switch.tsx` -- **new.** The glyph map, the `DeviceSwitch` radio group and the
      `ViewportChip`. Reuse `radioKeys`/`tabStop` from `kit/segmented.tsx` rather than writing arrow keys again -- one
      keyboard behaviour for every radio group in the app.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- hold `device` in state beside
      `mode`; move the `ResizeObserver` from the card to the stage `<section>`; replace `scale` with
      `fitFor`; size the card and the iframe from the device and the fit; put `DeviceSwitch` beside
      `ModeToggle` and `ViewportChip` over the ground; set `data-width` to the active device's width;
      announce the new device through `setSaid`. **R-137:** the card loses `flex-1`, `max-w-[1440px]` and
      `rounded-t-[6px]` for the device's size, `rounded-[6px]` and centring **on the `<section>` itself** --
      one component owns the geometry, as it owns the mode, and no wrapper is added that R-123's ground test
      would not cover.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor-skeleton.tsx` -- draw the resting card
      at Desktop's 16:10 proportion, centred, fully rounded (R-137) -- a skeleton that draws a different shape
      from the screen it stands in for is the flicker R-98 exists to remove.
- [x] `apps/web/editor.test.ts` -- unit-test `fitFor` over the matrix's rows: both axes, the cap at 1, a
      zero-sized stage before the first measurement -- the fit is the only arithmetic in the story.
- [x] `tools/probe/run-verify-editor.cjs` -- steps **54+**, inside step 5's session: the switch measured at
      its drawn size and place; each device's iframe CSS size and the chip's words; the fit recomputed on a
      fold; the selection, the stamps, the caret and **node identity** surviving a device change; R-123's
      ground on a letterboxed card; and the 40-section planted doc with `PerformanceObserver('longtask')`
      asserting no task over 5 s -- R-82: the proof runs on the deployed site, not on mocks.
- [x] **R-138 (added at Dev, on the owner's report):** tuck the chip to 4 px / 4 px in
      `components/editor/device-switch.tsx`, give the canvas ground 32 px of top padding in `(editor)/editor.tsx` and
      `editor-skeleton.tsx` so the card can never reach it, and assert the INVARIANT per device at step 55 of
      `tools/probe/run-verify-editor.cjs` -- not the two offsets, which are only how it is delivered.
- [x] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` -- at
      Review, record the owner's ruling on Question 1 as a new §A10 entry with its targets, and propagate to
      `EXPERIENCE.md`'s frame/PRD divergence table and to `epics.md`'s Story 5.7 AC if the ruling departs
      from a frame -- standing rule 3: a finding is not closed until it reaches an owning document.

**Acceptance Criteria:**
- Given the editor at rest on Desktop, when I look at the canvas, then the page card is **1440 × 900 fitted**
  — centred in the ground, rounded on all four corners, with ground below it — and its ground, ink, shadow and
  6 px radius are still `S4 Editor.dc.html:62-63`'s (R-137).
- Given the editor at rest, when I look at the top bar, then the device track sits immediately right of the
  sun and **matches `S4 Editor.dc.html:36-40`** — the pill, the three 28 × 26 buttons, the white active
  segment and its shadow, the 14 px glyphs and their two inks.
- Given any device, when it is active, then the iframe's CSS `width` and `height` are that device's own — so
  a media query inside the canvas fires at that width and `100vh` resolves to that height — and the only
  scale on it is a `transform`.
- Given a stage smaller than the device in either axis, when the fit is computed, then it is
  `min(1, stageW/deviceW, stageH/deviceH)` and the whole viewport is in shot; given a stage larger than the
  device in both, then the fit is exactly 1 and nothing is magnified.
- Given a device change, when it lands, then the canvas document is not reloaded and does not repaint —
  every section root is the same node object, and the selection, the outlines, the stamps, the inline caret
  and the scroll all survive.
- Given a device is picked, when the change lands, then `#editor-said` announces it politely with its size,
  and the chip reads **"viewport {w} × {h} · shown at {n}%"** (UX-DR17's words, uppercased in CSS as
  `B Missing Surfaces.dc.html:740` draws it, so the accessible string stays the sentence).
- Given the canvas at any device, when I look for a scale control, then there is none — the chip reports and
  nothing sets (UX-DR17, UX-DR20).
- Given any device, when the chip and the page card are both on screen, then **they never overlap and the card's top
  edge clears the chip's bottom** — the chip at 4 px / 4 px of the ground and the ground's 32 px of top padding
  together (**R-138**), the invariant asserted rather than the two offsets.
- Given a letterboxed card, when I press the ground beside it, then the selection clears exactly as it does
  below the last section (R-123).
- Given a 40-section canvas, when it loads and I change device, then nothing caps the number of sections and
  no main-thread task exceeds 5 seconds (FR-D14).

### Review Findings

Review of 2026-09-19 — Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the Real-infra verifier,
the last against the deployed `app.inflozo.com` at `2cc3a956` on the live Supabase.

- [x] [Review][Decision] **Ruled option 1 → R-139, built (`py-8`).** Tablet and Mobile stand on the bottom of the window — R-137 says the card "no longer stands on the bottom of the window", R-138 says "the other three sides stay S4a's" (no bottom padding). Measured on the deployed editor: Tablet and Mobile end at `bottom: 0` and the bottom shadow is cut off. Two approved rulings disagree, so it is Question 3 below.
- [x] [Review][Patch] The walk's step 55 handed `fitFor` a `{ w, h }` stage, so the expected fit was always 1 and nine checks failed on a correct product [tools/probe/run-verify-editor.cjs — step 55]
- [x] [Review][Patch] Step 15 rested the pointer at a fixed y of 860, which since R-137 is the ground below the card; four FAILs, harness geometry not product [tools/probe/run-verify-editor.cjs — `scrollCase`]
- [x] [Review][Patch] Step 23 re-used the title's coordinates after `caretInto` had scrolled R-137's shorter card; one FAIL, harness not product [tools/probe/run-verify-editor.cjs — step 23]
- [x] [Review][Patch] Before the stage is measured the fit is 1, so the server's HTML painted a full 1440 × 900 `shrink-0` card across both panels for a frame — hidden until measured [apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx — the card]
- [x] [Review][Patch] A fit of 0.996 made the chip read "shown at 100%" on a shrunk canvas — held to 99 below 1, with a test [apps/web/lib/device.ts — `viewportWords`]
- [x] [Review][Patch] Step 60's 5 s lockup bound passed on an empty buffer and never saw the load — `buffered: true` and an 80 ms control task [tools/probe/run-verify-editor.cjs — step 60]
- [x] [Review][Patch] Vacuous controls: step 58 never proved the section was selected before the letterbox press; step 57's "mid-word" caret accepted offset 0 and its stamps never asserted the zero its comment claims [tools/probe/run-verify-editor.cjs — steps 57, 58]
- [x] [Review][Patch] R-138's nearest miss, folded Desktop, was never re-asserted — now read at step 56 [tools/probe/run-verify-editor.cjs — step 56]
- [x] [Review][Patch] R-138's 24 → 32 px left behind: `editor.tsx`'s header, the walk's step 2 comment, the skeleton's `828 / 900` and the test's 828 stage
- [x] [Review][Patch] A LOCAL run of the walk died at step 53's Back (the link carries no `/app` prefix on localhost), so steps 54–60 could not be debugged without a deploy per attempt [tools/probe/run-verify-editor.cjs — step 53]
- [x] [Review][Defer] The editor's device wiring (`editor.tsx`'s stage observer and card, `device-switch.tsx`) is held by the deployed walk only, never by `pnpm check` [apps/web/components/editor/device-switch.tsx] — deferred, DW-167 extended
- [x] [Review][Defer] Nothing reads the skeleton card's shape, and it cannot hold 16:10 on a short, wide window (its own `ponytail:` note) [apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor-skeleton.tsx] — deferred, DW-199

## Spec Change Log

- **Dev (2026-09-19) — the table and the fit live in `apps/web/lib/device.ts`, not in `device-switch.tsx`.** The
  Execution list named one new file exporting `DEVICES`, `fitFor`, `DeviceSwitch` and `ViewportChip`, and the
  Verification list asks `editor.test.ts` to unit-test `fitFor`. Those two cannot both hold: `node --test` strips
  types but **cannot load a `.tsx`** (`kit-button.test.ts:6-7` and `passkey-banner.test.ts` are the precedent, and
  "every pure test in this repo lives on a `lib/*.ts`" is the rule they state). So the split is the repo's own: the
  device table, `fitFor`, the chip's words and the live region's sentence are `lib/device.ts` — pure and importless,
  which is what makes them testable — and `components/editor/device-switch.tsx` holds the glyph map, the radio group
  and the chip. Nothing else about the task changed: one new component file, one new lib file, and the same exports
  by the same names. No decision of the owner's is touched.

- **Dev (2026-09-19) — the matrix's Light-only row is covered at step 53, not in steps 54+.** The Execution list
  put this story's harness work at "steps 54+", and the matrix's last row — *a Light-only project: the device
  switch is unaffected* — needs a project with `dark_enabled = false` in front of it. Step 53 already stands one
  up and puts it back; asserting there costs one read and no second settings round-trip, where a step 61 would
  have had to switch the project off and on again. `LABELS` moved up beside the harness's `lib/device.ts` import
  so both steps read the same table.

- **Dev (2026-09-19) — R-138: the chip moved and the ground gained 8 px, on the owner's report.** He said the chip was
  "overlaying the canvas on desktop". **Measured first, on the deployed editor at 1440 × 900** (a throwaway account
  through the Auth Admin API and the harness's own seed), because the report and the arithmetic disagreed: **Desktop
  at rest does not overlap** — 139 px of ground between them — but **Tablet overlaps by 84 × 5 px** and **Desktop with
  both panels folded leaves 4 px**, which the card's shadow bleeds across. The cause: the chip is pinned to the
  stage's corner while the card moves, so any height-bound card rises to meet it. His literal request had ~5 px of
  room before the chip touched the top bar's and Layers' rules, and would not have fixed Tablet — so R-83's options
  went to him and he ruled **option 1**, both halves. This departs from `B Missing Surfaces.dc.html:740`'s drawn
  9 px / 12 px and from `S4 Editor.dc.html:62`'s 24 px of top padding, and it amends **R-137**'s "deliberately not
  touched" line, which had reserved that padding.

- **Dev (2026-09-19) — R-138 moves the I/O matrix's worked stage, which is frozen and therefore stands as written.**
  The matrix works a stage of **864 × 828** (`900 − 48 − 24`) and quotes Mobile at **98%**. R-138's 32px of top
  padding makes the real stage **864 × 820**, so Mobile now reads **97%**; Desktop (60%, width-bound) and Tablet
  (74%) are unchanged. The matrix is intent and is not edited (`<frozen-after-approval>`); the live arithmetic lives
  in `apps/web/editor.test.ts`, whose `STAGE` and comment were updated with the ruling, and in the walk, which derives
  every expectation from `lib/device.ts` and the measured stage rather than from a written-down percentage.

## Design Notes

### The mechanism is two numbers and a transform, and it already half exists

`editor.tsx:285` is `Math.min(1, size.width / DESKTOP)` — a one-axis fit against a constant. The story is
that line becoming `min(1, w/W, h/H)` against a table, plus the card learning a size. Everything downstream
is already written against the fit as a *derived* quantity: `place()` takes it as an argument, `onScreen`
and `fitOf` recompute it from the DOM, `canvas-layer.ts` scales its hosts by `1 / fit`. That is why this
story touches five files and not fifteen, and it is the test of whether the geometry was factored right in
Stories 5.1–5.4.

### The one thing that must move: what gets measured

Today the card **is** the room available (`flex-1`, `max-w-[1440px]`) and the `ResizeObserver` watches it.
The moment the card takes a device's size, measuring the card measures the answer rather than the question.
The observer moves to the stage `<section>`, whose content box is the room. Keep the centring on that same
`<section>` (`items-center justify-center`) rather than wrapping the card: a wrapper becomes a fourth
ground that R-123's `e.target === e.currentTarget` does not cover, and a press beside the card would
silently stop deselecting.

### What R-137 settled, and what it did not

The export drew the desktop canvas twice and differently: S4a`:63` filling the height, B11a`:740` a fixed
1440 × 900 with its chip — a chip deliberately kept through the A7 correction pass. The owner ruled for
B11a (2026-09-19), so there is **one rule for three devices** and no state in which the card fills the room
available. What did not change: the ground, the ink, the shadow and the 6 px radius are S4a's still. What
this buys is the story's own thesis applied to desktop as well — B11b's note, *"a 390-wide column with no
height cannot tell you where the fold is"*, is just as true of a 1380-tall desktop canvas. What it costs is
about a third less page in view while editing at 1440, and the owner took that knowingly.

### Why the fit is capped at 1

`min(…)` without the cap magnifies a 390-wide viewport to fill a 1440 stage — 3.7×, every hairline four
pixels thick, and a preview that lies about size in the opposite direction. The cap is already in the line
being replaced; keep it and say why.

### What this story does and does not owe NFR-1

FR-D14 carries three clauses. **No zoom** and **no hard cap** are this story's, and the second is a property
to keep rather than code to write — nothing in `packages/` or `apps/web` caps sections today, and the 40-
section walk is what proves it stays true. The **5-second lockup bound** is the clause's own pass/fail
condition and is measurable in a browser harness (`PerformanceObserver('longtask')`), so it is owed here.
**60 fps, p95 ≤ 16.7 ms and no long task over 50 ms are NOT** — NFR-1 makes that gate manual-only on the
reference laptop at 4× CPU throttle, and Story 5.23 is where the 40-section fixture and the shuffle trace
meet it. A CI number would be noise presented as a gate.

### Tablet's height is derived, not invented

FR-D8 names Tablet only by width, and B11 draws only Desktop and Mobile. **834 × 1112** is the project's own
tablet, stated twice — `D8 Editor Below 1440.dc.html:39` and `EXPERIENCE.md:62` — so the height is read out
of the export rather than chosen. Mobile's 390 × 844 is UX-DR17's verbatim. Desktop's height is Question 1.

### Session state, and why there is no Schema phase

`project_template_prefs` exists and is schema-only — it is where a *per-canvas* preference would go. The
device is not one: it is a property of the person looking, like the mode, and 5.6 settled that shape by
holding `mode` in `editor.tsx` and persisting nothing. Same here. No column, no migration, no Schema phase.

## Verification

**Executed at Dev (2026-09-19), and what each returned:**

- `pnpm check` (Node 24 on `PATH`; the shell defaults to 22) — **exit 0.** Lint, typecheck and every package's
  tests green: `apps/web` **366 pass / 0 fail**, including `editor.test.ts`'s six new `fitFor` cases;
  `packages/section-runtime` 200, `packages/library` 149, `packages/ghost-shim` 34, `packages/theme-compiler` 1.
  Counts are the runs' own, printed by `node --test` — none is written into the tree.
- `python3 tools/doc-audit.py --check`, **twice** — `documentation gate: PASS (0 warning(s))`, exit 0 both times.
- `bash tools/matrix/run-matrix-gate.sh` — **`render matrix: 180 cases · 5 designs · 1 packs · 0 violations —
  passed`**, 182 Playwright cases in 46.4 s, in its own container. This is the independent check that **1440,
  834 and 390 are the three widths the library itself is photographed at** — the same three the device table
  names — and that R-137's editor-chrome change moved none of them.
- `node --check tools/probe/run-verify-editor.cjs` — clean, with `LABELS` hoisted to the harness's device
  import so step 53 can read it (a `const` used before its declaration in the same block is a TDZ error, not a
  hoist).
- **R-138's measurement, executed on the DEPLOYED editor before anything was changed** — a throwaway account created
  through the Supabase Auth Admin API (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`), seeded with `tools/probe/seed-editor-project.mjs`,
  signed in by a generated magic link, and driven with Playwright at a 1440 × 900 viewport against
  `https://app.inflozo.com`. The chip's and the card's boxes, read from the live DOM:

  | State | chip box | card box | result |
  |---|---|---|---|
  | Desktop at rest | 252,57 → 474,77 | 268,216 → 1132,756 | no overlap · **139px** of ground between them |
  | **Tablet** | 252,57 → 474,77 | 390,72 → 1011,900 | **OVERLAP 84 × 5px** |
  | Mobile | 252,57 → 468,77 | 509,72 → 891,900 | no overlap (the card is narrow and centred) |
  | Desktop, both panels folded | 56,57 → 278,77 | 72,81 → 1368,891 | no overlap · **4px**, which the card's shadow crosses |

  This is why the owner's report and the arithmetic disagreed, and why the remedy is the pair rather than the nudge.
  After the change the invariant is asserted per device at step 55 of the editor walk, against the deployed site at
  Review — the chip's bottom is 24px from the ground's top edge and the card's top is 32px, so the clearance is 8px
  on every device and is measured rather than assumed.

**Real services this story hit at Dev (R-82; every key read into a command's environment, never printed):**

- **Vercel REST API** — `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`. `GET /v6/deployments?target=production`
  returned the three most recent production deployments, the newest **`8fe60457` `READY`/`READY`** — so the Dev
  commit is live on `app.inflozo.com` and the Review walk has a deployment to run against.
- **Supabase, Resend, Dodo, and the Ghost test servers T1 / T3 — not hit, and this story has nothing for them.**
  The device is session state in `editor.tsx`: no column, no migration, **no Schema phase**, no mail, no billing
  and no theme upload. `SUPABASE_URL` / `SUPABASE_SECRET_KEY` are read by the editor harness below, at Review.

**Owed at Review, and why it could not run at Dev:**

- `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs) node
  tools/probe/run-verify-editor.cjs` — expected: every step PASS, 0 FAIL, against the deployed
  `app.inflozo.com` on the seeded "Pilot sections" project. **The harness refuses to run while `apps/`,
  `packages/` or `tools/probe/` is dirty, or while Vercel serves a commit other than HEAD**
  (`run-verify-editor.cjs:122-130`) — by design, so a PASS can only ever be a statement about what the site
  actually serves. The Dev commit's own harness edits are therefore provable only once CI has deployed them,
  which is the Review phase (project-context: a check that can only run after deploy belongs here, not in the
  task list).
- Steps **54–60** are this story's — the track at its drawn size, place and inks; per device the real CSS
  viewport, `100vh`, the media query, the transform-only scale, the card and the chip's words; the absence of
  any zoom control; a fold re-fitting with the true size unmoved; node identity, the stamps, the selection and
  the caret surviving a change; R-123 in the letterbox; the arrow keys; and a 40-section planted doc for
  FR-D14's no-cap and its 5 s lockup bound. Step **53** gained the matrix's Light-only row (the track is
  unaffected by `dark_enabled = false` and leads the cluster the absent sun leaves). Steps **2, 5, 6, 9,
  10–11, 15** are the controls; step 2's card assertion was rewritten for R-137, and it is the likeliest place
  a geometry error would surface.
- A HARNESS ERROR with no FAIL is not a result — re-run.

**Executed at Review (2026-09-19), on the real infrastructure (R-82):**

- **The deployed walk at `2cc3a956`** — `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs)
  node tools/probe/run-verify-editor.cjs` against `https://app.inflozo.com` (Vercel answered the deployment READY and
  built from HEAD) and the live Supabase (two throwaway accounts through the Auth Admin API, deleted in `finally`,
  users 13 → 13). Five runs: three died on 30 s network timeouts with no FAIL and are not results; the complete one
  returned **14 FAIL** — and **every one was the walk, not the product**: nine at step 55 (the walk handed `fitFor` a
  `{ w, h }` stage, so it expected `scale(1)` while the site correctly served `scale(0.6)`, `scale(0.73741)` and
  `scale(0.971564)`), four at step 15 and one at step 23 (pointer positions written for the card R-137 replaced).
  Steps 2, 53, 54, 56–60 held on the deployed site as the story claims.
- **No migration** — `git diff --stat 5f3b60cb HEAD -- supabase` is empty, so R-99 has nothing to check.
- **The patched walk, against a production build of this checkout on the live Supabase**
  (`APP_ORIGIN=http://localhost:3000 APP_PREFIX=/app`): **exit 0, 0 FAIL**, with step 60's new control passing (the
  observer recorded the deliberate 80 ms task; the longest real task was 162 ms) and step 56's folded-Desktop
  clearance measured at 86.5 px. `pnpm check` exit 0. The same walk against the DEPLOYED site can only run once CI has
  published this Review commit (the walk refuses any commit but HEAD) — its result is appended below.
- **R-139, built and walked the same way** (a production build of this checkout, the live Supabase): **exit 0,
  0 FAIL.** Step 55 read the card's box per device — Tablet 591 × 788 and Mobile 364 × 788, each with **32 px above and
  32 px below**; Desktop 864 × 540 with 156 px each side of it — and step 56 read a FOLDED Desktop (the state the owner
  was looking at) ending 94.75 px above the window's edge. `pnpm check` exit 0.
- **THE DEPLOYED WALK AT `045b3967`, which closes what was owed** — the same command against `https://app.inflozo.com`
  (Vercel: `dpl_BMQf9AAhKiqUu232K7kjrFREAq61` READY, built from HEAD) and the live Supabase: **exit 0, 0 FAIL**, every
  step PASS on the third run (the first two died on 30 s network timeouts with no FAIL, which are not results). Steps
  15, 23 and 55 pass on the live site; Tablet and Mobile end 32 px above the window's edge and a folded Desktop
  94.75 px; both throwaway accounts deleted, users 13 → 13.

**Executed at Deploy (2026-09-19):**

- `GET https://api.vercel.com/v6/deployments` (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`) — the
  production deployment built from HEAD (`7f002a7e`, the Review commit) is **READY**.
  `Deployment: dpl_G3vy4MKKxFAkYyvuRs8Zot2Ypm1f` (`inflozo-i15v5a3tu-umangkagathara.vercel.app`, serving
  `app.inflozo.com`). No migration — the Review phase's `git diff --stat` already showed `supabase/`
  untouched, so there is nothing further for R-99 to check.

**Manual checks (if no CLI):**
- The owner's walk below, on the production domain, after Deploy (R-80).

## Owner's manual test

Run on the deployed site, on the **"Pilot sections"** project Story 5.1 seeded. Nothing on the canvas is
saved yet — saving arrives with Story 5.8 — so do this in one sitting.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the page in the middle before you touch anything. | — | **This is your ruling R-137, and it is the one change you should expect to notice.** The page no longer runs down to the bottom of the window: it sits centred in the grey as a screen-shaped card with a **rounded bottom edge** and a band of grey below it. It is a third shorter than you are used to. Everything on it — the ground, the shadow, the corners — is the colour and weight it always was. |
| 1b | same | Editor, Home | Look at the right-hand end of the top bar, just past the sun. | — | Three small joined buttons — a **screen**, a **tablet** and a **phone** — with the screen one white and raised, the other two plain. |
| 2 | same | Top bar | Hover each of the three in turn. | — | Each one tells you what it is — "Desktop", "Tablet", "Mobile" — and nothing else in the bar has moved. |
| 3 | same | Canvas, Home | Press the **phone**. | — | The page in the middle becomes **phone-shaped** — narrow *and* short, with a proper bottom edge — with grey either side of it. The menu has collapsed to a hamburger and the hero has stacked. |
| 4 | same | Canvas, Home | Read the small grey chip at the top-left of the grey area. | — | **"viewport 390 × 844 · shown at 93%"** (the percentage depends on your monitor). It tells you the real size first and the shrinking second. |
| 5 | same | Canvas, Home | Look for a way to zoom in or out. | — | **There is none, on purpose.** The only thing you operate is the device; the shrinking is worked out for you and only reported. |
| 6 | same | Canvas, Home | Scroll the phone-shaped page with your mouse wheel. | — | The page scrolls **inside** the phone shape, like a real phone. The editor around it does not move, and the phone's own bottom edge stays put — that edge is the **fold**. |
| 7 | same | Canvas, Home | Press the **tablet**, then the **screen**. | — | Each press resizes the page in **both** directions — 834 wide by 1112 tall, then back to the desktop size — and the chip's numbers change with it. No white flash, no spinner in the browser tab, no reload. |
| 8 | same | Canvas, Home | Click a section to select it, then press the **phone**, then the **screen** again. | — | The section **stays selected** the whole time — its outline and its name follow it through each change — and the page does not jump back to the top. |
| 9 | same | Canvas, Home | Click into a headline and start typing. With the cursor still in the middle of the word, press the **tablet**. | type `Hello` into a headline | The page becomes tablet-shaped and **your cursor stays exactly where it was**, mid-word. |
| 10 | same | Canvas, Home | With the phone selected, click once on the plain grey **beside** the phone-shaped page. | — | The selection clears — the grey beside the page is "nothing", the same as the space below the last section. |
| 11 | same | Editor, Home | Fold the Layers panel away with the little arrow on its edge, and watch the chip. | — | The page gets **bigger** and the chip's percentage goes **up**, while the first two numbers — the true size — do not change. That is the point of the chip. |
| 12 | same | Canvas, Home | Press **Tab** until the three device buttons take the focus ring, then use the **left and right arrow keys**. | — | The device changes as you arrow across them, without the mouse. |

## Questions for the owner

### Question 1 — the drawings disagree about how tall the desktop canvas should be

Two drawings show the desktop canvas and they do not match.

**S4a** — the main drawing of the editor, and what is built today — shows the page filling **all the height
there is**, sitting on the bottom edge of the window. On your 1440 laptop that is about 1380 of the page's
own pixels in view at once.

**B11a** — the drawing that explains device preview — shows the desktop page as a fixed **1440 × 900**, with
a chip reading "VIEWPORT 1440 × 900 · SHOWN AT 46%" and grey below it. That chip was looked at and
deliberately **kept** when these drawings were corrected on 2026-09-04.

Both are approved drawings, so I am not guessing between them.

**Example.** You open the editor and design a hero that is meant to fill a visitor's screen. Today it is
drawn 1380 pixels tall, because that is how much room your window happens to have — which is not a height
any visitor will ever have, so you cannot see where your page's "fold" really is on a desktop. If desktop
becomes a fixed 1440 × 900, that hero is drawn 900 tall, the fold is real, and the chip says so — but you
see about a third less of your page while you work, with a band of grey below it.

Tablet and Mobile are fixed sizes either way. This question is only about **Desktop**.

1. **Desktop becomes a real 1440 × 900 screen, like the other two.** (RECOMMENDED) — one rule for all three
   devices: the fold is where the fold is on every one of them, `100vh` means what it will mean, and the
   chip never reports a number that changes when you fold a panel. It is what B11a draws and what this
   story's own acceptance criteria say ("resizes in **both** axes to a real device size"). The cost is
   real and you will see it immediately: about a third less page in view while you work, and a band of grey
   under the page. The page card gains a rounded bottom edge and sits centred in the grey instead of
   standing on the bottom of the window.
2. **Desktop stays exactly as it is today** — the page fills the height, standing on the bottom edge — and
   only Tablet and Mobile become real device sizes. The chip still tells the truth on desktop, but the
   height it reports is whatever your window happens to give ("viewport 1440 × 1380 · shown at 60%") and it
   changes when you fold a panel. Nothing about the editor you have already walked changes, and checking a
   full-height hero means pressing the tablet or the phone.

**Ruled: option 1 (owner, 2026-09-19).** Desktop becomes a real 1440 × 900 screen, like the other two.
Recorded as **R-137** in `reconcile-designs-decisions.md` §A10, and propagated at this Create run to
`epics.md`'s Story 5.7 AC and to `EXPERIENCE.md`'s device-preview paragraph and B11 divergence row. **B11a
governs the card's geometry — device-sized, centred in the ground, a radius on all four corners — and S4a
governs everything else about it**: the ground, the ink, the shadow and the 6 px radius.

### Question 2 — the chip and the page get in each other's way

You said the "viewport ... shown at" chip was overlaying the canvas on desktop, and asked to move it up and left.

**What I measured on the live editor before changing anything** (your own 1440 × 900 size):

| What you are looking at | Space between the chip and the page |
|---|---|
| Desktop, both panels open | **139 px** — the chip is nowhere near the page |
| Desktop, **both panels folded away** | **4 px** — all but touching, and the page's shadow bleeds across it |
| **Tablet** | **−5 px** — the chip's bottom-right corner sits *on* the page |
| Mobile | clear — the page is narrow and centred |

The chip is pinned to the top-left corner of the grey and it is the **page** that moves; when the page is tall it
rises to meet the chip. "A bit up and left" had only about 5 px of room before the chip touched the top bar's line
and the Layers panel's line, and it would not have fixed the tablet — which is why this came to you.

**Example.** You press the tablet button. The page becomes tall and its top edge slides 5 px *under* the chip, so
"SHOWN AT 74%" is printed across the corner of your page.

1. **Tuck it into the corner AND keep the page clear of it.** (RECOMMENDED) — the chip moves up and left into the very
   corner (4 px off each line instead of 9 and 12), and the page is stopped from ever rising under it on any device.
   Does what you asked and fixes the tablet for good. Costs about 8 px of page height — the tablet still reads 74%,
   and desktop does not change at all.
2. **Just nudge it, nothing else** — only the chip moves. Smallest change; clears the tablet by about 1 px, which will
   look tight, and a longer chip on another screen could touch again.
3. **Leave the chip where the drawing puts it and only move the page down** — fixes the tablet, but nothing changes on
   desktop at rest, so if what bothered you was the chip floating there, this would not change it.
4. **Move the chip up into the top bar** beside the three device buttons — it could then never overlap anything, but
   it takes room in a 48 px bar that still has undo/redo (5.8) and Ship it (7.18) to come.

**Ruled: option 1 (owner, 2026-09-19).** Tuck it in and keep the page clear. Recorded as **R-138** in
`reconcile-designs-decisions.md`, propagated to `EXPERIENCE.md`'s B11 divergence row, and built at this Dev run: the
chip at 4 px / 4 px, the canvas ground at 32 px of top padding, and step 55 of the editor walk asserting per device
that **the chip never overlaps the page card** — the invariant, not the two offsets.

### Question 3 — the tablet and the phone stand on the bottom edge of the window

Your ruling R-137 says the page "no longer stands on the bottom of the window" and has grey ground below it. That is
true on Desktop. **On Tablet and Mobile it is not**: they are tall, so they are shrunk until they fill the grey's whole
height, and their bottom edge sits exactly on the bottom of your browser window — the rounded bottom corners are
there, but the soft shadow under the page is cut off. Your later ruling R-138 added room at the *top* only and said the
other three sides stay as drawn, so I did not add room at the bottom without asking.

**Example.** Press the phone button. The phone-shaped page has 32 px of grey above it and **0 px** below it — it looks
like it is standing on the window's edge rather than floating in the grey the way Desktop does.

1. **Give the bottom the same 32 px as the top.** (RECOMMENDED) — every device floats in the grey with its shadow
   whole, which is what R-137 describes. Costs a little size: Tablet reads 71% instead of 74%, Mobile 93% instead of
   97%. Desktop does not change.
2. **Leave it as it is** — Tablet and Mobile stay as large as they can be and stand on the bottom edge. Nothing to build.
3. **A smaller gap, 16 px** — enough to show the shadow and the rounded corners clear of the edge; Tablet 72%,
   Mobile 95%.

**Ruled: option 1 (owner, 2026-09-19).** The bottom gets the same 32 px as the top. Recorded as **R-139** in
`reconcile-designs-decisions.md`, propagated to `EXPERIENCE.md`'s B11 divergence row, and built in this Review: the
ground is `py-8` in the editor and its skeleton, `editor.test.ts`'s worked stage is 864 × 788 (Tablet 71%, Mobile
93%), and step 55 of the walk asserts per device that the card ends a full bottom padding above the window's edge.

**On "I do not see the desktop floating too":** Desktop only floated when it was the page's WIDTH that limited it —
both panels open on a 1440-wide window. Fold a panel, or use a shorter or wider window, and Desktop becomes limited by
HEIGHT exactly like the tablet, and stood on the bottom edge the same way (the Dev measurement above already shows it:
folded Desktop's card ended at 891 of 900). R-139's bottom padding is applied to the ground, not to a device, so it
fixes Desktop in that state too.
