---
title: 'Story 5.9 — The keyboard map, and keyboard completeness'
type: 'feature'
created: '2026-09-19'
status: 'done'
owner_test: passed
review_loop_iteration: 1
baseline_commit: '467aec611605b59371a7fff23471561a2d8f0d8e'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

After this story you can **drive the editor without touching the mouse**. One key each does the
things you do all day — `L` hides and shows the Layers list, `.` flips the canvas between light and
dark, `1` `2` `3` switch between desktop, tablet and phone, `⌘D` duplicates the selected section,
`Del` removes it, and `Esc` steps back out of whatever you are in — and **`?` opens a card that
lists every key**, so you never have to remember them.

Two quieter things come with it. **Tab now works properly**: the very first Tab shows a "Skip the
canvas" button over the top bar, and tabbing moves Layers → the canvas → the settings panel in one
step each, instead of walking you through every link on the page you are designing. And **typing is
safe**: while your cursor is in any text — a headline on the canvas, a field in the panel — the
single-letter keys do nothing at all, so writing the word "dark" never flips your canvas to dark.

Five keys in the plan are **not** here, because what they do has not been built yet: `⌘K` (add a
section), `[` `]` (flip through designs), `⇧R` (Site Remix), `P` (Preview Mode) and `⌘⏎` (Ship it).
Each arrives with its own story — that is Question 1 below.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The editor answers to three keys and no more — `⌘Z`, `⇧⌘Z` and `⌘S`, built beside the
undo arrows at Story 5.8 under R-141, which held every single-key binding back for this story
"because only it carries the focus condition". Everything else needs a pointer. The canvas is not a
tab stop at all (`editor.tsx:1508` carries `aria-label="Canvas"` and no `tabIndex`), so Tab walks
straight into the iframe and through every link the customer's own site emits; D8c's skip link is
not built; `Esc` deselects but moves no focus, so its ladder has one rung of three; and the account
menu's **Keyboard shortcuts** row is deliberately absent with the note *"Story 5.9 adds it back with
the shortcuts it lists"* (`account-menu.tsx:43-46`). Four rows of `EXPERIENCE.md` § Accessibility
Floor name one verifier — the NFR-6(d) keyboard journey — and it does not exist; DW-167 has been
deferred four times waiting for it.

**Approach:** One pure table names **every** binding in FR-D11's map, each row carrying the story
that lands it, so the handler and the `?` sheet are two readers of one list and neither can
advertise a key that does nothing. One guard decides whether a single-key press is live — the shell
holds focus, no caret in a field or a `contenteditable`, no dialog or popover open — and `⌘`-modified
presses skip it, exactly as 5.8 already has it. The canvas becomes **one** tab stop by taking the
iframe out of the sequential order (`tabindex="-1"`, executed below), which is what UX-DR9 asks for
and what the skip link alone cannot give. And the journey that proves all of it runs in a real
browser: in `pnpm check` against a harness mount of the real editor, and again on the deployed site
at Review (R-82).

## Boundaries & Constraints

**Always:**
- **Every single-character shortcut is live only while the editor shell holds focus, and never while
  a text field or a `contenteditable` has it** (UX-DR11, WCAG 2.1.4 — a Level A rule inside the AA
  threshold). `⌘`-modified shortcuts are unaffected. axe-core cannot see this; the keyboard journey
  is its only verifier.
- **One table, two readers.** The map is data in one module. The key handler and the `?` sheet both
  derive from it; a row that names a story not yet landed is neither bound nor listed (standing rule
  4 — the list is derived, never written twice).
- **One handler per action, never a second implementation.** `L` calls the fold the Collapse button
  calls, `.` calls `flip`, `1` `2` `3` call `pickDevice`, `⌘D`/`Del` call `onDuplicate`/`onRemove` —
  the same functions the pill and the `⋯` menu call, so a key and its button cannot drift (R-141's
  rule, already proved by `⌘Z`).
- **The canvas is ONE tab stop, between Layers and the Controls sidebar, and focus lands on the
  container and not inside the rendered site** (UX-DR9). The `Esc` ladder is three rungs and each
  announces where it landed: inline editing → editing ends, the section stays selected (Story 5.3,
  already built) · a selection → deselected, focus rests on the canvas container · the container →
  focus leaves the canvas for the chrome.
- **`Del` and `⌘D` act on the SELECTION, never on the hover**, and obey the rules their buttons obey:
  a site-wide section has no Duplicate (FR-D5) and its Delete asks first through the one confirm.
- **Every drag surface has a keyboard equivalent** — the Layers row / pill grip and the item list's
  Move handle both answer `⌥↑`/`⌥↓` today; the journey asserts it rather than assuming it.
- **`⌘Z`, `⇧⌘Z` and `⌘S` already work and are found passing** (R-141). This story is narrowed, not
  relieved: it builds and tests the map as one journey.
- **R-98 on every new pressable control** — the skip link and the sheet's controls; `busy.test.ts`
  walks the tree.
- **The harness mounts the REAL editor.** Its props are `EditorData`, built from the same helpers
  `read.ts` uses, so drift between the two mounts is a type error (the precedent is `/pilots`, which
  has mounted the real `Sidebar` since Story 4.5).

**Ask First:**
- Any **new** global binding beyond FR-D11's map. `?` is asked as Question 3 for exactly this reason.
- Any change to what a key DOES, as opposed to which key does it. The map is the PRD's (FR-D11) and
  the actions are their own stories'.
- Remapping or a preference screen. WCAG 2.1.4 offers three remedies and this product took the
  third (active-on-focus); the other two are not built.

**Never:**
- **No shortcut for a state added after the map** (FR-D11, in so many words): the paginated preview,
  the preview subject, the auto-generated marker and the member-state toggle are set-and-forget
  context, not per-edit actions.
- **No key that does nothing.** A binding whose action has not been built is absent — not bound, not
  listed in the sheet, never greyed and never captioned (UX-DR3, R-118).
- **No second keyboard implementation anywhere.** `⌥F10`, the toolbar's `←`/`→` and its `Esc` are
  Story 5.3's (`lib/inline.ts:251-255`, `mark-toolbar.tsx:87-98`); Layers' and the item list's
  `⌥`-arrows are 5.4's and 4.5's. This story tests them; it does not rebuild them.
- **No `inert` on the iframe.** It would take the pointer with it and the canvas would stop being
  editable. `tabindex="-1"` removes the embedded document from the tab order and nothing else.
- **No change to the canvas emitter, the runtime or any design.** Keys are editor chrome.
- **No mock of Supabase, Ghost, Dodo or Resend anywhere in the harness.** It mounts a component with
  fixture props; anything that needs a server is the deployed walk's (R-82).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| A single-key press, shell focused | `L`, focus anywhere in the chrome or on the canvas container | the Layers panel folds; focus moves to the rail's Show button (`useFold`) | N/A |
