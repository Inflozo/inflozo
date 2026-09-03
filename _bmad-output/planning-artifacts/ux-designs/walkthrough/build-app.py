#!/usr/bin/env python3
"""Inflozo — the step-5c walkthrough generator.  SECOND CUT, and the first one was wrong.

    python3 build-app.py        # writes every screen, styles.css and _screens.html

WHAT CHANGED, AND WHY IT HAD TO.

The first cut of this build — and of step 5b beside it — was authored from a TEXT EXTRACTION of
the design export: a tag-stripping pass that yielded every frame's copy and none of its
composition. The owner opened it and said it did not match the export. He was right, and the
misses were structural rather than cosmetic:

  · S1a's primary action is an INK button, on a card with a 380px ghosted wordmark behind it.
    The first cut made it coral, with no wordmark.
  · S3a's project cards carry real miniature renderings of each site, and what's-new is a POPOVER
    under a marigold button in the top bar. The first cut drew blank thumbnails and a column.
  · S4a's resting right sidebar is the PAGE panel — the Style Pack cell, Ag / Paper /
    Georgia · Inter / Change, and a Dark mode toggle. The first cut showed an empty panel.
  · S4a's Layers is a flat list of DESIGN names — "Hero — Split Editorial", "Footer — Mega Grid" —
    with no site-wide group. The first cut imported B7's grouping and B7's layer names.

None of that survives a tag-stripper, and R-74 says the export decides what a surface is built
from. So this cut does not re-author the frames: `frames.py` LIFTS each screen's markup out of the
`.dc.html` verbatim and this file patches it — links wired, behaviour hooks added, the fixed
1440x900 frame box removed so it fills a window. `patch()` raises if a target is missing, so a
lift cannot silently stop matching its frame.

WHAT IS SHARED WITH STEP 5b, EXACTLY (F-017). Four things, and nothing else: `../frames.py` (the
lifter — one copy of the regex that finds a frame), `../prototype/styles.css` (the tokens, appended
with `_app.css` into this folder's `styles.css`), and two constants imported from
`../prototype/build.py` — `FONTS` (the font links) and `LIMITS` (Appendix F.1's plan matrix, which
the plan-string patches below read from rather than restate). The two page registries are separate
and nothing asserts one against the other: "cannot drift" is true of the tokens and the lifter, not
of which frames each build lifts.

WHERE THE PRD STILL OVERRIDES THE FRAME, AND EVERY PATCH SAYS SO (F-007, F-008). R-74 gives the
export the construction; `prd.md` keeps behaviour and strings. So a lifted screen is corrected only
where the copy is the PRD's — Appendix F.1's plan limits on S12a, S12b, M5, S10b and S11c, and
F5's Preview-only sentence on S8a′ and S11a — and each `patch()` carries a comment naming the
ruling it serves. Where a frame draws the wrong MECHANISM (B22's per-section proposals, B13a's two
remedies, B23a's roster, S4d's paid tiers) the correction is prompt A7's, not this file's: B22 is
held out entirely and the other three are shown as drawn and listed as A7's in NOT_YET.

WHAT IS PATCHED INTO A FRAME, AND WHAT IS NOT. A lift is patched only with links, ids, classes,
hooks and the PRD's own strings — never with markup in a second vocabulary. Every overlay is a
drawn region (`region()` / `part()` / `card()`), every trigger is a control the frame drew, and the
one scaffolding element on a screen — the walkthrough bar — is styled and labelled as scaffolding
(F-040). A fix that would change what a frame LOOKS like is not applied here; it goes to prompt A7.
"""
import os, re, html, importlib.util

_fspec = importlib.util.spec_from_file_location(
    'inflozo_frames', os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frames.py'))
frames = importlib.util.module_from_spec(_fspec)
_fspec.loader.exec_module(frames)
region, unbox, patch, link, attr = frames.region, frames.unbox, frames.patch, frames.link, frames.attr
part, decap = frames.part, frames.decap
overlay, trigger, pick, picked = frames.overlay, frames.trigger, frames.pick, frames.picked
frames.STRICT = False   # ponytail: nth= is passed where a label repeats; the whole build is not asserted unambiguous

OUT = os.path.dirname(os.path.abspath(__file__))
KIT_PATH = os.path.join(os.path.dirname(OUT), 'prototype', 'build.py')
_spec = importlib.util.spec_from_file_location('inflozo_kit', KIT_PATH)
kit = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kit)

FONTS = kit.FONTS
# F.1 by row name — {'Projects': ('1', '25'), ...}. Read, never retyped (standing rule: derive counts).
LIM = {row[0]: (row[1], row[2]) for row in kit.LIMITS}
F1_NOTE = '# F-007 · Appendix F.1 governs (EXPERIENCE.md § Plan limits); frame corrected by prompt A7'


# ─────────────────────────────────────────────────────────────────────────────
# Helpers over a lifted region. All of them return markup that is still the frame's own.
# ─────────────────────────────────────────────────────────────────────────────
def kids(h):
    """(start, end) of every top-level child element of a lifted region, any tag."""
    lo, hi = h.index('>') + 1, h.rindex('</')
    out, pos = [], lo
    while True:
        i = h.find('<', pos, hi)
        if i < 0:
            return out
        m = frames._TAG.match(h, i)
        if not m or m.group(1):
            pos = i + 1
            continue
        e = frames._end(h, i)
        out.append((i, e))
        pos = e


def child(h, n):
    a, b = kids(h)[n]
    return h[a:b]


def drop(h, n):
    a, b = kids(h)[n]
    return h[:a] + h[b:]


def kid_with(h, text):
    """The top-level child whose content contains `text`."""
    for a, b in kids(h):
        if text in h[a:b]:
            return h[a:b]
    raise KeyError('no child contains %r' % text)


SCRIM = 'position:absolute;inset:0;background:rgba(28,27,26,.4)'


def card(h):
    """The sheet a detail frame documents, without the documentation MAT it sits on (F-010).

    The detail frames draw a sheet on a 600–760px mat with a scrim under it, because that is how a
    design document shows a modal. In the product the mat and the scrim are the page and
    `_app.css`'s own scrim, so only the sheet is lifted."""
    for a, b in kids(h):
        if SCRIM not in h[a:h.index('>', a)]:
            return h[a:b]
    raise KeyError('mat has no card')


def screen(h):
    """The 1440-wide app screen inside a documentation section (F-039): the C frames and S14c
    are drawn as a chapter — kicker, heading, prose, caption — around the screen itself."""
    for a, b in kids(h):
        if re.match(r'<\w+[^>]*style="width:1440px', h[a:b]):
            return h[a:b]
        try:
            return screen(h[a:b])
        except KeyError:
            continue
    raise KeyError('no 1440 screen')


def link_all(h, text, href):
    """link() every text-node occurrence of `text`, not only the first (B13a's three Swap buttons)."""
    n = len(re.findall(re.escape(text), h))
    for nth in reversed(range(n)):
        try:
            a, b = frames._elem(h, text, nth)
        except KeyError:
            continue
        inner = h[a:b]
        if frames._tag(h, a) not in frames._FOCUSABLE:
            inner = frames._with(inner, 0, tabindex='0', role='link')
        h = h[:a] + '<a href="%s" style="display:contents;color:inherit">' % href + inner + '</a>' + h[b:]
    return h


def link_at(h, find, href):
    """link() by an attribute value instead of a label — the frames' ◀ ▶ arrows carry only a
    `title` (F-014). Same wrapping as frames.link()."""
    i = h.index(find)
    a = h.rindex('<', 0, i)
    b = frames._end(h, a)
    inner = frames._with(h[a:b], 0, tabindex='0', role='link')
    return h[:a] + '<a href="%s" style="display:contents;color:inherit">' % href + inner + '</a>' + h[b:]


def menu_above(h, row, mid):
    """A drawn-open menu becomes an overlay: the row's container, one level above the row it names.
    (The rows are `<div>icon text</div>` inside the menu `<div>`.)"""
    a, _b = frames._elem(h, row)
    m = frames._enclosing(h, a - 1)[0]
    return frames._with(h, m, id=mid, class_='overlay menu-lifted')


