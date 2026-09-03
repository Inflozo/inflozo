#!/usr/bin/env python3
"""Inflozo — the documentation gate.

    python3 tools/doc-audit.py --generate    # rebuild INDEX.md and INDEX.html from disk
    python3 tools/doc-audit.py --check       # verify; EXIT NON-ZERO if anything drifted

Why this exists, and it is not tidiness.

Three propagation audits were run by hand (MEASUREMENTS §24a, §27, §27e). Every one of them found
something, and every one found it in the thing added most recently:

    audit 1  a finding was written up in MEASUREMENTS and reached no owning invariant
    audit 2  two "class" assertions had hardcoded their members and had already drifted
    audit 3  the human-facing document still described a decision that had since been made

The pattern is stable enough to automate, and a checklist nobody runs is not a control. This is the
same contract as `RLS-TEST.sql`: it either passes or it exits non-zero, and CI keys on that. It is
deliberately allowed to be noisy about things it cannot judge — a false alarm costs a minute, and a
missed propagation costs a round.
"""
import os, re, sys, subprocess, html, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAN = os.path.join(ROOT, '_bmad-output', 'planning-artifacts')
ARCH = os.path.join(PLAN, 'architecture', 'architecture-Inflozo-2026-08-19')
PRD  = os.path.join(PLAN, 'prds', 'prd-Inflozo-2026-08-17')

# ─────────────────────────────────────────────────────────────────────────────
# The catalogue. A doc with no entry here FAILS --check: adding a document to the
# project means saying what it is, in the same commit.
# ─────────────────────────────────────────────────────────────────────────────
STATUS = {'live': 'Current and authoritative', 'record': 'Dated record — do not edit',
          'tool': 'Runnable', 'retired': 'Superseded'}

