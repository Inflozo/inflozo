#!/usr/bin/env python3
"""AD-23's recorder for Story 4.3 — what a real Ghost actually prints for FR-H5's helper surface.

    python3 tools/probe/record-shim.py            # both majors
    python3 tools/probe/record-shim.py 6          # one

Writes `packages/ghost-shim/fixtures/ghost5/` and `ghost6/`, one JSON per template, each carrying
its capture date, the command that produced it, and the Ghost version it came off. The shim is
written against those files and `contract.test.ts` asserts against them per-commit and OFFLINE.

Why this exists rather than a paraphrase: the shape of a Ghost sized URL is recorded nowhere in this
repository, so writing the URL builder from memory and recording afterwards would produce a recording
that agrees with the code because both came from the same guess — standing rule 2's failure exactly.

What it writes to the servers, and nothing else (the story's "Ask First" boundary):
  * ONE image into the content store — reused on every later run while it still answers 200, so the
    boundary holds per story. Earlier runs uploaded one each (Ghost has no image-delete API; the
    leftovers `-1` … `-7.png` on the two boxes are the record of that, accepted by the owner — see the
    spec's Q2). Every seeded feature image is an external static.ghost.org URL that no Ghost will
    ever resize, so nothing already on either box can exercise a rendition.
  * the probe theme, uploaded and activated, with the PREVIOUS theme restored at the end, read back as
    active, and the probe theme DELETED in the same cleanup and read back as gone (the owner's ruling on
    Story 4.7's Q1, which run-verify-core.py carries too).
  * since Story 5.20 (the MEMBERS group, below): TWO probe posts per server, created with the staff token and
    DELETED in a `finally`, each read back as gone — and on T3 alone, Subscription access set to Nobody for a few
    seconds, restored to its previous value in its own `finally` and read back.
Apart from those, it creates no post, edits no post and touches no setting. The uploaded image URL reaches the theme
through a placeholder substituted at zip time, which is why no content row has to carry it.

NFR-6(c2): the theme's package.json carries FR-J2's NORMATIVE image_sizes map, READ from
packages/library/src/vocabulary.ts rather than restated here, because Ghost's resize behaviour
follows the theme's own map — a recording made under any other map is a faithful recording of the
wrong theme.

Story 4.9 adds `theme-shim/locales/en.json` and the TR group — `{{t}}`'s lookup, params and escaping — plus
`<pre id="verbatim-*">` blocks, read back WITHOUT unescaping because what Ghost escapes is the fact. The
recording carries the locale file it was made under as `input.locales_en`, so `contract.test.ts` asserts
`t()` against Ghost's question as well as its answer. TR|plain_control is the control: unless it printed
the file's value, `{{t}}` was not reading the file and no TR row counts.

Story 4.10 adds the PILOT group to index.hbs and `theme-shim/partials/probe-card.hbs`, a partial with no params
invoked inside `{{#foreach posts}}` (it prints each row's `title` and `@first`), plus the navigation loop's
`label`/`url`, the signed-out `{{#if @member.paid}}` arm, the `@site.logo` and `@site.allow_self_signup`
conditions and a one-post `{{#get}}` — the rows the five pilots stand on. The signed-in member arms stay
cited, not recorded: creating a member is outside the recorder's writes.

Story 5.19 adds the FEED group to index.hbs (MEASUREMENTS §53): a `{{#get "posts"}}` with and without
`include="tags,authors"`, `{{#if posts}}` inside a get that matches nothing over the page's full native feed (the
secondary feed's shadowing premise), the three Source filters, three single-id gets in a chosen NON-date order, the
existence get around them, and `pagination` inside a get. The picks are the site's own newest three public posts,
read before the zip and substituted as __FEED_IDS__ / __FEED_PICKS__ in the order second · third · first, and
recorded as `input.feed_picks` so the contract test asserts Ghost's order against the chosen one. Reading them is a
Content API read; it writes nothing.

Story 5.20 adds the MEMBERS group (MEASUREMENTS §54). index.hbs gains `{{#get "tiers"}}` plain and with FR-H6's
`type:paid+visibility:public`, and the three member flags; `input` gains the Content API's tiers and member settings
and Admin `settings/` narrowed to MEMBER_KEYS, read through the INTEGRATION key as `probeSite` reads it — never a
`stripe_*` key. AFTER every other template is recorded (so neither sits in a recorded feed) it creates two
Paid-members-only posts rendered by `custom-inflozo-members.hbs`: a long one with a Public preview marker, and a short
one with none. Each is filed as a logged-out visitor sees it — `{{content}}` verbatim (the preview and Ghost's own
box), `{{reading_time}}` bare and as the field inside `{{t}}`, and what `{{ghost_head}}` injected (the CTA stylesheet,
Portal's script, by presence only because its tag carries the key). On T3 alone the long one is rendered again with
Subscription access set to Nobody (`members-long-nobody`), whose control is the same page before the toggle.
"""
import os, re, sys, json, time, zlib, struct, hmac, hashlib, base64, zipfile, io, uuid, datetime
import urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
THEME = os.path.join(HERE, 'theme-shim')
FIXTURES = os.path.join(ROOT, 'packages', 'ghost-shim', 'fixtures')
COMMAND = 'python3 tools/probe/record-shim.py'
VOCAB = os.path.join(ROOT, 'packages', 'library', 'src', 'vocabulary.ts')

