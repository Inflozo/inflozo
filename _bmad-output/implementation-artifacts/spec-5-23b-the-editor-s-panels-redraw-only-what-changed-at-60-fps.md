---
title: 'Story 5.23b — The editor''s panels redraw only what changed, at 60 fps'
type: 'feature'
created: '2026-09-28'
status: 'ready-for-dev'
owner_test: none
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

On a long page the editor stops redrawing its side panels in full every time you point at, pick or change something:
only the part that changed is redrawn — one Layers row when you point at a section, the settings panel when you pick
one, the moved rows when you move one. Nothing looks different; the editor stops stuttering, and the slowed-down speed
test on a 40-section home page passes, which is what closes Epic 5 (R-208). As you ruled (R-210), after any change to
a section the canvas changes at once and the side panels catch up one frame later — a sixtieth of a second, too short to
see — which is what lets the one step that stayed just over the limit pass.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** since Story 5.23a the canvas redraws only what changed, but every change still re-renders the whole editor.
Measured at planning (Design Notes) on the harness's 40-section Home at 4× CPU throttle: each pointer move of a drag
re-renders `EditorShell`, all 41 Layers rows with their menus, the Controls panel and the bar (≈17 ms of React render per
move); a hover or a selection does the same; NFR-1's trace drops 7.8–8.3% of refreshes with 76–78 ms long tasks (the
bars are 5% and 50 ms). And the trace reads its pass as a share of refreshes dropped while NFR-1 is worded as a p95 frame
time (DW-289).

**Approach** (R-208):

- **Each part redraws only what touched it.** The Layers rows, the Controls panel (the Design block and the settings),
  the rail, the bar's controls and the canvas chrome (outlines, tag, chip, badge, note, PAUSED chips, the pill) become
  memoized components whose props keep their identity while their value is unchanged — every handler of fixed identity
  running the latest render's logic, every derived value memoized on what it reads — and the drag in flight lives in a
  one-value store only Layers' slot and rows read.
- **Counted, not asserted.** React's own `<Profiler>` counts each part's renders in the keyboard gate's dev build (a no-op
  in production); journey stops on the long Home require each gesture to redraw its own parts and no other.
- **Canvas first** (**R-210**, Question 1 ruled option 1): a section operation paints the canvas at once and hands React its
  state as a transition, so the panels follow a frame later; a control change stays in the same frame (FR-F4); a panel
  change made from a panel still drawn for a replaced design or instance is dropped, never written.
- **The trace gates on every reading** (DW-289): at most 5% of refreshes dropped, the p95 frame counted in whole
  refreshes at most one refresh, and no long task over 50 ms — manual, never CI (NFR-1).

## Boundaries & Constraints

**Always:**

- **Nothing is drawn differently.** Every element, attribute and word at rest and after each gesture is what Stories
  5.1–5.23a drew; 5.23a's node-for-node canvas agreement stands. The keyboard journeys and the deployed walk pass — a check
  that reads a panel in the instant after a section operation may wait for the panel to settle (R-210); none checks
  anything different.
- **No stale closure.** A memoized part gets values that keep their identity while unchanged and handlers of fixed
  identity that call the latest render's function.
- **`latest` never goes back.** Handlers are the only writers of the `latest` fields they change (the docs, stack, auto,
  journal, selection, hover…); the render writes only what it derives — so a render drawn from state a transition has not
  delivered cannot move `latest` back, and every edit is made against the newest doc.
- **The chrome follows the canvas.** The chrome and the pill are placed from the paint's current roots on a frame loop
  that starts when chrome shows and does not restart on every render; never against a root a paint removed.
- **A control change is in the same frame** (FR-F4): the panel shows it in the render that commits it.
- The render counters are `<Profiler>` callbacks that write only outside production. Counts are derived: the long Home
  is 5.23a's `x-inflozo-harness-home` at FR-D14's 40, named once per tool.

**Ask First:**

