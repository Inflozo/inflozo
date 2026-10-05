#!/usr/bin/env python3
"""Story 6.5's recorder — FR-E4's three mode inputs, one at a time, and a section's dark override, on a REAL Ghost (T1).

    python3 tools/probe/record-mode-resolution.py

It takes no flags. Like every recorder here, an argument it does not know is NOT a no-op: any argument prints this
text and exits, so `--help` uploads nothing. Run it only on the owner's go in the session itself, and in the main
session — never through a subagent (RESET-PROTOCOL.md § Ghost; the classifier refused a subagent's approved writes at
Story 5.24c).

T1 ONLY (R-238, owner, 2026-10-04): T3 was hacked and retired from testing, so no Ghost 5 leg runs; §69 says that half is
DW-326's, at Story 15.7.

WHY. The token block decides light or dark from one declared list of conditions, `MODE_SELECTORS` (R-239: the owner's
pin, the `scheme-light` / `scheme-dark` body class; on Auto, the visitor's `data-mode`; then the device), and a section's
dark override reaches a visitor as that section's own root properties written into the block (`darkOverrideCss`,
DW-195). The keyboard gate proves both on the canvas document; standing rule 1 says that until a real Ghost renders the
pin through `{{body_class}}`, the pin is a hypothesis. Story 6.1's §68 also switched dark on two ways at once — the
device's scheme AND `data-mode` (DW-318); here each input is read alone.

  1. It reads, through Node 24's type stripping: the reference set and `referenceTokensCss()`, refusing to run unless
     `reference-tokens.css` on disk is byte-for-byte what the engine emits; A22 #1 rendered on the canvas at its defaults
     (`tools/matrix/cases.mjs`' `renderInput`, the editor's own input) with Background Base in light, an override of
     Contrast in dark, and its hook (`darkHook`) — static HTML; and `darkOverrideCss` for that one section.
  2. It builds a probe theme whose `default.hbs` carries the token block verbatim in `<style id="inflozo-tokens">` and
     the section's per-instance rules in `<style id="inflozo-overrides">`, then `{{ghost_head}}`, §68's contrast-ground
     section (a plain and a classed link) and page-ground plain link, A22 #1 with its stylesheet, `{{{body}}}` and
     `{{ghost_foot}}`, inside `<body class="{{body_class}}{{#is "post"}} scheme-dark{{/is}}{{#is "author"}} scheme-light{{/is}}">`
     — so `/` is Auto, the post is pinned Dark and an author page pinned Light: a server-rendered class composed with
     `{{body_class}}`, and no setting written (the `@custom.color_scheme` chain is Story 7.11's, proved at 7.35). It gates
     the theme through tools/stress/gate.js — 0 errors on both majors, or nothing is uploaded.
  3. On T1, behind record-shim.py's `start_guard`, the theme is uploaded and activated and `/` read until it serves this
     run's nonce. The post is record-cards.py's own DRAFT article, read through Ghost's draft preview `/p/{uuid}/` — a
     HYPOTHESIS that its context is `post`: if that page is not this run's probe theme, the article is published for the
     run and returned to draft in the same `finally`, read back. The author page is the first author the Content API
     lists (it lists only authors with a published post). Chromium (the repository's Playwright) reads every combination
     — the device (light, dark) × the three pages × the visitor's `data-mode` (none, light, dark): every per-mode property
     on `:root`, §68's two plain links, and the overridden section's ground and words.
  4. THE CONTROLS (standing rule 2), each voiding the run: the page is this run's probe theme (its nonce);
     `document.body.classList` carries exactly the pin its page should — a miss is never guessed past; the media query
     reports the emulated scheme; with the token `<style>` disabled `--bg-page` reads empty; the classed link keeps its
     own colour; and with the overrides `<style>` disabled the section draws its LIGHT value's ground in every mode, so
     the per-instance rules are what move it.
  5. EXPECTED, every row from the ruled table (R-239) and the engine's own values: each per-mode property its mode's;
     a plain link on the page ground in the pack's link colour, on the contrast ground in the ground's words underlined in
     `--accent-on-contrast`; the section on the contrast ground in dark and on the page ground in light. A row that does
     not hold writes nothing: STOP AND ASK.
  6. Its `finally` is record-shim.py's `restore_and_delete` — the previous theme re-activated and read back, the probe
     theme DELETED and read back, whichever step failed — and, where the article was published, record-cards.py's
     `to_draft`, read back as a draft.

What it writes to the SERVER: one theme upload, two activations and that theme's DELETE, and only if the draft preview
cannot be read, the article published for the reading and returned to draft. No other content, no setting, no key; keys
are read by variable name and no URL that carries one is printed. To disk it writes MEASUREMENTS.md §69 alone, replacing
an earlier §69 of its own so a re-run re-records.
"""
import os, re, sys, json, time, datetime, secrets, subprocess, importlib.util
import urllib.error, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TOKENS_CSS = os.path.join(ROOT, 'packages', 'section-runtime', 'reference-tokens.css')
MEASUREMENTS = os.path.join(ROOT, '_bmad-output', 'planning-artifacts', 'architecture',
                            'architecture-Inflozo-2026-08-19', 'MEASUREMENTS.md')