# ── the one copy of the image_sizes map, read rather than restated ─────────────
def image_sizes():
    src = open(VOCAB).read()
    m = re.search(r'export const IMAGE_SIZES[^=]*=\s*\{(.*?)\}', src, re.S)
    if not m:
        raise SystemExit('IMAGE_SIZES not found in packages/library/src/vocabulary.ts — '
                         'the probe theme may not restate the map (FR-J2, NFR-6(c2))')
    sizes = {k: int(v) for k, v in re.findall(r'([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(\d+)', m.group(1))}
    if not sizes:
        raise SystemExit('IMAGE_SIZES parsed empty')
    return sizes


def load_env():
    out = {}
    for line in open(os.path.join(HERE, '.env')):
        m = re.match(r'^([A-Z0-9_]+)=(.*)$', line.rstrip('\n'))
        if m and m.group(2).strip():
            out[m.group(1)] = m.group(2).strip()
    return out


def jwt(key):
    kid, secret = key.split(':')
    b64 = lambda b: base64.urlsafe_b64encode(b).rstrip(b'=')
    h = b64(json.dumps({"alg": "HS256", "typ": "JWT", "kid": kid}).encode())
    n = int(time.time())
    p = b64(json.dumps({"iat": n, "exp": n + 300, "aud": "/admin/"}).encode())
    s = b64(hmac.new(bytes.fromhex(secret), h + b'.' + p, hashlib.sha256).digest())
    return (h + b'.' + p + b'.' + s).decode()


class Ghost:
    def __init__(self, url, token, major, content_key):
        self.url, self.token, self.av = url.rstrip('/'), token, f'v{major}.0'
        self.ckey, self.major = content_key, major

    def _h(self, extra=None):
        h = {'Authorization': 'Ghost ' + jwt(self.token), 'Accept-Version': self.av}
        h.update(extra or {})
        return h

    def api(self, method, path, body=None):
        req = urllib.request.Request(f'{self.url}/ghost/api/admin/{path}',
            data=json.dumps(body).encode() if body is not None else None, method=method,
            headers=self._h({'Content-Type': 'application/json'}))
        with urllib.request.urlopen(req, timeout=90) as r:
            return json.load(r) if r.status != 204 else {}

    def content(self, path):
        sep = '&' if '?' in path else '?'
        req = urllib.request.Request(f'{self.url}/ghost/api/content/{path}{sep}key={self.ckey}',
                                     headers={'Accept-Version': self.av})
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.status, json.load(r)
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read() or b'{}')

    def _multipart(self, path, parts, timeout=180):
        bnd = '----inflozo' + uuid.uuid4().hex
        body = b''
        for name, filename, ctype, data in parts:
            body += (f'--{bnd}\r\nContent-Disposition: form-data; name="{name}"; '
                     f'filename="{filename}"\r\nContent-Type: {ctype}\r\n\r\n').encode() + data + b'\r\n'
        body += f'--{bnd}--\r\n'.encode()
        req = urllib.request.Request(f'{self.url}/ghost/api/admin/{path}', data=body, method='POST',
            headers=self._h({'Content-Type': f'multipart/form-data; boundary={bnd}'}))
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.load(r)

    def upload_theme(self, zip_bytes):
        return self._multipart('themes/upload/', [('file', 'inflozo-probe-shim.zip', 'application/zip', zip_bytes)])

    def upload_image(self, png, filename):
        return self._multipart('images/upload/', [('file', filename, 'image/png', png)])

    def page(self, path):
        req = urllib.request.Request(self.url + path, headers={'User-Agent': 'inflozo-probe'})
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.status, r.read().decode('utf8', 'replace')
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode('utf8', 'replace')


# ── a deterministic PNG, so re-running the recorder uploads the same pixels ────
def make_png(w=2400, h=1200):
    rows = b''
    for y in range(h):
        # two bands and a horizontal ramp: compresses small, still a real raster Ghost can resize
        row = bytearray([0])
        for x in range(w):
            row += bytes(((x * 255) // w, (y * 255) // h, 128))
        rows += bytes(row)
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data))
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(rows, 9))
            + chunk(b'IEND', b''))


