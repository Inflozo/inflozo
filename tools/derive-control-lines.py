#!/usr/bin/env python3
"""Draft the per-category `Controls:` line for sections-inventory.md from the design export.

    python3 tools/derive-control-lines.py            # a draft line per category
    python3 tools/derive-control-lines.py --gaps     # only what could not be read

`Controls:` is the category's union control list — every knob any of its designs offers. A design
draws its own subset from it (FR-F3), so the union is what the editor's panel vocabulary is built
from. The lines in the inventory predate the design patch pass and name values that pass changed.

TWO DECLARATION SHAPES, the same split as everywhere else in this corpus:

  prose   15 specs write a per-design line — **Controls** · Head: Centred · Flush left · None.
          Title size: Medium 34 · Large 40 · Display 48. Marker: Chevron · Plus.
          The control's NAME is the text before each colon.
  table   the rest carry `Field | Type | Values` tables whose enum and integer rows are controls;
          those are classified by tools/derive-content-lines.py and reused here rather than
          re-implemented.

WHAT IT REFUSES TO DO. A category whose controls cannot be read from either shape is reported, not
guessed at. A stale Controls line is wrong documentation; an invented one is a panel vocabulary
nobody agreed to, and this pass has already shown that inferring from prose over-matches badly.
"""
import os, re, sys, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')
_s = importlib.util.spec_from_file_location('er', os.path.join(ROOT, 'tools/export-roster.py'))
er = importlib.util.module_from_spec(_s); _s.loader.exec_module(er)
_d = importlib.util.spec_from_file_location('dc', os.path.join(ROOT, 'tools/derive-content-lines.py'))
dc = importlib.util.module_from_spec(_d); _d.loader.exec_module(dc)

# Anchor EXACTLY on **Controls** / **Controls.** — `**Controls-reconciliation pass…**` is a
# section heading, and matching it swallowed eight categories' worth of prose as if it were a
# control list.
CONTROLS_LINE = re.compile(r'^[ \t]*(?:\d+\.\s*)?\*\*Controls\.?\*\*[ ·:]*(.+?)(?:\n\*\*|\n#{2,5} |\n\n)', re.M | re.S)

# THREE NAMING SHAPES, all in use:
#   "Head: Centred · Flush left · None."      name before a colon        (A9–A13)
#   "Media (Icon · None) · Head alignment (…)" name before a bracket     (A5)
# so try both. Everything after the name is its value set and is not needed for the union.
NAME_COLON = re.compile(r'(?:^|[.;]\s+|\*\*)\s*([A-Z][A-Za-z0-9 /’\'-]{2,38}?)\s*:', re.M)
NAME_PAREN = re.compile(r'(?:^|[·.;]\s+|\*\*)\s*([A-Z][A-Za-z0-9 /’\'-]{2,38}?)\s*\(')

# Words that begin a clause but are prose, not a control name.
NOT_A_CONTROL = {
    'note', 'notes', 'exception', 'exceptions', 'flagged', 'ruled', 'reason', 'because',
    'default', 'defaults', 'js off', 'arrangement', 'responsive', 'items', 'empty',
    'descriptor', 'behaviour module', 'content fields', 'accessibility', 'a11y', 'example',
}


CONTROL_TABLE = re.compile(r'^[ \t]*\|\s*Control\s*\|[^\n]*\n[ \t]*\|[ :|-]+\|[ \t]*\n((?:[ \t]*\|[^\n]*\n)+)', re.M)


def table_control_names(text):
    """A per-design `| Control | Values |` table — the cleanest shape, used by A1-A3.

    Found only after the prose extractor started reporting "Spacious 240" and "Surface" as
    controls: it was matching the text after **Controls.**, which in these specs IS this table,
    and pulling VALUES out of the second column."""
    seen = []
    for m in CONTROL_TABLE.finditer(text):
        for row in m.group(1).strip().split('\n'):
            cells = row.strip().strip('|').split('|')
            if not cells:
                continue
            name = ' '.join(re.sub(r'[`*]', '', cells[0]).split()).strip()
            if name and len(name) > 2 and name.lower() not in NOT_A_CONTROL and name not in seen:
                seen.append(name)
    return seen


def prose_controls(text):
    """Union of control names from the per-design **Controls** lines, in first-seen order."""
    seen = []
    for _num, _name, body in er.design_sections(text):
        for m in CONTROLS_LINE.finditer(body):
            found = NAME_COLON.findall(m.group(1)) + NAME_PAREN.findall(m.group(1))
            for raw in found:
                name = ' '.join(raw.split()).strip('*').strip()
                # a clause with a verb in it is a sentence, not a control name
                if (name.lower() in NOT_A_CONTROL or len(name) < 3
                        or re.search(r'\b(is|are|was|has|have|no|not|and|but|so)\b', name, re.I)):
                    continue
                if name not in seen:
                    seen.append(name)
    return seen


def table_controls(text):
    """Controls from the typed tables — the enum and integer rows, already classified."""
    return [f for f, _t, v in dc.typed_fields(text) if v == 'control']


def main():
    lib, _ = er.build()
    gaps = []
    for cat in sorted(lib, key=lambda c: int(c[1:]) if c[1:].isdigit() else 999):
        if lib[cat].get('deleted'):
            continue
        fn = next((f for f in os.listdir(EXPORT)
                   if f.startswith(cat + ' ') and f.endswith('- Spec.md')), None)
        if not fn:
            continue
        text = open(os.path.join(EXPORT, fn), encoding='utf8').read()
        names = table_control_names(text) or prose_controls(text) or table_controls(text)
        if not names:
            gaps.append(cat)
            if '--gaps' not in sys.argv:
                print(f'{cat:5} NO READABLE CONTROL DECLARATION — needs a human read')
            continue
        if '--gaps' in sys.argv:
            continue
        print(f'{cat:5} Controls: {", ".join(names)}')
    if gaps:
        print(f'\n{len(gaps)} categories need reading: {", ".join(gaps)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