| The same key in a panel field | `.` typed into the panel's rich Text Area | a full stop is typed; the mode does **not** flip | N/A |
| The same key in a canvas `contenteditable` | `1` typed into a headline being edited | the digit is typed; the device does **not** change | N/A |
| The same key with a menu or dialog open | `.` with a Layers `⋯` menu open | the menu owns the key; nothing flips | N/A |
| A `⌘`-modified press in a field | `⌘S` while typing | saves, as Story 5.8 already has it | N/A |
| `.` on a Light-only project | `projects.dark_enabled = false` | nothing happens and nothing is announced — there is no sun to press (R-135) | N/A |
| `⌘D` with a page section selected | any canvas-owned section | duplicated below it, announced politely | N/A |
| `⌘D` with a site-wide section selected | the shared header | nothing happens (FR-D5 — one shared instance, no Duplicate on its row or its pill) | N/A |
| `Del` with a page section selected | — | removed, announced | N/A |
| `Del` with a site-wide section selected | — | the one confirm opens, focus on Cancel (R-115) | Cancel leaves the doc untouched |
| `Del` / `⌘D` with nothing selected | no selection | nothing happens, nothing announced | N/A |
| `Esc`, rung 1 | caret in a text prop | editing ends, the section stays selected (5.3) | N/A |
| `Esc`, rung 2 | a section selected, not editing | deselected; focus rests on the canvas container; announced | N/A |
| `Esc`, rung 3 | focus on the canvas container, nothing selected | focus leaves the canvas for the chrome; announced | N/A |
| `Esc` with a dialog or popover open | the reset confirm, a `⋯` menu, a picker | it closes and the selection is untouched (today's guard) | N/A |
| First `Tab` on the editor | page loaded, nothing focused | **"Skip the canvas"** (D8c) is the first stop — invisible at rest, shown in the corrected 2px ring while focused | N/A |
| `Tab` through the shell | from the top bar | Layers → **the canvas container, one stop** → the Controls sidebar; no link inside the rendered site is a stop | N/A |
| The skip link pressed | focused | focus moves to the Controls sidebar's first control (the rail's Show button when it is folded) | N/A |
| `?` | shell focused | the shortcuts sheet opens, focus moves in; `Esc` closes it and returns focus to where it was | N/A |
| A deferred key | `⌘K` · `[` · `]` · `P` · `⇧R` · `⌘⏎` | nothing happens, nothing announced, and the sheet does not list it | N/A |
| `⌥↑` / `⌥↓` on a focused Layers row or item row | (built at 5.4 / 4.5) | the section or item moves, announced in `moveSection`'s own words | N/A |
| `⌥F10` with a live text selection | (built at 5.3) | focus moves into the mark toolbar; `←`/`→` move between marks; `Esc` restores the exact selection | N/A |

</frozen-after-approval>

## Code Map

**The frames, read**
- `D8 Editor Below 1440.dc.html:311-345` — **D8c · SKIP LINK**, the frame this story's one new
  editor affordance is built from. Two states: *at rest, not rendered* (`:324`, drawn dashed at 45%
  only to place it) and *on the first Tab* (`:338`) — a pill at `left:10px; top:9px`, 30px high,
  `0 13px` padding, 12px radius, `#FFFFFF` on the bar, 1px `#E7E2DB`, `sm` shadow, 12.5px/600
  `#1C1B1A`, the words **"Skip the canvas"**, and the corrected focus ring: `0 0 0 2px #C2381F`
  (`:340`, A7 item 7 — 7.9:1 on paper). Its note at `:344` is the reason the affordance exists.
  **The drawn `href="#d8-canvas"` points AT the canvas because the frame is a mock of a bar with no
  sidebar beside it; the link skips PAST the canvas** (`EXPERIENCE.md:444-449`).
- `S3 Dashboard.dc.html:362` — the account menu's **Keyboard shortcuts** row: the Tabler keyboard
  glyph at 15px, the words, and a mono **`?`** chip at `ml-auto` (11px, 1px `#E7E2DB`, 5px radius,
  `1px 5px`). It is the row Story 1.5 left out for this story.
- `Editor Sidebar Kit.dc.html:274-280` — **shortcut rows**, the sheet's body drawn as a Kit part:
  a row per binding, the action at 12.5px/500 on the left and its keys as mono chips on the right
  (11px, `#6E6A64`, 1px `#E7E2DB`, 5px radius, `1px 6px`, white), `8px 0` padding, a hairline
  between and none under the last. Its three sample rows are `[` `]` · `⌘D` · `⌘⏎`.
- **The sheet itself has no frame** and is extrapolated from the two that do (R-74): the app's one
  dialog vocabulary (`kit/dialog.ts` — a 460px sheet, the display title, `openOnCancel`) wrapped
  around the Kit's rows above. `reconcile-designs-decisions.md` records the gap the same way R-133's
  two surfaces were recorded.
- `D8 Editor Below 1440.dc.html:380-400` — D8e's fourth Layers state (the ring **on the row**) is
  already built at 5.4; read here only so the journey asserts the built state rather than a new one.

**The normative text**
- `prd.md` FR-D11 — the map. `EXPERIENCE.md:376-396` prints it as the table and states
  **"they are the complete set"**; `:398-410` is R-141's when-a-binding-is-built rule; `:500-506` is
  the 2.1.4 paragraph and its speech-input example; `:440-470` is §7.3's focus model in three parts;
  `:472-490` is the keyboard-completeness table (Layers, item list, picker, design picker, assets,
  every menu) and **"a drag that has no keyboard equivalent is a defect"**; `:566-572` is the
  verified-by table whose four keyboard rows name NFR-6(d) and nothing else.
- `prd.md:488` — **NFR-6(d)**: "Playwright against the running stack (pre-launch: production)"
  covering the journeys "**and one keyboard-only journey … run with no pointer events, verifying the
  keyboard rows of `EXPERIENCE.md` § Accessibility Floor**" (F-097, 2026-09-03).
- `epics.md:1795-1828` — this story, including the two clauses that set its shape: the journey is
  "the editor's first browser test in `pnpm check`", and it "walks the settings panel's reset wiring
  … which only the deployed harness holds today (DW-167)".

**What exists and is extended, never rebuilt**
- `apps/web/lib/journal.ts:265-300` — **`shortcutFor` and `holdsCaret`**, Story 5.8's three keys and
  their guard. Its own comment names the eight keys that "stay Story 5.9's entire". Both move to the
  new map module; `journal.ts` keeps the journal (standing rule 7: grep for both names after).
