#!/usr/bin/env python3
"""Inflozo — the step-5c walkthrough generator.

    python3 build-app.py        # writes every screen, styles.css and _screens.html

WHAT THIS IS, AND HOW IT DIFFERS FROM STEP 5B.

Step 5b's prototype is **annotated**: every page carries its frame reference, the
journey trails it sits on, and a note on every re-specified surface. That is what
makes it checkable against the export — and it is also why it cannot answer "what
will this feel like". The owner read one and asked for the other.

So this is the same product with the scaffolding taken off and the behaviour put
on: no frame captions, no trail bars, no notes, no stacked state variants. One
screen per screen, real navigation, real menus, real modals, the real keyboard
map, and dummy data throughout. It is what the app looks like on the day it ships.

BOTH ARE KEPT, AND NEITHER REPLACES THE OTHER. 5b is how you check a screen is
right; 5c is how you find out whether it is any good. A change to the design
belongs in both.

THE TOKENS ARE STILL TRANSCRIBED EXACTLY ONCE. This file imports the step-5b
builder as a module and reuses its colour, type and component vocabulary, its
fixture site and its plan matrix — so the two can never drift into two different
products. `styles.css` here is generated as 5b's stylesheet plus `_app.css`.
"""
import os, re, html, importlib.util

OUT = os.path.dirname(os.path.abspath(__file__))
KIT_PATH = os.path.join(os.path.dirname(OUT), 'prototype', 'build.py')

_spec = importlib.util.spec_from_file_location('inflozo_kit', KIT_PATH)
kit = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kit)          # defines the registry; writes nothing

ICON = kit.ICON
LIMITS = kit.LIMITS
STARTERS = kit.STARTERS
BACKUP_ROWS = kit.BACKUP_ROWS
limits_table = kit.limits_table

FONTS = kit.FONTS

PAGES = []


def page(pid, title, body, cls='product', extra_head='', script=''):
    PAGES.append(dict(id=pid, title=title, body=body, cls=cls,
                      extra_head=extra_head, script=script))


def shell(p):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(p['title'])} · Inflozo</title>
{FONTS}
<link rel="stylesheet" href="styles.css">
{p['extra_head']}
</head>
<body class="{p['cls']}">
<div id="live-polite" aria-live="polite" class="sr-only"></div>
{p['body']}
<script src="app.js"></script>
{('<script>' + p['script'] + '</script>') if p['script'] else ''}
</body>
</html>
"""


# ═════════════════════════════════════════════════════════════════════════════
# The application shell — the real one, with the menus wired
# ═════════════════════════════════════════════════════════════════════════════
def rail(active, plan='pro', used='312 MB', cap='of 5 GB', pct=6, over=False):
    who = ('M', 'Maya Chen', 'maya@orbitweekly.com', '<span class="badge pro">✦ Pro</span>', 'avatar') \
        if plan == 'pro' else \
        ('S', 'Sam Okafor', 'sam@fieldnotes.blog', '<span class="badge free">Free</span>', 'avatar sam')

    def nav(key, label, icon, href):
        return f'<a class="nav{" on" if key == active else ""}" href="{href}">{ICON[icon]}{label}</a>'

    return f"""<div class="rail">
  <a class="word" href="dashboard.html">Inflozo</a>
  <div class="stack gap4">
    {nav('projects', 'Projects', 'grid', 'dashboard.html')}
    {nav('sites', 'Sites', 'globe', 'sites.html')}
    {nav('assets', 'Assets', 'image', 'assets.html')}
    <a class="meter{' over' if over else ''}" href="assets.html">
      <div class="track"><div class="fill" style="width:{pct}%"></div></div>
      <span class="helper"><span class="mono">{used}</span> {cap}</span></a>
  </div>
  <div class="anchor" style="margin-top:auto">
    <button class="acct" data-open="account-menu" aria-haspopup="true" style="width:100%;border:none;background:none;font-family:var(--ui);cursor:pointer;text-align:left">
      <span class="{who[4]}">{who[0]}</span>
      <span class="stack"><span style="font-size:13px;font-weight:600">{who[1]}</span>
        <span class="helper">{who[2]}</span></span>
      <span style="margin-left:auto">{who[3]}</span>
    </button>
    <div class="overlay menu up left" id="account-menu" role="menu">
      <a class="mrow" href="billing.html">Account settings</a>
      <a class="mrow" href="billing.html">Billing &amp; plan {who[3]}</a>
      <a class="mrow" href="suggestions.html">Suggestions</a>
      <a class="mrow" href="pricing.html">Docs</a>
      <a class="mrow" href="#" data-open="shortcuts">Keyboard shortcuts<span class="kbd" style="margin-left:auto">?</span></a>
      <div class="msep"></div>
      <a class="mrow" href="index.html">Sign out</a>
    </div>
  </div>
</div>"""


NOTIF_ROWS = [
    ('Orbit Weekly is live.', 'Your site just got gorgeous.', '14 minutes ago · shipped by you', 'new', None),
    ('Deploy failed on Maya&rsquo;s Studio.', 'Ghost said no — your Admin key expired.', 'Yesterday, 18:02', '',
     ('See what failed →', 'deploy.html?failed', 'danger')),
    ('Three designs in Orbit Weekly were improved.', 'Redeploy when you are ready.', '2 days ago', '',
     ('Review →', 'deploy.html', 'sky')),
    ('One step left on Orbit Weekly.', 'Three templates shipped that a Ghost page still has to point at.',
     '2 days ago', '', ('Open the checklist →', 'binding-checklist.html', 'sky')),
    ('Ghost card designs are here.', 'Every editor card is yours to style.', 'Last week', '', None),
]


def notif_menu():
    rows = ''
    for head, tail, when, state, action in NOTIF_ROWS:
        act = (f'<a class="small" href="{action[1]}" style="color:var(--{action[2]}-text)">{action[0]}</a>'
               if action else '')
        rows += (f'<div class="row gap10" style="padding:11px 10px;align-items:flex-start;border-radius:8px;'
                 f'{"background:var(--coral-tint)" if state == "new" else ""}">'
                 f'<span class="dot {"coral" if state == "new" else "grey"}" style="margin-top:6px"></span>'
                 f'<span class="stack gap2 grow"><span style="font-size:13px;line-height:1.45">'
                 f'<b>{head}</b> {tail}</span><span class="helper">{when}</span>{act}</span></div>')
    return f"""<div class="overlay menu wide" id="notifications" role="menu" style="width:400px">
  <div class="row gap10" style="padding:4px 10px 8px"><span class="panel-label grow">Notifications</span>
    <a class="small soft" href="#" data-close>Mark all read</a></div>
  {rows}
  <div class="msep"></div>
  <p class="helper" style="padding:0 10px 6px">Deploy outcomes always land here, even if you closed the tab.</p>
</div>"""


SHORTCUTS = [('Insert section', ['⌘K']), ('Previous / next design', ['[', ']']), ('Duplicate', ['⌘D']),
             ('Delete', ['Del']), ('Undo / redo', ['⌘Z', '⇧⌘Z']), ('Save now', ['⌘S']),
             ('Device preview', ['1', '2', '3']), ('Layers', ['L']), ('Dark preview', ['.']),
             ('Deselect', ['Esc']), ('Preview Mode', ['P']), ('Site Remix', ['⇧R']), ('Ship it', ['⌘⏎'])]


def shortcuts_sheet():
    rows = ''.join(
        f'<div class="row gap10" style="padding:8px 0;border-bottom:1px solid var(--line-faint)">'
        f'<span style="font-size:13px" class="grow">{a}</span>'
        + ''.join(f'<span class="kbd">{k}</span>' for k in ks) + '</div>'
        for a, ks in SHORTCUTS)
    return f"""<div class="overlay sheet-wrap" id="shortcuts">
  <div class="sheet narrow"><div class="head"><h2 style="font-size:20px">Keyboard shortcuts</h2></div>
  <div class="body">{rows}
    <p class="helper">Single-key shortcuts are live only while the editor has focus, and never while
      you are typing.</p></div>
  <div class="foot"><button class="btn secondary" data-close>Close</button></div></div></div>"""


def topbar(search='Search projects…', right='', filt=None):
    f = f' data-filter="{filt[0]}" data-filter-empty="{filt[1]}"' if filt else ''
    return f"""<div class="topbar">
  <label class="search">{ICON['search']}
    <input{f} placeholder="{search}" aria-label="{search}"
      style="border:none;background:none;outline:none;font-family:var(--ui);font-size:13px;flex:1;color:var(--ink)">
    <span class="kbd">⌘K</span></label>
  <div class="row gap10" style="margin-left:auto">{right}</div>
</div>"""


BELL = (f'<span class="anchor"><button class="iconbtn" data-open="notifications" aria-label="Notifications" '
        f'style="border:none;background:none;cursor:pointer">{ICON["bell"]}<span class="dot-new"></span></button>'
        + notif_menu() + '</span>')
NEWPROJ = f'<button class="btn coral" data-open="new-project">{ICON["plus"]}New project</button>'


def app(active, body, plan='pro', right='', search='Search projects…', filt=None, tail='', **kw):
    return (f'<div class="app">{rail(active, plan=plan, **kw)}<div class="appmain">'
            f'{topbar(search, right, filt)}<div class="appbody">{body}</div></div></div>'
            f'{shortcuts_sheet()}{tail}')


# ═════════════════════════════════════════════════════════════════════════════
# ENTRY  —  index.html is Sign In, because that is the product's front door
# ═════════════════════════════════════════════════════════════════════════════
page('index', 'Sign in', f"""
<span style="font-family:var(--display);font-weight:800;font-size:22px;letter-spacing:-.02em">Inflozo</span>
<div class="card authcard"><div class="pad" style="display:flex;flex-direction:column;gap:18px">
  <div class="stack gap6"><h1 style="font-size:24px">Make something gorgeous.</h1>
    <p class="softaa" style="font-size:13.5px">Sign in or create an account — no passwords, ever.</p></div>
  <label class="field"><span class="control-label">Email</span>
    <input class="input" type="email" value="maya@orbitweekly.com" aria-label="Email"></label>
  <a class="btn coral lg" href="magic-link-sent.html" style="width:100%">Send magic link</a>
  <div class="row gap10"><span style="flex:1;height:1px;background:var(--line)"></span>
    <span class="helper">or</span><span style="flex:1;height:1px;background:var(--line)"></span></div>
  <button class="btn secondary lg" data-open="passkey" style="width:100%">Sign in with a passkey</button>
</div></div>
<div class="row gap8 helper"><a href="pricing.html">Pricing</a><span>·</span><span>Terms</span><span>·</span><span>Privacy</span></div>
<div class="overlay sheet-wrap" id="passkey" style="align-items:center">
  <div class="sheet narrow" style="max-width:380px">
    <div class="head"><h2 style="font-size:16px">Sign in to &ldquo;inflozo.app&rdquo;</h2></div>
    <div class="body"><p class="softaa" style="font-size:13px">Use Touch ID to sign in with your saved passkey.</p></div>
    <div class="foot"><button class="btn secondary" data-close>Cancel</button>
      <a class="btn" href="dashboard.html" style="margin-left:auto">Use Touch ID</a></div></div></div>
""", cls='auth')

page('magic-link-sent', 'Check your inbox', """
<span style="font-family:var(--display);font-weight:800;font-size:22px;letter-spacing:-.02em">Inflozo</span>
<div class="card authcard"><div class="pad" style="display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center">
  <h1 style="font-size:24px">Check your inbox ✨</h1>
  <p class="softaa" style="font-size:13.5px">We sent a magic link to <b class="mono">maya@orbitweekly.com</b><br>
    It&rsquo;s good for 15 minutes.</p>
  <p class="helper">Didn&rsquo;t get it? Resend in <span class="mono" id="countdown">0:27</span></p>
  <a class="btn coral" href="first-run.html">Open the link</a>
  <a class="btn ghost" href="index.html">Use a different email</a>
</div></div>
<div class="row gap8 helper"><span>Terms</span><span>·</span><span>Privacy</span></div>
""", cls='auth', script="""
var left = 27, el = document.getElementById('countdown');
var t = setInterval(function () {
  left--; if (left <= 0) { clearInterval(t); el.parentNode.innerHTML = '<a href="#">Resend the link</a>'; return; }
  el.textContent = '0:' + (left < 10 ? '0' : '') + left;
}, 1000);
""")

# ═════════════════════════════════════════════════════════════════════════════
# ONBOARDING
# ═════════════════════════════════════════════════════════════════════════════
page('first-run', 'Welcome', """
<div style="min-height:100vh;background:var(--paper);padding:56px 48px;display:flex;flex-direction:column;gap:32px;align-items:center;justify-content:center">
  <span style="font-family:var(--display);font-weight:800;font-size:20px;letter-spacing:-.02em">Inflozo</span>
  <h1 style="font-size:32px;text-align:center">Let&rsquo;s make your Ghost site gorgeous.</h1>
  <div class="grid g3 gap16" style="max-width:1060px;width:100%">
    <a class="radiocard on stack gap8" href="connect-integration.html" style="flex-direction:column;align-items:flex-start;padding:22px">
      <span class="badge notice">Recommended</span>
      <span class="t" style="font-size:16px">Connect your Ghost site</span>
      <span class="c">We&rsquo;ll bring in your colors, logo and posts.</span></a>
    <a class="radiocard stack gap8" href="starter-chooser.html" style="flex-direction:column;align-items:flex-start;padding:22px">
      <span class="t" style="font-size:16px">Start from a starter</span>
      <span class="c">Ten full sites. Pick one, make it yours.</span></a>
    <a class="radiocard stack gap8" href="editor.html?empty" style="flex-direction:column;align-items:flex-start;padding:22px">
      <span class="t" style="font-size:16px">Blank canvas</span>
      <span class="c">An empty page and every design. Go wild.</span></a>
  </div>
  <p class="helper">You can do all of this later.</p>
</div>""")

page('connect-integration', 'Connect your Ghost site', f"""
<div style="min-height:100vh;background:var(--paper);padding:48px;display:flex;flex-direction:column;gap:24px;align-items:center;justify-content:center">
  <div class="row gap12" style="width:100%;max-width:880px">
    <span style="font-family:var(--display);font-weight:800;font-size:20px">Inflozo</span>
    <span class="chip" style="margin-left:auto">1/2</span></div>
  <div class="card" style="width:100%;max-width:880px"><div class="pad" style="display:flex;gap:32px">
    <div class="stack gap16 grow">
      <div class="stack gap6"><h1 style="font-size:24px">First, a quick handshake.</h1>
        <p class="softaa" style="font-size:13.5px">Inflozo talks to Ghost through a custom integration. Takes about a minute.</p></div>
      <ol class="stack gap12" style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.5">
        <li>Open <b>Ghost Admin → Settings → Integrations</b></li>
        <li>Click <b>Add custom integration</b></li>
        <li>Name it <b>Inflozo</b> and save — it shows three things: an API URL and two keys</li></ol>
      <div class="row gap10"><a class="btn secondary" href="first-run.html">Back</a>
        <a class="btn coral" href="connect-keys.html">Done — next</a></div></div>
    <div class="thumb" style="width:340px;height:230px;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px">
      <span class="helper">Ghost Admin → Settings → Integrations → Add custom integration</span></div>
  </div></div>
</div>""")

page('connect-keys', 'Paste your keys', """
<div style="min-height:100vh;background:var(--paper);padding:48px;display:flex;flex-direction:column;gap:24px;align-items:center;justify-content:center">
  <div class="row gap12" style="width:100%;max-width:620px">
    <span style="font-family:var(--display);font-weight:800;font-size:20px">Inflozo</span>
    <span class="chip" style="margin-left:auto">2/2</span></div>
  <div class="card" style="width:100%;max-width:620px"><div class="pad" style="display:flex;flex-direction:column;gap:18px">
    <div class="stack gap6"><h1 style="font-size:24px">Now paste the three keys.</h1>
      <p class="softaa" style="font-size:13.5px">They&rsquo;re right on the Inflozo integration you just made.</p></div>
    <label class="field"><span class="control-label">API URL</span>
      <input class="input mono" value="https://orbitweekly.com" aria-label="API URL"></label>
    <label class="field"><span class="control-label">Admin API key</span>
      <input class="input mono" value="65a3f0e1c9d24b1f:9c2e77b0d1a4" aria-label="Admin API key"></label>
    <label class="field"><span class="control-label">Content API key</span>
      <input class="input mono" value="8d41c0a97b3e5f22a1" aria-label="Content API key"></label>
    <div id="checking" hidden><div class="banner info"><span class="ico">⋯</span>
      <span>Talking to orbitweekly.com…</span></div></div>
    <div id="found" hidden class="stack gap10">
      <div class="banner success"><span class="ico">✓</span><span><b>Ghost 6.58 — connected.</b>
        Your posts, pages, tags and authors are in.</span></div>
      <div class="banner info"><span class="ico">ⓘ</span><span><b>This site has code injection.</b>
        Your live pages can legitimately look different from the canvas, because that code runs on the
        site and not here. We&rsquo;ll only say this once.</span></div></div>
    <div class="row gap10"><a class="btn secondary" href="connect-integration.html">Back</a>
      <button class="btn coral" id="go">Connect</button>
      <a class="btn ghost" href="#">Where do I find these?</a></div>
  </div></div>
</div>""", script="""
document.getElementById('go').addEventListener('click', function (e) {
  e.preventDefault(); var b = this;
  document.getElementById('checking').hidden = false; b.classList.add('off'); b.textContent = 'Connecting…';
  setTimeout(function () {
    document.getElementById('checking').hidden = true;
    document.getElementById('found').hidden = false;
    b.classList.remove('off'); b.textContent = 'Continue';
    window.announce('Connected to Ghost 6.58');
    b.onclick = function () { window.location.href = 'auto-branding.html'; };
  }, 1400);
});
""")

page('auto-branding', 'Your brand', """
<div style="min-height:100vh;background:var(--paper);padding:48px;display:flex;flex-direction:column;gap:24px;align-items:center;justify-content:center">
  <span style="font-family:var(--display);font-weight:800;font-size:20px">Inflozo</span>
  <div class="stack gap6" style="text-align:center"><h1 style="font-size:28px">Nice site. Want to keep the vibe?</h1>
    <p class="softaa">We pulled these from orbitweekly.com — your call.</p></div>
  <div class="row gap24" style="width:100%;max-width:1000px;align-items:stretch">
    <div class="card grow"><div class="pad stack gap14">
      <span class="panel-label">Your site today</span>
      <div class="row gap10"><span class="avatar" style="background:#3B382F">O</span>
        <span class="stack"><b>Orbit Weekly</b><span class="helper">orbitweekly.com</span></span></div>
      <div class="stack gap6"><span class="control-label">Accent colour</span>
        <div class="row gap8"><span class="sw" style="background:#D96C3F"></span><span class="small">Burnt orange</span></div></div>
      <div class="stack gap6"><span class="control-label">Navigation</span>
        <div class="row gap8 wrap"><span class="chip">Essays</span><span class="chip">Notes</span>
          <span class="chip">Archive</span><span class="chip">About</span></div></div>
      <div class="stack gap6"><span class="control-label">Logo</span>
        <div class="row gap8"><span class="chip mono">orbit-wordmark.svg</span><span class="helper">SVG · 4 KB</span></div></div>
      <p class="helper">Fonts stay yours — pick a pairing once you&rsquo;re in the editor.</p></div></div>
    <div class="card" style="flex:1.3"><div class="pad stack gap10">
      <span class="panel-label">Your homepage, already wearing your brand</span>
      <div style="border-radius:10px;overflow:hidden;border:1px solid var(--line)">""" + kit.owsite() + """</div></div></div>
  </div>
  <div class="row gap10"><a class="btn coral lg" href="redesign-proposals.html">Use your brand</a>
    <a class="btn secondary lg" href="redesign-proposals.html">Skip</a></div>
</div>""")


page('redesign-proposals', 'Redesign proposals', """
<div style="min-height:100vh;background:var(--paper);padding:40px 48px;display:flex;flex-direction:column;gap:22px">
  <div class="stack gap6"><h1 style="font-size:28px">We had a look at orbitweekly.com</h1>
    <p class="softaa">Your posts, tags and images are already in. Here are two whole-site designs built
      around what you actually publish — same words, different sites. Take one, or neither.</p></div>
  <div class="grid g2 gap20">
    <div class="card"><div class="pad stack gap12">
      <div class="row gap8"><b style="font-size:15px">Gazette + Ink</b><span class="badge pro">✦ Has Pro designs</span></div>
      <div class="row gap10"><div class="stack gap4 grow"><span class="helper">NOW</span>
          <div class="thumb" style="height:150px"></div></div>
        <div class="stack gap4 grow"><span class="helper">PROPOSED</span>
          <div class="thumb" style="height:150px;background:#EFE9E1"></div></div></div>
      <p style="font-size:13px;line-height:1.5"><b>86 of your 118 posts have a feature image and your
        current homepage hides all of them.</b> Gazette leads with them: a magazine cover, a mixed grid
        and topic tabs off your 12 tags.</p>
      <div class="row gap10"><a class="btn coral" href="editor.html">Use this</a>
        <a class="btn secondary" href="editor.html?empty">Skip</a></div></div></div>
    <div class="card"><div class="pad stack gap12">
      <div class="row gap8"><b style="font-size:15px">Aurora + Tangerine</b><span class="badge pro">✦ Has Pro designs</span></div>
      <div class="row gap10"><div class="stack gap4 grow"><span class="helper">NOW</span>
          <div class="thumb" style="height:150px"></div></div>
        <div class="stack gap4 grow"><span class="helper">PROPOSED</span>
          <div class="thumb" style="height:150px;background:#F6E7DA"></div></div></div>
      <p style="font-size:13px;line-height:1.5"><b>You have 4,100 members and no signup above the fold.</b>
        Aurora puts the form there, opens with an issue preview, and your posts average nine minutes —
        so it pairs a measured reading layout with an index.</p>
      <div class="row gap10"><a class="btn coral" href="editor.html">Use this</a>
        <a class="btn secondary" href="editor.html?empty">Skip</a></div></div></div>
  </div>
  <div class="row gap12"><a class="btn secondary" href="starter-chooser.html">Show me all ten starters</a>
    <a class="btn ghost" href="editor.html?empty">Start from my site as-is</a>
    <span class="helper" style="margin-left:auto">Everything is reversible from the canvas.</span></div>
</div>""")

page('starter-chooser', 'Pick your starter', f"""
<div style="min-height:100vh;background:var(--paper);padding:40px 48px;display:flex;flex-direction:column;gap:24px">
  <div class="row gap12"><a href="first-run.html">{ICON['back']}</a>
    <span style="font-family:var(--display);font-weight:800;font-size:20px">Inflozo</span></div>
  <div class="stack gap6"><h1 style="font-size:28px">Pick your starter.</h1>
    <p class="softaa">Ten full sites, ready to wear your brand. You can restyle every section afterwards.</p></div>
  <div class="row gap8 wrap">
    <span class="seg"><span class="on">All 10</span><span>Writing</span><span>Newsletter</span>
      <span>Portfolio</span><span>Business</span></span>
    <label class="row gap8" style="margin-left:auto;cursor:pointer"><span class="toggle"></span>
      <span class="small soft">Free end-to-end only</span></label>
  </div>
  <div class="grid g5 gap16">{kit.starter_grid()}</div>
  <div class="card"><div class="pad row gap16">
    <div class="stack gap4 grow"><b>Rather not start from a starter?</b>
      <span class="helper">Begin with an empty site and add sections yourself. Every design is available
        on the canvas either way — you ship the free set, or go Pro.</span></div>
    <a class="btn secondary" href="editor.html?empty">Start empty</a>
    <a class="btn coral" href="editor.html">Use Quiet</a></div></div>
