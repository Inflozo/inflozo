---
title: 'Story 6.4 — Editing tokens, per mode, with contrast checked live'
type: 'feature'
created: '2026-10-04'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md']
---

## In plain English

After this story you can change every part of your project's look yourself: a small pencil on each pack recolours its
seven colours for light and for dark, the rows under the list set its fonts (one of thirty pairings), width, corners,
spacing, gutters, buttons, shadow and links, and "+ New pack" makes a pack of your own from the look you have. While
you pick a colour, a yellow note names any words that would be hard to read and how far off they are, but it never
stops you saving, so the choice stays yours. Your packs belong to this project alone: they save with the rest of your
work, ⌘Z undoes each change, and duplicating the project carries them into the copy.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A project can wear any of the twelve presets (Stories 6.2, 6.3) but can change nothing in one. FR-E3's
per-project token editing is not built: the S7a pencils, the custom cell, "+ New pack", the pack-level rows, S7c's
Edit pack and S7d's New pack were all left out until this story (DW-310). So are the colour pickers, the font-pairing
list and the live contrast warning. The S7 drawings also disagree with the plan's words: they say Standard, Spacious,
Corners and Title font, and "Contrast" for on-accent. They draw no Pill, gutter, shadow, link-style, scrim or pill-radius
control, and no font list or warning (DW-310, R-74). The render matrix's per-pairing specimens also leave four things
unphotographed: the widest weights, a bold italic, a heading's accented letters and a button on a contrast ground. That
gap matters now, because the eighteen pairings no preset wears become pickable in this story (DW-324).

**Approach:** The parts never drawn are drawn first, in the Claude Design project, from the prompt this spec carries
(Question 1). The panel takes FR-E1's and Appendix C's words, one name per thing (R-170, Question 2). A project's own
packs are its edits to a preset and the packs it makes. Each is a full authored record in `projects.style_pack.packs`.
Every change is one journaled edit, saved with the docs by `sync_project_doc` in one compare-and-set; a Schema phase
goes first (R-99). Each record is validated wherever it crosses into CSS (AD-36). The browser computes an own pack's
canvas CSS, dots and swatches with the runtime's pool-free engine, and wears the result in place as 6.3's switch does.
The dialog's colour picker checks 6.2's AA pairs live and warns in words. DW-324's specimens and the contrast-ground
case join the render matrix behind the owner's sampled review.

## Boundaries & Constraints

**Always:**
- **Every gesture that changes a pack is ONE edit** (FR-D9, §AD1, AD-16), through `commit`'s one door and its read-only
  guard (R-192): a Save pack, a row press, a pairing chosen. **A New pack is ONE transaction** of two entries, the new
  record and the switch to it, so one ⌘Z removes it and puts the previous pack back.
- **A project's own pack is a FULL authored record**, the shape §D.d's presets have in `packs.json`:
  `{ name, pairing, pillRadius, radius, density, width, gutters, buttons, shadow, links, light, dark }`. It is stored as
  `style_pack.packs[id]`, where `id` is either a library preset's id (that preset as edited in this project) or
  `custom-<n>` (a pack the project made). A preset's record equal to the library's is never stored, so Reset to
  defaults removes it. The editor never writes `brand` or any other key.
- **Fonts are a pairing from the pool**, stored as its id (`D1`…). A family name is never typed and never stored (AD-36).
- **One save writes everything owed**: the flush sends the pending docs, the pending preset and the pending `packs` in
  ONE `sync_project_doc` call, and a refused call writes none of them. The route refuses with 422, writing nothing, a
  `packs` that is not an object of valid records under valid ids. It refuses the same way a `preset` that names neither
  a library preset nor a `custom-<n>`.
- **Every reader validates** (AD-36). The server's `ownPacksOf` drops a stored record that fails the record schema, names
  a pairing the pool does not hold, or is refused by the engine's `check`. A `preset` that names nothing valid is
  Paper (`presetIdOf`'s rule). No client module imports `@inflozo/library/packs`, `lib/style-pack.ts`,
  `@inflozo/section-runtime/reference` or `/fonts` (DW-323, `check-traces.mjs`). The browser computes an own pack with
  the runtime index's `packTokens` and `packTokensCss`, and with the pairing data the server hands it.
- **The contrast check is 6.2's AA sheet, as one list.** It checks text on background, text on surface, muted on
  background, muted on surface and on-accent on accent, in each mode, against 4.5:1. The runtime exports the pairs once
  (`AA_PAIRS`); the live warning reads them, and so does `packs.test.ts`. A failing pair is a WARNING in words (UX-DR8),
  never a block: Save pack stays live and saves.
- **Everything that draws the pack in force wears an own pack too**: the canvas, the Section Picker's previews, the design
  ring's tiles, the Controls panel's swatches, the rest card, the list and the dashboard card. The canvas restyles in
  place inside 6.3's transition: the faces are waited for, and reduced motion makes the change instant. S7b's pill
  "Trying on…" shows for a switch only.
- **One word list** (R-170): every surface, announcement and check reads `lib/pack-edit.ts`'s words (and 6.3's
  `PACK_WORDS`). The rows' titles and steps equal Appendix C's Style Pack rows, and a test checks it. Counts are
  derived. Node 24. `pnpm keyboard` is run whole before the Dev commit.

**Ask First:**
- The production apply of the migration. If the permission classifier refuses it, ask the owner in the session; never
  route it through a subagent.
- The mass rebaseline that DW-324's changes cause: it needs the owner's sampled review in the Dev session
  (`docs/render-matrix.md`).
- A landed export that changes anything beyond `S7 Style Packs.dc.html` (or the Editor Sidebar Kit, where the patch
  notes say the redraw needed it): stop and show it.
- A redrawn frame whose behaviour contradicts this spec.

**Never:**
- No account-level pack library (FR-E3, Appendix G). No deleting a pack (no requirement or frame asks for one). No hover
  preview. No colour picker, hex field or font list anywhere but the Style Pack editor (DESIGN.md:586, Appendix C).
- No brand seed and no logo (Story 6.6). "From your site" offers the site's accent as a colour to pick, and writes
  nothing until it is picked. No change to mode resolution (6.5) or theme emission (Epic 7). No `next/font`, no font
  host, no `*-tokens.css` file. No hand edit to the design export (R-74): it changes only when Claude Design's own
  export lands.