def wire(h, *pairs):
    """Wire the affordances a frame happens to draw. Unlike patch(), a miss is allowed —
    frames differ in what they show. The backstop is the inert-screen assertion in main(),
    which fails the build if a screen ends up with nothing that responds."""
    for text, href in pairs:
        if text in h:
            try:
                h = link(h, (text, href))
            except (KeyError, ValueError):
                pass
    return h


def _style_of(h, text):
    a, _b = frames._elem(h, text)
    m = re.search(r'style="([^"]*)"', h[a:h.index('>', a)])
    return m.group(1) if m else ''


def group(h, name, *texts, want=None, role='tab'):
    """A pick group, skipping options this frame does not draw.

    F-028: the option marked as picked is the one the FRAME drew selected — the one whose inline
    style is the odd one out among its siblings — never simply the first listed. A group whose
    options all look alike has no drawn selected state and is left alone rather than guessed.
    `want` (F-045) pre-selects a different option where EXPERIENCE.md rules it, by swapping the two
    options' drawn styles so the selected LOOK is still the frame's."""
    present = [t for t in texts if t in h]
    if len(present) < 2:
        return h
    styles = [_style_of(h, t) for t in present]
    if len(present) == 2:
        # two options are both "odd"; the drawn selected look is the filled / bold one
        odd = [t for t, s in zip(present, styles) if 'background:#FFFFFF' in s or 'font-weight:600' in s]
    else:
        odd = [t for t, s in zip(present, styles) if styles.count(s) == 1]
    if len(odd) != 1 or len(set(styles)) != 2:
        return h                       # ponytail: no single drawn selection → no pick group
    sel = odd[0]
    if want and want in present and want != sel:
        s_sel, s_want = _style_of(h, sel), _style_of(h, want)
        h = patch(h, ('style="%s"' % s_sel, 'style="\x00"'), ('style="%s"' % s_want, 'style="%s"' % s_sel),
                  ('style="\x00"', 'style="%s"' % s_want))
        sel = want
    h = pick(h, name, *present, role=role)
    return picked(h, sel)


PAGES = []


def page(pid, title, body, attrs=''):
    """A product screen. `attrs` are body attributes (`data-editor-shell`, `data-keys`, `data-esc`)
    that app.js reads — no per-page script (F-022)."""
    PAGES.append(dict(id=pid, title=title, body=body, attrs=attrs))


def shell(p):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(p['title'])} · Inflozo</title>
{FONTS}
<link rel="stylesheet" href="styles.css">
</head>
<body class="product"{(' ' + p['attrs']) if p['attrs'] else ''}>
<div id="live-polite" aria-live="polite" class="sr-only"></div>
{p['body']}
<script src="app.js"></script>
</body>
</html>
"""


def fill(inner, centre=False, mobile=''):
    """A lifted screen, sized to the window rather than to a 1440x900 frame. `centre` puts a
    narrow drawn card (a sheet, a phone frame) in the middle of the paper instead of top-left.
    `mobile` is the same surface's drawn 390 frame, shown instead of the desktop one under a
    phone-width media query (R-76, R2-responsive-mobile-viewport-1)."""
    cls = 'stage centre' if centre else 'stage'
    if mobile:
        return f'<div class="{cls}"><div class="at-1440">{inner}</div><div class="at-390">{mobile}</div></div>'
    return f'<div class="{cls}">{inner}</div>'


def sheet(mid, inner):
    """A drawn sheet, popover or modal as an overlay this page raises. app.js adds role=dialog,
    aria-modal and the focus trap at open time (F-024)."""
    return f'<div id="{mid}" class="overlay sheet-lifted">{inner}</div>'


def bar(*items):
    """THE WALKTHROUGH BAR — the one piece of scaffolding on a product screen, and it says so
    (F-040): a mono 'Walkthrough ·' label, ink chips, in reserved space under the frame so it never
    covers a frame's footer. `items` are (text, href) links or (text, 'open:id') triggers."""
    out = []
    for text, target in items:
        if target.startswith('open:'):
            out.append(f'<button class="wchip" data-open="{target[5:]}" aria-haspopup="true" aria-expanded="false">{text}</button>')
        else:
            out.append(f'<a class="wchip" href="{target}">{text}</a>')
    return '<div class="stage-back" role="navigation" aria-label="Walkthrough"><span class="wlabel">Walkthrough ·</span>' + ''.join(out) + '</div>'


# ═════════════════════════════════════════════════════════════════════════════
# ENTRY — S1
# ═════════════════════════════════════════════════════════════════════════════
def _signin(h):
    h = link(h, ('Send magic link', 'magic-link-sent.html'))
    # the passkey button raises the OS sheet; Inflozo draws the page behind it and nothing of the sheet
    return trigger(h, 'Sign in with a passkey', 'passkey')


signin = _signin(unbox(region('S1 Sign In', label='S1a Sign in default')))
signin_m = _signin(unbox(region('S1 Sign In', label='S1 mobile')))        # R2-responsive-mobile-viewport-1 · R-76
# F-041: the OS sheet is S1c's 330px card, lifted — not a hand-written facsimile. Its one drawn action is Cancel.
passkey = kid_with(region('S1 Sign In', label='S1c Passkey prompt'), 'Use Touch ID')
passkey = attr(passkey, 'Cancel', 'data-close tabindex="0" role="button"')          # F-026 · drawn Cancel closes
page('index', 'Sign in', fill(signin, mobile=signin_m) + sheet('passkey', passkey)
     # the passkey's success has no drawn affordance (the OS sheet closes itself); the walk needs the door
     + bar(('Passkey accepted → Projects', 'dashboard.html')))

mls = unbox(region('S1 Sign In', label='S1b Magic link sent'))
mls = link(mls, ('Use a different email', 'index.html'))
# F-037: the hidden anchor once patched into the heading is gone; the email link is the bar's, where scaffolding belongs
page('magic-link-sent', 'Check your inbox', fill(mls)
     + bar(('Open the link from the email', 'first-run.html')))


# ═════════════════════════════════════════════════════════════════════════════
# ONBOARDING — S2
# ═════════════════════════════════════════════════════════════════════════════
fr = unbox(region('S2 Onboarding', label='S2a First run'))
# F-015: no frame draws the empty canvas, so "Blank canvas" lands on the drawn editor — listed in NOT_YET (c)
fr = link(fr, ('Connect your Ghost site', 'connect-integration.html'),
              ('Start from a starter', 'starter-chooser.html'),
              ('Blank canvas', 'editor.html'))
page('first-run', 'Welcome', fill(fr))

ci = unbox(region('S2 Onboarding', label='S2b1 Create integration'))
ci = link(ci, ('Done — next', 'connect-keys.html'), ('Back', 'first-run.html'))
page('connect-integration', 'Connect your Ghost site', fill(ci))

ck = unbox(region('S2 Onboarding', label='S2b Keys step'))
ck = link(ck, ('Back', 'connect-integration.html'))
# F-052: no frame draws a bad-key state, so Connect always succeeds — listed in NOT_YET (c)
ck = link(ck, ('>Connect<', 'auto-branding.html'))
# F-051: credential fields are never offered to autofill or spell-check; attribute-only, no pixel changes
for ph in ('8d41c0a97b', '65a3f'):
    ck = attr(ck, 'placeholder="%s' % ph, 'autocomplete="off" spellcheck="false"')
page('connect-keys', 'Paste your keys', fill(ck))

ab = unbox(region('S2 Onboarding', label='S2c Auto branding'))
# F-008 (decision 6): Redesign Proposals (B22) is held out until prompt A7 redraws it, so J1 goes Auto-Branding → Editor
ab = link(ab, ('Use your brand', 'editor.html'), ('Skip', 'editor.html'))
page('auto-branding', 'Your brand', fill(ab))


# ═════════════════════════════════════════════════════════════════════════════
# DASHBOARD AND ACCOUNT — S3, S10, S11, S12, S13
# ═════════════════════════════════════════════════════════════════════════════
def app_links(h, me, sites='sites.html'):
    """The rail and top bar are drawn on every app screen; wire them once. F-034: never to this page."""
    for text, href in (('Projects', 'dashboard.html'), ('Sites', sites), ('Assets', 'assets.html')):
        if text in h and href != me + '.html':
            h = link(h, (text, href))
    return h


