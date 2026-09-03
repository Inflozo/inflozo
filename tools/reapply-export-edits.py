#!/usr/bin/env python3
"""Re-apply the edits that live in the REPO and cannot survive a Claude Design re-export.

    python3 tools/reapply-export-edits.py            # apply, and report anything it could not
    python3 tools/reapply-export-edits.py --check    # exit non-zero if anything still needs applying

WHY THIS EXISTS, and it is not tidiness.

Two edits were made to the design export in this repository rather than in Claude Design: the
count-agnostic marketing copy (no screen prints a design total) and P0's per-prop mark allowlist.
`DESIGN-PATCH-PROMPTS-2.html` carried a warning asking Claude Design not to undo them.

**That warning was the wrong tool, and the 2026-09-01 re-export proved it.** The sessions behaved
exactly as asked — P0's spec says three separate times that the allowlist "was written in the
repository. It has not been re-authored or paraphrased here." They could not preserve text their
project copy never contained. A re-export replaces the repo's copy with the project's copy, so a
repo-side edit is lost by construction, however carefully everyone behaves.

So the edit is re-applied by a SCRIPT, run after every export, and gated by
`tools/verify-design-pass.py`. A remembered step that fails silently becomes a runnable one that
fails loudly.

DESIGN NOTE — why an explicit table and not a clever regex. A generic pattern over "N designs"
produces broken English: the first attempt at this by hand emitted "Every design **are**
available". Every substitution below is an exact string with an exact replacement, read from the
screens. When a re-export introduces a phrasing this table does not hold, the script REPORTS it and
exits non-zero rather than guessing — and `verify-design-pass.py` fails independently, so a missed
one cannot pass quietly. Adding the new phrasing here is the fix.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')
CHECK = '--check' in sys.argv

# ─────────────────────────────────────────────────────────────────────────────
# 1. The count-agnostic marketing copy.
#    Appendix H forbids a design total in product copy: FR-J14 commits to monthly library drops,
#    so any number baked into copy is wrong within a month. The 2026-09-01 re-export printed BOTH
#    a stale 485 and a freshly computed 466 — and 466 disagreed with the derived 467 on the day it
#    was written, which is the argument in one line.
# ─────────────────────────────────────────────────────────────────────────────
COPY = [
    ('485 designs · 70 Free',                 'Every design · the free set'),
    ('All 485 designs are available',         'Every design is available'),
    ('all 485 designs and nothing stops them','every design, and nothing stops them'),
    ('a month, all 485 designs',              'a month, every design'),
    ('Our 485 designs are built',             'Our designs are built'),
    ('466 designs across 33 categories',      'Every design across every category'),
    ('33 CATEGORIES · 466 DESIGNS · 33 CATEGORY SPECS + P0',
     'EVERY CATEGORY DRAWN AND SPECIFIED'),
    ('Drawn once so 466 designs need not be.','Drawn once so every design need not be.'),
    ("'33 categories · 466 designs · 33 proofs · 33 specs'",
     "'every category — drawn, proofed and specified'"),
    ('485 designed sections',                 'Hundreds of designed sections'),
    ('Browse all 485 designs',                'Browse every design'),
    ('All 485 designs on the canvas',         'Every design on the canvas'),
    ('Ship all 485 designs',                  'Ship every design'),
    ('all 485 designs · full history',        'every design · full history'),
    ('485 designs. Zero blank pages.',        'Every design. Zero blank pages.'),
    ('All 485 designs',                       'Every design'),
    ('485 designs cannot each be drawn',      'The designs cannot each be drawn'),
    ('An empty page and 485 designs.',        'An empty page and every design.'),
    ('Ship the 70 Free',                      'Ship the free set'),
    # ── Put back by the 2026-09-01 re-export and undetected until 2026-09-02, because both
    #    detectors matched raw HTML. Written against the CURRENT markup, tags included.
    ('color:#FF5941">485</span>',             'color:#FF5941">Hundreds</span>'),
    ('<span>70 Free</span><span style="font-weight:600">All 485</span>',
     '<span>The free set</span><span style="font-weight:600">All</span>'),
    ('you ship the 70 Free ones',             'you ship the free set'),
    ('Play with all 485 on the canvas, ship the Free designs',
     'Play with every design on the canvas, ship the free set'),
    # ── Never fixed at all: the meta rail on the two browsing screens. §A4 recorded that the
    #    31 August substitution missed some, which is standing rule 7 in one line. This one was
    #    also STALE — it still said 34 categories after A23 Search was deleted.
    ('34 CATEGORIES<span>485</span>',         'ALL CATEGORIES<span>ALL DESIGNS</span>'),
    ('70 Free designs',                       'the free set'),
    # ── Missed by BOTH controls until 2026-09-03, because the regex below required the noun
    #    to abut the number and this one has an adjective between them. Appendix H names the
    #    canonical string for exactly this surface: "hundreds of gorgeous sections".
    ('485 gorgeous designs',                  'hundreds of gorgeous sections'),
    # ── Same miss, same commit. B13a's design note. Only the COUNT is reworded here; the
    #    mechanism it describes is wrong too (FR-L3 swaps via Shuffle, with no pairing
    #    table at all) and that correction belongs in EXPERIENCE.md, not in the frame.
    ('415 Pro designs each need a named Free fallback',
     'every Pro design needs a named Free fallback'),
]

# Files the rule governs: the app screens, the marketing pages, and the internal index frames.
SCREEN = re.compile(r'^(S\d|M\d|B |R |Index)')

# Appendix H governs PRODUCT copy. `Index*.dc.html` are Claude Design's own progress canvases and
# their totals are derived from the export itself, so a correct figure there is not a breach —
# §A4's objection to them was that the number was STALE, and it is not now.
PRODUCT = re.compile(r'^(S\d|M\d|B )')


def leftovers(raw):
    """Library totals printed in product copy — found in the RENDERED text, not the raw HTML.

    **THE FIRST VERSION OF THIS WAS WRONG IN TWO WAYS AND BOTH WERE PROVED ON 2026-09-02.** It
    matched raw HTML and required three digits. The export splits the number and its noun across
    two <span>s — `>485</span><span …>designed sections</span>` — so nothing matched; and "70 Free"
    is two digits, so nothing matched there either. The count-agnostic copy had been regressed by
    the 1 September re-export and **this check, and verify-design-pass.py's copy of it, passed on
    every run for two days.** A control that cannot fail is not a control (standing rule 2).

    THE THRESHOLDS ARE THE WHOLE DESIGN, and the first attempt at them was also wrong. Flagging
    every "N Free" caught the Section Picker's category rail — "404 & Empty *6*" sits next to a
    "*Free only*" filter toggle, and stripping the tags between them glues the two into "6 Free".
    A per-category count is a true, local, useful number and must not be flagged; a LIBRARY total
    must always be. They separate cleanly by size, because the library is two orders larger than
    its largest category.

    **AND IT WAS STILL BLIND, PROVED 2026-09-03 (step 5).** The number and its noun do not have to
    abut: `S3 Dashboard`'s empty state read "Yours starts with **485 gorgeous designs**", and one
    adjective was enough to walk past both controls for three days — a *third* miss of the same
    rule, by the same mechanism, after two repairs. Up to two words may now sit between them. The
    three fixed breakpoints (390 · 834 · 1440) are excluded by name, because a frame caption reads
    "· 1440" and the next label often begins "Find a section".

    # ponytail: fixed thresholds, not a derived total. Upgrade to reading tools/export-roster.py
    # if a category ever approaches a third of the library, which would mean about eleven
    # categories in total and a very different product.
    """
    t = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', raw))
    return [m.group(0).strip() for m in re.finditer(
        r'\b(?!390\b|834\b|1440\b)\d{3,4}\+?(?:\s+\w+){0,2}'
        r'\s*(?:designs?|designed sections?|sections?)'                 # designs: >= 100
        r'|\b(?:[4-9]\d|\d{3,4})\s*Free\b'                            # free set: >= 40
        r'|\b(?:[3-9]\d|\d{3})\s*CATEGOR\w*', t, re.I)]               # categories: >= 30

# ─────────────────────────────────────────────────────────────────────────────
# 2. P0's per-prop mark allowlist — §37.7's last open finding, written here on 2026-08-31.
#    AD-4 carries the RULE; what was missing was how the editor shows it.
# ─────────────────────────────────────────────────────────────────────────────
P0_SPEC = 'P0 Editor Primitives - Spec.md'
P0_ANCHOR = '| 5 | Remove link | — | the selection carries no link (35 % opacity) |'
P0_BLOCK = """

