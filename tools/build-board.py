#!/usr/bin/env python3
"""Inflozo — the build board.

    python3 tools/build-board.py            # regenerate BUILD-BOARD.html from build-sequence.md
    python3 tools/build-board.py --check    # exit non-zero if the board is stale

**The prompts are extracted from `build-sequence.md`, never retyped here.** That file is the source
of truth; this only presents it. A board carrying its own copy of a prompt is a second place for a
prompt to go stale, and this project has been bitten by exactly that shape more than once — most
recently by design prompt 3, which was run against a version missing four required fields.

Status is declared below rather than parsed, because "is this step done" is a judgement about the
world and not a string in a document.
"""
import os, re, sys, html, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAN = os.path.join(ROOT, '_bmad-output', 'planning-artifacts')
SRC  = os.path.join(PLAN, 'build-sequence.md')
OUT  = os.path.join(PLAN, 'BUILD-BOARD.html')

# The prompt for the step the owner is CURRENTLY on is also written as a plain-text file, because
# it is the one he pastes by hand and a .txt is the easiest thing to open and select-all. IT IS
# GENERATED, NOT KEPT IN STEP: it was hand-maintained for one day and had to be re-synced by hand
# twice in that day, which is the silent-drift shape this project keeps getting bitten by. Deriving
# it from the same parse that feeds the board means the copies cannot disagree — and `--check` fails
# loudly if either output is stale, so a remembered step became a runnable one.
#
# IT MOVES WITH THE CRITICAL PATH. On 2026-09-03 step 5 completed, its prompt block was replaced by
# a completion record, and STEP-5-PROMPT.txt lost its source — so the two constants below moved to
# step 5b and the old file was removed. They stayed on 5b while the owner's next action was a walk
# rather than a paste, so that step 6's prompt never sat under his cursor before R-75's gate; on
# 2026-09-04 he walked it, step 6 opened, and the constants moved on again.
PASTE = os.path.join(PLAN, 'STEP-6-PROMPT.txt')
PASTE_ID = '/bmad-create-epics-and-stories'   # the block this file mirrors, matched on its first line