- Anything that changes what an edit stores, journals or syncs.
- Any change to `packages/library/modules/core.js`, the canvas emitter, or `paint()`'s keyed walk.
- The trace still failing any bar at 4× once the tasks are done — stop and bring the numbers.
- A journey or walk check that would have to assert something different, not merely wait.

**Never:**

- A doc field or a migration — no Schema phase.
- A frame-time gate in CI (NFR-1): CI gates the mechanism — the render counts.
- A new dependency (no React Compiler, no state library): `memo`, `useMemo`, `useSyncExternalStore`, `startTransition`
  and `<Profiler>` are React's own.
- Editing the design export (R-74) or authoring a shipped design (AD-35).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Hover | the long Home; a section pointed (synthesized `pointerover`, R-175's precedent) | at most the two Layers rows whose wash changed, and the chrome, redraw; the Controls panel does not | N/A |
| Select | Enter on a Layers row | the two rows whose selection changed, the Controls panel and the chrome redraw | N/A |
| Control change | an arrow key on a Style radio | the Controls panel redraws in the same frame; no Layers row | N/A |
| Move | ⌥↓ on the selected row | at most the two rows that swapped; the Controls panel does not | N/A |
| Design change | `]` on the ringed section | the Controls panel and its row at most; no other row | N/A |
| Drag move | a grip held and moved | Layers' slot and the rows it slides; nothing else (a scratch pointer probe — the journey takes no pointer) | N/A |
| Section operation (R-210) | a design change, move, hide/show, duplicate, delete, place, Remix, ⌘Z/⇧⌘Z | canvas at once, panels a frame later; a drop's slot stays until its row lands | N/A |
| Stale panel (R-210) | a design change and a control change on the still-drawn panel, in one task | nothing is written from the old panel; the stored instance keeps the new design's values | dropped silently |
| An urgent render between two edits (R-210) | `]`, a discrete urgent update, then Space on another row, in one task | the doc holds both edits | a lost edit fails the stop |
| The rail | 1100 px wide, a hover then a selection | the hover redraws no rail row; the selection redraws its two | N/A |
| Trace | `fps-trace.mjs` at 4× | per run: share, p95 in whole refreshes, longest task; PASS only when all three hold | its control unseen → REFUSED |

</frozen-after-approval>

## Code Map

**The editor** — `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`, anchors at `790b4d6e`:

| Symbol | Line | Why |
|---|---|---|
| `useFold` · `Rail` · `IconRail` | :290 · :308 · :337 | the rail: rows rebuilt each render (`railRows` :3959), buttons inline |
| `EditorShell` | :504 | one component, ~50 `useState`; every state change re-renders all of it |
| `docs` · `selected` · `hovered` · `paints` · `drag` | :544 · :594 · :595 · :596 · :985 | the state; `drag` changes on every pointer move |
| `stack` · `templates` · `empty` | :588 · :590 · :593 | recomputed every render; `stack`'s new objects make `chosen`/`pointed` new each render |
| `previewing` · `offered` | :773 · :778 | `resolveSubject` and `offersPageTwo` (orbit-weekly posts hydrated) every render |
| `canAdd` · `ringOf` | :1013 · :1017 | scans the library (`categoryOf`, `isPlaceable`) per call; `remixable` (:4118) calls it for 40 sections per render |
| `latest` | :1028-1029 | re-assigned from state on EVERY render — must stop writing handler-owned fields (Always) |
| `commit` · `docOf` · `restore` | :1106 · :1144 · :1217 | handlers write `latest` first (:1133, :1228); `restore` is undo/redo |
| `mark` · `choose` · `point` · `paint` | :1711 · :2095 · :2117 · :2226 | `paint` lets a redrawn section's hover go (R-209, :2430) |
| `chosen` · `pointed` · `entry` · `chosenRows` · `chosenRing` | :3257-3259 · :3268 · :3299 | the Controls panel's and the pill's inputs |
| `chrome` · its effect · `layerFor` · `chips` | :3365 · :3369-3381 · :3387 · :3398 | `layerFor` calls `pinned()` (style/layout read) during render |
| placement effect | :3409-3436 | NO deps: re-runs after every render, `tick()` then restarts its rAF loop |
| `rowsOf` · `apply` · `edit` | :3446 · :3465 · :3500 | `rowsOf` runs `darkOverridesInForce` per row; every section operation ends in `apply` → `paint()` |
| `onDesign` · `stepDesign` · `onShuffle` · `onRemix` | :3583 · :3594 · :3614 · :3644 | the ring's doors |
| `moveTo` · `pillBox` · `pillGrip` · `onChange` | :3820 · :3831 · :3857 · :3889 | `pillBox` and `pillGrip` read render values (`hoveredRoot`, `drag`); `onChange` is the panel's write |
| the bar · Layers aside · `IconRail` · stage · `SectionPill` · Controls aside | :3983-4176 · :4202-4283 · :4286 · :4321-4558 · :4527 · :4585-4749 | handlers passed inline (`onSelect={(pick) => …}`) |

**Its parts:**

- `apps/web/components/controls/layers.tsx:161` `Layers` — `drawRow` :269-363 draws each row as a plain call (a `<LayersRow>`
  with a closed `Menu` of 3–5 items) from closures over `drag`, `layout`, `selectedKey`; `drawGroup` :365; ghost rows :415.
  Its header records why rows are not components: a component declared INSIDE a render remounts — a module-level `memo`
  row does not.
- `apps/web/components/kit/layers-row.tsx:52` `LayersRow` · `apps/web/components/kit/select.tsx:194` `Menu`.
- `apps/web/components/controls/sidebar.tsx:255` `Sidebar` (builds `sidebar()`'s model each render) ·
  `apps/web/components/editor/design-picker.tsx:99` `DesignPicker`.
- `apps/web/components/controls/section-pill.tsx:65` — its loop :129-163 has no deps and reads `boxOf` each frame.
- `apps/web/lib/canvas-layer.ts` — `chromeLayers` :105, `pinned` :148, `place` :163.
- The bar's components: `components/editor/{template-switcher,view-as,save-state,remix-dice,mode-toggle,device-switch,
  preview-toggle,source-pill}.tsx` (export sites); `components/controls/mark-toolbar.tsx:151` `InlineTools`.
- `apps/web/lib/reorder.ts` — the drag's arithmetic (`captureLayout`, `landingAt`, `shift`, `slotTop`); `SectionDrag` is
  `layers.tsx:96`.
- `apps/web/lib/selection.ts:45` `withState` — writes `content`, `controls`, `data`, `darkOverrides` from the panel's
  state, never `designId`: the reason a stale panel's write must be dropped.

**The gates:**

- `tools/perf/fps-trace.mjs` — `DROPPED_MAX` :44, `measure()` :95, the pass :335, THE METRIC :21.
- `tools/keyboard/journey.spec.mjs` — the pointer rule :8-17 (synthesized `pointerover` allowed, no mouse API), `open`
  :44, the 5.23a describe :3464 (`LONG_HOME`, `selectRinged`, `counter`); the FR-D19 loop :1088-1091 reads the counter
  right after each `]` — the kind of read that waits under R-210.
- `tools/keyboard/run-keyboard-gate.sh` — boots `next dev`, so `<Profiler>` callbacks fire there.
- `tools/probe/run-verify-editor.cjs` — step 60 on production's planted 40-section Home.
- `tools/doc-audit.py` — rows for `fps-trace.mjs` :1020 and `journey.spec.mjs` :1044.
- Ledger `deferred-work.md` — DW-289 (this story's), DW-290 (the first chrome mount, Story 5.24's); register
  `reconcile-designs-decisions.md` R-208 (:4615, "⬜ built — Story 5.23b").

## Tasks & Acceptance

**Execution:**

- [ ] `apps/web/lib/renders.ts` (new) -- `useStable(fn)`: a function of fixed identity calling the latest render's `fn`;
  `counted`: the `<Profiler>` `onRender` that adds 1 to `window.__inflozoRenders[id]` outside production -- the two tools
  every memoized part needs, once.
- [ ] `apps/web/lib/reorder.ts` -- a one-value store for the drag in flight (`subscribe`/`get`/`set`), read with
  `useSyncExternalStore` -- a pointer move stops re-rendering the editor.
- [ ] `apps/web/components/controls/layers.tsx` -- a module-level `memo` row with primitive props (the row's fields,
  selected, hovered, tab stop, translate) and one stable handlers object; `Layers` itself `memo`; the drag read from the
  store; a row's `<Profiler id="layers-row">` -- a hover redraws two rows, not 41.
- [ ] `apps/web/components/controls/{section-pill,sidebar}.tsx`, `apps/web/components/editor/design-picker.tsx` and the
  bar's components -- `memo` at the export; the pill's loop keyed on `shown`, its `boxOf` stable and reading refs.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- the derivations memoized (`stack`,
  `templates`, `empty`, `previewing`, `offered`, `canAdd`, one ring per design id, the remix count, the rows, the rail's
  rows, `feedless`, `assets`); `chosen`/`pointed` kept by value; the chrome portals drawn by a module-level `memo` component
  with explicit props, placed from the paint's current roots by a loop keyed on what chrome shows; `IconRail` `memo`; every
  handler a memoized part gets through `useStable`; `latest` written by handlers alone for what they change; a `<Profiler>`
  INSIDE each memoized part's own boundary (a Layers row, the Design block, the settings, the rail, the chrome, the pill) —
  outside a `memo` it would count its parent's renders; per R-210: `apply` and `restore` hand React their state as a
  transition (a drop's end in the same one), and `onChange` drops a change from a panel drawn for another design or
  instance.
- [ ] `tools/keyboard/journey.spec.mjs` -- a Story 5.23b describe on the long Home: the matrix's render-count rows (counts
  reset before a gesture, read after its own end), the rail row at 1100 px, the stale-panel and the urgent-render stops;
  run once against the editor before this story with only the counters added, and record every count stop red -- the
  mechanism's gate.
- [ ] `tools/perf/fps-trace.mjs` -- PASS only when the share, the p95 in whole refreshes and the longest task all hold;
  each printed; the METRIC paragraph says why -- DW-289.
- [ ] `tools/doc-audit.py` -- the two rows name 5.23b's additions -- the gate walks `tools/`.
- [ ] `deferred-work.md`, `reconcile-designs-decisions.md`, `epic-5-context.md` -- DW-289 closed; R-208's and R-210's "⬜
  built — Story 5.23b" ticked with what was built and measured -- standing rule 3.

**Acceptance Criteria:**

- Given the harness's 40-section Home in the keyboard gate, when a section is hovered or selected, a control changes, a
  section moves or its design changes, then each part's render count is the matrix's — no gesture redraws a part it did
  not touch.
- Given the same stops against the editor as it stood before this story with only the counters added (a scratch edit,
  reverted and compared byte for byte), when they run, then they fail — every gesture redraws every row; and given a
  scratch edit taking the row's `memo` away, the hover stop fails.
- Given `fps-trace.mjs` on this computer, when it runs `--rate 4 --runs 3`, then every run PASSES all three bars, and
  `--rate 1 --runs 1` passes; each run's numbers are recorded under Verification.
- Given a design change followed, in the same task, by a control change on the still-drawn panel — or by an urgent update
  and then a second edit — when the panels settle, then no edit is lost and nothing is written from the old panel.
- Given the finished story, when the editor opens at 1440 and below 1280, then it matches `S4 Editor.dc.html` (S4a–S4c),
  `B Missing Surfaces.dc.html` B7 (as R-126 amends it) and B1a, and `D8 Editor Below 1440.dc.html` (D8a, D8b) as Stories
  5.1–5.23a built them — nothing drawn differently; every keyboard journey passes and the deployed walk prints 0 FAIL on
  production (R-82).
- Given the change, when the gates run, then `pnpm check`, `pnpm keyboard` and the doc gate are green, CI publishes, and
  no migration exists.

## Spec Change Log

## Design Notes

**Executed at planning (2026-09-28; this computer, an Intel Core i5-6600K; Node 24.18.1; Playwright 1.61.1 with Chromium
149; production harness builds on scratch copies of `790b4d6e` outside the repository; Home at 40 by 5.23a's header).
Nothing in the repository was edited.**

- **Today** — `fps-trace.mjs --rate 4 --runs 3`: 8.3%, 7.8%, 8.3% of refreshes dropped; longest tasks 76, 78, 76 ms; raw
  p95 16.8 ms.
- **Who renders** (React's `<Profiler>` in a `--profile` build, 4×): every commit re-renders `EditorShell` (17–24 ms of
  render), of it Layers 5–12 ms (41 rows, ~46 closed menus), the Controls panel 4–11 ms, the switcher ~1 ms. A drag is 23
  commits and 398 ms of render (943 row renders); a hover or a Shuffle is two commits. A CPU profile adds the body's own
  derivations: over one drag, `categoryOf`/`isPlaceable` (the rings, the picker's offer, the remix count) 31 ms,
  `declared()` 8 ms, the sample's tag and author rows 8 ms.
- **Prototypes** (4×; each a scratch copy, 3–5 runs):

  | Variant | Refreshes dropped | Longest task |
  |---|---|---|
  | A — rows, Controls panel and bar controls `memo`'d, derivations memoized | 3.9–5.6% | 56–64 ms (the Shuffle's) |
  | A + the bar and dialogs drawn once (a measurement bound) | 3.3–4.4% | 52–55 ms |
  | that + no layout read during render + the sample context cached | 3.3–5.6% | 51–55 ms |
  | A + panels drawn from a deferred copy of the docs (state synchronous) | 3.9–5.6% | 52–56 ms |
  | A + a design change's React update as a transition | 2.8–5.0% | none over 50 ms |
  | the bound + trims + the transition | 2.8–4.4% | none over 50 ms |

  Under A a hover redrew 1 row, a control change the Controls panel alone, ⌥↓ 2 rows, a drag 81 row renders (from 943).
  With the pointer resting on Shuffle before the press the task was still 53–55 ms, so the press folding into a frame is
  not the cause.
- **Why a transition.** The Shuffle's one task under A (CPU profile, profiler on: 64–73 ms) is `paint()` ≈10 ms (the new
  design rendered and parsed), `commit()` ≈3 ms, React's render ≈15 and commit ≈14 ms (the chrome placement's forced layout
  ≈7 of it), and the browser's style, layout and paint ≈20 ms — all in the press's task. Only moving React's whole update
  out of it cleared the bar; deferring the panels alone did not. Because `latest` is re-assigned from state on every
  render, a render drawn from state a transition has not delivered would move it back, and the next edit would be made
  against an older doc — hence the Always rule and the urgent-render stop. Ruled R-210 (Question 1, option 1).
- **The metric (DW-289).** A frame's time is counted in whole refreshes, `n = max(1, round(Δ/16.67))`, so timestamp jitter
  (16.6–16.8 ms on a smooth frame) never fails it; p95 ≤ 1 refresh is "at most 5% of frames took longer than one"; the
  share of refreshes dropped weighs a long stall more; the trace passes only when both do and no task tops 50 ms.
- **The session's first selection** (not in the trace, which warms first): a 248–255 ms task at 4× on `790b4d6e`; without
  the chrome's font faces (`addFonts`, which invalidates the canvas's layout) 141–149 ms. Not this story's criteria —
  DW-290, Story 5.24.

## Verification

**Commands** (Node 24 on PATH):

- `cd apps/web && npx tsc --noEmit -p .` -- expected: no output.
- `pnpm check` -- expected: exit 0.
- `pnpm keyboard` -- expected: 0 failed, the 5.23b stops among them; the count stops first run against the editor as it
  stood before this story with only the counters added, expected red, both runs recorded.
- `node tools/perf/fps-trace.mjs --rate 4 --runs 3` and `--rate 1 --runs 1`, before and after -- expected after: every run
  PASS with its control seen; every number recorded.
- `python3 tools/doc-audit.py --check`, twice -- expected: PASS.
- `git diff --stat` from the story's `baseline_commit` to HEAD `-- supabase` -- expected: empty (no Schema phase).
- A scratch pointer probe on the harness's long Home (not committed, not a gate — the journey takes no pointer, as 5.23a's
  pointer-only doors): one pill-grip drag's render counts -- expected: the slot and the rows it slides, nothing else.

**Real infrastructure (R-82), after CI publishes:**

- GitHub Actions for HEAD (`check`, `rls`, `deploy`) green and the Vercel deployment READY at HEAD, read with
  `GITHUB_TOKEN` (or unauthenticated — the repository is public) and `VERCEL_*` from `tools/probe/.env`.
- `run-verify-editor.cjs` against `https://app.inflozo.com`: 0 FAIL, step 60 on the planted 40-section Home included;
  Supabase through the walk's service key (the accounts, the plant, the restore); the user count unchanged. Ghost T1/T3,
  Resend and Dodo are not touched — the story reads and sends nothing.