- `apps/web/app/…/(editor)/editor.tsx:877-890` — **`onShortcut`**, the one handler, already bound on
  BOTH documents (`:1014-1016` the canvas document, `:1041-1043` the window) because the caret is
  usually in the other one. The new keys join it; the binding sites do not change.
- `:892-898` — **`onEscape`**, today one rung: it refuses inside a field or an open popover/dialog
  (`escDeselects`) and calls `choose(null)`. Rungs 2 and 3 are the focus moves it does not make.
- `apps/web/lib/selection.ts:34-42` — **`escDeselects`**, the ancestor walk (field · select ·
  `contenteditable` · open `<dialog>` · `:popover-open`). It is nine tenths of the single-key gate;
  the gate is it plus `editing.current` and the document-wide `querySelector` `onEscape` already does.
- `:170-183` — **`useFold`**, and it already moves focus to the toggle that replaced the pressed one,
  which is what makes `L` correct with no focus code of its own. `:186-203` — `Rail`.
- `:1508-1522` — the canvas **`<section aria-label="Canvas">`**: R-123's ground, the centring, no
  `tabIndex`. `:1543-1553` — the **iframe** that gets `tabIndex={-1}`.
- `:622-641` — `flip` and `pickDevice`, each already announcing through `setSaid`; `:329` — `said`;
  `:1672` — `<p id="editor-said" aria-live="polite" class="sr-only">`.
- `:1300-1320` — `onDuplicate` / `onRemove` / `askFirst`, and `:1603` `canDuplicate={pointed?.doc
  !== SITE.key}` — the site-wide rule `⌘D` must obey.
- `apps/web/lib/inline.ts:251-255` — **`⌥F10` already exists** (Story 5.3), and `:255-262` is the
  `Esc` that ends editing with `preventDefault` so the shell's listeners leave the selection alone —
  rung 1, built. `apps/web/components/controls/mark-toolbar.tsx:87-98` — the toolbar's `←`/`→`
  roving tabindex and its `Esc`.
- `apps/web/components/controls/layers.tsx:205` · `item-list.tsx:136` — the two `⌥`-arrow moves.
- `apps/web/components/shell/account-menu.tsx:43-46` — the note that hands this story the row:
  *"KEYBOARD SHORTCUTS IS ABSENT, and the frame draws it … Story 5.9 adds it back with the shortcuts
  it lists."* `lib/menu.ts` (`item`, `anchorTo`) is the row vocabulary; the platform's `popover="auto"`
  gives light dismiss, `Esc` and the return of focus.
- `apps/web/components/kit/dialog.ts` — `sheet`, `sheetBox`, `title`, `openOnCancel`; `kit/icons.tsx`
  (gains the S3 keyboard glyph, emitted from `packages/library/icons/tabler.json`, R-130's rule).
- `apps/web/components/shell/shell.tsx:295-297` — **the editor has no shell chrome and therefore no
  account menu**, which is why `?` is the only door to the sheet from inside the editor (Question 3).

**The harness, and what makes it possible**
- `apps/web/proxy.ts:27-30` — `refreshSession` **returns early when `SUPABASE_URL` is unset**, and
  `lib/supabase/server.ts:25-30` throws only when a client is actually built. **Executed 2026-09-19:**
  `next dev` with no Supabase environment is ready in 307 ms, the marketing page answers **200**, and
  every `(authed)` page answers 500 — so a route outside `(authed)` renders with no database at all.
- `apps/web/app/…/(editor)/read.ts` — `EditorData`, and the helpers that build it without a session:
  `lib/pilots` (`pilot`, `pilotRows`, `pilotsCanvasDocument`), `lib/controls-review` (`imagePool`,
  `linkResources`, `referenceSwatches`), `orbitWeekly.site().timezone`.
- `apps/web/app/…/(authed)/canvas/route.ts` — the canvas document and its own `currentUser()` guard
  (route handlers run under no layout). The harness serves the same `pilotsCanvasDocument()` bytes
  from its own path and the editor is told the path, rather than the guard being bypassed.
- `tools/matrix/run-matrix-gate.sh` · `playwright.config.mjs` — the shape to copy for a gate script
  and a runner config, and the proof the repository already owns Playwright: **`@playwright/test`
  1.61.1 is a root devDependency since Story 4.11** and `~/.cache/ms-playwright/chromium-1228` is on
  this machine. **DW-167's "Ask First" named a dependency; the dependency has since arrived.**
- `supabase/tests/run-rls-gate.sh` — the other gate that keys on an exit code and refuses rather than
  reports; `.github/workflows/ci.yml:34-41` — the `check` job, the one `deploy` needs (R-116 fixes
  `needs` at `[check, rls]`, so a gate that must block a deploy belongs **inside** this job).
- `tools/probe/run-verify-editor.cjs` — **70 steps today**; 71 onward are this story's, inside step
  5's CSP session as every Epic 5 story's are. Step 8 is the axe pass that gains the sheet.

**The ledger**
- **DW-167** (low) — this story is its named owner: the settings panel's reset wiring and `/pilots`'
  client wiring are held by the deployed harness only. Its Story 5.7 addendum adds the device wiring.
- **DW-16** (done, Story 3.9) — the precedent this story is weighed against: the same gap for the
  dashboard was closed by a **deployed** probe, not by a browser in CI. Question 2 is that choice.
- **DW-188** (low) — hovering a Layers row does not outline its section; named to 5.9 **or** 5.23,
  "whichever first finds a user cannot tell which section a row is". Keyboard focus on a row is that
  moment for a keyboard-only user: raised, not closed here (it is a product decision, not a patch).

## Tasks & Acceptance

**Execution.** No migration and no schema change, so **no Schema phase** (R-99). **All three questions
are ruled — R-145, R-146 and R-147, option 1 each (owner, 2026-09-19)** — so the task list below is the
whole of it: the eight live keys plus `?`, the five deferred ones absent and named to their stories, and
the journey in `pnpm check` over a harness mount as well as on the deployed editor.

- [x] `apps/web/lib/keymap.ts` -- new, pure and importless-but-for-types so `node --test` reaches it:
      FR-D11's map as one table — every binding, its display chips, whether it is `⌘`-modified or
      single-key, and for a binding not yet live the **story** that lands it; `shortcutFor` and
      `holdsCaret` move here from `lib/journal.ts` and grow to return every live gesture; one
      exported `sheetRows()` derives the sheet -- one list, two readers, and no key that does nothing.
- [x] `apps/web/lib/journal.ts` -- delete the two moved functions and their keyboard comment, leaving
      the journal -- the map is not the journal's business (standing rule 7: grep `shortcutFor` and
      `holdsCaret` repo-wide afterwards).
