---
title: 'Story 7.13 — The Ghost card design module and cards.css'
type: 'feature'
created: '2026-10-15'
status: 'in-review'
baseline_commit: '308898a3592c553f8192ac99cdd6f3ef1c32ee47'
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
- **All three questions below were ruled option 1 (owner, 2026-10-15)**, and the card table is written to those
  rulings.
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
- [x] `supabase/migrations/20261016120000_card_designs.sql` + `SCHEMA.sql` -- the drop and the widened RPC, re-runnable,
  comments outside the body. Pushed ALONE as `Story 7.13 - Schema - …` (R-99) after the RLS gate passes. Then ask the
  owner in-session and apply through the pooler (or his paste), and read back. -- the database is never older than the code.
- [x] `packages/library/src/cards.ts` + `cards.test.ts` -- the registry exactly as Design Notes' table, the parser, `cardsCss`
  and `excludedChunks`. Tests: every I/O row; each card's start values producing no rule; header naming two chunks; the
  list's chunk names a subset of the vendored directory (derived, with a planted name as control); every chunk name
  that is a prefix of another listed on the same card (Ghost 5's glob); no `!important` outside Ghost's block;
  determinism (two calls equal); and the parser's refusals, each behind a passing control. -- one source for three readers.
- [x] `packages/theme-compiler/src/compile.ts` + `compile.test.ts` -- `cardDesigns`, `cards.css` on every theme, the link order,
  the licence and README lines, and the refusals. The I/O rows run as compile rows. -- FR-Q7's emission.
- [x] `tools/pilot-theme.mjs`, `tools/check-snapshots.mjs` -- the scaffold's `cards.css` goes. A "cards" compile designs
  every card that has a panel, each with one non-start value, and gates 0/0 on both gscans with every restored
  `GS050-CSS-KG*` rule passing. Two controls: the same theme with the gallery copy removed (KGGC, KGGR and KGGI
  return as errors on both), and with routine call 10's aliases removed (the button rule on both, and the callout and
  video ones on 4.49.7). -- the gscan claim, executed.
