#!/usr/bin/env python3
"""FR-A5's purge, driven against the deployed route and read off the wire. Story 2.6.

    python3 tools/probe/run-verify-account-purge.py --check   # plumbing only; needs no deployment
    python3 tools/probe/run-verify-account-purge.py           # the whole purge (Review and Deploy)
    python3 tools/probe/run-verify-account-purge.py --url https://<deployment>.vercel.app

WHY IT EXISTS. Story 2.6 rests on claims about Supabase Storage, GoTrue and Vercel, and CLAUDE.md's
first standing rule — cite or execute, never assert — makes each one a hypothesis until it is run
against the real thing: that the hosted storage-api serves `POST /object/list-v2/{bucket}` FLAT,
with full keys, so the walker may `remove()` exactly what it listed; that the service role can put,
list and delete in ALL FOUR buckets (Story 2.5 proved only `site-snapshots`); that GoTrue's
`DELETE /admin/users/{id}` cascades every `references auth.users(id) on delete cascade` in the
public schema, `sync_vote_count` firing inside that cascade included; and that the apex passes
`/api/cron/purge-accounts` through to the same handler Vercel invokes on the generated production
URL (`routing.ts`). Every one is executed here.

IT CALLS A ROUTE THAT DELETES ACCOUNTS, ON THE LIVE PROJECT. That is the point of it and it is also
the danger, so the run REFUSES TO PRESS THE BUTTON unless the set of accounts the route would purge
is exactly the fixture it just seeded: the `seeded` step reads `profiles` for every row the route's
own query would select and fails if it finds a user this run did not create. A real pending account
stops the run rather than being purged by a test.

WHAT IT PROVES, each step PASS or FAIL, exiting non-zero if any step fails. The steps are named
here in the order the run prints them:

  secret         `CRON_SECRET` is in `tools/probe/.env` — without it every call below is a 401 and
                 the run would "pass" its two controls and nothing else
  seeded         A's fixture is really there — the profile window, the rows in every table, one
                 object in each of the four buckets — AND the route's due set is exactly {A}
  no-header      THE CONTROL, AND IT RUNS FIRST. `GET` with no `Authorization` at all: 401,
                 `cache-control: no-store`, and A still there afterwards. Without it a green
                 `purge` proves only that SOMETHING purged A, not that the bearer is what let it
  wrong-secret   the same call with a wrong bearer of the same shape: 401, A still there
  purge          the real bearer: HTTP 200 and `{"purged": 1, "failed": 0}`
  user-gone      `GET /auth/v1/admin/users/{A}` -> 404: the sign-in itself is gone
  rows-gone      every one of A's rows — profile, site, snapshot, project, asset, notification and
                 the vote — is gone from every table, and C's `vote_count` has dropped by one,
                 which is `sync_vote_count` firing INSIDE the cascade
  objects-gone   every prefix of A's lists empty in every one of the four buckets, the `assets`
                 object nested two folders deep included
  anonymised     A's suggestion is STILL THERE (FR-A5) with `user_id` null, `anonymized_at` set,
                 `image_path` null and `image_approved` false
  others-untouched  B (pending but NOT due) keeps its window, its rows and its object; C, who never
                 asked to be deleted, keeps user, suggestion and object
  idempotent     a second call with the bearer: 200 `{"purged": 0, "failed": 0}` and nothing moved

`--check` is the plumbing alone and needs no deployment: the keys, one admin create-read-delete,
and one put -> `list-v2` -> delete under a harness prefix in EACH of the four buckets — which is
also the first execution of the `list-v2` hypothesis, and it asserts that the `name` the listing
returns is the FULL key rather than a basename, because `lib/storage-drain.ts` removes what it
listed by that field.

NO KEY IS EVER PRINTED. Every key reaches a request through a header built from the environment,
and every command is recorded by the key's variable NAME.

THREE FIXTURE USERS ARE CREATED. A is purged by the route under test; B and C are deleted by the
cleanup with their objects. The Admin-API user count is read before and after — BEFORE any sweep of
strays, so a step that created a user it should not have is reported as the leak it is rather than
tidied away — and a count that could not be read FAILS the run, because it is the cleanup's control.
"""
import argparse, importlib.util, json, os, re, sys, time
import urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APEX = 'https://inflozo.com'


def _sibling(name):
    """`run-verify-passkeys` is not an identifier, so it cannot be `import`ed by name."""
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_passkeys = _sibling('run-verify-passkeys')
Admin, load_env = _passkeys.Admin, _passkeys.load_env
_deletion = _sibling('run-verify-account-deletion')
_request, rest = _deletion._request, _deletion.rest

