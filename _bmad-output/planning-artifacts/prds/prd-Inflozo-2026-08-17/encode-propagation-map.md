---
title: Inflozo PRD v3.1 — Encode Propagation Map
status: encode instrument (not normative; superseded once the encode completes)
created: 2026-08-18
sources: .memlog.md #222→end · validation-report.md (152 findings) · verify-mechanical-ghost-claims.md · verify-mechanical-theme-and-math.md · research-ghost-koenig-cards.md · research-canvas-iframe-geometry.md · research-contested-variants.md · research-section-js-libraries.md
---

# Encode Propagation Map

## Why this file exists

Two previous encode rounds wrote every fix into its **home** requirement and stopped. Three independent reviewers named that single behaviour as the root cause of ~25 defects: the consequence never reached the other FRs, the appendices, the epics, the counts, the companion files or the normative tables that depended on it. The v3.0 stress test found the same pattern *again* — `data-portal="upgrade"` fixed in Appendix B and never propagated to 28 inventory variants; the 487→485 recount fixed in `prd.md` and left stale in two normative companions.

**Rule for this encode: no decision is "done" until every row in its propagation list has been visited and either changed or explicitly ticked as needing no change.** A location listed here that turns out not to need editing is a tick, not an error. A location *not* listed here that later turns out to have needed editing is the defect this file exists to prevent.

## How to read a block