# key, number, title, status, one-line where-it-stands, what it produces, blocked-by
STEPS = [
 ('s1', '1', 'Architecture', 'done',
  'Every invariant (the spine is the count), the schema, and its runnable proof. Four stress '
  'rounds and a reliability '
  'round applied on top.',
  'The architecture spine — the rules everything else is built from.', None),
 ('s2', '2', 'The two E0 spikes', 'done',
  'Both emitters exist and are proven to agree node by node. The platform register is closed to the '
  'limit of what is reachable without a Ghost(Pro) site.',
  'Proof the rich-text model works end to end, and executed results for the whole register.', None),
 ('s3', '3', 'Design prompts 2 and 3', 'done',
  'Every category designed and exported, then patched by the controls-reconciliation pass '
  '(P0 primitives plus one patch per category; 39 decisions, all ruled — four later reversed). '
  'Every spec ends with its own Reconciliation notes — step 4\'s third input.',
  'The archetype system and the app screens (prompt 2); every category\'s designs AND their '
  'specifications (prompt 3).', None),
 ('s4', '4', 'Reconcile designs against the PRD, the architecture and Ghost', 'done',
  'Both halves ran 2026-08-27. 4a reviewed every category spec, P0 and the S/M screens (1,086 '
  'findings, 41 probe families, a 1,078-row owner-flag register). The Ghost Build Room then ruled: '
  'all 66 ghost-infeasible findings and all five decision-collisions closed, FOUR approved decisions '
  'reversed (D3, D17, D26, D27 in half), and four probe families removed — two closed by execution '
  'against T1/T3 during the session, two deleted by the native-search ruling. Nine more rulings '
  '(R-30 \u2026 R-38) were taken on 2026-08-31. Read reconcile-designs-decisions.md \u00a7B before '
  'trusting any D-number anywhere in this project.',
  'prds/.../reconcile-designs.md and reconcile-designs-decisions.md \u2014 every ruling naming the '
  'documents that must move. Its ledger records what has landed \u2014 R-30 \u2026 R-38 on 2026-08-31 '
  '(\u00a7A3) \u2014 and \u00a7A12 holds the step-5b/5c review\u2019s six decisions.', None),
 ('smerge', '4\u00bd', 'The inventory merge', 'done',
  'The specs merged into sections-inventory.md and the inventory is now GENERATED from the design '
  'export and gated, so it cannot drift again. A23 Search deleted whole; the design patch pass run '
  'over every category and verified by tools/verify-design-pass.py; both deferred derivations '
  '(the per-category Content/Controls/Data unions, and research \u00a77\u2019s design lists) '
  'complete; derived-fields-A1-A12.md retired.',
  'An inventory the build can open, that no longer restates a count anywhere.', None),
 ('s5', '5', 'Journeys and flows', 'done',
  'Ran 2026-09-03. ux-designs/ux-Inflozo-2026-09-03/ holds DESIGN.md (a TRANSCRIPTION of the design '
  'export — on any disagreement the export is right and the spine is the bug, R-74) and '
  'EXPERIENCE.md (the IA, the state patterns, the four journeys and the eight flows). Every surface '
  'has one stable name and either points at a drawn frame or names the frame it extrapolates from. '
  'It found the PAYWALL EDITOR ALREADY DRAWN at C Post Body C3a, which \u00a737.7 called missing; and '
  'a library total in S3\u2019s product copy that both controls had been blind to for a THIRD time. '
  'Four rulings in \u00a7A11 of the decisions file (R-76 \u2026 R-79); prd.md FR-D1, FR-J7 and FR-J9 '
  'moved.',
  'Four journeys and eight flows, authored rather than verified — plus a Claude Design prompt per '
  'undrawn surface group in EXPERIENCE.md Appendix A (its ### A headings are the count) \u2014 all run, export landed 2026-09-04, \u00a7A15 verified, A9 drafted for the misses. A8 came out of the step\u2019s own stress test: the export then drew the editor at 1440 and '
  'NOWHERE ELSE, so R-76\u2019s tablet half and the 200%-zoom floor were both prose with no frame '
  'behind them.', None),
 ('s5b', '5b', 'Static prototype', 'done',
  'BUILT 2026-09-03. <b>Double-click '
  '<code>_bmad-output/planning-artifacts/ux-designs/prototype/index.html</code></b> \u2014 no server, '
  'no install, and it reads complete with JavaScript off. One page per surface EXPERIENCE.md names; '
  'every panel, pill, marker, popover and sheet that only exists over another surface is a section of '
  'that page, linked from it and listed on the index. The four journeys and eight flows are each a '
  'labelled, clickable trail. EVERY PAGE\u2019S FIRST HTML COMMENT NAMES THE FRAME IT DERIVES FROM '
  '(R-74) and the EXPERIENCE.md section it implements, so any page can be held against its frame. '
  'Every screen is a frame LIFTED from the export byte-identical, with the annotation around it and '
  'never in it; the frames drawn on the wrong mechanism are shown as drawn with the re-specification '
  'in a note beside them, and the plan limits are Appendix F.1\u2019s table beside the frame. ITS '
  'FRAMES ARE NEVER WIRED \u2014 that was tried and reverted; the clickable build is 5c. The Appendix '
  'A prompts ran and their export landed on 2026-09-04, so the pages that said \u201cnot drawn\u201d now lift '
  'the D canvases.',
  'A walkable static prototype of the product, and <b>R-75\u2019s gate: the owner walking it is what '
  'unlocks step 6</b>. Walked means every journey and every flow on index.html opened end to end and '
  'the date written on the line under build-sequence.md step 5b, The walk, which is his to write; notes '
  'in ux-designs/WALK-NOTES.md were optional. WALKED 2026-09-04 \u2014 the date stands. What he found is '
  'fixed inside the stories that own the screens, from his own test of each deployed story (R-80 as '
  'amended, \u00a7A13).',
  None),
 ('s5c', '5c', 'The walkthrough', 'done',
  "The owner read 5b and said what was true: its annotations — the frame reference, the journey trail, "
  'every state of a surface stacked on one page — are exactly what stop it feeling like the product. '
  'They are also the point of it. So there are TWO BUILDS AND NEITHER REPLACES THE OTHER. '
  'BUILT 2026-09-03. <b>Double-click '
  '<code>_bmad-output/planning-artifacts/ux-designs/walkthrough/index.html</code></b> \u2014 it opens on '
  'Sign In, as a user would meet it, with no scaffolding on a product screen. Every screen is a frame '
  'lifted from the export and patched with links and hooks on the elements it drew. What behaves, read '
  'from the build: menus, popovers and sheets open from the control that raises them and close on Esc, '
  'their drawn Cancel or a click outside; segmented controls, tabs and radio lists pick with the drawn '
  'selected look; the FIRST DEPLOY WALKS ALL SIX STEPS since the Appendix A export of 2026-09-04 \u2014 the '
  'safety-net offer and its declined path, the backup gate with its ghost-backup shortcut, pre-flight with the '
  'drift report, the snapshot gate, ship, live, and Deploy only ends on its own drawn ending \u2014 later deploys '
  'walk four; history pins; the dashboard sheets open; the editor carries the complete switcher, the canvas '
  'markers, the skip link and the 834/720 layouts; P opens Preview, Esc leaves it, L hides Layers, ] and [ '
  'step the ring, every key passing the WCAG 2.1.4 typing guard. NOT in it, and listed in '
  '<code>_screens.html</code> with the reason: detail cards with no drawn trigger, the two wrong-mechanism '
  'frames A7 left (B22, B18 \u2014 prompt A9), and the states no frame draws. <code>_screens.html</code> and <code>_selfcheck.html</code> are the two files '
  'that are not product screens.',
  'The product as a clickable application \u2014 the artifact that answers <b>is this any good</b>, where '
  '5b answers <b>is this screen right</b>. Walked AFTER 5b, for feel; it is not the gate. A change to '
  'the design belongs in both.', None),
 ('s6', '6', 'Epics and stories', 'next',
  'OPEN SINCE 2026-09-04 \u2014 the owner walked 5b and wrote the date under build-sequence.md step 5b, '
  'The walk (R-75). Expands section 8 into stories; it does not re-plan anything. Per R-74 every '
  'story with a surface names the frame it is built from; per R-80 as amended (\u00a7A13) every story '
  'with a screen carries the owner\u2019s manual-test steps and he tests it on the deployed site before '
  'it is done \u2014 what he finds is fixed in that story, not by another design pass first.',
  'The story breakdown.', None),
 ('s6b', '6b', 'Readiness gate', 'later',
  'Two readiness conditions specific to this project, both about the library running sequentially.',
  'Sprint status tracking, and a go/no-go on opening any story.', 'step 6'),
 ('s7', '7', 'The development loop', 'later',
  'Per story: Create \u2192 Dev \u2192 Review \u2192 Deploy \u2192 your test on the live site \u2192 Done, with a '
  'commit and push after every phase (R-81), review and test on the real infrastructure (R-82), every '
  'question to you in plain English with options and one marked RECOMMENDED (R-83). The prompts '
  'below are TEMPLATES with placeholders \u2014 copy the filled-in prompt for a given story from the story '
  'board, STORY-BOARD.html (R-84), which is regenerated on every commit.',
  'Working software, one story at a time, tested by you before it is done.',
  'step 6 producing the first stories'),
]

