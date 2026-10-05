---
title: 'Story 6.6 — Auto-branding seeds the pack'
type: 'feature'
created: '2026-10-05'
status: 'done'
baseline_commit: '7200565bcd75a4a2b4f5cc2bb74fd6077e1a7ed9'
review_loop_iteration: 1
owner_test: passed
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md']
---

## In plain English

After this story, pressing **Use your brand** puts your site's colour into your project's Style Pack itself, so the
editor's page, its previews and your Projects card all wear it, and it stays an ordinary colour you can change in Edit
pack like any other. You can do it again whenever you like from the Style Pack list, where a new "From your site" row
shows your site's colour beside a **Use your brand** button, and one ⌘Z undoes it. As you ruled, your logo keeps coming
from Ghost, as your live site already shows it, and in dark mode your colour is lightened only where it would be hard
to read.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** "Use your brand" (Story 3.4) copies the site's brand into `projects.style_pack.brand`, which only the
dashboard card reads: the editor, its canvas and its previews wear the pack and never the brand, so a branded project's
card is pink while its editor is Paper's orange, and an edit made in the editor never reaches the card. The write also
reads the whole column and writes it back with no revision check, so a pack the editor saves in that instant is lost
(DW-327). S2c's project chooser was never drawn and has no bound, so with 25 projects its button falls below the cards
(DW-70). Nothing in the Style panel can run the brand again.

**Approach:** One pure rule, `brandSeed`, puts the site's accent into a pack record — light exactly, dark lightened
only where it would be hard to read (R-241), each mode with a readable on-accent — and both doors call it. S2c's action
writes the seeded pack in force through `sync_project_doc`'s compare-and-set and stops writing `brand`; the Style Pack
list gains a "From your site" row whose Use your brand is one ordinary edit. The dashboard card paints the pack alone,
and the logo stays Ghost's (R-240). The two parts no frame draws are built from the nearest drawings and approved side
by side, with no Claude Design pass (R-242). *(The owner's three rulings of 2026-10-05 are his renegotiation of this
block.)*

## Boundaries & Constraints

**Always:**
- **One seed rule, two doors.** `brandSeed(record, accent)` in `lib/pack-edit.ts` (pure, browser-safe) is the only code
  that puts a site's accent into a pack. S2c's server action and the Style panel's row both call it, so they cannot seed
  differently. It changes each mode's accent and on-accent per Design Notes' "Ruled values" and nothing else.
