#!/usr/bin/env python3
"""FR-C5's daily health check, its cron door, its notification row and FR-P1's third email, executed against T1, T3, the live Supabase, the real Resend and the deployed route. Story 3.7.

    python3 tools/probe/run-verify-site-health.py --check   # plumbing only: needs no deployment
    python3 tools/probe/run-verify-site-health.py           # + the deployed cron (Review, Deploy)
    python3 tools/probe/run-verify-site-health.py --url https://app.inflozo.com

WHY IT EXISTS. Story 3.7 rests on claims about two real Ghosts, about Supabase's RLS on a table
nothing had ever written, and about a scheduled route nothing had ever called — and CLAUDE.md's
first standing rule makes each one a hypothesis until it is run against the real thing. So this
run executes: that `GET /settings/routes/yaml/` really answers 200 to the INTEGRATION key alone on
both majors, which is the one Ghost read this story adds; that a broken Admin key really answers
401 `UNKNOWN_ADMIN_API_KEY`, which is the code `healthOf` turns into "Reconnect needed"; that a
`site_health` notification row is visible to its OWN owner and to nobody else, through each one's
own session, which is what makes `notifications` safe to write three epics before it is read; that
the cron is shut without Vercel's bearer; and that Resend really delivers the message this story
composes.

IT FEEDS THE APP'S OWN FUNCTIONS WITH WHAT THE WIRE ANSWERED. The `decision` step runs
`lib/health-rule.ts`'s real `healthOf` over the codes THIS RUN observed, and `copy` prints the
story's every word out of `lib/connect-rule.ts` and `lib/health-rule.ts` rather than retyping one —
a harness that carries its own copy of a sentence proves nothing about the one the customer reads
(standing rule 4, and the correction Story 3.4 needed three times).

THE STEP LIST BELOW IS DERIVED FROM `STEPS` IN THIS FILE'S OWN SOURCE and is not retyped: a
docstring that names fewer steps than the run prints is a list gone stale, which is exactly what
happened to the sibling harness three times in one story. Add a step to `STEPS` and it appears
here; add one without it and the `steps-listed` assertion fails the run.

WHAT IT DOES NOT DO, SAID OUT LOUD. It never regenerates a key on T1 or T3 and never disconnects
anything: the unhealthy cause is executed with a TAMPERED COPY of T3's key — one hex digit of its
`kid` changed, which Ghost has never issued — so the 401 and its `code` are the real ones while T3
itself is untouched and needs no reset (`RESET-PROTOCOL.md` therefore has nothing to undo). That
proves the CAUSE, not the round trip: a customer's card going amber, the email arriving, the second
press sending nothing and the recovery clearing it are the OWNER'S MANUAL TEST, steps 4 to 8, on
the deployed site — which is R-80's gate for a UI story and the one place a real regenerate belongs.

NO KEY, NO ADDRESS AND NO SITE TITLE IS EVER PRINTED. Every credential reaches a request through a
header built from the environment and is recorded by its variable NAME. The cron is called with
redirects DISABLED: a 3xx is a FAIL, never a bearer quietly re-sent to wherever it points.

THE FIXTURE IS CLEANED UP. The `notice-rls` step creates two throwaway users, writes one
notification row for one of them, reads it back through both their own sessions, and deletes all of
it in a `finally`; the Admin-API user count is read before and after as its control.
"""
import argparse, base64, hashlib, importlib.util, json, os, re, subprocess, sys, textwrap, time
import urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(HERE, '..', '..', 'apps', 'web')
APEX = 'https://inflozo.com'


def _sibling(name):
    """`run-verify-passkeys` is not an identifier, so it cannot be `import`ed by name."""
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_passkeys = _sibling('run-verify-passkeys')
Admin, load_env = _passkeys.Admin, _passkeys.load_env
_all = _sibling('run-verify-all')
jwt = _all.jwt

FIXTURE = r'^health-harness-\d+(-b)?@inflozo\.com$'

