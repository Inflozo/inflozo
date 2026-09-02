#!/usr/bin/env python3
"""A33 — the Koenig card class names, read from the code that emits them.

    python3 tools/probe/run-verify-a33-cards.py

WHY. A33 Koenig Card Treatments ships a stylesheet and nothing else. Its whole job is selecting
Ghost's own card markup inside a post body, where we own the stylesheet and NOTHING else. Six
selectors in its specification are marked `unverified`, two of them not in Ghost's published class
list at all. **A wrong selector styles nothing and does it silently** — no build fails, no test goes
red, the card renders unstyled on a customer's live site. That is why this is executed.

METHOD, and why it is a source read rather than a render. Ghost renders Koenig cards from
`@tryghost/kg-default-nodes`: one renderer per card type, and the class names are literals in that
code. Constructing twenty cards through the Admin API would mean hand-authoring Lexical JSON for
each and would prove the same thing less directly — the renderer IS the authority, and reading it
covers cards a fixture might not exercise (the email card never renders on the web at all). Standing
rule 1 accepts source; this is source, at a pinned version, on both majors.

THE CONTROL (standing rule 2). Four classes are DOCUMENTED by Ghost and already relied on by A33:
`kg-image-card`, `kg-bookmark-card`, `kg-gallery-card`, `kg-toggle-card`. The extractor must find
all four. If a known class does not come back, the extractor is reading the wrong thing and every
unknown in the same run is meaningless — the probe says so and stops rather than reporting them.

Reads only. Creates nothing, uploads nothing, changes nothing on either server.
"""
import os, re, sys, json, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))

HOSTS = [
    ('T1', 'ghost6.inflozo.com', '/var/www/ghost6/versions'),
    ('T3', 'ghost5.inflozo.com', '/var/www/ghost5/versions'),
]

# What A33's specification currently assumes, and which of those it marks unverified.
A33_ASSUMES = {
    'call-to-action': ('kg-cta-card',      'UNVERIFIED — not in Ghost\'s published class list'),
    'email':          ('kg-email-card',    'UNVERIFIED — not in Ghost\'s published class list'),
    'callout':        ('kg-callout-card',  'accent variant confirmed; eight other colours unverified'),
    'product':        ('kg-product-card',  'inner classes unverified'),
    'header':         ('kg-header-card',   'Ghost 6 shape unverified'),
    'image':          ('kg-image-card',    'CONTROL — documented'),
    'bookmark':       ('kg-bookmark-card', 'CONTROL — documented'),
    'gallery':        ('kg-gallery-card',  'CONTROL — documented'),
    'toggle':         ('kg-toggle-card',   'CONTROL — documented'),
}
CONTROL = ['kg-image-card', 'kg-bookmark-card', 'kg-gallery-card', 'kg-toggle-card']

REMOTE = r'''
set -e
V=$(ls -d {versions}/* | tail -1)
echo "VERSION=$(basename $V)"

# The lexical renderer. Ghost 6 ships it under build/cjs/nodes, Ghost 5 under lib/nodes — so the
# path is FOUND, not assumed. The first version of this probe assumed Ghost 6's layout and the
# control caught it: Ghost 5 returned zero card types.
D=$(find $V/node_modules -type d -name nodes -path "*kg-default-nodes*" 2>/dev/null | grep -vE "/es/|/esm/" | head -1)
echo "NODES=$D"
if [ -n "$D" ]; then
  for c in $(ls "$D"); do
    [ -d "$D/$c" ] || continue
    cls=$(grep -rhoE "kg-[a-z0-9-]+" "$D/$c" 2>/dev/null | sort -u | tr '\n' ' ')
    echo "CARD $c :: $cls"
  done
fi

# The MOBILEDOC renderer, which Ghost 5 also ships for posts written before Lexical. A Ghost 5 site
# can hold both kinds, so both sets of classes can appear on one site.
M=$(find $V/node_modules -type d -name cards -path "*kg-default-cards*" 2>/dev/null | grep -vE "/es/|/esm/" | head -1)
echo "MOBILEDOC=$M"
if [ -n "$M" ]; then
  for f in $(ls "$M"/*.js 2>/dev/null); do
    n=$(basename "$f" .js)
    cls=$(grep -hoE "kg-[a-z0-9-]+" "$f" 2>/dev/null | sort -u | tr '\n' ' ')
    [ -n "$cls" ] && echo "MCARD $n :: $cls"
  done
fi
echo "NFT=$(grep -rl 'kg-nft-card' $V/node_modules --include=*.js 2>/dev/null | head -1)"
'''


