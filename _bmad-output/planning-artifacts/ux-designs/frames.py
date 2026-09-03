#!/usr/bin/env python3
"""Lift regions of the Claude Design export, verbatim. SHARED BY BOTH STEP-5 BUILDS.

WHY THIS FILE EXISTS, AND IT IS A CORRECTION.

The first cut of the walkthrough (and of step 5b) was written from a TEXT EXTRACTION of the
export — a tag-stripping pass that gave me every frame's copy and none of its composition. The
words came out right and the screens came out wrong: the resting editor sidebar is the PAGE panel
with a Style Pack cell, not an empty one; what's-new is a popover under a marigold button, not a
column; Send magic link is an INK button, not coral; the project cards carry real miniature
renderings; S4a's Layers is a flat list of design names with no site-wide group. None of that
survives a tag-stripper, and R-74 says the export decides what a surface is built from.

So this module reads the frames as what they are: self-contained HTML with inline styles. A screen
is LIFTED and then patched — links wired, behaviour hooks added, the fixed 1440×900 frame box
removed so it fills a window. Nothing is retyped, so nothing can drift in the retyping.

    region('S1 Sign In', label='S1a Sign in default')     # by data-screen-label
    region('S8 Deploy', caption='S8b')                    # by the mono caption above the frame

    python3 frames.py --selftest            # one fixture per bug this file has had
    python3 frames.py --selftest old.py     # the same fixtures against another copy

ponytail: this is a regex lifter for the step-5 prototypes, not a parser and not for the product.
Its ceiling is an attribute value containing '>' (none in the export today); the upgrade path is
html.parser with positions.
"""
import os, re, sys

EXPORT = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..', 'design', 'claude-design-export', 'Inflozo'))

# F-035: flip to True and every text-matched patch must be unambiguous (one text-node hit, or
# an explicit nth). build-app.py can set `frames.STRICT = True` to assert its whole build.
STRICT = False

_cache = {}
_TAG = re.compile(r'<(/?)([a-zA-Z0-9-]+)\b[^>]*?(/?)>')
_VOID = ('input', 'img', 'br', 'hr')
_FOCUSABLE = ('a', 'button', 'input', 'select', 'textarea')


def _src(name):
    if name not in _cache:
        _cache[name] = open(os.path.join(EXPORT, name + '.dc.html'), encoding='utf8').read()
    return _cache[name]


def _end(s, start):
    """End (exclusive) of the element opening at `start`. Generic over the tag, because the
    export labels sections and divs alike."""
    m = _TAG.match(s, start)
    tag = m.group(2)
    if m.group(3) == '/' or tag in _VOID:
        return m.end()
    depth = 0
    for m in re.finditer(r'<(/?)%s\b[^>]*?(/?)>' % re.escape(tag), s[start:]):
        if m.group(2) == '/':
            continue
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return start + m.end()
    raise ValueError('unbalanced <%s> at %d' % (tag, start))


def _balanced(s, start):
    return s[start:_end(s, start)]


def region(frame, label=None, caption=None):
    """A screen out of a frame file, exactly as it was drawn."""
    s = _src(frame)
    if label:
        i = s.index('data-screen-label="%s"' % label)
        return _balanced(s, s.rindex('<', 0, i))
    # The unlabelled frames are announced by a mono caption immediately above them.
    m = re.search(r'>[^<>]*' + re.escape(caption) + r'[^<>]*</[a-zA-Z0-9]+>\s*', s)
    if not m:
        raise KeyError('no caption %r in %s' % (caption, frame))
    return _balanced(s, s.index('<', m.end()))


# ─────────────────────────────────────────────────────────────────────────────
# Patching a lifted region
# ─────────────────────────────────────────────────────────────────────────────
FRAME_BOX = re.compile(
    r'width:1440px;height:\d+px;|width:1440px;|height:900px;|flex-shrink:0;?'
    r'|border-radius:8px;box-shadow:0 12px 40px rgba\(28,27,26,\.14\);')