- Never a block on contrast, and never a computed token offered for editing (FR-E1: computed rows follow).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Edit the pack in force | Paper in force; its pencil; Accent (Light) set to `#1E6BFF`; Save pack | one transaction under `PACK_RECORDS_KEY`, `packs.paper` = the edited record; Paper's cell and the rest card follow; the canvas restyles in place, no pill; "Changed Paper." once landed | — |
| Edit another pack | Tangerine's pencil while Paper is in force; Save pack | `packs.tangerine` stored; Tangerine's cell dots change; the canvas does not; "Changed Tangerine." | — |
| Nothing changed | a dialog saved with its draft equal to the pack | closes; no entry | — |
| Discard | Cancel, ✕, Esc or the backdrop | nothing journaled; focus back on the pencil or "+ New pack" | — |
| Reset to defaults | a preset holding an own record; Reset, then Save pack | the draft becomes the library's record (all of it); Save removes `packs[id]`; the look in force restyles if it changed | — |
| Hard to read | the Light Text draft is `#DDDDDD` on a `#FFFFFF` page colour | the notice names each failing pair, its mode and its ratio (floored to one decimal); each failing swatch carries the warning glyph and "hard to read" in its name; Save pack saves | never a block |
| Live, not chatty | a drag across the square | the swatch and the warning follow the draft; the warning is announced when it appears, changes pairs or clears, never once per pointer move | — |
| New pack | "+ New pack" while Tangerine is in force | the draft is Tangerine's effective record with an empty name | — |
| New pack, no name | Save pack with the name empty or spaces | the field's error "Name your pack to save it."; focus on the field; nothing saved | — |
| New pack saved | name "Studio Warm"; Save pack | ONE transaction: `packs['custom-<n>']` (the next free n) and `preset = custom-<n>`; the cell joins after the presets, ringed; the canvas restyles; "Style Pack — Studio Warm"; ⌘Z undoes both | — |
| A row | Site width → Wide on the pack in force | one edit to its record; the canvas restyles; "Site width — Wide"; arrows move and select as the Kit's `Segmented` does, one edit each | — |
| A pairing | Fonts → Lora · Lato | one edit (`pairing: 'D15'`); the canvas waits for its faces, up to `FACES_WAIT_MS`, then restyles; "Fonts — Lora · Lato" | a late face swaps in on arrival |
| Hex field | `#1e6bff`, `1E6BFF`, `#1af`, ` #1E6BFF ` | each becomes `#1E6BFF` (three digits expanded) and the swatch follows | `#12`, `blue`: "Not a colour — type #RRGGBB"; the swatch keeps its last valid colour |
| Paste | the clipboard holds `#2F4A3E` | the field takes it and the swatch follows | refused or unsupported: focus the hex field and say "Press ⌘V to paste into the hex field." |
| From your site | a linked site whose stored brand accent is `#2f4a3e` | one dot "From your site", `#2F4A3E`; a press makes it the draft's colour | no linked site or no valid accent: no row |
| Read-only | another window holds the lock | the list opens; every cell, pencil, "+ New pack", row and the Fonts row are greyed and unclickable; nothing journaled | `commit`'s guard |
| Lock lost mid-dialog | the dialog is open when the lock goes | the dialog closes (`[data-editor] dialog[open]`), and its draft is dropped | — |
| Reload, unsynced | an own-pack edit not sent; F5 | the device's `packs` (equal revision); ⌘Z still undoes it | — |
| Another session's edit | the server's revision moved | the server's `packs` and preset; the journal cleared | — |
| A record from before 6.4 | a local record with no `packs` | the server's `packs` | — |
| The flush | `packs` pending | `{ base, docs: {}, packs }` (plus `preset` where pending) → `style_pack.packs` and the revision +1 in one transaction; `brand` and an unsent `preset` untouched | 409 on a stale base, nothing written |
| A hostile body | an accent `#fff;}body{display:none`, a pill radius `1px;}*{x:y`, an unknown pairing, a step `huge`, a 300-character name, or an id `harbor` or `__proto__` | 422 "Not a Style Pack"; nothing written | — |
| A hostile stored value | the same, written by hand through the owner's column grant | `ownPacksOf` drops that record. An edited preset shows the library's values again; a dropped custom pack is gone, and a `preset` naming it is Paper | — |
| Duplicate | a project whose `style_pack` holds own packs; Duplicate (a plan with room) | the copy's `style_pack` is the source's stored one, own packs and preset included | at the cap: the existing refusal |
| Below 1280 | ⋯ → Style Pack; a pencil | the overlay holds the list and the rows; the dialog opens over the editor (portalled into `[data-editor]`) | — |
| Remix · Style Pack | own packs exist | a different pack, drawn uniformly from the whole roster, own packs included | — |
| An own pack in force | the stored preset is `custom-2` | the editor opens in it: the canvas asks for Paper's address and wears the pack before its first paint; the previews, the ring, the swatches, the card and the dashboard card all wear it | an id naming no valid pack → Paper |

</frozen-after-approval>

## Code Map

**The engine and the pool:**
- `packages/section-runtime/src/tokens.ts`:
  - `PackMode`/`Pack` :74-152.
  - `SCALES` :110-137, every step and its values.
  - `ROLES` :173 (unexported).
  - `check` :178-203, which refuses every authored input by name; its comment already says "Story 6.4 makes packs
    editable per project".
  - `packTokens` :279 and `packTokensCss` :359.
  - `AA_PAIRS` is added here.
- `packages/section-runtime/src/index.ts:41-48` exports `packTokens`, `packTokensCss`, `SCALES` and `contrast`. All four
  are pool-free; `tokens.ts` imports only `colour.ts`, and `colour.ts` imports nothing. `check-traces.mjs` keeps them
  that way.
- `packages/section-runtime/src/packs.test.ts:18-35` is 6.2's AA `sheet()`, with the five pairs written inline at :24-28.
  Its control (:54-59) is Tangerine's light on-accent set to `#FFFFFF`, which reads 3.97:1. The computed-token sheet is
  :62-81.
- `packages/library/src/packs.ts`: `POOL` :64, `pairingOf` :67, `familyList` :87, `pairingFonts` :95, `PRESETS` :111,
  `presetOf` :119.
- `packages/library/packs/packs.json` holds the record shape. `packages/library/fonts/pool.json` holds the pairings, each
  with its name and its roles' `range`, `italic` and `weights`.
- `packages/section-runtime/src/fonts.ts` holds `fontFaceCss`, which is server-only.

**The server's home and the reads:**
- `apps/web/lib/style-pack.ts`:
  - `stylePackSchema` :66, loose.
  - `fontHref` :109.
  - `presetIdOf` :115-119.
  - `packFacesCss` :125 declares the twelve presets' heading faces for every signed-in page.
  - `placeholderFor` :135.
  - `ROLE_TOKENS` :166-171 and `referenceSwatches` :180-191.
  - `packChoices` :200-220 and `packCells`.
- `apps/web/lib/pack-switch.ts`: `PackChoice` :35-54, `PACK_WORDS`, `DEFAULT_PRESET`, `PACK_FAMILY_PREFIX`,
  `FACES_WAIT_MS`, `otherPreset`. It is pure, and its one import is `lib/ring.ts`.
- `(editor)/read.ts`: the select :70 (`style_pack`), `EditorData.preset` :163-166 and `.packs` :167-170, and :358-359
  (`presetIdOf`, `packChoices()`). The linked site's `site_settings` is read at :207 and handed through `siteWith` at
  :330. `apps/web/lib/probe-rule.ts:183-186` holds `isAccent` (`#rgb` or `#rrggbb`). "From your site" is the site's
  stored `site_settings.brand.accent` (Story 3.4).
- `app/harness/editor/layout.tsx`:
  - The `EditorData` literal is at :170, so a new field fails to compile here until it is added.
  - `x-inflozo-harness-pack` is at :216 (read through `presetIdOf`) and `packChoices()` at :217.
  - `packFacesCss` is at :226.
  - `x-inflozo-harness-site` is at :209-214 and `-lock: reader` at :202.
- `(authed)/projects/actions.ts`: `createProject` writes `{ preset }` at :147. `duplicateProject` (:179-208) selects
  `style_pack` whole at :196 and is refused at the plan's cap at :185.
- `sites/actions.ts:846-851` ("Use your brand") read-modify-writes `style_pack` and carries unknown keys, so `packs`
  survives it.

**The save:**
- `apps/web/lib/journal.ts`:
  - `PACK_KEY` :42, `JournalEntry` :45-53, `isPack` :56, `append` :108-129.
  - `Restore` :133 and `restoring` :137-145.
  - `Payload` :217, `carries` :220, `flushPayload` :226-234 (which skips `PACK_KEY` and sends the preset in force).
  - `OwedRecord`, `owedOf` and `sendBody` :344-357.
  - `hydratedPreset` :451-452, `stable` :478-483, `ownFlushLanded` :486-495.
- `apps/web/lib/local-store.ts`: `VERSION = 1` :26, `LocalRecord` :31-40, `MetaRow` :42-53, read-back :169, save :196. A
  new field needs no IndexedDB upgrade.
- `(authed)/projects/[id]/sync/route.ts`:
  - The body is destructured by hand at :71, with no zod.
  - `TEMPLATE_KEY` :53.
  - :78 is the 422 "Not a Style Pack"; :79-81 is the 400 "Nothing to write".
  - :119-125 is the RPC call with named arguments.
  - :134-158 is the adopt read: `packThere` :151 and `ours = keys.length > 0 || revision === base + 1` :152-156.
- `supabase/migrations/20261004120000_sync_style_pack_preset.sql` is the pattern to follow:
  - :31-33 drop the old overload and create the new one, because two overloads with a default are ambiguous to
    PostgREST.
  - :41-43 return null for a non-object `p_docs`; :45-56 are the CAS.
  - :64-71 are the `style_pack` case; :76-77 the grants; :79 the `notify pgrst`.
  - Comments stay outside the body (:28-29), because the gate diffs `pg_dump` bodies verbatim.
- `SCHEMA.sql`: its copy of the function is at :1744-1803; `style_pack` is `jsonb not null` at :231; the owner's column
  grant is at :1278-1280.
- `supabase/tests/rls.sql` is byte-identical to `RLS-TEST.sql` (`cmp`). The Story 6.3 block runs from :1799 to the end of
  the file: fixture :1811-1822, the one-function check :1824-1833, cases 1–7.
- `supabase/tests/run-rls-gate.sh` checks the copies for drift at :35-48 and diffs the schema at :94-104.