def read_host(host, versions):
    cmd = REMOTE.format(versions=versions)
    r = subprocess.run(
        ['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10',
         '-o', 'StrictHostKeyChecking=no', f'root@{host}', 'bash -s'],
        input=cmd, capture_output=True, text=True, timeout=420)
    if r.returncode != 0:
        return None, r.stderr.strip()[-300:]
    out = {'version': '', 'nodes': '', 'mobiledoc': '', 'cards': {}, 'mcards': {}, 'nft': ''}
    for line in r.stdout.splitlines():
        if line.startswith('VERSION='):
            out['version'] = line[8:]
        elif line.startswith('NODES='):
            out['nodes'] = line[6:]
        elif line.startswith('NFT='):
            out['nft'] = line[4:]
        elif line.startswith('MOBILEDOC='):
            out['mobiledoc'] = line[10:]
        elif line.startswith('CARD '):
            name, _, cls = line[5:].partition(' :: ')
            out['cards'][name.strip()] = sorted(set(cls.split()))
        elif line.startswith('MCARD '):
            name, _, cls = line[6:].partition(' :: ')
            out['mcards'][name.strip()] = sorted(set(cls.split()))
    return out, None


def main():
    results = {}
    for tag, host, versions in HOSTS:
        print(f'\n{"=" * 78}\n{tag} — {host}\n{"=" * 78}')
        data, err = read_host(host, versions)
        if err or not data:
            print(f'  FAILED — {err}')
            continue
        print(f'  Ghost {data["version"]}')
        print(f'  lexical renderers  : {len(data["cards"])} card types')
        print(f'  mobiledoc renderers: {len(data["mcards"])} card types'
              + ('  (older posts render through these)' if data['mcards'] else '  (none — Lexical only)'))
        results[tag] = data

    if not results:
        print('\nno host produced a result'); return 1

    # ── the control ─────────────────────────────────────────────────────────
    print(f'\n{"=" * 78}\nCONTROL — four documented classes must come back\n{"=" * 78}')
    ok = True
    for tag, data in results.items():
        found = ({c for cls in data['cards'].values() for c in cls}
                 | {c for cls in data['mcards'].values() for c in cls})
        missing = [c for c in CONTROL if c not in found]
        print(f'  {tag}: ' + ('all four present' if not missing else f'MISSING {missing}'))
        if missing:
            ok = False
    if not ok:
        print('\n  ** CONTROL FAILED — the extractor is reading the wrong thing, so every unknown')
        print('     below is meaningless. Not reporting them (standing rule 2). **')
        return 1

    # ── the answer ──────────────────────────────────────────────────────────
    print(f'\n{"=" * 78}\nWHAT A33 ASSUMES vs WHAT THE RENDERERS EMIT\n{"=" * 78}')
    verdict = {}
    for card, (assumed, note) in A33_ASSUMES.items():
        row = {'assumed': assumed, 'note': note}
        for tag, data in results.items():
            cls = sorted(set(data['cards'].get(card, [])) | set(data['mcards'].get(card, [])))
            row[tag] = {'emits': cls, 'assumption_holds': assumed in cls}
        verdict[card] = row
        line = f'  {card:16s} assumes {assumed:20s}'
        for tag in results:
            h = row[tag]['assumption_holds']
            line += f'  {tag}:{"OK " if h else "NO "}'
        print(line)
        for tag in results:
            if not row[tag]['assumption_holds']:
                print(f'      {tag} actually emits: {", ".join(row[tag]["emits"]) or "(no kg- class at all)"}')

    print(f'\n{"=" * 78}\nTHE NFT CARD A33 DOES NOT DRAW\n{"=" * 78}')
    for tag, data in results.items():
        print(f'  {tag}: ' + ('still present in the build' if data['nft'] else 'NOT FOUND — no kg-nft-card anywhere'))

    open(os.path.join(HERE, 'a33-cards-result.json'), 'w').write(
        json.dumps({'verdict': verdict, 'hosts': {k: {'version': v['version'], 'cards': v['cards'],
                                                      'mobiledoc_cards': v['mcards'],
                                                      'nft': bool(v['nft'])}
                                                 for k, v in results.items()}}, indent=2))
    print(f'\n  raw -> tools/probe/a33-cards-result.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())
