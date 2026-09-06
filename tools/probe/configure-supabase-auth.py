#!/usr/bin/env python3
"""Set the live project's Supabase Auth configuration, and PROVE each value by reading it back.

    python3 tools/probe/configure-supabase-auth.py --apply
    python3 tools/probe/configure-supabase-auth.py --check
    python3 tools/probe/configure-supabase-auth.py --check --expect mailer_otp_exp=901   # the control

The keys — SUPABASE_URL, SUPABASE_ACCESS_TOKEN, RESEND_API_KEY, RESEND_FROM — come from the
environment, else from `tools/probe/.env` beside this file, read the way every other probe reads it
and never printed. (`env $(grep … | xargs)` cannot carry `RESEND_FROM`'s space: xargs strips the
quotes and the shell splits `$(…)`, so `<hello@inflozo.com>` becomes the command — found by the
review of Story 1.4.)

`--apply` PATCHes every field below and then runs `--check`; `--check` GETs the config and
asserts each field, exiting non-zero on any miss. A setting that cannot be read back is not set
(standing rule: a result whose control did not pass is not a result), and `--expect key=value`
deliberately breaks one expectation so a green run can be told from a run that checks nothing.

The fields it writes are the sign-in flow's (site URL, the allow list, the 15-minute link, Resend
as the SMTP sender, both templates and both subjects, the two rate limits, no passwords anywhere)
and, since Story 2.1, the four that turn Supabase's own passkey switch on: `passkey_enabled` and
the three `webauthn_rp_*`. `sessions_inactivity_timeout` is written with them and reported apart.

`smtp_pass` is `$RESEND_API_KEY` and is NEVER printed, compared or read back — the API returns it
masked, so it is written and then left alone. Every other field is compared by value.

Two pitfalls, both executed rather than assumed (2026-09-05, against the live project):

  * api.supabase.com sits behind Cloudflare and answers `403 error code: 1010` to Python's
    default urllib User-Agent. Every request here sends curl's.
  * A FIRST-EVER address does not receive the magic-link email at all — GoTrue sends Confirm
    signup, because sign-up and sign-in are one flow (FR-A1) and the address is new. So the one
    template in `supabase/auth/magic-link.html` is pushed to BOTH templates and both subjects are
    the same sentence; and its link carries `type=email`, the generic verification type, which
    `/auth/v1/verify` returned 200 for on a `magiclink` token AND on a `signup` token.
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TEMPLATE = os.path.join(ROOT, 'supabase', 'auth', 'magic-link.html')

APP = 'https://app.inflozo.com'
SUBJECT = 'Your Inflozo sign-in link'
UA = {'User-Agent': 'curl/8.5.0'}   # see the module docstring: Cloudflare 1010 without it

# Fields that are written AND proved. `smtp_pass` is deliberately not here.
def settings(template: str, sender: str) -> dict:
    return {
        # where the link points, and what a redirect is allowed to be
        'site_url': APP,
        'uri_allow_list': f'{APP}/**,http://localhost:3000/**',
        # "It's good for 15 minutes" on S1b is TRUE because of this line, and only because of it
        'mailer_otp_exp': 900,
        # Resend as the custom SMTP sender. `smtp_user` is the literal string `resend`.
        'smtp_host': 'smtp.resend.com',
        'smtp_port': '465',
        'smtp_user': 'resend',
        'smtp_admin_email': sender,
        'smtp_sender_name': 'Inflozo',
        # where the resend countdown starts (S1b, UX-DR13); GoTrue's own 429 overrides it
        'smtp_max_frequency': 60,
        # Supabase's built-in sender caps at 2 an hour; ours is Resend's, so the cap moves
        'rate_limit_email_sent': 30,
        # both templates, one file — see the docstring
        'mailer_subjects_magic_link': SUBJECT,
        'mailer_subjects_confirmation': SUBJECT,
        'mailer_templates_magic_link_content': template,
        'mailer_templates_confirmation_content': template,
        # no password exists anywhere in this product (FR-A1), and sign-up is sign-in
        'mailer_autoconfirm': False,
        'disable_signup': False,
        'external_email_enabled': True,
        # SUPABASE'S HALF OF THE PASSKEY SWITCH (Story 2.1, FR-A2). There are two switches and
        # this is the platform's: Inflozo's own `feature_flags.passkeys` row is the other, and
        # the app reads BOTH per request (MEASUREMENTS §20). The four field names were read from
        # api.supabase.com/api/v1-json on 2026-09-06 -- `UpdateAuthConfigBody` carries
        # `passkey_enabled` (boolean) and the three `webauthn_rp_*` (strings) -- and the settings
        # endpoint reports the result as `passkeys_enabled`, which is the name the app reads.
        #
        # THE RP ID IS THE APEX AND IS A ONE-WAY DOOR: a passkey is bound to its RP ID for ever,
        # so `inflozo.com` covers any future host under it while the origin list stays exact at
        # `app.inflozo.com`. Changing it once a passkey exists in production strands every one of
        # them, which is why it is written here rather than typed into the dashboard twice.
        'passkey_enabled': True,
        'webauthn_rp_id': 'inflozo.com',
        'webauthn_rp_origins': APP,
        'webauthn_rp_display_name': 'Inflozo',
    }


# Written with everything else but reported separately: it is a paid-plan field on some plans and
# a miss here is a fact about the plan, not a failure of the story. The unit is HOURS — the API
# describes it as "Session inactivity timeout in hours" (api.supabase.com/api/v1-json, read
# 2026-09-05) — so 720 is thirty days, FR-A6's own number, and never twelve minutes.
SOFT = {'sessions_inactivity_timeout': 720}


def project_ref(url: str) -> str:
    return url.split('//', 1)[1].split('.', 1)[0]


def api(method: str, ref: str, token: str, body: dict | None = None):
    req = urllib.request.Request(
        f'https://api.supabase.com/v1/projects/{ref}/config/auth',
        method=method,
        data=json.dumps(body).encode() if body else None,
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json', **UA},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        # The error body is not always JSON: Cloudflare's own 1010 page (see the docstring) is
        # HTML, and json.loads on it raised, hiding the very status this tool exists to report.
        raw = e.read()
        try:
            return e.code, json.loads(raw or b'{}')
        except ValueError:
            return e.code, {'body': raw[:400].decode('utf-8', 'replace')}
    except urllib.error.URLError as e:
        # DNS or TCP. This machine's stub resolver fails intermittently (docs/project-context.md),
        # and a traceback there reads like an outage instead of something to retry.
        return 0, {'error': str(e.reason)}


def dotenv() -> dict:
    """`tools/probe/.env`, parsed the same way as `run-verify-all.py`'s `load_env`.

    Values are used VERBATIM and the file is never sourced as shell, so a value is not quoted —
    `RESEND_FROM=Inflozo <hello@inflozo.com>` is one line, spaces and angle brackets included.
    """
    out = {}
    path = os.path.join(HERE, '.env')
    if os.path.exists(path):
        for line in open(path, encoding='utf-8'):
            m = re.match(r'^([A-Z0-9_]+)=(.*)$', line.rstrip('\n'))
            if m and m.group(2).strip():
                out[m.group(1)] = m.group(2).strip()
    return out


def env(name: str, _file: dict = {}) -> str:
    if not _file:
        _file.update(dotenv())
    value = os.environ.get(name) or _file.get(name)
    if not value:
        sys.exit(f'{name} is neither in the environment nor in tools/probe/.env')
    return value


def sender_address(resend_from: str) -> str:
    """`Inflozo <hello@inflozo.com>` and `hello@inflozo.com` both give the address."""
    return resend_from.split('<')[-1].rstrip('>').strip()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--apply', action='store_true', help='PATCH every setting, then check')
    ap.add_argument('--check', action='store_true', help='GET and assert every setting')
    ap.add_argument('--expect', action='append', default=[], metavar='key=value',
                    help='override one expectation — the negative control')
    args = ap.parse_args()
    if not (args.apply or args.check):
        ap.error('give --apply or --check')

    ref = project_ref(env('SUPABASE_URL'))
    token = env('SUPABASE_ACCESS_TOKEN')
    template = open(TEMPLATE, encoding='utf-8').read()
    sender = sender_address(env('RESEND_FROM'))
    want = settings(template, sender)

    if args.apply:
        # THE ONE-WAY DOOR, GUARDED BEFORE IT IS WALKED THROUGH. A passkey is bound to its RP ID
        # for ever: change `webauthn_rp_id` once credentials exist and every one of them is
        # stranded, and putting the old value back does not bring them back. `--check` cannot see
        # this, because it compares the live project to `settings()` — the very constant such a
        # change would have edited — so it reports PASS on the edit that does the damage
        # (review, 2026-09-06). The first write, when the project reports no RP ID at all, is
        # free; a LATER write that differs stops here and asks (standing rule 6: flag, do not
        # guess). `--expect webauthn_rp_id=<new>` is the deliberate way through, so the override
        # that acknowledges the consequence is also the one that records it.
        status, before = api('GET', ref, token)
        if status != 200:
            print(f'GET {status}: {json.dumps(before)[:400]}')
            return 1
        live_rp = before.get('webauthn_rp_id')
        override = dict(o.partition('=')[::2] for o in args.expect).get('webauthn_rp_id')
        if live_rp and live_rp != want['webauthn_rp_id'] and override != want['webauthn_rp_id']:
            print(f'REFUSING to change webauthn_rp_id: live {live_rp!r} -> {want["webauthn_rp_id"]!r}')
            print('  Every passkey already registered is bound to the live value and would be stranded.')
            print(f'  If that is genuinely intended, say so: --expect webauthn_rp_id={want["webauthn_rp_id"]}')
            return 1

        payload = {**want, **SOFT, 'smtp_pass': env('RESEND_API_KEY')}
        status, body = api('PATCH', ref, token, payload)
        if status == 402:
            # 402 is the ONE status `sessions_inactivity_timeout` produces — "User sessions can
            # only be configured on Pro Plans and up", executed 2026-09-05. Retrying on ANY
            # non-200 made a 401, or a template the API rejected, print "retrying without the
            # plan-dependent field…" and then fail identically a second time, which says nothing
            # true about what was wrong (review, 2026-09-05).
            print(f'PATCH {status}: {json.dumps(body)[:400]}')
            print('retrying without the plan-dependent field…')
            payload.pop('sessions_inactivity_timeout', None)
            status, body = api('PATCH', ref, token, payload)
        if status != 200:
            print(f'PATCH {status}: {json.dumps(body)[:400]}')
            return 1
        print(f'PATCH 200 — {len(payload)} fields written (smtp_pass by name only)')

    status, live = api('GET', ref, token)
    if status != 200:
        print(f'GET {status}: {json.dumps(live)[:400]}')
        return 1
    print(f'GET 200 — reading back {ref}')

    for override in args.expect:
        key, sep, value = override.partition('=')
        # a SOFT field stays soft — putting it in `want` would make the control fail on the plan,
        # not on the expectation; and `bool('0')` is True, so booleans are read by word
        target = want if key in want else SOFT if key in SOFT else None
        if target is None:
            sys.exit(f'--expect {key}: not a field this tool sets')
        if not sep:
            sys.exit(f'--expect {key}: give key=value')
        current = target[key]
        if isinstance(current, bool):        # bool before int — bool IS an int in Python
            target[key] = value.lower() in ('true', '1')
        elif isinstance(current, int):
            # its sibling misuses exit with a sentence; this one exited with a traceback
            if not re.fullmatch(r'-?\d+', value):
                sys.exit(f'--expect {key}: {value!r} is not a number')
            target[key] = int(value)
        else:
            target[key] = value
        print(f'  (--expect override: {key} = {target[key]!r})')

    fails = 0
    for key, expected in want.items():
        actual = live.get(key)
        ok = str(actual) == str(expected)
        fails += not ok
        shown = f'{len(expected)} chars' if isinstance(expected, str) and len(expected) > 60 else repr(expected)
        detail = '' if ok else f'  (live: {repr(actual)[:80]})'
        print(f'  {"PASS" if ok else "FAIL"}  {key} = {shown}{detail}')

    for key, expected in SOFT.items():
        actual = live.get(key)
        if str(actual) == str(expected):
            print(f'  PASS  {key} = {expected!r}')
        else:
            print(f'  ----  {key}: asked for {expected!r}, project reports {actual!r} — not on this plan, stated not swallowed')

    print(f'\n{"OK" if not fails else f"{fails} FAILED"}')
    return 1 if fails else 0


if __name__ == '__main__':
    raise SystemExit(main())
