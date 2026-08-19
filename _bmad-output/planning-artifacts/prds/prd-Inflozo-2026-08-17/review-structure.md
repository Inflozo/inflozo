---
title: PRD Structural Review — Inflozo
scope: Organization, sizing, redundancy, cross-references only. No product decisions reviewed.
reviewed: prd.md (1063 lines), addendum.md (33 lines)
date: 2026-08-17
---

# Structural / Editorial Review

**Verdict:** The skeleton is sound — domain lettering, principles-first ordering, and normative appendices all work, and every FR-level cross-reference resolves (113 defined, 0 dangling). Today's accretion shows in exactly the predicted places: four stale `§6.x` pointers to subsections that no longer exist, one appendix line that now flatly contradicts FR-Q, lifecycle FRs appended to the end of FR-J, FR-Q stranded after the email section, and an Appendix A that is 55% of the file. One structural extraction plus a single trivial editing pass fixes all of it. No renumbering is needed anywhere — every move below keeps stable FR IDs.

Findings are ordered by payoff. Effort: **trivial** (< 5 min), **small** (< 30 min), **structural** (file-level change).

---

## High payoff

### 1. Extract Appendix A into a companion file — structural
Appendix A spans lines 379–966: **588 of 1063 lines (55%)**. Every reader except the library-wave epic writer must scroll past 487 variant one-liners to reach Appendices B–H, which are the ones the architect (B, C), UX (C, D, H), and QA (B, F) actually live in.
- **Move** the five Groups (A1–A34 variant lists) to `appendix-a-sections.md` in this folder, declared normative from the PRD.
- **Keep in prd.md:** the totals line, the universal-controls paragraph, the shared content-model conventions, and a compact summary table — `id · category · count · free variants · template usage` (34 rows) — so FR-G, Appendix F, and the epic sizing stay verifiable without the companion open.
- **Update** pointers: FR-G1, FR-H2 ("Appendix A §34"), FR-J3 ("§33"), FR-N2, E9–E11.
- Fallback if a single file is a hard constraint: keep Appendix A in place but add the 34-row summary table at its top and move Appendices B–H **above** A. B–H are reference material consumed constantly; A is consumed once per library epic.
**Payoff:** the PRD drops to ~500 lines and becomes navigable for its three non-library readers.

### 2. Fix four stale `§6.6` / `§6.7` references — trivial
§6 is a flat NFR list with no subsections; these pointers survive from a draft where §6 had numbered testing subsections. All four are broken pointers into the quality-automation spec — the exact thing QA needs to find fast:
- Line 64 (P7): "see §6.7" → **§4, "Live-infrastructure testing" bullet** (there is no NFR about live testing; §4 owns it).
- Line 87 (§4 DoD): "render matrix (§6.6)" → **NFR-6(a)**.
- Line 171 (FR-G6): "see §6.6" → **NFR-6(a)/(b)**.
- Line 179 (FR-H5): "golden tests … (§6.6)" → **NFR-6(c)**.