</div>""")


# ═════════════════════════════════════════════════════════════════════════════
# DASHBOARD AND ACCOUNT
# ═════════════════════════════════════════════════════════════════════════════
def projcard(name, site, status, ver, extra='', href='editor.html', menu_id=None):
    badge = {'Live': '<span class="badge live"><span class="dot mint"></span>Live</span>',
             'Failed': '<span class="badge danger"><span class="dot danger"></span>Failed</span>',
             'Never deployed': '<span class="badge neutral">Never deployed</span>'}[status]
    verc = f'<span class="chip mono">{ver}</span>' if ver else ''
    fail = ('<a class="small" href="deploy.html?failed" style="color:var(--danger)">See what failed →</a>'
            if status == 'Failed' else '')
    mid = menu_id or ('menu-' + re.sub(r'[^a-z]', '', name.lower()))
    return f"""<div class="card project"><a href="{href}" style="display:block">
    <div class="thumb" style="height:130px;border-radius:12px 12px 0 0;border:none"></div></a>
  <div class="pad-tight stack gap8">
    <div class="row gap8"><a href="{href}"><b style="font-size:14px">{name}</b></a>
      <span class="anchor" style="margin-left:auto">
        <button class="soft" data-open="{mid}" aria-label="Project menu"
          style="border:none;background:none;cursor:pointer;font-size:15px;padding:0 4px">⋯</button>
        <div class="overlay menu" id="{mid}">
          <a class="mrow" href="{href}">Open</a><a class="mrow" href="#" data-close>Rename</a>
          <a class="mrow" href="#" data-close>Duplicate</a>
          <a class="mrow" href="deploy-history.html">History</a>
          <div class="msep"></div><a class="mrow danger" href="#" data-close>Delete</a>
        </div></span></div>
    <span class="helper">{site}</span>
    <div class="row gap8">{badge}{verc}{fail}</div>{extra}
  </div></div>"""


UPDATE_NOTICE = """<div style="margin-top:8px;background:var(--marigold-tint);border-radius:var(--r-sm);padding:10px 12px" class="stack gap6">
    <div class="row gap6"><span class="badge pro">✦</span><b style="font-size:12.5px">Updates available</b></div>
    <span class="helper" style="color:var(--marigold-text)">Three designs in this site were improved since you shipped.</span>
    <a class="btn sm secondary" href="deploy.html?updates" style="align-self:flex-start">Review and redeploy</a></div>"""

NEW_PROJECT_SHEET = f"""<div class="overlay sheet-wrap" id="new-project">
  <div class="sheet"><div class="head"><h2 style="font-size:22px">New project</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">Four ways in. You can change everything afterwards.</p></div>
  <div class="body">
    <a class="radiocard on" href="starter-chooser.html"><span class="radio on"></span>
      <span class="stack"><span class="t">Start from a starter</span>
        <span class="c">Ten full sites, ready to wear your brand.</span></span></a>
    <a class="radiocard" href="editor.html?empty"><span class="radio"></span>
      <span class="stack"><span class="t">Blank canvas</span>
        <span class="c">An empty page and every design.</span></span></a>
    <div class="radiocard"><span class="radio"></span>
      <span class="stack grow"><span class="t">Duplicate an existing project</span>
        <span class="c">Everything copies except the deploy history.</span>
        <select class="input" style="max-width:300px;margin-top:8px"><option>Orbit Weekly</option>
          <option>The Slow Web</option><option>Launch page</option></select></span></div>
    <a class="radiocard" href="redesign-proposals.html"><span class="radio"></span>
      <span class="stack"><span class="t">Redesign one of my sites</span>
        <span class="c">We look at your posts and suggest whole-site designs.</span></span></a>
    <div style="height:1px;background:var(--line-faint)"></div>
    <div class="row gap12"><span class="control-label">Style Pack</span>
      <span class="row gap8"><span class="thumb" style="width:44px;height:32px;display:flex;align-items:center;justify-content:center;font-family:var(--serif)">Ag</span>
        <b style="font-size:13px">Paper</b></span>
      <span class="helper" style="margin-left:auto">Change it any time from the editor.</span></div>
  </div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button>
    <a class="btn coral" href="editor.html">Create project</a></div></div></div>"""

DASH_BODY = f"""<div class="stack gap20">
  <div class="row gap16" style="align-items:flex-start">
    <div class="grow stack gap12">
      <div class="row gap10"><h2 style="font-size:20px">Projects</h2><span class="chip">6 of 25</span></div>
      <div class="grid g3">
        {projcard('Orbit Weekly', 'orbitweekly.com', 'Live', 'v5', UPDATE_NOTICE)}
        {projcard('The Slow Web', 'Sample content', 'Never deployed', '')}
        {projcard('Maya&rsquo;s portfolio', 'mayachen.studio', 'Failed', '')}
        {projcard('Field Notes', 'Sample content', 'Never deployed', '')}
        {projcard('Launch page', 'orbitweekly.com', 'Live', 'v2')}
        {projcard('Orbit Weekly — dark exp', 'Sample content', 'Never deployed', '')}
      </div>
      <div id="no-projects" hidden class="stack gap8" style="padding:40px;text-align:center">
        <b style="font-size:15px">Nothing matches &ldquo;<span data-filter-echo></span>&rdquo;.</b>
        <span class="helper">Try part of a project or site name.</span></div>
    </div>
    <div class="card" style="width:280px;flex-shrink:0"><div class="pad-tight stack gap10">
      <span class="panel-label">What&rsquo;s new</span>
      <div class="stack gap4"><div class="row gap6"><span class="badge pro">✦</span>
          <b style="font-size:12.5px">Style Packs: 4 new font pairings</b></div>
        <span class="helper">Aug 12</span></div>
      <div class="stack gap4"><div class="row gap6"><span class="badge pro">✦</span>
          <b style="font-size:12.5px">Variant Shuffle now works on footers</b></div>
        <span class="helper">Aug 6</span></div>
      <a class="small" href="#" style="color:var(--sky-text)">Changelog →</a>
    </div></div>
  </div>
  <div class="card"><div class="pad stack gap14">
    <div class="row gap10"><span class="panel-label grow">Connected sites</span><span class="chip">3 of 10</span>
      <a class="btn sm secondary" href="sites.html">Manage</a></div>
    <div class="grid g3">
      <a class="stack gap6" href="sites.html" style="padding:12px;border:1px solid var(--line);border-radius:var(--r)">
        <div class="row gap8"><span class="dot mint"></span><b style="font-size:13px">Orbit Weekly</b>
          <span class="badge live" style="margin-left:auto">Live</span></div>
        <span class="helper mono">orbitweekly.com</span>
        <span class="helper">Keys working · Ghost 6.58 · Shipped 14 Aug</span></a>
      <a class="stack gap6" href="sites.html" style="padding:12px;border:1px solid var(--line);border-radius:var(--r)">
        <div class="row gap8"><span class="dot danger"></span><b style="font-size:13px">Maya&rsquo;s Studio</b>
          <span class="badge danger" style="margin-left:auto">Deploy failed</span></div>
        <span class="helper mono">mayachen.studio</span>
        <span class="helper">Admin key expired Aug 15</span></a>
      <a class="stack gap6" href="preview-only.html" style="padding:12px;border:1px solid var(--line);border-radius:var(--r)">
        <div class="row gap8"><span class="dot sky"></span><b style="font-size:13px">Field Notes</b>
          <span class="badge sky" style="margin-left:auto">Preview-only</span></div>
        <span class="helper mono">fieldnotes.ghost.io</span>
        <span class="helper">Keys working · Ghost(Pro) Starter</span></a>
    </div></div></div>
</div>"""

page('dashboard', 'Projects', app('projects', DASH_BODY, right=BELL + NEWPROJ,
     filt=('.project', '#no-projects'), tail=NEW_PROJECT_SHEET))

page('dashboard-free', 'Projects', app('projects', f"""<div class="stack gap20">
  <div class="row gap10"><h2 style="font-size:20px">Projects</h2><span class="chip">1 of 1</span></div>
  <div class="grid g3">{projcard('Field Notes', 'fieldnotes.blog', 'Live', 'v1')}
    <button class="card" data-open="at-cap" style="border:1px dashed var(--line-strong);box-shadow:none;
      display:flex;align-items:center;justify-content:center;min-height:230px;cursor:pointer;font-family:var(--ui)">
      <span class="stack gap8" style="align-items:center;text-align:center;padding:20px">
        <span class="badge pro">✦</span><b style="font-size:13.5px">Upgrade to add more</b>
        <span class="helper">Free includes 1 project. Pro gives you 25.</span>
        <span class="btn marigold sm">Go Pro — $15/mo</span></span></button></div>
</div>""", plan='free', used='48 MB', cap='of 100 MB', pct=48,
     right=BELL + '<button class="btn coral" data-open="at-cap">' + ICON['plus'] + 'New project</button>',
     tail=f"""<div class="overlay sheet-wrap" id="at-cap"><div class="sheet"><div class="head">
    <h2 style="font-size:20px">New project</h2></div>
  <div class="body greyed">
    <div class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Start from a starter</span>
      <span class="c">Ten full sites, ready to wear your brand.</span></span></div>
    <div class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Blank canvas</span>
      <span class="c">An empty page and every design.</span></span></div>
    <div class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Duplicate an existing project</span>
      <span class="c">Everything copies except the deploy history.</span></span></div>
    <div class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Redesign one of my sites</span>
      <span class="c">We look at your posts and suggest whole-site designs.</span></span></div>
    <p class="reason">You already have the one project the Free plan includes. Upgrade, or delete the one you have.</p></div>
  <div class="foot" style="background:var(--marigold-tint)"><div class="stack gap2 grow">
      <b style="font-size:13px">Free includes 1 project. Pro gives you 25.</b>
      <span class="helper" style="color:var(--marigold-text)">Your existing project keeps working exactly as it is.</span></div>
    <button class="btn secondary" data-close>Not now</button>
    <a class="btn marigold" href="upgrade.html">Go Pro — $15/mo</a></div></div></div>"""))

page('dashboard-empty', 'Projects', app('projects', """
<div style="min-height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center">
  <svg width="120" height="88" viewBox="0 0 120 88" fill="none" stroke="#1C1B1A" stroke-width="1.5">
    <rect x="10" y="14" width="100" height="62" rx="6"/><path d="M10 30h100"/>
    <circle cx="19" cy="22" r="2"/><circle cx="27" cy="22" r="2"/>
    <rect x="22" y="40" width="34" height="24" rx="3" fill="#FFEDE8" stroke="#FF5941"/>
    <path d="M66 44h32M66 52h24M66 60h32"/></svg>
  <div class="stack gap6"><h2 style="font-size:24px">Every great site starts somewhere.</h2>
    <p class="softaa">Yours starts with hundreds of gorgeous sections.</p></div>
  <button class="btn coral lg" data-open="new-project">New project</button></div>""",
     plan='free', used='0 MB', cap='used', pct=0, right=BELL + NEWPROJ, tail=NEW_PROJECT_SHEET))


page('grace', 'Projects', app('projects', f"""<div class="stack gap20">
  <div class="card" style="border-color:var(--danger)"><div class="pad row gap16" style="align-items:flex-start">
    <div class="stack gap8 grow"><b style="font-size:15px">Your payment did not go through</b>
      <p style="font-size:13.5px;line-height:1.55"><b>Your sites stay live and nothing is deleted.</b>
        You have 7 days to update your card. We retried twice; the next attempt is 21 Aug.</p>
      <p style="font-size:13.5px;line-height:1.55">After that you go back to Free. <b>Your live sites are
        never touched — what&rsquo;s shipped stays shipped.</b> You&rsquo;d just need to sort out anything
        over the Free limits before you ship again.</p>
      <div class="row gap10"><a class="btn danger" href="billing.html">Update card</a>
        <a class="btn secondary" href="billing.html">See the invoice</a></div></div>
    <div class="stack" style="align-items:center;padding:0 12px">
      <span class="mono" style="font-size:44px;line-height:1;font-weight:500">7</span>
      <span class="helper">DAYS LEFT</span></div></div></div>
  {DASH_BODY}
</div>""", right=BELL + NEWPROJ, tail=NEW_PROJECT_SHEET))


def sitecard(name, url, status, meta, action='', dot='mint', badge='live', mid='m'):
    return f"""<div class="card"><div class="pad row gap14" style="align-items:flex-start">
  <span class="avatar" style="background:#3B382F">{name[0]}</span>
  <div class="stack gap6 grow"><div class="row gap8"><b style="font-size:14px">{name}</b>
      <span class="badge {badge}"><span class="dot {dot}"></span>{status}</span></div>
    <span class="helper mono">{url}</span><span class="helper">{meta}</span>{action}</div>
  <span class="anchor"><button class="soft" data-open="{mid}" aria-label="Site menu"
      style="border:none;background:none;cursor:pointer;font-size:15px">⋯</button>
    <div class="overlay menu" id="{mid}">
      <a class="mrow" href="#" data-close>Re-check connection</a>
      <a class="mrow" href="manage-keys.html">Manage keys</a>
      <a class="mrow" href="routes-fallback.html">Upload routes by hand</a>
      <a class="mrow" href="deploy-history.html">Deploy history</a>
      <div class="msep"></div>
      <a class="mrow danger" href="#" data-open="disconnect">Disconnect</a></div></span>
</div></div>"""


CONNECT_MODAL = """<div class="overlay sheet-wrap" id="connect-site"><div class="sheet"><div class="head">
    <div class="row gap10"><h2 style="font-size:20px">Connect your Ghost site</h2>
      <span class="chip" style="margin-left:auto">1/2</span></div>
    <p class="softaa" style="font-size:13px;margin-top:4px">Same quick handshake as onboarding.</p></div>
  <div class="body"><div class="row gap24" style="align-items:flex-start">
    <ol class="stack gap12 grow" style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.5">
      <li>Open <b>Ghost Admin → Settings → Integrations</b></li>
      <li>Click <b>Add custom integration</b></li>
      <li>Name it <b>Inflozo</b> and save — it shows an API URL and two keys</li></ol>
    <div class="thumb" style="width:280px;height:170px;display:flex;align-items:center;justify-content:center;padding:16px">
      <span class="helper" style="text-align:center">Ghost Admin → Settings → Integrations</span></div></div></div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button>
    <a class="btn coral" href="connect-keys.html">Done — next</a></div></div></div>
<div class="overlay sheet-wrap" id="disconnect"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Disconnect Field Notes?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Inflozo stops talking to fieldnotes.ghost.io.
    <b>The site itself is untouched</b> — the theme we shipped stays live and keeps serving readers.
    Your projects for it become preview-only until you reconnect.</p>
    <div class="banner info"><span class="ico">ⓘ</span><span>We keep this site&rsquo;s original theme archive.
      It is bound to the site, not the address, so reconnecting later finds it again.</span></div></div>
  <div class="foot"><button class="btn secondary" data-close autofocus>Cancel</button>
    <button class="btn danger-out" data-close>Disconnect</button></div></div></div>"""

page('sites', 'Sites', app('sites', f"""<div class="stack gap16">
  <div class="row gap10"><h2 style="font-size:20px">Sites</h2><span class="chip">3 of 10</span>
    <button class="btn coral" data-open="connect-site" style="margin-left:auto">{ICON['plus']}Connect site</button></div>
  {sitecard('Orbit Weekly', 'orbitweekly.com', 'Connected', 'Ghost 6.58 · 2 projects · checked 2 minutes ago', mid='m-ow')}
  {sitecard('Maya&rsquo;s Studio', 'mayachen.studio', 'Reconnect needed',
            'Ghost 5.130 · 1 project · Admin key expired Aug 15',
            '<a class="btn sm secondary" href="manage-keys.html" style="align-self:flex-start;margin-top:4px">Reconnect</a>',
            dot='danger', badge='danger', mid='m-ms')}
  {sitecard('Field Notes', 'fieldnotes.ghost.io', 'Preview-only',
            'Ghost(Pro) Starter · 1 project · keys working',
            '<a class="small" href="preview-only.html" style="color:var(--sky-text)">What Preview-only means, and what clears it →</a>',
            dot='sky', badge='sky', mid='m-fn')}
</div>""", right=BELL, search='Search sites…', tail=CONNECT_MODAL))

page('manage-keys', 'Keys', app('sites', """<div class="stack gap16" style="max-width:760px">
  <div class="row gap10"><a href="sites.html">←</a><h2 style="font-size:20px">Keys — Orbit Weekly</h2></div>
  <p class="softaa" style="font-size:13px">From the Inflozo integration in your Ghost admin. We never see
    your Ghost password. <b>Three credentials, and each one buys something different.</b></p>
  <div class="itemrow"><span class="dot mint"></span><div class="stack gap4 grow">
      <div class="row gap8"><b style="font-size:13.5px">Admin API key</b><span class="badge live">Present</span></div>
      <span class="helper mono">6a4f2e91b7c8d3 ·············· 4e2a</span>
      <span class="helper">Uploads and activates your theme. This is the one that ships your site.</span></div>
    <button class="btn sm secondary" data-close>Replace</button></div>
  <div class="itemrow"><span class="dot mint"></span><div class="stack gap4 grow">
      <div class="row gap8"><b style="font-size:13.5px">Content API key</b><span class="badge live">Present</span></div>
      <span class="helper mono">c19d7f ·············· 8b31</span>
      <span class="helper">Reads your posts, pages, tags and authors, so the canvas shows your real content.</span></div>
    <button class="btn sm secondary" data-close>Replace</button></div>
  <div class="itemrow"><span class="dot grey"></span><div class="stack gap4 grow">
      <div class="row gap8"><b style="font-size:13.5px">Staff Access Token</b><span class="badge neutral">Not added</span></div>
      <span class="helper">Without it: no copy of your current theme before we replace it, no check that the
        live theme changed since we last shipped, and <span class="mono">routes.yaml</span> uploads by hand.</span>
      <span class="helper">It is a full-Administrator credential and <b>can only be created on the site
        Owner&rsquo;s own account</b>. Adding it enables the snapshot <b>from that point forward</b> — it
        cannot reconstruct a copy of a theme that has already been replaced.</span></div>
    <button class="btn secondary" data-open="add-token">Add the token</button></div>
  <div class="banner info"><span class="ico">ⓘ</span><span><b>There is no permission to grant here.</b>
    Ghost fixes what a Custom Integration token may do, and reading a theme or writing settings is not on
    that list on any version or any host. The missing capability is the token, not a scope.</span></div>
  <div class="stack gap6"><span class="control-label">Site URL</span>
    <span class="chip mono" style="align-self:flex-start;padding:6px 10px">https://orbitweekly.com</span>
    <span class="helper">Permanent for this connection. Moving to a new domain is a disconnect and a
      reconnect — so there is no field here to edit, rather than a field that refuses.</span></div>
  <div class="row gap10"><a class="btn secondary" href="sites.html">Done</a>
    <button class="btn ghost" data-close>Test connection</button>
    <span class="helper" style="margin-left:auto">Passed · 2 min ago</span></div>
</div>""", right=BELL, search='Search sites…', tail="""
<div class="overlay sheet-wrap" id="add-token"><div class="sheet"><div class="head">
    <h2 style="font-size:20px">Add a Staff Access Token</h2></div>
  <div class="body"><p style="font-size:13.5px;line-height:1.6">It is created on <b>your own Ghost profile
    page</b>, not on the integration — and only the site Owner can make one. It is a full-Administrator
    credential; we are saying so plainly rather than softening it.</p>
    <label class="field"><span class="control-label">Staff Access Token</span>
      <input class="input mono" placeholder="paste it here" aria-label="Staff Access Token"></label></div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button>
    <button class="btn coral" data-close>Add the token</button></div></div></div>"""))


ASSET_FILES = [('hero-shot.jpg', '380 KB · used in 3 projects'), ('orbit-wordmark.svg', '4 KB · used in 2'),
               ('issue-47-cover.jpg', '410 KB'), ('maya-portrait.jpg', '220 KB'), ('blogrolls.jpg', '360 KB'),
               ('quiet-software.jpg', '298 KB'), ('archive-1998.png', '512 KB'), ('field-notes-mark.svg', '3 KB'),
               ('lisbon-desk.jpg', '440 KB'), ('renewal-chart.png', '180 KB')]

page('assets', 'Assets', app('assets', """<div class="stack gap16">
  <div class="row gap10"><h2 style="font-size:20px">Assets</h2>
    <span class="chip">48 files · 312 MB of 5 GB</span>
    <button class="btn coral" data-open="upload" style="margin-left:auto">Upload</button></div>
  <div class="row gap8"><span class="seg"><span class="on">All · 48</span><span>Photos</span>
      <span>Logos</span><span>Illustrations</span></span>
    <span class="seg" style="margin-left:auto"><span class="on">Newest</span><span>Largest</span></span></div>
  <div class="grid g5">""" + ''.join(
    f"""<button class="card asset" data-open="asset-details" style="border:none;padding:0;text-align:left;
      cursor:pointer;font-family:var(--ui)">
      <span class="thumb" style="display:block;height:110px;border-radius:12px 12px 0 0;border:none"></span>
      <span class="pad-tight stack gap4"><b style="font-size:12.5px">{n}</b><span class="helper">{s}</span></span>
    </button>""" for n, s in ASSET_FILES) + """</div>
  <div id="no-assets" hidden style="padding:40px;text-align:center" class="stack gap8">
    <b style="font-size:15px">Nothing matches &ldquo;<span data-filter-echo></span>&rdquo;.</b></div>
</div>""", right=BELL, search='Search assets…', filt=('.asset', '#no-assets'), tail="""
<div class="overlay sheet-wrap" id="upload"><div class="sheet"><div class="body">
  <div style="border:2px dashed var(--coral);border-radius:var(--r-lg);background:var(--coral-tint);
    padding:56px;display:flex;flex-direction:column;align-items:center;gap:14px">
    <b style="font-size:18px;font-family:var(--display)">Drop images — we&rsquo;ll optimize them ✨</b>
    <button class="btn secondary">Choose files</button>
    <span class="helper">JPG, PNG, SVG or WebP · up to 10 MB each</span></div></div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button></div></div></div>
<div class="overlay sheet-wrap" id="asset-details"><div class="sheet"><div class="body row gap24" style="align-items:flex-start">
  <div class="thumb" style="width:300px;height:200px"></div>
  <div class="stack gap12 grow"><h2 style="font-size:18px">hero-shot.jpg</h2>
    <div class="grid g2 gap12">
      <div class="stack gap2"><span class="control-label soft">Format</span><b style="font-size:13px">WebP</b>
        <span class="helper">optimized from JPG</span></div>
      <div class="stack gap2"><span class="control-label soft">Size</span><b style="font-size:13px">380 KB</b>
        <span class="helper">from 4.2 MB</span></div>
      <div class="stack gap2"><span class="control-label soft">Dimensions</span><b style="font-size:13px">2400 × 1600</b></div>
      <div class="stack gap2"><span class="control-label soft">Uploaded</span><b style="font-size:13px">Aug 12, 2026</b>
        <span class="helper">by Maya</span></div></div>
    <div class="stack gap6"><span class="control-label soft">Used in 3 projects</span>
      <span class="helper">Orbit Weekly · Hero, Post Header</span>
      <span class="helper">Launch page · Hero</span><span class="helper">Field Notes · Newsletter</span></div>
    <div class="row gap8"><button class="btn sm secondary" data-close>Copy URL</button>
      <button class="btn sm secondary" data-close>Download</button>
      <button class="btn sm secondary" data-close>Replace</button>
      <button class="btn sm danger-out" data-open="delete-asset">Delete</button></div></div></div>
  <div class="foot"><button class="btn secondary" data-close style="margin-left:auto">Close</button></div></div></div>
