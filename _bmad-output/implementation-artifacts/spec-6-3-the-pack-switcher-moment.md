---
title: 'Story 6.3 — The pack-switcher moment'
type: 'feature'
created: '2026-10-04'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md']
---

## In plain English

After this story you can choose your project's Style Pack: press any of the twelve in the editor's Style Pack list and
the whole page restyles in front of you — the old look fades into the new in under a third of a second while a small
dark label at the top says "Trying on Tangerine…" — and ⌘Z puts the old one back. You can also pick the pack in the New
project window before a project exists, let Site Remix roll a random pack (or a pack and new designs together, still one
⌘Z), and reach the list from the ⋯ menu on a tablet or a narrow window. The choice is saved with the rest of your work,
so the project reopens in it, its card on Projects wears its colours once it is synced, and the Add section previews and
the colour dots in a section's settings show the pack you chose.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 6.2 lets a project's Style Pack be looked at and never chosen: no cell switches, the editor's canvas,
its previews and its swatches always draw Paper, and a pack change has no place in the undo journal or the save although
FR-D9 and `addendum.md` §AD1 name it an edit. The New project window offers Paper alone and the list cannot be reached
below 1280 (DW-322), Site Remix cannot re-roll the pack (DW-314), the card and the list have only ever run on Paper
(DW-325), and the font pool's whole record rides into every client page that draws a canvas or a pack cell, through
the section runtime's own index (DW-323, measured below).

**Approach:** A pack change becomes an edit — one journal transaction under its own key, sent with the docs to
`sync_project_doc` (which gains the preset, one compare-and-set, one revision — a Schema phase first, R-99) and kept or
replaced at a hydrate exactly as the docs are. The canvas document opens in the project's pack and every later change
restyles it in place inside the document's own view transition (300 ms; instant under reduced motion), with S7b's pill
and a polite announcement, while the previews, the swatches, the card and the list follow. The list's cells switch;
Remix gains B8's "Re-roll what" (Both is one transaction); the New project window offers the twelve as D4a draws them;
⋯ reaches the list below 1280; and no client page carries the pool's record any more, checked on the build.

## Boundaries & Constraints

**Always:**
- **A pack change is ONE edit** (FR-D9, §AD1, AD-16): one journal transaction through `commit`'s one door — so a reading
  window writes nothing (R-192) — one ⌘Z, and one in `unsyncedEdits`. The journal holds the preset id alone
  (`style_pack.preset`); `brand`, and any key a later story adds, is never written by the editor.
- **Remix's Both is ONE transaction** across the canvas doc and the pack, so undo and redo take it whole (R-161's
  `txn`-grouped undo). The journal's depth counts transactions, and a trim never splits one (FR-D9's 100 steps are edits).
- **One save writes both.** The flush sends the pending docs and the pending preset in one `sync_project_doc` call: one
  compare-and-set, one revision bump; a refused call writes neither. The sync route accepts only a preset this build knows.
- **A hydrate treats the pack as it treats the docs** (§AD1.1): equal revisions keep this device's pack and its journal,
  a different revision or a take-over takes the server's, and a window opened reading along adopts nothing (DW-203).
- **The canvas document is asked for once per editor mount, in the pack in force** (`&pack=`; Paper's address is
  unchanged), **and never reloaded for a switch** — a switch replaces its token block and its `@font-face` rules in place.