def img_url_block(sizes, label, path_expr):
    """One line per image_sizes KEY, derived from the library's map — plus the two controls that
    make the recording readable: no size at all, and a size that is NOT a key (Ghost silently
    returns the original, which is the live defect `HELPERS.img_url` now refuses)."""
    lines = [f'IMG|{label}_nosize=[{{{{img_url {path_expr}}}}}]']
    for k in sizes:
        lines.append(f'IMG|{label}_{k}=[{{{{img_url {path_expr} size="{k}"}}}}]')
    lines.append(f'IMG|{label}_notakey=[{{{{img_url {path_expr} size="800"}}}}]')
    lines.append(f'IMG|{label}_webp=[{{{{img_url {path_expr} size="{next(iter(sizes))}" format="webp"}}}}]')
    lines.append(f'IMG|{label}_absolute=[{{{{img_url {path_expr} size="{next(iter(sizes))}" absolute="true"}}}}]')
    return '\n'.join(lines)


# ── Story 5.20: the MEMBERS group (MEASUREMENTS §54) ──────────────────────────
MEMBERS_TEMPLATE = 'custom-inflozo-members'
# the only settings keys this recorder copies — never a stripe_* key, which the same list carries, secrets included
MEMBER_KEYS = ('members_signup_access', 'members_enabled', 'members_invite_only', 'allow_self_signup',
               'paid_members_enabled')
PREVIEW_PARAGRAPHS = 3


def members_lexical(paragraphs, cut=None):
    """Koenig's own shapes (the Orbit Weekly corpus renders them on both boxes): a paragraph per string, and the
    `paywall` card — the author's Public preview marker, which Ghost renders as `<!--members-only-->` — before
    paragraph `cut`."""
    kids = []
    for i, text in enumerate(paragraphs):
        if i == cut:
            kids.append({'type': 'paywall', 'version': 1})
        kids.append({'children': [{'detail': 0, 'format': 0, 'mode': 'normal', 'style': '', 'text': text,
                                   'type': 'extended-text', 'version': 1}],
                     'direction': 'ltr', 'format': '', 'indent': 0, 'type': 'paragraph', 'version': 1})
    return json.dumps({'root': {'children': kids, 'direction': None, 'format': '', 'indent': 0,
                                'type': 'root', 'version': 1}})


def members_bodies():
    """The long post reads for well over a minute (a real `reading_time` above 0); the short one for well under
    (Ghost stores 0), and carries no marker, so a logged-out visitor is sent no body at all."""
    words = ('Inflozo records what a reader who may not read this post is sent, and what a reader who may '
             'is sent instead. ')
    long_ = [f'Paragraph {i + 1}. ' + words * 6 for i in range(12)]
    return long_, ['One short paragraph, and nothing after it.']


def head_of(html):
    """What `{{ghost_head}}` injected for members — the CTA stylesheet's text and whether Portal's and Stripe's scripts
    are present. Portal's tag carries the Content API key as `data-key`, so only its PRESENCE is kept."""
    style = re.search(r'<style id="gh-members-styles">(.*?)</style>', html, re.S)
    return {
        'cta_style': style.group(1) if style else None,
        'portal_script': re.search(r'<script[^>]+src="[^"]*portal[^"]*"', html) is not None,
        'stripe_script': 'js.stripe.com' in html,
    }


def admin_members(gi):
    """Admin `settings/` through the INTEGRATION key — the door `probeSite` reads at connect and daily — narrowed to
    MEMBER_KEYS. `settings/?filter=` is not honoured (record-cards.py), so the whole list is read and filtered here."""
    rows = {s['key']: s['value'] for s in gi.api('GET', 'settings/')['settings']}
    missing = [k for k in MEMBER_KEYS if k not in rows]
    if missing:
        raise RuntimeError(f'Admin settings/ carries no {missing} — the record has nothing to copy')
    return {k: rows[k] for k in MEMBER_KEYS}


def staff_setting(g, key):
    return next(s['value'] for s in g.api('GET', 'settings/')['settings'] if s['key'] == key)


