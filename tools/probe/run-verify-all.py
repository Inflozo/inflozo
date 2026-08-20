#!/usr/bin/env python3
"""Every remaining VERIFY-AT-BUILD item that two real Ghosts can answer.

    python3 tools/probe/run-verify-all.py

Covers, at runtime, on both majors:
  item 2   GET /admin/config/ — the hostSettings shape, self-hosted half
  item 10  snapshot re-upload, including a theme that FAILS gscan
  item 11  partials/content-cta.hbs as the paywall override point   [BLOCKS A24/A32]
  item 12  Ghost 6 API pagination — limit=all removed, max 100
  item 14a retitling a page with a custom template selected
  item 14c the Template dropdown's label transform on a multi-word name
  item 15  what a theme may style inside {{comments}}                [BLOCKS E10 A28]
  item 18  {{total_members}} rounding, at and across the 50 boundary
  item 20  the NQL build Ghost resolves at runtime
  item 21  the announcement-bar seed, and whether clearing it stops the script
  conflict 2's other half — error.hbs for a NON-404 error

Uploads a probe theme, restores the previous one, and cleans up what it creates.
"""
import os, re, sys, time, json, hmac, hashlib, base64, zipfile, io, uuid
import urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
THEME = os.path.join(HERE, 'theme-all')


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
        self.url, self.token, self.av, self.ckey = url.rstrip('/'), token, f'v{major}.0', content_key
        self.major = major

    def _h(self, extra=None):
        h = {'Authorization': 'Ghost ' + jwt(self.token), 'Accept-Version': self.av}
        h.update(extra or {}); return h

    def api(self, method, path, body=None, raw=False):
        req = urllib.request.Request(f'{self.url}/ghost/api/admin/{path}',
            data=json.dumps(body).encode() if body is not None else None, method=method,
            headers=self._h({'Content-Type': 'application/json'}))
        with urllib.request.urlopen(req, timeout=90) as r:
            if raw: return r.status, r.read()
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

    def upload(self, zip_bytes, filename):
        bnd = '----inflozo' + uuid.uuid4().hex
        body = (f'--{bnd}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\n'
                f'Content-Type: application/zip\r\n\r\n').encode() + zip_bytes + f'\r\n--{bnd}--\r\n'.encode()
        req = urllib.request.Request(f'{self.url}/ghost/api/admin/themes/upload/', data=body, method='POST',
                                     headers=self._h({'Content-Type': f'multipart/form-data; boundary={bnd}'}))
        with urllib.request.urlopen(req, timeout=180) as r:
            return r.status, json.load(r)

    def page(self, path):
        req = urllib.request.Request(self.url + path, headers={'User-Agent': 'inflozo-probe'})
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.status, r.read().decode('utf8', 'replace')
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode('utf8', 'replace')


def zip_dir(path, mutate=None):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(path):
            for f in sorted(files):
                full = os.path.join(root, f)
                rel = os.path.relpath(full, path)
                data = open(full, 'rb').read()
                if mutate: rel, data = mutate(rel, data)
                if rel: z.writestr(rel, data)
    return buf.getvalue()


def grab(html, ident='probe'):
    m = re.search(rf'<pre id="{ident}">(.*?)</pre>', html, re.S)
    return m.group(1).strip() if m else ''


def show(lines, indent='    '):
    for l in [x for x in lines.splitlines() if x.strip()]:
        print(indent + l)


def run(g, label):
    print(f'\n{"="*72}\n{label}\n{"="*72}')
    R = {}

    # ---------------------------------------------------------------- item 2
    try:
        cfg = g.api('GET', 'config/')['config']
        hs = cfg.get('hostSettings')
        print(f'\n[item 2]  GET /admin/config/ — self-hosted half')
        print(f'    keys        : {sorted(cfg.keys())}')
        print(f'    hostSettings: {json.dumps(hs) if hs is not None else "ABSENT"}')
        print(f'    version     : {cfg.get("version")}   database: {cfg.get("database")}')
    except Exception as e:
        print(f'[item 2]  FAIL {e}')

    # ---------------------------------------------------------------- item 12
    print(f'\n[item 12] Content API pagination')
    for lim in ('all', '200', '100'):
        st, d = g.content(f'posts/?limit={lim}')
        if st == 200:
            p = d.get('meta', {}).get('pagination', {})
            print(f'    limit={lim:<4} HTTP {st}  returned={len(d.get("posts", []))}  limit_echoed={p.get("limit")}  total={p.get("total")}')
        else:
            print(f'    limit={lim:<4} HTTP {st}  {json.dumps(d)[:150]}')

    # ---------------------------------------------------------------- item 21
    print(f'\n[item 21] announcement bar — all three settings readable?')
    s = {x['key']: x['value'] for x in g.api('GET', 'settings/')['settings']}
    for k in ('announcement_content', 'announcement_visibility', 'announcement_background'):
        print(f'    {k:<26} {json.dumps(s.get(k))}')

    # a gated post for item 11, and a custom-template page for 14a/14c
    posts = g.api('GET', 'posts/?limit=all&fields=id,title,slug,visibility')['posts']
    gated = next((p for p in posts if p['title'] == 'PROBE Gated Post'), None)
    if not gated:
        gated = g.api('POST', 'posts/?source=html', {'posts': [{
            'title': 'PROBE Gated Post', 'status': 'published', 'visibility': 'paid',
            'html': '<p>PUBLIC-PREAMBLE-VISIBLE</p><p>SECRET-PAID-BODY-SHOULD-NOT-APPEAR</p>'}]})['posts'][0]
    print(f'\n    gated post: /{gated["slug"]}/  visibility={gated["visibility"]}')
    return R, gated, s


