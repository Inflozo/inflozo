#!/usr/bin/env python3
"""Story 4.7's probe — `core` proven where it will run: real Chromium, on a real Ghost, on both majors (R-82).

    python3 tools/probe/run-verify-core.py            # T3 (5.x) then T1 (6.x)
    python3 tools/probe/run-verify-core.py 6          # one major

It takes no flags. Like every recorder here, an argument it does not know is NOT a no-op: anything but a bare
major prints this text and exits, so `--help` uploads nothing.

1. It builds a minimal probe theme whose `assets/js/main.js` is `bundle()` (packages/library/src/modules.ts)
   over the REAL `packages/library/modules/core.js` plus three probe rows on four mounts — a plain module, an
   animating one, the plain one again declared `probe:768`, and one that throws — and asserts, as its control, that
   `checkThemeJs` REFUSES that theme (its probe names have no repo source) while it passes `bundle([])` over
   the repo's own sources. The page carries a fresh nonce, so a cached or foreign page cannot pass.
2. It gscans the theme through tools/stress/gate.js (0 errors on both majors), then on each server uploads
   and activates it with the staff token, re-reads `/` for the nonce, and drives the machine's Chromium
   (Playwright at run-verify-controls.cjs's path) through the I/O rows:
     JavaScript on at 1024 px: the plain and animating modules mount once, `js-enabled` on their own element
       and never on <html> or <body>, `ctx.t` fills "Loading {count} more", `ctx.observe` fires; the `:768`
       mount does not run; the throwing mount is unmarked; one IntersectionObserver in all
     1024 -> 600 -> 1024 px: the `:768` mount runs below the width, then aborts and is unmarked; a second
       observer appears for its own rootMargin
     reduced motion: the animating module waits, mounts when the preference clears, aborts when it returns
     JavaScript off: no element carries `js-enabled` and no module ran, on the same authored markup
   A page error other than the probe's own fails its row; a page that is not this run's probe page voids the run.
3. It restores the previous theme in a `finally` and re-reads the active theme to prove it. It writes nothing
   to disk, creates no content and touches no setting; no key is printed (keys are read by variable name).
"""
import os, re, sys, json, glob, time, shutil, secrets, subprocess, importlib.util
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MODULES_TS = os.path.join(ROOT, 'packages', 'library', 'src', 'modules.ts')
MODULE_DIR = os.path.join(ROOT, 'packages', 'library', 'modules')
PLAYWRIGHT = '/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright'
THEME_ZIP = 'inflozo-probe-core.zip'
THROWN = 'inflozo-probe: the throwing row threw'

# record-shim.py's client, env loader and JWT, and record-contexts.py's gscan gate, imported rather than copied
def _load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

shim = _load('record_shim', 'record-shim.py')
contexts = _load('record_contexts', 'record-contexts.py')
Void = contexts.Void


# ── the probe rows: real module files in shape, one function each ──────────────
def counting_module(fn):
    return f'''function {fn}(el, ctx) {{
  const bump = (name) => el.setAttribute(name, String(Number(el.getAttribute(name) || '0') + 1))
  bump('data-probe-mounts')
  el.setAttribute('data-probe-said', ctx.t('load-more-loading', {{ count: 12 }}))
  ctx.signal.addEventListener('abort', () => bump('data-probe-aborted'))
  ctx.observe(el, (entry) => {{ if (entry.isIntersecting) el.setAttribute('data-probe-seen', 'yes') }},
    el.id === 'narrow' ? {{ rootMargin: '0px 0px -1px 0px' }} : {{ threshold: 0 }})
}}
'''

PROBE_SOURCES = {
    'probe': counting_module('probe'),
    'probe-motion': counting_module('probeMotion'),
    'probe-throws': "function probeThrows(el) {\n  el.setAttribute('data-probe-mounts', '1')\n  throw new Error('" + THROWN + "')\n}\n",
}
PROBE_ROWS = [
    {'name': 'probe', 'editSafe': True, 'animates': False},
    {'name': 'probe-motion', 'editSafe': True, 'animates': True},
    {'name': 'probe-throws', 'editSafe': True, 'animates': False},
]

