#!/usr/bin/env python3
"""Write the Appendix A rosters in sections-inventory.md from the design export.

    python3 tools/inventory-gen.py --check   # exits non-zero if the file is stale
    python3 tools/inventory-gen.py --write   # rewrites the rosters in place

Ruling R-16: the drawings are the roster, and the inventory is regenerated from the
export rather than hand-maintained — so it cannot drift again. This owns exactly two
things per category: the design count in the heading, and the numbered roster between
its `<!-- roster:AN -->` markers. Everything else in the block — the context sentence,
`Content:`, `Controls:`, `Data:`, `bindingContext` / `compileTarget` — is normative
prose and stays hand-authored in the document.

`[Free]` is the first two designs of each live category and nothing else (R-17), so the
count is two per category and is never restated (standing rule 3).
"""
import os, re, sys, json, subprocess, collections

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INV = os.path.join(HERE, '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/sections-inventory.md')
PRD = os.path.join(HERE, '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md')
ROSTER = os.path.join(HERE, 'tools/export-roster.py')

FREE_PER_CATEGORY = 2   # R-17 — the rule, not a number anyone restates

# Non-placeable treatments: chosen elsewhere, applied once per project, out of the
# Section Picker rail, drag/reorder, Layers, Variant Shuffle and Site Remix. A normative
# property of the category, not an export fact, so it is declared here and counted below.
NON_PLACEABLE = ('A32', 'A33', 'A34')


def library():
    out = subprocess.run([sys.executable, ROSTER], capture_output=True, text=True)
    if out.returncode:
        sys.stderr.write(out.stderr); sys.exit(out.returncode)
    return json.loads(out.stdout)['live']


def roster_block(cat, designs):
    lines = []
    for i, d in enumerate(designs):
        free = ' [Free]' if i < FREE_PER_CATEGORY else ''
        desc = d['descriptor'].rstrip('.')
        lines.append(f"{i + 1}. **{d['name']}**{free} — {desc}.")
    return '\n'.join(lines)


def totals_block(lib):
    cats = len(lib)
    designs = sum(len(c['designs']) for c in lib.values())
    np_cats = [c for c in NON_PLACEABLE if c in lib]
    np_counts = [(c, len(lib[c]['designs'])) for c in np_cats]
    np = sum(n for _, n in np_counts)
    breakdown = ' + '.join('%s (%d)' % (c, n) for c, n in np_counts)
    return (
        '**Totals: %d categories · %d designs · %d [Free] · %d placeable · %d non-placeable.** '
        % (cats, designs, FREE_PER_CATEGORY * cats, designs - np, np)
        + 'Every one of these is **derived from the export** by `tools/inventory-gen.py` and never '
          'typed (standing rule 3): the design count is the drawn frames less the deletions ruled at '
          'step 4b, `[Free]` is the first %d designs of each category and nothing else (R-17), and '
          'the non-placeable count is %s. Regenerate with `python3 tools/inventory-gen.py --write`; '
          '`--check` fails if this file has drifted from the export.'
        % (FREE_PER_CATEGORY, breakdown))


def render(text, lib):
    """Rewrite each category's count and roster; leave everything else alone."""
    missing = []
    pat = re.compile(r'(<!-- totals -->\n).*?(\n<!-- /totals -->)', re.S)
    if pat.search(text):
        text = pat.sub(lambda m: m.group(1) + totals_block(lib) + m.group(2), text, count=1)
    else:
        missing.append('no <!-- totals --> … <!-- /totals --> markers in the preamble')
    for cat, c in lib.items():
        n = len(c['designs'])
        # the count in the heading, e.g. **A9. FAQ (15)**
        head = re.compile(rf'(^\*\*{cat}\.\s[^(\n]*?)\((\d+)\)', re.M)
        if head.search(text):
            text = head.sub(lambda m: f'{m.group(1)}({n})', text, count=1)
        else:
            missing.append(f'{cat}: no heading of the form **{cat}. Title (N)**')
        # the roster between its markers
        pat = re.compile(rf'(<!-- roster:{cat} -->\n).*?(\n<!-- /roster:{cat} -->)', re.S)
        if not pat.search(text):
            missing.append(f'{cat}: no <!-- roster:{cat} --> … <!-- /roster:{cat} --> markers')
            continue
        text = pat.sub(lambda m: m.group(1) + roster_block(cat, c['designs']).replace('\\', '\\\\') + m.group(2),
                       text, count=1)
    return text, missing


def render_prd(text, lib):
    """Appendix I's summary table restates the inventory, so its counts are generated too.

    Only the Designs column, the total row and the group sums move; the two declaration
    columns are normative prose and stay hand-authored. A row for a category the export no
    longer has is dropped, because a summary that still lists it is how the count drifts."""
    missing, out, groups = [], [], collections.OrderedDict()
    for line in text.split('\n'):
        m = re.match(r'^\| (A\d+) \| ([^|]+?) \| (\d+) \|([^|]*)\|', line)
        if m and m.group(1) in ('A' + str(i) for i in range(1, 200)):
            cat, group = m.group(1), m.group(4).strip()
            if cat not in lib:
                continue                       # deleted category — the row goes
            n = len(lib[cat]['designs'])
            groups[group] = groups.get(group, 0) + n
            cells = line.split('|')
            cells[3] = f' {n} '
            out.append('|'.join(cells))
            continue
        m = re.match(r'^\| — \| \*\*Total\*\* \| \*\*\d+\*\* \|', line)
        if m:
            out.append(f"| — | **Total** | **{sum(groups.values())}** | | | |")
            continue
        if line.startswith('**Group sums:**'):
            out.append('**Group sums:** ' + ' + '.join(f'{g} **{n}**' for g, n in groups.items())
                       + f' = **{sum(groups.values())}**. Generated by `tools/inventory-gen.py` '
                         'from the design export — never typed (standing rule 3).')
            continue
        out.append(line)
    if not groups:
        missing.append('prd.md: no Appendix I category table found')
    return '\n'.join(out), missing


def main():
    lib = library()
    text = open(INV).read()
    # a deleted category must not still have a block
    for cat in ('A23',):
        if re.search(rf'^\*\*{cat}\.\s', text, re.M):
            print(f'FAIL  {cat} is deleted by R-24 but sections-inventory.md still declares it')
            sys.exit(1)
    new, missing = render(text, lib)
    if missing:
        for m in missing:
            print('FAIL  ' + m)
        sys.exit(1)
    prd_text = open(PRD).read()
    prd_new, prd_missing = render_prd(prd_text, lib)
    if prd_missing:
        for m in prd_missing:
            print('FAIL  ' + m)
        sys.exit(1)
    if '--write' in sys.argv:
        if prd_new != prd_text:
            open(PRD, 'w').write(prd_new)
            print('wrote prd.md Appendix I counts')
        if new != text:
            open(INV, 'w').write(new)
            print(f'wrote {len(lib)} category rosters '
                  f'({sum(len(c["designs"]) for c in lib.values())} designs, '
                  f'{FREE_PER_CATEGORY * len(lib)} [Free])')
        else:
            print('sections-inventory.md rosters already current')
    else:
        if new != text or prd_new != prd_text:
            print('FAIL  sections-inventory.md rosters or prd.md Appendix I are stale — run '
                  'python3 tools/inventory-gen.py --write')
            sys.exit(1)
        print(f'sections-inventory.md: {len(lib)} categories, '
              f'{sum(len(c["designs"]) for c in lib.values())} designs, '
              f'{FREE_PER_CATEGORY * len(lib)} [Free] — current')


if __name__ == '__main__':
    main()
