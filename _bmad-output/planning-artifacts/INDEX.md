---
title: Inflozo — Document Index
generated: by `tools/doc-audit.py --generate` — do not hand-edit
updated: 2026-08-21
---

# Document index

**70 catalogued documents**, plus grouped sets. Generated from disk, so it cannot drift:
`tools/doc-audit.py --check` fails if a document exists without a catalogue entry, if an entry
points at a file that is gone, or if this file is out of date.

| Status | Meaning |
|---|---|
| **live** | Current and authoritative. Edit these. |
| **tool** | Runnable. Prove things rather than assert them. |
| **record** | A dated record of what was true then. **Do not edit** — editing falsifies the history the project relies on. |
| **retired** | Superseded, kept for provenance. Do not build from these. |

## Where to start

- **Understand the system** → `ARCHITECTURE-IN-PLAIN-ENGLISH.html` (no jargon), then `ARCHITECTURE-SPINE.md` (the rules).
- **Build something** → the spine, then `SCHEMA.sql`, then the PRD section for that area.
- **Check a claim about Ghost** → `verify-mechanical-ghost-claims.md`, then the research companions. They outrank the PRD body.
- **Find what was already tested** → `MEASUREMENTS.md`. Every section carries the command and its output.
- **Know what is still unverified** → `VERIFY-AT-BUILD.md`.


## Live — Current and authoritative

