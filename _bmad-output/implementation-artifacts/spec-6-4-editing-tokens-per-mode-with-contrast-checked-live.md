---
title: 'Story 6.4 — Editing tokens, per mode, with contrast checked live'
type: 'feature'
created: '2026-10-04'
status: 'in-review'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '423e9173ff88662fd9e5cb1091fdfb7287dd2f51'
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

**Approach:** The parts no frame draws are built from the drawings that exist, exactly: S7a's rows and cells, S7c's
dialog, S7d's colour picker, the Editor Sidebar Kit's controls, P0-0 and D8. They are checked against those drawings
value for value and shown side by side. This is R-236, R-74's one stated exception: for this story only, there is no
Claude Design pass. The panel takes FR-E1's and Appendix C's words, one name per thing (R-170). The page's own colour is
"Base", as it already is in a section's settings (R-237). A project's own packs are its edits to a preset and the packs
it makes. Each is a full authored record in `projects.style_pack.packs`.
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
- **Built from the existing drawings, exactly (R-236).**
  - A part S7a, S7c or S7d draws takes that frame's values: size, radius, padding, type, colour and shadow.
  - A part none of them draws is the Kit's own drawing of that control, placed as the nearest frame places its siblings
    (Design Notes' "Built from" table). No new component, colour or size.
  - A value a frame draws that has no app token becomes a token, added to `globals.css`'s @theme and DESIGN.md's front
    matter (both held by `tokens.test.ts`); never a literal.
  - The values are held by a computed-style check, and the owner sees every built state beside its drawing before the
    Dev commit.
- **One word list** (R-170, R-237): every surface, announcement and check reads `lib/pack-edit.ts`'s words (and 6.3's
  `PACK_WORDS`), and these win over a drawing's word wherever the two differ. The rows' titles and steps equal Appendix
  C's Style Pack rows, and a test checks it. Counts are derived. Node 24. `pnpm keyboard` is run whole before the Dev
  commit.

**Ask First:**
- The production apply of the migration. If the permission classifier refuses it, ask the owner in the session; never
  route it through a subagent.
- The mass rebaseline that DW-324's changes cause: it needs the owner's sampled review in the Dev session
  (`docs/render-matrix.md`).
- A part the "Built from" table does not cover, or a value neither its frame nor the Kit drawing gives: ask, never
  invent. R-236 waives R-74's drawing step for this story; it does not waive R-74's sources.

**Never:**
- No account-level pack library (FR-E3, Appendix G). No deleting a pack (no requirement or frame asks for one). No hover
  preview. No colour picker, hex field or font list anywhere but the Style Pack editor (DESIGN.md:586, Appendix C).
- No brand seed and no logo (Story 6.6). "From your site" offers the site's accent as a colour to pick, and writes
  nothing until it is picked. No change to mode resolution (6.5) or theme emission (Epic 7). No `next/font`, no font
  host, no `*-tokens.css` file. No edit to the design export (R-74); this story adds nothing to it (R-236).
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
| A pairing | the Heading font or the Body font row → Lora · Lato | one edit (`pairing: 'D15'`); both rows now read Lora and Lato; the canvas waits for its faces, up to `FACES_WAIT_MS`, then restyles; "Font pairing — Lora · Lato" | a late face swaps in on arrival |
| Hex field | `#1e6bff`, `1E6BFF`, `#1af`, ` #1E6BFF ` | each becomes `#1E6BFF` (three digits expanded) and the swatch follows | `#12`, `blue`: "Not a colour — type #RRGGBB"; the swatch keeps its last valid colour |
| Paste | the clipboard holds `#2F4A3E` | the field takes it and the swatch follows | refused or unsupported: focus the hex field and say "Press ⌘V to paste into the hex field." |
| From your site | a linked site whose stored brand accent is `#2f4a3e` | one dot "From your site", `#2F4A3E`; a press makes it the draft's colour | no linked site or no valid accent: no row |
| Read-only | another window holds the lock | the list opens; every cell, pencil, "+ New pack", row and both font rows are greyed and unclickable; nothing journaled | `commit`'s guard |
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

**The frames and the Kit drawings the build follows** (R-236; Design Notes' "Built from" table gives every value):
- `Editor Sidebar Kit.dc.html`: segmented :63-82, swatch row :83-98, stepper :99-108, select rows and menus (the font
  row and the dropdown menu, check on the active row) :109-125, pack cards :204, feedback banners :238-250.
- `D8 Editor Below 1440.dc.html`: D8a at 834 :40, D8b at 720 :172, D8a's overflow menu :280. `P0-0 Greyed Control
  Pattern.dc.html` is the greyed treatment.
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

**Both questions are ruled** (R-236, R-237; see Design Notes' "Rulings"), **so Dev can open.** Nothing waits on a
drawing.

**Who does what in Dev.** The implementation builds and tests everything below, and leaves on disk the R-236
screenshots and DW-324's before/after pairs, naming their paths. The orchestrating session publishes the private review
page, asks the owner (R-83), and makes the Dev commit, the baselines-only commit and the push after his approval: nothing
is committed or pushed before it, and no deployed walk runs before the Dev push has deployed.

**Execution:**
- [x] **SCHEMA FIRST, ALONE (R-99)**. Files: `supabase/migrations/20261004200000_sync_style_pack_packs.sql`, `SCHEMA.sql`,
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
- [x] `packages/section-runtime/src/tokens.ts`, `index.ts`, `packs.test.ts`. Export `AA_PAIRS`, the five role pairs, and
  make 6.2's sheet read it, with its control intact (Tangerine light on-accent `#FFFFFF` still caught). This makes one
  list for the preset sheet and the live warning.
- [x] `packages/section-runtime/src/ad36.test.ts`. Add AD-36's instance "a project's own Style Pack record (Story 6.4)":
  `packTokens` refuses each hostile authored value by name, and the legitimate record emits. The hostile values are a
  colour carrying `;}`, a pill radius carrying `;}`, a scrim outside 0–1, a step not in `SCALES`, and a family list with
  an unbalanced quote.
- [x] `apps/web/lib/pack-edit.ts` (new). It is pure and reachable by `node --test`; it imports the runtime index,
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
- [x] `apps/web/lib/style-pack.ts`:
  - `stylePackSchema` carries `packs`.
  - `ownPacksOf(stylePack)`: the valid records under valid ids, junk dropped; it never throws.
  - `packIdOf(stylePack)`: the id in force. That is a preset, or a custom id that `ownPacksOf` holds; anything else is
    Paper.
  - `packChoices()` derives each preset through `choiceOf`, each carrying its `record`. Paper's `tokens` stay
    `referenceTokensCss()`.
  - `pairingChoices()`: for each pool pairing, its id, two families, glyph family, `pairingFonts`, canvas `faces`
    (`fontFaceCss(…, fontHref('canvas'))`) and families.
  - `pairingGlyphFacesCss(base)`: the prefixed roman faces of every pool family that the layout's `packFacesCss` does
    not already declare, for the two font rows and the pairing menu. A browser fetches only the faces it draws.
  - `placeholderFor` paints an own pack's light background, text and accent. The brand accent still wins (FR-C4).
- [x] `apps/web/lib/journal.ts` and `apps/web/lib/local-store.ts`:
  - `PACK_RECORDS_KEY` (`'pack-records'`, never a template key). Its entries' `before` and `after` are the whole `packs`
    map.
  - `Restore.packs`.
  - `flushPayload(j, docs, preset?, packs?)` answers `{ docs, preset?, packs? }`.
  - `carries`, `owedOf` and `sendBody` carry `packs`; `ownFlushLanded` compares them.
  - `hydratedPacks(how, local, cloud)` follows `hydratedPreset`'s rule.
  - `LocalRecord.packs?` and `MetaRow.packs?`. A record from before 6.4 has none, and takes the server's.
- [x] `(authed)/projects/[id]/sync/route.ts`:
  - It takes an optional `packs`, validated before the write: every entry must survive `ownPacksOf`, else 422 "Not a
    Style Pack".
  - `preset` is a library preset or a `CUSTOM_ID`, and a body carrying only `packs` is a write.
  - It passes `p_packs`.
  - The adopt read compares `style_pack.packs` too (`stable`), under the same one-write-past rule.
- [x] `(editor)/read.ts` and `app/harness/editor/layout.tsx`:
  - The editor is handed:
    - `preset: packIdOf(style_pack)` and `ownPacks: ownPacksOf(style_pack)`;
    - `packs: packChoices()`, `pairings: pairingChoices()` and `pairingFaces`;
    - `siteAccent`: the linked site's stored brand accent, through `isAccent`, as `#RRGGBB`, else null.
  - In the harness, `x-inflozo-harness-pack: custom-1` opens on a fixture custom pack (Paper's record renamed, with an
    accent of its own), and `-site` supplies a site accent.
- [x] `apps/web/lib/canvas.ts`, `components/editor/section-preview.tsx`, `design-picker.tsx`, `section-picker.tsx`:
  - The `pack` prop becomes the in-force `PackChoice`.
  - A preview asks for its preset's address (Paper's for a custom pack), and on load wears the pack's `tokens` and
    `faces` by the editor's own rule; `wear` moves into a shared function.
  - So the previews and the ring's tiles wear an own pack.
