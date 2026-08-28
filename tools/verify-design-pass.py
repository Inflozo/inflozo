#!/usr/bin/env python3
"""Inflozo — did the Claude Design patch pass actually apply the Ghost Build Room's rulings?

    python3 tools/verify-design-pass.py             # every check; EXIT NON-ZERO on failure
    python3 tools/verify-design-pass.py --extract   # dump what can be parsed, for the derivations
    python3 tools/verify-design-pass.py --verbose   # show every offending line, not a sample
    python3 tools/verify-design-pass.py --only=P0,A1,A4   # just the categories you have done

Why this exists, and why it is a script rather than a review.

Step 4a asked an OPEN question — does this design contradict the PRD, the architecture or Ghost? —
and needed 1,086 findings to answer it. This asks a CLOSED one: did the design pass apply the 29
rulings we already made? That is a checklist, and a checklist is a program.

Written BEFORE the patched export landed, deliberately. Run against the pre-patch export it fails
most checks, which is the point: a check that passes before the work is done is not a check. Treat
the first run as the mutation test.

Rulings are cited by their number in
`_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md`.

ONE DESIGN RULE, LEARNED THE HARD WAY. `export-roster.py`'s field_union() returns a plausible list
for 15 specs and SILENTLY RETURNS NOTHING for 20 of them, because the export declares fields in at
least five prose shapes (A9 uses `**Behaviour module.**` headers; A15 buries them in flowing prose).
A silent empty list is worse than a stale one — it would write an empty storage contract and every
field would lose its parking space when a user switches design. So nothing here reports an empty
result as success: an extraction that finds nothing is a LOUD failure, never a quiet zero.
"""
import os, re, sys, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')

_spec = importlib.util.spec_from_file_location('er', os.path.join(ROOT, 'tools/export-roster.py'))
er = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(er)

VERBOSE = '--verbose' in sys.argv


ONLY = next((a.split('=', 1)[1].upper().split(',')
             for a in sys.argv if a.startswith('--only=')), None)


def specs():
    """{category: (filename, text)} for every spec in the export, or just --only=P0,A1,A4."""
    out = {}
    for fn in sorted(os.listdir(EXPORT)):
        if fn.endswith('- Spec.md'):
            cat = fn.split()[0]
            if ONLY and cat not in ONLY:
                continue
            out[cat] = (fn, open(os.path.join(EXPORT, fn), encoding='utf8').read())
    return out


_REF = (r'\b(no|not|never|without|refus\w*|drop\w*|strike\w*|struck|cut|removed?|deleted?|gone|'
        r'retired?|unbound|leaves|exempt|replaced?|cannot|can\'t|instead of|rather than)\b')
REFUSAL_BEFORE = re.compile(_REF + r'[^.]{0,80}$', re.I)
# DELIBERATELY NARROW. A refusal written AFTER the match is rare — the corpus almost always
# writes it before ("no design declares", "~~struck~~", "is gone with A23"). Matching the full
# refusal vocabulary forwards produced a FALSE NEGATIVE that matters: A33 line 335 still calls
# the toggle card `<details>`/`<summary>` and was silently dropped because "never an h-level"
# sat 40 characters later, refusing something else entirely. A missed violation reads as a pass,
# which is strictly worse than a false positive costing a minute of reading. So only "replaced"
# — unambiguous, and the one real case (P0: "any Tight/Even/Airy is replaced").
REFUSAL_AFTER = re.compile(r'^[^.]{0,60}\bis replaced\b|^[^.]{0,60}\bare replaced\b', re.I)
STRIKE = re.compile(r'~~[^~]{0,90}$')


def hits(pattern, text, flags=re.I, skip_refusals=True):
    """Matches, minus any the spec is explicitly REFUSING.

    A12 says: no tooltip, no hover name and no "+4 more". That sentence honours ruling R-1;
    flagging it would make this file cry wolf, and a gate that cries wolf gets ignored — which
    is the exact failure doc-audit.py's own header was written to prevent."""
    out = []
    for m in re.finditer(pattern, text, flags):
        if skip_refusals:
            before, after = text[max(0, m.start() - 90):m.start()], text[m.end():m.end() + 90]
            if (REFUSAL_BEFORE.search(before) or REFUSAL_AFTER.search(after)
                    or STRIKE.search(before)):
                continue
        out.append(m.group(0).strip()[:100])
    return out


def sample(items, n=3):
    shown = items if VERBOSE else items[:n]
    more = '' if VERBOSE or len(items) <= n else f' … +{len(items)-n} more'
    return '; '.join(shown) + more


# ─────────────────────────────────────────────────────────────────────────────
# Each check returns (ok, detail). Named for the ruling it enforces.
# ─────────────────────────────────────────────────────────────────────────────

