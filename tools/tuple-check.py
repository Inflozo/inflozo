#!/usr/bin/env python3
"""FR-G5's uniqueness gate for derived-fields-A1-A12.md.

The structural tuple is the machine-checkable identity a design's uniqueness runs on
(sections-inventory.md §"What each design carries"). Six slots since 2026-08-21 (owner
decision, option 1): archetype · containment · ground · item-count · media placement ·
emphasis — the first five closed, emphasis deliberately open. This verifies, per category:
every design has a six-slot tuple, the five closed slots use the closed vocabulary,
no two tuples collide, and the design numbering is contiguous from 1.
Exits non-zero on any failure; doc-audit.py --check runs it, and category-prompts.py
reads the sets below — changing one here requires regenerating the prompts.
"""
import os, re, sys, collections

DOC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   '_bmad-output', 'planning-artifacts', 'design', 'derived-fields-A1-A12.md')
ARCH = {'grid-of-N', 'split', 'stack', 'bar', 'nav', 'edge rail', 'overlay', 'feed',
        'form', 'carousel', 'table', 'media frame', 'sticky', 'article body'}
CONTAIN = {'none', 'card', 'box', 'pill'}
GROUND = {'page', 'surface', 'contrast', 'image', 'transparent', 'accent'}
COUNT = {'none', 'one', 'few', 'many', 'variable'}
MEDIA = {'none', 'left', 'right', 'top', 'bottom', 'background', 'inline', 'edge', 'full-bleed'}

fails = []
body = open(DOC, encoding='utf8').read()
cats = collections.defaultdict(list)   # cat -> [(n, name, tuple)]
heads = list(re.finditer(r'^### (A\d+)-(\d+) (.+)$', body, re.M))
for i, m in enumerate(heads):
    cat, n, name = m.group(1), int(m.group(2)), m.group(3)
    block = body[m.end():heads[i + 1].start() if i + 1 < len(heads) else len(body)]
    block = block.split('\n## ')[0]    # stop at the category summary
    t = re.search(r'^- Tuple: (.+)$', block, re.M)
    if not t:
        fails.append(f'{cat}-{n} {name}: no Tuple line')
        continue
    cats[cat].append((n, name, t.group(1).strip()))

for cat, rows in sorted(cats.items(), key=lambda kv: int(kv[0][1:])):
    nums = [n for n, _, _ in rows]
    if nums != list(range(1, len(nums) + 1)):
        fails.append(f'{cat}: numbering not contiguous from 1: {nums}')
    for t, c in collections.Counter(t for _, _, t in rows).items():
        if c > 1:
            fails.append(f'{cat}: tuple collision ({c} designs): "{t}"')
    for n, name, t in rows:
        parts = [p.strip() for p in t.split('·')]
        if len(parts) != 6:
            fails.append(f'{cat}-{n}: tuple has {len(parts)} slots, not 6')
            continue
        for slot, vocab, label in ((parts[0], ARCH, 'archetype'),
                                   (parts[1], CONTAIN, 'containment'),
                                   (parts[2], GROUND, 'ground'),
                                   (parts[3], COUNT, 'count class'),
                                   (parts[4], MEDIA, 'media')):
            if slot not in vocab:
                fails.append(f'{cat}-{n}: {label} "{slot}" not in the closed set')

for f in fails:
    print('FAIL:', f)
n = sum(len(v) for v in cats.values())
print(f'tuple gate: {"FAIL" if fails else "PASS"} ({n} designs, {len(cats)} categories)')
sys.exit(1 if fails else 0)
