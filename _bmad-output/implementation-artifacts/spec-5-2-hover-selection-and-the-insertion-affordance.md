---
title: 'Story 5.2 — Hover, selection and the insertion affordance'
type: 'feature'
created: '2026-09-17'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

In the editor you can now point at any section on the page and click it. Pointing draws a thin coral outline with
the section's name in a small coral tag at its top-left corner; clicking keeps a slightly thicker outline on it, lights
up its row in Layers and fills the right-hand panel with that section's own settings — the Content, Layout and Style
panel you checked on the pilots page — where every change shows on the page at once, and Esc lets the section go.
Nothing you change survives a reload until Story 5.8 adds saving, the buttons that ride on a hovered section arrive
with the stories that make them work (your ruling on Question 1), and on a Free account a selected Pro design also
shows a small gold "✦ Pro" tag in its top-right corner (Question 2).

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The editor draws the site, but nothing on it answers the pointer: a section cannot be pointed at or
chosen, and the settings panel beside it is empty (FR-D2, FR-D3, UX-DR6). Story 4.5's section panel is mounted only on
the `/pilots` and `/controls` review pages.

**Approach:** The editor marks the section root under the pointer or the click with `data-inflozo-hover` or
`data-inflozo-selected`, from the parent document; the chrome stylesheet draws both outlines at their drawn on-screen
widths, and the name tag is drawn outside the frame, anchored to the root with Floating UI. Selecting a section mounts
Story 4.5's `Sidebar` for that instance over an in-memory copy of the project's docs: a control change stamps the live
root, a content change repaints. Each quick-action button, the "+" and click-to-type arrive with the story that makes
them work (R-118); a selected Pro design on a Free account carries the Kit's Pro badge (R-119).

## Boundaries & Constraints

**Always:**
- Chrome exists only while something is hovered or selected. Every chrome rule is keyed on a `data-inflozo-*`
  attribute (`pilots.test.ts`), and a root carries one only while hovered or selected. After every paint and every
  `stampControls` the editor re-applies its attributes, because `stampControls` strips every root `data-*` it does not
  own — `data-inflozo-selected` included (`core.ts:1187-1205`).
- A press inside the canvas selects and does nothing else: no link navigates, no form submits, no `<details>` toggles,
  no field in the site takes focus, nothing drags out of the frame.
- Edits live in memory for the session. There is no writer of `project_templates` (5.8 writes first); a reload or a
  typed address starts again from the stored docs.
- The panel is Story 4.5's `Sidebar`, mounted and not redrawn (R-113's groups, R-114's pills, R-115's confirm), fed
  the inputs `/pilots` feeds it.
