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


def page(pid, title, group, frames_, exp, body, subs=(), note=''):
    PAGES.append(dict(id=pid, title=title, group=group, frames=frames_,
                      exp=exp, body=body, subs=list(subs), note=note))


def journey(key, title, who, steps):
    JOURNEYS.append(dict(key=key, title=title, who=who, steps=steps))


def flow(key, title, why, steps):
    FLOWS.append(dict(key=key, title=title, why=why, steps=steps))


# ─────────────────────────────────────────────────────────────────────────────
# A drawn screen, lifted. Never re-drawn.
# ─────────────────────────────────────────────────────────────────────────────
def lift(frame, label=None, caption=None, capt=None, anchor=None):
    """One region of the export, exactly as it was drawn, on its own mat.

    The frame keeps its 1440px width on purpose — that is the width it was designed at,
    and shrinking it here would be a second answer to a question the export has already
    answered. It scrolls inside its own box on a narrow window."""
    inner = frames.region(frame, label=label, caption=caption)
    a = f' id="{anchor}"' if anchor else ''
    c = f'<p class="frame-cap">{capt}</p>' if capt else ''
    return (f'<div{a} class="lifted">{c}<div class="liftbox">{inner}</div>'
            f'<p class="lift-src">lifted from <span class="mono">{frame}.dc.html</span></p></div>')


def cap(text):
    return f'<p class="frame-cap">{text}</p>'


def head(title, blurb='', capt='', anchor=None):
    a = f' id="{anchor}"' if anchor else ''
    return (f'<div class="section-head"{a}><h2>{html.escape(title)}</h2>'
            + (f'<p>{blurb}</p>' if blurb else '')
            + (cap(capt) if capt else '') + '</div>')


def nodraw(title, blurb, prompt, anchor=None):
    """A surface with NO frame. It says so in those words rather than pretending."""
    a = f' id="{anchor}"' if anchor else ''
    return (f'<div class="section-head"{a}><h2>{html.escape(title)}</h2>'
            f'<p>{blurb}</p></div>'
            f'<div class="nodraw"><div class="row gap10" style="margin-bottom:8px">'
            f'<span class="badge notice">Not drawn</span>'
            f'<span class="helper">This surface has no frame in the export. '
            f'<b>{prompt}</b> will draw it; it has not been run.</span></div>'
            f'<p class="helper">Nothing is drawn here on purpose. A picture invented in this file '
            f'would be a second interface vocabulary beside the export&rsquo;s, which is the one thing '
            f'R-74 forbids. What the prompt must produce is described below and in '
            f'<span class="mono">EXPERIENCE.md</span> Appendix A.</p></div>')


