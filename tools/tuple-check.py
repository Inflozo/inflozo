#!/usr/bin/env python3
"""FR-G5's uniqueness gate over the merged library.

The structural tuple is the machine-checkable identity a design's uniqueness runs on
(sections-inventory.md §"What each design carries"). Six slots since 2026-08-21 (owner
decision, option 1): archetype · containment · ground · item-count · media placement ·
emphasis — the first five closed, emphasis deliberately open. This verifies, per category:
every design has a six-slot tuple, the five closed slots use the closed vocabulary,
no two tuples collide, and the design numbering is contiguous from 1.
Exits non-zero on any failure; doc-audit.py --check runs it, and category-prompts.py
reads the sets below — changing one here requires regenerating the prompts.

**Source, since the 2026-08-27 inventory merge:** the design export, through
`tools/export-roster.py` — every live category, not the twelve
`derived-fields-A1-A12.md` covered. That file is superseded wholesale (R-16) and its
186 hand-derived tuples could not see the native ones the specs now carry.
"""
import os, re, sys, json, subprocess, collections

ROSTER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'export-roster.py')
ARCH = {'grid-of-N', 'split', 'stack', 'bar', 'nav', 'edge rail', 'overlay', 'feed',
        'form', 'carousel', 'table', 'media frame', 'sticky', 'article body'}
CONTAIN = {'none', 'card', 'box', 'pill'}
GROUND = {'page', 'surface', 'contrast', 'image', 'transparent', 'accent'}
COUNT = {'none', 'one', 'few', 'many', 'variable'}
MEDIA = {'none', 'left', 'right', 'top', 'bottom', 'background', 'inline', 'edge', 'full-bleed'}

fails = []
out = subprocess.run([sys.executable, ROSTER], capture_output=True, text=True)
if out.returncode:
    sys.stderr.write(out.stderr)
    sys.exit(out.returncode)
library = json.loads(out.stdout)['live']

cats = collections.OrderedDict()   # cat -> [(n, name, tuple)]
for cat, c in library.items():
    rows = []
    # numbering is the roster's own position, not the export's, because a ruled
    # deletion renumbers everything after it (R-24 struck A1-9 and A4-15).
    for i, d in enumerate(c['designs'], 1):
        if not d['tuple']:
            fails.append(f"{cat}-{i} {d['name']}: no structural tuple in the export")
            continue
        rows.append((i, d['name'], d['tuple']))
    cats[cat] = rows

for cat, rows in cats.items():
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