DOCS = [
 # ── step 5's UX spines ───────────────────────────────────────────────────────
 ('ux-designs/ux-Inflozo-2026-09-03/DESIGN.md', 'live', 'The visual spine',
  "Inflozo's own visual identity, in the Google Labs DESIGN.md shape: tokens in frontmatter, "
  'rationale in prose. It is a TRANSCRIPTION of the Claude Design export — `Calibration Set` and '
  '`Editor Sidebar Kit` are its source, and on any disagreement THE EXPORT IS RIGHT AND THIS FILE '
  'IS THE BUG (ruling R-74). It governs the app and the marketing site; the generated sites are the '
  "Style Packs' business, not this file's."),
 ('ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md', 'live', 'The experience spine — journeys and flows',
  'Step 5. The information architecture, the state patterns, the accessibility floor, the four '
  'journeys and the eight flows. EVERY SURFACE HAS ONE STABLE NAME and either points at a drawn '
  'frame by filename or names the frame it extrapolates from — step 5b keys its prototype pages off '
  'those names (R-75). Its Appendix A carries one Claude Design prompt per undrawn surface group. '
  'Also the record of §37.7 re-verified against the export: the Paywall editor turned out to be '
  'drawn at C Post Body C3a.'),
 # ── the spine and its runnable companions ────────────────────────────────────
 ('architecture/.../ARCHITECTURE-SPINE.md', 'live', 'The architecture',
  'Every invariant (AD-1 upward — the file is the count) that every epic is built from. Each carries '
  'what it Binds, what it '
  'Prevents, and its Rule. This is the highest-authority build document — if code and spine '
  'disagree, the spine is wrong or the code is, never "it depends".'),
 ('architecture/.../SCHEMA.sql', 'live', 'The database, complete',
  'Every table, policy, grant, trigger and storage bucket, with the reasoning inline. Applies clean '
  'to a bare PostgreSQL 17 container and to hosted Supabase. The comments are load-bearing: several '
  'record traps that cost a round to find (a column REVOKE is a no-op under a table GRANT, TRUNCATE '
  'ignores RLS).'),
 ('architecture/.../RLS-TEST.sql', 'live', 'The security gate',
  'E1\'s exit criterion and the acceptance test for a restore — the file is the count of its own '
  'assertions. It ABORTS on failure; it used to print FAIL and exit 0, which is why six holes '
  'survived three rounds. Mutation-tested: reverting any fix turns it red. Pure SQL, so it runs in '
  'psql or the Supabase dashboard editor.'),
 ('architecture/.../PRELUDE.sql', 'live', 'Container stand-ins',
  'Fakes the Supabase-provided objects (auth, storage, the roles) so the schema and its proof run '
  'against a bare Postgres container. NEVER run against hosted Supabase — its auth.uid() stub would '
  'overwrite the real one with a NULL-returning function and silently disable every policy.'),
 ('architecture/.../MEASUREMENTS.md', 'live', 'Everything executed',
  'The evidence file: everything actually run against real infrastructure — the file is the count — '
  'each with the command and its output. Five confident claims in this project have been falsified by execution; '
  'this is where the executions live. The spine cites it rather than restating its numbers.'),
 ('architecture/.../VERIFY-AT-BUILD.md', 'live', 'External-facts register',
  'Every claim about Ghost, Supabase, Vercel or Dodo that code depends on, each with an owning epic '
  'and a status. Started at 21 items and grows whenever the project rests on a new external fact — '
  'the file is the count. The rows marked ⛔ are the ones that block something; both Ghost(Pro) rows '
  'block public launch.'),

 # ── procedures and specifications ────────────────────────────────────────────
 ('architecture/.../RESTORE-RUNBOOK.md', 'live', 'How to restore the database',
  'The procedure, written down because the first drill FAILED: a public-only dump orphans every row '
  'behind 13 broken foreign keys while reporting success, and the conventional restore flags throw '
  'away every grant. Step 5 is the point — a restore is complete when RLS-TEST passes, not when '
  'pg_restore exits.'),
 ('architecture/.../BACKUP-GATE.md', 'live', 'The pre-deploy backup gate',
  'Inflozo is not a backup tool. Before the first deploy to a site the customer is blocked until '
  'they confirm they hold their own backup, with a checkbox per item and the exact Ghost menu path '
  'for each. Records the two facts most people get wrong: Ghost\'s content export excludes images, '
  'and Ghost-hosted customers cannot download theirs at all.'),
 ('architecture/.../ARCHITECTURE-IN-PLAIN-ENGLISH.html', 'live', 'The architecture, for a human',
  'The whole system explained without jargon, with diagrams. Written for the owner and for anyone '
  'being brought in — a designer, an investor, a first engineer. Every number in it is measured.'),
 ('architecture/.../ROUND-4-FINDINGS.html', 'record', 'Round 4 decision sheet',
  'The security findings as a clickable sheet: plain-language explanation, numbered options, one '
  'recommended, a box for questions, and a Copy-my-reply button. The artifact the owner actually used '
  'to decide, and every decision taken from it is applied — so it is a dated record of that round, '
  'alongside ROUND-4-REPORT.md. Its blank is tools/probe/report-template.html.'),

 # ── the PRD and its normative companions ─────────────────────────────────────
 ('prds/.../prd.md', 'live', 'The PRD — v4.1, final',
  'What Inflozo is: every functional and non-functional requirement, the binding build order and the '
  'epic sequence. Since the 2026-08-31 merge it states no library count of its own — Appendix I is '
  'generated from the design export. Never read whole: §4 build order, §5 FRs, §6 NFRs, §7 '
  'architecture, §8 epics, appendices after that.'),
 ('prds/.../addendum.md', 'live', 'Normative for mechanism',
  'Two mechanisms the PRD body states too loosely to build from: AD1 local-first persistence (the '
  'op-log, the revision comparison) and AD2 the edit-lock protocol. Outranks the PRD body on both.'),
 ('prds/.../sections-inventory.md', 'live', 'Normative for scope',
  'The library: one declaration per category, its roster, its `Content:` / `Controls:` / `Data:` '
  'union — the storage contract park-and-restore runs on — and the two-layer schema each design '
  'specification slots into. Appendix A\'s totals, every roster and every union line are GENERATED '
  'from the design export by tools/inventory-gen.py and gated by --check, so the file cannot drift '
  'from what was drawn. Two [Free] per category, by rule (R-17).'),
 ('prds/.../appendix-b1-template-contexts.md', 'live', 'Ghost template contexts',
  'Which Ghost helpers and variables are available inside which template, recorded per context. The '
  'reference the binding vocabulary is built against.'),
 ('prds/.../appendix-h1-string-catalog.md', 'live', 'The string catalog',
  'Every user-visible string, keyed and namespaced per category. Append-only and never reworded in '
  'place, because a superseded key orphans every user override built on it.'),
 ('prds/.../verify-mechanical-ghost-claims.md', 'live', 'Ghost claims, mechanically checked',
  'Highest precedence in the whole project on any Ghost fact — above the research companions and '
  'far above the PRD body. Exists because four confident assertions about Ghost entered the PRD as '
  'normative text and were later proven false.'),
 ('prds/.../verify-mechanical-theme-and-math.md', 'live', 'Theme and arithmetic, checked',
  'The same treatment for emitted-theme structure and the numbers in the financial model.'),

 # ── research companions ──────────────────────────────────────────────────────
 ('prds/.../research-ghost-binding-contexts.md', 'live', 'Research · data binding',
  'How Ghost exposes data to a theme, per context. Outranks the PRD body on any Ghost fact.'),
 ('prds/.../research-ghost-empty-values.md', 'live', 'Research · empty states',
  'What Ghost actually renders when a field is missing — the basis for every empty-state rule.'),
 ('prds/.../research-ghost-koenig-cards.md', 'live', 'Research · Koenig cards',
  'Ghost\'s editor card markup and the CSS a theme must ship to style it.'),
 ('prds/.../research-ghost-membership-pages.md', 'live', 'Research · memberships',
  'Portal, tiers, paywalls and member-state rendering. Several claims here were only settled by '
  'running them against a real Ghost.'),
 ('prds/.../research-canvas-iframe-geometry.md', 'live', 'Research · the canvas iframe',
  'How the editing surface is sized, scrolled and scaled — the basis for AD-21.'),
 ('prds/.../research-contested-variants.md', 'live', 'Research · contested designs',
  'Designs whose feasibility was disputed, resolved one at a time.'),
 ('prds/.../research-section-js-libraries.md', 'live', 'Research · behaviour modules',
  'The behaviour-module registry — §2.1 is the list AND the count, never a number written elsewhere. Each row carries its no-JS degradation, whether it is edit-safe, and the designs that declare it (re-derived from the export 2026-08-31). §3 and §4 are the analysis that produced it, left as the record. Also: what needs no JavaScript at all.'),

 # ── process ──────────────────────────────────────────────────────────────────
 ('build-sequence.md', 'live', 'The build sequence',
  'The steps from finished PRD to first story, what each needs from the owner, and a runnable '
  'prompt for each. Steps 1–4 and the inventory merge are COMPLETE; step 5 (journeys and flows) is '
  'the critical path. One step-2 prompt contains an instruction later proven FALSE, flagged in '
  'place rather than deleted.'),
 ('design/claude-design-prompt.md', 'record', 'Design prompt 1 — run',
  'Produced the 27 interface mockups.'),
 ('design/claude-design-prompt-2.md', 'record', 'Design prompt 2 — run',
  'Produced the responsive archetypes, the missing app surfaces and the paywall editor. Run and '
  'exported (S1–S14, M1–M9, verified 2026-08-21), which is what unblocked step 5.'),
 ('design/claude-design-prompt-3-library.md', 'record', 'Design prompt 3 — run',
  'Run once per category, producing that category\'s designs AND their full specifications in one '
  'pass. Complete 2026-08-25; the export is now the authority on what it produced, and the specs have '
  'been patched twice since — the controls pass, then the design patch pass. It states the library '
  'size as it stood when written.'),
 ('design/derived-fields-A1-A12.md', 'retired', 'Derived fields — A1 through A12',
  'SUPERSEDED WHOLESALE at the 2026-08-27 inventory merge (ruling R-16). It derived four missing '
  'fields for the first 12 exported categories by reading the export\'s prose; all 33 live '
  'categories now carry those fields natively, so its 186 hand-derived tuples are both partial and '
  'outranked. tools/tuple-check.py reads the export through tools/export-roster.py instead. Kept '
  'for provenance — do not build from it.'),

 # ── round records ────────────────────────────────────────────────────────────
 ('architecture/.../STRESS-TEST-PROMPT.md', 'record', 'Round 1 brief', 'The first stress test.'),
 ('architecture/.../STRESS-TEST-R2.md', 'record', 'Round 2 brief + round 1 decisions',
  'Also carries Round 1\'s 33 decisions in Part 3.'),
 ('architecture/.../STRESS-TEST-R3.md', 'record', 'Round 3 brief', 'Handover into round 3.'),
 ('architecture/.../STRESS-TEST-R4.md', 'record', 'Round 4 brief',
  'The security, performance and real-infrastructure round.'),
 ('architecture/.../ROUND-2-DECISIONS.md', 'record', 'Round 2 decisions', '16, all applied.'),
 ('architecture/.../ROUND-3-DECISIONS.md', 'record', 'Round 3 decisions', '13 plus A and B.'),
 ('architecture/.../ROUND-3-REPORT.md', 'record', 'Round 3 findings', '15 findings, all four passes.'),
 ('architecture/.../ROUND-4-REPORT.md', 'record', 'Round 4 findings',
  '17 findings, 15 executed. The technical companion to the decision sheet.'),
 ('architecture/.../R2-APPLY-1-SCHEMA.md', 'record', 'Round 2 apply · schema', 'Application batch.'),
 ('architecture/.../R2-APPLY-2-SPINE.md', 'record', 'Round 2 apply · spine', 'Application batch.'),
 ('architecture/.../R2-APPLY-3-GSCAN.md', 'record', 'Round 2 apply · gscan', 'Application batch.'),
 ('architecture/.../R2-APPLY-4-PRD-LIBRARY.md', 'record', 'Round 2 apply · library', 'Application batch.'),
 ('prds/.../validation-report.md', 'record', 'PRD validation', 'Full validation pass.'),
 ('prds/.../validation-report-v2.1.md', 'record', 'PRD validation v2.1', 'Superseded.'),
 ('prds/.../validation-report-v2.3.md', 'record', 'PRD validation v2.3', 'Superseded.'),
 ('prds/.../reconcile-mockups.md', 'record', 'Mockups vs PRD',
  'Found ~31 disagreements; the precedent for the design-reconciliation step.'),
 ('prds/.../reconcile-design-prompt.md', 'record', 'Design reconciliation brief', 'How that pass was run.'),
 ('prds/.../reconcile-designs.md', 'record', 'Designs vs PRD, architecture and Ghost',
  'Step 4a (2026-08-27): all 34 category specs, P0 and the S/M screens reconciled — 1,086 findings, '
  '41 probe families, 1,078 owner-flag rows (the Ghost Build Room agenda), the PRD amendments by FR. '
  'Its findings array is reconcile-designs.findings.json beside it.'),
 ('prds/.../reconcile-designs-decisions.md', 'live', 'Ghost Build Room rulings',
  'Step 4b (2026-08-27, extended through 2026-09-03: §A5-§A9 the library review, the open-questions sheet, the architect rulings, the stress-test rulings and pass five; §A10 the two STANDING rulings R-74/R-75 — export fidelity till project end, and the static-prototype gate on step 6): the owner\'s rulings on everything 4a could not settle '
  'by reading, each naming the documents that must move. §A the room\'s rulings · §A2 the design '
  'patch pass · §A3 the §F asks, all now ruled · §A4 §37.7 re-verified for step 5 · §B FOUR APPROVED '
  'DECISIONS SUPERSEDED (D3 native search, D17 accent seeding, D26 gap names, D27 in half) — read it '
  'before trusting any D-number · §C the Ghost facts executed that night · §E the remaining probe '
  'list. R-30 to R-38 have not propagated yet.'),
 ('prds/.../encode-propagation-map.md', 'record', 'Encode propagation map',
  'Where each requirement change had to land. The origin of "propagate, never localise".'),
 ('prds/.../encode-report-batch1.md', 'record', 'Encode report', 'Batch record.'),

 # ── runnable tools ───────────────────────────────────────────────────────────
 ('tools/stress/compile.js', 'tool', 'The compiler',
  'Both emitters — canvas and theme — sharing one code path. The `users` parameter is the only '
  'difference between them, which is what makes "the canvas and the shipped theme agree by '
  'construction" a property of the code rather than a promise.'),
 ('tools/stress/test-renderer-agreement.js', 'tool', 'Proof the two renderers agree',
  '8 checks comparing canvas and theme node by node. E0(a)\'s exit criterion, made runnable.'),
 ('tools/stress/test-ad36.js', 'tool', 'Proof of AD-36',
  '13 checks: the four injection vectors, the brace escaping, and the media-guard rule. Each asserts '
  'the attack is inert AND that the legitimate case still works.'),
 ('tools/stress/build.js', 'tool', 'The stress fixture',
  'Builds a deliberately heavy 70-section theme and prints the compile budget. The measurement '
  'behind AD-11.'),
 ('tools/stress/gate.js', 'tool', 'The gscan gate',
  'Runs the gscan version each Ghost major actually BUNDLES — 4.49.7 for Ghost 5, 6.4.2 for Ghost 6. '
  'Running one gscan twice with different flags looks equivalent and is not.'),
 ('tools/stress/sections.js', 'tool', 'Fixture sections', 'The annotated HTML the fixture compiles.'),
 ('tools/probe/check-access.py', 'tool', 'Credential check',
  'Verifies every live credential works. Prints verdicts only — it has no code path that can reach '
  'a secret, written that way after two keys leaked into a transcript.'),
 ('tools/probe/RESET-supabase.sql', 'tool', 'Supabase reset',
  'Clears the probe project for a clean schema apply. Deletes storage files through the dashboard '
  'first, because a SQL cascade removes the row and leaves the bytes billed.'),
 ('tools/probe/RESET-PROTOCOL.md', 'live', 'Reset protocol',
  'Inventory, owner confirms, then clear — in that order, every time.'),
 ('tools/probe/seed-ghost.py', 'tool', 'Ghost fixture seeder', 'Seeds both Ghosts identically.'),
 ('tools/probe/provision-ghost.sh', 'tool', 'Ghost provisioning', 'Builds a probe Ghost from scratch.'),
 ('tools/probe/run-verify-all.py', 'tool', 'Register probes', 'Executes register items against real Ghosts.'),
 ('tools/probe/run-verify-13.py', 'tool', 'Register probe · item 13', 'Docs-versus-code conflicts.'),
 ('tools/probe/run-verify-47.py', 'tool', 'Register probe · item 47', 'The {{#get}} abort threshold. Found there is none per template — Ghost races each get against 5000 ms on both majors — and measured the real marginal cost of a hand-picked item. --identical isolates Ghost 6 query dedup from real query cost.'),
 ('tools/probe/run-verify-a33-cards.py', 'tool', 'Register probe · Koenig card selectors',
  'Reads the class names Ghost\'s own card renderers emit, on both majors, to settle the six '
  'selectors A33 had marked unverified. A SOURCE read rather than a render, and deliberately: the '
  'renderer is the authority, and it covers cards a fixture cannot exercise — the email card never '
  'renders on the web, so no post could ever have shown its class. Its control (four documented '
  'classes must come back) caught a real error on the first run: the probe had assumed Ghost 6\'s '
  'node path and Ghost 5 uses another, so Ghost 5 returned zero cards and the probe refused to '
  'report the unknowns. Reads only — creates nothing, uploads nothing, changes nothing.'),
 ('tools/probe/run-verify-e2.py', 'tool', 'Register probe · E-2 captions',
  'feature_image_caption: its stored shape, {{ }} versus {{{ }}}, and gscan on the triple stash. '
  'Carries TWO controls because the answer turns on a non-difference: a plain-text caption must '
  'render identically both ways, and the same theme must produce an identical gscan rule set with '
  'and without the triple stash. Found the field is a SafeString on both majors — so R-10 #7\'s '
  'carve-out is withdrawn — and that Ghost 6 sanitises it at render while Ghost 5 emits a <script> '
  'straight into the page. Restores the previous theme and deletes its own posts.'),
 ('tools/probe/run-verify-comment-count.py', 'tool', 'Register probe · the comment count',
  'Whether {{comment_count}} substitutes a placeholder, and what it renders with JS off. Its FIRST '
  'control failed and that was the finding: the helper substitutes nothing server-side, so the probe '
  'could not tell `%` from {count} and refused to report a result. Re-shaped around the real '
  'contract — the count is PREPENDED client-side — which makes "% comment" render as "1 % comment". '
  'Confirms R-10 #8 and falsifies the reason appendix-h1 gave for the opposite.'),
 ('tools/probe/run-f8-storage.py', 'tool', 'Storage sanitizer probe',
  'Proves the only sanitizer in the product is advisory — a client that skips it uploads raw bytes.'),
 ('tools/probe/run-verify-ghostpro.py', 'tool', 'Ghost(Pro) probe',
  'Written and waiting for a Ghost(Pro) Starter trial. Blocks public launch.'),
 ('tools/probe/report-template.html', 'tool', 'Decision-sheet template',
  'Copy it, replace the findings array, change nothing else.'),
 ('planning-artifacts/INDEX.md', 'live', 'Document index (for AI)',
  'Every document in the project with a one-line brief, generated from disk. Read this first when '
  'picking up the project cold.'),
 ('planning-artifacts/INDEX.html', 'live', 'Document index (for humans)',
  'The same index, browsable and grouped by status.'),
 ('planning-artifacts/CATEGORY-PROMPTS.html', 'live', 'Category prompts, one per category',
  'The prompts that BUILT the library, kept for a re-run of a single category. Every category has '
  'been designed, so nothing here is outstanding work; A23 is marked deleted and has no copy button. '
  'Generated by tools/category-prompts.py, so the master brief inside them cannot drift from the '
  'prompt file. The design work has moved on twice since — the controls pass '
  '(CONTROL-PROMPTS.html) and the design patch pass (DESIGN-PATCH-PROMPTS.html).'),
 ('planning-artifacts/CONTROL-PROMPTS.html', 'live', 'Controls-reconciliation prompts',
  'The controls audit of the whole export against the PRD and Ghost\'s data surface: one primitives '
  'session (P0) plus one patch prompt per category, the 39 recorded decisions D1-D39 (all ruled by '
  'the owner 2026-08-24), and the architect carry-forwards. The pass itself has RUN (2026-08-25); '
  'what keeps the file live is that it is the home of the D-numbers cited across the project, and '
  'four have since been REVERSED and are marked in place — D3, D17, D26 and D27-in-half. '
  'Hand-authored, no generator.'),
 ('tools/category-prompts.py', 'tool', 'Category prompt generator',
  'Extracts the master brief and the category table from the prompt file, reads which categories '
  'exist in the design export, and emits one prompt per category. Asserts it parsed EVERY table row '
  'rather than a count — the first version silently matched a third of them because the notes column '
  'is optional, and a later version asserted `len(names) == 31` over the module registry and duly '
  'broke when the registry moved. Both are derived now.'),
 ('planning-artifacts/HANDOVER.md', 'live', 'Handover for a fresh session',
  'Everything a new chat needs to continue without reading the previous conversation: where the '
  'project stands, the immediate task, the standing rules, and how the owner wants to work. Update '
  'it whenever the immediate task changes.'),
 ('planning-artifacts/BUILD-BOARD.html', 'live', 'Build board',
  'Where the project stands, what to do next, and every prompt with a copy button. The prompts are '
  'EXTRACTED from build-sequence.md rather than retyped, so the two cannot drift. Historical prompts '
  'deliberately have no copy button — one of them contains an instruction execution disproved.'),
 ('tools/build-board.py', 'tool', 'Build board generator',
  'Reads build-sequence.md and emits BUILD-BOARD.html. Status is declared in the script rather than '
  'parsed, because "is this step done" is a judgement about the world, not a string in a document.'),
 ('tools/svg-check.py', 'tool', 'Diagram geometry checker',
  'The architecture diagrams are hand-written SVG, and a browser will draw text straight through a '
  'box without complaining. Finds text that overflows its frame, text crossing a shape it does not '
  'belong to, and connector lines cutting through unrelated boxes. Written after a real overlap was '
  'reported — and its first version missed the worst case by only parsing two-point paths.'),
 ('tools/design-patch-prompts.py', 'tool', 'Per-category design patch prompts',
  'Generates DESIGN-PATCH-PROMPTS.html — one self-contained Claude Design prompt per category plus P0, each carrying the four Ghost facts, the ten library-wide rules, its own roster and its own work list, because Claude Design cannot read this repo and each prompt is pasted into a fresh chat. Rosters DERIVE from the export via export-roster.py so design numbers cannot drift; only the rulings are authored here. **Its FACTS, OUTPUT and CSS are imported by every later pass**, so the standing instruction in OUTPUT — never ask the owner mid-session, record the question as OPEN FOR THE OWNER and carry on — reaches all of them from this one place.'),
 ('tools/design-patch-prompts-2.py', 'tool', 'Design patch prompts — pass two',
  'Generates DESIGN-PATCH-PROMPTS-2.html: the SPEC half of every ruling taken after pass one — '
  'R-30 to R-38, the carried-forward R-2/R-10/R-29, and two findings that came out of execution '
  'rather than a ruling (the caption difference between majors, and the comment count rendering '
  'nothing without JS). A SEPARATE file rather than an edit to pass one, because pass one is the '
  'record of what was actually sent and a record is not rewritten. Imports the four Ghost facts, '
  'the output contract and the page CSS from design-patch-prompts.py; rosters DERIVE from the '
  'export. Only the work lists are authored, because a ruling cannot be derived.'),
 ('tools/design-patch-prompts-5.py', 'tool', 'Design patch prompts — pass five',
  'Generates DESIGN-PATCH-PROMPTS-5.html. Mostly one mechanical job repeated: the Image-focus sweep, '
  'whose category list is DERIVED by the same test pass four uses. Three categories carry one extra '
  'item — A33\'s card selectors settled by execution, and A4 and A6, whose CATEGORY LAYERS still '
  'describe the Actions control as it was before the 2026-08-31 split while their own patch notes '
  'have it right. That pair was found by reading the layer rather than counting matches: A1, A2 and '
  'A32 quote the old value list too, but only as the mapping, which is correct.'),
 ('planning-artifacts/DESIGN-PATCH-PROMPTS-5.html', 'live', 'Design patch prompts, pass five',
  'The owner-facing page for the fifth patch pass. Runnable in any order; nothing depends on '
  'anything else. NOT YET RUN.'),
 ('tools/design-patch-prompts-4.py', 'tool', 'Design patch prompts — pass four',
  'Generates DESIGN-PATCH-PROMPTS-4.html: the spec-side half of R-48 to R-59, over eight categories. '
  'Carries the FIVE questions that needed no ruling at all — the pack tokens, the main-feed '
  'designation, the dependency declaration, hand-picked order and multi-module designs — in every '
  'prompt, because each was raised in more than one category. Names one job it starts and does not '
  'finish: Image focus is enumerated separately in 21 specs instead of being one shared control, so '
  'P0 gains the definition and the rest need a sweep. That sweep list is DERIVED from the export, '
  'never typed, because a hand-written list of private copies is one more thing to go stale.'),
 ('planning-artifacts/DESIGN-PATCH-PROMPTS-4.html', 'live', 'Design patch prompts, pass four',
  'The owner-facing page for the fourth patch pass — eight prompts, P0 first because it holds two '
  'shared controls every category inherits. NOT YET RUN.'),
 ('tools/design-patch-prompts-3.py', 'tool', 'Design patch prompts — pass three',
  'Generates DESIGN-PATCH-PROMPTS-3.html: the six spec-side halves of the owner\'s nine rulings of '
  '2026-09-02, over seven categories. Small by design — four of the seven close a question the '
  'pass-two session raised rather than answered, which is the behaviour the prompts asked for. '
  'Imports everything shared from the pass-two generator, which imports its own from pass one; only '
  'the work lists are authored. A third file rather than an edit to the second for the same reason '
  'the second was not an edit to the first: each is the record of what was actually sent.'),
 ('planning-artifacts/LIBRARY-QUESTIONS.html', 'record', 'Open questions — the decision sheet, answered',
  'Every question the 33 category specifications still leave open after the 2026-09-02 rulings, as a '
  'sheet the owner answers in the browser: plain-language explanation, numbered options with one '
  'recommended, a note box per item, and a Copy-my-reply button that assembles the lot. Built from '
  'tools/probe/report-template.html, which is the pattern ROUND-4-FINDINGS.html used and the one the '
  'owner has actually decided from before. **ANSWERED 2026-09-03** — seventeen on the recommendation, one (D11) returned as a better answer than either option offered. The rulings are R-48 to R-59 in reconcile-designs-decisions.md §A6; this file is the dated record of what was asked and how it was put, and is not edited.'),
 ('planning-artifacts/DESIGN-PATCH-PROMPTS-3.html', 'live', 'Design patch prompts, pass three',
  'The owner-facing page for the third patch pass — seven prompts, runnable in any order because '
  'nothing here depends on anything else. Carries the six spec-side rulings of 2026-09-02 (R-39 to '
  'R-47, less the three that changed a requirement and landed directly). NOT YET RUN.'),
 ('planning-artifacts/DESIGN-PATCH-PROMPTS-2.html', 'live', 'Design patch prompts, pass two',
  'The owner-facing page for the second patch pass — one prompt per category that has work, P0 '
  'first because the greyed-control treatment is drawn there once and every later category points '
  'at it. NOT YET RUN. Nothing in it is a question: the normative half of every item is already in '
  'the PRD and the spine, and this carries it into the designs. Copy buttons and browser-stored '
  'progress ticks; verify each returned export with tools/verify-design-pass.py.'),
 ('planning-artifacts/DESIGN-PATCH-PROMPTS.html', 'live', 'Design patch prompts, per category',
  'The owner-facing page for the design patch pass — one prompt per category plus P0, with copy '
  'buttons and browser-stored progress ticks. THE PASS RAN on 2026-08-31 and '
  'tools/verify-design-pass.py confirms it: every structural check passes. Kept live because it is '
  'generated and gated, and because re-patching one category is a copy-button away. Rosters DERIVE '
  'from the export, so the design numbers in it cannot drift.'),
 ('tools/derive-control-lines.py', 'tool', 'Derive the Controls: union',
  'Attempts each category\'s Controls: line and does NOT succeed: the specs declare controls in at least four shapes (a per-design `Control | Values` table, a prose line with names before colons, another with names before brackets, and typed enum rows), the granularity differs by an order of magnitude between them — 53 names for one category, 3 for another — and eight categories carry nothing readable at all. Kept because it MEASURES the gap and names the eight, and because the fix is cheap: if every spec carried the per-design Control|Values table A1-A3 already use, this becomes reliable. Do not land its output as-is.'),
 ('tools/derive-module-reach.py', 'tool', 'Which designs declare which script',
  'Re-derives research §2.1\'s "Designs requiring it" and "Trigger in the inventory" columns from the export — they named designs the export superseded (row 2 cited "A1 #11 Sidebar Trigger" when A1 #11 is Side Rail). Counts a module only where a design\'s OWN declaration names it: the per-design Behaviour-module line, or the roster table\'s Module/Declares column. A name appearing in category prose is not a declaration, which is what stops every A1 design claiming accordion by association. A17, A18 and A19 declare only in prose and are reported as gaps rather than guessed at.'),
 ('tools/derive-content-lines.py', 'tool', 'Draft the Content: storage contract',
  'Drafts each category\'s Content: line — the union of every field a design can ask the user to fill in, which is the STORAGE CONTRACT: a field missing from it has nowhere to park when the user switches design, and their words are lost. Per the owner\'s 2026-08-31 ruling it lists only what a user types; Ghost\'s own read values are named in a note instead. Reads the specs\' typed field tables where they exist and their prose Content-fields blocks where they do not. Over-inclusive by design: a spare parking space costs nothing, an omission loses data. A33 is hand-ruled in the file, named rather than silently patched.'),
 ('tools/reapply-export-edits.py', 'tool', 'Re-apply the repo-side export edits',
  'Two edits live in the REPO and cannot survive a Claude Design re-export: the count-agnostic '
  'marketing copy and P0\'s per-prop mark allowlist. The 2026-08-31 pass tried to solve this by '
  'ASKING Claude Design not to undo them, and the 2026-09-01 re-export proved that impossible — '
  'the sessions behaved correctly and said so three times, but a project copy cannot preserve text '
  'it never held. So the edits are re-applied by this script after every export and gated by '
  'verify-design-pass.py: a remembered step became a runnable one. Explicit string pairs, never a '
  'regex, because a generic pattern already shipped "Every design ARE available" once; an unhandled '
  'phrasing is REPORTED and exits non-zero rather than guessed at.'),
 ('tools/verify-design-pass.py', 'tool', 'Did the design pass apply the rulings?',
  'One check per Ghost Build Room ruling, run against the design export: A23 deleted, the numbering holes at A1 #9 and A4 #15 left open, two [Free] per category, no deleted module declared, no render-time hand-off language, no computed byline counts, and so on. Written BEFORE the patched export landed and failing 17 of 18 checks against the pre-patch one, which is how it proves it has teeth. It also GATES the hand edits made to the export on 2026-08-31, which a Claude Design re-export would otherwise silently overwrite: no S or M screen prints a library total, and P0 declares the per-prop mark allowlist. Both had teeth on their first run — they found four screens the manual pass had missed. --extract dumps the per-category fields and modules, marking every spec the parser cannot read rather than reporting an empty list as success.'),
('STEP-5B-PROMPT.txt', 'tool', "The current step's prompt, as plain text to paste",
  'GENERATED by tools/build-board.py from build-sequence.md, alongside BUILD-BOARD.html and from '
  'the same parse — so the copies of this prompt cannot drift. It exists because this is the one '
  'prompt the owner pastes by hand and a .txt is the easiest thing to open and select all. '
  'DO NOT EDIT IT: edit the fenced block in build-sequence.md and regenerate. It was '
  'hand-maintained for a single day and needed re-syncing by hand twice in that day, which is why '
  "it is derived now. `build-board.py --check` fails loudly if it drifts, and doc-audit runs that. "
  'IT FOLLOWS THE CRITICAL PATH: it was STEP-5-PROMPT.txt until step 5 completed on 2026-09-03 and '
  'its source block became a completion record. When 5b completes, move build-board.py\'s PASTE and '
  'PASTE_ID again rather than leaving a generated file with nothing behind it.'),
  ('tools/view-designs.py', 'tool', 'Serve the design export to a local browser',
  'R-75\'s small utility — for SESSIONS eyeballing exported frames over HTTP (support.js loads '
  'React via fetch, which file:// blocks, so the two Index canvases\' links and the mock '
  'interactions need a server). Explicitly NOT the owner\'s deliverable: his static view of the '
  'product is step 5b\'s prototype, which must open from a double-click with no server at all.'),
 ('tools/export-roster.py', 'tool', 'The library roster, from the export',
  'Reads the design export and emits every live category and design as JSON — number, name, '
  'structural tuple, declared modules, one-line descriptor. Refuses to emit when a spec table and '
  'its drawn frame disagree about a name, so a hand-edit to one that misses the other cannot pass '
  'silently. The step-4b deletions (R-24) are applied here, once, with their reason, rather than by '
  'deleting export files. sections-inventory.md and tuple-check.py both read this.'),
 ('tools/inventory-gen.py', 'tool', 'Inventory roster generator',
  'Writes Appendix A\'s totals and the numbered roster of every category in sections-inventory.md '
  'from the export (R-16 — the drawings are the roster). It owns exactly two things per category: '
  'the count in the heading and the lines between its roster markers; the normative prose around '
  'them stays hand-authored. --check is run by doc-audit and fails on drift.'),
 ('tools/tuple-check.py', 'tool', 'FR-G5 tuple gate',
  'Verifies every live design\'s structural tuple, read from the export through '
  'tools/export-roster.py: six slots, five closed sets (the authority for the vocabulary), unique '
  'within each category, contiguous numbering. Mutation-tested — a forced collision and an '
  'out-of-vocabulary slot each turn it red. Run by doc-audit --check; category-prompts.py reads its '
  'sets, so a set change here requires a prompt regeneration.'),
 ('tools/doc-audit.py', 'tool', 'This gate',
  'Generates the index and checks documentation propagation. Exits non-zero on drift.'),
]

