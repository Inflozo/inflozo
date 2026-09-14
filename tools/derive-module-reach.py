#!/usr/bin/env python3
"""Derive research §2.1's "Designs requiring it" and "Trigger in the inventory" columns.

    python3 tools/derive-module-reach.py            # module -> the designs that declare it
    python3 tools/derive-module-reach.py --gaps     # only what could not be read
    python3 tools/derive-module-reach.py --check    # registry.json against research §2.1 and §7; reads no export

--check (Story 4.7) keeps FR-G7's one table one table. The prose half — each module's no-JS line and its
edit-safe sentence — is research §7; `packages/library/modules/registry.json` is the half code reads. It
fails, naming the row, when registry.json's names are not §2.1's live rows in order, when a module's
`editSafe` is not its §7 yes/no, when a module's `animates` is not whether its §3.1 row names reduced
motion, when a §7 row is neither a registry module, `core`, struck nor `cards.js`, or when `cards.js` has
no row. `pnpm test` runs it.

Those two columns tell the build which script ships with which design, and they are what a
category author is handed. They still name designs by identities the export superseded — row 2
cites "A1 #11 Sidebar Trigger" when A1 #11 is Side Rail — so they are re-derived here rather
than re-typed (standing rule 4).

TWO DECLARATION SHAPES, as everywhere else in this corpus. Fifteen specs write a per-design
prose line (**Behaviour module.** `accordion`. Edit-safe. **JS off:** …); the rest carry a
Module or Declares column in the roster table. Both are read. A module name is only counted when
it appears inside a design's OWN declaration — a name mentioned in a category's prose ("the
registry's `search-overlay` is retired") is not a declaration, which is the distinction that made
the earlier attempt over-match every A1 design with `accordion` and `mode-toggle`.
"""
import os, re, sys, json, importlib.util, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')
RESEARCH = os.path.join(ROOT, '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17',
                        'research-section-js-libraries.md')
REGISTRY = os.path.join(ROOT, 'packages/library/modules/registry.json')
_s = importlib.util.spec_from_file_location('er', os.path.join(ROOT, 'tools/export-roster.py'))
er = importlib.util.module_from_spec(_s); _s.loader.exec_module(er)

BEHAVIOUR_LINE = re.compile(r'^[ \t]*(?:\d+\.\s*)?\*\*Behaviour modules?\.?\*\*(.+?)(?:\n\s*\n|\n[ \t]*\*\*|\n#{2,5} |\Z)',
                            re.M | re.S)
TICKED = re.compile(r'`([a-z][a-z0-9-]+)`')


def live_rows():
    """§2.1's live rows in order — `| n | **`name`**` — `core` included; a struck row opens `| ~~n~~ |`."""
    mods = re.findall(r'^\| \d+ \| \*\*`([a-z][a-z0-9-]+)`\*\*',
                      open(RESEARCH, encoding='utf8').read(), re.M)
    if 'core' not in mods or len(mods) < 2:
        # a refusal, not an assert: `python -O` strips asserts, and a parse that found nothing is no result
        sys.exit('research §2.1 did not parse: no `| n | **`name`**` rows with core among them')
    return mods


def known_modules():
    return set(live_rows())


def section7_rows():
    """§7's table: [(first cell, edit-safe cell)], from its header row to the first line that is not a row."""
    text = open(RESEARCH, encoding='utf8').read()
    m = re.search(r'^\| Module \| With JavaScript disabled \| Edit-safe \|\n\|[-| ]+\|\n((?:\|.*\n)+)', text, re.M)
    if not m:
        sys.exit('research §7 did not parse: no "| Module | With JavaScript disabled | Edit-safe |" table')
    rows = []
    for line in m.group(1).splitlines():
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        # a no-JS line may carry an escaped pipe (`\|`), so the edit-safe cell is the LAST one
        rows.append((cells[0], cells[-1]))
    return rows


def section31_reduced_motion():
    """The §3.1 rows whose text names reduced motion — the motion gate's members, `core` among them."""
    text = open(RESEARCH, encoding='utf8').read()
    m = re.search(r'^### 3\.1 .*\n([\s\S]*?)(?=^### )', text, re.M)
    if not m:
        sys.exit('research §3.1 did not parse: no "### 3.1" section before the next heading')
    out = set()
    for line in m.group(1).splitlines():  # the table is broken by blank lines; every `| \`name\`` row counts
        ident = re.match(r'^\| `([a-z][a-z0-9.-]*)`', line)
        if ident and re.search(r'reduced[- ]motion', line):
            out.add(ident.group(1))
    if 'core' not in out:
        sys.exit('research §3.1 did not parse: core\'s row should name the reduced-motion gate')
    return out