def unbox(html_):
    """Strip the fixed frame box so the screen fills the browser window instead.

    F-001: a root that clips (overflow:hidden) and whose only child is position:absolute;inset:0
    has no height of its own once the box is gone, so the frame's height stays as a min-height —
    the window can grow it, nothing can collapse it to zero."""
    cut = html_.index('>') + 1
    head, rest = html_[:cut], html_[cut:]
    h = re.search(r'(?<!min-)height:(\d+)px', head)
    head = FRAME_BOX.sub('', head, count=6)
    if h and 'overflow:hidden' in head and rest.lstrip().startswith('<div style="position:absolute;inset:0'):
        head = head.replace('overflow:hidden', 'min-height:%spx;overflow:hidden' % h.group(1), 1)
    return head + rest


def patch(html_, *pairs, once=True):
    """Apply (find, replace) in order. Every find MUST hit — a patch that silently
    misses is how a lifted screen quietly stops matching the frame again."""
    for find, rep in pairs:
        if find not in html_:
            raise KeyError('patch target not found: %r' % find[:110])
        html_ = html_.replace(find, rep, 1 if once else -1)
    return html_


def _enclosing(s, i):
    """(start, end) of the smallest element whose CONTENT contains position i.

    F-003: walking back from the text, a closing tag means a finished sibling subtree
    (`<svg>…</svg>Ship it`), so the walk skips past its opener and keeps going outward until
    it meets an opener at depth zero — the <a>/<button>/<div> that holds icon and text both."""
    depth, pos = 0, i
    while True:
        start = s.rindex('<', 0, pos)
        m = _TAG.match(s, start)
        if m is None:                                    # a comment or stray '<' in text
            pos = start
            continue
        closing, tag, selfclose = m.group(1), m.group(2), m.group(3)
        if closing:
            depth += 1
        elif selfclose or tag in _VOID:
            pass
        elif depth:
            depth -= 1
        else:
            return start, _end(s, start)
        pos = start


def _text_at(s, text, nth=None):
    """Position of the nth occurrence of `text` that lies in a TEXT NODE.

    F-005: an occurrence between '<' and the next '>' is a tag or an attribute value (the
    frame's own data-screen-label, a style) and never a label. A leading '>' in `text`
    ('>Run checks<') is the tag's own bracket, so the test is made just after it. Matches
    that start a word (after '>' or whitespace) win over ones inside a word ('Web|sites')."""
    k = len(text) - len(text.lstrip('>'))
    hits = [m.start() for m in re.finditer(re.escape(text), s)
            if s.rfind('<', 0, m.start() + k) < s.rfind('>', 0, m.start() + k)]
    starts = [h for h in hits if h + k == 0 or s[h + k - 1] in '> \n\t']
    hits = starts or hits
    if not hits:
        raise KeyError('not found in any text node: %r' % text)
    if STRICT and nth is None and len(hits) > 1:
        raise ValueError('ambiguous %r: %d text hits — pass nth=' % (text, len(hits)))
    if (nth or 0) >= len(hits):
        raise KeyError('only %d text hits for %r, nth=%r asked' % (len(hits), text, nth))
    return hits[nth or 0] + k


def _elem(html_, text, nth=None):
    """(start, end) of the smallest element containing the nth text-node occurrence of `text`."""
    return _enclosing(html_, _text_at(html_, text, nth))


def _tag(s, start):
    return _TAG.match(s, start).group(2)


def _with(html_, start, **attrs):
    """Set attributes on the opening tag at `start`. A python name `data_open` is the
    attribute `data-open`. An existing style or class is MERGED (F-036), any other existing
    attribute is overwritten, the rest are appended — so nothing is ever doubled."""
    end = html_.index('>', start)
    head = html_[start:end]
    for k, v in attrs.items():
        k = k.rstrip('_').replace('_', '-')
        m = re.search(r'\s%s="([^"]*)"' % re.escape(k), head)
        if m and k == 'style':
            v = m.group(1).rstrip(';') + ';' + v if v not in m.group(1) else m.group(1)
        elif m and k == 'class':
            v = m.group(1) + ' ' + v
        if m:
            head = head[:m.start(1)] + v + head[m.end(1):]
        else:
            head += ' %s="%s"' % (k, v)
    return html_[:start] + head + html_[end:]


