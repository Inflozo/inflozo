#!/usr/bin/env python3
"""Inflozo — the step-5b static prototype generator.  SECOND CUT.

    python3 build.py        # writes index.html and every surface page beside this file

WHAT THIS IS. Ruling R-75's deliverable: Inflozo's own UI as static pages the owner opens with a
double-click. It is the ANNOTATED build — every page names the frame it derives from (R-74) and the
`EXPERIENCE.md` section it implements, and shows every state that surface has. That is what makes a
page checkable against the export rather than merely plausible.

WHAT CHANGED IN THE SECOND CUT, AND WHY. The first cut RE-DREW each frame from a text extraction of
the export — a tag-stripping pass that yields the copy and none of the composition. The owner opened
the walkthrough beside it and said it did not match the export; it did not, and 5b had the same
defect. A page that claims "this derives from S4a" while rendering something S4a does not look like
is worse than no page at all, because it invites a check that then passes falsely.

So no screen here is drawn any more. `../frames.py` LIFTS each region out of the `.dc.html`
verbatim — by `data-screen-label` or by the mono caption above it — and it is presented exactly as
the export presents it, on its mat, at its own width. The annotation goes AROUND the frame, never
into it. Where a surface has no frame at all, the page says so in those words and describes what
Appendix A's prompt will draw; it never dresses prose up as a drawing.

WHAT CHANGED ON 2026-09-04. The Appendix A sessions ran and the export gained the D canvases
(D1–D6, D8). Every surface this file used to mark "Not drawn — owed to prompt An" now lifts its
D frame instead, and A7's corrections to the existing frames are recorded beside each annotation
that had flagged one — the executed Ghost citations stay. The method did not change: lifted, never
redrawn; annotation around, never inside.

WHAT THE COUNTS DO. index.html's surface list, its journey trails and its flow trails all render
from the registry below, so the front door cannot claim a surface that does not exist or miss one
that does (standing rule: counts are derived, never restated).
"""
import os, re, html, importlib.util

_fspec = importlib.util.spec_from_file_location(
    'inflozo_frames',
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frames.py'))
frames = importlib.util.module_from_spec(_fspec)
_fspec.loader.exec_module(frames)

OUT = os.path.dirname(os.path.abspath(__file__))

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;'
         '12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500'
         '&display=swap" rel="stylesheet">')

PAGES, JOURNEYS, FLOWS = [], [], []
SUB = lambda name, anchor, note='': (name, anchor, note)
_PENDING = []      # lifts made since the last page() call — page() takes them (F-109, F-019)

# A frame id as the declared FRAME strings write it: S8a′, B14a, S2b·1, P0-0, C3b, M5, D1d-prime, D8g.
_ID = re.compile(r"(?<![\w-])((?:S\d+|B\d+|C\d|M\d|D\d)|P0-\d)([a-g]?\d?′?(?:-prime)?)(?![\w-])")


def _ids(text):
    # 'S2b·1' names the S2b screen's first step: the ·N is a sub-step, not part of the id
    return [(m.group(1), m.group(2)) for m in _ID.finditer(re.sub(r'(?<=[a-z])·\d', '', text))]


def _covers(claim, lift):
    # A claim is met by a lift at least as specific: S3 by S3a or 'S3 mobile'; S8a′ only by
    # S8a′. Strict in this direction, so a bare 'S1 mobile' cannot stand in for a claimed S1c.
    return claim[0] == lift[0] and lift[1].startswith(claim[1])


def page(pid, title, group, frames_, exp, body, subs=(), note=''):
    lifts, _PENDING[:] = list(_PENDING), []
    # F-109: the FRAME line is DERIVED from the lifts, so it cannot name a frame the page does
    # not show. The declared string stays as the human summary, and it is checked both ways.
    by_frame = {}
    for l in lifts:
        by_frame.setdefault(l['frame'], []).append(l['key'])
    derived = ' · '.join(f"{f}.dc.html — {', '.join(ks)}" for f, ks in by_frame.items()) or 'no lift'
    claimed, lifted = _ids(frames_), _ids(' '.join(l['key'] for l in lifts))
    unclaimed = [k for k in lifted if not any(_covers(c, k) or _covers(k, c) for c in claimed)]
    unlifted = [c for c in claimed if not any(_covers(c, k) for k in lifted)]
    assert not unclaimed and not unlifted, (
        f'{pid}: FRAME line disagrees with the lifts — lifted but not claimed {unclaimed}, '
        f'claimed but not lifted {unlifted}')
    keys = [(l['frame'], l['label'], l['caption']) for l in lifts]
    assert len(keys) == len(set(keys)), f'{pid}: the same region is lifted twice'
    # F-113: the group the index files a page under is the one its own IMPLEMENTS line names.
    ia = re.search(r'§ IA → ([^·]+?)\s*(?:·|$)', exp)
    assert ia and ia.group(1) == group, f'{pid}: group {group!r} vs IMPLEMENTS {exp!r}'
    PAGES.append(dict(id=pid, title=title, group=group, frames=frames_, derived=derived,
                      lifts=lifts, exp=exp, body=body, subs=list(subs), note=note))


def journey(key, title, who, steps):
    JOURNEYS.append(dict(key=key, title=title, who=who, steps=steps))


def flow(key, title, why, steps):
    FLOWS.append(dict(key=key, title=title, why=why, steps=steps))


# ─────────────────────────────────────────────────────────────────────────────
# A drawn screen, lifted. Never re-drawn.
# ─────────────────────────────────────────────────────────────────────────────
def lift(frame, label=None, caption=None, capt=None, anchor=None):
    """One region of the export, VERBATIM, on its own mat.

    Nothing is inserted into it and nothing is rewritten — not a link, not a hook, not a
    class. `main()` asserts that the region as it appears in the emitted page is
    byte-identical to the region in the `.dc.html`, which is what makes "this page derives
    from S4a" a claim you can mechanically check rather than one you have to believe.

    That rule was learned by breaking it. Wiring the frames' own controls inserted elements
    into most of the lifted frames, made a re-export able to silently drop a link (they match
    by button text), and — worst — an assertion that "every page's frames must respond"
    pressured this file into a link from the binding checklist to itself, purely to pass.
    A check satisfiable by fabrication is worse than no check. Navigation in 5b lives in
    the scaffolding around each frame; the clickable build is 5c.

    The frame keeps its 1440px width on purpose — that is the width it was designed at,
    and shrinking it here would be a second answer to a question the export has already
    answered. It scrolls inside its own box on a narrow window.
    """
    inner = frames.region(frame, label=label, caption=caption)
    box = liftbox(frame, label, caption, capt, inner)
    # the key is what you grep the export for: the data-screen-label, or the caption's id
    _PENDING.append(dict(frame=frame, label=label, caption=caption, capt=capt,
                         key=label or caption.split(' ')[0], box=box))
    a = f' id="{anchor}"' if anchor else ''
    c = f'<p class="frame-cap">{capt}</p>' if capt else ''
    return f'<div{a} class="lifted">{c}{box}</div>'


def liftbox(frame, label, caption, capt, inner):
    """The scaffolding box around a region. Built here AND in main()'s check, from a fresh
    region(), so the check is an equality against the export and not a substring test (F-019).
    F-059: the box scrolls sideways on a narrow window, so it is focusable and named."""
    name = capt or f'{frame} — {label or caption}'
    return (f'<div class="liftbox" tabindex="0" role="region" aria-label="{name}">{inner}</div>'
            f'<p class="lift-src">lifted from <span class="mono">{frame}.dc.html</span></p>')


def cap(text):
    return f'<p class="frame-cap">{text}</p>'


def esc(s):
    """Titles are written with named entities (&ldquo;…); escaping them again printed the
    entity as text (R2-unopened-surfaces-2). Decode first, so each character is encoded once."""
    return html.escape(html.unescape(s), quote=False)


def head(title, blurb='', capt='', anchor=None):
    a = f' id="{anchor}"' if anchor else ''
    return (f'<div class="section-head"{a}><h2>{esc(title)}</h2>'
            + (f'<p>{blurb}</p>' if blurb else '')
            + (cap(capt) if capt else '') + '</div>')


def nodraw(title, blurb, prompt=None, anchor=None):
    """A surface with NO frame. It says so in those words rather than pretending.

    `prompt` names the Appendix A prompt that owes the surface. None means no prompt owns it:
    it is an undrawn STATE of a drawn surface, and the sentence says that instead (F-098).
    The two cases carry different classes so the front door can count them apart (F-099)."""
    a = f' id="{anchor}"' if anchor else ''
    if prompt:
        assert prompt.startswith('Appendix A'), prompt
        kind, sentence = 'owed', (f'This surface has no frame in the export. <b>{prompt}</b> will '
                                  f'draw it; it has not been run.')
        tail = ('What the prompt must produce is described below and in '
                '<span class="mono">EXPERIENCE.md</span> Appendix A.')
    else:
        kind, sentence = 'state', ('<b>No prompt owns this state</b>; it is a state of a drawn surface, '
                                   'and step 6 draws it from that surface&rsquo;s frame and '
                                   '<span class="mono">DESIGN.md</span>&rsquo;s component rules.')
        tail = 'What it must show is described below.'
    return (f'<div class="section-head"{a}><h2>{esc(title)}</h2>'
            f'<p>{blurb}</p></div>'
            f'<div class="nodraw {kind}"><div class="row gap10" style="margin-bottom:8px">'
            f'<span class="badge notice">Not drawn</span>'
            f'<span class="helper">{sentence}</span></div>'
            f'<p class="helper">Nothing is drawn here on purpose. A picture invented in this file '
            f'would be a second interface vocabulary beside the export&rsquo;s, which is the one thing '
            f'R-74 forbids. {tail}</p></div>')


# The plan matrix. PRD Appendix F.1 is the SOLE definition of Free/Pro gating. Four drawn frames
# disagreed with it (S11c's "3", S12a's "unlimited", S12b/M5's "Last 2", S10b's "30 MB") until the
# 2026-09-04 export (A7 item 20; S10b under A8). F.1 still governs — EXPERIENCE.md § Plan limits.
# Shared with the step-5c build.
LIMITS = [('Projects', '1', '25'),
          ('Site connections', '1', '10'),
          ('Section library', 'canvas: the whole library<br><span class="helper">deploy and export: the free set only</span>', 'The whole library'),
          ('Asset storage', '100 MB', '5 GB'),
          ('Per-upload cap', '10 MB', '10 MB'),
          ('Deploy history', 'last 3', 'last 10 per project'),
          ('Theme ZIP export', '✓ with credits, free designs only', '✓'),
          ('Credit removal', '—', '✓')]

ICON = {
    'caret': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6E6A64" stroke-width="1.5"><polyline points="6 9 12 15 18 9"/></svg>',
    'back': '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>',
}


def limits_table(note=True):
    rows = ''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for a, b, c in LIMITS)
    n = ('<p class="helper" style="margin-top:10px">Everything not in this table is on both plans — '
         'dark-mode authoring, the Routes Manager, Style Pack editing, Theme Settings, Translations, '
         'the Paywall editor, Post Content, card treatments, pagination styles, Shuffle, Remix, '
         'member-state preview, preview subject, snapshot, restore, rollback and the suggestions board.</p>') if note else ''
    return ('<div class="limits-wrap"><table class="limits"><tr><th scope="col">Limit</th>'
            '<th scope="col">Free</th><th scope="col">✦ Pro</th></tr>'
            + rows + '</table>' + n + '</div>')


LIMITS_TABLE = limits_table()


def trails_for(pid):
    out = []
    for kind, coll in (('Journey', JOURNEYS), ('Flow', FLOWS)):
        for t in coll:
            hits = [i for i, (h, _l) in enumerate(t['steps']) if h.split('#')[0] == pid + '.html']
            if not hits:
                continue
            i = hits[0]
            out.append((kind, t, i,
                        t['steps'][i - 1] if i > 0 else None,
                        t['steps'][i + 1] if i + 1 < len(t['steps']) else None))
    return out


def shell(p):
    trail_html = ''
    for kind, t, i, prev, nxt in trails_for(p['id']):
        bits = [f'<span class="tl">{kind} {t["key"]} · {esc(t["title"])}</span>',
                f'<span class="tstep">step {i + 1} of {len(t["steps"])}</span>']
        if prev:
            bits.append(f'<span class="tstep">← <a href="{prev[0]}">{esc(prev[1])}</a></span>')
        if nxt:
            bits.append(f'<span class="tstep">next: <a href="{nxt[0]}">{esc(nxt[1])}</a> →</span>')
        trail_html += '<div class="trail">' + ''.join(bits) + '</div>\n'
    if not trail_html:
        trail_html = ('<div class="trail"><span class="tl">Not a step in any journey or flow</span>'
                      '<span class="tstep">Reached from the surfaces that link to it, and from '
                      '<a href="index.html">the index</a>.</span></div>\n')

    subs_html, jump = '', ''
    if p['subs']:
        rows = ''.join(
            f'<a class="idxrow" href="#{a}">{esc(n)}'
            + (f'<span class="k">{esc(note)}</span>' if note else '') + '</a>'
            for n, a, note in p['subs'])
        subs_html = ('<nav class="proto-note" aria-label="Also on this page"><b>Also on this page</b> — '
                     'surfaces and states that live over this one: '
                     '<div class="idxgrid" style="margin-top:8px">' + rows + '</div></nav>')
        # F-104: a page can be twenty screens tall; the jump list rides in the sticky bar too.
        jump = ('<nav class="jump" aria-label="Surfaces on this page"><span>On this page:</span>'
                + ''.join(f'<a href="#{a}">{esc(n)}</a>' for n, a, _k in p['subs']) + '</nav>')

    return f"""<!--
  INFLOZO STATIC PROTOTYPE · step 5b · ruling R-75
  SURFACE  : {p['title']}
  FRAME    : {p['derived']}   (derived from the lifts on this page — build.py asserts the line below agrees)
  DECLARED : {p['frames']}
  IMPLEMENTS: EXPERIENCE.md {p['exp']}
  Every screen below is LIFTED from the design export verbatim (../frames.py) and never redrawn.
  Fixture publication: Orbit Weekly (orbitweekly.com), Maya Chen · Sam Okafor · Rosa Menendez.
-->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(p['title'])} — Inflozo prototype</title>
{FONTS}
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="proto">
  <a href="index.html">← All surfaces</a>
  <h1 class="name">{esc(p['title'])}</h1>
  <span class="frame">{p['frames']}</span>
  <span class="spacer"></span>
  <span class="frame">EXPERIENCE.md {p['exp']}</span>
  {jump}
</header>
{('<aside class="proto-note">' + p['note'] + '</aside>') if p['note'] else ''}
<nav class="trails" aria-label="Journeys and flows through this surface">{trail_html}</nav>
{subs_html}
<main id="main">
{p['body']}
</main>
<footer class="proto" style="position:static">
  <a href="index.html">← All surfaces</a>
  <a href="../walkthrough/index.html">The walkthrough (5c) →</a>
  <span class="spacer"></span>
  <span class="frame">Screens lifted from the export. The annotation is around them, never in them.</span>
</footer>
<script src="proto.js"></script>
</body>
</html>
"""


# ═══════════════════════════════════════════════════════════════════════════════
# MARKETING · ENTRY · ONBOARDING
# ═══════════════════════════════════════════════════════════════════════════════
page('pricing', 'Pricing', 'Marketing',
     'M5 Pricing.dc.html — M5 desktop, M5 mobile',
     '§ IA → Marketing · § Plan limits · J3 step 5b · J4 step 3',
     lift('M5 Pricing', label='M5 Pricing', capt='M5 · pricing · 1440')
     + head('At 390', '', anchor='mobile')
     + lift('M5 Pricing', label='M5 mobile', capt='M5 · mobile · 390'),
     subs=[SUB('Pricing at 390', 'mobile', 'M5 mobile')],
     note='<b>Two purchasable plans, and only two.</b> <span class="mono">pro_past_due</span> is an internal '
          'state and is never listed here as a plan. <b>The frame\'s limit column disagreed with Appendix F.1 '
          'in two rows</b> — it said 3 sites and "Last 2" versions where F.1 says 10 and last 3 / last 10. '
          'Corrected in the 2026-09-04 export (A7 item 20): the table now reads 25 · 10 · Last 3 / Last 10. '
          'F.1 still governs, and it is drawn in <a href="billing.html#limits">Billing</a>.')

page('sign-in', 'Sign In', 'Entry',
     'S1 Sign In.dc.html — S1a default, S1a mobile 390, S1c passkey prompt',
     '§ IA → Entry · § Responsive & Platform',
     lift('S1 Sign In', label='S1a Sign in default', capt='S1a · sign in — default · 1440')
     + head('Passkey Prompt', 'The OS sheet. <b>Inflozo draws the page behind it and nothing of the sheet '
            'itself</b> — the sheet belongs to the operating system, and drawing a facsimile would be '
            'inventing a component the product does not own.', anchor='passkey')
     + lift('S1 Sign In', label='S1c Passkey prompt', capt='S1c · passkey OS prompt · 1440')
     + head('At 390', 'Sign In carries a phone frame in the export, so the app floor does not apply to it '
            '(R-76).', anchor='mobile')
     + lift('S1 Sign In', label='S1 mobile', capt='S1a · mobile · 390'),
     subs=[SUB('Passkey Prompt', 'passkey', 'S1c'), SUB('Sign In at 390', 'mobile', 'S1a mobile')])

page('magic-link-sent', 'Magic Link Sent', 'Entry',
     'S1 Sign In.dc.html — S1b',
     '§ IA → Entry · § Accessibility Floor → Time limits',
     lift('S1 Sign In', label='S1b Magic link sent', capt='S1b · magic-link sent · 1440')
     + head('Why the countdown blocks nothing',
            'The resend countdown is the one clock on this surface and it is not a decision timer: the link '
            'is valid for 15 minutes and <b>&ldquo;Use a different email&rdquo; is always available</b>. The '
            'only timed interaction in the product is the edit-lock nudge — see '
            '<a href="edit-lock.html">Edit Lock</a>.'),
     note='<b>No password exists anywhere in the product</b> (FR-A1), so there is nothing to forget and no '
          'reset flow to draw.')

page('first-run', 'First Run', 'Onboarding',
     'S2 Onboarding.dc.html — S2a',
     '§ IA → Onboarding · J1 step 2 · J2 step 1',
     lift('S2 Onboarding', label='S2a First run', capt='S2a · onboarding — first run · 1440'),
     note='Three doors, and the same four paths reappear on the '
          '<a href="new-project-sheet.html">New Project Sheet</a> (FR-B2), which adds Duplicate.')

page('connect-integration', 'Connect · Integration', 'Onboarding',
     'S2 Onboarding.dc.html — S2b·1 · also drawn as a modal in S11 Sites S11b',
     '§ IA → Onboarding · J1 step 3',
     lift('S2 Onboarding', label='S2b1 Create integration',
          capt='S2b·1 · connect — create the integration · 1440')
     + head('The same two steps, as a modal from Sites', '', 'S11b · connect site — S2&rsquo;s flow as a modal',
            anchor='modal')
     + lift('S11 Sites', caption='S11b ·'),
     subs=[SUB('Connect Site Modal', 'modal', 'S11b')])

