#!/usr/bin/env python3
"""Verify every credential actually works. Prints VERDICTS ONLY — never a value.

    python3 tools/probe/check-access.py                # every check — and Resend's sends one real email
    python3 tools/probe/check-access.py --self-check   # the GitHub verdict, both ways: no network, no email

Written after two credential leaks in one session, both caused by masking with a
blacklist of known prefixes. This file has no print path that can reach a secret:
values are read, used, and only booleans and server responses come back out.

It exits 1 when any line is a FAIL (a `warn` is not one), so a script can act on it.

THE GITHUB TOKEN ANNOUNCES ITS OWN EXPIRY (DW-90, Story 5.24b). GitHub stamps its answers to a
fine-grained token with `github-authentication-token-expiration`, so the line reads the date off
`GET /rate_limit` — a call that spends none of the token's rate — and the register's date
(VERIFY-AT-BUILD.md, "The read-only GitHub token expires") becomes the second copy, not the
first. `warn` inside 30 days; FAIL when GitHub answers anything but 200 or sends no date: an
expired token answers 401 exactly as a wrong one does, and a missing date is a check that did
not run (standing rule 2). The verdict is `github_verdict()`, pure, and `--self-check` holds it.
"""
import argparse, os, re, sys, json, subprocess, urllib.request, urllib.error
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
OK, BAD, SKIP, WARN = '  ok  ', ' FAIL ', ' skip ', ' warn '
WARN_DAYS = 30
FAILED = []   # every FAIL line's label, filled by say(), so main() can exit 1 on any of them


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
    if tag == BAD:
        FAILED.append(label)
    print(f'[{tag}] {label:<46} {detail}')


def psql(url, sql):
    r = subprocess.run(['docker', 'run', '--rm', '--network', 'host',
                        '-e', 'PGCONNECT_TIMEOUT=25', 'postgres:17-alpine',
                        'psql', url, '-tA', '-c', sql],
                       capture_output=True, text=True, timeout=120)
    return r.returncode == 0, (r.stdout or r.stderr).strip().splitlines()[:1]


def http(url, headers=None, method='GET', data=None, timeout=30, with_headers=False):
    # Resend sits behind Cloudflare bot protection that rejects urllib's default
    # User-Agent with 403 / "error code: 1010". Any real UA passes. Set one
    # everywhere so a transport quirk is never mistaken for an auth failure.
    # `with_headers` adds the answer's headers as a third value (DW-90 reads one).
    headers = dict(headers or {})
    headers.setdefault('User-Agent', 'inflozo-probe/1.0')
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            st, raw, got = r.status, r.read(), r.headers
    except urllib.error.HTTPError as e:
        st, raw, got = e.code, e.read(2000), e.headers
    except Exception as e:
        st, raw, got = 0, f'{type(e).__name__}: {e}'.encode(), {}
    try: body = json.loads(raw)
    except Exception: body = raw[:300].decode('utf8', 'replace')
    return (st, body, got) if with_headers else (st, body)


def github_verdict(status, expiry, now):
    """The GitHub line from what GitHub answered and nothing else: `expiry` is the
    `github-authentication-token-expiration` header's raw value or None, `now` an aware UTC time.
    Pure, so `--self-check` holds every branch with no network."""
    if status != 200:
        return BAD, f'HTTP {status} — refused or unanswered; an expired token answers 401 like a wrong one'
    if not expiry:
        return BAD, 'HTTP 200 and no github-authentication-token-expiration header — the expiry was not read'
    try:
        # `2027-09-05 16:19:00 UTC`, as GitHub sent it at 5.24b's Create; a numeric offset reads too
        when = datetime.strptime(expiry.replace('UTC', '+0000'), '%Y-%m-%d %H:%M:%S %z')
    except ValueError:
        return BAD, f'HTTP 200 and an expiry that does not parse: {expiry!r}'
    days = (when - now).days
    return (WARN if days <= WARN_DAYS else OK), f'HTTP 200 — expires {when:%Y-%m-%d}, in {days} day(s)'