BUNDLE_JS = r'''
import { readFileSync, readdirSync } from 'node:fs'
const { bundle, checkThemeJs } = await import(process.env.MODULES_TS)
const dir = process.env.MODULE_DIR
const repo = Object.fromEntries(readdirSync(dir).filter((f) => /^[a-z][a-z0-9-]*\.js$/.test(f)).map((f) => [f.slice(0, -3), readFileSync(`${dir}/${f}`, 'utf8')]))
const { sources, rows } = JSON.parse(readFileSync(0, 'utf8'))
const main = bundle(rows.map((r) => r.name), { core: repo.core, ...sources }, rows)
process.stdout.write(JSON.stringify({
  main,
  refused: checkThemeJs({ 'assets/js/main.js': main }, repo),
  passes: checkThemeJs({ 'assets/js/main.js': bundle([], repo) }, repo),
  coreVerbatim: main.includes(repo.core),
}))
'''

DRIVER_JS = r'''
const { chromium } = require(process.env.PLAYWRIGHT)
const URL_ = process.env.PROBE_URL
const IDS = ['plain', 'motion', 'narrow', 'throws']
const countObservers = () => {
  const IO = window.IntersectionObserver
  window.__probeObservers = 0
  window.IntersectionObserver = class extends IO { constructor(...a) { super(...a); window.__probeObservers++ } }
}
const read = (page) => page.evaluate((ids) => {
  const el = (id) => document.getElementById(id)
  const out = {
    nonce: document.getElementById('inflozo-probe-core')?.getAttribute('data-nonce') ?? null,
    htmlOrBody: document.documentElement.classList.contains('js-enabled') || document.body.classList.contains('js-enabled'),
    enabledCount: document.querySelectorAll('.js-enabled').length,
    declared: document.querySelectorAll('[data-module]').length,
    observers: window.__probeObservers ?? null,
  }
  for (const id of ids) {
    const e = el(id)
    out[id] = e === null ? null : {
      enabled: e.classList.contains('js-enabled'),
      mounts: e.getAttribute('data-probe-mounts'), aborted: e.getAttribute('data-probe-aborted'),
      said: e.getAttribute('data-probe-said'), seen: e.getAttribute('data-probe-seen'),
    }
  }
  return out
}, IDS)
const settle = (page) => page.waitForTimeout(700)

;(async () => {
  const browser = await chromium.launch()
  const result = {}
  const open = async (name, options) => {
    const context = await browser.newContext({ viewport: { width: 1024, height: 900 }, ...options })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e && e.message ? e.message : String(e)))
    if (options.javaScriptEnabled !== false) await page.addInitScript(countObservers)
    const response = await page.goto(URL_, { waitUntil: 'load' })
    await settle(page)
    result[name] = { status: response.status(), errors, steps: {} }
    return { context, page, record: async (step) => { result[name].steps[step] = await read(page) } }
  }
  try {
    const on = await open('on', { reducedMotion: 'no-preference' })
    await on.record('1024')
    await on.page.setViewportSize({ width: 600, height: 900 }); await settle(on.page)
    await on.record('600')
    await on.page.setViewportSize({ width: 1024, height: 900 }); await settle(on.page)
    await on.record('1024-again')
    await on.context.close()

    const motion = await open('motion', { reducedMotion: 'reduce' })
    await motion.record('reduce')
    await motion.page.emulateMedia({ reducedMotion: 'no-preference' }); await settle(motion.page)
    await motion.record('cleared')
    await motion.page.emulateMedia({ reducedMotion: 'reduce' }); await settle(motion.page)
    await motion.record('returned')
    await motion.context.close()

    const off = await open('off', { javaScriptEnabled: false })
    await off.record('1024')
    await off.page.setViewportSize({ width: 600, height: 900 }); await settle(off.page)
    await off.record('600')
    await off.context.close()
  } finally {
    await browser.close()
  }
  process.stdout.write(JSON.stringify(result))
})().catch((e) => { process.stderr.write(String(e && e.stack || e)); process.exit(2) })
'''


