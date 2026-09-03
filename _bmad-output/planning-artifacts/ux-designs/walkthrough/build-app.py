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

WHERE THE PRD STILL OVERRIDES THE FRAME, AND IT IS A SHORT LIST. R-74 gives the export the
construction; `prd.md` keeps behaviour and strings. So a lifted screen is corrected where
EXPERIENCE.md's "drawn, but on the wrong mechanism" table and Appendix F.1 say it must be — B24's
consequence, B16's cause, B19's mechanism, B11's zoom control, B13a's two remedies, B23a's
roster, and the four frames that disagree with F.1 on plan limits. Every one of those patches
carries a comment saying which ruling it serves.
"""
import os, re, html, importlib.util

_fspec = importlib.util.spec_from_file_location(
    'inflozo_frames', os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frames.py'))
frames = importlib.util.module_from_spec(_fspec)
_fspec.loader.exec_module(frames)
region, unbox, patch, link, attr = frames.region, frames.unbox, frames.patch, frames.link, frames.attr
part, decap = frames.part, frames.decap
overlay, trigger, pick, picked = frames.overlay, frames.trigger, frames.pick, frames.picked


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


def group(h, name, *texts):
    """A pick group, skipping options this frame does not draw."""
    present = [t for t in texts if t in h]
    if len(present) < 2:
        return h
    h = pick(h, name, *present)
    return picked(h, present[0])

OUT = os.path.dirname(os.path.abspath(__file__))
KIT_PATH = os.path.join(os.path.dirname(OUT), 'prototype', 'build.py')
_spec = importlib.util.spec_from_file_location('inflozo_kit', KIT_PATH)
kit = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kit)

FONTS = kit.FONTS
LIMITS = kit.LIMITS
ICON = kit.ICON

PAGES = []


def page(pid, title, body, cls='product', script=''):
    PAGES.append(dict(id=pid, title=title, body=body, cls=cls, script=script))


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
<body class="{p['cls']}">
<div id="live-polite" aria-live="polite" class="sr-only"></div>
{p['body']}
<script src="app.js"></script>
{('<script>' + p['script'] + '</script>') if p['script'] else ''}
</body>
</html>
"""


def fill(inner):
    """A lifted screen, sized to the window rather than to a 1440x900 frame."""
    return f'<div class="stage">{inner}</div>'


def menu(inner, mid, extra=''):
    """Turn a drawn dropdown into one that opens and closes."""
    i = inner.index('>')
    return inner[:i] + f' id="{mid}" class="overlay menu-lifted" {extra}' + inner[i:]


# ═════════════════════════════════════════════════════════════════════════════
# ENTRY — S1
# ═════════════════════════════════════════════════════════════════════════════
signin = unbox(region('S1 Sign In', label='S1a Sign in default'))
signin = link(signin, ('Send magic link', 'magic-link-sent.html'))
# the passkey button raises the OS sheet; Inflozo draws the page behind it and nothing of the sheet
signin = attr(signin, 'Sign in with a passkey', 'data-open="passkey"')
page('index', 'Sign in', fill(signin) + """
<div class="overlay sheet-wrap" id="passkey" style="align-items:center">
  <div class="sheet narrow" style="max-width:380px">
    <div class="head"><h2 style="font-size:16px">Sign in to &ldquo;inflozo.app&rdquo;</h2></div>
    <div class="body"><p class="softaa" style="font-size:13px">Use Touch ID to sign in with your saved passkey.</p></div>
    <div class="foot"><button class="btn secondary" data-close>Cancel</button>
      <a class="btn" href="dashboard.html" style="margin-left:auto">Use Touch ID</a></div></div></div>""")

mls = unbox(region('S1 Sign In', label='S1b Magic link sent'))
mls = link(mls, ('Use a different email', 'index.html'))
mls = patch(mls, ('Check your inbox ✨',
                  'Check your inbox ✨</div><a href="first-run.html" '
                  'style="display:none" id="open-link">x</a><div style="display:none">'))
