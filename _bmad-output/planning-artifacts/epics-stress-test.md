# Step 6 stress test — the epics and stories

**Run 2026-09-04, immediately after step 6 wrote `epics.md`, at the owner's instruction.**
Scope: the story decomposition only. **The requirements underneath it were already stress-tested four times**
(Rounds 1–4, on the PRD and the architecture), so this pass did not re-test them. A decomposition has its own
narrow risk profile — not *"is this requirement wrong"* but **"what got dropped between the PRD and the story
list"** — and all four dimensions below were chosen to hunt exactly that.

**Method.** Executed against `epics.md` by script wherever a check could be executed, by hand where it could
not. **Two script results were discarded because their control did not pass** — a build-pattern that matched no
story reported "nothing builds the edit lock" and "nothing builds the compiler", both false; Stories 5.17 and
7.1 build them. Re-run with titles included, both cleared. *A result whose control did not pass is not a result.*

---

## Verdict

**Five findings. All five are closed.** Three were structural gaps that would have surfaced months into the
build; one was an over-specified verification; one is an accepted risk with a named calibration point.

| | Finding | Severity | State |
|---|---|---|---|
| **F0** | **Three of the four NFR-6 quality layers had no story that builds them** | **critical** | fixed |
| **F1** | Story 6.5 verified on T1/T3, three epics before a compiler exists | moderate | fixed |
| **F2** | The canvas renders "in the project's Style Pack" three epics before one is authored | **high** | fixed |
| **F3** | Three editor/compiler surfaces select from design sets that arrive in E10, undeclared | moderate | declared |
| **F4** | A category's first story does strictly more work than the rest | accepted | named, with a calibration point |

---

## F0 — the harnesses every owner gate depends on had no owner *(critical)*

**Found by:** counting, for each quality layer, how many stories *depend* on it against how many *build* it.

| Layer | Stories depending on it | Story building it, before the fix |
|---|---|---|
| NFR-6(a) render matrix | 161 references | **none** |
| NFR-6(b) compile CI | every one of the 33 gates | **none** |
| NFR-6(c1) compiled-output snapshots | 3 | E4 — Story 4.10 ✓ |
| NFR-6(c2) shim contract tests | 1 | E4 — Story 4.3 ✓ |
| NFR-6(c3) canvas-vs-real-Ghost | 36 references | **none** |

**Why it matters, and why it would not have been caught later.** Every one of the 33 owner gates requires all of
these green. §4 is explicit that **NFR-6(c3) "is a dependency of the library epics, not of hardening — the
comparison harness and the T1 droplet must exist before the *first* gated category, not at E15."** As written,
the build would have reached the Heroes gate and found that the thing the gate is made of did not exist. E15's
stories cover the *sign-off* on these layers, which reads like coverage and is not: a re-confirmation cannot run
before the first run.

**This is the R-79 failure class** — a thing everybody assumed had an owner, which §8 never assigned.

**Fixed by three new stories**, each placed by §4's own statement of what that layer needs:

- **Story 4.11 — the render matrix and the accessibility scan that rides on it.** In E4 because §4 says the
  matrix *renders locally and needs no Ghost*. Carries the 1% threshold, the pinned renderer as part of the
  baseline, the pinned fixtures, reduced motion and 200% zoom as cases, and **the mass-rebaseline rule before it
  is ever needed**.
- **Story 7.33 — compile CI.** In E7 because §4 says it *needs only gscan*. Carries the whole-library assertions
  that only a whole-library run can exercise, including the dead-CSS soundness check.
- **Story 7.34 — the canvas-vs-real-Ghost comparison harness.** In E7 because it needs a real deploy, and E7
  lands immediately before E9. Carries the exclusion regions, the 30-day rotation, per-target serialization, and
  **"Blocks: E9 Story 9.1 cannot open until this is done."**

**Verified after the fix** — every prerequisite of the first gate is now built before E9.1:

| Gate prerequisite | Built at |
|---|---|
| deployed and rendered on a real Ghost | 7.18 |
| NFR-6(c3) comparison harness | 7.34 |
| NFR-5 accessibility scan | 4.11 |
| compile CI | 7.33 |
| FR-J17 quality gate | 7.8 |
| NFR-6(a) render matrix | 4.11 |
| FR-D17 preservation check | 5.23 |

Seven of seven. Before the fix it was four of seven.

