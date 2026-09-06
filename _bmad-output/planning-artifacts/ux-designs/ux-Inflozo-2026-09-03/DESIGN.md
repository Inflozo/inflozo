---
name: Inflozo
description: The visual identity of Inflozo's own interface — "Playful Pro", transcribed from the Claude Design export.
status: final
created: 2026-09-03
updated: 2026-09-05
sources:
  - "{planning_artifacts}/design/claude-design-export/Inflozo/Calibration Set.dc.html"
  - "{planning_artifacts}/design/claude-design-export/Inflozo/Editor Sidebar Kit.dc.html"
  - "{planning_artifacts}/design/claude-design-export/Inflozo/D8 Editor Below 1440.dc.html — D8c, D8e: the corrected focus ring, drawn"
  - "{planning_artifacts}/design/claude-design-prompt-2.md §0.1"
  - "{planning_artifacts}/prds/prd-Inflozo-2026-08-17/prd.md — Appendix C, Appendix D, Appendix H"
  - "{planning_artifacts}/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md — §A10 (R-74, R-75), §A15 (the 2026-09-04 export, verified)"

colors:
  paper: '#F7F5F2'
  paper-raised: '#FBF9F5'
  paper-sunk: '#EFECE7'
  surface: '#FFFFFF'
  ink: '#1C1B1A'
  ink-deep: '#232019'
  ink-hover: '#33312E — the ink button's hover, drawn as its own value by the Kit (:132) and by S1 (:34); until 2026-09-05 the primary button hovered to ink-deep, which is the canvas chrome, not this. Added by Story 1.4'
  ink-soft: '#6E6A64'
  ink-soft-aa: '#6B6459'
  ink-faint: '#A8A29A — rules, dividers and disabled text; never placeholder or hint text, which moved to ink-soft-aa on 2026-09-04 (A7 item 10)'
  line: '#E7E2DB'
  line-faint: '#EFEAE2'
  line-strong: '#C9C2B8'
  coral: '#FF5941'
  coral-text: '#C2381F'
  coral-text-hover: '#A82D18'
  coral-deep: '#E84B34'
  coral-tint: '#FFEDE8'
  coral-tint-strong: '#FFD9CF'
  coral-wash: 'rgba(255,89,65,.4) — hover and selection only; until 2026-09-04 it was also the focus ring, at 1.55:1 on paper (A7 item 7)'
  marigold: '#FFB100'
  marigold-text: '#8A6100'
  marigold-tint: '#FFF4D6'
  marigold-tint-soft: '#FFFDF6 — softer than tint: D4b's upgrade card (D4 :160). The Kit's notice Banner keeps `marigold-tint`; nothing else reads this one. Added 2026-09-06 by Story 1.5's second Fix run'
  marigold-solid: '#9E6800 — the gold a Go Pro button is FILLED with (D4 :165). The frame fills it #B87A00 and darkens to #9E6800 on hover; white on #B87A00 is 3.61:1 and fails AA, so the frame's own hover shade (4.74:1) is the resting fill and the hover goes one step further to marigold-text (5.54:1). Both values are the frame's. Added 2026-09-06 by Story 1.5's second Fix run and RULED BY THE OWNER the same day (spec question 4, option 1): the deeper gold stays. Whether this becomes the rule for every frame colour that measures below 4.5:1 is a separate decision and is not made'
  mint: '#1FA97A'
  mint-text: '#157A58'
  mint-tint: '#E4F5EE'
  sky: '#4E7FFF'
  sky-text: '#2B5BD7'
  sky-tint: '#EAF0FF — the Editor Sidebar Kit info banner fill; the earlier #E8EEFF occurred nowhere in the export (F-110)'
  danger: '#E5484D — the fill and the glyph; it carries no words, at 3.91:1 on white'
  danger-text: '#C4383C — danger wherever it carries words: the danger button fill under white type, the outline variant label, the Delete menu row (Editor Sidebar Kit :113, :135). Added 2026-09-05 by Story 1.3 — every other hue already had its -text twin and danger did not, so #E5484D was being set in words at 3.91:1 and 3.42:1. Read off the frame, which had it all along'
  danger-text-hover: '#C63A3F — the danger button's hover (Editor Sidebar Kit :135). Added 2026-09-05 by Story 1.3's review'
  danger-tint: '#FDECEC — B Missing Surfaces; the frames more often use #FDEBEC (S12 delete hover), both are export values (F-110)'
  sky-line: '#D4E0FA — the info banner's hairline (Editor Sidebar Kit :238). The four banner hairlines are drawn as their own solid hexes, never a tinted mix; added 2026-09-05 by Story 1.3's review'
  mint-line: '#BFE7D6 — the success banner's hairline (Editor Sidebar Kit :239)'
  marigold-line: '#F5E3B8 — the notice banner's hairline (Editor Sidebar Kit :240)'
  danger-line: '#F5C6C9 — the error banner's hairline (Editor Sidebar Kit :241); not a button border, which 1.4.11 puts at 3:1'
  grey-field: '#F2EFEA — a greyed control's fill (P0-0 Greyed Control Pattern :76). The three greyed colours were transcribed by Story 1.3 and named here by its review, 2026-09-05'
  grey-border: '#EAE5DD — a greyed control's border (P0-0 :76)'
  grey-track: '#E2DCD3 — a greyed toggle's track (P0-0, the toggle in the five shapes)'
  scrim: 'rgba(28,27,26,.4)'

