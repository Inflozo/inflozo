---
title: 'Story 7.13 — The Ghost card design module and cards.css'
type: 'feature'
created: '2026-10-15'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story the editor's Template switcher has a second "Template surfaces" row, **Editor cards**: a screen showing
Ghost's sample post with every kind of card an author can put in a post — callouts, buttons, bookmarks, toggles,
galleries, audio and video players, files, products, headers and sign-up boxes — where you pick a card from a list and
change how it looks on your whole site with a few named choices (a callout's colours and emoji, a button's height and
outline, which side a bookmark's picture sits), seeing every change on the sample post at once. A card you changed is
marked **customised** in the list, the panel and the switcher (with an amber count), each card has **Reset to Ghost
default** behind a one-step confirm that says "Posts keep their content.", and ⌘Z undoes a change or a reset like any
other edit. Underneath, every theme Inflozo builds now carries its own `cards.css` and tells Ghost to stop adding Ghost's
own styling for exactly the cards you changed, so the live site shows your design and nothing fights it.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-Q7's card design module does not exist. No screen designs a Koenig card, `project_treatments` has never
been written (its `card_designs` jsonb waits since Story 1.2, and `paywall_design_id` has had no reader or writer since
Story 5.20 — DW-267), `compileTheme` writes `card_assets` from a `designedCards` list no product code fills and emits no
`cards.css` at all (the T1 recorder and CI paper over `GS050-CSS-KGWF` with a labelled scaffold — DW-334), so `cards.js`
(Story 7.5) has never met a real Ghost, and a designed gallery would fail three gscan errors. A25's owner gate cannot
open until this module emits (Epic 10's ordering rule).

**Approach:** One pure card registry in `@inflozo/library` — every Koenig card in Ghost's own menu order, the Ghost
chunk names each one's exclusion lists, and each card's own panel as named values — is read by the editor, the canvas
and the compiler alike. A designed card starts from **Ghost's own stylesheet for it**, copied byte for byte from the
vendored chunk into `cards.css`, plus the rules its changed values add; a card is "customised" exactly while one value
differs from its start, and only then is it excluded. The values live in `project_treatments.card_designs`, written by
the editor's own save as one more journal key beside the Style Pack (one edit, one ⌘Z, the edit lock), through a widened
`sync_project_doc` — that migration and the `paywall_design_id` drop are this story's own **Schema** push, first and
alone (R-99). The surface is S14 as `EXPERIENCE.md` re-specifies it, on Story 5.20's Template-surface shell; A33's six
treatments and their read-only block are Epic 10's (R-118).

## Boundaries & Constraints

**Always:**
- **The frame is `S14 Editor Cards.dc.html` S14a, S14c, S14d and S14e**, as `P0 Editor Primitives - Spec.md` §P0·7
  (`:557-603`) and `EXPERIENCE.md` re-specify it: the cards in **Ghost's own menu order as read in its editor's source**
  (Design Notes' facts; `EXPERIENCE.md:2031-2038`'s list is the source files' order, not the menu's, and is corrected at
  Dev), public preview not listed (P0·7 `:575-576`), the entry through the switcher's **Template surfaces** group (`EXPERIENCE.md:207-222`),
  not S14d's left-nav group — the left panel stays Layers' place on every canvas. Each per-card panel is extrapolated
  from `C Post Body.dc.html` C1c (the panels drawn for every card) with S14e's callout panel as drawn, under the rules in
  Design Notes' card table. **S14b** (the Treatment dropdown) and S14e's **"From the {treatment} treatment"** block are
  not built: no treatment exists before Story 10.110, and R-118 draws no control before the story that makes it work.
- **R-170 — one name per thing:** the surface is **Editor cards** everywhere (switcher row, Theme settings rail, page
  title, announcements), where C3a's group draws "Cards"; the call-to-action card is **Call to action** in the list and
  in every sentence (never "CTA"); the shell's chip stays `PAYWALL_WORDS.chip`'s "Not a page section", one chip for one
  idea. Every sentence the surface says is one exported list (`CARD_WORDS`), which the deployed walk reads (standing rule 4).
- **Emission (FR-Q7, FR-J2, FR-J3, AD-18):**
  - `assets/css/cards.css` ships on **every** theme. It opens with D12's `.kg-width-wide` and `.kg-width-full` rules
    (DW-334, on tokens). It then carries, for each designed card in list order, Ghost's own chunk for it, verbatim, under
    one header naming Ghost, its version and `LICENSE-ghost.txt`. It ends with the rules the changed values add, which
    are the only bytes Inflozo writes there.
  - `default.hbs`'s head links `css/cards.css` **before** `css/screen.css`, both before `{{ghost_head}}`. The per-design
    rules therefore win on the `.kg-*` classes they legitimately style: A33 owns the card interiors, A25 the column.
  - `card_assets` stays `true` while no card is designed (Story 7.2's Question 2). From the first designed card it is
    `{ exclude: [...] }`, listing exactly the designed cards' Ghost chunk names (research §6.5's
    `designedCards ∩ ghostCardAssetNames`, derived from the vendored directory, never written down). The header card
    lists **both** `header` and `header_v2`. A card with no Ghost chunk (image, divider, embed) adds CSS and no exclude
    name. `card_assets: false` is never written.
  - A designed audio, video, gallery or toggle card ships its script in `cards.js` (Story 7.5, already built from
    `designedCards`).
  - `LICENSE-ghost.txt` ships whenever `cards.css` or `cards.js` carries Ghost's bytes, and `README.md` says which
    `cards.css` blocks are Ghost's.
  - **No `!important` in a rule Inflozo writes**, held by a check. Ghost's seven `!important` declarations inside the
    audio and video chunks stay byte for byte inside the copy, as `cards.js` copies Ghost's scripts unedited.
  - **The Ghost block is Ghost's.** The vendored chunks' own heads are cut (`VENDORED_HEAD`, as for `cards.js`). FR-G8's
    emitted-CSS check (`check-baseline.mjs` item 8) and the theme's text scans read `cards.css`'s Inflozo rules and
    skip the Ghost block, exactly as `vendor/` is not linted (`docs/section-authoring.md:842-844`). Ghost's audio, video
    and bookmark chunks carry `-webkit-` prefixes the pin refuses.
- **Corners are the pack's (FR-Q7, declined per card):** a designed card's own radius is re-pointed after Ghost's copy
  to the pack's radius token (`--radius-card`; a button inside a card, `--button-radius`). No panel offers corners.
- **Colour controls are never offered for the header, signup and call-to-action cards (R-6):** their dropdown rows
  carry the mark and their panels the sentence, both from `CARD_WORDS`.
- **AD-36, AD-27(a):** `card_designs` has one schema, `parseCardDesigns`, beside the registry. Every key is a listed
  card, every name one of its controls, and every value one that control offers, or the record is refused whole. The
  sync route refuses it before the write, as it refuses a Style Pack. The compiler reads only parsed records, and every
  CSS byte comes from the registry, never from the stored value.
- **AD-1, AD-14:** the registry, `cardsCss`, `excludedChunks` and the parser are pure and deterministic: the shell hands
  them the vendored chunk text. The compiler stays a function of its inputs.
- **The editor's rules hold:** a value change and a reset are each **one journal entry** under the new `CARDS_KEY`, sent by
  the flush that sends the docs and the pack in **one compare-and-set**. Each goes through `heldBack`'s read-only guard
  (R-192), so a window reading along has every card control greyed and the Card dropdown and the canvas still live.
  No card control starts server work: the save is the editor's own indicator. The switcher's row says "Opening…" as
  every canvas row does (R-98). `cards` is a `[template]` segment like `paywall`, inside the mounted editor, so it adds no
  route boundary. `busy.test.ts` holds that as it stands.
- **The canvas is honest (FR-H3):** the selected card's every recorded variation (the variation sheet's blocks for it)
  comes first under C.4's article header, then C.4's whole article, all in `.gh-content` with the project's Style Pack
  worn on them. The stylesheets come in the theme's order:
  tokens, the `cards.css` the compiler would emit, the theme stand-in, then the simulated `cards.min.css` without the
  excluded chunks. **Ghost's four card scripts run there**, so a toggle opens and a gallery proportions.
- **R-82, R-238:** the review and test run on real infrastructure; every Ghost check is on T1 alone. T1 writes, and the
  production migration apply, are asked of the owner in the Dev session before the first one, and run in the main
  session, never a subagent.

**Ask First:**
- **Dev waits for all three questions below to be ruled.** The card table is written to each recommended option. A
  different ruling changes the table's rows and nothing else.
- Any card, control or value not in Design Notes' card table, or a frame row dropped beyond the table's stated rules.
- Applying the Schema migration to production, and every T1 write: ask the owner in the session (memory's two refusal
  patterns). If the apply is refused, offer him the paste into Supabase's SQL editor.
- A change to any vendored chunk's bytes, or to `cards.js`'s shape.

**Never:**
- `card_assets: false`, an empty `exclude`, `!important` as an override, or a competing stylesheet for a card that is
  not excluded.
- A per-post or per-instance card value. A card value is site-wide by construction (A33 §0), and a card is never a
  placeable section or a Layers row (FR-D5).
- The A33 Treatment dropdown, treatment controls, the read-only treatment block or a Contrast Band rule (Epic 10).
- `.kg-nft-card` (owner, 2026-09-03: stays Ghost's), the blockquote (A25's measure) or a public-preview row.
- A translatable string (P0·7: the screen controls none).
- Editing `claude-design-export/`, a vendored chunk, or a `record` document; a hard-coded count anywhere.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| No card designed | `card_designs` `{}` or no row | `card_assets: true`; `cards.css` is D12's two rules alone; no `LICENSE-ghost.txt` unless `cards.js` ships; gscan 0/0 on both pins | — |
| One static card | `{ callout: { emoji: 'hidden' } }` | `exclude: ["callout"]`; `cards.css` = widths + Ghost's `callout.css` + radius + `.kg-callout-emoji` hidden; licence + README line; Ghost's `cards.min.css` no longer carries callout | — |
| Header designed | `{ header: { … } }` | `exclude` lists `header` and `header_v2`; both chunks copied | — |
| A card with no chunk | `{ divider: { glyph: … } }` | CSS added, no exclude name; `card_assets` stays `true` if it is the only one | — |
| Scripted card | gallery or toggle designed | its chunk in `cards.css`, its script in `cards.js`; gallery's `GS050-CSS-KGGC`/`-KGGR`/`-KGGI` pass because the copy styles those classes | — |
| Value back at its start | the user picks the start value again | the control's key leaves the record; a record with no key leaves `card_designs`; the badge, count and exclusion go | — |
| Reset | Reset card, confirmed | the card's key leaves the record in one journal entry; ⌘Z restores every value | Cancel writes nothing |
| Stored record malformed | an unknown card, control or value, a non-object (a hand-made row, AD-6) | the editor opens the screen with Ghost's defaults for the card and says so once; the compile refuses with `parseCardDesigns`' sentence | the sync route answers 422 and writes nothing |
| Colour control on a no-colour card | `{ signup: { background: … } }` | refused as an unknown control | 422 |
| Reading along | a second window, lock held elsewhere | every card control greyed, dropdown and canvas live, nothing journalled | R-192 |
| Callout at Ghost's palette | Callout colours = Ghost's palette | the background row is greyed with its reason (P0-0) | — |

</frozen-after-approval>

## Code Map

- `packages/library/src/cards.ts` -- NEW, pure. `CARDS`, the list in Koenig's order: key, label, plural, Ghost chunk
  names, `colour` flag, controls (`{ name, label, kind, values: [{ value, label, css }], start }`) or a `none` sentence.
  `parseCardDesigns`, `designedCards`, `excludedChunks(designs, chunkNames)`, `cardsCss(designs, chunks, version)`,
  `cardChanges` (the reset sentence's count and names). `CARD_WORDS` lives in `apps/web/lib/cards.ts`.
- `packages/library/orbit-weekly/vendor/cards/{css,js}/` -- Ghost 6.58.0's chunks, read by the shell (`chunkUniverse`), never edited.
- `packages/theme-compiler/src/compile.ts:125-126, 294-309, 840, 1022, 1037-1058, 1081-1085` -- `CompileInput.cardDesigns`
  replaces `designedCards`.
  - `package.json`'s list (`:294-309`) becomes `excludedChunks`, the chunk names, never the card keys: a divider alone
    stays `true`.
  - `cards.js` (`:840`) keeps reading the designed cards' scripted names.
  - `ghostCards` gains the CSS chunks.
  - `default.hbs`'s head gains the `cards.css` link before `screen.css`.
  - The final checks refuse `!important` outside a Ghost block.
- `packages/library/src/modules.ts:160-223` -- `CARD_NAME_RE`, `cardsJs`, `excludedCards`. Reuse the head-stripping
  (`VENDORED_HEAD`) for the CSS chunks.
- `tools/check-baseline.mjs:29-30, 718-735` -- item 8 reads `cards.css`. It splits the file at the Ghost block's header,
  lints Inflozo's rules with no warning, and gets a planted control that puts a prefixed rule in Inflozo's half.
- `tools/pilot-theme.mjs:121-127, 214-224` -- `SCAFFOLD['assets/css/cards.css']` goes (the compiler emits it), and
  `compilePilots` takes `cardDesigns`. `tools/check-snapshots.mjs:995-1020, 1168-1406` reads it.
- `tools/probe/record-theme-assembly.py:302, 324-337, 1330, 2217` -- the paywall probes keep their own copy of the two
  widths (memory: shrinking `CARDS_CSS` silently empties them). `SECTION = '81'` adds the designed-card rows.
- `supabase/migrations/` -- NEW `20261016120000_card_designs.sql`. It drops `project_treatments.paywall_design_id` and
  replaces the 5-argument `sync_project_doc` with a 6-argument one (`p_cards jsonb default null`, upserting
  `project_treatments` (`project_id`, `user_id`, `card_designs`) in the same compare-and-set). The pattern is
  `20261004200000_sync_style_pack_packs.sql`. It mirrors into `SCHEMA.sql:730-740` and the function there.
  `supabase/tests/run-rls-gate.sh` diffs the two.
- `apps/web/app/(app)/app/(authed)/projects/[id]/sync/route.ts:43-176` -- body `cards`, validated by `parseCardDesigns`
  (422 'Not a card design'), `p_cards`, read-back compare like `packs`.
- `apps/web/lib/journal.ts:45-53, 236-246` -- `CARDS_KEY = 'card-designs'` (never a template key), `Payload.cards`,
  `flushPayload`, `restoring`.
- `apps/web/lib/editor.ts:47, 78, 122-127, 201` -- `CANVASES.cards` (`file: 'assets/css/cards.css'`, `surface: true`, label
  and caption from `CARD_WORDS`). An `isPaywall(key)` (or `key === 'paywall'`) replaces `isSurface` wherever the branch
  is the paywall's own.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- every `isSurface` branch listed at :835, :1097, :1146,
  :1430, :2883, :2951, :3100, :3171-3300, :3876, :4209, :4526, :4569, :4615, :5031, :5061-5112 and :5296-5922 is
  re-read. Each either holds for both surfaces or keys on the paywall. `commitCards` sits beside
  `commitPack`/`commitPacks` (:1682-1710). The ink bar with the switcher, the chip and the **Card** dropdown beside the
  switcher, the left panel, the right panel and the reset `<dialog>` (`kit/dialog.ts`, as :6059-6261) are added.
- `apps/web/components/editor/template-switcher.tsx:64-74, 187-191, 267` -- `GLYPH.cards` (a Kit icon), the group heading
  moves out of `PAYWALL_WORDS` to a shared constant, and the amber count follows the label (absent at zero).
- `apps/web/components/controls/sidebar.tsx:218-309` + `kit/segmented.tsx`, `kit/toggle.tsx`, `kit/swatch-row.tsx`, `kit/greyed.ts`,
  `kit/badge.tsx`, `components/controls/icon-picker.tsx` -- the panel's rows reuse `ControlField`'s Kit controls. The
  customised pill uses the marigold token. The divider's glyph is P0-2's slot (`iconSvg`, R-104).
- `apps/web/lib/style-guide.ts:62-72, 167-211` + `app/(app)/app/(authed)/style-guide/frame/route.ts` -- `DESIGNED_CARDS` goes,
  and `simulatedCardsCss(designed)` is called with the project's exclusions. A `cardsDocument(nonce)` (the article and
  the chosen card's variants, nonce'd card scripts) is served by `?view=cards`. That document is the cards canvas's
  iframe, with the pack worn on it (`wearPack`, `canvas.ts:198`) and its two card `<style>` elements rewritten in place
  as values change.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts:130-131` -- `editorData` carries the parsed `card_designs`.
  The `fileOf` comment drops "`cards` (7.13) throws", because cards is no `project_templates` row.
- `apps/web/app/(app)/app/(authed)/projects/[id]/settings/rail.tsx` + `lib/translations.ts:97` (`RAIL_WORDS`) -- the
  internal **Editor cards** item.
- `apps/web/lib/editor.test.ts:33, 357`, `canvas-switch.test.ts:42`, `ghost-surfaces.test.ts:200` -- 'cards' stops being refused,
  and the surfaces become `['paywall', 'cards']`.
- `tools/probe/run-verify-editor.cjs:240-251, 8644-9117` -- step 107 joins after 106.

## Tasks & Acceptance

**Execution:**
- [ ] `supabase/migrations/20261016120000_card_designs.sql` + `SCHEMA.sql` -- the drop and the widened RPC, re-runnable,
  comments outside the body. Pushed ALONE as `Story 7.13 - Schema - …` (R-99) after the RLS gate passes. Then ask the
  owner in-session and apply through the pooler (or his paste), and read back. -- the database is never older than the code.
- [ ] `packages/library/src/cards.ts` + `cards.test.ts` -- the registry exactly as Design Notes' table, the parser, `cardsCss`
  and `excludedChunks`. Tests: every I/O row; each card's start values producing no rule; header naming two chunks; the
  list's chunk names a subset of the vendored directory (derived, with a planted name as control); every chunk name
  that is a prefix of another listed on the same card (Ghost 5's glob); no `!important` outside Ghost's block;
  determinism (two calls equal); and the parser's refusals, each behind a passing control. -- one source for three readers.
- [ ] `packages/theme-compiler/src/compile.ts` + `compile.test.ts` -- `cardDesigns`, `cards.css` on every theme, the link order,
  the licence and README lines, and the refusals. The I/O rows run as compile rows. -- FR-Q7's emission.
- [ ] `tools/pilot-theme.mjs`, `tools/check-snapshots.mjs` -- the scaffold's `cards.css` goes. A "cards" compile designs
  every card that has a panel, each with one non-start value, and gates 0/0 on both gscans with every restored
  `GS050-CSS-KG*` rule passing. Two controls: the same theme with the gallery copy removed (KGGC, KGGR and KGGI
  return as errors on both), and with routine call 10's aliases removed (the button rule on both, and the callout and
  video ones on 4.49.7). -- the gscan claim, executed.
- [ ] `tools/probe/record-theme-assembly.py` -- §81. It uploads to T1 (main session, the owner's go) the pilot theme
  with a designed callout, toggle and gallery, and reads back: `cards.css` and `cards.js` served at their `{{asset}}`
  addresses, Ghost's `cards.min.css` and `cards.min.js` no longer carrying the three, the toggle opening and the gallery
  proportioning in a real browser, and the paywall probes still 0/0. Casper is restored and read back. -- `cards.js`'s
  first real Ghost.
- [ ] `apps/web/lib/journal.ts`, `sync/route.ts`, `read.ts`, `editor.tsx` (`commitCards`) -- `CARDS_KEY` end to end, with
  `journal.test.ts` and `sync` route tests for the 422 and the one compare-and-set. -- one edit, one ⌘Z, one lock.
- [ ] `apps/web/lib/cards.ts` -- `CARD_WORDS`: the switcher row and caption, the dropdown's heading, the `customised` badge,
  the no-colour mark and sentence, the left panel's lines, each card's `none` line, the reset confirm (S14c, with the
  count and names from `cardChanges`), the greyed reasons, the malformed-record line and the announcements. `cards.test.ts`
  holds them. -- R-170, standing rule 4.
- [ ] `apps/web/lib/editor.ts`, `template-switcher.tsx`, `editor.tsx` -- the `cards` canvas:
  - the ink bar with the switcher, the chip and the Card dropdown (S14a's rows, badges and marks, in list order);
  - the left panel (S14a: Customised · the cards on Ghost's defaults · the site-wide sentence);
  - the canvas (`cardsDocument`; the selected card's 2px accent ring and name tag, scrolled into view; a click on a
    card selects it);
  - the right panel (S14e: the name, the `customised` pill, the controls, Reset to Ghost default, the no-colour
    sentence where it applies);
  - the confirm (S14c, opening on Cancel);
  - the last-viewed card kept per project in `sessionStorage` (wrapped in try/catch), else Callout.
  -- the surface.
- [ ] `settings/rail.tsx` -- **Editor cards**, landing on the same screen. -- S14d's second route.
- [ ] `tools/keyboard/journey.spec.mjs` -- a journey changes a callout value, undoes it, resets with Cancel then Reset
  card, and walks the Card dropdown by keyboard. -- keyboard (NFR-5).
- [ ] `tools/probe/run-verify-editor.cjs` -- step 107 on the deployed site (Review), reading `project_treatments` back
  through the service key and handing the fixture back. -- R-82.
- [ ] Docs, propagated (standing rule 3):
  - FR-Q7's dated note (the start-from-Ghost rule, the derived exclude list, the pack's corners);
  - dated corrections from this Create's source reads:
    - `EXPERIENCE.md` item 15: the menu order and gating;
    - `research-ghost-koenig-cards.md` §1.2 (signup waits for Portal), §1.4 (cta's inline colours are its button's),
      §2.3 (Ghost 5's prefix glob) and §3.5 (4.49.7's 106 rules);
    - `MEASUREMENTS.md` §35a, §35c and §35d (the product names are the email template's, header v1/email classes are
      mixed in, and video's thumbnails are `data-kg-*`), as dated notes beside the record;
  - AD-18 (the link order) and AD-27(a0)/(a) (`card_designs`' schema, the column dropped);
  - DW-109, DW-267 and DW-334 resolved, with DW-109 carrying the ruling;
  - `docs/section-authoring.md`'s cards line;
  - Story 7.13's card as landed;
  - the grep for `designedCards`, `DESIGNED_CARDS`, `paywall_design_id` and `SCAFFOLD['assets/css/cards.css']`
    (standing rule 7).

**Acceptance Criteria:**
- Given any project, when Dev is done, then the `cards` canvas **matches the frame** — `S14 Editor Cards.dc.html` S14a,
  S14c, S14d's count and S14e — in its components, tokens and density, with the deviations named in Boundaries alone.
- Given the Template switcher, when it opens, then **Template surfaces** lists Paywall then **Editor cards** with its
  one-line caption and, when cards are customised, an amber count read as "N customised cards" (absent at zero).
- Given the Card dropdown, when it opens, then every card is listed in Ghost's own menu order. A changed card carries
  `customised`, and the header, signup and call-to-action rows carry the no-colour mark. Choosing a card selects it on
  the canvas and opens its panel; a card with nothing of its own shows its one line in place of a panel.
- Given a changed value, when it lands, then the canvas restyles at once, the record holds only values that differ
  from the start, and a reload shows the same; ⌘Z and ⌘⇧Z step through it like any edit.
- Given Reset to Ghost default, when pressed, then S14c's dialog opens on Cancel, naming the count and the changed
  controls, with "Posts keep their content." second. Reset card returns the card to Ghost's look and clears every
  badge, and ⌘Z brings the values back.
- Given a compiled project, then `package.json`, `cards.css`, `cards.js`, `LICENSE-ghost.txt` and `README.md` are as
  Boundaries' emission rules state, and both gscans read 0/0.
- Given a theme with a designed toggle and gallery on T1, then the toggle opens and the gallery proportions from the
  theme's own files (§81).
- Given a window reading along, then every card control is visibly disabled and nothing is journalled (R-192).

## Spec Change Log

## Design Notes

### Rulings this spec is written to

R-6 (no colour controls on header, signup and call to action) · R-53 (one control name, one set of values) · R-74 (the
export decides what it is built from) · R-98 (busy labels, a skeleton per route) · R-99 (Schema first) · R-104/R-26
(Tabler icons, inline, once per use) · R-118 (no control before the story that makes it work) · R-170 (one name per
thing) · R-192 (read-only means visibly disabled) · R-195 (moved requirements, word for word) · Story 7.2's Question 2
(`card_assets: true` with no designed card) · the owner's A33 rulings of 2026-09-01/03 (NFT stays Ghost's; the current
renderer only; gallery and embed widths are Ghost's).

### Routine calls, one line each (said to the owner, not asked)

1. **Editor cards** is the one name. The entry is the switcher's Template surfaces group: the shell `EXPERIENCE.md`
   settled keeps Layers in the left panel, so S14d's "Pages · Layers · Editor cards" nav group is not built. Its count
   moves to the switcher row.
2. The Card dropdown sits beside the switcher in the ink bar's centred group, which is S14a's "dropdowns in the template
   switcher's position" on the built shell.
3. A designed card starts from Ghost's own stylesheet, copied, and every control starts at the step nearest Ghost's own
   declaration with an empty rule (research §6.5's "seed each panel from Ghost's own chunk"). "Untouched", "reset" and
   "Ghost's default" are then one look, and the control's start step is chosen by reading the vendored chunk at Dev.
4. The values ride the editor's own save as one journal key, like a Style Pack (Story 6.4), not a server action. That is
   what makes S14c's "undoable from the editor's undo stack" true, and the lock and read-only rules come for free.
5. The canvas is its own nonce'd document (the style-guide frame's way): the editor's canvas runs no script and
   refuses `eval` (`behaviours.ts:8-11`), and Ghost's chunks are IIFEs over the global `document`.
6. Ghost's seven `!important`s stay inside the verbatim copy. FR-Q7's "`!important` is not the mechanism" is about
   overriding Ghost, which an excluded card never needs.
7. Callout colours starts at **Ghost's palette** (Ghost's look). A33's "Pack tokens (default)" is the treatment era's
   default, Epic 10's.
8. The divider's glyph draws the chosen Tabler icon as a CSS mask over a data-URI of `iconSvg`'s output, once per use,
   with `LICENSE-tabler.txt` shipped (R-26). The divider stays a bare `hr`, because a card may not add markup to
   `{{content}}` (A33 §0.4).
9. FR-Q7's "4–7 control discipline" is read as the ceiling. C.1 says "a short panel is the correct answer when the
   markup offers little" (four of its panels have three or fewer), and P0·8 rule 2 lifted the 4–7 norm to a ceiling. No
   panel here passes six.
10. **Gscan's own blind spots are answered in `cards.css`, so both checkers read 0/0 (FR-J6).** Ghost's own CSS does not
    pass every rule its checker restores. On both pins, button needs `.kg-button-card.kg-align-center`, which
    `button.css` lacks; that gets a real rule, centring as Ghost already centres. Gscan 4.49.7 (Ghost 5's) asks
    callout for `.kg-callout-card-emoji`, `.kg-callout-card-text` and `.kg-callout-card-background-<colour>`, and video
    for `.kg-video-thumbnail`, `.kg-video-thumbnail.placeholder` and `.kg-video-title`. Ghost never prints these names.
    Each is written into the selector list of the rule for the real class it stands for (an alias that matches
    nothing), never in a comment. The registry carries each card's list.
11. **The list is Ghost's own menu**, read in source, and not C1c's grouping. Five of the cards are listed with no
    panel, using C1c's one-line reasons (image, GIF, HTML, Markdown, email content) and Question 3's for call to action.

### Moved at this Create (R-195), word for word, to the story that builds what they need

Pasted into Story 10.110's card and Story 10.111's card, and listed in Epic 10's preamble:

1. "the surface matches S14b" — the Treatment dropdown above the Card dropdown, the treatment's own controls in the
   sidebar while no card's panel is open, the read-only **"From the {treatment} treatment"** block in every card's
   panel (S14e), and "a card override that a new treatment claims is dropped with a one-line notice in the panel —
   never silently kept and outvoted" (S14b). Goes to **Story 10.110**.
2. "the HTML card emits no wrapper element so it cannot be a target of the Rules or Contrast Band values". The Rules half
   goes to **Story 10.110**, the Contrast Band half to **Story 10.111**.
3. "those same three [`header_v2`, `signup`, `cta`] are excluded from a Contrast Band's inversion: a band's plane may run
   behind them but their surfaces stay the author's". Goes to **Story 10.111**.

### The card table (the one place the rulings change)

Written to each question's RECOMMENDED option. **The start value is marked ▸.** It is the step nearest Ghost's own
declaration, and it adds no rule.

The rules that derive a panel from C1c:
- **Corners** never appear (FR-Q7).
- What A33 gives the treatment — **plane** (surface, container, border, edge, shadow), **padding and space around**,
  **caption placement** and **width resolution** — waits for Epic 10 (Question 2).
- No **colour** control appears on header, signup or call to action (R-6).
- Nothing crops media, lifts on hover or overrides a width Ghost fixes (A33's floor; FR-Q7).
- Values are pack roles or named steps (P0·8 rules 3, 6 and 12).

| Card (Ghost's menu order) | Excludes | Panel |
|---|---|---|
| Image | — | none — "Nothing of its own to set: an image takes the post's own look." |
| Divider | — | Glyph instead of a rule (toggle, ▸off) · Glyph (P0-2 icon slot, greyed while off) |
| Button | `button` | Height — Compact · ▸Standard · Tall · Fill — ▸Solid · Outline · Label — ▸Sentence · Uppercase · Hover — ▸Darken · None |
| Bookmark | `bookmark` | Show thumbnail (▸on) · Thumbnail side — ▸Right · Left · Above (greyed while hidden) · Rows to show: Description · Author · Publisher · Site icon (four toggles, ▸all on) |
| Gallery | `gallery` | Gutter — Tight · ▸Normal · Loose |
| Call to action | `cta` | none — "Its colours, layout and button are the author's, set per post in Ghost." (Question 3) |
| Email content | — | none — "Stripped from the published post." |
| Callout | `callout` | Callout colours — ▸Ghost's palette · Pack tokens · **Callout background** — ▸Base · Surface · Tint · Accent (greyed at Ghost's palette; Question 1) · Emoji (toggle, ▸on) · Emoji size — ▸Small · Large |
| Signup | `signup` | Field height — Compact · ▸Standard · Tall · Form layout — ▸Side by side · Stacked · Split picture — Third · ▸Half · Disclaimer — ▸Small · Hidden |
| Header | `header`, `header_v2` | Height — ▸Tight · Generous |
| Toggle | `toggle` | Chevron side — ▸Right · Left · Divider under the heading — Rule · ▸None · Heading size — ▸Body · Small head |
| Video | `video` | Play button — Small · ▸Medium · Large · Overlay scrim — None · ▸Light · Heavy · Control bar — ▸Dark · Light |
| Audio | `audio` | Show thumbnail (▸on) · Thumbnail size — ▸Inline · Large (greyed while hidden) · Player accent — ▸Accent · Text |
| File | `file` | Download icon — ▸Right · Left · Show description (▸on) · Show file size (▸on) |
| Product | `product` | Image position — ▸Above · Beside · Rating colour — ▸Accent · Text · Button — ▸Match the Button card · Text link |
| GIF | — | none — "Renders as an image card." with "Open Image →" |
| HTML | — | none — "The author's markup wins, and it should." |
| Markdown | — | none — "Ordinary headings, lists and links." |
| Embed (Ghost's Embeds group: YouTube, X, Vimeo, CodePen, Spotify, SoundCloud, Other…) | — | Alignment — Left · ▸Centred |

**Not listed, each Ghost's:**
- **Public preview** leaves no element (P0·7).
- **Email call to action** never appears in Ghost's menu by default, on either major.
- **Transistor** is an Embeds entry that Ghost 6 turns off by default and Ghost 5 lacks, and it keeps its own chunk.
- **NFT** follows the owner's 2026-09-03 ruling.
- **Blockquote** is A25's.
- **Unsplash** inserts an image card, so it falls under Image.

None of them is ever excluded.

Where the ▸ above disagrees with the vendored chunk, the chunk wins: the start step is moved to match it, and the change
is recorded in the Spec Change Log.

**The callout at Pack tokens** paints every callout, whatever colour its author picked, in the chosen background's
token: Base `--bg-page`, Surface `--bg-surface`, Tint `--plate` (the pack's computed hover plate, the swatch S14e draws)
and Accent `--accent`. The text takes the matching token: `--text-body`, and `--text-on-accent` on Accent. Links follow
the text.

Values the frames drew and the rules remove:
- C1c's corners, everywhere;
- Gallery's Width treatment, Image fit (Uniform crops) and Show the caption;
- Button's Corners and Lift;
- Toggle's Surface, Corners and Padding;
- Audio's Surface and Corners;
- Video's Corners;
- File's Border and Corners;
- Product's Container, Corners and Marigold (not a pack role);
- Header's Alignment (the author's), Scrim and Button fill (colour);
- Signup's Field and button corners;
- Image's every row;
- Embed's Maximum width (Ghost fixes it);
- Bookmark's Border, Corners and Surface.

The value names for Toggle and Signup are C1c's own: "Small head" is drawn, and "Split picture" is C1c's "Split image
ratio", named for what it affects (P0·8 rule 5).

### `cards.css`, one designed callout (emoji hidden), sketched

```css
.kg-width-wide { max-width: var(--site-width); }
.kg-width-full { max-width: 100%; }
/* Ghost's own styles for these cards: callout — copied unchanged from Ghost 6.58.0, core/frontend/src/cards/css/.
   Copyright (c) 2013-2026 Ghost Foundation. MIT licence: the full text is LICENSE-ghost.txt. */
.kg-callout-card, .kg-callout-card * { box-sizing: border-box; }
/* … the rest of callout.css, byte for byte … */
/* This theme's card settings */
.kg-callout-card { border-radius: var(--radius-card); }
.kg-callout-card div.kg-callout-emoji { display: none; }
```

### Facts this spec rests on (standing rule 1 — read in source at this Create, 2026-10-15)

These were read from npm tarballs of Ghost 5.130.6 and 6.58.0 and their pinned packages: koenig-lexical 1.7.2 and 1.9.2,
each byte-identical to the copy the admin serves, and kg-default-nodes 2.0.1 and 2.2.0. The two gscans are 4.49.7 and
6.4.2. Paths are relative to each package. T1 executes the deploy-side ones at Dev, in §81.

- **Chunks.** 6.58.0's `core/frontend/src/cards/css/` holds:
  - CSS: `audio, blockquote, bookmark, button, callout, collection, cta, file, gallery, header, header_v2, nft, product,
    signup, toggle, transistor, video`;
  - JS: `audio, gallery, toggle, video`.

  5.130.6 has the same set less `transistor`. Only `video.css` differs: 6.58.0 adds `background: rgba(0,0,0,.5)` to
  `.kg-video-player`. Each vendored file, with its two head lines cut, is 6.58.0's byte for byte.
- **`card_assets` on Ghost 6.** `card-assets.js:83-105` filters exact names against the manifest, so an unknown name
  like `image` is ignored and `header` and `header_v2` are separate. An empty bundle links no tag
  (`:126-138`, `ghost_head.js:440-447`).
- **`card_assets` on Ghost 5.** `CardAssets.js:26-55` builds `css/!(a|b).css` through globrex 0.1.2. That is a prefix
  lookahead: `!(header)` drops `header_v2` too, and `exclude: []` drops every chunk. No other chunk name is a prefix of
  another, which `cards.test.ts` holds by derivation. Ghost 5 can link a `cards.min.js` it never wrote when all four
  scripted cards are excluded (`:57-63`, lazy minify). That is a harmless 404, recorded for DW-326's Ghost 5 pass.
- **gscan's `GS050`** (`lib/checks/050-koenig-css-classes.js:16-48`, the same in both pins):
  - a card's rules run only while it is excluded;
  - `.css` and `.hbs` files are scanned with an unanchored `\.<class>` match;
  - KGWW and KGWF are always on, as errors.
  - Gallery's KGGC, KGGR and KGGI are errors.
  - No rule exists for cta, header, header_v2, signup, collection or transistor.
  - 4.49.7 has 106 rules and 6.4.2 has 103. Routine call 10 lists the rules Ghost's own CSS fails.
- **The menu** (`buildCardMenu.ts:24-103`, by priority, both majors' main group alike) runs Image, Divider, Button,
  Bookmark, Gallery, Public preview, Call to action, Email call to action, Email content, Callout, Signup, Header,
  Toggle, Video, Audio, File, Product, GIF, HTML, Markdown, then the Embeds group. It is gated as follows:
  - Email call to action is hidden by default on both (`EmailCtaNode.tsx:27-29`; 5.x: `contentVisibility` on);
  - Signup appears only while sign-up access is "anyone";
  - GIF appears only with a Klipy (6) or Tenor (5) key;
  - Transistor is 6.x only and off by default.
- **Classes on the web** (kg-default-nodes):
  - callout: `kg-callout-card-<colour>` for white, grey, blue, green, yellow, red, pink, purple and accent;
  - divider: a bare `<hr>`;
  - GIF: an image card;
  - file: its description is `.kg-file-card-caption`;
  - product: inner classes `kg-product-card-*` (the `kg-product-title`/`-image`/… names are the EMAIL template's);
  - header: v2 is `kg-header-card kg-v2` plus layout classes;
  - cta: `kg-cta-bg-<bg> kg-cta-<layout>`, with its background a class.
- **Inline colours:**
  - callout: none;
  - cta: only `a.kg-cta-button`;
  - signup: its wrapper (with `display: none` until Portal reveals it), button and texts;
  - header v2: its wrapper, texts and button.
- **Vendored chunk contents.** `callout.css` writes the nine colours as literal `rgba()` and the accent as
  `var(--ghost-accent-color)`, with the radius `8px` and the emoji `1.15em` (`:7-64`). `audio.css` holds three
  `!important`s and `video.css` four (vendored).

## Owner's manual test

Do this on the real site after Deploy, on a laptop at full width, signed in as yourself. **Pilot sections** is
`b6d4db35-8e5e-45e1-a70f-4daa28916d51`. Steps 4, 9 and 11 test your rulings on Questions 1, 2 and 3 (the recommended
options). Step 13 puts everything back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Open the template menu at the top (it says **Home**). | — | At the bottom, under **Template surfaces**: Paywall, then **Editor cards** with a one-line description under it. No number beside it. |
| 2 | the same | Template menu | Click **Editor cards**. | — | The address ends `/cards`. A dark top bar with **NOT A PAGE SECTION** and a **Card** menu reading **Callout**. In the middle, the sample post "The domains are the tell…" with Ghost's callouts in all their colours at the top, the first ringed in coral with a small CALLOUT tag. On the right, Callout's panel: Callout colours (Ghost's palette chosen), Callout background (greyed, with a reason), Emoji (on) and Emoji size (Small). On the left: no customised cards yet, and a line saying cards are styled once for the whole site. |
| 3 | `…/cards` | Editor cards | Open the **Card** menu. | — | Every card in the order Ghost's own editor menu lists them: Image, Divider, Button, Bookmark, Gallery, Call to action, Email content, Callout, Signup, Header, Toggle, Video, Audio, File, Product, GIF, HTML, Markdown, Embed. Call to action, Signup and Header carry a small "no colour controls" mark. No "customised" badge anywhere. |
| 4 | the same | Callout panel | Choose **Pack tokens** under Callout colours, then **Tint** under Callout background. | — | Every callout on the sample post turns one pale colour, whatever colour it had, the accent one too. The panel shows **customised**, the Card menu's Callout row shows **customised**, the left panel lists Callout, and the template menu shows an amber **1** beside Editor cards. |
| 5 | the same | Callout panel | Switch **Emoji** off, then press ⌘Z. | — | The 💡 disappears from every callout, then comes back. |
| 6 | the same | Callout panel | Press **Reset to Ghost default**. Press **Cancel**. Press it again and press **Reset card**. | — | A small window: "Reset Callout to Ghost's default?" and "Removes your 2 changes — colours and background — everywhere callouts appear. Posts keep their content.", with **Cancel** focused. Cancel changes nothing. Reset card brings Ghost's colours back, and every "customised" and the amber 1 disappear. |
| 7 | the same | Editor cards | Press ⌘Z. | — | The pale callouts and every "customised" come back. Press **Reset to Ghost default** → **Reset card** again before going on. |
| 8 | the same | Card menu | Choose **Toggle**. Choose Chevron side **Left**. Click the toggle's heading on the sample post. | — | The toggle is ringed, its arrow moves to the left, and clicking the heading opens and closes it. |
| 9 | the same | Card menu | Choose **Image**, then **Bookmark**. | — | Image: no controls, one line saying it has nothing of its own to set. Bookmark: Show thumbnail, Thumbnail side, and Description · Author · Publisher · Site icon. No border, corners or background control on any card. |
| 10 | the same | Card menu | Choose **Header**, then **Signup**. | — | Each panel has no colour control and says "Header, signup and call-to-action cards offer no colour controls — authors set those inline in Ghost's editor." |
| 11 | the same | Card menu | Choose **Call to action**. | — | No controls; one line: "Its colours, layout and button are the author's, set per post in Ghost." |
| 12 | the same | Editor cards | Set Bookmark's **Thumbnail side** to **Left**. Reload the page. Then open Theme settings at the top and click **Editor cards** in its left menu. | — | After the reload Bookmark is still customised with its picture on the left. Theme settings' **Editor cards** brings you back to this screen with Bookmark selected. |
| 13 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` in this window, then `…/cards` in a **new** window | Editor here; Editor cards, read-only, in the new window | Leave this window's editor open. Open a new window (Ctrl+N), paste the Editor cards address and press Enter. Look at Bookmark's panel, then close the new window. In this window open Editor cards and **Reset** Bookmark. | — | In the new window: the blue line saying you are editing this site somewhere else, every control greyed and doing nothing, the Card menu and the sample post still working. After the reset here: nothing customised, no amber number. |

## Questions for the owner

Dev waits for all three. Each is written in the spec to its RECOMMENDED option.

### Question 1 — The callout's background row: its name and its choices

**In plain English.**
- Every section has a row called **Background role** with five choices: Base, Surface, Accent, Contrast, Image.
- The drawing of the callout's panel also has a row called **Background role**, but with four other choices: Base,
  Surface, **Tint** (a pale shade of your page colour) and Accent.
- You ruled that one name means one set of choices everywhere (R-53), so the two cannot both be "Background role".
- The row only matters when Callout colours is set to Pack tokens. Then every callout on your site takes that one
  colour, whatever colour its author picked in Ghost.

**Example.** You set Callout colours to Pack tokens. With option 1 the next row reads "Callout background" and you can
pick the pale Tint the drawing shows, but never a dark callout. With option 2 it reads "Background role" like a
section's, and you could pick Contrast for a dark callout with light text, but not Tint.

1. **Rename it "Callout background"** and keep the drawing's four choices: Base · Surface · Tint · Accent. **(RECOMMENDED)**
2. **Keep "Background role"** and offer a section's choices a callout can take: Base · Surface · Accent · Contrast. The
   panel says "A callout holds no picture" for the missing Image.
3. **Leave the row out**: at Pack tokens every callout takes Surface, and the panel says so.

**Ruled:** _(awaiting the owner)_

### Question 2 — Until the card styles arrive, what can a card's panel change?

**In plain English.**
- A later part of the plan (Epic 10) adds six whole-site **card styles** — Plain, Card, Panel, Wide, Full Bleed,
  Contrast Band. One of them will decide, for every card at once, the background panel behind a card, the space around
  it, where its caption sits and how wide it may grow.
- This story builds each card's own panel now. The question is whether that panel should also offer those four
  things until the card styles exist.

**Example.** Bookmark. With option 1 you choose its picture's side, whether it shows, and which details show.
Its border and background stay Ghost's until the card styles arrive. An Image card has nothing of its own to set. With
option 2 Bookmark also gets Border and Background, and Image gets Edge, Caption, Space around and how far wide pictures
break out. When the card styles arrive, those rows are taken over, and each card you changed says so in one line.

1. **Only what is the card's own.** The four whole-site things wait for the card styles. Nothing is built twice, and
   nothing you set is taken away later. **(RECOMMENDED)**
2. **Offer them now as well.** You can set more today. Epic 10 then removes those rows with a one-line notice on each
   card you changed.

**Ruled:** _(awaiting the owner)_

### Question 3 — The call-to-action card has no drawing of its own panel

**In plain English.**
- Ghost's **Call to action** card shows on your site: a box with text, an optional picture, a sponsor label and a
  button.
- Its author picks its background, layout and button colour in Ghost's editor. Ghost writes the button's colours
  straight onto the button, where a theme cannot change them, and your earlier ruling gives the card no colour controls.
- No drawing in the design export gives it a panel, and the rest is either colour or the card styles' (Question 2).

**Example.** You choose Call to action in the Card menu. With option 1 the panel shows one line explaining why there is
nothing to set. With option 2 this story stops until Claude Design draws its panel.

1. **List it with one line**: "Its colours, layout and button are the author's, set per post in Ghost." It gets a panel
   the day a drawing gives it one. **(RECOMMENDED)**
2. **Draw its panel first.** A prompt goes to Claude Design, and this story builds what comes back.
3. **Borrow from Signup**: give it the sign-up card's Field height and Split picture rows, which only partly fit (it
   has no field).