GROUPS = [
 ('ux-designs/prototype/', 'live', "Step 5b — the static prototype of Inflozo's own UI",
  "Ruling R-75's deliverable: Inflozo's interface as static HTML the owner opens with a DOUBLE-CLICK and walks "
  '— no server, no build step, relative links only. Start at `index.html`: the surface list, the four journeys '
  'and the eight flows, each as a labelled clickable trail. One page per surface EXPERIENCE.md names, filed by '
  'its stable surface name; a panel, pill, marker, popover or sheet that only exists over another surface gets '
  "a section on its host page instead, and the index lists every one. EVERY PAGE'S FIRST HTML COMMENT NAMES THE "
  'FRAME IT DERIVES FROM (R-74) and the EXPERIENCE.md section it implements, which is what makes fidelity '
  'checkable against the export. `build.py` generates the lot from one registry — so the index cannot claim a '
  'surface that does not exist, or miss one that does — and it refuses to write if any link or anchor is dead. '
  'It is DISPOSABLE BY DESIGN once the dynamic UI matches it. **Step 6 stays shut until the owner says he has '
  'walked it** (R-75); that sentence lives in `build-sequence.md` step 5b.'),
 ('ux-designs/', 'live', 'Step 5 — the UX workspace',
  "bmad-ux's run folder: the two spines (catalogued individually above), the memlog that records "
  'every decision taken during the pass, and the working / imports directories the skill creates. '
  'Nothing here is a second answer to a question the design export already answers — no mocks and '
  'no wireframes were produced, deliberately (see EXPERIENCE.md § Finalize notes). Step 5b\'s '
  'prototype sits beside it in `prototype/` and is not that second answer either: it restates the one '
  'answer in walkable form, page by page, naming its source frame on every page.'),
 ('design/claude-design-export/InflozoOld/', 'retired', 'Design export — the 2026-08-31 issue',
  'The export as it stood BEFORE the pass-two re-export of 2026-09-01, kept by the owner as '
  'provenance. Superseded wholesale by Inflozo/ beside it — nothing derives from this directory, '
  'and every tool points at Inflozo/ explicitly. Useful for one thing only: diffing what a pass '
  'actually changed, which is how A9-12 was found to have been cut when the ruling said keep it. '
  'Do not build from it, and do not let a tool read it.'),
 ('design/claude-design-export/', 'live', 'Design library export — the library itself',
  'Claude Design\'s export, and THE STARTING MATERIAL FOR EVERY UI OR UX TASK — read the WHOLE '
  'directory, never a subset (Index.dc.html and Index - Categories.dc.html are the map — there is no '
  'CLAUDE.md inside it). Far more than the screen frames: the design '
  'system itself (Calibration Set = tokens and type scale, Editor Sidebar Kit = every control and '
  'state, R Responsive System = the archetypes), the S1-S14 app screens, M1-M9 pages, B Missing '
  'Surfaces, C Post Body, P0-0..P0-6 and P0-9 (P0-7 IS the S14 screen and P0-8 is a rules section '
  'with no frames, so the gap is deliberate), every drawn design, a per-category -0 Category Proof carrying '
  'that category\'s tokenisation proof and roster, one spec file per category, THE EXECUTABLE RENDER '
  'KITS (*-kit.js, _build/, interactions.js, support.js), the per-category session prompts and the '
  'original brief. Also THE AUTHORITY on what the library contains — every count derives from here '
  '(tools/export-roster.py), and deleted designs are recorded there with their reason rather than by '
  'deleting a file. Carries hand edits made 2026-08-31 that a re-export would overwrite; '
  'tools/verify-design-pass.py gates them.'),
 ('design/mockups/', 'record', 'Interface mockups (27)',
  'Design prompt 1\'s output: marketing pages, editor, dashboard, deploy, routes, style packs. '
  'Design artifacts are non-normative ON BEHAVIOUR — where one disagrees with the PRD, the PRD wins. That has never meant the visual language is up for grabs: the design export is the component reference, and these 27 are SUPERSEDED by it for anything visual (prompt 2 wins over prompt 1). Consult them for intent, not for components.'),
 ('prds/prd-Inflozo-2026-08-17/review-', 'record', 'PRD review passes',
  'Adversarial, consistency, buildability, Ghost-truth, WYSIWYG and theme-quality reviews across '
  'two stress rounds. Each found real defects; their fixes are in the PRD.'),
 ('.v2.3-backup/', 'retired', 'PRD snapshot v2.3', 'Frozen copy.'),
 ('.v3.0-backup/', 'retired', 'PRD snapshot v3.0', 'Frozen copy.'),
 ('.v4.0-backup/', 'retired', 'PRD snapshot v4.0', 'Frozen copy.'),
 ('spike-compiler/', 'retired', 'The original compiler spike',
  'Retired 2026-08-20 — a second copy of the pipeline missing six rounds of decisions, with both '
  'known defects still live. See its RETIRED.md. The live pipeline is tools/stress/.'),
 ('.memlog.md', 'record', 'Session memory logs', 'Per-workspace decision trail.'),
 ('fixtures-r2/', 'record', 'Round 2 fixtures', 'Checked-in gscan fixtures.'),
 ('validation-report', 'record', 'PRD validation (HTML)', 'Rendered validation reports.'),
 ('tools/probe/csp/', 'tool', 'CSP probe app', 'The minimal Next app behind the CSP measurement.'),
 ('tools/stress/theme/', 'record', 'Generated theme output', 'Build artifact, regenerated by build.js.'),
 ('tools/stress/README.md', 'live', 'Stress fixture README', 'How to run the fixture and the gate.'),
 ('spike-compiler/RETIRED.md', 'retired', 'Retirement notice',
  'Why the spike was retired rather than repaired, with the table of what it is missing.'),
]

