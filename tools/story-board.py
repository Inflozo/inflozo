#!/usr/bin/env python3
"""Inflozo — the story board (the owner's ruling R-84).

    python3 tools/story-board.py                    # regenerate STORY-BOARD.html
    python3 tools/story-board.py --check            # exit non-zero (and regenerate) if the page is stale
    python3 tools/story-board.py --demo OUT.html    # the same page from an in-memory fixture, marked DEMO DATA

The tracker the owner watches the whole build from: every epic and story, colour-coded by status, each
phase's prompt copyable from the card, the owner's test script on the story, and every question the
build has for him in one inbox.

Everything on it is DERIVED at generation time and nothing is retyped:
  - the epics and stories from `epics.md` (until step 6 writes it, the PRD's §8 epic lines, so the
    board is meaningful on day one and says what to run);
  - the status of each from `implementation-artifacts/sprint-status.yaml` (stdlib parse — it is one
    flat mapping under one key), and from each story's `spec-<E>-<S>-<slug>.md` frontmatter;
  - the history of each from `git log`, reading the R-81 commit shape `Story E.S - Phase - …`;
  - the phase prompts from build-sequence.md step 7, "### The phase prompts", by order and first line;
  - the deferred-work ledger, when it exists.
`--check` regenerates in memory and fails if the file differs, so the gate (tools/doc-audit.py) keeps it
current — and because git output is a source, a new commit makes the page stale on purpose.

The `--demo` fixture feeds markdown strings through the SAME loaders, so it exercises the real parsers
and doubles as this script's self-check: it asserts every lane is populated, the R-83 flags fire, and
each derivation rule below has a story that exercises it.
"""
import os, re, sys, html, subprocess, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAN = os.path.join(ROOT, '_bmad-output', 'planning-artifacts')
IMPL = os.path.join(ROOT, '_bmad-output', 'implementation-artifacts')
OUT = os.path.join(PLAN, 'STORY-BOARD.html')
SEQ = os.path.join(PLAN, 'build-sequence.md')
EPICS = os.path.join(PLAN, 'epics.md')
PRD = os.path.join(PLAN, 'prds', 'prd-Inflozo-2026-08-17', 'prd.md')
STATUS = os.path.join(IMPL, 'sprint-status.yaml')
DEFERRED = os.path.join(IMPL, 'deferred-work.md')
IMPL_REL = os.path.relpath(IMPL, PLAN)                      # the page links specs relatively

_s = importlib.util.spec_from_file_location('dp1', os.path.join(ROOT, 'tools', 'design-patch-prompts.py'))
dp1 = importlib.util.module_from_spec(_s); _s.loader.exec_module(dp1)

e = html.escape

# The six phase prompts under "### The phase prompts" of build-sequence.md step 7, in the order that
# section keeps them, each checked against the first line it is guaranteed to start with. Three start
# with the same /bmad-build line, so order is the identity and the first line is the check — a block
# out of order or reworded fails loudly rather than pairing a prompt with the wrong phase.
PROMPTS = [('Create', '/bmad-build'), ('Dev', '/bmad-build'), ('Review', '/bmad-code-review'),
           ('Deploy', 'Deploy story {E.S} to the real stack'), ('Fix', '/bmad-build'),
           ('Record', 'I tested story {E.S}')]
PROMPT_LABEL = {'Create': 'Create the spec', 'Dev': 'Build it', 'Review': 'Review it',
                'Deploy': 'Deploy it', 'Fix': 'Fix your findings', 'Record': 'Record your test'}
STEPS = ['Create', 'Dev', 'Review', 'Deploy', 'Test', 'Done']           # the stepper, in order
LABEL = {'Dev': 'Build'}                                                # what the owner reads for a phase
PROMPT_FOR = {'Create': 'Create', 'Dev': 'Dev', 'Review': 'Review', 'Deploy': 'Deploy',
              'Test': 'Record', 'Fix': 'Fix', 'Done': None}             # phase → the prompt to run next
PROMPT_COMMIT = {'Record': 'Test'}          # prompt → the commit phase it ends with, where they differ
LANES = [('backlog', 'Backlog'), ('ready', 'Ready'), ('progress', 'In progress'),
         ('review', 'In review'), ('test', 'Deployed, your test'), ('done', 'Done')]
LANE_NAME = dict(LANES)

# The commit vocabulary (R-81): the only phase words a story or step commit may carry.
# `Schema` (R-99, 2026-09-09): a story with a migration pushes it FIRST, on its own, before Dev. It
# ranks with Dev — the story is being built — and is a phase the board must be able to place, or the
# very commit the ruling mandates reads as an unreadable commit (Story 3.6's review, 2026-09-10).
PHASES = ['Create', 'Schema', 'Dev', 'Review', 'Deploy', 'Test', 'Fix', 'Done', 'Blocked']
RANK = {'Create': 0, 'Schema': 1, 'Dev': 1, 'Review': 2, 'Deploy': 3, 'Test': 4, 'Fix': 5, 'Done': 6}
NEXT_AFTER = {None: 'Create', 'Create': 'Dev', 'Schema': 'Dev', 'Dev': 'Review', 'Review': 'Deploy',
              'Deploy': 'Test', 'Test': 'Fix', 'Fix': 'Review', 'Done': 'Done'}  # last commit → the phase now
LANE_OF = {'Create': 'backlog', 'Review': 'review', 'Deploy': 'review', 'Test': 'test',
           'Fix': 'test', 'Done': 'done'}                               # Dev splits on in-progress
BUILD_WORDS = {'ready-for-dev': 'not started', 'in-progress': 'in progress', 'in-review': 'being reviewed',
               'done': 'finished', 'blocked': 'blocked'}
TEST_WORDS = {'pending': 'not yet', 'issues': 'you found issues', 'passed': 'passed', 'none': 'no screen to test'}

# The epics whose stories run one at a time behind the owner's category gate (PRD §4): matched by
# title, so the numbers stay the PRD's and epics.md's business.
GATED_TITLES = ('the shell block', 'the gated library pipeline')
# THE PRODUCTION DOMAINS ARE ON THIS LIST AND WERE NOT. The check looked for `*.vercel.app` — the
# one host this project FORBIDS an owner test to use — and did not know `app.inflozo.com` or
# `inflozo.com`, which are the real deployment every UI story is reviewed and tested against
# ("Every owner test runs on the real production domains, never on a vercel.app preview URL",
# owner 2026-09-04). So a story whose Verification named the live site by its real address was
# told it had named no real service (found on Story 3.4, review 3, 2026-09-08). The preview host
# stays on the list: naming one is still naming a real deployment, it is only the wrong one to
# test on, and that is a different rule than this pill's.
# ANCHORED, BECAUSE THE FIRST WRITING OF IT WAS NOT. `\b(?:app|www)?\.?inflozo\.com` put a word
# boundary in front of an OPTIONAL group, so it matched `owner@inflozo.com`, `my-inflozo.com` and
# the bare words in prose — and this pill is the one thing that tells the owner a spec's
# `## Verification` named no real service (R-82). A spec that merely mentioned a test email
# address cleared the check it exists to fail (review 4, 2026-09-09). Executed both ways in
# `demo()` below, which is the only reason the first version's breadth was invisible.
REAL_SERVICE = re.compile(r'ghost[56]\.inflozo\.com|[\w.-]+\.supabase\.co|[\w.-]+\.vercel\.app|'
                          r'api\.vercel\.com|api\.resend\.com|[\w.-]+\.dodopayments\.com|'
                          r'(?<![\w.@-])(?:app|www)\.inflozo\.com|(?<![\w.@-])inflozo\.com', re.I)

# The same grammar bmad-sprint-planning's sprint_plan.py uses, so the board and the tracker agree on
# what an epic, a story and a status key are (a split story is `2-6a-…`).
EPIC_RE = re.compile(r'^#{1,3}\s*Epic\s+(\d+)\s*:?\s*(.*?)\s*#*\s*$', re.I)
STORY_RE = re.compile(r'^#{2,4}\s*Story\s+(\d+)\.(\d+[a-z]?)\s*:?\s*(.*?)\s*#*\s*$', re.I)
STORY_KEY_RE = re.compile(r'^(\d+)-(\d+[a-z]?)-.+')
SPEC_RE = re.compile(r'^spec-(\d+)-(\d+[a-z]?)-(.+)\.md$')
_P = '|'.join(PHASES)
STORY_COMMIT = re.compile(rf'^Story (\d+)\.(\d+[a-z]?) - ({_P}) - (.*)$')
STEP_COMMIT = re.compile(rf'^Step (\S+) - ({_P}) - (.*)$')
HOTFIX_COMMIT = re.compile(r'^Hotfix - (.*)$')
RETRO_COMMIT = re.compile(r'^Epic (\d+) - Retro - (.*)$')
SHAPED = re.compile(r'^(Story|Step|Hotfix|Epic)\b')        # looks like one of ours; must parse or is listed


def snum(s):
    """'12a' → (12, 'a') so stories sort numerically."""
    m = re.match(r'(\d+)([a-z]?)', s)
    return int(m.group(1)), m.group(2)


# ─────────────────────────────────────────────────────────────────────────────
# Loaders. Each takes TEXT, so the demo fixture runs through the same code.
# ─────────────────────────────────────────────────────────────────────────────

BRIEF_START = '**Before you paste it**'


def fenced(md):
    """[(block, briefing)] for every fenced block. The briefing is the blockquote that starts
    `> **Before you paste it**` and runs up to the fence — the plain-English note build-sequence.md
    keeps beside a prompt — as text with the `> ` marks stripped, or '' when the prompt has none."""
    out = []
    for m in re.finditer(r'^```[^\n]*\n(.*?)\n```[ \t]*$', md, re.M | re.S):
        before, quote = md[:m.start()].rstrip('\n').split('\n'), []
        while before and before[-1].startswith('>'):
            quote.insert(0, before.pop())
        text = '\n'.join(re.sub(r'^>[ \t]?', '', l) for l in quote).strip()
        out.append((m.group(1), text if text.startswith(BRIEF_START) else ''))
    return out


def prompts_from_sequence(seq):
    """(phase prompts by name, step-6 prompt, step-6b prompt, briefings by the same keys) — extracted,
    never retyped."""
    m = re.search(r'^### The phase prompts[^\n]*\n(.*?)(?=^# |\Z)', seq, re.M | re.S)
    assert m, 'build-sequence.md has no "### The phase prompts" section under step 7'
    blocks = fenced(m.group(1))
    assert len(blocks) == len(PROMPTS), (f'"### The phase prompts" has {len(blocks)} fenced blocks and PROMPTS '
                                         f'names {len(PROMPTS)} — add or remove an entry rather than let one vanish')
    phase, briefs = {}, {}
    for (name, first), (block, brief) in zip(PROMPTS, blocks):
        assert block.lstrip().startswith(first), (f'phase prompt {name} (block {len(phase) + 1}) does not start '
                                                  f'with {first!r}: {block.lstrip()[:60]!r}')
        phase[name], briefs[name] = block, brief
    step = {}
    for cmd, key in (('/bmad-create-epics-and-stories', 'step6'), ('/bmad-sprint-planning', 'step6b')):
        hits = [(b, br) for b, br in fenced(seq) if b.lstrip().startswith(cmd)]
        assert len(hits) == 1, f'build-sequence.md has {len(hits)} fenced blocks starting {cmd}, not one'
        step[key], briefs[key] = hits[0]
    return phase, step['step6'], step['step6b'], briefs


def load_epics(text):
    """[{n, title, goal, stories:[{e, s, key, title, as, want, so, ac}]}] from epics.md."""
    epics, cur_e, cur_s, fence = {}, None, None, False
    for line in text.splitlines():
        if re.match(r'^\s{0,3}(```|~~~)', line):
            fence = not fence; continue
        if fence:
            continue
        m = EPIC_RE.match(line)
        if m:
            cur_e = epics.setdefault(int(m.group(1)), {'n': int(m.group(1)), 'title': m.group(2),
                                                        'body': [], 'stories': []})
            cur_s = None; continue
        m = STORY_RE.match(line)
        if m and cur_e:
            cur_s = {'e': cur_e['n'], 's': m.group(2), 'key': f'{m.group(1)}.{m.group(2)}',
                     'title': m.group(3), 'body': []}
            cur_e['stories'].append(cur_s); continue
        if re.match(r'^#{1,2}\s', line):            # another h1/h2: the epic is over
            cur_e = cur_s = None; continue
        if cur_s is not None:
            cur_s['body'].append(line)
        elif cur_e is not None:
            cur_e['body'].append(line)
    out = []
    for n in sorted(epics):
        ep = epics[n]
        ep['goal'] = ' '.join(l.strip() for l in ep['body'] if l.strip()).strip()
        for st in ep['stories']:
            body = '\n'.join(st['body'])
            plain = re.sub(r'\*\*|__', '', body)
            m = re.search(r'As an?\s+(.+?),?\s*\n\s*I want\s+(.+?),?\s*\n\s*So that\s+(.+?)\.?\s*(?:\n\s*\n|\Z)',
                          plain, re.I | re.S)
            st['as'], st['want'], st['so'] = [re.sub(r'\s+', ' ', g).strip() if m else ''
                                              for g in (m.groups() if m else ('', '', ''))]
            ac = body.split('Acceptance Criteria', 1)[1] if 'Acceptance Criteria' in body else ''
            ac = ac.split('\n', 1)[1] if '\n' in ac else ''
            st['ac'] = group_criteria(ac)
            del st['body']
        del ep['body']
        out.append(ep)
    return out


def group_criteria(text):
    """Given/When/Then/And lines → one criterion per Given (a criterion is a list of lines)."""
    crits, cur = [], []
    for line in text.splitlines():
        s = re.sub(r'^\s*[-*]\s+', '', line).strip()
        if not s or re.match(r'^#', s):
            continue
        if re.match(r'^\**Given\b', s, re.I) and cur:
            crits.append(cur); cur = []
        cur.append(s)
    if cur:
        crits.append(cur)
    return crits


def load_prd_epics(text):
    """PRD §8's `**E<n> · <title>** — *goal*` lines, E0 upward, with no stories — the day-one fallback."""
    out = []
    for m in re.finditer(r'^\*\*E(\d+) · (.+?)\*\* — (.*)$', text, re.M):
        g = re.match(r'\*(.+?)\*', m.group(3))
        out.append({'n': int(m.group(1)), 'title': m.group(2),
                    'goal': g.group(1) if g else m.group(3)[:200], 'stories': []})
    assert out, 'the PRD has no `**E<n> · <title>** —` lines in §8'
    return out


def load_status(text):
    """The flat `development_status:` mapping, stdlib only. Returns {key: status} keyed BOTH by the yaml
    string (`1-3-magic-link…`, `epic-1`) and, for a story key, by the (epic, story) tuple derive() uses."""
    st, inside = {}, False
    for line in text.splitlines():
        if re.match(r'^development_status:\s*(#.*)?$', line):
            inside = True; continue
        if not inside:
            continue
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        if not line[0].isspace():                    # the next top-level key ends the mapping
            break
        m = re.match(r'^\s+([^\s:#]+)\s*:\s*([^#]*)', line)
        if m:
            key, val = m.group(1), m.group(2).strip().strip('\'"')
            st[key] = val
            k = STORY_KEY_RE.match(key)
            if k:
                st[(int(k.group(1)), k.group(2))] = val
    return st


def parse_spec(rel, text):
    """A bmad-build spec: frontmatter + the sections the board reads. `rel` is ROOT-relative."""
    fm, body = {}, text
    m = re.match(r'^---\r?\n(.*?)\r?\n---\r?\n?(.*)$', text, re.S)
    if m:
        for line in m.group(1).splitlines():
            k = re.match(r'^([A-Za-z_][\w-]*):\s*(.*)$', line)
            if k:
                fm[k.group(1)] = re.sub(r'\s+#.*$', '', k.group(2)).strip().strip('\'"')
        body = m.group(2)
    body = re.sub(r'<!--.*?-->', '', body, flags=re.S)
    body = re.sub(r'</?frozen-after-approval[^>]*>', '', body)
    secs = {}
    parts = re.split(r'^## +(.+?)[ \t]*$', body, flags=re.M)
    for i in range(1, len(parts), 2):
        secs[parts[i].replace('’', "'").strip().lower()] = parts[i + 1].strip()

    def sec(name):
        return secs.get(name.lower(), '')

    tasks_text = sec('Tasks & Acceptance')
    tasks = [(x.lower() == 'x', t) for x, t in re.findall(r'^\s*[-*] \[( |x|X)\] (.*)$', tasks_text, re.M)]
    ac_text = tasks_text.split('Acceptance Criteria', 1)[1] if 'Acceptance Criteria' in tasks_text else ''
    ac = [t for t in re.findall(r'^\s*[-*] (?!\[)(.*)$', ac_text, re.M)]
    codemap = [t.strip() for t in re.findall(r'^\s*[-*] (.*)$', sec('Code Map'), re.M)]
    return {'rel': rel, 'fm': fm, 'status': fm.get('status', ''), 'owner_test': fm.get('owner_test', ''),
            'plain': sec('In plain English'), 'tasks': tasks, 'ac': ac, 'codemap': codemap,
            'questions': question_blocks(sec('Questions for the owner')),
            'test': parse_test(sec("Owner's manual test")), 'findings': sec("Owner's test findings"),
            'real_service': bool(REAL_SERVICE.search(sec('Verification')))}


def parse_test(text):
    """The manual test as a table when it is one, otherwise the numbered list it is (or raw text)."""
    if not text:
        return None
    rows = [l.strip() for l in text.splitlines() if l.strip().startswith('|')]
    if len(rows) >= 2 and re.match(r'^\|[\s:|-]+\|$', rows[1]):
        cells = lambda r: [c.strip() for c in r.strip('|').split('|')]
        return {'kind': 'table', 'head': cells(rows[0]), 'rows': [cells(r) for r in rows[2:]]}
    steps, cur = [], None
    for line in text.splitlines():
        m = re.match(r'^\s*\d+[.)]\s+(.*)$', line)
        if m:
            cur = [m.group(1)]; steps.append(cur)
        elif cur is not None and line.strip():
            cur.append(line.strip())
    if steps:
        return {'kind': 'list', 'steps': [' '.join(s) for s in steps]}
    return {'kind': 'text', 'text': text}