FIXTURE = r'^purge-harness-\d+(-b|-c)?@inflozo\.com$'

# The route's own path constant, READ out of the app rather than retyped here: a harness that
# carries its own copy of the URL proves nothing about the one Vercel invokes.
PURGE_RULE_TS = os.path.join(HERE, '..', '..', 'apps', 'web', 'app', 'api', 'cron',
                             'purge-accounts', 'purge-rule.ts')


def cron_path():
    source = open(PURGE_RULE_TS, encoding='utf-8').read()
    found = re.search(r"CRON_PATH\s*=\s*'([^']+)'", source)
    if not found:
        sys.exit('  FAIL  CRON_PATH is not in app/api/cron/purge-accounts/purge-rule.ts')
    return found.group(1)


def buckets():
    """The four bucket names, read out of `purge-rule.ts`'s two lists — never a fifth list here."""
    source = open(PURGE_RULE_TS, encoding='utf-8').read()
    names = re.findall(r"^\s*'([a-z-]+)',?\s*//", source, re.MULTILINE)
    project = re.search(r"PROJECT_BUCKET\s*=\s*'([a-z-]+)'", source)
    if len(names) < 3 or not project:
        sys.exit('  FAIL  the bucket names could not be read out of purge-rule.ts')
    return names + [project.group(1)]


# ── Storage over the wire, BUCKET-PARAMETRISED. The sibling harness's three helpers are bound to
#    `site-snapshots`; this story touches all four, and `list-v2` is a POST the sibling has never
#    made (Story 2.5 predates it).
def storage_put(sb, secret, bucket, key, payload, mime='application/octet-stream'):
    return _request('POST', f'{sb.rstrip("/")}/storage/v1/object/{bucket}/{key}',
                    secret, payload, content_type=mime)


def storage_list_v2(sb, secret, bucket, prefix, limit=100):
    return _request('POST', f'{sb.rstrip("/")}/storage/v1/object/list-v2/{bucket}',
                    secret, {'prefix': prefix, 'limit': limit})


def storage_delete(sb, secret, bucket, key):
    return _request('DELETE', f'{sb.rstrip("/")}/storage/v1/object/{bucket}/{key}', secret, {})


def listed_names(body):
    """`list-v2` answers `{hasNext, folders, objects, nextCursor}`; v1 answers a bare array. Both
    are read, so a hosted storage-api that has not shipped v2 yet is a legible failure and not a
    TypeError."""
    if isinstance(body, dict):
        return [o.get('name') for o in body.get('objects') or []]
    if isinstance(body, list):
        return [o.get('name') for o in body]
    return []


def call_route(url, secret=None):
    """The route as Vercel calls it: GET, and the bearer in a header. Returns (status, body, headers)."""
    req = urllib.request.Request(url, method='GET',
                                 headers={'Authorization': f'Bearer {secret}'} if secret else {})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None), dict(r.headers)
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, (json.loads(raw) if raw else None), dict(e.headers)
        except ValueError:
            return e.code, raw.decode('utf-8', 'replace')[:200], dict(e.headers)
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return 0, str(e), {}


class Run:
    """PASS/FAIL lines in the sibling harnesses' shape, and one exit code out of them."""

    def __init__(self):
        self.failed = False

    def step(self, name, ok, detail):
        print(f'  {"PASS" if ok else "FAIL"}  {name}: {detail}')
        if not ok:
            self.failed = True
        return ok


def iso(seconds_from_now):
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + seconds_from_now))


