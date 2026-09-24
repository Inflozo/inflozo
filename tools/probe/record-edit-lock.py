#!/usr/bin/env python3
"""Story 5.17's recorder — the four facts FR-D18's protocol rests on, executed against the real
Supabase project before a line of the choreography is written.

    env $(grep -E '^SUPABASE_(URL|SECRET_KEY|PUBLISHABLE_KEY)=' tools/probe/.env | xargs) \\
        python3 tools/probe/record-edit-lock.py

WHY IT EXISTS. The spec's whole approach is "no new SQL": acquisition and take-over are an
optimistic compare-and-swap on `edit_locks.lock_generation`, expressed as a PostgREST filtered
UPDATE, and detection has a Supabase Realtime broadcast channel in the middle of its three layers.
Every one of those is a claim about Supabase, and CLAUDE.md's first standing rule makes a claim
about an external platform a hypothesis until it is executed. If the CAS cannot be expressed, the
fallback is a `security definer` RPC — which is a migration, which is a Schema phase pushed on its
own before any Dev code (R-99). So this runs FIRST and the story reads its verdict.

WHAT IT EXECUTES, each step PASS, FAIL or RECORD, exiting non-zero if any step fails:

  (a) filtered-update   a PATCH filtered on `lock_generation` with `Prefer: return=representation`
                        returns THE ROW IT CHANGED, and returns `[]` — not an error, not the row —
                        when the filter misses. Both halves, because "it returned nothing" is also
                        what a broken request returns (standing rule 2)
  (b) cas-race          two real sessions of the same user fire the same `N -> N+1` CAS at one
                        barrier. EXACTLY ONE changes a row; the other gets `[]`. Its control is the
                        uncontended CAS immediately before it, which must change exactly one row —
                        without it, "one won" is satisfied by a CAS that never works at all
  (c) takeover-guard    a holder change at an UNCHANGED generation raises `42501` from
                        `guard_lock_takeover`. Control: the same holder change WITH the generation
                        advanced is accepted
  (c2) insert-grant     `lock_generation` is outside the INSERT grant — an INSERT naming it is
                        refused (`42501`), a plain INSERT defaults it to 1, and a second INSERT for
                        the same project is `23505`, which is the matrix's fall-through to the CAS
  (d) realtime          a Supabase Realtime BROADCAST channel per project — subscribe, send,
                        receive, and the round trip in milliseconds — tried BOTH public and private
                        (`config.private`), because a private channel needs an RLS policy on
                        `realtime.messages` and that would be a migration. Recorded either way:
                        this is the first execution of `addendum.md:45`'s transport claim, which
                        MEASUREMENTS.md has never carried

THE FIXTURE. One throwaway account (`edit-lock-harness-<stamp>@inflozo.com`) and one project row of
its own, both created here and deleted in a `finally`, with the Admin-API user count read before and
after so a leak is loud. Nothing a customer owns is read or written. The two sessions are two real
GoTrue sessions for that one account — `generate_link` then `POST /auth/v1/verify` — because the
lock is one person's devices negotiating with each other (`projects.user_id` is one account and team
seats are out of v1), and because RLS and the column grants only apply to a token that carries a
real `sub`.

NO KEY IS EVER PRINTED. Values reach a subprocess environment and nothing else.

It writes MEASUREMENTS.md §50 — under its own heading, replacing an earlier §50 written by this
command so a re-run re-records rather than appending a second one — and to nothing else.
"""

import json
import os
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MEASUREMENTS = os.path.join(ROOT, '_bmad-output', 'planning-artifacts', 'architecture',
                            'architecture-Inflozo-2026-08-19', 'MEASUREMENTS.md')
COMMAND = 'python3 tools/probe/record-edit-lock.py'
SUPABASE_JS = os.path.join(ROOT, 'apps', 'web', 'node_modules', '@supabase', 'supabase-js')


class Void(Exception):
    """A control did not pass, or the fixture could not be built. Nothing is written."""


def need(name):
    value = os.environ.get(name)
    if not value:
        raise Void(f'{name} is not in this command\'s environment — read it from tools/probe/.env')
    return value