### 3. Appendix B contradicts FR-Q — trivial, but it's a real error
Line 982: *"`@custom` in generated themes: `color_scheme` (Auto/Light/Dark) **only** — … Inflozo deliberately uses one (P3)."* This was true before today's FR-Q addition; FR-Q2/Q3 now define a full custom-settings builder (up to 20 settings, five types, `{{@custom.*}}` bindings). Appendix B is titled **normative** and is the architect's binding-surface catalog — as written it forbids what FR-Q mandates.
- **Rewrite** the line: `@custom` = `color_scheme` **plus user-defined settings per FR-Q2/Q3 (Ghost's five types, 20-setting cap, 1 reserved)**.
- Same drift, milder: line 300 (§7.4 tree) comments `custom.color_scheme?` only — append `+ user custom settings (FR-Q2)`.

### 4. Move FR-Q to sit after FR-I; keep the letter — trivial
FR-Q (Theme Settings) is currently last, after FR-P (email), because it was added today. But: FR-Q1 calls the surface a *"sibling to the Routes Manager"* (FR-I), FR-J2 **forward-references** FR-Q1/Q2 (compiler consumes Theme Settings), and it is an editor-adjacent surface the UX designer will look for next to the other editor surfaces. Cut-paste the whole `### FR-Q` block between FR-I and FR-J. Keep the letter Q — renumbering would break P3, FR-B?, FR-J2, E7 references for zero gain. Add one line to the §5 intro: *"Domains are ordered by workflow, not alphabet."* (FR-P staying last is fine — it's a cross-cutting inventory and FR-C5/FR-L2 point into it correctly.)

### 5. Subgroup FR-J; re-seat the appended J12–J15 — trivial
J12 (ZIP export), J13 (pre-activation snapshot), J14 (library updates), J15 (credits) were appended to an eleven-item compile→deploy pipeline list. J13 is a **deploy-time invariant** backing Differentiator 5 and P8 — buried at position 13 after export. Add three bold subheads inside FR-J and reorder bullets under them, IDs unchanged:
- **Compile & artifacts:** J1–J7
- **Deploy, activate & rollback:** J8, J13, J9, J10, J11, J12
- **Lifecycle & branding:** J14, J15
**Payoff:** the architect gets the safe-install invariants (gscan gate → snapshot → activate → rollback) as one contiguous read; the epic writer's E7 mapping falls out of the subheads.

### 6. Reorder FR-C bullets into flow; keep IDs — trivial
Current order interleaves onboarding and lifecycle: C7 (redesign proposals, an onboarding step that FR-C7 itself says runs *"after connect + auto-branding"*) sits between C6 (disconnect) and C8 (key rotation), and C8 (rotation) is far from C3 (key security) which it re-invokes. Reorder presentation to: **C1, C2, C3, C8 · C4, C7 · C5, C6** (connect/keys → onboarding value → lifecycle). Do **not** renumber — FR-B2, FR-P1, FR-J8, and E3 reference C2/C5/C7 by number.

---

## Medium payoff

### 7. One number for the library: 487 exactly — trivial
The per-category counts in Appendix A sum to **exactly 487** (verified: 47 + 199 + 109 + 104 + 28), and free variants to exactly 68 (2 × 34). Yet the document says "480+" (G5, line 33), "~487" (FR-G1, §1.5, Appendix A totals), and "487" (§7.6, E14, Appendix F, Appendix H). A tilde on a normative launch-deliverable count is an oxymoron and gives QA a fuzzy acceptance target. Replace all with **487** ("34 categories · 487 variants · 68 Free").

### 8. "Appendices A–G are normative" → A–H — trivial
Line 11 predates Appendix H (Voice & Microcopy Canon), whose own title says "(normative)". Either the intro or the appendix title is wrong; per the canonical-strings intent, fix the intro to **A–H**.

### 9. Link addendum.md from the PRD — trivial
`addendum.md` carries the persistence mechanism (A1, supporting FR-D9/D10) and the edit-lock protocol (A2, supporting FR-D18) — exactly what the architect needs — but **prd.md never mentions it**. Add a pointer at FR-D10 and FR-D18 ("mechanism sketch: addendum.md §A1/§A2") or one line in the §7 intro. While there: E1's "companion design doc" is an unnamed external reference — name the file or drop the phrase.

### 10. Single home for the free-tier gating rule: FR-L3 — trivial
The open-canvas/gated-exits rule appears in four places. Keep: **FR-L3** (canonical, incl. downgrade rules), FR-D12's half-sentence pointer (fine as is), Appendix F's table row (fine — summary). Trim: **FR-J12**, which re-states the itemized-sheet mechanics ("export blocks with the itemized 'Pro sections in this design' sheet (upgrade or Shuffle-swap each)") — reduce to *"blocks per FR-L3; export gating mirrors deploy gating exactly."* Two wordings of one enforcement sheet will drift.

### 11. Single home for the width rule: FR-E1 — trivial
"Sections span the site width; width is not a per-section control" is stated three times with three wordings: FR-E1 (home), FR-F2, Appendix A universal-controls paragraph. Keep FR-E1 full; FR-F2 keeps only *"width is not a per-section control (FR-E1)"*; Appendix A parenthetical shrinks to *"(content width: FR-E1)"*.

### 12. Fix E7's misplaced reference range — trivial
E7 attaches "(FR-J12–J15)" to "library-update redeploy flow", but J12 = export and J15 = credits; only J14 is the redeploy flow. Move each FR ref next to its own list item or drop the parenthetical. (E7 is also by far the heaviest epic — compiler + deploy + routes + FR-Q landed there today — but re-scoping epics is a product call, out of this review's lane; flagging only.)

### 13. Split FR-Q2 into sub-bullets — small
FR-Q2 is one ten-line bullet holding five independently testable rules: builder fields, compile target + Ghost Admin editability, 20-cap + meter, key generation/validation rules, and **key immutability** (a load-bearing invariant currently buried mid-paragraph as a bolded aside). Break into 4–5 sub-bullets so QA can cite them and the architect can't miss immutability.

---

## Low payoff / optional

### 14. Trim the repeated "browser-safe" rationale — trivial, optional
"The Content API key is browser-safe/cacheable by design" is argued in P5, FR-C3, FR-H4, and §7.2. Home: **FR-C3** (it's a security stance). Elsewhere reduce to "(FR-C3)". Harmless today, but four wordings of one security claim is drift surface.

### 15. Persistence duplication FR-D10 ↔ NFR-1 — optional, lean toward keeping
"Saving never blocks the UI" appears in both. Acceptable as is: FR-D10 owns behavior (+ addendum A1 owns mechanism), NFR-1 owns the measurable budget. If trimming, cut the clause from FR-D10, never from NFR-1.

### 16. Notation consistency in Appendix A references — trivial, optional
References use "Appendix A §33/§34" while the appendix numbers categories "A33/A34" — and bare "A1" would collide with FR-A1. Standardize on "Appendix A · A34" form. Cosmetic.

### 17. Optional subheads for FR-D — small, only if doing a broader pass
18 bullets is the longest FR domain, but each bullet is crisp and IDs interleave across themes, so grouping costs more than it pays. Skip unless the FR-J subheads (item 5) prove popular.

---

## What is deliberately fine (do not churn)

- **No dangling FR references anywhere** — all 113 defined IDs resolve; today's renumbering left no orphans at the FR level (the damage is confined to the `§6.x` refs and Appendix B, items 2–3).
- **FR-B7** (notifications) in the Projects/Dashboard domain: spans dashboard + editor, but its home is fine and E13 picks it up.
- **FR-P last**: correct as a cross-cutting email inventory; FR-C5 and FR-L2 point into it accurately.
- **Starter/Preview-only** appears in five places but all are pointers to the single home FR-C2 — this is the pattern items 10–11 should converge to.
- **Appendix G ↔ FR-E3** (no account-level pack library) are consistent, not redundant: one is the FR-level context, one is the deferral record.
- **addendum.md's internal structure** is right — depth kept out of the PRD body; it only needs the inbound link (item 9).

---

## Tally

- **17 findings**: 6 high, 7 medium, 4 low/optional.
- **Effort:** 13 trivial · 3 small · 1 structural (Appendix A extraction).
- **Renumbering required:** none — every move preserves FR IDs.
- **Hard errors (would mislead a downstream reader today):** 4 stale `§6.x` refs, Appendix B `@custom` line, §7.4 tree comment, E7 ref range.