def node24():
    candidates = [shutil.which('node')] + sorted(glob.glob(os.path.expanduser('~/.nvm/versions/node/v24*/bin/node')), reverse=True)
    for c in candidates:
        if c and subprocess.run([c, '--version'], capture_output=True, text=True).stdout.startswith('v24'):
            return c
    raise Void('no Node 24 on this machine — src/modules.ts is TypeScript and needs Node 24\'s type stripping')


def probe_theme(nonce):
    node = node24()
    run = subprocess.run([node, '--input-type=module', '-e', BUNDLE_JS], input=json.dumps({'sources': PROBE_SOURCES, 'rows': PROBE_ROWS}),
                         capture_output=True, text=True, timeout=120,
                         env={**os.environ, 'MODULES_TS': MODULES_TS, 'MODULE_DIR': MODULE_DIR})
    if run.returncode != 0:
        raise Void(f'bundle() failed:\n{run.stderr[-2000:]}')
    b = json.loads(run.stdout)
    # the controls: the check has teeth (the probe theme is refused) and is not refusing everything
    if not b['refused'] or not any('probe' in s for s in b['refused']):
        raise Void(f'CONTROL FAILED — checkThemeJs did not refuse the probe theme: {b["refused"]}')
    if b['passes'] != []:
        raise Void(f'CONTROL FAILED — checkThemeJs refused bundle([]) over the repo\'s own sources: {b["passes"]}')
    if not b['coreVerbatim']:
        raise Void('the probe main.js does not carry core.js verbatim')
    print(f'    checkThemeJs refuses the probe theme (control): {b["refused"][0][:110]}…')
    print('    checkThemeJs passes bundle([]) over packages/library/modules/ (the neighbour)')
    section = lambda ident, decl, body: (f'<section id="{ident}" data-module="{decl}" data-i18n-load-more-loading="Loading {{count}} more">'
                                         f'<p>{body}</p></section>\n')
    return {
        'default.hbs': ('<!DOCTYPE html>\n<html lang="{{@site.locale}}"><head><meta charset="utf-8">\n'
                        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                        '<title>{{meta_title}}</title>\n<link rel="stylesheet" href="{{asset "css/screen.css"}}">\n'
                        '{{ghost_head}}</head>\n<body class="{{body_class}}">\n{{{body}}}\n'
                        '<script defer src="{{asset "js/main.js"}}"></script>\n{{ghost_foot}}</body></html>\n'),
        'index.hbs': ('{{!< default}}\n'
                      f'<main id="inflozo-probe-core" data-nonce="{nonce}">\n'
                      + section('plain', 'probe', 'a plain module')
                      + section('motion', 'probe-motion', 'an animating module')
                      + section('narrow', 'probe:768', 'the plain module, below 768 px only')
                      + section('throws', 'probe-throws', 'a module that throws')
                      + '</main>\n'),
        'post.hbs': '{{!< default}}\n{{#post}}<article><h1>{{title}}</h1>{{content}}</article>{{/post}}\n',
        # GS110 on Ghost 5: page.hbs must honour the page builder's title-and-image toggle
        'page.hbs': ('{{!< default}}\n{{#post}}<article>{{#if @page.show_title_and_feature_image}}<h1>{{title}}</h1>{{/if}}'
                     '{{content}}</article>{{/post}}\n'),
        # GS051: both custom-font properties, in the same file
        'assets/css/screen.css': ('body { font-family: var(--gh-font-body, system-ui, sans-serif); }\n'
                                  'h1 { font-family: var(--gh-font-heading, system-ui, sans-serif); }\nsection { min-height: 4rem; }\n'
                                  '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n'),
        'assets/js/main.js': b['main'],
        'package.json': json.dumps({
            'name': 'inflozo-probe-core',
            'description': "Story 4.7's probe surface for core and the behaviour-module registry",
            'version': '1.0.0', 'engines': {'ghost': '>=5.0.0'}, 'license': 'MIT',
            'keywords': ['ghost', 'theme', 'ghost-theme'],
            'author': {'name': 'Inflozo', 'email': 'hello@inflozo.com'},
            'config': {'posts_per_page': 12, 'card_assets': True},
        }, indent=2) + '\n',
    }