def content_members(g):
    """The Content API reads §54 writes up: every tier Ghost answers (a hidden one included), the same with FR-H6's
    filter (`+` sent as %2B, or it is a space), and the public settings' member flags."""
    pick = ('name', 'slug', 'type', 'visibility', 'active', 'monthly_price', 'yearly_price', 'currency',
            'trial_days', 'benefits')
    st, d = g.content('tiers/?include=monthly_price,yearly_price,benefits')
    if st != 200:
        raise RuntimeError(f'Content API tiers/ answered HTTP {st}')
    tiers = [{k: t.get(k) for k in pick} for t in d.get('tiers') or []]
    st, d = g.content('tiers/?filter=type:paid%2Bvisibility:public')
    if st != 200:
        raise RuntimeError(f'Content API tiers/?filter= answered HTTP {st}')
    public = sorted(t['name'] for t in d.get('tiers') or [])
    st, d = g.content('settings/')
    if st != 200:
        raise RuntimeError(f'Content API settings/ answered HTTP {st}')
    s = d.get('settings') or {}
    settings = {k: s.get(k) for k in ('members_enabled', 'members_invite_only', 'members_signup_access',
                                      'allow_self_signup', 'paid_members_enabled', 'portal_plans')}
    return tiers, public, settings


def members_post(g, which, paragraphs, cut):
    body = {'title': f'Inflozo members probe — {which}', 'slug': f'inflozo-members-probe-{which}',
            'lexical': members_lexical(paragraphs, cut), 'status': 'published', 'visibility': 'paid',
            'custom_template': MEMBERS_TEMPLATE}
    return g.api('POST', 'posts/', {'posts': [body]})['posts'][0]


def members_input(g, post, cut):
    """The INPUT behind the rendered page: the author's whole html (Admin), and what a logged-out visitor is served
    (Content API) — its `html` is the preview Ghost keeps, its `reading_time` the one the helpers read."""
    full = g.api('GET', f'posts/{post["id"]}/?formats=html')['posts'][0]
    html = full.get('html') or ''
    marker = html.find('<!--members-only-->')
    if (marker != -1) != (cut is not None):
        raise RuntimeError(f'{post["slug"]}: the preview marker is {"absent" if marker == -1 else "present"} in '
                           f'Ghost\'s html — the post is not the one the rows describe (standing rule 2)')
    st, d = g.content(f'posts/{post["id"]}/')
    if st != 200:
        raise RuntimeError(f'Content API posts/{post["id"]}/ answered HTTP {st}')
    served = d['posts'][0]
    return {
        'visibility': full.get('visibility'),
        'reading_time': served.get('reading_time'),
        'author_html_length': len(html),
        'author_preview': html[:marker] if marker != -1 else None,
        'served_html': served.get('html'),
        'served_access': served.get('access'),
    }


def render_members(g, key, path, inputs, post_input):
    st, html = g.page(path)
    values, raw, verbatim = parse(html)
    if st != 200 or 'MEMBERS' not in values or 'content' not in verbatim:
        raise RuntimeError(f'[{key}] HTTP {st} {path} — the members template did not render; nothing is filed')
    print(f'    [{key}] HTTP {st} {path} — reading_time {values["MEMBERS"].get("reading_time")!r}, '
          f'field {values["MEMBERS"].get("reading_time_field")!r}, box '
          f'{"PRESENT" if "gh-post-upgrade-cta" in verbatim["content"] else "absent"}')
    return {'template': key, 'path': path, 'http': st, 'values': values, 'raw': raw, 'verbatim': verbatim,
            'head': head_of(html), 'input': dict(inputs, members_post=post_input)}


def members_phase(g, gi, inputs):
    """Two Paid-members-only posts, rendered logged out and deleted in `finally`; on T3 (Ghost 5) alone, the long
    one again with Subscription access set to Nobody, restored in its own `finally` and read back. The control for
    the toggle is the same page before it."""
    out, created = {}, []
    long_, short = members_bodies()
    try:
        for which, paragraphs, cut in (('long', long_, PREVIEW_PARAGRAPHS), ('short', short, None)):
            post = members_post(g, which, paragraphs, cut)
            created.append(post['id'])
            print(f'    [members] created /{post["slug"]}/ (paid, template {MEMBERS_TEMPLATE})')
            post_input = members_input(g, post, cut)
            out[f'members-{which}'] = render_members(g, f'members-{which}', f'/{post["slug"]}/', inputs, post_input)
        if g.major == '5':
            path = out['members-long']['path']
            before = admin_members(gi)
            previous = staff_setting(g, 'members_signup_access')
            try:
                g.api('PUT', 'settings/', {'settings': [{'key': 'members_signup_access', 'value': 'none'}]})
                time.sleep(2)
                after = admin_members(gi)
                print(f'    [members] Subscription access {previous!r} -> {after["members_signup_access"]!r}')
                rec = render_members(g, 'members-long-nobody', path, inputs, out['members-long']['input']['members_post'])
                rec['input'] = dict(rec['input'], admin_settings_before=before, admin_settings_nobody=after)
                out['members-long-nobody'] = rec
            finally:
                g.api('PUT', 'settings/', {'settings': [{'key': 'members_signup_access', 'value': previous}]})
                restored = staff_setting(g, 'members_signup_access')
                print(f'    [members] Subscription access RESTORED -> {restored!r}')
                if restored != previous:
                    raise RuntimeError(f'Subscription access did not come back: {restored!r}, not {previous!r} — '
                                       'put it right in Ghost admin before re-running')
    finally:
        # every delete is attempted, whichever fails, and each is read back as gone
        failed = []
        for pid in created:
            try:
                g.api('DELETE', f'posts/{pid}/')
                g.api('GET', f'posts/{pid}/')
                failed.append(f'{pid} is still there after DELETE')
            except urllib.error.HTTPError as e:
                if e.code != 404:
                    failed.append(f'{pid}: HTTP {e.code}')
        print(f'    [members] deleted {len(created) - len(failed)} of {len(created)} probe posts, read back as gone')
        if failed:
            raise RuntimeError(f'probe posts left behind: {"; ".join(failed)} — delete them in Ghost admin')
    return out