# which fenced block in build-sequence.md belongs to which step, whether it is safe to run, and a
# NEEDLE — text that occurs in that block and no other. Blocks are matched by needle, never by
# document order: the order once swapped the 5b and 5c prompts between their cards (F-083), and a
# board that pairs a prompt with the wrong step is worse than no board. A historical prompt gets NO
# copy button on purpose.
PROMPTS = [
 ('s1',  'Architecture', 'historical',
  'Complete. Kept for provenance. It states figures that were true when written and are not now.',
  '/bmad-architecture'),
 ('s2',  'Spike (a) — mark emission', 'refuted',
  'Complete, AND one instruction in it is FALSE — it tells you to escape a preceding backslash, '
  'which was executed and disproved. Following it would rebuild a defect four rounds removed. '
  'Read the warning in build-sequence.md before this prompt, never the prompt alone.',
  'Build the FR-D4 mark-emission spike'),
 ('s2',  'Spike (b) — platform verification', 'historical',
  'Complete. Its "21 items" is long out of date; the register has grown every round.',
  'Run the E0 platform-verification spike'),
 ('s4',  '4a — The review (unattended)', 'live', None, '/bmad-review'),
 ('s4',  '4b — The Ghost Build Room (you must be in the room)', 'live',
  'Interactive. Run 4a first; the room reads its report as the agenda and presents each unsettled '
  'item to you as a numbered decision.',
  '/bmad-party-mode --party ghost-build-room'),
 ('s5b', 'Static prototype', 'live',
  'Run it only to REBUILD or extend the prototype. It is already built — double-click\n'
  '  ux-designs/prototype/index.html to walk it. It predates the lift and the unwiring: the frames are\n'
  '  LIFTED byte-identical and NEVER wired (that was tried and reverted). A session reads\n'
  '  prototype/build.py\u2019s docstring first, and the prompt says so.',
  'Build the static prototype'),
 ('s5c', 'The walkthrough', 'live',
  'Run it only to REBUILD or extend the walkthrough. It is already built — double-click\n'
  '  ux-designs/walkthrough/index.html to look at it, after 5b. Read build-app.py\u2019s docstring first.',
  'Rebuild or extend the Inflozo walkthrough'),
 ('s6',  'Epics and stories', 'live',
  'Step 6 is open (2026-09-04); the gate is met \u2014 the owner\u2019s walk of 5b has its date under '
  'build-sequence.md step 5b, The walk (R-75).',
  '/bmad-create-epics-and-stories'),
 ('s6b', 'Readiness gate', 'live', None, '/bmad-sprint-planning'),
 ('s7', 'Create \u2014 the spec (template)', 'template',
  'A template: {E.S} and {spec} are filled in per story. Copy the finished prompt from STORY-BOARD.html.',
  'CREATE THE SPEC ONLY'),
 ('s7', 'Dev \u2014 implement (template)', 'template',
  'A template: copy the finished prompt for a story from STORY-BOARD.html.', 'IMPLEMENT the spec at'),
 ('s7', 'Review (template)', 'template',
  'A template: copy the finished prompt for a story from STORY-BOARD.html.', 'Review story {E.S}'),
 ('s7', 'Deploy (template)', 'template',
  'A template: copy the finished prompt for a story from STORY-BOARD.html.', 'Deploy story {E.S} to the real stack'),
 ('s7', 'Fix \u2014 the owner\u2019s findings (template)', 'template',
  'A template: copy the finished prompt for a story from STORY-BOARD.html.', "FIX the owner's test findings"),
 ('s7', 'Record \u2014 your test, or your answer (template)', 'template',
  'A template: copy the finished prompt for a story from STORY-BOARD.html.', 'I tested story {E.S} on the live site'),
]

