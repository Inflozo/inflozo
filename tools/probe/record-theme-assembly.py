#!/usr/bin/env python3
"""Story 7.1's recorder — the five pilots, compiled by `compileTheme` to the formatting contract, rendered by a REAL Ghost (T1).

    python3 tools/probe/record-theme-assembly.py

It takes no flags. Like every recorder here, an argument it does not know is NOT a no-op: any argument prints this
text and exits, so `--help` uploads nothing. Run it only on the owner's go in the session itself, and in the main
session — never through a subagent (RESET-PROTOCOL.md § Ghost; the classifier refused a subagent's approved writes at
Story 5.24c).

T1 ONLY (R-238, owner, 2026-10-04): T3 was hacked and retired from testing, so no Ghost 5 leg runs; §70 says that half is
DW-326's, at Story 15.7. Both gscans still run locally, so the Ghost 5 checker judges the theme before anything uploads.

WHY (R-82, standing rule 1). `compileTheme` writes every section to a partial named by its layer, a boundary comment
`{{!-- {Layer name} · {Category} · {Design} --}}` before each invocation, `default.hbs` around `{{{body}}}` and a
`screen.css` that opens with the token block — all formatted over the DOM to a contract that claims it never changes
what renders. `check-snapshots` holds the compiled tree in CI; until a real Ghost renders it, that Ghost reads it as
claimed is a hypothesis.

  1. It compiles, through Node 24's type stripping and `tools/pilot-theme.mjs` (the project CI holds): the site doc's
     A1 #1, Home's A4 #13 · A17 #1 (main feed) · A22 #1, index.hbs's A17 #1, post.hbs's A24 #1 and an A22 #1 with Home's
     content, so it hoists to `partials/sections/shared/`. Two words come from this run's nonce: a PAGE word, A4 #13's
     eyebrow, and a LAYER word, in every layer name, which reaches only the boundary comments. One layer name is hostile
     (`--}}` then markup then `{{@site.title}}`), and A22 #1's text carries AD-5's shapes. Paper, the English strings.
  2. It adds the scaffold — new files only, each named for the story that owns it: `package.json` (Story 7.2: a probe
     name, `engines.ghost`, the `image_sizes` map and a `posts_per_page` T1's published posts overflow, so `/page/2/`
     exists), `assets/css/cards.css` (Story 7.13, D12: `.kg-width-wide` and `.kg-width-full`; Story 7.4, AD-18: the
     two `--gh-font-*` reads) and `page.hbs` (Story 7.3: GS110's page-builder switch, on the owner's ruling of the
     spec's Question 1). It gates the theme through tools/stress/gate.js: 0 errors AND 0 warnings on gscan 4.49.7
     and 6.4.2, or nothing uploads — gscan naming anything the scaffold does not answer is a question for the owner,
     never a widened scaffold.
  3. On T1, behind record-shim.py's `start_guard`, the theme is uploaded and activated INSIDE the `try` whose `finally`
     is `restore_and_delete` (DW-332: the probe's name is the zip's, known before the upload, so an upload whose answer
     is lost is still deleted), and `/` read until it shows the page word. It then reads `/`, `/page/2/` and the newest
     published post. Nothing is published, drafted or written but the theme.
  4. ROWS, on each page: the page word where Home draws A4 #13; every placed section's root class, once each, in doc
     order; no `{{`, `}}`, `{{!--`, C0 character or layer word in the HTML; A22 #1's hostile text as its literal
     characters; `<html lang>` equal to the site's locale.
  5. THE CONTROLS (standing rule 2), each voiding the run: the layer word IS in the uploaded templates and the hostile
     layer name is in the uploaded `home.hbs`, so their absence from every page is the comments' doing; and every page
     read is this run's theme — `/` by its page word, the others by the same `screen.css?v=` asset hash `/` carried.
  6. Its `finally` is record-shim.py's `restore_and_delete` — the previous theme re-activated and read back, the probe
     theme DELETED and read back, whichever step failed.

What it writes to the SERVER: one theme upload, two activations and that theme's DELETE — no content, no setting, no
key; keys are read by variable name and no URL that carries one is printed. To disk it writes MEASUREMENTS.md §70
alone, replacing an earlier §70 of its own so a re-run re-records.
"""
import os, re, sys, json, time, html, datetime, secrets, subprocess, importlib.util
import urllib.error, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MEASUREMENTS = os.path.join(ROOT, '_bmad-output', 'planning-artifacts', 'architecture',
                            'architecture-Inflozo-2026-08-19', 'MEASUREMENTS.md')