SKIP = ('node_modules', '/.git/', 'package-lock.json', '/uploads/')


def short(path):
    """architecture/architecture-Inflozo-2026-08-19/X.md -> architecture/.../X.md"""
    p = path.replace(os.path.join('architecture', 'architecture-Inflozo-2026-08-19'), 'architecture/...')
    return p.replace(os.path.join('prds', 'prd-Inflozo-2026-08-17'), 'prds/...')


def inventory():
    out = []
    for base in (PLAN, os.path.join(ROOT, 'tools')):
        for dirpath, dirnames, files in os.walk(base):
            dirnames[:] = [d for d in dirnames if d != 'node_modules']
            for f in files:
                if not f.endswith(('.md', '.html', '.sql', '.js', '.py', '.sh', '.txt')):
                    continue
                full = os.path.join(dirpath, f)
                rel = os.path.relpath(full, ROOT)
                if any(s.strip('/') in rel for s in SKIP):
                    continue
                out.append(rel)
    return sorted(out)


def describe(rel):
    """Exact entry first, then the first matching group."""
    s = short(rel)
    for path, status, title, blurb in DOCS:
        if s.endswith(path) or path.endswith(s) or s == path:
            return status, title, blurb, True
    for frag, status, title, blurb in GROUPS:
        if frag in rel or frag in s:
            return status, title, blurb, False
    return None


