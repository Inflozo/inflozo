---
title: 'Story 5.23a — The canvas redraws only what changed'
type: 'feature'
created: '2026-09-27'
status: 'in-progress'
owner_test: none
review_loop_iteration: 0
baseline_commit: '1a55920de16816a4403dda48dcba1173ea5bc684'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Changing a section's design or moving a section on a long page no longer freezes the editor: only that one section is
redrawn, so on a 40-section home page the change lands at once instead of after about half a second on the slowed-down
test computer. Nothing on your screen looks different — every page, panel and setting is exactly as before, and an
automatic check on every change we push proves the redrawn page is identical to a full redraw, and that one Undo after a
Remix puts every re-rolled section back. The editor's side panels still redraw in full after each change, which keeps the
full 60-frames-a-second test just short of its bar; as you ruled (R-208), the next story, 5.23b, makes them redraw only
what changed and carries that test.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** every design change, move, undo and Remix calls `paint()`, which renders every section and rewrites
`#canvas` whole. Measured at planning (Design Notes) on the harness's 40-section Home at 4× CPU throttle: one `]` is a
488–501 ms long task, one ⌥↓ 482–498 ms, one ⌘Z 475–484 ms — NFR-1's limit is 50 ms. And one `⌘Z` restoring SEVERAL
remixed sections has never been walked in a browser (DW-215).

**Approach** (R-206):

- **`paint()` keeps a record of what it drew, per section, and reuses it.** A section whose stored instance and render
  context are unchanged keeps its nodes; any other is rendered and parsed alone; the nodes are then put in stack order.
  So a design change replaces one section, a move moves one, and a change that alters every section — another canvas,
  page, mode, visitor, Preview, subject, source, or a read that lands — still repaints the page. One code path: a full
  repaint is the same walk with nothing to reuse.
- **Proved mechanically in the keyboard gate** on a 40-section Home the harness builds on request: which nodes survive
  each gesture, and that the canvas equals a full repaint node for node. DW-215 is walked there too.
- **The 3-second trace is a manual script** (NFR-1), run on this computer at 4× before and after, and recorded. The
  planning prototype says the canvas alone does not clear the bar — every change still re-renders the whole editor
  (7.4–8.9% of frames dropped against 5%) — so the 60 fps pass is Story 5.23b's, straight after this one (**R-208**, the
  owner's ruling on Question 1).

## Boundaries & Constraints

**Always:**

- **Node for node.** After any keyed paint, `#canvas` equals what a full repaint of the same docs draws — elements,
  attributes as a set, text and comment nodes, in order (`isEqualNode`).
- **A section owns every top-level node its part parses to**, not only its root: the controls fixtures open with a
  comment (executed — inserting the root alone dropped it and broke agreement).
- **Each part is parsed alone with `#canvas` as its context**, in the full repaint too, so the two cannot differ.
- **A record is trusted only while nothing else has written its section.** Whatever writes a section outside `paint()`
  drops that section's record: the control stamp, an inline editing session, a mode flip (every record).
- **Behave as after a full repaint.** Editing ends, the hover clears, `mark()` re-marks, `core` stops before the write
  and starts after, the shims redraw — as `paint()` does today.
- **The fixture is derived.** The 40-section Home cycles what the harness already places on Home; the section count is
  FR-D14's and NFR-1's 40, named once per tool with its source.

**Ask First:**