<div class="overlay sheet-wrap" id="delete-asset"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Delete hero-shot.jpg?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">This image is used in 3 projects. Those spots
    will show an empty placeholder until you replace it. This can&rsquo;t be undone.</p>
    <div class="stack gap8">
      <div class="row gap8"><span class="avatar" style="width:22px;height:22px;font-size:10px">O</span>
        <b style="font-size:12.5px">Orbit Weekly</b><span class="helper">Hero · Post Header</span></div>
      <div class="row gap8"><span class="avatar" style="width:22px;height:22px;font-size:10px">O</span>
        <b style="font-size:12.5px">Launch page</b><span class="helper">Hero</span></div>
      <div class="row gap8"><span class="avatar sam" style="width:22px;height:22px;font-size:10px">F</span>
        <b style="font-size:12.5px">Field Notes</b><span class="helper">Newsletter</span></div></div></div>
  <div class="foot"><button class="btn secondary" data-close autofocus>Cancel</button>
    <button class="btn danger" data-close>Delete image</button></div></div></div>"""))

page('assets-over-quota', 'Assets', app('assets', """<div class="stack gap16">
  <div class="banner error"><span class="ico">!</span><span><b>312 MB of the 100 MB the Free plan includes.</b>
    Your files are all still here and nothing will be deleted. Uploads are paused until you are back under
    100 MB — or go Pro, which lifts it to 5 GB.</span></div>
  <div class="row gap10"><h2 style="font-size:20px">Assets</h2><span class="badge danger">Uploads paused</span>
    <span class="btn off" style="margin-left:auto">Upload</span></div>
  <p class="reason">Uploading is paused while you are over the storage limit.</p>
  <div class="grid g5">""" + ''.join(
    f"""<div class="card"><div class="thumb" style="height:110px;border-radius:12px 12px 0 0;border:none"></div>
      <div class="pad-tight stack gap4"><b style="font-size:12.5px">{n}</b><span class="helper">{s}</span>
        <button class="btn sm danger-out" style="align-self:flex-start">Delete</button></div></div>"""
    for n, s in ASSET_FILES[:5]) + """</div>
  <div class="row gap10"><a class="btn marigold" href="upgrade.html">Go Pro — 5 GB</a>
    <a class="btn secondary" href="over-limit.html">What else is over?</a></div>
</div>""", plan='free', used='312 MB', cap='of 100 MB', pct=100, over=True, right=BELL, search='Search assets…'))

page('billing', 'Account & billing', app('projects', """<div class="stack gap16" style="max-width:760px">
  <h2 style="font-size:22px">Account &amp; Billing</h2>
  <div class="card"><div class="pad stack gap14">
    <div class="row gap12"><span class="avatar">M</span>
      <div class="stack gap2 grow"><div class="row gap8"><b style="font-size:15px">Pro</b>
          <span class="badge live">✦ Active</span></div>
        <span class="helper">Renews Sep 17, 2026 · $15/mo</span></div>
      <span style="font-family:var(--display);font-size:24px;font-weight:700">$15<span class="soft" style="font-size:13px">/mo</span></span></div>
    <div style="height:1px;background:var(--line-faint)"></div>
    <div class="grid g4 gap12">
      <div class="stack gap2"><span class="control-label soft">Projects</span><b class="mono">6 of 25</b></div>
      <div class="stack gap2"><span class="control-label soft">Connected sites</span><b class="mono">2 of 10</b></div>
      <div class="stack gap2"><span class="control-label soft">Asset storage</span><b class="mono">312 MB of 5 GB</b></div>
      <div class="stack gap2"><span class="control-label soft">Deploy history</span><b class="mono">last 10 per project</b></div></div>
    <div class="row gap10"><button class="btn secondary" data-close>Manage in Dodo portal</button>
      <button class="btn ghost" data-open="cancel">Cancel plan</button>
      <span class="helper" style="margin-left:auto">Cancelling always takes three clicks or fewer. No retention screens.</span></div>
  </div></div>
  <div class="card"><div class="pad row gap12"><div class="stack gap2 grow">
      <b style="font-size:13.5px">Invoices</b><span class="helper">Monthly receipts from Dodo</span></div>
    <button class="btn sm secondary" data-open="invoices">View invoices</button></div></div>
  <div class="card"><div class="pad stack gap12">
    <b style="font-size:13.5px">Email</b>
    <div class="row gap10"><span class="mono" style="font-size:13px">maya@orbitweekly.com</span>
      <span class="helper">Magic links land here</span>
      <button class="btn sm secondary" style="margin-left:auto" data-close>Change email</button></div>
    <div style="height:1px;background:var(--line-faint)"></div>
    <b style="font-size:13.5px">Passkeys</b>
    <div class="stack gap8">
      <div class="row gap10"><span style="font-size:13px">MacBook Pro — Touch ID</span>
        <span class="helper">added Aug 2, 2026</span>
        <button class="btn ghost sm" style="margin-left:auto" data-close>Remove</button></div>
      <div class="row gap10"><span style="font-size:13px">iPhone — Face ID</span>
        <span class="helper">added Aug 3, 2026</span>
        <button class="btn ghost sm" style="margin-left:auto" data-close>Remove</button></div></div>
    <button class="btn sm secondary" style="align-self:flex-start" data-close>Add a passkey</button>
    <div style="height:1px;background:var(--line-faint)"></div>
    <b style="font-size:13.5px">Autosave</b>
    <label class="row gap12" style="cursor:pointer"><span class="toggle on"></span>
      <span class="stack gap2 grow"><span style="font-size:13px">Sync to the cloud every three minutes</span>
        <span class="helper">Turning this off means your work stays on this device until you press ⌘S, close
          the tab or ship. If the device is lost, so is that work.</span></span></label>
  </div></div>
  <div class="card"><div class="pad stack gap10">
    <b style="font-size:13.5px">The limits, plainly</b>""" + limits_table() + """</div></div>
  <div class="card" style="border-color:var(--danger)"><div class="pad stack gap10">
    <b style="font-size:13.5px;color:var(--danger)">Danger zone</b>
    <div class="row gap12"><div class="stack gap2 grow"><b style="font-size:13px">Delete account</b>
        <span class="helper">Removes every project, version and asset. Your live Ghost sites stay up — we
          never touch them.</span></div>
      <button class="btn danger-out" data-open="delete-account">Delete account</button></div></div></div>
</div>""", right=BELL + NEWPROJ, tail="""
<div class="overlay sheet-wrap" id="invoices"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Invoices</h2></div>
  <div class="body stack gap2">""" + ''.join(
    f"""<div class="row gap10" style="padding:9px 0;border-bottom:1px solid var(--line-faint)">
      <span style="font-size:13px">{d}</span><span class="helper">Pro · monthly</span>
      <span class="mono" style="margin-left:auto;font-size:13px">$15.00</span>
      <a class="small" href="#">PDF</a></div>"""
    for d in ['Aug 17, 2026', 'Jul 17, 2026', 'Jun 17, 2026', 'May 17, 2026', 'Apr 17, 2026']) + """
    <p class="helper" style="padding-top:10px">Need older ones? <a href="#">Open the Dodo portal ↗</a></p></div>
  <div class="foot"><button class="btn secondary" data-close>Close</button></div></div></div>
<div class="overlay sheet-wrap" id="cancel"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Cancel Pro?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Auto-renew stops. <b>You keep Pro until
    Sep 17, 2026</b>, the end of the period you have paid for, and then the account becomes Free.</p>
    <p style="font-size:13px;line-height:1.55">Nothing is deleted at that point, on any path. If you are
      over the Free limits we will show you exactly what is over and by how much, and you decide what changes.</p></div>
  <div class="foot"><button class="btn secondary" data-close autofocus>Keep Pro</button>
    <a class="btn danger-out" href="over-limit.html">Cancel Pro</a></div></div></div>
<div class="overlay sheet-wrap" id="delete-account"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Delete your account?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">All 6 projects, their full version history and
    48 assets will be permanently deleted. <b>Your live Ghost sites stay online.</b> This cannot be undone.</p>
    <label class="field"><span class="control-label">Type <b class="mono">delete my account</b> to confirm</span>
      <input class="input mono" data-typed="delete my account" data-typed-target="#really-delete"
        placeholder="delete my account" aria-label="Type delete my account to confirm"></label></div>
  <div class="foot"><button class="btn secondary" data-close autofocus>Cancel</button>
    <button class="btn danger off" id="really-delete">Delete account</button></div></div></div>"""))


page('upgrade', 'Go Pro', """
<div style="min-height:100vh;background:var(--paper);display:flex;align-items:center;justify-content:center;padding:6vh 24px">
  <div class="sheet"><div class="head" style="text-align:center">
    <span class="badge pro">✦</span>
    <h2 style="font-size:24px;margin-top:8px">Everything, unlocked.</h2></div>
  <div class="body">
    <div class="row gap10" style="justify-content:center">
      <span class="seg"><span>Monthly</span><span class="on">Yearly</span></span>
      <span class="badge notice">$150/yr — 2 months free</span></div>
    """ + limits_table(note=False) + """
    <div class="banner info"><span class="ico">ⓘ</span><span>Every design is on your canvas on both plans.
      Pro is about the <b>exits</b> — deploying, exporting and the compiled theme code.</span></div></div>
  <div class="foot" style="justify-content:center;flex-direction:column;gap:8px">
    <a class="btn coral lg" href="dashboard.html" style="width:280px">Go Pro — $15/mo</a>
    <a class="btn ghost" href="dashboard.html">Not now</a>
    <span class="helper">Cancel anytime · Taxes handled · Powered by Dodo</span></div></div>
</div>""")

page('over-limit', 'Back under the limits', """
<div style="min-height:100vh;background:var(--paper);display:flex;align-items:flex-start;justify-content:center;padding:6vh 24px">
  <div class="sheet wide"><div class="head">
    <h2 style="font-size:22px">Let&rsquo;s get you back under the Free limits.</h2>
    <p style="font-size:13.5px;margin-top:8px"><b>Nothing has been deleted, and nothing will be. Your live
      sites are untouched.</b></p></div>
  <div class="body">
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Projects</b>
        <span class="helper">Six projects, and Free includes one.</span></div>
      <span class="mono" style="font-size:15px">6 of 1</span>
      <button class="btn sm secondary" data-open="which-project">Choose which one stays editable</button></div>
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Connected sites</b>
        <span class="helper">Deploys stay blocked while connections exceed the cap. Each disconnected site
          keeps its original-theme archive.</span></div>
      <span class="mono" style="font-size:15px">2 of 1</span>
      <a class="btn sm secondary" href="sites.html">Disconnect one</a></div>
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Assets</b>
        <span class="helper">The library is read-only until you are under. Existing files stay.</span></div>
      <span class="mono" style="font-size:15px">312 MB of 100 MB</span>
      <a class="btn sm secondary" href="assets-over-quota.html">Delete some files</a></div>
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Stored versions</b>
        <span class="helper">Nothing to do — we keep these. We just won&rsquo;t add more until the count is
          back under three.</span></div>
      <span class="mono" style="font-size:15px">8 of 3</span><span class="helper">no action</span></div>
    <p class="helper">Rollback, snapshot restore and export keep working the whole time — on any plan, throughout.</p>
  </div>
  <div class="foot"><a class="btn marigold" href="upgrade.html">Go Pro — $15/mo</a>
    <a class="btn secondary" href="dashboard-free.html">Sort it out myself</a></div></div>
<div class="overlay sheet-wrap" id="which-project"><div class="sheet"><div class="head">
    <h2 style="font-size:20px">Which project stays editable?</h2></div>
  <div class="body">""" + ''.join(
    f"""<label class="radiocard{' on' if i == 0 else ''}"><span class="radio{' on' if i == 0 else ''}"></span>
      <span class="stack grow"><span class="t">{n}</span><span class="c">{s} · updated {d}</span></span></label>"""
    for i, (n, s, d) in enumerate([('Orbit Weekly', 'orbitweekly.com', 'today'),
                                   ('Launch page', 'orbitweekly.com', '11 Aug'),
                                   ('The Slow Web', 'Sample content', '4 Aug'),
                                   ('Maya&rsquo;s portfolio', 'mayachen.studio', '2 Aug'),
                                   ('Field Notes', 'Sample content', '29 Jul'),
                                   ('Orbit Weekly — dark exp', 'Sample content', '20 Jul')])) + """
    <p class="helper">The other five stay viewable and exportable — you just can&rsquo;t edit them until
      you&rsquo;re on Pro.</p></div>
  <div class="foot"><button class="btn secondary" data-close>Back</button>
    <a class="btn coral" href="editor.html?readonly">Keep this one editable</a></div></div></div>
</div>""")

SUGGESTIONS = [
    ('128', 'Variant Shuffle for the whole page at once',
     'Shuffle every section together so the whole page keeps one consistent vibe.', 'Feature', 'Building', 'sky'),
    ('96', 'Scheduled deploys', 'Ship at midnight, while readers are asleep. Pick a time, we press the button.',
     'Feature', 'Planned', 'notice'),
    ('74', 'More newsletter sections',
     'Signup forms with incentives — free chapter, discount, archive access.', 'Section idea', 'Open', 'neutral'),
    ('61', 'Import my Ghost theme&rsquo;s colors as a pack',
     'Shipped — the connect flow now pulls accent, logo and navigation automatically.', 'Integration', 'Shipped', 'live'),
    ('38', 'Team seats', 'Invite an editor who can build but not deploy.', 'Feature', 'Open', 'neutral'),
    ('22', 'Keyboard-only editing', 'Move, shuffle and restyle sections without touching the mouse.',
     'Feature', 'Open', 'neutral'),
]

page('suggestions', 'Suggestions', app('projects', """<div class="stack gap16" style="max-width:880px">
  <div class="stack gap4"><h2 style="font-size:22px">Suggestions</h2>
    <p class="softaa" style="font-size:13px">Built in the open — tell us what&rsquo;s next.</p></div>
  <div class="row gap10"><span class="seg"><span class="on">Top</span><span>New</span><span>Planned</span>
      <span>Building</span><span>Shipped</span></span>
    <button class="btn coral" data-open="suggest" style="margin-left:auto">Suggest something</button></div>
  <div class="stack gap10">""" + ''.join(
    f"""<div class="card"><div class="pad row gap14" style="align-items:flex-start">
      <button class="stack gap2" style="align-items:center;width:52px;border:1px solid var(--line);
        border-radius:var(--r-sm);padding:6px;background:var(--surface);cursor:pointer;font-family:var(--ui)"
        onclick="this.querySelector('b').textContent=+this.querySelector('b').textContent+1;this.style.borderColor='var(--coral)'">
        <span style="font-size:10px">▲</span><b class="mono" style="font-size:15px">{v}</b></button>
      <div class="stack gap4 grow"><b style="font-size:14px">{t}</b><span class="helper">{d}</span></div>
      <div class="row gap6"><span class="badge neutral">{k}</span><span class="badge {c}">{s}</span></div></div></div>"""
    for v, t, d, k, s, c in SUGGESTIONS) + """</div></div>""",
     right=BELL + NEWPROJ, tail="""
<div class="overlay sheet-wrap" id="suggest"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:20px">Suggest something.</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">Big or small — if it would make Inflozo better,
      we want it.</p></div>
  <div class="body">
    <label class="field"><span class="control-label">Title</span><input class="input" aria-label="Title"></label>
    <div class="field"><span class="control-label">Type</span>
      <span class="seg"><span class="on">Section idea</span><span>Feature</span><span>Integration</span></span></div>
    <label class="field"><span class="control-label">Details</span>
      <textarea class="input" rows="4" style="height:auto;padding:8px 10px" aria-label="Details"></textarea></label>
    <div style="border:1px dashed var(--line-strong);border-radius:var(--r-sm);padding:16px;text-align:center">
      <span class="helper">Drop a screenshot or sketch · optional</span></div></div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button>
    <button class="btn coral" data-close>Submit</button></div></div></div>"""))

page('small-screen', 'The editor needs a bigger screen', """
<div style="min-height:100vh;background:var(--paper);padding:24px;display:flex;flex-direction:column;gap:20px;
  align-items:center;justify-content:center;max-width:390px;margin:0 auto">
  <svg width="120" height="96" viewBox="0 0 120 96" fill="none" stroke="#1C1B1A" stroke-width="1.5">
    <rect x="8" y="12" width="64" height="46" rx="4"/><path d="M8 50h64"/><path d="M28 66h24M34 58v8"/>
    <rect x="82" y="26" width="26" height="46" rx="4" fill="#FFEDE8" stroke="#FF5941"/>
    <path d="M92 66h6" stroke="#FF5941"/></svg>
  <div class="stack gap8" style="text-align:center"><h1 style="font-size:22px">The editor needs a bigger screen.</h1>
    <p class="softaa" style="font-size:13.5px">Dragging sections and a 300-pixel control panel don&rsquo;t fit
      on a phone yet. Open this project on a laptop or tablet.</p></div>
  <div class="card" style="width:100%"><div class="pad-tight stack gap10">
    <span class="panel-label">What does work here</span>
    <a class="row gap10" href="deploy-history.html"><span class="stack gap2 grow">
        <b style="font-size:13px">Deploy history</b>
        <span class="helper">v5 · live since today, 2:14 PM</span></span>
      <span class="btn sm secondary">Roll back to v4</span></a>
    <div style="height:1px;background:var(--line-faint)"></div>
    <a class="row gap10" href="sites.html"><b style="font-size:13px" class="grow">Your sites</b><span class="soft">→</span></a>
    <div style="height:1px;background:var(--line-faint)"></div>
    <a class="row gap10" href="billing.html"><b style="font-size:13px" class="grow">Billing</b><span class="soft">→</span></a>
  </div></div>