# ─────────────────────────────────────────────────────────────────────────────
def check():
    fails, warns = [], []
    files = inventory()

    # 1. every doc on disk is catalogued
    for rel in files:
        if describe(rel) is None:
            fails.append(f'UNCATALOGUED: {rel} — add it to DOCS or GROUPS in tools/doc-audit.py')

    # 2. every catalogued doc still exists
    for path, _s, title, _b in DOCS:
        tail = path.split('/')[-1]
        if not any(f.endswith(tail) for f in files):
            fails.append(f'CATALOGUED BUT GONE: {path} ("{title}") — remove its entry or restore it')

    # 3. the index is current
    for name in ('INDEX.md', 'INDEX.html'):
        p = os.path.join(PLAN, name)
        if not os.path.exists(p):
            fails.append(f'MISSING: {name} — run --generate')
        else:
            body = open(p, encoding='utf8').read()
            n = len([f for f in files if describe(f) and describe(f)[3]])
            if f'{n} catalogued' not in body:
                fails.append(f'STALE: {name} does not match disk — run --generate')

    # 3b. generated HTML must match its sources
    import subprocess as _sp
    for tool, art, src in (('build-board.py', 'BUILD-BOARD.html', 'build-sequence.md'),
                           ('design-patch-prompts.py', 'DESIGN-PATCH-PROMPTS.html',
                            'the roster or the module registry'),
                           ('design-patch-prompts-2.py', 'DESIGN-PATCH-PROMPTS-2.html',
                            'the roster or a pass-2 work list'),
                           ('design-patch-prompts-3.py', 'DESIGN-PATCH-PROMPTS-3.html',
                            'the roster or a pass-3 work list'),
                           ('design-patch-prompts-4.py', 'DESIGN-PATCH-PROMPTS-4.html',
                            'the roster, a pass-4 work list, or the Image-focus sweep list'),
                           ('design-patch-prompts-5.py', 'DESIGN-PATCH-PROMPTS-5.html',
                            'the roster, the sweep list, or a pass-5 work list'),
                           ('category-prompts.py', 'CATEGORY-PROMPTS.html',
                            'the prompt file or the design export')):
        if _sp.run([sys.executable, os.path.join(ROOT, 'tools', tool), '--check'],
                   capture_output=True).returncode != 0:
            fails.append(f'STALE: {art} does not match {src} — run python3 tools/{tool}')

    # 3c. the structural tuples must stay unique and in vocabulary (FR-G5)
    if _sp.run([sys.executable, os.path.join(ROOT, 'tools', 'tuple-check.py')],
               capture_output=True).returncode != 0:
        fails.append('TUPLE DRIFT: the merged library fails tools/tuple-check.py — '
                     'a tuple collided or left the closed vocabulary')

    # 3d. the inventory's rosters and totals must still match the export (R-16)
    r = _sp.run([sys.executable, os.path.join(ROOT, 'tools', 'inventory-gen.py'), '--check'],
                capture_output=True, text=True)
    if r.returncode != 0:
        fails.append('INVENTORY DRIFT: sections-inventory.md no longer matches the design export — '
                     + (r.stdout.strip().splitlines() or ['see tools/inventory-gen.py --check'])[-1])

    # 4. dangling MEASUREMENTS section references from the spine
    meas = open(os.path.join(ARCH, 'MEASUREMENTS.md'), encoding='utf8').read()
    have = set(re.findall(r'^## (\d+)\.', meas, re.M))
    spine = open(os.path.join(ARCH, 'ARCHITECTURE-SPINE.md'), encoding='utf8').read()
    for n in set(re.findall(r'MEASUREMENTS\.md.{0,6}§(\d+)', spine)):
        if n not in have:
            fails.append(f'DANGLING: the spine cites MEASUREMENTS §{n}, which does not exist')

    # 5. counts that must be derived, never restated (standing rule 3)
    live = {'ARCHITECTURE-SPINE.md': spine,
            'build-sequence.md': open(os.path.join(PLAN, 'build-sequence.md'), encoding='utf8').read(),
            'BACKUP-GATE.md': open(os.path.join(ARCH, 'BACKUP-GATE.md'), encoding='utf8').read()}
    def prose_only(t):
        # A fenced block is a historical PROMPT and a blockquote is a note ABOUT an old figure.
        # Warning on either is noise, and a gate that cries wolf gets ignored — which is the exact
        # failure this whole script exists to prevent.
        t = re.sub(r'```.*?```', '', t, flags=re.S)
        return '\n'.join(l for l in t.split('\n') if not l.lstrip().startswith('>'))

    for name, body in live.items():
        body = prose_only(body)
        for pat, why in ((r'\b3[0-9] invariants\b', 'AD count'),
                         (r'\b(2[0-9]|3[0-9]|4[0-9]) (?:verify-at-build )?items\b', 'register count'),
                         (r'\b[0-9]+ polic(?:y|ies) (?:over|across)\b', 'policy count'),
                         (r'\b[0-9]+ assertions\b', 'assertion count')):
            for m in re.findall(pat, body):
                warns.append(f'RESTATED {why} in {name}: "{m}" — derive it or say why (standing rule 3)')

    # 6. findings recorded as evidence but reaching no owning rule
    reg = open(os.path.join(ARCH, 'VERIFY-AT-BUILD.md'), encoding='utf8').read()
    schema = open(os.path.join(ARCH, 'SCHEMA.sql'), encoding='utf8').read()
    owned = spine + reg + schema
    for fid in sorted(set(re.findall(r'\b(F\d{1,2}|P\d)\b(?=[ ,)：:])', meas))):
        if not re.search(rf'\b{fid}\b', owned):
            warns.append(f'ORPHAN: finding {fid} appears in MEASUREMENTS and reaches no '
                         f'invariant, register item or schema comment')
    return fails, warns