# The plan matrix. PRD Appendix F.1 is the SOLE definition of Free/Pro gating, and four drawn
# frames disagree with it (S11c's "3", S12a's "unlimited", S12b/M5's "Last 2", S10b's "30 MB").
# F.1 governs every one of them — EXPERIENCE.md § Plan limits. Shared with the step-5c build.
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
    return ('<div class="limits-wrap"><table class="limits"><tr><th></th><th>Free</th><th>✦ Pro</th></tr>'
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
        bits = [f'<span class="tl">{kind} {t["key"]} · {html.escape(t["title"])}</span>',
                f'<span class="tstep">step {i + 1} of {len(t["steps"])}</span>']
        if prev:
            bits.append(f'<span class="tstep">← <a href="{prev[0]}">{html.escape(prev[1])}</a></span>')
        if nxt:
            bits.append(f'<span class="tstep">next: <a href="{nxt[0]}">{html.escape(nxt[1])}</a> →</span>')
        trail_html += '<div class="trail">' + ''.join(bits) + '</div>\n'
    if not trail_html:
        trail_html = ('<div class="trail"><span class="tl">Not a step in any journey or flow</span>'
                      '<span class="tstep">Reached from the surfaces that link to it, and from '
                      '<a href="index.html">the index</a>.</span></div>\n')

    subs_html = ''
    if p['subs']:
        rows = ''.join(
            f'<a class="idxrow" href="#{a}">{html.escape(n)}'
            + (f'<span class="k">{html.escape(note)}</span>' if note else '') + '</a>'
            for n, a, note in p['subs'])
        subs_html = ('<div class="proto-note"><b>Also on this page</b> — surfaces and states that live '
                     'over this one: <div class="idxgrid" style="margin-top:8px">' + rows + '</div></div>')

    return f"""<!--
  INFLOZO STATIC PROTOTYPE · step 5b · ruling R-75
  SURFACE  : {p['title']}
  FRAME    : {p['frames']}
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
<div class="proto">
  <a href="index.html">← All surfaces</a>
  <span class="name">{html.escape(p['title'])}</span>
  <span class="frame">{p['frames']}</span>
  <span class="spacer"></span>
  <span class="frame">EXPERIENCE.md {p['exp']}</span>
</div>
{('<div class="proto-note">' + p['note'] + '</div>') if p['note'] else ''}
<div class="trails">{trail_html}</div>
{subs_html}
<main id="main">
{p['body']}
</main>
<div class="proto" style="position:static">
  <a href="index.html">← All surfaces</a>
  <a href="../walkthrough/index.html">The walkthrough (5c) →</a>
  <span class="spacer"></span>
  <span class="frame">Screens lifted from the export. The annotation is around them, never in them.</span>
</div>
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
          'state and is never listed here as a plan. <b>The frame\'s limit column disagrees with Appendix F.1 '
          'in two rows</b> — it says 3 sites and "Last 2" versions where F.1 says 10 and last 3 / last 10. '
          'F.1 governs; the frame is owed a patch, and the correction is drawn in '
          '<a href="billing.html#limits">Billing</a>.')

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
              '<span class="mono">hostSettings.limits.customThemes</span> decides '
              '<a href="preview-only-notice.html">Preview-only</a> without asking; '
              '<span class="mono">http://</span> is warned; code injection raises a one-time notice that the '
              'live page can legitimately differ from the canvas; Portal&rsquo;s floating-button state is read, '
              'or asked once, defaulting to on.',
              'No prompt — these are banner states of a drawn surface', anchor='validation'),
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
     + head('The roster is wrong on the frame, and the frame says so itself',
            'B23a&rsquo;s own note flags it: <i>&ldquo;The specification fixes the count at ten and names three. '
            'The other seven names, their section counts and their Pro counts are mine … treat the roster as a '
            'proposal, not a fact.&rdquo;</i> <b>Appendix E is normative</b> and names all ten with their pack: '
            '<b>Aurora · Gazette · Signal · Foundry · Quiet · Pulse · Bloom · Chapter · Ledger · Studio</b>. '
            'FR-O4: <b>only Quiet and Ledger are Free end to end</b>. The grid, the category filter, the free '
            'filter, the swap-or-upgrade marks and the &ldquo;Start empty&rdquo; escape are all kept — the '
            'roster and the Free marks are replaced. The per-starter Pro <i>counts</i> are dropped rather than '
            'restated: no document says what they are.', anchor='roster')
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
     'B Missing Surfaces B25 sites strip · B14a update notice',
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
            'taken away. A second project opens the New Project Sheet on its at-the-cap state.', anchor='free')
     + lift('S3 Dashboard', label='S3c Dashboard free plan', capt='S3c · dashboard — free plan (⋯ menu open) · 1440')
     + head('At 390', 'The Dashboard stays fully usable at 390, exactly as the export draws it (R-76).',
            anchor='mobile')
     + lift('S3 Dashboard', label='S3 mobile', capt='S3 · mobile · 390')
     + lift('S3 Dashboard', label='S3 mobile menu', capt='S3 · mobile — menu open · 390')
     + nodraw('Loading', 'Skeleton cards in the shape of the project cards that are coming — never a spinner '
              '(DESIGN.md § Components → Loading). No frame draws the dashboard mid-load.',
              'No prompt owns it; it is a state of a drawn surface', anchor='loading'),
     subs=[SUB('Account Menu', 'account-menu', 'S3d'),
           SUB('Notifications', 'notifications', 'S3e'),
           SUB('Connected Sites Strip', 'connected-sites', 'B25'),
           SUB('Library Update Notice', 'library-update', 'B14a'),
           SUB('Dashboard — empty', 'empty', 'S3b'),
           SUB('Dashboard — Free at the cap', 'free', 'S3c'),
           SUB('Dashboard at 390', 'mobile', 'S3 mobile'),
           SUB('Dashboard — loading', 'loading', 'not drawn')])


page('new-project-sheet', 'New Project Sheet', 'Dashboard and account',
     'NOT DRAWN → Appendix A prompt A4, frames D4a and D4b. Inherits S3 Dashboard, S2a\'s radio-card '
     'doors and B23a\'s starter grid',
     '§ IA → Dashboard and account · FR-B2',
     nodraw('New Project Sheet',
            'FR-B2&rsquo;s four paths over a dimmed dashboard: <b>Start from a starter</b> (opens the starter '
            'chooser) · <b>Blank canvas</b> · <b>Duplicate an existing project</b>, with a select of the '
            'user&rsquo;s projects · <b>Redesign one of my sites</b>, greyed with its reason when no site is '
            'connected. Below them a Style Pack row, then Cancel and Create project. On Free at the cap, all '
            'four doors are drawn and <b>greyed with the reason</b>, never hidden, and the footer states the '
            'limit: &ldquo;Free includes 1 project. Pro gives you 25.&rdquo;',
            'Appendix A prompt A4 (frames D4a, D4b)')
     + head('The three doors it extends, as drawn', 'S2a is where the radio-card row and its one line of '
            'consequence come from.', 'S2a · onboarding — first run · 1440')
     + lift('S2 Onboarding', label='S2a First run')
     + head('The greyed-with-a-reason pattern it uses', 'A control that could act but cannot now is greyed with '
            'its reason in the helper slot; one that could <i>never</i> act here is absent and the panel says '
            'why. The two mean different things (rulings R-33, R-68).',
            'P0-0 · the greyed-control pattern', anchor='greyed')
     + lift('P0-0 Greyed Control Pattern', label='P0-0 resting and greyed'),
     subs=[SUB('The greyed-control pattern', 'greyed', 'P0-0')])

page('notifications', 'Notifications', 'Dashboard and account',
     'S3 Dashboard.dc.html S3e · B Missing Surfaces.dc.html B21',
     '§ IA → Dashboard and account · § State Patterns → Notifications · FR-B7 · F6 (the one nudge)',
     lift('B Missing Surfaces', caption='B21 · #21', capt='B21 · notifications')
     + head('As it opens under the bell', '', 'S3e · notifications — desktop popover + mobile', anchor='popover')
     + lift('S3 Dashboard', caption='S3e ·')
     + nodraw('Empty',
              '&ldquo;Nothing yet. Deploy outcomes land here even if you closed the tab.&rdquo; — an ink line '
              'drawing with one coral accent shape, per the empty-state illustration rule. No frame draws it.',
              'No prompt owns it; it is a state of a drawn surface', anchor='empty'),
     subs=[SUB('Under the bell', 'popover', 'S3e'), SUB('Notifications — empty', 'empty', 'not drawn')])

page('sites', 'Sites', 'Dashboard and account',
     'S11 Sites.dc.html — S11a with the ⋯ menu · S11b connect modal · S11c Free',
     '§ IA → Dashboard and account · § State Patterns → Sites · J4 step 7',
     lift('S11 Sites', label='S11a Sites', capt='S11a · sites &amp; connections — ⋯ menu open · 1440')
     + head('Connect Site Modal', 'S2&rsquo;s two connect steps, run as a modal.', anchor='connect-modal')
     + lift('S11 Sites', caption='S11b ·', capt='S11b · connect site — S2&rsquo;s flow as a modal')
     + head('Free, at one site', 'The frame says Pro connects up to 3. <b>Appendix F.1 says 10 and governs</b> '
            '— see <a href="billing.html#limits">the limits</a>.', anchor='free')
     + lift('S11 Sites', caption='S11c ·', capt='S11c · free plan — one site + upgrade ghost slot')
     + nodraw('Sites with none, and disconnecting',
              'Sites with no connection shows the connect card as the whole page. Disconnecting keeps the '
              'site&rsquo;s <b>pre-Inflozo snapshot</b> — it is bound to the site record, not the URL, so it '
              'survives disconnect, reconnect and project deletion, and the backup gate re-fires on reconnect '
              'because consent is per site.',
              'No prompt owns them; they are states of a drawn surface', anchor='empty'),
     subs=[SUB('Connect Site Modal', 'connect-modal', 'S11b'),
           SUB('Sites — Free at one site', 'free', 'S11c'),
           SUB('Sites — empty, and disconnect', 'empty', 'not drawn')],
     note='<b>The frame&rsquo;s Preview-only row says the wrong thing.</b> S11a offers &ldquo;download the theme '
          'and upload it in Ghost Admin&rdquo;; Starter&rsquo;s <span class="mono">customThemes</span> limit '
          'forbids custom themes <b>in Ghost Admin too</b>. B15 already gets this right — see '
          '<a href="preview-only-notice.html">Preview-Only Notice</a>.')

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
     'S10 Assets.dc.html — S10a library · S10b drop zone · S10c delete-in-use · S10d details',
     '§ IA → Dashboard and account · § State Patterns → Assets · J4 step 8',
     lift('S10 Assets', label='S10a Asset library', capt='S10a · asset library — one card hovered, WebP toast · 1440')
     + head('The drop zone', '', 'S10b · drag-over — full-surface drop zone', anchor='drop')
     + lift('S10 Assets', caption='S10b ·')
     + head('Two corrections the frame is owed',
            '<b>The size line says &ldquo;up to 30 MB each&rdquo;. Appendix F.1 caps uploads at 10 MB per file '
            'on both plans.</b> And a drop zone with no button cannot be reached by keyboard at all, so it needs '
            'a visible <b>&ldquo;Choose files&rdquo;</b> button inside it — both are Appendix A prompt A8, frame '
            'D8d, which has not been run.', anchor='drop-fix')
     + head('Delete in use', 'Serious voice, and it names every place the image is used.', anchor='delete')
     + lift('S10 Assets', caption='S10c ·', capt='S10c · delete-in-use — serious, no puns')
     + head('Image details', '', anchor='details')
     + lift('S10 Assets', label='S10d Image details', capt='S10d · image details — click any asset')
     + nodraw('Over quota',
              'The library goes <b>read-only</b>: existing files stay, uploads are blocked, until the user '
              'deletes below the cap. <b>Nothing is deleted by Inflozo, on any path.</b> No frame draws it.',
              'No prompt owns it; it is a state of a drawn surface', anchor='over-quota'),
     subs=[SUB('Drop zone', 'drop', 'S10b'),
           SUB('The two corrections it is owed', 'drop-fix', 'F.1 · D8d'),
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
     + head('The limits, plainly — and where the frames disagree with them',
            'Appendix F.1 is the <b>sole definition</b> of Free/Pro gating, and four frames disagree with it: '
            'S11c says Pro connects up to <b>3</b>; S12a says <b>unlimited</b> projects and <b>full</b> history; '
            'S12b and M5 say <b>1 / 3</b> sites and <b>Last 2 / Full</b> history; S10b says uploads may be '
            '<b>up to 30 MB</b>. <b>F.1 governs every one of them.</b> These are product limits, so they are '
            'shown rather than implied.', anchor='limits')
     + LIMITS_TABLE
     + nodraw('Cancelling',
              'No refunds and no mid-cycle cancellation (Appendix F.2). Auto-renew stops, access continues to '
              'the end of the paid period, then the account becomes Free — which is where the '
              '<a href="over-limit-sheet.html">Over-Limit Sheet</a> takes over. <b>Cancellation always completes '
              'in three clicks or fewer</b> and there are no retention dark patterns.',
              'No prompt owns it', anchor='cancel'),
     subs=[SUB('Invoices', 'invoices', 'S12d'),
           SUB('Delete Account', 'delete', 'S12c'),
           SUB('The limits, plainly', 'limits', 'Appendix F.1'),
           SUB('Cancel plan', 'cancel', 'Appendix F.2')])

page('upgrade-sheet', 'Upgrade Sheet', 'Dashboard and account',
     'S12 Billing.dc.html — S12b, used app-wide',
     '§ IA → Dashboard and account · § Plan limits · J3 step 5b',
     lift('S12 Billing', caption='S12b ·', capt='S12b · upgrade modal — used app-wide')
     + head('Its limit column is wrong in two rows',
            'The frame says <b>3</b> connected sites and <b>Last 2</b> versions of history. Appendix F.1 says '
            '<b>10</b> sites, and <b>last 3 on Free / last 10 per project on Pro</b>. F.1 governs — the '
            'corrected table is on <a href="billing.html#limits">Billing</a>.', anchor='limits'),
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
     'NOT DRAWN → Appendix A prompt A4, frames D4c and D4d. Inherits B13a\'s itemised rows over a '
     'dimmed dashboard',
     '§ IA → Dashboard and account · FR-L3 · J4 steps 5, 6 and 10',
     nodraw('Over-Limit Sheet',
            'The climax of J4. It opens with <b>&ldquo;Nothing has been deleted, and nothing will be. Your live '
            'sites are untouched.&rdquo;</b> and then itemises exactly what is over and by how much, each row '
            'naming the one action that fixes it: <b>Projects 6 of 1</b> → choose which one stays editable · '
            '<b>Connected sites 2 of 1</b> → disconnect one · <b>Assets 312 MB of 100 MB</b> → delete some '
            'files · <b>Stored versions 8 of 3</b> → nothing to do, we keep these. Footer: rollback, restore '
            'and export keep working the whole time.',
            'Appendix A prompt A4 (frames D4c, D4d)')
     + head('The itemised-row component it inherits', 'B13a is where the row shape, its per-row remedy and its '
            'two-real-verbs footer come from.', 'B13a · the sheet, over a dimmed editor · 1440', anchor='rows')
     + lift('B Missing Surfaces', label='B13 Pro blocking sheet'),
     subs=[SUB('The row component it inherits', 'rows', 'B13a')])

page('grace-banner', 'Grace Banner', 'Dashboard and account',
     'B Missing Surfaces.dc.html — B24 (consequence re-specified: FR-L3)',
     '§ IA → Deploy · § wrong mechanism → B24 · J4 steps 1–2',
     lift('B Missing Surfaces', caption='B24 · #24', capt='B24 · past-due grace banner')
     + head('The frame is wrong in the frightening half, and it has to change',
            'B24 says <i>&ldquo;after that, Pro designs stop rendering and your sites fall back to their Free '
            'replacements&rdquo;</i>. <b>FR-L3: existing deployed themes are never touched.</b> Grace expiry '
            'moves the account to Free and blocks the <i>exits</i> — deploy, export, code surfaces — until the '
            'user resolves what is over. The replacement sentence: <i>&ldquo;After that you go back to Free. '
            'Your live sites are never touched — what&rsquo;s shipped stays shipped. You&rsquo;d just need to '
            'sort out anything over the Free limits before you ship again.&rdquo;</i> '
            'M5&rsquo;s own FAQ already says the right thing, and B24 contradicted it.', anchor='respec')
     + head('What is kept during the grace, and it is everything',
            'Every Pro capability, for seven days, with <b>no per-row exception</b>. '
            '<span class="mono">pro_past_due</span> is internal and is <b>never shown as a plan</b>.',
            anchor='kept')
     + LIMITS_TABLE,
     subs=[SUB('The re-specification', 'respec', 'FR-L3'), SUB('What is kept', 'kept', 'F.1 third column')])

page('small-screen-notice', 'Small Screen Notice', 'Dashboard and account',
     'NOT DRAWN → Appendix A prompt A4, frame D4f. Inherits S3 Dashboard\'s 390 frame',
     '§ IA → Dashboard and account · § Responsive & Platform (ruling R-76)',
     nodraw('Small Screen Notice',
            'A calm centred card at 390 — <b>not an error page</b>. &ldquo;The editor needs a bigger screen.&rdquo; '
            'Then what does work from a phone: the project&rsquo;s deploy history with a one-tap roll back, '
            'the sites list, and billing. <b>It fires on a coarse pointer at a small viewport, never on width '
            'alone</b> — a 1440px display at 200% browser zoom presents roughly a 720px CSS viewport, and '
            'throwing a low-vision user out of the editor for zooming is a straight WCAG 1.4.4 failure. That '
            'case gets the editor, reflowed (prompt A8, frame D8b).',
            'Appendix A prompt A4 (frame D4f)')
     + head('The 390 shell it inherits', 'S3 is drawn at 390 and the Dashboard stays fully usable there.',
            'S3 · mobile · 390', anchor='shell')
     + lift('S3 Dashboard', label='S3 mobile'),
     subs=[SUB('The 390 shell it inherits', 'shell', 'S3 mobile')])


# ═══════════════════════════════════════════════════════════════════════════════
# EDITOR
# ═══════════════════════════════════════════════════════════════════════════════
page('editor', 'Editor', 'Editor',
     'S4 Editor.dc.html — S4a rest, S4b hover, S4c selected, S4d top-bar dropdowns · '
     'B Missing Surfaces B1, B2, B3, B4, B6, B7, B8, B9, B10, B11 · P0-0 · P0-1',
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
            'false &ldquo;Saved locally&rdquo; is the one thing this indicator must never say. Not drawn.',
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
     + head('B11&rsquo;s Zoom control is re-specified out',
            'The frame draws a user-driven <b>Fit / 55%</b> picker. FR-D14 says no zoom in v1 and AD-21 says '
            'the only scale is fit-to-screen, never user-driven. <b>Keep the mono chip that states true size '
            'and scale; delete the control.</b> Browser zoom is the reader&rsquo;s own accessibility setting '
            'and is a different thing entirely (WCAG 1.4.4).', anchor='no-zoom')
     + head('Site Remix', 'One button re-rolls every design, keeping every word. <b>One undo, always</b> — a '
            'Shuffle is several operations and <i>one</i> edit.', anchor='remix')
     + lift('B Missing Surfaces', caption='B8 · #8', capt='B8 · site remix')
     + head('B8 loses a control and gains one',
            '<b>Ruling R-77 drops &ldquo;Keep Free designs only&rdquo;</b> — Remix always re-rolls from the '
            'whole library and the Pro Exit Sheet catches it at deploy. And FR-D17&rsquo;s own axis is '
            '<b>what</b> is re-rolled — Style Pack, designs, or both — which the frame has no control for; it '
            'is added as a second radio-card group above the existing scope group.', anchor='remix-fix')
     + nodraw('The canvas markers, the complete Template Switcher, and the editor below 1440',
              'Six things the editor shows constantly that no frame draws: the <b>Auto-Generated Marker</b>, '
              'the <b>Template Switcher</b> with Membership as a group of three and a conditional Private, the '
              '<b>Main Feed Marker</b> and its reassign, <b>Page 2 Preview</b>, the <b>Preview Subject '
              'Picker</b>, and the <b>Empty Template Warning</b> — all prompt A5. Plus the editor at 834 and at '
              '720, the skip link, a focused Layers row and a destructive confirm opening on its cancel — '
              'prompt A8. <b>The export draws the editor at 1440 and at no other width.</b>',
              'Appendix A prompts A5 and A8', anchor='not-drawn'),
     subs=[SUB('Hover', 'hover', 'S4b'), SUB('Selected', 'selected', 'S4c'),
           SUB('Top-bar dropdowns', 'topbar', 'S4d'),
           SUB('Design Picker', 'design-picker', 'B1a'), SUB('Design Nav', 'design-nav', 'B1b'),
           SUB('Control Sidebar', 'control-sidebar', 'B2'),
           SUB('Greyed vs absent', 'greyed', 'P0-0'),
           SUB('Inline Toolbar', 'inline-toolbar', 'P0-1'),
           SUB('Link Entry', 'link-entry', 'P0-1'),
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
           SUB('Markers, switcher, narrow widths — not drawn', 'not-drawn', 'A5 · A8')])


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
              'No prompt owns them; they are states of a drawn surface', anchor='refusals'),
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
            'the home feed&rsquo;s Count control, which is not where that value lives. And the published-date '
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
     'B Missing Surfaces.dc.html — B17 (re-specified and extended → Appendix A prompt A6)',
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
            'are the dark built-ins every Inflozo project declares (FR-Q2).', anchor='respec')
     + head('And four additions to the builder',
            'The Ghost Admin <b>group</b>, a <b>visibility condition</b>, FR-Q3&rsquo;s text-prop confirm '
            '(&ldquo;Ghost&rsquo;s own settings are plain text, so the marks come off&rdquo;), the post-deploy '
            'key-immutability notice, and the pack-switch warning on a promoted accent. All prompt A6.',
            anchor='additions')
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
     subs=[SUB('The four corrections', 'respec', 'A6'),
           SUB('Custom Settings Builder — the additions', 'additions', 'A6'),
           SUB('Translations', 'translations', 'B18'),
           SUB('Translations — the key shape', 'translations-fix', 'FR-Q6/Q8')])


page('paywall-editor', 'Paywall Editor', 'Editor',
     'C Post Body.dc.html — C3a the paywall canvas, C3b the designs and the no-paid-tiers empty state',
     '§ IA → Editor · § The three canvases that are not pages · § State Patterns → Paywall Editor · FR-H6',
     lift('C Post Body', label='C3a Paywall editor', capt='C3a · the paywall canvas · 1440')
     + head('Three of the twelve designs, and the empty case',
            'The empty state is <b>honest about Ghost, not about us</b>: with no paid tier Ghost&rsquo;s paywall '
            'never renders at all, so the design would be dead CSS.', anchor='designs')
     + lift('C Post Body', label='C3b Paywall designs and empty state', capt='C3b · three designs and the empty state'),
     subs=[SUB('The designs, and the empty case', 'designs', 'C3b')],
     note='This surface was reported as never drawn. <b>It is drawn</b> — C3a, at 1440, with its six controls, '
          'its &ldquo;how readers reach it&rdquo; explainer and the no-paid-tiers empty state — and it sits in '
          'a drawn left-nav group, <b>Template surfaces</b>.')

page('editor-cards', 'Editor Cards', 'Editor',
     'S14 Editor Cards.dc.html — S14a card dropdown, S14b treatment dropdown, S14c reset confirm, '
     'S14d entry point, S14e callout selected · C Post Body C1a, C1c',
     '§ IA → Editor · § The three canvases that are not pages · FR-Q7',
     lift('S14 Editor Cards', label='S14e callout selected', capt='S14e · a callout card selected · 1440')
     + head('The card dropdown — every Koenig card, in Ghost&rsquo;s order',
            '<b>Colour controls are never offered for header, signup and CTA cards.</b> The post author sets '
            'those inline in Ghost&rsquo;s editor, and a control that silently loses to an inline style is '
            'worse than none.', anchor='cards')
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
     'is drawn in C Post Body',
     '§ IA → Editor · § The three canvases that are not pages · FR-Q9',
     nodraw('Error Pages',
            '<span class="mono">error.hbs</span> ships on every project; <span class="mono">private.hbs</span> '
            'ships <b>only when a Private Site Gate section has been designed</b>. Both sit on the '
            'Template-surfaces canvas — ink chrome rather than paper, because a canvas that is not a page '
            'announces itself — with the A31 category&rsquo;s designs in the picker. This is also where '
            'FR-Q9&rsquo;s fallback lands: a treatment whose host section is absent is still selected here.',
            'No prompt draws the canvas; the A31 designs are drawn in their own category')
     + head('The Template-surfaces group that hosts it', 'Drawn in C Post Body, in ink chrome.',
            'C3a · the paywall canvas, showing the left-nav group · 1440', anchor='group')
     + lift('C Post Body', label='C3a Paywall editor'),
     subs=[SUB('The Template-surfaces group', 'group', 'C3a')])

page('edit-lock', 'Edit Lock', 'Editor',
     'B Missing Surfaces.dc.html — B5a read-only bar, B5b request popover, B5c takeover modal',
     '§ IA → Editor · flow F2 · FR-D18, addendum.md §AD2',
     head('One editing context per project — across tabs, browsers and devices',
          'The three frames escalate deliberately: <b>a bar, then a popover, then a modal with a danger '
          'fill</b>. The interruption grows only as the stakes do. That escalation is the design and it stands.')
     + head('The reader', 'The canvas stays fully legible; the sidebar dims to 55% so controls are <i>visible</i> '
            'but nothing responds. The bar names the person, not a role.', anchor='reader')
     + lift('B Missing Surfaces', caption='B5a ·', capt='B5a · read-only')
     + head('The holder — a popover, not a modal',
            'The holder is mid-sentence. It states the sync position <b>before</b> asking. <b>The countdown is '
            'a no-response timer and it stops the instant the holder interacts with the popover at all, focus '
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
     + nodraw('Deploy and export from a read-only session',
              'Ship it or Export first prompts a take-over, <b>surfacing &ldquo;X unsaved edits exist '
              'elsewhere&rdquo;</b> — so a stale cloud snapshot can never silently ship. Drawn on no frame; it '
              'is added to B5&rsquo;s family.', 'No prompt owns it yet', anchor='deploy-blocked'),
     subs=[SUB('The reader', 'reader', 'B5a'), SUB('The holder', 'holder', 'B5b'),
           SUB('The takeover', 'takeover', 'B5c'), SUB('The one deviation', 'respec', '§AD2'),
           SUB('Deploy from a read-only session', 'deploy-blocked', 'not drawn')],
     note='<b>Rollback and snapshot restore never require the lock</b>, because they redeploy a stored artifact '
          'rather than the working document.')


# ═══════════════════════════════════════════════════════════════════════════════
# DEPLOY
# ═══════════════════════════════════════════════════════════════════════════════
page('deploy-wizard', 'Deploy Wizard', 'Deploy',
     'S8 Deploy.dc.html — S8a…S8d, S8d′, S8a′, S8e',
     '§ IA → Deploy · § Component Patterns → Wizard step rail · J1 steps 9–14 · J2 step 13 · J3 step 3',
     head('The rail grows, and that is the whole shape of this flow',
          'An ordinary deploy is four steps, which is what S8 draws. <b>The first deploy to a given site is '
          'six</b>, because two gates fire once per site and never again — the Staff Token Offer and the '
          'Backup Gate — and <b>neither is drawn anywhere in the export</b> (prompt A1).')
     + head('Every step, as a page you can walk')
     + """<div class="lifted"><div class="idxgrid">
  <a class="idxrow" href="deploy-destination.html">1 · Deploy Destination<span class="k">S8a</span></a>
  <a class="idxrow" href="staff-token-offer.html">2 · Staff Token Offer<span class="k">not drawn · A1</span></a>
  <a class="idxrow" href="backup-gate.html">3 · Backup Gate<span class="k">not drawn · A1</span></a>
  <a class="idxrow" href="preflight-check.html">4 · Pre-flight Check<span class="k">S8b</span></a>
  <a class="idxrow" href="snapshot-gate.html">5 · Snapshot Gate<span class="k">B12a · B12b</span></a>
  <a class="idxrow" href="deploy-progress.html">5 · Deploy Progress<span class="k">S8c</span></a>
  <a class="idxrow" href="deploy-live.html">6 · Deploy Live<span class="k">S8d</span></a>
  <a class="idxrow" href="deploy-uploaded.html">6 · Deploy Uploaded<span class="k">not drawn · A2</span></a>
  <a class="idxrow" href="partial-success.html">6 · Partial Success<span class="k">not drawn · A2</span></a>
  <a class="idxrow" href="deploy-failure.html">5 · Deploy Failure<span class="k">S8d′</span></a>
  <a class="idxrow" href="pro-exit-sheet.html">Pro Exit Sheet<span class="k">B13a</span></a>
  <a class="idxrow" href="library-update-confirm.html">Library Update Confirm<span class="k">B14b</span></a>
  <a class="idxrow" href="drift-report.html">Drift Report<span class="k">not drawn · A3</span></a>
  <a class="idxrow" href="deploy-history.html">Deploy History<span class="k">S8e</span></a>
</div></div>"""
     + head('What fires before step 1 even opens',
            'Two sheets sit in front of the wizard rather than inside it. The '
            '<a href="pro-exit-sheet.html">Pro Exit Sheet</a> fires on a Free plan with Pro designs in the '
            'site — the only moment money is mentioned. The '
            '<a href="library-update-confirm.html">Library Update Confirm</a> fires whenever the library has '
            'advanced since this project&rsquo;s last deploy, because a redeploy carries those changes whether '
            'or not anyone asked.'))

page('deploy-destination', 'Deploy Destination', 'Deploy',
     'S8 Deploy.dc.html — S8a · S8a′ preview-only',
     '§ IA → Deploy · J1 step 9 · J2 step 13',
     lift('S8 Deploy', label='S8a Ship step 1', capt='S8a · ship wizard — step 1 of 4 · destination · 1440')
     + head('What the first deploy adds, and it is not drawn',
            'On the <b>first</b> deploy to a site the rail is six steps, and this card gains one row: the theme '
            'that will be created, <span class="mono">inflozo-orbit-weekly</span>, with one line saying the name '
            'is frozen for this site from now on (FR-J10). Prompt A1, frame D1a.', anchor='first-deploy')
     + head('Preview-Only Destination', 'The site cannot take a custom theme, so the exit is <b>export</b> '
            'instead of deploy.', anchor='preview-only')
     + lift('S8 Deploy', caption='S8a′ ·', capt='S8a′ · step 1 variant — Ghost(Pro) Starter, preview-only')
     + head('And its copy is wrong in the way that wastes an afternoon',
            'S8a′ says &ldquo;download your theme and upload it in Ghost Admin&rdquo;. <b>Starter&rsquo;s '
            '<span class="mono">customThemes</span> limit forbids custom themes in Ghost Admin too</b> — it is '
            'a plan limit, not an API limit, so the manual route does not exist either. The zip still downloads '
            'on every plan (FR-J12); what the copy must say is where it can be installed: a self-hosted Ghost, '
            'or a Ghost(Pro) plan that allows custom themes. B15 already gets this right.', anchor='preview-fix'),
     subs=[SUB('What the first deploy adds', 'first-deploy', 'A1 · D1a'),
           SUB('Preview-Only Destination', 'preview-only', 'S8a′'),
           SUB('Its copy correction', 'preview-fix', 'FR-C2')])

page('staff-token-offer', 'Staff Token Offer', 'Deploy',
     'NOT DRAWN → Appendix A prompt A1, frames D1b and D1c. Inherits S8\'s step card and S2b·1\'s '
     'screenshotted step',
     '§ IA → Deploy · J1 step 10 · FR-C1, FR-C3 · Appendix H',
     nodraw('Staff Token Offer',
            'Step 2 of the six-step first deploy. <b>&ldquo;One more step unlocks a safety net — a copy of your '
            'current theme before we replace it, plus a check that nothing else has changed it.&rdquo;</b> Then, '
            'quieter: this is a full-Administrator credential and can only be created on the site Owner&rsquo;s '
            'own account. <b>Two plain buttons, side by side, the same weight</b> — &ldquo;Add the token&rdquo; '
            'and &ldquo;Not now&rdquo;. Not now is <b>not</b> a small link. '
            '<b>Zero occurrences of &ldquo;Staff Access Token&rdquo; exist anywhere in the export.</b>',
            'Appendix A prompt A1 (frames D1b, D1c)')
     + head('Declined — acknowledged once, then never raised again',
            'It names exactly three costs — no snapshot, no drift check, manual routes upload — and closes with '
            '&ldquo;You can add it any time from Manage keys.&rdquo; <b>Nothing implies the user has done '
            'something wrong.</b> And the multi-site operator working on a client&rsquo;s site <b>cannot comply '
            'at all</b>: they are not the Owner. This is not a degradation for them, it is the path.',
            anchor='declined')
     + head('The step card it inherits', '', 'S8b · the checked-row list · 1440', anchor='inherits')
     + lift('S8 Deploy', caption='S8b ·'),
     subs=[SUB('Declined', 'declined', 'D1c'), SUB('The step card it inherits', 'inherits', 'S8b')])

page('backup-gate', 'Backup Gate', 'Deploy',
     'NOT DRAWN → Appendix A prompt A1, frames D1d and D1e. Inherits S8b\'s checked-row list and '
     'B13a\'s itemised rows',
     '§ IA → Deploy · flow F7 · BACKUP-GATE.md · J1 step 11',
     nodraw('Backup Gate',
            'Step 3, and <b>it blocks the deploy button until confirmed</b>. Reading order is the design: '
            '<b>first</b> the modest truth — <i>Inflozo writes exactly two things to your Ghost site: your '
            'theme, and <span class="mono">routes.yaml</span></i> — <b>then</b> the recommendation with its '
            'reason, <b>then</b> the <span class="mono">ghost backup</span> shortcut whose tick checks every row '
            'below <b>and the rows stay visible</b>, <b>then</b> seven individual rows (Theme · routes.yaml · '
            'Content, which does NOT include images · Members · Redirects · Images, the gap most people miss · '
            'Database), and <b>last</b> the master confirm, disabled until every row is covered. '
            '<b>No frame anywhere in the export mentions a backup, <span class="mono">ghost backup</span>, or a '
            'consent checklist.</b>',
            'Appendix A prompt A1 (frames D1d, D1e)')
     + head('On Ghost(Pro), the shortcut does not exist and the gate says so',
            'This claim is <b>cited, not executed</b> — there is no Ghost(Pro) test server yet — so the copy '
            'says what Ghost Admin does and does not offer and points the customer at Ghost, rather than '
            'asserting a platform-wide impossibility in Inflozo&rsquo;s own voice. It closes: <b>&ldquo;This is '
            'not something Inflozo can fix, and we are not going to pretend otherwise.&rdquo;</b>',
            anchor='ghostpro')
     + head('The checked-row list it inherits', '', 'S8b · step 2 · pre-flight check · 1440', anchor='inherits')
     + lift('S8 Deploy', caption='S8b ·'),
     subs=[SUB('Backup Gate — Ghost(Pro)', 'ghostpro', 'D1e'),
           SUB('The list it inherits', 'inherits', 'S8b')],
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
            'first: a passing row when nothing changed, and a stop when something did. Neither is drawn '
            '(prompt A3).', anchor='additions'),
     subs=[SUB('The two rows it is owed', 'additions', 'FR-Q6 · A3')])

page('snapshot-gate', 'Snapshot Gate', 'Deploy',
     'B Missing Surfaces.dc.html — B12a running, B12b degraded. Semantics re-specified',
     '§ IA → Deploy · flow F1 · FR-J13 · J1 step 13',
     lift('B Missing Surfaces', caption='B12a · #12', capt='B12a · snapshot gate · running')
     + head('Two sentences on that frame are wrong and both are load-bearing',
            '<b>&ldquo;It happens on every deploy&rdquo;</b> — it is the <b>first upload to a site</b>, '
            'deploy-only included, because manual activation in Ghost Admin must not bypass the safety net. '
            '<b>&ldquo;Snapshots count towards your history — Free keeps 3, Pro keeps 10&rdquo;</b> — the '
            'snapshot is <b>exempt from the history limit and never prunes</b>; it becomes &ldquo;Kept outside '
            'your version limit.&rdquo;', anchor='respec')
     + head('Capture failed', '', anchor='failed')
     + lift('B Missing Surfaces', caption='B12b · #12', capt='B12b · capture failed')
     + head('B12b&rsquo;s reason is the most expensive error in the export',
            'It says <i>&ldquo;your integration key may not have theme read permission … Check the key.&rdquo;</i> '
            'Ghost&rsquo;s <span class="mono">tokenPermissionCheck</span> allowlists only '
            '<span class="mono">themes: [POST, PUT]</span> for Custom Integration tokens, so <b>every</b> '
            '<span class="mono">GET /themes/*</span> made with an Admin API key returns 403 — on every version, '
            'every host. <b>There is no key to fix.</b> Telling a user to go and fix one sends them to spend an '
            'afternoon on something that cannot be done. The replacement names the real cause (no Staff Access '
            'Token), then what protects them anyway (<b>Ghost keeps the previous theme under Settings → '
            'Design</b>), then three real actions.', anchor='respec-b12b'),
     subs=[SUB('The two wrong sentences', 'respec', 'FR-J13'),
           SUB('Capture failed', 'failed', 'B12b'),
           SUB('B12b&rsquo;s wrong reason', 'respec-b12b', 'MEASUREMENTS')])

page('deploy-progress', 'Deploy Progress', 'Deploy',
     'S8 Deploy.dc.html — S8c',
     '§ IA → Deploy · J1 step 13',
     lift('S8 Deploy', caption='S8c ·', capt='S8c · step 3 · shipping — upload in progress'),
     note='Each stage is announced politely as it starts, and so is the outcome. <b>Nothing blocks on this</b> — '
          'the user can keep editing and the notification lands in '
          '<a href="notifications.html">Notifications</a> whether or not the tab is still open.')

page('deploy-live', 'Deploy Live', 'Deploy',
     'S8 Deploy.dc.html — S8d',
     '§ IA → Deploy · J1 step 14 · J3 step 6 · flow F6',
     lift('S8 Deploy', caption='S8d ·', capt='S8d · step 4 · live — the product&rsquo;s one confetti moment')
     + head('The &ldquo;one step left&rdquo; card, when custom templates were emitted',
            'A card on the success state, <b>not a modal that must be dismissed to reach the confetti. The '
            'deploy succeeded.</b> A project whose deploy emitted no custom template never sees it — which is '
            'every starter&rsquo;s first deploy, so the confetti stays clean. It is drawn as '
            '<a href="template-binding-checklist.html">B19</a>, on a mechanism FR-I1 forbids.', anchor='binding')
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
          'terms and the button is the fix. A deploy failure is one of the five product emails (FR-P1), and it '
          'is the only deploy outcome that sends one — uploaded-not-live sends nothing, because nothing failed.')

page('deploy-uploaded', 'Deploy Uploaded', 'Deploy',
     'NOT DRAWN → Appendix A prompt A2, frame D2f',
     '§ IA → Deploy · J1 "step 1 has two endings too" · FR-J8',
     nodraw('Deploy Uploaded',
            'The other ending, reached deliberately: the user picked <b>Deploy only</b> at step 1. Sky, not '
            'danger; the same card as Partial Success, the same rail state, the same two buttons — only the '
            'sentence changes, because only the cause changed. <b>&ldquo;Uploaded. Not live yet.&rdquo;</b> '
            '<b>No confetti</b>: the one confetti moment is the first deploy that makes the site live, and this '
            'one deliberately did not.',
            'Appendix A prompt A2 (frame D2f)')
     + head('It is one state with two causes',
            'Deploy Uploaded and <a href="partial-success.html">Partial Success</a> are the <b>same state '
            'reached two ways</b>, and the history row is identical for both — status '
            '<span class="mono">uploaded</span>, <span class="mono">activated</span> false, no active badge, '
            '<b>Re-activate</b>. <b>Neither sends a deploy-failure email.</b>', anchor='same-state'),
     subs=[SUB('One state, two causes', 'same-state', 'FR-J8')])

page('partial-success', 'Partial Success', 'Deploy',
     'NOT DRAWN → Appendix A prompt A2, frames D2e and D2d',
     '§ IA → Deploy · flow F8 · FR-J8',
     nodraw('Partial Success',
            'Upload succeeded, activation failed. <b>This is a partial success, not a failure</b> — sky, not '
            'danger, and <b>not</b> the S8d′ failure treatment. &ldquo;Your theme is on your site but '
            'isn&rsquo;t live yet.&rdquo; The step rail shows Ship complete and Live incomplete.',
            'Appendix A prompt A2 (frames D2e, D2d)')
     + head('Six things follow from calling it a partial success', '', anchor='consequences')
     + """<div class="lifted"><div class="stack gap10" style="max-width:760px;margin:0 auto;padding:20px">
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
     subs=[SUB('What follows', 'consequences', 'FR-J8')])