# What to do the moment a patched export lands in the design-export folder, in order.
# (command or None, what it is, why it matters / what a failure means)
RUNBOOK = [
 (None,
  'Drop the export in, replacing the folder contents',
  'The zip is authoritative and Inflozo/ is its extraction. Do not hand-merge: replace, then let the '
  'checks below tell you what moved. Two things in there were edited in the REPO rather than in '
  'Claude Design — the count-agnostic marketing copy and P0\u2019s mark allowlist — and step 2 is what '
  'catches it if the re-export undid either.'),
 ('python3 tools/reapply-export-edits.py',
  'Put back the edits a re-export cannot carry',
  'Two edits live in the REPO, not in Claude Design: the count-agnostic marketing copy and '
  'P0\u2019s mark allowlist. The 2026-08-31 pass tried to solve this by ASKING Claude Design not to '
  'undo them \u2014 and the 2026-09-01 re-export proved that impossible. The sessions behaved '
  'correctly and said so three times; the text was lost anyway, because a project copy cannot '
  'preserve what it never held. RUN THIS FIRST, before anything reads the export. It reports any '
  'wording it does not know how to reword rather than guessing.'),
 ('python3 tools/verify-design-pass.py',
  'Did the pass actually apply the rulings?',
  'One check per ruling, run against the export. Every structural check must pass. Six prose scans '
  'come back LOOK by design — they cannot tell a violation from a spec RECORDING that it removed the '
  'thing, so a human reads those six. The last two checks guard the repo-side hand edits: if the '
  're-export put a design total back on a marketing screen, or dropped P0\u2019s mark allowlist, they '
  'go red here rather than months later \u2014 and they are the check behind the step above, so a re-apply that missed something still fails here. It also caught A9-12 being CUT when the ruling said keep the design and remove only its control.'),
 ('python3 tools/export-roster.py > /dev/null && python3 tools/inventory-gen.py --write',
  'Re-derive the library from what was actually drawn',
  'The export is the count. This rewrites the inventory\u2019s totals and every category roster from '
  'it, so no number is ever typed by hand. If a design was cut or renamed in the pass, this is where '
  'it shows up.'),
 ('python3 tools/tuple-check.py',
  'Is every design still structurally distinct?',
  'FR-G5\u2019s gate: six slots, five closed vocabularies, unique within a category, contiguous '
  'numbering. A pass that edits arrangement or media placement can collide two designs without '
  'anyone noticing \u2014 this is what notices.'),
 ('python3 tools/derive-module-reach.py',
  'Re-derive which designs declare which script',
  'A9 loses its filter and A2-13 is gone, so at least two module rows change their design list. '
  'Counts a module only where a design\u2019s OWN declaration names it \u2014 a mention in category prose '
  'is not a declaration, which is what stops every A1 design claiming accordion by association.'),
 ('python3 tools/derive-content-lines.py && python3 tools/derive-control-lines.py',
  'Re-derive the storage contract and the control unions',
  'The Content: line is the STORAGE CONTRACT \u2014 a field missing from it has nowhere to park when a '
  'user switches design, and their words are lost. If the pass added a field to any spec, it has to '
  'reach here or FR-D17\u2019s preservation gate fails on it.'),
 ('python3 tools/doc-audit.py --check',
  'The documentation gate \u2014 run it twice',
  'Catalogue, index, generated artifacts, tuples, inventory-versus-export. The FIRST run after a '
  'change often reports FAIL and fixes itself: its sub-tools regenerate on failure. That is the '
  'tools working. The second run is the one that counts.'),
 (None,
  'Triage what came back \u2014 the only human step',
  'Each prompt was asked to do two things beyond its work list: strike the Open questions that were '
  'already settled and mark the ones that are not, and flag anything it was unsure of rather than '
  'guess (A33\u2019s Ghost class names especially). Read those flags. Anything genuinely open comes to '
  'the owner as a numbered decision \u2014 nobody answers one on his behalf.'),
 (None,
  'Then both generators',
  'python3 build.py in ux-designs/prototype and python3 build-app.py in ux-designs/walkthrough. A '
  'surface that said \u201cnot drawn\u201d now has a frame to lift; a lifted region that no longer '
  'matches its frame fails the build rather than drifting.'),
]


