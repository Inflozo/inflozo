#!/usr/bin/env python3
"""VERIFY-AT-BUILD item 47 — the per-template {{#get}} abort threshold.

    python3 tools/probe/run-verify-47.py

R-20 caps hand-picked order at "about twelve per section" pending this measurement.
§29d proved filter="id:[...]" discards list order, so honouring "picked order is drawn
order" costs one single-id {{#get}} per picked item. appendix-b1 §5 says a slow
{{#get}} is ABORTED: empty collection + <span data-aborted-get-helper> + the
X-Ghost-Degraded-Render response header.

Method: one theme, five templates, each carrying a different number of DISTINCT
single-id gets on one page (1, 6, 12, 18, 24). Distinct ids so nothing is served
from a memoised identical query. Renders each, three times, and records wall time,
the number of gets that actually resolved, whether the abort marker appeared and
whether the degraded-render header was set. Restores the previously active theme.
"""
import os, re, sys, time, json, hmac, hashlib, base64, zipfile, io, uuid, shutil
import urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
THEME = os.path.join(HERE, 'theme-47')

# template file -> how many single-id gets it carries
LADDER = [('index.hbs', 1), ('tag.hbs', 8), ('author.hbs', 16),
          ('page.hbs', 24), ('post.hbs', 33)]
REPEATS = 3
# --identical repeats ONE id instead of walking distinct ones. Ghost 6.x dedups
# identical {{#get}} queries within a single render (get.js `_queryCache`);
# Ghost 5.x has no such cache. The two runs together separate real query cost
# from that dedup, and 33 is every distinct post on the seeded fixture.
IDENTICAL = '--identical' in sys.argv


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

    def api(self, method, path, body=None):
        req = urllib.request.Request(f'{self.url}/ghost/api/admin/{path}',
            data=json.dumps(body).encode() if body is not None else None, method=method,
            headers=self._h({'Content-Type': 'application/json'}))
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r) if r.status != 204 else {}

    def upload(self, zip_bytes, filename):
        bnd = '----inflozo' + uuid.uuid4().hex
        body = (f'--{bnd}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\n'
                f'Content-Type: application/zip\r\n\r\n').encode() + zip_bytes + f'\r\n--{bnd}--\r\n'.encode()
        req = urllib.request.Request(f'{self.url}/ghost/api/admin/themes/upload/', data=body, method='POST',
                                     headers=self._h({'Content-Type': f'multipart/form-data; boundary={bnd}'}))
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.status, json.load(r)

    def timed_page(self, path):
        """Returns (status, seconds, headers, body)."""
        req = urllib.request.Request(self.url + path,
                                     headers={'User-Agent': 'inflozo-probe-47',
                                              'Cache-Control': 'no-cache'})
        t0 = time.perf_counter()
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                body = r.read().decode('utf8', 'replace')
                return r.status, time.perf_counter() - t0, dict(r.headers), body
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf8', 'replace')
            return e.code, time.perf_counter() - t0, dict(e.headers), body


def zip_dir(path):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(path):
            for f in sorted(files):
                full = os.path.join(root, f)
                z.write(full, os.path.relpath(full, path))
    return buf.getvalue()


def build_theme(ids):
    """Write theme-47 with one template per ladder rung, using DISTINCT ids."""
    shutil.rmtree(THEME, ignore_errors=True)
    os.makedirs(os.path.join(THEME, 'assets', 'css'), exist_ok=True)
    open(os.path.join(THEME, 'package.json'), 'w').write(json.dumps({
        "name": "inflozo-probe-47", "description": "VERIFY item 47 — {{#get}} abort threshold",
        "version": "1.0.0", "engines": {"ghost": ">=5.0.0"}, "license": "MIT",
        "keywords": ["ghost", "theme", "ghost-theme"],
        "author": {"name": "Inflozo", "email": "hello@inflozo.com"},
        "config": {"posts_per_page": 12, "card_assets": True}}, indent=2))
    open(os.path.join(THEME, 'assets', 'css', 'screen.css'), 'w').write('body{font:14px monospace}\n')
    open(os.path.join(THEME, 'default.hbs'), 'w').write(
        '<!DOCTYPE html>\n<html lang="{{@site.locale}}"><head><meta charset="utf-8">\n'
        '<title>{{meta_title}}</title>\n'
        '<link rel="stylesheet" href="{{asset "css/screen.css"}}">{{ghost_head}}</head>\n'
        '<body class="{{body_class}}"><main>{{{body}}}</main>{{ghost_foot}}</body></html>\n')

    for fname, n in LADDER:
        blocks = []
        for i in range(n):
            pid = ids[0] if IDENTICAL else ids[i % len(ids)]
            # one single-id get per pick — exactly the shape R-20 costs
            blocks.append(
                f'{{{{#get "posts" filter="id:{pid}" limit="1"}}}}'
                f'{{{{#foreach posts}}}}<i class="hit">{i}</i>{{{{/foreach}}}}'
                f'{{{{/get}}}}')
        open(os.path.join(THEME, fname), 'w').write(
            f'<pre id="probe">template={fname} gets={n}</pre>\n' + '\n'.join(blocks) + '\n')