**Ruled:** _(awaiting the owner)_

## Verification

**Commands:**
- `bash supabase/tests/run-rls-gate.sh` -- expected: passes, no SCHEMA DRIFT, before the Schema push.
- `pnpm check` -- expected: green. That includes `cards.test.ts`, `compile.test.ts`'s card rows, `journal.test.ts`,
  the sync route tests, `editor.test.ts` (surfaces `['paywall','cards']`), `style-guide.test.ts` and `busy.test.ts`.
- `node tools/check-snapshots.mjs` -- expected: the pilot theme with no designed card 0/0 on gscan 4.49.7 and 6.4.2 with
  no scaffolded `cards.css`; the cards compile 0/0 with its restored `GS050-CSS-KG*` rules; the control (gallery's copy
  removed) raising `GS050-CSS-KGGC`, `-KGGR`, `-KGGI` as errors on both.
- `pnpm keyboard` -- expected: the Editor cards journey passes.
- `python3 tools/probe/record-theme-assembly.py` -- expected: the local half 0/0 on both pins for the compiled and both
  paywall probe trees. The T1 half is recorded as MEASUREMENTS §81 on the owner's in-session go, Casper restored.
- `python3 tools/doc-audit.py --check` -- expected: passes.
- `grep -rn --exclude=.env --exclude-dir=node_modules --exclude-dir=.claude 'paywall_design_id\|DESIGNED_CARDS' .` --
  expected: only the migration that drops the column, dated records and this spec.

**Manual checks (if no CLI):**
- Production: the read-back after the apply shows one `sync_project_doc` with six arguments and no `paywall_design_id`.
- Review: `run-verify-editor.cjs` step 107 on the deployed head (the names in `CARD_WORDS`, the record read back, the
  read-only window), recorded with the real endpoints it hit (R-82).
