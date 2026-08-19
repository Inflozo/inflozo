---
title: Cross-Document Consistency Review — Inflozo PRD workspace
target: prd.md v2.1 (+ sections-inventory.md, addendum.md, .memlog.md)
date: 2026-08-17
reviewer: consistency pass (post review-hardening)
verdict: Coherent overall — no critical breaks; 1 high, 4 medium, 6 low findings
---

# Consistency Review

Scope: prd.md (v2.1, SoT) ↔ sections-inventory.md ↔ addendum.md ↔ .memlog.md.
Method: full read of all four documents; mechanical extraction of every FR-*/NFR-*/§ reference in all four files checked against definitions (all resolve — zero dangling IDs); arithmetic re-verification of every count; memlog decisions (106 entries) walked against current PRD text with supersession chains honored.

---

## Findings

### F1 · HIGH — "Deployable to all live Ghost deploy targets" includes a target that blocks deploys by design

- **Location A:** `prd.md` §4 Definition of Done — "10 starter templates deployable end-to-end **to all live Ghost deploy targets (§4)**"; same phrase in E7 exit ("pilot project deployed + rolled back on all live Ghost deploy targets (§4)") and E11 exit ("every starter deploys 0/0 gscan to all live Ghost deploy targets (§4)").
- **Location B:** `prd.md` §4 target list — "**T4** — a Ghost(Pro) **Starter** site (verifies the Preview-only path)" and FR-C2 — "**Ghost(Pro) Starter does not permit custom themes** … deploy attempts are blocked".
- **Problem:** §4 lists T1–T4 as "live Ghost deploy targets". T4 exists precisely because deploying to it is impossible (its job is verifying the block). As written, the Definition of Done and the E7/E11 exit criteria are unsatisfiable — no theme can ever deploy to T4.
- **Likely resolution:** Define the deployable set as **T1–T3**; state that T4's acceptance criterion is the Preview-only block path (which E3's exit already captures correctly: "Starter-block path verified"). The drift was introduced when T3/T4 joined an older two-target list (memlog: "two real Ghost targets" → later four).

### F2 · MEDIUM — Epic library-wave counts don't match the Appendix A groups they name

- **Location A:** `prd.md` §8 — "**E9 · Library Wave 1 (150)** — Structure & chrome … + Ghost content categories"; "**E10 · Library Wave 2 (200)** — Marketing categories (A4–A16)"; "**E11 · Library Wave 3 (137)** — Template-specific + members + Ghost-native groups".
- **Location B:** `sections-inventory.md` / Appendix A table — actual group sums: Structure & Chrome (A1–A3) = 47 + Ghost Content (A17–A23) = 109 → **156**; Marketing (A4–A16) = **199**; Template-Specific (A24–A31) = 104 + Ghost Native (A32–A34) = 28 → **132**.
- **Problem:** Stated wave sizes 150/200/137 sum to 487 (so the total masks the error), but none matches its named scope (actual: 156/199/132). Counts appear frozen from an earlier inventory draft.
- **Likely resolution:** Renumber the waves **156 / 199 / 132** (inventory is normative and its per-category counts internally verify — see "Verified clean" below).

### F3 · MEDIUM — Inventory frontmatter still pins "prd.md v2.0"