page('magic-link-sent', 'Check your inbox', fill(mls) + """
<div style="position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:120">
  <a class="btn coral" href="first-run.html">Open the link (this is a walkthrough)</a></div>""")


# ═════════════════════════════════════════════════════════════════════════════
# ONBOARDING — S2
# ═════════════════════════════════════════════════════════════════════════════
fr = unbox(region('S2 Onboarding', label='S2a First run'))
fr = link(fr, ('Connect your Ghost site', 'connect-integration.html'),
              ('Start from a starter', 'starter-chooser.html'),
              ('Blank canvas', 'editor.html?empty'))
page('first-run', 'Welcome', fill(fr))

ci = unbox(region('S2 Onboarding', label='S2b1 Create integration'))
ci = link(ci, ('Done — next', 'connect-keys.html'), ('Back', 'first-run.html'))
page('connect-integration', 'Connect your Ghost site', fill(ci))

ck = unbox(region('S2 Onboarding', label='S2b Keys step'))
ck = link(ck, ('Back', 'connect-integration.html'))
ck = attr(ck, '>Connect<', 'id="go"')
page('connect-keys', 'Paste your keys', fill(ck), script="""
var b = document.getElementById('go');
if (b) b.addEventListener('click', function (e) {
  e.preventDefault(); b.textContent = 'Connecting…';
  setTimeout(function () { window.location.href = 'auto-branding.html'; }, 1100);
});""")

ab = unbox(region('S2 Onboarding', label='S2c Auto branding'))
ab = link(ab, ('Use your brand', 'redesign-proposals.html'), ('Skip', 'editor.html'))
page('auto-branding', 'Your brand', fill(ab))


# ═════════════════════════════════════════════════════════════════════════════
# DASHBOARD AND ACCOUNT — S3, S10, S11, S12, S13
# ═════════════════════════════════════════════════════════════════════════════
def app_links(h):
    """The rail and top bar are drawn on every app screen; wire them once."""
    for text, href in (('Projects', 'dashboard.html'), ('Sites', 'sites.html'),
                       ('Assets', 'assets.html')):
        if text in h:
            h = link(h, (text, href))
    return h


dash = unbox(region('S3 Dashboard', label='S3a Dashboard rich'))
dash = app_links(dash)
dash = link(dash, ('New project', 'starter-chooser.html'))
for name in ('Orbit Weekly', 'The Slow Web', 'Maya&#x27;s portfolio', 'Field Notes',
             'Launch page', 'Orbit Weekly — dark exp'):
    if name in dash:
        dash = link(dash, (name, 'editor.html'))
# S3a draws what's-new OPEN, because that is the state worth documenting. In the product it is a
# popover raised by the marigold button, so the drawn element keeps its look and gains a trigger.
dash = attr(dash, 'z-index:5', 'id="whatsnew" class="overlay menu-lifted"')
dash = attr(dash, 'background:#FFF4D6;cursor:pointer', 'data-open="whatsnew" aria-label="What&#x27;s new"')
# the bell and the account chip raise the two popovers S3d and S3e draw
dash = attr(dash, 'cursor:pointer;position:relative;transition:all 160ms ease-out',
            'data-open="notifs" aria-label="Notifications"')
dash = attr(dash, 'margin-top:auto;display:flex', 'data-open="acct"')
dash += ('<div id="notifs" class="overlay sheet-lifted">'
         + decap(part('S3 Dashboard', 0, caption='S3e ·')) + '</div>'
         + '<div id="acct" class="overlay sheet-lifted">'
         + decap(part('S3 Dashboard', 0, caption='S3d ·')) + '</div>')
page('dashboard', 'Projects', fill(dash))

dfree = unbox(region('S3 Dashboard', label='S3c Dashboard free plan'))
dfree = app_links(dfree)
dfree = link(dfree, ('Go Pro — $15/mo', 'upgrade.html'))
page('dashboard-free', 'Projects', fill(dfree))

