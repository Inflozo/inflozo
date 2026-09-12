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
  * the probe theme, uploaded and activated, with the PREVIOUS theme restored at the end — exactly
    as run-verify-all.py already does.
It creates no post, edits no post and touches no setting. The uploaded image URL reaches the theme
through a placeholder substituted at zip time, which is why no content row has to carry it.

NFR-6(c2): the theme's package.json carries FR-J2's NORMATIVE image_sizes map, READ from
packages/library/src/vocabulary.ts rather than restated here, because Ghost's resize behaviour
follows the theme's own map — a recording made under any other map is a faithful recording of the
wrong theme.
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


def zip_theme(sizes, uploaded_url):
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
                if rel == 'post.hbs':
                    data = data.replace(b'__IMG_URL_BLOCK__', post_block.encode())
                z.writestr(rel, data)
        z.writestr('package.json', json.dumps(pkg, indent=2) + '\n')
    return buf.getvalue()


# ── reading a rendered template back ──────────────────────────────────────────
PRE = lambda html, ident: (re.search(rf'<pre id="{ident}">(.*?)</pre>', html, re.S) or [None, None])[1]

def parse(html):
    """`GROUP|name=[value]` lines out of <pre id="probe">, plus every <pre id="raw-*"> verbatim."""
    out, raw = {}, {}
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
    return out, raw


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


def record(g, label):
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
    st, res = g.upload_theme(zip_theme(sizes, uploaded))
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
            'tag': {k: tag.get(k) for k in ('name', 'slug', 'url', 'description', 'accent_color',
                                            'feature_image', 'visibility')},
            'author': {k: author.get(k) for k in ('name', 'slug', 'url', 'bio', 'profile_image',
                                                  'cover_image', 'website')},
        }

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
            values, raw = parse(html)
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
            values = redact(values)
            blob = json.dumps(values)
            for leaked in LEAKED:
                assert leaked not in blob, 'redaction failed — a real Content API key reached a fixture'
            out[tname] = {
                'template': tname,
                'path': path,
                'http': st,
                'values': values,
                'raw': raw,
                'input': inputs,
            }
            print(f'    [{tname}] HTTP {st} {path} — {sum(len(v) for v in values.values())} values, '
                  f'{len(raw)} raw blocks')
    finally:
        g.api('PUT', f'themes/{previous}/activate/')
        print(f'    theme RESTORED -> {previous!r}')

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
            rec = record(g, f'Ghost {M} — {env[f"GHOST{M}_URL"]}')
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
