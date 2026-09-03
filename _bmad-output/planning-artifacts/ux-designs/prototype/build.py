#!/usr/bin/env python3
"""Inflozo — the step-5b static prototype generator (ruling R-75).

    python3 build.py        # writes index.html and every surface page beside this file

WHY A GENERATOR AND NOT FIFTY HAND-WRITTEN FILES. Two reasons, both standing rules.
Standing rule "counts are derived, never restated": index.html's surface list, its
journey trails and its flow trails are all rendered FROM the registry below, so the
front door cannot claim a surface the prototype does not have, and cannot miss one it
does. And every page's opening HTML comment — the frame it derives from (R-74) and the
EXPERIENCE.md section it implements — is emitted from the same row that emits the page,
so the two cannot drift apart.

THE OUTPUT IS THE DELIVERABLE. The emitted .html files are plain, self-contained and
open on a double-click: relative links only, no fetch, no CDN script, no build step at
read time. This file is disposable the day the dynamic app exists.
"""
import os, re, html

OUT = os.path.dirname(os.path.abspath(__file__))

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;'
         '12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500'
         '&display=swap" rel="stylesheet">')

# ─────────────────────────────────────────────────────────────────────────────
# The registry. One row per PAGE. `subs` are the surfaces that live ON that page —
# EXPERIENCE.md's IA names ~80 surfaces and they are not all full pages; a panel, a
# pill, a marker, a popover or a sheet gets a section on the page it lives on, reachable
# by a link from it and listed by name on the index (prompt, step 5b).
# ─────────────────────────────────────────────────────────────────────────────
PAGES = []          # dicts: id,title,group,frames,exp,body,subs
SUB = lambda name, anchor, note='': (name, anchor, note)


def page(pid, title, group, frames, exp, body, subs=(), note=''):
    PAGES.append(dict(id=pid, title=title, group=group, frames=frames,
                      exp=exp, body=body, subs=list(subs), note=note))


# Journeys and flows. Each step is (href, label). A href may carry an anchor, because a
# journey step often lands on a section of a page rather than on a page of its own.
JOURNEYS = []
FLOWS = []


def journey(key, title, who, steps):
    JOURNEYS.append(dict(key=key, title=title, who=who, steps=steps))


def flow(key, title, why, steps):
    FLOWS.append(dict(key=key, title=title, why=why, steps=steps))


# ─────────────────────────────────────────────────────────────────────────────
# Shell
# ─────────────────────────────────────────────────────────────────────────────
def trails_for(pid):
    """Every journey and flow this page appears in, with its neighbours. Derived."""
    out = []
    for kind, coll in (('Journey', JOURNEYS), ('Flow', FLOWS)):
        for t in coll:
            hits = [i for i, (h, _l) in enumerate(t['steps']) if h.split('#')[0] == pid + '.html']
            if not hits:
                continue
            i = hits[0]
            prev = t['steps'][i - 1] if i > 0 else None
            nxt = t['steps'][i + 1] if i + 1 < len(t['steps']) else None
            out.append((kind, t, i, prev, nxt))
    return out


def shell(p):
    tr = trails_for(p['id'])
    trail_html = ''
    for kind, t, i, prev, nxt in tr:
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
        subs_html = ('<div class="proto-note"><b>Also on this page</b> — surfaces that exist only over '
                     'this one: <div class="idxgrid" style="margin-top:8px">' + rows + '</div></div>')

    return f"""<!--
  INFLOZO STATIC PROTOTYPE · step 5b · ruling R-75
  SURFACE  : {p['title']}
  FRAME    : {p['frames']}
  IMPLEMENTS: EXPERIENCE.md {p['exp']}
  Fixture publication: Orbit Weekly (orbitweekly.com), Maya Chen · Sam Okafor · Rosa Menendez.
  Visual vocabulary is the design export's and nothing else (R-74).
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
  <span class="spacer"></span>
  <span class="frame">Static prototype. Nothing here is wired to anything — it is the product, drawn.</span>
</div>
</body>
</html>
"""


# ─────────────────────────────────────────────────────────────────────────────
# Small builders, so the frames' construction is written once and reused
# ─────────────────────────────────────────────────────────────────────────────
def cap(text):
    return f'<p class="frame-cap">{text}</p>'


def screen(inner, cls='', capt=None, anchor=None):
    a = f' id="{anchor}"' if anchor else ''
    c = (cap(capt) if capt else '')
    return f'<div{a}>{c}<div class="screen {cls}">{inner}</div></div>'


def head(title, blurb='', capt='', anchor=None):
    a = f' id="{anchor}"' if anchor else ''
    return (f'<div class="section-head"{a}><h2>{html.escape(title)}</h2>'
            + (f'<p>{blurb}</p>' if blurb else '')
            + (cap(capt) if capt else '') + '</div>')


ICON = {
    'grid': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    'globe': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    'image': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
    'bell': '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6E6A64" stroke-width="1.5" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    'search': '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6E6A64" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>',
    'plus': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    'clock': '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6E6A64" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>',
    'eye': '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    'grip': '<svg width="10" height="14" viewBox="0 0 10 16" fill="#C9C2B8"><circle cx="3" cy="3" r="1.3"/><circle cx="7" cy="3" r="1.3"/><circle cx="3" cy="8" r="1.3"/><circle cx="7" cy="8" r="1.3"/><circle cx="3" cy="13" r="1.3"/><circle cx="7" cy="13" r="1.3"/></svg>',
    'caret': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6E6A64" stroke-width="1.5"><polyline points="6 9 12 15 18 9"/></svg>',
    'check': '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E84B34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    'back': '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>',
}


def rail(active, plan='pro', used='312 MB', cap_='of 5 GB', pct=6, over=False):
    """S3's 220px left rail — the app's navigation, drawn once."""
    who = ('M', 'Maya Chen', 'maya@orbitweekly.com', '<span class="badge pro">✦ Pro</span>', 'avatar') \
        if plan == 'pro' else \
        ('S', 'Sam Okafor', 'sam@fieldnotes.blog', '<span class="badge free">Free</span>', 'avatar sam')
    def nav(key, label, icon, href):
        on = ' on' if key == active else ''
        return f'<a class="nav{on}" href="{href}">{ICON[icon]}{label}</a>'
    return f"""<div class="rail">
  <a class="word" href="dashboard.html">Inflozo</a>
  <div class="stack gap4">
    {nav('projects', 'Projects', 'grid', 'dashboard.html')}
    {nav('sites', 'Sites', 'globe', 'sites.html')}
    {nav('assets', 'Assets', 'image', 'assets.html')}
    <div class="meter{' over' if over else ''}">
      <div class="track"><div class="fill" style="width:{pct}%"></div></div>
      <span class="helper"><span class="mono">{used}</span> {cap_}</span>
    </div>
  </div>
  <a class="acct" href="billing.html">
    <span class="{who[4]}">{who[0]}</span>
    <span class="stack"><span style="font-size:13px;font-weight:600">{who[1]}</span>
      <span class="helper">{who[2]}</span></span>
    <span style="margin-left:auto">{who[3]}</span>
  </a>
</div>"""


def topbar(search='Search projects…', right=''):
    return f"""<div class="topbar">
  <div class="search">{ICON['search']}<span class="grow">{search}</span><span class="kbd">⌘K</span></div>
  <div class="row gap10" style="margin-left:auto">{right}</div>
</div>"""


BELL = f'<a class="iconbtn" href="notifications.html" aria-label="Notifications">{ICON["bell"]}<span class="dot-new"></span></a>'
NEWPROJ = f'<a class="btn coral" href="new-project-sheet.html">{ICON["plus"]}New project</a>'


def app(active, body, plan='pro', right='', search='Search projects…', **kw):
    return f'<div class="app">{rail(active, plan=plan, **kw)}<div class="appmain">' \
           f'{topbar(search, right)}<div class="appbody">{body}</div></div></div>'


def wizrail(steps, current):
    """S8's numbered step rail. The count grows: 4 on an ordinary deploy, 6 on the first
    deploy to a site (EXPERIENCE.md § Component Patterns · Wizard step rail)."""
    out = []
    for i, s in enumerate(steps, 1):
        cls = 'on' if i == current else ('done' if i < current else '')
        n = '✓' if i < current else str(i)
        out.append(f'<span class="rstep {cls}"><span class="n">{n}</span>{s}</span>')
    return '<div class="rail-steps">' + '<span class="rsep"></span>'.join(out) + '</div>'


def edbar(project='Orbit Weekly', template='Home', viewas='Anonymous', save='Saved',
          ship='Ship it', ink=False, extra='', shipref='deploy-destination.html'):
    save_dot = 'mint' if save.startswith('S') else 'coral'
    cls = 'edbar ink' if ink else 'edbar'
    return f"""<div class="{cls}">
  <a class="row" href="dashboard.html" style="width:28px;height:28px;justify-content:center">{ICON['back']}</a>
  <span style="font-size:13px;font-weight:600">{project}</span>
  <a class="row gap6 small soft" href="editor.html#persistence"><span class="dot {save_dot}"></span>{save}</a>
  <div class="centre">
    <a class="pickbtn" href="editor.html#template-switcher"><span class="lab">Template</span>{template}{ICON['caret']}</a>
    <a class="pickbtn" href="editor.html#member-state">{ICON['eye']}<span class="lab">View as</span>{viewas}{ICON['caret']}</a>
  </div>
  <div class="row gap8" style="margin-left:auto">{extra}
    <a class="iconbtn" href="deploy-history.html" aria-label="Deploy history">{ICON['clock']}</a>
    <span class="split"><a class="btn coral" href="{shipref}">{ship}</a><a class="btn coral caret" href="deploy-history.html">▾</a></span>
  </div>
</div>"""


def owsite(selected=None, hover=None, extra_top=''):
    """The fixture publication on the canvas — Orbit Weekly, as S4/S6/S7 draw it."""
    def cls(name):
        if selected == name: return ' outline-sel'
        if hover == name: return ' outline-hover'
        return ''
    return f"""{extra_top}<div class="site">
  <div class="ow-nav{cls('header')}"><span class="ow-brand">Orbit Weekly</span>
    <span class="ow-links"><span>Essays</span><span>Notes</span><span>About</span></span>
    <span class="ow-sub">Subscribe</span></div>
  <div class="row gap32{cls('hero')}" style="padding:38px 32px;align-items:center">
    <div class="stack gap12" style="flex:1.1">
      <span class="ow-eyebrow">ISSUE 47 · ESSAYS</span>
      <span class="ow-h1">The slow return of the personal homepage</span>
      <span class="ow-dek">Why writers are leaving the feed — and coming home to a page of their own.</span>
      <span class="ow-meta">Maya Chen · Aug 14 · 9 min read</span>
    </div>
    <div class="ow-photo" style="flex:1;aspect-ratio:4/3"><span>feature photo</span></div>
  </div>
  <div style="padding:30px 32px;background:#FFFFFF;border-top:1px solid #EBE5DB"{' class="outline-sel"' if selected == 'feed' else ''}>
    <div class="row" style="justify-content:space-between;margin-bottom:18px">
      <span style="font-family:var(--serif);font-size:19px">Latest essays</span>
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
      </div></div></div>
  <div class="stack gap10{cls('newsletter')}" style="padding:30px 32px;background:#F4EFE6">
    <span style="font-family:var(--serif);font-size:22px">The Sunday orbit.</span>
    <span class="ow-dek">One essay, every Sunday · No algorithm, no feed · Free forever</span>
    <div class="row gap8"><span class="input" style="max-width:260px;display:flex;align-items:center;color:var(--ink-faint)">you@example.com</span><span class="ow-sub">Sign up</span></div>
  </div>
  <div class="row gap32{cls('footer')}" style="padding:26px 32px;background:#3B382F;color:#E8E2D6;align-items:flex-start">
    <div class="stack gap6" style="flex:1.4"><span style="font-family:var(--serif);font-size:15px">Orbit Weekly</span>
      <span style="font-size:11px;opacity:.72;font-family:var(--ui)">Essays on the humane web, published every Sunday from Lisbon.</span></div>
    <div class="stack gap4" style="font-size:11px;font-family:var(--ui);opacity:.8"><b>READ</b><span>Essays</span><span>Notes</span><span>Archive</span></div>
    <div class="stack gap4" style="font-size:11px;font-family:var(--ui);opacity:.8"><b>MEMBERS</b><span>Sign in</span><span>Upgrade</span><span>Gift</span></div>
    <div class="stack gap4" style="font-size:11px;font-family:var(--ui);opacity:.8"><b>MORE</b><span>About</span><span>RSS</span><span>Contact</span></div>
  </div>
</div>"""


def layerspanel(active='Hero — Split Editorial', extra_top='', pagelabel='THIS PAGE · HOME'):
    rows = [('Home hero', 'Hero — Split Editorial'), ('Latest issues', 'Post Grid — Magazine'),
            ('The list, teased', 'Newsletter — Split'), ('Signup', 'About, short')]
    body = ''
    for a, b in [('Home hero', ''), ('Latest issues', ''), ('The list, teased', ''), ('Signup', '✦'), ('About, short', '')]:
        on = ' on' if a == 'Home hero' and active else ''
        body += (f'<div class="lrow{on}">{ICON["grip"]}<div class="lthumb"></div>'
                 f'<span class="grow">{a}</span>{chr(60)+"span class=" + chr(34) + "badge pro" + chr(34) + chr(62) + "✦ Pro</span>" if b else ""}'
                 f'<span class="faint">{ICON["eye"]}</span></div>')
    return f"""<div class="layers">
  <div class="list">
    {extra_top}
    <a class="panel-label" href="editor.html#layers" style="padding:6px 8px">Layers</a>
    <div class="sitewide">
      <div class="row gap8" style="padding:2px 6px 6px"><span class="panel-label" style="font-size:11px">SITE-WIDE</span>
        <span class="helper" style="margin-left:auto">on 9 templates</span></div>
      <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Announcement</span><span class="faint">{ICON['eye']}</span></div>
      <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Header</span><span class="faint">{ICON['eye']}</span></div>
      <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Footer</span><span class="faint">{ICON['eye']}</span></div>
    </div>
    <div class="row" style="padding:6px 8px"><span class="panel-label" style="font-size:11px">{pagelabel}</span><span class="helper" style="margin-left:auto">5</span></div>
    {body}
  </div>
  <div style="border-top:1px solid var(--line);padding:10px">
    <a class="btn dashed" href="section-picker.html" style="width:100%">+ Add section</a></div>
</div>"""


def marketing_nav(active='Pricing'):
    links = ['Features', 'How it works', 'Sections', 'Pricing', 'Docs']
    ls = ''.join(f'<a href="pricing.html" style="{"font-weight:600" if l == active else "color:var(--ink-soft)"}">{l}</a>' for l in links)
    return (f'<div class="mknav"><a class="word" href="index.html" style="font-family:var(--display);'
            f'font-weight:800;font-size:20px;letter-spacing:-.02em">Inflozo</a>'
            f'<div class="row gap24" style="margin-left:20px">{ls}</div>'
            f'<div class="row gap12" style="margin-left:auto"><a href="sign-in.html">Sign in</a>'
            f'<a class="btn coral sm" href="sign-in.html">Start free</a></div></div>')


MKFOOT = """<div class="mkfoot">
  <div class="stack gap6" style="max-width:280px"><b style="font-family:var(--display);font-size:16px">Inflozo</b>
    <span>The visual builder for Ghost. Building a beautiful site should feel like play.</span></div>
  <div class="stack gap4"><b>Product</b><a href="pricing.html">Pricing</a><a href="suggestions.html">Suggestions</a></div>
  <div class="stack gap4"><b>Learn</b><a href="connect-integration.html">Connect your site</a></div>
  <div class="stack gap4"><b>Company</b><span>Terms</span><span>Privacy</span></div>
  <div class="stack gap4" style="margin-left:auto"><span>hello@inflozo.com</span><span>© 2026 Inflozo</span><span>made for Ghost 6.x</span></div>
</div>"""

# The plan matrix. PRD Appendix F.1 is the SOLE definition of Free/Pro gating, and several
# drawn frames disagree with it (S11c's "3", S12a's "unlimited", S12b/M5's "Last 2",
# S10b's "30 MB"). F.1 governs every one of them — EXPERIENCE.md § Plan limits.
LIMITS = [('Projects', '1', '25'),
          ('Site connections', '1', '10'),
          ('Section library', 'canvas: the whole library<br><span class="helper">deploy and export: the free set only</span>', 'The whole library'),
          ('Asset storage', '100 MB', '5 GB'),
          ('Per-upload cap', '10 MB', '10 MB'),
          ('Deploy history', 'last 3', 'last 10 per project'),
          ('Theme ZIP export', '✓ with credits, free designs only', '✓'),
          ('Credit removal', '—', '✓')]


def limits_table(note=True):
    rows = ''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for a, b, c in LIMITS)
    n = ('<p class="helper" style="margin-top:10px">Everything not in this table is on both plans — '
         'dark-mode authoring, the Routes Manager, Style Pack editing, Theme Settings, Translations, '
         'the Paywall editor, Post Content, card treatments, pagination styles, Shuffle, Remix, '
         'member-state preview, preview subject, snapshot, restore, rollback and the suggestions board.</p>') if note else ''
    return ('<table class="limits"><tr><th></th><th>Free</th><th>✦ Pro</th></tr>' + rows + '</table>' + n)


# ═══════════════════════════════════════════════════════════════════════════════
# ENTRY  ·  EXPERIENCE.md § Information Architecture → Entry
# ═══════════════════════════════════════════════════════════════════════════════
AUTH_SHELL = """<div style="min-height:640px;background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;gap:28px">
  <span style="font-family:var(--display);font-weight:800;font-size:22px;letter-spacing:-.02em">Inflozo</span>
  {card}
  <div class="row gap8 helper"><span>Terms</span><span>·</span><span>Privacy</span></div>
</div>"""

SIGNIN_CARD = """<div class="card" style="width:100%;max-width:420px"><div class="pad" style="display:flex;flex-direction:column;gap:18px">
    <div class="stack gap6"><h1 style="font-size:24px">Make something gorgeous.</h1>
      <p class="softaa" style="font-size:13.5px">Sign in or create an account — no passwords, ever.</p></div>
    <label class="field"><span class="control-label">Email</span>
      <input class="input" type="email" value="maya@orbitweekly.com" aria-label="Email"></label>
    <a class="btn coral lg" href="magic-link-sent.html" style="width:100%">Send magic link</a>
    <div class="row gap10"><span style="flex:1;height:1px;background:var(--line)"></span><span class="helper">or</span><span style="flex:1;height:1px;background:var(--line)"></span></div>
    <a class="btn secondary lg" href="sign-in.html#passkey" style="width:100%">Sign in with a passkey</a>
  </div></div>"""

page('sign-in', 'Sign In', 'Entry',
     'S1 Sign In.dc.html — S1a default, S1a mobile 390, S1c passkey prompt',
     '§ IA → Entry · § Responsive & Platform (drawn at 390, 834 and 1440)',
     screen(AUTH_SHELL.format(card=SIGNIN_CARD), capt='S1a · sign in — default · 1440')
     + head('Passkey Prompt', 'The OS sheet. <b>Inflozo draws the page behind it and nothing of the sheet itself</b> — '
            'the sheet is the operating system\'s, and drawing a facsimile of it would be inventing a component '
            'the product does not own.', 'S1c · passkey OS prompt · 1440', anchor='passkey')
     + screen(AUTH_SHELL.format(card=SIGNIN_CARD)
              + '<div class="sheetwrap" style="margin-top:-200px;position:relative"><div class="sheet narrow">'
              '<div class="head"><h2 style="font-size:16px">Sign in to &ldquo;inflozo.app&rdquo;</h2></div>'
              '<div class="body"><p class="softaa" style="font-size:13px">Use Touch ID to sign in with your saved passkey.</p>'
              '<p class="frame-cap" style="margin:0">system sheet — OS UI placeholder, not an Inflozo component</p></div>'
              '<div class="foot"><span class="btn secondary">Cancel</span></div></div></div>')
     + head('At 390', 'Sign In carries a phone frame in the export, so the app floor does not apply to it '
            '(R-76). The card becomes the page.', 'S1a · mobile · 390')
     + screen(AUTH_SHELL.format(card=SIGNIN_CARD), cls='phone'),
     subs=[SUB('Passkey Prompt', 'passkey', 'S1c')])

page('magic-link-sent', 'Magic Link Sent', 'Entry',
     'S1 Sign In.dc.html — S1b',
     '§ IA → Entry · § Accessibility Floor → Time limits (the countdown blocks nothing)',
     screen(AUTH_SHELL.format(card="""<div class="card" style="width:100%;max-width:420px"><div class="pad" style="display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center">
    <h1 style="font-size:24px">Check your inbox ✨</h1>
    <p class="softaa" style="font-size:13.5px">We sent a magic link to <b class="mono">maya@orbitweekly.com</b><br>It&rsquo;s good for 15 minutes.</p>
    <p class="helper">Didn&rsquo;t get it? Resend in <span class="mono">0:27</span></p>
    <a class="btn secondary" href="sign-in.html">Use a different email</a>
  </div></div>"""), capt='S1b · magic-link sent · 1440')
     + head('Why the countdown blocks nothing',
            'The resend countdown is the one clock on this surface and it is not a decision timer: the link '
            'itself is valid for 15 minutes and <b>&ldquo;Use a different email&rdquo; is always available</b>. '
            'The only timed interaction in the whole product is the edit-lock nudge — see '
            '<a href="edit-lock.html">Edit Lock</a>.'),
     note='<b>No password exists anywhere in the product</b> (FR-A1), so there is nothing to forget and no reset flow to draw.')

# ═══════════════════════════════════════════════════════════════════════════════
# ONBOARDING
# ═══════════════════════════════════════════════════════════════════════════════
page('first-run', 'First Run', 'Onboarding',
     'S2 Onboarding.dc.html — S2a',
     '§ IA → Onboarding · J1 step 2 · J2 step 1',
     screen("""<div style="min-height:640px;background:var(--paper);padding:56px 48px;display:flex;flex-direction:column;gap:32px;align-items:center">
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
    <a class="radiocard stack gap8" href="editor.html#empty" style="flex-direction:column;align-items:flex-start;padding:22px">
      <span class="t" style="font-size:16px">Blank canvas</span>
      <span class="c">An empty page and every design. Go wild.</span></a>
  </div>
  <p class="helper">You can do all of this later.</p>
</div>""", capt='S2a · onboarding — first run · 1440'),
     note='Three doors, and the same four paths reappear later on the '
          '<a href="new-project-sheet.html">New Project Sheet</a> (FR-B2), which adds Duplicate.')

page('connect-integration', 'Connect · Integration', 'Onboarding',
     'S2 Onboarding.dc.html — S2b·1 · also drawn as a modal in S11 Sites S11b',
     '§ IA → Onboarding · J1 step 3',
     screen("""<div style="min-height:620px;background:var(--paper);padding:48px;display:flex;flex-direction:column;gap:24px;align-items:center">
  <div class="row gap12" style="width:100%;max-width:880px"><span style="font-family:var(--display);font-weight:800;font-size:20px">Inflozo</span>
    <span class="chip" style="margin-left:auto">1/2</span></div>
  <div class="card" style="width:100%;max-width:880px"><div class="pad" style="display:flex;gap:32px">
    <div class="stack gap16 grow">
      <div class="stack gap6"><h1 style="font-size:24px">First, a quick handshake.</h1>
        <p class="softaa" style="font-size:13.5px">Inflozo talks to Ghost through a custom integration. Takes about a minute.</p></div>
      <ol class="stack gap12" style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.5">
        <li>Open <b>Ghost Admin → Settings → Integrations</b></li>
        <li>Click <b>Add custom integration</b></li>
        <li>Name it <b>Inflozo</b> and save — it shows three things: an API URL and two keys</li>
      </ol>
      <div class="row gap10"><a class="btn secondary" href="first-run.html">Back</a>
        <a class="btn coral" href="connect-keys.html">Done — next</a></div>
    </div>
    <div class="thumb" style="width:340px;height:230px;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px">
      <span class="helper">screenshot: Ghost Admin → Settings → Integrations → Add custom integration</span></div>
  </div></div>
</div>""", capt='S2b·1 · connect — create the integration · 1440'),
     note='The same two steps run as a modal from <a href="sites.html#connect-modal">Sites → Connect site</a> '
          '(S11b) and from the <a href="new-project-sheet.html">New Project Sheet</a>.')

page('connect-keys', 'Connect · Keys', 'Onboarding',
     'S2 Onboarding.dc.html — S2b·2',
     '§ IA → Onboarding · J1 steps 4–5 · § State Patterns → partially credentialed',
     screen("""<div style="min-height:620px;background:var(--paper);padding:48px;display:flex;flex-direction:column;gap:24px;align-items:center">
  <div class="row gap12" style="width:100%;max-width:620px"><span style="font-family:var(--display);font-weight:800;font-size:20px">Inflozo</span>
    <span class="chip" style="margin-left:auto">2/2</span></div>
  <div class="card" style="width:100%;max-width:620px"><div class="pad" style="display:flex;flex-direction:column;gap:18px">
    <div class="stack gap6"><h1 style="font-size:24px">Now paste the three keys.</h1>
      <p class="softaa" style="font-size:13.5px">They&rsquo;re right on the Inflozo integration you just made — copy each one across.</p></div>
    <label class="field"><span class="control-label">API URL</span><input class="input mono" value="https://orbitweekly.com" aria-label="API URL"></label>
    <label class="field"><span class="control-label">Admin API key</span><input class="input mono" value="65a3f0e1c9d24b…" aria-label="Admin API key"></label>
    <label class="field"><span class="control-label">Content API key</span><input class="input mono" value="8d41c0a97b…" aria-label="Content API key"></label>
    <div class="banner info"><span class="ico">ⓘ</span><span><b>Three fields, and the Staff Access Token is not among them.</b>
      That one is offered later, at your first deploy, as a safety net you can decline — see
      <a href="staff-token-offer.html">Staff Token Offer</a> (FR-C1).</span></div>
    <div class="row gap10"><a class="btn secondary" href="connect-integration.html">Back</a>
      <a class="btn coral" href="auto-branding.html">Connect</a>
      <a class="btn ghost" href="connect-keys.html#validation">Where do I find these?</a></div>
  </div></div>
</div>""", capt='S2b·2 · connect — paste the keys · 1440')
     + head('What validation does with them, and what it decides without asking',
            'J1 step 5. A server-side <span class="mono">GET /admin/config/</span> runs the moment Connect is pressed. '
            'Every outcome below is a designed state, not an error dialogue.', anchor='validation')
     + screen("""<div class="stack gap12" style="padding:24px;background:var(--paper)">
  <div class="banner success"><span class="ico">✓</span><span><b>Ghost 6.58 — connected.</b> Ghost 5.x and 6.x are both accepted.</span></div>
  <div class="banner error"><span class="ico">✕</span><span><b>This site runs Ghost 4.9 — please update Ghost.</b>
    Inflozo needs Ghost 5 or newer. Nothing has been changed on your site.</span></div>
  <div class="banner info"><span class="ico">ⓘ</span><span><b>This site is on Ghost(Pro) Starter, which doesn&rsquo;t accept custom themes.</b>
    We read that from your plan rather than asking — the site connects as
    <a href="preview-only-notice.html">Preview-only</a> and everything except deploying works.</span></div>
  <div class="banner notice"><span class="ico">!</span><span><b>That address starts with <span class="mono">http://</span>.</b>
    Keys travel in the clear over plain HTTP. We&rsquo;ll connect, but your Ghost site should be on HTTPS.</span></div>
  <div class="banner info"><span class="ico">ⓘ</span><span><b>This site has code injection.</b>
    Your live pages can legitimately look different from the canvas, because that code runs on the site and not here.
    Said once, at connect, and not again.</span></div>
  <div class="banner info"><span class="ico">ⓘ</span><span><b>Portal&rsquo;s floating button is on.</b>
    We read the setting where Ghost exposes it, and ask once where it does not. Defaults to on.</span></div>
</div>"""),
     subs=[SUB('Validation states', 'validation', 'J1 step 5')])

page('auto-branding', 'Auto-Branding', 'Onboarding',
     'S2 Onboarding.dc.html — S2c',
     '§ IA → Onboarding · J1 step 6',
     screen("""<div style="min-height:620px;background:var(--paper);padding:48px;display:flex;flex-direction:column;gap:24px;align-items:center">
  <span style="font-family:var(--display);font-weight:800;font-size:20px">Inflozo</span>
  <div class="stack gap6" style="text-align:center"><h1 style="font-size:28px">Nice site. Want to keep the vibe?</h1>
    <p class="softaa">We pulled these from orbitweekly.com — your call.</p></div>
  <div class="row gap24" style="width:100%;max-width:1000px;align-items:stretch">
    <div class="card grow"><div class="pad stack gap14">
      <span class="panel-label">Your site today</span>
      <div class="row gap10"><span class="avatar">O</span><span class="stack"><b>Orbit Weekly</b><span class="helper">orbitweekly.com</span></span></div>
      <div class="stack gap6"><span class="control-label">Accent colour</span>
        <div class="row gap8"><span class="sw" style="background:#D96C3F"></span><span class="small">Burnt orange</span></div></div>
      <div class="stack gap6"><span class="control-label">Navigation</span>
        <div class="row gap8 wrap"><span class="chip">Essays</span><span class="chip">Notes</span><span class="chip">Archive</span><span class="chip">About</span></div></div>
      <div class="stack gap6"><span class="control-label">Logo</span>
        <div class="row gap8"><span class="chip mono">orbit-wordmark.svg</span><span class="helper">SVG · 4 KB</span></div></div>
      <p class="helper">Fonts stay yours — pick a pairing once you&rsquo;re in the editor.</p>
    </div></div>
    <div class="card" style="flex:1.3"><div class="pad stack gap10">
      <span class="panel-label">Your homepage, already wearing your brand</span>
      <div class="thumb" style="height:260px"></div></div></div>
  </div>
  <div class="row gap10"><a class="btn coral lg" href="redesign-proposals.html">Use your brand</a>
    <a class="btn secondary lg" href="redesign-proposals.html">Skip</a></div>
</div>""", capt='S2c · auto-branding moment · 1440'),
     note='Ghost owns the logo, the title and the accent — Inflozo <b>reads them and never writes them</b> '
          '(AD-10\'s allowlist). <a href="theme-settings.html">Theme Settings</a> draws them padlocked for the same reason.')


# Appendix E is normative and names all ten starters with their pack. FR-O4: ONLY Quiet and
# Ledger are Free end-to-end. B23a's grid, filters and "Start empty" escape are kept; its
# invented roster and its "All Free" marks are replaced (EXPERIENCE.md § wrong mechanism → B23a).
# The mark is DELIBERATELY COUNT-AGNOSTIC. FR-O4 fixes which starters are Free end to end — Quiet and
# Ledger, and only those — but no document says how many Pro designs the other eight contain, and
# B23a's own note flags its invented counts as "a proposal, not a fact". A number here would be one
# more count to go stale (standing rule: counts are derived, never restated); in the product this
# mark is computed from the starter's own manifest at render time.
STARTERS = [
    ('Aurora', 'Tangerine', 'Newsletter-first personal brand.', 'Newsletter', 'Has Pro designs'),
    ('Gazette', 'Ink', 'Magazine — cover, mixed grid, topic tabs.', 'Writing', 'Has Pro designs'),
    ('Signal', 'Orbit', 'Tech blog — split editorial, bento, TOC-right.', 'Writing', 'Has Pro designs'),
    ('Foundry', 'Slate', 'Startup blog and marketing home.', 'Business', 'Has Pro designs'),
    ('Quiet', 'Quiet', 'Ultra-minimal writer. Free end to end.', 'Writing', 'All Free'),
    ('Pulse', 'Neon', 'Podcast — poster modal, episode list.', 'Newsletter', 'Has Pro designs'),
    ('Bloom', 'Meadow', 'Lifestyle and food — collage, masonry.', 'Portfolio', 'Has Pro designs'),
    ('Chapter', 'Berry', 'Author and book site.', 'Portfolio', 'Has Pro designs'),
    ('Ledger', 'Paper', 'Business and finance publication. Free end to end.', 'Business', 'All Free'),
    ('Studio', 'Mono', 'Portfolio plus blog.', 'Portfolio', 'Has Pro designs'),
]


def starter_grid():
    cells = ''
    for name, pack, blurb, _cat, mark in STARTERS:
        badge = ('<span class="badge free">All Free</span>' if mark == 'All Free'
                 else f'<span class="badge pro">✦ {mark}</span>')
        foot = ('' if mark == 'All Free'
                else '<span class="helper">swap or upgrade at deploy</span>')
        cells += f"""<a class="card" href="editor.html" style="display:block"><div class="pad-tight stack gap8">
      <div class="thumb" style="height:120px"></div>
      <div class="row gap8"><b style="font-size:14px">{name}</b>{badge}</div>
      <span class="helper">{blurb}</span>
      <div class="row gap6"><span class="chip">pack · {pack}</span>{foot}</div></div></a>"""
    return cells


page('starter-chooser', 'Starter Chooser', 'Onboarding',
     'B Missing Surfaces.dc.html — B23a (roster re-specified: Appendix E is normative)',
     '§ IA → Onboarding · § wrong mechanism → B23a · J2 alternative to step 1',
     screen(f"""<div style="min-height:760px;background:var(--paper);padding:40px 48px;display:flex;flex-direction:column;gap:24px">
  <div class="row gap12"><a href="first-run.html">{ICON['back']}</a>
    <span style="font-family:var(--display);font-weight:800;font-size:20px">Inflozo</span></div>
  <div class="stack gap6"><h1 style="font-size:28px">Pick your starter.</h1>
    <p class="softaa">Ten full sites, ready to wear your brand. You can restyle every section afterwards.</p></div>
  <div class="row gap8 wrap">
    <span class="seg"><span class="on">All 10</span><span>Writing</span><span>Newsletter</span><span>Portfolio</span><span>Business</span></span>
    <span class="row gap8" style="margin-left:auto"><span class="toggle"></span><span class="small soft">Free end-to-end only</span></span>
  </div>
  <div class="grid g5 gap16">{starter_grid()}</div>
  <div class="card"><div class="pad row gap16">
    <div class="stack gap4 grow"><b>Rather not start from a starter?</b>
      <span class="helper">Begin with an empty site and add sections yourself. Every design is available on the
      canvas either way — you ship the free set, or go Pro.</span></div>
    <a class="btn secondary" href="editor.html#empty">Start empty</a>
    <a class="btn coral" href="editor.html">Use Quiet</a></div></div>
</div>""", capt='B23a · the chooser · 1440 — roster from PRD Appendix E'),
     note='<b>No starter ships a membership template</b> (FR-O1): membership pages are opt-in '
          '<span class="mono">custom-{name}.hbs</span> files, so a starter&rsquo;s first deploy needs no step in '
          'Ghost Admin beyond the theme upload — and never raises the '
          '<a href="template-binding-checklist.html">Template Binding Checklist</a>.')

page('redesign-proposals', 'Redesign Proposals', 'Onboarding',
     'B Missing Surfaces.dc.html — B22 (re-specified per ruling R-78 and FR-C7)',
     '§ IA → Onboarding · § wrong mechanism → B22 · J1 step 7',
     screen("""<div style="min-height:720px;background:var(--paper);padding:40px 48px;display:flex;flex-direction:column;gap:22px">
  <div class="stack gap6"><h1 style="font-size:28px">We had a look at orbitweekly.com</h1>
    <p class="softaa">Your posts, tags and images are already in. Here are two whole-site designs built around what you
      actually publish — same words, different sites. Take one, or neither.</p></div>
  <div class="grid g2 gap20">
    <div class="card"><div class="pad stack gap12">
      <div class="row gap8"><b style="font-size:15px">Gazette + Ink</b><span class="badge pro">✦ 4 Pro</span></div>
      <div class="row gap10"><div class="stack gap4 grow"><span class="helper">NOW</span><div class="thumb" style="height:150px"></div></div>
        <div class="stack gap4 grow"><span class="helper">PROPOSED</span><div class="thumb" style="height:150px;background:#EFE9E1"></div></div></div>
      <p style="font-size:13px;line-height:1.5"><b>86 of your 118 posts have a feature image and your current
        homepage hides all of them.</b> Gazette leads with them: a magazine cover, a mixed grid and topic tabs
        off your 12 tags.</p>
      <div class="row gap10"><a class="btn coral" href="editor.html">Use this</a><a class="btn secondary" href="editor.html#empty">Skip</a></div>
    </div></div>
    <div class="card"><div class="pad stack gap12">
      <div class="row gap8"><b style="font-size:15px">Aurora + Tangerine</b><span class="badge pro">✦ 3 Pro</span></div>
      <div class="row gap10"><div class="stack gap4 grow"><span class="helper">NOW</span><div class="thumb" style="height:150px"></div></div>
        <div class="stack gap4 grow"><span class="helper">PROPOSED</span><div class="thumb" style="height:150px;background:#F6E7DA"></div></div></div>
      <p style="font-size:13px;line-height:1.5"><b>You have 4,100 members and no signup above the fold.</b>
        Aurora puts the form there, opens with an issue preview, and your posts average nine minutes — so it
        pairs a measured reading layout with an index.</p>
      <div class="row gap10"><a class="btn coral" href="editor.html">Use this</a><a class="btn secondary" href="editor.html#empty">Skip</a></div>
    </div></div>
  </div>
  <div class="row gap12"><a class="btn secondary" href="starter-chooser.html">Show me all ten starters</a>
    <a class="btn ghost" href="editor.html#empty">Start from my site as-is</a>
    <span class="helper" style="margin-left:auto">Everything is reversible from the canvas. You can run this again later
      from <a href="new-project-sheet.html">New project</a>.</span></div>
</div>""", capt='B22 · redesign proposals — 2–3 whole-site combinations, argued from your own data'),
     note='<b>What changed from the frame, and why.</b> B22 drew four per-section swaps. FR-C7 and ruling R-78 make it '
          '<b>2–3 whole-site starter × Style Pack combinations that differ in layout structure</b> — the card, the '
          'NOW / PROPOSED pairing and above all the argued-from-your-own-data sentence are kept, one per combination '
          'instead of one per section. The frame&rsquo;s fourth proposal ("no tag template, so Ghost falls back to a bare '
          'list") is deleted: <span class="mono">tag.hbs</span> always compiles from the Synthesis Defaults on Inflozo, '
          'so the claim is false here.')


# ═══════════════════════════════════════════════════════════════════════════════
# DASHBOARD AND ACCOUNT
# ═══════════════════════════════════════════════════════════════════════════════
def projcard(name, site, status, ver, extra=''):
    badge = {'Live': '<span class="badge live"><span class="dot mint"></span>Live</span>',
             'Failed': '<span class="badge danger"><span class="dot danger"></span>Failed</span>',
             'Never deployed': '<span class="badge neutral">Never deployed</span>'}[status]
    ver_chip = f'<span class="chip mono">{ver}</span>' if ver else ''
    fail = ('<a class="small" href="deploy-failure.html" style="color:var(--danger)">See what failed →</a>'
            if status == 'Failed' else '')
    return f"""<div class="card"><a href="editor.html" style="display:block"><div class="thumb" style="height:130px;border-radius:12px 12px 0 0;border:none"></div></a>
  <div class="pad-tight stack gap8">
    <div class="row gap8"><b style="font-size:14px">{name}</b><span class="soft" style="margin-left:auto">⋯</span></div>
    <div class="row gap8"><span class="helper">{site}</span></div>
    <div class="row gap8">{badge}{ver_chip}{fail}</div>{extra}
  </div></div>"""


UPDATE_NOTICE = """<div id="library-update-notice" style="margin-top:8px;background:var(--marigold-tint);border-radius:var(--r-sm);padding:10px 12px" class="stack gap6">
    <div class="row gap6"><span class="badge pro">✦</span><b style="font-size:12.5px">Updates available</b></div>
    <span class="helper" style="color:var(--marigold-text)">Three designs in this site were improved since you shipped.</span>
    <a class="btn sm secondary" href="library-update-confirm.html" style="align-self:flex-start">Review and redeploy</a></div>"""

DASH_RICH = f"""<div class="stack gap20">
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
    </div>
    <div class="card" style="width:280px;flex-shrink:0"><div class="pad-tight stack gap10">
      <span class="panel-label">What&rsquo;s new</span>
      <div class="stack gap4"><div class="row gap6"><span class="badge pro">✦</span><b style="font-size:12.5px">Style Packs: 4 new font pairings</b></div><span class="helper">Aug 12</span></div>
      <div class="stack gap4"><div class="row gap6"><span class="badge pro">✦</span><b style="font-size:12.5px">Variant Shuffle now works on footers</b></div><span class="helper">Aug 6</span></div>
      <a class="small" href="notifications.html" style="color:var(--sky-text)">Changelog →</a>
    </div></div>
  </div>
</div>"""

CONNECTED_STRIP = """<div class="card"><div class="pad stack gap14">
  <div class="row gap10"><span class="panel-label">Connected sites</span><span class="chip">3 of 10</span>
    <a class="btn sm secondary" href="sites.html#connect-modal" style="margin-left:auto">Connect another</a></div>
  <div class="grid g3">
    <div class="stack gap6" style="padding:12px;border:1px solid var(--line);border-radius:var(--r)">
      <div class="row gap8"><span class="dot mint"></span><b style="font-size:13px">Orbit Weekly</b><span class="badge live" style="margin-left:auto">Live</span></div>
      <span class="helper mono">orbitweekly.com</span>
      <span class="helper">Keys working · Ghost 6.58 · Shipped 14 Aug</span></div>
    <div class="stack gap6" style="padding:12px;border:1px solid var(--line);border-radius:var(--r)">
      <div class="row gap8"><span class="dot danger"></span><b style="font-size:13px">Maya&rsquo;s Studio</b><span class="badge danger" style="margin-left:auto">Deploy failed</span></div>
      <span class="helper mono">mayachen.studio</span>
      <span class="helper">Admin key expired Aug 15</span>
      <a class="small" href="deploy-failure.html" style="color:var(--danger)">See what failed →</a></div>
    <div class="stack gap6" style="padding:12px;border:1px solid var(--line);border-radius:var(--r)">
      <div class="row gap8"><span class="dot sky"></span><b style="font-size:13px">Field Notes</b><span class="badge sky" style="margin-left:auto">Preview-only</span></div>
      <span class="helper mono">fieldnotes.ghost.io</span>
      <span class="helper">Keys working · Ghost(Pro) Starter</span>
      <a class="small" href="preview-only-notice.html" style="color:var(--sky-text)">Why no deploy? →</a></div>
  </div></div></div>"""

ACCOUNT_MENU = """<div class="sheetwrap" style="padding:24px;justify-content:flex-start">
  <div class="card" style="width:260px"><div class="pad-tight stack gap2">
    <div class="row gap10" style="padding:6px 8px 10px"><span class="avatar">M</span>
      <span class="stack"><b style="font-size:13px">Maya Chen</b><span class="helper">maya@orbitweekly.com</span></span></div>
    <div style="height:1px;background:var(--line);margin:2px 0 6px"></div>
    <a class="idxrow" style="border:none;background:transparent" href="billing.html">Account settings</a>
    <a class="idxrow" style="border:none;background:transparent" href="billing.html">Billing &amp; plan<span class="badge pro" style="margin-left:auto">✦ Pro</span></a>
    <a class="idxrow" style="border:none;background:transparent" href="suggestions.html">Suggestions</a>
    <a class="idxrow" style="border:none;background:transparent" href="pricing.html">Docs</a>
    <a class="idxrow" style="border:none;background:transparent" href="editor.html#shortcuts">Keyboard shortcuts<span class="kbd" style="margin-left:auto">?</span></a>
    <div style="height:1px;background:var(--line);margin:6px 0"></div>
    <a class="idxrow" style="border:none;background:transparent" href="sign-in.html">Sign out</a>
  </div></div></div>"""

page('dashboard', 'Dashboard', 'Dashboard and account',
     'S3 Dashboard.dc.html — S3a rich · S3b empty · S3c Free · S3d account menu · '
     'B Missing Surfaces B25 sites strip · B14a update notice',
     '§ IA → Dashboard and account · § State Patterns → Dashboard · J3 step 1 · F4 step 1',
     screen(app('projects', DASH_RICH, right=BELL + NEWPROJ), capt='S3a · dashboard — rich (what&rsquo;s-new open) · 1440')
     + head('Connected Sites Strip', 'Health at a glance, and the count against the plan cap. '
            'Three sites, three health states — the dot colour classifies before a word is read, and each site '
            'carries the same three checks in the same order so they compare down the row.',
            'B25 · connected-sites strip', anchor='connected-sites')
     + screen(f'<div style="padding:24px;background:var(--paper)">{CONNECTED_STRIP}</div>')
     + head('Library Update Notice', 'It lives <b>inside</b> the project card rather than as a badge on it, because it '
            'needs a sentence and a button. Marigold is right: it is a nudge and it never blocks.',
            'B14a · update notice on the project card — flow F4 step 1', anchor='library-update')
     + screen(f'<div style="padding:24px;background:var(--paper);max-width:340px">{projcard("Orbit Weekly", "orbitweekly.com", "Live", "v5", UPDATE_NOTICE)}</div>', cls='detail')
     + head('Account Menu', 'Opens up from the account chip at the foot of the rail.', 'S3d · account menu', anchor='account-menu')
     + screen(ACCOUNT_MENU, cls='detail')
     + head('Empty', 'The canonical string, verbatim, and one affordance. Never an apology.',
            'S3b · dashboard — empty · 1440', anchor='empty')
     + screen(app('projects', """<div style="min-height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center">
  <svg width="120" height="88" viewBox="0 0 120 88" fill="none" stroke="#1C1B1A" stroke-width="1.5">
    <rect x="10" y="14" width="100" height="62" rx="6"/><path d="M10 30h100"/><circle cx="19" cy="22" r="2"/><circle cx="27" cy="22" r="2"/>
    <rect x="22" y="40" width="34" height="24" rx="3" fill="#FFEDE8" stroke="#FF5941"/><path d="M66 44h32M66 52h24M66 60h32"/></svg>
  <div class="stack gap6"><h2 style="font-size:24px">Every great site starts somewhere.</h2>
    <p class="softaa">Yours starts with hundreds of gorgeous sections.</p></div>
  <a class="btn coral lg" href="new-project-sheet.html">New project</a></div>""",
                plan='free', used='0 MB', cap_='used', pct=0, right=BELL + NEWPROJ))
     + head('Free, at the cap', 'One project. The ⋯ menu still offers Rename, Duplicate and Delete — nothing is taken '
            'away. A second project opens the New Project Sheet on its at-the-cap state, with the limit stated.',
            'S3c · dashboard — free plan · 1440', anchor='free')
     + screen(app('projects', f"""<div class="stack gap20">
  <div class="row gap10"><h2 style="font-size:20px">Projects</h2><span class="chip">1 of 1</span></div>
  <div class="grid g3">{projcard('Field Notes', 'fieldnotes.blog', 'Live', 'v1')}
    <a class="card" href="new-project-sheet.html#at-cap" style="border:1px dashed var(--line-strong);box-shadow:none;display:flex;align-items:center;justify-content:center;min-height:230px">
      <div class="stack gap8" style="align-items:center;text-align:center;padding:20px">
        <span class="badge pro">✦</span><b style="font-size:13.5px">Upgrade to add more</b>
        <span class="helper">Free includes 1 project. Pro gives you 25.</span>
        <span class="btn marigold sm">Go Pro — $15/mo</span></div></a></div>
</div>""", plan='free', used='48 MB', cap_='of 100 MB', pct=48, right=BELL + NEWPROJ))
     + head('Loading', 'Skeletons matching the shape that is coming. Never a spinner.', anchor='loading')
     + screen(app('projects', """<div class="stack gap20"><div class="row gap10"><h2 style="font-size:20px">Projects</h2></div>
  <div class="grid g3">""" + ''.join("""<div class="card"><div class="thumb" style="height:130px;border-radius:12px 12px 0 0;border:none"></div>
    <div class="pad-tight stack gap8"><div class="thumb" style="height:12px;width:60%"></div>
      <div class="thumb" style="height:10px;width:40%"></div><div class="thumb" style="height:18px;width:70px;border-radius:24px"></div></div></div>""" for _ in range(6))
                 + '</div></div>', right=BELL + NEWPROJ)),
     subs=[SUB('Account Menu', 'account-menu', 'S3d'),
           SUB('Connected Sites Strip', 'connected-sites', 'B25'),
           SUB('Library Update Notice', 'library-update', 'B14a'),
           SUB('Dashboard — empty', 'empty', 'S3b'),
           SUB('Dashboard — Free at the cap', 'free', 'S3c'),
           SUB('Dashboard — loading', 'loading', 'skeletons')])


page('new-project-sheet', 'New Project Sheet', 'Dashboard and account',
     'Extrapolated → Appendix A prompt A4, frames D4a and D4b. Inherits S3 Dashboard (shell, cards), '
     'S2 Onboarding S2a (the radio-card doors) and B23a (the starter grid)',
     '§ IA → Dashboard and account · FR-B2 · § State Patterns → Dashboard refusal',
     screen(f"""<div class="sheetwrap"><div class="sheet"><div class="head">
    <h2 style="font-size:22px">New project</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">Four ways in. You can change everything afterwards.</p></div>
  <div class="body">
    <a class="radiocard on" href="starter-chooser.html"><span class="radio on"></span>
      <span class="stack"><span class="t">Start from a starter</span><span class="c">Ten full sites, ready to wear your brand.</span></span></a>
    <a class="radiocard" href="editor.html#empty"><span class="radio"></span>
      <span class="stack"><span class="t">Blank canvas</span><span class="c">An empty page and every design.</span></span></a>
    <div class="radiocard"><span class="radio"></span>
      <span class="stack grow"><span class="t">Duplicate an existing project</span>
        <span class="c">Everything copies except the deploy history.</span>
        <span class="row gap8" style="margin-top:8px"><span class="input" style="max-width:280px;display:flex;align-items:center">Orbit Weekly</span>{ICON['caret']}</span></span></div>
    <a class="radiocard" href="redesign-proposals.html"><span class="radio"></span>
      <span class="stack"><span class="t">Redesign one of my sites</span>
        <span class="c">We look at your posts and suggest whole-site designs.</span></span></a>
    <div style="height:1px;background:var(--line-faint)"></div>
    <div class="row gap12"><span class="control-label">Style Pack</span>
      <span class="row gap8"><span class="thumb" style="width:44px;height:32px;display:flex;align-items:center;justify-content:center;font-family:var(--serif)">Ag</span><b style="font-size:13px">Paper</b></span>
      <span class="helper" style="margin-left:auto">Change it any time from the editor.</span></div>
  </div>
  <div class="foot"><a class="btn secondary" href="dashboard.html">Cancel</a>
    <a class="btn coral" href="editor.html">Create project</a></div></div></div>""",
            capt='D4a · new project sheet, over a dimmed dashboard · 1440')
     + head('At the cap, on Free', 'The four doors are still drawn and are <b>greyed with the reason</b>, not hidden — '
            'they exist here and cannot act now. Nothing is deleted and nothing is concealed.',
            'D4b · new project · Free, at the cap · 720', anchor='at-cap')
     + screen("""<div class="sheetwrap"><div class="sheet"><div class="head"><h2 style="font-size:20px">New project</h2></div>
  <div class="body greyed">
    <div class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Start from a starter</span><span class="c">Ten full sites, ready to wear your brand.</span></span></div>
    <div class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Blank canvas</span><span class="c">An empty page and every design.</span></span></div>
    <div class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Duplicate an existing project</span><span class="c">Everything copies except the deploy history.</span></span></div>
    <div class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Redesign one of my sites</span><span class="c">We look at your posts and suggest whole-site designs.</span></span></div>
    <p class="reason">You already have the one project the Free plan includes. Upgrade, or delete the one you have.</p>
  </div>
  <div class="foot" style="background:var(--marigold-tint)"><div class="stack gap2 grow">
      <b style="font-size:13px">Free includes 1 project. Pro gives you 25.</b>
      <span class="helper" style="color:var(--marigold-text)">Your existing project keeps working exactly as it is.</span></div>
    <a class="btn secondary" href="dashboard.html#free">Not now</a>
    <a class="btn marigold" href="upgrade-sheet.html">Go Pro — $15/mo</a></div></div></div>""", cls='detail')
     + head('Where &ldquo;Redesign one of my sites&rdquo; greys, and why it is greyed rather than absent',
            'It could do something here once a site is connected, so it is <b>could-but-not-now</b> — greyed, with the '
            'reason in the helper slot. A control that could <i>never</i> act on this surface would be absent instead, '
            'with the panel saying why. The two mean different things and a user must be able to tell them apart '
            '(rulings R-33, R-68).', 'P0-0 Greyed Control Pattern', anchor='no-site')
     + screen("""<div style="padding:24px;background:var(--paper);max-width:520px;margin:0 auto">
  <div class="radiocard greyed"><span class="radio"></span><span class="stack">
    <span class="t">Redesign one of my sites</span><span class="c">We look at your posts and suggest whole-site designs.</span>
    <span class="reason" style="margin-top:6px">Connect a Ghost site first.</span></span></div></div>""", cls='tiny'),
     subs=[SUB('New Project · at the Free cap', 'at-cap', 'D4b'),
           SUB('Greyed door, with its reason', 'no-site', 'P0-0')])

page('notifications', 'Notifications', 'Dashboard and account',
     'S3 Dashboard.dc.html S3e · B Missing Surfaces.dc.html B21',
     '§ IA → Dashboard and account · § State Patterns → Notifications · FR-B7 · F6 (the one nudge)',
     screen(app('projects', """<div class="card" style="max-width:640px"><div class="pad stack gap4">
  <div class="row gap10" style="padding-bottom:8px"><span class="panel-label">Notifications</span>
    <a class="small soft" style="margin-left:auto" href="notifications.html">Mark all read</a></div>
  <div class="row gap10" style="padding:12px;background:var(--coral-tint);border-radius:var(--r-sm);align-items:flex-start">
    <span class="dot coral" style="margin-top:6px"></span>
    <span class="stack gap2 grow"><span style="font-size:13px"><b>Orbit Weekly is live.</b> Your site just got gorgeous.</span>
      <span class="helper">14 minutes ago · shipped by you</span></span></div>
  <div class="row gap10" style="padding:12px;align-items:flex-start"><span class="dot grey" style="margin-top:6px"></span>
    <span class="stack gap2 grow"><span style="font-size:13px"><b>Deploy failed on Maya&rsquo;s Studio.</b> Ghost said no — your Admin key expired.</span>
      <span class="helper">Yesterday, 18:02</span>
      <a class="small" href="deploy-failure.html" style="color:var(--danger)">See what failed →</a></span></div>
  <div class="row gap10" style="padding:12px;align-items:flex-start"><span class="dot grey" style="margin-top:6px"></span>
    <span class="stack gap2 grow"><span style="font-size:13px"><b>Three designs in Orbit Weekly were improved.</b> Redeploy when you are ready.</span>
      <span class="helper">2 days ago</span><a class="small" href="library-update-confirm.html" style="color:var(--sky-text)">Review →</a></span></div>
  <div class="row gap10" style="padding:12px;align-items:flex-start"><span class="dot grey" style="margin-top:6px"></span>
    <span class="stack gap2 grow"><span style="font-size:13px"><b>One step left on Orbit Weekly.</b> Three templates shipped that a Ghost page still has to point at.</span>
      <span class="helper">2 days ago · raised once, and never again</span>
      <a class="small" href="template-binding-checklist.html" style="color:var(--sky-text)">Open the checklist →</a></span></div>
  <div class="row gap10" style="padding:12px;align-items:flex-start"><span class="dot grey" style="margin-top:6px"></span>
    <span class="stack gap2 grow"><span style="font-size:13px"><b>Ghost card designs are here.</b> Every editor card is yours to style.</span>
      <span class="helper">Last week · what&rsquo;s new</span></span></div>
  <div class="row gap10" style="padding:12px;align-items:flex-start"><span class="dot grey" style="margin-top:6px"></span>
    <span class="stack gap2 grow"><span style="font-size:13px"><b>Dai took over editing on The Quiet Web.</b></span>
      <span class="helper">Last week</span><a class="small" href="edit-lock.html" style="color:var(--sky-text)">What happened →</a></span></div>
  <p class="helper" style="padding:10px 12px 0;border-top:1px solid var(--line-faint)">Deploy outcomes always land here, even if you closed the tab.</p>
</div></div>""", right=BELL + NEWPROJ), capt='S3e + B21 · notifications — opens under the bell')
     + head('Empty', '', anchor='empty')
     + screen("""<div style="padding:40px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:460px"><div class="pad stack gap10" style="align-items:center;text-align:center">
    <svg width="90" height="70" viewBox="0 0 90 70" fill="none" stroke="#1C1B1A" stroke-width="1.5">
      <path d="M25 30a20 20 0 0 1 40 0c0 20 8 24 8 24H17s8-4 8-24"/><path d="M39 58a6 6 0 0 0 12 0"/>
      <circle cx="66" cy="20" r="6" fill="#FFEDE8" stroke="#FF5941"/></svg>
    <b style="font-size:15px">Nothing yet.</b>
    <span class="helper">Deploy outcomes land here even if you closed the tab.</span></div></div></div>""", cls='narrow'),
     subs=[SUB('Notifications — empty', 'empty', 'S3e')])


def sitecard(name, url, status, meta, action='', dot='mint', badge_cls='live'):
    return f"""<div class="card"><div class="pad row gap14" style="align-items:flex-start">
  <span class="avatar" style="background:#3B382F">{name[0]}</span>
  <div class="stack gap6 grow"><div class="row gap8"><b style="font-size:14px">{name}</b>
      <span class="badge {badge_cls}"><span class="dot {dot}"></span>{status}</span></div>
    <span class="helper mono">{url}</span><span class="helper">{meta}</span>{action}</div>
  <a class="soft" href="manage-keys.html">⋯</a></div></div>"""


page('sites', 'Sites', 'Dashboard and account',
     'S11 Sites.dc.html — S11a with the ⋯ menu · S11b connect modal · S11c Free',
     '§ IA → Dashboard and account · § State Patterns → Sites · J4 step 7',
     screen(app('sites', f"""<div class="stack gap16">
  <div class="row gap10"><h2 style="font-size:20px">Sites</h2><span class="chip">3 of 10</span>
    <a class="btn coral" href="sites.html#connect-modal" style="margin-left:auto">{ICON['plus']}Connect site</a></div>
  {sitecard('Orbit Weekly', 'orbitweekly.com', 'Connected', 'Ghost 6.58 · 2 projects · checked 2 minutes ago')}
  {sitecard('Maya&rsquo;s Studio', 'mayachen.studio', 'Reconnect needed',
            'Ghost 5.130 · 1 project · Admin key expired Aug 15',
            '<a class="btn sm secondary" href="manage-keys.html" style="align-self:flex-start;margin-top:4px">Reconnect</a>',
            dot='danger', badge_cls='danger')}
  {sitecard('Field Notes', 'fieldnotes.ghost.io', 'Preview-only',
            'Ghost(Pro) Starter · 1 project · keys working',
            '<a class="small" href="preview-only-notice.html" style="color:var(--sky-text)">What Preview-only means, and what clears it →</a>',
            dot='sky', badge_cls='sky')}
</div>""", right=BELL, search='Search sites…'), capt='S11a · sites &amp; connections · 1440')
     + head('The ⋯ menu', '', 'S11a · ⋯ menu open', anchor='menu')
     + screen("""<div class="sheetwrap" style="padding:24px;justify-content:flex-start"><div class="card" style="width:240px">
  <div class="pad-tight stack gap2">
    <a class="idxrow" style="border:none;background:transparent" href="sites.html">Re-check connection</a>
    <a class="idxrow" style="border:none;background:transparent" href="manage-keys.html">Reconnect</a>
    <a class="idxrow" style="border:none;background:transparent" href="manage-keys.html">Manage keys</a>
    <a class="idxrow" style="border:none;background:transparent" href="routes-fallback.html">Upload routes by hand</a>
    <div style="height:1px;background:var(--line);margin:6px 0"></div>
    <a class="idxrow" style="border:none;background:transparent;color:var(--danger)" href="sites.html#disconnect">Disconnect</a>
  </div></div></div>""", cls='tiny')
     + head('Checking', 'The health check runs daily and on demand. <b>The pending state lives on the badge and nowhere '
            'else</b> — the card stays readable while it runs.', anchor='checking')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:520px"><div class="pad row gap14" style="align-items:flex-start">
    <span class="avatar" style="background:#3B382F">O</span>
    <div class="stack gap6 grow"><div class="row gap8"><b style="font-size:14px">Orbit Weekly</b>
        <span class="badge neutral"><span class="dot grey"></span>Checking…</span></div>
      <span class="helper mono">orbitweekly.com</span>
      <span class="helper">Ghost 6.58 · 2 projects</span></div></div></div></div>""", cls='detail')
     + head('Connect Site Modal', 'S2&rsquo;s two connect steps, run as a modal.', 'S11b · connect site — the modal', anchor='connect-modal')
     + screen("""<div class="sheetwrap"><div class="sheet"><div class="head">
    <div class="row gap10"><h2 style="font-size:20px">Connect your Ghost site</h2><span class="chip" style="margin-left:auto">1/2</span></div>
    <p class="softaa" style="font-size:13px;margin-top:4px">Same quick handshake as onboarding.</p></div>
  <div class="body"><div class="row gap24" style="align-items:flex-start">
    <ol class="stack gap12 grow" style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.5">
      <li>Open <b>Ghost Admin → Settings → Integrations</b></li>
      <li>Click <b>Add custom integration</b></li>
      <li>Name it <b>Inflozo</b> and save — it shows an API URL and two keys</li></ol>
    <div class="thumb" style="width:280px;height:180px;display:flex;align-items:center;justify-content:center;padding:16px">
      <span class="helper" style="text-align:center">screenshot: Ghost Admin → Settings → Integrations</span></div></div></div>
  <div class="foot"><a class="btn secondary" href="sites.html">Cancel</a>
    <a class="btn coral" href="connect-keys.html">Done — next</a></div></div></div>""")
     + head('Disconnecting', 'A site&rsquo;s <b>pre-Inflozo snapshot is bound to the site record, not to the URL</b>, so it '
            'survives disconnect, reconnect and project deletion. The backup gate re-fires on reconnect, because '
            'consent is per site and this is a new one as far as consent goes.', anchor='disconnect')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Disconnect Field Notes?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Inflozo stops talking to fieldnotes.ghost.io. <b>The site
    itself is untouched</b> — the theme we shipped stays live and keeps serving readers. Your projects for it become
    preview-only until you reconnect.</p>
  <div class="banner info"><span class="ico">ⓘ</span><span>We keep this site&rsquo;s original theme archive. It is bound to the
    site, not the address, so reconnecting later finds it again.</span></div></div>
  <div class="foot"><a class="btn secondary" href="sites.html">Cancel</a><a class="btn danger-out" href="sites.html">Disconnect</a></div>
  </div></div>""", cls='narrow')
     + head('Sites with none', 'The connect card as the whole page.', 'S11 · empty', anchor='empty')
     + screen(app('sites', """<div style="min-height:380px;display:flex;align-items:center;justify-content:center">
  <div class="card" style="max-width:460px"><div class="pad stack gap12" style="align-items:center;text-align:center">
    <svg width="96" height="72" viewBox="0 0 96 72" fill="none" stroke="#1C1B1A" stroke-width="1.5">
      <circle cx="34" cy="36" r="22"/><path d="M12 36h44M34 14a30 30 0 0 1 0 44M34 14a30 30 0 0 0 0 44"/>
      <path d="M62 36h20" stroke="#FF5941"/><path d="M74 28l8 8-8 8" stroke="#FF5941"/></svg>
    <b style="font-size:16px">No Ghost site connected yet.</b>
    <span class="helper">Connect one and every canvas fills with your real posts, authors and tags.</span>
    <a class="btn coral" href="connect-integration.html">Connect a Ghost site</a></div></div></div>""",
                plan='free', used='0 MB', cap_='used', pct=0, right=BELL, search='Search sites…'))
     + head('Free, at one site', 'S11c&rsquo;s ghost slot. The frame says Pro connects up to 3; <b>Appendix F.1 says 10 and '
            'governs</b> — EXPERIENCE.md § Plan limits.', 'S11c · free plan — one site + upgrade ghost slot', anchor='free')
     + screen(app('sites', f"""<div class="stack gap16">
  <div class="row gap10"><h2 style="font-size:20px">Sites</h2><span class="chip">1 of 1</span></div>
  {sitecard('Field Notes', 'fieldnotes.blog', 'Connected', 'Ghost 6.58 · 1 project · checked 1 hour ago')}
  <div class="card" style="border:1px dashed var(--line-strong);box-shadow:none"><div class="pad row gap12">
    <span class="badge pro">✦</span><div class="stack gap2 grow"><b style="font-size:13.5px">Upgrade to connect more</b>
      <span class="helper">Free includes 1 site. Pro connects up to 10.</span></div>
    <a class="btn marigold sm" href="upgrade-sheet.html">Go Pro — $15/mo</a></div></div>
</div>""", plan='free', used='48 MB', cap_='of 100 MB', pct=48, right=BELL, search='Search sites…')),
     subs=[SUB('Sites — checking', 'checking', ''),
           SUB('Connect Site Modal', 'connect-modal', 'S11b'),
           SUB('Site ⋯ menu', 'menu', 'S11a'),
           SUB('Disconnect', 'disconnect', ''),
           SUB('Sites — empty', 'empty', ''),
           SUB('Sites — Free at one site', 'free', 'S11c')])

page('manage-keys', 'Manage Keys', 'Dashboard and account',
     'S11 Sites.dc.html S11d + B Missing Surfaces.dc.html B20 — both re-specified (FR-C8)',
     '§ IA → Dashboard and account · § wrong mechanism → B20 / S11d · § State Patterns → partially credentialed',
     screen("""<div class="sheetwrap"><div class="sheet"><div class="head">
    <h2 style="font-size:20px">Keys — Orbit Weekly</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">From the Inflozo integration in your Ghost admin.
      We never see your Ghost password. <b>Three credentials, and each one buys something different.</b></p></div>
  <div class="body">
    <div class="itemrow"><span class="dot mint"></span><div class="stack gap4 grow">
        <div class="row gap8"><b style="font-size:13.5px">Admin API key</b><span class="badge live">Present</span></div>
        <span class="helper mono">6a4f2e91b7c8d3 ·············· 4e2a</span>
        <span class="helper">Uploads and activates your theme. This is the one that ships your site.</span></div>
      <a class="btn sm secondary" href="manage-keys.html">Replace</a></div>
    <div class="itemrow"><span class="dot mint"></span><div class="stack gap4 grow">
        <div class="row gap8"><b style="font-size:13.5px">Content API key</b><span class="badge live">Present</span></div>
        <span class="helper mono">c19d7f ·············· 8b31</span>
        <span class="helper">Reads your posts, pages, tags and authors, so the canvas shows your real content.</span></div>
      <a class="btn sm secondary" href="manage-keys.html">Replace</a></div>
    <div class="itemrow"><span class="dot grey"></span><div class="stack gap4 grow">
        <div class="row gap8"><b style="font-size:13.5px">Staff Access Token</b><span class="badge neutral">Not added</span></div>
        <span class="helper">Without it: no copy of your current theme before we replace it, no check that the live theme
          changed since we last shipped, and <span class="mono">routes.yaml</span> uploads by hand.</span>
        <span class="helper">It is a full-Administrator credential and <b>can only be created on the site Owner&rsquo;s own
          account</b>. Adding it enables the snapshot <b>from that point forward</b> — it cannot reconstruct a copy of a
          theme that has already been replaced, and we will not pretend otherwise.</span></div>
      <a class="btn secondary" href="staff-token-offer.html">Add the token</a></div>
    <div class="banner info"><span class="ico">ⓘ</span><span><b>There is no permission to grant here.</b>
      Ghost fixes what a Custom Integration token may do, and reading a theme or writing settings is not on that list on
      any version or any host. The missing capability is the token, not a scope.</span></div>
    <div class="stack gap6"><span class="control-label">Site URL</span>
      <span class="chip mono" style="align-self:flex-start;padding:6px 10px">https://orbitweekly.com</span>
      <span class="helper">Permanent for this connection. Moving to a new domain is a disconnect and a reconnect —
        so there is no field here to edit, rather than a field that refuses.</span></div>
  </div>
  <div class="foot"><a class="btn secondary" href="sites.html">Done</a>
    <a class="btn ghost" href="manage-keys.html">Test connection</a>
    <span class="helper" style="margin-left:auto">Passed · 2 min ago</span></div></div></div>""",
            capt='S11d + B20 · manage keys — three credentials, present or absent with what each enables'),
     note='<b>Three things the frames got wrong, corrected here.</b> B20 invents grantable scopes — Ghost fixes them and '
          'they cannot be granted. S11d draws the API URL as an editable field — the site URL is immutable, so the '
          'affordance is <b>absent</b> rather than present-and-refusing. And both draw two credentials where FR-C8 needs '
          'three, with the Staff Access Token addable and removable at any time.')


page('assets', 'Assets', 'Dashboard and account',
     'S10 Assets.dc.html — S10a library · S10b drop zone · S10c delete-in-use · S10d details. '
     'Drop zone gains its keyboard path per Appendix A prompt A8 frame D8d',
     '§ IA → Dashboard and account · § State Patterns → Assets · § Accessibility Floor → keyboard completeness · J4 step 8',
     screen(app('assets', """<div class="stack gap16">
  <div class="row gap10"><h2 style="font-size:20px">Assets</h2><span class="chip">48 files · 312 MB of 5 GB</span>
    <a class="btn coral" style="margin-left:auto" href="assets.html#drop">Upload</a></div>
  <div class="row gap8"><span class="seg"><span class="on">All · 48</span><span>Photos</span><span>Logos</span><span>Illustrations</span></span>
    <span class="seg" style="margin-left:auto"><span class="on">Newest</span><span>Largest</span></span></div>
  <div class="grid g5">""" + ''.join(f"""<a class="card" href="assets.html#details"><div class="thumb" style="height:110px;border-radius:12px 12px 0 0;border:none"></div>
    <div class="pad-tight stack gap4"><b style="font-size:12.5px">{n}</b><span class="helper">{s}</span></div></a>"""
    for n, s in [('hero-shot.jpg', '380 KB · used in 3 projects'), ('orbit-wordmark.svg', '4 KB · used in 2'),
                 ('issue-47-cover.jpg', '410 KB'), ('maya-portrait.jpg', '220 KB'), ('blogrolls.jpg', '360 KB'),
                 ('quiet-software.jpg', '298 KB'), ('archive-1998.png', '512 KB'), ('field-notes-mark.svg', '3 KB'),
                 ('lisbon-desk.jpg', '440 KB'), ('renewal-chart.png', '180 KB')]) + """</div>
  <div class="row gap10" style="background:var(--ink);color:var(--surface);border-radius:var(--r-pill);padding:8px 16px;align-self:center">
    <span style="font-size:12.5px">Optimized: <span class="mono">4.2 MB → 380 KB</span></span>
    <a href="assets.html#details" style="color:var(--surface);text-decoration:underline">View</a></div>
</div>""", right=BELL, search='Search assets…'), capt='S10a · asset library · 1440')
     + head('The drop zone, and its keyboard path',
            'A drag-and-drop-only upload has no keyboard path at all, so the zone is <b>also a file input with a '
            'visible &ldquo;Choose files&rdquo; button</b>. And the size line is corrected: the frame reads &ldquo;up to '
            '30 MB each&rdquo;; Appendix F.1 caps uploads at <b>10 MB per file on both plans</b>.',
            'S10b + D8d · drag-over — full-surface drop zone', anchor='drop')
     + screen("""<div style="padding:40px;background:var(--paper)">
  <div style="border:2px dashed var(--coral);border-radius:var(--r-lg);background:var(--coral-tint);padding:56px;display:flex;flex-direction:column;align-items:center;gap:14px">
    <b style="font-size:18px;font-family:var(--display)">Drop images — we&rsquo;ll optimize them ✨</b>
    <a class="btn secondary" href="assets.html">Choose files</a>
    <span class="helper">JPG, PNG, SVG or WebP · up to 10 MB each</span></div></div>""", cls='detail')
     + head('Per-file progress, with a real byte count', 'Skeletons and progress bars, never a spinner.', anchor='uploading')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;flex-direction:column;gap:12px">
  <div class="card"><div class="pad-tight stack gap6"><div class="row gap8"><b style="font-size:13px">issue-48-cover.jpg</b>
      <span class="helper mono" style="margin-left:auto">1.4 of 3.1 MB</span></div>
    <div class="progress"><div class="bar" style="width:45%"></div></div></div></div>
  <div class="card"><div class="pad-tight stack gap6"><div class="row gap8"><b style="font-size:13px">desk-2026.jpg</b>
      <span class="helper mono" style="margin-left:auto">queued</span></div>
    <div class="progress"><div class="bar" style="width:0"></div></div></div></div></div>""", cls='detail')
     + head('Over quota', 'The library goes <b>read-only</b>: existing files stay, uploads are blocked, until the user '
            'deletes below the cap. Nothing is deleted by Inflozo, on any path.',
            'S10 · over quota — J4 step 8', anchor='over-quota')
     + screen(app('assets', """<div class="stack gap16">
  <div class="banner error"><span class="ico">!</span><span><b>312 MB of the 100 MB the Free plan includes.</b>
    Your files are all still here and nothing will be deleted. Uploads are paused until you are back under 100 MB —
    or go Pro, which lifts it to 5 GB.</span></div>
  <div class="row gap10"><h2 style="font-size:20px">Assets</h2><span class="badge danger">Uploads paused</span>
    <span class="btn coral off" style="margin-left:auto">Upload</span></div>
  <p class="reason">Uploading is paused while you are over the storage limit.</p>
  <div class="grid g5">""" + ''.join("""<div class="card"><div class="thumb" style="height:110px;border-radius:12px 12px 0 0;border:none"></div>
    <div class="pad-tight stack gap4"><b style="font-size:12.5px">hero-shot.jpg</b><span class="helper">380 KB</span></div></div>""" for _ in range(5)) + """</div>
</div>""", plan='free', used='312 MB', cap_='of 100 MB', pct=100, over=True, right=BELL, search='Search assets…'))
     + head('Delete in use', 'Serious voice, and it names every place the image is used.', 'S10c · delete-in-use', anchor='delete')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Delete hero-shot.jpg?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">This image is used in 3 projects. Those spots will show an
    empty placeholder until you replace it. This can&rsquo;t be undone.</p>
  <div class="stack gap8">
    <div class="row gap8"><span class="avatar" style="width:22px;height:22px;font-size:10px">O</span><b style="font-size:12.5px">Orbit Weekly</b><span class="helper">Hero · Post Header</span></div>
    <div class="row gap8"><span class="avatar" style="width:22px;height:22px;font-size:10px">O</span><b style="font-size:12.5px">Launch page</b><span class="helper">Hero</span></div>
    <div class="row gap8"><span class="avatar sam" style="width:22px;height:22px;font-size:10px">F</span><b style="font-size:12.5px">Field Notes</b><span class="helper">Newsletter</span></div>
  </div></div>
  <div class="foot"><a class="btn secondary" href="assets.html" style="box-shadow:var(--focus)">Cancel</a>
    <a class="btn danger" href="assets.html">Delete image</a>
    <span class="helper" style="margin-left:auto">Focus opens on Cancel — the rule for every irreversible confirm.</span></div>
  </div></div>""", cls='narrow')
     + head('Image details', '', 'S10d · image details', anchor='details')
     + screen("""<div class="sheetwrap"><div class="sheet"><div class="body row gap24" style="align-items:flex-start">
  <div class="thumb" style="width:300px;height:200px"></div>
  <div class="stack gap12 grow"><h2 style="font-size:18px">hero-shot.jpg</h2>
    <div class="grid g2 gap12">
      <div class="stack gap2"><span class="control-label soft">Format</span><b style="font-size:13px">WebP</b><span class="helper">optimized from JPG</span></div>
      <div class="stack gap2"><span class="control-label soft">Size</span><b style="font-size:13px">380 KB</b><span class="helper">from 4.2 MB</span></div>
      <div class="stack gap2"><span class="control-label soft">Dimensions</span><b style="font-size:13px">2400 × 1600</b></div>
      <div class="stack gap2"><span class="control-label soft">Uploaded</span><b style="font-size:13px">Aug 12, 2026</b><span class="helper">by Maya</span></div>
    </div>
    <div class="row gap8"><a class="btn sm secondary" href="assets.html">Copy URL</a>
      <a class="btn sm secondary" href="assets.html">Download</a>
      <a class="btn sm secondary" href="assets.html">Replace</a>
      <a class="btn sm danger-out" href="assets.html#delete">Delete</a></div>
  </div></div></div></div>"""),
     subs=[SUB('Drop zone (+ keyboard path)', 'drop', 'S10b · D8d'),
           SUB('Uploading', 'uploading', ''),
           SUB('Assets — over quota', 'over-quota', 'J4 step 8'),
           SUB('Delete in use', 'delete', 'S10c'),
           SUB('Image details', 'details', 'S10d')])


page('billing', 'Billing', 'Dashboard and account',
     'S12 Billing.dc.html — S12a plan · S12c delete account · S12d invoices. '
     'Every limit shown is Appendix F.1&rsquo;s, which governs over the frame',
     '§ IA → Dashboard and account · § Plan limits · J4 step 3',
     screen(app('projects', f"""<div class="stack gap16" style="max-width:760px">
  <h2 style="font-size:22px">Account &amp; Billing</h2>
  <div class="card"><div class="pad stack gap14">
    <div class="row gap12"><span class="avatar">M</span>
      <div class="stack gap2 grow"><div class="row gap8"><b style="font-size:15px">Pro</b><span class="badge live">✦ Active</span></div>
        <span class="helper">Renews Sep 17, 2026 · $15/mo</span></div>
      <span style="font-family:var(--display);font-size:24px;font-weight:700">$15<span class="soft" style="font-size:13px">/mo</span></span></div>
    <div style="height:1px;background:var(--line-faint)"></div>
    <div class="grid g4 gap12">
      <div class="stack gap2"><span class="control-label soft">Projects</span><b class="mono">6 of 25</b></div>
      <div class="stack gap2"><span class="control-label soft">Connected sites</span><b class="mono">2 of 10</b></div>
      <div class="stack gap2"><span class="control-label soft">Asset storage</span><b class="mono">312 MB of 5 GB</b></div>
      <div class="stack gap2"><span class="control-label soft">Deploy history</span><b class="mono">last 10 per project</b></div>
    </div>
    <div class="row gap10"><a class="btn secondary" href="billing.html">Manage in Dodo portal</a>
      <a class="btn ghost" href="billing.html#cancel">Cancel plan</a>
      <span class="helper" style="margin-left:auto">Cancelling always takes three clicks or fewer. No retention screens.</span></div>
  </div></div>
  <div class="card"><div class="pad row gap12"><div class="stack gap2 grow"><b style="font-size:13.5px">Invoices</b>
      <span class="helper">Monthly receipts from Dodo</span></div>
    <a class="btn sm secondary" href="billing.html#invoices">View invoices</a></div></div>
  <div class="card"><div class="pad stack gap12">
    <b style="font-size:13.5px">Email</b>
    <div class="row gap10"><span class="mono" style="font-size:13px">maya@orbitweekly.com</span>
      <span class="helper">Magic links land here</span>
      <a class="btn sm secondary" style="margin-left:auto" href="billing.html">Change email</a></div>
    <div style="height:1px;background:var(--line-faint)"></div>
    <b style="font-size:13.5px">Passkeys</b>
    <div class="stack gap8">
      <div class="row gap10"><span style="font-size:13px">MacBook Pro — Touch ID</span><span class="helper">added Aug 2, 2026</span>
        <a class="small soft" style="margin-left:auto" href="billing.html">Remove</a></div>
      <div class="row gap10"><span style="font-size:13px">iPhone — Face ID</span><span class="helper">added Aug 3, 2026</span>
        <a class="small soft" style="margin-left:auto" href="billing.html">Remove</a></div></div>
    <a class="btn sm secondary" href="billing.html" style="align-self:flex-start">Add a passkey</a>
    <div style="height:1px;background:var(--line-faint)"></div>
    <b style="font-size:13.5px">Autosave</b>
    <div class="row gap10"><span class="toggle on"></span><div class="stack gap2 grow">
        <span style="font-size:13px">Sync to the cloud every three minutes</span>
        <span class="helper">Turning this off means your work stays on this device until you press ⌘S, close the tab or
          ship. If the device is lost, so is that work.</span></div></div>
  </div></div>
  <div class="card" style="border-color:var(--danger)"><div class="pad stack gap10">
    <b style="font-size:13.5px;color:var(--danger)">Danger zone</b>
    <div class="row gap12"><div class="stack gap2 grow"><b style="font-size:13px">Delete account</b>
        <span class="helper">Removes every project, version and asset. Your live Ghost sites stay up — we never touch them.</span></div>
      <a class="btn danger-out" href="billing.html#delete">Delete account</a></div></div></div>
</div>""", right=BELL + NEWPROJ), capt='S12a · account &amp; billing — Pro · 1440')
     + head('The limits, plainly', 'Appendix F.1 is the sole definition of Free/Pro gating, and the frames disagree with '
            'it in four places — S11c&rsquo;s &ldquo;3 sites&rdquo;, S12a&rsquo;s &ldquo;unlimited projects&rdquo;, '
            'S12b and M5&rsquo;s &ldquo;last 2 versions&rdquo;, S10b&rsquo;s &ldquo;30 MB&rdquo;. <b>F.1 governs every one '
            'of them.</b> These are product limits, so they are shown rather than implied.', anchor='limits')
     + screen('<div style="padding:24px;background:var(--surface)">' + limits_table() + '</div>')
     + head('Invoices', '', 'S12d · invoices', anchor='invoices')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Invoices</h2></div>
  <div class="body stack gap2">""" + ''.join(f"""<div class="row gap10" style="padding:9px 0;border-bottom:1px solid var(--line-faint)">
    <span style="font-size:13px">{d}</span><span class="helper">Pro · monthly</span>
    <span class="mono" style="margin-left:auto;font-size:13px">$15.00</span><a class="small" href="billing.html">PDF</a></div>"""
    for d in ['Aug 17, 2026', 'Jul 17, 2026', 'Jun 17, 2026', 'May 17, 2026', 'Apr 17, 2026']) + """
  <p class="helper" style="padding-top:10px">Need older ones? <a href="billing.html">Open the Dodo portal ↗</a></p></div>
  <div class="foot"><a class="btn secondary" href="billing.html">Close</a></div></div></div>""", cls='narrow')
     + head('Delete Account', 'Typed confirm, serious voice, and no wit anywhere near it.', 'S12c · delete account', anchor='delete')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Delete your account?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">All 6 projects, their full version history and 48 assets
    will be permanently deleted. <b>Your live Ghost sites stay online.</b> This cannot be undone.</p>
  <label class="field"><span class="control-label">Type <b class="mono">delete my account</b> to confirm</span>
    <input class="input mono" aria-label="Type delete my account to confirm" placeholder="delete my account"></label></div>
  <div class="foot"><a class="btn secondary" href="billing.html" style="box-shadow:var(--focus)">Cancel</a>
    <a class="btn danger off" href="billing.html">Delete account</a></div></div></div>""", cls='narrow')
     + head('Cancelling', 'No refunds and no mid-cycle cancellation (Appendix F.2). Access continues to the end of the '
            'paid period and then downgrades to Free — which is where the '
            '<a href="over-limit-sheet.html">Over-Limit Sheet</a> takes over.', anchor='cancel')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Cancel Pro?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Auto-renew stops. <b>You keep Pro until Sep 17, 2026</b>,
    the end of the period you have paid for, and then the account becomes Free.</p>
  <p style="font-size:13px;line-height:1.55">Nothing is deleted at that point, on any path. If you are over the Free
    limits we will show you exactly what is over and by how much, and you decide what changes.</p></div>
  <div class="foot"><a class="btn secondary" href="billing.html" style="box-shadow:var(--focus)">Keep Pro</a>
    <a class="btn danger-out" href="billing.html">Cancel Pro</a></div></div></div>""", cls='narrow'),
     subs=[SUB('The limits, plainly', 'limits', 'Appendix F.1'),
           SUB('Invoices', 'invoices', 'S12d'),
           SUB('Delete Account', 'delete', 'S12c'),
           SUB('Cancel plan', 'cancel', 'Appendix F.2')])

page('upgrade-sheet', 'Upgrade Sheet', 'Dashboard and account',
     'S12 Billing.dc.html — S12b, used app-wide. Its limit column corrected to Appendix F.1',
     '§ IA → Dashboard and account · § Plan limits · J3 step 5b',
     screen("""<div class="sheetwrap"><div class="sheet"><div class="head" style="text-align:center">
    <span class="badge pro">✦</span>
    <h2 style="font-size:24px;margin-top:8px">Everything, unlocked.</h2></div>
  <div class="body">
    <div class="row gap10" style="justify-content:center">
      <span class="seg"><span>Monthly</span><span class="on">Yearly</span></span>
      <span class="badge notice">$150/yr — 2 months free</span></div>
    """ + limits_table(note=False) + """
    <div class="banner info"><span class="ico">ⓘ</span><span>Every design is on your canvas on both plans. Pro is about the
      <b>exits</b> — deploying, exporting and the compiled theme code.</span></div>
  </div>
  <div class="foot" style="justify-content:center;flex-direction:column;gap:8px">
    <a class="btn coral lg" href="deploy-destination.html" style="width:280px">Go Pro — $15/mo</a>
    <span class="helper">Cancel anytime · Taxes handled · Powered by Dodo</span>
    <span class="helper">Yearly is pre-selected and monthly is one click away. Both prices are always shown.</span>
  </div></div></div>""", capt='S12b · upgrade sheet — used app-wide'),
     note='On return from Dodo&rsquo;s hosted checkout the server verifies the subscription directly and grants Pro '
          '<b>without waiting for the webhook</b>. <a href="pricing.html">Pricing</a> is the public statement of the same terms.')


page('suggestions', 'Suggestions', 'Dashboard and account',
     'S13 Suggestions.dc.html — S13a board · S13b submit sheet · S13c empty',
     '§ IA → Dashboard and account · § State Patterns → Suggestions',
     screen(app('projects', """<div class="stack gap16" style="max-width:860px">
  <div class="stack gap4"><h2 style="font-size:22px">Suggestions</h2>
    <p class="softaa" style="font-size:13px">Built in the open — tell us what&rsquo;s next.</p></div>
  <div class="row gap10"><span class="seg"><span class="on">Top</span><span>New</span><span>Planned</span><span>Building</span><span>Shipped</span></span>
    <a class="btn coral" style="margin-left:auto" href="suggestions.html#submit">Suggest something</a></div>
  <div class="stack gap10">""" + ''.join(f"""<div class="card"><div class="pad row gap14" style="align-items:flex-start">
      <div class="stack gap2" style="align-items:center;width:52px"><b class="mono" style="font-size:16px">{v}</b><span class="helper">votes</span></div>
      <div class="stack gap4 grow"><b style="font-size:14px">{t}</b><span class="helper">{d}</span></div>
      <div class="row gap6"><span class="badge neutral">{k}</span><span class="badge {c}">{s}</span></div></div></div>"""
    for v, t, d, k, s, c in [
      ('128', 'Variant Shuffle for the whole page at once', 'Shuffle every section together so the whole page keeps one consistent vibe.', 'Feature', 'Building', 'sky'),
      ('96', 'Scheduled deploys', 'Ship at midnight, while readers are asleep. Pick a time, we press the button.', 'Feature', 'Planned', 'notice'),
      ('74', 'More newsletter sections', 'Signup forms with incentives — free chapter, discount, archive access.', 'Section idea', 'Open', 'neutral'),
      ('61', 'Import my Ghost theme&rsquo;s colors as a pack', 'Shipped — the connect flow now pulls accent, logo and navigation automatically.', 'Integration', 'Shipped', 'live'),
      ('38', 'Team seats', 'Invite an editor who can build but not deploy.', 'Feature', 'Open', 'neutral'),
      ('22', 'Keyboard-only editing', 'Move, shuffle and restyle sections without touching the mouse.', 'Feature', 'Open', 'neutral')]) + """
  </div></div>""", right=BELL + NEWPROJ), capt='S13a · suggestions board — Top tab · 1440')
     + head('Submit', '', 'S13b · &ldquo;Suggest something&rdquo; sheet', anchor='submit')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:20px">Suggest something.</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">Big or small — if it would make Inflozo better, we want it.</p></div>
  <div class="body">
    <label class="field"><span class="control-label">Title</span><input class="input" aria-label="Title"></label>
    <div class="field"><span class="control-label">Type</span>
      <span class="seg"><span class="on">Section idea</span><span>Feature</span><span>Integration</span></span></div>
    <label class="field"><span class="control-label">Details</span>
      <textarea class="input" rows="4" style="height:auto;padding:8px 10px" aria-label="Details"></textarea></label>
    <div style="border:1px dashed var(--line-strong);border-radius:var(--r-sm);padding:16px;text-align:center">
      <span class="helper">Drop a screenshot or sketch · optional</span></div></div>
  <div class="foot"><a class="btn secondary" href="suggestions.html">Cancel</a><a class="btn coral" href="suggestions.html">Submit</a></div>
  </div></div>""", cls='narrow')
     + head('Empty', '', 'S13c · empty state', anchor='empty')
     + screen("""<div style="padding:48px;background:var(--paper);display:flex;justify-content:center">
  <div class="stack gap12" style="align-items:center;text-align:center;max-width:420px">
    <svg width="100" height="76" viewBox="0 0 100 76" fill="none" stroke="#1C1B1A" stroke-width="1.5">
      <rect x="12" y="12" width="76" height="48" rx="6"/><path d="M30 66l10-6M70 66l-10-6"/>
      <path d="M26 28h30M26 38h44" /><circle cx="72" cy="28" r="6" fill="#FFEDE8" stroke="#FF5941"/></svg>
    <b style="font-size:18px;font-family:var(--display)">Tell us what to build next.</b>
    <span class="helper">No suggestions yet — yours could be the first thing we ship.</span>
    <a class="btn coral" href="suggestions.html#submit">Suggest something</a></div></div>""", cls='narrow'),
     subs=[SUB('Submit sheet', 'submit', 'S13b'), SUB('Suggestions — empty', 'empty', 'S13c')])

page('over-limit-sheet', 'Over-Limit Sheet', 'Dashboard and account',
     'Extrapolated → Appendix A prompt A4, frames D4c and D4d. Inherits B13a&rsquo;s itemised rows '
     'over a dimmed dashboard and S3 Dashboard&rsquo;s shell',
     '§ IA → Dashboard and account · FR-L3 · J4 steps 5, 6 and 10',
     screen("""<div class="sheetwrap"><div class="sheet wide"><div class="head">
    <h2 style="font-size:22px">Let&rsquo;s get you back under the Free limits.</h2>
    <p style="font-size:13.5px;margin-top:8px"><b>Nothing has been deleted, and nothing will be. Your live sites are untouched.</b></p></div>
  <div class="body">
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Projects</b>
        <span class="helper">Six projects, and Free includes one.</span></div>
      <span class="mono" style="font-size:15px">6 of 1</span>
      <a class="btn sm secondary" href="over-limit-sheet.html#which-project">Choose which one stays editable</a></div>
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Connected sites</b>
        <span class="helper">Deploys stay blocked while connections exceed the cap. Each disconnected site keeps its
          original-theme archive.</span></div>
      <span class="mono" style="font-size:15px">2 of 1</span>
      <a class="btn sm secondary" href="sites.html">Disconnect one</a></div>
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Assets</b>
        <span class="helper">The library is read-only until you are under. Existing files stay.</span></div>
      <span class="mono" style="font-size:15px">312 MB of 100 MB</span>
      <a class="btn sm secondary" href="assets.html#over-quota">Delete some files</a></div>
    <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13.5px">Stored versions</b>
        <span class="helper">Nothing to do — we keep these. We just won&rsquo;t add more until the count is back under three.</span></div>
      <span class="mono" style="font-size:15px">8 of 3</span>
      <span class="helper">no action</span></div>
    <p class="helper">Rollback, snapshot restore and export keep working the whole time — on any plan, throughout.</p>
  </div>
  <div class="foot"><a class="btn marigold" href="upgrade-sheet.html">Go Pro — $15/mo</a>
    <a class="btn secondary" href="dashboard.html">Sort it out myself</a></div></div></div>""",
            capt='D4c · over-limit sheet · 1440 — the climax of J4')
     + head('Which project stays editable', 'The most recently updated is pre-selected. The others become <b>read-only</b>: '
            'viewable, still exportable, and editable again the moment the account is Pro.',
            'D4d · which project stays editable · 720', anchor='which-project')
     + screen("""<div class="sheetwrap"><div class="sheet"><div class="head"><h2 style="font-size:20px">Which project stays editable?</h2></div>
  <div class="body">""" + ''.join(f"""<label class="radiocard{' on' if i == 0 else ''}"><span class="radio{' on' if i == 0 else ''}"></span>
      <span class="stack grow"><span class="t">{n}</span><span class="c">{s} · updated {d}</span></span></label>"""
    for i, (n, s, d) in enumerate([('Orbit Weekly', 'orbitweekly.com', 'today'), ('Launch page', 'orbitweekly.com', '11 Aug'),
                                   ('The Slow Web', 'Sample content', '4 Aug'), ('Maya&rsquo;s portfolio', 'mayachen.studio', '2 Aug'),
                                   ('Field Notes', 'Sample content', '29 Jul'), ('Orbit Weekly — dark exp', 'Sample content', '20 Jul')])) + """
    <p class="helper">The other five stay viewable and exportable — you just can&rsquo;t edit them until you&rsquo;re on Pro.</p></div>
  <div class="foot"><a class="btn secondary" href="over-limit-sheet.html">Back</a>
    <a class="btn coral" href="editor.html#read-only-limit">Keep this one editable</a></div></div></div>""", cls='detail')
     + head('Resolved', 'The exits unblock. Nothing was lost on any path.', anchor='resolved')
     + screen("""<div style="padding:32px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:560px"><div class="pad stack gap12">
    <div class="banner success"><span class="ico">✓</span><span><b>You&rsquo;re under the Free limits.</b>
      Deploy, export and the code surfaces are open again.</span></div>
    <p style="font-size:13px;line-height:1.55">Your live Ghost sites never stopped serving what Inflozo shipped, and the
      five read-only projects are still here, still exportable, and editable again the moment you are on Pro.</p>
    <a class="btn secondary" href="dashboard.html" style="align-self:flex-start">Back to projects</a></div></div></div>""", cls='narrow'),
     subs=[SUB('Which project stays editable', 'which-project', 'D4d'), SUB('Resolved', 'resolved', 'J4 step 10')])

page('grace-banner', 'Grace Banner', 'Dashboard and account',
     'B Missing Surfaces.dc.html — B24 (consequence re-specified: FR-L3)',
     '§ IA → Deploy · § wrong mechanism → B24 · J4 steps 1–2',
     screen(app('projects', f"""<div class="stack gap20">
  <div class="card" style="border-color:var(--danger)"><div class="pad row gap16" style="align-items:flex-start">
    <div class="stack gap8 grow"><b style="font-size:15px">Your payment did not go through</b>
      <p style="font-size:13.5px;line-height:1.55"><b>Your sites stay live and nothing is deleted.</b>
        You have 7 days to update your card. We retried twice; the next attempt is 21 Aug.</p>
      <p style="font-size:13.5px;line-height:1.55">After that you go back to Free. <b>Your live sites are never
        touched — what&rsquo;s shipped stays shipped.</b> You&rsquo;d just need to sort out anything over the Free
        limits before you ship again.</p>
      <div class="row gap10"><a class="btn danger" href="billing.html">Update card</a>
        <a class="btn secondary" href="billing.html#invoices">See the invoice</a></div></div>
    <div class="stack" style="align-items:center;padding:0 12px">
      <span class="mono" style="font-size:44px;line-height:1;font-weight:500">7</span>
      <span class="helper">DAYS LEFT</span></div>
  </div></div>
  <div class="row gap10"><h2 style="font-size:20px">Projects</h2><span class="chip">6 of 25</span></div>
  <div class="grid g3">{projcard('Orbit Weekly', 'orbitweekly.com', 'Live', 'v5')}
    {projcard('The Slow Web', 'Sample content', 'Never deployed', '')}
    {projcard('Launch page', 'orbitweekly.com', 'Live', 'v2')}</div>
</div>""", right=BELL + NEWPROJ), capt='B24 · past-due grace banner, on every surface while past due · 1440')
     + head('What is kept during the grace, and it is everything',
            'Every Pro capability is kept for seven days, with <b>no per-row exception</b>: 25 projects, 10 sites, 10 '
            'stored versions, the whole library at both exits. <span class="mono">pro_past_due</span> is internal and is '
            '<b>never shown as a plan</b> — <a href="pricing.html">Pricing</a> lists Free and Pro, because those are the '
            'only two anyone can buy.', anchor='kept')
     + screen('<div style="padding:24px;background:var(--surface)">' + limits_table(note=False)
              + '<p class="helper" style="margin-top:10px">During the seven days the Pro column is what applies, exactly, '
                'with no exception. Withdrawing capability the moment a card bounces would strand someone mid-deploy over '
                'a bank decline.</p></div>')
     + head('When it expires', 'The account becomes Free. Nothing is deleted, on any path — the '
            '<a href="over-limit-sheet.html">Over-Limit Sheet</a> itemises what is over and by how much, and every remedy '
            'on it is the user&rsquo;s own.', anchor='expiry')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:600px"><div class="pad stack gap10">
    <b style="font-size:15px">Your Pro plan has ended.</b>
    <p style="font-size:13.5px;line-height:1.55">Nothing has been deleted. Your live Ghost sites are serving exactly what
      Inflozo shipped and will keep doing so. Rollback, snapshot restore and export all still work.</p>
    <p style="font-size:13.5px;line-height:1.55">You are over the Free limits in three places, so deploying and exporting
      are paused until you decide what changes.</p>
    <div class="row gap10"><a class="btn coral" href="over-limit-sheet.html">Show me what&rsquo;s over</a>
      <a class="btn secondary" href="billing.html">Go back to Pro</a></div></div></div></div>""", cls='narrow'),
     note='<b>The frame is wrong in the frightening half.</b> B24 says Pro designs stop rendering and sites fall back to '
          'Free replacements. FR-L3: <b>existing deployed themes are never touched.</b> Grace expiry moves the account to '
          'Free and blocks the <i>exits</i>. M5&rsquo;s own FAQ already says the right thing.',
     subs=[SUB('What is kept during grace', 'kept', 'F.1 third column'), SUB('Grace expiry', 'expiry', 'FR-L3')])

page('small-screen-notice', 'Small Screen Notice', 'Dashboard and account',
     'Extrapolated → Appendix A prompt A4, frame D4f. Inherits S3 Dashboard&rsquo;s 390 frame',
     '§ IA → Dashboard and account · § Responsive &amp; Platform (ruling R-76)',
     screen("""<div style="min-height:600px;background:var(--paper);padding:24px;display:flex;flex-direction:column;gap:20px;align-items:center;justify-content:center">
  <svg width="120" height="96" viewBox="0 0 120 96" fill="none" stroke="#1C1B1A" stroke-width="1.5">
    <rect x="8" y="12" width="64" height="46" rx="4"/><path d="M8 50h64"/><path d="M28 66h24M34 58v8"/>
    <rect x="82" y="26" width="26" height="46" rx="4" fill="#FFEDE8" stroke="#FF5941"/><path d="M92 66h6" stroke="#FF5941"/></svg>
  <div class="stack gap8" style="text-align:center"><h1 style="font-size:22px">The editor needs a bigger screen.</h1>
    <p class="softaa" style="font-size:13.5px">Dragging sections and a 300-pixel control panel don&rsquo;t fit on a phone
      yet. Open this project on a laptop or tablet.</p></div>
  <div class="card" style="width:100%"><div class="pad-tight stack gap10">
    <span class="panel-label">What does work here</span>
    <a class="row gap10" href="deploy-history.html"><span class="stack gap2 grow"><b style="font-size:13px">Deploy history</b>
        <span class="helper">v5 · live since today, 2:14 PM</span></span>
      <span class="btn sm secondary">Roll back to v4</span></a>
    <div style="height:1px;background:var(--line-faint)"></div>
    <a class="row gap10" href="sites.html"><b style="font-size:13px" class="grow">Your sites</b><span class="soft">→</span></a>
    <div style="height:1px;background:var(--line-faint)"></div>
    <a class="row gap10" href="billing.html"><b style="font-size:13px" class="grow">Billing</b><span class="soft">→</span></a>
  </div></div>
</div>""", cls='phone', capt='D4f · small screen notice · 390'),
     note='<b>It fires on a coarse pointer at a small viewport, never on width alone.</b> A 1440px display at 200% browser '
          'zoom presents roughly a 720px CSS viewport, and throwing a low-vision user out of the editor for zooming would '
          'be a straight WCAG 1.4.4 failure. That case gets the <b>editor</b>, reflowed — see '
          '<a href="editor.html#at-720">Editor at 720</a>. The owner ruled about phones.')


page('pricing', 'Pricing', 'Marketing',
     'M5 Pricing.dc.html — M5 desktop and M5 mobile. Its limit table corrected to Appendix F.1',
     '§ IA → Marketing · § Plan limits · J3 step 5b · J4 step 3',
     screen(f"""<div class="mk">{marketing_nav()}
  <div class="mkbody stack gap40">
    <div class="stack gap8" style="text-align:center;align-items:center">
      <span class="panel-label">Pricing</span>
      <h1 style="font-size:44px">Free to play. $15 to ship it all.</h1>
      <div class="row gap10" style="margin-top:8px"><span class="seg"><span>Monthly</span><span class="on">Yearly</span></span>
        <span class="badge notice">$150/yr — 2 months free</span></div></div>
    <div class="grid g2 gap24" style="margin-top:32px">
      <div class="card"><div class="pad stack gap14">
        <div class="row gap8"><b style="font-size:16px">Free</b></div>
        <span style="font-family:var(--display);font-size:36px;font-weight:700">$0<span class="soft" style="font-size:14px"> forever</span></span>
        <p class="softaa" style="font-size:13px">Everything you need to build and ship one gorgeous site.</p>
        <div class="stack gap8" style="font-size:13px">
          <span>✓ 1 project · 1 connected site</span>
          <span>✓ Every design on the canvas</span>
          <span>✓ Every Style Pack, each with a hand-paired dark palette</span>
          <span>✓ One-click deploy with gscan</span>
          <span>✓ Ship the free set · last 3 versions kept</span>
          <span>✓ 100 MB assets · 10 MB per file</span></div>
        <a class="btn secondary lg" href="sign-in.html">Start free</a></div></div>
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
        <a class="btn coral lg" href="upgrade-sheet.html">Go Pro</a></div></div>
    </div>
    <p class="helper" style="text-align:center">Cancel anytime · Taxes handled · Powered by Dodo</p>
    <div class="section-head" style="margin-top:40px"><h2>The limits, plainly</h2></div>
    {limits_table()}
    <div class="section-head" style="margin-top:40px"><h2>Pricing FAQ</h2><p>Money questions, answered.</p></div>
    <div class="stack gap12">
      <div class="card"><div class="pad stack gap6"><b style="font-size:14px">What happens to my site if I cancel?</b>
        <span class="softaa" style="font-size:13px">Nothing. Your deployed theme is a normal Ghost theme — it stays live on
          your site forever. You just can&rsquo;t push new versions from Inflozo until you are back under the Free limits.</span></div></div>
      <div class="card"><div class="pad row gap6"><b style="font-size:14px" class="grow">Is the Free plan actually free?</b><span class="soft">+</span></div></div>
      <div class="card"><div class="pad row gap6"><b style="font-size:14px" class="grow">Do you handle VAT and sales tax?</b><span class="soft">+</span></div></div>
      <div class="card"><div class="pad row gap6"><b style="font-size:14px" class="grow">Can I switch between monthly and yearly?</b><span class="soft">+</span></div></div>
    </div>
  </div>{MKFOOT}</div>""", capt='M5 · pricing · 1440'),
     note='<b>Two purchasable plans, and only two.</b> <span class="mono">pro_past_due</span> is an internal state of a Pro '
          'subscription and is never listed here as a plan — what a past-due customer sees is the '
          '<a href="grace-banner.html">Grace Banner</a>. And no page of the marketing site prints a library total: '
          '&ldquo;hundreds of gorgeous sections&rdquo; is the canonical phrasing, because the library grows monthly.')


# ═══════════════════════════════════════════════════════════════════════════════
# EDITOR
# ═══════════════════════════════════════════════════════════════════════════════
SIDEBAR_SPLITFORM = f"""<div class="sidebar">
  <div class="row gap8"><b style="font-size:13px">Home hero</b><span class="chip mono" style="margin-left:auto">7 / 18</span></div>
  <div class="ctlgroup"><span class="panel-label">Design</span>
    <div class="row gap8"><span class="mono" style="font-size:13px">7 of 18</span>
      <span class="row gap4" style="margin-left:auto"><span class="kbd">[</span><span class="kbd">]</span></span></div>
    <div class="dstrip">""" + ''.join(
    f'<span class="dthumb{" on" if i == 6 else ""}">{"✦" if i == 8 else ""}</span>' for i in range(11)) + """
      <span class="dthumb">+6</span></div>
    <span class="helper">Split Form · copy left, signup right</span></div>
  <div class="ctlgroup"><span class="control-label">Copy side</span>
    <span class="seg"><span class="on">Left</span><span>Right</span></span></div>
  <div class="ctlgroup"><span class="control-label">Height</span>
    <span class="seg"><span>Compact</span><span class="on">Comfortable</span><span>Tall</span></span></div>
  <div class="ctlgroup"><span class="control-label">Form fields</span>
    <span class="seg"><span class="on">Email</span><span>Email + name</span></span></div>
  <div class="ctlgroup"><div class="row gap10"><span class="control-label grow">Reader count</span><span class="toggle on"></span></div></div>
  <div class="stack gap6"><span class="panel-label">No image controls</span>
    <span class="reason">This design has no image. Nothing to crop, position or scrim.</span></div>
</div>"""

SIDEBAR_EMPTY = """<div class="sidebar">
  <div class="stack gap8" style="margin:auto;text-align:center;padding:24px">
    <b style="font-size:13.5px">Nothing selected</b>
    <span class="helper">Click any section on the canvas — its controls appear here.</span></div></div>"""

page('editor', 'Editor', 'Editor',
     'S4 Editor.dc.html — S4a rest, S4b hover, S4c selected · B Missing Surfaces B1, B2, B3, B4, B6, B7, B9, B10 · '
     'P0-0 Greyed Control Pattern · P0-1 Inline Text Toolbar · extrapolated markers → prompt A5 (D5a–D5f) · '
     'narrow widths and the floor affordances → prompt A8 (D8a–D8f)',
     '§ IA → Editor · § State Patterns → Editor and Control Sidebar · § Accessibility Floor · § Interaction Primitives',
     screen(f'<div class="ed">{edbar()}<div class="edmid">{layerspanel()}'
            f'<div class="canvasmat">{owsite()}</div>{SIDEBAR_EMPTY}</div></div>',
            capt='S4a · editor — at rest. The canvas is sacred: no grid, no outline, no badge until you touch it')
     + head('Hover, and then selection',
            'Hover gives a 1px outline, the name tag, the ◀ ▶ design arrows, duplicate, delete, the drag handle and a '
            '&ldquo;+&rdquo; between sections. Click gives a persistent outline and the sidebar. Click text inside a '
            'selection and you are typing. <span class="kbd">Esc</span> steps outward one level per press.',
            'S4b hover · S4c selected', anchor='selected')
     + screen(f"""<div class="ed">{edbar()}<div class="edmid">{layerspanel()}
   <div class="canvasmat">{owsite(selected='hero', extra_top='<div class="row" style="max-width:864px;margin:0 auto 6px"><span class="pill"><span class="mono">7 / 18</span><a href="editor.html#design-nav">◀</a><a href="editor.html#design-nav">▶</a><a href="variant-shuffle.html">Shuffle</a><a href="editor.html">Duplicate</a><a href="editor.html">Delete</a></span></div>')}</div>
   {SIDEBAR_SPLITFORM}</div></div>""")
     + head('Design Picker · Design Nav', 'The most-used control in the product. Three ways to the same thing: '
            '<span class="kbd">[</span> <span class="kbd">]</span>, the arrows beside the counter, and the thumbnail strip. '
            'The counter is mono so the number does not shift width, and it names the unit — <b>Design</b>, never Layout. '
            'The strip shows twelve and then a <span class="mono">+N</span> tile rather than scrolling. '
            '<span class="kbd">]</span> past the last returns to the first. '
            '<b>Switching carries, parks and defaults</b>: a control in both designs carries its value, one only in the '
            'design being left is parked against it, one only in the design being entered takes its default — which is why '
            'three presses of <span class="kbd">[</span> put you back exactly where you started.',
            'B1a in the sidebar · B1b on the section itself', anchor='design-picker')
     + screen(f'<div style="padding:24px;background:var(--paper);display:flex;gap:24px;justify-content:center;align-items:flex-start">'
              f'<div style="width:320px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)">{SIDEBAR_SPLITFORM}</div>'
              f'<div class="stack gap10" id="design-nav"><span class="frame-cap">B1b · the same counter, riding on the section</span>'
              f'<span class="pill"><span class="mono">7 / 18</span><a href="editor.html#design-picker">◀</a>'
              f'<a href="editor.html#design-picker">▶</a><a href="variant-shuffle.html">Shuffle</a></span>'
              f'<span class="helper" style="max-width:280px">Direct manipulation first — a user never has to look right '
              f'to change a design. Both this pill and the outline appear on hover and vanish on exit.</span></div></div>')
     + head('Control Sidebar', 'Four to seven controls, and they are <b>this design&rsquo;s</b>. A control that could never '
            'do anything in this design is <b>absent</b>, with the panel saying why; a control that could act but cannot '
            'right now is <b>greyed with its reason in the helper slot</b>. The two mean different things and a user must '
            'be able to tell them apart (rulings R-33, R-68).',
            'B2 · Editor Sidebar Kit · P0-0', anchor='control-sidebar')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;gap:20px;justify-content:center;align-items:flex-start">
  <div style="width:300px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)"><div class="sidebar">
    <span class="frame-cap">absent — could never act here</span>
    <div class="ctlgroup"><span class="control-label">Type size</span>
      <span class="seg"><span>Large</span><span class="on">Huge</span><span>Absurd</span></span></div>
    <div class="ctlgroup"><span class="control-label">Alignment</span>
      <span class="seg"><span class="on">Left</span><span>Centred</span></span></div>
    <div class="ctlgroup"><div class="row gap10"><span class="control-label grow">Show the byline</span><span class="toggle on"></span></div></div>
    <div class="stack gap6"><span class="panel-label">No image controls</span>
      <span class="reason">This design has no image. Nothing to crop, position or scrim.</span></div>
    <span class="helper">Big Type Manifesto — three controls, and the panel says so. Padding it out to match its siblings
      would invent decisions the design does not have.</span></div></div>
  <div style="width:300px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)"><div class="sidebar">
    <span class="frame-cap">greyed — could act, not now</span>
    <div class="ctlgroup"><span class="control-label">Media</span>
      <span class="seg"><span class="on">Accent colour</span><span>Photograph</span></span></div>
    <div class="ctlgroup greyed"><span class="control-label">Overlay tint</span>
      <span class="seg"><span class="on">Soft dark</span><span>None</span><span>Strong</span></span>
      <span class="reason">Not available while the media uses the accent colour.</span></div>
    <div class="ctlgroup"><div class="row gap10"><span class="control-label grow">Caption</span><span class="toggle"></span></div></div>
    <span class="helper">The row never moves and never disappears; the panel grows by the height of one sentence. The
      sentence names the control that switched it off, so the cause is one move away. Never a tooltip.</span></div></div>
</div>""")
     + head('Inline Toolbar', 'Exactly four marks — bold, italic, underline, link — plus Remove link, which renders always '
            'and disables when the selection carries no link. <b>A mark a field does not permit is absent, not greyed</b>: '
            'a floating bar has no room for a sentence and the mark never returns for that field. '
            '<span class="kbd">⌥F10</span> moves focus into the toolbar, ← → move between marks, and '
            '<span class="kbd">Esc</span> dismisses it and restores that exact selection, caret and all.',
            'P0-1 Inline Text Toolbar (supersedes B4a — no block-type menu; Inflozo does not own the post body)',
            anchor='inline-toolbar')
     + screen("""<div style="padding:32px;background:var(--mat);display:flex;flex-direction:column;gap:24px;align-items:center">
  <div class="stack gap10" style="max-width:620px">
    <span class="pill" style="align-self:center"><span style="font-family:var(--serif);font-weight:700">B</span>
      <span style="font-family:var(--serif);font-style:italic">I</span>
      <span style="font-family:var(--serif);text-decoration:underline">U</span>
      <span style="border-left:1px solid rgba(255,255,255,.25);padding-left:10px">🔗</span>
      <span style="opacity:.35">⛔</span></span>
    <p style="font-family:var(--serif);font-size:17px;line-height:1.6;background:var(--paper-raised);padding:20px;border-radius:8px">
      The web used to point outward. A blogroll was <span style="background:rgba(217,108,63,.25)">a list of other
      people&rsquo;s homes</span>, kept in public, updated by hand — and reading one felt like being handed a map.</p>
    <span class="helper" style="text-align:center">Five slots, always the same width. Remove link is disabled at 35% when
      the selection carries no link.</span></div>
  <div class="stack gap10" style="max-width:620px" id="link-entry">
    <span class="frame-cap">B4b + P0-1 · the link popover, search state</span>
    <div class="card" style="width:340px;align-self:center"><div class="pad-tight stack gap8">
      <input class="input" value="arch" aria-label="Link target">
      <span class="panel-label" style="font-size:10.5px">PAGES</span>
      <div class="row gap8"><span style="font-size:13px">The <b>arch</b>ive</span><span class="helper mono" style="margin-left:auto">/archive/</span></div>
      <span class="panel-label" style="font-size:10.5px">POSTS</span>
      <div class="row gap8"><span style="font-size:13px">Notes on a 30-year-old <b>arch</b>ive</span><span class="helper" style="margin-left:auto">Jul 28</span></div>
      <div class="row gap8"><span style="font-size:13px">The <b>arch</b>itecture of a quiet web</span><span class="helper" style="margin-left:auto">Jun 12</span></div>
      <span class="panel-label" style="font-size:10.5px">TAGS</span>
      <div class="row gap8"><span style="font-size:13px"><b>Arch</b>ive</span><span class="helper" style="margin-left:auto">41 posts</span></div>
      <span class="panel-label" style="font-size:10.5px">PORTAL ACTIONS</span>
      <div class="row gap6 wrap"><span class="chip">Sign up</span><span class="chip">Sign in</span><span class="chip">Account</span><span class="chip">Upgrade</span></div>
      <span class="panel-label" style="font-size:10.5px">SITE</span>
      <div class="row gap6"><span class="chip">Ghost search</span></div>
      <span class="helper">Paste a URL or type an email address to link outside the site.</span></div></div>
    <div class="card" style="width:340px;align-self:center"><div class="pad-tight stack gap8">
      <span class="frame-cap" style="margin:0">filled state — editing re-opens the same popover, pre-filled</span>
      <div class="row gap8"><span style="font-size:13px">What we lost when blogrolls died</span>
        <a class="small" href="editor.html#link-entry" style="margin-left:auto">Change</a></div>
      <span class="helper mono">POST · /blogrolls/</span>
      <div class="row gap8"><span class="check"></span><span style="font-size:12.5px">Open in new tab</span></div>
      <div class="row gap8"><span class="control-label">REL</span><span class="chip">nofollow</span><span class="chip">noreferrer</span><span class="chip">sponsored</span></div>
      <div class="row gap8"><a class="btn sm ghost" href="editor.html">Remove link</a><a class="btn sm secondary" href="editor.html" style="margin-left:auto">Done</a></div>
    </div></div></div>
</div>""")
     + head('Template Switcher', 'The full set. Membership is a <b>group with three children</b> — Signup, Signin, Member '
            'home — and Private appears only when a Private Site Gate section has been designed. A template that has '
            'never been designed shows a hollow dot <b>labelled &ldquo;Auto-generated&rdquo;</b>: a shape alone is the '
            'same failure as a colour alone, and this menu is where a user decides which template to open.',
            'S4a&rsquo;s dropdown, completed → prompt A5 frame D5b (FR-D6)', anchor='template-switcher')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="width:280px"><div class="pad-tight stack gap2">
    <div class="row gap8" style="padding:7px 10px;border-radius:8px;background:var(--coral-tint);font-size:13px;font-weight:600">Home<span style="margin-left:auto">✓</span></div>
    <a class="row gap8" href="post-content.html" style="padding:7px 10px;font-size:13px">Post</a>
    <div class="row gap8" style="padding:7px 10px;font-size:13px">Page</div>
    <div class="row gap8" style="padding:7px 10px;font-size:13px">Tag<span class="row gap6" style="margin-left:auto"><span style="width:7px;height:7px;border-radius:50%;border:1px solid var(--line-strong)"></span><span class="helper">Auto-generated</span></span></div>
    <div class="row gap8" style="padding:7px 10px;font-size:13px">Author<span class="row gap6" style="margin-left:auto"><span style="width:7px;height:7px;border-radius:50%;border:1px solid var(--line-strong)"></span><span class="helper">Auto-generated</span></span></div>
    <div class="row gap8" style="padding:7px 10px;font-size:13px;color:var(--ink-soft)">Membership</div>
    <div class="row gap8" style="padding:6px 10px 6px 24px;font-size:13px">Signup</div>
    <div class="row gap8" style="padding:6px 10px 6px 24px;font-size:13px">Signin</div>
    <div class="row gap8" style="padding:6px 10px 6px 24px;font-size:13px">Member home</div>
    <div class="row gap8" style="padding:7px 10px;font-size:13px">404<span class="row gap6" style="margin-left:auto"><span style="width:7px;height:7px;border-radius:50%;border:1px solid var(--line-strong)"></span><span class="helper">Auto-generated</span></span></div>
    <div class="row gap8" style="padding:7px 10px;font-size:13px;color:var(--ink-faint)">Private<span class="helper" style="margin-left:auto">shown once a Private Gate is designed</span></div>
    <div style="height:1px;background:var(--line);margin:4px 8px"></div>
    <div class="row gap8" style="padding:7px 10px;font-size:13px">Reading List<span class="helper mono" style="margin-left:auto">custom</span></div>
    <div style="height:1px;background:var(--line);margin:4px 8px"></div>
    <a class="row gap8" href="routes-manager.html" style="padding:7px 10px;font-size:13px;color:var(--ink-soft)">Manage routes…</a>
    <div class="row gap8" style="padding:7px 10px;font-size:13px;color:var(--ink-soft)">+ New template</div>
  </div></div></div>""", cls='tiny')
     + head('Layers', 'The Site-wide card is pinned above the page&rsquo;s own sections, with a page count, and it cannot be '
            'reordered against them. Editing a site-wide section changes it on every template, and the product says so '
            'the first time and then stops. <b>The unit is templates</b> — a project has roughly seven to ten of them, '
            'not the 26 pages the frame printed.',
            'B7 · unit corrected to templates (FR-D6)', anchor='layers')
     + screen(f'<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">'
              f'<div style="width:260px;border:1px solid var(--line);border-radius:var(--r);background:var(--paper);overflow:hidden">'
              f'{layerspanel()}</div></div>', cls='tiny')
     + head('A Layers row with keyboard focus', '<span class="kbd">↑</span> <span class="kbd">↓</span> move focus between '
            'rows; <b><span class="kbd">⌥↑</span> <span class="kbd">⌥↓</span> move the section itself</b>, with the canvas '
            'following and the move announced; <span class="kbd">Enter</span> selects, <span class="kbd">Space</span> '
            'toggles visibility. The focus ring is drawn <b>over</b> the row&rsquo;s existing state, so focused-and-selected '
            'is legible as both. <b>A drag with no keyboard equivalent is a defect.</b>',
            'B7&rsquo;s three row states plus the fourth → prompt A8 frame D8e', anchor='layers-focused')
     + screen(f"""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div style="width:280px" class="stack gap6">
    <div class="lrow focused">{ICON['grip']}<div class="lthumb"></div><span class="grow">Home hero</span><span class="faint">{ICON['eye']}</span></div>
    <div class="lrow" style="background:rgba(28,27,26,.04)">{ICON['grip']}<div class="lthumb"></div><span class="grow">Latest issues</span><span class="faint">{ICON['eye']}</span></div>
    <div class="lrow on focused">{ICON['grip']}<div class="lthumb"></div><span class="grow">The list, teased</span><span class="faint">{ICON['eye']}</span></div>
    <div class="row gap8 wrap" style="margin-top:8px"><span class="kbd">↑</span><span class="kbd">↓</span><span class="helper">move focus</span>
      <span class="kbd">⌥↑</span><span class="kbd">⌥↓</span><span class="helper">move the section</span></div>
  </div></div>""", cls='tiny')
     + head('Persistence Indicator', 'Four labels, one dot, <b>never a spinner</b>. The expanded panel appears only on '
            'Retrying, and its first sentence is the reassurance, because the user&rsquo;s real question is whether they '
            'have lost work. The fifth state is FR-D10&rsquo;s no-local-storage fallback, and it exists because a false '
            '&ldquo;Saved locally&rdquo; is the one thing this indicator must never say.',
            'B6, plus the fallback state FR-D10 requires', anchor='persistence')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;flex-direction:column;gap:12px;max-width:520px;margin:0 auto">
  <div class="row gap10"><span class="dot grey"></span><b style="font-size:13px">Saved on this device</b><span class="helper">Written locally, not yet sent. The resting state while typing.</span></div>
  <div class="row gap10"><span class="dot coral"></span><b style="font-size:13px">Syncing</b><span class="helper">In flight — the only one that is happening rather than being true.</span></div>
  <div class="row gap10"><span class="dot mint"></span><b style="font-size:13px">Synced</b><span class="helper">Safe on the server. Fades back to the resting label.</span></div>
  <div class="row gap10"><span class="dot danger"></span><b style="font-size:13px">Retrying · <span class="mono">12s</span></b><span class="helper">Counts down, so waiting feels finite.</span></div>
  <div class="row gap10"><span class="dot sky"></span><b style="font-size:13px">Syncing every change to the cloud</b><span class="helper">This browser has no local storage, so nothing is held here.</span></div>
  <div class="card"><div class="pad-tight stack gap8"><b style="font-size:13px">Retrying, third attempt</b>
    <span class="helper">Your work is safe on this device. Nothing is lost if you close the tab — we will send it when the
      connection returns.</span>
    <div class="row gap8"><a class="btn sm secondary" href="editor.html">Retry now</a><a class="btn sm ghost" href="editor.html">Download a copy</a></div></div></div>
  <p class="helper">Nothing blocks on a save. Every change writes locally and asynchronously; cloud sync runs every three
    minutes, on tab close, on lock release, and before any deploy or export.</p>
</div>""", cls='narrow')
     + head('Content Source Pill · Preview Subject Picker', 'The pill describes the canvas, so it sits above the canvas '
            'rather than in the sidebar. Solid hairline with a mint dot when the content is real; dashed with grey when it '
            'is sample. Opening it reveals the <b>subject</b> — which post, page, tag or author this canvas renders — '
            'because a post with a feature image and one without are different shapes.',
            'B9 · the subject list → prompt A5 frame D5e (FR-D22)', anchor='content-source')
     + screen("""<div style="padding:32px;background:var(--mat);display:flex;gap:24px;justify-content:center;align-items:flex-start;flex-wrap:wrap">
  <div class="stack gap10" style="align-items:center">
    <span class="pill"><span class="dot mint"></span><span>Previewing with: <b>Orbit Weekly</b></span></span>
    <span class="helper" style="max-width:230px;text-align:center">Real posts, real authors, real tags. What you see is what a reader sees.</span></div>
  <div class="stack gap10" style="align-items:center">
    <span class="pill dashed"><span class="dot grey"></span><span>Previewing with: <b>Sample content</b></span></span>
    <span class="helper" style="max-width:230px;text-align:center">Nothing here is yours yet. Connect a site and every frame refills.</span></div>
  <div class="card" style="width:340px" id="preview-subject"><div class="pad-tight stack gap8">
    <span class="frame-cap" style="margin:0">D5e · the pill, opened</span>
    <span class="panel-label" style="font-size:10.5px">SOURCE</span>
    <div class="row gap8" style="font-size:13px">Orbit Weekly<span style="margin-left:auto">✓</span></div>
    <div class="row gap8" style="font-size:13px;color:var(--ink-soft)">Sample content</div>
    <div style="height:1px;background:var(--line)"></div>
    <span class="panel-label" style="font-size:10.5px">SUBJECT</span>
    <input class="input" placeholder="Search your posts…" aria-label="Search posts">
    <div class="row gap8" style="font-size:13px"><span>Style-guide article</span><span style="margin-left:auto">✓</span></div>
    <span class="helper" style="margin-top:-4px">the one every post design is designed against</span>
    <div class="row gap8" style="font-size:13px"><span>The slow return of the personal homepage</span>
      <span class="chip" style="margin-left:auto">has image</span></div>
    <span class="helper" style="margin-top:-4px">Aug 14</span>
    <div class="row gap8" style="font-size:13px"><span>What we lost when blogrolls died</span>
      <span class="chip" style="margin-left:auto">has image</span></div>
    <span class="helper" style="margin-top:-4px">Aug 10</span>
    <div class="row gap8" style="font-size:13px"><span>A field guide to quiet software</span></div>
    <span class="helper" style="margin-top:-4px">Aug 7 · no feature image</span>
    <span class="helper" style="border-top:1px solid var(--line-faint);padding-top:8px">This canvas renders one post. Which
      one changes what you see, because a post with a feature image and one without are different shapes.</span>
  </div></div>
</div>""")
     + head('Member State Preview', '<b>Three states, and only three</b> — Anonymous, Free member, Paid member. '
            '<span class="mono">comped</span> previews as Paid, because it differs in billing rather than in access. '
            'Beside the toggle is the unviewed-states marker, and on a gated body the canvas prints '
            '<b>&ldquo;Gated content — shown with sample text&rdquo;</b>.',
            'S4d re-specified to FR-D16 (B9 already says &ldquo;only&rdquo; and agrees with the PRD; S4d is the outlier)',
            anchor='member-state')
     + screen("""<div style="padding:32px;background:var(--mat);display:flex;flex-direction:column;gap:18px;align-items:center">
  <div class="row gap10"><span class="seg"><span class="on">Anonymous</span><span>Free member</span><span>Paid member</span></span>
    <span class="badge notice">2 states not yet viewed</span></div>
  <div class="pill"><span>Gated content — shown with sample text</span></div>
  <span class="helper" style="max-width:520px;text-align:center">S4d drew tier-level previews — Orbit Supporter $5, Patron
    $12, Founding $120. FR-D16 has three states, not a tier list, so the tiers move to the
    <a href="paywall-editor.html">Paywall Editor</a> where they belong.</span></div>""", cls='detail')
     + head('Pro Design Badge', '<b>A price tag, not a lock.</b> Marigold, in the corner, on selection only — and '
            '<b>nothing happens when you click it, ever</b>. That is the '
            '<a href="pro-exit-sheet.html">Pro Exit Sheet</a>&rsquo;s job, once, at the exit.',
            'B10', anchor='pro-badge')
     + screen("""<div style="padding:32px;background:var(--mat);display:flex;gap:24px;justify-content:center;align-items:flex-start;flex-wrap:wrap">
  <div class="stack gap10" style="align-items:center">
    <span class="pill"><span class="badge pro">✦ Pro</span><span>Collage Grid</span></span>
    <span class="helper" style="max-width:260px;text-align:center">Placed, editable, shuffleable, exportable to the canvas
      — and shipping-blocked only at deploy. Nothing about it is disabled.</span></div>
  <div class="card" style="max-width:360px"><div class="pad-tight stack gap8">
    <b style="font-size:13px">What the badge does and does not mean</b>
    <span class="helper">✓ Edit it, restyle it, shuffle it, preview it, keep it</span>
    <span class="helper">✓ See it in the design strip with the same mark</span>
    <span class="helper">✕ No upgrade sheet on click, ever</span>
    <span class="helper">The word <b>Pro</b> is part of the badge, never the glyph alone — a shape may not carry a signal
      on its own any more than a colour may.</span></div></div></div>""", cls='detail')
     + head('Auto-Generated Marker', 'The same sentence in two places — a chip in the top bar beside the template name, and '
            'a row at the head of Layers. Informational, never apologetic: the canvas is telling the user what they are '
            'looking at, not excusing it. Both vanish on the first edit.',
            'Extrapolated → prompt A5 frame D5a (FR-D6, Appendix H)', anchor='auto-generated')
     + screen(f"""<div class="ed short">{edbar(template='Tag', extra='<span class="badge notice">Auto-generated — edit anything to make it yours</span>')}
  <div class="edmid">{layerspanel(extra_top='<div class="row gap8" style="padding:8px;background:var(--marigold-tint);border-radius:8px;margin-bottom:6px"><span class="helper" style="color:var(--marigold-text)">Auto-generated — edit anything to make it yours</span></div>', pagelabel='THIS TEMPLATE · TAG')}
  <div class="canvasmat">{owsite()}</div>{SIDEBAR_EMPTY}</div></div>""")
     + head('Main Feed Marker', 'Which feed is the paginated one, said on the canvas outline and on the Layers row. Its '
            'Count control is <b>greyed with the reason</b> — the value in force is not its own — and it links to where '
            'the value actually lives. <b>Never into Ghost Admin: Ghost has no posts-per-page setting</b> (ruling R-10 #13). '
            'The second feed&rsquo;s ⋯ menu carries &ldquo;Make this the main feed&rdquo;.',
            'Extrapolated → prompt A5 frame D5c (FR-H2, FR-Q1)', anchor='main-feed')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;gap:20px;justify-content:center;align-items:flex-start;flex-wrap:wrap">
  <div class="stack gap10" style="align-items:center"><span class="pill"><span class="mono">MAIN FEED</span></span>
    <span class="helper" style="max-width:200px;text-align:center">on the canvas outline and on the Layers row</span></div>
  <div style="width:300px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)"><div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">Latest issues</b><span class="chip mono" style="margin-left:auto">MAIN FEED</span></div>
    <div class="ctlgroup greyed"><span class="control-label">Count</span>
      <span class="stepper"><span>−</span><span class="v">12</span><span>+</span></span>
      <span class="reason">This feed is sized by your theme&rsquo;s Posts per page.
        <a href="theme-settings.html">Change it in Theme settings.</a></span></div>
    <div class="ctlgroup"><span class="control-label">Pagination</span>
      <span class="seg"><span class="on">Numbered</span><span>Load more</span><span>Infinite</span></span>
      <span class="helper">Only the main feed has this control.</span>
      <a class="btn sm secondary" href="editor.html#page2" style="align-self:flex-start;margin-top:6px">Preview page 2</a></div>
  </div></div>
  <div class="card" style="width:250px"><div class="pad-tight stack gap2">
    <span class="frame-cap" style="margin:0">the second feed&rsquo;s ⋯ menu</span>
    <div class="row gap8" style="padding:7px 8px;font-size:13px">Duplicate</div>
    <div class="row gap8" style="padding:7px 8px;font-size:13px">Make this the main feed</div>
    <div class="row gap8" style="padding:7px 8px;font-size:13px;color:var(--danger)">Delete</div></div></div>
</div>""")
     + head('Page 2 Preview', 'The only state in which a numbered pagination treatment shows what it is. Reached by clicking '
            'the Pagination control — <b>deliberately no keyboard shortcut</b>: states added after FR-D11&rsquo;s map carry '
            'none, and that rule governs new <i>global</i> bindings only.',
            'Extrapolated → prompt A5 frame D5d (FR-D21, Appendix H)', anchor='page2')
     + screen("""<div style="padding:24px;background:var(--mat);display:flex;flex-direction:column;gap:14px;align-items:center">
  <span class="pill"><span>Page 2</span><a href="editor.html#main-feed">Back to page 1</a></span>
  <div class="site" style="max-width:640px"><div style="padding:24px 32px" class="stack gap16">
    <div class="stack gap4"><span style="font-family:var(--serif);font-size:18px">Notes on a 30-year-old homepage</span><span class="ow-meta">TOMÁS RIVERA · JUL 28</span></div>
    <div class="stack gap4"><span style="font-family:var(--serif);font-size:18px">The renewal arithmetic</span><span class="ow-meta">ROSA MENENDEZ · JUL 21</span></div>
    <div class="stack gap4"><span style="font-family:var(--serif);font-size:18px">Quiet software, revisited</span><span class="ow-meta">PRIYA NAIR · JUL 14</span></div>
    <div class="row gap10" style="justify-content:center;padding-top:12px;border-top:1px solid #EBE5DB;font-family:var(--ui);font-size:12px">
      <span>← Previous</span><span class="chip">1</span><span class="chip ink">2</span><span class="chip">3</span><span class="chip">4</span><span>Next →</span></div>
  </div></div></div>""", cls='detail')
     + head('Empty Template Warning', 'Fires <b>before</b> it takes effect, when the last section of a designed custom '
            'template is removed. Notice colour, not danger — nothing breaks. Ghost falls back silently on its side, which '
            'is exactly why Inflozo is not silent on its own.',
            'Extrapolated → prompt A5 frame D5f (FR-I1) · flow F6', anchor='empty-template-warning')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Remove the last section from Membership?</h2></div>
  <div class="body"><div class="banner notice"><span class="ico">!</span><span>This template stops shipping. Any Ghost page
    still pointing at <span class="mono">custom-membership.hbs</span> will still load — it will just wear your ordinary
    page design instead. <b>Ghost won&rsquo;t warn anyone, which is why we are.</b></span></div></div>
  <div class="foot"><a class="btn secondary" href="editor.html" style="box-shadow:var(--focus)">Keep it</a>
    <a class="btn danger-out" href="editor.html">Remove it</a></div></div></div>""", cls='narrow')
     + head('The blank canvas', 'One affordance and nothing else. <b>The canvas is sacred</b>: no grid, no placeholder, no '
            'dotted rectangle pretending to be a section.', 'S4a, empty', anchor='empty')
     + screen(f"""<div class="ed short">{edbar()}<div class="edmid">
  <div class="layers"><div class="list"><span class="panel-label" style="padding:6px 8px">Layers</span>
    <div class="sitewide"><div class="row gap8" style="padding:2px 6px 6px"><span class="panel-label" style="font-size:11px">SITE-WIDE</span>
        <span class="helper" style="margin-left:auto">on 9 templates</span></div>
      <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Header</span></div>
      <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Footer</span></div></div>
    <span class="helper" style="padding:8px">This template has no sections yet.</span></div>
    <div style="border-top:1px solid var(--line);padding:10px"><a class="btn dashed" href="section-picker.html" style="width:100%">+ Add section</a></div></div>
  <div class="canvasmat" style="display:flex;align-items:center;justify-content:center">
    <a class="btn dashed lg" href="section-picker.html">+ Add section</a></div>{SIDEBAR_EMPTY}</div></div>""")
     + head('Loading', 'Skeleton section blocks, matching the shape that is coming.', anchor='loading')
     + screen(f"""<div class="ed short">{edbar()}<div class="edmid">{layerspanel()}
  <div class="canvasmat"><div class="site"><div class="stack gap12" style="padding:24px">
    <div class="thumb" style="height:60px"></div><div class="thumb" style="height:180px"></div>
    <div class="thumb" style="height:140px"></div><div class="thumb" style="height:100px"></div></div></div></div>
  {SIDEBAR_EMPTY}</div></div>""")
     + head('When the Content API cannot be reached',
            'The canvas falls back to sample content <b>and names the cause</b> — never a silent switch, because a designer '
            'judging a layout needs to know whose words they are looking at.', 'FR-H4', anchor='error')
     + screen(f"""<div class="ed short">{edbar()}<div class="edmid">{layerspanel()}
  <div class="canvasmat"><div style="max-width:864px;margin:0 auto 10px">
    <div class="banner notice"><span class="ico">!</span><span><b>We couldn&rsquo;t reach orbitweekly.com just now, so the
      canvas is showing sample content.</b> Your project is untouched — this is a reading problem, not a writing one.
      <a href="sites.html">Re-check the connection</a></span></div></div>
    {owsite()}</div>{SIDEBAR_EMPTY}</div></div>""")
     + head('Read-only — over the Free limit', 'Canvas fully legible, sidebar dimmed to 55%, controls visible but inert. '
            '<b>Export is not disabled.</b> Read-only means not editable; it never means locked in (FR-J12).',
            'Extrapolated → prompt A4 frame D4e, on B5a&rsquo;s read-only treatment · J4 step 6', anchor='read-only-limit')
     + screen(f"""<div class="ed short">{edbar(ship='Ship it', shipref='over-limit-sheet.html')}
  <div style="background:var(--marigold-tint);padding:10px 16px" class="row gap12">
    <b style="font-size:13px">Read-only — this project is over your Free plan&rsquo;s limit.</b>
    <a class="btn sm secondary" href="over-limit-sheet.html#which-project">Make this the editable one</a>
    <a class="btn sm secondary" href="deploy-destination.html">Export theme zip</a></div>
  <div class="edmid">{layerspanel()}<div class="canvasmat">{owsite()}</div>
  <div class="sidebar dim">{SIDEBAR_SPLITFORM[len('<div class="sidebar">'):-len('</div>')]}</div></div></div>""")
     + head('Read-only — someone else holds the lock', 'The same treatment, a different banner. The whole three-party '
            'choreography is on its own page: <a href="edit-lock.html">Edit Lock</a>.',
            'B5a', anchor='read-only-session')
     + screen(f"""<div class="ed short">{edbar()}
  <div style="background:var(--sky-tint);padding:10px 16px" class="row gap12">
    <b style="font-size:13px">Rosa is editing this site — you are reading along.</b>
    <a class="btn sm secondary" href="edit-lock.html">Request editing</a></div>
  <div class="edmid">{layerspanel()}<div class="canvasmat">{owsite()}</div>
  <div class="sidebar dim">{SIDEBAR_SPLITFORM[len('<div class="sidebar">'):-len('</div>')]}</div></div></div>""")
     + head('Three empty states that render nothing at all, deliberately',
            'Each is a rule about the site being built rather than about the editor, and each was ruled once so no '
            'category has to decide it again.', anchor='empty-renders')
     + screen("""<div style="padding:24px;background:var(--surface)"><div class="stack gap10" style="max-width:780px;margin:0 auto">
  <div class="banner info"><span class="ico">ⓘ</span><span><b>The main feed at zero posts</b> shows the designated feed
    design&rsquo;s <b>own declared empty state</b> — never a back-filled one borrowed from somewhere else.</span></div>
  <div class="banner info"><span class="ico">ⓘ</span><span><b>A secondary feed at zero</b> renders nothing at all —
    heading and container together. An empty box with a heading over it is worse than no box.</span></div>
  <div class="banner info"><span class="ico">ⓘ</span><span><b>A section whose items the user typed</b> renders nothing at
    zero. An editor who has typed no steps is mid-build, not looking at an error.</span></div>
</div></div>""")
     + head('Below the floor, on a phone', 'Opening a project on a coarse pointer at a small viewport lands on '
            '<a href="small-screen-notice.html">Small Screen Notice</a> — a designed surface, not a broken layout. '
            'At 200% browser zoom on a desktop it lands <a href="editor.html#at-720">here</a> instead.', anchor='floor')
     + head('The editor at 834 — tablet, touch', 'The same four parts, rearranged rather than redesigned. Layers collapses '
            'to an icon rail and expands as an overlay; the Controls sidebar becomes an overlay panel anchored right, over '
            'the canvas, with a scrim; the canvas does not resize under it. <b>Every target is at least 44px</b> — the one '
            'thing this width changes about the controls themselves.',
            'Extrapolated → prompt A8 frame D8a (ruling R-76)', anchor='at-834')
     + screen(f"""<div class="ed short" style="max-width:834px;margin:0 auto">{edbar(extra='<a class="iconbtn" href="editor.html">⋯</a>')}
  <div class="edmid">
    <div style="width:56px;border-right:1px solid var(--line);padding:10px 8px;display:flex;flex-direction:column;gap:6px;flex-shrink:0">
      <div class="lthumb" style="width:40px;height:30px"></div><div class="lthumb" style="width:40px;height:30px"></div>
      <div class="lthumb" style="width:40px;height:30px"></div><div class="lthumb" style="width:40px;height:30px"></div>
      <span class="helper" style="text-align:center">L</span></div>
    <div class="canvasmat" style="position:relative;padding:16px">
      {owsite(selected='hero')}
      <div style="position:absolute;inset:0;background:var(--scrim)"></div>
      <div style="position:absolute;top:0;right:0;bottom:0;width:300px;background:var(--surface);box-shadow:var(--sh-lg)">
        <div class="sidebar" style="border-left:none">
          <div class="row gap8"><b style="font-size:13px">Home hero</b><a style="margin-left:auto" href="editor.html#at-834">✕</a></div>
          <div class="ctlgroup"><span class="control-label">Copy side</span>
            <span class="seg" style="height:44px;align-items:center"><span class="on">Left</span><span>Right</span></span></div>
          <div class="ctlgroup"><span class="control-label">Height</span>
            <span class="seg" style="height:44px;align-items:center"><span>Compact</span><span class="on">Comfortable</span><span>Tall</span></span></div>
          <span class="helper">44px targets throughout, and hover affordances also appear on tap-and-hold.</span></div></div>
    </div></div></div>""", cls='detail')
     + head('The editor at 720 — a desktop display at 200% browser zoom',
            'The <b>same</b> collapse as 834, but with a fine pointer: targets stay at their desktop sizes and hover still '
            'works. This frame is what proves the <a href="small-screen-notice.html">Small Screen Notice</a> does not fire '
            'here. Browser zoom is the reader&rsquo;s own accessibility setting and Inflozo may not defeat it (WCAG 1.4.4) — '
            'which is a different thing entirely from FR-D14&rsquo;s canvas scale.',
            'Extrapolated → prompt A8 frame D8b', anchor='at-720')
     + screen(f"""<div class="ed short" style="max-width:720px;margin:0 auto">{edbar()}
  <div class="edmid">
    <div style="width:48px;border-right:1px solid var(--line);padding:10px 6px;display:flex;flex-direction:column;gap:5px;flex-shrink:0">
      <div class="lthumb" style="width:34px;height:24px"></div><div class="lthumb" style="width:34px;height:24px"></div>
      <div class="lthumb" style="width:34px;height:24px"></div></div>
    <div class="canvasmat" style="padding:14px">{owsite()}</div></div></div>""", cls='detail')
     + head('The skip link', 'The <b>first focusable thing in the editor shell</b>, and the reason it exists is structural: '
            'the canvas renders the <i>user&rsquo;s own site</i>, so tabbing through it means tabbing through every link '
            'that site emits — a twelve-section homepage is dozens of stops before the sidebar.',
            'Extrapolated → prompt A8 frame D8c', anchor='skip-link')
     + screen("""<div style="padding:32px;background:var(--paper);display:flex;flex-direction:column;gap:16px;align-items:center">
  <div class="row gap16"><span class="btn secondary sm" style="box-shadow:var(--focus)">Skip the canvas</span>
    <span class="helper">focused</span></div>
  <div class="row gap16"><span class="btn secondary sm" style="opacity:.25">Skip the canvas</span>
    <span class="helper">at rest — where it sits when nobody has focused it</span></div>
  <p class="helper" style="max-width:520px;text-align:center">The canvas container offers the same on focus.
    <span class="kbd">Esc</span> steps outward one level per press and announces where it landed: inline editing → the
    section stays selected; section selected → deselects, focus rests on the canvas container; canvas container → focus
    leaves for the editor chrome. Focus is never trapped and holding <span class="kbd">Esc</span> is never required.</p>
</div>""", cls='detail')
     + head('A destructive confirm, as it opens',
            '<b>Focus opens on the cancelling action</b>, never on the danger-fill button. Stated as a rule rather than a '
            'list, because the list would go stale — it already covers Take over anyway, Delete account, Roll back, project '
            'delete, delete-in-use assets and &ldquo;Overwrite and ship anyway&rdquo;, and it covers whatever is added next.',
            'Extrapolated → prompt A8 frame D8f', anchor='destructive-focus')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Take over from Rosa?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Rosa has not responded for 4 minutes.</p>
    <div class="banner error"><span class="ico">!</span><span><b>7 unsynced edits will be lost.</b> They exist only in
      Rosa&rsquo;s browser. We cannot retrieve them from here.</span></div></div>
  <div class="foot"><a class="btn secondary" href="edit-lock.html" style="box-shadow:var(--focus)">Wait</a>
    <a class="btn danger" href="edit-lock.html">Take over anyway</a>
    <a class="btn ghost" href="edit-lock.html">Or message Rosa</a></div></div></div>""", cls='narrow')
     + head('The shortcuts, and the rule that keeps them WCAG-clean',
            'FR-D11&rsquo;s map is the complete set of <b>global</b> shortcuts. Standard within-component keyboard behaviour '
            '— arrows through a list, <span class="kbd">Enter</span> to select, <span class="kbd">⌥</span>-arrow to move a '
            'row, <span class="kbd">⌥F10</span> into a toolbar — is not a shortcut in that sense and is <b>required</b>.',
            'Editor Sidebar Kit · shortcut rows', anchor='shortcuts')
     + screen("""<div style="padding:24px;background:var(--surface)">
  <div class="grid g3 gap12">""" + ''.join(f"""<div class="row gap10" style="padding:8px 0;border-bottom:1px solid var(--line-faint)">
      <span style="font-size:13px" class="grow">{a}</span>{''.join(f'<span class="kbd">{k}</span>' for k in ks)}</div>"""
    for a, ks in [('Insert section', ['⌘K']), ('Previous / next design', ['[', ']']), ('Duplicate', ['⌘D']),
                  ('Delete', ['Del']), ('Undo / redo', ['⌘Z', '⇧⌘Z']), ('Save now', ['⌘S']),
                  ('Device preview', ['1', '2', '3']), ('Layers', ['L']), ('Dark toggle', ['.']),
                  ('Deselect', ['Esc']), ('Preview Mode', ['P']), ('Site Remix', ['⇧R']), ('Ship it', ['⌘⏎'])]) + """
  </div>
  <div class="banner info" style="margin-top:16px"><span class="ico">ⓘ</span><span>
    <b>Every single-character shortcut is live only while the editor shell holds focus</b>, and never while a text field or
    a contenteditable has it — WCAG 2.1.4 Character Key Shortcuts. Without that rule, a speech-input user saying a word
    near the canvas fires Preview Mode or a Site Remix. <span class="mono">⌘</span>-modified shortcuts are unaffected.
    <b>axe-core cannot see this</b>, which is exactly why it is written down.</span></div>
  <div class="banner info" style="margin-top:10px"><span class="ico">ⓘ</span><span>
    Undo is 100 <b>edits</b>, not operations, and it survives a reload because it is the journal tail. One gesture is one
    edit: a Variant Shuffle rewrites every prop of a section and is <b>one</b> undo step.
    <b>No operation count is ever surfaced anywhere in the product.</b></span></div>
</div>"""),
     subs=[SUB('Hover and selection', 'selected', 'S4b · S4c'),
           SUB('Design Picker', 'design-picker', 'B1a'),
           SUB('Design Nav', 'design-nav', 'B1b'),
           SUB('Control Sidebar', 'control-sidebar', 'B2 · P0-0'),
           SUB('Inline Toolbar', 'inline-toolbar', 'P0-1'),
           SUB('Link Entry', 'link-entry', 'B4b'),
           SUB('Template Switcher', 'template-switcher', 'D5b'),
           SUB('Layers', 'layers', 'B7'),
           SUB('Layers row, focused', 'layers-focused', 'D8e'),
           SUB('Persistence Indicator', 'persistence', 'B6'),
           SUB('Content Source Pill', 'content-source', 'B9'),
           SUB('Preview Subject Picker', 'preview-subject', 'D5e'),
           SUB('Member State Preview', 'member-state', 'S4d'),
           SUB('Pro Design Badge', 'pro-badge', 'B10'),
           SUB('Auto-Generated Marker', 'auto-generated', 'D5a'),
           SUB('Main Feed Marker', 'main-feed', 'D5c'),
           SUB('Page 2 Preview', 'page2', 'D5d'),
           SUB('Empty Template Warning', 'empty-template-warning', 'D5f'),
           SUB('Editor — empty canvas', 'empty', 'S4a'),
           SUB('Editor — loading', 'loading', 'skeletons'),
           SUB('Editor — content unreachable', 'error', 'FR-H4'),
           SUB('Read-only — over limit', 'read-only-limit', 'D4e'),
           SUB('Read-only — someone else editing', 'read-only-session', 'B5a'),
           SUB('Empty renders', 'empty-renders', 'R-36 · R-41'),
           SUB('Below the floor', 'floor', 'R-76'),
           SUB('Editor at 834', 'at-834', 'D8a'),
           SUB('Editor at 720', 'at-720', 'D8b'),
           SUB('Skip the canvas', 'skip-link', 'D8c'),
           SUB('Destructive confirm focus', 'destructive-focus', 'D8f'),
           SUB('Keyboard shortcuts', 'shortcuts', 'FR-D11')])


CATEGORY_RAIL = ''.join(
    f'<div class="row gap8" style="padding:5px 8px;border-radius:6px;font-size:12.5px;'
    f'{"background:var(--coral-tint);font-weight:600" if c == "Heroes" else "color:var(--ink-soft)"}">'
    f'<span class="grow">{c}</span></div>'
    for c in ['Headers', 'Announcement Bars', 'Heroes', 'Post Grids', 'Featured Posts', 'Post Lists',
              'Archive Feeds', 'Tag Pages', 'Author Pages', 'Post Headers', 'Post Content', 'Post Footers',
              'Related Posts', 'Comments', 'Newsletter Signup', 'Membership Tiers', 'Paywalls',
              'Account &amp; Portal', 'About', 'Team', 'Testimonials', 'Logos &amp; Press', 'Stats', 'Features',
              'FAQ', 'Contact', 'Pricing Tables', 'CTA Bands', 'Galleries', 'Video &amp; Audio', 'Search',
              'Footers', 'Legal', '404 &amp; Empty'])

PICKER_CARDS = ''.join(f"""<div class="card"><div class="thumb" style="height:150px;border-radius:12px 12px 0 0;border:none;display:flex;align-items:center;justify-content:center">
    <span class="helper" style="font-family:var(--serif);font-size:13px;padding:12px;text-align:center">{prev}</span></div>
  <div class="pad-tight row gap8"><b style="font-size:12.5px" class="grow">{n}</b>{b}</div></div>"""
    for n, b, prev in [
      ('Split Editorial', '<span class="badge free">Free</span>', 'ISSUE 47 · ESSAYS<br>The slow return of the personal homepage'),
      ('Editorial Stack', '<span class="badge pro">✦ Pro</span>', 'ORBIT WEEKLY<br>Essays for the unhurried web'),
      ('Full-bleed Cover', '<span class="badge pro">✦ Pro</span>', 'FIELD NOTES<br>Notes from a quieter internet'),
      ('Centered Classic', '<span class="badge free">Free</span>', 'SUNDAY ESSAYS<br>Orbit Weekly, issue by issue'),
      ('Magazine Duo', '<span class="badge free">Free</span>', 'Read widely, scroll less'),
      ('Big Serif Statement', '<span class="badge pro">✦ Pro</span>', 'The web is a <i>garden</i>, not a feed.'),
      ('Photo Ribbon', '<span class="badge free">Free</span>', 'Sunday essays on the humane web'),
      ('Minimal Masthead', '<span class="badge free">Free</span>', 'ORBIT WEEKLY<br>A homepage worth keeping'),
      ('Member Welcome', '<span class="badge pro">✦ Pro</span>', 'MEMBERS<br>Join 4,100 readers of the Sunday orbit')])


def picker(title, grid, note=''):
    return f"""<div style="height:820px;background:var(--paper);display:flex;flex-direction:column">
  <div class="row gap12" style="padding:16px 24px;border-bottom:1px solid var(--line)">
    <div class="search" style="width:420px">{ICON['search']}<span class="grow">Find a section…</span><span class="kbd">⌘K</span></div>
    <a class="btn secondary sm" style="margin-left:auto" href="editor.html">Esc — close</a></div>
  <div class="row" style="flex:1;min-height:0;align-items:stretch">
    <div style="width:230px;border-right:1px solid var(--line);padding:12px 10px;overflow:auto">
      <span class="panel-label" style="display:block;padding:4px 8px">All categories</span>
      {CATEGORY_RAIL}
      <div class="row gap8" style="padding:10px 8px 4px;border-top:1px solid var(--line-faint);margin-top:8px">
        <span class="toggle"></span><span class="small soft">Free only</span></div></div>
    <div class="grow" style="padding:20px 24px;overflow:auto">
      <div class="row gap10" style="margin-bottom:14px"><h2 style="font-size:18px">{title}</h2>
        <span class="helper">shown in your pack: Paper · with your real posts</span></div>
      {grid}{note}</div></div></div>"""


page('section-picker', 'Section Picker', 'Editor',
     'S5 Section Picker.dc.html — S5a light, S5c dark preview',
     '§ IA → Editor · § State Patterns → Section Picker · J2 step 2',
     screen(picker('Heroes', f'<div class="grid g3">{PICKER_CARDS}</div>'),
            capt='S5a · section picker — full-screen, category rail, live previews in the project&rsquo;s own pack · 1440')
     + head('Dark preview on — and the app chrome stays light',
            'Dark-mode authoring is on both plans. The previews go dark; <b>Inflozo&rsquo;s own chrome does not</b>, '
            'because there is no app dark mode in v1. The two dark surfaces in the whole app are the canvas previewing '
            'dark and the template-surface canvases.', 'S5c', anchor='dark')
     + screen(picker('Heroes', '<div class="grid g3">' + PICKER_CARDS.replace(
         'class="thumb" style="height:150px;border-radius:12px 12px 0 0;border:none;',
         'class="thumb" style="height:150px;border-radius:12px 12px 0 0;border:none;background:#171511;color:#F0EAE0;') + '</div>'))
     + head('Loading', 'Previews are lazy, and what arrives first is a skeleton in the shape of the card that is coming.',
            anchor='loading')
     + screen(picker('Heroes', '<div class="grid g3">' + ''.join(
         '<div class="card"><div class="thumb" style="height:150px;border-radius:12px 12px 0 0;border:none"></div>'
         '<div class="pad-tight row gap8"><div class="thumb" style="height:11px;width:60%"></div></div></div>'
         for _ in range(9)) + '</div>'))
     + head('Search with no matches', 'The category rail stays, and the grid says what was searched for. Never a blank panel.',
            'S5a · empty search', anchor='no-matches')
     + screen(picker('Search', """<div style="padding:48px;text-align:center" class="stack gap10">
        <b style="font-size:15px">Nothing matches &ldquo;podcast chapters&rdquo;.</b>
        <span class="helper">Try a category on the left, or a plainer word — the designs are named for what they look
          like, not for what you would put in them.</span></div>"""))
     + head('What the picker never offers you',
            'A design whose <span class="mono">bindingContext</span> does not match this template is <b>never shown</b> — '
            'not greyed, not shown-and-refused (FR-D12). And a second Post Content section is refused at placement, with '
            'the reason, because the layout already prints the article (ruling R-37).', anchor='refusals')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;flex-direction:column;gap:12px;max-width:640px;margin:0 auto">
  <div class="banner info"><span class="ico">ⓘ</span><span>On a Tag archive the picker never lists a design that binds a
    single post. It is not in the grid at all — showing it and refusing it would teach the user nothing.</span></div>
  <div class="banner notice"><span class="ico">!</span><span><b>This layout already prints the article.</b>
    A page can have one Post Content section, so this one was not placed.</span></div></div>""", cls='narrow'),
     subs=[SUB('Dark preview', 'dark', 'S5c'), SUB('Section Picker — loading', 'loading', 'skeletons'),
           SUB('No matches', 'no-matches', ''),
           SUB('What is never offered', 'refusals', 'FR-D12 · R-37')])

page('variant-shuffle', 'Variant Shuffle', 'Editor',
     'S6 Variant Shuffle.dc.html',
     '§ IA → Editor · § Interaction Primitives · J2 step 4',
     screen(f"""<div class="ed">{edbar(ship='Ship update')}<div class="edmid">{layerspanel()}
  <div class="canvasmat"><div style="max-width:864px;margin:0 auto 8px" class="row">
      <span class="pill"><span>Hero — Editorial Stack</span><span class="mono">4 / 18</span>
        <a href="variant-shuffle.html">◀</a><a href="variant-shuffle.html">▶</a><a href="variant-shuffle.html">Shuffle</a></span></div>
    <div class="site">
      <div style="padding:38px 32px;display:flex;gap:28px;align-items:center;opacity:.35">
        <div class="stack gap10" style="flex:1"><span class="ow-eyebrow">ISSUE 47 · ESSAYS</span>
          <span class="ow-h1">The slow return of the personal homepage</span><span class="ow-meta">Maya Chen · Aug 14 · 9 min read</span></div>
        <div class="ow-photo" style="flex:1;aspect-ratio:4/3"><span>same feature photo</span></div></div>
      <div class="stack gap10 outline-sel" style="padding:38px 32px;align-items:center;text-align:center">
        <span class="ow-eyebrow">ISSUE 47 · ESSAYS</span>
        <span class="ow-h1" style="font-size:36px;max-width:600px">The slow return of the personal homepage</span>
        <span class="ow-meta">Maya Chen · Aug 14 · 9 min read</span>
        <div class="ow-photo" style="width:100%;aspect-ratio:21/9;margin-top:10px"><span>same feature photo</span></div></div>
    </div>
    <div class="row" style="max-width:864px;margin:12px auto 0;justify-content:center">
      <span class="pill"><span>Design 4 of 18 — Editorial Stack</span><a href="editor.html">Undo</a><span class="kbd" style="background:transparent;border-color:rgba(255,255,255,.3);color:#fff">⌘Z</span></span></div>
  </div>
  <div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">Hero</b><span class="chip mono" style="margin-left:auto">4 / 18</span></div>
    <div class="ctlgroup"><span class="panel-label">Design</span>
      <div class="dstrip">{''.join(f'<span class="dthumb{" on" if i == 3 else ""}"></span>' for i in range(11))}<span class="dthumb">+6</span></div>
      <span class="helper">Editorial Stack — same words, new arrangement</span></div>
    <div class="ctlgroup"><span class="control-label">Density</span>
      <span class="seg"><span>Compact</span><span class="on">Comfortable</span><span>Spacious</span></span></div>
    <div class="ctlgroup"><span class="control-label">Colours</span>
      <div class="swatches"><span class="sw" style="background:#FBF9F5"></span><span class="sw" style="background:#FFFFFF"></span>
        <span class="sw on" style="background:#D96C3F"></span><span class="sw" style="background:#232019"></span></div></div>
    <div class="ctlgroup"><span class="control-label">Image side</span>
      <span class="seg"><span class="on">Left</span><span>Right</span></span></div>
    <div class="ctlgroup"><span class="control-label">Image scrim</span>
      <span class="seg"><span class="on">None</span><span>Soft</span><span>Strong</span></span></div>
    <div class="stack gap6"><span class="panel-label">Try a variant</span>
      <div class="row gap8"><div class="thumb" style="width:56px;height:38px"></div>
        <span class="stack"><b style="font-size:12.5px">Full-bleed Cover</b><span class="helper">Same words, new look</span></span>
        <span class="badge pro" style="margin-left:auto">✦ Pro</span></div></div>
  </div></div></div>""", capt='S6 · variant shuffle — mid-moment · 1440'),
     note='<b>A Shuffle is one edit, not several operations</b> (AD-16). It rewrites every prop of the section and is a '
          'single undo step, which is what makes &ldquo;one undo, always&rdquo; true. The canvas status region announces '
          'the result politely — <i>&ldquo;Design 4 of 18 — Editorial Stack&rdquo;</i> — because the change is the one '
          'thing a screen-reader user cannot see happen.')


PACKS = ['Paper', 'Tangerine', 'Ink', 'Meadow', 'Harbor', 'Dune', 'Neon Dusk', 'Cocoa', 'Mist', 'Berry', 'Slate', 'Butter']
PACKCELLS = ''.join(
    f'<div class="stack gap4" style="align-items:center"><div class="thumb" style="width:100%;height:52px;'
    f'display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:18px'
    f'{";box-shadow:0 0 0 2px var(--coral)" if p == "Paper" else ""}">Ag</div>'
    f'<span class="helper">{p}</span></div>' for p in PACKS)

page('style-packs', 'Style Packs', 'Editor',
     'S7 Style Packs.dc.html — S7a panel, S7b mid-switch crossfade, S7c edit pack, S7d new pack',
     '§ IA → Editor · J2 step 7',
     screen(f"""<div class="ed">{edbar()}<div class="edmid">{layerspanel()}
  <div class="canvasmat">{owsite()}</div>
  <div class="sidebar">
    <div class="row gap8"><span class="panel-label grow">Style Pack</span>
      <div class="thumb" style="width:40px;height:28px;display:flex;align-items:center;justify-content:center;font-family:var(--serif)">Ag</div>
      <b style="font-size:13px">Paper</b><span class="badge live">Current</span></div>
    <div class="grid g3 gap8">{PACKCELLS}
      <a class="stack gap4" href="style-packs.html#new" style="align-items:center">
        <div class="thumb" style="width:100%;height:52px;display:flex;align-items:center;justify-content:center;border-style:dashed">+</div>
        <span class="helper">New pack</span></a></div>
    <div class="ctlgroup"><span class="control-label">Title font</span>
      <div class="row gap8"><span style="font-family:var(--serif);font-size:16px">Aa</span><span style="font-size:13px">Georgia</span></div></div>
    <div class="ctlgroup"><span class="control-label">Body font</span>
      <div class="row gap8"><span style="font-size:16px">Aa</span><span style="font-size:13px">Inter</span></div></div>
    <div class="ctlgroup"><span class="control-label">Site width</span>
      <span class="seg"><span>Narrow</span><span class="on">Standard</span><span>Wide</span></span></div>
    <div class="ctlgroup"><span class="control-label">Corners</span>
      <span class="seg"><span>Sharp</span><span class="on">Soft</span><span>Round</span></span></div>
    <div class="ctlgroup"><span class="control-label">Density</span>
      <span class="seg"><span>Compact</span><span class="on">Comfortable</span><span>Spacious</span></span></div>
    <div class="ctlgroup"><span class="control-label">Buttons</span>
      <span class="seg"><span class="on">Solid</span><span>Soft</span><span>Outline</span></span></div>
    <a class="btn secondary sm" href="style-packs.html#edit">Edit this pack</a>
  </div></div></div>""", capt='S7a · style pack panel — Paper current · 1440')
     + head('Mid-switch', 'A 300ms crossfade, long enough to see the site change its mind — which is the moment the product '
            'is selling. Under <span class="mono">prefers-reduced-motion</span> it becomes an instant state change, never a '
            'removed affordance.', 'S7b · canvas crossfading Paper → Tangerine', anchor='crossfade')
     + screen("""<div style="padding:24px;background:var(--mat);display:flex;justify-content:center">
  <div style="position:relative;max-width:640px;width:100%">
    <div class="site" style="opacity:.45"><div class="ow-nav"><span class="ow-brand">Orbit Weekly</span>
        <span class="ow-links"><span>Essays</span><span>Notes</span></span><span class="ow-sub">Subscribe</span></div>
      <div class="stack gap8" style="padding:28px 32px"><span class="ow-eyebrow">ISSUE 47 · ESSAYS</span>
        <span class="ow-h1">The slow return of the personal homepage</span></div></div>
    <div class="site" style="position:absolute;inset:0;opacity:.6;background:#FFF4EA">
      <div class="ow-nav" style="border-color:#F0DFC9"><span class="ow-brand" style="font-family:var(--display)">Orbit Weekly</span>
        <span class="ow-links"><span>Essays</span><span>Notes</span></span><span class="ow-sub" style="background:#E8450A;border-radius:14px">Subscribe</span></div>
      <div class="stack gap8" style="padding:28px 32px"><span class="ow-eyebrow" style="color:#E8450A">ISSUE 47 · ESSAYS</span>
        <span class="ow-h1" style="font-family:var(--display);font-weight:700">The slow return of the personal homepage</span></div></div>
    <div class="row" style="position:absolute;bottom:-40px;left:0;right:0;justify-content:center">
      <span class="pill">Trying on Tangerine…</span></div></div></div>""", cls='detail')
     + head('Edit a pack', 'Seven colour roles per mode. <b>Dark is tuned separately, never just inverted</b> — every pack '
            'ships a hand-paired dark palette, which is why dark-mode authoring costs nothing extra on either plan.',
            'S7c · edit a pack', anchor='edit')
     + screen("""<div class="sheetwrap"><div class="sheet"><div class="head"><h2 style="font-size:20px">Edit pack</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">Seven roles per mode. Tap any swatch to change it — dark is
      tuned separately, never just inverted.</p></div>
  <div class="body">
    <label class="field"><span class="control-label">Pack name</span><input class="input" value="Maya&rsquo;s Warm" aria-label="Pack name"></label>
    <div class="stack gap8"><span class="panel-label">Light</span>
      <div class="row gap12 wrap">""" + ''.join(f"""<div class="stack gap4" style="align-items:center">
        <span class="sw" style="background:{c};width:32px;height:32px"></span><span class="helper">{r}</span></div>"""
    for r, c in [('Background', '#F7F5F2'), ('Surface', '#FFFFFF'), ('Text', '#232019'), ('Muted', '#6B6459'),
                 ('Border', '#E7E2DB'), ('Accent', '#D96C3F'), ('Contrast', '#3B382F')]) + """</div></div>
    <div class="stack gap8"><span class="panel-label">Dark</span>
      <div class="row gap12 wrap">""" + ''.join(f"""<div class="stack gap4" style="align-items:center">
        <span class="sw" style="background:{c};width:32px;height:32px"></span><span class="helper">{r}</span></div>"""
    for r, c in [('Background', '#171511'), ('Surface', '#1F1C17'), ('Text', '#F0EAE0'), ('Muted', '#A79E8F'),
                 ('Border', '#3A342B'), ('Accent', '#E0805A'), ('Contrast', '#F4EFE6')]) + """</div></div>
    <div class="banner notice"><span class="ico">!</span><span><b>Muted on Background is 3.8:1 — under 4.5:1.</b>
      Body text in that role would be hard to read. We are warning rather than blocking: it is your pack, and this is the
      warning that makes the choice fair.</span></div>
    <p class="helper">This is the one place in the product where a raw colour picker exists. Section controls carry named
      values only — never px, hex or CSS.</p></div>
  <div class="foot"><a class="btn ghost" href="style-packs.html">Reset to defaults</a>
    <a class="btn secondary" href="style-packs.html" style="margin-left:auto">Cancel</a>
    <a class="btn coral" href="style-packs.html">Save pack</a></div></div></div>""")
     + head('New pack', 'Starts from the current look, or straight from the connected site&rsquo;s own colours.',
            'S7d · new pack', anchor='new')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:20px">New pack</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">Starts from your current look — recolor it, name it, and it
      joins your pack grid.</p></div>
  <div class="body"><label class="field"><span class="control-label">Pack name</span><input class="input" placeholder="Untitled pack" aria-label="Pack name"></label>
    <div class="row gap10"><a class="btn secondary sm" href="style-packs.html#edit">Start from Paper</a>
      <a class="btn secondary sm" href="style-packs.html#edit">From your site</a></div></div>
  <div class="foot"><a class="btn secondary" href="style-packs.html">Cancel</a><a class="btn coral" href="style-packs.html">Save pack</a></div>
  </div></div>""", cls='narrow'),
     subs=[SUB('Mid-switch crossfade', 'crossfade', 'S7b'), SUB('Edit pack', 'edit', 'S7c'), SUB('New pack', 'new', 'S7d')])

page('site-remix', 'Site Remix', 'Editor',
     'B Missing Surfaces.dc.html — B8 (ruling R-77: &ldquo;Keep Free designs only&rdquo; dropped; the what-axis added)',
     '§ IA → Editor · § wrong mechanism → B8 · FR-D17 · J2 step 12',
     screen("""<div class="sheetwrap"><div class="sheet"><div class="head">
    <div class="row gap10"><h2 style="font-size:22px">Remix this site</h2><span class="kbd" style="margin-left:auto">⇧R</span></div>
    <p class="softaa" style="font-size:13px;margin-top:6px">Re-rolls every section to a different design in its own
      category. Your text, images and settings stay — only the arrangements change.</p></div>
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
        <span class="c">5 sections on Home.</span></span></label>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Every template</span>
        <span class="c">9 templates, 41 sections.</span></span></label>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Header and footer too</span>
        <span class="c">Includes the three site-wide sections, on every template at once.</span></span></label></div>
    <div class="banner info"><span class="ico">ⓘ</span><span>Remix always re-rolls from the whole library. If it lands a
      Pro design on a Free plan, the <a href="pro-exit-sheet.html">Pro Exit Sheet</a> catches it once, at the exit — which
      is the only place money is ever mentioned.</span></div></div>
  <div class="foot"><a class="btn secondary" href="editor.html">Cancel</a>
    <a class="btn coral" href="site-remix.html#done">Remix</a></div></div></div>""",
            capt='B8 · site remix — two axes, what and how far')
     + head('One undo, always', '', anchor='done')
     + screen("""<div style="padding:40px;background:var(--mat);display:flex;justify-content:center">
  <span class="pill"><span>Remixed 5 sections on Home.</span><a href="editor.html">Undo</a>
    <span class="kbd" style="background:transparent;border-color:rgba(255,255,255,.3);color:#fff">⌘Z</span></span></div>""", cls='detail'),
     note='<b>Two changes from the frame.</b> Ruling R-77 drops &ldquo;Keep Free designs only&rdquo; — a remix that avoids '
          'Pro designs quietly makes a smaller product feel like the whole one, and the exit sheet already handles it. '
          'And FR-D17&rsquo;s own axis is <b>what</b> is re-rolled, which the frame had no control for; it is added above '
          'the existing scope group, in components the frame already draws.')

page('preview-mode', 'Preview Mode', 'Editor',
     'B Missing Surfaces.dc.html — B3a editing (behaviours paused), B3b preview',
     '§ IA → Editor · § Interaction Primitives · FR-D20 · J2 step 10',
     screen(f"""<div class="ed short">{edbar(ship='Ship update', extra='<a class="btn sm secondary" href="preview-mode.html#on">Preview</a><span class="kbd">P</span>')}
  <div class="edmid">{layerspanel()}
  <div class="canvasmat"><div class="site">
    <div class="row gap10" style="padding:10px 32px;background:#3B382F;color:#F0EAE0;font-family:var(--ui);font-size:12px">
      <span>Issue 118 goes out Thursday · the paid archive opens then too</span>
      <span class="mono" style="margin-left:auto">02 : 14 : 09</span>
      <span class="badge notice">PAUSED</span></div>
    <div class="stack gap10" style="padding:36px 32px">
      <span class="ow-eyebrow">EVERY THURSDAY</span>
      <div class="row gap8"><span class="ow-h1">Seven links from the quiet web</span><span class="badge notice">3 OF 3</span></div>
      <span class="ow-dek">Checked by hand, sent on Thursdays. No tracking pixels, because I never got round to adding any.</span>
      <div class="row gap8"><span class="ow-sub">Subscribe</span><span class="ow-meta">Read the archive</span></div></div>
  </div></div>{SIDEBAR_EMPTY}</div></div>""",
            capt='B3a · editing — behaviours paused, each marked where it sits rather than in a status bar')
     + head('Preview Mode', 'Everything runs and all editing chrome is gone. The floating bar is the single exception, '
            'carrying the way back plus the three device widths — because checking a behaviour at 390 is the main reason '
            'to be in here. <span class="kbd">Esc</span> returns, as well as the button.',
            'B3b · preview — chrome off, everything running', anchor='on')
     + screen("""<div style="background:var(--mat);padding:0;position:relative">
  <div class="site" style="max-width:100%;border-radius:0;margin:0">
    <div class="row gap10" style="padding:10px 32px;background:#3B382F;color:#F0EAE0;font-family:var(--ui);font-size:12px">
      <span>Issue 118 goes out Thursday · the paid archive opens then too</span>
      <span class="mono" style="margin-left:auto">02 : 11 : 47</span></div>
    <div class="ow-nav"><span class="ow-brand">Orbit Weekly</span>
      <span class="ow-links"><span>Essays</span><span>Notes</span><span>About</span></span><span class="ow-sub">Subscribe</span></div>
    <div class="stack gap10" style="padding:48px 32px">
      <span class="ow-eyebrow">EVERY THURSDAY</span>
      <span class="ow-h1">Four hundred domains that never moved</span>
      <span class="ow-dek">Checked by hand, sent on Thursdays. No tracking pixels, because I never got round to adding any.</span>
      <div class="row gap8"><span class="ow-sub">Subscribe</span><span class="ow-meta">Read the archive</span></div></div>
  </div>
  <div class="row" style="position:absolute;bottom:20px;left:0;right:0;justify-content:center">
    <span class="pill" style="border-radius:var(--r-pill);padding:6px 8px">
      <a href="editor.html">Back to editing</a><span class="kbd" style="background:transparent;border-color:rgba(255,255,255,.3);color:#fff">esc</span>
      <a href="device-preview.html">Desktop</a><a href="device-preview.html">Tablet</a><a href="device-preview.html#mobile">Mobile</a></span></div>
</div>"""),
     note='<b>Layout-affecting CSS is always live</b> — sticky, hover, transitions — because it changes what the design '
          '<i>is</i>. JavaScript behaviour is suppressed while editing and its section renders in its resting state, with '
          'the PAUSED chip <b>on the behaviour itself</b>: without it a stopped countdown looks like a broken countdown. '
          'There is deliberately no &ldquo;preview in a new tab&rdquo; — that is the deploy preview URL&rsquo;s job, and '
          'offering both invites the question of which one is true.',
     subs=[SUB('Preview Mode — running', 'on', 'B3b')])


page('device-preview', 'Device Preview', 'Editor',
     'B Missing Surfaces.dc.html — B11a and B11b, with the user Zoom control removed (FR-D14, AD-21)',
     '§ IA → Editor · § wrong mechanism → B11 · § Responsive &amp; Platform · J2 step 11',
     screen(f"""<div class="ed">{edbar(extra='<span class="seg"><span class="on">Desktop</span><span>Tablet</span><span>Mobile</span></span>')}
  <div class="edmid">{layerspanel()}
  <div class="canvasmat"><div class="row gap10" style="max-width:864px;margin:0 auto 10px">
      <span class="chip mono">VIEWPORT 1440 × 900 · SHOWN AT 46%</span>
      <span class="helper">Fit-to-screen, and it is the only scale there is.</span></div>
    {owsite()}</div>{SIDEBAR_EMPTY}</div></div>""",
            capt='B11a · desktop 1440 × 900 — the mono chip states true size and scale together')
     + head('Mobile — a phone-shaped viewport, not a narrow column',
            'The canvas is a viewport, and switching device resizes it in <b>both</b> axes to a real device size — '
            '390 × 844, not a 390-wide column of infinite height. That is why the sticky header sticks, the full-screen '
            'hero fills, and <b>the fold is where the fold actually is</b>.', 'B11b', anchor='mobile')
     + screen(f"""<div class="ed">{edbar(extra='<span class="seg"><span>Desktop</span><span>Tablet</span><span class="on">Mobile</span></span>')}
  <div class="edmid">{layerspanel()}
  <div class="canvasmat" style="display:flex;flex-direction:column;align-items:center;gap:10px">
    <span class="chip mono">VIEWPORT 390 × 844 · SHOWN AT 55%</span>
    <div style="width:390px;height:464px;overflow:hidden;background:var(--paper-raised);box-shadow:var(--sh-md);border-radius:6px">
      <div class="ow-nav" style="padding:12px 16px"><span class="ow-brand" style="font-size:14px">Orbit Weekly</span><span>☰</span></div>
      <div class="stack gap8" style="padding:20px 16px"><span class="ow-eyebrow">EVERY THURSDAY</span>
        <span class="ow-h1" style="font-size:24px">Seven links from the quiet web</span>
        <span class="ow-dek">Checked by hand, sent on Thursdays.</span>
        <div class="input" style="display:flex;align-items:center;color:var(--ink-faint)">you@example.com</div>
        <span class="ow-sub" style="text-align:center">Subscribe</span></div>
      <div style="border-top:1px dashed var(--coral);position:relative;margin:0 16px">
        <span class="chip" style="position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:var(--coral-tint);color:var(--coral-text)">the fold</span></div>
      <div class="stack gap6" style="padding:20px 16px"><span style="font-family:var(--serif);font-size:16px">Latest issues</span>
        <span class="ow-meta">SAM OKAFOR · AUG 10</span></div>
    </div></div>{SIDEBAR_EMPTY}</div></div>""")
     + head('The control the frame drew and this product does not have',
            'B11 draws a user-operated <b>Fit / 55%</b> zoom picker. FR-D14 says there is no zoom in v1, and AD-21 says the '
            'only scale is fit-to-screen and it is never user-driven. <b>Keep the chip, remove the control.</b>',
            anchor='no-zoom')
     + screen("""<div style="padding:32px;background:var(--paper);display:flex;gap:32px;justify-content:center;flex-wrap:wrap">
  <div class="stack gap8" style="align-items:center"><span class="frame-cap" style="margin:0">kept</span>
    <span class="chip mono" style="font-size:12px;padding:6px 10px">VIEWPORT 390 × 844 · SHOWN AT 55%</span>
    <span class="helper" style="max-width:220px;text-align:center">It reports the true size and the automatic scale.
      A scaled canvas with no chip is a lie about size.</span></div>
  <div class="stack gap8" style="align-items:center"><span class="frame-cap" style="margin:0">deleted</span>
    <span class="seg" style="opacity:.3"><span class="on">Fit</span><span>55%</span><span>100%</span></span>
    <span class="helper" style="max-width:260px;text-align:center">Browser zoom is the reader&rsquo;s own accessibility
      setting and Inflozo neither owns it nor may defeat it. That is a different thing from canvas scale, and confusing
      the two is how a product ends up fighting WCAG 1.4.4.</span></div></div>""", cls='detail'),
     subs=[SUB('Mobile viewport', 'mobile', 'B11b'), SUB('The removed zoom control', 'no-zoom', 'FR-D14 · AD-21')])

TEMPLATE_SURFACES_NAV = """<div class="layers" style="background:var(--ink-deep);border-right-color:#3A342B">
  <div class="list" style="color:#F0EAE0">
    <span class="panel-label" style="color:#A79E8F;padding:6px 8px">POST TEMPLATE</span>
    <a class="lrow" href="post-content.html" style="color:#F0EAE0">Post header</a>
    <a class="lrow" href="post-content.html" style="color:#F0EAE0">Post content</a>
    <a class="lrow" href="post-content.html" style="color:#F0EAE0">Author card</a>
    <div style="height:1px;background:#3A342B;margin:8px"></div>
    <span class="panel-label" style="color:#A79E8F;padding:6px 8px">TEMPLATE SURFACES</span>
    <a class="lrow" href="paywall-editor.html" style="color:#F0EAE0;background:rgba(255,255,255,.08)">Paywall</a>
    <a class="lrow" href="editor-cards.html" style="color:#F0EAE0">Cards</a>
    <a class="lrow" href="error-pages.html" style="color:#F0EAE0">Error pages</a>
  </div></div>"""

page('paywall-editor', 'Paywall Editor', 'Editor',
     'C Post Body.dc.html — C3a the paywall canvas, C3b the designs and the no-paid-tiers empty state',
     '§ IA → Editor · § The three canvases that are not pages · § State Patterns → Paywall Editor · FR-H6',
     screen(f"""<div class="ed">{edbar(project='Orbit Weekly &nbsp;/&nbsp; Template surfaces &nbsp;/&nbsp; Paywall', template='Post', ink=True, ship='Ship update', extra='<span class="chip">NOT A PAGE SECTION</span>')}
  <div class="edmid">{TEMPLATE_SURFACES_NAV}
  <div class="canvasmat cold">
    <div class="row gap10" style="max-width:864px;margin:0 auto 10px;flex-wrap:wrap">
      <span class="pill"><span>How readers reach it</span></span>
      <span class="helper">Ghost cuts the post at the author&rsquo;s Public preview marker and renders this block in its
        place. You cannot move it.</span>
      <span class="chip" style="margin-left:auto">2 tiers · 1 free</span>
      <a class="small" href="paywall-editor.html#empty" style="color:var(--sky-text)">Tiers in Ghost admin →</a></div>
    <div class="site">
      <div class="stack gap12" style="padding:28px 32px;opacity:.55">
        <span style="font-family:var(--serif);font-size:22px">Who is actually paying</span>
        <p style="font-family:var(--serif);font-size:15px;line-height:1.65">Three of the four hundred are paid for by
          estates. Two are paid for by universities that forgot they were paying. The rest are individuals, and their
          renewal dates cluster in October for a reason nobody has ever explained to me.</p>
        <p style="font-family:var(--serif);font-size:15px;line-height:1.65">I asked eleven of them. Four said the date
          meant nothing. Three said it was when they had money. Two said October was when the old host used to bill, and</p>
      </div>
      <div style="border-top:1px dashed var(--coral);margin:0 32px;position:relative;height:22px">
        <span class="chip" style="position:absolute;top:-9px;left:0;background:var(--coral-tint);color:var(--coral-text)">GHOST CUTS HERE · PUBLIC PREVIEW MARKER</span></div>
      <div class="stack gap16 outline-sel" style="padding:8px 32px 32px">
        <div class="stack gap6"><span style="font-family:var(--serif);font-size:24px">The rest is for members</span>
          <span class="ow-dek">Eleven interviews, the full list of four hundred, and the spreadsheet behind it. Thursdays, no tracking.</span></div>
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
            <span class="helper">Two live calls a year</span><span class="btn coral sm">Choose Supporter</span></div></div></div>
        <span class="helper">Already a member? Sign in</span></div>
    </div>
    <p class="helper" style="max-width:864px;margin:10px auto 0">The article above is context, not editable here.</p>
  </div>
  <div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">Paywall</b><span class="chip mono" style="margin-left:auto">4 / 12</span></div>
    <div class="ctlgroup"><span class="panel-label">Design</span>
      <div class="dstrip">{''.join(f'<span class="dthumb{" on" if i == 3 else ""}"></span>' for i in range(11))}<span class="dthumb">+1</span></div>
      <span class="helper">Two Up — tiers side by side</span></div>
    <div class="ctlgroup"><span class="control-label">Preview treatment</span>
      <span class="seg"><span>None</span><span class="on">Fade</span><span>Blur</span></span>
      <span class="helper">This softens the last visible paragraph only. Hidden content is never sent to the browser, so
        there is nothing there to blur.</span></div>
    <div class="ctlgroup"><span class="control-label">Tiers to show</span>
      <span class="seg"><span class="on">All paid</span><span>Cheapest</span><span>One I pick</span></span></div>
    <div class="ctlgroup"><span class="control-label">On each tier</span>
      <div class="row gap10"><span class="toggle on"></span><span class="small">Benefits</span></div>
      <div class="row gap10"><span class="toggle on"></span><span class="small">Most picked</span></div>
      <div class="row gap10"><span class="toggle"></span><span class="small">Description</span></div>
      <div class="row gap10"><span class="toggle"></span><span class="small">Trial days</span></div></div>
    <div class="ctlgroup greyed"><span class="control-label">Monthly / yearly toggle</span>
      <span class="toggle on"></span>
      <span class="reason">Hidden when only one interval exists on your tiers.</span></div>
    <div class="ctlgroup"><span class="control-label">Surface</span>
      <span class="seg"><span>Page</span><span class="on">Tinted</span><span>Inverted</span></span></div>
    <a class="btn secondary sm" href="paywall-editor.html">Reset this design</a>
  </div></div></div>""", capt='C3a · the paywall canvas · 1440 — ink chrome, because a canvas that is not a page says so')
     + head('No paid tiers on the site', 'The empty state is <b>honest about Ghost, not about us</b>: with no paid tier '
            'Ghost&rsquo;s paywall never renders at all, so the design would be dead CSS. Two numbered steps, a Re-check '
            'rather than an instruction to reload, and permission to keep styling with sample tiers so the visit is not '
            'wasted. <b>Members disabled entirely gets the same shape, naming the setting.</b>',
            'C3b · the empty case', anchor='empty')
     + screen("""<div style="padding:40px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:600px"><div class="pad stack gap14">
    <div class="row gap8"><span class="chip">Template surfaces / Paywall</span><span class="badge neutral">0 PAID TIERS</span></div>
    <h2 style="font-size:20px">Nothing to sell yet</h2>
    <p style="font-size:13.5px;line-height:1.55">Ghost has no paid tiers for Orbit Weekly, so this block never renders —
      a members-only post shows the sign-in prompt instead. Add a tier in Ghost and the designs below light up.</p>
    <ol class="stack gap8" style="margin:0;padding-left:18px;font-size:13px">
      <li>Create a tier in Ghost admin, under Settings → Tiers</li>
      <li>Come back here and pick a design — we re-check on open</li></ol>
    <div class="row gap10"><a class="btn secondary" href="paywall-editor.html">Open Ghost admin</a>
      <a class="btn coral" href="paywall-editor.html">Re-check</a></div>
    <p class="helper">You can still style every paywall design with sample tiers — they just will not ship until a real
      tier exists.</p></div></div></div>""", cls='narrow'),
     note='This surface was reported as never drawn. <b>It is drawn</b> — C3a, at 1440, with its six controls, its '
          '&ldquo;how readers reach it&rdquo; explainer, three of its designs and the no-paid-tiers empty state. Its entry '
          'point is drawn twice more, and it sits in a drawn left-nav group, <b>Template surfaces</b>.',
     subs=[SUB('Paywall — no paid tiers', 'empty', 'C3b')])


page('editor-cards', 'Editor Cards', 'Editor',
     'S14 Editor Cards.dc.html — S14a card dropdown, S14b treatment dropdown, S14c reset confirm, '
     'S14d entry point, S14e callout selected',
     '§ IA → Editor · § The three canvases that are not pages · FR-Q7',
     screen(f"""<div class="ed">{edbar(project='Orbit Weekly &nbsp;/&nbsp; Template surfaces &nbsp;/&nbsp; Cards', ink=True, ship='Ship update',
        extra='<span class="seg"><span class="on">Treatment · Card</span><span>Card · Callout</span></span>')}
  <div class="edmid">{TEMPLATE_SURFACES_NAV.replace('href="paywall-editor.html" style="color:#F0EAE0;background:rgba(255,255,255,.08)"', 'href="paywall-editor.html" style="color:#F0EAE0"').replace('href="editor-cards.html" style="color:#F0EAE0"', 'href="editor-cards.html" style="color:#F0EAE0;background:rgba(255,255,255,.08)"')}
  <div class="canvasmat cold">
    <p class="frame-cap" style="max-width:864px;margin:0 auto 8px">STYLE-GUIDE POST FIXTURE · reading width · live in the project&rsquo;s Style Pack (Paper)</p>
    <div class="site"><div class="stack gap16" style="padding:32px;max-width:680px;margin:0 auto">
      <span style="font-family:var(--serif);font-size:26px;line-height:1.2">The slow return of the personal homepage</span>
      <span class="ow-meta">Maya Chen · Aug 14 · 9 min read</span>
      <p style="font-family:var(--serif);font-size:16px;line-height:1.7">The web used to point outward. A blogroll was a
        list of other people&rsquo;s homes, kept in public and updated by hand — reading one felt like being handed a map.</p>
      <div class="row gap12 outline-sel" style="background:#F4EFE6;padding:16px;border-radius:10px;align-items:flex-start">
        <span style="font-size:18px">💡</span>
        <span style="font-family:var(--serif);font-size:15px;line-height:1.6">Every essay in this series is free to read.
          The print annual collects them each October.</span></div>
      <p style="font-family:var(--serif);font-size:16px;line-height:1.7">What replaced it was a feed that points inward,
        and the difference is the whole story.</p>
      <p class="helper">Every other card in the set renders below in the same fixture, so a change is judged in context.</p>
    </div></div></div>
  <div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">Callout</b><span class="badge notice" style="margin-left:auto">CUSTOMISED</span></div>
    <div class="ctlgroup"><span class="control-label">Callout colours</span>
      <span class="seg"><span class="on">Pack tokens</span><span>Ghost&rsquo;s palette</span></span></div>
    <div class="ctlgroup"><span class="control-label">Background role</span>
      <span class="seg"><span>Base</span><span>Surface</span><span class="on">Tint</span><span>Accent</span></span></div>
    <div class="ctlgroup"><div class="row gap10"><span class="control-label grow">Emoji</span><span class="toggle on"></span></div></div>
    <div class="ctlgroup"><span class="control-label">Emoji size</span>
      <span class="seg"><span class="on">Small</span><span>Large</span></span></div>
    <div class="stack gap6"><span class="panel-label">From the Card treatment</span>
      <div class="row gap8"><span class="control-label soft grow">Plane</span><span class="small">Surface</span></div>
      <div class="row gap8"><span class="control-label soft grow">Space around</span><span class="small">Comfortable</span></div>
      <div class="row gap8"><span class="control-label soft grow">Corners</span><span class="small">Pack radius</span></div>
      <span class="helper">Treatment-decided, shown read-only. Change them on the Treatment, not per card.</span></div>
    <a class="btn secondary sm" href="editor-cards.html#reset">Reset to Ghost default</a>
  </div></div></div>""", capt='S14e · a callout selected — four controls, named values only')
     + head('The card dropdown — every Koenig card, in Ghost&rsquo;s order',
            '<b>Colour controls are never offered for header, signup and CTA cards.</b> The post author sets those inline '
            'in Ghost&rsquo;s editor, and a control that silently loses to an inline style is worse than none — so those '
            'three carry the note in the dropdown and in their panel.', 'S14a', anchor='cards')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="width:420px"><div class="pad-tight stack gap2">
    <span class="panel-label" style="padding:4px 8px">EVERY KOENIG CARD · GHOST&rsquo;S ORDER</span>""" + ''.join(
    f"""<div class="row gap8" style="padding:6px 8px;font-size:13px;border-radius:6px{';background:var(--coral-tint)' if n == 'Callout' else ''}">
      <span class="grow">{n}</span>{m}</div>"""
    for n, m in [('Image', ''), ('Markdown', ''), ('HTML', ''), ('Gallery', '<span class="badge notice">customised</span>'),
                 ('Divider', ''), ('Bookmark', ''), ('Email content', ''),
                 ('Call to action', '<span class="helper">no colour ctls</span>'), ('Public preview', ''),
                 ('Button', ''), ('Callout', '<span class="badge notice">customised</span>'), ('GIF', ''),
                 ('Toggle', ''), ('Audio', ''), ('Video', ''), ('File', ''), ('Product', ''),
                 ('Header', '<span class="helper">no colour ctls</span>'), ('Embeds', ''),
                 ('Signup', '<span class="helper">no colour ctls</span>')]) + """
    <p class="helper" style="padding:8px">Cards are styled once, site-wide. Authors keep inserting them per post in Ghost.
      18 cards are on Ghost defaults.</p></div></div></div>""", cls='detail')
     + head('The treatment dropdown', 'Chosen first, once per project. It sits <b>above</b> the per-card dropdown, and a '
            'per-card override that a new treatment claims is dropped <b>with a one-line notice in the panel</b> — never '
            'silently kept and outvoted.', 'S14b', anchor='treatment')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="width:320px"><div class="pad-tight stack gap2">
    <span class="panel-label" style="padding:4px 8px">WHOLE SET · ONE ACTIVE PER PROJECT</span>
    <div class="row gap8" style="padding:7px 8px;font-size:13px">Plain<span class="badge free" style="margin-left:auto">Free</span></div>
    <div class="row gap8" style="padding:7px 8px;font-size:13px;background:var(--coral-tint);border-radius:6px">Card<span class="badge free" style="margin-left:auto">Free</span></div>
    <div class="row gap8" style="padding:7px 8px;font-size:13px">Panel<span class="badge pro" style="margin-left:auto">✦ Pro</span></div>
    <div class="row gap8" style="padding:7px 8px;font-size:13px">Wide<span class="badge pro" style="margin-left:auto">✦ Pro</span></div>
    <div class="row gap8" style="padding:7px 8px;font-size:13px">Full Bleed<span class="badge pro" style="margin-left:auto">✦ Pro</span></div>
    <div class="row gap8" style="padding:7px 8px;font-size:13px">Contrast Band<span class="badge pro" style="margin-left:auto">✦ Pro</span></div>
    <p class="helper" style="padding:8px">Switching re-renders the fixture. Per-card overrides survive where they still apply.</p>
  </div></div></div>""", cls='tiny')
     + head('Reset to Ghost&rsquo;s default', 'Per card, <b>never whole-set</b>: twenty decisions removed by one click is a '
            'footgun with no matching user intent. The sentence names the count and the changed controls, and '
            '&ldquo;Posts keep their content&rdquo; is always the second sentence, because it is the fear to answer.',
            'S14c', anchor='reset')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Reset Callout to Ghost&rsquo;s default?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Removes your 3 changes — colours, emoji and emoji size —
    everywhere callouts appear. <b>Posts keep their content.</b></p></div>
  <div class="foot"><a class="btn secondary" href="editor-cards.html" style="box-shadow:var(--focus)">Cancel</a>
    <a class="btn danger-out" href="editor-cards.html">Reset card</a></div></div></div>""", cls='narrow')
     + head('Six cards get no panel, and the panel says why',
            'A GIF arrives as an image, markdown arrives as headings and links, and the two email cards never leave the '
            'newsletter. There is no preview to show because there is no card to see — so the row is <b>absent</b> with a '
            'note, not greyed.', 'C1c', anchor='no-panel')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="width:360px"><div class="pad-tight stack gap10">
    <span class="panel-label">Nothing to set</span>""" + ''.join(f"""<div class="stack gap2">
      <b style="font-size:13px">{n}</b><span class="helper">{d}</span>{l}</div>"""
    for n, d, l in [('GIF', 'Renders as an image card.', '<a class="small" href="editor-cards.html#cards">Open Image →</a>'),
                    ('Markdown', 'Ordinary headings, lists and links.', '<a class="small" href="post-content.html">Open Post content →</a>'),
                    ('HTML', 'The author&rsquo;s markup wins, and it should.', ''),
                    ('Email content', 'Stripped from the published post.', ''),
                    ('Email CTA', 'Ghost&rsquo;s newsletter template owns it.', ''),
                    ('Public preview', 'A marker, not a card.', '<a class="small" href="paywall-editor.html">Open Paywall →</a>')]) + """
  </div></div></div>""", cls='tiny'),
     subs=[SUB('Card dropdown', 'cards', 'S14a'), SUB('Treatment dropdown', 'treatment', 'S14b'),
           SUB('Reset confirm', 'reset', 'S14c'), SUB('The six cards with no panel', 'no-panel', 'C1c')])

page('post-content', 'Post Content', 'Editor',
     'C Post Body.dc.html — C2a on the canvas with the section selected · C4 the style-guide fixture',
     '§ IA → Editor · § The three canvases that are not pages · Appendix A §25',
     screen(f"""<div class="ed">{edbar(project='Orbit Weekly &nbsp;/&nbsp; Post template', template='Post', ship='Ship update')}
  <div class="edmid">
  <div class="layers"><div class="list">
    <span class="panel-label" style="padding:6px 8px">SITE-WIDE</span>
    <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Announcement</span></div>
    <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Header</span></div>
    <span class="panel-label" style="padding:10px 8px 6px">THIS TEMPLATE</span>
    <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Post header</span></div>
    <div class="lrow on">{ICON['grip']}<div class="lthumb"></div><span class="grow">Post content</span></div>
    <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Author card</span></div>
    <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Read next</span></div>
    <div class="lrow">{ICON['grip']}<div class="lthumb"></div><span class="grow">Footer</span></div>
    <div style="height:1px;background:var(--line);margin:8px"></div>
    <span class="panel-label" style="padding:6px 8px;color:var(--ink-soft)">TEMPLATE SURFACES</span>
    <a class="lrow" href="paywall-editor.html">Paywall</a>
    <a class="lrow" href="editor-cards.html">Cards</a>
    <a class="lrow" href="error-pages.html">Error pages</a>
  </div></div>
  <div class="canvasmat">
    <div class="row gap10" style="max-width:864px;margin:0 auto 10px">
      <span class="pill"><span class="dot mint"></span><span>Previewing with: <b>Style-guide article</b></span></span>
      <span class="chip">Design 3 of 9 · Measured</span>
      <span class="badge notice">Behaviours paused while editing</span></div>
    <div class="site outline-sel" id="fixture"><div class="stack gap16" style="padding:32px;max-width:680px;margin:0 auto">
      <span class="ow-eyebrow">ARCHIVE · ISSUE 118 · 14 AUGUST 2026</span>
      <span style="font-family:var(--serif);font-size:30px;line-height:1.18">The four hundred domains that refuse to move</span>
      <span class="ow-dek">Every October, a few hundred people renew an address they never expected anyone to visit.
        This is what they have in common, and what happens the year they stop.</span>
      <span class="ow-meta">ROSA MENENDEZ · 9 MIN READ · MEMBERS</span>
      <div class="ow-photo" style="aspect-ratio:16/9"><span>a 2004 capture of the oldest address on the list</span></div>
      <p style="font-family:var(--serif);font-size:16px;line-height:1.7"><span style="float:left;font-size:52px;line-height:.85;padding:4px 8px 0 0">E</span>very
        October a renewal notice goes out to four hundred people who have, between them, almost nothing in common except
        an address they have kept for longer than most companies survive.</p>
      <span style="font-family:var(--serif);font-size:20px">What the list is</span>
      <p style="font-family:var(--serif);font-size:16px;line-height:1.7">It began as a spreadsheet and it is still a
        spreadsheet, which is the first honest thing about it.</p>
      <div class="row gap12" style="background:#F4EFE6;padding:16px;border-radius:10px"><span style="font-size:18px">💡</span>
        <span style="font-family:var(--serif);font-size:15px">Every essay in this series is free to read.</span></div>
      <blockquote style="margin:0;border-left:3px solid #D96C3F;padding-left:16px;font-family:var(--serif);font-size:18px;font-style:italic">
        &ldquo;October was when the old host used to bill. The host has been gone for a decade.&rdquo;</blockquote>
      <p class="helper">…and one of every card type below, so a change is judged in context.</p>
    </div></div></div>
  <div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">Post content</b><span class="chip mono" style="margin-left:auto">3 / 9</span></div>
    <div class="ctlgroup"><span class="panel-label">Design</span>
      <div class="dstrip">{''.join(f'<span class="dthumb{" on" if i == 2 else ""}"></span>' for i in range(9))}</div>
      <span class="helper">Measured — a comfortable measure with a left index</span></div>
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
  </div></div></div>""", capt='C2a · post content on the canvas with the section selected · 1440')
     + head('Style-Guide Fixture', 'The canvas never shows a real post by default — it shows this. One of every card type, '
            'a heading profile that descends three levels, lists, code, a table and a pull-quote, arranged as a piece '
            'anyone would read on purpose. <b>It is the most-seen page in the product</b>, so it is written rather than '
            'assembled. Swap to a real post from the <a href="editor.html#content-source">content-source pill</a> at any '
            'time. The paywall is deliberately <b>not</b> in the fixture — a cut mid-article would stop it being readable '
            'end to end, and it has its own <a href="paywall-editor.html">canvas</a>.',
            'C4 · the fixture in full · 880 measure', anchor='fixture'),
     subs=[SUB('Style-Guide Fixture', 'fixture', 'C4')])


page('error-pages', 'Error Pages', 'Editor',
     'Editor left nav → Template surfaces, as C Post Body draws that group. Designs from the A31 category '
     '(404 &amp; Empty); shell from S4 Editor and C3a',
     '§ IA → Editor · § The three canvases that are not pages · FR-Q9',
     screen(f"""<div class="ed">{edbar(project='Orbit Weekly &nbsp;/&nbsp; Template surfaces &nbsp;/&nbsp; Error pages', ink=True, ship='Ship update',
        extra='<span class="seg"><span class="on">404</span><span>Private</span></span>')}
  <div class="edmid">{TEMPLATE_SURFACES_NAV.replace('href="paywall-editor.html" style="color:#F0EAE0;background:rgba(255,255,255,.08)"', 'href="paywall-editor.html" style="color:#F0EAE0"').replace('href="error-pages.html" style="color:#F0EAE0"', 'href="error-pages.html" style="color:#F0EAE0;background:rgba(255,255,255,.08)"')}
  <div class="canvasmat cold">
    <div class="row gap10" style="max-width:864px;margin:0 auto 10px">
      <span class="chip mono">error.hbs</span>
      <span class="helper">Ghost serves this for any 404 and any server error. It ships on every project.</span></div>
    <div class="site"><div class="stack gap16" style="padding:64px 32px;align-items:center;text-align:center">
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" stroke="#232019" stroke-width="1.5">
        <path d="M18 70l24-44 24 44z"/><path d="M42 40v14M42 60v2"/>
        <circle cx="92" cy="42" r="14" fill="#FFEDE8" stroke="#FF5941"/><path d="M86 42h12" stroke="#FF5941"/></svg>
      <span style="font-family:var(--serif);font-size:30px">That page has moved on.</span>
      <span class="ow-dek" style="max-width:420px">Nothing here at this address. The archive is still where you left it,
        and the search box below usually finds what you were after.</span>
      <div class="row gap10"><span class="ow-sub">Back to Orbit Weekly</span>
        <span class="ow-meta">Search the archive</span></div></div></div>
  </div>
  <div class="sidebar">
    <div class="row gap8"><b style="font-size:13px">404 page</b><span class="chip mono" style="margin-left:auto">2 / 6</span></div>
    <div class="ctlgroup"><span class="panel-label">Design</span>
      <div class="dstrip">{''.join(f'<span class="dthumb{" on" if i == 1 else ""}"></span>' for i in range(6))}</div>
      <span class="helper">Illustrated Apology — a line drawing and one way back</span></div>
    <div class="ctlgroup"><span class="control-label">Heading</span><input class="input" value="That page has moved on."></div>
    <div class="ctlgroup"><span class="control-label">Show search</span><span class="toggle on"></span></div>
    <div class="ctlgroup"><span class="control-label">Show recent posts</span><span class="toggle"></span></div>
    <div class="ctlgroup"><span class="control-label">Background role</span>
      <span class="seg"><span class="on">Base</span><span>Surface</span><span>Contrast</span></span></div>
  </div></div></div>""", capt='error.hbs, on the template-surface canvas · 1440')
     + head('The Private Gate, and why it is conditional',
            '<span class="mono">private.hbs</span> is emitted <b>only when a Private Site Gate section has been designed</b>. '
            'Until then the tab is here and the canvas explains what it would be — because a template that ships '
            'conditionally is easier to understand before you need it than after.',
            'A31 category · FR-D6', anchor='private')
     + screen("""<div style="padding:32px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:560px"><div class="pad stack gap12">
    <div class="row gap8"><span class="chip mono">private.hbs</span><span class="badge neutral">not shipping</span></div>
    <b style="font-size:15px">This template ships when you design a Private Site Gate.</b>
    <p style="font-size:13.5px;line-height:1.55">Ghost serves it when the whole site is set to private in Ghost Admin —
      a single password screen in front of everything. Design one and it starts shipping; leave it and Ghost uses its own.</p>
    <a class="btn secondary" href="section-picker.html" style="align-self:flex-start">Add a Private Site Gate</a></div></div></div>""",
              cls='narrow')
     + head('Where FR-Q9&rsquo;s fallback lands',
            'A treatment whose host section is absent from the project is <b>still selectable here</b>. That is the whole '
            'point of the Template surfaces group: these canvases are not pages, so there is no page for a treatment to '
            'go missing from.', anchor='fallback'),
     subs=[SUB('Private Gate', 'private', 'conditional'), SUB('FR-Q9 fallback', 'fallback', '')])

page('theme-settings', 'Theme Settings', 'Editor',
     'B Missing Surfaces.dc.html — B17 (re-specified and extended → Appendix A prompt A6, frames D6a–D6c)',
     '§ IA → Editor · § wrong mechanism → B17 · FR-Q1/Q2/Q3, FR-J15, FR-D7',
     screen(f"""<div class="ed">{edbar(project='Orbit Weekly &nbsp;/&nbsp; Theme settings', ship='Ship update')}
  <div class="edmid">
  <div class="layers"><div class="list">
    <span class="panel-label" style="padding:6px 8px">SETTINGS</span>
    <div class="lrow on"><span class="grow">Site basics</span></div>
    <div class="lrow"><span class="grow">Navigation</span></div>
    <div class="lrow"><span class="grow">Social accounts</span></div>
    <a class="lrow" href="translations.html"><span class="grow">Translations</span></a>
    <a class="lrow" href="editor-cards.html"><span class="grow">Editor cards</span></a>
    <div class="lrow"><span class="grow">Code injection</span></div>
  </div></div>
  <div class="canvasmat" style="background:var(--paper)"><div style="max-width:820px;margin:0 auto" class="stack gap16">
    <div class="card"><div class="pad stack gap12">
      <span class="panel-label">Posts per page</span>
      <div class="row gap12"><span class="stepper"><span>−</span><span class="v">12</span><span>+</span></span>
        <span class="helper" style="max-width:420px">How many posts your archives show before paginating.
          <b>Your theme owns this — Ghost has no setting for it</b>, which is why every surface in the product that
          mentions posts per page links here and never into Ghost Admin.</span></div></div></div>

    <div class="card"><div class="pad stack gap14">
      <span class="panel-label">Site basics</span>
      <span class="helper">Ghost owns the title, the logo and the accent — we read them and never write them.</span>
      <div class="row gap12"><span class="control-label" style="width:110px">Site title</span>
        <span class="input greyed" style="max-width:280px;display:flex;align-items:center;color:var(--ink-faint)">🔒 Orbit Weekly</span>
        <a class="small" href="theme-settings.html">Change this in Ghost ↗</a></div>
      <div class="row gap12"><span class="control-label" style="width:110px">Logo</span>
        <span class="row gap8"><span class="chip mono">orbit-wordmark.svg</span><span class="helper">SVG · 4 KB</span></span>
        <a class="small" href="theme-settings.html">Change this in Ghost ↗</a></div>
      <div class="row gap12"><span class="control-label" style="width:110px">Accent colour</span>
        <span class="row gap8"><span class="sw" style="background:#D96C3F"></span><span class="small">Burnt orange</span>
          <span class="chip">from Ghost</span></span>
        <span class="helper"><span class="mono">--ghost-accent-color</span>, which your Style Pack maps to its accent role.</span></div></div></div>

    <div class="card"><div class="pad stack gap12">
      <span class="panel-label">This project</span>
      <div class="row gap12"><span class="control-label" style="width:110px">Colour scheme</span>
        <span class="seg"><span>Light only</span><span class="on">Light + Dark</span></span>
        <span class="helper" style="max-width:340px">Every Style Pack ships a hand-paired dark palette, so dark is already
          paid for.</span></div>
      <div class="row gap12" style="padding-top:8px;border-top:1px solid var(--line-faint)">
        <span class="control-label" style="width:110px">Clear dark overrides</span>
        <span class="row gap8"><span class="badge neutral" title="Dark override">🌙 Dark override</span>
          <span class="small">3 sections carry a dark override</span></span>
        <a class="btn sm secondary" style="margin-left:auto" href="theme-settings.html">Clear them</a></div>
      <span class="helper">Wherever that badge appears it carries the accessible label &ldquo;Dark override&rdquo; —
        a 12px shape is not a signal on its own.</span></div></div>

    <div class="card"><div class="pad stack gap12">
      <span class="panel-label">Credits</span>
      <div class="row gap12"><span class="toggle on"></span>
        <span class="stack gap2 grow"><b style="font-size:13px">Show &ldquo;Built with Inflozo&rdquo;</b>
          <span class="helper">Appears in two places: the theme footer, and the README inside the exported zip.</span></span></div>
      <span class="helper">On Free this row is drawn identically and greyed, with the reason — see
        <a href="theme-settings.html#free">the Free state</a>. Greyed, never hidden.</span></div></div>

    <div class="card"><div class="pad stack gap14" id="custom-settings">
      <div class="row gap10"><span class="panel-label grow">Custom settings</span><span class="chip mono">3 OF 17</span></div>
      <span class="helper">Ghost allows twenty custom settings per theme. <b>Three of them are the dark-mode built-ins
        every Inflozo project declares</b>, so seventeen are yours. Promoted controls appear under Design in Ghost admin
        after your next deploy.</span>
      <div class="stack gap8">
        <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13px">Show reader count</b>
            <span class="helper">Home hero · Split Form</span></div>
          <span class="chip mono">show_reader_count</span><span class="badge neutral">boolean</span></div>
        <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13px">Posts on the home feed</b>
            <span class="helper">Latest issues · Count</span></div>
          <span class="chip mono">home_post_count</span><span class="badge neutral">select</span></div>
        <div class="itemrow"><div class="stack gap2 grow"><b style="font-size:13px">Announcement text</b>
            <span class="helper">Site-wide · Announcement</span></div>
          <span class="chip mono">announcement_text</span><span class="badge neutral">text</span></div></div>
      <div style="height:1px;background:var(--line-faint)"></div>
      <span class="panel-label">Promote a control</span>
      <div class="grid g2 gap12">
        <div class="field"><span class="control-label">Which control</span>
          <span class="input" style="display:flex;align-items:center">Post template · Measure</span></div>
        <div class="field"><span class="control-label">Label in Ghost</span><input class="input" value="Article width"></div>
        <div class="field"><span class="control-label">Group in Ghost</span>
          <span class="input" style="display:flex;align-items:center">Site wide</span></div>
        <div class="field"><span class="control-label">Key</span>
          <span class="input mono greyed" style="display:flex;align-items:center;color:var(--ink-faint)">article_width</span></div></div>
      <div class="stack gap6"><span class="control-label">Only show when</span>
        <div class="row gap8"><span class="input" style="max-width:150px;display:flex;align-items:center">Colour scheme</span>
          <span class="input" style="max-width:110px;display:flex;align-items:center">is</span>
          <span class="input" style="max-width:150px;display:flex;align-items:center">Light + Dark</span></div>
        <span class="helper">Optional. Ghost hides the setting entirely when the condition is false.</span></div>
      <div class="banner notice"><span class="ico">!</span><span><b>Keys freeze once you deploy or export</b> — pick them
        like you mean it. And promoting your accent means switching Style Packs changes what that Ghost setting points at.</span></div>
      <a class="btn coral sm" href="theme-settings.html" style="align-self:flex-start">Promote</a>
      <span class="helper">Named values only — Ghost&rsquo;s panel will show Narrow, Comfortable, Wide.</span></div></div>
  </div></div></div></div>""", capt='D6a · theme settings, Pro · 1440')
     + head('On Free, the credits row is greyed with its reason',
            'Not hidden. It exists here and is unavailable now, which is exactly what greyed means.',
            'D6b · theme settings, Free · 720', anchor='free')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:520px"><div class="pad stack gap10 greyed">
    <span class="panel-label">Credits</span>
    <div class="row gap12"><span class="toggle on"></span>
      <span class="stack gap2 grow"><b style="font-size:13px;color:var(--ink-faint)">Show &ldquo;Built with Inflozo&rdquo;</b>
        <span class="helper">Theme footer and the README inside the exported zip.</span></span></div>
    <span class="reason">Credits stay on with the Free plan. <a href="upgrade-sheet.html">Go Pro</a> to turn them off.</span>
  </div></div></div>""", cls='detail')
     + head('Promoting a text prop', 'Ghost&rsquo;s own settings are plain text, so the marks come off while the prop stays '
            'promoted. Said once, at the moment of choosing.', 'D6c · the text-prop promote confirm · 520', anchor='text-prop')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Promote &ldquo;Announcement text&rdquo;?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Ghost&rsquo;s own settings are plain text, so
    <b>bold, italic, underline and links will be removed from this field while it stays promoted.</b> The words are kept.</p></div>
  <div class="foot"><a class="btn secondary" href="theme-settings.html#custom-settings" style="box-shadow:var(--focus)">Cancel</a>
    <a class="btn coral" href="theme-settings.html#custom-settings">Promote it</a></div></div></div>""", cls='narrow'),
     note='<b>Four corrections to the frame, and one of them is this surface&rsquo;s own primary value.</b> '
          '<span class="mono">posts_per_page</span> is FR-Q1&rsquo;s first field and was missing entirely. The logo loses '
          'its Replace button — Ghost&rsquo;s logo is read, never written. The dark row was drawing the <i>visitor&rsquo;s</i> '
          'moon toggle; it becomes FR-D7&rsquo;s project mode. And the meter reads <b>3 of 17</b>, not 3 of 20.',
     subs=[SUB('Custom Settings Builder', 'custom-settings', 'B17 right column'),
           SUB('Theme Settings — Free', 'free', 'D6b'),
           SUB('Text-prop promote confirm', 'text-prop', 'D6c')])


page('translations', 'Translations', 'Editor',
     'B Missing Surfaces.dc.html — B18 (keys re-specified to FR-Q6&rsquo;s dotted namespaces; FR-Q8 error state added)',
     '§ IA → Editor · § wrong mechanism → B18 · FR-Q6, FR-Q8',
     screen("""<div style="padding:32px;background:var(--paper)"><div class="card" style="max-width:880px;margin:0 auto">
  <div class="pad stack gap14">
    <div class="row gap12"><h2 style="font-size:20px">Translations</h2>
      <span class="seg" style="margin-left:auto"><span class="on">Español · es</span><span>+ Add a locale</span></span></div>
    <p class="softaa" style="font-size:13px">Every string your theme prints. English is the default; overrides ship in
      <span class="mono">locales/</span>.</p>
    <table class="limits">
      <tr><th>Key</th><th>English default</th><th>Español</th></tr>""" + ''.join(f"""
      <tr><td class="mono" style="font-size:12px">{k}</td><td>{e}</td><td>{s}</td></tr>"""
    for k, e, s in [('member.signup_cta', 'Subscribe', 'Suscribirse'),
                    ('member.signin', 'Sign in', 'Iniciar sesión'),
                    ('post.read_more', 'Read more', 'Seguir leyendo'),
                    ('post.reading_time', '{n} min read', '{n} min de lectura'),
                    ('paywall.members_only', 'The rest is for members', 'El resto es para miembros'),
                    ('archive.empty_heading', 'Nothing here yet', 'Todavía nada'),
                    ('newsletter.note', 'No spam. Unsubscribe any time.', '<span class="helper">Falls back to English</span>')]) + """
    </table>
    <p class="helper">Keys are <b>dotted <span class="mono">namespace.name</span></b>, not flat words — a flat catalogue
      collides the moment two surfaces both want &ldquo;subscribe&rdquo;. Untranslated rows say
      <i>Falls back to English</i> rather than sitting empty, so an incomplete catalogue reads as safe rather than broken.
      Interpolation tokens like <span class="mono">{n}</span> survive into the translation and are shown, because a
      translator who deletes one breaks the string.</p>
    <div class="banner notice"><span class="ico">!</span><span><b>Right-to-left languages are not supported yet.</b>
      Our designs are built left-to-right. Arabic, Hebrew and Farsi strings will translate, but the layouts will not
      mirror — so we do not offer those locales rather than shipping something broken.
      <b>You will see this again on the pre-flight check before you deploy</b>, which is where it actually bites.</span></div>
  </div></div></div>""", capt='B18 · translations · 940')
     + head('The brace refusal', 'A malformed interpolation token is a whole-site 500, so it is refused <b>here</b>, at the '
            'moment of typing, rather than discovered at deploy.', 'FR-Q8', anchor='brace-error')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:560px"><div class="pad stack gap10">
    <div class="row gap12"><span class="mono" style="font-size:12px;width:150px">post.reading_time</span>
      <input class="input" value="{n min de lectura" style="border-color:var(--danger)" aria-label="Spanish translation"></div>
    <div class="banner error"><span class="ico">✕</span><span><b>That token is missing its closing brace.</b>
      <span class="mono">{n</span> would break every page that prints reading time — Ghost returns a 500 for the whole
      site, not just this string. Write <span class="mono">{n}</span>, or remove it.</span></div>
    <span class="helper">Not saved until it is valid. This is the one refusal in Translations, and it exists because the
      failure it prevents is total rather than local.</span></div></div></div>""", cls='narrow'),
     subs=[SUB('Brace refusal', 'brace-error', 'FR-Q8')])

page('routes-manager', 'Routes Manager', 'Editor',
     'S9 Routes.dc.html — S9a manager, S9b YAML error, S9c new collection, S9d empty, S9e new route '
     '(the drawn route rows re-specified: FR-I1/I5)',
     '§ IA → Editor · § wrong mechanism → S9 · § State Patterns → Routes Manager',
     screen("""<div style="min-height:820px;background:var(--paper);display:flex;flex-direction:column">
  <div class="row gap12" style="padding:16px 24px;border-bottom:1px solid var(--line)">
    <a href="editor.html">←</a><h2 style="font-size:18px">Routes &amp; Templates</h2>
    <span class="chip">O Orbit Weekly</span>
    <a class="btn secondary sm" style="margin-left:auto" href="editor.html">Done</a></div>
  <div class="row" style="flex:1;align-items:stretch">
    <div class="grow stack gap16" style="padding:24px;overflow:auto">
      <div class="stack gap8"><span class="panel-label">Collections</span>
        <p class="helper">Your homepage is a template built from sections — it lists posts only if you add a posts section.
          Collections are dedicated post listings, like Articles.</p>
        <div class="itemrow"><span class="chip mono">/articles/</span><div class="stack gap2 grow">
            <b style="font-size:13px">Articles</b><span class="helper">All posts, in one place · <span class="mono">type:post</span></span></div>
          <span class="badge neutral">Articles</span><span class="chip mono">12 / page</span><span class="soft">⋯</span></div>
        <div class="itemrow"><span class="chip mono">/tutorials/</span><div class="stack gap2 grow">
            <b style="font-size:13px">Tutorials</b><span class="helper">Guides &amp; how-tos · <span class="mono">tag:tutorials</span></span></div>
          <span class="badge neutral">Post Grid</span><span class="chip mono">10 / page</span><span class="soft">⋯</span></div>
        <div class="itemrow"><span class="chip mono">/notes/</span><div class="stack gap2 grow">
            <b style="font-size:13px">Notes</b><span class="helper">Short posts, no images · <span class="mono">tag:notes</span></span></div>
          <span class="badge neutral">Minimal List</span><span class="chip mono">20 / page</span><span class="soft">⋯</span></div>
        <a class="btn dashed sm" href="routes-manager.html#new-collection" style="align-self:flex-start">+ New collection</a>
        <p class="helper">A post lives in the first collection it matches — drag to reorder if posts land in the wrong place.</p></div>
      <div class="stack gap8"><span class="panel-label">Custom routes</span>
        <div class="itemrow"><span class="chip mono">/reading-list/</span><div class="stack gap2 grow">
            <b style="font-size:13px">Reading List</b><span class="helper">A channel — a filtered stream with its own RSS</span></div>
          <span class="soft">⋯</span></div>
        <a class="btn dashed sm" href="routes-manager.html#new-route" style="align-self:flex-start">+ Custom route</a>
        <div class="banner info"><span class="ico">ⓘ</span><span><b>Two rows the frame drew are gone, and both had to go.</b>
          A membership page emits <b>no route</b> — it is <span class="mono">custom-membership.hbs</span>, bound from
          Ghost&rsquo;s page editor (see the <a href="template-binding-checklist.html">binding checklist</a>). And
          <span class="mono">home.hbs</span> resolves for the root by itself; a <span class="mono">routes:</span> entry for
          <span class="mono">/</span> also removes the index collection, which breaks <span class="mono">/page/2/</span>.</span></div></div>
      <div class="stack gap8"><span class="panel-label">Taxonomies</span>
        <div class="itemrow"><b style="font-size:13px" class="grow">Tags</b><span class="chip mono">/topic/{slug}/</span><span class="badge neutral">Tag template</span></div>
        <div class="itemrow"><b style="font-size:13px" class="grow">Authors</b><span class="chip mono">/writer/{slug}/</span><span class="badge neutral">Author template</span></div></div>
    </div>
    <div style="width:420px;border-left:1px solid var(--line);background:var(--paper-sunk);padding:20px;overflow:auto" class="stack gap10">
      <div class="row gap8"><span class="panel-label grow">routes.yaml</span><span class="badge live">Valid</span></div>
      <span class="helper">generated live, ships with every deploy</span>
      <pre class="mono" style="font-size:12px;line-height:1.7;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:14px;margin:0;overflow:auto">collections:
  /articles/:
    permalink: /articles/{slug}/
    template: articles
    filter: type:post
  /tutorials/:
    permalink: /tutorials/{slug}/
    template: post-grid
    filter: tag:tutorials
    limit: 10
  /notes/:
    permalink: /notes/{slug}/
    template: minimal-list
    filter: tag:notes
    limit: 20

routes:
  /reading-list/:
    controller: channel
    filter: tag:reading

taxonomies:
  tag: /topic/{slug}/
  author: /writer/{slug}/</pre>
      <span class="helper">Ghost will accept this routing.</span></div>
  </div></div>""", capt='S9a · routes &amp; templates · 1440')
     + head('YAML error', 'Line-numbered, and <b>deploys are blocked until routing is valid — the Ship button carries the '
            'reason</b> rather than failing later.', 'S9b · validation error', anchor='error')
     + screen("""<div style="padding:24px;background:var(--paper-sunk)"><div class="stack gap10" style="max-width:520px;margin:0 auto">
  <div class="row gap8"><span class="panel-label grow">routes.yaml</span><span class="badge danger">1 error</span></div>
  <div class="banner error"><span class="ico">✕</span><span><b>Line 15</b> — filters use a colon: did you mean
    <span class="mono">tag:tutorials</span>?</span></div>
  <pre class="mono" style="font-size:12px;line-height:1.8;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:14px;margin:0">13    permalink: /tutorials/{slug}/
14    template: post-grid
<span style="background:var(--danger-tint);display:inline-block;width:100%">15    filter: tag=tutorials</span>
16  /notes/:</pre>
  <div class="row gap10"><span class="btn coral off">Ship it</span>
    <span class="reason">Your routing file has an error on line 15. Fix it and this unlocks.</span></div></div></div>""", cls='detail')
     + head('New Collection Sheet', 'Ghost&rsquo;s NQL, as condition rows. <b>Posts per page comes from Theme Settings</b>, '
            'and a collection&rsquo;s own <span class="mono">limit:</span> may override it for that route — the frame said '
            'it follows the home feed&rsquo;s Count control, which is not where that value lives. And the published-date '
            'field offers FR-I2&rsquo;s <b>relative</b> form first.', 'S9c · new collection', anchor='new-collection')
     + screen("""<div class="sheetwrap"><div class="sheet"><div class="head"><h2 style="font-size:20px">New collection.</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">A section of your site with its own URL and layout.</p></div>
  <div class="body">
    <label class="field"><span class="control-label">Path</span><input class="input mono" value="/travel/" aria-label="Path"></label>
    <div class="stack gap8"><div class="row gap10"><span class="control-label">Show posts that match</span>
        <span class="seg" style="margin-left:auto"><span class="on">All conditions</span><span>Any</span></span></div>
      <div class="row gap8"><span class="input" style="max-width:130px;display:flex;align-items:center">Tag</span>
        <span class="input" style="max-width:120px;display:flex;align-items:center">is any of</span>
        <span class="row gap6 grow"><span class="chip">Travel</span><span class="chip">Trains</span><span class="helper">add…</span></span></div>
      <div class="row gap8"><span class="input" style="max-width:130px;display:flex;align-items:center">Published</span>
        <span class="input" style="max-width:120px;display:flex;align-items:center">after</span>
        <span class="input mono" style="max-width:180px;display:flex;align-items:center">now-30d</span>
        <span class="helper">or an exact date</span></div>
      <div class="row gap8"><span class="input" style="max-width:130px;display:flex;align-items:center">Visibility</span>
        <span class="input" style="max-width:120px;display:flex;align-items:center">is</span>
        <span class="input" style="max-width:180px;display:flex;align-items:center">Public</span></div>
      <span class="helper">Fields: tag · author · primary tag · primary author · featured · visibility · published date ·
        has feature image.</span></div>
    <div class="row gap12"><span class="control-label" style="width:130px">Template</span>
      <span class="input" style="max-width:220px;display:flex;align-items:center">Post Grid</span></div>
    <div class="row gap12"><span class="control-label" style="width:130px">Posts per page</span>
      <span class="stepper"><span>−</span><span class="v">12</span><span>+</span></span>
      <span class="helper">Follows <a href="theme-settings.html">Theme settings</a>. Change it here to override it for
        this route only.</span></div></div>
  <div class="foot"><a class="btn secondary" href="routes-manager.html">Cancel</a>
    <a class="btn coral" href="routes-manager.html">Create collection</a></div></div></div>""")
     + head('New Route Sheet', 'A template, or a channel.', 'S9e · new route', anchor='new-route')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:20px">New route.</h2>
    <p class="softaa" style="font-size:13px;margin-top:4px">A URL on your site that shows exactly what you choose.</p></div>
  <div class="body"><label class="field"><span class="control-label">Path</span><input class="input mono" value="/reading-list/" aria-label="Path"></label>
    <div class="stack gap8"><span class="control-label">What should it show?</span>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">One of your templates</span>
        <span class="c">A designed page — like your Reading List template.</span></span></label>
      <label class="radiocard on"><span class="radio on"></span><span class="stack"><span class="t">A channel — a filtered stream of posts</span>
        <span class="c">Like a saved search with its own page and RSS feed. Posts keep their normal URLs. You&rsquo;ll add
          filter conditions next.</span></span></label></div></div>
  <div class="foot"><a class="btn secondary" href="routes-manager.html">Cancel</a>
    <a class="btn coral" href="routes-manager.html">Create route</a></div></div></div>""", cls='narrow')
     + head('Filename collisions and renames are refused at the naming step',
            'A <span class="mono">custom-{name}.hbs</span> filename is <b>permanent from its first deploy</b>: Ghost stores '
            'the exact string on every page that selects it and never revalidates it. So the rename control is '
            '<b>absent</b> rather than present-and-refusing, and the permanence is said once, plainly, at the moment of '
            'choosing.', 'FR-I3 · Appendix H', anchor='naming')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;flex-direction:column;gap:12px;max-width:620px;margin:0 auto">
  <div class="card"><div class="pad stack gap8"><span class="control-label">Template name</span>
    <input class="input" value="Membership" aria-label="Template name">
    <span class="chip mono" style="align-self:flex-start">custom-membership.hbs</span>
    <div class="banner notice"><span class="ico">!</span><span><b>This name is permanent.</b> Ghost remembers it on every
      page you assign, and renaming it later would quietly unassign them all.</span></div></div></div>
  <div class="card"><div class="pad stack gap8"><span class="control-label">Template name</span>
    <input class="input" value="Membership" style="border-color:var(--danger)" aria-label="Template name">
    <div class="banner error"><span class="ico">✕</span><span>You already have a template called Membership, and Ghost
      keys on the filename. Pick another name.</span></div></div></div>
</div>""", cls='narrow')
     + head('Empty', '', 'S9d · routes empty · 1440', anchor='empty')
     + screen("""<div style="min-height:420px;background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:40px">
  <svg width="110" height="80" viewBox="0 0 110 80" fill="none" stroke="#1C1B1A" stroke-width="1.5">
    <path d="M14 40h34M62 40h34"/><circle cx="55" cy="40" r="7" fill="#FFEDE8" stroke="#FF5941"/>
    <path d="M14 20h20M14 60h20M76 20h20M76 60h20"/></svg>
  <b style="font-size:18px;font-family:var(--display)">Your site uses Ghost&rsquo;s default routing.</b>
  <span class="helper">Nice and simple. Add a collection when you want sections like /tutorials/.</span>
  <a class="btn secondary" href="routes-manager.html#new-collection">+ New collection</a></div>""", cls='detail'),
     subs=[SUB('New Collection Sheet', 'new-collection', 'S9c'), SUB('New Route Sheet', 'new-route', 'S9e'),
           SUB('Routes — YAML error', 'error', 'S9b'), SUB('Naming refusals', 'naming', 'FR-I3'),
           SUB('Routes — empty', 'empty', 'S9d')])


# ═══════════════════════════════════════════════════════════════════════════════
# DEPLOY
# ═══════════════════════════════════════════════════════════════════════════════
SIX = ['Destination', 'Safety net', 'Backup', 'Check', 'Ship', 'Live']
FOUR = ['Destination', 'Check', 'Ship', 'Live']


def wiz(steps, current, body, project='Orbit Weekly'):
    return (f'<div style="min-height:700px;background:var(--paper);display:flex;flex-direction:column">'
            f'<div class="row gap12" style="padding:14px 24px;border-bottom:1px solid var(--line);background:var(--surface)">'
            f'<a href="editor.html">←</a><b style="font-size:14px">{project}</b>'
            f'<span class="chip" style="margin-left:auto">Ship it</span></div>'
            f'{wizrail(steps, current)}<div class="wizbody">{body}</div></div>')


page('deploy-wizard', 'Deploy Wizard', 'Deploy',
     'S8 Deploy.dc.html — the whole wizard, S8a–S8d. The six-step rail is prompt A1&rsquo;s',
     '§ IA → Deploy · § Component Patterns → Wizard step rail · J1 steps 9–14 · J2 step 13 · J3 step 3',
     head('The rail grows, and that is the whole shape of this flow',
          'An ordinary deploy is four steps. <b>The first deploy to a given site is six</b>, because two gates fire once '
          'per site and never again: the Staff Token Offer and the Backup Gate.')
     + screen(wizrail(FOUR, 1) + '<div class="wizbody"><p class="helper">An ordinary deploy — this project has shipped to '
              'this site before.</p></div>' + wizrail(SIX, 1)
              + '<div class="wizbody"><p class="helper">The first deploy to this site.</p></div>')
     + head('Every step, as a page you can walk')
     + screen("""<div style="padding:24px;background:var(--paper)"><div class="idxgrid">
  <a class="idxrow" href="deploy-destination.html">1 · Deploy Destination<span class="k">S8a</span></a>
  <a class="idxrow" href="staff-token-offer.html">2 · Staff Token Offer<span class="k">D1b · D1c</span></a>
  <a class="idxrow" href="backup-gate.html">3 · Backup Gate<span class="k">D1d · D1e</span></a>
  <a class="idxrow" href="preflight-check.html">4 · Pre-flight Check<span class="k">S8b</span></a>
  <a class="idxrow" href="snapshot-gate.html">5 · Snapshot Gate<span class="k">B12a · B12b</span></a>
  <a class="idxrow" href="deploy-progress.html">5 · Deploy Progress<span class="k">S8c</span></a>
  <a class="idxrow" href="deploy-live.html">6 · Deploy Live<span class="k">S8d</span></a>
  <a class="idxrow" href="deploy-uploaded.html">6 · Deploy Uploaded<span class="k">D2f</span></a>
  <a class="idxrow" href="partial-success.html">6 · Partial Success<span class="k">D2e</span></a>
  <a class="idxrow" href="deploy-failure.html">5 · Deploy Failure<span class="k">S8d′</span></a>
  <a class="idxrow" href="pro-exit-sheet.html">Pro Exit Sheet<span class="k">B13a</span></a>
  <a class="idxrow" href="library-update-confirm.html">Library Update Confirm<span class="k">B14b</span></a>
  <a class="idxrow" href="drift-report.html">Drift Report<span class="k">D3a</span></a>
  <a class="idxrow" href="deploy-history.html">Deploy History<span class="k">S8e · D2a</span></a>
</div></div>""")
     + head('What fires before step 1 even opens',
            'Two sheets sit in front of the wizard rather than inside it, and both are once-only in their own way. '
            'The <a href="pro-exit-sheet.html">Pro Exit Sheet</a> fires on a Free plan with Pro designs in the site — '
            'the only moment money is mentioned. The <a href="library-update-confirm.html">Library Update Confirm</a> '
            'fires whenever the library has advanced since this project&rsquo;s last deploy, because a redeploy carries '
            'those changes whether or not anyone asked.'))

page('deploy-destination', 'Deploy Destination', 'Deploy',
     'S8 Deploy.dc.html — S8a, extended with FR-J10&rsquo;s theme-name row → prompt A1 frame D1a. '
     'S8a′ preview-only, with its copy corrected',
     '§ IA → Deploy · J1 step 9 · J2 step 13',
     screen(wiz(SIX, 1, """<div class="wizcard"><div class="stack gap16">
    <h2 style="font-size:20px">Where is this going?</h2>
    <div class="itemrow"><span class="avatar" style="background:#3B382F">O</span>
      <div class="stack gap2 grow"><b style="font-size:14px">Orbit Weekly</b><span class="helper mono">orbitweekly.com</span></div>
      <span class="badge live"><span class="dot mint"></span>Connected</span>
      <a class="btn sm secondary" href="sites.html">Switch</a></div>
    <div class="stack gap10">
      <label class="radiocard on"><span class="radio on"></span><span class="stack"><span class="t">Deploy &amp; activate</span>
        <span class="c">v5 goes live the moment it&rsquo;s done.</span></span></label>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Deploy only</span>
        <span class="c">Upload v5, keep v4 active for now.</span></span></label></div>
    <div class="stack gap6" style="padding-top:12px;border-top:1px solid var(--line-faint)">
      <span class="control-label">The theme we will create</span>
      <span class="chip mono" style="align-self:flex-start;padding:6px 10px">inflozo-orbit-weekly</span>
      <span class="helper">This name is permanent for orbitweekly.com. Renaming the project later changes its name in
        Inflozo only.</span></div>
    <div class="row gap8"><span class="chip mono">v4 → v5</span></div>
    <div class="wizfoot"><a class="btn secondary" href="editor.html">Back</a>
      <a class="btn coral" href="staff-token-offer.html">Next — safety net</a></div>
  </div></div>"""), capt='D1a · destination, first deploy (step 1 of 6) · 1440')
     + head('An ordinary deploy — four steps, no theme-name row',
            'The name was frozen at the first deploy and is not offered again.', 'S8a · step 1 of 4', anchor='ordinary')
     + screen(wiz(FOUR, 1, """<div class="wizcard"><div class="stack gap16">
    <h2 style="font-size:20px">Where is this going?</h2>
    <div class="itemrow"><span class="avatar" style="background:#3B382F">O</span>
      <div class="stack gap2 grow"><b style="font-size:14px">Orbit Weekly</b><span class="helper mono">orbitweekly.com</span></div>
      <span class="badge live"><span class="dot mint"></span>Connected</span><span class="chip mono">inflozo-orbit-weekly</span></div>
    <div class="stack gap10">
      <label class="radiocard on"><span class="radio on"></span><span class="stack"><span class="t">Deploy &amp; activate</span>
        <span class="c">v6 goes live the moment it&rsquo;s done.</span></span></label>
      <label class="radiocard"><span class="radio"></span><span class="stack"><span class="t">Deploy only</span>
        <span class="c">Upload v6, keep v5 active for now.</span></span></label></div>
    <div class="wizfoot"><a class="btn secondary" href="editor.html">Back</a>
      <a class="btn coral" href="preflight-check.html">Run checks</a></div></div></div>"""))
     + head('Preview-Only Destination', 'The site cannot take a custom theme, so the exit is <b>export</b> instead of deploy.',
            'S8a′, with its copy corrected — see below', anchor='preview-only')
     + screen(wiz(FOUR, 1, """<div class="wizcard"><div class="stack gap16">
    <div class="itemrow"><span class="avatar sam">F</span>
      <div class="stack gap2 grow"><b style="font-size:14px">Field Notes</b><span class="helper mono">fieldnotes.ghost.io</span></div>
      <span class="badge sky"><span class="dot sky"></span>Preview-only</span></div>
    <div class="banner info"><span class="ico">ⓘ</span><span><b>Ghost(Pro)&rsquo;s Starter plan doesn&rsquo;t accept custom
      themes.</b> Ghost restricts theme uploads on Starter, so we cannot deploy to this site — and
      <b>uploading it by hand in Ghost Admin will not work either, because it is a plan limit rather than an API limit.</b>
      Your zip downloads on every plan and installs on a self-hosted Ghost, or on a Ghost(Pro) plan that allows custom
      themes (Publisher or higher). <a href="preview-only-notice.html">What clears this →</a></span></div>
    <div class="wizfoot"><a class="btn coral" href="deploy-uploaded.html">Download theme</a>
      <a class="btn secondary" href="preview-only-notice.html">Which Ghost plans work? ↗</a></div></div></div>""",
              project='Field Notes'))
     + head('And the export gate, which is the same gate',
            'FR-L3&rsquo;s Pro exit applies to the ZIP export exactly as it does to a deploy — a theme zip with Pro designs '
            'in it would be a licence hole. Same sheet, same two paths: <a href="pro-exit-sheet.html">Pro Exit Sheet</a>. '
            '<b>Export still works from a read-only project</b> (FR-J12): read-only means not editable, never locked in.',
            anchor='export'),
     subs=[SUB('Ordinary deploy (4 steps)', 'ordinary', 'S8a'),
           SUB('Preview-Only Destination', 'preview-only', 'S8a′'),
           SUB('The export gate', 'export', 'FR-J12 · FR-L3')])

page('staff-token-offer', 'Staff Token Offer', 'Deploy',
     'Extrapolated → Appendix A prompt A1, frames D1b (the offer) and D1c (declined). '
     'Inherits S8&rsquo;s step card and S2b·1&rsquo;s screenshotted step',
     '§ IA → Deploy · J1 step 10 · FR-C1, FR-C3 · Appendix H',
     screen(wiz(SIX, 2, """<div class="wizcard"><div class="row gap28" style="align-items:flex-start;gap:28px">
    <div class="stack gap14 grow">
      <h2 style="font-size:20px">One more step unlocks a safety net</h2>
      <p style="font-size:14px;line-height:1.6">A copy of your current theme before we replace it, plus a check that
        nothing else has changed it.</p>
      <p class="softaa" style="font-size:13px;line-height:1.6">This is a <b>Staff Access Token</b>. It is a
        full-Administrator credential, and it can only be created on the site Owner&rsquo;s own account. We are saying so
        plainly rather than softening it.</p>
      <label class="field"><span class="control-label">Staff Access Token</span>
        <input class="input mono" placeholder="paste it here" aria-label="Staff Access Token"></label>
      <div class="wizfoot"><a class="btn" href="preflight-check.html">Add the token</a>
        <a class="btn secondary" href="staff-token-offer.html#declined">Not now</a></div>
      <span class="helper">Both buttons are plain, and the same weight. &ldquo;Not now&rdquo; is not a link in small type.</span>
    </div>
    <div class="thumb" style="width:280px;height:200px;display:flex;align-items:center;justify-content:center;padding:16px">
      <span class="helper" style="text-align:center">screenshot: Ghost Admin → your own profile → Staff Access Token</span></div>
  </div></div>"""), capt='D1b · safety net · the offer (step 2 of 6) · 1440')
     + head('Declined — acknowledged once, and then never raised again',
            'Nothing in this flow implies the user has done something wrong. And <b>the multi-site operator working on a '
            'client&rsquo;s site cannot comply at all</b> — they are not the Owner. This path is not a degradation for them; '
            'it is the path, and a hard token requirement at connect would have locked them out of the product entirely.',
            'D1c · safety net · declined (step 2 of 6)', anchor='declined')
     + screen(wiz(SIX, 2, """<div class="wizcard"><div class="stack gap14">
    <h2 style="font-size:20px">Fine — shipping without it.</h2>
    <p style="font-size:13.5px;line-height:1.6">Here is exactly what that costs, once, so you know what you are choosing:</p>
    <div class="stack gap10">
      <div class="checkrow"><span style="color:var(--ink-soft)">○</span><span><b>No copy of your current theme</b>
        before we replace it.</span></div>
      <div class="checkrow"><span style="color:var(--ink-soft)">○</span><span><b>No check that the live theme changed</b>
        since we last shipped.</span></div>
      <div class="checkrow"><span style="color:var(--ink-soft)">○</span><span><b><span class="mono">routes.yaml</span>
        uploads by hand</b>, with a guided card that walks you through it.</span></div></div>
    <p style="font-size:13.5px">You can add it any time from <a href="manage-keys.html">Manage keys</a>.</p>
    <div class="wizfoot"><a class="btn coral" href="backup-gate.html">Continue</a></div>
    <span class="helper">Said once. It is never raised again for this project.</span></div></div>"""))
     + head('What Ghost keeps for you anyway',
            'On the declined path, the <a href="snapshot-gate.html#no-token">Snapshot Gate</a> shows its designed degraded '
            'state rather than an error — and it names the thing that does protect the user: <b>Ghost keeps the previous '
            'theme under Settings → Design</b>, with how to reactivate it there. The deploy proceeds. The Admin API key '
            'uploads and activates a theme on its own.', anchor='what-remains'),
     subs=[SUB('Declined', 'declined', 'D1c'), SUB('What remains without it', 'what-remains', 'J1 ending B')])


BACKUP_ROWS = [
    ('Theme', 'Inflozo replaces this', '<b>The one thing that makes rollback possible.</b>'),
    ('routes.yaml', 'Inflozo may overwrite this', 'Inflozo&rsquo;s routes manager replaces the whole file.'),
    ('Content — posts, pages, tags, settings, staff', '', '<b>Does NOT include your images.</b> See the images row.'),
    ('Members', '', 'Includes <span class="mono">stripe_customer_id</span>, so it round-trips to another Ghost.'),
    ('Redirects', '', 'Inflozo never touches this. Listed because losing redirects breaks existing links.'),
    ('Images, files and media', '', '<b>The gap most people miss.</b> The content export does not carry them.'),
    ('Database', '', 'Ghost&rsquo;s own docs: for disaster recovery, back up the database and content folder directly — '
                     'the JSON export is for moving content, not for restoring a site.'),
]


def backup_checklist(ticked=False):
    out = ''
    for name, mark, warn in BACKUP_ROWS:
        m = f'<span class="badge notice">{mark}</span>' if mark else ''
        out += (f'<div class="checkrow"><span class="check{" on" if ticked else ""}">{"✓" if ticked else ""}</span>'
                f'<span class="stack gap2 grow"><span class="row gap8"><b>{name}</b>{m}</span>'
                f'<span class="helper">{warn}</span>'
                f'<span class="helper">Find it in Ghost Admin under your version&rsquo;s export screens — '
                f'<a href="backup-gate.html">show me where for Ghost 6.58 ↗</a></span></span></div>')
    return out


page('backup-gate', 'Backup Gate', 'Deploy',
     'Extrapolated → Appendix A prompt A1, frames D1d (self-hosted) and D1e (Ghost(Pro)). Inherits S8b&rsquo;s '
     'checked-row list and B13a&rsquo;s itemised rows, both verbatim',
     '§ IA → Deploy · flow F7 · BACKUP-GATE.md · J1 step 11',
     screen(wiz(SIX, 3, f"""<div class="wizcard wide"><div class="stack gap16">
    <h2 style="font-size:20px">Before we replace your theme</h2>
    <div style="border:1px solid var(--line-strong);border-radius:var(--r);padding:16px;background:var(--paper-raised)">
      <p style="font-size:14px;line-height:1.6"><b>Inflozo writes exactly two things to your Ghost site: your theme, and
        <span class="mono">routes.yaml</span>.</b> It never writes posts, pages, members, tags, settings or redirects.</p></div>
    <p style="font-size:13.5px;line-height:1.6">A full backup is still the right thing, and here is the reason rather than
      the instruction: a theme change is reversible only if you can put the old theme back, and the cheapest insurance
      against every other surprise is the backup you already have.</p>
    <div style="background:var(--mint-tint);border-radius:var(--r);padding:14px">
      <div class="checkrow" style="border:none"><span class="check"></span>
        <span class="stack gap4 grow"><b>I have run <span class="mono">ghost backup</span> and saved the archive somewhere
          off the server.</b>
        <span class="helper">One archive: content, members, every installed theme, images, files, media, routes and
          redirects. Ticking this checks every row below — <b>and the rows stay visible</b>, so you can see what you now hold.</span></span></div></div>
    <div class="stack">{backup_checklist()}</div>
    <div style="height:1px;background:var(--line-strong)"></div>
    <div class="checkrow" style="border:none"><span class="check"></span>
      <span><b>I confirm I have a complete backup of my site and understand Inflozo will replace my theme.</b></span></div>
    <div class="wizfoot"><a class="btn secondary" href="staff-token-offer.html">Back</a>
      <span class="btn coral off">Continue to checks</span>
      <span class="reason">{len(BACKUP_ROWS)} rows still to tick, or run <span class="mono">ghost backup</span> and tick the shortcut.</span></div>
  </div></div>"""), capt='D1d · backup gate · self-hosted (step 3 of 6) — it BLOCKS the deploy button · 1440')
     + head('Ticked, and the deploy button turns on',
            'The master confirm becoming available is <b>announced politely</b> — a button silently turning on is invisible '
            'without it.', anchor='ticked')
     + screen(wiz(SIX, 3, f"""<div class="wizcard wide"><div class="stack gap16">
    <div style="background:var(--mint-tint);border-radius:var(--r);padding:14px">
      <div class="checkrow" style="border:none"><span class="check on">✓</span>
        <span><b>I have run <span class="mono">ghost backup</span> and saved the archive somewhere off the server.</b></span></div></div>
    <div class="stack">{backup_checklist(ticked=True)}</div>
    <div style="height:1px;background:var(--line-strong)"></div>
    <div class="checkrow" style="border:none"><span class="check on">✓</span>
      <span><b>I confirm I have a complete backup of my site and understand Inflozo will replace my theme.</b></span></div>
    <div class="wizfoot"><a class="btn secondary" href="staff-token-offer.html">Back</a>
      <a class="btn coral" href="preflight-check.html">Continue to checks</a></div>
  </div></div>"""))
     + head('On Ghost(Pro), the shortcut does not exist and the gate says so',
            'This claim is <b>cited, not executed</b>: Ghost&rsquo;s own documentation offers no route and says to contact '
            'your host, and there is no Ghost(Pro) test server yet. So the copy says what Ghost Admin does and does not '
            'offer and points the customer at Ghost, rather than asserting a platform-wide impossibility in '
            'Inflozo&rsquo;s own voice.', 'D1e · backup gate · Ghost(Pro) · 940', anchor='ghostpro')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="wizcard"><div class="stack gap14">
    <div class="banner info"><span class="ico">ⓘ</span><span>On Ghost(Pro), themes, content, members, routes and
      redirects all download from Ghost Admin. <b>Images and media do not</b> — Ghost Admin has no bulk export for them,
      and there is no server to copy them from. Ghost&rsquo;s own documentation points you at your host&rsquo;s support
      for this. Ghost(Pro) also takes its own platform backups; that is a Ghost service, not an Inflozo one, and it is
      worth confirming with Ghost what it covers and how to request a restore.</span></div>
    <p style="font-size:14px;line-height:1.6"><b>This is not something Inflozo can fix, and we are not going to pretend
      otherwise.</b></p>
    <span class="helper">Unknown host? Both paths are offered and neither is assumed.</span></div></div></div>""", cls='tight')
     + head('Confirmed', 'The gate collapses to one line for the rest of the wizard, and <b>never fires again for this '
            'site</b> — unless the site is disconnected and reconnected, because consent is per site.', anchor='confirmed')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="banner success" style="max-width:620px"><span class="ico">✓</span>
    <span>Backup confirmed for orbitweekly.com. We won&rsquo;t ask again for this site.</span></div></div>""", cls='detail'),
     note='<b>What this is, and what it is not.</b> It is a <b>consent gate, not a technical control</b>. It moves '
          'responsibility; it does not reduce risk. A customer who ticks the box without having backed up still loses their '
          'theme — they simply had a fair chance not to. That is a deliberate trade, recorded as a decision rather than '
          'left to be discovered as a side effect. <b>No Ghost Admin menu path is hard-coded anywhere on it</b>: Ghost '
          '5.130.6 carries Advanced, Labs, Import/Export and Export, and Ghost 6.58.0 carries none of them.',
     subs=[SUB('Ticked — the button turns on', 'ticked', ''),
           SUB('Backup Gate — Ghost(Pro)', 'ghostpro', 'D1e'),
           SUB('Confirmed', 'confirmed', '')])

page('preflight-check', 'Pre-flight Check', 'Deploy',
     'S8 Deploy.dc.html — S8b, extended with the drift row and the RTL pre-deploy warning',
     '§ IA → Deploy · J1 step 12 · FR-Q6, FR-J16',
     screen(wiz(SIX, 4, """<div class="wizcard wide"><div class="stack gap14">
    <h2 style="font-size:20px">Pre-flight check.</h2>
    <p class="softaa" style="font-size:13px">We compile and test everything before it touches your site.</p>
    <div class="stack">
      <div class="checkrow"><span class="tick">✓</span><span class="grow"><b>Theme compiled</b></span><span class="chip mono">1.4s · 2.4 MB</span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow"><b>Checking your theme (Ghost will love it)</b></span>
        <span class="chip mono">0 · 2</span><span class="helper">0 errors · 2 warnings</span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow">Ghost 6.x compatible</span><span class="helper">pass</span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow">Required templates present (index, post, page)</span><span class="helper">pass</span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow">No deprecated helpers</span><span class="helper">pass</span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow"><span class="mono">routes.yaml</span> is valid</span><span class="helper">pass</span></div>
      <div class="checkrow"><span style="color:var(--marigold-text)">!</span>
        <span class="stack gap2 grow"><b>hero.jpg is 2.1 MB</b>
          <span class="helper">Big images slow readers down. We&rsquo;ll convert it to WebP on upload — about 240 KB.</span></span></div>
      <div class="checkrow"><span style="color:var(--marigold-text)">!</span>
        <span class="stack gap2 grow"><b>Footer has no navigation links yet</b></span>
        <a class="btn sm secondary" href="editor.html">Fix in editor</a></div>
      <div class="checkrow"><span style="color:var(--marigold-text)">!</span>
        <span class="stack gap2 grow"><b>Your Spanish locale ships, and the layouts do not mirror</b>
          <span class="helper">Right-to-left languages are not supported yet — this is the pre-deploy repeat of the notice
            in <a href="translations.html">Translations</a>, said here because this is where it bites.</span></span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow">Nothing changed on your site since v4</span>
        <span class="helper">pass · <a href="drift-report.html">what this checks</a></span></div>
    </div>
    <p class="helper">Warnings won&rsquo;t block your deploy.</p>
    <div class="wizfoot"><a class="btn secondary" href="backup-gate.html">Back</a>
      <a class="btn coral" href="snapshot-gate.html">Ship it</a></div></div></div>"""),
            capt='S8b · pre-flight check — one warning expanded (step 4 of 6) · 1440')
     + head('When gscan finds an error rather than a warning',
            'Errors block. The row names the file and the rule, because a person can act on a specific failure and cannot '
            'act on &ldquo;something went wrong&rdquo;.', anchor='blocked')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="wizcard"><div class="stack gap12">
    <div class="row gap8"><b style="font-size:15px">Ghost would reject this theme</b><span class="badge danger">1 · 2</span></div>
    <div class="checkrow"><span style="color:var(--danger)">✕</span>
      <span class="stack gap2 grow"><b>GS010-PST-IMG — <span class="mono">post.hbs</span></b>
        <span class="helper">A post template must render the feature image or explicitly opt out. Your Post header design
          hides it; turn the image on, or pick a design that does not need it.</span></span>
      <a class="btn sm secondary" href="editor.html">Open Post header</a></div>
    <div class="wizfoot"><a class="btn secondary" href="deploy-destination.html">Back</a>
      <span class="btn coral off">Ship it</span>
      <span class="reason">gscan found one error. Ghost would refuse the upload, so we stop here rather than there.</span></div>
  </div></div></div>""", cls='tight'),
     subs=[SUB('Pre-flight — blocked by a gscan error', 'blocked', 'S8b')])


page('snapshot-gate', 'Snapshot Gate', 'Deploy',
     'B Missing Surfaces.dc.html — B12a running, B12b degraded. Semantics re-specified; visual treatment kept',
     '§ IA → Deploy · flow F1 · FR-J13 · J1 step 13',
     screen(wiz(SIX, 5, """<div class="wizcard"><div class="stack gap16">
    <h2 style="font-size:20px">Archiving your current theme first</h2>
    <p style="font-size:13.5px;line-height:1.6">If anything about the new theme is wrong, this is what we roll back to.
      It takes a few seconds, and it happens <b>once — at our first upload to this site</b>.</p>
    <div class="stack">
      <div class="checkrow"><span class="tick">✓</span><span class="grow">Reading the live theme from Ghost</span><span class="chip mono">casper 5.9.4</span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow">Writing the snapshot</span><span class="chip mono">2.1 MB</span></div>
      <div class="checkrow"><span class="dot coral"></span><span class="grow">Uploading the new theme</span>
        <div class="progress" style="width:160px"><div class="bar" style="width:46%"></div></div></div>
      <div class="checkrow"><span class="faint">○</span><span class="grow faint">Checking your theme (Ghost will love it)</span></div>
    </div>
    <p class="helper"><b>Kept outside your version limit.</b> The snapshot is exempt from history retention and never
      prunes — it is not one of your 10 stored versions.</p>
    <div class="wizfoot"><a class="btn secondary" href="deploy-progress.html">Cancel</a></div></div></div>"""),
            capt='B12a · snapshot gate · running (step 5 of 6) — minus the two sentences that were wrong')
     + head('No Staff Access Token — the designed degraded path, not an error',
            'Not danger, not a failure. It names the honest reason, then names what protects the user anyway, then offers '
            'three real actions.', 'B12b, re-specified', anchor='no-token')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="wizcard"><div class="stack gap14">
    <h2 style="font-size:19px">We could not archive your current theme</h2>
    <p style="font-size:13.5px;line-height:1.6"><b>Reading your live theme needs the site Owner&rsquo;s Staff Access Token,
      and this project doesn&rsquo;t have one.</b> That&rsquo;s how Ghost works on every version and every host — there&rsquo;s
      no permission to switch on.</p>
    <div class="banner info"><span class="ico">ⓘ</span><span>Ghost keeps your previous theme under
      <b>Settings → Design</b>, so you can put it back yourself if you need to.</span></div>
    <div class="wizfoot"><a class="btn" href="staff-token-offer.html">Add the token</a>
      <a class="btn secondary" href="deploy-progress.html">Deploy without a snapshot</a>
      <a class="btn ghost" href="deploy-destination.html">Cancel</a></div></div></div></div>""", cls='tight')
     + head('Capture failed for another reason',
            'The request and the status code, because a person can act on a specific failure. Same three actions.',
            anchor='failed')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="wizcard"><div class="stack gap14">
    <h2 style="font-size:19px">We could not archive your current theme</h2>
    <p style="font-size:13.5px;line-height:1.6">Ghost returned a 502 while we were reading it. That is a Ghost-side
      problem rather than a permission one, and it usually clears on its own.</p>
    <span class="chip mono" style="align-self:flex-start;padding:6px 10px">GET /ghost/api/admin/themes/ → 502</span>
    <div class="wizfoot"><a class="btn" href="snapshot-gate.html">Try again</a>
      <a class="btn secondary" href="deploy-progress.html">Deploy without a snapshot</a>
      <a class="btn ghost" href="deploy-destination.html">Cancel</a></div></div></div></div>""", cls='tight')
     + head('Captured', 'The step list completes and the wizard moves on. <b>No celebration — this is plumbing.</b>',
            anchor='captured')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="banner info" style="max-width:620px"><span class="ico">ⓘ</span>
    <span>Archived <span class="mono">casper 5.9.4</span> · 2.1 MB. It sits in
      <a href="deploy-history.html">Deploy History</a> as <b>Your original theme</b>, above the version list and outside
      the count.</span></div></div>""", cls='detail'),
     note='<b>Two sentences from the frame are deleted, and both were load-bearing mistakes.</b> &ldquo;It happens on every '
          'deploy&rdquo; — it is the <b>first upload to a site</b>, deploy-only included, because manual activation in Ghost '
          'Admin must not bypass the safety net. And &ldquo;Snapshots count towards your history&rdquo; — they are exempt '
          'from the limit and never prune. <b>B12b&rsquo;s reason was the most expensive error:</b> it told the user to fix '
          'a key permission. Ghost allowlists only <span class="mono">themes: [POST, PUT]</span> for integration tokens, so '
          'every <span class="mono">GET /themes/*</span> with an Admin API key returns 403 on every version and every host. '
          'There is no key to fix, and sending someone to fix one costs them an afternoon.',
     subs=[SUB('No Staff Access Token', 'no-token', 'B12b'),
           SUB('Capture failed otherwise', 'failed', ''),
           SUB('Captured', 'captured', '')])

page('deploy-progress', 'Deploy Progress', 'Deploy',
     'S8 Deploy.dc.html — S8c',
     '§ IA → Deploy · J1 step 13',
     screen(wiz(SIX, 5, """<div class="wizcard"><div class="stack gap16">
    <h2 style="font-size:20px">Shipping v5…</h2>
    <p class="softaa" style="font-size:13px">Usually under a minute. You can keep editing — we&rsquo;ll ping you.</p>
    <div class="stack">
      <div class="checkrow"><span class="tick">✓</span><span class="grow">Compiling</span><span class="chip mono">1.4s</span></div>
      <div class="checkrow"><span class="tick">✓</span><span class="grow">Checking your theme (Ghost will love it)</span><span class="chip mono">0 · 2</span></div>
      <div class="checkrow"><span class="dot coral"></span><span class="grow">Uploading to Ghost</span>
        <div class="progress" style="width:200px"><div class="bar" style="width:46%"></div></div>
        <span class="chip mono">1.1 of 2.4 MB</span></div>
      <div class="checkrow"><span class="faint">○</span><span class="grow faint">Activating v5</span></div>
    </div>
    <div class="wizfoot"><a class="btn secondary" href="deploy-destination.html">Cancel</a></div></div></div>"""),
            capt='S8c · step 5 · shipping — upload in progress'),
     note='Each stage is announced politely as it starts, and so is the outcome. <b>Nothing blocks on this</b> — the user '
          'can keep editing and the notification lands in <a href="notifications.html">Notifications</a> whether or not the '
          'tab is still open.')

page('deploy-live', 'Deploy Live', 'Deploy',
     'S8 Deploy.dc.html — S8d, plus flow F6&rsquo;s &ldquo;one step left&rdquo; card',
     '§ IA → Deploy · J1 step 14 · J3 step 6 · flow F6',
     screen(wiz(SIX, 6, """<div class="wizcard"><div class="stack gap16" style="align-items:center;text-align:center">
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" stroke="#1FA97A" stroke-width="2">
      <circle cx="60" cy="40" r="26"/><polyline points="48 41 57 50 74 31" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 18l6 6M102 18l-6 6M14 56l8 2M106 56l-8 2" stroke="#FFB100"/></svg>
    <h2 style="font-size:28px">Live! Your site just got gorgeous.</h2>
    <div class="row gap10"><span class="chip mono">v5</span><span class="chip mono">0 errors · 0 warnings</span><span class="chip mono">38s</span></div>
    <div class="row gap10"><a class="btn coral lg" href="deploy-live.html">View site</a>
      <a class="btn secondary lg" href="editor.html">Done</a></div>
    <span class="helper">The product&rsquo;s one confetti moment, and it respects <span class="mono">prefers-reduced-motion</span>.</span>
  </div></div>"""), capt='S8d · step 6 · live — the product&rsquo;s one confetti moment')
     + head('One step left — when custom templates were emitted',
            'A card on the success state, <b>not a modal that must be dismissed to reach the confetti. The deploy '
            'succeeded.</b> A project whose deploy emitted no custom template never sees it — which is every starter&rsquo;s '
            'first deploy, so the confetti stays clean.', 'flow F6 · B19 re-specified', anchor='binding')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:620px"><div class="pad row gap14" style="align-items:flex-start">
    <span style="font-size:18px">📌</span>
    <div class="stack gap6 grow"><b style="font-size:14px">One step left</b>
      <span class="helper">Three templates shipped that a Ghost page still has to point at. It takes a minute, and it
        happens in Ghost rather than here.</span></div>
    <a class="btn secondary" href="template-binding-checklist.html">Open the checklist</a></div></div></div>""", cls='narrow')
     + head('The confetti fires on the first deploy that makes the site LIVE',
            'A deploy-only ends on <a href="deploy-uploaded.html">Deploy Uploaded</a>, not here. '
            '&ldquo;Live! Your site just got gorgeous&rdquo; would be false on a theme nobody is serving — the canonical '
            'string is what settles it. A deploy-only that is later activated gets the confetti then.', anchor='confetti'),
     subs=[SUB('Template binding card', 'binding', 'F6'), SUB('When the confetti fires', 'confetti', 'Appendix H')])


UPLOADED_CARD = """<div class="wizcard"><div class="stack gap16">
    <div class="banner info"><span class="ico">ⓘ</span><span>{body}</span></div>
    <div class="row gap10"><span class="chip mono">v5</span><span class="chip mono">uploaded</span>
      <span class="badge sky">Uploaded, not live</span></div>
    <div class="wizfoot"><a class="btn coral" href="deploy-live.html">Re-activate v5</a>
      <a class="btn secondary" href="editor.html">Leave it for now</a></div>
    <span class="helper">No confetti. The one confetti moment is the first deploy that makes the site live, and this one
      did not. <b>No deploy-failure email is sent either</b> — nothing failed.</span></div></div>"""

page('deploy-uploaded', 'Deploy Uploaded', 'Deploy',
     'Extrapolated → Appendix A prompt A2, frame D2f. The same card as D2e, reached deliberately',
     '§ IA → Deploy · J1 &ldquo;step 1 has two endings too&rdquo; · FR-J8',
     screen(wiz(SIX, 6, '<h2 style="font-size:22px">Uploaded. Not live yet.</h2>'
              + UPLOADED_CARD.format(body='<b>v5 is on orbitweekly.com and v4 is still what readers see.</b> '
                                          'Make it live whenever you are ready.')),
            capt='D2f · deploy only — the other ending')
     + head('It is one state with two causes',
            'Deploy Uploaded and <a href="partial-success.html">Partial Success</a> are the <b>same state reached two '
            'ways</b>, and the history row is identical for both — status <span class="mono">uploaded</span>, '
            '<span class="mono">activated</span> false, no active badge, <b>Re-activate</b>. Only the cause differs, so '
            'only the sentence differs.', anchor='same-state')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
  <div class="card" style="max-width:340px"><div class="pad stack gap8"><span class="frame-cap" style="margin:0">chose Deploy only</span>
    <b style="font-size:14px">Uploaded. Not live yet.</b>
    <span class="helper">v5 is on orbitweekly.com and v4 is still what readers see.</span></div></div>
  <div class="card" style="max-width:340px"><div class="pad stack gap8"><span class="frame-cap" style="margin:0">activation failed</span>
    <b style="font-size:14px">Your theme is on your site but isn&rsquo;t live yet.</b>
    <span class="helper">Ghost didn&rsquo;t switch to it, so orbitweekly.com is still serving v4.</span></div></div>
  <div class="card" style="width:100%;max-width:700px"><div class="pad stack gap8">
    <span class="frame-cap" style="margin:0">and the history row, which is identical for both</span>
    <div class="itemrow"><span class="chip mono">v5</span><span class="badge sky">Uploaded, not live</span>
      <div class="stack gap2 grow"><span class="helper">Today · 2:14 PM · by Maya</span></div>
      <span class="chip mono">0 · 0</span><a class="btn sm coral" href="deploy-live.html">Re-activate</a></div></div></div>
</div>""", cls='tight'),
     subs=[SUB('One state, two causes', 'same-state', 'FR-J8')])

page('partial-success', 'Partial Success', 'Deploy',
     'Extrapolated → Appendix A prompt A2, frame D2e (and D2d, the history row)',
     '§ IA → Deploy · flow F8 · FR-J8',
     screen(wiz(SIX, 6, '<h2 style="font-size:22px">Your theme is on your site but isn&rsquo;t live yet.</h2>'
              + UPLOADED_CARD.format(body='<b>v5 uploaded cleanly. Ghost didn&rsquo;t switch to it</b>, so orbitweekly.com '
                                          'is still serving v4 — nothing on your site changed.')),
            capt='D2e · partial success in the wizard — sky, not danger')
     + head('Six things follow from calling it a partial success rather than a failure', anchor='consequences')
     + screen("""<div style="padding:24px;background:var(--surface)"><div class="stack gap10" style="max-width:760px;margin:0 auto">
  <div class="checkrow"><span class="tick">1</span><span><b>The artifact is retained</b> like any successful compile, and
    appears in history without an active badge.</span></div>
  <div class="checkrow"><span class="tick">2</span><span><b>The theme name freezes</b>, because the name is claimed on the
    site the moment a theme lands there.</span></div>
  <div class="checkrow"><span class="tick">3</span><span><b>The drift baseline does not move</b> — the
    <a href="drift-report.html">Drift Report</a> compares against what Inflozo last put <i>live</i>.</span></div>
  <div class="checkrow"><span class="tick">4</span><span><b>&ldquo;Never leaves a partially active theme&rdquo; is
    unaffected</b> — the site&rsquo;s active theme is still the previous one, untouched.</span></div>
  <div class="checkrow"><span class="tick">5</span><span><b>The user is told plainly</b>, with a re-activate action,
    because &ldquo;failed&rdquo; would be wrong and silence would be worse.</span></div>
  <div class="checkrow"><span class="tick">6</span><span><b>It sends no deploy-failure email.</b> The theme uploaded, the
    user is in the product looking at the result, and the state is recoverable in one click.</span></div>
</div></div>"""),
     subs=[SUB('What follows', 'consequences', 'FR-J8')])

page('deploy-failure', 'Deploy Failure', 'Deploy',
     'S8 Deploy.dc.html — S8d′',
     '§ IA → Deploy · § Voice and Tone (errors are human and name the fix)',
     screen(wiz(SIX, 5, """<div class="wizcard"><div class="stack gap16">
    <div class="row gap10"><h2 style="font-size:20px">Uploading to Ghost failed</h2><span class="chip mono">at 1.1 MB</span></div>
    <div class="banner error"><span class="ico">✕</span><span><b>Ghost said no — your Admin key expired.</b>
      Your theme compiled clean — we just couldn&rsquo;t sign in to Ghost Admin. Reconnect the site and we&rsquo;ll pick up
      right here.</span></div>
    <div class="wizfoot"><a class="btn secondary" href="editor.html">Close</a>
      <a class="btn danger" href="manage-keys.html">Reconnect site</a></div></div></div>"""),
            capt='S8d′ · step 5 failure — a human sentence and the action that fixes it')
     + head('The shape every error takes', 'Never &ldquo;An error occurred.&rdquo; The sentence names what happened in the '
            'other party&rsquo;s terms, and the button is the fix.', anchor='shape')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;flex-direction:column;gap:12px;max-width:660px;margin:0 auto">
  <div class="banner error"><span class="ico">✕</span><span><b>Ghost said no — your Admin key expired.</b>
    <a href="manage-keys.html" style="color:var(--danger)">Reconnect</a></span></div>
  <div class="banner error"><span class="ico">✕</span><span><b>Ghost rejected the theme — gscan found one error.</b>
    <a href="preflight-check.html#blocked" style="color:var(--danger)">See what failed</a></span></div>
  <div class="banner error"><span class="ico">✕</span><span><b>orbitweekly.com didn&rsquo;t answer.</b>
    We tried three times over two minutes. Nothing was changed on your site.
    <a href="deploy-destination.html" style="color:var(--danger)">Try again</a></span></div>
  <p class="helper">A deploy failure is one of the five product emails (FR-P1), and it is the only deploy outcome that
    sends one. Uploaded-not-live sends nothing, because nothing failed.</p></div>""", cls='tight'),
     subs=[SUB('The shape of an error', 'shape', 'Appendix H')])

page('drift-report', 'Drift Report', 'Deploy',
     'Extrapolated → Appendix A prompt A3, frames D3a, D3b and D3c. Inherits S8b&rsquo;s step card and '
     'checked-row list, and B7&rsquo;s Layers row for the file list',
     '§ IA → Deploy · FR-J16',
     screen(wiz(FOUR, 2, """<div class="wizcard wide"><div class="stack gap16">
    <h2 style="font-size:20px">Something changed on your site since we last shipped.</h2>
    <p style="font-size:13.5px;line-height:1.6">We compare what&rsquo;s live against what we put there. These files are
      different — someone edited the theme in Ghost, or another tool did.</p>
    <div class="stack gap10">
      <span class="panel-label">Changed</span>
      <div class="itemrow"><div class="lthumb"></div><div class="stack gap2 grow"><b style="font-size:13px">Home hero</b>
          <span class="helper mono">partials/section-home-hero.hbs</span></div></div>
      <div class="itemrow"><div class="lthumb"></div><div class="stack gap2 grow"><b style="font-size:13px">Three Column footer</b>
          <span class="helper mono">partials/section-footer-three-column.hbs</span></div></div>
      <span class="panel-label">Added</span>
      <div class="itemrow"><div class="lthumb"></div><div class="stack gap2 grow"><b style="font-size:13px">A file we did not ship</b>
          <span class="helper mono">assets/custom-tweaks.css</span></div></div>
      <span class="panel-label">Removed</span>
      <div class="itemrow"><div class="lthumb"></div><div class="stack gap2 grow"><b style="font-size:13px">Latest issues</b>
          <span class="helper mono">partials/section-latest-issues.hbs</span></div></div></div>
    <div class="wizfoot"><a class="btn secondary" href="deploy-history.html">Download the live theme first</a>
      <a class="btn" href="deploy-progress.html">Overwrite and ship anyway</a>
      <a class="btn ghost" href="editor.html">Cancel</a></div>
    <span class="helper">The destructive action is ink, not danger — this is a deliberate choice, not an accident. The
      safe one is offered first.</span></div></div>"""),
            capt='D3a · drift found — the deploy stops. Rows are named by YOUR layer name; the raw path is beneath it')
     + head('No drift', 'One passing row in the pre-flight list, identical in weight to every other pass.',
            'D3c · no drift · 620', anchor='pass')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="wizcard"><div class="checkrow" style="border:none"><span class="tick">✓</span>
    <span class="grow">Nothing changed on your site since v4</span><span class="helper">pass</span></div></div></div>""",
              cls='narrow')
     + head('Could not verify — and it proceeds',
            'A single sky information row <b>inside</b> the pre-flight list, not a blocking state. <b>Drift is never '
            'asserted without two manifests in hand</b>, so this fails open.', 'D3b · could not verify · 720', anchor='unverified')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="wizcard"><div class="stack gap10">
    <div class="checkrow"><span class="tick">✓</span><span class="grow">Ghost 6.x compatible</span><span class="helper">pass</span></div>
    <div class="checkrow"><span style="color:var(--sky-text)">ⓘ</span>
      <span class="stack gap2 grow"><b>Couldn&rsquo;t check whether your live theme changed.</b>
        <span class="helper">We need the site Owner&rsquo;s Staff Access Token to read the live theme, and this project
          doesn&rsquo;t have one. Shipping anyway.</span>
        <a class="small" href="staff-token-offer.html" style="color:var(--sky-text)">Add the token</a></span></div>
    <div class="checkrow"><span class="tick">✓</span><span class="grow"><span class="mono">routes.yaml</span> is valid</span><span class="helper">pass</span></div>
  </div></div></div>""", cls='tight'),
     note='<b>It is skipped on the first deploy</b> — there is nothing to compare against — and it runs before every deploy '
          'after that. A layer <b>rename</b> produces no drift at all, so the list never shows one: nothing on the live site '
          'changed, only a filename Inflozo chose.',
     subs=[SUB('No drift', 'pass', 'D3c'), SUB('Could not verify', 'unverified', 'D3b')])


page('pro-exit-sheet', 'Pro Exit Sheet', 'Deploy',
     'B Missing Surfaces.dc.html — B13a (four remedies, not two; the pairing-table note deleted). FR-L3',
     '§ IA → Deploy · § wrong mechanism → B13 · J3 steps 3–5',
     screen("""<div class="sheetwrap"><div class="sheet wide"><div class="head">
    <div class="row gap10"><span class="badge pro">✦</span><h2 style="font-size:22px">Four Pro designs are in this site</h2></div>
    <p style="font-size:13.5px;line-height:1.6;margin-top:8px">You can swap each one for a Free design and ship today, or
      go Pro and keep them exactly as they are. <b>Nothing is deleted either way.</b></p></div>
  <div class="body">
    <div class="row gap8"><span class="panel-label grow">In use</span><span class="chip mono">4 of 26 sections</span></div>
    <div class="itemrow"><span class="badge pro">✦ PRO</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Collage Grid</b><span class="helper">Home · hero</span></div>
      <div class="row gap8"><a class="btn sm secondary" href="variant-shuffle.html">Swap</a>
        <a class="btn sm ghost" href="editor.html">Remove it</a></div></div>
    <div class="itemrow"><span class="badge pro">✦ PRO</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Magazine Split</b><span class="helper">Home · post feed</span></div>
      <div class="row gap8"><a class="btn sm secondary" href="variant-shuffle.html">Swap</a>
        <a class="btn sm ghost" href="editor.html">Remove it</a></div></div>
    <div class="itemrow done"><span class="badge live">SWAPPED</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Ticker Marquee → Single Line</b>
        <span class="helper">Site-wide · announcement</span></div>
      <a class="btn sm secondary" href="pro-exit-sheet.html">Undo</a></div>
    <div class="itemrow"><span class="badge pro">✦ PRO</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Contrast Band — card treatment</b>
        <span class="helper">Chosen, not placed. Reverts on <a href="editor-cards.html">Editor cards</a>.</span></div>
      <a class="btn sm secondary" href="editor-cards.html#treatment">Revert to the free one</a></div>
    <p class="helper">Each swap keeps your text and images — only the arrangement changes. <b>Swapping goes through
      Shuffle</b>, which offers any free design in that category&rsquo;s ring, so there is no per-design pairing table and
      nothing to author.</p>
  </div>
  <div class="foot"><div class="stack gap2 grow"><b style="font-size:15px">$15 a month, every design</b>
      <span class="helper">Cancel any time. Your site keeps working on Free with the swaps applied.</span></div>
    <a class="btn secondary" href="backup-gate.html">Swap and ship free</a>
    <a class="btn marigold" href="upgrade-sheet.html">Go Pro and ship</a></div></div></div>""",
            capt='B13a · the sheet, over a dimmed editor · 1440 — the climax of J3')
     + head('Four remedies, because two was not enough',
            'The frame drew swap and upgrade. FR-L3 has four, and the missing two are not decorative: <b>some binding '
            'contexts have no Free design to swap to</b>, and the non-placeable treatments — a paywall design, a card '
            'treatment, a pagination style — are <i>selected</i> rather than placed, so each reverts on its own surface.',
            anchor='remedies')
     + screen("""<div style="padding:24px;background:var(--surface)"><div class="grid g4 gap12" style="max-width:900px;margin:0 auto">
  <div class="card"><div class="pad-tight stack gap6"><b style="font-size:13px">Upgrade</b>
    <span class="helper">Keep everything exactly as it is.</span></div></div>
  <div class="card"><div class="pad-tight stack gap6"><b style="font-size:13px">Swap, via Shuffle</b>
    <span class="helper">Any Free design in that category&rsquo;s ring. Your words stay.</span></div></div>
  <div class="card"><div class="pad-tight stack gap6"><b style="font-size:13px">Remove it</b>
    <span class="helper">For a context with no Free design to swap to. Not decorative.</span></div></div>
  <div class="card"><div class="pad-tight stack gap6"><b style="font-size:13px">Revert the treatment</b>
    <span class="helper">For the designs that are chosen rather than placed, on the surface where they were chosen.</span></div></div>
</div></div>""")
     + head('Where this sheet appears, and where it must never appear', anchor='where')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
  <div class="card" style="max-width:260px"><div class="pad-tight stack gap6"><b style="font-size:13px">DEPLOY</b>
    <span class="helper">Before the snapshot gate — swapping changes what gets archived.</span></div></div>
  <div class="card" style="max-width:260px"><div class="pad-tight stack gap6"><b style="font-size:13px">EXPORT</b>
    <span class="helper">Same sheet, same two paths. A theme zip with Pro designs in it would be a licence hole.</span></div></div>
  <div class="card" style="max-width:260px;border-color:var(--danger)"><div class="pad-tight stack gap6"><b style="font-size:13px">NEVER</b>
    <span class="helper">On the canvas, in the section picker, or on click of a <a href="editor.html#pro-badge">Pro
      badge</a>. Once, at the exit, and nowhere else.</span></div></div></div>""", cls='tight'),
     note='<b>Coral appears nowhere on this sheet</b>, and marigold appears only as the Pro mark. This is a money '
          'conversation, not a moment of delight. Both footer actions are real verbs and both ship — &ldquo;Swap and ship '
          'free&rdquo; is a secondary <i>button</i> rather than a link, because a genuine second path presented as a link '
          'reads as a refusal.',
     subs=[SUB('The four remedies', 'remedies', 'FR-L3'), SUB('Where it appears', 'where', '')])

page('library-update-confirm', 'Library Update Confirm', 'Deploy',
     'B Missing Surfaces.dc.html — B14b, with its one stale sentence corrected',
     '§ IA → Deploy · flow F4 · FR-J14',
     screen("""<div class="sheetwrap"><div class="sheet"><div class="head">
    <h2 style="font-size:22px">Three designs have updates</h2>
    <p style="font-size:13.5px;line-height:1.6;margin-top:8px">Your settings are kept. These are fixes to the designs
      themselves, so the shapes may shift slightly.</p></div>
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
    <div class="banner info"><span class="ico">ⓘ</span><span><b>The version you are on now stays in history and rolls back
      in one click.</b> Every successful compile is stored as an artifact — see
      <a href="deploy-history.html">Deploy History</a>.</span></div>
    <p class="helper">Each update says what was actually fixed, in the language of the problem it solved, because a user
      deciding whether to redeploy needs to recognise their own bug.</p>
  </div>
  <div class="foot"><b style="font-size:13px" class="grow">Nothing changes until you ship.</b>
    <a class="btn secondary" href="editor.html">Not now</a>
    <a class="btn coral" href="preflight-check.html">Update and ship</a></div></div></div>""",
            capt='B14b · redeploy confirmation — a mandatory step before compile proceeds')
     + head('Why a confirm exists at all',
            'Compiles always use the current library — a single live library, <b>no per-project pinning</b> — so any '
            'redeploy carries every library change since the project&rsquo;s last deploy, and <b>there is no way to '
            'redeploy without them</b>. Because the update is inseparable from the redeploy, the deploy flow makes it '
            'consensual instead.', anchor='why')
     + screen("""<div style="padding:24px;background:var(--surface)"><div class="stack gap10" style="max-width:760px;margin:0 auto">
  <div class="banner success"><span class="ico">✓</span><span><b>Designs are never deleted, only superseded</b> — hidden
    from the picker, while placed instances keep rendering.</span></div>
  <div class="banner success"><span class="ico">✓</span><span><b>Schema changes are append-only or ship a migration
    map</b>, and catalog keys are never reworded in place.</span></div>
  <div class="banner notice"><span class="ico">!</span><span>So a placed section can fail to resolve in exactly one case —
    a failed schema migration — and <b>only</b> that case degrades to the nearest current design,
    <b>with a visible notice</b>. Never a silent re-render, never a failed load, and no deletion path to build.</span></div>
  <div class="banner info"><span class="ico">ⓘ</span><span><b>One exemption, and it is narrow.</b> FR-C5&rsquo;s
    compatibility redeploy re-ships a design that already ran and skips this confirm — carrying <b>only</b> the
    compatibility fix. It never picks up a pending library advance, a Style Pack change or an unconfirmed design update
    that happens to be waiting. That narrowness is what keeps &ldquo;nothing changes without your say-so&rdquo; true.</span></div>
</div></div>"""),
     note='<b>One stale sentence corrected.</b> B14b says &ldquo;We snapshot before redeploying, so this is reversible from '
          'history.&rdquo; The snapshot is <b>first upload only</b> (FR-J13). What is true, and what the line now says, is '
          'that the version you are on stays in history and rolls back in one click.',
     subs=[SUB('Why a confirm exists', 'why', 'FR-J14')])


def hrow(v, when, changed, gscan, pinned=False, live=False, action='Roll back'):
    pin = ('<span class="badge notice" title="Pinned">📌 Pinned</span>' if pinned
           else '<span class="soft" title="Pin this version">📌</span>')
    livebadge = '<span class="badge live"><span class="dot mint"></span>Live</span>' if live else ''
    act = ('' if live else f'<a class="btn sm secondary" href="deploy-history.html#rollback">{action}</a>')
    return (f'<div class="itemrow{" done" if pinned else ""}"><span class="chip mono">{v}</span>{livebadge}'
            f'<div class="stack gap2 grow"><span class="helper">{when} · by Maya</span>'
            f'<span class="helper">{changed}</span></div>'
            f'<span class="chip mono">{gscan}</span>{pin}{act}</div>')


page('deploy-history', 'Deploy History', 'Deploy',
     'S8 Deploy.dc.html — S8e, extended → Appendix A prompt A2, frames D2a–D2d. The drawer, rows, gscan chips, '
     'active badge and roll-back confirm are all drawn and all kept',
     '§ IA → Deploy · flow F8 · FR-J7/J9 · J4 step 9',
     screen(f"""<div style="padding:24px;background:var(--paper)"><div class="card" style="max-width:860px;margin:0 auto">
  <div class="pad stack gap12">
    <div class="row gap10"><h2 style="font-size:20px">History — Orbit Weekly</h2>
      <a class="btn sm secondary" style="margin-left:auto" href="editor.html">Close</a></div>
    <div class="itemrow" style="background:var(--paper-sunk)"><span style="font-size:16px">🗄️</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Your original theme</b>
        <span class="helper">Archived 6 Aug, before our first upload</span></div>
      <span class="chip mono">casper 5.9.4</span>
      <a class="btn sm secondary" href="deploy-history.html#restore">Restore original</a></div>
    <p class="helper">Kept outside your version limit. Ghost checks every theme on the way in, so a very old theme can be
      refused — we&rsquo;ll offer the zip if that happens.</p>
    <div style="height:1px;background:var(--line-strong)"></div>
    {hrow('v5', 'Today · 2:14 PM', 'Changed: Hero, Footer · Pack: Paper → Tangerine', '0 · 0', live=True)}
    {hrow('v4', 'Aug 14 · 9:02 AM', 'Changed: Post Grid, Newsletter', '0 · 0', pinned=True)}
    {hrow('v3', 'Aug 10 · 6:40 PM', 'Changed: Header · added 404 template', '0 · 2')}
    <div class="itemrow"><span class="chip mono">v2b</span><span class="badge sky">Uploaded, not live</span>
      <div class="stack gap2 grow"><span class="helper">Aug 8 · 4:12 PM · by Maya</span>
        <span class="helper">Your theme is on your site but isn&rsquo;t live yet.</span></div>
      <span class="chip mono">0 · 0</span><span class="soft">📌</span>
      <a class="btn sm coral" href="deploy-live.html">Re-activate</a></div>
    {hrow('v2', 'Aug 6 · 11:18 AM', 'Changed: Hero', '0 · 0', pinned=True)}
    {hrow('v1', 'Aug 2 · 4:51 PM', 'First deploy', '0 · 0')}
    <p class="helper" style="border-top:1px solid var(--line-faint);padding-top:10px">
      <b>Pro keeps the last 10 versions. Free keeps the last 3.</b> Older versions are removed, not hidden —
      an Inflozo theme can&rsquo;t be rebuilt later, so this is how far back you can go.</p>
  </div></div></div>""", capt='D2a · history with pinning · Pro · 1440')
     + head('The pin refusal', '<b>At least one version must stay unpinned</b>, enforced in the database, so deploying can '
            'never be blocked by pinning. The cap is N−1: 9 of 10 on Pro, 2 of 3 on Free. <b>Unpinning is always allowed, '
            'by design</b>, so nobody can trap themselves.', 'D2b · the pin refusal · 520', anchor='pin-refusal')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:420px"><div class="pad stack gap10">
    <div class="banner notice"><span class="ico">📌</span><span><b>One version has to stay unpinned so your next deploy
      has somewhere to go.</b> Unpin another first.</span></div>
    <a class="btn secondary sm" href="deploy-history.html" style="align-self:flex-start">Got it</a>
    <span class="helper">The pin stays unfilled. This is a refusal with a reason — never a greyed control, and never a
      silent failure.</span></div></div></div>""", cls='tiny')
     + head('On Free', 'Three versions, one pinned, the original-theme row present. <b>The limit line is shown on Free too, '
            'rather than hidden as an upsell</b>, and there is no upgrade prompt in this drawer.',
            'D2c · free plan', anchor='free')
     + screen(f"""<div style="padding:24px;background:var(--paper)"><div class="card" style="max-width:760px;margin:0 auto">
  <div class="pad stack gap12"><h2 style="font-size:20px">History — Field Notes</h2>
    <div class="itemrow" style="background:var(--paper-sunk)"><span style="font-size:16px">🗄️</span>
      <div class="stack gap2 grow"><b style="font-size:13.5px">Your original theme</b><span class="helper">Archived 2 Aug</span></div>
      <span class="chip mono">source 1.2.0</span><a class="btn sm secondary" href="deploy-history.html#restore">Restore original</a></div>
    <div style="height:1px;background:var(--line-strong)"></div>
    {hrow('v3', 'Aug 14 · 9:02 AM', 'Changed: Hero', '0 · 0', live=True)}
    {hrow('v2', 'Aug 10 · 6:40 PM', 'Changed: Footer', '0 · 1', pinned=True)}
    {hrow('v1', 'Aug 2 · 4:51 PM', 'First deploy', '0 · 0')}
    <p class="helper" style="border-top:1px solid var(--line-faint);padding-top:10px">
      <b>Free keeps the last 3 versions. Pro keeps the last 10.</b> Older versions are removed, not hidden.</p>
  </div></div></div>""")
     + head('Roll back', 'Exactly as drawn. <b>Rollback is exempt from the Pro exit gate</b> — restoring an artifact that '
            'already ran is always allowed, on any plan — and it needs no edit lock, because it redeploys a stored file '
            'rather than the working document.', 'S8e · roll-back confirm', anchor='rollback')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Roll back to v4?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Your live site switches to v4 instantly.
    <b>v5 stays in history — nothing is lost.</b></p>
    <div class="itemrow"><span class="chip mono">v4</span><div class="stack gap2 grow">
        <span class="helper">Aug 14 · 9:02 AM · by Maya</span></div><span class="chip mono">0 · 0</span></div></div>
  <div class="foot"><a class="btn secondary" href="deploy-history.html" style="box-shadow:var(--focus)">Cancel</a>
    <a class="btn danger-out" href="deploy-history.html">Roll back</a></div></div></div>""", cls='narrow')
     + head('Restore the original theme, and the caveat that comes with it',
            'The restore skips <i>Inflozo&rsquo;s</i> gscan gate — but <b>Ghost validates every upload with its own gscan</b>, '
            'so an old theme can be rejected on the way back in. That case has its own designed fallback rather than a dead '
            'end.', anchor='restore')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:560px"><div class="pad stack gap12">
    <div class="banner notice"><span class="ico">!</span><span><b>Ghost refused <span class="mono">casper 5.9.4</span> —
      it uses two helpers Ghost 6 has removed.</b> That is Ghost checking the upload, not us.</span></div>
    <p style="font-size:13px;line-height:1.55">Two ways forward, and both keep your site exactly as it is right now:</p>
    <div class="row gap10"><a class="btn secondary" href="deploy-history.html">Download the snapshot zip</a>
      <a class="btn ghost" href="deploy-history.html">Ghost keeps it under Settings → Design ↗</a></div></div></div></div>""",
              cls='narrow')
     + head('Nothing shipped yet', 'The limit is stated anyway, on an empty list, because a list that will silently drop its '
            'oldest entry reads as complete when it is not.', anchor='empty')
     + screen("""<div style="padding:40px;background:var(--paper);display:flex;justify-content:center">
  <div class="stack gap10" style="align-items:center;text-align:center;max-width:420px">
    <svg width="100" height="74" viewBox="0 0 100 74" fill="none" stroke="#1C1B1A" stroke-width="1.5">
      <circle cx="50" cy="37" r="24"/><path d="M50 22v15l10 7" stroke-linecap="round"/>
      <path d="M12 37h10M78 37h10" stroke="#FF5941"/></svg>
    <b style="font-size:17px;font-family:var(--display)">Nothing shipped yet.</b>
    <span class="helper">Every deploy is stored here and rolls back in one click. Pro keeps the last 10 versions;
      Free keeps the last 3.</span>
    <a class="btn coral" href="deploy-destination.html">Ship it</a></div></div>""", cls='narrow'),
     note='<b>The history must never show a version it cannot restore.</b> A pruned artifact is <b>gone from the list</b>, '
          'not a greyed row with a dead button — and the stated limit is what explains where it went. These artifacts are '
          '<b>not regenerable</b>: rebuilding an old design against today&rsquo;s library produces a different theme, which '
          'is why rollback replays a stored file. The retention limit is therefore the true bound on how far back a customer '
          'can go, and the surface says so.',
     subs=[SUB('The pin refusal', 'pin-refusal', 'D2b'),
           SUB('Deploy History — Free', 'free', 'D2c'),
           SUB('Roll-back confirm', 'rollback', 'S8e'),
           SUB('Restore original', 'restore', 'FR-J13'),
           SUB('History — empty', 'empty', '')])


page('preview-only-notice', 'Preview-Only Notice', 'Deploy',
     'B Missing Surfaces.dc.html — B15 (right, apart from the plan name). S8a′ and S11a move to match it',
     '§ IA → Deploy · flow F5 · § wrong mechanism → B15 · FR-C2',
     screen("""<div style="padding:32px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:640px"><div class="pad stack gap14">
    <div class="row gap10"><span class="panel-label grow">Connection</span>
      <span class="badge sky"><span class="dot sky"></span>Preview-only</span></div>
    <div class="stack gap2"><b style="font-size:14px">fieldnotes.ghost.io</b>
      <span class="helper">Ghost(Pro) · Starter plan · connected 6 Aug</span></div>
    <div class="banner info"><span class="ico">ⓘ</span><span><b>Ghost(Pro) Starter does not allow custom themes.</b>
      Ghost restricts theme uploads on Starter, so we cannot deploy to this site. You can design and preview everything
      here, and export a theme zip whenever you want.</span></div>
    <div class="stack gap8"><span class="panel-label">What clears this</span>
      <div class="checkrow"><span class="tick">1</span><span>Upgrade the site to <b>Ghost(Pro) Publisher or higher</b>,
        then it clears on its own.</span></div>
      <div class="checkrow"><span class="tick">2</span><span>Or move the site to <b>self-hosted Ghost</b>, where theme
        upload is always available.</span></div></div>
    <div class="banner notice"><span class="ico">!</span><span>Your zip downloads on every plan, but
      <b>Starter forbids custom themes in Ghost Admin too</b> — this is a plan limit, not an API limit, so uploading it by
      hand is not a route either. It installs on a self-hosted Ghost, or on a Ghost(Pro) plan that allows custom themes.</span></div>
    <div class="row gap10"><a class="btn coral" href="deploy-destination.html#preview-only">Export theme zip</a>
      <a class="btn secondary" href="preview-only-notice.html">Re-check plan</a>
      <span class="btn off">Ship it</span></div>
    <span class="reason">Ghost(Pro) Starter doesn&rsquo;t accept custom themes over the API or in Ghost Admin.</span>
  </div></div></div>""", capt='B15 · preview-only connection — sky, not danger')
     + head('Probed, never asked', 'At connect, <span class="mono">hostSettings.limits.customThemes</span> reports whether '
            'the site permits custom theme upload; its absence means self-hosted and unlimited. <b>There is no '
            'user-declared-plan step in the happy path and no plan field in <a href="manage-keys.html">Manage Keys</a>.</b>',
            anchor='probe')
     + screen("""<div style="padding:24px;background:var(--surface)"><div class="stack gap10" style="max-width:760px;margin:0 auto">
  <div class="banner info"><span class="ico">ⓘ</span><span><b>Set at connect</b> — the probe read the plan.</span></div>
  <div class="banner info"><span class="ico">ⓘ</span><span><b>Set by a rejected deploy</b> — a friendly explanation, a
    &ldquo;check or upgrade your Ghost(Pro) plan (Publisher or higher)&rdquo; prompt and a docs link. The deploy error is
    authoritative over the probe, in both directions.</span></div>
  <div class="banner success"><span class="ico">✓</span><span><b>Cleared by the daily probe.</b> The health check re-runs
    it, so the flag sets and clears with no user action at all. <b>Clearing is not the user&rsquo;s job.</b></span></div>
  <div class="banner success"><span class="ico">✓</span><span><b>Cleared by a successful deploy.</b></span></div>
  <div class="banner notice"><span class="ico">!</span><span><b>Asked</b> — the one path where a question exists. The
    <span class="mono">hostSettings</span> shape is undocumented and host-controlled, so where it is present but
    unreadable, the flow asks once: which plan is this site on? That question exists <b>only</b> on that path.</span></div>
  <p class="helper">The Re-check button stays regardless, because a user who has just upgraded should not have to wait a day.</p>
</div></div>"""),
     subs=[SUB('Probed, and its five states', 'probe', 'FR-C2 · FR-C5')])

page('routes-fallback', 'Routes Fallback Card', 'Deploy',
     'B Missing Surfaces.dc.html — B16 (cause re-specified; the hard-coded Ghost menu path deleted)',
     '§ IA → Deploy · flow F3 · § wrong mechanism → B16 · FR-I4',
     screen("""<div style="padding:32px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:700px"><div class="pad stack gap14">
    <h2 style="font-size:19px">Upload <span class="mono">routes.yaml</span> yourself</h2>
    <p style="font-size:13.5px;line-height:1.6">We normally upload this for you. <b>Uploading a routing file needs the
      site Owner&rsquo;s Staff Access Token, and this project doesn&rsquo;t have one</b> — so this once, you&rsquo;ll do
      it by hand. It takes about a minute.</p>
    <div class="stack gap10">
      <div class="checkrow"><span class="tick">1</span>
        <span class="stack gap4 grow"><b>Download the file we generated</b>
          <span class="row gap8"><span class="chip mono">routes.yaml</span><span class="helper">1.4 KB</span>
            <a class="btn sm secondary" href="routes-fallback.html">Download</a></span></span></div>
      <div class="checkrow"><span class="tick">2</span>
        <span class="stack gap4 grow"><b>In Ghost, find the routes upload for your version</b>
          <span class="helper">We detected <b>Ghost 6.58</b> at connect. Ghost moves this screen between versions, so we
            describe what you are looking for rather than naming clicks that are already wrong for some customers.</span>
          <a class="small" href="routes-fallback.html" style="color:var(--sky-text)">Show me where ↗</a></span></div>
      <div class="checkrow"><span class="tick">3</span>
        <span class="stack gap4 grow"><b>Come back and press Verify</b>
          <span class="helper">We re-read your routing through the Content API where we can, and otherwise say we could
            not confirm. We will not claim success we cannot see.</span></span></div></div>
    <div class="row gap10"><a class="btn coral" href="routes-fallback.html#verified">Verify upload</a>
      <a class="btn secondary" href="staff-token-offer.html">Add the token instead</a></div>
    <span class="helper">Adding the token makes this automatic from now on.</span>
  </div></div></div>""", capt='B16 · routes fallback card — needed')
     + head('The three causes, and each names itself', anchor='causes')
     + screen("""<div style="padding:24px;background:var(--surface)"><div class="stack gap12" style="max-width:760px;margin:0 auto">
  <div class="card"><div class="pad-tight stack gap4"><b style="font-size:13px">No Staff Access Token was ever supplied</b>
    <span class="helper">&ldquo;We normally upload this for you. Uploading a routing file needs the site Owner&rsquo;s
      Staff Access Token, and this project doesn&rsquo;t have one — so this once, you&rsquo;ll do it by hand.&rdquo;
      + <b>Add the token instead</b></span></div></div>
  <div class="card"><div class="pad-tight stack gap4"><b style="font-size:13px">The token was revoked or rotated</b>
    <span class="helper">&ldquo;…your token has stopped working.&rdquo; + <b>Update the token</b></span></div></div>
  <div class="card"><div class="pad-tight stack gap4"><b style="font-size:13px">The connection is not the site Owner&rsquo;s</b>
    <span class="helper">&ldquo;…this token belongs to a staff account that can&rsquo;t write settings. Only the site
      Owner&rsquo;s token can.&rdquo;</span></div></div>
</div></div>""")
     + head('Uploaded and verified', 'The card resolves to a single confirming line and does not return.', anchor='verified')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="banner success" style="max-width:620px"><span class="ico">✓</span>
    <span><b>Your routing is live.</b> We read it back and your collections resolve.</span></div></div>""", cls='detail')
     + head('Could not verify', 'The file was uploaded and the read-back failed. <b>Say so, and offer Verify again — never '
            'claim success.</b>', anchor='unverified')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:620px"><div class="pad stack gap10">
    <div class="banner notice"><span class="ico">!</span><span><b>We couldn&rsquo;t confirm it landed.</b>
      Your upload may well have worked — we just cannot see the routing file from here without the token, and we are not
      going to tell you it is fine when we do not know.</span></div>
    <div class="row gap10"><a class="btn secondary" href="routes-fallback.html#verified">Verify again</a>
      <a class="btn ghost" href="staff-token-offer.html">Add the token instead</a></div></div></div></div>""", cls='narrow'),
     note='<b>The frame sends people to fix something that cannot be fixed.</b> B16 says &ldquo;your integration key is '
          'missing the settings permission … Fix the key.&rdquo; Integration tokens never carry '
          '<span class="mono">setting: edit</span> — Ghost&rsquo;s allowlist binds them and there is nothing to grant. A '
          '<i>staff</i> token carries a <span class="mono">user_id</span>, skips the allowlist entirely, and an '
          'Administrator or Owner holds <span class="mono">setting: all</span>. <b>It is not a warning toast</b> — it is a '
          'first-class surface, reachable afterwards from the site card and from the '
          '<a href="routes-manager.html">Routes Manager</a>, and a project can sit in this state indefinitely without '
          'anything degrading except the automation.',
     subs=[SUB('The three causes', 'causes', 'F3'), SUB('Uploaded and verified', 'verified', ''),
           SUB('Could not verify', 'unverified', 'NE-S-1')])


page('template-binding-checklist', 'Template Binding Checklist', 'Deploy',
     'B Missing Surfaces.dc.html — B19 (drawn on a mechanism FR-I1 forbids; its components kept, everything they say '
     'changed). Fires from the Deploy Live success state',
     '§ IA → Deploy · flow F6 · FR-I6',
     screen("""<div style="padding:32px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:940px"><div class="pad row gap28" style="align-items:flex-start;gap:28px">
    <div class="stack gap14 grow">
      <h2 style="font-size:20px">Point a Ghost page at each template</h2>
      <p style="font-size:13.5px;line-height:1.6">Three templates shipped with this deploy. Ghost stores the template
        choice on the page&rsquo;s own row, so the last step happens in Ghost — once per page, and it survives a retitle,
        a slug change and a theme swap.</p>
      <div class="stack gap10">
        <div class="itemrow"><span class="check"></span><div class="stack gap2 grow">
            <b style="font-size:13.5px">Membership</b>
            <span class="helper mono">custom-membership.hbs</span>
            <span class="helper">Ghost&rsquo;s Template dropdown will show it as <b>Membership</b>.</span></div>
          <a class="btn sm secondary" href="template-binding-checklist.html">Open in Ghost ↗</a></div>
        <div class="itemrow"><span class="check"></span><div class="stack gap2 grow">
            <b style="font-size:13.5px">Signin</b><span class="helper mono">custom-signin.hbs</span>
            <span class="helper">Ghost will show it as <b>Signin</b>.</span></div>
          <a class="btn sm secondary" href="template-binding-checklist.html">Open in Ghost ↗</a></div>
        <div class="itemrow done"><span class="check on">✓</span><div class="stack gap2 grow">
            <b style="font-size:13.5px">Member home</b><span class="helper mono">custom-member-home.hbs</span>
            <span class="helper">Marked done by you.</span></div></div></div>
      <ol class="stack gap8" style="margin:0;padding-left:18px;font-size:13px;line-height:1.55">
        <li>Ship this template. It arrives in Ghost as a page template.</li>
        <li>In Ghost, open a page and pick <b>Membership</b> from the Template dropdown.</li>
        <li>That&rsquo;s it — Ghost remembers your choice on that page, even if you rename or re-slug it later.</li></ol>
      <div class="banner info"><span class="ico">ⓘ</span><span><b>We can&rsquo;t see whether you did this.</b>
        Ghost doesn&rsquo;t tell us which template a page picked, so tick it off yourself when it&rsquo;s done.</span></div>
    </div>
    <div class="card" style="width:300px;flex-shrink:0"><div class="pad-tight stack gap10">
      <span class="frame-cap" style="margin:0">what you will see in Ghost</span>
      <span class="panel-label" style="font-size:10.5px">GHOST · PAGE SETTINGS</span>
      <div class="stack gap4"><span class="control-label soft">Page URL</span>
        <span class="input" style="display:flex;align-items:center;font-size:12.5px">/join/</span></div>
      <div class="stack gap4"><span class="control-label soft">Template</span>
        <div class="card" style="box-shadow:var(--sh-md)"><div class="pad-tight stack gap2">
          <div class="row gap8" style="padding:5px 6px;font-size:12.5px">Default</div>
          <div class="row gap8" style="padding:5px 6px;font-size:12.5px;background:var(--coral-tint);border-radius:5px">Membership<span style="margin-left:auto">✓</span></div>
          <div class="row gap8" style="padding:5px 6px;font-size:12.5px">Signin</div>
          <div class="row gap8" style="padding:5px 6px;font-size:12.5px">Member home</div>
        </div></div></div>
      <span class="helper">The dropdown is the setting. There is no badge here, because Inflozo cannot see what a Ghost
        page chose.</span></div></div>
  </div></div></div>""", capt='B19 re-specified · a checklist with one row per emitted template — not a notification')
     + head('What the frame got wrong, row by row', anchor='corrections')
     + screen("""<div style="padding:24px;background:var(--surface)"><table class="limits" style="max-width:900px;margin:0 auto">
  <tr><th>B19 says</th><th>The truth</th></tr>
  <tr><td><span class="mono">page-membership.hbs</span></td>
    <td><b><span class="mono">custom-membership.hbs</span>.</b> Inflozo never emits <span class="mono">page-{slug}.hbs</span>:
      that form is matched against the live slug at render time, <b>detaches silently the moment the user retitles the
      page</b>, and outranks the user&rsquo;s explicit dropdown choice — Ghost Admin disables the dropdown outright when a
      slug template matches.</td></tr>
  <tr><td>&ldquo;Set its URL slug to <span class="mono">membership</span>&rdquo;</td>
    <td><b>Pick the template from Ghost&rsquo;s page-editor Template dropdown.</b> Ghost stores the chosen filename on the
      page&rsquo;s own row, so the binding survives a retitle, a slug change and a theme swap.</td></tr>
  <tr><td>&ldquo;Ghost picks the template up automatically — there is no setting to toggle&rdquo;</td>
    <td>There is exactly one setting to toggle, and this is it.</td></tr>
  <tr><td>A <b>MATCHED</b> badge</td>
    <td><b>Deleted.</b> It implies a verification that does not exist: the assignment lives on Ghost&rsquo;s page row and
      the Content API does not expose which template a page selected.</td></tr>
  <tr><td>One template</td><td><b>Every</b> emitted template, one row each.</td></tr>
</table></div>""")
     + head('Where it appears, and the one nudge',
            'On <a href="deploy-live.html#binding">Deploy Live</a>, as a &ldquo;one step left&rdquo; card — <b>not a modal '
            'that must be dismissed to reach the confetti</b>. Afterwards it is reachable from the Template Switcher and '
            'from the site card. A project whose deploy emitted no custom template never sees it, which is every '
            'starter&rsquo;s first deploy. And if it is still unopened a day later, '
            '<a href="notifications.html">Notifications</a> raises it <b>once, and never again</b>.', anchor='where')
     + head('The warning that belongs beside it',
            'Removing every section from a designed custom template returns it to untouched and its file stops being '
            'emitted; a Ghost page still pointing at that filename falls back to <span class="mono">page.hbs</span> rather '
            'than erroring. That fallback is silent on Ghost&rsquo;s side, so Inflozo is not silent on its own — '
            '<a href="editor.html#empty-template-warning">Empty Template Warning</a> fires before it takes effect.',
            anchor='empty-warning'),
     subs=[SUB('What the frame got wrong', 'corrections', 'B19'),
           SUB('Where it appears', 'where', 'F6'),
           SUB('The paired warning', 'empty-warning', 'FR-I1')])

page('edit-lock', 'Edit Lock', 'Editor',
     'B Missing Surfaces.dc.html — B5a read-only bar, B5b request popover, B5c takeover modal. '
     'The escalation is kept exactly as drawn; B5c&rsquo;s itemised loss is deleted',
     '§ IA → Editor · flow F2 · FR-D18, addendum.md §AD2',
     head('One editing context per project — across tabs, browsers and devices',
          'The three frames escalate deliberately: <b>a bar, then a popover, then a modal with a danger fill</b>. '
          'The interruption grows only as the stakes do. That escalation is the design and it stands.')
     + head('1 · The reader — Editor, read-only', 'The canvas stays fully legible; the sidebar dims to 55% so controls are '
            '<i>visible</i> but nothing responds. The bar names the person, not a role, and the request is a button '
            'because asking is the expected action here.', 'B5a', anchor='reader')
     + screen("""<div style="padding:24px;background:var(--paper)">
  <div class="row gap12" style="background:var(--sky-tint);padding:12px 16px;border-radius:var(--r);max-width:820px;margin:0 auto">
    <b style="font-size:13.5px">Rosa is editing this site — you are reading along.</b>
    <a class="btn sm secondary" style="margin-left:auto" href="edit-lock.html#holder">Request editing</a></div></div>""",
              cls='tight')
     + head('2 · The holder — a popover, not a modal',
            'The holder is mid-sentence. It states the sync position <b>before</b> asking, so handing over is not a gamble. '
            '<b>The countdown is a no-response timer and it stops the instant the holder interacts with the popover at all, '
            'focus included</b> — it only runs out when nobody is there, so a present holder is never hurried into a '
            'decision that loses someone else&rsquo;s work. It is announced <b>assertively</b>, because a request that '
            'arrives silently is a request a screen-reader user answers by not answering.', 'B5b', anchor='holder')
     + screen("""<div style="padding:32px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:360px;box-shadow:var(--sh-md)"><div class="pad stack gap12">
    <div class="row gap10"><span class="avatar" style="background:#3A4A5F">DM</span>
      <b style="font-size:14px">Dai wants to edit</b></div>
    <p style="font-size:13px;line-height:1.55">If you hand over, your unsynced changes are sent first. You keep reading along.</p>
    <div class="banner success"><span class="ico">✓</span><span><b>All your changes are synced</b> · 0 pending</span></div>
    <div class="row gap10"><a class="btn" href="edit-lock.html#reader">Hand over</a>
      <a class="btn secondary" href="editor.html">Keep editing</a>
      <span class="helper" style="margin-left:auto">Expires in 60s</span></div>
    <span class="helper">Touch it — even focus it — and the countdown stops.</span></div></div></div>""", cls='tiny')
     + head('3 · The requester, unanswered', '', anchor='unanswered')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="row gap12" style="background:var(--marigold-tint);padding:12px 16px;border-radius:var(--r);max-width:760px">
    <b style="font-size:13.5px">No response; that session has 7 unsaved edits.</b>
    <a class="btn sm secondary" style="margin-left:auto" href="edit-lock.html#takeover">Take over anyway</a></div></div>""",
              cls='tight')
     + head('4 · The takeover — B5c, and three things about it are decided',
            '<b>A takeover is allowed.</b> It is not a wall. <b>The count is edits, never operations</b> — a Variant Shuffle '
            'is several operations and one edit, and the number appears verbatim in the string that tells a person what '
            'they lost. And <b>the message is honest rather than reassuring</b>: work that had not synced is genuinely gone. '
            'The losing device&rsquo;s journal is cleared unconditionally on its next hydrate, there is no merge path, and '
            'orphaned edits are never recovered.', 'B5c', anchor='takeover')
     + screen("""<div class="sheetwrap"><div class="sheet narrow"><div class="head"><h2 style="font-size:18px">Take over from Rosa?</h2></div>
  <div class="body"><p style="font-size:13px;line-height:1.55">Rosa has not responded for 4 minutes. She has changes that
    never reached the server.</p>
    <div class="banner error"><span class="ico">!</span><span><b>7 unsynced edits will be lost.</b>
      They exist only in Rosa&rsquo;s browser. We cannot retrieve them from here.</span></div></div>
  <div class="foot"><a class="btn secondary" href="editor.html" style="box-shadow:var(--focus)">Wait</a>
    <a class="btn danger" href="edit-lock.html#revived">Take over anyway</a>
    <a class="btn ghost" href="edit-lock.html">Or message Rosa</a></div></div></div>""", cls='narrow')
     + head('5 · The revived former holder', 'It flips to read-only and its local journal is cleared. Announced '
            '<b>assertively</b>, because this is work that is already gone.', anchor='revived')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="row gap12" style="background:var(--danger-tint);padding:12px 16px;border-radius:var(--r);max-width:760px">
    <b style="font-size:13.5px">That session had 14 unsaved edits; they were not included.</b>
    <span class="helper">Dai is editing this site now — you are reading along.</span></div></div>""", cls='tight')
     + head('Deploy and export require the lock',
            'From a read-only session, Ship it or Export first prompts a take-over, <b>surfacing &ldquo;X unsaved edits '
            'exist elsewhere&rdquo;</b> — so a stale cloud snapshot can never silently ship. This state is drawn on no '
            'frame and is added to B5&rsquo;s family here.', anchor='deploy-blocked')
     + screen("""<div style="padding:24px;background:var(--paper);display:flex;justify-content:center">
  <div class="card" style="max-width:520px"><div class="pad stack gap10">
    <b style="font-size:14px">Rosa is editing this site.</b>
    <p style="font-size:13px;line-height:1.55">Shipping from here would send what the server has, and
      <b>7 unsaved edits exist elsewhere</b>. Take over first, or ask Rosa to ship it.</p>
    <div class="row gap10"><a class="btn secondary" href="edit-lock.html#takeover">Take over first</a>
      <a class="btn ghost" href="edit-lock.html">Ask Rosa</a></div></div></div></div>""", cls='narrow'),
     note='<b>One deviation from B5c, and it is not optional.</b> The frame itemises the loss per section — &ldquo;Home '
          'hero — design and two controls · Footer — three link labels&rdquo;. <b>That detail does not exist.</b> The '
          'heartbeat carries <span class="mono">unsynced_edits</span> and nothing else; the requester&rsquo;s browser has '
          'never seen the holder&rsquo;s journal. The modal keeps its shape, its danger fill and its &ldquo;Or message '
          'Rosa&rdquo; escape. Also: B5c says &ldquo;changes&rdquo;; <b>§AD2 says <i>edits</i> is canonical, everywhere</b> '
          '— the field name, the heartbeat, the FR&rsquo;s prose and every user-visible string. '
          '<b>Rollback and snapshot restore never require the lock</b>, because they redeploy a stored artifact rather '
          'than the working document.',
     subs=[SUB('The reader', 'reader', 'B5a'), SUB('The holder', 'holder', 'B5b'),
           SUB('Unanswered', 'unanswered', ''), SUB('The takeover', 'takeover', 'B5c'),
           SUB('The revived holder', 'revived', ''), SUB('Deploy from a read-only session', 'deploy-blocked', 'new')])


# ═══════════════════════════════════════════════════════════════════════════════
# The four journeys and the eight flows — EXPERIENCE.md § Key Flows and § The eight flows
# ═══════════════════════════════════════════════════════════════════════════════
journey('J1', 'Connect → first deploy',
        'The solo publisher. One Ghost site, is its Owner, and reads &ldquo;Staff Access Token&rdquo; as a warning sign. '
        '<b>Two endings, and both ship a site.</b>',
        [('sign-in.html', 'Sign In'), ('magic-link-sent.html', 'Magic Link Sent'), ('first-run.html', 'First Run'),
         ('connect-integration.html', 'Connect · Integration'), ('connect-keys.html', 'Connect · Keys'),
         ('auto-branding.html', 'Auto-Branding'), ('redesign-proposals.html', 'Redesign Proposals'),
         ('editor.html', 'Editor — she builds'), ('deploy-destination.html', 'Deploy Destination · step 1 of 6'),
         ('staff-token-offer.html', 'Staff Token Offer · step 2'), ('backup-gate.html', 'Backup Gate · step 3'),
         ('preflight-check.html', 'Pre-flight Check · step 4'), ('snapshot-gate.html', 'Snapshot Gate · step 5'),
         ('deploy-progress.html', 'Deploy Progress · step 5'), ('deploy-live.html', 'Deploy Live · step 6')])

journey('J2', 'Blank-canvas build',
        'The creator with taste. Full credential reach, opinionated, will find the ceiling of a closed control vocabulary. '
        '<b>What it proves: the canvas never tells her she is wrong.</b>',
        [('first-run.html', 'First Run — Blank canvas'), ('editor.html#empty', 'Editor — empty'),
         ('section-picker.html', 'Section Picker · ⌘K'), ('editor.html#selected', 'Editor — the section lands'),
         ('editor.html#design-picker', 'Design Picker — the climax beat'),
         ('editor.html#control-sidebar', 'Control Sidebar'), ('editor.html#inline-toolbar', 'Inline Toolbar'),
         ('style-packs.html', 'Style Packs'), ('editor.html#template-switcher', 'Template Switcher'),
         ('editor.html#layers', 'Layers · L'), ('preview-mode.html', 'Preview Mode · P'),
         ('device-preview.html#mobile', 'Device Preview · 3'), ('site-remix.html', 'Site Remix · ⇧R'),
         ('deploy-wizard.html', 'Deploy Wizard — four steps this time')])

journey('J3', 'Free-plan ship',
        'The solo publisher, on Free, one project, one site. <b>Open canvas, gated exits</b> — enforcement happens only at '
        'deploy, export, and any surface exposing compiled theme code.',
        [('dashboard.html#free', 'Dashboard · Free'), ('editor.html#pro-badge', 'Editor — four Pro designs placed'),
         ('deploy-destination.html', 'Ship it'), ('pro-exit-sheet.html', 'Pro Exit Sheet — the climax beat'),
         ('upgrade-sheet.html', 'Upgrade Sheet — or she swaps'), ('pricing.html', 'Pricing — the same terms, publicly'),
         ('backup-gate.html', 'Backup Gate'), ('preflight-check.html', 'Pre-flight Check'),
         ('snapshot-gate.html', 'Snapshot Gate'), ('deploy-live.html', 'Deploy Live')])

journey('J4', 'Downgrade recovery',
        'The multi-site operator. Six projects, two sites, 312 MB of assets, and a client&rsquo;s card was cancelled. '
        '<b>Their churn is client attrition, not dissatisfaction — which is exactly why this must not feel like a '
        'punishment.</b>',
        [('grace-banner.html', 'Grace Banner — payment failed'), ('grace-banner.html#kept', 'During grace, nothing is withdrawn'),
         ('billing.html', 'Billing — update the card, or let it lapse'), ('grace-banner.html#expiry', 'Grace expires'),
         ('over-limit-sheet.html', 'Over-Limit Sheet — the climax beat'),
         ('over-limit-sheet.html#which-project', 'Which project stays editable'),
         ('sites.html', 'Sites — disconnect down to one'), ('assets.html#over-quota', 'Assets — read-only until under'),
         ('deploy-history.html', 'Deploy History — retained, never pruned'),
         ('over-limit-sheet.html#resolved', 'Resolved — nothing was lost')])

flow('F1', 'Pre-deploy snapshot gate', 'FR-J13 · fires at the FIRST theme upload to a site, deploy-only included',
     [('snapshot-gate.html', 'Running'), ('snapshot-gate.html#captured', 'Captured'),
      ('snapshot-gate.html#no-token', 'No Staff Access Token — the designed degraded path'),
      ('snapshot-gate.html#failed', 'Capture failed otherwise'),
      ('deploy-history.html#restore', 'Restore, and Ghost&rsquo;s own gscan on the way back in')])

flow('F2', 'The three-party edit-lock choreography', 'FR-D18 · addendum.md §AD2',
     [('edit-lock.html#reader', 'The reader'), ('edit-lock.html#holder', 'The holder'),
      ('edit-lock.html#unanswered', 'The requester, unanswered'), ('edit-lock.html#takeover', 'The takeover'),
      ('edit-lock.html#revived', 'The revived former holder'),
      ('edit-lock.html#deploy-blocked', 'Deploy and export require the lock')])

flow('F3', 'The guided routes-upload card', 'FR-I4 · routes.yaml uploads automatically; this is the fallback',
     [('routes-fallback.html', 'Needed'), ('routes-fallback.html#causes', 'The three causes'),
      ('routes-fallback.html#verified', 'Uploaded and verified'),
      ('routes-fallback.html#unverified', 'Could not verify'),
      ('staff-token-offer.html', 'Add the token instead — and it becomes automatic')])

flow('F4', 'The library-update confirm', 'FR-J14 · the flow §37.7 found correct',
     [('dashboard.html#library-update', 'Library Update Notice, in the project card'),
      ('library-update-confirm.html', 'Library Update Confirm — mandatory before compile'),
      ('library-update-confirm.html#why', 'Why a confirm exists, and the contract that makes it safe'),
      ('preflight-check.html', 'Pre-flight, and on to the deploy')])

flow('F5', 'The Preview-only explanation, and its clearing conditions', 'FR-C2 · probed, never asked',
     [('connect-keys.html#validation', 'Set at connect, by the probe'),
      ('preview-only-notice.html', 'Preview-Only Notice'),
      ('preview-only-notice.html#probe', 'The five states, and who clears them'),
      ('deploy-destination.html#preview-only', 'Preview-Only Destination — export instead of deploy'),
      ('sites.html', 'The site card')])

flow('F6', 'The post-deploy template-binding checklist', 'FR-I6 · a checklist, not a notification',
     [('deploy-live.html#binding', 'Deploy Live — &ldquo;one step left&rdquo;'),
      ('template-binding-checklist.html', 'The checklist, one row per emitted template'),
      ('template-binding-checklist.html#corrections', 'What the frame got wrong'),
      ('notifications.html', 'One nudge, once, a day later'),
      ('editor.html#empty-template-warning', 'Empty Template Warning — the paired case')])

flow('F7', 'The pre-deploy backup gate', 'BACKUP-GATE.md · a consent gate, not a technical control',
     [('backup-gate.html', 'Self-hosted, with the ghost backup shortcut'),
      ('backup-gate.html#ticked', 'Ticked — the deploy button turns on'),
      ('backup-gate.html#ghostpro', 'Ghost(Pro) — the honest block'),
      ('backup-gate.html#confirmed', 'Confirmed, once per site')])

flow('F8', 'Deploy history with pinning', 'FR-J7/J9 · at most 10 stored versions on Pro and 3 on Free',
     [('deploy-history.html', 'The drawer, with pinning and the original-theme row'),
      ('deploy-history.html#pin-refusal', 'The pin refusal — one must stay unpinned'),
      ('deploy-history.html#free', 'On Free — the limit is shown, not hidden'),
      ('deploy-history.html#rollback', 'Roll back'),
      ('partial-success.html', 'Partial success — a state nobody drew'),
      ('deploy-uploaded.html#same-state', 'One state, two causes')])


# ═══════════════════════════════════════════════════════════════════════════════
# index.html — the front door. EVERYTHING ON IT IS DERIVED FROM THE REGISTRY ABOVE,
# so it cannot claim a surface the prototype does not have, or miss one it does
# (standing rule: counts are derived, never restated).
# ═══════════════════════════════════════════════════════════════════════════════
GROUP_ORDER = ['Marketing', 'Entry', 'Onboarding', 'Dashboard and account', 'Editor', 'Deploy']


def trail_block(t, kind):
    steps = ''
    for i, (href, label) in enumerate(t['steps'], 1):
        steps += (f'<a class="idxrow" href="{href}"><span class="mono" style="color:var(--ink-faint)">{i}</span>'
                  f'<span>{label}</span></a>')
    return (f'<div class="card" style="margin-bottom:12px"><div class="pad stack gap10">'
            f'<div class="row gap10"><span class="badge neutral mono">{t["key"]}</span>'
            f'<b style="font-size:15px">{t["title"]}</b></div>'
            f'<p class="helper">{t["who"] if kind == "journey" else t["why"]}</p>'
            f'<div class="idxgrid">{steps}</div></div></div>')


def build_index():
    pages_by_group = {g: [p for p in PAGES if p['group'] == g] for g in GROUP_ORDER}
    n_pages = len(PAGES)
    n_subs = sum(len(p['subs']) for p in PAGES)

    ia = ''
    for g in GROUP_ORDER:
        rows = ''
        for p in sorted(pages_by_group[g], key=lambda x: x['title']):
            rows += (f'<a class="idxrow" href="{p["id"]}.html"><b>{p["title"]}</b>'
                     f'<span class="k">page</span></a>')
            for name, anchor, note in p['subs']:
                rows += (f'<a class="idxrow" href="{p["id"]}.html#{anchor}" style="padding-left:22px">'
                         f'<span class="soft">{name}</span>'
                         f'<span class="k">on {p["title"]}</span></a>')
        ia += (f'<div class="section-head"><h2>{g}</h2></div>'
               f'<div class="idxgrid">{rows}</div>')

    journeys = ''.join(trail_block(t, 'journey') for t in JOURNEYS)
    flows = ''.join(trail_block(t, 'flow') for t in FLOWS)

    return f"""<!--
  INFLOZO STATIC PROTOTYPE · step 5b · ruling R-75 · the front door.
  Every surface EXPERIENCE.md's Information Architecture names appears below — as a page
  where a journey or a flow LANDS on it, and as a section of its host page otherwise.
  Generated by build.py from one registry, so this list cannot drift from what exists.
  FRAME     : the whole design export; tokens from Calibration Set.dc.html via DESIGN.md
  IMPLEMENTS: EXPERIENCE.md § Information Architecture, § Key Flows, § The eight flows
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
  <span class="frame">built from EXPERIENCE.md and the Claude Design export</span>
</div>
<main id="main"><div class="idx">
  <div class="card" style="margin-bottom:24px"><div class="pad stack gap12">
    <h1 style="font-size:32px">Inflozo, drawn.</h1>
    <p style="font-size:14.5px;line-height:1.6;max-width:78ch">This is Inflozo&rsquo;s own interface as static pages you
      can click through — the product as it will look, before anything is built. It is built from
      <b>EXPERIENCE.md</b> (what each surface does, its states and its words) and the <b>Claude Design export</b>
      (what it is built from — its components, tokens, spacing and tone). Nothing here is wired to anything: every
      link goes to another page of this prototype.</p>
    <p style="font-size:14.5px;line-height:1.6;max-width:78ch">Walk the four journeys and the eight flows below.
      Each page names, in its top bar and in an HTML comment at the very top of its source, the frame it derives from
      and the part of EXPERIENCE.md it implements — so any page can be held up against its frame and checked.</p>
    <div class="row gap10 wrap">
      <span class="chip">{n_pages} pages</span>
      <span class="chip">{n_subs} surfaces that live on another surface</span>
      <span class="chip">{len(JOURNEYS)} journeys</span>
      <span class="chip">{len(FLOWS)} flows</span>
      <span class="chip">fixture: Orbit Weekly</span></div>
    <p class="helper">Counts on this line are derived from the page registry at build time, not typed.</p>
  </div></div>

  <div class="section-head"><h2>The four journeys</h2>
    <p>PRD §3&rsquo;s personas, used verbatim. Each carries the one thing that decides how the journey actually plays
      out — its Ghost credential reach.</p></div>
  {journeys}

  <div class="section-head"><h2>The eight flows</h2>
    <p>Each is <b>a designed surface, never a warning toast</b>.</p></div>
  {flows}

  <div class="section-head"><h2>Every surface</h2>
    <p>EXPERIENCE.md&rsquo;s Information Architecture, in its own order. A <b>page</b> is anything a journey or a flow
      lands on. Everything indented under one is a panel, pill, marker, popover or sheet that only exists over that
      surface — it has a section on its host page and is reachable by a link from it.</p></div>
  {ia}

  <div class="section-head"><h2>Three things worth knowing before you walk it</h2></div>
  <div class="grid g3 gap16">
    <div class="card"><div class="pad stack gap8"><b style="font-size:14px">Six frames were drawn on the wrong mechanism</b>
      <span class="helper">B19 page binding · B12 snapshot gate · B16 routes fallback · B13a Pro exit · B24 grace banner ·
        B11 device preview. This prototype builds <b>the re-specification</b>: the frame&rsquo;s components stay and what
        they do changes. Each page says which, in its note.</span></div></div>
    <div class="card"><div class="pad stack gap8"><b style="font-size:14px">Some surfaces had no frame</b>
      <span class="helper">Their pages are extrapolated from the frame EXPERIENCE.md names, exactly as its Appendix A
        prompts describe — the backup gates, history pinning, the drift report, the dashboard sheets, the canvas markers,
        Theme Settings completed, and the editor below 1440. <b>Those prompts had not been run when this was built</b>,
        so the export carries no D-canvases yet. Run them and these pages should be checked against the result.</span></div></div>
    <div class="card"><div class="pad stack gap8"><b style="font-size:14px">Product limits are shown; library totals never are</b>
      <span class="helper">10 and 3 stored versions, 1 project and 1 site on Free, 25 and 10 on Pro, 100 MB and 5 GB,
        10 MB per upload — these are requirements and a flow that hides one is wrong. How many designs exist is never
        printed anywhere, because the library grows monthly.</span></div></div>
  </div>
</div></main>
<div class="proto" style="position:static">
  <span class="frame">Static prototype · disposable by design, the day the dynamic UI matches it.</span>
</div>
</body>
</html>
"""


def main():
    seen = set()
    for p in PAGES:
        assert p['id'] not in seen, f'duplicate page id: {p["id"]}'
        seen.add(p['id'])
        with open(os.path.join(OUT, p['id'] + '.html'), 'w') as f:
            f.write(shell(p))
    with open(os.path.join(OUT, 'index.html'), 'w') as f:
        f.write(build_index())

    # Every href in every emitted page must resolve to a file we wrote, and every anchor
    # to an id that exists on its target. A surface that cannot be reached by clicking has
    # not been built — and a link that 404s on a double-click is worse than no link.
    files = {p['id'] + '.html' for p in PAGES} | {'index.html', 'styles.css'}
    bodies = {p['id'] + '.html': shell(p) for p in PAGES}
    bodies['index.html'] = build_index()
    ids = {name: set(re.findall(r'id="([^"]+)"', src)) for name, src in bodies.items()}
    bad = []
    for name, src in bodies.items():
        for href in re.findall(r'href="([^"]+)"', src):
            if href.startswith(('http', 'mailto:', '#')):
                if href.startswith('#') and href[1:] not in ids[name]:
                    bad.append(f'{name}: dead anchor {href}')
                continue
            tgt, _, frag = href.partition('#')
            if tgt not in files:
                bad.append(f'{name}: dead link {href}')
            elif frag and frag not in ids[tgt]:
                bad.append(f'{name}: dead anchor {href}')
    # Every declared sub-surface must have its anchor on its own page.
    for p in PAGES:
        for _n, a, _k in p['subs']:
            if a not in ids[p['id'] + '.html']:
                bad.append(f'{p["id"]}.html: declared surface anchor #{a} is not on the page')
    if bad:
        print('\n'.join(sorted(set(bad))))
        raise SystemExit(f'{len(set(bad))} broken links — fix before shipping')
    print(f'{len(PAGES)} pages + index.html + styles.css · '
          f'{sum(len(p["subs"]) for p in PAGES)} sub-surfaces · '
          f'{len(JOURNEYS)} journeys · {len(FLOWS)} flows · all links resolve')


if __name__ == '__main__':
    main()