dempty = unbox(region('S3 Dashboard', label='S3b Dashboard empty'))
dempty = app_links(dempty)
dempty = link(dempty, ('Every great site starts somewhere.', 'starter-chooser.html'))
page('dashboard-empty', 'Projects', fill(dempty))

sites = unbox(region('S11 Sites', label='S11a Sites'))
sites = app_links(sites)
sites = link(sites, ('Manage API keys', 'manage-keys.html'))
# S11a draws the ⋯ menu open. Give it a trigger, and hang S11b's connect modal off the button.
sites = attr(sites, 'Re-check connection', 'x-menu')          # marks the row for the walk-up below
_i = sites.index('x-menu')
_start = sites.rindex('<div', 0, sites.rindex('<div', 0, _i))  # the menu is two levels above the row
sites = sites[:_start + 4] + ' id="site-menu" class="overlay menu-lifted"' + sites[_start + 4:]
sites = sites.replace(' x-menu', '', 1)
sites = attr(sites, 'Connect site', 'data-open="connect-site"')
sites += ('<div id="connect-site" class="overlay sheet-lifted">'
          + decap(region('S11 Sites', caption='S11b ·')) + '</div>')
page('sites', 'Sites', fill(sites))

keys = unbox(region('S11 Sites', caption='S11d ·'))
keys = wire(keys, ('Save &amp; re-check', 'sites.html'), ('Cancel', 'sites.html'),
             ('Test connection', 'manage-keys.html'))
page('manage-keys', 'Keys', fill(keys) + '<div class="stage-back"><a class="btn secondary" href="sites.html">← Sites</a></div>')

assets = unbox(region('S10 Assets', label='S10a Asset library'))
assets = app_links(assets)
assets = trigger(assets, 'Upload', 'dropzone')
assets = trigger(assets, 'hero-shot.jpg', 'asset-details')
assets += ('<div id="dropzone" class="overlay sheet-lifted">'
           + decap(region('S10 Assets', caption='S10b ·')) + '</div>'
           + '<div id="asset-details" class="overlay sheet-lifted">'
           + decap(region('S10 Assets', label='S10d Image details')) + '</div>'
           + '<div id="delete-asset" class="overlay sheet-lifted">'
           + decap(region('S10 Assets', caption='S10c ·')) + '</div>')
page('assets', 'Assets', fill(assets))


# S10d is the details panel Assets raises; it does not need a page of its own.

bill = unbox(region('S12 Billing', caption='S12a ·'))
bill = trigger(bill, 'View invoices', 'invoices')
bill = trigger(bill, 'Delete account', 'delete-acct', nth=1)   # the button, not the heading
bill = trigger(bill, 'Cancel plan', 'upgrade-modal')
bill += ('<div id="invoices" class="overlay sheet-lifted">'
         + decap(region('S12 Billing', caption='S12d ·')) + '</div>'
         + '<div id="delete-acct" class="overlay sheet-lifted">'
         + decap(region('S12 Billing', caption='S12c ·')) + '</div>'
         + '<div id="upgrade-modal" class="overlay sheet-lifted">'
         + decap(region('S12 Billing', caption='S12b ·')) + '</div>')
page('billing', 'Account & billing', fill(bill))

# Invoices, Delete account and the upgrade modal are overlays on Billing now, raised by the
# controls S12a draws for them. Upgrade keeps a page of its own because half the product links to it.
up = unbox(region('S12 Billing', caption='S12b ·'))
up = group(up, 'interval', 'Monthly', 'Yearly')
up = wire(up, ('Go Pro — $15/mo', 'dashboard.html'))
page('upgrade', 'Go Pro', fill(up)
     + '<div class="stage-back"><a class="btn secondary" href="dashboard.html">← Back</a></div>')

