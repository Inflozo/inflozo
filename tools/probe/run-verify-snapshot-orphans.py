#!/usr/bin/env python3
"""FR-C6's snapshot orphan purge, driven against the deployed route and read off the wire. Story 7.20b.

    python3 tools/probe/run-verify-snapshot-orphans.py --check          # offline: the app's own rule, words, schedule, email
    python3 tools/probe/run-verify-snapshot-orphans.py                  # the whole purge (Review and Deploy)
    python3 tools/probe/run-verify-snapshot-orphans.py --url https://<deployment>.vercel.app
    python3 tools/probe/run-verify-snapshot-orphans.py --owner-test umngkmr+orphan720b@gmail.com

`run-verify-account-purge.py` IS THE PATTERN, and its helpers are imported rather than copied: the
route called with redirects DISABLED (a 3xx is a FAIL, never a bearer re-sent), a 401 that must come
FROM THE ROUTE (`x-matched-path`, `no-store`) so a platform's 401 cannot pass for the control, and a run
that REFUSES TO PRESS THE BUTTON unless the route's due set is exactly its own fixture.

THE CRON LIVES ON THE APEX, never on `app.inflozo.com` (`routing.ts` rewrites every app-host path under
`/app`, so `/api/cron/*` is a 404 there by construction — `run-verify-site-health.py`'s finding).

THE APP'S OWN RULE, NEVER A COPY. `CRON_PATH`, the two constants, `dueSince`, `decide`, `purgeDateOf`,
`ORPHANS` and `orphanEmail` are evaluated out of `apps/web` with `node --experimental-strip-types`, so the
dates and words printed are the ones the customer reads (standing rule 4).

THE STEPS, in the order a run prints them:

  keys          every key the mode needs is in `tools/probe/.env`, BY NAME. Printed in every mode
  app           the app's figures and words, read out of `lib/orphan-rule.ts` and printed
  schedule      `vercel.json` schedules `CRON_PATH` once a day and a `route.ts` is there — both READ
  decide        the app's `decide` over the four fixture shapes: not due → wait, notice due → notice,
                purge due (notice n+1 days old) → purge; the reconnected control is outside the due set
  email         `orphanEmail` composed for the notice fixture: the site, the theme, both dates, the button
                to `/sites#original-themes`, the only-email note. Composed, never sent, in `--check`
  ── from here on a deployment and the live project are needed; `--check` stops above.
  seeded        one fixture user (a `+orphan-harness-` alias of `RESEND_TEST_INBOX`, so the one real email
                lands in the test inbox) with four disconnected-site records, each with one object under
                `site-snapshots/{user}/{site}/` and its `site_snapshots` row: W not yet due, T notice due, P
                purge due (notice n+1 days old), R reconnected (`disconnected_at` null, an old notice). The
                route's own due query, run here FIFTEEN MINUTES AHEAD, selects exactly {T, P} — any row this
                run did not create stops the run before the route is ever called — and every prefix lists one
  no-header     THE CONTROL, FIRST: no `Authorization` → 401 from the route, and nothing moved
  wrong-secret  a wrong bearer of the same shape → 401 from the route, and nothing moved
  run           the real bearer → 200 `{"noticed": 1, "purged": 1, "failed": 0}` with `no-store`. `noticed`
                counts only a send Resend accepted with an id, which the route logs as
                `purge-snapshots: notice sent` (read it with `npx vercel logs`)
  noticed       T's `orphan_notice_at` stamped inside the run's window
  purged        P's prefix lists EMPTY (HTTP 200 — an errored listing is not an empty one) and its row is gone
  untouched     W's and R's rows are field-for-field what they were, and each object's bytes hash the same
  idempotent    a second call → 200 `{"noticed": 0, "purged": 0, "failed": 0}`, T's stamp unmoved
  cleanup       (the `finally`) every fixture object removed, the user deleted (its sites and rows with it),
                the Admin-API user count back where it started, no stray fixture left

`--owner-test <alias>` is Deploy's, on the owner's in-session go: it creates the alias if it is not there,
plants the owner's three disconnected sites (orphan-a.example 80 days ago; orphan-b.example 100 days ago,
warned 15 days ago; T1's own address 10 days ago), each holding a small theme named casper, guards the due
set to exactly A and B, runs the route ONCE, reads back A stamped, B gone and T1's untouched, and prints the
two dates the spec's manual test needs (`purgeDateOf`'s, through `deadlineLabel`). It leaves the alias in
place: its two themes delete themselves on their dates.

NO KEY AND NO ADDRESS IS EVER PRINTED. Keys reach requests through headers built from the environment.
"""
import argparse, calendar, hashlib, importlib.util, io, json, os, re, subprocess, sys, time, zipfile
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(HERE, '..', '..', 'apps', 'web')
APEX = 'https://inflozo.com'
BUCKET = 'site-snapshots'
LOOK_AHEAD = 15 * 60
DAY = 86400