def test_steps(t):
    """A table or a numbered list → [{do, see, dummy, where}], the two-line form the owner reads.
    Table columns are found by their heading words, never by position."""
    if t['kind'] == 'table':
        head = [h.lower() for h in t['head']]

        def col(*words):
            return next((i for i, h in enumerate(head) if any(w in h for w in words)), None)

        c = {'do': col('what to do', 'do'), 'see': col('see'), 'dummy': col('dummy', 'type', 'data'),
             'url': col('url', 'where'), 'screen': col('screen')}
        out = []
        for r in t['rows']:
            g = lambda k: (r[c[k]] if c[k] is not None and c[k] < len(r) else '').strip()
            blank = ('', '—', '-', 'n/a', 'none')
            out.append({'do': g('do'), 'see': g('see'), 'dummy': g('dummy') if g('dummy').lower() not in blank else '',
                        'where': ' · '.join(x for x in (g('screen'), g('url')) if x.lower() not in blank)})
        return out
    if t['kind'] == 'list':
        out = []
        for s in t['steps']:
            m = re.match(r'^(.*?)[\s—–-]*\byou should see\b[:\s]*(.*)$', s, re.I | re.S)
            out.append({'do': (m.group(1) if m else s).strip(' —–-'), 'see': m.group(2).strip() if m else '',
                        'dummy': '', 'where': ''})
        return out
    return None


# The two lines a question block is cut on, in one place: the ruling label, and an option.
# The optional parenthetical is the owner's date — `Ruled (owner, 2026-09-05): option 1` is a label
# with a colon even unbolded, and the colon must be seen past it (review, 2026-09-06).
RULING_RE = re.compile(
    r'\s*(\**)\s*(Answer|Answered|Ruled|Ruling|Decision)\b(\**\s*(?:\([^)]*\))?\s*:?)\**\s*(.*)$', re.I)
OPTION_RE = re.compile(r'^\s*\d+[.)]\s+\S', re.M)      # .match() per line, .search() per block


def ruled_line(line):
    """True on a ruling label that carries a ruling. An empty `**Ruled:**` is a placeholder a
    spec leaves for the owner, and reading it as an answer hides a live question from his inbox —
    which is exactly what it did to two of Story 1.1's (owner, 2026-09-04).

    The label must also LOOK like a label — **bold**, or followed by a colon. Prose whose wrapped
    line merely begins "answer …" or "ruling …" is neither, and reading it as a ruling hides the
    question the same way: it marked Story 1.5's tab-order question Ruled and kept it out of the
    owner's inbox, and a line in 1.4's spec had been misread the same way unnoticed
    (owner, 2026-09-05). Erring towards "not ruled" only ever shows a question that is already
    answered; erring the other way loses one."""
    m = RULING_RE.match(line)
    if not (m and m.group(4).strip(' *:')):
        return False
    return bool(m.group(1)) or ':' in m.group(3)


# THE OWNER'S SIGNATURE, AND IT IS WHAT MAKES A RULING A RULING — not the word "Ruled".
# A ruling is a DATED DECISION HE MADE: `(owner, 2026-09-05)`, `(the owner, 2026-09-09)`,
# `*(owner, 2026-09-04)*`, or a bare `(2026-09-08)` beside his name in the prose. Measured across
# every spec in this repository when this contract landed: 50 of the 51 blocks the old heuristic
# called answered carry it, and the ONE that does not is the misfile that produced this rule —
# `**Ruled:** _(awaiting the owner)_ …`, which names the owner and carries a date and was read as
# an answer because the words after the colon were not empty (owner, 2026-09-09).
RULED_STAMP = re.compile(r'\(\s*(?:the\s+)?owner[^)]*?20\d\d-\d\d-\d\d\s*\)'
                         r'|\(\s*20\d\d-\d\d-\d\d\s*\)', re.I)
# ...AND THE SECOND ALTERNATIVE IS ONLY EVER A DATE **BESIDE HIS NAME IN THE PROSE**, which is what
# the paragraph above always said and what the pattern alone does not say. Without this, a ruling
# whose prose merely CITES a dated decision — `**Ruled:** option 1 — Dev shipped it (2026-09-09).`,
# `… it follows the rule set at (2026-09-02).` — signed itself, and the board kept a question the
# owner had never seen out of his inbox. That is the same failure the contract below was written to
# end, in its fourth shape (review, 2026-09-09). Measured before the change: of the 76 question
# blocks in this repository, ZERO change state under this rule — every real ruling already names
# him, so the guard costs nothing and closes the hole.
NAMES_HIM = re.compile(r'\bowner\b', re.I)
# The one way to say "still his" — a fixed token, so it can never be mistaken for a decision. It
# may carry a note after it (what Dev shipped meanwhile, say); the token is what the board reads.
OPEN_MARK = re.compile(r'_\(awaiting the owner\)_', re.I)


def answered(blk):
    """True when the block carries a ruling the OWNER signed and dated.

    THIS IS A CONTRACT, NOT A HEURISTIC, AND THAT IS THE WHOLE POINT. Three times the board read
    an open question as answered and kept it out of the owner's inbox — Story 1.1's two, Story
    1.5's tab-order, and Story 3.5's Question 3 — and three times the answer was to tighten a
    guess about prose: first "the label must carry words", then "the label must look like a
    label". Each tightening held until someone wrote a placeholder in a shape nobody had
    predicted, because a rule that infers a DECISION from the SHAPE OF A SENTENCE has no floor.

    So the inference is gone. A question is answered when its ruling carries `RULED_STAMP` — the
    owner's name and the date he ruled — and it is open otherwise, which is the safe direction:
    erring towards "not ruled" only ever shows a question that is already answered, while erring
    the other way loses one. And nothing sits silently in the wrong state either, because
    `unclassifiable_questions()` FAILS THE GATE on a block that claims a ruling without the stamp
    and is not marked open. Flag, do not guess (standing rule 6).
    """
    if OPEN_MARK.search(blk):
        return False
    part = _ruling_part(blk)
    # A DATE IS NOT A SIGNATURE UNLESS IT IS HIS. `NAMES_HIM` is the other half of the stamp.
    if not NAMES_HIM.search(part):
        return False
    return any(ruled_line(l) and RULED_STAMP.search(l) for l in blk.splitlines()) \
        or bool(RULED_STAMP.search(part))


def _ruling_part(blk):
    """The block from its ruling label down — where the stamp is allowed to live, so a date in the
    ASK ("Raised at Dev, 2026-09-09") is never mistaken for the owner having signed anything."""
    lines = blk.splitlines()
    cut = next((i for i, l in enumerate(lines) if ruled_line(l)), None)
    return '' if cut is None else '\n'.join(lines[cut:])


def split_question(blk):
    """(the ask, the options, the ruling) as markdown — the three parts R-83 gives every question.
    The ruling is found first, because it may quote an option number of its own."""
    lines = blk.splitlines()
    cut = next((i for i, l in enumerate(lines) if ruled_line(l)), len(lines))
    opt = next((i for i, l in enumerate(lines[:cut]) if OPTION_RE.match(l)), cut)
    j = '\n'.join
    return j(lines[:opt]).strip(), j(lines[opt:cut]).strip(), j(lines[cut:]).strip()


def question_blocks(text):
    """One block per question: a `###` heading or a 'QUESTION n' line starts one; else the whole section.
    R-83 says each carries numbered options and a (RECOMMENDED) mark — both are checked, not assumed."""
    if not text.strip():
        return []
    # `**1. …**` is the shape the specs actually use. An option line starts with a bare digit, never
    # with `**`, so requiring the asterisks keeps the two apart — before this, a section written that
    # way read as ONE question and hid the rest (spec 1.2 had four inside one).
    # ...and a heading follows a BLANK LINE. A wrapped prose line that merely begins "Question 1"
    # is not one: Story 3.4's Question 4 ruling wraps onto "Question 1 still decides. Executed on
    # the live site as …", which started a block of its own and put a sentence fragment in the
    # owner's inbox as an unanswerable open question (review 3, 2026-09-08). It is `ruled_line`'s
    # lesson in the other regex — prose that begins like a label is not a label — and every bare
    # `Question N` line in every spec today is prose, so the check costs nothing and the four
    # outside a Questions section were only ever invisible by luck.
    # A BLANK LINE, NOT THE EXACT BYTES `\n\n`. `endswith('\n\n')` is false for a CRLF spec and
    # false for a "blank" line holding a space or a tab, and this check DROPS a heading it does not
    # recognise — so the question under it merged into the one above and vanished from the owner's
    # inbox, which is the very failure the check was added to prevent, in the other direction
    # (review 4, 2026-09-09). Erring towards "keep" only ever shows a question twice.
    # ...AND THE BLANK LINE IS ONLY ASKED OF THE SHAPES THAT NEED IT. A `###` at the start of a
    # line is unambiguously a heading — that is what makes it one in Markdown, blank line above or
    # not — and requiring one dropped `### Question 2` written directly under a paragraph or a
    # list item, merging its question into the one above and losing it from the owner's inbox: the
    # exact failure this check was added to prevent, arriving from the other side for the second
    # time (review 5, 2026-09-09). The guard exists for the BARE shapes — `Question 1` and
    # `**2.`— which are the ones a wrapped prose line can imitate. A `#` heading cannot be
    # imitated by wrapped prose, so it never needed the guard.
    blank_before = re.compile(r'\n[ \t]*\r?\n$')
    hard_heading = re.compile(r'^#{3,6}\s')
    starts = [m.start() for m in re.finditer(
        r'^(?:#{3,6}\s+|\**\s*(?:QUESTION|Question|Q)\s*\d+|\*\*\d+[.)]\s)', text, re.M)
        if m.start() == 0 or hard_heading.match(m.group()) or blank_before.search(text[:m.start()])]
    # Prose ahead of the first real question is a PREAMBLE, not a question. Spec 2.3 opens its
    # section with one sentence ("Two decisions from the review…") and the synthetic block below
    # read it as a headless, optionless, unruled question — one that sat "open" in the owner's
    # inbox for ever, because nothing can ever rule a sentence (review 3, 2026-09-08). It is only
    # dropped when it carries NEITHER options NOR a ruling: a real question written without a
    # heading still has its options, and erring towards "keep" only ever shows one question twice
    # while erring the other way loses one — `ruled_line`'s own reasoning.
    # ...AND IT IS DROPPED ONLY IF IT DOES NOT ASK ANYTHING. The pop below removes a first block
    # with no options and no ruling — which is ALSO the exact shape R-83 exists to flag, so a
    # genuinely shapeless question written without a heading was being discarded instead of
    # reported (the board's own fixture asserts shapeless questions are real: `assert not
    # q32[0]['options']`). Review 4 dismissed this for want of a signal that could tell a preamble
    # from a question; a QUESTION MARK is that signal, and it costs nothing — spec 2.3's preamble
    # ("Two decisions from the review. Both are yours.") carries none (review 5, 2026-09-09).
    # It is read off the block's whole TEXT and not off `parts[0]`: a one-line block has its line
    # in the title and an EMPTY `ask`, so the mark would never have been seen there.
    preamble = bool(starts) and starts[0] != 0
    if not starts or starts[0] != 0:
        starts = [0] + starts
    out = []
    for a, b in zip(starts, starts[1:] + [len(text)]):
        blk = text[a:b].strip()
        if not blk:
            continue
        first = re.sub(r'^#+\s*|\*', '', blk.split('\n', 1)[0]).strip()
        # THE STATE IS READ, NEVER INFERRED (see `answered`): a ruling the owner signed and dated,
        # or the `_(awaiting the owner)_` token, and a block that is neither fails the gate rather
        # than being guessed at — `unclassifiable_questions()` below.
        ask, opts, ruled = split_question(blk)
        if len(first) > 110:
            first = first[:110].rsplit(' ', 1)[0] + ' …'
        else:                                   # the head already carries it whole; don't say it twice
            ask = ask.split('\n', 1)[1].strip() if '\n' in ask else ''
        out.append({'title': first, 'text': blk,
                    'options': bool(OPTION_RE.search(blk)),
                    'recommended': '(RECOMMENDED)' in blk,
                    'answered': answered(blk), 'parts': (ask, opts, ruled)})
    if preamble and out and not out[0]['options'] and not out[0]['answered'] \
            and '?' not in out[0]['text']:
        out.pop(0)
    return out


def unclassifiable_questions(specs):
    """Every question whose state the board cannot READ — a block that claims a ruling but carries
    neither the owner's dated signature nor the open token.

    THIS IS WHY THE BOARD CAN BE THE SOURCE OF TRUTH. Its old failure was silent: it decided, it
    decided wrongly, and the page looked exactly as confident either way, so a question the owner
    had never seen sat marked `ruled` until he happened to read the block. A generator that would
    rather guess than stop cannot be an authority. This one stops: the gate runs
    `story-board.py --check` on every commit, so a spec that leaves a question in an unreadable
    state cannot be committed at all, and the page can only ever be built from questions whose
    state was stated rather than inferred.

    Returns (story key, heading, the offending ruling) per offender."""
    bad = []
    for key, spec in specs.items():
        for q in (spec or {}).get('questions', []):
            ruling = q['parts'][2]
            if not ruling or q['answered'] or OPEN_MARK.search(q['text']):
                continue
            # ONE LINE PER OFFENDER, NAMING ITSELF, because `doc-audit.py` reports a refusing tool
            # by its LAST line of stderr: a message split across lines showed the gate the ruling
            # with no story and no question on it (executed 2026-09-09). The key is a `(epic, s)`
            # tuple internally and `3.5` to everyone else.
            k = f'{key[0]}.{key[1]}' if isinstance(key, tuple) else str(key)
            bad.append(f'{k} · {q["title"][:70]} — carries {" ".join(ruling.split())[:80]!r}')
    return bad


def load_specs(files):
    """{(epic, story): spec} from [(rel path, text)] whose basename is spec-<E>-<S>-<slug>.md."""
    specs = {}
    for rel, text in files:
        m = SPEC_RE.match(os.path.basename(rel))
        if m:                                       # exact segment equality: 1-1 never matches 1-10
            specs[(int(m.group(1)), m.group(2))] = parse_spec(rel, text)
    return specs


def load_commits(lines):
    """`hash<TAB>date<TAB>subject` lines, newest first → the shaped commits (R-81): story, step, hotfix
    and retro, plus every subject that STARTS like one of those and does not parse ('unreadable'), so
    a typo in a phase word is listed rather than silently dropped."""
    out = []
    for line in lines:
        parts = line.split('\t', 2)
        if len(parts) != 3:
            continue
        h, d, s = parts
        m = STORY_COMMIT.match(s)
        if m:
            out.append({'h': h, 'date': d, 'kind': 'story', 'e': int(m.group(1)), 's': m.group(2),
                        'key': f'{m.group(1)}.{m.group(2)}', 'phase': m.group(3), 'msg': m.group(4)})
            continue
        m = STEP_COMMIT.match(s)
        if m:
            out.append({'h': h, 'date': d, 'kind': 'step', 'key': f'Step {m.group(1)}',
                        'phase': m.group(2), 'msg': m.group(3)})
            continue
        m = HOTFIX_COMMIT.match(s)
        if m:
            out.append({'h': h, 'date': d, 'kind': 'hotfix', 'key': 'Hotfix', 'phase': '', 'msg': m.group(1)})
            continue
        m = RETRO_COMMIT.match(s)
        if m:
            out.append({'h': h, 'date': d, 'kind': 'retro', 'key': f'Epic {m.group(1)}', 'phase': 'Retro',
                        'msg': m.group(2)})
            continue
        if SHAPED.match(s):
            out.append({'h': h, 'date': d, 'kind': 'unreadable', 'key': '', 'phase': '', 'msg': s})
            continue
        # Everything else — board tooling, planning, the design passes. Kept (owner, 2026-09-05) so the
        # feed is the whole history rather than the story-shaped slice of it, and greyed where it renders.
        out.append({'h': h, 'date': d, 'kind': 'other', 'key': '', 'phase': '', 'msg': s})
    return out


def dup_dw_ids(text):
    """The DW ids used more than once. An id is an IDENTITY — every cite, and every sweep that
    keys on one, resolves to whichever entry it meets first, so a repeat silently loses the other.
    It happened inside one story: Story 3.4's third review spent DW-72 and its Fix spent it again
    (found at review 6, 2026-09-09), and nothing in the gate could see it."""
    ids = re.findall(r'^### (DW-\d+):', text, re.M)
    return sorted({i for i in ids if ids.count(i) > 1}, key=lambda i: int(i.split('-')[1]))


def load_deferred(text):
    """The DW-<n> entries of deferred-work.md; a ledger with no headings is read as bullets."""
    out = []
    heads = list(re.finditer(r'^### (DW-\d+):\s*(.+?)\s*$', text, re.M))
    for i, m in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
        blk = text[m.end():end]
        f = {k: re.sub(r'\s+', ' ', v).strip()                  # a field runs on over indented lines
             for k, v in re.findall(r'^(\w+):[ \t]*(.*(?:\n[ \t]+\S.*)*)$', blk, re.M)}
        org = f.get('origin', '')
        st = re.search(r'\bStory (\d+\.\d+)', org)                        # 'Story 1.2 review (…)'
        out.append({'id': m.group(1), 'title': m.group(2), 'status': f.get('status', 'open'),
                    'severity': f.get('severity', ''), 'reason': f.get('reason', ''),
                    'plain': f.get('plain', ''),      # the owner's sentence; reason is the developer's
                    'origin': org, 'location': f.get('location', ''),
                    # `resolution:` is the canonical companion to a close; `closed:` is what the
                    # hand-written entries used. Kept APART, never folded: a resolution is not
                    # evidence of closure — see dw_closed.
                    'closed': f.get('closed', ''), 'resolution': f.get('resolution', ''),
                    'story': st.group(1) if st else ''})
    if not out:
        out = [{'id': '', 'title': t, 'status': 'open', 'severity': '', 'reason': '', 'plain': '',
                'origin': '', 'location': '', 'closed': '', 'resolution': '', 'story': ''}
               for t in re.findall(r'^[-*] (.*)$', text, re.M)]
    return out