def check():
    problems = []
    reg = json.load(open(REGISTRY, encoding='utf8'))
    names = [row['name'] for row in reg['modules']]
    live = [n for n in live_rows() if n != 'core']
    if names != live:
        missing = [n for n in live if n not in names]
        extra = [n for n in names if n not in live]
        problems.append('registry.json\'s names are not research §2.1\'s live rows in order'
                        + (f' — missing {", ".join(missing)}' if missing else '')
                        + (f' — not in §2.1 {", ".join(extra)}' if extra else '')
                        + ('' if missing or extra else ' — same names, different order'))
    for retired in reg.get('retired', {}):
        if retired in names or retired in live:
            problems.append(f'{retired} is retired in registry.json and still a live module')

    seven = {}
    for first, safe in section7_rows():
        if first.startswith('~~'):
            continue                                   # struck: a retired row kept as the record
        ident = re.match(r'^`([a-z][a-z0-9.-]*)`', first)
        if not ident:
            problems.append(f'research §7 row {first[:50]!r} names no module in backticks')
            continue
        verdict = re.match(r'^\*\*(yes|no)\*\*', safe)
        if not verdict:
            problems.append(f'research §7 row `{ident.group(1)}` has no **yes** or **no** edit-safe value: {safe[:40]!r}')
            continue
        seven[ident.group(1)] = verdict.group(1) == 'yes'
    for row in reg['modules']:
        if row['name'] not in seven:
            problems.append(f'{row["name"]} has no research §7 row, so it has no no-JS line and no edit-safe value')
        elif row['editSafe'] != seven[row['name']]:
            problems.append(f'{row["name"]}: registry.json says editSafe {str(row["editSafe"]).lower()}, research §7 says '
                            f'{"yes" if seven[row["name"]] else "no"} — §7 is transcribed, never decided here (R-21)')
    for name in seven:
        if name not in names and name not in ('core', 'cards.js'):
            problems.append(f'research §7 has a live row for `{name}`, which is neither a registry module, core, cards.js nor struck')
    # `animates` is §3.1's reduced-motion line: the rows that name it are exactly the modules the gate stops
    # (plus `core`, which holds the gate). A row that names it without `animates`, or the reverse, is a row to
    # rule on — the spec's Ask First for a module whose reduced-motion state is not its no-JS state.
    three = section31_reduced_motion()
    for row in reg['modules']:
        if row['animates'] != (row['name'] in three):
            problems.append(f'{row["name"]}: registry.json says animates {str(row["animates"]).lower()}, but research §3.1 '
                            f'{"names" if row["name"] in three else "does not name"} reduced motion in its row')
    if 'cards.js' not in seven:
        problems.append('research §7 has no `cards.js` row — Ghost\'s card scripts need a no-JS line and an edit-safe value (DW-100)')
    if 'core' not in seven:
        problems.append('research §7 has no `core` row')

    if problems:
        print('derive-module-reach --check: FAIL')
        for p in problems:
            print('  -', p)
        return 1
    print('derive-module-reach --check: PASS — registry.json agrees with research §2.1, §3.1 and §7, cards.js included')
    return 0


def per_design(cat, text, designs, known):
    """{design number: [modules]} — from the prose line or the roster column, whichever exists."""
    out = collections.defaultdict(list)

    # shape 1 — a **Behaviour module.** line inside each design's own section
    for num, _name, body in er.design_sections(text):
        for m in BEHAVIOUR_LINE.finditer(body):
            # stop at "JS off:", whose quoted degradation sentence names other modules
            seg = m.group(1).split('**JS off')[0]
            for mod in TICKED.findall(seg):
                if mod in known and mod not in out[num]:
                    out[num].append(mod)

    # shape 2 — the roster table's Module / Declares column, already parsed by export-roster.
    # NOTE it arrives with backticks already stripped by clean(), so match bare names here; a
    # backtick-requiring pattern silently found nothing and read 18 categories as module-free.
    for d in designs:
        for mod in re.findall(r'[a-z][a-z0-9-]+', d.get('modules', '') or ''):
            if mod in known and mod not in out[d['n']]:
                out[d['n']].append(mod)
    return out


def main():
    if '--check' in sys.argv:
        return check()
    known = known_modules()
    lib, _ = er.build()
    reach = collections.defaultdict(list)          # module -> ["A1-4", …]
    silent = []
    for cat in sorted(lib, key=lambda c: int(c[1:]) if c[1:].isdigit() else 999):
        if lib[cat].get('deleted'):
            continue
        fn = next((f for f in os.listdir(EXPORT)
                   if f.startswith(cat + ' ') and f.endswith('- Spec.md')), None)
        if not fn:
            continue
        designs = [d for d in lib[cat]['designs'] if not d.get('deleted')]
        got = per_design(cat, open(os.path.join(EXPORT, fn), encoding='utf8').read(), designs, known)
        if not got:
            silent.append(cat)
        for n, mods in sorted(got.items()):
            for mod in mods:
                reach[mod].append(f'{cat}-{n}')

    if '--gaps' in sys.argv:
        print('categories declaring no module at all:', ', '.join(silent) or 'none')
        print('registry modules claimed by NO design:',
              ', '.join(sorted(known - set(reach))) or 'none')
        return 0

    print(f'{"module":20} {"n":>4}  designs that declare it')
    for mod in sorted(known):
        who = reach.get(mod, [])
        print(f'{mod:20} {len(who):>4}  {", ".join(who) if who else "— none —"}')
    if silent:
        print(f'\nCategories where no design declares any module: {", ".join(silent)}')
    orphans = sorted(known - set(reach))
    if orphans:
        print(f'Registry modules no design claims: {", ".join(orphans)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
