#!/usr/bin/env python3
"""Read the design export and emit the library roster as JSON.

    python3 tools/export-roster.py            # roster.json to stdout
    python3 tools/export-roster.py --summary  # per-category counts

The export is the roster (ruling R-16, `reconcile-designs-decisions.md`): the drawn
frames and each category's own spec table outrank anything the inventory used to say.
This reads BOTH and refuses to emit when they disagree, so a hand-edit to one that
misses the other cannot pass silently.

Per design it carries: number, name, structural tuple, declared behaviour modules and
the one-line descriptor. `sections-inventory.md`'s Appendix A rosters and
`tools/tuple-check.py` both read this rather than restating it (standing rule 3).

Deletions ruled at step 4b are applied here, once, with their reason — never by
deleting source files, so the export stays the record of what was drawn.
"""
import re, os, sys, json, glob, collections

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(HERE, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')

# ---------------------------------------------------------------------------
# Ruled deletions — R-24, as tightened by the owner 2026-08-27.
# Key: category, or (category, design number). Value: the reason, quoted downstream.
DELETED_CATEGORIES = {
    'A23': "R-24 — search is not a section. All fifteen designs go; search becomes an "
           "affordance on A1 (Icon · Button · Bar · Off) that opens Ghost's native search.",
}
DELETED_DESIGNS = {
    ('A1', 9):  "R-24 — 'Search-Forward' is a header with the Search control set to Bar, "
                "not a design. Its tuple was unique only on the control value, and it "
                "declared `search-overlay`, which R-24 deletes from the registry.",
    ('A4', 15): "R-24 — a hero has no header to carry the Search control, so this one is "
                "struck. 'A field that never renders a result' is now any hero's button "
                "with the Link Picker destination set to Ghost search.",
    # ── owner's ruling 2026-08-31, register 45(a) ───────────────────────────
    ('A2', 13): "Register 45(a) — 'Consent' is cut. No behaviour module covers a consent "
                "bar and the closest, `dismiss`, is the wrong idea: dismissing makes a bar "
                "go away, while consent must be RECORDED and honoured on the next visit. "
                "The owner chose to cut rather than write a `consent` module for one "
                "design; a site that needs a consent bar uses Ghost's code injection, "
                "which is the honest answer. The number is retired, not reused.",
}

CATEGORY_TITLES = {}   # filled from the spec filenames


def tables(text):
    lines = text.split('\n'); i = 0
    while i < len(lines):
        if lines[i].strip().startswith('|') and i + 1 < len(lines) \
           and re.match(r'^\s*\|[\s:|-]+\|\s*$', lines[i + 1]):
            hdr = [c.strip() for c in lines[i].strip().strip('|').split('|')]
            rows, j = [], i + 2
            while j < len(lines) and lines[j].strip().startswith('|'):
                rows.append([c.strip() for c in lines[j].strip().strip('|').split('|')]); j += 1
            yield hdr, rows; i = j
        else:
            i += 1


FREE_IN_NAME = re.compile(r'\s*[·—-]?\s*\[Free\]\s*$', re.I)


def strip_free(name):
    """A stray `[Free]` on a design heading must never become part of the design's NAME.

    Seven categories marked the free pair on the heading — "## 2 · Prev and Next [Free]" — so the
    name parsed as 'Prev and Next [Free]' and stopped matching the drawn frame. The marker's real
    home is the one-line `**[Free] designs:**` record that inventory-gen reads. Stripped here so a
    stray marker cannot corrupt a name; verify-design-pass still reports which specs did it."""
    return FREE_IN_NAME.sub('', name).strip()


def clean(s):
    return re.sub(r'\s+', ' ', re.sub(r'[`*⚑]', '', s)).strip()


NAME_COLS = ('design', 'name', 'treatment', 'style')
SLOT_COLS = ('archetype', 'containment', 'ground', 'items', 'item-count', 'media', 'emphasis',
             'emphasis mechanism', 'media placement', 'item-count class')


def from_tables(text):
    """Roster rows out of whichever table carries # + a name + a tuple."""
    best = {}
    for hdr, rows in tables(text):
        h = [clean(x).lower() for x in hdr]
        if not h or h[0] not in ('#', 'no', 'num'):
            continue
        name_i = next((k for k, x in enumerate(h) if x in NAME_COLS), None)
        if name_i is None:
            continue
        tup_i = next((k for k, x in enumerate(h) if 'tuple' in x or 'descriptor' in x), None)
        slot_is = [k for k, x in enumerate(h) if x in SLOT_COLS]
        mod_i = next((k for k, x in enumerate(h) if 'module' in x), None)
        if tup_i is None and len(slot_is) < 5:
            continue
        got = {}
        for r in rows:
            if len(r) <= name_i:
                continue
            m = re.match(r'^(\d+)$', clean(r[0]))
            if not m:
                continue
            if tup_i is not None and len(r) > tup_i:
                tup = clean(r[tup_i])
            else:
                tup = ' · '.join(clean(r[k]) for k in slot_is if len(r) > k)
            got[int(m.group(1))] = dict(name=strip_free(clean(r[name_i])), tuple=tup,
                                        modules=clean(r[mod_i]) if mod_i is not None and len(r) > mod_i else '')
        if len(got) > len(best):
            best = got
    return best


def from_sections(text):
    """Roster rows out of per-design prose, for the specs with no roster table."""
    got = {}
    for num, name, body in design_sections(text):
        tup = re.search(r'\*\*(?:\d+\s*[·.]\s*)?(?:Structural descriptor|Tuple)\.?\*\*\s*[:·]?\s*`([^`]+)`', body)
        mod = re.search(r'\*\*(?:\d+\s*[·.]\s*)?Behaviour module[s]?\.?\*\*\s*(.+)', body)
        if num not in got:
            got[num] = dict(name=strip_free(name), tuple=clean(tup.group(1)) if tup else '',
                            modules=clean(mod.group(1))[:120] if mod else '')
    return got


# A design section opens either "## 7 · Rail" or "### A20·7 — Rail".
DESIGN_HEAD = re.compile(r'^#{2,5}\s+(?:A\d+\s*[·.]\s*)?(\d+)\s*[·.\u2014-]\s*(.+?)\s*$', re.M)


def design_sections(text):
    """[(number, name, body)] for whichever heading shape the spec uses."""
    heads = [m for m in DESIGN_HEAD.finditer(text) if int(m.group(1)) > 0]
    out = []
    for k, m in enumerate(heads):
        body = text[m.end(): heads[k + 1].start() if k + 1 < len(heads) else len(text)]
        out.append((int(m.group(1)), clean(m.group(2)), body))
    return out


def descriptors(text):
    """number -> the one-line Descriptor, from whichever shape the spec uses."""
    out = {}
    for num, _, body in design_sections(text):
        d = re.search(r'\*\*(?:\d+\s*[·.]\s*)?Descriptor\.?\*\*\s*(.+?)'
                      r'(?:\n\s*\n|\n\s*[-*]\s*\*\*|\n\d+\.\s|\n\*\*)', body, re.S)
        if d and num not in out:
            out[num] = clean(d.group(1)).rstrip('.')
    return out


def frame_roster():
    out = collections.defaultdict(dict)
    for f in os.listdir(EXPORT):
        m = re.match(r'^(A\d+)-(\d+) (.+)\.dc\.html$', f)
        if m and int(m.group(2)) > 0:
            out[m.group(1)][int(m.group(2))] = m.group(3)
    return out


def build():
    frames = frame_roster()
    lib, problems = collections.OrderedDict(), []
    for path in sorted(glob.glob(os.path.join(EXPORT, 'A* - Spec.md')),
                       key=lambda p: int(re.match(r'A(\d+)', os.path.basename(p)).group(1))):
        base = os.path.basename(path)
        cat = re.match(r'^(A\d+)', base).group(1)
        CATEGORY_TITLES[cat] = re.match(r'^A\d+ (.+?) - Spec\.md$', base).group(1)
        text = open(path).read()
        rows = from_tables(text) or from_sections(text)
        if not rows:
            problems.append(f'{cat}: no roster table and no per-design sections'); continue
        desc = descriptors(text)
        F = frames.get(cat, {})
        # The drawings are the roster (R-16), so the frame's name is the one emitted.
        # "+" and "and" are the same word drawn two ways; anything else is a real conflict.
        same = lambda x: re.sub(r'[^a-z0-9]', '', (x or '').lower().replace('+', 'and'))
        for n in sorted(set(rows) | set(F)):
            a, b = rows.get(n, {}).get('name'), F.get(n)
            if same(a) != same(b):
                problems.append(f'{cat}-{n}: spec says {a!r}, the drawn frame says {b!r}')
        designs = []
        for n in sorted(rows):
            key = (cat, n)
            designs.append(dict(n=n, name=F.get(n) or rows[n]['name'], tuple=rows[n]['tuple'],
                                modules=rows[n]['modules'], descriptor=desc.get(n, ''),
                                deleted=DELETED_DESIGNS.get(key, '')))
        lib[cat] = dict(title=CATEGORY_TITLES[cat], spec=base,
                        deleted=DELETED_CATEGORIES.get(cat, ''), designs=designs)
    return lib, problems


def live(lib):
    """Categories and designs that survive the step-4b deletions."""
    out = collections.OrderedDict()
    for cat, c in lib.items():
        if c['deleted']:
            continue
        keep = [d for d in c['designs'] if not d['deleted']]
        if keep:
            out[cat] = dict(c, designs=keep)
    return out


if __name__ == '__main__':
    lib, problems = build()
    if problems:
        print('EXPORT ROSTER MISMATCH — the drawn frames and the spec tables disagree:', file=sys.stderr)
        for p in problems:
            print('  ' + p, file=sys.stderr)
        sys.exit(1)
    L = live(lib)
    if '--summary' in sys.argv:
        print(f"{'cat':<5}{'drawn':>7}{'live':>6}  title")
        for cat, c in lib.items():
            n_live = len(L.get(cat, {}).get('designs', []))
            print(f"{cat:<5}{len(c['designs']):>7}{n_live:>6}  {c['title']}"
                  + ('   [category deleted]' if c['deleted'] else ''))
        print(f"\ndrawn      : {sum(len(c['designs']) for c in lib.values())} designs "
              f"in {len(lib)} categories")
        print(f"live       : {sum(len(c['designs']) for c in L.values())} designs "
              f"in {len(L)} categories")
        print(f"[Free]     : {2 * len(L)}   (two per live category — R-17)")
    else:
        json.dump(dict(all=lib, live=L), sys.stdout, indent=1)


# ---------------------------------------------------------------------------
# Category unions. `contentSchema` is the union of every field any design in the
# category needs (sections-inventory.md, "How to read a category declaration"), so it
# is derived by unioning what the designs themselves declare rather than re-typed.
FIELD_LINE = re.compile(
    r'^\*\*(?:\d+\s*[·.]\s*)?(?:Content fields?|Fields)\**\.?\**\s*[·:]?\s*(.+?)(?:\n\s*\n|\n\*\*|\n#{2,5} )',
    re.M | re.S)
IDENT = re.compile(r'`([A-Za-z][A-Za-z0-9_]*(?:\[\])?(?:\.[A-Za-z][A-Za-z0-9_]*(?:\[\])?)*)`')


IDENT_TOKEN = re.compile(r'`([A-Za-z][A-Za-z0-9_]*(?:\[\])?)`')


def field_table_union(text):
    """Fields from any table with a Field(s) column, plus any "shared field list" prose block.

    field_union() below only knew the prose form (**Fields.** …), which 13 specs use, and returned
    a silent EMPTY LIST for the other 20 — the failure that made this derivation hand-work. Those
    20 declare fields in a markdown table whose headers vary (`Field | Type | Req | Limit | Used by
    | Notes`, `Field | Type | Optional | Limit | Read by`, `Field | Type | Values`) and, in A33,
    put the name in the SECOND column (`Card | Fields | Type | …`). So do not assume a position:
    find whichever column is headed Field or Fields and read that one. A19 uses neither shape —
    a prose block under "Shared field list" with the names inline in backticks — so that is read
    too. Between them these cover every live category.
    """
    seen = []

    def add(name):
        if name not in seen:
            seen.append(name)

    for m in re.finditer(r'^\|(.+?)\|[ \t]*\n\|[ :|-]+\|[ \t]*$', text, re.M):
        hdr = [c.strip().lower() for c in m.group(1).split('|')]
        col = next((i for i, h in enumerate(hdr) if h in ('field', 'fields')), None)
        if col is None:
            continue
        block = text[m.end():]
        stop = re.search(r'\n\s*\n', block)
        for row in (block[:stop.start()] if stop else block[:6000]).split('\n'):
            if not row.strip().startswith('|'):
                continue
            cells = row.strip().strip('|').split('|')
            if col < len(cells):
                for f in IDENT_TOKEN.findall(cells[col]):
                    add(f)

    # A19's shape: a prose block under a "Shared field list" heading, names inline in backticks.
    for m in re.finditer(r'^#{1,4}[^\n]*[Ss]hared field list[^\n]*$', text, re.M):
        block = text[m.end():m.end() + 2500]
        block = block[:block.index('\n## ')] if '\n## ' in block else block
        for f in IDENT_TOKEN.findall(block):
            add(f)
    return seen


def field_union(text):
    """Every field name any design in this category declares, in first-seen order."""
    seen = []
    for _, _, body in design_sections(text):
        for m in FIELD_LINE.finditer(body):
            for f in IDENT.findall(m.group(1)):
                if f not in seen:
                    seen.append(f)
    # the category's own shared-field-list paragraph, for anything no design spelled out
    for m in re.finditer(r'^\*\*(?:The )?[Ss]hared field list[^\n]*', text, re.M):
        for f in IDENT.findall(m.group(0)):
            if f not in seen:
                seen.append(f)
    for f in field_table_union(text):          # the table shape, for the 20 specs that use it
        if f not in seen:
            seen.append(f)
    return seen


def module_union(text, designs):
    """Every behaviour module the category's designs declare."""
    seen = []
    for d in designs:
        for f in re.findall(r'`([a-z][a-z0-9-]+)`', d.get('modules', '')):
            if f not in seen:
                seen.append(f)
    for _, _, body in design_sections(text):
        for m in re.finditer(r'^\*\*(?:\d+\s*[·.]\s*)?Behaviour module[s]?\.?\*\*\s*(.+)', body, re.M):
            for f in re.findall(r'`([a-z][a-z0-9-]+)`', m.group(1)):
                if f not in seen:
                    seen.append(f)
    return seen