- [x] `apps/web/keymap.test.ts` -- new: the I/O matrix's key rows as unit tests — each live key to its
      gesture, every single-key gesture null when the caret is in a field, `⌘` gestures unaffected,
      a deferred row bound by nothing and listed by nothing, and the sheet's rows derived from the
      table -- the pure half, on every commit.
- [x] `apps/web/journal.test.ts` -- move the `shortcutFor`/`holdsCaret` tests to `keymap.test.ts`,
      keeping every assertion verbatim -- Story 5.8's proofs survive the move.
- [x] `apps/web/app/…/[id]/(editor)/editor.tsx` -- extend `onShortcut` with the live single-key
      bindings behind the one gate (`L`, `.`, `1` `2` `3`, `?`) and `⌘D` / `Del` on the selection,
      each calling the handler its button calls; give the canvas `<section>` `tabIndex={0}` and the
      iframe `tabIndex={-1}`; render D8c's skip link as the shell's first focusable element; finish
      the `Esc` ladder's rungs 2 and 3 with their announcements -- the whole map, one handler.
- [x] `apps/web/components/editor/shortcuts-sheet.tsx` -- new: the Kit's dialog vocabulary around the
      Kit's shortcut rows, the rows from `sheetRows()`, `Esc` and focus return the platform's
      (`showModal`) -- the sheet, extrapolated from the two frames that exist.
- [x] `apps/web/components/shell/account-menu.tsx` -- add S3's **Keyboard shortcuts** row with its
      glyph and `?` chip, opening the same sheet, and replace the "absent" note with what landed --
      the row Story 1.5 deferred here by name.
- [x] `apps/web/components/kit/icons.tsx` -- add S3's keyboard glyph from `tabler.json` -- R-130's
      rule: an icon is emitted from the set, never drawn here.
- [x] `apps/web/app/(app)/app/harness/editor/page.tsx` · `harness/canvas/route.ts` -- new, both
      refusing with `notFound()` unless `INFLOZO_HARNESS === '1'`: the real `Editor` mounted with
      `EditorData` built from the pilot fixture, and the same `pilotsCanvasDocument()` bytes the
      editor's iframe reads -- a browser can open the editor with no database (executed above).
- [x] `apps/web/app/…/[id]/(editor)/editor.tsx` -- one optional `canvasSrc` prop, defaulting to
      today's `canvasSrc(isApp(pathname))` -- the harness names its own canvas path instead of a
      guard being bypassed in a real route.
- [x] `tools/keyboard/journey.spec.mjs` · `playwright.config.mjs` · `run-keyboard-gate.sh` -- new:
      the keyboard-only journey (no pointer events) over the harness — every stop in the I/O matrix
      above plus the settings panel's reset wiring, its confirm and its `Esc` (DW-167) — booting
      `next dev` on a free port with `INFLOZO_HARNESS=1`, refusing with the install command when no
      browser is present, and restoring `apps/web/next-env.d.ts` on the way out (`next dev` rewrites
      it — executed) -- the gate, shaped like `run-matrix-gate.sh` and `run-rls-gate.sh`.
- [x] `package.json` -- a `keyboard` script beside `matrix`, and the gate is CI's own step in the
      `check` job rather than a line inside `pnpm check` -- `deploy` needs `check`, which is all R-116
      asks; see the Design Note below for why it may NOT live inside `pnpm check`.
- [x] `.github/workflows/ci.yml` -- install Chromium for the `check` job, then run `pnpm keyboard`
      before `pnpm check` -- the two steps that make the gate real in CI; nothing else about the job
      changes.
- [x] `tools/doc-audit.py` -- catalogue rows for the three new `tools/keyboard/` files, then
      `--generate` -- a new file under `tools/` without a row blocks the commit.
- [x] `tools/probe/run-verify-editor.cjs` -- steps 71 onward inside step 5's CSP session: the same
      journey on the **deployed** editor with a real session (R-82, NFR-6(d)), the sheet measured
      against the Kit's rows, `/harness/editor` asserted **404** in production, and step 8's axe run
      once more with the sheet open -- the truth, on the real stack.
- [x] `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` · `epics.md` ·
      `reconcile-designs-decisions.md` -- R-145, R-146 and R-147 recorded, and each deferred key made a
      criterion of the story that lands it (5.10, 5.11, 5.12, 5.15, 7.18) -- done at Create, the moment
      the owner ruled; propagate, never localise (standing rule 3).
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- close DW-167 with its resolution;
      raise the keyboard-focus half of DW-188 if the journey finds it -- the ledger is the record.

### Review Findings

Review of 2026-09-19 — five layers over `467aec61..a9aa4b21`. Every patch below is applied and ticked.