def link(html_, *pairs):
    """Wrap a drawn element in a real <a>, so the walkthrough navigates.

    Deliberately WRAPS rather than rewrites the element: the frames nest icons and
    spans inside their buttons, and rewriting the tag would drop them.

    F-004: an element the frame already drew as an <a href="#"> gets its href rewritten —
    nesting a second anchor is invalid and the browser keeps the drawn '#'.
    F-025: a wrapper with display:contents has no box and takes no focus, so a wrapped
    element that is not natively focusable gets tabindex="0" role="link" (attributes only, no
    pixel changes); app.js follows the nearest a[href] on Enter."""
    for text, href in pairs:
        a, b = _elem(html_, text)
        if _tag(html_, a) != 'a' and a and _tag(html_, _enclosing(html_, a - 1)[0]) == 'a':
            a, b = _enclosing(html_, a - 1)          # ponytail: one level up; deeper nesting is not drawn
        if _tag(html_, a) == 'a':
            html_ = _with(html_, a, href=href)
            continue
        inner = html_[a:b]
        if _tag(html_, a) not in _FOCUSABLE:
            inner = _with(inner, 0, tabindex='0', role='link')
        html_ = (html_[:a] + '<a href="%s" style="display:contents;color:inherit">' % href
                 + inner + '</a>' + html_[b:])
    return html_


def attr(html_, find, extra):
    """Add attributes to the tag that contains `find` — a label in its text, or a value
    in one of its own attributes (build-app hooks by style value where a frame draws no text).

    F-002: a label that follows an icon is preceded by `</svg>`, and the host is the element
    that holds both, never that closing tag."""
    i = html_.index(find) + len(find) - len(find.lstrip('>'))   # '>Ship it<' tests after its '>'
    lt, gt = html_.rfind('<', 0, i), html_.rfind('>', 0, i)
    start = lt if lt > gt else _elem(html_, find)[0]
    assert html_[start + 1] != '/', 'attr() host is a closing tag: %r' % html_[start:start + 40]
    end = html_.index('>', start)
    return html_[:end] + ' ' + extra + html_[end:]


# ─────────────────────────────────────────────────────────────────────────────
# Making a lifted frame behave
#
# The export draws every control in one state, with its look in an inline style and
# no class to hook. So the interaction cannot be bolted on with a stylesheet — it has
# to be attached at lift time, to the element the frame already drew. These four
# helpers are the whole vocabulary; `app.js` implements the other half.
#
# F-023 / F-025: each hook also gives its element the keyboard attributes the drawn markup
# lacks — tabindex, role, aria-* — which change no pixel. app.js toggles aria-expanded and
# turns Enter/Space into the click.
# ─────────────────────────────────────────────────────────────────────────────
def overlay(html_, text, mid, kind='menu-lifted', nth=None):
    """Turn something the frame drew OPEN into something that opens and closes.

    The frames document dropdowns and sheets in their open state, because that is the
    state worth drawing. In the product they are raised by a control, so the drawn
    element keeps its look and gains an id, a class and a hidden default."""
    a, _b = _elem(html_, text, nth)                  # F-038: any tag, not only <div>
    return _with(html_, a, id=mid, class_='overlay ' + kind)


def trigger(html_, text, mid, nth=None):
    """The control that raises an overlay."""
    a, _b = _elem(html_, text, nth)
    kw = dict(data_open=mid, style='cursor:pointer', aria_haspopup='true', aria_expanded='false')
    if _tag(html_, a) not in _FOCUSABLE:
        kw.update(tabindex='0', role='button')
    return _with(html_, a, **kw)


def pick(html_, group, *texts, role='tab'):
    """A set of sibling options — a segmented control, a tab row, a radio list, a menu.

    The frame draws one of them selected, with its selected look in an inline style.
    `app.js` swaps that style between siblings on click, so the control responds the way
    it was drawn to rather than the way a stylesheet would guess.

    ponytail: role is 'tab' unless the caller says 'radio' (the deploy destination cards);
    telling a radio from a tab by its drawn dot would need the card, not the label."""
    state = 'aria_checked' if role == 'radio' else 'aria_selected'
    for t in texts:
        a, _b = _elem(html_, t)
        html_ = _with(html_, a, data_pick=group, role=role, tabindex='-1', **{state: 'false'})
    return html_


def picked(html_, text, nth=None):
    """Mark which option the frame drew as the selected one."""
    a, _b = _elem(html_, text, nth)
    radio = 'role="radio"' in html_[a:html_.index('>', a)]
    state = 'aria_checked' if radio else 'aria_selected'
    return _with(html_, a, data_picked='', tabindex='0', **{state: 'true'})


