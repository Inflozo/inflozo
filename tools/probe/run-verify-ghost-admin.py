#!/usr/bin/env python3
"""The Admin chokepoint and Vault storage, driven against the DEPLOYED route. Story 3.1.

    python3 tools/probe/run-verify-ghost-admin.py --check   # keys, the two 401 controls, grants
    python3 tools/probe/run-verify-ghost-admin.py           # the whole round trip, T1 and T3
    python3 tools/probe/run-verify-ghost-admin.py --url https://<deployment>.vercel.app

WHY IT EXISTS. Story 3.1 rests on claims about Supabase Vault, the transaction pooler and two
real Ghosts, and CLAUDE.md's first standing rule — cite or execute, never assert — makes each one
a hypothesis until it is run against the real thing: that a Vercel function REACHES the
transaction pooler at all (nothing in this project had ever opened a direct Postgres connection
from a deployed function); that the role it arrives as may read `vault.decrypted_secrets` and
delete from `vault.secrets` (§21j says service_role only, and the connection is the `postgres`
user's); that `vault.create_secret` stores and `decrypted_secrets` returns the same bytes; that
DW-44's trigger removes the secret behind a ref that is replaced or cascaded away; that the JWT
minted in TypeScript is the one both majors accept, with and without `Accept-Version`; and that a
write outside the four-item allowlist never reaches the network. Every one is executed here.

IT CALLS A ROUTE THAT WRITES REAL CREDENTIALS INTO THE LIVE PROJECT'S VAULT. Everything it
stores is a THROWAWAY: one GoTrue user this run creates, two `sites` rows of its own, and the
Ghost keys of the two disposable test servers — never a customer's. The user is deleted at the
end, which is also the cascade the `secret-gone` step is reading.

WHAT IT PROVES, each step PASS or FAIL, exiting non-zero if any step fails. The steps are named
here in the order the run prints them:

  keys           every key this run needs is in `tools/probe/.env`, BY NAME — without CRON_SECRET
                 every call below is a 401 and the run would "pass" its two controls and nothing
                 else. Printed in both modes; no value is ever printed.
  no-header      THE CONTROL, AND IT RUNS FIRST. `POST` with no `Authorization` at all: 401 from
                 THE ROUTE — body `Unauthorized` and `x-matched-path` naming it, so a platform's
                 401 (deployment protection on a preview URL) cannot pass for it — and
                 `cache-control: no-store`
  wrong-secret   the same call with a wrong bearer of the same shape: 401 from the route
  vault-off-rest §21j re-executed: `GET /rest/v1/{decrypted_secrets,secrets,site_credentials}` with
                 the secret key -> 404 all three, `/rest/v1/sites` -> 200 (the positive control):
                 the bound the design rests on — a leaked API key yields refs, not keys
  grants         `current_user` and `has_table_privilege(current_user, 'vault.secrets', 'DELETE')`
                 read from inside the deployed function: THE FIRST EXECUTION of "the Vercel
                 function reaches the pooler". Everything after it depends on this answering.
  then, for T1 (Ghost 6.58.0) and T3 (Ghost 5.130.6) in turn, against one site row each:
  credential-missing  `call GET config/` BEFORE any key is stored: 500 `credential_missing`, and
                 the audit step below finds the `vault_decrypt error {reason: missing}` row it left
  store          the real Admin API key into Vault -> a ref, and `credentials_present.admin` true
  malformed      a "key" with no colon stored: 500 `credential_malformed` and NO ref — refused
                 before Vault, with the real key beneath it untouched (the next step proves it)
  config-no-version  `call GET config/` with `sites.ghost_version` still null: 200 and a `version`,
                 with NO `Accept-Version` header — the shape Story 3.2 validates in, before any
                 version is known
  config-versioned   `ghost_version` set, the same call again: 200. `Accept-Version: v6.0`/`v5.0`
                 is sent by construction and is NOT observable from outside: both Ghosts answer
                 200 to any value of that header (`v99.0`, `nonsense` — executed 2026-09-07), so
                 this step proves the versioned path runs, not the header's value
  write-denied   `call POST posts/` refused with `write_not_allowed` THREE ways — no item, the
                 wrong item (read from the allowlist), and `PUT settings/` as `announcement_clear`
                 with a guarded body — and each audit row proves NO NETWORK CALL happened (no
                 `status` in its detail)
  bogus-key      a key of the right shape whose `kid` Ghost never issued, stored and called: 401
                 with `ghost_unknown_key` (§37 — a regenerated key, not an "expired" one)
  rotated        the real key stored again: the BOGUS secret is gone from the vault and the new
                 one is there — DW-44's replace path, on the live project
  staff-removed  a token-shaped secret stored as `kind: 'staff'` and removed again: the secret
                 gone (DW-44's remove path) and `credentials_present.staff` back to false
  audit          the site's rows read back: `vault_decrypt ok` per decryption, two `admin_read ok`,
                 one `admin_read error` at 401, one `admin_write denied`, and no `detail` anywhere
                 that contains a `kid:secret`
  then once:
  user-gone      `GET /auth/v1/admin/users/{id}` -> 404 after GoTrue deletes the throwaway user
  secret-gone    both sites' refs are gone from the vault — the CASCADE path of DW-44's trigger:
                 auth.users -> sites -> site_credentials -> the trigger, under GoTrue's role
  no-secret-leak no response body this run received contains any `kid:secret` it sent
  users before == after, read from the Admin API before any sweep and after cleanup.

BETWEEN DEV AND DEPLOY the code is live before the SQL is: CI deploys on the Dev push, and
`supabase/migrations/20260907200000_vault_secret_lifecycle.sql` is applied by the owner in the
Supabase SQL editor at Deploy (the direct host is IPv6-only from here and this machine's sandbox
refuses writes to the live database). Until then `rotated` and `secret-gone` FAIL, and that is the
expected pre-migration state rather than a pass — the run says so in its own words.

NO KEY IS EVER PRINTED. Every key reaches a request through a header or a JSON body built from
the environment, and every command is recorded by the key's variable NAME. Redirects are
DISABLED: a 3xx is a FAIL, never a bearer quietly re-sent to wherever the redirect points.

THE FIXTURE IS CLEANED UP. One user, two sites, and the sites' rows go with the user; any stale
`ghost-admin-harness-*` user an earlier run left is swept at the start and again after cleanup,
and the Admin-API user count is read before and after — a count that could not be read FAILS the
run, because it is the cleanup's control.
"""
import argparse, importlib.util, json, os, re, sys, time
import urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APEX = 'https://inflozo.com'
FIXTURE = r'^ghost-admin-harness-\d+@inflozo\.com$'