def dw_closed(d):
    """Is this entry finished? Read from the STATUS WORD — the first token, stripped of the markdown
    a hand-written entry wraps it in (`**closed**`).

    The ledger's canonical vocabulary is `open` and `done <date>` — the format that owns the file,
    `.claude/skills/bmad-loop-sweep/deferred-work-format.md` § *When a deferred item is later
    completed*. `closed` is what the entries written by hand before that format arrived say. BOTH
    must read as closed, and until 2026-09-11 this board read only `closed`: every entry closed the
    canonical way counted as still OPEN, so the owner's test of Story 3.9 saw `15 closed` while 43
    were, and the 26 that story closed were scattered through the open severity chips.

    A `resolution:` line is NOT evidence of closure and is deliberately not consulted here: the five
    entries Story 3.9 part-closed each carry one while staying `open`, their code landed and their
    proof owed. Reading it as a close would have marked unproved work done — the exact failure
    standing rule 2 names."""
    word = re.sub(r'[^a-z]', '', d['status'].split(' ')[0].lower())
    return word in ('done', 'closed') or bool(d['closed'])


# ─────────────────────────────────────────────────────────────────────────────
# Derivation: where a story is, and what runs next.
# ─────────────────────────────────────────────────────────────────────────────

def derive(story, status, specs, commits):
    """Sets lane, phase, issues, blocked, handoff, unverified, spec, commits on the story.

    Two readings are taken and the LATER wins: the commit trail (R-81 makes one per phase) and the
    tracker + spec frontmatter. Done comes only from a Done commit, `owner_test: passed`, or
    `owner_test: none` once a Deploy commit exists — a tracker or spec `done` alone is the review
    writing done before the owner's test (R-80), so it reads as In review, phase Deploy. Deployed
    means a Deploy commit, nothing else. `owner_test: issues` is stale once a Fix commit is newer
    than the Test commit that reported them."""
    key = (story['e'], story['s'])
    st = status.get(key, 'backlog')
    spec = specs.get(key)
    ss = spec['status'] if spec else ''
    ot = spec['owner_test'] if spec else ''
    mine = [c for c in commits if c['kind'] == 'story' and (c['e'], c['s']) == key]
    phases = [c['phase'] for c in mine]                                  # newest first
    trail = [p for p in phases if p != 'Blocked']
    deployed = 'Deploy' in trail
    fixing = 'Fix' in trail and ('Test' not in trail or trail.index('Fix') < trail.index('Test'))
    by_trail = NEXT_AFTER[trail[0] if trail else None]
    if ot == 'passed' or (ot == 'none' and deployed):
        by_status = 'Done'
    elif ot == 'issues' and not fixing:
        by_status = 'Fix'
    elif ot == 'pending' and deployed:
        by_status = 'Test'
    elif 'done' in (st, ss):
        by_status = 'Deploy'
    elif st == 'review' or ss == 'in-review':
        by_status = 'Review'
    elif st in ('ready-for-dev', 'in-progress') or ss in ('ready-for-dev', 'in-progress'):
        by_status = 'Dev'
    else:
        by_status = 'Create'
    phase = max(by_trail, by_status, key=RANK.get)
    lane = LANE_OF.get(phase) or ('progress' if 'in-progress' in (st, ss) else 'ready')
    screen = bool(spec and (spec['test'] or ot in ('pending', 'issues', 'passed')))
    story.update(status=st, spec=spec, commits=mine, phase=phase, lane=lane, issues=phase == 'Fix',
                 handoff=phase == 'Test' and screen,                    # the owner's move
                 blocked=(bool(phases) and phases[0] == 'Blocked') or 'blocked' in (st, ss),
                 unverified=RANK[phase] >= RANK['Review'] and not (spec and spec['real_service']),
                 waits=None)


def gate_epic(ep):
    """PRD §4: in the two library epics only the first open story runs; the rest wait on the one before."""
    if not any(g in ep['title'].lower() for g in GATED_TITLES):
        return
    prev, opened = None, False
    for s in ep['stories']:
        if s['lane'] != 'done':
            if opened:
                s['waits'] = prev
            opened = True
        prev = s['key']


def epic_status(ep, status):
    if ep['stories']:
        if all(s['lane'] == 'done' for s in ep['stories']):
            return 'done'
        return 'progress' if any(s['lane'] != 'backlog' for s in ep['stories']) else 'backlog'
    return {'in-progress': 'progress'}.get(status.get(f"epic-{ep['n']}", 'backlog'), 'backlog') \
        if status.get(f"epic-{ep['n']}") != 'done' else 'done'


def plain_sentence(st):
    """Until a spec exists: the story's As-a / I-want / So-that as one plain sentence. "I want to X"
    reads "can X"; "I want the X …" reads "wants the X …" — the verb decides, so no "can the app"."""
    if not st['as']:
        return ''
    want = st['want']
    verb = f"can {re.sub(r'^to\s+', '', want)}" if re.match(r'^to\s', want, re.I) else f'wants {want}'
    s = f"A {st['as']} {verb}"
    return s + (f", so that {st['so']}." if st['so'] else '.')


def fill(prompt, story):
    spec = story['spec']
    path = spec['rel'] if spec else f"_bmad-output/implementation-artifacts/spec-{story['e']}-{story['s']}-*.md"
    return prompt.replace('{E.S}', story['key']).replace('{spec}', path)


def lab(phase):
    return LABEL.get(phase, phase)


# ─────────────────────────────────────────────────────────────────────────────
# Rendering
# ─────────────────────────────────────────────────────────────────────────────

def md(s):
    """Escape, then the inline marks the specs use: **bold**, `code`, [text](url), bare URLs."""
    s = e(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<!\*)\*([^*\n]+?)\*(?!\*)', r'<i>\1</i>', s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\[([^\]]+)\]\((https?://[^)\s]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)
    s = re.sub(r'(?<![">=])(https?://[^\s<)]+)', r'<a href="\1" target="_blank" rel="noopener">\1</a>', s)
    return s.replace('(RECOMMENDED)', '<span class="tag good">RECOMMENDED</span>')


def mdblock(text):
    """Paragraphs, bullet and numbered lists, and ### sub-headings — enough for a spec section."""
    out, buf, kind = [], [], None

    def flush():
        nonlocal buf, kind
        if not buf:
            return
        if kind == 'p':
            out.append(f'<p>{md(" ".join(buf))}</p>')
        else:
            out.append(f'<{kind}>' + ''.join(f'<li>{md(i)}</li>' for i in buf) + f'</{kind}>')
        buf, kind = [], None

    for line in text.splitlines():
        s = line.strip()
        if not s:
            flush(); continue
        if re.match(r'^#{1,6}\s', s):
            flush(); out.append(f'<h4>{md(s.lstrip("# "))}</h4>'); continue
        m = re.match(r'^[-*]\s+(.*)', s)
        k = 'ul' if m else None
        if not m:
            m = re.match(r'^\d+[.)]\s+(.*)', s)
            k = 'ol' if m else 'p'
        if k == 'p':
            if kind in ('ul', 'ol') and line[:1].isspace():
                buf[-1] += ' ' + s               # an indented continuation of the last item
            else:
                if kind != 'p':
                    flush()
                kind = 'p'; buf.append(s)
        else:
            if kind != k:
                flush()
            kind = k; buf.append(m.group(1))
    flush()
    return f'<div class="md">{"".join(out)}</div>'


def render_test(story):
    t, key = story['spec']['test'], story['key']
    steps = test_steps(t)
    if steps is None:
        body = mdblock(t['text'])
    else:
        items = []
        for i, s in enumerate(steps, 1):
            where = f' <span class="fine">— {md(s["where"])}</span>' if s['where'] else ''
            dummy = (f'<div class="dummy">Type <code>{e(s["dummy"])}</code> '
                     f'<button class="cpv" data-text="{e(s["dummy"])}">Copy</button></div>' if s['dummy'] else '')
            see = f'<div class="see"><b>You should see:</b> {md(s["see"])}</div>' if s['see'] else ''
            items.append(f'<li><label><input class="tick" type="checkbox" data-k="{e(key)}:{i}"> '
                         f'<b>Do:</b> {md(s["do"])}{where}</label>{dummy}{see}</li>')
        body = '<ol class="steps">' + ''.join(items) + '</ol>'
    return (f'<div class="tbox" data-sub="test"><h3>Your test, on the live site</h3>{body}'
            '<p class="fine">Ticks are stored in this browser only, as a convenience. Your ruling still '
            'goes through chat — tell me what you found, passed or not.</p></div>')


# Severity word to tone. A word with no row reads grey — unrated, not safe.
SEV_TONE = {'critical': 's-crit', 'high': 's-crit', 'medium': 's-warn', 'low': 's-info'}
TONE_ORDER = ['s-crit', 's-warn', 's-info', 's-mute', 's-good']

NO_OPTIONS = ("This one arrived without options. Don't answer it yet — the next session on this story "
              "will rewrite it properly.")
NO_RECOMMENDED = 'No option is marked RECOMMENDED yet — you can still answer by number.'


def render_questions(story):
    qs = [q for q in story['spec']['questions']] if story['spec'] else []
    if not qs:
        return ''
    part = {False: [], True: []}
    for q in qs:
        flag = ''
        if not q['answered'] and not q['options']:
            flag = f'<span class="flag">{e(NO_OPTIONS)}</span>'
        elif not q['answered'] and not q['recommended']:
            flag = f'<span class="flag">{e(NO_RECOMMENDED)}</span>'
        ask, opts, ruled = q['parts']
        body = ''.join(f'<div class="qpart {cls}"><h5>{lbl}</h5>{mdblock(txt)}</div>'
                       for cls, lbl, txt in (('ask', 'The question', ask),
                                             ('opts', 'Your options', opts),
                                             ('ruled', 'Ruled', ruled)) if txt)
        part[q['answered']].append(
            f'<li><details><summary class="plh">'
            f'<b>{md(q["title"])}</b>'
            f'<span class="st {"s-good" if q["answered"] else "s-warn"} solid">{"ruled" if q["answered"] else "open"}</span>'
            f'</summary><div class="q">{body}'
            f'{("<p class=flags>" + flag + "</p>") if flag else ""}</div></details></li>')
    when = ('Answer any time — it does not block your test.' if story['phase'] == 'Test'
            else 'Answer in chat, by number.')
    body = (f'<ul class="pl acc">{"".join(part[False])}</ul>' if part[False]
            else '<p class="fine">Nothing is waiting on you here — every question below has been ruled.</p>')
    if part[True]:
        body += (f'<h4 class="sub">Ruled <span class="fine">{len(part[True])}</span></h4>'
                 f'<ul class="pl acc">{"".join(part[True])}</ul>')
    n = len(part[False])
    return (f'<div class="qbox{" quiet" if not n else ""}" data-sub="questions">'
            f'<h3>Questions for you <span class="fine">{n} open</span></h3>{body}'
            f'<p class="fine">{when} A question is written in plain English with numbered options and one '
            'marked RECOMMENDED (R-83).</p></div>')


def dw_entry(d, closed, tone):
    """One deferred entry as an accordion: the head is always visible, the detail opens."""
    st = 's-good' if closed else 's-mute' if d['status'] in ('', 'open') else 's-warn'
    head = (f'<summary class="plh"><b>{e(d["id"] + " · " if d["id"] else "")}{md(d["title"])}</b>'
            + (f'<span class="st {tone} solid">{e(d["severity"])}</span>' if d['severity'] else '')
            + f'<span class="st {st} solid">{e(d["status"] or "open")}</span>'
            + (f'<a class="st s-mute" href="#{e(d["story"])}">Story {e(d["story"])}</a>' if d['story'] else '')
            + '</summary>')
    # The owner reads the first line; `reason` is the developer's note under it.
    # A part-closed entry carries a `resolution:` while it is still open, so the label follows the
    # STATE — calling that "Closed" would tell the owner work was finished that still owes its proof.
    note = d['closed'] or d['resolution']
    body = ((f'<p class="lede">{md(d["plain"])}</p>' if d['plain'] else '')
            + (f'<p class="why"><b>{"Closed" if closed else "Resolution"}:</b> {md(note)}</p>' if note else '')
            + (f'<p class="why">{md(d["reason"])}</p>' if d['reason'] else '')
            + (f'<span class="where">{e(d["location"])}</span>' if d['location'] else '')
            + (f'<span class="from">Raised by {e(d["origin"])}</span>' if d['origin'] else ''))
    return f'<li class="{tone}"><details>{head}{body}</details></li>'


def phchip(phase, label=None):
    """The phase pill. `p-<Phase>` carries the colour, so a table row can wear the same class."""
    return f'<span class="ph p-{e(phase)}">{e(label if label is not None else phase)}</span>' if phase else ''


def plain_state(spec):
    """'Build: being reviewed · Your test: not yet' — the frontmatter in the owner's words."""
    bits = []
    if spec['status']:
        bits.append(f'Build: {BUILD_WORDS.get(spec["status"], spec["status"])}')
    if spec['owner_test']:
        bits.append(f'Your test: {TEST_WORDS.get(spec["owner_test"], spec["owner_test"])}')
    return ' · '.join(bits)


NO_SCREEN = "no screen — say 'done' in chat and the Record prompt closes it"

# The amber pill's own explanation. It is a reminder, not a verdict, and saying so is the whole point:
# this project's rule is never to print a key, so a Verification written by the book can name every
# service it hit by variable name and still trip a check that looks for an address.
UNVERIFIED_NOTE = (
    '<div class="flag"><b>What the amber “Verification names no real service” note means</b>'
    '<p>Every story has to be checked against the <b>real</b> services before it goes live — the live '
    'database, the live hosting, the email and payment services, or the two test blogs — never against '
    'a stand-in copy. That is your ruling R-82.</p>'
    '<p>This page checks one thing automatically: do the story\'s <b>Verification</b> notes name the '
    '<b>address</b> of one of those real services? On this story it does not, so the note is lit.</p>'
    '<p><b>It does not mean the checking was skipped.</b> It means nobody can tell from that section '
    'alone. It commonly lights up on a story that really was checked properly, because the project '
    'forbids writing a password down, so the notes name each service by its label rather than its '
    'address. The note goes out as soon as the Verification notes mention the address of a real '
    'service. If you are unsure which it is, ask in chat and I will say which services that story '
    'actually touched.</p></div>')
PASTE_HOW = 'Paste it into a Claude Code chat exactly as copied, top to bottom.'