def c_categories(S, lib):
    """R-24 — Search is deleted; the library is 33 categories and A23 is retired, not reused."""
    live = {c for c, v in lib.items() if not v.get('deleted')}
    problems = []
    if 'A23' in live:
        problems.append('A23 still live')
    if 'A23' in S:
        problems.append(f'A23 spec file still present ({S["A23"][0]})')
    if len(live) != 33:
        problems.append(f'{len(live)} live categories, expected 33')
    return not problems, '; '.join(problems) or '33 categories, no A23'


def c_numbering(S, lib):
    """B0 — deleted designs leave PERMANENT holes. Renumbering breaks every cross-reference."""
    want = {'A1': 9, 'A4': 15}
    problems = []
    for cat, hole in want.items():
        if cat not in lib:
            problems.append(f'{cat} missing'); continue
        ns = [d['n'] for d in lib[cat]['designs'] if not d.get('deleted')]
        if hole in ns:
            problems.append(f'{cat} #{hole} was reused — the hole must stay open')
        if ns and ns == list(range(1, len(ns) + 1)):
            problems.append(f'{cat} looks renumbered (contiguous 1..{len(ns)})')
    return not problems, '; '.join(problems) or 'holes at A1 #9 and A4 #15 intact'


def c_free(S, lib):
    """R-17 — exactly two [Free] per category, marked in the spec's own roster."""
    missing, wrong = [], []
    for cat, (fn, text) in S.items():
        if cat == 'P0' or lib.get(cat, {}).get('deleted'):
            continue
        n = len(re.findall(r'\[Free\]', text))
        if n == 0:
            missing.append(cat)
        elif n != 2:
            wrong.append(f'{cat}={n}')
    problems = []
    if missing:
        problems.append(f'no [Free] marker at all in {len(missing)}: {sample(missing, 6)}')
    if wrong:
        problems.append(f'not exactly two in: {sample(wrong, 6)}')
    return not problems, '; '.join(problems) or 'exactly two [Free] per category'


def c_dead_modules(S, lib):
    """R-24 — search-overlay, search-expand and command-palette no longer exist."""
    dead = ('search-overlay', 'search-expand', 'command-palette')
    found = []
    for cat, (fn, text) in S.items():
        for m in dead:
            # A spec that RECORDS a retired name ("~~`search-overlay`~~", "no design declares one",
            # "was never A4's; recorded") is honouring the ruling, not breaking it.
            if hits(rf'`{m}`', text):
                found.append(f'{cat}:{m}')
    return not found, f'still declared: {sample(found, 6)}' if found else 'no deleted module is declared'


def c_runtime_handoff(S, lib):
    """R-8 / AD-37 — a placed design never becomes another design at render."""
    pat = (r'(draws as (?:1|one) [A-Z]\w+|becomes (?:another|the [a-z]+ )?design|'
           r'hands? off to (?:design|another design)|renders as [A-Z]\w+ (?:below|above|when))')
    found = [f'{c}: {h}' for c, (fn, t) in S.items() for h in hits(pat, t)]
    return not found, f'hand-off language survives: {sample(found)}' if found else 'no render-time hand-off language'


def c_computed_counts(S, lib):
    """R-1 — Handlebars cannot count. Bylines lose the number entirely."""
    pat = r'(and \d+ others?|\+\s*\d+\s+more|others?\s*\(\s*count|authors\.length\s*[-−]\s*1)'
    found = [f'{c}: {h}' for c, (fn, t) in S.items() for h in hits(pat, t)]
    return not found, f'computed count survives: {sample(found)}' if found else 'no computed byline counts'


def c_gap_names(S, lib):
    """R-14 — gap names are Tight · Normal · Loose. D26 was reversed."""
    pat = r'Tight\s*[·/,]\s*(Even|Standard)\s*[·/,]\s*(Airy|Wide)'
    found = [f'{c}: {h}' for c, (fn, t) in S.items() for h in hits(pat, t)]
    return not found, f'wrong gap ladder: {sample(found)}' if found else 'gap names are Tight/Normal/Loose'


def c_video_upload(S, lib):
    """R-9 — A15's Upload source and the Ambient loop are cut; embeds remain."""
    if 'A15' not in S:
        return True, 'not in scope for this run'
    t = S['A15'][1]
    found = hits(r'(Ambient loop|Source:?\s*Upload|\bUpload\b\s*[·—-]|media library)', t)
    return not found, f'upload branch survives: {sample(found)}' if found else 'Upload and Ambient loop are gone'


def c_share_link(S, lib):
    """R-10 — #/share is parsed by nothing; Portal's path is #/portal/share."""
    found = [f'{c}: {h}' for c, (fn, t) in S.items()
             for h in hits(r'#/share\b', t) if 'portal' not in h.lower()]
    return not found, f'bare #/share survives: {sample(found)}' if found else 'no bare #/share'


