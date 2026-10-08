#!/usr/bin/env python3
"""Stories 7.1, 7.2, 7.3 and 7.4's recorder — the five pilots, compiled by `compileTheme` to the formatting contract with
the `package.json` it writes, since Story 7.3 every standard template synthesized where untouched, and since Story 7.4
the pairing's fonts, the licences and the stripped stylesheet with one section's dark hook, rendered by a REAL Ghost
(T1); and Story 7.3's paywall mechanism, on two hand-written probe themes.

    python3 tools/probe/record-theme-assembly.py

It takes no flags. Like every recorder here, an argument it does not know is NOT a no-op: any argument prints this
text and exits, so `--help` uploads nothing. Run it only on the owner's go in the session itself, and in the main
session — never through a subagent (RESET-PROTOCOL.md § Ghost; the classifier refused a subagent's approved writes at
Story 5.24c).

T1 ONLY (R-238, owner, 2026-10-04): T3 was hacked and retired from testing, so no Ghost 5 leg runs; §72 says that half is
DW-326's, at Story 15.7. Both gscans still run locally, so the Ghost 5 checker judges the theme before anything uploads.

WHY (R-82, standing rule 1). `compileTheme` writes every section to a partial named by its layer, a boundary comment
`{{!-- {Layer name} · {Category} · {Design} --}}` before each invocation, `default.hbs` around `{{{body}}}`, a
`screen.css` that opens with the token block — all formatted over the DOM to a contract that claims it never changes
what renders — and `package.json` (Story 7.2). Since Story 7.3 it compiles every standard template, an untouched one
from its Synthesis Default, an archive's designed page 2 inside `{{#is "paged"}}`, `<main id="site-main">` around
`{{{body}}}`, FR-H2's `noindex` guard in `default.hbs`'s head, and a designed paywall as `partials/content-cta.hbs` with
no explicit `{{> "content-cta"}}`. Since Story 7.4 it ships the pairing's pool woff2 files in `assets/fonts/`, preloaded
and faced in `default.hbs`'s head through one `{{asset}}` address each, each family's licence at the root, and a
`screen.css` whose token block declares AD-18's two `--gh-font-*` variables and a section's dark override on its hook.
`check-snapshots` holds the compiled tree in CI; until a real Ghost reads it, that Ghost reads it as claimed is a
hypothesis.

  1. It compiles, through Node 24's type stripping and `tools/pilot-theme.mjs` (the project CI holds): the site doc's
     A1 #1, Home's A4 #13 · A17 #1 (main feed) · A22 #1, Home's page 2's A17 #1 (index.hbs), post.hbs's A24 #1 and an
     A22 #1 with Home's content, so it hoists to `partials/sections/shared/`; Tag's page 2 (A17 #1 at `per-row: two`)
     over an untouched Tag page 1, so `tag.hbs` splits; and an Author page whose one A17 #1 is hidden, so `author.hbs` is
     its layout line alone and its page 2 carries `noindex`. Two words come from this run's nonce: a PAGE word, A4 #13's
     eyebrow, and a LAYER word, in every layer name, which reaches only the boundary comments. One layer name is hostile
     (`--}}` then markup then `{{@site.title}}`), and A22 #1's text carries AD-5's shapes. Paper, the English strings.
     Story 7.4: Paper's pairing (D1) and the pool's own files, on a Light + Dark project, A4 #13's Background set to
     Contrast in Dark — so the theme carries fonts, licences and one hook.
     The compile is handed a theme — `THEME_NAME` · `1.0.0` · a fixed description — and a `posts_per_page` of
     min(12, the published total − 1, each chosen archive's count − 1), so `/page/2/`, the tag's and the author's page 2
     exist. The tag and the author are the ones with the most published posts; the run is void when either has fewer
     than two. `package.json` is compiled, never scaffolded.
  2. It adds the scaffold — new files only, each named for the story that owns it: `assets/css/cards.css` (Story 7.13,
     D12: `.kg-width-wide` and `.kg-width-full` — Story 7.4's AD-18 lines left it, since `screen.css` now answers
     GS051) and a stand-in `page.hbs` (Story 10.79's: GS110's page-builder switch — the compile leaves an untouched
     `page.hbs` the library cannot fill out, Story 7.3's Question 1, ruled option 1, so the stand-in stays until A24
     sits on `page.hbs`). It gates the theme
     through tools/stress/gate.js: 0 errors AND 0 warnings on gscan 4.49.7 and 6.4.2, or nothing uploads — gscan naming
     anything the scaffold does not answer is a question for the owner, never a widened scaffold.
  3. BEFORE THE UPLOAD, under the site's own theme: `GET themes/` gives that theme's `package` — it must carry no marker
     and no 750 width in its `image_sizes` (the controls' premise), and its `card_assets` is recorded; the picture's
     `size/w750/` is redirected to the original; and the `cards.min.css?v=` hash `{{ghost_head}}` writes on `/` is
     read. The picture is the newest published post's feature image (the Content API's `feature_image:-null`), hosted
     on T1; with none — T1's posts carry Ghost's sample pictures from static.ghost.org — the run uses its own, a
     1000-px-wide PNG of a few KB attached to no post (owner, 2026-10-06, Story 7.2's Question 4): this month's
     `/content/images/YYYY/MM/inflozo-probe-rendition.png` if a run already uploaded it, else it uploads one. That
     happens after `start_guard` and the local controls, so a run about to be refused writes nothing.
  4. On T1, behind record-shim.py's `start_guard`, the theme is uploaded and activated INSIDE the `try` whose `finally`
     is `restore_and_delete` (DW-332: the probe's name is the zip's, known before the upload, so an upload whose answer
     is lost is still deleted), and `/` read until it shows the page word. It then reads `/`, `/page/2/`, the newest
     published post, `/page/{last}/` and `/page/{last+1}/` (`last` = the Content API's published total over
     `posts_per_page`, rounded up), `/tag/{t}/` and its page 2, `/author/{a}/` and its page 2, `/{nonce}-missing/`,
     `GET themes/`, and the picture's `size/w750/` and `size/w751/`.
  5. ROWS, on each page: the page word where Home draws A4 #13; every placed section's root class, once each, in doc
     order; no `{{`, `}}`, `{{!--`, C0 character or layer word in the HTML; A22 #1's hostile text as its literal
     characters; `<html lang>` equal to the site's locale. Story 7.2's: the probe's `package` deep-equals the compiled
     `package.json`, marker included; `/` lists exactly `posts_per_page` A17 #1 cells; `/page/{last}/` answers 200 and
     `/page/{last+1}/` 404; `size/w750/` is served at that path; and the `cards.min.css?v=` hash equals step 3's whenever
     the site theme's `card_assets` is `true`. Story 7.3's: the tag's page 1 draws A17 #1 at `data-per-row="three"` and
     its page 2 at `"two"`; the author's page 2 carries `<meta name="robots" content="noindex">` inside `<head>` and its
     page 1 does not; the tag's page 2 carries none; every theme page has exactly one `<main id="site-main">`, the page's
     section roots inside it and the header's outside; Ghost's canonical on the author's page 2 is its own URL, once —
     which is why the theme writes none; and `/{nonce}-missing/` answers 404 with Ghost's own error page (`error-content`)
     and none of this theme's `screen.css`, because the compiled tree carries no `error.hbs` (Question 1, ruled).
     Story 7.4's: `/`'s head carries two preloads, each `as="font" type="font/woff2" crossorigin` and each `href`, verbatim,
     the `src` of an `@font-face` rule in the page's own `<style>`; every font address answers 200 as `font/woff2` with
     the sha256 `pool.json` records; each `/LICENSE-{family}.txt` answers 200 with its family's licence as compiled; the
     served `screen.css` equals the compiled one byte for byte, with both `var(--gh-font-…, …)` forms, the base rule and
     the `[data-instance="<hook>"]` rules; and A4 #13's root on `/` carries `data-instance="<hook>"`, the hook computed
     here through `hookOf(sectionKey('home', …))`.
  6. THE CONTROLS (standing rule 2), each voiding the run: the layer word IS in the uploaded templates and the hostile
     layer name is in the uploaded `home.hbs`, so their absence from every page is the comments' doing; the `noindex`
     meta IS in the uploaded `default.hbs` and no `error.hbs` is; every page read is this run's theme — `/` by its page
     word, the others by the same `screen.css?v=` asset hash `/` carried; every page 2 read answers 200; the site
     theme's `package` lacks the marker; and `size/w751/` — a width no theme declares — is redirected to the original,
     as `size/w750/` was before the upload. Story 7.4's: `/assets/fonts/{nonce}.woff2` and `/LICENSE-{nonce}.txt` answer
     404, so a 200 is the file's own; and A17 #1's root on `/` carries no hook.
  7. Its `finally` is record-shim.py's `restore_and_delete` — the previous theme re-activated and read back, the probe
     theme DELETED and read back, whichever step failed.
  8. THE PAYWALL MECHANISM (Story 7.3, settling MEASUREMENTS §15b's library rule): two HAND-WRITTEN probe themes, never
     compiled, each behind its own `start_guard` and `restore_and_delete`, read `/probe-gated-post/` signed out. The
     POSITIVE carries `partials/content-cta.hbs` with this run's marker, invokes one other partial from `default.hbs`,
     and invokes `content-cta` nowhere: the marker renders, and Ghost's own `gh-post-upgrade-cta` does not. The CONTROL
     is the same theme with that one invocation removed, so it invokes no partial at all: Ghost's own
     `gh-post-upgrade-cta` renders and the marker does not, as in §15b. Premise: the Content API says the post is not
     public. Every read is that theme's own (a `<meta>` naming it and the nonce). Both carry the scaffold's two widths
     and their own two `--gh-font-*` reads (`PROBE_FONTS_CSS`, Story 7.3's bytes), since they have no `screen.css`.

What it writes to the SERVER: three theme uploads, their activations and deletes; the `w750` rendition Ghost saves the
first time it is asked for one; and — only when T1 hosts no picture of its own — one probe picture, which stays (Ghost's
API deletes no picture) — no content, no setting, no key; keys are read by variable name and no URL that carries one is
printed. To disk it writes MEASUREMENTS.md §73 alone, replacing an earlier §73 of its own so a re-run re-records; §70,
§71 and §72 stay Stories 7.1's, 7.2's and 7.3's records.
"""
import os, re, sys, json, time, html, base64, hashlib, datetime, secrets, subprocess, importlib.util
import urllib.error, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MEASUREMENTS = os.path.join(ROOT, '_bmad-output', 'planning-artifacts', 'architecture',
                            'architecture-Inflozo-2026-08-19', 'MEASUREMENTS.md')