page('connect-keys', 'Connect · Keys', 'Onboarding',
     'S2 Onboarding.dc.html — S2b·2',
     '§ IA → Onboarding · J1 steps 4–5 · § State Patterns → partially credentialed',
     lift('S2 Onboarding', label='S2b Keys step', capt='S2b·2 · connect — paste the keys · 1440')
     + head('Three fields, and the Staff Access Token is not among them',
            'That one is offered later, at the first deploy, as a safety net that can be declined — see '
            '<a href="staff-token-offer.html">Staff Token Offer</a> (FR-C1).')
     + nodraw('What validation decides, without asking',
              'J1 step 5. A server-side <span class="mono">GET /admin/config/</span> runs the moment Connect '
              'is pressed: Ghost 5.x and 6.x accepted and 4.x refused with &ldquo;please update Ghost&rdquo;; '
              'a missing <span class="mono">hostSettings</span> key marks the site self-hosted (executed on '
              '5.130.6 and 6.58.0, MEASUREMENTS §15h) and <span class="mono">hostSettings.limits.customThemes</span> '
              '&mdash; a theme-name allowlist, whose Ghost(Pro) shape is still ⛔ VERIFY-AT-BUILD item 2 &mdash; decides '
              '<a href="preview-only-notice.html">Preview-only</a> without asking; '
              '<span class="mono">http://</span> is warned; code injection raises a one-time notice that the '
              'live page can legitimately differ from the canvas; Portal&rsquo;s floating-button state is read, '
              'or asked once, defaulting to on.',
              anchor='validation'),
     subs=[SUB('Validation states', 'validation', 'J1 step 5')])

page('auto-branding', 'Auto-Branding', 'Onboarding',
     'S2 Onboarding.dc.html — S2c',
     '§ IA → Onboarding · J1 step 6',
     lift('S2 Onboarding', label='S2c Auto branding', capt='S2c · auto-branding moment · 1440'),
     note='Ghost owns the logo, the title and the accent — Inflozo <b>reads them and never writes them</b> '
          '(AD-10\'s allowlist). <a href="theme-settings.html">Theme Settings</a> draws them padlocked for '
          'the same reason.')


page('starter-chooser', 'Starter Chooser', 'Onboarding',
     'B Missing Surfaces.dc.html — B23a · S2 Onboarding S2d (the three-starter earlier cut)',
     '§ IA → Onboarding · § wrong mechanism → B23a',
     lift('B Missing Surfaces', label='B23a Chooser', capt='B23a · the chooser · 1440')
     + head('The roster was wrong on the frame, and A7 replaced it',
            'B23a&rsquo;s own note flagged it: <i>&ldquo;The specification fixes the count at ten and names three. '
            'The other seven names … are mine … treat the roster as a proposal, not a fact.&rdquo;</i> '
            '<b>Appendix E is normative</b> and names all ten with their pack: <b>Aurora · Gazette · Signal · '
            'Foundry · Quiet · Pulse · Bloom · Chapter · Ledger · Studio</b>; FR-O4: <b>only Quiet and Ledger are '
            'Free end to end</b>. Corrected in the 2026-09-04 export (A7 item 19): the frame now names those ten, '
            'marks only Quiet and Ledger &ldquo;All Free&rdquo;, and keeps the grid, the category filter, the '
            'free filter, the swap-or-upgrade marks and the &ldquo;Start empty&rdquo; escape. <b>Still open:</b> '
            'the per-starter section and Pro counts on it are the frame&rsquo;s own — no document says what they '
            'are, so they are not restated anywhere.', anchor='roster')
     + head('The earlier three-starter cut, for comparison', '', 'S2d · choose a starter · 1440')
     + lift('S2 Onboarding', label='S2d Choose starter'),
     subs=[SUB('The roster correction', 'roster', 'Appendix E')],
     note='<b>No starter ships a membership template</b> (FR-O1), so a starter&rsquo;s first deploy needs no '
          'step in Ghost Admin beyond the theme upload — and never raises the '
          '<a href="template-binding-checklist.html">Template Binding Checklist</a>.')

page('redesign-proposals', 'Redesign Proposals', 'Onboarding',
     'B Missing Surfaces.dc.html — B22 (re-specified per ruling R-78 and FR-C7)',
     '§ IA → Onboarding · § wrong mechanism → B22 · J1 step 7',
     lift('B Missing Surfaces', caption='B22 · #22', capt='B22 · redesign proposals, after connecting')
     + head('What changes, and what stays',
            'The frame draws <b>four per-section swaps</b>. FR-C7 and ruling R-78 make it <b>2–3 whole-site '
            'starter × Style Pack combinations that differ in layout structure</b> — the card, the NOW / '
            'PROPOSED pairing and above all the argued-from-your-own-data sentence are the frame&rsquo;s and '
            'stay; the unit changes, one card per combination instead of one per section. '
            '<b>The third proposal goes entirely:</b> &ldquo;you have no tag template, so Ghost falls back to '
            'a bare list&rdquo; is false on Inflozo — <span class="mono">tag.hbs</span> always compiles from '
            'the Synthesis Defaults. Re-runnable later from the New Project Sheet.', anchor='respec'),
     subs=[SUB('The re-specification', 'respec', 'R-78')])


# ═══════════════════════════════════════════════════════════════════════════════
# DASHBOARD AND ACCOUNT
# ═══════════════════════════════════════════════════════════════════════════════
page('dashboard', 'Dashboard', 'Dashboard and account',
     'S3 Dashboard.dc.html — S3a rich · S3b empty · S3c Free · S3d account menu · S3e notifications · '
     'S3 mobile · S3 mobile menu · B Missing Surfaces B25 sites strip · B14a update notice',
     '§ IA → Dashboard and account · § State Patterns → Dashboard · J3 step 1 · F4 step 1',
     lift('S3 Dashboard', label='S3a Dashboard rich', capt='S3a · dashboard — rich (what&rsquo;s-new open) · 1440')
     + head('Account Menu', 'Opens up from the account chip at the foot of the rail.', anchor='account-menu')
     + lift('S3 Dashboard', caption='S3d ·', capt='S3d · account menu — desktop popover + mobile dropdown')
     + head('Notifications', 'Opens under the bell. Every row leads with the outcome; only the failure carries '
            'an action, because it is the only one that needs a decision.', anchor='notifications')
     + lift('S3 Dashboard', caption='S3e ·', capt='S3e · notifications — desktop popover + mobile')
     + head('Connected Sites Strip', 'Health at a glance, and the count against the plan cap. The dot colour '
            'classifies before a word is read.', anchor='connected-sites')
     + lift('B Missing Surfaces', caption='B25 · #25', capt='B25 · connected-sites strip')
     + head('Library Update Notice', 'It lives <b>inside</b> the project card rather than as a badge on it, '
            'because it needs a sentence and a button. Marigold is right: it is a nudge and it never blocks.',
            anchor='library-update')
     + lift('B Missing Surfaces', caption='B14a · #14', capt='B14a · update notice on the project card — flow F4 step 1')
     + head('Empty', 'The canonical string, verbatim, and one affordance.', anchor='empty')
     + lift('S3 Dashboard', label='S3b Dashboard empty', capt='S3b · dashboard — empty · 1440')
     + head('Free, at the cap', 'One project. The ⋯ menu still offers Rename, Duplicate and Delete — nothing is '
            'taken away. A second project opens the <a href="new-project-sheet.html#cap">New Project Sheet at the '
            'cap</a> (D4b).', anchor='free')
     + lift('S3 Dashboard', label='S3c Dashboard free plan', capt='S3c · dashboard — free plan (⋯ menu open) · 1440')
     + head('At 390', 'The Dashboard stays fully usable at 390, exactly as the export draws it (R-76).',
            anchor='mobile')
     + lift('S3 Dashboard', label='S3 mobile', capt='S3 · mobile · 390')
     + lift('S3 Dashboard', label='S3 mobile menu', capt='S3 · mobile — menu open · 390')
     + nodraw('Loading', 'Skeleton cards in the shape of the project cards that are coming — never a spinner '
              '(DESIGN.md § Components → Loading). No frame draws the dashboard mid-load.',
              anchor='loading'),
     subs=[SUB('Account Menu', 'account-menu', 'S3d'),
           SUB('Notifications', 'notifications', 'S3e'),
           SUB('Connected Sites Strip', 'connected-sites', 'B25'),
           SUB('Library Update Notice', 'library-update', 'B14a'),
           SUB('Dashboard — empty', 'empty', 'S3b'),
           SUB('Dashboard — Free at the cap', 'free', 'S3c'),
           SUB('Dashboard at 390', 'mobile', 'S3 mobile'),
           SUB('Dashboard — loading', 'loading', 'not drawn')])


page('new-project-sheet', 'New Project Sheet', 'Dashboard and account',
     'D4 Dashboard Sheets and Blocks.dc.html — D4a four doors · D4b Free, at the cap',
     '§ IA → Dashboard and account · FR-B2',
     lift('D4 Dashboard Sheets and Blocks', label='D4a New project sheet',
          capt='D4a · new project sheet — four doors · 1440')
     + head('Four doors, one greyed with its reason',
            'FR-B2&rsquo;s four paths over a dimmed dashboard, drawn by prompt A4 in the 2026-09-04 export as '
            'S2a&rsquo;s radio-card rows with one line of consequence each: <b>Start from a starter</b> (opens the '
            '<a href="starter-chooser.html">Starter Chooser</a>) · <b>Blank canvas</b> · <b>Duplicate an existing '
            'project</b>, with a select of the user&rsquo;s projects · <b>Redesign one of my sites</b>, greyed with '
            '&ldquo;Connect a Ghost site first.&rdquo; when no site is connected — P0-0&rsquo;s pattern, greyed with '
            'the reason and never hidden (rulings R-33, R-68). Below them the Style Pack row, then Cancel and '
            'Create project.', anchor='doors')
     + head('Free, at the cap',
            'All four doors stay drawn and each carries its reason; the footer states the limit — &ldquo;Free '
            'includes 1 project. Pro gives you 25.&rdquo; — which is Appendix F.1&rsquo;s figure. Nothing is '
            'deleted and nothing is hidden. This is where the <a href="dashboard.html#free">Dashboard on Free</a> '
            'sends a second project.', anchor='cap')
     + lift('D4 Dashboard Sheets and Blocks', label='D4b Free at the cap',
            capt='D4b · new project · Free, at the cap — detail at 720'),
     subs=[SUB('The four doors', 'doors', 'D4a'), SUB('Free, at the cap', 'cap', 'D4b')])

page('notifications', 'Notifications', 'Dashboard and account',
     'S3 Dashboard.dc.html S3e · B Missing Surfaces.dc.html B21',
     '§ IA → Dashboard and account · § State Patterns → Notifications · FR-B7 · F6 (the one nudge)',
     lift('B Missing Surfaces', caption='B21 · #21', capt='B21 · notifications')
     + head('As it opens under the bell', '', 'S3e · notifications — desktop popover + mobile', anchor='popover')
     + lift('S3 Dashboard', caption='S3e ·')
     + nodraw('Empty',
              '&ldquo;Nothing yet. Deploy outcomes land here even if you closed the tab.&rdquo; — an ink line '
              'drawing with one coral accent shape, per the empty-state illustration rule. No frame draws it.',
              anchor='empty'),
     subs=[SUB('Under the bell', 'popover', 'S3e'), SUB('Notifications — empty', 'empty', 'not drawn')])

page('sites', 'Sites', 'Dashboard and account',
     'S11 Sites.dc.html — S11a with the ⋯ menu · S11b connect modal · S11c Free',
     '§ IA → Dashboard and account · § State Patterns → Sites · J4 step 7',
     lift('S11 Sites', label='S11a Sites', capt='S11a · sites &amp; connections — ⋯ menu open · 1440')
     + head('Connect Site Modal', 'S2&rsquo;s two connect steps, run as a modal.', anchor='connect-modal')
     + lift('S11 Sites', caption='S11b ·', capt='S11b · connect site — S2&rsquo;s flow as a modal')
     + head('Free, at one site', 'The frame said Pro connects up to 3; <b>Appendix F.1 says 10 and governs</b>, '
            'and the 2026-09-04 export says 10 (A7 item 20) — see <a href="billing.html#limits">the limits</a>.',
            anchor='free')
     + lift('S11 Sites', caption='S11c ·', capt='S11c · free plan — one site + upgrade ghost slot')
     + nodraw('Sites with none, and disconnecting',
              'Sites with no connection shows the connect card as the whole page. Disconnecting keeps the '
              'site&rsquo;s <b>pre-Inflozo snapshot</b> — it is bound to the site record, not the URL, so it '
              'survives disconnect, reconnect and project deletion, and the backup gate re-fires on reconnect '
              'because consent is per site.',
              anchor='empty'),
     subs=[SUB('Connect Site Modal', 'connect-modal', 'S11b'),
           SUB('Sites — Free at one site', 'free', 'S11c'),
           SUB('Sites — empty, and disconnect', 'empty', 'not drawn')],
     note='<b>The frame&rsquo;s Preview-only row says the wrong thing.</b> S11a offers &ldquo;download the theme '
          'and upload it in Ghost Admin&rdquo;; Starter&rsquo;s <span class="mono">customThemes</span> limit '
          'forbids custom themes <b>in Ghost Admin too</b>. B15 already gets this right — see '
          '<a href="preview-only-notice.html">Preview-Only Notice</a>. <b>And its &ldquo;Admin key expired Aug '
          '15&rdquo; chip named a cause Ghost never produces</b> — keys never expire; a regenerated or removed key '
          'answers 401 Unknown Admin API Key (see <a href="deploy-failure.html">Deploy Failure</a>). Corrected in '
          'the 2026-09-04 export (A7 item 11): the chip reads &ldquo;Key regenerated Aug 15&rdquo;.')

page('manage-keys', 'Manage Keys', 'Dashboard and account',
     'S11 Sites.dc.html S11d + B Missing Surfaces.dc.html B20 — both re-specified (FR-C8)',
     '§ IA → Dashboard and account · § wrong mechanism → B20 / S11d',
     lift('S11 Sites', caption='S11d ·', capt='S11d · manage API keys — roll or replace')
     + head('And B20&rsquo;s version of the same surface', '', 'B20 · #20 · manage API keys', anchor='b20')
     + lift('B Missing Surfaces', caption='B20 · #20')
     + head('Three things both frames get wrong',
            '<b>FR-C8 needs three credentials, not two</b> — the Staff Access Token is addable and removable at '
            'any time, and each credential is shown <b>present or absent with what it enables</b>, never as an '
            'error badge. <b>B20 invents grantable scopes:</b> Ghost fixes what a Custom Integration token may '
            'do, so the missing capability is the token, not a permission — there is nothing to grant. '
            '<b>S11d draws the API URL as an editable field:</b> the site URL is immutable, a domain move is '
            'disconnect + reconnect, so the affordance is <b>absent</b> rather than present-and-refusing.',
            anchor='respec'),
     subs=[SUB('B20&rsquo;s version', 'b20', 'B20'), SUB('The re-specification', 'respec', 'FR-C8')])


page('assets', 'Assets', 'Dashboard and account',
     'S10 Assets.dc.html — S10a library · S10b drop zone · S10c delete-in-use · S10d details · '
     'D8 Editor Below 1440.dc.html — D8d the drop zone with a keyboard path',
     '§ IA → Dashboard and account · § State Patterns → Assets · J4 step 8',
     lift('S10 Assets', label='S10a Asset library', capt='S10a · asset library — one card hovered, WebP toast · 1440')
     + head('The drop zone', '', 'S10b · drag-over — full-surface drop zone', anchor='drop')
     + lift('S10 Assets', caption='S10b ·')
     + head('The drop zone, with a keyboard path — and the size line corrected',
            'S10b&rsquo;s size line read &ldquo;up to 30 MB each&rdquo; where Appendix F.1 caps uploads at 10 MB '
            'per file on both plans, and a drop zone with no button cannot be reached by keyboard at all. Both are '
            'corrected in the 2026-09-04 export: S10b above now reads &ldquo;up to 10 MB each&rdquo;, and prompt '
            'A8 drew the zone with a <b>Choose files</b> button inside it, below the sparkle line.',
            anchor='drop-fix')
     + lift('D8 Editor Below 1440', label='D8d Drop zone',
            capt='D8d · assets drop zone · with a keyboard path · 720')
     + head('Delete in use', 'Serious voice, and it names every place the image is used.', anchor='delete')
     + lift('S10 Assets', caption='S10c ·', capt='S10c · delete-in-use — serious, no puns')
     + head('Image details', '', anchor='details')
     + lift('S10 Assets', label='S10d Image details', capt='S10d · image details — click any asset')
     + nodraw('Over quota',
              'The library goes <b>read-only</b>: existing files stay, uploads are blocked, until the user '
              'deletes below the cap. <b>Nothing is deleted by Inflozo, on any path.</b> No frame draws it.',
              anchor='over-quota'),
     subs=[SUB('Drop zone', 'drop', 'S10b'),
           SUB('The drop zone, with a keyboard path', 'drop-fix', 'D8d'),
           SUB('Delete in use', 'delete', 'S10c'),
           SUB('Image details', 'details', 'S10d'),
           SUB('Assets — over quota', 'over-quota', 'not drawn')])

page('billing', 'Billing', 'Dashboard and account',
     'S12 Billing.dc.html — S12a plan · S12c delete account · S12d invoices',
     '§ IA → Dashboard and account · § Plan limits · J4 step 3',
     lift('S12 Billing', caption='S12a ·', capt='S12a · account &amp; billing — Pro · 1440')
     + head('Invoices', '', anchor='invoices')
     + lift('S12 Billing', caption='S12d ·', capt='S12d · invoices — the popup')
     + head('Delete Account', 'Typed confirm, serious voice, and no wit anywhere near it.', anchor='delete')
     + lift('S12 Billing', caption='S12c ·', capt='S12c · delete account — typed confirm')
     + head('The limits, plainly — and where the frames disagreed with them',
            'Appendix F.1 is the <b>sole definition</b> of Free/Pro gating, and four frames disagreed with it: '
            'S11c said Pro connects up to <b>3</b>; S12a said <b>unlimited</b> projects and <b>full</b> history; '
            'S12b and M5 said <b>1 / 3</b> sites and <b>Last 2 / Full</b> history; S10b said uploads may be '
            '<b>up to 30 MB</b>. <b>All four are corrected in the 2026-09-04 export</b> (A7 item 20; S10b under '
            'A8) and F.1 still governs. These are product limits, so they are shown rather than implied.',
            anchor='limits')
     + LIMITS_TABLE
     + nodraw('Cancelling',
              'No refunds and no mid-cycle cancellation (Appendix F.2). Auto-renew stops, access continues to '
              'the end of the paid period, then the account becomes Free — which is where the '
              '<a href="over-limit-sheet.html">Over-Limit Sheet</a> takes over. <b>Cancellation always completes '
              'in three clicks or fewer</b> and there are no retention dark patterns.',
              anchor='cancel'),
     subs=[SUB('Invoices', 'invoices', 'S12d'),
           SUB('Delete Account', 'delete', 'S12c'),
           SUB('The limits, plainly', 'limits', 'Appendix F.1'),
           SUB('Cancel plan', 'cancel', 'Appendix F.2')])