def part(frame, n=0, **kw):
    """The nth top-level child of a region.

    Several detail frames document a surface TWICE — the desktop popover beside the
    mobile one, each under its own caption. That is right for a design document and
    wrong for a walkthrough, which has to show the product and not the documentation.
    This takes one of them."""
    r = region(frame, **kw)
    inner = r[r.index('>') + 1:r.rindex('</')]
    depth, start, seen = 0, None, 0
    for m in re.finditer(r'<(/?)div\b[^>]*?(/?)>', inner):
        if m.group(2) == '/':
            continue
        if not m.group(1):
            if depth == 0:
                start = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                if seen == n:
                    return inner[start:m.end()]
                seen += 1
    raise IndexError('no child %d' % n)


_CAP = re.compile(r"<div[^>]*JetBrains Mono[^>]*>[^<]{0,200}</div>\s*")


def _depth(s, upto):
    d = 0
    for m in _TAG.finditer(s, 0, upto):
        if m.group(3) == '/' or m.group(2) in _VOID:
            continue
        d += -1 if m.group(1) else 1
    return d


def decap(html_, depth=2):
    """Drop the mono captions a frame carries.

    A caption is documentation about the frame — "desktop — opens under the bell" — and
    belongs in step 5b, which is about checking the drawing. In step 5c it would be a
    label floating on the product, so it comes off.

    F-112: a caption sits on the frame, at most two levels under the lifted root. Mono text
    deeper than that is part of a drawn control (S11b's screenshot placeholder label, S9's
    YAML pane) and stays. ponytail: a depth ceiling, not a caption grammar; the upgrade is
    matching the caption shapes ('desktop —', 'S\\d+\\w ·') as well."""
    out, pos = [], 0
    for m in _CAP.finditer(html_):
        if _depth(html_, m.start()) <= depth:
            out.append(html_[pos:m.start()])
            pos = m.end()
    out.append(html_[pos:])
    return ''.join(out)