COMMAND = 'python3 tools/probe/record-theme-assembly.py'
THEME_NAME = 'inflozo-probe-theme-assembly'   # Ghost names a theme by its zip's filename (VERIFY-AT-BUILD 30)
SECTION = '70'
C0 = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f]')


def _load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


shim = _load('record_shim', 'record-shim.py')
contexts = _load('record_contexts', 'record-contexts.py')
core = _load('run_verify_core', 'run-verify-core.py')
Void = contexts.Void

COMPILE = r'''
const root = process.env.ROOT
const pilots = await import(`${root}/tools/pilot-theme.mjs`)
const lib = await import(`${root}/packages/library/src/index.ts`)
const words = { pageWord: process.env.PAGE_WORD, layerWord: process.env.LAYER_WORD }
const { files, templates, instanceIds } = pilots.compilePilots(words, { postsPerPage: Number(process.env.PER_PAGE) })
// the root classes each template places, in doc order — the site doc's split as the compiler splits it: headers before
// {{{body}}}, A3 footers after (isSiteFooter), hidden instances never
const roots = (doc, keep = () => true) => doc.instances.filter((i) => !i.hidden && keep(i)).map((i) => i.designId.replace('/', '-'))
const order = Object.fromEntries(Object.entries(templates).map(([file, doc]) => [file, roots(doc)]))
order['default.hbs'] = roots(templates['default.hbs'], (i) => !lib.isSiteFooter(i.designId))
order['default.hbs#footers'] = roots(templates['default.hbs'], (i) => lib.isSiteFooter(i.designId))
process.stdout.write(JSON.stringify({
  files, order, failures: pilots.themeFailures(files, instanceIds), hostileLayer: pilots.HOSTILE_LAYER,
  hostileText: Object.values(pilots.HOSTILE_TEXT), imageSizes: lib.IMAGE_SIZES,
}))
'''


def compiled(nonce, per_page):
    """The compiled pilot theme, the classes each template places in order, and the check CI runs on it."""
    words = {'PAGE_WORD': f'Page{nonce}', 'LAYER_WORD': f'Layer{nonce}'}
    run = subprocess.run([core.node24(), '--input-type=module', '-e', COMPILE], capture_output=True, text=True, timeout=180,
                         env={**os.environ, 'ROOT': ROOT, 'PER_PAGE': str(per_page), **words})
    if run.returncode != 0:
        raise Void(f'the compile did not run:\n{run.stderr[-1500:]}')
    out = json.loads(run.stdout)
    if out['failures']:
        raise Void('the compiled theme fails the check CI holds it to:\n      ' + '\n      '.join(out['failures']))
    return {**out, 'page_word': words['PAGE_WORD'], 'layer_word': words['LAYER_WORD']}


