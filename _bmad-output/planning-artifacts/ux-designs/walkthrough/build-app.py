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

WHAT IS SHARED WITH STEP 5b, EXACTLY (F-017). Three things, and nothing else: `../frames.py` (the
lifter — one copy of the regex that finds a frame), `../prototype/styles.css` (the tokens, appended
with `_app.css` into this folder's `styles.css`), and one constant imported from
`../prototype/build.py` — `FONTS` (the font links). The two page registries are separate and nothing
asserts one against the other: "cannot drift" is true of the tokens and the lifter, not of which
frames each build lifts.

THE 2026-09-04 EXPORT: PROMPT A7 RAN, AND THE D CANVASES EXIST. Appendix A's Claude Design sessions
replaced the export on 2026-09-04. Prompt A7 corrected the frames themselves, so the F-007 plan-limit
patches this file used to carry (S11c, S12a, S12b, M5, S10b — §A12 decision 2) are GONE: the frames
now say what the patches used to say, and `check()` still refuses any plan string the PRD overrides,
so the export cannot quietly regress. The same pass corrected the wrong-mechanism frames decision 6
held out (B12, B13a, B16, B19, B24, B11, S4d, B23a, S8c), so they are lifted as drawn. What A7 did
NOT touch stays out: Redesign Proposals (B22, R-78) and Translations (B18, FR-Q6) — see NOT_YET.
Prompts A1–A6 and A8 drew the surfaces that had no frame — D1 the first-deploy gates, D2 history
with pinning, D3 the drift report, D4 the dashboard sheets, D5 the canvas markers and the complete
template switcher, D6 Theme Settings completed, D8 the editor below 1440 — and every one is lifted
below under a `# D<n>` comment.

WHERE THE PRD STILL OVERRIDES THE FRAME, AND EVERY PATCH SAYS SO (F-007, F-008). R-74 gives the
export the construction; `prd.md` keeps behaviour and strings. Two sentences remain the PRD's: the
Preview-only destination copy on S8a′ and S11a (FR-J12 — Starter forbids custom themes in Ghost Admin
too; A7 did not list it and the frame still carries the old sentence) and B15's Ghost(Pro) plan name
(FR-C2 — Publisher, not Creator). Each `patch()` carries a comment naming the ruling it serves.

WHAT IS PATCHED INTO A FRAME, AND WHAT IS NOT. A lift is patched only with links, ids, classes,
hooks and the PRD's own strings — never with markup in a second vocabulary. Every overlay is a
drawn region (`region()` / `part()` / `card()` / `white()` / `modal()`), every trigger is a control
the frame drew, and the one scaffolding element on a screen — the walkthrough bar — is styled and
labelled as scaffolding (F-040). Where a control has two drawn states (a pin, a checkbox) the other
state is a hidden clone of a sibling the frame drew that way, never a re-drawing. A fix that would
change what a frame LOOKS like is not applied here; it goes to a Claude Design prompt.
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


def kid_span(h, text):
    for a, b in kids(h):
        if text in h[a:b]:
            return a, b
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


def white(h):
    """The white card a detail frame documents on its mat, at any depth — the D canvases draw their
    details as `width:100%` cards on a 520–940 mat (D1e, D3b, D4b, D4d, D5f, D6b, D6c)."""
    for a, b in kids(h):
        if 'background:#FFFFFF' in h[a:h.index('>', a)]:
            return h[a:b]
    for a, b in kids(h):
        try:
            return white(h[a:b])
        except KeyError:
            continue
    raise KeyError('no white card')


def modal(h):
    """The centred sheet a 1440 frame draws over its dimmed chrome (D4a, D4c): the child at
    left:50%;top:50%. The chrome behind it is the page the sheet opens over, not part of the sheet."""
    for a, b in kids(h):
        if 'left:50%;top:50%' in h[a:h.index('>', a)]:
            return h[a:b]
    raise KeyError('no centred sheet')


def widen(h, px):
    """A detail card drawn at width:100% of its mat keeps the mat's inner width on the paper, so it
    shows at the size it was drawn (F-010). Style merge only (F-036)."""
    return frames._with(h, 0, style='width:%dpx' % px)


def unwrap(h, tag):
    """Drop a Claude Design runtime wrapper (D1's <sc-if>) and keep what it wraps: it is not drawn."""
    return re.sub(r'</?%s\b[^>]*>' % tag, '', h)


def unbox_at(h, w):
    """unbox() for a frame drawn at a width other than 1440 (D8a at 834, D8b at 720): the width and
    the mat shadow go so it fills the window; its drawn height stays, so nothing collapses (F-001)."""
    cut = h.index('>') + 1
    head = re.sub(r'width:%dpx;' % w, '', h[:cut], count=1)
    head = re.sub(r'border-radius:8px;box-shadow:0 12px 40px rgba\(28,27,26,\.14\);', '', head, count=1)
    return head + h[cut:]


def elem_at(h, find, start=0):
    """(start, end) of the element whose opening tag contains `find` (an attribute or style value)."""
    i = h.index(find, start)
    a = h.rindex('<', 0, i)
    return a, frames._end(h, a)


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
    `title` (F-014), D8a's back arrow only an aria-label. Same wrapping as frames.link()."""
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


def rows_pick(h, name, *texts, ending=None):
    """A radio-card group whose selected look is on the ROW, not the label (S8a's and D1a's destination
    cards): the row two levels above each label picks, and the one drawn with the coral border starts
    selected. `ending` marks the row whose run ends on that step (D2f: Deploy only)."""
    rows = []
    for t in texts:
        a, _b = frames._elem(h, t)
        col = frames._enclosing(h, a - 1)
        rows.append((t, frames._enclosing(h, col[0] - 1)[0]))
    for t, ra in sorted(rows, key=lambda r: -r[1]):
        selected = 'border:1px solid #FF5941' in h[ra:h.index('>', ra)]
        kw = dict(data_pick=name, role='radio', tabindex='0' if selected else '-1', aria_checked='true' if selected else 'false')
        if selected:
            kw['data_picked'] = ''
        if ending and t == ending[0]:
            kw['data_ending'] = str(ending[1])
        h = frames._with(h, ra, **kw)
    return h


# ── two drawn states of one control (D1d's boxes, D2a's pins) ─────────────────────────────────
BOX = re.compile(r'<span style="width:18px;height:18px;[^"]*"[^>]*>')


def _boxes(h):
    """One drawn ticked box and one drawn unticked box, from the frame itself (never re-drawn)."""
    on = off = None
    for m in BOX.finditer(h):
        el = h[m.start():frames._end(h, m.start())]
        if 'background:#1C1B1A' in m.group(0):
            on = on or el
        elif 'cursor:not-allowed' not in m.group(0):
            off = off or el
    return on, off


def _twin_box(row, on, off, **attrs):
    """The row's drawn box keeps its state and gains the other drawn state as a hidden twin."""
    m = BOX.search(row)
    if not m or not ('border:1.5px solid' in m.group(0) or 'background:#1C1B1A' in m.group(0)):
        return None                    # an 18px dash (D1e's "not yours to take") is not a box
    ba, bb = m.start(), frames._end(row, m.start())
    ticked = 'background:#1C1B1A' in m.group(0)
    box = frames._with(row[ba:bb], 0, data_box='')
    twin = frames._with(off if ticked else on, 0, data_box='', hidden='')
    if not ticked:
        twin = frames._with(twin, 0, data_box_on='')
    else:
        box = frames._with(box, 0, data_box_on='')
    row = row[:ba] + box + twin + row[bb:]
    return frames._with(row, 0, role='checkbox', tabindex='0', aria_checked='true' if ticked else 'false', **attrs)


def ticks(h, container_style, group_name, on=None, off=None, inside="Ghost's help", span=None):
    """D1d / D1e / D1d′ / B19: every row of the list drawn with `container_style` (the one holding
    `inside`), or of the element at `span`, becomes a checkbox row. Its box keeps the state the frame
    drew and gains the other state as a hidden twin cloned from a box this frame (or `on`/`off`)
    drew that way; app.js swaps them and counts the group."""
    o, f = _boxes(h)
    on, off = on or o, off or f
    if span:
        ca, cb = span
    else:
        pos = 0
        while True:
            ca, cb = elem_at(h, container_style, pos)
            if inside in h[ca:cb]:
                break
            pos = cb
    cont = h[ca:cb]
    out = cont
    for a, b in reversed(kids(cont)):
        row = _twin_box(cont[a:b], on, off, data_check='', data_check_group=group_name)
        if row:
            out = out[:a] + row + out[b:]
    return h[:ca] + out + h[cb:]


def confirm_row(h, text, group_name, btn_text, btn_id, ready_box, on_style):
    """The gate's master confirm: it waits for its group, and ticking it wakes the deploy button
    with the primary look the frames draw (S8a's Run checks). D1d draws it dimmed, D1d′ ready."""
    a, _b = frames._elem(h, text)
    ra, rb = frames._enclosing(h, a - 1)
    row = h[ra:rb]
    dimmed = 'opacity:.5' in row[:row.index('>')]
    on, _f = _boxes(h)
    row = _twin_box(row, on, None, data_check='', data_check_needs=group_name, data_enables='#' + btn_id,
                    aria_disabled='true' if dimmed else 'false')
    m = BOX.search(row)
    row = row[:m.end() - 1] + ' data-ready="%s"' % ready_box + row[m.end() - 1:]
    h = h[:ra] + row + h[rb:]
    return attr(h, '>%s<' % btn_text, 'id="%s" data-on-style="%s"' % (btn_id, on_style))


def twins(h, find_a, find_b, name, upto=None):
    """D2a's pins: every control drawn as `find_a` (outline) gains a hidden clone of one drawn as
    `find_b` (filled), and vice versa. `upto` leaves the ones after it alone (v1's pin refuses)."""
    ta = h[slice(*elem_at(h, find_a))]
    tb = h[slice(*elem_at(h, find_b))]
    spots = [(m.start(), m.group(0) == find_a) for m in re.finditer(re.escape(find_a) + '|' + re.escape(find_b), h)]
    for i, is_a in reversed(spots):
        if upto is not None and i > upto:
            continue
        a = h.rindex('<', 0, i)
        if 'data-open=' in h[a:h.index('>', a)]:
            continue
        b = frames._end(h, a)
        own = frames._with(h[a:b], a - a, data_twin=name, role='button', tabindex='0', aria_pressed='false' if is_a else 'true')
        other = frames._with(tb if is_a else ta, 0, data_twin=name, role='button', tabindex='0',
                             aria_pressed='true' if is_a else 'false', hidden='')
        h = h[:a] + own + other + h[b:]
    return h


PAGES = []


def page(pid, title, body, attrs=''):
    """A product screen. `attrs` are body attributes (`data-editor-shell`, `data-keys`, `data-esc`)
    that app.js reads — no per-page script (F-022). An editor shell gets D8c's skip link as its
    first focusable element and hands a coarse pointer below 1024 to Small Screen Notice (D4f)."""
    if 'data-editor-shell' in attrs:
        body = SKIP + body
        attrs += ' data-small-screen="small-screen.html"'
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


def fill(inner, centre=False, mobile='', tablet='', zoom='', extra=''):
    """A lifted screen, sized to the window rather than to a 1440x900 frame. `centre` puts a
    narrow drawn card (a sheet, a phone frame) in the middle of the paper instead of top-left.
    `mobile` is the same surface's drawn 390 frame, shown instead of the desktop one under a
    phone-width media query (R-76, R2-responsive-mobile-viewport-1); `tablet` and `zoom` are the
    editor's drawn 834 and 720 frames (D8a, D8b), shown under those widths."""
    cls = ('stage centre' if centre else 'stage') + ((' ' + extra) if extra else '')
    if mobile or tablet or zoom:
        return (f'<div class="{cls}"><div class="at-1440">{inner}</div>'
                + (f'<div class="at-834">{tablet}</div>' if tablet else '')
                + (f'<div class="at-720">{zoom}</div>' if zoom else '')
                + (f'<div class="at-390">{mobile}</div>' if mobile else '') + '</div>')
    return f'<div class="{cls}">{inner}</div>'


def sheet(mid, inner, extra=''):
    """A drawn sheet, popover or modal as an overlay this page raises. app.js adds role=dialog,
    aria-modal and the focus trap at open time (F-024)."""
    return f'<div id="{mid}" class="overlay sheet-lifted"{(" " + extra) if extra else ""}>{inner}</div>'


def bar(*items):
    """THE WALKTHROUGH BAR — the one piece of scaffolding on a product screen, and it says so
    (F-040): a mono 'Walkthrough ·' label, ink chips, in reserved space under the frame so it never
    covers a frame's footer. It holds the hops no drawn control makes. `items` are (text, href)
    links, (text, 'open:id') triggers or (text, 'goto:n') wizard jumps."""
    out = []
    for text, target in items:
        if target.startswith('open:'):
            out.append(f'<button class="wchip" data-open="{target[5:]}" aria-haspopup="true" aria-expanded="false">{text}</button>')
        elif target.startswith('goto:'):
            out.append(f'<button class="wchip" data-goto="{target[5:]}">{text}</button>')
        else:
            out.append(f'<a class="wchip" href="{target}">{text}</a>')
    return '<div class="stage-back" role="navigation" aria-label="Walkthrough"><span class="wlabel">Walkthrough ·</span>' + ''.join(out) + '</div>'


# D8c · the skip link, the first focusable thing in every editor shell — the drawn focused state,
# hidden at rest by _app.css exactly as the frame captions it. Its target is the canvas.
SKIP = frames._with(region('D8 Editor Below 1440', label='D8c Skip link')[slice(*elem_at(
    region('D8 Editor Below 1440', label='D8c Skip link'), 'href="#d8-canvas"'))], 0, href='#canvas', class_='skip')
# D8e · the fourth Layers-row state: keyboard focus, as A7 item 7's ring
D8E_RING = re.search(r'box-shadow:0 0 0 2px #C2381F', region('D8 Editor Below 1440', label='D8e Layers row focused')).group(0)
# S8a's primary button, the look a gate's Run checks takes once the confirm is ticked
S8A_PRIMARY = _style_of(region('S8 Deploy', label='S8a Ship step 1'), 'Run checks')


def canvas_id(h):
    """The canvas the skip link lands on — the first #EDEAE6 area every editor frame draws."""
    return attr(h, 'background:#EDEAE6', 'id="canvas" tabindex="-1"')


def layers_focus(h):
    """D8e: every Layers row takes keyboard focus with the drawn ring; ↑ ↓ move between them (app.js)."""
    for m in reversed(list(re.finditer(r'aria-label="Hide [^"]*"', h))):
        svg = h.rindex('<', 0, m.start())
        ra, _rb = frames._enclosing(h, svg - 1)
        h = frames._with(h, ra, data_layer='', tabindex='0', style_focus=D8E_RING)
    return h


def layers_panel(h, marker):
    """The panel L hides (F-032): the 240px column holding `marker` (a layer name, or the LAYERS heading).
    The class is the hook, the panel is the frame's."""
    a = h.rindex('<div style="width:240px', 0, h.index(marker))
    return frames._with(h, a, class_='layers')


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
# F-015: no frame draws the empty canvas, so "Blank canvas" lands on the drawn editor — listed in NOT_YET
fr = link(fr, ('Connect your Ghost site', 'connect-integration.html'),
              ('Start from a starter', 'starter-chooser.html'),
              ('Blank canvas', 'editor.html'))
page('first-run', 'Welcome', fill(fr))

ci = unbox(region('S2 Onboarding', label='S2b1 Create integration'))
ci = link(ci, ('Done — next', 'connect-keys.html'), ('Back', 'first-run.html'))
page('connect-integration', 'Connect your Ghost site', fill(ci))

ck = unbox(region('S2 Onboarding', label='S2b Keys step'))
ck = link(ck, ('Back', 'connect-integration.html'))
# F-052: no frame draws a bad-key state, so Connect always succeeds — listed in NOT_YET
ck = link(ck, ('>Connect<', 'auto-branding.html'))
# F-051: credential fields are never offered to autofill or spell-check; attribute-only, no pixel changes
for ph in ('8d41c0a97b', '65a3f'):
    ck = attr(ck, 'placeholder="%s' % ph, 'autocomplete="off" spellcheck="false"')
page('connect-keys', 'Paste your keys', fill(ck))

ab = unbox(region('S2 Onboarding', label='S2c Auto branding'))
# F-008 (decision 6): Redesign Proposals (B22) is held out until a Claude Design pass redraws it (R-78; A7 did not), so J1 goes Auto-Branding → Editor
ab = link(ab, ('Use your brand', 'editor.html'), ('Skip', 'editor.html'))
page('auto-branding', 'Your brand', fill(ab))


# ═════════════════════════════════════════════════════════════════════════════
# DASHBOARD AND ACCOUNT — S3, S10, S11, S12, S13, D4
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


# D4a · the New Project Sheet, over the dashboard — FR-B2's four doors. Its sheet alone is lifted (F-010);
# the dashboard behind it is this page. Redesign is drawn greyed with its reason, so it goes nowhere.
new_project = modal(region('D4 Dashboard Sheets and Blocks', label='D4a New project sheet'))
new_project = link(new_project, ('Start from a starter', 'starter-chooser.html'), ('Blank canvas', 'editor.html'),
                                ('Create project', 'editor.html'), ('Connect a site', 'sites.html'),
                                ('New pack', 'style-pack-edit.html'))
new_project = attr(new_project, '>Cancel<', 'data-close')
# D4c · the Over-Limit Sheet — a Pro account that became Free (J3's climax); D4d · which project stays editable.
# No drawn control on the dashboard fires it (grace expiry does), so the bar raises it.
over_limit = modal(region('D4 Dashboard Sheets and Blocks', label='D4c Over limit sheet'))
over_limit = trigger(over_limit, 'Choose which one stays editable', 'which-project')
over_limit = link(over_limit, ('Disconnect one', 'sites-free.html'), ('Delete some files', 'assets.html'),
                              ('Go Pro — $15/mo', 'upgrade.html'))
over_limit = attr(over_limit, 'Sort it out myself', 'data-close')
which = widen(white(region('D4 Dashboard Sheets and Blocks', label='D4d Which project editable')), 648)
which = link(which, ('Keep this one editable', 'dashboard-free.html'))


def dashboard(me='dashboard'):
    """S3a, wired — the same on the Projects page and under B24's past-due banner."""
    dash = unbox(region('S3 Dashboard', label='S3a Dashboard rich'))
    dash = app_links(dash, me)
    dash = trigger(dash, 'New project', 'new-project')                                   # D4a
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
    notice = link(notice, ('Review and redeploy', 'deploy-again.html'))
    overlays = (sheet('notifs', notifs) + '<div id="card-menu" class="overlay menu-lifted">' + card_menu + '</div>'
                + sheet('library-notice', notice) + sheet('new-project', new_project)
                + sheet('over-limit', over_limit) + sheet('which-project', which))
    return dash, overlays


dash, dash_overlays = dashboard()
dash_m = unbox(region('S3 Dashboard', label='S3 mobile'))                              # R2-responsive-mobile-viewport-1 · R-76
dash_m = link(dash_m, ('+ New project', 'starter-chooser.html'), ('Orbit Weekly', 'editor.html'), ('The Slow Web', 'editor-locked.html'))
page('dashboard', 'Projects', fill(dash, mobile=dash_m) + dash_overlays
     + bar(('Empty state', 'dashboard-empty.html'), ('On Free', 'dashboard-free.html'),
           ('Library update notice (F4)', 'open:library-notice'), ('Over the Free limits (J3)', 'open:over-limit'),
           ('Past due (B24)', 'dashboard-past-due.html')))

# B24 · the past-due grace banner, corrected by A7 item 5, over the dashboard the way B5a's bar sits over the editor
grace = region('B Missing Surfaces', caption='B24 ·')
grace = link(grace, ('Update card', 'billing.html'), ('See the invoice', 'billing.html'))
dash_pd, dash_pd_overlays = dashboard('dashboard-past-due')
page('dashboard-past-due', 'Projects', f'<div class="stage"><div class="lockbar">{grace}</div>{dash_pd}</div>' + dash_pd_overlays
     + bar(('← Projects', 'dashboard.html'), ('Library update notice (F4)', 'open:library-notice'),
           ('Over the Free limits (J3)', 'open:over-limit')))

dfree = unbox(region('S3 Dashboard', label='S3c Dashboard free plan'))
dfree = app_links(dfree, 'dashboard-free', sites='sites-free.html')
dfree = link(dfree, ('Go Pro — $15/mo', 'upgrade.html'))
# D4b · F-012 · EXPERIENCE.md J3 row 1: a second project on Free opens the New Project Sheet at the cap — every door drawn, greyed with its reason
dfree = trigger(dfree, 'New project', 'new-project-free')
at_cap = widen(white(region('D4 Dashboard Sheets and Blocks', label='D4b Free at the cap')), 648)
at_cap = link(at_cap, ('Go Pro — $15/mo', 'upgrade.html'))
at_cap = attr(at_cap, '>Cancel<', 'data-close')
dfree = link(dfree, ('Field Notes', 'editor-free.html'))
# F-043: S3c draws the card ⋯ menu OPEN; it becomes the overlay the ⋯ raises
dfree = menu_above(dfree, 'Rename', 'card-menu-free')
dfree = trigger(dfree, '⋯', 'card-menu-free')
dfree = acct_menu(dfree, 'margin-top:auto;display:flex')
page('dashboard-free', 'Projects', fill(dfree) + sheet('new-project-free', at_cap)
     + bar(('A read-only project (J3)', 'editor-readonly.html'), ('History on Free', 'deploy-history-free.html')))

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
# B15 · the Preview-only chip raises the preview-only notice (corrected here: FR-C2 names Publisher, not Creator — PRD copy, decision 6)
sites = trigger(sites, 'Preview-only', 'preview-only')
# F-008 (decision 6) · F5 / FR-J12: Starter's customThemes limit forbids custom themes in Ghost Admin too;
# the zip downloads on every plan and installs on self-hosted Ghost or a Ghost(Pro) plan that allows custom themes.
# A7 did not list this sentence and the 2026-09-04 frame still carries it — verified by grep — so the patch stays.
sites = patch(sites, ('Starter plans can\'t take API uploads — download the theme and upload it in Ghost Admin.',
                      'Ghost(Pro) Starter doesn\'t allow custom themes. Your theme still downloads — install it on '
                      'self-hosted Ghost, or on a Ghost(Pro) plan that allows custom themes.'))
connect = card(region('S11 Sites', caption='S11b ·'))
connect = attr(connect, 'Cancel', 'data-close') if '>Cancel<' in connect else connect
pon = region('B Missing Surfaces', caption='B15 ·')
pon = patch(pon, ('Ghost(Pro) Creator or above', 'Ghost(Pro) Publisher or higher'))      # FR-C2 · EXPERIENCE.md § wrong mechanism, B15
pon = attr(pon, 'Re-check plan', 'data-close')
page('sites', 'Sites', fill(sites) + sheet('connect-site', connect) + sheet('preview-only', pon)
     + bar(('Ship to a preview-only site (F5)', 'deploy-preview-only.html')))

# F-013: S11c is Sites on Free — one site and the upgrade ghost slot — reached from the Free dashboard's rail.
# Its plan line is Appendix F.1's since A7 item 20 (2026-09-04); the F-007 patch is gone and check() guards the figure.
sfree = region('S11 Sites', caption='S11c ·')
sfree = link(sfree, ('Go Pro — $15/mo', 'upgrade.html'))
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
# D8d · the drop zone with its keyboard path — "Choose files" — replaces S10b's, which had none (A8 FRAME 4).
# The zone panel is lifted without the rail skeleton beside it and keeps its drawn size.
dropzone = frames._with(child(region('D8 Editor Below 1440', label='D8d Drop zone'), 1), 0, style='width:692px;height:392px')
details = card(region('S10 Assets', label='S10d Image details'))
# F-027: S10c's delete-in-use confirm is raised by the details panel's own Delete
details = trigger(details, 'Delete', 'delete-asset') if 'Delete' in details else details
delete_asset = card(region('S10 Assets', caption='S10c ·'))
delete_asset = attr(delete_asset, 'Cancel', 'data-close') if '>Cancel<' in delete_asset else delete_asset
assets += sheet('dropzone', dropzone) + sheet('asset-details', details) + sheet('delete-asset', delete_asset, 'data-destructive')
page('assets', 'Assets', fill(assets))

# S12a's figures are Appendix F.1's since A7 item 20; the three F-007 patches are gone, check() guards the strings.
bill = unbox(region('S12 Billing', caption='S12a ·'))
bill = trigger(bill, 'View invoices', 'invoices')
bill = trigger(bill, 'Delete account', 'delete-acct', nth=1)   # the button, not the heading
# F-030: PRD Appendix F.2 — cancelling stops auto-renew at period end, in ≤3 clicks, with no retention sheet.
# Nothing is drawn for it, so Cancel plan is deliberately a no-op here (listed in NOT_YET), never the upsell.
invoices = card(region('S12 Billing', caption='S12d ·'))
delete_acct = card(region('S12 Billing', caption='S12c ·'))
# F-030: the typed confirm is enforced — the drawn field must read exactly the phrase before Delete account is live
delete_acct = attr(delete_acct, 'value="delete my acc"', 'data-typed="delete my account" data-typed-target="#delete-go"')
delete_acct = attr(delete_acct, '>Delete account<', 'id="delete-go"')
delete_acct = attr(delete_acct, '>Cancel<', 'data-close')
page('billing', 'Account & billing', fill(bill) + sheet('invoices', invoices) + sheet('delete-acct', delete_acct, 'data-destructive')
     + bar(('← Projects', 'dashboard.html')))


def upgrade_sheet():
    """S12b, the Upgrade Sheet, used app-wide. F-045 · EXPERIENCE.md J3 step 5b: yearly pre-selected,
    monthly one click away (the frame's Monthly default is not in A7 and stays swapped here).
    Its figures are Appendix F.1's since A7 item 20; the F-007 patches are gone."""
    up = card(region('S12 Billing', caption='S12b ·'))
    return group(up, 'interval', 'Monthly', 'Yearly', want='Yearly')


up = wire(upgrade_sheet(), ('Go Pro — $15/mo', 'dashboard.html'))
page('upgrade', 'Go Pro', fill(up, centre=True) + bar(('← Back', 'dashboard-free.html')))

sugg = unbox(region('S13 Suggestions', label='S13a Suggestions'))
sugg = trigger(sugg, 'Suggest something', 'suggest')
sugg = group(sugg, 'tab', 'Top', 'New', 'Planned', 'Building', 'Shipped')
suggest = card(region('S13 Suggestions', caption='S13b ·'))
suggest = attr(suggest, 'Cancel', 'data-close') if '>Cancel<' in suggest else suggest
page('suggestions', 'Suggestions', fill(sugg) + sheet('suggest', suggest) + bar(('← Projects', 'dashboard.html')))


# ═════════════════════════════════════════════════════════════════════════════
# THE EDITOR — S4, S5, S6, S7, S9, S14, C, D5, D8, D4e/f, D6
# ═════════════════════════════════════════════════════════════════════════════
EDITOR_KEYS = 'p:preview-mode.html'      # FR-D11's page-level keys, read by app.js under the typing() guard (F-022)

# D5b · the Template Switcher, complete — Home · Post · Page · Tag · Author · Membership (Signup / Signin /
# Member home) · 404 · Private · the Routes Manager's templates · New template. It replaces S4a's partial
# menu in the same slot and is raised by the Template chip on every editor shell. Every row with a
# drawn canvas goes to it; the rest are listed in NOT_YET, derived from this menu.
_SWITCHER = child(region('D5 Canvas Markers and Template Switcher', label='D5b Template switcher'), 1)
SWITCH_TO = {'Home': 'editor.html', 'Post': 'post-content.html', 'Tag': 'editor-tag.html',
             'Author': 'editor-author.html', 'New template': 'routes-manager.html'}
SWITCHER_ROWS = [html.unescape(t) for t in re.findall(r'<span[^>]*>([^<]+)</span>', _SWITCHER)
                 if t not in ('Auto-generated', 'FROM THE ROUTES MANAGER') and not t.startswith('custom-')]
S4A_SLOT = 'position:absolute;left:calc(50% - 142px);top:44px;z-index:20'   # S4a's own menu slot, centred for D5b's width


def switcher(mid, current, home='editor.html'):
    m = frames._with(_SWITCHER, 0, id=mid, class_='overlay menu-lifted', style=S4A_SLOT)
    rows = kids(m)
    # the drawn check sits on Tag; the current template takes it by swapping the two rows' drawn styles (F-045)
    sel = [(a, b) for a, b in rows if 'background:#FFEDE8' in m[a:m.index('>', a)]]
    cur = [(a, b) for a, b in rows if '>%s<' % current in m[a:b]]
    if sel and cur and sel[0] != cur[0]:
        (sa, sb), (ca, cb) = sel[0], cur[0]
        s_sel = re.search(r'style="([^"]*)"', m[sa:m.index('>', sa)]).group(1)
        s_cur = re.search(r'style="([^"]*)"', m[ca:m.index('>', ca)]).group(1)
        m = patch(m, ('style="%s"' % s_sel, 'style="\x00"'), ('style="%s"' % s_cur, 'style="%s"' % s_sel), ('style="\x00"', 'style="%s"' % s_cur))
    for row, href in SWITCH_TO.items():
        if row != current:
            m = link(m, ('>%s<' % row, home if row == 'Home' else href))
    return m


def add_switcher(h, mid, current, home='editor.html'):
    """Put the complete switcher after the top bar's chip cluster (S4a's slot) and make Template raise it."""
    a, _b = frames._elem(h, '>Template<')
    chip = frames._enclosing(h, a - 1)
    ca, cb = frames._enclosing(h, chip[0] - 1)
    h = h[:cb] + switcher(mid, current, home) + h[cb:]
    return trigger(h, '>Template<', mid)


def editor_frame(h, ship='deploy.html', home='dashboard.html', readonly=False, theme='theme-settings.html', mid='template-menu'):
    """S4a's chrome, wired the same on every page that lifts it. `readonly` (B5a, reading along)
    keeps the menus and the way back and wires nothing that edits or ships."""
    # S4a documents its (partial) template dropdown OPEN. The product's menu is D5b's complete switcher,
    # in the same slot, raised by the Template chip — so the drawn partial menu is replaced by it.
    _m = re.search(r'<div style="position:absolute;left:calc\(50% - 115px\);top:44px[^"]*"', h)
    if _m:
        h = h[:_m.start()] + switcher(mid, 'Home') + h[frames._end(h, _m.start()):]
        h = trigger(h, '>Template<', mid)
    h = link(h, ('Orbit Weekly', home))                    # the top-bar name is the way back (IA: Dashboard ← logo)
    h = canvas_id(h)                                       # D8c: where the skip link lands
    h = layers_focus(h)                                    # D8e: the rows take focus, ↑ ↓ move it
    h = layers_panel(h, '>Header<')                        # F-032: L hides it
    if readonly:
        return h
    h = link(h, ('Ship it', ship))
    h = link(h, ('+ Add section', 'section-picker.html'))
    h = wire(h, ('Change', 'style-packs.html'))
    if '>Count<' in h:
        # EXPERIENCE.md § wrong mechanism, B17: every surface that mentions posts per page links to Theme Settings
        h = link(h, ('>Count<', theme))
    if '>View as<' in h:
        h = trigger(h, '>View as<', 'viewas')
    return h


def viewas_sheet():
    """F-009: the member-state popover alone (S4d's second child), not the whole documentation region.
    Since A7 item 18 it draws FR-D16's three states, the unviewed marker and the gated-content indicator."""
    return sheet('viewas', kid_with(part('S4 Editor', 1, caption='S4d ·'), 'Preview as'))


# D8a · the overflow menu the narrower top bar folds its extras into; drawn open on its own, lifted as the menu alone
_OVERFLOW = child(region('D8 Editor Below 1440', label='D8a Overflow menu'), 1)


def narrow(label, w, top):
    """D8a / D8b: the resting editor at 834 (tablet, touch) and at 720 (a desktop at 200% zoom) — the same
    four parts rearranged: icon rail, canvas, the Controls sidebar as an overlay panel, drawn open.
    Everything that fits stays; the ⋯ raises the one overflow menu; Template raises the switcher."""
    h = unbox_at(region('D8 Editor Below 1440', label=label), w)
    h = link_at(h, 'aria-label="Back to dashboard"', 'dashboard.html')
    h = link(h, ('Ship it', 'deploy.html'), ('Try a design', 'variant-shuffle.html'))
    h = group(h, 'padding-%d' % w, 'Compact', 'Comfortable', 'Spacious')
    h = trigger(h, '⋯', 'overflow-%d' % w)
    a, b = elem_at(h, 'data-open="overflow-%d"' % w)
    menu = frames._with(_OVERFLOW, 0, id='overflow-%d' % w, class_='overlay menu-lifted',
                        style='position:absolute;right:12px;top:%dpx;width:248px;z-index:20' % top)
    h = h[:b] + menu + h[b:]
    return add_switcher(h, 'switcher-%d' % w, 'Home')


ed = editor_frame(unbox(region('S4 Editor', label='S4a Editor rest')))
page('editor', 'Orbit Weekly · Home', fill(ed, tablet=narrow('D8a Editor at 834', 834, 56), zoom=narrow('D8b Editor at 720', 720, 48))
     + viewas_sheet() + bar(('Hover the hero →', 'editor-hover.html'), ('On a phone (R-76)', 'small-screen.html')),
     attrs='data-editor-shell data-keys="%s"' % EDITOR_KEYS)

# F-012: the same editor on Free — Ship it opens the Pro Exit Sheet (B13a) instead of the wizard; its Theme Settings are D6b's
edf = editor_frame(unbox(region('S4 Editor', label='S4a Editor rest')), ship='pro-exit.html', home='dashboard-free.html', theme='theme-settings-free.html')
page('editor-free', 'Orbit Weekly · Home', fill(edf) + viewas_sheet(),
     attrs='data-editor-shell data-keys="%s"' % EDITOR_KEYS)

# F-013 / F2: the editor with someone else holding the lock — S4a under B5a's read-only bar, B5b's request
# popover and B5c's takeover modal. Read-along: nothing on the canvas is wired, only the way back —
# except Ship it, which raises D8g, the fourth lock state (A8 FRAME 7): take over to ship, focus on Wait.
lock = editor_frame(unbox(region('S4 Editor', label='S4a Editor rest')), readonly=True)
lock = trigger(lock, 'Ship it', 'ship-readonly')
lockbar = kid_with(region('B Missing Surfaces', caption='B5a ·'), 'Request editing')
lockbar = trigger(lockbar, 'Request editing', 'lock-request')
request = region('B Missing Surfaces', caption='B5b ·')
request = link(request, ('Hand over', 'editor.html'))
request = attr(request, 'Keep editing', 'data-close')
takeover = region('B Missing Surfaces', caption='B5c ·')
takeover = link(takeover, ('Take over anyway', 'editor.html'))
takeover = attr(takeover, '>Wait<', 'data-close')
ship_ro = kids(region('D8 Editor Below 1440', label='D8g Ship from read-only'))[-1]   # the confirm, not the dimmed editor behind it
ship_ro = region('D8 Editor Below 1440', label='D8g Ship from read-only')[slice(*ship_ro)]
ship_ro = link(ship_ro, ('Take over and ship', 'deploy.html'))
ship_ro = attr(ship_ro, '>Wait<', 'data-close')
page('editor-locked', 'Orbit Weekly · Home (read-only)',
     f'<div class="stage"><div class="lockbar">{lockbar}</div>{lock}</div>'
     + sheet('lock-request', request) + sheet('lock-takeover', takeover, 'data-destructive') + sheet('ship-readonly', ship_ro, 'data-destructive')
     + bar(('← Projects', 'dashboard.html'), ('Takeover after 4 minutes (F2)', 'open:lock-takeover')),
     attrs='data-editor-shell')

hov = unbox(region('S4 Editor', label='S4b Editor hover'))
hov = canvas_id(wire(hov, ('Ship it', 'deploy.html'), ('+ Add section', 'section-picker.html')))
page('editor-hover', 'Orbit Weekly · Home', fill(hov)
     + bar(('← Rest', 'editor.html'), ('Select it →', 'editor-selected.html')),
     attrs='data-editor-shell data-keys="%s"' % EDITOR_KEYS)

# F-031: Preview Mode is B3b's drawn state, full card, centred; Esc and "Back to editing" return.
pv = region('B Missing Surfaces', caption='B3b ·')
pv = wire(pv, ('Back to editing', 'editor.html'))
page('preview-mode', 'Preview', fill(pv, centre=True) + bar(('Esc — back to editing', 'editor.html'), ('Device preview (B11)', 'device-preview.html')),
     attrs='data-esc="editor.html"')
# B11a / B11b · Device Preview, corrected by A7 item 6 (no user zoom; the mono chip states size and scale) — lifted now.
# Desktop and Mobile are drawn; Tablet has no frame and stays unwired. B11b's notes card is documentation (F-039) and comes off.
dev = region('B Missing Surfaces', caption='B11a ·')
dev = link(dev, ('Mobile', 'device-preview-mobile.html'))
page('device-preview', 'Device preview', fill(dev, centre=True) + bar(('← Preview', 'preview-mode.html')))
devm = region('B Missing Surfaces', caption='B11b ·')
_n = frames._elem(devm, 'What changed with the width')[0]
_na, _nb = frames._enclosing(devm, _n - 1)
assert devm[_na:].startswith('<div style="width:246px'), devm[_na:_na + 60]
devm = devm[:_na] + devm[_nb:]
devm = link(devm, ('Desktop', 'device-preview.html'))
page('device-preview-mobile', 'Device preview · mobile', fill(devm, centre=True) + bar(('← Preview', 'preview-mode.html')))

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
sel = link(sel, ('Try a design', 'variant-shuffle.html'))          # A7 item 21: the unit is a design ("Try a variant" → "Try a design")
sel = wire(sel, ('Ship it', 'deploy.html'), ('+ Add section', 'section-picker.html'), ('Orbit Weekly', 'dashboard.html'))
sel = trigger(sel, '4 / 18', 'design-picker')
sel = trigger(sel, '>Design<', 'design-picker')
sel = canvas_id(sel)
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
vs = canvas_id(vs)
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
routes = wire(routes, ('Ship update', 'deploy-again.html'), ('Orbit Weekly', 'editor.html'))
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
page('editor-cards', 'Editor cards', fill(cards, centre=True) + sheet('reset-card', reset, 'data-destructive')
     + bar(('← Paywall', 'paywall-editor.html'), ('← Editor', 'editor.html')))

# D5e · the Preview Subject Picker, opened from B9's content-source pill: source, then which post this canvas renders
_PICKER = widen(child(region('D5 Canvas Markers and Template Switcher', label='D5e Preview subject picker'), 1), 464)


def subject_pill(h, mid):
    """The drawn 'Previewing with: …' pill raises the picker."""
    pa, _pb = frames._elem(h, 'Previewing with')
    return frames._with(h, pa, data_open=mid, tabindex='0', role='button', aria_haspopup='true', aria_expanded='false', style='cursor:pointer')


# F-039: the C frames are chapters — kicker, heading, prose, caption — around a 1440 screen; the screen is the product
post = unbox(screen(region('C Post Body', label='C2a Post content desktop')))
post = group(post, 'measure', 'Narrow', 'Comfortable', 'Wide')
post = group(post, 'device', 'Desktop', 'Tablet', 'Mobile')
post = wire(post, ('Ship update', 'deploy-again.html'), ('Preview', 'preview-mode.html'),
                  ('Style-guide article', 'style-guide.html'), ('Orbit Weekly', 'editor.html'))
post = subject_pill(post, 'subject')
subject_post = link(_PICKER, ('Style-guide article', 'style-guide.html'))
subject_post = group(subject_post, 'source', 'Orbit Weekly', 'Sample content')
page('post-content', 'Post template', fill(post) + sheet('subject', subject_post) + bar(('← Editor', 'editor.html')))
pay = unbox(screen(region('C Post Body', label='C3a Paywall editor')))
pay = group(pay, 'treat', 'None', 'Fade', 'Blur')
pay = group(pay, 'tiers', 'All paid', 'Cheapest', 'One I pick')
pay = group(pay, 'surface', 'Page', 'Tinted', 'Inverted')
pay = group(pay, 'member', 'Anonymous', 'Free member', 'Paid member')
pay = wire(pay, ('Back to post', 'post-content.html'), ('Ship update', 'deploy-again.html'),
                ('>Cards<', 'editor-cards.html'), ('Orbit Weekly', 'editor.html'))   # C3a draws the Template-surfaces nav
page('paywall-editor', 'Paywall', fill(pay) + bar(('← Editor', 'editor.html')))
sg = unbox(screen(region('C Post Body', label='C4 Style-guide fixture')))
sg = subject_pill(sg, 'subject') if 'Previewing with' in sg else sg
subject_guide = _PICKER
for _t in ('The tide tables nobody reads', 'A short note on cold water', 'Harbour lights, five ways', 'What the pilot boat knows'):
    subject_guide = link(subject_guide, (_t, 'post-content.html'))
subject_guide = group(subject_guide, 'source', 'Orbit Weekly', 'Sample content')
page('style-guide', 'Style-guide article', fill(sg) + sheet('subject', subject_guide) + bar(('← Post template', 'post-content.html')))

# D6a · Theme Settings, completed (A6): posts_per_page first, the logo read-only, the project's dark mode,
# Credits, the 3 OF 17 meter, the builder with group and visibility; D6c · the text-prop promote confirm
theme = unbox(region('D6 Theme Settings Completed', label='D6a Theme settings Pro'))
theme = group(theme, 'settings-nav', 'Site basics', 'Navigation', 'Social accounts', 'Translations', 'Code injection')
theme = group(theme, 'mode', 'Light only', 'Light + Dark')
theme = trigger(theme, '>Promote<', 'promote-text')
# F-034: no self-links — Translations (B18) has no page here (FR-Q6 re-specifies it and A7 did not draw it); Clear has no drawn result
theme = wire(theme, ('Ship update', 'deploy-again.html'), ('Preview', 'preview-mode.html'), ('Orbit Weekly', 'editor.html'))
promote = widen(white(region('D6 Theme Settings Completed', label='D6c Text prop confirm')), 464)
promote = attr(promote, '>Cancel<', 'data-close')
promote = attr(promote, 'Promote it', 'data-close')
page('theme-settings', 'Theme settings', fill(theme) + sheet('promote-text', promote)
     + bar(('← Editor', 'editor.html'), ('On Free', 'theme-settings-free.html')))
# D6b · Theme Settings on Free — A6 drew the two rows that differ (credits greyed with its reason; a light-only project), as details
_d6b = region('D6 Theme Settings Completed', label='D6b Theme settings Free')
tfree = ''.join(widen(white(child(_d6b, n)), 648) for n in range(2))
tfree = link(tfree, ('Go Pro — $15/mo', 'upgrade.html'))
tfree = group(tfree, 'mode', 'Light only', 'Light + Dark')
page('theme-settings-free', 'Theme settings', fill(tfree, centre=True) + bar(('← Editor', 'editor-free.html'), ('On Pro', 'theme-settings.html')))

# D5a · an untouched Tag canvas with its Auto-generated marker (top bar chip and Layers row, the same sentence twice)
tag = unbox(region('D5 Canvas Markers and Template Switcher', label='D5a Auto-generated marker'))
tag = add_switcher(tag, 'switcher-tag', 'Tag')
tag = link(tag, ('Ship it', 'deploy.html'), ('Orbit Weekly', 'dashboard.html'))
tag = group(tag, 'align', 'Left', 'Centre')
tag = layers_panel(canvas_id(tag), 'LAYERS · TAG')
page('editor-tag', 'Orbit Weekly · Tag', fill(tag) + bar(('← Home', 'editor.html')),
     attrs='data-editor-shell data-keys="%s"' % EDITOR_KEYS)

# D5c · an Author archive with two feeds: the MAIN FEED marker, the greyed Count with its reason and a link to Theme
# Settings, Pagination only on the main feed, and the second feed's ⋯ menu (drawn open) with "Make this the main feed".
# D5f · removing the last section of a designed custom template fires the Empty Template Warning — "Remove section"
# is the one drawn control that removes a section, so it raises the confirm here.
author = unbox(region('D5 Canvas Markers and Template Switcher', label='D5c Main feed marker'))
author = add_switcher(author, 'switcher-author', 'Author')
author = link(author, ('Ship it', 'deploy.html'), ('Orbit Weekly', 'dashboard.html'),
                      ('Theme settings ↗', 'theme-settings.html'), ('Open', 'editor-author-page2.html'))
author = group(author, 'arrangement', 'Rows', 'Grid')
author = group(author, 'pagination', 'None', 'Older/Newer', 'Numbers')
# D5c's rows wrap their label in a span, so the menu is two levels above the label, not one (menu_above's S3c shape)
_lbl = frames._elem(author, 'Make this the main feed')[0]
_row = frames._enclosing(author, _lbl - 1)
_menu = frames._enclosing(author, _row[0] - 1)[0]
assert author[_menu:].startswith('<div style="position:absolute;top:156px;left:26px'), author[_menu:_menu + 80]
author = frames._with(author, _menu, id='section-menu', class_='overlay menu-lifted')
author = trigger(author, '⋯', 'section-menu')
author = trigger(author, 'Remove section', 'empty-template')
author = layers_panel(canvas_id(author), 'LAYERS · AUTHOR')
empty_t = widen(white(region('D5 Canvas Markers and Template Switcher', label='D5f Empty template warning')), 548)
empty_t = attr(empty_t, 'Keep it', 'data-close')
empty_t = link(empty_t, ('Remove it', 'editor.html'))
page('editor-author', 'Orbit Weekly · Author', fill(author) + sheet('empty-template', empty_t) + bar(('← Home', 'editor.html')),
     attrs='data-editor-shell data-keys="%s"' % EDITOR_KEYS)

# D5d · the same archive previewed on page 2, reached from the Pagination control; "Back to page 1" returns
page2 = unbox(region('D5 Canvas Markers and Template Switcher', label='D5d Page 2 preview'))
page2 = add_switcher(page2, 'switcher-author-2', 'Author')
page2 = link(page2, ('Ship it', 'deploy.html'), ('Orbit Weekly', 'dashboard.html'), ('Back to page 1', 'editor-author.html'))
page2 = group(page2, 'pagination', 'None', 'Older/Newer', 'Numbers')
page2 = layers_panel(canvas_id(page2), 'LAYERS · AUTHOR')
page('editor-author-page2', 'Orbit Weekly · Author · page 2', fill(page2) + bar(('← Page 1', 'editor-author.html')),
     attrs='data-editor-shell data-keys="%s"' % EDITOR_KEYS)

# D4e · a read-only project (over the Free limit): canvas legible, sidebars at 55%, export live. Nothing edits.
ro = unbox(region('D4 Dashboard Sheets and Blocks', label='D4e Read-only project'))
ro = link(ro, ('Harbour Letter', 'dashboard-free.html'), ('Make this the editable one', 'editor.html'))
ro = layers_panel(canvas_id(ro), 'LAYERS · HOME')
page('editor-readonly', 'Harbour Letter · Home (read-only)', fill(ro) + bar(('← Projects', 'dashboard-free.html')),
     attrs='data-editor-shell')

# D4f · Small Screen Notice — what a phone gets instead of the editor (R-76: a coarse pointer below 1024,
# never width alone — app.js decides on every editor shell). What works from here is wired.
small = region('D4 Dashboard Sheets and Blocks', label='D4f Small screen notice')
small = link(small, ('Deploy history', 'deploy-history.html'), ('Roll back to v4', 'deploy-history.html'),
                    ('Your sites', 'sites.html'), ('Billing', 'billing.html'), ('Orbit Weekly', 'dashboard.html'))
page('small-screen', 'Orbit Weekly', fill(small, centre=True, extra='phone') + bar(('← Projects', 'dashboard.html')))


# ═════════════════════════════════════════════════════════════════════════════
# SHIPPING — S8, D1, D2, D3, B12, B14, B16, B19
# ═════════════════════════════════════════════════════════════════════════════
def step(n, inner, title, first=False):
    # F-054: the step carries its own title for the live region and takes focus on entry
    return (f'<div data-step="{n}" data-step-title="{title}" tabindex="-1"{"" if first else " hidden"}>'
            + inner + '</div>')


def endings(n_failed, n_partial, n_only):
    """The three endings that are not Live: S8d′ (failed), D2e (uploaded, activation failed) and D2f
    (Deploy only — the other ending, reached on purpose). D2e and D2f are one card with two causes."""
    failed = card(region('S8 Deploy', caption='S8d′ ·'))
    failed = link(failed, ('Reconnect site', 'manage-keys.html'))
    out = step(n_failed, fill(failed, centre=True), 'Deploy failed')
    for n, label, title in ((n_partial, 'D2e Activation failed', 'Uploaded, not live — activation failed'),
                            (n_only, 'D2f Deploy only ending', 'Uploaded, not live — deploy only')):
        h = unbox(region('D2 Deploy History Completed', label=label))
        h = attr(h, 'Re-activate v5', 'data-goto="%d"' % LIVE)
        h = link(h, ('Leave it for now', 'deploy-history.html'))
        out += step(n, fill(h), title)
    return out


def shipping(n_ship, n_live, host):
    """S8c and S8d — shipping that takes long enough to read (F-033), then Live."""
    d3 = card(region('S8 Deploy', caption='S8c ·'))
    # F-033: the two drawn stages announce and dwell; the Cancel is drawn disabled since A7 item 13 (FR-J8)
    d3 = attr(d3, 'Uploading to Ghost', 'data-progress-step="Uploading to Ghost"')
    d3 = attr(d3, 'Activating v5', 'data-progress-step="Activating v5"')
    d4 = card(region('S8 Deploy', caption='S8d ·'))
    d4 = link(d4, ('Done', 'editor.html'), ('View site', 'editor.html'))
    return (step(n_ship, '<div id="%s">' % host + fill(d3, centre=True) + '</div>', 'Step %d, shipping' % n_ship)
            + step(n_live, fill(d4, centre=True), 'Step %d, live' % n_live))


# ── the first deploy to a site: six steps (D1, prompt A1) ────────────────────────────────────────
LIVE = 6
D1 = 'D1 First-Deploy Gates'


def first(label):
    """A D1 frame, whole: the skeleton chrome, the scrim and the step card, as S8a is drawn. The
    <sc-if> around the chrome is Claude Design's runtime, not a drawn element, so it comes off."""
    return unbox(unwrap(region(D1, label=label), 'sc-if'))


_d1dp = white(region(D1, label='D1d-prime Shortcut ticked'))
_ready = re.search(r'<span style="(width:18px;height:18px;[^"]*cursor:pointer)"', _d1dp[_d1dp.index('I confirm I have') - 400:]).group(1)
_some = re.sub(r'^\d+', '{n}', re.search(r'>(\d+ rows still to tick[^<]*)<', region(D1, label='D1d Backup gate self-hosted')).group(1))
_none = re.search(r'>(One confirmation left\.)<', _d1dp).group(1)
_ticked_box = _boxes(region(D1, label='D1d Backup gate self-hosted'))[0]


def gate(h, group_name, btn_id, back, container_style, on=None, inside="Ghost's help"):
    """A backup gate (D1d, D1e, D1d′): its rows tick, its counter counts, its confirm waits for the
    rows, and Run checks wakes only then — the reading order A1 specified, as behaviour."""
    h = ticks(h, container_style, group_name, on=on, inside=inside)
    h = confirm_row(h, 'I confirm I have', group_name, 'Run checks', btn_id, _ready, S8A_PRIMARY)
    h = attr(h, '>Run checks<', 'data-goto="4"')
    h = attr(h, '>Back<', 'data-goto="%d"' % back)
    counter = 'rows still to tick' if 'rows still to tick' in h else 'One confirmation left.'
    return attr(h, counter, 'data-remaining="%s" data-some="%s" data-none="%s"' % (group_name, _some, _none))


# D1a · Destination, first deploy: S8a plus the theme that will be created and its permanent name (FR-J10)
d1a = first('D1a Destination first deploy')
d1a = rows_pick(d1a, 'dest', 'Deploy &amp; activate', 'Deploy only', ending=('Deploy only', 12))   # D2f: Deploy only never lands on Live
d1a = attr(d1a, '>Next<', 'data-goto="2"')
# D1b · Safety net, the offer: the Staff Access Token. Two plain buttons of the same weight; either is remembered for the run
d1b = first('D1b Safety net offer')
d1b = attr(d1b, 'Add the token', 'data-goto="3" data-accepts')
d1b = attr(d1b, 'Not now', 'data-goto="7" data-declines')
d1b = attr(d1b, '>Back<', 'data-goto="1"')
# D1c · Safety net, declined: three costs, acknowledged once, never raised again
d1c = first('D1c Safety net declined')
d1c = attr(d1c, 'Continue', 'data-goto="8"')
d1c = link(d1c, ('Manage keys', 'manage-keys.html'))
# D1d · Backup gate, self-hosted, token given — Download on the Theme and routes.yaml rows (FR-J13, decision 5).
# The ghost backup shortcut is D1d′, the drawn ticked state; ticking it there again comes back here.
d1d = first('D1d Backup gate self-hosted')
d1d = gate(d1d, 'gate-self', 'run-self', 2, 'style="display:flex;flex-direction:column;gap:9px"')
d1d = attr(d1d, 'I have run ghost backup', 'data-goto="9" role="button" tabindex="0"')
# D1d′ · the shortcut ticked — every row still on screen, ticked, and one confirmation left
d1dp = widen(_d1dp, 868)
d1dp = gate(d1dp, 'gate-ticked', 'run-ticked', 2, 'style="display:flex;flex-direction:column;gap:8px"', inside='in the archive')
d1dp = attr(d1dp, 'I have run ghost backup', 'data-goto="3" role="button" tabindex="0"')
# D1e · Backup gate, Ghost(Pro), token declined — the honest block instead of the shortcut, no download anywhere
d1e = widen(white(region(D1, label='D1e Backup gate Ghost Pro')), 868)
d1e = gate(d1e, 'gate-pro', 'run-pro', 7, 'style="display:flex;flex-direction:column;gap:9px"', on=_ticked_box)
# S8b · Check. Ship it runs through the snapshot gate — B12a with the token, B12b without it (A7 item 2: the
# 403 is structural; "Add the token", "Deploy without a snapshot", "Cancel") — and on the declined path B16,
# the routes fallback card, opens over Live (routes.yaml by hand, with a guided card).
d2 = card(region('S8 Deploy', caption='S8b ·'))
d2 = attr(d2, '>Ship it<', 'data-run="%d" data-goto-first="5" data-run-host="ship5" data-run-gate="snapshot" '
                           'data-run-gate-declined="snapshot-failed" data-run-after-declined="routes-fallback"' % LIVE)
d2 = attr(d2, '>Back<', 'data-goto="3"')
snap = region('B Missing Surfaces', caption='B12a ·')
snap = attr(snap, '>Cancel<', 'data-close')
snap_failed = region('B Missing Surfaces', caption='B12b ·')
snap_failed = link(snap_failed, ('Add the token', 'manage-keys.html'))
snap_failed = attr(snap_failed, 'Deploy without a snapshot', 'data-continue')
snap_failed = attr(snap_failed, '>Cancel<', 'data-goto="4"')
fallback = region('B Missing Surfaces', caption='B16 ·')
fallback = attr(fallback, 'Verify upload', 'data-close')
fallback = link(fallback, ('Add the token instead', 'manage-keys.html'))

page('deploy', 'Ship it', '<div data-wizard data-at="1">'
     + step(1, fill(d1a), 'Ship it — step 1 of 6, destination', first=True)
     + step(2, fill(d1b), 'Step 2 of 6, safety net')
     + step(3, fill(d1d), 'Step 3 of 6, backup gate')
     + step(4, fill(d2, centre=True), 'Step 4 of 6, pre-flight check')
     + shipping(5, LIVE, 'ship5')
     + step(7, fill(d1c), 'Step 2 of 6, safety net declined')
     + step(8, fill(d1e, centre=True), 'Step 3 of 6, backup gate on Ghost(Pro)')
     + step(9, fill(d1dp, centre=True), 'Step 3 of 6, backup gate — every row ticked')
     + endings(10, 11, 12)
     + '</div>'
     + sheet('snapshot', snap) + sheet('snapshot-failed', snap_failed, 'data-gate-manual') + sheet('routes-fallback', fallback)
     + bar(('← Editor', 'editor.html'), ('Later deploys — four steps', 'deploy-again.html'),
           ('Failure ending', 'goto:10'), ('Activation failed', 'goto:11'), ('History', 'deploy-history.html')))

# ── every deploy after the first: four steps, with the Drift Report inside pre-flight (D3, prompt A3) ──
LIVE = 4
a1 = unbox(region('S8 Deploy', label='S8a Ship step 1'))
a1 = rows_pick(a1, 'dest', 'Deploy &amp; activate', 'Deploy only', ending=('Deploy only', 9))       # D2f
# F-013 / F4: before the Check step, the Library Update Confirm (B14b) — Update and ship goes on, Not now stays
a1 = trigger(a1, '>Run checks<', 'library-update')
libup = region('B Missing Surfaces', caption='B14b ·')
libup = attr(libup, 'Update and ship', 'data-goto="2"')
libup = attr(libup, 'Not now', 'data-close')
RUN4 = 'data-run="4" data-goto-first="3" data-run-host="ship3"'
# D3c · no drift — one passing row in S8b's list, at the same weight as the others. A3 drew the row's group
# as a detail; it takes the place of S8b's own "Checking your theme" group, the one it re-draws.
a2 = card(region('S8 Deploy', caption='S8b ·'))
_c = frames._elem(a2, 'Checking your theme')[0]
_hr = frames._enclosing(a2, _c - 1)
_ga, _gb = frames._enclosing(a2, _hr[0] - 1)
_nodrift = white(region('D3 The Drift Report', label='D3c No drift'))
a2 = a2[:a2.index('>', _ga) + 1] + _nodrift[_nodrift.index('>') + 1:_nodrift.rindex('</')] + a2[a2.rindex('</', _ga, _gb):]
a2 = attr(a2, '>Ship it<', RUN4)
a2 = attr(a2, '>Back<', 'data-goto="1"')
# D3a · drift found — the deploy stops, the files named by the user's own layer names; overwriting is a choice
drift = unbox(region('D3 The Drift Report', label='D3a Drift found'))
drift = link(drift, ('Cancel', 'editor.html'))
drift = attr(drift, 'Overwrite and ship anyway', RUN4)
# D3b · couldn't verify — it proceeds; the row sits among the passing checks and stops nothing
unverified = widen(white(region('D3 The Drift Report', label='D3b Could not verify')), 648)
unverified = link(unverified, ('Add the token', 'manage-keys.html'))
unverified = attr(unverified, '>Back<', 'data-goto="1"')
unverified = attr(unverified, '>Ship it<', RUN4)
# B19 · the membership-page binding checklist (A7 item 1): one row per emitted template, a done-state the user ticks
binding = region('B Missing Surfaces', caption='B19 ·')
_r = frames._enclosing(binding, frames._elem(binding, 'custom-signin.hbs')[0] - 1)
binding = ticks(binding, None, 'binding', on=_ticked_box, span=frames._enclosing(binding, _r[0] - 1))
page('deploy-again', 'Ship it', '<div data-wizard data-at="1">'
     + step(1, fill(a1), 'Ship it — step 1 of 4, destination', first=True)
     + step(2, fill(a2, centre=True), 'Step 2 of 4, pre-flight check')
     + shipping(3, LIVE, 'ship3')
     + endings(5, 8, 9)
     + step(6, fill(drift), 'Step 2 of 4, pre-flight check — something changed on your site')
     + step(7, fill(unverified, centre=True), 'Step 2 of 4, pre-flight check — could not verify')
     + '</div>'
     + sheet('library-update', libup) + sheet('binding', binding)
     + bar(('← Editor', 'editor.html'), ('First deploy — six steps', 'deploy.html'), ('Drift found', 'goto:6'),
           ('Couldn\'t verify', 'goto:7'), ('Failure ending', 'goto:5'), ('Activation failed', 'goto:8'),
           ('Template binding checklist (B19)', 'open:binding'), ('History', 'deploy-history.html')))

po = card(region('S8 Deploy', caption='S8a′ ·'))
# F-008 (decision 6) · F5 / FR-J12: the manual Ghost Admin route does not exist on Starter either.
# A7 did not list this sentence and the 2026-09-04 frame still carries it — verified by grep — so the patch stays.
po = patch(po, ("Ghost(Pro)'s Starter plan doesn't accept custom themes over the API. Download your theme and "
                "upload it in Ghost Admin — or upgrade your Ghost plan to ship directly from here.",
                "Ghost(Pro)'s Starter plan doesn't allow custom themes. Your theme still downloads — install it on "
                "self-hosted Ghost or a Ghost(Pro) plan that allows custom themes — or upgrade your Ghost plan to ship from here."))
po = wire(po, ('Download theme', 'sites.html'), ('Which Ghost plans work? ↗', 'pricing.html'))
page('deploy-preview-only', 'Preview-only', fill(po, centre=True) + bar(('← Sites', 'sites.html')))

# D2 · Deploy History, completed (A2): S8e's drawer plus a pin on every row, the original-theme row outside the
# count, and the limit line on both plans. The roll-back confirm is S8e's, exactly as drawn.
_s8e = region('S8 Deploy', label='S8e History drawer')
_t = frames._elem(_s8e, 'Roll back to v4?')[0]
_m0 = frames._enclosing(_s8e, frames._enclosing(_s8e, _t - 1)[0] - 1)[0]   # title → its column → the modal
rollback = _s8e[_m0:frames._end(_s8e, _m0)]
rollback = attr(rollback, '>Cancel<', 'data-close')
rollback = attr(rollback, '>Roll back<', 'data-close')                       # the drawer after a rollback is not drawn
refusal = region('D2 Deploy History Completed', label='D2b Pin refusal')
refusal = refusal[slice(*elem_at(refusal, 'top:100%'))]                       # the popover alone, off the two rows it was drawn on
refusal = frames._with(refusal, 0, id='pin-refusal', class_='overlay menu-lifted')
refusal = attr(refusal, 'Got it', 'data-close')


def history(label, project, home, ship):
    h = unbox(region('D2 Deploy History Completed', label=label))
    h = link(h, (project, home), ('Ship it', ship))
    # D2b · the pin on the last unpinned row refuses, visibly, with the reason — the popover hangs under that row
    v1 = h.index('>v1<')
    pa, _pb = elem_at(h, 'title="Pin this version"', v1)
    h = frames._with(h, pa, data_open='pin-refusal', role='button', tabindex='0', aria_haspopup='true', aria_expanded='false')
    ra, rb = frames._enclosing(h, h.rindex('<', 0, v1) - 1)                # up from the v1 chip to its bordered row
    while 'border:1px solid #E7E2DB;border-radius:12px' not in h[ra:h.index('>', ra)]:   # D2c nests the chip in a header line
        ra, rb = frames._enclosing(h, ra - 1)
    close = h.rindex('</', ra, rb)
    h = h[:close] + refusal + h[close:]
    h = frames._with(h, ra, style='position:relative')
    la, _lb = elem_at(h, 'gap:9px;overflow:hidden')
    h = frames._with(h, la, style='overflow:visible')                        # the drawn list clips; the popover must show (F-036 merge)
    # every other pin swaps between its two drawn states
    h = twins(h, 'title="Pin this version"', 'title="Pinned — unpin"', 'pin')
    h = trigger(h, 'Roll back', 'rollback', nth=0)
    h = trigger(h, 'Roll back', 'rollback', nth=1)
    return h


partial = white(region('D2 Deploy History Completed', label='D2d Partial success row'))
partial = link(partial, ('Re-activate', 'deploy-again.html'))
hist = history('D2a History pinning Pro', 'Orbit Weekly', 'editor.html', 'deploy-again.html')
page('deploy-history', 'History', fill(hist) + sheet('rollback', rollback, 'data-destructive') + sheet('partial-row', partial)
     + bar(('← Editor', 'editor.html'), ('Partial success row (D2d)', 'open:partial-row'), ('On Free', 'deploy-history-free.html')))
# D2c · the same drawer on Free — three versions, one pinned, the limit line shown, no upsell
histf = history('D2c History Free plan', 'Field Notes', 'editor-free.html', 'pro-exit.html')
page('deploy-history-free', 'History', fill(histf) + sheet('rollback', rollback, 'data-destructive')
     + bar(('← Editor', 'editor-free.html'), ('On Pro', 'deploy-history.html')))

# F-012: the Pro Exit Sheet over the dimmed editor, exactly as B13a draws it — reached from a Free editor's Ship it.
# Since A7 item 4 it carries FR-L3's four remedies: swap, remove, revert (the chosen-not-placed row), or go Pro.
pex = unbox(region('B Missing Surfaces', caption='B13a ·'))
pex = link_all(pex, '>Swap<', 'editor.html')                       # F-044: every Swap is tryable
pex = link_all(pex, 'Remove it', 'editor.html')
pex = link(pex, ('Swap all three', 'editor.html'), ('Revert to the free one', 'paywall-editor.html'),
                ('Swap and ship free', 'deploy.html'), ('Go Pro and ship', 'upgrade.html'))
page('pro-exit', html.unescape(re.search(r'<h3[^>]*>([^<]*)</h3>', pex).group(1)),   # the count is the frame's, never restated
     fill(pex) + bar(('← Editor', 'editor-free.html')))

# B23a · the Starter Chooser with Appendix E's roster since A7 item 19. F-042: Use Chapter and the category tabs respond.
starter = unbox(region('B Missing Surfaces', label='B23a Chooser'))
starter = link(starter, ('Start empty', 'editor.html'), ('Use Chapter', 'editor.html'), ('Back', 'first-run.html'))
starter = group(starter, 'cat', 'All 10', 'Writing', 'Newsletter', 'Portfolio', 'Business', 'Reference')
page('starter-chooser', 'Pick your starter', fill(starter))

# M5's figures are Appendix F.1's since A7 item 20; the F-007 patches are gone and check() guards the strings.
mk = unbox(region('M5 Pricing', label='M5 Pricing'))
mk = group(mk, 'interval', 'Monthly', 'Yearly')
mk = wire(mk, ('Start free', 'index.html'), ('Go Pro', 'upgrade.html'), ('Sign in', 'index.html'))
mk_m = unbox(region('M5 Pricing', label='M5 mobile'))                                        # R2-responsive-mobile-viewport-1 · R-76
mk_m = wire(mk_m, ('Start free', 'index.html'), ('Go Pro', 'upgrade.html'))
page('pricing', 'Pricing', fill(mk, mobile=mk_m))


# ─────────────────────────────────────────────────────────────────────────────
# NOT IN THIS CUT, AND WHY — three honest lists (F-013), true of the 2026-09-04 export. (a) is drawn but
# nothing on the app frame raises it. (b) is drawn on a mechanism a ruling re-specifies and prompt A7 did
# not correct it. (c) is a state or canvas no frame draws of a surface that is here. A `page` names the
# screen it belongs to and is asserted against the registry, so an entry cannot outlive its screen.
# The undrawn template canvases are DERIVED from D5b's menu, so that list cannot go stale by hand.
# ─────────────────────────────────────────────────────────────────────────────
UNDRAWN_TEMPLATES = ' · '.join(r for r in SWITCHER_ROWS if r not in SWITCH_TO)
NOT_YET = {
    'Drawn as a detail card, with nothing on the app frame to raise it': [
        ('Design Nav on the section (B1b) · Layers with Site-wide (B7) · Site Remix (B8) · Persistence (B6) · Inline Toolbar (P0-1)', 'no drawn trigger on S4a', 'editor'),
        ('Notifications (B21) · Connected-sites strip (B25)', 'S3e is lifted under the bell instead; B25 has no drawn trigger', 'dashboard'),
        ('The partial-success history row (D2d) — D2a draws v5 as an ordinary row, so the bar raises it', 'no drawn trigger', 'deploy-history'),
        ('The tablet device preview — B11 draws Desktop and Mobile', 'no frame', 'device-preview'),
    ],
    'Drawn on a mechanism a ruling re-specifies, and prompt A7 did not correct it — held out': [
        ('Redesign Proposals (B22) — held out entirely; J1 goes Auto-Branding → Editor, and D4a\'s door is drawn greyed', 'R-78 / FR-C7', 'auto-branding'),
        ('Translations (B18) — flat keys where FR-Q6 rules dotted namespace.name; D6a\'s rail row is unwired', 'FR-Q6', 'theme-settings'),
    ],
    'States and canvases no frame draws — the surface is here, the state is not': [
        ('The empty canvas — Blank canvas and Start empty land on the drawn canvas', 'no frame', 'editor'),
        ('Template canvases the switcher lists and no frame draws: ' + UNDRAWN_TEMPLATES + ' — A5 drew Tag and Author', 'no frame', 'editor'),
        ('The editor below 1440 is the resting editor only (D8a, D8b); hover, selected, shuffle and the D5 canvases are drawn at 1440', 'A8 drew the rest state', 'editor'),
        ('Connect · Keys with a bad key — Connect always succeeds', 'no frame', 'connect-keys'),
        ('Cancel plan — Appendix F.2 stops auto-renew at period end with no sheet; the button is inert here', 'no frame', 'billing'),
        ('Dark authoring outside the Section Picker · the sidebar Dark mode toggle · the . key · the overflow menu\'s Dark mode preview', 'no frame', 'editor'),
        ('Suggestions at 390 — R-76 requires it; S13 is drawn at 1440 only', 'no frame', 'suggestions'),
        ('Theme Settings on Free is D6b\'s two rows, not a whole page — A6 drew the credits row and the light-only row as details', 'D6b is a detail', 'theme-settings-free'),
        ('Pinning moves only the pin (D2a) — the PINNED chip and the row wash are drawn on other rows, not as a state of this one', 'no frame', 'deploy-history'),
        ('Test connection (S11d) · Docs and Keyboard shortcuts (S3d) · Restore original (D2a) · Download the live theme first (D3a) · '
         'Export theme zip (D4e, B15) · Make this the main feed (D5c) · Choose files (D8d) · Clear dark overrides (D6a) — drawn controls with no drawn result', 'no frame', 'manage-keys'),
    ],
}


def build_screens_index():
    # F-006: the "What responds" paragraph below claims only hooks a product screen carries. Change it when the hooks change, not before.
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
    Claude Design export</b> of 2026-09-04 — the markup is the frame's own, not a re-drawing of it — and then wired up so
    it behaves. If a screen looks wrong, the frame is what it looks like, and that is the point.</p>
  <p class="helper" style="margin-top:8px;max-width:74ch"><b>What responds.</b> Menus, popovers and sheets
    open from the control that raises them and close on <span class="kbd">Esc</span>, their drawn Cancel, or a
    click outside; focus moves in, is trapped, and returns — and a destructive confirm opens on its cancelling
    action. Segmented controls, tab rows and radio lists <b>pick</b>, and the selected look is the one the frame drew.
    In the editor <span class="kbd">Tab</span> meets the skip link first, <span class="kbd">P</span> opens Preview Mode and
    <span class="kbd">Esc</span> leaves it, <span class="kbd">L</span> hides Layers, <span class="kbd">↑</span> <span class="kbd">↓</span>
    move between its rows, and <span class="kbd">]</span> <span class="kbd">[</span> step the design ring between its two
    drawn positions; the Template chip opens the complete switcher, and the editor reflows at 834 and at 720 (narrow the
    window). <b>The first deploy walks six steps</b> — destination, the safety net and its declined path, the backup gate
    (self-hosted or Ghost(Pro), rows that tick, the ghost backup shortcut) — then check, ship and live; <b>Deploy only ends on
    Uploaded, not live</b>; later deploys walk four steps with the drift report inside pre-flight. History pins, refuses
    the last pin with its reason, and rolls back. On the dashboard, New project opens its sheet (at the cap on Free), and
    the over-limit sheet leads to which project stays editable. Every screen is reachable from Sign In by clicking, and the
    build refuses to report success if one is not, if any link is dead, or if a screen has nothing that responds.</p>
  <div class="idxgrid" style="margin-top:22px">{rows}</div>
  <h2 style="font-size:18px;margin:32px 0 6px">Not in this cut, and why</h2>
  <p class="helper" style="max-width:74ch;margin-bottom:12px">Three lists, because three different things are
    true. Some surfaces are <b>drawn as detail cards</b> with nothing on the app frame to raise them. Two are <b>drawn on a
    mechanism a ruling re-specifies</b> and prompt A7 did not correct them, so they are held out. And some <b>states and
    canvases</b> of a surface that is here were never drawn — the template list is derived from the switcher itself.</p>
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
        hooks = len(re.findall(r'data-(open|goto|pick|run|close|check|twin)=', body)) + len(re.findall(r'href="[A-Za-z0-9_.-]+\.html', body))
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
        # F-007: no plan string the PRD has ruled wrong survives a lift — since A7 this guards the export itself
        for s in ('Last 2', 'Unlimited', '30 MB', 'up to 3.', '>∞<', 'Creator or above', 'Try a variant'):
            if s in body:
                errs.append(f'plan string the PRD overrides · {pid} · {s!r}')
        # every trigger has its overlay and every overlay has a trigger; every step jump has a step
        opens = set(re.findall(r'data-(?:open|run-gate|run-gate-declined|run-after-declined)="([^"]+)"', body))
        overlays = set(re.findall(r'id="([^"]+)" class="overlay', body)) | set(re.findall(r'class="overlay[^"]*" id="([^"]+)"', body))
        for o in opens - overlays:
            errs.append(f'trigger with no overlay · {pid} · {o}')
        for o in overlays - opens:
            errs.append(f'overlay with no trigger · {pid} · {o}')
        steps = set(re.findall(r'data-step="(\d+)"', body))
        for g in set(re.findall(r'data-(?:goto|ending)="(\d+)"', body)) - steps:
            errs.append(f'goto with no step · {pid} · {g}')
        for g in set(re.findall(r'data-enables="#([^"]+)"', body)):
            if f'id="{g}"' not in body:
                errs.append(f'confirm enables a button that is not there · {pid} · {g}')
        # a phone region must be a drawn 390 frame, never a squeezed desktop one; the 834 and 720 regions their drawn frames
        for m in re.finditer(r'<div class="at-390">(.{0,400})', body, flags=re.S):
            if 'width:390px' not in m.group(1):
                errs.append(f'phone region is not a 390 frame · {pid}')
        for w in (834, 720):
            for m in re.finditer(r'<div class="at-%d">(.{0,400})' % w, body, flags=re.S):
                if 'data-screen-label="D8' not in m.group(1):
                    errs.append(f'the {w} region is not a D8 frame · {pid}')
        # D8c: an editor shell starts with the skip link, and the skip link has a canvas to land on
        if 'data-editor-shell' in p['attrs']:
            if not body.startswith(SKIP):
                errs.append(f'editor shell without the skip link first · {pid}')
            if 'id="canvas"' not in body:
                errs.append(f'skip link with no canvas · {pid}')
        if body.count('id="canvas"') > 1:
            errs.append(f'two canvases · {pid}')

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