def render_story(story, ep, phase_prompts, briefs):
    spec, key, kid = story['spec'], story['key'], story['key'].replace('.', '-')
    phase = story['phase']
    cur = STEPS.index('Test' if phase == 'Fix' else phase)
    stepper = ''.join(
        f'<li class="{"issues" if (phase == "Fix" and i == cur) else "cur" if i == cur else "done" if i < cur or phase == "Done" else ""}">{lab(s)}</li>'
        for i, s in enumerate(STEPS))
    plain = (spec and spec['plain']) or plain_sentence(story)
    parts = [f'<header><span class="ebadge">E{ep["n"]} · {e(ep["title"])}</span>'
             f'<h2><span class="key">{e(key)}</span> {e(story["title"])}</h2>'
             f'<p class="meta"><span class="lanechip {story["lane"]}">{e(LANE_NAME[story["lane"]])}</span> '
             + phchip(phase, lab(phase))
             + (' <span class="tag crit">blocked</span>' if story['blocked'] else '')
             + (' <span class="tag warn long">Verification names no real service</span>' if story['unverified'] else '')
             + (f' <span class="fine">{e(plain_state(spec))}</span>' if spec and plain_state(spec) else '')
             + '</p></header>']
    if story['unverified']:
        parts.append(UNVERIFIED_NOTE)
    parts.append(mdblock(plain) if plain else '<p class="fine">No plain-English summary yet — the Create phase writes one.</p>')
    parts.append(f'<ol class="stepper">{stepper}</ol>')
    pk = PROMPT_FOR[phase]
    if story['waits']:
        parts.append(f'<div class="now"><b>Waits for {e(story["waits"])} — the owner\'s gate.</b> '
                     '<span class="fine">Its prompt appears here once that story is done.</span></div>')
    elif phase == 'Test':
        if spec and spec['test']:
            parts.append(render_test(story))
            lead = '<b>When you have tested:</b> tell me what you saw in chat, then paste this'
        else:
            lead = f'<b>No screen to test.</b> Say \'done\' in chat, then paste this — it closes the story'
        parts.append(f'<div class="now">{lead} <button class="btn copy" data-copy="pr-{kid}-Record">Copy the Record prompt</button>'
                     f'<span class="fine">{PASTE_HOW}</span></div>')
    elif pk:
        parts.append(f'<div class="now"><b>Next: {e(PROMPT_LABEL[pk])}</b> '
                     f'<button class="btn copy" data-copy="pr-{kid}-{pk}">Copy prompt</button>'
                     f'<span class="fine">{PASTE_HOW}</span></div>')
    parts.append(render_questions(story))
    if spec and spec['test'] and phase != 'Test':
        parts.append(render_test(story))
    if spec and spec['findings']:
        parts.append(f'<h3>Your test findings</h3>{mdblock(spec["findings"])}')
    eng = []
    ac = spec['ac'] if spec and spec['ac'] else None
    if ac:
        eng.append('<h3>Acceptance criteria</h3><ul class="md">' + ''.join(f'<li>{md(a)}</li>' for a in ac) + '</ul>')
    elif story.get('ac'):
        eng.append('<h3>Acceptance criteria</h3><ul class="md">' + ''.join(
            '<li>' + '<br>'.join(md(l) for l in c) + '</li>' for c in story['ac']) + '</ul>')
    if spec and spec['tasks']:
        n = sum(1 for d, _ in spec['tasks'] if d)
        eng.append(f'<h3>Tasks <span class="fine">{n} of {len(spec["tasks"])} ticked</span></h3><ul class="tasks">'
                   + ''.join(f'<li class="{"done" if d else ""}">{md(t)}</li>' for d, t in spec['tasks']) + '</ul>')
    if spec and spec['codemap']:
        eng.append('<h3>Files this story touches</h3><ul class="md">' + ''.join(f'<li>{md(c)}</li>' for c in spec['codemap']) + '</ul>')
    if story['commits']:
        eng.append('<h3>Commits</h3><table class="ct">' + ''.join(
            f'<tr class="{("p-" + e(c["phase"])) if c["phase"] else "s-mute"}"><td>{e(c["date"])}</td>'
            f'<td><code>{e(c["h"])}</code></td><td>{phchip(c["phase"])}</td>'
            f'<td>{e(c["msg"])}</td></tr>' for c in story['commits']) + '</table>')
    else:
        eng.append('<h3>Commits</h3><p class="fine">None yet. Every phase ends with one: '
                   f'<code>Story {e(key)} - Phase - one line</code>.</p>')
    # Open by default (owner, 2026-09-05): this is where a story's own commits live, and hiding them
    # behind a click was the reason the activity panel was being asked to do that job.
    parts.append(f'<details class="eng" open><summary>For the build session</summary>{"".join(eng)}</details>')
    if not story['waits']:
        ran = {c['phase'] for c in story['commits']}          # the trail is what actually ran (R-81)
        done = [p for p, _ in PROMPTS if p != pk and PROMPT_COMMIT.get(p, p) in ran]
        todo = ([pk] if pk else []) + [p for p, _ in PROMPTS if p != pk and p not in done]

        # One container, the shape Questions and Your test already use: the accordions live inside it
        # and `Completed n` is a subheading within the same box, not a second box beside it.
        def one(p):
            return (f'<li class="{"cur" if p == pk else ""}"><details class="pr">'
                    f'<summary class="plh"><b>{p} — {e(PROMPT_LABEL[p])}</b>'
                    + ('<span class="st s-info solid">now</span>' if p == pk else '')
                    + ('<span class="st s-good solid">done</span>' if p in done else '')
                    + f'<button class="btn copy" data-copy="pr-{kid}-{p}">Copy prompt</button></summary>'
                    + (f'<div class="brief">{mdblock(briefs[p])}</div>' if briefs.get(p) else '')
                    + f'<pre id="pr-{kid}-{p}">{e(fill(phase_prompts[p], story))}</pre></details></li>')
        body = (f'<ul class="pl acc prl">{"".join(one(p) for p in todo)}</ul>' if todo
                else '<p class="fine">Every phase of this story has run — they are all under Completed below.</p>')
        if done:
            body += (f'<h4 class="sub">Completed <span class="fine">{len(done)}</span></h4>'
                     f'<ul class="pl acc prl">{"".join(one(p) for p in done)}</ul>')
        parts.append(f'<div class="pbox" data-sub="prompts">'
                     f'<h3>Every prompt for this story <span class="fine">{len(todo)} left</span></h3>{body}'
                     f'<p class="fine">{PASTE_HOW}</p></div>')
    links = []
    if spec:
        links.append(f'<a href="{e(os.path.relpath(os.path.join(ROOT, spec["rel"]), PLAN))}">the spec file</a>')
    links.append(f'<a href="{e(IMPL_REL)}/epic-{ep["n"]}-context.md">epic {ep["n"]} context</a>')
    links.append('<a href="epics.md">epics.md</a>')
    parts.append('<p class="links">' + ' · '.join(links) + '</p>')
    return f'<section class="sd" id="sd-{kid}" hidden>{"".join(parts)}</section>'


def render_card(story, ep):
    kid = story['key'].replace('.', '-')
    pk = PROMPT_FOR[story['phase']]
    # A leading space and one after the key, so a search for 1.1 never matches inside 1.10.
    search = ' '.join(['', story['key'], story['title'], (story['spec'] or {}).get('plain', '') or plain_sentence(story),
                       lab(story['phase']), LANE_NAME[story['lane']], f'E{ep["n"]}', ep['title']]).lower()
    cls = ' '.join(filter(None, ['card', story['lane'], 'issues' if story['issues'] else '',
                                 'blocked' if story['blocked'] else '']))
    if story['waits']:
        btn = f'<span class="fine">waits for {e(story["waits"])} — the owner\'s gate</span>'
    else:
        btn = (f'<button class="cp" data-copy="pr-{kid}-{pk}" title="Copy the {pk} prompt">Copy prompt ›</button>' if pk else '')
    tag = ''
    if story['issues']:
        tag = '<span class="tag crit">issues</span>'
    elif story['handoff']:
        tag = '<span class="tag warn">your move</span>'
    elif story['phase'] == 'Test':
        tag = f'<span class="fine">{e(NO_SCREEN)}</span>'
    if story['blocked']:
        tag += '<span class="tag crit">blocked</span>'
    if story['unverified']:
        tag += '<span class="tag warn long">Verification names no real service</span>'
    return (f'<article class="{cls}" data-e="{ep["n"]}" data-key="{e(story["key"])}" data-s="{e(search)}" id="c-{kid}">'
            f'<div class="ch"><span class="ebadge">E{ep["n"]}</span><span class="key">{e(story["key"])}</span>'
            + phchip(story["phase"], lab(story["phase"])) + '</div>'
            f'<h3>{e(story["title"])}</h3>'
            f'<div class="cf">{btn}{tag}<a class="more" href="#{e(story["key"])}" aria-label="open story {e(story["key"])}">Details</a></div></article>')


def next_action(ctx, stories):
    """(kind, title, why, prompt text or None, link or None, briefing text)."""
    br = ctx['briefs']
    if not ctx['have_epics']:
        return ('setup', 'Run step 6 — the story breakdown',
                'The stories are not written yet. Copy this prompt into a Claude Code chat; when that session '
                'finishes it saves its work and this page fills itself — press reload.', ctx['step6'], None, br['step6'])
    if not ctx['have_status']:
        return ('setup', 'Run step 6b — the readiness gate',
                'The stories are written but the tracker (sprint-status.yaml) is not, so every story shows as '
                'backlog. Copy this prompt into a Claude Code chat; it checks readiness and writes the tracker — '
                'press reload when it says it has saved.', ctx['step6b'], None, br['step6b'])
    yours = [s for s in stories if s['handoff']]
    if yours:
        s = yours[0]
        return ('you', f'Your test — story {s["key"]}, {s["title"]}',
                'It is live on the real site. Open the story, follow the numbered steps, and tell me in '
                'chat what you saw. Then this prompt records your verdict.',
                fill(ctx['phase_prompts']['Record'], s), f'#{s["key"]}/test', br['Record'])
    rank = {'Fix': 0}
    lane_rank = {'review': 1, 'progress': 2, 'ready': 3, 'backlog': 4}
    open_ = [s for s in stories if s['lane'] != 'done' and not s['waits']]
    if not open_:
        return ('done', 'Every story is done', 'Nothing is open. The launch gates are on the build board.', None, None, '')
    s = min(open_, key=lambda x: (rank.get(x['phase'], lane_rank.get(x['lane'], 5)), x['e'], snum(x['s'])))
    pk = PROMPT_FOR[s['phase']]
    if s['phase'] == 'Test':
        why = f'{s["title"]}. It is deployed and has no screen for you to test — say \'done\' in chat, then this prompt closes it.'
    else:
        why = (f'{s["title"]}. It is in the {LANE_NAME[s["lane"]].lower()} column at the {lab(s["phase"])} phase; '
               'copy the prompt and paste it into a Claude Code chat.')
    return ('run', f'Story {s["key"]} — {PROMPT_LABEL[pk]}', why, fill(ctx['phase_prompts'][pk], s), f'#{s["key"]}', br[pk])


