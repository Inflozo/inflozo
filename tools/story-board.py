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
  - the phase prompts from build-sequence.md step 7, "### The phase prompts", by needle;
  - the deferred-work ledger, when it exists.
`--check` regenerates in memory and fails if the file differs, so the gate (tools/doc-audit.py) keeps it
current — and because git output is a source, a new commit makes the page stale on purpose.

The `--demo` fixture feeds markdown strings through the SAME loaders, so it exercises the real parsers
and doubles as this script's self-check: it asserts every lane is populated and the R-83 flags fire.
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

# The phase prompts under "### The phase prompts" of build-sequence.md step 7, matched by a NEEDLE that
# occurs in that block and no other — never by position (the build board once paired a prompt with the
# wrong step by order). The last block records the owner's test and ends in a Done or a Test commit.
PROMPTS = [('Create', 'CREATE THE SPEC ONLY'), ('Dev', 'IMPLEMENT the spec'),
           ('Review', '/bmad-code-review'), ('Deploy', 'Deploy story {E.S}'),
           ('Fix', 'FIX the owner'), ('Record', "Record the owner's test")]
PROMPT_LABEL = {'Create': 'Create the spec', 'Dev': 'Build it', 'Review': 'Review it',
                'Deploy': 'Deploy it', 'Fix': 'Fix your findings', 'Record': 'Record your test'}
STEPS = ['Create', 'Dev', 'Review', 'Deploy', 'Test', 'Done']           # the stepper, in order
PROMPT_FOR = {'Create': 'Create', 'Dev': 'Dev', 'Review': 'Review', 'Deploy': 'Deploy',
              'Test': 'Record', 'Fix': 'Fix', 'Done': None}             # phase → the prompt to run next
LANES = [('backlog', 'Backlog'), ('ready', 'Ready'), ('progress', 'In progress'),
         ('review', 'In review'), ('test', 'Deployed, your test'), ('done', 'Done')]
LANE_NAME = dict(LANES)

# The same grammar bmad-sprint-planning's sprint_plan.py uses, so the board and the tracker agree on
# what an epic, a story and a status key are (a split story is `2-6a-…`).
EPIC_RE = re.compile(r'^#{1,3}\s*Epic\s+(\d+)\s*:?\s*(.*?)\s*#*\s*$', re.I)
STORY_RE = re.compile(r'^#{2,4}\s*Story\s+(\d+)\.(\d+[a-z]?)\s*:?\s*(.*?)\s*#*\s*$', re.I)
STORY_KEY_RE = re.compile(r'^(\d+)-(\d+[a-z]?)-.+')
SPEC_RE = re.compile(r'^spec-(\d+)-(\d+[a-z]?)-(.+)\.md$')
STORY_COMMIT = re.compile(r'^Story (\d+)\.(\d+[a-z]?) - (\w+) - (.*)$')
STEP_COMMIT = re.compile(r'^Step (\S+) - (\w+) - (.*)$')


def snum(s):
    """'12a' → (12, 'a') so stories sort numerically."""
    m = re.match(r'(\d+)([a-z]?)', s)
    return int(m.group(1)), m.group(2)


# ─────────────────────────────────────────────────────────────────────────────
# Loaders. Each takes TEXT, so the demo fixture runs through the same code.
# ─────────────────────────────────────────────────────────────────────────────

def fenced(md):
    return re.findall(r'^```[^\n]*\n(.*?)\n```[ \t]*$', md, re.M | re.S)


def prompts_from_sequence(seq):
    """(phase prompts by name, step-6 prompt, step-6b prompt) — extracted, never retyped."""
    m = re.search(r'^### The phase prompts[^\n]*\n(.*?)(?=^# |\Z)', seq, re.M | re.S)
    assert m, 'build-sequence.md has no "### The phase prompts" section under step 7'
    blocks = fenced(m.group(1))
    phase = {}
    for name, needle in PROMPTS:
        hits = [b for b in blocks if needle in b]
        assert len(hits) == 1, f'phase prompt {name}: needle {needle!r} matches {len(hits)} blocks, not one'
        phase[name] = hits[0]
    assert len(phase) == len(blocks), ('a fenced block under "### The phase prompts" is claimed by no '
                                       'entry in PROMPTS — add it rather than let it vanish')
    step = {}
    for cmd in ('/bmad-create-epics-and-stories', '/bmad-sprint-planning'):
        hits = [b for b in fenced(seq) if b.lstrip().startswith(cmd)]
        assert len(hits) == 1, f'build-sequence.md has {len(hits)} fenced blocks starting {cmd}, not one'
        step[cmd] = hits[0]
    return phase, step['/bmad-create-epics-and-stories'], step['/bmad-sprint-planning']


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
    """The flat `development_status:` mapping, stdlib only. Returns {key: status}."""
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
            st[m.group(1)] = m.group(2).strip().strip('\'"')
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
    test = parse_test(sec("Owner's manual test"))
    return {'rel': rel, 'fm': fm, 'status': fm.get('status', ''), 'owner_test': fm.get('owner_test', ''),
            'plain': sec('In plain English'), 'tasks': tasks, 'ac': ac, 'codemap': codemap,
            'questions': question_blocks(sec('Questions for the owner')),
            'test': test, 'findings': sec("Owner's test findings"),
            'test_urls': bool(re.search(r'https?://', sec("Owner's manual test")))}


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


def question_blocks(text):
    """One block per question: a `###` heading or a 'QUESTION n' line starts one; else the whole section.
    R-83 says each carries numbered options and a (RECOMMENDED) mark — both are checked, not assumed."""
    if not text.strip():
        return []
    starts = [m.start() for m in re.finditer(r'^(?:#{3,6}\s+|\**\s*(?:QUESTION|Question|Q)\s*\d+)', text, re.M)]
    if not starts or starts[0] != 0:
        starts = [0] + starts
    out = []
    for a, b in zip(starts, starts[1:] + [len(text)]):
        blk = text[a:b].strip()
        if not blk:
            continue
        first = re.sub(r'^#+\s*|\*', '', blk.split('\n', 1)[0]).strip()
        # ponytail: "answered" is a line starting Answer/Answered/Ruled/Ruling/Decision — the spec has no
        # field for it yet; add one to the template if this heuristic ever misfiles a question.
        if len(first) > 110:
            first = first[:110].rsplit(' ', 1)[0] + ' …'
        out.append({'title': first, 'text': blk,
                    'options': bool(re.search(r'^\s*\d+[.)]\s+\S', blk, re.M)),
                    'recommended': '(RECOMMENDED)' in blk,
                    'answered': bool(re.search(r'^\s*\**\s*(Answer|Answered|Ruled|Ruling|Decision)\b',
                                               blk, re.M | re.I))})
    return out