- **Every change of the pack in force by a gesture** — a cell, Remix, ⌘Z, ⇧⌘Z — restyles the whole canvas inside the
  canvas document's own `startViewTransition`: a 300 ms crossfade where the browser offers it and motion is allowed, and an
  instant change under `prefers-reduced-motion` (the canvas stylesheet's own degrade) or where the API is absent — never a
  removed affordance (UX-DR15). The new picture is taken once the pack's latin faces are in, waited for at most
  `FACES_WAIT_MS` (1,000 ms). A hydrate's correction is instant and says nothing.
- **From the press until the canvas has landed, S7b's pill says "Trying on {name}…"; once landed, `#editor-said` says
  "Style Pack — {name}"** once per gesture (UX-DR12). A later press supersedes an earlier one that has not landed.
- Section Picker previews, the design ring's tiles and the Controls panel's swatches wear the pack in force, as do the
  rest card and the list.
- **No client module imports `@inflozo/library/packs` or `lib/style-pack.ts`, and the runtime's index imports neither**:
  client pages are handed the twelve as server-derived data — names, glyph faces, dots, swatches, and each pack's canvas
  token block and `@font-face` rules — and nothing else of the pool (DW-323).
- One word list (R-170): "Style Pack" everywhere; the sentences live in `lib/pack-switch.ts` and `lib/remix.ts`, and every
  surface and check reads them. Counts are derived, never written down (standing rule 4). Node 24. `pnpm keyboard` is run
  whole before the Dev commit, never with `--grep` (Story 6.2's Review).

**Ask First:**
- The production apply of the migration: if the permission classifier refuses it, ask the owner in the session — never
  route it through a subagent.
- Anything that moves a pixel the render matrix photographs (none is expected: the crossfade's rules are inert at rest) —
  a rebaseline needs the owner's sampled review (`docs/render-matrix.md`).
- Any change to undo, redo or the flush beyond the pack's key and the transaction grouping.

**Never:**
- No hover preview: S7a draws Tangerine's cell hovered over an unchanged Paper canvas, and FR-E2 says *switching*.
- No pencil, "+ New pack", custom cell, pack-level rows, font list or colour picker (Story 6.4, DW-310); no brand seed
  or sixth dot (6.6); no change to mode resolution (6.5); no theme emission (Epic 7).
- No "Re-roll where", "Every page" or header-and-footer choice (R-161), no toast (EXPERIENCE.md:541), and no "Re-roll
  what" on `/controls`, which holds no pack.
- No second canvas document for the crossfade, no iframe reload for a switch, no `next/font`, no font host, no
  `*-tokens.css` file, no edit to the design export (R-74).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A press | Paper in force; Tangerine's cell pressed (holder, motion allowed) | one transaction `paper → tangerine`; the pill from the press; a 300 ms crossfade once Tangerine's latin faces are in; Current card, ring, rest card, previews and swatches all Tangerine's; "Style Pack — Tangerine" once landed | — |
| The pack in force | its own cell pressed | nothing: no entry, no pill, no announcement | — |
| Faces not yet fetched | a pack this browser has never drawn | the canvas holds its picture while the faces load, the pill showing; then the crossfade | after 1,000 ms the crossfade goes on and a late face swaps in on arrival (`font-display: swap`) |
| Reduced motion | `prefers-reduced-motion: reduce` | the same change, instant — no transition animation runs — and the same announcement | — |
| No View Transitions | `startViewTransition` absent | the same change, instant | — |
| Two quick presses | Tangerine, then Neon before Tangerine lands | two entries; the canvas lands on Neon and never on Tangerine after it; one announcement, Neon's | — |
| Undo, redo | ⌘Z after a switch, then ⇧⌘Z | the previous pack, crossfaded and announced; redo the same forward | — |
| Read-only | another window holds the lock | Change opens the list; every cell greyed and unclickable; nothing journaled | `commit`'s guard |
| Reload, unsynced | a switch not yet sent; F5 | opens in the switched pack (local record, equal revision); ⌘Z still undoes it | — |
| Another session's switch | the server's revision moved | the server's pack; the journal cleared | — |
| A record from before 6.3 | a local record with no `preset` | the server's pack | — |
| Pack-only flush | the preset pending, no doc pending | `{ base, docs: {}, preset }` → `style_pack.preset` written and the revision +1 in one transaction; `brand` untouched | — |
| Unknown preset | a body naming `harbor` | 422; nothing written | — |
| Conflict | a stale base | 409; neither docs nor preset written; a body already equal to the server (docs and preset) is adopted, 200, as today | — |
| A non-object `style_pack` | a scalar written by hand through the owner grant | the RPC replaces it with `{ preset }` — never an error the editor retries for ever | — |
| Sign-out with a pack owed | R-214's flow | the preset is sent with the docs | R-214's ask when it cannot be |
| Remix · Style Pack | Style Pack chosen, Remix | a different preset, uniformly from the others; one entry, one ⌘Z; "Remixed the Style Pack — {name}." | — |
| Remix · Both | a canvas whose rings move | designs and pack in ONE transaction; one ⌘Z restores both; one announcement | a design refusal writes neither (FR-D9) |
| Remix · no ring moves | every ring length 1 (the owner's projects) | "Re-roll what" opens on Style Pack; Designs and Both greyed with the reason; Remix live | — |
| New project | Neon chosen, Create project | `style_pack = { preset: 'neon' }`; the card wears Neon; the editor opens in Neon | a value that is no preset → Paper (`presetIdOf`'s rule) |
| Below 1280 | ⋯ → Style Pack | the Controls overlay on the list; a press switches; Esc and ✕ close it | absent on a template surface |
| A stored non-Paper pack | `style_pack.preset = 'mono'` | the editor opens in Mono: canvas, card, list, previews, swatches | an unknown id → Paper |
| Take-over | a switch unsynced | counted in the edits B5b and B5c name (AD-16) | — |

</frozen-after-approval>

## Code Map

**The journal, the local record and the save (Story 5.8's, AD-15/AD-16):**
- `apps/web/lib/journal.ts` — the header already says a Style Pack change goes through `commit()` (:9-11). `JournalEntry`
  :33 (`docKey`, `before`/`after: ProjectDoc`), `DEPTH` :30 (entries today), `append` :83, `Restore` :106 (one doc),
  `undo` :109 / `redo` :121 (one entry), `unsyncedEdits` :141 (counts `txn` — already ready for a grouped transaction),
  `flushPayload` :179 (skips a pending key with no doc — so a pack key would never be sent), `OwedRecord` / `owedOf` /
  `sendBody` :296-307 (owes nothing when it has no doc), `ownFlushLanded` :429. `journal.test.ts` is its home.
- `apps/web/lib/local-store.ts` — `LocalRecord` :31 (`baseRevision`, `docs`, `auto`, `journal`).
- `projects/[id]/sync/route.ts` — `TEMPLATE_KEY` :46, the body :64, "Nothing to write" :71, the RPC :109, the
  "already there" read :124. `editor.test.ts:355` reads this route's source.
- `supabase/migrations/20260919120000_doc_sync_and_template_key_shape.sql` — `sync_project_doc(p_project, p_docs, p_base)`
  (CAS, `for update`, upserts, revision, `{applied, revision}`; grants). `RLS-TEST.sql` :1422-1572 is its proof, copied to
  `supabase/tests/rls.sql`. Story 5.20's Schema commit `dbc57c12` is the pattern (SQL, `SCHEMA.sql`, both RLS files, applied
  through `SUPABASE_DB_POOLER_URL` and read back). `20260929120000_session_guard.sql` is the `notify pgrst` precedent.
- Production, read at Create (`SUPABASE_URL` + `SUPABASE_SECRET_KEY`): every project stores `{preset: 'paper'}` or
  `{brand, preset: 'paper'}` — so the write must set `preset` and leave `brand` (it is `projects.style_pack`, owner-writable,
  `jsonb not null`).

**The editor** (`apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/`):
- `editor.tsx` — the ABSENT note :297-303 (names the switch 6.3's); props :760-786 (`stylePack`); `packList` :799-811;
  `commit` :1463, `heldBack` :1491 (the read-only guard), `store` :1543, `journalise` :1561, `restore`/`restored`
  :1580-1625, `onUndo`/`onRedo` :1627; `flush` :1673; `flip` :2254 (sets `data-mode` on the canvas `<html>`); `paint`
  :2752; `run` :3207; `onEscape` :3280 (the list's rung :3303); the hydrate :3603-3690; the unmount and tab-hide flushes
  :3708-3735; `onRemix` :4268 (one `apply`, `remixSaid`); the ⋯ rows `more` :4614; `<RemixDice>` :4931 inside
  `ReadOnly`; the canvas `<iframe>` :5173 (`src` from `canvasSrc`); the right panel :5314 (its name `'Style Pack'` while
  the list is open), the list :5467, the rest card :5473; `#editor-said` :5488.
- `style-pack.tsx` — 6.2's card, head and list (imports the library's presets and runs `packTokens` for all twelve at
  import, DW-323); cells are `PackCell`s in a `<ul>`, not buttons.
- `read.ts` — selects `style_pack` :67; `EditorData.stylePack` :162; `swatches: referenceSwatches('light' | 'dark')` :332
  (Paper only); hands `stylePack` :353.
- The design ring's list is the pattern for a pressable grid (`components/editor/design-picker.tsx:186-230`):
  `role="listbox"`, each a `button role="option"` with `aria-selected`, one tab stop, and the Kit's `gridKeys`
  (`components/controls/icon-picker.tsx:113`) for the arrows — so an arrow moves focus and never writes an edit.
- `components/kit/pack-cell.tsx` — `PackCell` (a `<div>`; its active ring and the sr-only ", Current").

**The canvas and its previews:**
- `lib/canvas.ts` — `canvasSrc` :172, `previewSrc` :186 (no pack); `components/editor/section-preview.tsx:197` builds every
  Section Picker card and ring tile from it.
- `(authed)/canvas/route.ts` :63-66 and `app/harness/canvas/route.ts` already answer `?pack=` (404 for an unknown id); `lib/pilots.ts`
  `packHead` :151 (Paper = `reference-tokens.css`'s bytes), `pilotsCanvasDocument` :186 (`1-tokens`, `1b-faces`).
- `lib/canvas-chrome.css` — the canvas document's own stylesheet (`4-editor`); its reduced-motion degrade :66-72 and the
  swap settle :75-103 are the precedent ("`globals.css`'s reduced-motion block cannot reach this document").
- `lib/controls-review.ts` `referenceSwatches(mode, pack)` :99 — any preset's Background dots (6.2, used by `/pilots`).

**DW-323, measured at Create** on Story 6.2's production build (`apps/web/.next`, BUILD_ID `c2bHvYPslmwdi_VIP5HsKSun`): the
pool rides as a 43,217-byte `JSON.parse` literal carrying all 134 of its files' sha256s in two client chunks —
`0bebwu-me1gyy.js` (51,919 B, `/start`) and `3fqh80dol2fgc.js` (52,656 B: the dashboard, both editor routes, `/pilots`,
`/controls` and both harness editor routes). `/controls`' client imports nothing of `lib/style-pack.ts`, so the runtime's
own index carries it: `packages/section-runtime/src/tokens.ts:19` imports `presetOf` for `REFERENCE_PACK` :156 (and
`REFERENCE_TOKENS` :326 is computed from it), `fonts.ts:10` imports `POOL`, and `index.ts` re-exports both (:42, :45, :48).
Server-side importers that move with them: `lib/pilots.ts:14`, `lib/style-guide.ts:23`, `lib/controls-review.ts:15`,
`tools/matrix/cases.mjs:40,92`, `tools/stress/test-vocabulary.mjs:32`, `tokens.test.ts:13`, `packs.test.ts:10-11`.
- `lib/style-pack.ts` — client importers today: `new-project-sheet.tsx:13` (`PRESETS`), `lib/canvas-layer.ts:20`
  (`PACK_FAMILY_PREFIX`), `(editor)/style-pack.tsx:10`; server importers: `(authed)/layout.tsx:6`, `harness/editor/layout.tsx:12`,
  `placeholder.tsx:1`, `sites/actions.ts:35`, `projects/actions.ts:7`, `lib/pilots.ts:19`, `tools/matrix/cases.mjs:42`.
- `tools/check-traces.mjs` runs straight after `pnpm build` in CI (`.github/workflows/ci.yml:66`) — the post-build home.

**Site Remix (Story 5.12):** `lib/remix.ts` (`remixPicks`, `remixFold`, `remixAsk`, `NOTHING_TO_REMIX`, `remixSaid`);
`components/editor/remix-dice.tsx` (the confirm; its header :34-40 names the absent group); `lib/ring.ts` `shuffleTo` (a
different member, uniform). Checks that assert the group ABSENT and must change: `tools/keyboard/journey.spec.mjs:1336`,
`tools/probe/run-verify-editor.cjs:4179-4190` (step 88, on a project where no ring moves). `run-verify-controls.cjs:734-740`
stays (no pack on `/controls`).

**The New project window:** `(authed)/new-project-sheet.tsx` — the Style Pack row :220-233 (one Paper cell, outside the
`<form>` :236); mounted by `(dashboard)/page.tsx:207` and `start/page.tsx:75`. `projects/actions.ts` `createProject`
:135-153 writes `style_pack: defaultStylePack()`. `tools/probe/run-verify-dashboard.py` drives the sheet through First
Run's Blank door (:268-300, including its "centred" check). The owner's account is on Free and past its project
allowance (read at Create), so his New project window is D4b.

**Below 1280:** Story 5.22's ⋯ menu `more` (`editor.tsx:4614`: Remix, Dark mode, Device, Theme settings, Preview; a row
calls its control's own handler, R-141); the Controls overlay opens for a selection only.

**DW-325's other two:** `(authed)/layout.tsx:62-66` (`onApp` → `/canvas` or `/app/canvas`), `lib/canvas-layer.ts:82`
(skips `PACK_FAMILY_PREFIX` faces); `canvas-layer.test.ts` is the latter's home. The harness fixture's pack
(`app/harness/editor/layout.tsx:212-213`, always `DEFAULT_PRESET`) and its request-header knobs (`x-inflozo-harness-*`,
its header comment :58-79).

**The frames:** `S7 Style Packs.dc.html` S7b :136-298 — the canvas's two pages stacked, Paper at .35 under Tangerine at
.82 (:175, :224); the pill :273 (ink, white 12/500, 6×13 padding, 24 radius, a 6 px marigold dot, 14 px below the canvas's
top, centred); the panel with Tangerine as Current and its cell ringed (:281-286); S7a :111-121 (Tangerine's cell drawn
HOVERED, `box-shadow: 0 4px 16px`, over a Paper canvas). `D4 Dashboard Sheets and Blocks.dc.html` D4a :107-117.
`B Missing Surfaces.dc.html` B8 :1587-1622 (the "Re-roll what" cards :1594-1601, Designs selected). `D8 Editor Below
1440.dc.html` D8a's ⋯ menu :280-293.

**Propagation targets:** `deferred-work.md` DW-314 (:8543), DW-322 (:8663), DW-323 (:8682), DW-325 (:8714);
`EXPERIENCE.md:895` (the journey's "hovers Tangerine"); `addendum.md` §AD1's "Cloud sync" line (:22); `ARCHITECTURE-SPINE.md`
AD-15's flush contract (:212) and the FR-E row (:645); `epic-6-context.md`; the comments that name the switch "6.3's"
(`style-pack.ts`, `pack-cell.tsx`, `new-project-sheet.tsx`, `editor.tsx`, `remix-dice.tsx`, `canvas/route.ts`, `pilots.ts`).

## Tasks & Acceptance

**Execution:**
- [ ] **SCHEMA FIRST, ALONE (R-99)** — `supabase/migrations/20261004120000_sync_style_pack_preset.sql`,
  `…/architecture-Inflozo-2026-08-19/SCHEMA.sql`, `RLS-TEST.sql`, `supabase/tests/rls.sql`:
  - `sync_project_doc(p_project uuid, p_docs jsonb, p_base bigint, p_preset text default null)` REPLACES the three-argument
    function in one transaction (`drop function if exists …(uuid, jsonb, bigint)`, then `create or replace`), re-runnable,
    the same grants, ending `notify pgrst, 'reload schema'`. On a matching base it upserts the docs and, when `p_preset` is
    not null, sets `style_pack` to `jsonb_set(style_pack, '{preset}', to_jsonb(p_preset))` — or `{"preset": p_preset}` where
    `style_pack` is not an object — then bumps the revision once.
  - The RLS proof gains a Story 6.3 block: a preset-only call applies, revision +1, `brand` untouched; a stale base writes
    neither docs nor preset; a null preset leaves `style_pack` alone; a scalar `style_pack` becomes `{preset}`; another
    user's project answers null; anon cannot execute it (42501); exactly one `sync_project_doc` exists in `pg_proc`.
  - Apply it through `SUPABASE_DB_POOLER_URL` and read it back. Then, before any code, prove the deployed code still saves:
    a three-argument call over PostgREST as a throwaway user on its own project answers `{applied: true}`, and a
    four-argument call writes the preset (the user deleted after). Push `Story 6.3 - Schema - …`.
- [ ] `packages/section-runtime/src/reference.ts` (new), `tokens.ts`, `index.ts`, `package.json` `exports` --
  `REFERENCE_PACK`, `REFERENCE_TOKENS` and `referenceTokensCss` move to `@inflozo/section-runtime/reference`, so `tokens.ts`
  imports no library; `fontFaceCss` leaves the index (it stays on `./fonts`); every importer named in the Code Map follows
  (`reference-tokens.css` byte for byte unchanged) -- DW-323: the index every canvas client imports carries no pool
- [ ] `apps/web/lib/pack-switch.ts` (new, pure; its one import is `lib/ring.ts`) -- `PACK_FAMILY_PREFIX` (moved here;
  `style-pack.ts` and `canvas-layer.ts` import it), `FACES_WAIT_MS = 1000`, the words (Design Notes' table), and `otherPreset(ids,
  current, random)` through `shuffleTo` -- the client's one home for the switch, reachable by `node --test`
- [ ] `apps/web/lib/style-pack.ts` -- the server's one home of the presets, imported by no client module: `packChoices()`
  — per preset in §D.d's order its id, name, the two family names, glyph family, cell dots (background, accent, text,
  plate), card dots (background, surface, accent, text, plate), `swatches` per mode (`referenceSwatches`), and its canvas
  `tokens` (Paper's = `reference-tokens.css`) and `faces` (`fontFaceCss(pairing, fontHref('canvas'))`) — and `packCells()`
  (id, name, glyph family, D4a's three dots); a type-only `PackChoice` for clients; the header says choosing is built --
  one derivation, so every surface paints a pack as the canvas does
- [ ] `apps/web/lib/journal.ts` -- `PACK_KEY` (`'style-pack'`, never a template key) and a pack entry (`before`/`after`
  preset ids) beside doc entries (persisted doc entries keep their shape); undo and redo take the head's whole `txn`;
  `Restore` carries every doc of it and the preset; `DEPTH` counts transactions and a trim keeps a transaction whole;
  `flushPayload` answers the docs and the pending preset; `owedOf`/`sendBody` carry the preset (a pack-only record owes);
  `ownFlushLanded` compares the preset -- FR-D9's "Style Pack changes", R-161's grouped undo
- [ ] `apps/web/lib/local-store.ts` -- `LocalRecord.preset?: string` (absent in a record written before 6.3 → the
  server's) -- the device holds the pack with the docs
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/sync/route.ts` -- an optional `preset` in the body, refused 422 unless
  `presetOf` knows it; a body with a preset and no docs is a write; `p_preset` passed; the "already there" read compares
  `style_pack.preset` too -- one door, one compare-and-set
- [ ] `apps/web/journal.test.ts`, `apps/web/pack-switch.test.ts` (new) -- the I/O matrix's pure rows: a pack entry undoes and
  redoes; a two-entry `txn` undoes and redoes whole and counts one edit; a trim never splits one; a pack-only flush payload;
  `ownFlushLanded` with a pending preset; a pre-6.3 record; `otherPreset` never answers the current and reaches every
  other; the words' singular and plural
- [ ] `apps/web/lib/canvas.ts`, `components/editor/section-preview.tsx` -- `previewSrc(src, designId, pack)` and the
  editor's opening address carry `&pack=` for any preset but Paper -- previews wear the pack in force; Paper's cached
  addresses never change
- [ ] `apps/web/lib/canvas-chrome.css` -- `::view-transition-group(root)`, `-old(root)`, `-new(root)` at 300 ms, and the
  reduced-motion block setting all three to `animation: none` -- the crossfade and its degrade, inert at rest
- [ ] `(editor)/read.ts`, `app/harness/editor/layout.tsx` -- hand the editor `preset` (`presetIdOf(style_pack)`) and `packs`
  (`packChoices()`) in place of `stylePack` and Paper's `swatches`; the harness takes `x-inflozo-harness-pack: <id>` as
  its stored pack (default Paper) -- DW-325: a journey can open on a pack that is not Paper
- [ ] `(editor)/style-pack.tsx`, `components/kit/pack-cell.tsx` -- fed by `packs`, no library or runtime import; the list
  is a listbox of option cells (the design ring's pattern, 3 columns, Enter or a press switches, the current option the
  one tab stop); inside the panel's `ReadOnly` a reading window greys every cell (R-192) -- S7a's cells, pressable
- [ ] `(editor)/editor.tsx` -- the pack in force as state beside the docs (`latest`); `commitPack(preset, txn?)` through
  `heldBack` and `journalise`; `restored` applies a preset; `store` saves it; the hydrate keeps or replaces it with the
  docs; `flush` sends it; the iframe asked for once in the opening pack; a gesture's change swaps `1-tokens` and `1b-faces`
  in the canvas document inside `startViewTransition` (where offered) whose update awaits `document.fonts.load` of the
  pack's heading and body families over latin text, up to `FACES_WAIT_MS`, superseding a change not yet landed; S7b's pill
  over the canvas from the gesture to landing (`aria-hidden` — the announcement speaks); the announcement once landed;
  swatches from `packs`; `onRemix(what)` (Both = one `txn` over `apply`'s doc and the pack); ⋯ gains a **Style Pack**
  row before Theme settings (not on a template surface, live while reading) opening the overlay on the list; the ABSENT
  note names what is built -- the moment, and every way into it
- [ ] `apps/web/lib/remix.ts`, `apps/web/components/editor/remix-dice.tsx` -- B8's "Re-roll what": three radio cards,
  Style Pack · Designs · Both, above the buttons, offered only where a pack can be re-rolled (`packs` passed); Designs
  selected when a ring moves, else Style Pack with Designs and Both greyed in P0-0's treatment and the reason beneath; the
  sentence and the announcement follow the choice; `onRemix(what)` -- DW-314, FR-D17's scoped re-roll
- [ ] `(authed)/new-project-sheet.tsx`, `(dashboard)/page.tsx`, `start/page.tsx`, `projects/actions.ts` -- the row
  takes `packCells()`: twelve native radios (`name="preset"`, inside the form) drawn as D4a's cells in its three-column
  grid, Paper checked, the ring on `:checked` and the Kit's focus ring on the focused cell; the sheet scrolls inside itself
  where the window is short; `createProject` writes `{ preset }` for a known preset, else Paper -- DW-322's first door
- [ ] `(authed)/layout.tsx`, `apps/web/lib/canvas-layer.ts`, `apps/web/canvas-layer.test.ts` -- the host → font address
  rule becomes a named function a test calls; a test holds that `Inflozo pack *` faces are never copied into the canvas --
  DW-325's two unchecked rules
- [ ] `tools/check-traces.mjs` -- after the build: no `.next/static` chunk contains `licenceFile` or any sha256 in
  `pool.json`; seen red on the pre-change build (two chunks, 134 each) -- DW-323 held in CI
- [ ] `tools/keyboard/journey.spec.mjs` -- the switch by keyboard (Change, the current option, arrows, Enter): the
  transition observed with 300 ms animations, "Style Pack — {name}" said, Current and ring moved, the canvas's `--bg-page`
  the pack's; ⌘Z and ⇧⌘Z; reduced motion (no animation, same announcement); the harness opened on Mono (the knob): card,
  list, canvas and a Section Picker card in Mono; Remix Style Pack and Both, one ⌘Z each; at 720 × 900, ⋯ → Style Pack →
  the list; the 5.12 line asserting no "Style Pack" replaced
- [ ] `tools/probe/run-verify-editor.cjs`, `run-verify-pilots.cjs`, `run-verify-dashboard.py`, `run-verify-lock.cjs` --
  production: step 88 reads "Re-roll what" opening on Style Pack with Designs and Both greyed, and a pack re-roll that one
  ⌘Z undoes; a switch, ⌘S, then `projects.style_pack.preset` and the revision read back (a seeded `brand` untouched) and a
  fresh context opening in the pack; the route's 422 for an unknown preset; `/pilots`' Pack menu reaching the canvas
  document (DW-325); First Run's sheet creating a project in Neon, read back; a reading window's cells greyed -- R-82
- [ ] `deferred-work.md`, `epic-6-context.md`, `EXPERIENCE.md:895`, `addendum.md` §AD1, `ARCHITECTURE-SPINE.md` (AD-15,
  the FR-E row), the comments named in the Code Map -- DW-314, DW-322, DW-323, DW-325 closed with their proof; the journey
  says "presses"; the flush carries the preset; then grep for `fontFaceCss`, `REFERENCE_PACK`, `REFERENCE_TOKENS`,
  `previewSrc(` and "6.3's" (standing rule 7) -- the ledger closes on evidence

**Acceptance Criteria:**
- Given a press, when the canvas is mid-switch, then the editor **matches S7b** (`S7 Style Packs.dc.html:136-298`): the old
  look fading under the new across the whole canvas, the ink pill "Trying on {name}…" with its marigold dot centred 14 px
  below the canvas's top, and the panel already showing the new pack as Current with its cell ringed — with R-231's names,
  and without S7b's pencils, custom cell, "+ New pack" and pack-level rows (Story 6.4).
- Given the list, when it is reached by keyboard, then it is one tab stop on the current pack, the arrows move focus
  across the three columns without switching, Enter switches, Esc returns to Change — and a pointer press does the same.
- Given any switch, when it lands, then the transition's animations last 300 ms (FR-E2), none run under reduced motion,
  and the Section Picker cards, the design ring's tiles and the Controls panel's Background dots are the new pack's.
- Given the Remix dialog in the editor, when it opens, then it **matches B8 as re-specified**
  (`B Missing Surfaces.dc.html:1594-1601`): "Re-roll what" with Style Pack · Designs · Both as radio cards above the
  buttons, without "Re-roll where" (R-161) and without the toast; and one ⌘Z undoes any of the three.
- Given the New project window below the cap, when it opens, then its Style Pack row **matches D4a**
  (`D4 Dashboard Sheets and Blocks.dc.html:107-117`): "Style Pack" and "Change it any time, in any project.", the twelve
  in §D.d's order in the three-column grid, Paper ringed — without the pencils and "+ New pack" — and the project created
  is in the pack chosen.
- Given a window below 1280 or a touch tablet, when ⋯ is opened, then a **Style Pack** row opens the Controls overlay on
  the list — extrapolated from D8a's overflow menu (`D8 Editor Below 1440.dc.html:280-293`, R-74).
- Given a project whose stored pack is not Paper, when the editor opens, then the canvas, the rest card, the list, the
  previews and the swatches are that pack's — shown by a check (DW-325), as are `/pilots`' Pack menu, the layout's font
  address and the canvas chrome's skipping of pack faces.
- Given `pnpm build`, when `node tools/check-traces.mjs` runs, then no client chunk carries the font pool's record and the
  runtime's index imports no preset or pool (DW-323).
- Given a switch on production, when ⌘S lands, then `projects.style_pack.preset` holds it, `brand` is unchanged, the
  revision moved by one, and a fresh browser opens the project in it.
- Given the story's changes, when the gates run, then `pnpm check`, `pnpm keyboard` (whole), `pnpm build && node
  tools/check-traces.mjs`, `bash supabase/tests/run-rls-gate.sh`, `bash tools/matrix/run-matrix-gate.sh` (no rebaseline) and
  `python3 tools/doc-audit.py --check` are green.

## Spec Change Log

## Design Notes

**Why the pack rides the journal.** FR-D9 lists "Style Pack changes" in the undo history, §AD1 counts "a Style Pack change"
as one edit, AD-16 makes every edit one transaction counted in `unsynced_edits`, and `journal.ts`'s own header says 6.3's
change goes through `commit()`. FR-D17 then asks one ⌘Z for a pack re-roll. A pack written straight to the column (as
`dark_enabled` is, from the settings page) could not be undone, and without the revision moving, a device whose revision
still matched would keep its old pack over the server's. So the pack is a journal key like a doc, and the RPC writes it
in the same transaction as the docs. Only `preset` is journaled and written (`jsonb_set`), because "Use your brand" writes
`brand` into the same column from the Sites page without the editor.

**Why `txn` grouping and not a wider entry.** Persisted journals hold `{ seq, txn, docKey, before, after }` entries; a
grouped transaction keeps every stored entry valid, and `unsyncedEdits` already counts `txn` (R-161 anticipated it).

**The crossfade, executed at Create** in Chromium 1228 through the repository's Playwright 1.61.1 (a same-origin page and
frame, scratch only):
- `frame.contentDocument.startViewTransition(…)` called from the parent crossfades the frame's document. With the
  three pseudo-elements at 300 ms it finished in 332 ms. The group's default is 250 ms, so it is named too.
- Under `reducedMotion: 'reduce'` Chromium still animates. With the canvas sheet's degrade (`animation: none` on the
  three) no animation runs, and it finished in 35 ms.
- An update callback that awaits `document.fonts.load(…, 'Ag')` holds the old picture until the face is in. With the
  font served 600 ms late, the crossfade began at 608 ms and ended at 900 ms, in the face.
- At 5,000 ms Chromium aborts the transition at 4,000 ms (`TimeoutError … timeout in DOM update`). The DOM change
  still lands. So `FACES_WAIT_MS` (1,000) bounds our wait well inside the browser's.
- Only `startViewTransition` is used, behind a feature test, so a browser without it gets the instant change.

**Why a press and never a hover.** S7a draws Tangerine hovered while the canvas stays Paper. S7b draws Tangerine already
Current and ringed while the canvas crossfades. FR-E2 says *switching*. `EXPERIENCE.md:895`'s "hovers Tangerine, and the whole
canvas crossfades" is loose prose, and the Dev task corrects it to "presses". Trying looks on is cheap without a hover:
each press is one ⌘Z away, and the next press supersedes.

**Why the client is handed strings.** Every canvas client imports the runtime's index. That index imports the presets
(for Paper) and the pool (for faces), so the pool's 43 KB record reached every page that draws a canvas or a pack
cell. With `REFERENCE_PACK` and `fontFaceCss` off the index, the server derives each preset's canvas `tokens` and
`faces` once, with the same functions `/canvas` uses. Clients paint from those strings and never compute a pack. That is
about 70 KB of very repetitive CSS in the editor's payload and none in any chunk. The New project window gets twelve
names and dots.

**Remix's three choices.** Designs keeps today's sentence. The pack choices name the pack instead:
- **Style Pack:** "Re-rolls the Style Pack to a different one. Every section keeps its design, its words and its
  settings — only the look changes."
- **Both:** "Re-rolls the Style Pack, and {n sections} on {canvas} to a different design in its own category. Your text,
  images and settings stay."
- **The greyed reason:** "Every section here is the only design its category has so far. More are coming." This is
  `NOTHING_TO_REMIX`'s own words. The whole-dialog "nothing to remix" state stays for a dialog offered no pack.
- **The announcement:** "Remixed the Style Pack — {name}." and "Remixed the Style Pack — {name} — and {n sections} on
  {canvas}." — said in place of the switch's own line, so one gesture says one sentence.

**The words (R-170)** — one list, read by the panel, the pill, the announcement and every check:

| Where | Words |
|---|---|
| S7b's pill | Trying on {name}… |
| `#editor-said`, after a switch, an undo or a redo | Style Pack — {name} |
| ⋯ row below 1280 | Style Pack |
| Remix group | Re-roll what · Style Pack · Designs · Both |

**Routine calls, each stated here rather than asked:**
- The list's Current card follows the press at once, as S7b draws it, while the canvas catches up.
- Paper's addresses carry no `&pack=`, so every cached Paper document stays valid.
- The ⋯ row opens the list rather than the rest panel, so the row's word and the panel's head are one name.
- It sits before Theme settings, and it is absent on a template surface, where the rest panel is the Paywall's.
- The New project window shows all twelve in D4a's grid (four rows of three), not D4a's two.
- A tampered `preset` field creates a Paper project, by `presetIdOf`'s rule, rather than refusing the Create.
- Undo announces the pack it restores, because the canvas changed and the person may not see it.
- The dashboard card reads the server's pack, so it follows once the work is synced (FR-D10). The test syncs first.

## Owner's manual test

Do this on the real site after Deploy confirms the build, on a laptop at full width, in **Pilot sections**. The test
changes that project's pack; step 13 puts it back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor | Click the grey area beside the page, then **Change**. | — | The Style Pack list: Paper is Current and ringed, the twelve below it. |
| 2 | same | Style Pack list | Click **Tangerine** and watch the page. | — | For a moment the old look fades into the new, and a dark pill at the top says "Trying on Tangerine…". Then the page is Tangerine — its colours, fonts and buttons — and the list's Current card and ring are on Tangerine. |
| 3 | same | Editor | Press **⌘Z**, then **⇧⌘Z**. | — | ⌘Z fades the page back to Paper; ⇧⌘Z fades it to Tangerine again. |
| 4 | same | Editor | Press the sun button (or **.**) for Dark, then back to Light. | — | Tangerine's own dark colours, then its light ones. |
| 5 | same | Section Picker | Press **⌘K**; look at the cards; press **Esc**. Then click a section and look at the colour dots in its settings. | — | Every preview card is in Tangerine, and the dots are Tangerine's colours. |
| 6 | same | Editor | Click the grey area, press **⌘S** and wait for the save icon's green tick; then reload the page. | — | The page reopens in Tangerine. ⌘Z still takes it back to Paper; press ⇧⌘Z to return to Tangerine. |
| 7 | same | Editor | Press ⌘S, wait for the green tick, then click the back arrow to Projects. | — | The Pilot sections card is in Tangerine's colours. |
| 8 | same project | Site Remix | Open the project again and click the dice beside the sun. | — | The window shows **Re-roll what**: Style Pack chosen, Designs and Both greyed with "Every section here is the only design its category has so far. More are coming." |
| 9 | same | Site Remix | Click **Remix**; then press **⌘Z** once. | — | The dice rolls, the page fades into a different pack; one ⌘Z brings Tangerine back. |
| 10 | same | Editor | Turn on Reduce motion (Mac: System Settings → Accessibility → Display → Reduce motion). Pick another pack. Turn it off again. | — | The pack changes at once, with no fade. |
| 11 | same | Editor, narrow | Make the window about 1,000 px wide; open the **⋯** menu at the top right; choose **Style Pack**; pick a pack; then press **Esc**. | — | The list opens on the right, over the page; the page changes pack; Esc closes the list. |
| 12 | same, in a second window | Editor, read-only | Open the same project in a second window; click **Change**. | — | The list opens, but every pack is greyed and clicking one does nothing. |
| 13 | first window | Style Pack list | Click **Paper**. | — | Your project is back to Paper. |
| 14 | `https://app.inflozo.com/sign-in` | Sign in | Sign out, then sign in with a second address of yours. Gmail delivers it to your usual inbox. | `umngkmr+packs@gmail.com` | The welcome screen. (Your own account is on Free and already past its project allowance, so its New project window shows the upgrade box instead.) |
| 15 | `https://app.inflozo.com/start` | Welcome → New project | Click **Blank canvas**, choose **Neon**, click **Create project**; open the new project. | — | The window lists the twelve packs, Paper ringed. The new card on Projects is in Neon's colours, and the page opens in Neon. |

## Verification

**Commands:**
- `node --test apps/web/journal.test.ts apps/web/pack-switch.test.ts apps/web/remix.test.ts apps/web/canvas-layer.test.ts`
  -- expected: pass; the grouped-undo case red with the grouping removed (a scratch copy).
- `pnpm check` and `pnpm keyboard` (whole) -- expected: green.
- `pnpm build && node tools/check-traces.mjs` -- expected: "every route carries its files" and no pool record in a client
  chunk; the same check against Story 6.2's build red, naming `0bebwu-me1gyy.js` and `3fqh80dol2fgc.js`.
- `bash supabase/tests/run-rls-gate.sh` -- expected: green with the Story 6.3 block; withholding the migration aborts there.
- `node tools/stress/test-vocabulary.mjs` -- expected: pass with the moved imports; `reference-tokens.css` unchanged.
- `bash tools/matrix/run-matrix-gate.sh` -- expected: green, nothing moved, no rebaseline.
- `python3 tools/doc-audit.py --check` (twice) -- expected: green.
- Measured and recorded, not gated: press → landed on the harness's 40-section Home (`x-inflozo-harness-home`) at 1× and
  4× CPU, for a cached pack; and on production for a pack's first press and a cached one.

**Real services (R-82):**
- **Supabase production** (`SUPABASE_DB_POOLER_URL`): the Schema apply and read-back; the three-argument call still
  applying; the four-argument call writing the preset. Throwaway users only, deleted after. Then
  (`SUPABASE_URL` + `SUPABASE_SECRET_KEY`) `projects.style_pack` and `revision` read back after the walks' saves.
- **app.inflozo.com**: the walks named in the tasks, each with its own throwaway accounts, deleted after.
  `run-verify-editor.cjs` covers the switch, the save, the fresh context and step 88. `run-verify-pilots.cjs` covers the
  Pack menu. `run-verify-dashboard.py` covers New project in Neon. `run-verify-lock.cjs` covers the greyed cells.
- **GitHub Actions and Vercel** (`GITHUB_TOKEN`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`): `check`, `rls`, `deploy` and
  `matrix.yml` green on the head, and production READY from it.
- **Not touched:** T1 and T3 (no theme), Resend (no email), Dodo (no billing).