# The app's own files, READ rather than retyped: a harness carrying its own copy of the path or
# of the allowlist proves nothing about the route Vercel serves.
WEB = os.path.join(HERE, '..', '..', 'apps', 'web')
VERIFY_ROUTE = os.path.join(WEB, 'app', 'api', 'ghost-admin', 'verify', 'route.ts')
ADMIN_RULE = os.path.join(WEB, 'server', 'ghost-admin', 'admin-rule.ts')


def _sibling(name):
    """`run-verify-passkeys` is not an identifier, so it cannot be `import`ed by name."""
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_passkeys = _sibling('run-verify-passkeys')
Admin, load_env = _passkeys.Admin, _passkeys.load_env
_deletion = _sibling('run-verify-account-deletion')
rest = _deletion.rest


def verify_path():
    """`/api/ghost-admin/verify`, derived from where the route file IS. A renamed or moved route
    is this harness failing to find it, never a harness calling a 404 that looks like a refusal."""
    if not os.path.exists(VERIFY_ROUTE):
        sys.exit(f'  FAIL  the verify route is not at {os.path.relpath(VERIFY_ROUTE)} — '
                 'Story 3.2 removes it (DW-48), and this harness goes with it')
    return '/' + os.path.relpath(os.path.dirname(VERIFY_ROUTE), os.path.join(WEB, 'app')).replace(os.sep, '/')