ACTIONS = [
 ('now', 'Step 6 \u2014 the story breakdown. Open since 2026-09-04',
  'You walked 5b on 2026-09-04 and the date stands under build-sequence.md step 5b, The walk. Run '
  'the step-6 prompt below. Two rules ride into every story: R-74, every story with a surface names '
  'its frame; and R-80, your own ruling from the walk \u2014 the UI issues you found are fixed in the '
  'stories that own their screens, not by another design pass \u2014 and they come from YOUR OWN TEST of each '
  'UI story on the deployed site, following the test steps its spec carries, not from notes written in '
  'advance. Then the loop of build-sequence.md '
  'step 7 begins: Create, Dev, Review, Deploy, your test, Fix, Done — a commit and push after every phase '
  '(R-81), review and test on the real infrastructure (R-82), every question to you in plain English with '
  'options (R-83), and STORY-BOARD.html (R-84) is where you watch it and copy each prompt.'), ('soon', 'One Claude Design session is owed \u2014 prompt A9, both halves (R-86)',
  'The Appendix A export landed 2026-09-04 (the previous issue is InflozoOld/, for diffing only), the '
  'runbook ran once, and both builds lift the D canvases. reconcile-designs-decisions.md \u00a7A15 verified '
  'every prompt frame by frame and wrote A9: items 1\u20139 are misses of this export, items 10 onward the '
  'frames the UX pass had deferred. You ruled on 2026-09-04 that both halves run in one session (R-86) and '
  'that a touch device below 834 gets the notice while a tablet gets the editor (R-87) \u2014 so copy the whole '
  'of A9 from APPENDIX-A-PROMPTS.html, export once after, run the runbook once. It blocks nothing.'),
 ('gate', 'Supabase Pro before the live site has real customers',
  'Free has no backups at all. Includes doing one real restore.'),
 ('gate', 'Ghost(Pro) Starter before public launch', 'Blocks launch. Comes up at the end of E13.'),
 ('gate', 'Turn on Dodo renewal reminder', 'Settings, Communication. Off by default.'),
]

def fenced(md):
    return re.findall(r'\n```\n(.*?)\n```\n', md, re.S)


def briefing(md, pos):
    """The `> **Before you paste it** …` blockquote that runs up to the fence at `pos`, with the `> `
    marks stripped, or '' when the prompt has none. build-sequence.md keeps this plain-English note
    beside each remaining prompt; it is extracted here, never retyped, so an edit to it makes the
    board stale."""
    before, quote = md[:pos].rstrip('\n').split('\n'), []
    while before and before[-1].startswith('>'):
        quote.insert(0, before.pop())
    text = '\n'.join(re.sub(r'^>[ \t]?', '', l) for l in quote).strip()
    return text if text.startswith('**Before you paste it**') else ''


def brief_html(text):
    def inl(t):
        t = html.escape(t)
        t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
        t = re.sub(r'(?<!\*)\*([^*\n]+?)\*(?!\*)', r'<i>\1</i>', t)
        return re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    paras = [' '.join(p.split()) for p in re.split(r'\n\s*\n', text) if p.strip()]
    return '<div class="brief">' + ''.join(f'<p>{inl(p)}</p>' for p in paras) + '</div>'