sugg = unbox(region('S13 Suggestions', label='S13a Suggestions'))
sugg = trigger(sugg, 'Suggest something', 'suggest')
sugg = pick(sugg, 'tab', 'Top', 'New', 'Planned', 'Building', 'Shipped')
sugg = picked(sugg, 'Top')
sugg += ('<div id="suggest" class="overlay sheet-lifted">'
         + decap(region('S13 Suggestions', caption='S13b ·')) + '</div>')
page('suggestions', 'Suggestions', fill(sugg)
     + '<div class="stage-back"><a class="btn secondary" href="dashboard.html">← Projects</a></div>')


# ═════════════════════════════════════════════════════════════════════════════
# THE EDITOR — S4, S5, S6, S7, S9, S14, C
# ═════════════════════════════════════════════════════════════════════════════
ed = unbox(region('S4 Editor', label='S4a Editor rest'))
# S4a documents the template dropdown OPEN. In the product it opens from the Template button,
# so the drawn menu becomes an overlay and the button becomes its trigger.
_m = re.search(r'<div style="position:absolute;left:calc\(50% - 115px\);top:44px[^"]*"', ed)
ed = ed[:_m.start()] + '<div id="template-menu" class="overlay menu-lifted"' + \
     ed[_m.start() + len('<div'):]
ed = attr(ed, '>Template<', 'data-open="template-menu"')
ed = link(ed, ('Ship it', 'deploy.html'))
ed = link(ed, ('+ Add section', 'section-picker.html'))
# every template row in the drawn menu goes somewhere real
ed = link(ed, ('>Post<'[1:-1], 'post-content.html'))
ed = link(ed, ('Change', 'style-packs.html'))
ed = attr(ed, '>View as<', 'data-open="viewas"')
ed = pick(ed, 'device', 'Desktop', 'Tablet', 'Mobile') if 'Desktop' in ed else ed
ed += ('<div id="viewas" class="overlay sheet-lifted">'
       + decap(region('S4 Editor', caption='S4d ·')) + '</div>')
page('editor', 'Orbit Weekly · Home', fill(ed), script="""
document.body.setAttribute('data-editor-shell', '1');
// [ and ] walk the drawn design states: S4a rest -> S4b hover -> S4c selected.
var STATES = ['editor.html', 'editor-hover.html', 'editor-selected.html'];
document.addEventListener('keydown', function (e) {
  if (e.key === ']') location.href = STATES[1];
  if (e.key === 'p' || e.key === 'P') location.href = 'preview-mode.html';
});""")

hov = unbox(region('S4 Editor', label='S4b Editor hover'))
hov = wire(hov, ('Ship it', 'deploy.html'), ('+ Add section', 'section-picker.html'))
page('editor-hover', 'Orbit Weekly · Home', fill(hov)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Rest</a>'
       '<a class="btn coral" href="editor-selected.html">Select it →</a></div>')

