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
— now, or within the next fifteen minutes, so a real deadline passing mid-run cannot slip in — is
exactly the fixture it just seeded: the `seeded` step reads `profiles` for every row the route's
own query would select and fails if it finds a user this run did not create. A real pending
account stops the run rather than being purged by a test.

WHAT IT PROVES, each step PASS or FAIL, exiting non-zero if any step fails. The steps are named
here in the order the run prints them:

  secret         `CRON_SECRET` is in `tools/probe/.env` — without it every call below is a 401 and
                 the run would "pass" its two controls and nothing else. Printed in both modes.
  seeded         the route's due set (fifteen minutes ahead) is exactly {A}; each of A's four
                 prefixes lists exactly one object with HTTP 200 — the positive control the
                 `objects-gone` step is read against — and C's `vote_count` reads 1, the baseline
                 `rows-gone` decrements from. (The rows themselves are evidenced by the seed's
                 own 201s; a seed that fails stops the run before this step.)
  no-header      THE CONTROL, AND IT RUNS FIRST. `GET` with no `Authorization` at all: 401 from
                 THE ROUTE — body `Unauthorized` and `x-matched-path` naming it, so a platform's
                 401 (deployment protection on a preview URL) cannot pass for it —
                 `cache-control: no-store`, and A still there afterwards. Without it a green
                 `purge` proves only that SOMETHING purged A, not that the bearer is what let it
  wrong-secret   the same call with a wrong bearer of the same shape: 401 from the route, A there
  purge          the real bearer: HTTP 200, `{"purged": 1, "failed": 0}`, and `no-store` on the
                 200 too — the response Vercel's "a cached cron response is skipped" is about
  user-gone      `GET /auth/v1/admin/users/{A}` -> 404: the sign-in itself is gone
  rows-gone      every public table whose column `references auth.users(id) on delete cascade` —
                 READ OUT OF THE APPLIED MIGRATIONS, never listed here — holds no row of A's, and
                 C's `vote_count` has dropped from 1 to 0, which is `sync_vote_count` firing
                 INSIDE the cascade. A table the service role cannot read (the schema grants that
                 role the server-written tables only, `:1160`; `edit_locks` is the client's) is
                 printed as unprovable rather than hidden: the cascade is Postgres's and needs no
                 grant, but this harness cannot see it from outside
  objects-gone   every prefix of A's answers HTTP 200 AND lists empty in every one of the four
                 buckets — an errored listing is not an empty one — the `assets` object nested two
                 folders deep included
  anonymised     A's suggestion is STILL THERE (FR-A5) with `user_id` null, `anonymized_at` set,
                 `image_path` null and `image_approved` false
  others-untouched  B (pending but NOT due) keeps its window, its rows and its object; C, who never
                 asked to be deleted, keeps user, suggestion and object
  idempotent     a second call with the bearer: 200 `{"purged": 0, "failed": 0}` and nothing moved

`--check` is the plumbing alone and needs no deployment — and it seeds NOTHING that the route
would purge: one admin create-read-delete on a single fixture user, and one put -> `list-v2` ->
delete under a harness prefix in EACH of the four buckets, which is also the first execution of
the `list-v2` hypothesis. It asserts that the `name` the listing returns is the FULL key rather
than a basename, because `lib/storage-drain.ts` removes what it listed by that field.

NO KEY IS EVER PRINTED. Every key reaches a request through a header built from the environment,
and every command is recorded by the key's variable NAME. The route is called with redirects
DISABLED: a 3xx is a FAIL, never a bearer quietly re-sent to wherever the redirect points.

THE FIXTURE IS CLEANED UP, ROWS INCLUDED. The full run creates three users; A is purged by the
route under test, B and C are deleted by the cleanup with their objects. The two suggestion rows
survive every user delete BY DESIGN (`on delete set null` — FR-A5's anonymisation) and are deleted
here by id, and any stale harness suggestion an earlier run left is swept by its body text at the
start and again after cleanup — the review of 2026-09-07 found six of them on the live board. The
Admin-API user count is read before and after — BEFORE any sweep of strays, so a step that created
a user it should not have is reported as the leak it is rather than tidied away — and a count that
could not be read FAILS the run, because it is the cleanup's control.
"""
import argparse, importlib.util, json, os, re, sys, time
import urllib.error, urllib.parse, urllib.request

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
HARNESS_BODY = 'Seeded by the purge harness.'

# The route's own path constant and bucket lists, READ out of the app rather than retyped here: a
# harness that carries its own copy of the URL proves nothing about the one Vercel invokes.
PURGE_RULE_TS = os.path.join(HERE, '..', '..', 'apps', 'web', 'app', 'api', 'cron',
                             'purge-accounts', 'purge-rule.ts')
# The cascade is READ out of the applied migrations, in order, drops included — never listed here.
MIGRATIONS = os.path.join(HERE, '..', '..', 'supabase', 'migrations')


def cron_path():
    source = open(PURGE_RULE_TS, encoding='utf-8').read()
    found = re.search(r"CRON_PATH\s*=\s*'([^']+)'", source)
    if not found:
        sys.exit('  FAIL  CRON_PATH is not in app/api/cron/purge-accounts/purge-rule.ts')
    return found.group(1)


def buckets():
    """The four bucket names, read out of `purge-rule.ts`'s two lists — the `USER_BUCKETS` block
    itself and `PROJECT_BUCKET`, so a quoted string elsewhere in the file is never a phantom
    bucket — and exactly three plus one, or the file no longer says what this harness assumes."""
    source = open(PURGE_RULE_TS, encoding='utf-8').read()
    block = re.search(r'USER_BUCKETS\s*=\s*\[(.*?)\]\s*as const', source, re.S)
    project = re.search(r"PROJECT_BUCKET\s*=\s*'([a-z-]+)'", source)
    names = re.findall(r"'([a-z-]+)'", block.group(1)) if block else []
    if len(names) != 3 or not project:
        sys.exit(f'  FAIL  purge-rule.ts should carry three USER_BUCKETS and one PROJECT_BUCKET; '
                 f'read {names} and {project and project.group(1)}')
    return names + [project.group(1)]


def cascade_columns():
    """Every (table, column) in `public.*` that `references auth.users(id) on delete cascade`,
    read out of `supabase/migrations/*.sql` in order with `drop table` honoured — so a table added
    later with a cascade is proven here without anyone remembering to list it (CLAUDE.md: counts
    are derived, never restated)."""
    found = {}
    for name in sorted(os.listdir(MIGRATIONS)):
        if not name.endswith('.sql'):
            continue
        sql = open(os.path.join(MIGRATIONS, name), encoding='utf-8').read()
        for table, body in re.findall(r'create table (?:if not exists )?public\.(\w+)\s*\((.*?)\n\);',
                                      sql, re.S):
            for col in re.findall(r'^\s*(\w+)\s+uuid[^\n]*references auth\.users\(id\) on delete cascade',
                                  body, re.M):
                found.setdefault(table, set()).add(col)
        for table in re.findall(r'drop table (?:if exists )?public\.(\w+)', sql):
            found.pop(table, None)
    pairs = sorted((t, c) for t, cols in found.items() for c in cols)
    if not pairs:
        sys.exit('  FAIL  no cascade columns could be read out of supabase/migrations')
    return pairs


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


def sweep_suggestions(sb, secret):
    """Every suggestion row a harness run seeded, by its body text. Returns how many went, or
    None when the delete could not be read back."""
    status, rows = rest(sb, secret, 'DELETE',
                        f'/suggestions?body=eq.{urllib.parse.quote(HARNESS_BODY)}',
                        prefer='return=representation')
    return len(rows) if status < 300 and isinstance(rows, list) else None


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """A redirect is a FAIL, not a detour: the bearer must never be re-sent to wherever a 3xx
    points, and a 308 off the apex would paper over the `routing.ts` pass-through claim."""

    def redirect_request(self, *args, **kwargs):
        return None


_opener = urllib.request.build_opener(NoRedirect)


def call_route(url, secret=None):
    """The route as Vercel calls it: GET, the bearer in a header, no redirects. Returns
    (status, body, headers) with the header names lower-cased."""
    req = urllib.request.Request(url, method='GET',
                                 headers={'Authorization': f'Bearer {secret}'} if secret else {})
    try:
        with _opener.open(req, timeout=300) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None), {k.lower(): v for k, v in r.headers.items()}
    except urllib.error.HTTPError as e:
        raw = e.read()
        headers = {k.lower(): v for k, v in e.headers.items()}
        try:
            return e.code, (json.loads(raw) if raw else None), headers
        except ValueError:
            return e.code, raw.decode('utf-8', 'replace')[:200], headers
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

    def step(self, name, ok, detail):
        print(f'  {"PASS" if ok else "FAIL"}  {name}: {detail}')
        if not ok:
            self.failed = True
        return ok


def iso(seconds_from_now):
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + seconds_from_now))


DAY = 86400
LOOK_AHEAD = 15 * 60


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='plumbing only: keys present, one admin create-read-delete on a single '
                         'fixture user, and one put -> list-v2 -> delete under a harness prefix '
                         'in each of the four buckets. Seeds nothing the route would purge and '
                         'needs no deployment, so it runs before the story is deployed.')
    ap.add_argument('--url', default=APEX,
                    help='where the route lives. The apex by default — routing.ts passes any '
                         'non-/app path through, so it reaches the handler Vercel reaches on the '
                         'generated production URL. A Review run points this at that deployment.')
    args = ap.parse_args()

    env = load_env()
    missing = [k for k in ('SUPABASE_URL', 'SUPABASE_SECRET_KEY') if not env.get(k)]
    if missing:
        print(f'  FAIL  tools/probe/.env is missing: {", ".join(missing)}')
        return 1
    sb, secret = env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY']
    cron_secret = env.get('CRON_SECRET')
    path = cron_path()
    route = args.url.rstrip('/') + path
    BUCKETS = buckets()

    run = Run()
    run.step('secret', bool(cron_secret),
             'CRON_SECRET is in tools/probe/.env' if cron_secret
             else 'CRON_SECRET is NOT in tools/probe/.env — every call to the route would be a 401')
    if not cron_secret and not args.check:
        print('  RESULT: FAILED')
        return 1

    admin = Admin(sb, secret)
    stamp = int(time.time())
    who_all = ('A',) if args.check else ('A', 'B', 'C')
    emails = {'A': f'purge-harness-{stamp}@inflozo.com',
              'B': f'purge-harness-{stamp}-b@inflozo.com',
              'C': f'purge-harness-{stamp}-c@inflozo.com'}

    swept = admin.sweep_stale_fixtures(FIXTURE)
    if swept:
        print(f'  swept {swept} stale purge-harness-* user(s) an earlier run left behind')
    swept_rows = sweep_suggestions(sb, secret)
    if swept_rows:
        print(f'  swept {swept_rows} stale purge-harness suggestion row(s) an earlier run left behind')
    users = admin.users()
    if users is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1
    before = len(users)
    print(f'  users before: {before}')
    print(f'  route: {route}')

    ids, objects, suggestions, purged_by_route = {}, [], [], False
    try:
        for who in who_all:
            status, user = admin.call('POST', '/admin/users', {'email': emails[who], 'email_confirm': True})
            if status not in (200, 201) or not user.get('id'):
                print(f'  FAIL  could not create fixture user {who}: HTTP {status}')
                return 1
            ids[who] = user['id']
        a = ids['A']
        print(f'  fixture user(s) {", ".join(who_all)} created')

        if args.check:
            print('  --check: the plumbing alone — nothing seeded that the route would purge')
            read, back = admin.call('GET', f'/admin/users/{a}')
            run.step('admin-round-trip', read == 200 and back.get('id') == a,
                     f'create, read back -> HTTP {read}')
            # THE `list-v2` HYPOTHESIS, in every bucket. The walker removes `objects[].name`, so a
            # basename here — v1's shape — would make it delete the wrong key or nothing at all.
            # Each probe key is registered for the cleanup BEFORE it is put.
            for bucket in BUCKETS:
                key = f'purge-check-{stamp}/deep/probe.bin'
                objects.append((bucket, key))
                put, _ = storage_put(sb, secret, bucket, key, b'inflozo list-v2 probe')
                listed, body = storage_list_v2(sb, secret, bucket, f'purge-check-{stamp}/')
                names = listed_names(body)
                gone, _ = storage_delete(sb, secret, bucket, key)
                after, rest_body = storage_list_v2(sb, secret, bucket, f'purge-check-{stamp}/')
                run.step(f'list-v2 {bucket}',
                         put in (200, 201) and listed == 200 and names == [key] and
                         gone in (200, 204) and after == 200 and listed_names(rest_body) == [],
                         f'put -> HTTP {put}; list-v2 -> HTTP {listed} {names}; '
                         f'delete -> HTTP {gone}; the prefix now lists {len(listed_names(rest_body))}')
        else:
            b, c = ids['B'], ids['C']

            # A's site, snapshot, project, asset and notification; a suggestion each by A and C;
            # A's vote on C's. Seeded with the SERVICE ROLE — the grant list covers every table a
            # server route writes (:1160-1167) and `freeze_columns` binds neither deletion column
            # (:293, :886).
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
                                                 'body': HARNESS_BODY,
                                                 'image_path': f'suggestion-images/{a}/pic.png',
                                                 'image_approved': True})
            suggestion_c = seed('/suggestions', {'user_id': c, 'category': 'feature',
                                                 'title': f'C asks for something {stamp}',
                                                 'body': HARNESS_BODY})
            suggestions += [suggestion_a['id'], suggestion_c['id']]
            seed('/suggestion_votes', {'suggestion_id': suggestion_c['id'], 'user_id': a})

            # Every prefix of A's, one per bucket, written ONCE and read by `seeded` (must list one)
            # and `objects-gone` (must list none). The set of buckets is checked against the app's.
            a_prefixes = [('assets', f'{a}/'), ('site-snapshots', f'{a}/'),
                          ('suggestion-images', f'{a}/'), ('deploy-artifacts', f'{project["id"]}/')]
            if sorted(bucket for bucket, _ in a_prefixes) != sorted(BUCKETS):
                print(f'  FAIL  purge-rule.ts walks {sorted(BUCKETS)}; this harness seeds '
                      f'{sorted(bucket for bucket, _ in a_prefixes)} — a bucket would go unproven')
                return 1

            # One object per bucket for A — the `assets` one two folders deep, which is what makes
            # the flat `list-v2` walk worth proving — plus one each for B and C that must survive.
            # Every key is registered for the cleanup BEFORE it is put.
            for bucket, key in (
                ('assets', f'{a}/{project["id"]}/nested/one.png'),
                ('site-snapshots', f'{a}/{site["id"]}/theme.zip'),
                ('suggestion-images', f'{a}/pic.png'),
                ('deploy-artifacts', f'{project["id"]}/theme.zip'),
                ('assets', f'{b}/keep.png'),
                ('assets', f'{c}/keep.png'),
            ):
                objects.append((bucket, key))
                status, body = storage_put(sb, secret, bucket, key, b'inflozo purge harness')
                if status not in (200, 201):
                    print(f'  FAIL  could not put {bucket}/{key}: HTTP {status} {json.dumps(body)[:200]}')
                    return 1
            print(f'  fixture rows and {len(objects)} objects seeded across {len(BUCKETS)} buckets')

            # A is DUE (deadline yesterday); B is pending but NOT due (deadline tomorrow); C never asked.
            for who, user_id, purge_after in (('A', a, iso(-DAY)), ('B', b, iso(DAY))):
                status, _ = rest(sb, secret, 'PATCH', f'/profiles?user_id=eq.{user_id}',
                                 {'deleted_at': iso(-14 * DAY if who == 'A' else 0),
                                  'purge_after': purge_after}, prefer='return=representation')
                if status >= 300:
                    print(f"  FAIL  could not open {who}'s window: HTTP {status}")
                    return 1

            def a_prefix_listings():
                out = {}
                for bucket, prefix in a_prefixes:
                    status, body = storage_list_v2(sb, secret, bucket, prefix)
                    out[bucket] = (status, listed_names(body))
                return out

            def c_votes():
                _, row = rest(sb, secret, 'GET', f'/suggestions?id=eq.{suggestion_c["id"]}&select=vote_count')
                return row[0]['vote_count'] if isinstance(row, list) and row else 'unreadable'

            # ── seeded, and THE SAFETY CONTROL: the route's own due query, run here first and
            #    FIFTEEN MINUTES AHEAD. If it selects anybody this run did not create, the button
            #    is not pressed. Then the positive controls the later steps are read against.
            status, due = rest(sb, secret, 'GET',
                               '/profiles?deleted_at=not.is.null&purge_after=lte.'
                               f'{iso(LOOK_AHEAD)}&select=user_id')
            due_ids = [row['user_id'] for row in (due or [])] if isinstance(due, list) else []
            strangers = [u for u in due_ids if u not in ids.values()]
            listings = a_prefix_listings()
            votes_before = c_votes()
            ok = (status == 200 and due_ids == [a] and not strangers
                  and all(st == 200 and len(names) == 1 for st, names in listings.values())
                  and votes_before == 1)
            run.step('seeded', ok,
                     f'the route would purge {len(due_ids)} account(s) within {LOOK_AHEAD // 60} min, '
                     f'{"exactly A" if due_ids == [a] else due_ids}; A\'s prefixes list '
                     f'{json.dumps({k: len(v[1]) for k, v in listings.items()})} object(s) '
                     f'(HTTP {sorted({v[0] for v in listings.values()})}); C\'s vote_count is {votes_before}')
            if strangers:
                print(f'  FAIL  {len(strangers)} account(s) this run did not create are DUE. '
                      'Refusing to call the route: it would purge them. Investigate before re-running.')
                return 1
            if not ok:
                return 1

            def a_exists():
                return admin.call('GET', f'/admin/users/{a}')[0] == 200

            # ── THE CONTROLS, FIRST. No header at all, then a wrong bearer of the same shape.
            #    Each must be a 401 FROM THE ROUTE, not from anything in front of it.
            status, body, headers = call_route(route)
            run.step('no-header', route_401(status, body, headers, path) and a_exists(),
                     f'GET with no Authorization -> HTTP {status} {body!r}, x-matched-path '
                     f'{headers.get("x-matched-path")!r}, cache-control {headers.get("cache-control")!r}; '
                     f'A still there = {a_exists()}')
            status, body, headers = call_route(route, 'not-the-secret-but-the-same-shape')
            run.step('wrong-secret', route_401(status, body, headers, path) and a_exists(),
                     f'GET with a wrong bearer -> HTTP {status} {body!r}, x-matched-path '
                     f'{headers.get("x-matched-path")!r}; A still there = {a_exists()}')

            # ── the bearer
            status, body, headers = call_route(route, cron_secret)
            purged_by_route = isinstance(body, dict) and body.get('purged', 0) >= 1
            cache = (headers.get('cache-control') or '').lower()
            run.step('purge', status == 200 and body == {'purged': 1, 'failed': 0} and 'no-store' in cache,
                     f'GET with CRON_SECRET -> HTTP {status} {json.dumps(body)}, cache-control {cache!r}')

            gone, _ = admin.call('GET', f'/admin/users/{a}')
            run.step('user-gone', gone == 404, f'GET /auth/v1/admin/users/A -> HTTP {gone}')

            # ── the cascade, every table the migrations say cascades, plus C's vote_count read back
            left, unprovable = {}, []
            for table, col in cascade_columns():
                status, rows = rest(sb, secret, 'GET', f'/{table}?{col}=eq.{a}&select={col}')
                if status == 200 and isinstance(rows, list):
                    left[table] = len(rows)
                elif status in (401, 403):
                    unprovable.append(table)
                else:
                    left[table] = f'HTTP {status}'
            votes = c_votes()
            leftover = {t: n for t, n in left.items() if n != 0}
            run.step('rows-gone', not leftover and votes == 0,
                     (f'{len(left)} cascade tables read, A left in none' if not leftover
                      else f'A still in {json.dumps(leftover)}')
                     + f'; C\'s vote_count is {votes} (it was {votes_before})'
                     + (f'; unprovable under the service role (no grant, schema :1160): '
                        f'{unprovable}' if unprovable else ''))

            listings = a_prefix_listings()
            run.step('objects-gone', all(st == 200 and not names for st, names in listings.values()),
                     f'every prefix of A\'s: {json.dumps({k: v[1] for k, v in listings.items()})} '
                     f'(HTTP {sorted({v[0] for v in listings.values()})})')

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
        # The suggestion rows survive every user delete by design (`on delete set null`), so they
        # are deleted by id here — the review found six orphans on the live board before this line.
        if suggestions:
            rest(sb, secret, 'DELETE', f'/suggestions?id=in.({",".join(suggestions)})')
        for who, user_id in ids.items():
            admin.call('DELETE', f'/admin/users/{user_id}', {})
        after = admin.user_count()
        print(f'  fixture user(s) deleted; users after: {after}')
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
        stray_rows = sweep_suggestions(sb, secret)
        if stray_rows is None:
            print('  FAIL  the harness suggestion rows could not be swept after cleanup — unverified.')
            run.failed = True
        elif stray_rows:
            print(f'  FAIL  {stray_rows} harness suggestion row(s) existed after cleanup and were swept.')
            run.failed = True
        if purged_by_route:
            print("  (A was removed by the route under test, which is the run's whole point)")

    print('  RESULT: ' + ('FAILED' if run.failed else 'all steps passed'))
    return 1 if run.failed else 0


if __name__ == '__main__':
    sys.exit(main())