def acct_menu(h, trigger_style):
    """S3d's account popover under the drawn avatar chip. F-011: its rows go where the IA says —
    Account settings and Billing → S12a (one surface, "Account & Billing"), Suggestions → S13a,
    Sign out → Sign In. Docs and Keyboard shortcuts have no drawn target and stay unwired."""
    h = attr(h, trigger_style, 'data-open="acct" aria-haspopup="true" aria-expanded="false" tabindex="0" role="button" aria-label="Account menu"')
    pop = kid_with(part('S3 Dashboard', 0, caption='S3d ·'), 'Account settings')   # F-010: the popover, not its mat or the duplicated chip
    pop = link(pop, ('Account settings', 'billing.html'), ('Billing &amp; plan', 'billing.html'),
                    ('Suggestions', 'suggestions.html'), ('Sign out', 'index.html'))
    return h + sheet('acct', pop)


dash = unbox(region('S3 Dashboard', label='S3a Dashboard rich'))
dash = app_links(dash, 'dashboard')
dash = link(dash, ('New project', 'starter-chooser.html'))
for name in ('Orbit Weekly', 'Maya&#x27;s portfolio', 'Field Notes', 'Launch page', 'Orbit Weekly — dark exp'):
    if name in dash:
        dash = link(dash, (name, 'editor.html'))
# F-013: the second card opens the same editor with someone else holding the lock (B5a) — no card badge is drawn for it
dash = link(dash, ('The Slow Web', 'editor-locked.html'))
# S3a draws what's-new OPEN, because that is the state worth documenting. In the product it is a
# popover raised by the marigold button, so the drawn element keeps its look and gains a trigger.
dash = attr(dash, 'z-index:5', 'id="whatsnew" class="overlay menu-lifted"')
dash = attr(dash, 'background:#FFF4D6;cursor:pointer', 'data-open="whatsnew" aria-label="What&#x27;s new" aria-haspopup="true" aria-expanded="false" tabindex="0" role="button"')
# the bell raises S3e's popover; F-010: the popover alone, not the mat with its second bell
dash = attr(dash, 'cursor:pointer;position:relative;transition:all 160ms ease-out',
            'data-open="notifs" aria-label="Notifications" aria-haspopup="true" aria-expanded="false" tabindex="0" role="button"')
notifs = kid_with(part('S3 Dashboard', 0, caption='S3e ·'), 'Mark all read')
notifs = link(notifs, ('Reconnect →', 'sites.html'))                                   # F-047: the one row with a destination
dash = acct_menu(dash, 'margin-top:auto;display:flex')
# F-043: the card ⋯ raises the same Rename · Duplicate · Delete menu S3c draws open (lifted below from S3c)
dash = trigger(dash, '⋯', 'card-menu')
_s3c = region('S3 Dashboard', label='S3c Dashboard free plan')
card_menu = _s3c[slice(*frames._enclosing(_s3c, frames._elem(_s3c, 'Rename')[0] - 1))]
# F-013 / F4: B14a's update notice is a state of the project card; no drawn control raises it, so the bar does
notice = card(region('B Missing Surfaces', caption='B14a ·'))
notice = link(notice, ('Review and redeploy', 'deploy.html'))
dash_m = unbox(region('S3 Dashboard', label='S3 mobile'))                              # R2-responsive-mobile-viewport-1 · R-76
dash_m = link(dash_m, ('+ New project', 'starter-chooser.html'), ('Orbit Weekly', 'editor.html'), ('The Slow Web', 'editor-locked.html'))
page('dashboard', 'Projects', fill(dash, mobile=dash_m) + sheet('notifs', notifs)
     + '<div id="card-menu" class="overlay menu-lifted">' + card_menu + '</div>'
     + sheet('library-notice', notice)
     + bar(('Empty state', 'dashboard-empty.html'), ('On Free', 'dashboard-free.html'),
           ('Library update notice (F4)', 'open:library-notice')))

dfree = unbox(region('S3 Dashboard', label='S3c Dashboard free plan'))
dfree = app_links(dfree, 'dashboard-free', sites='sites-free.html')
dfree = link(dfree, ('Go Pro — $15/mo', 'upgrade.html'))
# F-012 · EXPERIENCE.md J3 row 1: a second project on Free opens the Upgrade Sheet
dfree = link(dfree, ('New project', 'upgrade.html'))
dfree = link(dfree, ('Field Notes', 'editor-free.html'))
# F-043: S3c draws the card ⋯ menu OPEN; it becomes the overlay the ⋯ raises
dfree = menu_above(dfree, 'Rename', 'card-menu-free')
dfree = trigger(dfree, '⋯', 'card-menu-free')
dfree = acct_menu(dfree, 'margin-top:auto;display:flex')
page('dashboard-free', 'Projects', fill(dfree))

dempty = unbox(region('S3 Dashboard', label='S3b Dashboard empty'))
dempty = app_links(dempty, 'dashboard-empty')
dempty = link(dempty, ('Every great site starts somewhere.', 'starter-chooser.html'))
dempty = acct_menu(dempty, 'margin-top:auto;display:flex')
page('dashboard-empty', 'Projects', fill(dempty))

sites = unbox(region('S11 Sites', label='S11a Sites'))
sites = app_links(sites, 'sites')
# S11a draws the ⋯ menu open. F-027: the card's ⋯ raises it, and its Manage API keys row goes somewhere real.
sites = menu_above(sites, 'Re-check connection', 'site-menu')
sites = trigger(sites, '⋯', 'site-menu')
sites = link(sites, ('Manage API keys', 'manage-keys.html'))
sites = trigger(sites, 'Connect site', 'connect-site')
sites = link(sites, ('Preview-only', 'deploy-preview-only.html'))    # the Preview-only card leads to its destination state (F5)
# F-008 (decision 6) · F5 / FR-J12: Starter's customThemes limit forbids custom themes in Ghost Admin too;
# the zip downloads on every plan and installs on self-hosted Ghost or a Ghost(Pro) plan that allows custom themes
sites = patch(sites, ('Starter plans can\'t take API uploads — download the theme and upload it in Ghost Admin.',
                      'Ghost(Pro) Starter doesn\'t allow custom themes. Your theme still downloads — install it on '
                      'self-hosted Ghost, or on a Ghost(Pro) plan that allows custom themes.'))
connect = card(region('S11 Sites', caption='S11b ·'))
connect = attr(connect, 'Cancel', 'data-close') if '>Cancel<' in connect else connect
page('sites', 'Sites', fill(sites) + sheet('connect-site', connect))

# F-013: S11c is Sites on Free — one site and the upgrade ghost slot — reached from the Free dashboard's rail
sfree = region('S11 Sites', caption='S11c ·')
sfree = link(sfree, ('Go Pro — $15/mo', 'upgrade.html'))
sfree = patch(sfree, ('Free includes 1 site. Pro connects up to 3.',                                 # F-007 · Appendix F.1 governs (EXPERIENCE.md § Plan limits); frame corrected by prompt A7
                      'Free includes %s site. Pro connects up to %s.' % LIM['Site connections']))
page('sites-free', 'Sites', fill(sfree, centre=True) + bar(('← Projects', 'dashboard-free.html')))

keys = card(region('S11 Sites', caption='S11d ·'))
# F-034: no self-links — Save and Cancel return to Sites; "Test connection" has no drawn result and stays unwired
keys = wire(keys, ('Save &amp; re-check', 'sites.html'), ('Cancel', 'sites.html'))
keys = re.sub(r'<input([^>]*)>', lambda m: '<input%s autocomplete="off" spellcheck="false">' % m.group(1)
              if 'autocomplete' not in m.group(1) else m.group(0), keys)   # F-051 · attribute-only
page('manage-keys', 'Keys', fill(keys, centre=True) + bar(('← Sites', 'sites.html')))