COMMAND = 'python3 tools/probe/record-mode-resolution.py'
THEME_ZIP = 'inflozo-probe-mode-resolution.zip'
SECTION = '69'
OWN = 'rgb(10, 11, 12)'   # the classed link's own colour, set by the probe's screen.css — no token is this
PLACED = 'a22/1'          # the section whose dark override the block writes: Background Base in light, Contrast in dark
KEY = 'probe:a22-1'       # what darkHook hashes, as the editor's `${template_key}:${instanceId}`


def _load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


shim = _load('record_shim', 'record-shim.py')
contexts = _load('record_contexts', 'record-contexts.py')
core = _load('run_verify_core', 'run-verify-core.py')
cards = _load('record_cards', 'record-cards.py')
Void = contexts.Void
ARTICLE = cards.SLUGS['article']   # ('posts', 'inflozo-style-guide-article')

READ_ENGINE = r'''
import { createRequire } from 'node:module'
const root = process.env.ROOT
const ref = await import(`${root}/packages/section-runtime/src/reference.ts`)
const rt = await import(`${root}/packages/section-runtime/src/index.ts`)
const cases = await import(`${root}/tools/matrix/cases.mjs`)
const { iconDrawing } = await import(`${root}/packages/library/src/icons.ts`)
const { JSDOM } = createRequire(`${root}/packages/section-runtime/package.json`)('jsdom')
const entry = cases.pilot(process.env.PLACED)
const state = { controls: { bg: 'base' }, darkOverrides: { bg: 'contrast' } }
const instance = rt.darkHook(entry, state, process.env.KEY)
const input = { ...cases.renderInput(entry, { ...cases.fixtureRows(entry)[0], controls: state.controls }, iconDrawing), instance }
process.stdout.write(JSON.stringify({
  tokens: ref.REFERENCE_TOKENS, css: ref.referenceTokensCss(), instance,
  section: rt.renderCanvas(new JSDOM('<body></body>').window.document, entry.html, input),
  sectionCss: entry.css, overrides: rt.darkOverrideCss([{ key: process.env.KEY, entry, state }]),
}))
'''


def engine():
    """The reference set, the stylesheet the engine emits (and the file on disk that must equal it), the placed section,
    its stylesheet and its per-instance rules."""
    run = subprocess.run([core.node24(), '--input-type=module', '-e', READ_ENGINE], capture_output=True, text=True,
                         timeout=180, env={**os.environ, 'ROOT': ROOT, 'PLACED': PLACED, 'KEY': KEY})
    if run.returncode != 0:
        raise Void(f'the engine did not load:\n{run.stderr[-1500:]}')
    out = json.loads(run.stdout)
    if open(TOKENS_CSS, encoding='utf8').read() != out['css']:
        raise Void('reference-tokens.css is not what referenceTokensCss() emits — regenerate it (the spec\'s one-liner); '
                   'the probe would ship a stylesheet the engine never wrote')
    for what in ('css', 'section', 'sectionCss', 'overrides'):
        if '{{' in out[what] or '}}' in out[what]:
            raise Void(f'the {what} carries a Handlebars brace pair, which default.hbs would read as an expression')
    if not re.match(r'^[0-9a-f]{8}$', out['instance'] or '') or f'data-instance="{out["instance"]}"' not in out['section']:
        raise Void('the placed section carries no hook — its override is not in force, so there is nothing to read')
    if f'[data-instance="{out["instance"]}"]' not in out['overrides']:
        raise Void('darkOverrideCss wrote no rule for the placed section')
    return out