**The editor** (`(editor)/editor.tsx`):
- The 6.3 header is at :300-314.
- State and setup:
  - props `preset: storedPreset, packs` :794-795; `packList` :811; `pack` :815.
  - `packOf` :816, which falls back to the first pack.
  - `frameSrc = packed(src, storedPreset)` :819.
- Edits and undo:
  - `store` :1585-1587; `journalise` :1598-1605; `commitPack` :1612-1620.
  - `restored` :1641-1690, whose pack half is :1653-1662.
- The save:
  - the flush :1764-1780; its keepalive needs the body under 60,000 bytes (:1790).
  - the hydrate :3775-3830: `ownFlushLanded` :3776, `hydratedPreset` :3798.
- The canvas:
  - `wear` :2327-2335; `restyle` :2350-2385 (the pill's `setTrying` is at :2365); `choosePack` :2388.
  - `ready` wears the pack before the first paint (:3690-3697).
- Remix and ⋯:
  - `onRemix` :4414-4443, which calls `otherPreset(packs.map…)` at :4426.
  - `openPackList` :4448; the ⋯ rows `more` :4782-4788.
- Dialogs:
  - the editor's own dialogs (`sheet`, `openOnCancel`, `closeOnBackdrop`) :5698-5912.
  - losing the lock closes every `[data-editor] dialog[open]` (:2255); crossing 1280 closes invisible dialogs (:3903).
  - shortcuts other than ⌘S are ignored under a `dialog[open]` (:3384-3387).
- The panel:
  - `aside#editor-controls`, 280 px wide (:5505-5512).
  - the list and the card :5659-5665.
  - previews `pack={pack}` :5581, :5613, :5865; swatches `choice.swatches` :5630.
  - `#editor-said` :5680-5683.
- `(editor)/style-pack.tsx` holds `StylePackCard`, `StylePackHead` and `StylePackRoster`. The roster is a `listbox` of
  option buttons with one tab stop, using `gridKeys`, inside `ReadOnly` (:115-142).
- `components/kit/pack-cell.tsx` holds `PackCell`. It is a `<span>`, and its `editable` prop draws a pencil button INSIDE
  the cell, so inside an option it would put a button inside a button. `NewPackCell` is beside it.
- `components/editor/section-preview.tsx:197` builds `previewSrc(src, entry.id, pack)` with `onLoad={paint}`. The `pack`
  prop runs through `design-picker.tsx:69,95` and `section-picker.tsx:104,133,330,377-404`.
- `lib/canvas.ts`: `packed` :185-186, `previewSrc` :193-194. The canvas route 404s an unknown `?pack=` (`(authed)/canvas/route.ts:61-63`).

**The Kit** (reuse it; never add a second vocabulary):
- `kit/dialog.ts`:
  - `sheet` :24-28 (460 px), `title` :42, `openOnCancel` :52-56, `closeOnBackdrop` :74-84.
  - The focus trap, Esc and focus return come from native `showModal()`.
  - Remix's confirm portals into `[data-editor]` (`remix-dice.tsx:53-58,111-112,186-188`) because a dialog under a
    `display:none` ancestor opens at 0×0. `connect-dialog.tsx:46` is a 520 px box.
- `kit/segmented.tsx:58-84` — `Segmented`: a live radiogroup with one tab stop, whose arrows select; it has a `greyed`
  state.
- `kit/stepper.tsx:11-73` — `Stepper`.
- `kit/input.tsx:23-126` — `TextInput`: `mono`; `error` (danger, `role="alert"`); `hint`; `maxLength`.
- `kit/select.tsx`:
  - `openPopover` :25-80 anchors the popover, keeps it on screen and returns focus to its trigger.
  - `FontRow` :157-174 is static today.
  - `Menu` :176-245 has an `icon` slot, and its active row is checked.
- `kit/banner.tsx:47-77` — `Banner`, kind `notice`: marigold, the AlertTriangle icon, `role="status"`, one sentence.
- `kit/button.tsx` — `Button`, deliberately with no `disabled` prop, and `IconButton` :121-140.
- `kit/greyed.ts` — `ReadOnly` :67-69 (`<fieldset disabled class="contents">`, which reaches DOM children only, so a
  portal wraps its own content) and `ring` :78.
- `apps/web/tokens.test.ts:145-166` refuses a hex (3, 4, 6 or 8 digits) or an `rgb(a)` literal in any `.ts` or `.tsx`
  outside four exempt files, `lib/style-pack.ts` among them. The picker's square and hue strip therefore spell `white`,
  `black`, `transparent` and computed `hsl(…)`. A placeholder like "#C24E1E" would fail it.
- `apps/web/busy.test.ts` does not audit a client-only `type="button"`. The Layers Rename dialog (`layers.tsx:602-627`)
  is the precedent for a dialog that saves locally and synchronously.

**The frames as they stand** (Question 1 redraws them):
- `S7 Style Packs.dc.html` S7a :22-135:
  - a pencil (`title="Edit pack"`) on every cell, and "Maya's Warm" with a dashed name, then "+ New pack".
  - rows: Title font, Body font, Site width (Narrow · Standard · Wide), Corners, Density (Compact · Comfortable ·
    Spacious), Buttons (Solid · Soft · Outline).
- S7c :301-328: a 520 px dialog over a 40 % scrim.
  - "Edit pack", "Seven roles per mode…", Pack name.
  - Light and Dark rows of seven 36 px swatches, the last labelled "Contrast".
  - Reset to defaults · Cancel · Save pack.
- S7d :329-374: "New pack" and its subtitle, the empty name field focused, and the same rows.
  - A stray four-swatch "Dark" row.
  - The colour-picker popover: a 112 px square, a hue strip, "From your site" dots, an "Accent colour hex" field and
    Paste.
- `Editor Sidebar Kit.dc.html`: segmented; swatch row; select rows and menus ("Font row — live Aa rendering",
  "Dropdown menu — check on active"); stepper; feedback banners; pack cards.
- `P0-0 Greyed Control Pattern.dc.html` and `D8 Editor Below 1440.dc.html` (the overlay).
- In the PRD:
  - Appendix C's scale table (`prd.md:992-1002`) gives every Style Pack row's title and steps.
  - FR-E3 is at `prd.md:255`, and NFR-5's "warns before the edit lands" at `prd.md:483`.
- `packages/library/src/vocabulary.ts:270-274` labels the section Background control's values "Base · Surface · Accent ·
  Contrast · Image".

**The checks to extend:**
- `apps/web/journal.test.ts`: the 6.3 section, :368-450.
- `apps/web/editor.test.ts`: :274-292 holds `TEMPLATE_KEY` equal to the SQL; :358-370 pins 6.3's route regexes, including
  `presetOf(preset) === undefined`, which must be re-pinned.
- `apps/web/style-pack.test.ts` :111-143.
- `apps/web/pilots.test.ts` :199-228, which holds `packChoices` equal to `/canvas?pack=`.
- `apps/web/projects.test.ts` :162-227 (a duplicate carries every column the grant allows).
- `packages/section-runtime/src/ad36.test.ts` and `packs.test.ts`.
- `tools/keyboard/journey.spec.mjs`:
  - It is keyboard-only below :34.
  - Helpers: `wears` :531, `bgPage` :532, `recordTransitions` :538-562, `intoList` :565-574, `option` :575.
  - The 6.3 stops are :578-947 and the reader stop :509-519.
  - The 720 × 900 describe is :3650, with ⋯ → Style Pack at :3763-3789.
  - It reads the words from the app (:524-525) and the presets from `packs.json` (:527-528).
- `tools/probe/run-verify-editor.cjs`:
  - The next step is 103. Step 102 (:7340-7463) is the pattern: its own context, a magic link, the row read, the 422
    POST, a fresh context.
  - A user is made Pro through `entitlements.state` at :930-953, and users are cleaned up in `finally` (:7479-7493).
- `tools/probe/run-verify-lock.cjs:398-429` checks the reader's greyed cells.
- `tools/probe/run-verify-dashboard.py` has no duplicate step; its pooler is at :147 and its user lifecycle at :695-757.
- `tools/matrix/cases.mjs`:
  - `SPECIMEN_CSS` :71-77 (heading 700 and 600, `strong`, `em`, latin-ext in the body face only).
  - `specimenMarkup` :79-88, `specimenDocument` :91-98, `SPECIMENS` :100.
  - `cases` :125-144; `renderInput` (`controls: {}`, so `bg` is base) :162-185.
- `tools/matrix/cases.test.mjs:79-103`.
- `tools/matrix/matrix.spec.mjs`: the runner's CDP `getPlatformFontsForNode` :57-83 reads `familyName` only, on Paper
  alone. The per-case test is :120-155.
- `docs/render-matrix.md:127-145`: the mass-rebaseline rules and the sampled review.
- `.github/workflows/matrix.yml:43-59`: a change to a shared input runs every case.
- `tools/check-traces.mjs:111-140` refuses a pool record in a client chunk, and a runtime index that reaches the library.

**Propagation targets:**
- `deferred-work.md`: DW-310 (:8477), DW-324 (:8703) and DW-66's `also:` (:2011).
- `epic-6-context.md`.
- `EXPERIENCE.md`: :154 (the S7 row) and :2023-2027 (the stray-row note).
- `addendum.md` §AD1, the "Cloud sync" line (:22).
- `ARCHITECTURE-SPINE.md`: AD-15's flush contract (:212), AD-36's instances (:409), the FR-E row (:645).
- `reconcile-designs-decisions.md`: the two rulings, as R-236 and R-237.

## Tasks & Acceptance

**Dev opens once both questions below are ruled.** For Question 1's option 1, it also waits until the owner has sent
the redrawn export. The tasks build the RECOMMENDED options; Design Notes' "Ruled values" table says what each other
option changes.

**Execution:**
- [ ] **SCHEMA FIRST, ALONE (R-99)**. Files: `supabase/migrations/20261004200000_sync_style_pack_packs.sql`, `SCHEMA.sql`,
  `RLS-TEST.sql` and `supabase/tests/rls.sql`.
  - The new function `sync_project_doc(p_project uuid, p_docs jsonb, p_base bigint, p_preset text default null, p_packs
    jsonb default null)` replaces the four-argument one, using 6.3's drop-and-replace.
    - It is re-runnable, keeps the same grants, and ends with `notify pgrst, 'reload schema'`.
    - On a matching base it writes `packs` beside `preset`. A `style_pack` that is not an object starts from `{}`.
    - A `p_packs` that is not an object answers null, as a non-object `p_docs` does.
    - It bumps the revision once.
  - The RLS proof gains a Story 6.4 block:
    - a packs-only call applies, revision +1, with `brand` and `preset` untouched.
    - docs, a preset and packs land in one call.
    - a stale base writes none of them.
    - a null `p_packs` leaves `packs` byte-equal.
    - a non-object `p_packs` answers null.
    - a scalar `style_pack` becomes `{packs}`.
    - another user's project answers null, and its pack is unchanged.
    - anon gets 42501.
    - exactly one `sync_project_doc` exists.
  - Apply it through `SUPABASE_DB_POOLER_URL` on the owner's in-session go, and read it back: one five-argument function,
    with `prosrc` byte-equal to the file.
  - Then prove two calls as a throwaway user, deleting the user afterwards: the deployed code's four-named-argument call
    still applies, and a five-argument call writes `packs`.
  - Push `Story 6.4 - Schema - …`.
- [ ] **THE REDRAW LANDS** (Question 1, option 1; this runs after the Schema push, so it never rides in it).
  - Unzip the owner's export over `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/`.
  - Run `python3 tools/reapply-export-edits.py`, `python3 tools/verify-design-pass.py` and
    `python3 tools/inventory-gen.py --check`.
  - Read `git diff --stat` on the export. Anything beyond S7, or the Kit where the patch notes name it, is Ask First.
  - Read S7's "Patch notes — Story 6.4". Settle each line marked OPEN FOR THE OWNER, asking him only where the decision
    is genuinely his.
- [ ] `packages/section-runtime/src/tokens.ts`, `index.ts`, `packs.test.ts`. Export `AA_PAIRS`, the five role pairs, and
  make 6.2's sheet read it, with its control intact (Tangerine light on-accent `#FFFFFF` still caught). This makes one
  list for the preset sheet and the live warning.
- [ ] `packages/section-runtime/src/ad36.test.ts`. Add AD-36's instance "a project's own Style Pack record (Story 6.4)":
  `packTokens` refuses each hostile authored value by name, and the legitimate record emits. The hostile values are a
  colour carrying `;}`, a pill radius carrying `;}`, a scrim outside 0–1, a step not in `SCALES`, and a family list with
  an unbalanced quote.
- [ ] `apps/web/lib/pack-edit.ts` (new). It is pure and reachable by `node --test`; it imports the runtime index,
  `lib/pack-switch.ts` and `lib/zod.ts`. It is the client's one home for editing, and holds:
  - `PackRecord` and `packRecordSchema`. The schema is strict: name trimmed, 1–40 characters; pairing `D<n>`; each step
    one of `SCALES`' keys; `pillRadius` the engine's length grammar; seven `#RRGGBB` colours and a 0–1 scrim per mode.
  - `CUSTOM_ID` and `nextCustomId`.
  - The `PairingChoice` type the server hands.
  - `choiceOf(id, record, pairing)`: a `PackChoice` made by the same engine calls `packChoices` makes, plus its `record`.
  - `hardToRead(record)` over `AA_PAIRS`. Each ratio is floored to one decimal, so a failing pair never prints 4.5.
  - `withoutDefaults(packs, presetRecords)`.
  - `hexToHsv` and `hsvToHex`.
  - `ROLE_TOKENS`, moved here; `lib/style-pack.ts` and `lib/controls-review.ts` re-export it.
  - `PACK_EDIT_WORDS`, the Design Notes' table.
- [ ] `apps/web/lib/style-pack.ts`:
  - `stylePackSchema` carries `packs`.
  - `ownPacksOf(stylePack)`: the valid records under valid ids, junk dropped; it never throws.
  - `packIdOf(stylePack)`: the id in force. That is a preset, or a custom id that `ownPacksOf` holds; anything else is
    Paper.
  - `packChoices()` derives each preset through `choiceOf`, each carrying its `record`. Paper's `tokens` stay
    `referenceTokensCss()`.
  - `pairingChoices()`: for each pool pairing, its id, two families, glyph family, `pairingFonts`, canvas `faces`
    (`fontFaceCss(…, fontHref('canvas'))`) and families.
  - `pairingGlyphFacesCss(base)`: the prefixed heading faces of the pairings no preset wears, for the editor's list.
  - `placeholderFor` paints an own pack's light background, text and accent. The brand accent still wins (FR-C4).
- [ ] `apps/web/lib/journal.ts` and `apps/web/lib/local-store.ts`:
  - `PACK_RECORDS_KEY` (`'pack-records'`, never a template key). Its entries' `before` and `after` are the whole `packs`
    map.
  - `Restore.packs`.
  - `flushPayload(j, docs, preset?, packs?)` answers `{ docs, preset?, packs? }`.
  - `carries`, `owedOf` and `sendBody` carry `packs`; `ownFlushLanded` compares them.
  - `hydratedPacks(how, local, cloud)` follows `hydratedPreset`'s rule.
  - `LocalRecord.packs?` and `MetaRow.packs?`. A record from before 6.4 has none, and takes the server's.
- [ ] `(authed)/projects/[id]/sync/route.ts`:
  - It takes an optional `packs`, validated before the write: every entry must survive `ownPacksOf`, else 422 "Not a
    Style Pack".
  - `preset` is a library preset or a `CUSTOM_ID`, and a body carrying only `packs` is a write.
  - It passes `p_packs`.
  - The adopt read compares `style_pack.packs` too (`stable`), under the same one-write-past rule.
- [ ] `(editor)/read.ts` and `app/harness/editor/layout.tsx`:
  - The editor is handed:
    - `preset: packIdOf(style_pack)` and `ownPacks: ownPacksOf(style_pack)`;
    - `packs: packChoices()`, `pairings: pairingChoices()` and `pairingFaces`;
    - `siteAccent`: the linked site's stored brand accent, through `isAccent`, as `#RRGGBB`, else null.
  - In the harness, `x-inflozo-harness-pack: custom-1` opens on a fixture custom pack (Paper's record renamed, with an
    accent of its own), and `-site` supplies a site accent.
- [ ] `apps/web/lib/canvas.ts`, `components/editor/section-preview.tsx`, `design-picker.tsx`, `section-picker.tsx`:
  - The `pack` prop becomes the in-force `PackChoice`.
  - A preview asks for its preset's address (Paper's for a custom pack), and on load wears the pack's `tokens` and
    `faces` by the editor's own rule; `wear` moves into a shared function.
  - So the previews and the ring's tiles wear an own pack.
