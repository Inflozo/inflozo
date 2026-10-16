---
title: 'Story 7.15 — Share destinations: one ordered, site-wide list'
type: 'feature'
created: '2026-10-16'
status: 'in-review'
baseline_commit: '899886c7fefa904b7e4f9021ceed805d9e36a77c'
owner_test: none
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

You ruled that share buttons on your readers' sites are Ghost's own: one **Share** button under a post opens Ghost's
share popup, and on Ghost 5, which has no popup, the button becomes **Copy link** and **Email**. This story changes the
written requirements to say that, gets Post Headers #14 Share Row redrawn that way, and hands the building to Story
10.82 — the first design that shows sharing — where Theme settings gets two switches for Copy link and Email. Nothing
changes on screen in this story; from Story 10.82 a reader on your site presses Share and sees Ghost's popup.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Before this story, two of the owner's rulings contradicted each other:
- FR-Q10 (R-29, 2026-08-31) and this story's card said: one Inflozo-owned ordered list, plain links, and Portal's share
  page never used.
- The owner's ruling of 2026-09-01 said: "native Ghost Share only, everywhere". It is recorded only in the export's A24,
  A25 and A26 specs.

Question 1 settled it as **option 3**: the 1 September ruling stands, R-29 is reversed, and it is built with Story 10.82.
The written requirements, the code comment and the measurements still say R-29. A24 #14's frame still draws the list.
And no design that offers sharing is built before Story 10.82.

**Approach:** Dev rewrites FR-Q10 to the 1 September ruling and records the reversal. It then hands each rewritten
clause, word for word, to the story that builds it (R-118, R-195):
- **Story 10.82**: the setting, the trigger, the fallback and the redrawn A24 #14;
- **Story 10.23**: `share.js`'s one job;
- every **A25 and A26 story** whose designs offer sharing.

Epic 10's preamble lists them. Dev also writes the Claude Design prompt that redraws A24 #14, which the owner runs before
Story 10.82. Dev edits documents and one code comment; no behaviour changes, there is no migration and no screen. The
story is Done at Deploy.

## Boundaries & Constraints

**Always:**
- **The ruling's own words are the source.**
  - FR-Q10 is rewritten from `A24 Post Headers - Spec.md:1634-1667`, the native-share ruling and "What the redraw
    carries".
  - It is also rewritten from `A26 Post Footers - Spec.md:1638`.
  - Where the ruling leaves a ⚑ (an open interpretation, such as the capability flag), the FR names it and hands it to
    Story 10.82. It does not settle it.
- **A move is word for word, and each moved clause names its story.** The receiving card carries the rewritten sentence
  itself, and Epic 10's preamble lists every clause and its story (R-195), in Story 7.14's form.
- **R-29 is reversed, not erased.** Its text, R-49, MEASUREMENTS §29b and Story 7.15's card each keep what they said
  and gain a dated note. The card's superseded criteria are struck through, not deleted.
- **The export stays as drawn (R-74).** The owner runs the redraw prompt in Claude Design. Where a receiving frame lacks
  a drawn state, the gap is recorded and extrapolated from the nearest drawn one: A25 has no drawn fallback; A26-3 and
  A26-5 still carry stale sub-frames.
- **No count is written down.** Name designs by number; derive any total.
- **Standing rule 7.** Grep live documents and code comments for `R-29`, `D15` (in its share sense), "own share list"
  and "Portal share page is not used". Nothing left may claim the old rule without a dated note.

**Ask First:**
- **These are Story 10.82's questions, not this story's.** Any change to the mechanism the 1 September ruling names:
  - its capability flag, decided at compile or at run time;
  - what a site whose Ghost does not load Portal draws (Design Notes reading 1).
- Any edit that would change behaviour now, such as `PORTAL_PAGE`'s refusal or a compile row. Those are Story 10.82's.

**Never:**
- No migration, Schema phase, Theme settings row, `share.js`, compile change or T1 write.
- No edit to anything Claude Design or a generator owns:
  - the export (R-74);
  - `sections-inventory.md`'s roster lines, which `tools/inventory-gen.py` writes;
  - a `record` document (e.g. `reconcile-designs.md`).
- No storage choice. Story 10.82 makes it, against AD-27 and Story 7.13's precedent.

</frozen-after-approval>

## Code Map

Documents Dev edits (all `live` in `INDEX.md`):
- `_bmad-output/planning-artifacts/epics.md`
  - `:170`: the FR-Q10 line in the FR list.
  - `:531`: the coverage map's `FR-Q10 | E7`.
  - `:3770-3793`: Story 7.15's card. The criteria are at `:3778-3791`; the FRs/Frame/Owner-test line is at `:3793`.
  - `:5753`: Story 10.23, A9 #5–8, which includes #7 Index's copy-link button.
  - `:7340`: Story 10.82, A24 #13–16 and the owner gate, which includes #14 Share Row.
  - `:7379`, `:7409`, `:7431`: Stories 10.83, 10.84 and 10.85 (A25).
  - `:7470`, `:7494`, `:7516`, `:7538`: Stories 10.86, 10.87, 10.88 and 10.89 (A26).
  - Epic 10's preamble ends with 7.14's block at `:5147-5160`, just before `### A4 · Heroes` at `:5161`.
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md`
  - `:387`: FR-Q10.
  - `:941`: Appendix B's Portal paragraph. It says "`share` … Inflozo does not use it (ruling R-29)" and "sharing is
    FR-Q10's own list".
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md`
  - `:795-806`: R-29.
  - `:183`: R-29's landing row.
  - `:1015`: R-49, "four stands until the native-share redraw".
  - The last ruling is R-243 at `:5298`. The new entry goes after it.
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/`
  - `MEASUREMENTS.md:2315-2327`: §29b, "D15 held" and "opens the **sign-in** modal".
  - `VERIFY-AT-BUILD.md:285`: family 31, "D15 held unchanged". Its numbered register ends at item 60 (`:310`).
  - `ARCHITECTURE-SPINE.md:337`: AD-27 names "the share destinations" among the states that need a home.
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-section-js-libraries.md`
  - `:173`: the `share` row, "`navigator.share()` where present".
  - `:102`: its "Declared by" list, inherited from the tool's misreads.