- [x] [Review][Decision] **(ruled: R-148) `Backspace` deletes the selected section, and nobody was asked.** FR-D11 names `Del`; the map also binds `Backspace`, because a Mac keyboard's "delete" key reports `Backspace`. This spec's own Ask First lists "any new global binding beyond FR-D11's map" — `?` was asked for that reason and this was not. Question 4 below.
- [x] [Review][Decision] **HIGH — (ruled: R-149) the accessibility scan is red on the live editor, and this story made it so.** The first complete deployed walk (on `27a638fa`) has axe-core failing all of step 8 with `frame-focusable-content`: the canvas iframe carries `tabIndex={-1}` — which is how this story makes the canvas ONE tab stop (UX-DR9) — and axe refuses any frame with that attribute whose document holds a focusable element, whatever that element's own tabindex. UX-DR9 as built and NFR-5's zero cannot both stand. Dev recorded that axe run as "not yet executed". Question 5 below.
- [x] [Review][Patch] **MEDIUM — the deployed walk could never pass as written.** Steps 74 and 78 asserted the polite region `=== ''`, and the editor never empties it, so both failed on every run that reached them (the Real-infra verifier's fourth run: 2 FAIL, 367 PASS; the product facts inside both held). They compare before and after, as the harness journey's own stop already did [tools/probe/run-verify-editor.cjs]
- [x] [Review][Patch] **MEDIUM — the journey's "no pointer" control did not read the helpers it said it read**: `lastIndexOf` found the needle on the control's own line, so `open`, `caretIntoCanvas`, `openEveryGroup`, `openGroup` and `select` were never scanned. `indexOf`; the control still passes with the helpers in [tools/keyboard/journey.spec.mjs]
- [x] [Review][Patch] **MEDIUM — a letter typed at a focused `<select>` folded Layers or flipped the canvas** instead of jumping to the option, and `1` `2` `3` or Backspace in a date field changed the device or deleted the section. A `<select>` keeps its single keys; the date and time kinds count as holding a caret [editor.tsx `onShortcut` · lib/keymap.ts `TEXTUAL`]
- [x] [Review][Patch] A HELD key repeated: ⌘D stacked a copy per tick, `L` and `.` strobed. A held key is one press; ⌘Z and ⇧⌘Z still repeat [editor.tsx `onShortcut`]
- [x] [Review][Patch] `1` `2` `3` and `.` required Shift to be UP, so they were dead on an AZERTY board, where a digit is typed with Shift. Unconstrained, as `?` already was; ⇧1 on QWERTY is `!` and matches nothing [lib/keymap.ts · keymap.test.ts]
- [x] [Review][Patch] Chrome's autofill fires a `keydown` with no `key`, and `shortcutFor` threw on it [lib/keymap.ts · keymap.test.ts]
- [x] [Review][Patch] `.` on a Light-only project was held by a source regex alone — the harness fixture is dark-enabled and no deployed step pressed the key. Step 53 presses it on the real Light-only project [tools/probe/run-verify-editor.cjs]
- [x] [Review][Patch] The harness canvas ROUTE's production guard had no check at all (`HARNESS_ONLY` walks pages) [apps/web/app-routes.test.ts]
- [x] [Review][Patch] AC3 says `⇧⌘Z` is "found already passing" and no stop pressed it. The Del stop now redoes and undoes again [tools/keyboard/journey.spec.mjs]
- [x] [Review][Patch] "Every drag surface" was one: no section in the harness fixture draws an item list (executed — every row selected, every group opened, no handle). The stop is named for what it walks, says where the item list IS walked (`run-verify-controls.cjs`, Story 4.5), and the catalogue and the gate's header no longer say "both" [journey.spec.mjs · tools/doc-audit.py · run-keyboard-gate.sh]
- [x] [Review][Patch] The false premise "the journey runs inside `pnpm check`" was corrected in AC7 and the Design Note and survived in seven other places — propagate, never localise. Question 2's ruled text is a record and is left alone [keymap.test.ts · harness/editor/page.tsx · run-verify-editor.cjs · this spec · deferred-work.md DW-167]
- [x] [Review][Patch] The deployed steps called themselves "the same journey" and omit five of its stops; the comment now names which earlier steps cover three of them and which two are the harness's alone [tools/probe/run-verify-editor.cjs]
- [x] [Review][Patch] The gate leaked its log on an interrupt and its readiness fetch had no timeout; "the five keys" listed six [run-keyboard-gate.sh · keymap.test.ts]
- [x] [Review][Patch] Every navigation in the deployed walk gets ONE retry, after the single-use magic link: the verifier's four runs all died on a 30s `page.goto` while curl had the URL in 0.25s (DW-204, which this story owned and did not touch) [tools/probe/run-verify-editor.cjs]
- [x] [Review][Patch] Step 5's CSP zero counted the Projects page's own recorded violation (DW-201) once step 80 opened that page inside its session; scoped to the editor and the canvas, as steps 14 and 70 are [tools/probe/run-verify-editor.cjs]
- [x] [Review][Defer] The same announcement twice in a row is silent to a screen reader — a second ⌘D on a same-named section, a second rung 2 — because React skips an identical state [editor.tsx `setSaid`] — deferred, pre-existing → DW-205
- [x] [Review][Defer] DW-204 stays open: the retry is a way round it, not its cause — see the ledger.

**Acceptance Criteria:**
- Given the deployed editor, when the skip link takes focus, then it **matches `D8c`** — the pill at
  its drawn place, size, radius, ink and 2px `#C2381F` ring — and is not rendered at rest.
- Given the account menu, when it opens, then the **Keyboard shortcuts** row **matches `S3
  Dashboard.dc.html:362`** and the sheet's rows **match `Editor Sidebar Kit.dc.html:274-280`**.
- Given a keyboard-only session with no pointer events, when the journey runs, then every stop passes
  in `pnpm keyboard` and again on the deployed site, and `⌘Z`, `⇧⌘Z` and `⌘S` are found already passing.
- Given any text field or `contenteditable` in either document, when a single-character shortcut is
  typed into it, then the character is entered and no editor action fires (WCAG 2.1.4).
- Given the shell, when Tab is pressed from the top, then the first stop is the skip link and the
  canvas contributes exactly one stop between Layers and the Controls sidebar.
- Given a key whose action is not built, when it is pressed, then nothing happens, nothing is
  announced, and the sheet does not list it.
- Given `pnpm check`, `pnpm build`, the RLS gate and the documentation gate, when each runs, then all
  are green — and the keyboard gate runs in the `check` job `deploy` needs, so a red journey publishes
  nothing. (Written at Create as "inside `pnpm check`"; that premise was false and the Design Note
  below records what was executed.)

## Design Notes

**The iframe leaves the tab order — executed, not reasoned (2026-09-19).** Chromium 1228 through the
repository's own Playwright, a same-origin iframe holding two links, tabbed from `body`:

```
plain   layers -> canvas -> IFRAME>site-1 -> IFRAME>site-2 -> controls
minus   layers -> canvas -> controls
```

`tabindex="-1"` on the iframe takes **the whole embedded document** out of sequential navigation
while leaving click and programmatic focus alone — so the caret still lands in a headline under the
pointer, and the canvas is the single stop UX-DR9 asks for. `inert` would have taken the pointer with
it. **D8c's skip link is built anyway and its note is honest about the change**: `EXPERIENCE.md:444`
describes it as the fix for "dozens of stops before the sidebar", and with the iframe out of the
order it saves one stop rather than dozens. It stays because it is drawn, approved and the first
thing a keyboard user meets — and because the day a story puts a focusable control **inside** the
canvas, it is the affordance already in place. The keyboard path into a text prop is unchanged and is
the panel: the sidebar is "the second way to do everything" (FR-D1, `EXPERIENCE.md:456`).

**Why the map is a table with a `story` column rather than a list of live keys.** FR-D11 calls its
map the complete set, and five of its thirteen have nothing to press until 5.10, 5.11, 5.12, 5.15 and
7.18. Writing only the live ones down would lose the fact that the others are owed; writing all
thirteen as bindings would ship keys that do nothing. One table that names both, and derives the
bound set and the sheet's rows from it, is the same shape as `lib/editor.ts`'s `CANVASES` +
`CONDITIONAL` — where a canvas that is offered to nobody is refused by the scheme itself.

**Why the journey runs against a harness mount and not `next start` with a real session.** The
editor's page needs a session, a project and `project_templates` rows; CI has no Supabase secrets by
design, and giving it some would put throwaway accounts on the live database on every commit. The
harness is the real `Editor` component with the pilot fixture as props — the same trade `/pilots` has
made since Story 4.5 — and it is typed against `EditorData`, so a prop the editor gains and the
harness does not is a compile error rather than a silent drift. What the harness cannot prove — the
read, the session, the sync route, the CSP — is the deployed walk's, which R-82 requires every story
to run anyway.

**`next dev`, not a build.** Measured 2026-09-19: ready in **307 ms** with no Supabase environment,
and the first page answered in half a second. A production build inside `pnpm check` would cost
minutes and prove nothing more about key handling. **One side effect, found by running it:** `next
dev` rewrites the tracked `apps/web/next-env.d.ts` to point at `.next/dev/types/…` and `next build`
points it back, so the gate must restore the file before it exits or every run of it leaves a
dirty tree and the next commit carries it.

**`pnpm check` is NOT the only place `pnpm check` runs — executed, and it cost a red deploy.** This
spec said the gate should live inside `pnpm check` "which is the only place that gates `deploy`".
`apps/web/vercel.json`'s buildCommand is `node --version && pnpm --version && pnpm -w check && next
build`, so **`vercel build` runs the whole of `pnpm check` a second time**, inside Vercel's own build
image — which has no Chromium, and is not a Debian for `playwright install --with-deps` to serve.
Pushed that way, CI run **35452356017** (2026-09-19) had `check` **green** — Chromium installed, the
journey passed — and `deploy` **red** on the gate's own refusal, so **nothing published**. The
repository already knew this and the spec did not read it: `tools/doc-audit.py`'s row for
`tools/check-catalog.mjs` says in so many words "run by pnpm test and therefore by CI **and the Vercel
build**". Standing rule 1, on a platform claim, for the price of one deploy.

The fix keeps R-146 whole and adds no switch that can rot: the gate is **its own step in CI's `check`
job**, after the Chromium install and before `pnpm check`. `deploy` needs `check`, so a red journey
still publishes nothing — which is the entirety of what the owner ruled. `pnpm keyboard` runs it by
hand. The alternative considered and rejected was an environment variable in `vercel.json` switching
the gate off for that one re-run: it would have kept the letter of the criterion, but a gate with an
off-switch in the tree is a gate that is one careless copy away from off everywhere.

**One task line was written wrong and the ruling it cites is what was built.** The task for
`kit/icons.tsx` says the keyboard glyph is "emitted from `packages/library/icons/tabler.json`,
R-130's rule". That is the rule for a glyph **the export does not draw** — R-92 (owner, 2026-09-05)
scopes Tabler to the sections, and R-130 and R-142 are its two stated exceptions, each for a state
with no frame. `S3 Dashboard.dc.html:362` **does** draw this glyph, so it was read from the export
verbatim, as `kit/icons.tsx`'s own header requires of every glyph the export draws. Nothing is lost
by it: Tabler's own `keyboard` is the same picture, so the two sources agree and the export is the
one with the ruling behind it. No Tabler path entered the file and no licence notice is owed by this
story.

## Verification

**Commands:**
- `pnpm check` -- expected: green; and `pnpm keyboard` -- expected: green, with the journey's stops listed and its own count printed
  (never written down). This is the run that must stay green: it is the `check` job `deploy` needs.
- `bash tools/keyboard/run-keyboard-gate.sh` -- expected: exit 0; with no browser installed, a
  refusal naming `pnpm exec playwright install chromium` rather than a failure.
- `node --test 'apps/web/keymap.test.ts'` -- expected: every map row asserted, the guard both ways.
- `python3 tools/doc-audit.py --check` (twice) -- expected: green; the three `tools/keyboard/` files
  have catalogue rows.
- `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs)
  OUT_DIR=/tmp/kb node tools/probe/run-verify-editor.cjs` -- expected: 0 FAIL across all steps,
  including 71 onward on the deployed editor with a real session; step 5's CSP count still zero
  behind its `EvalError` control; step 8's axe zero with the sheet open; `/harness/editor` 404.
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0 (nothing here touches the database; run
  as the control that it does not).

**Executed at Dev (2026-09-19), on this machine, Node 24.18.1:**

| Command | Result |
|---|---|
| `bash tools/keyboard/run-keyboard-gate.sh` | **exit 0** — every test of `journey.spec.mjs` passed in one worker with no retries, the count printed by the run itself. `apps/web/next-env.d.ts` was clean afterwards (`git status --porcelain` empty), so the restore on the way out works. |
| `pnpm check` | **exit 0** — lint, typecheck and every package test. It is browser-free by design (see the Design Note): the journey is `pnpm keyboard`, its own step in the same `check` job. |
| `pnpm build` | **exit 0** — both harness routes compile as dynamic (`ƒ`), so neither is prerendered into the production output. |
| `node --test --experimental-strip-types keymap.test.ts dark-mode.test.ts app-routes.test.ts journal.test.ts` | **0 fail** — R-141's three moved proofs, this story's map, guard and card tests, the `HARNESS_ONLY` refusal, and `.` carrying the same Light-only condition its button carries (R-135). |
| `python3 tools/doc-audit.py --check`, twice | **PASS (0 warnings)** both times — the three `tools/keyboard/` files have catalogue rows. |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0**, run as the control that this story touches no database. |

**Real services (R-82): none were hit at Dev, and that is the story's shape rather than an omission.**
The harness mounts the real `Editor` with fixture props and runs with **no Supabase environment at
all** — that is precisely what lets NFR-6(d)'s journey run in CI's `check` job. `SUPABASE_URL`,
`SUPABASE_SECRET_KEY`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `RESEND_API_KEY`, `DODO_API_KEY`,
`GHOST6_*` and `GHOST5_*` were neither read nor set by anything above; no key was printed. The
real-stack proof is the **Review** phase's, which R-82 requires and which this story has already
written: `tools/probe/run-verify-editor.cjs` steps 71 onward drive the same journey against the
**deployed** editor with a real session over `SUPABASE_URL` / `SUPABASE_SECRET_KEY`, assert
`/app/harness/editor` and `/app/harness/canvas` answer **404** in production, and run step 8's axe
pass again with R-147's card open. Those steps are written but **not yet executed** — the code they
walk is not deployed until the Deploy phase of this story.

**The Review's deployed walk (2026-09-19, `27a638fa`, production, real Supabase sessions; `SUPABASE_URL`,
`SUPABASE_SECRET_KEY`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID` by name).** CI on that commit: `check` (with `pnpm keyboard`),
`rls` and `deploy` green. The Real-infra verifier's four walks of `a9aa4b21` all died on `page.goto` timeouts
(DW-204); with one retry per navigation the first walk of `27a638fa` ran to the end: **every one of Story 5.9's
steps 71–80 passed**, step 53's new `.` press on the Light-only project included, `/harness/editor` and
`/harness/canvas` both 404 with `/login` 307 as the control, accounts deleted, users 13 → 13. It also printed
failures, and none is hidden here: **step 8's axe is red on `frame-focusable-content` (Question 5)**; step 5's CSP
count caught the Projects page's DW-201 event through step 80 (the harness's scoping, patched); and step 36's pill
placement during a scroll failed in this walk and passed in the verifier's fourth — intermittent, Story 5.4's, not
this diff's. No migration in the diff, so R-99 had nothing to check.

