---
title: 'Story 5.23 — The play-loop gate'
type: 'feature'
created: '2026-09-27'
status: 'in-review'
owner_test: pending
review_loop_iteration: 1
baseline_commit: '3361bb6aef749d5a0d559ba976133e3535b717fc'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Nothing new is drawn on your screen: this story adds the automatic check behind Inflozo's central promise — shuffle and
remix as much as you like, and nothing you typed or set is ever lost. On every change we push, a 40-section page is
shuffled twenty times and then remixed, and every word, picture, list and setting must still be there — and, as you
ruled (R-205), a design you go back to by any route now looks exactly as you left it, which you can check in four steps
on the Controls review page. Making the editor fast enough on very big pages — it currently freezes for about half a
second per design change on a deliberately slowed computer — is Story 5.23a, straight after this one (R-206).

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-D17's promise has no mechanical gate, and planning it found two things more (all executed on
2026-09-27 — Design Notes).

- **Nothing proves zero loss over a real play session.** `remix.test.ts` runs a stub ring and a stub switch, and the
  runtime's tests check one path at a time. Nothing runs the real `ringFor`, `shuffleTo`, `switchDesign`, `remixPicks`
  and `remixFold` together over a many-section page.
- **Going round the ring does not always bring a design back as it was left.** A setting two designs share travels with
  you, then is put aside against the SECOND design when a third lacks it — so back on the first it shows its default.
  Nothing is deleted, but R-160's "going back to a design always looks exactly the way you left it" is false on that
  path, and 5.11's tests and the owner's step 9 used Card tint, the one case that works.
- **The 60 fps half cannot pass today.** Every design change or move repaints all 40 sections; R-206 gives it Story
  5.23a.

**Approach** (the owner ruled all three questions option 1 on 2026-09-27 — R-205, R-206 and R-207):

- **One pure gate, `apps/web/play-loop.test.ts`, inside `pnpm check`.** It builds the 40-section stress fixture from the
  library, plays 20 Variant Shuffles and a full Site Remix through the editor's own functions for every seed, and asserts
  zero loss, the round trip, the partition and its own controls.
- **Every design remembers itself** (R-205). Leaving a design records all of its values against it, and
  a return restores them exactly. A first visit still carries and defaults (FR-D19). Clear dark overrides also clears
  what is remembered.
- **The 60 fps work is its own story, 5.23a** (R-206), and Story 5.24 then sweeps every open entry in the deferred-work
  ledger (R-207). No migration, so no Schema phase.

## Boundaries & Constraints

**Always:**

- **The gate runs the editor's own functions, never copies.** Shuffle is `shuffleTo` then `switchDesign`, Remix is
  `remixPicks` then `remixFold` folding `switchDesign`, the ring is `ringFor` over the library, and every result goes
  through `designate` as `apply` does. Only `onShuffle`'s and `onRemix`'s few-line compositions are mirrored, because
  `node --test` cannot load a `.tsx`.
- **The fixture is derived, never written down** (standing rule 4). Home cycles every design `offeredOn(entry,
  'home.hbs')` gives; the site doc holds what compiles to `default.hbs`. Every count is read off the fixture.
- **Every stored value is non-default and unique to its section**, so a value reset to its default, or moved to another
  section, is caught.
- **A check whose control does not fail is not a check** (standing rule 2). Each control named below must be reported.
- **Seeded and reproducible.** A failure names its seed and its section.
- **No surface changes.** The editor and `/controls` draw exactly what Story 5.11 built from B1a, S4b and S6; only the
  values a return shows change. There is no new frame to match (R-74 governs surfaces, and none is added).

**Ask First:**

