---
title: 'Story 5.12 — Site Remix'
type: 'feature'
created: '2026-09-20'
status: 'in-progress'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '0e5fe2e30ea545a092c98f20ba796d785408f0a0'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

A small **dice** now sits in the editor's top bar, next to the light/dark button — just the dice, no
words. Press it (or press `⇧R`) and a popup asks straight away whether you are sure: it says exactly what
will happen — every section on this page gets a different design from its own category, your words,
pictures and settings all stay — and offers **Cancel** or **Remix**. Cancel changes nothing. Press
**Remix** and the dice tumbles in 3D for about a second, and the page lands on its new designs as the
dice stops. One press of `⌘Z` (or the Undo arrow you already have) puts it all back exactly as it was.

**One thing to know before you test it.** The library still holds one design per category, so in your own
editor there is nothing for the dice to roll to yet — the popup will say so honestly rather than pretend.
You see the real thing work on the internal **Controls review** page, which has three sample designs
(your rulings R-158 and R-162).

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-D17's Site Remix is the product's play action — *"the one place in the editor where a big
button should feel like a slot machine"* (`B Missing Surfaces.dc.html:1622`) — and nothing of it exists.
`keymap.ts:103` carries `{ action: 'Site Remix', chips: ['⇧R'], story: '5.12' }` bound to nothing (R-145),
`EXPERIENCE.md:154` lists the surface with **`⇧R` as its only door**, and no frame anywhere draws the
control that opens it. Story 5.11 built the whole mechanism underneath — `ringFor`, `switchDesign`,
carry / park / default — for one section at a time; nothing re-rolls a canvas.

**Approach:** **One pure picker, one existing operation, one transaction.** `lib/remix.ts` decides *what
would move* — for each placed section, `shuffleTo` over that section's own ring (`lib/ring.ts`, Story
5.11) — and `editor.tsx` folds every pick into the canvas's doc through repeated `switchDesign` and
**one** `commit`, so a whole-page re-roll is one journal entry and one `⌘Z` (AD-15, AD-16, FR-D17's
single-step undo) with no new machinery. The door is the owner's dice: an icon-only control in the top
bar's right-hand cluster beside R-132's mode button, a CSS 3D cube. **The press opens the app's one confirm
dialog AT ONCE, and the cube rolls only on the confirmed Remix, with the canvas landing as it settles**
(R-164, owner, 2026-09-20 — this block amended on his instruction). `⇧R` calls the same handler.

## Boundaries & Constraints

**Always:**
- **Every re-roll obeys the ring, because it IS the ring** (FR-D17, FR-D13). A section is only ever
  replaced from `ringFor(entries, current)` — same category, same `bindingContext`, same `compileTarget`,
  same declared `surface` — so nothing here re-implements the partition rule and nothing can land a
  section on a resource its template does not have.
- **Nothing is lost.** Every pick goes through `switchDesign`, so carry / park / default and R-160's
  "a restored value wins over a carried one" are inherited, not re-decided. Content, items and `data` are
  untouched by construction (FR-G3).
- **One press, one undo** (FR-D17). The whole re-roll is ONE `commit` of ONE doc, therefore one journal
  entry, one `⌘Z` and one lit Undo arrow.