DAY = 86400


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='plumbing only: keys present, one admin create-read-delete, and one '
                         'put -> list-v2 -> delete under a harness prefix in each of the four '
                         'buckets. No deployment needed, so it runs before the story is deployed.')
    ap.add_argument('--url', default=APEX,
                    help='where the route lives. The apex by default — routing.ts passes any '
                         'non-/app path through, so it reaches the handler Vercel reaches on the '
                         'generated production URL. A Review run points this at that deployment.')
    args = ap.parse_args()

    env = load_env()
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'] + ([] if args.check else ['CRON_SECRET'])
    missing = [k for k in needed if not env.get(k)]
    if missing:
        print(f'  FAIL  tools/probe/.env is missing: {", ".join(missing)}')
        return 1
    sb, secret = env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY']
    cron_secret = env.get('CRON_SECRET')
    route = args.url.rstrip('/') + cron_path()
    BUCKETS = buckets()

    run = Run()
    admin = Admin(sb, secret)
    stamp = int(time.time())
    emails = {'A': f'purge-harness-{stamp}@inflozo.com',
              'B': f'purge-harness-{stamp}-b@inflozo.com',
              'C': f'purge-harness-{stamp}-c@inflozo.com'}

    swept = admin.sweep_stale_fixtures(FIXTURE)
    if swept:
        print(f'  swept {swept} stale purge-harness-* user(s) an earlier run left behind')
    users = admin.users()
    if users is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1
    before = len(users)
    print(f'  users before: {before}')
    print(f'  route: {route}')

    ids, objects, purged_by_route = {}, [], False
    try:
        for who, email in emails.items():
            status, user = admin.call('POST', '/admin/users', {'email': email, 'email_confirm': True})
            if status not in (200, 201) or not user.get('id'):
                print(f'  FAIL  could not create fixture user {who}: HTTP {status}')
                return 1
            ids[who] = user['id']
        a, b, c = ids['A'], ids['B'], ids['C']
        print('  fixture users A, B and C created')

        # A's site, snapshot, project, asset and notification; a suggestion each by A and C; A's
        # vote on C's. Seeded with the SERVICE ROLE — the grant list covers every table (:1167)
        # and `freeze_columns` binds neither deletion column (:293, :886).
        def seed(path, body):
            status, row = rest(sb, secret, 'POST', path, body, prefer='return=representation')
            if status not in (200, 201) or not row:
                print(f'  FAIL  could not seed {path}: HTTP {status} {json.dumps(row)[:200]}')
                sys.exit(1)
            return row[0]

        site = seed('/sites', {'user_id': a, 'url': f'https://purge-{stamp}.example',
                               'title': f'Purge Harness {stamp}'})
        project = seed('/projects', {'user_id': a, 'name': 'Purge Harness',
                                     'slug': f'purge-harness-{stamp}', 'style_pack': {}})
        seed('/site_snapshots', {'user_id': a, 'site_id': site['id'],
                                 'storage_path': f'site-snapshots/{a}/{site["id"]}/theme.zip',
                                 'theme_name': 'casper'})
        seed('/assets', {'user_id': a, 'path': f'assets/{a}/{project["id"]}/nested/one.png',
                         'display_name': 'one.png', 'bytes': 12, 'stored_bytes': 12,
                         'mime': 'image/png', 'hash': f'purge{stamp}'})
        seed('/notifications', {'user_id': a, 'kind': 'announcement', 'title': 'Purge harness'})
        suggestion_a = seed('/suggestions', {'user_id': a, 'category': 'feature',
                                             'title': f'A asks for something {stamp}',
                                             'body': 'Seeded by the purge harness.',
                                             'image_path': f'suggestion-images/{a}/pic.png',
                                             'image_approved': True})
        suggestion_c = seed('/suggestions', {'user_id': c, 'category': 'feature',
                                             'title': f'C asks for something {stamp}',
                                             'body': 'Seeded by the purge harness.'})
        seed('/suggestion_votes', {'suggestion_id': suggestion_c['id'], 'user_id': a})

        # One object per bucket for A — the `assets` one two folders deep, which is what makes the
        # flat `list-v2` walk worth proving — plus one each for B and C that must survive.
        for bucket, key in (
            ('assets', f'{a}/{project["id"]}/nested/one.png'),
            ('site-snapshots', f'{a}/{site["id"]}/theme.zip'),
            ('suggestion-images', f'{a}/pic.png'),
            ('deploy-artifacts', f'{project["id"]}/theme.zip'),
            ('assets', f'{b}/keep.png'),
            ('assets', f'{c}/keep.png'),
        ):
            status, body = storage_put(sb, secret, bucket, key, b'inflozo purge harness')
            if status not in (200, 201):
                print(f'  FAIL  could not put {bucket}/{key}: HTTP {status} {json.dumps(body)[:200]}')
                return 1
            objects.append((bucket, key))
        print(f'  fixture rows and {len(objects)} objects seeded across {len(BUCKETS)} buckets')

        # A is DUE (deadline yesterday); B is pending but NOT due (deadline tomorrow); C never asked.
        for who, user_id, purge_after in (('A', a, iso(-DAY)), ('B', b, iso(DAY))):
            status, _ = rest(sb, secret, 'PATCH', f'/profiles?user_id=eq.{user_id}',
                             {'deleted_at': iso(-14 * DAY if who == 'A' else 0),
                              'purge_after': purge_after}, prefer='return=representation')
            if status >= 300:
                print(f"  FAIL  could not open {who}'s window: HTTP {status}")
                return 1

        if args.check:
            print('  --check: the plumbing alone, no deployment needed')
            run.step('secret', bool(cron_secret),
                     'CRON_SECRET is in tools/probe/.env' if cron_secret
                     else 'CRON_SECRET is NOT in tools/probe/.env — the full run would 401 everywhere')
            read, back = admin.call('GET', f'/admin/users/{a}')
            run.step('admin-round-trip', read == 200 and back.get('id') == a,
                     f'create, read back -> HTTP {read}')
            # THE `list-v2` HYPOTHESIS, in every bucket. The walker removes `objects[].name`, so a
            # basename here — v1's shape — would make it delete the wrong key or nothing at all.
            for bucket in BUCKETS:
                key = f'purge-check-{stamp}/deep/probe.bin'
                put, _ = storage_put(sb, secret, bucket, key, b'inflozo list-v2 probe')
                listed, body = storage_list_v2(sb, secret, bucket, f'purge-check-{stamp}/')
                names = listed_names(body)
                gone, _ = storage_delete(sb, secret, bucket, key)
                after, rest_body = storage_list_v2(sb, secret, bucket, f'purge-check-{stamp}/')
                run.step(f'list-v2 {bucket}',
                         put in (200, 201) and listed == 200 and names == [key] and
                         gone in (200, 204) and listed_names(rest_body) == [],
                         f'put -> HTTP {put}; list-v2 -> HTTP {listed} {names}; '
                         f'delete -> HTTP {gone}; the prefix now lists {len(listed_names(rest_body))}')
        else:
            # ── seeded, and THE SAFETY CONTROL: the route's own due query, run here first. If it
            #    selects anybody this run did not create, the button is not pressed.
            status, due = rest(sb, secret, 'GET',
                               '/profiles?deleted_at=not.is.null&purge_after=lte.'
                               f'{iso(0)}&select=user_id')
            due_ids = [row['user_id'] for row in (due or [])] if isinstance(due, list) else []
            strangers = [u for u in due_ids if u not in ids.values()]
            seeded_object = storage_list_v2(sb, secret, 'assets', f'{a}/')[1]
            ok = (status == 200 and due_ids == [a] and not strangers
                  and len(listed_names(seeded_object)) == 1)
            run.step('seeded', ok,
                     f'the route would purge {len(due_ids)} account(s), {"exactly A" if due_ids == [a] else due_ids}; '
                     f"A's assets prefix lists {len(listed_names(seeded_object))} object(s)")
            if strangers:
                print(f'  FAIL  {len(strangers)} account(s) this run did not create are DUE. '
                      'Refusing to call the route: it would purge them. Investigate before re-running.')
                return 1
            if not ok:
                return 1

            def a_exists():
                return admin.call('GET', f'/admin/users/{a}')[0] == 200

            # ── THE CONTROLS, FIRST. No header at all, then a wrong bearer of the same shape.
            status, body, headers = call_route(route)
            cache = (headers.get('cache-control') or headers.get('Cache-Control') or '').lower()
            run.step('no-header', status == 401 and 'no-store' in cache and a_exists(),
                     f'GET with no Authorization -> HTTP {status}, cache-control {cache!r}; '
                     f'A still there = {a_exists()}')
            status, body, _ = call_route(route, 'not-the-secret-but-the-same-shape')
            run.step('wrong-secret', status == 401 and a_exists(),
                     f'GET with a wrong bearer -> HTTP {status}; A still there = {a_exists()}')

            # ── the bearer
            status, body, headers = call_route(route, cron_secret)
            purged_by_route = isinstance(body, dict) and body.get('purged', 0) >= 1
            run.step('purge', status == 200 and body == {'purged': 1, 'failed': 0},
                     f'GET with CRON_SECRET -> HTTP {status} {json.dumps(body)}')

            gone, _ = admin.call('GET', f'/admin/users/{a}')
            run.step('user-gone', gone == 404, f'GET /auth/v1/admin/users/A -> HTTP {gone}')

            # ── the cascade, table by table, plus C's vote_count read back
            left = {}
            for table, query in (('profiles', f'user_id=eq.{a}'), ('sites', f'user_id=eq.{a}'),
                                 ('site_snapshots', f'user_id=eq.{a}'), ('projects', f'user_id=eq.{a}'),
                                 ('assets', f'user_id=eq.{a}'), ('notifications', f'user_id=eq.{a}'),
                                 ('suggestion_votes', f'user_id=eq.{a}')):
                _, rows = rest(sb, secret, 'GET', f'/{table}?{query}&select=*')
                left[table] = len(rows) if isinstance(rows, list) else 'unreadable'
            _, c_row = rest(sb, secret, 'GET', f'/suggestions?id=eq.{suggestion_c["id"]}&select=vote_count')
            votes = c_row[0]['vote_count'] if isinstance(c_row, list) and c_row else 'unreadable'
            run.step('rows-gone', all(v == 0 for v in left.values()) and votes == 0,
                     f'{json.dumps(left)}; C\'s vote_count is {votes} (it was 1)')

            still = {}
            for bucket, prefix in (('assets', f'{a}/'), ('site-snapshots', f'{a}/'),
                                   ('suggestion-images', f'{a}/'),
                                   ('deploy-artifacts', f'{project["id"]}/')):
                _, body = storage_list_v2(sb, secret, bucket, prefix)
                still[bucket] = listed_names(body)
            run.step('objects-gone', all(not names for names in still.values()),
                     f'every prefix of A\'s: {json.dumps(still)}')

            _, row = rest(sb, secret, 'GET',
                          f'/suggestions?id=eq.{suggestion_a["id"]}'
                          '&select=user_id,anonymized_at,image_path,image_approved')
            s = row[0] if isinstance(row, list) and row else {}
            run.step('anonymised',
                     bool(row) and s.get('user_id') is None and s.get('anonymized_at')
                     and s.get('image_path') is None and s.get('image_approved') is False,
                     f"A's suggestion: {json.dumps(s)}")

            _, b_profile = rest(sb, secret, 'GET',
                                f'/profiles?user_id=eq.{b}&select=deleted_at,purge_after')
            b_object = listed_names(storage_list_v2(sb, secret, 'assets', f'{b}/')[1])
            c_object = listed_names(storage_list_v2(sb, secret, 'assets', f'{c}/')[1])
            c_user, _ = admin.call('GET', f'/admin/users/{c}')
            _, c_suggestion = rest(sb, secret, 'GET',
                                   f'/suggestions?id=eq.{suggestion_c["id"]}&select=user_id')
            bp = b_profile[0] if isinstance(b_profile, list) and b_profile else {}
            run.step('others-untouched',
                     bool(bp.get('deleted_at')) and bool(bp.get('purge_after')) and len(b_object) == 1
                     and c_user == 200 and len(c_object) == 1
                     and isinstance(c_suggestion, list) and c_suggestion
                     and c_suggestion[0]['user_id'] == c,
                     f'B keeps its window ({json.dumps(bp)}) and {len(b_object)} object(s); '
                     f'C -> HTTP {c_user}, {len(c_object)} object(s), suggestion still C\'s = '
                     f'{bool(c_suggestion) and c_suggestion[0]["user_id"] == c}')

            status, body, _ = call_route(route, cron_secret)
            run.step('idempotent', status == 200 and body == {'purged': 0, 'failed': 0},
                     f'a second GET with CRON_SECRET -> HTTP {status} {json.dumps(body)}')
    finally:
        # Objects FIRST — AD-32's order, in the cleanup too. A's are already gone if the route
        # worked; a delete of a key that is not there is not an error and is the right control.
        for bucket, key in objects:
            storage_delete(sb, secret, bucket, key)
        for who, user_id in ids.items():
            admin.call('DELETE', f'/admin/users/{user_id}', {})
        after = admin.user_count()
        print(f'  fixture users deleted; users after: {after}')
        if after is None:
            print('  FAIL  the Admin-API user count could not be read after cleanup — unverified.')
            run.failed = True
        elif after != before:
            print('  FAIL  the user count did not return to where it started — a user leaked.')
            run.failed = True
        strays = admin.sweep_stale_fixtures(FIXTURE)
        if strays:
            print(f'  FAIL  {strays} stray purge-harness-* user(s) existed after cleanup and were swept.')
            run.failed = True
        if purged_by_route:
            print("  (A was removed by the route under test, which is the run's whole point)")

    print('  RESULT: ' + ('FAILED' if run.failed else 'all steps passed'))
    return 1 if run.failed else 0


if __name__ == '__main__':
    sys.exit(main())