def c_toggle_card(S, lib):
    """R-6 — Ghost emits div.kg-toggle-card > h4 + button, never <details>."""
    if 'A33' not in S:
        return True, 'not in scope for this run'
    t = S['A33'][1]
    bad = hits(r'<details|<summary', t)
    good = re.search(r'kg-toggle-card', t)
    problems = []
    if bad:
        problems.append(f'<details> survives: {sample(bad)}')
    if not good:
        problems.append('no reference to Ghost\'s real kg-toggle-card markup')
    return not problems, '; '.join(problems) or 'toggle roll redrawn on Ghost\'s markup'


def c_member_fields(S, lib):
    """R-4 / AD-38 — @member has no join date and no newsletter list."""
    found = [f'{c}: {h}' for c, (fn, t) in S.items()
             for h in hits(r'(Member since|member\.created_at|@member\.newsletters)', t)]
    return not found, f'nonexistent member field survives: {sample(found)}' if found else 'no phantom @member fields'


def c_ctrl_k(S, lib):
    """R-24's lint rule — sodo-search owns ⌘K, so no Inflozo design may bind it."""
    # SCOPE: the published site only. Inflozo's own editor is not a Ghost site, and P0 keeps ⌘K
    # for the Link popover — correctly, and it says so. The first draft of this check flagged that,
    # which is the rule's ambiguity showing up as a false positive rather than P0 being wrong.
    found = []
    for c, (fn, t) in S.items():
        if c == 'P0':
            continue
        for h in hits(r'(⌘K|Cmd\s*\+?\s*K\b|Ctrl\s*\+\s*K\b)', t):
            found.append(f'{c}: {h}')
    return not found, (f'⌘K bound on the published site: {sample(found)}' if found
                       else "nothing binds ⌘K on the published site (P0's editor shortcut is exempt)")


def c_search_route(S, lib):
    """R-24 / R-25 — no /search/ route is emitted by anyone."""
    found = [f'{c}: {h}' for c, (fn, t) in S.items() for h in hits(r'action="/search/"|/search/\s*route', t)]
    return not found, f'/search/ route survives: {sample(found)}' if found else 'no /search/ route'


def c_search_control(S, lib):
    """R-24 — search becomes a Headers control: Off · Icon · Button · Bar."""
    if 'A1' not in S:
        return True, 'not in scope for this run'
    t = S['A1'][1]
    ladder = re.search(r'Search\s*[:·]\s*Off\s*[·/|]\s*Icon', t, re.I)
    attr = re.search(r'data-ghost-search', t)
    ok = bool(ladder or attr)
    how = 'control ladder' if ladder else ('data-ghost-search' if attr else '')
    return ok, (f'present ({how})' if ok
                else 'A1 declares no "Search: Off · Icon · Button · Bar" control and no data-ghost-search')


def c_nojs_notice(S, lib):
    """R-5 — subscribe forms are JS-required, so a designed <noscript> notice must exist."""
    consumers = [c for c, (fn, t) in S.items() if re.search(r'data-members-form|member-form', t)]
    have = [c for c in consumers
            if re.search(r'noscript|without JavaScript|JavaScript is required|JS off', S[c][1], re.I)]
    missing = sorted(set(consumers) - set(have))
    return not missing, (f'{len(consumers)} form categories, {len(missing)} lack a no-JS notice: {sample(missing, 6)}'
                         if missing else f'all {len(consumers)} form categories carry one')


def c_new_modules(S, lib):
    """R-1 / R-3 — grouping and the condensed bar need their new modules declared."""
    want = {'group-headings': ('A18', 'A20', 'A21'), 'header-scroll': ('A24',)}
    problems = []
    for mod, cats in want.items():
        for c in cats:
            if c in S and not re.search(rf'`{mod}`', S[c][1]):
                problems.append(f'{c} does not declare {mod}')
    return not problems, '; '.join(problems) or 'group-headings and header-scroll declared'


def c_patch_notes(S, lib):
    """Part E — every touched spec ends with Patch notes; OPEN QUESTIONs need triage."""
    without = [c for c, (fn, t) in S.items() if not re.search(r'Patch notes', t, re.I)]
    open_qs = []
    for c, (fn, t) in S.items():
        m = re.search(r'^#{2,4} Open questions\s*$(.*)', t, re.M | re.S)
        if not m:
            continue
        body = m.group(1)[:6000]
        if re.search(r'No open questions remain', body, re.I):
            continue
        # a struck-through or "Confirmed/Closed/Settled by the owner" item is already answered
        live = [ln for ln in re.findall(r'^\s*\d+\.\s+(.+)$', body, re.M)
                if not ln.lstrip().startswith('~~')
                and not re.search(r'(Confirmed|Closed|Settled|Ruled) by the owner|^\*\*No open questions', ln)]
        if live:
            open_qs.append(f'{c}({len(live)})')
    problems = []
    if without:
        problems.append(f'{len(without)} specs have no Patch notes: {sample(without, 6)}')
    detail = '; '.join(problems) or 'every spec carries Patch notes'
    if open_qs:
        detail += f'  |  OPEN QUESTIONS to triage: {sample(open_qs, 8)}'
    return not problems, detail