def _sibling(name):
    """A hyphenated harness is not an identifier, so it cannot be `import`ed by name."""
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_passkeys = _sibling('run-verify-passkeys')
Admin, load_env = _passkeys.Admin, _passkeys.load_env
_purge = _sibling('run-verify-account-purge')
rest, _request, Run = _purge.rest, _purge._request, _purge.Run
call_route, route_401, listed_names = _purge.call_route, _purge.route_401, _purge.listed_names


def app(expression):
    """One expression over the app's own modules (`r` orphan-rule, `c` connect-rule, `m` orphan-email,
    `d` deletion-rule), evaluated by node from `apps/web`. Returns (value, error)."""
    script = (
        "const out = async () => { const r = await import('./lib/orphan-rule.ts');"
        " const c = await import('./lib/connect-rule.ts');"
        " const m = await import('./lib/orphan-email.ts');"
        " const d = await import('./app/(app)/app/(authed)/account/deletion-rule.ts');"
        f' return ({expression}); }};'
        ' out().then((v) => console.log("<<<" + JSON.stringify(v) + ">>>"))'
        '     .catch((e) => { console.error(e.message); process.exit(1) })'
    )
    proc = subprocess.run(['node', '--experimental-strip-types', '-e', script],
                          cwd=os.path.abspath(WEB), capture_output=True, text=True, timeout=120)
    found = re.search(r'<<<(.*)>>>', proc.stdout, re.S)
    if proc.returncode != 0 or not found:
        return None, ((proc.stderr or proc.stdout).strip().splitlines() or ['node failed'])[-1]
    return json.loads(found.group(1)), None


def iso(seconds_from_now, now=None):
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime((now or time.time()) + seconds_from_now))


def tiny_zip(name):
    """A real zip of one `package.json`, so the owner's Download opens as a theme would."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr(f'{name}/package.json', json.dumps({'name': name, 'version': '1.0.0'}))
    return buf.getvalue()


def storage_put(sb, secret, key, payload):
    return _request('POST', f'{sb.rstrip("/")}/storage/v1/object/{BUCKET}/{key}', secret, payload,
                    content_type='application/zip')


def storage_get(sb, secret, key):
    return _request('GET', f'{sb.rstrip("/")}/storage/v1/object/{BUCKET}/{key}', secret)


def storage_list(sb, secret, prefix):
    status, body = _request('POST', f'{sb.rstrip("/")}/storage/v1/object/list-v2/{BUCKET}', secret,
                            {'prefix': prefix, 'limit': 100})
    return status, listed_names(body)


def storage_delete(sb, secret, key):
    return _request('DELETE', f'{sb.rstrip("/")}/storage/v1/object/{BUCKET}/{key}', secret, {})


def due_ids(sb, secret, since):
    """THE ROUTE'S OWN DUE QUERY, as PostgREST runs it: `sites!inner` filtered on the embed."""
    status, rows = rest(sb, secret, 'GET', '/site_snapshots?select=id,sites!inner(disconnected_at)'
                        f'&sites.disconnected_at=lte.{urllib.parse.quote(since)}')
    return status, sorted(row['id'] for row in rows) if isinstance(rows, list) else None