page('drift-report', 'Drift Report', 'Deploy',
     'NOT DRAWN → Appendix A prompt A3. Inherits S8b\'s step card and B7\'s Layers row for the file list',
     '§ IA → Deploy · FR-J16',
     nodraw('Drift Report',
            'Before every deploy <b>after</b> the first to a given site, Inflozo reads the live theme and '
            'compares it against what it last deployed there. If anything differs, <b>the deploy stops</b>. '
            'Rows are grouped Changed / Added / Removed and — critically — <b>each is named by the user&rsquo;s '
            'own layer name</b> ("Home hero", "Three Column footer") with the raw filename only as small mono '
            'text beneath. Never a raw path as the primary label. Two actions: <b>Download the live theme '
            'first</b> (offered before the destructive one) and <b>Overwrite and ship anyway</b> — ink, not '
            'danger, because it is a deliberate choice.',
            'Appendix A prompt A3 (frames D3a, D3b, D3c)')
     + head('It fails open, and it never asserts drift without two manifests',
            'Where the Staff Access Token is absent it cannot read the live theme, so it shows a single sky '
            'information row <b>inside</b> the pre-flight list — &ldquo;Couldn&rsquo;t check whether your live '
            'theme changed … Shipping anyway&rdquo; — and <b>the deploy continues</b>. A layer <b>rename</b> '
            'produces no drift at all, so the list never shows one: nothing on the live site changed, only a '
            'filename Inflozo chose.', anchor='fail-open')
     + head('The row component it inherits', '', 'B7 · layers rows', anchor='rows')
     + lift('B Missing Surfaces', caption='B7 · #7'),
     subs=[SUB('It fails open', 'fail-open', 'D3b'), SUB('The row it inherits', 'rows', 'B7')])