def drive(url):
    run = subprocess.run(['node', '-e', DRIVER_JS], capture_output=True, text=True, timeout=300,
                         env={**os.environ, 'PLAYWRIGHT': PLAYWRIGHT, 'PROBE_URL': url})
    if run.returncode != 0:
        raise Void(f'the Chromium driver failed:\n{run.stderr[-2000:]}')
    return json.loads(run.stdout)


def judge(r, nonce):
    """[(ok, what)] for every row. A page that is not this run's probe page voids the run instead."""
    for scenario in r.values():
        for step, s in scenario['steps'].items():
            if s['nonce'] != nonce:
                raise Void(f'the page read at step {step} is not this run\'s probe page (nonce {s["nonce"]!r}) — nothing it shows is a result')
    rows = []
    add = lambda ok, what: rows.append((bool(ok), what))
    mounted = lambda m, n='1': m is not None and m['enabled'] and m['mounts'] == n
    on = r['on']
    a, b, c = on['steps']['1024'], on['steps']['600'], on['steps']['1024-again']
    add(on['status'] == 200, f'JS on: GET / answered {on["status"]}')
    add(mounted(a['plain']) and a['plain']['said'] == 'Loading 12 more', f'JS on, 1024 px: the plain module mounted once, js-enabled on its element, ctx.t filled {{count}} — {a["plain"]}')
    add(a['plain']['seen'] == 'yes', 'JS on: ctx.observe fired for a visible target')
    add(mounted(a['motion']), f'JS on, no reduced motion: the animating module mounted — {a["motion"]}')
    add(not a['narrow']['enabled'] and a['narrow']['mounts'] is None, f'JS on, 1024 px: the probe:768 mount did not run — {a["narrow"]}')
    add(not a['throws']['enabled'] and a['throws']['mounts'] == '1', f'JS on: the throwing mount ran and is unmarked — {a["throws"]}')
    add(not a['htmlOrBody'] and a['enabledCount'] == 2, f'JS on: js-enabled sits on the two running mounts only, never <html> or <body> — {a["enabledCount"]}')
    add(a['observers'] == 1, f'one IntersectionObserver for two mounts sharing options — {a["observers"]}')
    add(mounted(b['narrow']), f'600 px: the probe:768 mount runs below its width — {b["narrow"]}')
    add(b['observers'] == 2, f'600 px: its own rootMargin gets a second observer, and no third — {b["observers"]}')
    add(not c['narrow']['enabled'] and c['narrow']['aborted'] == '1', f'1024 px again: the probe:768 mount aborted and is unmarked — {c["narrow"]}')
    add(mounted(c['plain']) and c['plain']['aborted'] is None, f'1024 px again: the plain mount was never disturbed — {c["plain"]}')
    add(on['errors'] == [THROWN], f'JS on: no page error but the probe\'s own — {on["errors"]}')

    mo = r['motion']
    d, e, f = mo['steps']['reduce'], mo['steps']['cleared'], mo['steps']['returned']
    add(not d['motion']['enabled'] and d['motion']['mounts'] is None and mounted(d['plain']), f'reduced motion: the animating module waits, the plain one runs — {d["motion"]}')
    add(mounted(e['motion']), f'reduced motion cleared: the animating module mounts — {e["motion"]}')
    add(not f['motion']['enabled'] and f['motion']['aborted'] == '1', f'reduced motion returned: it aborts and loses js-enabled — {f["motion"]}')
    add(mo['errors'] == [THROWN], f'reduced motion: no page error but the probe\'s own — {mo["errors"]}')

    off = r['off']
    for step, s in off['steps'].items():
        add(s['enabledCount'] == 0 and s['declared'] == 4, f'JS off, {step} px: no element carries js-enabled, the four declarations stand — {s["enabledCount"]} / {s["declared"]}')
        add(all(s[i]['mounts'] is None for i in ('plain', 'motion', 'narrow', 'throws')), f'JS off, {step} px: no module ran')
    add(off['errors'] == [], f'JS off: no page error — {off["errors"]}')
    return rows