- `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:174`: the Theme Settings IA row.
- `_bmad-output/implementation-artifacts/epic-7-context.md:336-337`: "Cards, treatments and share destinations".
- `_bmad-output/implementation-artifacts/deferred-work.md`: the last row is DW-358.

Code comments Dev edits (comment only):
- `packages/library/src/vocabulary.ts:346-351`: `PORTAL_PAGE`'s doc comment, "D15 rules `share` out". The refusal itself
  stays: the trigger is `href="#/share"`, not a `data-portal` value.
- `tools/verify-design-pass.py:246-259`: `c_share_link`'s docstring, "why R-29 kept our own share list". The check is
  unchanged.

Read-only evidence:
- **The ruling.**
  - `A24 Post Headers - Spec.md:1634-1667`: what it means, what it supersedes, and what the redraw carries.
  - `A26 Post Footers - Spec.md:1351`, `:1589`: the same-day reversal.
  - `A26 Post Footers - Spec.md:1638`: native-share patch notes.
  - `A25 Post Content Layouts - Spec.md:38-41`, `:1371-1398`: A25's designs, with the Ghost 5 fallback ruled and not
    drawn.
- **Frames.**
  - `A24-14 Share Row.dc.html`: still the list; its dated panel says the redraw is outstanding (`:307-310`).
  - `A26-9 Share Row.dc.html:171-174`: four states — trigger, older Ghost (Email · Copy link), copied, and no JavaScript
    (Email alone).
  - `A26-3 Card.dc.html:87` and `A26-5 Split.dc.html:95`: stale pre-ruling rows.
  - `A25-9 Share Rail.dc.html:23`: `<a href="#/share">`.
  - `D6 Theme Settings Completed.dc.html` D6a's Credits row: the drawn toggle row the two switches extrapolate from.
- **The site's version is already stored.** `sites.ghost_version` (`supabase/migrations/20260904120000_complete_schema.sql:151`),
  read as a major through `versionVerdict` (`apps/web/lib/live-content.ts:602`).
- **Prepared, unused.**
  - `packages/library/modules/registry.json`: the `share` row.
  - `packages/library/modules/` holds `core.js` only.
  - `packages/library/strings/catalog.json:36-39`: `post.share` "Share", `post.share_on`, `post.copy_link`,
    `post.link_copied`. There is no "Email" key.
- **No share design is built.** `packages/library/designs/` holds a1/1, a4/13, a17/1, a22/1 and a24/1.
- **The tool misreads `share`.** `tools/derive-module-reach.py:154` lists A10-9 and A10-12 under `share`, both false
  hits. It misses A9-7, because it keeps only the text before "JS off".

## Tasks & Acceptance

**Execution:**
- [x] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` -- the PRD decides behaviour, so the ruling
  lands here first.
  - **FR-Q10.** Replace it with Design Notes' rewritten text. Add a dated italic note naming Question 1's ruling, the
    reversal of R-29, and the new ruling entry.
  - **Appendix B (`:941`).** Add a dated note: share designs open Ghost's share page with `href="#/share"` (Ghost's own
    form — Casper and Source 6.58.0, `post.hbs:60` / `:44`) wherever the site's Ghost has one. `share` is still not a
    Link Picker destination, and `data-portal="share"` stays refused.
- [x] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` -- this file is
  where rulings are reconciled.
  - **A new ruling, numbered after the last one in the file.** It records:
    - "Sharing is Ghost's own share panel; R-29 is reversed" — Question 1's ruling, quoting the 1 September words and
      R-29's;
    - why: the owner's later ruling, and the export already drawn to it;
    - what it binds: Design Notes' rewritten FR-Q10;
    - what it gives up: styling, order, Mastodon, and the trigger without JavaScript;
    - its Targets ledger: ✅ for what Dev lands, ⬜ for each receiving story and the redraw.
  - **Dated notes.**
    - On R-29 (`:795`) and its landing row (`:183`): reversed by the new ruling.
    - On R-49 (`:1015`): the redraw now happens before Story 10.82, so the four-maximum has no subject after it.
- [x] `_bmad-output/planning-artifacts/epics.md` -- R-195's word-for-word moves, and R-118, because no share design
  exists before 10.82.
  - **The FR list (`:170`).** Rewrite the line to the new FR-Q10.
  - **Story 7.15's card.**
    - Strike through the superseded criteria and keep them legible.
    - Add a dated italic note: the ruling, the rewrite, and where each clause went.
    - Change the last line to `**FRs:** FR-Q10. · **Frame:** none here — built with Story 10.82. · **Owner test:** none (Question 1, option 3).`
  - **Story 10.82's card.** Add the rewritten criteria as Given/When/Then, word for word from FR-Q10, introduced as
    "*(moved from Story 7.15 by its Question 1, option 3 (owner, 2026-10-16), word for word — R-118, R-195)*". Also:
    - A24 #14 is built to its redrawn frame, which the owner draws from this spec's prompt before the story opens;
    - the Theme settings **Sharing** block (two switches, Copy link and Email) is extrapolated from
      `D6 Theme Settings Completed.dc.html` D6a's Credits row (R-74) and **matches the frame**;
    - the owner's hand test covers the trigger on his Ghost 6 site and both switches;
    - a "handed over at Story 7.15's Create" line listing Design Notes' readings.
  - **Story 10.23's card.** Add the copy-link clause: `share.js` is first authored for A9 #7.
  - **Stories 10.83–10.89.** Each story named in Design Notes' table gets one line naming its own share designs:
    - each draws Ghost's trigger as its frame does, and the fallback pair where the site's Ghost has no share panel;
    - A25's stories extrapolate the fallback from A26 #9's drawn state;
    - A26's stories do not follow `A26-3` `:87` or `A26-5` `:95`.
  - **Epic 10's preamble.** Add a "Given owners by Story 7.15's Create" numbered list after 7.14's block, in the same
    form.
  - **The coverage map.** Change `FR-Q10 | E7` to `FR-Q10 | **E10** (Story 10.82 and the share designs, from 7.15)`.