typography:
  display:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontWeight: '500–800'
    letterSpacing: '-0.01em at 28px and above'
  ui:
    fontFamily: "'Inter', sans-serif"
    fontWeight: '400 / 500 / 600'
  mono:
    fontFamily: "'JetBrains Mono', monospace"
  scale:
    note: 'display and body steps 12 · 13 · 14 · 16 · 20 · 24 · 32 · 44 · 60 · 72; the app frames also set UI text at the half steps 9 · 9.5 · 10 · 10.5 · 11 · 11.5 · 12.5 · 13.5 · 15 — transcribed from the S/B/C/P0 frames and the Editor Sidebar Kit, where 12.5 and 11.5 are the third and fourth most-used sizes (F-111). Follow the frame, never round to the nearest listed step'
  body:
    fontSize: '16px'
  ui-default:
    fontSize: '14px'
  ui-dense:
    fontSize: '13px'
  panel-label:
    fontSize: '13px'
    fontWeight: '600'
    letterSpacing: '0.04em'
  control-label:
    fontSize: '12px'
    fontWeight: '500'
  helper-caption:
    fontSize: '11px'

rounded:
  sm: '8px'
  thumb: '10px'
  DEFAULT: '12px'
  lg: '16px'
  pill: '24px'
  full: '24px — COMPUTED alias of pill; 9999px occurs nowhere in the export (F-110). Prefer {rounded.pill}'

spacing:
  grid: '4px'
  panel-padding-tight: '16px'
  panel-padding: '20px'
  gutter-app: '24px'
  gutter-marketing-max: '120px'
  sidebar-width: '280–320px'
  breakpoint-desktop: '1440px'
  breakpoint-tablet: '834px — the editor is drawn here, D8a (2026-09-04)'
  breakpoint-mobile: '390px — Small Screen Notice is drawn here, D4f'
  app-floor: '834px — a COARSE-POINTER threshold, never a bare width (R-76; its width amended from 1024 to 834 by R-87, 2026-09-04): a tablet at 834 gets the editor as D8a draws it, a phone gets D4f; a desktop at 200% zoom stays in the editor — D8b draws it at 720 to prove it'