def theme(nonce, e):
    """The probe theme: every element the run reads is in `default.hbs`, the layout every page renders through."""
    body = (f'<main id="inflozo-probe-mode" data-nonce="{nonce}">\n'
            '<section id="probe-contrast" data-bg="contrast"><p>On the contrast ground: '
            '<a id="probe-contrast-plain" href="#plain">a plain link</a> and '
            '<a id="probe-contrast-classed" class="probe-own" href="#own">a classed link</a>.</p></section>\n'
            '<p>On the page ground: <a id="probe-page-plain" href="#page">a plain link</a>.</p>\n'
            f'{e["section"]}\n</main>\n')
    return {
        'default.hbs': ('<!DOCTYPE html>\n<html lang="{{@site.locale}}"><head><meta charset="utf-8">\n'
                        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                        '<title>{{meta_title}}</title>\n'
                        f'<style id="inflozo-tokens">\n{e["css"]}</style>\n'
                        f'<style id="inflozo-overrides">\n{e["overrides"]}</style>\n'
                        '<link rel="stylesheet" href="{{asset "css/screen.css"}}">\n'
                        '{{ghost_head}}</head>\n'
                        '<body class="{{body_class}}{{#is "post"}} scheme-dark{{/is}}{{#is "author"}} scheme-light{{/is}}">\n'
                        + body + '{{{body}}}\n{{ghost_foot}}</body></html>\n'),
        'index.hbs': '{{!< default}}\n<div>{{#foreach posts}}<p>{{title}}</p>{{/foreach}}</div>\n',
        'post.hbs': '{{!< default}}\n{{#post}}<article class="gh-content">{{content}}</article>{{/post}}\n',
        # GS110 on Ghost 5: page.hbs must honour the page builder's title-and-image toggle
        'page.hbs': ('{{!< default}}\n{{#post}}<article class="gh-content">{{#if @page.show_title_and_feature_image}}'
                     '<h1>{{title}}</h1>{{/if}}{{content}}</article>{{/post}}\n'),
        # GS051: both custom-font properties, in one file; GS050: the two Koenig width classes
        'assets/css/screen.css': ('body { margin: 0; background: var(--bg-page); color: var(--text-body); '
                                  'font-family: var(--gh-font-body, var(--font-body)); }\n'
                                  'h1 { font-family: var(--gh-font-heading, var(--font-heading)); }\n'
                                  '#probe-contrast { padding: 1rem; background: var(--bg-contrast); color: var(--text-on-contrast); }\n'
                                  f'.probe-own {{ color: {OWN}; text-decoration: none; }}\n'
                                  '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n'
                                  f'/* {PLACED} */\n{e["sectionCss"]}'),
        'package.json': json.dumps({
            'name': 'inflozo-probe-mode-resolution',
            'description': "Story 6.5's recording surface for FR-E4's three mode inputs and a section's dark override",
            'version': '1.0.0', 'engines': {'ghost': '>=5.0.0'}, 'license': 'MIT',
            'keywords': ['ghost', 'theme', 'ghost-theme'],
            'author': {'name': 'Inflozo', 'email': 'hello@inflozo.com'},
            'config': {'posts_per_page': 12, 'card_assets': True},
        }, indent=2) + '\n',
    }