- **The dice never lies.** The confirm names the number of sections that would actually change, derived by
  counting rings (standing rule 4). Where no section can change, the dialog says so and offers **Close**
  alone (R-12's shape, as R-134 already answers an empty "Clear dark overrides").
- **Non-placeable treatments are never re-rolled** — `ringFor` returns `[]` for one, so they are skipped
  by construction, never by a second list.
- **Icon-only is paid for.** The dice carries its words as an accessible name and hover title through
  `DESIGN.md:534-536`'s carve-out, the one R-132, R-136 and R-159 already use.
- **Motion degrades.** `globals.css:255`'s reduced-motion block already flattens every transition in the
  app document; the re-roll therefore lands on the cube's `transitionend`, never on a timer, so a reader
  who asks for no motion waits for nothing. The confirm itself never waits on motion at all (R-164).
- **Every face is a different face** (R-164). Each pip is a gradient layer, and a layer sized to the whole
  face makes every percentage position resolve to the same point — so the size is set and the check
  **measures where the pips land**, never reads the rule back.
- **`⇧R` is a single-key binding** (R-145, WCAG 2.1.4): live only while the shell holds focus, inert with
  a caret in a field, and quiet while a dialog or popover is open — all three inherited from
  `shortcutFor` / `singleKeyOwned`, with no new guard.

**Ask First:**
- Any change to `undo()` / `redo()` restoring more than one doc. **R-161 refuses it for this story** — a
  re-roll that needs it has been mis-scoped.
- Authoring any design under `packages/library/designs/` (AD-35, R-158, restated by R-162).
- Any second Undo control (B8 draws one in its toast; R-143 put undo beside the save state on purpose).

**Never:**
- **No "Re-roll what" group.** Its two other values need Style Packs, and `lib/style-pack.ts:65` says in
  its own words that Paper is *"the only pack that exists today"*, with E6 owning the column and the
  editor neither reading nor writing it — so the group is ABSENT, not greyed (UX-DR3, R-118).
- **No "Keep Free designs only" tick-box** (UX-DR20, ruling R-77): Remix always re-rolls from the whole
  library and FR-L3's exit sheet is the mechanism.
- **No "Every page" scope.** FR-D17 re-rolls *the whole canvas*; B8's middle row is the frame's invention
  and nothing in the FR asks for it.
- **No toast.** EXPERIENCE.md:541 makes the section count a **polite** canvas-status announcement, and
  `#editor-said` is the editor's one live region.
- **No `data-*` written by Remix** — it swaps which design renders, exactly as FR-D19 separates the ring
  from every other control.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | Home holds 6 sections, each with a ring of 3+ | The press opens the confirm at once naming 6; **Remix** starts the roll and swaps all 6 to a *different* design each as it settles, one `commit`, one `⌘Z` restores every one | N/A |
| Cancel | Dialog open | Doc byte-identical, journal unchanged, Undo arrow unchanged, nothing rolled, focus returns to the dice | N/A |
| The question is never delayed | Dice pressed, or `⇧R` | The confirm is up inside 250ms — far less than the cube's own ~900ms — and the cube has **not** moved (R-164) | N/A |
| Six faces, six faces | The cube at rest | Face *n* draws *n* pips in *n* different places, measured where they land rather than read off the rule (R-164) | N/A |
| Mixed rings | 4 sections, 2 with a ring of 1 | Confirm names **2**; only those two move, the other two are untouched | N/A |
| Nothing to roll | Every ring length 1 (today's library) | Dialog says so in one sentence and carries **Close** alone; no doc write, no announcement | N/A |
| Empty canvas | Untouched / synthesized canvas, no stored instances | Same "nothing to remix" answer; AD-22's untouched state is never materialised by a Remix | N/A |
| `⇧R` in a field | Caret in a panel field or a `contenteditable` | The character `R` is typed; no roll, no dialog | `shortcutFor` returns null |
| `⇧R` with the dialog open | Dialog open | Nothing; the dialog owns the key | `singleKeyOwned` sees `dialog[open]` |
| Reduced motion | `prefers-reduced-motion: reduce` | Cube does not tumble and the confirmed re-roll lands at once, everything else identical | N/A |
| Re-press mid-roll | Dice or `⇧R` pressed while the confirmed roll is running | Nothing opens and nothing re-rolls twice — one roll, one re-roll, one `⌘Z` | guard on the rolling flag |
| Read-only session | 5.17's reader (not yet built) | Out of scope — the dice follows whatever gate 5.17 puts on every editing control | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/lib/ring.ts` -- **reuse, do not re-implement.** `shuffleTo(length, at, random)` is already
  "a DIFFERENT member of this ring, uniform, null where there is nowhere to go"; `ONE_DESIGN` is the
  sentence for a ring at its floor. Pure and importless on purpose (`node --test` cannot load a `.tsx`).
- `packages/library/src/placement.ts:119-164` -- `ringFor` / `samePartition`. Its own header already names
  **"5.12's Remix"** as a caller. Read-only this story.
- `packages/section-runtime/src/doc-edit.ts:83-112` -- `switchDesign(doc, instanceId, to, ring)`; its header
  names Site Remix as a caller. Pure, returns the next doc **or a refusal sentence**. Read-only this story.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- `ringOf` (`:401-407`),
  `apply`/`commit` (`:421-431`, `:1433-1450`), `onDesign`/`onShuffle` (`:1505-1535`), the `askFirst`
  dialog pattern (`:1537-1545`), `run(gesture)`'s switch (`:979-`), the top bar's right-hand cluster
  (`:1803-1812`) and `setSaid` (the `#editor-said` live region). **`commit(written, touched)` journals
  exactly one doc** — that is why the site-wide scope is Question 1.
- `apps/web/lib/journal.ts:83-135` -- `append` / `undo` / `redo`. **Read this before answering Question 1:**
  `Restore` is `{ journal, docKey, doc }`, one doc, and the header states "one transaction touches exactly
  one doc". `unsyncedEdits` already counts by `txn`, anticipating a transaction that writes two rows.
- `apps/web/lib/keymap.ts:103` -- the deferred row this story fills; `Gesture` (`:32-36`), `SINGLE_KEY`
  (derived), `shortcutFor`, `singleKeyOwned` (`dialog[open]` is already the guard).
- `apps/web/components/editor/mode-toggle.tsx` -- **the dice's nearest neighbour and its geometry**:
  `size-7 rounded-sm text-ink-soft hover:bg-paper-sunk ${ring}`, `onMouseDown` prevented so the press
  never steals the canvas's caret, words as `aria-label` + `title`.
- `apps/web/components/kit/dialog.ts` -- `sheet` (460px), `openOnCancel` (`data-cancel`), `closeOnBackdrop`,
  `title`. The app's one dialog vocabulary; a second one is forbidden.
- `apps/web/app/globals.css:255-263` -- the reduced-motion degrade that the roll inherits for free.
- `apps/web/app/(app)/app/harness/editor/page.tsx:49-85` -- the test mount. Its **Home doc really holds a
  ringed section** (one fixture design joins the pilots), so `pnpm keyboard` can walk a true re-roll on
  every commit.
- `apps/web/app/(app)/app/(authed)/controls/review.tsx` -- the deployed review page, already holding
  R-158's three-design ring and its own `onShuffle`. Question 2's option 1 mounts the dice here.
- `apps/web/tokens.test.ts:125` -- **no colour literal in any `.ts`/`.tsx` under `apps/web`**; the cube's
  pips are `var(--color-coral)` in `globals.css`.
- `packages/library/designs/` -- **every category there holds exactly one design** (executed 2026-09-20,
  `ls` over the directory, which IS the design list — `pilots.ts`'s `pilotIds`); the owner's project holds
  those same pilots (`tools/probe/seed-editor-project.mjs:30-32`). This is why Question 2 exists.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/lib/remix.ts` -- NEW, pure and importless (`ring.ts`'s precedent). `remixPicks(placed,
      ringAt, random)` → the `{ instanceId, from, to }` list, one `shuffleTo` per section, skipping every
      ring shorter than two (`from` rides along so the caller needs no second lookup); `remixable(placed, ringAt)` → how many *could* move; `REMIX_WORDS`
      (`'Site Remix — ⇧R'`), `remixAsk(n, canvas)` (what will happen, count derived), `NOTHING_TO_REMIX`
      (R-12's sentence) and `remixSaid(n, canvas)` (UX-DR12's polite line). No randomness of its own —
      `random` is handed in (AD-1), exactly as `shuffleTo` takes it.
- [x] `apps/web/remix.test.ts` -- NEW. The I/O matrix's rows over the pure module: every pick differs from
      the design it replaces, a ring of one is skipped, the count matches the picks, a seeded `random`
      is deterministic, and the sentences carry singular/plural.
- [x] `apps/web/components/editor/remix-dice.tsx` -- NEW. The icon-only button (ModeToggle's geometry,
      `REMIX_WORDS` as name and title), an 18px CSS 3D cube inside it, and the confirm `<dialog>` through
      `kit/dialog.ts` — title, `remixAsk`'s sentence, **Cancel** (`data-cancel`, focus opens here) and
      **Remix** in coral. Rolling is one state change: a new `transform` (a random face plus two whole
      turns) with the transition on it; the dialog opens in `onTransitionEnd` guarded to
      `propertyName === 'transform'`. Nothing to remix → `NOTHING_TO_REMIX` and **Close** alone.
- [x] `apps/web/app/globals.css` -- the cube's faces: `transform-style: preserve-3d`, six absolutely
      placed faces on `--color-surface` with a `--color-line` hairline, pips in `var(--color-coral)`, one
      `transition: transform 900ms` with a settling ease. Named rules beside `canvas-outline-*`, so no
      colour literal enters a `.tsx`.
- [x] `apps/web/lib/keymap.ts` -- `Gesture` gains `'remix'`; the `Site Remix` row gains
      `gesture: 'remix', keys: ['r'], shift: true` and **loses `story`**, so the `?` card lists it from the
      same table (R-145). Nothing else moves.
- [x] `apps/web/keymap.test.ts` -- `⇧R` resolves to `remix`, a bare `r` does not, `⇧R` with a caret in a
      field resolves to null, and the `?` card's rows now include it.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- `onRemix()`: `remixPicks` over
      the current canvas's placed sections, folded with `switchDesign` into ONE next doc and ONE `commit`,
      then `setSaid(remixSaid(...))`; a refusal sentence from `switchDesign` aborts the whole fold and
      writes nothing (FR-D9's "never half-applying"). Mount `<RemixDice>` as the **first** item of the
      right-hand cluster, left of `ModeToggle`, so its seat does not move on a Light-only project. Add
      `case 'remix'` to `run(gesture)` reaching the dice's own roll through a ref handle — the shape
      `confirm` and `layers.hide` already use — so the key and the button are one handler (R-141).
- [x] `tools/keyboard/journey.spec.mjs` -- the `⇧R` stop (R-146): press it on the harness canvas, the
      dialog opens with focus on Cancel, `Esc` leaves the doc untouched; press it again, confirm, and the
      ringed section's design changes with `#editor-said` naming the count; one `⌘Z` restores it. And with
      the caret in a panel field, `⇧R` types `R` and opens nothing.
- [x] `tools/probe/run-verify-editor.cjs` -- the deployed walk (R-82): the dice is in the top bar with its
      accessible name, the CSP session records no new violation, pressing it opens the dialog on Cancel,
      and on the real project the dialog carries `NOTHING_TO_REMIX` and no Remix button. `/harness/editor`
      still 404s in production.
- [x] `apps/web/app/(app)/app/(authed)/controls/review.tsx` -- **R-162:** mount the
      same `<RemixDice>` beside the page's heading over the page's own `ControlState`, and widen its
      existing key effect (`:251-272`, which already routes `[` and `]` through `shortcutFor`) to accept
      `remix` — never a second key table (standing rule 3).
- [x] `tools/probe/run-verify-controls.cjs` -- **R-162:** the dice on the deployed
      Controls review page really re-rolls the sample section through its ring, and `⌘Z`'s equivalent
      there (the page stores nothing) is out of scope — the ring's own arrows are the way back.

**Acceptance Criteria:**
- Given the editor on a canvas whose sections have rings, when I press the dice or `⇧R`, then the confirm
  opens **at once** on Cancel naming the exact number of sections that would change, and the cube has not
  moved (R-164).
- Given that dialog, when I press **Cancel**, `Esc` or the backdrop, then the doc, the journal and the
  Undo arrow are unchanged, nothing has rolled, and focus returns to the dice.
- Given that dialog, when I press **Remix**, then the cube rolls and, as it settles, every countable
  section changes to a different design of its own ring, every content prop and control value survives
  (carry / park / default), `#editor-said` announces the count, and **one** `⌘Z` restores the canvas
  exactly. A press landing while the cube is still in the air opens nothing and re-rolls nothing.
- Given a canvas where no ring is longer than one, when I open the dialog, then it says so in one sentence
  and offers **Close** alone — nothing is greyed and nothing is written.
- Given the cube at rest, when its faces are measured, then face *n* draws *n* pips in *n* different
  places — the check computes where each pip lands rather than reading back the rule that placed it (R-164).
- Given `prefers-reduced-motion: reduce`, when I press the dice, then the confirm opens as it always does,
  the cube does not tumble, and a confirmed Remix lands immediately.
- Given the `?` shortcuts card, when I open it, then **Site Remix `⇧R`** is listed — it was deliberately
  missing until today (R-145).
- **Matches the frame:** the confirm is `B Missing Surfaces.dc.html` **B8 as re-specified** — its heading
  glyph, its sentence, its coral primary and its "one undo, always available" line — without the
  "Re-roll what" group (one Style Pack exists, R-118), without "Every page" (FR-D17 re-rolls the canvas)
  and without the toast (EXPERIENCE.md:541 makes the count a polite announcement). The dice itself has no
  frame: it is extrapolated from the control it sits beside, `mode-toggle.tsx` (R-74, R-163).

## Design Notes

**Why one `commit` and not one per section.** `commit(written, touched)` journals `{ docKey, before, after }`
for one doc, so a fold that commits per section would write N journal entries and cost N `⌘Z` presses —
FR-D17's single-step undo would be false. Folding every pick into one next doc and committing once makes
the whole re-roll one entry, and FR-D9's "never half-applying" is then one check before one assignment:

```ts
let next = docs[canvasKey] ?? EMPTY_DOC
for (const p of picks) {
  const written = switchDesign(next, p.instanceId, p.to, ringOf(p.from))
  if (typeof written === 'string') return        // nothing written at all
  next = written
}
commit({ ...docs, [canvasKey]: next }, canvasKey) // ONE entry, ONE ⌘Z
```

**Why the question comes first and the roll second (R-164).** The first build rolled on the press and opened
the confirm when the die settled, which put ~900ms between the press and the question — and animated a
decision that had not been taken yet. The owner turned it round on 2026-09-20: the press asks, and the roll
is what *confirming* looks like. It is also the better metaphor, which is what FR-D17 asked for — you pull
the handle, the die runs, and the result is there when it stops.

**Why the re-roll lands on `transitionend`.** `globals.css:255` forces every transition to `0.01ms` under
reduced motion, so `transitionend` fires at once there and after the roll otherwise — one code path, no
timer to keep in step with the CSS, and no `setTimeout` that a reduced-motion reader would still wait out.
Guard on `propertyName === 'transform'`, because a transition list fires once per property.

**Why the pips need `background-size`, and why the check measures rather than reads.** Each pip is a
gradient LAYER positioned in percentages, and a layer defaults to `background-size: auto` — the whole 18px
face. A percentage `background-position` resolves to `(container − layer) × pct`, so at that size every pip
resolved to `0` and **all six faces drew one centred dot**. It shipped, the deployed probe passed it, and
the owner caught it by looking: the probe asserted the computed `background-image` string — the very rule it
had been handed — and never where the pips landed. Sizing the layer to 5px is the fix; computing each
layer's centre from the box and the layer is the check that cannot pass on a collapsed face again.

**Why the dice leads the cluster rather than following the sun.** `ModeToggle` is not rendered at all on a
Light-only project (R-135), so a dice placed after it would move on some projects and not others. First in
the cluster, its seat is the same everywhere — and it is still "next to the dark mode button" wherever
that button exists.

**What the owner asked for, in one line each.** A dice and nothing else — no label, no chip, no second
control. It rolls and rotates like a real dice — six faces in 3D, not a flat glyph spinning. Smooth and a
bit slower — ~900ms with a settling curve rather than the app's usual 160ms. Branding — the app's paper
surface, its hairline and its coral for the pips, which is also B8's own "the only surface in Part B that
uses a coral primary".

## Verification

**As built.** Three departures from the spec's letter, each for a mechanical reason:
- **`remixable` IS `remixPicks`, counted** — handed a constant `random` rather than a source of entropy. The
  spec asked for "how many *could* move" as its own function; two functions counting the same thing is how a
  dialog comes to say six and move five (standing rule 4). The draw cannot change the count, because
  `shuffleTo` answers null on exactly the rings `remixPicks` skips.
- **A section whose ring does not hold its own design is skipped too.** `ringFor` answers `[]` for a
  non-placeable treatment, which the spec names — but it also answers a ring WITHOUT the instance's design when
  the library no longer holds it, and `shuffleTo` is handed `at = -1` there. Both are one condition, not two.
- **The confirm returns focus to the dice, and it is SAID rather than left to the user agent** (found at this
  run's matrix audit, and fixed). A modal `<dialog>` restores focus to whatever held it when `showModal()` ran,
  and `onMouseDown` is prevented on the dice (ModeToggle's rule, so the press never steals the canvas's caret) —
  so a MOUSE-opened confirm never focused the button, and Cancel restored focus to the canvas, or to `<body>`
  where nothing had focus yet. The matrix's Cancel row says "focus returns to the dice"; `onClose` now does it.
  **Proved by control:** with the one line removed, `pnpm keyboard`'s stop 30 fails on that assertion alone
  (`expect(#editor-remix).toBeFocused()`), and passes with it.

**Two matrix rows had no behavioural stop until this run**, and both now have one in `tools/keyboard/journey.spec.mjs`:
*"`⇧R` with the dialog open"* (the dialog owns the key — `remix` is a `SINGLE_KEY`, so `onShortcut`'s owner
selector is `:popover-open, dialog[open]`) and *"re-press mid-roll"* (the second press lands while the cube is
still in the air, so `dialog[open]` is not yet there to refuse it and the guard that holds is the dice's own
rolling flag — without it the second `transitionend` calls `showModal()` on an open dialog, which throws).

**Run at Dev (2026-09-20), locally and against the deployed build `a440621f` — every gate green:**
- `pnpm check` — **exit 0**. Lint, typecheck and every package test, `apps/web`'s **436 tests, 0 fail** among
  them, with `remix.test.ts`'s rows and `keymap.test.ts`'s `⇧R` row in that run. The run prints its own count.
- `pnpm keyboard` — **34 stops, 0 fail**, six of them this story's: `⇧R` rolling the dice and opening the
  confirm on Cancel with the count derived and no tick-box anywhere in it; a second `⇧R` with the dialog up
  changing nothing; Esc returning focus to the dice and leaving the doc, the counter and `#editor-said`
  exactly as they were; a re-press mid-roll giving one roll and one dialog; Remix re-rolling the canvas with
  the count announced politely and **one** `⌘Z` restoring it; a capital R typed into a panel field rolling
  nothing; and reduced motion flattening the roll with the confirm still opening on the transition.
- `node --test apps/web/remix.test.ts apps/web/keymap.test.ts` — **19 tests, 0 fail**.
- `python3 tools/doc-audit.py --check` — **exit 0** (run twice; the sub-tools regenerate on the first).
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT` by name) — production
  `dpl_AJPwq9ZxiQv6PtsMYGXgsczBTmqc`, `readyState: READY`, `githubCommitSha` `a440621f`, serving
  `app.inflozo.com`. CI green on both pushes.
- **Deployed `/controls`** — `node tools/probe/run-verify-controls.cjs` (**Supabase**, `SUPABASE_URL` +
  `SUPABASE_SECRET_KEY`): **0 FAIL, 109 PASS**, accounts `13 → 13`. Seven of them this story's, over R-158's
  three-design ring — the only ring in the repository, which is why R-162 put the dice here: the dice is beside
  the heading, icon-only, its words its accessible name AND its hover title, and it is a real six-faced cube;
  the roll opens the confirm on Cancel naming *"Re-rolls 1 section on the sample …"* with a coral Remix beside
  it and **no choices at all** in the sheet; B8's "one undo, always available" line is **absent** here rather
  than printed as a lie, because this page saves nothing; Cancel leaves the sample at `2 of 3`; **Remix really
  re-rolls it** — `2 of 3 → 1 of 3`, a different design drawing it with the typed words carrying word for word
  (FR-D19, FR-G3); `⇧R` opens the very same confirm; and with the caret in the Heading field `⇧R` types a
  capital R and rolls nothing. axe-core WCAG 2.1 AA is **zero** at 1440 and 390 with the dice mounted.
- **Deployed editor** — `node tools/probe/run-verify-editor.cjs` (**Supabase** + **Vercel**, the four variables
  by name): **0 FAIL, 464 PASS**. Step 88 is this story's eight: the dice is in the top bar and **leads** the
  right-hand cluster ahead of the sun, icon-only with `Site Remix — ⇧R` as its name and its title; it is a real
  cube — six faces, `preserve-3d`, pips drawn in `rgb(255, 89, 65)`, the coral the token layer names; pressing
  it rolls it and opens the one confirm on Cancel; on the owner's own project the dialog reads
  *"Every section here is the only design its category has so far, so there is nothing to remix yet."* and
  carries **Close alone** with **nothing greyed** (R-12, R-158); no "Re-roll what" group, no "Every page" and no
  header-and-footer tick-box (R-161); Close leaves the doc, the journal and the announcement untouched; `⇧R`
  opens the very same confirm; and **with a real caret in a headline on the canvas `⇧R` types a capital R and
  rolls nothing** — the owner's own most important step. Steps 46 and 53 now read the dice as the cluster's
  head on a dark-enabled AND a Light-only project (R-135's reason for putting it first); step 72's Tab walk
  carries `BUTTON#editor-remix[Site Remix — ⇧R]` in its one canvas stop. Step 5's scripted session records
  **zero** `securitypolicyviolation` events in either document with the roll and the confirm in it, and step
  8's axe is **zero** at every state.
  *(One earlier attempt died at step 53's soft navigation with **0 FAIL and 492 PASS** — DW-204's exact shape,
  the same step and the same count Story 5.11 recorded twice. A HARNESS ERROR with no FAIL is not a result
  (standing rule 2), so it was re-run rather than debugged, and the run above is the one that completed.)*

**Not hit by this story, and not claimed:** Resend, Dodo and the Ghost test servers T1/T3. Nothing here sends
mail, takes a payment or reads a Ghost — Remix swaps which design renders inside the editor's own doc. No file
under `supabase/migrations/` is in this story's diff, so there is no Schema phase (R-99).

**Commands:**
- `pnpm check` -- expected: lint, typecheck and every package test green, `remix.test.ts` and
  `keymap.test.ts` included, and `pnpm keyboard`'s journey green with its new `⇧R` stop.
- `node --test apps/web/remix.test.ts` -- expected: every I/O matrix row passes.
- `node tools/probe/run-verify-editor.cjs` -- expected: 0 FAIL on the **deployed** editor
  (`app.inflozo.com`), including the dice's presence, its accessible name, the dialog opening on Cancel,
  the honest "nothing to remix" sentence on the real project, zero CSP violations and `/harness/editor`
  still 404.
- `node tools/probe/run-verify-controls.cjs` -- expected: 0 FAIL on the deployed `/controls`, with the
  re-roll proved over R-158's three-design ring (R-162).
- `python3 tools/doc-audit.py --check` -- expected: exit 0.

**Manual checks (if no CLI):**
- The cube's faces read as a die at 18px on a 1440 screen — pips legible, no seam, no flicker at the
  landing.

## Owner's manual test

Do this on the real site after Deploy confirms the URLs. Use the **Pilot sections** project — the one
seeded to your account at Story 5.1.

1. **URL:** `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` · **Screen:** the
   editor, on Home. Look at the top right of the bar, just left of the sun. **Expect:** a small **dice** —
   the dice alone, no words and no box around it. Rest the pointer on it: a label reads **"Site Remix —
   ⇧R"**.
2. **URL:** the same · **Screen:** the same. **Press the dice.** **Expect:** a popup appears **straight
   away** — no waiting and nothing spinning first. The dice only rolls once you say Remix.
3. **URL:** the same · **Screen:** the popup. Read it. **Expect:** it tells you plainly what Remix would
   do and — because every category in the library still holds one design — it says there is nothing to
   remix yet, and the only button is **Close**. This is the honest answer, not a bug: there is nowhere for
   your sections to roll to until Epic 9 fills a category.
4. **URL:** the same · **Screen:** the editor. Press **`⇧R`** on the keyboard (Shift and R together).
   **Expect:** exactly the same dice roll and the same popup — the key and the dice are one control.
5. **URL:** the same · **Screen:** the editor. Click into any text field in the right-hand panel and type
   `R` with Shift held. **Expect:** a capital **R** appears in your text and **no dice rolls**. This is the
   most important step on this list.
6. **URL:** the same · **Screen:** the editor. Press **`?`**. **Expect:** the keyboard card now lists
   **Site Remix `⇧R`**. It was deliberately missing until today.
7. **URL:** `https://app.inflozo.com/controls` · **Screen:** the **Controls review** page — an internal
   page we use to check the editor's parts, not a customer screen. **Expect:** the same dice at the top of
   the page, beside the **Controls review** heading (R-162).
8. **URL:** `https://app.inflozo.com/controls` · **Screen:** the same. Type something you will recognise
   into the sample section's heading, and set **Card tint** to *Strong* in the panel. Then **press the
   dice** and, this time, press **Remix** in the popup. **Expect:** the popup closes, **the dice tumbles
   in 3D for about a second**, and the sample section **changes shape as the dice stops**. Your heading
   text is still there word for word, and the settings the new design also has kept their values.
8a. **URL:** the same · **Screen:** the same. Look closely at the dice as it turns, or press it and look
   at it sitting still. **Expect:** the faces carry **different numbers of dots** — one, two, three and so
   on, in a real dice pattern. Until today every face drew a single dot in the middle; you spotted it, and
   this step is here so it cannot come back (R-164).
9. **URL:** `https://app.inflozo.com/controls` · **Screen:** the same. Press the dice again and this time
   press **Cancel**. **Expect:** nothing at all changes — the sample is exactly as you left it.
10. **URL:** the same · **Screen:** the same. To get back to where you started, use the **◀ ▶** arrows on
    the sample's own pill. **There is no Undo on this page** — it is an internal page that saves nothing,
    so it has no history to step back through. The *"one press of `⌘Z` puts it all back"* promise is
    checked automatically on every commit, and you will see it with your own hands in the editor the day a
    category has more than one design.

## Questions for the owner

### Question 1 — should the dice also re-roll the header and the footer?

Your header and footer are shared: they are the same section on every page of the site. The requirement we
wrote months ago says Remix leaves them alone **unless you deliberately include them**, which would mean a
tick-box in the popup reading *"Include the header and footer"*, switched off.

**An example.** You are on Home and you press the dice. With the box off, the six sections in the middle of
the page get new designs and your header stays exactly as it is. With the box ticked, the header and footer
are re-rolled too — and they change on every page of the site at once, not just this one.

There is a real cost on one side. Undo currently puts back **one page** per press. Including the header
means a single Remix touches two pages at once, so undo has to learn to put back both in one press, or the
promise *"one undo, always"* stops being true. That is a change to the part of the editor that protects
your work, and today it cannot be tested either way, because your header category also holds only one
design.

1. **Leave the header and footer alone in this story (RECOMMENDED).** The dice re-rolls the page you are
   looking at, the popup is the plain yes/no you asked for, and undo stays exactly as safe as it is now.
   The tick-box lands in the story that first has a header with more than one design to prove it on.
2. **Build the tick-box now**, and change undo so one press puts back both pages. Closest to the original
   requirement; it touches the safest part of the editor to add something neither of us can test yet.
3. **Always include the header and footer**, with no tick-box. Simplest popup of all, but it means one
   press changes every page of your site at once with no way to ask for less.

**Ruled: option 1 (owner, 2026-09-20).** *"Leave the header and footer alone in this story … undo stays
exactly as safe as it is now."* Recorded as **R-161**. The dice re-rolls the current canvas's doc alone, in
one `commit`, so the re-roll is one journal entry and one `⌘Z` and `journal.ts` is untouched by this story.
B8's *"Include the header and footer"* tick-box is **absent, not greyed** (UX-DR3, R-118), and so is its
"Every page" row. The tick-box — and the `txn`-grouped undo it needs — land in the first story with a
site-wide ring to prove them on.

### Question 2 — where should you be able to actually watch a Remix happen?

Same problem you ruled on at Story 5.11: the library holds one design per category, so in your own editor
the dice has nothing to roll to. Everything will work the day Epic 9 fills a category, but you would be
testing an absence today rather than the thing itself.

**An example.** You press the dice on Home. All six sections are the only design their category has, so the
honest answer is "nothing to remix yet" — you would never see a page actually change, and would have to
take our word that it works.

The internal **Controls review** page already has three sample designs and working arrows, from your ruling
R-158. Putting the dice there too costs about an hour.

1. **The editor and the Controls review page (RECOMMENDED).** In your editor you check the dice, the roll,
   the popup and `⇧R`; on the Controls review page you press the dice and **watch a section actually change
   design**, with your typed words carrying and one `⌘Z` bringing it back. Steps 7–10 of the test above.
2. **The editor only.** You see the dice, the roll and the honest popup; the re-roll itself is proved by
   automated tests alone, and the first time you see a page change is when Epic 9 lands a second design.
3. **Author a second design for one pilot category first**, so your own editor really remixes. This
   reverses R-158 and is a category story's work (Epic 9), which would hold up this story and the two
   after it.

**Ruled: option 1 (owner, 2026-09-20).** *"The editor and the Controls review page."* Recorded as
**R-162**. The dice, its roll and its confirm are mounted in both places — over the editor's docs in the
top bar, and over `/controls`'s own `ControlState` beside that page's heading. R-158 stands: no design is
authored in `packages/library/designs/`. Steps 7–10 of the owner's test are therefore live, and the
`review.tsx` and `run-verify-controls.cjs` tasks are in scope rather than conditional.

### Question 3 — what should the dice look like, exactly?

No drawing exists for it: the design export never drew *any* button for Site Remix — the keyboard shortcut
was its only door — so this is genuinely yours to choose. Your standing rule (R-92) is that a picture the
export does not draw is either drawn properly in the design tool or is a Tabler icon **you name**; you have
made that exception twice before (R-130's "empty" circle, R-142's five save-state icons).

**An example.** At 18 pixels across, sitting beside the sun, one of these is a tiny tumbling block with
coral dots, and the other is a line-drawn dice picture that spins flat like a coin.

1. **A real little cube (RECOMMENDED).** Six faces in 3D, coral pips on the app's paper white with our
   hairline edge, tumbling for about a second and settling on a face — what you described, and it uses our
   own colours rather than borrowing anyone's drawing.
2. **A flat Tabler dice icon that spins.** Cheaper and unmistakably a dice at small sizes, but it spins in
   the plane of the screen rather than tumbling — less like a real dice than option 1.
3. **Neither yet — have it drawn in Claude Design first**, and build it from the drawing. Most faithful to
   R-74, and it costs a design session before this story can finish.

**Ruled: option 1 (owner, 2026-09-20).** *"A real little cube. Six faces in 3D, coral pips on the app's
paper white with our hairline edge, tumbling for about a second and settling on a face."* Recorded as
**R-163**, and it is **R-92's third stated exception** — the first two (R-130, R-142) admitted a Tabler
path he named; this one admits a drawing of our own in token colours, because no icon set has a tumbling
die. No hex enters a `.tsx` (`tokens.test.ts:125`): the faces and pips are `var(--color-surface)`,
`var(--color-line)` and `var(--color-coral)` in `globals.css`.