def c_extraction_health(S, lib):
    """Not a ruling — readiness for the two deferred derivations. See the module docstring."""
    blind = [c for c, (fn, t) in S.items()
             if c not in ('P0',) and not lib.get(c, {}).get('deleted') and not er.field_union(t)]
    return not blind, (f'{len(blind)} specs the field extractor cannot read (derivation must be by hand '
                       f'for these): {sample(blind, 8)}' if blind else 'every spec is machine-readable')


CHECKS = [
    ('R-24  categories / A23 deleted', c_categories),
    ('B0    numbering holes preserved', c_numbering),
    ('R-17  two [Free] per category', c_free),
    ('R-24  deleted modules gone', c_dead_modules),
    ('R-8   no render-time hand-off', c_runtime_handoff),
    ('R-1   no computed byline counts', c_computed_counts),
    ('R-14  gap names Tight/Normal/Loose', c_gap_names),
    ('R-9   A15 Upload + Ambient cut', c_video_upload),
    ('R-10  #/portal/share, not #/share', c_share_link),
    ('R-6   A33 toggle on Ghost markup', c_toggle_card),
    ('R-4   no phantom @member fields', c_member_fields),
    ('R-24  nothing binds ⌘K', c_ctrl_k),
    ('R-24  no /search/ route', c_search_route),
    ('R-24  A1 gains the Search control', c_search_control),
    ('R-5   no-JS notice on form designs', c_nojs_notice),
    ('R-1/3 new modules declared', c_new_modules),
    ('E     Patch notes + open questions', c_patch_notes),
    ('--    extraction health (derivations)', c_extraction_health),
]


RESEARCH = os.path.join(ROOT, '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17',
                        'research-section-js-libraries.md')


def known_modules():
    """The registry's real module names, read from research §2.1 — never hardcoded (standing rule 4)."""
    try:
        txt = open(RESEARCH, encoding='utf8').read()
    except OSError:
        return set()
    return set(re.findall(r'^\| \d+ \| \*\*`([a-z][a-z0-9-]+)`\*\*', txt, re.M))


def extract():
    """Dump what can be parsed per category, marking what a human must read. See docstring."""
    S, lib = specs(), er.build()[0]
    print('category  fields  modules  shape')
    for cat in sorted(S, key=lambda c: (c != 'P0', int(c[1:]) if c[1:].isdigit() else 0)):
        fn, t = S[cat]
        if lib.get(cat, {}).get('deleted'):
            continue
        designs = [d for d in lib.get(cat, {}).get('designs', []) if not d.get('deleted')]
        f = er.field_union(t)
        # module_union() backtick-matches, so it also collects `title`, `form`, `aria-live` and
        # other non-modules. Intersecting with the real registry removes that whole class; what
        # it CANNOT remove is a real module named in a sentence that merely mentions it, which
        # is why this stays a diagnostic and the derivation is still done by reading.
        known = known_modules()
        m = [x for x in er.module_union(t, designs) if not known or x in known]
        shape = 'parsed' if f else 'UNREADABLE — derive by hand'
        print(f'  {cat:5}  {len(f):5}  {len(m):6}   {shape}')
        if f:
            print(f'         fields:  {", ".join(f)}')
        if m:
            print(f'         modules: {", ".join(m)}')


def main():
    if not os.path.isdir(EXPORT):
        print(f'export not found: {EXPORT}'); return 1
    if '--extract' in sys.argv:
        extract(); return 0

    S, lib = specs(), er.build()[0]
    print(f'verifying the design patch pass against {len(S)} specs in {os.path.basename(EXPORT)}/\n')
    failed = 0
    for name, fn in CHECKS:
        try:
            ok, detail = fn(S, lib)
        except Exception as e:                      # a broken check must never read as a pass
            ok, detail = False, f'CHECK ERRORED: {e.__class__.__name__}: {e}'
        print(f'  {"PASS" if ok else "FAIL"}  {name:38}  {detail}')
        failed += not ok
    print()
    if failed:
        print(f'{failed} of {len(CHECKS)} checks failed.')
        print('Before the design pass lands, most SHOULD fail — that is this file proving it has teeth.')
        return 1
    print(f'all {len(CHECKS)} checks pass — the rulings are in the export.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