# ── THE STEPS, AND THE DOCSTRING ABOVE IS BUILT FROM THIS. One line each, in the order the run
#    prints them. `steps-listed` asserts that every key here reaches the docstring and that every
#    step the run printed is a key here, so neither list can drift from the other.
STEPS = {
    'keys': 'every key this run needs is in `tools/probe/.env`, BY NAME — no value is ever printed. '
            'Printed in both modes',
    'copy': "this story's every word, read OUT OF THE APP — `HEALTH` in `lib/connect-rule.ts` and "
            '`HEALTH_REASONS` in `lib/health-rule.ts`, loaded with `node --experimental-strip-types` '
            'so the run prints what the customer reads rather than a copy of it. Printed in both modes',
    'config-200': 'THE HEALTHY CONTROL, and standing rule 2 is why it runs first: `GET /admin/config/` '
                  '200 on T1 (6.58.0) and T3 (5.130.6) with the stored integration key, version '
                  'recorded from each. A result whose control did not pass is not a result',
    'routes-yaml': "THE ONE GHOST READ THIS STORY ADDS. `GET /settings/routes/yaml/` 200 on BOTH "
                   'majors with the ADMIN key alone — no Staff token — and the sha256 of the bytes '
                   'recorded, which is exactly what `routes_live_sha256` holds. It also records that '
                   'the body is NOT JSON, which is why the chokepoint had to start carrying `text`',
    'bad-key-401': "THE UNHEALTHY CAUSE, EXECUTED. T3's key with one hex digit of its `kid` changed — "
                   'a key Ghost has never issued: 401, `code` `UNKNOWN_ADMIN_API_KEY`, which is the '
                   "code `ghostCode` maps to `ghost_unknown_key`. T3 itself is untouched",
    'decision': "THE APP'S OWN RULE, OVER WHAT THE WIRE JUST ANSWERED. `healthOf` is called with the "
                'codes and the versions this run observed: the two 200s are `healthy`, the 401 is '
                '`unhealthy` with its sentence, and a 4.x version string is `unhealthy` with the '
                "version reason (DW-63) — the one branch no server can produce, since neither test "
                'Ghost is a Ghost 4',
    'due-select': "THE CRON'S OWN QUERY, ON THE LIVE TABLE. Two claims about PostgREST that no unit "
                  'test can reach and that would each fail as a 400 at 05:40 with nobody watching: a '
                  'jsonb filter — `credentials_present->>admin=eq.true` — and a NULLS FIRST order on '
                  '`last_checked_at`, which is what makes the first run DW-62\'s backfill. It also '
                  'records how many sites are due and how many have never been checked at all',
    'notice-rls': "AD-25's ROW, AND WHOSE IT IS. Two throwaway users; one `site_health` row written "
                  'for the first with the service role, then read back through EACH ONE\'S OWN '
                  'session: the owner sees it, the other sees nothing, and neither may insert or '
                  'delete one at all. `resolved_at` is then stamped and the row leaves the open set. '
                  'Every fixture is deleted in a `finally`',
    'schedule': "the schedule and the app agree about where the job lives: `vercel.json`'s `crons` "
                "carries the path `lib/health-rule.ts`'s `CRON_PATH` names, and a `route.ts` is "
                'really there. Both sides are READ, neither is restated',
    'resend': "FR-P1's THIRD EMAIL, REALLY SENT, through `RESEND_API_KEY` / `RESEND_FROM` — composed "
              "by the app's own `healthEmail`, addressed to `RESEND_TEST_INBOX` (`check-access.py`'s "
              'own recipient) and its id recorded. A 2xx from Resend is where a harness’s knowledge '
              'of an email ends (DW-22), which is why the owner reads the real one himself at step 7',
    # ── from here on a deployment is needed; skipped by `--check`.
    'cron-no-header': 'THE CRON DOOR, AND IT RUNS AS A CONTROL BEFORE THE JOB IS EVER CALLED: `GET` '
                      'with no `Authorization` at all -> 401 from THE ROUTE — body `Unauthorized` '
                      "and `x-matched-path` naming it, so a platform's 401 cannot pass for it — with "
                      '`cache-control: no-store`',
    'cron-wrong-secret': 'the same call with a wrong bearer of the same shape: 401 from the route',
    'cron-run': "the real bearer: 200 or 500 with `{checked, unhealthy, failed}` and `no-store` on "
                'it. RECORDED rather than asserted green — a real account whose Ghost is genuinely '
                'unhealthy is a correct 500, and this run must not call that a failure of the route',
    # ── last, because it audits what the run printed.
    'steps-listed': "this file's docstring names every step the run printed, and no step it did not "
                    '— both lists are derived from `STEPS`, so a step added without one fails here. '
                    'It runs LAST in whichever mode is running, because it audits what was printed',
}