- A control change stamps the live root and never repaints (`/pilots`' fast path); a content change repaints the canvas.
- A selection survives focus moving to the panel, Layers or the top bar. It is cleared by Esc, by selecting another
  section, or by a change of canvas (EXPERIENCE.md § The focus model across the canvas boundary, (2); deleting is
  5.4's).
- R-74: the hover and selected states match S4b and S4c for every part this story builds. The panel is R-113's, never
  S4c's pinned Quick Controls card.
- Zero chrome at rest still holds: with nothing hovered or selected, no element in the canvas document carries a
  `data-inflozo-*` attribute.

**Ask First:**
- Any dependency beyond `@floating-ui/dom` 1.8.0, pinned exactly, in `apps/web` (AD-21 names Floating UI for chrome
  outside the frame).
- Any edit under `packages/library/designs/`, and any render-matrix baseline change. The chrome stylesheet must change
  no pixel at rest.
- Any write to the owner's account. None is needed: Story 5.1's "Pilot sections" is the fixture.

**Never:**
- Absent here, built by the story named (R-118): the quick-action pill — previous and next design
  (5.11), Duplicate, Delete and the drag handle (5.4) — the "+" insertion line (5.10), typing into text on the canvas
  (5.3), pressing a Layers row (5.4), the design picker and its "4 / 18" position chip (5.11), saving and undo (5.8).
- No node, class, style or attribute added to the site's markup beyond the two chrome attributes. No script in the
  canvas document, no `'unsafe-eval'`.
- No colour or shadow literal in a `.ts`/`.tsx` under `apps/web` (`tokens.test.ts`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Hover | mouse enters a section | a 1px coral outline on its root, the name tag (its layer name) at the root's top-left, its Layers row washed | N/A |
| Hover moves | mouse crosses into the next section, or leaves the canvas | the chrome moves with it, or clears | N/A |
| Hover the selection | mouse over the selected root | the 1.5px outline stays and the name tag shows | N/A |
| Select | click anywhere in a section, a link or a button in it included | 1.5px outline, Layers row in coral tint, and the panel, headed with the layer name, holds its settings; the frame's address does not change | the canvas document's `click`, `submit`, `dragstart` and `mousedown` defaults are prevented |
| Select another | click a second section | the selection and the panel move to it | N/A |
| Select a Pro design | a Free account selects Hero — Latest Post (`tier: "pro"`) | the Kit's "✦ Pro" badge at the root's top-right while it stays selected; nothing is disabled and a click on the badge does nothing (B10, R-119) | a Pro account, or a failed entitlement read that degrades to Free (AD-28), follows its plan: no badge on Pro |
| Click nothing | click below the last section, the canvas ground or a Layers row | the selection stays | N/A |
| Nothing selected | the editor opens, or after Esc | PAGE, then the Kit's `EmptyPanel`: "Nothing selected" · "Click any section on the canvas — its controls appear here." | N/A |
| Control change | Three Up selected, Layout → Per row → Two | its root's `data-per-row` becomes `two` in place, and the selected outline is still drawn | a refused value is the engine's sentence, as on `/pilots` |
| Content change | Latest Post selected, Content → Headline typed | the headline on the canvas follows each keystroke, and the section stays selected | N/A |
| Reset | a changed control, then Reset this design → Reset design | the root is back at the design's defaults and still selected | Cancel changes nothing |
| Site-wide | Header — Rail selected, Section Settings → On scroll → Static | the header root's `data-on-scroll` becomes `static` | N/A |
| Esc | a section selected, focus in the canvas, on the page or on a panel button | the section is deselected | Esc inside a text field, a select, an open picker or the reset dialog belongs to that control, and the section stays selected |
| Tap and hold | touch held 500 ms on a section without moving | the hover state shows and nothing is selected | moving more than 10 px cancels; lifting sooner without moving is a tap, and a tap selects |
| Gated section | a section whose render is empty (a root `data-if` that is false) | nothing to hover or select on the canvas; its Layers row stays | N/A |
| Reload | after changes | the stored docs, unchanged | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` — Story 5.1's editor:
  - `paint()` (:107-126) renders `stack` through `lib/canvas.ts` and joins the strings into `#canvas`.
  - `scale` (:163) is the fit the chrome divides by; the iframe is `transform: scale(…)` at 1440 wide (:204-211).
  - The Controls `<aside aria-label="Page settings">` (:216-229) holds `PanelLabel` "Page" and its fold, nothing else.
  - Layers rows are `interactive={false}` (:195-197). The header comment's absent list (:35-38) names "the rail's
    thumbnails (5.2, 5.4)".
- `apps/web/lib/canvas.ts` — `renderSection` (:39-71) returns one root element's markup or the empty string (a root
  `data-if`); `mountSections` (:75-78).
- `apps/web/lib/canvas-chrome.css` — one rule: the selected outline at 1.5px, not divided by the fit.
- `apps/web/pilots.test.ts:37-43` — every chrome selector keyed on `[data-inflozo-`; the canvas document carries the
  file verbatim.
- `packages/section-runtime/src/core.ts:1187-1205` — `stampControls` removes every root `data-*` that is not a
  directive before it stamps, so a control change wipes the selected attribute.
- `apps/web/components/controls/sidebar.tsx` — `Sidebar` (:47-59 props, :170); `onChange(next, 'control' | 'content')`;
  the reset confirm is a `<dialog>` (:318-350).
- `apps/web/app/(app)/app/(authed)/pilots/review.tsx` — the mount to follow:
  - `onChange` (:148-159): stamp on `control`, repaint otherwise.
  - The panel header, `entry.name` at 13/600 uppercase (:248); the `Sidebar` keyed per design (:250-260).
  - Its image thumbnails use `controls/frame?image=` (:200). That is relative, and wrong from `/projects/<id>`. The
    editor uses the canvas route's `?image=`, which serves the same `feature-*` files (`lib/pilots.ts` `pilotImage`,
    `lib/controls-review.ts:44-55`).
- `apps/web/lib/controls-review.ts` — `imagePool()` (:44), `referenceSwatches()` (:67), `linkResources()` (:82): server
  reads the loader passes down. The time zone is `orbitWeekly.site().timezone`, as `controls/page.tsx:36` reads it.
- `apps/web/app/(app)/app/(authed)/projects/[id]/read.ts` — `editorData` (:42-76) already reads `imagePool()`;
  `EditorData` (:35-40) is what the layout hands the client.
- `apps/web/components/kit/layers-row.tsx` — `interactive={false}` ignores `selected` (its prop comment :25-29, the branch
  :31-38); the interactive row draws `bg-coral-tint` when selected and `hover:bg-coral-wash` (:41).
- `apps/web/components/kit/empty-panel.tsx` — `EmptyPanel({ title, instruction })` IS the Kit's panel empty state
  (`Editor Sidebar Kit.dc.html:265-271`), drawn in tokens and catalogued on `/kit`: mount it, never redraw it.
- `apps/web/components/kit/badge.tsx` — `ProBadge`, a marigold-tint `<span>` reading "✦ Pro", never a button (UX-DR19).
  DESIGN.md § Badges: "Pro is a marigold-tint pill carrying ✦ and the word Pro, as the kit and B10 both draw it".
- `apps/web/lib/entitlement.ts:34-49` — `resolveEntitlement(userId)`, `cache`d, degrades a failed read to Free (AD-28);
  `apps/web/lib/plan.ts` `PlanId`. A design's tier is on its entry, `SectionRegistryEntry.tier` (`packages/library/src/
  registry.ts:156`, from `design.json`): `a4/13` is `pro`, the other four pilots `free`.
- `apps/web/components/kit/labels.tsx` (`PanelLabel`), `greyed.ts` (`ring`), `icons.tsx`.
- Tokens, already twinned in `globals.css`: `coral` #FF5941 (the outlines), `coral-text` #C2381F (the tag), `coral-tint`
  #FFEDE8 (the selected row), `coral-wash` (the hovered row — D8e's wash over S4b's ink 4%, as `LayersRow` already
  draws it), `line-strong`, `line`, `coral-tint-strong` (the empty state's drawing).
- Frames:
  - `S4 Editor.dc.html` S4b (:137-246): the outline, `border:1px solid #FF5941`, inset 0 (:181); the tag,
    `background:#C2381F;color:#FFFFFF;font-size:11px;font-weight:600;padding:3px 9px;border-radius:0 0 6px 0` at the
    top-left (:181); the hovered section's Layers row washed (:167).
  - S4c (:249-366): the outline at 1.5px (:293); the selected row `#FFEDE8` (:279); the panel header "HERO" at 13/600
    uppercase (:339); the "4 / 18" chip (:340, 5.11's); the pinned card (:342-346, never built — R-113).
  - `B Missing Surfaces.dc.html` B10 (:1424-1451): on a Free account a selected Pro design carries a marigold pill at
    `top:8px;right:8px` inside the section, "on selection only … a price tag, not a lock" (:1451). It draws that
    selection's outline at 2px (:1427) where S4c draws 1.5px; S4c is this story's named frame and wins.
  - `Editor Sidebar Kit.dc.html:265-271`: the panel's empty state — a centred column (gap 10, padding 22px 12px), a
    64×44 drawing (a dashed `#C9C2B8` frame, a `#E7E2DB` bar, a `#FFD9CF` block), "Nothing selected" at 13/600, and
    "Click any section on the canvas — its controls appear here." at 12px `#6E6A64`, line height 1.5. It is the only
    place the export draws that sentence.
  - Where the frames disagree (a sweep of the whole export, 2026-09-17), S4b and S4c are this story's named frames
    and win:
    - the outline is 1px on hover (S4b) and 1.5px selected (S4c, S6), but 2px with a 4px radius in B1b, B10, C2a and D5c;
    - the hovered Layers row is washed in ink at 4% in S4b and the Kit (:222), and in coral at 40% in D8e (:387). DESIGN.md
      and `LayersRow` follow D8e;
    - the selected row is weight 500 in S4c (:279) and 600 in the Kit (:223), B7 and D8e. `LayersRow` follows the Kit.
  - Drawn elsewhere, so not this story's: B1b (:425-451) puts the design arrows, the position and Shuffle in an ink
    pill of their own at the section's top-left (5.11's); S4c's "Next design ]" tooltip (:293) belongs to those
    arrows.
  - Drawn nowhere, so extrapolated (R-74): tap-and-hold (D8a draws no canvas chrome on touch, and no frame draws a hold),
    Esc deselecting, and what a first click on text does.
- `@floating-ui/dom@1.8.0`, `dist/floating-ui.dom.mjs` (read in the npm tarball, 2026-09-17):
  - `getBoundingClientRect` (:77-128) walks each `frameElement`, multiplying by the iframe's own transform scale
    (`getScale(currentIFrame)`) and adding its rect. AD-21 rests on this; the harness executes it rather than assuming it.
  - `autoUpdate` (:621) with `animationFrame: true` is the loop, and it runs only while the tag shows.
- `tools/probe/run-verify-editor.cjs` — steps 1–9 from Story 5.1. Steps 3 and 4 read the canvas at rest, before
  anything is hovered; step 5 is the CSP session; step 8 is axe.
- Design facts the harness and the owner's test use, from `packages/library/designs/*/*/design.json` and
  `a4/content.json`: Three Up's Per row `two · three · four` (Layout); Latest Post's `headline` text prop (Content);
  Rail's `on-scroll` `static · sticky · shrink` (Section Settings). Each panel's groups, computed through `sidebar()`
  with default state (executed 2026-09-17): Rail — Section Settings · Content · Layout · Style; Latest Post, Three Up,
  Inline Row and Centred — Content · Layout · Style. No pilot has a Data group.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/lib/selection.ts` (+ `apps/web/selection.test.ts`) -- the pure half, so `node --test` reaches it:
  - `sectionRoots(parts, mount)`: pairs each non-empty render with the next root element, in order. A gated section has
    no root.
  - `rootFrom(target, roots)`: the root an event target sits in, walking `parentElement`.
  - `escDeselects(target)`: false inside `input`, `textarea`, `select`, a `contenteditable` or an open `dialog`.
  - `withState(docs, key, instanceId, state)`: new docs with that instance's `content`, `controls`, `data` and
    `darkOverrides` replaced, and nothing else touched.
  - `hold`: tap, hold or cancel, from pointer down, move, up and cancel with their times and positions (500 ms,
    10 px). A completed hold swallows the click that may follow its lift, so a hold never selects.
  - Tests with plain objects cover each branch, including a gated section and Esc inside a dialog.
- [ ] `apps/web/lib/canvas-chrome.css` -- two rules: `[data-inflozo-hover]` a 1px coral outline and
  `[data-inflozo-selected]` 1.5px, each width `calc(Npx / var(--inflozo-fit, 1))` with a matching negative offset; the
  selected rule wins when both are set. `pilots.test.ts` passes unchanged.
- [ ] `apps/web/package.json` + `pnpm-lock.yaml` -- `@floating-ui/dom` 1.8.0, exact.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/read.ts` + `layout.tsx` -- `EditorData` gains `swatches`,
  `links`, `timezone` and each pool picture's `bytes`, which the `Sidebar` needs, and the account's `plan` from
  `resolveEntitlement` (R-119).
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` -- hover, selection and the panel:
  - **State.** The docs become state, initialised from the props, and `stack` and every paint read that state.
  - **After each paint.** `sectionRoots` pairs roots with stack entries. `--inflozo-fit` is set on the canvas
    document's root style whenever `scale` changes. `data-inflozo-selected` is re-applied, and the hover clears.
  - **Canvas listeners**, added once the canvas document loads:
    - `pointerover` and `pointerout` (a `null` `relatedTarget` is leaving the canvas), for mouse and pen only, set
      and clear `data-inflozo-hover`.
    - `click` selects.
    - `click`, `submit`, `dragstart` and `mousedown` have their defaults prevented.
    - Touch runs `hold`.
    - `keydown` Esc, on both documents, deselects when `escDeselects` allows.
  - **The name tag.** One `aria-hidden`, `pointer-events-none` element inside the page card, so the card clips it:
    - Its look is S4b's: 11/600 Inter, white on `coral-text`, padding 3px 9px, radius 0 0 6px 0.
    - `computePosition`, with the hovered root as reference, puts its top-left on the root's.
    - `autoUpdate(…, { animationFrame: true })` runs only while the tag shows.
  - **Selected.**
    - Layers: the selected row draws `selected`, the hovered row the wash.
    - The aside is labelled "Section settings", headed with the instance's `layerName` in `PanelLabel`, and holds
      `<Sidebar key={docKey:instanceId}>`.
    - `onChange` writes `withState`, then either stamps the root and re-applies the attribute (`control`) or repaints
      (`content`).
    - Image thumbnails use the canvas route's `?image=`.
  - **Nothing selected.** PAGE, then `<EmptyPanel title="Nothing selected" instruction="Click any section on the canvas
    — its controls appear here." />`. The aside is labelled "Page settings".
  - **The Pro tag (R-119).** On a Free plan, while a design whose `tier` is `pro` is selected, `ProBadge`
    sits at the selected root's top-right, 8px in, anchored the way the name tag is. It stays the Kit's `<span>`: its
    word is its label, and it is never pressable.
  - **A change of canvas** (`key`) clears the selection.
  - **Comments.** Rewrite the header comment: what is built now, and what stays absent until which story.
- [ ] `apps/web/components/kit/layers-row.tsx` -- `interactive={false}` draws `selected` (coral tint) and a new
  `hovered` (coral wash), as display only: still no button, grip or eye. Update its comment; `/kit` is unchanged.
- [ ] `tools/probe/run-verify-editor.cjs` -- steps 10–14 under Verification, and step 5's session and step 8's axe
  extended as listed there.
- [ ] Propagation (standing rules 3 and 7):
  - `ARCHITECTURE-SPINE.md`, AD-21's Story 5.1 amendment. The name tag moves outside the frame, beside the pressable
    chrome and anchored the same way, and outlines divide by the fit. Give the reason (Design Notes), dated and citing
    this spec.
  - `EXPERIENCE.md` § Editor shell's settled paragraph: the same move.
  - `epic-5-context.md` sub-bullets:
    - the tag outside, and the fit variable;
    - `stampControls` stripping the chrome attributes;
    - the spine's rule that the CSP proof re-runs at each Epic 5 story's Review.
  - `epics.md`, R-118's and R-119's open targets, ticked in `reconcile-designs-decisions.md` as they land:
    - Story 5.2's criteria and frame line: hover, selection, the panel, Esc, the empty state and the hold, plus B10's
      Pro tag.
    - Story 5.4 gains the canvas pill's Duplicate, Delete and drag handle (S4b), and moves the pill or the Pro tag
      out of the top-right corner they share.
    - Story 5.10 gains the hairline "+" between sections (S4b), inserting at the position it was invoked from.
    - Story 5.11's hover arrows are named as FR-D2's ◀ ▶.
    - Story 5.3 gains FR-D3's click on a text element inside a selected section.
  - `deferred-work.md`:
    - DW-116: "Story 5.2's section drag handle" becomes Story 5.4's.
    - DW-167: the reset wiring is now also walked in the editor (step 12), but still not by `pnpm check`. The owner
      becomes Story 5.9, whose keyboard journey is the editor's first browser test.
  - End with `git grep -n "rail's thumbnails (5.2\|name tag" -- apps _bmad-output/planning-artifacts` and read every hit.

**Acceptance Criteria:**
- Given the seeded project at 1440×900, when the mouse rests on Hero — Latest Post, then:
  - its root draws a 1px coral outline on screen;
  - the name tag reads "Hero — Latest Post", its top-left within 1px of the root's top-left on screen;
  - its Layers row carries the wash.
  All three **match frame S4b** (`S4 Editor.dc.html` S4b).
- Given that hover, when the section is clicked, then:
  - its outline is 1.5px on screen and its Layers row is coral tint;
  - the "Section settings" panel is headed HERO — LATEST POST, holds R-113's groups in order and has "Reset this
    design" at its foot;
  - there is no pinned card and no design picker.
  This **matches frame S4c** as R-113 redraws its panel.
- Given a Free account (R-119), when Hero — Latest Post is selected, then the Kit's "✦ Pro" badge sits
  8px inside its top-right corner on screen, and it goes when the selection does (`B Missing Surfaces.dc.html` B10);
  on a Pro account it never shows.
- Given nothing selected, when the Controls sidebar is read, then it shows the Kit's empty state, "Nothing selected" ·
  "Click any section on the canvas — its controls appear here." (UX-DR6).
- Given a touch device, when a section is held for 500 ms, then the hover state appears and nothing is selected; and
  a tap selects (UX-DR18).
- Given the editor after hovering, selecting and pressing Esc, when the canvas document is read, then no element
  carries a `data-inflozo-*` attribute.
- Given the deployed editor, when the CSP session hovers, selects, changes a control and a headline, resets and presses
  Esc, then it records zero `securitypolicyviolation` events in either document, with the `EvalError` control holding.
- Given the editor with a section hovered, and again with one selected, when axe-core runs at WCAG 2.1 AA after its
  positive control, then it reports zero violations.

## Spec Change Log

## Design Notes

### Why the name tag leaves the frame (amending AD-21 as Story 5.1 worded it)

Story 5.1 placed the name tag inside the frame, as CSS on the root. Built that way, it breaks three ways, each read in
the source:
- **Its position belongs to the design.** A `position: absolute` pseudo-element sits against the nearest positioned
  ancestor. Four of the five pilot roots set no `position` (their `style.css`), so the tag would land in the page's
  corner, unless the chrome set `position: relative` on the root: a design's layout property, changed by hovering.
- **It shrinks with the fit.** Everything inside the frame is drawn at the fit scale. In the 864px card at a 1440
  window, S4b's 11px tag would render at 6.6px (`transform: scale(…)`, `editor.tsx:210`).
- **It has no Inter of its own.** The canvas document declares no `@font-face`: `reference-tokens.css` names
  `'Inter', sans-serif` and the machine decides, while the editor document self-hosts Inter through `next/font`.

Outside, beside the pressable chrome AD-21 already places there, none of the three applies, and Floating UI resolves
the scaled frame itself (Code Map). The outlines stay inside, as the root's own `outline`: they need no positioning,
and they follow a sticky root for free. Their width divides by `--inflozo-fit`, so S4b's 1px is 1px on screen.

### Choices made here, one line each

- **Hover is mouse and pen only.** Touch has the hold, so a tap never flashes an outline before it selects.
- **The panel's header is the instance's layer name**, as Layers prints it. S4c's category word and its "4 / 18" chip
  belong to the design picker (5.11).
- **The Layers rows mirror the canvas, but cannot be pressed** until Story 5.4 gives them their keys.
- **A change of canvas clears the selection.** Only a soft navigation keeps the editor mounted, and none exists before
  Story 5.5's switcher, which decides what a site-wide selection does across canvases.
- **Nothing is saved before Story 5.8.** A typed address or a reload loads the document again, from the stored docs.
- **At rest the panel is PAGE over the Kit's empty state.** S4a draws the Page panel's own rows at rest, but those
  rows are Stories 6.3's and 5.6's; they decide where the sentence sits beside them.
- **B10's Pro tag takes the top-right corner that S4b gives the quick-action pill.** Under R-118 the corner is free
  until Story 5.4 builds the pill, and that story moves one of the two.
- **A section taller than the view shows its tag only while its top is in view.** ponytail: a tag pinned to the
  card's top edge is the upgrade, if a test asks for it.

## Verification

**Commands:**
- `pnpm check` (Node 24 on PATH) -- expected: green, including `selection.test.ts`, `pilots.test.ts`, `tokens.test.ts`,
  `busy.test.ts` and `doc-schema-jitless.test.ts`
- `bash tools/matrix/run-matrix-gate.sh` -- expected: green, with no baseline written
- `python3 tools/doc-audit.py --check`, run twice -- expected: exit 0
- `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs) node tools/probe/run-verify-editor.cjs`,
  after CI deploys HEAD -- expected: every step PASS against `https://app.inflozo.com` and production Supabase. It uses
  two throwaway accounts, deleted in `finally`, with the user count equal before and after.

**What the new steps check**, on the seeded Home canvas at 1440×900:
10. **Hover.** The mouse rests on each root in turn.
    - The computed outline width × fit is 1 ± 0.05px, in `rgb(255, 89, 65)`.
    - The tag's text is the layer name and its styles are S4b's.
    - The tag's top-left on screen is within 1px of the root's rect mapped through the iframe's rect and scale. This
      executes the Floating UI claim.
    - The hovered Layers row is washed, and leaving the canvas clears all of it.
11. **Select.**
    - A click on the Rail header's Archive link (Orbit Weekly's `site.navigation`) selects Header — Rail, and the canvas
      document's `location.href` does not change.
    - The outline is 1.5 ± 0.05px on screen and the Layers row is `rgb(255, 237, 232)`.
    - The aside is labelled "Section settings" and headed HEADER — RAIL, its accordions in R-113's order for that
      design, and no element reads "4 / 18".
    - Clicking Three Up moves the selection.
    - The Pro tag (R-119): on account A (Free), selecting Latest Post shows "✦ Pro" 8 ± 1px inside the root's
      top-right on screen; Three Up (`free`) shows none; Esc removes it. Control: A's `entitlements.state` set to
      `pro_active` through the service key and the editor reloaded, Latest Post selected shows none; the row is
      restored in `finally`.