- [x] `_bmad-output/implementation-artifacts/spec-7-15-share-destinations-one-ordered-site-wide-list.md` -- the
  redrawn frame must exist before Story 10.82 can match it (R-74), and the owner runs it.
  - Add `## Claude Design prompt — A24 #14 Share Row, the native-share redraw` after `## Questions for the owner`.
  - The prompt names the export's own files (`A24-14 Share Row.dc.html`, `A24 Post Headers - Spec.md`,
    `Calibration Set.dc.html`, `Editor Sidebar Kit.dc.html`).
  - It asks for exactly "What the redraw carries" (`A24 spec:1663-1667`), A26 #9's four states as the pattern, and no
    design total.
  - It carries the zero-width-entity warning for literal Handlebars.
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md` -- the facts
  stand; their consequence changed. On §29b, add a dated note:
  - "D15 held" is reversed by the new ruling;
  - Portal 2.51.5 opens its *default* page — sign-in, sign-up or the account page (`App.js:915`, `:927-931`) — and a
    bare `#/share` does nothing;
  - Ghost 6.58.0's own themes use `href="#/share"`;
  - Ghost 6.58.0 loads Portal only while members, donations or recommendations are on (`ghost_head.js:121-125`).
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/VERIFY-AT-BUILD.md` -- standing
  rule 1: the flag rests on facts not yet executed.
  - On family 31 (`:285`), add a dated note.
  - Add the next numbered item: "which Ghost version first pins a Portal with the share page, and when Portal is not
    loaded". Owner: Story 10.82, recorded on T1.
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` — on AD-27's
  `:337` rule, add a dated note: "the share destinations" are now the fallback pair, stored by Story 10.82 -- propagate.
- [x] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-section-js-libraries.md` — on `:173`, add a
  dated note: `share` copies a link and nothing else, there is no `navigator.share()`, and the trigger is Portal's. On
  `:102`, point at the DW row -- propagate.
- [x] `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` — on `:174`'s Theme Settings row,
  add a dated note that the sharing fallback switches arrive with Story 10.82 -- propagate.
- [x] `packages/library/src/vocabulary.ts` — on `:351`, replace "D15 rules `share` out" with a dated reason. The
  refusal stays because `data-portal="share"` opens Portal's default page on Ghost 5, and share designs use
  `href="#/share"` (Story 10.82) -- standing rule 3.
- [x] `tools/verify-design-pass.py` — in `c_share_link`'s docstring, add a dated line that the new ruling reversed R-29
  -- standing rule 7.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- standing rule 3. Add two DW rows:
  - `tools/derive-module-reach.py`'s `share` misreads (A10-9, A10-12, A9-7) and research `:102`. Owner: Story 10.23's
    Create.
  - The A24 #14 redraw, run by the owner from this spec's prompt. Owner: Story 10.82's Create, which does not plan
    against the old frame.
- [x] `_bmad-output/implementation-artifacts/epic-7-context.md` — add a "Story 7.15's Dev" sub-bullet under Cards,
  treatments and share destinations.
- [x] Standing rule 7 — grep live documents and code comments for `R-29`, `D15` (share sense), "own share list",
  "Portal share page is not used" and "ordered, site-wide list". Every hit is dated or rewritten.

**Acceptance Criteria:**
- Given Question 1 ruled option 3, when Dev ends, then FR-Q10 reads as Design Notes' rewritten text. The PRD and the
  decisions file both name the reversal of R-29, and R-29, R-49 and §29b keep their words with dated notes.
- Given the rewritten FR-Q10, when Dev ends, then each clause sits word for word in every story Design Notes' table
  names, and is listed in Epic 10's preamble. A grep for each clause's bolded phrase finds it there.
- Given the surface moved, when Story 10.82's card is read, then it names its frames:
  - A24 #14, redrawn from this spec's prompt;
  - `D6 Theme Settings Completed.dc.html` D6a's Credits row, extrapolated for the two switches (R-74).

  It carries a **"matches the frame"** criterion and the owner's hand test (R-80).
- Given the owner must redraw A24 #14, when he opens this spec, then `## Claude Design prompt — A24 #14 Share Row, the
  native-share redraw` is ready to paste, and a DW row names Story 10.82's Create as the owner.
- Given this story changes no behaviour, when its diff is read, then only documents, the two comments, `sprint-status.yaml`
  and the generated board change. No export path changes. `pnpm check` passes with `busy.test.ts` untouched (R-98).
- Given the work is done, when the gate and CI run, then `python3 tools/doc-audit.py --check` passes, and CI's `check`,
  `rls` and `deploy` are green on the Dev head with the production deployment READY.

### Review Findings

Review, 2026-10-16: five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier). 0 decision-needed, 21 patches (all applied), 1 deferred, 13 dismissed. No question for the owner: every open
reading is Story 10.82's to put to him (the frozen Ask First).

- [x] [Review][Patch] FR-Q10 said that on Ghost 5 "the link would open Portal's default page instead". Read in Portal
  2.51.5's source (`src/App.js:502-555`), a bare `#/share` matches none of its links and returns nothing, so the trigger
  does nothing there; the default page is what `data-portal="share"` and `#/portal/share` open. Corrected word for word in
  every copy, and the redraw prompt now has Claude Design correct the frame's "same link opens the sign-in box"
  [_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md:391]
- [x] [Review][Patch] Appendix B's and VERIFY-AT-BUILD family 31's dated notes left "opens the sign-in modal on every Ghost
  5 site" uncorrected; each note now states the source reading [_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/VERIFY-AT-BUILD.md:285]
- [x] [Review][Patch] FR-Q10's body named the flag's source (`sites.ghost_version`) with nothing marking it open; it now
  carries the ruling's ⚑, as its own note already said [_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md:391]
- [x] [Review][Patch] Epic 7 still claimed FR-Q10 in its FRs-covered line and summary rows (`epics.md`, `prd.md` §8), and
  Epic 10 did not list it; both moved, with a dated note [_bmad-output/planning-artifacts/epics.md:415]
- [x] [Review][Patch] D15 was not marked reversed in `CONTROL-PROMPTS.html`, the D-numbers' home, and the catalogue brief
  listed the reversed ones without it [_bmad-output/planning-artifacts/CONTROL-PROMPTS.html:5101]