def build():
    md = open(SRC, encoding='utf8').read()
    # A step prompt is a fenced block that either starts with a slash command, or sits under a
    # '### … prompt …' heading (any case: step 7's "### The phase prompts" holds the Deploy and
    # Record prompts, which start with plain text). The union matters: step 5b's prompt starts with
    # plain prose ('Build the static prototype…') and the OLD slash-only filter silently dropped it
    # while the count check still passed — an invisible prompt with a green check — and step 6b's
    # slash prompt sits under a heading with no 'Prompt' in it, so a heading-only anchor drops that
    # one instead. Both signals together cover every shape this file actually has. Each block is
    # paired with the briefing before it.
    heads = [(m.start(), m.group(0)) for m in re.finditer(r'^###[^\n]*$', md, re.M)]
    blocks = []
    for m in re.finditer(r'\n```\n(.*?)\n```', md, re.S):
        body = m.group(1)
        prior = [h for h in heads if h[0] < m.start()]
        under_prompt = prior and 'prompt' in prior[-1][1].lower()
        if body.lstrip().startswith('/') or under_prompt:
            blocks.append((body, briefing(md, m.start())))
    if len(blocks) != len(PROMPTS):
        print(f'  ! build-sequence.md has {len(blocks)} slash-prompts, PROMPTS declares '
              f'{len(PROMPTS)}. Update tools/build-board.py.', file=sys.stderr)
        sys.exit(2)
    date = subprocess.run(['git', 'log', '-1', '--format=%cs'], cwd=ROOT,
                          capture_output=True, text=True).stdout.strip()
    e = html.escape
    by_step, claimed = {}, set()
    for skey, title, kind, note, needle in PROMPTS:
        hits = [i for i, (b, _) in enumerate(blocks) if needle in b]
        if len(hits) != 1:
            print(f'  ! PROMPTS needle {needle!r} matches {len(hits)} blocks in build-sequence.md; '
                  'it must match exactly one. Update tools/build-board.py.', file=sys.stderr)
            sys.exit(2)
        if hits[0] in claimed:
            print(f'  ! two PROMPTS entries claim the same block ({needle!r}).', file=sys.stderr)
            sys.exit(2)
        claimed.add(hits[0])
        by_step.setdefault(skey, []).append((title, kind, note, *blocks[hits[0]]))

    paste = next(((b, br) for b, br in blocks if b.lstrip().startswith(PASTE_ID)), None)
    if paste is None:
        print(f'  ! no {PASTE_ID} block in build-sequence.md — {os.path.basename(PASTE)} not written',
              file=sys.stderr)
        sys.exit(2)
    step_no = re.search(r'STEP-(\w+)-PROMPT', os.path.basename(PASTE)).group(1)
    now_t, now_d = next((t, d) for k, t, d in ACTIONS if k == 'now')
    strip = (f'<section class="strip"><div class="kick">Next action</div><h2>{e(now_t)}</h2><p>{e(now_d)}</p>'
             f'{brief_html(paste[1]) if paste[1] else ""}'
             f'<div class="sa"><button class="copy" data-t="{e(paste[0])}">Copy the step {e(step_no)} prompt</button>'
             '<a class="lnk" href="STORY-BOARD.html">Then watch it on STORY-BOARD.html</a></div></section>')

    LABEL = {'done': 'complete', 'running': 'running now', 'next': 'next up',
             'ready': 'ready when unblocked', 'later': 'later'}
    cards = []
    for key, num, title, status, stands, produces, blocked in STEPS:
        ps = ''
        for ptitle, kind, note, body, brief in by_step.get(key, []):
            warn = f'<p class="pnote {kind}">{e(note)}</p>' if note else ''
            btn = ('' if kind != 'live' else
                   f'<button class="copy" data-t="{e(body)}">Copy prompt</button>')
            ps += (f'<div class="prompt {kind}">{brief_html(brief) if brief else ""}<div class="phead"><h4>{e(ptitle)}</h4>'
                   f'<span class="ptag {kind}">{kind}</span>{btn}</div>{warn}'
                   f'<pre>{e(body)}</pre></div>')
        # stands and produces are authored here and carry their own <b> and <code>; not escaped
        cards.append(f'''<section class="step {status}" id="{key}">
  <div class="shead">
    <span class="snum">{e(num)}</span>
    <div class="stitle"><h2>{e(title)}</h2>
      <a class="badge {status}" href="#{key}">{LABEL[status]}</a></div>
  </div>
  <p class="stands">{stands}</p>
  <dl><dt>Produces</dt><dd>{produces}</dd>
  {'<dt>Waiting on</dt><dd>' + e(blocked) + '</dd>' if blocked else ''}</dl>
  {ps}
</section>''')

    rb = []
    for n, (cmd, title, why) in enumerate(RUNBOOK, 1):
        code = f'<code>{e(cmd)}</code>' if cmd else '<span class="nocmd">no command \u2014 by hand</span>'
        rb.append(f'<li><div class="rbh"><span class="rbn">{n}</span><b>{e(title)}</b></div>'
                  f'{code}<p>{e(why)}</p></li>')

    acts = {'now': [], 'soon': [], 'gate': []}
    for kind, t, d in ACTIONS:
        acts[kind].append(f'<li><b>{e(t)}</b><span>{e(d)}</span></li>')

    open(OUT, 'w', encoding='utf8').write(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inflozo — Build Board</title><style>
:root{{--bg:#fbfaf8;--card:#fff;--ink:#191919;--muted:#6a6a6c;--line:#e5e1db;--code:#f4f2ef;
--accent:#1f6feb;--accent-s:#e9f0fe;--done:#12784a;--done-s:#e2f5ec;--run:#96650a;--run-s:#fff4d9;
--next:#1f6feb;--wait:#8b8b93;--red:#b42318;--red-s:#fdeceb;
--sh:0 1px 2px rgba(0,0,0,.04),0 8px 26px rgba(0,0,0,.055)}}
.runbook{{background:var(--card);border:1px solid var(--line);border-radius:16px;
padding:24px 26px;box-shadow:var(--sh);margin:14px 0 4px}}
.strip{{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--red);border-radius:15px;
padding:18px 24px;box-shadow:var(--sh);margin:26px 0 0}}
.strip h2{{margin:.1em 0 .3em;font-size:1.15rem;letter-spacing:-.01em}}
.strip p{{margin:0 0 10px;color:var(--muted);font-size:.93rem;max-width:80ch}}
.sa{{display:flex;gap:14px;align-items:center;flex-wrap:wrap}}
.lnk{{font-size:.9rem;font-weight:600}}
.brief{{padding:11px 14px;font-size:.9rem;line-height:1.55;border-bottom:1px solid var(--line);background:var(--card)}}
.brief p{{margin:0 0 6px;max-width:82ch}}.brief p:last-child{{margin:0}}
.strip .brief{{border:1px solid var(--line);border-radius:10px;margin:0 0 12px;background:var(--code)}}
.badge{{text-decoration:none}}
.runbook h2{{font-size:1.12rem;margin:0 0 .4em;letter-spacing:-.01em}}
.rblede{{color:var(--muted);font-size:.93rem;margin:0 0 18px;max-width:78ch}}
ol.rb{{list-style:none;margin:0;padding:0;counter-reset:none}}
ol.rb>li{{padding:14px 0;border-top:1px solid var(--line)}}
ol.rb>li:first-child{{border-top:0;padding-top:0}}
.rbh{{display:flex;align-items:center;gap:10px;margin-bottom:7px}}
.rbn{{flex:none;width:22px;height:22px;border-radius:50%;background:var(--accent-s);
color:var(--accent);font-size:.76rem;font-weight:700;display:flex;align-items:center;
justify-content:center}}
.rbh b{{font-size:.99rem;letter-spacing:-.006em}}
ol.rb code{{display:block;background:var(--code);border-radius:7px;padding:8px 11px;
font-size:.82rem;overflow-x:auto;white-space:pre;margin:0 0 7px}}
.nocmd{{display:block;color:var(--muted);font-size:.8rem;font-style:italic;margin:0 0 7px}}
ol.rb p{{margin:0;color:var(--muted);font-size:.9rem;line-height:1.58;max-width:82ch}}
@media(prefers-color-scheme:dark){{:root:not([data-theme=light]){{--bg:#131316;--card:#1b1b20;
--ink:#ecebea;--muted:#9e9b99;--line:#2f2f36;--code:#232329;--accent:#6ea8fe;--accent-s:#1b2a45;
--done:#5ed6a0;--done-s:#112f20;--run:#e8bd57;--run-s:#33280d;--next:#6ea8fe;--wait:#75757e;
--red:#f08b80;--red-s:#3a1a17;--sh:0 1px 2px rgba(0,0,0,.3),0 8px 26px rgba(0,0,0,.36)}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.62 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Roboto,sans-serif;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:940px;margin:0 auto;padding:52px 22px 120px}}
.kick{{color:var(--accent);font-weight:660;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase}}
h1{{font-size:clamp(1.9rem,4.4vw,2.7rem);letter-spacing:-.023em;margin:.28em 0 .3em;font-weight:730}}
.lede{{color:var(--muted);font-size:1.1rem;max-width:66ch;margin:0}}
/* rail */
.rail{{display:flex;gap:6px;margin:30px 0 6px;flex-wrap:wrap}}
.rail a{{flex:1;min-width:96px;text-decoration:none;background:var(--card);border:1px solid var(--line);
border-radius:11px;padding:11px 12px;box-shadow:var(--sh);transition:transform .12s,border-color .12s}}
.rail a:hover{{transform:translateY(-2px);border-color:var(--accent)}}
.rail .n{{font-size:.72rem;color:var(--muted);font-weight:650;letter-spacing:.06em}}
.rail .t{{display:block;color:var(--ink);font-size:.86rem;font-weight:640;margin-top:2px;line-height:1.3}}
.rail .b{{display:inline-block;margin-top:7px;height:4px;width:100%;border-radius:2px;background:var(--line)}}
.rail a.done .b{{background:var(--done)}}.rail a.running .b{{background:var(--run)}}
.rail a.next .b{{background:var(--next)}}.rail a.ready .b{{background:var(--next);opacity:.5}}
/* actions */
.acts{{margin:34px 0 0}}
.act{{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:20px 24px;
box-shadow:var(--sh);margin-bottom:14px}}
.act.now{{border-left:3px solid var(--red)}}
.act.soon{{border-left:3px solid var(--accent)}}
.act.gate{{border-left:3px solid var(--run)}}
.act h3{{margin:0 0 .55em;font-size:1.02rem;font-weight:680}}
.act ol{{margin:0;padding-left:1.2em}}
.act li{{margin-bottom:.75em}}
.act li b{{display:block;font-weight:645}}
.act li span{{display:block;color:var(--muted);font-size:.9rem;margin-top:.15em}}
/* steps */
.step{{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:22px 25px;
box-shadow:var(--sh);margin:14px 0;scroll-margin-top:16px}}
.step.done{{opacity:.72}}
.step.running{{border-color:var(--run)}}
.shead{{display:flex;align-items:center;gap:13px;margin-bottom:10px}}
.snum{{width:34px;height:34px;border-radius:10px;background:var(--accent-s);color:var(--accent);
display:flex;align-items:center;justify-content:center;font-weight:720;font-size:.9rem;flex:none}}
.step.done .snum{{background:var(--done-s);color:var(--done)}}
.step.running .snum{{background:var(--run-s);color:var(--run)}}
.stitle{{display:flex;align-items:center;gap:10px;flex-wrap:wrap}}
.stitle h2{{margin:0;font-size:1.22rem;font-weight:690;letter-spacing:-.012em}}
.badge{{font-size:.72rem;font-weight:660;padding:3px 10px;border-radius:999px;white-space:nowrap}}
.badge.done{{background:var(--done-s);color:var(--done)}}
.badge.running{{background:var(--run-s);color:var(--run)}}
.badge.next,.badge.ready{{background:var(--accent-s);color:var(--accent)}}
.badge.later{{background:var(--code);color:var(--wait)}}
.stands{{margin:0 0 12px;max-width:74ch}}
dl{{margin:0 0 6px;display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;font-size:.92rem}}
dt{{color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.055em;font-weight:660;padding-top:3px}}
dd{{margin:0}}
/* prompts */
.prompt{{margin-top:16px;border:1px solid var(--line);border-radius:12px;overflow:hidden}}
.prompt.refuted{{border-color:var(--red)}}
.phead{{display:flex;align-items:center;gap:10px;padding:11px 14px;background:var(--code);flex-wrap:wrap}}
.phead h4{{margin:0;font-size:.93rem;font-weight:660;flex:1}}
.ptag{{font-size:.68rem;font-weight:680;padding:2px 9px;border-radius:999px;text-transform:uppercase;letter-spacing:.05em}}
.ptag.live{{background:var(--done-s);color:var(--done)}}
.ptag.historical,.ptag.template{{background:var(--code);color:var(--wait);border:1px solid var(--line)}}
.ptag.refuted{{background:var(--red-s);color:var(--red)}}
.pnote{{margin:0;padding:11px 14px;font-size:.87rem;color:var(--muted);border-bottom:1px solid var(--line)}}
.pnote.refuted{{background:var(--red-s);color:var(--red)}}
pre{{margin:0;padding:14px;background:var(--card);overflow-x:auto;font-size:.79rem;line-height:1.5;
font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word}}
.prompt.historical pre,.prompt.refuted pre,.prompt.template pre{{opacity:.6}}
button.copy{{font:inherit;font-size:.8rem;font-weight:640;cursor:pointer;border:1px solid var(--accent);
background:var(--accent);color:#fff;border-radius:8px;padding:5px 13px}}
button.copy:hover{{opacity:.9}}button.copy.ok{{background:var(--done);border-color:var(--done)}}
footer{{margin-top:46px;padding-top:20px;border-top:1px solid var(--line);color:var(--muted);font-size:.86rem}}
</style></head><body><div class="wrap">
<div class="kick">Inflozo</div><h1>Build board</h1>
<p class="lede">Where the project is, what is next, and every prompt ready to copy. Generated from
<code>build-sequence.md</code> — the prompts are extracted from it, never retyped, so the two cannot
drift apart.</p>

<div class="rail">
{''.join(f'<a class="{st}" href="#{k}"><span class="n">STEP {n}</span><span class="t">{e(t)}</span><span class="b"></span></a>' for k,n,t,st,_,_,_ in STEPS)}
</div>

{strip}

<div class="acts">
  <div class="act now"><h3>Do now — time-sensitive</h3><ol>{''.join(acts['now'])}</ol></div>
</div>

<section class="runbook">
  <h2>When the patched export lands \u2014 run these, in this order</h2>
  <p class="rblede">The next export comes from the Appendix A prompts. This is what happens the moment
  its output is dropped into <code>design/claude-design-export/</code>. Every count in this project is
  DERIVED from that export, so most of the list is re-derivation rather than editing \u2014 and the
  one human step is at the end, not the start.</p>
  <ol class="rb">{''.join(rb)}</ol>
</section>

<div class="acts">
  {f'<div class="act soon"><h3>Do soon</h3><ol>{"".join(acts["soon"])}</ol></div>' if acts['soon'] else ''}
  <div class="act gate"><h3>Gates — purchases and checks with triggers</h3><ol>{''.join(acts['gate'])}</ol></div>
</div>

{''.join(cards)}

<footer>Generated {e(date)} from <code>build-sequence.md</code>, which governs on any conflict.
Regenerate with <code>python3 tools/build-board.py</code>. A prompt marked <b>template</b> is filled in per story on STORY-BOARD.html; one marked <b>historical</b> has no
copy button on purpose — one of them contains an instruction that execution disproved.</footer>
</div>
<script>
document.querySelectorAll('button.copy').forEach(b => b.onclick = async () => {{
  try {{ await navigator.clipboard.writeText(b.dataset.t); }} catch (e) {{
    const ta = document.createElement('textarea'); ta.value = b.dataset.t;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }}
  const was = b.textContent; b.textContent = 'Copied'; b.classList.add('ok');
  setTimeout(() => {{ b.textContent = was; b.classList.remove('ok'); }}, 1800);
}});
</script></body></html>''')

    open(PASTE, 'w', encoding='utf8').write(paste[0].rstrip() + '\n')
    return len(blocks)


if __name__ == '__main__':
    if '--check' in sys.argv:
        if not os.path.exists(OUT):
            print('  FAIL  BUILD-BOARD.html missing — run tools/build-board.py'); sys.exit(1)
        if not os.path.exists(PASTE):
            print(f'  FAIL  {os.path.basename(PASTE)} missing — run tools/build-board.py'); sys.exit(1)
        before = open(OUT, encoding='utf8').read()
        before_paste = open(PASTE, encoding='utf8').read()
        build()
        if open(OUT, encoding='utf8').read() != before:
            print('  FAIL  BUILD-BOARD.html was stale and has been regenerated'); sys.exit(1)
        if open(PASTE, encoding='utf8').read() != before_paste:
            print(f'  FAIL  {os.path.basename(PASTE)} had drifted from build-sequence.md '
                  'and has been regenerated'); sys.exit(1)
        print('build board: current'); sys.exit(0)
    n = build()
    print(f'BUILD-BOARD.html regenerated — {n} prompts extracted from build-sequence.md')
    print(f'{os.path.basename(PASTE)} regenerated from the same parse — the copies cannot drift')