assets = unbox(region('S10 Assets', label='S10a Asset library'))
assets = app_links(assets, 'assets')
assets = trigger(assets, 'Upload', 'dropzone')
assets = trigger(assets, 'hero-shot.jpg', 'asset-details')
dropzone = decap(region('S10 Assets', caption='S10b ·'))
dropzone = patch(dropzone, ('up to 30 MB each', 'up to %s each' % LIM['Per-upload cap'][0]))   # F-007 · Appendix F.1 governs (EXPERIENCE.md § Plan limits); frame corrected by prompt A7
details = card(region('S10 Assets', label='S10d Image details'))
# F-027: S10c's delete-in-use confirm is raised by the details panel's own Delete
details = trigger(details, 'Delete', 'delete-asset') if 'Delete' in details else details
delete_asset = card(region('S10 Assets', caption='S10c ·'))
delete_asset = attr(delete_asset, 'Cancel', 'data-close') if '>Cancel<' in delete_asset else delete_asset
assets += sheet('dropzone', dropzone) + sheet('asset-details', details) + sheet('delete-asset', delete_asset)
page('assets', 'Assets', fill(assets))

bill = unbox(region('S12 Billing', caption='S12a ·'))
bill = trigger(bill, 'View invoices', 'invoices')
bill = trigger(bill, 'Delete account', 'delete-acct', nth=1)   # the button, not the heading
# F-030: PRD Appendix F.2 — cancelling stops auto-renew at period end, in ≤3 clicks, with no retention sheet.
# Nothing is drawn for it, so Cancel plan is deliberately a no-op here (listed in NOT_YET), never the upsell.
bill = patch(bill, ('6 · unlimited', '6 of %s' % LIM['Projects'][1]),                 # F-007 · Appendix F.1 governs (EXPERIENCE.md § Plan limits); frame corrected by prompt A7
                   ('2 of 3', '2 of %s' % LIM['Site connections'][1]),                # F-007 · Appendix F.1 governs
                   ('full history', LIM['Deploy history'][1]))                         # F-007 · Appendix F.1 governs
invoices = card(region('S12 Billing', caption='S12d ·'))
delete_acct = card(region('S12 Billing', caption='S12c ·'))
# F-030: the typed confirm is enforced — the drawn field must read exactly the phrase before Delete account is live
delete_acct = attr(delete_acct, 'value="delete my acc"', 'data-typed="delete my account" data-typed-target="#delete-go"')
delete_acct = attr(delete_acct, '>Delete account<', 'id="delete-go"')
delete_acct = attr(delete_acct, '>Cancel<', 'data-close')
page('billing', 'Account & billing', fill(bill) + sheet('invoices', invoices) + sheet('delete-acct', delete_acct)
     + bar(('← Projects', 'dashboard.html')))


def upgrade_sheet():
    """S12b, the Upgrade Sheet, used app-wide. F-045 · EXPERIENCE.md J3 step 5b: yearly pre-selected,
    monthly one click away (the frame's Monthly default → A7)."""
    up = card(region('S12 Billing', caption='S12b ·'))
    up = group(up, 'interval', 'Monthly', 'Yearly', want='Yearly')
    up = patch(up, ('>Unlimited<', '>%s<' % LIM['Projects'][1]),                       # F-007 · Appendix F.1 governs (EXPERIENCE.md § Plan limits); frame corrected by prompt A7
                   ('<span style="font-weight:600">3</span>', '<span style="font-weight:600">%s</span>' % LIM['Site connections'][1]),   # F-007 · Appendix F.1 governs
                   ('>Last 2<', '>%s<' % LIM['Deploy history'][0]))                    # F-007 · Appendix F.1 governs
    return up


up = wire(upgrade_sheet(), ('Go Pro — $15/mo', 'dashboard.html'))
page('upgrade', 'Go Pro', fill(up, centre=True) + bar(('← Back', 'dashboard-free.html')))

sugg = unbox(region('S13 Suggestions', label='S13a Suggestions'))
sugg = trigger(sugg, 'Suggest something', 'suggest')
sugg = group(sugg, 'tab', 'Top', 'New', 'Planned', 'Building', 'Shipped')
suggest = card(region('S13 Suggestions', caption='S13b ·'))
suggest = attr(suggest, 'Cancel', 'data-close') if '>Cancel<' in suggest else suggest
page('suggestions', 'Suggestions', fill(sugg) + sheet('suggest', suggest) + bar(('← Projects', 'dashboard.html')))


# ═════════════════════════════════════════════════════════════════════════════
# THE EDITOR — S4, S5, S6, S7, S9, S14, C
# ═════════════════════════════════════════════════════════════════════════════
EDITOR_KEYS = 'p:preview-mode.html'      # FR-D11's page-level keys, read by app.js under the typing() guard (F-022)


def editor_frame(h, ship='deploy.html', home='dashboard.html', readonly=False):
    """S4a's chrome, wired the same on every page that lifts it. `readonly` (B5a, reading along)
    keeps the menus and the way back and wires nothing that edits or ships."""
    # S4a documents the template dropdown OPEN. In the product it opens from the Template button,
    # so the drawn menu becomes an overlay and the button becomes its trigger.
    _m = re.search(r'<div style="position:absolute;left:calc\(50% - 115px\);top:44px[^"]*"', h)
    if _m:
        h = h[:_m.start()] + '<div id="template-menu" class="overlay menu-lifted"' + h[_m.start() + len('<div'):]
        h = trigger(h, '>Template<', 'template-menu')
        # F-011: every template row that has a drawn surface goes to it. Home is this canvas. Page, Tag, Author
        # and 404 have no frame (A5/A8). Members → the paywall canvas C3a, the one membership surface drawn;
        # "+ New template" → Routes & Templates (S9e is the new-template sheet; S4a draws no "Manage routes" row).
        h = link(h, ('>Post<', 'post-content.html'), ('>Members<', 'paywall-editor.html'),
                    ('+ New template', 'routes-manager.html'))
    h = link(h, ('Orbit Weekly', home))                    # the top-bar name is the way back (IA: Dashboard ← logo)
    if readonly:
        return h
    h = link(h, ('Ship it', ship))
    h = link(h, ('+ Add section', 'section-picker.html'))
    h = wire(h, ('Change', 'style-packs.html'))
    if '>Count<' in h:
        # EXPERIENCE.md § wrong mechanism, B17: every surface that mentions posts per page links to Theme Settings
        h = link(h, ('>Count<', 'theme-settings.html'))
    # F-032: L toggles the drawn Layers panel; the class is the hook, the panel is the frame's
    h = attr(h, '>Header<', 'x-layer')
    _i = h.index('x-layer')
    _p = h.rindex('<div style="width:', 0, _i)
    h = h[:_p + 4] + ' class="layers"' + h[_p + 4:]
    h = h.replace(' x-layer', '', 1)
    if '>View as<' in h:
        h = trigger(h, '>View as<', 'viewas')
    return h


def viewas_sheet():
    """F-009: the member-state popover alone (S4d's second child), not the whole documentation region.
    Its paid-tier rows are the frame's; FR-D16's three states are prompt A7's to redraw."""
    return sheet('viewas', kid_with(part('S4 Editor', 1, caption='S4d ·'), 'Preview as'))


ed = editor_frame(unbox(region('S4 Editor', label='S4a Editor rest')))
page('editor', 'Orbit Weekly · Home', fill(ed) + viewas_sheet()
     + bar(('Hover the hero →', 'editor-hover.html')),
     attrs='data-editor-shell data-keys="%s"' % EDITOR_KEYS)

# F-012: the same editor on Free — Ship it opens the Pro Exit Sheet (B13a) instead of the wizard
edf = editor_frame(unbox(region('S4 Editor', label='S4a Editor rest')), ship='pro-exit.html', home='dashboard-free.html')
page('editor-free', 'Orbit Weekly · Home', fill(edf) + viewas_sheet(),
     attrs='data-editor-shell data-keys="%s"' % EDITOR_KEYS)

