---
title: 'Story 6.2 — The twelve presets and the font pool'
type: 'feature'
created: '2026-10-03'
status: 'in-review'
baseline_commit: '3f6449a3883f2a5c27623d1290667c79de99f322'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md']
---

## In plain English

After this story Inflozo has its twelve Style Packs — Paper, Ink, Orbit, Tangerine and the rest, each with its own
colours for light and for dark, its two fonts and its own corners, spacing and buttons — and the thirty font pairings
of the plan, whose files Inflozo serves itself, so no page ever asks Google for a font. In the editor, with nothing
selected, the right-hand panel shows your project's pack as a card with a **Change** button, and Change opens the list
of all twelve as the Style Pack drawing shows it; you can look at them there and try every pack on the five sample
sections at `/pilots` in light and dark, but choosing a pack for a project comes with Story 6.3. The canvas also draws
its words in the pack's real fonts on every computer (Paper now in Fraunces and Inter, as you ruled), and you
approve the twelve packs' colours and the new test photographs on a private page before either is saved.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Paper is the only pack: its values are a hand-copied reference set, `apps/web/lib/style-pack.ts`'s
`PRESETS` holds three hex values read off a drawing (DW-15), the canvas names `Georgia` and `'Inter'` and loads no face
at all (whatever the visitor's computer has), Appendix D lists twelve packs with vibes and no values (DW-11), the font
pool exists only as a table, and the render matrix photographs one pack (DW-169) whose buttons and gutters hide the
pilots' newest tokens (DW-317).

**Approach:** Author the twelve presets — seven colours per mode, scrim, pill and one step on each scale — into a new
Appendix D §D.d and into `packages/library/packs/`, held equal by a check and passed through 6.1's engine; build the
thirty pairings' faces once, from one pinned google/fonts commit, into `packages/library/fonts/` (clipped, pinned,
subset by script range, licences beside them); serve those files to every canvas from the app itself; draw S4a's Style
Pack card and S7a's roster in the editor (looking only); give `/pilots` a Pack menu; and widen the matrix to the
owner's three reference packs plus one specimen photograph per pairing, behind his sampled review.

## Boundaries & Constraints

**Always:**
- Every preset value comes from Appendix D §D.d and nowhere else. `tools/stress/test-vocabulary.mjs` holds §D.d and
  `packages/library/packs/` equal in both directions and fails on a table it parses as empty; the kits' `PACKS`, the
  Calibration Set and S7a's dots are calibration only (DW-11).
- One Paper: `REFERENCE_PACK` IS the Paper preset (`packages/section-runtime` imports it from `@inflozo/library`; the
  library never imports the runtime — the dependency runs runtime → library), and `reference-tokens.css` stays
  `referenceTokensCss()` byte for byte.