def feed_picks(g):
    """Story 5.19: three public posts in an order that is neither date order — second, third, first newest."""
    _, d = g.content('posts/?limit=3&fields=id,slug,title,published_at&filter=visibility:public'
                     '&order=published_at%20desc')
    rows = d.get('posts') or []
    if len(rows) < 3:
        raise RuntimeError(f'FEED needs three public posts to pick; the site answered {len(rows)}')
    return [{k: r[k] for k in ('id', 'slug', 'title', 'published_at')} for r in (rows[1], rows[2], rows[0])]


def picks_block(picks):
    return ''.join('{{#get "posts" filter="id:%s" limit="1"}}{{#foreach posts}}{{slug}},{{/foreach}}{{/get}}' % p['id']
                   for p in picks)


def zip_theme(sizes, uploaded_url, picks):
    pkg = {
        "name": "inflozo-probe-shim",
        "description": "AD-23 recording surface for Story 4.3's Ghost helper shim",
        "version": "1.0.0",
        "engines": {"ghost": ">=5.0.0"},
        "license": "MIT",
        "keywords": ["ghost", "theme", "ghost-theme"],
        "author": {"name": "Inflozo", "email": "hello@inflozo.com"},
        "config": {
            "posts_per_page": 12,
            "card_assets": True,
            # FR-J2's normative map, read from the library (NFR-6(c2))
            "image_sizes": {k: {"width": w} for k, w in sizes.items()},
        },
    }
    index_block = (img_url_block(sizes, 'hosted', f'"{uploaded_url}"') + '\n\n'
                   + img_url_block(sizes, 'external', '"https://static.ghost.org/v5.0.0/images/publication-cover.jpg"') + '\n\n'
                   + img_url_block(sizes, 'relative', '"/content/images/2026/01/relative-probe.jpg"'))
    post_block = img_url_block(sizes, 'feature', 'feature_image')

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(THEME):
            for f in sorted(files):
                full = os.path.join(root, f)
                rel = os.path.relpath(full, THEME)
                data = open(full, 'rb').read()
                if rel == 'index.hbs':
                    data = data.replace(b'__IMG_URL_BLOCK__', index_block.encode())
                    data = data.replace(b'__FEED_PICKS__', picks_block(picks).encode())
                    data = data.replace(b'__FEED_IDS__', ','.join(p['id'] for p in picks).encode())
                if rel == 'post.hbs':
                    data = data.replace(b'__IMG_URL_BLOCK__', post_block.encode())
                z.writestr(rel, data)
        z.writestr('package.json', json.dumps(pkg, indent=2) + '\n')
    return buf.getvalue()


# ── reading a rendered template back ──────────────────────────────────────────
PRE = lambda html, ident: (re.search(rf'<pre id="{ident}">(.*?)</pre>', html, re.S) or [None, None])[1]

def parse(html):
    """`GROUP|name=[value]` lines out of <pre id="probe">, plus every <pre id="raw-*"> verbatim."""
    out, raw, verbatim = {}, {}, {}
    body = PRE(html, 'probe')
    if body:
        # One regex over the WHOLE block, not line by line: `{{excerpt}}` is multi-line, so a
        # per-line match dropped it silently — a recording of nothing that still looked like a pass.
        # A value runs to the `]` that precedes the next `GROUP|name=[` or the end of the block.
        for m in re.finditer(r'^([A-Z_]+)\|([a-z0-9_]+)=\[(.*?)\][ \t]*$'
                             r'(?=\s*(?:[A-Z_]+\|[a-z0-9_]+=\[|\Z))',
                             body, re.S | re.M):
            out.setdefault(m.group(1), {})[m.group(2)] = unescape(m.group(3))
    for m in re.finditer(r'<pre id="raw-([a-z0-9-]+)">(.*?)</pre>', html, re.S):
        raw[m.group(1)] = unescape(m.group(2))
    for m in re.finditer(r'<pre id="verbatim-([a-z0-9-]+)">(.*?)</pre>', html, re.S):
        verbatim[m.group(1)] = m.group(2)
    return out, raw, verbatim


