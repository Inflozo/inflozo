---
title: 'Story 7.14 — Treatment selection from Theme Settings'
type: 'feature'
created: '2026-10-16'
status: 'ready-for-dev'
owner_test: none
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

Nothing new appears on screen in this story, because what it asks for already works: since Story 7.13, Theme settings'
left menu has **Editor cards**, your card styles are kept once for the whole site rather than inside any section, and
every theme Inflozo builds carries them whatever sections its pages hold. This story proves it on the live site —
deleting a section never changes your card styles, and a theme whose pages hold no sections at all still carries every
card you designed — and says so beside the code that makes it true. The other half, choosing how page links look from
Theme settings when no page has a feed, moves word for word to Story 10.112, which builds the page-link designs; until
then Theme settings shows no pagination row.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-Q9 asks that the non-placeable treatments — Koenig card styling and pagination styling — stay
selectable from Theme Settings when the section that would host them is absent, that their emission never depends on a
host section, and that the selection survives that section's removal. Since Story 7.13 the card half holds by
construction — no section hosts card styling (S14d: "a project-level decision … beside Pages and Layers rather than
inside any page's section list"), and Theme settings' rail reaches Editor cards — but nothing names FR-Q9 or proves it
on the live site. The pagination half has nothing to select until A34's designs exist (Story 10.112).

**Approach:** Prove the card half and label it: one compile check that a project with no section on any template and
the same project with sections carry the same `cards.css` and `card_assets`, a comment naming FR-Q9 beside the code
that makes it so, and a production walk step showing that deleting a section leaves `project_treatments.card_designs`
byte-equal and Editor cards still customised. The pagination half is handed to Story 10.112 word for word (R-118,
R-195) — done at this Create. Question 1 decides whether anything visible is added; this spec is written to its
recommended option.

## Boundaries & Constraints

**Always:**
- Card styling has **no host section**. It is chosen on Editor cards, reached from the switcher's Template surfaces
  group and from Theme settings' rail (`S14 Editor Cards.dc.html` S14d; EXPERIENCE § "The three canvases that are not
  pages": "It is also where FR-Q9's fallback lands").
- `cards.css` and `card_assets` derive from `CompileInput.cardDesigns` alone — `project_treatments.card_designs`, the
  record — never from a template's sections.
- A save that carries no `cards` never writes `card_designs`: `flushPayload` sends the record only while `CARDS_KEY` is
  owed, and `sync_project_doc` writes `project_treatments` only `if p_cards is not null`.
- R-82: Review runs step 108 on production (app.inflozo.com and the production Supabase), never on mocks alone.
- Every word the walk checks is read from `lib/cards.ts` (`CARD_WORDS`) and `lib/translations.ts` (`RAIL_WORDS`);
  every card from the library's `CARDS`. No count is written down.

**Ask First:**
- Question 1 is ruled before Dev starts. Option 2 adds the hand test written below and sets `owner_test: pending`;
  option 3 adds a Theme settings row, which the Record prompt writes into this spec's tasks before Dev.
- Any change to Theme settings' screen beyond the ruled option.

**Never:**
- No pagination row on Theme settings, no reader or writer of `project_treatments.pagination_design_id`, and no
  `partials/pagination.hbs`: all three are Story 10.112's, with A34's designs (R-118).
- No A33 treatment selector on Theme settings: Story 10.110 builds the Treatment dropdown on Editor cards (S14b), which
  Theme settings' rail already reaches.
- No migration, so no Schema phase. No write to T1: nothing a theme carries changes.
- No edit to the design export (R-74).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sections everywhere | `project()`'s templates and `cardDesigns: { callout: { emoji: 'off' }, toggle: { chevron: 'left' } }` | `cards.css` carries Ghost's callout and toggle chunks and their rules; `card_assets` `{ exclude: ['callout', 'toggle'] }`; `default.hbs` links `cards.css` before `screen.css` | N/A |
| No section anywhere (no Post Content section) | the same template keys, each an empty doc; the same `cardDesigns` | `cards.css` byte-equal to the row above, `card_assets` equal, the same link | N/A |
| Control | the empty project with `cardDesigns: {}` | `cards.css` differs from both rows above (the two widths alone); `card_assets` is `true` | proves the check reads the record |
| A section deleted on production | a throwaway project with a stored card record; a Home section deleted, ⌘S | the revision moves by one; `card_designs` byte-equal, read through the service key | a record that changed FAILs the step |
| Back through Theme settings | after a reload, Theme settings → **Editor cards** | Editor cards opens on the last-viewed card, still customised | N/A |
| No A34 design exists | Theme settings opened | no row, label or caption about pagination (R-118) | N/A |

</frozen-after-approval>

## Code Map

- `packages/theme-compiler/src/compile.ts:857-889` -- the cards' emission: `parseCardDesigns(input.cardDesigns)` →
  `excludedChunks` (`package.json`'s `card_assets`), `cardsJs`, `cardsCss`. It reads the record and Ghost's chunks only,
  never `stacksOf(input)` (`:889`, the sections). The FR-Q9 comment goes on the `cards.css` line at `:878`.
- `packages/theme-compiler/src/compile.ts:1069-1072, 1110` -- `cards.css`' link in `default.hbs`'s head and its tree
  entry, both on every theme.
- `packages/theme-compiler/src/compile.test.ts:188` (`build`), `:194` (`project()`), `:1148-1170` -- the 7.5 and 7.13
  rows already build `{}` (no template at all) with card designs. The new row sits after `:1170` and empties
  `project()`'s own keys, so the two compiles differ in sections alone.
- `apps/web/lib/journal.ts:260-272` -- `flushPayload` sends `cards` only while `CARDS_KEY` is pending. Its proof, with a
  control, is `apps/web/journal.test.ts:546`. Read-only here.
- `supabase/migrations/20261016120000_card_designs.sql:69` -- `if p_cards is not null`. `RLS-TEST.sql:2371-2390` proves
  a null `p_cards` leaves `card_designs` byte-equal. Read-only here.
- `apps/web/app/(app)/app/(authed)/projects/[id]/settings/rail.tsx:47-48` -- the rail's **Editor cards** item
  (`canvasPath(projectId, 'cards')`). Read-only under option 1.
- `apps/web/app/(app)/app/(authed)/projects/[id]/settings/theme-settings.tsx` -- Theme settings' page. Read-only under
  option 1.
- `tools/probe/run-verify-editor.cjs:253-262` -- the header's per-story lines; step 108's lines join after 7.13's.
- `tools/probe/run-verify-editor.cjs:9116-9350` -- step 107. Reuse its helpers (`treat107`, `revision107`,
  `designs107`, `editorUrl('cards')`, the CSP `recorder`, `steady`). Step 108 joins after `:9350`, before step 9 at
  `:9352`. `SEED_DOCS`' Home (`:5351`) holds the sections it deletes from.
- Documents moved at this Create: `epics.md` Story 7.14's card, Story 10.112's card and Epic 10's preamble; `prd.md`'s
  file tree (`:616`) and partials paragraph (`:640`); `epic-7-context.md` under "Cards, treatments and share
  destinations".

## Tasks & Acceptance

**Execution:**
- [ ] `packages/theme-compiler/src/compile.ts` -- on the `cards.css` comment at `:878`, add that it ships whatever the
  templates hold, because card styling has no host section (FR-Q9, Story 7.14) -- standing rule 3: the claim lives
  beside the code it governs.
- [ ] `packages/theme-compiler/src/compile.test.ts` -- add `(7.14) FR-Q9: the card designs emit whatever the sections`
  with the matrix's three compile rows: `cards.css`, `card_assets` and `default.hbs`'s link equal across the full and
  the empty project, and the control differing -- the one runnable check of "emission never depends on a host
  section".
- [ ] `tools/probe/run-verify-editor.cjs` -- add step 108, in a context of its own on the seeded project. Store a card
  value through Editor cards and ⌘S. Delete one Home section (Layers ⋯ → Delete) and ⌘S. Read the revision moved by one
  and `card_designs` byte-equal to the record before the delete. Reload, open Theme settings, assert no text matching
  `/paginat/i` on the page (R-118), press the rail's **Editor cards**, and assert the card is selected and customised.
  Hand back with ⌘Z on Home + ⌘S (undo is the journal tail and survives a reload, EXPERIENCE:426) and Reset card: Home's
  doc read back equal to its start, the record empty. Record zero CSP violations. Add the
  header's step-108 lines -- the production proof of the section-removal row (R-82).
- [ ] `packages/library/src/vocabulary.ts:126` -- "a pagination style's override (7.14)" becomes "(10.112)" -- standing
  rule 7: the code comment still names the story this Create moved it from.
- [ ] `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:213` -- after "a treatment whose
  host section is absent is still selected here", add a dated note: *(Story 7.14, 2026-10-16: card styling has no host
  section — Editor cards, from the switcher and Theme settings' rail; the pagination half is Story 10.112's.)* --
  propagate the reading.
- [ ] `_bmad-output/implementation-artifacts/epic-7-context.md` -- add a "Story 7.14's Dev" sub-bullet under Cards,
  treatments and share destinations, saying what was built and held.

**Acceptance Criteria:**
- Given any project, when the user opens Theme settings and presses **Editor cards** in its left menu, then Editor
  cards opens with the last-viewed card selected — **matches the frame** `S14 Editor Cards.dc.html` S14d ("ALSO
  REACHABLE FROM THEME SETTINGS → EDITOR CARDS; BOTH ROUTES LAND ON THE SAME SCREEN WITH THE LAST-VIEWED CARD SELECTED")
  inside `D6 Theme Settings Completed.dc.html` D6a's rail.
- Given a project with no section on any template — no Post Content section among them — when it compiles, then it
  carries the same `cards.css` and `card_assets` as with every section placed: **emission never depends on a host
  section existing** (FR-Q9).
- Given a stored card record on production, when a section is deleted and saved, then the record is byte-equal and
  the card is still customised after a reload: **the selection survives that section's removal** (FR-Q9).
- Given no A34 design exists, when Theme settings opens, then it **draws no pagination row** (R-118). Story 10.112's card
  and Epic 10's preamble carry the pagination half word for word (R-195).
- Given this story adds no control and no route, then `apps/web/busy.test.ts` passes unchanged (R-98).
- Given the work is done, then `pnpm check`, `python3 tools/doc-audit.py --check` and `bash supabase/tests/run-rls-gate.sh`
  pass, and step 108 holds on production with 0 FAIL.

## Spec Change Log

## Design Notes

### Routine calls, one line each (said to the owner, not asked)

1. **The pagination half moves to Story 10.112 now, at this Create.** Every option in Question 1 moves it. Once 7.14 is
   done, nothing else would build the row "from the day [A34's designs] exist".
2. **No A33 treatment selector on Theme settings.** S14d and EXPERIENCE put FR-Q9's card fallback on Editor cards, which
   Theme settings' rail reaches. Story 10.110 builds the Treatment dropdown there.
3. **No new gscan or T1 run.** No byte a theme carries changes. 7.13's §81 is the cards' T1 record, and its
   `check-snapshots` rows are the cards' 0/0 on both pins.
4. **`owner_test: none`**, because nothing on screen changes under option 1. It becomes `pending` if the owner rules
   option 2 or 3.

### Moved at this Create (R-195), word for word, to Story 10.112

From Story 7.14's card, its pagination half: *"the non-placeable treatments — Koenig card styling and pagination
styling — are **selectable there**"*; *"a template with no feed still carries a pagination treatment for when one is
added"*; *"**emission never depends on a host section existing**, and the selection **survives that section's
removal**"*; and *"its pagination half offers A34's designs from the day they exist — Story 10.112 builds the
Pagination style this surface shares (R-195) — and until then draws no pagination row (R-118)"* — with the frame
`D6 Theme Settings Completed.dc.html` D6a. From `prd.md`'s file tree: `partials/pagination.hbs` "only when one is chosen".
Story 10.112's card, Epic 10's preamble and `prd.md` now name 10.112.

### Facts this spec rests on (read in the repository at this Create, 2026-10-16)

- `compileTheme` builds `cards.css` from `parsedCards` and Ghost's chunks before `stacksOf(input)` is read
  (`compile.ts:857-889`), and the 7.5/7.13 rows compile `build({}, { cardDesigns })` with no template.
- `flushPayload`'s `Object.hasOwn(j.pending, CARDS_KEY)` (`journal.ts:272`); `journal.test.ts:546`'s control; the
  migration's `if p_cards is not null` (`:69`); `RLS-TEST.sql`'s (5) block.
- Theme settings' rail carries Editor cards since Story 7.13 (`rail.tsx:47-48`), and walk step 107 checks that it lands on
  the last-viewed card.
- `D6 Theme Settings Completed.dc.html` draws nothing about treatments or pagination. Neither do A33's or A34's
  `- Spec.md` name a Theme Settings selector. A34's only Theme settings link is the posts-per-page "setting door".

## Owner's manual test

**None under Question 1's recommended option**: nothing on screen changes, and step 108 proves the claim on the live
site. If the owner rules **option 2**, these steps are his test, run after Deploy on a laptop at full width, signed in
as himself. **Pilot sections** is `b6d4db35-8e5e-45e1-a70f-4daa28916d51`. Step 6 puts everything back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/settings` | Theme settings | Click **Editor cards** in the left menu. | — | The Editor cards screen, with a card selected. |
| 2 | `…/cards` | Editor cards | Open the **Card** menu, choose **Bookmark**, set **Thumbnail side** to **Left**, press ⌘S. | — | Bookmark shows **customised**, and the template menu shows an amber **1** beside Editor cards. |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | In Layers, open the last section's **⋯** menu, choose **Delete**, press ⌘S. | — | The section is gone from the page. |
| 4 | `…/settings` | Theme settings | Reload the page. Look down the page, then click **Editor cards**. | — | No row about pagination or page links anywhere. Editor cards opens on Bookmark, still customised, picture on the left. |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Press ⌘Z, then ⌘S. | — | The deleted section is back where it was. |
| 6 | `…/cards` | Editor cards | On Bookmark press **Reset to Ghost default**, then **Reset card**. | — | Nothing customised, and no amber number. |

## Questions for the owner

Question 1 is open. Dev waits for it.

### Question 1 — This story's work is already done. What should it add?

**In plain English.**
- This story asks that you can always style your post cards and your page links from Theme settings, even on a project
  where no page holds the section that would normally offer the choice.
- For **cards**, Story 7.13 already made this true. Card styles are kept once for the whole site, not inside any
  section. Theme settings' left menu has **Editor cards**. Every theme carries your card styles whatever its pages hold.
- For **page links**, there is nothing to choose yet. The page-link designs arrive in Story 10.112, so that story builds
  the choice, in Theme settings too.
- So this story has nothing left to build. What is left is proof that it holds, and whether you want to see that
  yourself.

**Example.** You style Bookmark cards to show their picture on the left, then delete every section on your Post page.
Today, already, Bookmark keeps its style, and your theme still carries it. Option 1 has a machine prove this on the
live site and closes the story. Option 2 adds six steps for you to do the same by hand. Option 3 also adds a new line to
Theme settings' page — for example "Post cards · 1 customised · Open Editor cards". No drawing has that line.

1. **Prove it by machine and close the story.** A check of the theme builder and a check on the live site. No new
   screen and no hand test. The story is done once it is deployed. **(RECOMMENDED)**
2. **Prove it by machine, and you test it by hand too.** The same checks, plus the six steps above. You pass them on
   the live site, and then the story is done.
3. **Also add a "Post cards" line to Theme settings' page.** It shows how many cards you customised and links to Editor
   cards. You test it by hand. It is new, extrapolated from Theme settings' other rows. It repeats the left menu's
   Editor cards link.

**Ruled:** _(awaiting the owner)_

## Verification

**Commands (Dev, locally under Node 24):**
- `pnpm check` -- expected: exit 0, the `(7.14)` compile row passing and `busy.test.ts` unchanged.
- The control, by hand once: plant a line in `compileTheme` that drops the card designs when no template holds a
  section -- expected: the `(7.14)` row FAILs, and every earlier row still passes; revert.
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, 7.13's null-`p_cards` block still PASS.
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.

**Review, on the real infrastructure (R-82):**
- `run-verify-editor.cjs` from a clean worktree at the deployed sha, against `https://app.inflozo.com` with
  `SUPABASE_URL`, `SUPABASE_SECRET_KEY` and `SUPABASE_PUBLISHABLE_KEY` read from `tools/probe/.env` by name -- expected:
  step 108 PASS (revision +1, `card_designs` byte-equal, no pagination text, the rail landing on the customised card,
  the record handed back empty, zero CSP violations), 0 FAIL overall, users unchanged.
- Not run: T1. No byte a theme carries changes. 7.13's §81 (MEASUREMENTS) is the cards' T1 record.