- [x] `tools/probe/record-theme-assembly.py` -- §81. It uploads to T1 (main session, the owner's go) the pilot theme
  with a designed callout, toggle and gallery, and reads back: `cards.css` and `cards.js` served at their `{{asset}}`
  addresses, Ghost's `cards.min.css` and `cards.min.js` no longer carrying the three, the toggle opening and the gallery
  proportioning in a real browser, and the paywall probes still 0/0. Casper is restored and read back. -- `cards.js`'s
  first real Ghost. *(Dev, 2026-10-15: built, its local half 0/0, and the T1 half run in the main session on the
  owner's go — every row held, §81 written.)*
- [x] `apps/web/lib/journal.ts`, `sync/route.ts`, `read.ts`, `editor.tsx` (`commitCards`) -- `CARDS_KEY` end to end, with
  `journal.test.ts` and `sync` route tests for the 422 and the one compare-and-set. -- one edit, one ⌘Z, one lock.
- [x] `apps/web/lib/cards.ts` -- `CARD_WORDS`: the switcher row and caption, the dropdown's heading, the `customised` badge,
  the no-colour mark and sentence, the left panel's lines, each card's `none` line, the reset confirm (S14c, with the
  count and names from `cardChanges`), the greyed reasons, the malformed-record line and the announcements. `cards.test.ts`
  holds them. -- R-170, standing rule 4.
- [x] `apps/web/lib/editor.ts`, `template-switcher.tsx`, `editor.tsx` -- the `cards` canvas:
  - the ink bar with the switcher, the chip and the Card dropdown (S14a's rows, badges and marks, in list order);
  - the left panel (S14a: Customised · the cards on Ghost's defaults · the site-wide sentence);
  - the canvas (`cardsDocument`; the selected card's 2px accent ring and name tag, scrolled into view; a click on a
    card selects it);
  - the right panel (S14e: the name, the `customised` pill, the controls, Reset to Ghost default, the no-colour
    sentence where it applies);
  - the confirm (S14c, opening on Cancel);
  - the last-viewed card kept per project in `sessionStorage` (wrapped in try/catch), else Callout.
  -- the surface.
- [x] `settings/rail.tsx` -- **Editor cards**, landing on the same screen. -- S14d's second route.
- [x] `tools/keyboard/journey.spec.mjs` -- a journey changes a callout value, undoes it, resets with Cancel then Reset
  card, and walks the Card dropdown by keyboard. -- keyboard (NFR-5).
- [x] `tools/probe/run-verify-editor.cjs` -- step 107 on the deployed site (Review), reading `project_treatments` back
  through the service key and handing the fixture back. -- R-82. *(Dev: written, and its browser half dry-run on the
  harness; the run itself is Review's.)*
- [x] Docs, propagated (standing rule 3):
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

### Review Findings (2026-10-16)

Five layers ran: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the real-infra verifier (production's
schema through the pooler in a read-only transaction, PostgREST, the deployed routes signed out, T1 read only, Vercel and
CI). The deployed walk's step 107 ran in the main session on production (R-82); results under § Verification. Every
finding was read in the code before it was rated. One question for the owner came out of it (Question 7).

- [ ] [Review][Decision] Embed's Alignment does nothing on the site or on the canvas — Ghost and every Inflozo theme write
  no embed rule, so a site shows embeds at the left while the panel starts on ▸Centred; on the canvas the stand-in centres
  them after `cards.css`, so Left changes nothing there either. The table's start has no Ghost source to match (executed:
  the compiled pilot theme carries no `.kg-embed-card` rule; T1's Casper centres embeds in its own `screen.css`) (Question 7)
  [packages/library/src/cards.ts (embed) · apps/web/lib/style-guide.ts (THEME_CSS)]
- [x] [Review][Patch] Step 107i failed twice on production: `choose107` waited for any ring — the last card's, still in
  the document being replaced — and read the toggle's document mid-load. It now waits for the chosen card's own ring;
  run 3 then 54 of 54 (the ring lands ~640 ms after the choice) [tools/probe/run-verify-editor.cjs]
- [x] [Review][Patch] The device copy (hydrate) and an undone record were judged without the icon set, while the sync route
  judges a divider's glyph by it: one glyph the set does not draw (an icon renamed by a Tabler bump, a planted record) held
  every later save — docs included — at 422 Retrying. The hydrate reads it through `parseStoredCards`; an undo judges it
  with the loaded set (`loadedIcons`) [editor.tsx · icon-picker.tsx]
- [x] [Review][Patch] A greyed control's leftover value kept its card customised: Pack tokens → Tint → Ghost's palette left
  Callout badged, counted, excluded and its corners re-pointed while it showed Ghost's palette, with no way to clear it but
  a whole-card reset. `valuesInForce` (a greyed control at its start) now drives the badge, the count, the exclusion,
  S14c's sentence and the rules; the value is kept, so Pack tokens brings Tint back (P0·0) [cards.ts · cards.test.ts ·
  journey]
- [x] [Review][Patch] After a click on a card, focus is in the card document, which bound none of the editor's keys (⌘S
  opened the browser's Save page, ⌘Z did nothing) and whose presses never closed an open menu. Each card document now
  gets the page canvas's listeners (`wire`) [cards-surface.tsx · editor.tsx · floor.spec.mjs]
- [x] [Review][Patch] Every card chosen pushed a history entry (a changed iframe `src`), so Back stepped the canvas
  through older cards while the panel stayed put. The frame keeps its first address and a choice goes through
  `location.replace` [cards-surface.tsx · floor.spec.mjs]
- [x] [Review][Patch] The sun's `.` and the device keys still acted on Editor cards, which draws neither, changing the
  hidden page canvas. They do nothing there now; `dark-mode.test.ts` requires the condition instead of allowing it
  [editor.tsx · dark-mode.test.ts · journey]
- [x] [Review][Patch] The malformed-record line stayed after the change that saved over the record; it goes with the first
  card change [editor.tsx · lib/cards.ts · journey]
- [x] [Review][Patch] An undo or redo of a card change said nothing, and from a page canvas it happens out of sight; it
  says "Callout restyled." as an undone pack says its name [lib/cards.ts · editor.tsx · journey]
- [x] [Review][Patch] The name tag was placed once and floated off its card as faces landed or a toggle opened above it;
  a `ResizeObserver` re-places it. A failed icon download was an unhandled rejection; it is handled [cards-surface.tsx]
- [x] [Review][Patch] The Tint swatch read `cardDots[4]` by a bare index with an empty-colour fallback; it reads
  `PLATE_DOT` and passes no colour when there is none [pack-edit.ts · editor.tsx]
- [x] [Review][Patch] `cards.js` took any designed card with a vendored script, though only a stylesheet chunk's name is
  excluded; a script-only name would have run twice. It takes the names `card_assets` excludes [compile.ts]
- [x] [Review][Patch] README said `cards.css` switches Ghost's copy off (`package.json`'s `card_assets` does), left out a
  divider's settings, and listed the chunks in another order than the file's header; the test's divider row was a no-op
  replace [compile.ts · compile.test.ts]
- [x] [Review][Patch] Comments: the link-order claim held only for designed cards; `glyphRule` said `)` is encoded (it is
  not — the url is double-quoted); "seven" counts in a comment and a test title (the Never list); a spliced paragraph in
  `read.ts`; a garbled test comment [compile.ts · cards.ts · cards.test.ts · read.ts · style-guide.test.ts]
- [x] [Review][Patch] R-170: the reset arrow's name, the canvas's title and the card document's `<title>` were spelled
  outside `CARD_WORDS` [lib/cards.ts · cards-surface.tsx · style-guide.ts]
- [x] [Review][Patch] The Card dropdown's current row lacked S14a's coral check (`S14 Editor Cards.dc.html:52`)
  [cards-surface.tsx]
- [x] [Review][Patch] `lib/cards.ts` re-exported `CARDS` for no importer; removed [lib/cards.ts]
- [x] [Review][Patch] Opening Editor cards ran the site reads for the hidden page canvas; it reads nothing [editor.tsx]
- [x] [Review][Patch] The route's `cardsThere` was pinned by name alone; its read and its comparison are pinned as
  `packsThere`'s are [editor.test.ts]
- [x] [Review][Patch] The divider's glyph rule `hr:not([class])` reaches every classless `<hr>` on a page, a section's
  included; a design's bare `<hr>` is now refused at authoring (`bare-hr`) — none carries one today (the library's designs
  swept) [validate.ts · validate.test.ts]
- [x] [Review][Patch] Unheld rows, now journeys: an unsent card change survives a reload (the device record read back),
  the divider's glyph on the canvas is the icon's own drawing, and the picked swatch draws its ring [journey.spec.mjs]
- [x] [Review][Patch] Docs: `ARCHITECTURE-SPINE.md` AD-27(a0) still said `project_treatments` holds `paywall_design_id`;
  the spec's sweep expected a narrower list than the repository rightly holds; View as's absence and the Editor cards
  row's Empty mark are named in the Spec Change Log [ARCHITECTURE-SPINE.md · this spec]
- [x] [Review][Defer] A stored record the schema refuses stops every build until a card is changed, and no screen yet
  says so to a customer — DW-358, carried on Story 7.18's card [compile.ts · read.ts]
- [x] [Review][Defer] The R-236 row reaches PackEditor's late close only when timing lines up — a note on DW-350 for a
  row that always reproduces it (Story 15.1) [pack-editor.tsx · journey.spec.mjs]
- [x] [Review][Defer] The card document reads the chunk directory twice per request, and a kept card other than Callout
  loads Callout's document first — `ponytail:` notes beside the code, with their upgrade paths [style-guide.ts · editor.tsx]

Dismissed, each read in the code: the journal's `labelOf`, `vanishedDesign` and `panelOpen` (none walks a card entry);
the pack faces' `url(canvas?` rewrite (one generator writes it, unquoted); the migration not mirrored (`SCHEMA.sql` carries
it); a direct authenticated RPC call storing an unparsed record (AD-6's hand-made row, the matrix's malformed row); an
icon-first control in `pilot-theme.mjs` (none exists); step 107's lack of try/finally (the walk's `finally` deletes its
accounts, which cascades); inline-style `!important` (AD-3 admits only a custom property); a second throw in
`writeCardStyles` (only a vendored head could throw, and they are fixed); `CANVASES.cards`' file (every walker guards it);
`ControlField` (its Kit controls are what the panel reuses); the Ghost block's `/* name.css */` labels; the theme's text
scans reading Ghost's block (they fail closed, as over `cards.js`); the card tokens (every one is declared by the theme's
tokens and `reference-tokens.css`, checked).