# ─────────────────────────────────────────────────────────────────────────────
# Self-test — one fixture per bug this file has had. `--selftest other.py` runs the same
# fixtures against another copy, which is how "fails on the old code" is shown, not claimed.
# ─────────────────────────────────────────────────────────────────────────────
def _fixtures():
    ICON = '<svg viewBox="0 0 24 24"><path d="M0 0"></path><line x1="1"></line></svg>'
    BTN = '<div><button style="height:36px">' + ICON + 'Ship it</button></div>'

    def f003_text_after_svg(F):
        out = F.link(BTN, ('Ship it', 'go.html'))
        assert out == ('<div><a href="go.html" style="display:contents;color:inherit">'
                       '<button style="height:36px">' + ICON + 'Ship it</button></a></div>'), out

    def f002_attr_after_svg(F):
        out = F.attr(BTN, 'Ship it', 'data-run="4"')
        assert '<button style="height:36px" data-run="4">' in out and '</svg data-run' not in out, out

    def f002_attr_bracketed_text(F):
        out = F.attr(BTN, '>Ship it<', 'data-goto="2"')
        assert '<button style="height:36px" data-goto="2">' in out and '</svg data-goto' not in out, out

    def f002_attr_by_style_value(F):
        out = F.attr(BTN, 'height:36px', 'id="go"')
        assert '<button style="height:36px" id="go">' in out, out

    def f005_label_inside_attribute(F):
        h = '<div data-screen-label="S11a Sites"><div>Websites</div><div>' + ICON + 'Sites</div></div>'
        out = F.link(h, ('Sites', 'sites.html'))
        assert out.startswith('<div data-screen-label="S11a Sites"><div>Websites</div><a href="sites.html"'), out

    def f004_existing_anchor(F):
        out = F.link('<p><a href="#" style="c:1">Back</a></p>', ('Back', 'prev.html'))
        assert out == '<p><a href="prev.html" style="c:1">Back</a></p>', out

    def f004_anchor_one_level_up(F):
        out = F.link('<p><a href="#"><span>Terms</span></a></p>', ('Terms', 'terms.html'))
        assert out == '<p><a href="terms.html"><span>Terms</span></a></p>', out

    def f036_trigger_merges_style(F):
        out = F.trigger('<button style="height:36px">View invoices</button>', 'View invoices', 'inv')
        assert out.count('style=') == 1 and 'style="height:36px;cursor:pointer"' in out, out
        assert 'aria-haspopup="true"' in out and 'aria-expanded="false"' in out, out

    def f023_trigger_keyboard(F):
        out = F.trigger('<div><div>' + ICON + 'Upload</div></div>', 'Upload', 'dz')
        assert ('<div data-open="dz" style="cursor:pointer" aria-haspopup="true" aria-expanded="false" '
                'tabindex="0" role="button">' + ICON + 'Upload</div>') in out, out
        native = F.trigger('<button>Upload</button>', 'Upload', 'dz')
        assert 'tabindex' not in native and 'role=' not in native, native

    def f025_link_keyboard(F):
        out = F.link('<div><div style="a:b">Blank canvas</div></div>', ('Blank canvas', 'ed.html'))
        assert '<div style="a:b" tabindex="0" role="link">Blank canvas</div></a>' in out, out
        native = F.link('<div><button>Go</button></div>', ('Go', 'x.html'))
        assert 'tabindex' not in native, native

    def f023_pick_picked(F):
        out = F.picked(F.pick('<div><span>Top</span><span>New</span></div>', 'tab', 'Top', 'New'), 'Top')
        assert ('<span data-pick="tab" role="tab" tabindex="0" aria-selected="true" data-picked="">Top</span>'
                '<span data-pick="tab" role="tab" tabindex="-1" aria-selected="false">New</span>') in out, out
        r = F.picked(F.pick('<div><span>A</span><span>B</span></div>', 'dest', 'A', 'B', role='radio'), 'B')
        assert 'role="radio" tabindex="0" aria-checked="true" data-picked="">B' in r and 'aria-selected' not in r, r

    def f038_overlay_any_tag(F):
        out = F.overlay('<div><span class="x">Menu</span></div>', 'Menu', 'm')
        assert '<span class="x overlay menu-lifted" id="m">Menu</span>' in out, out

    def f001_unbox_keeps_min_height(F):
        h = ('<div data-screen-label="S8a" style="width:1440px;height:900px;background:#F7F5F2;position:relative;'
             'overflow:hidden;border-radius:8px;box-shadow:0 12px 40px rgba(28,27,26,.14)">\n'
             '  <div style="position:absolute;inset:0">c</div></div>')
        out = F.unbox(h)
        assert 'min-height:900px;overflow:hidden' in out and 'width:1440px' not in out, out
        assert out.count('height:') == 1, out
        flow = F.unbox('<div style="width:1440px;height:900px;overflow:hidden"><div style="height:48px">c</div></div>')
        assert 'min-height' not in flow and 'width' not in flow, flow

    def f112_decap_keeps_nested_label(F):
        mono = '<div style="font-family:\'JetBrains Mono\',monospace">'
        h = ('<div>' + mono + 'desktop — opens under the bell</div><div><div>'
             + mono + 'screenshot: Ghost Admin</div></div></div>')
        out = F.decap(h)
        assert 'opens under the bell' not in out and 'screenshot: Ghost Admin' in out, out

    def f035_strict_ambiguity(F):
        F.STRICT = True
        try:
            try:
                F.link('<p><b>Back</b><i>Back</i></p>', ('Back', 'x.html'))
                raise AssertionError('ambiguous match did not raise')
            except ValueError:
                pass
            out = F.trigger('<p><b>Back</b><i>Back</i></p>', 'Back', 'm', nth=1)
            assert '<i data-open="m"' in out, out
        finally:
            F.STRICT = False

    return [v for k, v in sorted(locals().items()) if k.startswith('f')]


def _selftest(F):
    failed = 0
    for fx in _fixtures():
        try:
            fx(F)
            print('  PASS', fx.__name__)
        except Exception as e:                       # noqa: BLE001 — a self-test reports, it does not hide
            failed += 1
            print('  FAIL', fx.__name__, '—', type(e).__name__, str(e)[:160])
    print('%d fixtures, %d failed' % (len(_fixtures()), failed))
    return failed


if __name__ == '__main__':
    if '--selftest' in sys.argv:
        target = sys.modules[__name__]
        other = [a for a in sys.argv[2:] if a.endswith('.py')]
        if other:
            import importlib.util
            spec = importlib.util.spec_from_file_location('frames_other', other[0])
            target = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(target)
            print('fixtures against', other[0])
        sys.exit(1 if _selftest(target) else 0)
    print(__doc__)