- [x] [Review][Patch] Research §7's `share` row promises its rewrite to Stories 10.23 and 10.82, and neither card said so
  (R-195); both do now [_bmad-output/planning-artifacts/epics.md:5812]
- [x] [Review][Patch] Stories 10.23 and 10.83–10.89 carry FR-Q10 criteria, but their FRs lines did not list it
  [_bmad-output/planning-artifacts/epics.md:5815]
- [x] [Review][Patch] No A25 design declares `share` in the export (drawn with the trigger alone), yet each draws the
  fallback, whose Copy link is the `share` module's only job. Stories 10.83–10.85, the preamble's clause 5, the clause
  table and research row 21 now say they declare it [_bmad-output/planning-artifacts/epics.md:7490]
- [x] [Review][Patch] The FR list and `epic-7-context.md` summarised "both off" as no share affordance at all; FR-Q10 says
  the fallback draws nothing, and the trigger is not governed by the switches [_bmad-output/planning-artifacts/epics.md:170]
- [x] [Review][Patch] Reading 3 left two things unasked: whether the Email switch governs the JavaScript-off Email link,
  and what reveals the trigger once a script runs, since `core` sets `js-enabled` only where it mounts a module (FR-G7(4))
  [_bmad-output/planning-artifacts/epics.md:7451]
- [x] [Review][Patch] The hand test asked for both switches on the owner's Ghost 6 site, which never draws the fallback, and
  T3 is retired (R-238); reading 7 hands the route to 10.82's Create [_bmad-output/planning-artifacts/epics.md:7437]
- [x] [Review][Patch] Reading 1 did not ask how a compile-time flag follows a site whose Ghost changes after a deploy,
  nor say the generator meta carries major and minor only (T1: `Ghost 6.58`)
  [_bmad-output/planning-artifacts/epics.md:7445]
- [x] [Review][Patch] Reading 2 did not cover a connected site whose `ghost_version` is empty (the column is nullable)
  [_bmad-output/planning-artifacts/epics.md:7447]
- [x] [Review][Patch] Nothing asked what the trigger does on the editor canvas, where Portal is a shim; reading 8
  [_bmad-output/planning-artifacts/epics.md:7460]
- [x] [Review][Patch] Story 10.82's first criterion gated on the panel's free text alone; it now asks for every item the
  prompt's "WHAT THE REDRAW CARRIES" lists [_bmad-output/planning-artifacts/epics.md:7390]
- [x] [Review][Patch] The prompt file's landing steps marked it `record` before writing the date into it; reordered
  [_bmad-output/planning-artifacts/design/claude-design-prompt-a24-14-share-redraw.md:6]
- [x] [Review][Patch] The prompt named A26 #9's section "THE TWO SHARE STATES" and asked for four, gave the fallback's
  order two ways, and item 5's "saying which" had no referent; each clarified from A26 #9's frame, both copies still
  identical [this spec, Claude Design prompt]
- [x] [Review][Patch] Dev results predate the second Dev commit (`a20e9fa0`), and AC5's file list is exceeded by
  `tools/doc-audit.py`'s catalogue row, the new prompt file and three generated pages; recorded below, and R-244's
  Targets gained the prompt file [this spec, Verification]
- [x] [Review][Patch] Counts written down: DW-359's "A26's twelve share designs" and the context's "six readings"
  [_bmad-output/implementation-artifacts/deferred-work.md:9769]
- [x] [Review][Patch] R-244 said "Only A24 #14 still draws the list", leaving out the stale sub-frames at `A26-3:87` and
  `A26-5:95` [_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md:5325]
- [x] [Review][Patch] R-29's ledger rows kept open ⬜ boxes for a reversed ruling; each now points at R-244's Targets
  [_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md:104]
- [x] [Review][Defer] `VERIFY-AT-BUILD.md` uses item numbers 59 and 60 twice each [_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/VERIFY-AT-BUILD.md:249] — deferred, pre-existing (DW-361)

Dismissed: R-74's "drawn in the same project" for the Sharing block and A25's fallback (the frozen Boundaries extrapolate
both, in R-242's shape); the stale `A26-3`/`A26-5` rows having no owner (each A26 story's criterion names them); the two
prompt copies drifting (checked identical after this review's edits; a gate for a one-off prompt is more machinery than
the risk); ⚑ and items 4/5 in the prompt (⚑ is Claude Design's own mark, and both items are the ruling's words); "T1 and
T3" on 10.82's FRs line (R-238 reads every such card as T1); counts in the Dev results (a dated run's output) and the
clause check's missing control (run below, with one); MEASUREMENTS holding read-in-source readings (labelled, as §37
is); old wording kept beside dated notes (R-29 is reversed, not erased); Story 7.15's title and user statement (the board
reads the title, and the statement still holds); "panel / page / popup" (Portal's own word is page; the strings are
reading 5's); catalog and accessibility details (reading 5 and research §3.1's `aria-live` rule); the A25/A26 lines
quoting fragments (the clause table assigns exactly those); `DESIGN-PATCH-PROMPTS-2.html`'s "site-wide share list" (a RAN
page, generated, historical).

## Spec Change Log

Review, 2026-10-16 — Design Notes amended where a review finding showed its text wrong or incomplete (none changes what
Question 1 decided):
- FR-Q10's Ghost 5 sentence: a bare `#/share` does nothing on Portal 2.51, read in its source; the flag clause carries ⚑.
- The clause table: Stories 10.83–10.85 receive the Copy link clause, because their designs declare `share` for it.
- "Handed to Story 10.82's Create": readings 1–3 gained a question each, and readings 7 and 8 are new.

## Design Notes

### The ruling, and routine calls made with it (said to the owner, not asked)

1. **Question 1 ruled option 3 (owner, 2026-10-16).** The 1 September native-share ruling stands; R-29 is reversed.
2. **Story 10.82 is still the first story to build sharing.** A24 #14 is the first share design in `sprint-status.yaml`
   order. A9 #7 (Story 10.23) uses the `share` module for copy-link only.