# F-013 / F2: the editor with someone else holding the lock — S4a under B5a's read-only bar, B5b's request
# popover and B5c's takeover modal. Read-along: nothing on the canvas is wired, only the way back.
lock = editor_frame(unbox(region('S4 Editor', label='S4a Editor rest')), readonly=True)
lockbar = kid_with(region('B Missing Surfaces', caption='B5a ·'), 'Request editing')
lockbar = trigger(lockbar, 'Request editing', 'lock-request')
request = region('B Missing Surfaces', caption='B5b ·')
request = link(request, ('Hand over', 'editor.html'))
request = attr(request, 'Keep editing', 'data-close')
takeover = region('B Missing Surfaces', caption='B5c ·')
takeover = link(takeover, ('Take over anyway', 'editor.html'))
takeover = attr(takeover, '>Wait<', 'data-close')
page('editor-locked', 'Orbit Weekly · Home (read-only)',
     f'<div class="stage"><div class="lockbar">{lockbar}</div>{lock}</div>'
     + sheet('lock-request', request) + sheet('lock-takeover', takeover)
     + bar(('← Projects', 'dashboard.html'), ('Takeover after 4 minutes (F2)', 'open:lock-takeover')))

hov = unbox(region('S4 Editor', label='S4b Editor hover'))
hov = wire(hov, ('Ship it', 'deploy.html'), ('+ Add section', 'section-picker.html'))
page('editor-hover', 'Orbit Weekly · Home', fill(hov)
     + bar(('← Rest', 'editor.html'), ('Select it →', 'editor-selected.html')),
     attrs='data-editor-shell data-keys="%s"' % EDITOR_KEYS)

# F-031: Preview Mode is B3b's drawn state, full card, centred; Esc and "Back to editing" return.
# Device widths 1/2/3 are B11's — drawn with a zoom control the PRD forbids → A7, so they are inert here.
pv = region('B Missing Surfaces', caption='B3b ·')
pv = wire(pv, ('Back to editing', 'editor.html'))
page('preview-mode', 'Preview', fill(pv, centre=True) + bar(('Esc — back to editing', 'editor.html')),
     attrs='data-editor-shell data-esc="editor.html"')

# F-014: THE RING, with drawn frames only. S4c (Split Editorial) and S6 (Editorial Stack) are two positions
# of the same ring; ◀ ▶ on the section and [ ] on the keyboard walk between them, and each frame draws
# its own counter. B1a, the Design Picker, opens from the sidebar's Design row and its counter chip.
RING = {'editor-selected': 'variant-shuffle.html', 'variant-shuffle': 'editor-selected.html'}


def ring(h, other):
    h = link_at(h, 'title="Next design — ]"', other)
    h = link_at(h, 'title="Previous design — ["', other)
    return h


sel = unbox(region('S4 Editor', label='S4c Editor selected'))
sel = group(sel, 'align', 'Left', 'Centred', 'Center')
sel = group(sel, 'height', 'Compact', 'Comfortable', 'Tall')
sel = group(sel, 'density', 'Compact', 'Comfortable', 'Spacious')
sel = group(sel, 'side', 'Left', 'Right')
sel = group(sel, 'scrim', 'None', 'Soft', 'Strong')
sel = ring(sel, RING['editor-selected'])
sel = link(sel, ('Try a variant', 'variant-shuffle.html'))
sel = wire(sel, ('Ship it', 'deploy.html'), ('+ Add section', 'section-picker.html'), ('Orbit Weekly', 'dashboard.html'))
sel = trigger(sel, '4 / 18', 'design-picker')
sel = trigger(sel, '>Design<', 'design-picker')
picker_sheet = region('B Missing Surfaces', caption='B1a ·')
page('editor-selected', 'Orbit Weekly · Home', fill(sel) + sheet('design-picker', picker_sheet)
     + bar(('← Deselect', 'editor.html')),
     attrs='data-editor-shell data-keys="]:%s,[:%s,%s"' % (RING['editor-selected'], RING['editor-selected'], EDITOR_KEYS))

vs = unbox(region('S6 Variant Shuffle', label='S6 Variant shuffle'))
vs = group(vs, 'density', 'Compact', 'Comfortable', 'Spacious')
vs = group(vs, 'side', 'Left', 'Right')
vs = group(vs, 'scrim', 'None', 'Soft', 'Strong')
vs = ring(vs, RING['variant-shuffle'])
vs = wire(vs, ('Ship it', 'deploy.html'), ('+ Add section', 'section-picker.html'), ('Orbit Weekly', 'dashboard.html'))
page('variant-shuffle', 'Shuffle', fill(vs) + bar(('← Editor', 'editor.html')),
     attrs='data-editor-shell data-keys="]:%s,[:%s,%s"' % (RING['variant-shuffle'], RING['variant-shuffle'], EDITOR_KEYS))

picker = unbox(region('S5 Section Picker', label='S5a Section picker'))
picker = link(picker, ('Add', 'editor.html'))
picker = group(picker, 'cat', 'Headers', 'Heroes', 'Post Grids', 'Footers')
page('section-picker', 'Add a section', fill(picker) + bar(('Esc — close', 'editor.html')),
     attrs='data-esc="editor.html"')

packs = unbox(region('S7 Style Packs', caption='S7b ·'))
packs = group(packs, 'width', 'Narrow', 'Standard', 'Wide')
packs = group(packs, 'corners', 'Sharp', 'Soft', 'Round')
packs = group(packs, 'density', 'Compact', 'Comfortable', 'Spacious')
packs = wire(packs, ('New pack', 'style-pack-edit.html'), ('Edit', 'style-pack-edit.html'),
                    ('Ship it', 'deploy.html'), ('Orbit Weekly', 'dashboard.html'))
page('style-packs', 'Style Packs', fill(packs) + bar(('← Editor', 'editor.html'), ('Edit a pack', 'style-pack-edit.html')))
spe = unbox(region('S7 Style Packs', caption='S7c ·'))
spe = group(spe, 'mode', 'Light', 'Dark')
spe = wire(spe, ('Save pack', 'style-packs.html'), ('Cancel', 'style-packs.html'))
page('style-pack-edit', 'Edit pack', fill(spe) + bar(('← Packs', 'style-packs.html')))

routes = unbox(region('S9 Routes', label='S9a Routes manager'))
routes = trigger(routes, '+ New collection', 'new-collection')
routes = trigger(routes, '+ Custom route', 'new-route')
routes = wire(routes, ('Ship update', 'deploy.html'), ('Orbit Weekly', 'editor.html'))
new_coll = card(region('S9 Routes', caption='S9c ·'))
new_coll = attr(new_coll, 'Cancel', 'data-close') if '>Cancel<' in new_coll else new_coll
new_route = card(region('S9 Routes', caption='S9e ·'))
new_route = attr(new_route, 'Cancel', 'data-close') if '>Cancel<' in new_route else new_route
page('routes-manager', 'Routes & Templates', fill(routes) + sheet('new-collection', new_coll) + sheet('new-route', new_route)
     + bar(('← Editor', 'editor.html'), ('Empty state', 'routes-empty.html')))
rempty = unbox(region('S9 Routes', label='S9d Routes empty'))
rempty = wire(rempty, ('+ New collection', 'routes-manager.html'))
page('routes-empty', 'Routes & Templates', fill(rempty) + bar(('← Routes', 'routes-manager.html')))

# F-039: S14e is drawn as canvas + panel + a notes column; the notes are documentation and stay in 5b
cards = drop(region('S14 Editor Cards', caption='S14e ·'), 2)
cards = group(cards, 'callout-col', 'Pack tokens', 'Ghost&#x27;s palette')
cards = group(cards, 'emoji-size', 'Small', 'Large')
cards = group(cards, 'bg-role', 'Base', 'Surface', 'Tint', 'Accent')
cards = trigger(cards, 'Reset to Ghost default', 'reset-card')
reset = kid_with(kid_with(region('S14 Editor Cards', label='S14c reset confirm'), 'Reset'), 'Reset')
reset = attr(reset, 'Cancel', 'data-close') if '>Cancel<' in reset else reset
page('editor-cards', 'Editor cards', fill(cards, centre=True) + sheet('reset-card', reset)
     + bar(('← Paywall', 'paywall-editor.html'), ('← Editor', 'editor.html')))

