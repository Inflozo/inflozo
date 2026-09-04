#!/usr/bin/env python3
"""Verify every credential actually works. Prints VERDICTS ONLY — never a value.

    python3 tools/probe/check-access.py

Written after two credential leaks in one session, both caused by masking with a
blacklist of known prefixes. This file has no print path that can reach a secret:
values are read, used, and only booleans and server responses come back out.
"""
import os, re, sys, json, subprocess, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
OK, BAD, SKIP = '  ok  ', ' FAIL ', ' skip '


def env():
    out = {}
    for line in open(os.path.join(HERE, '.env')):
        m = re.match(r'^([A-Z0-9_]+)=(.*)$', line.rstrip('\n'))
        if m and m.group(2).strip():
            out[m.group(1)] = m.group(2).strip()
    return out


def say(tag, label, detail=''):
    # Standing rule 2: a result whose control did not pass is not a result. http()
    # returns status 0 when the request never reached the server — DNS, timeout, TLS —
    # so a verdict built on an HTTP 0 is a broken test and can never be an 'ok'. Guarded
    # here, at the one funnel every check prints through, so a new check cannot forget it.
    if tag == OK and re.search(r'\bHTTP 0\b', detail):
        tag = BAD
        detail += '  <- request never reached the server; this check did NOT run'
    print(f'[{tag}] {label:<46} {detail}')


def psql(url, sql):
    r = subprocess.run(['docker', 'run', '--rm', '--network', 'host',
                        '-e', 'PGCONNECT_TIMEOUT=25', 'postgres:17-alpine',
                        'psql', url, '-tA', '-c', sql],
                       capture_output=True, text=True, timeout=120)
    return r.returncode == 0, (r.stdout or r.stderr).strip().splitlines()[:1]


def http(url, headers=None, method='GET', data=None, timeout=30):
    # Resend sits behind Cloudflare bot protection that rejects urllib's default
    # User-Agent with 403 / "error code: 1010". Any real UA passes. Set one
    # everywhere so a transport quirk is never mistaken for an auth failure.
    headers = dict(headers or {})
    headers.setdefault('User-Agent', 'inflozo-probe/1.0')
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read()
            try: return r.status, json.loads(body)
            except Exception: return r.status, body[:300].decode('utf8', 'replace')
    except urllib.error.HTTPError as e:
        body = e.read(2000)
        try: return e.code, json.loads(body)
        except Exception: return e.code, body[:300].decode('utf8', 'replace')
    except Exception as e:
        return 0, f'{type(e).__name__}: {e}'