- [x] `(editor)/style-pack.tsx` and `components/kit/pack-cell.tsx`:
  - The roster lists the twelve presets in §D.d's order, each shown as its own record where one exists, then the custom
    packs by number.
  - A preset cell's corner pencil, a custom cell's name-and-pencil, and "+ New pack" are buttons OUTSIDE the listbox,
    named "Edit pack — {name}" and "New pack". Each is placed and drawn exactly where S7a draws it ("Built from"). An
    option holds no interactive content, and the listbox holds options only.
  - Below the roster come the rows for the pack in force, in this order, each as the "Built from" table gives it:
    - **Heading font** and **Body font**, S7a's two font rows. Each opens the one pairing menu (accessible name "Font
      pairings"): "Ag" in each pairing's heading face, the heading family over the body family, the pairing in force
      checked, the menu scrolling inside itself.
    - **Site width, Radius, Spacing density, Gutters, Button style, Shadow and Link style**: S7a's segmented rows, through
      the Kit's `Segmented` in S7a's dense geometry.
    - **Pill radius**: the Kit's `Stepper` in a row of the same shape.
  - All of it sits inside `ReadOnly` for a reader.
- [x] `(editor)/pack-editor.tsx` (new) — the Edit pack and New pack dialog, S7c and S7d as drawn, with the "Built from"
  table for every part they do not draw:
  - **The dialog.** It is portalled into `[data-editor]` and opened with native `showModal()`. Focus starts on the name
    field for New pack and on the first swatch for Edit pack. Pack name is a `TextInput` with a 40-character limit.
  - **The swatches.** There is a Light row and a Dark row of seven swatch buttons. Each is named "{Role}, {Mode},
    #RRGGBB", with "hard to read" added where it fails. Under the two rows is one Image scrim row: for each mode, the
    mode word and the Kit's `Stepper`, 0–100 % in steps of 5.
  - **The colour picker**, a popover `openPopover` opens from the swatch:
    - the square: pointer, touch and arrow keys; `role="slider"` with its value in words;
    - the hue strip: `role="slider"`;
    - "From your site", shown only when there is a `siteAccent`;
    - the hex field: a `TextInput mono` that applies a valid `#RRGGBB` or `RRGGBB`, and otherwise says "Not a colour —
      type #RRGGBB";
    - Paste, which calls `navigator.clipboard.readText()`. If that is refused, it focuses the hex field and says "Press
      ⌘V to paste into the hex field."
  - **The warning.** A `Banner` notice under the rows, from `hardToRead`. Each failing swatch carries the banner's
    triangle in a corner circle, as the "Built from" table draws it. The warning is announced when it appears, changes or
    clears, and never once per pointer move.
  - **The buttons.**
    - Reset to defaults appears for a preset only, and makes the draft the library's record.
    - Cancel, ✕, Esc and the backdrop discard the draft.
    - Save pack with an empty name puts the `TextInput` error "Name your pack to save it." and saves nothing. Saving an
      unchanged draft closes with no edit.
  - **Colours** are spelled `white`, `black`, `transparent` and computed `hsl()`, never a literal (`tokens.test.ts`).
- [x] `(editor)/editor.tsx`:
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
- [x] Unit tests:
  - `apps/web/pack-edit.test.ts` (new):
    - the schema refuses each vector and accepts the legitimate record.
    - `CUSTOM_ID` and `nextCustomId`.
    - `choiceOf` on Paper's record equals `packChoices()`'s Paper, apart from the generated header of its `tokens`.
    - `hardToRead` over the five pairs. Control: Paper passes, and Paper with text `#DDDDDD` fails "Text on Base in
      Light".
    - the ratio floor; `withoutDefaults`.
    - every preset colour survives `hexToHsv` then `hsvToHex`.
    - the words:
      - the rows' titles and steps equal `prd.md` Appendix C's Style Pack rows and `SCALES`' keys;
      - the font rows are Heading font and Body font, and the first colour is Base (R-237);
      - none is Standard, Spacious, Corners, Title font, Background or Contrast.
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
- [x] DW-324 — `tools/matrix/cases.mjs`, `matrix.spec.mjs`, `cases.test.mjs` and `docs/render-matrix.md`:
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
- [x] `tools/keyboard/journey.spec.mjs`, keyboard only. New stops:
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
  - **At 834 with touch** *(Dev, 2026-10-04 — in `tools/keyboard/floor.spec.mjs`, whose D8a sweeps may tap)*: ⋯ → Style
    Pack, then Edit pack, then the colour picker, each swept for D8a's 44 px; a pencil's 17 px circle stays where S7a
    draws it, its target is centred on it, and a tap on the middle of a pack chooses that pack.
- [x] **R-236's check: the build matches its drawings, measured and seen.** *(Dev, 2026-10-04: the measured half green
  behind its 1px control; seen side by side on the private review page and approved by the owner in the Dev session,
  Question 4.)*
  - **By computed style.** A stop in `tools/keyboard/journey.spec.mjs` runs on the harness at 1440. It opens each state:
    the panel with its rows, the pairing menu, Edit pack, New pack showing its name error, the colour picker and the
    warning. For each, it reads every value the "Built from" table gives (sizes, radii, paddings, type, colours,
    shadows) and compares it to the table. Control: a deliberate 1 px change to one value, made in a scratch edit and
    restored, turns the stop red.
  - **By eye.** Dev takes a screenshot of each state at 1440, and of the overlay at 834. Each goes beside the drawing it
    follows: S7a, S7c and S7d through `tools/view-designs.py`, and the Kit's drawing for the parts no frame draws.
    - They share the private review page with DW-324's rebaseline, and the owner approves both in the Dev session with
      one R-83 ask, before the Dev commit.
    - A mismatch he names is fixed first.
- [x] Deployed walks (R-82): *(Dev, 2026-10-04: written and syntax-checked — step 103, the lock walk's 6.4 checks and
  `duplicate-carries-packs`. They are NOT run yet: they run at Review, once the Dev push has deployed, and their results
  go under `## Verification`. No ledger entry is closed on them.)*
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
- [x] Propagation:
  - In `deferred-work.md`, close DW-310 and DW-324 with their proof, and add the DW-66 note.
  - Update `epic-6-context.md`.
  - `EXPERIENCE.md`: the S7 row says the parts no frame draws are built from the existing drawings (R-236). The
    stray-row note (:2023-2027) says S7d's third row is the drawn popover's anchor and is not built.
  - Extend `addendum.md` §AD1's Cloud sync line (`p_packs`).
  - `ARCHITECTURE-SPINE.md`:
    - AD-15's flush carries `packs`.
    - AD-36 gains the record instance.
    - The FR-E row gains `lib/pack-edit.ts` and `style_pack.packs`.
  - Tick the ⬜ targets of R-236 and R-237 in `reconcile-designs-decisions.md`.
  - Then grep the repo for `Standard`, `Spacious`, `Corners`, `Title font`, `"Contrast"` in the S7 code, `presetIdOf(`,
    `p_preset` and `flushPayload(` (standing rule 7).