def unescape(s):
    return (s.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
             .replace('&quot;', '"').replace('&#x27;', "'").replace('&#39;', "'"))


LEAKED = []


def redact(values):
    """The one value that must never reach a fixture, a snapshot or a test (FR-H5). Its SHAPE is
    the recorded fact — the shim emits an inert placeholder and is asserted against the shape.
    It takes `values` and not the wrapper: the first draft took the wrapper, found no `CORE` key,
    redacted nothing, and wrote a live key to disk. Hence the assertion beside the call."""
    core = values.get('CORE', {})
    key = core.pop('content_api_key', None)
    if key:
        LEAKED.append(key)
        core['content_api_key_shape'] = {
            'length': len(key),
            'charclass': 'hex' if re.fullmatch(r'[0-9a-f]+', key) else 'other',
            'note': 'the value is deliberately absent — FR-H5: a real key has no business in a '
                    'snapshot, a screenshot or a support session',
        }
    return values


def record(g, gi, label):
    print(f'\n{"="*72}\n{label}\n{"="*72}')
    sizes = image_sizes()
    print(f'    image_sizes (read from packages/library/src/vocabulary.ts): {sizes}')

    uploaded = previous_upload(g)
    if uploaded:
        print(f'    image REUSED from the last recording -> {uploaded}')
    else:
        st, res = g.upload_image(make_png(), 'inflozo-shim-probe.png')
        uploaded = res['images'][0]['url']
        print(f'    image uploaded HTTP {st} -> {uploaded}')

    themes = g.api('GET', 'themes/')['themes']
    previous = next((t['name'] for t in themes if t.get('active')), None)
    if previous is None:
        raise RuntimeError('no active theme reported — refusing to activate the probe with nothing to restore')
    picks = feed_picks(g)
    print(f'    FEED picks, in the chosen order: {[p["slug"] for p in picks]}')
    st, res = g.upload_theme(zip_theme(sizes, uploaded, picks))
    name = res['themes'][0]['name']
    print(f'    theme uploaded HTTP {st} -> {name!r} (previous active: {previous!r})')

    out = {}
    try:
        # inside the try, so a failure anywhere after this line still restores the previous theme
        g.api('PUT', f'themes/{name}/activate/')
        print(f'    theme activated')
        time.sleep(2)
        # which resources to render. Chosen from the site itself so the recorder never assumes the
        # seed, and RECORDED, so the fixture says what it was read from.
        _, d = g.content('posts/?limit=all&include=tags,authors&filter=visibility:public'
                         '&order=slug%20asc')
        candidates = d.get('posts') or []
        post = next((x for x in candidates if x.get('feature_image') and x.get('tags')),
                    (candidates or [{}])[0])
        _, d = g.content('tags/?limit=1&filter=visibility:public&order=name%20asc')
        tag = (d.get('tags') or [{}])[0]
        _, d = g.content('authors/?limit=1&order=name%20asc')
        author = (d.get('authors') or [{}])[0]

        # The API rows behind the rendered pages. The contract test needs the INPUT Ghost had, or it
        # can only assert that a string equals itself: `given this published_at, Ghost printed that`.
        inputs = {
            'post': {k: post.get(k) for k in (
                'id', 'slug', 'title', 'url', 'excerpt', 'custom_excerpt', 'feature_image',
                'feature_image_alt', 'published_at', 'updated_at', 'created_at', 'reading_time',
                'visibility', 'featured', 'access')},
            'post_tags': [{k: t.get(k) for k in ('name', 'slug', 'url', 'accent_color', 'visibility')}
                          for t in (post.get('tags') or [])],
            'post_authors': [{k: a.get(k) for k in ('name', 'slug', 'url', 'profile_image')}
                             for a in (post.get('authors') or [])],
            'members': member_counts(g),
            # Story 4.9: the locale file {{t}} read, so the contract test feeds t() Ghost's own question
            'locales_en': json.load(open(os.path.join(THEME, 'locales', 'en.json'))),
            'tag': {k: tag.get(k) for k in ('name', 'slug', 'url', 'description', 'accent_color',
                                            'feature_image', 'visibility')},
            'author': {k: author.get(k) for k in ('name', 'slug', 'url', 'bio', 'profile_image',
                                                  'cover_image', 'website')},
            # Story 5.19: the hand-picked ids in the order the theme asked for them
            'feed_picks': picks,
        }
        # Story 5.20 (§54): the tiers and member flags the MEMBERS rows are asserted against — Content API reads,
        # and Admin settings/ narrowed to MEMBER_KEYS through the integration key the product reads it with
        inputs['tiers'], inputs['tiers_public'], inputs['settings_content'] = content_members(g)
        inputs['admin_settings'] = admin_members(gi)

        targets = [
            ('index', '/'),
            ('index-page-2', '/page/2/'),
            ('post', f'/{post.get("slug", "")}/'),
            ('tag', f'/tag/{tag.get("slug", "")}/'),
            ('author', f'/author/{author.get("slug", "")}/'),
            ('error', '/inflozo-probe-no-such-page/'),
        ]
        for tname, path in targets:
            st, html = g.page(path)
            values, raw, verbatim = parse(html)
            # a non-200 on any template but `error` is error.hbs rendered in its place — its probe
            # block must not be filed under the template that failed
            if st != 200 and tname != 'error':
                values = {}
            if not values:
                print(f'    [{tname}] HTTP {st} {path} — NO PROBE BLOCK (recording NOT written)')
                stale = os.path.join(FIXTURES, f'ghost{g.major}', f'{tname}.json')
                if os.path.exists(stale):
                    os.remove(stale)  # a recording from an earlier run must not pose as this one
                    print(f'    [{tname}] removed the stale recording from an earlier run')
                continue
            # {{content}} is Story 4.4's fixture, not this story's: the recording keeps its SHAPE as
            # evidence and never its body, which is the customer's HTML and not a Ghost fact.
            if 'content' in raw:
                raw['content'] = {'length': len(raw['content']), 'head': raw['content'][:200]}
            if 'TR' in values and tname == 'index':
                want = json.load(open(os.path.join(THEME, 'locales', 'en.json')))['Plain key']
                if values['TR'].get('plain_control') != want:
                    raise RuntimeError(f'TR|plain_control printed {values["TR"].get("plain_control")!r}, not the '
                                       f'locale file\'s {want!r} — {{{{t}}}} is not reading locales/en.json, so no '
                                       'TR row counts (standing rule 2)')
                print(f'    [control] TR|plain_control rendered the locale file\'s value')
            values = redact(values)
            # review 4.9: the assertion runs over everything that is filed — raw and verbatim blocks included
            blob = json.dumps([values, raw, verbatim])
            for leaked in LEAKED:
                assert leaked not in blob, 'redaction failed — a real Content API key reached a fixture'
            out[tname] = {
                'template': tname,
                'path': path,
                'http': st,
                'values': values,
                'raw': raw,
                'verbatim': verbatim,
                'input': inputs,
            }
            print(f'    [{tname}] HTTP {st} {path} — {sum(len(v) for v in values.values())} values, '
                  f'{len(raw)} raw blocks')
        # AFTER every other template, so the two probe posts never sit in a recorded feed
        for key, rec in members_phase(g, gi, inputs).items():
            blob = json.dumps(rec)
            for leaked in LEAKED:
                assert leaked not in blob, 'redaction failed — a real Content API key reached a fixture'
            out[key] = rec
    finally:
        g.api('PUT', f'themes/{previous}/activate/')
        active = next((t['name'] for t in g.api('GET', 'themes/')['themes'] if t.get('active')), None)
        print(f'    theme RESTORED -> {active!r}')
        if active != previous:
            raise RuntimeError(f'the previous theme {previous!r} did not come back — {active!r} is active')
        # owner's ruling, Story 4.7 Q1: the probe theme is deleted in the same cleanup, read back, never assumed
        g.api('DELETE', f'themes/{name}/')
        left = [t['name'] for t in g.api('GET', 'themes/')['themes']]
        print(f'    probe theme DELETED -> installed now: {left}')
        if name in left:
            raise RuntimeError(f'the probe theme {name!r} is still installed after DELETE')

    return {
        'ghost_major': g.major,
        'ghost_version': read_version(g),
        'site': g.url,
        'captured': datetime.date.today().isoformat(),
        'command': COMMAND,
        'image_sizes': sizes,
        'uploaded_image': uploaded,
        'note': 'AD-23: every Ghost fact in this repository enters here. Nothing is written against '
                'a paraphrase of this file and no helper is implemented before its recording exists.',
        'templates': out,
    }