DRIVER_JS = r'''
const { chromium } = require(process.env.PLAYWRIGHT)
const pages = JSON.parse(process.env.PAGES)
const perMode = JSON.parse(process.env.PER_MODE)
const LINKS = { 'page-plain': '#probe-page-plain', 'contrast-plain': '#probe-contrast-plain', 'contrast-classed': '#probe-contrast-classed' }
;(async () => {
  const browser = await chromium.launch()
  const out = []
  try {
    for (const p of pages) for (const device of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: device })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(String((e && e.message) || e)))
      const response = await page.goto(p.url, { waitUntil: 'load' })
      for (const visitor of [null, 'light', 'dark']) {
        const read = await page.evaluate(({ visitor, perMode, links }) => {
          const html = document.documentElement
          if (visitor) html.setAttribute('data-mode', visitor)
          else html.removeAttribute('data-mode')
          const look = (a) => {
            if (a === null) return null
            const s = getComputedStyle(a)
            return { color: s.color, line: s.textDecorationLine, decoration: s.textDecorationColor }
          }
          const section = document.querySelector('[data-instance]')
          const ground = () => (section === null ? null : { background: getComputedStyle(section).backgroundColor, color: getComputedStyle(section).color })
          const r = {
            nonce: document.getElementById('inflozo-probe-mode')?.getAttribute('data-nonce') ?? null,
            pins: [...document.body.classList].filter((c) => /^scheme-/.test(c)),
            visitor: html.getAttribute('data-mode'),
            dark: matchMedia('(prefers-color-scheme: dark)').matches,
            root: Object.fromEntries(perMode.map((n) => [n, getComputedStyle(html).getPropertyValue(n).trim()])),
            looks: Object.fromEntries(Object.entries(links).map(([k, sel]) => [k, look(document.querySelector(sel))])),
            section: ground(),
          }
          // THE CONTROLS: the token block is what declares the palette; the per-instance rules are what move the section
          const tokens = document.getElementById('inflozo-tokens')?.sheet ?? null
          const overrides = document.getElementById('inflozo-overrides')?.sheet ?? null
          if (tokens !== null) {
            tokens.disabled = true
            r.withoutTokens = getComputedStyle(html).getPropertyValue('--bg-page').trim()
            tokens.disabled = false
          }
          if (overrides !== null) {
            overrides.disabled = true
            r.withoutOverrides = ground()
            overrides.disabled = false
          }
          return r
        }, { visitor, perMode, links: LINKS })
        out.push({ page: p.name, pin: p.pin, device, visitor, status: response.status(), errors: [...errors], ...read })
      }
      await context.close()
    }
  } finally {
    await browser.close()
  }
  process.stdout.write(JSON.stringify(out))
})().catch((e) => { process.stderr.write(String((e && e.stack) || e)); process.exit(2) })
'''


def per_mode(tokens):
    """The properties a mode decides, read off the engine's two maps — never a list written here."""
    return [n for n in tokens['light'] if tokens['light'][n] != tokens['dark'][n]]


def drive(pages, tokens):
    run = subprocess.run(['node', '-e', DRIVER_JS], capture_output=True, text=True, timeout=600,
                         env={**os.environ, 'PLAYWRIGHT': core.PLAYWRIGHT, 'PAGES': json.dumps(pages),
                              'PER_MODE': json.dumps(per_mode(tokens))})
    if run.returncode != 0:
        raise Void(f'the Chromium driver failed:\n{run.stderr[-2000:]}')
    return json.loads(run.stdout)


def rgb(hexv):
    return f'rgb({int(hexv[1:3], 16)}, {int(hexv[3:5], 16)}, {int(hexv[5:7], 16)})'


def ruled(device, pin, visitor):
    """R-239's table (owner, 2026-10-05; Story 6.5's Design Notes, option 1): the owner's pin; on Auto the visitor's
    explicit choice; then the device. The oracle the token block is held to."""
    if pin == 'scheme-dark':
        return 'dark'
    if pin == 'scheme-light':
        return 'light'
    return visitor if visitor in ('light', 'dark') else device


def expected(tokens, mode):
    """Every value a row must read in `mode`, from the reference set itself — never restated here."""
    t = tokens[mode]
    deco = t['--link-decoration'].split()
    return {
        'root': {n: tokens[mode][n] for n in per_mode(tokens)},
        'page-plain': {'color': rgb(t['--link-color']), 'line': 'underline',
                       'decoration': rgb(deco[-1]) if deco[-1].startswith('#') else rgb(t['--link-color'])},
        'contrast-plain': {'color': rgb(t['--text-on-contrast']), 'line': 'underline', 'decoration': rgb(t['--accent-on-contrast'])},
        # the placed section: Contrast in dark (its override), Base in light
        'section': ({'background': rgb(t['--bg-contrast']), 'color': rgb(t['--text-on-contrast'])} if mode == 'dark'
                    else {'background': rgb(t['--bg-page']), 'color': rgb(t['--text-body'])}),
        # with the per-instance rules off, the light value's ground (Base) in this mode
        'without-overrides': {'background': rgb(t['--bg-page']), 'color': rgb(t['--text-body'])},
    }


