---
title: 'Story 5.23b — The editor''s panels redraw only what changed, at 60 fps'
type: 'feature'
created: '2026-09-28'
status: 'done'
owner_test: none
review_loop_iteration: 1
baseline_commit: 'bc51ecbde01fde458857592f4e3488bd03dc90d2'
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
  state in the next task, so the panels follow a frame later (Question 2 ruled option 1, owner, 2026-09-28 — the
  hand-over of Spec Change Log 8, not a transition); a control change stays in the same frame (FR-F4); a panel
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

- [x] `apps/web/lib/renders.ts` (new) -- `useStable(fn)`: a function of fixed identity calling the latest render's `fn`;
  `counted`: the `<Profiler>` `onRender` that adds 1 to `window.__inflozoRenders[id]` outside production -- the two tools
  every memoized part needs, once.
- [x] `apps/web/lib/reorder.ts` -- a one-value store for the drag in flight (`subscribe`/`get`/`set`), read with
  `useSyncExternalStore` -- a pointer move stops re-rendering the editor.
- [x] `apps/web/components/controls/layers.tsx` -- a module-level `memo` row with primitive props (the row's fields,
  selected, hovered, tab stop, translate) and one stable handlers object; `Layers` itself `memo`; the drag read from the
  store; a row's `<Profiler id="layers-row">` -- a hover redraws two rows, not 41.
- [x] `apps/web/components/controls/{section-pill,sidebar}.tsx`, `apps/web/components/editor/design-picker.tsx` and the
  bar's components -- `memo` at the export; the pill's loop keyed on `shown`, its `boxOf` stable and reading refs.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- the derivations memoized (`stack`,
  `templates`, `empty`, `previewing`, `offered`, `canAdd`, one ring per design id, the remix count, the rows, the rail's
  rows, `feedless`, `assets`); `chosen`/`pointed` kept by value; the chrome portals drawn by a module-level `memo` component
  with explicit props, placed from the paint's current roots by a loop keyed on what chrome shows; `IconRail` `memo`; every
  handler a memoized part gets through `useStable`; `latest` written by handlers alone for what they change; a `<Profiler>`
  INSIDE each memoized part's own boundary (a Layers row, the Design block, the settings, the rail, the chrome, the pill) —
  outside a `memo` it would count its parent's renders; per R-210: `apply` and `restore` hand React their state in the
  next task — the hand-over (a drop's end in the same one; Question 2), and `onChange` drops a change from a panel drawn for another design or
  instance.
- [x] `tools/keyboard/journey.spec.mjs` -- a Story 5.23b describe on the long Home: the matrix's render-count rows (counts
  reset before a gesture, read after its own end), the rail row at 1100 px, the stale-panel and the urgent-render stops;
  run once against the editor before this story with only the counters added, and record every count stop red -- the
  mechanism's gate.
- [x] `tools/perf/fps-trace.mjs` -- PASS only when the share, the p95 in whole refreshes and the longest task all hold;
  each printed; the METRIC paragraph says why -- DW-289.
- [x] `tools/doc-audit.py` -- the two rows name 5.23b's additions -- the gate walks `tools/`.
- [x] `deferred-work.md`, `reconcile-designs-decisions.md`, `epic-5-context.md` -- DW-289 closed; R-208's and R-210's "⬜
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

**Dev (2026-09-28).** Each entry is outside the frozen block and was made where the build met a fact the plan did not
have; none changes what is drawn, stored, journalled or synced.

1. **`commit`'s two early answers are asked on their own (`heldBack`), and `apply` asks them BEFORE the transition.**
   R-180's hold opens its dialog on the next frame, so its words must be in state by then, and a session reading along
   (FR-D18) must hand React nothing. `commit` still asks them first, so no door can skip them.
2. **A second key inside the frame the panels lag is made against the newest doc.** A Layers ⌥-arrow is re-based on where
   the section IS (`on.move`: the displacement asked for, from its place in the newest doc), and Space reads the newest
   doc's hidden flag. Without it, a second ⌥↓ before the rows landed journalled a move onto the place the section already
   held, and a second Space hid a hidden section again — an edit that changes nothing.