| Document | What it is |
|---|---|
| **[Build board](_bmad-output/planning-artifacts/BUILD-BOARD.html)**<br>`_bmad-output/planning-artifacts/BUILD-BOARD.html` | Where the project stands, what to do next, and every prompt with a copy button. The prompts are EXTRACTED from build-sequence.md rather than retyped, so the two cannot drift. Historical prompts deliberately have no copy button — one of them contains an instruction execution disproved. |
| **[Container stand-ins](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/PRELUDE.sql)**<br>`_bmad-output/planning-artifacts/architecture/.../PRELUDE.sql` | Fakes the Supabase-provided objects (auth, storage, the roles) so the schema and its proof run against a bare Postgres container. NEVER run against hosted Supabase — its auth.uid() stub would overwrite the real one with a NULL-returning function and silently disable every policy. |
| **[Design prompt 2 — outstanding](_bmad-output/planning-artifacts/design/claude-design-prompt-2.md)**<br>`_bmad-output/planning-artifacts/design/claude-design-prompt-2.md` | Responsive archetypes, ~25 missing surfaces, the paywall editor. Small, and it is what unblocks the journeys-and-flows step. |
| **[Design prompt 3 — the critical path](_bmad-output/planning-artifacts/design/claude-design-prompt-3-library.md)**<br>`_bmad-output/planning-artifacts/design/claude-design-prompt-3-library.md` | Run once per category, 34 times, producing that category's designs AND their full specifications in one pass. The longest pole in the project; nothing downstream can start without it. |
| **[Document index (for AI)](_bmad-output/planning-artifacts/INDEX.md)**<br>`_bmad-output/planning-artifacts/INDEX.md` | Every document in the project with a one-line brief, generated from disk. Read this first when picking up the project cold. |
| **[Document index (for humans)](_bmad-output/planning-artifacts/INDEX.html)**<br>`_bmad-output/planning-artifacts/INDEX.html` | The same index, browsable and grouped by status. |
| **[Everything executed](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md)**<br>`_bmad-output/planning-artifacts/architecture/.../MEASUREMENTS.md` | The evidence file: 28 sections of things actually run against real infrastructure, each with the command and its output. Five confident claims in this project have been falsified by execution; this is where the executions live. The spine cites it rather than restating its numbers. |
| **[External-facts register](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/VERIFY-AT-BUILD.md)**<br>`_bmad-output/planning-artifacts/architecture/.../VERIFY-AT-BUILD.md` | Every claim about Ghost, Supabase, Vercel or Dodo that code depends on, each with an owning epic and a status. Started at 21 items and grows whenever the project rests on a new external fact. Two items are launch-blocking. |
| **[Ghost claims, mechanically checked](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/verify-mechanical-ghost-claims.md)**<br>`_bmad-output/planning-artifacts/prds/.../verify-mechanical-ghost-claims.md` | Highest precedence in the whole project on any Ghost fact — above the research companions and far above the PRD body. Exists because four confident assertions about Ghost entered the PRD as normative text and were later proven false. |
| **[Ghost template contexts](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/appendix-b1-template-contexts.md)**<br>`_bmad-output/planning-artifacts/prds/.../appendix-b1-template-contexts.md` | Which Ghost helpers and variables are available inside which template, recorded per context. The reference the binding vocabulary is built against. |
| **[Handover for a fresh session](_bmad-output/planning-artifacts/HANDOVER.md)**<br>`_bmad-output/planning-artifacts/HANDOVER.md` | Everything a new chat needs to continue without reading the previous conversation: where the project stands, the immediate task, the standing rules, and how the owner wants to work. Update it whenever the immediate task changes. |
| **[How to restore the database](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/RESTORE-RUNBOOK.md)**<br>`_bmad-output/planning-artifacts/architecture/.../RESTORE-RUNBOOK.md` | The procedure, written down because the first drill FAILED: a public-only dump orphans every row behind 13 broken foreign keys while reporting success, and the conventional restore flags throw away every grant. Step 5 is the point — a restore is complete when RLS-TEST passes, not when pg_restore exits. |
| **[Normative for mechanism](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/addendum.md)**<br>`_bmad-output/planning-artifacts/prds/.../addendum.md` | Two mechanisms the PRD body states too loosely to build from: AD1 local-first persistence (the op-log, the revision comparison) and AD2 the edit-lock protocol. Outranks the PRD body on both. |
| **[Normative for scope](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/sections-inventory.md)**<br>`_bmad-output/planning-artifacts/prds/.../sections-inventory.md` | The 484 designs: 34 category declarations, per-category counts, which 70 are free, and the two-layer schema each design specification slots into. Every count in the project derives from here rather than being restated. |
| **[Research · Koenig cards](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-ghost-koenig-cards.md)**<br>`_bmad-output/planning-artifacts/prds/.../research-ghost-koenig-cards.md` | Ghost's editor card markup and the CSS a theme must ship to style it. |
| **[Research · behaviour modules](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-section-js-libraries.md)**<br>`_bmad-output/planning-artifacts/prds/.../research-section-js-libraries.md` | What the 31 behaviour modules need, and what can be done without JavaScript at all. |
| **[Research · contested designs](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-contested-variants.md)**<br>`_bmad-output/planning-artifacts/prds/.../research-contested-variants.md` | Designs whose feasibility was disputed, resolved one at a time. |
| **[Research · data binding](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-ghost-binding-contexts.md)**<br>`_bmad-output/planning-artifacts/prds/.../research-ghost-binding-contexts.md` | How Ghost exposes data to a theme, per context. Outranks the PRD body on any Ghost fact. |
| **[Research · empty states](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-ghost-empty-values.md)**<br>`_bmad-output/planning-artifacts/prds/.../research-ghost-empty-values.md` | What Ghost actually renders when a field is missing — the basis for every empty-state rule. |
| **[Research · memberships](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-ghost-membership-pages.md)**<br>`_bmad-output/planning-artifacts/prds/.../research-ghost-membership-pages.md` | Portal, tiers, paywalls and member-state rendering. Several claims here were only settled by running them against a real Ghost. |
| **[Research · the canvas iframe](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-canvas-iframe-geometry.md)**<br>`_bmad-output/planning-artifacts/prds/.../research-canvas-iframe-geometry.md` | How the editing surface is sized, scrolled and scaled — the basis for AD-21. |
| **[Reset protocol](tools/probe/RESET-PROTOCOL.md)**<br>`tools/probe/RESET-PROTOCOL.md` | Inventory, owner confirms, then clear — in that order, every time. |
| **[Round 4 decision sheet](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ROUND-4-FINDINGS.html)**<br>`_bmad-output/planning-artifacts/architecture/.../ROUND-4-FINDINGS.html` | The security findings as a clickable sheet: plain-language explanation, numbered options, one recommended, a box for questions, and a Copy-my-reply button. This is the artifact the owner actually used to decide; the decisions taken from it are all applied. |
| **[The PRD — v4.1, final](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md)**<br>`_bmad-output/planning-artifacts/prds/.../prd.md` | What Inflozo is: 130 functional requirements, 9 non-functional, 34 categories, 484 designs, the binding build order and the epic sequence. Never read whole — §4 build order, §5 FRs, §6 NFRs, §7 architecture, §8 epics, appendices after that. |
| **[The architecture](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md)**<br>`_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md` | The 36 invariants (AD-1..AD-36) every epic is built from. Each carries what it Binds, what it Prevents, and its Rule. This is the highest-authority build document — if code and spine disagree, the spine is wrong or the code is, never "it depends". |
| **[The architecture, for a human](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-IN-PLAIN-ENGLISH.html)**<br>`_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-IN-PLAIN-ENGLISH.html` | The whole system explained without jargon, with diagrams. Written for the owner and for anyone being brought in — a designer, an investor, a first engineer. Every number in it is measured. |
| **[The build sequence](_bmad-output/planning-artifacts/build-sequence.md)**<br>`_bmad-output/planning-artifacts/build-sequence.md` | The six steps from finished PRD to first story, what each needs from the owner, and a runnable prompt for each. Steps 1 and 2 are complete; their prompts are marked historical and one contains an instruction later proven FALSE, flagged in place rather than deleted. |
| **[The database, complete](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql)**<br>`_bmad-output/planning-artifacts/architecture/.../SCHEMA.sql` | Every table, policy, grant, trigger and storage bucket, with the reasoning inline. Applies clean to a bare PostgreSQL 17 container and to hosted Supabase. The comments are load-bearing: several record traps that cost a round to find (a column REVOKE is a no-op under a table GRANT, TRUNCATE ignores RLS). |
| **[The pre-deploy backup gate](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/BACKUP-GATE.md)**<br>`_bmad-output/planning-artifacts/architecture/.../BACKUP-GATE.md` | Inflozo is not a backup tool. Before the first deploy to a site the customer is blocked until they confirm they hold their own backup, with a checkbox per item and the exact Ghost menu path for each. Records the two facts most people get wrong: Ghost's content export excludes images, and Ghost-hosted customers cannot download theirs at all. |
| **[The security gate](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/RLS-TEST.sql)**<br>`_bmad-output/planning-artifacts/architecture/.../RLS-TEST.sql` | E1's exit criterion and the acceptance test for a restore. 70 assertions, and it ABORTS on failure — it used to print FAIL and exit 0, which is why six holes survived three rounds. Mutation-tested: reverting any fix turns it red. Pure SQL, so it runs in psql or the Supabase dashboard editor. |
| **[The string catalog](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/appendix-h1-string-catalog.md)**<br>`_bmad-output/planning-artifacts/prds/.../appendix-h1-string-catalog.md` | Every user-visible string, keyed and namespaced per category. Append-only and never reworded in place, because a superseded key orphans every user override built on it. |
| **[Theme and arithmetic, checked](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/verify-mechanical-theme-and-math.md)**<br>`_bmad-output/planning-artifacts/prds/.../verify-mechanical-theme-and-math.md` | The same treatment for emitted-theme structure and the numbers in the financial model. |
| **Design library export — 12 of 34 categories** *(273 files)*<br>`_bmad-output/planning-artifacts/design/claude-design-export/unpacked/` | Claude Design's export: 12 per-category spec files and 225 design frames, A1 Headers through A12 About and Team. The specs are detailed and per-design but predate the prompt correction, so all 12 are missing four of the ten required fields — descriptor, archetype, structural tuple and the no-JS degradation. See HANDOVER.md for which are recoverable. |
| **Stress fixture README** *(1 files)*<br>`tools/stress/` | How to run the fixture and the gate. |