page('pro-exit-sheet', 'Pro Exit Sheet', 'Deploy',
     'B Missing Surfaces.dc.html — B13a (four remedies, not two; the pairing-table note deleted)',
     '§ IA → Deploy · § wrong mechanism → B13 · J3 steps 3–5',
     lift('B Missing Surfaces', label='B13 Pro blocking sheet', capt='B13a · the sheet, over a dimmed editor · 1440')
     + head('Four remedies, because two was not enough',
            'The frame draws swap and upgrade. <b>FR-L3 has four</b>, and the missing two are not decorative: '
            '<b>&ldquo;Remove it&rdquo;</b>, because some binding contexts have no Free design to swap to; and '
            '<b>&ldquo;Revert to the free one&rdquo;</b> for the non-placeable treatments — a paywall design, a '
            'card treatment, a pagination style — which are <i>selected</i> rather than placed, so each reverts '
            'on its own surface.', anchor='remedies')
     + head('And a data dependency the frame invents',
            'B13a notes that <i>&ldquo;the swap-for suggestions are per-design pairings someone has to author — '
            'every Pro design needs a named Free fallback&rdquo;</i>. <b>No pairing table exists or is '
            'needed:</b> swapping goes through Shuffle, which offers any free design in that category&rsquo;s '
            'ring. The note is deleted.', anchor='no-pairings'),
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
     'S8 Deploy.dc.html — S8e, extended → Appendix A prompt A2',
     '§ IA → Deploy · flow F8 · FR-J7/J9 · J4 step 9',
     lift('S8 Deploy', label='S8e History drawer', capt='S8e · history — the drawer and its roll-back confirm · 1440')
     + head('Three things the drawer has to carry that S8e does not',
            '<b>1 · Pinning.</b> A pin control on every row; a pinned version survives pruning; at most '
            '<b>N−1</b> pinned — 9 of 10 on Pro, 2 of 3 on Free — and <b>pinning the last unpinned version '
            'refuses, visibly, with the reason</b>. Unpinning is always allowed, so nobody can trap themselves. '
            '<b>2 · The pre-Inflozo snapshot row</b>, above the version list, marked as the site&rsquo;s '
            'original rather than an Inflozo build, and <b>outside the 3-or-10 count entirely</b>. '
            '<b>3 · A partial-success row</b> — status <span class="mono">uploaded</span>, no active badge, '
            'and <b>Re-activate</b> in place of Roll back. All three are prompt A2.', anchor='additions')
     + head('And one sentence S8e already gets right, which stays',
            '&ldquo;Pro keeps the last 10 versions. Free keeps the last 3.&rdquo; <b>A list that silently drops '
            'its oldest entry reads as complete when it is not</b>, and the line stays on Free too rather than '
            'being hidden as an upsell. It gains one sentence: these artifacts are <b>not regenerable</b>, so '
            'the retention limit is the true bound on how far back a customer can go.', anchor='limit'),
     subs=[SUB('The three additions', 'additions', 'A2'), SUB('The limit line', 'limit', 'F8')])