def load_specs(files):
    """{(epic, story): spec} from [(rel path, text)] whose basename is spec-<E>-<S>-<slug>.md."""
    specs = {}
    for rel, text in files:
        m = SPEC_RE.match(os.path.basename(rel))
        if m:                                       # exact segment equality: 1-1 never matches 1-10
            specs[(int(m.group(1)), m.group(2))] = parse_spec(rel, text)
    return specs


def load_commits(lines):
    """`hash<TAB>date<TAB>subject` lines, newest first → the story- and step-shaped ones (R-81)."""
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
    return out


def load_deferred(text):
    """The DW-<n> entries of deferred-work.md; a ledger with no headings is read as bullets."""
    out = []
    heads = list(re.finditer(r'^### (DW-\d+):\s*(.+?)\s*$', text, re.M))
    for i, m in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
        blk = text[m.end():end]
        f = dict(re.findall(r'^(\w+):\s*(.*)$', blk, re.M))
        out.append({'id': m.group(1), 'title': m.group(2), 'status': f.get('status', 'open'),
                    'severity': f.get('severity', ''), 'reason': f.get('reason', ''),
                    'origin': f.get('origin', ''), 'location': f.get('location', '')})
    if not out:
        out = [{'id': '', 'title': t, 'status': 'open', 'severity': '', 'reason': '', 'origin': '', 'location': ''}
               for t in re.findall(r'^[-*] (.*)$', text, re.M)]
    return out


# ─────────────────────────────────────────────────────────────────────────────
# Derivation: where a story is, and what runs next.
# ─────────────────────────────────────────────────────────────────────────────

def derive(story, status, specs, commits):
    """Sets lane, phase, issues, blocked, spec, commits on the story.

    The commit trail (R-81 makes one per phase) is the freshest signal, so it decides when present;
    the sprint status and the spec frontmatter decide otherwise. `owner_test: pending` alone does not
    mean deployed — Create sets it too — so Test needs a Deploy commit or a live URL in the test steps."""
    st = status.get((story['e'], story['s']), 'backlog')
    spec = specs.get((story['e'], story['s']))
    ss = spec['status'] if spec else ''
    ot = spec['owner_test'] if spec else ''
    mine = [c for c in commits if c['kind'] == 'story' and (c['e'], c['s']) == (story['e'], story['s'])]
    phases = [c['phase'] for c in mine]
    last = next((p for p in phases if p != 'Blocked'), None)
    # ponytail: a placeholder that is itself an http URL reads as deployed; the Deploy commit is the
    # signal R-81 guarantees, the URL is the fallback for a spec written before its first commit.
    deployed = 'Deploy' in phases or bool(spec and spec['test_urls'])
    if st == 'done' or ss == 'done' or last == 'Done':
        phase, lane = 'Done', 'done'
    elif last == 'Test':
        phase, lane = 'Fix', 'test'
    elif last == 'Deploy':
        phase, lane = 'Test', 'test'
    elif last == 'Review':
        phase, lane = 'Deploy', 'review'
    elif last in ('Dev', 'Fix'):
        phase, lane = 'Review', 'review'
    elif last == 'Create':
        phase, lane = 'Dev', 'progress' if 'in-progress' in (st, ss) else 'ready'
    elif ot == 'issues':
        phase, lane = 'Fix', 'test'
    elif ot == 'pending' and deployed:
        phase, lane = 'Test', 'test'
    elif st == 'review' or ss == 'in-review':
        phase, lane = 'Review', 'review'
    elif st in ('ready-for-dev', 'in-progress') or ss in ('ready-for-dev', 'in-progress'):
        phase, lane = 'Dev', 'progress' if 'in-progress' in (st, ss) else 'ready'
    else:
        phase, lane = 'Create', 'backlog'
    story.update(status=st, spec=spec, commits=mine, phase=phase, lane=lane,
                 issues=phase == 'Fix', blocked=bool(phases) and phases[0] == 'Blocked')


def epic_status(ep, status):
    if ep['stories']:
        if all(s['lane'] == 'done' for s in ep['stories']):
            return 'done'
        return 'progress' if any(s['lane'] != 'backlog' for s in ep['stories']) else 'backlog'
    return {'in-progress': 'progress'}.get(status.get(f"epic-{ep['n']}", 'backlog'), 'backlog') \
        if status.get(f"epic-{ep['n']}") != 'done' else 'done'


def plain_sentence(st):
    """Until a spec exists: the story's As-a / I-want / So-that as one plain sentence."""
    if not st['as']:
        return ''
    s = f"A {st['as']} can {re.sub(r'^to\s+', '', st['want'])}"
    return s + (f", so that {st['so']}." if st['so'] else '.')


def fill(prompt, story):
    spec = story['spec']
    path = spec['rel'] if spec else f"_bmad-output/implementation-artifacts/spec-{story['e']}-{story['s']}-*.md"
    return prompt.replace('{E.S}', story['key']).replace('{spec}', path)


# ─────────────────────────────────────────────────────────────────────────────
# Rendering
# ─────────────────────────────────────────────────────────────────────────────