def scaffold(c, per_page):
    """New files only, each named for its story; never a compiled file changed."""
    sizes = {k: {'width': v} for k, v in c['imageSizes'].items()}
    added = {
        # Story 7.2's — package.json emission
        'package.json': json.dumps({
            'name': THEME_NAME, 'description': "Story 7.1's recording surface: the five pilots, compiled",
            'version': '1.0.0', 'engines': {'ghost': '>=5.0.0'}, 'license': 'MIT',
            'keywords': ['ghost', 'theme', 'ghost-theme'], 'author': {'name': 'Probe', 'email': 'probe@example.com'},
            'config': {'posts_per_page': per_page, 'card_assets': {'exclude': []}, 'image_sizes': sizes},
        }, indent=2) + '\n',
        # Story 7.13's (D12) — the two Koenig widths; Story 7.4's (AD-18) — Ghost's custom-font reads
        'assets/css/cards.css': ('.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n'
                                 'body { font-family: var(--gh-font-body, var(--font-body)); }\n'
                                 'h1, h2, h3 { font-family: var(--gh-font-heading, var(--font-heading)); }\n'),
        # Story 7.3's — the page template: GS110 asks a theme to read the page builder's title-and-image switch, and the
        # pilots compile no page.hbs (the owner's ruling on the spec's Question 1: the stand-in every probe has carried)
        'page.hbs': ('{{!< default}}\n\n{{#post}}\n  {{#if @page.show_title_and_feature_image}}\n    <h1>{{title}}</h1>\n'
                     '  {{/if}}\n  {{content}}\n{{/post}}\n'),
    }
    clash = [p for p in added if p in c['files']]
    if clash:
        raise Void(f'the scaffold would replace compiled files: {clash}')
    return {**c['files'], **added}


def gated(files):
    """0 errors and 0 warnings on both gscans. Anything gscan names is a question, never a widened scaffold."""
    try:
        gates = contexts.gate(files)
    except Void as e:
        raise Void(f'{e} — STOP AND ASK the owner before the scaffold grows (the spec\'s Ask First)')
    loud = [g for g in gates if g['warnings'] != 0]
    if loud:
        raise Void(f'gscan warns on the probe theme ({loud}) — STOP AND ASK the owner before the scaffold grows')
    return gates


def site(c, page):
    """A page's root classes in doc order: the site doc's headers, the page's own, the site doc's footers."""
    return c['order']['default.hbs'] + c['order'][page] + c['order']['default.hbs#footers']


def rows(page, body, c, want, locale, asset_v):
    """[(ok, page, what, detail)] for one page."""
    out = []
    text = html.unescape(re.sub(r'<[^>]+>', ' ', body))
    if want.get('page_word'):
        out.append((c['page_word'] in body, page, "the page word (in A4 #13's eyebrow on Home) is on the page", c['page_word']))
    # the FIRST class token: a root may carry a modifier beside its root class ({root}--x, the class rule)
    got = [cls for cls in re.findall(r'class="(a\d+-\d+)(?:\s|")', body)]
    out.append((got == want['roots'], page, 'every placed section\'s root class, once each, in doc order', f'{got} (expected {want["roots"]})'))
    for what, bad in (('`{{`', '{{' in body), ('`}}`', '}}' in body), ('`{{!--`', '{{!--' in body),
                      ('C0 character', bool(C0.search(body))), ('layer word', c['layer_word'] in body)):
        out.append((not bad, page, f'no {what} in the HTML', 'absent' if not bad else 'PRESENT'))
    if want.get('hostile'):
        flat = re.sub(r'\s+', ' ', text)
        for t in c['hostileText']:
            out.append((re.sub(r'\s+', ' ', t) in flat, page, 'A22 #1\'s hostile text as its literal characters', t))
    lang = re.search(r'<html[^>]*\blang="([^"]*)"', body)
    out.append(((lang.group(1) if lang else None) == locale, page, '`<html lang>` is the site\'s locale', f'{lang.group(1) if lang else None!r} (site {locale!r})'))
    v = re.search(r'/assets/css/screen\.css\?v=([0-9A-Za-z_-]+)', body)
    out.append((v is not None and (asset_v is None or v.group(1) == asset_v), page, 'CONTROL — this run\'s theme (screen.css asset hash)', v.group(1) if v else None))
    return out, (v.group(1) if v else None)