**Acceptance Criteria:**
- Given the Style Pack panel, the Edit pack and New pack windows, the colour picker and the font pairing menu, when each
  is open, then it **matches its drawing value for value** (R-236). Where `S7 Style Packs.dc.html` S7a, S7c or S7d
  draws it, it matches that frame. Where they do not, it matches the Kit's own drawing, placed as the "Built from"
  table places it. The computed-style stop holds this, and the owner sees it side by side before the Dev commit. Where a
  drawing's word differs, the one list's word wins (R-170, R-237).
- Given the panel's rows, when they are read, then their titles and steps are Appendix C's Style Pack rows exactly: Site
  width, Radius, Spacing density, Gutters, Button style, Shadow, Link style, with Normal and Airy. The font rows are
  Heading font and Body font. The seven colours are "Base · Surface · Text · Muted · Border · Accent · On-accent"
  (R-237). A test holds all three.
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

### Review Findings

*Code review, 2026-10-04 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier, the last run in the main session). The four reading layers ran over `423e9173..b038bac5` in a first session
that was cut off before it recorded anything; this session read their four reports, triaged them against the code and
finished the review (no file of the story changed in between). Every patch below is applied in the Review commit, and
each new check was seen red with its fix taken out. No finding is the owner's to decide. The rest were dismissed:*
- *as the spec's own words — each Pill radius press is one edit; a stored record that fails the schema is dropped; the
  warning's glyph marks the words (Spec Change Log);*
- *as held elsewhere — a renamed token cannot draw empty dots, because `pilots.test.ts` holds every swatch to
  `referenceSwatches`, which throws; the reader's rows are dimmed by the sidebar's own 55 % (`run-verify-lock.cjs`
  measures it); the dashboard walk's accounts are deleted in a `finally`; the axe scan over the list, the pairing menu,
  Edit pack and the picker is step 103's, run at this Review;*
- *as reachable only by a hand-made body or a hand-edited device, and then harmless — a `custom-<n>` preset naming no
  pack reads as Paper; a pill radius off the stepper's steps; a tampered copy at sign-out or in an undo; the 9,999-pack
  ceiling;*
- *as measured or cosmetic — the pairings' faces in the editor's payload (gzipped sizes under `## Verification`);
  `placeholderFor` validating twice; two packs sharing a name; a paste answered after another swatch was opened during
  the browser's own permission prompt.*

- [x] [Review][Patch] **A half-typed hex applied a colour nobody chose.** The field applied three digits as it was
  typed, so `#1E6` on the way to `#1E6BFF` made the draft `#11EE66`, and stopping there kept it — Save pack would have
  saved it. Six digits now follow the typing; three wait for Enter or for the field to be left
  [`pack-editor.tsx`; `journey.spec.mjs`]
- [x] [Review][Patch] **On white, black or a grey, the first press on the hue strip was lost.** The press takes focus
  from the hex field, whose blur re-read the same colour and reset the hue to 0. A colour the draft already holds is now
  left alone. The picker had no pointer or touch check at all: the tablet sweep now taps the strip and the square
  [`pack-editor.tsx`; `floor.spec.mjs`]
- [x] [Review][Patch] Enter in Pack name did nothing; it is Save pack now, as in the Layers Rename dialog
  [`pack-editor.tsx`; `journey.spec.mjs`]
- [x] [Review][Patch] **The save's body for own packs ran in no CI check** — dropping `packs` from the editor's request
  left every gate green and an own pack never reached the server. A new stop reads the body: a Save pack then ⌘S sends
  the whole map and no preset; a New pack sends its record and its switch in one body [`journey.spec.mjs`]
- [x] [Review][Patch] A reload with a New pack not yet sent was never exercised, and this device's copy was never tested
  as untrusted (AD-36): a new stop plants a record naming no pool pairing and one carrying CSS beside a real pack, reloads,
  and holds the pack in force, the planted ones dropped and ⌘Z still working [`journey.spec.mjs`]
- [x] [Review][Patch] "From your site" on a real project had no check: `siteAccentOf` moves to `lib/style-pack.ts`,
  where a unit test reaches it [`lib/style-pack.ts`; `read.ts`; `style-pack.test.ts`]
- [x] [Review][Patch] DW-324's face check could not tell Alegreya from Alegreya Sans (D30's heading and body): the
  longest of the page's families that fits a reported name now owns it [`tools/matrix/matrix.spec.mjs`]
- [x] [Review][Patch] The specimen test's "body roman at its heaviest" was satisfied by the bold italic run
  [`tools/matrix/cases.test.mjs`]
- [x] [Review][Patch] The lock walk's "forced press" clicked a disabled button, which the browser never dispatches, so
  it proved only the greying. It now lifts `disabled` for the three presses, so the lock guard underneath is what
  refuses [`tools/probe/run-verify-lock.cjs`]
- [x] [Review][Patch] `epic-6-context.md` still gave the column as `{ preset, brand? }` [`epic-6-context.md`]
- [x] [Review][Defer] "Use your brand" writes the whole `style_pack` back with no revision check, so it can overwrite
  packs saved at the same moment [`sites/actions.ts`] — deferred, pre-existing; DW-327, Story 6.6
- [x] [Review][Patch] An own pack a later build could no longer read would be dropped at read, and the next pack save
  would then overwrite the column without it. Nothing removes or renames a pairing or a step today, so the rule now
  sits beside the two lists a change would touch: migrate the stored packs first [`packages/library/src/packs.ts`
  `POOL`; `packages/section-runtime/src/tokens.ts` `SCALES`]

## Spec Change Log

- **2026-10-04 · Dev — the frames draw in CSS's content-box.** Measured on the frames themselves: S7c's `width:520px;
  padding:28px` is a 576px box, S7d's 206px picker a 232px one, S7a's 15px pencil 17 across, the 40px name field 42 tall.
  The app is border-box, so each such part says `box-content`: its computed size is the table's value (520, 206, 15,
  40…) and the box drawn is the frame's. The 520 sheet is `kit/dialog.ts`'s `wideSheet`; the connect dialog, which drew
  the same 520 border-box (520 outer, 56px narrower than its own S11b frame), is left as approved — flagged, not changed.
- **2026-10-04 · Dev — words the table did not give, each the smallest that works (R-170 kept: one list).** The warning's
  clearing is said as "Nothing is hard to read now." (the Boundaries ask it to be announced; the table words only the
  warning). The picker's two sliders are named "{Role}, {Mode} — saturation and brightness" and "— hue", their values
  "saturation n %, brightness n %" and "hue n°". All in `PACK_EDIT_WORDS`.
- **2026-10-04 · Dev — the warning's glyph marks the WORDS that are hard to read** (a failing pair's foreground: Text,
  Muted or On-accent), as the owner's test step 4 reads ("The Text colour carries a small warning sign").