components:
  button-primary:
    background: '{colors.ink}'
    color: '{colors.surface}'
    rounded: '{rounded.DEFAULT}'
    heights: '44 / 36 / 32'
  button-coral:
    background: '{colors.coral-text}'
    hover: '{colors.coral-text-hover}'
    color: '{colors.surface}'
    rounded: '{rounded.DEFAULT}'
    note: 'one per surface — THE action'
  button-secondary:
    background: '{colors.surface}'
    border: '1px solid {colors.line}'
    color: '{colors.ink}'
  button-danger:
    background: '{colors.danger-text}'
    hover: '{colors.danger-text-hover}'
    color: '{colors.surface}'
    note: 'the frame fills #C4383C, not {colors.danger} — white type on {colors.danger} reads at 3.91:1 (Editor Sidebar Kit :135)'
  input:
    rounded: '{rounded.sm}'
    border: '1px solid {colors.line}'
    caretColor: '{colors.coral}'
    placeholderColor: '{colors.ink-soft-aa} — was {colors.ink-faint} until 2026-09-04'
    focusBorder: '1px solid {colors.coral-text} — was {colors.coral} until 2026-09-04'
    focusRing: '{elevation.focus} — was 0 0 0 2px rgba(255,89,65,.4) until 2026-09-04'
  segmented:
    track: '{colors.paper-sunk} — the frame draws #EFECE7 (Editor Sidebar Kit :63); this row said paper until Story 1.3's review, 2026-09-05'
    activeBackground: '{colors.surface}'
    activeShadow: '{elevation.sm}'
    rounded: '{rounded.sm}'
  design-picker-thumb:
    size: '64×44'
    rounded: '{rounded.thumb}'
    activeRing: '0 0 0 2px {colors.coral}'
  toggle:
    size: '36×20'
    on: '{colors.coral}'
  card:
    background: '{colors.surface}'
    rounded: '{rounded.DEFAULT}'
    shadow: '{elevation.sm}'
    hover: '{elevation.md} + 1px lift'
  badge-pro:
    background: '{colors.marigold-tint}'
    color: '{colors.marigold-text}'
    glyph: '✦'
    label: 'Pro — the word is part of the badge, never the glyph alone'
    rounded: '{rounded.pill}'
  badge-free:
    border: '1px solid {colors.line}'
    color: '{colors.ink-soft-aa}'
  badge-live:
    dot: '{colors.mint}'
  chip-version:
    fontFamily: '{typography.mono.fontFamily}'
  modal:
    rounded: '{rounded.lg}'
    shadow: '{elevation.modal} — the frames draw every modal and sheet at .25, not lg's .14 (D4a, D4b, S12c). This row said {elevation.lg} until Story 1.5, 2026-09-05'
    scrim: '{colors.scrim}'
  toast:
    rounded: '{rounded.pill}'
    position: 'bottom-centre'
  canvas-pill:
    rounded: '{rounded.thumb}'
    padding: '4px'
    shadow: '{elevation.lg}'
    background: '{colors.ink}'
    target: '30px'
  moon-badge:
    size: '12px'
    label: 'Dark override — an accessible label, always'
    note: 'marks any control carrying a dark-mode override'

elevation:
  sm: '0 1px 2px rgba(28,27,26,.06)'
  md: '0 4px 16px rgba(28,27,26,.08)'
  lg: '0 12px 40px rgba(28,27,26,.14)'
  modal: '0 12px 40px rgba(28,27,26,.25) — lg's geometry at .25: every modal and sheet in the export is drawn at this alpha (D4a, D4b, S12c), and the token layer had no name for it. Added 2026-09-05 by Story 1.5'
  hairline-inset: 'inset 0 0 0 1px rgba(28,27,26,.12)'
  focus: '0 0 0 2px #C2381F — the one ring, everywhere: 7.9:1 on paper, past 3:1 on white; was 0 0 0 2px rgba(255,89,65,.4) until 2026-09-04 (A7 item 7)'
---

# Inflozo — Design Spine

## What this document is, and which way a conflict resolves

**This is a transcription of a design system that already exists.** Every token above was read out
of the Claude Design export — `Calibration Set.dc.html` for the section system, `Editor Sidebar
Kit.dc.html` for every control the app draws, and `claude-design-prompt-2.md` §0.1, which is the
brief that restates the whole system in words. Nothing here was chosen in this pass.

**Where this file and the export disagree, the export is right and this file is the bug.** That is
the opposite of the usual precedence, and it is deliberate. This spine outranks a mock or an import
the way a typed-up contract outranks the handwritten draft it was copied from: it wins *because it
is a faithful copy*. The moment it stops being one it has no authority at all. So a disagreement is
not a decision, not a refinement, and not resolved by preferring this document — go back to
`Calibration Set.dc.html` and the `Editor Sidebar Kit`, and correct the spine.

This is ruling **R-74** (`reconcile-designs-decisions.md` §A10, owner, 2026-09-02), binding until
the project finishes: **the export is the design authority for every surface.** A surface with no
frame is extrapolated from the nearest frame that exists — same components, same tokens — and drawn
in the same Claude Design project, never invented in prose beside it.