- Any change to what a FIRST visit carries or defaults (FR-D19's three arms), or to R-160 and R-205 beyond "a return is
  exactly as it was left".

**Never:**

- **Never author a shipped design** (AD-35, R-158). The ring is `packages/library/fixtures/controls/`, and the decoy is
  an in-memory entry, never a file.
- **Never a new doc field or a migration.** What a design remembers uses the existing `parkedControls` shape.
- **Never measure frames or touch the render or paint path here.** That is Story 5.23a's (R-206).
- **Never edit the design export.**

## I/O & Edge-Case Matrix

The owner ruled all three questions option 1 on 2026-09-27: **R-205** (every design remembers itself), **R-206** (the
60 fps work is Story 5.23a) and **R-207** (Story 5.24 sweeps the whole ledger).

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| The session | 40-section Home, 20 Shuffles across its ringed sections, then a full Remix, every seed | Every content prop, list item, data value, name, hidden flag, audience and main-feed flag exactly as before; every control value and dark override that was held is still held, live or remembered | A failure names its seed and section |
| Back to the start | After the session, each section switched back to the design it started on | Its controls and dark overrides exactly as at the start | N/A |
| Away and back | Sample 1 with Card tint Strong (dark: Soft) → sample 2 → sample 1 | Absent on sample 2 and remembered against sample 1; back on 1, Strong and Soft, and sample 1's record cleared | N/A |
| Round the ring | Sample 1 with Show icons Off and Image position Side, then `]` three times | Back on sample 1: Off and Side. As built today: On and Top | N/A |
| Changed on the way | Sample 1 at Columns 4; ▶, set Columns 2 on sample 2; ◀ | Sample 1 shows 4, as left (R-160, R-205); ▶ again shows 2 | N/A |
| First visit | Sample 1 → sample 3, never visited | Shared settings carry; Stacking takes its default | N/A |
| Partition | A decoy `controls` design compiling to `post.hbs` in the library | Never in a ring, never landed on | N/A |
| Ring of one | Every pilot section | Never moves | N/A |
| Site-wide | a1/1 in the site doc | Byte-identical after the session (R-161) | N/A |
| Clear | A section with a remembered dark override; Clear dark overrides by row, ⋯ or Theme settings; back to that design | No dark override comes back | N/A |
| Controls | A switch that drops remembered records; a ring that ignores the partition; the rule as built at 5.11 | Each is reported by the check it targets | A control that passes fails the gate |

</frozen-after-approval>

## Code Map

- `packages/section-runtime/src/controls.ts:552-612` -- `switchControls`, the one rule (carry, park, default, R-160),
  and the change (R-205). `declared()` (:92-108, not exported) adds the three universals; `UNIVERSAL_CONTROLS`
  (`packages/library/src/vocabulary.ts:300`) names them for the gate.
- `packages/section-runtime/src/doc-edit.ts:96-113` -- `switchDesign`, which Shuffle and Remix call. `:141-148`
  `clearDarkOverrides` serves both Clears; under R-205 it also empties remembered dark maps.
- `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts:114` -- the project-wide Clear skips a section with
  no live override; under R-205 it must also visit one whose records hold one.
- `packages/section-runtime/src/controls.test.ts:776-870` -- the rule's tests. Several assert `parkedControls` is `{}`
  after a switch (update them); the 1 → 2 → 3 → 1 test (:825) carries only tint and rule, so it cannot see the gap.
- `packages/section-runtime/src/doc-edit.test.ts:260-308` -- `switchDesign`'s tests; same record-shape updates.
- `apps/web/lib/ring.ts:43` `step`, `:50` `shuffleTo` · `apps/web/lib/remix.ts:42` `remixPicks`, `:63` `remixFold` --
  the play loop, pure and importable under `node --test`.
- `packages/library/src/placement.ts:44` `isPlaceable`, `:137` `offeredOn`, `:183` `samePartition`, `:197` `ringFor`.
- `packages/section-runtime/src/main-feed.ts:65` `designate` · `doc-schema.ts:24-89` the instance shape and `parseDoc`.
- `apps/web/lib/controls-review.ts:58` `samples()` (the ring), `:65` `paywallSamples()` · `apps/web/lib/pilots.ts:34,44`
  `pilotIds`, `pilot` -- the library the gate assembles, exactly as the harness does (`harness/editor/layout.tsx:149-155`).
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- read-only: `ringOf` (:994-1000), `onShuffle`
  (:3505-3511), `onRemix` (:3535-3551), `designated` in `apply` (:3366). The gate mirrors these.
- `apps/web/remix.test.ts:24-27` -- the `random` shape the play loop takes; the gate needs a real seeded generator
  (a few lines, e.g. mulberry32), since that helper only cycles values. `apps/web/package.json`'s `node --test
  '*.test.ts'` picks up a new top-level file; core packages may not read files or call `Math.random`
  (`eslint.config.js:45-60`).
- `tools/keyboard/journey.spec.mjs:989-1013` -- the FR-D19 stop (tint round the ring); gains Image position.
- `tools/probe/run-verify-controls.cjs:~560-570` -- the ring walk's long way round on production; gains a shared
  control. Its catalogue row is in `tools/doc-audit.py:546`.

## Tasks & Acceptance

**Execution:**

- [x] `apps/web/play-loop.test.ts` -- NEW: the fixture, the session per seed, the checks and the controls in Design
  Notes -- FR-D17's gate, on every commit.
- [x] `packages/section-runtime/src/controls.ts` -- `switchControls` becomes Design Notes' rule, and its comment says
  so -- R-160 in every case, not one.
- [x] `packages/section-runtime/src/doc-edit.ts` -- `clearDarkOverrides` also empties `darkOverrides` in the
  section's records -- a cleared section never gets one back.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts` -- the project-wide Clear also visits a
  section whose records hold a dark override -- same.
- [x] `packages/section-runtime/src/controls.test.ts`, `packages/section-runtime/src/doc-edit.test.ts` -- update the
  record-shape assertions; add round the ring with Show icons and Image position, changed on the way, and the Clear --
  the rule's own tests.
- [x] `tools/keyboard/journey.spec.mjs` -- the FR-D19 stop also sets Image position on sample 1 and reads it after
  the wrap; run it once on the baseline and record it failing -- the browser's view of the fix.
- [x] `tools/probe/run-verify-controls.cjs`, `tools/doc-audit.py` -- the long-way-round step also carries Image
  position; the row's prose says so -- R-82 on production.

### Review Findings

Review 1 (2026-09-27; five layers: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier). Every patch applied the same day; the one decision is Question 4 below.

- [ ] [Review][Decision] The three Clear doors open only on an override IN FORCE, so a section whose only dark override
  is REMEMBERED cannot be cleared from the row, the `⋯` item or Theme settings — the frozen Clear row and its criterion
  name all three doors; Dev recorded it as DW-286 (Story 9.1) without a ruling. Question 4.
- [x] [Review][Patch] The return path's stranger arm (`!own(kept, name) && leaving.has(name)`) had no test: dropping the
  guard left every test green [packages/section-runtime/src/controls.ts:622] — one test pins it, seen red with the guard
  dropped (61 pass, 1 fail).
- [x] [Review][Patch] Back-to-the-start never asserted the record is CLEARED on return, so the away-and-back criterion's
  second half ran only on `switchDesign` directly [apps/web/play-loop.test.ts:260] — the check now reports a held
  record; seen red with the delete removed (2 fail, "its record is still held").
- [x] [Review][Patch] The site-doc and ring-of-one tripwires compared `JSON.stringify` output, which is key-order
  sensitive [apps/web/play-loop.test.ts:283] — `isDeepStrictEqual`, as every other check.
- [x] [Review][Patch] `parkedControls`' doc said "written only by `switchControls` and read only by it" while
  `holdsDarkOverride` now reads it [packages/section-runtime/src/controls.ts:55]; `clearDarkOverrides`' doc counted "only
  two" doors while a third exists [packages/section-runtime/src/doc-edit.ts:143]; the gate cited harness lines that had
  already drifted and `stillStored`'s comment did not say the record's identity is not its question
  [apps/web/play-loop.test.ts:64,247] — wording, no count written down.
- [x] [Review][Patch] The journey opened the Layout accordion only on `aria-expanded === 'false'`, so an absent attribute
  skipped the open and failed obscurely [tools/keyboard/journey.spec.mjs:1009] — `!== 'true'`.
- [x] [Review][Patch] The deployed walk's put-back to Top clicked the first "Top" radio on the page and never read it
  back, so the DW-209 wheel could walk a page nobody wrote it for [tools/probe/run-verify-controls.cjs:583] — clicked
  inside Image position's row and checked; re-run on production below.
- [x] [Review][Defer] A record whose key is no longer a design in the library is kept and inert, and nothing says so
  [packages/section-runtime/src/doc-schema.ts:68] — deferred, pre-existing (`parkedControls` since Story 5.11); DW-288.

Dismissed as noise or answered by evidence: the fixture's `pool` cannot be empty (the fixture test asserts a ring to
play on first); the gate's runtime is 3.2 s on this computer, no budget needed; legacy 5.11 records on production —
none exist (0 of 33 sections, executed twice); `resetSection` leaving records alone is the spec's own boundary and what
"every design remembers itself" means; a panel cue that a design remembers itself is a surface, and this story adds
none; the catalogue does not index `apps/web/*.test.ts` and never has; the Design Notes' rule wording and fixture prose
lagged the code — corrected in prose, not code.