def controls_held(rows, nonce):
    """[problem] — each one voids the run."""
    bad = []
    for r in rows:
        at = f'{r["page"]} · device {r["device"]} · visitor {r["visitor"] or "none"}'
        if r.get('status') != 200:
            bad.append(f'{at}: HTTP {r.get("status")}')
        if r.get('nonce') != nonce:
            bad.append(f'{at}: not this run\'s probe theme (nonce {r.get("nonce")!r})')
        if r.get('pins') != ([r['pin']] if r['pin'] else []):
            bad.append(f'{at}: body carries {r.get("pins")}, not {r["pin"] or "no pin"} — {{{{#is}}}} does not see this page\'s context as assumed; never guessed past')
        if r.get('visitor') != r['visitor']:
            bad.append(f'{at}: data-mode read back {r.get("visitor")!r}')
        if r.get('dark') != (r['device'] == 'dark'):
            bad.append(f'{at}: the media query did not report the emulated {r["device"]}')
        if r.get('withoutTokens') != '':
            bad.append(f'{at}: with the token <style> disabled --bg-page read {r.get("withoutTokens")!r} — something else declares it')
        if ((r.get('looks') or {}).get('contrast-classed') or {}).get('color') != OWN:
            bad.append(f'{at}: the classed link lost its own {OWN}')
        if r.get('section') is None:
            bad.append(f'{at}: no section carries the hook')
        if r.get('errors'):
            bad.append(f'{at}: page errors {r["errors"]}')
    return bad


def judge(rows, tokens):
    """[(ok, row, mode, what, got, want)] for every expected value."""
    out = []
    for r in rows:
        mode = ruled(r['device'], r['pin'], r['visitor'])
        want = expected(tokens, mode)
        got = {'root': r['root'], 'page-plain': r['looks']['page-plain'], 'contrast-plain': r['looks']['contrast-plain'],
               'section': r['section'], 'without-overrides': r['withoutOverrides']}
        for what in ('root', 'page-plain', 'contrast-plain', 'section', 'without-overrides'):
            out.append((got[what] == want[what], r, mode, what, got[what], want[what]))
    return out


def record(g, zipped, nonce, tokens):
    print(f'\n{"=" * 72}\nGhost {g.major} — {g.url}\n{"=" * 72}')
    version = g.api('GET', 'config/')['config']['version']
    previous = shim.start_guard(g)
    resource, slug = ARTICLE
    try:
        post = g.api('GET', f'{resource}/slug/{slug}/')[resource][0]
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
        raise Void(f'Ghost {g.major} carries no {slug} — run python3 tools/probe/record-cards.py first (its own draft article)')
    st, listed = g.content('authors/?limit=1')
    author = ((listed or {}).get('authors') or [{}])[0].get('slug')
    if st != 200 or not author:
        raise Void(f'the Content API lists no author with a published post (HTTP {st}) — there is no author page to pin Light on')
    st, res = g._multipart('themes/upload/', [('file', THEME_ZIP, 'application/zip', zipped)])
    name = res['themes'][0]['name']
    print(f'    Ghost {version}: theme uploaded HTTP {st} -> {name!r} (previous active: {previous!r})')
    published, how, path = False, None, None
    try:
        g.api('PUT', f'themes/{name}/activate/')
        for _ in range(10):
            time.sleep(2)
            st, html = g.page('/')
            if nonce in html:
                break
        else:
            raise Void(f'/ never served this run\'s probe theme (last HTTP {st}) — nothing Chromium reads there is a result')
        # the hypothesis first: Ghost's draft preview renders the draft through the active theme, in the post context
        path, how = f'/p/{post["uuid"]}/', "Ghost's draft preview, `/p/{uuid}/`"
        st, html = g.page(path)
        if st != 200 or nonce not in html or 'class="gh-content"' not in html:
            print(f'    the draft preview answered HTTP {st} and is not the probe theme\'s post page — publishing the article for the run')
            published = True   # BEFORE the PUT: a publish whose answer is lost must still be returned to draft
            doc = g.api('PUT', f'{resource}/{post["id"]}/', {resource: [{'status': 'published', 'updated_at': post['updated_at']}]})[resource][0]
            how = 'the article published for the reading and returned to draft in the same `finally`'
            path = urllib.parse.urlparse(doc['url']).path
            for _ in range(10):
                st, html = g.page(path)
                if st == 200 and nonce in html:
                    break
                time.sleep(2)
            else:
                raise Void(f'the published article at {path} never served the probe theme (last HTTP {st})')
        pages = [{'name': '`/` (Auto)', 'pin': None, 'url': g.url + '/'},
                 {'name': 'the post (pinned Dark)', 'pin': 'scheme-dark', 'url': g.url + path},
                 {'name': f'`/author/{author}/` (pinned Light)', 'pin': 'scheme-light', 'url': g.url + f'/author/{author}/'}]
        print(f'    reading `/`, the post through {how}, and /author/{author}/')
        rows = drive(pages, tokens)
    finally:
        failed = []
        try:
            shim.restore_and_delete(g, previous, [name])
        except Exception as e:   # noqa: BLE001 — collected, re-raised below, after the article is drafted too
            failed.append(e)
        if published:
            try:
                cards.to_draft(g, resource, post['id'])
                back = g.api('GET', f'{resource}/{post["id"]}/')[resource][0]['status']
                print(f'    {slug} returned to draft -> read back {back!r}')
                if back != 'draft':
                    failed.append(RuntimeError(f'{slug} is {back!r} after to_draft — return it to draft in Ghost admin'))
            except Exception as e:   # noqa: BLE001
                failed.append(e)
        if failed:
            raise failed[0]
    bad = controls_held(rows, nonce)
    if bad:
        raise Void('A CONTROL FAILED — nothing here is a result:\n      ' + '\n      '.join(bad))
    verdicts = judge(rows, tokens)
    for ok, r, mode, what, got, want in verdicts:
        if what == 'root':
            got = f'{sum(got[n] == want[n] for n in want)} of {len(want)} per-mode properties'
        print(f'    {"PASS" if ok else "FAIL"}  {r["page"]:<36} device {r["device"]:<5} visitor {(r["visitor"] or "none"):<5} → {mode:<5} {what:<18} {got}{"" if ok else f"  (expected {want})"}')
    return {'version': version, 'site': g.url, 'how': how, 'author': author, 'rows': rows, 'verdicts': verdicts}