def snapshot_row(sb, secret, sid):
    status, rows = rest(sb, secret, 'GET', f'/site_snapshots?id=eq.{sid}&select=*')
    return rows[0] if status == 200 and isinstance(rows, list) and rows else None


def plant(sb, secret, uid, url, title, disconnected_at, notice_at, stamp):
    """One site record and its original theme: the object FIRST, then the row (AD-32's order, mirrored)."""
    status, rows = rest(sb, secret, 'POST', '/sites',
                        {'user_id': uid, 'url': url, 'title': title, 'disconnected_at': disconnected_at},
                        prefer='return=representation')
    if status not in (200, 201) or not rows:
        raise SystemExit(f'  FAIL  could not plant a site: HTTP {status} {json.dumps(rows)[:200]}')
    site = rows[0]['id']
    key = f'{uid}/{site}/{stamp}-casper.zip'
    payload = tiny_zip('casper')
    put, body = storage_put(sb, secret, key, payload)
    if put not in (200, 201):
        raise SystemExit(f'  FAIL  could not put {BUCKET}/{key}: HTTP {put} {json.dumps(body)[:200]}')
    status, rows = rest(sb, secret, 'POST', '/site_snapshots',
                        {'user_id': uid, 'site_id': site, 'storage_path': f'{BUCKET}/{key}',
                         'theme_name': 'casper', 'bytes': len(payload), 'orphan_notice_at': notice_at},
                        prefer='return=representation')
    if status not in (200, 201) or not rows:
        raise SystemExit(f'  FAIL  could not plant a snapshot row: HTTP {status} {json.dumps(rows)[:200]}')
    return {'site': site, 'id': rows[0]['id'], 'key': key, 'prefix': f'{uid}/{site}/',
            'sha': hashlib.sha256(payload).hexdigest()}


def offline(run, env, needed):
    """`--check`'s steps, which every mode runs first. Returns the app's figures, or None."""
    missing = [k for k in needed if not env.get(k)]
    run.step('keys', not missing, f'all present by name: {", ".join(needed)}' if not missing
             else f'tools/probe/.env is missing: {", ".join(missing)}')
    if missing:
        return None
    figures, error = app('{ path: r.CRON_PATH, N: c.ORPHAN_SNAPSHOT_DAYS, n: r.ORPHAN_NOTICE_DAYS, batch: r.BATCH,'
                         ' section: r.SECTION_ID, words: { heading: r.ORPHANS.heading, caption: r.ORPHANS.caption(c.ORPHAN_SNAPSHOT_DAYS),'
                         ' button: r.ORPHANS.emailButton, only: r.ORPHANS.emailOnly } }')
    if not run.step('app', figures is not None, error or
                    f'CRON_PATH {figures["path"]}, ORPHAN_SNAPSHOT_DAYS {figures["N"]}, ORPHAN_NOTICE_DAYS '
                    f'{figures["n"]}, BATCH {figures["batch"]}, read out of the app'):
        return None
    for key, said in figures['words'].items():
        print(f'          ORPHANS.{key} = {said!r}')

    vercel = json.load(open(os.path.join(WEB, 'vercel.json'), encoding='utf-8'))
    jobs = [j for j in vercel.get('crons') or [] if j.get('path') == figures['path']]
    fields = jobs[0]['schedule'].split() if jobs else []
    exists = os.path.exists(os.path.join(WEB, 'app', figures['path'].lstrip('/'), 'route.ts'))
    run.step('schedule', len(jobs) == 1 and fields[2:] == ['*', '*', '*'] and exists,
             f'vercel.json schedules {figures["path"]} at {jobs[0]["schedule"] if jobs else "NOTHING"}; route.ts present: {exists}')

    N, n = figures['N'], figures['n']
    shapes = {'W': (N - n - 1, None), 'T': (N - n, None), 'P': (N + 1, n + 1)}
    verdicts, error = app('Object.fromEntries(Object.entries(' + json.dumps(shapes) + ').map(([k, [d, s]]) => {'
                          ' const now = new Date(); const ago = (x) => new Date(now.getTime() - x * 86400000 - 3600000).toISOString();'
                          ' return [k, r.decide({ disconnectedAt: ago(d), noticeAt: s === null ? null : ago(s) }, now)] }))')
    run.step('decide', verdicts == {'W': 'wait', 'T': 'notice', 'P': 'purge'},
             error or f"the app's decide over the fixture: {json.dumps(verdicts)} (R is reconnected: no clock, outside the due set)")

    mail, error = app('m.orphanEmail({ site: "orphan-harness.example", theme: "casper", date: r.orphanDeadline(new Date("2026-11-01T09:00:00Z")),'
                      ' disconnected: "2026-11-01T09:00:00Z", url: "https://app.inflozo.com/sites#" + r.SECTION_ID })')
    ok = (mail is not None and mail['subject'] == 'Your original theme from orphan-harness.example will be deleted on Jan 30, 2027'
          and 'href="https://app.inflozo.com/sites#original-themes"' in mail['html'] and 'casper' in mail['text']
          and 'Nov 1, 2026' in mail['text'] and figures['words']['only'] in mail['html'])
    run.step('email', ok, error or f'orphanEmail composed (not sent): subject {mail["subject"]!r}, the button to /sites#{figures["section"]}')
    return figures