## Tool — Runnable

| Document | What it is |
|---|---|
| **[Build board generator](tools/build-board.py)**<br>`tools/build-board.py` | Reads build-sequence.md and emits BUILD-BOARD.html. Status is declared in the script rather than parsed, because "is this step done" is a judgement about the world, not a string in a document. |
| **[Credential check](tools/probe/check-access.py)**<br>`tools/probe/check-access.py` | Verifies every live credential works. Prints verdicts only — it has no code path that can reach a secret, written that way after two keys leaked into a transcript. |
| **[Decision-sheet template](tools/probe/report-template.html)**<br>`tools/probe/report-template.html` | Copy it, replace the findings array, change nothing else. |
| **[Diagram geometry checker](tools/svg-check.py)**<br>`tools/svg-check.py` | The architecture diagrams are hand-written SVG, and a browser will draw text straight through a box without complaining. Finds text that overflows its frame, text crossing a shape it does not belong to, and connector lines cutting through unrelated boxes. Written after a real overlap was reported — and its first version missed the worst case by only parsing two-point paths. |
| **[Fixture sections](tools/stress/sections.js)**<br>`tools/stress/sections.js` | The annotated HTML the fixture compiles. |
| **[Ghost fixture seeder](tools/probe/seed-ghost.py)**<br>`tools/probe/seed-ghost.py` | Seeds both Ghosts identically. |
| **[Ghost provisioning](tools/probe/provision-ghost.sh)**<br>`tools/probe/provision-ghost.sh` | Builds a probe Ghost from scratch. |
| **[Ghost(Pro) probe](tools/probe/run-verify-ghostpro.py)**<br>`tools/probe/run-verify-ghostpro.py` | Written and waiting for a Ghost(Pro) Starter trial. Blocks public launch. |
| **[Proof of AD-36](tools/stress/test-ad36.js)**<br>`tools/stress/test-ad36.js` | 13 checks: the four injection vectors, the brace escaping, and the media-guard rule. Each asserts the attack is inert AND that the legitimate case still works. |
| **[Proof the two renderers agree](tools/stress/test-renderer-agreement.js)**<br>`tools/stress/test-renderer-agreement.js` | 8 checks comparing canvas and theme node by node. E0(a)'s exit criterion, made runnable. |
| **[Register probe · item 13](tools/probe/run-verify-13.py)**<br>`tools/probe/run-verify-13.py` | Docs-versus-code conflicts. |
| **[Register probes](tools/probe/run-verify-all.py)**<br>`tools/probe/run-verify-all.py` | Executes register items against real Ghosts. |
| **[Storage sanitizer probe](tools/probe/run-f8-storage.py)**<br>`tools/probe/run-f8-storage.py` | Proves the only sanitizer in the product is advisory — a client that skips it uploads raw bytes. |
| **[Supabase reset](tools/probe/RESET-supabase.sql)**<br>`tools/probe/RESET-supabase.sql` | Clears the probe project for a clean schema apply. Deletes storage files through the dashboard first, because a SQL cascade removes the row and leaves the bytes billed. |
| **[The compiler](tools/stress/compile.js)**<br>`tools/stress/compile.js` | Both emitters — canvas and theme — sharing one code path. The `users` parameter is the only difference between them, which is what makes "the canvas and the shipped theme agree by construction" a property of the code rather than a promise. |
| **[The gscan gate](tools/stress/gate.js)**<br>`tools/stress/gate.js` | Runs the gscan version each Ghost major actually BUNDLES — 4.49.7 for Ghost 5, 6.4.2 for Ghost 6. Running one gscan twice with different flags looks equivalent and is not. |
| **[The stress fixture](tools/stress/build.js)**<br>`tools/stress/build.js` | Builds a deliberately heavy 70-section theme and prints the compile budget. The measurement behind AD-11. |
| **[This gate](tools/doc-audit.py)**<br>`tools/doc-audit.py` | Generates the index and checks documentation propagation. Exits non-zero on drift. |
| **CSP probe app** *(1 files)*<br>`tools/probe/csp/` | The minimal Next app behind the CSP measurement. |


