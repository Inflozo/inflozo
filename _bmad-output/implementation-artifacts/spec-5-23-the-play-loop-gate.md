---
title: 'Story 5.23 — The play-loop gate'
type: 'feature'
created: '2026-09-27'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '3361bb6aef749d5a0d559ba976133e3535b717fc'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Nothing new is drawn on your screen: this story adds the automatic check behind Inflozo's central promise — shuffle and
remix as much as you like, and nothing you typed or set is ever lost. On every change we push, a 40-section page is
shuffled twenty times and then remixed, and every word, picture, list and setting must still be there; with Question 1's
recommended fix, a design you go back to also looks exactly as you left it, which today is not always true (you can see
it on the Controls review page). Making the editor fast enough on very big pages — it currently freezes for about half a
second per design change on a deliberately slowed computer — is Question 2's new story, not this one.

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
- **The 60 fps half cannot pass today.** Every design change or move repaints all 40 sections (Question 2).

**Approach** (written for the recommended answers; Questions 1–3 are open):

- **One pure gate, `apps/web/play-loop.test.ts`, inside `pnpm check`.** It builds the 40-section stress fixture from the
  library, plays 20 Variant Shuffles and a full Site Remix through the editor's own functions for every seed, and asserts
  zero loss, the round trip, the partition and its own controls.
- **Every design remembers itself** (Question 1, option 1). Leaving a design records all of its values against it, and
  a return restores them exactly. A first visit still carries and defaults (FR-D19). Clear dark overrides also clears
  what is remembered.
- **The 60 fps work is its own story, 5.23a** (Question 2), and Epic 5's orphaned ledger entries go to a sweep story
  (Question 3). No migration, so no Schema phase.

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