**Acceptance Criteria:**

- Given the 40-section fixture, when the gate plays 20 Variant Shuffles across its ringed sections and then a full Site
  Remix of Home for every seed, then no content prop, list item, data value, name, hidden flag, audience or main-feed
  flag changes, and every control value and dark override held before is still held — zero loss.
- Given the same session, when every section is switched back to the design it started on, then its settings, light
  and dark, are exactly as they started.
- Given a design carrying a control the next design does not declare, when the section is shuffled away and back, then
  the value is restored exactly and its record is cleared.
- Given any design of the ring, when `]` goes round the whole ring back to it, then it is exactly as left — in the
  gate and in the keyboard journey.
- Given every move of every session, then each lands inside its section's `ringFor` partition, the decoy is never
  landed on, a ring of one never moves, and the site doc is byte-identical.
- Given each control, when the gate's checks run over it, then the check it targets fails.
- Given a section with a remembered dark override, when Clear dark overrides runs (the row, the ⋯ item or Theme
  settings) and the section returns to that design, then no dark override comes back.
- Given the editor and `/controls`, then nothing is drawn differently from what 5.11 built from B1a, S4b and S6.
- Given the deployed `/controls`, when the owner walks `## Owner's manual test`, then every step holds (R-80).
- Given the change, then `pnpm check` and `pnpm keyboard` are green and CI publishes.

## Spec Change Log