</div>""")


# ═════════════════════════════════════════════════════════════════════════════
# THE EDITOR — the screen the product lives or dies on
# ═════════════════════════════════════════════════════════════════════════════
HERO_RING = ['Split Editorial', 'Split Form', 'Image Backdrop', 'Big Type Manifesto', 'Centred Classic']

HERO_VIEWS = [
    # 0 · Split Editorial
    """<div class="row gap32" style="padding:44px 36px;align-items:center">
      <div class="stack gap12" style="flex:1.1">
        <span class="ow-eyebrow" data-editable>ISSUE 47 · ESSAYS</span>
        <span class="ow-h1" data-editable>The slow return of the personal homepage</span>
        <span class="ow-dek" data-editable>Why writers are leaving the feed — and coming home to a page of their own.</span>
        <span class="ow-meta">Maya Chen · Aug 14 · 9 min read</span></div>
      <div class="ow-photo" style="flex:1;aspect-ratio:4/3"><span>feature photo</span></div></div>""",
    # 1 · Split Form
    """<div class="row gap32" style="padding:44px 36px;align-items:center">
      <div class="stack gap12" style="flex:1.1">
        <span class="ow-eyebrow" data-editable>EVERY THURSDAY</span>
        <span class="ow-h1" data-editable>Seven links from the quiet web</span>
        <span class="ow-dek" data-editable>Checked by hand, sent on Thursdays. No tracking pixels, because I never got round to adding any.</span></div>
      <div class="stack gap10" style="flex:1;background:#F4EFE6;padding:24px;border-radius:10px">
        <span class="ow-meta">JOIN 4,100 READERS</span>
        <span class="input" style="background:#fff;display:flex;align-items:center;color:var(--ink-faint)">you@example.com</span>
        <span class="ow-sub" style="text-align:center;padding:10px">Subscribe</span></div></div>""",
    # 2 · Image Backdrop
    """<div style="position:relative;min-height:340px;display:flex;align-items:flex-end;
      background:repeating-linear-gradient(45deg,#5A5148 0 12px,#4E463D 12px 24px)">
      <div style="position:absolute;inset:0;background:linear-gradient(transparent,rgba(20,17,14,.82))"></div>
      <div class="stack gap10" style="position:relative;padding:36px;color:#F4EFE6">
        <span class="ow-eyebrow" style="color:#E8B08A" data-editable>ISSUE 118</span>
        <span class="ow-h1" style="color:#F4EFE6;max-width:640px" data-editable>The four hundred domains that refuse to move</span>
        <span class="ow-dek" style="color:#D8CEC2" data-editable>Every October, a few hundred people renew an address nobody visits.</span></div></div>""",
    # 3 · Big Type Manifesto
    """<div class="stack gap16" style="padding:72px 36px">
      <span class="ow-h1" style="font-size:52px;line-height:1.05;max-width:820px" data-editable>The web did not get worse. It got busier.</span>
      <span class="ow-meta">ORBIT WEEKLY · SINCE 2019</span></div>""",
    # 4 · Centred Classic
    """<div class="stack gap14" style="padding:60px 36px;align-items:center;text-align:center">
      <span class="ow-eyebrow" data-editable>SUNDAY ESSAYS</span>
      <span class="ow-h1" style="max-width:620px" data-editable>Orbit Weekly, issue by issue</span>
      <span class="ow-dek" style="max-width:520px" data-editable>One considered essay a week. No feed, no noise.</span>
      <span class="ow-sub" style="padding:10px 22px">Start reading</span></div>""",
]

HERO_PANELS = [
    # 0 Split Editorial
    """<div class="ctlgroup"><span class="control-label">Image side</span>
      <span class="seg"><span>Left</span><span class="on">Right</span></span></div>
    <div class="ctlgroup"><span class="control-label">Height</span>
      <span class="seg"><span>Compact</span><span class="on">Comfortable</span><span>Tall</span></span></div>
    <div class="ctlgroup"><span class="control-label">Image scrim</span>
      <span class="seg"><span class="on">None</span><span>Soft</span><span>Strong</span></span></div>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle on"></span>
      <span class="control-label grow">Show the meta row</span></label></div>""",
    # 1 Split Form
    """<div class="ctlgroup"><span class="control-label">Copy side</span>
      <span class="seg"><span class="on">Left</span><span>Right</span></span></div>
    <div class="ctlgroup"><span class="control-label">Height</span>
      <span class="seg"><span>Compact</span><span class="on">Comfortable</span><span>Tall</span></span></div>
    <div class="ctlgroup"><span class="control-label">Form fields</span>
      <span class="seg"><span class="on">Email</span><span>Email + name</span></span></div>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle on"></span>
      <span class="control-label grow">Reader count</span></label></div>
    <div class="stack gap6"><span class="panel-label">No image controls</span>
      <span class="reason">This design has no image. Nothing to crop, position or scrim.</span></div>""",
    # 2 Image Backdrop
    """<div class="ctlgroup"><span class="control-label">Text position</span>
      <span class="seg"><span>Top</span><span>Centre</span><span class="on">Bottom</span></span></div>
    <div class="ctlgroup"><span class="control-label">Scrim</span>
      <span class="seg"><span>None</span><span class="on">Gradient</span><span>Solid</span></span></div>
    <div class="ctlgroup"><span class="control-label">Image focus</span>
      <span class="seg"><span class="on">Centre</span><span>Top</span><span>Bottom</span></span></div>
    <div class="ctlgroup"><span class="control-label">Height</span>
      <span class="seg"><span class="on">Comfortable</span><span>Tall</span><span>Full screen</span></span></div>
    <div class="ctlgroup"><span class="control-label">Eyebrow</span>
      <span class="seg"><span class="on">Shown</span><span>Hidden</span></span></div>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle"></span>
      <span class="control-label grow">Dark mode override</span>
      <span class="badge neutral" title="Dark override">🌙</span></label></div>""",
    # 3 Big Type
    """<div class="ctlgroup"><span class="control-label">Type size</span>
      <span class="seg"><span>Large</span><span class="on">Huge</span><span>Absurd</span></span></div>
    <div class="ctlgroup"><span class="control-label">Alignment</span>
      <span class="seg"><span class="on">Left</span><span>Centred</span></span></div>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle on"></span>
      <span class="control-label grow">Show the byline</span></label></div>
    <div class="stack gap6"><span class="panel-label">Three controls is the answer</span>
      <span class="reason">The design is one sentence at one size. Adding height or scrim controls would
        invent decisions it does not have.</span></div>""",
    # 4 Centred Classic
    """<div class="ctlgroup greyed"><span class="control-label">Alignment</span>
      <span class="seg"><span>Left</span><span class="on">Centred</span></span>
      <span class="reason">This design is centred by construction.</span></div>
    <div class="ctlgroup"><span class="control-label">Height</span>
      <span class="seg"><span>Compact</span><span class="on">Comfortable</span><span>Tall</span></span></div>
    <div class="ctlgroup"><span class="control-label">Button</span>
      <span class="seg"><span class="on">Solid</span><span>Soft</span><span>Outline</span></span></div>
    <div class="ctlgroup"><span class="control-label">Eyebrow</span>
      <span class="seg"><span class="on">Shown</span><span>Hidden</span></span></div>""",
]


def hero_views():
    return ''.join(f'<div data-design-view="{i}"{" hidden" if i else ""}>{v}</div>'
                   for i, v in enumerate(HERO_VIEWS))


def hero_panels():
    return ''.join(f'<div data-design-panel="{i}"{" hidden" if i else ""}>{p}</div>'
                   for i, p in enumerate(HERO_PANELS))


def design_strip():
    return ''.join(
        f'<button class="dthumb{" on" if i == 0 else ""}" data-design-index="{i}" '
        f'aria-label="{n}" style="cursor:pointer"></button>'
        for i, n in enumerate(HERO_RING))


TEMPLATE_MENU = """<div class="overlay menu left" id="template-menu" style="min-width:260px">
  <a class="mrow on" href="editor.html">Home<span style="margin-left:auto">✓</span></a>
  <a class="mrow" href="post-content.html">Post</a>
  <a class="mrow" href="editor.html">Page</a>
  <a class="mrow" href="editor.html">Tag<span class="helper" style="margin-left:auto">Auto-generated</span></a>
  <a class="mrow" href="editor.html">Author<span class="helper" style="margin-left:auto">Auto-generated</span></a>
  <div class="mlabel">Membership</div>
  <a class="mrow" href="editor.html" style="padding-left:22px">Signup</a>
  <a class="mrow" href="editor.html" style="padding-left:22px">Signin</a>
  <a class="mrow" href="editor.html" style="padding-left:22px">Member home</a>
  <a class="mrow" href="error-pages.html">404<span class="helper" style="margin-left:auto">Auto-generated</span></a>
  <div class="msep"></div>
  <div class="mlabel">Template surfaces</div>
  <a class="mrow" href="paywall-editor.html">Paywall</a>
  <a class="mrow" href="editor-cards.html">Editor cards</a>
  <a class="mrow" href="error-pages.html">Error pages</a>
  <div class="msep"></div>
  <a class="mrow" href="routes-manager.html">Manage routes…</a>
  <a class="mrow" href="theme-settings.html">Theme settings…</a>
  <a class="mrow" href="#" data-close>+ New template</a></div>"""

VIEWAS_MENU = """<div class="overlay menu left" id="viewas-menu">
  <div class="mlabel">View as</div>
  <a class="mrow on" href="#" data-close>Anonymous<span style="margin-left:auto">✓</span></a>
  <a class="mrow" href="#" data-close>Free member</a>
  <a class="mrow" href="#" data-close>Paid member</a>
  <div class="msep"></div>
  <span class="helper" style="padding:0 10px 6px;display:block">Three states, and only three. A comped
    member previews as Paid — it differs in billing, not in access.</span></div>"""

SOURCE_MENU = """<div class="overlay menu left" id="source-menu" style="width:340px">
  <div class="mlabel">Source</div>
  <a class="mrow on" href="#" data-close>Orbit Weekly<span style="margin-left:auto">✓</span></a>
  <a class="mrow" href="#" data-close>Sample content</a>
  <div class="msep"></div>
  <div class="mlabel">Subject</div>
  <a class="mrow" href="#" data-close>Style-guide article<span style="margin-left:auto">✓</span></a>
  <a class="mrow" href="#" data-close>The slow return of the personal homepage
    <span class="chip" style="margin-left:auto">has image</span></a>
  <a class="mrow" href="#" data-close>What we lost when blogrolls died
    <span class="chip" style="margin-left:auto">has image</span></a>
  <a class="mrow" href="#" data-close>A field guide to quiet software</a>
  <span class="helper" style="padding:6px 10px;display:block">This canvas renders one post. Which one changes
    what you see, because a post with a feature image and one without are different shapes.</span></div>"""


def sec(name, inner, tag=None, pro=False):
    """A section on the canvas. At rest it is a website; the chrome arrives on hover."""
    chrome = (f'<span class="sec-chrome"><span class="pill">'
              f'<span class="mono" data-design-slash>1 / {len(HERO_RING)}</span>'
              f'<a href="#" data-design-nav="-1" aria-label="Previous design">◀</a>'
              f'<a href="#" data-design-nav="1" aria-label="Next design">▶</a>'
              f'<a href="#" data-open="remix">Shuffle</a><a href="#">Duplicate</a><a href="#">Delete</a>'
              f'</span></span>') if name == 'hero' else (
              f'<span class="sec-chrome"><span class="pill"><a href="#">Duplicate</a>'
              f'<a href="#">Delete</a><a href="section-picker.html">Replace</a></span></span>')
    badge = '<span class="badge pro" style="position:absolute;top:8px;right:8px;z-index:41">✦ Pro</span>' if pro else ''
    return (f'<div data-section="{name}">'
            f'<span class="sec-tag">{tag or name}</span>{chrome}{badge}{inner}</div>'
            f'<div class="addhere"><a href="section-picker.html">+ Add section</a></div>')


CANVAS = f"""<div class="viewport"><div class="site" data-site data-theme="paper" data-ring="{"|".join(HERO_RING)}" data-current="0">
  {sec('header', '''<div class="ow-nav"><span class="ow-brand" data-editable>Orbit Weekly</span>
      <span class="ow-links"><span>Essays</span><span>Notes</span><span>About</span></span>
      <span class="ow-sub">Subscribe</span></div>''', tag='Header · site-wide')}
  {sec('hero', hero_views(), tag='Home hero')}
  {sec('feed', '''<div style="padding:30px 32px;background:#FFFFFF;border-top:1px solid #EBE5DB">
    <div class="row" style="justify-content:space-between;margin-bottom:18px">
      <span style="font-family:var(--serif);font-size:19px" data-editable>Latest essays</span>
      <span style="font-size:11px;font-weight:600;color:#D96C3F">All essays →</span></div>
    <div class="row gap32" style="align-items:flex-start">
      <div class="stack gap10" style="flex:1.2">
        <div class="ow-photo" style="aspect-ratio:16/9;background:repeating-linear-gradient(45deg,#E7E9E2 0 10px,#DDE0D6 10px 20px)"><span>essay photo</span></div>
        <span style="font-family:var(--serif);font-size:19px;line-height:1.2">What we lost when blogrolls died</span>
        <span class="ow-dek">The web used to point outward. A short history of the link as a gift.</span>
        <span class="ow-meta">SAM OKAFOR · AUG 10 · 12 MIN</span></div>
      <div class="stack gap16" style="flex:1">
        <div class="stack gap4"><span style="font-family:var(--serif);font-size:15px">A field guide to quiet software</span><span class="ow-meta">PRIYA NAIR · AUG 7</span></div>
        <div class="stack gap4"><span style="font-family:var(--serif);font-size:15px">Reading the web at human speed</span><span class="ow-meta">MAYA CHEN · AUG 3</span></div>
        <div class="stack gap4"><span style="font-family:var(--serif);font-size:15px">Notes on a 30-year-old homepage</span><span class="ow-meta">TOMÁS RIVERA · JUL 28</span></div>
      </div></div></div>''', tag='Latest issues · MAIN FEED')}
  {sec('newsletter', '''<div class="stack gap10" style="padding:30px 32px;background:#F4EFE6">
    <span style="font-family:var(--serif);font-size:22px" data-editable>The Sunday orbit.</span>
    <span class="ow-dek">One essay, every Sunday · No algorithm, no feed · Free forever</span>
    <div class="row gap8"><span class="input" style="max-width:260px;display:flex;align-items:center;color:var(--ink-faint)">you@example.com</span>
      <span class="ow-sub">Sign up</span></div></div>''', tag='The list, teased', pro=True)}
  {sec('footer', '''<div class="row gap32" style="padding:26px 32px;background:#3B382F;color:#E8E2D6;align-items:flex-start">
    <div class="stack gap6" style="flex:1.4"><span style="font-family:var(--serif);font-size:15px">Orbit Weekly</span>
      <span style="font-size:11px;opacity:.72;font-family:var(--ui)">Essays on the humane web, published every Sunday from Lisbon.</span></div>
    <div class="stack gap4" style="font-size:11px;font-family:var(--ui);opacity:.8"><b>READ</b><span>Essays</span><span>Notes</span><span>Archive</span></div>
    <div class="stack gap4" style="font-size:11px;font-family:var(--ui);opacity:.8"><b>MEMBERS</b><span>Sign in</span><span>Upgrade</span><span>Gift</span></div>
    <div class="stack gap4" style="font-size:11px;font-family:var(--ui);opacity:.8"><b>MORE</b><span>About</span><span>RSS</span><span>Contact</span></div>
  </div>''', tag='Footer · site-wide')}
</div></div>"""


def layer(name, label, pro=False):
    return (f'<button class="lrow" data-layer="{name}" data-section-pick="{name}" '
            f'style="width:100%;border:none;background:none;font-family:var(--ui);cursor:pointer;text-align:left">'
            f'{ICON["grip"]}<span class="lthumb"></span><span class="grow">{label}</span>'
            + ('<span class="badge pro">✦ Pro</span>' if pro else '')
            + f'<span class="faint">{ICON["eye"]}</span></button>')


LAYERS = f"""<div class="layers"><div class="list">
  <div class="row gap8" style="padding:8px"><span class="panel-label grow">Layers</span>
    <span class="kbd">L</span></div>
  <div class="sitewide">
    <div class="row gap8" style="padding:2px 6px 6px"><span class="panel-label" style="font-size:11px">SITE-WIDE</span>
      <span class="helper" style="margin-left:auto">on 9 templates</span></div>
    {layer('header', 'Header')}
    {layer('footer', 'Footer')}
  </div>
  <div class="row" style="padding:6px 8px"><span class="panel-label" style="font-size:11px">THIS PAGE · HOME</span>
    <span class="helper" style="margin-left:auto">4</span></div>
  {layer('hero', 'Home hero')}
  {layer('feed', 'Latest issues')}
  {layer('newsletter', 'The list, teased', pro=True)}
</div>
<div style="border-top:1px solid var(--line);padding:10px">
  <a class="btn dashed" href="section-picker.html" id="section-picker-link" style="width:100%">+ Add section</a></div></div>"""


def simple_panel(title, body, key):
    return (f'<div data-panel-for="{key}" hidden>'
            f'<div class="row gap8"><b style="font-size:13px">{title}</b></div>{body}</div>')


SIDEBAR = f"""<div class="sidebar">
  <div data-panel-empty class="stack gap8" style="margin:auto;text-align:center;padding:24px">
    <b style="font-size:13.5px">Nothing selected</b>
    <span class="helper">Click any section on the canvas — its controls appear here.</span></div>

  <div data-panel-for="hero" hidden>
    <div class="row gap8" style="margin-bottom:12px"><b style="font-size:13px">Home hero</b>
      <span class="chip mono" style="margin-left:auto" data-design-slash></span></div>
    <div class="ctlgroup"><span class="panel-label">Design</span>
      <div class="row gap8"><span class="mono" style="font-size:13px" data-design-count></span>
        <span class="row gap4" style="margin-left:auto">
          <button class="kbd" data-design-nav="-1" style="cursor:pointer">[</button>
          <button class="kbd" data-design-nav="1" style="cursor:pointer">]</button></span></div>
      <div class="dstrip">{design_strip()}</div>
      <span class="helper" data-design-name></span></div>
    {hero_panels()}
  </div>

  {simple_panel('Header · site-wide', '''
    <div class="banner info" style="margin-bottom:10px"><span class="ico">ⓘ</span>
      <span>Editing this changes it on all 9 templates. We say so the first time, then stop.</span></div>
    <div class="ctlgroup"><span class="control-label">Layout</span>
      <span class="seg"><span class="on">Left mark</span><span>Centred</span></span></div>
    <div class="ctlgroup"><span class="control-label">Sticky</span>
      <span class="seg"><span>Never</span><span class="on">On scroll up</span><span>Always</span></span></div>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle on"></span>
      <span class="control-label grow">Subscribe button</span></label></div>''', 'header')}

  {simple_panel('Latest issues', '''
    <span class="chip mono" style="margin-bottom:10px;display:inline-flex">MAIN FEED</span>
    <div class="ctlgroup greyed"><span class="control-label">Count</span>
      <span class="stepper"><span>−</span><span class="v">12</span><span>+</span></span>
      <span class="reason">This feed is sized by your theme&rsquo;s Posts per page.
        <a href="theme-settings.html">Change it in Theme settings.</a></span></div>
    <div class="ctlgroup"><span class="control-label">Pagination</span>
      <span class="seg"><span class="on">Numbered</span><span>Load more</span><span>Infinite</span></span>
      <span class="helper">Only the main feed has this control.</span></div>
    <div class="ctlgroup"><span class="control-label">Lead item</span>
      <span class="seg"><span class="on">Large</span><span>Equal</span></span></div>''', 'feed')}

  {simple_panel('The list, teased', '''
    <div class="row gap8" style="margin-bottom:10px"><span class="badge pro">✦ Pro</span>
      <span class="helper">A price tag, not a lock. Nothing happens when you click it.</span></div>
    <div class="ctlgroup"><span class="control-label">Form fields</span>
      <span class="seg"><span class="on">Email</span><span>Email + name</span></span></div>
    <div class="ctlgroup"><span class="control-label">Background role</span>
      <div class="swatches"><span class="sw" style="background:#FBF9F5"></span>
        <span class="sw on" style="background:#F4EFE6"></span>
        <span class="sw" style="background:#D96C3F"></span>
        <span class="sw" style="background:#3B382F"></span></div></div>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle on"></span>
      <span class="control-label grow">Show the disclaimer</span></label></div>''', 'newsletter')}

  {simple_panel('Footer · site-wide', '''
    <div class="ctlgroup"><span class="control-label">Columns</span>
      <span class="seg"><span>Two</span><span class="on">Three</span><span>Four</span></span></div>
    <div class="ctlgroup"><span class="control-label">Background role</span>
      <div class="swatches"><span class="sw" style="background:#FBF9F5"></span>
        <span class="sw" style="background:#F4EFE6"></span>
        <span class="sw on" style="background:#3B382F"></span></div></div>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle on"></span>
      <span class="control-label grow">Show the RSS link</span></label></div>
    <div class="stack gap6"><span class="panel-label">No dark-mode switch</span>
      <span class="reason">There is no dark-mode switch for visitors. This project&rsquo;s colour scheme is
        pinned in its Style Pack, so a visitor&rsquo;s browser preference does not change it.</span></div>''', 'footer')}
</div>"""


PACKS = ['Paper', 'Tangerine', 'Ink', 'Meadow', 'Harbor', 'Dune', 'Neon Dusk', 'Cocoa', 'Mist', 'Berry', 'Slate', 'Butter']

STYLE_PANEL = f"""<div class="overlay pop" id="packs" style="right:16px;top:56px;width:320px">
  <div class="row gap8"><span class="panel-label grow">Style Pack</span>
    <button class="soft" data-close style="border:none;background:none;cursor:pointer">✕</button></div>
  <div class="grid g3 gap8">""" + ''.join(
    f'<button data-pack="{p}" class="stack gap4{" on" if p == "Paper" else ""}" '
    f'style="align-items:center;border:none;background:none;cursor:pointer;font-family:var(--ui)">'
    f'<span class="thumb" style="width:100%;height:48px;display:flex;align-items:center;justify-content:center;'
    f'font-family:var(--serif);font-size:17px">Ag</span>'
    f'<span class="helper">{p}</span></button>' for p in PACKS) + f"""
    <button class="stack gap4" data-open="edit-pack" style="align-items:center;border:none;background:none;cursor:pointer;font-family:var(--ui)">
      <span class="thumb" style="width:100%;height:48px;display:flex;align-items:center;justify-content:center;border-style:dashed">+</span>
      <span class="helper">New pack</span></button></div>
  <div class="ctlgroup"><span class="control-label">Title font</span>
    <div class="row gap8"><span style="font-family:var(--serif);font-size:16px">Aa</span>
      <span style="font-size:13px">Georgia</span></div></div>
  <div class="ctlgroup"><span class="control-label">Site width</span>
    <span class="seg"><span>Narrow</span><span class="on">Standard</span><span>Wide</span></span></div>
  <div class="ctlgroup"><span class="control-label">Corners</span>
    <span class="seg"><span>Sharp</span><span class="on">Soft</span><span>Round</span></span></div>
  <div class="ctlgroup"><span class="control-label">Density</span>
    <span class="seg"><span>Compact</span><span class="on">Comfortable</span><span>Spacious</span></span></div>
  <button class="btn secondary sm" data-open="edit-pack">Edit this pack</button>
</div>
<div class="overlay sheet-wrap" id="edit-pack"><div class="sheet"><div class="head">
    <h2 style="font-size:20px">Edit pack</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">Seven roles per mode. Tap any swatch to change it —
      dark is tuned separately, never just inverted.</p></div>
  <div class="body">
    <label class="field"><span class="control-label">Pack name</span>
      <input class="input" value="Maya&rsquo;s Warm" aria-label="Pack name"></label>
    <div class="stack gap8"><span class="panel-label">Light</span><div class="row gap12 wrap">""" + ''.join(
    f'<div class="stack gap4" style="align-items:center"><span class="sw" style="background:{c};width:32px;height:32px"></span>'
    f'<span class="helper">{r}</span></div>'
    for r, c in [('Background', '#F7F5F2'), ('Surface', '#FFFFFF'), ('Text', '#232019'), ('Muted', '#6B6459'),
                 ('Border', '#E7E2DB'), ('Accent', '#D96C3F'), ('Contrast', '#3B382F')]) + """</div></div>
    <div class="stack gap8"><span class="panel-label">Dark</span><div class="row gap12 wrap">""" + ''.join(
    f'<div class="stack gap4" style="align-items:center"><span class="sw" style="background:{c};width:32px;height:32px"></span>'
    f'<span class="helper">{r}</span></div>'
    for r, c in [('Background', '#171511'), ('Surface', '#1F1C17'), ('Text', '#F0EAE0'), ('Muted', '#A79E8F'),
                 ('Border', '#3A342B'), ('Accent', '#E0805A'), ('Contrast', '#F4EFE6')]) + """</div></div>
    <div class="banner notice"><span class="ico">!</span><span><b>Muted on Background is 3.8:1 — under 4.5:1.</b>
      Body text in that role would be hard to read. We are warning rather than blocking: it is your pack,
      and this is the warning that makes the choice fair.</span></div>
    <p class="helper">This is the one place in the product with a raw colour picker. Section controls carry
      named values only — never px, hex or CSS.</p></div>
  <div class="foot"><button class="btn ghost" data-close>Reset to defaults</button>
    <button class="btn secondary" data-close style="margin-left:auto">Cancel</button>
    <button class="btn coral" data-close>Save pack</button></div></div></div>"""

REMIX_SHEET = """<div class="overlay sheet-wrap" id="remix"><div class="sheet"><div class="head">
    <div class="row gap10"><h2 style="font-size:22px">Remix this site</h2>
      <span class="kbd" style="margin-left:auto">⇧R</span></div>
    <p class="softaa" style="font-size:13px;margin-top:6px">Re-rolls every section to a different design in its
      own category. Your text, images and settings stay — only the arrangements change.</p></div>
  <div class="body">
    <div class="stack gap8"><span class="panel-label">What gets re-rolled</span>
      <label class="radiocard on"><span class="radio on"></span><span class="stack"><span class="t">Designs</span>
        <span class="c">Every section gets a different design in its own category.</span></span></label>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Style Pack</span>
        <span class="c">Same designs, a different palette, type and shape.</span></span></label>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Both</span>
        <span class="c">A different site wearing the same words.</span></span></label></div>
    <div class="stack gap8"><span class="panel-label">How far it reaches</span>
      <label class="radiocard on"><span class="radio on"></span><span class="stack"><span class="t">This page only</span>
        <span class="c">4 sections on Home.</span></span></label>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Every template</span>
        <span class="c">9 templates, 41 sections.</span></span></label>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Header and footer too</span>
        <span class="c">Includes the site-wide sections, on every template at once.</span></span></label></div>
    <div class="banner info"><span class="ico">ⓘ</span><span>Remix always re-rolls from the whole library.
      If it lands a Pro design on a Free plan, the Pro exit sheet catches it once, at the exit — which is the
      only place money is ever mentioned.</span></div></div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button>
    <button class="btn coral" id="do-remix">Remix</button></div></div></div>
<div class="toast" id="remix-toast" hidden style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  z-index:210;background:var(--ink);color:#fff;border-radius:var(--r-pill);padding:10px 18px;
  align-items:center;gap:12px;box-shadow:var(--sh-lg);font-size:13px">
  <span>Remixed 4 sections on Home.</span>
  <button id="undo-remix" style="background:none;border:none;color:#fff;text-decoration:underline;cursor:pointer;font-family:var(--ui);font-size:13px">Undo</button>
  <span class="kbd" style="background:transparent;border-color:rgba(255,255,255,.3);color:#fff">⌘Z</span></div>"""

INLINE_TOOLBAR = """<div id="inline-toolbar">
  <button data-mark="bold" style="font-weight:700">B</button>
  <button data-mark="italic" style="font-style:italic">I</button>
  <button data-mark="underline" style="text-decoration:underline">U</button>
  <span class="sep"></span>
  <button data-open="link-entry" aria-label="Link">🔗</button>
  <button disabled aria-label="Remove link" title="Remove link">⛔</button></div>
<div class="overlay sheet-wrap" id="link-entry"><div class="sheet narrow" style="max-width:380px">
  <div class="body"><input class="input" placeholder="Paste a URL, or search your posts…" aria-label="Link target">
    <div class="mlabel">PAGES</div>
    <div class="mrow">The archive<span class="helper mono" style="margin-left:auto">/archive/</span></div>
    <div class="mlabel">POSTS</div>
    <div class="mrow">What we lost when blogrolls died<span class="helper" style="margin-left:auto">Aug 10</span></div>
    <div class="mrow">Notes on a 30-year-old archive<span class="helper" style="margin-left:auto">Jul 28</span></div>
    <div class="mlabel">PORTAL ACTIONS</div>
    <div class="row gap6 wrap" style="padding:0 10px"><span class="chip">Sign up</span><span class="chip">Sign in</span>
      <span class="chip">Account</span><span class="chip">Upgrade</span></div>
    <div class="row gap8" style="padding:8px 10px 0"><span class="check"></span>
      <span style="font-size:12.5px">Open in new tab</span></div></div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button>
    <button class="btn coral" data-close>Link it</button></div></div></div>"""

PREVIEW_BAR = """<span class="pill preview-bar">
  <a href="#" data-set="mode:">Back to editing</a>
  <span class="kbd" style="background:transparent;border-color:rgba(255,255,255,.3);color:#fff">esc</span>
  <a href="#" data-set="device:desktop">Desktop</a>
  <a href="#" data-set="device:tablet">Tablet</a>
  <a href="#" data-set="device:mobile">Mobile</a></span>"""


def edbar(project='Orbit Weekly', template='Home', ship='Ship update', ship_href='deploy.html'):
    return f"""<div class="edbar">
  <a class="row" href="dashboard.html" style="width:28px;height:28px;justify-content:center"
     aria-label="Back to projects">{ICON['back']}</a>
  <span style="font-size:13px;font-weight:600" data-editable>{project}</span>
  <span class="row gap6 small soft" data-persist><span class="dot grey"></span>Saved on this device</span>
  <div class="centre">
    <span class="anchor"><button class="pickbtn" data-open="template-menu"
        style="font-family:var(--ui);cursor:pointer"><span class="lab">Template</span>{template}{ICON['caret']}</button>
      {TEMPLATE_MENU}</span>
    <span class="anchor"><button class="pickbtn" data-open="viewas-menu"
        style="font-family:var(--ui);cursor:pointer">{ICON['eye']}<span class="lab">View as</span>Anonymous{ICON['caret']}</button>
      {VIEWAS_MENU}</span>
  </div>
  <div class="row gap8" style="margin-left:auto">
    <button class="iconbtn" data-open="packs" aria-label="Style Packs" title="Style Packs"
      style="border:none;background:none;cursor:pointer;width:28px;height:28px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E6A64" stroke-width="1.5">
        <circle cx="12" cy="12" r="9"/><circle cx="9" cy="9.5" r="1.3" fill="#6E6A64"/>
        <circle cx="14.5" cy="9" r="1.3" fill="#6E6A64"/><circle cx="16" cy="14" r="1.3" fill="#6E6A64"/>
        <path d="M12 21a3 3 0 0 1 0-6 2 2 0 0 0 0-4"/></svg></button>
    <span class="seg" data-sets="device">
      <span class="on" data-value="desktop" title="Desktop — 1" aria-label="Desktop">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span>
      <span data-value="tablet" title="Tablet — 2" aria-label="Tablet">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="5" y="3" width="14" height="18" rx="2"/></svg></span>
      <span data-value="mobile" title="Mobile — 3" aria-label="Mobile">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="8" y="3" width="8" height="18" rx="2"/></svg></span></span>
    <button class="btn sm secondary" data-set="mode:preview">Preview<span class="kbd">P</span></button>
    <a class="iconbtn" href="deploy-history.html" aria-label="Deploy history">{ICON['clock']}</a>
    <span class="split"><a class="btn coral" href="{ship_href}" data-ship>{ship}</a>
      <span class="anchor"><button class="btn coral caret" data-open="ship-menu"
        style="height:32px;border-radius:0;font-family:var(--ui);cursor:pointer">▾</button>
        <div class="overlay menu" id="ship-menu">
          <a class="mrow" href="{ship_href}">Ship update</a>
          <a class="mrow" href="deploy-history.html">History</a>
          <a class="mrow" href="{ship_href}?export">Export theme zip</a>
          <a class="mrow" href="binding-checklist.html">Template binding</a></div></span></span>
  </div>
</div>"""


LOCK_OVERLAYS = """<div class="overlay sheet-wrap" id="lock-request">
  <div class="sheet narrow" style="max-width:360px"><div class="body">
    <div class="row gap10"><span class="avatar" style="background:#3A4A5F">DM</span>
      <b style="font-size:14px">Ask Rosa to hand over?</b></div>
    <p style="font-size:13px;line-height:1.55">She keeps editing until she answers. If she hands over, her
      unsynced changes are sent first.</p></div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button>
    <button class="btn coral" data-open="lock-waiting">Request editing</button></div></div></div>
<div class="overlay sheet-wrap" id="lock-waiting"><div class="sheet narrow" style="max-width:400px">
  <div class="body"><div class="banner notice"><span class="ico">!</span>
    <span><b>No response; that session has 7 unsaved edits.</b></span></div>
  <p style="font-size:13px;line-height:1.55">You can take over anyway. It is allowed, and it is not a wall —
    but the work that had not synced is genuinely gone.</p></div>
  <div class="foot"><button class="btn secondary" data-close>Keep waiting</button>
    <button class="btn danger-out" data-open="lock-takeover">Take over anyway</button></div></div></div>
<div class="overlay sheet-wrap" id="lock-takeover"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Take over from Rosa?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Rosa has not responded for 4 minutes.
    She has changes that never reached the server.</p>
    <div class="banner error"><span class="ico">!</span><span><b>7 unsynced edits will be lost.</b>
      They exist only in Rosa&rsquo;s browser. We cannot retrieve them from here.</span></div></div>
  <div class="foot"><button class="btn secondary" data-close autofocus>Wait</button>
    <a class="btn danger" href="editor.html">Take over anyway</a>
    <button class="btn ghost" data-close>Or message Rosa</button></div></div></div>"""

SMALL_SCREEN_BLOCK = """<div class="small-screen-only" style="padding:24px;flex-direction:column;
  gap:20px;align-items:center;justify-content:center;min-height:100vh;max-width:390px;margin:0 auto">
  <svg width="120" height="96" viewBox="0 0 120 96" fill="none" stroke="#1C1B1A" stroke-width="1.5">
    <rect x="8" y="12" width="64" height="46" rx="4"/><path d="M8 50h64"/><path d="M28 66h24M34 58v8"/>
    <rect x="82" y="26" width="26" height="46" rx="4" fill="#FFEDE8" stroke="#FF5941"/></svg>
  <div class="stack gap8" style="text-align:center"><h1 style="font-size:22px">The editor needs a bigger screen.</h1>
    <p class="softaa" style="font-size:13.5px">Dragging sections and a 300-pixel control panel don&rsquo;t fit
      on a phone yet. Open this project on a laptop or tablet.</p></div>
  <div class="row gap10"><a class="btn secondary" href="deploy-history.html">Deploy history</a>
    <a class="btn secondary" href="sites.html">Your sites</a></div></div>"""

EDITOR_BODY = f"""{SMALL_SCREEN_BLOCK}
<div class="ed">{edbar()}
  <div class="edmid">{LAYERS}
    <div class="canvasmat" data-deselect>
      <div class="row gap10 canvas-chrome" style="max-width:1100px;margin:0 auto 10px;justify-content:center">
        <span class="anchor"><button class="pill" data-open="source-menu"
            style="border:none;cursor:pointer;font-family:var(--ui)">
            <span class="dot mint"></span><span>Previewing with:&nbsp;<b>Orbit Weekly</b></span></button>
          {SOURCE_MENU}</span>
        <span class="chip mono" data-size-chip="desktop">FIT TO SCREEN</span>
        <span class="chip mono" data-size-chip="tablet">VIEWPORT 834 × 1112</span>
        <span class="chip mono" data-size-chip="mobile">VIEWPORT 390 × 844</span>
      </div>
      {CANVAS}
    </div>
    {SIDEBAR}
  </div>
</div>
{STYLE_PANEL}{REMIX_SHEET}{INLINE_TOOLBAR}{PREVIEW_BAR}{LOCK_OVERLAYS}{shortcuts_sheet()}"""

EDITOR_SCRIPT = """
document.body.setAttribute('data-editor-shell', '1');
document.body.classList.add('device-desktop');
var ring = document.querySelector('[data-ring]');
// A blank canvas is one affordance and nothing else — the canvas is sacred.
if (location.search.indexOf('empty') > -1) {
  document.querySelectorAll('[data-section]:not([data-section="header"]):not([data-section="footer"]), .addhere')
    .forEach(function (n) { n.remove(); });
  var site = document.querySelector('[data-site]');
  var slot = document.createElement('div');
  slot.style.cssText = 'padding:120px 24px;display:flex;justify-content:center;background:var(--paper-raised)';
  slot.innerHTML = '<a class="btn dashed lg" href="section-picker.html">+ Add section</a>';
  site.insertBefore(slot, site.lastElementChild);
}
if (location.search.indexOf('readonly') > -1) {
  document.querySelector('.sidebar').classList.add('dim');
  var bar = document.createElement('div');
  bar.className = 'row gap12';
  bar.style.cssText = 'background:var(--marigold-tint);padding:10px 16px';
  bar.innerHTML = '<b style="font-size:13px">Read-only — this project is over your Free plan&rsquo;s limit.</b>'
    + '<a class="btn sm secondary" href="over-limit.html">Make this the editable one</a>'
    + '<a class="btn sm secondary" href="deploy.html?export">Export theme zip</a>';
  document.querySelector('.ed').insertBefore(bar, document.querySelector('.edmid'));
}
if (location.search.indexOf('locked') > -1) {
  document.querySelector('.sidebar').classList.add('dim');
  var b2 = document.createElement('div');
  b2.className = 'row gap12';
  b2.style.cssText = 'background:var(--sky-tint);padding:10px 16px';
  b2.innerHTML = '<b style="font-size:13px">Rosa is editing this site — you are reading along.</b>'
    + '<button class="btn sm secondary" data-open="lock-request">Request editing</button>';
  document.querySelector('.ed').insertBefore(b2, document.querySelector('.edmid'));
}
document.getElementById('do-remix').addEventListener('click', function () {
  document.querySelectorAll('.overlay.is-open').forEach(function (o) { o.classList.remove('is-open'); });
  document.body.classList.remove('has-overlay');
  var n = Math.floor(Math.random() * 4) + 1;   // a re-roll is one edit, not several operations
  window.setState('mode', null);
  var t = document.getElementById('remix-toast');
  t.hidden = false; window.announce('Remixed 4 sections on Home.');
  setTimeout(function () { t.hidden = true; }, 6000);
  document.querySelectorAll('[data-design-nav="1"]')[0].click();
});
document.getElementById('undo-remix').addEventListener('click', function () {
  document.getElementById('remix-toast').hidden = true;
  document.querySelectorAll('[data-design-nav="-1"]')[0].click();
  window.announce('Undone.');
});
"""

page('editor', 'Orbit Weekly · Home', EDITOR_BODY, script=EDITOR_SCRIPT, extra_head=f"""
<style>[data-ring]{{}}</style>""")


CATEGORIES = ['Headers', 'Announcement Bars', 'Heroes', 'Post Grids', 'Featured Posts', 'Post Lists',
              'Archive Feeds', 'Tag Pages', 'Author Pages', 'Post Headers', 'Post Content', 'Post Footers',
              'Related Posts', 'Comments', 'Newsletter Signup', 'Membership Tiers', 'Paywalls',
              'Account &amp; Portal', 'About', 'Team', 'Testimonials', 'Logos &amp; Press', 'Stats',
              'Features', 'FAQ', 'Contact', 'Pricing Tables', 'CTA Bands', 'Galleries', 'Video &amp; Audio',
              'Search', 'Footers', 'Legal', '404 &amp; Empty']

PICKER_DESIGNS = [
    ('Split Editorial', 'Free', 'ISSUE 47 · ESSAYS<br><b>The slow return of the personal homepage</b><br><span style="font-size:10px">MAYA CHEN · AUG 14</span>'),
    ('Editorial Stack', 'Pro', 'ORBIT WEEKLY<br><b>Essays for the unhurried web</b><br><span style="font-size:10px">EVERY SUNDAY · FREE</span>'),
    ('Full-bleed Cover', 'Pro', 'FIELD NOTES<br><b>Notes from a quieter internet</b>'),
    ('Centred Classic', 'Free', 'SUNDAY ESSAYS<br><b>Orbit Weekly, issue by issue</b><br><span style="font-size:10px">One considered essay a week.</span>'),
    ('Magazine Duo', 'Free', '<b>Read widely, scroll less</b><br><span style="font-size:10px">01 The case for blogrolls<br>02 Quiet software</span>'),
    ('Big Serif Statement', 'Pro', '<b>The web is a <i>garden</i>, not a feed.</b>'),
    ('Photo Ribbon', 'Free', '<b>Sunday essays on the humane web</b>'),
    ('Minimal Masthead', 'Free', 'ORBIT WEEKLY<br><b>A homepage worth keeping</b>'),
    ('Split Form', 'Free', 'EVERY THURSDAY<br><b>Seven links from the quiet web</b><br><span style="font-size:10px">you@example.com</span>'),
    ('Member Welcome', 'Pro', 'MEMBERS<br><b>Join 4,100 readers of the Sunday orbit</b>'),
    ('Image Backdrop', 'Pro', 'ISSUE 118<br><b>The four hundred domains that refuse to move</b>'),
    ('Big Type Manifesto', 'Free', '<b>The web did not get worse. It got busier.</b>'),
]

page('section-picker', 'Add a section', f"""
<div style="height:100vh;background:var(--paper);display:flex;flex-direction:column">
  <div class="row gap12" style="padding:16px 24px;border-bottom:1px solid var(--line)">
    <label class="search" style="width:420px">{ICON['search']}
      <input data-filter=".pick" data-filter-empty="#no-designs" placeholder="Find a section…"
        aria-label="Find a section" autofocus
        style="border:none;background:none;outline:none;font-family:var(--ui);font-size:13px;flex:1"></label>
    <a class="btn secondary sm" href="editor.html" style="margin-left:auto">Esc — close</a></div>
  <div class="row" style="flex:1;min-height:0;align-items:stretch">
    <div style="width:230px;border-right:1px solid var(--line);padding:12px 10px;overflow:auto">
      <span class="panel-label" style="display:block;padding:4px 8px">All categories</span>
      """ + ''.join(
        f'<button class="mrow" style="width:100%;border:none;background:{"var(--coral-tint)" if c == "Heroes" else "none"};'
        f'cursor:pointer;font-family:var(--ui);font-weight:{"600" if c == "Heroes" else "500"}">{c}</button>'
        for c in CATEGORIES) + """
      <label class="row gap8" style="padding:10px 8px 4px;border-top:1px solid var(--line-faint);margin-top:8px;cursor:pointer">
        <span class="toggle"></span><span class="small soft">Free only</span></label></div>
    <div class="grow" style="padding:20px 24px;overflow:auto">
      <div class="row gap10" style="margin-bottom:14px"><h2 style="font-size:18px">Heroes</h2>
        <span class="helper">shown in your pack: Paper · with your real posts</span></div>
      <div class="grid g3">""" + ''.join(
        f"""<a class="card pick" href="editor.html">
          <span class="thumb" style="display:block;height:150px;border-radius:12px 12px 0 0;border:none;
            padding:16px;font-family:var(--serif);font-size:12px;line-height:1.4;color:var(--ink-deep);overflow:hidden">{prev}</span>
          <span class="pad-tight row gap8"><b style="font-size:12.5px" class="grow">{n}</b>
            <span class="badge {'pro' if b == 'Pro' else 'free'}">{'✦ Pro' if b == 'Pro' else 'Free'}</span></span></a>"""
        for n, b, prev in PICKER_DESIGNS) + """</div>
      <div id="no-designs" hidden style="padding:48px;text-align:center" class="stack gap10">
        <b style="font-size:15px">Nothing matches &ldquo;<span data-filter-echo></span>&rdquo;.</b>
        <span class="helper">Try a category on the left, or a plainer word — the designs are named for what
          they look like, not for what you would put in them.</span></div>
    </div></div></div>""", script="""
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') window.location.href = 'editor.html';
});""")


def surface_nav(active):
    def row(key, label, href):
        return (f'<a class="lrow" href="{href}" style="color:#F0EAE0'
                f'{";background:rgba(255,255,255,.08)" if key == active else ""}">{label}</a>')
    return f"""<div class="layers" style="background:var(--ink-deep);border-right-color:#3A342B">
  <div class="list" style="color:#F0EAE0">
    <a class="row gap8" href="editor.html" style="padding:8px;color:#A79E8F;font-size:12px">← Back to Home</a>
    <span class="panel-label" style="color:#A79E8F;padding:6px 8px">POST TEMPLATE</span>
    {row('post', 'Post content', 'post-content.html')}
    <div class="lrow" style="color:#F0EAE0">Post header</div>
    <div class="lrow" style="color:#F0EAE0">Author card</div>
    <div style="height:1px;background:#3A342B;margin:8px"></div>
    <span class="panel-label" style="color:#A79E8F;padding:6px 8px">TEMPLATE SURFACES</span>
    {row('paywall', 'Paywall', 'paywall-editor.html')}
    {row('cards', 'Cards', 'editor-cards.html')}
    {row('errors', 'Error pages', 'error-pages.html')}
  </div></div>"""


def dark_edbar(crumb, chip='', ship='Ship update'):
    return f"""<div class="edbar ink">
  <a class="row" href="editor.html" style="width:28px;height:28px;justify-content:center;color:#F0EAE0">{ICON['back']}</a>
  <span style="font-size:13px;font-weight:600">{crumb}</span>
  {f'<span class="chip">{chip}</span>' if chip else ''}
  <span class="row gap6 small" style="color:#A79E8F" data-persist><span class="dot mint"></span>Synced</span>
  <div class="row gap8" style="margin-left:auto">
    <span class="anchor"><button class="pickbtn" data-open="viewas-menu"
      style="font-family:var(--ui);cursor:pointer">{ICON['eye']}<span class="lab">View as</span>Anonymous{ICON['caret']}</button>
      {VIEWAS_MENU}</span>
    <span class="split"><a class="btn coral" href="deploy.html" data-ship>{ship}</a></span></div>