- [ ] `(editor)/style-pack.tsx` and `components/kit/pack-cell.tsx`:
  - The roster lists the twelve presets in §D.d's order, each shown as its own record where one exists, then the custom
    packs by number.
  - Each cell's pencil (named "Edit pack — {name}") and "+ New pack" are buttons OUTSIDE the listbox, placed where the
    frame draws them. An option holds no interactive content, and the listbox holds options only.
  - Below the roster come the rows for the pack in force:
    - the Fonts row, which opens the pairing menu: "Ag" in each heading face, then "Heading · Body", the pairing in force
      checked, the menu scrolling inside itself;
    - Appendix C's rows, each the Kit's `Segmented`;
    - Pill radius, as drawn.
  - All of it sits inside `ReadOnly` for a reader.
- [ ] `(editor)/pack-editor.tsx` (new) — the Edit pack and New pack dialog, S7c and S7d as redrawn:
  - **The dialog.** It is portalled into `[data-editor]` and opened with native `showModal()`. Focus starts on the name
    field for New pack and on the first swatch for Edit pack. Pack name is a `TextInput` with a 40-character limit.
  - **The swatches.** There is a Light row and a Dark row of seven swatch buttons. Each is named "{Role}, {Mode},
    #RRGGBB", with "hard to read" added where it fails. Each mode also has an Image scrim `Stepper`, 0–100 % in steps
    of 5.
  - **The colour picker**, a popover `openPopover` opens from the swatch:
    - the square: pointer, touch and arrow keys; `role="slider"` with its value in words;
    - the hue strip: `role="slider"`;
    - "From your site", shown only when there is a `siteAccent`;
    - the hex field: a `TextInput mono` that applies a valid `#RRGGBB` or `RRGGBB`, and otherwise says "Not a colour —
      type #RRGGBB";
    - Paste, which calls `navigator.clipboard.readText()`. If that is refused, it focuses the hex field and says "Press
      ⌘V to paste into the hex field."
  - **The warning.** A `Banner` notice under the rows, from `hardToRead`; each failing swatch carries the banner's icon.
    It is announced when it appears, changes or clears, and never once per pointer move.
  - **The buttons.**
    - Reset to defaults appears for a preset only, and makes the draft the library's record.
    - Cancel, ✕, Esc and the backdrop discard the draft.
    - Save pack with an empty name puts the `TextInput` error "Name your pack to save it." and saves nothing. Saving an
      unchanged draft closes with no edit.
  - **Colours** are spelled `white`, `black`, `transparent` and computed `hsl()`, never a literal (`tokens.test.ts`).