1. **Dev, 2026-09-27 — an empty record is kept.** The rule's sketch deleted a record left empty. Dev keeps it, because a
   design left with nothing stored was left at its defaults. Deleted, a return reads as a first visit and carries whatever
   was set on the design after it. That breaks R-205's "always", the register's own words ("arriving at a design with a
   record … returns one the record lacks to its default") and the PRD's FR-D19 ("the three arms above describe a design
   not yet visited"). It is inside "a return is exactly as it was left", so it is not an Ask First change. The gate cannot
   see the case, because every fixture section stores a universal. `controls.test.ts`'s empty-record test pins it, and
   the reason sits beside `switchControls`.
2. **Dev, 2026-09-27 — two checks gained the controls they lacked (standing rule 2).**
   - The Partition row's "never in a ring" is now asserted directly: no Home section's ring holds the decoy, and the
     same-category control ring does.
   - The site doc's byte-identity now has a control: a finished session that a stray write reached must fail it.

## Design Notes

**Executed at planning (2026-09-27; Node 24.18.1, the repo's Playwright 1.61.1 with Chromium 149; this computer, an
Intel Core i5-6600K with 4 cores).**

- *Round the ring.* Over `samples()` and the real `switchDesign`, sample 1 starts with icons Off, image Side, rule None,
  columns 4 and dark tint Strong. After `]` three times, sample 1 holds columns and rule live and dark tint, while icons
  and image are parked against `controls/2`. Retracing (1 → 2 → 3 → 2 → 1) and one hop (1 → 2 → 1) are exact. A second,
  independent run found the same with rule on 1 → 3 → 2 → 1.
- *300 seeds × 40 sections, 20 Shuffles and a Remix each.* As built: 0 values lost from the doc, 1,435 of 12,000
  sections not as left when switched back to their first design, and 2 of the 3 wraps not as left. The rule below,
  prototyped: 0, 0 and 0.
- *The paint (input for Story 5.23a, R-206).* A production build of the harness, Home at 40 sections by a temporary header,
  since reverted. One design change (`]`) is one long task of 131–138 ms at 1× and 492–512 ms at 4× CPU throttle; a move
  (⌥↓) is 130 ms and 436 ms; a control change is none, because `onChange` stamps one root (`editor.tsx:3780-3801`). The
  cause is `apply` → `paint()`, which renders every section and rewrites `#canvas` (`editor.tsx:2199-2310`).
  - The rAF p95 reads 16.6–16.8 ms on smooth windows at 60 Hz. The frame criterion therefore needs a definition that
    counts dropped frames, not 0.1 ms of timestamp jitter.
  - Where a ring exists (the harness) is where Shuffle can be traced: on production every ring is one design.

**The rule (R-205):**

```
leaving `from`:  record = every live value `from` declares, in controls and in darkOverrides
                 parked[from] = record, kept even when it is empty (Spec Change Log 1)
                 remove from the live maps what `to` does not declare
arriving at `to`: if parked[to] exists: for every name `to` declares that parked[to] lacks, remove it if
                    `from` declares it (it was carried in; `to` was left at its default) — a name `from` does not
                    declare is a stranger and stays; then restore the WHOLE record, and delete parked[to]
```

A first visit still carries what both designs declare and defaults what only `to` declares (FR-D19). A name neither
design declares stays where it is (`controls.test.ts:842`). The doc gains at most one record per design visited per
section, in the existing shape, so there is no migration.

**The gate.**

- **The library** is what the harness assembles: the placeable pilots, `samples()` and `paywallSamples()`, plus one
  decoy. The decoy is an in-memory copy of a sample with a free id in `controls` and `compileTarget: ['post.hbs']`, so a
  wrong partition rule has something to land on.
- **The fixture.** Home's 40 instances cycle `offeredOn(entry, 'home.hbs')`, and the site doc holds every design
  `offeredOn(entry, 'default.hbs')` gives (as built, `a1/1` alone). Each instance's content is its category's default
  with every text prop made unique to the section. Every declared control and universal gets a non-default offered
  value, and every `darkOverride` control a dark value different from its light one. One ringed section is hidden and
  one has a non-default audience. Every Data row of every section stores a non-default value. Both docs are run through
  `designate` and `parseDoc`. (Prose corrected at review to what the code derives — review, 2026-09-27.)
- **Each seed (1 to 100)** plays 20 Shuffles, each on a random section whose ring holds two or more, then one Remix of
  Home. Every move is recorded.
- **The checks.** Everything but `designId` and the three control maps is deep-equal to the start. Every (map, name,
  value) stored at the start is still stored, live or in a record. Switched back to its first design, each section is
  exactly as it started. Every move satisfies `samePartition` and `isPlaceable`, and the decoy is never a target. The
  site doc and the pilots never change. The docs still parse.
- **Two more tests.** Away and back uses a pair derived from the declarations, never hard-coded names. The wrap is
  `step` round the ring from every design.
- **The controls.** A switch that drops `parkedControls` must fail the stored-value check. A ring that is only "same
  category" must land on the decoy. The rule as built at 5.11, kept in the test as a named control, must fail
  back-to-the-start.

**Routine calls.** The gate lives in `apps/web` because core packages may not read files or use `Math.random`. It runs
100 seeds.

**Deferred work.** None of the nine entries that name this story is its to build, because it has no screen and no
screen-reader walk:

- DW-205 → Story 15.2, whose manual screen-reader pass checks the live region.
- DW-211 and DW-214 → Story 9.1, the first shipped ring.
- DW-212 → the first Epic 9 story that ships a `data-items-limit`.
- DW-215 → Story 5.23a (R-206), whose 40-section harness page re-rolls several sections for one ⌘Z.
- DW-188, DW-207, DW-219 and DW-220 → Story 5.24, the sweep (R-207).

## Verification

**Commands:**

- `cd apps/web && node --test play-loop.test.ts` (Node 24) -- expected: every seed passes and every control is reported
  failing inside the test. Run once on the baseline rule first: back-to-the-start fails and names seeds. Record both
  runs.
- `pnpm check` -- expected: exit 0.
- `pnpm keyboard` -- expected: 0 failed. The FR-D19 stop with Image position fails on the baseline and passes after;
  record both runs.
- `git diff --stat 3361bb6aef749d5a0d559ba976133e3535b717fc HEAD -- supabase` -- expected: empty (no Schema phase).

**Manual checks (R-82, after CI publishes):**

- The GitHub Actions run for HEAD (`check`, `rls`, `deploy`) is green and the Vercel deployment is READY at HEAD, read
  with `GITHUB_TOKEN` and `VERCEL_*` from `tools/probe/.env`.
- `env $(grep -E '^SUPABASE_(URL|SECRET_KEY)=' tools/probe/.env | xargs) node tools/probe/run-verify-controls.cjs`
  against `https://app.inflozo.com`: the ring walk's new step passes with 0 FAIL, the throwaway account is deleted, and
  the user count is unchanged.

**Results (Dev, 2026-09-27, Node 24.18.1; every count is a run's own output, not restated).**

- **The gate on the baseline rule first.** `play-loop.test.ts` was run while `switchControls` was still as built at
  5.11: 3 pass, 2 fail.
  - Back-to-the-start failed 354 times on 97 of 100 seeds (3,900 moves over 40 sections). Each failure names its seed,
    section and setting — e.g. *seed 1, section-11 (Controls sample — a banded pair — section 11): back on controls/2,
    its controls are not as it started — icons "off" → unset, image "top" → unset*.
  - Round the ring failed from `controls/1` (icons, image) and `controls/3` (rule).
  - The stored-value, untouched, partition and as-built checks found nothing: nothing was ever deleted, as planning
    found.
  - Re-run at the Dev hand-back with HEAD's `controls.ts` put back for the run: the same 354 failures and the same two
    wraps. The file was then restored and compared byte for byte (`cmp`).
- **The gate on R-205:** 5 pass, 0 fail — *100 seeds, 3900 moves over 40 sections: 0 failures*. Every check has a
  control, and each control is reported failing the check it targets:
  - a switch that drops remembered records → the stored-value check, 5,345 times on 100 of 100 seeds;
  - a same-category ring → the partition check, 1,684 times, e.g. *its Shuffle moved controls/2 → controls/4, the
    decoy*;
  - the rule as built at 5.11 → back-to-the-start, 354 times on 97 of 100 seeds, and round the ring from `controls/1`
    and `controls/3`;
  - a switch that also rewrites the section's data → the untouched check, 700 times;
  - a ring that is the whole library → *a ring of one changed*, 2,100 times;
  - a stray write to the site doc → *seed 1: the site doc changed (R-161)* (change log 2).
  - The fixture also asserts that no Home section's ring holds the decoy, while the same-category ring does (change
    log 2).
- **The rule's own tests, each seen red without its fix.**
  - Against the 5.11 rule, `controls.test.ts`'s new round-the-ring, changed-on-the-way and empty-record tests fail.
  - Against the old live-only `clearDarkOverrides`, both Clear tests in `doc-edit.test.ts` fail.
  - The first-visit test passes on both rules, as it must: FR-D19's arms are unchanged.
- **The empty record (change log 1).** Run against the sketch's delete-when-empty variant, the gate stays green, because
  its fixture stores a universal on every section and no record is ever empty. Only `controls.test.ts` goes red: its
  empty-record test, and the two record-shape tests that now expect an empty record kept (a name neither design
  declares; junk in the stored maps). That is why the empty-record test exists.
- **`pnpm check`** — exit 0 on the final tree: lint, typecheck (the gate included), every package test and
  `check-snapshots: PASS`. The gate and the new runtime tests are in its output.
- **`pnpm keyboard`.**
  - The FR-D19 stop with Image position, run alone on the baseline rule, twice (the subagent's run, then the hand-back's):
    1 failed, *a SHARED setting comes back exactly as it was left too (R-205) — Expected: "Side", Received: "Top"*
    (`journey.spec.mjs:1030`).
  - After R-205, the whole gate: **100 passed** (3.9 m), the FR-D19 stop among them.
- **`git diff --stat 3361bb6aef749d5a0d559ba976133e3535b717fc HEAD -- supabase`** is empty, and so is the working tree
  against the baseline: no Schema phase.
- **`python3 tools/doc-audit.py --check`**, twice — PASS; the first run regenerated INDEX and the story board.
- **The deployed walk BEFORE the push, as the control for its new check.** `run-verify-controls.cjs` against
  `https://app.inflozo.com` at `2973a798` (`dpl_aCdwAbbKnCPodVp7FBG7ZA8NRhai`, the rule as built at 5.11): **113 PASS,
  1 FAIL**. The one FAIL is the new check, *ring — R-205: … Image position is Side after the long way round* →
  `{"root":"cx","attr":"top","panel":"Top"}`. The new step-7 control (Alignment Centre, Image position Side, Card tint
  Strong and the typed heading) passed. So did every step after the put-back to Top: the DW-209 wheel, Shuffle's seat
  and the Remix walk. Account deleted, HTTP 200, users 13 → 13.

**Real infrastructure** (R-82) — what this Dev phase hit and what each returned (keys by variable name only):

- **Supabase** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`):
  - A read-only census of `project_templates` through PostgREST: HTTP 200, 19 template rows across 6 projects and 33
    sections. None holds a `parkedControls` record (12 carry the key, every one empty). The designs in use are `a1/1`,
    `a17/1`, `a22/1`, `a24/1` and `a4/13`, each a ring of one. So no record written under the 5.11 rule exists for R-205
    to read differently. The census's control: the same counter over one synthetic record counts 1 of 1.
  - Each walk's throwaway account, through the Auth Admin API: created, then deleted with HTTP 200, users 13 → 13, in
    every run.
- **`app.inflozo.com/controls`** — the walks: before the push at `2973a798`, and after it at `9263b6e3`.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`) — production before the push is
  `dpl_aCdwAbbKnCPodVp7FBG7ZA8NRhai`, READY at `2973a798`.