**Re-derived on 2026-09-04 against the Appendix A export.** The Calibration Set and the Editor Sidebar
Kit changed in exactly two tokens — the keyboard focus ring and the placeholder-and-hint colour (A7
items 7 and 10) — and every other value transcribed here was checked again against both frames and
against the whole export, and holds. Where a value moved, the old value is recorded beside the new
one, in the front matter and in the section that carries it. One disagreement inside the first export was
recorded rather than smoothed over: the Kit's inputs caption read "focus ring 2px @40%" while
the focused input it captions carried the solid ring — the drawing governed, and A9 item 2 corrected
the caption the same day (`reconcile-designs-decisions.md` §A15).

**Scope.** This spine governs **Inflozo's own interface** — the app chrome and the marketing site.
It does **not** govern the sites Inflozo builds. Those are the section library's business: their
colours come from the twelve Style Packs (PRD Appendix D), their responsive behaviour from the
fifteen archetypes in `R Responsive System.dc.html`, and neither is transcribed here. The one place
the two meet is the canvas, which renders the user's site inside Inflozo's chrome.

---

## Brand & Style

**"Playful Pro."** The polish, precision and spatial confidence of Framer, warmed with the
friendliness of Canva. Professional enough that a founder trusts it with their brand; playful
enough that choosing a section feels like a slot machine you always win.

**The promise the design has to radiate:** *building a beautiful site feels like play, and nothing
you do can make it ugly.*

Five principles, and they are load-bearing rather than aspirational:

1. **The canvas is sacred.** It renders a real website — zero grids, outlines or badges at rest.
   Editing affordances appear on hover and selection, and vanish on exit.
2. **Chrome recedes.** App chrome is quiet so the user's own site is the most colourful thing on
   screen. This is why in-app coral is buttons, selection outlines and small fills — never a field.
3. **Direct manipulation first.** Click text to type, drag to reorder, switch designs on the section
   itself. The sidebar is the second way to do everything, never the only way.
4. **Named values, visual choices.** Diagrams, swatches and words — Compact / Comfortable /
   Spacious. **Never px, hex or CSS anywhere in the section-level UI** (PRD Appendix C).
5. **Every state designed.** Empty, loading, error and success are first-class. Loading is
   **skeletons, not spinners**.

**Restraint check, run before any frame is called finished:** one coral action per surface ·
marigold only on Pro and celebration · canvas free of chrome at rest · hairlines, not heavy borders
· warm shadows only.

---

## Colors

Warm throughout. `{colors.paper}` is a warm off-white and the app background — **never pure white**;
`{colors.surface}` is the white that cards, panels and bars sit on, so depth reads as a card lifting
off paper rather than as a box drawn on a page.

**One accent per view. Coral leads.** `{colors.coral}` is *the* accent: primary actions, selection,
focus. Marigold is Pro-and-celebration seasoning only. A view with two accents has one too many.

**Coral has two values, and the difference is contrast, not taste.** `{colors.coral}` is the fill,
the selection outline and the caret — it appears on paper and on surface, where its job is to be
seen, not read. `{colors.coral-text}` is coral as **text and as a filled button's background**,
where AA contrast against white type is the constraint; `{colors.coral-text-hover}` is its pressed
state. The frames use both throughout and they are not interchangeable: coral-as-text at
`{colors.coral}` fails contrast, and a filled button at `{colors.coral}` fails it against white
type. The same pattern governs the three status hues — each has a fill value and a darker text
value, and the text value is what carries a sentence.

| Token | Role |
|---|---|
| `{colors.paper}` | app background |
| `{colors.paper-raised}` · `{colors.paper-sunk}` | a step lighter and a step darker, for nested panels and wells |
| `{colors.surface}` | cards, panels, bars |
| `{colors.ink}` | primary text, primary buttons. `{colors.ink-deep}` for dark chrome and inverted surfaces |
| `{colors.ink-soft}` | secondary text and labels. `{colors.ink-soft-aa}` where it carries a sentence |
| `{colors.ink-faint}` | disabled text, rules and dividers — **never words a user must read**: placeholder and hint text take `{colors.ink-soft-aa}` (Calibration Set, 2026-09-04) |
| `{colors.line}` | hairlines and dividers. `{colors.line-faint}` inside a card, `{colors.line-strong}` where a border must separate two lit surfaces |
| `{colors.coral}` / `{colors.coral-text}` | THE accent — see above |
| `{colors.coral-tint}` · `{colors.coral-tint-strong}` | selected backgrounds and accent washes |
| `{colors.marigold}` / `{colors.marigold-text}` / `{colors.marigold-tint}` | Pro badges, celebration, a nudge that does not block |
| `{colors.mint}` / `{colors.mint-text}` / `{colors.mint-tint}` | success, "Live" states |
| `{colors.sky}` / `{colors.sky-text}` | informational chips and docs links. **Links in an info banner take sky, not coral** |
| `{colors.danger}` | destructive fills and glyphs, deploy failures; `{colors.danger-text}` wherever danger carries words |