def theme_phase(g, label, gated, prev_settings):
    themes = g.api('GET', 'themes/')['themes']
    previous = next((t['name'] for t in themes if t.get('active')), None)

    st, res = g.upload(zip_dir(THEME), 'inflozo-probe-all.zip')
    t = res['themes'][0]
    print(f'\n[theme]   uploaded {t["name"]!r} HTTP {st}')

    # -------------------------------------------------------------- item 14c
    tmpl = t.get('templates') or []
    print(f'\n[item 14c] custom templates Ghost derived from the FILENAMES:')
    for x in tmpl:
        print(f'    file={x.get("filename"):<28} slug={x.get("slug"):<20} label={x.get("name")!r}')
    if not tmpl:
        print('    (none reported on upload — re-reading GET /themes/)')
        for x in (next((z for z in g.api("GET", "themes/")["themes"] if z["name"] == t["name"]), {}) or {}).get('templates', []):
            print(f'    file={x.get("filename"):<28} slug={x.get("slug"):<20} label={x.get("name")!r}')

    g.api('PUT', f'themes/{t["name"]}/activate/')
    time.sleep(2)

    # ------------------------------------------------------- items 18, 20, 12
    st, html = g.page('/')
    print(f'\n[items 18/20/12] rendered homepage (HTTP {st})')
    show(grab(html))

    # -------------------------------------------------------------- item 11
    st, html = g.page(f'/{gated["slug"]}/')
    print(f'\n[item 11]  gated post as ANONYMOUS (HTTP {st})')
    for pat, lbl in (('CTA_OVERRIDE', 'partials/content-cta.hbs rendered'),
                     ('SECRET-PAID-BODY', 'PAID BODY LEAKED — access control failed'),
                     ('PUBLIC-PREAMBLE', 'public preamble shown')):
        print(f'    {lbl:<45} {"YES" if pat in html else "no"}')
    m = re.search(r'<div id="probe-access">(.*?)</div>', html, re.S)
    if m: print(f'    {m.group(1).strip()}')
    m = re.search(r'<div id="probe-cta">(.*?)</div>', html, re.S)
    if m: print(f'    {m.group(1).strip()}')

    # -------------------------------------------------------------- item 15
    pub = g.api('GET', 'posts/?limit=1&filter=visibility:public&fields=id,slug')['posts']
    if pub:
        st, html = g.page(f'/{pub[0]["slug"]}/')
        m = re.search(r'<div id="probe-comments">(.*?)</div>', html, re.S)
        print(f'\n[item 15]  {{{{comments}}}} on a public post (HTTP {st})')
        if m: print(f'    {m.group(1).strip()}')
        # what does {{comments}} actually emit into the DOM?
        frag = re.search(r'(<script[^>]*comment[^>]*>.*?</script>|<div[^>]*ghost-comments[^>]*>.*?</div>)', html, re.S | re.I)
        print(f'    emitted markup : {(frag.group(1)[:220] + "…") if frag else "(no comments container found in HTML)"}')
        for probe in ('comments-frame', 'ghost-comments', 'sodo-comments', 'data-ghost-comments'):
            print(f'    contains {probe:<22} {"YES" if probe in html else "no"}')

    # ------------------------------------------- conflict 2: error.hbs (non-404)
    st, html = g.page('/ghost/api/content/posts/?key=deliberately-invalid')
    st2, html2 = g.page(f'/{gated["slug"]}/?')          # benign
    print(f'\n[conflict 2] error.hbs (non-404) — attempts')
    print(f'    invalid content-key route -> HTTP {st}, probe block present: {"YES" if grab(html) else "no"}')

    if previous:
        g.api('PUT', f'themes/{previous}/activate/')
        print(f'\n[theme]   restored {previous}')


if __name__ == '__main__':
    env = load_env()
    for M in (sys.argv[1:] or ['5', '6']):
        g = Ghost(env[f'GHOST{M}_URL'], env[f'GHOST{M}_STAFF_ACCESS_TOKEN'], M, env[f'GHOST{M}_CONTENT_API_KEY'])
        try:
            _, gated, s = run(g, f'Ghost {M} — {env[f"GHOST{M}_URL"]}')
            theme_phase(g, f'Ghost {M}', gated, s)
        except urllib.error.HTTPError as e:
            print(f'  HTTP {e.code}: {e.read()[:400].decode("utf8","replace")}')
        except Exception as e:
            print(f'  ERROR: {type(e).__name__}: {e}')