</div>"""


page('paywall-editor', 'Paywall', f"""<div class="ed">
  {dark_edbar('Orbit Weekly &nbsp;/&nbsp; Template surfaces &nbsp;/&nbsp; Paywall', 'NOT A PAGE SECTION')}
  <div class="edmid">{surface_nav('paywall')}
  <div class="canvasmat cold">
    <div class="row gap10" style="max-width:880px;margin:0 auto 10px;flex-wrap:wrap">
      <span class="pill"><span>How readers reach it</span></span>
      <span class="helper">Ghost cuts the post at the author&rsquo;s Public preview marker and renders this
        block in its place. You cannot move it.</span>
      <span class="chip" style="margin-left:auto">2 tiers · 1 free</span></div>
    <div class="site" style="max-width:880px">
      <div class="stack gap12" style="padding:28px 32px;opacity:.55">
        <span style="font-family:var(--serif);font-size:22px">Who is actually paying</span>
        <p style="font-family:var(--serif);font-size:15px;line-height:1.65">Three of the four hundred are paid
          for by estates. Two are paid for by universities that forgot they were paying. The rest are
          individuals, and their renewal dates cluster in October for a reason nobody has ever explained to me.</p>
        <p style="font-family:var(--serif);font-size:15px;line-height:1.65">I asked eleven of them. Four said
          the date meant nothing. Three said it was when they had money. Two said October was when the old
          host used to bill, and</p></div>
      <div style="border-top:1px dashed var(--coral);margin:0 32px;position:relative;height:22px">
        <span class="chip" style="position:absolute;top:-9px;left:0;background:var(--coral-tint);color:var(--coral-text)">GHOST CUTS HERE · PUBLIC PREVIEW MARKER</span></div>
      <div class="stack gap16" style="padding:8px 32px 32px">
        <div class="stack gap6"><span style="font-family:var(--serif);font-size:24px">The rest is for members</span>
          <span class="ow-dek">Eleven interviews, the full list of four hundred, and the spreadsheet behind it.</span></div>
        <span class="seg" style="align-self:flex-start"><span class="on">Monthly</span><span>Yearly · 2 months free</span></span>
        <div class="row gap16" style="align-items:stretch">
          <div class="card grow"><div class="pad stack gap8"><b style="font-size:14px">Reader</b>
            <span style="font-family:var(--display);font-size:26px;font-weight:700">$5<span class="soft" style="font-size:12px">/month</span></span>
            <span class="helper">Every Thursday issue in full</span><span class="helper">The complete link archive</span>
            <span class="btn secondary sm">Choose Reader</span></div></div>
          <div class="card grow" style="border-color:var(--marigold)"><div class="pad stack gap8">
            <div class="row gap8"><b style="font-size:14px">Supporter</b><span class="badge pro">✦ MOST PICKED</span></div>
            <span style="font-family:var(--display);font-size:26px;font-weight:700">$12<span class="soft" style="font-size:12px">/month</span></span>
            <span class="helper">Everything in Reader</span><span class="helper">The spreadsheets, as spreadsheets</span>
            <span class="btn coral sm">Choose Supporter</span></div></div></div>
        <span class="helper">Already a member? Sign in</span></div></div>
    <p class="helper" style="max-width:880px;margin:10px auto 0">The article above is context, not editable here.</p>
  </div>
  <div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">Paywall</b><span class="chip mono" style="margin-left:auto">4 / 12</span></div>
    <div class="ctlgroup"><span class="panel-label">Design</span>
      <div class="dstrip">""" + ''.join(
        f'<button class="dthumb{" on" if i == 3 else ""}" style="cursor:pointer"></button>' for i in range(11))
    + """<span class="dthumb">+1</span></div>
      <span class="helper">Two Up — tiers side by side</span></div>
    <div class="ctlgroup"><span class="control-label">Preview treatment</span>
      <span class="seg"><span>None</span><span class="on">Fade</span><span>Blur</span></span>
      <span class="helper">This softens the last visible paragraph only. Hidden content is never sent to the
        browser, so there is nothing there to blur.</span></div>
    <div class="ctlgroup"><span class="control-label">Tiers to show</span>
      <span class="seg"><span class="on">All paid</span><span>Cheapest</span><span>One I pick</span></span></div>
    <div class="ctlgroup"><span class="control-label">On each tier</span>
      <label class="row gap10" style="cursor:pointer"><span class="toggle on"></span><span class="small">Benefits</span></label>
      <label class="row gap10" style="cursor:pointer"><span class="toggle on"></span><span class="small">Most picked</span></label>
      <label class="row gap10" style="cursor:pointer"><span class="toggle"></span><span class="small">Description</span></label>
      <label class="row gap10" style="cursor:pointer"><span class="toggle"></span><span class="small">Trial days</span></label></div>
    <div class="ctlgroup greyed"><span class="control-label">Monthly / yearly toggle</span>
      <span class="toggle on"></span>
      <span class="reason">Hidden when only one interval exists on your tiers.</span></div>
    <div class="ctlgroup"><span class="control-label">Surface</span>
      <span class="seg"><span>Page</span><span class="on">Tinted</span><span>Inverted</span></span></div>
    <button class="btn secondary sm" data-close>Reset this design</button>
  </div></div></div>""")

page('editor-cards', 'Editor cards', f"""<div class="ed">
  {dark_edbar('Orbit Weekly &nbsp;/&nbsp; Template surfaces &nbsp;/&nbsp; Cards')}
  <div class="edmid">{surface_nav('cards')}
  <div class="canvasmat cold">
    <div class="row gap10" style="max-width:880px;margin:0 auto 10px">
      <span class="anchor"><button class="pickbtn" data-open="treatment-menu"
        style="font-family:var(--ui);cursor:pointer"><span class="lab">Treatment</span>Card{ICON['caret']}</button>
        <div class="overlay menu left" id="treatment-menu">
          <div class="mlabel">Whole set · one active per project</div>
          <a class="mrow" href="#" data-close>Plain<span class="badge free" style="margin-left:auto">Free</span></a>
          <a class="mrow on" href="#" data-close>Card<span class="badge free" style="margin-left:auto">Free</span></a>
          <a class="mrow" href="#" data-close>Panel<span class="badge pro" style="margin-left:auto">✦ Pro</span></a>
          <a class="mrow" href="#" data-close>Wide<span class="badge pro" style="margin-left:auto">✦ Pro</span></a>
          <a class="mrow" href="#" data-close>Full Bleed<span class="badge pro" style="margin-left:auto">✦ Pro</span></a>
          <a class="mrow" href="#" data-close>Contrast Band<span class="badge pro" style="margin-left:auto">✦ Pro</span></a>
        </div></span>
      <span class="anchor"><button class="pickbtn" data-open="card-menu"
        style="font-family:var(--ui);cursor:pointer"><span class="lab">Card</span>Callout{ICON['caret']}</button>
        <div class="overlay menu left" id="card-menu" style="max-height:420px;overflow:auto">
          <div class="mlabel">Every Koenig card · Ghost&rsquo;s order</div>""" + ''.join(
        f'<a class="mrow{" on" if n == "Callout" else ""}" href="#" data-close>{n}{m}</a>'
        for n, m in [('Image', ''), ('Markdown', ''), ('HTML', ''),
                     ('Gallery', '<span class="badge notice" style="margin-left:auto">customised</span>'),
                     ('Divider', ''), ('Bookmark', ''), ('Email content', ''),
                     ('Call to action', '<span class="helper" style="margin-left:auto">no colour ctls</span>'),
                     ('Public preview', ''), ('Button', ''),
                     ('Callout', '<span class="badge notice" style="margin-left:auto">customised</span>'),
                     ('GIF', ''), ('Toggle', ''), ('Audio', ''), ('Video', ''), ('File', ''), ('Product', ''),
                     ('Header', '<span class="helper" style="margin-left:auto">no colour ctls</span>'),
                     ('Embeds', ''),
                     ('Signup', '<span class="helper" style="margin-left:auto">no colour ctls</span>')]) + """
        </div></span>
      <span class="helper" style="margin-left:auto">Cards are styled once, site-wide. 18 cards are on Ghost defaults.</span></div>
    <div class="site" style="max-width:880px"><div class="stack gap16" style="padding:32px;max-width:680px;margin:0 auto">
      <span style="font-family:var(--serif);font-size:26px;line-height:1.2">The slow return of the personal homepage</span>
      <span class="ow-meta">Maya Chen · Aug 14 · 9 min read</span>
      <p style="font-family:var(--serif);font-size:16px;line-height:1.7">The web used to point outward. A
        blogroll was a list of other people&rsquo;s homes, kept in public and updated by hand — reading one
        felt like being handed a map.</p>
      <div class="row gap12 outline-sel" style="background:#F4EFE6;padding:16px;border-radius:10px;align-items:flex-start">
        <span style="font-size:18px">💡</span>
        <span style="font-family:var(--serif);font-size:15px;line-height:1.6">Every essay in this series is free
          to read. The print annual collects them each October.</span></div>
      <p style="font-family:var(--serif);font-size:16px;line-height:1.7">What replaced it was a feed that points
        inward, and the difference is the whole story.</p>
      <p class="helper">Every other card in the set renders below in the same fixture, so a change is judged in context.</p>
    </div></div></div>
  <div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">Callout</b>
      <span class="badge notice" style="margin-left:auto">CUSTOMISED</span></div>
    <div class="ctlgroup"><span class="control-label">Callout colours</span>
      <span class="seg"><span class="on">Pack tokens</span><span>Ghost&rsquo;s palette</span></span></div>
    <div class="ctlgroup"><span class="control-label">Background role</span>
      <span class="seg"><span>Base</span><span>Surface</span><span class="on">Tint</span><span>Accent</span></span></div>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle on"></span>
      <span class="control-label grow">Emoji</span></label></div>
    <div class="ctlgroup"><span class="control-label">Emoji size</span>
      <span class="seg"><span class="on">Small</span><span>Large</span></span></div>
    <div class="stack gap6"><span class="panel-label">From the Card treatment</span>
      <div class="row gap8"><span class="control-label soft grow">Plane</span><span class="small">Surface</span></div>
      <div class="row gap8"><span class="control-label soft grow">Space around</span><span class="small">Comfortable</span></div>
      <div class="row gap8"><span class="control-label soft grow">Corners</span><span class="small">Pack radius</span></div>
      <span class="helper">Treatment-decided, shown read-only. Change them on the Treatment, not per card.</span></div>
    <button class="btn secondary sm" data-open="reset-card">Reset to Ghost default</button>
  </div></div></div>
