#!/usr/bin/env python3
"""The schemas PostgREST exposes, read over the wire. CI's `rls` job runs this after the database gate on every push.

    python3 tools/probe/check-schemas-off-rest.py

DW-302 (Story 5.24e). `private` holds the Vault references and `storage` still carries D6's TRUNCATE grant, so neither
may ever be a schema the data API serves (AD-7). Hosted Supabase keeps that setting OUTSIDE the database, where
`RLS-TEST.sql` cannot see it (DW-294, MEASUREMENTS §60), so it is read here: `Accept-Profile` `private`, `storage` and
`vault` with the publishable key answer 406 PGRST106, PostgREST's hint naming exactly `public, graphql_public`; those two
answer 404 PGRST205, the control. The table does not exist, so no row is read either way.

SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY come from the environment when both are set, otherwise from Vercel's
production env with VERCEL_TOKEN, VERCEL_ORG_ID and VERCEL_PROJECT_ID, the secrets `deploy` already holds, so GitHub
holds no Supabase value. It prints ONE line, never a value, and exits 0 or 1. It fails closed: a Vercel or Supabase it
could not ask (no answer, an answer that is not JSON, a name missing) says COULD NOT ASK, which is not the finding "a
schema is exposed", and exits 1 all the same.

ONLY POSTGREST'S OWN TWO ANSWERS ARE JUDGED: a 406 or a 404 carrying a PostgREST `code`. A 401 (a key refused), a 5xx,
any other status, or an answer with no `code` is an answer about something else — Supabase reached, PostgREST's
verdict not — so it says COULD NOT ASK too, never the finding WRONG (Story 5.24e's review).

Stdlib only: the `rls` job installs nothing. `run-verify-ghost-admin.py --check`'s `schemas-off-rest` calls `check()`,
so the rule has one copy.

    python3 tools/probe/check-schemas-off-rest.py --self-check   # offline: canned answers, every verdict (root `pnpm test`)
"""
import http.client, json, os, sys, urllib.error, urllib.request

UNEXPOSED, EXPOSED = ('private', 'storage', 'vault'), ('public', 'graphql_public')
NAMES = ('SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY')
VERCEL = ('VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID')


class CouldNotAsk(Exception):
    """No answer to judge: never a verdict on exposure, and never a pass."""


def _get(url, headers, who):
    """(status, parsed JSON). What stopped an answer is named by its class alone: a message can carry the host."""
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
            status, raw = r.status, r.read()
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read()
    except (OSError, ValueError, http.client.HTTPException) as e:
        why = e.reason if isinstance(getattr(e, 'reason', None), BaseException) else e
        raise CouldNotAsk(f'{who} did not answer ({type(why).__name__})') from None
    try:
        return status, json.loads(raw)
    except ValueError:
        raise CouldNotAsk(f'{who} answered {status}, not JSON') from None


def check(url, key, unexposed=UNEXPOSED, exposed=EXPOSED):
    """(passed, the line after `schemas-off-rest: `), moved unchanged out of `run-verify-ghost-admin.py` (DW-302).

    A schema PostgREST does not expose answers 406 PGRST106 before any table is looked up, its hint naming the ones it
    does; the two it exposes get as far as the table and answer 404 PGRST205: the control, held to that answer (5.24d's
    review: "anything but 406" passed a 401 or a 500 too). The hint must name those two and no third, so a schema
    nobody thought to list here is seen as well."""
    profiles = {}
    try:
        for schema in unexposed + exposed:
            st, body = _get(f'{url.rstrip("/")}/rest/v1/inflozo_no_such_table?limit=0',
                            {'apikey': key, 'Authorization': f'Bearer {key}', 'Accept-Profile': schema},
                            f'Supabase ({schema})')
            profiles[schema] = (st, body if isinstance(body, dict) else {})
    except CouldNotAsk as e:
        return False, f'COULD NOT ASK: {e}. Nothing was judged, so it fails closed'
    # only PostgREST's own verdicts are judged: a 406 or a 404 with its `code`
    unjudged = [f'{s} {st} {b.get("code") or "with no code"}' for s, (st, b) in profiles.items() if st not in (404, 406) or not b.get('code')]
    if unjudged:
        return False, (f'COULD NOT ASK: Supabase answered {", ".join(unjudged)}, not PostgREST\'s verdict on a schema. '
                       'Nothing was judged, so it fails closed')
    wrong = ([s for s in unexposed if (profiles[s][0], profiles[s][1].get('code')) != (406, 'PGRST106')]
             + [s for s in exposed if (profiles[s][0], profiles[s][1].get('code')) != (404, 'PGRST205')])
    hints = sorted({b['hint'] for _, b in profiles.values() if b.get('hint')})
    named = {tuple(x.strip() for x in h.split(':', 1)[-1].split(',')) for s in unexposed if (h := profiles[s][1].get('hint'))}
    if named != {exposed}:
        wrong.append(f'the hint names {sorted(named)}, not exactly {", ".join(exposed)}')
    return not wrong, ('GET /rest/v1/inflozo_no_such_table with SUPABASE_PUBLISHABLE_KEY, Accept-Profile -> '
                       + ', '.join(f'{s} {st} {b.get("code")}' for s, (st, b) in profiles.items())
                       + f' (406 PGRST106 wanted for {", ".join(unexposed)}; 404 PGRST205 for {", ".join(exposed)}); '
                       f'PostgREST\'s hint: {" | ".join(hints) or "none"}'
                       + (f'; WRONG: {", ".join(wrong)}' if wrong else ''))