## Questions for the owner

### Question 1 — To reach the speed bar, may the side panels catch up one frame after the canvas when a section changes?

We built a rough version of this story on a copy of the editor and timed it with your slowed-down test (the 40-section
home page, this computer slowed four times). Redrawing only what changed works: skipped frames fall from about 8 in every
100 to about 4 or 5, and in the better rough version every gesture passes except changing a section's design. That one
still takes about 0.051 to 0.061 seconds in a single step, and the limit is 0.050. The editor does everything for a design change at once — draws the new
design on the canvas, updates the Layers list, the settings panel and the Undo button, and the browser redraws the screen
— and even with every panel doing the least work possible, that step lands just over the limit. When the panels update
one frame after the canvas (a sixtieth of a second at normal speed), no step goes over the limit: five runs, none over
0.050 seconds, and 3 to 5 skipped frames in every 100 (the limit is 5).

**An example.** You press Shuffle on a section of a 40-section home page. Today, on the slowed computer, the editor
freezes for about 0.08 seconds and then everything changes together. With option 1 the new design appears on the canvas at
once and the settings panel shows its controls one frame later — at your computer's normal speed a gap of about 0.017
seconds, too short to see. With option 2 both change together, after about 0.055 seconds on the slowed computer (about
0.014 seconds at normal speed).

