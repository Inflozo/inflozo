#!/usr/bin/env python3
"""Story 6.1's recorder — R-173's link rule in a REAL theme, a post's body included (R-229), on T1 and T3.

    python3 tools/probe/record-token-links.py

It takes no flags. Like every recorder here, an argument it does not know is NOT a no-op: any argument prints this
text and exits, so `--help` uploads nothing. Run it only on the owner's go in the session itself, and in the main
session — never through a subagent (RESET-PROTOCOL.md § Ghost; the classifier refused a subagent's approved writes at
Story 5.24c).

WHY. R-173 (Story 5.14) gives every plain link — an `<a>` with no class — the pack's `--link-color` and
`--link-decoration` through the token block, and keeps a coloured ground's own words with a forced underline (Story
5.24c); R-229 (owner, 2026-10-03) ruled that the rule reaches a post's body too. All of it was executed on the canvas and
never in a theme. Standing rule 1: until it runs on a real Ghost it is a hypothesis. This is the first theme that ships
the token block.

  1. It reads the reference set from `packages/section-runtime/src/tokens.ts` (Node 24's type stripping) and refuses to
     run unless `reference-tokens.css` on disk is byte-for-byte what the engine emits — the file it ships.
  2. It builds a probe theme whose `default.hbs` carries that file verbatim in `<style id="inflozo-tokens">`, then
     `{{ghost_head}}`, a section `data-bg="contrast"` (background `--bg-contrast`, words `--text-on-contrast`) holding a
     plain link and a classed one, a plain link on the page ground, `{{{body}}}` and `{{ghost_foot}}`; `post.hbs` wraps
     `{{content}}` in `<article class="gh-content">`. It gates the theme through tools/stress/gate.js — 0 errors on both
     majors, or nothing is uploaded.
  3. On T3 (5.x) then T1 (6.x): `start_guard` refuses to start on a probe theme; the theme is uploaded and activated and
     `/` read until it serves this run's nonce. The post is record-cards.py's own DRAFT article
     (`inflozo-style-guide-article`, whose body carries a class-less link on both majors), read through Ghost's draft
     preview `/p/{uuid}/` — a HYPOTHESIS: if that page is not this run's probe theme, the article is published for the
     run and returned to draft in the same `finally`, read back. Chromium (the repository's Playwright) opens the post
     in light and in dark (`data-mode` on `<html>`, as the canvas sets it) and reads each link's computed `color`,
     `text-decoration-line` and `text-decoration-color`.
  4. THE CONTROLS (standing rule 2), each voiding the run: the page is this run's probe theme (its nonce); `--link-color`
     resolves on `:root` to the reference value in each mode; the classed link keeps its own colour; with the token
     `<style>` disabled the plain link's colour changes, and comes back when it is enabled again; and the post's body
     holds a plain link to read.
  5. EXPECTED: the plain link on the page ground and the plain link in the post's body in the pack's link colour and
     decoration (R-112's values; R-229 for the body); the plain link on the contrast ground in the ground's own words
     (`--text-on-contrast`), underlined in `--accent-on-contrast`. A row that does not hold writes nothing: STOP AND ASK.
  6. Its `finally` is record-shim.py's `restore_and_delete` — the previous theme re-activated and read back, the probe
     theme DELETED and read back, whichever step failed — and, where the article was published, record-cards.py's
     `to_draft`, read back as a draft.

What it writes to the SERVERS: one theme upload, two activations and that theme's DELETE per server, and only if the
draft preview cannot be read, the article published for the reading and returned to draft. No other content, no
setting, no key; keys are read by variable name and no URL that carries one is printed. To disk it writes
MEASUREMENTS.md §68 alone, replacing an earlier §68 of its own so a re-run re-records.
"""
import os, re, sys, json, time, datetime, secrets, subprocess, importlib.util
import urllib.error, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TOKENS_TS = os.path.join(ROOT, 'packages', 'section-runtime', 'src', 'tokens.ts')
TOKENS_CSS = os.path.join(ROOT, 'packages', 'section-runtime', 'reference-tokens.css')
MEASUREMENTS = os.path.join(ROOT, '_bmad-output', 'planning-artifacts', 'architecture',
                            'architecture-Inflozo-2026-08-19', 'MEASUREMENTS.md')
COMMAND = 'python3 tools/probe/record-token-links.py'
THEME_ZIP = 'inflozo-probe-token-links.zip'
SECTION = '68'
OWN = 'rgb(10, 11, 12)'   # the classed link's own colour, set by the probe's screen.css — no token is this