| Field | Meaning |
|---|---|
| **Ruled as** | The decision *as ruled by the owner*, not as originally proposed by a reviewer. Where verification refuted the proposal, this line carries the **verified** version. |
| **Source** | `.memlog.md` entry number (bullet index; #222 = "STRESS TEST v3.0 opened"). |
| **Home** | The one FR/§/appendix that most obviously changes. |
| **Propagates to** | Everything else. Exhaustive by intent. |
| **Counts** | Any number that moves, with the arithmetic to re-derive. **Never compute the new value here — flag it.** |
| **Conflicts** | Existing text that must be **deleted or rewritten**, not merely added to. |
| **New content** | What must be **authored from scratch** rather than edited. |
| **Blast** | SMALL (1–2 locations) · MEDIUM (3–8) · LARGE (9+ or structural). |

## Encode order (binding)

1. **Part 1 — LARGE, in the order printed.** Structural changes first; a small fix made before a structural change gets overwritten by it.
2. **Part 2 — MEDIUM.**
3. **Part 3 — SMALL.**
4. **Part 4** states every cross-decision interaction and the order between the two.
5. **Part 5** is the counts ledger — run it after *all* content edits, never during.
6. **Part 6** is the post-encode verification checklist.
7. **Part 7** is the authored-not-edited list — the work that cannot be done by editing existing text.

## Standing rules for this encode

- **The verification files override the review findings.** `verify-mechanical-ghost-claims.md` and `verify-mechanical-theme-and-math.md` caught **six wrong "fixes"** across two passes. Where this map's "Ruled as" line disagrees with `validation-report.md`, this map is right. The six are flagged inline with **⚠ VERIFIED CORRECTION**.
- **FR ids are append-only.** 119 FRs are currently contiguous, dupe-free, and each owned by exactly one epic. **Never renumber.** New FRs append to the end of their letter block. One entirely new block (**FR-R**) is authored.
- **A reviewer claim about an external platform is a hypothesis until read in source.** Two reviewer platform assertions failed verification in this session alone; each had deleted or damaged something real.
- **Research companions outrank `prd.md` body text** on any Ghost fact (memlog #225: three reviewers converged on this independently — the regression risk lives in the *distillation*, not the research).

---

# PART 1 — LARGE blast radius (encode in this order)

---

## L1 · Q1 + DESIGN485 + MERGE — every one of the 485 designs is fully designed *and* specified before any of it is built, in one merged pass

**Ruled as:** Full **per-variant** specs for all 485 sections (not the 34-header union pass). All 485 designed in Claude Design at three breakpoints **with their per-design sidebar control panels** before building (~1,500–2,000 frames, owner accepted the cost). The design pass and the spec pass **merge into one pass**: each category session produces the designs *and* the specification (content fields with types and optionality, the per-design control list with allowed values, data binding with 0/1/many behaviour, the responsive collapse rule in words, empty states, a11y notes) *and* the category's shared field list. **The category-level union header still exists underneath** as the shared content model — per-variant specs sit **on top of** the union, they do not replace it — because FR-D17's zero-prop-loss gate stores props against the union.

**Source:** #245 (Q1), #272 (option 2, all 485 at 3 breakpoints), #273 (the merge), #274 (prompt 3 delivered)
**Blast:** LARGE — structural. **Encode first. Everything in L2, L3, L4, L16, and every `sections-inventory.md` edit in this map is downstream of it.**

**Home:** `sections-inventory.md` — its structure changes for all 34 categories (per-category union header + per-variant spec beneath each variant line).

**Propagates to:**
- **`sections-inventory.md`** — restructure every one of the 34 category blocks: keep the existing `Content:` / `Controls:` / `Data:` line as the **union header** (explicitly labelled as the shared content model FR-D17 stores against), then add a per-variant spec beneath each of the 485 variant lines. State the two-layer relationship normatively, once, in the file's preamble.
- **`sections-inventory.md` § "How to read a category declaration (FR-G3)"** — currently says the first 3–5 entries of the *category's* `Controls:` line are its Quick Controls. That becomes false under L4. Rewrite together with L4.
- **FR-G3** (registry entry format) — `contentSchema` / `controlSchema` / `quickControls[]` now exist at **two levels** (category union + per-design). The registry contract must say which level each field is read from.
- **FR-G5** (uniqueness bar + structural-descriptor proxy) — H10 rules that real structural descriptors "fall out of Q1". The mechanical proxy stops being "a CI assertion over free prose" and becomes an assertion over the per-variant spec's declared descriptor tuple. Rewrite FR-G5's proxy clause.
- **FR-G1** — Appendix A normativity statement now covers per-variant specs, not just variant descriptors.
- **§4 Release Strategy** — "No de-scope contingency" already says launch slips if library waves slip; now add that **design+spec completion is a launch gate**, not a wave.
- **§4 Definition of Done** — add: every one of the 485 carries a completed per-variant spec and its three-breakpoint design set with sidebar control panel.
- **§8 preamble "Story granularity (normative)"** — currently "a category is a story, not a variant — 34 stories, not 485." Still true for *build*, but the story now consumes a per-variant spec produced upstream. State the input artifact.
- **§8 E9/E10/E11** — restructured wholesale by L2. See L2.
- **§8 E4** — the annotated-HTML authoring vocabulary and its documentation are the input every one of the 485 specs is written against; E4's deliverable now gates the design pass, not just the build.
- **Appendix A (prd.md §569–…)** — the mirrored inventory table stays a summary; add a pointer that per-variant specs live in the companion.
- **Appendix F** — new **F.3a build cost** section carrying the ~1,500–2,000 frame count (see L9).
- **§7.6 risk table** — the "Library scale (485 variants) slips schedule" row: its mitigation ("factory workflow + shared primitives") is now wrong-shaped. Rewrite per H22 (L9): the row is about **timeline**, and must not read as a prompt to descope.
- **§7.6 "Assumed, unvalidated"** — add the frame-count estimate and the per-frame authorship rate as founder estimates.
- **`_bmad-output/planning-artifacts/design/claude-design-prompt-2.md`** and **`claude-design-prompt-3-library.md`** — already delivered; add both to the **companion manifest in the preamble** with their precedence (prompt 2 wins over prompt 1; prompt 3 is the per-category library prompt, run 34×).
- **Preamble companion manifest** — add both design prompts; M1 (L21) sets the precedence order they sit in.
- **Appendix I glossary** — "Section / variant" entry: add that a variant now carries a per-variant spec; add a **"Per-variant spec"** term.

**Counts affected:**
- **~1,500–2,000 design frames** — NEW number, first appearance. Derivation to state: 485 designs × (desktop 1440 + mobile 390 + tablet-where-it-differs + dark + sidebar control panel) + per-category (1 design × 3 packs × light/dark tokenisation proof + 1 stress frame). Do not compute; state the range and its basis.
- **34 category design sessions** (= 34 build gates, L2). Must equal 34 in both places.
- **485** is not moved by this decision. It *is* moved by L16 — resolve L16 before touching any 485-derived number.

**Conflicts (delete or rewrite, do not append):**
- §8's implicit model that waves run in parallel (see L2).
- `sections-inventory.md`'s current single-level control declaration (see L4).
- §7.6's "factory workflow + shared primitives" mitigation as a *schedule* answer.

**New content required:**
- `sections-inventory.md`: the two-layer (union + per-variant) structure statement, and 485 per-variant spec blocks. **This is the single largest authoring job in the encode.**
- A stated rule that the union header is normative for FR-D17 and the per-variant spec is normative for build.

---

## L2 · GATE34 — 34 sequential owner gates; E9–E11 stop being parallel waves and become a gated sequential pipeline

**Ruled as:** After each section **category** is developed there is a **blocking owner gate** — the owner tests it personally, compares it against real Ghost, approves, and only then does the next category begin. **34 categories = 34 sequential owner gates.** The owner is the explicit bottleneck by design. Manual eyeballing is **complementary to** the automated tests, never a replacement. Plus H1: **both** an automated emitted-theme code-quality gate **and** the 34 manual owner gates.

**Source:** #262 (the hard gate), #268 (H1), #248 (H22 governing constraint)
**Blast:** LARGE — structural. **Encode second, immediately after L1.**

**Home:** §8 E9/E10/E11.

**Propagates to:**
- **§8 E9 · Library Wave 1 (156)** — retire "wave" framing. Rewrite as a gated sequential pipeline. Its **156** count and its `A1–A3 + A17–A23` grouping both change once L3's shell block is carved out.
- **§8 E10 · Library Wave 2 (199)** — same.
- **§8 E11 · Library Wave 3 (130) + Starters** — same; starters stay at the end.
- **§8 preamble "Story granularity"** — a category story now exits on an **owner gate** in addition to the render matrix / axe scan / compile CI. State the gate as an exit criterion.
- **§8 E9/E10/E11 exit criteria** — each must add: *owner gate passed for every category in the block* and *real-Ghost comparison run for that category* (L8 makes the comparison a dependency of these epics, not of E15).
- **§8 E15** — NFR-6(c3) moves **out** of E15 hardening into E9–E11 (L8). E15's "render-matrix sign-off" clause changes shape.
- **§4 Release Strategy** — add the sequential-gate model and the owner-as-bottleneck statement. This is where the "quality outranks schedule" governing constraint (H22) belongs alongside it.
- **§4 Definition of Done** — add: 34 owner gates passed.
- **§7.6 risk table** — the solo-founder / library-scale row: the bottleneck is now **designed in**, so the risk is timeline, not quality. Rewrite (see L9 / H22).
- **§7.6 "Assumed, unvalidated"** — the pre-launch duration is now deliberately unbounded; that belongs here, and Appendix F needs a time axis (L9).
- **Appendix F.3a / F.5** — the gate count and its schedule consequence feed the build-cost section and the payback break-even (L9).
- **NFR-6(a) cadence** — the render matrix must complete **inside** a category gate window. This is the one input the CI cost estimate is most sensitive to (L9). State the cadence (L8).
- **FR-G6** (Section CI) — add the owner gate to the per-category exit set.
- **Appendix I glossary** — new term: **Owner gate**.
- **NFR-6(c3)** — becomes per-category rather than release-wide (L8).

**Counts affected:**
- **34 owner gates** — NEW number; must equal the 34 categories and the 34 design sessions (L1) in all three places.
- **Wave counts 156 / 199 / 130** — these are the sums the arithmetic ledger currently reconciles (memlog #223). Under L3 the 47 shell variants leave E9, and under L16 the total may drop by 1. **Re-derive all three, and re-check that they sum to the library total.** Current: 156 + 199 + 130 = 485.
- **Epic count E1–E15** — L14 adds E0; the post-body trio (L5/L6 + the paywall editor) may need its own epic. Re-derive the epic list and re-verify every FR is owned by exactly one epic.

**Conflicts:**
- Every use of the word **"wave"** in §8, §4, §7.6 and FR-G1's epic references. Delete the parallel-wave model; do not layer a gate on top of it.
- §8 E15's ownership of NFR-6(c3).

**New content required:**
- The owner-gate definition (what the owner tests, against what, and what "approved" means) — normative, in §4, referenced from §8.
- The automated emitted-theme code-quality gate (H1) — this is **new**, distinct from gscan, and gscan is now known to certify almost nothing (memlog #226: a deliberately terrible theme scores 0/0 on both specs while real Casper and Source each fail a rule). Needs its own FR: **FR-J17**.

---

## L3 · SHELL — the complete shell block ships first: all 47 of Group 1

**Ruled as:** Build the **complete** shell first, not a minimal one — all templates plus **every** header variation (A1, 16), **every** footer variation (A3, 16) **and** every announcement bar (A2, 15). That is all **47** of Group 1 Structure and Chrome. The shell block lands **before** Heroes, and **Heroes (A4) is then the first owner-gated category.**

**Source:** #265
**Blast:** LARGE — structural. **Encode third, after L2 (it re-partitions what L2 restructured).**

**Home:** §8 — a new shell block ahead of the category pipeline.

**Propagates to:**
- **§8 E9** — A1, A2, A3 leave E9 for the shell block. E9's count and category list both change.
- **§8** — the shell block needs a home: either a new epic or an explicit named phase inside the restructured E9. Whichever, it must be **owned** (every FR owned by exactly one epic) and must carry exit criteria.
- **§8 E10** — A4 Heroes becomes the **first owner-gated category**; state it.
- **§8 ordering / dependency notes** — the shell block also lands *after* H4's FR-D4 rich-text mark-emission spike (L20 / H4), which is scheduled **before** the shell block. Two ordering constraints now stack; state both.
- **`sections-inventory.md` § Group 1 · Structure & Chrome** — mark the 47 as the shell block; state the build-order consequence.
- **`sections-inventory.md` § Synthesis Defaults § 2 Inheritance** — the header/footer synthesis fallback (A1 #1, A3 #1) is available from the shell block onward; before it, nothing synthesizes. State the dependency.
- **§8 E4 / E5 / E6 pilot sections** — **A1 #1 Classic Left** is a pilot section and a shell-block member; **A4 #2 Split Editorial** is a pilot section and the first gated category's member. The pilot set now straddles the shell/category boundary. Verify the five-pilot table's reasoning still holds and state the sequencing.
- **§4 Definition of Done** — the shell block is a named prerequisite.
- **Appendix F.3a** — the shell block is 47 designs' worth of frames ahead of the gated 438; the build-cost section should show the split if it shows a schedule.
- **§7.6 risk table** — the shell-first ordering is a *mitigation* for the site-wide-singleton coupling risk; add or amend a row.

**Counts affected:**
- **47** = A1 16 + A2 15 + A3 16. Verify against `sections-inventory.md` Group 1 and against Appendix A's "Group sums: Structure & Chrome **47**".
- **E9's 156** loses the 47 → re-derive. **Remaining categories after the shell block: 34 − 3 = 31 gated categories.** But GATE34 says **34** gates. **⚠ RESOLVE AT ENCODE:** either the shell block's three categories carry their own gates (34 total, shell = 3 of them) or the shell block is a single gate (then 1 + 31 = 32 gates, and "34 sequential owner gates" is wrong). The owner said 34; the natural reading is that A1, A2 and A3 each get a gate inside the shell block. **State the resolution explicitly and make the number agree everywhere.**
- Library total split: shell 47 + gated 438 = 485 (pre-L16).

**Conflicts:**
- §8 E9's category list and its 156.
- Any text implying Heroes is not the first gated category.

**New content required:**
- The shell block definition and its exit criteria.
- The gate-count reconciliation statement (34 vs 1+31).

---

## L4 · Q5-CONSEQUENCE — controls are PER-DESIGN, not per-category

**Ruled as:** Each **design** of a section carries its own sidebar control set (number of posts, typography, image size…), kept **minimal** per the design directory. This changes `sections-inventory.md`, whose `Controls:` lines are currently declared at **category** level for all 34. It folds into the L1 per-variant spec pass rather than adding new scope. **Two things must now be written:** (a) a **control-carry rule** for design switching — a control present in **both** designs carries its value; present only in the **old** one is **PARKED** so returning restores it; present only in the **new** one takes its default; (b) **FR-D17's zero-loss gate must be defined over CONTROL values as well as content props.**

**Source:** #259
**Blast:** LARGE — structural. **Encode fourth. Must land before any Appendix C or FR-F edit.**

**Home:** `sections-inventory.md` — per-design control sets for all 34 categories / 485 designs.

**Propagates to:**
- **`sections-inventory.md`** — all 34 `Controls:` lines. Keep a category-level **union** control list (needed for the park-and-restore rule to have a domain and for the FR-F3 cap to mean anything), and add a per-design control list under each of the 485 variants. Same two-layer shape as L1's content model — state it once, in the preamble, covering **both** content and controls.
- **`sections-inventory.md` § "How to read a category declaration (FR-G3)"** — "the first 3–5 entries of the `Controls:` line are that category's Quick Controls" becomes "…of the **design's** control list are that design's Quick Controls". Rewrite.
- **`sections-inventory.md` § Universal controls** — the three universal controls (Background role, Vertical spacing, Top divider) stay declared **once** and stay per-section, not per-design. Confirm and restate so the two-level model does not accidentally swallow them.
- **FR-F3** (sidebar structure, 3–5 Quick Controls, ≈15 cap) — the cap now governs a **design's** controls, not a category's. Rewrite the cap clause and the "≈ 15 + 3" arithmetic sentence.
- **FR-F7** (schema-driven controls) — one schema per **design**, not per section. Rewrite.
- **FR-F1 / FR-F2** — vocabulary unchanged; verify no wording assumes category-level declaration.
- **FR-G3** — `controlSchema` and `quickControls[]` become per-design; the "quickControls[] is a convention, not a second authoring pass" clause depends on the *category* `Controls:` line and must be rewritten against the design's list.
- **FR-D13 Variant Shuffle** — currently preserves *content* props via the shared per-category content model. Add the **control-carry / park-and-restore** rule. This is where it belongs functionally.
- **FR-D17 Site Remix** — the zero-prop-loss gate must now cover **control values**. Rewrite the gate clause.
- **§8 E5 exit criteria — "Play-loop gate"** — currently "20 consecutive Variant Shuffles … preserve every content value with zero prop loss". Must become **content values AND control values**, with park-and-restore asserted (a control present only in the old design is restored on shuffling back). This is the only gate on §1.2's central claim; it must test the new rule.
- **FR-D5 / FR-D12** — the Layers panel and Section Picker render per-design control sets; verify no assumption of a single per-category sidebar.
- **FR-D9 undo** — "Undo entries whose section schema no longer matches the current library no-op gracefully" — schema is now per-design; a shuffle changes the schema. Verify the undo rule still holds and that a parked value is journal-visible.
- **Appendix C — Control Vocabulary Reference** — the vocabulary itself is unchanged, but the two paragraphs about the three universal controls and the "≈15 cap governs a category's own controls" must be rewritten to the per-design level.
- **Appendix C** — add the **park-and-restore** semantics to the reference (it is a control-system rule, not only an editor rule).
- **Appendix I glossary** — "Universal control" entry references FR-F3's cap; update. Add **"Parked control value"**. Update **"Variant Shuffle"** to mention control carry.
- **§7.3 "Control → CSS"** — data-attribute mechanism is per-design now; a design switch changes the attribute set on the section root. Verify §7.3's single-attribute-write claim survives and state what happens to attributes a new design does not declare.
- **§7.5 data model** — `project_templates.doc`'s `controls` field must now hold **parked** values as well as active ones. Add to the sketch (or to the "tables the FRs are known to require" list) that the doc carries parked control values keyed by the design they came from.
- **FR-Q3** (promotion of a control to a Ghost custom setting) — "Deleting, hiding, or **shuffling away** a section that carries a bound control warns about the binding". Under park-and-restore, shuffling away **parks** the control rather than destroying it. Rewrite the interaction: does the binding park too, or is it broken? **Owner-decidable at encode; state one answer.**
- **`appendix-h1-string-catalog.md`** — the park/restore notice and the "8 items · 3 shown in this design" style messaging are chrome-adjacent app strings, not theme strings; confirm they stay out of catalog (§5 of that file lists what is out of scope) or add app-side copy to Appendix H.
- **Appendix H — Voice & Microcopy Canon** — the sidebar label rename (L13) and any park/restore user-facing copy.

**Counts affected:**
- **FR-F3's ≈15 cap and its "≈ 15 + 3" effective ceiling** — the arithmetic still reads 15 + 3, but its *subject* changed. Restate; verify Appendix C and `sections-inventory.md` agree with FR-F3 on the same subject.
- Total control-schema count across the library moves from 34 schemas to **485 design-level schemas over 34 union schemas** — that is a new count pair; state both.

**Conflicts:**
- Every "declared at category level" / "declared once per category" phrasing for controls, in `sections-inventory.md`, FR-F3, FR-F7, FR-G3 and Appendix C. Rewrite, do not append.
- FR-D17's content-only zero-loss gate.
- E5's content-only play-loop gate.

**New content required:**
- The **control-carry rule** (carry / park / default) — normative, with the park-and-restore round trip stated as testable.
- The **zero-prop-loss gate over control values** — the assertion, not the prose.
- Per-design control lists for all 485 designs (part of L1's authoring job).

---

## L5 · D11 + Q8 + Q9 + Q10 — the Koenig Card Design Module (a NEW feature area)

**Ruled as:** A dedicated module to design **every** Ghost editor (Koenig) card — toggle, bookmark, audio, file, video, image, gallery, callout, button, product, header/header_v2, signup, CTA, embed, code, blockquote-alt, divider, and the rest. Inflozo emits CSS that reliably overrides Ghost's. The override mechanism is **`card_assets: {exclude: […]}`, derived not authored** — the exclude list is exactly `designedCards ∩ ghostCardAssetNames`. **Never `card_assets: true`. Never `card_assets: false`. Never `!important`.** Q9: **vendor Ghost's 416 lines of MIT card JS** for audio (146), video (242), gallery (10), toggle (18), pinned to a Ghost version. Q10: **~20 active card panels**, not 26; **no colour controls on header_v2 / signup / cta** (the Ghost editor writes those inline per post).

**Source:** #243 (D11), #253 (Q8/Q9/Q10) · research: `research-ghost-koenig-cards.md` §6
**Blast:** LARGE — new feature area, needs a new FR block. **Encode fifth. Interacts with L6 and L18 — the three are one surface; encode L5 → L6 → L18 together.**

**Home:** **NEW FR block `FR-R · Koenig Card Design Module`**, appended after FR-Q in §5. (§5 is ordered by dependency, not alphabetically — FR-R sits at the end because it consumes the compiler and the canvas. Appending a new letter preserves the never-renumber rule; putting these in FR-Q would misfile them under Theme Settings.)

**Propagates to:**
- **FR-J2** (`package.json`) — currently `card_assets: true`. **Delete `true`.** Replace with the derived exclude-list rule. This is a direct contradiction, not an addition.
- **FR-J3** (assets) — `cards.css` currently one line: "global CSS = … + `cards.css` (Koenig treatment per Appendix A §33)". Rewrite: `cards.css` is emitted from the card module, flat single-class selectors mirroring Ghost's own selector shapes, no `!important`, plus the always-owned rules (`.kg-width-wide`, `.kg-width-full`, `.kg-content-wide > div`, `.kg-card + .kg-card`, `.kg-card-hascaption figcaption`) regardless of `card_assets`.
- **FR-J4** (JS bundling) — add the **vendored Ghost card scripts** as a bundle input; state the pinning and the licence attribution. `assets/js/cards.js` is a **new emitted file** not currently in §7.4's tree.
- **FR-J6** (gscan gate) — the 0/0 target now runs against a **variable** rule set: excluding cards *activates* Koenig rules proportionally (2 designed cards → 19 rules; all designed → 103). ⚠ The v3.0 finding said `card_assets: true` disables ~110 of 113 Koenig rules. State the new coverage claim honestly — this is a **strengthening** of the gate and it must be stated as such, not left implied.
- **§7.4 generated theme structure tree** — add `assets/js/cards.js`; amend the `assets/css/cards.css` comment; amend the `package.json` comment (it currently says `card_assets` without qualification).
- **`sections-inventory.md` A33** — its whole definition changes. Currently "6 full treatments, one active per project, Style group of A25, no controls". Now the 6 are **presets/starting points** and the module carries ~20 per-card panels with real control surfaces. **Rewrite A33's block, its `Controls:` line, and its host-context row.**
- **`sections-inventory.md` § Placeable vs non-placeable table (A33 row)** — the host context for the render matrix becomes the **style-guide fixture** (L18), not a hand-described `post.hbs` fixture.
- **Appendix A § Placeable vs non-placeable table (A33 row)** — same edit, mirrored.
- **Appendix A inventory table (A33 row)** — `compileTarget: assets/css (cards.css)` becomes `assets/css/cards.css` **+ `assets/js/cards.js`** + the `package.json` `card_assets` exclude entry. And **the count may move** (see Counts).
- **`sections-inventory.md` § Synthesis Defaults § 2 Inheritance, "Koenig treatment (A33)" row** — "defaults to A33 #1 Editorial if never set". Under the module, "never set" now means "no card designed", which emits **no exclude entries at all** and Ghost's stock CSS renders. That is a different behaviour. Rewrite the row.
- **FR-D6 / FR-D12 / FR-D13 / FR-D17 / FR-D5** — the card module is a **surface**, like the Paywall editor: non-placeable, absent from the Picker rail, Layers, Shuffle and Remix. All five FRs enumerate the non-placeable set (A32/A33/A34); verify each enumeration still reads correctly with a module rather than a treatment picker.
- **M14 (L34)** — a **settings-level fallback** so the card treatment keeps a selection surface when A25 is removed. That fallback now points at the card module, not at A25's Style group. Encode M14 *after* L5.
- **NFR-2** — the vendored card JS counts against the **40 KB gzipped maximal-design budget** (L10). 416 lines of Ghost card JS is a real, unmeasured addition to a budget the research measured at 17.5 KB maximal. **Flag: the maximal-design definition must be re-stated to include `cards.js`, and the arithmetic re-derived.**
- **NFR-5** — axe-core zero violations now covers the card fixture; a designed card can break contrast and focus. Add the fixture to NFR-5's scope statement.
- **NFR-6(a) render matrix** — A33's renders now come from the style-guide fixture; the per-variant render count for A33 changes shape (see Counts).
- **NFR-6(c1)** — `cards.css` and `cards.js` become committed compiled-output snapshots.
- **NFR-6(c3)** — the card fixture is a high-priority member of the rotating cohort (card treatments are named in Q16's risk weighting).
- **NFR-7 / §7.6** — the Ghost card-chunk **name list is version-pinned** and degrades *quietly toward regression* if stale. **New §7.6 verify-at-build item:** re-verify the `card_assets` chunk names on each Ghost minor, guarded by a build-time check against a checked-in `cards.manifest`. Also: **`header` vs `header_v2` must both be excluded when "the header card" is designed** — a named trap.
- **§7.6 risk table** — new row: stale card-chunk name list silently reintroduces Ghost's CSS under Inflozo's rules.
- **§8 E7** — owns FR-J2/J3/J4/J6 and therefore the emission half of the module. Add to E7's Owns clause and exit criteria.
- **§8 E5** — owns the editor surfaces; the card module's *editor* is E5's or a new epic's. **Decide and assign; every FR must be owned by exactly one epic.**
- **§8 E11** — currently owns A33 as part of Wave 3. The module changes what E11 delivers for A33.
- **Appendix F.1 plan matrix** — is the card module Free or Pro? A33 #1/#2 are `[Free]` today. With ~20 per-card panels the gating question is new. **Add a row** (the matrix is "the sole definition of Free/Pro gating" — a capability with no row is available on both plans, so silence is itself a decision).
- **FR-L3** — if any card panel is Pro-gated, it becomes an exit-gate item; H11 (L29) extends the block sheet to all uncovered items, and the card module must be in scope.
- **`appendix-h1-string-catalog.md`** — card-module strings: the `card.*` namespace currently has 7 keys. A designed audio/video player has visitor-facing labels (play/pause, time, download) and the vendored scripts must take them as `data-i18n-*` (FR-Q6's JS rule). **The `card.*` namespace grows; §4 totals move.**
- **Appendix I glossary** — new terms: **Card design module**, **card_assets exclude list**, **Style-guide fixture** (shared with L18).
- **Preamble companion manifest** — add `research-ghost-koenig-cards.md` as the source of truth for the card override mechanism and the chunk-name list.

**Counts affected:**
- **`card.*` catalog keys 7 → ?** and **`appendix-h1-string-catalog.md` §4 totals 131 / 128 listed / 29 JS / 3 locked** — all move. Re-derive the whole table.
- **A33's 6** — ⚠ **owner-decidable at encode.** Three readings: (a) the 6 treatments remain 6 variants and the module is a control surface over them → 485 holds; (b) the ~20 card panels *are* the deliverable and 6 becomes ~20 → A33 6→20, Group 5 28→42, total 485→499, `[Free]` count changes, 457/28 placeable split changes, render matrix 8730 → re-derive, E11's count changes, F.1's "all 485" changes, G5, FR-G1, NFR-5, gallery, glossary; (c) both — 6 presets *and* ~20 panels, panels not counted as variants. **State one reading and propagate the arithmetic.** Do not leave this to the reader.
- **~20 card panels** — NEW number (research: "~20 active card panels, not 26"). Also: **416 lines of vendored MIT JS across 4 scripts** (toggle 18, gallery 10, audio 146, video 242).
- **NFR-2's 40 KB maximal-design arithmetic** — re-derive with `cards.js` included.
- **gscan Koenig rule coverage: 2 designed → 19 rules; all designed → 103** (of 113). Replaces the "~110 of 113 disabled" claim.

**Conflicts:**
- **FR-J2's `card_assets: true`** — delete.
- `sections-inventory.md` A33's "no per-instance controls and no universal controls" and "Controls: the treatment selector in A25's Style group".
- Any text implying `!important` or specificity laddering is the override strategy.
- The Synthesis Defaults' "defaults to A33 #1 Editorial" row.

**New content required:**
- **The whole FR-R block** (~8 FRs): the module surface and its ~20 panels; the derived exclude-list rule; the flat-selector emission contract; the vendored-JS obligation with pinning and attribution; the style-guide fixture (shared with L18); the canvas fidelity rule (load the theme stylesheet **then a simulated `cards.min.css` containing only non-excluded chunks**, in that order, plus the 4 behaviour scripts — a canvas that loads only Inflozo's CSS looks right while the shipped site looks wrong, which is the exact failure this module exists to prevent); the chunk-name manifest and its build-time check; the header/header_v2 pairing rule; the settings-level fallback (M14).
- The per-card control surfaces (~20 panels × their control lists) — authored into `sections-inventory.md` A33 or into the FR-R block. **Decide which and say so.**
- The escape-hatch rule for audio/video (do not exclude them → keep Ghost's players → reduced control surface, one deterministic specificity ladder scoped to the content wrapper, never `!important`) as a **build-time switch, not a per-card user choice**.

---

## L6 · Q6 — post content becomes a dedicated SECTION with a design picker, on posts AND pages

**Ruled as:** Post content becomes a **dedicated section** with a design picker, **loaded by Ghost**, giving control over **drop caps, table of contents and its design**. Applies to **BOTH posts and pages** — placeable on `post.hbs` **and** `page.hbs`, not post-only. Pairs with L5 (card module) and L18 (style-guide dummy content): **all three are the post-body feature area and must be specified together.**

**Source:** #260
**Blast:** LARGE. **Encode sixth, with L5 and L18.**

**Home:** `sections-inventory.md` **A25 Post Content Layouts** — its category definition changes.

**Propagates to:**
- **`sections-inventory.md` A25** — rewrite the header. Today: "Wraps `{{content}}`. `bindingContext: post` · `compileTarget: post.hbs, page.hbs`." The compileTarget is already both, but the *category definition* must now state it is a **dedicated designable section with its own design picker**, and its `Controls:` line must carry drop caps, TOC and the design selector explicitly (drop cap and TOC are already there — verify and make them normative rather than incidental).
- **`sections-inventory.md` A25's `bindingContext: post`** — ⚠ on `page.hbs` the resource is a **page**, not a post. `appendix-b1-template-contexts.md` §3a (the wrapper rule) and §3b (`@page` is not set on list templates) both bear on this. **A25's `bindingContext` may need to be `post` on `post.hbs` and `page` on `page.hbs` — i.e. per-target, like A29 and A31 are per-variant.** If so, FR-G3's `bindingContext` enum (`none · post · posts · tag · tags · author · authors · tiers · error · private`) **has no `page` value** and must gain one. That propagates to FR-D12, FR-D13, FR-D17, FR-H7, `appendix-b1-template-contexts.md` and Appendix A's table. **Resolve this at encode; it is the kind of second-order consequence this map exists to catch.**
- **Appendix A inventory table (A24, A25 rows)** — `bindingContext` / `compileTarget` columns; A24 has the same `post.hbs, page.hbs` split and the same question.
- **FR-D6** (template switcher / synthesis) — A25 is synthesized into both `post.hbs` and `page.hbs` default stacks; confirm the switcher exposes the design picker on both.
- **`sections-inventory.md` § Synthesis Defaults § 3 — `post.hbs` row 2 and `page.hbs` row 2** — both are "A25 #1 Narrow Classic … Measure Narrow, TOC Off, share rail off, drop cap off, type scale Normal". Under L4 these are now **per-design** control values. Restate the default values against the design's own control list. Also state the default **card treatment** (L5) and the default **design** here.
- **FR-D5** (Layers panel) — is A25 placeable, and can it be deleted? Today it is placeable. If it is "loaded by Ghost" and carries the card treatment selector, deleting it strands the treatment — which is exactly M14's problem (L34). State the interaction.
- **FR-D12 / FR-D13 / FR-D17** — A25's Shuffle ring is now a **design picker**, per L13's terminology. Verify the partition rules (`bindingContext` / `compileTarget`) still separate the `post.hbs`-only and `page.hbs`-capable designs correctly.
- **FR-H4 / NFR-3** — the canvas **never reads post or page body HTML**; `{{content}}` renders dummy placeholder prose. With A25 promoted to a designable section, "what the dummy prose is" stops being incidental: it is the **style-guide fixture** (L18). Rewrite FR-H4's `{{content}}` clause to point at the fixture.
- **FR-H5** (helper shim) — `{{content}}` is in the shim's list; its output is now the fixture. State it.
- **A33's host** — A33's treatment selector currently lives in A25's **Style group**. Under L5 it moves to the card module. **Delete the A25 → A33 coupling from `sections-inventory.md` A25 and A33 and from the Appendix A / inventory non-placeable tables.**
- **`sections-inventory.md` A25 #9 Photo Essay / #12 Split Aside** — the v3.0 finding notes these collide with A33 on the same selectors. With the card module owning `cards.css`, the collision rule must be stated: which file wins, and how the compiler avoids emitting both. **New normative rule.**
- **§7.4** — `partials/sections/{template}/…` already covers A25's partial. Verify the `post.hbs`/`page.hbs` shared-partial hoisting rule (`partials/sections/shared/…`) behaves when the same A25 design sits on both templates with different bound resources — a **byte-identical** merge would be wrong if one binds `post` and the other `page`. **State the exception.**
- **`appendix-b1-template-contexts.md` §3 master matrix (`post.hbs`, `page.hbs` rows) and §4.2 `{{#post}}`** — add whatever A25's dual-context binding requires; §4 has no `{{#page}}` block scope section today.
- **`appendix-h1-string-catalog.md` `post.*` (12 keys)** — TOC heading, drop-cap-related a11y labels, "on this page" style labels. **Keys likely grow; §4 totals move.**
- **§8 E5** (owns FR-D1–D18, FR-H2, FR-H4, FR-H6) and **§8 E11** (owns A25 as part of Wave 3) — assign the post-body trio; consider a dedicated epic per memlog #271's "post-body trio designed together".
- **Appendix E starters** — Quiet names "Narrow Classic reading (A25 #1)"; Ledger and others reference A25 implicitly via post templates. Verify.
- **Appendix I glossary** — add **Post Content section** (or amend the A25 reference); confirm "Non-placeable treatment" still lists exactly A32/A33/A34.
- **Appendix F.1** — is the design picker / drop cap / TOC Free or Pro? A25 #1/#2 are `[Free]`. Silence = both plans; state it.
- **`_bmad-output/planning-artifacts/design/claude-design-prompt-2.md` Part C** — already covers the post-body trio; add it to the manifest with that scope (L1).

**Counts affected:**
- **A25's 12** — does the design picker change the variant count? Probably not. **Verify and tick.**
- **`post.*` catalog keys 12 → ?** and `appendix-h1-string-catalog.md` §4 totals.
- **FR-G3's `bindingContext` enum** — count of legal values may go from 10 to 11 (`page`).

**Conflicts:**
- A25's `Controls:` line's parenthetical "Koenig treatment (A33 — Style group; project-level, one treatment per project)" — **delete** (moves to the card module).
- A33's "Style group of Post Content Layout (A25)" in `sections-inventory.md`, Appendix A's non-placeable table and the inventory's non-placeable table — **delete all three**.
- FR-H4's undefined `{{content}}` placeholder.

**New content required:**
- A25's redefinition as a dedicated section with a design picker.
- The dual-context (`post` / `page`) binding rule, and the FR-G3 enum extension if taken.
- The A25-design-CSS vs `cards.css` collision rule.
- The shared-partial exception for a design placed on both `post.hbs` and `page.hbs`.

---

## L7 · D13 + Q11 + Q12 + Q13 + Q14 — canvas geometry, the chrome partition, and real device resize

**Ruled as:** Canvas geometry follows Webflow/Elementor/Gutenberg practice and is judged on **UX, not implementation cost**. **Q11: viewport-sized iframe, page scrolls internally** — not negotiable, because Inflozo ships 20+ sticky/fixed/viewport-unit variants across 15 categories and geometry (B) makes `sticky` render as `relative` and `fixed` render below the fold. **Q12: split the chrome** — outlines, hover/selection rings, element badges and insertion indicators live **inside** the iframe as **`::after` pseudo-elements** driven by `data-inflozo-selected` / `data-inflozo-hover` attributes (zero DOM nodes, so `outerHTML` and the byte-comparable-markup guarantee are untouched); **only the floating mark toolbar** (and pickers spawned from it) sits **outside**, rAF-tracked. **Q13: two-axis real device resize** (set real `width` **and** a device-plausible `height` on the iframe element, letterboxed when the container is too short) **plus a separate cosmetic zoom layer** (`transform: scale`, which never changes which breakpoint fires). **Q14: disclose the desktop-mode `100vh` canvas-vs-visitor gap in §1.2's carve-out** — any chrome that reduces the iframe's height introduces a systematic, knowable offset that is invisible to a markup-level fidelity test (Elementor measures 48 px).

**Source:** #244 (D13), #253 (Q11–Q14) · research: `research-canvas-iframe-geometry.md` §7.1–7.6 and Addendum 2
**Blast:** LARGE. **Encode seventh.**

**Home:** §7.3 "Focus model across the canvas iframe boundary" — its opening sentence is **wrong** and must be replaced.

**Propagates to:**
- **§7.3, focus-model paragraph** — ⚠ **CONFLICT.** Currently: *"Editing chrome — outlines, handles, the insertion '+', the floating mark toolbar, the Controls sidebar — sits **outside** the iframe, positioned over it from measured rects."* **Delete and replace with the partition.** The rest of the paragraph (two documents, two selections; NFR-5 keyboard completeness; focus order is a UX-pass deliverable) stands.
- **§7.3** — **add** the geometry statement: the canvas iframe is **viewport-sized and scrolls internally**, and state *why* (the catalogue's sticky/fixed/viewport-unit behaviours are only correct under that geometry).
- **§7.3 "Control → CSS"** — chrome-as-CSS is the **same mechanism** as control-as-data-attribute. Say so; it is the argument that makes the partition cheap.
- **§7.3 "Same-origin, on its real merits"** — add the forward risk: cross-origin-isolation pressure is answered by a known header (`Document-Isolation-Policy`), not a redesign. Also add the concrete payoff: Floating UI resolves the iframe offset itself via `ownerDocument`/`defaultView`/`frameElement`; **do not hand-compute `frameElement.getBoundingClientRect()` offsets.**
- **FR-D8 Device preview** — ⚠ **CONFLICT.** Currently "Desktop / Tablet (834) / Mobile (390) view toggles — **display only**". Strengthen to a **real iframe resize in both dimensions** with the device-plausible-height rule and the letterbox fallback, **plus** the separate cosmetic zoom layer. "Display only" must be rewritten so it means "no per-breakpoint *editing*", not "no real resize".
- **FR-D14** — "Canvas is site-width, fit-to-viewport with vertical scroll. **No zoom in v1.**" ⚠ **CONFLICT** with Q13's cosmetic zoom layer. Rewrite: zoom exists as a cosmetic layer that never changes the CSS pixel viewport.
- **FR-D11 keyboard map** — `1/2/3 device preview` exists; add zoom keys if the zoom layer gets any, or state explicitly that it has none.
- **§1.2 Product Vision carve-out** — add the **desktop-mode `100vh` gap** (Q14) alongside the code-injection carve-out and D14's Ghost-injected surfaces (L19). The carve-out becomes a short list, not a single parenthetical.
- **§1.4 #1 Single-source WYSIWYG** — verify the claim survives the disclosed offset; D4 (L15) reworks §1.2's promise to the true markup claim, and this is one of the reasons.
- **NFR-1** — the rAF sync loop is **mounted only while a popover is open**; an idle canvas runs zero positioning work. That is how the 60 fps / no-long-task-over-50 ms budget is met. State it, because it changes what NFR-1's trace must exercise.
- **NFR-5** — keyboard completeness across the boundary: the mark toolbar must not steal focus from the iframe's `contenteditable` (`mousedown` → `preventDefault`, act on `mouseup`, or unfocusable buttons); `document.activeElement` in the parent reads `<iframe>`. Add both as concrete constraints for the UX pass NFR-5 already anticipates.
- **NFR-3 CSP** — `frame-ancestors 'none'` currently **forbids the same-origin iframe §7.3 mandates** (a v3.0 critical). The batch decision fixes it to `'self'` (L27). Encode L27 **with** L7 — they are the same iframe.
- **FR-N2 marketing gallery** — uses "the same hosting model as the editor canvas (§7.3)". If §7.3's geometry and chrome partition change, verify the gallery's model statement still resolves correctly (the gallery has no editing chrome, so the partition is moot — **tick it explicitly**).
- **§7.6 risk table** — new rows: outside-click dismissal must listen on **both** documents; wheel events over an outside popover must be forwarded into the iframe's scroll container; drag-and-drop across the boundary needs coordinate translation for **discrete events only** (never `scroll`/`mousemove`/`pointermove`); in-page anchor clicks navigate the frame away unless intercepted; dropped files navigate the iframe unless `preventDefault`ed; outside chrome overlaying the canvas needs `pointer-events: none`.
- **§7.6 verify-at-build** — add: any editor code asking "what viewport are we in" must read the **iframe's** `defaultView` via `element.ownerDocument.defaultView`, never the global `window` — make it a lint rule (Gutenberg shipped a user-visible bug on exactly this).
- **§7.1 Stack** — the sync technique names a dependency: **`@floating-ui/dom`** with `autoUpdate(…, { layoutShift: false, animationFrame: true })`. That is a new named library in the **app** (not in generated themes — L10's zero-runtime-dependency rule is about themes and is untouched). Add it, and say which side of the line it is on.
- **§8 E5** — owns FR-D1–D18; the geometry, partition, resize and zoom land here. Amend E5's scope and exit criteria (the 60 fps measurement now has a stated mechanism).
- **§8 E4** — the two renderers must not emit the chrome attributes into `.hbs`; the editor-only stylesheet is injected into the canvas document and **never compiled into the theme**. State it in E4's scope and in §7.3.
- **NFR-6(c3)** — the disclosed `100vh` offset is an **exclusion region or a known delta** in the perceptual diff. Fold into D4's exclusion set (L15).
- **Appendix I glossary** — add **Canvas geometry**, **Chrome partition**, **Cosmetic zoom**; amend **Preview-only** so it is not confused with device preview (FR-D8 already flags that collision — verify it still reads right).
- **Preamble companion manifest** — add `research-canvas-iframe-geometry.md`.

**Counts affected:**
- **Device widths 834 / 390** — unchanged; **heights are new** (device-plausible, clamped). No fixed number to state, but the rule is new.
- **20+ sticky/fixed variants across 15 categories** — a new count used as the justification. Derive it from `sections-inventory.md` and state the derivation so it can be re-checked.

**Conflicts:**
- §7.3's "chrome … sits outside" sentence — **delete**.
- FR-D14's "No zoom in v1" — **delete**.
- FR-D8's "display only" framing — **rewrite**.
- NFR-3's `frame-ancestors 'none'` — **delete** (L27).

**New content required:**
- The geometry statement and the chrome partition, both normative.
- The device-resize rule (two axes + plausible height + letterbox) and the cosmetic-zoom layer as two independent layers.
- The seven boundary-crossing gotchas as either §7.6 risk rows or an architecture note.
- The `100vh` disclosure in §1.2.

---

## L8 · Q16 + DROPLET — the canvas-vs-real-Ghost comparison, the matrix cadence, and NFR-6(c3) moving forward into E9–E11

**Ruled as:** Build the canvas-vs-real-Ghost comparison as proposed. **Nightly rotating batch**, all 485 designs compared within **~30 days**, risk-weighted toward sticky/fixed, card treatments and member-state sections; **exclusion regions defined** (post body, Portal button, comments, code injection); **animations frozen**; **one-click approval** for intentional changes. The **full 8,730-render matrix moves from per-commit to nightly-and-before-release**, with per-commit covering only designs that commit touched. **Infrastructure:** the real Ghost target is a **self-hosted Ghost on a DigitalOcean droplet** provisioned by the owner and dedicated to tests — a permanent Appendix F cost line. **Sequencing consequence:** NFR-6(c3) currently lands in E15 hardening, but the per-category gate needs real-Ghost comparison **from the first category**, so the droplet and the comparison harness become a dependency of **E9/E10/E11**, not E15.

**Source:** #261 (Q16), #262 (infrastructure + sequencing)
**Blast:** LARGE. **Encode eighth. Depends on L2 (the gates it feeds) and feeds L9 (the CI cost line) and L15 (D4's (c3) rebuild).**

**Home:** NFR-6(c3).

**Propagates to:**
- **NFR-6(c3)** — rewrite completely: nightly rotating batch, 30-day full-coverage window, risk weighting, exclusion regions, frozen animations, one-click approval. This is also D4's rebuild target (L15) — **encode L15's exclusion set and region-scoped threshold into the same rewrite; do not write (c3) twice.**
- **NFR-6(a)** — **cadence, currently unstated** (a v3.0 medium, confirmed by verification as *the* input the CI cost estimate is most sensitive to). State it: nightly-and-before-release for the full matrix; per-commit only for touched designs. Per-commit instead of nightly multiplies the cost ~7× — the estimate cannot be written until the cadence is fixed.
- **NFR-6(b)** — nightly already; verify no conflict with the new nightly lane's runtime.
- **NFR-6(c1) / (c2)** — per-commit already; unchanged. **Tick.**
- **NFR-6(d)** — weekly–per-release; verify against the droplet's serialization constraint.
- **NFR-6 closing line** — "Only **(c3)** and **(d)** touch a real Ghost." Still true. **Tick.**
- **§4 Production-infrastructure testing** — T1 is already "a self-hosted Ghost **6.x** on a DigitalOcean droplet (owner-provided)". Confirm the Q16 droplet **is** T1 (or is a fourth droplet), and state which. The paragraph that says "only two of the four NFR-6 gates touch a real Ghost … Budget the CI lane accordingly" now has an answer in Appendix F (L9) — cross-reference it.
- **§4** — the sentence "the render matrix (NFR-6(a)) renders locally and needs no Ghost" stays true. **Tick.**
- **§8 E9 / E10 / E11** — add the droplet + comparison harness as a **dependency**, and the per-category real-Ghost comparison as an **exit criterion**. This is the front-loading that the v2.3 and v3.0 failure history calls for; say so.
- **§8 E15** — **remove** "the NFR-6(c3) nightly perceptual diff standing up against a real Ghost target" from E15's owned gates; it now stands up in E9. E15 retains the release-wide sign-off.
- **§8 E15 exit** — re-derive against what actually remains.
- **§7.6 risk table** — the "Helper-shim drift vs Ghost releases" row cites NFR-6(c3) as a mitigation; verify it still resolves after the move. Add a row for the droplet as a single point of failure for the whole category pipeline.
- **§7.6 verify-at-build** — item 3 (theme-upload size limits measured on T1–T3) and item 13 (stand up a scratch Ghost and confirm the four docs-vs-code conflicts, chief among them **`@even`/`@odd` parity, which the docs describe backwards**) both run on the droplet. D5's E0 spike (L14) executes them. Cross-reference.
- **Appendix F.3** — the droplet is a **permanent** line item. T1/T3 droplets are already costed at ≈$9 each; state whether Q16's droplet is one of them or additional. **And add the CI line (L9).**
- **Appendix F.3's "the render matrix runs on CI runners already inside the Vercel/CI lane"** — ⚠ **VERIFIED FALSE.** Vercel provides **build** minutes, not general-purpose CI runners; a pinned-Chromium Playwright matrix with per-render axe scans is **GitHub Actions**. Delete the clause (L9).
- **Appendix F.7** — the scenario's infra total moves once CI is costed.
- **NFR-5** — the axe scan rides on the (a) matrix's renders; if (a)'s cadence changes, NFR-5's scan cadence changes with it. State it.
- **G3 / G4 / §1.3** — G4's quality target rides on NFR-5 and NFR-2; verify no cadence claim leaks into §1.3.
- **Appendix I glossary** — **Test environment** entry lists T1–T4; verify the droplet's role reads correctly. Add **Rotating cohort** and **Exclusion region**.

**Counts affected:**
- **8,730 renders per run** = 485 × 3 packs × 2 modes × 3 viewports. **Moves if 485 moves (L16) or if the matrix is shrunk (L15's "fund it by shrinking the 8730 render matrix").** Re-derive: `variants × packs × modes × viewports`. Verified as arithmetically correct today (485 × 18 = 8,730).
- **~30 days** to full (c3) coverage — NEW number. Derivation: `485 designs ÷ nightly batch size`. State the batch size or the window, not both loosely.
- **CI cost ≈$35–80/mo** at nightly cadence (L9). At per-commit it is ≈$140–315/mo. The cadence decision *is* the cost decision.
- **3 of 12 Style Packs / 3 of 30 font pairings** — a v3.0 HIGH: the matrix covers 3 packs, so 27 of 30 font pairings are never rendered, while **Appendix D.c** states "every pairing must render in the render matrix under at least one pack before GA". ⚠ **Direct internal contradiction.** Resolve it in the same edit: either the matrix's pack dimension grows (and 8,730 grows with it) or Appendix D.c's claim is narrowed. **Flag, do not silently pick.**

**Conflicts:**
- E15's ownership of NFR-6(c3).
- Appendix F.3's Vercel-CI-runners clause.
- Appendix D.c's every-pairing-renders claim vs NFR-6(a)'s 3-pack dimension.
- NFR-6(a)'s missing cadence (an omission that reads as a decision).

**New content required:**
- The comparison harness spec: rotating batch, risk weighting, exclusion regions, animation freezing, one-click approval workflow.
- The (a) cadence statement.
- The droplet's role statement in §4 and Appendix F.

---

## L9 · H21 + H22 + the Appendix F restructure — the model is rebuilt around authorship, CI is costed, and break-even becomes two numbers

**Ruled as:** **H21: rebuild the cost model around authorship.** **H22 (GOVERNING CONSTRAINT, owner verbatim):** *"I am okay if it takes time. But it needs to be perfect and work flawlessly without bugs."* Quality and correctness **outrank schedule**. Consequence: the solo-founder risk row is about **TIMELINE**, not about cutting scope — **it must not be written as a prompt to descope**; Appendix F must show a **longer runway** rather than a reduced library.

**Source:** #268 (H21), #269 (H22) · verification: `verify-mechanical-theme-and-math.md` Part 2
**Blast:** LARGE — structural rewrite of Appendix F. **Encode ninth. Depends on L1 (frame count), L2 (gate count / unbounded pre-revenue period), L8 (CI cadence).**

**Home:** Appendix F.

**Propagates to — structure:**
- **Appendix F.3 splits into F.3a and F.3b:**
  - **F.3a Build cost (one-time)** — NEW section. ~1,500–2,000 design frames, 485 variants, 34 gates, with either a stated rate or an explicit *"owner's own time, not cash-costed, and here is the frame count it represents"*.
  - **F.3b Run cost (recurring)** — the current F.3 **minus** the CI dismissal, **plus a CI row**.
- **Appendix F.3's preamble** — add the one paragraph that converts the appendix from misleading to honest: *"The dominant cost of this product is authorship, not infrastructure. This appendix prices the infrastructure. It does not price the library, and G7's break-even is a server-cost break-even, not a payback figure."*
- **Appendix F.5 becomes two numbers:** **cash break-even** (run cost only) and **payback** (run + amortised build over a stated period).
- **Appendix F needs a time axis** — the pre-launch duration is deliberately unbounded (L2), so the recurring cost runs for an unbounded pre-revenue period. State the burn and the subscriber-months required to repay it.

**Propagates to — corrections (⚠ apply the VERIFIED values, not the report's):**
| Line | Report said | **Verified — encode this** |
|---|---|---|
| F.3 baseline band | $110–130 | **$107–130** (min: 25+20+0+0+9+29+9+15 = $107) |
| F.3 baseline point | ≈$120 | **≈$107 at launch, ≈$120 at modelled volume** — the Resend row's own note says the free tier covers launch volume, so $120 books a cost the same row says won't be incurred |
| F.3 stated max | report's **$127** | ⚠ **the report is WRONG — it is $130** (flex Resend to $20 **and** T4 to $18) |
| F.3 total band | $125–145 | **$117–145** on true line minima ($107 + $10) |
| F.3 Vercel note | "a second project or environment adds nothing" | **True of seats, false of usage.** The $20/mo usage credit is **team-level**; Live and Test consume one pool. §7.1's own long-running-compile posture contradicts the line |
| F.3 Supabase Test increment | ≈$10–15 asserted | Structurally right, but the org's **100 GB storage / 250 GB egress allowances are shared** — Test's storage displaces Live's. State it |
| F.3 CI | "runs on CI runners already inside the Vercel/CI lane" | ⚠ **DELETE.** Vercel has no general-purpose CI runners. **Add a row: `CI (GitHub Actions + baseline storage) ≈$35–80/mo — scales with library size, not customers; NFR-6(a) cadence-dependent`.** It is the **second-largest line** in the model and the only one that scales with library size |
| F.3 margin | ">95% infra margin" | **False on every reading.** Per-Pro fully loaded $0.79 → **93.7%**; per-account $0.13 and marginal $0.11 both sit *below* the stated $0.15 floor. Retire the band |
| F.4 monthly midpoint | $13.82 | **$13.81** (13.8125). A rounding-order artefact, ~1¢, **moves nothing downstream** — blended stays $12.61 |
| F.4 midpoint column | — | **Undeclared 50/50 geographic split.** Add one clause: a fully international book nets **$12.50** blended (−0.9%) |
| F.5 G7 headline | 9–10 | **≈11 on total permanent fixed (9–10 on the baseline before Test)** — §4 makes Test permanent from the first customer, and break-even requires ≥1 customer, so the 9–10 state cannot exist |
| F.5 with CI costed | — | **≈15 Pro subscribers.** Costing CI moves the headline **~35%** — four times every other F.5 correction combined |
| F.5 bands | 8.7–10.3 / 9.9–11.5 | On corrected floors: **8.5–10.3** / **9.3–11.5** |
| F.6 monthly tenure | report's **19.0** | ⚠ **the report is WRONG — KEEP 19.75.** `1 + 0.75 × (1/0.04) = 19.75`. Three independent checks confirm it: the yearly row uses the identical convention and reproduces 2.94 exactly; the 6%-sensitivity figure reproduces at $281.36 under 19.75's convention and $213 under the report's; and F.6's own stated interpretation (25-month phase life) is consistent. **Applying the report's fix would break the only table in Appendix F that reconciles end to end.** Delete the finding |
| F.7 storage | "comfortably inside Supabase Pro's included storage" | **Retire the phrase — it is 11×** (1,100 GB against 100 GB). ⚠ **But do NOT correct the dollar band:** overage at $0.021/GB is **$21/mo**, total ≈$156, which is *inside* the stated $140–190. A reader applying "wrong by 10×" to the dollars would restate infra at $1,400–1,900 — wrong by 10× the other way |
| F.7 artifacts + snapshots | unmodeled | **NEW line:** artifacts 200×25×10 + 1,000×1×3 = 53,000 at 0.5–2 MB = 26–106 GB; snapshots 3,000 at ~3 MB ≈ 9 GB; overage **$0.7–2.4/mo**. Inflozo-borne by design (FR-J7, FR-J13) |
| F.7 egress | unmodeled | **NEW line:** 250 GB + 250 GB cached included, then $0.09/$0.03 per GB. Editor asset traffic for 1,200 accounts is unmodeled and has no stated quota exposure to bound it |
| F.7 "1,000 Free ⇒ ≈31 Pro" | optimistic | **Undefined, not merely optimistic.** G9 is a *cohort rate within 90 days*, used here as a *stock ratio*. Steady-state Pro stock = (0.03 × monthly signups)/0.04 = 0.75 × monthly signups, while Free accumulates every non-converting signup that never churns. With no Free-churn assumption the denominator grows without bound and the share → 0 |
| F.7 monthly-only contrast | "≈$2,700" | **$2,764** (200 × 13.82) |
| F.7 paid share | — | 16.67%, 5.56× the 3% goal. **PASS — tick.** |
| F.4 rows 11,12,14–22 · F.5 24–27 · F.6 31–38 · F.7 39,45–47 | — | **PASS. Tick, do not touch.** |

**Propagates to — outside Appendix F:**
- **§1.3 G7** — currently "infra break-even at **9–10** Pro subscribers … **before** the permanent Test-environment cost". Rewrite to the two-number form, and to the CI-costed figure. G7 is a headline goal; it must not answer a question nobody asked.
- **§7.6 "Assumed, unvalidated" table** — the **G7 row** ("infra break-even at 9–10") moves. Add rows for the frame count, the per-frame rate, the pre-revenue duration, and the Free-churn assumption F.7 needs and does not have.
- **§7.6 risk table** — the **"Library scale (485 variants) slips schedule"** row: H22 forbids writing it as a descope prompt. Rewrite to a **timeline** risk with a **longer-runway** mitigation. Add the **solo-founder / dev-team** risk row (a v3.0 finding: the dev-team assumption is load-bearing and unstated as a risk).
- **§4 "No de-scope contingency"** — cross-reference H22 as the governing constraint, and cross-reference F.3a.
- **§4** — "Budget the CI lane accordingly" now has an answer; point at F.3b's CI row.
- **NFR-4** — mandates PITR; **Appendix F costs no PITR line** (a v3.0 finding). Add the line or state the cost is inside Supabase Pro.
- **§7.1** — "Thumbnail capture is not server work … so no headless browser runs on Vercel and **Appendix F carries no Chromium line item**." H18 (L30) replaces client-side capture with static placeholders in v1, which *strengthens* this. Verify both read correctly after L30.
- **FR-J14** — post-GA monthly library drops grow the CI line **every month, forever, with no offsetting revenue mechanism**. State the consequence in F.3b, and cross-reference FR-J14.
- **NFR-6(a)** — the cadence *is* the cost driver (L8). Cross-reference.
- **§8 E15** — owns the gates and the cutover; verify no cost claim lives there.
- **Appendix F.2** — unchanged. **Tick.**
- **Appendix F.1 plan matrix** — new rows may be needed for the card module (L5) and the post-content design picker (L6); the matrix is the *sole* definition of gating.
- **Appendix I glossary** — **Test environment** entry says "a standing, costed line item"; verify against the restructured F.3b.

**Counts affected:** every figure in the table above. **Re-derive the whole of Appendix F from its own stated inputs, not from the report and not from the current text.** The verification did exactly this and found 30 PASS / 18 FAIL, of which 8 the report never caught and 2 the report got wrong.

**Conflicts:**
- The whole of F.3's "Variable cost is negligible by design" paragraph — CI is a **fixed** cost mislabelled as variable, because it scales with library size (fixed at 485 and growing monthly by commitment), not with customers. **Move it above the line; do not leave it in the paragraph that waves it away.**
- F.6's tenure finding — **delete the finding, keep 19.75.**
- F.3's $127 maximum — **the report's number, not the PRD's; do not encode it.**
- F.7's "comfortably inside" phrase.
- F.3's Vercel-usage and CI-runner clauses.
- ">95% infra margin".

**New content required:**
- F.3a (build cost), F.3b (run cost with the CI row), the honest preamble paragraph, the two-number F.5, and a time axis.
- The four structural consequences: unbounded pre-revenue period; CI as fixed-not-variable; Test as a **schedule/risk** cost as well as a dollar cost (post-cutover, Live has **no Ghost deploy target at all**, so every deploy-path regression must be caught on Test or in production by a customer — that is an unpriced risk row); and the cost side's founder-estimate labelling, which F.7 applies to revenue and not to cost.

---

## L10 · JSLIB + Q2 + Q3/R1 + R2 + R3 + H3 — 31 vanilla behaviour modules, the module rulebook, and a pinned browser baseline

**Ruled as:** **31 modules** (30 feature + 1 shared core), **ALL VANILLA, ZERO third-party runtime dependencies in a generated theme**; 22 libraries measured and rejected. **10 further behaviours need no JS at all** (`<details>`, `:has()`, server-side `{{#if @member}}`, CSS `sticky`, `columns`, `scroll-behavior`, `<audio controls>`, native pagination, CSS transitions). **Swiper REJECTED on size** — v11 core alone measures 19.61 KB gzipped, a minimal modular build 27.48 KB, versus a 40 KB total budget; `scroll-snap` + ~1.2 KB of vanilla is a *more literal* reading of the inventory, whose carousel designs all say "snap", and it removes the cloned-slide `aria-hidden` failure class structurally. **Conditional fallback if desktop mouse-drag proves essential: Embla 8.6.0, MIT, 7.16 KB.** **LICENCE LANDMINE:** `typed.js` relicensed MIT → **GPL-3.0** at v3.0.0 and GPL is now npm `latest` — **hard reject** (it would have shipped GPL code inside themes users own and resell); pinning v2.1.0 is also rejected as a security dead end. **Q2:** write the **behaviour-module rulebook** — JS ships **with** its section and is removed when the section is removed; each module is authored alongside its section during the L1 pass, not as a separate module project. **Q3/R1:** a **single** JS threshold of **40 KB gzipped per page** (NFR-2's existing number; supersedes the 50/100 the owner set earlier in the session, so the PRD carries one number, not two) — **developer-facing warning only, no build failure**. **R2:** browser baseline is **Baseline "Widely Available"**, pinned via `browserslist-config-baseline` with `widelyAvailableOnDate: 2026-08-18`, computing to **Chrome/Edge 121, Firefox 122, Safari/iOS 17.2**; enforced by `stylelint-plugin-use-baseline` (runs on flat CSS with no build step), `eslint-plugin-compat` and `size-limit`. It governs what all 485 designs may use in **both CSS and JS**. **R3:** CSS scroll-driven animations are **not** Baseline (no Firefox) → reading-progress and scroll-reveal use `IntersectionObserver`; `popover` is Newly-available only (needs iOS 18.3) → modals use native `<dialog>`. **H3:** **strip dead CSS**, and each **variation owns its own CSS** — removing a variation removes its CSS **and its JS** with it. **Authoring constraints:** no jQuery; vanilla by default; a library only where vanilla is genuinely a bad idea; libraries researched **per section**, never chosen ad hoc; target modern browsers in real use, no support for negligible-share legacy versions.

**Source:** #252 (Q2), #252/#266 (Q3), #269–#271 (R1/R2/R3), #272 (JS library decision settled), #268 (H3) · research: `research-section-js-libraries.md`
**Blast:** LARGE. **Encode tenth.**

**Home:** FR-J4 (behaviour-module bundling) + a new FR-G for the module rulebook.

**Propagates to:**
- **FR-J4** — ⚠ its module list is a **3× undercount** (a v3.0 critical). Currently: mobile nav, load-more, infinite scroll, marquee, accordion, lightbox, TOC scroll-spy, count-up, mode toggle, + the A23 search client. **Replace with the 31-module registry** (or point normatively at the rulebook). Keep the "bundled only if used" and "Vanilla JS, no framework, deferred" clauses — they are now *stronger*, not weaker.
- **FR-J4** — add the **vendored Ghost card scripts** (L5) as a second bundle input distinct from the 31 modules, so the "no third-party runtime dependency" claim stays literally true (the card JS is Ghost's own MIT code, vendored, not a dependency). **State the distinction explicitly or the claim reads as false.**
- **NFR-2 JS budget** — currently "< 40 KB gzipped for a *maximal design*", where maximal = every FR-J4 module + the A23 search client. **Redefine maximal** as: all 31 modules + the A23 search client + `cards.js`. Then re-derive: research measured a realistic 15-section marketing home at **10.3 KB** and an all-31-module page at **17.5 KB**, both comfortably inside 40 — but neither included `cards.js`. **Flag the re-derivation.**
- **NFR-2** — the gate becomes a **developer-facing warning, not a build failure**. That is a *weakening* of a CI gate and must be stated as a deliberate choice with its reason (nothing realistic approaches the threshold), not slipped in.
- **NFR-2** — enforcement tool named: **`size-limit`** over the compiled `assets/js/main.js`. Add to §7.1 or NFR-6.
- **NFR-2's CSS budget (assertion 4, ≤50 KB gzipped per rendered template)** — a v3.0 finding says it **has no artifact to measure**, because `screen.css` is one file for the whole theme, not per template. Resolve: either measure per-template by computing the used-section subset, or restate the budget against `screen.css`. **This is a real contradiction; pick one.**
- **NFR-2 assertion 2 (fonts subset + preloaded + woff2-only)** — contradicts **Appendix D.b** for non-latin projects, which ship the **full face**. Rewrite assertion 2 to carve out the non-latin case (D.b already states the reconciliation; NFR-2 has not caught up).
- **NFR-7 Compatibility** — ⚠ **CONFLICT.** Currently "evergreen Chrome/Edge/Firefox + Safari 16.4+". Replace with the pinned Baseline floor: **Chrome/Edge 121, Firefox 122, Safari/iOS 17.2**, pinned by `browserslist-config-baseline` at `widelyAvailableOnDate: 2026-08-18`. State that the pin is a **date**, so the floor moves only when the date is bumped deliberately.
- **FR-K2** — justifies `canvas.toBlob('image/webp')` as "supported by every browser inside **NFR-7's floor**, Safari included, since well before 16.4". The floor moves to 17.2, so the claim gets *safer* — but the sentence references 16.4 explicitly and must be updated so it does not read as a stale floor.
- **FR-G4** — "functional with JS disabled (JS is progressive enhancement — marquees pause, accordions render open, load-more **and infinite scroll** fall back to numbered links, and Auto dark mode applies via the `prefers-color-scheme` media query)". **Expand to a per-module no-JS degradation statement** — the research supplies one per module (§7 of `research-section-js-libraries.md`). This is the clause the 485 designs are actually built against.
- **FR-G4** — ⚠ **`prefers-reduced-motion` is never mentioned for generated themes, and 13 variants auto-move indefinitely** (a v3.0 HIGH). Add it: the `core` module gates on `matchMedia('(prefers-reduced-motion: reduce)')`. Also **Appendix H** mentions reduced-motion only for the confetti moment in Inflozo's own UI.
- **FR-G3 registry entry format** — `js?` becomes a **module reference plus an edit-safe flag** (L20's Q4). Add the fields.
- **FR-G3** — `css` clause already says "plain CSS consuming Style Pack custom properties only, authored outside the app's build pipeline and explicitly excluded from any Tailwind processing". **H3 adds: each variation owns its own CSS file and its own JS, and removing a variation removes both.** State it here and in §7.1.
- **§7.1 "Section CSS authoring format"** — add the Baseline enforcement tooling (`stylelint-plugin-use-baseline` runs on flat CSS **with no build step** — that is precisely why the baseline choice is what makes zero-build-step viable). Add `eslint-plugin-compat` for the modules.
- **§7.1** — add the licence filter as a **hard rule**: MIT / BSD / Apache-2.0 / ISC only, because users **redistribute and possibly sell** the generated theme. GPL/AGPL/LGPL is disqualifying. Name the `typed.js` case as the reason the rule is enforced rather than assumed.
- **§7.3** — "one plain CSS file (§7.1), an optional JS behavior module" → per-variation ownership; and the dead-CSS problem (a v3.0 HIGH: "the data-attribute CSS mechanism guarantees dead CSS, and nothing measures it") is answered by H3's strip. State the strip as a compiler obligation and give it a measurement.
- **FR-J3** — "Section CSS is emitted only for placed sections" — extend to **per-variation** granularity and to JS. Add the dead-CSS strip.
- **§7.4** — `assets/js/main.js  # used behaviors only` — amend to name the module set and the separate `cards.js`.
- **§7.6 verify-at-build** — add: re-compute the Baseline floor before each library wave (the date pin means the floor is stable, but `web-features` data moves); re-verify every vendored/allowed library's licence at each bump.
- **§7.6 risk table** — new row: a licence relicensing in a shipped dependency puts GPL code inside themes users sell. Mitigation: the hard permissive filter + a licence check in CI.
- **§7.6 "Assumed, unvalidated"** — the 10.3 KB / 17.5 KB measurements are *measured*, not assumed; keep them out of this table but cite the method.
- **§8 E4** — the `core` module, the module registry, the `data-i18n-*` reader and the shared `IntersectionObserver` factory are E4 platform work, not per-section work. Add to E4's Owns/scope.
- **§8 E9–E11** — each category story now delivers its modules alongside its sections (Q2). Add to the story-granularity note.
- **§8 E7** — owns FR-J4's bundling and the `size-limit` gate.
- **Appendix C** — no control changes, but the **Date Picker** underpins `countdown` and the **Member Visibility** control is server-rendered (`{{#if @member}}`, zero JS). Verify Appendix C's notes do not imply client-side gating.
- **`sections-inventory.md`** — per-variant specs (L1) must each name their module(s), their edit-safe status (L20) and their no-JS degradation. That is a **new required field in every per-variant spec**.
- **`appendix-h1-string-catalog.md`** — the **29 JS-marked keys** must cover exactly the modules that write visitor-facing text. Re-derive against the 31-module list; the catalog was written against FR-J4's 10-module list. **§4 totals move.**
- **Appendix I glossary** — add **Behaviour module**, **Baseline (Widely Available)**, **Edit-safe module**.
- **Preamble companion manifest** — add `research-section-js-libraries.md` as the source of truth for the module list, the baseline and the licence filter.
- **§1.4 / §1.2** — the "no third-party runtime dependencies in a generated theme" result is a real differentiator and is currently unstated. Consider adding it to §1.4 (owner-optional; flag, do not invent).
- **Context worth stating once (not a requirement):** Ghost's own `sodo-search` measures **86.5 KB gzipped** — five times Inflozo's entire maximal section runtime, injected by Ghost, and not Inflozo's to remove. It belongs in NFR-2's framing so the budget is read in proportion.

**Counts affected:**
- **31 modules** (30 feature + 1 core) — NEW; replaces FR-J4's ~10.
- **10 no-JS behaviours** — NEW.
- **22 libraries measured and rejected** — NEW (evidence count; state or omit deliberately).
- **40 KB** — retained; **50 KB / 100 KB retired.** Verify no surviving mention of 50 or 100 KB anywhere.
- **10.3 KB realistic / 17.5 KB maximal** — NEW; re-derive with `cards.js` (L5).
- **Baseline floor: Chrome/Edge 121, Firefox 122, Safari/iOS 17.2** — replaces Safari 16.4+.
- **Embla 8.6.0 / 7.16 KB** — the one conditional exception; state it as conditional or omit it, not both.
- **`appendix-h1-string-catalog.md` JS-marked keys: 29 → ?** and its §4 totals.
- **NFR-2's CSS budget 50 KB gzipped per rendered template** — subject unresolved (see above).

**Conflicts:**
- **NFR-7's "Safari 16.4+"** — delete.
- **FR-J4's module list** — delete and replace.
- The 50 KB / 100 KB thresholds from earlier in the session — **must not appear anywhere**.
- NFR-2 assertion 2 vs Appendix D.b.
- NFR-2 assertion 4's unmeasurable subject.
- Any implication that a section's JS survives the removal of the section.

**New content required:**
- The **behaviour-module rulebook** — a new FR (FR-G8 or equivalent): the 31-module registry, ship-with-its-section lifecycle, edit-safe declaration (L20), per-module no-JS degradation, the `core` module's shared services, and the licence filter.
- The **browser-baseline policy** as its own FR (FR-G9 or equivalent), since it governs both CSS and JS across all 485 designs and has CI enforcement.
- The per-module no-JS degradation statements (31 of them).
- The dead-CSS strip rule and its measurement.

---

## L11 · BATCH-3 + Q15 — `routes.yaml` automated upload becomes the PRIMARY path

**Ruled as:** ⚠ **VERIFIED CORRECTION of the PRD, not of the report.** FR-I4's *"There is no automated upload path, on any Ghost version or host"* is **FALSE**, and the PRD **disproves it two requirements away**. Two facts: (a) the route is **`POST /settings/routes/yaml`**, `multipart/form-data` with the file under field name **`routes`**, passing `upload.validation({type: 'routes'})` — **there is no `PUT` on that path in Ghost 6**; (b) `tokenPermissionCheck` applies the integration allowlist only to tokens **without** a `user_id` — a **staff token** hits a three-entry blocklist (delete-all-content, transfer-ownership, reset-authentication) and otherwise falls straight through to the permission system, where fixtures grant `Administrator: setting = all`. FR-C1 **already** mandates the Owner's Staff Access Token as required-not-optional, and FR-J13/FR-J16 rely on the **identical bypass** to reach `GET /themes/*`. **Rewrite so automated upload via the Owner's Staff Access Token is the primary path and the guided Labs card is the designed fallback** for token-absent / revoked / non-Owner cases. **Keep FR-I4's byte-for-byte `GET /settings/routes/yaml` verification verbatim** as the confirmation step for the automated path. **This settles §7.6 item 9 definitively, for both `themes` and `settings`.** **Q15: re-examine FR-I5 now that routes auto-upload lands.**

**Source:** #246 (batch items 3 and 7), #253 (Q15) · verification: `verify-mechanical-ghost-claims.md` claim 17 (CONFIRMED)
**Blast:** LARGE. **Encode eleventh. Interacts with L28 (H15's no-token path) and L26 (V2's filter-builder rule) — encode L11 before both.**

**Home:** FR-I4.

**Propagates to:**
- **FR-I4** — rewrite. Delete *"There is no automated upload path, on any Ghost version or host"* and *"the guided 'one more step' card … is the **only** upload flow"*. Fix the method to **POST**, state the multipart shape and field name, state the credential (Owner Staff Access Token), and demote the Labs card to a **designed fallback**. Keep the byte-for-byte verification and the "no unverified limbo state" clause verbatim.
- **FR-I5** — ⚠ its whole product claim trades on the manual step existing: *"a project can ship a fully designed signup, signin and member-home page and still deploy with default routing and no `routes.yaml` at all, which is **one manual Ghost Admin step fewer** than a routed surface would have cost."* With auto-upload, a routed surface costs **zero** manual steps in the happy path, so the comparison collapses. **Rewrite FR-I5's rationale.**
- **FR-I1** — *"**No route is emitted and none is needed:** designing a membership page adds no `routes.yaml`, and therefore **removes a manual Ghost Admin step** rather than adding one (FR-I4, FR-I5)."* Same collapse. **Rewrite.**
- **FR-O1** — *"a starter's first deploy never requires the manual routes step (FR-I4) … the confetti moment stays uninterrupted."* Rewrite: the confetti moment is uninterrupted for a *different* reason now.
- **Appendix E preamble** — same claim, mirrored. Rewrite.
- **FR-C1** — the Staff Access Token's justification list currently names snapshot (FR-J13) and drift (FR-J16). **Add routes upload.** This makes the token *more* load-bearing, which interacts with H15/H16 (L28/L29): the graceful no-token path must now also cover routes.
- **FR-C3** — key security: the token is used for a **write** now, not only reads. State it.
- **FR-C5** — the daily health check re-reads the live `routes.yaml`; unchanged in mechanism. **Tick.**
- **FR-J8 / FR-J11** — deploy stages: does routes upload become a deploy stage? The five-stage UI is Compiling → Checking → Uploading → (Activating) → Live. **Routes upload needs a home in that sequence, or an explicit statement that it is a separate action.** Decide and state.
- **§7.2 "Content & data flow"** — *"Editor → Inflozo server → user's Ghost **Admin API** only for: connection validation, theme upload/activate, reading the live `routes.yaml` for drift verification (FR-I4 — **there is no automated routes *upload* path on any version or host**)."* ⚠ **Delete the parenthetical. Add routes upload to the allowed list.**
- **P8 (Ghost content is read-only)** — *"The Admin API is used solely for connection validation, theme upload/activate, **reading** the live `routes.yaml` to verify the user's guided upload (FR-I4), and reading the live theme…"* ⚠ **P8 now permits a `routes.yaml` write.** `routes.yaml` is site configuration, not content — but P8's sentence must be amended and the read-only-content promise re-scoped explicitly, or P8 reads as violated.
- **§7.6 verify-at-build item 9** — *"Whether the Owner's Staff Access Token lifts `GET /themes/`"* — **CLOSE IT** with the source citation, for **both** `themes` and `settings`. Item 9 currently gates FR-J10's guarantee too; closing it changes FR-J10.
- **FR-J10** — *"whether the Owner's Staff Access Token lifts that block is a §7.6 verify-at-build item, and **until it is confirmed** the frozen name is tracked in Inflozo's own per-project×site binding record."* With item 9 closed, **real theme-name collision detection becomes possible.** Rewrite FR-J10's hedge; decide whether the binding record stays (recommended: keep it, it is still the source of truth and is pruning-exempt) and say why.
- **§7.6 risk table** — the *"`routes.yaml` cannot be uploaded by API on any Ghost version or host"* row is **now false**. ⚠ **Delete the row and replace it** with the real residual risk: the automated path depends on a staff token whose absence/revocation drops to the guided card, and the endpoint is not covered by Ghost's public API docs.
- **§7.6 risk table** — add a row for the batch item 7 requirement ("close 7.6 item 9 with citation + risk row").
- **FR-L3** — *"**`routes.yaml` is exempt** from the code-surface clause: it contains no section code, **FR-I4's download is the only way to complete a routed deploy**…"* ⚠ the "only way" clause is now false. Rewrite while keeping the exemption.
- **Appendix G** — the *"in-app compiled-code viewer"* deferral entry repeats FR-L3's reasoning about `routes.yaml` and FR-I4. Verify it still reads correctly.
- **FR-N4 docs** — *"routes.yaml upload step"* is a named docs page. It becomes a fallback page, not the main path. Rewrite the page's scope.
- **§8 E7 exit criteria** — *"routes round-trip through the guided card and verify by byte comparison"* → must now verify the **automated** path **and** the fallback card.
- **§8 E3** — the connect wizard explains why the staff token is required; add routes upload to the explanation.
- **Journeys/flows mandate (preamble note)** — one of the five named flows is *"FR-I4's guided routes-upload card"*. It stays a designed flow (as the fallback) but its framing changes. **Amend the preamble note.**
- **Appendix I glossary** — no direct entry, but verify **Routes Manager** and **Preview-only** entries do not carry the stale claim.

**Counts affected:** none directly. But **manual Ghost Admin step counts** are used rhetorically in FR-I1, FR-I5, FR-O1 and Appendix E — every one of them changes and each must be re-derived.

**Conflicts (all must be deleted, not appended to):**
- FR-I4's "no automated upload path, on any Ghost version or host".
- FR-I4's "the **only** upload flow".
- FR-I4's `PUT` method string.
- §7.2's "there is no automated routes *upload* path on any version or host".
- §7.6's routes-upload risk row.
- FR-L3's "FR-I4's download is the only way".
- FR-I1 / FR-I5 / FR-O1 / Appendix E's "one manual step fewer" arithmetic.
- P8's Admin-API-usage list.

**New content required:**
- The automated-upload requirement with its credential, method, multipart shape and validation step.
- The fallback trigger conditions (token absent / revoked / non-Owner) as a designed flow.
- The revised P8 scoping sentence.
- The replacement §7.6 risk row.

---

## L12 · D9 — all six contested variants survive; the Admin API key is confirmed unsafe **and** unnecessary

**Ruled as:** **ALL SIX VARIANTS SURVIVE. The count stays 485 (not 483).** The Admin API key is **CONFIRMED unsafe and CONFIRMED unnecessary**: the Admin Integration role carries `member:all`, `member_signin_url:read` and `theme:all` (site takeover); Handlebars has **no server-side fetch**, so a theme can only use the key by **printing it into the page**; and Ghost's Admin CORS allowlist includes the site's own hostname, so the exploit works. **Custom-setting cost across all six: ZERO**, because Ghost ships `{{total_members}}`, `{{total_paid_members}}`, `{{content_api_key}}` and `{{content_api_url}}` as **core helpers** — all four verified present in current Ghost source.

⚠ **REVIEWER ERROR, caught by owner pushback:** critical finding #18 claimed member counts are Admin-API-only and never in template context. **FALSE** — `{{total_members}}` is a core **keyless server-side** helper (rounds down and appends `+`). This was the **second** reviewer platform-assertion in the session to fail verification, and it is the same failure class the stress test itself identified.

**Per-variant rulings:**
| Variant | Ruling | What must be written |
|---|---|---|
| **A7 #12 Founding Member** | **KEEP as designed** | Via `{{total_members}}`. **Copy must treat the value as a string** — Ghost rounds down and appends `+`, so the design cannot do arithmetic on it or format it |
| **A32 #10 Blurred Preview** | **KEEP** (owner's clarified intent) | Blur the **last visible free-preview block** via a **theme-supplied `partials/content-cta.hbs` wrapper plus a `mask-image` gradient**, because Ghost emits preview blocks **bare, with no wrapper** |
| **A32 #12 Progress Tease** | **REDEFINE** as an **approximate** tease | `reading_time` is computed **before** gating so it reflects the **full** post, but it is coarse to **±137 words** → copy is **"About X%"**, **bucketed to 5%**, **hidden under 3 min**, with a **server-rendered no-JS baseline** sentence |
| **A29 #13 Filter Bar Attached** | **REDEFINE** as a **progressive filter strip** | Server-rendered tag/author links; JS refetch via the **Content API** (browser-safe, `{{content_api_key}}` supplies the key); **limit caps at 100**; **sort only on real schema columns** |
| **A27 #11 Discover Shuffle** | **REDEFINE** + **RENAME** (Q7) | Client-side **Fisher-Yates** over a **≤100-post pool**; honestly *"random from the 100 most recent"*; degrades to a **latest-posts row**. The name "Discover Shuffle" **overclaims** — Q7 rules it renamed to match what it does |
| **A19 #11 Quote Feature** | **REDEFINE** as **Excerpt Quote** | From `custom_excerpt` **only**, never `{{excerpt}}`, whose 500-char plaintext fallback yields a mid-sentence fragment inside quote marks |

**Source:** #240 (D9 pushback), #241 (resolved by research), #242 (reviewer override), #243 (per-variant), #253 (Q7) · research: `research-contested-variants.md`
**Blast:** LARGE. **Encode twelfth.**

**Propagates to:**
- **`sections-inventory.md` A7 #12** — rewrite the descriptor; add the string-not-number copy constraint to A7's `Content:` line.
- **`sections-inventory.md` A32 #10** — rewrite; state the wrapper + `mask-image` mechanism.
- **`sections-inventory.md` A32 #12** — rewrite; state the ±137-word coarseness, the 5% bucketing, the <3-min suppression and the no-JS baseline sentence. Add the **progress meter toggle (#12)** control's real semantics to A32's `Controls:` line.
- **`sections-inventory.md` A29 #13** — rewrite; add the limit cap and the sortable-column set to A29's `Controls:`/`Data:` lines. A29's `filter/sort strip toggle (#13)` control gains a real definition.
- **`sections-inventory.md` A27 #11** — **rename** and rewrite; state the ≤100 pool, Fisher-Yates, the honest label and the degradation.
- **`sections-inventory.md` A19 #11** — **rename to Excerpt Quote** and rewrite; state `custom_excerpt` only.
- **`sections-inventory.md` A19's `Content:` line** — must distinguish `custom_excerpt` from `excerpt`. Today Appendix B lists both; the inventory must name which one A19 #11 binds.
- **Appendix B — Post/Page field list** — already lists `excerpt, custom_excerpt`. **Add the normative distinction:** `{{excerpt}}` falls back to 500 chars of plaintext; `custom_excerpt` is the authored field. This is a general trap, not an A19 detail.
- **Appendix B** — ⚠ **add the four core helpers**: `{{total_members}}`, `{{total_paid_members}}`, `{{content_api_key}}`, `{{content_api_url}}`. They are **not** Content API resources and not currently in the catalog. `{{total_members}}` **rounds down and appends `+`** — state it, or a design will do arithmetic on a string.
- **FR-H5 helper shim list** — the shim must cover the four new helpers. **Add them** and state their canvas behaviour (`{{total_members}}` on an unlinked project renders a sample value; `{{content_api_key}}` must **never** render a real key on canvas).
- **NFR-3** — `{{content_api_key}}` printing the site's Content API key into the page is **by Ghost's design** (the key is browser-safe), but it interacts with NFR-3's carve-outs. **State that emitting `{{content_api_key}}` is permitted and why, and that emitting an Admin key is forbidden anywhere, on any surface.** This is the security decision's home.
- **NFR-3 / FR-C3 / §7.6** — add the explicit prohibition: **an Admin API key is never stored in a Ghost theme custom setting, never printed into a page, and never asked for beyond FR-C1's connect flow.** Cite the three reasons (role scope, no server-side fetch in Handlebars, Admin CORS includes the site's own hostname).
- **FR-Q2 / FR-Q5 / Appendix F.1** — the 20-setting cap is **unaffected** (zero settings spent). **Tick explicitly** — this was the reason the research was commissioned.
- **FR-G1 / Appendix A / `sections-inventory.md` totals** — **485 stays.** Tick. The alternative (483) must appear nowhere.
- **FR-G4** — the no-JS degradation for A29 #13 and A27 #11 becomes normative (feeds L10's per-module statements).
- **FR-H2 Data group** — A29 #13's filter strip and A27 #11's shuffle are Data-group behaviours with a **100-item ceiling**. ⚠ Cross-check against the verified `{{#get}}` cap correction (L23): the cap is **Ghost 6 only**, defaults to 100, is **operator-overridable**, and Ghost 5 has no cap. FR-H2's Count control must be capped at 100 for a 0-warning v6 scan.
- **`appendix-h1-string-catalog.md`** — new strings: the filter-strip labels, the shuffle refresh label, the progress-tease "About X%" sentence and its no-JS baseline, the excerpt-quote attribution. **New keys in `archive.*`, `post.*` and possibly a new namespace; §4 totals move.**
- **`appendix-h1-string-catalog.md` §3.10 `archive.*` (8 keys)** — filter/sort labels land here.
- **Appendix H** — the renamed A27 #11 and A19 #11 names are product-visible strings; verify against the voice canon.
- **§8 E10 / E11** — A7, A19, A27, A29, A32 span waves; the redefinitions must reach whichever restructured block owns each (L2/L3).
- **§7.6 verify-at-build** — item 14(b) already flags the **tiers-visibility contradiction** between `research-ghost-binding-contexts.md` and `research-ghost-membership-pages.md`. Add: confirm `{{total_members}}`'s rounding behaviour on a live site, and confirm `{{content_api_key}}` renders in a theme context.
- **§7.6 risk table** — add: a design that treats `{{total_members}}` as a number breaks silently.
- **`research-contested-variants.md`** — **add to the preamble companion manifest** as the source of truth for these six variants and for the Admin-key prohibition.
- **Appendix I glossary** — verify **Non-placeable treatment** still lists A32/A33/A34 correctly after A32's two redefinitions.

**Counts affected:**
- **485 → 485.** Explicitly confirm; the 483 alternative must not survive anywhere.
- **20-setting cap → unchanged (zero cost).** Confirm.
- **`{{#get}}` limit ceiling: 100** — Ghost 6 default, operator-overridable, absent on Ghost 5.
- **±137 words** and **5% buckets** and **3 min** — NEW numbers in A32 #12.
- **≤100-post pool** — NEW number in A27 #11 and A29 #13.
- **Catalog key totals** move.

**Conflicts:**
- Any text implying these six variants are impossible, cut, or reduced to 483.
- Any proposal to store an Admin API key in a theme custom setting — **must be explicitly forbidden**, not merely absent.
- A27 #11's name "Discover Shuffle" and A19 #11's name "Quote Feature".

**New content required:**
- Six rewritten variant descriptors plus two renames.
- Appendix B's four core helpers and the excerpt/custom_excerpt distinction.
- The Admin-key prohibition as normative text.
- New catalog keys.

---

## L13 · Q5 — layout = variation = design: ONE term

**Ruled as:** **ONE term: design.** The picker selects among a section's **designs** (Reading A) — it is **not** a sub-arrangement within one design. Navigation is `[` and `]` keys, **Previous/Next design** arrows, or clicking a thumbnail in the sidebar. **VERIFIED:** the design directory already ships this — "Previous design"/"Next design" appear in S4 Editor and S6 Variant Shuffle, and "Layout" appears in the Editor Sidebar Kit. **Only `prd.md` was ambiguous.** **Rename the sidebar label from "Layout" to "Design"** so it stops implying a sub-arrangement.

**Source:** #258
**Blast:** LARGE — it is a vocabulary change touching every surface that names the concept. **Encode thirteenth, before any Appendix C / Appendix I / inventory naming edit.**

**Home:** Appendix I glossary — "Section / variant" and "Variant Shuffle".

**Propagates to:**
- **Appendix I glossary** — "Section / variant": *"a variant is one structural **design** within a section category"* already says design. Make the three-way equivalence explicit and state that **layout**, **variation** and **design** are one term, with **design** canonical. Amend **Variant Shuffle**. Consider whether "Variant Shuffle" itself should be renamed — ⚠ **owner-decidable**; the design directory ships "S6 Variant Shuffle", so the *feature* name likely stays while the *unit* becomes "design". **State the split.**
- **FR-D13 Variant Shuffle** — currently "cycles the selected section through its category's **variants**". Reconcile with the canonical term.
- **FR-D2** — hover quick actions "Variant Shuffle ◀ ▶" → **Previous/Next design** arrows.
- **FR-D11 keyboard map** — `[` and `]` shuffle variant → **shuffle design**.
- **FR-D12 Section Picker** — "live previews … the user browses the library"; verify unit naming.
- **FR-D17 Site Remix** — "every placed section's variant" → design.
- **FR-F1 Layout Picker** — ⚠ **NAME COLLISION.** The **Layout Picker** control (mini-diagram thumbnails) is a *within-design* control, and it is the **first Quick Control on 30 of 34 categories** — and a v3.0 critical says it **has no defined value set and the doc disagrees with itself about what it is.** Under Q5, "Layout" must stop meaning "design". **Decide: keep "Layout Picker" as the control name (and give it a real value set) while "Design" names the unit, or rename the control.** Whichever, resolve the collision explicitly — this is exactly the ambiguity Q5 exists to kill.
- **Appendix C** — the **Layout Picker** row ("per-section layouts", "the primary 'arrange without CSS' control") must be reconciled with the above and given a defined value set.
- **FR-F3 sidebar structure** — the sidebar's group names and the renamed label.
- **`sections-inventory.md`** — every category's `Controls:` line begins with "layout picker". If the control keeps its name, tick; if renamed, **34 edits**.
- **`sections-inventory.md` preamble** — the "variant descriptors define the *structural* identity" sentence and the shuffle/partition paragraphs.
- **Appendix A** — the inventory table header says "Variants"; the mirrored preamble says "variant descriptors". Reconcile with the canonical term.
- **FR-G1 / FR-G2 / FR-G3 / FR-G5 / FR-G6** — all quantify over "variants". **Decide once whether the normative noun becomes "design" throughout or "variant" is retained as the registry noun with "design" as the user-facing noun. State the mapping in the glossary and apply it consistently.** Do not leave two nouns in play — that is the defect.
- **Appendix H — Voice & Microcopy Canon** — add the canonical user-facing noun; the canon already governs count-agnostic library copy and must now govern this noun too.
- **`appendix-h1-string-catalog.md`** — no theme-side keys use the word, but verify.
- **§8 E5 play-loop gate** — "20 consecutive Variant Shuffles" — naming.
- **§1.4 #2 Variant Shuffle differentiator** — "flip a placed section through every sibling **design** in its category (up to 18)". Already says design. **Tick.**
- **L4** — the per-design control set is the *reason* this term matters. Encode L13 and L4 as one vocabulary pass.
- **Design directory** (`_bmad-output/planning-artifacts/design/`) — already consistent; note in the map that the PRD is the one that moves, not the designs.

**Counts affected:** none. (**"up to 18"** in §1.4 #2 is the largest category count — A4, A17 = 18. Verify it survives L16.)

**Conflicts:**
- Any surface where "layout" means "design" and any surface where "variation" appears as a distinct concept — **delete the synonyms.**
- The sidebar label "Layout".

**New content required:**
- The glossary's one-term statement and the registry-noun ↔ user-facing-noun mapping.
- The Layout Picker's value set (also a v3.0 critical in its own right).

---

## L14 · D5 — an E0 verification spike ahead of E4, plus an owning-epic column in §7.6

**Ruled as:** Add an **E0 verification spike** ahead of E4 that executes **all 14** of §7.6's verify-at-build items against a real Ghost, **plus an owning-epic column** in the §7.6 table.

**Source:** #237
**Blast:** LARGE — it adds an epic and re-owns a whole table. **Encode fourteenth.**

**Home:** §8 — a new **E0** epic.

**Propagates to:**
- **§8** — insert **E0 · Verification Spike** ahead of E1. It owns no FRs (like E15) but owns the §7.6 closures. Give it a goal, representative stories and exit criteria.
- **§8 preamble** — *"Every FR in §5 is owned — by exactly one epic"*. E0 owns none; state that explicitly (E15 already sets the precedent: "Owns no new FRs; owns the gates").
- **§7.6 "Verify at build time" table** — **add an owning-epic column** to all 14 items. Several currently have no owner anywhere in §8 (a v3.0 critical: "§7.6's fourteen verify-at-build items have no owner anywhere in §8").
- **§7.6 item 9** — **CLOSED** by L11 with a citation. Decide: renumber (bad — breaks cross-references) or **mark closed in place**. **Recommend: mark closed in place, keep the number, add the citation and the risk row.** State the convention.
- **§7.6 items 1–14** — several are now answerable earlier or are superseded: item 2 (`hostSettings.limits` shape) becomes the **GPRO blocking gate** (L19); items 3 and 13 run on the droplet (L8); item 14's four membership checks are E0 work; item 6 (Dodo renewal notice) gates FR-P1's conditional sixth email.
- **§7.6** — **add new items** discovered this session: the `card_assets` chunk-name list per Ghost minor (L5); the `header`/`header_v2` pairing; the iframe `defaultView` lint rule (L7); the Baseline floor recomputation (L10); ⚠ **the residual NQL gap** — Ghost's resolved `@tryghost/nql` version could **not** be read from `ghost/core/package.json` (it declares `"catalog:"`, a pnpm catalog reference), so V2's defect is proven against `@tryghost/nql@0.13.1` and *that Ghost's runtime resolves to the same build is not verified*. **This is a stated limit of the verification and must be carried, not dropped.**
- **§7.6 item 13's `@even`/`@odd` warning** — *"the docs describe it backwards — the code makes the **first** item odd — and it would invert zebra striping across the entire library."* ⚠ Note the item currently says **"487-variant library"** in `appendix-b1-template-contexts.md:267`. **Stale count — see Part 5.** E0 must run this check **before** any category is authored, because it invalidates every alternating design.
- **§8 E1** — E0's outputs feed E1's schema story and E3's connect wizard. Add the dependency.
- **§8 E4** — D10 (L21) adds five data-* constructs and a third worked spike example to E4's exit criteria; E0's results feed them.
- **§4** — the T1–T4 targets are E0's substrate. Cross-reference.
- **Appendix F.3b** — E0 needs the droplet before E1; the droplet's cost starts earlier than the current model implies. Feed L9.
- **§7.6 "Assumed, unvalidated"** — items E0 cannot close (e.g. Dodo's MoR behaviour before a live account exists) stay here.
- **Appendix I glossary** — add **E0 verification spike** or leave epic names out of the glossary consistently (currently they are out — **tick**).

**Counts affected:**
- **14 verify-at-build items** → grows with the new items and one closes. **Re-derive the count and state it, or stop stating a count.**
- **Epic count**: E1–E15 → **E0–E15**, plus whatever L2/L3/L5/L6 add. Re-derive.
- **119 FRs owned by exactly one epic** — re-verify after every new FR lands.

**Conflicts:** none — this is additive. But §8's "every FR owned by exactly one epic" invariant must be re-proven, not assumed.

**New content required:** the E0 epic; the owning-epic column; the closed-item convention; the new verify-at-build items.

---

## L15 · D4 + D3 — §1.2's promise reworded to the true markup claim, and NFR-6(c3) rebuilt

**Ruled as:** **BOTH** — reword §1.2's promise to the **true markup claim** now, **AND** rebuild NFR-6(c3) with an **exclusion set**, a **region-scoped threshold** and a **rotating fixture cohort**; **fund it by shrinking the 8,730 render matrix**. **D3 (separate but same target):** **skip screenshots entirely** — code quality and functionality are what matter for the marketplace, not submission artifacts; **reword the quality bar so it does not hinge on marketplace SUBMITTABILITY.**

**Ruled against the evidence:** the spike proves **MARKUP agreement**, which is **narrower** than the "canvas is the page" claim resting on it. The spike also contains **two undetected defects** — `compile.js:36`'s canvas date renderer discards the format arg (canvas `2026-03-14` vs theme `14 Mar 2026`) and `compile.js:154`'s `wrapGuard` emits `{{#if YYYY}}` — both invisible to `test.js` because its assertions compare class skeletons and its date helper is a passthrough stub. And **gscan is near-worthless as a quality bar**: a deliberately terrible theme (no lang, no viewport, no alt, inline `onclick`, scrambled headings, 1.5:1 contrast, missing templates) scores **0 errors / 0 warnings on both v5 and v6**, while real Casper and Source each **FAIL a rule with an error**.

**Source:** #236 (D4), #235 (D3), #226 (gscan empirical), #227 (spike defects)
**Blast:** LARGE. **Encode fifteenth. Merge the (c3) rewrite with L8's — one rewrite, not two.**

**Home:** §1.2 + NFR-6(c3).

**Propagates to:**
- **§1.2 Product Vision** — *"renders exactly what Ghost will render — the canvas is the page, not a preview of it"*. **Rewrite to the true markup claim**, with the carve-out list from L7 (Q14's `100vh` gap), L19 (D14's Ghost-injected surfaces) and the existing code-injection notice.
- **§1.4 #1 Single-source WYSIWYG** — *"Canvas and shipped markup agree **by construction**"* is the defensible claim. Verify it and §1.2 now say the same thing at the same strength.
- **§7.3** — *"Canvas and shipped markup therefore agree **by construction**, not by comparison — byte-comparable markup is a property of the design"*. **Relabel §7.3 as "designed with a proven core" rather than "validated"** (D10 — L21). The spike proves markup, not rendering.
- **§7.3 / § Normative companions** — the `spike-compiler/` entry says *"**Empirical validation** of the compiler decision"*. **Narrow it:** the spike validates the markup path and carries two known defects. State them.
- **NFR-6(c3)** — full rewrite, merged with L8: exclusion set (post body, Portal button, comments, code injection, the `100vh` desktop delta), region-scoped threshold, rotating fixture cohort, nightly batch, 30-day full coverage, risk weighting, frozen animations, one-click approval.
- **NFR-6(a)** — **shrink it to fund (c3).** The shrink is the arithmetic change: `variants × packs × modes × viewports`. ⚠ **This collides with Appendix D.c's "every pairing must render in the matrix under at least one pack before GA" and with the v3.0 finding that the matrix covers 3 of 12 packs / 3 of 30 pairings.** Shrinking makes that worse. **Resolve both in one edit.**
- **FR-J6** — the gscan gate's **claim** must change. *"Target for all library output: 0 errors, 0 warnings"* stays as a **hygiene floor**, but the sentence that lets it carry the quality argument must go. gscan certifies almost nothing about "marketplace-quality". Add H1's **automated emitted-theme code-quality gate** (L2) as the thing that actually measures it.
- **NFR-7** — *"compatibility comes from the helper surface … verified by gscan against the v6 spec"*. gscan's evidentiary weight drops; verify the sentence still claims only what it can.
- **G3 (§1.3)** — *"Every deploy passes gscan — 0 errors, warnings surfaced, always"*. Keep as a gate; do not let it read as a quality claim.
- **G4 (§1.3)** — *"Generated theme quality"* target. Currently axe-core + NFR-2 properties. **Add the code-quality gate**, and **remove any marketplace-submittability implication** (D3).
- **FR-J2 / §7.4** — ⚠ **D3: no `screenshots`.** The v3.0 critical said the theme is not submittable to the marketplace it claims to be graded by. **Owner ruled: skip screenshots.** So (a) do **not** add a `screenshots` key or `assets/screenshot-*.jpg` to FR-J2 or §7.4, and (b) **find and reword every place the quality bar hinges on submittability** — §1.2 ("marketplace-quality Ghost theme"), §1.4 #6, G4, FR-J1 ("at Casper/Source quality"), §1.5 (Inflozo's premium justification). **Casper/Source-grade code** is the surviving bar; **marketplace-submittable** is not.
- **§1.5 Competitive Landscape** — *"library scale (485 variants at GA), Ghost-native monetization depth, safe installs, and evergreen updates"* — no submittability claim. **Tick.** But *"any gscan or code-quality story"* as a Fantasma gap now leans on a weaker gscan; verify.
- **NFR-6(c1) / (c2)** — unchanged in cadence, but (c2)'s **recorded real-Ghost output** is now the thing that catches the spike's date-format defect. ⚠ **The spike's `test.js` date helper is a passthrough stub** — (c2) must assert the **format arg** is honoured, not just that a date renders. **Add the assertion explicitly.**
- **`spike-compiler/`** — the two defects must be fixed or explicitly recorded as known. `compile.js:154`'s `wrapGuard` is separately in the batch (L27, batch item 4: fix the guard-field derivation + add a helper-bound test).
- **§7.6 risk table** — add: gscan is a hygiene floor, not a quality gate; the quality claim rests on the code-quality gate and the 34 owner gates.
- **§7.6 "Assumed, unvalidated"** — the spike's evidentiary scope belongs here or in §7.3; state it once.
- **§8 E4 exit** — *"the five pilot sections render editor-perfect on canvas"* — "editor-perfect" against what? Tie to the (c3) mechanism.
- **§8 E4/E7 joint compile gate** — *"the compiled theme passes gscan 0 errors / 0 warnings"* stays; **add the code-quality gate** to the joint gate.
- **§8 E15** — render-matrix sign-off changes shape (L8 moved (c3) out).
- **Appendix H** — the gscan step string *"Checking your theme (Ghost will love it)"* is fine; but any marketing copy implying marketplace submission must go (FR-N1/N3's claim-verification rule already covers competitor claims — this is Inflozo's own claim about itself).
- **FR-N3 / FR-N1** — the marketing home's product narrative; verify no submittability claim ships.

**Counts affected:**
- **8,730** — shrinks. Re-derive from the new dimensions. **Then re-derive the CI cost (L9), which is linear in it.**
- **~30 days** and the nightly batch size (L8) — the (c3) funding arithmetic depends on both.
- **3 of 12 packs / 3 of 30 pairings** — must be resolved, not carried.
- **1% differing pixels at 0.1 per-pixel tolerance** — the current threshold; a **region-scoped** threshold replaces or supplements it. State both, or one.

**Conflicts:**
- §1.2's "renders exactly what Ghost will render".
- Any "marketplace-submittable" framing (D3).
- §7.3's "validated" label and the spike entry's "empirical validation" wording.
- FR-J6's implicit quality-argument role.
- Appendix D.c vs a shrunk NFR-6(a).

**New content required:**
- §1.2's reworded promise with its carve-out list.
- The rebuilt NFR-6(c3).
- The automated emitted-theme code-quality gate (FR-J17) — shared with L2.
- The (c2) date-format assertion.

---

## L16 · H9 — "Empty Tag State" becomes a state of the tag feed ⚠ COUNT-MOVING

**Ruled as:** **A31 #8 "Empty Tag State" becomes a state of the tag feed**, not a variant of its own. (A v3.0 finding: A31 #8's `compileTarget` is *"the empty state of a collection template"* — **not a file** — and **no surface can place it**.)

**Source:** #268 (H9)
**Blast:** LARGE — it is the one decision in this map that may move the library total, and **every 485-derived number in the document depends on it.** **Encode sixteenth — before Part 5's counts pass, and before any other edit that quotes 485.**

**Home:** `sections-inventory.md` A31.

**⚠ RESOLVE FIRST, EXPLICITLY:** does A31 #8 **leave the inventory** (A31 10 → 9) or **stay as a numbered variant whose definition changes**? The finding's substance — no file, no placing surface — argues it leaves. If it leaves, the arithmetic below all moves. **The encode must state which reading it took, in the inventory preamble, so a future reader can check the arithmetic.**

**Propagates to (if it leaves):**
- **`sections-inventory.md` A31** — remove #8; **⚠ renumbering hazard:** A31 **#10 Private Site Gate is `[Free]`** and is the `private.hbs` compile target. If #9/#10 shift to #8/#9, **every cross-reference to "A31 #10" breaks** — and there are many. **Recommend: do NOT renumber. Retire #8's slot and state that A31's variant ids are non-contiguous by design, with the reason.** Non-contiguous ids are far cheaper than a global renumber.
- **`sections-inventory.md` A31 header** — count 10 → 9; the per-variant `compileTarget` list loses the "collection empty state" entry.
- **`sections-inventory.md` preamble totals** — *"34 categories · 485 variants (exact; per-category counts sum to 485) · 70 [Free]"*.
- **Appendix A (prd.md)** — the A31 row's Variants and `compileTarget` cells; the **Total 485** row; **Group sums** line (Template-Specific Sections **102** → 101; total 485 → 484); the *"457 placeable / 28 non-placeable"* split (A31 is placeable → **456 / 28**); the tiering paragraph.
- **FR-G1** — *"34 categories and 485 unique variants at GA"*; *"457 are placeable sections and 28 are non-placeable treatments"*.
- **FR-G2** — the 70 `[Free]` derivation: *"the first two of every category (68), plus A29 #7 and A31 #10"*. **A31 #10 must still exist and still be `[Free]`** — this is the reason not to renumber.
- **G5 (§1.3)** — *"34 categories, 485 unique variants at GA"*.
- **§4 Definition of Done** — *"the 485-variant inventory"*.
- **§4 "No de-scope contingency"** — *"the 485-variant inventory are not de-scopeable"*.
- **§1.2 / §1.4 #2 / §1.5** — §1.5 quotes *"library scale (485 variants at GA)"*.
- **FR-J14** — *"485 is a GA floor stated in FR-G1"*.
- **NFR-5** — *"all 485 shipped variants"*.
- **NFR-6(a)** — **8,730 renders** = 485 × 18. **Re-derive.**
- **Appendix F.1 plan matrix** — *"canvas: all 485 … All 485"*.
- **§7.3** — *"All 485 sections are authored by the dev team"*; *"the 485 section stylesheets"* (§7.1).
- **§7.1** — *"the 485 section stylesheets are library data"*.
- **§8 E11** — owns A24–A34 and its **130** count.
- **§8 E14 exit** — *"gallery renders all 485 variants"*.
- **Appendix I glossary** — *"34 categories, 485 variants"* in the Section/variant row; the Non-placeable-treatment row's 28.
- **`appendix-b1-template-contexts.md:267`** — says **487**. **Stale regardless of H9. Fix.**
- **`appendix-h1-string-catalog.md:287`** — says **487**. **Stale regardless of H9. Fix.**
- **`research-section-js-libraries.md`** — quotes 485 in several places (a research companion; **do not edit research to match the PRD** — instead note in the manifest that research files are dated snapshots).
- **FR-H2** — the tag feed now carries an **empty state**. Add it to FR-H2's Data group / main-feed rules: what the designated main feed renders when the collection is empty.
- **`sections-inventory.md` A17 / A18** — the feed categories gain an **empty-state** control or an intrinsic empty rendering. **Which categories?** Every feed-bearing category (A17, A18, A19, A20, A21, A27) can be empty. **State the scope — H9 said "the tag feed", but the general case is broader.** ⚠ **Owner-decidable; flag rather than invent.**
- **`sections-inventory.md` § Synthesis Defaults** — `tag.hbs` and `author.hbs` stacks include A17 #1 as main feed; the empty state now applies there.
- **FR-H4** — *"a section bound to zero items renders nothing on the live site"* ⚠ **CONFLICT** with an empty-state design. **Rewrite:** a *feed* with zero items renders its empty state; a non-feed bound prop still hides (FR-H8).
- **FR-H8** — media guards hide; text guards fall back. The empty-state rule is a **third** behaviour and must be distinguished from both.
- **`appendix-h1-string-catalog.md` `archive.*` / `pagination.*`** — the empty-state copy needs keys. **§4 totals move.**
- **NFR-6(a)** — the empty state is a **render** that needs a fixture (an empty tag). Add to the matrix or the fixture set.
- **FR-D12 / FR-D13 / FR-D17** — A31's Shuffle partition list loses the "collection empty state" target; the partition prose in `sections-inventory.md` A31 and in FR-D13 must be re-read.

**Counts affected (state the arithmetic; do not compute here):**
- A31: `10 → 9`
- Group 4 Template-Specific Sections: `102 → 102 − 1`
- Library total: `485 → 485 − 1`
- Group sums line: `47 + 199 + 109 + (102−1) + 28` must equal the new total
- Placeable/non-placeable: `457 − 1 / 28`
- `[Free]`: unchanged **only if** A31 #10 keeps its number and its `[Free]` tag — verify
- NFR-6(a): `(485−1) × 3 × 2 × 3`
- E11's 130: `130 − 1`
- Wave sums: must still total the library count
- Appendix F.1's "all 485" ×2
- E14's "all 485"
- NFR-5's "all 485"
- CI cost (L9), which is linear in the render count

**Conflicts:**
- FR-H4's "renders nothing on the live site" for zero-item feeds.
- A31 #8's non-file `compileTarget`.
- Every hard-coded 485 that is not re-derived.

**New content required:**
- The feed empty-state rule (which categories, what it renders, its controls, its strings).
- A31's non-contiguous-id statement, if that reading is taken.

---

## L17 · D1 — the theme ALWAYS reads all three dark built-ins, with real fallback logic baked in

**Ruled as:** ⚠ **OWNER OVERRIDE of the facilitator's recommendation.** Do **NOT** make declaration conditional. The theme **ALWAYS** reads all three dark built-ins with **real fallback logic baked in**: `dark_logo` falls back to the wordmark, dark accent falls back to the light accent, `color_scheme` drives a **body class**. **Because the template always references each key, GS100 can never fire**, and the setting works the moment a user fills it in. **One mechanism in the theme instead of a compiler special-case.**

*(The v3.0 critical was that FR-Q5's "always compile three built-ins" collides with gscan's GS100 — a declared-but-unreferenced `@custom` key — and blocks the deploy. The owner's fix is to always **reference** them, which removes the collision at its root rather than gating the declaration.)*

**Source:** #233
**Blast:** LARGE. **Encode seventeenth.**

**Home:** FR-Q5.

**Propagates to:**
- **FR-Q5** — rewrite. Today it says Light+Dark projects *"always compile three built-in custom settings"* and *"Light-only projects simply don't compile them"*. ⚠ **That second clause is now the conflict**: if a Light-only project declares the three keys and never references them, GS100 fires. **State the resolution: either the keys are declared and referenced in every project (Light-only included, with the fallback logic inert), or they are declared in neither. The owner's ruling ("the theme ALWAYS reads all three") reads as the former. Encode it and delete the Light-only carve-out.**
- **FR-Q2** — *"**3 slots and their keys are reserved for the dark-mode built-ins (FR-Q5) in every project, Light-only included**, so user-defined settings cap at 17 … a Light-only project consequently holds three slots it never compiles"*. ⚠ **"never compiles" is now false.** Rewrite; the reservation reason strengthens (the keys are always present) and the trade-off sentence changes.
- **FR-D7** — *"Switching between Light only and Light + Dark never affects the custom-settings cap — the built-in slots are reserved unconditionally (FR-Q2)"*. Still true, and now for a better reason. Rewrite the reason.
- **FR-E4** — the token compilation rule (`:root` light, `prefers-color-scheme: dark` media query, `[data-mode="dark"]`). D1 adds that **`color_scheme` drives a body class**. ⚠ **Reconcile:** `[data-mode="dark"]` and a body class are two mechanisms. **State one.** FR-E4 currently uses `data-mode`; D1 says body class. **Pick and propagate to §7.3, FR-J1 and the section CSS authoring rules — every one of the 485 stylesheets selects against whichever it is.** This is a small string with a 485-file blast radius.
- **FR-J2** — `custom` = *"the dark-mode built-ins (FR-Q5, **Light+Dark projects**) plus any user-defined custom settings"*. Rewrite the parenthetical.
- **FR-J6** — the 0/0 target: add GS100 to the reachable-shortlist reasoning, and state **why** it can never fire.
- **§7.4 tree** — the `package.json` comment says `custom (FR-Q5 built-ins + FR-Q2 user settings)`. Verify.
- **§7.4** — `default.hbs # shell: fonts, token block link, header/footer partials, ghost_head/foot`. The **body class** and the **inline promoted-token block** (FR-Q5's last sentence) both live in `default.hbs`. State them in the tree comment.
- **Appendix B — `@custom` in generated themes** — *"the dark-mode built-ins (FR-Q5) plus user-defined settings"*. Verify.
- **FR-Q3** — promotion mechanics: *"Promoted colors compile as an inline token block in `default.hbs`"* and *"promoting the accent creates the *light* setting, and its dark counterpart — the Dark accent built-in — **already exists**"*. That now holds in **every** project, including Light-only. FR-Q5's Light-only paragraph (*"In a **Light-only** project the accent promotes as a single light setting: no dark counterpart exists and none is needed"*) ⚠ **contradicts D1** — the counterpart now always exists. **Rewrite.**
- **FR-Q4** — *"The canvas previews custom settings at their defaults"*. The fallback logic must preview correctly on canvas (dark logo unset → wordmark). Add.
- **FR-D7 dark authoring** — the *fallback* behaviour is new user-visible behaviour (dark logo falls back to the wordmark). Surface it in the editor or state that it is invisible until deploy.
- **§7.6 verify-at-build** — confirm GS100's exact trigger on both v5 and v6 specs against a fixture (the whole ruling turns on "referenced ⇒ never fires").
- **§7.6 risk table** — the row for a gscan bump turning the library red should note GS100 specifically, since three keys in every theme depend on it.
- **§8 E7** — owns FR-Q1–Q5; add the always-reference mechanism to E7's scope and exit.
- **§8 E6** — owns FR-E1–E5 including FR-E4's token compilation; the body-class-vs-`data-mode` decision lands here too.
- **Appendix D** — *"Dark palettes are hand-paired"*; the fallback chain (dark accent → light accent) must not contradict "hand-paired". State that the fallback is for **unset** values only.
- **Appendix I glossary** — **Promotion** entry; add the dark built-ins if not present.
- **`appendix-h1-string-catalog.md`** — the mode toggle's a11y label lives in `a11y.*` (6 keys) or `nav.*`; verify a `color_scheme`-driven toggle has its strings.

**Counts affected:** **20-setting cap / 3 reserved / 17 user-definable** — unchanged, but the *reason* changes. Verify the 3 and 17 appear consistently in FR-Q2, FR-Q5, FR-J2, Appendix B, Appendix F.1 (if listed) and P3.

**Conflicts:**
- FR-Q5's "Light-only projects simply don't compile them".
- FR-Q5's "In a Light-only project … no dark counterpart exists".
- FR-Q2's "three slots it never compiles".
- FR-E4's `data-mode` vs D1's body class — **one must go.**

**New content required:** the always-reference mechanism with its three fallback chains, stated once, normatively.

---

## L18 · D12 + M6 + H5 — the canvas fixture set: a style-guide page, a comments fixture, and a fixed preview subject

**Ruled as:** **D12:** the canvas **dummy post/page content IS a style-guide page** showing **every Ghost editor card**, so users can see and design the card treatments. Merges cleanly with L5's per-card design module. **M6:** comments render against a **fixture with a stated comment count**, consistent with the style-guide fixture decision. **H5:** the canvas previews a **fixed fixture**, **overridden once a site is connected** by whatever the user picks in the post list/grid control. **M5:** the canvas gains a **page-2 preview state** so A34's ten pagination designs are designable. **M4:** synthesized templates appear on the canvas **marked auto-generated**.

**Ruled from evidence:** the canvas never renders real post body HTML, so **the fixture is the contract**. The style-guide fixture must be **generated from the renderers**, not hand-written — snapshot the output of each `render*Node` function and check it in — and must cover every class-affecting variant (image ×3 widths ×caption; gallery 1–5 images ×caption; video ×3 widths ×loop; callout ×9 colours ×emoji; button ×2 alignments; product ×rating ×button ×image; header v2 ×4 layouts ×swapped; signup ×4 layouts; cta ×9 backgrounds ×2 layouts ×dividers ×sponsor ×image; file ×title/caption combinations; toggle open+closed; code ×caption; bookmark ×thumbnail ×caption). It must render **inside the same wrapper the theme uses** (`<main><article class="gh-content">…`), load **the theme's stylesheet then a simulated `cards.min.css` containing only non-excluded chunks, in that order**, and load the **4 behaviour scripts**. **Regenerate when the Ghost target bumps.**

**Source:** #239 (D12), #275 (M4/M5/M6), #268 (H5) · research: `research-ghost-koenig-cards.md` §6.6
**Blast:** LARGE. **Encode eighteenth, with L5 and L6.**

**Home:** FR-H3 (Orbit Weekly) + a new FR for the fixture set.

**Propagates to:**
- **FR-H3 Orbit Weekly** — the dataset gains the **style-guide post** (a post whose body is every Koenig card) and the **comments fixture with a stated count**. Enumerate them the way the rest of the dataset is enumerated (12 posts, 6 tags, 3 authors, 2 tiers…). **The count of posts moves if the style-guide post is a 13th.**
- **FR-H4** — *"`{{content}}` renders dummy placeholder prose in every content layout"*. ⚠ **Rewrite:** it renders the **style-guide fixture**. This is the clause a v3.0 critical named as "stipulated unrenderable and the placeholder is never defined; A25 and A33 are not WYSIWYG at all".
- **FR-H5** — `{{content}}` is in the shim's list; its output is the fixture. `{{comments}}` *"renders a styled placeholder"* → **rewrite to the comments fixture with its stated count.**
- **FR-D16 member-state preview** — *"gated post bodies render Orbit Weekly stand-in text"*. Reconcile with the fixture; and ⚠ a v3.0 finding says *"the C10 scope cut did not reach FR-D16"*. Verify.
- **FR-D15 content-source pill** — H5's fixed-fixture-then-override rule needs a surface. The pill says "Previewing with: {site} / Sample content"; add the **subject** (which post/page/tag/author) once a site is connected.
- **NEW behaviour: the preview-subject control.** ⚠ A v3.0 HIGH: *"No requirement chooses which post/page/tag/author the single-resource canvases preview, and FR-H8's media guard makes that choice structural"* — a fixture post **with** a feature image and one **without** produce structurally different markup. H5's ruling is the answer: **fixed fixture, overridden by the post list/grid control once connected.** Needs its own FR in the FR-D block.
- **FR-D6 / M4** — synthesized templates render on canvas **marked auto-generated**. New canvas state; add to FR-D6 and to the Synthesis Defaults' "Opening an untouched template renders this same default stack" paragraph.
- **NEW: page-2 preview state (M5)** — A34's ten pagination designs cannot be designed on page 1. Needs a canvas state and a home in FR-D (device/mode/member toggles are the pattern to follow: FR-D7, FR-D8, FR-D16).
- **FR-D11 keyboard map** — do the page-2 and auto-generated states get keys? State yes or explicitly no.
- **`sections-inventory.md` A33 host-context row** and **Appendix A's A33 row** — the host context becomes the style-guide fixture (L5).
- **`sections-inventory.md` A28 Comments** — *"the canvas renders a placeholder thread (FR-H3)"* → the comments fixture with a stated count. A28's `Controls:` includes a **count header toggle**, which needs a real number to render.
- **`sections-inventory.md` A34 host-context row** and **Appendix A's A34 row** — *"A paginated `index.hbs` whose main feed (A17 #1) has more than one page of posts"*. The **12 Orbit Weekly posts vs `posts_per_page` default 12** ⚠ **produces exactly one page.** **The fixture must have more than 12 posts, or `posts_per_page` must be lower in the fixture.** Flag and fix — otherwise A34's ten designs have no renderable state and M5's page-2 state is empty.
- **`sections-inventory.md` A25** — the style-guide fixture is what A25's designs wrap (L6).
- **NFR-6(a)** — the fixture set becomes part of the matrix's inputs; A32/A33/A34's host contexts are fixtures. State which fixtures the matrix pins.
- **NFR-6(c1)** — the fixture is checked in and diffed; a Ghost bump changes it visibly.
- **NFR-6(c3)** — the fixture is a rotating-cohort member and a risk-weighted one (card treatments are named in Q16's weighting).
- **NFR-5** — axe-core over the fixture renders.
- **NFR-3** — the fixture is Inflozo-authored HTML, **not** user content, so the never-read rule is untouched. **State it**, or the fixture looks like an exception to NFR-3.
- **§7.3** — the canvas renders no untrusted HTML; the fixture is trusted, generated content. Add one sentence so the two do not appear to conflict.
- **§7.6 verify-at-build** — regenerate the fixture on each Ghost target bump; confirm the renderer-snapshot method against the pinned Ghost version.
- **§8 E4** — owns FR-H3; the fixture set is E4 platform work.
- **§8 E5** — owns the canvas states (auto-generated marker, page-2).
- **§8 E11 / the card-module epic** — the fixture is the card module's verification surface.
- **Appendix F.3b** — the fixture's storage/CI cost is inside the existing lanes; **tick** unless the fixture grows the render count.
- **`appendix-h1-string-catalog.md`** — the "auto-generated" marker, the page-2 indicator and the "gated content — shown with sample text" indicator are **app** strings, not theme strings. Confirm they stay out of catalog and land in Appendix H.
- **Appendix H** — add the app-side copy for the three new canvas states.
- **Appendix I glossary** — **Orbit Weekly** entry; add **Style-guide fixture** and **Preview subject**.

**Counts affected:**
- **Orbit Weekly's 12 posts / 6 tags / 3 authors / 2 tiers** — the post count likely moves (style-guide post; and A34/M5 need > `posts_per_page` posts). **Re-derive and restate.**
- **`posts_per_page` default 12** vs the fixture post count — must not be equal.
- **Comment count** — a new stated number.
- The card-variant enumeration above is a **new count set** (9 callout colours, 4 header layouts, 9 CTA backgrounds…) and must be internally consistent with L5's per-card panels.

**Conflicts:**
- FR-H4's "dummy placeholder prose".
- FR-H5's `{{comments}}` "styled placeholder".
- FR-H3's dataset enumeration, if the post count moves.
- The A34 host context's implicit assumption that 12 posts paginate.

**New content required:**
- The fixture set: style-guide post, comments fixture, page-2 state, auto-generated marker, preview-subject rule.
- The fixture's generation method (renderer snapshots, checked in, regenerated on bump) and its loading order rule.

---

## L19 · D14 + Q14 — name Ghost's own injected surfaces in §1.2's carve-out, and shim Portal's floating button

**Ruled as:** Name **Ghost's own injected surfaces** in §1.2's carve-out **AND shim Portal's floating button on canvas** (ask at connect if the setting cannot be read). **Announcement bar, comments and search carve out.** Plus **Q14**: disclose the **desktop-mode `100vh` canvas-vs-visitor gap** in the same carve-out.

**Source:** #238 (D14), #253 (Q14)
**Blast:** MEDIUM–LARGE. **Encode nineteenth, with L15 (same sentence) and L7 (same `100vh` fact).**

**Home:** §1.2's carve-out parenthetical — which becomes a list.

**Propagates to:**
- **§1.2** — the carve-out becomes: user code injection (existing) + **Ghost-injected surfaces** (Portal's floating button, Ghost's native comments, the sodo-search overlay, Ghost's announcement bar) + the **desktop `100vh` delta** (Q14). Rewrite as an enumerated carve-out, merged with L15's rewording.
- **FR-C2** — connect already computes the code-injection boolean. **Add: read whether Portal's floating button is enabled; if the setting cannot be read, ask at connect.** That is a new connect-flow step and a new stored field.
- **FR-C4 auto-branding** — reads site settings; the Portal-button setting joins the read list.
- **FR-C5 daily health check** — re-reads settings; add the Portal-button setting so the shim stays accurate.
- **§7.5 data model** — `sites` gains a field for the Portal-button state (or it joins whatever settings blob exists).
- **FR-D16 / FR-H5** — the canvas **shims** Portal's floating button. That is new canvas chrome that is **not** Inflozo's design and must not be selectable, editable or compiled. State it, and state it sits **inside** the iframe (L7's partition) as non-interactive.
- **NFR-6(c3) exclusion regions** — the Portal button is already named in Q16's exclusion set (L8). Verify it is in the list.
- **Appendix B — Portal actions** — the floating button is a Portal *setting*, not a `data-portal` action. Add a note so the two are not confused.
- **`sections-inventory.md` A2 Announcement Bars** — ⚠ **Ghost has its own announcement bar.** Inflozo ships 15 announcement-bar designs. **State the relationship:** does Inflozo's bar sit above/below Ghost's, and does the carve-out mean both can appear? This is a real product question that the carve-out surfaces. **Flag for the owner; do not invent.**
- **`sections-inventory.md` A23 Search** — Ghost's sodo-search overlay is injected; A23's styled-trigger variants style Ghost's overlay, and the Custom Overlay variants replace it. Already in `appendix-h1-string-catalog.md` §5 (out of catalog). Verify the carve-out and §5 agree.
- **`sections-inventory.md` A28 Comments** — Ghost's native comments UI is injected. Verify.
- **§7.6 risk table** — the "Sodo (Ghost's bundled search) styling limits" row exists; add Portal's floating button and Ghost's announcement bar as the same class of hazard.
- **§8 E3** — owns FR-C1–C6/C8; the Portal-button probe lands here.
- **§8 E5** — owns the canvas; the shim lands here.
- **Appendix I glossary** — no new term needed; verify **Preview-only** and **Chrome strings** entries do not overlap.

**Counts affected:** none.

**Conflicts:** §1.2's single-parenthetical carve-out; any text implying the canvas shows everything the visitor sees.

**New content required:** the enumerated carve-out; the Portal-button probe and its ask-at-connect fallback; the shim rule.

---

## L20 · Q4 + H4 — behaviours OFF while designing, live behind a Preview toggle, with a per-module edit-safe declaration; and the FR-D4 mark-emission spike first

**Ruled as:** **Q4 (option 3):** behaviours **OFF while designing**, live behind a **Preview toggle**, **PLUS each module declares whether it is edit-safe**. Edit-safe (run always): **sticky-shrink, animate-on-scroll, tabs, accordion**. Not edit-safe (wait for Preview): **marquee, typewriter, rotator, countdown, confetti**. Cost: roughly **1.2×** the per-module cost of the off-always design, instead of **2–4×** for full-live. **H4:** **ADD THE SPIKE for FR-D4 rich-text mark emission**, scheduled **BEFORE the shell block**, since **every user text path depends on it** (a v3.0 HIGH: FR-D4's mark emission is *"the last risky path — unimplemented and structurally impossible on the current one"*).

**Source:** #257 (Q4), #268 (H4)
**Blast:** LARGE. **Encode twentieth. H4's spike ordering interacts with L3's shell-block ordering — state both constraints together.**

**Home:** a new FR in the FR-D block (the Preview toggle) + FR-G3 (the edit-safe field).

**Propagates to:**
- **NEW FR-D (Preview toggle)** — a canvas mode alongside FR-D7 (light/dark), FR-D8 (device) and FR-D16 (member state). State: what is off, what is on, what the toggle does, and that it is **preview-only** (no editing while behaviours run, or state that editing continues — **owner-decidable; pick one**).
- **FR-G3 registry entry format** — add an **`editSafe`** field to the module reference (L10 adds the module reference itself). One field, 31 values.
- **FR-G4** — the no-JS degradation statements (L10) now have a sibling: the **editor-time** behaviour. Distinguish three states: **live site with JS**, **live site without JS**, **canvas while designing**. Currently FR-G4 knows only the first two.
- **FR-D1 / P1 ("the canvas is sacred")** — ⚠ P1 says *"With nothing selected, the canvas shows the true website: no outlines, handles, grids, or badges."* With behaviours **off**, the canvas with nothing selected is **not** the true website. **P1 must be amended or the Preview toggle must be the default-off state that P1 describes.** This is a principle-level conflict and must be resolved explicitly, not left to reading.
- **§1.2 / §1.4 #1** — the WYSIWYG promise again. Behaviours-off is a **third** carve-out class (alongside L19's injected surfaces and L7's `100vh`). **Add to §1.2's enumerated carve-out.**
- **NFR-1** — the 60 fps trace covers *"drag, reorder, Variant Shuffle and control changes"*. With edit-safe modules running always, the trace must include them. **Amend the trace definition.**
- **NFR-1** — behaviours-off is *why* the canvas can hold 60 fps on a 40-section fixture with 20+ animated variants. State it as the reason.
- **FR-D14** — the 40-section stress fixture: state whether it runs behaviours (it should run the edit-safe set).
- **FR-D11 keyboard map** — a Preview toggle key, or an explicit none.
- **NFR-6(c3)** — Q16 already **freezes animations** in the perceptual diff. Verify the freeze mechanism and the Preview toggle are the same mechanism or two clearly different ones.
- **`sections-inventory.md`** — every per-variant spec (L1) declares its module(s) **and** their edit-safe status. **New required field.**
- **`sections-inventory.md`** — the 9 named modules (sticky-shrink, animate-on-scroll, tabs, accordion / marquee, typewriter, rotator, countdown, confetti) map onto L10's 31-module list. **Verify every one of the 31 gets an edit-safe value; the owner named 9, so 22 are unruled.** ⚠ **Flag: the encode must either derive the remaining 22 from the same principle (does the behaviour move on its own? then not edit-safe) or ask.**
- **§8 E4** — the module registry and the edit-safe field are E4 platform work; **H4's FR-D4 mark-emission spike is E4 work scheduled ahead of the shell block.** Add to E4's scope and to §8's ordering notes.
- **§8 E5** — the Preview toggle is E5 editor work.
- **§8 ordering** — three stacked constraints now: H4's spike → the shell block (L3) → A4 Heroes as first gated category (L3). State the chain once.
- **Appendix H** — the Preview toggle's label and the confetti reduced-motion rule (confetti is a not-edit-safe module *and* Inflozo's own one celebratory moment — verify the two uses of "confetti" do not collide; A2 #15 *Seasonal Confetti* is a section behaviour, FR/Appendix H's confetti is the deploy moment).
- **Appendix I glossary** — add **Edit-safe module** and **Preview toggle**.
- **Appendix F.3a** — the 1.2× per-module cost multiplier is a build-cost input. Feed L9.

**Counts affected:**
- **31 modules × 1 edit-safe flag** — 9 ruled, **22 to derive or ask**.
- **1.2×** cost multiplier — a new number for F.3a.
- **A2 #15 Seasonal Confetti** vs Appendix H's *"exactly one confetti moment in the product"* — ⚠ that rule is about **Inflozo's app**, not generated themes. **Verify the wording scopes correctly**, or a reader concludes A2 #15 violates the canon.

**Conflicts:**
- **P1's "the canvas shows the true website"** — must be amended.
- FR-G4's two-state model.
- NFR-1's trace definition.

**New content required:** the Preview-toggle FR; the edit-safe declaration and its 31 values; P1's amendment; the three-state behaviour rule.

---

## L21 · D10 — the five missing `data-*` constructs, a third worked spike example, and §7.3 relabelled

**Ruled as:** Add the **five missing `data-*` constructs** — `{{#get}}`, member gating, `{{t}}`, `srcset`, **control → data-attr write** — add a **third worked spike example exercising all five**, and **relabel §7.3 as "designed with a proven core" not "validated"**. **E4 exit criteria.**

*(A v3.0 critical: the `data-*` authoring vocabulary has no expression for five things **250+ variants** require.)*

**Source:** #237 (D10)
**Blast:** LARGE. **Encode twenty-first. Depends on L5 (`srcset` interacts with the card fixture), L10 (`{{t}}` and the module strings), L12 (`{{#get}}`'s 100 cap).**

**Home:** §7.3's `data-*` directive vocabulary.

**Propagates to:**
- **§7.3** — the directive list is currently `data-prop`, `data-prop-attr`, `data-bind`, `data-bind-attr`, `data-empty`, `data-repeat`, `data-repeat-limit`, `data-partial`. **Add five directives** (names to be authored) for `{{#get}}`, member gating, `{{t}}`, `srcset` and the control→data-attribute write.
- **§7.3 "Compiler mechanics"** — the three binding mechanics (opaque ASCII tokens; comment-wrapped block markers; **unwrap markers BEFORE token substitution**) must be re-checked against the five new constructs. `{{#get}}` is a **block** helper with a filter string containing quotes — the single riskiest case class after `img_url size=`. State it.
- **§7.3 "Control → CSS"** — the control→data-attribute write is currently described as mechanism, not as an authoring directive. **Make it a directive.**
- **§7.3 label** — *"Single-source section runtime (mandated)"* … *"`spike-compiler/` **validates** the whole path empirically"* → **"designed with a proven core"**. Rewrite; the spike proves markup, not the whole path (L15).
- **FR-G3** — `dataBindings?` and the registry contract must name the five constructs. The `{{#get}}`-bearing-variants constraint (*"may reference **only** template-level context"*) lives here and in FR-H5 — and ⚠ **a v3.0 HIGH says that rule is false, its stated reason is wrong, and it reads two opposite ways.** **This must be resolved in the same edit as adding the `{{#get}}` directive.** The real constraint is Handlebars' synchronous evaluation vs `{{#get}}`'s async resolution; get the reason right or the rule will be re-litigated.
- **FR-H5** — the shim's helper list and the same `{{#get}}` constraint sentence. Reconcile with FR-G3 word-for-word.
- **FR-H5** — `{{img_url}}` *"emitting Ghost-shaped sized URLs and `srcset`, not pass-through"*. ⚠ **VERIFIED:** `{{img_url}}` does **not** emit `srcset` (claim 9, CONFIRMED). The theme must build `srcset` itself from `image_sizes` keys (L23/D2). **FR-H5's wording must not imply the helper does it.**
- **FR-J5** — *"`{{img_url}}` with `srcset` + WebP + lazy loading"*. Same correction.
- **NFR-2 assertion 1** — *"every image carries a **correct `srcset` and `sizes`** matching the rendition set it was generated with"*. Now has a directive behind it. Cross-reference.
- **FR-H8** — media guards *"must enclose any `srcset`: an unguarded `srcset` renders a malformed attribute the browser resolves as a relative URL, producing live 404s"*. The new `srcset` directive must guarantee the guard wraps the **element**. State the interaction.
- **FR-Q6** — `{{t}}` in `.hbs` exclusively; `data-i18n-*` for JS strings. The `{{t}}` directive must produce the former and the module bundler the latter. Cross-reference `appendix-h1-string-catalog.md` §7's V1–V8 assertions — **V1 and V2 are only enforceable if the directive marks user text props distinctly** (V1's "visitor-facing" excludes user text props, and *"the emission record must carry the distinction"*).
- **FR-D5 / Appendix C — Member Visibility control** — member gating is now both a **control** and a **directive**. Verify one produces the other.
- **`spike-compiler/`** — add the **third worked example** exercising all five constructs. Also fix or record the two known defects (L15) and batch item 4's `wrapGuard` (L27).
- **§8 E4 exit criteria** — add the five constructs and the third example. E4's exit currently says the five pilot sections render editor-perfect and their `.hbs` snapshots are committed.
- **§8 E4/E7 joint compile gate** — the five constructs must survive the round trip.
- **§ Normative companions (preamble)** — the `spike-compiler/` entry's claim narrows.
- **`sections-inventory.md`** — the **250+ variants** figure: derive it and state where (per-variant specs will each name their constructs, so the count becomes checkable).
- **Appendix I glossary** — **Annotated HTML** entry: *"plain HTML carrying Inflozo directives"*. Verify the directive count is not stated there (it is not — **tick**).

**Counts affected:**
- **8 directives → 13.** State both, or state neither.
- **250+ variants** — derive.
- **2 worked spike examples → 3.**

**Conflicts:**
- §7.3's "validates the whole path empirically".
- FR-H5/FR-J5's implication that `{{img_url}}` emits `srcset`.
- FR-G3/FR-H5's `{{#get}}` template-level-context rule, its reason, and its two readings.

**New content required:** five directive definitions; the third spike example; §7.3's relabelling; the corrected `{{#get}}` constraint and its real reason.

---

## L22 · H12 — author the custom-template naming and collision scheme NOW

**Ruled as:** **Author a custom-template naming and collision scheme NOW** — it is **unfixable after ship**. (§7.4 already establishes that `custom-{name}.hbs` is a **frozen public API**: Ghost stores that exact string on every page that selects it and never revalidates or repairs it, so renaming an emitted custom template **silently detaches** every page pointing at it, each falling back to `page.hbs` with **no error at compile, upload or render**. A v3.0 finding: the filename is a frozen public API **with no naming rule and no collision rule**.)

**Source:** #268 (H12)
**Blast:** LARGE. **Encode twenty-second.**

**Home:** §7.4's "Custom template filenames are a frozen public API" block.

**Propagates to:**
- **§7.4** — add the naming rule (how a user-chosen template name becomes a filename) and the **collision rule** (two custom templates whose names slugify identically; a custom template colliding with `custom-{name}.hbs` already deployed; a collision with a `page-{slug}.hbs` Ghost would outrank — which FR-I1 says Inflozo never emits, and Ghost **disables the dropdown outright** when a slug template matches).
- **§7.4** — the label transform is **fixed and unoverridable**: hyphens→spaces, title-cased, `custom-member-home.hbs` → "Member Home". The naming rule must therefore also be a **label** rule — the user is choosing a Ghost Admin dropdown label whether they know it or not. State it.
- **FR-I3** — custom templates created in the Routes Manager. **The naming UI lives here.** Add the rule, the collision handling and the immutability warning at creation time.
- **FR-I1** — designed membership pages compile to `custom-{name}.hbs`; the same naming rule applies. Cross-reference.
- **FR-I1** — *"Removing every section from a designed membership template returns it to untouched: its file is not emitted on the next compile, and a Ghost page still pointing at that filename falls back to `page.hbs`"*. ⚠ That is a **silent detach** by design. Verify it is stated as a *warned* consequence, not a quiet one.
- **FR-I2** — the Routes Manager's validation (*"path collisions, unknown templates, filter syntax"*) must add **filename collisions** and **rename attempts on a deployed name**.
- **FR-D6** — the template switcher's "+ New template" deep-links into the Routes Manager flow. The naming step belongs there.
- **FR-D5** — layer names become filenames for **section partials**, which *may* change freely. ⚠ The two rules must be visibly distinct: **section partial names are free, custom template names are frozen.** §7.4 says this; verify FR-D5 does not imply otherwise.
- **FR-J10** — theme naming and its freeze-per-site rule is a **different** freeze. Verify the two do not read as one.
- **FR-J16 drift detection** — *"a compiled filename must never change when the user changed nothing"*. A custom-template rename **is** a user change, but it is a *forbidden* one. State the interaction: drift must not be the mechanism that catches a rename; the rename must be prevented.
- **M3 (L32)** — drift compares **content**, not filenames, so a layer rename produces no signal. A **custom-template** rename must still be blocked upstream. Verify M3's rule does not accidentally permit it.
- **`sections-inventory.md` A30** — *"the filename becomes the dropdown label, title-cased … and is a frozen public API of the emitted theme once shipped"*. Cross-reference the new rule.
- **`sections-inventory.md` A31 #6/#7/#9** — the custom-page utility variants also land on `custom-{name}.hbs`. Same rule.
- **§7.6 verify-at-build item 14(c)** — *"the Template dropdown's label transform on a multi-word name"* — E0 (L14) confirms it. Cross-reference.
- **FR-N4 docs** — the membership-binding docs page (H13 / L29) must explain that the name is permanent.
- **§8 E7** — owns FR-I1–I5; the scheme lands here.
- **Appendix I glossary** — add **Frozen filename** or amend an existing entry.
- **`appendix-h1-string-catalog.md`** — none; the naming UI is app copy. **Appendix H** gets the warning copy.

**Counts affected:** none.

**Conflicts:** none to delete, but §7.4's block is currently a **constraint without a mechanism** — the mechanism must be authored, not appended as a caveat.

**New content required:** the naming rule, the collision rule, the immutability UX and its copy.

---

## L23 · The verified mechanical corrections — encode the VERIFIED version, never the report's claim

**Ruled as:** Owner instruction: *research thoroughly before baking them in — "ensure you are 100% right on them."* Two verification agents were dispatched with an explicitly **skeptical posture toward the CLAIM rather than the PRD**, because two reviewer platform assertions had already failed verification and each one deleted or damaged something real. gscan **severities were read from `lib/checks` and proven by running gscan on fixtures**, never trusted from docs, because severity decides whether a deploy is blocked. Arithmetic was **recomputed independently from the PRD's own inputs**, not checked against the report. **Result: 17 Ghost claims (10 CONFIRMED, 7 PARTIALLY CORRECT, 0 REFUTED) + 12 theme-convention claims (1 REFUTED, 4 PARTIALLY CORRECT, 7 CONFIRMED) + 48 arithmetic rows (30 PASS, 18 FAIL, of which 8 the report missed and 2 the report got wrong).**

**Source:** #276 (the instruction) · `verify-mechanical-ghost-claims.md`, `verify-mechanical-theme-and-math.md`
**Blast:** LARGE (aggregate). **Encode twenty-third. Arithmetic rows are in L9; this block carries the Ghost/theme rows.**

### Ghost-truth corrections

| # | Encode this | Home | Also propagates to | ⚠ |
|---|---|---|---|---|
| 1 | `group` must be `homepage` \| `post` \| anything-else; Ghost buckets any other string into "Site wide" and **renders it there**. **The setting lands exactly where the author intended** — the only consequence is a gscan *recommendation* | FR-Q2 | Appendix B `@custom` para; §7.6 verify list | **Do NOT write "the setting doesn't land"** — REFUTED |
| 2 | Colour defaults must be **6-digit hex**, at **error** level | FR-Q2, FR-Q5 | FR-E3 (the pack's own colour values are not custom settings — tick); FR-J6's reachable shortlist | CONFIRMED |
| 3 | `package.json` must emit: `name` **lowercase** (`GS010-PJ-NAME-LC`, error) **and** matching `/^([a-z0-9]+-)*[a-z0-9]+$/` (`GS010-PJ-NAME-HY`, error, applied case-insensitively); `version` semver (`GS010-PJ-VERSION-SEM`, error); `author.email` present and RFC-valid (`-AUT-EM-REQ`/`-VAL`, both errors); `keywords` containing `"ghost-theme"` (`-KEYWORDS`, warning); `config.posts_per_page` as a **JSON number ≥ 1** — `"12"` from a form field trips `GS010-PJ-CONF-PPP-INT` at **error**, while omitting it is only a recommendation. **Coerce to integer at compile.** Levels identical on v5 and v6 | FR-J2 | §7.4 tree comment; FR-Q1 (`posts_per_page` origin); FR-J6's shortlist; NFR-6(b) | CONFIRMED; **one label fix** — the regex belongs to `-NAME-HY`, not `-NAME-LC` |
| 4 | `{{#get}}` limit: **Ghost 6 only** caps server-side; the cap **defaults to 100 and is operator-overridable** (`optimization:maxLimit`, `optimization:allowLimitAll`); **Ghost 5 has no cap** unless the operator set `getHelperLimitAllMax`. gscan **v6 only** adds `GS090-NO-LIMIT-ALL-IN-GET-HELPER` and `GS090-NO-LIMIT-OVER-100-IN-GET-HELPER`, **both warning**. Cap FR-H2's Count at 100 for a 0-warning v6 scan; **the compiler never emits `limit="all"`** | FR-H2 | FR-H5; FR-G3's `{{#get}}` constraint; Appendix B "Query rules" (already says Ghost 6 removed `?limit=all`, max 100 — reconcile the *API* fact with the *helper* fact, they are different); A29 #13 / A27 #11 (L12); NFR-7's 5.x/6.x split; FR-J6 | **PARTIALLY CORRECT** — version scope and config override both missing from the report |
| 5 | Translation overrides are **ICU MessageFormat**, every string passes through it, and gscan's only translation check is a **JSON parse**. A stray brace throws in the `MessageFormat` constructor **outside** the try/catch and escapes into `res.render` → **a WHOLE-PAGE 500**, not a graceful fallback | FR-Q6 | V1 (L26); `appendix-h1-string-catalog.md` §7 (add an ICU-validity assertion to V1–V8); FR-J6; §7.6 risk table | **PARTIALLY CORRECT — worse than stated.** The report said the visitor sees "An error occurred" |
| 6 | `@member` is missing `uuid`, `firstname`, `avatar_image`, `subscriptions` — Appendix B's shape is incomplete | Appendix B | FR-D16; FR-H5; `appendix-b1-template-contexts.md` §2; A30 #11 Member Home (which shows plan badge and status) | CONFIRMED |
| 7 | `settings` **is** a real Content API endpoint. Appendix B and FR-H1 both say *Content API resources*, not *`{{#get}}` resources* | Appendix B | FR-H1 | **Deleting "Settings" would be a REGRESSION — do not delete it** |
| 8 | `@site.lang` is API-correct **and a gscan error in a theme** | Appendix B | FR-Q6's language defaulting (already reads `locale` — **tick, and state why**); FR-J6's shortlist; §7.4 | CONFIRMED |
| 9 | **`{{img_url}}` does NOT emit `srcset`** | FR-J5 | FR-H5; NFR-2 assertion 1; FR-H8's `srcset` guard; L21's `srcset` directive; FR-J3's rendition set | CONFIRMED — and FR-H5/FR-J5 currently imply otherwise |
| 10 | The `themeTranslation` labs flag **changes translation semantics** | FR-Q6 | §7.6 verify list; `appendix-h1-string-catalog.md` §1 rules; FR-J6 | CONFIRMED |
| 11 | NQL mis-parses `((tag:news))` → the garbage key `{yg:{...}}` **silently, with no error** | FR-I2 | V2 (L26); FR-I4's byte comparison; §7.6 (⚠ the residual gap: Ghost's resolved nql build is unverified) | CONFIRMED |
| 12 | gscan **does not crash** on a malformed `visibility` string — it **silently cascades into 19 errors**, including a **bogus `GS010-PJ-PARSE` on a VALID `package.json`**. Only the first clause of a `visibility` string is validated | FR-J6 | V3 (L26); FR-J6's verbatim-fallback rule; FR-H6's `visibility:public` filter; FR-I2's visibility mapping | **PARTIALLY CORRECT — "can crash" is FALSE, and the truth is worse** |
| 13 | `GS001-DEPR-CURR-SYM` fires on the bare string in **`.hbs` only**. A `.price__currency_symbol` rule in `assets/css/screen.css` does **not** trip it; the same class in a `class="…"` attribute inside a `.hbs` file **does** | FR-J6, FR-J1 | `sections-inventory.md` A7 (pricing sections); the class-naming rule in FR-J1/§7.1 | **half FALSE as reported** |
| 14 | `GS001-DEPR-CSS-PATS` / `-CSS-AT` **do** error on CSS selectors (with two exact-regex caveats) | FR-J1, FR-J6 | §7.1's class-naming derivation; the 485 stylesheets | CONFIRMED |
| 15 | `GS090-NO-INVALID-CONDITIONAL-ARGUMENTS` is **new in v6 and fatal** | FR-J6 | FR-H8's `{{#if}}`-only rule; FR-J1; the guard directive (L21) | CONFIRMED |
| 16 | `GS110-NO-MISSING-PAGE-BUILDER-USAGE` is a **warning** (both specs), and its trigger is **anywhere in the theme except orphan partials**. `ref` is cosmetic — always attributed to `page.hbs` | FR-I1, FR-J6 | FR-I1's `@page.show_title_and_feature_image` gate (correct — **tick**); §7.4; A25/A24 on `page.hbs` | **PARTIALLY CORRECT** — the orphan-partial exclusion is missing |
| 17 | Routes upload is **`POST /settings/routes/yaml`**, `multipart/form-data`, file under field name **`routes`**, through `upload.validation({type:'routes'})`. `GET` on the same path downloads | FR-I4 | L11 (the whole rewrite) | CONFIRMED |

### Theme-convention corrections

| # | Encode this | Home | Also propagates to | ⚠ |
|---|---|---|---|---|
| T11 | **Section comments:** the spike **already emits** `{Layer name} · {Variant}` and the two labels **agree**. The real gap: **FR-J1 requires boundary comments and never specifies their content**, while §7.4 makes filenames normative and derived from layer names — so nothing keeps the two labels a hand-editor navigates by in sync across a rename. **Fix: state the comment format normatively — `{{!-- {Layer name} · {Category} · {Variant} --}}` — and bind it to the same layer-name source §7.4 binds the filename to.** Severity **Low** | FR-J1 | §7.4's layer-names-become-filenames rule; FR-D5 (rename); NFR-6(c1) snapshots (a comment change is a visible diff) | **REFUTED as reported.** Do **not** write "guaranteed to disagree" |
| T1 | `{{post_class}}` is named by FR-J5 and emitted **nowhere** — an Inflozo self-consistency violation, **not** a gscan or Ghost failure (the spike scores 0/0 without it). It carries **`post`, `tag-{slug}`, `featured`, `no-image`, `page`**. It does **NOT** carry `post-access-*` — members-visibility classes are **theme-authored**, so Inflozo must emit `{{#unless access}} post-access-{{visibility}}{{/unless}}` itself. Placement: the wrapping `<article>`, **never `<body>`** | FR-J5 | §7.4; FR-J1's partial-extraction rules (`post-card.hbs`); `sections-inventory.md` A17/A18/A24/A25 (which элements get the class); FR-D5's member-visibility control; FR-H6 | **PARTIALLY CORRECT.** Writing the fix from the report's list would silently lose members-only card styling on **every** members site. `no-image` is the class most likely to matter to FR-H8's guards |
| T2 | `alt` handling: **half A is REFUTED** — `alt="{{title}}"` beneath an `<h1>` is exactly what Casper ships. **Half B is CONFIRMED and stronger than stated** — `alt=""` on the sole content of a `post-card__image-link` leaves the link with **no accessible name**, an axe-core `link-name` failure and therefore a **WCAG 2.1 AA failure NFR-5 sets to zero** | NFR-5, FR-J5 | `sections-inventory.md` A17/A18/A19 (card designs); FR-G4's AA clause; NFR-6(a)'s axe scan; Appendix B's `feature_image_alt` | **half REFUTED / half CONFIRMED-stronger** |
| T3 | No CSS preload | FR-J3, NFR-2 | Appendix D.a rule 6 (preloads the two roman faces — **fonts** are preloaded; CSS is not) | PARTIALLY CORRECT |
| T4 | `<main>` placement differs from Casper/Source | §7.4 | FR-J1; NFR-5's landmark requirement | CONFIRMED |
| T5 | No stated position on **AMP** | NFR-7 or §7.4 | gscan v6 spec has an AMP entry; FR-J6 | PARTIALLY CORRECT |
| T6 | No stated position on **`robots.txt`** | §7.4 | FR-H2's SEO guard; FR-N1 | CONFIRMED |
| T7 | **Spike output ≠ §7.4's own specification** — and **8 further divergences** beyond the one reported | §7.4 | `spike-compiler/`; NFR-6(c1); §7.3's claim | CONFIRMED **and incomplete** — enumerate all 9 |
| T8 | `README.md` is listed in §7.4 and **never specified** | §7.4, FR-J15 | FR-J15's credit in README; FR-N4 docs | CONFIRMED |
| T9 | The escaping helper **misses a preceding backslash** — `\{{x}}` renders as `\VALUE`, i.e. **inert: false**. A functional break of FR-J1's inert-emission guarantee | FR-J1, §7.3 | FR-D4's rich-text model; NFR-3; `spike-compiler/` | CONFIRMED — **the report understates the consequence** |
| T10 | `package.json` key order is convention only — **nothing enforces it** | FR-J2 | §7.4 | CONFIRMED |
| T12 | **Missing `home.hbs`** | FR-I1 | M2 (L33) — emit `home.hbs` and **delete the FR-H2 SEO workaround** | CONFIRMED |

**Standing note from the verification, worth stating once in the PRD:** of the twelve theme-convention findings, exactly **three** are enforced by something outside Inflozo's own prose — T2's second half (axe-core `link-name`), T9 (a functional break), and T12's routing consequence. **Everything else is an Inflozo self-consistency defect or a house-style preference.** Say which each is, so a future reader does not treat house style as a platform constraint.

**Baseline fact to preserve:** the spike's emitted theme passes gscan 6.4.2 at **0 errors / 0 warnings against both the v5 and v6 specs**. **FR-J6's empirical claim holds.** None of these findings is a gscan failure — which is why each must be argued on its merits.

**Counts affected:** the gscan rule codes named in FR-J6's "reachable shortlist" — the shortlist grows; state it or state the fallback covers the rest (FR-J6 already has a verbatim fallback — **tick and keep it**).

---

## L24 · M1 — a companion PRECEDENCE ORDER in the preamble

**Ruled as:** Name a **companion precedence order** in the preamble so future contradictions resolve themselves.

**Source:** #275 (M1)
**Blast:** LARGE — it changes how every other companion edit in this map is interpreted. **Encode twenty-fourth; it must land before the counts pass (Part 5), because it decides which file wins on a stale number.**

**Home:** the preamble's "Normative companions" block.

**Propagates to:**
- **Preamble "Normative companions"** — add an explicit ordered precedence. The existing per-companion notes already imply one; make it a list. Current implied ordering, to be confirmed: research companions (citation-backed, on Ghost facts) > normative companions (`sections-inventory.md`, `appendix-b1`, `appendix-h1`) > `prd.md` body > `addendum.md` (normative for mechanism, not scope) > `spike-compiler/` (empirical, narrow scope). **Note the standing evidence for that ordering: three reviewers independently found the research companions MORE accurate than the `prd.md` body, and every spot-check of `research-ghost-membership-pages.md` and `research-ghost-binding-contexts.md` matched current Ghost source exactly — the regression risk lives in the DISTILLATION step.**
- **Preamble** — **add the four new companions**: `research-ghost-koenig-cards.md`, `research-canvas-iframe-geometry.md`, `research-contested-variants.md`, `research-section-js-libraries.md`. Each with its scope and what it is source-of-truth **for**.
- **Preamble** — add the two **design prompts** (`claude-design-prompt-2.md`, `claude-design-prompt-3-library.md`) with their own precedence (prompt 2 wins over prompt 1 where they disagree, because it encodes decisions made after prompt 1 was written).
- **Preamble** — add the **verification files** (`verify-mechanical-ghost-claims.md`, `verify-mechanical-theme-and-math.md`) and state that they **override review findings**.
- **Preamble** — the research companions are **dated snapshots**. State that they are not edited to match the PRD; the PRD moves to match them.
- **Appendix A** — *"the inventory wins"* on conflict with `prd.md`. Verify it agrees with the new order.
- **Appendix B** — *"where the two disagree the research is right and the matrix is a bug"* (about `appendix-b1` vs `research-ghost-binding-contexts.md`). Verify.
- **Appendix B** — *"FR-H5's helper list is the shim's contract and governs on any difference"*. Verify.
- **`addendum.md`** preamble — already states its own force precisely (*"normative for intent, not for scope … on any conflict with `prd.md` the PRD wins"*). Verify the global order does not contradict it.
- **`appendix-b1-template-contexts.md` §8 "Contested — verify at runtime"** — the contested rows are where precedence matters most. Cross-reference §7.6 item 13/14 and E0 (L14).
- **§7.6 item 14(b)** — a **direct contradiction between two research companions** on tiers visibility. ⚠ **The precedence order cannot resolve a research-vs-research conflict.** State the tie-break: **E0 resolves it at runtime, and until then FR-H6's explicit `visibility:public` filter is correct either way.** That sentence already exists in §7.6 — good; make sure the precedence block points at it as the pattern for research-vs-research.
- **Every companion's frontmatter** — each carries its own `status`. Verify all six/ten agree with the preamble's description of them.
- **Appendix I glossary** — no entry needed; **tick**.

**Counts affected:** the **number of companions** listed in the preamble: currently 8 entries. New total after adding 4 research + 2 design prompts + 2 verification files = **16**. Re-derive and verify every file in the folder that is normative is listed, and nothing listed is missing.

**Conflicts:** none to delete, but any per-companion precedence sentence that contradicts the global order must be rewritten to defer to it.

**New content required:** the precedence list; the eight new manifest entries; the dated-snapshot rule; the research-vs-research tie-break.

---

## L25 · H15 + H16 + GPRO — the Staff Access Token's graceful path, deferred credential steps, and the Ghost(Pro) blocking gate

**Ruled as:** **H15 (option 3):** **BOTH** a graceful no-token path **AND** the token path, **and change the security promise to match**. **H16 (option 3):** **defer two of the three credential steps until first deploy.** **GPRO:** **no Ghost(Pro) Starter target before MVP** — the owner will test Ghost(Pro) plans once an MVP exists. **REQUIRES A BLOCKING GATE:** capture the real `GET /admin/config/` `hostSettings.limits` payload from a Ghost(Pro) Starter site and verify FR-C2's Preview-only detection against it **BEFORE any public launch or any marketing aimed at Ghost(Pro) users**. Until that gate clears, the Preview-only path is written against an **unseen payload shape** and must be recorded as a **KNOWN UNTESTED PATH**, not an assumed-working one. **The owner asked to be reminded — carried in project memory as well as here.**

*(Context: a v3.0 critical found the Staff-Access-Token capability asserted as settled fact in five places and listed as unverified in a sixth; another found it breaks the security posture **P8** advertises, and that the persona who most needs it usually cannot supply it. A third found **three credential mints inside a 10-minute p75** — G1.)*

**Source:** #268 (H15, H16), #263 (the Ghost(Pro) gap), #264 (the deferral + blocking gate)
**Blast:** LARGE. **Encode twenty-fifth. Depends on L11 (the token now also writes `routes.yaml`, which makes the no-token path cover more).**

**Home:** FR-C1 + §4's T4 + §7.6 item 2.

**Propagates to — H15/H16 (the token):**
- **FR-C1** — currently the token is *"required, not optional"* and all three credentials are pasted at connect. **H16 defers two of three to first deploy.** Rewrite the flow: which credential is minted when, and what the user can do before the deferred ones exist.
- **FR-C1** — the justification list gains routes upload (L11), which makes deferral **more** consequential: a project cannot complete a routed deploy without the token.
- **FR-C2** — validation currently needs the Admin key at connect. If it is deferred, **what does connect validate?** The Content API key alone cannot prove the Admin credential. **Resolve explicitly.**
- **FR-C3** — the security promise. **H15: change it to match.** Today: *"Admin API keys and the Owner Staff Access Token are encrypted at rest with Supabase Vault and **never sent to any client**"*. That survives. What must change is the **posture** claim — a staff token is a **full-Administrator** credential, and P8's read-only-content promise plus §1.4 #5's safe-installs promise both lean on it. Rewrite both.
- **P8** — already being amended by L11. **Amend once, covering both changes.**
- **§1.4 #5 Safe installs** — *"Capture is real, not best-effort … Inflozo reads the live theme with the site Owner's **Staff Access Token**"*. With a graceful no-token path, capture is **conditionally** real. ⚠ **Rewrite: the promise must state the token case and the no-token case, and FR-J13 already has the designed degraded path — surface it in §1.4 rather than only in FR-J13.**
- **FR-J13** — the degraded path exists and is designed. Verify it now covers **routes upload** too (L11), not just snapshot.
- **FR-J16** — drift detection needs the token; the fail-open rule already covers absence (*"a revoked token … reports 'couldn't verify' and the deploy proceeds"*). **Tick**, and verify it is consistent with the graceful path.
- **FR-C8 Manage keys** — the re-paste flow must handle a **partially credentialed** site (H16's deferral).
- **§3 Users & Roles / personas** — ⚠ *"the persona who most needs it usually cannot supply it"* — the **solo publisher** (primary persona, zero code skills) may not be the site Owner. **H20 (L37) thickens the personas; state the credential capability per persona there.**
- **G1 (§1.3)** — *"< 10 minutes end-to-end … including creating the Custom Integration in Ghost Admin"*. **H16's deferral is the fix for the three-mints-in-10-minutes problem.** Rewrite G1's scope to match what connect actually does now.
- **G2** — starts at an already-connected site; verify it does not now contain a deferred credential step.
- **§8 E3** — owns the connect wizard; rewrite its scope and exit criteria for the deferred flow.
- **§8 E7** — owns FR-J13/J16 and now the first-deploy credential step. Add.
- **§7.5 `sites`** — `admin_key_vault_ref`, `staff_token_vault_ref` must be **nullable** and the record must carry which credentials exist. Add.
- **§7.6 item 9** — closed by L11 for both `themes` and `settings`. The *"asserted in five places, unverified in a sixth"* inconsistency resolves with it. **Verify all six places now agree.**
- **NFR-3** — Vault, server-only, per-request decrypt. **Tick**, but add the staff token's scope disclosure.
- **Journeys mandate (preamble)** — *"connect → first deploy"* is a mandated journey; H16 moves work into it. Amend the note.
- **FR-N4 docs** — *"Connecting your Ghost site (custom integration walkthrough with screenshots)"* must cover the staff token, the deferral and the no-token consequences.
- **Appendix H** — the copy for "you'll need one more credential before you can deploy".

**Propagates to — GPRO (the Ghost(Pro) gate):**
- **§4 T4** — *"a Ghost(Pro) **Starter** site (verifies the Preview-only path)"*. ⚠ **T4 does not exist before MVP.** Rewrite §4's target list: T4 becomes a **post-MVP** target with a blocking pre-launch gate.
- **§4** — *"**Deployable targets are T1–T3.** … **T4's criterion is narrower and specific:** a deploy attempt against T4 fails with the friendly Starter message and sets Preview-only."* Rewrite: that criterion is **deferred**, and the path is **KNOWN UNTESTED** until it clears.
- **§4 Definition of Done** — add the blocking gate: no public launch and no Ghost(Pro)-aimed marketing until the real `hostSettings.limits` payload is captured and FR-C2's detection verified against it.
- **FR-C2** — the `hostSettings.limits` probe reads an **undocumented, host-controlled shape**. It already has a fallback (ask the user which plan). ⚠ **Add the KNOWN UNTESTED marking**, and verify the fallback is the *primary* path until the gate clears.
- **§7.6 verify-at-build item 1 and item 2** — item 2 becomes the **blocking gate**; item 1 (the 2026 plan lineup) rides with it. **Mark both as launch-blocking, not merely pre-epic.**
- **§7.6 "Assumed, unvalidated"** — add the Preview-only path as an untested path.
- **§7.6 risk table** — the *"Ghost(Pro) Starter blocks custom themes"* row cites T4 as the verifier. ⚠ **Rewrite: T4 does not exist yet.**
- **§8 E3 exit** — *"on T4 the connect-time probe sets Preview-only and clears it when the probe changes"*. ⚠ **Cannot be met.** Rewrite E3's exit.
- **§8 E4/E7 joint compile gate** — *"a deploy attempt against T4 fails with the friendly Starter message and sets Preview-only (FR-C2, §4)"*. ⚠ **Cannot be met.** Rewrite the joint gate.
- **§8 E15** — the blocking gate belongs in E15's owned gates.
- **Appendix F.3** — the **T4 line ($15 yearly / $18 monthly)** does not start until post-MVP. That changes the baseline band's composition **and its arithmetic** — L9's $107 floor **includes T4 at $15**. ⚠ **Re-derive: the pre-MVP baseline excludes T4 entirely.** State both the pre-MVP and post-MVP bands.
- **Appendix E** — *"Tier and paywall behavior in these starters … is accepted on **T1–T3 only**: Ghost(Pro) Starter has no paid subscriptions, so T4 can neither create tiers nor gate a post, and its acceptance scope is the Preview-only block path and nothing else"*. Verify against T4's absence.
- **Appendix I glossary** — **Test environment** entry lists *"Ghost targets T1–T4"*. ⚠ **Rewrite.** **Preview-only** entry says the flag is *"set and cleared automatically by the `hostSettings.limits` probe, with the deploy error authoritative"* — add the untested marking.
- **FR-N1 / FR-N3 / FR-N4** — no Ghost(Pro)-aimed marketing until the gate clears. FR-N4's *"**Hosting requirements** (self-hosted and Ghost(Pro) tiers; Starter limitation)"* page states the limitation from an unverified payload. **Mark it.**
- **Project memory** — the owner asked to be reminded. Already carried; note it here so the encode does not treat the memory note as redundant.

**Counts affected:**
- **Three credentials at connect → one at connect + two at first deploy.** Re-state everywhere the credential count appears (FR-C1, FR-C8, G1, FR-N4, §8 E3).
- **Ghost deploy targets T1–T3 (deployable) / T1–T4 (fleet)** — T4 leaves the fleet pre-MVP. Every *"all Ghost deploy targets (§4)"* reference must be re-checked (FR-J9, §8 E7, E11, E15, §4 DoD).
- **Appendix F.3's $107 floor and $110/$120/$130 band** — re-derive without T4 for the pre-MVP period.
- **30 serialized starter deploys** in the DoD run (FR-J11, §4) — recount against T1–T3.

**Conflicts:**
- §4's T4 as a present target.
- §8 E3's and the E4/E7 joint gate's T4 exit criteria.
- §7.6's T4-verifies-it risk row.
- Appendix I's T1–T4 in the Test-environment entry.
- §1.4 #5's unconditional "capture is real".
- FR-C1's "required, not optional" as an at-connect requirement.

**New content required:** the deferred-credential flow; the graceful no-token path's full scope (snapshot + drift + routes); the revised security promise; the GPRO blocking gate and the KNOWN UNTESTED marking.

---

# PART 2 — MEDIUM blast radius

---

## M-1 · BATCH — the remaining six of the eight approved mechanical criticals

*(Items 3 "routes auto-upload" and 7 "close §7.6 item 9" are encoded in **L11**. The six below remain.)*

**Source:** #246
**Blast:** MEDIUM each; MEDIUM–LARGE as a batch.

### M-1a · Always emit `en.json`
**Ruled as:** ⚠ The v3.0 critical: FR-Q6's *"exactly one locale file"* ships a site rendering **raw translation keys** when the project language is not English, because Ghost's i18n falls back to `en` and there is no `en.json` to fall back to. **Always emit `en.json`**, plus the project-language file when it differs.
**Home:** FR-Q6.
**Propagates to:** FR-Q6's *"The theme ships **exactly one locale file**"* — ⚠ **delete "exactly one"**; it becomes "always `en.json`, plus the project language file when different". · **§7.4 tree** — `locales/{language}.json # exactly one file, named for the project language (FR-Q6)` → **rewrite**. · **Appendix B — Chrome strings paragraph** — repeats "exactly one locale file"; rewrite. · **`appendix-h1-string-catalog.md` §1 Rules and §7 V3** — V3 asserts *"the emitted locale file's key set equals the catalog's key set"* — now **two** files; rewrite the assertion. · **FR-J12** — ZIP export includes the locale file(s). · **FR-J14** — the catalog migration map applies per file. · **FR-Q6's "so every key always resolves and no second file can disagree with it"** — ⚠ that reason is now false; a second file exists. **Rewrite the reason: `en.json` is the fallback of record, the project file overrides it, and the compiler emits both from one catalog so they cannot disagree.** · **Appendix D.b** — non-latin coverage check interacts (a project language whose face cannot render its chrome strings falls back to the system stack). · **Appendix I glossary — Chrome strings** — *"ship via `{{t}}` + a single `locales/` file"*; rewrite. · **FR-J6** — gscan's translation check is a JSON parse only (L23 #5); two files, two parses. · **§8 E7** — owns `locales/` emission.
**Counts:** locale files **1 → 1 or 2**. `appendix-h1-string-catalog.md` §4's "Listed in the Translations surface: 128" is unaffected — **tick**.
**Conflicts:** "exactly one locale file" in FR-Q6, §7.4, Appendix B, Appendix I; V3's assertion.

### M-1b · Restore NQL relative-date filtering
**Ruled as:** ⚠ **VERIFIED CORRECTION of the PRD.** FR-I2's *"**Published date is not offered:** NQL has no relative-date syntax, so 'within the last 30 days' cannot compile into a static `routes.yaml` at all, and a fixed date silently freezes — the field is dropped rather than shipped broken"* is **FALSE**. Run against `@tryghost/nql`, `published_at:>now-30d` parses to `{"published_at":{"$gt":"…"}}`, **and the `routes.yaml` `filter` string is re-parsed per request, so it does not freeze.** The claim originated as an unverified reviewer assertion, was escalated to a finding, carried into the validation report, and adopted into normative PRD text — **where its confident *reason* would have stopped anyone downstream from re-examining it. A working, frequently-wanted feature was deleted on a review artifact's say-so.**
**Home:** FR-I2.
**Propagates to:** FR-I2's field→NQL mapping list — **add published date** with its relative syntax and its normative mapping. · FR-I2's validation clause. · **FR-H2's Data group** — Source options are Latest/Featured/By tag/By author/Hand-picked; **does relative date join them?** ⚠ The Data group drives `{{#get}}`, not `routes.yaml`. **Decide and state whether the restore covers the collection filter builder only, or the Data group too.** · **Appendix B "Query rules"** — NQL filter examples. · **`sections-inventory.md`** — any category whose `Data:` line could offer it (A17–A21, A26, A27, A31 #4). · **§7.6** — ⚠ **the residual gap:** the defect is proven against `@tryghost/nql@0.13.1`/`0.13.4`; **Ghost's runtime resolution to the same build is NOT verified** (its `package.json` declares `"catalog:"`). Add a verify-at-build item. · **§7.6 risk table** — add a row for the reviewer-assertion failure class itself, since it has now happened three times (FR-I2 relative dates, FR-I2 per-collection limit, FR-I4 routes upload) — the standing rule belongs in the PRD, not only in the memlog.
**Conflicts:** FR-I2's "Published date is not offered" sentence and its stated reason — **delete both.**

### M-1c · Fix `wrapGuard`'s guard-field derivation + add a helper-bound test
**Ruled as:** `spike-compiler/compile.js:154`'s `wrapGuard` emits `{{#if YYYY}}` — a **garbage guard identifier**, i.e. **silent, permanent content loss**. Fix the derivation and add a **helper-bound test** (the existing `test.js` cannot see it: its assertions compare class skeletons and its date helper is a passthrough stub).
**Home:** `spike-compiler/compile.js` + FR-H8.
**Propagates to:** **FR-H8** — the guard rule is correct; the *derivation* of the guarded field is what broke. State the derivation normatively (guard on the **bound field**, never on the format argument). · **§7.3 mechanic 2** — *"Guards wrap the **element**, never the attribute"* — correct; add *"and guard on the bound field, never on a helper argument"*. · **NFR-2 assertion 5** — *"no layout shift from unguarded elements … asserted by proving no unguarded `src`/`srcset` survives compilation"*. A garbage guard is *present* but wrong, so assertion 5 passes while the content is lost. ⚠ **Strengthen assertion 5: guards must be present AND resolve to a real bound field.** · **NFR-6(c1)/(c2)** — the helper-bound test lives here; (c2) must also assert the **date format argument** is honoured (L15). · **L21's guard directive** — the directive must make the wrong derivation unexpressible. · **§7.6 "Assumed, unvalidated"** or §7.3 — record the spike's two known defects until fixed.
**Conflicts:** any text implying the spike is defect-free.

### M-1d · `engines.ghost: ">=5.0.0"`
**Ruled as:** The spike emits `engines.ghost: ">=6.0.0"`, which **contradicts NFR-7's 5.x support, and no gate sees it.** Emit **`>=5.0.0`**.
**Home:** FR-J2.
**Propagates to:** FR-J2's `package.json` shape — add `engines.ghost` explicitly with its value. · **FR-J1** — already mandates **no `engines.ghost-api`** (a standing gscan *warning* on both specs — ⚠ **verified as the non-obvious half of that claim, and it is right; do not disturb it**). `engines.ghost` and `engines.ghost-api` are **different keys**; state both so they are not conflated. · **NFR-7** — the 5.x/6.x support claim now has a declaration behind it; verify NFR-7's *"compatibility comes from the **helper surface** … **not** from a `package.json` declaration"* is not contradicted. ⚠ **It reads as contradicted.** **Rewrite: the helper surface is what makes 5.x work; `engines.ghost` declares the floor Ghost checks at upload.** · **§4 T3** (5.x droplet) and **M12 (M-10h)** — the permanent 5.x instance is what tests the claim. · **§7.4 tree comment** — `# NO engines.ghost-api (FR-J1, NFR-7)` → add `engines.ghost: ">=5.0.0"`. · **FR-C8/FR-C2** — version detection accepts 5.x and 6.x; consistent. **Tick.** · **FR-J6** — Ghost checks uploads against `v${majorVersion}`; verify no interaction. · **§8 E7** exit.
**Counts:** none.
**Conflicts:** the spike's `>=6.0.0`; NFR-7's "not from a `package.json` declaration" as written.

### M-1e · CSP `frame-ancestors 'self'`
**Ruled as:** ⚠ NFR-3's CSP **forbids the same-origin iframe §7.3 mandates**. `frame-ancestors 'none'` → **`'self'`**.
**Home:** NFR-3.
**Propagates to:** NFR-3's CSP directive list. · **§7.3's same-origin section** — the CSP was the one real objection to the boundary; note it is resolved. · **FR-N2** — the marketing gallery uses the same hosting model and the same CSP applies. · **L7** — same iframe; encode together. · **NFR-3's `connect-src`** — ⚠ a separate v3.0 finding: *"`connect-src` is per-user dynamic, stated as a static header"* (it must include **the connected Ghost site's origin**, which varies per project). **Fix in the same edit:** state that `connect-src` is composed per session/project, not a static string. · **§7.1** — Next.js middleware/headers own the CSP; note where it is composed. · **§8 E1** — owns the app shell and therefore the header. · **§8 E14** — marketing site headers.
**Counts:** none.
**Conflicts:** `frame-ancestors 'none'`; `connect-src` as a static list.

### M-1f · The GDPR purge proceeds on the 14-day deadline regardless of snapshot download
**Ruled as:** ⚠ FR-A5's purge is **gated on an action a departed user will never take**. The purge **proceeds on the 14-day deadline regardless** of whether snapshots were downloaded or declined.
**Home:** FR-A5.
**Propagates to:** FR-A5 — ⚠ **delete** *"the purge proceeds **only once** the user has downloaded or explicitly declined them"*. Replace: snapshots are **offered** during the window; the purge proceeds on the deadline. · **FR-J13** — *"offered as a download before account purge (FR-A5)"*; verify wording. · **FR-C6** — the 90-day orphan-snapshot purge follows *"a notice and a download offer (the FR-A5 rule applies)"*. ⚠ **The FR-A5 rule just changed — verify FR-C6 inherits the corrected version.** · **NFR-8** — *"**Delete** is FR-A5"*. Tick. · **FR-P1/FR-P2** — is there an email for "your snapshots are about to be purged"? Currently five emails and no such one. ⚠ **A departed user gets no email, which is the whole point of the finding. State explicitly that no email is sent and why (FR-P2's no-nudge rule), or carve out a sixth.** **Owner-decidable; flag.** · **§8 E2** — owns FR-A2–A6; exit criteria. · **Appendix I glossary — Pre-Inflozo snapshot** — verify.
**Counts:** 14-day soft-delete window unchanged; the email count (5 + conditional 6th) may move.
**Conflicts:** FR-A5's "only once".

---

## M-2 · V1 + V2 + V3 — three verification-escalated fixes

**Source:** #278
**Blast:** MEDIUM each.

### V1 · Validate translation-override ICU syntax at ENTRY **and** at compile
**Ruled as:** **BOTH.** Validate at **entry** (refuse to save a broken override) **AND** at **compile** as a backstop. ⚠ **Escalated by verification:** a stray brace throws in the `MessageFormat` constructor **outside the try/catch** and escapes into `res.render`, producing a **WHOLE-PAGE 500** — not a graceful fallback. **This is a user-input path with no validation on it.**
**Home:** FR-Q6 (the Translations surface).
**Propagates to:** FR-Q6 — add entry-time validation with a stated refusal, and compile-time as a backstop. · **`appendix-h1-string-catalog.md` §7** — add assertions to V1–V8: **the override must compile under `intl-messageformat`**, and **its placeholder set must match the catalog entry's declared set** (V4 covers the `{{t}}` call side; the *override* side is uncovered). · **`appendix-h1-string-catalog.md` §1 Rules** — state that overrides are ICU, not plain strings, so `{` and `}` are syntax. · **`appendix-h1-string-catalog.md` §6 Migration map** — a carried-forward override must be re-validated after migration. · **FR-J6** — a broken override is not a gscan failure; state that Inflozo's own gate catches it. · **NFR-3** — a user-input path reaching `res.render` on the visitor's site is a **reliability** issue, arguably a security one. Add to NFR-4 (reliability) if not NFR-3. · **§7.5** — the translation-overrides table stores the validation state. · **§7.6 risk table** — new row: an unvalidated override 500s every page that renders the label. · **§8 E7** — owns the Translations surface. · **Appendix H** — the refusal copy.
**Counts:** the catalog's compile-validation assertion count **V1–V8 → V9/V10**.

### V2 · Never emit redundant or nested parentheses in the filter builder
**Ruled as:** A **normative rule** on FR-I2's filter builder: **never emit redundant or nested parentheses; flatten single-child groups.** ⚠ Verified against `@tryghost/nql` 0.13.1: `((tag:news))` parses to the garbage key `{yg:{...}}` **SILENTLY, with no error** — and **All/Any nesting is exactly what the builder emits.**
**Home:** FR-I2.
**Propagates to:** FR-I2's *"All/Any groups compile to `+` and `,` with parenthesized nesting"* — ⚠ **add the flattening rule as a constraint on that sentence, not as a separate note.** · FR-I2's *"The builder emits NQL and never parses it, so validation is a round-trip over what the builder produced"* — ⚠ **the round trip would not catch this: the garbage parse is silent and produces a valid-looking result.** **Rewrite the validation claim: the round trip must assert the parsed AST matches the intended filter, not merely that parsing succeeded.** · **Appendix B "Query rules"** — the editor's own NQL filters have the same hazard; state the rule applies to both. · **FR-H2's Data group** — Source/filter combinations that could nest. · **FR-H4/FR-H5** — the editor's Content API reads use NQL. · **`appendix-b1-template-contexts.md` §5 "Requires `{{#get}}`"** — filter expressions. · **§7.6** — the residual nql-version gap (M-1b). · **§7.6 risk table** — new row: a silently mis-parsed filter serves the wrong posts with no error anywhere. · **§8 E7** — owns FR-I2.
**Counts:** none.
**Conflicts:** FR-I2's round-trip validation claim as currently reasoned.

### V3 · Replace gscan's swallowed-error signature with an Inflozo-authored explanation
**Ruled as:** Replace gscan's swallowed-error signature — **19 errors including a bogus `GS010-PJ-PARSE` on a VALID `package.json`** — with an **Inflozo-authored explanation** at the FR-J6 gate.
**Home:** FR-J6.
**Propagates to:** FR-J6's *"human-readable mapping … scoped to the reachable shortlist … any unmapped rule falls back to a stated verbatim format"* — ⚠ **the verbatim fallback is exactly wrong here: verbatim means showing 19 errors and a lie about the `package.json`.** **Add a special case: the cascade signature is detected and replaced with one Inflozo-authored explanation naming the real cause (a malformed `visibility` string — and only the first clause of a `visibility` string is validated).** · **FR-H6** — the `visibility:public` filter and the visibility values. · **FR-I2** — the visibility→NQL mapping (`visibility:{public|members|paid}`). · **`sections-inventory.md`** — any category writing a `visibility` value. · **FR-J8** — the deploy progress UI's error surfacing (*"Checking (gscan)"* stage). · **Appendix H** — *"errors are human and name the fix"*; this is the canonical case. · **§7.6 risk table** — a gscan cascade misdiagnoses a valid file. · **§8 E7** — owns FR-J6.
**Counts:** none.

---

## M-3 · H13 — build the in-product membership-binding flow

**Ruled as:** **Build the in-product membership-binding flow.** *(A v3.0 finding: binding a designed membership page to a Ghost Page has **no in-product flow and no docs page** — the user must know to go into Ghost's page editor and pick a Template.)*
**Source:** #268 · **Blast:** MEDIUM.
**Home:** a new FR in the FR-I block.
**Propagates to:** **FR-I1** — states the mechanism (*"the user binds it to an ordinary Ghost Page by picking it from the **Template** dropdown"*) but no flow. Add the flow reference. · **FR-I5** — *"a project can ship a fully designed signup, signin and member-home page and still deploy with default routing"* — the binding step is the missing one; L11 already rewrites this. · **FR-D6** — the membership canvases; the flow should be reachable from there. · **FR-J8** — post-deploy: the flow is a **post-deploy** step, so it belongs in the deploy success state, not only in a settings page. · **FR-B7 notifications** — a "one more step" notification after a deploy that emitted a `custom-*.hbs`. · **FR-N4** — **add a docs page** (the finding names its absence). · **FR-O1** — starters ship no membership template, so the flow never fires for a starter's first deploy. **Tick and keep the confetti clean.** · **§7.4's frozen-filename rule + L22** — the flow must show the exact filename and its dropdown label. · **`sections-inventory.md` A30** — cross-reference. · **§8 E7** (owns FR-I1–I5) or **E5** — assign. · **Appendix H** — the flow's copy. · **Journeys mandate (preamble)** — a candidate sixth flow; the mandate currently names five. **Decide whether to add it.**
**Counts:** the preamble's **five named flows** may become six.

---

## M-4 · H14 — define the one true upload-succeeds / activate-fails behaviour

**Ruled as:** **Define the one true upload-succeeds/activate-fails behaviour.** *(A v3.0 finding: it is unspecified, and **four requirements disagree about what happened**.)*
**Source:** #268 · **Blast:** MEDIUM.
**Home:** FR-J8.
**Propagates to:** **FR-J8** — the five-stage UI (Compiling → Checking → Uploading → (Activating) → Live) and *"a failed upload never leaves a partially active theme"* (that is **FR-J11**'s sentence). Define: upload succeeded, activate failed — what is the deploy's recorded status, is the artifact retained, is the theme name frozen, does drift baseline update? · **FR-J11** — *"idempotent; a failed upload never leaves a partially active theme"*. Reconcile: the *upload* succeeded. · **FR-J10** — the theme name **freezes at first deploy to that site**. ⚠ Does it freeze on an upload-without-activation? **FR-J13 says the snapshot triggers at first *upload* (deploy-only included)** — so the snapshot rule and the name-freeze rule should agree. **State both.** · **FR-J13** — first-upload trigger. Tick against the above. · **FR-J16** — drift compares against *"what Inflozo last deployed there"*. Did a non-activated upload count as deployed? **State it.** · **FR-J7** — artifacts stored *"on each successful compile"*; unaffected. **Tick.** · **FR-J9 rollback** — the history list's *"active badge"*; a deployed-not-activated version has no badge. · **FR-B7** — the notification text. · **FR-P1 email (5)** — deploy failure notice: is this a failure? **State.** · **§7.5 `deploys`** — `status, activated` are separate columns already. **Tick, and make the enum explicit.** · **§7.5 `deploy_jobs`** — the stage enum must include this outcome. · **Appendix H** — the error copy. · **§8 E7** exit.
**Counts:** none.
**Conflicts:** FR-J11's "never leaves a partially active theme" as a blanket claim.

---

## M-5 · H18 — static placeholders for dashboard thumbnails in v1

**Ruled as:** **Static placeholders for dashboard thumbnails in v1.** *(A v3.0 finding: FR-B1's client-side thumbnail capture is **probably unimplementable**, and Appendix F depends on it.)*
**Source:** #268 · **Blast:** MEDIUM.
**Home:** FR-B1.
**Propagates to:** **FR-B1** — ⚠ **delete** *"auto-captured canvas thumbnail"* and *"**The thumbnail is captured client-side from the same-origin canvas** (§7.3) and uploaded to the `thumbnails` bucket — no headless browser and no server-side render of the section runtime exists anywhere in the product."* Replace with static placeholders and state the deferral. · **Appendix G** — add auto-captured thumbnails to the deferred list (Appendix G is *"binding in both directions: nothing elsewhere calls 'deferred' anything absent from it"* — so it **must** be listed). · **§7.1** — *"**Thumbnail capture is not server work** — FR-B1 captures it client-side … so no headless browser runs on Vercel and Appendix F carries no Chromium line item."* ⚠ The **conclusion survives** (still no headless browser) but the **reason changes**. Rewrite. · **§7.1 Storage buckets** — the `thumbnails` bucket may be unnecessary in v1. **Decide: keep it empty-but-provisioned or remove it.** · **§7.5 `projects.thumb_path`** — same. · **Appendix F.3** — the no-Chromium claim's basis changes; the storage line for thumbnails goes to zero. Feed L9. · **§8 E1's dashboard cut line** — *"**OUT** … canvas thumbnails (E5)"*. Rewrite: thumbnails are static, so they are **IN** at E1 (or trivially so). · **§8 E13** — *"canvas thumbnails captured client-side"* → **delete.** · **§8 E5** — the capture was implicitly E5's; remove. · **FR-B2 / FR-B6** — the dashboard's other surfaces; verify no dependency. · **Appendix H** — placeholder copy if any. · **NFR-1** — dashboard LCP < 2 s; static placeholders help. Tick.
**Counts:** **Vercel/Supabase storage lines** in Appendix F; the bucket count in §7.1 (currently four: `assets`, `deploy-artifacts`, `site-snapshots`, `thumbnails`).
**Conflicts:** FR-B1's capture sentence; §7.1's reason; §8 E13's and E1's cut-line entries.

---

## M-6 · H11 — extend Free-tier exit blocking to all 22 uncovered items

**Ruled as:** **Extend Free-tier blocking to all 22 uncovered items.** *(A v3.0 finding: FR-L3's exit-block remediation — "upgrade · swap to a Free variant via Shuffle · remove it" — **does not apply to 22 of the things it gates**, because non-placeable treatments cannot be shuffled or removed from a canvas, and some binding contexts have no Free variant to swap to.)*
**Source:** #268 · **Blast:** MEDIUM.
**Home:** FR-L3.
**Propagates to:** **FR-L3** — the block sheet's per-item options must cover: the **28 non-placeable treatments** (A32 paywall designs, A33 card treatments, A34 pagination styles) — which are **selected**, not placed, so the remediation is *"choose a Free design"*, not *"remove it"*; and the contexts with **no Free option** (A31 #6/#7/#9 custom page templates, A30's member-home surface — FR-G2 names them). · **FR-G2** — already states the floor is **not** guaranteed for those contexts and that FR-L3's sheet *"must therefore offer 'remove the section' alongside 'swap to a Free variant'"*. ⚠ **For a non-placeable treatment, neither option works.** **Add the third remediation: revert to the Free design.** · **`sections-inventory.md`** — A32 #1/#2, A33 #1/#2, A34 #1/#2 are `[Free]`; verify the revert target exists for each of the three. **It does — state it as the mechanism.** · **Appendix F.1** — the Paywall-editor row already says *"A32 #1–#2 are [Free], the other 10 gate at the exits"*. Add equivalent rows for A33 and A34 (**and for the card module — L5**). · **FR-J12** — export gating mirrors deploy gating exactly; the same remediation applies. · **FR-D13 / FR-D17** — Shuffle and Remix never touch the 28, so they are not the remediation path. State it. · **FR-H6** — the Paywall editor's design selection is the remediation surface for A32. · **L5's card module** — the remediation surface for A33. · **FR-H2** — the main feed's Pagination control is the remediation surface for A34. · **Appendix I glossary — Open canvas, gated exits** and **Non-placeable treatment**. · **§8 E12** — owns FR-L1–L5. · **§8 E11** — owns FR-G2's whole-library verification. · **Appendix H** — the sheet's copy.
**Counts:** **22** — derive it and state the derivation, or the number is unverifiable. Candidates: 26 non-Free of the 28 non-placeable (12−2 + 6−2 + 10−2 = 10+4+8 = **22**). ⚠ **That reconciles exactly — state it.**
**Conflicts:** FR-L3's three-option sheet as an exhaustive list.

---

## M-7 · M2 — emit `home.hbs` and delete the FR-H2 SEO workaround

**Ruled as:** **Emit `home.hbs`** and **delete the FR-H2 SEO workaround.** *(Verified CONFIRMED: `home.hbs` is missing, and gscan's v1 spec carries a Home-template entry. Ghost resolves `home.hbs` for the site root and `index.hbs` for paginated pages, which is exactly what the workaround was hand-rolling.)*
**Source:** #275 · **Blast:** MEDIUM.
**Home:** FR-I1.
**Propagates to:** **FR-I1** — add `home.hbs` to the always-compiled set (or to the conditional set — **Ghost falls back to `index.hbs` when `home.hbs` is absent, so emitting it is a choice; state which**). · **FR-H2** — ⚠ **delete** the SEO-guard workaround: *"the compiler emits an SEO guard on such templates (`noindex` beyond page 1 plus a canonical link to page 1) so Ghost's automatic pagination never produces indexable duplicates"*. With `home.hbs` serving the root and `index.hbs` serving `/page/N/`, the duplicate does not arise the same way. ⚠ **Verify this carefully before deleting — the zero-feed case and the archive case are different, and the guard may still be needed for `tag.hbs`/`author.hbs`.** **Do not delete more than `home.hbs` actually replaces.** · **§7.4 tree** — add `home.hbs`. · **`sections-inventory.md` § Synthesis Defaults § 1** — ⚠ *"**NEVER synthesized:** … plus `private.hbs`, **`home.hbs` (not emitted at all; Home compiles to `index.hbs` per `prd.md` §7.4)**"*. **This sentence is now wrong. Delete it and add `home.hbs` to the synthesizable set.** · **`sections-inventory.md` § Synthesis Defaults § 3 `index.hbs` (only when Home is untouched)** — the heading and the trigger both change: Home is now `home.hbs`, and `index.hbs` is the paginated continuation. **Rewrite the stack table and the main-feed rule for both files.** · **`sections-inventory.md` § Main-feed rule** — *"On every synthesized collection template (`index.hbs`, `tag.hbs`, `author.hbs`)"* → add `home.hbs`. · **FR-D6** — *"**Synthesis applies to exactly six templates** — `index.hbs`, `post.hbs`, `page.hbs`, `tag.hbs`, `author.hbs`, `error.hbs`"*. ⚠ **six → seven.** This phrase recurs; grep for it. · **FR-I1** — *"the six synthesizable templates"* — same. · **FR-G2** — *"every context reachable from the six synthesizable templates (FR-D6)"* — same. · **FR-J1** — synthesis before assembly. · **FR-D5** — *"Hiding every section is not emptying"*; applies to `home.hbs` too. · **FR-H2's main-feed designation lifecycle** — the Home canvas now emits two files; **does the main feed live in both?** ⚠ **This is the substantive question: `home.hbs` and `index.hbs` must render the same design, or page 1 and page 2 disagree.** **State the rule.** · **`appendix-b1-template-contexts.md` §3 master matrix** — **add a `home.hbs` row** (its context differs from `index.hbs`: the docs' Index context vs Home). **§3b, §10 template resolution order** — verify. · **FR-J6** — gscan's Home-template entry. · **NFR-6(c1)** — a new compiled file to snapshot. · **§8 E7** exit. · **Appendix I glossary — Synthesis Defaults**.
**Counts:** **"exactly six templates" → seven**, in FR-D6, FR-I1, FR-G2 and the Synthesis Defaults. **Grep for "six".**
**Conflicts:** the Synthesis Defaults' "`home.hbs` not emitted at all"; FR-H2's SEO guard (in whole or part); every "six synthesizable templates".

---

## M-8 · M3 — drift detection compares file CONTENT, not filenames

**Ruled as:** **Option 1** — drift detection compares file **CONTENT**, not filenames. **Every Inflozo-generated file carries a fingerprint**; drift is *"did this content change from what Inflozo wrote"*, so a **layer rename produces no signal** because nothing on the live site changed. Keeps both promises intact — layer-named files stay navigable, and FR-J16's zero-false-positives holds. **Frozen filenames rejected** because they decay. **FREE COROLLARY:** the drift check must compare the live site against **WHAT INFLOZO LAST DEPLOYED**, never against what it is about to deploy — comparing against the pending build makes every rename read as drift regardless of naming scheme.
**Source:** #277 · **Blast:** MEDIUM.
**Home:** FR-J16.
**Propagates to:** **FR-J16** — it already says *"a **content manifest** — relative path → SHA-256 of file contents"* and *"against the manifest of what Inflozo **last deployed** there"*. ⚠ **Both halves of M3 are already present.** **The gap is the per-file fingerprint** — a manifest keyed on *path* still moves when a path changes. **Add the fingerprint** so identity survives a rename, and restate the rule as content-identity rather than path-identity. · **FR-J16** — *"a compiled filename must never change when the user changed nothing"* — with fingerprints this constraint **relaxes**, but §7.4's determinism claim (*"the same project doc compiles to the same filenames on every machine and every run"*) is still needed for **NFR-6(c1)'s snapshots**. **Keep determinism; state that it now serves snapshots rather than drift.** · **§7.4's layer-names-become-filenames rule** — cross-reference. · **L22 (H12)** — a **custom-template** rename must still be **prevented**, not merely fingerprint-tolerated. **State the exception.** · **FR-J13** — the snapshot's marker is a `package.json` marker, a different mechanism; verify the two are not conflated. · **FR-J10** — the frozen theme name is the comparison *target*; unaffected. Tick. · **FR-C5** — the daily health check re-reads `routes.yaml` (not the theme); tick. · **§7.5 `deploys`** — the manifest and fingerprints need storage; add to the "tables the FRs are known to require" list (the per-deploy variant manifest is already there — **the file fingerprint manifest is a second thing**). · **§7.6 risk table** — no row needed; **tick.** · **Appendix I glossary — Drift detection** — add the fingerprint. · **§8 E7** exit.
**Counts:** none.
**Conflicts:** none to delete; this is a strengthening. But do not add a *filename* comparison anywhere.

---

## M-9 · D2 — pin a normative `image_sizes` table

**Ruled as:** Pin a **normative `image_sizes` table** in FR-J2 (proposed **`xs 150` / `s 400` / `m 750` / `l 1200` / `xl 2000`**) **+ a compile assertion that every `size=` used exists as a key**. **NFR-6(c2) recordings must be made against an Inflozo-emitted `package.json`.** *(A v3.0 critical: no `config.image_sizes`, but every image uses `img_url size=` — **all sizing is a silent no-op**.)*
**Source:** #234 · **Blast:** MEDIUM.
**Home:** FR-J2.
**Propagates to:** **FR-J2** — add the table normatively. · **FR-J3** — ⚠ **CONFLICT:** FR-J3 emits **theme-bundled** assets as a *"fixed rendition set — **400 / 800 / 1600** px wide plus the original"*. That is **three sizes with different values** from the five `image_sizes` keys. **These are two different mechanisms** (Ghost-hosted content images resized by `{{img_url size=}}` vs theme-bundled assets pre-generated at compile) — but a reader will conflate them and a `srcset` built from the wrong set is a live defect. **State the distinction explicitly, and decide whether the two sets should be aligned.** · **FR-J5** — `{{img_url}}` with `srcset`; the `srcset` is built from **`image_sizes` keys** for Ghost content and from the **rendition set** for bundled assets. ⚠ And `{{img_url}}` **does not emit `srcset`** (L23 #9) — the theme builds it. State all three facts together. · **NFR-2 assertion 1** — *"every image carries a **correct `srcset` and `sizes`** matching the rendition set it was generated with"*. Add: and every `size=` resolves to a declared key. · **FR-H5** — the shim emits *"Ghost-shaped sized URLs"*; the shim must use the same key set, or canvas and theme disagree. **This is a WYSIWYG defect class.** · **NFR-6(c2)** — ⚠ *"recordings must be made against an Inflozo-emitted `package.json`"* — because Ghost's resize behaviour depends on the theme's own `image_sizes`. **State it as a requirement on the recording method**, not a note. · **§7.4 tree comment** — `image_sizes` is listed; add "normative table in FR-J2". · **Appendix B** — `@config` carries `image_sizes` per request (noted in the verified-correct list). Add it to the catalog. · **FR-K2** — client-side optimization caps the long edge at **2400 px**, and the largest `image_sizes` key is **2000**; the bundled rendition set tops out at **1600 + original**. ⚠ **Three ceilings. Reconcile or state why they differ.** · **FR-H8** — media guards must enclose the `srcset`. · **`sections-inventory.md`** — any category declaring an image-size control (A14 galleries, A17/A18 cards, A24 headers) must use only declared keys. **Add to the per-variant spec's required fields (L1).** · **Appendix C — Image Picker** row. · **§8 E7** exit; **§8 E4** (the shim).
**Counts:** **5 `image_sizes` keys** (150/400/750/1200/2000); **3 bundled renditions + original** (400/800/1600); **2400 px upload cap**. **All three must be stated and reconciled.**
**Conflicts:** the silent no-op; any implication that one size set serves both paths.

---

---

# SMALL blast radius (1–2 propagation targets)

Terse by design. Each still gets its propagation list — a tick is a valid outcome, an unlisted location is not.

## S-1 · H1 — an automated emitted-theme code-quality gate, alongside the 34 manual gates
**Ruled as:** Option 3 — **both**. An automated gate on the *emitted theme* (HTML validation, CSS lint, accessibility scan on the **output**, not only the editor) **and** the owner's 34 manual gates.
**Home:** NFR-6(b) / a new gate clause in FR-J6.
**Propagates to:** **FR-J1** — its "Casper/Source quality" claim finally acquires an enforcement mechanism; reword from aspiration to gated. · **NFR-5** — a11y scope must include compiler-synthesized files (see S-9); this gate is where that runs. · **NFR-6(b)** — compile CI currently means "gscan only"; extend. · **§8 E7** exit and **§8 E15**. · **L2's per-category gate** — items 1–6 of the gate definition are this gate. · **§7.6** — the "gscan certifies almost nothing" risk is retired by this; update or remove the row.
**Counts:** none. **Conflicts:** any text implying gscan alone establishes quality.

## S-2 · H2 — the compiler emits correctly-indented code; no Prettier
**Ruled as:** Option 2 — the compiler emits properly formatted output directly. Prettier is **not used**: it throws on Ghost partials (`{{> "post-card"}}`) and silently deletes `<!DOCTYPE html>`.
**Home:** FR-J1.
**Propagates to:** **FR-J1** — delete "everything is Prettier-formatted"; state the compiler's own formatting contract (indentation unit, attribute wrapping, blank-line rules). · **§7.3** — the serializer step is where indentation is produced; `outerHTML` does not indent, so this is a real implementation requirement, not a claim. · **NFR-6(c1)** — committed `.hbs` snapshots only diff cleanly if formatting is deterministic; cross-reference. · **spike-compiler** — its output is *visibly unformatted* (6/8/4-space ragged); the spike must be updated or explicitly labelled as not yet meeting FR-J1. · **§8 E7** exit.
**Counts:** none. **Conflicts:** the Prettier sentence, wherever it appears.

## S-3 · H6 — the canvas loads the same font subset the theme ships
**Ruled as:** Option 1 — canvas fonts are the **same subsets** the emitted theme will ship, not full faces.
**Home:** §7.3 (canvas asset context) + Appendix D.b.
**Propagates to:** **Appendix D.b** — subsetting rules now bind the canvas too, not only the theme. · **FR-J3** — font emission. · **NFR-6(c3)** — removes a permanent false-positive class from the nightly comparison; state that. · **§1.2 / L15** — one fewer carve-out needed. · **FR-E1** — the 30 font pairings must each have a canvas-side subset. · ⚠ **Variable-font axis pinning** (e.g. `opsz` on Fraunces) must match on both sides — the research flagged the *default* pack as affected.
**Counts:** none. **Conflicts:** any implication the canvas uses webfont CDNs or full faces.

## S-4 · H7 — the responsive collapse ladder is delegated to design, not prose
**Ruled as:** Responsive behaviour is **designed**, not specified in prose — via Design Prompt 3's 15 structural archetypes, each with a written collapse rule, plus a bespoke-mobile exception list and 7 stress frames.
**Home:** FR-G4 / FR-D8.
**Propagates to:** **FR-G4** — replace any prose collapse rule with a pointer to the archetype system as the normative source. · **`sections-inventory.md`** — each design's spec carries its archetype and its collapse rule (per L1's merged spec). · **NFR-6(a)** — the render matrix's three device widths must be the archetype breakpoints (1440 / 834 / 390). · **FR-D8** — device preview must resize in **both** axes (see L7). · **Companion manifest** — add both design prompts as referenced (non-normative) inputs. · **§8 E9–E11** entry criteria — a category cannot start until its archetypes are designed.
**Counts:** none. **Conflicts:** none; this fills a void.

## S-5 · H8 — A1 #16 "Tab Deck" is redefined as visual-only
**Ruled as:** Option 1 — visual-only. It must **not** require the header and the section beneath it to know about each other, which the one-partial-per-section model forbids.
**Home:** `sections-inventory.md` A1 #16.
**Propagates to:** **§7.4's partial rules** — cross-reference as the reason. · **A3 #8 and A12 #15** — the same cross-section coupling was flagged there; apply the identical treatment. · **L1's spec pass** for A1.
**Counts:** none — the design survives. **Conflicts:** any wording implying structural attachment.

## S-6 · H10 — FR-G5's uniqueness proxy becomes structural descriptors
**Ruled as:** Option 1 — structural descriptors per design, replacing a CI assertion over free English prose (which tests nothing). Falls out of L1's spec pass anyway.
**Home:** FR-G5.
**Propagates to:** **`sections-inventory.md`** — the descriptor is a required field of every design's spec (L1). · **§8 E9–E11** exit criteria, which currently cite the prose proxy. · **Appendix A**. · **L4** — descriptors must not collide once controls are per-design.
**Counts:** none. **Conflicts:** the "mechanical proxy" language.

## S-7 · H19 — G1 and G2 are assigned and gated
**Ruled as:** Option 1 — the two headline goals get an owner and enter the Definition of Done.
**Home:** §1.3 + §4.
**Propagates to:** **§4 DoD** — add both. · **§8** — assign to an epic (E15 owns gates; G1's onboarding target implicates E1/E3, so state which epic *measures* it). · **§1.2** — G1/G2 are the only gate on the "fun" half of the thesis. · **H16** — deferring two credential steps directly serves G1's 10-minute target; cross-reference. · **§7.6** — if either goal is unmeasurable pre-launch, say so rather than implying it is gated.
**Counts:** none. **Conflicts:** any text treating G1/G2 as aspirations.

## S-8 · H20 — personas thickened
**Ruled as:** Thicken §3's personas before the UX phase, which the PRD delegates four journeys and five flows to.
**Home:** §3.
**Propagates to:** **The header note's UX delegation** — the journeys are authored from these personas; thin personas mean the UX phase invents them. · **FR-L3 / FR-J12** — the Free-plan and downgrade journeys need a persona who plausibly hits them. · **"The multi-site operator"** — currently defined entirely by a plan limit; give it a real motivation or merge it. · **Appendix F.6** — churn assumptions should be consistent with the personas.
**Counts:** none. **Conflicts:** none.

## S-9 · M4 — synthesized templates appear on the canvas, marked auto-generated
**Ruled as:** Option 1 — the six templates synthesized from the Synthesis Defaults are **visible on the canvas**, labelled auto-generated, rather than shipping unseen.
**Home:** FR-D6.
**Propagates to:** **`sections-inventory.md` Synthesis Defaults** — each default stack must be renderable, not merely emittable. · **FR-J8** — deploy no longer ships anything the user could not have seen. · **§1.2 / L15** — this *removes* a carve-out from the promise; the canvas-is-the-page claim gets stronger. · **FR-D14 / template switcher** — the six must be reachable in the UI. · **NFR-5** — a11y scan scope must include them (this is the same gap S-1 covers for the emitted theme). · **NFR-6(a)** — matrix must render them. · **§8 E5** (canvas) and **E7** (synthesis).
**Counts:** none. **Conflicts:** any text implying synthesis is deploy-time-only.

## S-10 · M5 — the canvas gains a page-2 preview state
**Ruled as:** Option 1 — a page-2 state, so A34's ten pagination designs are designable in the editor at all.
**Home:** FR-D8 / FR-H2.
**Propagates to:** **`sections-inventory.md` A34** — all ten designs' visible state lives on page 2+. · **FR-H2** — the main-feed designation determines what paginates. · **FR-H5** — the `{{pagination}}` shim must produce a page-2 context. · **L18's fixture set** — the fixture needs enough posts to have a page 2 (interacts with `posts_per_page`). · **NFR-6(a)** — matrix should render A34 on page 2. · **NFR-6(c3)** — the real-Ghost comparison must hit a page-2 URL. · **§8 E5**.
**Counts:** none. **Conflicts:** any implication the canvas is page-1-only.

## S-11 · M7 — a "you haven't checked X" nudge for member states
**Ruled as:** Option 2 — keep the member-state toggle, add a nudge naming unchecked combinations. The real failure is **forgetting**, not switching.
**Home:** FR-D16.
**Propagates to:** **FR-D5** — the show-to control creates the combinations. · **L2's per-category gate** — the nudge is what makes the owner's manual member-state check reliable. · **FR-J13 / pre-deploy** — an unchecked member state is worth surfacing before deploy. · **§8 E5**.
**Counts:** none. **Conflicts:** none.

## S-12 · M8 — the first suggestions-board admin is seeded from the owner account
**Ruled as:** Option 1 — seeded at setup.
**Home:** §3 (roles) / FR-M4.
**Propagates to:** **§7.5** — the roles/claims table. · **§8 E13** — which owns the board. · **§4** — the Test→Live cutover migrates suggestions and votes; the admin claim must survive it. · **FR-A** — account model, if the claim lives on the user row.
**Counts:** none. **Conflicts:** the prior "answered by adding the word admin" non-fix.

## S-13 · M9 — a compatibility redeploy carries ONLY the compatibility fix
**Ruled as:** Option 1 — otherwise FR-J14's consent promise is simply false.
**Home:** FR-C5.
**Propagates to:** **FR-J14** — its emphatic no-silent-change rule; the exemption must be narrowed, not merely noted. · **FR-J12** — library-update redeploy. · **§8 E7**. · **§7.5** — the deploy record needs to distinguish a compatibility redeploy from a library-update redeploy. · **Appendix I glossary**.
**Counts:** none. **Conflicts:** the blanket exemption wording.

## S-14 · M10 — the dispute transition gets a defined reverse path
**Ruled as:** Define it explicitly, with manual support action as the mechanism.
**Home:** FR-L2.
**Propagates to:** **FR-L3** — entitlement consequences of returning to paid. · **Appendix F.2** — billing policy. · **§8 E12**. · **FR-P** — does the user get an email on restoration? · **§7.5** — the entitlement state machine needs the reverse edge.
**Counts:** none — but **Appendix F.6's churn** should note disputes are not permanent. **Conflicts:** "immediately and permanently" framing.

## S-15 · M11 — "the most beautiful UI/UX in the Ghost ecosystem" is marked as ambition
**Ruled as:** Option 1 — keep it, explicitly marked as stated ambition, not masquerading as a requirement.
**Home:** §1.2.
**Propagates to:** **§1.3** — it must not appear as a measurable goal. · **§4 DoD** — must not be gated on it. · **M13's markers** — this is the canonical use of a non-goal/ambition marker. · **§2 principles** — where it legitimately belongs as a design value.
**Counts:** none. **Conflicts:** any place it reads as testable.

## S-16 · M12 — a permanent Ghost 5.x instance on the droplet
**Ruled as:** Option 1 — keep a permanent 5.x instance, nearly free now that testing is self-hosted, so NFR-7's 5.x claim is actually tested.
**Home:** §4 (test targets).
**Propagates to:** **NFR-7** — the 5.x claim becomes tested rather than asserted. · **FR-C8** — version floor. · **B5's `engines.ghost: ">=5.0.0"`** — this is what verifies it. · **L23's gscan findings** — several rules differ between the v5 and v6 specs; both must be run. · **Appendix F.3** — a second droplet instance is a cost line (small, but L9 is rebuilding this section anyway). · **§8 E15** and **L8's nightly rotation** — does the rotation cover both versions? State it. · **AMP correction** — removed in Ghost **6.0**, so 5.x behaviour differs.
**Counts:** none. **Conflicts:** "T3 is the first candidate to drop under time pressure."

## S-17 · M13 — BMAD assumption / open-question / non-goal markers
**Ruled as:** Add them, especially where decisions rest on research.
**Home:** whole document convention.
**Propagates to:** **Every decision in this map that rests on a research companion** — mark the assumption and cite the companion. · **§7.6's fourteen verify-at-build items** — each is an assumption marker by definition. · **Appendix G** — deferred items are non-goals. · **S-15** — the ambition marker. · **GPRO gate** — the Ghost(Pro) Preview-only path must be marked a **known untested path**. · **The residual NQL-version gap** from verification. · **§7.5** — already marked illustrative; make it conventional.
**Counts:** none. **Conflicts:** none.

## S-18 · M14 — treatments keep a selection surface when their host is removed
**Ruled as:** Option 1 — define a settings-level fallback so card and pagination treatments remain selectable.
**Home:** FR-Q1 (Theme Settings).
**Propagates to:** **`sections-inventory.md` A33 / A34** — their selection surface is no longer solely the host section. · **L5's card module** — which supersedes A33's selection question entirely; **check for conflict and prefer the module.** · **FR-H2** — a zero-feed template still needs a pagination treatment stored. · **FR-J3** — `cards.css` / pagination emission must not depend on a host being present. · **§8 E7 / E11**.
**Counts:** none. **Conflicts:** any text making the host section the only selection point.

## S-19 · DESIGN-PROMPTS — the two design prompts become referenced inputs
**Ruled as:** `design/claude-design-prompt-2.md` (responsive system + 25 missing surfaces + the post-body trio) and `design/claude-design-prompt-3-library.md` (the 485, one category per session) are the instruments that produce the design and spec inputs the PRD consumes.
**Home:** the companion manifest in the preamble.
**Propagates to:** **§8 E1** — currently points Dev at a design directory documented elsewhere as stale; point it at the corrected artifacts and state the precedence. · **L1 / L2** — the per-category design session *is* the spec session; the prompt is the method of record. · **S-4** — archetypes. · **L5 / L6** — the post-body trio. · **M1's precedence order** — design artifacts are **non-normative**; the PRD and its normative companions win. **State this explicitly**, because reconcile-mockups already documents ~31 places where the mockups and the PRD disagreed.
**Counts:** none. **Conflicts:** the stale-design-directory pointer.

---

# Verification checklist (run AFTER the encode, independently of it)

Do not trust the encode's own claims. Recompute and re-grep.

## Counts to re-derive from scratch
1. **FR total.** Currently **119**. Count `**FR-[A-Q]n**` definitions. Verify: contiguous `1..n` in **every** letter block, zero duplicates, and every referenced id defined. New FRs are **appended within their block** — never renumber.
2. **Single-epic ownership.** Every FR appears in exactly one `*Owns …*` clause in §8, expanding ranges (`FR-A2–A6`). Deliberate multi-epic splits (FR-P1 per-email, FR-Q6 format-vs-surface, FR-G1/G4/G5/G6 per-wave) must be **restated** — the per-wave split is invalidated by L2's gated pipeline.
3. **Category total.** 34 categories. Verify each category's enumerated designs equal its declared count.
4. **Variant total.** 485 **moves** — H9/L16 is count-moving. Re-derive: group subtotals (currently 47 + 199 + 109 + 102 + 28) must sum to the new total, and Appendix A must match `sections-inventory.md` row for row.
5. **Placeable vs treatments.** Currently 457 + 28. Re-derive after L16, and after L5 changes A33's nature.
6. **`[Free]` tags.** Currently exactly **70**. Count tag-by-tag; verify against Appendix F's plan matrix.
7. **Render matrix.** Currently 485 × 3 × 2 × 3 = 8,730. Re-derive with the new variant count, and confirm the multipliers still hold after L8 changed the cadence and S-4 fixed the widths.
8. **Wave counts** 156 / 199 / 130 — **these should no longer exist** as waves (L2). Verify they are gone, not merely edited.
9. **String catalog** — 131 keys; re-count after new surfaces add strings (L5, L6, S-10).
10. **Appendix F** — every figure recomputed per L9. Carry the **verified** values: F.6 tenure **19.75** (the report's 19.0 is WRONG), F.3 max **$130**, F.4 midpoint **$13.81**, F.3 floor **$107**, F.7 overage **$21/mo**, CI **$35–80/mo**, cash break-even **≈15**.
11. **JS module count** — 31 (30 + core); 10 behaviours needing none. Verify FR-J4's list matches.
12. **Browser baseline** — Chrome/Edge 121, Firefox 122, Safari/iOS 17.2.

## Cross-reference classes
- Every `FR-x` referenced exists · every `§x` resolves · every `Appendix x` exists · every companion named in the preamble exists **and carries `status` frontmatter** · every `§7.6` item has a filled owning-epic column (L14) · every research/verification companion cited is listed in the manifest.

## Stale tokens to grep (must return zero hits)
`487` · `104` · `132` · `8766` · `459` · `members/` · `data-portal="upgrade"` · `Manual deploy` (for Starter) · `Prettier` · `Swiper` · `jQuery` · `Layout picker` (→ Design) · `PUT /settings/routes` · `50 KB`/`100 KB` JS threshold (superseded by **40 KB**, R1) · `10 modules` · `19.0` months · `$127` · `120 sections` · `480+` · `3 starters` · `engines.ghost-api` · `>=6.0.0` in `engines.ghost` · `Site wide` framed as invalid · `Settings` removed from the `{{#get}}`/Content-API resource list · `NQL has no relative-date syntax` · `no per-collection page size` · `no automated routes.yaml upload`.

## Newly stale, created by this encode
Anything asserting: gscan alone establishes quality (S-1) · the canvas is page-1-only (S-10) · full-face canvas fonts (S-3) · T3 droppable (S-16) · `card_assets: true` wholesale (L5) · chrome entirely outside the iframe (L7) · behaviours running on the canvas unconditionally (L20).

---

# Authored, not edited — written from scratch

## New FRs (append within block; do not renumber)
- **FR-Q block (+3):** the Koenig **card design module** (browse, per-card panel, reset-to-default) · **Theme Settings** treatment-fallback surface (S-18) · **Translations** ICU validation at entry (M-2/V1).
- **FR-D block (+3):** **design navigation** (`[` / `]`, arrows, thumbnail strip, "Design 7 of 18") · the **Preview toggle** with per-module edit-safe declarations · the **page-2 canvas state** (S-10).
- **FR-J block (+1):** the **emitted-theme code-quality gate** (S-1).
- **FR-G or new block:** the **behaviour-module contract** if it is a requirement rather than a §7 mechanic — decide placement before assigning ids.
- Re-verify contiguity and epic ownership for every id added.

## New sections and normative tables
- **§7.x — the behaviour-module contract:** mount attribute, idempotent `init(root)`, teardown, event delegation, canvas-vs-live execution, reduced-motion, and a one-line no-JS degradation per module.
- **The 31-module table** with per-module vanilla/library decision, no-JS behaviour and edit-safety flag.
- **The browser-baseline policy** — Baseline Widely Available, pinned, with what it unlocks for the no-build-step CSS and the three properties needing hand-written prefixes.
- **The `image_sizes` table** (FR-J2) plus reconciliation of the three ceilings (5 keys / 3 bundled renditions / 2400 px upload cap).
- **The custom-template naming and collision scheme** (L22) — a frozen public API.
- **The companion precedence order** (L24) in the preamble, stating that design artifacts are non-normative.
- **The archetype collapse reference** (S-4) — or a pointer if it lives in the design output.

## Rebuilt wholesale
- **Appendix F** — split into **build cost** and **run cost**, two break-evens (cash ≈15, payback valuing the build), CI costed, authorship acknowledged, and the structure changed rather than the numbers patched.
- **§4 release strategy** and **§8 epics** — waves become a gated sequential pipeline; the shell block precedes Heroes; E0 verification spike; the FR-D4 mark-emission spike ahead of the shell.
- **§3 personas** — thickened (S-8).
- **`sections-inventory.md`** — restructured for per-design controls, per-design specs, archetype and structural descriptor fields.

## New companions to add to the manifest
`research-ghost-koenig-cards.md` · `research-canvas-iframe-geometry.md` · `research-contested-variants.md` · `research-section-js-libraries.md` · `verify-mechanical-ghost-claims.md` · `verify-mechanical-theme-and-math.md` · and both design prompts as **non-normative** referenced inputs.

— End of propagation map —