- Any change to what a FIRST visit carries or defaults (FR-D19's three arms), or to R-160 beyond "a return is exactly as
  it was left".
- Anything in the render or paint path.

**Never:**

- **Never author a shipped design** (AD-35, R-158). The ring is `packages/library/fixtures/controls/`, and the decoy is
  an in-memory entry, never a file.
- **Never a new doc field or a migration.** What a design remembers uses the existing `parkedControls` shape.
- **Never measure frames or add a browser check here.** That is Question 2's story.
- **Never edit the design export.**

## I/O & Edge-Case Matrix

Rows marked ¹ hold only if Question 1 is ruled option 1.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| The session | 40-section Home, 20 Shuffles across its ringed sections, then a full Remix, every seed | Every content prop, list item, data value, name, hidden flag, audience and main-feed flag exactly as before; every control value and dark override that was held is still held, live or remembered | A failure names its seed and section |
| Back to the start ¹ | After the session, each section switched back to the design it started on | Its controls and dark overrides exactly as at the start | N/A |
| Away and back | Sample 1 with Card tint Strong (dark: Soft) → sample 2 → sample 1 | Absent on sample 2 and remembered against sample 1; back on 1, Strong and Soft, and sample 1's record cleared | N/A |
| Round the ring ¹ | Sample 1 with Show icons Off and Image position Side, then `]` three times | Back on sample 1: Off and Side. As built today: On and Top | N/A |
| Changed on the way ¹ | Sample 1 at Columns 4; ▶, set Columns 2 on sample 2; ◀ | Sample 1 shows 4, as left (R-160); ▶ again shows 2 | N/A |
| First visit | Sample 1 → sample 3, never visited | Shared settings carry; Stacking takes its default | N/A |
| Partition | A decoy `controls` design compiling to `post.hbs` in the library | Never in a ring, never landed on | N/A |
| Ring of one | Every pilot section | Never moves | N/A |
| Site-wide | a1/1 in the site doc | Byte-identical after the session (R-161) | N/A |
| Clear ¹ | A section with a remembered dark override; Clear dark overrides by row, ⋯ or Theme settings; back to that design | No dark override comes back | N/A |
| Controls | A switch that drops remembered records; a ring that ignores the partition; ¹ the rule as built at 5.11 | Each is reported by the check it targets | A control that passes fails the gate |

</frozen-after-approval>

## Code Map

- `packages/section-runtime/src/controls.ts:552-612` -- `switchControls`, the one rule (carry, park, default, R-160),
  and ¹ the change. `declared()` (:92-108, not exported) adds the three universals; `UNIVERSAL_CONTROLS`
  (`packages/library/src/vocabulary.ts:300`) names them for the gate.
- `packages/section-runtime/src/doc-edit.ts:96-113` -- `switchDesign`, which Shuffle and Remix call. `:141-148`
  `clearDarkOverrides` serves both Clears; ¹ it also empties remembered dark maps.
- `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts:114` -- the project-wide Clear skips a section with
  no live override; ¹ it must also visit one whose records hold one.
- `packages/section-runtime/src/controls.test.ts:776-870` -- the rule's tests. Several assert `parkedControls` is `{}`
  after a switch (¹ update); the 1 → 2 → 3 → 1 test (:825) carries only tint and rule, so it cannot see the gap.
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
- `tools/keyboard/journey.spec.mjs:989-1013` -- the FR-D19 stop (tint round the ring); ¹ gains Image position.
- `tools/probe/run-verify-controls.cjs:~560-570` -- the ring walk's long way round on production; ¹ gains a shared
  control. Its catalogue row is in `tools/doc-audit.py:546`.

## Tasks & Acceptance

**Execution:**

- [ ] `apps/web/play-loop.test.ts` -- NEW: the fixture, the session per seed, the checks and the controls in Design
  Notes -- FR-D17's gate, on every commit.
- [ ] `packages/section-runtime/src/controls.ts` -- ¹ `switchControls` becomes Design Notes' rule, and its comment says
  so -- R-160 in every case, not one.
- [ ] `packages/section-runtime/src/doc-edit.ts` -- ¹ `clearDarkOverrides` also empties `darkOverrides` in the
  section's records -- a cleared section never gets one back.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts` -- ¹ the project-wide Clear also visits a
  section whose records hold a dark override -- same.
- [ ] `packages/section-runtime/src/controls.test.ts`, `packages/section-runtime/src/doc-edit.test.ts` -- ¹ update the
  record-shape assertions; add round the ring with Show icons and Image position, changed on the way, and the Clear --
  the rule's own tests.
- [ ] `tools/keyboard/journey.spec.mjs` -- ¹ the FR-D19 stop also sets Image position on sample 1 and reads it after
  the wrap; run it once on the baseline and record it failing -- the browser's view of the fix.
- [ ] `tools/probe/run-verify-controls.cjs`, `tools/doc-audit.py` -- ¹ the long-way-round step also carries Image
  position; the row's prose says so -- R-82 on production.

**Acceptance Criteria:**

- Given the 40-section fixture, when the gate plays 20 Variant Shuffles across its ringed sections and then a full Site
  Remix of Home for every seed, then no content prop, list item, data value, name, hidden flag, audience or main-feed
  flag changes, and every control value and dark override held before is still held — zero loss.
- ¹ Given the same session, when every section is switched back to the design it started on, then its settings, light
  and dark, are exactly as they started.
- Given a design carrying a control the next design does not declare, when the section is shuffled away and back, then
  the value is restored exactly and its record is cleared.
- ¹ Given any design of the ring, when `]` goes round the whole ring back to it, then it is exactly as left — in the
  gate and in the keyboard journey.
- Given every move of every session, then each lands inside its section's `ringFor` partition, the decoy is never
  landed on, a ring of one never moves, and the site doc is byte-identical.
- Given each control, when the gate's checks run over it, then the check it targets fails.
- ¹ Given a section with a remembered dark override, when Clear dark overrides runs (the row, the ⋯ item or Theme
  settings) and the section returns to that design, then no dark override comes back.
- Given the editor and `/controls`, then nothing is drawn differently from what 5.11 built from B1a, S4b and S6.
- Given the deployed `/controls`, when the owner walks `## Owner's manual test`, then every step holds (R-80).
- Given the change, then `pnpm check` and `pnpm keyboard` are green and CI publishes.

## Spec Change Log

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
- *The paint (input for Question 2).* A production build of the harness, Home at 40 sections by a temporary header,
  since reverted. One design change (`]`) is one long task of 131–138 ms at 1× and 492–512 ms at 4× CPU throttle; a move
  (⌥↓) is 130 ms and 436 ms; a control change is none, because `onChange` stamps one root (`editor.tsx:3780-3801`). The
  cause is `apply` → `paint()`, which renders every section and rewrites `#canvas` (`editor.tsx:2199-2310`).
  - The rAF p95 reads 16.6–16.8 ms on smooth windows at 60 Hz. The frame criterion therefore needs a definition that
    counts dropped frames, not 0.1 ms of timestamp jitter.
  - Where a ring exists (the harness) is where Shuffle can be traced: on production every ring is one design.

**The rule for Question 1's option 1:**

```
leaving `from`:  record = every live value `from` declares, in controls and in darkOverrides
                 parked[from] = record, or delete parked[from] when it is empty
                 remove from the live maps what `to` does not declare
arriving at `to`: if parked[to] exists, for every name `to` declares:
                    take it from parked[to]; if parked[to] lacks it and `from` declares it, remove it (default)
                  delete parked[to]
```

A first visit still carries what both designs declare and defaults what only `to` declares (FR-D19). A name neither
design declares stays where it is (`controls.test.ts:842`). The doc gains at most one record per design visited per
section, in the existing shape, so there is no migration.

**The gate.**

- **The library** is what the harness assembles: the placeable pilots, `samples()` and `paywallSamples()`, plus one
  decoy. The decoy is an in-memory copy of a sample with a free id in `controls` and `compileTarget: ['post.hbs']`, so a
  wrong partition rule has something to land on.
- **The fixture.** Home's 40 instances cycle `offeredOn(entry, 'home.hbs')`, and the site doc holds `a1/1`. Each
  instance's content is its category's default with every text prop made unique to the section. Every declared control
  and universal gets a non-default offered value, and every `darkOverride` control a dark value different from its
  light one. One ringed section is hidden and one has a non-default audience. `controls/1`'s `latest` query stores a
  `data` value. Both docs are run through `designate` and `parseDoc`.
- **Each seed (1 to 100)** plays 20 Shuffles, each on a random section whose ring holds two or more, then one Remix of
  Home. Every move is recorded.
- **The checks.** Everything but `designId` and the three control maps is deep-equal to the start. Every (map, name,
  value) stored at the start is still stored, live or in a record. ¹ Switched back to its first design, each section is
  exactly as it started. Every move satisfies `samePartition` and `isPlaceable`, and the decoy is never a target. The
  site doc and the pilots never change. The docs still parse.
- **Two more tests.** Away and back uses a pair derived from the declarations, never hard-coded names. ¹ The wrap is
  `step` round the ring from every design.
- **The controls.** A switch that drops `parkedControls` must fail the stored-value check. A ring that is only "same
  category" must land on the decoy. ¹ The rule as built at 5.11, kept in the test as a named control, must fail
  back-to-the-start.

**Routine calls.** The gate lives in `apps/web` because core packages may not read files or use `Math.random`. It runs
100 seeds. For Question 2's measurement, this computer at 4× throttle stands in for NFR-1's reference laptop: a 2015
desktop processor is slower per core than a current mid-tier laptop, so a pass here is the harder test, and Story 15.4
runs the release gate.

**Deferred work.** None of the nine entries that name this story is its to build, because it has no screen and no
screen-reader walk:

- DW-205 → Story 15.2, whose manual screen-reader pass checks the live region.
- DW-211 and DW-214 → Story 9.1, the first shipped ring.
- DW-212 → the first Epic 9 story that ships a `data-items-limit`.
- DW-215 → Story 5.23a, Question 2.
- DW-188, DW-207, DW-219 and DW-220 → the Epic 5 sweep, Question 3.

## Verification

**Commands:**

- `cd apps/web && node --test play-loop.test.ts` (Node 24) -- expected: every seed passes and every control is reported
  failing inside the test. ¹ Run once on the baseline rule first: back-to-the-start fails and names seeds. Record both
  runs.
- `pnpm check` -- expected: exit 0.
- `pnpm keyboard` -- expected: 0 failed. ¹ The FR-D19 stop with Image position fails on the baseline and passes after;
  record both runs.
- `git diff --stat 3361bb6aef749d5a0d559ba976133e3535b717fc HEAD -- supabase` -- expected: empty (no Schema phase).

**Manual checks (R-82, after CI publishes):**

- The GitHub Actions run for HEAD (`check`, `rls`, `deploy`) is green and the Vercel deployment is READY at HEAD, read
  with `GITHUB_TOKEN` and `VERCEL_*` from `tools/probe/.env`.
- ¹ `env $(grep -E '^SUPABASE_(URL|SECRET_KEY)=' tools/probe/.env | xargs) node tools/probe/run-verify-controls.cjs`
  against `https://app.inflozo.com`: the ring walk's new step passes with 0 FAIL, the throwaway account is deleted, and
  the user count is unchanged.

## Owner's manual test

Only if Question 1 is ruled option 1; otherwise this story has no test for you. Deploy confirms the address.

1. **URL:** `https://app.inflozo.com/controls` · **Screen:** Controls review, the internal page with the three sample
   designs. **Do:** nothing yet. **See:** the sample on the left, its panel on the right, and the Design block reading
   **1 of 3**.
2. **URL:** `https://app.inflozo.com/controls` · **Screen:** the same. **Do:** in the panel set **Show icons** to *Off*,
   **Image position** to *Side*, **Card tint** to *Strong* and **Columns** to *4*. **See:** the sample redraws each time.
3. **URL:** `https://app.inflozo.com/controls` · **Screen:** the same. **Do:** press **▶** three times: 2 of 3, 3 of 3,
   then back to 1 of 3. **See:** back on sample 1, all four read as you set them — Off, Side, Strong and 4. Before this
   story, Show icons and Image position came back On and Top.
4. **URL:** `https://app.inflozo.com/controls` · **Screen:** the same. **Do:** press **▶** once to sample 2, set
   **Columns** to *2*, then press **◀**. **See:** sample 1 shows Columns **4**, as you left it (R-160). Press ▶ again:
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

**Ruled:** _(awaiting the owner)_

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

**Ruled:** _(awaiting the owner)_

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

**Ruled:** _(awaiting the owner)_