_CHECK_ONLY_FROM = 'cron-no-header'


def _build_doc():
    """The docstring's own step list, BUILT FROM `STEPS`, so it cannot name fewer steps than the
    run prints. That is the failure this file exists to make impossible: the sibling harness's
    hand-typed list went stale three times inside one story (standing rule 4)."""
    head = 18
    return '\n'.join(
        textwrap.fill(said, width=98, initial_indent=f'  {name:<{head}}',
                      subsequent_indent=' ' * (head + 2))
        for name, said in STEPS.items()
    )


__doc__ = __doc__.replace(
    'WHAT IT DOES NOT DO, SAID OUT LOUD.',
    'WHAT IT PROVES, each step PASS, FAIL or RECORD, exiting non-zero if any step fails:\n\n'
    + _build_doc()
    + '\n\nWHAT IT DOES NOT DO, SAID OUT LOUD.',
)


class Run:
    """PASS/FAIL/RECORD lines in the sibling harnesses' shape, and one exit code out of them."""

    def __init__(self):
        self.failed = False
        self.printed = []

    def step(self, name, ok, detail):
        self.printed.append(name)
        print(f'  {"PASS" if ok else "FAIL"}  {name}: {detail}')
        if not ok:
            self.failed = True
        return ok

    def record(self, name, detail):
        self.printed.append(name)
        print(f'  RECORD  {name}: {detail}')