- Every preset goes through `packTokens` (6.1's one door) and holds, in both modes, ≥ 4.5:1 for text and muted on
  background and on surface, and for on-accent on accent — Appendix D's "AA on every token pairing used by the
  library"; every computed colour keeps 6.1's guarantee.
- The pool is built by ONE step (`tools/fonts/build-pool.py`) whose input is Appendix D §D.c itself, and every file it
  writes is recorded in `packages/library/fonts/pool.json` with its sha256; nothing fetches a font at run time, and no
  canvas, app page, matrix run or test document names `fonts.googleapis.com` or `fonts.gstatic.com`.
- The canvas loads the same files, subsets and axis instances the theme will ship (Appendix D §D.b): every canvas
  document (`pilotsCanvasDocument`, the style guide's `head()`) carries its pack's `@font-face` rules.
- The app's own faces (`apps/web/app/fonts/fonts.css`) are never redefined: a pool face drawn in the app document (a
  pack cell's "Ag") is declared under a family name of its own.
- Counts are derived, never written down (standing rule 4) — in code, tests, Appendix D and every message.
- What the owner ruled in Questions 1–4 (R-231 to R-234) lives in ONE place each: names, faces and accents in §D.d and Appendix D's
  roster table; the D19/D22 range in §D.c; the specimen promise in §D.c's closing paragraph; the reference packs as
  `REFERENCE_PACKS` in `packages/library/packs/`.

**Ask First:**
- **The twelve packs' authored values** (Task 6): Dev shows the owner, in the Dev session, a private review page —
  every pack on the five pilots, light and dark, at 1440, with its authored table — and commits the packs only on his
  approval; his changes are applied and shown again.
- **The mass rebaseline** (Task 21): the new photographs land only on his approval of the sampled review
  (`docs/render-matrix.md` § The rebaseline rule), in their own commit after the Dev commit — the same page may carry
  both reviews.
- A pairing whose built files break D.a's budget as Design Notes reads it (more than five faces, or more than 200 KB
  of latin subsets), an upstream face whose type or weights differ from §D.c, or a licence that is not OFL or Apache 2.0
  — stop and ask; never change §D.c to fit.
- A preset whose vibe cannot hold the AA sheet without a different accent than the one ruled — stop and ask.

**Never:**
- No switching: a pack cell is not a button, nothing writes `projects.style_pack`, the editor's canvas keeps Paper, and
  there is no crossfade and no Remix re-roll (Story 6.3). The New project window keeps Paper as its one cell (DW-322).
- No pencil, "+ New pack", custom pack cell, font pickers, step rows or colour pickers (Story 6.4, DW-310); no brand
  seeding and no sixth dot (Story 6.6); no change to mode resolution (Story 6.5); no theme emission (Epic 7).
- No `*-tokens.css` file beside `reference-tokens.css`: the matrix's pack axis is `REFERENCE_PACKS`.
- No `next/font`, no font CDN, no edit to the design export (R-74), no change to the matrix image (`tools/matrix/Dockerfile`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Variable heading | D1 Fraunces `V · wght 500–800`, `opsz`/`SOFT`/`WONK` pinned | one face, `wght` 500–800, no other axis, two files (latin, latin-ext) with Google's `unicode-range`s | — |
| Static heading | D2 Libre Caslon Text `S · 700` | one face per declared weight | — |
| Variable body | Inter `V · wght 400–700` + italic | roman and italic faces, each clipped 400–700, `tnum` kept | — |
| Static body | D8 IBM Plex Mono `S · 400, 700, 400i, 700i` | four faces | — |
| One family, both roles | D12 Newsreader | the body's two faces only, covering the heading's range (D19 and D22 widened, R-232) | — |
| Upstream differs from §D.c | a `V` family that is static upstream, or a missing weight | the builder stops naming family and difference; nothing written | exit non-zero |
| Licence | `METADATA.pb` licence other than OFL/APACHE2 | the builder stops naming the family | exit non-zero |
| Budget | a pairing's faces > 5 or latin bytes > 200 KB | `test-vocabulary.mjs` fails naming the pairing and its measure | — |
| Files drift | a woff2 edited or missing after the build | `test-vocabulary.mjs` fails naming the file (sha256 against `pool.json`) | — |
| Preset drift | a value in `packs/` and not §D.d, or the reverse | `test-vocabulary.mjs` fails naming pack, mode and role | — |
| AA sheet | text, muted, on-accent below 4.5:1 in any preset and mode | the packs test fails naming pack, mode and pair | — |
| A font by name | `canvas?font=<a pool file>` | 200, `font/woff2`, immutable caching | — |
| A path, not a name | `canvas?font=../../x` or an unknown file | 404, read nothing | 404 |
| A pack by id | `canvas?pack=mono` | the document carries Mono's token block and Mono's faces | — |
| Unknown pack | `canvas?pack=harbor` | 404 | 404 |
| A stored unknown preset | `style_pack.preset` not a preset id | the card and roster show Paper current (`placeholderFor`'s rule) | — |
| Read-only editor | another window holds the lock | Change still opens the roster — a view (R-192) | — |

</frozen-after-approval>

## Code Map

**The engine and its reference pack (6.1's, AD-1 pure):**
- `packages/section-runtime/src/tokens.ts` — `Pack` :136 (`fonts: { heading: Face; body: Face & { tabular } }` :140),
  `REFERENCE_PACK` :154 (Georgia .6929 / Inter .7275 at :167 — replaced by the Paper preset), `check` :201
  (`FAMILY_LIST_RE` :192), `packTokens` :302, `packTokensCss` :390, `referenceTokensCss` :406; `SCALES` :106.
  `index.ts:42,45` exports. `tokens.test.ts:17-31` carries the kits' Tangerine and Ink as calibration test data.
- `packages/section-runtime/package.json` depends on `@inflozo/library`; `packages/library/package.json` has no
  dependency on the runtime, and must not gain one (`core.ts:56`, `doc-schema.ts:16` import the library).
- `packages/section-runtime/reference-tokens.css` — readers: `apps/web/lib/pilots.ts:24`, `style-guide.ts:164`,
  `controls-review.ts:33`, `tools/stress/test-vocabulary.mjs:221` (byte check), `tools/check-traces.mjs:50`.

**The homes (`ARCHITECTURE-SPINE.md:645`: "FR-E style packs | E6 | `packages/library/packs`"):** neither
`packages/library/packs/` nor `fonts/` exists. Library exports are `package.json` `exports` (`.`, `./icons`, `./core`).

**The rule document:** `prd.md` Appendix D (:1010) — the roster table (:1014-1027, vibes and pairings, no values),
the dark-palette and AA paragraph (:1029), §D.0 (:1031), §D.a (:1076; rule 3 the two-file proviso, rule 5 the budget,
rule 7 licences), §D.b (:1088; the canvas binds too, :1101), §D.c (:1103, the thirty rows; D19 :1123, D22 :1126; the
render-matrix promise in the closing paragraph). `test-vocabulary.mjs` already cuts §D.0 by heading (6.1's check) —
the pattern for §D.c and §D.d.

**Fonts today:** the canvas declares no `@font-face` — the token block names `Georgia, serif` / `'Inter', sans-serif`
and the browser uses what is installed. `apps/web/app/fonts/fonts.css` is the app's own three faces (DW-246), with
Google's `latin` / `latin-ext` `unicode-range`s word for word — the builder's ranges. `lib/canvas-layer.ts:47-95`
copies the editor's faces into the canvas as `inflozo-chrome <family>`, so a pool `'Inter'` in the canvas cannot
collide. The matrix image aliases Georgia to Gelasio and installs `fonts-inter` (`tools/matrix/Dockerfile:6-20`,
google/fonts pinned by commit and checksum — the precedent for the pool's pin). Executed at Create (2026-10-03):
Google's CSS2 API asked for `Fraunces:wght@500..800` serves a file whose `fvar` is still `wght 100–900` (it drops the
other axes but never clips), so clipping needs fontTools' instancer; neither `fontTools` nor `brotli` is installed
(`uv run --with` supplies both). Measured, clipped with the instancer: Fraunces 500–800 latin 33,260 B / latin-ext
30,892 B; Inter roman 400–700 36,116 / 59,324; Inter italic 38,460 / 64,108.

**Serving files to the browser:** the only mechanism is a route handler reading through `PACKAGES()`
(`style-guide.ts:43-46`, the DW-269 trace). `(authed)/canvas/route.ts` serves `?image=<name>` checked against the
directory (:24-31), `?sheet=surface`, `?design=` (404 on an unknown id, :36-39) with `canvasCaching(v)`; the harness
copy is `app/harness/canvas/route.ts`. `tools/check-traces.mjs:44-60` lists what `/canvas` must carry.

**The app's pack data:** `apps/web/lib/style-pack.ts` — `stylePackSchema` :45, `Preset` :49-57, `PRESETS` :59 (Paper
only, Georgia), `DEFAULT_PRESET` :69, `placeholderFor` :79 (unknown preset → Paper). `apps/web/tokens.test.ts:107`
(`PACK_DATA`) allows colour literals in that file alone. Readers: `new-project-sheet.tsx:155,224` (D4a's one cell),
`placeholder.tsx:20,56`, `sites/actions.ts:728,909`, `projects/actions.ts:145`. `projects.style_pack` is `jsonb not
null`, no CHECK (`20260904120000_complete_schema.sql:223`); the editor reads it nowhere today.
- `apps/web/components/kit/pack-cell.tsx` — `PackCell` (`name`, `glyphFamily`, `palette: string[]`, `active`,
  `editable`), the active state a coral ring with no words.

**The editor's right panel:** `projects/[id]/(editor)/editor.tsx` — `#editor-controls` :5281 (aria-label already
`'Page settings'` at rest), the rest state `EmptyPanel "Nothing selected"` (~:5428), read by
`tools/keyboard/journey.spec.mjs:444` and `tools/probe/run-verify-editor.cjs:919,2316`. The ABSENT list :297-299 names
"the Style Pack card (6.3) (R-118)". No drill-in sub-panel exists anywhere in the sidebars (`ChevronLeft` is used for
"Back to dashboard", `editor.tsx:4795`). Below 1280 the Controls panel is an overlay opened by a selection (5.22), so
the rest panel is not shown there.

**The frames:** `S4 Editor.dc.html:108-121` — S4a's rest panel: "Page", then the card (26px "Ag" in the heading face,
the name, "Georgia · Inter", six dots `FBF9F5 FFFFFF D96C3F 232019 F4EEE4 2F4A3E`, a 32px **Change** button), then the
Dark mode row (absent, R-118) and the posts-per-page note (never built). `S7 Style Packs.dc.html:23-135` — S7a: a back
chevron and "STYLE PACK" (:112-114), the Current card (24px "Ag", name, four dots, a "Current" badge `#C2381F` on
`#FFEDE8`, :116-118), a three-column grid of cells (:119-122; each a 15px "Ag", 10.5px name, four 9px dots — background,
accent, text, tint; active = `0 0 0 2px #FF5941`), then the custom cell, "+ New pack" and the pack-level rows (6.4's).
Its caption (:25) calls its names placeholders. `D4 Dashboard Sheets and Blocks.dc.html:105-116` — D4a's row: Paper
(active) and Tangerine with three dots, "+ New pack". `EXPERIENCE.md:154` (S7 from the sidebar's "Change"), `:60`
(tablet and desktop only), `:348` (the sidebar's "Nothing selected" empty state).

**`/pilots`:** `(authed)/pilots/page.tsx` (entries, `referenceSwatches('light'|'dark')`), `pilots/review.tsx` (the
Mode segmented :214, `data-mode` on the canvas `<html>` :123). `apps/web/lib/pilots.ts:154`
`pilotsCanvasDocument(only?, extra)` builds `1-tokens` from `TOKENS()`.

**The matrix:** `tools/matrix/cases.mjs` — `packs()` / `packCss()` :59-60 read every `*-tokens.css`; slug
`[pack, mode, viewport, row]` :91-93. `cases.test.mjs:64-67` asserts the document carries every pack's CSS.
`matrix.spec.mjs:127-160` paints `data-mode` and waits on `document.fonts.ready`; `serve.mjs:10-20` serves one
`pilotsCanvasDocument()` and `/images/`. `docs/render-matrix.md:37` (packs axis), :118-140 (the rebaseline rule, the
sampled review). Baselines are `packages/library/baselines/{category}/{n}/{slug}.png`.

**DW-317's two designs:** `a4/13/style.css:34` `.a4-13__action--primary` and `a1/1/style.css:59` `.a1-1__cta` read
`--button-fill` with no `[data-bg="contrast"]` answer; `a22/1/style.css:45` is the answer to copy.

**Propagation targets:** `deferred-work.md` DW-11 (:337), DW-15 (:437), DW-169 (:4750), DW-309 (:8448), DW-311
(:8480), DW-312 (:8495), DW-313 (:8508), DW-317 (:8561), DW-322 (new at Create); `editor.tsx:297-299`;
`new-project-sheet.tsx:34-35`; `style-pack.ts`'s header; `tools/matrix/Dockerfile`'s font comment (a fallback now);
`epic-6-context.md`; `ARCHITECTURE-SPINE.md:645` (add `packages/library/fonts`).

## Tasks & Acceptance

**Execution:**
- [x] `tools/fonts/build-pool.py` + its `tools/doc-audit.py` catalogue row -- new, PEP 723 inline deps (`fonttools`,
  `brotli`, pinned), run with `uv run`; docstring on any flag. Reads §D.c from `prd.md` (the rows, nothing typed again);
  for each family fetches `METADATA.pb`, the licence text and the declared TTFs from github.com/google/fonts at ONE pinned
  commit; refuses a licence other than OFL/Apache 2.0 or a face type or weight that differs from §D.c; pins every
  non-`wght` axis at its default and clips `wght` to the declared range (instancer), takes the declared weights of a
  static family; subsets each face to `latin` and `latin-ext` with the ranges in `apps/web/app/fonts/fonts.css`, keeping
  every layout feature; writes woff2 with timestamps not recalculated, so a re-run is byte-identical -- one step builds
  the canvas's files and the theme's (D.b)
- [x] `packages/library/fonts/` -- run the builder: `files/*.woff2`, `licences/<family>.txt`, and `pool.json` (per
  pairing: id, name, each role's family, CSS fallback generic, face type, range or weights, and each file's style,
  weight, subset, `unicode-range`, bytes and sha256; each face's cap height from `OS/2` and whether it carries `tnum`;
  the licence and the commit) -- the pool, built once and committed
- [x] `packages/library/src/` + `package.json` `exports` -- export the pool (`pool.json`) and the packs; a
  `fontFaceCss(pairingId, url)` beside the runtime's token block (`packages/section-runtime/src/fonts.ts`, exported)
  emitting one `@font-face` per file — family, style, weight range, `font-display: swap`, `unicode-range`, `src:
  url(url(file)) format('woff2')` — with an optional family prefix for the app document -- the one emitter the canvas,
  the app and Epic 7 share
- [x] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` -- Appendix D: the roster table per
  R-231; a new **§D.d The twelve presets (normative, authored)** after §D.c — per pack its pairing, per mode the
  seven roles and the scrim, the pill radius and the seven steps, and `REFERENCE_PACKS` per R-234; §D.c's D19/D22
  rows and §D.a rule 3 per R-232; §D.c's closing promise per R-233; §D.a rule 5 says how the budget is read
  (Design Notes) with the measured Paper figures -- the document the packs are read from
- [x] `packages/library/packs/` -- the twelve as data in §D.d's order (ids `paper` … `quiet`), `REFERENCE_PACKS`, each
  preset's fonts filled from `pool.json` (family list with its fallback, cap height, `tabular`) -- the presets, data
  only, in the spine's home
- [x] Ask First -- author the twelve per Design Notes' proposal and the rulings; render each on the five pilots, light
  and dark, at 1440 (the matrix's render path, `?pack=`); show the owner a private review page with each pack's table;
  apply his changes; record his approval under `## Questions for the owner` -- the presets' values are his to approve
- [x] `packages/section-runtime/src/tokens.ts`, `index.ts`, `reference-tokens.css` -- `REFERENCE_PACK` becomes the Paper
  preset read from the library; drop the hand-written faces; regenerate the CSS -- one Paper
- [x] `packages/section-runtime/src/packs.test.ts` (new) -- every preset passes `packTokens`; the AA sheet (Always) per
  preset and mode, naming any failure; `REFERENCE_PACK` equals `paper`; `fontFaceCss` emits exactly the pool's files
  for a pairing, `swap` and the ranges; a prefixed family never equals an app face -- the runnable check of the presets
- [x] `tools/stress/test-vocabulary.mjs` -- §D.d ↔ `packs/` both directions; §D.c ↔ `pool.json` (families, face type,
  range or weights) both directions; every `pool.json` file exists with its sha256 and no other file sits in `files/`;
  per pairing faces ≤ 5 and latin bytes ≤ 200 KB; licences OFL/Apache; heading faces roman only, body faces roman and
  italic; no tracked file under `apps/web`, `packages` or `tools/matrix` names a Google font host — each check behind a control
  that fails it -- Appendix D held in CI
- [x] `apps/web/lib/pilots.ts`, `style-guide.ts` -- `pilotsCanvasDocument(only?, extra?, pack = 'paper')` and the
  style guide's `head()` carry the pack's token block (Paper's stays `reference-tokens.css`'s bytes) and its
  `fontFaceCss` with URLs that reach the canvas route's `?font=` from that document, as `?image=` does -- the canvas
  loads the theme's files (D.b)
- [x] `apps/web/app/(app)/app/(authed)/canvas/route.ts`, `app/harness/canvas/route.ts`, `tools/check-traces.mjs` --
  `?font=<file>` served only when the name is a `pool.json` file (`font/woff2`, immutable, `nosniff`), `?pack=<id>` only
  when a preset (404 otherwise); `/canvas` carries `packages/library/fonts` -- self-hosted, same origin, traced
- [x] `apps/web/lib/style-pack.ts` -- `PRESETS` derived from the library's packs (name; glyph family = the pool
  heading face under the app prefix; placeholder surface = light background; accent; text) — no hex left in the file
  but what the derivation needs; a `packFacesCss()` of every preset's heading faces under the prefix, linked in the
  authed layout so a glyph draws wherever a cell does -- DW-15: the dashboard and D4a paint from the canvas's values
- [x] `apps/web/components/kit/pack-cell.tsx` -- the active cell carries a visually hidden "Current"; the glyph never
  synthesises a weight (`font-synthesis: none`) -- the ring's meaning reaches a screen reader
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/` -- the editor reads `style_pack` with the project;
  a new `style-pack.tsx` beside `editor.tsx` draws S4a's card (Design Notes) and S7a's panel; at rest the panel reads
  "Page", then the card, then the existing `EmptyPanel`; **Change** swaps the panel for the roster (focus to the back
  button), the back button returns (focus to Change), Escape returns too; cells are `PackCell`s in a list, not buttons;
  the ABSENT comment (:297-299) says the card is 6.2's and the switch 6.3's -- S4a and S7a, looking only
- [x] `apps/web/app/(app)/app/(authed)/pilots/page.tsx`, `review.tsx`, `apps/web/lib/controls-review.ts` -- a Pack
  menu (the twelve, §D.d's order, Paper first) that loads the canvas with `?pack=`, the Background dots following the
  chosen pack and mode -- every pack on the five pilots in both modes, the epic's exit, for the owner's eye
- [x] `tools/keyboard/journey.spec.mjs` -- one journey: Tab to Change, Enter, the panel lists the twelve with the
  current one named "Current", the back button returns focus to Change -- the keyboard path in CI
- [x] `packages/library/designs/a4/13/style.css`, `a1/1/style.css` -- the `--button-fill` button answers
  `[data-bg="contrast"]` as A22 #1 does -- DW-317: an Outline label is never the band's own colour
- [x] `tools/matrix/cases.mjs`, `cases.test.mjs`, `matrix.spec.mjs`, `serve.mjs` -- the pack axis is `REFERENCE_PACKS`;
  each case's document carries its pack's block and faces (served `?font=` as `/canvas` does); per R-233 one case
  per pairing photographs a specimen the matrix owns (a heading, a paragraph with a bold and an italic run, tabular
  figures, latin-ext letters) in Paper's palette with that pairing's faces, light, 1440; the test asserts the axis equals
  `REFERENCE_PACKS` and a reference pack sits off Paper's step on `buttons` and on `gutters` -- DW-169, DW-313, DW-317
- [x] `docs/render-matrix.md` -- the pack axis (`REFERENCE_PACKS`, ruled), the specimen row, and that the image's
  Georgia and Inter are now fallbacks -- the rules say what runs
- [x] `packages/library/baselines/` -- Ask First: `bash tools/matrix/run-matrix-gate.sh --update` in the image; the
  owner's sampled review (one design per category, each reference pack light and dark at 1440, before beside after,
  each with its cause and its frame, plus a page of the specimens); on approval a baselines-only commit after the Dev
  commit naming this story, pushed with it -- NFR-6(a)'s mass rebaseline
- [x] `deferred-work.md`, `epic-6-context.md`, `editor.tsx`, `new-project-sheet.tsx`, `style-pack.ts`,
  `tools/matrix/Dockerfile` (comment only), `ARCHITECTURE-SPINE.md:645` -- close DW-11, DW-15, DW-169, DW-309, DW-311,
  DW-312, DW-313, DW-317 with their proof; a dated Dev sub-bullet; comments name the right stories; grep for `Georgia`
  and for the old `PRESETS` shape (standing rule 7) -- the ledger closes on evidence

### Review Findings

*Code review, 2026-10-03 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier). The verifier's first finding stopped everything else: CI's `check` job was red on the Dev head, so `deploy`
was skipped and none of this story had reached production. Every patch below is applied in the Review commit. No
finding is the owner's to decide. The deferred findings are in the ledger with named owners (DW-323 to DW-325). The rest
were dismissed as noise, as calls the spec or a ruling already made (the five dots, §D.a rule 5's reading, R-235's
"§D.c stays as written", A22 #1's answer copied to A4 #13), or as a traceback where a named refusal would be nicer.*

- [x] [Review][Patch] **The Dev head never deployed.** The 6.2 journey's read-only row opened Change with a pointer
  (`change.click()`), which the journey's own no-pointer control refuses (NFR-6(d)); Dev re-ran that journey alone
  (`--grep "6.2 ·"`), which skips the control, so `pnpm keyboard` was red in CI, `check` failed and `deploy` was skipped
  (run 37140453790). The row opens Change with focus and Enter [`tools/keyboard/journey.spec.mjs`]
- [x] [Review][Patch] Escape left the pack list only while focus was inside the panel — and its cells are not tab
  stops, so step 9 of the owner's test ("Tab a few times; then Escape") did nothing. Escape is now a rung of the editor's
  own ladder and leaves the list from anywhere, focus on Change; the journey presses it from the Layers list
  [`editor.tsx` `onEscape`; `journey.spec.mjs`]
- [x] [Review][Patch] The panel kept the name "Page settings" while it showed the list; it is "Style Pack" [`editor.tsx`]
- [x] [Review][Patch] A font was kept `immutable` for a year whatever its address said: the hash in the address was
  never compared. It is kept only under its own hash; an address with none, or a rebuilt file under its old one, is
  served and not cached [`lib/pilots.ts` `poolFontIs`; both canvas routes; `lib/style-pack.ts` `fontHash`]
- [x] [Review][Patch] No check executed the route's `?font=` and `?pack=` answers — the lib functions and the matrix's
  own server were tested, never the route — so losing the branch would draw every canvas in fallback faces with CI
  green. The route is now called: 200 `font/woff2` `nosniff` with the `wOF2` magic, a year only under its hash, 404 for a
  path, an unknown file and an unknown pack, Mono not served as Paper; seen red without the hash check
  [`apps/web/frame-guard.test.ts`]
- [x] [Review][Patch] A font's cache rule was asserted only for an address carrying a build, which a font's never does
  [`apps/web/pilots.test.ts`]
- [x] [Review][Patch] A push that changed only a specimen photograph scoped to "touched no design" and ran nothing
  [`.github/workflows/matrix.yml`]
- [x] [Review][Patch] The font builder ran a full build — fetch, rewrite, remove — on `--help` or any typo; reported a
  network fault as "not an OFL or Apache 2.0 family"; wrote its download cache in place, so an interrupted download was
  read as upstream ever after; and met an unmapped upstream category as a `KeyError` after the files were written. It
  refuses unknown arguments, catches only a 404, renames a finished download into place, and refuses the category before
  anything is written [`tools/fonts/build-pool.py`; `--self-check` still passes]
- [x] [Review][Patch] Three controls did not exercise the check they guard: the sha256 control tested the hash function,
  nothing controlled "no other file sits in files/", and the budget's faces measure had none. Each now goes through the
  comparison itself; the §D.c control no longer assumes the first row's body is variable
  [`tools/stress/test-vocabulary.mjs`]
- [x] [Review][Patch] The heading's cap height (`--drop-cap-ratio`'s input) was never held to the pool; the DW-317 test
  let two different packs satisfy "one of them off Paper on buttons and on gutters"; `/pilots`' swatches were tested for
  Paper only [`packs.test.ts`; `tools/matrix/cases.test.mjs`; `apps/web/controls.test.ts`]
- [x] [Review][Defer] The pool's whole record (`pool.json`, every sha256) and the presets ride into the client bundles
  of the New project window and the editor [`apps/web/lib/style-pack.ts`] — deferred, DW-323
- [x] [Review][Defer] The matrix does not photograph R-232's widened weights, a bold italic or a heading's latin-ext
  file; nothing asserts a non-Paper pack's or a specimen's faces were drawn from the pool; A4 #13's contrast-ground
  button rule (DW-317) is rendered by no case [`tools/matrix/cases.mjs`] — deferred, DW-324
- [x] [Review][Defer] The card, the roster and `/pilots`' Pack menu have only ever run with Paper stored; the signed-in
  layout's choice of font address and the canvas chrome's skipping of pack faces have no check
  [`style-pack.tsx`, `(authed)/layout.tsx`, `lib/canvas-layer.ts`] — deferred, DW-325

**Acceptance Criteria:**
- Given Appendix D and the repository, when `pnpm check` runs, then §D.d equals `packages/library/packs/` and §D.c
  equals `pool.json`, every pool file matches its sha256, every pairing keeps D.a's budget as read, every family is OFL
  or Apache 2.0, and no Google font host is named — and breaking any one of them turns it red.
- Given any of the twelve presets, when its tokens are computed, then text and muted read ≥ 4.5:1 on background and on
  surface, on-accent ≥ 4.5:1 on accent, in light and in dark, and Paper's block is `reference-tokens.css` byte for byte.
- Given any canvas — the editor, a Section Picker preview, `/pilots`, the style guide or the matrix — when it renders,
  then its headings and body are drawn from the pool's own files served by `app.inflozo.com`, and the network log
  shows no request to a Google host.
- Given the editor at rest at ≥ 1280 px, when the owner looks at the right panel, then it **matches S4a**
  (`S4 Editor.dc.html:108-121`): "Page", the project's pack card — "Ag" in its heading face, its name, "Heading ·
  Body", five dots, **Change** — and below it the existing "Nothing selected" line.
- Given that card, when Change is pressed, then the panel **matches S7a** (`S7 Style Packs.dc.html:112-122`): the back
  chevron and "STYLE PACK", the Current card, and the twelve presets in a three-column grid in §D.d's order, each with
  "Ag" in its own heading face, its name and four dots, the current one ringed and named "Current"; with R-231's
  names, not S7a's placeholders, and without the pencil, custom cell, "+ New pack" and pack-level rows.
- Given `/pilots`, when any pack is chosen, then the five pilots draw in that pack in light and dark at every device.
- Given the matrix, when it runs, then its pack axis is the owner's three reference packs, one of them off Paper's
  step on buttons and on gutters, every design's `--button-fill` button reads on a contrast ground, every pairing has
  its specimen photograph, and after the owner's sampled review the new baselines land in their own commit and the
  matrix is green.
- Given the story's changes, when the gates run, then `pnpm check`, `pnpm keyboard`, `python3 tools/doc-audit.py
  --check` and `bash supabase/tests/run-rls-gate.sh` are green.

## Spec Change Log

- **Dev (2026-10-03), where the build had to differ from the letter of a task** — each recorded where it lives:
  a static face's file carries its weight (`poppins-roman-600-latin.woff2`), since one family can ship several;
  `fontFaceCss`'s address callback is handed the pool's record of the file, so the app's address (`style-pack.ts`'s
  `fontHref`) carries the file's own hash and `?font=` may be kept `immutable`; `fontHref` lives in `lib/style-pack.ts`
  because the New project sheet is a client module that must not carry the runtime (the runtime gained a light
  `./fonts` subpath); A1 #1 offers no contrast ground, so the validator refuses a `[data-bg="contrast"]` rule there and
  its stylesheet says so instead (DW-317); the builder drops TrueType hinting, or D15 breaks §D.a rule 5 (§D.a says so);
  Libre Caslon Text is variable-only upstream, so D2's static 700 is cut from it under Question 5.
- **Review (2026-10-03), recorded here because nothing else says it:** a `pool.json` file record is `{subset, file,
  bytes, sha256}` — style and weight live on its face and the `unicode-range` in the top-level `subsets` map, so nothing
  is written twice; S7a draws its panel 320 px wide and the editor's right panel is S4a's 280 px, so the roster is drawn
  at 280 with S7a's own gaps and its cells are narrower than the frame's (the panel does not change width under Change —
  a routine call, and the owner sees it at step 5 of his test); `?font=` is kept a year only under the hash its address
  carries (`poolFontIs`).

## Design Notes

**What this story draws, and what it leaves.** The card says the roster matches S7a and the switch is 6.3's (S7b).
R-118 puts a control in with the story that makes it work: **Change** works here (it opens the roster); a pack cell's
job is to switch, so here a cell is information, not a button — no hover, no pointer, not focusable. EXPERIENCE.md
names "Nothing selected" the sidebar's empty state and S4a draws the rest panel as "Page" with the card, so both stay,
card first. Below 1280 the rest panel is not shown (5.22's overlay opens for a selection); reaching the roster there,
and the New project window's choice D4a draws (Paper and Tangerine), are 6.3's with the switch (DW-322).

**The dots.** A roster cell's four (S7a): light background, accent, text and `--plate` — S7a's fourth dot is Paper's
band tint `#F4EEE4`, where the engine's plate is `#F3EFE8`. The card's five (S4a): background, surface, accent, text,
plate; S4a's sixth (`#2F4A3E`) is the site's brand colour S7d reads "From your site" — Story 6.6's. D4a's cell keeps
its three. The card's line is the two families' names (`Fraunces · Inter`).

**Reading D.a's budget.** D.b splits every face into a `latin` and a `latin-ext` file by `unicode-range`, so a
three-face pairing is six files on disk and D.a rule 5's "≤ 5 font files" can only count faces. Its "≤ 200 KB of font
payload" counts what a latin page downloads: the latin files, since the browser fetches `latin-ext` only for a page
that has such a letter (D.b). Measured at Create, Paper's latin files total 107.9 KB and its latin-ext add 154.3 KB, so
the other reading fails the default pack. §D.a says so in the Dev commit.

**The pool's names.** A file is `<family-slug>-<roman|italic>-<subset>.woff2`. In a canvas the faces carry the family's
own name, as a theme's will; in the app document they carry a prefix (`Inflozo pack <family>`), so the editor's Inter
and Bricolage Grotesque are never redefined.

**Dev's starting proposal for the steps** (approved with the palettes in the Ask First review; Paper's is R-230's drawn
row):

| Pack | Corners | Spacing | Width | Gutters | Buttons | Shadow | Links |
|---|---|---|---|---|---|---|---|
| Paper | soft | comfortable | normal | normal | solid | subtle | accent |
| Ink | sharp | comfortable | narrow | normal | solid | none | underline |
| Orbit | soft | comfortable | wide | normal | pill | subtle | accent |
| Tangerine | round | comfortable | normal | normal | pill | lifted | accent |
| Slate | soft | compact | wide | normal | solid | subtle | underline |
| Meadow | round | airy | normal | loose | soft | subtle | accent |
| Dune | soft | airy | normal | normal | solid | none | accent |
| Mono | sharp | compact | wide | tight | outline | none | underline |
| Ocean | soft | airy | wide | loose | soft | subtle | accent |
| Berry | round | comfortable | narrow | normal | pill | lifted | accent |
| Neon | round | comfortable | wide | loose | pill | lifted | accent |
| Quiet | sharp | airy | narrow | normal | outline | none | underline |

The palettes are authored from Appendix D's vibes, with S7a's light dots as the starting point for the packs it draws
under their own names (Paper, Tangerine, Meadow, Dune, Berry, Slate) and each dark palette hand-paired (backgrounds
deepen, surfaces lift, accents re-tuned), never computed. Tangerine's roster accent `#E8450A` reads 3.97:1 under white
and 4.11:1 under its own text `#2B1D12`, so its on-accent is authored darker, as Paper's ink is (R-110).

## Questions for the owner

The owner ruled Questions 1–4 at Create on 2026-10-03, each as recommended (R-231 to R-234), and Questions 5–7 in the Dev
session the same day, each as recommended (Question 5 recorded as R-235; Questions 6 and 7 are the Ask First list's two
approvals), on one private review page (https://claude.ai/artifact/RYnF2YzsZWnenMuoDsUU7B). No question is open.

### Question 1 — Where the drawings and the plan disagree about the twelve packs, which wins? (DW-309, DW-311, DW-11)

**In plain English.** The plan (PRD Appendix D) names the twelve packs and their fonts. The Style Pack drawing used
stand-in names for five of them, sets Paper's headings in Georgia — a Microsoft font Inflozo is not allowed to ship
inside your theme — and draws Ink as a dark purple pack in one sans-serif font, while the plan describes Ink as black
and white with one red, in two editorial serif fonts. Two drawings also give Tangerine two slightly different oranges.

**An example.** The drawing's roster says Harbor, Neon Dusk, Cocoa, Mist and Butter; the plan says Orbit, Mono, Ocean,
Neon and Quiet.

1. **The plan wins (RECOMMENDED).** The twelve are Paper, Ink, Orbit, Tangerine, Slate, Meadow, Dune, Mono, Ocean,
   Berry, Neon and Quiet, in that order, laid out as the drawing lays them out. Paper is Fraunces with Inter (your
   headings change from Georgia to Fraunces everywhere). Ink is black and white with one red, in Libre Caslon Text with
   Source Serif 4. Tangerine takes the orange the roster draws (`#E8450A`), with dark words on its buttons.
2. **The drawings win.** The roster's twelve names; Paper keeps Georgia's look through Gelasio, a free look-alike;
   Ink is dark purple, all in Inter; Tangerine as option 1.
3. **A mix** — say which part follows the drawing, for example "the plan's names, but keep Paper's Georgia look".

**Ruled: option 1 (owner, 2026-10-03).** *"The plan wins"* — recorded as R-231. The roster is Appendix D's twelve in
its order with S7a's layout; Paper is Fraunces / Inter, Ink black and white with one red in Libre Caslon Text / Source
Serif 4, Tangerine `#E8450A` with a dark on-accent.

### Question 2 — Two font pairings need one file a little bigger. Is that fine? (DW-312)

**In plain English.** Broadsheet (Chivo) and Fieldnote (Figtree) use one font family for headings and text, so the
plan ships them as two files instead of three. But their headings are heavier than the text files cover.

**An example.** Broadsheet's headings go up to weight 900; its text file stops at 700. Measured: covering 900 makes
that file 1.3 KB bigger, while a third file for headings would add about 25 KB.

1. **Widen the text files to cover the headings (RECOMMENDED).** Still two files each, about 1 KB larger.
2. **Ship a third file for the headings.** About 20–25 KB more per site using them.
3. **Make those headings lighter** (stop at 700), so the files stay as listed.

**Ruled: option 1 (owner, 2026-10-03).** *"Widen the text files to cover the headings"* — recorded as R-232. Chivo's
body roman is clipped 400–900 and Figtree's 400–800; each pairing stays two files.

### Question 3 — How do we prove all thirty font pairings work before launch? (DW-313)

**In plain English.** The plan promises every one of the thirty pairings appears in the automatic photo check before
launch. The check photographs only three packs, and every pairing after the twelfth belongs to no pack at all.

**An example.** Pairing D25 (Anton with Inter) is in no pack, so today nothing would ever photograph it.

1. **One specimen photo per pairing (RECOMMENDED).** A small sample — a heading, a paragraph with bold and italic,
   numbers, accented letters such as "ą ő ş" — drawn once per pairing in Paper's colours, light, desktop. One extra
   photograph per pairing, checked on every full run.
2. **Narrow the promise** to the twelve pack pairings; the other eighteen are checked by file tests only.
3. **Photograph all twelve packs** instead of three — every section four times as many photographs.

**Ruled: option 1 (owner, 2026-10-03).** *"One specimen photo per pairing"* — recorded as R-233.

### Question 4 — Which three packs should the photo check use? (DW-169, DW-317)

**In plain English.** The photo check photographs every section in three packs, in light and dark, at every screen
size. They should be as different from each other as possible, so a section that only works in Paper gets caught.

**An example.** Today an outline-style button on a dark band would be invisible, and nothing notices, because only
Paper (solid buttons) is photographed.

1. **Paper, Mono and Neon (RECOMMENDED).** Paper is the default. Mono is the furthest from it — square corners,
   outline buttons, tight gutters, a typewriter-style text font. Neon is dark-first, with round corners, pill buttons
   and loose gutters.
2. **Paper, Tangerine and Ink** — the three the drawings show for every section, so photos can be held against
   drawings; but none of them uses outline buttons or different gutters.
3. **Three others** — name them.

**Ruled: option 1 (owner, 2026-10-03).** *"Paper, Mono and Neon"* — recorded as R-234. `REFERENCE_PACKS` is `paper`,
`mono`, `neon`; Mono sits off Paper's step on buttons and gutters (DW-317).

### Question 5 — Ink's heading font now comes only as an adjustable file. Cut the one weight Ink needs from it? (DW-311)

**In plain English.** The plan gives Ink's headings Libre Caslon Text as one fixed file at bold (weight 700). Google has
since replaced that family's fixed files with a single adjustable one that can draw any weight from 400 to 700, and the
font builder is told to stop when Google's files differ from the plan.

**An example.** Google used to ship `LibreCaslonText-Bold.ttf`; at the pinned version it ships only
`LibreCaslonText[wght].ttf`. Cut at 700, it gives exactly the one file the plan describes — 23.8 KB for English text.

1. **Cut a fixed weight-700 file from the adjustable one (RECOMMENDED).** The plan's table stays as written; Ink looks
   as the review page shows it (it was built this way so you can judge it).
2. **Change the plan to call it adjustable**, clipped to 700 only — the same bytes under a different label in the table.
3. **Give Ink a different heading font** — name it, from the pool or outside it.

**Ruled: option 1 (owner, 2026-10-03).** *"Cut bold from it"* — recorded as R-235. `tools/fonts/build-pool.py`'s
`STATIC_CUTS` names Libre Caslon Text, so D2's `S · 700` is cut from the variable file at 700; §D.c stays as written.

### Question 6 — Do you approve the twelve Style Packs' colours and settings? (Ask First)

**In plain English.** Each of the twelve packs now has its own colours for light and for dark, its two fonts and its own
corners, spacing, width, gutters, buttons, shadow and links. The review page shows every pack on the five sample sections,
in light and in dark, with its table of values. Nothing is saved until you approve.

**An example.** Tangerine's buttons are its orange `#E8450A` with near-black words, because white words on that orange
are too faint to read (3.97:1, below the 4.5:1 every pack holds).

1. **Approve all twelve as shown (RECOMMENDED).**
2. **Approve with changes** — name the pack and what to change, for example "Neon's dark accent bluer" or "Ocean with
   solid buttons"; the change is made and shown to you again.
3. **Redo some** — name which, and what is wrong with them.

**Ruled: option 1 (owner, 2026-10-03).** *"Approve all twelve"* — the presets are committed as the review page showed
them: Appendix D §D.d and `packages/library/packs/packs.json`, unchanged.

### Question 7 — Do you approve the new test photographs? (Ask First, the mass rebaseline)

**In plain English.** The automatic photo check now takes every section in Paper, Mono and Neon (your three reference
packs), and one sample photograph per font pairing. Every old photograph changes, because Paper's headings are now
Fraunces and every page loads Inflozo's own font files. The review page shows one section per kind, before beside after,
in light and dark, and a page of the pairing samples.

**An example.** The Latest Post hero's headline was drawn in a Georgia look-alike; now it is Fraunces, the font the
theme will ship — the layout does not move.

1. **Approve (RECOMMENDED).** The new photographs are saved in their own commit, after the code.
2. **Reject** — say what looks wrong; it is fixed as a defect and the photographs are taken again.

**Ruled: option 1 (owner, 2026-10-03).** *"Approve"* — the new baselines land in their own commit right after the Dev
commit, naming it, and the two are pushed together.

## Owner's manual test

Do this on the real site after Deploy confirms the build, on a laptop with the window at full width. Nothing here
changes your projects.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/pilots` | Pilots review | Open the **Pack** menu above the canvas. | — | Twelve packs in this order: Paper, Ink, Orbit, Tangerine, Slate, Meadow, Dune, Mono, Ocean, Berry, Neon, Quiet (R-231). Paper is chosen. |
| 2 | same | Pilots review | Pick each pack in turn; for each, switch **Light** then **Dark**. | — | The five sample sections take that pack's colours, fonts, corners and buttons. Every word is easy to read in both modes. Dark is its own palette, not the light one turned inside out. |
| 3 | same | Pilots review | Pick Mono, then Neon (two of your three reference packs), and switch to **Tablet**, then **Phone**. | — | Nothing runs off the side. On the dark bands, every button's words are readable. |
| 4 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Pilot sections | Click the grey area beside the page so nothing is selected. | — | The right panel reads **PAGE**, then a card: a large "Ag" in Paper's heading font, **Paper**, "Fraunces · Inter", five colour dots and a **Change** button. Under it, "Nothing selected". |
| 5 | same | Editor | Click **Change**. | — | The panel becomes **STYLE PACK** with a back arrow: Paper's card marked **Current**, then twelve small cells, three to a row, in step 1's order, each "Ag" in its own heading font, its name and four dots. Paper's cell has the coral ring. No pencils, no "+ New pack", no font or width rows. |
| 6 | same | Style Pack panel | Click Tangerine's cell. | — | Nothing changes. Choosing a pack arrives with Story 6.3. |
| 7 | same | Style Pack panel | Click the back arrow. | — | Back to PAGE, as in step 4. |
| 8 | same | Editor canvas | Look at the headings and paragraphs on the page. | — | Headings in Fraunces (softer, rounder than Georgia) and text in Inter — the same on any computer, even one without these fonts installed. |
| 9 | same | Editor | Click the page once, then press **Tab** until **Change** is outlined; press **Enter**; press **Tab** a few times; then **Escape**. | — | The panel opens with the back arrow outlined, the pack list reads out, and Escape brings you back with **Change** outlined. |
| 10 | same, in a second window | Editor, read-only | Open the same project in a second window and click **Change** there. | — | The list opens there too: looking is allowed while the other window edits. |

## Verification

**Commands:**
- `uv run tools/fonts/build-pool.py 2>&1 | cat` -- expected: every §D.c family fetched at the pinned commit, its
  licence OFL or Apache, `pool.json` written; run twice, `git status --short packages/library/fonts` empty after the
  second (byte-identical).
- `node --test packages/section-runtime/src/packs.test.ts packages/section-runtime/src/tokens.test.ts` -- expected:
  pass; the AA case red with one preset's on-accent swapped for white on Tangerine.
- `node tools/stress/test-vocabulary.mjs` -- expected: pass; red with one §D.d value changed, one §D.c weight changed,
  one woff2 byte flipped, and a `fonts.gstatic.com` line added to a test document (each restored and compared).
- `pnpm check` and `pnpm keyboard` -- expected: green.
- `pnpm build && node tools/check-traces.mjs` -- expected: "every route carries its files", the fonts included.
- `bash tools/matrix/run-matrix-gate.sh` before the rebaseline -- expected: red on moved and new photographs only, 0
  axe violations, nothing sideways; after the owner's review and `--update`, green.
- `python3 tools/doc-audit.py --check` (twice) and `bash supabase/tests/run-rls-gate.sh` -- expected: green; no
  migration in this story, so no Schema phase.

**Real services (R-82), at Review:**
- **app.inflozo.com** (signed in through `SUPABASE_URL` + `SUPABASE_SECRET_KEY` throwaway accounts, deleted after):
  `canvas?font=<a pool file>` 200 `font/woff2`, `canvas?font=../x` 404, `canvas?pack=mono` carries Mono's block,
  `canvas?pack=harbor` 404; the editor's and `/pilots`' network logs show no Google host; the New project window's
  Paper cell (a throwaway account under the project cap) draws its glyph from the pool; the walks
  (`run-verify-editor.cjs`, `-pilots`, `-controls`, `-lock`) re-run, since the faces move what they measure.
- **GitHub Actions and Vercel** (`GITHUB_TOKEN`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`): `check`, `rls`, `deploy` and
  `matrix.yml` green on the head; production READY from it.
- **github.com/google/fonts** (read-only, at the pinned commit): the builder's source; no key.
- Supabase schema, Resend, Dodo, T1 and T3 are not touched: no migration, no email, no billing, no theme.

**Dev's results (2026-10-03):**
- `uv run tools/fonts/build-pool.py 2>&1 | cat` — every §D.c family read at google/fonts `9710da1eacb3be272583c3224dcb70f9da6eadbb`,
  each OFL or Apache 2.0, `pool.json` written; run again from the download cache, `pool.json` and every file under
  `files/` and `licences/` byte-identical (sha256 listing compared). Every pairing within §D.a rule 5 as read; the
  heaviest is D15 at 165.1 KB of latin. Libre Caslon Text refused as variable-only until R-235's `STATIC_CUTS` entry.
- `python3 tools/fonts/build-pool.py --self-check` (new, in `pnpm test`) — pass; red with the licence refusal removed
  and red with the "static only" refusal removed (each a scratch copy).
- `node --test packages/section-runtime/src/packs.test.ts …tokens.test.ts` — pass; red with white words on Tangerine.
- `node tools/stress/test-vocabulary.mjs` — pass; red with one §D.d value changed, one §D.c weight changed, one woff2
  byte flipped and a `fonts.gstatic.com` line added to a test document, each restored and compared.
- `pnpm check` (Node 24) — exit 0. `pnpm keyboard` — 158 passed, the new 6.2 journey among them; that journey then
  gained the I/O matrix's read-only row (Change opens the list while reading along, with the Layers footer's greyed
  `+ Add section` as the control that the window really is reading along) and passed again alone (`--grep "6.2 ·"`).
- `pnpm build` — pass; `check-traces` passed on a scratch copy that counts untracked files (`/canvas` carries
  `packages/library/fonts`); CI's `check` job runs the real script on the committed tree.
- `bash tools/matrix/run-matrix-gate.sh --update` in the pinned image, then the gate — green on the new set: every
  design × Paper, Mono and Neon × light and dark × every viewport and row, plus one specimen per pairing; 0 axe
  violations, nothing sideways. The owner's sampled review approved it (Question 7).
- `python3 tools/doc-audit.py --check` twice and `bash supabase/tests/run-rls-gate.sh` — green (no migration).
- A side-by-side of Fraunces' optical sizes (scratch only): the size-matched cut doubles Paper's heading file
  (33.5 → 64.3 KB) for a small change at heading sizes, and the headline cut is too thin at card-title size, so §D.a
  rule 4 (non-`wght` axes pinned at their defaults) is kept as written — a routine call, no question.

**Real services in Dev (R-82):**
- **github.com/google/fonts** (`raw.githubusercontent.com`, read-only, no key) — `METADATA.pb`, licence and TTF for
  every §D.c family at the pinned commit: 200 for each file the builder reads; the upstream `fvar`s were read with
  fontTools (Fraunces `opsz` 9–144 default 9, `WONK` default 1; Libre Caslon Text `wght` 400–700 only).
- **claude.ai** — the owner's private review page (packs, before beside after, specimens), where he ruled Questions 5–7.
- Supabase, Vercel, Resend, Dodo, T1 and T3: not touched in Dev. app.inflozo.com, CI and Vercel READY are the Review's
  (above).

### Results — Review (2026-10-03)

Keys are named by their variable in `tools/probe/.env`, never by value. Node 24.18.1 throughout.

**What the verifier found first.** GitHub Actions on the Dev head `f509af7a` (read without a token; the repository is
public): `matrix.yml` run 37140453777 `matrix` **success**; `ci.yml` run 37140453790 `rls` **success**, `check`
**failure** at `pnpm keyboard`, `deploy` **skipped** — so nothing of Story 6.2 was on production, and `pnpm check`,
`pnpm build` and `check-traces` had never run in CI on this code. Reproduced locally on that head: `1 failed, 157
passed` — "NFR-6(d): the keyboard journey must use no pointer — found .click(". Dev's line above, "`pnpm keyboard` —
158 passed", was true before the read-only row was added and false for the committed tree. Control: `rls` and `matrix`
on the same commit read as success through the same query.

**The patched tree.**
- `pnpm keyboard`, whole, no `--grep`: **158 passed**, exit 0 — the no-pointer control and the 6.2 journey with its new
  Esc-from-the-Layers-list row among them.
- `pnpm check`: exit 0. `pnpm build`: exit 0. `node tools/check-traces.mjs`: "every route carries its files" — the real
  script on the working tree, which Dev could only run on a scratch copy.
- `node tools/stress/test-vocabulary.mjs`: pass, the three re-made controls included. `python3
  tools/fonts/build-pool.py --self-check`: pass.
- `apps/web/frame-guard.test.ts`' new route test: pass; **red** with the hash check removed from the route (the
  control), then restored.
- Signed out, against production (pre-6.2 code, so the guard only): `canvas?font=…`, `?font=../x`, `?pack=mono` and
  `?pack=harbor` each answer 303 to `/sign-in` with an empty body; control `/sign-in` 200.

**Real services (R-82), on the Review commit `42788c15` once it deployed.** Run in the main session: the verifier's own
key reads were refused by the permission classifier, and the head it was given was not deployed.
- **GitHub Actions** (public API, no key): `ci.yml` run 37142385337 `check` **success**, `rls` **success**, `deploy`
  **success**; `matrix.yml` run 37142385315 `matrix` **success** (every design: shared inputs changed).
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, asked by each walk before it starts): `dpl_4JHp53XgvXZ4vpTtbG9pzQp2541V`
  READY, built from `42788c15`.
- **app.inflozo.com, signed in** (`SUPABASE_URL` + `SUPABASE_SECRET_KEY`, a throwaway account, deleted, users 13 → 13)
  — a scratch probe in the shape of `run-verify-pilots.cjs`, every line PASS:
  - `canvas?font=alegreya-roman-latin.woff2&h=<its hash>`: 200, `font/woff2`, `private, max-age=31536000, immutable`,
    `nosniff`, 55,892 bytes whose sha256 is `pool.json`'s. The same file with no hash and with another hash: 200,
    `no-store`. `?font=../x`, `?font=..%2F..%2Fpackage.json`, `?font=nope.woff2`: 404.
  - `canvas?pack=mono`: Mono's light background and only Archivo / IBM Plex Mono `@font-face` rules; `?pack=harbor`: 404.
  - `/pilots`, the Pack menu at Paper, Mono and Neon × Light and Dark, every pilot in turn: the canvas wears the
    preset's own background in each mode and its heading and body families are LOADED faces in the canvas document
    (Fraunces / Inter, Archivo / IBM Plex Mono, Unbounded / Inter), none in error.
  - The signed-in document declares the pack faces as `Inflozo pack <family>` at `/canvas?font=`, never `Inter` or
    `Bricolage Grotesque`; the New project window's "Ag" (opened on `/start`) is set in `Inflozo pack Fraunces` and
    that face is loaded.
  - The network log over all of it: no request to `fonts.googleapis.com` or `fonts.gstatic.com`; every `?font=`
    response 200 `font/woff2`. **Control:** the same recorder sees a request made on purpose to `fonts.gstatic.com`.
- **The walks**, each on that deployment, each with its own throwaway accounts deleted: `run-verify-controls.cjs` 0 FAIL
  of 115; `run-verify-pilots.cjs` 0 FAIL of 152; `run-verify-lock.cjs` 0 FAIL of 86; `run-verify-editor.cjs` 0 FAIL of
  690, first run, no stall noted — its step 5 CSP session (zero violations, `EvalError` controls) covers the editor's
  canvas, where a request to a font host would be a violation.
- **Not touched, by the diff:** no migration (`git diff --name-only 3f6449a3 HEAD -- supabase/` is empty; the one new
  read is `projects.style_pack`, a column of Story 1.2's schema), no Resend, no Dodo, no T1 or T3.