pv = unbox(region('B Missing Surfaces', caption='B3b ·'))
pv = wire(pv, ('Back to editing', 'editor.html'))
pv = group(pv, 'device', 'Desktop', 'Tablet', 'Mobile')
page('preview-mode', 'Preview', fill(pv)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Back to editing</a></div>')

sel = unbox(region('S4 Editor', label='S4c Editor selected'))
sel = group(sel, 'align', 'Left', 'Centred', 'Center')
sel = group(sel, 'height', 'Compact', 'Comfortable', 'Tall')
sel = wire(sel, ('Ship it', 'deploy.html'), ('+ Add section', 'section-picker.html'))
page('editor-selected', 'Orbit Weekly · Home', fill(sel)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Deselect</a></div>')

picker = unbox(region('S5 Section Picker', label='S5a Section picker'))
picker = link(picker, ('Add', 'editor.html'))
picker = pick(picker, 'cat', 'Headers', 'Heroes', 'Post Grids', 'Footers')
picker = picked(picker, 'Heroes')
page('section-picker', 'Add a section', fill(picker)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">Esc — close</a></div>',
     script="document.addEventListener('keydown',function(e){if(e.key==='Escape')location.href='editor.html';});")

vs = unbox(region('S6 Variant Shuffle', label='S6 Variant shuffle'))
vs = group(vs, 'density', 'Compact', 'Comfortable', 'Spacious')
vs = wire(vs, ('Ship it', 'deploy.html'), ('+ Add section', 'section-picker.html'))
page('variant-shuffle', 'Shuffle', fill(vs)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a></div>')

packs = unbox(region('S7 Style Packs', caption='S7b ·'))
packs = group(packs, 'width', 'Narrow', 'Standard', 'Wide')
packs = group(packs, 'corners', 'Sharp', 'Soft', 'Round')
packs = group(packs, 'density', 'Compact', 'Comfortable', 'Spacious')
packs = wire(packs, ('New pack', 'style-pack-edit.html'), ('Ship it', 'deploy.html'))
page('style-packs', 'Style Packs', fill(packs)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a></div>')
spe = unbox(region('S7 Style Packs', caption='S7c ·'))
spe = group(spe, 'mode', 'Light', 'Dark')
spe = wire(spe, ('Save pack', 'style-packs.html'), ('Cancel', 'style-packs.html'))
page('style-pack-edit', 'Edit pack', fill(spe)
     + '<div class="stage-back"><a class="btn secondary" href="style-packs.html">← Packs</a></div>')

routes = unbox(region('S9 Routes', label='S9a Routes manager'))
routes = trigger(routes, '+ New collection', 'new-collection')
routes = trigger(routes, '+ Custom route', 'new-route')
routes = wire(routes, ('Ship update', 'deploy.html'))
routes += ('<div id="new-collection" class="overlay sheet-lifted">'
           + decap(region('S9 Routes', caption='S9c ·')) + '</div>'
           + '<div id="new-route" class="overlay sheet-lifted">'
           + decap(region('S9 Routes', caption='S9e ·')) + '</div>')
page('routes-manager', 'Routes & Templates', fill(routes)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a></div>')
rempty = unbox(region('S9 Routes', label='S9d Routes empty'))
rempty = wire(rempty, ('+ New collection', 'routes-manager.html'))
page('routes-empty', 'Routes & Templates', fill(rempty)
     + '<div class="stage-back"><a class="btn secondary" href="routes-manager.html">← Routes</a></div>')

cards = unbox(region('S14 Editor Cards', caption='S14e ·'))
cards = group(cards, 'callout-col', 'Pack tokens', 'Ghost&#x27;s palette')
cards = group(cards, 'emoji-size', 'Small', 'Large')
cards = group(cards, 'bg-role', 'Base', 'Surface', 'Tint', 'Accent')
cards = trigger(cards, 'Reset to Ghost default', 'reset-card')
cards += ('<div id="reset-card" class="overlay sheet-lifted">'
          + decap(region('S14 Editor Cards', label='S14c reset confirm')) + '</div>')
page('editor-cards', 'Editor cards', fill(cards)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a></div>')
post = unbox(region('C Post Body', label='C2a Post content desktop'))
post = group(post, 'measure', 'Narrow', 'Comfortable', 'Wide')
post = wire(post, ('Ship update', 'deploy.html'), ('Preview', 'preview-mode.html'))
page('post-content', 'Post template', fill(post)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a></div>')
pay = unbox(region('C Post Body', label='C3a Paywall editor'))
pay = group(pay, 'treat', 'None', 'Fade', 'Blur')
pay = group(pay, 'tiers', 'All paid', 'Cheapest', 'One I pick')
pay = group(pay, 'surface', 'Page', 'Tinted', 'Inverted')
pay = group(pay, 'member', 'Anonymous', 'Free member', 'Paid member')
pay = wire(pay, ('Back to post', 'post-content.html'), ('Ship update', 'deploy.html'))
page('paywall-editor', 'Paywall', fill(pay)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a></div>')
sg = unbox(region('C Post Body', label='C4 Style-guide fixture'))
sg = wire(sg, ('Swap to a real post from the content-source pill at any time', 'post-content.html'))
page('style-guide', 'Style-guide article', fill(sg)
     + '<div class="stage-back"><a class="btn secondary" href="post-content.html">← Post template</a></div>')

theme = unbox(region('B Missing Surfaces', caption='B17 ·'))
theme = group(theme, 'settings-nav', 'Site basics', 'Navigation', 'Social accounts', 'Code injection')
theme = wire(theme, ('Translations', 'theme-settings.html'), ('Promote', 'theme-settings.html'),
             ('Ship update', 'deploy.html'))
page('theme-settings', 'Theme settings', fill(theme)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a></div>')


# ═════════════════════════════════════════════════════════════════════════════
# SHIPPING — S8
# ═════════════════════════════════════════════════════════════════════════════
# The wizard is four drawn frames and ONE surface. Each becomes a step of the same page, so
# it walks the way it will in the product — and each step is still the frame, untouched.
d1 = unbox(region('S8 Deploy', label='S8a Ship step 1'))
d1 = pick(d1, 'dest', 'Deploy &amp; activate', 'Deploy only')
d1 = picked(d1, 'Deploy &amp; activate')
d1 = attr(d1, '>Run checks<', 'data-goto="2"')
d2 = unbox(region('S8 Deploy', caption='S8b ·'))
d2 = attr(d2, '>Ship it<', 'data-run="4" data-goto-first="3" data-run-host="ship3"')
d2 = attr(d2, '>Back<', 'data-goto="1"')
d3 = unbox(region('S8 Deploy', caption='S8c ·'))
d4 = unbox(region('S8 Deploy', caption='S8d ·'))
d4 = link(d4, ('Done', 'editor.html'))
d5 = unbox(region('S8 Deploy', caption='S8d′ ·'))
d5 = link(d5, ('Reconnect site', 'manage-keys.html'))

page('deploy', 'Ship it', f'''<div class="stage" data-wizard data-at="1">
  <div data-step="1">{d1}</div>
  <div data-step="2" hidden>{d2}</div>
  <div data-step="3" hidden id="ship3">{d3}</div>
  <div data-step="4" hidden>{d4}</div>
  <div data-step="5" hidden>{d5}</div>
</div>
<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a>
  <button class="btn secondary" data-goto="5">See the failure ending</button>
  <a class="btn secondary" href="deploy-history.html">History</a></div>''')
po = unbox(region('S8 Deploy', caption='S8a′ ·'))
po = wire(po, ('Download theme', 'sites.html'), ('Which Ghost plans work? ↗', 'pricing.html'))
page('deploy-preview-only', 'Preview-only', fill(po)
     + '<div class="stage-back"><a class="btn secondary" href="sites.html">← Sites</a></div>')
hist = unbox(region('S8 Deploy', label='S8e History drawer'))
hist = wire(hist, ('View site', 'editor.html'), ('Cancel', 'deploy-history.html'))
hist = group(hist, 'ver', 'v5', 'v4', 'v3')
page('deploy-history', 'History', fill(hist)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a></div>')

pex = unbox(region('B Missing Surfaces', caption='B13a ·'))
pex = wire(pex, ('Swap and ship free', 'deploy.html'), ('Go Pro and ship', 'upgrade.html'))
page('pro-exit', 'Four Pro designs are in this site', fill(pex)
     + '<div class="stage-back"><a class="btn secondary" href="editor.html">← Editor</a>'
       '<a class="btn secondary" href="upgrade.html">Go Pro</a></div>')

starter = unbox(region('B Missing Surfaces', label='B23a Chooser'))
starter = link(starter, ('Start empty', 'editor.html?empty'))
page('starter-chooser', 'Pick your starter', fill(starter))

# B22 IS drawn. Its four per-section swaps are re-specified by ruling R-78 / FR-C7 into 2–3
# WHOLE-SITE starter x Style Pack combinations — the card, the NOW / PROPOSED pairing and the
# argued-from-your-own-data sentence are the frame's and stay; the unit changes. And its fourth
# proposal is deleted outright: "no tag template, so Ghost falls back to a bare list" is false on
# Inflozo, where tag.hbs always compiles from the Synthesis Defaults.
prop = unbox(region('B Missing Surfaces', caption='B22 · #22'))
prop = link(prop, ('Start from my site as-is', 'editor.html'))
prop = link(prop, ('Apply all four', 'editor.html'))
page('redesign-proposals', 'Redesign proposals', fill(prop)
     + '<div class="stage-back"><a class="btn secondary" href="starter-chooser.html">Show me the starters</a>'
       '<a class="btn secondary" href="editor.html?empty">Start from my site as-is</a></div>')

mk = unbox(region('M5 Pricing', label='M5 Pricing'))
mk = group(mk, 'interval', 'Monthly', 'Yearly')
mk = wire(mk, ('Start free', 'index.html'), ('Go Pro', 'upgrade.html'), ('Sign in', 'index.html'))
page('pricing', 'Pricing', fill(mk))


# Surfaces this cut does NOT contain, and the honest reason. Every one of them has no frame in
# the export: EXPERIENCE.md names the frame each is extrapolated from and Appendix A carries a
# Claude Design prompt for it, and none of those prompts has been run. They were in the first cut,
# authored from prose; they are held back here rather than mixed in, because the whole point of
# this cut is that what you are looking at is what was drawn.
NOT_YET = [
    ('Backup Gate · Staff Token Offer', 'prompt A1 — not drawn'),
    ('Deploy history with pinning · Partial success', 'prompt A2 — the drawn S8e has neither'),
    ('Drift Report', 'prompt A3 — not drawn'),
    ('New Project Sheet · Over-Limit Sheet · Small Screen Notice', 'prompt A4 — not drawn'),
    ('Canvas markers · Template Switcher, complete · Preview subject', 'prompt A5 — not drawn'),
    ('Theme Settings, completed · Credits toggle', 'prompt A6 — B17 is drawn, the additions are not'),
    ('The editor at 834 and at 720 · the skip link', 'prompt A8 — the editor exists at 1440 only'),
    ('Grace Banner · Routes Fallback · Template Binding · Preview-Only Notice',
     'drawn, but on a mechanism EXPERIENCE.md re-specifies — see its "wrong mechanism" table'),
]


def build_screens_index():
    titles = {p['id']: p['title'] for p in PAGES}
    rows = ''.join(f'<a class="idxrow" href="{p["id"]}.html"><b>{html.escape(p["title"])}</b>'
                   f'<span class="k">{p["id"]}.html</span></a>' for p in PAGES)
    missing = ''.join(f'<div class="idxrow" style="border-style:dashed;opacity:.75">{n}'
                      f'<span class="k">{why}</span></div>' for n, why in NOT_YET)
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Every screen · Inflozo walkthrough</title>
{FONTS}<link rel="stylesheet" href="styles.css"></head>
<body class="product"><div class="screens-index">
  <h1 style="font-size:30px">Every screen</h1>
  <p class="softaa" style="font-size:14px;line-height:1.6;max-width:74ch;margin-top:10px">
    This page is the only thing here that is not the product. <b>Start at
    <a href="index.html">index.html</a></b> and click through as a user would; come back here to skip ahead.</p>
  <p class="helper" style="margin-top:10px;max-width:74ch">Every screen below is <b>lifted from the
    Claude Design export</b> — the markup is the frame's own, not a re-drawing of it — and then wired up so
    it behaves. If a screen looks wrong, the frame is what it looks like, and that is the point.</p>
  <p class="helper" style="margin-top:8px;max-width:74ch"><b>What responds.</b> Menus, popovers and sheets
    open from the control that raises them and close on <span class="kbd">Esc</span> or a click outside —
    the account chip, the bell, what's-new, the site ⋯, the connect modal, invoices, delete account, the
    upload zone, image details, the suggestion sheet, the new-collection and new-route sheets, the card
    reset. Segmented controls, tab rows and radio lists <b>pick</b>, and the selected look is the one the
    frame drew rather than one a stylesheet guessed. The deploy wizard <b>walks</b> its four drawn steps
    with progress that fills. Every screen links to the ones it reaches. The build refuses to write if any
    screen ends up with nothing that responds.</p>
  <div class="idxgrid" style="margin-top:22px">{rows}</div>
  <h2 style="font-size:18px;margin:32px 0 6px">Not in this cut, and why</h2>
  <p class="helper" style="max-width:74ch;margin-bottom:12px">These surfaces <b>have no frame in the
    export.</b> EXPERIENCE.md names the frame each is extrapolated from and Appendix A carries a Claude
    Design prompt for it — <b>and none of those prompts has been run</b>. They are held out of this cut
    rather than mixed into it, so that everything above is checkable against something drawn.
    Step 5b's prototype has all of them, described.</p>
  <div class="idxgrid">{missing}</div>
  <p class="helper" style="margin-top:24px"><a href="_selfcheck.html">app.js self-check</a> ·
    <a href="../prototype/index.html">step 5b — the annotated prototype</a></p>
</div></body></html>
"""


def main():
    css = open(os.path.join(os.path.dirname(OUT), 'prototype', 'styles.css')).read()
    css += '\n' + open(os.path.join(OUT, '_app.css')).read()
    open(os.path.join(OUT, 'styles.css'), 'w').write(css)

    seen = set()
    for p in PAGES:
        assert p['id'] + '.html' not in seen, 'duplicate id: ' + p['id']
        seen.add(p['id'] + '.html')
        open(os.path.join(OUT, p['id'] + '.html'), 'w').write(shell(p))
    open(os.path.join(OUT, '_screens.html'), 'w').write(build_screens_index())

    # A page dropped from the registry must leave the folder too. The first cut's screens
    # outlived their entries once; a stale .html is a screen still showing the wrong thing.
    import glob
    own = seen | {'_screens.html', '_selfcheck.html'}
    for f in glob.glob(os.path.join(OUT, '*.html')):
        if os.path.basename(f) not in own:
            os.remove(f)
            print('  removed stale', os.path.basename(f))

    files = ({p['id'] + '.html' for p in PAGES}
             | {'styles.css', 'app.js', '_screens.html', '_selfcheck.html',
                '../prototype/index.html'})
    bad = []
    for p in PAGES + [dict(id='_screens', title='', body=build_screens_index(), cls='', script='')]:
        src = p['body']
        for href in re.findall(r'href="([^"]+)"', src):
            if href.startswith(('http', 'mailto:', '#')):
                continue
            tgt = href.split('#')[0].split('?')[0]
            if tgt and tgt not in files:
                bad.append(f'{p["id"]} → {href}')
    if bad:
        print('\n'.join(sorted(set(bad))))
        raise SystemExit(f'{len(set(bad))} dead links')

    # EVERY SCREEN MUST DO SOMETHING. This exists because the lift rebuild silently
    # stripped the interaction out of a build whose whole purpose is to behave, and
    # nothing caught it — the links resolved, so the build reported success. A screen
    # with no affordance except the scaffolding bar is a dead end, and a walkthrough
    # made of dead ends is a slide deck.
    inert = []
    for p in PAGES:
        body = re.sub(r'<div class="stage-back">.*?</div>\s*$', '', p['body'], flags=re.S)
        hooks = (len(re.findall(r'data-(open|goto|pick|run|close)=', body))
                 + len(re.findall(r'href="[A-Za-z0-9_.-]+\.html', body)))
        if hooks == 0:
            inert.append(p['id'])
    if inert:
        raise SystemExit('inert screens — nothing on them responds: ' + ', '.join(sorted(inert)))
    print(f'{len(PAGES)} screens lifted from the export · all links resolve · none inert')


if __name__ == '__main__':
    main()