CSS = """
:root{--good:var(--build);--good-s:var(--build-s);--warn:var(--patch);--warn-s:var(--patch-s);
--crit:#b42318;--crit-s:#fdeceb;--wait:#8b8b93;--rail:238px;--on:#fff;
--l-backlog:#8b8b93;--l-backlog-s:#f2f1ef;--l-ready:#0f8a86;--l-ready-s:#e0f4f3;
--l-progress:#1f6feb;--l-progress-s:#e9f0fe;--l-review:#7847cc;--l-review-s:#f1eafc;
--l-test:#96650a;--l-test-s:#fff4d9;--l-done:#12784a;--l-done-s:#e2f5ec;}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--crit:#f08b80;--crit-s:#3a1a17;--wait:#75757e;--on:#15151a;
--l-backlog:#75757e;--l-backlog-s:#26262c;--l-ready:#4fc9c2;--l-ready-s:#102c2b;
--l-progress:#6ea8fe;--l-progress-s:#1b2a45;--l-review:#b494f5;--l-review-s:#281c40;
--l-test:#e8bd57;--l-test-s:#33280d;--l-done:#5ed6a0;--l-done-s:#112f20}}
/* One lane, one colour. Every element that belongs to a lane carries the pair and paints from it,
   so a new lane is two tokens and one row here rather than a rule per element. */
.card,.lane,.pill,.lanechip{--c:var(--l-backlog);--cs:var(--l-backlog-s)}
.card.ready,.lane.ready,.pill.ready,.lanechip.ready{--c:var(--l-ready);--cs:var(--l-ready-s)}
.card.progress,.lane.progress,.pill.progress,.lanechip.progress{--c:var(--l-progress);--cs:var(--l-progress-s)}
.card.review,.lane.review,.pill.review,.lanechip.review{--c:var(--l-review);--cs:var(--l-review-s)}
.card.test,.lane.test,.pill.test,.lanechip.test{--c:var(--l-test);--cs:var(--l-test-s)}
.card.done,.lane.done,.pill.done,.lanechip.done{--c:var(--l-done);--cs:var(--l-done-s)}
.card.issues,.card.blocked{--c:var(--crit);--cs:var(--crit-s)}
[hidden]{display:none!important}
html,body{height:100%}body{display:flex;flex-direction:column;overflow:hidden}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
a{color:var(--accent)}
.top{display:flex;align-items:center;gap:14px;padding:9px 18px;border-bottom:1px solid var(--line);
background:var(--card);flex-wrap:wrap}
.top h1{font-size:1.1rem;margin:0}
.kick{color:var(--accent);font-weight:650;font-size:.7rem;letter-spacing:.09em;text-transform:uppercase;display:block}
.demo{background:var(--crit);color:var(--on);font-weight:800;font-size:.74rem;padding:4px 10px;border-radius:99px;letter-spacing:.08em}
/* Three readings, and the eye has to see they are three: a rule between the groups, a total beside
   each label, and a dot on every pill that is the colour of the column it counts. Same height. */
.stats{display:flex;align-items:center;gap:4px 14px;flex-wrap:wrap;padding:7px 18px;
border-bottom:1px solid var(--line);background:var(--card)}
.sgrp{display:flex;align-items:center;gap:6px;min-width:0}
.sgrp+.sgrp{align-self:stretch;border-left:1px solid var(--line);padding-left:14px}
.sgrp .lbl{text-transform:uppercase;letter-spacing:.07em;font-size:.63rem;font-weight:700;color:var(--muted);
white-space:nowrap}
.sgrp .lbl b{color:var(--ink);font-size:.78rem;letter-spacing:0;margin-left:3px;font-variant-numeric:tabular-nums}
.pct{font-size:1.2rem;font-weight:750;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1}
.stats .prog{width:130px;height:7px;flex:none}
.stats .prog i{background:var(--l-done)}
.sn{font-size:.76rem;color:var(--muted);white-space:nowrap}
.pill{display:inline-flex;align-items:center;gap:5px;padding:2px 9px 2px 7px;border-radius:99px;
background:var(--cs);color:var(--c);font-size:.73rem;font-weight:700;white-space:nowrap;
font-variant-numeric:tabular-nums}
.pill::before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
.pill.zero{background:var(--code);color:var(--muted);opacity:.6;font-weight:600}
.tools{margin-left:auto;display:flex;gap:7px;align-items:center}
#q{font:inherit;font-size:.84rem;padding:6px 10px;border:1px solid var(--line);border-radius:8px;
background:var(--bg);color:var(--ink);width:210px}
.btn b{background:var(--crit);color:var(--on);border-radius:99px;padding:0 7px;margin-left:5px;font-size:.7rem}
.btn b.zero{background:var(--line);color:var(--muted)}
.next{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:10px 18px 0;padding:7px 8px 7px 14px;
background:var(--card);border:1px solid var(--line);border-left:4px solid var(--l-progress);
border-radius:11px;box-shadow:var(--sh)}
.next.you{border-left-color:var(--l-test);background-image:linear-gradient(100deg,var(--l-test-s),transparent 46%)}
.next.done{border-left-color:var(--l-done)}
.next .kick{display:inline;flex:none}
.next .nt{font-size:.93rem;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.next .na{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-left:auto}
.next .btn.prime{background:var(--accent);border-color:var(--accent);color:var(--on)}
.next .btn.prime:hover{color:var(--on);filter:brightness(1.08)}
.pd .brief{margin:10px 0 0}
.pd .brief .md{font-size:.9rem}
.board{flex:1;min-height:0;display:grid;grid-template-columns:var(--rail) 1fr;gap:12px;padding:10px 18px 10px}
.rail{overflow:auto;display:flex;flex-direction:column;gap:6px;padding-right:4px;min-height:0}
/* An epic card carries its own lane colour as a wash and a bar, the way a story card does, so its
   state reads before its name does. The name wraps — an epic truncated to "Section Runtime Platf…"
   is a card that failed at the one job it has. */
.ep{--c:var(--l-backlog);--cs:var(--l-backlog-s);font:inherit;text-align:left;cursor:pointer;color:var(--ink);
flex:none;display:flex;flex-direction:column;gap:7px;line-height:1.3;padding:9px 11px;border-radius:11px;
border:1px solid var(--line);border-left:4px solid var(--c);background:var(--card);
background-image:linear-gradient(105deg,var(--cs),transparent 78%);transition:box-shadow .12s,border-color .12s}
.ep.progress{--c:var(--l-progress);--cs:var(--l-progress-s)}
.ep.done{--c:var(--l-done);--cs:var(--l-done-s)}
.ep:hover{border-color:var(--c);box-shadow:var(--sh)}
.ep.on{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-s)}
.eh{display:flex;gap:7px;align-items:baseline;min-width:0}
.ep .en{color:var(--c);font-weight:800;font-size:.68rem;flex:none;min-width:24px;letter-spacing:.03em}
.ep .et{flex:1;min-width:0;font-size:.81rem;font-weight:650;overflow-wrap:anywhere}
.ef{display:flex;gap:9px;align-items:center}
.ep .track{flex:1;height:6px;border-radius:99px;background:var(--line);overflow:hidden}
.ep .track i{display:block;height:100%;background:var(--c);border-radius:99px}
.ep .em{color:var(--muted);font-size:.7rem;flex:none;white-space:nowrap;font-variant-numeric:tabular-nums}
/* "All epics" is a control, not an epic: no bar, one line. */
.ep.all{flex-direction:row;align-items:baseline;gap:8px;background-image:none}
.ep.all .et{flex:none;font-weight:700}.ep.all .em{margin-left:auto}
.lanes{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;min-height:0}
.lane{display:flex;flex-direction:column;min-height:0;background:var(--code);border-radius:12px;
border:1px solid var(--line);border-top:3px solid var(--c);overflow:hidden}
.lane h2{font-size:.78rem;margin:0;padding:8px 10px;display:flex;align-items:center;gap:6px;
border-bottom:1px solid var(--line);line-height:1.2;background:var(--cs)}
.lane h2::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--c);flex:none}
.lane h2 .n{margin-left:auto;background:var(--card);border-radius:99px;padding:0 8px;font-weight:700;
font-size:.7rem;color:var(--c);white-space:nowrap;font-variant-numeric:tabular-nums}
.lane.test{border-color:var(--l-test);box-shadow:0 0 0 2px var(--l-test-s)}
.cards{overflow:auto;flex:1;padding:8px;display:flex;flex-direction:column;gap:8px}
.card{background:var(--card);background-image:linear-gradient(103deg,var(--cs),transparent 60%);
border:1px solid var(--line);border-left:4px solid var(--c);border-radius:10px;
padding:8px 10px 9px;box-shadow:var(--sh);font-size:.78rem;flex:none;cursor:pointer;
transition:transform .12s,box-shadow .12s,border-color .12s}
.card:hover{border-color:var(--c);transform:translateY(-1px);
box-shadow:0 2px 4px rgba(0,0,0,.05),0 10px 22px rgba(0,0,0,.09)}
.card.done{opacity:.72}
.card .ch{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
.ebadge{font-size:.66rem;font-weight:700;padding:1px 6px;border-radius:99px;background:var(--accent-s);color:var(--accent);white-space:nowrap}
.card .ebadge{background:var(--card);color:var(--c);box-shadow:inset 0 0 0 1px currentColor}
.key{font-weight:700;font-size:.78rem}
/* One phase, one colour, and it is the lane palette — so a chip in the activity feed and a card in
   a lane say the same thing in the same colour. A phase with no row here reads grey, which is what
   an unstarted phase means. */
.ph{--c:var(--wait);--cs:var(--code);margin-left:auto;font-size:.64rem;font-weight:700;text-transform:uppercase;
letter-spacing:.05em;padding:1px 6px;border-radius:99px;background:var(--cs);color:var(--c);white-space:nowrap}
.p-Create{--c:var(--l-ready);--cs:var(--l-ready-s)}.p-Dev{--c:var(--l-progress);--cs:var(--l-progress-s)}
.p-Review,.p-Deploy{--c:var(--l-review);--cs:var(--l-review-s)}.p-Test{--c:var(--l-test);--cs:var(--l-test-s)}
.p-Done{--c:var(--l-done);--cs:var(--l-done-s)}.p-Fix,.p-Blocked{--c:var(--crit);--cs:var(--crit-s)}
.card h3{font-size:.8rem;font-weight:600;margin:5px 0 7px;line-height:1.3}
.card .cf{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
.cp{font:inherit;font-size:.7rem;font-weight:650;padding:3px 8px;border-radius:7px;border:1px solid var(--accent);
background:var(--accent);color:var(--on);cursor:pointer;white-space:nowrap}
.cp.ok,.btn.ok,.cpv.ok{background:var(--good);border-color:var(--good);color:var(--on)}
.more{margin-left:auto;text-decoration:none;color:var(--muted);font-weight:600;padding:0 7px;border-radius:6px;
border:1px solid var(--line);font-size:.7rem;line-height:1.7}
.more:hover{color:var(--accent);border-color:var(--accent)}
.empty{color:var(--muted);font-size:.76rem;padding:10px 8px;text-align:center;line-height:1.45}
.tag{display:inline-block;font-size:.64rem;font-weight:700;padding:1px 7px;border-radius:99px;vertical-align:middle;
text-transform:uppercase;letter-spacing:.04em}
.tag.long{text-transform:none;letter-spacing:0;font-weight:600}
.tag.warn{background:var(--warn);color:var(--on)}.tag.good{background:var(--good-s);color:var(--good)}.tag.crit{background:var(--crit-s);color:var(--crit)}
/* The long one is a note, not a verdict: it says its piece without shouting over the card it sits on. */
.tag.warn.long{background:var(--warn-s);color:var(--warn);box-shadow:inset 0 0 0 1px currentColor}
.flag{background:var(--warn-s);color:var(--warn);border-radius:10px;padding:10px 13px;margin:8px 0;font-size:.88rem;box-shadow:inset 0 0 0 1px currentColor}
.flag b{display:block;margin-bottom:2px}.flag p{margin:.4em 0 0}.flag p:first-of-type{margin-top:.3em}
.flag{display:inline-block;font-size:.8rem;font-weight:600;color:var(--warn)}
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:20}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(660px,94vw);background:var(--card);border-left:1px solid var(--line);
box-shadow:-8px 0 30px rgba(0,0,0,.18);z-index:21;overflow:auto;padding:16px 22px 48px;transition:width .12s}
/* A story reads as prose and wants a column; a panel is a list of rows and wants the room. */
.drawer.wide{width:min(1040px,96vw)}
.drawer .close{position:sticky;top:0;float:right;font:inherit;font-size:.88rem;border:1px solid var(--line);
background:var(--card);border-radius:8px;padding:3px 9px;cursor:pointer;z-index:1}
.sd header .ebadge{font-size:.72rem}
.sd h2,.pd h2{font-size:1.18rem;margin:8px 0 4px;letter-spacing:-.01em;line-height:1.3}
.sd h3,.pd h3{font-size:.74rem;margin:18px 0 6px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:700}
.sd h3 .fine,.pd h3 .fine{text-transform:none;letter-spacing:0;font-weight:500;margin-left:6px}
.meta{margin:0 0 4px;font-size:.8rem;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.lanechip{font-weight:700;font-size:.72rem;padding:2px 9px;border-radius:99px;background:var(--code);color:var(--muted)}
.lanechip.test{background:var(--warn-s);color:var(--warn)}.lanechip.done{background:var(--good-s);color:var(--good)}
.lanechip.progress,.lanechip.review,.lanechip.ready{background:var(--accent-s);color:var(--accent)}
.fine{color:var(--muted);font-size:.8rem}
.md{font-size:.9rem;line-height:1.55}.md p{margin:5px 0}.md ul,.md ol{padding-left:1.35em;margin:4px 0}.md h4{margin:10px 0 2px;font-size:.92rem}
.stepper{display:flex;gap:4px;list-style:none;margin:12px 0;padding:0}
.stepper li{flex:1;text-align:center;font-size:.7rem;font-weight:700;padding:5px 2px;border-radius:7px;background:var(--code);color:var(--muted)}
.stepper li.done{background:var(--good-s);color:var(--good)}.stepper li.cur{background:var(--accent);color:var(--on)}
.stepper li.issues{background:var(--crit);color:var(--on)}
.now{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--accent-s);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:.88rem}
.qbox,.pbox{border:1px solid var(--warn);background:var(--warn-s);border-radius:10px;padding:8px 14px 10px;margin:12px 0}
.qbox h3{color:var(--warn);margin-top:4px}.pbox h3{color:var(--muted);margin-top:4px}.q{padding:6px 0;border-top:1px solid rgba(0,0,0,.08)}.q:first-of-type{border-top:0}
.flags{margin:4px 0 0}
.tbox{border:1px solid var(--accent);border-radius:10px;padding:8px 14px 10px;margin:12px 0}
.tbox h3{color:var(--accent);margin-top:4px}
.steps{padding-left:1.4em;font-size:.88rem}.steps li{margin:8px 0}.steps label{display:block}
.steps .see{margin:3px 0 0 22px}.steps .dummy{margin:3px 0 0 22px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:.84rem}
.steps .dummy code{font-size:.9em;padding:2px 6px}
.cpv{font:inherit;font-size:.68rem;font-weight:650;padding:1px 7px;border-radius:6px;border:1px solid var(--accent);
background:var(--card);color:var(--accent);cursor:pointer}
.tasks{list-style:none;padding:0;margin:0}.tasks li{padding:2px 0 2px 22px;position:relative;font-size:.86rem}
.tasks li::before{content:'☐';position:absolute;left:2px;color:var(--muted)}.tasks li.done::before{content:'☑';color:var(--good)}
.tasks li.done{color:var(--muted)}
.ct{width:100%;border-collapse:collapse;font-size:.8rem}.ct td{padding:4px 6px;border-top:1px solid var(--line);vertical-align:top}
.ct td:first-child{white-space:nowrap;color:var(--muted)}
details.eng{margin:14px 0;border:1px solid var(--line);border-radius:10px;padding:0 12px}
details.eng summary{cursor:pointer;font-size:.8rem;font-weight:700;color:var(--muted);padding:8px 0;text-transform:uppercase;letter-spacing:.07em}
details.eng[open] summary{border-bottom:1px solid var(--line)}details.eng h3:first-of-type{margin-top:10px}
.pr pre{margin:7px 0 0;max-height:280px}
.brief{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:6px 12px;margin:6px 0;font-size:.86rem}
.pr .brief{margin:7px 0 0}.next .brief{flex-basis:100%;margin:0 0 8px}
.links{font-size:.84rem;color:var(--muted);margin-top:16px}
.dw{border-top:1px solid var(--line);padding:8px 0}.dw:first-of-type{border-top:0}.dw b{display:block}
/* ── The three panels: one row shape, one chip, five tones. A tone is a --c/--cs pair like a lane's,
      so a new status is one row here and one name in TONE, never a rule per element. ───────────── */
.st{--c:var(--wait);--cs:var(--code);display:inline-block;font-size:.63rem;font-weight:800;letter-spacing:.05em;
text-transform:uppercase;padding:2px 8px;border-radius:99px;background:var(--cs);color:var(--c);white-space:nowrap}
.st.solid{background:var(--c);color:var(--on)}
/* A tone overrides the chip default, so it is declared after it. */
.s-crit{--c:var(--crit);--cs:var(--crit-s)}.s-warn{--c:var(--warn);--cs:var(--warn-s)}
.s-info{--c:var(--accent);--cs:var(--accent-s)}.s-good{--c:var(--good);--cs:var(--good-s)}
.s-mute{--c:var(--wait);--cs:var(--code)}
.tally{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0}
.acc>li>details>summary{cursor:pointer;list-style:none;margin:0}
.acc>li>details>summary::-webkit-details-marker{display:none}
.acc>li>details>summary::before{content:"▸";color:var(--muted);font-size:.8rem;flex:0 0 auto;transition:transform .12s}
.acc>li>details[open]>summary::before{transform:rotate(90deg)}
.acc>li>details[open]>summary{margin-bottom:6px}
.qpart{border-left:3px solid var(--c);border-radius:0 8px 8px 0;padding:7px 12px;margin:8px 0;background:var(--cs)}
.qpart h5{margin:0 0 4px;font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;color:var(--c)}
.qpart>:last-child{margin-bottom:0}
.qpart.ask{--c:var(--wait);--cs:var(--code)}
.qpart.opts{--c:var(--accent);--cs:var(--accent-s)}
.qpart.ruled{--c:var(--good);--cs:var(--good-s)}
.qpart.opts ol{margin:0;padding-left:1.3em}.qpart.opts li{margin:3px 0}
.qpart.opts li:has(.tag.good){font-weight:600}
.acc .plh{margin:0;flex-wrap:nowrap}.acc .plh b{flex:1 1 auto;min-width:0}.acc .q{border-top:0;padding:0}
h3.sub,h4.sub{margin:18px 0 0;font-size:.78rem;text-transform:uppercase;letter-spacing:.07em;color:var(--muted)}
.prl{gap:6px}.prl>li.cur{--c:var(--accent)}
.qbox.quiet,.pbox{border-color:var(--line);background:transparent}
.qbox.quiet h3{color:var(--muted)}
.pl{--c:var(--wait);list-style:none;margin:12px 0 0;padding:0;display:grid;gap:9px}
.pl>li{border:1px solid var(--line);border-left:4px solid var(--c);border-radius:11px;background:var(--card);
padding:10px 14px;transition:border-color .12s,box-shadow .12s}
.pl>li:hover{border-color:var(--c);box-shadow:var(--sh)}
.plh{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 4px}
.plh b{font-size:.9rem;font-weight:700;margin-right:auto}.plh b a{text-decoration:none}
.plh .ph{margin-left:0}
.pl .lede{margin:0 0 5px;font-size:.92rem;line-height:1.5;color:var(--ink)}
.pl .why{margin:0;font-size:.84rem;line-height:1.5;color:var(--muted);max-width:none}
.pl .where{display:block;margin-top:5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
font-size:.74rem;color:var(--muted);word-break:break-word}
.pl .from{display:block;margin-top:4px;font-size:.76rem;color:var(--muted)}
/* The activity feed stays a table — twenty rows read faster in columns than in cards. */
.ct thead th{text-align:left;font-size:.63rem;text-transform:uppercase;letter-spacing:.07em;
color:var(--muted);font-weight:700;padding:0 6px 5px;border-bottom:1px solid var(--line)}
/* The default is on the table so a row's own p-<Phase>/tone class — one class — can override it. */
.ct{--c:var(--wait);--cs:var(--code)}
/* A commit that is not story work: kept in the feed, greyed, and with no phase colour to claim. */
.ct tbody tr.dim{--c:var(--line)}.ct tbody tr.dim td{color:var(--muted)}.ct tbody tr.dim .msg{font-style:italic}
/* Alternate STORY, not alternate row: a run of rows is one story, and the band is what groups it. */
.ct tbody tr.band{background:color-mix(in srgb,var(--ink) 4.5%,transparent)}
.ct tbody tr:hover{background:var(--cs)}
.ct tbody td:first-child{border-left:3px solid var(--c)}
.ct td:nth-child(3){white-space:nowrap}
.ct .msg{width:100%}
.help p{margin:6px 0;font-size:.92rem;line-height:1.55}.help dt{font-weight:700;margin-top:8px}.help dd{margin:0 0 4px;color:var(--muted);font-size:.9rem}
footer{padding:6px 18px;margin:0;border-top:1px solid var(--line);font-size:.72rem;color:var(--muted);background:var(--card)}
@media(max-width:1100px){.lanes{grid-template-columns:repeat(3,minmax(0,1fr))}.board{grid-template-columns:1fr;grid-template-rows:auto 1fr}
.rail{flex-direction:row;overflow-x:auto}.ep{min-width:180px}}
@media print{.tools,.scrim,.drawer,.next details{display:none!important}body{overflow:visible;height:auto}.cards,.rail{overflow:visible}}
"""

JS = r"""
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const drawer=$('#drawer'),dbody=$('#dbody'),store=$('#details'),scrim=$('#scrim'),q=$('#q');
const EK='inflozo-story-board-epic';
let openSec=null,epicFilter='',lastFocus=null;
try{epicFilter=localStorage.getItem(EK)||'';}catch(e){}
function copy(txt){                       // file:// has no clipboard API in some browsers
  if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(txt);
  const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);
  ta.select();document.execCommand('copy');ta.remove();return Promise.resolve();}
function openSection(id,sub){
  const s=document.getElementById(id);if(!s)return;
  if(openSec&&openSec!==s){openSec.hidden=true;store.append(openSec);}
  lastFocus=lastFocus||document.activeElement;
  openSec=s;dbody.append(s);s.hidden=false;drawer.hidden=false;scrim.hidden=false;paintTicks(s);
  drawer.classList.toggle('wide',s.classList.contains('pd'));   // a panel is a list; a story is prose
  drawer.scrollTop=0;
  if(sub){const el=s.querySelector('[data-sub="'+sub+'"]');if(el)el.scrollIntoView({block:'start'});}
  drawer.querySelector('.close').focus();}
function closeDrawer(){
  if(openSec){openSec.hidden=true;store.append(openSec);openSec=null;}
  drawer.hidden=true;scrim.hidden=true;
  if(location.hash)history.replaceState(null,'',location.pathname+location.search);
  if(lastFocus&&lastFocus.focus){lastFocus.focus();}lastFocus=null;}
function route(){
  const h=decodeURIComponent(location.hash.slice(1));
  if(!h){if(!drawer.hidden)closeDrawer();return;}
  const [key,sub]=h.split('/');
  if(document.getElementById('pd-'+key))openSection('pd-'+key);
  else openSection('sd-'+key.replace(/\./g,'-'),sub);}
const TK='inflozo-story-board-ticks';let ticks;
try{ticks=new Set(JSON.parse(localStorage.getItem(TK)||'[]'));}catch(e){ticks=new Set();}
function paintTicks(root){root.querySelectorAll('input.tick').forEach(c=>{c.checked=ticks.has(c.dataset.k);});}
document.addEventListener('change',e=>{const t=e.target;if(!t.classList.contains('tick'))return;
  t.checked?ticks.add(t.dataset.k):ticks.delete(t.dataset.k);
  try{localStorage.setItem(TK,JSON.stringify([...ticks]));}catch(x){}});
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-copy],[data-text]');
  if(c){const src=c.dataset.text!==undefined?c.dataset.text:(document.getElementById(c.dataset.copy)||{}).textContent;
    if(src===undefined)return;
    e.preventDefault();                     // a copy button inside a <summary> must not toggle it
    copy(src).then(()=>{const o=c.textContent;c.textContent='Copied';c.classList.add('ok');
      setTimeout(()=>{c.textContent=o;c.classList.remove('ok');},1400);});return;}
  const p=e.target.closest('[data-panel]');
  if(p){location.hash='#'+p.dataset.panel;return;}
  if(e.target.closest('.close')||e.target===scrim){closeDrawer();return;}
  const card=e.target.closest('.card');
  if(card&&!e.target.closest('a,button,input')){location.hash='#'+card.dataset.key;return;}
  const ep=e.target.closest('.ep');
  if(ep){epicFilter=(epicFilter===ep.dataset.e)?'':ep.dataset.e;
    try{localStorage.setItem(EK,epicFilter);}catch(x){}apply();}});
function apply(){
  const s=q.value.trim().toLowerCase();
  const needle=/^\d+\.\d+[a-z]?$/.test(s)?' '+s+' ':s;   // a story key matches whole: 1.1 is not 1.10
  $$('.card').forEach(c=>{c.hidden=(epicFilter&&c.dataset.e!==epicFilter)||(s&&!c.dataset.s.includes(needle));});
  $$('.lane').forEach(l=>{const all=l.querySelectorAll('.card'),shown=[...all].filter(c=>!c.hidden);
    l.querySelector('.n').textContent=shown.length===all.length?all.length:shown.length+' of '+all.length;});
  $$('.ep').forEach(b=>b.classList.toggle('on',b.dataset.e===epicFilter));}
q.addEventListener('input',apply);
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(!drawer.hidden)closeDrawer();else if(document.activeElement===q){q.value='';apply();q.blur();}}
  else if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();q.focus();q.select();}});
// a remembered epic that no longer exists would hide every card
if(epicFilter&&!$('.ep[data-e="'+epicFilter+'"]'))epicFilter='';
apply();
window.addEventListener('hashchange',route);route();
"""