page('upgrade-sheet', 'Upgrade Sheet', 'Dashboard and account',
     'S12 Billing.dc.html — S12b, used app-wide',
     '§ IA → Dashboard and account · § Plan limits · J3 step 5b',
     lift('S12 Billing', caption='S12b ·', capt='S12b · upgrade modal — used app-wide')
     + head('Its limit column was wrong in two rows',
            'The frame said <b>3</b> connected sites and <b>Last 2</b> versions of history. Appendix F.1 says '
            '<b>10</b> sites, and <b>last 3 on Free / last 10 per project on Pro</b>, and the 2026-09-04 export '
            'says the same (A7 item 20: 1 / 10 sites, Last 3 / Last 10). F.1 governs — its table is on '
            '<a href="billing.html#limits">Billing</a>.', anchor='limits'),
     subs=[SUB('The limit corrections', 'limits', 'Appendix F.1')],
     note='On return from Dodo&rsquo;s hosted checkout the server verifies the subscription directly and grants '
          'Pro <b>without waiting for the webhook</b>.')

page('suggestions', 'Suggestions', 'Dashboard and account',
     'S13 Suggestions.dc.html — S13a board · S13b submit sheet · S13c empty',
     '§ IA → Dashboard and account · § State Patterns → Suggestions',
     lift('S13 Suggestions', label='S13a Suggestions', capt='S13a · suggestions board — Top tab · 1440')
     + head('Submit', '', anchor='submit')
     + lift('S13 Suggestions', caption='S13b ·', capt='S13b · the submit sheet')
     + head('Empty', '', anchor='empty')
     + lift('S13 Suggestions', caption='S13c ·', capt='S13c · empty state'),
     subs=[SUB('Submit sheet', 'submit', 'S13b'), SUB('Suggestions — empty', 'empty', 'S13c')])


page('over-limit-sheet', 'Over-Limit Sheet', 'Dashboard and account',
     'D4 Dashboard Sheets and Blocks.dc.html — D4c the sheet · D4d which project stays editable · '
     'D4e a read-only project',
     '§ IA → Dashboard and account · FR-L3 · J4 steps 5, 6 and 10',
     lift('D4 Dashboard Sheets and Blocks', label='D4c Over limit sheet',
          capt='D4c · over-limit sheet — a Pro account that has become Free · 1440')
     + head('The climax of J4, and it opens with what has not happened',
            'Drawn by prompt A4 in the 2026-09-04 export, in B13a&rsquo;s itemised-row style over a dimmed '
            'dashboard. First line: <b>&ldquo;Nothing has been deleted, and nothing will be. Your live sites are '
            'untouched.&rdquo;</b> Then exactly what is over and by how much, each row naming the one action that '
            'fixes it: <b>Projects 6 of 1</b> → choose which one stays editable · <b>Connected sites 2 of 1</b> → '
            'disconnect one · <b>Assets 312 MB of 100 MB</b> → delete some files · <b>Stored versions 8 of 3</b> → '
            'nothing to do, we keep these. Footer: rollback, restore and export keep working the whole time. '
            'Every figure on it is Appendix F.1&rsquo;s.', anchor='rows')
     + head('Which project stays editable',
            'A radio list of the six, the most recently updated pre-selected — so submitting without reading keeps '
            'the one being worked on. The other five stay viewable and exportable.', anchor='which')
     + lift('D4 Dashboard Sheets and Blocks', label='D4d Which project editable',
            capt='D4d · which project stays editable — detail at 720')
     + head('A read-only project',
            'The editor shell with the <a href="edit-lock.html#reader">read-only treatment from B5a</a>: canvas '
            'fully legible, sidebars at 55%, controls visible but inert. The bar names the cause and offers two '
            'things — Make this the editable one, and Export theme zip. <b>Export is not disabled.</b> Read-only '
            'means not editable; it never means locked in.', anchor='read-only')
     + lift('D4 Dashboard Sheets and Blocks', label='D4e Read-only project',
            capt='D4e · a read-only project — canvas legible, sidebars at 55%, export live · 1440'),
     subs=[SUB('The itemised rows', 'rows', 'D4c'),
           SUB('Which project stays editable', 'which', 'D4d'),
           SUB('A read-only project', 'read-only', 'D4e')])

page('grace-banner', 'Grace Banner', 'Deploy',
     'B Missing Surfaces.dc.html — B24 (consequence re-specified: FR-L3)',
     '§ IA → Deploy · § wrong mechanism → B24 · J4 steps 1–2',
     lift('B Missing Surfaces', caption='B24 · #24', capt='B24 · past-due grace banner')
     + head('The frame was wrong in the frightening half, and A7 changed it',
            'B24 said <i>&ldquo;after that, Pro designs stop rendering and your sites fall back to their Free '
            'replacements&rdquo;</i>. <b>FR-L3: existing deployed themes are never touched.</b> Grace expiry '
            'moves the account to Free and blocks the <i>exits</i> — deploy, export, code surfaces — until the '
            'user resolves what is over. Corrected in the 2026-09-04 export (A7 item 5); the frame now reads '
            '<i>&ldquo;After that you go back to Free. Your live sites are never touched — what&rsquo;s shipped '
            'stays shipped. You&rsquo;d just need to sort out anything over the Free limits before you ship '
            'again.&rdquo;</i> M5&rsquo;s own FAQ already said the right thing, and B24 contradicted it.',
            anchor='respec')
     + head('What is kept during the grace, and it is everything',
            'Every Pro capability, for seven days, with <b>no per-row exception</b>. '
            '<span class="mono">pro_past_due</span> is internal and is <b>never shown as a plan</b>.',
            anchor='kept')
     + LIMITS_TABLE,
     subs=[SUB('The re-specification', 'respec', 'FR-L3'), SUB('What is kept', 'kept', 'F.1 third column')])

page('small-screen-notice', 'Small Screen Notice', 'Dashboard and account',
     'D4 Dashboard Sheets and Blocks.dc.html — D4f at 390',
     '§ IA → Dashboard and account · § Responsive & Platform (ruling R-76)',
     lift('D4 Dashboard Sheets and Blocks', label='D4f Small screen notice',
          capt='D4f · small screen notice · 390 — fires on a coarse pointer at a small viewport, not on width alone')
     + head('Not an error page, and not a width test',
            'Drawn by prompt A4 in the 2026-09-04 export: a calm centred card — &ldquo;The editor needs a bigger '
            'screen.&rdquo; — then what does work from a phone: the project&rsquo;s deploy history with a one-tap '
            'roll back, Your sites, and Billing. <b>It fires on a coarse pointer at a small viewport, never on '
            'width alone</b>, and the frame&rsquo;s own caption says so: a 1440px display at 200% browser zoom '
            'presents roughly a 720px CSS viewport, and throwing a low-vision user out of the editor for zooming '
            'is a straight WCAG 1.4.4 failure. That case gets the editor, reflowed — drawn as '
            '<a href="editor-narrow.html#zoom">D8b</a>.', anchor='condition'),
     subs=[SUB('The firing condition', 'condition', 'D4f · D8b')])


# ═══════════════════════════════════════════════════════════════════════════════
# EDITOR
# ═══════════════════════════════════════════════════════════════════════════════
page('editor', 'Editor', 'Editor',
     'S4 Editor.dc.html — S4a rest, S4b hover, S4c selected, S4d top-bar dropdowns · '
     'B Missing Surfaces B1, B2, B3, B4, B6, B7, B8, B9, B10, B11 · P0-0 · P0-1 · '
     'D5 Canvas Markers and Template Switcher.dc.html — D5a, D5b, D5c, D5d, D5e, D5f',
     '§ IA → Editor · § State Patterns → Editor and Control Sidebar · § Accessibility Floor · '
     '§ Interaction Primitives',
     lift('S4 Editor', label='S4a Editor rest',
          capt='S4a · editor — rest, template dropdown open · 1440')
     + head('The resting sidebar is the PAGE panel',
            'Not an empty one. At rest the right sidebar carries the Style Pack cell — Ag / Paper / '
            'Georgia · Inter, its palette and <b>Change</b> — the project&rsquo;s Dark mode row, and one note. '
            'The &ldquo;Nothing selected&rdquo; panel is what a <i>deselected</i> section leaves behind, and it '
            'is drawn in the Editor Sidebar Kit.')
     + head('Hover', 'Hover gives a 1px outline, the name tag, the design arrows, duplicate, delete, the drag '
            'handle and a &ldquo;+&rdquo; between sections. At rest the canvas shows a website.',
            anchor='hover')
     + lift('S4 Editor', label='S4b Editor hover', capt='S4b · editor — hover on Hero · 1440')
     + head('Selected', 'Click gives a persistent outline and the section&rsquo;s own controls. Click text '
            'inside a selection and you are typing. <span class="kbd">Esc</span> steps outward one level per '
            'press.', anchor='selected')
     + lift('S4 Editor', label='S4c Editor selected', capt='S4c · editor — selected · 1440')
     + head('The top-bar dropdowns', 'Ship it ▾ and the member-state preview.', anchor='topbar')
     + lift('S4 Editor', caption='S4d ·', capt='S4d · top-bar dropdowns')
     + head('The member-state preview: three states, as FR-D16 requires',
            'S4d previewed Orbit Supporter / Patron / Founding — tiers. <b>FR-D16: Anonymous / Free member / Paid '
            'member</b>, and <span class="mono">comped</span> previews as Paid, differing in billing rather than '
            'access. Corrected in the 2026-09-04 export (A7 item 18): S4d now previews Logged out / Free member / '
            'Paid member, with the <b>unviewed-states marker</b> (&ldquo;2 not viewed&rdquo;) beside the toggle '
            'and the <b>&ldquo;Gated content — shown with sample text&rdquo;</b> indicator, neither of which any '
            'frame drew before.', anchor='member-state')
     + head('Design Picker · Design Nav',
            'The most-used control in the product. Three ways to the same thing, and the counter names the '
            'unit — <b>Design</b>, never Layout. <span class="kbd">]</span> past the last returns to the first. '
            '<b>Switching carries, parks and defaults</b>, which is why three presses of <span class="kbd">[</span> '
            'put you back exactly where you started.', anchor='design-picker')
     + lift('B Missing Surfaces', caption='B1a ·', capt='B1a · the control in the sidebar · 320 actual width')
     + lift('B Missing Surfaces', caption='B1b ·', capt='B1b · on the section itself · hover state', anchor='design-nav')
     + head('Control Sidebar', 'Four to seven controls, and they are <b>this design&rsquo;s</b>. Three designs '
            'of one section, three barely-overlapping panels — that is the model working.', anchor='control-sidebar')
     + lift('B Missing Surfaces', label='B2 Per-design sidebar', capt='B2 · per-design control sidebar')
     + head('Greyed, and absent — they are different in kind',
            'A control that could act but cannot now is <b>greyed with its reason in the helper slot</b>; one '
            'that could <i>never</i> act here is <b>absent and the panel says why</b>. A user must be able to '
            'tell them apart (rulings R-33, R-68).', anchor='greyed')
     + lift('P0-0 Greyed Control Pattern', label='P0-0 resting and greyed')
     + lift('P0-0 Greyed Control Pattern', label='P0-0 the four shapes')
     + lift('P0-0 Greyed Control Pattern', label='P0-0 the never-offered case')
     + head('Inline Toolbar', 'Exactly the four marks plus Remove link, which renders always and disables when '
            'the selection carries no link. <b>A mark a field does not permit is absent, not greyed.</b> '
            '<span class="kbd">⌥F10</span> moves focus into it and <span class="kbd">Esc</span> restores the '
            'exact selection.', anchor='inline-toolbar')
     + lift('P0-1 Inline Text Toolbar', label='P0-1 toolbar over body text')
     + lift('P0-1 Inline Text Toolbar', label='P0-1 toolbar over headline')
     + lift('P0-1 Inline Text Toolbar', label='P0-1 plain-text-locked')
     + head('Link Entry', 'It searches the user&rsquo;s own posts and pages as you type.', anchor='link-entry')
     + lift('P0-1 Inline Text Toolbar', label='P0-1 link popover states')
     + head('B4b, the part of B4 that P0-1 does not supersede',
            'P0-1 supersedes B4a — exactly the four marks and Remove link, no block-type menu, because Inflozo '
            'does not own the post body (FR-D4). <b>B4b&rsquo;s link entry is kept</b> and gains FR-D9&rsquo;s '
            'new-tab and <span class="mono">rel</span> options, which neither frame draws.',
            anchor='link-entry-b4b')
     + lift('B Missing Surfaces', caption='B4b ·', capt='B4b · link entry')
     + head('At 390 the toolbar docks', '', anchor='toolbar-390')
     + lift('P0-1 Inline Text Toolbar', label='P0-1 mobile 390')
     + head('Layers', 'The Site-wide card is pinned above the page&rsquo;s own sections, with a page count, and '
            'cannot be reordered against them.', anchor='layers')
     + lift('B Missing Surfaces', caption='B7 · #7', capt='B7 · layers with site-wide pinned')
     + head('The frame says &ldquo;on 26 pages&rdquo;, and the unit is templates',
            'A project has roughly seven to ten <b>templates</b>, not 26 pages (FR-D6).', anchor='layers-fix')
     + head('Persistence Indicator', 'Four labels, one dot, <b>never a spinner</b>. The expanded panel appears '
            'only on Retrying, and its first sentence is the reassurance.', anchor='persistence')
     + lift('B Missing Surfaces', caption='B6 · #6', capt='B6 · persistence, four states')
     + head('And the fifth state FR-D10 requires',
            'The <b>no-local-storage fallback</b> — &ldquo;syncing every change to the cloud&rdquo; — because a '
            'false &ldquo;Saved on this device&rdquo; is the one thing this indicator must never say. Not drawn.',
            anchor='persistence-fix')
     + head('Content Source Pill', 'It describes the canvas, so it sits over the canvas. Solid hairline with a '
            'mint dot when the content is real; dashed with grey when it is sample.', anchor='content-source')
     + lift('B Missing Surfaces', caption='B9 · #9', capt='B9 · content-source pill')
     + head('Pro Design Badge', '<b>A price tag, not a lock.</b> On selection only, and <b>nothing happens when '
            'you click it, ever</b> — that is the <a href="pro-exit-sheet.html">Pro Exit Sheet</a>&rsquo;s job, '
            'once, at the exit.', anchor='pro-badge')
     + lift('B Missing Surfaces', caption='B10 · #10', capt='B10 · Pro design, free account')
     + head('Preview Mode', 'Behaviours are off while editing and the PAUSED chip sits <b>on the behaviour</b> '
            'rather than in a status bar — without it a stopped countdown looks like a broken countdown.',
            anchor='preview')
     + lift('B Missing Surfaces', caption='B3a ·', capt='B3a · editing · behaviours paused')
     + lift('B Missing Surfaces', caption='B3b ·', capt='B3b · preview · chrome off, everything running')
     + head('Device Preview', 'The canvas is a <b>viewport</b>, not a column: both axes resize to a real device '
            'size, so the fold is where the fold actually is.', anchor='device')
     + lift('B Missing Surfaces', caption='B11a ·', capt='B11a · desktop 1440 × 900')
     + lift('B Missing Surfaces', caption='B11b ·', capt='B11b · mobile 390 × 844')
     + head('B11&rsquo;s Zoom control was re-specified out, and A7 removed it',
            'The frame drew a user-driven <b>Fit / 55%</b> picker. FR-D14 says no zoom in v1 and AD-21 says '
            'the only scale is fit-to-screen, never user-driven. Corrected in the 2026-09-04 export (A7 item 6): '
            'the control is gone and the mono chip stating true size and scale stays. Browser zoom is the '
            'reader&rsquo;s own accessibility setting and is a different thing entirely (WCAG 1.4.4).',
            anchor='no-zoom')
     + head('Site Remix', 'One button re-rolls every design, keeping every word. <b>One undo, always</b> — a '
            'Shuffle is several operations and <i>one</i> edit.', anchor='remix')
     + lift('B Missing Surfaces', caption='B8 · #8', capt='B8 · site remix')
     + head('B8 loses a control and gains one',
            '<b>Ruling R-77 drops &ldquo;Keep Free designs only&rdquo;</b> — Remix always re-rolls from the '
            'whole library and the Pro Exit Sheet catches it at deploy. And FR-D17&rsquo;s own axis is '
            '<b>what</b> is re-rolled — Style Pack, designs, or both — which the frame has no control for; it '
            'is added as a second radio-card group above the existing scope group.', anchor='remix-fix')
     + head('Auto-Generated Marker',
            'An untouched Tag archive rendering its default stack. The same sentence in two places — a chip in the '
            'top bar beside the template name and a row at the head of Layers — &ldquo;Auto-generated — edit '
            'anything to make it yours&rdquo;. Informational, never apologetic; both vanish on the first edit '
            '(FR-D6, Appendix H). Drawn by prompt A5 in the 2026-09-04 export, as are the five below.',
            anchor='auto-generated')
     + lift('D5 Canvas Markers and Template Switcher', label='D5a Auto-generated marker',
            capt='D5a · auto-generated marker — the same sentence in the top bar and at the head of Layers · 1440')
     + head('Template Switcher, complete',
            'Home · Post · Page · Tag · Author · Membership as a group of three · 404 · Private, present only once '
            'a Private Site Gate section has been designed · a rule · the custom templates from the Routes Manager '
            '· + New template. A hollow dot always carries the word &ldquo;Auto-generated&rdquo;; a filled one '
            'needs no label (FR-D6).', anchor='template-switcher')
     + lift('D5 Canvas Markers and Template Switcher', label='D5b Template switcher',
            capt='D5b · template switcher, complete — detail at 520')
     + head('Main Feed Marker, and reassign',
            'The designated feed carries a mono MAIN FEED chip on its outline and on its Layers row; its Count '
            'control is <b>greyed with the reason</b> — the feed is sized by Theme Settings&rsquo; '
            '<span class="mono">posts_per_page</span> — and only it has Pagination. The second feed&rsquo;s ⋯ menu '
            'offers &ldquo;Make this the main feed&rdquo; (FR-H2).', anchor='main-feed')
     + lift('D5 Canvas Markers and Template Switcher', label='D5c Main feed marker',
            capt='D5c · main feed marker and reassign · 1440')
     + head('Page 2 Preview',
            'Reached from the Pagination control, never a shortcut. An ink pill reads Page 2 with Back to page 1 '
            'beside it, and the numbered treatment shows its full range — the only state in which it shows what '
            'it is (FR-D21, Appendix H).', anchor='page-2')
     + lift('D5 Canvas Markers and Template Switcher', label='D5d Page 2 preview',
            capt='D5d · page 2 preview — reached from the Pagination control · 1440')
     + head('Preview Subject Picker',
            'B9&rsquo;s pill, opened: the source, a rule, then the subject — a searchable list of the site&rsquo;s '
            'posts with the style-guide article always first and checked by default. &ldquo;has image&rdquo; is '
            'the words; the glyph is decoration beside them (FR-D22).', anchor='preview-subject')
     + lift('D5 Canvas Markers and Template Switcher', label='D5e Preview subject picker',
            capt='D5e · preview subject picker — detail at 520')
     + head('Empty Template Warning',
            'Fires when the last section leaves a designed custom template. Notice, not danger: the page still '
            'loads, wearing the ordinary page design, and Ghost won&rsquo;t warn anyone — which is why Inflozo '
            'does (FR-I1).', anchor='empty-template')
     + lift('D5 Canvas Markers and Template Switcher', label='D5f Empty template warning',
            capt='D5f · empty template warning — detail at 620')
     + head('Below 1440, and the affordances the floor needs',
            'The editor at 834 and at 720, its overflow menu, the skip link, a focused Layers row and where focus '
            'opens on a destructive confirm are drawn as D8 and lifted on their own page: '
            '<a href="editor-narrow.html">Editor Below 1440</a>.', anchor='below-1440'),
     subs=[SUB('Hover', 'hover', 'S4b'), SUB('Selected', 'selected', 'S4c'),
           SUB('Top-bar dropdowns', 'topbar', 'S4d'),
           SUB('Member-state preview — three states', 'member-state', 'FR-D16 · A7'),
           SUB('Design Picker', 'design-picker', 'B1a'), SUB('Design Nav', 'design-nav', 'B1b'),
           SUB('Control Sidebar', 'control-sidebar', 'B2'),
           SUB('Greyed vs absent', 'greyed', 'P0-0'),
           SUB('Inline Toolbar', 'inline-toolbar', 'P0-1'),
           SUB('Link Entry', 'link-entry', 'P0-1'),
           SUB('Link Entry — B4b', 'link-entry-b4b', 'B4b'),
           SUB('Inline Toolbar at 390', 'toolbar-390', 'P0-1'),
           SUB('Layers', 'layers', 'B7'), SUB('Layers — the unit is templates', 'layers-fix', 'FR-D6'),
           SUB('Persistence Indicator', 'persistence', 'B6'),
           SUB('Persistence — the fifth state', 'persistence-fix', 'FR-D10'),
           SUB('Content Source Pill', 'content-source', 'B9'),
           SUB('Pro Design Badge', 'pro-badge', 'B10'),
           SUB('Preview Mode', 'preview', 'B3'),
           SUB('Device Preview', 'device', 'B11'),
           SUB('The removed zoom control', 'no-zoom', 'FR-D14'),
           SUB('Site Remix', 'remix', 'B8'), SUB('Remix — R-77 and the what-axis', 'remix-fix', 'R-77'),
           SUB('Auto-Generated Marker', 'auto-generated', 'D5a'),
           SUB('Template Switcher', 'template-switcher', 'D5b'),
           SUB('Main Feed Marker', 'main-feed', 'D5c'),
           SUB('Page 2 Preview', 'page-2', 'D5d'),
           SUB('Preview Subject Picker', 'preview-subject', 'D5e'),
           SUB('Empty Template Warning', 'empty-template', 'D5f'),
           SUB('Below 1440 — on its own page', 'below-1440', 'D8')])