# F-039: the C frames are chapters — kicker, heading, prose, caption — around a 1440 screen; the screen is the product
post = unbox(screen(region('C Post Body', label='C2a Post content desktop')))
post = group(post, 'measure', 'Narrow', 'Comfortable', 'Wide')
post = group(post, 'device', 'Desktop', 'Tablet', 'Mobile')
post = wire(post, ('Ship update', 'deploy.html'), ('Preview', 'preview-mode.html'),
                  ('Style-guide article', 'style-guide.html'), ('Orbit Weekly', 'editor.html'))
page('post-content', 'Post template', fill(post) + bar(('← Editor', 'editor.html')))
pay = unbox(screen(region('C Post Body', label='C3a Paywall editor')))
pay = group(pay, 'treat', 'None', 'Fade', 'Blur')
pay = group(pay, 'tiers', 'All paid', 'Cheapest', 'One I pick')
pay = group(pay, 'surface', 'Page', 'Tinted', 'Inverted')
pay = group(pay, 'member', 'Anonymous', 'Free member', 'Paid member')
pay = wire(pay, ('Back to post', 'post-content.html'), ('Ship update', 'deploy.html'),
                ('>Cards<', 'editor-cards.html'), ('Orbit Weekly', 'editor.html'))   # C3a draws the Template-surfaces nav
page('paywall-editor', 'Paywall', fill(pay) + bar(('← Editor', 'editor.html')))
sg = unbox(screen(region('C Post Body', label='C4 Style-guide fixture')))
sg = wire(sg, ('Swap to a real post from the content-source pill at any time', 'post-content.html'))
page('style-guide', 'Style-guide article', fill(sg) + bar(('← Post template', 'post-content.html')))

theme = unbox(region('B Missing Surfaces', caption='B17 ·'))
theme = group(theme, 'settings-nav', 'Site basics', 'Navigation', 'Social accounts', 'Code injection')
# F-034: no self-links — Translations (B18) has no page here and Promote has no drawn result; both stay unwired
theme = wire(theme, ('Ship update', 'deploy.html'), ('Orbit Weekly', 'editor.html'))
page('theme-settings', 'Theme settings', fill(theme) + bar(('← Editor', 'editor.html')))


# ═════════════════════════════════════════════════════════════════════════════
# SHIPPING — S8
# ═════════════════════════════════════════════════════════════════════════════
# The wizard is four drawn frames and ONE surface. Each becomes a step of the same page, so
# it walks the way it will in the product — and each step is still the frame, untouched.
d1 = unbox(region('S8 Deploy', label='S8a Ship step 1'))
d1 = group(d1, 'dest', 'Deploy &amp; activate', 'Deploy only', role='radio')
# F-013 / F4: before the Check step, the Library Update Confirm (B14b) — Update and ship goes on, Not now stays
d1 = trigger(d1, '>Run checks<', 'library-update')
d1 = link(d1, ('Orbit Weekly', 'editor.html'))
libup = region('B Missing Surfaces', caption='B14b ·')
libup = attr(libup, 'Update and ship', 'data-goto="2"')
libup = attr(libup, 'Not now', 'data-close')
d2 = card(region('S8 Deploy', caption='S8b ·'))
# F-013 / F1: the Snapshot Gate (B12a) is the first named stage of the Ship step, raised on entering it
d2 = attr(d2, '>Ship it<', 'data-run="4" data-goto-first="3" data-run-host="ship3" data-run-gate="snapshot"')
d2 = attr(d2, '>Back<', 'data-goto="1"')
d3 = card(region('S8 Deploy', caption='S8c ·'))
# F-033: the two drawn stages announce and dwell, so shipping takes long enough to read
d3 = attr(d3, 'Uploading to Ghost', 'data-progress-step="Uploading to Ghost"')
d3 = attr(d3, 'Activating v5', 'data-progress-step="Activating v5"')
d4 = card(region('S8 Deploy', caption='S8d ·'))
d4 = link(d4, ('Done', 'editor.html'), ('View site', 'editor.html'))
d5 = card(region('S8 Deploy', caption='S8d′ ·'))
d5 = link(d5, ('Reconnect site', 'manage-keys.html'))
snap = region('B Missing Surfaces', caption='B12a ·')
snap = attr(snap, '>Cancel<', 'data-close')
snap_failed = region('B Missing Surfaces', caption='B12b ·')       # copy is B12b's; F1's honest reason is A7's
snap_failed = attr(snap_failed, 'Try again', 'data-close')
snap_failed = attr(snap_failed, 'Deploy without a snapshot', 'data-close')
snap_failed = attr(snap_failed, 'Check the key', 'data-close')


def step(n, inner, title, first=False):
    # F-054: the step carries its own title for the live region and takes focus on entry
    return (f'<div data-step="{n}" data-step-title="{title}" tabindex="-1"{"" if first else " hidden"}>'
            + inner + '</div>')


page('deploy', 'Ship it', '<div data-wizard data-at="1">'
     + step(1, fill(d1), 'Ship it — step 1 of 4, destination', first=True)
     + step(2, fill(d2, centre=True), 'Step 2 of 4, pre-flight check')
     + step(3, '<div id="ship3">' + fill(d3, centre=True) + '</div>', 'Step 3 of 4, shipping')
     + step(4, fill(d4, centre=True), 'Step 4 of 4, live')
     + step(5, fill(d5, centre=True), 'Deploy failed')
     + '</div>'
     + sheet('library-update', libup) + sheet('snapshot', snap) + sheet('snapshot-failed', snap_failed)
     + bar(('← Editor', 'editor.html'), ('Failure ending', 'open:goto-5'), ('No-token ending (F1)', 'open:snapshot-failed'),
           ('History', 'deploy-history.html')))
# the bar's "Failure ending" is a step jump, not an overlay — rewrite that one chip
PAGES[-1]['body'] = PAGES[-1]['body'].replace(
    '<button class="wchip" data-open="goto-5" aria-haspopup="true" aria-expanded="false">Failure ending</button>',
    '<button class="wchip" data-goto="5">Failure ending</button>')

po = card(region('S8 Deploy', caption='S8a′ ·'))
# F-008 (decision 6) · F5 / FR-J12: the manual Ghost Admin route does not exist on Starter either
po = patch(po, ("Ghost(Pro)'s Starter plan doesn't accept custom themes over the API. Download your theme and "
                "upload it in Ghost Admin — or upgrade your Ghost plan to ship directly from here.",
                "Ghost(Pro)'s Starter plan doesn't allow custom themes. Your theme still downloads — install it on "
                "self-hosted Ghost or a Ghost(Pro) plan that allows custom themes — or upgrade your Ghost plan to ship from here."))
po = wire(po, ('Download theme', 'sites.html'), ('Which Ghost plans work? ↗', 'pricing.html'))
page('deploy-preview-only', 'Preview-only', fill(po, centre=True) + bar(('← Sites', 'sites.html')))

hist = unbox(region('S8 Deploy', label='S8e History drawer'))
# F-029: S8e draws the rollback confirm OPEN over the drawer; it becomes the overlay the row's Roll back raises,
# and the drawn hover tooltip is hidden by a 5c-only class (it documents the clock icon's title)
_t = frames._elem(hist, 'Roll back to v4?')[0]
_modal = frames._enclosing(hist, frames._enclosing(hist, _t - 1)[0] - 1)[0]   # title → its column → the modal
hist = frames._with(hist, _modal, id='rollback', class_='overlay sheet-lifted')
_a = hist.index(SCRIM + ';z-index:8')                               # the drawn scrim under the confirm → gone; the overlay brings its own
_a = hist.rindex('<div', 0, _a)
hist = hist[:_a] + hist[frames._end(hist, _a):]
hist = attr(hist, 'History — every version, one click back', 'class="drawn-tooltip"')     # F-029 · 5c-only: a documented hover state
hist = trigger(hist, 'Roll back', 'rollback')                        # the v4 row's button (the modal's own Roll back is the second)
hist = wire(hist, ('View site', 'editor.html'), ('Orbit Weekly', 'editor.html'))
hist = attr(hist, '>Cancel<', 'data-close')
hist = group(hist, 'ver', 'v5', 'v4', 'v3')
hist = patch(hist, ('Pro keeps the last 10 versions. Free keeps the last 3.',                # F-007 · Appendix F.1 governs (EXPERIENCE.md § Plan limits) — already right; asserted, not restated
                    'Pro keeps the %s. Free keeps the %s.' % (LIM['Deploy history'][1], LIM['Deploy history'][0])))