def from_vercel(token, team, project):
    """SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY as production holds them, and no other value. The env list (the
    CLI's own `getEnvRecords`, vercel@62.1.0) answers both `encrypted`; a by-id GET, Vercel's REST read of one
    variable, answers each decrypted. Both were executed read-only on 2026-10-02. Not the CLI's `/v3/env/pull`, which
    hands back every value, SUPABASE_SECRET_KEY with them. A `sensitive` variable is never decrypted, so one would end
    here as COULD NOT ASK."""
    auth = {'Authorization': f'Bearer {token}'}
    st, listed = _get(f'https://api.vercel.com/v10/projects/{project}/env?teamId={team}&target=production', auth,
                      "Vercel's env list")
    if st != 200 or not isinstance(listed, dict):
        raise CouldNotAsk(f"Vercel's env list answered {st}")
    ids = {e.get('key'): e.get('id') for e in listed.get('envs') or []
           if isinstance(e, dict) and 'production' in (e.get('target') or [])}
    values = []
    for name in NAMES:
        if not ids.get(name):
            raise CouldNotAsk(f"Vercel's production env has no {name}")
        st, got = _get(f'https://api.vercel.com/v1/projects/{project}/env/{ids[name]}?teamId={team}', auth,
                       f'Vercel ({name})')
        if st != 200 or not isinstance(got, dict) or got.get('decrypted') is not True or not got.get('value'):
            raise CouldNotAsk(f'Vercel answered {name} {st}, not a decrypted value')
        values.append(got['value'])
    return tuple(values)


def main():
    env, source = os.environ, None
    try:
        if all(env.get(n) for n in NAMES):
            url, key, source = env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'], 'the environment'
        else:
            missing = [n for n in VERCEL if not env.get(n)]
            if missing:
                raise CouldNotAsk(f'{" and ".join(NAMES)} are not both in the environment, and Vercel cannot be '
                                  f'asked without {", ".join(missing)}')
            url, key = from_vercel(*(env[n] for n in VERCEL))
            source = "Vercel's production env"
        ok, line = check(url, key)
    except CouldNotAsk as e:
        ok, line = False, f'COULD NOT ASK: {e}. Nothing was judged, so it fails closed'
    except Exception as e:  # anything else is named by its class alone, so no traceback can print a value
        ok, line = False, f'the check itself raised {type(e).__name__}. Nothing was judged, so it fails closed'
    print(f'{"PASS" if ok else "FAIL"}  schemas-off-rest: {line}'
          + (f'; {" and ".join(NAMES)} read from {source}, by name' if source else ''), flush=True)
    return 0 if ok else 1


def self_check():
    """Offline: `_get` answered from canned bodies, each verdict asserted — PASS, the two planted lists WRONG, and
    COULD NOT ASK for no answer, a 401, a 500, another status and a missing `code`. Exit 0, or the first that failed."""
    global _get
    real = _get
    hint = {'hint': 'Only the following schemas are exposed: public, graphql_public'}
    good = {**{s: (406, {'code': 'PGRST106', **hint}) for s in UNEXPOSED}, **{s: (404, {'code': 'PGRST205'}) for s in EXPOSED}}

    def answering(table):
        def fake(url, headers, who):
            if table is None:
                raise CouldNotAsk(f'{who} did not answer (ConnectionRefusedError)')
            return table(headers['Accept-Profile'])
        return fake

    cases = [
        ('the PASS shape', lambda s: good[s], {}, 'PASS'),
        ('graphql_public planted as unexposed', lambda s: good[s], {'unexposed': UNEXPOSED + ('graphql_public',)}, 'WRONG'),
        ('public alone planted as exposed', lambda s: good[s], {'exposed': ('public',)}, 'WRONG'),
        ('no answer', None, {}, 'COULD NOT ASK'),
        ('a 401, the key refused', lambda s: (401, {'message': 'Invalid API key', **hint}), {}, 'COULD NOT ASK'),
        ('a 500', lambda s: (500, {'code': 'XX000'}), {}, 'COULD NOT ASK'),
        ('another status', lambda s: (200, {'code': 'PGRST106'}) if s == 'vault' else good[s], {}, 'COULD NOT ASK'),
        ('a verdict with no code', lambda s: (406, dict(hint)) if s == 'private' else good[s], {}, 'COULD NOT ASK'),
    ]
    try:
        for name, table, plant, want in cases:
            _get = answering(table)
            ok, line = check('https://self-check.example', 'no-key', **plant)
            got = 'PASS' if ok else 'COULD NOT ASK' if line.startswith('COULD NOT ASK') else 'WRONG' if 'WRONG:' in line else 'FAIL'
            if got != want:
                print(f'SELF-CHECK FAIL  {name}: wanted {want}, got {got} — {line}')
                return 1
    finally:
        _get = real
    print(f'SELF-CHECK PASS  check-schemas-off-rest: {len(cases)} canned answers, each verdict as wanted')
    return 0


if __name__ == '__main__':
    sys.exit(self_check() if sys.argv[1:] == ['--self-check'] else main())