3. **The two switches live in Theme settings**, FR-Q10's surface. They are extrapolated from D6a's Credits toggle row,
   without a Claude Design pass for D6 (R-242's shape). Only A24 #14 is redrawn, because the ruling names it.
4. **`data-portal="share"` stays refused.** Ghost's own themes use `href="#/share"`. The refusal guards the Ghost 5
   case, where the value opens Portal's default page.
5. **`owner_test: none`**, because nothing on screen changes in this story. The hand test is Story 10.82's.

### FR-Q10, rewritten (Dev pastes this into `prd.md:387`)

> **FR-Q10** **Sharing is Ghost's own share panel, and Inflozo's one site-wide share setting is its fallback** *(the
> owner's native-share ruling of 2026-09-01, confirmed as Story 7.15's Question 1, option 3, 2026-10-16 — it reverses
> R-29)*.
>
> Every design that offers sharing draws **a label and one Share trigger** — a link to `#/share`, the form Ghost's own
> themes use — which opens **Ghost's own share panel**. The panel owns the destinations and their order.
>
> **Where the site's Ghost has no share panel, the trigger is replaced by Copy link and Email**, two links in the same
> row. Ghost 5's Portal has no share page, and a bare `#/share` matches none of its links, so there the trigger would
> do nothing. A theme cannot ask Ghost which version it runs, so **which of the two a site draws comes from a
> capability flag the app sets from the connected site's Ghost** (`sites.ghost_version`) ⚑.
>
> The project declares **one** sharing setting: **two switches, Copy link and Email — the fallback pair only**. It is
> **stored once on the project, never per section** — a per-section setting is how two share rows on one site end up
> disagreeing. With both switches off, the fallback renders **no share affordance at all**, rather than an empty
> container.
>
> **Email is a real `mailto:` link built at compile from the post's own canonical URL and title.** **Copy link is the
> one destination needing Inflozo's script, and it is the `share` module's only job.** The trigger needs none of
> Inflozo's, because Portal opens the panel.
>
> **With JavaScript off, the block draws Email alone** (A26 #9's drawn state).
>
> Ghost's panel is a shadow-DOM iframe a theme cannot style, with a fixed order (X · Facebook · LinkedIn · Threads ·
> Bluesky) and no Mastodon. That is the cost this ruling accepts (`MEASUREMENTS.md` §29b).

### Where each clause goes (the one table a later ruling changes)

| Rewritten FR-Q10 clause | Receiving stories |
|---|---|
| "**a label and one Share trigger** … which opens **Ghost's own share panel**" | 10.82 (A24 #14, redrawn) · 10.83 (A25 #3, #4) · 10.84 (A25 #1, #7, #8) · 10.85 (A25 #9) · 10.86 (A26 #1, #3, #4, #6) · 10.87 (A26 #2, #5) · 10.88 (A26 #9, #10, #11) · 10.89 (A26 #13, #14, #15) |
| "**Where the site's Ghost has no share panel, the trigger is replaced by Copy link and Email**" … "**capability flag**" | 10.82 (builds the flag) · each A25/A26 story above (draws the fallback; A25's is extrapolated from A26 #9) |
| "**two switches, Copy link and Email — the fallback pair only**" · "**stored once on the project, never per section**" · "renders **no share affordance at all**" | 10.82 · each A25/A26 story above (both off: no fallback drawn) |
| "**Email is a real `mailto:` link built at compile from the post's own canonical URL and title**" | 10.82 |
| "**Copy link is the one destination needing Inflozo's script, and it is the `share` module's only job**" | 10.23 (first `share.js`, for A9 #7) · 10.82 · 10.83, 10.84, 10.85 (A25's designs declare `share` for the fallback's Copy link — added at Review) |
| "**With JavaScript off, the block draws Email alone**" | 10.82 · each A25/A26 story above |
| Frames: A24 #14 redrawn · D6a's Credits row for the two switches · Owner test: yes | 10.82 |

### Handed to Story 10.82's Create (its readings, not this story's)

1. **Where the trigger actually works.**
   - Portal 2.69's share page is in Ghost 6.58.0, and Portal 2.51 (Ghost 5.130.6) has none. Which Ghost version first
     pins a Portal with the page is not yet read.
   - Ghost 6.58.0 loads Portal only while members, donations or recommendations are on (`ghost_head.js:121-125`). On a
     Ghost 6 site with all three off, the trigger opens nothing.
   - `{{ghost_head}}` also prints `<meta name="generator" content="Ghost …">` (`:415`), which a script can read — major
     and minor only: T1 printed `Ghost 6.58` at Review. So the
     flag could be a compile-time read of `sites.ghost_version` (the ruling's ⚑ reading) or a run-time check in
     `share.js`. A run-time check would widen "copy-link … the module's only job". That choice is an R-83 question for
     the owner.
   - So is how a compile-time flag follows a site whose Ghost, or the Portal it floats to, changes after a deploy
     *(added at Review)*.
2. **A project with no connected site.** The canvas and Story 7.26's theme ZIP export have no `ghost_version` to read,
   and nor has a connected site whose `ghost_version` is empty or unreadable (the column is nullable text) *(added at
   Review)*.
3. **The JavaScript-off state.** The block shows Email alone. That means the trigger and Copy link hide without a
   script. Whether Email also shows beside the trigger with JavaScript on (A26 #9's first state draws the trigger alone)
   is not settled.
   - *(Added at Review.)* Nor is whether the Email switch governs that JavaScript-off Email link, or what reveals the
     trigger once a script runs: `core` sets `js-enabled` only on an element whose module it mounts (FR-G7(4)), and
     the trigger declares none.
4. **Email's URL.** `mailto:?subject=…&body=…` from the title, and from `canonical_url` when set or else
   `{{url absolute="true"}}`, each through `{{encode}}`.
   - It must be guarded, because `encode.js:9-11` encodes Handlebars' options object when its argument is empty.
   - The href must be double-quoted.
   - Execute on T1 first (standing rule 1).
5. **Catalog strings.** `post.share` "Share" exists. "Email" has no key. `post.share_on` "Share on {network}" has no
   subject now that Ghost's panel names the destinations.
6. **The editor panel.** Every A26 panel draws a greyed "Share destinations" row with its reason. A24 #14's redraw
   carries the same row.
7. **The fallback's hand test** *(added at Review)*. T1 is Ghost 6.58.0 and T3 is retired (R-238), so how the owner
   sees the fallback and both switches on a real site — a forced flag, a Ghost 5 server spun up for it, or DW-326's
   end-of-project pass — is an R-83 question at 10.82's Create.
8. **The canvas** *(added at Review)*. What the trigger draws and does on the editor canvas and in Preview, where Portal
   is a shim, and NFR-6(c3)'s exclusion for Ghost's panel.

### Facts this spec rests on (read at this Create, 2026-10-16)

- **The ruling.**
  - `A24 Post Headers - Spec.md:1634-1667`; `A26 Post Footers - Spec.md:1351`, `:1589`, `:1638`.
  - R-49 (`reconcile-designs-decisions.md:1015`) and `tools/design-patch-prompts-4.py:173-176` treated it as live.
  - R-29 (`:795-806`), FR-Q10 and this card said the opposite.
- **Portal, read in source** from each package's `umd/portal.min.js.map`. @tryghost/portal 2.51.5 and 2.69.339 are the
  latest patches of `defaults.json`'s `~2.51` and `~2.69`.
  - **2.51 on Ghost 5:** no `share` branch (`App.js:808-916`), so it falls to `default` (`:915`), which becomes sign-in,
    sign-up or account (`:927-931`). A bare `#/share` matches nothing (`:507`, `:1021`).
  - **2.69 on Ghost 6:** opens its share page on `#/share` (`app.jsx:662, 710-714`). It builds X · Facebook · LinkedIn ·
    Threads · Bluesky and email from `link[rel=canonical]` (`use-share-data.js:15-42, 52`).
- **ghost@6.58.0.**
  - `content/themes/casper/post.hbs:60` and `source/post.hbs:44` write `<a href="#/share">`.
  - `core/frontend/helpers/ghost_head.js:121-125`: Portal skipped while members, donations and recommendations are all
    off.
  - `ghost_head.js:415`: the generator meta.
- **Both Ghost majors.**
  - `helpers/encode.js:9-11` is the same in both.
  - `helpers/url.js:15-19` gives the permalink, never `canonical_url`.
  - `meta/canonical-url.js:5-9`: the post's `canonical_url` wins in the head.
- **Not executed on T1.** Recording them is Story 10.82's, via the new VERIFY-AT-BUILD item.

## Verification

**Commands (Dev):**
- `python3 tools/doc-audit.py --check`, run twice -- expected: PASS.
- `pnpm check` -- expected: exit 0. The `vocabulary.ts` edit is a comment, and every package's run prints its own count.
- `python3 tools/verify-design-pass.py` -- expected: the same verdicts as before the docstring edit.
- `git diff --stat <Create head>..HEAD` -- expected: documents, `vocabulary.ts`, `verify-design-pass.py`,
  `sprint-status.yaml` and the board only. No export path, and no `supabase/` or `apps/` path.
- Grep `epics.md` for each bolded phrase in Design Notes' table -- expected: each is found in every story the table
  names, and in Epic 10's preamble.
- Grep live documents and comments for `R-29`, "own share list" and "Portal share page is not used" -- expected: every
  hit carries the dated reversal.

**Dev results (2026-10-16, Node 24.18.1, at baseline `899886c7` plus this diff):**
- `python3 tools/doc-audit.py --check`, twice -- PASS (0 warnings) both times. An earlier run regenerated
  `STORY-BOARD.html` and `CATEGORY-PROMPTS.html`.
- `pnpm check` -- exit 0. library 275/275, ghost-shim 47/47, section-runtime 384/384, apps/web 774/774, theme-compiler
  210/210, the render-matrix case suite 13/13, `check-snapshots: PASS` and `derive-module-reach.py --check` passing (each
  count is the run's own). `busy.test.ts` is untouched.
- `python3 tools/verify-design-pass.py` -- exit 0, "every structural check passes". Its output is byte-identical (`cmp`)
  to the baseline copy of the script run against the same tree.
- `git diff --name-only 899886c7` -- documents, `vocabulary.ts` (comment), `verify-design-pass.py` (docstring),
  `sprint-status.yaml` and two generated pages. No export, `supabase/` or `apps/` path. The second generated page is
  `CATEGORY-PROMPTS.html`, which `tools/category-prompts.py` builds from research §7: §7's `share` row gained its dated
  note, so every category prompt carries it.
- The clause grep -- a script checked every bolded phrase in Design Notes' table against each story it names (10.82,
  10.23, 10.83–10.89) and against Epic 10's new preamble list. All were found.
- The standing-rule-7 grep -- every live hit for `R-29`, "own share list", "Portal share page is not used" and
  "ordered, site-wide list" carries the dated reversal, either on its line or in the note that follows its heading. Three
  kinds of hit are left as they are: Story 7.15's own card title and sprint key, which the board reads; another story's
  finished spec (`spec-7-6-ghost-correct-markup.md:443`); and historical text that names R-29 or D15 without claiming
  it holds (`record` documents, the party memlog, `design-patch-prompts-2.py`, INDEX row 108's `doc-audit.py` string).
- Two calls made at Dev:
  - **VERIFY-AT-BUILD's new item is 62.** The Code Map's "ends at item 60" was wrong: 61 exists, and 59 and 60 are each
    used twice.
  - **More dated notes than the Code Map named.** They went on FR-G4's and FR-G7's share clauses, research §7, item 51,
    R-10 #1, §B's D15 line, and `HANDOVER.md` / `build-sequence.md`. `HANDOVER.md`'s "Nothing is owed to Claude Design"
    gained the A24 #14 exception.
- The MEASUREMENTS §29b readings were re-read at Dev from the npm tarballs (ghost@6.58.0, @tryghost/portal@2.51.5). The
  line numbers matched.
- **Real services hit in Dev: none.** No Supabase, Vercel, Resend, Dodo or T1 call was made, and none was needed,
  because this phase changes documents and two comments. CI and the deployment on the Dev head are Review's, below.

**Review, on the real infrastructure (R-82).** A documents-only story still ships through CI.
- GitHub Actions on the Dev head, read with `GITHUB_TOKEN` -- expected: `check`, `rls` and `deploy` success.
- Vercel, read with `VERCEL_TOKEN` and `VERCEL_TEAM_ID` -- expected: the deployment at that sha READY and served by
  app.inflozo.com.
- Not run: T1 and Supabase. Nothing a theme carries or the database holds changes; the T1 facts are Story 10.82's.

**Review results (2026-10-16), on the real infrastructure.** Keys read only into each command's environment, by name
(`GITHUB_TOKEN`; `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`); no value printed. No write to any service.
- **GitHub Actions on the Dev head `a20e9fa0`** (`actions/runs?head_sha=…`): CI run `38921260476` — `rls`, `check` and
  `deploy` success, conclusion `success`; the render matrix run `38921260538` success. The first Dev commit `c0583492`
  is green too (run `38913722969`). Control: an all-zero sha returns `total_count=0`.
- **Vercel:** `a20e9fa0` → `dpl_8xhxVbWAifLf7KVDnVfvbTPeCJmf`, `READY`, target production; `/v4/aliases/app.inflozo.com`
  and `inflozo.com` both point at it. Control: before `deploy` finished, both aliases read `c0583492`'s
  `dpl_JCP7S8xeeu1NbHfuivyvBB381SWn` and `a20e9fa0` had no deployment, so the alias read was seen to change. Live:
  `app.inflozo.com/` 307 (signed out), `/sign-in` 200, `inflozo.com/` 200.
- **R-99:** the diff holds no migration and no `supabase/` or `apps/` path, so there is no schema to compare; no hosted
  database read was made.
- **T1, one public read** (`curl https://ghost6.inflozo.com/`): 200, `<meta name="generator" content="Ghost 6.58">` and
  Portal from `cdn.jsdelivr.net/ghost/portal@~2.69/umd/portal.min.js`. The generator meta carries major and minor only,
  handed to Story 10.82's reading 1.
- **Standing rule 1, re-read from fresh npm tarballs** (ghost@6.58.0, ghost@5.130.6's `defaults.json`, @tryghost/portal
  2.51.5 and 2.69.339): Casper `post.hbs:60` and Source `post.hbs:44` write `href="#/share"`; `ghost_head.js:121-125` and
  `:415`; `encode.js:9-11`; Portal 2.51.5 `App.js:915`, `:927-931`, `:507`, `:1021`; Portal 2.69 `app.jsx:662`,
  `:710-714` and `use-share-data.js:20-34`, `:52`; 2.51.5 and 2.69.339 the latest patches of `~2.51` and `~2.69` — each
  held. Control: the same reading finds the share page in 2.69.339 and no `share` line at all in 2.51.5. **And one claim
  failed:** FR-Q10's "the link would open Portal's default page" — `App.js:502-555` returns nothing for a bare `#/share`;
  corrected (Review Findings).
- **The diff's scope against AC5.** Beyond "documents, the two comments, `sprint-status.yaml` and the generated board",
  the second Dev commit `a20e9fa0` added `design/claude-design-prompt-a24-14-share-redraw.md` and its catalogue row in
  `tools/doc-audit.py` (data, the gate requires a row for every new document), and the gate regenerated `INDEX.md`,
  `INDEX.html` and `CATEGORY-PROMPTS.html`; Review adds a second `tools/doc-audit.py` brief edit (D15). No behaviour, no
  export path, no `supabase/` or `apps/` path. The Dev results line above predates `a20e9fa0`.
- **Checks run at Review:** `python3 tools/verify-design-pass.py` exit 0, "every structural check passes"; the clause grep
  re-run as a script over every story the clause table names and Epic 10's preamble — all found, and its control (a phrase
  that is in no card) missed in both; every FRs line of 10.23 and 10.82–10.89 carries FR-Q10; the two prompt copies
  compared block for block, identical; `python3 tools/doc-audit.py --check` twice. `pnpm check` was not re-run: Review
  changed no package code, and CI's `check` runs it on the Review push.

## Owner's manual test

**None — Question 1 ruled option 3 (owner, 2026-10-16).** Nothing on screen changes in this story. Your test of the
Share button and the two switches is Story 10.82's. Before that story opens, run this spec's Claude Design prompt to
redraw Post Headers #14 (Dev writes it).

## Questions for the owner

### Question 1 — How should share links work, and when are they built?

**In plain English.**
- **Two of your rulings disagree about share links on your readers' sites.**
  - **31 August** (R-29, the requirements and this story's card): Inflozo makes its own share links. You set **one list**
    once in Theme settings: which places are on, out of X, Facebook, LinkedIn, Bluesky, Mastodon, Threads, WhatsApp,
    Reddit, Email and Copy link, and in what order. Every design that shows sharing uses that list.
  - **1 September**, while the designs were being drawn: "native Ghost Share only, everywhere". One **Share** button
    opens Ghost's own share popup. On Ghost 5, which has no such popup, the button becomes **Copy link** and **Email**.
  - The requirements were never changed to match. Post Headers #14 is drawn the 31 August way. Post Content's and Post
    Footers' share designs are drawn the 1 September way.
- **No design in your library shows share links yet.** The first is Post Headers #14 Share Row, in Story 10.82. Your
  rule R-118 says a control arrives with the story that makes it work. You applied it this week to card treatments
  (7.13) and page-link styles (7.14).

**Example.** A reader finishes a post on your Ghost 6 site.
- **The 31 August way.** Under the title they see your row, "Bluesky · Mastodon · Email · Copy link", in your fonts and
  your order. Every link except Copy link works even with JavaScript off. A Ghost 5 site shows the same row.
- **The 1 September way.** They see one **Share** button that opens Ghost's own popup: X, Facebook, LinkedIn, Threads
  and Bluesky, in Ghost's order and Ghost's look, with no Mastodon. With JavaScript off the button does nothing. A
  Ghost 5 site shows Copy link and Email instead.

1. **Inflozo's own list (31 August), built with Story 10.82.** This story hands its requirements to Story 10.82 and to
   the Post Content and Post Footers stories, word for word, as 7.13 and 7.14 did. Nothing changes on screen now, no hand
   test, done once deployed. In Story 10.82 you get the list in Theme settings and the Share Row together, and test
   both. Post Content's and Post Footers' share designs show your list instead of Ghost's button, copying Post Headers
   #14's drawn row. **(RECOMMENDED)**
2. **Inflozo's own list (31 August), built now.** Theme settings gets a **Share destinations** list today: ten rows, drag
   to reorder, a switch on each, and a Mastodon box. You test that it saves. No page on your site shows share links until
   Story 10.82.
3. **Ghost's own popup (1 September), built with Story 10.82.** The requirements and this story's card are rewritten to
   one Share button, with Copy link and Email on Ghost 5. In Story 10.82, Theme settings gets two switches for those two.
   Post Headers #14 is redrawn in Claude Design first. Fewest drawings change, but share does nothing without JavaScript
   and has no Mastodon.

**Ruled: option 3 (owner, 2026-10-16).** *(A correction to option 3's last sentence, found while writing the rewrite:
the drawings' JavaScript-off state is not nothing. A26 #9 draws **Email alone**, so a reader without JavaScript can
still email the post. The Share button itself still needs JavaScript.)*

## Claude Design prompt — A24 #14 Share Row, the native-share redraw

**For the owner — before Story 10.82 opens (DW-360).**
1. Open the Inflozo project in Claude Design.
2. Copy everything in the box below into a new message and let it finish.
3. Export the project into the repo as you did for the other passes, and tell the next session "the A24 #14 redraw
   landed".

Story 10.82 is not planned until the redrawn frame is in the export.

The same prompt is saved on its own, with these steps, as
[`claude-design-prompt-a24-14-share-redraw.md`](../planning-artifacts/design/claude-design-prompt-a24-14-share-redraw.md),
and Story 10.82's first criterion stops its Create until the redraw has landed.

```
This is a follow-up on A24 · Post Headers, which you have already designed. Redraw ONE design:
#14 Share Row (`A24-14 Share Row.dc.html`). Change nothing else in the project.

WHY. On 1 September 2026 the owner ruled "native Ghost Share only, everywhere". A26 Post Footers was
carried over in full that day; A24 #14 was not, and its frame says so in the dated panel at its foot
("THE NATIVE-SHARE RULING · 1 SEPTEMBER 2026 · THIS FRAME IS SUPERSEDED IN PART"). On 16 October 2026 the
owner confirmed that ruling and withdrew the older one (one ordered, site-wide list of our own share
links). This pass is the redraw that panel names as outstanding.

READ FIRST, in this project:
- `A24 Post Headers - Spec.md` — 14 Share Row's section, and "Patch notes — the native-share ruling,
  1 September 2026" at the end of the document, above all its paragraph "What the redraw carries".
- `A24-14 Share Row.dc.html` — the frame you are redrawing, including its dated native-share panel.
- `A26-9 Share Row.dc.html` — its section headed "THE TWO SHARE STATES", which draws the four states
  below: the pattern to follow.
- `Calibration Set.dc.html` — the tokens, type scale, spacing and colour roles. Use nothing outside it.
- `Editor Sidebar Kit.dc.html` — every sidebar control, panel, badge and greyed state. The panel uses
  these and nothing else.

WHAT THE REDRAW CARRIES — exactly this list, nothing added:
1. One trigger: a label and one Share control — a link to `#/share` — which opens Ghost's own share
   panel. Ghost's panel owns the destinations and their order.
2. Copy link and Email as the older-Ghost fallback, two links in the same row the trigger sits in.
3. The capability flag: which of the two draws comes from a flag the app sets when the site is
   connected ⚑, because a theme cannot ask Ghost its version. Say so on the frame.
4. The Links stepper (Two · Three · Four) CUT, not greyed — a control with nothing left to do is not a
   disabled control.
5. In the editor panel, the Share destinations row greyed, with the reason beside it — "Ghost's own
   share panel owns the destinations and their order" — and, on an older Ghost, the row stays greyed
   and says the fallback pair shows instead, as A26 #9's panel does ("Ghost's panel · fallback: Copy
   link · Email").
6. The site-wide setting reduced to two switches, Copy link and Email: the fallback pair only.
7. No brand glyphs.
8. The copied confirmation kept, inside the fallback only.
9. A no-JavaScript state that reads Email alone — the trigger and Copy link both need a script.

THE PATTERN. Draw #14's share row in A26 #9's four states, side by side and in A26 #9's order:
(a) current Ghost — one trigger, Ghost's panel owns the destinations;
(b) older Ghost — no panel, Email and Copy link in the same row, Email first, as A26 #9 draws them;
(c) older Ghost — the copied confirmation, which then reverts;
(d) either version, no JavaScript — Email alone.
The header above the row — tag, title, standfirst, byline and hairline — does not move between the
four. Draw the design in light and dark, at 1440, 834 and 390, as A26 drew its share designs.

REWRITE THE WORDS TO MATCH THE PICTURE. In 14 Share Row's section of `A24 Post Headers - Spec.md` and on
the frame, strike what the ruling superseded: the four destinations and their order, the Links stepper,
the ten-platform ordered list, the per-platform brand glyphs, and the two arguments "three of the four
destinations are ordinary links and one is not" and "Mastodon's link is the honest problem in the row".
Keep every superseded sentence legible — struck and dated 16 October 2026 — so the reversal is visible.
Then update the frame's dated native-share panel to say the redraw has landed. That panel says an
older Ghost's "same link opens the sign-in box": correct it there and in 14 Share Row's section, because
read in Portal 2.51's source a bare `#/share` matches none of its links and does nothing on an older
Ghost — it is `data-portal="share"` that opens the sign-in or sign-up box. Leave the dated "Patch
notes — the native-share ruling" section as written.

RULES:
- Design numbering unchanged: nothing renumbered, nothing deleted, no design added. Do not write a
  total of designs anywhere.
- The same components and tokens as the rest of A24 and the Editor Sidebar Kit. No new control,
  colour, size or vocabulary.
- A greyed control is drawn, never hidden, with its reason in one short sentence at the control.
- Any literal Ghost Handlebars in markup you emit — for example the Email link's `{{encode}}` or
  `{{url}}` — must be written with zero-width entities, `{&#8203;{` and `}&#8203;}`, because a bare
  `{{ … }}` is a Claude Design value hole and renders EMPTY.
- Change no other design, frame or spec section.

WHEN DONE: list every file you changed and, for each of the nine items above, where it is drawn.
```