page('editor-narrow', 'Editor Below 1440', 'Editor',
     'D8 Editor Below 1440.dc.html — D8a at 834 and its overflow menu · D8b at 720 · D8c skip link · '
     'D8e a Layers row focused · D8f a destructive confirm as it opens',
     '§ IA → Editor · § Responsive & Platform · § Accessibility Floor',
     head('The same four parts, rearranged rather than redesigned',
          'The export drew the editor at 1440 and at no other width until prompt A8 ran (2026-09-04). Two things '
          'need it narrower and neither is a phone: <b>tablet</b> (834, touch) is in scope by the owner&rsquo;s '
          'ruling, and a <b>desktop at 200% browser zoom</b> sees roughly a 720 CSS px viewport — throwing that '
          'user out would fail WCAG 1.4.4. Layers collapses to an icon rail, the Controls sidebar becomes an '
          'overlay over the canvas with a scrim, and the top bar keeps the switcher, View as and Ship it and sends '
          'the rest to one overflow menu. Below that the product shows the '
          '<a href="small-screen-notice.html">Small Screen Notice</a> instead — on a coarse pointer, never on width.',
          'D8a · tablet · 834 × 1112 · touch · every target ≥ 44 px', anchor='tablet')
     + lift('D8 Editor Below 1440', label='D8a Editor at 834')
     + head('The one overflow menu', 'Drawn open on its own, because only one overlay is ever open at a time.',
            'D8a · detail · the one overflow menu', anchor='overflow')
     + lift('D8 Editor Below 1440', label='D8a Overflow menu')
     + head('At 720 — a 1440 display at 200% browser zoom',
            'The same collapse, with a fine pointer: targets stay at their desktop sizes and hover states are live. '
            'This frame is what proves the notice does not fire here.', 'D8b · 720 × 900 · fine pointer',
            anchor='zoom')
     + lift('D8 Editor Below 1440', label='D8b Editor at 720')
     + head('The skip link',
            'The first focusable thing in the shell, over the top bar&rsquo;s left edge: hidden at rest, visible on '
            'keyboard focus, reading &ldquo;Skip the canvas&rdquo; — because the canvas renders the user&rsquo;s '
            'own site, and tabbing through it means every link that site emits. The ring is the Calibration '
            'Set&rsquo;s corrected token, 2px solid <span class="mono">#C2381F</span> (A7 item 7).',
            'D8c · skip link · rest and keyboard focus · 620', anchor='skip-link')
     + lift('D8 Editor Below 1440', label='D8c Skip link')
     + head('A Layers row, focused — the fourth state',
            'B7&rsquo;s rows had rest, hover and selected. Keyboard focus is the ring drawn over the row&rsquo;s '
            'existing state, so focused-and-selected reads as both; the wash stays for hover and selection only. '
            '↑ ↓ move focus, ⌥↑ ⌥↓ move the section itself.', 'D8e · a Layers row · the fourth state · 520',
            anchor='layers-focused')
     + lift('D8 Editor Below 1440', label='D8e Layers row focused')
     + head('Where focus opens on a destructive confirm — the rule',
            'As any irreversible confirm opens, focus is on the <b>cancelling</b> action, never on the danger fill. '
            'The subject is B5c&rsquo;s &ldquo;Take over from Rosa?&rdquo;; the same rule governs Delete account, '
            'Roll back, project delete, delete-in-use assets and &ldquo;Overwrite and ship anyway&rdquo;. D8f '
            'inherits B5c&rsquo;s wording — &ldquo;7 unsynced <i>changes</i>&rdquo; — where §AD2 makes '
            '<i>edits</i> canonical (the <a href="edit-lock.html#respec">one deviation on Edit Lock</a>); D8g '
            'already says edits.', 'D8f · a destructive confirm, as it opens · 620', anchor='destructive-confirm')
     + lift('D8 Editor Below 1440', label='D8f Destructive confirm'),
     subs=[SUB('At 834 — tablet', 'tablet', 'D8a'), SUB('The overflow menu', 'overflow', 'D8a'),
           SUB('At 720 — 200% zoom', 'zoom', 'D8b'), SUB('The skip link', 'skip-link', 'D8c'),
           SUB('A Layers row, focused', 'layers-focused', 'D8e'),
           SUB('Where focus opens', 'destructive-confirm', 'D8f')],
     note='Two more D8 frames sit beside the surfaces they extend: the assets drop zone with its keyboard path '
          '(D8d) on <a href="assets.html#drop-fix">Assets</a>, and Ship it from a read-only session (D8g) on '
          '<a href="edit-lock.html#deploy-blocked">Edit Lock</a>.')


page('section-picker', 'Section Picker', 'Editor',
     'S5 Section Picker.dc.html — S5a light, S5c dark preview',
     '§ IA → Editor · § State Patterns → Section Picker · J2 step 2',
     lift('S5 Section Picker', label='S5a Section picker', capt='S5a · section picker — Heroes · 1440')
     + head('Dark preview on — and the app chrome stays light',
            'The previews go dark; <b>Inflozo&rsquo;s own chrome does not</b>. There is no app dark mode in v1.',
            anchor='dark')
     + lift('S5 Section Picker', label='S5c Section picker dark', capt='S5c · section picker — dark preview on · 1440')
     + nodraw('What the picker never offers, and what it refuses',
              'A design whose <span class="mono">bindingContext</span> does not match this template is '
              '<b>never shown</b> — not greyed, not shown-and-refused (FR-D12). A second Post Content section '
              'is <b>refused at placement</b>, with the reason (ruling R-37). And a search with no matches keeps '
              'the category rail and says what was searched for.',
              anchor='refusals'),
     subs=[SUB('Dark preview', 'dark', 'S5c'), SUB('Refusals and no-matches', 'refusals', 'FR-D12 · R-37')])

page('variant-shuffle', 'Variant Shuffle', 'Editor',
     'S6 Variant Shuffle.dc.html',
     '§ IA → Editor · § Interaction Primitives · J2 step 4',
     lift('S6 Variant Shuffle', label='S6 Variant shuffle',
          capt='S6 · variant shuffle — mid-moment, [ and ] to shuffle · 1440'),
     note='<b>A Shuffle is one edit, not several operations</b> (AD-16). It rewrites every prop of a section '
          'and is a single undo step. The canvas status region announces the result politely, because the '
          'change is the one thing a screen-reader user cannot see happen.')

page('style-packs', 'Style Packs', 'Editor',
     'S7 Style Packs.dc.html — S7a panel, S7b crossfade, S7c edit, S7d new',
     '§ IA → Editor · J2 step 7',
     lift('S7 Style Packs', label='S7a Style pack panel', capt='S7a · style pack panel — Paper current · 1440')
     + head('Mid-switch', 'A 300ms crossfade — long enough to see the site change its mind, which is the moment '
            'the product is selling. Instant under <span class="mono">prefers-reduced-motion</span>.',
            anchor='crossfade')
     + lift('S7 Style Packs', label='S7b Pack crossfade', capt='S7b · mid-switch — Paper → Tangerine · 1440')
     + head('Edit a pack', 'Seven colour roles per mode. <b>Dark is tuned separately, never just inverted.</b>',
            anchor='edit')
     + lift('S7 Style Packs', label='S7c Edit pack', capt='S7c · edit a pack · 1440')
     + head('New pack', '', anchor='new')
     + lift('S7 Style Packs', label='S7d New pack', capt='S7d · new pack · 1440'),
     subs=[SUB('Mid-switch crossfade', 'crossfade', 'S7b'), SUB('Edit pack', 'edit', 'S7c'),
           SUB('New pack', 'new', 'S7d')],
     note='The frame&rsquo;s own caption flags it: the pack roster shows <b>4 of 12</b> and the shipping names '
          'were not supplied, so the ones drawn are placeholders.')

page('routes-manager', 'Routes Manager', 'Editor',
     'S9 Routes.dc.html — S9a manager, S9b YAML error, S9c new collection, S9d empty, S9e new route',
     '§ IA → Editor · § wrong mechanism → S9 · § State Patterns → Routes Manager',
     lift('S9 Routes', label='S9a Routes manager', capt='S9a · routes &amp; templates · 1440')
     + head('Two rows the frame draws that have to go',
            'A membership page emits <b>no route</b> — it is <span class="mono">custom-{name}.hbs</span>, bound '
            'from Ghost&rsquo;s page editor, so <span class="mono">/subscribe/ : members-signup</span> goes. '
            'And <span class="mono">home.hbs</span> resolves for the root by itself; a '
            '<span class="mono">routes:</span> entry for <span class="mono">/</span> also removes the index '
            'collection, which breaks <span class="mono">/page/2/</span> — so that row goes too (FR-I1/I5).',
            anchor='respec')
     + head('YAML error', 'Line-numbered, and <b>deploys are blocked until routing is valid — the Ship button '
            'carries the reason</b> rather than failing later.', anchor='error')
     + lift('S9 Routes', caption='S9b ·', capt='S9b · yaml pane — validation error')
     + head('New Collection Sheet', '<b>Posts per page comes from Theme Settings</b>, and a collection&rsquo;s '
            'own <span class="mono">limit:</span> may override it for that route — the frame says it follows '
            'the home feed&rsquo;s Count control, which is not where that value lives. That per-collection '
            '<span class="mono">limit:</span> is in Ghost&rsquo;s code, not its docs — read in source: 5.130.6 '
            '<span class="mono">core/frontend/services/routing/CollectionRouter.js:39</span> and '
            '<span class="mono">route-settings/validate.js:93</span>; 6.58.0 '
            '<span class="mono">route-settings/route-settings-parser.js:59,151</span>. '
            'docs.ghost.org/themes/routing lists permalink, template, filter, data, order and rss only, so this '
            'is re-read at every Ghost major. And the published-date '
            'field offers FR-I2&rsquo;s <b>relative</b> form first.', anchor='new-collection')
     + lift('S9 Routes', caption='S9c ·', capt='S9c · &ldquo;+ New collection&rdquo; sheet')
     + head('New Route Sheet', '', anchor='new-route')
     + lift('S9 Routes', caption='S9e ·', capt='S9e · &ldquo;+ Custom route&rdquo; sheet')
     + head('Empty', '', anchor='empty')
     + lift('S9 Routes', label='S9d Routes empty', capt='S9d · routes — empty state · 1440'),
     subs=[SUB('The two rows that go', 'respec', 'FR-I1/I5'),
           SUB('Routes — YAML error', 'error', 'S9b'),
           SUB('New Collection Sheet', 'new-collection', 'S9c'),
           SUB('New Route Sheet', 'new-route', 'S9e'),
           SUB('Routes — empty', 'empty', 'S9d')])

page('theme-settings', 'Theme Settings', 'Editor',
     'B Missing Surfaces.dc.html — B17 (re-specified and extended → drawn as D6) · B18 translations · '
     'D6 Theme Settings Completed.dc.html — D6a Pro, D6b Free, D6c the text-prop confirm',
     '§ IA → Editor · § wrong mechanism → B17 · FR-Q1/Q2/Q3, FR-J15, FR-D7',
     lift('B Missing Surfaces', caption='B17 · #17', capt='B17 · theme settings, with the custom-settings builder · 1440')
     + head('Four corrections, and one of them is the surface&rsquo;s own primary value',
            '<b>1 · <span class="mono">posts_per_page</span> is missing entirely.</b> It is FR-Q1&rsquo;s first '
            'field and belongs at the top — every surface in the product that mentions posts per page links '
            '<i>here</i>, never into Ghost Admin, because Ghost has no such setting (ruling R-10 #13). '
            '<b>2 · The logo row loses its Replace button.</b> Ghost&rsquo;s logo is read, never written '
            '(AD-10&rsquo;s allowlist) — padlock it like the title, with a link out. '
            '<b>3 · The dark row is drawing the wrong thing.</b> &ldquo;Follows the reader&rsquo;s system '
            'setting&rdquo; is the <i>visitor&rsquo;s</i> moon toggle; this row is FR-D7&rsquo;s <b>project '
            'mode</b> — Light only / Light + Dark — plus a &ldquo;Clear dark overrides&rdquo; row. '
            '<b>4 · The meter reads 3 of 20 and should read 3 of 17</b>: three of Ghost&rsquo;s twenty slots '
            'are the dark built-ins every Inflozo project declares (FR-Q2). <b>All four are drawn in D6a</b> '
            '(prompt A6, 2026-09-04 export): Posts per page sits first with its stepper at 12; the logo row is '
            'padlocked with &ldquo;Change this in Ghost&rdquo;; the dark row is the project mode, Light only / '
            'Light + Dark, with Clear dark overrides beneath it; the meter reads 3 OF 17.', anchor='respec')
     + head('And four additions to the builder',
            'The Ghost Admin <b>group</b>, a <b>visibility condition</b>, FR-Q3&rsquo;s text-prop confirm '
            '(&ldquo;Ghost&rsquo;s own settings are plain text, so the marks come off&rdquo;), the post-deploy '
            'key-immutability notice, and the pack-switch warning on a promoted accent. All drawn by prompt A6: '
            'Group in Ghost and Only show when are rows of D6a&rsquo;s promote form, the keys-freeze notice sits '
            'under its meter, the warning sits on the promoted accent, and the confirm is D6c.',
            anchor='additions')
     + head('Theme Settings, completed — as D6a draws it', '', anchor='completed')
     + lift('D6 Theme Settings Completed', label='D6a Theme settings Pro', capt='D6a · theme settings · Pro · 1440')
     + head('Free — the credits row greyed with its reason, and a Light-only project',
            'The row exists here and is unavailable now, and the sentence says which; hiding it would teach a '
            'customer that Inflozo has no opinion about credits. The same pattern greys Clear dark overrides on a '
            'Light-only project — the overrides are kept, not discarded.', anchor='free')
     + lift('D6 Theme Settings Completed', label='D6b Theme settings Free',
            capt='D6b · theme settings · Free — greyed with the reason, never hidden · detail at 720')
     + head('The text-prop promote confirm',
            'The sentence before and after, because &ldquo;formatting will be removed&rdquo; is abstract until a '
            'user sees their own line lose its link (FR-Q3).', anchor='text-prop')
     + lift('D6 Theme Settings Completed', label='D6c Text prop confirm',
            capt='D6c · the text-prop promote confirm — detail at 520')
     + head('Translations', 'Every chrome string the theme prints.', anchor='translations')
     + lift('B Missing Surfaces', caption='B18 · #18', capt='B18 · translations · 940')
     + head('B18&rsquo;s keys are the wrong shape',
            'The frame draws flat keys — <span class="mono">subscribe</span>, '
            '<span class="mono">read_more</span>. FR-Q6 makes them <b>dotted '
            '<span class="mono">namespace.name</span></b> — <span class="mono">member.signup_cta</span>, '
            '<span class="mono">post.reading_time</span>, <span class="mono">archive.empty_heading</span> — '
            'because a flat catalogue collides the moment two surfaces both want &ldquo;subscribe&rdquo;. '
            'FR-Q8 adds a <b>brace-refusal error state</b>: a malformed interpolation token is a whole-site '
            '500. The RTL acknowledgement is right, and FR-Q6 requires it <b>repeated as a pre-deploy '
            'warning</b> on the Pre-flight Check.', anchor='translations-fix'),
     subs=[SUB('The four corrections', 'respec', 'A6 → D6a'),
           SUB('Custom Settings Builder — the additions', 'additions', 'D6a'),
           SUB('Theme Settings, completed', 'completed', 'D6a'),
           SUB('Free — credits greyed', 'free', 'D6b'),
           SUB('Text-prop confirm', 'text-prop', 'D6c'),
           SUB('Translations', 'translations', 'B18'),
           SUB('Translations — the key shape', 'translations-fix', 'FR-Q6/Q8')])