def owner_test(run, env, figures, alias, route, path):
    """Deploy's plant for the owner's manual test. Never deletes anything of his but what the route deletes."""
    sb, secret = env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY']
    admin = Admin(sb, secret)
    users = admin.users()
    if users is None:
        run.step('alias', False, 'the Admin-API user list could not be read')
        return
    found = [u for u in users if (u.get('email') or '').lower() == alias.lower()]
    if found:
        uid = found[0]['id']
    else:
        status, user = admin.call('POST', '/admin/users', {'email': alias, 'email_confirm': True})
        uid = user.get('id') if status in (200, 201) else None
    if not run.step('alias', bool(uid), 'the alias exists' + ('' if found else ' (created)')):
        return
    ghost6 = env['GHOST6_URL'].rstrip('/').lower()
    status, mine = rest(sb, secret, 'GET', f'/sites?user_id=eq.{uid}&select=url')
    urls = {s['url'] for s in mine} if isinstance(mine, list) else None
    wanted = ['https://orphan-a.example', 'https://orphan-b.example', ghost6]
    if urls is None or urls & set(wanted):
        run.step('fresh', False, 'the alias already holds one of the three sites — planted before? Refusing to plant twice')
        return
    now = time.time()
    stamp = int(now)
    a = plant(sb, secret, uid, wanted[0], 'orphan-a.example', iso(-80 * DAY, now), None, stamp)
    b = plant(sb, secret, uid, wanted[1], 'orphan-b.example', iso(-100 * DAY, now), iso(-15 * DAY, now), stamp)
    g = plant(sb, secret, uid, ghost6, urllib.parse.urlparse(ghost6).hostname, iso(-10 * DAY, now), None, stamp)
    print('  three sites planted, each with a casper theme')
    since, _ = app(f'r.dueSince(new Date(Date.now() + {LOOK_AHEAD * 1000})).toISOString()')
    status, ids = due_ids(sb, secret, since or '')
    strangers = [i for i in ids or [] if i not in (a['id'], b['id'])]
    if not run.step('due-set', status == 200 and ids == sorted([a['id'], b['id']]),
                    f'the route would act on {len(ids or [])} theme(s), exactly A and B = {ids == sorted([a["id"], b["id"]])}'):
        if strangers:
            print(f'  FAIL  {len(strangers)} theme(s) this run did not plant are due. Refusing to call the route.')
        return
    status, body, headers = call_route(route, env['CRON_SECRET'])
    run.step('run', status == 200 and body == {'noticed': 1, 'purged': 1, 'failed': 0},
             f'GET with CRON_SECRET -> HTTP {status} {json.dumps(body)}')
    ra, rb, rg = snapshot_row(sb, secret, a['id']), snapshot_row(sb, secret, b['id']), snapshot_row(sb, secret, g['id'])
    lb = storage_list(sb, secret, b['prefix'])
    run.step('read-back', bool(ra and ra.get('orphan_notice_at')) and rb is None and lb == (200, [])
             and bool(rg) and rg.get('orphan_notice_at') is None,
             f'A stamped = {bool(ra and ra.get("orphan_notice_at"))}; B row gone = {rb is None}, prefix {lb}; T1 untouched = {bool(rg)}')
    dates, error = app('{ a: d.deadlineLabel(r.purgeDateOf({ disconnectedAt: ' + json.dumps(iso(-80 * DAY, now))
                       + ', noticeAt: ' + json.dumps((ra or {}).get('orphan_notice_at')) + ' })),'
                       ' g: d.deadlineLabel(r.purgeDateOf({ disconnectedAt: ' + json.dumps(iso(-10 * DAY, now)) + ', noticeAt: null })) }')
    run.step('dates', dates is not None, error or f"A's date = {dates['a']} · ghost6's date = {dates['g']}  (write both into the spec)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='offline: the app\'s rule, words, schedule and email; no network')
    ap.add_argument('--url', default=APEX, help='where the cron lives; the apex by default (never app.inflozo.com)')
    ap.add_argument('--owner-test', metavar='ALIAS', help='plant the owner\'s three sites on ALIAS and run the route once')
    args = ap.parse_args()

    env = load_env()
    run = Run()
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'CRON_SECRET', 'RESEND_TEST_INBOX']
    if args.owner_test:
        needed.append('GHOST6_URL')
    figures = offline(run, env, needed)
    if figures is None or args.check:
        print('  --check: the deployed route was not called' if args.check else '')
        print('  RESULT: ' + ('FAILED' if run.failed else 'all steps passed'))
        return 1 if run.failed else 0

    path = figures['path']
    route = args.url.rstrip('/') + path
    print(f'  route: {route}')
    if args.owner_test:
        owner_test(run, env, figures, args.owner_test, route, path)
        print('  RESULT: ' + ('FAILED' if run.failed else 'all steps passed'))
        return 1 if run.failed else 0

    sb, secret, cron = env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'], env['CRON_SECRET']
    local, domain = env['RESEND_TEST_INBOX'].split('@', 1)
    fixture_re = rf'^{re.escape(local)}\+orphan-harness-\d+@{re.escape(domain)}$'
    admin = Admin(sb, secret)
    swept = admin.sweep_stale_fixtures(fixture_re)
    if swept:
        print(f'  swept {swept} stale orphan-harness user(s) an earlier run left behind')
    before = admin.user_count()
    if before is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1
    N, n = figures['N'], figures['n']
    now = time.time()
    stamp = int(now)
    uid, planted = None, {}
    try:
        status, user = admin.call('POST', '/admin/users', {'email': f'{local}+orphan-harness-{stamp}@{domain}', 'email_confirm': True})
        uid = user.get('id') if status in (200, 201) else None
        if not uid:
            print(f'  FAIL  could not create the fixture user: HTTP {status}')
            return 1
        hour = 3600
        for k, disconnected, notice in (('W', iso(-(N - n - 1) * DAY, now), None),
                                        ('T', iso(-(N - n) * DAY - hour, now), None),
                                        ('P', iso(-(N + 1) * DAY, now), iso(-(n + 1) * DAY, now)),
                                        ('R', None, iso(-(n + 1) * DAY, now))):
            planted[k] = plant(sb, secret, uid, f'https://orphan-harness-{stamp}-{k.lower()}.example', None,
                               disconnected, notice, stamp)
        rows = {k: snapshot_row(sb, secret, p['id']) for k, p in planted.items()}
        listings = {k: storage_list(sb, secret, p['prefix']) for k, p in planted.items()}

        # ── seeded, and THE SAFETY CONTROL: the route's own due query, fifteen minutes ahead.
        since, error = app(f'r.dueSince(new Date(Date.now() + {LOOK_AHEAD * 1000})).toISOString()')
        status, ids = due_ids(sb, secret, since or '')
        fixture = sorted([planted['T']['id'], planted['P']['id']])
        strangers = [i for i in ids or [] if i not in fixture]
        ok = (status == 200 and ids == fixture and all(v == (200, [planted[k]['key']]) for k, v in listings.items()))
        run.step('seeded', ok, f'the route would act on {len(ids or [])} theme(s), exactly T and P = {ids == fixture}; '
                 f'each prefix lists {json.dumps({k: len(v[1]) for k, v in listings.items()})} object(s)')
        if strangers:
            print(f'  FAIL  {len(strangers)} theme(s) this run did not plant are due. Refusing to call the route.')
            return 1
        if not ok:
            return 1

        def moved():
            return snapshot_row(sb, secret, planted['T']['id']) != rows['T'] or snapshot_row(sb, secret, planted['P']['id']) is None

        for name, bearer in (('no-header', None), ('wrong-secret', 'not-the-secret-but-the-same-shape')):
            status, body, headers = call_route(route, bearer)
            run.step(name, route_401(status, body, headers, path) and not moved(),
                     f'HTTP {status} {body!r}, x-matched-path {headers.get("x-matched-path")!r}, '
                     f'cache-control {headers.get("cache-control")!r}; nothing moved = {not moved()}')

        started = time.time()
        status, body, headers = call_route(route, cron)
        cache = (headers.get('cache-control') or '').lower()
        run.step('run', status == 200 and body == {'noticed': 1, 'purged': 1, 'failed': 0} and 'no-store' in cache,
                 f'GET with CRON_SECRET -> HTTP {status} {json.dumps(body)}, cache-control {cache!r}')

        t = snapshot_row(sb, secret, planted['T']['id']) or {}
        stamped = t.get('orphan_notice_at')
        when = calendar.timegm(time.strptime(stamped[:19], '%Y-%m-%dT%H:%M:%S')) if stamped else None
        run.step('noticed', when is not None and started - 5 <= when <= time.time() + 5,
                 f"T's orphan_notice_at = {stamped} (the run began {iso(0, started)})")

        lp = storage_list(sb, secret, planted['P']['prefix'])
        rp = snapshot_row(sb, secret, planted['P']['id'])
        run.step('purged', lp == (200, []) and rp is None, f"P's prefix -> {lp}; P's row gone = {rp is None}")

        same = {}
        for k in ('W', 'R'):
            got, raw = storage_get(sb, secret, planted[k]['key'])
            same[k] = (snapshot_row(sb, secret, planted[k]['id']) == rows[k] and got == 200
                       and isinstance(raw, bytes) and hashlib.sha256(raw).hexdigest() == planted[k]['sha'])
        run.step('untouched', all(same.values()), f'row and object unchanged: {json.dumps(same)}')

        status, body, _ = call_route(route, cron)
        again = (snapshot_row(sb, secret, planted['T']['id']) or {}).get('orphan_notice_at')
        run.step('idempotent', status == 200 and body == {'noticed': 0, 'purged': 0, 'failed': 0} and again == stamped,
                 f'a second call -> HTTP {status} {json.dumps(body)}; T\'s stamp unmoved = {again == stamped}')
    finally:
        for p in planted.values():
            storage_delete(sb, secret, p['key'])
        if uid:
            admin.call('DELETE', f'/admin/users/{uid}', {})
        after = admin.user_count()
        strays = admin.sweep_stale_fixtures(fixture_re)
        left = [k for k, p in planted.items() if storage_list(sb, secret, p['prefix']) != (200, [])]
        run.step('cleanup', after == before and not strays and not left,
                 f'users {before} -> {after}; stray fixtures {strays}; prefixes not empty {left}')

    print('  RESULT: ' + ('FAILED' if run.failed else 'all steps passed'))
    return 1 if run.failed else 0


if __name__ == '__main__':
    sys.exit(main())