def audit_route():
    """The `route` string the route stamps on every audit row, read out of the route itself."""
    found = re.search(r"const route = '([^']+)'", open(VERIFY_ROUTE, encoding='utf-8').read())
    if not found:
        sys.exit('  FAIL  the verify route no longer declares its audit `route` name')
    return found.group(1)


def allowlist():
    """The four `ADMIN_WRITES` keys, read out of `admin-rule.ts`. The `write-denied` step names one
    of them as the WRONG item, and a harness that hardcoded it would keep testing a key the app
    had dropped (CLAUDE.md: counts and membership are derived, never restated)."""
    source = open(ADMIN_RULE, encoding='utf-8').read()
    block = re.search(r'export const ADMIN_WRITES = \{(.*?)\n\} as const', source, re.S)
    names = re.findall(r'^\s{2}([a-z_]+):', block.group(1), re.M) if block else []
    if not names:
        sys.exit('  FAIL  ADMIN_WRITES could not be read out of admin-rule.ts')
    return names


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """A redirect is a FAIL, not a detour: the bearer must never be re-sent to wherever a 3xx
    points, and a 308 off the apex would paper over the `routing.ts` pass-through claim."""

    def redirect_request(self, *args, **kwargs):
        return None


_opener = urllib.request.build_opener(NoRedirect)


def call_route(url, secret, payload):
    """The route as the harness calls it: POST, the bearer in a header, JSON in, no redirects.
    Returns (status, body, headers) with the header names lower-cased."""
    headers = {'Content-Type': 'application/json'}
    if secret is not None:
        headers['Authorization'] = f'Bearer {secret}'
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), method='POST', headers=headers)
    try:
        with _opener.open(req, timeout=120) as r:
            raw = r.read()
            head = {k.lower(): v for k, v in r.headers.items()}
            try:
                return r.status, (json.loads(raw) if raw else None), head
            except ValueError:
                return r.status, raw.decode('utf-8', 'replace')[:300], head
    except urllib.error.HTTPError as e:
        raw = e.read()
        head = {k.lower(): v for k, v in e.headers.items()}
        try:
            return e.code, (json.loads(raw) if raw else None), head
        except ValueError:
            return e.code, raw.decode('utf-8', 'replace')[:300], head
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return 0, str(e), {}


def route_401(status, body, headers, path):
    """A 401 FROM THE ROUTE: its body and Vercel's `x-matched-path`, so a 401 from a layer in front
    of it — deployment protection on a preview URL, an edge rejection — cannot pass as the control."""
    return (status == 401 and body == 'Unauthorized' and headers.get('x-matched-path') == path
            and 'no-store' in (headers.get('cache-control') or '').lower())