def verify(g, zipped, nonce):
    print(f'\n{"=" * 72}\nGhost {g.major} — {g.url}\n{"=" * 72}')
    version = g.api('GET', 'config/')['config']['version']
    themes = g.api('GET', 'themes/')['themes']
    previous = next((t['name'] for t in themes if t.get('active')), None)
    if previous is None:
        raise Void('no active theme reported — refusing to activate the probe with nothing to restore')
    st, res = g._multipart('themes/upload/', [('file', THEME_ZIP, 'application/zip', zipped)])
    name = res['themes'][0]['name']
    print(f'    Ghost {version}: theme uploaded HTTP {st} -> {name!r} (previous active: {previous!r})')
    try:
        g.api('PUT', f'themes/{name}/activate/')
        for _ in range(10):
            time.sleep(2)
            st, html = g.page('/')
            if nonce in html:
                break
        else:
            raise Void(f'/ never served this run\'s probe page (last HTTP {st}) — nothing Chromium reads there is a result')
        results = drive(g.url + '/')
    finally:
        g.api('PUT', f'themes/{previous}/activate/')
        active = next((t['name'] for t in g.api('GET', 'themes/')['themes'] if t.get('active')), None)
        print(f'    theme RESTORED -> {active!r}')
        if active != previous:
            raise Void(f'the previous theme {previous!r} did not come back — {active!r} is active')
    rows = judge(results, nonce)
    for ok, what in rows:
        print(f'    {"PASS" if ok else "FAIL"}  {what}')
    return version, rows


if __name__ == '__main__':
    args = sys.argv[1:]
    if any(a not in ('5', '6') for a in args):
        print(__doc__)  # a probe that ran on `--help` would upload to T1 and T3; the docstring is the help
        sys.exit(0)
    majors = args or ['5', '6']
    env = shim.load_env()
    nonce = secrets.token_hex(8)
    failed = 0
    try:
        files = probe_theme(nonce)
        contexts.gate(files)
        zipped = contexts.zip_bytes(files)
        for M in majors:
            g = shim.Ghost(env[f'GHOST{M}_URL'], env[f'GHOST{M}_STAFF_ACCESS_TOKEN'], M, env[f'GHOST{M}_CONTENT_API_KEY'])
            version, rows = verify(g, zipped, nonce)
            bad = [w for ok, w in rows if not ok]
            failed += len(bad)
            print(f'    Ghost {version}: {len(rows) - len(bad)} of {len(rows)} rows hold')
    except (Void, urllib.error.HTTPError, urllib.error.URLError, OSError, KeyError, subprocess.SubprocessError, ValueError) as e:
        detail = e.read()[:400].decode('utf8', 'replace') if isinstance(e, urllib.error.HTTPError) else ''
        print(f'\n  ** RUN VOID. {type(e).__name__}: {e} {detail}')
        sys.exit(1)
    print(f'\n  {"every row holds on " + " and ".join("Ghost " + m for m in majors) if failed == 0 else str(failed) + " row(s) FAILED"}')
    sys.exit(1 if failed else 0)
