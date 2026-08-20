#!/usr/bin/env python3
"""⛔ The Ghost(Pro) launch gate — written BEFORE the trial exists, on purpose.

    python3 tools/probe/run-verify-ghostpro.py

A Ghost(Pro) Starter trial is **14 days**, and VERIFY items 1 and 2 are the only
two on the register that block PUBLIC LAUNCH rather than an epic. The register's
own instruction is not to buy the trial until E14 opens, because a trial bought
early expires and has to be bought twice.

That instruction is about WHEN to buy. It says nothing about when to be READY,
and readiness is the thing that decides whether 14 days is enough. This script is
the readiness: when the trial starts, the whole gate is one command and a few
minutes, not a week of writing probes against a clock.

Fill these in `.env` and run:

    GHOSTPRO_URL=                 https://<your-site>.ghost.io
    GHOSTPRO_ADMIN_API_KEY=       Settings -> Integrations -> custom integration
    GHOSTPRO_CONTENT_API_KEY=     same screen
    GHOSTPRO_STAFF_ACCESS_TOKEN=  Profile -> Staff Access Token
    GHOSTPRO_PLAN=                "starter" | "creator" | "team" | "business"

What it answers, and why each one costs something if it stays unknown:

  item 1   the 2026 plan lineup and the Starter custom-theme restriction.
           Blocks launch and every Ghost(Pro)-aimed marketing claim (§4 T4).
  item 2   the `hostSettings.limits` shape from GET /admin/config/.
           Self-hosted has NO hostSettings key at all (§15h) -- FR-C2's probe
           reads ABSENCE as "not Ghost(Pro)". This is the other half: what a
           real Ghost(Pro) payload actually contains, and whether
           `limits.customThemes` is the flag FR-C2 assumes.
  item 3   the theme-upload ceiling on Ghost(Pro), against self-hosted's 1 GB.
  item 9   whether the Staff Access Token lifts GET /themes/ on Ghost(Pro) too
           -- it does on both self-hosted majors, and FR-J13/FR-J16 rest on it.
  item 10  whether a theme upload is even permitted on Starter, which is the
           whole FR-C2 Preview-only question.
"""
import os, re, sys, time, json, hmac, hashlib, base64, uuid, io, zipfile
import urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from importlib.machinery import SourceFileLoader
_m = SourceFileLoader('rv', os.path.join(HERE, 'run-verify-all.py')).load_module()
Ghost, load_env, zip_dir = _m.Ghost, _m.load_env, _m.zip_dir


def main():
    env = load_env()
    missing = [k for k in ('GHOSTPRO_URL', 'GHOSTPRO_ADMIN_API_KEY',
                           'GHOSTPRO_STAFF_ACCESS_TOKEN', 'GHOSTPRO_CONTENT_API_KEY')
               if not env.get(k)]
    if missing:
        print('Not yet runnable. Fill these in tools/probe/.env:')
        for k in missing:
            print(f'   {k}=')
        print('\nEverything else is ready — this is a one-command run once the trial exists.')
        return

    plan = env.get('GHOSTPRO_PLAN', '(unstated)')
    g = Ghost(env['GHOSTPRO_URL'], env['GHOSTPRO_STAFF_ACCESS_TOKEN'], '6', env['GHOSTPRO_CONTENT_API_KEY'])
    print(f'=== Ghost(Pro) — {env["GHOSTPRO_URL"]}  plan={plan} ===')

    # ---- item 2: the payload FR-C2's whole Preview-only detection rests on
    cfg = g.api('GET', 'config/')['config']
    hs = cfg.get('hostSettings')
    print('\n[item 2] GET /admin/config/')
    print(f'   version      : {cfg.get("version")}')
    print(f'   hostSettings : {"ABSENT" if hs is None else "PRESENT"}')
    if hs is not None:
        print(json.dumps(hs, indent=4))
        lim = hs.get('limits') or {}
        print(f'   limits keys  : {sorted(lim.keys())}')
        print(f'   customThemes : {json.dumps(lim.get("customThemes"))}')
    print('\n   >>> CHECK IN FIXTURES: this exact payload is what FR-C2 must be verified against.')
    os.makedirs(os.path.join(HERE, 'fixtures'), exist_ok=True)
    out = os.path.join(HERE, 'fixtures', f'ghostpro-config-{plan}.json')
    json.dump({'captured': time.strftime('%Y-%m-%d'), 'plan': plan,
               'command': 'GET /ghost/api/admin/config/', 'config': cfg}, open(out, 'w'), indent=2)
    print(f'   written: {out}')

    # ---- item 9
    print('\n[item 9] GET /themes/ with the Staff Access Token')
    try:
        th = g.api('GET', 'themes/')['themes']
        print(f'   200 — {len(th)} themes, active={[t["name"] for t in th if t.get("active")]}')
    except urllib.error.HTTPError as e:
        print(f'   {e.code} — {e.read()[:200].decode("utf8","replace")}')

    # ---- items 1, 3, 10: is a custom theme upload permitted at all?
    print('\n[items 1/3/10] theme upload on this plan')
    theme = os.path.join(HERE, 'theme-all')
    try:
        st, res = g.upload(zip_dir(theme), 'inflozo-probe-all.zip')
        print(f'   upload HTTP {st} — ACCEPTED. Custom themes are permitted on {plan}.')
        name = res['themes'][0]['name']
        try:
            g.api('PUT', f'themes/{name}/activate/')
            print('   activate: OK — full custom-theme support, not Preview-only.')
        except urllib.error.HTTPError as e:
            print(f'   activate REFUSED {e.code}: {e.read()[:250].decode("utf8","replace")}')
            print('   >>> This is the Preview-only shape FR-C2 exists to detect.')
    except urllib.error.HTTPError as e:
        body = e.read()[:400].decode('utf8', 'replace')
        print(f'   upload REFUSED {e.code}: {body}')
        print('   >>> Starter restriction confirmed. FR-C2 must detect this BEFORE a user designs.')

    # ---- item 3: find the real ceiling by growing a payload
    print('\n[item 3] upload ceiling — growing a padded theme until it is refused')
    for mb in (5, 10, 25, 50, 100):
        def pad(rel, data, _mb=mb):
            return rel, data
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, 'w', zipfile.ZIP_STORED) as z:
            for root, _, files in os.walk(theme):
                for f in files:
                    full = os.path.join(root, f)
                    z.writestr(os.path.relpath(full, theme), open(full, 'rb').read())
            z.writestr('assets/pad.bin', os.urandom(mb * 1024 * 1024))
        try:
            st, _ = g.upload(buf.getvalue(), 'inflozo-probe-size.zip')
            print(f'   {mb:>3} MB -> HTTP {st} accepted')
        except urllib.error.HTTPError as e:
            print(f'   {mb:>3} MB -> HTTP {e.code} REFUSED — ceiling is between the previous size and this')
            break
        except Exception as e:
            print(f'   {mb:>3} MB -> {type(e).__name__}: {e}')
            break

    print('\nDone. Compare against MEASUREMENTS §15h (self-hosted: hostSettings ABSENT, ceiling 1 GB).')


if __name__ == '__main__':
    main()