1. **(RECOMMENDED) Canvas first, panels one frame later** — for any change to a section: a new design, a move, hide or
   show, duplicate, delete, add, Remix, undo and redo. Changing a setting still shows at once, as it must (FR-F4). A press
   on the settings panel in that one frame is ignored rather than applied to the design just replaced, so nothing you set
   can land on the wrong design, and a check on every change we push proves no edit is lost. A few automatic checks that
   read a panel in the same instant as a key press learn to wait for it; what they check does not change. The speed test
   passes and Epic 5 closes as you ruled.
2. **Everything changes together.** The panels still redraw only what changed and every other gesture passes, but a design
   change stays just over the limit on the slowed computer, so the test fails there and Epic 5 does not close on it — you
   would rule again on that gap.
3. **Build the panel work first and decide on the real numbers.** The same as 2 until then; the rough version says the gap
   will very likely remain, so this most likely comes back to you as the same question after the build.

**Ruled: option 1 (owner, 2026-09-28).** *"Canvas first, panels one frame later — for any change to a section: a new
design, a move, hide or show, duplicate, delete, add, Remix, undo and redo. Changing a setting still shows at once, as it
must (FR-F4). A press on the settings panel in that one frame is ignored rather than applied to the design just replaced,
so nothing you set can land on the wrong design, and a check on every change we push proves no edit is lost. A few
automatic checks that read a panel in the same instant as a key press learn to wait for it; what they check does not
change. The speed test passes and Epic 5 closes as you ruled."* Recorded as **R-210**; the spec was written for this
option, so its intent, boundaries and matrix now cite the ruling, and `epics.md`'s card carries it as a criterion.