**After the rulings (2026-09-19, `7874dd5b`, production, same keys by name).** CI green — `check`, `rls`, `deploy`.
Two complete walks. The first: every Story 5.9 step passed, **step 8's axe zero on every scan with R-149's one-node
exception**, step 5's CSP zero, step 36 passing again — and **2 FAIL, both step 66 (Story 5.8's ⌘S)**: the indicator
stayed on Syncing and `projects.revision` did not move, which is the stalled `/sync` request DW-204 already names.
The second, straight after: **0 FAIL**, every check passing, accounts deleted. Step 66 is therefore intermittent on
the real stack and not this diff's; it is added to DW-204's evidence rather than left here.

**Deploy (2026-09-19).** No migration in this story (R-99 has nothing to check). HEAD (`61fffa5f`) is already the tip
of `main`, pushed at Review; confirmed rather than re-pushed. CI run [35456935324](https://github.com/Inflozo/inflozo/actions/runs/35456935324)
on `61fffa5f` (`GITHUB_TOKEN`, read-only): `check`, `rls` and `deploy` all completed **success**. `Deployment:
dpl_9a2ehTJmnRuikFN15wByvoDSjNhk` (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`) — `readyState: READY`, aliased to `app.inflozo.com`
and `inflozo.com`. Spot-checked unauthenticated on the live domain: `/app/harness/editor` → 308, `/` → 307 — both
redirect to sign-in, consistent with the Review walk's authenticated 404 on both harness routes; no harness code path
is reachable without `INFLOZO_HARNESS=1`, which production does not set.

## Owner's manual test

Do this on the real site after Deploy fills the URL in. Use the **Pilot sections** project — the one
seeded to your account at Story 5.1 — and a keyboard only where a step says so.

1. **URL:** `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` · **Screen:** the editor.
   Press `Tab` once, without touching the mouse first. **Expect:** a small white pill reading
   **"Skip the canvas"** appears over the top-left of the bar, with a coral ring around it. Press
   `Tab` again — it disappears.
2. **Same screen.** Press `Tab` slowly about a dozen times and watch where the ring goes.
   **Expect:** it moves through the top bar, into the Layers list on the left, then **once** onto the
   page area in the middle, then into the settings panel on the right. It never walks you through the
   links inside the page you are designing.
3. **Same screen.** Press `L`. **Expect:** the Layers list folds away to a thin strip. Press `L`
   again — it comes back.
4. **Same screen.** Press `.` (a full stop). **Expect:** the canvas turns dark. Press `.` again — it
   comes back to light.
5. **Same screen.** Press `1`, then `2`, then `3`. **Expect:** the page changes between desktop,
   tablet and phone, the chip under it naming each one.
6. **Same screen.** Click any section on the canvas to select it, then press `⌘D`. **Expect:** a copy
   of that section appears below it. Press `⌘Z` to undo it.
7. **Same screen.** With a section still selected, press `Del`. **Expect:** it is removed. Press
   `⌘Z`. **Expect:** it comes back exactly as it was. (If you picked the shared header, a small
   window asks first — that is correct; press Cancel.)
8. **Same screen.** Click into a headline on the canvas so the text cursor is in it, and type the
   word **"dark"**. **Dummy data:** the word `dark`. **Expect:** the word is typed into the headline
   and **nothing else happens at all** — the canvas does not flip to dark, the device does not
   change. This is the single most important step on this list.
9. **Same screen.** Press `Esc` once. **Expect:** you stop editing the words but the section stays
   selected (its outline is still there). Press `Esc` again — the outline goes. Press `Esc` a third
   time — the ring moves out of the page area into the panel beside it.
10. **Same screen.** Press `?` (shift and the question mark). **Expect:** a card opens in the middle
    listing every shortcut with its keys. Check the list **only shows keys that work** — there should
    be no "Add section", no "previous / next design", no "Site Remix", no "Preview Mode" and no "Ship
    it", because none of those has been built yet. Press `Esc` to close it.
11. **URL:** `https://app.inflozo.com/` · **Screen:** your projects, then your own initial at the
    bottom-left. Open that menu. **Expect:** a row reading **Keyboard shortcuts** with a small `?`
    beside it. Click it — the same card opens.

## Questions for the owner

### Question 1 — five of the thirteen shortcuts have nothing to press yet

The keyboard list in the plan has thirteen entries. **Eight of them can be built today.** The other
five press buttons that do not exist yet:

| Key | What it would do | Built in |
|---|---|---|
| `⌘K` | open the Add-a-section picker | Story 5.10, next |
| `[` `]` | flip to the previous / next design | Story 5.11 |
| `⇧R` | Site Remix | Story 5.12 |
| `P` | Preview Mode | Story 5.15 |
| `⌘⏎` | Ship it | Epic 7 (Story 7.18) |

**Example.** You open the editor after this story and press `[`. Nothing happens — there is no design
ring to flip through until Story 5.11 builds it. If we instead "built" the key now, it would either do
nothing (a key that lies) or we would have to invent something for it to do.

1. **Build the eight that work; each of the other five arrives with its own story.** (RECOMMENDED) —
   this is your own standing rule **R-118**, applied a seventh time: a control arrives with the story
   that makes it work and is simply absent until then. The `?` card lists only the keys that work, so
   it can never advertise a dead key. Each of those five stories then carries its own key and its own
   test, and by the end of Epic 7 the map is complete. The cost: the map is finished over six stories
   rather than in one, so no single test ever says "all thirteen" until 7.18.
2. **Hold the whole map until everything it names exists** — do the keyboard work again after Story
   5.15, and the `⌘⏎` half after Epic 7. You would get one test that proves the complete list in one
   piece. The cost is that the editor has **no single-key shortcuts at all** for at least six more
   stories, and every one of those stories is one you will test by hand in the meantime.

**Ruled: option 1 (owner, 2026-09-19).** Build the eight that work; each of the other five arrives with its
own story. Recorded as **R-145** in `prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` §A10 — R-118
applied a seventh time, and the first time to a KEY rather than a button. A binding whose action has not been
built is **absent**: not bound, not listed in the `?` card, never greyed. The map is one table naming all
thirteen with the story that lands each, and both the handler and the card's rows are derived from it. `⌘K`
lands with 5.10, `[` `]` with 5.11, `⇧R` with 5.12, `P` with 5.15 and `⌘⏎` with 7.18 — each tested by the
story that lands it, each now a criterion in `epics.md`, and the map complete when 7.18 ships. R-141's "5.9
still builds and tests the COMPLETE map" is narrowed by this ruling and by nothing else.

### Question 2 — should the keyboard test run on every commit, or only on the live site?

Today every browser check in this project runs **against the live site**, by hand, once per story —
that is your ruling R-82, and it is how the dashboard's equivalent gap was closed (DW-16, Story 3.9).
The plan for this story asks for something new: the keyboard journey **also** running automatically
on every single commit, inside the checks that must be green before anything publishes.

To do that, a browser has to open the editor without a database. The way to do that is a **stand-in
page** that exists only while testing (it answers "not found" on the live site) and shows the real
editor filled with the same sample sections the pilots page uses.

**Example.** Someone changes a line in the editor next month and accidentally breaks `Esc`. Under
option 1 the commit goes red within a minute and never publishes. Under option 2 the live site
publishes with `Esc` broken, and it is caught when the next story's live walk is run — days later.

1. **Build it, as the plan says.** (RECOMMENDED) — the four accessibility promises this story makes
   are then checked on every commit for ever, and it closes **DW-167**, which has now been deferred
   four times (Stories 4.10 → 5.1 → 5.2 → 5.7) and grows each time. Costs: about a minute added to
   every check run, a browser downloaded once in the build service, and one extra test-only page to
   keep in step with the real one (the computer catches that one automatically).
2. **Keep it on the live site only**, as every other browser check in this project is. Nothing new to
   maintain and the checks stay fast. The cost is that the keyboard promises are only ever as fresh
   as the last time someone ran the live walk, and DW-167 stays open with no owner.

**Ruled: option 1 (owner, 2026-09-19).** Build it, as the plan says. Recorded as **R-146** in
`reconcile-designs-decisions.md` §A10. The journey runs inside `pnpm check` and therefore inside CI's
`check` job, which is the only place a gate can block a deploy (R-116); it drives a harness mount that
answers `notFound()` unless `INFLOZO_HARNESS=1` and renders the REAL `Editor` with the pilot fixture.
**DW-167 closes here.** R-82 is untouched — the same walk runs again on the deployed editor with a real
session at Review, because a harness proves the wiring and never the stack.

### Question 3 — should `?` open the shortcuts card?

The drawings already put a **Keyboard shortcuts** row in your account menu, with a small `?` beside it
(S3). Story 1.5 left the row out on purpose, with a note saying this story adds it back. But **the
account menu is not shown inside the editor** — the editor takes over the whole window — so inside the
editor that row is unreachable, and `?` would be the only way to open the card.

The wrinkle: the product plan (FR-D11) calls its thirteen-key list "the complete set". Adding `?`
makes fourteen.

**Example.** You are in the editor, you cannot remember which key hides the Layers list, and there is
no menu to open. You press `?`, read the card, press `Esc`, carry on.

1. **Yes — `?` opens the card, and the menu row opens the same card everywhere else.** (RECOMMENDED) —
   it is drawn on the row as the key for it, it is the convention every editor uses, and it is the one
   key that teaches all the others. It obeys the same safety rule as every other letter key: while you
   are typing anywhere, it does nothing. I will record it as the one addition to FR-D11's list and
   why.
2. **No — the card is reachable only from the account menu**, so the key list stays exactly as the
   plan wrote it. The cost is that the card cannot be opened from the place it is about: you would
   have to leave the editor, open the menu, read it, and go back.

**Ruled: option 1 (owner, 2026-09-19).** `?` opens the card, and the account menu's row opens the same card
everywhere else. Recorded as **R-147** in `reconcile-designs-decisions.md` §A10 — FR-D11's fourteenth key, and
the record of why the PRD's "complete set" is now thirteen actions plus the key that lists them. It carries the
identical single-key focus condition (UX-DR11, WCAG 2.1.4): while any text holds the caret it does nothing.
S3's row is built as drawn, and the card lists exactly the keys that work (R-145).

### Question 4 — should the Backspace key delete the selected section too?

The plan says `Del` deletes the selected section. On a Mac laptop there is no separate `Del` key: the
key labelled "delete" is what every other keyboard calls Backspace. So the story made **both** keys
delete the section — and the rules for this story say any key beyond the plan's list is yours to
approve, which is why `?` was Question 3. This one was missed.

**Example.** You select the "Latest Post" section and press Backspace. Today it is removed, and "Latest
Post removed" is announced; `⌘Z` brings it back. While you are typing in any field, Backspace only
deletes a character, exactly like every other single key. The shortcuts card shows `Del` only.

1. **Keep both — `Del` and Backspace delete the selected section.** (RECOMMENDED) — it is what Figma,
   Webflow and every design tool do, and without it a Mac laptop has no delete key at all. `⌘Z` undoes
   a slip, and a site-wide section still asks first.
2. **`Del` only, as the plan wrote it.** A Mac laptop user then deletes a section with `fn`+delete, or
   from the `⋯` menu.

**Ruled: option 1 (owner, 2026-09-19).** `Del` and Backspace both delete the selected section. Recorded as **R-148** in
`reconcile-designs-decisions.md` §A10; the code is unchanged.

### Question 5 — the accessibility scanner objects to how the canvas skips the Tab key

This story made the page preview **one single Tab stop**: Tab goes Layers → the page area → Controls,
and never wanders through every link inside your site's preview. That is what the plan asked for
(UX-DR9) and it works. But the automated accessibility scanner we run on the live editor (axe-core,
which must report zero problems — NFR-5) now reports one: its rule says a preview frame that is
skipped by Tab must not contain anything a keyboard could land on. It cannot know that everything in
the preview is reachable another way — every section from the Layers list, every text and link from
the Controls panel.

**Example.** A keyboard user wants to change the hero's headline. Today: Tab to Layers, Enter on
"Hero", Tab to Controls, type in the Headline field. They never need to Tab *into* the preview. The
scanner flags the preview anyway.

1. **Keep the one Tab stop, and record this one scanner rule as a deliberate exception for the canvas
   frame only.** (RECOMMENDED) — the exception is written down with its reason, the scanner still
   checks everything else in the editor and everything inside the preview, and the keyboard test this
   story added keeps proving that every action has a keyboard route.
2. **Satisfy the scanner: let Tab walk into the preview.** Every link and button of your site becomes
   a Tab stop between Layers and Controls — dozens of presses on a long page — which is what UX-DR9
   and the skip link were written to prevent.
3. **Keep the one Tab stop and find a different technique that the scanner accepts.** Unknown cost: I
   have not found one — the scanner objects to the attribute itself — so this is a research task with
   no promised result, and the story waits on it.

**Ruled: option 1 (owner, 2026-09-19).** The canvas stays one Tab stop; axe's `frame-focusable-content` is excepted on
the canvas iframe alone, as a node filter in step 8 of the deployed walk. Recorded as **R-149**.