**Not every field permits every mark, and the toolbar says so** ⚑ *(the per-prop mark allowlist —
AD-4 carries the rule, this is how the editor shows it)*. The default set for a text field is the
four above: **bold, italic, underline, link**. A field may **narrow** that set, and its own category
spec declares the narrowing; a field may never gain a mark AD-4 does not define, except where the
PRD records a delta.

- **A mark a field does not permit is not drawn in its toolbar at all** — not greyed. Greying is for
  a mark that exists here and is unavailable right now (Remove link with nothing linked); absence is
  for a mark this field never has. An editor should not learn a button and then find it dead.
- **The toolbar therefore varies in width by field**, which is why its buttons are a fixed order:
  a field permitting only bold and link draws two buttons in the same order as a field permitting
  four, so the shapes stay recognisable.
- **Two narrowings are on record today**, both from the reconciliation and both stated in their own
  specs: **Testimonials' quote fields permit NO marks** — a pull quote is typographic, and emphasis
  inside one fights the design that carries it — and **FAQ's answer fields add `code`**, which is a
  PRD delta recorded in that category's settlement 3 rather than smoothed over.
- **Where a spec says nothing, the default four apply.** Silence is not a narrowing.

> **This block is maintained in the repository, not in Claude Design** — it is re-applied by
> `tools/reapply-export-edits.py` after every export and gated by `tools/verify-design-pass.py`.
> A Claude Design session cannot preserve it, because its project copy has never held it.
"""


def apply_copy():
    changed, left = [], []
    for fn in sorted(os.listdir(EXPORT)):
        if not fn.endswith('.dc.html') or not SCREEN.match(fn):
            continue
        path = os.path.join(EXPORT, fn)
        t = original = open(path, encoding='utf8').read()
        for a, b in COPY:
            t = t.replace(a, b)
        if t != original and not CHECK:
            open(path, 'w', encoding='utf8').write(t)
        if t != original:
            changed.append(fn)
        if PRODUCT.match(fn):
            left.extend(f'{fn}: {h}' for h in leftovers(t))
    return changed, left


def apply_p0():
    path = os.path.join(EXPORT, P0_SPEC)
    if not os.path.exists(path):
        return 'missing', f'{P0_SPEC} is not in the export'
    t = open(path, encoding='utf8').read()
    if 'the per-prop mark allowlist' in t:
        return 'present', 'already carries the allowlist'
    if P0_ANCHOR not in t:
        return 'anchor-gone', ('the anchor line this block attaches to has changed — re-read P0 and '
                               'update P0_ANCHOR in this script rather than guessing where it goes')
    if not CHECK:
        open(path, 'w', encoding='utf8').write(t.replace(P0_ANCHOR, P0_ANCHOR + P0_BLOCK, 1))
    return 'applied', 're-inserted after the inline-toolbar table'


def main():
    if not os.path.isdir(EXPORT):
        print(f'no export at {EXPORT}'); return 1
    changed, left = apply_copy()
    state, detail = apply_p0()

    verb = 'would change' if CHECK else 'changed'
    print(f'  marketing copy : {verb} {len(changed)} file(s)'
          + (f' — {", ".join(sorted(changed))}' if changed else ''))
    print(f'  P0 allowlist   : {state} — {detail}')

    bad = bool(left) or state in ('missing', 'anchor-gone')
    for l in left:
        print(f'  ! UNHANDLED    : {l}')
    if left:
        print('\n  A printed total this script does not know how to reword. Add the exact string and\n'
              '  its replacement to COPY above — do NOT generalise it into a regex, because that is\n'
              '  how "Every design are available" got shipped once already.')
    if CHECK and (changed or state == 'applied'):
        print('\n  --check: the export needs these re-applied. Run without --check.')
        return 1
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