- **The pack in force is the one seeded** (`packIdOf`): a preset (its own record if the project has one, else the
  library's, `presetRecord`) or a `custom-<n>`. Every other own pack and every other key of `style_pack` survive.
- **S2c writes through `sync_project_doc`'s compare-and-set, never a direct update** (DW-327). For an existing project:
  `rpc('sync_project_doc', { p_project, p_docs: {}, p_base: <its revision>, p_preset, p_packs })`. `p_packs` is the
  whole validated map (`ownPacksOf` plus the seeded record, `withoutDefaults`). `p_preset` is `paper` only where the
  stored preset is not a string (3.4's floor), else null. On a stale base it re-reads that project and re-seeds, at
  most three tries, then shows S2c's failed line. A new project's insert carries the seeded map. No
  `.update({ style_pack` remains in the app.
- **`style_pack.brand` is no longer written**: once the accent is in the pack, nothing reads it. `placeholderFor`
  paints the pack in force alone (the brand override goes). Rows that hold a `brand` keep it, unread, and
  `stylePackSchema` still parses it.
- **The Style panel row is an edit like 6.4's rows**: one journal entry under `PACK_RECORDS_KEY` through
  `editInForce`'s door (read-only guard included). The canvas restyles in place with no pill, and ⌘Z undoes it. Inside
  the roster's `ReadOnly` it is greyed and unclickable while reading along (R-192). Its colour is the linked site's
  stored brand accent, the `siteAccent` that "From your site" already reads (`read.ts:379`). With none there is no row.
- **S4a's sixth dot** is that same site colour, after the card's five, as S4a draws it (`S4 Editor.dc.html:120`).
  With none, the card keeps five.
- **One word list** (R-170): the button is `BRAND_COPY.use` ("Use your brand"), the row's label
  `PACK_EDIT_WORDS.fromSite` ("From your site"), the landed edit `PACK_EDIT_WORDS.changed` ("Changed Paper."). One new
  sentence, "{name} already wears your brand.", for a press that changes nothing.
- **Frames** (R-74). S2c (`S2 Onboarding.dc.html`) as built under the owner's two-column ruling of 2026-09-10. S7c
  (`S7 Style Packs.dc.html`) for the seeded swatches. S4a (`S4 Editor.dc.html`) for the sixth dot. **The chooser at
  scale and the "From your site" row are built from the nearest drawings, exactly** (Design Notes' "Built from" table):
  no new component, colour or size, held by a computed-style stop, and every built state approved by the owner side by
  side before the Dev commit (R-242, R-74's second stated exception). Node 24; counts derived; `pnpm keyboard` run whole
  before the Dev commit.

**Ask First:**
- The owner's side-by-side approval of every built state of the row and the chooser, in the Dev session, before the Dev
  commit (R-242).
- A part the "Built from" table does not cover, or a value neither its drawing nor the Kit gives: ask, never invent.
  R-242 waives the drawing step, not R-74's sources.
- The Review's harness runs against production Supabase and T1 from the main session. If the permission classifier
  refuses a call, ask the owner in the session (R-83); never hand it to a subagent.

**Never:**
- No migration and no Schema phase: `sync_project_doc` already writes `packs` by key under a compare-and-set. No write
  to Ghost: connecting T1 only reads it. Nothing on T3 (R-238).
- Not seeded: the logo (R-240: it stays Ghost's) and the menu (it waits for the header epic, DW-66). Not done: any
  change to `linked_site_id` from the chooser (3.4's ruling), an automatic seed when the editor opens, and any change to
  the token engine's output or to a design.
- No edit to the design export; this story adds nothing to it (R-74, R-242). No hand edit of a generated file.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| S2c makes the project | a Free account with no project; T1's accent `#FF1A75`; Use your brand | one project for the site, linked; `style_pack` = `{ preset: 'paper', packs: { paper } }` with Paper's light accent `#FF1A75` and light on-accent `#1F1C16`; dark `#FF1A75` / `#171511` (R-241; it already reads on Paper's dark page). No `brand` key | a failed insert: S2c's failed line, as today |
| S2c onto an existing project | this site's project, or the card picked; revision r | the pack in force re-seeded; every other own pack and every other key kept; revision r+1 | — |
| DW-327 | the editor saves a pack between the action's read and its write | the compare-and-set refuses the stale write; the action re-reads and seeds on top of the saved packs (at most three tries) | still refused, or no row: S2c's failed line, nothing written |
| An open editor | the project is open in another tab when the brand lands | that tab's next save meets 5.8's conflict dialog ("This project was changed somewhere else"); none of its work is overwritten | — |
| An edited preset, or a custom pack, in force | `packs.paper` edited, or preset `custom-2` | the seed lands on that record and keeps its other values | — |
| No string preset stored | `style_pack` is `{ mode: 'dark' }`, or a scalar | `preset: 'paper'` written in the same call (3.4's floor); `mode` kept | — |
| A brand with no accent | a logo or a menu only | nothing to seed: a new project is still made and linked; an existing one is untouched | — |
| A short hex | the site's accent is `#f2a` | seeded as `#FF22AA` | — |
| A seed that changes nothing | the pack already wears exactly this seed | no write and no revision bump | — |
| A dark brand colour | `#1E3A8A` on Paper | light accent `#1E3A8A` with on-accent `#FBF9F5`; dark accent `#5E82D9`, on-accent `#171511` (R-241) | — |
| The row | the linked site's accent `#FF1A75`; Paper's light accent edited to blue | "From your site", the pink dot and Use your brand; a press is one edit, the canvas restyles with no pill, "Changed Paper."; ⌘Z undoes it | — |
| Already wearing it | a press that would change nothing | nothing journaled; "Paper already wears your brand." | — |
| No site colour | no linked site, or its brand has no accent | no row; the card draws five dots | — |
| Reading along | another window holds the lock | the row greyed and unclickable, no tab stop (R-192) | `commit`'s guard |
| The dashboard card | a seeded project whose accent the editor then changed to blue | the card is blue; nothing paints a stored brand over the pack | — |
| A project branded before this story | `style_pack.brand` stored, no seeded pack | its card and its editor both show the pack's own accent; Use your brand seeds it | — |
| The chooser at scale | 25 projects | from tablet up, the cards fill the rail's free height and scroll there; the caption and both buttons stay in view. Below tablet the window scrolls as one page, as today (R-242) | — |

</frozen-after-approval>

## Code Map

**The seed and the pack:**
- `apps/web/lib/pack-edit.ts` -- `PackRecord` :32-45 and the strict `packRecordSchema` :68-81 (no `brand`, no logo;
  unchanged); `samePack` :186, `withoutDefaults` :189-191; `hardToRead` :200-206 (a seed must add no on-accent
  failure); `hexOf` :211-217; `PACK_EDIT_WORDS` :264-324 (`fromSite` :311, `changed` :321). `brandSeed` and
  `wearsBrand` go here.
- `packages/section-runtime/src/colour.ts:80-92` -- `stepToContrast` (OKLCH lightness, hue kept; black or white ends the
  walk). `index.ts:57` exports only `contrast` and `isHex`. `tokens.ts:261` is the on-contrast rule the seed's on-accent
  copies; `:232` is the double step (background, then surface) the dark accent copies; `AA_PAIRS` :189-195.
- `apps/web/lib/style-pack.ts` -- `stylePackSchema` :74 (keeps `brand` as unknown); `defaultStylePack` :120;
  `ownPacksOf` :137-138, `packIdOf` :142-147, `presetRecord` :151-154; `placeholderFor` :170-201 (the brand override at
  :181-200 goes); `siteAccentOf` :297-300; the header's who-reads-what :51-59 (DW-66, DW-71).

**S2c and its action** (`apps/web/app/(app)/app/(authed)/sites/`):
- `actions.ts` -- `useBrand` :728-945.
  - The reads :748-766; the projects select has no `revision`.
  - The stale-decision guard :813-816 stays.
  - `paint` :822-858: the whole-column `.update` at :849-853 (DW-327).
  - The insert :905-913 writes `{ ...defaultStylePack(), brand }`.
  - The `brandRetry` loop :917-934 ends in `paint`. Success :942-944; `brandRedirect` :962.
  - Stale comments: :793-796 and :834 ("schema :1202").
- `apps/web/lib/probe-rule.ts` -- `Brand` :170-174, `isAccent` :183-186, `hasBrand` :249-264, `BRAND_COPY` :280-364
  (`use` :288, `failed` :363), `brandTarget` :408-414. Pure, so the editor may import its words.
- `brand-panel.tsx` -- the two columns scroll apart from tablet up, so a rail's buttons stay in view (:161-164, S11e's
  idiom); the rail `<aside>` :167 (`tablet:overflow-y-auto`); the chooser :180-233 (the cards :188-231, with no bound);
  the presses at `mt-auto` :243. `brand-screen.tsx` -- its projects read :103-119; `choosing` :161; the
  stale "OR" comment :184-189. `../placeholder.tsx:57-74` (`ProjectThumb`) paints through `placeholderFor`.
- `supabase/migrations/20261004200000_sync_style_pack_packs.sql:33-77` -- `sync_project_doc(p_project, p_docs, p_base,
  p_preset, p_packs)`:
  - It locks the row `for update`.
  - The compare-and-set returns `{applied:false, revision}` :56-58.
  - `style_pack || {preset} || {packs}` :66-74 keeps every other key, and the revision goes up by one.
  - It is executable by `authenticated`. Today only the sync route calls it (`projects/[id]/sync/route.ts:133-141`).
  - The owner's session cannot set `revision`, and no trigger bumps it (`complete_schema.sql:1209-1212`, :1293-1303).

**The editor** (`apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/`):
- `read.ts:379` -- `siteAccent: siteAccentOf(siteRow?.data?.site_settings)`. The site is read at :222, and only when
  `linked_site_id` is set; `disconnected_at` is ignored, and that is kept.
- `editor.tsx`
  - Wiring: the `siteAccent` prop :812 → `PackEditor` :6079; the roster with `readOnly={!lock.holder}` :5817; the card
    :5828; `packOf` :855.
  - The pack edit path: `commitPacks` :1677-1686 (`withoutDefaults`, then `samePack` as the no-op); `savePack`
    :2491-2505; `editInForce` :2507-2513 (its no-op test is by reference); `restyle` :2426-2462; `#editor-said` :5843.
  - The 409 conflict dialog :1879-1886, :5930-5966.
- `style-pack.tsx` -- the header's note leaving the sixth dot to 6.6 :16-21; `Dots` :52-61; `StylePackCard` :65-91
  (five `cardDots`); `StylePackRoster` :119-298, with `ReadOnly` :167 and the rows block :235-268 (font rows first,
  :236-241).
- `pack-editor.tsx` -- "From your site" in the picker :414-426 (a 10px ink-soft label, 16px dots, 7px apart; it sets
  one role only); the footer :337-356.
- `apps/web/components/kit/button.tsx:33-41` -- the Editor Sidebar Kit's 32px secondary button (`h-8 px-[13px]
  text-control-label rounded-thumb`, hairline, `hover:bg-paper`), the row's button.
- `apps/web/lib/journal.ts:52` -- `PACK_RECORDS_KEY` (the whole map on either side).

**The checks:**
- `apps/web/style-pack.test.ts` -- :53-61, :63, :72, :84 and :186-197 assert the card wears the brand; they are
  inverted. :222-227 covers `siteAccentOf`.
- `apps/web/pack-edit.test.ts` -- :37-42, :92-101, :113-121, :170-197.
- `apps/web/pilots.test.ts:209-210` -- pins `cardDots` at five, so the sixth dot is drawn apart.
- `apps/web/editor.test.ts:359-372` -- pins the sync route's source; untouched.
- `tools/keyboard/journey.spec.mjs` -- R-192's zero tab stops :1420-1438; "From your site" :1584-1610 (the harness
  site's accent is Paper's, `apps/web/app/(app)/app/harness/editor/layout.tsx:233`); the R-236 block from :1717 (rows
  :1747, the site dot :1845-1848).
- `tools/probe/run-verify-ghost-admin.py`
  - Blocks: docstring :1-8. `BLOCKS` :2672-2681 lists each block on one line, which `only_blocks`' regex needs (:767).
    `runOnly` :2685-2700.
  - Seeds: `SEEDS` :2641-2665 (`T1` :2651-2656); `seedConnect` :2623-2639.
  - The patterns to copy: `brand-none` :1355-1394 and `brand-ownership` :1396-1530, which reach S2c by URL at :1409
    and :1423.
  - Reading rows: `insert` (service role) :1036-1043; `projectsOf` :1055-1061 has no `revision`, so read it with
    `wire` :1020-1025 or `sql` :1005-1008.
  - The full sequence: `press()` :3278-3286 and the click :3309-3313; `brand-seed` :3437-3454, `brand-atcap`
    :3645-3655, `brand-picker` :4404-4497.
  - Reads `GHOST5_*` and T3 on every run: `needed` :5088-5093, `settings-keys` :5157, `brand-keys` :5184, `ghosts`
    :5303-5309; also `T1_STAFF_TOKEN` :5330.
  - Throwaway users :5233-5385. `revision` can never be lowered (`guard_revision`).
- `tools/probe/run-verify-editor.cjs` -- step 102 :7351-7421 and step 103 :7475-7639 (a planted `brand` survives a
  save). Its documented command puts keys on argv (:4); never run it that way.

**Propagation targets:** `prd.md` FR-C4 :211, FR-E5 :266 and :93; `epics.md` Story 6.6 :2862-2880; `EXPERIENCE.md`
:115 (Auto-Branding) and :154 (Style Packs); `deferred-work.md` DW-70, DW-327, DW-66 and DW-326;
`reconcile-designs-decisions.md` (the rulings); `epic-6-context.md`.

## Tasks & Acceptance

**All three questions are ruled (R-240, R-241, R-242), so Dev may open.** Nothing is drawn first: the row and the
chooser's bound are built from the "Built from" table, and the orchestrating session shows the owner every built state
beside the drawings it came from before the Dev commit (R-242).

**Execution:**
- [x] `packages/section-runtime/src/index.ts` -- export `stepToContrast` beside `contrast` and `isHex` (:57) -- the
  seed's colour maths is the engine's own, and the browser needs it
- [x] `apps/web/lib/pack-edit.ts` -- add `brandSeed(record, accent)` per Design Notes, plus
  `PACK_EDIT_WORDS.wearsBrand(name)`. An accent that is not `#RRGGBB` returns the record unchanged -- the one rule both
  doors call
- [x] `apps/web/lib/style-pack.ts` -- three changes, the server's half of the seed and a card that cannot disagree with
  the editor:
  - `brandPacks(stylePack, accent)` returns `{ packs, preset } | null`: the validated map with the pack in force
    seeded and `withoutDefaults` applied, the preset floor where the stored preset is not a string, and null where
    nothing would change.
  - `placeholderFor` paints the pack in force alone; the brand override and its comments go.
  - The header's `brand` paragraph says what 6.6 settled.
- [x] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- `useBrand`; this is DW-327, and FR-E5's seed from S2c:
  - The projects read adds `revision`.
  - The insert writes `{ preset: 'paper' }` plus the seeded `packs`, and no `brand`.
  - `paint` becomes the compare-and-set write (Boundaries). On `applied: false` it re-reads that one project; after
    three tries it goes to `BRAND_FAILED`. A brand with no accent writes nothing.
  - The stale comments in the rewritten lines go (:793-796; :834's "schema :1202").
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/style-pack.tsx`, `editor.tsx` -- the Style panel re-run
  and S4a's sixth dot:
  - The roster takes `siteAccent` and `onBrand`. The "From your site" row sits inside `ReadOnly`, built and placed as
    the "Built from" table says: the first row of the rows block, above Heading font.
  - `onBrand` seeds the pack in force through `editInForce`'s door. Where `samePack` holds, it journals nothing and
    says `wearsBrand`.
  - The card draws the sixth dot.
- [x] `apps/web/app/(app)/app/(authed)/sites/brand-panel.tsx` -- DW-70, built as the "Built from" table says (R-242):
  - From tablet up, the card list fills the rail's free height and scrolls there, so the caption and both buttons stay
    in view with 25 projects. Below tablet the window scrolls as one page, as today.
  - The stale comment in `brand-screen.tsx:184-189` goes.
- [x] the side-by-side approval (R-242) -- the orchestrating session renders every built state beside the drawings it
  came from, on a private review page: the row (with a site colour, without one, reading along, at 834) and the chooser
  (three cards and twenty-five, at 1440, 834 and 390; rendered locally, never committed). It asks the owner (R-83)
  before the Dev commit, and nothing is committed or pushed before his answer -- R-242's "approved side by side"
  *(Dev, 2026-10-05: every state rendered beside its drawing on https://claude.ai/artifact/RS72CyL6LDFiwZJMT1H8uR and
  approved by the owner in the Dev session, Question 4.)*
- [x] `apps/web/pack-edit.test.ts`, `apps/web/style-pack.test.ts`, a source guard beside the existing ones (e.g.
  `apps/web/server-wiring.test.ts`) -- the unit half of the matrix:
  - `brandSeed` over the matrix's colours on every preset. No seeded on-accent reads under 4.5:1, and the dark accent
    reads ≥ 4.5:1 on dark Base and Surface (R-241). The rest of the record is unchanged, and a bad accent is a no-op.
  - `brandPacks` with each of: a preset, an edited preset, a custom pack in force, junk records (dropped), a
    non-object column, no preset, no accent (→ null).
  - `placeholderFor` no longer paints a stored brand (`style-pack.test.ts:53-61, :186-197` inverted).
  - `sites/actions.ts` writes `style_pack` only through `sync_project_doc`.
- [x] `tools/keyboard/journey.spec.mjs` -- the row on the harness editor, whose site colour is Paper's `#D96C3F`. Each
  check sits beside a control that goes red without the change. The Style panel half, in CI before deploy:
  - On Tangerine, a press is one edit: the canvas's light `--accent` becomes the site colour, Edit pack's swatches show
    the seeded values, and ⌘Z puts Tangerine's back.
  - A second press journals nothing.
  - Reading along, the row is greyed with no tab stop.
  - With no site colour there is no row (a harness project or switch without one is added if none exists).
  - The card draws the sixth dot.
  - An `R-242 ·` computed-style stop holds the row's values to the "Built from" table, as `R-236 ·` does for 6.4's
    parts: a 1px change turns it red.
- [x] `tools/probe/run-verify-ghost-admin.py` -- DW-326's "made optional by the story that next runs it", and the review
  on real infrastructure (R-82):
  - The `--only` path needs only `GHOST6_*`: `needed` :5088-5093, `settings-keys` :5157 and `brand-keys` :5184 run on
    T1 alone, and `ghosts` :5303-5309 is built from T1.
  - Three new blocks, each on one line in `BLOCKS` (:2672-2681) and in the full sequence: `brand-pack`,
    `brand-pack-rerun`, `brand-many` (Verification).
  - The full-sequence steps that read `style_pack.brand` read the seeded pack instead: `brand-seed` :3437-3454,
    `brand-atcap` :3645-3655, `brand-picker` :4467-4497. They are not run here, because a full run needs a Ghost 5
    server (DW-326).
  - The docstring names the new blocks.
- [x] propagation, per the rulings (standing rules 3 and 7):
  - `prd.md` FR-E5 (:266), FR-C4 (:211: the seed, and "re-runnable from the Style panel" as built) and :93.
  - `epics.md`: 6.6's card.
  - `EXPERIENCE.md` :115 and :154.
  - `deferred-work.md`: DW-70 and DW-327 closed with their proof; notes on DW-66 and DW-326.
  - `reconcile-designs-decisions.md`: R-240, R-241 and R-242's Dev targets ticked (the entries were written at Create).
  - `epic-6-context.md`: a dated Dev sub-bullet.
  - Then grep for `style_pack.brand`, `brand.accent`, `{ ...pack, brand }` and "logo" beside "seed".

**Acceptance Criteria:**
- Given a connected site with an accent, when Use your brand is accepted on S2c, then the pack in force carries the
  accent (light exactly; dark and both on-accents per "Ruled values") and `style_pack` gains no `brand`; the editor, its
  previews and the dashboard card all wear it.
- Given a seeded project, when its pack's pencil opens, then Edit pack shows the seeded colours in its swatches as S7c
  draws them, and each is edited, reset to defaults and saved like any other (6.4). The card follows the edit.
- Given a project whose linked site has an accent, when the Style Pack list opens, then the "From your site" row matches
  the drawings it is built from, value for value (the "Built from" table, held by the `R-242 ·` stop, and approved side
  by side by the owner), and its Use your brand is one edit that ⌘Z undoes. With no site colour there is no row. While
  reading along it is greyed (R-192).
- Given S2c with 25 projects, when it renders at 1440 and 834, then it matches S2c as built with the "Built from"
  table's bound: the cards scroll inside the rail, and the caption and both buttons are in view (DW-70). At 390 the
  window scrolls as one page, as today.
- Given the S4a card, when the project has a site colour, then it draws six dots, the sixth the site's, as S4a draws
  them; otherwise five.
- Given a pack the editor saved before Use your brand's write lands, when the write runs, then that save survives, and
  an open editor's next save meets the conflict dialog rather than overwriting the seed (DW-327).
- Given R-98, when the row is pressed, then no busy label is owed: it is a local edit with no server work, like 6.4's
  rows. S2c keeps "Taking your brand…", and no route is added.
- Given the documents, when the story is done, then FR-E5, FR-C4, the card, EXPERIENCE.md and the ledger say what was
  built. No sentence says the brand is written to `style_pack.brand`, and none says the logo is seeded (R-240).

### Review Findings

Review of 2026-10-05, the diff since `7200565b`: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor
and the Real-infra verifier (run in the main session on the owner's in-session go, never by a subagent). One finding was
the owner's to decide (Question 5, ruled the same day); every patch is applied.

- [x] [Review][Decision] At scale the project already ticked can be out of sight inside the new scroller — the buttons are now always in view, so Use your brand can be pressed without seeing which card it applies to (the deployed shot at Pro's cap shows no ticked card) [apps/web/app/(app)/app/(authed)/sites/brand-panel.tsx — Question 5, ruled option 1 (R-243): the ticked card is drawn first, by a stable sort that holds with JavaScript off; `6.6 · DW-70 ·` holds it, red with the sort removed]
- [x] [Review][Patch] The stale-base loop — re-read, seed again, give up — lived in `useBrand`'s closure where no check could run it: the reason for the rewrite (DW-327) shipped with a regex over its source as its only evidence. Lifted into the pure `brandWrite` and tested: a stale answer re-reads and seeds over the pack saved meanwhile against the new revision; always stale gives up after `BRAND_TRIES` writes; an error or a vanished project fails at once. Control: without `row = fresh` both cases fail [apps/web/lib/style-pack.ts, apps/web/app/(app)/app/(authed)/sites/actions.ts, apps/web/style-pack.test.ts]
- [x] [Review][Patch] The chooser's card list had no floor: in a short window from tablet up (844 × 390, a phone on its side or a zoomed laptop) it shrank to a 4px sliver — buttons, and no projects to point them at. The chooser now stops shrinking at two cards and the rail scrolls as a whole past that; the form is `tablet:contents` so the floor reaches the rail. At 1440 × 900, 834 × 1112 and 390 × 844, with three projects and at the cap, in both chromes, every before/after shot is byte-identical — the states the owner approved (R-242) did not move [apps/web/app/(app)/app/(authed)/sites/brand-panel.tsx]
- [x] [Review][Patch] DW-70's bound had no check in CI — Dev measured on a scratch page that was never committed, so removing the form's bound turned nothing red before deploy. A harness page mounts the real `BrandPanel` with stand-in rows and `6.6 · DW-70 ·` in the keyboard gate holds the bound, the floor and the one-page scroll below tablet, in both chromes. Controls: the bound removed and the floor removed each turn it red [apps/web/app/(app)/app/harness/brand/page.tsx, tools/keyboard/journey.spec.mjs, apps/web/app-routes.test.ts, apps/web/busy.test.ts]
- [x] [Review][Patch] Nothing runnable pressed a card in the chooser (the full sequence's `brand-picker` waits for a Ghost 5 server, DW-326), and "a press that changes nothing writes nothing" was asserted without reading the revision. `brand-many` now picks the last card (bound to no site, below the scroller's fold) and presses: seeded, revision up by one, still unbound, the site's own project untouched. `brand-pack-rerun` presses a second time: revision and column unchanged. Its restore is checked, not swallowed [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The DW-327 source guard missed a whole-column `.upsert(` [apps/web/server-wiring.test.ts]
- [x] [Review][Patch] Two comments wrote a count down (Pro's cap; "saved four times" beside a limit of three) [brand-panel.tsx, actions.ts]

Dismissed, each read in the source first: the editor door "not normalising" the accent (`siteAccentOf` already answers
`hexOf`); a duplicate React key on the sixth dot (`Dots` keys by index); junk own packs dropped by the write (the spec's
"whole validated map", as the editor's own save does since 6.4); a logo-only brand landing as success (the matrix's own
row); a pale accent kept exactly in light (R-241's ruling; the warning's pairs hold no accent-on-page pair); the dark
double step on a custom pack whose dark page and surface sit on opposite sides (no value satisfies both; the customer
sees and edits the result); the row's label and spoken sentence (the picker's own "From your site" pattern); cards
branded before this story losing the stored colour (Design Notes, pre-launch test accounts); the harness's all-postponed
exit and docstring wording; the approval page living outside the repository (R-242's record is the ruling and Question 4).

Not staged, and said so: an open editor meeting the conflict dialog after a brand lands (the revision bump is measured on
production; the dialog on a moved revision is 5.8's, held by the editor walk), and the dark canvas after a seed in a
browser (the seeded dark values are unit-held and read off production's column; the owner's step 11 looks at it).

## Spec Change Log

## Design Notes

### The seed

`brandSeed(record, A)` takes `A` as `#RRGGBB` (callers pass `hexOf` of the brand's accent). It sets the light accent to
`A`, and the dark accent to `A` stepped lighter until it reads 4.5:1 on the dark Base and the dark Surface (R-241,
below). Each mode's on-accent stays as it is where it reads 4.5:1 on that mode's accent; otherwise it becomes the better
of that mode's Base and Text, stepped to 4.5:1 with `stepToContrast`. That is the engine's own on-contrast rule
(`tokens.ts:261`). Everything else in the record is returned unchanged.

The on-accent half is a routine call, not a question. FR-E1 authors on-accent per pack, and the seed authors it for the
customer exactly as the engine computes one. So a seed never raises 6.4's warning on its own.

Computed at Create, with the engine's own `stepToContrast` (Node 24, a scratch script over `colour.ts`):

| Site accent | Paper's light on-accent | Dark accent (R-241) | Dark on-accent |
|---|---|---|---|
| `#FF1A75` (T1's, §40) | `#1F1C16`, 4.58:1 (Paper's ink read 4.38) | `#FF1A75`, unchanged (4.91:1 on Base, 4.52:1 on Surface) | `#171511`, 4.91:1 |
| `#1E3A8A` (navy) | `#FBF9F5`, 9.85:1 | `#5E82D9` (4.92 / 4.53; navy read 1.76) | `#171511` |
| `#D96C3F` (Paper's own) | `#232019`, 4.77:1, kept | `#D96C3F` (5.35 / 4.92; Paper's own dark is `#E0805A`) | `#171511` |

### Ruled values (owner, 2026-10-05)

| Ruling | What it fixes | Declined |
|---|---|---|
| **R-240 · the logo** (Question 1) | Written nowhere. The canvas and the live theme read Ghost's own `@site.logo`, as D6a and B17 draw it: "from Ghost · Change this in Ghost" (`D6 Theme Settings Completed.dc.html:86-100`, `B Missing Surfaces.dc.html:1662-1687`) | a logo in the pack, with a Logo row |
| **R-241 · dark mode** (Question 2) | dark accent = `stepToContrast(stepToContrast(A, dark.background, 4.5), dark.surface, 4.5)`, the shape of `tokens.ts:232`; dark on-accent by the on-accent rule, on the new dark accent | exactly `A` in dark; dark untouched |
| **R-242 · the undrawn parts** (Question 3) | no Claude Design pass: the row and the chooser's bound are built from the nearest drawings ("Built from", below), held by a computed-style stop, and approved side by side by the owner in Dev. R-74 stands for every other surface | drawing them first from a prompt |

### Built from (R-242)

Each part takes the values of the drawing named beside it, exactly: no new component, colour or size.

| Part | Built from | As built |
|---|---|---|
| The row's name, "From your site" | S7a's row names (Pill radius's, `style-pack.tsx:255`) | 11.5px, medium, ink-soft, 4px above its control |
| The site's colour | S4a's card dots and S7d's "From your site" dot (`Dots`, 16px) | a 16px circle with the Kit's hairline |
| Use your brand | the Editor Sidebar Kit's 32px secondary button (`button.tsx:33-41`), medium weight as S4a's Change | 32px high, sized to its words, 7px after the dot (S7d's spacing of its "From your site" row) |
| Its place | S7a's rows block (`style-pack.tsx:235`) | the first row, above Heading font, 6px from the next |
| Reading along | the roster's `ReadOnly` (R-192) | greyed with the other rows, no tab stop |
| Below 1280 | the Controls overlay (Story 5.22), as for the other rows | unchanged |
| The chooser at scale | S2c as built (3.4), and the popup's columns that scroll apart so a rail's buttons stay in view (S11e's idiom, `brand-panel.tsx:161-164`) | from tablet up, the card list fills the rail's free height and scrolls there with the browser's own scrollbar; the caption and both presses stay at the rail's foot. Below tablet the window scrolls as one page, as today |

### Why S2c stops writing `brand`

DW-327 asks that the write not lose an editor save. Writing `brand` by key would need a migration: PostgREST cannot
merge into a jsonb column, and the owner's session cannot bump `revision`. And once the accent is in the pack, nothing
reads `brand`:
- the editor reads the linked site's own brand (`read.ts:379`);
- `placeholderFor`'s override was the 3.4-era stand-in for this seed, and after any edit in the editor it was wrong:
  the card kept the brand while the editor showed the edit.

So the one write is `sync_project_doc`'s, which already writes `packs` by key under a compare-and-set and bumps the
revision. Dropping the `brand` write keeps the card's purpose by other means, and the card says so. DW-71 taught the same
lesson: a stored value with no reader is how a column quietly becomes undeletable.

### An open editor

The seed bumps the revision, so an editor open on the project meets 5.8's conflict dialog at its next save. Nothing is
overwritten, and Reload brings in the seeded pack. That is §AD1.1's existing rule for any other writer. The edit lock
(5.17) guards editor sessions, and the brand action is not one. The editor is never seeded when it opens.

### A project branded before this story

It holds a `brand` and no seeded pack. Its card stops wearing the brand; its editor never did. Use your brand, from the
Sites card or from its list, puts the colour into the pack. Pre-launch, these are test accounts only.

### What the row reads

The row reads the linked site's stored brand accent (`siteAccent`). The daily check (3.7) refreshes it, and so does
Re-check connection.
- A project the chooser branded, if it is not linked to that site, has no row. Its re-run is the Sites card's ⋯ → Use
  this site's brand.
- A project linked to another site offers that site's colour.

## Questions for the owner

Every question is ruled; nothing is open.

### Question 1 — Should "Use your brand" copy your logo into Inflozo, or keep reading it from Ghost?

**In plain English.** "Use your brand" will copy your site's colour into your Style Pack. The plan says it copies your
logo too, but a Style Pack has no place for a logo: it holds colours, fonts and sizes. Your live site always shows the
logo you set in Ghost Admin, because the theme reads it straight from Ghost. Inflozo's own drawings agree: the Theme
settings drawing shows your logo as "from Ghost · Change this in Ghost". The plan and the drawings disagree, so this
one is yours.

**An example.** Your logo in Ghost Admin is a green "O", and you press Use your brand.
- With option 1, your project opens on your own posts with the green "O" in the header, on the canvas and on your live
  site. If you change the logo in Ghost Admin, both follow.
- With option 2, Inflozo keeps its own copy. The canvas shows the "O" even on Inflozo's sample posts, and a Logo row
  lets you remove it. But your live site still shows Ghost's logo, so removing it in Inflozo changes only the canvas.

1. **Keep reading it from Ghost (RECOMMENDED).** Nothing is copied. The canvas shows your Ghost logo whenever it shows
   your posts, which a project made by Use your brand does from the start, and your live site always does. The plan's
   "and logo" is reworded to say so.
2. **Copy it into the Style Pack.** The Style Pack list gets a Logo row (the picture, and Remove), drawn first in
   Claude Design, and the plan's token table gains a logo row. The canvas and your live site can then disagree, as in
   the example.

**Ruled: option 1 (owner, 2026-10-05).** *"Keep reading it from Ghost"*. Recorded as **R-240**. Nothing about the logo
is copied or written; FR-E5, FR-C4 and the card are reworded at Dev.

### Question 2 — In dark mode, which colour should your buttons and links use?

**In plain English.** Every Style Pack has its own accent colour for dark mode, picked by hand so it reads well on a
dark page. When "Use your brand" puts your colour in, the dark one has to be decided too.

**An example.** Your brand colour is navy, `#1E3A8A`. On a dark page navy is almost invisible: 1.8:1 against Paper's
dark page, where small text needs 4.5:1.
- With option 1, dark mode gets a lighter blue, `#5E82D9`, which reads well.
- Your test site's pink, `#FF1A75`, already reads on dark, so under option 1 it stays exactly pink.

1. **Your colour in both, lightened in dark only where it would be hard to read (RECOMMENDED).** Light mode is exactly
   your colour. Dark mode is your colour, or the nearest lighter shade of it that reads 4.5:1 on the dark page. As in
   the twelve packs, dark is tuned, never just copied.
2. **Exactly your colour in both.** Dark mode matches Ghost's own buttons exactly, but a dark brand colour is hard to
   see on a dark page.
3. **Light only.** Dark mode keeps the pack's own dark accent (Paper's orange), so your colour does not appear in dark
   mode.

**Ruled: option 1 (owner, 2026-10-05).** *"Your colour in both, lightened in dark only where it would be hard to
read"*. Recorded as **R-241**; the rule is Design Notes' "Ruled values".

### Question 3 — Two parts of this story were never drawn. May I hand you a Claude Design prompt to draw them first?

**In plain English.** Your rule R-74 says every screen is built from a drawing in our Claude Design project. You made
one exception, R-236, and it was for Story 6.4 only. Two parts of this story have no drawing:
- the "Which project?" cards in the Use your brand window, including how the list scrolls when you have many projects
  (this story's plan says it is drawn first, DW-70);
- the new "From your site" row, with its Use your brand button, in the Style Pack list.

The prompt is written in the section below the questions.

**An example.** On Pro you can have 25 projects. Today the window then stacks 25 cards, and the Use your brand button
ends up below all of them. The drawing decides how tall the list may get before it scrolls, so the button stays in
view.

1. **Run the prompt in Claude Design and send me the export (RECOMMENDED).** Paste the prompt into a new chat in the
   Inflozo project, let it finish, export the project as a zip and tell me where you saved it. Only the two drawn parts
   wait for it; everything else can be built first.
2. **Skip the drawing once more.** The build copies the nearest drawings exactly: the cards as built today, the "From
   your site" dot from the colour picker, and the Change button. You approve the result side by side before the Dev
   commit, as with R-236. It is faster, but nothing you have looked at decides how they look.

**Ruled: option 2 (owner, 2026-10-05).** *"Can you design them yourself by refering existing design and making it
similar?"* Yes: there is no Claude Design pass. Both parts are designed from the drawings nearest them, made to match
them (Design Notes' "Built from"), and you see every built state beside those drawings before the Dev commit. Recorded
as **R-242**, R-74's second stated exception, for this story only. The prompt was not run, and it is no longer in this
spec.

### Question 4 — Do the two new parts match the drawings they copy? (R-242's side-by-side)

**In plain English.** You ruled that the two parts nobody drew are copied from the nearest drawings, and that you see
them side by side before the Dev commit (R-242). They are on one private review page:
https://claude.ai/artifact/RS72CyL6LDFiwZJMT1H8uR.
- Part 1 is the new **From your site** row in the Style Pack list, and the sixth dot on the Style Pack card. It is shown
  with a site colour, without one, while reading along, after one press, and at tablet width.
- Part 2 is the **Which project?** list in the Use your brand window, with 25 projects, at 1440, 834 and 390, before and
  after.

**An example.** If the **Use your brand** button looked bigger than the buttons in the drawings, or the dot sat too far
from it, you would choose 2 and name the picture. It would be fixed and shown again before anything is committed.

1. **Approve (RECOMMENDED).** Both parts match their drawings. Then the Dev commit and push.
2. **Fix something first.** Name the picture and what looks wrong. It is fixed and shown again before anything is
   committed.

**Ruled: option 1 (owner, 2026-10-05).** *"1. Approve"*, asked in the Dev session over the review page. R-242's
side-by-side half is done: both parts match the drawings they copy, and the Dev commit follows.

### Question 5 — With many projects, the one already ticked can be hidden further down the list. Show it first?

**In plain English.** In the Use your brand window, "Which project?" arrives with one project already ticked: the one
made for this site, or else your most recent one. Since this story the list scrolls inside the panel so the buttons stay
in view. The side effect: with a long list, the ticked project can be below the part you can see, and the Use your
brand button is right there to press. The review's shot of 25 projects shows five cards and none of them ticked.

**An example.** You have 25 projects and your Ghost6 project is the oldest. You open the window: you see Many 25 to
Many 21, none ticked, and Use your brand. You press it, and Ghost6 — the 25th card, which you never saw — takes the
brand. That is the right project, but you could not tell.

1. **Show the ticked project first in the list (RECOMMENDED).** The card already chosen for you is always the first
   card; the rest follow in the usual order. It works with JavaScript off, and nothing else moves. Built and shown to
   you side by side, as R-242 asks, before it ships.
2. **Leave it as it is.** The list keeps the Projects page's order exactly. With many projects you scroll to find the
   ticked one.

**Ruled: option 1 (owner, 2026-10-05).** *"1. Show the ticked project first in the list"*. Recorded as **R-243**. Built
in the Review session and shown to him before and after at 1440, 834 and 390 with the ticked project last of 25; he
answered *"1. Approve"* (R-242's side by side), and the Review commit followed.

## Owner's manual test

Do this on the real site after Deploy confirms the build, on a laptop at full width.

**Before you start:**
- **The account.** Use a fresh test account, so the connect starts clean. It is on Free, with room for one site and
  one project.
- **The connection details.** You need your test site's three connection details, from ghost6.inflozo.com's Ghost Admin
  → Settings → Integrations → Inflozo: the API URL, the Admin API key and the Content API key.
- **The colour.** Your test site's colour is blue-violet (`#3832E5`), read from it on 2026-10-05 (it was pink, `#FF1A75`,
  when this plan was written). If S2c shows another colour, expect that colour wherever this test says blue-violet, and
  in dark mode a lighter shade of it if it is a dark colour.
- **The logo.** The site has no logo, so nothing about the logo shows; as you ruled (R-240), nothing is copied.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Type the dummy email, press the button, then open the link that arrives in your inbox. | `umngkmr+brand66@gmail.com` | The welcome screen with three doors. |
| 2 | `https://app.inflozo.com/start` | First Run, then Connect | Click **Connect your Ghost site**. Follow the steps to the keys, paste the three details, and connect. | `https://ghost6.inflozo.com`, then ghost6's Admin API key and Content API key | "Nice site. Want to keep the vibe?" On the left: Ghost6, ghost6.inflozo.com, a blue-violet Accent color swatch with `#3832E5` beside it, and Home and About under Navigation. On the right: "We’ll make a project for this site and put your brand on it." |
| 3 | the page step 2 ended on, under `https://app.inflozo.com` | Use your brand | Click **Use your brand**. | — | The button says "Taking your brand…", then you land on Sites. |
| 4 | `https://app.inflozo.com/` | Projects | Look at the new **Ghost6** card. | — | The little drawing of the page has a blue-violet button. |
| 5 | `https://app.inflozo.com/projects/<id>`, the address the Ghost6 card opens | Editor | Open Ghost6 and wait for your Ghost6 posts. Press **⌘K**, choose **Newsletter**, then **Inline Row**, and place it. | — | The page shows Ghost6's own posts. The newsletter section's **Subscribe** button is blue-violet with white words, and the previews in ⌘K's list were blue-violet too. |
| 6 | `https://app.inflozo.com/projects/<id>`, the page the Ghost6 card opened in step 5 | Editor, Page panel | Click the grey area beside the page. | — | The Style Pack card says Paper. Its dots include the blue-violet, and a sixth dot at the end is blue-violet: your site's colour. |
| 7 | `https://app.inflozo.com/projects/<id>`, the page the Ghost6 card opened in step 5 | Style Pack list | Click **Change**. | — | Paper is current, and its dots include the blue-violet. Under the list is a new row, **From your site**, with a blue-violet dot and a **Use your brand** button, looking like the rows around it, as you approved it side by side. Heading font and the other rows follow as before. |
| 8 | `https://app.inflozo.com/projects/<id>`, the page the Ghost6 card opened in step 5 | Edit pack | Click Paper's pencil. | — | Light **Accent** is blue-violet (`#3832E5`) and Light **On-accent** is near-white. Dark **Accent** is a lighter blue (`#637AFF`), because your blue-violet itself would be hard to read on the dark page, and Dark **On-accent** is near-black. There is no yellow note. Click **Cancel**. |
| 9 | `https://app.inflozo.com/projects/<id>`, the page the Ghost6 card opened in step 5 | Edit pack | Click Paper's pencil, click the Light **Accent** colour, type the dummy colour in the hex field and press Enter. Then click **Save pack**. | `#1A7F37` | The Subscribe button turns green. |
| 10 | `https://app.inflozo.com/projects/<id>`, the page the Ghost6 card opened in step 5 | Style Pack list | Click **Use your brand**. Then press **⌘Z**, then **⇧⌘Z**. | — | The button turns blue-violet. ⌘Z makes it green again, and ⇧⌘Z makes it blue-violet again. |
| 11 | `https://app.inflozo.com/projects/<id>`, the page the Ghost6 card opened in step 5 | Editor | Press the small **sun** at the right-hand end of the top bar, then the moon. | — | On the dark page the Subscribe button is the lighter blue, with dark words, and easy to read. The moon brings back the light page. |
| 12 | `https://app.inflozo.com/projects/<id>`, the page the Ghost6 card opened in step 5, in a second window | Editor, reading along | Open the same project in a second window. Click the grey area, then **Change**. | — | The **From your site** row is greyed with the other rows, and clicking Use your brand does nothing. Close this window. |
| 13 | `https://app.inflozo.com/projects/<id>`, the page the Ghost6 card opened in step 5, the first window | Edit pack, then save | Click Paper's pencil, set the Light **Accent** to the dummy colour and click **Save pack**. Then click the grey area, press **⌘S** and wait for the green tick. | `#1A7F37` | The button is green and the change is saved. |
| 14 | `https://app.inflozo.com/sites` | Sites | On the Ghost6 card, press **⋯**, then **Use this site’s brand**. In the window, press **Use your brand**. | — | The window says "You’re at your project limit. We’ll put your brand on “Ghost6”." After the press you are back on Sites. |
| 15 | `https://app.inflozo.com/`, then the Ghost6 card | Projects, then Editor | Look at the Ghost6 card, then open the project. | — | The card's button is blue-violet again. In the editor the Subscribe button is blue-violet: the brand went into the pack again, this time from the Sites page. |

## Verification

**Commands (Dev):**
- `pnpm check` -- expected: green. The new `pack-edit`, `style-pack` and source-guard cases pass, each beside a control
  that fails without the change (the inverted `placeholderFor` case fails at HEAD).
- `pnpm keyboard`, run whole, never with `--grep` -- expected: green, including the "From your site" stops.
- `python3 tools/doc-audit.py --check`, run twice after a catalogue row -- expected: exit 0.
- `python3 tools/verify-design-pass.py` -- expected: exit 0, and `git diff --stat` on the export folder is empty (R-242:
  nothing is added to it).
- `bash supabase/tests/run-rls-gate.sh` -- expected: green and unchanged, because there is no migration. Its 6.4 block's
  stale-base case is the compare-and-set this story relies on.
- `python3 tools/probe/run-verify-ghost-admin.py --check`, with no `GHOST5_*` read -- expected: exit 0 on T1 alone,
  each T3 leg named as postponed (DW-326).

**Dev results (2026-10-05, Node 24, on this tree).**
- `pnpm check`: exit 0. Every new case ran and passed: the three `brandSeed` cases, the four `brandPacks` cases, the three
  inverted `placeholderFor` cases and the DW-327 source guard with its planted control. **Control:** HEAD's
  `placeholderFor({ preset: 'paper', brand: { accent: '#FF1A75' } })` returns `accent #FF1A75` and not Paper itself, so
  the inverted case fails at HEAD.
- `pnpm keyboard`, run whole: 196 passed, exit 0, including the three `6.6 ·` tests and the `R-242 ·` stop. **Control:**
  the row's dot-to-button gap moved from 7px to 8px in a scratch copy turns the `R-242 ·` stop red ("the dot and the
  button: column-gap — Expected 7px, Received 8px"); the copy was restored and compared byte for byte.
- `python3 tools/doc-audit.py --check`: the first run regenerated the story board, the second passed (0 warnings).
- `python3 tools/verify-design-pass.py`: "every structural check passes", exit 0. `git status` on the export folder is
  empty: nothing was added to it (R-242).
- `bash supabase/tests/run-rls-gate.sh`: exit 0 and unchanged, including 5.8's and 6.3's stale-base cases and 6.4's
  packs-only `sync_project_doc` cases, which are the compare-and-set this story writes through.
- `python3 tools/probe/run-verify-ghost-admin.py --check`: "all steps passed", exit 0, with no `GHOST5_*` key read. It
  names T3 as postponed on the `keys`, `settings-keys` and `brand-keys` lines (R-238, DW-326).
- **Measured, on scratch copies of this tree and of HEAD** (a scratch harness page mounting S2c's panel with stand-in
  rows, never committed):
  - The chooser: with 3 projects at 1440 × 900, 834 × 1112 and 390 × 844, and with 25 at 390, the panel is
    pixel-identical to HEAD.
  - With 25 projects at 1440 and 834, the cards scroll inside the rail (1994px of cards in a 410px list), and Use your
    brand and Skip are in the viewport with the window unscrolled. At HEAD both were below the rail.
  - The editor: the list and the card with no site colour are pixel-identical to HEAD. Reading along, the row's words
    are greyed to the same shade as Heading font's (126, 125, 123). On a touch screen (834 and 1024) the button is
    44px tall, as the other rows are; at 1440 it is 32px.

**Real services the Dev phase hit (R-82).**
- **T1** (`ghost6.inflozo.com`, Ghost 6.58.0), reads only:
  - `GET /ghost/api/content/settings/` with `GHOST6_CONTENT_API_KEY` answered 200, `accent_color` `#3832e5` and no
    logo. T1's colour is no longer the plan's pink, so the owner's manual test was rewritten for it (light `#3832E5`
    on `#FBF9F5`, dark `#637AFF` on `#171511`, computed by `brandSeed`), and its dummy colour moved from a blue to
    green `#1A7F37`.
  - `GET /admin/settings/` with `GHOST6_ADMIN_API_KEY` answered all six settings keys and the three brand keys
    (`--check`'s `settings-keys`, `brand-keys`, `brand-seed-rule`).
- **Supabase production**, reads only, through `--check`:
  - With `SUPABASE_PUBLISHABLE_KEY`: the Vault tables answer 404 over REST and `/rest/v1/sites` 200. The private,
    storage and vault schemas answer 406 PGRST106.
  - The pooler over `SUPABASE_DB_POOLER_URL` connected with the pinned PEM, and was refused with the system root.
  - Nothing was written to production.
- **Not touched at Dev:** Vercel, Resend and Dodo. The deployed build is Review's (below), and this story sends no
  mail and takes no payment.

**At Review, on the deployed build (R-82).** The real services are T1 (`ghost6.inflozo.com`, reads only), Supabase
production (throwaway users and their projects, deleted at the end) and Vercel.
- `python3 tools/probe/run-verify-ghost-admin.py --only brand-pack,brand-pack-rerun,brand-many --shots <dir>` --
  expected: PASS for each block.
  - `brand-pack`:
    - A fresh T1 connect, then S2c's Use your brand, makes one linked project.
    - Its `style_pack` is `{ preset: 'paper', packs: { paper } }` with no `brand`, and its accents and on-accents are
      the I/O matrix's first row, computed from T1's live accent.
    - The dashboard card's middle block computes to the accent.
    - The editor opens wearing the seeded pack (the canvas's `--accent`), the card draws the sixth dot, and the "From
      your site" row is there.
  - `brand-pack-rerun`:
    - Planted first: Paper with a blue accent, a Tangerine record, and a `mode` key.
    - Then the popup's Use your brand puts Paper's accent back to the site's.
    - Tangerine's record and `mode` are byte-equal, and `revision` has gone up by one.
  - `brand-many`:
    - With 24 projects inserted there are 25 cards.
    - At 1440 × 900 and at 834 the caption and both buttons are in the viewport without scrolling the window, and the
      list scrolls inside the rail; at 390 the window scrolls as one page.
    - Shots at 1440, 834 and 390 match the states the owner approved side by side in Dev (R-242). He cannot reach 25
      projects on Free, so those approved states are his look at it.
- The editor walk's pack steps 102 and 103 (`tools/probe/run-verify-editor.cjs`) -- expected: PASS (a save still
  leaves a planted `brand` untouched). Run them with the keys read inside the process, never with `env $(grep …)` on
  argv.
- Not staged end to end: the race itself, an editor save landing between the action's read and its write. Its guard is
  the compare-and-set, proven by the RLS gate's stale-base case; the source test shows the action uses it.

### Results — Review (2026-10-05)

Run in the main session on the owner's in-session go ("1. Go"), every key read inside the process and none printed.
The reviewed build is the Dev head `4042fd6e`: the editor walk read Vercel and found `dpl_93mmmwCk2tvp69dNVkdor9FekGwW`
READY, built from that commit, serving `app.inflozo.com`.

- **`run-verify-ghost-admin.py --only brand-pack,brand-pack-rerun,brand-many --shots <dir>`** -- exit 0, "all steps
  passed", run twice (as Dev wrote it, then with the review's added assertions). Real services: T1 `ghost6.inflozo.com`
  (reads only: the connect's own calls and `GET /admin/settings/` with `GHOST6_ADMIN_API_KEY`), Supabase production
  (a throwaway account through `SUPABASE_SECRET_KEY`, its projects and its entitlement) and the deployed app.
  - `brand-pack` PASS: a fresh T1 connect, then S2c's Use your brand, made one project linked to T1. Its `style_pack`
    has the keys `packs` and `preset` and no `brand`; Paper's record equals `brandSeed`'s for T1's live accent
    `#3832E5` (light `#3832E5` / `#FBF9F5`, dark `#637AFF` / `#171511`). The dashboard card's middle block computes to
    `rgb(56, 50, 229)`, the editor's canvas `--accent` is `#3832E5`, S4a's card draws six dots with the sixth the
    site's, and the "From your site" row is drawn with its "Use your brand" button.
  - `brand-pack-rerun` PASS: planted Paper with a blue accent, a Tangerine record and `mode: dark` at revision 0. After
    the popup's press: revision 1, Paper equal to `brandSeed`'s whole record, Tangerine byte-equal, `mode` and `preset`
    kept, no `brand`. **The control is the plant itself** (blue before, the site's after). A second press landed the
    same with revision 1 and the column byte-equal: nothing written. The column was put back (checked).
  - `brand-many` PASS: 24 projects inserted, 25 held (Pro's cap, read from `PLANS`). In the window and on the full page
    at 1440 and 834 the list is `overflow: auto` and scrolls inside the rail with the caption and both presses in the
    viewport and the window unscrolled; at 390 the list is `overflow: visible`. **The control is the 390 row** (same
    page, not bounded). The chooser's own path: the last card, bound to no site and below the fold, picked and pressed
    -- seeded, revision 0 → 1, `linked_site_id` still null, no `brand`, and the project for T1 untouched. The inserted
    projects were deleted and the entitlement put back to `free`.
  - The fixture user was deleted each run and the user count came back to where it started.
  - The shots at 1440, 834 and 390 were looked at beside the states approved in Dev: the same.
- **R-99, the schema is at least as new as the code:** the diff adds no migration, and every `sync_project_doc` call
  above carried `p_packs` and was applied by production.
- **`run-verify-editor.cjs`, whole, on a clean tree** -- "0 FAIL, 713 PASS", exit 0 (the walk prints its own count).
  Steps 102 and 103 PASS: a planted `brand` beside the preset survives a pack switch's ⌘S and an edited pack's ⌘S, the
  revision moving by exactly one each time; a stale pack-only body is refused 409. Both accounts deleted, users 14 → 14.
- **Local, Node 24, on the patched tree:** `pnpm check` exit 0, with the two `brandWrite` cases (control: without
  `row = fresh` both fail). `pnpm keyboard`, run whole: "197 passed", exit 0, with
  `6.6 · DW-70 ·` (controls: the bound removed, and the floor removed, each turn it red).
- **Not run:** the full ghost-admin sequence, which needs a Ghost 5 server (DW-326, R-238). Vercel was read, not
  written; Resend and Dodo are not touched by this story.
- **Question 5's fix (R-243), same session:** `6.6 · DW-70 ·` now pre-selects the last stand-in row and reads the cards:
  that row first, ticked and in view, the rest in their own order. Control: with the sort removed it is red ("the ticked
  card first, the rest in their own order"). `pnpm check` and `pnpm keyboard`, whole, were run again on the final tree
  before the commit. It reaches production with this push and has not been walked there: the owner's test sees it.

### Results — Deploy (2026-10-05)

Keys are named by their variable, never printed; each command read `tools/probe/.env` into its own environment.

- **Schema:** none. The story adds no migration (Review's R-99 line), so there was nothing to apply and no `RLS-TEST.sql`
  change; CI's `rls` gate on HEAD is green.
- **CI, for HEAD `d7429e1f`** (`GITHUB_TOKEN`, read-only): `ci.yml` run 37336165273 `check`, `rls` and `deploy` all
  `success`; `matrix.yml` run 37336165080 `success`. HEAD is Review's R-243 patch over the Dev head, so the code
  deployed is the code the Review's walks and the final local `pnpm check` and `pnpm keyboard` ran on.
- **Deployment:** `dpl_Ci8JsgDdoRmdhiya5CegDwiowiJg` READY, target production, built from `d7429e1f`
  (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`; `GET /v6/deployments`), serving `app.inflozo.com`
  (`inflozo-2mps7frt7-umangkagathara.vercel.app`).
- **Live:** `https://app.inflozo.com/sign-in` answered 200 and `https://app.inflozo.com/` answered 307 (to sign-in, signed out).
- **Owner's manual test:** every step now names its production URL (the project's own address is per-account, so it is
  given as `https://app.inflozo.com/projects/<id>`). `owner_test` stays `pending`.
- **Not touched:** T1, Resend, Dodo and the production database; Deploy only read CI and Vercel.

Deployment: dpl_Ci8JsgDdoRmdhiya5CegDwiowiJg

## Owner's test findings

Tested by the owner on the deployed site (`app.inflozo.com`, Deploy `dpl_Ci8JsgDdoRmdhiya5CegDwiowiJg`), 2026-10-05: **passed**, no findings. Accepted as built, including R-243's ticked-project-first list.