<div class="overlay sheet-wrap" id="reset-card"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Reset Callout to Ghost&rsquo;s default?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Removes your 3 changes — colours, emoji and emoji
    size — everywhere callouts appear. <b>Posts keep their content.</b></p></div>
  <div class="foot"><button class="btn secondary" data-close autofocus>Cancel</button>
    <button class="btn danger-out" data-close>Reset card</button></div></div></div>""")


page('post-content', 'Post template', f"""<div class="ed">{edbar(template='Post')}
  <div class="edmid">{surface_nav('post')}
  <div class="canvasmat">
    <div class="row gap10 canvas-chrome" style="max-width:1000px;margin:0 auto 10px;justify-content:center">
      <span class="pill"><span class="dot mint"></span><span>Previewing with: <b>Style-guide article</b></span></span>
      <span class="chip">Design 3 of 9 · Measured</span>
      <span class="badge notice">Behaviours paused while editing</span></div>
    <div class="site" style="max-width:1000px" data-section="post">
      <span class="sec-tag">Post content</span>
      <div class="stack gap16" style="padding:36px;max-width:680px;margin:0 auto">
        <span class="ow-eyebrow">ARCHIVE · ISSUE 118 · 14 AUGUST 2026</span>
        <span style="font-family:var(--serif);font-size:30px;line-height:1.18" data-editable>The four hundred domains that refuse to move</span>
        <span class="ow-dek" data-editable>Every October, a few hundred people renew an address they never
          expected anyone to visit. This is what they have in common, and what happens the year they stop.</span>
        <span class="ow-meta">ROSA MENENDEZ · 9 MIN READ · MEMBERS</span>
        <div class="ow-photo" style="aspect-ratio:16/9"><span>a 2004 capture of the oldest address on the list</span></div>
        <p style="font-family:var(--serif);font-size:16px;line-height:1.7"><span style="float:left;font-size:52px;line-height:.85;padding:4px 8px 0 0">E</span>very
          October a renewal notice goes out to four hundred people who have, between them, almost nothing in
          common except an address they have kept for longer than most companies survive.</p>
        <span style="font-family:var(--serif);font-size:20px">What the list is</span>
        <p style="font-family:var(--serif);font-size:16px;line-height:1.7">It began as a spreadsheet and it is
          still a spreadsheet, which is the first honest thing about it.</p>
        <div class="row gap12" style="background:#F4EFE6;padding:16px;border-radius:10px">
          <span style="font-size:18px">💡</span>
          <span style="font-family:var(--serif);font-size:15px">Every essay in this series is free to read.</span></div>
        <blockquote style="margin:0;border-left:3px solid #D96C3F;padding-left:16px;font-family:var(--serif);font-size:18px;font-style:italic">
          &ldquo;October was when the old host used to bill. The host has been gone for a decade.&rdquo;</blockquote>
        <p class="helper">…and one of every card type below, so a change is judged in context.
          <a href="editor-cards.html">Style the cards →</a></p></div></div>
  </div>
  <div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">Post content</b><span class="chip mono" style="margin-left:auto">3 / 9</span></div>
    <div class="ctlgroup"><span class="panel-label">Design</span>
      <div class="dstrip">""" + ''.join(
        f'<button class="dthumb{" on" if i == 2 else ""}" style="cursor:pointer"></button>' for i in range(9))
    + """</div><span class="helper">Measured — a comfortable measure with a left index</span></div>
    <div class="ctlgroup"><span class="control-label">Measure</span>
      <span class="seg"><span>Narrow</span><span class="on">Comfortable</span><span>Wide</span></span></div>
    <div class="ctlgroup"><span class="control-label">Opening</span>
      <span class="seg"><span>Plain</span><span class="on">Drop cap</span><span>Lead-in</span></span></div>
    <div class="ctlgroup"><span class="control-label">Index</span>
      <span class="seg"><span>None</span><span class="on">Left</span><span>Right</span></span>
      <span class="helper">At 390 both become a collapsed index above the first heading.</span></div>
    <div class="ctlgroup"><span class="control-label">Share rail</span>
      <span class="seg"><span class="on">Foot</span><span>Side</span><span>None</span></span></div>
    <a class="btn secondary sm" href="editor-cards.html">Style the cards inside it →</a>
  </div></div></div>{INLINE_TOOLBAR}""",
     script="document.body.setAttribute('data-editor-shell','1');document.body.classList.add('device-desktop');")

page('error-pages', 'Error pages', f"""<div class="ed">
  {dark_edbar('Orbit Weekly &nbsp;/&nbsp; Template surfaces &nbsp;/&nbsp; Error pages')}
  <div class="edmid">{surface_nav('errors')}
  <div class="canvasmat cold">
    <div class="row gap10" style="max-width:880px;margin:0 auto 10px">
      <span class="seg" data-tabs><span class="on" data-tab="e404">404</span><span data-tab="private">Private</span></span>
      <span class="chip mono">error.hbs</span>
      <span class="helper">Ghost serves this for any 404 and any server error. It ships on every project.</span></div>
    <div data-panel="e404">
      <div class="site" style="max-width:880px"><div class="stack gap16" style="padding:64px 32px;align-items:center;text-align:center">
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none" stroke="#232019" stroke-width="1.5">
          <path d="M18 70l24-44 24 44z"/><path d="M42 40v14M42 60v2"/>
          <circle cx="92" cy="42" r="14" fill="#FFEDE8" stroke="#FF5941"/><path d="M86 42h12" stroke="#FF5941"/></svg>
        <span style="font-family:var(--serif);font-size:30px" data-editable>That page has moved on.</span>
        <span class="ow-dek" style="max-width:420px" data-editable>Nothing here at this address. The archive is
          still where you left it, and the search box below usually finds what you were after.</span>
        <div class="row gap10"><span class="ow-sub">Back to Orbit Weekly</span>
          <span class="ow-meta">Search the archive</span></div></div></div></div>
    <div data-panel="private" hidden>
      <div class="card" style="max-width:560px;margin:40px auto"><div class="pad stack gap12">
        <div class="row gap8"><span class="chip mono">private.hbs</span><span class="badge neutral">not shipping</span></div>
        <b style="font-size:15px">This template ships when you design a Private Site Gate.</b>
        <p style="font-size:13.5px;line-height:1.55">Ghost serves it when the whole site is set to private in
          Ghost Admin — a single password screen in front of everything. Design one and it starts shipping;
          leave it and Ghost uses its own.</p>
        <a class="btn secondary" href="section-picker.html" style="align-self:flex-start">Add a Private Site Gate</a></div></div></div>
  </div>
  <div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">404 page</b><span class="chip mono" style="margin-left:auto">2 / 6</span></div>
    <div class="ctlgroup"><span class="panel-label">Design</span>
      <div class="dstrip">""" + ''.join(
        f'<button class="dthumb{" on" if i == 1 else ""}" style="cursor:pointer"></button>' for i in range(6))
    + """</div><span class="helper">Illustrated Apology — a line drawing and one way back</span></div>
    <label class="ctlgroup"><span class="control-label">Heading</span>
      <input class="input" value="That page has moved on."></label>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle on"></span>
      <span class="control-label grow">Show search</span></label></div>
    <div class="ctlgroup"><label class="row gap10" style="cursor:pointer"><span class="toggle"></span>
      <span class="control-label grow">Show recent posts</span></label></div>
    <div class="ctlgroup"><span class="control-label">Background role</span>
      <span class="seg"><span class="on">Base</span><span>Surface</span><span>Contrast</span></span></div>
  </div></div></div>""")


page('theme-settings', 'Theme settings', f"""<div class="ed">{edbar(template='Theme settings')}
  <div class="edmid">
  <div class="layers"><div class="list">
    <a class="row gap8" href="editor.html" style="padding:8px;color:var(--ink-soft);font-size:12px">← Back to Home</a>
    <span class="panel-label" style="padding:6px 8px">SETTINGS</span>
    <div class="lrow on"><span class="grow">Site basics</span></div>
    <div class="lrow"><span class="grow">Navigation</span></div>
    <div class="lrow"><span class="grow">Social accounts</span></div>
    <a class="lrow" href="translations.html"><span class="grow">Translations</span></a>
    <a class="lrow" href="editor-cards.html"><span class="grow">Editor cards</span></a>
    <div class="lrow"><span class="grow">Code injection</span></div>
  </div></div>
  <div class="canvasmat" style="background:var(--paper)">
    <div style="max-width:820px;margin:0 auto" class="stack gap16">
      <div class="card"><div class="pad stack gap12">
        <span class="panel-label">Posts per page</span>
        <div class="row gap12"><span class="stepper"><span>−</span><span class="v">12</span><span>+</span></span>
          <span class="helper" style="max-width:420px">How many posts your archives show before paginating.
            <b>Your theme owns this — Ghost has no setting for it</b>, which is why every surface in the product
            that mentions posts per page links here and never into Ghost Admin.</span></div></div></div>
      <div class="card"><div class="pad stack gap14">
        <span class="panel-label">Site basics</span>
        <span class="helper">Ghost owns the title, the logo and the accent — we read them and never write them.</span>
        <div class="row gap12"><span class="control-label" style="width:110px">Site title</span>
          <span class="input greyed" style="max-width:280px;display:flex;align-items:center;color:var(--ink-faint)">🔒 Orbit Weekly</span>
          <a class="small" href="#">Change this in Ghost ↗</a></div>
        <div class="row gap12"><span class="control-label" style="width:110px">Logo</span>
          <span class="row gap8"><span class="chip mono">orbit-wordmark.svg</span><span class="helper">SVG · 4 KB</span></span>
          <a class="small" href="#">Change this in Ghost ↗</a></div>
        <div class="row gap12"><span class="control-label" style="width:110px">Accent colour</span>
          <span class="row gap8"><span class="sw" style="background:#D96C3F"></span><span class="small">Burnt orange</span>
            <span class="chip">from Ghost</span></span></div></div></div>
      <div class="card"><div class="pad stack gap12">
        <span class="panel-label">This project</span>
        <div class="row gap12"><span class="control-label" style="width:110px">Colour scheme</span>
          <span class="seg"><span>Light only</span><span class="on">Light + Dark</span></span>
          <span class="helper" style="max-width:340px">Every Style Pack ships a hand-paired dark palette, so
            dark is already paid for.</span></div>
        <div class="row gap12" style="padding-top:8px;border-top:1px solid var(--line-faint)">
          <span class="control-label" style="width:110px">Clear dark overrides</span>
          <span class="row gap8"><span class="badge neutral" title="Dark override">🌙 Dark override</span>
            <span class="small">3 sections carry a dark override</span></span>
          <button class="btn sm secondary" style="margin-left:auto" data-close>Clear them</button></div></div></div>
      <div class="card"><div class="pad stack gap12">
        <span class="panel-label">Credits</span>
        <label class="row gap12" style="cursor:pointer"><span class="toggle on"></span>
          <span class="stack gap2 grow"><b style="font-size:13px">Show &ldquo;Built with Inflozo&rdquo;</b>
            <span class="helper">Appears in two places: the theme footer, and the README inside the exported zip.</span></span></label></div></div>
      <div class="card"><div class="pad stack gap14">
        <div class="row gap10"><span class="panel-label grow">Custom settings</span><span class="chip mono">3 OF 17</span></div>
        <span class="helper">Ghost allows twenty custom settings per theme. <b>Three of them are the dark-mode
          built-ins every Inflozo project declares</b>, so seventeen are yours. Promoted controls appear under
          Design in Ghost admin after your next deploy.</span>
        <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13px">Show reader count</b>
            <span class="helper">Home hero · Split Form</span></div>
          <span class="chip mono">show_reader_count</span><span class="badge neutral">boolean</span></div>
        <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13px">Posts on the home feed</b>
            <span class="helper">Latest issues · Count</span></div>
          <span class="chip mono">home_post_count</span><span class="badge neutral">select</span></div>
        <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13px">Announcement text</b>
            <span class="helper">Site-wide · Announcement</span></div>
          <span class="chip mono">announcement_text</span><span class="badge neutral">text</span></div>
        <div style="height:1px;background:var(--line-faint)"></div>
        <span class="panel-label">Promote a control</span>
        <div class="grid g2 gap12">
          <label class="field"><span class="control-label">Which control</span>
            <select class="input"><option>Post template · Measure</option><option>Home hero · Height</option></select></label>
          <label class="field"><span class="control-label">Label in Ghost</span>
            <input class="input" value="Article width"></label>
          <label class="field"><span class="control-label">Group in Ghost</span>
            <select class="input"><option>Site wide</option><option>Homepage</option><option>Post</option></select></label>
          <div class="field"><span class="control-label">Key</span>
            <span class="input mono greyed" style="display:flex;align-items:center;color:var(--ink-faint)">article_width</span></div></div>
        <div class="banner notice"><span class="ico">!</span><span><b>Keys freeze once you deploy or export</b> —
          pick them like you mean it. And promoting your accent means switching Style Packs changes what that
          Ghost setting points at.</span></div>
        <button class="btn coral sm" style="align-self:flex-start" data-open="promote-text">Promote</button></div></div>
    </div></div></div></div>