page('preview-only-notice', 'Preview-Only Notice', 'Deploy',
     'B Missing Surfaces.dc.html — B15 (right, apart from the plan name)',
     '§ IA → Deploy · flow F5 · § wrong mechanism → B15 · FR-C2',
     lift('B Missing Surfaces', caption='B15 · #15', capt='B15 · preview-only connection')
     + head('One word on it is wrong',
            'B15 says upgrade to Ghost(Pro) <b>Creator</b>. Ghost&rsquo;s 2026 lineup is <b>Starter / Publisher '
            '/ Business</b>, so it is <b>Publisher or higher</b>. Everything else on this frame is right, and '
            'S8a′ and S11a move to match <i>it</i> rather than the other way round.', anchor='respec')
     + head('Probed, never asked',
            'At connect, <span class="mono">hostSettings.limits.customThemes</span> reports whether the site '
            'permits custom theme upload; its absence means self-hosted and unlimited. <b>There is no '
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
     + head('The frame sends people to fix something that cannot be fixed',
            'B16 says <i>&ldquo;your integration key is missing the settings permission … Fix the key.&rdquo;</i> '
            '<b>Integration tokens never carry <span class="mono">setting: edit</span></b> — Ghost&rsquo;s '
            'allowlist binds them and there is nothing to grant. A <i>staff</i> token carries a '
            '<span class="mono">user_id</span>, skips the allowlist entirely, and an Administrator or Owner '
            'holds <span class="mono">setting: all</span>. So the cause becomes <b>&ldquo;Uploading a routing '
            'file needs the site Owner&rsquo;s Staff Access Token, and this project doesn&rsquo;t have '
            'one&rdquo;</b>, and &ldquo;Fix the key instead&rdquo; becomes <b>&ldquo;Add the token '
            'instead&rdquo;</b>.', anchor='respec')
     + head('And the hard-coded menu path has to go',
            'Step 2 says <b>Settings → Labs</b>. <b>Ghost 6.58.0 has no Labs page</b> — no '
            '<span class="mono">settings/advanced</span>, no <span class="mono">settings/labs</span>, and its '
            'export UI sits behind a lab flag (MEASUREMENTS §33, executed 2026-08-31). The card must '
            '<b>describe what the customer is looking for and link to Ghost&rsquo;s own help for the version '
            'Inflozo detected at connect</b>.', anchor='menu-path'),
     subs=[SUB('The re-specified cause', 'respec', 'FR-I4'),
           SUB('The hard-coded menu path', 'menu-path', 'MEASUREMENTS §33')],
     note='<b>It is not a warning toast.</b> It is a first-class surface, reachable afterwards from the site '
          'card and from the Routes Manager, and a project can sit in this state indefinitely without anything '
          'degrading except the automation.')

page('template-binding-checklist', 'Template Binding Checklist', 'Deploy',
     'B Missing Surfaces.dc.html — B19. Drawn on a mechanism FR-I1 forbids',
     '§ IA → Deploy · flow F6 · FR-I6',
     lift('B Missing Surfaces', caption='B19 · #19', capt='B19 · membership page binding')
     + head('Every step on that frame is on a mechanism the product forbids',
            'The components stay — the numbered steps and, above all, the small honest facsimile of Ghost&rsquo;s '
            'own page settings on the right. Everything they <i>say</i> changes.', anchor='corrections')
     + """<div class="lifted"><div class="limits-wrap"><table class="limits" style="max-width:940px;margin:0 auto">
  <tr><th>B19 says</th><th>The truth</th></tr>
  <tr><td><span class="mono">page-membership.hbs</span></td>
    <td><b><span class="mono">custom-membership.hbs</span>.</b> Inflozo <b>never</b> emits
      <span class="mono">page-{slug}.hbs</span>: that form is matched against the live slug at render time,
      <b>detaches silently the moment the user retitles the page</b>, and outranks the user&rsquo;s explicit
      dropdown choice — Ghost Admin disables the dropdown outright when a slug template matches.</td></tr>
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
         ('style-packs.html', 'Style Packs'), ('editor.html#not-drawn', 'Template Switcher — not drawn'),
         ('editor.html#layers', 'Layers · L'), ('editor.html#preview', 'Preview Mode · P'),
         ('editor.html#device', 'Device Preview · 3'), ('editor.html#remix', 'Site Remix · ⇧R'),
         ('deploy-wizard.html', 'Deploy Wizard — four steps this time')])

journey('J3', 'Free-plan ship',
        'The solo publisher, on Free, one project, one site. <b>Open canvas, gated exits</b> — enforcement '
        'happens only at deploy, export, and any surface exposing compiled theme code.',
        [('dashboard.html#free', 'Dashboard · Free'), ('editor.html#pro-badge', 'Editor — Pro designs placed'),
         ('deploy-destination.html', 'Ship it'), ('pro-exit-sheet.html', 'Pro Exit Sheet — the climax beat'),
         ('upgrade-sheet.html', 'Upgrade Sheet — or she swaps'), ('pricing.html', 'Pricing — the same terms, publicly'),
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
         ('sites.html', 'Sites — disconnect down to one'),
         ('assets.html#over-quota', 'Assets — read-only until under'),
         ('deploy-history.html', 'Deploy History — retained, never pruned'),
         ('billing.html#limits', 'Resolved — nothing was lost')])

flow('F1', 'Pre-deploy snapshot gate', 'FR-J13 · fires at the FIRST theme upload to a site, deploy-only included',
     [('snapshot-gate.html', 'Running'), ('snapshot-gate.html#respec', 'The two wrong sentences'),
      ('snapshot-gate.html#failed', 'Capture failed'),
      ('snapshot-gate.html#respec-b12b', 'And why its reason is wrong'),
      ('deploy-history.html#additions', 'Restore, from the snapshot row')])

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
      ('editor.html#not-drawn', 'Empty Template Warning — not drawn')])

flow('F7', 'The pre-deploy backup gate', 'BACKUP-GATE.md · a consent gate, not a technical control',
     [('backup-gate.html', 'The gate — not drawn anywhere in the export'),
      ('backup-gate.html#ghostpro', 'Ghost(Pro) — the honest block'),
      ('backup-gate.html#inherits', 'The checked-row list it inherits'),
      ('deploy-destination.html#first-deploy', 'And the six-step rail it sits in')])

flow('F8', 'Deploy history with pinning', 'FR-J7/J9 · at most 10 stored versions on Pro and 3 on Free',
     [('deploy-history.html', 'The drawer as drawn'),
      ('deploy-history.html#additions', 'Pinning, the snapshot row, the partial row'),
      ('deploy-history.html#limit', 'The limit is stated, not implied'),
      ('partial-success.html', 'Partial success — a state nobody drew'),
      ('deploy-uploaded.html#same-state', 'One state, two causes')])


# ═══════════════════════════════════════════════════════════════════════════════
# index.html — derived from the registry above, so it cannot claim a surface that
# does not exist or miss one that does.
# ═══════════════════════════════════════════════════════════════════════════════
GROUP_ORDER = ['Marketing', 'Entry', 'Onboarding', 'Dashboard and account', 'Editor', 'Deploy']


def trail_block(t, kind):
    steps = ''.join(
        f'<a class="idxrow" href="{href}"><span class="mono" style="color:var(--ink-faint)">{i}</span>'
        f'<span>{label}</span></a>' for i, (href, label) in enumerate(t['steps'], 1))
    return (f'<div class="card" style="margin-bottom:12px"><div class="pad stack gap10">'
            f'<div class="row gap10"><span class="badge neutral mono">{t["key"]}</span>'
            f'<b style="font-size:15px">{t["title"]}</b></div>'
            f'<p class="helper">{t["who"] if kind == "journey" else t["why"]}</p>'
            f'<div class="idxgrid">{steps}</div></div></div>')


def build_index():
    n_pages = len(PAGES)
    n_subs = sum(len(p['subs']) for p in PAGES)
    n_lifts = sum(p['body'].count('class="lifted"') for p in PAGES)
    n_nodraw = sum(p['body'].count('class="nodraw"') for p in PAGES)

    ia = ''
    for g in GROUP_ORDER:
        rows = ''
        for p in sorted([x for x in PAGES if x['group'] == g], key=lambda x: x['title']):
            rows += (f'<a class="idxrow" href="{p["id"]}.html"><b>{html.escape(p["title"])}</b>'
                     f'<span class="k">page</span></a>')
            for name, anchor, note in p['subs']:
                rows += (f'<a class="idxrow" href="{p["id"]}.html#{anchor}" style="padding-left:22px">'
                         f'<span class="soft">{name}</span>'
                         f'<span class="k">on {html.escape(p["title"])}</span></a>')
        ia += f'<div class="section-head"><h2>{g}</h2></div><div class="idxgrid">{rows}</div>'

    return f"""<!--
  INFLOZO STATIC PROTOTYPE · step 5b · ruling R-75 · the front door.
  Every screen on every page is LIFTED from the design export verbatim (../frames.py).
  Where a surface has no frame, the page says so and describes what its Appendix A prompt
  must draw — nothing is invented as a picture.
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
<div class="proto">
  <span class="name">Inflozo — the static prototype</span>
  <span class="frame">step 5b · ruling R-75</span>
  <span class="spacer"></span>
  <span class="frame">every screen lifted from the Claude Design export</span>
</div>
<main id="main"><div class="idx">
  <div class="card" style="margin-bottom:24px"><div class="pad stack gap12">
    <h1 style="font-size:32px">Inflozo, drawn.</h1>
    <p style="font-size:14.5px;line-height:1.6;max-width:78ch">Every surface of Inflozo&rsquo;s own UI, with
      the frame it comes from named on the page and the part of <b>EXPERIENCE.md</b> it implements named
      beside it. <b>Every screen here is lifted out of the Claude Design export verbatim</b> — the markup is
      the frame&rsquo;s own, never a redrawing of it — so a page can be held against the export and checked
      rather than merely believed.</p>
    <p style="font-size:14.5px;line-height:1.6;max-width:78ch">The annotation sits <i>around</i> each frame
      and never inside it. Where a surface <b>has no frame</b>, the page says so in those words and describes
      what its Appendix A prompt must draw; nothing is invented as a picture, because a second interface
      vocabulary beside the export&rsquo;s is the one thing ruling R-74 forbids.</p>
    <div class="row gap10 wrap">
      <span class="chip">{n_pages} pages</span>
      <span class="chip">{n_subs} surfaces and states</span>
      <span class="chip">{n_lifts} lifted frames</span>
      <span class="chip">{n_nodraw} not drawn</span>
      <span class="chip">{len(JOURNEYS)} journeys</span>
      <span class="chip">{len(FLOWS)} flows</span></div>
    <p class="helper">Counts derive from the registry at build time, not typed.</p>
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
<div class="proto" style="position:static">
  <a href="../walkthrough/index.html">The walkthrough (5c) →</a>
  <span class="spacer"></span>
  <span class="frame">Disposable by design, the day the dynamic UI matches it.</span>
</div>
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
    for name, src in bodies.items():
        open(os.path.join(OUT, name), 'w').write(src)

    # A page dropped from the registry must leave the folder too.
    import glob
    for f in glob.glob(os.path.join(OUT, '*.html')):
        if os.path.basename(f) not in bodies:
            os.remove(f)
            print('  removed stale', os.path.basename(f))

    files = set(bodies) | {'styles.css', '../walkthrough/index.html', '../walkthrough/_screens.html'}
    ids = {n: set(re.findall(r'id="([^"]+)"', s)) for n, s in bodies.items()}
    bad = []
    for name, src in bodies.items():
        for href in re.findall(r'href="([^"]+)"', src):
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
    n_lifts = sum(p['body'].count('class="lifted"') for p in PAGES)
    print(f'{len(PAGES)} pages + index.html · {n_lifts} frames lifted from the export · all links resolve')


if __name__ == '__main__':
    main()