page('deploy-history', 'History', fill(hist) + bar(('← Editor', 'editor.html')))

# F-012: the Pro Exit Sheet over the dimmed editor, exactly as B13a draws it — reached from a Free editor's Ship it.
# Its two remedies are the frame's; FR-L3's four are prompt A7's (F-008, decision 6).
pex = unbox(region('B Missing Surfaces', caption='B13a ·'))
pex = link_all(pex, '>Swap<', 'editor.html')                       # F-044: every Swap is tryable
pex = link(pex, ('Swap all three', 'editor.html'),
                ('Swap and ship free', 'deploy.html'), ('Go Pro and ship', 'upgrade.html'))
page('pro-exit', 'Four Pro designs are in this site', fill(pex) + bar(('← Editor', 'editor-free.html')))

# B23a as drawn. F-042: Use Journal and the category tabs respond; the roster is the frame's (Appendix E's → A7)
starter = unbox(region('B Missing Surfaces', label='B23a Chooser'))
starter = link(starter, ('Start empty', 'editor.html'), ('Use Journal', 'editor.html'), ('Back', 'first-run.html'))
starter = group(starter, 'cat', 'All 10', 'Writing', 'Newsletter', 'Portfolio', 'Business', 'Reference')
page('starter-chooser', 'Pick your starter', fill(starter))

mk = unbox(region('M5 Pricing', label='M5 Pricing'))
mk = group(mk, 'interval', 'Monthly', 'Yearly')
mk = patch(mk, ('>Unlimited<', '>%s<' % LIM['Projects'][1]),                                  # F-007 · Appendix F.1 governs (EXPERIENCE.md § Plan limits); frame corrected by prompt A7
               ('<span style="font-weight:600">3</span>', '<span style="font-weight:600">%s</span>' % LIM['Site connections'][1]),   # F-007 · Appendix F.1 governs
               ('>Last 2<', '>%s<' % LIM['Deploy history'][0]))                               # F-007 · Appendix F.1 governs
mk = wire(mk, ('Start free', 'index.html'), ('Go Pro', 'upgrade.html'), ('Sign in', 'index.html'))
mk_m = unbox(region('M5 Pricing', label='M5 mobile'))                                        # R2-responsive-mobile-viewport-1 · R-76
mk_m = patch(mk_m, ('>∞<', '>%s<' % LIM['Projects'][1]),                                     # F-007 · Appendix F.1 governs
                   ('<span style="font-weight:600">3</span>', '<span style="font-weight:600">%s</span>' % LIM['Site connections'][1]),   # F-007 · Appendix F.1 governs
                   ('>Last 2<', '>%s<' % LIM['Deploy history'][0]))                           # F-007 · Appendix F.1 governs
mk_m = wire(mk_m, ('Start free', 'index.html'), ('Go Pro', 'upgrade.html'))
page('pricing', 'Pricing', fill(mk, mobile=mk_m))


# ─────────────────────────────────────────────────────────────────────────────
# NOT IN THIS CUT, AND WHY — three honest lists (F-013). (a) has no frame: the prompt that owes it.
# (b) is drawn but held out, or shown as drawn while a ruling re-specifies it: prompt A7 redraws.
# (c) is a state no frame draws of a surface that is here. A `page` names the screen it belongs to
# and is asserted against the registry, so an entry cannot outlive its screen.
# ─────────────────────────────────────────────────────────────────────────────
NOT_YET = {
    'No frame in the export — owed by an Appendix A prompt': [
        ('Backup Gate · Staff Token Offer · first-deploy name confirm', 'prompt A1', 'deploy'),
        ('Deploy Uploaded · Partial success · history pinning', 'prompt A2', 'deploy'),
        ('Drift Report', 'prompt A3', 'deploy'),
        ('New Project Sheet · Over-Limit Sheet · Small Screen Notice', 'prompt A4', 'dashboard'),
        ('Canvas markers · Template Switcher, complete (Page, Tag, Author, 404, Membership) · Preview subject', 'prompt A5', 'editor'),
        ('Theme Settings, completed (posts_per_page, project mode, credits) · Translations', 'prompt A6', 'theme-settings'),
        ('The editor at 834 and at 720 · device widths 1 / 2 / 3 · the skip link', 'prompt A8', 'editor'),
    ],
    'Drawn, but held out or shown as drawn while a ruling re-specifies it — prompt A7 redraws': [
        ('Redesign Proposals (B22) — held out entirely; J1 goes Auto-Branding → Editor', 'R-78 / FR-C7', 'auto-branding'),
        ('Pro Exit Sheet (B13a) — shown with its two drawn remedies; FR-L3 rules four', 'A7', 'pro-exit'),
        ('Starter Chooser (B23a) — shown with its drawn roster; Appendix E names the ten', 'A7', 'starter-chooser'),
        ('Member-state preview (S4d) — shown with its paid-tier rows; FR-D16 rules three states', 'A7', 'editor'),
        ('Snapshot Gate (B12a/b) — shown as drawn; F1 corrects two sentences and the 403 reason', 'A7', 'deploy'),
        ('Device Preview (B11) — not lifted: it draws a zoom control FR-D14 forbids', 'A7', 'preview-mode'),
        ('Grace Banner (B24) · Routes Fallback (B16) · Template Binding (B19) · Preview-Only Notice (B15)', 'A7', 'deploy'),
        ('Design Nav on the section (B1b) · Layers with Site-wide (B7) · Site Remix (B8) · Persistence (B6) · Inline Toolbar (P0-1)', 'drawn as detail cards, not on S4a — no trigger to hang them from', 'editor'),
        ('Notifications (B21) · Connected-sites strip (B25)', 'S3e is lifted under the bell instead; B25 has no drawn trigger', 'dashboard'),
    ],
    'States no frame draws — the surface is here, the state is not': [
        ('The empty canvas — Blank canvas and Start empty land on the drawn canvas', 'no frame', 'editor'),
        ('Connect · Keys with a bad key — Connect always succeeds', 'no frame', 'connect-keys'),
        ('Deploy Uploaded — Deploy only ends on the drawn Live', 'prompt A2', 'deploy'),
        ('Cancel plan — Appendix F.2 stops auto-renew at period end with no sheet; the button is inert here', 'no frame', 'billing'),
        ('Dark authoring outside the Section Picker · the sidebar Dark mode toggle · the . key', 'no frame', 'editor'),
        ('Suggestions at 390 — R-76 requires it; S13 is drawn at 1440 only', 'no frame', 'suggestions'),
        ('Test connection (S11d) · Promote (B17) · Docs and Keyboard shortcuts (S3d) — drawn controls with no drawn result', 'no frame', 'manage-keys'),
    ],
}


