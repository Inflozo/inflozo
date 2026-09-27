---
title: 'Story 5.23a — The editor redraws only what changed, at 60 fps'
type: 'feature'
created: '2026-09-27'
status: 'ready-for-dev'
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
full 60-frames-a-second test just short of its bar — where that last piece of work goes is your Question 1.

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
- **The 3-second trace is a manual script** (NFR-1), run on this computer at 4× and recorded. The planning prototype
  says the canvas alone does not clear the bar — the side panels redraw in full on every change (7.4–8.9% of frames
  dropped against 5%). Where that work goes is **Question 1**; this spec is written to its recommended option: the pass
  moves to a new Story 5.23b and this story records the result. Ruled option 2, the panel work joins this story and it is
  re-planned before Dev; ruled option 3, the pass goes to Story 15.4 and this spec stands.

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
- Never memoize or restructure the editor's panels, Layers or chrome here — that is Question 1's work.
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
  reloads, measures FR-D14's lockup bound; its note names Story 5.23a.
- `tools/doc-audit.py` — catalogue rows: `run-verify-editor.cjs` :562, `journey.spec.mjs` :1026; a new file under `tools/`
  needs its own row.
- `_bmad-output/implementation-artifacts/deferred-work.md:5191` — DW-215.

**Not this story's (Question 1), recorded for whichever story takes it:** the chrome `useLayoutEffect` at :3299-3327
re-runs on every render and restarts its rAF loop; `lib/canvas-layer.ts`'s `place()` and the section pill's own loop
(`components/controls/section-pill.tsx:129-163`) read geometry every frame; `EditorShell`'s render body; Layers' rows.

## Tasks & Acceptance

**Execution:**

- [ ] `apps/web/lib/live-client.ts` -- `LiveStore` gains `version()`: the number of answers written to the cache --
  a read that lands, a background one included, changes the render context.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- `paint()` becomes Design Notes' walk: a
  record per section by `queryKey` (its signature, every top-level node, its root, its stamps) and the context it was
  drawn under; reuse, render-and-parse alone (`Range.createContextualFragment` over `#canvas`), remove what no kept
  record owns, insert in stack order; `roots` and `stamps` from the records. The Paywall keeps `paywallPage` and no
  records. Records dropped by `blank`, the edit-that-needs-a-read branch, `restampAll`, `startEditing` and `onChange`'s
  stamp. The file header's paint paragraph says so -- R-206's "a design change replaces one section, a move moves one".
- [ ] `apps/web/app/(app)/app/harness/editor/layout.tsx` -- `x-inflozo-harness-home: <n>` builds Home as n instances
  cycling today's Home designs, the main feed flagged on the first alone; the header comment says so -- the 40-section
  fixture with no database, the default fixture untouched (DW-215's own reason).
- [ ] `tools/keyboard/journey.spec.mjs` -- a `describe` on the 40-section Home (roots tagged with an expando before each
  gesture): `]`/`[` replace one root; ⌥↓ moves one; Space, ⌘D, Del and their ⌘Z touch only their section; a control
  changed in place, then another section's ⌥↓, leaves the changed section's root new, and `.` then an edit leaves every
  root new; after them all, `P` `P` and `isEqualNode` against a `cloneNode(true)` taken before; DW-215's Remix and one ⌘Z
  against its pre-Remix snapshot. Run the identity stops once on the baseline paint and record them failing -- the
  mechanism's gate, on every commit.
- [ ] `tools/perf/fps-trace.mjs` (new) -- the manual NFR-1 trace in Design Notes: builds and starts the production
  harness, warms it, traces 3 s at `--rate` (default 4) for `--runs` (default 3), prints and exits 0/1, restores
  `apps/web/next-env.d.ts` and stops its own server -- NFR-1's gate, never CI's.
- [ ] `tools/probe/run-verify-editor.cjs` -- step 60, on the planted 40-section Home: ⌥↓ keeps every root and moves one;
  a canvas typing round trip (a word typed into a planted heading, then taken back) and `P` `P`, then `isEqualNode`; the
  longest task noted; step 60's note names Question 1's owner -- R-82 on production, where the canvas typing path lives.
- [ ] `tools/doc-audit.py` -- a row for `tools/perf/fps-trace.mjs`; the journey's and the walk's rows name 5.23a's
  additions -- the gate walks every file under `tools/`.
- [ ] `_bmad-output/implementation-artifacts/deferred-work.md`, `.../reconcile-designs-decisions.md` -- DW-215 closed with
  its journey stop; R-206's "⬜ built — Story 5.23a" ticked with what was built and measured -- standing rule 3.

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
  seen, and the results before and after this story are recorded under Verification — the pass belongs to Question 1's
  owner (as recommended, Story 5.23b).
- Given the change, when the gates run, then `pnpm check`, `pnpm keyboard` and the doc gate are green, CI publishes, and
  no migration exists.

## Spec Change Log

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
  session — which mounts the pill and the chrome layers — is one 193 ms long task. That is Question 1.

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

**Ruled:** _(awaiting the owner)_