- **2026-10-04 · Dev — the Kit grew, and drew nothing new:** `Segmented` a `dense` variant (S7a's geometry);
  `StepperBox`, the Kit stepper's own box, for rows that place their own label; `TextInput` S7c's 40 and S7d's 30
  (content-box) and `labelHidden`; `FontRow` live; `Menu` a row's `contents` and a `width`; `Banner` `live={false}`;
  `PackPencil`, `CustomName` and a live `NewPackCell` (its frame's coral-deep words on hover); `Clipboard`, S7d's own
  glyph. The tokens `ink-wash`, `swatch`, `thumb` and `hue-thumb` joined `globals.css` and DESIGN.md.
- **2026-10-04 · Dev — a custom pack's name is one line**, ending in an ellipsis where the 280px panel (S7a draws 320)
  cannot hold it, with the whole name as the button's title; a forty-character name never makes its row taller.
- **2026-10-04 · Dev — the harness's `custom-1`** is Paper renamed "Harness Pack" wearing Ocean's light accent AND its
  on-accent, so the fixture opens with nothing hard to read (Tangerine's accent under Paper's ink read 4.1:1).
- **2026-10-04 · Dev — DW-324's font check accepts a style after the family.** In the image the instanced Chivo names
  itself "Chivo Medium" (its own name table) while `isCustomFont` is true; the check is `isCustomFont` and the family, or
  the family and a style.
- **2026-10-04 · Dev — the rebaseline moved one photograph it should not have, by one pixel at 1/255**
  (`a22/1/neon-dark-1440-reduced-motion-visitor-anonymous.png`, `--update`'s re-take-all): put back as it was; the gate is
  green either way.
- **2026-10-04 · Dev — the doors on a touch screen (D8a, executed at 834 × 1112 with touch).** The editor's 44 px rule
  made each pencil, then its own bordered button, a 46 px circle over its pack's name, and pushed a custom pack's name
  below its line onto the dots; ⋯ → Style Pack had never been swept on touch. Now the circle is a drawing inside the
  button, the target is centred on it, and the name keeps its line. `floor.spec.mjs`'s D8a sweep opens the Style Pack
  list, Edit pack and the picker. Controls, each a scratch edit restored: the circle grown with its target, red at "S7a's
  circle"; the target grown from the circle's corner, red at "centred"; and with that check off, red at "a tap on the
  middle of a pack chooses it", where the corner-grown target covered the middle.
- **2026-10-04 · Dev — two stops beyond the list:** the I/O matrix's "Reload, unsynced" row (an own pack's edit kept on
  the device and undone after F5), and an undo or redo whose map is passed through `ownPacksIn` like the hydrate's —
  the journal's copy reaches CSS too (AD-36).

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
option may hold no button: axe reports `nested-interactive`, and a listbox may contain options only. So every Edit pack
door and "+ New pack" are plain buttons placed after the listbox in the DOM. They are laid over the grid exactly where
S7a draws them:
- a preset's corner pencil;
- a custom pack's dashed name with its inline pencil;
- the dashed "+ New pack" cell.

On a touch screen each door is the editor's 44 px target (D8a's one rule in `globals.css`), and the drawing does not
move: a pencil's circle is the button's drawing, not its box, and its target is centred on it, so the middle of a pack
still chooses that pack; a custom pack's name keeps its line, its target running down over the dots.

Keyboard order is the list (one stop), then each Edit pack button, then "+ New pack", then the rows. S7a draws a custom
pack's name with a dashed underline and a text cursor, which says "rename". So that button opens Edit pack with focus
on Pack name, where renaming happens.

**The dialog.**
- Edit pack opens with focus on the first swatch. It opens on Pack name from a custom pack's name, and so does New pack,
  as S7d draws its field focused.
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

**Built from (R-236)** — every part, the drawing it follows, and the values the computed-style stop holds.

Every colour is an app token, and each frame hex maps to one:

| Frame hex | App token |
|---|---|
| `#EFECE7` | `paper-sunk` |
| `#6E6A64` | `ink-soft` |
| `#E7E2DB` | `line` |
| `#C9C2B8` | `line-strong` |
| `#FF5941` | `coral` |
| `#E84B34` | `coral-deep` |
| `#C2381F` | `coral-text` |
| `#FFEDE8` | `coral-tint` |
| `#1C1B1A` | `ink` |
| `#33312E` | `ink-hover` |

The dialog's backdrop and shadow are `scrim` and `shadow-modal`. A frame value with no token becomes one: the swatches'
hairline at .14, the picker thumbs' two shadows, and Cancel's 5 % `ink` wash on hover.

| Part | Follows | Built as |
|---|---|---|
| The panel | S7a :389-414 | 6.2's and 6.3's head, Current card and grid, as built |
| A preset cell's pencil | S7a :416 | a 15 px circle, 1 px `line-strong`, `surface`, 4 px from the cell's top and right, holding the frame's 8 px pencil (stroke 2, `ink-soft`) |
| A custom cell | S7a :656-674 | the preset cell with S7a's own differences: "Ag" 14 px; the name 10.5/600 over a 1 px dashed `line-strong` underline, `cursor: text`; the frame's 11 px pencil (stroke 1.5, `ink-soft`) 4 px after it; no corner pencil |
| + New pack | S7a :675-678 | the Kit's `NewPackCell`: 1.5 px dashed `line-strong`, radius 8; "+" 16 px over "New pack" 10/600, `ink-soft`, 3 px apart; on hover a `coral` border and `coral-deep` words |
| The rows block | S7a :680 | a 1 px `line` rule above, 7 px of padding under it, rows 6 px apart |
| Heading font, Body font | S7a :682-702 (the Kit's font row :109-125) | each 40 px tall, padding 6 × 10, gap 9, 1 px `line`, radius 8, `surface`, hover border `line-strong`; "Aa" 14 px in the role's own face, 20 px wide; the row's name 10 px `ink-soft` over the family 12/600; a 12 px chevron (stroke 1.5, `ink-soft`) |
| The pairing menu | the Kit's dropdown menu :109-125, opened by `openPopover` | `surface`, 1 px `line`, radius 12, `shadow-lg`, padding 6, rows 1 px apart; each row padding 7 × 10, radius 8, hover `paper`; the pairing in force on `coral-tint` with the Kit's 13 px `coral-deep` check; as wide as the font row it opens from, scrolling inside itself. Each row holds the font row's inside: "Ag" 14 px in the pairing's heading face (20 px wide), the heading family 12/600 over the body family 10 px `ink-soft` |
| The segmented rows | S7a :704-737 | the row name 11.5/500 `ink-soft`, 4 px above the track; the track `paper-sunk`, radius 24, padding 2; each segment flex 1, padding 3 × 0, radius 20, 11/500 `ink-soft`; the chosen one 600 `ink` on `surface` with `shadow-sm`. This is the Kit's `Segmented` in S7a's dense geometry. Gutters, Shadow and Link style are three more such rows; Button style has four segments, Pill last |
| Pill radius | the Kit's stepper :99-108 | a row of the same shape (its name 11.5/500 `ink-soft`, 4 px above) holding the Kit's `Stepper`: 1 px `line`, radius 8, `surface`; − and + each 26 × 28, `ink-soft`, hover `paper`; the value 32 px wide, 13/600 tabular, from 0 to 40, then Full |
| Edit pack, New pack | S7c :304-327, S7d :332-365 | 520 px wide, centred over `scrim`; `surface`, radius 16, `shadow-modal`, padding 28, its blocks 20 px apart; the title Bricolage Grotesque 22/700 at −0.01em, over the frames' own subtitles at 13 px `ink-soft` (line height 1.5), 5 px apart; the frame's ✕ (16 px, stroke 1.5, `ink-soft`), 4 px down |
| Pack name | S7c :319, S7d :347 | the label 12/500 `ink-soft`, 6 px above; the field 40 px tall, 1 px `line`, radius 8, padding 0 12, 13 px Inter, `coral` caret; focused, a `coral-text` border and the focus ring (S7d draws it focused) |
| The swatch rows | S7c :320 | rows 14 px apart; "Light" and "Dark" 34 px wide, 11/600 `ink-soft`, 12 px before a seven-column grid with 4 px gaps; each swatch 36 × 36, radius 10, an inset 1 px hairline at .14; its name 9.5 px `ink-soft`, 5 px below, never wrapping |
| Image scrim | S7c's mode words and the Kit's stepper | one row 14 px under the swatch rows: the name "Image scrim" styled as Pack name's label, then for each mode its word (34 px, 11/600 `ink-soft`) and the Kit's `Stepper`, reading "45 %" |
| The warning | the Kit's notice banner :238-250 | the Kit's `Banner kind="notice"`, 20 px under the rows. A failing swatch carries the banner's own triangle in a 15 px `surface` circle with a 1 px `line-strong` border, at its top-right corner, as S7a's cells carry their pencils |
| The footer | S7c :322-326, S7d :361-364 | 10 px gaps. **Reset to defaults** (S7c only): 38 px tall, padding 0 12, 12/500 `ink-soft`, no fill, radius 10, hover `ink`. **Cancel**, pushed right: 38 px, padding 0 16, 13/500 `ink-soft`, radius 10, hover the 5 % `ink` wash. **Save pack**: 38 px, padding 0 22, `ink` with `surface` words at 13/600, radius 10, hover `ink-hover` |
| The colour picker | S7d :350-359 | detailed in the list below this table |
| S7d's third swatch row | S7d :348-365 | **not built.** Its four swatches labelled "Dark" repeat four of the Dark row's seven, and they are the drawn popover's anchor (`EXPERIENCE.md:2026`). The built popover anchors to the swatch that was pressed |
| Reading along | P0-0, and the sidebar under `ReadOnly` | the Controls sidebar's own reading-along treatment, which 6.3's cells already take |
| Below 1280 | D8a :40, D8b :172 | 6.3's ⋯ → Style Pack overlay, with the rows scrolling under the list. The dialog is the same at every width; 520 px fits 720 |

The colour picker, as S7d :350-359 draws it:
- **The popover.** 206 px wide, anchored to its swatch; `surface`, 1 px `line`, radius 12, `shadow-modal`, padding 12,
  its parts 10 px apart.
- **The square.** 112 px tall, radius 8: `black` fading upward to `transparent`, over `white` fading right to the hue.
  Its thumb is 14 px, with a 2.5 px `white` ring and a 0 1 px 3 px black shadow at 40 %.
- **The hue strip.** 12 px tall, radius 6. Its thumb is 16 px, filled with the hue, with the same ring and the shadow
  at 35 %.
- **From your site.** The words at 10 px `ink-soft`, then 16 px dots, 7 px apart.
- **The hex row.** Under a 1 px `line` rule, with 10 px between them:
  - a 22 px swatch, radius 6, with the .12 hairline;
  - the field, 30 px tall, 1 px `line`, radius 8, padding 0 9, mono 12 px;
  - Paste, 30 × 30, radius 8, 1 px `line`, `surface`, holding the frame's own 13 px clipboard (stroke 1.5, `ink-soft`;
    R-92).

**The words (R-170, R-237)** — one list, `PACK_EDIT_WORDS`. The panel, the dialog, the announcements and every check read
it, and it wins over a drawing's word wherever the two differ.

| Where | Words |
|---|---|
| Rows (S7a, and Appendix C's titles and steps) | **Heading font** — {heading family} · **Body font** — {body family} · **Site width** — Narrow · Normal · Wide · **Radius** — Sharp · Soft · Round · **Spacing density** — Compact · Comfortable · Airy · **Gutters** — Tight · Normal · Loose · **Button style** — Solid · Soft · Outline · Pill · **Shadow** — None · Subtle · Lifted · **Link style** — Underline · Accent · **Pill radius** — {n} px · Full |
| The pairing menu | named "Font pairings"; each row "{heading family}" over "{body family}" |
| The seven colours, per mode | Base · Surface · Text · Muted · Border · Accent · On-accent; and **Image scrim**, {n} % |
| Cells | each Edit pack button "Edit pack — {name}" · "New pack" |
| Dialogs | "Edit pack" and "New pack", with S7c's and S7d's own subtitles · "Pack name" · "Name it — e.g. Studio Warm" · Reset to defaults · Cancel · Save pack |
| Picker | the hex field "{Role}, {Mode} — hex" · "From your site" · Paste · "Press ⌘V to paste into the hex field." · "Not a colour — type #RRGGBB" |
| Name | "Name your pack to save it." |
| Warning | "Hard to read: {pair}[; {pair}…]. Small text needs 4.5:1 — you can still save.", where a pair is "{Fg} on {Bg} in {Mode}, {ratio}:1" |
| Said, once landed | "Changed {name}." (a Save pack) · "Style Pack — {name}" (a New pack; an undo or redo that changes the look in force; 6.3's switch) · "{Row} — {Step}" · "Font pairing — {heading family} · {body family}" |

**Rulings.**
- **Question 1, option 2: R-236.** The parts no frame draws are built from the existing drawings exactly, as the "Built
  from" table gives them. There is no Claude Design pass. The match is checked by computed style and by eye.
- **Question 2, option 1: R-237.** The page's own colour is "Base" in the Style Pack editor, as it already is in a
  section's settings. Nothing else is renamed.

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
- S7a draws the fonts as two rows, so they stay two rows, Heading font and Body font. A pack's fonts are one pairing from
  the pool, so either row opens the same pairing menu, and the menu says so in its name.

## Questions for the owner

Every question is ruled; nothing is open.

### Question 1 — Parts of the Style Pack editor were never drawn. May I hand you a Claude Design prompt to draw them first?

**In plain English.** Your rule R-74 says every screen is built from a drawing in our Claude Design project, and this
story's plan says the missing parts are drawn before they are built. These parts were never drawn:
- four of the settings rows: gutters, shadow, link style, and the Pill button;
- the list of thirty font pairings;
- the yellow note that warns about hard-to-read colours;
- the controls for how dark photos get under text, and how round pill-shaped buttons are.

I have written the prompt. It also puts the plan's words on the drawings: "Normal", not "Standard", and "On-accent", not
"Contrast". Building starts once your drawing is back.

**An example.** Today there is no drawing of a "Gutters: Tight · Normal · Loose" row. After the prompt runs, it sits
under "Spacing density" in the same style as the rows above it, and that drawing is what gets built.

1. **Run the prompt in Claude Design and send me the export (RECOMMENDED).** Paste the prompt into a new chat in the
   Inflozo project, let it finish, export the project as a zip and tell me where you saved it.
2. **Skip the drawing this once.** The build draws the missing parts by copying controls the Kit already has. That is an
   exception to R-74, like the dice (R-163). It is faster, but nothing you have looked at decides how they look.
3. **Leave the undrawn parts out of this story.** Colours, pencils, New pack and the five rows already drawn ship now.
   Gutters, shadow, link style, the Pill button, the font list, the photo and pill controls, and the warning wait for a
   later story. FR-E3 is then only partly done.

**Ruled: option 2 (owner, 2026-10-04).** *"Skip the drawing this once. Ensure it is perfect and match existing
design."* Recorded as **R-236**, R-74's one stated exception, for this story only.
- The parts no frame draws are built from the drawings that exist, exactly: S7a's rows and cells, S7c's dialog, S7d's
  colour picker, the Editor Sidebar Kit's controls, P0-0 and D8. There is no new component, colour or size.
- "Perfect" is held two ways: a computed-style stop against the "Built from" table, and a side-by-side page the owner
  approves in the Dev session.
- The prompt was not run, and it is no longer in this spec.

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

**Ruled: option 1 (owner, 2026-10-04).** *"Base everywhere."* Recorded as **R-237**. The Style Pack editor's first
colour is "Base", as in a section's Background setting. FR-E1's "background" stays as prose describing the role, not
as a label.

### Question 3 — May this story's database change go on the live database now? (R-99)

**In plain English.** This story lets your own Style Packs (a recoloured Paper, a "Studio Warm" you make) be saved
together with your sections in one save, so one ⌘Z can undo a pack edit. For that, the database's save step needs one
small change. It is written, and it passes every check on a copy of the database; with the change left out, the check
fails exactly where it should. Nothing on the live database had changed when this was asked.

**An example.** Today a save says "these sections changed, and the pack is now Tangerine". After the change it can also
say "and Tangerine's accent is now blue". A save that says nothing about packs, which is every save the live site makes
today, works exactly as before.

1. **Go (RECOMMENDED).** I apply the change, read it back, then check as a throwaway test account that today's live save
   still works and the new one saves a pack; I delete that account and carry on with the story.
2. **Apply it yourself.** In Supabase: your project → SQL Editor → New query, paste the whole of
   `supabase/migrations/20261004200000_sync_style_pack_packs.sql` and press Run. Then say "Applied".
3. **Hold the story.** Nothing changes on the live database, and Story 6.4 waits.

**Ruled: option 1 (owner, 2026-10-04).** *"1. Go"*, asked in the Dev session. The migration was applied through
`SUPABASE_DB_POOLER_URL` in this session, read back, and proved on production before any code (the Schema task and
`## Verification`).

### Question 4 — Does the built Style Pack editor match its drawings, and may the re-taken photographs become the reference? (R-236, DW-324)

**In plain English.** You ruled that this story skips a new drawing and copies the drawings that exist, exactly (R-236),
and that you see the result side by side before the Dev commit. This story also re-takes the automatic picture check's
reference photographs: one font sample per pairing, now with the heaviest and lightest weights, a bold italic and
accented letters, and four new pictures of a button on the dark band. Both were on one private review page:
https://claude.ai/artifact/E9C3w7ZPe57KgaE2q9ZgGW.

**An example.** If a font sample showed the wrong font, or a row looked bigger than in the drawing, you would choose 2
and name the picture; it would be fixed and shown again before anything was committed.

1. **Approve both (RECOMMENDED).** The editor matches its drawings, and the new photographs become the reference. Then
   the Dev commit, the photographs-only commit after it, and one push of both.
2. **Fix something first.** Name the picture and what looks wrong; it is fixed and shown again before anything is
   committed.

**Ruled: option 1 (owner, 2026-10-04).** *"1. Approve both"*, asked in the Dev session over the review page. R-236's
side-by-side half is done, and the baselines land in their own commit (`docs/render-matrix.md`, the rebaseline rule).

## Owner's manual test

Do this on the real site after Deploy confirms the build, on a laptop at full width, in **Pilot sections**. Steps 12
and 13 put Paper back. Duplicating a project needs a plan with room for another project. Your accounts are on Free and
already hold their one project, so the deployed walk proves duplication instead.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor | Click the grey area beside the page, then **Change**. | — | The Style Pack list. Every pack has a small pencil, and **+ New pack** is last. Below the list are **Heading font** and **Body font**, then **Site width**, **Radius**, **Spacing density**, **Gutters**, **Button style**, **Shadow**, **Link style** and **Pill radius**. Site width reads Narrow · Normal · Wide, and Spacing density reads Compact · Comfortable · Airy. The rows look exactly like the ones in the Style Pack drawing: the same small rounded switches, sizes and greys. |
| 2 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Edit pack | Click **Paper**'s pencil. | — | The Edit pack window, as the drawing shows it: Pack name "Paper", then Light and Dark rows of seven colours (Base · Surface · Text · Muted · Border · Accent · On-accent), then **Image scrim** for Light and for Dark. Below are **Reset to defaults**, **Cancel** and **Save pack**. |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Colour picker | Click the Light **Accent** colour. In the hex field, select the text and type the dummy colour, then press **Enter**. | `#1E6BFF` | A small picker with a square and a rainbow strip. The Accent colour turns blue. |
| 4 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Edit pack | Click the Light **Text** colour and type the dummy colour in its hex field. | `#DDDDDD` | A yellow note appears: "Hard to read: Text on Base in Light, …:1. Small text needs 4.5:1 — you can still save." The Text colour carries a small warning sign. **Save pack** still works, but don't press it yet. |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Edit pack | Type the dummy colour into the Text hex field, then click **Save pack**. | `#232019` | The yellow note goes away and the window closes. The page's buttons and links turn blue, and Paper's dots in the list show the blue. |
| 6 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor | Press **⌘Z**, then **⇧⌘Z**. | — | ⌘Z puts Paper's own orange back. ⇧⌘Z makes it blue again. |
| 7 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Style Pack list | Click **Wide** under Site width, **Pill** under Button style and **Underline** under Link style. | — | The page gets wider, its buttons get fully round ends, and its links go plain with an underline. |
| 8 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Font pairing list | Click the **Heading font** row and pick **Lora** over **Lato**. | — | A list of thirty pairings, each with "Ag" in its own heading font and its two font names. After you pick, Heading font reads Lora and Body font reads Lato, and the page's headings and text change to them. |
| 9 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | New pack | Click **+ New pack**, then click **Save pack** without typing a name. | — | "Name your pack to save it." under the name, and nothing is saved. |
| 10 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | New pack | Type the dummy name. Click the Light **Base** colour and type the dummy colour, then click **Save pack**. | `Studio Warm`, then `#FFF4EA` | "Studio Warm" appears in the list, ringed and current, and the page turns cream. |
| 11 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor | Click the grey area and press **⌘S**. Wait for the green tick, then reload the page. Then click the back arrow to Projects. | — | The page reopens in Studio Warm, with Paper still blue in the list. On Projects, the Pilot sections card is cream. |
| 12 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51`, in a second window | Editor, read-only | Open the same project in a second window, click the grey area, then **Change**. | — | Every pencil, **+ New pack** and every row is greyed, and clicking does nothing. |
| 13 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51`, in the first window | Edit pack | Click **Paper**'s pencil, click **Reset to defaults**, then **Save pack**. Click **Paper** in the list, then click the grey area and press **⌘S**. | — | Paper is back as it was, orange accent and Fraunces headings, and it is current. Studio Warm stays in this project's list, with its name dotted-underlined and a small pencil beside it; clicking its name opens Edit pack on the name. Nothing in the plan or the drawings deletes a pack, so this story has no Delete. Say so if you want one. |
| 14 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, narrow | Make the window about 1,000 px wide, open **⋯**, choose **Style Pack**, then click a pencil. | — | The list and its rows open on the right, and the Edit pack window opens over the page. Press **Esc** to close it. |
| 15 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Edit pack | Click **Paper**'s pencil and change Light **Image scrim** to 70 %. Click **Cancel**. | — | The page does not change, because no section on today's page darkens a photo yet. Cancel leaves Paper as it was. |

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

**Executed — Schema phase (2026-10-04), before any code:**
- `bash supabase/tests/run-rls-gate.sh` -- exit 0: the schema diff between the migrations and `SCHEMA.sql` is empty, the
  6.3 block's PASS lines all still pass against the five-argument function, and every assertion of the Story 6.4 block
  passes (exactly one `sync_project_doc`, taking five arguments; a packs-only call writes `packs`, moves the revision once and
  keeps `brand` and `preset`; docs, a preset and packs land in one call; a stale base writes none of them; a preset-only
  and a docs-only call leave `packs` byte-equal; a string, an array and a JSON-null `p_packs` each answer null and write
  nothing; a scalar becomes `{packs}`; another tenant's project answers null and keeps its packs; anon 42501).
  **Control:** the same gate in a scratch copy with the migration withheld and `SCHEMA.sql` at HEAD aborts at the 6.4
  block, "1 sync_project_doc functions exist, the widest taking 4 arguments" (exit 3).
- **Supabase production, `SUPABASE_DB_POOLER_URL`** (the owner's go, Question 3; the key read inside the script, nothing
  on argv, nothing printed): before the apply, `pg_proc` held one `sync_project_doc(uuid,jsonb,bigint,text)`, definer,
  anon not executable, authenticated executable. The migration was applied in one transaction. After it, `pg_proc` holds
  exactly one `sync_project_doc(uuid,jsonb,bigint,text,jsonb)` with the same definer flag and grants, and its `prosrc`
  is byte-identical to the file's body (1,431 characters).
- **Supabase production over PostgREST, `SUPABASE_URL` + `SUPABASE_SECRET_KEY` + `SUPABASE_PUBLISHABLE_KEY`**, as a
  throwaway user holding a real session (generate_link + verifyOtp) on its own project seeded
  `{brand: {seed: '#123456'}, preset: 'paper'}`: (a) the deployed route's four-named-argument call (`p_preset:
  'tangerine'`, no docs) answered `{applied: true, revision: 1}` and wrote no `packs`; (b) the settings page's
  three-named-argument call answered `{applied: true, revision: 2}` and left `style_pack` as it was; (c) a five-argument
  call with Tangerine's record (light accent `#1E6BFF`) answered `{applied: true, revision: 3}`, and `style_pack` now
  holds `brand`, `packs` and `preset`, with `packs.tangerine.light.accent` `#1E6BFF`; (d) the control: anon (no session)
  answered 401 `42501` and the revision stayed 3. The user was deleted (200); the user count was 13 before and after.

**Executed — Dev phase (2026-10-04), on the harness and in the image; nothing deployed, committed or pushed:**
- `pnpm check` -- exit 0 on the final tree: lint, typecheck and every package test, among them `pack-edit.test.ts`,
  the 6.4 cases of `journal.test.ts`, `style-pack.test.ts` and `editor.test.ts`, `packs.test.ts` (6.2's Tangerine control
  still caught, now through `AA_PAIRS`), `ad36.test.ts`'s own-pack vectors, and `tools/matrix/cases.test.mjs`.
  **Controls**, each in a scratch copy: with `hardToRead`'s floor taken out, the 4.46 case printed 4.5 and failed; with
  `ownPacksIn` keeping every entry, the hostile-record cases failed.
- `pnpm build && node tools/check-traces.mjs` -- exit 0: "every route carries its files", and "no client chunk … carries
  the font pool's record, and the runtime's index reaches no preset" (DW-323).
- `bash supabase/tests/run-rls-gate.sh` -- exit 0, every Story 6.4 PASS line as at Schema.
- `bash tools/matrix/run-matrix-gate.sh --update`, in the image -- every pairing's specimen moved and the contrast-ground
  photographs were new; one photograph moved that should not have (the Spec Change Log) and was put back. Then
  `bash tools/matrix/run-matrix-gate.sh` -- exit 0, its own line: "0 violations · 0 of 394 drawn cases scroll sideways ·
  300 specimen lines in the pool's own faces (each behind its positive control) — passed". **Before and after pairs of
  every moved photograph are on disk for the owner's sampled review; the baselines are not committed before it.**
- `pnpm keyboard`, whole -- exit 0 on the final tree, every journey and floor test passed, with no edit landing mid-run.
- **R-236, by computed style** -- the stop at 1440 green. **Control:** one 1 px change to a gap in a scratch edit turned it
  red; restored, green.
- **R-236, by eye** -- a screenshot of each state at 1440 and of the overlay at 834 with touch, each beside its drawing
  (S7a, S7c, S7d, the Kit's cards, D8a), shown on the private review page with DW-324's pairs and **approved by the
  owner in the Dev session (Question 4)**.
- **D8a with touch** -- `floor.spec.mjs`'s sweeps over the Style Pack list, Edit pack and the picker green on both
  tablets; the three controls in the Spec Change Log each turned it red at its own check.
- **The I/O matrix's remaining rows, each a stop that ran and passed** (the matrix audit, 2026-10-04). In
  `journey.spec.mjs`, keyboard only:
  - **Edit another pack:** Tangerine's record is stored and its cell's dots take the colour; the canvas neither changes
    nor restyles; "Changed Tangerine."; one ⌘Z.
  - **Discard:** Cancel and ✕, each after a colour changed in the draft, journal nothing and leave the canvas as it was,
    with focus back on the pencil; a New pack cancelled gives focus back to "+ New pack".
  - **Reset to defaults:** the library's whole record goes into the draft, name included; Save pack drops `packs.paper`
    from the device's record; the canvas takes the library's accent; one edit.
  - **Paste:** refused without the permission, focus lands on the hex field with "Press ⌘V to paste into the hex
    field."; granted, the clipboard's `#2F4A3E` fills the field and the swatch.
  - **From your site:** no linked site, no row; a linked site's stored accent becomes the draft's colour.
  - **A pairing's late face:** the words and `--font-heading` land after `FACES_WAIT_MS`, without the faces, and the
    face swaps in on arrival with no second restyle.
  - **Remix · Style Pack:** with Paper in force, the draw's top end lands on the project's own pack, the roster's last;
    one ⌘Z.
  - **Lock lost mid-dialog:** Edit pack joins DW-241's openers; losing the lock closes it, journals and keeps nothing,
    and leaves no form inside it.
  - In `floor.spec.mjs`, which taps: **the backdrop** closes Edit pack and journals nothing.
  - **Controls**, each a scratch edit, restored: Cancel saving; every save restyling; Reset keeping the name; a refused
    paste saying nothing; the site's dot doing nothing; Remix drawing from the presets alone; the dialog's close keeping
    its form; the backdrop not closing; the faces' wait taken out. Each turned its own stop red at its own check. Under
    them the touch walk also showed a race in the test itself (typing before the picker's hex field held focus); it now
    waits for that focus. No row showed a defect in the product.
- **The deployed walks** (`run-verify-editor.cjs` step 103, `run-verify-lock.cjs`'s 6.4 checks,
  `run-verify-dashboard.py` `duplicate-carries-packs`) -- written and syntax-checked, not run: they run once the Dev push
  has deployed.

**Dev's matrix audit and final gates (2026-10-04, the orchestrating session, Node 24.18.1):**
- **The I/O matrix, row by row, each to a check that ran and passed:** edit the pack in force, nothing changed and New
  pack saved — the journey's Save pack and New pack stops; edit another pack, discard, Reset to defaults, paste, From
  your site, lock lost mid-dialog, a pairing's late face, Remix · Style Pack — the stops added at this audit (above), and
  the backdrop in `floor.spec.mjs`; hard to read and live, not chatty — the warning stop; New pack and New pack, no name —
  the New pack stop; a row — the rows stop and the reduced-motion stop; a pairing — the rows stop; hex field —
  `pack-edit.test.ts`'s hex cases and the first 6.4 stop (`blue`, `#1af`); read-only — the reading-along stop; reload,
  unsynced — the reload stop; another session's edit and a record from before 6.4 — `journal.test.ts`' hydrate cases;
  the flush — `journal.test.ts`' payload cases, `editor.test.ts`' route check and the RLS gate's 6.4 block; a hostile body
  — `pack-edit.test.ts`' schema cases, `ownPacksIn`'s and the route's check (the live route's 422 is step 103's, at
  Review); a hostile stored value — `style-pack.test.ts`' `ownPacksOf` and `packIdOf` cases; duplicate — `projects.test.ts`'
  "a duplicate carries every column the grant allows" (the deployed copy is `duplicate-carries-packs`, at Review); below
  1280 — the 720 × 900 stop and `floor.spec.mjs`' D8a sweep; an own pack in force — the stop opening on `custom-1`.
- `pnpm check` -- exit 0 on the final tree (`apps/web`, `section-runtime`, `library`, `ghost-shim`, `theme-compiler` and
  the root's tests, each 0 fail).
- `pnpm build` then `node tools/check-traces.mjs` -- exit 0: "every route carries its files", and "no client chunk of 36
  carries the font pool's record, and the runtime's index reaches no preset".
- `bash supabase/tests/run-rls-gate.sh` -- exit 0, every Story 6.4 assertion passing, 0 FAIL.
- `bash tools/matrix/run-matrix-gate.sh` (no `--update`), in the image, with the rebaselined photographs in the tree --
  exit 0, its own line: "574 cases · 5 designs · 30 pairing specimens · 4 on the contrast ground · 3 packs · 0
  violations · 0 of 394 drawn cases scroll sideways · 300 specimen lines in the pool's own faces (each behind its
  positive control) — passed". Every before and after on the review page is pixel-identical to `git show HEAD:` and to
  the working tree's baseline (compared decoded), so the owner approved the very photographs committed.
- `pnpm keyboard`, whole, never `--grep` -- exit 0 on the final tree, "187 passed (7.8m)", no failure and no retry;
  `apps/web/next-env.d.ts` left clean.
- Measured, not gated: the editor's server payload carries `packChoices()` at 84,912 bytes (8,787 gzipped; 78,845 and
  7,750 at 6.3, each preset now carrying its record), `pairingChoices()` at 87,919 (4,760 gzipped) and the pairing
  menu's glyph faces at 31,170 (1,870 gzipped).
- Real services in Dev: Supabase production at the Schema phase only (above). Nothing in Dev wrote to Supabase, Vercel,
  Resend, Dodo or the Ghost servers; the deployed walks are the Review's.

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

### Results — Review (2026-10-04)

Keys are named by their variable in `tools/probe/.env`, never by value. Node 24.18.1 throughout. The real-infra layer
ran in the main session.

**Before any patch.**
- **R-99, Supabase production through `SUPABASE_DB_POOLER_URL`, read-only:** `pg_proc` holds exactly one
  `sync_project_doc(p_project uuid, p_docs jsonb, p_base bigint, p_preset text, p_packs jsonb)`, security definer, anon
  not executable, authenticated executable, its `prosrc` byte-identical to the migration file's body (1,431 characters).
  **Control:** the same comparison against 6.3's body is false. The schema is as new as the code.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): a production deployment READY from the Dev head
  `b038bac5`, and from later heads that changed no file of the story's product code.
- The first review session started `run-verify-editor.cjs` on that build and died with it, on a navigation timeout
  before step 103; it proved nothing and is not counted. The three walks run on the reviewed build, below.

**The patched tree.**
- **Controls, each a scratch edit, restored** (`pnpm keyboard -g` over the affected stops): with the blur re-reading the
  colour again, both tablets' sweeps red at "the middle of the strip, kept"; with three digits applied as typed, red at
  "a half-typed colour is not applied"; with `packs` dropped from the editor's request, red at "the edited record goes
  up"; with Enter in Pack name doing nothing, red where the window should have closed; with the device's packs taken
  raw, the editor did not open after the reload. Restored, each is green.
- `pnpm check`: exit 0 (the first run was red on this review's own comment, which spelled an example hex in
  `pack-editor.tsx` — `tokens.test.ts` doing its job; reworded).
- `pnpm build` then `node tools/check-traces.mjs`: exit 0.
- `bash tools/matrix/run-matrix-gate.sh`, in the image, with the longest-family rule: exit 0, its own line "574 cases · 5
  designs · 30 pairing specimens · 4 on the contrast ground · 3 packs · 0 violations · 0 of 394 drawn cases scroll
  sideways · 300 specimen lines in the pool's own faces (each behind its positive control) — passed". D30's lines
  (Alegreya over Alegreya Sans) are among them.
- `pnpm keyboard`, whole, no `--grep`, three runs, all recorded:
  - the first had source edited under it mid-run and is not a result;
  - the second: 188 passed, 1 failed — the review's own new stop, which opened a list that was already open (the test's
    mistake; fixed, green alone);
  - the third, on the final tree: 188 passed, 1 failed — Story 5.23a's "every whole-page change repaints the whole
    page", at "a subject", a stop this story does not touch and which passed in the second run. Repeated three times
    alone, it passed three times. CI's own whole run on the Review head is the arbiter, recorded below.
- The RLS gate was not re-run: the review changed no SQL, and CI runs it on the push.

**The reviewed build `db8ad4bf`, on production (2026-10-05).**
- **GitHub Actions** (`GITHUB_TOKEN`, read-only): `ci.yml` run 37220926820 `check`, `rls` and `deploy` **success** — so
  CI's own whole `pnpm keyboard` passed, the 5.23a stop that failed once locally included; `matrix.yml` runs
  37220926817 and 37245948102 **success**.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): `dpl_2ZLnTjjFUbn6p9aGfViVb1HrSnmf` READY from
  `db8ad4bf`.
- **`run-verify-editor.cjs` on app.inflozo.com** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `VERCEL_TOKEN`,
  `VERCEL_TEAM_ID`): **0 FAIL, 709 PASS**, users 13 → 13. Step 103, every line:
  - Edit pack on Tangerine, its Light Accent typed into the hex field, Save pack: "Changed Tangerine.", Tangerine's cell
    wears the colour and Paper's canvas does not;
  - ⌘S: `style_pack.packs.tangerine` holds the edited record, the seeded `brand` untouched, the preset still Paper, the
    revision moved by exactly one;
  - "+ New pack" refused with no name, then saved as one transaction: `packs['custom-1']` and `preset` in one save, the
    revision moved by one;
  - **the control:** the live sync route answers 422 "Not a Style Pack" to every hostile record and writes nothing;
  - a fresh browser opens in `custom-1`: the canvas asked for at Paper's address (`/canvas?v=db8ad4bf8b49`, no
    `&pack=`), wearing the pack's own block (`#FFF4EA`), the card naming "Studio Warm";
  - two ⌘Z and a ⌘S put the seed back (`packs: {}`, Paper, the brand untouched), zero CSP violations;
  - axe, behind its control: zero WCAG 2.1 AA violations over the list and its rows, the pairing menu, Edit pack, and
    the colour picker over a warning.