HELP = '''<section class="pd help" id="pd-help" hidden><h2>How to read this board</h2>
<p>Every card is one story. A story moves left to right as it is built, and it comes to you once, in the gold column.</p>
<dl>
<dt>Backlog</dt><dd>Not started. Its spec (the written plan for the story) has not been written.</dd>
<dt>Ready</dt><dd>The spec is written and waiting to be built.</dd>
<dt>In progress</dt><dd>Being built now.</dd>
<dt>In review</dt><dd>Being checked against the real services, then deployed. Nothing for you to do yet.</dd>
<dt>Deployed, your test</dt><dd>The gold column. Live on the real site and waiting for <b>you</b>. Open the card, follow the numbered steps, and say what you saw in chat. A red stripe means you reported issues and they are being fixed. A story with no screen skips your test: say "done" in chat and the Record prompt closes it.</dd>
<dt>Done</dt><dd>You accepted it.</dd>
</dl>
<p><b>The strip at the top.</b> How far the build has come: the percentage and the bar are stories you have accepted out of every story there is, then the epics and the stories by column. A grey number is a zero.</p>
<p><b>The next action.</b> The one line under it is the single next thing to do, and its <b>Copy prompt</b> button is the prompt for it. <b>What to do</b> opens the briefing — what that session will do, where it stops, what it asks you — with the prompt itself underneath. <b>Open the story</b> jumps to the card.</p>
<p><b>The colours.</b> Every column has its own, and a card carries its column's colour on its left edge, so a story's state reads from the colour before you read a word. Red is the exception and it always means you: issues you reported, or a story blocked behind another.</p>
<p><b>The phases.</b> Create (write the spec) → Build → Review (check it on the real services) → Deploy (put it live) → Test (you) → Done. If your test finds issues: Fix → Review → Deploy → Test again, inside the same story.</p>
<p><b>The prompts.</b> Each card carries one Copy prompt button, for the phase on its badge; Details shows every phase's prompt. Paste it into a Claude Code chat exactly as copied, top to bottom — some begin with a /command, some do not.</p>
<p><b>Reload.</b> Reload this page whenever a session says it has saved. Every save is a commit shaped <code>Story E.S - Phase - one line</code>, this board is rebuilt from those commits, and a story's history is its commit list.</p>
<p><b>Questions for you.</b> The inbox in the top bar lists every open question across every story. Each is plain English with numbered options and one marked RECOMMENDED; answer in chat by number.</p>
<p><b>Waits for.</b> In the two library epics the stories run one at a time behind your category gate, so only the first open one carries a prompt; the rest say which story they wait for.</p>
<p><b>Keys.</b> <code>/</code> focuses the search, <code>Esc</code> closes a panel. The ticks on a test script are stored in this browser only; your verdict still goes through chat.</p>
</section>'''


def render(ctx):
    epics, status = ctx['epics'], ctx['status']
    stories = []
    for ep in epics:
        ep['stories'].sort(key=lambda s: snum(s['s']))
        for st in ep['stories']:
            derive(st, status, ctx['specs'], ctx['commits'])
            stories.append((st, ep))
        gate_epic(ep)
        ep['status'] = epic_status(ep, status)
    flat = [s for s, _ in stories]

    # ── the pulse (every number derived here) ──
    ep_n = {k: sum(1 for ep in epics if ep['status'] == k) for k in ('done', 'progress', 'backlog')}
    lane_n = {k: sum(1 for s in flat if s['lane'] == k) for k, _ in LANES}
    open_qs = [(s, ep, q) for s, ep in stories if s['spec'] and s['lane'] != 'done'
               for q in s['spec']['questions'] if not q['answered']]
    done_n, tot_n = lane_n['done'], len(flat)
    pct = int(round(100 * done_n / tot_n)) if tot_n else 0
    def pill(cls, n, label):
        return f'<span class="pill {cls}{" zero" if not n else ""}">{n} {e(label)}</span>'
    # The total belongs to the label, so a pill only ever carries one number and never "of N".
    stats = (f'<div class="sgrp"><span class="pct">{pct}%</span>'
             f'<div class="prog" role="img" aria-label="{pct}% of stories done"><i style="width:{pct}%"></i></div>'
             f'<span class="sn">{done_n} of {tot_n} stories accepted</span></div>'
             f'<div class="sgrp"><span class="lbl">Epics<b>{len(epics)}</b></span>'
             + pill('done', ep_n['done'], 'done') + pill('progress', ep_n['progress'], 'in progress')
             + pill('', ep_n['backlog'], 'not started') + '</div>'
             f'<div class="sgrp"><span class="lbl">Stories<b>{tot_n}</b></span>'
             + ''.join(pill(k, lane_n[k], n.lower()) for k, n in LANES) + '</div>')

    # The bar carries the one thing to do and the button that does it; everything that explains it —
    # the why, the briefing, the prompt itself — lives in the drawer every other panel already uses,
    # so the board keeps the height instead of the explanation.
    kind, title, why, prompt, link, brief = next_action(ctx, flat)
    na = (f'<section class="next {kind}"><span class="kick">Next action</span>'
          f'<span class="nt">{e(title)}</span><div class="na">')
    if prompt:
        na += '<button class="btn copy prime" data-copy="na-prompt">Copy prompt</button>'
    na += '<button class="btn" data-panel="next">What to do</button>'
    if link:
        na += f'<a class="btn" href="{e(link)}">Open the story</a>'
    na += '</div></section>'
    na_panel = (f'<section class="pd" id="pd-next" hidden><h2>Next action <span class="fine">{e(title)}</span></h2>'
                f'<p>{e(why)}</p>' + (f'<div class="brief">{mdblock(brief)}</div>' if brief else '')
                + (f'<h3>The prompt <span class="fine">paste it whole, first line included</span></h3>'
                   f'<p><button class="btn copy" data-copy="na-prompt">Copy prompt</button></p>'
                   f'<pre id="na-prompt">{e(prompt)}</pre>' if prompt else '')
                + (f'<p><a class="btn" href="{e(link)}">Open the story</a></p>' if link else '') + '</section>')

    # ── the epic rail: one line per epic ──
    rail = ['<button class="ep all" data-e=""><span class="et">All epics</span>'
            f'<span class="em">{len(epics)} epics · {len(flat)} stories</span></button>']
    for ep in epics:
        n_done = sum(1 for s in ep['stories'] if s['lane'] == 'done')
        tot = len(ep['stories'])
        # E0 is done by execution and owns no story: a full bar and the word is the honest reading.
        pct = int(100 * n_done / tot) if tot else (100 if ep['status'] == 'done' else 0)
        meta = f'{n_done}/{tot}' if tot else ('done' if ep['status'] == 'done' else 'no stories')
        rail.append(f'<button class="ep {ep["status"]}" data-e="{ep["n"]}" title="{e(ep["goal"])}">'
                    f'<span class="eh"><span class="en">E{ep["n"]}</span>'
                    f'<span class="et">{e(ep["title"])}</span></span>'
                    f'<span class="ef"><span class="track" role="img" aria-label="{pct}% done">'
                    f'<i style="width:{pct}%"></i></span>'
                    f'<span class="em" title="stories done">{e(meta)}</span></span></button>')

    # ── the lanes ──
    lanes = []
    for k, name in LANES:
        cards = ''.join(render_card(s, ep) for s, ep in stories if s['lane'] == k)
        if not cards:
            cards = ('<p class="empty">No stories yet — step 6 writes them.</p>' if not ctx['have_epics']
                     else '<p class="empty">Nothing here.</p>')
        lanes.append(f'<section class="lane {k}"><h2>{e(name)}<span class="n">{lane_n[k]}</span></h2>'
                     f'<div class="cards">{cards}</div></section>')

    # ── the hidden detail sections and the panels ──
    details = [render_story(s, ep, ctx['phase_prompts'], ctx['briefs']) for s, ep in stories]
    if open_qs:
        rows = []
        for s, ep, q in open_qs:
            # The tone is what the question is worth answering *now*: a shapeless one is not yet
            # answerable and says so in red, rather than sitting in the inbox looking ready.
            tone, chip, note = 's-warn', 'needs an answer', ''
            if not q['options']:
                tone, chip, note = 's-crit', 'not answerable yet', NO_OPTIONS
            elif not q['recommended']:
                note = NO_RECOMMENDED
            rows.append(f'<li class="{tone}"><div class="plh">'
                        f'<b><a href="#{e(s["key"])}/questions">{e(s["key"])} · {e(s["title"])}</a></b>'
                        f'{phchip(s["phase"], lab(s["phase"]))}'
                        f'<span class="st {tone} solid">{e(chip)}</span></div>'
                        f'<p class="why">{md(q["title"])}</p>'
                        + (f'<p class="why"><span class="flag">{e(note)}</span></p>' if note else '')
                        + '</li>')
        ql = '<ul class="pl">' + ''.join(rows) + '</ul>'
    else:
        ql = '<p class="fine">Nothing is waiting on you. A question appears here the moment a spec writes one under "Questions for the owner".</p>'
    details.append(f'<section class="pd" id="pd-questions" hidden><h2>Questions for you <span class="fine">{len(open_qs)} open</span></h2>'
                   '<p class="fine">Everything the build needs you to decide, across every story. Open one, read the options, answer in chat by number.</p>'
                   f'{ql}</section>')
    # No slice: the drawer scrolls, and a story's own run is now long enough that a 20-row window
    # hid whole stories. The count is derived here rather than written into the heading.
    feed = [c for c in ctx['commits'] if c['kind'] != 'unreadable']
    unreadable = [c for c in ctx['commits'] if c['kind'] == 'unreadable']
    if feed:
        # The feed is one row per commit, so a story's phases arrive as a run of rows. Shading
        # alternate runs is what makes "where does 1.2 end and 1.1 begin" readable without counting.
        def band(feed):
            on, prev = False, object()
            for c in feed:
                if c['key'] != prev:
                    on, prev = not on, c['key']
                yield c, ' band' if on else ''
        tone = lambda c: 'dim' if c['kind'] == 'other' else ('p-' + e(c['phase'])) if c['phase'] else 's-mute'
        rows = ''.join(f'<tr class="{tone(c)}{b}"><td>{e(c["date"])}</td><td><code>{e(c["h"])}</code></td>'
                       f'<td>{("<a href=#" + e(c["key"]) + ">" + e(c["key"]) + "</a>") if c["kind"] == "story" else e(c["key"])}</td>'
                       f'<td>{phchip(c["phase"])}</td>'
                       f'<td class="msg">{e(c["msg"])}</td></tr>' for c, b in band(feed))
        act = ('<table class="ct"><thead><tr><th>When</th><th>Commit</th><th>Story</th><th>Phase</th>'
               f'<th>What it did</th></tr></thead><tbody>{rows}</tbody></table>')
    else:
        act = '<p class="fine">No story commits yet. Every phase ends with one, shaped <code>Story E.S - Phase - one line</code>, and they appear here as they land.</p>'
    if unreadable:
        act += (f'<h3>Unreadable commits <span class="fine">{len(unreadable)}</span></h3>'
                '<p class="fine">These start like a story, step, hotfix or retro commit but do not fit the shape '
                '<code>Story E.S - Phase - one line</code> (or <code>Step n - Phase - …</code>, <code>Hotfix - …</code>, '
                '<code>Epic N - Retro - …</code>), so the board cannot read them. The commit-msg hook rejects new ones.</p>'
                '<table class="ct"><tbody>' + ''.join(f'<tr class="s-crit"><td>{e(c["date"])}</td><td><code>{e(c["h"])}</code></td>'
                                                      f'<td class="msg">{e(c["msg"])}</td></tr>'
                                                      for c in unreadable) + '</tbody></table>')
    details.append(f'<section class="pd" id="pd-activity" hidden><h2>Activity <span class="fine">every commit — {len(feed)}</span></h2>{act}</section>')
    if ctx['deferred']:
        tally, part = {}, {False: [], True: []}
        for d in ctx['deferred']:
            closed = dw_closed(d)
            tone = 's-good' if closed else SEV_TONE.get(d['severity'], 's-mute')
            # One bucket word for every closed entry, whatever its status line spells: the canonical
            # close carries its date (`done 2026-09-11 (Story 3.9)`), so counting the raw status
            # would mint a chip per entry instead of a count.
            word = 'closed' if closed else (d['severity'] or 'unrated')
            tally[(tone, word)] = tally.get((tone, word), 0) + 1
            part[closed].append(dw_entry(d, closed, tone))
        # Counted from the rows, never written down: a new severity word needs no edit here.
        chips = ''.join(f'<span class="st {t} solid">{n} {e(w)}</span>'
                        for (t, w), n in sorted(tally.items(), key=lambda kv: (TONE_ORDER.index(kv[0][0]), kv[0][1])))
        dw = f'<div class="tally">{chips}</div>'
        dw += (f'<ul class="pl acc">{"".join(part[False])}</ul>' if part[False]
               else '<p class="fine">Nothing is still open — every entry below has been closed.</p>')
        if part[True]:
            dw += (f'<h3 class="sub">Closed <span class="fine">{len(part[True])}</span></h3>'
                   f'<ul class="pl acc">{"".join(part[True])}</ul>')
    else:
        dw = ('<p class="fine">Nothing has been deferred.' + ('' if ctx['deferred_exists'] else ' The ledger (deferred-work.md) does not exist yet; a review writes it the first time it sets something aside.') + '</p>')
    details.append(f'<section class="pd" id="pd-deferred" hidden><h2>Deferred work <span class="fine">{len(ctx["deferred"])} entries</span></h2>'
                   '<p class="fine">Small things put off for later: a review chose not to do them inside its story. Each is a small decision for later, not a bug in what shipped.</p>'
                   f'{dw}</section>')
    details.append(na_panel)
    details.append(HELP)

    stamp = ctx['stamp']
    demo = '<span class="demo">DEMO DATA</span>' if ctx['demo'] else ''
    src = ('an in-memory fixture — nothing here is real' if ctx['demo'] else
           'epics.md, sprint-status.yaml, the specs, git log and deferred-work.md' if ctx['have_epics'] else
           "the PRD's §8 epic list (epics.md does not exist yet), git log and build-sequence.md")
    return f"""<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inflozo — Story Board</title><style>{dp1.CSS}{CSS}</style>
<body>
<header class="top">
  <div><span class="kick">Inflozo</span><h1>Story board</h1></div>{demo}
  <div class="tools"><input id="q" type="search" placeholder="Search stories  ( / )" aria-label="search stories">
    <button class="btn" data-panel="questions">Questions for you <b class="{'zero' if not open_qs else ''}">{len(open_qs)}</b></button>
    <button class="btn" data-panel="activity">Activity</button>
    <button class="btn" data-panel="deferred" title="small things put off for later">Deferred</button>
    <button class="btn" data-panel="help">Help</button></div>
</header>
<div class="stats">{stats}</div>
{na}
<main class="board">
  <nav class="rail" aria-label="epics">{''.join(rail)}</nav>
  <div class="lanes">{''.join(lanes)}</div>
</main>
<div class="scrim" id="scrim" hidden></div>
<aside class="drawer" id="drawer" hidden aria-label="details"><button class="close" aria-label="close">✕ close</button><div id="dbody"></div></aside>
<div id="details" hidden>{''.join(details)}</div>
<footer>Generated {e(stamp)} by <code>tools/story-board.py</code> from {e(src)}. The phase prompts are extracted from
<a href="build-sequence.md">build-sequence.md</a> step 7, never retyped. Every count is derived. The gate regenerates this page on every
commit; <code>python3 tools/story-board.py --check</code> fails when it is stale. The step board is <a href="BUILD-BOARD.html">BUILD-BOARD.html</a>.</footer>
<script>{JS}</script></body></html>"""


# ─────────────────────────────────────────────────────────────────────────────
# The two sources of a context: the repo, and the demo fixture.
# ─────────────────────────────────────────────────────────────────────────────

def read(path):
    return open(path, encoding='utf8').read() if os.path.exists(path) else None


def real():
    seq = read(SEQ)
    assert seq, f'missing {SEQ}'
    phase, step6, step6b, briefs = prompts_from_sequence(seq)
    epics_md, status_md, deferred_md = read(EPICS), read(STATUS), read(DEFERRED)
    specs = []
    if os.path.isdir(IMPL):
        for f in sorted(os.listdir(IMPL)):
            if SPEC_RE.match(f):
                specs.append((os.path.relpath(os.path.join(IMPL, f), ROOT), read(os.path.join(IMPL, f))))
    log = subprocess.run(['git', 'log', '--format=%h%x09%cs%x09%s'], cwd=ROOT,
                         capture_output=True, text=True).stdout.splitlines()
    # The date only, as the build board stamps — the hashes are in the feed, and a hash here would
    # make the page stale on every doc-only commit as well as on every story commit.
    head = subprocess.run(['git', 'log', '-1', '--format=%cs'], cwd=ROOT,
                          capture_output=True, text=True).stdout.strip()
    return {'epics': load_epics(epics_md) if epics_md else load_prd_epics(read(PRD)),
            'have_epics': bool(epics_md), 'have_status': bool(status_md),
            'status': load_status(status_md or ''), 'specs': load_specs(specs),
            'commits': load_commits(log), 'deferred': load_deferred(deferred_md or ''),
            'deferred_exists': deferred_md is not None,
            'phase_prompts': phase, 'step6': step6, 'step6b': step6b, 'briefs': briefs, 'demo': False,
            'stamp': f'on {head}' if head else 'outside git'}


