#!/usr/bin/env python3
"""E-2 — `feature_image_caption`: its stored shape, `{{…}}` vs `{{{…}}}`, and gscan on the stash.

    python3 tools/probe/run-verify-e2.py

WHY. R-10 #7 says A24 and A26 need "a second triple-stash carve-out" to AD-5(2) — and marks
itself NOT APPLICABLE until this runs. AD-5(2) exists because a triple stash is an XSS surface,
so the carve-out is only justified if Ghost genuinely stores HTML here. If the field is plain
text, the carve-out is unnecessary and R-10 #7 is withdrawn instead of applied. Either answer
is useful; guessing is not (standing rule 1).

METHOD. Two posts per host:

    SUBJECT   feature_image_caption carrying real HTML — a link and an <em>
    CONTROL   feature_image_caption carrying plain text with NO markup at all

Then one theme printing BOTH stashes around each, rendered on the live site, plus gscan 4.49.7
and 6.4.2 over that theme.

THE CONTROL IS THE POINT (standing rule 2). On the control post the two stashes MUST render
identically — plain text has nothing to escape. If they differ, the probe is measuring its own
markup and not Ghost, and the subject result is void. Three probes in one session have already
returned a convincing "held" that was really a broken test.

Cleans up after itself: the previously active theme is restored and both probe posts deleted.
"""
import os, re, sys, json, time, hmac, hashlib, base64, zipfile, io, uuid, shutil, subprocess
import urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
THEME = os.path.join(HERE, 'theme-e2')
STRESS = os.path.join(ROOT, 'tools', 'stress')

# Deliberately mixed: an anchor, an <em>, a <strong>, a <script> and an entity. Which of these
# survive STORAGE and which survive RENDER are different questions and this separates them.
CAPTION_HTML = ('Photo by <a href="https://example.com/x">A Person</a> &amp; <em>em</em> '
                '<strong>strong</strong> <b>b</b><script>alert(1)</script>')
CAPTION_PLAIN = 'Photo by A Person and friends'
KEEP = '--keep' in sys.argv


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
        h.update(extra or {}); return h

    def api(self, method, path, body=None):
        req = urllib.request.Request(
            f'{self.url}/ghost/api/admin/{path}',
            data=json.dumps(body).encode() if body is not None else None, method=method,
            headers=self._h({'Content-Type': 'application/json'}))
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r) if r.status != 204 else {}

    def content(self, path):
        sep = '&' if '?' in path else '?'
        req = urllib.request.Request(
            f'{self.url}/ghost/api/content/{path}{sep}key={self.ckey}',
            headers={'Accept-Version': self.av})
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)

    def upload(self, zip_bytes, filename):
        bnd = '----inflozo' + uuid.uuid4().hex
        body = (f'--{bnd}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\n'
                f'Content-Type: application/zip\r\n\r\n').encode() + zip_bytes + f'\r\n--{bnd}--\r\n'.encode()
        req = urllib.request.Request(f'{self.url}/ghost/api/admin/themes/upload/', data=body,
                                     method='POST',
                                     headers=self._h({'Content-Type': f'multipart/form-data; boundary={bnd}'}))
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.status, json.load(r)

    def page(self, path):
        req = urllib.request.Request(self.url + path,
                                     headers={'User-Agent': 'inflozo-probe-e2',
                                              'Cache-Control': 'no-cache'})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.status, r.read().decode('utf8', 'replace')
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode('utf8', 'replace')


def zip_dir(path):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(path):
            for f in sorted(files):
                full = os.path.join(root, f)
                z.write(full, os.path.relpath(full, path))
    return buf.getvalue()