def self_check():
    """Every branch of `github_verdict()` both ways, on fixed inputs: no network, no key, no email."""
    now = datetime(2027, 8, 1, tzinfo=timezone.utc)
    cases = [
        (200, '2027-09-05 16:19:00 UTC', OK),       # the Create's own header, 35 days out
        (200, '2027-09-01 00:00:00 UTC', OK),       # 31 days: the first day that is no warning
        (200, '2027-08-31 23:59:59 UTC', WARN),     # 30 days and change: inside the window
        (200, '2027-08-02 00:00:00 +0000', WARN),   # a numeric offset parses
        (401, '2027-09-05 16:19:00 UTC', BAD),      # refused, whatever date it carries
        (0, None, BAD),                             # never reached GitHub
        (200, None, BAD),                           # no date: a check that did not run
        (200, 'soon', BAD),                         # a date that does not parse
    ]
    for status, expiry, want in cases:
        got, detail = github_verdict(status, expiry, now)
        assert got == want, f'github_verdict({status}, {expiry!r}) is {got!r}, not {want!r}: {detail}'
    assert '2027-09-05' in github_verdict(200, cases[0][1], now)[1], 'the ok line does not carry the date'
    print(f'self-check: all {len(cases)} verdicts held — no network, no email')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--self-check', action='store_true',
                    help='assert the GitHub verdict both ways, with no network and no email')
    if ap.parse_args().self_check:
        self_check()
        return 0
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

    # ---------------------------------------------------------------- GitHub (DW-90, the docstring)
    gt = e.get('GITHUB_TOKEN')
    if gt:
        st, _, got = http('https://api.github.com/rate_limit', {'Authorization': f'Bearer {gt}'}, with_headers=True)
        tag, detail = github_verdict(st, got.get('github-authentication-token-expiration'), datetime.now(timezone.utc))
        say(tag, 'GitHub token -> /rate_limit, and its expiry', detail)
    else:
        say(SKIP, 'GitHub token', 'GITHUB_TOKEN unset — CI runs cannot be read')

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

    # The READING key (DW-22, closed 2026-09-11). The sending key above answers every READ with
    # `401 restricted_api_key`, so until this key existed nothing here could see whether a message
    # ARRIVED — only that Resend accepted it. The control is on the line below the result: a green
    # read beside a sending key that is still refused is what makes the 200 the KEY's doing rather
    # than an open endpoint (standing rule 2).
    rr = e.get('RESEND_READ_API_KEY')
    if rr:
        st, body = http('https://api.resend.com/emails', {'Authorization': f'Bearer {rr}'})
        rows = body.get('data', []) if isinstance(body, dict) else []
        newest = rows[0].get('last_event') if rows else None
        say(OK if st == 200 else BAD, 'Resend reading key -> read the log',
            f'HTTP {st}, {len(rows)} row(s), newest last_event={newest!r}' if st == 200
            else f'HTTP {st} — ' + str(body)[:110])
        if rk:
            st2, body2 = http('https://api.resend.com/emails', {'Authorization': f'Bearer {rk}'})
            refused = st2 == 401 and 'restricted_api_key' in str(body2)
            say(OK if refused else BAD, '  control: the SENDING key still cannot read',
                f'HTTP {st2} {str(body2)[:60]}' if not refused else 'HTTP 401 restricted_api_key')
    else:
        say(SKIP, 'Resend reading key', 'RESEND_READ_API_KEY unset — delivery cannot be read '
                                        '(DW-22; Epic 12 needs it)')

    # ---------------------------------------------------------------- Ghost
    for M in ('5', '6'):
        u = e.get(f'GHOST{M}_URL')
        if not u: continue
        st, _ = http(f"{u.rstrip('/')}/ghost/api/content/settings/?key={e.get(f'GHOST{M}_CONTENT_API_KEY','')}",
                     {'Accept-Version': f'v{M}.0'})
        say(OK if st == 200 else BAD, f'Ghost {M} content API', f'HTTP {st}')

    print('=' * 74)
    return 1 if FAILED else 0


if __name__ == '__main__':
    raise SystemExit(main())