**Two token rules, added to the Calibration Set on 2026-09-04, and they hold in every frame, app and
section alike.** Keyboard focus is **one ring, everywhere** — 2px solid `{colors.coral-text}`, 7.9:1
on paper and past 3:1 on white, so it clears WCAG 2.1 1.4.11 on both grounds; the old 2px coral wash
at 40% composited to 1.55:1 and indicated nothing to anyone who needed it, and it stays only as
`{colors.coral-wash}`, for hover and selection. **Placeholders, hints and mono line numbers are
`{colors.ink-soft-aa}`** (5.85:1), never faint ink, which read at 2.53:1 on white and 2.32:1 on paper.

**Colour classifies, and the four feedback banners are where that is most visible** (Editor Sidebar
Kit): **sky** for information · **mint** for success · **marigold** for a notice that never blocks a
deploy · **danger** for an error, in a serious voice with no wit in it. A user should be able to
tell what kind of thing happened before reading the sentence.

**Dark surfaces appear in the app in exactly two places, and both are deliberate.** Inside the
canvas when previewing dark mode, and on the **template-surface canvases** — the Paywall editor
draws its chrome in `{colors.ink-deep}` rather than paper, which is how a canvas that is not a page
announces itself (`C Post Body.dc.html` C3a). Everywhere else app chrome is light. There is no app
dark mode in v1.

**The three canvas pills are ink.** The design counter, the content-source pill and the Pro mark
float over the user's site, so they are ink fills rather than surface cards — a white card over a
white page disappears.

---

## Typography

**Display and headings: Bricolage Grotesque**, 28–72px, tracking tightened as it grows. **UI and
body: Inter** — 13px dense, 14px default, 16px body. **Mono: JetBrains Mono**, and it has a job
rather than a mood: URLs, version chips, YAML, API keys, keyboard chips (its line numbers in `{colors.ink-soft-aa}`, never faint — S9, 2026-09-04), and **every number that
must not shift width as it changes** — the design counter reads "7 of 18" in mono so the 7 does not
jump when it becomes 17, and the stepper's value uses tabular figures for the same reason.

Scale: **12 · 13 · 14 · 16 · 20 · 24 · 32 · 44 · 60 · 72** for display and body. **The app frames
also set UI text at half steps — 9 · 9.5 · 10 · 10.5 · 11 · 11.5 · 12.5 · 13.5 · 15** — and use
them heavily: counted across the S, B, C and P0 frames and the Editor Sidebar Kit on 2026-09-03,
12.5px and 11.5px are the third and fourth most common sizes after 12 and 13, and the export's own
buttons are 13.5 / 12.5 / 14 (B13a, S12, S1a). **A story reads the size off the frame and never
rounds it to the nearest listed step** (F-111). Weights: Inter 400/500/600, Bricolage 500–800.

Three sidebar roles are fixed and appear on every panel (Editor Sidebar Kit):

- **Panel label** — 13px / 600 / 0.04em, uppercase, `{colors.ink-soft}`.
- **Control label** — 12px / 500.
- **Helper caption** — 11px, one line of guidance under a control. **Never jargon.** This is the
  line that carries a greyed control's reason, so it is a designed slot, not a tooltip.

Georgia and the other serifs that appear in the frames belong to the **user's site**, not to
Inflozo — they are the fixture publication wearing a Style Pack, and they never style app chrome.

---

## Layout & Spacing

**A 4px grid.** Panel padding 16 or 20. App gutters 24; marketing gutters open up to 120. Hairlines,
not heavy borders — a 1px `{colors.line}` rule does the work a 2px border would do elsewhere.