def md(s):
    """Escape, then the inline marks the specs use: **bold**, `code`, [text](url), bare URLs."""
    s = e(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
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
    t = story['spec']['test']
    key = story['key']
    if t['kind'] == 'table':
        head = ''.join(f'<th>{md(h)}</th>' for h in t['head'])
        rows = ''.join(f'<tr><td><input class="tick" type="checkbox" data-k="{e(key)}:{i}" '
                       f'aria-label="step {i} done"></td>' + ''.join(f'<td>{md(c)}</td>' for c in r) + '</tr>'
                       for i, r in enumerate(t['rows'], 1))
        body = f'<div class="tw"><table class="mt"><thead><tr><th>✓</th>{head}</tr></thead><tbody>{rows}</tbody></table></div>'
    elif t['kind'] == 'list':
        body = '<ol class="steps">' + ''.join(
            f'<li><label><input class="tick" type="checkbox" data-k="{e(key)}:{i}"> {md(s)}</label></li>'
            for i, s in enumerate(t['steps'], 1)) + '</ol>'
    else:
        body = mdblock(t['text'])
    return (f'<div class="tbox" data-sub="test"><h3>Your test, on the live site</h3>{body}'
            '<p class="fine">Ticks are stored in this browser only, as a convenience. Your ruling still '
            'goes through chat — tell me what you found, passed or not.</p></div>')


def render_questions(story):
    qs = [q for q in story['spec']['questions']] if story['spec'] else []
    if not qs:
        return ''
    items = []
    for q in qs:
        flags = ''
        if q['answered']:
            flags += '<span class="tag good">answered</span>'
        else:
            if not q['options']:
                flags += '<span class="tag warn">needs options</span>'
            elif not q['recommended']:
                flags += '<span class="tag warn">needs a (RECOMMENDED)</span>'
        items.append(f'<div class="q">{mdblock(q["text"])}{("<p class=flags>" + flags + "</p>") if flags else ""}</div>')
    return (f'<div class="qbox" data-sub="questions"><h3>Questions for you</h3>{"".join(items)}'
            '<p class="fine">Answer in chat, by number. A question is written in plain English with '
            'numbered options and one marked RECOMMENDED (R-83); one flagged in amber was not, and the '
            'next run must rewrite it before you are asked to rule.</p></div>')


def render_story(story, ep, phase_prompts):
    spec, key, kid = story['spec'], story['key'], story['key'].replace('.', '-')
    phase = story['phase']
    cur = STEPS.index('Test' if phase == 'Fix' else phase)
    stepper = ''.join(
        f'<li class="{"issues" if (phase == "Fix" and i == cur) else "cur" if i == cur else "done" if i < cur or phase == "Done" else ""}">{s}</li>'
        for i, s in enumerate(STEPS))
    plain = (spec and spec['plain']) or plain_sentence(story)
    parts = [f'<header><span class="ebadge">E{ep["n"]} · {e(ep["title"])}</span>'
             f'<h2><span class="key">{e(key)}</span> {e(story["title"])}</h2>'
             f'<p class="meta"><span class="lanechip {story["lane"]}">{e(LANE_NAME[story["lane"]])}</span> '
             f'<span class="ph {phase}">{phase}</span>'
             + (' <span class="tag crit">blocked</span>' if story['blocked'] else '')
             + (f' <span class="fine">spec status: {e(spec["status"] or "—")}'
                + (f' · owner test: {e(spec["owner_test"])}' if spec['owner_test'] else '') + '</span>' if spec else '')
             + '</p></header>']
    parts.append(mdblock(plain) if plain else '<p class="fine">No plain-English summary yet — the Create phase writes one.</p>')
    parts.append(f'<ol class="stepper">{stepper}</ol>')
    pk = PROMPT_FOR[phase]
    if pk:
        parts.append(f'<div class="now"><b>Next: {e(PROMPT_LABEL[pk])}</b> '
                     f'<button class="btn copy" data-copy="pr-{kid}-{pk}">Copy the {pk} prompt</button>'
                     f'<span class="fine">Paste it into a Claude Code chat, including the leading /command.</span></div>')
    parts.append(render_questions(story))
    if spec and spec['test']:
        parts.append(render_test(story))
    if spec and spec['findings']:
        parts.append(f'<h3>Your test findings</h3>{mdblock(spec["findings"])}')
    ac = spec['ac'] if spec and spec['ac'] else None
    if ac:
        parts.append('<h3>Acceptance criteria</h3><ul class="md">' + ''.join(f'<li>{md(a)}</li>' for a in ac) + '</ul>')
    elif story.get('ac'):
        parts.append('<h3>Acceptance criteria</h3><ul class="md">' + ''.join(
            '<li>' + '<br>'.join(md(l) for l in c) + '</li>' for c in story['ac']) + '</ul>')
    if spec and spec['tasks']:
        n = sum(1 for d, _ in spec['tasks'] if d)
        parts.append(f'<h3>Tasks <span class="fine">{n} of {len(spec["tasks"])} ticked</span></h3><ul class="tasks">'
                     + ''.join(f'<li class="{"done" if d else ""}">{md(t)}</li>' for d, t in spec['tasks']) + '</ul>')
    if spec and spec['codemap']:
        parts.append('<h3>Files this story touches</h3><ul class="md">' + ''.join(f'<li>{md(c)}</li>' for c in spec['codemap']) + '</ul>')
    if story['commits']:
        parts.append('<h3>Commits</h3><table class="ct">' + ''.join(
            f'<tr><td>{e(c["date"])}</td><td><code>{e(c["h"])}</code></td><td><span class="ph {e(c["phase"])}">{e(c["phase"])}</span></td>'
            f'<td>{e(c["msg"])}</td></tr>' for c in story['commits']) + '</table>')
    else:
        parts.append('<h3>Commits</h3><p class="fine">None yet. Every phase ends with one: '
                     f'<code>Story {e(key)} - Phase - one line</code>.</p>')
    order = ([pk] if pk else []) + [p for p, _ in PROMPTS if p != pk]
    parts.append('<h3>Every prompt for this story</h3>' + ''.join(
        f'<div class="pr {"cur" if p == pk else ""}"><div class="prh"><b>{p} — {e(PROMPT_LABEL[p])}</b>'
        + ('<span class="tag good">now</span>' if p == pk else '')
        + f'<button class="btn copy" data-copy="pr-{kid}-{p}">Copy prompt</button></div>'
        f'<pre id="pr-{kid}-{p}">{e(fill(phase_prompts[p], story))}</pre></div>' for p in order))
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
    search = ' '.join([story['key'], story['title'], (story['spec'] or {}).get('plain', '') or plain_sentence(story),
                       story['phase'], LANE_NAME[story['lane']], f'E{ep["n"]}', ep['title']]).lower()
    cls = ' '.join(filter(None, ['card', story['lane'], 'issues' if story['issues'] else '',
                                 'blocked' if story['blocked'] else '']))
    btn = (f'<button class="cp" data-copy="pr-{kid}-{pk}" title="Copy the {pk} prompt">⧉ {pk}</button>' if pk else '')
    tag = ''
    if story['issues']:
        tag = '<span class="tag crit">issues</span>'
    elif story['lane'] == 'test':
        tag = '<span class="tag warn">your move</span>'
    if story['blocked']:
        tag += '<span class="tag crit">blocked</span>'
    return (f'<article class="{cls}" data-e="{ep["n"]}" data-s="{e(search)}" id="c-{kid}">'
            f'<div class="ch"><span class="ebadge">E{ep["n"]}</span><span class="key">{e(story["key"])}</span>'
            f'<span class="ph {story["phase"]}">{story["phase"]}</span></div>'
            f'<h3><a href="#{e(story["key"])}">{e(story["title"])}</a></h3>'
            f'<div class="cf">{btn}{tag}<a class="more" href="#{e(story["key"])}" aria-label="open story {e(story["key"])}">…</a></div></article>')


def next_action(ctx, stories):
    """(kind, title, why, prompt text or None, link or None)."""
    if not ctx['have_epics']:
        return ('setup', 'Run step 6 — the story breakdown',
                'There is no epics.md yet, so the lanes are empty and the epics on the left come from the '
                'PRD. Copy this prompt into a Claude Code chat; it writes the epics and stories, and the '
                'board fills on the next commit.', ctx['step6'], None)
    if not ctx['have_status']:
        return ('setup', 'Run step 6b — the readiness gate',
                'epics.md exists but the sprint tracker (sprint-status.yaml) does not, so every story '
                'shows as backlog. This prompt checks readiness and writes the tracker.', ctx['step6b'], None)
    yours = [s for s in stories if s['lane'] == 'test' and s['phase'] == 'Test']
    if yours:
        s = yours[0]
        return ('you', f'Your test — story {s["key"]}, {s["title"]}',
                'It is live on the real site. Open the story, follow the numbered steps, and tell me in '
                'chat what you saw. Then this prompt records your verdict.',
                fill(ctx['phase_prompts']['Record'], s), f'#{s["key"]}/test')
    rank = {'Fix': 0}
    lane_rank = {'review': 1, 'progress': 2, 'ready': 3, 'backlog': 4}
    open_ = [s for s in stories if s['lane'] != 'done']
    if not open_:
        return ('done', 'Every story is done', 'Nothing is open. The launch gates are on the build board.', None, None)
    s = min(open_, key=lambda x: (rank.get(x['phase'], lane_rank.get(x['lane'], 5)), x['e'], snum(x['s'])))
    pk = PROMPT_FOR[s['phase']]
    return ('run', f'Story {s["key"]} — {PROMPT_LABEL[pk]}',
            f'{s["title"]}. It is in the {LANE_NAME[s["lane"]].lower()} lane at the {s["phase"]} phase; '
            f'copy the {pk} prompt and paste it into a Claude Code chat.',
            fill(ctx['phase_prompts'][pk], s), f'#{s["key"]}')


CSS = """
:root{--good:var(--build);--good-s:var(--build-s);--warn:var(--patch);--warn-s:var(--patch-s);
--crit:#b42318;--crit-s:#fdeceb;--wait:#8b8b93;--rail:224px}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--crit:#f08b80;--crit-s:#3a1a17;--wait:#75757e}}
[hidden]{display:none!important}
html,body{height:100%}body{display:flex;flex-direction:column;overflow:hidden}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
a{color:var(--accent)}
.top{display:flex;align-items:center;gap:14px;padding:9px 18px;border-bottom:1px solid var(--line);
background:var(--card);flex-wrap:wrap}
.top h1{font-size:1.1rem;margin:0}
.kick{color:var(--accent);font-weight:650;font-size:.7rem;letter-spacing:.09em;text-transform:uppercase;display:block}
.demo{background:var(--crit);color:#fff;font-weight:800;font-size:.74rem;padding:4px 10px;border-radius:99px;letter-spacing:.08em}
.pulse{display:flex;gap:5px;flex-wrap:wrap;align-items:center;font-size:.78rem;color:var(--muted)}
.pulse .lbl{margin:0 2px 0 8px;text-transform:uppercase;letter-spacing:.06em;font-size:.66rem;font-weight:700}
.chip{display:inline-flex;align-items:center;gap:5px;padding:1px 8px;border-radius:99px;background:var(--code);
border:1px solid var(--line);color:var(--ink);font-size:.74rem;font-weight:600;text-decoration:none}
.chip i{width:8px;height:8px;border-radius:50%;background:var(--wait)}
.chip.done i{background:var(--good)}.chip.progress i,.chip.review i{background:var(--accent)}
.chip.test i{background:var(--warn)}.chip.ready i{background:var(--accent);opacity:.5}
.tools{margin-left:auto;display:flex;gap:7px;align-items:center}
#q{font:inherit;font-size:.84rem;padding:6px 10px;border:1px solid var(--line);border-radius:8px;
background:var(--bg);color:var(--ink);width:210px}
.btn b{background:var(--crit);color:#fff;border-radius:99px;padding:0 7px;margin-left:5px;font-size:.7rem}
.btn b.zero{background:var(--line);color:var(--muted)}
.next{margin:10px 18px 0;background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);
border-radius:12px;padding:9px 16px 10px;box-shadow:var(--sh)}
.next.you{border-left-color:var(--warn)}.next.done{border-left-color:var(--good)}
.next .nh{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.next h2{font-size:.98rem;margin:0}
.next p{margin:3px 0 7px;color:var(--muted);font-size:.86rem;max-width:120ch}
.next .na{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.next details{flex-basis:100%}.next summary{cursor:pointer;font-size:.8rem;color:var(--accent)}
.next pre{margin:6px 0 0;max-height:200px}
.board{flex:1;min-height:0;display:grid;grid-template-columns:var(--rail) 1fr;gap:12px;padding:10px 18px 10px}
.rail{overflow:auto;display:flex;flex-direction:column;gap:6px;padding-right:3px;min-height:0}
.ep{font:inherit;text-align:left;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--line);
border-radius:10px;padding:7px 10px;cursor:pointer;color:var(--ink);flex:none}
.ep:hover{border-color:var(--accent)}.ep.on{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-s)}
.ep.done{border-left-color:var(--good)}.ep.progress{border-left-color:var(--accent)}
.ep .et{display:flex;gap:6px;align-items:baseline;font-size:.78rem;font-weight:650;line-height:1.25}
.ep .en{color:var(--muted);font-weight:700;font-size:.68rem;flex:none}
.ep .em{display:block;color:var(--muted);font-size:.7rem;margin-top:2px}
.epbar{height:5px;border-radius:3px;background:var(--line);margin-top:6px;overflow:hidden}
.epbar i{display:block;height:100%;background:var(--good)}
.lanes{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;min-height:0}
.lane{display:flex;flex-direction:column;min-height:0;background:var(--code);border-radius:12px;border:1px solid var(--line)}
.lane h2{font-size:.78rem;margin:0;padding:8px 10px;display:flex;align-items:center;gap:6px;border-bottom:1px solid var(--line);line-height:1.2}
.lane h2::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--wait);flex:none}
.lane h2 .n{margin-left:auto;background:var(--card);border:1px solid var(--line);border-radius:99px;padding:0 7px;
font-size:.7rem;color:var(--muted);white-space:nowrap}
.lane.ready h2::before{background:var(--accent);opacity:.5}.lane.progress h2::before,.lane.review h2::before{background:var(--accent)}
.lane.test h2::before{background:var(--warn)}.lane.done h2::before{background:var(--good)}
.lane.test{border-color:var(--warn)}
.cards{overflow:auto;flex:1;padding:8px;display:flex;flex-direction:column;gap:8px}
.card{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--wait);border-radius:9px;
padding:7px 9px 8px;box-shadow:var(--sh);font-size:.78rem;flex:none}
.card.ready,.card.progress,.card.review{border-left-color:var(--accent)}.card.test{border-left-color:var(--warn)}
.card.done{border-left-color:var(--good);opacity:.8}.card.issues,.card.blocked{border-left-color:var(--crit)}
.card .ch{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
.ebadge{font-size:.66rem;font-weight:700;padding:1px 6px;border-radius:99px;background:var(--accent-s);color:var(--accent);white-space:nowrap}
.key{font-weight:700;font-size:.78rem}
.ph{margin-left:auto;font-size:.64rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:1px 6px;
border-radius:99px;background:var(--code);color:var(--muted);white-space:nowrap}
.ph.Test{background:var(--warn-s);color:var(--warn)}.ph.Fix,.ph.Blocked{background:var(--crit-s);color:var(--crit)}
.ph.Done{background:var(--good-s);color:var(--good)}.ph.Dev,.ph.Review,.ph.Deploy{background:var(--accent-s);color:var(--accent)}
.card h3{font-size:.8rem;font-weight:600;margin:5px 0 7px;line-height:1.3}.card h3 a{color:inherit;text-decoration:none}
.card h3 a:hover{color:var(--accent)}
.card .cf{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
.cp{font:inherit;font-size:.7rem;font-weight:650;padding:3px 8px;border-radius:7px;border:1px solid var(--accent);
background:var(--accent);color:#fff;cursor:pointer;white-space:nowrap}
.cp.ok,.btn.ok{background:var(--good);border-color:var(--good);color:#fff}
.more{margin-left:auto;text-decoration:none;color:var(--muted);font-weight:700;padding:0 7px;border-radius:6px;
border:1px solid var(--line);font-size:.8rem;line-height:1.5}
.more:hover{color:var(--accent);border-color:var(--accent)}
.empty{color:var(--muted);font-size:.76rem;padding:10px 8px;text-align:center;line-height:1.45}
.tag{display:inline-block;font-size:.64rem;font-weight:700;padding:1px 7px;border-radius:99px;vertical-align:middle;
text-transform:uppercase;letter-spacing:.04em}
.tag.warn{background:var(--warn);color:#fff}.tag.good{background:var(--good-s);color:var(--good)}.tag.crit{background:var(--crit-s);color:var(--crit)}
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:20}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(660px,94vw);background:var(--card);border-left:1px solid var(--line);
box-shadow:-8px 0 30px rgba(0,0,0,.18);z-index:21;overflow:auto;padding:16px 22px 48px}
.drawer .close{position:sticky;top:0;float:right;font:inherit;font-size:.88rem;border:1px solid var(--line);
background:var(--card);border-radius:8px;padding:3px 9px;cursor:pointer;z-index:1}
.sd header .ebadge{font-size:.72rem}
.sd h2,.pd h2{font-size:1.18rem;margin:8px 0 4px;letter-spacing:-.01em;line-height:1.3}
.sd h3,.pd h3{font-size:.74rem;margin:18px 0 6px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:700}
.sd h3 .fine{text-transform:none;letter-spacing:0;font-weight:500;margin-left:6px}
.meta{margin:0 0 4px;font-size:.8rem;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.lanechip{font-weight:700;font-size:.72rem;padding:2px 9px;border-radius:99px;background:var(--code);color:var(--muted)}
.lanechip.test{background:var(--warn-s);color:var(--warn)}.lanechip.done{background:var(--good-s);color:var(--good)}
.lanechip.progress,.lanechip.review,.lanechip.ready{background:var(--accent-s);color:var(--accent)}
.fine{color:var(--muted);font-size:.8rem}
.md{font-size:.9rem;line-height:1.55}.md p{margin:5px 0}.md ul,.md ol{padding-left:1.35em;margin:4px 0}.md h4{margin:10px 0 2px;font-size:.92rem}
.stepper{display:flex;gap:4px;list-style:none;margin:12px 0;padding:0}
.stepper li{flex:1;text-align:center;font-size:.7rem;font-weight:700;padding:5px 2px;border-radius:7px;background:var(--code);color:var(--muted)}
.stepper li.done{background:var(--good-s);color:var(--good)}.stepper li.cur{background:var(--accent);color:#fff}
.stepper li.issues{background:var(--crit);color:#fff}
.now{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--accent-s);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:.88rem}
.qbox{border:1px solid var(--warn);background:var(--warn-s);border-radius:10px;padding:8px 14px 10px;margin:12px 0}
.qbox h3{color:var(--warn);margin-top:4px}.q{padding:6px 0;border-top:1px solid rgba(0,0,0,.08)}.q:first-of-type{border-top:0}
.flags{margin:4px 0 0}
.tbox{border:1px solid var(--accent);border-radius:10px;padding:8px 14px 10px;margin:12px 0}
.tbox h3{color:var(--accent);margin-top:4px}
.tw{overflow-x:auto;max-width:100%}
table.mt{border-collapse:collapse;width:100%;font-size:.8rem;margin:6px 0}
.mt th,.mt td{border:1px solid var(--line);padding:5px 7px;text-align:left;vertical-align:top;overflow-wrap:anywhere}
.mt th{background:var(--code);font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.steps{padding-left:1.4em;font-size:.88rem}.steps li{margin:4px 0}
.tasks{list-style:none;padding:0;margin:0}.tasks li{padding:2px 0 2px 22px;position:relative;font-size:.86rem}
.tasks li::before{content:'☐';position:absolute;left:2px;color:var(--muted)}.tasks li.done::before{content:'☑';color:var(--good)}
.tasks li.done{color:var(--muted)}
.ct{width:100%;border-collapse:collapse;font-size:.8rem}.ct td{padding:4px 6px;border-top:1px solid var(--line);vertical-align:top}
.ct td:first-child{white-space:nowrap;color:var(--muted)}
.pr{border:1px solid var(--line);border-radius:10px;margin:8px 0;overflow:hidden}
.pr.cur{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-s)}
.prh{display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--code);font-size:.84rem}.prh b{flex:1}
.pr pre{border:0;border-radius:0;margin:0;max-height:280px}
.links{font-size:.84rem;color:var(--muted);margin-top:16px}
.dw{border-top:1px solid var(--line);padding:8px 0}.dw:first-of-type{border-top:0}.dw b{display:block}
.help p{margin:6px 0;font-size:.92rem;line-height:1.55}.help dt{font-weight:700;margin-top:8px}.help dd{margin:0 0 4px;color:var(--muted);font-size:.9rem}
footer{padding:6px 18px;margin:0;border-top:1px solid var(--line);font-size:.72rem;color:var(--muted);background:var(--card)}
@media(max-width:1100px){.lanes{grid-template-columns:repeat(3,minmax(0,1fr))}.board{grid-template-columns:1fr;grid-template-rows:auto 1fr}
.rail{flex-direction:row;overflow-x:auto}.ep{min-width:180px}}
@media print{.tools,.scrim,.drawer,.next details{display:none!important}body{overflow:visible;height:auto}.cards,.rail{overflow:visible}}
"""

JS = r"""
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const drawer=$('#drawer'),dbody=$('#dbody'),store=$('#details'),scrim=$('#scrim'),q=$('#q');
let openSec=null,epicFilter='',lastFocus=null;
function copy(txt){                       // file:// has no clipboard API in some browsers
  if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(txt);
  const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);
  ta.select();document.execCommand('copy');ta.remove();return Promise.resolve();}
function openSection(id,sub){
  const s=document.getElementById(id);if(!s)return;
  if(openSec&&openSec!==s){openSec.hidden=true;store.append(openSec);}
  lastFocus=lastFocus||document.activeElement;
  openSec=s;dbody.append(s);s.hidden=false;drawer.hidden=false;scrim.hidden=false;paintTicks(s);
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
  const c=e.target.closest('[data-copy]');
  if(c){const src=document.getElementById(c.dataset.copy);if(!src)return;
    copy(src.textContent).then(()=>{const o=c.textContent;c.textContent='Copied';c.classList.add('ok');
      setTimeout(()=>{c.textContent=o;c.classList.remove('ok');},1400);});return;}
  const p=e.target.closest('[data-panel]');
  if(p){location.hash='#'+p.dataset.panel;return;}
  if(e.target.closest('.close')||e.target===scrim){closeDrawer();return;}
  const ep=e.target.closest('.ep');
  if(ep){epicFilter=(epicFilter===ep.dataset.e)?'':ep.dataset.e;apply();}});
function apply(){
  const s=q.value.trim().toLowerCase();
  $$('.card').forEach(c=>{c.hidden=(epicFilter&&c.dataset.e!==epicFilter)||(s&&!c.dataset.s.includes(s));});
  $$('.lane').forEach(l=>{const all=l.querySelectorAll('.card'),shown=[...all].filter(c=>!c.hidden);
    l.querySelector('.n').textContent=shown.length===all.length?all.length:shown.length+' of '+all.length;});
  $$('.ep').forEach(b=>b.classList.toggle('on',b.dataset.e===epicFilter));}
q.addEventListener('input',apply);
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(!drawer.hidden)closeDrawer();else if(document.activeElement===q){q.value='';apply();q.blur();}}
  else if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();q.focus();q.select();}});
window.addEventListener('hashchange',route);route();
"""


def render(ctx):
    epics, status = ctx['epics'], ctx['status']
    stories = []
    for ep in epics:
        ep['stories'].sort(key=lambda s: snum(s['s']))
        for st in ep['stories']:
            derive(st, status, ctx['specs'], ctx['commits'])
            stories.append((st, ep))
        ep['status'] = epic_status(ep, status)
    flat = [s for s, _ in stories]

    # ── the pulse (every number derived here) ──
    ep_n = {k: sum(1 for ep in epics if ep['status'] == k) for k in ('done', 'progress', 'backlog')}
    lane_n = {k: sum(1 for s in flat if s['lane'] == k) for k, _ in LANES}
    open_qs = [(s, ep, q) for s, ep in stories if s['spec'] and s['lane'] != 'done'
               for q in s['spec']['questions'] if not q['answered']]
    pulse = (f'<span class="lbl">Epics</span><span class="chip done"><i></i>{ep_n["done"]} done</span>'
             f'<span class="chip progress"><i></i>{ep_n["progress"]} in progress</span>'
             f'<span class="chip"><i></i>{ep_n["backlog"]} not started</span>'
             f'<span class="lbl">Stories</span>'
             + ''.join(f'<span class="chip {k}"><i></i>{lane_n[k]} {e(n.lower())}</span>' for k, n in LANES))

    kind, title, why, prompt, link = next_action(ctx, flat)
    na = f'<section class="next {kind}"><div class="nh"><span class="kick">Next action</span><h2>{e(title)}</h2></div><p>{e(why)}</p><div class="na">'
    if prompt:
        na += '<button class="btn copy" data-copy="na-prompt">Copy prompt</button>'
    if link:
        na += f'<a class="btn" href="{e(link)}">Open the story</a>'
    if prompt:
        na += f'<details><summary>Show the prompt</summary><pre id="na-prompt">{e(prompt)}</pre></details>'
    na += '</div></section>'

    # ── the epic rail ──
    rail = ['<button class="ep all" data-e="">'
            f'<span class="et">All epics</span><span class="em">{len(epics)} epics · {len(flat)} stories</span></button>']
    for ep in epics:
        n_done = sum(1 for s in ep['stories'] if s['lane'] == 'done')
        tot = len(ep['stories'])
        pct = int(100 * n_done / tot) if tot else 0
        meta = f'{n_done} of {tot} stories done' if tot else 'no stories yet'
        rail.append(f'<button class="ep {ep["status"]}" data-e="{ep["n"]}" title="{e(ep["goal"])}">'
                    f'<span class="et"><span class="en">E{ep["n"]}</span><span>{e(ep["title"])}</span></span>'
                    f'<span class="em">{e(meta)}</span><span class="epbar"><i style="width:{pct}%"></i></span></button>')

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
    details = [render_story(s, ep, ctx['phase_prompts']) for s, ep in stories]
    if open_qs:
        ql = ''.join(f'<div class="dw"><b><a href="#{e(s["key"])}/questions">{e(s["key"])} · {e(s["title"])}</a></b>'
                     f'{e(q["title"])}'
                     + ('<span class="tag warn"> needs options</span>' if not q['options'] else
                        '<span class="tag warn"> needs a (RECOMMENDED)</span>' if not q['recommended'] else '')
                     + '</div>' for s, ep, q in open_qs)
    else:
        ql = '<p class="fine">Nothing is waiting on you. A question appears here the moment a spec writes one under "Questions for the owner".</p>'
    details.append(f'<section class="pd" id="pd-questions" hidden><h2>Questions for you <span class="fine">{len(open_qs)} open</span></h2>'
                   '<p class="fine">Everything the build needs you to decide, across every story. Open one, read the options, answer in chat by number.</p>'
                   f'{ql}</section>')
    feed = ctx['commits'][:20]
    if feed:
        rows = ''.join(f'<tr><td>{e(c["date"])}</td><td><code>{e(c["h"])}</code></td>'
                       f'<td>{("<a href=#" + e(c["key"]) + ">" + e(c["key"]) + "</a>") if c["kind"] == "story" else e(c["key"])} '
                       f'<span class="ph {e(c["phase"])}">{e(c["phase"])}</span></td><td>{e(c["msg"])}</td></tr>' for c in feed)
        act = f'<table class="ct">{rows}</table>'
    else:
        act = '<p class="fine">No story commits yet. Every phase ends with one, shaped <code>Story E.S - Phase - one line</code>, and they appear here as they land.</p>'
    details.append(f'<section class="pd" id="pd-activity" hidden><h2>Activity <span class="fine">the last {len(feed)} story commits</span></h2>{act}</section>')
    if ctx['deferred']:
        dw = ''.join(f'<div class="dw"><b>{e(d["id"] + " · " if d["id"] else "")}{e(d["title"])}'
                     + (f' <span class="tag {"crit" if d["severity"] in ("critical", "high") else "warn" if d["severity"] else "good"}">{e(d["severity"] or d["status"])}</span>' if (d['severity'] or d['status']) else '')
                     + f'</b><span class="fine">{e(d["reason"])}'
                     + (f' — {e(d["origin"])}' if d['origin'] else '') + '</span></div>' for d in ctx['deferred'])
    else:
        dw = ('<p class="fine">Nothing has been deferred.' + ('' if ctx['deferred_exists'] else ' The ledger (deferred-work.md) does not exist yet; a review writes it the first time it sets something aside.') + '</p>')
    details.append(f'<section class="pd" id="pd-deferred" hidden><h2>Deferred work <span class="fine">{len(ctx["deferred"])} entries</span></h2>'
                   '<p class="fine">Things a review chose not to do inside its story. Each is a small decision for later, not a bug in what shipped.</p>'
                   f'{dw}</section>')
    details.append('''<section class="pd help" id="pd-help" hidden><h2>How to read this board</h2>
<p>Every card is one story. A story moves left to right as it is built, and it comes to you once, in the amber lane.</p>
<dl>
<dt>Backlog</dt><dd>Not started. Its spec has not been written.</dd>
<dt>Ready</dt><dd>The spec is written and waiting to be built.</dd>
<dt>In progress</dt><dd>Being built now.</dd>
<dt>In review</dt><dd>Being checked against the real services, then deployed. Nothing for you to do yet.</dd>
<dt>Deployed, your test</dt><dd>Live on the real site and waiting for <b>you</b>. Open the card, follow the numbered steps, and say what you saw in chat. A red stripe means you reported issues and they are being fixed.</dd>
<dt>Done</dt><dd>You accepted it.</dd>
</dl>
<p><b>The phases.</b> Create (write the spec) → Dev (build it) → Review (check it on the real services) → Deploy (put it live) → Test (you) → Done. If your test finds issues: Fix → Review → Deploy → Test again, inside the same story.</p>
<p><b>The prompts.</b> Each card carries a copy button for the phase it is in; the story panel carries every phase's prompt. Paste one into a Claude Code chat exactly as copied, including the first line that starts with a slash.</p>
<p><b>The commit rule.</b> Every phase ends with a commit and push to main, shaped <code>Story E.S - Phase - one line</code>. This board reads those commits, so a story's history is its commit list, and the board itself is regenerated on every commit — reload it after each one.</p>
<p><b>Questions for you.</b> The inbox in the top bar lists every open question across every story. Each is plain English with numbered options and one marked RECOMMENDED; answer in chat by number.</p>
<p><b>Keys.</b> <code>/</code> focuses the search, <code>Esc</code> closes a panel. The ticks on a test script are stored in this browser only; your verdict still goes through chat.</p>
</section>''')

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
  <div class="pulse">{pulse}</div>
  <div class="tools"><input id="q" type="search" placeholder="Search stories  ( / )" aria-label="search stories">
    <button class="btn" data-panel="questions">Questions for you <b class="{'zero' if not open_qs else ''}">{len(open_qs)}</b></button>
    <button class="btn" data-panel="activity">Activity</button>
    <button class="btn" data-panel="deferred">Deferred</button>
    <button class="btn" data-panel="help">Help</button></div>
</header>
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
    phase, step6, step6b = prompts_from_sequence(seq)
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
            'phase_prompts': phase, 'step6': step6, 'step6b': step6b, 'demo': False,
            'stamp': f'on {head}' if head else 'outside git'}