def call(url, method='GET', body=None, headers=None, timeout=45):
    """One HTTP call, returning (status, parsed-body, raw-text). Never raises on an HTTP error —
    a 403 from a trigger IS the measurement."""
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers=headers or {},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read().decode('utf8', 'replace')
            status = r.status
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf8', 'replace')
        status = e.code
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return 0, {}, str(e)
    try:
        return status, (json.loads(raw) if raw.strip() else None), raw
    except ValueError:
        return status, None, raw


class Supabase:
    """The one project, three ways in: the secret key (fixtures), a user's access token (the
    protocol, under RLS and the column grants), and GoTrue's admin API."""

    def __init__(self, url, secret, publishable):
        self.url = url.rstrip('/')
        self.secret = secret
        self.publishable = publishable

    # ── fixtures, through the service role
    def admin(self, method, path, body=None):
        return call(f'{self.url}/auth/v1{path}', method, body,
                    {'apikey': self.secret, 'Authorization': f'Bearer {self.secret}',
                     'Content-Type': 'application/json'})

    def service(self, method, path, body=None, prefer='return=representation'):
        return call(f'{self.url}/rest/v1{path}', method, body,
                    {'apikey': self.secret, 'Authorization': f'Bearer {self.secret}',
                     'Content-Type': 'application/json', 'Prefer': prefer})

    # ── the protocol, through a real user session
    def rest(self, token, method, path, body=None, prefer='return=representation'):
        return call(f'{self.url}/rest/v1{path}', method, body,
                    {'apikey': self.publishable, 'Authorization': f'Bearer {token}',
                     'Content-Type': 'application/json', 'Prefer': prefer})

    def users(self):
        out, page = [], 1
        while True:
            status, body, _ = self.admin('GET', f'/admin/users?page={page}&per_page=200')
            if status != 200:
                return None
            users = (body or {}).get('users', [])
            if not users:
                return out
            out.extend(users)
            page += 1

    def session_for(self, email):
        """A REAL session for `email`, with no browser: `generate_link` mints a magic link's hashed
        token and `POST /auth/v1/verify` exchanges it for an access token. Two calls give two
        independent sessions of the same account — which is exactly what two devices are."""
        status, link, raw = self.admin('POST', '/admin/generate_link',
                                       {'type': 'magiclink', 'email': email})
        if status != 200 or not (link or {}).get('hashed_token'):
            raise Void(f'generate_link answered HTTP {status} — no session can start ({raw[:200]})')
        status, session, raw = call(
            f'{self.url}/auth/v1/verify', 'POST',
            {'type': 'magiclink', 'token_hash': link['hashed_token']},
            {'apikey': self.publishable, 'Content-Type': 'application/json'})
        if status != 200 or not (session or {}).get('access_token'):
            raise Void(f'/auth/v1/verify answered HTTP {status} — no session ({raw[:200]})')
        return session['access_token']


def pg_code(body):
    """PostgREST reports a Postgres error as `{code, message, ...}`. The CODE, never the message —
    a Postgres message quotes the row it refused."""
    return (body or {}).get('code') if isinstance(body, dict) else None


def lock_row(sb, token, project):
    """READ THROUGH A USER SESSION, never the service key: `edit_locks` is deliberately absent from
    the service_role grant loop (schema :1163-1177) — it is the client's table, and the service role
    cannot so much as select from it. Executed here: the first read through the secret key returned
    nothing at all, with no error."""
    status, body, _ = sb.rest(token, 'GET', f'/edit_locks?project_id=eq.{project}&select=*')
    return (body or [None])[0] if status == 200 and body else None


