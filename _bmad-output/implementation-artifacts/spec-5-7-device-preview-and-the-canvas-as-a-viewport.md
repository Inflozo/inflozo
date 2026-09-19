---
title: 'Story 5.7 — Device preview, and the canvas as a viewport'
type: 'feature'
created: '2026-09-19'
status: 'ready-for-dev'
owner_test: pending
baseline_commit: '5f3b60cb7ff0925e9f19ce964fc5a40c1e7fe0d0'
review_loop_iteration: 0
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
  B11b's `VIEWPORT 390 × 844 · SHOWN AT 55%`, each a mono pill at `top:9px; left:12px` of the stage:
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
- [ ] `apps/web/components/kit/icons.tsx` -- add `DeviceDesktop`, `DeviceTablet`, `DeviceMobile` from
      `S4 Editor.dc.html:37-39`'s paths, in `Sun`/`Moon`'s shape -- the Kit is where every glyph lives, and
      S4a's device glyphs differ from B11's explainer toolbar; S4a's are the editor's.
- [ ] `apps/web/components/editor/device-switch.tsx` -- **new.** Export `DEVICES` (the table: name, width,
      height, icon, with each height's source cited in a comment), the pure `fitFor(stage, device)`, the
      `DeviceSwitch` radio group and the `ViewportChip`. Reuse `radioKeys`/`tabStop` from
      `kit/segmented.tsx` rather than writing arrow keys again -- one keyboard behaviour for every radio
      group in the app.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- hold `device` in state beside
      `mode`; move the `ResizeObserver` from the card to the stage `<section>`; replace `scale` with
      `fitFor`; size the card and the iframe from the device and the fit; put `DeviceSwitch` beside
      `ModeToggle` and `ViewportChip` over the ground; set `data-width` to the active device's width;
      announce the new device through `setSaid`. **R-137:** the card loses `flex-1`, `max-w-[1440px]` and
      `rounded-t-[6px]` for the device's size, `rounded-[6px]` and centring **on the `<section>` itself** --
      one component owns the geometry, as it owns the mode, and no wrapper is added that R-123's ground test
      would not cover.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor-skeleton.tsx` -- draw the resting card
      at Desktop's 16:10 proportion, centred, fully rounded (R-137) -- a skeleton that draws a different shape
      from the screen it stands in for is the flicker R-98 exists to remove.
- [ ] `apps/web/editor.test.ts` -- unit-test `fitFor` over the matrix's rows: both axes, the cap at 1, a
      zero-sized stage before the first measurement -- the fit is the only arithmetic in the story.
- [ ] `tools/probe/run-verify-editor.cjs` -- steps **54+**, inside step 5's session: the switch measured at
      its drawn size and place; each device's iframe CSS size and the chip's words; the fit recomputed on a
      fold; the selection, the stamps, the caret and **node identity** surviving a device change; R-123's
      ground on a letterboxed card; and the 40-section planted doc with `PerformanceObserver('longtask')`
      asserting no task over 5 s -- R-82: the proof runs on the deployed site, not on mocks.
- [ ] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` -- at
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
- Given a letterboxed card, when I press the ground beside it, then the selection clears exactly as it does
  below the last section (R-123).
- Given a 40-section canvas, when it loads and I change device, then nothing caps the number of sections and
  no main-thread task exceeds 5 seconds (FR-D14).

## Spec Change Log

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

**Commands:**
- `pnpm check` -- expected: lint, typecheck and every package test green, `editor.test.ts`'s new `fitFor`
  cases included. Needs Node 24 on `PATH` (the shell defaults to 22).
- `python3 tools/doc-audit.py --check` -- expected: exit 0, run twice (its sub-tools regenerate on the first
  failure).
- `node tools/probe/run-verify-editor.cjs` -- expected: every step PASS, 0 FAIL, **against the deployed
  `app.inflozo.com`** on the seeded "Pilot sections" project (R-82). Steps 54+ are this story's; steps 2, 5,
  6, 9, 10-11 and 15 are the controls that the geometry change moved no URL, raised no CSP violation, and
  left the chrome layer's painted line widths and its scroll tracking where they were. A HARNESS ERROR with
  no FAIL is not a result — re-run.
- `bash tools/matrix/run-matrix-gate.sh` -- expected: green. It photographs the library at 1440/834/390 and
  is the independent check that the three device widths are the three the designs were built for.

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
| 4 | same | Canvas, Home | Read the small grey chip at the top-left of the grey area. | — | **"viewport 390 × 844 · shown at 98%"** (the percentage depends on your monitor). It tells you the real size first and the shrinking second. |
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