- [ ] `(editor)/editor.tsx`:
  - `latest.packs` sits beside `latest.preset`, and every handler writes it first (R-210).
  - The roster is derived from `packs` and the own records (`choiceOf`, memoised per record); `packOf` reads `latest`.
  - `commitPacks(next, txn?)` goes through `heldBack` and `journalise(PACK_RECORDS_KEY, …)`. An equal map makes no entry,
    and a preset's record equal to its defaults is dropped.
  - A Save pack, a Reset then Save, a row press and a pairing are each one edit. A New pack is `commitPacks` and
    `commitPack` in one `txn`.
  - `restyle(said, { pill })` shows the pill for a switch only.
  - `restored` applies `r.packs`, and restyles when the look in force changed.
  - `store`, the flush, the sign-out and the hydrate all carry `packs`.
  - `frameSrc` asks for the in-force pack's preset address (Paper's for a custom pack), and `ready` wears the pack before
    the first paint.
  - Remix's Style Pack re-roll draws from the whole roster.
  - The previews, the ring and the swatches take the in-force choice.
  - The dialog is mounted, and each sentence is said once the change has landed.
- [ ] Unit tests:
  - `apps/web/pack-edit.test.ts` (new):
    - the schema refuses each vector and accepts the legitimate record.
    - `CUSTOM_ID` and `nextCustomId`.
    - `choiceOf` on Paper's record equals `packChoices()`'s Paper, apart from the generated header of its `tokens`.
    - `hardToRead` over the five pairs. Control: Paper passes, and Paper with text `#DDDDDD` fails "Text on {page} in
      Light".
    - the ratio floor; `withoutDefaults`.
    - every preset colour survives `hexToHsv` then `hsvToHex`.
    - the words: the rows' titles and steps equal `prd.md` Appendix C's Style Pack rows and `SCALES`' keys, and none is
      Standard, Spacious, Corners, Title font or Contrast.
  - `journal.test.ts`:
    - a records edit undoes and redoes.
    - New pack's two entries count as one edit.
    - the flush payload carries `packs`; `ownFlushLanded` compares them; `hydratedPacks`.
    - a record from before 6.4.
  - `style-pack.test.ts`:
    - `ownPacksOf` keeps the valid entries and drops each hostile one.
    - `packIdOf`.
    - `placeholderFor` with an own pack.
    - `pairingChoices`, its count derived from the pool.
  - `editor.test.ts`:
    - `TEMPLATE_KEY` refuses `PACK_RECORDS_KEY`.
    - the route refuses a bad `packs` before the write and passes `p_packs`.
    - 6.3's regexes are re-pinned.
  - `pilots.test.ts`: `packChoices` still equals `/canvas?pack=`.
- [ ] DW-324 — `tools/matrix/cases.mjs`, `matrix.spec.mjs`, `cases.test.mjs` and `docs/render-matrix.md`:
  - **The specimen** draws each role at both ends of its declared weights, read from `pool.json`: the heading's `range`
    ends or each static weight, and the body's roman and italic ends. It adds a bold italic run and a latin-ext line in
    the heading face.
  - **The font check.** Every specimen line must be drawn in the pool's own face: `CSS.getPlatformFontsForNode` reports
    `isCustomFont: true` and the role's family. Executed at Create; see Design Notes.
  - **The contrast-ground case.** Every design whose `bg` universal offers `contrast` and whose stylesheet draws a
    `--button-fill` button is photographed on `contrast` (derived, not listed). It is taken under each reference pack
    whose Button style is Outline (Mono today), in light and dark, at 1440.
  - **The doc** gains the specimen's lines and the new case.
  - **The rebaseline.** One mass rebaseline, taken with `--update` in the image. The owner reviews it in the session: a
    page of the specimens and the new cases, before and after. It is committed baselines-only after the Dev commit and
    pushed with it.
- [ ] `tools/keyboard/journey.spec.mjs`, keyboard only. New stops:
  - **Into the dialog.** Tab from the list reaches a pencil. The dialog opens, with focus where the Design Notes put it.
  - **The colour picker.**
    - A swatch opens the picker; `#1E6BFF` typed in the hex field moves the swatch.
    - The square and the hue strip move under the arrow keys.
    - The first Esc closes the picker and the second closes the dialog, with focus back on the pencil.
  - **Save and undo.** Save pack restyles the canvas's `--accent`, with no pill, and says "Changed Paper."; ⌘Z and ⇧⌘Z
    follow.
  - **The warning.** Text `#DDDDDD` raises it, in words, and Save pack still saves.
  - **New pack.** With no name it refuses. Named, it joins the roster, ringed, and wears the canvas; one ⌘Z removes it.
  - **A row.** Site width → Wide moves `--site-width`.
  - **The pairing menu.** Choosing a pairing changes `--font-heading` once its faces are in.
  - **Opening on own packs.** The harness opens on `custom-1`: the card, the list and the canvas show it, and a Section
    Picker card wears its `--bg-page`.
  - **Reading along.** The reader's pencils, "+ New pack" and rows are disabled.
  - **At 720 × 900.** ⋯ → Style Pack shows the rows, and the dialog opens.
  - **Reduced motion.** An edit's restyle is instant.
- [ ] Deployed walks (R-82):
  - `tools/probe/run-verify-editor.cjs`, step 103:
    - Edit Tangerine's accent through its hex field, Save, ⌘S. Read back `style_pack.packs.tangerine.light.accent`,
      with the seeded `brand` untouched and the revision +1.
    - A New pack: read back `packs['custom-1']` and `preset`.
    - The live route answers 422 to a hostile record and writes nothing.
    - A fresh context opens in `custom-1`.
    - Undo back to the seeded `style_pack`, then restore it.
  - `run-verify-lock.cjs`: the reader's pencils, "+ New pack" and rows are greyed. A forced press moves neither the
    canvas nor the revision.
  - `run-verify-dashboard.py`: a new step, `duplicate-carries-packs`.
    - A throwaway user is made Pro through `entitlements.state`, as `pro-connect-t3` does.
    - It holds a project whose `style_pack` carries an own pack.
    - The project menu's Duplicate runs, and the copy's `style_pack`, read off the pooler, equals the source's.