def previous_upload(g):
    """The image the LAST recording sized, if it still answers — so a re-run uploads nothing and the
    'one image' boundary holds per story, not per run (Ghost has no image-delete API)."""
    try:
        rec = json.load(open(os.path.join(FIXTURES, f'ghost{g.major}', 'index.json')))
        url = rec['uploaded_image']
        st, _ = g.page(url[len(g.url):]) if url.startswith(g.url) else (0, '')
        return url if st == 200 else None
    except (OSError, KeyError, ValueError):
        return None


def member_counts(g):
    """The INPUT behind {{total_members}} and {{total_paid_members}}. MEASUREMENTS §15f read the
    brackets out of `core/frontend/utils/member-count.js`; this records the count the two helpers
    were rendered AT, so the shim's bracket function is asserted against a real pairing rather than
    against a string that trivially equals itself."""
    out = {}
    for label, q in (('total', 'members/?limit=1'),
                     ('paid', 'members/?limit=1&filter=status:paid'),
                     ('free', 'members/?limit=1&filter=status:free'),
                     ('comped', 'members/?limit=1&filter=status:comped')):
        try:
            out[label] = g.api('GET', q)['meta']['pagination']['total']
        except Exception as e:
            out[label] = f'unavailable: {type(e).__name__}'
    return out