**The editor is one shape and it does not fold** (FR-D1): a slim top bar, a collapsible left Layers
panel, the centre canvas, and the right Controls sidebar at **280–320px**. Every control in the kit
is drawn to fit that width, which is why the vocabulary has no free-form inputs in it.

**Three breakpoints for Inflozo's own surfaces: 1440 · 834 · 390.** They are the same three numbers
the generated sites use, and that is a convenience rather than a shared system — `R Responsive
System.dc.html` describes the *sites*, not this app.

**Below 834px on a coarse pointer the editor is not offered** *(ruling R-76, owner, 2026-09-03,
refined by step 5's stress test; its width amended from 1024 to 834 by R-87, owner, 2026-09-04 — the tablet
A8 drew at 834 with touch, D8a, gets the editor)*. **It is a device test, not a width test:** a desktop at 200%
browser zoom presents roughly a 720px viewport and keeps the editor, because browser zoom is the
reader's accessibility setting and is not the canvas scale FR-D14 refuses. Sign In, the
Dashboard, Deploy history, Sites and Billing are drawn and usable at 390; the editor, the Section
Picker, Style Packs, Deploy, Routes, Assets, Editor Cards and the template surfaces are desktop and
tablet shapes. Opening a project below the floor lands on a designed surface that says so and
offers what does work — it is a state, not a broken layout. **All three widths are drawn since
2026-09-04**: the editor at 834 (`D8 Editor Below 1440.dc.html` D8a, touch) and at 720 (D8b, a 1440
display at 200% zoom), the notice at 390 (`D4 Dashboard Sheets and Blocks.dc.html` D4f). See
`EXPERIENCE.md` § Responsive & Platform.

---

## Elevation & Depth

**Warm shadows, never grey-blue.** Every shadow is cast in `rgba(28,27,26, …)` — the ink colour at
low alpha — because a neutral-grey shadow on warm paper reads as dirt.

| Level | Value | Where |
|---|---|---|
| `sm` | `0 1px 2px rgba(28,27,26,.06)` | cards at rest, the active segment of a segmented control |
| `md` | `0 4px 16px rgba(28,27,26,.08)` | card hover, popovers, the account and notifications menus |
| `lg` | `0 12px 40px rgba(28,27,26,.14)` | popovers at their heaviest, and the pills that float over the canvas |
| `modal` | `0 12px 40px rgba(28,27,26,.25)` | modals and sheets — `lg`'s geometry at a heavier alpha, which is how the export draws every one of them (D4a, D4b, S12c). Named 2026-09-05 by Story 1.5 |
| hairline inset | `inset 0 0 0 1px rgba(28,27,26,.12)` | a border that must not add to the box's size |
| focus | `0 0 0 2px #C2381F` | **the focus ring, everywhere** — solid coral-text since 2026-09-04; was `0 0 0 2px rgba(255,89,65,.4)` |

Hover on a card is `md` **plus a 1–2px lift**. The lift is what makes it feel physical; the shadow
alone reads as a glow.

**One focus treatment, and it is never removed.** A 2px solid ring in `{colors.coral-text}` — 7.9:1
on paper, past 3:1 on white (WCAG 2.1 1.4.11) — on every focusable thing including inside the canvas
iframe (NFR-5). *Until 2026-09-04 it was coral at 40%, which composited to 1.55:1 on paper and 1.59:1
on white and indicated nothing to anyone who needed it; A7 item 7 replaced it, the Calibration Set
now carries the rule, and D8c and D8e draw it. The 40% wash stays for hover and selection only.* The
tab order crosses that boundary by design, with
its ladder specified in `EXPERIENCE.md` § Accessibility Floor (PRD §7.3 assigns it to the UX pass). A design that runs to a bleed edge inverts it to an
inset offset, because an outward ring is clipped at the viewport (ruling R-70) — that is a section
rule, recorded here so the app never copies it.

---

## Shapes

| Radius | Applies to |
|---|---|
| 8px | inputs, chips, small controls |
| 10px | thumbnails, and the pills that float over the canvas |
| 12px | buttons, cards |
| 16px | panels, modals, sheets |
| 24px | floating pill bars |

The ladder is the aesthetic argument: small things are barely rounded, so they read as precise;
large things are rounded enough to feel soft. Nothing in the app is square and nothing is a capsule
except a pill bar and a badge.

