#!/usr/bin/env python3
"""Lift regions of the Claude Design export, verbatim.

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
"""
import os, re

EXPORT = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'design', 'claude-design-export', 'Inflozo'))

_cache = {}


def _src(name):
    if name not in _cache:
        _cache[name] = open(os.path.join(EXPORT, name + '.dc.html'), encoding='utf8').read()
    return _cache[name]


def _balanced(s, start):
    """The div beginning at `start`, up to its matching close."""
    depth = 0
    for m in re.finditer(r'<(/?)div\b[^>]*?(/?)>', s[start:]):
        if m.group(2) == '/':
            continue
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return s[start:start + m.end()]
    raise ValueError('unbalanced div at %d' % start)


def region(frame, label=None, caption=None):
    """A screen out of a frame file, exactly as it was drawn."""
    s = _src(frame)
    if label:
        i = s.index('data-screen-label="%s"' % label)
        return _balanced(s, s.rindex('<div', 0, i))
    # The unlabelled frames are announced by a mono caption immediately above them.
    m = re.search(r'>[^<>]*' + re.escape(caption) + r'[^<>]*</[a-zA-Z0-9]+>\s*', s)
    if not m:
        raise KeyError('no caption %r in %s' % (caption, frame))
    return _balanced(s, s.index('<div', m.end()))


# ─────────────────────────────────────────────────────────────────────────────
# Patching a lifted region
# ─────────────────────────────────────────────────────────────────────────────
FRAME_BOX = re.compile(
    r'width:1440px;height:\d+px;|width:1440px;|height:900px;|flex-shrink:0;?'
    r'|border-radius:8px;box-shadow:0 12px 40px rgba\(28,27,26,\.14\);')


def unbox(html_):
    """Strip the fixed frame box so the screen fills the browser window instead."""
    head = html_[:html_.index('>') + 1]
    return FRAME_BOX.sub('', head, count=6) + html_[html_.index('>') + 1:]


def patch(html_, *pairs, once=True):
    """Apply (find, replace) in order. Every find MUST hit — a patch that silently
    misses is how a lifted screen quietly stops matching the frame again."""
    for find, rep in pairs:
        if find not in html_:
            raise KeyError('patch target not found: %r' % find[:110])
        html_ = html_.replace(find, rep, 1 if once else -1)
    return html_


def _enclosing(s, i):
    """(start, end) of the smallest element containing position i."""
    start = s.rindex('<', 0, i)
    while s[start + 1] == '/':                       # we landed on a closing tag
        start = s.rindex('<', 0, start)
    tag = re.match(r'<([a-zA-Z0-9]+)', s[start:]).group(1)
    if s[s.index('>', start) - 1] == '/' or tag in ('input', 'img', 'br', 'hr'):
        return start, s.index('>', start) + 1
    depth = 0
    for m in re.finditer(r'<(/?)%s\b[^>]*?(/?)>' % tag, s[start:]):
        if m.group(2) == '/':
            continue
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return start, start + m.end()
    raise ValueError('unbalanced <%s>' % tag)


def link(html_, *pairs):
    """Wrap a drawn element in a real <a>, so the walkthrough navigates.

    Deliberately WRAPS rather than rewrites the element: the frames nest icons and
    spans inside their buttons, and rewriting the tag would drop them."""
    for text, href in pairs:
        if text not in html_:
            raise KeyError('link target not found: %r' % text)
        a, b = _enclosing(html_, html_.index(text))
        html_ = (html_[:a] + '<a href="%s" style="display:contents;color:inherit">' % href
                 + html_[a:b] + '</a>' + html_[b:])
    return html_


def attr(html_, find, extra):
    """Add attributes to the tag that contains `find`."""
    i = html_.index(find)
    start = html_.rindex('<', 0, i)
    end = html_.index('>', start)
    return html_[:end] + ' ' + extra + html_[end:]