---

## F2 — the canvas had no tokens to render against *(high)*

**Found by:** comparing the first story that *uses* a capability against the first that *builds* it.

Story 5.10 (Section Picker) renders live previews **"in the project's current Style Pack"**, and so, in truth,
does the whole canvas from Story 5.1 onward. **The Style Pack token system is E6 — an epic later.** Nothing in
E1–E5 authored a token set, and FR-G3 requires a design's CSS to consume Style Pack custom properties
*exclusively*, so without one **nothing renders on the canvas at all**.

This is §8's own epic order, not a story-level mistake, which is why it needed a story-level answer rather than a
re-plan.

**Fixed** by an acceptance criterion on Story 4.2: **the runtime ships one reference token set** — the full
custom-property contract at a single set of values — and **E6 replaces it with the twelve authored packs without
changing the contract**. E4 owns the contract; E6 owns the values.

---

## F1 — a verification that could not run *(moderate)*

Story 6.5 (mode resolution) named **T1 and T3** in its Verification line. E6 is three epics before the compiler,
so no compiled theme exists to deploy. §8's own E6 exit is canvas-only and does not ask for this, so the story
had over-specified itself.

**Fixed:** 6.5 now verifies on the canvas plus a unit assertion over the emitted token block, and the on-Ghost
confirmation of all three mode states is explicitly deferred to the **E4/E7 joint gate (Story 7.35)**, which is
where a compiled theme first reaches a real Ghost.

---

## F3 — three surfaces select from design sets that arrive later *(moderate)*

§8 declared one dependency of this shape — **A25's gate cannot open until E7's card module emits** — and left
three of the same shape undeclared:

| Surface | Built at | Its design set arrives at |
|---|---|---|
| Paywall editor | 5.20 (E5) | A32, in E10 |
| Main feed's Pagination control | 5.19 (E5) | A34, in E10 |
| Ghost card design module | 7.13 (E7) | A33, in E10 |

**Not a defect, and deliberately not resolved by re-ordering.** Each surface is built and owner-tested against
whatever designs exist at the time; the full set arrives in E10 and the two meet at that category's own owner
gate. What was wrong was that this was **silent**, so a reader would have assumed the surface was finished.

**Fixed:** each of the three stories now carries an explicit **`Depends on E10`** line naming its category and
the gate where they meet — the same shape §8 used for A25.

---

## F4 — the first story of every category is the heavy one *(accepted)*

A category's first story delivers **the shared content model, the stylesheet *and* four designs**; every later
story delivers four designs alone. It is therefore the story in each run most likely to overrun a single
session — and **R-85 puts the model and the stylesheet there deliberately**, so splitting it would contradict
the ruling rather than improve it.

**Accepted, with a calibration point rather than a guess.** **A1's first story — Story 9.1, the very first
library story of the build — is where this is measured.** If it overruns, the fix is to resize the *later*
stories of each run and say so on the board. The risk this closes is discovering it silently thirty categories
in.

---

## What was tested and found clean

- **Cross-epic sequencing.** Every reference from a story to a later epic was checked. All sixteen are
  **declared deferrals** — E1's cut line, the E4/E7 joint gate, constraints flowing forward onto E9–E11 — and
  none is a hidden dependency.
- **Named tools exist.** `tools/tuple-check.py`, `inventory-gen.py`, `export-roster.py`, `story-board.py` — all
  four present.
- **Category readiness.** A category's story run cannot open until its per-design specs exist;
  `python3 tools/inventory-gen.py --check` prints *current* for every category.
- **FR coverage** — 132 of 132, re-checked after every edit in this pass.
- **Frames** — every owner-tested story names the frame it is built from (R-74).

## What this pass did NOT test, stated so it is not mistaken for coverage

- **Whether the requirements themselves are right.** Rounds 1–4 did that; this pass took §5, §6 and §8 as given.
- **Whether a four-design story is really one session.** Unknowable until one is built — that is F4's
  calibration point, not a finding this pass could close.
- **The acceptance criteria's technical correctness against Ghost.** Every external-platform claim in the
  stories was carried from documents that were executed against T1 and T3; none was re-executed here.

---

*Findings F0–F4 are closed in `epics.md`. Step 6b (`bmad-sprint-planning`) is the next step and is unaffected by
this pass except that it now has three more stories to gate.*