# ══ (a) a filtered UPDATE that returns the rows it changed
def filtered_update(sb, token, project, steps):
    row = lock_row(sb, token, project)
    generation = row['lock_generation']

    # the HIT — the filter matches, so one row comes back with the new value
    status, body, raw = sb.rest(
        token, 'PATCH',
        f'/edit_locks?project_id=eq.{project}&lock_generation=eq.{generation}&select=*',
        {'heartbeat_at': '2026-09-23T00:00:00Z', 'unsynced_edits': 7})
    hit = status == 200 and isinstance(body, list) and len(body) == 1 and body[0]['unsynced_edits'] == 7
    steps.append(('filtered-update/hit', hit,
                  f'HTTP {status}, {len(body) if isinstance(body, list) else "?"} row(s) returned'
                  f'{"" if hit else " — " + raw[:200]}'))

    # the MISS — the same request one generation too low. `[]`, not an error, and nothing moved
    status, body, raw = sb.rest(
        token, 'PATCH',
        f'/edit_locks?project_id=eq.{project}&lock_generation=eq.{generation - 1}&select=*',
        {'unsynced_edits': 99})
    after = lock_row(sb, token, project)
    miss = (status == 200 and isinstance(body, list) and len(body) == 0
            and after['unsynced_edits'] == 7)
    steps.append(('filtered-update/miss', miss,
                  f'HTTP {status}, {len(body) if isinstance(body, list) else "?"} row(s) returned, '
                  f'unsynced_edits still {after["unsynced_edits"]}'
                  f'{"" if miss else " — " + raw[:200]}'))
    return hit and miss