- **`run-verify-lock.cjs`**: **0 FAIL, 90 PASS**, no fixture leaked (13 → 13). The holder's doors are all live (the
  control); the reader's are all disabled, and with `disabled` lifted for the three presses (all three pressable) no
  dialog opened and neither `--site-width` nor the revision moved — the lock guard itself refused.
- **`run-verify-dashboard.py`** (`SUPABASE_DB_POOLER_URL` and the Supabase keys): all steps passed, users 13 after.
  `duplicate-carries-packs`: a throwaway account made Pro, the project menu's Duplicate made one copy, and its
  `style_pack`, read off the pooler, equals the source's — brand, own pack and preset.
- **Not touched:** T1 (no theme in this story), Resend, Dodo.

### Results — Deploy (2026-10-05)

Keys are named by their variable, never printed; each command read `tools/probe/.env` into its own environment.

- **Schema:** applied at the Schema phase (`0d949166`) through `SUPABASE_DB_POOLER_URL` on the owner's go (Question 3) and
  read back at Review (one five-argument `sync_project_doc`, `prosrc` byte-identical to the file). Nothing under
  `supabase/` has changed since, so no second apply; CI's `rls` gate on HEAD is green.
- **CI, for HEAD `fbb1380e`** (`GITHUB_TOKEN`, read-only): `ci.yml` run 37252782767 `check`, `rls` and `deploy` all
  `success`; `matrix.yml` run 37252782752 `success`. HEAD adds only the Review record and the board over the reviewed
  build `db8ad4bf`, so the code is what the Review's walks ran on.
- **Vercel, the production project** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): the deployment for that sha is
  `READY`, target `production`, aliased to `inflozo.com`, `app.inflozo.com` and `www.inflozo.com`. Signed out, a plain GET
  answered 200 on `app.inflozo.com/sign-in` and 307 to `/sign-in` on `/start` and on the project route (the sign-in
  guard).
- **Deployment: `dpl_4hDB8wAifeMWLw17tbcHe8qTPasZ` (https://app.inflozo.com/).**
- **The owner's manual test** now names the full URL in every step; `owner_test` stays `pending`.
- **No question for the owner.** Questions 1 to 4 are ruled.