def write_fixture_index(fixtures):
    """A generated module so `contract.test.ts` can READ the recordings inside a core package:
    AD-1 bans `node:fs` there and the test-file exemption gives back only `node:test` and
    `node:assert`, so a static import is the only door. DERIVED from what is on disk — a hand-written
    import list is exactly the thing that goes stale when a template is added (standing rule 4)."""
    found = []
    for major in sorted(os.listdir(fixtures)):
        d = os.path.join(fixtures, major)
        if not os.path.isdir(d) or not major.startswith('ghost'):
            continue
        for f in sorted(os.listdir(d)):
            if f.endswith('.json'):
                found.append((major, f[:-5]))
    ident = lambda m, t: (m + '_' + t).replace('-', '_')
    lines = [
        '// GENERATED by `' + COMMAND + '` — do not edit by hand.',
        '//',
        "// AD-23's recordings, reachable from inside a core package. Every Ghost fact this repository",
        '// relies on enters through the files imported below; nothing is written against a paraphrase',
        '// of them. `recording()` refuses by name rather than returning undefined, because standing',
        '// rule 2 is that a contract test with no recording FAILS — it never skips and never passes',
        '// vacuously.',
        '',
    ]
    for m, t in found:
        lines.append(f"import {ident(m, t)} from './{m}/{t}.json' with {{ type: 'json' }}")
    lines += [
        '',
        'export const CAPTURE_COMMAND = ' + json.dumps(COMMAND),
        '',
        'export const RECORDINGS: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {',
    ]
    by_major = {}
    for m, t in found:
        by_major.setdefault(m, []).append(t)
    for m, ts in by_major.items():
        lines.append(f'  {m}: {{ ' + ', '.join(f"{json.dumps(t)}: {ident(m, t)}" for t in ts) + ' },')
    lines += ['}', '']
    with open(os.path.join(fixtures, 'index.ts'), 'w') as f:
        f.write('\n'.join(lines))
    return found


def read_version(g):
    try:
        return g.api('GET', 'site/')['site']['version']
    except Exception:
        return 'unknown'


if __name__ == '__main__':
    env = load_env()
    failed = False
    for M in (sys.argv[1:] or ['5', '6']):
        try:
            g = Ghost(env[f'GHOST{M}_URL'], env[f'GHOST{M}_STAFF_ACCESS_TOKEN'], M,
                      env[f'GHOST{M}_CONTENT_API_KEY'])
            # Story 5.20: the integration key reads Admin settings/ as probeSite does; it writes nothing here
            gi = Ghost(env[f'GHOST{M}_URL'], env[f'GHOST{M}_ADMIN_API_KEY'], M, env[f'GHOST{M}_CONTENT_API_KEY'])
            rec = record(g, gi, f'Ghost {M} — {env[f"GHOST{M}_URL"]}')
            d = os.path.join(FIXTURES, f'ghost{M}')
            os.makedirs(d, exist_ok=True)
            for tname, body in rec['templates'].items():
                body = dict(body)
                body.update({k: rec[k] for k in ('ghost_major', 'ghost_version', 'site',
                                                 'captured', 'command', 'image_sizes',
                                                 'uploaded_image', 'note')})
                with open(os.path.join(d, f'{tname}.json'), 'w') as f:
                    json.dump(body, f, indent=2, sort_keys=True)
                    f.write('\n')
            print(f'\n    wrote {len(rec["templates"])} recordings to packages/ghost-shim/fixtures/ghost{M}/')
            found = write_fixture_index(FIXTURES)
            print(f'    regenerated packages/ghost-shim/fixtures/index.ts over {len(found)} recordings')
        except urllib.error.HTTPError as e:
            failed = True
            print(f'  HTTP {e.code}: {e.read()[:400].decode("utf8", "replace")}')
        except Exception as e:
            failed = True
            print(f'  ERROR: {type(e).__name__}: {e}')
    # a partial recording must not look like a complete one to a caller or a script
    sys.exit(1 if failed else 0)
