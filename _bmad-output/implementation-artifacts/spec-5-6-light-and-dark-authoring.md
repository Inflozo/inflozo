---
title: 'Story 5.6 — Light and dark authoring'
type: 'feature'
created: '2026-09-18'
status: 'ready-for-dev'
owner_test: pending
baseline_commit: 'b31b1e5bab89312c57f13aa10ab3d7d4b8e58eb2'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Your site can have a dark mode, and after this story you design it instead of building it: one press of
the sun in the top bar and the canvas becomes the night version of the same page, already coloured,
because every Style Pack ships a hand-paired dark palette. While you are in dark, changing a section's
background changes it **only in dark** — the light page keeps what it had — and the control picks up a
small moon marked "Dark override" so you can see at a glance what you have changed for dark and nowhere
else. If you decide a section's dark version should just follow the light one again, "Clear dark
overrides" gives it back, and a project that wants nothing to do with dark can be set to Light only,
which hides the sun and leaves whatever you had set for dark untouched in case you change your mind.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Everything needed to *store* a dark override already exists — the dark half of the token
set, the `darkOverrides` map on every section, the `darkOverride: true` flag on Background role, the moon
badge in the Kit and in the panel — and **nothing reads any of it**. There is no way to see dark, no way
to author it, no way to clear it, and `projects.dark_enabled` is read by nothing in the editor. FR-D7 is
the one promise of the epic that is fully specified and entirely unbuilt.

**Approach:** Give the editor a mode and let the existing parts do the work. The canvas already answers
to `data-mode` on its `<html>` (`tokens.ts` emits `:root[data-mode="dark"]`, and the canvas document
hard-codes `light` today), so previewing dark is one attribute. On top of that, one pure core function
decides which stored slice the active mode resolves from, so a mode-scoped control's change lands in
`darkOverrides` in dark and in `controls` in light — and both emitters keep their single door
(`stampControls`) unchanged. A mode flip is that attribute plus a re-stamp of the roots; never a repaint,
so a caret survives it.

## Boundaries & Constraints

**Always:**
- **AD-30 is the rule and it is not this story's to reinterpret.** A dark override is *a second value for
  the same control* — never a `data-{control}-dark` twin, never a mode selector in a design's stylesheet,
  never a second mode signal. `data-mode` on the canvas root is the mode signal FR-E4 already defines and
  `tokens.ts:170-172` already reserves for the canvas: *"the canvas reuses that same attribute to preview
  a mode, deliberately, so no fourth mode signal exists."*
- **Only `bg` (Background role) is mode-scoped today** — `packages/library/src/vocabulary.ts:263`, the one
  `darkOverride: true` in the whole library, and a universal, so **every** design has it. A design's own
  mode-scoped control and a per-mode image swap have no example in the library; the engine must treat
  `darkOverride` as the declaration it is and never special-case `bg` by name.
- **Absent, not greyed** (UX-DR3, R-118, R-128): on a Light-only project the sun is **gone** from the bar,
  not disabled. The one thing that greys with its reason is D6b's project-level clear row, because there
  the overrides genuinely exist and are merely not in force.
- **Nothing is deleted by a mode change.** Light only keeps every stored override, and re-enabling dark
  reapplies them exactly (FR-D7). `resetSection` keeps them too, already asserted at
  `controls.test.ts:413` — only the two deliberate clears remove one.
- **The mode never enters the URL** (`apps/web/lib/editor.ts:5`, Story 5.1's settled scheme) and the top
  bar never deselects (R-123, `reconcile-designs-decisions.md:2482`): pressing the sun keeps the selected
  section selected and any inline editing alive.
- **A shape carries its word.** The moon badge always carries the accessible label "Dark override"
  (UX-DR8, `DESIGN.md:181-184`, D6a`:113`), and the sun/moon control carries an accessible name — the
  layout-cannot-hold-a-word carve-out `DESIGN.md:534-536` grants, in a 48px bar with five controls still
  to land in it.
- **Glyphs come from the export** (R-92). The sun is `S4 Editor.dc.html:35`'s path, lifted verbatim; the
  moon the Kit already has (`kit/icons.tsx:297`).
- **No colour literal enters `apps/web`** (`apps/web/tokens.test.ts:7-9`). The dark swatch values come
  from `REFERENCE_TOKENS.dark`, the same way the light ones already do.

**Ask First:**
- The three questions under `## Questions for the owner`. **Question 1 blocks the Dev phase** — it decides
  whether a screen is built. Questions 2 and 3 decide two labels and one placement.
- Any change to `packages/section-runtime/src/core.ts`. This story should need none: `stampControls`
  already takes the stored slice, so handing it a different slice is the whole mechanism. If Dev finds a
  reason to add a `mode` to `RenderInput`, stop and say why — it would put a mode inside the theme
  emitter, which AD-30 forbids.

**Never:**
- **Never touch the theme emitter or `agreement.test.ts`'s claim.** How a dark override reaches a
  *visitor* is Epic 7's, and it is an open architectural gap (see Design Notes, and the ledger entry this
  story files). This story authors and previews; it compiles nothing.