DEMO_EPICS = """# Inflozo - Epic Breakdown

## Overview

Demo fixture. Two epics from the PRD's §8, six stories, one per lane, plus one with issues.

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
"""

DEMO_STATUS = """generated: 09-05-2026 10:00
last_updated: 09-11-2026 18:40
project: Inflozo

development_status:
  epic-1: in-progress
  1-1-repository-next-js-app-and-ci-to-production-vercel: done
  1-2-design-tokens-and-components-from-the-export: review
  1-3-magic-link-sign-in-with-the-branded-emails: review
  1-4-the-dashboard-shell-and-navigation: review
  epic-1-retrospective: optional

  epic-3: in-progress
  3-1-connect-wizard-validates-the-three-keys: in-progress
  3-2-daily-health-check-and-the-reconnect-needed-email: ready-for-dev
  3-3-multi-site-management-and-key-rotation: backlog
  epic-3-retrospective: optional
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
 demo_spec(1, 3, 'magic-link-sign-in', 'in-review', 'owner_test: pending\nbaseline_commit: 0000003\n', """
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
- `curl -s https://demo.example/api/health` -- expected: 200 from the production project
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
2. Press the New project button — the create sheet — nothing to type — the sheet from frame S3a opens.

## Owner's test findings

- The top bar's logo is the old coral one, not the ink one in S2a.
- The New project button opens the sheet but Esc does not close it.
"""),
 demo_spec(3, 1, 'connect-wizard', 'in-progress', 'owner_test: pending\nbaseline_commit: 0000005\n', """
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
5c6d7e8\t2026-09-07\tStory 1.4 - Create - dashboard shell spec
6d7e8f9\t2026-09-07\tStory 1.2 - Create - token spec
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
origin: code review of spec-1-3-magic-link-sign-in.md, 2026-09-10
location: app/sign-in/page.tsx
severity: medium
reason: Supabase Auth limits magic links per address already; a page-level limit is E15's hardening work.
status: open
"""


def demo():
    """The same page from an in-memory fixture — and this script's self-check."""
    phase, step6, step6b = prompts_from_sequence(read(SEQ))
    ctx = {'epics': load_epics(DEMO_EPICS), 'have_epics': True, 'have_status': True,
           'status': load_status(DEMO_STATUS), 'specs': load_specs(DEMO_SPECS),
           'commits': load_commits(DEMO_LOG), 'deferred': load_deferred(DEMO_DEFERRED),
           'deferred_exists': True, 'phase_prompts': phase, 'step6': step6, 'step6b': step6b,
           'demo': True, 'stamp': 'from the demo fixture'}
    out = render(ctx)
    flat = {s['key']: s for ep in ctx['epics'] for s in ep['stories']}
    lanes = {s['lane'] for s in flat.values()}
    assert lanes == {k for k, _ in LANES}, f'the fixture does not populate every lane: {lanes}'
    assert flat['1.4']['issues'] and flat['1.3']['phase'] == 'Test' and flat['1.1']['phase'] == 'Done'
    assert flat['3.1']['lane'] == 'progress' and flat['3.2']['lane'] == 'ready' and flat['3.3']['lane'] == 'backlog'
    q13, q32 = flat['1.3']['spec']['questions'], flat['3.2']['spec']['questions']
    assert q13[0]['options'] and q13[0]['recommended'], 'the shaped question must pass R-83'
    assert not q32[0]['options'], 'the shapeless question must fail R-83'
    assert 'needs options' in out and 'DEMO DATA' in out and flat['1.3']['spec']['test']['kind'] == 'table'
    assert flat['1.4']['spec']['test']['kind'] == 'list' and len(flat['1.1']['commits']) == 5
    assert 'Story 1.3 from _bmad-output/planning-artifacts/epics.md' in out, 'the {E.S} placeholder was not filled'
    return out


def main():
    if '--demo' in sys.argv:
        path = sys.argv[sys.argv.index('--demo') + 1]
        open(path, 'w', encoding='utf8').write(demo())
        print(f'wrote {path} (demo fixture; self-check passed)')
        return 0
    out = render(real())
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