12. **Edits.**
    - Three Up · Per row → Two stamps `data-per-row="two"`; the root node is the same node, and it still carries
      `data-inflozo-selected`.
    - Typing into Latest Post · Headline changes the canvas headline to match.
    - Reset this design → Reset design restores `data-per-row="three"`. This walks DW-167's wiring in the editor.
    - A reload shows the stored values.
13. **Esc.**
    - Esc from the canvas deselects, and the sidebar shows the empty state.
    - With the reset dialog open, Esc closes the dialog and keeps the selection.
    - Then the rest check: zero `data-inflozo-*` attributes in the canvas document.
14. **Touch.** A CDP touch held 600ms on Latest Post shows its outline and tag, with nothing selected; a 50ms tap
    selects it.

Step 5's CSP session adds the gestures of steps 10–13, and reads its zero after them. Step 8's axe runs twice more:
with Three Up hovered, and with it selected.

**At Deploy (DW-175's owner).** Repeat the interleaved probe and the fresh-connection `curl` loop once. If the rate
holds, the timestamps and the IP go to Vercel support; if it has gone, close DW-175 with the two runs as the record.

## Owner's manual test

The project is the "Pilot sections" project that Story 5.1's Deploy added to your account; Deploy re-checks its address.
Sign in as you normally do. If a page stays blank, refresh once and tell us (DW-175).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Move the mouse slowly down the page, over each section in turn, with `S4 Editor.dc.html` S4b open beside it. | — | Each section in turn gets a thin coral outline and a small coral tag at its top-left corner with its name ("Header — Rail", "Hero — Latest Post", and so on), and its row in Layers lights up. There are no buttons and no "+" line: those come with Stories 5.4, 5.10 and 5.11, as you ruled. Moving off the page clears it. |
| 2 | same | Canvas | Click "Hero — Latest Post", then move the mouse away. | — | A slightly thicker outline stays on it; its Layers row turns light coral; the right panel is headed HERO — LATEST POST, with Content, Layout and Style, and "Reset this design" at the bottom. Compare it with S4c, minus S4c's pinned top card, which your R-113 ruling removed. If your account is on Free, a small gold "✦ Pro" tag also sits in the section's top-right corner, as you ruled; on Pro it does not. |
| 3 | same | Right panel | Open Content and replace the Headline. | `Hello from the owner test` | The headline on the page changes as you type. |
| 4 | same | Canvas, then the right panel | Click "Post Grid — Three Up", open Layout and press **Two** under Per row. | — | The selection moves to Three Up, and its cards change to two per row at once. |
| 5 | same | Right panel | Press **Reset this design**, then **Reset design**. | — | It asks first; after you confirm, the cards go back to three per row. |
| 6 | same | Canvas | Click **Archive** in the header's navigation. | — | The header is selected, and the link opens nothing: you stay in the editor. |
| 7 | same | Keyboard | Press Esc. | — | The outline goes, the Layers row returns to normal, and the right panel shows PAGE, a small drawing, "Nothing selected" and "Click any section on the canvas — its controls appear here." |
| 8 | same | Browser | Reload the page. | — | The headline you typed and the other changes are gone. Saving arrives with Story 5.8. |
| 9 | same, on an iPad or a touchscreen, if you have one | Canvas | Hold a finger on a section for about half a second and lift it; then tap the section once. | — | Holding shows the outline and the name tag without choosing the section; the tap chooses it. |

## Questions for the owner

### Question 1 — which of the buttons on a hovered section should work in this story?

**Plain English:** This story's plan puts five buttons on a section you point at — previous design, next design,
Duplicate, Delete and a drag handle — plus a "+" line for adding a section, and click-to-type on its text. Most of them
depend on a later story: the design arrows need a second design to move to, and Story 5.11 draws them in a dark pill of
their own (drawing B1b); "+" opens the Section Picker (5.10); and typing on the page is 5.3. Duplicate, Delete and drag
could be built now, but the Layers panel in 5.4 builds the same three with the rules for the header and footer, and
nothing is saved until 5.8. In Story 5.1 every button whose job belonged to a later story was left out until that story,
and you found no gap that mattered. The same rule here leaves this story with the outline, the name tag, selection and
the settings panel: less than its plan lists, and without the "+" its name mentions. Development waits on this answer.

**Example:** you point at "Hero — Latest Post". With option 1 you see the coral outline and its name tag, and a click
fills the right panel with its settings. With option 2 you also see a small white pill with Duplicate and Delete in it;
Duplicate puts a second Latest Post under the first, and a reload brings the page back as it was.

1. **The outline, the name tag, selection and the settings panel now, and each button with the story that makes it
   work:** Duplicate, Delete and drag with 5.4, the design arrows with 5.11, "+" with 5.10 and typing on the page with
   5.3. Nothing on screen does nothing, and 5.2 stays a small story. **(RECOMMENDED)**
2. **Option 1, plus Duplicate and Delete working now,** in the white pill S4b draws. The header and footer cannot be
   duplicated, and ask before they are deleted; nothing is kept after a reload until 5.8. Drag, the arrows, "+" and
   typing still arrive with 5.4, 5.11, 5.10 and 5.3. It makes this a bigger story, because the pill and the header and
   footer rules move here from 5.4.
3. **The whole pill and the "+" line drawn now, exactly as S4b shows them,** with each button greyed and a line naming
   the story that turns it on. You see the finished look early, but you also see buttons that do nothing, which the
   project's rule for greyed controls exists to prevent.

**Ruled: option 1 (owner, 2026-09-17).** Recorded as R-118. This story builds hover, selection, the settings panel, Esc,
the empty state and the hold. Duplicate, Delete and the drag handle arrive with 5.4, the design arrows with 5.11, the
"+" with 5.10 and typing on the page with 5.3, each absent until then; `epics.md` moves the criteria in the Dev run.

### Question 2 — should a selected Pro design show its gold "Pro" tag in this story?

**Plain English:** The design export draws one more thing on a selected section. When someone on the Free plan
selects a Pro design, a small gold tag with a ✦ and the word Pro sits in the section's top-right corner (drawing B10).
It is a price tag, not a lock: nothing is disabled, clicking it does nothing, and the upgrade question comes once, at
deploy. No story in the plan builds this tag. Of your pilot sections, Hero — Latest Post is the Pro design, so it is
the one that would show it.

**Example:** on a Free account you click "Hero — Latest Post", and a gold "✦ Pro" tag appears in its top-right corner
beside the coral outline; press Esc and it goes. On a Pro account nothing extra appears.

1. **Build it in this story,** because it is part of what a selected section shows: only while selected, only on a
   Free account, and it does nothing when clicked. It reuses the Pro badge the design kit already has. **(RECOMMENDED)**
2. **Build it with the Section Picker (Story 5.10),** which shows the same Free and Pro marks on every design it
   offers, so the two arrive together.
3. **Build it with the Pro-sections sheet at deploy (Story 12.3),** which decides everything else a Free account is
   told about Pro designs.

**Ruled: option 1 (owner, 2026-09-17).** Recorded as R-119. On a Free plan, while a Pro design is selected, the Kit's
"✦ Pro" badge sits 8px inside its top-right corner; it goes with the selection and is never pressable.

### Question 3 — the outlines come out thinner than drawn: how should they be drawn?

**Plain English:** The coral outline around a section is meant to be 1 pixel when you point at it and 1.5 pixels when
you click it (S4b, S4c). The page inside the editor is shown shrunk to fit the window, so the plan drew the line
thicker inside the page to come out right after shrinking. The browser does not allow that: it rounds an outline's
thickness down to a whole pixel before shrinking it. Measured on the built editor at a 1440-wide window (Dev run,
2026-09-17, harness steps 10 and 11): the pointing outline shows at 0.6 pixels, faint and pinkish, and the clicked one
at 1.2. Everything else in this story works. Development is finished apart from this, and the check that measures it
fails until you rule.

**Example:** you point at "Hero — Latest Post" in a 1440-wide window. Today the outline is a pale hairline you have to
look for. With option 1 or 2 it is the crisp 1-pixel coral line S4b draws.

1. **Draw both outlines outside the page, like the name tag:** a coral box placed over the section and kept on it as
   it scrolls. Exact at every window size, on top of pictures, and it changes nothing in the section. It moves the
   outlines to the same side of the canvas boundary as the tag, which the architecture notes record. **(RECOMMENDED)**
2. **Draw them inside as a shadow line on the section's inner edge.** Exact thickness, but a picture or coloured block
   that reaches the section's edge covers the line, and while pointed at it replaces a section's own shadow (Header —
   Rail's "Shadow" divider would vanish on hover).
3. **Keep the browser's rounding** and accept the thinner line: 0.6 and 1.2 pixels at 1440 wide, and never exact —
   even at full size the clicked outline rounds down to 1 pixel. The check is loosened to match.

Re-measured with a control in the Dev run's closing check (headless Chromium, 1× and 2× screens): an outline of 1px at
full size draws 1px, so the measurement holds; at the editor's 0.6 fit `calc(1px / 0.6)` computes to 1px and
`calc(1.5px / 0.6)` to 2px, and 1.5px at full size computes to 1px.

This question changes the Approach you approved ("the chrome stylesheet draws both outlines"), so it is yours.

**Ruled:** _(awaiting the owner)_