def run(g, label, results):
    print(f'\n{"="*74}\n{label}\n{"="*74}')

    posts = g.api('GET', 'posts/?limit=all&fields=id,slug,title')['posts']
    ids = [p['id'] for p in posts]
    print(f'    posts available: {len(ids)}   mode: {"IDENTICAL id x N" if IDENTICAL else "N distinct ids"}')
    if not ids:
        print('    FAIL — no posts to query'); return

    build_theme(ids)

    themes = g.api('GET', 'themes/')['themes']
    previous = next((t['name'] for t in themes if t.get('active')), None)
    print(f'    previously active theme: {previous!r}')

    st, res = g.upload(zip_dir(THEME), 'inflozo-probe-47.zip')
    name = res['themes'][0]['name']
    print(f'    uploaded {name!r} HTTP {st}')
    for w in (res['themes'][0].get('gscan') or {}).get('errors', [])[:5]:
        print(f'    gscan error: {w}')
    g.api('PUT', f'themes/{name}/activate/')
    time.sleep(3)

    # routes for each rung: index / a tag / an author / a page / a post
    tags = g.api('GET', 'tags/?limit=1&filter=visibility:public')['tags']
    authors = g.api('GET', 'users/?limit=1')['users']
    pages = g.api('GET', 'pages/?limit=1&filter=status:published&fields=id,slug')['pages']
    a_post = next((p for p in posts if p.get('slug')), None)
    route = {
        'index.hbs': '/',
        'tag.hbs':  f'/tag/{tags[0]["slug"]}/' if tags else None,
        'author.hbs': f'/author/{authors[0]["slug"]}/' if authors else None,
        'page.hbs': f'/{pages[0]["slug"]}/' if pages else None,
        'post.hbs': f'/{a_post["slug"]}/' if a_post else None,
    }

    print(f'\n    {"template":<12}{"gets":>5}{"route":<26}{"HTTP":>6}{"best s":>9}'
          f'{"median s":>10}{"resolved":>10}{"aborted":>9}{"degraded":>10}')
    try:
        for fname, n in LADDER:
            path = route.get(fname)
            if not path:
                print(f'    {fname:<12}{n:>5}  (no route available — skipped)'); continue
            times, last = [], None
            for _ in range(REPEATS):
                code, secs, hdrs, body = g.timed_page(path)
                times.append(secs); last = (code, hdrs, body)
                time.sleep(0.5)
            code, hdrs, body = last
            resolved = len(re.findall(r'<i class="hit">', body))
            aborted = len(re.findall(r'data-aborted-get-helper', body))
            degraded = hdrs.get('X-Ghost-Degraded-Render') or hdrs.get('x-ghost-degraded-render') or '-'
            times.sort()
            median = times[len(times)//2]
            print(f'    {fname:<12}{n:>5}{path:<26}{code:>6}{times[0]:>9.3f}'
                  f'{median:>10.3f}{resolved:>10}{aborted:>9}{degraded:>10}')
            results.append(dict(target=label, template=fname, gets=n, route=path, http=code,
                                best=round(times[0], 3), median=round(median, 3),
                                resolved=resolved, aborted=aborted, degraded=degraded))
    finally:
        if previous:
            g.api('PUT', f'themes/{previous}/activate/')
            print(f'\n    restored {previous!r}')
        try:
            g.api('DELETE', f'themes/{name}/')
            print(f'    deleted probe theme {name!r}')
        except Exception as e:
            print(f'    could not delete probe theme: {e}')


def main():
    e = load_env()
    results = []
    for pfx, label in (('GHOST6', 'T1 · ghost6.inflozo.com'), ('GHOST5', 'T3 · ghost5.inflozo.com')):
        if not e.get(f'{pfx}_URL'):
            print(f'\n{label}: no URL in .env — skipped'); continue
        g = Ghost(e[f'{pfx}_URL'], e[f'{pfx}_STAFF_ACCESS_TOKEN'], e[f'{pfx}_MAJOR'], e.get(f'{pfx}_CONTENT_API_KEY', ''))
        try:
            run(g, f'{label}  ({e.get(pfx + "_VERSION", "?")})', results)
        except Exception as ex:
            print(f'{label}: FAILED {type(ex).__name__}: {ex}')
    print('\n' + json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