def record(g, zipped, files, c):
    print(f'\n{"=" * 72}\nGhost {g.major} — {g.url}\n{"=" * 72}')
    version = g.api('GET', 'config/')['config']['version']
    st, settings = g.content('settings/')
    locale = ((settings or {}).get('settings') or {}).get('locale')
    if st != 200 or not locale:
        raise Void(f'the Content API settings did not answer a locale (HTTP {st})')
    st, listed = g.content('posts/?limit=1&fields=url,title')
    post = ((listed or {}).get('posts') or [{}])[0]
    if st != 200 or not post.get('url'):
        raise Void(f'the Content API lists no published post (HTTP {st}) — there is no post page to read')
    post_path = urllib.parse.urlparse(post['url']).path
    # the CONTROLS that hold before anything uploads: the words the pages must NOT show are in what is uploaded
    if not any(c['layer_word'] in b for p, b in files.items() if p.endswith('.hbs')):
        raise Void('the layer word is in no uploaded template — its absence from a page would prove nothing')
    if re.sub(r'[{}]', '', c['hostileLayer']) not in files['home.hbs']:
        raise Void('the hostile layer name is not in the uploaded home.hbs — the comment would hold nothing to drop')
    previous = shim.start_guard(g)
    read = {}
    try:
        st, res = g._multipart('themes/upload/', [('file', f'{THEME_NAME}.zip', 'application/zip', zipped)])
        name = res['themes'][0]['name']
        print(f'    Ghost {version}: theme uploaded HTTP {st} -> {name!r} (previous active: {previous!r})')
        if name != THEME_NAME:
            raise Void(f'Ghost named the upload {name!r}, not {THEME_NAME!r} — the finally would not delete it')
        g.api('PUT', f'themes/{name}/activate/')
        for _ in range(10):
            time.sleep(2)
            st, body = g.page('/')
            if c['page_word'] in body:
                break
        else:
            raise Void(f'/ never served this run\'s theme (last HTTP {st}) — nothing read there is a result')
        for path in ('/', '/page/2/', post_path):
            st, body = g.page(path)
            read[path] = (st, body)
            print(f'    read {path} -> HTTP {st}, {len(body)} bytes')
    finally:
        shim.restore_and_delete(g, previous, [THEME_NAME])
    want = {
        '/': {'roots': site(c, 'home.hbs'), 'page_word': True, 'hostile': True},
        '/page/2/': {'roots': site(c, 'index.hbs')},
        post_path: {'roots': site(c, 'post.hbs'), 'hostile': True},
    }
    verdicts, asset_v = [], None
    for path in ('/', '/page/2/', post_path):
        st, body = read[path]
        if st != 200:
            raise Void(f'{path} answered HTTP {st} — a CONTROL failed, nothing here is a result')
        got, v = rows(path, body, c, want[path], locale, asset_v)
        asset_v = asset_v or v
        verdicts += got
    for ok, page, what, detail in verdicts:
        print(f'    {"PASS" if ok else "FAIL"}  {page:<40} {what} — {detail}')
    bad = [v for v in verdicts if v[2].startswith('CONTROL') and not v[0]]
    if bad:
        raise Void('A CONTROL FAILED — nothing here is a result:\n      ' + '\n      '.join(f'{p}: {w} — {d}' for _, p, w, d in bad))
    return {'version': version, 'site': g.url, 'locale': locale, 'post': post_path, 'verdicts': verdicts}


