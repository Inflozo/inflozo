#!/usr/bin/env python3
"""Derive research §2.1's "Designs requiring it" and "Trigger in the inventory" columns.

    python3 tools/derive-module-reach.py            # module -> the designs that declare it
    python3 tools/derive-module-reach.py --gaps     # only what could not be read

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
import os, re, sys, importlib.util, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')
RESEARCH = os.path.join(ROOT, '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17',
                        'research-section-js-libraries.md')
_s = importlib.util.spec_from_file_location('er', os.path.join(ROOT, 'tools/export-roster.py'))
er = importlib.util.module_from_spec(_s); _s.loader.exec_module(er)

BEHAVIOUR_LINE = re.compile(r'^\*\*Behaviour modules?\.?\*\*(.+?)(?:\n\*\*|\n#{2,5} |\Z)',
                            re.M | re.S)
TICKED = re.compile(r'`([a-z][a-z0-9-]+)`')


def known_modules():
    mods = re.findall(r'^\| \d+ \| \*\*`([a-z][a-z0-9-]+)`\*\*',
                      open(RESEARCH, encoding='utf8').read(), re.M)
    assert len(mods) > 20, 'module registry did not parse'
    return set(mods)


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