# ── §69 ───────────────────────────────────────────────────────────────────────
def section(rec, gates, tokens, instance):
    today = datetime.date.today().isoformat()
    gline = ' · '.join(f'Ghost {c["major"]} via gscan {c["gscan"]} — {c["errors"]} errors / {c["warnings"]} warnings' for c in gates)
    held = {(v[1]['page'], v[1]['device'], v[1]['visitor'], v[3]): v[0] for v in rec['verdicts']}
    out = [f'## {SECTION}. FR-E4\'s three mode inputs, one at a time, and a section\'s dark override — the token block and '
           f'`darkOverrideCss` on a probe theme, T1 · {today}', '',
           f'**Command.** `{COMMAND}` — one theme upload and two activations, the previous theme restored and the probe theme '
           'deleted in a `finally`, both read back; record-cards.py\'s own draft article read as the line below says; no '
           'other content, no setting and no key written. T1 only (R-238).', '',
           "**Why.** Story 6.5 decides light or dark from one declared list of conditions, `MODE_SELECTORS` (R-239: the "
           "owner's pin, the `scheme-light` / `scheme-dark` body class; on Auto the visitor's `data-mode`; then the device), "
           "and carries a section's dark override to a visitor as its root properties written into the token block "
           "(`darkOverrideCss`, DW-195). The keyboard gate proves both on the canvas document; this is the pin composed with "
           "`{{body_class}}` on a real Ghost, and each input alone — §68 switched dark on two ways at once (DW-318). The "
           "theme carries `reference-tokens.css` byte-for-byte, then `darkOverrideCss` for A22 #1 (Background Base in light, "
           f'Contrast in dark, hook `{instance}`), with `<body class="{{{{body_class}}}}{{{{#is "post"}}}} scheme-dark{{{{/is}}}}'
           '{{#is "author"}} scheme-light{{/is}}">`, so `/` is Auto, the post is pinned Dark and an author page pinned '
           f'Light. Gate: {gline}.', '',
           "**The controls, each of which voids the run:** every page read was this run's probe theme (its nonce); its body "
           'carried exactly the pin its page should; the media query reported the emulated scheme; with the token '
           "`<style>` disabled `--bg-page` read empty; the classed link kept its own "
           f"`{OWN}`; and with the overrides `<style>` disabled the section drew Base's ground in every mode. Every one held.", '',
           f'### (a) T1 `{rec["site"].replace("https://", "")}` ({rec["version"]}) — the post read through {rec["how"]}; '
           f'the author page `/author/{rec["author"]}/`', '',
           '| Page | Device | Visitor (`data-mode`) | Resolves to | Per-mode `:root` | Plain links | Section A22 #1 | Overrides off |',
           '|---|---|---|---|---|---|---|---|']
    mark = lambda ok: 'as ruled' if ok else 'NOT as ruled'
    for r in rec['rows']:
        mode = ruled(r['device'], r['pin'], r['visitor'])
        k = (r['page'], r['device'], r['visitor'])
        links = held[(*k, 'page-plain')] and held[(*k, 'contrast-plain')]
        out.append(f'| {r["page"]} | {r["device"]} | {r["visitor"] or "none"} | **{mode}** | {mark(held[(*k, "root")])} | '
                   f'{mark(links)} | `{r["section"]["background"]}` — {mark(held[(*k, "section")])} | '
                   f'`{r["withoutOverrides"]["background"]}` (Base) |')
    out += ['', '### What it means', '',
            "- **The pin composes with `{{body_class}}` on a real Ghost, and wins as R-239 ruled.** A server-rendered "
            "`scheme-dark` on the post and `scheme-light` on the author page resolve the whole palette to their mode whatever "
            "the device and whatever `data-mode` says; on `/` (Auto, no class) the visitor's `data-mode` wins over the device, "
            "and with neither the device decides. Each input was read alone (DW-318).",
            "- **A section's dark override reaches a visitor.** A22 #1, Base in light, draws Contrast in dark from each input "
            "alone, and Base in light; with the per-instance rules disabled it draws Base in every mode — so "
            "`darkOverrideCss` is what moves it (DW-195).",
            "- **What this does NOT say.** Nothing here was compiled by Inflozo's emitter — the theme is a probe carrying the "
            "token block and one section's rules verbatim, as Epic 7 will (Story 7.4); the pin is written by a probe "
            "`{{#is}}`, not by `@custom.color_scheme` (Story 7.11), and the compiled theme's confirmation is Story 7.35's. "
            "Ghost 5's half is DW-326's, at Story 15.7 (R-238: T3 retired).", '']
    return '\n'.join(out)