## Spec Change Log

Dev, 2026-10-15 — routine calls made in Dev, each from a source read or an execution (none changes what a ruling decided):
- **Product's Rating colour starts at Text**, not the table's ▸Accent: `product.css:104-109` draws the stars in
  `currentColor`, the card's text, so ▸Accent would have counted every product card as designed and excluded Ghost's
  chunk on every theme. Accent is the one value that writes a rule.
- **Divider's Glyph starts at `asterisk`** (the table names no start): a Tabler name the vendored set draws, so turning
  the glyph on shows one at once; `parseCardDesigns` asks the icon set whether a stored name is drawable.
- **The no-colour mark reads "No colour controls"** (S14a's "NO COLOUR CTLS", in words), and the switcher's caption is
  "Ghost's cards, styled once", the longest that fits the 284px menu on one line (R-171).
- **The Template surfaces heading moved to `lib/editor.ts`'s `SURFACES_HEADING`** (`PAYWALL_WORDS.group` removed) now
  that it heads two surfaces; the keyboard journeys that reached Paywall with End now go End then ↑.
- **The harness editor gained its own style-guide frame route** (`app/harness/style-guide/frame`, `INFLOZO_HARNESS`
  only), so `pnpm keyboard` reaches the card document; the worn pack's faces are rewritten to `../canvas?`.
- **Kit's `SwatchRow` picked ring is fixed for every swatch row**: the picked state set two shadow utilities and the
  hairline won, so no swatch row ever drew its ring. One shadow utility at a time now.
- **The prefix-glob and vendored-subset rows live in `apps/web/style-guide.test.ts`**, not `cards.test.ts`: a core
  package's test opens no file (AD-1), and that test reads the real vendored directory.
- **AD-27's "a row per stored state" rule gains a dated note** (R18, decided as architecture): per-card overrides live
  in `project_treatments.card_designs`, site-wide, under one schema, one writer and the docs' journal, undo and lock.
- **A divider's glyph is judged by the icon set before the write** (`lib/cards.ts`' `parseStoredCards`, used by the
  sync route and `read.ts`): the set is imported only for a record that names a glyph, so every other save reads none.
- **The canvas's press handler read every press as no element** (found by the coverage check of "a click on a card
  selects it"): it tested `event.target instanceof Element` with the editor's window, and a node of the card document
  belongs to the frame's own realm — so no card was ever selected by a click and no link was held back. It now tests the
  frame's own `Element`; `floor.spec.mjs` presses a toggle and a bookmark.