- **GitHub Actions** (`GITHUB_TOKEN`) — CI run 36314380832 at `2973a798`: `check`, `rls` and `deploy` success. The
  Render matrix run 36314380762: success.
- **Not touched and not claimed:** Ghost T1 and T3, Resend and Dodo. This story calls no Ghost API, sends no email and
  bills nothing.
- **After the push, at `9263b6e3`** (the Dev commit):
  - **GitHub Actions** (`GITHUB_TOKEN`): CI run 36317522512 — `check`, `rls` and `deploy` success. The Render matrix
    run 36317522499: success.
  - **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): `dpl_Fs2qBDCzB2S4zbMBi17AyupU1yyM` READY, production,
    built from `9263b6e3` and aliased to `app.inflozo.com`, `inflozo.com` and `www.inflozo.com`.
  - **The deployed walk, every run recorded.**
    - Run 1 was a HARNESS ERROR, not a result: `page.reload` timed out after 30 s waiting for `networkidle`
      (`run-verify-controls.cjs:472`), with 0 FAIL and 85 PASS before it. The ring walk never ran; the account was
      deleted (HTTP 200, users 13 → 13). Recorded as **DW-287** (new, owner Story 5.24).
    - Run 2: **0 FAIL, 114 PASS** — the same checks as the run before the push. The new check now reads
      `{"root":"cx","attr":"side","panel":"Side"}`: Image position is Side after the long way round, on the section root
      and in the panel. Account deleted, HTTP 200, users 13 → 13.
  - **Next:** the owner's manual test on `https://app.inflozo.com/controls` (R-80).