- Any change to what an edit STORES, journals or syncs — this story changes only how the canvas is drawn.
- Any change to `packages/library/modules/core.js` (the theme's runtime) — e.g. restarting only one section's mounts.
- Changing the Paywall surface's own page write (`paywallPage`).

**Never:**

- Never a doc field or a migration — no Schema phase.
- Never a frame-time gate in CI (NFR-1): the trace is manual; CI gates the mechanism.
- Never memoize or restructure the editor's panels, Layers or chrome here — that is Story 5.23b's (R-208).
- Never author a shipped design (AD-35, R-158) and never edit the design export (R-74).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Design change | 40-section Home; a ringed section; `]`, `[`, ◀ ▶, Shuffle or a thumbnail | That section's nodes replaced; every other root the same node, same place | N/A |
| Move | ⌥↓ / ⌥↑ on its Layers row, or a drag by either grip | Nothing rendered; the section's nodes one place on; every root the same node | N/A |
| Hide · Show · Duplicate · Delete · Place | Space on a row, ⌘D, Del, the Picker | Only the touched section's nodes go or come | N/A |
| Undo · Redo | ⌘Z / ⇧⌘Z after any of the above | Only sections whose stored instance changes back are redrawn | N/A |
| Remix, then one ⌘Z (DW-215) | ⇧R confirmed on the 40-section Home | Several sections redrawn; ⌘Z restores all of them exactly; no other root replaced | N/A |
| Whole-page change | Canvas, page, mode, View as, Preview, subject, source; a read that lands | A full repaint | N/A |
| Written outside `paint()` | A control stamped in place; an inline session; a mode flip | That section's (a flip: every) record dropped; redrawn at the next paint | N/A |
| Hidden or gated section | Its part is `''` | No nodes; root `null`, as `sectionRoots` gives today | N/A |
| Paywall surface | `paywall` canvas | Its own page write, as today; no records kept | N/A |
| Agreement | Any sequence above, then `P` `P` (Preview in and out) | Canvas before `isEqualNode` canvas after | A difference fails, naming the first differing child |
| Trace | `fps-trace.mjs` at 4× | Prints vsyncs, dropped, p95, longest task, PASS/FAIL vs NFR-1 | Its controls unseen → it refuses to report |

</frozen-after-approval>

## Code Map

**The paint** — `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`, line anchors at `1a55920d`:

| Symbol | Line | What it is |
|---|---|---|
| `paint` | :2199-2352 | Guards (:2205-2213), `data-mode` (:2217), editing ended (:2219-2221), the lock pill kept (:2225). |
| — the edit that needs a read | :2251-2260 | Empties `roots`/`stamps` and leaves the DOM, then `request()` → must drop every record too. |
| — the render loop | :2270-2294 | `now.stack.map` → `renderSection` per section; `''` for hidden or `whole`. The per-section body to reuse as-is. |
| — the write | :2298-2314 | `behaviours.current?.stop()`, the surface sheet, `mount.innerHTML = …` (:2306), `drawShims`, `takeStamps` over the mount (:2310), `sectionRoots(parts, …)` (:2314). |
| — after the write | :2316-2348 | The Paywall's scroll to the cut, `wire`, `startBehaviours` (:2323), hover cleared, `mark()`, `setPaints`, the dataset and `painted`. Unchanged. |
| `queryKey` | :558 | `${doc}:${instanceId}` — the record's key (a page-2 copy differs by `doc`). |
| `roots` · `behaviours` · `stamps` | :941 · :944 · :955 | The refs the paint fills; add the records and their context beside them. |
| `blank` | :1781-1792 | Empties `#canvas` while another page's reads are in flight → drop every record. |
| `mark` | :1688-1706 | Re-applies the state marks after every paint and stamp. Unchanged. |
| `restampAll` · `flip` | :1718-1727 · :1731 | Stamps every root outside `paint()` → drop every record. |
| `startEditing` | :2442-2513 | The inline session writes its section's DOM (the span wrap :2458-2465, the same-prop rewrite :2488, and `lib/inline.ts` :114-118, :158, :176, :305-308) → drop that section's record when it starts. |
| `repaintAfterPress` · `release` | :2379-2392 | The repaint after editing ends — it redraws the edited section once its record is gone. |
| `onChange` | :3780-3800 | The control fast path stamps one root in place (:3797) → drop that section's record. |
| `apply` | :3356-3380 | Every section operation ends in `paint()` (:3378): `onDesign` :3474, `stepDesign` :3485, `onShuffle` :3505, `onRemix` :3535, `moveTo` :3711 (⌥↑/⌥↓ and both grips — `pillGrip` :3748), placement, duplicate, delete, hide. |
| `restore` | :1194-1225 | Undo and redo end in `paint()` (:1222). |
| Full-repaint callers | :1993, :2006-2022, :1811-1827 | `chooseVisitor`, `enterPreview`/`leavePreview`, `request()`'s `land` (a canvas, page, subject, source or read). |

**Its neighbours:**

- `apps/web/lib/selection.ts` — `sectionRoots` :12 (one element per non-empty part; the Paywall keeps it), `takeStamps` :71
  (lifts and REMOVES the stamps, so a kept section keeps its own map), `rootFrom` :18.
- `apps/web/lib/canvas.ts:183-253` — `renderSection` returns one section's markup; `paywallPage` :282.
- `packages/library/fixtures/controls/{1,2,3}/index.html` — each opens with an HTML comment; the pilots in
  `packages/library/designs/` open with their root and end with it.
- `apps/web/lib/behaviours.ts:58` `startBehaviours` → `core` (`packages/library/modules/core.js`): ONE scan of the whole
  document at start, `{ paused, stop }`, no per-root scope; `sync()` already halts and restarts a mount on the same element.
- `apps/web/lib/live-client.ts:49-132` — `liveStore` has no revision; `ensure` revalidates a stale key in the background
  and "the next paint shows it" → add `version()`, counted on each `cache.set`.
- `apps/web/lib/page-two.ts:30` — `Placed = DocInstance & { target, doc }`, the stack entry whose JSON is the signature.

**The harness and the gates:**

- `apps/web/app/(app)/app/harness/editor/layout.tsx` — `instanceOf` :81-90 flags EVERY instance of `MAIN_FEED` (:79), so
  a cycled Home must flag only the first; the request headers are read at :144-147; `docs` at :159-164.
- `tools/keyboard/journey.spec.mjs` — `open` :43, `select` :142, `selectRinged` :933 (the last page row; on the cycled
  Home it is a ringed section), the FR-D17 Remix stop :1214-1243, `page.setExtraHTTPHeaders` precedent :2480. The file's
  first test forbids a pointer API below its sentinel.
- `tools/keyboard/run-keyboard-gate.sh` — the boot pattern (free port, readiness on the harness page, `next-env.d.ts`
  restored) the trace script mirrors with `next build` + `next start`.
- `tools/probe/run-verify-editor.cjs` step 60 :2862-2908 — plants a 40-section Home on production through the service key,
  reloads, measures FR-D14's lockup bound; its note names Story 5.23b as the fps gate's (R-208).
- `tools/doc-audit.py` — catalogue rows: `run-verify-editor.cjs` :562, `journey.spec.mjs` :1026; a new file under `tools/`
  needs its own row.
- `_bmad-output/implementation-artifacts/deferred-work.md:5191` — DW-215.

**Not this story's — Story 5.23b's (R-208), recorded for its planning:** the chrome `useLayoutEffect` at :3299-3327
re-runs on every render and restarts its rAF loop; `lib/canvas-layer.ts`'s `place()` and the section pill's own loop
(`components/controls/section-pill.tsx:129-163`) read geometry every frame; `EditorShell`'s render body; Layers' rows.

## Tasks & Acceptance

**Execution:**

- [x] `apps/web/lib/live-client.ts` -- `LiveStore` gains `version()`: the number of answers written to the cache --
  a read that lands, a background one included, changes the render context.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- `paint()` becomes Design Notes' walk: a
  record per section by `queryKey` (its signature, every top-level node, its root, its stamps) and the context it was
  drawn under; reuse, render-and-parse alone (`Range.createContextualFragment` over `#canvas`), remove what no kept
  record owns, insert in stack order; `roots` and `stamps` from the records. The Paywall keeps `paywallPage` and no
  records. Records dropped by `blank`, the edit-that-needs-a-read branch, `restampAll`, `startEditing` and `onChange`'s
  stamp. The file header's paint paragraph says so -- R-206's "a design change replaces one section, a move moves one".
- [x] `apps/web/app/(app)/app/harness/editor/layout.tsx` -- `x-inflozo-harness-home: <n>` builds Home as n instances
  cycling today's Home designs, the main feed flagged on the first alone; the header comment says so -- the 40-section
  fixture with no database, the default fixture untouched (DW-215's own reason).
- [x] `tools/keyboard/journey.spec.mjs` -- a `describe` on the 40-section Home (roots tagged with an expando before each
  gesture): `]`/`[` replace one root; ⌥↓ moves one; Space, ⌘D, Del and their ⌘Z touch only their section; a control
  changed in place, then another section's ⌥↓, leaves the changed section's root new, and `.` then an edit leaves every
  root new; after them all, `P` `P` and `isEqualNode` against a `cloneNode(true)` taken before; DW-215's Remix and one ⌘Z
  against its pre-Remix snapshot. Run the identity stops once on the baseline paint and record them failing -- the
  mechanism's gate, on every commit.
- [x] `tools/perf/fps-trace.mjs` (new) -- the manual NFR-1 trace in Design Notes: builds and starts the production
  harness, warms it, traces 3 s at `--rate` (default 4) for `--runs` (default 3), prints and exits 0/1, restores
  `apps/web/next-env.d.ts` and stops its own server -- NFR-1's gate, never CI's.
- [x] `tools/probe/run-verify-editor.cjs` -- step 60, on the planted 40-section Home: ⌥↓ keeps every root and moves one;
  a canvas typing round trip (a word typed into a planted heading, then taken back) and `P` `P`, then `isEqualNode`; the
  longest task noted -- R-82 on production, where the canvas typing path lives.
- [x] `tools/doc-audit.py` -- a row for `tools/perf/fps-trace.mjs`; the journey's and the walk's rows name 5.23a's
  additions -- the gate walks every file under `tools/`.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md`, `.../reconcile-designs-decisions.md` -- DW-215 closed with
  its journey stop; R-206's "⬜ built — Story 5.23a" and R-208's 5.23a half ticked with what was built and measured --
  standing rule 3.

**Acceptance Criteria:**

- Given the harness's 40-section Home, when a design changes by `]`, `[`, ◀ ▶, Shuffle or a thumbnail, then that
  section's nodes are new and every other section's root is the same node in the same place.
- Given the same page, when a section moves by ⌥↑, ⌥↓ or a drag, then no section is rendered and every root is the same
  node, the moved one a place on.
- Given the 40-section Home, when a section is hidden, shown, duplicated, deleted or placed, or an edit is undone or
  redone, then only sections whose stored instance changed are redrawn; and when the canvas, page, mode, visitor, Preview,
  subject or source changes, or a read lands, then the whole page is repainted.
- Given any sequence of the above, when the page is then fully repainted (`P` `P`), then the canvas equals itself before,
  node for node — in the keyboard gate and on production's planted 40-section Home.
- Given the 40-section Home, when Remix re-rolls several sections and `⌘Z` is pressed once, then the canvas equals its
  pre-Remix snapshot node for node and no other section's root was replaced (DW-215).
- Given a control stamped in place, an inline edit or a mode flip, when the next paint runs, then that section (for a
  flip, every section) is rendered fresh, never reused.
- Given the finished story, when the editor opens at 1440 or below 1280, then it matches `S4 Editor.dc.html` (S4a–S4c) and
  `D8 Editor Below 1440.dc.html` as Stories 5.1–5.22 built them — nothing is drawn differently, which the node-for-node
  criterion and every unchanged journey hold.
- Given `fps-trace.mjs` on this computer, when it runs at 4× and at 1×, then it prints NFR-1's numbers with its controls
  seen, and the results before and after this story are recorded under Verification — the pass is Story 5.23b's
  (R-208).
- Given the change, when the gates run, then `pnpm check`, `pnpm keyboard` and the doc gate are green, CI publishes, and
  no migration exists.

## Spec Change Log

**Dev (2026-09-27 and 09-28).** Each entry is outside the frozen block and was made where the build met a fact the plan did not
have; none changes what the canvas draws.

1. **Each part is parsed through `innerHTML` on a detached element of `#canvas`'s own kind, not
   `Range.createContextualFragment`** (the task named it). Executed on the harness canvas under its own policy
   (`script-src 'self' 'nonce-…' 'strict-dynamic'`): a `<script src>` inserted from a contextual fragment was fetched and
   ran, while `innerHTML` and a `<template>` fetched nothing. The context element is `#canvas`'s kind in the canvas
   document, so the frozen rule — each part parsed alone with `#canvas` as its context, in the full repaint too — holds;
   the finding is the comment beside the code.
2. **The journey pins each part's opening comment directly.** Both paints take the one walk, so `P` `P`'s node-for-node
   comparison cannot see a defect the two share — executed: dropping every part's comment passed it. The journey reads,
   from the library's own files, every design whose markup opens with a comment and requires that comment directly
   before each such root, after a keyed move and after the full repaint.
3. **The trace performs the drag before the ⌥↓**, while the dragged section is still where the warm-up put it on
   screen. The gesture set is the Design Notes'.
4. **"A read that lands" is walked in the keyboard gate** — the one whole-page change the harness had no way to make,
   because its linked site answers nothing. The journey answers that site's Content API reads from the bundled sample
   (`page.route`) and moves the page's clock past `FRESH_MS` (`page.clock`): a background revalidation lands unpainted,
   and the next edit's paint must redraw every section and show what landed. Its control: with `version()` taken out of
   the paint's context, the stop fails at "the next one repaints the whole page".
5. **Step 60 also checks that the paint ending an inline session draws that section fresh** and keeps every other root.
   Its control, a scratch edit: without the drop in `startEditing`, the typed section's root was kept after Esc and every
   step-60 check the task named still passed.
6. **A hover whose section the paint kept stays.** Found by the deployed walk at `10c30db4`: run 2's step 8, *"axe: zero
   violations with S4b's pill showing … and a Layers row's ⋯ menu open"*, failed with no violation — the pill was gone. A
   full repaint let the hover go, and the browser hovered the NEW node under a resting pointer again with its own
   `pointerover`. A kept node gets no such word, so the outline and the pill vanished under a pointer that never moved —
   something drawn differently, which the criteria forbid. `paint()` now lets the hover go only when the hovered section
   was redrawn; a layout that moves other content under the pointer is the browser's to report, as it always was. The
   frozen *"the hover clears"* is read as what it was written for — behave as after a full repaint, which on screen means
   the hover under a resting pointer is still drawn. The evidence is under Verification, *"The kept hover"*.
7. **Step 60 sends the typing's owed work before it leaves.** The task's typing round trip made step 60 the first step to
   EDIT the plant, and the departing page's own flush lands whenever it lands: in the deployed walk's run 3 at `0ea616db`
   it arrived after step 61's hydrate had read the seed, so step 66's ⌘S met *"This project was changed somewhere else"*
   and 40 instances on the server. Step 60 now presses ⌘S and waits for the indicator to rest on Synced (`lib/journal.ts`'s
   own label) before it leaves the editor and puts Home back, so the departing page has nothing to send.

## Design Notes

**Executed at planning (2026-09-27; this computer, an Intel Core i5-6600K; Node 24.18.1; the repo's Playwright 1.61.1
with Chromium 149; a production build of the harness, `INFLOZO_HARNESS=1` on `next build` and `next start`, Home at 40
sections by a scratch header). Every scratch edit was reverted and the harness rebuilt from the source.**

- **Today, at 4×.** One `]` or `[`: a 488–501 ms long task — `paint()` 353–367 ms of it: the render loop 270–286 ms,
  the `innerHTML` write 72–77 ms, the stamps 4–6 ms, `core` ≤ 1 ms. One ⌥↓ or ⌥↑: 482–498 ms. The ⌘Z of a control
  change: 475–484 ms (`restore` repaints everything). A control change: no long task, one dropped vsync. At 1×, `]`/`[`
  142–167 ms, ⌥↓/⌥↑ 130–160 ms.
- **The keyed paint, prototyped.** `]`: `paint()` 8.8–12 ms at 4× (one section rendered, one inserted), no long task.
  ⌥↓: 3.7–6 ms (none rendered, one node moved). Node identity: after `]`, 40 of 41 roots the same nodes; after ⌥↓, 41 of 41.
  Agreement with a full repaint (`P` `P`): byte-equal `innerHTML` — once each part's leading comment moved with its section.
  The first prototype inserted only the root: the comment was dropped, and this check caught it.
- **The trace** (Shuffle from the pill, a press, ⌥↓, a 24-move pill-grip drag; warm; 3 s; 4×). Today, two runs:
  31.9–32.3% of vsyncs dropped, long tasks 630–633 ms and 520–549 ms (at 1×: 10.1%, 170 and 149 ms). The prototype, three
  runs: 7.4–8.9% dropped, long tasks 50–88 ms.
  NFR-1 allows 5% and 50 ms. The planned two control changes did not run (the trace's radio lookup missed after the
  Shuffle); measured alone, each drops one vsync at 4×.
- **Where the rest goes** (a sampled CPU profile mapped through source maps, one Shuffle at 4×): React's reconciliation
  53–56 ms self (a Shuffle, a reorder); `EditorShell`'s own render body 9–15 ms; the chrome placement loops'
  `getBoundingClientRect` 27–40 ms across the 1.2 s window; 31 ms of garbage collection after a press. The first hover of a
  session — which mounts the pill and the chrome layers — is one 193 ms long task. That is Story 5.23b's (R-208).

**The walk (the whole of `paint()`'s change):**

```
ctx      = every renderSection input but the instance — the canvas, page, pageFile, feed, url, page number, mode,
           visitor, Preview, source, the stored and resolved subject, and on the site's content the store's version()
key, sig = queryKey(i), JSON.stringify(i)                       for each placed section i, in stack order
reuse      records[key] when ctx === drawnCtx, its sig === sig and every one of its nodes is still a child of #canvas
otherwise  html = renderSection(…) exactly as today; '' → no nodes, root null
           fragment = range.createContextualFragment(html), the range over #canvas's contents
           nodes = every child of the fragment; root = its one element; stamps = takeStamps(root and descendants)
core.stop(); remove every #canvas child no reused record owns
cursor = #canvas.firstChild; for each record, for each node: node === cursor ? advance cursor : insertBefore(node, cursor)
roots  = the records' roots in stack order; stamps = their maps concatenated in stack order (document order, which
         sameLock's index relies on); records and drawnCtx saved; then everything after the write, unchanged
```

- **Why a signature and not identity.** `designate`, `stackOf` and the journal all rebuild objects, so an unchanged
  section is rarely the same object; JSON equality means deep equality for the doc's plain data, so a false "same" cannot
  happen — a false "changed" only redraws one section more. 41 signatures cost under a millisecond at 4×.
- **Why records are dropped rather than refreshed.** The control stamp, the inline session and the mode flip each write
  DOM the paint did not; refreshing a record would claim that DOM equals a fresh render. Dropping costs one section's
  render at the next paint (4–6 ms at 4×). A mode flip already changes `ctx`; dropping every record also covers a
  flip and a flip back before any paint.
- **Why every mount restarts.** `core` has no per-root scope, and a full repaint restarts every mount today; `sync()`
  halts and restarts a mount on the same element on a media change, so a module already survives it. `ponytail:` scope
  it to the redrawn sections the day a running module's restart becomes visible — a `core.js` change, Ask First.
- **Per-part parsing is today's markup.** Every part is self-contained, so its elements parse exactly as inside one
  `innerHTML`; the only possible difference is two top-level text nodes at a boundary that one write would merge — no
  design starts or ends with text today, and top-level whitespace between sections draws nothing. Step 4's comparison
  with `/pilots` reads elements only.

**The fixture.** `x-inflozo-harness-home: 40` cycles what the harness already places on Home — A17 Three Up, A22 Inline
Row, A4 Latest Post and the fixture ring's first design (R-158) — under the site doc's A1 Rail: four of the five pilots.
A24 compiles to `post.hbs` alone and R-37 allows one Post Content per page, so it cannot be on a 40-section Home.

**The trace (`tools/perf/fps-trace.mjs`).**

- **Warm, as NFR-1 defines it.** Before the clock: the page painted, a ringed section hovered (which mounts the pill),
  selected, and its Style group open.
- **The clock, 3 s.** A Shuffle from the pill; two control changes (arrow keys on a radio in the open group); a ⌥↓ from
  its Layers row; a pill-grip drag of about 20 pointer moves and a drop. A gesture that could not be performed fails the
  run: a trace missing one is not a result.
- **The frame metric.** rAF intervals: one lasting n vsyncs (n = max(1, round(Δ / 16.67))) drops n − 1. So "p95 frame
  time ≤ 16.7 ms" is "at most 5% of the trace's vsyncs dropped". Headless rAF reads 16.6–16.8 ms on smooth frames, so a
  frame is counted, never compared to 16.7.
- **The controls (standing rule 2).** Before each run, an 80 ms busy task on a timer must show as a long task and as
  dropped vsyncs, or the run is refused.
- **Output.** Per run: the gestures done, vsyncs, dropped and %, p95, the longest task, and PASS or FAIL against NFR-1.

**Deferred work.** DW-215 is this story's (R-206) and closes with its journey stop. Nothing else in the ledger names 5.23a.

## Verification

**Commands** (Node 24 on PATH):

- `cd apps/web && npx tsc --noEmit -p .` -- expected: no output.
- `pnpm check` -- expected: exit 0.
- `pnpm keyboard` -- expected: 0 failed, the 40-section journeys among them. Run the identity stops once against the
  baseline paint first: expected red (after `]`, no root kept); record both runs.
- `node tools/perf/fps-trace.mjs --rate 4 --runs 3` and `--rate 1 --runs 1`, on the baseline and after -- expected: the
  controls seen and every gesture performed in every run; record each run's numbers as printed.
- `python3 tools/doc-audit.py --check`, twice -- expected: PASS.
- `git diff --stat 1a55920de16816a4403dda48dcba1173ea5bc684 HEAD -- supabase` -- expected: empty (no Schema phase).

**Recorded at Dev (2026-09-27; this computer, the i5-6600K; Node 24.18.1; Playwright 1.61.1 with Chromium 149):**

- `tsc --noEmit -p .` (TypeScript 7.0.2, run non-incrementally): no output, exit 0. Its control, a type error planted in
  `paint()`, was reported and then removed.
- `pnpm check`: exit 0, no failing test in any package.
- **The identity stops on the baseline paint: red, as expected.** The 5.23a describe run against `paint()` as it stood
  at `1a55920d` failed its first identity stop (after `]`, every root on the page was new where one was expected) and
  DW-215's stop (every root new after the Remix, not only the re-rolled ones). Its whole-page stops passed there, since
  a full repaint makes every root new.
- **After: `pnpm keyboard`, 0 failed** — printed `105 passed (3.9m)`, the floor journeys included.
- **The stops' controls.** Each was a scratch edit of `editor.tsx`, reverted and compared byte for byte afterwards:
  - without the drop at the control stamp, "⌘Z of a stamped control" went red: the undo reused the stamped drawing;
  - without the drop at the flip, "after a flip and back, the next paint draws every section fresh" went red;
  - with Preview left out of the render context, "Preview in and out is a whole-page repaint" went red;
  - with a part's comment left out of its drawing, and with the walk moving only each drawing's root, the comment pin
    went red.
- **Found at Dev: why the comment pin exists.** Both paints go through the ONE walk, so `P` `P`'s node-for-node
  comparison cannot see a defect the two share. Executed: dropping every part's comment passed it. So the journey reads,
  from the library's own files, every design whose markup opens with a comment. It then requires that comment directly
  before each such root, after a keyed move and after the full repaint.
- **Found at Dev: the parse.** `Range.createContextualFragment`, the Code Map's named call, un-marks a `<script>`.
  Executed on the harness canvas under its own policy (`script-src 'self' 'nonce-…' 'strict-dynamic'`): a `<script
  src>` inserted from a contextual fragment was fetched and ran (`load`, no violation), while `innerHTML` and a
  `<template>` fetched nothing. So each part is parsed through `innerHTML` on a detached element of `#canvas`'s own kind.
  That is the same parse, with `#canvas`'s kind as the context, so the frozen rule holds. The finding is the comment
  beside the code.
- **The trace before**, on `paint()` as at `1a55920d` (planning's 31.9–32.3% in Design Notes came from an earlier script
  whose two control changes never ran, so the two are not compared):
  - `--rate 4 --runs 3`, exit 1:
    - `run 1: FAIL — 5 gestures (Shuffle, a control, a control, a pill-grip drag, ⌥↓) in 3151 ms (the gestures outran the 3 s) · 189 vsyncs, 114 dropped (60.3%; NFR-1 allows 5.0%) · p95 frame 66.6 ms · longest task 636 ms (NFR-1 allows 50) · control: 80 ms task seen as 80 ms, 3 vsyncs dropped`
    - `run 2: FAIL — 5 gestures (Shuffle, a control, a control, a pill-grip drag, ⌥↓) in 3125 ms (the gestures outran the 3 s) · 188 vsyncs, 111 dropped (59.0%; NFR-1 allows 5.0%) · p95 frame 66.7 ms · longest task 621 ms (NFR-1 allows 50) · control: 80 ms task seen as 80 ms, 3 vsyncs dropped`
    - `run 3: FAIL — 5 gestures (Shuffle, a control, a control, a pill-grip drag, ⌥↓) in 3122 ms (the gestures outran the 3 s) · 187 vsyncs, 110 dropped (58.8%; NFR-1 allows 5.0%) · p95 frame 50.0 ms · longest task 628 ms (NFR-1 allows 50) · control: 80 ms task seen as 80 ms, 3 vsyncs dropped`
  - `--rate 1 --runs 1`, exit 1:
    - `run 1: FAIL — 5 gestures (Shuffle, a control, a control, a pill-grip drag, ⌥↓) in 3002 ms · 180 vsyncs, 24 dropped (13.3%; NFR-1 allows 5.0%) · p95 frame 16.8 ms · longest task 172 ms (NFR-1 allows 50) · control: 80 ms task seen as 80 ms, 3 vsyncs dropped`
- **The trace after:**
  - `--rate 4 --runs 3`, exit 1:
    - `run 1: FAIL — 5 gestures (Shuffle, a control, a control, a pill-grip drag, ⌥↓) in 3000 ms · 180 vsyncs, 13 dropped (7.2%; NFR-1 allows 5.0%) · p95 frame 16.8 ms · longest task 75 ms (NFR-1 allows 50) · control: 80 ms task seen as 80 ms, 3 vsyncs dropped`
    - `run 2: FAIL — 5 gestures (Shuffle, a control, a control, a pill-grip drag, ⌥↓) in 3002 ms · 180 vsyncs, 13 dropped (7.2%; NFR-1 allows 5.0%) · p95 frame 16.8 ms · longest task 71 ms (NFR-1 allows 50) · control: 80 ms task seen as 80 ms, 3 vsyncs dropped`
    - `run 3: FAIL — 5 gestures (Shuffle, a control, a control, a pill-grip drag, ⌥↓) in 3001 ms · 180 vsyncs, 17 dropped (9.4%; NFR-1 allows 5.0%) · p95 frame 33.3 ms · longest task 75 ms (NFR-1 allows 50) · control: 80 ms task seen as 80 ms, 3 vsyncs dropped`
  - `--rate 1 --runs 1`, exit 0:
    - `run 1: PASS — 5 gestures (Shuffle, a control, a control, a pill-grip drag, ⌥↓) in 3004 ms · 180 vsyncs, 1 dropped (0.6%; NFR-1 allows 5.0%) · p95 frame 16.7 ms · longest task 0 ms (NFR-1 allows 50) · control: 80 ms task seen as 80 ms, 3 vsyncs dropped`
  - At 4× the gestures now fit inside the 3 s, and NFR-1 still fails there: that is the panels' share, Story 5.23b's
    (R-208).
  - The trace's own fixes, found while building it. The radios carry no name, so a control change is read by its group's
    label and the checked place — the planning run's missed lookup. The drag lifts only once Layers' drop slot has moved,
    or the drop read a landing not yet rendered. The drag runs before the ⌥↓, while its section is still on screen.
- **Step 60's new block, dry-run before the deploy.** Its production run follows the Dev push, because the walk refuses a
  dirty tree and a deployment that is not HEAD. The block, with the walk's own helpers copied into a scratch probe, ran against the production harness build
  on its long Home, and every check passed. Its control, a scratch edit: without the drop when an inline session starts,
  the typed section's root was KEPT after Esc, and every step-60 check written until then still passed. So step 60 now
  also checks that the repaint ending the session draws that section fresh and keeps every other root.
- `python3 tools/doc-audit.py --check`: the first run regenerated the index for the new catalogue row and asked for the
  story board (`tools/story-board.py`); then PASS on each of the next two runs.
- `git diff --stat 1a55920de16816a4403dda48dcba1173ea5bc684 -- supabase` (the working tree): empty — no migration, no
  Schema phase.

**Re-run at the hand-back (2026-09-28; the same computer and toolchain), after the journey gained Spec Change Log 4's stop
and the panel's ◀:**

- `tsc --noEmit -p .`: exit 0, no output.
- `pnpm check`: exit 0 — lint, typecheck, every package's tests with 0 failed, and `check-snapshots: PASS`.
- `pnpm keyboard`, the whole gate on the final tree: `106 passed (3.9m)`, 0 failed — the six 5.23a stops among them.
- **A read that lands** (Spec Change Log 4): passed alone and in the whole gate. Its control, a scratch edit taking
  `version()` out of the paint's context (restored and compared byte for byte): red at *"a read landed since the last
  paint: the next one repaints the whole page"*, received `false`.
- **The comment pin, corrected.** With the panel's ◀ added, the ringed section sits on controls/2 rather than controls/3
  when the pin runs, and the pin reported *"root 40 (cy)"* lost. The comment was there: the canvas draws controls/2's
  opening comment without the blank line its file has (executed — 1016 characters drawn against the file's 1017, a
  `\n\n` drawn as `\n`), and the pin compared characters. It now compares words, whitespace folded on both sides. Its
  control, re-run: with every part's comment left out of its drawing, it listed every commented root as lost, `root 5
  (cx)` to `root 40 (cy)`.
- **The 5.23a describe on the baseline paint** (`editor.tsx` as at `1a55920d`, swapped in, then restored and compared
  byte for byte): `3 failed, 3 passed` — red at *"`]`: that section alone is new"*, DW-215's *"exactly the re-rolled
  sections are new"* and the read-lands stop's own control, *"nothing landed: ⌥↓ keeps every root and moves one"*. The
  whole-page stops pass there, as a full repaint must.
- **The pointer-only doors, executed once.** A scratch Playwright probe (not committed, and not a gate — the journey takes
  no pointer) on the harness's long Home at 1440 × 900, read by the journey's expando method: `0 FAIL, 3 PASS`. The pill's
  Shuffle (1 of 3 → 2 of 3) replaced root 4 alone; a Layers-row grip drag and a pill-grip drag each kept every root and
  moved one. Its control, the same probe on the baseline paint: `3 FAIL, 0 PASS`, every root new each time.
- **The trace after, re-run:** `--rate 4 --runs 3`, exit 1 — 8.9%, 7.2% and 9.4% of vsyncs dropped, longest tasks 76, 69
  and 69 ms, every control seen; `--rate 1 --runs 1`, exit 0 — `PASS`, 0.6% dropped, no long task. The figures above
  reproduce. **Its refusal, executed** (standing rule 2): a copy with the control's busy task cut to 20 ms, under a long
  task's 50, printed `run 1: REFUSED — the control was not seen — an 20 ms task read as a 0 ms long task and 0 dropped
  vsyncs` and exited 1. The copy was deleted.

**The kept hover (Spec Change Log 6; 2026-09-28, the same computer, each probe a scratch Playwright script on the harness
at 1440 × 900 with a REAL pointer, three runs per build, `editor.tsx` swapped in and restored byte for byte):**

- **The mechanism.** The pointer resting on Home's first section while the selected ringed section changes design by `]`:
  the baseline paint (`1a55920d`) showed that section hovered and its pill drawn afterwards in 3 of 3 runs; the keyed
  paint as pushed (`a4d96c37`), in 0 of 3 (`hovered -1, pill 0`); with the fix, 3 of 3.
- **The walk's own sequence**, replayed on the long Home so that a kept section sits above the grid as production's Latest
  Post does (hover and select Three Up, type-select *spring*, open the link panel, Esc Esc, the pointer back where Three Up
  was, a Layers row's ⋯ opened by keyboard): the pushed paint failed 3 of 3 (`hovered -1 · pill 0`); the baseline and the
  fix passed 3 of 3 (`hovered 4 · pill 1 · open popovers 1`). On the default Home, whose Three Up has no section above it,
  all three builds pass — which is why the gate never saw it.
- **The hover still follows the pointer.** With the fix, the hovered section itself moved by ⌥↓, the last section climbed
  to the top by ⌥↑ one place at a time, and the third section moved above the hovered one: in every run the hovered
  section was the one under the pointer (`elementFromPoint`).
- **The gate.** A new 5.23a stop points at a section (a synthesized `pointerover`, R-175's precedent) and presses `]` on
  the ringed one below it: the pointed section keeps its hover and its pill; pointed at the ringed section itself, `[`
  lets the hover go. Its control, the pushed paint: red at *"the pointed section was kept, and so is its hover"* —
  expected 39, received -1.
- **The gates on the fixed tree.** `tsc --noEmit -p .`: exit 0. `pnpm check`: exit 0, every package's tests 0 failed,
  `check-snapshots: PASS`. `pnpm keyboard`: `107 passed (4.0m)`, 0 failed. The pointer-only doors' probe: `0 FAIL, 3 PASS`.
  The trace: `--rate 4 --runs 3` 8.9%, 7.8% and 8.9% dropped, longest tasks 74, 70 and 70 ms, every control seen;
  `--rate 1 --runs 1` `PASS`, 0.0% dropped, no long task.

**Real infrastructure (R-82)** — what this Dev phase hit and what each returned, keys by variable name only:

- **Before the push.** GitHub Actions (`GITHUB_TOKEN`): CI run 36334607544 at `42b549f7` — `check`, `rls` and `deploy`
  success; Render matrix run 36334607539 success. Vercel (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): production
  is `dpl_5wq5VCQZ5wtV9ytkz97MEMaKv76A`, READY at `42b549f7` — the paint as it stood before this story.
- **Not touched and not claimed:** Ghost T1 and T3, Resend and Dodo. This story calls no Ghost API — the keyboard gate's
  read that lands is answered from the bundled sample by the journey itself — sends no email and bills nothing.
- **The Dev push, `a4d96c37`: CI red on DW-132, nothing published.** GitHub Actions (`GITHUB_TOKEN`): CI run 36341672890
  — `rls` success, `check` failure at `python3 tools/doc-audit.py --check` (`STALE — regenerated INDEX.md and
  INDEX.html`, `STALE: BUILD-BOARD.html`, `STALE: CATEGORY-PROMPTS.html`), `deploy` skipped; the keyboard gate, `pnpm
  check` and `pnpm build` never ran on the runner. Render matrix run 36341672896: success. Vercel (`VERCEL_*`): production
  still `dpl_5wq5VCQZ5wtV9ytkz97MEMaKv76A` at `42b549f7`. It was the day's first commit, and regenerated here the three
  pages differ from it by `2026-09-27 → 2026-09-28` alone — DW-132, whose row now carries this sighting. The next push
  publishes.
- **The publishing push, `10c30db4`.** GitHub Actions (`GITHUB_TOKEN`): CI run 36341840489 — `check` success (the doc
  gate, `pnpm keyboard` printing `106 passed (5.1m)` on the runner, `pnpm check`, `pnpm build`), `rls` success, `deploy`
  success; Render matrix run 36341840520: success. Vercel (`VERCEL_*`): `dpl_4X3Cs9SayUhNJ4kUFLkbyVXUJ3AZ` READY,
  production, built from `10c30db4`.
- **The deployed walk at `10c30db4`** — `run-verify-editor.cjs` against `https://app.inflozo.com`, Supabase through
  `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (two throwaway accounts through the Auth Admin API, the seed, step 60's plant
  and restore through PostgREST):
  - **Run 1: a HARNESS ERROR, not a result.** `GET /harness/editor` (step 79, `:5856`) did not answer in 30 s, after
    **0 FAIL, 579 PASS** — curl had the three harness addresses answer 404 in 0.24–0.29 s straight after. Every step-60
    check passed on production's planted 40-section Home: ⌥↓ kept all 41 roots and moved one
    (`["=","=",3,2,"=",…]`), its longest task 0 ms; a word typed into the planted heading landed and was taken back
    (*"… this spring Summer"* → *"… this spring"*); the paint ending that session drew section 3 fresh and kept every
    other root; `P` `P` equalled the canvas node for node (`{"equal":true,"fresh":true}`); the plant was removed (HTTP 200).
    Accounts deleted, HTTP 200, users 13 → 13.
  - **Run 2: 1 FAIL, then a HARNESS ERROR.** The FAIL is step 8's pill — Spec Change Log 6, fixed. Step 60's 5.23a checks
    passed again with the same readings. The walk then died at its last step, step 9's raw `GET /projects/<id>` (`:6661`), after 662 PASS.
    Accounts deleted, HTTP 200, users 13 → 13. Both deaths are DW-204's, whose row carries them.
- **The kept-hover push, `0ea616db`.** GitHub Actions (`GITHUB_TOKEN`): CI run 36345381507 — `check` (the runner's
  `pnpm keyboard` printing `107 passed (4.9m)`), `rls` and `deploy` success; Render matrix run 36345381473: success.
  Vercel (`VERCEL_*`): `dpl_3XMFAQ6HfMeCyLyJYXqza1givXEc` READY, production, built from `0ea616db`.
  - **Walk run 3 at `0ea616db`: 3 FAIL, then a HARNESS ERROR — and the FAILs were this story's own step.** Step 60's
    5.23a checks passed again with the same readings. Then step 66's ⌘S went `["Syncing","Saved on this device"]`, the
    revision stayed at 10 and the stored Home held 40 instances; the walk died at step 66b on the *"This project was
    changed somewhere else"* dialog over the Undo button. Step 61 had read revision 10 in all three runs, and runs 1 and 2
    moved it to 11 at step 66 with the edited doc: the step-60 page's departing flush — owed only since step 60 types —
    had landed before `freshLoad`'s restore there, and after step 61's hydrate here. Fixed in the walk (Spec Change Log
    7). Accounts deleted, HTTP 200, users 13 → 13.
- **After the walk's fix is pushed:** its CI run, its deployment and a complete walk are recorded by the Dev commit that
  follows.

**Manual checks (R-82, after CI publishes):**

- The GitHub Actions run for HEAD (`check`, `rls`, `deploy`) green and the Vercel deployment READY at HEAD, read with
  `GITHUB_TOKEN` and `VERCEL_*` from `tools/probe/.env`.
- `run-verify-editor.cjs` against `https://app.inflozo.com`: step 60's new checks pass on production's planted 40-section
  Home, the run prints 0 FAIL, its throwaway accounts are deleted and the user count is unchanged. Supabase is hit through
  the walk's service key (the plant, the restore, the accounts); Ghost T1/T3, Resend and Dodo are not touched.

## Questions for the owner

### Question 1 — The canvas fix works, but the editor still stutters a little on the slowed-down computer. Where should the last piece of speed work go?

We tried R-206's fix on a copy of the editor with a 40-section home page, with the computer slowed four times. A design
change used to freeze the editor for about half a second (0.49 s); with the fix, redrawing the page takes about a
hundredth of a second (0.009 s). Moving a section: the same. But the full 3-second test still misses its bar: 7 to 9 frames in every
100 are skipped (the limit is 5), and a few moments stall for 0.05 to 0.09 s (the limit is 0.05 s). Today, without the
fix, the same test skips 32 frames in every 100. The cause is no longer the page: after every change the editor also
redraws its side panels in full — the 41-row Layers list, the settings panel, the outlines.

**An example.** On a long home page you press Shuffle on one section. Today the whole editor freezes for half a second
on the slowed computer. With the fix, the new design appears at once and the panels catch up with a hitch of under a
tenth of a second — about two hundredths of a second at your computer's normal speed.

1. **(RECOMMENDED) Split it.** This story ships the canvas fix, proves it, and records the 3-second test as it stands. A
   new Story 5.23b, straight after, makes the panels redraw only what changed and carries the 60 fps pass. Epic 5 closes
   when 5.23b's test passes. Each story stays one job, the half-second freezes go sooner, and 5.23b is planned from its own
   measurement.
2. **One story.** This story does the canvas and the panels, and is done only when the whole test passes. Bigger and
   riskier — the panel work reaches most of the editor's code — and its size is not known until it is measured.
3. **Canvas only, and move the rest to Story 15.4**, the launch performance check. Epic 5 closes on this story alone,
   with the test recorded as it stands. You declined moving the speed work to 15.4 once (R-206, option 3).

**Ruled: option 1 (owner, 2026-09-27).** *"Split it. This story ships the canvas fix, proves it, and records the
3-second test as it stands. A new Story 5.23b, straight after, makes the panels redraw only what changed and carries the
60 fps pass. Epic 5 closes when 5.23b's test passes. Each story stays one job, the half-second freezes go sooner, and
5.23b is planned from its own measurement."* Recorded as **R-208**. This story is renamed *The canvas redraws only what
changed* (its spec file and sprint-status key with it); Story 5.23b, *The editor's panels redraw only what changed, at 60
fps*, joins `epics.md` and `sprint-status.yaml` straight after it, carrying the 60 fps criterion; the PRD's Epic 5 exit,
the register (R-206 and R-207 noted), `epic-5-context.md` and `run-verify-editor.cjs`'s notes follow; and Story 5.24 runs
after 5.23b, since nothing may come between 5.23a and 5.23b.