**A section's radius is not this ladder.** Inside the canvas, corners come from the Style Pack's
radius token (Sharp / Soft / Round), and per-card corners are declined (ruling R-64).

---

## Components

Every component below is drawn in `Editor Sidebar Kit.dc.html` or in one of the S / B / C frames.
This section is the visual spec; **the behaviour is `EXPERIENCE.md` § Component Patterns**, and
where a component's behaviour and its look could drift, that file governs the behaviour and this one
governs the look.

**Buttons** — three heights, 44 / 36 / 32. **Primary** is an ink fill. **Coral is reserved for THE
action of a surface** and appears once: Ship it on the deploy wizard, Remix on the remix sheet,
Connect on the connect step. **Secondary** is surface plus a hairline. **Ghost** is text only.
**Danger** is a `{colors.danger-text}` fill under white type (`{colors.danger}` reads at 3.91:1), with an outline variant for the less final of two
destructive choices. A **split button** carries a primary action and a `▾` that opens its menu —
that is the Ship it control, and the `▾` is named "Deploy options" (A7 item 8).

**Inputs** — 8px radius, hairline border, coral caret, placeholder in `{colors.ink-soft-aa}`, and on focus a coral-text border with the ring above. A **mono value**
variant holds keys, URLs and YAML. A **search** variant carries a keyboard hint chip on its right.

**Segmented control** — 2 to 4 segments on a `{colors.paper}` track; the active segment is
`{colors.surface}` plus `sm`. **Named values only, never numbers** (Appendix C). A segment carrying
a dark-mode override shows a **moon badge**.

**Design picker** — a grid of **64×44 wireframe mini-diagrams**, ink lines with a coral highlight on
paper, active gets a coral ring. The strip shows twelve and then a `+N` tile rather than scrolling,
because a scrollbar 44px tall is a worse target than a tile (B1a). Above it, the counter — "7 of
18", mono, under a label reading **Design**, never "Layout".

**Swatch row** — seven colour roles as 24px circles: Background · Surface · Text · Muted · Border ·
Accent · Contrast. Active takes a coral ring. **Never a raw colour picker** — that lives only in the
Style Pack editor.

**Stepper** — `− n +` with tabular numerals. **Toggle** — 36×20, coral when on. **Visibility eye**
— shown and hidden. **Drag grip** — six dots.

**Select rows and menus** — a closed select may carry a mini thumbnail; a font row renders a live
"Aa" in the face itself; a dropdown marks the active row with a check.

**Radio cards** — the selected card takes a coral border and a `{colors.coral-tint}` wash, and each
card carries **one line of consequence, plainly said**. Hover firms up the hairline. Inline radios
inside a list are a 13px circle with a coral dot.

**Badges and chips** — Pro is a marigold-tint pill carrying **✦ and the word Pro**, as the kit and
B10 both draw it; Free is line-bordered and says Free; Live is a mint dot beside the word Live;
version chips are mono; a gscan result reads `0 · 2` in mono.

**Tooltips** — ink fill, white 12px, 6px radius, with a variant that carries a mono keyboard chip.

**Feedback banners** — one icon, one plain sentence, in the four colours above.

**Toast** — a bottom-centre pill: icon, message, action.

**Layers rows** — grip, mini-thumbnail, name, eye. Four states: rest, hover (the 40% wash), selected
(`{colors.coral-tint}`), and keyboard focus — the solid ring drawn over whichever state the row is
already in, so focused-and-selected reads as both (D8e). The **site-wide group** is a separate white card with its own drag icon and
a page count, so it reads as pinned rather than merely first.

**Composite cards** — the **quick-controls card** holds three to five most-used controls on a
surface card; the **pack cell** shows a glyph in the pack's own heading font, its palette as dots, a
pencil to edit, and a coral ring when active; the **variant thumb** pairs a name with one line.

**Empty panel** — "Nothing selected. Click any section on the canvas — its controls appear here."
Every empty state in the product is designed like this one: a sentence that says what to do, not an
apology.

**Loading** — skeletons matching the shape that is coming, and coral progress bars where a real
byte count exists. Never a spinner.

---

## Do's and Don'ts

**Do**

- Keep one coral action per surface, and let everything else be ink or secondary.
- Use the darker text value of a hue whenever it carries words. Contrast is not negotiable (NFR-5,
  zero axe-core violations, WCAG 2.1 AA).