page('paywall-editor', 'Paywall Editor', 'Editor',
     'C Post Body.dc.html — C3a the paywall canvas, C3b the designs and the no-paid-tiers empty state',
     '§ IA → Editor · § The three canvases that are not pages · § State Patterns → Paywall Editor · FR-H6',
     lift('C Post Body', label='C3a Paywall editor', capt='C3a · the paywall canvas · 1440')
     + head('Three of the twelve designs, and the empty case',
            'The frame&rsquo;s empty state says that with no paid tier Ghost&rsquo;s paywall never renders. '
            '<b>That is not what Ghost does.</b> The cut is gated on <i>access</i>, not on tiers: '
            '<span class="mono">core/frontend/helpers/content.js</span> returns the CTA whenever '
            '<span class="mono">this.access</span> is false, and Ghost&rsquo;s own '
            '<span class="mono">content-cta.hbs</span> carries a members-only branch — &ldquo;This post is for '
            'subscribers only&rdquo;, Subscribe / Sign in — inside the same '
            '<span class="mono">gh-post-upgrade-cta</span> block (read in source on 6.54.1 and 5.130.6; '
            'MEASUREMENTS §15b executed the override point this design replaces). So the paywall design applies '
            'to <b>any gated post</b> — members, paid or tiers — and the honest empty case is <b>members disabled '
            'on the site</b> (<span class="mono">members_signup_access = none</span>). Corrected in the '
            '2026-09-04 export (A7 item 12): C3b&rsquo;s empty state is now &ldquo;Members are switched off&rdquo;, '
            'with two numbered steps and a re-check. <b>One thing to execute at the story:</b> its step 1 prints a '
            'Ghost Admin path, Settings → Membership, which this build has not verified on 6.58.0 (T1 exists for '
            'that) — the backup gate&rsquo;s rule is that Ghost Admin paths are described, never printed.',
            anchor='designs')
     + lift('C Post Body', label='C3b Paywall designs and empty state', capt='C3b · three designs and the empty state'),
     subs=[SUB('The designs, and the empty case', 'designs', 'C3b')],
     note='This surface was reported as never drawn. <b>It is drawn</b> — C3a, at 1440, with its six controls, '
          'its &ldquo;how readers reach it&rdquo; explainer and an empty state whose reason was wrong until A7 '
          '(below) — '
          'and it sits in a drawn left-nav group, <b>Template surfaces</b>.')

page('editor-cards', 'Editor Cards', 'Editor',
     'S14 Editor Cards.dc.html — S14a card dropdown, S14b treatment dropdown, S14c reset confirm, '
     'S14d entry point, S14e callout selected · C Post Body C1a, C1c',
     '§ IA → Editor · § The three canvases that are not pages · FR-Q7',
     lift('S14 Editor Cards', label='S14e callout selected', capt='S14e · a callout card selected · 1440')
     + head('The card dropdown — every Koenig card, in Ghost&rsquo;s order',
            '<b>Colour controls are never offered for header, signup and CTA cards.</b> The post author sets '
            'those inline in Ghost&rsquo;s editor, and a control that silently loses to an inline style is '
            'worse than none. The order the frame claimed as Ghost&rsquo;s was not, until the 2026-09-04 export '
            '(A7 item 15): it now follows the editor&rsquo;s own menu, read from the koenig-lexical bundle on '
            '5.130.6 and 6.58.0 — Video before Audio, Embed last, and slot 8 is <b>Email call to action</b>, the '
            'email-only card that renders nothing on the web (MEASUREMENTS §35b), which is where the NO COLOUR '
            'CTLS mark sits; the web <b>Call to action</b> keeps its own entry and its panel.', anchor='cards')
     + lift('S14 Editor Cards', label='S14a Editor cards dropdown', capt='S14a · card-type dropdown open · 1440')
     + head('The treatment dropdown', 'Chosen first, once per project. A per-card override a new treatment '
            'claims is dropped <b>with a one-line notice</b> — never silently kept and outvoted.', anchor='treatment')
     + lift('S14 Editor Cards', label='S14b treatment picker', capt='S14b · the treatment dropdown · 520')
     + head('Reset to Ghost&rsquo;s default', 'Per card, <b>never whole-set</b>: twenty decisions removed by one '
            'click is a footgun with no matching user intent.', anchor='reset')
     + lift('S14 Editor Cards', label='S14c reset confirm', capt='S14c · reset to Ghost default · 520')
     + head('The entry point', 'Surface links — Pages · Layers · Editor cards — sit in one group above the '
            'Layers list. Card styling is a project-level decision.', anchor='entry')
     + lift('S14 Editor Cards', label='S14d entry point', capt='S14d · the entry point in the editor&rsquo;s left nav · 560')
     + head('The cards module&rsquo;s home, and the six cards with no panel',
            'Six cards render nothing of their own — a GIF arrives as an image, markdown as headings and links, '
            'and the two email cards never leave the newsletter. Opening one says why, in one line, and offers '
            'the card it defers to.', anchor='home')
     + lift('C Post Body', label='C1a Cards home', capt='C1a · cards home — grouped by what a theme can reach · 1440')
     + lift('C Post Body', label='C1c Card panels', capt='C1c · the card panels'),
     subs=[SUB('Card dropdown', 'cards', 'S14a'), SUB('Treatment dropdown', 'treatment', 'S14b'),
           SUB('Reset confirm', 'reset', 'S14c'), SUB('The entry point', 'entry', 'S14d'),
           SUB('Cards home, and the six with no panel', 'home', 'C1a · C1c')])

page('post-content', 'Post Content', 'Editor',
     'C Post Body.dc.html — C2a on the canvas with the section selected, C2b TOC positions, '
     'C4 the style-guide fixture',
     '§ IA → Editor · § The three canvases that are not pages · Appendix A §25',
     lift('C Post Body', label='C2a Post content desktop', capt='C2a · on the canvas with the section selected · 1440')
     + head('Index positions, and at 390', 'Left and right both become the same thing at 390: a collapsed index '
            'above the first heading, and the rail as a row at the foot.', anchor='toc')
     + lift('C Post Body', label='C2b TOC positions and mobile', capt='C2b · TOC positions and mobile')
     + head('Style-Guide Fixture', 'The canvas never shows a real post by default — it shows this. One of every '
            'card type, a heading profile that descends three levels, lists, code, a table and a pull-quote, '
            'arranged as a piece anyone would read on purpose. <b>It is the most-seen page in the product</b>, '
            'so it is written rather than assembled. The paywall is deliberately <b>not</b> in it — a cut '
            'mid-article would stop it being readable end to end.', anchor='fixture')
     + lift('C Post Body', label='C4 Style-guide fixture', capt='C4 · the fixture in full · 880 measure'),
     subs=[SUB('Index positions and 390', 'toc', 'C2b'), SUB('Style-Guide Fixture', 'fixture', 'C4')])

page('error-pages', 'Error Pages', 'Editor',
     'NOT DRAWN as a canvas. The A31 designs exist; the Template-surfaces left-nav group that hosts them '
     'is drawn in C Post Body C3a',
     '§ IA → Editor · § The three canvases that are not pages · FR-Q9',
     nodraw('Error Pages',
            '<span class="mono">error.hbs</span> ships on every project; <span class="mono">private.hbs</span> '
            'ships <b>only when a Private Site Gate section has been designed</b>. Both sit on the '
            'Template-surfaces canvas — ink chrome rather than paper, because a canvas that is not a page '
            'announces itself — with the A31 category&rsquo;s designs in the picker. This is also where '
            'FR-Q9&rsquo;s fallback lands: a treatment whose host section is absent is still selected here. '
            'No prompt draws the canvas itself; the A31 designs are drawn in their own category.')
     + head('The Template-surfaces group that hosts it', 'Drawn in C Post Body, in ink chrome.',
            'C3a · the paywall canvas, showing the left-nav group · 1440', anchor='group')
     + lift('C Post Body', label='C3a Paywall editor'),
     subs=[SUB('The Template-surfaces group', 'group', 'C3a')])

page('edit-lock', 'Edit Lock', 'Editor',
     'B Missing Surfaces.dc.html — B5a read-only bar, B5b request popover, B5c takeover modal · '
     'D8 Editor Below 1440.dc.html — D8g ship it from a read-only session',
     '§ IA → Editor · flow F2 · FR-D18, addendum.md §AD2',
     head('One editing context per project — across tabs, browsers and devices',
          'The three frames escalate deliberately: <b>a bar, then a popover, then a modal with a danger '
          'fill</b>. The interruption grows only as the stakes do. That escalation is the design and it stands.')
     + head('The reader', 'The canvas stays fully legible; the sidebar dims to 55% so controls are <i>visible</i> '
            'but nothing responds. The bar names the person, not a role.', anchor='reader')
     + lift('B Missing Surfaces', caption='B5a ·', capt='B5a · read-only')
     + head('The holder — a popover, not a modal',
            'The holder is mid-sentence. It states the sync position <b>before</b> asking. <b>The countdown is '
            'a no-response timer and it restarts the instant the holder interacts with the popover at all, focus '
            'included</b> — it only runs out when nobody is there. Announced <b>assertively</b>.', anchor='holder')
     + lift('B Missing Surfaces', caption='B5b ·', capt='B5b · request arrives for the holder')
     + head('The takeover', '', anchor='takeover')
     + lift('B Missing Surfaces', caption='B5c ·', capt='B5c · takeover with unsynced edits')
     + head('One deviation from B5c, and it is not optional',
            'The frame itemises the loss per section — &ldquo;Home hero — design and two controls · Footer — '
            'three link labels · Post template — measure&rdquo;. <b>That detail does not exist.</b> The '
            'heartbeat carries <span class="mono">unsynced_edits</span> and nothing else; the requester&rsquo;s '
            'browser has never seen the holder&rsquo;s journal. The modal keeps its shape, its danger fill and '
            'its &ldquo;Or message Rosa&rdquo; escape, and its body becomes: <b>&ldquo;7 unsynced edits will be '
            'lost. They exist only in Rosa&rsquo;s browser. We cannot retrieve them from here.&rdquo;</b> '
            'Also: B5c says &ldquo;changes&rdquo;; <b>§AD2 says <i>edits</i> is canonical, everywhere</b>.',
            anchor='respec')
     + head('Deploy and export from a read-only session — the fourth state',
            'Ship it or Export first prompts a take-over, <b>surfacing the unsynced edits that exist '
            'elsewhere</b> — so a stale cloud snapshot can never silently ship. Drawn by prompt A8 in the '
            '2026-09-04 export on B5c&rsquo;s shape: danger fill, &ldquo;Or message Rosa&rdquo;, and focus opening '
            'on <b>Wait</b>, per the <a href="editor-narrow.html#destructive-confirm">rule D8f draws</a>. It says '
            '<i>edits</i>, as §AD2 requires.', anchor='deploy-blocked')
     + lift('D8 Editor Below 1440', label='D8g Ship from read-only',
            capt='D8g · ship it from a read-only session · the fourth lock state · 620'),
     subs=[SUB('The reader', 'reader', 'B5a'), SUB('The holder', 'holder', 'B5b'),
           SUB('The takeover', 'takeover', 'B5c'), SUB('The one deviation', 'respec', '§AD2'),
           SUB('Deploy from a read-only session', 'deploy-blocked', 'D8g')],
     note='<b>Rollback and snapshot restore never require the lock</b>, because they redeploy a stored artifact '
          'rather than the working document.')


# ═══════════════════════════════════════════════════════════════════════════════
# DEPLOY
# ═══════════════════════════════════════════════════════════════════════════════
page('deploy-wizard', 'Deploy Wizard', 'Deploy',
     'index page — no lift; every step lifts its own frame on its own page',
     '§ IA → Deploy · § Component Patterns → Wizard step rail · J1 steps 9–14 · J2 step 13 · J3 step 3',
     head('The rail grows, and that is the whole shape of this flow',
          'An ordinary deploy is four steps, which is what S8 draws. <b>The first deploy to a given site is '
          'six</b>, because two gates fire once per site and never again — the Staff Token Offer and the '
          'Backup Gate — drawn by prompt A1 in the 2026-09-04 export as D1b–D1e, with the six-step rail.')
     + head('Every step, as a page you can walk')
     + """<div class="annot"><div class="idxgrid">
  <a class="idxrow" href="deploy-destination.html">1 · Deploy Destination<span class="k">S8a · D1a</span></a>
  <a class="idxrow" href="staff-token-offer.html">2 · Staff Token Offer<span class="k">D1b · D1c</span></a>
  <a class="idxrow" href="backup-gate.html">3 · Backup Gate<span class="k">D1d · D1d′ · D1e</span></a>
  <a class="idxrow" href="preflight-check.html">4 · Pre-flight Check<span class="k">S8b</span></a>
  <a class="idxrow" href="snapshot-gate.html">5 · Snapshot Gate<span class="k">B12a · B12b</span></a>
  <a class="idxrow" href="deploy-progress.html">5 · Deploy Progress<span class="k">S8c</span></a>
  <a class="idxrow" href="deploy-live.html">6 · Deploy Live<span class="k">S8d</span></a>
  <a class="idxrow" href="deploy-uploaded.html">6 · Deploy Uploaded<span class="k">D2f</span></a>
  <a class="idxrow" href="partial-success.html">6 · Partial Success<span class="k">D2e · D2d</span></a>
  <a class="idxrow" href="deploy-failure.html">5 · Deploy Failure<span class="k">S8d′</span></a>
  <a class="idxrow" href="pro-exit-sheet.html">Pro Exit Sheet<span class="k">B13a</span></a>
  <a class="idxrow" href="library-update-confirm.html">Library Update Confirm<span class="k">B14b</span></a>
  <a class="idxrow" href="drift-report.html">Drift Report<span class="k">D3a · D3b · D3c</span></a>
  <a class="idxrow" href="deploy-history.html">Deploy History<span class="k">S8e · D2a–c</span></a>
</div></div>"""
     + head('What fires before step 1 even opens',
            'Two sheets sit in front of the wizard rather than inside it. The '
            '<a href="pro-exit-sheet.html">Pro Exit Sheet</a> fires on a Free plan with Pro designs in the '
            'site — the only moment money is mentioned. The '
            '<a href="library-update-confirm.html">Library Update Confirm</a> fires whenever the library has '
            'advanced since this project&rsquo;s last deploy, because a redeploy carries those changes whether '
            'or not anyone asked.'))

page('deploy-destination', 'Deploy Destination', 'Deploy',
     'S8 Deploy.dc.html — S8a · S8a′ preview-only · D1 First-Deploy Gates.dc.html — D1a, the first deploy',
     '§ IA → Deploy · J1 step 9 · J2 step 13',
     lift('S8 Deploy', label='S8a Ship step 1', capt='S8a · ship wizard — step 1 of 4 · destination · 1440')
     + head('What the first deploy adds',
            'On the <b>first</b> deploy to a site the rail is six steps, and this card gains one row: the theme '
            'that will be created, <span class="mono">inflozo-orbit-weekly</span>, with one line saying the name '
            'is permanent for this site from now on (FR-J10). Drawn by prompt A1 in the 2026-09-04 export.',
            anchor='first-deploy')
     + lift('D1 First-Deploy Gates', label='D1a Destination first deploy',
            capt='D1a · destination, first deploy — step 1 of 6 · 1440')
     + head('Preview-Only Destination', 'The site cannot take a custom theme, so the exit is <b>export</b> '
            'instead of deploy.', anchor='preview-only')
     + lift('S8 Deploy', caption='S8a′ ·', capt='S8a′ · step 1 variant — Ghost(Pro) Starter, preview-only')
     + head('And its copy is wrong in the way that wastes an afternoon',
            'S8a′ says &ldquo;download your theme and upload it in Ghost Admin&rdquo;. <b>Starter&rsquo;s '
            '<span class="mono">customThemes</span> limit forbids custom themes in Ghost Admin too</b> — it is '
            'a plan limit, not an API limit, so the manual route does not exist either. The zip still downloads '
            'on every plan (FR-J12); what the copy must say is where it can be installed: a self-hosted Ghost, '
            'or a Ghost(Pro) plan that allows custom themes. B15 already gets this right.', anchor='preview-fix'),
     subs=[SUB('What the first deploy adds', 'first-deploy', 'D1a'),
           SUB('Preview-Only Destination', 'preview-only', 'S8a′'),
           SUB('Its copy correction', 'preview-fix', 'FR-C2')])

page('staff-token-offer', 'Staff Token Offer', 'Deploy',
     'D1 First-Deploy Gates.dc.html — D1b the offer · D1c declined',
     '§ IA → Deploy · J1 step 10 · FR-C1, FR-C3 · Appendix H',
     lift('D1 First-Deploy Gates', label='D1b Safety net offer',
          capt='D1b · safety net · the offer — step 2 of 6 · 1440')
     + head('Whose token, exactly — the frame has the reach right',
            'Step 2 of the six-step first deploy, drawn by prompt A1 in the 2026-09-04 export. It leads with the '
            'safety net, names the credential second and says plainly that it is a full-Administrator one. <b>Two '
            'plain buttons, side by side, the same weight</b> — Add the token and Not now; Not now is not a small '
            'link. It says the token is <b>&ldquo;from the site Owner or an Administrator&rdquo;</b>, which is the '
            'right reach: every staff user mints their own from their profile page and it carries that user&rsquo;s '
            'role (read at docs.ghost.org/admin-api → Staff access tokens: &ldquo;Each user can create and refresh '
            'their own token&rdquo;), and the safety net needs a role that can read themes and write settings — '
            '<b>an Administrator&rsquo;s or the Owner&rsquo;s</b> (read in source, Ghost 6.54.1 fixtures.json '
            'roles_permissions: Administrator holds <span class="mono">theme: all</span> and '
            '<span class="mono">setting: all</span>; Editor holds only browse and read). Inflozo can check the role '
            'with <span class="mono">GET /admin/users/me/?include=roles</span> (executed on T1 and T3, review '
            '2026-09-03). Finding F-063 has landed: the PRD now defines &ldquo;the Owner&rsquo;s Staff Access '
            'Token&rdquo; as a token of Owner-or-Administrator reach (FR-C1, <i>Why the split</i>, read 2026-09-04) '
            'and EXPERIENCE.md&rsquo;s F3 rows say Owner or an Administrator; the frame agrees with both. '
            '<b>One sentence on D1b disagrees with D1c:</b> D1b says '
            'Inflozo uses the token for &ldquo;two things only — reading your current theme, and reading '
            'routes.yaml&rdquo;, while D1c&rsquo;s third cost and FR-I4 say it also <i>uploads</i> routes.yaml. '
            'Flagged for the story that builds this step (R-80); nothing here guesses which line moves.',
            anchor='reach')
     + head('Declined — acknowledged once, then never raised again',
            'It names exactly three costs — no copy of the current theme, no drift check, routes.yaml by hand — '
            'and closes with &ldquo;You can add it any time from Manage keys.&rdquo; <b>Nothing implies the user '
            'has done something wrong.</b> The multi-site operator working on a client&rsquo;s site <b>can comply '
            'when they hold an Administrator seat there</b>; one with an Editor seat cannot, and for them this is '
            'not a degradation, it is the path.', anchor='declined')
     + lift('D1 First-Deploy Gates', label='D1c Safety net declined',
            capt='D1c · safety net · declined — step 2 of 6 · 1440 · raised once, never again'),
     subs=[SUB('Whose token, exactly', 'reach', 'F-063'), SUB('Declined', 'declined', 'D1c')])