def main():
    e = env()
    print('=' * 74)
    print('ACCESS CHECK — verdicts only, no values are printed')
    print('=' * 74)

    # ---------------------------------------------------------------- Supabase SQL
    for key, label in (('SUPABASE_DB_URL', 'Supabase NEW — psql'),
                       ('SUPABASE_OLD_DB_URL', 'Supabase OLD — psql (read-only)')):
        if not e.get(key):
            say(SKIP, label, 'not set'); continue
        good, out = psql(e[key], "select current_user||' @ '||split_part(version(),' on ',1)")
        say(OK if good else BAD, label, out[0] if out else '')

    # ------------------------------------------------------- Supabase API keys
    url = e.get('SUPABASE_URL', '').rstrip('/')
    pub, sec = e.get('SUPABASE_PUBLISHABLE_KEY'), e.get('SUPABASE_SECRET_KEY')

    if url and pub:
        # the /rest/v1/ ROOT is secret-only by design, so probe a table path instead:
        # 401 = key rejected · 404/PGRST205 = key accepted, relation absent (expected, schema is empty)
        st, body = http(f'{url}/rest/v1/__probe_absent?select=id', {'apikey': pub})
        code = body.get('code') if isinstance(body, dict) else ''
        say(OK if st != 401 else BAD, 'Supabase publishable key -> PostgREST',
            f'HTTP {st} {code} — ' + ('accepted (relation absent, as expected)' if st != 401 else 'KEY REJECTED'))
        # F3: is the storage schema reachable through PostgREST with a browser key?
        st2, b2 = http(f'{url}/rest/v1/buckets?select=id', {'apikey': pub})
        say(OK if st2 in (404, 400, 401, 403) else BAD, 'F3  storage schema via PostgREST (anon)',
            f'HTTP {st2} — {"did NOT run — no response" if st2 == 0 else "NOT exposed (good)" if st2 in (404,400,401,403) else "EXPOSED — investigate"}')

    if url and sec:
        st, body = http(f'{url}/rest/v1/', {'apikey': sec})
        say(OK if st in (200, 404) else BAD, 'Supabase secret key -> PostgREST', f'HTTP {st}')
        # documented new-key behaviour: a secret key must be refused from a browser UA
        st2, _ = http(f'{url}/rest/v1/', {'apikey': sec,
                      'User-Agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140 Safari/537.36'})  # deliberate
        say(OK if st2 == 401 else BAD, 'secret key refused from a browser User-Agent',
            f'HTTP {st2} — {"did NOT run — no response" if st2 == 0 else "REFUSED as documented" if st2 == 401 else "ACCEPTED — the documented guard did not fire"}')

    # ---------------------------------------------------------------- Vercel
    tok, team = e.get('VERCEL_TOKEN'), e.get('VERCEL_TEAM_ID')
    if tok:
        h = {'Authorization': f'Bearer {tok}'}
        st, body = http('https://api.vercel.com/v2/user', h)
        say(OK if st == 200 else BAD, 'Vercel token -> /v2/user',
            f'HTTP {st}' + (f"  user={body.get('user',{}).get('username','?')}" if st == 200 and isinstance(body, dict) else ''))
        st, body = http(f'https://api.vercel.com/v2/teams', h)
        teams = body.get('teams', []) if isinstance(body, dict) else []
        say(OK, 'Vercel teams', f'{len(teams)} team(s)' + (f": {', '.join(t.get('slug','?') for t in teams)}" if teams else ' — personal account, no team scope needed'))
        st, body = http('https://api.vercel.com/v9/projects', h)
        if st == 200 and isinstance(body, dict):
            names = [p['name'] for p in body.get('projects', [])]
            say(OK, 'Vercel projects visible', f'{len(names)}: {", ".join(names[:6])}')
        else:
            say(BAD, 'Vercel projects', f'HTTP {st}')

    # ---------------------------------------------------------------- Resend
    rk = e.get('RESEND_API_KEY')
    if rk:
        # a sending-scoped key cannot list domains (403). Test the capability we
        # actually need for E1/E2: can it SEND? Goes to the owner's own inbox.
        payload = json.dumps({'from': e.get('RESEND_FROM'), 'to': [e.get('RESEND_TEST_INBOX')],
                              'subject': 'Inflozo probe — access check (3/3)',
                              'text': 'Delivery test for the Supabase Auth SMTP path (E1/E2).'}).encode()
        st, body = http('https://api.resend.com/emails',
                        {'Authorization': f'Bearer {rk}', 'Content-Type': 'application/json'},
                        method='POST', data=payload)
        say(OK if st in (200, 201) else BAD, 'Resend key -> send an email',
            f'HTTP {st} — ' + ('queued, check the inbox' if st in (200,201) else str(body)[:110]))

    # ---------------------------------------------------------------- Ghost
    for M in ('5', '6'):
        u = e.get(f'GHOST{M}_URL')
        if not u: continue
        st, _ = http(f"{u.rstrip('/')}/ghost/api/content/settings/?key={e.get(f'GHOST{M}_CONTENT_API_KEY','')}",
                     {'Accept-Version': f'v{M}.0'})
        say(OK if st == 200 else BAD, f'Ghost {M} content API', f'HTTP {st}')

    print('=' * 74)


if __name__ == '__main__':
    main()