- [ ] Propagation:
  - In `deferred-work.md`, close DW-310 and DW-324 with their proof, and add the DW-66 note.
  - Update `epic-6-context.md`.
  - `EXPERIENCE.md`: the S7 row names the redrawn frames, and the stray-row note is settled.
  - Extend `addendum.md` §AD1's Cloud sync line (`p_packs`).
  - `ARCHITECTURE-SPINE.md`:
    - AD-15's flush carries `packs`.
    - AD-36 gains the record instance.
    - The FR-E row gains `lib/pack-edit.ts` and `style_pack.packs`.
  - Record R-236 and R-237 in `reconcile-designs-decisions.md`.
  - Then grep the repo for `Standard`, `Spacious`, `Corners`, `Title font`, `"Contrast"` in the S7 code, `presetIdOf(`,
    `p_preset` and `flushPayload(` (standing rule 7).

**Acceptance Criteria:**
- Given the Style Pack panel, the Edit pack and New pack windows, the colour picker and the font pairing list, when each
  is open, then it **matches the redrawn frames**: `S7 Style Packs.dc.html` S7a, S7c and S7d, and the frames Question 1's
  prompt adds (the pairing list, the warning, reading along, 834). Where a drawing's word differs, the words of the one
  list win (R-170).
- Given the panel's rows, when they are read, then their titles and steps are Appendix C's Style Pack rows exactly: Site
  width, Radius, Spacing density, Gutters, Button style, Shadow, Link style, with Normal and Airy. The seven colours are
  "{page} · Surface · Text · Muted · Border · Accent · On-accent", and a test holds both.
- Given Light and Dark, when either row's colours or Image scrim are edited, then only that mode's values change: per-mode
  palette editing.
- Given an edit that breaks a pair in `AA_PAIRS`, when it is made, then the warning names the pair, its mode and its
  ratio in words, and marks the swatches with a glyph, not colour alone. Save pack still saves: never a block.
- Given a project's own packs, when it is duplicated, then the copy carries them. When another project is opened, then
  its own packs are its own; no account library exists.
- Given any control in this story, when it is pressed, then it starts no server work: Save pack, the rows and the
  pairing menu commit locally, and the save indicator carries the sync. So no busy label is owed (R-98, and
  `busy.test.ts` stays green), and no route is added.
- Given the keyboard alone, when the journey runs, then every control here is reachable and operable, focus is managed
  in the dialog and the picker, and the app's axe scan stays at zero (NFR-5).
- Given a hostile record in a body or a stored column, when it is sent or read, then it is refused or dropped, and the
  legitimate record still emits (AD-36).
- Given `pnpm build`, when `node tools/check-traces.mjs` runs, then no client chunk carries the pool's record (DW-323).
- Given the story's changes, when the gates run, then these are green: `pnpm check`, `pnpm keyboard` (whole),
  `pnpm build && node tools/check-traces.mjs`, `bash supabase/tests/run-rls-gate.sh`, `bash tools/matrix/run-matrix-gate.sh`
  (after the approved rebaseline), and `python3 tools/doc-audit.py --check`.

## Spec Change Log

## Design Notes

**Why full records keyed by id, not overrides.** A record has the shape §D.d's presets have in `packs.json`, so the
browser schema, the route and the readers check one shape. The compiler (Epic 7) reads one record. Reset to defaults is
"drop the key". An edited preset also keeps its edits when the library later changes that preset. A record runs to
about 700 bytes, and the flush's keepalive allows a body of 60,000 (`editor.tsx:1790`).

**Why a second journal key rather than a wider pack entry.** 6.3's `PACK_KEY` entries are preset-id strings, persisted on
devices. They stay valid as they are. Each key now maps to one stored field (`PACK_KEY` to `style_pack.preset`,
`PACK_RECORDS_KEY` to `style_pack.packs`), the way a doc key maps to a row. A New pack is then 6.3's transaction grouping:
two entries, one edit.

**Why the browser computes an own pack.** Every edit changes the pack's tokens. The engine in the runtime's index is
pool-free (`check-traces.mjs` holds that), so the browser can run it. The fonts' `@font-face` rules need the pool, so the
server hands them over as one string per pairing (`pairingChoices`), as `packChoices` hands each preset's.

**The pencil's place.** The roster is 6.3's listbox: one tab stop, with arrows that move focus and never switch. An
option may hold no button: axe reports `nested-interactive`, and a listbox may contain options only. So the pencils
and "+ New pack" are plain buttons after the listbox in the DOM, laid over the grid where S7a draws them. Keyboard
order is the list (one stop), then each pencil, then "+ New pack", then the rows.

**The dialog.**
- Edit pack opens with focus on the first swatch; New pack opens with focus on the name, as S7d draws it.
- A swatch opens the picker anchored to it (`openPopover`). The square and the hue strip follow pointer and touch, and
  arrow keys move them 1 at a time (10 with ⇧).
- The hex field is the exact path, and every move updates the draft and its swatch.
- Save pack commits the draft as one edit. Cancel throws it away.
- Reset to defaults puts the library's record into the draft; Save then removes the own record.
- The warning updates with the draft. It is announced when its set of failing pairs changes, never per move. Without
  that, a polite region would read a ratio for every pixel of a drag.

**Executed at Create**, in Chromium 149 through the repository's Playwright 1.61.1 (scratch only):
- `CSS.getPlatformFontsForNode` reports a pool face (`fraunces-roman-latin.woff2`, served as `@font-face`) as
  `{"familyName":"Fraunces","isCustomFont":true}`. The same call on a missing family reports
  `{"familyName":"Liberation Serif","isCustomFont":false}`.
  - Latin-ext letters resolve to the pool face too, so `isCustomFont` and the family together prove "drawn from the pool's
    own file".
  - This matters because the matrix image installs a system Inter, so the family name alone cannot tell the two apart.
- A `popover="auto"` opened inside a modal `<dialog>` closes on the first Esc, with focus back on its invoker. The second
  Esc cancels the dialog.
- `navigator.clipboard.readText()` throws `NotAllowedError` without the permission, and reads the text with it. Hence
  Paste's fallback.

**The words (R-170)** — one list, `PACK_EDIT_WORDS`. The panel, the dialog, the announcements and every check read it.

| Where | Words |
|---|---|
| Rows (Appendix C) | **Fonts** — {heading} · {body} · **Site width** — Narrow · Normal · Wide · **Radius** — Sharp · Soft · Round · **Spacing density** — Compact · Comfortable · Airy · **Gutters** — Tight · Normal · Loose · **Button style** — Solid · Soft · Outline · Pill · **Shadow** — None · Subtle · Lifted · **Link style** — Underline · Accent · **Pill radius** — {n} px · Full |
| The seven colours, per mode | {page} (Question 2) · Surface · Text · Muted · Border · Accent · On-accent · and **Image scrim** {n} % |
| Cells | the pencil "Edit pack — {name}" · "New pack" |
| Dialogs | "Edit pack" and "New pack", with S7c's and S7d's subtitles as redrawn · "Pack name" · "Name it — e.g. Studio Warm" · Reset to defaults · Cancel · Save pack |
| Picker | the hex field "{Role}, {Mode} — hex" · "From your site" · Paste · "Press ⌘V to paste into the hex field." · "Not a colour — type #RRGGBB" |
| Name | "Name your pack to save it." |
| Warning | "Hard to read: {pair}[; {pair}…]. Small text needs 4.5:1 — you can still save.", where a pair is "{Fg} on {Bg} in {Mode}, {ratio}:1" |
| Said, once landed | "Changed {name}." (a Save pack) · "Style Pack — {name}" (a New pack; an undo or redo that changes the look in force; 6.3's switch) · "{Row} — {Step}" · "Fonts — {heading} · {body}" |

**Ruled values** — the one place a different ruling changes the plan:

| Question | Planned (RECOMMENDED) | If ruled otherwise |
|---|---|---|
| 1 — the drawing | The redrawn S7 lands before Dev, and the build follows it. | **2:** Dev draws the undrawn parts from the Kit, matching S7a's segmented, the Kit's menu and stepper, and the notice banner. The frame criterion then names S7a, S7c and S7d as drawn, plus the Kit. **3:** Gutters, Shadow, Link style, Pill, Pill radius, Image scrim, the font list and the warning are left out. DW-310 stays open with a named owner, and FR-E3 is met only in part. |
| 2 — the page colour's name, {page} | **Base** — the pack editor's word only | **Page:** also `vocabulary.ts:274`'s `base: 'Page'`, and every check that reads "Base". **Background:** the pack editor only; sections keep "Base". |

**Routine calls, each stated rather than asked:**
- A New pack becomes the pack in force: S7d's "joins your pack grid" over the look you started from.
- A pack is never deleted, because nothing asks for it. A pack made by mistake can be renamed or recoloured.
- Renaming a preset renames it in this project only, and Reset puts its name back.
- "From your site" is one dot, because Ghost stores one accent. S7d's three dots were a drawing.
- Image scrim runs 0–100 % in steps of 5 (presets use 40–65 %). Pill radius runs 0–40 px, or Full (999 px, which eleven
  presets use).
- Remix's Style Pack re-roll draws from the whole roster, own packs included.
- The canvas address for an own pack is its preset's (Paper's for a custom pack), so every cached document stays valid;
  the pack is worn before the first paint.