def build_screens_index():
    # F-006: the "What responds" paragraph below claims only hooks a product screen carries — no ring,
    # no backup gate, four wizard steps, P / L / Esc. Change it when the hooks change, not before.
    ids = {p['id'] for p in PAGES}
    rows = ''.join(f'<a class="idxrow" href="{p["id"]}.html"><b>{html.escape(p["title"])}</b>'
                   f'<span class="k">{p["id"]}.html</span></a>' for p in PAGES)
    missing = ''
    for heading, items in NOT_YET.items():
        for _n, _why, pid in items:
            assert pid in ids, 'NOT_YET names a screen that is not in the registry: ' + pid
        missing += f'<h3 style="font-size:14px;margin:18px 0 6px">{heading}</h3><div class="idxgrid">'
        missing += ''.join(f'<div class="idxrow" style="border-style:dashed;opacity:.75">{n}'
                           f'<span class="k">{why} · <a href="{pid}.html">{pid}.html</a></span></div>'
                           for n, why, pid in items)
        missing += '</div>'
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Every screen · Inflozo walkthrough</title>
{FONTS}<link rel="stylesheet" href="styles.css"></head>
<body class="product"><div class="screens-index">
  <h1 style="font-size:30px">Every screen</h1>
  <p class="softaa" style="font-size:14px;line-height:1.6;max-width:74ch;margin-top:10px">
    This page is a jump list, not the product. <b>Start at
    <a href="index.html">index.html</a></b> and click through as a user would; come back here to skip ahead.
    On a product screen the only thing that is not the product is the dashed <b>Walkthrough ·</b> bar under
    the frame — it holds the hops no drawn control makes (the email link, a state you cannot reach by clicking).</p>
  <p class="helper" style="margin-top:10px;max-width:74ch">Every screen below is <b>lifted from the
    Claude Design export</b> — the markup is the frame's own, not a re-drawing of it — and then wired up so
    it behaves. If a screen looks wrong, the frame is what it looks like, and that is the point.</p>
  <p class="helper" style="margin-top:8px;max-width:74ch"><b>What responds.</b> Menus, popovers and sheets
    open from the control that raises them and close on <span class="kbd">Esc</span>, their drawn Cancel, or a
    click outside; focus moves in, is trapped, and returns. Segmented controls, tab rows and radio lists
    <b>pick</b>, and the selected look is the one the frame drew. In the editor
    <span class="kbd">P</span> opens Preview Mode and <span class="kbd">Esc</span> leaves it, and
    <span class="kbd">L</span> hides Layers, and <span class="kbd">]</span> <span class="kbd">[</span> step the design
    ring between its two drawn positions — the rest of FR-D11's map has no drawn result to land on yet.
    The deploy wizard walks its four drawn steps, with the library-update confirm before Check and the
    snapshot gate on entering Ship. <b>The backup gate is not here</b>: no gate blocks a deploy, because no frame draws one — it is in the
    first list below. Every screen is reachable from Sign In by clicking, and the build refuses to report success if
    one is not, if any link is dead, or if a screen has nothing that responds.</p>
  <div class="idxgrid" style="margin-top:22px">{rows}</div>
  <h2 style="font-size:18px;margin:32px 0 6px">Not in this cut, and why</h2>
  <p class="helper" style="max-width:74ch;margin-bottom:12px">Three lists, because three different things are
    true. Surfaces with <b>no frame</b> wait on the Appendix A prompt named beside them. Surfaces that <b>are
    drawn</b> but on a mechanism a ruling re-specifies are shown as drawn, or held out, and prompt A7 redraws
    them. And some <b>states</b> of a surface that is here were never drawn. Step 5b describes all of them.</p>
  {missing}
  <p class="helper" style="margin-top:24px"><a href="_selfcheck.html">app.js self-check</a> ·
    <a href="../prototype/index.html">step 5b — the annotated prototype</a></p>
</div></body></html>
"""


# ─────────────────────────────────────────────────────────────────────────────
# CHECKS. All of them run on the in-memory pages BEFORE anything is written (F-018), so a red build
# leaves the folder exactly as it was.
# ─────────────────────────────────────────────────────────────────────────────
def check(pages, index_html):
    ids = {p['id'] for p in pages}
    files = {i + '.html' for i in ids} | {'styles.css', 'app.js', '_screens.html', '_selfcheck.html',
                                            '../prototype/index.html'}
    errs = []

    def links(body):
        return [h for h in re.findall(r'href="([^"]+)"', body) if not h.startswith(('http', 'mailto:', '#'))]

    for p in pages + [dict(id='_screens', body=index_html)]:
        for href in links(p['body']):
            tgt = href.split('#')[0].split('?')[0]
            if tgt and tgt not in files:
                errs.append(f'dead link · {p["id"]} → {href}')
            if '?' in href:
                errs.append(f'query-string state is not allowed · {p["id"]} → {href}')

    for p in pages:
        body, pid = p['body'], p['id']
        # F-034: a self-link reloads the page and reads as broken; it never counts as a response
        if f'href="{pid}.html"' in body:
            errs.append(f'self-link · {pid}')
        hooks = len(re.findall(r'data-(open|goto|pick|run|close)=', body)) + len(re.findall(r'href="[A-Za-z0-9_.-]+\.html', body))
        if hooks == 0:
            errs.append(f'inert screen · {pid}')
        # F-002 family: an attribute can never land on a closing tag
        if re.search(r'</\w+ [a-z-]+=', body):
            errs.append(f'attribute on a closing tag · {pid}')
        # F-004: nested anchors
        depth = 0
        for m in re.finditer(r'<a\b|</a>', body):
            depth += 1 if m.group(0) == '<a' else -1
            if depth > 1:
                errs.append(f'nested anchor · {pid}')
                break
        # F-001: an unboxed clipping root keeps a height, or it collapses to nothing
        for m in re.finditer(r'<\w+ data-screen-label="([^"]*)" style="([^"]*)">\s*<div style="position:absolute;inset:0', body):
            if 'overflow:hidden' in m.group(2) and 'height:' not in m.group(2):
                errs.append(f'clipping root with no height · {pid} · {m.group(1)}')
        # F-007: no plan string the PRD has ruled wrong survives a lift
        for s in ('Last 2', 'Unlimited', '30 MB', 'up to 3.', '>∞<'):
            if s in body:
                errs.append(f'plan string the PRD overrides · {pid} · {s!r}')
        # every trigger has its overlay and every overlay has a trigger; every step jump has a step
        opens = set(re.findall(r'data-(?:open|run-gate)="([^"]+)"', body))
        overlays = set(re.findall(r'id="([^"]+)" class="overlay', body)) | set(re.findall(r'class="overlay[^"]*" id="([^"]+)"', body))
        for o in opens - overlays:
            errs.append(f'trigger with no overlay · {pid} · {o}')
        for o in overlays - opens:
            errs.append(f'overlay with no trigger · {pid} · {o}')
        steps = set(re.findall(r'data-step="(\d+)"', body))
        for g in set(re.findall(r'data-goto="(\d+)"', body)) - steps:
            errs.append(f'goto with no step · {pid} · {g}')
        # a phone region must be a drawn 390 frame, never a squeezed desktop one
        for m in re.finditer(r'<div class="at-390">(.{0,400})', body, flags=re.S):
            if 'width:390px' not in m.group(1):
                errs.append(f'phone region is not a 390 frame · {pid}')

    # F-011: every product page is reachable from Sign In by clicking — the jump list does not count
    graph = {p['id']: {h.split('#')[0].split('?')[0][:-5] for h in links(p['body']) if h.endswith('.html') and h[:-5] in ids}
             for p in pages}
    seen, todo = {'index'}, ['index']
    while todo:
        for n in graph[todo.pop()]:
            if n not in seen:
                seen.add(n)
                todo.append(n)
    for pid in sorted(ids - seen):
        errs.append(f'unreachable from index.html · {pid}')
    return errs


def main():
    css = open(os.path.join(os.path.dirname(OUT), 'prototype', 'styles.css')).read()
    css += '\n' + open(os.path.join(OUT, '_app.css')).read()

    seen = set()
    for p in PAGES:
        assert p['id'] + '.html' not in seen, 'duplicate id: ' + p['id']
        seen.add(p['id'] + '.html')
    index_html = build_screens_index()
    errs = check(PAGES, index_html)
    if errs:
        print('\n'.join(sorted(set(errs))))
        raise SystemExit(f'{len(set(errs))} problems — nothing written')

    open(os.path.join(OUT, 'styles.css'), 'w').write(css)
    for p in PAGES:
        open(os.path.join(OUT, p['id'] + '.html'), 'w').write(shell(p))
    open(os.path.join(OUT, '_screens.html'), 'w').write(index_html)

    # A page dropped from the registry must leave the folder too. The first cut's screens
    # outlived their entries once; a stale .html is a screen still showing the wrong thing.
    import glob
    own = seen | {'_screens.html', '_selfcheck.html'}
    for f in glob.glob(os.path.join(OUT, '*.html')):
        if os.path.basename(f) not in own:
            os.remove(f)
            print('  removed stale', os.path.basename(f))
    print(f'{len(PAGES)} screens lifted from the export · all links resolve · none inert · '
          f'every screen reachable from index.html · every trigger has its overlay')


if __name__ == '__main__':
    main()