## Record — Dated record — do not edit

| Document | What it is |
|---|---|
| **[Design prompt 1 — run](_bmad-output/planning-artifacts/design/claude-design-prompt.md)**<br>`_bmad-output/planning-artifacts/design/claude-design-prompt.md` | Produced the 27 interface mockups. |
| **[Design reconciliation brief](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-design-prompt.md)**<br>`_bmad-output/planning-artifacts/prds/.../reconcile-design-prompt.md` | How that pass was run. |
| **[Encode propagation map](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/encode-propagation-map.md)**<br>`_bmad-output/planning-artifacts/prds/.../encode-propagation-map.md` | Where each requirement change had to land. The origin of "propagate, never localise". |
| **[Encode report](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/encode-report-batch1.md)**<br>`_bmad-output/planning-artifacts/prds/.../encode-report-batch1.md` | Batch record. |
| **[Mockups vs PRD](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-mockups.md)**<br>`_bmad-output/planning-artifacts/prds/.../reconcile-mockups.md` | Found ~31 disagreements; the precedent for the design-reconciliation step. |
| **[PRD validation](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/validation-report.md)**<br>`_bmad-output/planning-artifacts/prds/.../validation-report.md` | Full validation pass. |
| **[PRD validation v2.1](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/validation-report-v2.1.md)**<br>`_bmad-output/planning-artifacts/prds/.../validation-report-v2.1.md` | Superseded. |
| **[PRD validation v2.3](_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/validation-report-v2.3.md)**<br>`_bmad-output/planning-artifacts/prds/.../validation-report-v2.3.md` | Superseded. |
| **[Round 1 brief](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/STRESS-TEST-PROMPT.md)**<br>`_bmad-output/planning-artifacts/architecture/.../STRESS-TEST-PROMPT.md` | The first stress test. |
| **[Round 2 apply · gscan](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/R2-APPLY-3-GSCAN.md)**<br>`_bmad-output/planning-artifacts/architecture/.../R2-APPLY-3-GSCAN.md` | Application batch. |
| **[Round 2 apply · library](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/R2-APPLY-4-PRD-LIBRARY.md)**<br>`_bmad-output/planning-artifacts/architecture/.../R2-APPLY-4-PRD-LIBRARY.md` | Application batch. |
| **[Round 2 apply · schema](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/R2-APPLY-1-SCHEMA.md)**<br>`_bmad-output/planning-artifacts/architecture/.../R2-APPLY-1-SCHEMA.md` | Application batch. |
| **[Round 2 apply · spine](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/R2-APPLY-2-SPINE.md)**<br>`_bmad-output/planning-artifacts/architecture/.../R2-APPLY-2-SPINE.md` | Application batch. |
| **[Round 2 brief + round 1 decisions](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/STRESS-TEST-R2.md)**<br>`_bmad-output/planning-artifacts/architecture/.../STRESS-TEST-R2.md` | Also carries Round 1's 33 decisions in Part 3. |
| **[Round 2 decisions](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ROUND-2-DECISIONS.md)**<br>`_bmad-output/planning-artifacts/architecture/.../ROUND-2-DECISIONS.md` | 16, all applied. |
| **[Round 3 brief](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/STRESS-TEST-R3.md)**<br>`_bmad-output/planning-artifacts/architecture/.../STRESS-TEST-R3.md` | Handover into round 3. |
| **[Round 3 decisions](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ROUND-3-DECISIONS.md)**<br>`_bmad-output/planning-artifacts/architecture/.../ROUND-3-DECISIONS.md` | 13 plus A and B. |
| **[Round 3 findings](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ROUND-3-REPORT.md)**<br>`_bmad-output/planning-artifacts/architecture/.../ROUND-3-REPORT.md` | 15 findings, all four passes. |
| **[Round 4 brief](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/STRESS-TEST-R4.md)**<br>`_bmad-output/planning-artifacts/architecture/.../STRESS-TEST-R4.md` | The security, performance and real-infrastructure round. |
| **[Round 4 findings](_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ROUND-4-REPORT.md)**<br>`_bmad-output/planning-artifacts/architecture/.../ROUND-4-REPORT.md` | 17 findings, 15 executed. The technical companion to the decision sheet. |
| **Generated theme output** *(1 files)*<br>`tools/stress/theme/assets/js/` | Build artifact, regenerated by build.js. |
| **Interface mockups (27)** *(26 files)*<br>`_bmad-output/planning-artifacts/design/mockups/` | Design prompt 1's output: marketing pages, editor, dashboard, deploy, routes, style packs. Design artifacts are non-normative — where one disagrees with the PRD, the PRD wins. |
| **PRD review passes** *(17 files)*<br>`_bmad-output/planning-artifacts/prds/.../` | Adversarial, consistency, buildability, Ghost-truth, WYSIWYG and theme-quality reviews across two stress rounds. Each found real defects; their fixes are in the PRD. |
| **PRD validation (HTML)** *(3 files)*<br>`_bmad-output/planning-artifacts/prds/.../` | Rendered validation reports. |
| **Round 2 fixtures** *(3 files)*<br>`_bmad-output/planning-artifacts/architecture/.../fixtures-r2/` | Checked-in gscan fixtures. |
| **Session memory logs** *(2 files)*<br>`_bmad-output/planning-artifacts/architecture/.../` | Per-workspace decision trail. |


## Retired — Superseded

| Document | What it is |
|---|---|
| **PRD snapshot v2.3** *(3 files)*<br>`_bmad-output/planning-artifacts/prds/.../.v2.3-backup/` | Frozen copy. |
| **PRD snapshot v3.0** *(5 files)*<br>`_bmad-output/planning-artifacts/prds/.../.v3.0-backup/` | Frozen copy. |
| **PRD snapshot v4.0** *(1 files)*<br>`_bmad-output/planning-artifacts/prds/.../.v4.0-backup/` | Frozen copy. |
| **The original compiler spike** *(7 files)*<br>`_bmad-output/planning-artifacts/prds/.../spike-compiler/` | Retired 2026-08-20 — a second copy of the pipeline missing six rounds of decisions, with both known defects still live. See its RETIRED.md. The live pipeline is tools/stress/. |