page('backup-gate', 'Backup Gate', 'Deploy',
     'D1 First-Deploy Gates.dc.html — D1d self-hosted, token given · D1d-prime the shortcut ticked · '
     'D1e Ghost(Pro), token declined',
     '§ IA → Deploy · flow F7 · BACKUP-GATE.md · J1 step 11',
     lift('D1 First-Deploy Gates', label='D1d Backup gate self-hosted',
          capt='D1d · backup gate · self-hosted, token given — step 3 of 6 · 1440 · card drawn full height; '
               'in the product it scrolls inside the 900 viewport')
     + head('Reading order is the design, and the frame keeps it',
            'Step 3, drawn by prompt A1 in the 2026-09-04 export, and <b>it blocks the deploy button until '
            'confirmed</b>. <b>First</b> the modest truth — Inflozo writes exactly two things, the theme and '
            '<span class="mono">routes.yaml</span> — <b>then</b> the recommendation with its reason, <b>then</b> the '
            '<span class="mono">ghost backup</span> shortcut, <b>then</b> the seven rows (Theme · routes.yaml · '
            'Content, which does not include images · Members · Redirects · Images, files and media, the gap most '
            'people miss · Database), and <b>last</b> the master confirm, with the deploy button greyed and a line '
            'counting the rows still to tick. With the token given, the Theme and routes.yaml rows carry a '
            'Download (FR-J13 as amended, §A12 decision 5). <b>No Ghost Admin menu path is printed on any row</b> — '
            'each describes what to look for and links to Ghost&rsquo;s own help — which is the rule the note '
            'above explains.', anchor='order')
     + head('The shortcut ticked — every row stays visible',
            'Ticking <span class="mono">ghost backup</span> ticks every row below and leaves them on screen, so the '
            'customer sees what they now hold; one confirmation is left.', anchor='shortcut')
     + lift('D1 First-Deploy Gates', label='D1d-prime Shortcut ticked',
            capt='D1d′ · the shortcut ticked — every row stays visible, ticked · detail at 940')
     + head('On Ghost(Pro), the shortcut does not exist and the gate says so',
            'The shortcut is replaced by a sky information block — not danger — and no Download appears '
            'anywhere, because the token was declined. The Ghost(Pro) claims on it are <b>cited, not executed</b> '
            '— there is no Ghost(Pro) test server yet — so the copy says what Ghost Admin does and does not offer '
            'and points the customer at Ghost, rather than asserting a platform-wide impossibility in '
            'Inflozo&rsquo;s own voice. It closes: <b>&ldquo;This is not something Inflozo can fix, and we are not '
            'going to pretend otherwise.&rdquo;</b>', anchor='ghostpro')
     + lift('D1 First-Deploy Gates', label='D1e Backup gate Ghost Pro',
            capt='D1e · backup gate · Ghost(Pro), token declined — step 3 of 6 · detail at 940 · '
                 'no download button anywhere'),
     subs=[SUB('Reading order', 'order', 'D1d'),
           SUB('The shortcut ticked', 'shortcut', 'D1d′'),
           SUB('Backup Gate — Ghost(Pro)', 'ghostpro', 'D1e')],
     note='<b>What this is, and what it is not.</b> A <b>consent gate, not a technical control</b>. It moves '
          'responsibility; it does not reduce risk. A customer who ticks the box without having backed up still '
          'loses their theme — they simply had a fair chance not to. <b>No Ghost Admin menu path is hard-coded '
          'on it</b>: Ghost 5.130.6 carries Advanced, Labs, Import/Export and Export, and Ghost 6.58.0 carries '
          'none of them.')


page('preflight-check', 'Pre-flight Check', 'Deploy',
     'S8 Deploy.dc.html — S8b',
     '§ IA → Deploy · J1 step 12 · FR-Q6, FR-J16',
     lift('S8 Deploy', caption='S8b ·', capt='S8b · step 2 · pre-flight check — one warning expanded')
     + head('Two rows the frame does not have, and both are required',
            'FR-Q6 requires the <b>RTL acknowledgement repeated here as a pre-deploy warning</b> — it is where '
            'it bites. And FR-J16&rsquo;s <b>drift row</b> sits among these checks on every deploy after the '
            'first: a passing row when nothing changed, and a stop when something did. The drift row is now drawn '
            '— D3c passing, D3b when it cannot check, D3a when it stops the deploy, all on '
            '<a href="drift-report.html">Drift Report</a> (prompt A3, 2026-09-04 export). The RTL row is still '
            'drawn on no frame and no Appendix A prompt owns it: the story that builds Pre-flight adds it from '
            'S8b&rsquo;s own warning row (R-80).', anchor='additions')
     + head('&ldquo;Required templates present (index, post, page)&rdquo; — two of those are Ghost&rsquo;s',
            'gscan requires <span class="mono">index.hbs</span> and <span class="mono">post.hbs</span> '
            '(<span class="mono">GS020-INDEX-REQ</span>, <span class="mono">GS020-POST-REQ</span>) and recommends '
            '<span class="mono">default.hbs</span> (<span class="mono">GS020-DEF-REC</span>); <b>no rule requires '
            '<span class="mono">page.hbs</span></b> — read in gscan 4.49.7 and 6.4.2 '
            '<span class="mono">lib/specs</span>, the versions Ghost 5.130.6 and 6.58.0 bundle (VERIFY-AT-BUILD '
            'item 31). <span class="mono">page</span> is Inflozo&rsquo;s own standard-set check (FR-I1), not '
            'Ghost&rsquo;s. The row is unchanged in the 2026-09-04 export and A7 carried no item for it — this '
            'annotation had claimed one it did not have. If the row is meant to read as Ghost&rsquo;s check, the '
            'story that builds Pre-flight drops &ldquo;page&rdquo; or names it as Inflozo&rsquo;s (R-80).',
            anchor='templates-row'),
     subs=[SUB('The two rows it is owed', 'additions', 'FR-Q6 · D3'),
           SUB('Which template rules are Ghost&rsquo;s', 'templates-row', 'GS020')])

page('snapshot-gate', 'Snapshot Gate', 'Deploy',
     'B Missing Surfaces.dc.html — B12a running, B12b degraded. Semantics re-specified',
     '§ IA → Deploy · flow F1 · FR-J13 · J1 step 13',
     lift('B Missing Surfaces', caption='B12a · #12', capt='B12a · snapshot gate · running')
     + head('Two sentences on that frame were wrong and both were load-bearing',
            '<b>&ldquo;It happens on every deploy&rdquo;</b> — it is the <b>first upload to a site</b>, '
            'deploy-only included, because manual activation in Ghost Admin must not bypass the safety net. '
            '<b>&ldquo;Snapshots count towards your history — Free keeps 3, Pro keeps 10&rdquo;</b> — the '
            'snapshot is <b>exempt from the history limit and never prunes</b>. Both corrected in the 2026-09-04 '
            'export (A7 item 2): the first sentence is gone and the second reads &ldquo;Kept outside your version '
            'limit.&rdquo;', anchor='respec')
     + head('Capture failed', '', anchor='failed')
     + lift('B Missing Surfaces', caption='B12b · #12', capt='B12b · capture failed')
     + head('B12b&rsquo;s reason was the most expensive error in the export',
            'It said <i>&ldquo;your integration key may not have theme read permission … Check the key.&rdquo;</i> '
            'Ghost&rsquo;s admin-API allowlist (<span class="mono">tokenPermissionCheck</span> in '
            '<span class="mono">core/server/web/api/endpoints/admin/middleware.js</span>, read in 6.54.1) lets a '
            'Custom Integration token reach <span class="mono">themes</span> only as POST and PUT, so <b>every</b> '
            '<span class="mono">GET /themes/*</span> made with an Admin API key is refused on every host — '
            '<b>403 on Ghost 6 and 501 on Ghost 5</b> (executed, MEASUREMENTS §15h and §21m; AD-24 must fold both '
            'into one Inflozo code). <b>There is no key to fix.</b> Telling a user to go and fix one sends them to '
            'spend an afternoon on something that cannot be done. The replacement names the real cause (no Staff '
            'Access Token), then what protects them anyway — <b>Ghost keeps the pre-Inflozo theme under Settings → '
            'Design</b>, which holds because this gate fires only at the first upload; later Inflozo versions '
            'replace each other under the frozen name (FR-J10) and live only in Inflozo&rsquo;s history — then '
            'three real actions. Corrected in the 2026-09-04 export (A7 item 2): the body names the token and says '
            'there is no permission to switch on, shows the executed <span class="mono">403</span> (the Ghost 6 '
            'answer — Ghost 5&rsquo;s is 501, and AD-24 folds both), and the buttons are Add the token · Deploy '
            'without a snapshot · Cancel; &ldquo;Check the key&rdquo; is gone. <b>One thing to execute at the '
            'story:</b> the reassurance now prints a Ghost Admin path, Settings → Design, which this build has not '
            'verified on 6.58.0 (T1 exists for that); the backup gate&rsquo;s rule is to describe what to look for '
            'rather than print a path.', anchor='respec-b12b'),
     subs=[SUB('The two wrong sentences', 'respec', 'FR-J13'),
           SUB('Capture failed', 'failed', 'B12b'),
           SUB('B12b&rsquo;s wrong reason', 'respec-b12b', 'MEASUREMENTS')])

page('deploy-progress', 'Deploy Progress', 'Deploy',
     'S8 Deploy.dc.html — S8c',
     '§ IA → Deploy · J1 step 13',
     lift('S8 Deploy', caption='S8c ·', capt='S8c · step 3 · shipping — upload in progress'),
     note='Each stage is announced politely as it starts, and so is the outcome. <b>Nothing blocks on this</b> — '
          'the user can keep editing and the notification lands in '
          '<a href="notifications.html">Notifications</a> whether or not the tab is still open. <b>S8c greys the Cancel on the uploading card</b> (disabled, 35% opacity) with the reason &ldquo;Once it starts, it finishes&rdquo; &mdash; A7 item 13&rsquo;s second remedy, applied in the 2026-09-04 export. FR-J8 governs — once uploading starts the deploy '
          'runs to completion — so the story drops the button (R-80).')

page('deploy-live', 'Deploy Live', 'Deploy',
     'S8 Deploy.dc.html — S8d',
     '§ IA → Deploy · J1 step 14 · J3 step 6 · flow F6',
     lift('S8 Deploy', caption='S8d ·', capt='S8d · step 4 · live — the product&rsquo;s one confetti moment')
     + head('The &ldquo;one step left&rdquo; card, when custom templates were emitted',
            'A card on the success state, <b>not a modal that must be dismissed to reach the confetti. The '
            'deploy succeeded.</b> A project whose deploy emitted no custom template never sees it — which is '
            'every starter&rsquo;s first deploy, so the confetti stays clean. It is drawn as '
            '<a href="template-binding-checklist.html">B19</a> — on a mechanism FR-I1 forbade until A7 item 1 '
            'corrected it (2026-09-04 export).', anchor='binding')
     + head('The confetti fires on the first deploy that makes the site LIVE',
            'A deploy-only ends on <a href="deploy-uploaded.html">Deploy Uploaded</a>, not here. &ldquo;Live! '
            'Your site just got gorgeous&rdquo; would be false on a theme nobody is serving — the canonical '
            'string is what settles it.', anchor='confetti'),
     subs=[SUB('Template binding card', 'binding', 'F6'), SUB('When the confetti fires', 'confetti', 'Appendix H')])

page('deploy-failure', 'Deploy Failure', 'Deploy',
     'S8 Deploy.dc.html — S8d′',
     '§ IA → Deploy · § Voice and Tone (errors are human and name the fix)',
     lift('S8 Deploy', caption='S8d′ ·', capt='S8d′ · step 3 failure — human message + reconnect'),
     note='Never &ldquo;An error occurred.&rdquo; The sentence names what happened in the other party&rsquo;s '
          'terms and the button is the fix. <b>The cause this frame first named — an expired key — does not '
          'exist.</b> An Admin API key never expires — the <span class="mono">api_keys</span> table has no expiry '
          'column (read in source, Ghost 6.54.1 <span class="mono">core/server/data/schema/schema.js</span>) and '
          'docs.ghost.org/admin-api says the key can be regenerated any time; the only thing that expires is the '
          'five-minute JWT Inflozo signs with it. A key that was regenerated, or whose integration was deleted, '
          'answers <span class="mono">401 Unknown Admin API Key</span> (executed against T1 6.58.0 and T3 5.130.6, '
          'review 2026-09-03). Corrected in the 2026-09-04 export (A7 item 11): the sentence now reads '
          '&ldquo;Ghost said no — this Admin API key no longer works. It was regenerated or removed in Ghost '
          'Admin. Paste the new key and we&rsquo;ll pick up right here.&rdquo; with Reconnect site. A deploy '
          'failure is one of the five product emails (FR-P1), and it is the only deploy outcome that sends one — '
          'uploaded-not-live sends nothing, because nothing failed.')

page('deploy-uploaded', 'Deploy Uploaded', 'Deploy',
     'D2 Deploy History Completed.dc.html — D2f',
     '§ IA → Deploy · J1 "step 1 has two endings too" · FR-J8',
     lift('D2 Deploy History Completed', label='D2f Deploy only ending',
          capt='D2f · deploy only — the same ending, reached deliberately · 1440 · no confetti')
     + head('It is one state with two causes',
            'The other ending, reached deliberately: the user picked <b>Deploy only</b> at step 1. Drawn by prompt '
            'A2 in the 2026-09-04 export beside <a href="partial-success.html">Partial Success</a>, on one canvas, '
            'because they are the <b>same state reached two ways</b>: sky, not danger; the same card, the same rail '
            'with Ship complete and Live incomplete, the same two buttons — only the sentence changes, because only '
            'the cause changed, and the Activating row reads <i>Not requested</i> where the other reads '
            '<i>Didn&rsquo;t complete</i>. <b>&ldquo;Uploaded. Not live yet.&rdquo;</b> <b>No confetti</b>: the one '
            'confetti moment is the first deploy that makes the site live, and this one deliberately did not. The '
            'history row is identical for both — status <span class="mono">uploaded</span>, '
            '<span class="mono">activated</span> false, no active badge, <b>Re-activate</b> — and <b>neither sends '
            'a deploy-failure email</b>.', anchor='same-state'),
     subs=[SUB('One state, two causes', 'same-state', 'FR-J8')])

page('partial-success', 'Partial Success', 'Deploy',
     'D2 Deploy History Completed.dc.html — D2e in the wizard · D2d the history row',
     '§ IA → Deploy · flow F8 · FR-J8',
     lift('D2 Deploy History Completed', label='D2e Activation failed',
          capt='D2e · partial success in the wizard — upload passed, activation failed · 1440 · no confetti')
     + head('A partial success, not a failure',
            'Upload succeeded, activation failed. Drawn by prompt A2 in the 2026-09-04 export: sky, not danger, '
            'and <b>not</b> the S8d′ failure treatment. &ldquo;Your theme is on your site but isn&rsquo;t live '
            'yet.&rdquo; The rail shows Ship complete and Live incomplete, the Activating row reads <i>Didn&rsquo;t '
            'complete</i>, and the buttons are Re-activate v5 and Leave it for now. Its twin, reached on purpose, '
            'is <a href="deploy-uploaded.html">Deploy Uploaded</a>.', anchor='wizard')
     + head('The row it leaves in history',
            'No Live badge, because it is not live. The sky chip and the primary Re-activate replace the mint badge '
            'and Roll back; everything else in the row is unchanged.', anchor='row')
     + lift('D2 Deploy History Completed', label='D2d Partial success row',
            capt='D2d · partial success · the row — detail at 620')
     + head('Six things follow from calling it a partial success', '', anchor='consequences')
     + """<div class="annot"><div class="stack gap10" style="max-width:760px;margin:0 auto;padding:20px">
  <div class="checkrow"><span class="tick">1</span><span><b>The artifact is retained</b> like any successful
    compile, and appears in history without an active badge.</span></div>
  <div class="checkrow"><span class="tick">2</span><span><b>The theme name freezes</b>, because the name is
    claimed on the site the moment a theme lands there.</span></div>
  <div class="checkrow"><span class="tick">3</span><span><b>The drift baseline does not move</b> — FR-J16
    compares against what Inflozo last put <i>live</i>.</span></div>
  <div class="checkrow"><span class="tick">4</span><span><b>&ldquo;Never leaves a partially active theme&rdquo;
    is unaffected</b> — the site&rsquo;s active theme is still the previous one.</span></div>
  <div class="checkrow"><span class="tick">5</span><span><b>The user is told plainly</b>, with a re-activate
    action, because &ldquo;failed&rdquo; would be wrong and silence would be worse.</span></div>
  <div class="checkrow"><span class="tick">6</span><span><b>It sends no deploy-failure email.</b></span></div>
</div></div>""",
     subs=[SUB('In the wizard', 'wizard', 'D2e'), SUB('The history row', 'row', 'D2d'),
           SUB('What follows', 'consequences', 'FR-J8')])