**Review (2026-09-27, Node 24.18.1; every count is a run's own output).**

- **Real infrastructure, re-executed by the review's own verifier** (R-82; keys by variable name only):
  - **GitHub Actions** (`GITHUB_TOKEN`): HEAD `2f25af08` CI run 36318278556 — `check`, `rls`, `deploy` success; Render
    matrix 36318278553 success. The Dev commit `9263b6e3`: run 36317522512, all three success (the spec's own ids).
    Negative control: `head_sha=0000…` → 0 runs.
  - **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): `dpl_fo43Lf6JozwjFu2NyxxV8Chy9ANR` READY, production,
    built from `2f25af08`, aliased to `app.inflozo.com`, `inflozo.com` and `www.inflozo.com`. Negative control: a
    made-up deployment id → HTTP 404.
  - **Supabase** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`), read-only: the `project_templates` census again — HTTP 200, 19
    rows, 6 projects, 33 sections, 12 carrying the `parkedControls` key and 0 non-empty; the counter's control over one
    synthetic record counts 1. GET only.
  - **The deployed walk before the patches**, at `2f25af08`: **0 FAIL, 114 PASS**, the R-205 check reading
    `{"root":"cx","attr":"side","panel":"Side"}`; account deleted, HTTP 200, users 13 → 13; no DW-287 timeout.
  - **No migration** (`git diff --stat 3361bb6a HEAD -- supabase` empty), so R-99's schema read was not needed.
  - Ghost T1 and T3, Resend and Dodo: not touched and not claimed, as at Dev.
- **The gate**, before and after the patches: 5 pass, 0 fail, *100 seeds, 3900 moves over 40 sections: 0 failures*,
  3.2 s. Two new controls, each seen red: the guard on the stranger arm dropped → `controls.test.ts` 61 pass, 1 fail;
  the record's delete on return removed → the gate 3 pass, 2 fail, *back on controls/1, its record is still held*.
- **The runtime's tests** after the patches: 90 pass, 0 fail (`controls.test.ts` and `doc-edit.test.ts`).
- **`pnpm check`** on the patched tree: exit 0 — lint, typecheck, every package test and `check-snapshots: PASS`.
- **The FR-D19 journey stop** alone (`pnpm keyboard -g 'FR-D19'`), with the accordion guard patched: 1 passed (6.1 s).
- **The deployed walk with the new put-back check**, against `https://app.inflozo.com` at `2f25af08`: **0 FAIL,
  115 PASS** — the R-205 check `{"root":"cx","attr":"side","panel":"Side"}` and the put-back `{"attr":"top"}`; account
  deleted, HTTP 200, users 13 → 13. Two walks this review, neither hit DW-287.

## Owner's manual test

Deploy confirms the address.

1. **URL:** `https://app.inflozo.com/controls` · **Screen:** Controls review, the internal page with the three sample
   designs. **Do:** nothing yet. **See:** the sample on the left, its panel on the right, and the Design block reading
   **1 of 3**.
2. **URL:** `https://app.inflozo.com/controls` · **Screen:** the same. **Do:** in the panel set **Show icons** to *Off*,
   **Image position** to *Side*, **Card tint** to *Strong* and **Columns** to *4*. **See:** the sample redraws each time.
3. **URL:** `https://app.inflozo.com/controls` · **Screen:** the same. **Do:** press **▶** three times: 2 of 3, 3 of 3,
   then back to 1 of 3. **See:** back on sample 1, all four read as you set them — Off, Side, Strong and 4. Before this
   story, Show icons and Image position came back On and Top.
4. **URL:** `https://app.inflozo.com/controls` · **Screen:** the same. **Do:** press **▶** once to sample 2, set
   **Columns** to *2*, then press **◀**. **See:** sample 1 shows Columns **4**, as you left it (R-205). Press ▶ again:
   sample 2 shows **2**.

## Questions for the owner

### Question 1 — After you go all the way round the designs and back, should a design look exactly as you left it?

Today a design only remembers a setting when the next design you move to does not have it. A setting the next design
shares travels with you instead, and when you later reach a design without it, it is put aside against *that* design —
not the one where you set it.

**An example you can try on the Controls review page.** Samples 1 and 2 have *Show icons* and *Image position*; sample
3 has neither.

1. On sample 1, set **Show icons** to *Off* and **Image position** to *Side*.
2. Press ▶ to sample 2: both come with you.
3. Press ▶ to sample 3: neither exists there, so both are put aside — against sample 2.
4. Press ▶ again: the ring wraps back to sample 1, which now shows icons **On** and the picture on **Top**.

Nothing is deleted: going back to sample 2 shows them. But sample 1 no longer looks the way you left it. In 300 random
play sessions on a 40-section page, about one section in eight came back different. Your test of Story 5.11 used *Card
tint*, which only sample 1 has, so it could not show this. Every real category has one design today, so only the review
page shows it; from Epic 9 every customer would.

1. **(RECOMMENDED) Every design remembers itself.** Leaving a design remembers all its settings, so coming back — by ◀ ▶,
   round the ring, by Shuffle or by Remix — always shows it exactly as you left it. That makes your R-160 words true in
   every case. A design you have not visited yet still takes your current settings where it has them, and its own
   defaults for the rest. The one visible trade: change *Columns* on sample 2, go back to sample 1, and sample 1 shows
   the Columns you left it with — the same trade R-160 made for *Rule under heading*. "Clear dark overrides" clears the
   remembered ones too. In the same 300 sessions, no section came back different. You test it in four steps.
2. **Keep it as built.** The check counts a setting as kept wherever the section stores it, and R-160's "always" is
   reworded to "when that design is the one it was put aside against". Nothing on screen changes, and there is no test
   for you.

**Ruled: option 1 (owner, 2026-09-27).** *"Every design remembers itself. Leaving a design remembers all its settings, so
coming back — by ◀ ▶, round the ring, by Shuffle or by Remix — always shows it exactly as you left it."* Recorded as
**R-205**; it reaches the register, FR-D19, `epics.md` (FR-D19's line, Stories 5.11 and 5.23), `EXPERIENCE.md`'s Design
picker row and `epic-5-context.md`, and this spec's tasks build it.

### Question 2 — The editor is too slow on a 40-section page. Where should that work go?

The epic's exit also asks for smooth editing — 60 frames a second — on a 40-section page, with the computer slowed four
times as the PRD sets it. Measured today on a production build, changing a section's design freezes the editor for
**about half a second** (0.13 s at normal speed), and moving a section for **0.44 s**. The limit is **0.05 s**. Changing
a setting is instant. The cause: every design change or move redraws all 40 sections, not just the one that changed.

**An example.** On a long home page, pressing Shuffle on one section makes the whole page stall for half a second before
it answers.

1. **(RECOMMENDED) Its own story, 5.23a, straight after this one.** The editor redraws only the section that changed: a
   design change replaces one section, and a move moves one. Then the 3-second trace — drag, reorder, Shuffle, setting
   changes — is measured on the 40-section page at 4× slowdown on this development computer. It is slower per core than
   today's mid-tier laptops, so a pass here is the harder test. Epic 5 closes when both stories are green, and this one
   keeps to "nothing is lost".
2. **Both in this story.** One bigger story, touching the heart of the editor as well as the check.
3. **Move the speed work to Story 15.4**, the launch performance gate, and close Epic 5 on "nothing is lost" alone. The
   editor stays slow on very big pages until launch hardening.

**Ruled: option 1 (owner, 2026-09-27).** *"Its own story, 5.23a, straight after this one. The editor redraws only the
section that changed: a design change replaces one section, and a move moves one. Then the 3-second trace … is measured
on the 40-section page at 4× slowdown on this development computer."* Recorded as **R-206**: Story 5.23a is added to
`epics.md` and `sprint-status.yaml` with the board's lettered numbering, the 60 fps criterion moves to it from this
story's card, and DW-215 goes with it.

### Question 3 — Epic 5 leaves loose ends whose owning stories are finished. Who takes them?

This is Epic 5's last story. Fifteen open items in the deferred-work list name only Epic 5 stories that are done, so
nobody will pick them up. Four of the nine that name this story are screen or walk work it cannot do: a Layers hover
highlight, three Section Picker leftovers, a gap in the editor walk, and a flaky save-on-tab-hide check. Three of the
fifteen are already fixed and only the list lags: DW-165, DW-197 and DW-206.

**An example.** DW-202: when the server refuses a save for good, the editor still says "Retrying … when the connection
returns" instead of asking you to sign in again. Its owner was Story 5.17, which is done.

1. **(RECOMMENDED) A sweep story, 5.24, like 3.9 at the end of Epic 3.** Each item is fixed, closed with its evidence, or
   given a named later story, and you test whatever it changes on screen. It runs after 5.23a.
2. **Hand them to the Epic 5 retrospective**, which names an owner for each but builds nothing.
3. **Leave them as they are.**

The fifteen: DW-102, DW-104, DW-122, DW-129, DW-165, DW-171, DW-175, DW-197, DW-202, DW-204, DW-206, DW-240, DW-250,
DW-278 and DW-281. From this story's own list: DW-188, DW-207, DW-219 and DW-220.

**Ruled: option 1 (owner, 2026-09-27), widened.** *"A sweep story, 5.24, like 3.9 at the end of Epic 3 … It runs after
5.23a. — Do a complete sweep across all deferred items and close whatever we can now."* Recorded as **R-207**: Story
5.24, after 5.23a, triages EVERY open entry in the ledger, not only Epic 5's, and closes whatever can be closed with
evidence at that point; the rest keep, or gain, a named owner. Read as the sweep's scope, since option 1 runs it after
5.23a — say so if you meant it to run sooner.

### Question 4 — A dark setting a design only remembers cannot be cleared from anywhere. Leave that to Story 9.1, or fix the count now?

Since this story, a section remembers each design's dark settings when you move it to another design. But the three
places that offer **Clear dark overrides** — the row in the panel, the `⋯` menu in Layers, and Theme settings — only
offer it when a dark override is *in use* right now. A remembered one is not in use, so none of the three opens.

**An example you can try on the Controls review page.** On sample 1, switch the moon to dark and set **Card tint** to
*Soft*. Press ▶ to sample 2, which has no Card tint: the dark tint is now remembered against sample 1. Theme settings
says "No sections carry a dark override" and its Clear says "Nothing to clear". Press ◀: the dark tint is back on sample
1. Your ruling said Clear also clears what is remembered — and it does, but only when some other override is in use to
open the door. Today no customer can reach this, because every shipped design is one of a kind. Dev wrote it down as
DW-286 and handed it to Story 9.1, the first story with a real ring. That narrows a frozen line of this story's spec,
so it is yours to confirm.

1. **(RECOMMENDED) Confirm DW-286: Story 9.1 decides.** Nothing changes now. This story's Clear criterion is read as
   "when a Clear runs, the remembered ones go too", which is built and tested. Story 9.1, where a customer can first
   hold a remembered override, asks you how the count and the three doors should treat one — a screen question, with
   the frames in front of you.
2. **Count remembered overrides now.** Theme settings' sentence and Clear count a section that holds a dark override
   anywhere, remembered included, so its Clear opens; the panel row and the `⋯` item stay as they are. A small change
   to Theme settings' sub-caption in this story, and one more step in your manual test.
3. **Every door counts them now.** All three offer Clear on a remembered override too. Touches the panel row's and
   the `⋯` item's wording, which have frames (B1a, S6), so it is a design pass inside this story.

**Ruled:** _(awaiting the owner)_