COMMAND = 'python3 tools/probe/record-theme-assembly.py'
THEME_NAME = 'inflozo-probe-theme-assembly'   # Ghost names a theme by its zip's filename (VERIFY-AT-BUILD 30)
# package.json's identity, handed to the compile (Story 7.2); the description must pass themeFailures' fingerprint scan
THEME = {'name': THEME_NAME, 'version': '1.0.0', 'description': 'The five pilots, compiled'}
SECTION = '73'   # §70, §71 and §72 stay Stories 7.1's, 7.2's and 7.3's records
POOL = os.path.join(ROOT, 'packages', 'library', 'fonts', 'pool.json')
MARKER = 'inflozo'   # FR-J13's marker key, THEME_MARKER in packages/theme-compiler
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
const rt = await import(`${root}/packages/section-runtime/src/index.ts`)
const { THEME_MARKER } = await import(`${root}/packages/theme-compiler/src/index.ts`)
if (THEME_MARKER !== process.env.MARKER) throw new Error(`the recorder reads the marker as ${process.env.MARKER}, the compiler writes ${THEME_MARKER}`)
const words = { pageWord: process.env.PAGE_WORD, layerWord: process.env.LAYER_WORD }
const find = pilots.library()
const { files, templates, pageTwo, instanceIds } = pilots.compilePilots(words, { theme: JSON.parse(process.env.THEME), postsPerPage: Number(process.env.PER_PAGE), find })
// the root classes each page places, in doc order — an untouched page 1 its Synthesis Default, a page 2 pageTwoStack's
// (Story 7.3); the site doc's split as the compiler splits it: headers before {{{body}}}, A3 footers after
// (isSiteFooter), hidden instances never
const stacks = pilots.pageStacks(templates, pageTwo, find)
const roots = (instances, keep = () => true) => instances.filter((i) => !i.hidden && keep(i)).map((i) => i.designId.replace('/', '-'))
const order = Object.fromEntries(Object.entries(stacks).map(([page, instances]) => [page, roots(instances)]))
order['default.hbs'] = roots(stacks['default.hbs'], (i) => !lib.isSiteFooter(i.designId))
order['default.hbs#footers'] = roots(stacks['default.hbs'], (i) => lib.isSiteFooter(i.designId))
// Story 7.4: A4 #13's hook, by the runtime's one builder and hash — the key the editor hashes for Home's page 1
const a4 = templates['home.hbs'].instances.find((i) => i.designId === 'a4/13')
process.stdout.write(JSON.stringify({
  // a font is bytes, and JSON carries text: each crosses as base64 and is written back as the bytes it was
  files: Object.fromEntries(Object.entries(files).map(([p, b]) => [p, typeof b === 'string' ? b : { base64: Buffer.from(b).toString('base64') }])),
  order, failures: pilots.themeFailures(files, instanceIds), hostileLayer: pilots.HOSTILE_LAYER,
  hostileText: Object.values(pilots.HOSTILE_TEXT), hook: rt.hookOf(rt.sectionKey('home', a4.instanceId)), base: rt.BASE_CSS,
}))
'''


def compiled(nonce, per_page):
    """The compiled pilot theme, the classes each template places in order, and the check CI runs on it."""
    words = {'PAGE_WORD': f'Page{nonce}', 'LAYER_WORD': f'Layer{nonce}'}
    run = subprocess.run([core.node24(), '--input-type=module', '-e', COMPILE], capture_output=True, text=True, timeout=180,
                         env={**os.environ, 'ROOT': ROOT, 'PER_PAGE': str(per_page), 'THEME': json.dumps(THEME),
                              'MARKER': MARKER, **words})
    if run.returncode != 0:
        raise Void(f'the compile did not run:\n{run.stderr[-1500:]}')
    out = json.loads(run.stdout)
    out['files'] = {p: base64.b64decode(b['base64']) if isinstance(b, dict) else b for p, b in out['files'].items()}
    if out['failures']:
        raise Void('the compiled theme fails the check CI holds it to:\n      ' + '\n      '.join(out['failures']))
    return {**out, 'page_word': words['PAGE_WORD'], 'layer_word': words['LAYER_WORD']}


# Story 7.13's (D12) — the two Koenig widths. Story 7.4's AD-18 lines left it: the compiled screen.css declares both
# --gh-font-* variables, so GS051 is answered by the compiler, and the local gate below proves it
CARDS_CSS = '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n'
# The two HAND-WRITTEN paywall probes are no compiled theme and carry no screen.css, so they keep the two Ghost
# custom-font reads they uploaded at Story 7.3 — their own GS051 answer, byte for byte what they carried then. The
# compiled theme's scaffold stays without them: its screen.css answers GS051 (Story 7.4's first T1 run voided here,
# 2026-10-08, when the probes still borrowed CARDS_CSS for it)
PROBE_FONTS_CSS = ('body { font-family: var(--gh-font-body, var(--font-body)); }\n'
                   'h1, h2, h3 { font-family: var(--gh-font-heading, var(--font-heading)); }\n')


def scaffold(c):
    """New files only, each named for its story; never a compiled file changed. `package.json` is compiled (Story 7.2)."""
    added = {
        'assets/css/cards.css': CARDS_CSS,
        # Story 10.79's — the page template: GS110 asks a theme to read the page builder's title-and-image switch, and the
        # compile leaves out an untouched page.hbs the library cannot fill (Story 7.3's Question 1, ruled option 1), so
        # this stand-in reads it until A24 sits on page.hbs (the owner's ruling on Story 7.1's Question 1)
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


CARDS_V = re.compile(r'/public/cards\.min\.css\?v=([0-9A-Za-z_-]+)')   # card-assets.js: base64url of a SHA-256
RESIZED = ('.jpg', '.jpeg', '.png', '.webp')   # extensions Ghost's image transform resizes, so a w750 can be served


def landed(g, path):
    """(HTTP status, the path the request ended on). urllib follows Ghost's redirect, so a size Ghost refuses lands on
    the original picture (handle-image-sizes.js, `redirectToOriginal`)."""
    req = urllib.request.Request(g.url + path, headers={'User-Agent': 'inflozo-probe'})
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            r.read()
            return r.status, urllib.parse.unquote(urllib.parse.urlparse(r.geturl()).path)
    except urllib.error.HTTPError as e:
        return e.code, urllib.parse.unquote(urllib.parse.urlparse(e.geturl()).path)


def fetched(g, url):
    """(HTTP status, Content-Type, the body's bytes) for a path or an address on the site — a font or a stylesheet is read
    as bytes, never decoded (Story 7.4)."""
    u = urllib.parse.urlparse(html.unescape(url))
    req = urllib.request.Request(g.url + u.path + (f'?{u.query}' if u.query else ''), headers={'User-Agent': 'inflozo-probe'})
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return r.status, r.headers.get('Content-Type', ''), r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get('Content-Type', ''), e.read()


PRELOAD = re.compile(r'<link rel="preload" href="([^"]+)" as="font" type="font/woff2" crossorigin>')
FACE_SRC = re.compile(r"src: url\(([^)]+)\) format\('woff2'\);")


def root_tag(body, cls):
    """The start tag of the page's first root whose first class is `cls`, or ''."""
    m = re.search(r'<[a-z]+\s[^>]*?\bclass="' + re.escape(cls) + r'"[^>]*>', body)
    return m.group(0) if m else ''


def theme_package(g, name):
    """A theme's parsed package.json as Ghost's `GET themes/` returns it (core/server/lib/package-json, `filter`)."""
    found = [t for t in g.api('GET', 'themes/')['themes'] if t['name'] == name]
    if not found:
        raise Void(f'GET themes/ lists no theme {name!r}')
    return found[0].get('package') or {}


NOINDEX = '<meta name="robots" content="noindex">'
MAIN = '<main id="site-main">'
SECTION_ROOT = re.compile(r'class="(a\d+-\d+)(?:\s|")')   # a section root's FIRST class token, as `rows` reads it


def archives(g):
    """Story 7.3: the tag and the author with the most published posts, as (slug, count) — the Content API's own total
    for the filter each archive lists (`tag:`, `author:`), so the count is the archive's."""
    picked = {}
    for kind, plural in (('tag', 'tags'), ('author', 'authors')):
        st, listed = g.content(f'{plural}/?limit=all&fields=slug')
        slugs = sorted(x['slug'] for x in ((listed or {}).get(plural) or []))
        if st != 200 or not slugs:
            raise Void(f'the Content API lists no {plural} (HTTP {st})')
        counts = []
        for slug in slugs:
            st, got = g.content(f'posts/?limit=1&fields=id&filter={kind}:{slug}')
            if st != 200:
                raise Void(f'the Content API did not count {kind} {slug!r}\'s posts (HTTP {st})')
            counts.append((((got.get('meta') or {}).get('pagination') or {}).get('total') or 0, slug))
        count, slug = max(counts)   # the most posts; on a tie, the last slug in code-unit order
        if count < 2:
            raise Void(f'T1\'s busiest {kind} ({slug!r}) has {count} published post(s) — its page 2 needs at least two')
        picked[kind] = (slug, count)
    return picked


def per_row(body):
    """A17 #1's `data-per-row` on the page's first A17 #1 root, or None."""
    root = re.search(r'<[a-z]+\s[^>]*?\bclass="a17-1"[^>]*>', body)
    m = root and re.search(r'\bdata-per-row="(\w+)"', root.group(0))
    return m.group(1) if m else None


def main_row(path, body, c, page):
    """One `<main id="site-main">`, the page's section roots inside it and the site doc's header roots before it."""
    count = body.count(MAIN)
    what = 'exactly one <main id="site-main">, the page\'s section roots inside it and the header\'s outside'
    if count != 1:
        return (False, path, what, f'{count} found')
    before, rest = body.split(MAIN, 1)
    inside = rest.split('</main>', 1)[0]
    got = (SECTION_ROOT.findall(before), SECTION_ROOT.findall(inside))
    want = (c['order']['default.hbs'], c['order'][page])
    return (got == want, path, what, f'before {got[0]}, inside {got[1]} (expected {want[0]}, {want[1]})')


def record(g, zipped, files, c, per_page, total, arch, nonce):
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
    compiled_pkg = json.loads(files['package.json'])
    last = -(-total // per_page)
    # the CONTROLS that hold before anything uploads: the words the pages must NOT show are in what is uploaded
    if not any(c['layer_word'] in b for p, b in files.items() if p.endswith('.hbs')):
        raise Void('the layer word is in no uploaded template — its absence from a page would prove nothing')
    if re.sub(r'[{}]', '', c['hostileLayer']) not in files['home.hbs']:
        raise Void('the hostile layer name is not in the uploaded home.hbs — the comment would hold nothing to drop')
    if 750 not in [v.get('width') for v in compiled_pkg['config']['image_sizes'].values()]:
        raise Void('the compiled image_sizes declares no 750 width — the rendition rows would prove nothing')
    # Story 7.3: the guard IS uploaded, so its absence from a page is Ghost's reading of it; and no error.hbs is, so the
    # 404 is Ghost's own page by the compile's doing
    if NOINDEX not in files['default.hbs'] or '{{#is "paged"}}' not in files['default.hbs']:
        raise Void('the uploaded default.hbs carries no noindex guard — its rows would prove nothing')
    if 'error.hbs' in files:
        raise Void('the uploaded tree carries an error.hbs — the 404 row would not be Ghost\'s own page')
    # Story 7.4: the hook IS on A4 #13's uploaded partial and its rules ARE in the uploaded screen.css, so the page rows
    # read what Ghost served of them; and the fonts and licences ARE in the tree, so a 200 there is theirs
    if not any(isinstance(b, str) and f'data-instance="{c["hook"]}"' in b for p, b in files.items() if p.startswith('partials/sections/')):
        raise Void('the uploaded partials carry no A4 #13 hook — the hook row would prove nothing')
    if f'[data-instance="{c["hook"]}"]' not in files['assets/css/screen.css']:
        raise Void('the uploaded screen.css carries no rule for the hook — the stylesheet row would prove nothing')
    if not any(p.startswith('assets/fonts/') for p in files) or not any(p.startswith('LICENSE-') for p in files):
        raise Void('the uploaded tree carries no font or no licence — the font rows would prove nothing')
    tag, author = arch['tag'][0], arch['author'][0]
    tag1, tag2, au1, au2 = f'/tag/{tag}/', f'/tag/{tag}/page/2/', f'/author/{author}/', f'/author/{author}/page/2/'
    missing = f'/{nonce}-missing/'
    previous = shim.start_guard(g)
    # {picture}: the newest published post's feature image, hosted on T1 — a width only the theme declares is served.
    # Found AFTER the guard and the local controls, because finding none uploads a file: a run about to be refused writes nothing.
    st, listed = g.content('posts/?limit=1&filter=feature_image:-null&fields=feature_image')
    picture = (((listed or {}).get('posts') or [{}])[0]).get('feature_image') or ''
    images, uploaded = f'{g.url}/content/images/', None
    if st != 200:
        raise Void(f'the Content API did not list posts with a feature image (HTTP {st})')
    if not picture.startswith(images) or not picture.lower().endswith(RESIZED):
        # T1's posts carry Ghost's sample pictures from static.ghost.org, so it hosts none of its own. The owner ruled
        # (2026-10-06, Story 7.2's Question 4) that the run uploads one: 1000 px wide, so w750 is a real downscale, a few
        # KB, attached to no post. Ghost's API deletes no picture, so the file stays — and is REUSED by every later run
        # that month (Ghost files an upload under /content/images/YYYY/MM/); a new month uploads one more.
        own = f'/content/images/{datetime.date.today():%Y/%m}/inflozo-probe-rendition.png'
        if landed(g, own) == (200, own):
            print(f'    the newest feature image is not T1\'s ({picture or "none"!r}) — reusing this month\'s probe picture {own}')
            picture = g.url + own
        else:
            print(f'    the newest feature image is not T1\'s ({picture or "none"!r}) — uploading the probe picture')
            st, up = g.upload_image(shim.make_png(1000, 10), 'inflozo-probe-rendition.png')
            picture = (((up or {}).get('images') or [{}])[0]).get('url') or ''
            if not picture.startswith(images):
                raise Void(f'the probe picture upload answered HTTP {st} with no T1 URL ({picture!r}) — there is no rendition to read')
            uploaded = urllib.parse.urlparse(picture).path
    rel = urllib.parse.unquote(urllib.parse.urlparse(picture).path)[len('/content/images/'):]
    original, sized = f'/content/images/{rel}', (lambda w: f'/content/images/size/w{w}/{rel}')
    # ── before the upload, under the site's own theme: the controls' premise ──
    site_pkg = theme_package(g, previous)
    site_cards = (site_pkg.get('config') or {}).get('card_assets')
    site_widths = [v.get('width') for v in ((site_pkg.get('config') or {}).get('image_sizes') or {}).values()]
    _, home = g.page('/')
    before = {'w750': landed(g, sized(750)), 'cards': CARDS_V.search(home)}
    premise = [
        (MARKER not in site_pkg, f'theme {previous}', 'CONTROL — the site theme\'s package carries no marker',
         f'keys {list(site_pkg)}'),
        (750 not in site_widths, f'theme {previous}', 'CONTROL — the site theme declares no 750 width', f'widths {site_widths}'),
        (before['w750'] == (200, original), sized(750), 'CONTROL — under the site theme, w750 is redirected to the original',
         f'HTTP {before["w750"][0]} at {before["w750"][1]}'),
        (site_cards is not True or before['cards'] is not None, '/', 'CONTROL — under the site theme, ghost_head links '
         'cards.min.css' + ('' if site_cards is True else ' (not read: its card_assets is not true, so the hash row is skipped)'),
         f'card_assets {site_cards!r}, ?v={before["cards"].group(1) if before["cards"] else None}'),
    ]
    for ok, page, what, detail in premise:
        print(f'    {"PASS" if ok else "FAIL"}  {page:<40} {what} — {detail}')
    if not all(ok for ok, *_ in premise):
        raise Void('A CONTROL FAILED before the upload — nothing here is a result')
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
        for path in dict.fromkeys(('/', '/page/2/', post_path, f'/page/{last}/', f'/page/{last + 1}/', tag1, tag2, au1, au2, missing)):   # once each: last may be 2
            st, body = g.page(path)
            read[path] = (st, body)
            print(f'    read {path} -> HTTP {st}, {len(body)} bytes')
        probe_pkg = theme_package(g, THEME_NAME)
        after = {w: landed(g, sized(w)) for w in (750, 751)}
        # ── Story 7.4: the fonts, the licences and the stylesheet, as Ghost serves them ──
        head74 = read['/'][1].split('</head>', 1)[0]
        faces = {src: fetched(g, src) for src in dict.fromkeys(FACE_SRC.findall(head74))}
        licences = {p: fetched(g, f'/{p}') for p in files if p.startswith('LICENSE-')}
        sheet_at = re.search(r'href="([^"]*/assets/css/screen\.css\?v=[^"]+)"', read['/'][1])
        sheet = fetched(g, sheet_at.group(1)) if sheet_at else (None, '', b'')
        misses = {'font': fetched(g, f'/assets/fonts/{nonce}.woff2'), 'licence': fetched(g, f'/LICENSE-{nonce}.txt')}
    finally:
        shim.restore_and_delete(g, previous, [THEME_NAME])
    # the page each path renders, by the key `order` holds it under (a page 2 as `{file}#2`)
    pages = {'/': 'home.hbs', '/page/2/': 'index.hbs', post_path: 'post.hbs', tag1: 'tag.hbs', tag2: 'tag.hbs#2', au1: 'author.hbs', au2: 'author.hbs#2'}
    want = {
        '/': {'roots': site(c, 'home.hbs'), 'page_word': True, 'hostile': True},
        '/page/2/': {'roots': site(c, 'index.hbs')},
        post_path: {'roots': site(c, 'post.hbs'), 'hostile': True},
        **{path: {'roots': site(c, pages[path])} for path in (tag1, tag2, au1, au2)},
    }
    verdicts, asset_v = list(premise), None
    for path in want:
        st, body = read[path]
        if st != 200:
            raise Void(f'{path} answered HTTP {st} — a CONTROL failed, nothing here is a result')
        got, v = rows(path, body, c, want[path], locale, asset_v)
        asset_v = asset_v or v
        verdicts += got
    # ── Story 7.2's rows: Ghost reads the compiled package.json ──
    cells = len(re.findall(r'class="[^"]*\ba17-1__cell\b[^"]*"', read['/'][1]))
    cards = CARDS_V.search(read['/'][1])
    verdicts += [
        (probe_pkg == compiled_pkg, f'theme {THEME_NAME}', "GET themes/ returns the compiled package.json, marker included",
         f'{MARKER}={probe_pkg.get(MARKER)!r}, keys {list(probe_pkg)}'),
        (cells == per_page, '/', 'Home lists exactly posts_per_page A17 #1 cells', f'{cells} cells (posts_per_page {per_page})'),
        (read[f'/page/{last}/'][0] == 200, f'/page/{last}/', f'the last page answers 200 ({total} posts over {per_page})',
         f'HTTP {read[f"/page/{last}/"][0]}'),
        (read[f'/page/{last + 1}/'][0] == 404, f'/page/{last + 1}/', 'the page past the last answers 404',
         f'HTTP {read[f"/page/{last + 1}/"][0]}'),
        (after[750] == (200, sized(750)), sized(750), 'w750, a width only this theme declares, is served at its path',
         f'HTTP {after[750][0]} at {after[750][1]}'),
        (after[751] == (200, original), sized(751), 'CONTROL — w751, a width no theme declares, is redirected to the original',
         f'HTTP {after[751][0]} at {after[751][1]}'),
    ]
    if site_cards is True:
        verdicts.append((cards is not None and cards.group(1) == before['cards'].group(1), '/',
                         "cards.min.css's hash equals the site theme's: every card, as Ghost's own default gives it",
                         f'{cards.group(1) if cards else None} (site theme {before["cards"].group(1)})'))
    else:
        print(f'    note: the site theme\'s card_assets is {site_cards!r}, not true — the cards hash is not compared')
    # ── Story 7.3's rows: the synthesized archive, the split, the guard, <main> and the 404 ──
    head = lambda path: read[path][1].split('</head>', 1)[0]
    canonical = re.findall(r'<link rel="canonical" href="([^"]+)"', head(au2))
    st404, body404 = read[missing]
    verdicts += [
        (read[tag2][0] == 200 and read[au2][0] == 200, f'{tag2} {au2}', 'CONTROL — every page 2 read answers 200',
         f'HTTP {read[tag2][0]}, {read[au2][0]}'),
        (per_row(read[tag1][1]) == 'three', tag1, "the tag's page 1, untouched, draws its Synthesis Default's A17 #1 at per-row three",
         f'data-per-row={per_row(read[tag1][1])!r}'),
        (per_row(read[tag2][1]) == 'two', tag2, "the tag's page 2, designed, draws its own A17 #1 at per-row two — the {{#is \"paged\"}} split",
         f'data-per-row={per_row(read[tag2][1])!r}'),
        (NOINDEX in head(au2), au2, "the author's page 2 (no visible feed) carries the noindex meta inside <head>", 'present' if NOINDEX in head(au2) else 'ABSENT'),
        (NOINDEX not in read[au1][1], au1, "the author's page 1 carries no noindex meta", 'absent' if NOINDEX not in read[au1][1] else 'PRESENT'),
        (NOINDEX not in read[tag2][1], tag2, "the tag's page 2 (a visible feed) carries no noindex meta", 'absent' if NOINDEX not in read[tag2][1] else 'PRESENT'),
        (canonical == [g.url + au2], au2, "Ghost's own canonical is the page's own URL, once — so the theme writes none", f'{canonical}'),
        (st404 == 404 and 'error-content' in body404 and '/assets/css/screen.css' not in body404, missing,
         "a missing page answers 404 with Ghost's own error page and none of this theme's screen.css (no error.hbs)",
         f'HTTP {st404}, error-content {"in" if "error-content" in body404 else "NOT in"} it, screen.css {"PRESENT" if "/assets/css/screen.css" in body404 else "absent"}'),
    ]
    verdicts += [main_row(path, read[path][1], c, page) for path, page in pages.items()]
    # ── Story 7.4's rows: the fonts, the licences, the stylesheet and the hook ──
    with open(POOL, encoding='utf8') as f:
        pool = {x['file']: x['sha256'] for face in json.load(f)['faces'].values() for x in face['files']}
    preloads, srcs = PRELOAD.findall(head74), FACE_SRC.findall(head74)
    shipped = sorted(p[len('assets/fonts/'):] for p in files if p.startswith('assets/fonts/'))
    faced = sorted(os.path.basename(urllib.parse.urlparse(html.unescape(s)).path) for s in faces)
    css_text = sheet[2].decode('utf8', 'replace')
    a4, a17 = root_tag(read['/'][1], 'a4-13'), root_tag(read['/'][1], 'a17-1')
    verdicts += [
        (len(preloads) == files['default.hbs'].count('<link rel="preload" ') > 0 and all(srcs.count(h) == 1 for h in preloads), '/',
         '<head> carries the compiled preloads, each as="font" type="font/woff2" crossorigin, each href verbatim the src of one @font-face rule in the page\'s own <style>',
         f'{len(preloads)} preload(s), {len(srcs)} src(s): {", ".join(os.path.basename(urllib.parse.urlparse(html.unescape(h)).path) for h in preloads)}'),
        (faced == shipped, '/', 'every font file the theme ships is a face the page names', f'{len(faced)} faced, {len(shipped)} shipped'),
        (misses['font'][0] == 404, f'/assets/fonts/{nonce}.woff2', 'CONTROL — a font the theme does not carry answers 404', f'HTTP {misses["font"][0]}'),
        (misses['licence'][0] == 404, f'/LICENSE-{nonce}.txt', 'CONTROL — a licence the theme does not carry answers 404', f'HTTP {misses["licence"][0]}'),
    ]
    for src, (st, ctype, body) in faces.items():
        name = os.path.basename(urllib.parse.urlparse(html.unescape(src)).path)
        ok = st == 200 and ctype.split(';')[0].strip() == 'font/woff2' and hashlib.sha256(body).hexdigest() == pool.get(name)
        verdicts.append((ok, f'/assets/fonts/{name}', "a font address answers 200 as font/woff2 with pool.json's sha256",
                         f'HTTP {st}, {ctype}, sha256 {"equal" if hashlib.sha256(body).hexdigest() == pool.get(name) else "DIFFERS"}'))
    for path, (st, _, body) in licences.items():
        verdicts.append((st == 200 and body.decode('utf8', 'replace') == files[path], f'/{path}', "the family's licence, as compiled",
                         f'HTTP {st}, {len(body)} bytes'))
    verdicts += [
        (sheet[0] == 200 and sheet[2] == files['assets/css/screen.css'].encode('utf8'), '/assets/css/screen.css',
         'the served screen.css equals the compiled one, byte for byte', f'HTTP {sheet[0]}, {len(sheet[2])} bytes'),
        (all(x in css_text for x in ('var(--gh-font-heading, ', 'var(--gh-font-body, ', c['base'], f'[data-instance="{c["hook"]}"]')),
         '/assets/css/screen.css', "it carries both var(--gh-font-…) forms, the base rule and the hook's rules", c['hook']),
        (f'data-instance="{c["hook"]}"' in a4, '/', "A4 #13's root carries the hook computed here, hookOf(sectionKey('home', …))",
         re.sub(r'\s+', ' ', a4)[:120]),
        (a17 != '' and 'data-instance=' not in a17, '/', 'CONTROL — A17 #1\'s root carries no hook', re.sub(r'\s+', ' ', a17)[:120]),
    ]
    for ok, page, what, detail in verdicts[len(premise):]:
        print(f'    {"PASS" if ok else "FAIL"}  {page:<40} {what} — {detail}')
    bad = [v for v in verdicts if v[2].startswith('CONTROL') and not v[0]]
    if bad:
        raise Void('A CONTROL FAILED — nothing here is a result:\n      ' + '\n      '.join(f'{p}: {w} — {d}' for _, p, w, d in bad))
    return {'version': version, 'site': g.url, 'locale': locale, 'post': post_path, 'verdicts': verdicts,
            'previous': previous, 'site_cards': site_cards, 'per_page': per_page, 'total': total, 'picture': rel,
            'uploaded': uploaded, 'arch': arch}


# ── Story 7.3: the paywall mechanism, on two hand-written probe themes ──────────────────────────────────────────────
GATED = '/probe-gated-post/'   # T1's paid post since Round 3 (run-verify-all.py, item 11)
PAYWALL = 'inflozo-probe-paywall'
PAYWALL_CONTROL = 'inflozo-probe-paywall-control'


def paywall_theme(name, nonce, invoke):
    """A minimal theme, never compiled: `partials/content-cta.hbs` with this run's marker, and — on the positive only —
    `default.hbs` invoking ONE other partial. Neither invokes `content-cta`. The `<meta>` names the theme and the nonce,
    so a read is known to be this theme's."""
    default = ('<!DOCTYPE html>\n<html lang="{{@site.locale}}">\n<head>\n<meta charset="utf-8">\n<title>{{meta_title}}</title>\n'
               '<meta name="inflozo-probe" content="NAME-NONCE">\n{{ghost_head}}\n</head>\n<body class="{{body_class}}">\n'
               + ('{{> "probe-mark"}}\n' if invoke else '') + '{{{body}}}\n{{ghost_foot}}\n</body>\n</html>\n')
    return {
        'package.json': json.dumps({'name': name, 'version': '1.0.0', 'description': 'A paywall probe',
                                    'engines': {'ghost': '>=5.0.0'}, 'author': {'name': 'Inflozo', 'email': 'hello@inflozo.com'},
                                    'keywords': ['ghost-theme'], 'config': {'posts_per_page': 12, 'card_assets': True}}, indent=2) + '\n',
        'default.hbs': default.replace('NAME', name).replace('NONCE', nonce),
        'index.hbs': '{{!< default}}\n{{#foreach posts}}<a href="{{url}}">{{title}}</a>{{/foreach}}\n',
        'post.hbs': '{{!< default}}\n{{#post}}<article>{{content}}</article>{{/post}}\n',
        'page.hbs': '{{!< default}}\n{{#post}}{{#if @page.show_title_and_feature_image}}<h1>{{title}}</h1>{{/if}}{{content}}{{/post}}\n',
        'partials/probe-mark.hbs': '<i id="probe-mark"></i>\n',
        'partials/content-cta.hbs': f'<div id="probe-cta">CTA-{nonce}</div>\n',
        'assets/css/cards.css': CARDS_CSS + PROBE_FONTS_CSS,   # the scaffold's widths and the probes' own GS051 answer, so both gscans pass it 0/0 too
    }


def paywall(g, nonce):
    """§15b's library rule, settled: the theme's `content-cta.hbs` wins whenever a template invokes ANY partial."""
    st, got = g.content('posts/slug/probe-gated-post/?fields=slug,visibility')
    visibility = (((got or {}).get('posts') or [{}])[0]).get('visibility')
    if st != 200 or visibility in (None, 'public'):
        raise Void(f'the Content API says {GATED} is {visibility!r} (HTTP {st}) — a public post shows no paywall, so nothing here is a result')
    out = [(True, GATED, 'CONTROL — the Content API says the post is not public', f'visibility {visibility!r}')]
    marker = f'CTA-{nonce}'
    themes = [(name, invoke, paywall_theme(name, nonce, invoke)) for name, invoke in ((PAYWALL, True), (PAYWALL_CONTROL, False))]
    for _, _, files in themes:
        gated(files)   # both gate 0/0 before either uploads
    for name, invoke, files in themes:
        previous = shim.start_guard(g)
        body, st = '', None
        try:
            st, res = g._multipart('themes/upload/', [('file', f'{name}.zip', 'application/zip', contexts.zip_bytes(files))])
            if res['themes'][0]['name'] != name:
                raise Void(f'Ghost named the upload {res["themes"][0]["name"]!r}, not {name!r}')
            g.api('PUT', f'themes/{name}/activate/')
            for _ in range(10):
                time.sleep(2)
                st, body = g.page(GATED)
                if f'{name}-{nonce}' in body:
                    break
            else:
                raise Void(f'{GATED} never served {name} (last HTTP {st}) — nothing read there is a result')
            print(f'    read {GATED} under {name} -> HTTP {st}, {len(body)} bytes')
        finally:
            shim.restore_and_delete(g, previous, [name])
        # Ghost's own box is the ELEMENT `<aside class="gh-post-upgrade-cta">` (`helpers/tpl/content-cta.hbs`): the bare
        # name is on every page anyway, in the `<style id="gh-members-styles">` `{{ghost_head}}` injects
        # (`ghost_head.js:146`, `tpl/styles.js`) — the first §72 run's matcher read that and voided the positive row
        theirs, ours = 'class="gh-post-upgrade-cta"' in body, marker in body
        where = f'{GATED} ({name})'
        out.append((st == 200, where, 'CONTROL — the read is this theme\'s, signed out', f'HTTP {st}'))
        if invoke:
            out.append((ours and not theirs, where, "one other partial invoked from default.hbs, no content-cta invocation: the theme's content-cta.hbs renders, Ghost's own does not",
                        f'marker {"rendered" if ours else "ABSENT"}, gh-post-upgrade-cta {"PRESENT" if theirs else "absent"}'))
        else:
            out.append((theirs and not ours, where, "CONTROL — no partial invoked anywhere: Ghost's own gh-post-upgrade-cta renders, the theme's does not",
                        f'gh-post-upgrade-cta {"rendered" if theirs else "ABSENT"}, marker {"PRESENT" if ours else "absent"}'))
    for ok, page, what, detail in out:
        print(f'    {"PASS" if ok else "FAIL"}  {page:<40} {what} — {detail}')
    bad = [v for v in out if v[2].startswith('CONTROL') and not v[0]]
    if bad:
        raise Void('A PAYWALL CONTROL FAILED — nothing here is a result:\n      ' + '\n      '.join(f'{p}: {w} — {d}' for _, p, w, d in bad))
    return out


# ── §72 ───────────────────────────────────────────────────────────────────────
def table(rows):
    out = ['| Page | Row | Held |', '|---|---|---|']
    for ok, page, what, detail in rows:
        shown = str(detail)[:60].replace('|', '\\|')   # the detail tells the three hostile rows apart (review)
        out.append(f'| `{page}` | {what} — `{shown}` | {"yes" if ok else "**NO**"} |')
    return out


def section(rec, gates, files, c, pay):
    today = datetime.date.today().isoformat()
    gline = ' · '.join(f'Ghost {g["major"]} via gscan {g["gscan"]} — {g["errors"]} errors / {g["warnings"]} warnings' for g in gates)
    parts = sorted(p for p in files if p.startswith('partials/'))
    templates = sorted(p for p in files if p.endswith('.hbs') and not p.startswith('partials/') and p not in ('page.hbs',))
    fonts = sorted(p for p in files if p.startswith('assets/fonts/'))
    licences = sorted(p for p in files if p.startswith('LICENSE-'))
    (tag, tag_n), (author, author_n) = rec['arch']['tag'], rec['arch']['author']
    out = [f'## {SECTION}. Assets, fonts, per-design CSS and the dead-code strip — the pilots compiled with Paper\'s fonts, '
           f'their licences, AD-18\'s variables and a section\'s dark hook, beside every standard template and the paywall '
           f'mechanism, rendered by Ghost, T1 · {today}', '',
           f'**Command.** `{COMMAND}` — three theme uploads (the compiled pilots, then two hand-written paywall probes), each '
           'activated, the previous theme restored and the probe theme deleted in a `finally` that encloses the upload '
           '(DW-332), both read back; the one `w750` rendition Ghost saves the first time it is asked; no content, no '
           'setting and no key written. The picture is '
           + (f'`{rec["uploaded"]}`, uploaded by this run because T1 hosts no picture of its own (owner, 2026-10-06, '
              'Story 7.2\'s Question 4) — it stays, as Ghost\'s API deletes no picture' if rec['uploaded'] else
              f'`/content/images/{rec["picture"]}`') + '. T1 only (R-238); the Ghost 5 half is DW-326\'s, at Story 15.7. '
           "§70, §71 and §72 are Stories 7.1's, 7.2's and 7.3's records; this re-runs their rows beside Story 7.4's.", '',
           '**Why.** Story 7.3\'s compiler resolves every standard template through `designate`, `synthesize` and '
           '`pageTwoStack`, writes an archive\'s designed page 2 inside `{{#is "paged"}}`, wraps `{{{body}}}` in '
           '`<main id="site-main">`, puts FR-H2\'s `noindex` guard in `default.hbs`\'s head, and leaves out an untouched '
           '`error.hbs` the library cannot fill (Question 1, ruled option 1). It writes a designed paywall as '
           '`partials/content-cta.hbs` with no explicit `{{> "content-cta"}}`, on the strength of a source reading that '
           'corrects §15b. Story 7.4\'s ships the pairing\'s pool woff2 files in `assets/fonts/`, preloads the two roman '
           'faces and writes their `@font-face` rules in `default.hbs`\'s head through one `{{asset}}` address each, puts '
           'each family\'s licence at the root, and writes `screen.css` as the token block — AD-18\'s two `--gh-font-*` '
           'variables, then A4 #13\'s dark override on its hook — the canvas\'s base, and each design\'s sheet stripped to '
           'what its placed roots reach. `check-snapshots` holds the tree in CI; this is a real Ghost reading it. Gate, '
           f'with the scaffold (`cards.css`, Story 7.13\'s two widths alone — AD-18\'s lines left it, so `screen.css` '
           f'answers GS051; the stand-in `page.hbs`, Story 10.79\'s, for GS110): {gline}.', '',
           f'**The tree uploaded** ({len(files)} files): ' + ', '.join(f'`{p}`' for p in templates)
           + f', `assets/css/screen.css`, `package.json`, {len(fonts)} font files — ' + ', '.join(f'`{p}`' for p in fonts)
           + ' — the licences ' + ', '.join(f'`{p}`' for p in licences)
           + f', and {len(parts)} partials — ' + ', '.join(f'`{p}`' for p in parts)
           + ' — compiled; then the scaffold, `assets/css/cards.css` and `page.hbs`. `package.json` was handed '
           f'`{THEME["name"]}` · `{THEME["version"]}` · "{THEME["description"]}" and `posts_per_page` {rec["per_page"]} '
           f'(T1 publishes {rec["total"]} posts; the tag `{tag}` {tag_n} and the author `{author}` {author_n}, each the '
           'busiest of its kind).', '',
           "**The controls, each of which voids the run:** the layer word is in the uploaded templates and the hostile layer "
           "name in the uploaded `home.hbs`, so their absence from the pages is the comments' doing; the `noindex` meta is "
           "in the uploaded `default.hbs` and no `error.hbs` was uploaded; every page read was this run's theme (`/` by its "
           "page word, the others by the same `screen.css` asset hash); every page 2 read answered 200; under the site's "
           f"own theme (`{rec['previous']}`), its `package` carries no marker and no 750 width, and `w750` was redirected to "
           'the original; after activation, `w751` was redirected to the original; a font and a licence the theme does not '
           'carry answered 404, so each 200 read was the file\'s own; and A17 #1\'s root carried no hook, so A4 #13\'s is '
           'the override\'s doing. For the paywall: the Content API says '
           'the post is not public, each read carried its own theme\'s marker, and the control theme rendered Ghost\'s own '
           'call to action. Every one held.', '',
           f'### (a) The compiled pilots — T1 `{rec["site"].replace("https://", "")}` ({rec["version"]}), locale `{rec["locale"]}`', '']
    out += table(rec['verdicts'])
    out += ['', '### (b) The paywall mechanism — two hand-written probe themes, signed out', '',
            f'Both carry `partials/content-cta.hbs` with this run\'s marker and invoke `content-cta` nowhere. `{PAYWALL}` '
            f'invokes one other partial from `default.hbs`; `{PAYWALL_CONTROL}` is the same theme with that line removed.', '']
    out += table(pay)
    cards_line = ("its `cards.min.css` hash equals the site theme's, whose `card_assets` is `true`" if rec['site_cards'] is True else
                  f"the cards hash was not compared: the site theme's `card_assets` is `{rec['site_cards']!r}`, not `true`")
    out += ['', '### What it means', '',
            '- **The theme carries its own fonts, and Ghost serves them as built.** Each font address in the page\'s own '
            '`<style>` answered `font/woff2` with the bytes `pool.json` records, and each preload `href` was, verbatim, one '
            'face\'s `src` — one `{{asset}}` address, so the preload is the fetch. No visitor\'s browser asks a font host.',
            '- **The licences travel with the fonts**, served at the root as compiled.',
            '- **`screen.css` is served as compiled**, byte for byte: AD-18\'s two Ghost font variables (so a font picked '
            'in Ghost Admin wins, and GS051 is answered with no scaffold), the canvas\'s base, and A4 #13\'s dark rules on '
            'the hook its root carries — the key the editor hashes for Home\'s page 1.',
            '- **Every standard template ships.** An untouched Tag page compiled from its Synthesis Default and rendered its '
            'feed; a designed Tag page 2 rendered its own design inside `{{#is "paged"}}` while page 1 kept the default; '
            'an Author page whose one feed is hidden rendered its layout alone.',
            '- **FR-H2\'s guard is Ghost\'s to read.** The author\'s page 2 carried `noindex` in its `<head>` and its '
            'page 1 did not; the tag\'s page 2, which has a feed, carried none. Ghost\'s own canonical on that page 2 is '
            'the page\'s own URL, so a theme canonical "to page 1" would have been a second, contradicting one.',
            '- **`<main id="site-main">` wraps the page alone**, once on every page, with the header outside it — Story '
            '9.1\'s skip link lands there.',
            '- **A missing `error.hbs` is Ghost\'s own error page**, served with a 404 and none of the theme\'s styles '
            '(Question 1, until Epic 10 brings an error design).',
            "- **The paywall partial wins whenever a template invokes any partial**, with no explicit `{{> \"content-cta\"}}`; "
            "with no partial invoked, Ghost's own call to action shows. §15b's library rule is corrected (its dated note).",
            f'- **Stories 7.1\'s and 7.2\'s rows still hold** on the larger tree: user text inert, comments shipped to no '
            f'visitor, `package.json` read whole, and {cards_line}.',
            "- **What this does NOT say.** The scaffold is the later stories' (7.13, 10.79), nothing here deployed "
            "through Inflozo's own path (Story 7.18), no paywall was compiled (no paywall design exists until Story "
            "10.107), and Ghost 5's half is DW-326's, at Story 15.7 (R-238: T3 retired). Two shapes the compiler "
            "writes were not rendered here (Story 7.3's review, 2026-10-08): the compiled `page.hbs` (the stand-in was "
            "uploaded; Story 10.79's run renders the compiler's own), and the guard's comma list — the pilots guard "
            "`author` alone, so `{{#is \"index, tag, author\"}}` and the `index` and `tag` contexts rest on "
            "`helpers/is.js` (split on `,`, OR) read in source, not on a page read. Story 7.4's dark rule was read as "
            "served, never drawn: which mode a visitor sees is the token block's, held in Chromium by the keyboard gate "
            "(`mode.spec.mjs`), and the strip's soundness is CI's (`cssFailures`), not a page read.", '']
    return '\n'.join(out)


def write_section(text):
    """Replace an earlier section SECTION written by this command IN PLACE, or append — a re-run re-records rather than leaving two,
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
        arch = archives(g)
        # T1's published posts overflow it, and so do the busiest tag's and author's, so each has a page 2
        per_page = min(12, total - 1, arch['tag'][1] - 1, arch['author'][1] - 1)
        c = compiled(nonce, per_page)
        files = scaffold(c)
        gates = gated(files)
        rec = record(g, contexts.zip_bytes(files), files, c, per_page, total, arch, nonce)
        pay = paywall(g, nonce)
    except (Void, RuntimeError, urllib.error.HTTPError, urllib.error.URLError, OSError, KeyError, subprocess.SubprocessError, ValueError) as err:
        detail = err.read()[:400].decode('utf8', 'replace') if isinstance(err, urllib.error.HTTPError) else ''
        print(f'\n  ** RUN VOID — nothing written. {type(err).__name__}: {err} {detail}')
        sys.exit(1)
    failed = [v for v in rec['verdicts'] + pay if not v[0]]
    if failed:
        print(f'\n  ** {len(failed)} row(s) did not hold — nothing written. STOP AND ASK: Ghost does not render the '
              'compiled theme as the compiler claims.')
        sys.exit(1)
    write_section(section(rec, gates, files, c, pay))
    print(f'\n    MEASUREMENTS.md §{SECTION} written — every row held on T1, behind its controls.')
    sys.exit(0)