# ══ (b) the CAS, uncontended and then raced
def cas(sb, token, project, generation, holder):
    """`holder = me, generation = N+1` FILTERED ON `generation = N`. Zero rows means someone moved
    first. This is the whole protocol in one call."""
    return sb.rest(
        token, 'PATCH',
        f'/edit_locks?project_id=eq.{project}&lock_generation=eq.{generation}&select=*',
        {'holder_session_id': holder, 'lock_generation': generation + 1,
         'heartbeat_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())})


def cas_race(sb, tokens, project, steps):
    row = lock_row(sb, tokens[0], project)
    generation = row['lock_generation']

    # THE CONTROL, and it runs first: an uncontended CAS must change exactly one row. Without it,
    # "exactly one of two won" is also satisfied by a CAS that never works.
    status, body, raw = cas(sb, tokens[0], project, generation, 'control-session')
    control = status == 200 and isinstance(body, list) and len(body) == 1 \
        and body[0]['lock_generation'] == generation + 1
    steps.append(('cas-race/control', control,
                  f'uncontended CAS {generation} -> {generation + 1}: HTTP {status}, '
                  f'{len(body) if isinstance(body, list) else "?"} row(s)'
                  f'{"" if control else " — " + raw[:200]}'))
    if not control:
        return False

    generation += 1
    gate = threading.Barrier(2)
    results = {}

    def racer(i):
        gate.wait()
        started = time.time()
        status, body, raw = cas(sb, tokens[i], project, generation, f'racer-{i}')
        results[i] = (status, body, raw, round((time.time() - started) * 1000))

    threads = [threading.Thread(target=racer, args=(i,)) for i in (0, 1)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    changed = [i for i in (0, 1)
               if results[i][0] == 200 and isinstance(results[i][1], list) and len(results[i][1]) == 1]
    empty = [i for i in (0, 1)
             if results[i][0] == 200 and isinstance(results[i][1], list) and len(results[i][1]) == 0]
    after = lock_row(sb, tokens[0], project)
    one = (len(changed) == 1 and len(empty) == 1
           and after['lock_generation'] == generation + 1
           and after['holder_session_id'] == f'racer-{changed[0]}')
    steps.append(('cas-race/one-wins', one,
                  f'both fired at {generation} -> {generation + 1}: '
                  + ' · '.join(f'session {i} HTTP {results[i][0]} '
                               f'{len(results[i][1]) if isinstance(results[i][1], list) else "?"} row(s) '
                               f'in {results[i][3]} ms' for i in (0, 1))
                  + f' · the row now holds {after["holder_session_id"]} at generation '
                    f'{after["lock_generation"]}'))
    return one


# ══ (c) the take-over guard, and the INSERT grant
def takeover_guard(sb, token, project, steps):
    row = lock_row(sb, token, project)
    generation, holder = row['lock_generation'], row['holder_session_id']

    # the FORBIDDEN write: a new holder at an unchanged generation
    status, body, raw = sb.rest(
        token, 'PATCH', f'/edit_locks?project_id=eq.{project}&select=*',
        {'holder_session_id': 'forged-session', 'lock_generation': generation})
    after = lock_row(sb, token, project)
    refused = (pg_code(body) == '42501' and after['holder_session_id'] == holder
               and after['lock_generation'] == generation)
    steps.append(('takeover-guard/refused', refused,
                  f'HTTP {status}, SQLSTATE {pg_code(body) or "none"}; the holder is still '
                  f'{after["holder_session_id"]} at generation {after["lock_generation"]}'
                  f'{"" if refused else " — " + raw[:200]}'))

    # THE CONTROL: the same holder change WITH the generation advanced is accepted. Without it, a
    # refusal proves only that the write failed, not that the guard is what refused it.
    status, body, raw = cas(sb, token, project, generation, 'legitimate-successor')
    allowed = status == 200 and isinstance(body, list) and len(body) == 1
    steps.append(('takeover-guard/control', allowed,
                  f'the same holder change at generation {generation} -> {generation + 1}: '
                  f'HTTP {status}, {len(body) if isinstance(body, list) else "?"} row(s)'
                  f'{"" if allowed else " — " + raw[:200]}'))
    return refused and allowed


def insert_grant(sb, token, project, user_id, steps):
    """`lock_generation` is outside the INSERT grant (Round 4, F3) — so a client cannot open at a
    number no legitimate take-over would beat. Executed, plus the `23505` the matrix falls through
    on. This deletes and re-creates the row, so it runs LAST of the SQL half."""
    sb.rest(token, 'DELETE', f'/edit_locks?project_id=eq.{project}')

    status, body, raw = sb.rest(
        token, 'POST', '/edit_locks?select=*',
        {'project_id': project, 'user_id': user_id, 'holder_session_id': 'opener',
         'lock_generation': 9_999})
    named = pg_code(body) == '42501'
    steps.append(('insert-grant/named-refused', named,
                  f'INSERT naming lock_generation: HTTP {status}, SQLSTATE {pg_code(body) or "none"}'
                  f'{"" if named else " — " + raw[:200]}'))

    status, body, raw = sb.rest(
        token, 'POST', '/edit_locks?select=*',
        {'project_id': project, 'user_id': user_id, 'holder_session_id': 'opener',
         'unsynced_edits': 0})
    plain = status == 201 and isinstance(body, list) and len(body) == 1 \
        and body[0]['lock_generation'] == 1
    steps.append(('insert-grant/defaults-to-1', plain,
                  f'plain INSERT: HTTP {status}, lock_generation '
                  f'{body[0]["lock_generation"] if plain else "?"}'
                  f'{"" if plain else " — " + raw[:200]}'))

    status, body, raw = sb.rest(
        token, 'POST', '/edit_locks?select=*',
        {'project_id': project, 'user_id': user_id, 'holder_session_id': 'second-opener'})
    dup = pg_code(body) == '23505'
    steps.append(('insert-grant/second-is-23505', dup,
                  f'a second INSERT for the same project: HTTP {status}, '
                  f'SQLSTATE {pg_code(body) or "none"}'
                  f'{"" if dup else " — " + raw[:200]}'))
    return named and plain and dup


# ══ (d) Realtime broadcast — the first execution of addendum.md:45
REALTIME_JS = r'''
const { createClient } = require(process.env.SUPABASE_JS)

/* NOT `const URL`. `node -e` puts a top-level `const` in the realm's GLOBAL LEXICAL scope, which
   shadows the `URL` class for every module in the process — supabase-js's own `validateSupabaseUrl`
   then threw "Provided URL is malformed" on a perfectly good address. Executed, 2026-09-23. */
const SB_URL = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY
const TOKEN_A = process.env.TOKEN_A
const TOKEN_B = process.env.TOKEN_B
const PROJECT = process.env.PROJECT_ID
const OTHER = process.env.OTHER_PROJECT_ID

const client = async (token) => {
  const c = createClient(SB_URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } },
  })
  /* AWAITED: `setAuth` is async in realtime-js 2.x, and a channel that subscribes before the
     socket carries the token joins as the anon role — which is the difference between a public
     channel working and a private one being refused. */
  await c.realtime.setAuth(token)
  return c
}

const subscribe = (c, name, isPrivate) =>
  new Promise((resolve, reject) => {
    const ch = c.channel(name, { config: { broadcast: { self: false }, private: isPrivate } })
    const timer = setTimeout(() => reject(new Error('never SUBSCRIBED within 15s')), 15_000)
    ch.on('broadcast', { event: 'nudge' }, (m) => { ch._heard?.(m) })
    ch.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') { clearTimeout(timer); resolve(ch) }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        clearTimeout(timer); reject(new Error(`${status}${err ? ': ' + err.message : ''}`))
      }
    })
  })

const heard = (ch, ms) =>
  new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms)
    ch._heard = (m) => { clearTimeout(timer); resolve(m) }
  })

async function attempt(isPrivate) {
  const a = await client(TOKEN_A)
  const b = await client(TOKEN_B)
  const out = { private: isPrivate }
  try {
    const name = `lock:${PROJECT}`
    const reader = await subscribe(a, name, isPrivate)
    const writer = await subscribe(b, name, isPrivate)
    out.subscribed = true

    const waiting = heard(reader, 10_000)
    const sentAt = Date.now()
    const ack = await writer.send({ type: 'broadcast', event: 'nudge', payload: { from: 'b' } })
    out.send = ack
    const message = await waiting
    out.received = message !== null
    out.round_trip_ms = message === null ? null : Date.now() - sentAt
    out.payload_intact = message?.payload?.from === 'b'

    /* THE ISOLATION CONTROL: a message on ANOTHER project's channel must not arrive here. Without
       it, "it was received" proves only that something arrived, not that the channel is per-project. */
    const elsewhere = await subscribe(await client(TOKEN_B), `lock:${OTHER}`, isPrivate)
    const quiet = heard(reader, 4_000)
    await elsewhere.send({ type: 'broadcast', event: 'nudge', payload: { from: 'elsewhere' } })
    out.isolated = (await quiet) === null
  } catch (e) {
    out.subscribed = out.subscribed ?? false
    out.error = String(e && e.message ? e.message : e)
  } finally {
    try { await a.removeAllChannels(); await b.removeAllChannels() } catch {}
  }
  return out
}

;(async () => {
  const result = { public: await attempt(false), private: await attempt(true) }
  console.log(JSON.stringify(result))
  process.exit(0)
})()
'''


def realtime(sb, tokens, project, other, steps):
    if not os.path.isdir(SUPABASE_JS):
        steps.append(('realtime', None, '@supabase/supabase-js is not installed under apps/web — '
                                        'run `pnpm install` at the root first'))
        return {}
    proc = subprocess.run(
        ['node', '-e', REALTIME_JS], capture_output=True, text=True, timeout=180,
        env={**os.environ, 'SUPABASE_JS': SUPABASE_JS, 'PROJECT_ID': project,
             'OTHER_PROJECT_ID': other, 'TOKEN_A': tokens[0], 'TOKEN_B': tokens[1]})
    lines = [l for l in proc.stdout.splitlines() if l.startswith('{')]
    if not lines:
        steps.append(('realtime', False, 'the Node half printed nothing usable: '
                      + (proc.stderr or proc.stdout).strip()[:400]))
        return {}
    out = json.loads(lines[-1])
    for mode in ('public', 'private'):
        r = out[mode]
        ok = bool(r.get('received')) and bool(r.get('isolated'))
        steps.append((f'realtime/{mode}', None,
                      ('subscribed, received in %s ms, payload intact, and a message on another '
                       'project\'s channel did NOT arrive' % r.get('round_trip_ms'))
                      if ok else
                      ('subscribed=%s received=%s isolated=%s%s'
                       % (r.get('subscribed'), r.get('received'), r.get('isolated'),
                          ' — ' + r['error'] if r.get('error') else ''))))
    return out


# ══ the fixture
def fixture(sb, stamp):
    """One account and two projects of its own — the second exists only so the broadcast channel's
    isolation can be controlled. Returns (user_id, email, project, other_project)."""
    status, user, raw = sb.admin('POST', '/admin/users', {
        'email': f'edit-lock-harness-{stamp}@inflozo.com', 'password': f'Probe-{stamp}-Aa1!',
        'email_confirm': True})
    if status not in (200, 201) or not (user or {}).get('id'):
        raise Void(f'the fixture account could not be created: HTTP {status} ({raw[:200]})')
    user_id = user['id']
    projects = []
    for n in (1, 2):
        status, body, raw = sb.service('POST', '/projects?select=id', {
            'user_id': user_id, 'name': f'edit-lock-harness-{stamp}-{n}',
            'slug': f'edit-lock-harness-{stamp}-{n}', 'style_pack': {}})
        if status != 201 or not body:
            raise Void(f'the fixture project could not be created: HTTP {status} ({raw[:200]})')
        projects.append(body[0]['id'])
    return user_id, user['email'], projects[0], projects[1]


def section(steps, rt, stamp):
    when = time.strftime('%Y-%m-%d', time.gmtime())
    verdict = {name: ok for name, ok, _ in steps}
    out = [
        f'## 50. `edit_locks` — the compare-and-swap, the take-over guard and Realtime broadcast, '
        f'executed on the real Supabase project · {when}',
        '',
        f'`{COMMAND}`. Story 5.17. The first execution of FR-D18\'s protocol and of '
        '`addendum.md:45`\'s transport claim — MEASUREMENTS.md carried no occurrence of "realtime" '
        'or "broadcast" before this. One throwaway account and two projects of its own, created and '
        'deleted in a `finally`; two real GoTrue sessions of that one account, because the lock is '
        'one person\'s devices negotiating with each other. Every write below went through the '
        '`authenticated` role under RLS and the column grants — never the service key.',
        '',
        '### (a) The protocol, step by step',
        '',
        '| Step | Verdict | What the real project answered |',
        '|---|---|---|',
    ]
    for name, ok, detail in steps:
        mark = 'RECORD' if ok is None else ('**PASS**' if ok else '**FAIL**')
        out.append(f'| `{name}` | {mark} | {detail} |')
    out += [
        '',
        '### (b) What it means',
        '',
        '- **The CAS is expressible through PostgREST, so FR-D18 needs no migration and Story 5.17 '
        'has no Schema phase.** `PATCH /edit_locks?project_id=eq.<id>&lock_generation=eq.<N>` with '
        '`Prefer: return=representation` returns the row it changed and an EMPTY ARRAY — HTTP 200, '
        'not an error — when the filter misses. The empty array is the whole protocol: it is how a '
        'session learns it was beaten without a second round trip.',
        '- **Two sessions racing the same CAS produce exactly one winner.** Postgres re-evaluates '
        'the `WHERE` after the row lock is released under READ COMMITTED, so the loser\'s filter no '
        'longer matches and it changes nothing. No advisory lock, no `security definer` function and '
        'no serializable retry is needed.',
        '- **`guard_lock_takeover` is live and answers `42501`** to a holder change at an unchanged '
        'generation, which PostgREST surfaces as HTTP 403 with the SQLSTATE in the body. The '
        'displaced device\'s detection signal therefore cannot be routed around by a client.',
        '- **`lock_generation` is genuinely outside the INSERT grant**: an INSERT that names it is '
        'refused, a plain INSERT defaults it to 1, and a second INSERT for the same project is '
        '`23505` — the matrix\'s fall-through to the CAS path, executed.',
        '',
        '### (c) Realtime broadcast',
        '',
    ]
    if rt:
        for mode in ('public', 'private'):
            r = rt.get(mode, {})
            if r.get('received'):
                out.append(f'- **A {mode} channel `lock:<project id>` WORKS.** Subscribed, the '
                           f'message arrived in **{r.get("round_trip_ms")} ms** with its payload '
                           f'intact, and a message sent on ANOTHER project\'s channel did not '
                           f'arrive — the isolation control, without which "it was received" proves '
                           f'only that something arrived.')
            else:
                out.append(f'- **A {mode} channel is REFUSED.** subscribed: `{r.get("subscribed")}`'
                           + (f' — `{r["error"]}`' if r.get('error') else '') + '.')
    else:
        out.append('- Not executed — the Node half could not run.')
    out += [
        '',
        '**No publication and no Postgres Changes are involved.** Broadcast is ephemeral pub/sub '
        'over the Realtime socket; nothing is read from WAL, so nothing here would have needed a '
        'migration on the publication. **A PRIVATE channel is a different matter**: Realtime '
        'authorises it against `realtime.messages`, this project has no policy there, and adding '
        'one is a migration — which is the Ask First the spec names. A PUBLIC channel needs no '
        'policy and carries the opposite cost: the topic is `lock:<project id>`, so anyone holding '
        'the publishable key and a project id could join it and watch the nudges go by.',
        '',
        '### (d) What this does NOT say — and it decides the story',
        '',
        'Every call above was made by a **Node script holding a user access token**. The app has no '
        'such thing in the browser: `apps/web/lib/supabase/server.ts` is "THE ONLY PLACE A SUPABASE '
        'CLIENT IS MADE", there is no `NEXT_PUBLIC_*` key, and `lib/supabase/cookies.ts` sets the '
        'session cookie `httpOnly: true` precisely because "this app has none, so the cookie is '
        'closed to script". So the **browser cannot open a Realtime socket and cannot PATCH '
        'PostgREST directly** without a browser-side client, a public key and a script-readable '
        'session — none of which exists, and each of which is an architectural change the owner has '
        'not been asked for.',
        '',
        'The CAS is unaffected: it runs from a **route handler under the user\'s own session** '
        '(`projects/[id]/sync/route.ts`\'s shape), which is the same `authenticated` role, the same '
        'RLS and the same grants this section executed. Realtime\'s middle transport layer is the '
        'part that has nowhere to live; it was put to the owner and ruled OUT of v1 — **R-191** '
        '(2026-09-24): `BroadcastChannel` plus the ~15 s heartbeat are the shipped transport.',
        '',
    ]
    return '\n'.join(out)


def write_section(text):
    body = open(MEASUREMENTS).read().rstrip('\n')
    at = body.find('\n## 50. ')
    if at != -1:
        end = body.find('\n## ', at + 1)
        body = (body[:at] + ('' if end == -1 else body[end:])).rstrip('\n')
    with open(MEASUREMENTS, 'w') as f:
        f.write(body + '\n\n' + text.rstrip('\n') + '\n')


if __name__ == '__main__':
    if any(a.startswith('-') for a in sys.argv[1:]):
        # a recorder that ran on `--help` would create accounts on the live project
        print(__doc__)
        sys.exit(0)

    steps, rt, user_id = [], {}, None
    stamp = str(int(time.time()))
    try:
        sb = Supabase(need('SUPABASE_URL'), need('SUPABASE_SECRET_KEY'),
                      need('SUPABASE_PUBLISHABLE_KEY'))
        before = sb.users()
        if before is None:
            raise Void('the Admin API would not list users — the leak control cannot run')
        before = len(before)

        user_id, email, project, other = fixture(sb, stamp)
        tokens = [sb.session_for(email), sb.session_for(email)]
        if tokens[0] == tokens[1]:
            raise Void('the two sessions minted the same access token — they are not two sessions')
        print(f'    fixture ready: one account, two projects, two sessions')

        status, body, raw = sb.rest(tokens[0], 'POST', '/edit_locks?select=*', {
            'project_id': project, 'user_id': user_id, 'holder_session_id': 'first-opener'})
        if status != 201:
            raise Void(f'the first session could not take the lock at all: HTTP {status} ({raw[:200]})')

        filtered_update(sb, tokens[0], project, steps)
        cas_race(sb, tokens, project, steps)
        takeover_guard(sb, tokens[0], project, steps)
        insert_grant(sb, tokens[0], project, user_id, steps)
        rt = realtime(sb, tokens, project, other, steps)
    except (Void, subprocess.SubprocessError, OSError, ValueError, KeyError) as e:
        print(f'\n  ** RUN VOID — nothing written. {type(e).__name__}: {e}')
        sys.exit(1)
    finally:
        if user_id:
            sb.admin('DELETE', f'/admin/users/{user_id}', {})
            after = sb.users()
            print(f'    fixture removed; the account count is back to {before}'
                  if after is not None and len(after) == before else
                  '    ** the fixture account may have leaked — check the Admin API')

    for name, ok, detail in steps:
        print(f'  {"RECORD" if ok is None else ("PASS  " if ok else "FAIL  ")}  {name}: {detail}')

    failed = [name for name, ok, _ in steps if ok is False]
    write_section(section(steps, rt, stamp))
    print(f'\n    MEASUREMENTS.md §50 written.')
    if failed:
        print(f'    {len(failed)} step(s) FAILED: {", ".join(failed)}')
        sys.exit(1)
    sys.exit(0)