- A warning's ratio is floored, never rounded up.
- Today no design reads `--scrim`, so an Image scrim edit changes the token block but nothing visible until a design
  draws a photo under text (Epics 9–10). The owner's test says so.

## Questions for the owner

Both are needed before Dev. The plan above follows each one's recommended option, and Design Notes' "Ruled values" table
says what the other options change.

### Question 1 — Parts of the Style Pack editor were never drawn. May I hand you a Claude Design prompt to draw them first?

**In plain English.** Your rule R-74 says every screen is built from a drawing in our Claude Design project, and this
story's plan says the missing parts are drawn before they are built. These parts were never drawn:
- four of the settings rows: gutters, shadow, link style, and the Pill button;
- the list of thirty font pairings;
- the yellow note that warns about hard-to-read colours;
- the controls for how dark photos get under text, and how round pill-shaped buttons are.

I have written the prompt (below this question). It also puts the plan's words on the drawings: "Normal", not
"Standard", and "On-accent", not "Contrast". Building starts once your drawing is back.

**An example.** Today there is no drawing of a "Gutters: Tight · Normal · Loose" row. After the prompt runs, it sits
under "Spacing density" in the same style as the rows above it, and that drawing is what gets built.

1. **Run the prompt in Claude Design and send me the export (RECOMMENDED).** Open the **Inflozo** project in Claude
   Design and start a new chat. Copy the prompt from this spec's section **"The Claude Design prompt (Question 1)"**:
   open the spec in VS Code and copy the grey block. Paste it and let it finish, then look over the new S7 frames.
   Export the project as a zip and save it anywhere on this computer. Then answer with the Record prompt:
   "Ruled: 1 — the export is at <where you saved it>".
2. **Skip the drawing this once.** The build draws the missing parts by copying controls the Kit already has. That is an
   exception to R-74, like the dice (R-163). It is faster, but nothing you have looked at decides how they look.
3. **Leave the undrawn parts out of this story.** Colours, pencils, New pack and the five rows already drawn ship now.
   Gutters, shadow, link style, the Pill button, the font list, the photo and pill controls, and the warning wait for a
   later story. FR-E3 is then only partly done.

**Ruled:** _(awaiting the owner)_

### Question 2 — The colour of the page itself has two names. Which one should it have everywhere?

**In plain English.** In a section's settings, the Background row offers "Base · Surface · Accent · Contrast · Image",
and "Base" means the page's own colour. The plan and the drawing of the Style Pack editor call that same colour
"Background". Your rule R-170 is one name for one thing.

**An example.** You set your pack's page colour to cream. Later, a section's settings show "Background: Base". Base is
that same cream, so it should carry the same name in both places.

1. **"Base" everywhere (RECOMMENDED).** The Style Pack editor's first colour is called Base, like the section setting you
   have already tested. Nothing else changes.
2. **"Page" everywhere.** Both places say Page. Section settings read "Background: Page · Surface · …". It is clearer,
   but it renames a setting you have already tested.
3. **Keep both.** The pack editor says Background and section settings say Base. That breaks R-170.

**Ruled:** _(awaiting the owner)_

## The Claude Design prompt (Question 1)