def write_section(text):
    """Replace an earlier §69 written by this command IN PLACE, or append — a re-run re-records rather than leaving two,
    and never moves the section past a later one."""
    body = open(MEASUREMENTS, encoding='utf8').read().rstrip('\n')
    at = body.find(f'\n## {SECTION}. ')
    head, tail = (body, '') if at == -1 else (body[:at], body[at + 1:].partition('\n## ')[2])
    with open(MEASUREMENTS, 'w', encoding='utf8') as f:
        f.write(head.rstrip('\n') + '\n\n' + text.rstrip('\n') + '\n' + (f'\n## {tail}\n' if tail else ''))


if __name__ == '__main__':
    if sys.argv[1:]:
        print(__doc__)   # a recorder that ran on `--help` would upload to T1; the docstring is the help
        sys.exit(0)
    env = shim.load_env()
    nonce = secrets.token_hex(8)
    try:
        e = engine()
        files = theme(nonce, e)
        gates = contexts.gate(files)
        zipped = contexts.zip_bytes(files)
        g = shim.Ghost(env['GHOST6_URL'], env['GHOST6_STAFF_ACCESS_TOKEN'], '6', env['GHOST6_CONTENT_API_KEY'])
        rec = record(g, zipped, nonce, e['tokens'])
    except (Void, RuntimeError, urllib.error.HTTPError, urllib.error.URLError, OSError, KeyError, subprocess.SubprocessError, ValueError) as err:
        detail = err.read()[:400].decode('utf8', 'replace') if isinstance(err, urllib.error.HTTPError) else ''
        print(f'\n  ** RUN VOID — nothing written. {type(err).__name__}: {err} {detail}')
        sys.exit(1)
    failed = [v for v in rec['verdicts'] if not v[0]]
    if failed:
        print(f'\n  ** {len(failed)} value(s) did not hold — nothing written. STOP AND ASK: FR-E4\'s order or DW-195\'s '
              'expression is not what a real Ghost does with the token block.')
        sys.exit(1)
    write_section(section(rec, gates, e['tokens'], e['instance']))
    print(f'\n    MEASUREMENTS.md §{SECTION} written — every row held on T1, behind its controls.')
    sys.exit(0)
