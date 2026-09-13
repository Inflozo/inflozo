#!/usr/bin/env python3
"""Vendors every Tabler icon into `packages/library/icons/` as data (Story 4.5, R-26 · R-92 · R-104).

    python3 tools/vendor-icons.py

Writes two files and nothing else:

  * packages/library/icons/tabler.json        — compact JSON: `version`, `captured`, `command`,
                                                `integrity`, `license`, and `icons`, one entry per icon
                                                sorted by name — `category`, `tags` (strings),
                                                `outline` and, where Tabler has one, `filled`, each a
                                                list of `[tag, attrs]` nodes
  * packages/library/icons/LICENSE-tabler.txt — Tabler's LICENSE, verbatim

WHY DATA, NOT A DEPENDENCY. Tabler is the sections' icon set (R-26; R-92 scopes it to the sections, the
app chrome draws the frames' own paths), and R-104 made it the whole set — every icon, outline and
filled, in the category Tabler files it under. R-26 rules the emission: inline SVG, once per use, never a
sprite and never an icon font. So `@tabler/icons` is never installed; its drawings are read out of the
published tarball once, here, and the runtime rebuilds every `<path>` from these validated attributes
(AD-36). The licence travels with the drawings: MIT asks for its notice in every copy, so the text sits
beside the data AND inside `tabler.json`, because `src/icons.ts` is a core package file and cannot read a
.txt file (AD-1 bans node:fs there).

WHAT IT READS, from the pinned tarball only (paths verified in 3.46.0's tarball, 2026-09-13):
`package/icons.json` (category, tags), `package/tabler-nodes-outline.json`,
`package/tabler-nodes-filled.json` and `package/LICENSE`.

IT REFUSES TO WRITE, exiting 1 with the reason, unless: the tarball's sha512 is the pinned integrity; its
LICENSE is MIT; no outline name already ends in `-filled` (a filled icon's lookup key is its name plus
`-filled`, so such a name would collide); every filled drawing has an outline icon of the same name;
every icon has a category; and every drawing node is a `path` whose attributes are inside the allowed set
(outline: d · fill · opacity · stroke; filled: d · fill) with string values carrying no brace — a brace
in emitted markup is a Handlebars hole in the theme.

Tags: Tabler writes some as numbers (`2`); they are written as strings. A `null` tag carries no search
term and is dropped.

IDEMPOTENT: rerunning at the same version and integrity keeps the existing `captured` date, so a second
run leaves `git status --porcelain packages/library/icons` unchanged. Bumping the version means changing
VERSION and INTEGRITY below together (`npm view @tabler/icons@<v> dist.integrity`).
"""
import base64, datetime, hashlib, io, json, os, sys, tarfile, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'packages', 'library', 'icons')
JSON_OUT = os.path.join(OUT, 'tabler.json')
LICENSE_OUT = os.path.join(OUT, 'LICENSE-tabler.txt')
COMMAND = 'python3 tools/vendor-icons.py'
VERSION = '3.46.0'
URL = f'https://registry.npmjs.org/@tabler/icons/-/icons-{VERSION}.tgz'
INTEGRITY = 'sha512-f2RYFl3fzPwj5WO82x6en0dmkjefxEfOm16D1ByM6cj/McNiwOkL4VaPUoP9VVIrXAD9WnTSVFr70px703b//A=='
MIT_PERMISSION = ('Permission is hereby granted, free of charge, to any person obtaining a copy\n'
                  'of this software and associated documentation files (the "Software"), to deal\n'
                  'in the Software without restriction')
ALLOWED = {'outline': {'d', 'fill', 'opacity', 'stroke'}, 'filled': {'d', 'fill'}}


def refuse(why):
    sys.exit(f'vendor-icons: refusing to write — {why}')


def nodes(name, style, drawing):
    for node in drawing:
        if not (isinstance(node, list) and len(node) == 2 and node[0] == 'path' and isinstance(node[1], dict)):
            refuse(f'{style} drawing of {name!r} has a node that is not a path: {node!r}')
        extra = set(node[1]) - ALLOWED[style]
        if extra:
            refuse(f'{style} drawing of {name!r} carries attributes outside {sorted(ALLOWED[style])}: {sorted(extra)}')
        for key, value in node[1].items():
            if not isinstance(value, str) or '{' in value or '}' in value:
                refuse(f'{style} drawing of {name!r} has {key}={value!r} (not a string, or carries a brace)')
    return drawing


def main():
    with urllib.request.urlopen(URL) as response:
        raw = response.read()
    got = 'sha512-' + base64.b64encode(hashlib.sha512(raw).digest()).decode()
    if got != INTEGRITY:
        refuse(f'{URL} has integrity {got}, pinned {INTEGRITY}')
    tar = tarfile.open(fileobj=io.BytesIO(raw))
    read = lambda path: tar.extractfile(f'package/{path}').read()
    license_text = read('LICENSE').decode('utf-8')
    if not license_text.startswith('MIT License') or MIT_PERMISSION not in license_text:
        refuse('package/LICENSE is not the MIT licence')
    meta = json.loads(read('icons.json'))
    outline = json.loads(read('tabler-nodes-outline.json'))
    filled = json.loads(read('tabler-nodes-filled.json'))

    clashing = sorted(n for n in outline if n.endswith('-filled'))
    if clashing:
        refuse(f'outline names already end in -filled: {clashing}')
    orphans = sorted(set(filled) - set(outline))
    if orphans:
        refuse(f'filled drawings with no outline icon of the same name: {orphans}')

    icons = {}
    for name in sorted(outline):
        category = meta.get(name, {}).get('category')
        if not isinstance(category, str) or not category.strip():
            refuse(f'{name!r} has no category in package/icons.json')
        entry = {
            'category': category,
            'tags': [str(t) for t in meta[name].get('tags', []) if t is not None],
            'outline': nodes(name, 'outline', outline[name]),
        }
        if name in filled:
            entry['filled'] = nodes(name, 'filled', filled[name])
        icons[name] = entry

    captured = datetime.date.today().isoformat()
    if os.path.exists(JSON_OUT):
        with open(JSON_OUT, encoding='utf-8') as f:
            previous = json.load(f)
        if previous.get('version') == VERSION and previous.get('integrity') == INTEGRITY:
            captured = previous['captured']

    document = {'version': VERSION, 'captured': captured, 'command': COMMAND, 'integrity': INTEGRITY,
                'license': license_text, 'icons': icons}
    os.makedirs(OUT, exist_ok=True)
    with open(JSON_OUT, 'w', encoding='utf-8') as f:
        f.write(json.dumps(document, ensure_ascii=False, separators=(',', ':')) + '\n')
    with open(LICENSE_OUT, 'w', encoding='utf-8', newline='') as f:
        f.write(license_text)
    print(f'vendor-icons: @tabler/icons {VERSION}, integrity and MIT licence checked; '
          f'{len(icons)} icons ({len(filled)} also filled) written to {os.path.relpath(JSON_OUT, ROOT)}')


if __name__ == '__main__':
    main()