3. **The moved row takes its focus back in the move's own commit** (a layout effect, its state set in the same transition):
   a `useEffect` refocus landed after the reorder had taken the focus away, and the next key reached the page.
4. **Chrome whose root a paint removed is hidden for the frame until the chrome follows**, never placed against it — the
   Always rule's "never against a root a paint removed", on the chrome's one loop.
5. **A section operation's announcement travels with its state** (entry 8): `setSaid` after `edit()` runs in the press's
   task while the hand-over still holds, so the live region speaks with the panels. Under the first build it was an urgent
   update that rendered the editor's shell once in the press's task.
6. **The urgent-render stop also proves "canvas first" at both doors** — the I/O matrix's section-operation row. In the
   key's own task the ringed section's drawing is replaced by `]` (`apply`) and by ⌘Z (`restore`), and after ⌘Z's own
   microtasks the panel still reads the design it undoes. Each check is red with its door changed (Verification).
7. **Every restamp in place asks the chrome's layer again.** Found by the deployed walk at `8312344f` (run 1, step 12:
   *"On scroll → Static … its selected box moves from the fixed layer to the scrolling one — host view"*). The chrome is a
   `memo` part and asks `pinned` only when it renders. A control change restamps the root without a new node, so nothing
   asked, and the header's box stayed in the fixed layer after the header stopped sticking — something drawn differently.
   The old editor asked on every render. Now `onChange`'s stamp and the flip's `restampAll` tick `pinTick`, as the canvas's
   scroll listener already did; each tick is batched with its handler's own update, so no render is added. A new journey
   stop drives it from the keyboard on the harness (scrolled 700 px, Shrink → Static → Sticky). It is green on the fix and
   on the baseline editor, and red on the code as pushed (`view`). The flip's tick has no stop: no mode-scoped control can
   move a root today (they are colours, `bg` and the fixture's `tint`), and it keeps the old editor's behaviour for a
   design that declares one.
8. **R-210 is built as a HAND-OVER in the next task, not a React transition** — the frozen Approach names a transition,
   and it could not keep the ruling. Found by the deployed walk at `f4d054d1` (run 3, step 94: a second Three Up placed,
   the announcement said and the canvas drawn, and 900 ms later no Layers row). Read in React's source (the copy Next
   ships, 19.2): while an async action is in flight, every transition takes its lane and waits for it; and every new
   update clears the root's suspended lanes, so a server action or navigation still pending is rendered in the same batch
   as the next transition and holds it until the server answers. Next's server actions are router transitions, and the
   editor calls three (`setViewedStates`, `setPreviewSubject`, `recheckSite`). Executed on the harness with every
   server-action request held 2 s by a route: a Delete that changed R-167's record showed its Layers rows 2.2 s after the
   canvas, and an ⌥↓ during the opening re-read of a linked site 3.8 s after it. The panels were a round trip behind
   the canvas, not a frame — the ruling's *"too short to see"* broken wherever a server call was in flight.
   Now `lib/renders.ts`'s `canvasFirst` runs the operation in the press's task — the canvas painted, `latest` moved, as
   before — and HOLDS, in order, every call to a `handed` setter until that task yields. It then hands them to React at
   once in the next task (`flushSync`), never as a transition. Every state of the editor is `useHanded`, and so is the
   Layers rows' focus, which moves with them. A handed setter called after the press and before that task first pays
   what is owed, so no later state lands before an earlier one — the order a transition's rebasing had kept.
   Outside a hand-over a handed setter sets at once, so a control change is still in its own frame (FR-F4).
   `apply`, `restore` and a Layers move are the doors, `choosePaywall` joins `apply`'s, and `startTransition` is gone from
   the editor. Same probe after: 91 ms and 80 ms (a development build), with the answers still held. The urgent-render
   stop's scenario is kept, and its control changed with the design: an urgent key after an operation now pays the
   operation's state first, so the key's render shows both. It fails with the pay-first taken away. The old control, the
   render writing `latest` from its own state, cannot put an older doc back through that stop any more. The rule stays as
   a guard for a render an external store causes. A new stop makes the finding a gate: server actions held by a route,
   the rows land while the opening re-read is held, and while the write a Delete sent is held. It is red on the code as
   pushed at `f4d054d1`.