page('drift-report', 'Drift Report', 'Deploy',
     'D3 The Drift Report.dc.html — D3a drift found · D3b could not verify · D3c no drift',
     '§ IA → Deploy · FR-J16',
     lift('D3 The Drift Report', label='D3a Drift found',
          capt='D3a · drift found · the deploy stops — step 2 of 4 · 1440')
     + head('What it does, and what the frame keeps',
            'Drawn by prompt A3 in the 2026-09-04 export. Before every deploy <b>after</b> the first to a given '
            'site, Inflozo reads the live theme and compares it against what it last deployed there; if anything '
            'differs, <b>the deploy stops</b>. Rows are grouped Changed / Added on your site / Removed from your '
            'site and — critically — <b>each is named by the user&rsquo;s own layer name</b> (Home hero, Latest '
            'issues, Three Column footer) with the raw filename only as small mono text beneath; a file Inflozo '
            'never wrote is named as exactly that. Never a raw path as the primary label. Two actions besides '
            'Cancel: <b>Download the live theme first</b>, offered before the destructive one, and <b>Overwrite '
            'and ship anyway</b> — a deliberate choice, so ink and not danger.', anchor='stops')
     + head('It fails open, and it never asserts drift without two manifests',
            'Where the Staff Access Token is absent it cannot read the live theme, so it shows a single sky '
            'information row <b>inside</b> the pre-flight list — &ldquo;Couldn&rsquo;t check whether your live '
            'theme changed … Shipping anyway&rdquo; — and <b>the deploy continues</b>. A layer <b>rename</b> '
            'produces no drift at all, so the list never shows one: nothing on the live site changed, only a '
            'filename Inflozo chose.', anchor='fail-open')
     + lift('D3 The Drift Report', label='D3b Could not verify',
            capt='D3b · couldn&rsquo;t verify · it proceeds — detail at 720')
     + head('No drift — one passing row among the others',
            'The same weight as &ldquo;Ghost 6.x compatible&rdquo;. Not a badge, not celebrated.', anchor='no-drift')
     + lift('D3 The Drift Report', label='D3c No drift', capt='D3c · no drift — detail at 620'),
     subs=[SUB('Drift found — the deploy stops', 'stops', 'D3a'),
           SUB('It fails open', 'fail-open', 'D3b'),
           SUB('No drift', 'no-drift', 'D3c')])


page('pro-exit-sheet', 'Pro Exit Sheet', 'Deploy',
     'B Missing Surfaces.dc.html — B13 Pro blocking sheet, the export\'s label for the sheet its caption '
     'numbers 13a (four remedies, not two; the pairing-table note deleted)',
     '§ IA → Deploy · § wrong mechanism → B13 · J3 steps 3–5',
     lift('B Missing Surfaces', label='B13 Pro blocking sheet', capt='B13a · the sheet, over a dimmed editor · 1440')
     + head('Four remedies, because two was not enough',
            'The frame drew swap and upgrade. <b>FR-L3 has four</b>, and the missing two are not decorative: '
            '<b>&ldquo;Remove it&rdquo;</b>, because some binding contexts have no Free design to swap to; and '
            '<b>&ldquo;Revert to the free one&rdquo;</b> for the non-placeable treatments — a paywall design, a '
            'card treatment, a pagination style — which are <i>selected</i> rather than placed, so each reverts '
            'on its own surface. Corrected in the 2026-09-04 export (A7 item 4): every row now carries Remove it, '
            'and a &ldquo;Chosen, not placed&rdquo; row type carries Revert to the free one.', anchor='remedies')
     + head('And a data dependency the frame invented',
            'B13a noted that <i>&ldquo;the swap-for suggestions are per-design pairings someone has to author — '
            'every Pro design needs a named Free fallback&rdquo;</i>. <b>No pairing table exists or is '
            'needed:</b> swapping goes through Shuffle, which offers any free design in that category&rsquo;s '
            'ring. The note is deleted from the frame in the 2026-09-04 export (A7 item 4); the canvas&rsquo;s own '
            'header still lists it among the things it flagged, which is a record and stays.',
            anchor='no-pairings'),
     subs=[SUB('The four remedies', 'remedies', 'FR-L3'),
           SUB('The invented pairing table', 'no-pairings', 'B13a')],
     note='<b>Coral appears nowhere on this sheet</b> and marigold only as the Pro mark. This is a money '
          'conversation, not a moment of delight. It fires at <b>deploy and export, and never on the canvas, in '
          'the section picker, or on click of a Pro badge.</b>')

page('library-update-confirm', 'Library Update Confirm', 'Deploy',
     'B Missing Surfaces.dc.html — B14b, with its one stale sentence corrected',
     '§ IA → Deploy · flow F4 · FR-J14',
     lift('B Missing Surfaces', caption='B14b · #14', capt='B14b · redeploy confirmation')
     + head('The one stale line',
            'B14b says <i>&ldquo;We snapshot before redeploying, so this is reversible from history.&rdquo;</i> '
            'The snapshot is <b>first upload only</b> (FR-J13). What is true, and what the line should say: '
            '<b>the version you are on now stays in history and rolls back in one click</b> — every successful '
            'compile is stored as an artifact.', anchor='stale')
     + head('Why a confirm exists at all',
            'Compiles always use the current library — a single live library, <b>no per-project pinning</b> — '
            'so any redeploy carries every library change since the last deploy, and <b>there is no way to '
            'redeploy without them</b>. Because the update is inseparable from the redeploy, the deploy flow '
            'makes it consensual instead. What makes that safe is the backward-compatibility contract: designs '
            'are never deleted, only <b>superseded</b>; schema changes are append-only or ship a migration map; '
            'catalog keys are never reworded in place.', anchor='why'),
     subs=[SUB('The stale line', 'stale', 'FR-J13'), SUB('Why a confirm exists', 'why', 'FR-J14')])

page('deploy-history', 'Deploy History', 'Deploy',
     'S8 Deploy.dc.html — S8e · D2 Deploy History Completed.dc.html — D2a pinning on Pro, D2b the pin refusal, '
     'D2c Free',
     '§ IA → Deploy · flow F8 · FR-J7/J9 · J4 step 9',
     lift('S8 Deploy', label='S8e History drawer', capt='S8e · history — the drawer and its roll-back confirm · 1440')
     + head('Three things the drawer carries that S8e did not — drawn as D2a',
            '<b>1 · Pinning.</b> A pin control on every row; a pinned version survives pruning; at most '
            '<b>N−1</b> pinned — 9 of 10 on Pro, 2 of 3 on Free — and <b>pinning the last unpinned version '
            'refuses, visibly, with the reason</b> (D2b, below). Unpinning is always allowed, so nobody can trap '
            'themselves. <b>2 · The original-theme row</b>, above the version list, marked as the site&rsquo;s '
            'original rather than an Inflozo build and <b>outside the 3-or-10 count entirely</b> — Restore '
            'original is where flow F1 ends. <b>3 · A partial-success row</b> — status '
            '<span class="mono">uploaded</span>, no active badge, and <b>Re-activate</b> in place of Roll back — '
            'drawn as D2d on <a href="partial-success.html#row">Partial Success</a>. Prompt A2, 2026-09-04 export.',
            anchor='additions')
     + lift('D2 Deploy History Completed', label='D2a History pinning Pro',
            capt='D2a · history with pinning · Pro — ten stored versions, two pinned · 1440 · drawer drawn full height')
     + head('The pin refusal',
            'A refusal with a reason, never a greyed control and never a silent failure. The pin stays unfilled.',
            anchor='refusal')
     + lift('D2 Deploy History Completed', label='D2b Pin refusal', capt='D2b · the pin refusal — detail at 520')
     + head('Free — three versions, one pinned',
            'The limit line is shown on Free too, never withheld as an upsell, and there is no upgrade prompt in '
            'the drawer.', anchor='free')
     + lift('D2 Deploy History Completed', label='D2c History Free plan',
            capt='D2c · Free plan — three stored versions, one pinned · 1440')
     + head('And one sentence S8e already gets right, which stays — and gains one',
            '&ldquo;Pro keeps the last 10 versions. Free keeps the last 3.&rdquo; <b>A list that silently drops '
            'its oldest entry reads as complete when it is not</b>, and the line stays on Free too rather than '
            'being hidden as an upsell. D2a and D2c add the sentence it was owed: older versions are removed, not '
            'hidden — an Inflozo theme can&rsquo;t be rebuilt later, so the retention limit is the true bound on '
            'how far back a customer can go.', anchor='limit'),
     subs=[SUB('The three additions — D2a', 'additions', 'D2a'), SUB('The pin refusal', 'refusal', 'D2b'),
           SUB('Free', 'free', 'D2c'), SUB('The limit line', 'limit', 'F8')])

page('preview-only-notice', 'Preview-Only Notice', 'Deploy',
     'B Missing Surfaces.dc.html — B15 (right, apart from the plan name)',
     '§ IA → Deploy · flow F5 · § wrong mechanism → B15 · FR-C2',
     lift('B Missing Surfaces', caption='B15 · #15', capt='B15 · preview-only connection')
     + head('One word on it is wrong',
            'B15 says upgrade to Ghost(Pro) <b>Creator</b>. Ghost&rsquo;s 2026 lineup is <b>Starter / Publisher '
            '/ Business</b>, so it is <b>Publisher or higher</b> — read at ghost.org/pricing on 2026-09-03, a page '
            'read and not an executed probe, so VERIFY-AT-BUILD item 1 stays ⛔ until the Starter trial. '
            'Everything else on this frame is right, and '
            'S8a′ and S11a move to match <i>it</i> rather than the other way round.', anchor='respec')
     + head('Probed, never asked',
            'At connect, <span class="mono">hostSettings.limits.customThemes</span> is read. <b>It is a '
            'theme-name allowlist, not a yes/no flag</b>: <span class="mono">@tryghost/limit-service</span> declares '
            '<span class="mono">customThemes</span> as an allowlist limit and the upload endpoint asks '
            '<span class="mono">errorIfWouldGoOverLimit(\'customThemes\', {value: themeName})</span> (read in '
            'source, Ghost 6.54.1 <span class="mono">core/server/api/endpoints/themes.js</span>). Its '
            '<b>absence</b> means self-hosted — <span class="mono">GET /admin/config/</span> carries no '
            '<span class="mono">hostSettings</span> key on 5.130.6 or 6.58.0 (executed, MEASUREMENTS §15h). '
            '<b>The Ghost(Pro) half is still ⛔</b> — VERIFY-AT-BUILD item 2, blocked on a Starter trial — so the '
            'probe must test Inflozo&rsquo;s frozen theme name against the list, and &ldquo;present&rdquo; is not '
            'the same as &ldquo;blocked&rdquo;. <b>There is no '
            'user-declared-plan step in the happy path and no plan field in Manage Keys.</b> '
            'FR-C5&rsquo;s daily health check re-runs the probe, so the flag sets and clears without any user '
            'action — <b>clearing is not the user&rsquo;s job</b> — and a successful deploy clears it too. The '
            'one path with a question is the unreadable-<span class="mono">hostSettings</span> case.',
            anchor='probe'),
     subs=[SUB('The one wrong word', 'respec', 'FR-C2'), SUB('Probed, and its five states', 'probe', 'FR-C5')])

page('routes-fallback', 'Routes Fallback Card', 'Deploy',
     'B Missing Surfaces.dc.html — B16 (cause re-specified; the hard-coded Ghost menu path deleted)',
     '§ IA → Deploy · flow F3 · § wrong mechanism → B16 · FR-I4',
     lift('B Missing Surfaces', caption='B16 · #16', capt='B16 · routes fallback card')
     + head('The frame sent people to fix something that cannot be fixed',
            'B16 said <i>&ldquo;your integration key is missing the settings permission … Fix the key.&rdquo;</i> '
            '<b>Integration tokens never carry <span class="mono">setting: edit</span></b> — Ghost&rsquo;s '
            'allowlist binds them and there is nothing to grant. A <i>staff</i> token carries a '
            '<span class="mono">user_id</span>, skips the allowlist entirely, and an Administrator or Owner '
            'holds <span class="mono">setting: all</span>. So the cause becomes <b>&ldquo;Uploading a routing '
            'file needs the site Owner&rsquo;s Staff Access Token, and this project doesn&rsquo;t have '
            'one&rdquo;</b>, and &ldquo;Fix the key instead&rdquo; becomes <b>&ldquo;Add the token '
            'instead&rdquo;</b>. Corrected in the 2026-09-04 export (A7 item 3): the card now says the upload '
            'needs a Staff Access Token from the site Owner or an Administrator, offers Add the token instead, '
            'and closes with &ldquo;Adding the token makes this automatic from now on.&rdquo;', anchor='respec')
     + head('The three causes, and each names itself',
            'EXPERIENCE.md F3 documents three causes with three messages and two button labels; the frame '
            'draws only the first. Quoted from the spine:', anchor='causes')
     + """<div class="annot"><div class="limits-wrap"><table class="limits" style="max-width:940px;margin:0 auto">
  <tr><th scope="col">Cause</th><th scope="col">What the card says</th></tr>
  <tr><td>No Staff Access Token was ever supplied</td>
    <td>&ldquo;We normally upload this for you. Uploading a routing file needs a Staff Access Token from the site
      Owner or an Administrator, and this project doesn&rsquo;t have one — so this once, you&rsquo;ll do it by
      hand.&rdquo; + <b>Add the token instead</b></td></tr>
  <tr><td>The token was revoked or rotated</td>
    <td>&ldquo;…your token has stopped working.&rdquo; + <b>Update the token</b></td></tr>
  <tr><td>The token&rsquo;s role is below Administrator</td>
    <td>&ldquo;…this token belongs to a staff account that can&rsquo;t write settings. Only an Owner&rsquo;s or an
      Administrator&rsquo;s token can.&rdquo; — no button</td></tr>
</table><p class="helper" style="margin-top:10px">The first and third rows carry finding F-063&rsquo;s reach — every
  staff user has a token and an Administrator&rsquo;s carries <span class="mono">setting: all</span> (read at
  docs.ghost.org/admin-api → Staff access tokens; Ghost 6.54.1 fixtures.json roles_permissions) — and the frame
  above draws only the first cause; the other two are the story&rsquo;s (R-80). See
  <a href="staff-token-offer.html">Staff Token Offer</a>.</p></div></div>"""
     + head('And the hard-coded menu path had to go — it went',
            'Step 2 said <b>Settings → Labs</b>. <b>Ghost 6.58.0 has no Labs page</b> — no '
            '<span class="mono">settings/advanced</span>, no <span class="mono">settings/labs</span>, and its '
            'export UI sits behind a lab flag (MEASUREMENTS §33, executed 2026-08-31). The card must '
            '<b>describe what the customer is looking for and link to Ghost&rsquo;s own help for the version '
            'Inflozo detected at connect</b>. Corrected in the 2026-09-04 export (A7 item 3): step 2 now reads '
            '&ldquo;In Ghost, find the routes upload for your version&rdquo; with &ldquo;Show me where ↗&rdquo;.',
            anchor='menu-path'),
     subs=[SUB('The re-specified cause', 'respec', 'FR-I4'),
           SUB('The three causes', 'causes', 'F3'),
           SUB('The hard-coded menu path', 'menu-path', 'MEASUREMENTS §33')],
     note='<b>It is not a warning toast.</b> It is a first-class surface, reachable afterwards from the site '
          'card and from the Routes Manager, and a project can sit in this state indefinitely without anything '
          'degrading except the automation.')

page('template-binding-checklist', 'Template Binding Checklist', 'Deploy',
     'B Missing Surfaces.dc.html — B19, as A7 item 1 corrected it (2026-09-04)',
     '§ IA → Deploy · flow F6 · FR-I6',
     lift('B Missing Surfaces', caption='B19 · #19', capt='B19 · membership page binding')
     + head('Every step on that frame was on a mechanism the product forbids — A7 redrew what they say',
            'The components stayed — the numbered steps and, above all, the small honest facsimile of '
            'Ghost&rsquo;s own page settings on the right. Everything they <i>said</i> changed in the 2026-09-04 '
            'export (A7 item 1): <span class="mono">custom-membership.hbs</span>, the Template dropdown, no '
            'MATCHED badge, &ldquo;We can&rsquo;t see whether you did this&rdquo;, and three rows — Membership, '
            'Signin, Member home — each with a done state the user ticks. The table below is the record of what '
            'B19 said and why it was wrong.', anchor='corrections')
     + """<div class="annot"><div class="limits-wrap"><table class="limits" style="max-width:940px;margin:0 auto">
  <tr><th scope="col">B19 said, before A7</th><th scope="col">The truth</th></tr>
  <tr><td><span class="mono">page-membership.hbs</span></td>
    <td><b><span class="mono">custom-membership.hbs</span>.</b> Inflozo <b>never</b> emits
      <span class="mono">page-{slug}.hbs</span>: that form is matched against the live slug at render time,
      <b>detaches silently the moment the user retitles the page</b>, and outranks the user&rsquo;s explicit
      dropdown choice — Ghost Admin disables the dropdown outright when a slug template matches (read from the
      admin bundle: <span class="mono">gh-psm-template-select.hbs</span> renders the select
      <span class="mono">@disabled=matchedSlugTemplate</span> with &ldquo;Post URL matches {filename}&rdquo; —
      <span class="mono">research-ghost-membership-pages.md</span>; MEASUREMENTS.md has no entry yet and is owed
      one).</td></tr>
  <tr><td>&ldquo;Set its URL slug to <span class="mono">membership</span>&rdquo;</td>
    <td><b>Pick the template from Ghost&rsquo;s page-editor Template dropdown.</b> Ghost stores the chosen
      filename on the page&rsquo;s own row, so the binding survives a retitle, a slug change and a theme swap.</td></tr>
  <tr><td>&ldquo;Ghost picks the template up automatically — there is no setting to toggle&rdquo;</td>
    <td>There is exactly one setting to toggle, and this is it.</td></tr>
  <tr><td>A <b>MATCHED</b> badge</td>
    <td><b>Deleted.</b> It implies a verification that does not exist: the assignment lives on Ghost&rsquo;s page
      row and the Content API does not expose which template a page selected. In its place, verbatim:
      <b>&ldquo;We can&rsquo;t see whether you did this.&rdquo;</b></td></tr>
  <tr><td>One template</td><td><b>Every</b> emitted template, one row each, with a done-state the user marks
      themselves.</td></tr>
</table></div></div>"""
     + head('Where it appears, and the one nudge',
            'On <a href="deploy-live.html#binding">Deploy Live</a>, as a &ldquo;one step left&rdquo; card — '
            '<b>not a modal that must be dismissed to reach the confetti</b>. A project whose deploy emitted no '
            'custom template never sees it. If it is still unopened a day later, Notifications raises it '
            '<b>once, and never again</b>.', anchor='where'),
     subs=[SUB('What the frame gets wrong', 'corrections', 'B19'),
           SUB('Where it appears', 'where', 'F6')])


# ═══════════════════════════════════════════════════════════════════════════════
# The four journeys and the eight flows
# ═══════════════════════════════════════════════════════════════════════════════
journey('J1', 'Connect → first deploy',
        'The solo publisher. One Ghost site, is its Owner, and reads &ldquo;Staff Access Token&rdquo; as a '
        'warning sign. <b>Two endings, and both ship a site.</b>',
        [('sign-in.html', 'Sign In'), ('magic-link-sent.html', 'Magic Link Sent'), ('first-run.html', 'First Run'),
         ('connect-integration.html', 'Connect · Integration'), ('connect-keys.html', 'Connect · Keys'),
         ('auto-branding.html', 'Auto-Branding'), ('redesign-proposals.html', 'Redesign Proposals'),
         ('editor.html', 'Editor — she builds'), ('deploy-destination.html', 'Deploy Destination · step 1 of 6'),
         ('staff-token-offer.html', 'Staff Token Offer · step 2'), ('backup-gate.html', 'Backup Gate · step 3'),
         ('preflight-check.html', 'Pre-flight Check · step 4'), ('snapshot-gate.html', 'Snapshot Gate · step 5'),
         ('deploy-progress.html', 'Deploy Progress · step 5'), ('deploy-live.html', 'Deploy Live · step 6')])