# ── §70 ───────────────────────────────────────────────────────────────────────
def section(rec, gates, files, c):
    today = datetime.date.today().isoformat()
    gline = ' · '.join(f'Ghost {g["major"]} via gscan {g["gscan"]} — {g["errors"]} errors / {g["warnings"]} warnings' for g in gates)
    parts = sorted(p for p in files if p.startswith('partials/'))
    out = [f'## {SECTION}. Theme assembly — the five pilots compiled by `compileTheme` to the formatting contract, '
           f'rendered by Ghost, T1 · {today}', '',
           f'**Command.** `{COMMAND}` — one theme upload and two activations, the previous theme restored and the probe theme '
           'deleted in a `finally` that encloses the upload (DW-332), both read back; no content, no setting and no key '
           'written. T1 only (R-238).', '',
           '**Why.** Story 7.1\'s compiler writes each section to a partial named by its layer, a boundary comment before '
           'each invocation, `default.hbs` around the one `{{{body}}}` and `screen.css` opening with the token block, all '
           'formatted over the DOM to a contract that claims it never changes what renders. `check-snapshots` holds the '
           f'tree in CI; this is a real Ghost rendering it. Gate, with the scaffold (`package.json`, 7.2; `cards.css`, '
           f'7.13 and 7.4; `page.hbs`, 7.3, for GS110): {gline}.', '',
           f'**The tree uploaded** ({len(files)} files): `default.hbs`, `home.hbs`, `index.hbs`, `post.hbs`, '
           f'`assets/css/screen.css` and {len(parts)} partials — ' + ', '.join(f'`{p}`' for p in parts)
           + ' — compiled; then the scaffold, `package.json`, `assets/css/cards.css` and `page.hbs`.', '',
           "**The controls, each of which voids the run:** the layer word is in the uploaded templates and the hostile layer "
           "name in the uploaded `home.hbs`, so their absence from the pages is the comments' doing; every page read was "
           "this run's theme (`/` by its page word, the others by the same `screen.css` asset hash). Every one held.", '',
           f'### (a) T1 `{rec["site"].replace("https://", "")}` ({rec["version"]}), locale `{rec["locale"]}`', '',
           '| Page | Row | Held |', '|---|---|---|']
    for ok, page, what, detail in rec['verdicts']:
        shown = str(detail)[:60].replace('|', '\\|')   # the detail tells the three hostile rows apart (review)
        out.append(f'| `{page}` | {what} — `{shown}` | {"yes" if ok else "**NO**"} |')
    out += ['', '### What it means', '',
            '- **Ghost renders what the compiler emits.** The formatted templates, the per-layer section partials, the '
            'hoisted shared partial and the parameterless `post-card` partial all resolve on both pages of the feed and '
            'on a post; each placed section draws its root once, in doc order.',
            '- **The boundary comments ship to no visitor**, a hostile layer name included: its braces were dropped at '
            'compile, so it stayed one Handlebars comment, and the layer word is on no page.',
            "- **User text ships inert.** A22 #1's AD-5 shapes reached the page as their literal characters, and the HTML "
            'carries no `{{` or `}}`.',
            "- **What this does NOT say.** The scaffold is the later stories' (7.2, 7.13, 7.4, 7.3), and nothing here deployed "
            "through Inflozo's own path (Story 7.18). Ghost 5's half is DW-326's, at Story 15.7 (R-238: T3 retired).", '']
    return '\n'.join(out)


def write_section(text):
    """Replace an earlier §70 written by this command IN PLACE, or append — a re-run re-records rather than leaving two,
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
        g = shim.Ghost(env['GHOST6_URL'], env['GHOST6_STAFF_ACCESS_TOKEN'], '6', env['GHOST6_CONTENT_API_KEY'])
        st, listed = g.content('posts/?limit=1&fields=id')
        total = (((listed or {}).get('meta') or {}).get('pagination') or {}).get('total') or 0
        if st != 200 or total < 2:
            raise Void(f'T1 publishes {total} post(s) (HTTP {st}) — a /page/2/ needs at least two')
        per_page = min(12, total - 1)   # T1's published posts overflow it, so /page/2/ exists
        c = compiled(nonce, per_page)
        files = scaffold(c, per_page)
        gates = gated(files)
        rec = record(g, contexts.zip_bytes(files), files, c)
    except (Void, RuntimeError, urllib.error.HTTPError, urllib.error.URLError, OSError, KeyError, subprocess.SubprocessError, ValueError) as err:
        detail = err.read()[:400].decode('utf8', 'replace') if isinstance(err, urllib.error.HTTPError) else ''
        print(f'\n  ** RUN VOID — nothing written. {type(err).__name__}: {err} {detail}')
        sys.exit(1)
    failed = [v for v in rec['verdicts'] if not v[0]]
    if failed:
        print(f'\n  ** {len(failed)} row(s) did not hold — nothing written. STOP AND ASK: Ghost does not render the '
              'compiled theme as the compiler claims.')
        sys.exit(1)
    write_section(section(rec, gates, files, c))
    print(f'\n    MEASUREMENTS.md §{SECTION} written — every row held on T1, behind its controls.')
    sys.exit(0)
