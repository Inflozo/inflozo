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
 # ── the spine and its runnable companions ────────────────────────────────────
 ('architecture/.../ARCHITECTURE-SPINE.md', 'live', 'The architecture',
  'The 36 invariants (AD-1..AD-36) every epic is built from. Each carries what it Binds, what it '
  'Prevents, and its Rule. This is the highest-authority build document — if code and spine '
  'disagree, the spine is wrong or the code is, never "it depends".'),
 ('architecture/.../SCHEMA.sql', 'live', 'The database, complete',
  'Every table, policy, grant, trigger and storage bucket, with the reasoning inline. Applies clean '
  'to a bare PostgreSQL 17 container and to hosted Supabase. The comments are load-bearing: several '
  'record traps that cost a round to find (a column REVOKE is a no-op under a table GRANT, TRUNCATE '
  'ignores RLS).'),
 ('architecture/.../RLS-TEST.sql', 'live', 'The security gate',
  'E1\'s exit criterion and the acceptance test for a restore. 70 assertions, and it ABORTS on '
  'failure — it used to print FAIL and exit 0, which is why six holes survived three rounds. '
  'Mutation-tested: reverting any fix turns it red. Pure SQL, so it runs in psql or the Supabase '
  'dashboard editor.'),
 ('architecture/.../PRELUDE.sql', 'live', 'Container stand-ins',
  'Fakes the Supabase-provided objects (auth, storage, the roles) so the schema and its proof run '
  'against a bare Postgres container. NEVER run against hosted Supabase — its auth.uid() stub would '
  'overwrite the real one with a NULL-returning function and silently disable every policy.'),
 ('architecture/.../MEASUREMENTS.md', 'live', 'Everything executed',
  'The evidence file: 28 sections of things actually run against real infrastructure, each with the '
  'command and its output. Five confident claims in this project have been falsified by execution; '
  'this is where the executions live. The spine cites it rather than restating its numbers.'),
 ('architecture/.../VERIFY-AT-BUILD.md', 'live', 'External-facts register',
  'Every claim about Ghost, Supabase, Vercel or Dodo that code depends on, each with an owning epic '
  'and a status. Started at 21 items and grows whenever the project rests on a new external fact. '
  'Two items are launch-blocking.'),

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
 ('architecture/.../ROUND-4-FINDINGS.html', 'live', 'Round 4 decision sheet',
  'The security findings as a clickable sheet: plain-language explanation, numbered options, one '
  'recommended, a box for questions, and a Copy-my-reply button. This is the artifact the owner '
  'actually used to decide; the decisions taken from it are all applied.'),

 # ── the PRD and its normative companions ─────────────────────────────────────
 ('prds/.../prd.md', 'live', 'The PRD — v4.1, final',
  'What Inflozo is: 130 functional requirements, 9 non-functional, 34 categories, 484 designs, the '
  'binding build order and the epic sequence. Never read whole — §4 build order, §5 FRs, §6 NFRs, '
  '§7 architecture, §8 epics, appendices after that.'),
 ('prds/.../addendum.md', 'live', 'Normative for mechanism',
  'Two mechanisms the PRD body states too loosely to build from: AD1 local-first persistence (the '
  'op-log, the revision comparison) and AD2 the edit-lock protocol. Outranks the PRD body on both.'),
 ('prds/.../sections-inventory.md', 'live', 'Normative for scope',
  'The 484 designs: 34 category declarations, per-category counts, which 70 are free, and the '
  'two-layer schema each design specification slots into. Every count in the project derives from '
  'here rather than being restated.'),
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
  'What the 31 behaviour modules need, and what can be done without JavaScript at all.'),

 # ── process ──────────────────────────────────────────────────────────────────
 ('build-sequence.md', 'live', 'The build sequence',
  'The six steps from finished PRD to first story, what each needs from the owner, and a runnable '
  'prompt for each. Steps 1 and 2 are complete; their prompts are marked historical and one '
  'contains an instruction later proven FALSE, flagged in place rather than deleted.'),
 ('design/claude-design-prompt.md', 'record', 'Design prompt 1 — run',
  'Produced the 27 interface mockups.'),
 ('design/claude-design-prompt-2.md', 'live', 'Design prompt 2 — outstanding',
  'Responsive archetypes, ~25 missing surfaces, the paywall editor. Small, and it is what unblocks '
  'the journeys-and-flows step.'),
 ('design/claude-design-prompt-3-library.md', 'live', 'Design prompt 3 — the critical path',
  'Run once per category, 34 times, producing that category\'s designs AND their full '
  'specifications in one pass. The longest pole in the project; nothing downstream can start '
  'without it.'),
 ('design/derived-fields-A1-A12.md', 'live', 'Derived fields — A1 through A12',
  'The four fields the first 12 exported categories were missing — descriptor, archetype, '
  'structural tuple, no-JS degradation — derived per design from the export\'s own text, never '
  'invented: every underivable gap is marked NEEDS DESIGN ANSWER and rolled up by root cause. '
  'Tuple uniqueness is machine-checked by tools/tuple-check.py. Merges into sections-inventory.md '
  'when the specs land there.'),

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
 ('planning-artifacts/CATEGORY-PROMPTS.html', 'live', 'Category prompts — 34 copy buttons',
  'One paste-ready Claude Design prompt per category. PATCH prompts fix a category already designed '
  '(specification only, no frames touched, designs named individually). BUILD prompts are fully '
  'self-contained — the master brief plus that category. Generated, so the brief inside them cannot '
  'drift from the prompt file.'),
 ('tools/category-prompts.py', 'tool', 'Category prompt generator',
  'Extracts the master brief and the 34-row category table from the prompt file, reads which '
  'categories exist in the design export, and emits one prompt per category. Asserts it parsed every '
  'table row — the first version silently matched 10 of 34 because the notes column is optional.'),
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
 ('tools/doc-audit.py', 'tool', 'This gate',
  'Generates the index and checks documentation propagation. Exits non-zero on drift.'),
]

GROUPS = [
 ('design/claude-design-export/', 'live', 'Design library export — 12 of 34 categories',
  'Claude Design\'s export: 12 per-category spec files and 225 design frames, A1 Headers through '
  'A12 About and Team. The specs predate the prompt correction and carry six of the ten required '
  'fields; the other four are derived in design/derived-fields-A1-A12.md.'),
 ('design/mockups/', 'record', 'Interface mockups (27)',
  'Design prompt 1\'s output: marketing pages, editor, dashboard, deploy, routes, style packs. '
  'Design artifacts are non-normative — where one disagrees with the PRD, the PRD wins.'),
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
                if not f.endswith(('.md', '.html', '.sql', '.js', '.py', '.sh')):
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
                           ('category-prompts.py', 'CATEGORY-PROMPTS.html',
                            'the prompt file or the design export')):
        if _sp.run([sys.executable, os.path.join(ROOT, 'tools', tool), '--check'],
                   capture_output=True).returncode != 0:
            fails.append(f'STALE: {art} does not match {src} — run python3 tools/{tool}')

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