journey('J2', 'Blank-canvas build',
        'The creator with taste. Full credential reach, opinionated, will find the ceiling of a closed control '
        'vocabulary. <b>What it proves: the canvas never tells her she is wrong.</b>',
        [('first-run.html', 'First Run — Blank canvas'), ('editor.html', 'Editor — the empty canvas'),
         ('section-picker.html', 'Section Picker · ⌘K'), ('editor.html#selected', 'Editor — the section lands'),
         ('editor.html#design-picker', 'Design Picker — the climax beat'),
         ('editor.html#control-sidebar', 'Control Sidebar'), ('editor.html#inline-toolbar', 'Inline Toolbar'),
         ('style-packs.html', 'Style Packs'), ('editor.html#template-switcher', 'Template Switcher'),
         ('editor.html#layers', 'Layers · L'), ('editor.html#preview', 'Preview Mode · P'),
         ('editor.html#device', 'Device Preview · 3'), ('editor.html#remix', 'Site Remix · ⇧R'),
         ('deploy-wizard.html', 'Deploy Wizard — four steps this time')])

journey('J3', 'Free-plan ship',
        'The solo publisher, on Free, one project, one site. <b>Open canvas, gated exits</b> — enforcement '
        'happens only at deploy, export, and any surface exposing compiled theme code.',
        [('dashboard.html#free', 'Dashboard · Free'), ('editor.html#pro-badge', 'Editor — Pro designs placed'),
         ('pro-exit-sheet.html', 'Ship it — the Pro Exit Sheet, before the wizard opens · the climax beat'),
         ('pro-exit-sheet.html#remedies', 'Itemised — the four remedies'),
         ('upgrade-sheet.html', 'Upgrade Sheet — or she swaps'), ('pricing.html', 'Pricing — the same terms, publicly'),
         ('deploy-destination.html', 'Into the wizard — step 1'),
         ('backup-gate.html', 'Backup Gate'), ('preflight-check.html', 'Pre-flight Check'),
         ('snapshot-gate.html', 'Snapshot Gate'), ('deploy-live.html', 'Deploy Live')])

journey('J4', 'Downgrade recovery',
        'The multi-site operator. Six projects, two sites, 312 MB of assets, and a client&rsquo;s card was '
        'cancelled. <b>Their churn is client attrition, not dissatisfaction — which is exactly why this must '
        'not feel like a punishment.</b>',
        [('grace-banner.html', 'Grace Banner — payment failed'),
         ('grace-banner.html#kept', 'During grace, nothing is withdrawn'),
         ('billing.html', 'Billing — update the card, or let it lapse'),
         ('over-limit-sheet.html', 'Over-Limit Sheet — the climax beat'),
         ('over-limit-sheet.html#which', 'Which project stays editable'),
         ('over-limit-sheet.html#read-only', 'The other five go read-only — export still works'),
         ('sites.html', 'Sites — disconnect down to one'),
         ('assets.html#over-quota', 'Assets — read-only until under'),
         ('deploy-history.html', 'Deploy History — retained, never pruned'),
         ('billing.html#limits', 'Resolved — nothing was lost')])

flow('F1', 'Pre-deploy snapshot gate', 'FR-J13 · fires at the FIRST theme upload to a site, deploy-only included',
     [('snapshot-gate.html', 'Running'), ('snapshot-gate.html#respec', 'The two wrong sentences'),
      ('snapshot-gate.html#failed', 'Capture failed'),
      ('snapshot-gate.html#respec-b12b', 'And why its reason is wrong'),
      ('deploy-history.html#additions', 'Restore original, from the drawer&rsquo;s original-theme row')])

flow('F2', 'The three-party edit-lock choreography', 'FR-D18 · addendum.md §AD2',
     [('edit-lock.html#reader', 'The reader'), ('edit-lock.html#holder', 'The holder'),
      ('edit-lock.html#takeover', 'The takeover'), ('edit-lock.html#respec', 'The one deviation'),
      ('edit-lock.html#deploy-blocked', 'Deploy and export require the lock')])

flow('F3', 'The guided routes-upload card', 'FR-I4 · routes.yaml uploads automatically; this is the fallback',
     [('routes-fallback.html', 'The card as drawn'), ('routes-fallback.html#respec', 'Its cause is wrong'),
      ('routes-fallback.html#menu-path', 'And its Ghost menu path is gone'),
      ('staff-token-offer.html', 'Add the token instead — and it becomes automatic')])

flow('F4', 'The library-update confirm', 'FR-J14 · the flow §37.7 found correct',
     [('dashboard.html#library-update', 'The notice, in the project card'),
      ('library-update-confirm.html', 'The confirm — mandatory before compile'),
      ('library-update-confirm.html#stale', 'Its one stale line'),
      ('library-update-confirm.html#why', 'Why a confirm exists at all'),
      ('preflight-check.html', 'Pre-flight, and on to the deploy')])

flow('F5', 'The Preview-only explanation, and its clearing conditions', 'FR-C2 · probed, never asked',
     [('connect-keys.html#validation', 'Set at connect, by the probe'),
      ('preview-only-notice.html', 'The notice'),
      ('preview-only-notice.html#probe', 'Who clears it, and when'),
      ('deploy-destination.html#preview-only', 'Preview-Only Destination'),
      ('deploy-destination.html#preview-fix', 'And the copy that wastes an afternoon'),
      ('sites.html', 'The site card')])

flow('F6', 'The post-deploy template-binding checklist', 'FR-I6 · a checklist, not a notification',
     [('deploy-live.html#binding', 'Deploy Live — &ldquo;one step left&rdquo;'),
      ('template-binding-checklist.html', 'The checklist as drawn'),
      ('template-binding-checklist.html#corrections', 'Every step on it is wrong'),
      ('notifications.html', 'One nudge, once, a day later'),
      ('editor.html#empty-template', 'Empty Template Warning')])

flow('F7', 'The pre-deploy backup gate', 'BACKUP-GATE.md · a consent gate, not a technical control',
     [('backup-gate.html', 'The gate — self-hosted, token given'),
      ('backup-gate.html#shortcut', 'The shortcut ticked — every row stays visible'),
      ('backup-gate.html#ghostpro', 'Ghost(Pro) — the honest block'),
      ('staff-token-offer.html', 'The token it was offered one step earlier'),
      ('deploy-destination.html#first-deploy', 'And the six-step rail it sits in')])

flow('F8', 'Deploy history with pinning', 'FR-J7/J9 · at most 10 stored versions on Pro and 3 on Free',
     [('deploy-history.html', 'The drawer as drawn'),
      ('deploy-history.html#additions', 'Pinning, the original-theme row — D2a'),
      ('deploy-history.html#refusal', 'The pin refusal'),
      ('deploy-history.html#free', 'Free — three versions, one pinned'),
      ('deploy-history.html#limit', 'The limit is stated, not implied'),
      ('partial-success.html#row', 'The partial-success row'),
      ('deploy-uploaded.html#same-state', 'One state, two causes')])


# ═══════════════════════════════════════════════════════════════════════════════
# index.html — derived from the registry above, so it cannot claim a surface that
# does not exist or miss one that does.
# ═══════════════════════════════════════════════════════════════════════════════
GROUP_ORDER = ['Marketing', 'Entry', 'Onboarding', 'Dashboard and account', 'Editor', 'Deploy']


def trail_block(t, kind):
    steps = ''.join(
        f'<a class="idxrow" href="{href}"><span class="mono softaa">{i}</span>'
        f'<span>{label}</span></a>' for i, (href, label) in enumerate(t['steps'], 1))
    return (f'<div class="card" style="margin-bottom:12px"><div class="pad stack gap10">'
            f'<div class="row gap10"><span class="badge neutral mono">{t["key"]}</span>'
            f'<b style="font-size:15px">{t["title"]}</b></div>'
            f'<p class="helper">{t["who"] if kind == "journey" else t["why"]}</p>'
            f'<div class="idxgrid">{steps}</div></div></div>')


def build_index():
    n_pages = len(PAGES)
    n_subs = sum(len(p['subs']) for p in PAGES)
    n_lifts = sum(len(p['lifts']) for p in PAGES)
    n_owed = sum(p['body'].count('class="nodraw owed"') for p in PAGES)
    n_states = sum(p['body'].count('class="nodraw state"') for p in PAGES)

    ia = ''
    for g in GROUP_ORDER:
        rows = ''
        for p in sorted([x for x in PAGES if x['group'] == g], key=lambda x: x['title']):
            rows += (f'<a class="idxrow" href="{p["id"]}.html"><b>{esc(p["title"])}</b>'
                     f'<span class="k">page</span></a>')
            for name, anchor, note in p['subs']:
                rows += (f'<a class="idxrow" href="{p["id"]}.html#{anchor}" style="padding-left:22px">'
                         f'<span class="soft">{name}</span>'
                         f'<span class="k">on {esc(p["title"])}</span></a>')
        ia += f'<div class="section-head"><h2>{g}</h2></div><div class="idxgrid">{rows}</div>'

    return f"""<!--
  INFLOZO STATIC PROTOTYPE · step 5b · ruling R-75 · the front door.
  Every screen on every page is LIFTED from the design export verbatim (../frames.py).
  Where a state has no frame, the page says so in those words and describes what step 6 draws
  it from — nothing is invented as a picture.
-->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inflozo — the static prototype</title>
{FONTS}
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="proto">
  <h1 class="name">Inflozo — the static prototype</h1>
  <span class="frame">step 5b · ruling R-75</span>
  <span class="spacer"></span>
  <span class="frame">every screen lifted from the Claude Design export</span>
</header>
<main id="main"><div class="idx">
  <div class="card" style="margin-bottom:24px"><div class="pad stack gap12">
    <h2 style="font-size:32px">Inflozo, drawn.</h2>
    <p style="font-size:14.5px;line-height:1.6;max-width:78ch"><b>A frame is one screen as Claude Design drew
      it.</b> <b>Lifted</b> means that screen is copied here byte for byte, never redrawn — so what you see on a
      page is the drawing itself, with our notes around it and never inside it.</p>
    <p style="font-size:14.5px;line-height:1.6;max-width:78ch">Every surface of Inflozo&rsquo;s own UI, with
      the frame it comes from named on the page and the part of <b>EXPERIENCE.md</b> it implements named
      beside it. <b>Every screen here is lifted out of the Claude Design export verbatim</b> — the markup is
      the frame&rsquo;s own, never a redrawing of it — so a page can be held against the export and checked
      rather than merely believed.</p>
    <p style="font-size:14.5px;line-height:1.6;max-width:78ch">The annotation sits <i>around</i> each frame
      and never inside it. Where a state <b>has no frame</b>, the page says so in those words and describes
      what step 6 draws it from; nothing is invented as a picture, because a second interface
      vocabulary beside the export&rsquo;s is the one thing ruling R-74 forbids. The Appendix A canvases
      (D1&ndash;D6, D8) landed on 2026-09-04 and every surface that was owed one lifts it.</p>
    <div class="row gap10 wrap">
      <span class="chip">{n_pages} pages</span>
      <span class="chip">{n_subs} surfaces and states</span>
      <span class="chip">{n_lifts} lifted frames</span>
      <span class="chip">{n_owed} surfaces owed to an Appendix A prompt</span>
      <span class="chip">{n_states} undrawn states of drawn surfaces</span>
      <span class="chip">{len(JOURNEYS)} journeys</span>
      <span class="chip">{len(FLOWS)} flows</span></div>
    <p class="helper">Counts derive from the registry at build time, not typed. Frames are 1440 wide, the width
      they were designed at: on a narrower window each one scrolls sideways inside its own box, or zoom the
      browser out.</p>
    <div class="banner info" style="margin-top:4px"><span class="ico">ⓘ</span><span>
      <b>Want to know what it will feel like rather than whether it is right?</b> That is step 5c, beside this
      one: the same product with all of this scaffolding taken off and the behaviour put on.
      <a href="../walkthrough/index.html">Open the walkthrough</a> ·
      <a href="../walkthrough/_screens.html">its screen list</a>.</span></div>
  </div></div>

  <div class="section-head"><h2>The four journeys</h2>
    <p>PRD §3&rsquo;s personas, used verbatim. Each carries the one thing that decides how the journey
      actually plays out — its Ghost credential reach.</p></div>
  {''.join(trail_block(t, 'journey') for t in JOURNEYS)}

  <div class="section-head"><h2>The eight flows</h2>
    <p>Each is <b>a designed surface, never a warning toast</b>.</p></div>
  {''.join(trail_block(t, 'flow') for t in FLOWS)}

  <div class="section-head"><h2>Every surface</h2>
    <p>EXPERIENCE.md&rsquo;s Information Architecture. A <b>page</b> is anything a journey or a flow lands on;
      everything indented under one is a state or a surface that only exists over it.</p></div>
  {ia}
</div></main>
<footer class="proto" style="position:static">
  <a href="../walkthrough/index.html">The walkthrough (5c) →</a>
  <span class="spacer"></span>
  <span class="frame">Disposable by design, the day the dynamic UI matches it.</span>
</footer>
<script src="proto.js"></script>
</body>
</html>
"""


def main():
    seen = set()
    bodies = {}
    for p in PAGES:
        assert p['id'] not in seen, 'duplicate page id: ' + p['id']
        seen.add(p['id'])
        bodies[p['id'] + '.html'] = shell(p)
    bodies['index.html'] = build_index()
    # F-018: nothing touches the disk until every check below has passed. A red run leaves the
    # previous pages exactly as they were; "refuses to write" is then true rather than a slogan.

    files = set(bodies) | {'styles.css', '../walkthrough/index.html', '../walkthrough/_screens.html'}
    ids = {n: set(re.findall(r'id="([^"]+)"', s)) for n, s in bodies.items()}
    # The link check is a check on the SCAFFOLDING. A lifted frame's own hrefs are the
    # export's (D8c's skip link points at an id drawn elsewhere on its canvas) and cannot be
    # touched, so the boxes come out before the hrefs are read — the boxes themselves are
    # verified against the export below.
    lifted_boxes = {p['id'] + '.html': [l['box'] for l in p['lifts']] for p in PAGES}
    bad = []
    for name, src in bodies.items():
        scaffold = src
        for box in lifted_boxes.get(name, ()):
            scaffold = scaffold.replace(box, '')
        for href in re.findall(r'href="([^"]+)"', scaffold):
            if href.startswith(('http', 'mailto:')):
                continue
            if href == '#':
                continue          # the export's own placeholder links, lifted as they are
            if href.startswith('#'):
                if href[1:] not in ids[name]:
                    bad.append(f'{name}: dead anchor {href}')
                continue
            tgt, _, frag = href.partition('#')
            if tgt not in files:
                bad.append(f'{name}: dead link {href}')
            elif frag and tgt in ids and frag not in ids[tgt]:
                bad.append(f'{name}: dead anchor {href}')
    for p in PAGES:
        for _n, a, _k in p['subs']:
            if a not in ids[p['id'] + '.html']:
                bad.append(f'{p["id"]}.html: declared anchor #{a} is not on the page')
    if bad:
        print('\n'.join(sorted(set(bad))))
        raise SystemExit(f'{len(set(bad))} broken links')

    # THE LIFTED MARKUP MUST BE THE EXPORT'S, UNCHANGED. This is the only claim 5b makes
    # that a reader cannot check by eye, so it is the one worth asserting. F-019: it is an
    # EQUALITY — each box the page carries is rebuilt from a fresh region() and must occur in
    # the emitted page exactly as many times as it was lifted — with a floor: as many boxes
    # as lifts, no page's lifts skipped, no region implausibly small, and at least one lift
    # in the build. A substring test passed a truncated, renamed or dropped lift; this cannot.
    outside = {}
    for p in PAGES:
        body, want = p['body'], {}
        for l in p['lifts']:
            fresh = frames.region(l['frame'], label=l['label'], caption=l['caption'])
            assert len(fresh) > 200, f'{p["id"]}: implausibly small region {l["key"]!r} ({len(fresh)} chars)'
            box = liftbox(l['frame'], l['label'], l['caption'], l['capt'], fresh)
            assert box == l['box'], f'{p["id"]}: lift {l["key"]!r} is not the export\'s region any more'
            want[box] = want.get(box, 0) + 1
        for box, n in want.items():
            if body.count(box) != n:
                raise SystemExit(f'{p["id"]}: lifted markup no longer matches the export ({n} × box, '
                                 f'{body.count(box)} found)')
            body = body.replace(box, '')
        assert '<div class="liftbox"' not in body, f'{p["id"]}: a lift box the registry does not know about'
        # counted as literal strings, not through liftbox(), so an edit to that helper that
        # dropped either half of the box would still be caught here
        assert p['body'].count('<div class="liftbox"') == len(p['lifts']) == \
            p['body'].count('<p class="lift-src">'), f'{p["id"]}: box or provenance line missing'
        outside[p['id']] = body
    assert sum(len(p['lifts']) for p in PAGES) > 0, 'no lift was checked'

    # R-75: "every page must read complete with JavaScript off." That is what separates this
    # build from 5c, and it is the reason the interaction here is additive only — links,
    # hover and picking, never hiding. So nothing OUTSIDE a lifted frame may be hidden by
    # default — by attribute, by inline style, by a closed <details>, or by the stylesheet.
    # (Inside one it is the export's own markup and stays untouched.) F-020: `outside` above
    # is the page with every checked box removed, so this really is the scaffolding only.
    HIDER = re.compile(r'<[^>]*\shidden[\s/>]|display\s*:\s*none|visibility\s*:\s*hidden'
                       r'|opacity\s*:\s*0(?![.\d])|<details(?![^>]*\bopen\b)|aria-hidden="true"')
    leaks = [f'{pid} ({len(HIDER.findall(src))})' for pid, src in outside.items() if HIDER.search(src)]
    leaks += ['index.html'] if HIDER.search(bodies['index.html']) else []
    css = open(os.path.join(OUT, 'styles.css'), encoding='utf8').read()
    if re.search(r'display\s*:\s*none|visibility\s*:\s*hidden', css):
        leaks.append('styles.css')
    if leaks:
        raise SystemExit('hidden by default, which breaks the JS-off rule: ' + ', '.join(leaks))

    # Only now does anything reach the disk.
    for name, src in bodies.items():
        open(os.path.join(OUT, name), 'w').write(src)
    import glob                          # a page dropped from the registry must leave the folder too
    for f in glob.glob(os.path.join(OUT, '*.html')):
        if os.path.basename(f) not in bodies:
            os.remove(f)
            print('  removed stale', os.path.basename(f))
    n_lifts = sum(len(p['lifts']) for p in PAGES)
    print(f'{len(PAGES)} pages + index.html · {n_lifts} frames lifted · '
          f'all links resolve · every lift byte-identical to the export · nothing hidden')


if __name__ == '__main__':
    main()