- **Never build the `mode-toggle` refusal here.** No design in the library declares the `mode-toggle`
  module, and `color_scheme` has no project-level value to read before Epic 7's Theme Settings builds it —
  so the condition is unreadable and there is nothing to refuse. R-118 governs: it arrives with the story
  that makes it work (A1's category story, Epic 9). Filed, not guessed.
- **Never build the rest of D6a** — posts per page, Site basics, Credits, the custom-settings builder and
  its "3 OF 17" meter are FR-Q1/Q2/Q3 and Epic 7's (`prd.md:816`). R-118 again.
- **Never migrate.** `projects.dark_enabled` exists (`20260904120000_complete_schema.sql:224`, comment
  *"FR-D7: Light+Dark is the default"*) and `instanceSchema.darkOverrides` exists
  (`doc-schema.ts:31`). **This story has no Schema phase** (R-99) — verified by reading both files, not
  assumed.
- **Never add the `.` shortcut.** FR-D11's keyboard map is Story 5.9's, and the epic context says so
  ("5.9's map spans the epic").

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Preview dark | light canvas, press the sun | `data-mode="dark"` on the canvas `<html>`; every root re-stamped; **no repaint** — selection, caret and scroll all survive | N/A |
| Author a dark override | dark, Background role → Contrast on a design offering it | `darkOverrides.bg = 'contrast'`; that root alone re-stamped `data-bg="contrast"`; row shows the moon + "Dark override"; `controls.bg` untouched | N/A |
| Back to light | the same section, press the sun | root returns to the light value; the moon stays on the row (an override is stored, whatever mode is shown) | N/A |
| A control that is not mode-scoped, in dark | dark, `card-side` → Right | writes `controls`; no moon; the light canvas shows it too | N/A |
| Reset a mode-scoped row in dark | dark, a dark override stored, press "Reset Background role" | the override is forgotten; the row returns to the light value; the moon goes | N/A |
| Reset a mode-scoped row in light | light, a dark override stored, press "Reset Background role" | the **light** value is forgotten; the dark override **stays** (FR-F4) | N/A |
| Clear one section's overrides | 2 overrides stored on the selected section | asks first (R-115), naming the count; on confirm the instance's `darkOverrides` is `{}` | Cancel changes nothing and keeps focus on Cancel (UX-DR14) |
| Clear with none stored | no override on the selected section | the row says so under itself rather than asking; it stays live (R-12, the shape "Reset this design" already uses) | N/A |
| Light only | `dark_enabled = false` | the sun is **absent**; the canvas is light; every stored override is untouched | N/A |
| Light + Dark again | overrides stored while Light only | every override reapplies exactly, unchanged | N/A |
| An override the design will not take | `darkOverrides.bg = 'accent'` on a design narrowing `bg` to base/surface/contrast | resolved away, never stamped (FR-F7), and **no moon** — `controls.ts:199` already guards on `d.values.includes(…)` | the value stays stored: it is another design's to mean (FR-D19) |
| An override under a name nothing declares as mode-scoped | `darkOverrides.spacing = 'compact'` | ignored in both modes; no moon; nothing stamped | stays stored |
| A design with no mode-scoped control | dark, a design whose `bg` is locked to no value (R-103) | the canvas still goes dark from the token block alone; nothing to override and no moon anywhere | N/A |
| The project count | overrides across several canvases | derived by walking the docs, never stored — standing rule 4 | N/A |

</frozen-after-approval>

## Code Map

**The core — the mode, and the one function that decides the slice**
- `packages/section-runtime/src/controls.ts` — `ControlState.darkOverrides` `:35`; `Declared.darkOverride`
  `:58`, set at `:67`/`:76`; `resolveAll` `:82-109` (reads `state.controls` only); `resolveControls`
  `:115-124` (**no mode**); `ControlRow.moon` `:141`; `controlRow`'s moon `:199` — **already correct, do
  not rewrite it**; `sidebar` `:298`; `setControl` `:347`; `resetControl` `:357`; `resetSection` `:369`
  (leaves `darkOverrides` alone, deliberately). This is the file the mode enters.
- `packages/library/src/vocabulary.ts:247` `UniversalDef.darkOverride`, `:263` **`bg` is the one
  declaration**; `packages/library/src/registry.ts:32` `ControlDef.darkOverride`.
- `packages/section-runtime/src/tokens.ts` — `REFERENCE_TOKENS.{light,dark}` `:76-160`, same property set
  asserted equal; `referenceTokensCss` `:174-186` emits `:root`, the `prefers-color-scheme` block keyed
  `:root:not([data-mode="light"])`, and `:root[data-mode="dark"]`. **Read `:165-172` before writing
  anything** — it is the mode-signal ruling. Unchanged by this story.
- `packages/section-runtime/src/doc-edit.ts` — `setHidden` / `setMemberVisibility` / `isDesigned` `:93`
  are the shape a per-section clear and the project count follow. ONE place decides what a doc operation
  means, so 5.8's journal and Epic 7's compiler read it rather than re-derive it.
- `packages/section-runtime/src/doc-schema.ts:31` `darkOverrides: values` — **required, not defaulted**,
  locked by `doc-schema.test.ts:55-56`. No new field; nothing to migrate.
- `packages/section-runtime/src/core.ts:1213-1232` `stampControls`, taking
  `Pick<RenderInput,'controlSchema'|'universals'|'controls'>` — **the reason no core change is needed**:
  hand it the mode's slice. `RenderInput` has no `mode` and must not gain one.

**The editor**
- `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` (1094 lines) — top bar `:871-888` (back
  `:872-879`, name `:880`, the centred switcher `:885-887`; **nothing right of centre yet — that is where
  the sun goes**, S4a position 6). `paint()` `:315-359` is the only writer into the frame (`data-mode`
  goes beside `:316-317`); `commit()` `:280-287`; `mark()` `:290-298` (re-apply after every stamp —
  `stampControls` strips root `data-*` it does not own); `choose()` `:299-307`; `onChange` `:853-867` —
  `kind === 'control'` stamps in place `:863-865`, anything else repaints `:866`. The absent list
  `:117-122` names **"the sun (5.6)"** and **"Dark mode (5.6)"** — both come off here.
- **The working precedent, already built and shipped:**
  `apps/web/app/(app)/app/(authed)/pilots/review.tsx` — `type Mode` `:36`, `useState<Mode>('light')`
  `:87`, in the `latest` ref `:98-99`, **`documentElement.setAttribute('data-mode', now.mode)` `:121`**,
  the Light·Dark `Segmented` `:212`, mirrored on the iframe `:237`. Reuse the mechanism; do not invent a
  second one.
- `apps/web/lib/pilots.ts:105-119` — the canvas document; **`data-mode="light"` is hard-coded on `<html>`
  at `:112`** and its own comment at `:105` already says the editor sets it. Four ordered `<style>` blocks
  `:115-118`.
- `apps/web/components/controls/sidebar.tsx` — the moon is drawn at `:105` with the words "Dark override";
  `darkKept` `:221` already changes the reset confirm's sentence; the panel foot holds "Reset this design"
  with R-115's confirm. The mode threads through here; the per-section clear lands here.
- `apps/web/components/editor/` — `template-switcher.tsx` is the sibling pattern for a top-bar control.
- `apps/web/components/kit/icons.tsx:297` `Moon` exists; **there is no `Sun`** — add it from
  `S4 Editor.dc.html:35`. `kit/moon-badge.tsx:7` `MoonBadge`. `kit/segmented.tsx:56` already takes `moon`.
- `apps/web/lib/controls-review.ts:56-75` — `ROLE_TOKENS` `:57-62` and `referenceSwatches()` `:67-75`,
  **light-only at `:70`**. In dark the Background-role swatch dots paint the wrong colours until this
  takes a mode.
- `apps/web/app/(app)/app/(authed)/projects/[id]/read.ts` — `editorData` hands `swatches` at `:164`;
  `projectOf` selects only `id, name` (`:46`), so `dark_enabled` is not read yet.
- `apps/web/app/(app)/app/(authed)/projects/actions.ts:194` — the only reader of `dark_enabled` today
  (duplicate carry-forward), and the pattern for a server action that writes one project column.

**The database, read — nothing to change**
- `supabase/migrations/20260904120000_complete_schema.sql:224` `dark_enabled boolean not null default
  true`; `:243-254` `project_templates.doc` (its comment lists `darkOverrides`); `:258-271`
  `project_template_prefs` (**schema-only, no reader, no writer** — where a *per-canvas* preference would
  go if the mode were one; it is not: the mode is session state, like `pilots/review.tsx`'s);
  `:304-340` `custom_settings`, the cap comment *"the three FR-Q5 dark built-ins are NOT rows"* and
  `enforce_custom_setting_cap()` fixed at **17** — the reason this story cannot move the cap; `:825` the
  uniform owner policy, which makes `dark_enabled` owner-writable with no new policy.

**Tests that constrain this**
- `packages/section-runtime/src/controls.test.ts:128-132` the moon flag; `:400,413` reset leaves
  `darkOverrides` alone. `doc-schema.test.ts:28-32` strictness. `tokens.test.ts:58-59` both mode blocks
  emitted. `agreement.test.ts` — canvas↔theme agreement, which a mode in the theme emitter would break.
- `apps/web/pilots.test.ts:40-46` every `canvas-chrome.css` rule keyed on `data-inflozo-*`;
  `busy.test.ts:59,203,236-255` (a new route needs its own skeleton, R-98); `tokens.test.ts:7-9,30` no
  colour literal in `apps/web`; `editor.test.ts:24-28` no new URL segment; `canvas-switch.test.ts`
  AD-22's round trip.
- `tools/probe/run-verify-editor.cjs` — 45 steps; **every gesture step lives inside step 5's CSP session**
  (`:313`). New steps take 46+, appended before the step-6 banner. Reusable constants `:61-72`.

**Frames and normative text, read**
- `S4 Editor.dc.html:35` — the sun: a 28×28 button, 15px glyph, `circle r=4` + eight rays, `#6E6A64`,
  hover `rgba(28,27,26,.05)`. **No label, no `aria-label`, no moon counterpart is drawn anywhere** —
  Question 2 exists because of that.
- `D6 Theme Settings Completed.dc.html:102-121` — D6a's mode block, verbatim: "This project" over a
  two-segment control `Light only` | `Light + Dark`, caption *"Every Style Pack ships a hand-paired dark
  palette, so dark is already paid for."*; then the bordered row — moon `role="img"
  aria-label="Dark override"` `:113`, title "Clear dark overrides" `:115`, sub-caption "3 sections carry a
  dark override" `:116`, a secondary "Clear" `:118`; then the footnote *"The same badge marks an
  overridden control in the sidebar, and it always carries the label "Dark override"."*
  `:271-283` is **D6b**, the Light-only variant: the same control with `Light only` active and the clear
  row **greyed with its reason** — *"This project is Light only, so nothing renders the dark overrides
  those three sections still hold. Switch to Light + Dark to use or clear them."* plus *"The overrides are
  kept, not discarded — greying the row is a statement about what is in force, never about what is
  stored."*
- `Editor Sidebar Kit.dc.html:178-179` the moon badge (12px, filled ink circle + white crescent), `:66`
  the same badge on a segmented control. **The Kit's shape and D6a's bare stroke crescent differ** — the
  Kit's is the one already built (`kit/moon-badge.tsx`); keep it and do not fork a second.
- `prd.md:224` FR-D7 · `:273` FR-F5 · `:256-262` FR-E4's three mode inputs and their precedence · `:359`
  FR-Q2 · `:362` FR-Q5 · `:976` "not offered at all".
- `ARCHITECTURE-SPINE.md:339-347` **AD-30, and `:345` is the load-bearing paragraph** · `:106-110` AD-3 ·
  `:213-217` **AD-17**, whose Rule says in so many words: *"On a `dark_enabled = false` project the three
  still emit and the chains still resolve; what changes is that Inflozo shows no toggle, never that the
  theme declares less (FR-D7)."*
- `MEASUREMENTS.md:126-148` §5 — GS100's trigger on five fixtures across both gscan majors; `:378` the
  `config.custom` cap is **20** on both. `epics.md:293` UX-DR8. `EXPERIENCE.md:172` the IA row (Theme
  Settings = D6a/D6b, reached from the editor), `:652`, `:680`, `:1783-1790` (D6a's authoring prompt),
  `:715`/`:859` **dark-mode authoring is a Free-plan capability**. `DESIGN.md:181-184`, `:308-312` (no app
  dark mode in v1 — dark appears inside the canvas and nowhere else), `:446-450`, `:534-536`.
- `reconcile-designs-decisions.md:856-860` **R-34** (its spec half still open for A1 and A28, `:164`);
  `:1078` **R-68** greyed-vs-not-offered, whose *first* case was this very control; `:2482` the top bar
  is not a deselecting ground and the sun is named as 5.6's.
- `reconcile-design-prompt.md:60` — the recorded gap, in the project's own words: *"**stale** — Light-only
  project variant (FR-D7) — hidden sun/moon toggle when the project is Light only, plus the per-section
  "Clear dark overrides" action — **missing from S4/S7**."* Question 3 exists because of that.

**Ledger** — nothing open about colour-mode authoring; this story **files** the AD-30 emission gap.
Adjacent and open: DW-150 (A1's dark-mode toggle and `logoLight`, A1's to settle), DW-155 (token rows no
Paper object names, both modes' `--accent-on-contrast`), DW-169 (one pack until Epic 6), DW-11 (two export
files disagree on two pack accents — *the colour-scheme story must read PRD Appendix D, not either file*).

## Tasks & Acceptance

**Execution:**
- [ ] `packages/section-runtime/src/controls.ts` -- add `export type Mode = 'light' | 'dark'` and ONE new
      pure function, `storedFor(entry, state, mode)`, returning the stored slice the mode resolves from:
      in `dark`, each `darkOverride: true` name takes its `darkOverrides` value where one is stored, and
      every other name is `state.controls`' — so `resolveControls` and `stampControls` need no change at
      all. Thread `mode: Mode = 'light'` through `sidebar`, `setControl` and `resetControl` only: `sidebar`
      resolves from `storedFor` so the marked value is the one in force; `setControl` writes
      `darkOverrides` when the mode is `dark` **and** the resolved control declares `darkOverride`, and
      `controls` otherwise; `resetControl` deletes from whichever map that same test names. Leave
      `resetSection`, `resetChanges` and `controlRow`'s `moon` exactly as they are. -- the engine is the
      one place that knows what a mode means, and a default keeps every existing caller and test compiling
- [ ] `packages/section-runtime/src/doc-edit.ts` -- `clearDarkOverrides(doc, instanceId)` (that instance's
      map to `{}`, the doc otherwise identical) and `darkOverrideCount(docs)` returning the number of
      instances carrying at least one override an emitter could use -- one place decides what a doc
      operation means (5.8's journal and Epic 7 read it), and the count is derived, never stored
- [ ] `packages/section-runtime/src/index.ts` -- export the three new names -- the editor imports from the
      package, never from a path inside it
- [ ] `apps/web/components/kit/icons.tsx` -- add `Sun`, the path lifted verbatim from
      `S4 Editor.dc.html:35` (`circle r=4` + the eight-ray `path`), stroked `currentColor` like its
      neighbours -- R-92: a glyph the export draws is read from the export
- [ ] `apps/web/lib/controls-review.ts` -- `referenceSwatches(mode: Mode = 'light')` reading
      `REFERENCE_TOKENS[mode]`, throwing by property name as it already does -- the Background-role
      swatches must be the colours the canvas is actually painting
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/read.ts` -- select `dark_enabled` in `projectOf` and
      carry it on `EditorData`; hand both swatch sets (`{ light, dark }`) -- the project's mode is server
      truth, exactly as 5.5 made synthesis server truth
- [ ] `apps/web/components/editor/mode-toggle.tsx` -- **new**, the top bar's control, in the shape
      **Question 2** rules; `aria-pressed`, an accessible name naming the mode it moves to, a polite
      announcement of the mode now shown (UX-DR8, UX-DR12) -- a 12px-or-smaller shape never carries the
      only signal
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` -- hold `mode` beside the other session
      state and in the `latest` ref; set `data-mode` on the canvas `documentElement` in `paint()` and on
      every flip; on a flip **re-stamp every root through `storedFor(…, mode)` and call `mark()` — never
      repaint**; pass the mode and the mode's swatches to `Sidebar`; make the control absent when
      `dark_enabled` is false; take "the sun (5.6)" and "Dark mode (5.6)" out of the absent list at
      `:117-122` and write this story's paragraph into the header log -- one attribute plus a re-stamp is
      the whole preview, and it is what lets a caret and a selection survive the flip
- [ ] `apps/web/components/controls/sidebar.tsx` -- thread `mode` into `sidebar`/`setControl`/
      `resetControl`; add the per-section **"Clear dark overrides"** where **Question 3** rules, asking
      first in the app's one dialog vocabulary (`kit/dialog.ts`) and naming the count, focus on Cancel
      (R-115, UX-DR14), and saying so under itself when there is nothing to clear (R-12) -- the panel
      edits the selection, so a per-section act belongs to the panel
- [ ] `<surface Question 1 rules>` -- D6a's "This project" segmented control (`Light only` | `Light +
      Dark`, its caption verbatim) writing `projects.dark_enabled` through a server action, and D6a's
      project-level clear row with its derived count — greyed with D6b's reason sentence while the project
      is Light only. A new route carries its own `loading.tsx` drawing **that** route's rows and puts any
      guard in `layout.tsx`, above the boundary (R-98) -- Light only is untestable and unreachable without it
- [ ] `packages/section-runtime/src/controls.test.ts` -- the matrix's engine rows: resolution in each mode,
      which map a write lands in for a mode-scoped and a non-mode-scoped control, which map a reset
      empties, a stored override the design does not offer (resolved away, no moon, still stored), an
      override under an undeclared name, and a design whose mode-scoped control is locked to no value
- [ ] `packages/section-runtime/src/doc-edit.test.ts` -- the per-section clear leaves everything else
      identical, and the count is derived over the real library rather than a written number
- [ ] `apps/web/` -- a `node --test` file covering the flip: `data-mode` written on the canvas root, roots
      re-stamped, no repaint (the paint counter unchanged), and the control absent when `dark_enabled` is
      false
- [ ] `tools/probe/run-verify-editor.cjs` -- steps 46+ **inside step 5's CSP session**: the sun in the bar
      at S4a's position; the flip painting the canvas dark and the selection surviving it; a dark
      Background-role change moving the root's `data-bg` in dark only, with the moon and its words on the
      row; the light canvas unchanged; reset in each mode; the per-section clear's confirm and its result;
      the project set to Light only — the control absent, the canvas light, the overrides still stored —
      and back again; the project-level count. Step 5's zero read after them, with its own control passing

**Acceptance Criteria:**
- Given a project that is Light + Dark, when the sun is pressed, then the canvas re-renders in the other
  mode and **the top bar matches `S4 Editor.dc.html` S4a** — the control at position 6, first of the
  right-hand cluster, 28×28, the export's glyph — while the project-mode row and the clear-overrides row
  **match `D6 Theme Settings Completed.dc.html` D6a**, and the Light-only state of that clear row matches
  **D6b**, reason sentence included (R-74).
- Given a section selected in dark mode, when a mode-scoped control is changed, then only the dark render
  changes, the row carries the moon badge with the words "Dark override", and returning to light shows the
  value the section had before.
- Given a caret in a text prop and a scrolled canvas, when the mode is flipped, then the selection, the
  caret and the scroll position all survive, and no repaint occurs.
- Given a project switched to Light only, when the editor loads, then the sun is **absent from the bar
  rather than disabled**, the canvas is light, and every stored dark override is still stored — proved by
  switching back and seeing each one reapply unchanged.
- Given any of this story's changes, when `custom_settings` is counted, then the cap is still 17 and this
  story wrote no row and no migration: the three dark built-ins are not rows and are emitted by Epic 7's
  compiler on every project, Light-only included (AD-17, `schema:304-305`).
- Given a stored override a design will not take, when the section renders in dark, then nothing is
  stamped, no moon appears, and the value is still stored (FR-F7, FR-D19).
- Given the deployed editor, when the harness runs, then **0 FAIL** with step 5's CSP zero read after the
  new gestures and its own control passing (standing rule 2).

## Spec Change Log

## Design Notes

### The mechanism is one attribute, and it was reserved for this story two stories ago

`packages/section-runtime/src/tokens.ts:165-172` emits three blocks — `:root` for light, the
`prefers-color-scheme: dark` block keyed `:root:not([data-mode="light"])`, and `:root[data-mode="dark"]` —
and its own comment says why the third exists: *"the canvas reuses that same attribute to preview a mode,
deliberately, so no fourth mode signal exists."* `apps/web/lib/pilots.ts:112` already writes
`data-mode="light"` on the canvas `<html>`, and `pilots/review.tsx:121` already flips it from a
`Segmented`. So the preview is a solved problem being wired up, not a new one, and **the flip must not
repaint**: set the attribute, re-stamp the roots through `storedFor`, `mark()`. The token block does
everything else, which is exactly why a design stylesheet is forbidden to mention a mode.

### Why no change to `core.ts`, and why that is the test of whether the design is right

`stampControls` takes `Pick<RenderInput,'controlSchema'|'universals'|'controls'>` — *the stored slice*.
Hand it a different slice and the same single door produces the dark render. A `mode` on `RenderInput`
would put a mode inside the **theme** emitter, which AD-30 exists to prevent and `agreement.test.ts`
would catch. If Dev feels the pull to add one, that is the signal to stop and ask, not to push through.

### The one open architectural gap, and it is not this story's to close

AD-30`:345` says Background role *"resolves through the token block and needs no second attribute at
all"*. On the canvas that is true — the canvas has a live `data-mode`, so the override is simply a
different `data-bg` while dark is shown. **In a shipped theme it is not**, and nothing in the repository
resolves it: one `data-bg` attribute cannot be `base` for a light visitor and `contrast` for a dark one;
a `data-bg-dark` twin is forbidden by the same paragraph; a design stylesheet mentioning a mode *fails the
build*; and AD-3's only inline-`style` carve-out is *"a CSS custom property from bound Ghost data, and
nothing else"*. So the expression a dark override needs in `default.hbs`'s token block or the base
stylesheet has not been decided. **Flag, do not guess** (standing rule 6): this story files the gap
against Epic 7's compiler story and AD-30, stores the override faithfully, and previews it honestly.
Nothing is at risk in Epic 5 because Epic 5 deploys nothing — but a compiler story that discovers this
late would discover it with a library of authored overrides behind it.

### What the library can and cannot exercise

`bg` / Background role is **the only** `darkOverride: true` declaration in the library
(`vocabulary.ts:263`) — and it is a *universal*, so every design has it. Each pilot narrows it and each
still offers two or three values (`a1/1` base·surface with its reason; the other four base·surface·
contrast), so the owner's test has something real to do on "Pilot sections". Every pilot declares
`darkCapabilities: ["tokens"]`, and `darkCapabilities` is **read by nothing** — carried through
`registry.ts:229` and consumed nowhere. FR-D7's other two mode-scoped kinds have no example at all:
no design declares a mode-specific toggle of its own, and no design has a per-mode image swap. The engine
must therefore key on the `darkOverride` declaration and never on the name `bg`, or the first design that
declares its own will silently not work.

### `mode-toggle` is a different setting, and S4's sidebar row for it is stale

S4's Controls sidebar draws a row "Dark mode / Readers get a moon toggle" (`S4 Editor.dc.html:124`,
`:236`; the same stale row is `B Missing Surfaces.dc.html:1690`). `EXPERIENCE.md:652` says plainly this is
the **visitor's** `mode-toggle` — *"a different setting"* — not FR-D7's project mode, and
`EXPERIENCE.md:1783-1790` records that D6a's project-mode block was drawn to **replace** it. Do not build
that row. The module is registered (`packages/library/modules/registry.json:30`, `editSafe: true`) but
implemented by nothing and declared by no design; A1's spec gives it to all fifteen A1 designs *"offered
only when the project ships both modes"* (Epic 9). R-34's refusal has nothing to refuse, and
`color_scheme` has no authoring-time value to read — it is a Ghost Admin setting Epic 7's compiler
declares, stored in no Inflozo column. Both halves make the deferral forced rather than chosen.

### Free, not Pro

`EXPERIENCE.md:715` and `:859` put dark-mode authoring on the Free plan. D6a is labelled "Pro" because of
the *Credits* row and the custom-settings builder beside it, neither of which this story builds. Nothing
here is gated, and R-119's Pro badge is untouched.

## Verification

**Commands, and what each must return.** Run at Dev on this machine against the real services (R-82); a
key is named by its variable and never printed.

- `pnpm check` -- exit 0, `fail 0` in every package suite, including the new engine, doc-edit and editor
  tests. Each suite prints its own count; none is written down here. **`agreement.test.ts` and
  `ad36.test.ts` must be untouched and green** — they are the control that no mode entered the theme
  emitter.
- `python3 tools/doc-audit.py --check` -- exit 0, twice.
- `bash supabase/tests/run-rls-gate.sh` -- exit 0, every `PASS`, no abort. **The control that this story
  did not move the database under the code:** `git diff <baseline>..HEAD -- supabase/` is **empty**, and
  `projects.dark_enabled` and `instanceSchema.darkOverrides` both pre-exist — so there is **no Schema
  phase** (R-99).
- A `python3` read of `packages/library/` -- **executed, not asserted** (standing rule 1): every
  `darkOverride: true` declaration in the library, and each pilot's offered `bg` values, so the Design
  Notes above are a reading rather than a claim.
- `cd tools/stress && npm install && node build.js && node gate.js theme` -- 0 errors / 0 warnings on both
  majors, unchanged. The three built-ins and their reference chains are emitted there
  (`build.js:119,121,125,163-168`) and this story must not have touched them.
- **GitHub Actions**, read with `GITHUB_TOKEN`: the Dev commit runs **CI** to `success` with `check`,
  `rls` and `deploy` green, and **Render matrix** to `success`. Negative control: a bogus token → 401.
- **Vercel**, read with `VERCEL_TOKEN` / `VERCEL_TEAM_ID` / `VERCEL_PROJECT`: the production deployment
  for the Dev commit is **READY** and its `githubCommitSha` is HEAD. Negative control: a bogus token → 403.
- **Supabase**, read with `SUPABASE_URL` / `SUPABASE_SECRET_KEY`: the owner's "Pilot sections" project
  still has rows for `site`, `home` and `post` **and no others**, `projects.dark_enabled` is `true`, and a
  `custom_settings` count for that project is **0** against a cap of 17 — the proof that the mode work
  went nowhere near the cap.
- **The deployed editor harness** -- `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' \
  tools/probe/.env | xargs) OUT_DIR=… node tools/probe/run-verify-editor.cjs`, against `app.inflozo.com`
  and the live Supabase, refusing to start unless the served deployment is this checkout's HEAD. Expected
  **0 FAIL**, with step 5's CSP session zero **and its own control passing** — the control plants two
  `new Function('')` refusals and the recorder must see both, or the zero is not a result (standing rule
  2). Run at Dev, not deferred to Review. A `HARNESS ERROR` with no `FAIL` is not a result: re-run.
- **Manual, on the deployed editor:** flip the mode with a caret in a text prop and the canvas scrolled,
  and confirm by eye that nothing jumps and the caret stays — the paint counter is the machine's half of
  this, the eye is the other.

## Owner's manual test

Run on the deployed site, on the owner's own **"Pilot sections"** project — the one Story 5.1's Deploy
seeded. Nothing you do here survives a reload yet: saving arrives with Story 5.8. The rows marked
**(Q1)** depend on the owner's ruling on Question 1 and their URL is filled in at Deploy.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the right-hand end of the top bar. | — | A small **sun** where there was nothing before, at the end of the bar. Everything else in the bar is exactly as you left it. |
| 2 | same | Top bar | Press the sun. | — | The page in the middle becomes the **dark version of the same page** — deep grounds, lighter words, the same layout and the same words. Nothing outside the page changes: the bar and the two panels stay light, on purpose. |
| 3 | same | Top bar | Look at the control you just pressed. | — | It is now a **moon**, and hovering it tells you it takes you back to light. |
| 4 | same | Canvas, Home | Press the sun/moon a few times quickly. | — | The page flips each time with **no flicker and no reload** — no white flash, no spinner in the browser tab. |
| 5 | same | Canvas, Home | With dark showing, click a section to select it, then find **Background role** in the right-hand panel (under **Style**) and pick a different one. | — | That section's ground changes **in the dark page**, and beside "Background role" a small **moon** appears with the words **"Dark override"**. |
| 6 | same | Top bar | Press the moon to go back to light. | — | The section you just changed is back to the ground it had in light — **your light page was not touched**. The moon and its words stay on the control, because a dark override is still stored. |
| 7 | same | Canvas, Home | Select a different section and, in **light**, change its Background role. | — | It changes in light. Press the sun: it has changed in dark too. A control that is not mode-scoped is one value for both modes — only Background role splits. |
| 8 | same | Canvas, Home | Go back to dark, select the section from step 5, and press the small undo arrow beside **Background role**. | — | The dark ground goes back to following the light one, and the moon and its words disappear. |
| 9 | same | Canvas, Home | In dark, put a dark override on **two** sections, then click into a headline and start typing. With the caret still in the text, press the moon. | type `Hello` into a headline | The mode flips and **your cursor stays exactly where it was**, mid-word. Nothing jumps and the page does not scroll back to the top. |
| 10 | same | Controls panel | With a section that carries a dark override selected, find **Clear dark overrides** and press it. | — | A small window asks first, telling you how many settings it will clear on that section. Press **Cancel** — nothing changes. Press it again and confirm — that section's dark version follows its light one again and the moons go. |
| 11 | same | Controls panel | Select a section that has **no** dark override and look at the same row. | — | It tells you there is nothing to clear rather than asking you a question. It is not greyed out. |
| 12 | *(Q1)* | Project mode | Find **This project** and switch it from **Light + Dark** to **Light only**. | — | The caption reads *"Every Style Pack ships a hand-paired dark palette, so dark is already paid for."* After the switch, the row beneath it greys with its reason — that the overrides are **kept, not discarded**. |
| 13 | back to step 1's URL | Editor, Home | Look at the top bar. | — | The sun is **gone** — not greyed out, gone. The page is light and there is no way to show dark. |
| 14 | *(Q1)* | Project mode | Switch back to **Light + Dark**, then return to the editor and press the sun. | — | Every dark override you made earlier is **exactly as you left it** — nothing was thrown away while dark was switched off. |
| 15 | *(Q1)* | Project mode | Read the line under **Clear dark overrides**. | — | It counts the sections that carry an override — and the number matches what you actually did. Press **Clear** and every section's dark version follows its light one again. |

## Owner's test findings

## Questions for the owner

### Question 1 — the two project-wide rows are drawn on a screen that does not exist yet

The drawing puts two things on a **Theme settings** screen: the choice between **Light only** and **Light
+ Dark**, and a row that counts how many sections carry a dark override with a **Clear** button beside it.
That screen also holds posts-per-page, your site's title and logo, credits, and the Ghost-settings
builder — and all of those belong to a much later story (Epic 7). So today there is nowhere to put the two
rows this story needs.

**Example:** you finish this story, open the editor, press the sun and design your dark mode. Then you
decide this particular site should be light only — and there is no switch anywhere to turn dark off, so
that half of the story cannot be used or tested.

You have ruled on this shape twice already (R-118, R-128): *a control arrives with the story that makes it
work, and is absent until then.* The question here is the mirror of it — a control that **does** work now,
whose screen has not been built.

1. **Build a small Theme settings screen now, holding only these two rows.** (RECOMMENDED) — reached from
   the editor, drawn exactly as the drawing draws these two rows, with everything else on that screen
   simply absent until Epic 7 builds it. It is where these rows are meant to live, it means you can walk
   the whole story, and nothing has to move later.
2. **Ship only the editor half this story** — the sun, the dark authoring, the moon badge and the
   per-section clear — and let the two project-wide rows wait for Epic 7's Theme settings screen. Every
   project stays Light + Dark until then, so "Light only" ships built but unreachable, and you cannot test
   it.
3. **Put the two rows somewhere in the editor for now and move them to Theme settings in Epic 7** —
   fastest to build, but the same setting gets two homes over its life, and moving a setting someone has
   already used is the kind of change this project has learned to avoid.

**Ruled:** _(awaiting the owner)_

### Question 2 — the drawing gives the mode control a sun and never says what it becomes

In the drawing of the editor there is a small **sun** at the right-hand end of the top bar. That is the
control that shows you dark mode. But the drawing never shows what it looks like **once you are in dark**,
gives it no words, and gives it no label for a screen reader — and one of your own rules says a small
shape must always carry its words or, where the layout truly cannot hold them, a spoken label.

**Example:** you press the sun, the page goes dark, and you look back at the bar. Is it still a sun? Is it
a moon now? And if you use a screen reader, what does it say?

The bar is 48 pixels tall and still has four more controls to land in it — View as, the device switch,
undo/redo and Ship it — which is why you declined to give it any more room at Story 5.4.

1. **One button that swaps its glyph: a sun while you are in light, a moon while you are in dark**, with a
   spoken label that names where it takes you ("Preview dark mode" / "Back to light mode") and a polite
   announcement of the mode now showing. (RECOMMENDED) — it is exactly what the drawing draws, it costs
   the bar 28 pixels, and the spoken label satisfies the rule without spending width the bar does not
   have.
2. **A two-part switch reading `Light` | `Dark`**, the same control the Style-guide page already uses —
   the words are visible to everyone with no label needed, but it is roughly three times as wide and the
   drawing shows nothing like it in the bar.
3. **The sun or moon with a small word beside it** — a middle path: visible words, about twice the width.

**Ruled:** _(awaiting the owner)_

### Question 3 — "Clear dark overrides" for one section is drawn nowhere

The drawing has a **Clear dark overrides** row for the whole project, on the Theme settings screen. The
written requirement also asks for one **per section** — and no drawing anywhere shows it. Our own notes
already record it as missing.

**Example:** one section's dark version has three settings you changed and you have changed your mind
about all three. You want that section's dark version to just follow its light one again, without
touching the other nine sections.

The section's panel already ends with **Reset this design**, which asks before it acts and tells you what
it will undo.

1. **A row directly under "Reset this design" at the foot of the section's panel**, in the same shape and
   asking the same way — it says how many settings it will clear, and when there is nothing to clear it
   says so instead of asking. (RECOMMENDED) — the two acts are neighbours in meaning, so they read as a
   pair, and it needs no new pattern.
2. **Inside the ⋯ menu on the section's row in the Layers list**, beside Hide, Rename, Duplicate and
   Delete — tidier, but the Layers list is deliberately about *names* and nothing else (your ruling
   R-126), and this is a setting.
3. **Only clear one control at a time**, using the small undo arrow beside each overridden control, and no
   per-section row at all — least to build, but clearing five overrides means five presses.

**Ruled:** _(awaiting the owner)_