def build_theme(triple=True):
    """post.hbs prints the caption BOTH ways, in markers a regex can lift out exactly.

    triple=False writes the SAME theme with the triple stash removed. That is the control for the
    gscan sub-question: if both variants produce an identical rule set, gscan is genuinely
    indifferent to the triple stash rather than merely drowned out by this theme's own noise.
    """
    shutil.rmtree(THEME, ignore_errors=True)
    os.makedirs(os.path.join(THEME, 'assets', 'css'), exist_ok=True)
    open(os.path.join(THEME, 'package.json'), 'w').write(json.dumps({
        "name": "inflozo-probe-e2", "description": "E-2 — feature_image_caption stash behaviour",
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
    for f in ('index.hbs', 'tag.hbs', 'author.hbs', 'page.hbs', 'error.hbs'):
        open(os.path.join(THEME, f), 'w').write('<h1>{{title}}</h1>\n')
    # The two stashes, each fenced by a marker the extractor can find unambiguously.
    tpl = ('<div id="tpl">[[[{{{feature_image_caption}}}]]]</div>\n' if triple
           else '<div id="tpl">[[[{{feature_image_caption}}]]]</div>\n')
    open(os.path.join(THEME, 'post.hbs'), 'w').write(
        '{{#post}}\n'
        '<div id="dbl">[[[{{feature_image_caption}}]]]</div>\n'
        + tpl +
        '{{/post}}\n')


def extract(html, marker):
    m = re.search(rf'<div id="{marker}">\[\[\[(.*?)\]\]\]</div>', html, re.S)
    return m.group(1) if m else None


def make_post(g, title, caption):
    body = {"posts": [{
        "title": title,
        "html": "<p>probe body</p>",
        "status": "published",
        "feature_image": "https://static.ghost.org/v5.0.0/images/publication-cover.jpg",
        "feature_image_alt": "probe",
        "feature_image_caption": caption,
    }]}
    r = g.api('POST', 'posts/?source=html', body)
    return r['posts'][0]


def gscan_rules(out):
    """The rule codes only, so two runs can be compared without their timings."""
    return sorted(re.findall(r'(?:ERROR|WARN)\s+(\S+)', '\n'.join(out.get('output', []))))


def gscan_check():
    """Both bundled gscan majors over the probe theme — via tools/stress/gate.js.

    Deliberately NOT a second gscan runner. gate.js already encodes the thing this project got
    wrong once: the gscan version a Ghost major BUNDLES is the input, not gscan's own spec flag
    (4.49.7 for Ghost 5, 6.4.2 for Ghost 6). A private copy here would be a second place for that
    to drift.
    """
    try:
        r = subprocess.run(['node', os.path.join(STRESS, 'gate.js'), THEME],
                           cwd=STRESS, capture_output=True, text=True, timeout=600)
        out = (r.stdout or '').strip()
        return {'output': out.splitlines() or [(r.stderr or '')[-400:]]}
    except Exception as e:
        return {'_error': str(e)}


def run(g, label, results):
    print(f'\n{"=" * 78}\n{label}\n{"=" * 78}')
    created, previous, name = [], None, None
    try:
        subject = make_post(g, f'E2 subject {uuid.uuid4().hex[:6]}', CAPTION_HTML)
        control = make_post(g, f'E2 control {uuid.uuid4().hex[:6]}', CAPTION_PLAIN)
        created = [subject, control]

        # ── 1. the stored shape, straight back off both APIs ──────────────────
        adm = g.api('GET', f'posts/{subject["id"]}/?fields=id,feature_image_caption')['posts'][0]
        con = g.content(f'posts/{subject["id"]}/?fields=id,feature_image_caption')['posts'][0]
        stored_admin, stored_content = adm['feature_image_caption'], con['feature_image_caption']
        html_survived = '<a ' in (stored_admin or '')
        print(f'  sent      : {CAPTION_HTML}')
        print(f'  Admin API : {stored_admin!r}')
        print(f'  Content   : {stored_content!r}')
        print(f'  → markup {"SURVIVES verbatim — the field STORES HTML" if html_survived else "was STRIPPED — the field is plain text"}')

        # ── 2. render both stashes ────────────────────────────────────────────
        build_theme()
        themes = g.api('GET', 'themes/')['themes']
        previous = next((t['name'] for t in themes if t.get('active')), None)
        st, res = g.upload(zip_dir(THEME), 'inflozo-probe-e2.zip')
        name = res['themes'][0]['name']
        g.api('PUT', f'themes/{name}/activate/')
        print(f'  theme     : uploaded+activated {name!r} (was {previous!r})')
        time.sleep(2)

        rows = {}
        for tag, post in (('subject', subject), ('control', control)):
            code, body = g.page('/' + post['slug'] + '/')
            rows[tag] = (extract(body, 'dbl'), extract(body, 'tpl'), code)
            print(f'  {tag:8s}  HTTP {code}')
            if tag == 'subject':
                raw = re.search(r'<div id="dbl">.*?</div>\s*<div id="tpl">.*?</div>', body, re.S)
                print(f'      RAW  -> {raw.group(0)[:400] if raw else None!r}')
            print(f'      {{{{  …  }}}}  -> {rows[tag][0]!r}')
            print(f'      {{{{{{ … }}}}}}  -> {rows[tag][1]!r}')

        # ── 3. THE CONTROL. If it does not hold, nothing above is a result. ───
        c_dbl, c_tpl, _ = rows['control']
        control_ok = c_dbl is not None and c_dbl == c_tpl
        print(f'\n  CONTROL   : plain caption renders identically both ways — '
              f'{"PASS" if control_ok else "FAIL"}')
        if not control_ok:
            print('  ** CONTROL FAILED — the subject result below is VOID (standing rule 2). **')

        s_dbl, s_tpl, _ = rows['subject']
        escaped = s_dbl != s_tpl
        print(f'  SUBJECT   : the two stashes {"DIFFER — {{ }} escapes the markup" if escaped else "agree"}')

        # ── 4. gscan over a theme that carries a triple stash ─────────────────
        with_triple = gscan_check()
        build_theme(triple=False)                 # same theme, triple stash removed
        without = gscan_check()
        build_theme(triple=True)                  # leave it as the probe found it
        r_with, r_without = gscan_rules(with_triple), gscan_rules(without)
        gscan_blind = r_with == r_without
        for line in with_triple.get('output', []):
            print(f'  gscan     | {line}')
        print(f'  GSCAN CONTROL: identical rule set with and without the triple stash — '
              f'{"PASS — gscan is indifferent to it" if gscan_blind else "FAIL — it is NOT indifferent"}')
        if not gscan_blind:
            print(f'      with    {r_with}\n      without {r_without}')
        gs = {'with_triple': with_triple, 'rules_with': r_with, 'rules_without': r_without,
              'gscan_indifferent_to_triple_stash': gscan_blind}

        results[label] = {
            'stored_admin': stored_admin, 'stored_content': stored_content,
            'stores_html': html_survived, 'control_ok': control_ok,
            'double': s_dbl, 'triple': s_tpl, 'escapes': escaped, 'gscan': gs,
            'gscan_indifferent': gscan_blind,
        }
    finally:
        if name and previous:
            try:
                g.api('PUT', f'themes/{previous}/activate/'); print(f'  restored  : {previous!r}')
            except Exception as e:
                print(f'  ! could not restore {previous!r}: {e}')
        if name and not KEEP:
            try:
                g.api('DELETE', f'themes/{name}/')
            except Exception:
                pass
        for p in created:
            if KEEP:
                break
            try:
                g.api('DELETE', f'posts/{p["id"]}/')
            except Exception as e:
                print(f'  ! could not delete probe post {p["id"]}: {e}')


def main():
    e = load_env()
    results = {}
    for pfx, label in (('GHOST6', 'T1 — ghost6.inflozo.com'), ('GHOST5', 'T3 — ghost5.inflozo.com')):
        try:
            # STAFF token, not the Admin API key: theme upload/activate is staff-level and an
            # integration key returns 403 on Ghost 6 and 501 on Ghost 5. run-verify-47.py hit the
            # same wall and this is the same fix.
            g = Ghost(e[f'{pfx}_URL'], e[f'{pfx}_STAFF_ACCESS_TOKEN'], e[f'{pfx}_MAJOR'],
                      e[f'{pfx}_CONTENT_API_KEY'])
            run(g, f'{label}  (Ghost {e[f"{pfx}_VERSION"]})', results)
        except Exception as ex:
            print(f'\n{label}: FAILED — {ex}')

    print(f'\n{"=" * 78}\nVERDICT\n{"=" * 78}')
    if not results:
        print('  no host produced a result'); sys.exit(1)
    voided = [k for k, v in results.items() if not v['control_ok']]
    if voided:
        print(f'  CONTROL FAILED on {voided} — this run is not a result (standing rule 2).')
        sys.exit(1)
    for k, v in results.items():
        print(f'  {k}')
        print(f'      stores HTML          : {v["stores_html"]}')
        print(f'      {{{{ }}}} escapes markup   : {v["escapes"]}')
        print(f'      gscan indifferent to {{{{{{ }}}}}} : {v["gscan_indifferent"]}')
    shutil.rmtree(THEME, ignore_errors=True)
    open(os.path.join(HERE, 'e2-result.json'), 'w').write(json.dumps(results, indent=2))
    print(f'\n  raw -> tools/probe/e2-result.json')


if __name__ == '__main__':
    main()