<div class="overlay sheet-wrap" id="promote-text"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Promote &ldquo;Announcement text&rdquo;?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Ghost&rsquo;s own settings are plain text, so
    <b>bold, italic, underline and links will be removed from this field while it stays promoted.</b>
    The words are kept.</p></div>
  <div class="foot"><button class="btn secondary" data-close autofocus>Cancel</button>
    <button class="btn coral" data-close>Promote it</button></div></div></div>""")

page('translations', 'Translations', f"""<div class="ed">{edbar(template='Translations')}
  <div class="edmid"><div class="canvasmat" style="background:var(--paper)">
    <div class="card" style="max-width:880px;margin:0 auto"><div class="pad stack gap14">
      <div class="row gap12"><a href="theme-settings.html">←</a><h2 style="font-size:20px">Translations</h2>
        <span class="seg" style="margin-left:auto"><span class="on">Español · es</span><span>+ Add a locale</span></span></div>
      <p class="softaa" style="font-size:13px">Every string your theme prints. English is the default;
        overrides ship in <span class="mono">locales/</span>.</p>
      <table class="limits">
        <tr><th>Key</th><th>English default</th><th>Español</th></tr>""" + ''.join(
        f'<tr><td class="mono" style="font-size:12px">{k}</td><td>{e}</td>'
        f'<td><input class="input" value="{s}" style="height:30px;font-size:12.5px"></td></tr>'
        for k, e, s in [('member.signup_cta', 'Subscribe', 'Suscribirse'),
                        ('member.signin', 'Sign in', 'Iniciar sesión'),
                        ('post.read_more', 'Read more', 'Seguir leyendo'),
                        ('post.reading_time', '{n} min read', '{n} min de lectura'),
                        ('paywall.members_only', 'The rest is for members', 'El resto es para miembros'),
                        ('archive.empty_heading', 'Nothing here yet', 'Todavía nada')])
    + """<tr><td class="mono" style="font-size:12px">newsletter.note</td>
        <td>No spam. Unsubscribe any time.</td>
        <td><input class="input" placeholder="Falls back to English" style="height:30px;font-size:12.5px"></td></tr>
      </table>
      <p class="helper">Keys are <b>dotted <span class="mono">namespace.name</span></b>, not flat words.
        Untranslated rows say <i>Falls back to English</i> rather than sitting empty, so an incomplete
        catalogue reads as safe rather than broken. Interpolation tokens like <span class="mono">{n}</span>
        survive into the translation and are shown, because a translator who deletes one breaks the string.</p>
      <div class="banner notice"><span class="ico">!</span><span><b>Right-to-left languages are not supported yet.</b>
        Our designs are built left-to-right. Arabic, Hebrew and Farsi strings will translate, but the layouts
        will not mirror — so we do not offer those locales rather than shipping something broken.
        <b>You will see this again on the pre-flight check before you deploy.</b></span></div>
      <div class="banner error" id="brace-error" hidden><span class="ico">✕</span>
        <span><b>That token is missing its closing brace.</b> <span class="mono">{n</span> would break every
          page that prints reading time — Ghost returns a 500 for the whole site, not just this string.
          Write <span class="mono">{n}</span>, or remove it.</span></div>
    </div></div></div></div></div>""", script="""
document.addEventListener('input', function (e) {
  if (e.target.tagName !== 'INPUT') return;
  var v = e.target.value, bad = (v.match(/{/g) || []).length !== (v.match(/}/g) || []).length;
  e.target.style.borderColor = bad ? 'var(--danger)' : '';
  document.getElementById('brace-error').hidden = !bad;
});""")


page('routes-manager', 'Routes & Templates', f"""<div class="ed">{edbar(template='Routes')}
  <div class="edmid"><div class="canvasmat" style="background:var(--paper);padding:0">
    <div class="row" style="height:100%;align-items:stretch">
      <div class="grow stack gap16" style="padding:24px;overflow:auto">
        <div class="row gap12"><a href="editor.html">←</a><h2 style="font-size:18px">Routes &amp; Templates</h2>
          <span class="chip">Orbit Weekly</span></div>
        <div class="stack gap8"><span class="panel-label">Collections</span>
          <p class="helper">Your homepage is a template built from sections — it lists posts only if you add a
            posts section. Collections are dedicated post listings, like Articles.</p>
          <div class="itemrow"><span class="chip mono">/articles/</span><div class="stack gap2 grow">
              <b style="font-size:13px">Articles</b>
              <span class="helper">All posts, in one place · <span class="mono">type:post</span></span></div>
            <span class="badge neutral">Articles</span><span class="chip mono">12 / page</span></div>
          <div class="itemrow"><span class="chip mono">/tutorials/</span><div class="stack gap2 grow">
              <b style="font-size:13px">Tutorials</b>
              <span class="helper">Guides &amp; how-tos · <span class="mono">tag:tutorials</span></span></div>
            <span class="badge neutral">Post Grid</span><span class="chip mono">10 / page</span></div>
          <div class="itemrow"><span class="chip mono">/notes/</span><div class="stack gap2 grow">
              <b style="font-size:13px">Notes</b>
              <span class="helper">Short posts, no images · <span class="mono">tag:notes</span></span></div>
            <span class="badge neutral">Minimal List</span><span class="chip mono">20 / page</span></div>
          <button class="btn dashed sm" data-open="new-collection" style="align-self:flex-start">+ New collection</button>
          <p class="helper">A post lives in the first collection it matches — drag to reorder if posts land in
            the wrong place.</p></div>
        <div class="stack gap8"><span class="panel-label">Custom routes</span>
          <div class="itemrow"><span class="chip mono">/reading-list/</span><div class="stack gap2 grow">
              <b style="font-size:13px">Reading List</b>
              <span class="helper">A channel — a filtered stream with its own RSS</span></div></div>
          <button class="btn dashed sm" data-open="new-route" style="align-self:flex-start">+ Custom route</button></div>
        <div class="stack gap8"><span class="panel-label">Taxonomies</span>
          <div class="itemrow"><b style="font-size:13px" class="grow">Tags</b>
            <span class="chip mono">/topic/{{slug}}/</span><span class="badge neutral">Tag template</span></div>
          <div class="itemrow"><b style="font-size:13px" class="grow">Authors</b>
            <span class="chip mono">/writer/{{slug}}/</span><span class="badge neutral">Author template</span></div></div>
      </div>
      <div style="width:420px;border-left:1px solid var(--line);background:var(--paper-sunk);padding:20px;overflow:auto"
        class="stack gap10">
        <div class="row gap8"><span class="panel-label grow">routes.yaml</span>
          <span class="badge live" id="yaml-ok">Valid</span>
          <span class="badge danger" id="yaml-bad" hidden>1 error</span></div>
        <span class="helper">generated live, ships with every deploy</span>
        <pre class="mono" style="font-size:12px;line-height:1.7;background:var(--surface);border:1px solid var(--line);
          border-radius:8px;padding:14px;margin:0;overflow:auto">collections:
  /articles/:
    permalink: /articles/{{slug}}/
    template: articles
    filter: type:post
  /tutorials/:
    permalink: /tutorials/{{slug}}/
    template: post-grid
    filter: tag:tutorials
    limit: 10
  /notes/:
    permalink: /notes/{{slug}}/
    template: minimal-list
    filter: tag:notes
    limit: 20

routes:
  /reading-list/:
    controller: channel
    filter: tag:reading

taxonomies:
  tag: /topic/{{slug}}/
  author: /writer/{{slug}}/</pre>
        <span class="helper">Ghost will accept this routing.</span>
        <button class="btn sm ghost" id="break-it">Show me what an error looks like</button>
      </div></div></div></div></div>
<div class="overlay sheet-wrap" id="new-collection"><div class="sheet"><div class="head">
    <h2 style="font-size:20px">New collection.</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">A section of your site with its own URL and layout.</p></div>
  <div class="body">
    <label class="field"><span class="control-label">Path</span>
      <input class="input mono" value="/travel/" aria-label="Path"></label>
    <div class="stack gap8"><div class="row gap10"><span class="control-label">Show posts that match</span>
        <span class="seg" style="margin-left:auto"><span class="on">All conditions</span><span>Any</span></span></div>
      <div class="row gap8"><select class="input" style="max-width:130px"><option>Tag</option><option>Author</option>
          <option>Primary tag</option><option>Featured</option><option>Visibility</option>
          <option>Published date</option><option>Has feature image</option></select>
        <select class="input" style="max-width:120px"><option>is any of</option><option>is not</option></select>
        <span class="row gap6 grow"><span class="chip">Travel</span><span class="chip">Trains</span>
          <span class="helper">add…</span></span></div>
      <div class="row gap8"><select class="input" style="max-width:130px"><option>Published date</option></select>
        <select class="input" style="max-width:120px"><option>after</option></select>
        <input class="input mono" style="max-width:180px" value="now-30d">
        <span class="helper">or an exact date</span></div></div>
    <div class="row gap12"><span class="control-label" style="width:130px">Template</span>
      <select class="input" style="max-width:220px"><option>Post Grid</option><option>Minimal List</option></select></div>
    <div class="row gap12"><span class="control-label" style="width:130px">Posts per page</span>
      <span class="stepper"><span>−</span><span class="v">12</span><span>+</span></span>
      <span class="helper">Follows <a href="theme-settings.html">Theme settings</a>. Change it here to override
        it for this route only.</span></div></div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button>
    <button class="btn coral" data-close>Create collection</button></div></div></div>
<div class="overlay sheet-wrap" id="new-route"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:20px">New route.</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">A URL on your site that shows exactly what you choose.</p></div>
  <div class="body"><label class="field"><span class="control-label">Path</span>
      <input class="input mono" value="/reading-list/" aria-label="Path"></label>
    <div class="stack gap8"><span class="control-label">What should it show?</span>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">One of your templates</span>
        <span class="c">A designed page — like your Reading List template.</span></span></label>
      <label class="radiocard on"><span class="radio on"></span><span class="stack">
        <span class="t">A channel — a filtered stream of posts</span>
        <span class="c">Like a saved search with its own page and RSS feed. Posts keep their normal URLs.</span></span></label></div></div>
  <div class="foot"><button class="btn secondary" data-close>Cancel</button>
    <button class="btn coral" data-close>Create route</button></div></div></div>""", script="""
document.getElementById('break-it').addEventListener('click', function () {
  var pre = document.querySelector('pre');
  pre.innerHTML = pre.innerHTML.replace('filter: tag:tutorials',
    '<span style="background:var(--danger-tint)">filter: tag=tutorials</span>');
  document.getElementById('yaml-ok').hidden = true;
  document.getElementById('yaml-bad').hidden = false;
  var b = document.createElement('div');
  b.className = 'banner error';
  b.innerHTML = '<span class="ico">✕</span><span><b>Line 9</b> — filters use a colon: did you mean '
    + '<span class="mono">tag:tutorials</span>? Deploys are blocked until routing is valid, and the Ship '
    + 'button says so.</span>';
  pre.parentNode.insertBefore(b, pre);
  document.querySelector('[data-ship]').classList.add('off');
  this.remove();
});""")


SIX = ['Destination', 'Safety net', 'Backup', 'Check', 'Ship', 'Live']


def wizrail(steps):
    out = []
    for i, s in enumerate(steps, 1):
        out.append(f'<span class="rstep" data-rail-step="{i}"><span class="n">{i}</span>{s}</span>')
    return '<div class="rail-steps">' + '<span class="rsep"></span>'.join(out) + '</div>'


def backup_rows():
    out = ''
    for name, mark, warn in BACKUP_ROWS:
        m = f'<span class="badge notice">{mark}</span>' if mark else ''
        out += (f'<label class="checkrow" data-backup-row style="cursor:pointer">'
                f'<span class="check"></span>'
                f'<span class="stack gap2 grow"><span class="row gap8"><b>{name}</b>{m}</span>'
                f'<span class="helper">{warn}</span>'
                f'<span class="helper">Find it in Ghost Admin under your version&rsquo;s export screens — '
                f'<a href="#" onclick="event.preventDefault()">show me where for Ghost 6.58 ↗</a></span></span></label>')
    return out


DEPLOY_BODY = f"""<div style="min-height:100vh;background:var(--paper);display:flex;flex-direction:column"
  data-wizard data-at="1">
  <div class="row gap12" style="padding:14px 24px;border-bottom:1px solid var(--line);background:var(--surface)">
    <a href="editor.html">←</a><b style="font-size:14px">Orbit Weekly</b>
    <span class="chip" style="margin-left:auto">First deploy to orbitweekly.com</span></div>
  {wizrail(SIX)}
  <div class="wizbody">

  <div data-step="1"><div class="wizcard"><div class="stack gap16">
    <h2 style="font-size:20px">Where is this going?</h2>
    <div class="itemrow"><span class="avatar" style="background:#3B382F">O</span>
      <div class="stack gap2 grow"><b style="font-size:14px">Orbit Weekly</b>
        <span class="helper mono">orbitweekly.com</span></div>
      <span class="badge live"><span class="dot mint"></span>Connected</span>
      <a class="btn sm secondary" href="sites.html">Switch</a></div>
    <div class="stack gap10">
      <label class="radiocard on"><span class="radio on"></span><span class="stack">
        <span class="t">Deploy &amp; activate</span>
        <span class="c">v5 goes live the moment it&rsquo;s done.</span></span></label>
      <label class="radiocard"><span class="radio"></span><span class="stack">
        <span class="t">Deploy only</span>
        <span class="c">Upload v5, keep v4 active for now.</span></span></label></div>
    <div class="stack gap6" style="padding-top:12px;border-top:1px solid var(--line-faint)">
      <span class="control-label">The theme we will create</span>
      <span class="chip mono" style="align-self:flex-start;padding:6px 10px">inflozo-orbit-weekly</span>
      <span class="helper">This name is permanent for orbitweekly.com. Renaming the project later changes its
        name in Inflozo only.</span></div>
    <div class="row gap8"><span class="chip mono">v4 → v5</span></div>
    <div class="wizfoot"><a class="btn secondary" href="editor.html">Back</a>
      <button class="btn coral" data-goto="2">Next — safety net</button></div></div></div></div>

  <div data-step="2" hidden><div class="wizcard"><div class="row" style="align-items:flex-start;gap:28px">
    <div class="stack gap14 grow">
      <h2 style="font-size:20px">One more step unlocks a safety net</h2>
      <p style="font-size:14px;line-height:1.6">A copy of your current theme before we replace it, plus a check
        that nothing else has changed it.</p>
      <p class="softaa" style="font-size:13px;line-height:1.6">This is a <b>Staff Access Token</b>. It is a
        full-Administrator credential, and it can only be created on the site Owner&rsquo;s own account.
        We are saying so plainly rather than softening it.</p>
      <label class="field"><span class="control-label">Staff Access Token</span>
        <input class="input mono" placeholder="paste it here" aria-label="Staff Access Token"></label>
      <div class="wizfoot"><button class="btn" data-goto="3">Add the token</button>
        <button class="btn secondary" data-goto="21">Not now</button></div>
      <span class="helper">Both buttons are plain, and the same weight. &ldquo;Not now&rdquo; is not a link in
        small type.</span></div>
    <div class="thumb" style="width:280px;height:200px;display:flex;align-items:center;justify-content:center;
      padding:16px;flex-shrink:0"><span class="helper" style="text-align:center">Ghost Admin → your own profile
      → Staff Access Token</span></div></div></div></div>

  <div data-step="21" hidden><div class="wizcard"><div class="stack gap14">
    <h2 style="font-size:20px">Fine — shipping without it.</h2>
    <p style="font-size:13.5px;line-height:1.6">Here is exactly what that costs, once, so you know what you are
      choosing:</p>
    <div class="stack gap10">
      <div class="checkrow"><span style="color:var(--ink-soft)">○</span>
        <span><b>No copy of your current theme</b> before we replace it.</span></div>
      <div class="checkrow"><span style="color:var(--ink-soft)">○</span>
        <span><b>No check that the live theme changed</b> since we last shipped.</span></div>
      <div class="checkrow"><span style="color:var(--ink-soft)">○</span>
        <span><b><span class="mono">routes.yaml</span> uploads by hand</b>, with a guided card that walks you
          through it.</span></div></div>
    <p style="font-size:13.5px">You can add it any time from <a href="manage-keys.html">Manage keys</a>.</p>
    <div class="wizfoot"><button class="btn coral" data-goto="3">Continue</button></div>
    <span class="helper">Said once. It is never raised again for this project.</span></div></div></div>

  <div data-step="3" hidden><div class="wizcard wide"><div class="stack gap16">
    <h2 style="font-size:20px">Before we replace your theme</h2>
    <div style="border:1px solid var(--line-strong);border-radius:var(--r);padding:16px;background:var(--paper-raised)">
      <p style="font-size:14px;line-height:1.6"><b>Inflozo writes exactly two things to your Ghost site: your
        theme, and <span class="mono">routes.yaml</span>.</b> It never writes posts, pages, members, tags,
        settings or redirects.</p></div>
    <p style="font-size:13.5px;line-height:1.6">A full backup is still the right thing, and here is the reason
      rather than the instruction: a theme change is reversible only if you can put the old theme back, and the
      cheapest insurance against every other surprise is the backup you already have.</p>
    <label style="background:var(--mint-tint);border-radius:var(--r);padding:14px;display:block;cursor:pointer">
      <span class="checkrow" style="border:none"><span class="check" data-shortcut></span>
        <span class="stack gap4 grow"><b>I have run <span class="mono">ghost backup</span> and saved the archive
          somewhere off the server.</b>
        <span class="helper">One archive: content, members, every installed theme, images, files, media, routes
          and redirects. Ticking this checks every row below — <b>and the rows stay visible</b>, so you can see
          what you now hold.</span></span></span></label>
    <div class="stack">{backup_rows()}</div>
    <div style="height:1px;background:var(--line-strong)"></div>
    <label class="checkrow" style="border:none;cursor:pointer"><span class="check" data-master></span>
      <span><b>I confirm I have a complete backup of my site and understand Inflozo will replace my theme.</b></span></label>
    <div class="wizfoot"><button class="btn secondary" data-goto="2">Back</button>
      <button class="btn coral off" data-gate-go data-goto="4">Continue to checks</button>
      <span class="reason" data-gate-reason></span></div></div></div></div>

  <div data-step="4" hidden><div class="wizcard wide"><div class="stack gap14">
    <h2 style="font-size:20px">Pre-flight check.</h2>
    <p class="softaa" style="font-size:13px">We compile and test everything before it touches your site.</p>
    <div class="stack">
      <div class="checkrow"><span class="tick">✓</span><span class="grow"><b>Theme compiled</b></span>
        <span class="chip mono">1.4s · 2.4 MB</span></div>
      <div class="checkrow"><span class="tick">✓</span>
        <span class="grow"><b>Checking your theme (Ghost will love it)</b></span>
        <span class="chip mono">0 · 2</span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow">Ghost 6.x compatible</span>
        <span class="helper">pass</span></div>
      <div class="checkrow"><span class="tick">✓</span>
        <span class="grow">Required templates present (index, post, page)</span><span class="helper">pass</span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow">No deprecated helpers</span>
        <span class="helper">pass</span></div>
      <div class="checkrow"><span class="tick">✓</span>
        <span class="grow"><span class="mono">routes.yaml</span> is valid</span><span class="helper">pass</span></div>
      <div class="checkrow"><span style="color:var(--marigold-text)">!</span>
        <span class="stack gap2 grow"><b>hero.jpg is 2.1 MB</b>
          <span class="helper">Big images slow readers down. We&rsquo;ll convert it to WebP on upload — about 240 KB.</span></span></div>
      <div class="checkrow"><span style="color:var(--marigold-text)">!</span>
        <span class="stack gap2 grow"><b>Footer has no navigation links yet</b></span>
        <a class="btn sm secondary" href="editor.html">Fix in editor</a></div>
      <div class="checkrow"><span style="color:var(--marigold-text)">!</span>
        <span class="stack gap2 grow"><b>Your Spanish locale ships, and the layouts do not mirror</b>
          <span class="helper">Right-to-left languages are not supported yet — the pre-deploy repeat of the
            notice in Translations, said here because this is where it bites.</span></span></div>
    </div>
    <p class="helper">Warnings won&rsquo;t block your deploy.</p>
    <div class="wizfoot"><button class="btn secondary" data-goto="3">Back</button>
      <button class="btn coral" data-run="6" data-goto-first="5" data-run-host="ship">Ship it</button>
      <button class="btn ghost" data-goto="30">What if something changed on my site?</button></div></div></div></div>

  <div data-step="5" hidden id="ship"><div class="wizcard"><div class="stack gap16">
    <h2 style="font-size:20px">Shipping v5…</h2>
    <p class="softaa" style="font-size:13px">Usually under a minute. You can keep editing — we&rsquo;ll ping you.</p>
    <div class="stack">
      <div class="checkrow pending" data-progress-step="Archiving your current theme">
        <span class="dot grey" data-dot></span>
        <span class="stack gap2 grow"><b>Archiving your current theme</b>
          <span class="helper">Kept outside your version limit. It happens once — at our first upload to this site.</span>
          <span class="progress" style="width:200px"><span class="bar"></span></span></span>
        <span class="chip mono">casper 5.9.4</span></div>
      <div class="checkrow pending" data-progress-step="Compiling">
        <span class="dot grey" data-dot></span><span class="grow">Compiling</span>
        <span class="progress" style="width:160px"><span class="bar"></span></span></div>
      <div class="checkrow pending" data-progress-step="Uploading to Ghost">
        <span class="dot grey" data-dot></span><span class="grow">Uploading to Ghost</span>
        <span class="progress" style="width:160px"><span class="bar"></span></span></div>
      <div class="checkrow pending" data-progress-step="Activating v5">
        <span class="dot grey" data-dot></span><span class="grow">Activating v5</span>
        <span class="progress" style="width:160px"><span class="bar"></span></span></div>
    </div>
    <div class="wizfoot"><a class="btn secondary" href="editor.html">Cancel</a>
      <button class="btn ghost" data-goto="31">Simulate: no Staff Access Token</button>
      <button class="btn ghost" data-goto="32">Simulate: upload fails</button></div></div></div></div>

  <div data-step="6" hidden><div class="wizcard"><div class="stack gap16" style="align-items:center;text-align:center">
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" stroke="#1FA97A" stroke-width="2">
      <circle cx="60" cy="40" r="26"/><polyline points="48 41 57 50 74 31" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 18l6 6M102 18l-6 6M14 56l8 2M106 56l-8 2" stroke="#FFB100"/></svg>
    <h2 style="font-size:28px">Live! Your site just got gorgeous.</h2>
    <div class="row gap10"><span class="chip mono">v5</span><span class="chip mono">0 errors · 0 warnings</span>
      <span class="chip mono">38s</span></div>
    <div class="row gap10"><a class="btn coral lg" href="#" onclick="event.preventDefault()">View site</a>
      <a class="btn secondary lg" href="editor.html">Done</a></div></div></div>
    <div class="card" style="max-width:720px;margin-top:16px"><div class="pad row gap14" style="align-items:flex-start">
      <span style="font-size:18px">📌</span>
      <div class="stack gap6 grow"><b style="font-size:14px">One step left</b>
        <span class="helper">Three templates shipped that a Ghost page still has to point at. It takes a minute,
          and it happens in Ghost rather than here.</span></div>
      <a class="btn secondary" href="binding-checklist.html">Open the checklist</a></div></div></div>

  <div data-step="30" hidden><div class="wizcard wide"><div class="stack gap16">
    <h2 style="font-size:20px">Something changed on your site since we last shipped.</h2>
    <p style="font-size:13.5px;line-height:1.6">We compare what&rsquo;s live against what we put there. These
      files are different — someone edited the theme in Ghost, or another tool did.</p>
    <div class="stack gap10">
      <span class="panel-label">Changed</span>
      <div class="itemrow"><span class="lthumb"></span><div class="stack gap2 grow">
          <b style="font-size:13px">Home hero</b>
          <span class="helper mono">partials/section-home-hero.hbs</span></div></div>
      <div class="itemrow"><span class="lthumb"></span><div class="stack gap2 grow">
          <b style="font-size:13px">Three Column footer</b>
          <span class="helper mono">partials/section-footer-three-column.hbs</span></div></div>
      <span class="panel-label">Added</span>
      <div class="itemrow"><span class="lthumb"></span><div class="stack gap2 grow">
          <b style="font-size:13px">A file we did not ship</b>
          <span class="helper mono">assets/custom-tweaks.css</span></div></div></div>
    <div class="wizfoot"><a class="btn secondary" href="deploy-history.html">Download the live theme first</a>
      <button class="btn" data-run="6" data-goto-first="5" data-run-host="ship">Overwrite and ship anyway</button>
      <a class="btn ghost" href="editor.html">Cancel</a></div>
    <span class="helper">The destructive action is ink, not danger — this is a deliberate choice, not an
      accident. The safe one is offered first. A layer RENAME produces no drift at all, so the list never
      shows one.</span></div></div></div>

  <div data-step="31" hidden><div class="wizcard"><div class="stack gap14">
    <h2 style="font-size:19px">We could not archive your current theme</h2>
    <p style="font-size:13.5px;line-height:1.6"><b>Reading your live theme needs the site Owner&rsquo;s Staff
      Access Token, and this project doesn&rsquo;t have one.</b> That&rsquo;s how Ghost works on every version
      and every host — there&rsquo;s no permission to switch on.</p>
    <div class="banner info"><span class="ico">ⓘ</span><span>Ghost keeps your previous theme under
      <b>Settings → Design</b>, so you can put it back yourself if you need to.</span></div>
    <div class="wizfoot"><button class="btn" data-goto="2">Add the token</button>
      <button class="btn secondary" data-run="6" data-goto-first="5" data-run-host="ship">Deploy without a snapshot</button>
      <a class="btn ghost" href="editor.html">Cancel</a></div></div></div></div>

  <div data-step="32" hidden><div class="wizcard"><div class="stack gap16">
    <div class="row gap10"><h2 style="font-size:20px">Uploading to Ghost failed</h2>
      <span class="chip mono">at 1.1 MB</span></div>
    <div class="banner error"><span class="ico">✕</span><span><b>Ghost said no — your Admin key expired.</b>
      Your theme compiled clean — we just couldn&rsquo;t sign in to Ghost Admin. Reconnect the site and
      we&rsquo;ll pick up right here.</span></div>
    <div class="wizfoot"><a class="btn secondary" href="editor.html">Close</a>
      <a class="btn danger" href="manage-keys.html">Reconnect site</a>
      <button class="btn ghost" data-goto="33">Show the partial-success ending instead</button></div></div></div></div>

  <div data-step="33" hidden><div class="wizcard"><div class="stack gap16">
    <h2 style="font-size:22px">Your theme is on your site but isn&rsquo;t live yet.</h2>
    <div class="banner info"><span class="ico">ⓘ</span><span><b>v5 uploaded cleanly. Ghost didn&rsquo;t switch
      to it</b>, so orbitweekly.com is still serving v4 — nothing on your site changed.</span></div>
    <div class="row gap10"><span class="chip mono">v5</span><span class="badge sky">Uploaded, not live</span></div>
    <div class="wizfoot"><button class="btn coral" data-goto="6">Re-activate v5</button>
      <a class="btn secondary" href="editor.html">Leave it for now</a></div>
    <span class="helper">No confetti — the one confetti moment is the first deploy that makes the site live, and
      this one did not. <b>No deploy-failure email is sent either</b>: nothing failed.</span></div></div></div>

  </div>
</div>
<div class="overlay sheet-wrap" id="pro-exit"><div class="sheet wide"><div class="head">
    <div class="row gap10"><span class="badge pro">✦</span>
      <h2 style="font-size:22px">Four Pro designs are in this site</h2></div>
    <p style="font-size:13.5px;line-height:1.6;margin-top:8px">You can swap each one for a Free design and ship
      today, or go Pro and keep them exactly as they are. <b>Nothing is deleted either way.</b></p></div>
  <div class="body">
    <div class="row gap8"><span class="panel-label grow">In use</span><span class="chip mono">4 of 26 sections</span></div>
    <div class="itemrow"><span class="badge pro">✦ PRO</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Collage Grid</b><span class="helper">Home · hero</span></div>
      <button class="btn sm secondary swap">Swap</button><button class="btn sm ghost">Remove it</button></div>
    <div class="itemrow"><span class="badge pro">✦ PRO</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Magazine Split</b><span class="helper">Home · post feed</span></div>
      <button class="btn sm secondary swap">Swap</button><button class="btn sm ghost">Remove it</button></div>
    <div class="itemrow"><span class="badge pro">✦ PRO</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Ticker Marquee</b>
        <span class="helper">Site-wide · announcement</span></div>
      <button class="btn sm secondary swap">Swap</button><button class="btn sm ghost">Remove it</button></div>
    <div class="itemrow"><span class="badge pro">✦ PRO</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Contrast Band — card treatment</b>
        <span class="helper">Chosen, not placed. Reverts on <a href="editor-cards.html">Editor cards</a>.</span></div>
      <a class="btn sm secondary" href="editor-cards.html">Revert to the free one</a></div>
    <p class="helper">Each swap keeps your text and images — only the arrangement changes. <b>Swapping goes
      through Shuffle</b>, which offers any free design in that category&rsquo;s ring, so there is no per-design
      pairing table and nothing to author.</p></div>
  <div class="foot"><div class="stack gap2 grow"><b style="font-size:15px">$15 a month, every design</b>
      <span class="helper">Cancel any time. Your site keeps working on Free with the swaps applied.</span></div>
    <button class="btn secondary" data-close>Swap and ship free</button>
    <a class="btn marigold" href="upgrade.html">Go Pro and ship</a></div></div></div>
<div class="overlay sheet-wrap" id="lib-update"><div class="sheet"><div class="head">
    <h2 style="font-size:22px">Three designs have updates</h2>
    <p style="font-size:13.5px;line-height:1.6;margin-top:8px">Your settings are kept. These are fixes to the
      designs themselves, so the shapes may shift slightly.</p></div>
  <div class="body">
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Split Form</b>
        <span class="helper">Form no longer overflows at 390 when the button label is long</span></div>
      <span class="chip mono">v3 → v4</span></div>
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Grid of Three</b>
        <span class="helper">Cards keep equal height when one post has no excerpt</span></div>
      <span class="chip mono">v7 → v8</span></div>
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Three Column footer</b>
        <span class="helper">Focus ring visible on dark backgrounds</span></div>
      <span class="chip mono">v2 → v3</span></div>
    <div class="banner info"><span class="ico">ⓘ</span><span><b>The version you are on now stays in history and
      rolls back in one click.</b> Every successful compile is stored as an artifact.</span></div></div>
  <div class="foot"><b style="font-size:13px" class="grow">Nothing changes until you ship.</b>
    <a class="btn secondary" href="editor.html">Not now</a>
    <button class="btn coral" data-close>Update and ship</button></div></div></div>"""

page('deploy', 'Ship it', DEPLOY_BODY, script="""
var q = location.search;
if (q.indexOf('failed') > -1) window.gotoStep(32);
if (q.indexOf('updates') > -1) setTimeout(function () {
  document.getElementById('lib-update').classList.add('is-open');
}, 200);
if (q.indexOf('free') > -1) setTimeout(function () {
  document.getElementById('pro-exit').classList.add('is-open');
}, 200);
document.querySelectorAll('.swap').forEach(function (b) {
  b.addEventListener('click', function () {
    var row = b.closest('.itemrow');
    row.classList.add('done');
    row.querySelector('.badge').outerHTML = '<span class="badge live">SWAPPED</span>';
    b.outerHTML = '<button class="btn sm secondary">Undo</button>';
  });
});
""")


def hrow(v, when, changed, gscan, pinned=False, live=False):
    pin = (f'<button class="badge notice" style="border:none;cursor:pointer" data-pin>📌 Pinned</button>'
           if pinned else
           f'<button class="soft" style="border:none;background:none;cursor:pointer" data-pin '
           f'aria-label="Pin this version">📌</button>')
    lb = '<span class="badge live"><span class="dot mint"></span>Live</span>' if live else ''
    act = ('' if live else '<button class="btn sm secondary" data-open="rollback">Roll back</button>')
    return (f'<div class="itemrow{" done" if pinned else ""}"><span class="chip mono">{v}</span>{lb}'
            f'<div class="stack gap2 grow"><span class="helper">{when} · by Maya</span>'
            f'<span class="helper">{changed}</span></div>'
            f'<span class="chip mono">{gscan}</span>{pin}{act}</div>')


page('deploy-history', 'History', app('projects', f"""<div class="stack gap12" style="max-width:880px">
  <div class="row gap10"><a href="editor.html">←</a><h2 style="font-size:20px">History — Orbit Weekly</h2></div>
  <div class="itemrow" style="background:var(--paper-sunk)"><span style="font-size:16px">🗄️</span>
    <div class="stack gap2 grow"><b style="font-size:13.5px">Your original theme</b>
      <span class="helper">Archived 6 Aug, before our first upload</span></div>
    <span class="chip mono">casper 5.9.4</span>
    <button class="btn sm secondary" data-open="restore">Restore original</button></div>
  <p class="helper">Kept outside your version limit. Ghost checks every theme on the way in, so a very old theme
    can be refused — we&rsquo;ll offer the zip if that happens.</p>
  <div style="height:1px;background:var(--line-strong)"></div>
  {hrow('v5', 'Today · 2:14 PM', 'Changed: Hero, Footer · Pack: Paper → Tangerine', '0 · 0', live=True)}
  {hrow('v4', 'Aug 14 · 9:02 AM', 'Changed: Post Grid, Newsletter', '0 · 0', pinned=True)}
  {hrow('v3', 'Aug 10 · 6:40 PM', 'Changed: Header · added 404 template', '0 · 2')}
  <div class="itemrow"><span class="chip mono">v2b</span><span class="badge sky">Uploaded, not live</span>
    <div class="stack gap2 grow"><span class="helper">Aug 8 · 4:12 PM · by Maya</span>
      <span class="helper">Your theme is on your site but isn&rsquo;t live yet.</span></div>
    <span class="chip mono">0 · 0</span>
    <button class="soft" style="border:none;background:none;cursor:pointer" data-pin>📌</button>
    <a class="btn sm coral" href="deploy.html">Re-activate</a></div>
  {hrow('v2', 'Aug 6 · 11:18 AM', 'Changed: Hero', '0 · 0', pinned=True)}
  {hrow('v1', 'Aug 2 · 4:51 PM', 'First deploy', '0 · 0')}
  <p class="helper" style="border-top:1px solid var(--line-faint);padding-top:10px">
    <b>Pro keeps the last 10 versions. Free keeps the last 3.</b> Older versions are removed, not hidden —
    an Inflozo theme can&rsquo;t be rebuilt later, so this is how far back you can go.</p>
</div>""", right=BELL + NEWPROJ, tail="""
<div class="overlay sheet-wrap" id="rollback"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Roll back to v4?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Your live site switches to v4 instantly.
    <b>v5 stays in history — nothing is lost.</b></p></div>
  <div class="foot"><button class="btn secondary" data-close autofocus>Cancel</button>
    <button class="btn danger-out" data-close>Roll back</button></div></div></div>
<div class="overlay sheet-wrap" id="restore"><div class="sheet narrow"><div class="head">
    <h2 style="font-size:18px">Restore your original theme?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">orbitweekly.com goes back to
    <span class="mono">casper 5.9.4</span>, exactly as it was before Inflozo touched it. Your Inflozo versions
    all stay in history.</p>
    <div class="banner notice"><span class="ico">!</span><span><b>Ghost checks every theme on the way in.</b>
      A very old theme can be refused — if that happens we offer you the zip and point you at Settings → Design,
      where Ghost still holds it.</span></div></div>
  <div class="foot"><button class="btn secondary" data-close autofocus>Cancel</button>
    <button class="btn danger-out" data-close>Restore original</button></div></div></div>
<div class="overlay menu" id="pin-refusal" style="position:fixed;right:auto;left:50%;top:auto;bottom:24px;
  transform:translateX(-50%);width:340px;padding:14px">
  <div class="banner notice"><span class="ico">📌</span><span><b>One version has to stay unpinned so your next
    deploy has somewhere to go.</b> Unpin another first.</span></div>
  <button class="btn secondary sm" data-close style="margin-top:10px">Got it</button></div>"""),
     script="""
document.addEventListener('click', function (e) {
  var p = e.target.closest('[data-pin]');
  if (!p) return;
  var pinned = document.querySelectorAll('.itemrow.done').length;
  var rows = document.querySelectorAll('.itemrow .chip.mono').length;
  var row = p.closest('.itemrow');
  if (row.classList.contains('done')) {          // unpinning is ALWAYS allowed, by design
    row.classList.remove('done');
    p.outerHTML = '<button class="soft" style="border:none;background:none;cursor:pointer" data-pin>📌</button>';
    return;
  }
  if (pinned >= 5) {                              // at most N−1 pinned; one must stay free
    document.getElementById('pin-refusal').classList.add('is-open');
    return;
  }
  row.classList.add('done');
  p.outerHTML = '<button class="badge notice" style="border:none;cursor:pointer" data-pin>📌 Pinned</button>';
});""")

page('preview-only', 'Preview-only', app('sites', """<div class="stack gap16" style="max-width:680px">
  <div class="row gap10"><a href="sites.html">←</a><h2 style="font-size:20px">Field Notes</h2>
    <span class="badge sky"><span class="dot sky"></span>Preview-only</span></div>
  <div class="stack gap2"><b style="font-size:14px">fieldnotes.ghost.io</b>
    <span class="helper">Ghost(Pro) · Starter plan · connected 6 Aug</span></div>
  <div class="banner info"><span class="ico">ⓘ</span><span><b>Ghost(Pro) Starter does not allow custom themes.</b>
    Ghost restricts theme uploads on Starter, so we cannot deploy to this site. You can design and preview
    everything here, and export a theme zip whenever you want.</span></div>
  <div class="stack gap8"><span class="panel-label">What clears this</span>
    <div class="checkrow"><span class="tick">1</span><span>Upgrade the site to <b>Ghost(Pro) Publisher or
      higher</b>, then it clears on its own.</span></div>
    <div class="checkrow"><span class="tick">2</span><span>Or move the site to <b>self-hosted Ghost</b>, where
      theme upload is always available.</span></div></div>
  <div class="banner notice"><span class="ico">!</span><span>Your zip downloads on every plan, but
    <b>Starter forbids custom themes in Ghost Admin too</b> — this is a plan limit, not an API limit, so
    uploading it by hand is not a route either. It installs on a self-hosted Ghost, or on a Ghost(Pro) plan
    that allows custom themes.</span></div>
  <div class="row gap10"><a class="btn coral" href="deploy.html?export">Export theme zip</a>
    <button class="btn secondary" data-close>Re-check plan</button>
    <span class="btn off">Ship it</span></div>
  <span class="reason">Ghost(Pro) Starter doesn&rsquo;t accept custom themes over the API or in Ghost Admin.</span>
  <p class="helper"><b>We probe this, we never ask.</b> The daily health check re-runs it, so the flag sets and
    clears with no action from you — and a successful deploy clears it too.</p>
</div>""", right=BELL, search='Search sites…'))

page('routes-fallback', 'Upload routes.yaml', app('sites', """<div class="stack gap16" style="max-width:700px">
  <div class="row gap10"><a href="routes-manager.html">←</a>
    <h2 style="font-size:19px">Upload <span class="mono">routes.yaml</span> yourself</h2></div>
  <p style="font-size:13.5px;line-height:1.6">We normally upload this for you. <b>Uploading a routing file needs
    the site Owner&rsquo;s Staff Access Token, and this project doesn&rsquo;t have one</b> — so this once,
    you&rsquo;ll do it by hand. It takes about a minute.</p>
  <div class="stack gap10">
    <div class="checkrow"><span class="tick">1</span>
      <span class="stack gap4 grow"><b>Download the file we generated</b>
        <span class="row gap8"><span class="chip mono">routes.yaml</span><span class="helper">1.4 KB</span>
          <button class="btn sm secondary" data-close>Download</button></span></span></div>
    <div class="checkrow"><span class="tick">2</span>
      <span class="stack gap4 grow"><b>In Ghost, find the routes upload for your version</b>
        <span class="helper">We detected <b>Ghost 6.58</b> at connect. Ghost moves this screen between versions,
          so we describe what you are looking for rather than naming clicks that are already wrong for some
          customers.</span>
        <a class="small" href="#" onclick="event.preventDefault()" style="color:var(--sky-text)">Show me where ↗</a></span></div>
    <div class="checkrow"><span class="tick">3</span>
      <span class="stack gap4 grow"><b>Come back and press Verify</b>
        <span class="helper">We re-read your routing through the Content API where we can, and otherwise say we
          could not confirm. We will not claim success we cannot see.</span></span></div></div>
  <div id="verify-out"></div>
  <div class="row gap10"><button class="btn coral" id="verify">Verify upload</button>
    <a class="btn secondary" href="manage-keys.html">Add the token instead</a></div>
  <span class="helper">Adding the token makes this automatic from now on.</span>
</div>""", right=BELL, search='Search sites…'), script="""
var n = 0;
document.getElementById('verify').addEventListener('click', function () {
  var out = document.getElementById('verify-out');
  n++;
  out.innerHTML = n === 1
    ? '<div class="banner notice"><span class="ico">!</span><span><b>We couldn&rsquo;t confirm it landed.</b> '
      + 'Your upload may well have worked — we just cannot see the routing file from here without the token, '
      + 'and we are not going to tell you it is fine when we do not know.</span></div>'
    : '<div class="banner success"><span class="ico">✓</span><span><b>Your routing is live.</b> '
      + 'We read it back and your collections resolve.</span></div>';
});""")

page('binding-checklist', 'One step left', app('projects', """<div class="stack gap16" style="max-width:940px">
  <div class="row gap10"><a href="editor.html">←</a><h2 style="font-size:20px">Point a Ghost page at each template</h2></div>
  <div class="row gap28" style="align-items:flex-start;gap:28px">
    <div class="stack gap14 grow">
      <p style="font-size:13.5px;line-height:1.6">Three templates shipped with this deploy. Ghost stores the
        template choice on the page&rsquo;s own row, so the last step happens in Ghost — once per page, and it
        survives a retitle, a slug change and a theme swap.</p>
      <div class="stack gap10">
        <label class="itemrow" style="cursor:pointer"><span class="check"></span>
          <div class="stack gap2 grow"><b style="font-size:13.5px">Membership</b>
            <span class="helper mono">custom-membership.hbs</span>
            <span class="helper">Ghost&rsquo;s Template dropdown will show it as <b>Membership</b>.</span></div>
          <span class="btn sm secondary">Open in Ghost ↗</span></label>
        <label class="itemrow" style="cursor:pointer"><span class="check"></span>
          <div class="stack gap2 grow"><b style="font-size:13.5px">Signin</b>
            <span class="helper mono">custom-signin.hbs</span></div>
          <span class="btn sm secondary">Open in Ghost ↗</span></label>
        <label class="itemrow" style="cursor:pointer"><span class="check"></span>
          <div class="stack gap2 grow"><b style="font-size:13.5px">Member home</b>
            <span class="helper mono">custom-member-home.hbs</span></div>
          <span class="btn sm secondary">Open in Ghost ↗</span></label></div>
      <ol class="stack gap8" style="margin:0;padding-left:18px;font-size:13px;line-height:1.55">
        <li>Ship this template. It arrives in Ghost as a page template.</li>
        <li>In Ghost, open a page and pick <b>Membership</b> from the Template dropdown.</li>
        <li>That&rsquo;s it — Ghost remembers your choice on that page, even if you rename or re-slug it later.</li></ol>
      <div class="banner info"><span class="ico">ⓘ</span><span><b>We can&rsquo;t see whether you did this.</b>
        Ghost doesn&rsquo;t tell us which template a page picked, so tick it off yourself when it&rsquo;s done.</span></div>
    </div>
    <div class="card" style="width:300px;flex-shrink:0"><div class="pad-tight stack gap10">
      <span class="panel-label" style="font-size:10.5px">GHOST · PAGE SETTINGS</span>
      <div class="stack gap4"><span class="control-label soft">Page URL</span>
        <span class="input" style="display:flex;align-items:center;font-size:12.5px">/join/</span></div>
      <div class="stack gap4"><span class="control-label soft">Template</span>
        <div class="card" style="box-shadow:var(--sh-md)"><div class="pad-tight stack gap2">
          <div class="mrow">Default</div>
          <div class="mrow on">Membership<span style="margin-left:auto">✓</span></div>
          <div class="mrow">Signin</div><div class="mrow">Member home</div></div></div></div>
      <span class="helper">The dropdown is the setting. There is no badge here, because Inflozo cannot see what
        a Ghost page chose.</span></div></div>
  </div></div>""", right=BELL + NEWPROJ))


def marketing_nav():
    links = ['Features', 'How it works', 'Sections', 'Pricing', 'Docs']
    ls = ''.join(f'<a href="pricing.html" style="{"font-weight:600" if l == "Pricing" else "color:var(--ink-soft)"}">{l}</a>'
                 for l in links)
    return (f'<div class="mknav"><a href="pricing.html" style="font-family:var(--display);font-weight:800;'
            f'font-size:20px;letter-spacing:-.02em">Inflozo</a>'
            f'<div class="row gap24" style="margin-left:20px">{ls}</div>'
            f'<div class="row gap12" style="margin-left:auto"><a href="index.html">Sign in</a>'
            f'<a class="btn coral sm" href="index.html">Start free</a></div></div>')


MKFOOT = """<div class="mkfoot">
  <div class="stack gap6" style="max-width:280px"><b style="font-family:var(--display);font-size:16px">Inflozo</b>
    <span>The visual builder for Ghost. Building a beautiful site should feel like play.</span></div>
  <div class="stack gap4"><b>Product</b><a href="pricing.html">Pricing</a><a href="suggestions.html">Suggestions</a></div>
  <div class="stack gap4"><b>Learn</b><a href="connect-integration.html">Connect your site</a></div>
  <div class="stack gap4"><b>Company</b><span>Terms</span><span>Privacy</span></div>
  <div class="stack gap4" style="margin-left:auto"><span>hello@inflozo.com</span><span>© 2026 Inflozo</span>
    <span>made for Ghost 6.x</span></div></div>"""

FAQS = [
    ('What happens to my site if I cancel?',
     'Nothing. Your deployed theme is a normal Ghost theme — it stays live on your site forever. You just '
     'can&rsquo;t push new versions from Inflozo until you are back under the Free limits.'),
    ('Is the Free plan actually free?',
     'Yes, and permanently. One project, one connected site, every design on the canvas, and you ship the free '
     'set. No card, no trial clock.'),
    ('Do you handle VAT and sales tax?',
     'Dodo is the merchant of record, so tax is calculated, collected and remitted for you. Your invoices come '
     'from Dodo and show the tax line.'),
    ('Can I switch between monthly and yearly?',
     'Any time, from the Dodo portal. Switching to yearly credits what you have already paid for the month.'),
]

page('pricing', 'Pricing', f"""<div class="mk">{marketing_nav()}
  <div class="mkbody stack gap32">
    <div class="stack gap8" style="text-align:center;align-items:center">
      <span class="panel-label">Pricing</span>
      <h1 style="font-size:44px">Free to play. $15 to ship it all.</h1>
      <div class="row gap10" style="margin-top:8px">
        <span class="seg"><span>Monthly</span><span class="on">Yearly</span></span>
        <span class="badge notice">$150/yr — 2 months free</span></div></div>
    <div class="grid g2 gap24" style="margin-top:24px">
      <div class="card"><div class="pad stack gap14">
        <b style="font-size:16px">Free</b>
        <span style="font-family:var(--display);font-size:36px;font-weight:700">$0<span class="soft" style="font-size:14px"> forever</span></span>
        <p class="softaa" style="font-size:13px">Everything you need to build and ship one gorgeous site.</p>
        <div class="stack gap8" style="font-size:13px">
          <span>✓ 1 project · 1 connected site</span>
          <span>✓ Every design on the canvas</span>
          <span>✓ Every Style Pack, each with a hand-paired dark palette</span>
          <span>✓ One-click deploy with gscan</span>
          <span>✓ Ship the free set · last 3 versions kept</span>
          <span>✓ 100 MB assets · 10 MB per file</span></div>
        <a class="btn secondary lg" href="index.html">Start free</a></div></div>
      <div class="card" style="border:1px solid var(--marigold)"><div class="pad stack gap14">
        <div class="row gap8"><b style="font-size:16px">Pro</b><span class="badge pro">✦</span>
          <span class="badge notice" style="margin-left:auto">Everything, unlocked</span></div>
        <span style="font-family:var(--display);font-size:36px;font-weight:700">$15<span class="soft" style="font-size:14px">/mo</span></span>
        <p class="softaa" style="font-size:13px">For publishers who ship often and want every section.</p>
        <div class="stack gap8" style="font-size:13px">
          <span>✓ 25 projects · 10 sites</span>
          <span>✓ Every design, at every exit</span>
          <span>✓ Custom Style Packs, saved and named</span>
          <span>✓ Last 10 versions per project, with rollback</span>
          <span>✓ 5 GB assets, auto-optimized</span>
          <span>✓ Remove the &ldquo;Built with Inflozo&rdquo; credit</span></div>
        <a class="btn coral lg" href="upgrade.html">Go Pro</a></div></div></div>
    <p class="helper" style="text-align:center">Cancel anytime · Taxes handled · Powered by Dodo</p>
    <div style="margin-top:24px"><h2 style="font-size:22px;text-align:center;margin-bottom:16px">The limits, plainly</h2>
      {limits_table()}</div>
    <div style="margin-top:24px"><h2 style="font-size:22px;text-align:center;margin-bottom:4px">Pricing FAQ</h2>
      <p class="softaa" style="text-align:center;font-size:13px;margin-bottom:16px">Money questions, answered.</p>
      <div class="stack gap12">""" + ''.join(
        f"""<details class="card"><summary class="pad row gap6" style="cursor:pointer;list-style:none">
          <b style="font-size:14px" class="grow">{q}</b><span class="soft">+</span></summary>
          <div class="pad" style="padding-top:0"><span class="softaa" style="font-size:13px;line-height:1.6">{a}</span></div>
        </details>""" for q, a in FAQS) + f"""</div></div>
  </div>{MKFOOT}</div>""")


# ═════════════════════════════════════════════════════════════════════════════
# The one file that is not a product screen: a jump list, for getting around.
# It is deliberately its own page rather than a bar on every screen, so nothing
# the owner is judging carries scaffolding on it.
# ═════════════════════════════════════════════════════════════════════════════
GROUPS = [
    ('Signed out and onboarding', ['index', 'magic-link-sent', 'first-run', 'connect-integration',
                                   'connect-keys', 'auto-branding', 'redesign-proposals', 'starter-chooser',
                                   'pricing']),
    ('Dashboard and account', ['dashboard', 'dashboard-free', 'dashboard-empty', 'grace', 'sites',
                               'manage-keys', 'preview-only', 'assets', 'assets-over-quota', 'billing',
                               'upgrade', 'over-limit', 'suggestions', 'small-screen']),
    ('The editor', ['editor', 'section-picker', 'post-content', 'paywall-editor', 'editor-cards',
                    'error-pages', 'theme-settings', 'translations', 'routes-manager']),
    ('Shipping', ['deploy', 'deploy-history', 'routes-fallback', 'binding-checklist']),
]

DEEP_LINKS = [
    ('editor.html?empty', 'Editor — the blank canvas'),
    ('editor.html?readonly', 'Editor — read-only, over the Free limit'),
    ('editor.html?locked', 'Editor — someone else is editing (the lock)'),
    ('deploy.html?free', 'Ship it — on Free, with Pro designs placed'),
    ('deploy.html?updates', 'Ship it — with library updates waiting'),
    ('deploy.html?failed', 'Ship it — the failure ending'),
]


def build_screens_index():
    titles = {p['id']: p['title'] for p in PAGES}
    blocks = ''
    for name, ids in GROUPS:
        rows = ''.join(f'<a class="idxrow" href="{i}.html"><b>{titles.get(i, i)}</b>'
                       f'<span class="k">{i}.html</span></a>' for i in ids)
        blocks += f'<h2 style="font-size:18px;margin:28px 0 10px">{name}</h2><div class="idxgrid">{rows}</div>'
    deep = ''.join(f'<a class="idxrow" href="{h}">{l}<span class="k">state</span></a>' for h, l in DEEP_LINKS)
    deep += ('<a class="idxrow" href="_selfcheck.html">app.js self-check'
             '<span class="k">not a screen</span></a>')
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Every screen · Inflozo walkthrough</title>
{FONTS}<link rel="stylesheet" href="styles.css"></head>
<body class="product"><div class="screens-index">
  <h1 style="font-size:30px">Every screen</h1>
  <p class="softaa" style="font-size:14px;line-height:1.6;max-width:70ch;margin-top:10px">
    This page is the only thing here that is not the product. It exists so you can jump straight to a screen
    instead of walking to it. <b>Start at <a href="index.html">index.html</a></b> and click through as a user
    would — sign in, connect a site, build, ship — and come back here when you want to skip ahead.</p>
  <p class="helper" style="margin-top:8px">Everything is clickable and nothing is wired to anything. The
    keyboard map works inside the editor: <span class="kbd">[</span> <span class="kbd">]</span> change the
    design, <span class="kbd">P</span> is preview, <span class="kbd">L</span> hides Layers,
    <span class="kbd">1</span> <span class="kbd">2</span> <span class="kbd">3</span> change device,
    <span class="kbd">⇧R</span> remixes, <span class="kbd">⌘K</span> adds a section,
    <span class="kbd">Esc</span> steps back out.</p>
  {blocks}
  <h2 style="font-size:18px;margin:28px 0 10px">States you would otherwise have to arrive at</h2>
  <div class="idxgrid">{deep}</div>
</div></body></html>
"""


def main():
    css = open(os.path.join(os.path.dirname(OUT), 'prototype', 'styles.css')).read()
    css += '\n' + open(os.path.join(OUT, '_app.css')).read()
    open(os.path.join(OUT, 'styles.css'), 'w').write(css)

    seen = set()
    for p in PAGES:
        assert p['id'] not in seen, 'duplicate id: ' + p['id']
        seen.add(p['id'])
        open(os.path.join(OUT, p['id'] + '.html'), 'w').write(shell(p))
    open(os.path.join(OUT, '_screens.html'), 'w').write(build_screens_index())

    # Every href must resolve. A walkthrough with a dead link stops being a walkthrough
    # at the moment someone clicks it.
    files = {p['id'] + '.html' for p in PAGES} | {'styles.css', 'app.js', '_screens.html', '_selfcheck.html'}
    bad = []
    for p in PAGES:
        src = shell(p)
        for href in re.findall(r'href="([^"]+)"', src):
            if href.startswith(('http', 'mailto:', '#')):
                continue
            tgt = href.split('#')[0].split('?')[0]
            if tgt and tgt not in files:
                bad.append(f'{p["id"]}.html → {href}')
    for href in re.findall(r'href="([^"]+)"', build_screens_index()):
        if href.startswith(('http', '#')):
            continue
        tgt = href.split('#')[0].split('?')[0]
        if tgt and tgt not in files:
            bad.append(f'_screens.html → {href}')
    if bad:
        print('\n'.join(sorted(set(bad))))
        raise SystemExit(f'{len(set(bad))} dead links')
    print(f'{len(PAGES)} screens + _screens.html + styles.css + app.js · all links resolve')


if __name__ == '__main__':
    main()
