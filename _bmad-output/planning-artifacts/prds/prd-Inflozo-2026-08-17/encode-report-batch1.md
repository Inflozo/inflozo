---
title: Encode Report — Batch 1 (§4 Release Strategy, §8 Epics)
status: encode record
created: 2026-08-19
---

# Batch 1 — §4 and §8

Encoded directly by the facilitator after three consecutive subagent failures (API 529). `prd.md` 971 → 999 lines. Backup at `.v3.0-backup/`.

## Map blocks encoded
L1 (design-and-spec-before-build) · L2 (34 category gates, waves retired) · L3 (complete shell block first) · L14 (E0 platform spike, §7.6 ownership) · L20 (mark-emission spike first) · S-7 (G1/G2 gated) · S-16 (T3 permanent) · partial L8 (NFR-6(c3) cadence + move into the library epics).

## Changes
- **§4 T3** — no longer "first candidate to drop"; permanent, both gscan specs exercised.
- **§4 T4** — `[ASSUMPTION — KNOWN UNTESTED PATH]` marker; Ghost(Pro) deferred post-MVP with a pre-launch blocking gate written in.
- **§4 NFR-6(c3)** — moved from hardening into a dependency of the library epics; nightly risk-weighted rotation with a 30-day full-coverage window stated normatively; matrix cadence stated.
- **§4 DoD** — adds the category owner gates, FR-J17's quality gate, and G1/G2 measured rather than asserted.
- **§4 no-descope** — rewritten around the owner's governing constraint; states that descoping was considered and declined.
- **§4 NEW** — the design-and-specify-before-build rule; the four-step build order; the category owner gate definition (6 automated checks + the owner's hands-on review).
- **§8 preamble** — wave-based joint ownership replaced by shell-block + gated-pipeline.
- **§8 story granularity** — rewritten; adds the sequential-pipeline rule binding the SM agent.
- **§8 E9/E10/E11** — rebuilt as Shell Block / Gated Library Pipeline / Starters.
- **§8 E0** — new: the mark-emission spike and the platform-verification spike.
- **§8 E15** — final sign-off rather than first run; confirms the rotation covered every design.
- **§7.6 item 7** — "before each library wave" → "at every category gate"; notes gscan certifies little.

## Verified after edit
- 119 FR definitions · contiguous in all 17 blocks · zero duplicates.
- 119/119 owned by exactly one epic `*Owns*` clause; zero unowned, zero phantom.
- Zero occurrences of "wave" as a build unit.
- 16 epics (E0–E15).

## Open debt created by this batch (MUST close in batch 3)
- **`FR-J17`** (emitted-theme code-quality gate) and **`FR-Q7`** (Koenig card design module) are referenced in §7.6 and §8 but **not yet defined**. They are planned authored FRs per the map's "authored, not edited" list. Until batch 3 lands, the document carries exactly two dangling references — tracked here, not forgotten.

## Deliberate non-decisions
- Gate count written as "as many gates as there are categories" rather than a literal number, because the category count is about to move (L16) and every hard-coded count in this document has gone stale at least once.
- **Flagged to the owner, unresolved:** whether the shell block carries its own owner gate(s). Encoded as a prerequisite rather than a gated category; one sentence changes it.