- Show a **greyed control with its reason** in the helper-caption slot when the control exists here
  but cannot act right now. **Omit it entirely, with the panel saying why, when it could never act
  here.** The two mean different things and a user must be able to tell them apart (Appendix C,
  rulings R-33, R-68, `P0-0 Greyed Control Pattern`).
- Put mono on any number that changes in place.
- Design the empty state. Every surface has one and it is a first-class frame.
- Keep the canvas free of chrome at rest — outlines and name tags arrive on hover and leave on exit.

**Don't**

- Don't put px, hex, rem, percentages, font pickers, custom CSS or class names into a section
  control. They exist only in the Style Pack editor, the Routes Manager and Theme Settings.
- Don't use marigold for anything but Pro and celebration, and never for an error.
- **Don't let a shape carry a signal on its own, any more than a colour may.** A moon badge, a
  hollow-versus-filled dot, a ✦ — each carries its word, or an accessible label where the layout
  genuinely cannot hold one. Same rule, same reason (`EXPERIENCE.md` § Accessibility Floor).
- Don't use coral in a banner's link — that is sky.
- **Don't use the 40% coral wash as a focus ring.** It is hover and selection only; keyboard focus is
  the solid coral-text ring, everywhere (Calibration Set, 2026-09-04).
- **Don't set words in faint ink.** `{colors.ink-faint}` is for rules and dividers; a placeholder, a
  hint or a mono line number takes `{colors.ink-soft-aa}` (Calibration Set, 2026-09-04).
- Don't put wit into a billing, delete or takeover surface. Those stay serious (Appendix H).
- Don't add a second confetti moment. There is exactly one in the product — the first successful
  deploy — and it respects reduced-motion.
- Don't invent a component. If a surface needs something the kit does not have, extrapolate from the
  nearest frame and write a Claude Design prompt (`EXPERIENCE.md` Appendix A) so it is drawn in the
  same project.
- **Don't print a library total anywhere in product copy.** "Hundreds of gorgeous sections" is the
  canonical phrasing. Product *limits* — 10 stored versions on Pro and 3 on Free, 1 project · 1 site
  on Free, 10 MB per upload — are requirements and must be shown (Appendix H, FR-J14).

---

## Motion

Fast and springy, never floaty. Standard **160ms ease-out**. Overlays **200ms**, scale 0.98 → 1 with
a fade. Drag carries a slight spring and a 2° tilt. Hover lifts 1–2px. **Design switching: 180ms
horizontal slide-fade. Style Pack switch: 300ms crossfade** — long enough to see the site change its
mind, which is the moment the product is selling.

**One confetti moment exists**: the first successful deploy, and it respects `prefers-reduced-motion`
(Appendix H). Every motion rule above degrades to no motion under the same query.

---

## Icons & Illustration

**Tabler**, curated set, MIT-licensed, and the licence text ships inside the emitted theme (PRD
Appendix C, decision D1). 1.5px stroke at 16 and 20px. **Icons are drawn inline, once per use**
(ruling R-26) — no sprite file, no icon font: the markup is written where the icon appears, inherits
`currentColor` with no extra rule, costs no request, and survives with everything switched off.

> **Correction, recorded rather than smoothed over.** `claude-design-prompt-2.md` §0.1 names
> **Lucide**. Decision D1 chose **Tabler** afterwards and Appendix C carries it. The later decision
> wins; the prompt is a dated `record` and is not edited. The `Editor Sidebar Kit` names no icon
> library at all, which is `reconcile-designs.md`'s E4 finding and stands.

**Scope, ruled 2026-09-05 (R-92).** Tabler is the **sections'** set — the Icon Picker and every glyph
inside the sites customers build — and its licence ships in the emitted theme for that reason.
**Inflozo's own chrome draws the frames' icons as drawn**: Story 1.3's review compared the app kit's
paths with Tabler's and found them to be Claude Design's own, Feather-like drawings, copied verbatim
under R-74. The owner kept them and ruled the scope; `apps/web/components/kit/icons.tsx` states its
provenance and carries no Tabler notice, which returns with the first Tabler path — in the library.

**Empty states and 404s**: simple ink line drawings with one coral or marigold accent shape — never
corporate blob-people. **Section thumbnails**: abstract wireframe mini-diagrams, ink lines with a
coral highlight on paper.
