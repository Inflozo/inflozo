#!/usr/bin/env python3
"""VERIFY-AT-BUILD item 13 — the four docs-vs-code conflicts, at RUNTIME.

`research-ghost-binding-contexts.md` §13 names four places where Ghost's docs and
Ghost's code disagree, and follows the code in each. Its own §1179 admits why that
is not enough: "Nothing was executed at runtime … No Ghost 5 or Ghost 6 instance
was booted to observe actual rendering."

This boots both. It uploads a probe theme, activates it, reads what Ghost renders,
and restores the previous theme afterwards.

The item BLOCKS E9. Conflict 1 is why: if `@even`/`@odd` parity is inverted the
wrong way, every zebra-striped design in the library stripes backwards, and the
error is invisible until a human looks at a real site.

    python3 tools/probe/run-verify-13.py
"""
import os, re, sys, time, json, hmac, hashlib, base64, zipfile, io, uuid
import urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
THEME = os.path.join(HERE, 'theme-13')
ZIPNAME = 'inflozo-probe-13.zip'          # Ghost identifies a theme by FILENAME (AD-19)


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
    def __init__(self, url, token, major):
        self.url, self.token, self.av = url.rstrip('/'), token, f'v{major}.0'

    def _hdr(self, extra=None):
        h = {'Authorization': 'Ghost ' + jwt(self.token), 'Accept-Version': self.av}
        h.update(extra or {})
        return h

    def api(self, method, path, body=None):
        req = urllib.request.Request(
            f'{self.url}/ghost/api/admin/{path}',
            data=json.dumps(body).encode() if body is not None else None,
            method=method, headers=self._hdr({'Content-Type': 'application/json'}))
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r) if r.status != 204 else {}

    def upload_theme(self, zip_bytes, filename):
        bnd = '----inflozo' + uuid.uuid4().hex
        body = (f'--{bnd}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\n'
                f'Content-Type: application/zip\r\n\r\n').encode() + zip_bytes + f'\r\n--{bnd}--\r\n'.encode()
        req = urllib.request.Request(
            f'{self.url}/ghost/api/admin/themes/upload/', data=body, method='POST',
            headers=self._hdr({'Content-Type': f'multipart/form-data; boundary={bnd}'}))
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)

    def page(self, path):
        req = urllib.request.Request(self.url + path, headers={'User-Agent': 'inflozo-probe'})
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.status, r.read().decode('utf8', 'replace')
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode('utf8', 'replace')


def zip_theme(path):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(path):
            for f in sorted(files):
                full = os.path.join(root, f)
                z.write(full, os.path.relpath(full, path))
    return buf.getvalue()


def probe_block(html):
    m = re.search(r'<pre id="probe">(.*?)</pre>', html, re.S)
    return m.group(1).strip() if m else '(probe block not found)'


def run(label, g):
    print(f'\n{"="*70}\n{label}\n{"="*70}')

    themes = g.api('GET', 'themes/')['themes']
    previous = next((t['name'] for t in themes if t.get('active')), None)
    print(f'  active theme before: {previous}')

    res = g.upload_theme(zip_theme(THEME), ZIPNAME)
    t = res['themes'][0]
    warns = t.get('gscan', {}).get('results', {}).get('warning', []) if isinstance(t.get('gscan'), dict) else []
    print(f'  uploaded as {t["name"]!r}  (Ghost reported {len(warns)} warnings)')

    g.api('PUT', f'themes/{t["name"]}/activate/')
    print(f'  activated {t["name"]}')
    time.sleep(2)

    st, html = g.page('/')
    print(f'\n  --- GET /  (HTTP {st}) ---')
    print('\n'.join('  ' + l for l in probe_block(html).splitlines()))

    st, html = g.page('/this-route-does-not-exist-' + uuid.uuid4().hex[:8] + '/')
    print(f'\n  --- GET /<missing>  (HTTP {st}) — conflict 2 ---')
    print('\n'.join('  ' + l for l in probe_block(html).splitlines()))

    if previous:
        g.api('PUT', f'themes/{previous}/activate/')
        print(f'\n  restored {previous}')
    return True


if __name__ == '__main__':
    env = load_env()
    for major in (sys.argv[1:] or ['5', '6']):
        g = Ghost(env[f'GHOST{major}_URL'], env[f'GHOST{major}_STAFF_ACCESS_TOKEN'], major)
        try:
            run(f'Ghost {major} — {env[f"GHOST{major}_URL"]}', g)
        except urllib.error.HTTPError as e:
            print(f'  HTTP {e.code}: {e.read()[:400].decode("utf8","replace")}')