**Review (2026-09-28).** Five layers over the diff from `bc51ecbd` (a blind hunter, an edge-case hunter, a verification-gap
reviewer, an acceptance auditor and the real-infra verifier); what was a patch is patched here, one thing is the owner's
(Question 2). None changes what is drawn, stored, journalled or synced.

9. **The stale-press guard compares the panel's whole drawn state, not only its design.** `onChange` dropped a press from a
   panel drawn for another section or another design (entry 8's guard); a panel a frame behind can also hold the values an
   undo or a Remix just took back on the SAME design, and `withState` writes the panel's state whole — so a press there wrote
   the undone values back. The guard now requires the section as the canvas holds it to equal what the panel drew (the
   paint's own JSON signature, `chosenSig`'s). A new stop drives it: ⌘Z on a Background change, then an arrow on the panel
   still showing the undone value, in one task — the undo stands; red with the guard narrowed back (received "Contrast").
10. **The two same-frame guards of entry 2 have a stop.** `on.move`'s re-basing and `onToggleHidden`'s read of the newest doc
    were exercised by no test — every ⌥-arrow in the journey polls the rows before the next key. Two ⌥↓ dispatched in one
    task now move the section two places (red without the re-basing: 4, not 5), and two Space in one task show what the first
    hid (red reading `row.hidden`: 41 roots, not 40).
11. **A canvas switch moves `latest`'s stack, page and selection in a layout effect keyed on the canvas**, beside the commit
    effect that moves the key — they were written in the passive effect, after paint, so for that frame `latest` held the new
    key with the old canvas's stack while the chrome loop read it. Derived from `latest.docs`, never a render's state, so the
    Always ("`latest` never goes back") holds.
12. **`counted`'s silence in production is executed**, not asserted (`renders.test.ts`): under `NODE_ENV=production` the
    callback writes nothing, and otherwise one count per commit by id. And the drag store is plain `useState`, not `useHanded`
    — a constant, never set through React.

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

**Recorded at Dev (2026-09-28; this computer, the i5-6600K; Node 24.18.1; Playwright 1.61.1 with Chromium 149):**

- `npx tsc --noEmit -p .` in `apps/web`: no output. ESLint over `apps/web`: clean. The web package's unit tests: none
  failed — `reorder.test.ts` gains `oneValue`'s check, and `dark-mode.test.ts` reads the sun's handler as `on.flip`, pinned
  to be `flip` itself.
- THE COUNT STOPS BEFORE THIS STORY — the editor at `bc51ecbd` with only the `<Profiler>`s added (a scratch edit, reverted
  and `cmp`-identical to HEAD file by file): every count stop RED. A hover redrew 82 Layers rows (at most 2 allowed), a
  selection 41, a control change 41 (none allowed), ⌥↓ 82, `]` 41 (at most 1), and at 1100 a hover 123 rail rows (none
  allowed). The two R-210 stops are NOT taken as results from that run (standing rule 2): the stale-panel stop's first
  version compared against a value the first design had never stored, so it failed there for that reason and was
  corrected before the story's code ran against it; and the urgent-render stop's own control cannot hold without a
  transition (`]` reached the panel in the microtasks of its own key). Their controls are the scratch runs below.
- AFTER — `pnpm keyboard`: 116 passed, 0 failed, the 5.23b stops among them. Their controls, each a scratch edit on the
  finished code, reverted and `cmp`-identical: the row's `memo` taken away → the hover stop red (41 rows); `onChange`'s
  stale-panel guard taken away → the stale-panel stop red (the old panel's "Top" written over the carried "Side"); the
  render writing `latest` from its own state again → the urgent-render stop red (the design change lost, "1 of 3").
- R-210's waits: the journey checks that read a panel in the instant after a section operation — ⌘D, Del, the Picker's
  placement at 1280 and at 720, R-152's replacement, ⌥↑ / ⌥↓, `[` wrapping, FR-D19's loop, R-167's dots, page 2's
  following and 5.19's placements — now wait for it (`panelsSettle`, `expect.poll`) and check exactly what they checked.
  The first full run after the change found them (15 failed, 101 passed); the second is the one above. And one real race
  they exposed is fixed rather than waited for: a Layers ⌥-arrow is re-based on where the section IS in the newest doc
  (`on.move`), and the moved row takes its focus back in the move's own commit (a layout effect).
- `fps-trace.mjs` BEFORE (`bc51ecbd`): at 4× — run 1 FAIL 8.9% dropped (16 of 180), p95 16.8 ms, longest task 76 ms;
  run 2 FAIL 7.8% (14 of 180), p95 33.3 ms, 71 ms; run 3 FAIL 7.8% (14 of 180), p95 16.8 ms, 78 ms. At 1× — PASS, 0.6%
  (1 of 180), p95 16.8 ms, no long task.
- `fps-trace.mjs` AFTER, every run's control seen (the 80 ms task read as 80 ms, 3 refreshes dropped): at 4× — run 1 PASS
  4.4% dropped (8 of 180), p95 1 refresh (16.8 ms), no long task; run 2 PASS 3.9% (7 of 180), p95 1 refresh (16.8 ms), no
  long task; run 3 PASS 2.8% (5 of 180), p95 1 refresh (16.8 ms), no long task. At 1× — PASS, 0.0% (0 of 180), p95 1
  refresh (16.7 ms), no long task.
- The scratch pointer probe (`next dev`, the long Home at 1440 × 900, one pill-grip drag with the real mouse, not
  committed): the press redrew the dragged group's 40 rows once (each takes the drag's sliding state, as it always did);
  the twenty moves redrew ONE row and nothing else; the drop 42 rows and the chrome once — 83 row renders for the whole
  drag, where planning measured 943. A MutationObserver on Layers saw the slot stay until the moved rows arrived and leave
  in the reorder's own commit (R-210).
- `git diff --stat bc51ecbd -- supabase`: empty — no Schema phase.
- `python3 tools/doc-audit.py --check`, twice: the first run exited 1, the second 0 — PASS.
- `pnpm check`: exit 0.

**Re-run at the hand-back (2026-09-28; the same computer and toolchain), on the final tree with Spec Change Log 6's checks:**

- `tsc --noEmit -p .`: exit 0, no output. Its control, a type error planted in `lib/renders.ts`: `TS2322`, exit 1; removed.
- `pnpm check`: exit 0 — lint, typecheck, every package's tests with 0 failed (the web package 597 of 597).
- `pnpm keyboard`: `116 passed (4.3m)`, 0 failed — the eight 5.23b stops among them; `next-env.d.ts` restored by the runner.
- **Every stop's control, re-run on the final code** — one scratch edit each, one test run each (`pnpm keyboard -g`), every
  file restored and `cmp`-identical afterwards. All six went red where they should:
  - (a) `apply`'s paint moved off the key's task (`setTimeout(paint)`): *"R-210: `]` redrew the canvas in its own task"*,
    received `false`.
  - (b) `restore` without its transition: *"R-210: …and the panel follows a frame later"*, received `"1 of 3"`.
  - (c) `restored`'s paint moved off the key's task: *"R-210: ⌘Z redrew the canvas in its own task"*, received `false`.
  - (d) the row's `memo` taken away: *"at most the two rows whose wash changed"*, received 41.
  - (e) `onChange`'s stale-panel guard taken away: *"nothing was written from the old panel"*, expected "Side", received
    "Top".
  - (f) the render writing `latest` from its own state again: *"the design change was not lost"*, received `"1 of 3"`.
- **Nothing is drawn differently, read off the page.** A scratch probe (not committed) walked the same states on the
  harness under `next dev` — at rest, a row selected, a section pointed at, the ringed section selected, `]`, ⌥↓ and ⌘Z at
  1440 on the default and the long Home; at rest, a rail selection with Controls open, Controls closed and a hover at 1100
  on the long Home — and kept each state's editor body, canvas document, the chrome's shadow roots (placed positions
  included), the focused element and the open popovers. Folded only for what differs between two loads of one build (the
  CSP nonce, React's ids, instance ids): the final tree against itself, 18 of 18 states the same; the baseline's app files
  (`bc51ecbd`, swapped in and restored `cmp`-identical) against the final tree, **18 of 18 the same**. The snapshots hold
  the hover box, the selected box, the tag, a PAUSED chip and the pill where the gesture draws them, so the equality is not
  vacuous.
- **The drag probe, re-run:** identical to the record above — the press 40 rows, the twenty moves 1 row, the drop 42 rows
  and the chrome once; the slot stayed until the rows landed and left in the reorder's own commit.
- **The trace, re-run:** `--rate 4 --runs 3`, exit 0 — run 1 PASS 3.9% dropped (7 of 181), run 2 PASS 4.4% (8 of 181),
  run 3 PASS 3.3% (6 of 180); the p95 frame 1 refresh (16.8 ms) and no long task in every run; every control seen (the
  80 ms task read as 80 ms, 3 refreshes dropped). `--rate 1 --runs 1`, exit 0 — PASS, 0.0% (0 of 180), p95 1 refresh
  (16.7 ms), no long task. **The p95 bar's own control:** a copy with `P95_MAX` at 0 printed `run 1: FAIL` with 0.0%
  dropped and no long task — the bar gates alone; the copy was deleted.
- `paint()` is byte-identical to `bc51ecbd`'s, and no file under `packages/`, no `package.json`, the lockfile or
  `supabase/` changed.

**Real infrastructure (R-82), after CI publishes:**

- GitHub Actions for HEAD (`check`, `rls`, `deploy`) green and the Vercel deployment READY at HEAD, read with
  `GITHUB_TOKEN` (or unauthenticated — the repository is public) and `VERCEL_*` from `tools/probe/.env`.
- `run-verify-editor.cjs` against `https://app.inflozo.com`: 0 FAIL, step 60 on the planted 40-section Home included;
  Supabase through the walk's service key (the accounts, the plant, the restore); the user count unchanged. Ghost T1/T3,
  Resend and Dodo are not touched — the story reads and sends nothing.

**Real infrastructure (R-82) — what this Dev phase hit and what each returned, keys by variable name only:**

- **The Dev push, `8312344f`.** GitHub Actions (`GITHUB_TOKEN`): CI run 36390167490 — `check` success (on the runner the
  doc gate PASS, `pnpm keyboard` printing `116 passed (5.0m)`, every package's tests 0 failed, `check-snapshots: PASS`),
  `rls` and `deploy` success; Render matrix run 36390167255: success. Vercel (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`):
  `dpl_H9oSfnBsmoFbnSKga7FMTfhRyTfy` READY, production, built from `8312344f`, serving both `app.inflozo.com` and
  `inflozo.com`; a wrong bearer → HTTP 403, the control.
- **Walk run 1 at `8312344f`: `1 FAIL, 664 PASS`** — the FAIL is step 12's layer, Spec Change Log 7. Every step-60 check
  passed on production's planted 40-section Home: ⌥↓ kept all 41 roots and moved one (`["=","=",3,2,"=",…]`), its
  longest task 0 ms; the typed word landed and was taken back; the paint ending the session drew section 3 fresh and
  kept every other root; `P` `P` equalled the canvas node for node (`{"equal":true,"fresh":true}`); Synced before the
  editor went; the plant removed (HTTP 200). Supabase (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`): two throwaway accounts
  through the Auth Admin API, the seed, step 60's plant and restore through PostgREST; accounts deleted, HTTP 200, users
  13 → 13.
- **The fix, re-run on this computer before its push:** `tsc --noEmit -p .` exit 0; `pnpm check` exit 0 (the web package
  597 of 597); `pnpm keyboard` `117 passed (4.3m)`, 0 failed, the new layer stop among them. Its control: the same stop
  on `editor.tsx` exactly as pushed at `8312344f` — red at *"a control change: Static moves the box to the scrolling
  layer"*, received `"view"`, the walk's own reading; on the baseline editor (`bc51ecbd`'s app files) it passes; every
  file restored and `cmp`-identical. The trace: `--rate 4 --runs 3`, exit 0 — 3.9% (7 of 180), 2.8% (5 of 180), 3.3%
  (6 of 180) dropped, the p95 frame 1 refresh (16.8 ms) and no long task in every run, every control seen;
  `--rate 1 --runs 1`, exit 0 — 0.0% (0 of 180). The DOM comparison against the baseline: 18 of 18 states the same.
- **The layer fix's push, `f4d054d1`.** GitHub Actions (`GITHUB_TOKEN`): CI run 36394085276 — `check` success (the
  runner's doc gate PASS, `pnpm keyboard` printing `117 passed (4.3m)`, `check-snapshots: PASS`), `rls` and `deploy`
  success; Render matrix run 36394085348: success. Vercel (`VERCEL_*`): `dpl_6FCuDdmvksJ5RBAUZkrG4hnRGvKS` READY,
  production, built from `f4d054d1`, serving both domains.
  - **Walk run 2: a HARNESS ERROR, not a result** — step 6's raw `GET` of `/home`, which expects its 308, timed out at
    30 s (`:5976`, `apiRequestContext.get`) after **0 FAIL, 599 PASS**. Step 12 passed there on production (`host page`).
    Accounts deleted, HTTP 200, users 13 → 13.
  - **Walk run 3: `1 FAIL, 532 PASS`, then a HARNESS ERROR** — the FAIL is step 94, Spec Change Log 8: 900 ms after a
    second Three Up was placed, Layers held no new row (`{"added":[],"said":"Post Grids — Three Up added",…,"pagers":
    [true,false]}`), and the walk then died waiting for a row named `(none)` (`select94`, `:5460`). Step 12 passed again.
    Accounts deleted, HTTP 200, users 13 → 13.
- **The hand-over, re-run on this computer before its push:**
  - The scratch lag probe (not committed; `next dev`, every server-action POST held 2 s by a route): before, on the
    transition, a Delete's Layers rows 2,210 ms after the canvas and an ⌥↓ during the opening re-read 3,794 ms; after,
    91 ms and 80 ms. In both the canvas changed in the key's own task.
  - `tsc --noEmit -p .` exit 0; ESLint clean; `pnpm check` exit 0 — the web package 599 of 599, `renders.test.ts`'s two
    checks of the hand-over's order among them.
  - `pnpm keyboard`: `118 passed (4.2m)`, 0 failed — the ten 5.23b stops among them.
  - Controls, one scratch edit each, every file restored `cmp`-identical: the server-call stop on `editor.tsx` and
    `layers.tsx` as pushed at `f4d054d1` — red at *"the moved row lands while that read is still held"*; the pay-first
    taken out of `handed` — the urgent-key stop red at *"it handed the design change over first"* (`"1 of 3"`), and
    `renders.test.ts` 1 failed; `restore` without its hand-over — red at *"…and the panel follows a frame later"*
    (`"1 of 3"`); `onChange`'s guard taken away — the stale-panel stop red (`"Top"` written over `"Side"`).
  - The trace: `--rate 4 --runs 3`, exit 0 — 2.8% (5 of 180), 4.4% (8 of 181), 3.3% (6 of 180) dropped, the p95 frame 1
    refresh (16.8 ms) and **no long task** in every run, every control seen; `--rate 1 --runs 1`, exit 0 — 0.6% (1 of
    180), p95 1 refresh, no long task.
  - The DOM comparison against the baseline: 18 of 18 states the same. The drag probe: unchanged (the press 40 rows, the
    moves 1, the drop 42 and the chrome once; the slot stayed until the rows landed and left in the reorder's commit).
- **The hand-over's push, `db3e1496`.** GitHub Actions (`GITHUB_TOKEN`): CI run 36400619780 — `check` success (the
  runner's doc gate PASS, `pnpm keyboard` printing `118 passed (5.0m)`, `check-snapshots: PASS`), `rls` and `deploy`
  success; Render matrix run 36400619785: success. Vercel (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`):
  `dpl_5AJtc8A9YKsV7m7kK7o8VDAmsusY` READY, production, built from `db3e1496`, serving `app.inflozo.com` and `inflozo.com`;
  a wrong bearer → HTTP 403.
  - **Walk run 4 at `db3e1496`: complete — `0 FAIL, 665 PASS`.** Step 12: On scroll → Static moved the header's selected
    box to the scrolling layer (`host page`). Step 94: the second Three Up's row was there at 900 ms (`"added":
    ["home:1da8e209-…"]`), said as an ordinary placement with one pager. Step 60 on production's planted 40-section
    Home: ⌥↓ kept all 41 roots and moved one; the typing round trip landed and was taken back; `P` `P` equalled the
    canvas node for node (`{"equal":true,"fresh":true}`); Synced before the editor went; the plant removed (HTTP 200).
    Step 8's axe: zero WCAG 2.1 AA violations in every state it opens, after its positive control. Supabase
    (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`): two throwaway accounts through the Auth Admin API, the seed, step 60's plant
    and restore through PostgREST; accounts deleted, HTTP 200, users 13 → 13.
- **Not touched and not claimed:** Ghost T1 and T3, Resend and Dodo — the story reads from no Ghost, sends no email and
  bills nothing (the harness's linked site in the keyboard gate is a stand-in that answers nothing).
- **No migration:** `git diff --stat bc51ecbd HEAD -- supabase` is empty, so there is no Schema phase.

**Review (2026-09-28; this computer, Node 24.18.1, Playwright 1.61.1 with Chromium 149; every count is a run's own output).**

- **Real infrastructure, re-executed by the review's own verifier** (R-82; keys by variable name only):
  - **GitHub Actions** (`GITHUB_TOKEN`): HEAD `c390a9f4` CI run 36403235444 — `rls`, `check`, `deploy` success; Render
    matrix run 36403235442 success. Negative control: a run id that does not exist → HTTP 404.
  - **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): `dpl_2gehzsrgQWhuGfNVv7Vmuwe9cmh7` READY, production,
    built from `c390a9f4`, aliases `inflozo.com`, `app.inflozo.com`, `www.inflozo.com`; a wrong bearer → HTTP 403.
    `https://app.inflozo.com/` → 307 to `/sign-in`, served by Vercel.
  - **The deployed walk**, `run-verify-editor.cjs` against `https://app.inflozo.com` at `c390a9f4`, twice: run 1 `0 FAIL,
    582 PASS` then a harness timeout on step 79's third `GET /harness/canvas` (the known mid-run Playwright timeout; the
    same URL answered 404 in 0.4 s when curled after); run 2, from a clean worktree of `c390a9f4`, complete — `1 FAIL,
    664 PASS`: every step-60 check on the planted 40-section Home passed, axe and the phone, tablet and zoom steps passed,
    and the one FAIL is step 89's reload racing the preview subject's save, which passed in run 1 minutes earlier and
    whose write path this story does not touch — **DW-291**, a walk-hardening row, not this story's defect. Supabase
    (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`): the throwaway accounts deleted after each run, users 13 → 13 both times.
  - **No migration** (`git diff --stat bc51ecbd HEAD -- supabase` empty); Ghost T1/T3, Resend and Dodo untouched — the
    code diff carries no fetch, no Ghost API and no email or billing call.
- **Findings of the five layers, triaged** — 32 raised, 5 patched (Spec Change Log 9–12), 1 the owner's (Question 2),
  1 deferred (DW-291), the rest dismissed on reading the code (a refusal `on.move` cannot reach, a throw a React setter
  never makes, a trace window the control already refuses, the background-tab ceiling the `ponytail:` comment names,
  hook-lint and stringify nits with the trace green).
- **The review's own stops, executed both ways** (`pnpm keyboard -g`, one scratch edit each, every file restored and
  `cmp`-identical): the undo-guard stop `1 passed`; with the guard narrowed back to the design id, `1 failed` — expected
  "Base", received "Contrast". The same-frame stop `1 passed`; with `on.move`'s re-basing removed, `1 failed` — expected 5,
  received 4; with `onToggleHidden` reading `row.hidden`, `1 failed` — expected 41 roots, received 40.
- `tsc --noEmit -p .`: exit 0. `renders.test.ts`: 3 passed (the production-silence check among them). `pnpm check`: exit 0.
- **The whole keyboard gate on the reviewed tree:** `pnpm keyboard` printed `120 passed (4.4m)`, 0 failed — the two review
  stops among them; `next-env.d.ts` restored by the runner.
- `python3 tools/doc-audit.py --check` twice: PASS on both, after `tools/story-board.py` regenerated the board with
  Question 2 open.

### Results — Deploy, 2026-09-28

Deployment: `dpl_8o5BUNVvohzv7zkpjqSTGYdH8CFo` — READY, target production, built from `c3990471` (HEAD). GitHub Actions
(`GITHUB_TOKEN`) for `c3990471`: CI run 36416169012 — `check`, `rls`, `deploy` all `success`; render matrix run
36416168672 `success`; negative control, a commit sha of all zeros on the same endpoint → HTTP 422. Read with
`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`: the deployment's own `alias` list is `inflozo.com`,
`app.inflozo.com`, `www.inflozo.com` and two `*.vercel.app` aliases; negative control, a wrong bearer on the same
endpoint → HTTP 403. `https://app.inflozo.com/` answers 307 (to `/sign-in`). No migration in this story
(`git diff --stat bc51ecbd HEAD -- supabase` empty, confirmed again at Deploy), so there is no Schema phase and nothing
to read back on production. This story has no screen (`owner_test: none` — "nothing is drawn differently" is the
story's own claim) so there is no Owner's manual test to fill in; the story is marked `done` in `sprint-status.yaml`
instead, per R-80's no-screen path.

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

### Question 2 — The plan's frozen text says the panels follow "as a transition"; the build does it another way. May the wording be updated?

Your ruling R-210 says what the customer sees: the canvas changes at once and the panels catch up a frame later. The plan's
frozen paragraph also named HOW — a React "transition". Building it that way, the deployed test found the panels could wait
seconds, not a frame, whenever the editor was also talking to the server (a save, a re-read of your site), because React
holds every transition behind a pending server call. So the build hands the panels over in the next slice of time instead
(Spec Change Log 8), which keeps your ruling in every case. Nothing you see is different; the review flags it only because
the frozen paragraph is yours to change, not ours.

**An example.** You delete a section while the editor is saving your last change. Built as a transition, the Layers list
kept the deleted row for about two seconds on the harness. Built as it is now, the row goes within a frame, saving or not.

1. **(RECOMMENDED) Update the wording** — the frozen sentence becomes "hands React its state in the next task, so the
   panels follow a frame later"; R-210 itself is unchanged.
2. **Keep the wording as it is** — the plan and the build then disagree on paper, with the change log as the only record.
3. **Rebuild it as a transition** — matches the wording, but the panels lag behind every server call (measured 2 to 4
   seconds on the harness) and your ruling's "too short to see" would not hold.

**Ruled: option 1 (owner, 2026-09-28).** *"Update the wording — the frozen sentence becomes 'hands React its state in the
next task, so the panels follow a frame later'; R-210 itself is unchanged."* The frozen Approach bullet now reads so and
cites this ruling; the Execution bullet for `editor.tsx` reads "the hand-over" for what it ticked. No question left open.