- **§81's site probe is the T1 draft `inflozo-style-guide-page`** that `record-cards.py` keeps, read through the Admin
  API and its preview URL. The recorder fails closed if the draft is gone.
- **The canvas dressed a card document that had not loaded, and the editor fell to its error screen** (found by the main
  session's own `pnpm keyboard` run: 1 of 233 failed, then 2, 6 and 3 of 18 over the 7.13 journeys repeated). The
  `[designs, icons]` and pack effects touched `contentDocument` while it was the frame's next document still parsing —
  the icon set landing mid-load, or a card's choice changing the address — and `chrome()`'s `doc.head.append` threw on
  a null `head` ("Cannot read properties of null (reading 'append')" in `ringCard`, read off the caught error's
  stack). Every touch now goes through `loadedDoc` (loaded, and the card document), the load listener dressing it when
  it lands; the same journeys repeated five times then passed 30 of 30 with no unhandled error.
- **`!important` is refused at authoring too** (the main session's review of the compile): `checkImportant` refuses it in
  every stylesheet a theme writes, `screen.css` included, and nothing refused it in a design's own `style.css` — so a
  later design carrying one would have passed `pnpm check` and stopped every customer deploy that placed it. The library
  carries none today (swept: every design's `style.css`). `validateStylesheet` now refuses it (`stylesheet-important`),
  with a test and its control, and `docs/section-authoring.md` says so.
- **CI's keyboard gate went red on the Dev push (`a5cc39e1`), so nothing deployed** — the owner's "I do not see Editor
  cards link". The red test was Story 6.4's R-236 journey (Escape on Edit pack, then + New pack at once: no New pack).
  Reproduced locally 3 of 8 (the same test at `4ded429c` in a clean worktree passed 8 of 8, but CI's history shows the
  row red on six earlier pushes since 2026-10-09 — DW-350's R-236 recurrences — so it is that long-standing flake, not
  this story's). Cause, read off the failure's page snapshot (an open, EMPTY dialog): a dialog's `close` event is
  queued, so the old dialog's close landed after New pack had opened it again and set the editor back to nothing.
  `PackEditor` now ignores a close that arrives while its dialog is open again; R-236 then 16 of 16. DW-350 carries the
  finding (its R-201 row stays open).

Review, 2026-10-16 — routine calls made at Review, each from a source read or an execution:
- **A greyed control's value is no change.** P0·0 keeps a greyed control's value legible "so the user sees what returns",
  and routine call 3 makes "untouched" and "Ghost's default" one look, so `valuesInForce` puts a greyed control at its
  start for the badge, the count, the exclusion, S14c's sentence and the rules, and the record keeps the value.
- **View as is absent on Editor cards**, where S14a draws "View as Anonymous": the canvas is the sample post, which no
  visitor changes, and R-118 draws no control before the story that makes it work. The deviation is named here (AC 1).
- **The Editor cards row carries R-130's Empty mark** while no card is customised, as Paywall's does while no design is
  chosen; owner test step 1's "no number" stands.
- **A card's choice replaces the card document** (`location.replace`) rather than changing the frame's `src`, so it adds
  no history entry.
- **An undo or a redo that changes cards says so** (`CARD_WORDS.restyled`), as an undone pack says its name.
- **A design's classless `<hr>` is refused at authoring** (`bare-hr`), because the divider's glyph rule reaches it.

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

Written to the rulings: option 1 on all three questions (owner, 2026-10-15). **The start value is marked ▸.** It is the step nearest Ghost's own
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
`b6d4db35-8e5e-45e1-a70f-4daa28916d51`. Steps 4, 9 and 11 test your rulings on Questions 1, 2 and 3 (option 1 on
all three). Step 13 puts everything back.

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

All three were ruled option 1 (owner, 2026-10-15), and the spec is written to those rulings. Questions 4 to 6 were asked
and ruled in the Dev session. Question 7 came out of the Review and is open.

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

**Ruled: option 1 (owner, 2026-10-15).**

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

**Ruled: option 1 (owner, 2026-10-15).**

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

**Ruled: option 1 (owner, 2026-10-15).**

### Question 4 — May this story's database change go on the live database now? (R-99)

**In plain English.** The editor's save needs to learn to store card designs, and an unused paywall column goes. The
change is written and passes every check on a copy of the database; with it left out, the check fails exactly where it
should. Nothing on the live database had changed when this was asked.

**Example.** Today, saving in the editor stores your pages and Style Pack; after this, the same save can also store
"Callout: emoji hidden". Nothing you have saved changes, and the live editor keeps working before and after.

1. **Go.** I apply it through the database connection and read it back. **(RECOMMENDED)**
2. **I'll paste it into Supabase's SQL editor myself.**
3. **Stop the story here.**

**Ruled: option 1 (owner, 2026-10-15).** *"1. Go"*, asked in the Dev session before any production call. Applied
through `SUPABASE_DB_POOLER_URL` in this session, read back and proved on production before any code (`## Verification`).

### Question 5 — May this Dev run write to the Ghost test site T1? (R-82, R-238)

**In plain English.** §81 uploads a test theme with a designed callout, toggle and gallery to T1, checks in a real
browser that the toggle opens and the gallery lays out from the theme's own files, then puts Casper back and checks it.

**Example.** For a few minutes T1's live theme is Inflozo's test theme instead of Casper; afterwards Casper is active
again exactly as before.

1. **Go** — upload, check, restore Casper. **(RECOMMENDED)**
2. **Skip T1 in Dev**; run it at Review instead.
3. **Stop the story here.**

**Ruled: option 1 (owner, 2026-10-15).** *"1. Go"*, asked in the Dev session before any T1 write; the writes run in the
main session, never a subagent. Question 6 corrects the scope this question described.

### Question 6 — Correction: the T1 run does more than Question 5 said (R-82, R-238)

**In plain English.** The recorder takes no flags: it re-runs every earlier story's T1 check (§70–§80) before §81,
because every Inflozo theme now carries its own `cards.css` and those checks prove the earlier themes still work on a
real Ghost. T1 gets about a dozen test themes (each uploaded, switched on, checked, deleted); its logo, its Publication
Language (German, French, back) and its theme settings are changed and put back, each read back; at most one small
picture is uploaded, only if T1 hosts none (Ghost's API deletes no picture).

**Example.** For the length of the run a visitor to ghost6.inflozo.com could see a test theme or a German page; at the
end Casper, English and the logo are back, and the script checks each one.

1. **Go** — the whole run, everything put back and checked. **(RECOMMENDED)**
2. **Skip T1 in Dev**; run it at Review instead.
3. **Stop the story here.**

**Ruled: option 1 (owner, 2026-10-15).** *"1. Go"*, asked in the Dev session before the run; run in the main session.

### Question 7 — The Embed card's Alignment does nothing yet: what should its two choices mean?

**In plain English.**
- Embeds are the videos and posts an author pastes into a Ghost post: YouTube, X, Vimeo, Spotify and the rest.
- Editor cards gives Embed one control, **Alignment — Left · Centred**, starting on Centred as the design drew it.
- But Ghost adds no styling to embeds, and no Inflozo theme does yet, so on a real site an embed sits at the left edge.
  Choosing Left changes nothing there, and the "Centred" the panel shows is not what visitors see.
- On the Editor cards sample the opposite happens: embeds show centred, and Left changes nothing there either.

**Example.** An author pastes a YouTube link into a post. Today, on your site, the video sits at the left of the text
column, whatever the panel says.

1. **Every theme centres embeds, and Left moves them to the left.** The panel keeps the drawing's start (Centred), the
   sample and your site agree, and both choices work. It is how Ghost's own Casper theme shows embeds (read on T1's live
   Casper, 2026-10-16).
   **(RECOMMENDED)**
2. **Start on Left (Ghost's own look, no styling) and let Centred add the centring.** Both choices work, but the starting
   value moves away from the drawing.
3. **Remove the control.** Embed gets one line ("Embeds keep their own alignment") and no panel.

**Ruled:** _(awaiting the owner)_

## Verification

**Executed — Schema phase (2026-10-15), before any code:**
- `bash supabase/tests/run-rls-gate.sh` -- exit 0: no SCHEMA DRIFT, every earlier block still passing (6.4's width check
  now reads `widest < 5`), and Story 7.13's ten PASS lines — one six-argument `sync_project_doc`, `paywall_design_id`
  dropped, a cards-only call writing `card_designs` as the caller with one revision, a second call replacing the record
  whole and keeping `card_treatment_id`, docs + preset + packs + cards in one call, a stale base writing none of them,
  the five-, four- and three-argument calls leaving `card_designs` byte-equal, a non-object `p_cards` (string, array,
  JSON null) answering null and writing nothing, another tenant's project answering null with its record kept, anon
  42501.
- Control: the same gate over a copy of `supabase/` without `20261016120000_card_designs.sql` and HEAD's `SCHEMA.sql`
  (`INFLOZO_ARCH_DIR`) -- exit 3 at the 7.13 block ("1 sync_project_doc functions exist, the widest taking 5
  arguments"), with 6.4's and 7.9's blocks passing first.
- Supabase production, through `SUPABASE_DB_POOLER_URL` (read inside the script, never on argv), on the owner's go
  (Question 4): before — one `sync_project_doc(p_project, p_docs, p_base, p_preset, p_packs)` and `project_treatments`
  with `paywall_design_id` and 0 rows (none set); applied in one transaction; after — one function taking
  `…, p_packs jsonb, p_cards jsonb`, its `prosrc` byte-identical to the migration's body, execute granted to
  `authenticated` (and `postgres`) only, `project_treatments` columns `project_id, user_id, card_treatment_id,
  pagination_design_id, card_designs, updated_at`.
- Supabase production through PostgREST (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`) as a
  throwaway user (generate_link + verifyOtp): the deployed three- and five-name calls applied and made no
  `project_treatments` row; a `p_cards` call applied with one revision and read back as written, owned by the caller; a
  stale base answered `applied: false` and kept it; anon 401 / 42501; user count 14 → 14 after the delete.

**Executed — Dev phase (2026-10-15), locally under Node 24, nothing written to T1 or production:**
- `pnpm check` -- exit 0: lint, typecheck and every package's tests, the 7.13 rows among them (`cards.test.ts` in the
  library and the app, the compile rows, `journal.test.ts`, `style-guide.test.ts`'s vendored subset and prefix glob
  each behind a planted control, `editor.test.ts` with surfaces `['paywall','cards']`, `busy.test.ts`).
- `node tools/check-snapshots.mjs` -- PASS: the pilot theme's `cards.css` is `KOENIG_WIDTHS` and the scaffold carries
  none; every card with a panel designed (`CARDS_DESIGNED`) raises no error and no warning on gscan 4.49.7 and 6.4.2;
  the controls — gallery's copy taken out raises `GS050-CSS-KGGC`, `-KGGR`, `-KGGI` as errors on both, and routine
  call 10's answers taken out raise `GS050-CSS-KGBTNC` on both and the callout and video names on 4.49.7 alone;
  `cards.css` equals `cardsCss` of the record, its own half free of `!important`, `LICENSE-ghost.txt`, README,
  `themeFailures` and the quality gate clean.
- `node tools/check-baseline.mjs` -- PASS: `cards.css`' own half linted (Ghost's block skipped), every card value's
  rules linted; the controls — a planted `-webkit-` rule refused, and Ghost's copy linted whole raising warnings.
- `python3 tools/probe/record-theme-assembly.py`'s local half (its compile and gate functions, run without T1) -- 0/0 on
  both pins for the pilots, the cards probe and both paywall probe trees; `CARDS_DRIVER` run in Chromium against a
  local page built from the compiled tree: the toggle opens, the gallery proportions, the emoji is hidden, the toggle's
  corner is `--radius-card`, and with `cards.js` refused the toggle stays shut (the control).
- `run-verify-editor.cjs` step 107's browser half dry-run against the harness editor (no database): 107a, b, c, d, g,
  h and i held. Its first dry run caught S14c's closed dialog's Cancel counted as a live panel control; the count now
  leaves the dialog out.
- `pnpm keyboard` -- every journey passed, re-run whole after the matrix audit's additions: the 7.13 journeys (a value
  with ⌘Z and ⌘⇧Z and the greyed background row before it, S14c's Cancel then Reset card then ⌘Z, the Card dropdown by
  keyboard, reading along with the ring moving, the malformed record), `floor.spec.mjs`' canvas click, and the earlier
  Paywall journeys re-pointed (End then ↑, `SURFACES_HEADING`).
- `python3 tools/doc-audit.py --check` -- PASS after regenerating the index and the story board.
- The I/O matrix, row by row — the check that ran for each (Dev, locally), and what Review and §81 add:
  - **No card designed** — `cards.test.ts` (library) "no card designed"; `compile.test.ts` "(7.13) no card designed"
    (`card_assets` true, the two widths alone, linked before `screen.css`, no licence); `check-snapshots` (the pilot
    theme's `cards.css` is `KOENIG_WIDTHS`, no scaffold, 0/0 on both pins).
  - **One static card** — library "one static card" and `compile.test.ts` "(7.13) one static card" (exclude, the copy, the
    corners, the hidden emoji, the licence, README's line); Ghost's `cards.min.css` no longer carrying it is
    `style-guide.test.ts`' simulated bundle (the complement of `excludedChunks`) and, on a real Ghost, §81.
  - **Header designed** — library "header designed" and `compile.test.ts` "(7.13) the header card excludes header AND
    header_v2"; `style-guide.test.ts` holds Ghost 5's prefix glob (`header` before `header_v2`) behind a planted control.
  - **A card with no chunk** — library "a card with no chunk" and the same compile row (`card_assets` stays `true`, Tabler's
    licence for the glyph).
  - **Scripted card** — library "a scripted card" and `compile.test.ts` "(7.13) scripted cards" (`cards.css` and `cards.js`);
    `check-snapshots` (every card with a panel designed 0/0, and gallery's copy removed raising KGGC/KGGR/KGGI — the
    control); the toggle opening and the gallery proportioning in a browser are §81's (T1), its driver dry-run locally.
  - **Value back at its start** — library "a value back at its start leaves the record"; `pnpm keyboard` journey 1 (⌘Z
    takes the value back and the customised row goes).
  - **Reset** — library "reset" (S14c's count and names); `journal.test.ts` "(7.13) a card value is one entry … a reset is
    one entry too"; `pnpm keyboard` journey 2 (S14c opens on Cancel, Cancel writes nothing, Reset card clears every badge
    and the amber count, ⌘Z brings the values back).
  - **Stored record malformed** — the compile half: `compile.test.ts` "(7.13) a stored record card_designs' schema refuses"
    and the library's parser refusals, each behind its control. The editor half: `pnpm keyboard` "a stored record the
    editor's door refuses" (`x-inflozo-harness-cards: malformed`, a divider glyph the icon set does not draw, read by
    `read.ts`' own `storedCards`): the malformed line once, Callout at Ghost's palette, no badge, no amber count — journey 1
    asserting the line absent is the control. The 422: at Dev by the parser's behavioural refusals, `apps/web/cards.test.ts`'
    `parseStoredCards` row (an undrawn glyph refused, `leaf` kept, the set loaded only for a record naming a glyph) and the
    route-order check (the parse before the lock read and the RPC, the parsed record handed to `p_cards`); on the deployed
    site at Review by step 107e's crafted 422 with the stored record read back unchanged.
  - **Colour control on a no-colour card** — library parser refusals (`signup` and `cta` given `background`) and the
    compile's refusal row; the 422 as the row above (route order at Dev, step 107e at Review).
  - **Reading along** — `pnpm keyboard` "reading along (R-192)": every card control disabled, the Card dropdown choosing
    Toggle and the canvas ring moving to the toggle, nothing customised; on production at Review, step 107i.
  - **Callout at Ghost's palette** — `pnpm keyboard` journey 1: before the change the Callout background row is
    `aria-disabled`, its four swatches disabled and its reason shown; at Pack tokens enabled, the reason gone.
  - **And the task "a click on a card selects it"** — `floor.spec.mjs` "7.13 · S14e" (a mouse at 1280): a click on the
    toggle selects Toggle and rings it (Callout before it, the control), and a click on a bookmark selects Bookmark with
    the canvas still the card document.
- T1 `ghost6.inflozo.com` (Ghost 6.58.0), the whole recorder in the main session on the owner's go (Question 6), keys
  `GHOST6_*` read inside the process: `python3 tools/probe/record-theme-assembly.py` -- exit 0, 264 PASS lines and none
  failing, "MEASUREMENTS.md §81 written — every row held on T1, behind its controls". §70–§80 re-held with the
  compiler's own `cards.css` on every theme (the pilots and the cards tree 0/0 on gscan 4.49.7 and 6.4.2; the three gate
  probes BLOCKED as designed). §81: the designed callout, toggle and gallery gate 0/0 on both pins; under Casper,
  Ghost's `cards.min.css` (46,231 bytes) carries the three and `cards.min.js` the toggle's and gallery's (the
  CONTROL); under the probe the head links `cards.css` before `screen.css`, both before `{{ghost_head}}`'s bundle;
  `cards.css` is served at its `{{asset}}` address as `text/css`, byte for byte the compiled file (5,486 bytes);
  `cards.js` once, `defer`, as JavaScript (1,352 bytes), a script the theme lacks answering 404 (the control);
  `LICENSE-ghost.txt` 200; Ghost's `cards.min.css` no longer carries the three while still carrying the 13 undesigned
  chunks, and `cards.min.js` no longer carries the toggle's or gallery's while still carrying audio's and video's; on
  the draft `inflozo-style-guide-page`'s preview in Chromium the toggle opens on a click, every gallery image's flex is
  its width over its height, the callout's emoji is hidden, the toggle's corner is `--radius-card` (8px) and the
  gallery's gap 2rem (Loose) — and with the theme's `cards.js` refused the toggle stays shut and nothing proportions
  (the CONTROL). Restored and read back: the active theme `casper`, every probe deleted (installed: casper, racer,
  source), the site's logo `None` as before, the locale `en`, the probes' built-ins at their starts; no picture uploaded
  (this month's probe picture reused).
- The main session's own run on the final tree, in CI's order, under Node 24.18.1 (`.nvmrc`): `pnpm keyboard` first went
  1 failed / 232 passed — the canvas-load defect in the Spec Change Log, reproduced (2, 6, 3 of 18 over the 7.13
  journeys repeated), its stack read, fixed (`loadedDoc`), then 30/30 repeated five times; after the fix and the
  `stylesheet-important` rule: `pnpm check` exit 0; `pnpm keyboard` 233 passed; `pnpm build` exit 0;
  `node tools/check-traces.mjs` "every route carries its files", no client chunk carrying the font pool's record;
  `node tools/check-snapshots.mjs` PASS (5 designs at 10 targets); `node tools/check-baseline.mjs` PASS;
  `bash tools/matrix/run-matrix-gate.sh` (every design, since this push touches `packages/library/src/`) 576 passed, 574
  cases, 0 violations, no baseline changed.
- Real services in Dev: Supabase production at the Schema phase (above) and T1 for §81 (above), each on the owner's
  in-session go; nothing in Dev wrote to Vercel, Resend or Dodo. T3 retired (R-238): the Ghost 5 half is DW-326's.
- The Dev push `a5cc39e1`: GitHub Actions CI `check` failed at `pnpm keyboard` (1 failed, 232 passed — R-236, above),
  `rls` passed, `deploy` skipped, and Vercel production stayed on `4ded429c`; the render matrix workflow passed. Fixed
  and pushed again as a second Dev commit (below the Spec Change Log entry).
- Not run here: step 107 on the deployed site (Review).

**Executed — Review phase (2026-10-16):**
- CI on the Dev head `1037dcec` (`GITHUB_TOKEN`, read in process): run 38776469967 `rls`, `check` and `deploy` success, the
  render matrix success; Vercel (`VERCEL_*`): `dpl_ukkD2Pev2Z9zNvit5oDwLwXMxk7x` READY at `1037dcec`, serving
  app.inflozo.com and inflozo.com. The first Dev push `a5cc39e1`: `check` failed, `deploy` skipped, no deployment.
- The deployed walk's step 107 on production, from a detached worktree at `1037dcec` (`node_modules` hard-linked) with a
  cut copy — steps 1–5, then step 107 — in its `tools/probe-debug/` (never committed); `SUPABASE_URL`,
  `SUPABASE_SECRET_KEY`, `VERCEL_TOKEN` and `VERCEL_TEAM_ID` read inside the process. It hit app.inflozo.com (the editor,
  `/cards`, Theme settings, `/sync`, `/lock`, the style-guide frame), Supabase REST (`project_treatments`, `projects`) and
  Auth admin through the service key:
  - run 1 — 53 PASS, 1 FAIL: 107i's reading-along window had every control disabled (0 live of 9, Toggle 0 of 6) and the
    banner, but no ring on the toggle;
  - run 2 — the same FAIL, with the detail added: `ringed: null, tag: null`, the toggle's document read mid-load;
  - run 3 — with `choose107` waiting for the chosen card's own ring (the patch): **0 FAIL, 54 PASS**, the ring landing 555
    ms (Bookmark) and 642 ms (Toggle) after the choice;
  - every run: 107e stored exactly `{ callout: { colours: 'tokens', background: 'tint' } }`, owned by the user, revision
    0 → 1, and the crafted post answered 422 "Not a card design" with the record and revision unchanged; the project
    handed back as it started (`[]`), zero CSP violations, users 14 → 14.
- The real-infra verifier, read only: production through `SUPABASE_DB_POOLER_URL` (a read-only transaction) — one
  `sync_project_doc(uuid, jsonb, bigint, text, jsonb, jsonb)`, its `prosrc` equal to the migration's body (1,762
  characters), EXECUTE for `authenticated` and `postgres` alone, `project_treatments` with `card_designs` and without
  `paywall_design_id` (controls: the old five-argument signature resolves to nothing, the new one resolves); PostgREST
  anonymous — the six-name and three-name calls 401 `42501` (found, then refused), an unknown argument 404 `PGRST202`
  (the control); the deployed routes signed out — `/projects/<uuid>/cards` 307 to sign-in, `POST …/sync` 401 "Not signed
  in", `GET …/sync` 405, an unknown inflozo.com path 404 (the control); T1 (`GHOST6_STAFF_ACCESS_TOKEN`, GET only) —
  installed `casper` (active), `racer`, `source`, no probe left behind; the home links Ghost's `/public/cards.min.css`
  (46,231 bytes, §81's figure) and no Inflozo `cards.css` (`/assets/cards.css` 404, `/assets/built/screen.css` 200, the
  control).
- Production's one `project_treatments` row is the owner's **Pilot sections** (eight cards customised, last written
  2026-10-16T01:49Z): his own testing, not a walk's, and left alone. The verifier's "16 users" was read while a walk's two
  throwaway accounts existed; every walk ended 14 → 14.
- T1, read only (`curl` of the live Casper's `/assets/built/screen.css`): `.kg-embed-card{display:flex;flex-direction:
  column;align-items:center;width:100%}`; the compiled pilot theme carries no `.kg-embed-card` rule at all (Question 7).
- Locally after the patches, Node 24.18.1: `pnpm check` exit 0; `node tools/check-snapshots.mjs` PASS; `node
  tools/check-baseline.mjs` PASS; `pnpm keyboard` whole — **238 passed** (the review's five rows among them: the greyed
  value, the divider's glyph, no sun or device on Editor cards with Home as the control, the unsent change across a reload,
  and `floor.spec.mjs`' card-document keys, menu and history). An earlier whole run stopped at "the journey uses no
  pointer at all": the card-document row had been written into the keyboard journey with a click, and moved to
  `floor.spec.mjs`, the pointer file.
- Not run here: step 107 on the Review head — after this push deploys, appended in a second Review commit.

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
  expected: the migration that drops the column and the two earlier ones that wrote it, `SCHEMA.sql`'s note, the RLS
  gate's "it is gone" assertions (both copies), the spine's dated corollary, the epics and their context files, DW-267,
  dated records, specs and the generated board — no live reader or writer (Review, 2026-10-16: the verifier's run).

**Manual checks (if no CLI):**
- Production: the read-back after the apply shows one `sync_project_doc` with six arguments and no `paywall_design_id`.
- Review: `run-verify-editor.cjs` step 107 on the deployed head (the names in `CARD_WORDS`, the record read back, the
  read-only window), recorded with the real endpoints it hit (R-82).