def generate():
    files = inventory()
    rows = []
    for rel in files:
        d = describe(rel)
        if d is None:
            continue
        status, title, blurb, exact = d
        rows.append((rel, status, title, blurb, exact))
    n_exact = len([r for r in rows if r[4]])
    today = subprocess.run(['git', 'log', '-1', '--format=%cs'], cwd=ROOT,
                           capture_output=True, text=True).stdout.strip() or str(datetime.date.today())

    order = {'live': 0, 'tool': 1, 'record': 2, 'retired': 3}
    groups = {}
    for rel, status, title, blurb, exact in rows:
        if not exact:
            key = ('group', title)
            groups.setdefault(key, [status, title, blurb, []])[3].append(rel)
    singles = [r for r in rows if r[4]]

    # ── INDEX.md ───────────────────────────────────────────────────────────────
    md = [f"""---
title: Inflozo — Document Index
generated: by `tools/doc-audit.py --generate` — do not hand-edit
updated: {today}
---

# Document index

**{n_exact} catalogued documents**, plus grouped sets. Generated from disk, so it cannot drift:
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
"""]
    for st in ('live', 'tool', 'record', 'retired'):
        items = [r for r in singles if r[1] == st]
        gs = [g for g in groups.values() if g[0] == st]
        if not items and not gs:
            continue
        md.append(f'\n## {st.title()} — {STATUS[st]}\n')
        md.append('| Document | What it is |\n|---|---|')
        for rel, _s, title, blurb, _e in sorted(items, key=lambda r: r[2]):
            md.append(f'| **[{title}]({rel})**<br>`{short(rel)}` | {blurb} |')
        for _s, title, blurb, members in sorted(gs, key=lambda g: g[1]):
            md.append(f'| **{title}** *({len(members)} files)*<br>`{short(members[0]).rsplit("/",1)[0]}/` | {blurb} |')
        md.append('')
    open(os.path.join(PLAN, 'INDEX.md'), 'w', encoding='utf8').write('\n'.join(md))

    # ── INDEX.html ─────────────────────────────────────────────────────────────
    e = html.escape
    cards = []
    for st in ('live', 'tool', 'record', 'retired'):
        items = sorted([r for r in singles if r[1] == st], key=lambda r: r[2])
        gs = sorted([g for g in groups.values() if g[0] == st], key=lambda g: g[1])
        if not items and not gs:
            continue
        cards.append(f'<section><div class="shead"><span class="dot {st}"></span>'
                     f'<h2>{st.title()}</h2><p class="smeta">{e(STATUS[st])}</p></div><div class="grid">')
        for rel, _s, title, blurb, _x in items:
            cards.append(
                f'<a class="doc" href="{e(os.path.relpath(os.path.join(ROOT, rel), PLAN))}">'
                f'<h3>{e(title)}</h3><code>{e(short(rel))}</code><p>{e(blurb)}</p></a>')
        for _s, title, blurb, members in gs:
            cards.append(f'<div class="doc grp"><h3>{e(title)} <span class="cnt">{len(members)}</span></h3>'
                         f'<code>{e(short(members[0]).rsplit("/",1)[0])}/</code><p>{e(blurb)}</p></div>')
        cards.append('</div></section>')

    open(os.path.join(PLAN, 'INDEX.html'), 'w', encoding='utf8').write(f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inflozo — Document Index</title><style>
:root{{--bg:#fbfaf8;--card:#fff;--ink:#1a1a1a;--muted:#6b6b6b;--line:#e6e2dc;--accent:#1f6feb;
--live:#127a4a;--tool:#1f6feb;--record:#9a6700;--retired:#8b8b8b;--code:#f4f2ef;
--sh:0 1px 2px rgba(0,0,0,.04),0 6px 20px rgba(0,0,0,.05)}}
@media(prefers-color-scheme:dark){{:root:not([data-theme=light]){{--bg:#131316;--card:#1b1b1f;
--ink:#eceaea;--muted:#9d9a98;--line:#2e2e34;--accent:#6ea8fe;--live:#5ed6a0;--tool:#6ea8fe;
--record:#e8bd57;--retired:#7d7d85;--code:#232329;--sh:0 1px 2px rgba(0,0,0,.3),0 6px 20px rgba(0,0,0,.35)}}}}
:root[data-theme=dark]{{--bg:#131316;--card:#1b1b1f;--ink:#eceaea;--muted:#9d9a98;--line:#2e2e34;
--accent:#6ea8fe;--live:#5ed6a0;--tool:#6ea8fe;--record:#e8bd57;--retired:#7d7d85;--code:#232329}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Roboto,sans-serif;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:1120px;margin:0 auto;padding:54px 22px 110px}}
.kick{{color:var(--accent);font-weight:650;font-size:.78rem;letter-spacing:.09em;text-transform:uppercase}}
h1{{font-size:clamp(1.9rem,4vw,2.6rem);letter-spacing:-.022em;margin:.3em 0 .3em;font-weight:720}}
.lede{{color:var(--muted);font-size:1.1rem;max-width:66ch;margin:0 0 8px}}
.legend{{display:flex;flex-wrap:wrap;gap:9px;margin:26px 0 4px}}
.lg{{display:flex;align-items:center;gap:7px;background:var(--card);border:1px solid var(--line);
border-radius:999px;padding:5px 13px;font-size:.83rem;color:var(--muted)}}
.dot{{width:9px;height:9px;border-radius:50%;flex:none}}
.dot.live{{background:var(--live)}}.dot.tool{{background:var(--tool)}}
.dot.record{{background:var(--record)}}.dot.retired{{background:var(--retired)}}
.start{{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:22px 26px;
box-shadow:var(--sh);margin:30px 0 8px}}
.start h2{{font-size:1.06rem;margin:0 0 .5em;font-weight:670}}
.start ul{{margin:0;padding-left:1.1em}}.start li{{margin-bottom:.42em;color:var(--muted)}}
.start b{{color:var(--ink);font-weight:640}}
section{{margin-top:46px}}
.shead{{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px}}
.shead h2{{font-size:1.35rem;margin:0;letter-spacing:-.014em;font-weight:690}}
.smeta{{margin:0;color:var(--muted);font-size:.9rem}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(325px,1fr));gap:14px}}
.doc{{display:block;background:var(--card);border:1px solid var(--line);border-radius:13px;
padding:17px 19px;text-decoration:none;color:inherit;box-shadow:var(--sh);
transition:transform .13s ease,border-color .13s ease}}
a.doc:hover{{transform:translateY(-2px);border-color:var(--accent)}}
.doc h3{{margin:0 0 6px;font-size:1rem;font-weight:665;letter-spacing:-.008em}}
.doc code{{display:inline-block;background:var(--code);border-radius:5px;padding:2px 7px;
font-size:.74rem;color:var(--muted);margin-bottom:9px;
font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all}}
.doc p{{margin:0;font-size:.885rem;color:var(--muted);line-height:1.55}}
.doc.grp{{border-style:dashed}}
.cnt{{background:var(--code);color:var(--muted);border-radius:999px;padding:1px 8px;font-size:.74rem;font-weight:600}}
footer{{margin-top:56px;padding-top:22px;border-top:1px solid var(--line);color:var(--muted);font-size:.87rem}}
</style></head><body><div class="wrap">
<div class="kick">Inflozo</div><h1>Document index</h1>
<p class="lede"><strong>{n_exact} catalogued documents</strong>, plus grouped sets. Generated from
disk by <code>tools/doc-audit.py</code>, so it cannot quietly drift — the same script fails if a
document exists without an entry here.</p>
<div class="legend">
<div class="lg"><span class="dot live"></span>live — current, edit these</div>
<div class="lg"><span class="dot tool"></span>tool — runnable</div>
<div class="lg"><span class="dot record"></span>record — dated, do not edit</div>
<div class="lg"><span class="dot retired"></span>retired — kept for provenance</div>
</div>
<div class="start"><h2>Where to start</h2><ul>
<li><b>Understand the system</b> — the plain-English architecture, then the spine for the rules.</li>
<li><b>Build something</b> — the spine, then the schema, then the PRD section for that area.</li>
<li><b>Check a claim about Ghost</b> — the mechanical verification files, then the research
companions. Both outrank the PRD body.</li>
<li><b>Find what was already tested</b> — the measurements file. Every section carries the command
and its output.</li>
<li><b>Know what is still unverified</b> — the external-facts register.</li>
</ul></div>
{''.join(cards)}
<footer>Generated {e(today)} · regenerate with <code>python3 tools/doc-audit.py --generate</code> ·
verify with <code>--check</code>, which exits non-zero on drift.</footer>
</div></body></html>""")
    return n_exact, len(files)


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else '--check'
    if mode == '--generate':
        n, total = generate()
        print(f'INDEX.md and INDEX.html regenerated — {n} catalogued entries over {total} files.')
        sys.exit(0)
    fails, warns = check()
    for w in warns:
        print(f'  warn  {w}')
    for f in fails:
        print(f'  FAIL  {f}')
    if fails:
        print(f'\n{len(fails)} failure(s). The index or the catalogue is out of date.')
        sys.exit(1)
    print(f'documentation gate: PASS ({len(warns)} warning(s))')