Paste this whole block into a new chat in the **Inflozo** project in Claude Design. It uses "Base" for the page colour
(Question 2's recommendation). If you rule otherwise, the build uses your word, and the drawing's one label is left as
drawn.

```
INFLOZO — STORY 6.4 · REDRAW S7 STYLE PACKS FOR THE STYLE PACK EDITOR

Work only in "S7 Style Packs.dc.html". Update S7a, S7c and S7d in place, add the new frames below beside them, and
leave S7b exactly as it is. Build every frame from what this project already draws: the Calibration Set's tokens and
type, the Editor Sidebar Kit's controls (segmented control, swatch, font row, select row and dropdown menu with a check
on the active row, stepper, text input, feedback banner, buttons), P0-0's greyed pattern and D8's Controls overlay.
Invent no new component and no new colour.

WHY. The Style Pack editor is being built now. The product plan decides what it does; these frames decide what it
looks like. In a few places S7 and the plan disagree, and some parts were never drawn. Where this prompt gives a word,
use that word exactly: the product keeps one name for one thing everywhere.

THE WORDS
- The panel's rows, in this order, each the Kit's segmented control unless said otherwise:
  Fonts · Site width: Narrow · Normal · Wide · Radius: Sharp · Soft · Round · Spacing density: Compact · Comfortable ·
  Airy · Gutters: Tight · Normal · Loose · Button style: Solid · Soft · Outline · Pill · Shadow: None · Subtle ·
  Lifted · Link style: Underline · Accent · Pill radius.
  These replace S7a's "Standard", "Spacious", "Corners", "Density" and "Buttons". "Spacious" is a section's own
  Vertical spacing word and must not appear in the Style Pack panel.
- A pack's seven colours, per mode, in this order: Base · Surface · Text · Muted · Border · Accent · On-accent.
  The swatch S7c and S7d label "Contrast" is the colour of words on the accent: it is On-accent. "Contrast" already
  names a section background, so it is not used here. "Base" is the page's own colour, the word a section's
  Background setting already uses for it.
- A pack's fonts are one curated pairing, never two free choices: one row titled "Fonts", showing
  "Heading · Body", for example "Fraunces · Inter".

WORK LIST
1. S7a, the panel — update in place.
   a. The roster's names are the plan's twelve, in this order: Paper, Ink, Orbit, Tangerine, Slate, Meadow, Dune,
      Mono, Ocean, Berry, Neon, Quiet (S7a's own caption says its names were placeholders). Keep the custom cell,
      "Maya's Warm", after them, and "+ New pack" last.
   b. Every cell carries the same "Edit pack" pencil in its top-right corner, presets and custom packs alike. Draw
      the custom cell exactly like a preset cell, with no dashed underline under its name: a pack is renamed in
      Edit pack.
   c. Below the roster, the rows from THE WORDS, in that order, for the pack in force.
      - The Fonts row is the Kit's font row: "Aa" in the heading face, the label, the value "Fraunces · Inter", a
        chevron.
      - Pill radius is how round pill-shaped things are: tags, and buttons when Button style is Pill. Draw it as the
        Kit's stepper in whole pixels from 0 to 40, plus "Full" for fully round ends, which is what most packs use.
      - The panel scrolls inside itself when the rows do not fit the 900 px frame.
2. NEW S7e — the font pairing list, open. Pressing the Fonts row opens the Kit's dropdown menu over the panel, a
   column of pairings that scrolls inside itself.
   - Each row is "Ag" in that pairing's heading face, then "Heading · Body" in the app's own font, with a check on
     the pairing in force.
   - Draw at least these rows, in this order: Fraunces · Inter; Libre Caslon Text · Source Serif 4; Space Grotesk ·
     Inter; Bricolage Grotesque · Inter; Instrument Sans · Inter; Gantari · Nunito Sans; DM Serif Display · DM Sans;
     Archivo · IBM Plex Mono. Show that the list continues: it holds thirty.
3. S7c, Edit pack — update in place.
   a. The swatch labels from THE WORDS, seven per mode.
   b. For each mode, an "Image scrim" control: how strongly a photo is darkened under text laid over it, from 0 % to
      100 % in steps of 5 (Light 45 %, Dark 60 % for Tangerine). Use the Kit's stepper.
   c. Keep Reset to defaults (it puts a preset back as the plan authored it), Cancel and Save pack.
4. NEW S7h — Edit pack with the contrast warning and the colour picker.
   a. Under the swatch rows, the Kit's feedback banner in its marigold notice kind, with one warning icon and one plain
      sentence: "Hard to read: Muted on Surface in Dark, 3.2:1. Small text needs 4.5:1 — you can still save."
      Mark each swatch in a failing pair with the same small warning icon, so the warning is never carried by colour
      alone. Save pack stays the ink button and stays pressable: this is a warning, never a block.
   b. The colour picker open on the Dark Muted swatch: the popover S7d draws (square, hue strip, From your site, hex
      field and paste), anchored to that swatch. The hex field's label names its role and mode: "Muted, Dark — hex".
5. S7d, New pack — update in place.
   a. Delete the third row ("Dark · Base · Surface · Accent · Contrast", four swatches). A pack is the two
      seven-colour rows. Anchor the colour picker to the swatch that opened it.
   b. "From your site" offers the connected site's own accent colour, as one dot. Leave it out when no site is
      connected.
   c. No Reset to defaults here: a new pack has no defaults.
   d. Draw the state after Save pack is pressed with the name empty: the Kit's field error under Pack name, "Name your
      pack to save it."
6. NEW S7f — reading along. Another window holds the editor, so this one only looks. Draw the S7a panel with every
   cell, pencil, "+ New pack" and row greyed by P0-0's pattern, the values still readable.
7. NEW S7g — tablet, 834. Draw the panel inside D8's Controls overlay over the canvas (the list, then the rows,
   scrolling), and Edit pack centred over the editor at the same width.

OUTPUT
- Update "S7 Style Packs.dc.html" only. Label each new frame like the others, for example "S7e · font pairing list ·
  1440".
- End the file with "Patch notes — Story 6.4": every change, one line each.
- If an instruction cannot be followed without inventing a decision, do not ask in the chat and do not guess. Record it
  in the patch notes marked OPEN FOR THE OWNER: one sentence on what you would have needed to know, and what you did
  instead. Then carry on with the rest.
- Export the project as a zip.
```

## Owner's manual test

Do this on the real site after Deploy confirms the build, on a laptop at full width, in **Pilot sections**. Steps 12
and 13 put Paper back. Duplicating a project needs a plan with room for another project. Your accounts are on Free and
already hold their one project, so the deployed walk proves duplication instead.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor | Click the grey area beside the page, then **Change**. | — | The Style Pack list. Every pack has a small pencil, and **+ New pack** is last. Below the list are **Fonts**, **Site width**, **Radius**, **Spacing density**, **Gutters**, **Button style**, **Shadow**, **Link style** and **Pill radius**. Site width reads Narrow · Normal · Wide, and Spacing density reads Compact · Comfortable · Airy. |
| 2 | same | Edit pack | Click **Paper**'s pencil. | — | The Edit pack window: Pack name "Paper", then Light and Dark rows of seven colours (Base · Surface · Text · Muted · Border · Accent · On-accent), each row with Image scrim. Below are **Reset to defaults**, **Cancel** and **Save pack**. |
| 3 | same | Colour picker | Click the Light **Accent** colour. In the hex field, select the text and type the dummy colour, then press **Enter**. | `#1E6BFF` | A small picker with a square and a rainbow strip. The Accent colour turns blue. |
| 4 | same | Edit pack | Click the Light **Text** colour and type the dummy colour in its hex field. | `#DDDDDD` | A yellow note appears: "Hard to read: Text on Base in Light, …:1. Small text needs 4.5:1 — you can still save." The Text colour carries a small warning sign. **Save pack** still works, but don't press it yet. |
| 5 | same | Edit pack | Type the dummy colour into the Text hex field, then click **Save pack**. | `#232019` | The yellow note goes away and the window closes. The page's buttons and links turn blue, and Paper's dots in the list show the blue. |
| 6 | same | Editor | Press **⌘Z**, then **⇧⌘Z**. | — | ⌘Z puts Paper's own orange back. ⇧⌘Z makes it blue again. |
| 7 | same | Style Pack list | Click **Wide** under Site width, **Pill** under Button style and **Underline** under Link style. | — | The page gets wider, its buttons get fully round ends, and its links go plain with an underline. |
| 8 | same | Font pairing list | Click the **Fonts** row and pick **Lora · Lato**. | — | A list of thirty pairings, each showing "Ag" in its own font. After you pick, the page's headings change to Lora and its text to Lato. |
| 9 | same | New pack | Click **+ New pack**, then click **Save pack** without typing a name. | — | "Name your pack to save it." under the name, and nothing is saved. |
| 10 | same | New pack | Type the dummy name. Click the Light **Base** colour and type the dummy colour, then click **Save pack**. | `Studio Warm`, then `#FFF4EA` | "Studio Warm" appears in the list, ringed and current, and the page turns cream. |
| 11 | same | Editor | Click the grey area and press **⌘S**. Wait for the green tick, then reload the page. Then click the back arrow to Projects. | — | The page reopens in Studio Warm, with Paper still blue in the list. On Projects, the Pilot sections card is cream. |
| 12 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51`, in a second window | Editor, read-only | Open the same project in a second window, click the grey area, then **Change**. | — | Every pencil, **+ New pack** and every row is greyed, and clicking does nothing. |
| 13 | same, in the first window | Edit pack | Click **Paper**'s pencil, click **Reset to defaults**, then **Save pack**. Click **Paper** in the list, then click the grey area and press **⌘S**. | — | Paper is back as it was, orange accent and Fraunces headings, and it is current. Studio Warm stays in this project's list: nothing in the plan or the drawings deletes a pack, so this story has no Delete. Say so if you want one. |
| 14 | same | Editor, narrow | Make the window about 1,000 px wide, open **⋯**, choose **Style Pack**, then click a pencil. | — | The list and its rows open on the right, and the Edit pack window opens over the page. Press **Esc** to close it. |
| 15 | same | Edit pack | Click **Paper**'s pencil and change Light **Image scrim** to 70 %. Click **Cancel**. | — | Nothing on today's page darkens a photo yet, so the page does not change; the setting is kept for sections that will. Cancel leaves Paper as it was. |

## Verification

**Commands:**
- `node --test apps/web/pack-edit.test.ts apps/web/journal.test.ts apps/web/style-pack.test.ts apps/web/editor.test.ts apps/web/pilots.test.ts`
  -- expected: pass. Controls, each run in a scratch copy:
  - with `hardToRead`'s floor taken out, the 4.46 case prints 4.5 and fails;
  - with `ownPacksOf` keeping every entry, the hostile-record cases fail.
- `node --test packages/section-runtime/src/packs.test.ts packages/section-runtime/src/ad36.test.ts` -- expected: pass.
  6.2's control (Tangerine light on-accent `#FFFFFF`) is still caught through `AA_PAIRS`.
- `pnpm check` and `pnpm keyboard` (whole, never `--grep`) -- expected: green.
- `pnpm build && node tools/check-traces.mjs` -- expected: "every route carries its files", and no client chunk carries the
  pool's record.
- `bash supabase/tests/run-rls-gate.sh` -- expected: green with the Story 6.4 block. With the migration withheld (a scratch
  copy), it aborts at that block.
- `bash tools/matrix/run-matrix-gate.sh --update`, in the image -- expected: the specimens and the new contrast cases move,
  and nothing else does. Then the owner's sampled review. After his approval, `bash tools/matrix/run-matrix-gate.sh` --
  expected: green.
- `python3 tools/verify-design-pass.py` and `python3 tools/inventory-gen.py --check` after the export lands -- expected:
  green.
- `python3 tools/doc-audit.py --check`, twice -- expected: green.

**Real services (R-82):**
- **Supabase production**:
  - Through `SUPABASE_DB_POOLER_URL`: the Schema apply and its read-back.
  - Over PostgREST, as throwaway users deleted afterwards (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
    `SUPABASE_PUBLISHABLE_KEY`): the four-argument call still applies, and the five-argument call writes `packs`.
  - After the walks: `projects.style_pack` and `revision` read back.
- **app.inflozo.com**, each walk with its own throwaway accounts, deleted afterwards:
  - `run-verify-editor.cjs` step 103: an edit, a New pack, the 422 and a fresh context.
  - `run-verify-lock.cjs`: the reader's greyed editor.
  - `run-verify-dashboard.py` `duplicate-carries-packs`.
- **GitHub Actions and Vercel** (`GITHUB_TOKEN`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`): `check`, `rls`, `deploy` and
  `matrix.yml` green on the head, and production READY from it.
- **Not touched:** T1 and T3 (no theme), Resend (no email), Dodo (no billing).