# record-shim.py's client and cleanup, record-contexts.py's gscan gate and zipper, run-verify-core.py's Chromium and
# Node 24, record-cards.py's article and its return to draft — imported rather than copied, each behind a __main__ guard
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
const m = await import(process.env.TOKENS_TS)
process.stdout.write(JSON.stringify({ tokens: m.REFERENCE_TOKENS, css: m.referenceTokensCss() }))
'''


def engine():
    """The reference set and the stylesheet the engine emits, and the file on disk that must equal it."""
    run = subprocess.run([core.node24(), '--input-type=module', '-e', READ_ENGINE], capture_output=True, text=True,
                         timeout=120, env={**os.environ, 'TOKENS_TS': TOKENS_TS})
    if run.returncode != 0:
        raise Void(f'tokens.ts did not load:\n{run.stderr[-1500:]}')
    out = json.loads(run.stdout)
    on_disk = open(TOKENS_CSS, encoding='utf8').read()
    if on_disk != out['css']:
        raise Void('reference-tokens.css is not what referenceTokensCss() emits — regenerate it (Verification\'s one-liner); '
                   'the probe would ship a stylesheet the engine never wrote')
    if '{{' in on_disk or '}}' in on_disk:
        raise Void('the token block carries a Handlebars brace pair, which default.hbs would read as an expression')
    return out['tokens'], on_disk


def theme(nonce, tokens_css):
    """The probe theme. Every link the run reads is in `default.hbs` — the layout every page renders through — so the
    post's own page carries the section links beside its body."""
    links = (f'<main id="inflozo-probe-links" data-nonce="{nonce}">\n'
             '<section id="probe-contrast" data-bg="contrast"><p>On the contrast ground: '
             '<a id="probe-contrast-plain" href="#plain">a plain link</a> and '
             '<a id="probe-contrast-classed" class="probe-own" href="#own">a classed link</a>.</p></section>\n'
             '<p>On the page ground: <a id="probe-page-plain" href="#page">a plain link</a>.</p>\n</main>\n')
    return {
        'default.hbs': ('<!DOCTYPE html>\n<html lang="{{@site.locale}}"><head><meta charset="utf-8">\n'
                        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                        '<title>{{meta_title}}</title>\n'
                        f'<style id="inflozo-tokens">\n{tokens_css}</style>\n'
                        '<link rel="stylesheet" href="{{asset "css/screen.css"}}">\n'
                        '{{ghost_head}}</head>\n<body class="{{body_class}}">\n' + links +
                        '{{{body}}}\n{{ghost_foot}}</body></html>\n'),
        'index.hbs': '{{!< default}}\n<div>{{#foreach posts}}<p>{{title}}</p>{{/foreach}}</div>\n',
        'post.hbs': '{{!< default}}\n{{#post}}<article class="gh-content">{{content}}</article>{{/post}}\n',
        # GS110 on Ghost 5: page.hbs must honour the page builder's title-and-image toggle
        'page.hbs': ('{{!< default}}\n{{#post}}<article class="gh-content">{{#if @page.show_title_and_feature_image}}'
                     '<h1>{{title}}</h1>{{/if}}{{content}}</article>{{/post}}\n'),
        # GS051: both custom-font properties, in one file; GS050: the two Koenig width classes
        'assets/css/screen.css': ('body { margin: 0; background: var(--bg-page); color: var(--text-body); '
                                  'font-family: var(--gh-font-body, var(--font-body)); }\n'
                                  'h1 { font-family: var(--gh-font-heading, var(--font-heading)); }\n'
                                  '[data-bg="contrast"] { padding: 1rem; background: var(--bg-contrast); color: var(--text-on-contrast); }\n'
                                  f'.probe-own {{ color: {OWN}; text-decoration: none; }}\n'
                                  '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n'),
        'package.json': json.dumps({
            'name': 'inflozo-probe-token-links',
            'description': "Story 6.1's recording surface for R-173's link rule and R-229",
            'version': '1.0.0', 'engines': {'ghost': '>=5.0.0'}, 'license': 'MIT',
            'keywords': ['ghost', 'theme', 'ghost-theme'],
            'author': {'name': 'Inflozo', 'email': 'hello@inflozo.com'},
            'config': {'posts_per_page': 12, 'card_assets': True},
        }, indent=2) + '\n',
    }


DRIVER_JS = r'''
const { chromium } = require(process.env.PLAYWRIGHT)
const LINKS = { 'page-plain': '#probe-page-plain', 'contrast-plain': '#probe-contrast-plain', 'contrast-classed': '#probe-contrast-classed' }
;(async () => {
  const browser = await chromium.launch()
  const out = {}
  try {
    for (const mode of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: mode })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(String((e && e.message) || e)))
      const response = await page.goto(process.env.PROBE_URL, { waitUntil: 'load' })
      out[mode] = await page.evaluate(({ mode, links }) => {
        document.documentElement.setAttribute('data-mode', mode)
        const look = (a) => {
          if (a === null) return null
          const s = getComputedStyle(a)
          return { color: s.color, line: s.textDecorationLine, decoration: s.textDecorationColor }
        }
        // the post's own first plain link, outside every Koenig card (a card's links carry Ghost's classes)
        const body = [...document.querySelectorAll('article.gh-content a')]
          .find((a) => (a.getAttribute('class') ?? '').trim() === '' && a.closest('[class*="kg-"]') === null) ?? null
        const read = {
          nonce: document.getElementById('inflozo-probe-links')?.getAttribute('data-nonce') ?? null,
          linkColorToken: getComputedStyle(document.documentElement).getPropertyValue('--link-color').trim(),
          bodyHref: body?.getAttribute('href') ?? null,
          looks: Object.fromEntries(Object.entries(links).map(([k, sel]) => [k, look(document.querySelector(sel))])),
        }
        read.looks['post-body-plain'] = look(body)
        // THE CONTROL: the token block is what colours the plain link — disabled, the colour must change
        const plain = document.querySelector(links['page-plain'])
        const sheet = document.getElementById('inflozo-tokens')?.sheet ?? null
        if (sheet !== null && plain !== null) {
          sheet.disabled = true
          read.withoutTokens = getComputedStyle(plain).color
          sheet.disabled = false
          read.restored = getComputedStyle(plain).color
        }
        return read
      }, { mode, links: LINKS })
      out[mode].status = response.status()
      out[mode].errors = errors
      await context.close()
    }
  } finally {
    await browser.close()
  }
  process.stdout.write(JSON.stringify(out))
})().catch((e) => { process.stderr.write(String((e && e.stack) || e)); process.exit(2) })
'''


def drive(url):
    run = subprocess.run(['node', '-e', DRIVER_JS], capture_output=True, text=True, timeout=300,
                         env={**os.environ, 'PLAYWRIGHT': core.PLAYWRIGHT, 'PROBE_URL': url})
    if run.returncode != 0:
        raise Void(f'the Chromium driver failed:\n{run.stderr[-2000:]}')
    return json.loads(run.stdout)


def rgb(hexv):
    return f'rgb({int(hexv[1:3], 16)}, {int(hexv[3:5], 16)}, {int(hexv[5:7], 16)})'


def expected(tokens, mode):
    """What each link must read in `mode`, from the reference set itself — never a value restated here."""
    t = tokens[mode]
    deco = t['--link-decoration'].split()
    plain = {'color': rgb(t['--link-color']), 'line': 'underline',
             'decoration': rgb(deco[-1]) if deco[-1].startswith('#') else rgb(t['--link-color'])}
    return {
        'page-plain': plain,
        # R-229: a plain link in a post's body takes the same look
        'post-body-plain': plain,
        # R-173 and DW-224: the ground's own words, the underline forced, in the contrast accent
        'contrast-plain': {'color': rgb(t['--text-on-contrast']), 'line': 'underline', 'decoration': rgb(t['--accent-on-contrast'])},
    }


def controls_held(read, nonce, tokens):
    """[problem] — each one voids the run."""
    bad = []
    for mode, r in read.items():
        if r.get('status') != 200:
            bad.append(f'{mode}: the post answered HTTP {r.get("status")}')
        if r.get('nonce') != nonce:
            bad.append(f'{mode}: the page is not this run\'s probe theme (nonce {r.get("nonce")!r}) — nothing on it is a result')
        if r.get('linkColorToken', '').lower() != tokens[mode]['--link-color'].lower():
            bad.append(f'{mode}: --link-color resolved on :root to {r.get("linkColorToken")!r}, not {tokens[mode]["--link-color"]!r}')
        classed = (r.get('looks') or {}).get('contrast-classed') or {}
        if classed.get('color') != OWN:
            bad.append(f'{mode}: the classed link reads {classed.get("color")!r}, not its own {OWN} — the rule reached a link it must not')
        plain = ((r.get('looks') or {}).get('page-plain') or {}).get('color')
        if r.get('withoutTokens') in (None, plain) or r.get('restored') != plain:
            bad.append(f'{mode}: with the token <style> disabled the plain link read {r.get("withoutTokens")!r} (enabled {plain!r}, '
                       f're-enabled {r.get("restored")!r}) — the token block is not what colours it')
        if (r.get('looks') or {}).get('post-body-plain') is None:
            bad.append(f'{mode}: the post\'s body holds no plain link outside a card — the R-229 row would prove nothing')
        if r.get('errors'):
            bad.append(f'{mode}: page errors {r["errors"]}')
    return bad


def judge(read, tokens):
    """[(ok, mode, link, got, want)] for every expected row."""
    rows = []
    for mode, r in read.items():
        for link, want in expected(tokens, mode).items():
            got = r['looks'][link]
            rows.append((got == want, mode, link, got, want))
    return rows


def record(g, zipped, nonce, tokens):
    print(f'\n{"=" * 72}\nGhost {g.major} — {g.url}\n{"=" * 72}')
    version = g.api('GET', 'config/')['config']['version']
    previous = shim.start_guard(g)
    resource, slug = ARTICLE
    try:
        post = g.api('GET', f'{resource}/slug/{slug}/?formats=html')[resource][0]
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
        raise Void(f'Ghost {g.major} carries no {slug} — run python3 tools/probe/record-cards.py first (its own draft article)')
    if not re.search(r'<a(?![^>]*\bclass=)[^>]*\bhref=', post.get('html') or ''):
        raise Void(f'Ghost {g.major}: {slug}\'s body carries no class-less link — the post-body row would prove nothing')
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
        # the hypothesis first: Ghost's draft preview renders the draft through the active theme
        path, how = f'/p/{post["uuid"]}/', "Ghost's draft preview, `/p/{uuid}/`"
        st, html = g.page(path)
        if st != 200 or nonce not in html or 'class="gh-content"' not in html:
            print(f'    the draft preview answered HTTP {st} and is not the probe theme\'s post page — publishing the article for the run')
            doc = g.api('PUT', f'{resource}/{post["id"]}/', {resource: [{'status': 'published', 'updated_at': post['updated_at']}]})[resource][0]
            published, how = True, 'the article published for the reading and returned to draft in the same `finally`'
            path = urllib.parse.urlparse(doc['url']).path
            for _ in range(10):
                st, html = g.page(path)
                if st == 200 and nonce in html:
                    break
                time.sleep(2)
            else:
                raise Void(f'the published article at {path} never served the probe theme (last HTTP {st})')
        print(f'    reading the post through {how}')
        read = drive(g.url + path)
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
    bad = controls_held(read, nonce, tokens)
    if bad:
        raise Void('A CONTROL FAILED — nothing here is a result:\n      ' + '\n      '.join(bad))
    rows = judge(read, tokens)
    for ok, mode, link, got, want in rows:
        print(f'    {"PASS" if ok else "FAIL"}  {mode:<5} {link:<16} {got}{"" if ok else f"  (expected {want})"}')
    return {'major': g.major, 'version': version, 'site': g.url, 'how': how, 'read': read, 'rows': rows}


# ── §68 ───────────────────────────────────────────────────────────────────────
def section(recs, gates, tokens):
    today = datetime.date.today().isoformat()
    gline = ' · '.join(f'Ghost {c["major"]} via gscan {c["gscan"]} — {c["errors"]} errors / {c["warnings"]} warnings' for c in gates)
    words = {'page-plain': 'plain, page ground', 'contrast-plain': 'plain, contrast ground',
             'post-body-plain': "plain, the post's body (R-229)", 'contrast-classed': 'classed, contrast ground (control)'}
    out = [f'## {SECTION}. R-173\'s link rule in a real theme — the reference token block on a probe theme, both majors, '
           f'a post\'s body included (R-229) · {today}', '',
           f'**Command.** `{COMMAND}` — one theme upload per server and two activations, the previous theme restored and the '
           'probe theme deleted in a `finally`, both read back; record-cards.py\'s own draft article read as each line '
           'below says; no other content, no setting and no key written.', '',
           "**Why.** R-173 (Story 5.14) gives every plain link — an `<a>` with no class — the pack's `--link-color` and "
           "`--link-decoration` through the token block at zero specificity, and keeps a coloured ground's own words with a "
           "forced underline (Story 5.24c); R-229 (owner, 2026-10-03, Story 6.1's Question 1) ruled that the rule reaches a "
           "post's body too. Until now all of it ran on the canvas alone. This is the first theme that ships the token "
           "block: `packages/section-runtime/reference-tokens.css`, byte-for-byte what `referenceTokensCss()` emits, inline "
           f'in `default.hbs`. Gate: {gline}.', '',
           '**The controls, each of which voids the run:** the page read was this run\'s probe theme (its nonce); '
           '`--link-color` resolved on `:root` to the reference value in each mode; the classed link kept its own '
           f'`{OWN}`; with the token `<style>` disabled the plain link\'s colour changed, and came back when it was enabled '
           'again; the post\'s body held a plain link outside every card. Every one held.', '']
    for i, rec in enumerate(recs):
        t = 'T1' if rec['major'] == '6' else 'T3'
        out += [f'### ({"abcd"[i]}) {t} `{rec["site"].replace("https://", "")}` ({rec["version"]}) — the post read through {rec["how"]}', '',
                '| Link | Mode | `color` | `text-decoration-line` | `text-decoration-color` | |', '|---|---|---|---|---|---|']
        for mode, r in rec['read'].items():
            for link in ('page-plain', 'contrast-plain', 'post-body-plain', 'contrast-classed'):
                got = r['looks'][link]
                verdict = 'control' if link == 'contrast-classed' else ('as expected' if got == expected(tokens, mode)[link] else 'NOT as expected')
                out.append(f'| {words[link]} | {mode} | `{got["color"]}` | `{got["line"]}` | `{got["decoration"]}` | {verdict} |')
            out.append(f'| *token block disabled* | {mode} | `{r["withoutTokens"]}` | | | the control: the plain link\'s colour moved |')
        out.append('')
    out += ['### What it means', '',
            '- **R-173 holds in a real theme on both majors.** A plain link on the page ground reads the reference set\'s '
            'link colour and decoration in light (R-112: ink words, accent underline) and in dark (the accent\'s words), and '
            'on a contrast ground keeps the ground\'s words, underlined in `--accent-on-contrast` — the values `tokens.ts` '
            'computes, read back from Chromium.',
            "- **R-229 holds.** The plain link Ghost's own renderer prints in a post's body (`{{content}}`, class-less on both "
            'majors) takes the same look, because the rule is document-wide; a classed link keeps its own.',
            "- **What this does NOT say.** Nothing here was compiled by Inflozo's emitter — the theme is a probe carrying the "
            'token block verbatim, as Epic 7 will. The owner pin (`scheme-*`) is Story 6.5\'s, and its on-Ghost proof is '
            "Story 7.35's.", '']
    return '\n'.join(out)


def write_section(text):
    """Replace an earlier §68 written by this command, or append — a re-run re-records rather than leaving two."""
    body = open(MEASUREMENTS, encoding='utf8').read().rstrip('\n')
    at = body.find(f'\n## {SECTION}. ')
    if at != -1:
        end = body.find('\n## ', at + 1)
        body = (body[:at] + ('' if end == -1 else body[end:])).rstrip('\n')
    with open(MEASUREMENTS, 'w', encoding='utf8') as f:
        f.write(body + '\n\n' + text.rstrip('\n') + '\n')


if __name__ == '__main__':
    if sys.argv[1:]:
        print(__doc__)   # a recorder that ran on `--help` would upload to T1 and T3; the docstring is the help
        sys.exit(0)
    env = shim.load_env()
    nonce = secrets.token_hex(8)
    recs = []
    try:
        tokens, tokens_css = engine()
        files = theme(nonce, tokens_css)
        gates = contexts.gate(files)
        zipped = contexts.zip_bytes(files)
        for M in ('5', '6'):
            g = shim.Ghost(env[f'GHOST{M}_URL'], env[f'GHOST{M}_STAFF_ACCESS_TOKEN'], M, env[f'GHOST{M}_CONTENT_API_KEY'])
            recs.append(record(g, zipped, nonce, tokens))
    except (Void, RuntimeError, urllib.error.HTTPError, urllib.error.URLError, OSError, KeyError, subprocess.SubprocessError, ValueError) as e:
        detail = e.read()[:400].decode('utf8', 'replace') if isinstance(e, urllib.error.HTTPError) else ''
        print(f'\n  ** RUN VOID — nothing written. {type(e).__name__}: {e} {detail}')
        sys.exit(1)
    failed = [r for rec in recs for r in rec['rows'] if not r[0]]
    if failed:
        print(f'\n  ** {len(failed)} row(s) did not hold — nothing written. STOP AND ASK: R-173 or R-229 is not what a real '
              'Ghost does with the token block.')
        sys.exit(1)
    write_section(section(recs, gates, tokens))
    print(f'\n    MEASUREMENTS.md §{SECTION} written — every row held on both majors, behind its controls.')
    sys.exit(0)