# ── Ghost, over the wire, with the mint the product uses. `jwt()` is `run-verify-all.py`'s and is
#    the same six lines `admin-rule.ts`'s `mintJwt` is (MEASUREMENTS §37, executed on both majors).
def ghost(url, key, path, major):
    req = urllib.request.Request(
        f'{url.rstrip("/")}/ghost/api/admin/{path}',
        method='GET',
        headers={'Authorization': f'Ghost {jwt(key)}', 'Accept-Version': f'v{major}.0'},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return r.status, r.read(), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read(), dict(e.headers)
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return 0, str(e).encode(), {}


def ghost_code(body):
    """Ghost's error envelope is `{ errors: [{ message, type, code }] }` — the same field
    `ghostCode` reads, so this run's assertion is about the value the app branches on."""
    try:
        errors = json.loads(body).get('errors') or []
        return (errors[0] or {}).get('code')
    except (ValueError, AttributeError, IndexError):
        return None


def tamper(key):
    """A key of the right SHAPE whose `kid` Ghost has never issued. One hex digit of the id half is
    rotated, so `parseCredential` accepts it, `mintJwt` signs it, and Ghost answers the 401 a
    regenerated key would — with nothing on T3 changed and nothing to reset."""
    kid, secret = key.split(':')
    swapped = ('1' if kid[0] != '1' else '2') + kid[1:]
    return f'{swapped}:{secret}'


# ── The app's own modules, evaluated by node. `--experimental-strip-types` runs the real `.ts`,
#    so what is printed and what is asserted is the product's own code and not a translation of it.
def app(expression, env):
    """Evaluate one expression against `apps/web`'s modules and return its parsed JSON. `a` is the
    Admin chokepoint's pure half, so a step can run the REAL chain from Ghost's own envelope to
    Inflozo's code to the health verdict rather than guessing at any link in it."""
    script = (
        "const out = async () => { const c = await import('./lib/connect-rule.ts');"
        " const h = await import('./lib/health-rule.ts');"
        " const m = await import('./lib/health-email.ts');"
        " const a = await import('./server/ghost-admin/admin-rule.ts');"
        f' return ({expression}); }};'
        ' out().then((v) => console.log("<<<" + JSON.stringify(v) + ">>>"))'
        '     .catch((e) => { console.error(e.message); process.exit(1) })'
    )
    proc = subprocess.run(
        ['node', '--experimental-strip-types', '-e', script],
        cwd=os.path.abspath(WEB), capture_output=True, text=True, env=env, timeout=120,
    )
    if proc.returncode != 0:
        return None, (proc.stderr or proc.stdout).strip().splitlines()[-1:] or ['node failed']
    found = re.search(r'<<<(.*)>>>', proc.stdout, re.S)
    if not found:
        return None, ['no value came back from node']
    return json.loads(found.group(1)), None


# ── PostgREST, twice over: once as the service role (the writer this story is) and once as a
#    user's own session (the reader RLS is about).
def rest(url, key, method, path, body=None, bearer=None, prefer=None):
    headers = {'apikey': key, 'Authorization': f'Bearer {bearer or key}'}
    if body is not None:
        headers['Content-Type'] = 'application/json'
    if prefer:
        headers['Prefer'] = prefer
    req = urllib.request.Request(
        f'{url.rstrip("/")}/rest/v1{path}',
        data=json.dumps(body).encode() if body is not None else None,
        method=method, headers=headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, (json.loads(raw) if raw else None)
        except ValueError:
            return e.code, raw.decode('utf-8', 'replace')[:200]
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return 0, str(e)


def session(url, publishable, email, password):
    """A user's OWN access token, so every RLS assertion below is made through the session it is
    about rather than by the service role standing in for one."""
    req = urllib.request.Request(
        f'{url.rstrip("/")}/auth/v1/token?grant_type=password',
        data=json.dumps({'email': email, 'password': password}).encode(),
        method='POST',
        headers={'apikey': publishable, 'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return (json.loads(r.read()) or {}).get('access_token')
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError):
        return None


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """A redirect is a FAIL, not a detour: the bearer must never be re-sent to wherever a 3xx
    points, and a 308 off the apex would paper over the `routing.ts` pass-through claim."""

    def redirect_request(self, *args, **kwargs):
        return None


_opener = urllib.request.build_opener(NoRedirect)


def call_route(url, secret=None):
    """The route as Vercel calls it: GET, the bearer in a header, no redirects."""
    req = urllib.request.Request(
        url, method='GET', headers={'Authorization': f'Bearer {secret}'} if secret else {}
    )
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
    of it — deployment protection on a preview URL, an edge rejection — cannot pass as the
    control. Locally there is no `x-matched-path`, so it is required only when one is present."""
    matched = headers.get('x-matched-path')
    return (
        status == 401
        and body == 'Unauthorized'
        and (matched is None or matched == path)
        and 'no-store' in (headers.get('cache-control') or '').lower()
    )


def cron_path(run):
    """The path the APP says the job lives at, read out of `lib/health-rule.ts`. A harness carrying
    its own copy of the URL proves nothing about the one Vercel invokes."""
    source = open(os.path.join(WEB, 'lib', 'health-rule.ts'), encoding='utf-8').read()
    found = re.search(r"CRON_PATH\s*=\s*'([^']+)'", source)
    if not found:
        run.step('schedule', False, 'CRON_PATH is not in apps/web/lib/health-rule.ts')
        return None
    return found.group(1)


NEEDED = (
    'GHOST6_URL', 'GHOST6_ADMIN_API_KEY', 'GHOST5_URL', 'GHOST5_ADMIN_API_KEY',
    'SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_PUBLISHABLE_KEY',
    'CRON_SECRET', 'RESEND_API_KEY', 'RESEND_FROM', 'RESEND_TEST_INBOX',
)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='plumbing only: the two Ghosts, the app\'s own rule and copy, the '
                         'notification row through two real sessions, the schedule and one real '
                         'Resend send. Needs no deployment, so it runs before the story is deployed.')
    ap.add_argument('--url', default=APEX,
                    help='where the cron lives. The apex by default — routing.ts passes any '
                         'non-/app path through, so it reaches the handler Vercel reaches on the '
                         'generated production URL.')
    args = ap.parse_args()

    env = load_env()
    run = Run()

    missing = [k for k in NEEDED if not env.get(k)]
    run.step('keys', not missing,
             f'all present by name: {", ".join(NEEDED)}' if not missing
             else f'tools/probe/.env is missing: {", ".join(missing)}')
    if missing:
        print('  RESULT: FAILED')
        return 1

    node_env = {**os.environ}

    # ── copy: the app's own words, printed rather than retyped.
    copy, error = app('{ HEALTH: c.HEALTH, REASONS: h.HEALTH_REASONS, cap: h.EMAIL_CAP_DAYS, batch: h.BATCH }', node_env)
    if error:
        run.step('copy', False, f'the app\'s copy could not be read: {error[0]}')
    else:
        words = {k: v for k, v in copy['HEALTH'].items() if isinstance(v, str)}
        run.step('copy', True,
                 f'{len(words)} label(s) + {len(copy["REASONS"])} reason(s), read out of the app')
        for key, said in words.items():
            print(f'          HEALTH.{key} = {said!r}')
        for code, said in copy['REASONS'].items():
            print(f'          HEALTH_REASONS.{code} = {said!r}')
        print(f'          the rolling cap is {copy["cap"]} day(s); one run checks at most {copy["batch"]} site(s)')

    # ── config-200: the healthy control, FIRST (standing rule 2).
    ghosts = [
        ('T1', env['GHOST6_URL'], env['GHOST6_ADMIN_API_KEY'], 6),
        ('T3', env['GHOST5_URL'], env['GHOST5_ADMIN_API_KEY'], 5),
    ]
    versions = {}
    control = True
    for name, url, key, major in ghosts:
        status, body, _ = ghost(url, key, 'config/', major)
        try:
            version = (json.loads(body).get('config') or {}).get('version')
        except (ValueError, AttributeError):
            version = None
        versions[name] = version
        ok = status == 200 and isinstance(version, str)
        control = control and ok
        run.step('config-200' if name == 'T1' else 'config-200',
                 ok, f'{name}: HTTP {status}, version {version!r} (key {("GHOST6" if major == 6 else "GHOST5")}_ADMIN_API_KEY)')
    if not control:
        # STANDING RULE 2: a result whose control did not pass is not a result. Everything below
        # asserts something about a Ghost that has just been proved reachable.
        print('  the healthy control did not pass, so nothing below it is a result')
        print('  RESULT: FAILED')
        return 1

    # ── routes-yaml: the one Ghost read this story adds, on both majors.
    hashes = {}
    for name, url, key, major in ghosts:
        status, body, headers = ghost(url, key, 'settings/routes/yaml/', major)
        digest = hashlib.sha256(body).hexdigest() if status == 200 else None
        is_json = True
        try:
            json.loads(body)
        except ValueError:
            is_json = False
        hashes[name] = digest
        run.step('routes-yaml', status == 200 and bool(digest),
                 f'{name}: HTTP {status}, {len(body)} byte(s), sha256 {digest}, '
                 f'content-type {headers.get("Content-Type") or headers.get("content-type")!r}, '
                 f'JSON-parseable: {is_json} — which is why CallResult had to start carrying `text`')

    # ── bad-key-401: the unhealthy cause, on T3, with nothing on T3 changed.
    status, body, _ = ghost(env['GHOST5_URL'], tamper(env['GHOST5_ADMIN_API_KEY']), 'config/', 5)
    ghosts_code = ghost_code(body)
    run.step('bad-key-401', status == 401 and ghosts_code == 'UNKNOWN_ADMIN_API_KEY',
             f'T3 with a tampered kid: HTTP {status}, code {ghosts_code!r} '
             '(T3 untouched — no key was regenerated and nothing needs resetting)')

    # ── decision: the app's real rule over what the wire answered.
    # THE WHOLE CHAIN, NOT ONE LINK OF IT. Ghost's envelope is turned into INFLOZO's code by
    # `ghostCode` (AD-24, one row per Ghost cause) and only then does `healthOf` see it — which is
    # exactly the path `probeSite` takes. The first writing of this step fed Ghost's own
    # `UNKNOWN_ADMIN_API_KEY` straight into `healthOf` and the run went red, correctly: that is not
    # a code the health rule has ever been given, and a harness that had guessed the mapping would
    # have proved nothing about the mapping.
    envelope = json.dumps({'code': ghosts_code, 'message': ''})
    verdicts, error = app(
        '{'
        f' t1: h.healthOf({{ ok: true }}, {json.dumps(versions["T1"])}),'
        f' t3: h.healthOf({{ ok: true }}, {json.dumps(versions["T3"])}),'
        f' code: a.ghostCode({status}, {envelope}),'
        f' refused: h.healthOf({{ ok: false, code: a.ghostCode({status}, {envelope}) }},'
        f'          {json.dumps(versions["T3"])}),'
        ' old: h.healthOf({ ok: true }, "4.48.0"),'
        ' offline: h.healthOf({ ok: false, code: "ghost_unreachable" }, null),'
        '}', node_env)
    if error:
        run.step('decision', False, f'the app\'s rule could not be run: {error[0]}')
    else:
        reason = verdicts['refused']['reason']
        ok = (
            verdicts['t1']['health'] == 'healthy'
            and verdicts['t3']['health'] == 'healthy'
            and verdicts['code'] == 'ghost_unknown_key'
            and verdicts['refused']['health'] == 'unhealthy'
            and reason in copy['REASONS']
            and verdicts['old'] == {'health': 'unhealthy', 'reason': 'ghost_too_old'}
            and verdicts['offline']['health'] is None
        )
        run.step('decision', ok,
                 f'healthOf: T1 {versions["T1"]} -> {verdicts["t1"]["health"]}, '
                 f'T3 {versions["T3"]} -> {verdicts["t3"]["health"]}; '
                 f'ghostCode({status}, {ghosts_code}) -> {verdicts["code"]} -> '
                 f'{verdicts["refused"]["health"]} saying {copy["REASONS"].get(reason)!r}; '
                 f'4.48.0 -> {verdicts["old"]["health"]}/{verdicts["old"]["reason"]} (DW-63); '
                 f'ghost_unreachable -> {verdicts["offline"]["health"]} (undecided, so no badge and no email)')

    # ── due-select: the cron's own query, executed against the live table.
    status, due = rest(env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'], 'GET',
                       '/sites?select=id,last_checked_at&disconnected_at=is.null'
                       '&credentials_present->>admin=eq.true'
                       f'&order=last_checked_at.asc.nullsfirst&limit={copy["batch"] if copy else 100}')
    never = [row for row in (due or []) if isinstance(row, dict) and row.get('last_checked_at') is None] \
        if isinstance(due, list) else []
    run.step('due-select', status == 200 and isinstance(due, list),
             f'HTTP {status}: {len(due) if isinstance(due, list) else "?"} site(s) due, '
             f'{len(never)} of them never checked and therefore FIRST on the next run (DW-62). '
             'The jsonb filter and the nulls-first order are both accepted by PostgREST'
             if status == 200 else f'HTTP {status}: {due}')

    # ── notice-rls: AD-25's row, and whose it is.
    admin = Admin(env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'])
    swept = admin.sweep_stale_fixtures(FIXTURE)
    if swept:
        print(f'  swept {swept} stale health-harness-* user(s) an earlier run left behind')
    before_users = admin.user_count()
    if before_users is None:
        run.step('notice-rls', False, 'the Admin-API user count could not be read, so the cleanup has no control')
    else:
        stamp = int(time.time())
        password = base64.urlsafe_b64encode(os.urandom(24)).decode()
        made = []
        try:
            ids = {}
            for suffix in ('', '-b'):
                status, body = admin.call('POST', '/admin/users', {
                    'email': f'health-harness-{stamp}{suffix}@inflozo.com',
                    'password': password, 'email_confirm': True,
                })
                if status in (200, 201) and body.get('id'):
                    ids[suffix or 'a'] = body['id']
                    made.append(body['id'])
            if len(ids) != 2:
                run.step('notice-rls', False, f'the two fixture users could not be created (got {len(ids)})')
            else:
                owner, other = ids['a'], ids['-b']
                site_id = '00000000-0000-4000-8000-%012d' % (stamp % 10 ** 12)
                # THE SHAPE THIS STORY DECLARES (AD-25), written the way `site-health.ts` writes it.
                status, rows = rest(
                    env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'], 'POST', '/notifications',
                    {'user_id': owner, 'kind': 'site_health',
                     'title': f'{copy["HEALTH"]["unhealthy"]} — harness',
                     'body': copy['REASONS']['ghost_unknown_key'],
                     'link': f'/sites?manage={site_id}',
                     'data': {'site_id': site_id, 'reason': 'ghost_unknown_key'}},
                    prefer='return=representation')
                row_id = (rows or [{}])[0].get('id') if isinstance(rows, list) else None
                if status >= 300 or not row_id:
                    run.step('notice-rls', False, f'the site_health row would not insert: HTTP {status} {rows}')
                else:
                    tokens = {
                        'owner': session(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'],
                                         f'health-harness-{stamp}@inflozo.com', password),
                        'other': session(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'],
                                         f'health-harness-{stamp}-b@inflozo.com', password),
                    }
                    if not all(tokens.values()):
                        run.step('notice-rls', False, 'a fixture session could not be obtained')
                    else:
                        query = f'/notifications?kind=eq.site_health&resolved_at=is.null&id=eq.{row_id}'
                        mine_status, mine = rest(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'],
                                                 'GET', query, bearer=tokens['owner'])
                        their_status, theirs = rest(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'],
                                                    'GET', query, bearer=tokens['other'])
                        # …and nobody's own session may WRITE one: this epic writes rows and E13
                        # only reads them, so the insert grant belongs to the service role alone.
                        ins_status, _ = rest(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'],
                                             'POST', '/notifications',
                                             {'user_id': owner, 'kind': 'site_health', 'title': 'forged'},
                                             bearer=tokens['owner'])
                        del_status, _ = rest(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'],
                                             'DELETE', f'/notifications?id=eq.{row_id}',
                                             bearer=tokens['owner'])
                        # RECOVERY RESOLVES, and a resolved row leaves the open set the card reads.
                        # STAMPED THROUGH THE FILTER `resolveNotice` REALLY USES — `data->>site_id`,
                        # because `notifications` is FR-B7's table and has no `site_id` column, and
                        # adding one would be the migration this story is specified not to need. A
                        # jsonb path in an UPDATE filter is a claim about PostgREST, so it is
                        # executed here rather than asserted: a 400 would otherwise mean recovery
                        # never resolved anything, in production, with every gate green.
                        stamped_status, stamped = rest(
                            env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'], 'PATCH',
                            f'/notifications?kind=eq.site_health&resolved_at=is.null'
                            f'&data->>site_id=eq.{site_id}',
                            {'resolved_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())},
                            prefer='return=representation')
                        after_status, after = rest(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'],
                                                   'GET', query, bearer=tokens['owner'])
                        mine_seen = len(mine) if isinstance(mine, list) else -1
                        theirs_seen = len(theirs) if isinstance(theirs, list) else -1
                        after_seen = len(after) if isinstance(after, list) else -1
                        run.step('notice-rls',
                                 mine_status == 200 and mine_seen == 1
                                 and their_status == 200 and theirs_seen == 0
                                 and ins_status >= 400 and del_status >= 400
                                 and stamped_status < 300 and len(stamped or []) == 1
                                 and after_status == 200 and after_seen == 0,
                                 f'owner sees {mine_seen} open row (HTTP {mine_status}); '
                                 f'the other account sees {theirs_seen} (HTTP {their_status}); '
                                 f'an insert from a user session is HTTP {ins_status} and a delete is '
                                 f'HTTP {del_status}; the data->>site_id filter resolveNotice uses '
                                 f'stamped {len(stamped or [])} row(s) (HTTP {stamped_status}); '
                                 f'after resolved_at the owner sees {after_seen} open '
                                 f'(HTTP {after_status})')
        finally:
            rest(env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'], 'DELETE',
                 f'/notifications?user_id=in.({",".join(made)})' if made else '/notifications?id=eq.0')
            for uid in made:
                admin.call('DELETE', f'/admin/users/{uid}', {})
            after_users = admin.user_count()
            if after_users is not None and before_users is not None and after_users != before_users:
                print(f'  WARNING the Admin-API user count moved: {before_users} -> {after_users}')

    # ── schedule: both sides read, neither restated.
    path = cron_path(run)
    if path:
        vercel = json.load(open(os.path.join(WEB, 'vercel.json'), encoding='utf-8'))
        jobs = vercel.get('crons') or []
        scheduled = [job for job in jobs if job.get('path') == path]
        exists = os.path.exists(os.path.join(WEB, 'app', path.lstrip('/'), 'route.ts'))
        run.step('schedule', bool(scheduled) and exists,
                 f'CRON_PATH is {path}; vercel.json schedules it at '
                 f'{scheduled[0]["schedule"] if scheduled else "NOTHING"} '
                 f'(alongside {len(jobs) - len(scheduled)} other job(s)); route.ts present: {exists}')

    # ── resend: FR-P1's third email, really sent.
    mail, error = app(
        'm.healthEmail({ site: "T3 (site-health harness)", reason: "ghost_unknown_key",'
        f' at: {json.dumps(time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))},'
        ' keysUrl: "https://app.inflozo.com/sites?manage=00000000-0000-4000-8000-000000000000" })',
        node_env)
    if error:
        run.step('resend', False, f'the app\'s email could not be composed: {error[0]}')
    else:
        req = urllib.request.Request(
            'https://api.resend.com/emails',
            data=json.dumps({'from': env['RESEND_FROM'], 'to': [env['RESEND_TEST_INBOX']],
                             'subject': mail['subject'], 'html': mail['html'], 'text': mail['text']}).encode(),
            method='POST',
            headers={'Authorization': f'Bearer {env["RESEND_API_KEY"]}',
                     'Content-Type': 'application/json',
                     # Resend sits behind Cloudflare bot protection that answers urllib's default
                     # User-Agent with 403 "error code: 1010" — a transport quirk, never an auth
                     # failure, and `check-access.py:45-49` already records it. The product's own
                     # send is `fetch` inside `lib/email.ts` and carries undici's, which passes.
                     'User-Agent': 'inflozo-probe/1.0'},
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                sent = json.loads(r.read() or b'{}')
            run.step('resend', bool(sent.get('id')),
                     f'Resend accepted the message composed by the app itself, id {sent.get("id")} '
                     f'(RESEND_FROM -> RESEND_TEST_INBOX, subject {mail["subject"]!r})')
        except urllib.error.HTTPError as e:
            run.step('resend', False, f'Resend refused it: HTTP {e.code}')
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            run.step('resend', False, f'Resend could not be reached: {e}')

    if args.check:
        return finish(run, args, '--check: the deployed cron was not called')

    # ── The deployed cron. The two controls FIRST: without them a green `cron-run` proves only
    #    that SOMETHING ran the job, not that the bearer is what let it.
    route = args.url.rstrip('/') + (path or '')
    status, body, headers = call_route(route)
    run.step('cron-no-header', route_401(status, body, headers, path),
             f'no Authorization: HTTP {status}, body {body!r}, '
             f'cache-control {headers.get("cache-control")!r}, x-matched-path {headers.get("x-matched-path")!r}')

    status, body, headers = call_route(route, 'not-the-secret-but-the-same-shape')
    run.step('cron-wrong-secret', route_401(status, body, headers, path),
             f'a wrong bearer: HTTP {status}, body {body!r}')

    status, body, headers = call_route(route, env['CRON_SECRET'])
    shaped = isinstance(body, dict) and {'checked', 'unhealthy', 'failed'} <= set(body)
    run.step('cron-run', status in (200, 500) and shaped and 'no-store' in (headers.get('cache-control') or ''),
             f'the real bearer: HTTP {status}, {body}, cache-control {headers.get("cache-control")!r}')
    if isinstance(body, dict) and body.get('failed'):
        run.record('cron-run', f'{body["failed"]} site(s) could not be decided — a 500 is the CORRECT '
                               'answer for that, and Vercel\'s log names each one by id and code (DW-46)')

    return finish(run, args)


def _order(name):
    return list(STEPS).index(name)


def finish(run, args, note=None):
    """`steps-listed`, and then the exit code. It is LAST because it audits what was printed, and
    `--check` stops before the deployed cron — so only the steps ABOVE that line are owed then."""
    printed = set(run.printed) | {'steps-listed'}
    limit = _order(_CHECK_ONLY_FROM) if args.check else len(STEPS)
    undocumented = sorted(name for name in printed if name not in STEPS)
    unprinted = [name for name in STEPS if name not in printed and _order(name) < limit]
    run.step('steps-listed', not undocumented and not unprinted,
             f'{len(printed)} step name(s) printed, every one of them named in STEPS and therefore '
             "in this file's own docstring"
             if not undocumented and not unprinted
             else f'undocumented: {undocumented or "none"}; declared but never printed: {unprinted or "none"}')
    print('  RESULT: ' + ('FAILED' if run.failed else f'PASSED ({note})' if note else 'PASSED'))
    return 1 if run.failed else 0


if __name__ == '__main__':
    sys.exit(main())