class Run:
    """PASS/FAIL lines in the sibling harnesses' shape, and one exit code out of them."""

    def __init__(self):
        self.failed = False
        self.seen = []          # every response body, for the no-secret-leak sweep

    def step(self, name, ok, detail):
        print(f'  {"PASS" if ok else "FAIL"}  {name}: {detail}')
        if not ok:
            self.failed = True
        return ok

    def watch(self, body):
        self.seen.append(json.dumps(body, default=str))
        return body


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='the plumbing alone: every key present by name, the two 401 controls on '
                         'the deployed route, and the `grants` op — which is the first execution '
                         'of the Vercel-function-reaches-the-pooler hypothesis. Stores nothing '
                         'and creates no user.')
    ap.add_argument('--url', default=APEX,
                    help='where the route lives. The apex by default — routing.ts passes any '
                         'non-/app path through. A Review run points this at that deployment.')
    args = ap.parse_args()

    env = load_env()
    needed = ['CRON_SECRET', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY',
              'GHOST6_URL', 'GHOST6_ADMIN_API_KEY', 'GHOST6_MAJOR',
              'GHOST5_URL', 'GHOST5_ADMIN_API_KEY', 'GHOST5_MAJOR']
    missing = [k for k in needed if not env.get(k)]

    run = Run()
    run.step('keys', not missing,
             f'present in tools/probe/.env by name: {", ".join(k for k in needed if env.get(k))}'
             + (f'; MISSING: {", ".join(missing)}' if missing else ''))
    if missing:
        print('  RESULT: FAILED')
        return 1

    sb, secret, cron_secret = env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'], env['CRON_SECRET']
    path = verify_path()
    route = args.url.rstrip('/') + path
    stamp = int(time.time())
    print(f'  route: {route}')
    print(f'  the allowlist the app carries: {", ".join(allowlist())}')

    # ── The two 401 controls, FIRST. Without them a green run proves only that SOMETHING did the
    #    work, not that the bearer is what let it.
    status, body, head = call_route(route, None, {'op': 'grants'})
    run.step('no-header', route_401(status, body, head, path),
             f'POST with no Authorization -> HTTP {status} {json.dumps(body)[:80]}, '
             f'x-matched-path {head.get("x-matched-path")}, cache-control {head.get("cache-control")}')
    status, body, head = call_route(route, 'not-the-secret-' + str(stamp), {'op': 'grants'})
    run.step('wrong-secret', route_401(status, body, head, path),
             f'a wrong bearer of the same shape -> HTTP {status} {json.dumps(body)[:80]}')

    # ── §21j, THE BOUND THE DESIGN RESTS ON, re-executed every run rather than remembered.
    off_api = {}
    for table in ('decrypted_secrets', 'secrets', 'site_credentials'):
        st, _ = rest(sb, secret, 'GET', f'/{table}?limit=1')
        off_api[table] = st
    st_sites, _ = rest(sb, secret, 'GET', '/sites?limit=1')
    run.step('vault-off-rest', all(v == 404 for v in off_api.values()) and st_sites == 200,
             f'GET /rest/v1/{{decrypted_secrets,secrets,site_credentials}} -> {json.dumps(off_api)}; '
             f'the positive control /rest/v1/sites -> {st_sites}')

    # ── The pooler, from inside the deployed function.
    status, body, _ = call_route(route, cron_secret, {'op': 'grants'})
    granted = isinstance(body, dict) and body.get('may_delete') is True
    run.step('grants', status == 200 and granted,
             f'HTTP {status} {json.dumps(body)[:200]}'
             + ('' if status == 200 else
                ' — if this is credential_store_unavailable, SUPABASE_DB_POOLER_URL is not yet in '
                'Vercel production (the owner adds it at Deploy)'))
    if args.check:
        print('  --check: the plumbing alone — nothing stored, no user created')
        print('  RESULT: ' + ('FAILED' if run.failed else 'all steps passed'))
        return 1 if run.failed else 0
    if status != 200:
        print('  the round trip cannot run until `grants` answers; stopping here rather than '
              'reporting a cascade of failures that all mean the same thing.')
        print('  RESULT: FAILED')
        return 1

    admin = Admin(sb, secret)
    swept = admin.sweep_stale_fixtures(FIXTURE)
    if swept:
        print(f'  swept {swept} stale ghost-admin-harness-* user(s) an earlier run left behind')
    users = admin.users()
    if users is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1
    before = len(users)
    print(f'  users before: {before}')

    # A `kid` of the right shape that Ghost has never issued (§37: 401 Unknown Admin API Key).
    BOGUS = '0' * 24 + ':' + 'ab' * 32
    ghosts = [('T1', 'GHOST6'), ('T3', 'GHOST5')]
    user_id, refs, sent = None, {}, []

    try:
        status, user = admin.call('POST', '/admin/users',
                                  {'email': f'ghost-admin-harness-{stamp}@inflozo.com', 'email_confirm': True})
        if status not in (200, 201) or not user.get('id'):
            print(f'  FAIL  could not create the fixture user: HTTP {status}')
            return 1
        user_id = user['id']
        print(f'  fixture user created')

        for label, prefix in ghosts:
            ghost_url = env[f'{prefix}_URL'].rstrip('/')
            key = env[f'{prefix}_ADMIN_API_KEY']
            major = env[f'{prefix}_MAJOR']
            sent.append(key)
            print(f'  ── {label} ({ghost_url}, Ghost {env.get(prefix + "_VERSION", major)})')

            status, rows = rest(sb, secret, 'POST', '/sites',
                                {'user_id': user_id, 'url': ghost_url, 'title': f'ghost-admin harness {stamp}'},
                                prefer='return=representation')
            if status not in (200, 201) or not rows:
                print(f'  FAIL  could not seed the {label} site row: HTTP {status} {json.dumps(rows)[:200]}')
                return 1
            site_id = rows[0]['id']

            def op(payload):
                st, bd, _ = call_route(route, cron_secret, payload)
                return st, run.watch(bd)

            # No key yet: the read must fail as `credential_missing` and STILL leave an audit row
            # behind (AD-10 F10 — the log is the only control that detects; review, 2026-09-07).
            st, bd = op({'op': 'call', 'siteId': site_id, 'method': 'GET', 'path': 'config/'})
            run.step(f'{label} credential-missing',
                     st == 500 and isinstance(bd, dict) and bd.get('code') == 'credential_missing',
                     f'call before any key is stored -> HTTP {st} {json.dumps(bd)[:120]}')

            st, bd = op({'op': 'store', 'siteId': site_id, 'userId': user_id, 'kind': 'admin', 'secret': key})
            real_ref = bd.get('ref') if isinstance(bd, dict) else None
            _, flags = rest(sb, secret, 'GET', f'/sites?id=eq.{site_id}&select=credentials_present')
            present = flags[0]['credentials_present'] if isinstance(flags, list) and flags else {}
            run.step(f'{label} store', st == 200 and bool(real_ref) and present.get('admin') is True,
                     f'HTTP {st}, ref {"present" if real_ref else "absent"}, '
                     f'credentials_present {json.dumps(present)}')

            st, bd = op({'op': 'store', 'siteId': site_id, 'userId': user_id, 'kind': 'admin',
                         'secret': 'not-a-ghost-key'})
            run.step(f'{label} malformed',
                     st == 500 and isinstance(bd, dict) and bd.get('code') == 'credential_malformed'
                     and 'ref' not in bd,
                     f'a key with no colon -> HTTP {st} {json.dumps(bd)[:120]} (refused before Vault: no ref)')

            st, bd = op({'op': 'call', 'siteId': site_id, 'method': 'GET', 'path': 'config/'})
            run.step(f'{label} config-no-version',
                     st == 200 and isinstance(bd, dict) and bd.get('status') == 200 and bool(bd.get('version')),
                     f'HTTP {st}, Ghost {bd.get("status") if isinstance(bd, dict) else "?"}, '
                     f'version {bd.get("version") if isinstance(bd, dict) else "?"} '
                     '(no Accept-Version sent — sites.ghost_version is null)')
            reported = bd.get('version') if isinstance(bd, dict) else None

            if reported:
                rest(sb, secret, 'PATCH', f'/sites?id=eq.{site_id}', {'ghost_version': reported})
            st, bd = op({'op': 'call', 'siteId': site_id, 'method': 'GET', 'path': 'config/'})
            run.step(f'{label} config-versioned',
                     st == 200 and isinstance(bd, dict) and bd.get('status') == 200
                     and bd.get('version') == reported,
                     f'ghost_version now {reported}, so Accept-Version v{major}.0 by construction -> '
                     f'HTTP {st}, Ghost {bd.get("status") if isinstance(bd, dict) else "?"}')

            # THE THREE DENIALS the matrix names, each with no network call: no item, the wrong
            # item (read out of the allowlist, never retyped), and a guarded body.
            denials = [
                ('no item', {}),
                ('wrong item', {'item': allowlist()[0]}),
                ('guarded body', {'method': 'PUT', 'path': 'settings/', 'item': 'announcement_clear',
                                  'body': {'settings': [{'key': 'announcement_content', 'value': ''},
                                                        {'key': 'title', 'value': 'this must never be set'}]}}),
            ]
            for why, extra in denials:
                payload = {'op': 'call', 'siteId': site_id, 'method': 'POST', 'path': 'posts/',
                           'body': {'posts': [{'title': 'this must never be created'}]}, **extra}
                st, bd = op(payload)
                run.step(f'{label} write-denied ({why})',
                         st == 500 and isinstance(bd, dict) and bd.get('code') == 'write_not_allowed',
                         f'{payload["method"]} {payload["path"]} -> HTTP {st} {json.dumps(bd)[:120]}')

            st, bd = op({'op': 'store', 'siteId': site_id, 'userId': user_id, 'kind': 'admin', 'secret': BOGUS})
            bogus_ref = bd.get('ref') if isinstance(bd, dict) else None
            st, bd = op({'op': 'call', 'siteId': site_id, 'method': 'GET', 'path': 'config/'})
            # Ghost's refusal is a RESULT, not a thrown error: the module answers `{ ok: false,
            # status, code }` so a caller can tell "your key no longer works" from "we could not
            # reach the credential store", which is the whole point of the cause map (§37).
            run.step(f'{label} bogus-key',
                     st == 200 and isinstance(bd, dict) and bd.get('ok') is False
                     and bd.get('status') == 401 and bd.get('code') == 'ghost_unknown_key',
                     f'a kid Ghost never issued -> HTTP {st} {json.dumps(bd)[:160]}')

            st, bd = op({'op': 'store', 'siteId': site_id, 'userId': user_id, 'kind': 'admin', 'secret': key})
            new_ref = bd.get('ref') if isinstance(bd, dict) else None
            _, bogus_gone = op({'op': 'secret-exists', 'ref': bogus_ref})
            _, new_there = op({'op': 'secret-exists', 'ref': new_ref})
            run.step(f'{label} rotated',
                     bogus_gone == {'exists': False} and new_there == {'exists': True},
                     f'the bogus ref {"is gone" if bogus_gone == {"exists": False} else "SURVIVED"}, '
                     f'the new ref {"is there" if new_there == {"exists": True} else "is MISSING"}'
                     + ('' if bogus_gone == {'exists': False} else
                        ' — expected before the owner applies 20260907200000_vault_secret_lifecycle.sql'))
            refs[label] = new_ref

            # The staff kind and `remove`, which no product story calls until 3.6 / E7: a
            # token-SHAPED secret (never minted, never sent to a Ghost) in, and out again.
            STAFF = '1' * 24 + ':' + 'cd' * 32
            st, bd = op({'op': 'store', 'siteId': site_id, 'userId': user_id, 'kind': 'staff', 'secret': STAFF})
            staff_ref = bd.get('ref') if isinstance(bd, dict) else None
            st2, _ = op({'op': 'remove', 'siteId': site_id, 'kind': 'staff'})
            _, staff_gone = op({'op': 'secret-exists', 'ref': staff_ref})
            _, flags = rest(sb, secret, 'GET', f'/sites?id=eq.{site_id}&select=credentials_present')
            present = flags[0]['credentials_present'] if isinstance(flags, list) and flags else {}
            run.step(f'{label} staff-removed',
                     st == 200 and bool(staff_ref) and st2 == 200 and staff_gone == {'exists': False}
                     and present.get('staff') is False and present.get('admin') is True,
                     f'staff stored (HTTP {st}) then removed (HTTP {st2}): the secret '
                     f'{"is gone" if staff_gone == {"exists": False} else "SURVIVED"}, '
                     f'credentials_present {json.dumps(present)}'
                     + ('' if staff_gone == {'exists': False} else
                        ' — expected before the owner applies 20260907200000_vault_secret_lifecycle.sql'))

            _, bd = op({'op': 'audit', 'siteId': site_id})
            rows = bd.get('rows', []) if isinstance(bd, dict) else []
            counts = {}
            for row in rows:
                counts[f'{row.get("action")} {row.get("outcome")}'] = counts.get(f'{row.get("action")} {row.get("outcome")}', 0) + 1
            # `detail` MUST come back as a JSON object. Executed on the live database 2026-09-07:
            # a parameter cast with `::jsonb` stores a JSON *string* scalar, so `detail.status`
            # reads undefined for ever and every assertion below quietly passes over nothing.
            objects = all(isinstance(r.get('detail'), dict) for r in rows)
            detail = lambda r: r.get('detail') if isinstance(r.get('detail'), dict) else {}
            denied = [r for r in rows if r.get('action') == 'admin_write' and r.get('outcome') == 'denied']
            error_401 = [r for r in rows if r.get('action') == 'admin_read' and r.get('outcome') == 'error'
                         and detail(r).get('status') == 401]
            missing = [r for r in rows if r.get('action') == 'vault_decrypt' and r.get('outcome') == 'error'
                       and detail(r).get('reason') == 'missing']
            no_network = bool(denied) and all('status' not in detail(r) for r in denied)
            stamped = all(r.get('route') == audit_route() for r in rows)
            leak = [r for r in rows if re.search(r'[0-9a-f]{16,}:[0-9a-f]{16,}', json.dumps(r, default=str))]
            run.step(f'{label} audit',
                     objects and not leak
                     and counts.get('vault_decrypt ok', 0) >= 6 and counts.get('admin_read ok', 0) == 2
                     and len(error_401) == 1 and len(denied) == 3 and len(missing) == 1 and no_network and stamped,
                     f'{len(rows)} rows {json.dumps(counts)}; every detail is a jsonb object = {objects}; '
                     f'the decrypt before any key was stored left its error row = {len(missing) == 1}; '
                     f'the denied write carries no status (no network call) = {no_network}; '
                     f'every row stamped {audit_route()} = {stamped}; '
                     f'rows that look like they hold a key = {len(leak)}')

        # ── The cascade: GoTrue deletes the user, Postgres cascades to sites and to the
        #    credentials rows, and DW-44's trigger takes both secrets with them.
        admin.call('DELETE', f'/admin/users/{user_id}', {})
        gone, _ = admin.call('GET', f'/admin/users/{user_id}')
        run.step('user-gone', gone == 404, f'GET /admin/users/{{id}} -> HTTP {gone}')
        user_id = None

        left = {}
        for label, ref in refs.items():
            st, bd, _ = call_route(route, cron_secret, {'op': 'secret-exists', 'ref': ref})
            left[label] = bd.get('exists') if isinstance(bd, dict) else 'unreadable'
        run.step('secret-gone', all(v is False for v in left.values()),
                 f'the vault after the account went: {json.dumps(left)}'
                 + ('' if all(v is False for v in left.values()) else
                    ' — expected until the owner applies 20260907200000_vault_secret_lifecycle.sql'))

        leaked = [k for k in sent if any(k in blob for blob in run.seen)]
        run.step('no-secret-leak', not leaked,
                 f'{len(run.seen)} response bodies scanned for the {len(sent)} keys this run sent; '
                 f'{"none appeared" if not leaked else "A KEY CAME BACK IN A RESPONSE"}')
    finally:
        if user_id:
            admin.call('DELETE', f'/admin/users/{user_id}', {})
        after = admin.user_count()
        print(f'  users after: {after}')
        if after is None:
            print('  FAIL  the Admin-API user count could not be read after cleanup — unverified.')
            run.failed = True
        elif after != before:
            print('  FAIL  the user count did not return to where it started — a user leaked.')
            run.failed = True
        strays = admin.sweep_stale_fixtures(FIXTURE)
        if strays:
            print(f'  FAIL  {strays} stray ghost-admin-harness-* user(s) existed after cleanup and were swept.')
            run.failed = True

    print('  RESULT: ' + ('FAILED' if run.failed else 'all steps passed'))
    return 1 if run.failed else 0


if __name__ == '__main__':
    sys.exit(main())