DEMO_EPICS = """# Inflozo - Epic Breakdown

## Overview

Demo fixture. Three epics from the PRD's §8: one per lane, one with issues, a no-screen story, a blocked
one, a tracker-only one, and a gated library epic.

## Epic 1: Foundations & Design System

The repo, the Next.js app on the production Vercel project, the design tokens and components taken from the export, and magic-link sign-in.

### Story 1.1: Repository, Next.js app and CI to production Vercel

As a founder,
I want the app deployed to the production Vercel project from main on every push,
So that every story can be tested on the real stack from day one.

**Acceptance Criteria:**

**Given** a push to main
**When** the pipeline runs
**Then** the production Vercel project serves the new build
**And** the documentation gate passed before the push

### Story 1.2: Design tokens and components from the export

As a builder,
I want the tokens, type scale and controls lifted from Calibration Set and Editor Sidebar Kit,
So that every screen is built from the same vocabulary the export draws.

**Acceptance Criteria:**

**Given** the export's Calibration Set
**When** the token file is generated
**Then** every colour role, size and radius in it matches the frame byte for byte

### Story 1.3: Magic-link sign-in with the branded emails

As a visitor,
I want to sign in by email link,
So that I never need a password.

**Acceptance Criteria:**

**Given** a typed email address
**When** I press Continue
**Then** a branded email from Resend arrives within a minute and its link signs me in

### Story 1.4: The dashboard shell and navigation

As a signed-in user,
I want the dashboard shell with its navigation,
So that every later surface has a home.

**Acceptance Criteria:**

**Given** a signed-in session
**When** I open the dashboard
**Then** it matches frame S2a

### Story 1.5: The database schema applied to the Supabase project

As a builder,
I want SCHEMA.sql applied to the real Supabase project with RLS-TEST.sql passing,
So that every later story has a database with its policies proven.

**Acceptance Criteria:**

**Given** the production Supabase project
**When** RLS-TEST.sql runs against it
**Then** every assertion passes

## Epic 3: Sites & Connections

The connect wizard, the server-side Admin proxy, health checks and multi-site management.

### Story 3.1: Connect wizard validates the three keys

As a site owner,
I want the wizard to check my Admin key, Content key and Staff token against my Ghost site as I type them,
So that a wrong key is caught before anything is saved.

**Acceptance Criteria:**

**Given** a valid Admin API key for ghost6.inflozo.com
**When** the wizard calls GET /admin/config/
**Then** it shows the site's title and version

### Story 3.2: Daily health check and the Reconnect-needed email

As a site owner,
I want Inflozo to check my connection every day and email me when it breaks,
So that a deploy never fails silently.

**Acceptance Criteria:**

**Given** a connection whose key was regenerated
**When** the daily check runs
**Then** one Reconnect-needed email is sent and the site shows the Reconnect badge

### Story 3.3: Multi-site management and key rotation

As a site owner with several sites,
I want to manage each site's connection and rotate its keys,
So that one site's change never touches another.

**Acceptance Criteria:**

**Given** two connected sites
**When** I rotate one site's key
**Then** the other site's connection is untouched

### Story 3.4: Site removal with the confirm sheet

As a site owner,
I want to remove a site I no longer own,
So that its keys leave Inflozo.

**Acceptance Criteria:**

**Given** a connected site
**When** I confirm its removal
**Then** its keys are deleted from the Vault

### Story 3.5: Health-check retry policy

As a site owner,
I want the health check to retry three times before it emails me,
So that one flaky minute does not read as a broken connection.

**Acceptance Criteria:**

**Given** a site that fails once and answers on the retry
**When** the daily check runs
**Then** no email is sent

## Epic 9: The Shell Block

The complete site-wide chrome plus every template the compiler emits, one category at a time behind the owner's gate.

### Story 9.1: Headers & Navigation

As a site owner,
I want the header designs placeable and compiled,
So that a real Ghost site renders with Inflozo's chrome.

**Acceptance Criteria:**

**Given** the first header design on the canvas
**When** the theme deploys to ghost6.inflozo.com
**Then** the header renders as drawn

### Story 9.2: Footers

As a site owner,
I want the footer designs placeable and compiled,
So that every page ends as drawn.

**Acceptance Criteria:**

**Given** a footer design on the canvas
**When** the theme deploys
**Then** the footer renders as drawn
"""

DEMO_STATUS = """generated: 09-05-2026 10:00
last_updated: 09-11-2026 18:40
project: Inflozo

development_status:
  epic-1: in-progress
  1-1-repository-next-js-app-and-ci-to-production-vercel: done
  1-2-design-tokens-and-components-from-the-export: review
  1-3-magic-link-sign-in-with-the-branded-emails: done
  1-4-the-dashboard-shell-and-navigation: review
  1-5-the-database-schema-applied-to-the-supabase-project: done
  epic-1-retrospective: optional

  epic-3: in-progress
  3-1-connect-wizard-validates-the-three-keys: in-progress
  3-2-daily-health-check-and-the-reconnect-needed-email: ready-for-dev
  3-3-multi-site-management-and-key-rotation: backlog
  3-4-site-removal-with-the-confirm-sheet: blocked
  3-5-health-check-retry-policy: in-progress
  epic-3-retrospective: optional

  epic-9: backlog
  9-1-headers-navigation: ready-for-dev
  9-2-footers: backlog
"""


def demo_spec(e, s, slug, status, extra_fm, body):
    return (f'_bmad-output/implementation-artifacts/spec-{e}-{s}-{slug}.md',
            f"---\ntitle: 'demo'\ntype: 'feature'\ncreated: '2026-09-05'\nstatus: '{status}'\n"
            f"review_loop_iteration: 0\n{extra_fm}---\n\n{body}")


DEMO_SPECS = [
 demo_spec(1, 1, 'repository-next-js-app-and-ci', 'done', 'owner_test: passed\nbaseline_commit: 0000001\n', """
## Intent

**Problem:** Nothing runs anywhere yet.

## In plain English

The app exists and every push to main puts it live on the real Vercel project. You can open the live address and see the sign-in page. Nothing else works yet.

## Code Map

- `app/layout.tsx` -- the shell every page renders inside
- `.github/workflows/deploy.yml` -- the pipeline

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- create the Next.js app -- the platform E1 names
- [x] `.github/workflows/deploy.yml` -- deploy on push -- NFR-6(d)

**Acceptance Criteria:**
- Given a push to main, when the pipeline runs, then the production project serves it

## Owner's manual test

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | https://demo.example/ | Sign in | Open the address | — | The sign-in page from frame S1a |

## Verification

**Commands:**
- `curl -s https://api.vercel.com/v9/projects/inflozo` -- expected: 200, the production project
"""),
 demo_spec(1, 2, 'design-tokens-and-components', 'in-review', 'baseline_commit: 0000002\n', """
## In plain English

Every colour, size and control the app uses now comes from the design export, generated rather than typed. You will not see a new screen; every later screen is built from this.

## Tasks & Acceptance

**Execution:**
- [x] `lib/tokens.ts` -- generate from Calibration Set -- R-74
- [x] `components/sidebar/*` -- lift the Editor Sidebar Kit controls -- R-74
- [ ] `tests/tokens.test.ts` -- byte-compare against the frame -- the acceptance criterion

**Acceptance Criteria:**
- Given the export, when tokens are generated, then every value matches the frame

## Verification

**Commands:**
- `npm test -- tokens` -- expected: every token equal to the frame's
"""),
 demo_spec(1, 3, 'magic-link-sign-in', 'done', 'owner_test: pending\nbaseline_commit: 0000003\n', """
## In plain English

A visitor can type their email and get a sign-in link. The email is the branded one, sent through Resend. Clicking the link signs them in and lands them on the dashboard.

## Code Map

- `app/sign-in/page.tsx` -- the S1a screen
- `lib/auth/magic-link.ts` -- issues the link through Supabase Auth
- `emails/magic-link.tsx` -- the branded template

## Tasks & Acceptance

**Execution:**
- [x] `app/sign-in/page.tsx` -- build from frame S1a -- R-74
- [x] `lib/auth/magic-link.ts` -- Supabase signInWithOtp with the Resend transport -- FR-A1
- [x] `emails/magic-link.tsx` -- the branded template -- FR-P1 email (1)

**Acceptance Criteria:**
- Given a typed address, when Continue is pressed, then a Resend email arrives within a minute
- Given the link in that email, when it is opened, then the dashboard loads signed in
- The screen matches frame S1a

## Questions for the owner

QUESTION 1 — What happens when someone types an address that has no account?

Today the link email is sent either way and the account is created on first sign-in, the way Ghost itself does it. Example: a stranger types hello@example.com and receives a sign-in email.

1. Send the email and create the account on first click. (RECOMMENDED)
   One screen, no "do you have an account" question, and nothing to get wrong.
2. Refuse unknown addresses with "no account for this email".
   Tells strangers which addresses exist, which is a small privacy leak.
3. Ask "new here?" first and show a separate sign-up form.
   Two screens to draw and maintain for the same result.

## Owner's manual test

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | https://demo.example/sign-in | Sign in | Type the address and press Continue | owner+test1@inflozo.com | "Check your email" with the address repeated |
| 2 | your inbox | — | Open the email from Inflozo | — | The branded email: logo, one button "Sign in to Inflozo" |
| 3 | the button in the email | Dashboard | Click it | — | The dashboard opens signed in, your address at top right |
| 4 | https://demo.example/sign-in | Sign in | Type a wrong address and press Continue | not-an-email | The field turns red: "That does not look like an email address" |

## Verification

**Commands:**
- `curl -s https://inflozo.vercel.app/api/health` -- expected: 200 from the production project
- `POST https://api.resend.com/emails` -- expected: 200, one message id
"""),
 demo_spec(1, 4, 'dashboard-shell', 'in-review', 'owner_test: issues\nbaseline_commit: 0000004\n', """
## In plain English

Signed-in users see the dashboard: the top bar, the project list and the connected-sites strip. Nothing in it does anything yet beyond navigation.

## Tasks & Acceptance

**Execution:**
- [x] `app/(app)/layout.tsx` -- the shell from frame S2a -- R-74

**Acceptance Criteria:**
- Given a signed-in session, when the dashboard opens, then it matches frame S2a

## Owner's manual test

1. Open https://demo.example/dashboard — the dashboard — sign in first — you should see the top bar and an empty project list.
2. Press the New project button — the create sheet — nothing to type — you should see the sheet from frame S3a open.

## Owner's test findings

- The top bar's logo is the old coral one, not the ink one in S2a.
- The New project button opens the sheet but Esc does not close it.
"""),
 demo_spec(1, 5, 'database-schema', 'done', 'owner_test: none\nbaseline_commit: 0000005\n', """
## In plain English

The real database now exists with every table and every policy from the architecture, and the security proof passes against it. There is no screen; nothing to look at yet.

## Tasks & Acceptance

**Execution:**
- [x] `SCHEMA.sql` -- applied to the production project -- AD-26
- [x] `RLS-TEST.sql` -- run against it -- E1's exit criterion

**Acceptance Criteria:**
- Given the production project, when RLS-TEST.sql runs, then every assertion passes

## Verification

**Commands:**
- `psql postgresql://…@db.abcdefgh.supabase.co:5432/postgres -f RLS-TEST.sql` -- expected: every assertion passes
"""),
 demo_spec(3, 1, 'connect-wizard', 'in-progress', 'owner_test: pending\nbaseline_commit: 0000006\n', """
## In plain English

A site owner pastes three keys into the connect wizard and each is checked against their real Ghost site as they type. A wrong key is caught before anything is saved.

## Tasks & Acceptance

**Execution:**
- [x] `app/sites/connect/page.tsx` -- the wizard from frame S5a -- R-74
- [ ] `app/api/ghost/config/route.ts` -- server-side GET /admin/config/ through the proxy -- AD-3
- [ ] `lib/ghost/validate.ts` -- the three-key validation -- FR-C2

**Acceptance Criteria:**
- Given a valid Admin key for T1, when the wizard validates, then it shows the site title and version
"""),
 demo_spec(3, 2, 'daily-health-check', 'ready-for-dev', '', """
## In plain English

Every day Inflozo checks each connected site still answers to its key. When one stops, the owner gets one email and the site shows a Reconnect badge.

## Questions for the owner

Should the daily check also run right after a deploy, or only on its schedule? A deploy already talks to the site, so a second check may be redundant.
"""),
 demo_spec(3, 4, 'site-removal', 'blocked', 'owner_test: pending\nbaseline_commit: 0000007\n', """
## In plain English

A site owner can remove a site from Inflozo. The confirm sheet says what is deleted, and the keys leave the Vault the moment they confirm.

## Questions for the owner

QUESTION 1 — Should removing a site also delete the projects that were deployed to it?

Example: you remove your test site; two projects were last deployed there.

1. Keep the projects; they simply lose their linked site. (RECOMMENDED)
   Nothing a user made is destroyed by a connection change.
2. Delete the projects with the site.
   One action, but it throws away work.

Answer: 1 — keep the projects (owner, 2026-09-04).

**2. Should the removed site's name be free to reuse straight away?**

Example: you remove "my-blog" and want to connect a new site under the same name the same afternoon.

1. **Free it straight away (RECOMMENDED)** — nothing holds the name once the keys are gone.
2. Hold it for thirty days in case the removal was a mistake.
"""),
]

DEMO_LOG = """a1b2c3d\t2026-09-11\tStory 1.4 - Test - 2 findings
b2c3d4e\t2026-09-11\tStory 1.4 - Deploy - dashboard shell live on the production project
c3d4e5f\t2026-09-11\tStory 1.3 - Deploy - sign-in live, the test steps carry the URLs
d4e5f60\t2026-09-10\tStory 1.3 - Review - real-infra verifier hit Resend and Supabase Auth
e5f6071\t2026-09-10\tStory 3.2 - Create - health check spec, one question for the owner
f607182\t2026-09-10\tStory 3.1 - Create - connect wizard spec against frame S5a
0718293\t2026-09-09\tStory 1.3 - Dev - magic link issued through Resend, session cookie set
18293a4\t2026-09-09\tStory 1.4 - Review - shell matches S2a, one nit fixed
293a4b5\t2026-09-08\tStory 1.4 - Dev - dashboard shell from frame S2a
3a4b5c6\t2026-09-08\tStory 1.3 - Create - sign-in spec with the owner's test script
4b5c6d7\t2026-09-08\tStory 1.2 - Dev - tokens and controls lifted from the export
4b5c6d8\t2026-09-08\tStory 1.2 - Dvelop - a phase word with a typo, which the commit-msg hook now rejects
5c6d7e8\t2026-09-07\tStory 1.4 - Create - dashboard shell spec
5c6d7e9\t2026-09-07\tStory 3.4 - Blocked - waits on the owner: do removed sites take their projects with them
5c6d7f0\t2026-09-07\tStory 3.4 - Create - site removal spec against frame S6b
6d7e8f9\t2026-09-07\tStory 1.2 - Create - token spec
6d7e900\t2026-09-07\tHotfix - the sign-in email's logo was the coral one
6d7e901\t2026-09-07\tEpic 1 - Retro - two findings carried to E3
6d7e902\t2026-09-07\tStory 1.5 - Deploy - schema applied to the production Supabase project, RLS-TEST green
6d7e903\t2026-09-07\tStory 1.5 - Review - the proof re-run against the real project
6d7e904\t2026-09-06\tStory 1.5 - Dev - SCHEMA.sql applied
6d7e905\t2026-09-06\tStory 1.5 - Create - schema story spec, no screen
7e8f901\t2026-09-07\tStory 1.1 - Done - accepted by the owner
8f90112\t2026-09-06\tStory 1.1 - Deploy - production project serves main
90a1223\t2026-09-06\tStory 1.1 - Review - pipeline verified against the real Vercel project
a1b2334\t2026-09-06\tStory 1.1 - Dev - Next.js app and the deploy workflow
b2c3445\t2026-09-05\tStory 1.1 - Create - foundations spec
c3d4556\t2026-09-05\tStep 6 - Create - epics and stories
d4e5667\t2026-09-04\tThe owner walked 5b — step 6 opens""".splitlines()

DEMO_DEFERRED = """# Deferred work

### DW-1: Health-check retries are fixed at three
origin: code review of spec-3-1-connect-wizard.md, 2026-09-10
location: n/a
severity: low
reason: A retry count belongs in configuration once a second caller exists; today there is one.
status: open

### DW-2: The sign-in page has no rate limit of its own
plain: Someone could hammer the sign-in page with requests; the email service already stops the emails, so nothing is at risk today.
origin: code review of spec-1-3-magic-link-sign-in.md, 2026-09-10
location: app/sign-in/page.tsx
severity: medium
reason: Supabase Auth limits magic links per address already; a page-level limit is E15's hardening work.
status: open

### DW-3: The deploy job runs before the gate
origin: code review of spec-1-1-repository.md, 2026-09-10
location: .github/workflows/ci.yml
severity: medium
reason: A red gate could publish; the deploy job needs the check job.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 — deploy now declares needs:[check, rls].

### DW-4: The container's storage stand-in permits deletes
origin: code review of spec-1-2-data-model.md, 2026-09-10
location: supabase/tests/PRELUDE.sql
severity: low
reason: The offline copy is laxer than hosted Supabase.
status: closed
closed: Story 1.2 — the stand-in carries the same policy.

### DW-5: Three live-harness controls the keys screen still owes
origin: code review of spec-3-6-manage-keys.md, 2026-09-10
location: tools/probe/run-verify-ghost-admin.py
severity: low
reason: The seedings need a second decoy.
status: open — amended by Story 3.9 (2026-09-11); THE CODE LANDED, THE PROOF IS OWED.
resolution: Story 3.9 — all three seedings are in the harness, and none has been executed.
"""


