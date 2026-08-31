#!/usr/bin/env python3
"""Draft the per-category `Content:` line for sections-inventory.md from the design export.

    python3 tools/derive-content-lines.py            # print a draft line per category
    python3 tools/derive-content-lines.py --gaps     # only the categories needing a human read

`Content:` is the category's storage contract — the union of every field any of its designs can
ask the user to fill in. It is not documentation: when a user types into a field and then switches
design, the editor parks that value against this schema. A field missing from it has nowhere to
park and the user's words are lost (FR-D17's preservation gate).

OWNER'S RULING, 2026-08-31: the line lists **only what a user types**. Ghost's own read values
(`published_at`, `reading_time`, `feature_image`) are never stored by Inflozo, so they cannot be
lost on a design switch and do not belong in the storage contract. Where a category reads them
they are named in a trailing note instead.

WHAT THIS TOOL DOES AND DOES NOT DO. It emits a DRAFT from the specs' own typed field tables, and
it is honest about coverage: 20 categories declare fields in a table with a Type column and can be
classified mechanically; 13 declare them in prose with no type, and are listed for a human read
rather than guessed at. A wrong contentSchema is worse than a stale one, so this never invents a
type it cannot see.
"""
import os, re, sys, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')
_s = importlib.util.spec_from_file_location('er', os.path.join(ROOT, 'tools/export-roster.py'))
er = importlib.util.module_from_spec(_s); _s.loader.exec_module(er)

# The specs' own type vocabulary, surveyed rather than assumed.
AUTHORED = ('text', 'url', 'image', 'array', 'list', 'date', 'catalog', 'ref', 'rich', 'icon')
CONTROL = ('enum', 'int', 'number', 'boolean', 'toggle')
GHOST_FIELD = re.compile(r'^[a-z]+(_[a-z]+)+$')   # Ghost writes snake_case; Inflozo writes camelCase


def classify(field, type_cell):
    """Authored, control, or read-from-Ghost.

    TWO RULES WORTH STATING, because both were wrong in the first draft.

    1. Ghost's own post fields are typed by their DATA type, not marked as Ghost's — A27 declares
       `feature_image` as "image" and `published_at` as "date". What actually distinguishes them is
       the naming convention: Ghost is snake_case, Inflozo is camelCase. So the name decides, not
       the type.

    2. AUTHORED is tested before CONTROL, and that asymmetry is deliberate. A row often declares
       several fields at once under a compound type — `image` · `imageAlt` · `imageFocus` typed
       "image + text + enum" — and there is no way to map three names onto three types reliably.
       In a STORAGE CONTRACT, being over-inclusive is free (a spare parking space costs nothing)
       and being under-inclusive loses the user's words on a design switch. So when a cell could
       be read either way, it is treated as authored.
    """
    if GHOST_FIELD.match(field):
        return 'read'
    t = type_cell.strip().lower()
    if 'ghost' in t:
        return 'read'
    if any(k in t for k in AUTHORED):
        return 'authored'
    if any(k in t for k in CONTROL):
        return 'control'
    return 'unknown'


def typed_fields(text):
    """[(field, type, verdict)] from every table that has both a Field and a Type column."""
    out, seen = [], set()
    for m in re.finditer(r'^\|(.+?)\|[ \t]*\n\|[ :|-]+\|[ \t]*$', text, re.M):
        hdr = [c.strip().lower() for c in m.group(1).split('|')]
        fi = next((i for i, h in enumerate(hdr) if h in ('field', 'fields')), None)
        ti = next((i for i, h in enumerate(hdr) if h == 'type'), None)
        if fi is None or ti is None:
            continue
        block = text[m.end():]
        stop = re.search(r'\n\s*\n', block)
        for row in (block[:stop.start()] if stop else block[:6000]).split('\n'):
            if not row.strip().startswith('|'):
                continue
            cells = row.strip().strip('|').split('|')
            if max(fi, ti) >= len(cells):
                continue
            for f in re.findall(r'`([A-Za-z][A-Za-z0-9_]*(?:\[\])?)`', cells[fi]):
                if f not in seen:
                    seen.add(f)
                    out.append((f, cells[ti].strip(), classify(f, cells[ti])))
    return out


# Categories where the mechanical answer is wrong and a human ruled instead. Kept here, named,
# rather than silently patched — the whole point of this file is that it does not invent.
HAND_RULED = {
    'A33': ('none authored in Inflozo — every field this category touches belongs to a Ghost '
            'editor card (`src`, `caption`, `html`, `emoji`, `rating`…) and is written by the '
            'customer inside Ghost. A33 styles those cards and stores only its own treatment '
            'controls, so there is nothing here that a design switch could lose.'),
}


def dedupe(names):
    """`navItems` and `navItems[]` are one field written twice; keep the array form.

    Also drops a bare name whose dotted child is present (`children[]` beside
    `navItems[].children[]`), which is the same field reached two ways."""
    arrays = {n[:-2] for n in names if n.endswith('[]')}
    out = []
    for n in names:
        if n in arrays:                       # bare form of something already listed as an array
            continue
        if any(n != o and o.endswith('.' + n) for o in names):
            continue
        out.append(n)
    return out


def main():
    lib, _ = er.build()
    gaps_only = '--gaps' in sys.argv
    gaps = []
    for cat in sorted(lib, key=lambda c: int(c[1:]) if c[1:].isdigit() else 999):
        if lib[cat].get('deleted'):
            continue
        fn = next((f for f in os.listdir(EXPORT)
                   if f.startswith(cat + ' ') and f.endswith('- Spec.md')), None)
        if not fn:
            continue
        text = open(os.path.join(EXPORT, fn), encoding='utf8').read()
        rows = typed_fields(text)
        if not rows:
            # The 13 prose specs head every design's block with **Content fields.** or **Fields**,
            # so what field_union() returns for them is ALREADY the content list — there are no
            # controls mixed in. Only Ghost's snake_case reads need lifting out.
            names = er.field_union(text)
            rows = [(f, 'prose', 'read' if GHOST_FIELD.match(f) else 'authored') for f in names]
            if not rows:
                gaps.append(cat)
                if not gaps_only:
                    print(f'{cat:5} NO FIELDS FOUND AT ALL — needs a human read')
                continue
        if gaps_only:
            continue
        authored = dedupe([f for f, t, v in rows if v == 'authored'])
        if cat in HAND_RULED:
            print(f'{cat:5} Content: {HAND_RULED[cat]}')
            continue
        control = [f for f, t, v in rows if v == 'control']
        read = [f for f, t, v in rows if v == 'read']
        unknown = [(f, t) for f, t, v in rows if v == 'unknown']
        print(f'{cat:5} Content: {", ".join(authored) if authored else "— none typed —"}')
        if control:
            print(f'      Controls (enum/int): {", ".join(control)}')
        if read:
            print(f'      Reads from Ghost (a note, not the contract): {", ".join(read)}')
        if unknown:
            print(f'      UNCLASSIFIED, needs a look: {unknown}')
    if gaps:
        print(f'\n{len(gaps)} categories declare fields in prose and need reading: {", ".join(gaps)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