- **Location A:** `sections-inventory.md` frontmatter — "status: normative companion to **prd.md v2.0**".
- **Location B:** `prd.md` frontmatter — "version: **2.1**"; `.memlog.md` final entry — "PRD version bumped 2.0 -> 2.1".
- **Problem:** The normative companion declares allegiance to a version that no longer exists. File mtimes confirm the drift: inventory last touched 21:14, PRD hardened through 22:36 — the review-hardening pass never revisited the companion's frontmatter.
- **Likely resolution:** Update to "normative companion to prd.md v2.1" (or drop the version pin and say "companion to prd.md, same folder" so it can't drift again).

### F4 · MEDIUM — Quiet & Ledger starters still composed of Pro variants despite the logged "rebuilt Free-only" decision

- **Location A:** `.memlog.md` — "(decision) reviewer-gate decisions: … **2 starters (Quiet, Ledger) rebuilt Free-only**"; `prd.md` FR-O4 — "composed **exclusively of [Free] variants** end-to-end".
- **Location B:** `prd.md` Appendix E — **Quiet**: "Big Type Manifesto" (A4 #8, Pro), "Minimal Index" (A18 #4, Pro), "Minimal end rules" (A26 #8, Pro); **Ledger**: "Feature Post hero" (A4 #5, Pro), "Meta-Rich grid" (A17 #16, Pro), "Stats Split Narrative" (A10 #3, Pro), "Tier Cards Inline" (A32 #4, Pro). Only the first two variants per category are [Free] per Appendix A.
- **Problem:** The memlog records the rebuild as done, but Appendix E's compositions were never updated; FR-O4 papers over it with transitional language ("where their Appendix E compositions **currently** use Pro variants, those swap") — draft-state wording inside a status:final v2.1 document. The two normative surfaces disagree about what these starters contain.
- **Likely resolution:** Rewrite the Quiet and Ledger lines in Appendix E using [Free] variants (each category's #1/#2), then delete FR-O4's "currently use… those swap" clause.

### F5 · MEDIUM — Appendix A requires `private.hbs`, which the compiler spec never emits

- **Location A:** `sections-inventory.md` A31 — "(Compile targets: 404/500 → error.hbs variants; **Private Site Gate → private.hbs**; Coming Soon / Maintenance / utility pages → custom page templates.)" — and Appendix A is normative ("every listed variant is a launch deliverable"), including A31 #10 "Private Site Gate".
- **Location B:** `prd.md` FR-I1 standard template set (default/index/post/page/tag/author/error + conditional members) and §7.4 generated theme structure — neither mentions `private.hbs`; FR-J1 requires compiler output "matching the structure in §7.4".
- **Problem:** A normative launch deliverable compiles to a file the theme-structure contract doesn't contain. A project using the Private Site Gate section produces output that violates §7.4 as written.
- **Likely resolution:** Add `private.hbs` to FR-I1/§7.4 as a conditional emit (compiled only when a Private Site Gate section is designed — same pattern as members templates).

### F6 · LOW — Inventory hedges "~487" where the PRD asserts exactly 487

- **Location A:** `sections-inventory.md` — "Totals: 34 categories · **~487 variants**" (also `.memlog.md`: "68 of ~487").
- **Location B:** `prd.md` FR-G1/G5/Appendix A/F — "**487 unique variants**", "every listed variant is a launch deliverable", "on any conflict the inventory wins".
- **Problem:** The document declared to win conflicts is the one that's vague. The per-category counts sum to exactly 487 (verified), so the tilde is stale caution.
- **Likely resolution:** Drop the "~" in the inventory.

### F7 · LOW — "All 15–20 sibling designs" overstates the shuffle range

- **Location A:** `prd.md` §1.4 differentiator 2 — "flip a placed section through **all 15–20 sibling designs**".
- **Location B:** `sections-inventory.md` — actual per-category range is **6–18** (A33 Koenig = 6, A28/A31/A34 = 10, A25/A27/A32 = 12, A29 = 14; max A4/A17 = 18; nothing has 20).
- **Likely resolution:** Soften to "through every sibling design in its category (up to 18)".

### F8 · LOW — Terminology drift: "primary feed" vs the defined term "main feed"

- **Location A:** `sections-inventory.md` A17 — "Data group per FR-H2 (**+ pagination when primary feed**)".
- **Location B:** `prd.md` FR-H2 — the hardened text defines and consistently uses "**main feed**" ("exactly one section is designated the **main feed**"; "The editor marks the main feed visibly"); memlog likewise ("exactly one main feed per collection template").
- **Likely resolution:** Change A17 to "when main feed". Cosmetic, but it's the one term FR-H2's designation lifecycle hangs on.

### F9 · LOW — AD3 rejects "per-change cloud autosave," which FR-D10 uses as a failure fallback

- **Location A:** `addendum.md` AD3 — "Per-change cloud autosave (2 s debounce) — **rejected by owner**: too chatty… Replaced by local-first + periodic sync."
- **Location B:** `prd.md` FR-D10 — "If local storage is unavailable or a write fails (quota, private mode), the editor **falls back to immediate per-change cloud sync** and says so in the indicator."
- **Problem:** Not a true contradiction (the rejection targets the default mechanism; the fallback fires only when local storage is broken), but AD3 reads as a blanket rejection and a future architect could "correctly" delete the FR-D10 fallback citing it.
- **Likely resolution:** One clause in AD3: "…rejected as the default; survives only as FR-D10's no-local-storage fallback."

### F10 · LOW — Ghost(Pro) Publisher price: memlog "$29/mo" vs Appendix F "~$31"

- **Location A:** `.memlog.md` — "custom theme upload needs Publisher **$29/mo**".
- **Location B:** `prd.md` Appendix F — "Ghost(Pro) Publisher **~$31**".
- **Problem:** Likely annual-billing ($29) vs monthly-billing (~$31) rates of the same plan; harmless to the ≈$105–125 fixed-cost total, but the two documents cite different numbers for the same line item without saying why.
- **Likely resolution:** Keep ~$31 (monthly billing matches the "test infra, cancellable" posture) and no memlog edit needed (append-only) — optionally note "monthly billing" in Appendix F.

### F11 · LOW — Memlog hygiene: triage 1/7 entry logged three times

- **Location:** `.memlog.md` — the "(decision) review triage 1/7: canvas isolation = same-origin iframe…" line appears **3×** consecutively.
- **Problem:** Harmless in an append-only log (all three are identical), but inflates the entry count and could confuse tallies ("7 triage items" reads as 9 lines).
- **Likely resolution:** Leave as-is (append-only); note here for the record.

---

## Verified clean (checked, no finding)

- **All cross-references resolve.** Every FR-*/NFR-* reference in all four files maps to a defined requirement (mechanically extracted and checked — zero dangling). `§AD1`/`§AD2` cited by FR-D10/FR-D18 exist in addendum.md (AD3 exists, uncited — fine). "Appendix A §33/§34" resolve to inventory A33/A34 exactly as the Appendix A note promises. Inventory's reverse references (FR-G5, FR-E1/F2, FR-H2, FR-D16, FR-J15) all resolve. §1.5, §4, §7.3, §7.4 all exist.
- **Variant arithmetic.** Per-category listed variants match every header count (34/34 categories); headers match the prd.md Appendix A table row-for-row; grand total is exactly 487; 34 × 2 [Free] = 68, matching FR-G2, Appendix A summary, and Appendix F.
- **Memlog supersession chains** (fine, not contradictions): break-even 4 → **8–9** (PRD matches final); upgrade prompts five → **four** (FR-L5 matches); "exactly 10 control types" → **open vocabulary + Date Picker** (FR-F1/App C match, 11 types both places); last-write-wins autosave → **edit lock** (FR-D18); single domain → **two domains, one deployment** (§7.1); two Ghost targets → **four (T1–T4)**; "1–2 @custom settings" → **FR-Q builder, 3 built-ins + 17 user slots** (consistent across FR-Q2/Q5, Appendix B, P3); FR-D18 stale-lock **assumption resolved** by the later takeover decision.
- **All seven review-triage decisions + P1–P5 are in the PRD text** (FR-A5 cascade, FR-E4/G4 no-JS dark, FR-Q2/Q5 3-slot reserve, FR-H2 zero-feed guard, FR-J10 name freeze, FR-J14 compat contract, NFR-3/§7.3 same-origin+sanitize, FR-J9 rollback exemption, FR-L3 block-until-resolved, FR-D18 notice-only takeover, FR-J13 URL-keyed snapshot, FR-M2/M3 abuse controls + image approval).
- **Addendum ↔ PRD numbers agree:** 100-op journal = FR-D9's 100-step history; 3-minute default sync, flush events (close/lock release/deploy-export), autosave-off semantics, lock-required deploy/export, heartbeat-carries-unsynced-count, takeover-from-last-synced-snapshot — AD1/AD2 all match FR-D10/FR-D18. AD3's other rejections all appear in Appendix G / FR-J14.
- **Money and versions:** $15/mo · $150/yr consistent across G7, §1.5, FR-L1, Appendix F, E12; break-even 8–9 in G7 + Appendix F (arithmetic checks: $105–125 ÷ $13.70–13.93 ≈ 8–9); Fantasma $99/yr and ~155 presets consistent with memlog research; 12 Style Packs = Appendix D rows; 10 starters = Appendix E entries; 5 transactional emails listed = "exactly five"; supabase-js ≥ 2.105.0 consistent in FR-A2/§7.1.
- **Frontmatter (except F3):** prd.md v2.1/final/2026-08-17 matches the memlog's final entry; memlog `updated: 2026-08-17T22:36` matches file mtime; addendum's "not normative for scope" is compatible with the PRD citing it for mechanism only.

## Counts

| Severity | Count | Findings |
|---|---|---|
| Critical | 0 | — |
| High | 1 | F1 |
| Medium | 4 | F2, F3, F4, F5 |
| Low | 6 | F6–F11 |

**Verdict:** The hardening pass landed cleanly in the FR text — every logged decision is reflected or explicitly superseded — but it left arithmetic and companion-file residue: an unsatisfiable "deploy to all targets" DoD (F1), stale wave counts (F2), a version-pinned companion (F3), and two normative surfaces (Appendix E, A31 compile targets) the pass never revisited (F4, F5).