def demo():
    """The same page from an in-memory fixture — and this script's self-check, one story per rule."""
    phase, step6, step6b, briefs = prompts_from_sequence(read(SEQ))
    ctx = {'epics': load_epics(DEMO_EPICS), 'have_epics': True, 'have_status': True,
           'status': load_status(DEMO_STATUS), 'specs': load_specs(DEMO_SPECS),
           'commits': load_commits(DEMO_LOG), 'deferred': load_deferred(DEMO_DEFERRED),
           'deferred_exists': True, 'phase_prompts': phase, 'step6': step6, 'step6b': step6b, 'briefs': briefs,
           'demo': True, 'stamp': 'from the demo fixture'}
    out = render(ctx)
    flat = {s['key']: s for ep in ctx['epics'] for s in ep['stories']}
    lanes = {s['lane'] for s in flat.values()}
    assert lanes == {k for k, _ in LANES}, f'the fixture does not populate every lane: {lanes}'
    assert flat['1.4']['issues'] and flat['1.3']['phase'] == 'Test' and flat['1.3']['handoff']
    assert flat['1.1']['phase'] == 'Done' and len(flat['1.1']['commits']) == 5
    # F2: a tracker `done` is not Done until the owner's test — 1.3 is done in the tracker, owner_test pending
    assert flat['1.3']['lane'] == 'test' and flat['1.3']['status'] == 'done'
    # F5/6.1: owner_test: none + a Deploy commit is Done without a Done commit, and never the owner's move
    assert flat['1.5']['phase'] == 'Done' and 'Done' not in [c['phase'] for c in flat['1.5']['commits']]
    # F1: a tracker-only status (no spec, no commit) moves the lane
    assert flat['3.5']['lane'] == 'progress' and flat['3.5']['spec'] is None and not flat['3.5']['commits']
    assert flat['3.1']['lane'] == 'progress' and flat['3.2']['lane'] == 'ready' and flat['3.3']['lane'] == 'backlog'
    # 4.1: blocked from the tracker and the trail; the question carries an Answer line
    assert flat['3.4']['blocked'] and flat['3.4']['spec']['questions'][0]['answered']
    # ── THE RULING CONTRACT. A ruling is the owner's SIGNED, DATED decision; anything else is open,
    #    and a block that claims a ruling and carries neither the signature nor the open token stops
    #    the build rather than being guessed at. Every shape below is one the repository has really
    #    written — the assertions are the contract, not examples of it.
    # The signature is what answers, in each of the shapes the specs use:
    assert answered('**Ruled (owner, 2026-09-05): option 1 — leave it as built.**')
    assert answered('**Ruled: option 1 (the owner, 2026-09-09).** Build it in Epic 7.')
    assert answered('**Ruled:** option 2 (owner, 2026-09-07) — recorded as **R-95**.')
    assert answered('**Ruled:** "leave it" *(owner, 2026-09-04)* — **option 1**.')
    assert answered('Ruled: option 1 — the eighth email (owner, 2026-09-07).')
    # …and its absence does not, however much the line LOOKS like a ruling. Three questions were
    # hidden from the owner by successive guesses at prose — 1.1's two, 1.5's tab-order, and 3.5's
    # Question 3 — so the inference is gone (owner, 2026-09-09).
    assert not answered('### Q\n\n**Ruled:**\n')            # the empty placeholder
    assert not answered('### Q\n\n**Ruled:** option 1\n')    # unsigned: nobody said who or when
    assert not answered('**Ruled** — option 1')
    assert not answered('Answer: 1 — keep the projects.')
    # THE MISFILE THAT PRODUCED THIS CONTRACT, kept as a case so it cannot come back: a placeholder
    # that names the owner and carries a date, and was read as an answer because the words after
    # the colon were not empty. The open TOKEN decides, and it beats any ruling text beside it.
    assert not answered('**Raised at Dev, 2026-09-09.** Ask.\n\n1. yes\n2. no\n\n'
                        '**Ruled:** _(awaiting the owner)_ — Dev shipped option 1 in the meantime.')
    assert not answered('**Ruled:** _(awaiting the owner)_ (owner, 2026-09-09)')
    # …and prose is still not a ruling label at all.
    assert not answered('either way. It is here because the\nanswer is yours and not mine, and if you pick 2')
    assert not answered('the\nruling amends them** (R-74 is the owner\'s to amend, and he just did)')
    assert not answered('Ruled (owner, 2026-09-05)')          # a label with no ruling after it
    # A DATE IN THE ASK IS NOT A SIGNATURE. Every question this story writes is dated where it was
    # raised, and reading that as the owner's answer would hide it exactly as before.
    assert not answered('Raised at Dev (owner, 2026-09-09) — ask.\n\n1. yes\n2. no\n')
    # A DATE THE RULING MERELY **CITES** IS NOT A SIGNATURE EITHER, and this is the fourth shape of
    # the same failure (review, 2026-09-09). The bare-date alternative of `RULED_STAMP` was always
    # meant as "a date beside his name in the prose"; without `NAMES_HIM` it was any date at all,
    # so a ruling that pointed at an EARLIER decision — the commonest sentence in these specs —
    # signed itself. Both shapes below rendered `ruled` and were flagged by nothing.
    assert not answered('### Q\n\n1. yes\n2. no\n\n**Ruled:** option 1 — Dev shipped it (2026-09-09).')
    assert not answered('### Q\n\n1. yes\n2. no\n\n**Ruled:** option 2 — it follows the rule set at (2026-09-02).')
    # …while a bare date that DOES sit beside his name still answers, which is the shape the specs
    # use when the ruling names him in prose rather than in the parenthesis.
    assert answered('**Ruled:** option 1 — the owner picked it on the call (2026-09-09).')
    # ── AND THE REFUSAL. A question that claims a ruling but carries neither mark is UNREADABLE,
    #    and the board stops instead of rendering a state it invented.
    unreadable = {'k': {'questions': question_blocks(
        '### Question 1 - one\n\nAsk.\n\n1. yes\n2. no\n\n**Ruled:** option 1, I think.\n')}}
    bad = unclassifiable_questions(unreadable)
    assert len(bad) == 1, \
        'an unsigned ruling did not stop the build — the board would have guessed at it'
    # …and it NAMES ITSELF on that one line, because the gate reports only the last line of stderr.
    assert 'Question 1' in bad[0] and 'option 1, I think' in bad[0], bad[0]
    for fine in ('**Ruled:** option 1 (owner, 2026-09-05).', '**Ruled:** _(awaiting the owner)_', ''):
        ok = {'k': {'questions': question_blocks(
            '### Question 1 - one\n\nAsk.\n\n1. yes\n2. no\n\n' + fine + '\n')}}
        assert not unclassifiable_questions(ok), f'this is readable and was refused: {fine!r}'
    # F9: past Dev with no real service named → the amber tag; a real service named → none
    assert flat['1.2']['unverified'] and not flat['1.1']['unverified'] and not flat['1.5']['unverified']
    # …and the production domains count while a mere @inflozo.com ADDRESS does not. The first
    # writing of this alternative matched both, so a spec that named no service but quoted a test
    # email cleared the one pill that exists to fail it (review 4, 2026-09-09).
    for names in ('driven on app.inflozo.com', 'the marketing site inflozo.com', 'on www.inflozo.com'):
        assert REAL_SERVICE.search(names), f'a production domain is not a real service: {names!r}'
    # …and a sentence that STARTS with the domain still counts: prose capitalises, and the pill
    # this feeds is amber-by-default, so case was one more way to flag a story that named a real
    # service (review, 2026-09-09).
    assert REAL_SERVICE.search('App.inflozo.com answered 200'), 'the domain is not case-sensitive'
    for nothing in ('signed in as owner+test1@inflozo.com', 'a my-inflozo.com fixture', 'mocked throughout'):
        assert not REAL_SERVICE.search(nothing), f'this names no real service: {nothing!r}'
    # …and the pill's explanation is rendered inside every story it flags, and only those
    flagged = sum(1 for st in flat.values() if st['unverified'])
    assert flagged and out.count('What the amber') == flagged, out.count('What the amber')
    # 2.1: the library epic gates its stories on the one before
    assert flat['9.1']['waits'] is None and flat['9.2']['waits'] == '9.1' and 'waits for 9.1' in out
    # F6: the commit vocabulary, and everything else shaped like ours is listed rather than dropped
    kinds = {c['kind'] for c in ctx['commits']}
    assert {'story', 'step', 'hotfix', 'retro', 'unreadable', 'other'} <= kinds, kinds
    assert '<tr class="dim' in out, 'a non-story commit is not greyed in the feed'
    assert 'Dvelop' in out and 'Unreadable commits' in out
    # The three panels paint from a tone; a tone that loses to its own element default is the bug
    # this pair catches, because both classes are one class and only source order separates them.
    assert re.search(r'<tr class="p-Deploy( band)?">', out) and re.search(r'<tr class="s-mute( band)?">', out), \
        'activity rows carry no tone'
    # the activity feed shades alternate stories: as many banded runs as there are story changes
    feed_html = out.split('id="pd-activity"', 1)[1].split('</table>', 1)[0]
    rows_n, banded = feed_html.count('<tr class='), feed_html.count(' band">')
    assert 0 < banded < rows_n, f'the activity feed is all one band or none ({banded} of {rows_n})'
    assert '<span class="st s-crit solid">not answerable yet' in out, 'a shapeless question is not flagged red'
    # every prompt lives inside the one container, Completed included — never a box per prompt
    sd = out.split('id="sd-1-1"', 1)[1].split('</section>', 1)[0]
    box = sd.split('class="pbox"', 1)[1]
    assert sd.count('class="pbox"') == 1 and 'class="prh"' not in out, 'prompts still carry their own box'
    assert box.count('<h4 class="sub">Completed') == 1, 'Completed is not a subheading inside the box'
    assert box.count('<ul class="pl acc prl">') == 2, 'the two prompt lists are not both inside the box'
    assert 'class="lede">Someone could hammer' in out, 'a deferred entry ignores its plain: line'
    # …and a repeated DW id is caught, because one was spent twice inside a single story
    assert dup_dw_ids('### DW-1: a\n### DW-2: b\n### DW-1: c\n') == ['DW-1']
    assert dup_dw_ids('### DW-1: a\n### DW-2: b\n') == []
    assert 'A retry count belongs in configuration' in out, 'an entry with no plain: lost its reason'
    # The ledger's canonical close is `status: done <date>`, and this board read only `closed` until
    # the owner's test of Story 3.9 found 26 closed entries counted as open. Both spellings close,
    # they count as ONE chip whatever date the status carries, and a `resolution:` on an entry that
    # is still open closes NOTHING — that last one is the regression that would mark unproved work
    # done, so it is asserted from both sides.
    assert dw_closed({'status': 'done 2026-09-11 (Story 3.9)', 'closed': ''}), 'the canonical close does not read'
    assert dw_closed({'status': 'closed', 'closed': ''}) and dw_closed({'status': '**closed** — see above', 'closed': ''}), \
        'the hand-written close does not read'
    assert not dw_closed({'status': 'open — amended by Story 3.9; THE CODE LANDED', 'closed': ''}), \
        'a part-closed entry reads as closed'
    assert not dw_closed({'status': 'open', 'closed': ''}), 'an open entry reads as closed'
    dwp = out.split('id="pd-deferred"', 1)[1].split('</section>', 1)[0]
    assert '<span class="st s-good solid">2 closed</span>' in dwp, \
        f'the two closed entries are not one chip of 2: {re.findall(r"solid\">(\d+ [a-z]+)<", dwp)}'
    assert '<h3 class="sub">Closed <span class="fine">2</span>' in dwp, 'the Closed section did not take both'
    assert '<b>Resolution:</b>' in dwp and '<b>Closed:</b>' in dwp, \
        'an open entry\'s resolution is labelled as a closure, or a closure lost its note'
    assert CSS.index('.st{') < CSS.index('.s-crit{'), 'a tone must be declared after the chip it overrides'
    # A `**N. …**` heading starts a question; an option line, which begins with a bare digit, does not.
    # Before this, spec 1.2's four questions read as one and three of them were invisible.
    q34 = flat['3.4']['spec']['questions']
    assert len(q34) == 2 and q34[1]['title'].startswith('2. Should the removed site'), \
        f'a `**N. …**` question heading did not start a block: {[q["title"][:30] for q in q34]}'
    assert [len(x) > 0 for x in q34[1]['parts']] == [True, True, False], 'the three parts did not split'
    assert q34[0]['parts'][2].startswith('Answer: 1'), 'the ruling did not end the first question'
    # Prose ahead of the first question is a preamble, not a question. Spec 2.3 opens its section
    # with one sentence, and it sat "open" in the owner's inbox for ever because nothing can rule a
    # sentence (review 3, 2026-09-08). Options are what tell the two apart, both ways round.
    pre = question_blocks('Two decisions from the review. Both are yours.\n\n'
                          '### Question 1 - a real one\n\nAsk.\n\n1. **(RECOMMENDED)** do it\n2. do not\n')
    assert [q['title'] for q in pre] == ['Question 1 - a real one'], \
        f'a preamble was counted as a question: {[q["title"][:40] for q in pre]}'
    keep = question_blocks('Should we do it?\n\n1. **(RECOMMENDED)** yes\n2. no\n\n'
                           '### Question 2 - another\n\nAsk.\n\n1. yes\n2. no\n')
    assert len(keep) == 2, 'a headless question that carries its options was dropped as a preamble'
    wrapped = question_blocks('### Question 1 - a real one\n\nAsk.\n\n1. yes\n2. no\n\n'
                              '**Ruled: option 1** (owner, 2026-09-05). It falls back only where\n'
                              'Question 1 still decides. Executed as `x`.\n')
    assert len(wrapped) == 1 and wrapped[0]['answered'], \
        f'a wrapped prose line beginning "Question N" started a block: {[q["title"][:40] for q in wrapped]}'
    # …and the blank line that must precede a heading is a BLANK LINE, not the two bytes `\n\n`.
    # Either of these dropped its second heading and hid the question under it (review 4).
    for gap in ('\r\n\r\n', '\n \n', '\n\t\n'):
        two = question_blocks('### Question 1 - one\n\nAsk.\n\n1. yes\n2. no' + gap +
                              '### Question 2 - two\n\nAsk.\n\n1. yes\n2. no\n')
        assert len(two) == 2, f'a heading after {gap!r} was swallowed: {[q["title"][:30] for q in two]}'
    # ...and a `###` heading needs NO blank line above it at all: it is a heading because it is one,
    # and demanding the blank line lost the question under it (review 5). The bare shapes still
    # need the guard, which is the `wrapped` case above.
    tight = question_blocks('### Question 1 - one\n\nAsk.\n\n1. yes\n2. no\n'
                            '### Question 2 - two\n\nAsk.\n\n1. yes\n2. no\n')
    assert len(tight) == 2, \
        f'a heading with no blank line above it was swallowed: {[q["title"][:30] for q in tight]}'
    # A headless, optionless block that ASKS is a question, not a preamble — the one shape R-83
    # exists to flag, which the pop was silently deleting (review 5).
    shapeless = question_blocks('Which way should this go?\n\n### Question 2 - two\n\nAsk.\n\n1. yes\n2. no\n')
    assert len(shapeless) == 2, \
        f'a shapeless question was dropped as a preamble: {[q["title"][:40] for q in shapeless]}'
    assert not shapeless[0]['options'], 'the shapeless question must still fail R-83'
    q13, q32 = flat['1.3']['spec']['questions'], flat['3.2']['spec']['questions']
    assert q13[0]['options'] and q13[0]['recommended'], 'the shaped question must pass R-83'
    assert not q32[0]['options'], 'the shapeless question must fail R-83'
    assert NO_OPTIONS.split('.')[0] in out and 'DEMO DATA' in out and flat['1.3']['spec']['test']['kind'] == 'table'
    assert flat['1.4']['spec']['test']['kind'] == 'list'
    # the two-line test form, with the dummy value on its own copy button
    assert 'data-text="owner+test1@inflozo.com"' in out and 'You should see:' in out
    # F13: the plain-sentence fallback reads as English
    assert 'can the app deployed' not in out and 'wants the health check to retry' in out
    assert 'Story 1.3 from _bmad-output/planning-artifacts/epics.md' in out, 'the {E.S} placeholder was not filled'
    assert '/command.' not in out, 'never tell the owner every prompt starts with a /command'
    # the briefing extractor: the blockquote right before a fence, and only that one, only that shape
    assert fenced('> **Before you paste it** — one\n> two\n```\nA\n```\n\n> a note\n\n```\nB\n```\n') == \
        [('A', '**Before you paste it** — one\ntwo'), ('B', '')]
    return out


def main():
    if '--demo' in sys.argv:
        path = sys.argv[sys.argv.index('--demo') + 1]
        open(path, 'w', encoding='utf8').write(demo())
        print(f'wrote {path} (demo fixture; self-check passed)')
        return 0
    if '--check' in sys.argv:
        # THE SELF-CHECK RUNS IN THE GATE, not only on request. `demo()` holds every assertion
        # this script has — including the ruling parser that decides whether the owner ever SEES
        # a question (R-83/R-84) — and nothing invoked it: `doc-audit.py` runs this file with
        # `--check`, which only compared rendered HTML, so a parser regression regenerated the
        # board, the pre-commit hook's one retry matched the file it had just rewritten, and the
        # gate went green over a question it had hidden. Found by the review of Story 1.5
        # (2026-09-05), on the commit that fixed that very parser.
        try:
            demo()
        except Exception as e:  # noqa: BLE001 — a crash in demo() is a failed self-check too
            # Not only AssertionError: a KeyError in a fixture used to leave a bare traceback whose
            # last line the gate did not recognise, so it said "STALE — run story-board.py", which
            # cannot fix it (review, 2026-09-06). The traceback still goes first, for the reader.
            import traceback; traceback.print_exc()
            # `str(e)`, not `e`: an exception object is ALWAYS truthy, so the `or` below was dead
            # and a bare `assert x` — which most of demo() is — printed the line with nothing
            # after the dash (review, 2026-09-06).
            what = str(e) if isinstance(e, AssertionError) else f'{type(e).__name__}: {e}'
            print(f'story board: SELF-CHECK FAILED — {what or "an assertion in demo() did not hold"}',
                  file=sys.stderr)
            return 2
        dupes = dup_dw_ids(read(DEFERRED) or '')
        if dupes:
            print(f'story board: DEFERRED LEDGER — {", ".join(dupes)} used twice in '
                  f'deferred-work.md; a DW id is an identity, so one entry is lost to every cite '
                  f'and every sweep that keys on it', file=sys.stderr)
            return 2
    data = real()
    # A QUESTION WHOSE STATE THE BOARD CANNOT READ STOPS THE BUILD — it is not rendered in a guessed
    # state and it is not quietly dropped. The gate runs this file with `--check` on every commit,
    # so a spec cannot reach `main` with a question the owner might never be shown. `dup_dw_ids`
    # above is the same shape: a refusal, at exit 2, that names what to fix.
    unread = unclassifiable_questions(data['specs'])
    if unread:
        print('story board: UNREADABLE QUESTION — the board decides `ruled` vs `open` by reading, '
              'never by inferring, so it will not render these. A ruling carries the owner\'s '
              'signature and date — `(owner, 2026-09-05)` — and a question still his carries the '
              'token `_(awaiting the owner)_`. These carry neither:', file=sys.stderr)
        for line in unread:
            print(f'  {line}', file=sys.stderr)
        print(f'story board: UNREADABLE QUESTION — {"; ".join(unread)}', file=sys.stderr)
        return 2
    out = render(data)
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf8').read() if os.path.exists(OUT) else ''
        if cur.strip() != out.strip():
            open(OUT, 'w', encoding='utf8').write(out)
            print('STORY-BOARD.html was stale and has been regenerated'); return 1
        print('story board: current'); return 0
    open(OUT, 'w', encoding='utf8').write(out)
    print(f'wrote {os.path.relpath(OUT, ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
