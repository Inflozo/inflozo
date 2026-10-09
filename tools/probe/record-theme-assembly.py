#!/usr/bin/env python3
"""Stories 7.1 to 7.8's recorder — the five pilots, compiled by `compileTheme` to the formatting contract with the
`package.json` it writes, since Story 7.3 every standard template synthesized where untouched, since Story 7.4 the
pairing's fonts, the licences and the stripped stylesheet with one section's dark hook, since Story 7.5 the theme's
`main.js` behind its `defer` tag and its `README.md`, and since Story 7.6 Ghost's article around each post's sections and
WebP `srcset`s, rendered by a REAL Ghost (T1); Story 7.3's paywall mechanism, on two hand-written probe themes; and since
Story 7.7 the gscan gate (`@inflozo/theme-compiler/gate`): a customer's words, inert to gscan, read on a real page, and
Ghost 6's own checker answering three probe uploads as the gate says; and since Story 7.8 the emitted-theme quality gate
(`qualityGate`) against Ghost's own pages, a planted probe, and Ghost's Casper and Source as its negative control.

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
Since Story 7.5 it writes `assets/js/main.js` (`bundle()` of `core` and every declared module that has a file — `core`
alone on the pilots, whose `nav-drawer` and `member-form` have none yet and ship at rest) behind `MAIN_JS_TAG`, a `defer`
tag in `default.hbs`'s head after the stylesheet, and `README.md`'s Scripts section. `cards.js` is not uploaded here: the
pilots design no card, and Story 7.13's first designed card runs its first T1 proof. Since Story 7.6 every template whose
matrix row opens `{{#post}}` wraps its sections in `POST_ARTICLE` — `<article class="{{post_class}}{{#unless access}}
post-access-{{visibility}}{{/unless}}">` — and every `srcset` candidate carries `format="webp"`; no `locales/` ships until
Story 7.12, so Ghost prints each `{{t}}` key. `check-snapshots` holds the compiled tree in CI; until a real Ghost reads
it, that Ghost reads it as claimed is a hypothesis.

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
     sits on `page.hbs`) — both `SCAFFOLD`, from tools/pilot-theme.mjs, the copy CI's clean-verdict control uses. It gates
     the theme through the PRODUCT gate (Story 7.7: `gscanGate`, through Node 24, as `compiled()` calls
     tools/pilot-theme.mjs): an empty, unblocked verdict — 0 errors AND 0 warnings, after mapping — on gscan 4.49.7 at
     `v5` and 6.4.2 at `v6`, or nothing uploads; the gate naming anything the scaffold does not answer is a question for
     the owner, never a widened scaffold. Each checker's own
     `GS001-DEPR-*` rules are among them, so no helper Ghost deprecates uploads (Story 7.6).
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
     published post, the gated post and the newest public post (Story 7.6), `/page/{last}/` and `/page/{last+1}/`
     (`last` = the Content API's published total over `posts_per_page`, rounded up), `/tag/{t}/` and its page 2,
     `/author/{a}/` and its page 2, `/{nonce}-missing/`, `GET themes/`, and the picture's `size/w750/` and `size/w751/`,
     each also with `format/webp/` (Story 7.6).
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
     Story 7.5's: `/`'s head carries the theme's script tag exactly once, as Ghost renders `MAIN_JS_TAG` —
     `<script defer src="/assets/js/main.js?v=…"></script>`; that address answers 200 with a JavaScript content type
     (recorded as served), and its body is the compiled `main.js`, byte for byte. gscan reads `.js` too (`read-theme.js`,
     both pinned versions — `GS060-JS-GUA` matches in it; corrected at Story 7.7, whose dated notes sit under §74 and §75),
     so `main.js` is among what the local gate checks.
     Story 7.6's (§75): the gated post (`/probe-gated-post/`) signed out and the newest PUBLIC post (the Content API's
     `filter=visibility:public`) each carry exactly one `<article>`, the page's section roots inside it and the header's
     outside, its class Ghost's `post_class` computed here from the Content API's record of that post — `post`, then
     `tag-<slug>` per tag in the API's order, then `featured` and `no-image` where they apply — ending ` post-access-
     <visibility>` on the gated post and with nothing after it on the public one; every theme page's `<body>` class
     carries Ghost's template class (`home-template` on `/`, `post-template` on a post, `tag-template tag-<t>` and
     `author-template author-<a>` on the archives, `paged` on each page 2) and never the bare class `post`; every theme
     page's `<head>` carries Ghost's generator meta once and Portal's `portal.min.js` script once; every `data-portal` on
     `/` matches `PORTAL_PAGE` (read from the library, never restated), their count recorded; the picture's
     `size/w750/format/webp/` answers 200 as `image/webp` at its own path; and A1 #1's More label on `/` prints `nav.more`,
     Ghost's answer for a key no shipped locale file holds (Story 7.12's run turns it to "More").
  6. THE CONTROLS (standing rule 2), each voiding the run: the layer word IS in the uploaded templates and the hostile
     layer name is in the uploaded `home.hbs`, so their absence from every page is the comments' doing; the `noindex`
     meta IS in the uploaded `default.hbs` and no `error.hbs` is; every page read is this run's theme — `/` by its page
     word, the others by the same `screen.css?v=` asset hash `/` carried; every page 2 read answers 200; the site
     theme's `package` lacks the marker; and `size/w751/` — a width no theme declares — is redirected to the original,
     as `size/w750/` was before the upload. Story 7.4's: `/assets/fonts/{nonce}.woff2` and `/LICENSE-{nonce}.txt` answer
     404, so a 200 is the file's own; and A17 #1's root on `/` carries no hook. Story 7.5's: `main.js` and its tag ARE in
     the uploaded tree before anything uploads, and `/assets/js/{nonce}.js` answers 404, so the 200 is `main.js`'s own.
     Story 7.6's: the uploaded `post.hbs` carries `POST_ARTICLE` and every uploaded `srcset` asks for WebP; no uploaded
     file writes a generator meta or names `portal.min.js`, so both are `{{ghost_head}}`'s; no `locales/` is uploaded;
     the Content API says the gated post is not public and the other is; `/` carries at least one `data-portal`; and
     `size/w751/format/webp/` — a width no theme declares — is redirected to the original.
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

  9. STORY 7.7 (§76) — A CUSTOMER'S WORDS ON A REAL GHOST: the page word is the nonce's word, then the four brace-free
     words gscan counts as errors (`currency_symbol @site.lang @labs.members ghost.url.api`), and the layer word carries
     `currency_symbol`; every earlier row still finds `/` by the nonce's word, its first part. The CONTROLS: the uploaded
     templates carry each word's inert form (`currency&#95;symbol`, `&#64;site.lang`, `&#64;labs.members`,
     `ghost&#46;url.api`) and none raw, and the local gate gave an empty verdict on both checkers. The ROW: `/` renders A4
     #13's eyebrow as exactly the typed words.
 10. STORY 7.7 (§76) — GHOST 6'S OWN CHECKER AGAINST THE GATE: three probe uploads under their own names, none activated,
     each deleted in a `finally` that encloses its upload (`restore_and_delete`), the active theme read back after each.
     (a) The compiled pilot theme, unscaffolded: T1 answers 200, and the `errors` on its theme record carry the same codes
     and `fatal` flags as `runGscan(files, 6)`'s errors (`GS050-CSS-KGWF`, `-KGWW`). Its `warnings` are empty in
     production (Ghost's `validate.js`), while the gate reports `GS110-NO-MISSING`: the row records both, and a warning
     list T1 does return must match. (b) A fatal probe — the pilot theme plus `custom-probe-fatal.hbs` invoking
     `{{> "no-such-partial"}}`: T1 answers 422 `ThemeValidationError`, its `errors[0].details.errors` (Ghost's
     `errorDetails`, as `@tryghost/mw-error-handler` 1.0.13 writes it) carry the gate's codes and flags — `GS005-TPL-ERR`,
     fatal, with the two `GS050`s — the gate's verdict is blocked, and `GET themes/` lists no such theme. (c) The cascade
     probe — the pilot theme with `config.custom.probe_setting`, a two-option select whose `visibility` is `"true"`, read
     once in `default.hbs`: T1 answers 200 with `GS010-PJ-PARSE` and the cascade, the same codes as `runGscan`'s, and
     `gscanGate` returns one `package_check_failed` naming `probe_setting`. Premise: the active theme's custom settings
     read the same before and after.
 11. STORY 7.8 (§77) — THE QUALITY GATE AGAINST GHOST'S OWN PAGES: before anything uploads, `qualityGate` (Paper's pack,
     the library on disk) gives the uploaded tree an empty verdict, or the run stops for the owner. After the upload,
     axe-core — the version `QUALITY_RULES` follows, refused if another is installed — runs `QUALITY_RULES`' own axe ids
     in jsdom (`tools/pilot-theme.mjs`'s `axeOn`, the one CI runs) over `/`, `/page/2/`, a post, the busiest tag and the
     busiest author as Ghost served them: no violation. Each page's heading levels, consecutive repeats collapsed, are
     one of `readPages`' alternatives for its template. `<html lang>` is the site's locale (step 5's row).
 12. STORY 7.8 (§77) — THE PROBE: `inflozo-probe-quality`, the uploaded tree plus an `<h4>` carrying the nonce and an
     `<a href="#"></a>` right after A24 #1's invocation in `post.hbs`. Locally the gate reports exactly `heading_skip`
     and `name_missing` for `post.hbs`; uploaded, activated and read on the newest post, axe-core reports exactly
     `heading-order` and `link-name`. In a `finally` that encloses the upload, the site's theme is activated again and
     the probe deleted (`restore_and_delete`), and the active theme read back.
 13. STORY 7.8 (§77) — THE NEGATIVE CONTROL: Ghost 6.58.0's npm tarball (read only) gives Casper and Source; gscan 6.4.2
     at `v6`, their own Ghost's checker, passes each 0/0 (the CONTROL), and `node tools/quality-gate.mjs` fails each on at
     least one rule, every finding located at its line in the theme's own source. Their stylesheets' warnings through the
     root `stylelint.config.mjs` are counted and recorded, never gated.

What it writes to the SERVER: three theme uploads, their activations and deletes; Story 7.8's quality probe, its
activation and delete; Story 7.7's three probe uploads, none activated, and their deletes; the `w750` rendition, and the one
`w750` WebP rendition, Ghost saves the first time it is asked for each; and — only when T1 hosts no picture of its own —
one probe picture, which stays (Ghost's API deletes no picture) — no content, no setting, no key; keys are read by
variable name and no URL that carries one is printed. To disk it writes MEASUREMENTS.md §77 alone, replacing an earlier
§77 of its own so a re-run re-records; §70 to §76 stay Stories 7.1's to 7.7's records. The Ghost 5 half is DW-326's.
"""
import os, re, sys, json, time, html, base64, hashlib, datetime, secrets, shutil, subprocess, tarfile, tempfile, importlib.util
import urllib.error, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MEASUREMENTS = os.path.join(ROOT, '_bmad-output', 'planning-artifacts', 'architecture',
                            'architecture-Inflozo-2026-08-19', 'MEASUREMENTS.md')
COMMAND = 'python3 tools/probe/record-theme-assembly.py'
THEME_NAME = 'inflozo-probe-theme-assembly'   # Ghost names a theme by its zip's filename (VERIFY-AT-BUILD 30)
# package.json's identity, handed to the compile (Story 7.2); the description must pass themeFailures' fingerprint scan
THEME = {'name': THEME_NAME, 'version': '1.0.0', 'description': 'The five pilots, compiled'}
SECTION = '77'   # §70 to §76 stay Stories 7.1's to 7.7's records
# Story 7.7: the four brace-free words gscan counts as errors (its spec's Facts 7), typed after the nonce's page word, and
# the inert form the runtime's escaper writes for each (`GSCAN_INERT`, AD-36)
TYPED = 'currency_symbol @site.lang @labs.members ghost.url.api'
INERT = {'currency_symbol': 'currency&#95;symbol', '@site.lang': '&#64;site.lang', '@labs.members': '&#64;labs.members',
         'ghost.url.api': 'ghost&#46;url.api'}
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
const { POST_ARTICLE, THEME_MARKER } = await import(`${root}/packages/theme-compiler/src/index.ts`)
const { MAIN_JS_TAG } = await import(`${root}/packages/library/src/modules.ts`)
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
  // Story 7.5: the tag as the compiler writes it — the recorder's premise reads it, never a copy of its own
  mainTag: MAIN_JS_TAG,
  // Story 7.6: the article and Portal's pages as the compiler and the library spell them — read, never restated
  postArticle: POST_ARTICLE, portalPage: lib.PORTAL_PAGE.source,
  // Story 7.7: §73's scaffold, the one copy CI's clean-verdict control uses too
  scaffold: pilots.SCAFFOLD,
}))
'''


def compiled(nonce, per_page):
    """The compiled pilot theme, the classes each template places in order, and the check CI runs on it."""
    # Story 7.7: the four brace-free words gscan counts as errors follow the nonce's word, and the layer word carries
    # currency_symbol — every earlier row finds `/` by the nonce's word, so it stays the first part
    words = {'PAGE_WORD': f'Page{nonce} {TYPED}', 'LAYER_WORD': f'Layer{nonce} currency_symbol'}
    run = subprocess.run([core.node24(), '--input-type=module', '-e', COMPILE], capture_output=True, text=True, timeout=180,
                         env={**os.environ, 'ROOT': ROOT, 'PER_PAGE': str(per_page), 'THEME': json.dumps(THEME),
                              'MARKER': MARKER, **words})
    if run.returncode != 0:
        raise Void(f'the compile did not run:\n{run.stderr[-1500:]}')
    out = json.loads(run.stdout)
    out['files'] = {p: base64.b64decode(b['base64']) if isinstance(b, dict) else b for p, b in out['files'].items()}
    if out['failures']:
        raise Void('the compiled theme fails the check CI holds it to:\n      ' + '\n      '.join(out['failures']))
    return {**out, 'page_word': f'Page{nonce}', 'layer_word': f'Layer{nonce}', 'typed_page': words['PAGE_WORD']}


# Story 7.13's (D12) — the two Koenig widths, for the two HAND-WRITTEN paywall probes, which are no compiled theme; the
# compiled theme's scaffold is tools/pilot-theme.mjs's SCAFFOLD (Story 7.7), whose cards.css is these bytes
CARDS_CSS = '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n'
# The two HAND-WRITTEN paywall probes are no compiled theme and carry no screen.css, so they keep the two Ghost
# custom-font reads they uploaded at Story 7.3 — their own GS051 answer, byte for byte what they carried then. The
# compiled theme's scaffold stays without them: its screen.css answers GS051 (Story 7.4's first T1 run voided here,
# 2026-10-08, when the probes still borrowed CARDS_CSS for it)
PROBE_FONTS_CSS = ('body { font-family: var(--gh-font-body, var(--font-body)); }\n'
                   'h1, h2, h3 { font-family: var(--gh-font-heading, var(--font-heading)); }\n')


def scaffold(c):
    """New files only, each named for its story; never a compiled file changed. `package.json` is compiled (Story 7.2).
    The files are tools/pilot-theme.mjs's `SCAFFOLD` — Story 7.13's `cards.css` (D12's two widths) and Story 10.79's
    stand-in `page.hbs`, which reads GS110's page-builder switch until A24 sits on `page.hbs` (the owner's ruling on Story
    7.1's Question 1; the compile leaves an untouched `page.hbs` out, Story 7.3's Question 1)."""
    added = c['scaffold']
    clash = [p for p in added if p in c['files']]
    if clash:
        raise Void(f'the scaffold would replace compiled files: {clash}')
    return {**c['files'], **added}


# Story 7.7: the PRODUCT gate, through Node 24 — each tree on both pinned checkers: gscan's raw results (`runGscan`, the
# one caller of gscan) and the verdict (`gscanGate`). A font crosses as base64 and is written back as the bytes it was.
GATE = r'''
const gate = await import(`${process.env.ROOT}/packages/theme-compiler/gate/index.ts`)
const chunks = []
for await (const c of process.stdin) chunks.push(c)
const trees = JSON.parse(Buffer.concat(chunks).toString('utf8'))
const out = {}
for (const [name, enc] of Object.entries(trees)) {
  const files = Object.fromEntries(Object.entries(enc).map(([p, b]) => [p, typeof b === 'string' ? b : Buffer.from(b.base64, 'base64')]))
  out[name] = {}
  for (const major of Object.keys(gate.GSCAN).map(Number)) {
    const raw = await gate.runGscan(files, major).catch((e) => ({ failed: String(e?.message ?? e) }))
    out[name][major] = { gscan: gate.GSCAN[major].version, checkVersion: gate.GSCAN[major].checkVersion, raw, verdict: await gate.gscanGate(files, major) }
  }
}
process.stdout.write(JSON.stringify(out))
'''


def gated(trees):
    """Each tree — `{name: files}` — through the product gate on both pinned checkers: `{name: {major: {gscan, checkVersion,
    raw, verdict}}}`, majors as strings. A checker that failed is a Void, never a pass (standing rule 2)."""
    enc = {n: {p: b if isinstance(b, str) else {'base64': base64.b64encode(b).decode()} for p, b in f.items()} for n, f in trees.items()}
    run = subprocess.run([core.node24(), '--input-type=module', '-e', GATE], input=json.dumps(enc), capture_output=True, text=True,
                         timeout=600, env={**os.environ, 'ROOT': ROOT})
    if run.returncode != 0:
        raise Void(f'the gate did not run:\n{run.stderr[-1500:]}')
    out = json.loads(run.stdout)
    for name, majors in out.items():
        for major, r in majors.items():
            if 'failed' in r['raw']:
                raise Void(f'gscan {r["gscan"]} (Ghost {major}) failed on {name}: {r["raw"]["failed"]}')
            v = r['verdict']
            print(f'    gate {name}: Ghost {major} via gscan {r["gscan"]} ({r["checkVersion"]}) -> {len(v["errors"])} error(s) / '
                  f'{len(v["warnings"])} warning(s){" — BLOCKED" if v["blocked"] else ""}')
    return out


def clean(local, name):
    """An empty, unblocked verdict on both checkers, after mapping. Anything the gate names is a question for the owner,
    never a widened scaffold."""
    loud = {m: [f'{f["code"]} {f.get("rule", "")}'.strip() for f in r['verdict']['errors'] + r['verdict']['warnings']]
            for m, r in local[name].items() if r['verdict']['errors'] or r['verdict']['warnings']}
    if loud:
        raise Void(f'the gate names findings on {name} ({loud}) — STOP AND ASK the owner before the scaffold grows (the spec\'s Ask First)')
    return [{'major': m, 'gscan': r['gscan'], 'checkVersion': r['checkVersion'], 'errors': 0, 'warnings': 0} for m, r in local[name].items()]


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
# Story 7.5: MAIN_JS_TAG as Ghost renders it — `{{asset}}` resolved to the theme's address with its mixed-case `?v=` hash
MAIN_TAG = re.compile(r'<script defer src="(/assets/js/main\.js\?v=[0-9A-Za-z_-]+)"></script>')
JS_TYPES = ('application/javascript', 'text/javascript')
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


# ── Story 7.6 (§75): Ghost's article, body class, head and Portal, the WebP rendition and the labels ──────────────────

def post_class(post):
    """Ghost's `{{post_class}}` for a Content API post record (`frontend/helpers/post_class.js`, identical in 5.0.0, 5.130.6
    and 6.58.0, read in source): `post`, then `tag-<slug>` per tag in order, then `featured`, then `no-image` when there is
    no feature image. `page` is a page's alone, and the recorder reads posts."""
    classes = ['post'] + [f'tag-{t["slug"]}' for t in (post.get('tags') or [])]
    if post.get('featured'):
        classes.append('featured')
    if not post.get('feature_image'):
        classes.append('no-image')
    return ' '.join(classes)


ARTICLE = re.compile(r'<article\b[^>]*>')
GENERATOR = re.compile(r'<meta name="generator" content="Ghost [^"]*"')
PORTAL_SCRIPT = re.compile(r'<script\b[^>]*\bsrc="[^"]*/portal\.min\.js[^"]*"')
DATA_PORTAL = re.compile(r'\sdata-portal="([^"]*)"')
SRCSET = re.compile(r'\ssrcset="((?:\{\{.*?\}\}|[^"{])*)"')   # a template's srcset value, each mustache (quotes and all) one unit


def article_row(path, body, c, want_class):
    """One `<article>`, its class `want_class`, the page's section roots inside it and the site doc's header roots before it."""
    what = ("exactly one <article>, its class Ghost's post_class computed from the Content API's record, the page's "
            "section roots inside it and the header's outside")
    found = ARTICLE.findall(body)
    if len(found) != 1:
        return (False, path, what, f'{len(found)} found')
    cls = re.search(r'\bclass="([^"]*)"', found[0])
    before, rest = body.split(found[0], 1)
    inside = rest.split('</article>', 1)[0]
    got = (SECTION_ROOT.findall(before), SECTION_ROOT.findall(inside), cls.group(1) if cls else None)
    want = (c['order']['default.hbs'], c['order']['post.hbs'], want_class)
    return (got == want, path, what, f'class {got[2]!r} (expected {want_class!r}); before {got[0]}, inside {got[1]}')


def body_classes(body):
    """The class tokens of the page's `<body>`, or []."""
    m = re.search(r'<body\b[^>]*\bclass="([^"]*)"', body)
    return m.group(1).split() if m else []


def served_as(g, path):
    """(HTTP status, the path the request ended on, its Content-Type) — `landed` with the type it was served as."""
    req = urllib.request.Request(g.url + path, headers={'User-Agent': 'inflozo-probe'})
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            r.read()
            return r.status, urllib.parse.unquote(urllib.parse.urlparse(r.geturl()).path), r.headers.get('Content-Type', '')
    except urllib.error.HTTPError as e:
        return e.code, urllib.parse.unquote(urllib.parse.urlparse(e.geturl()).path), e.headers.get('Content-Type', '')


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
    # Story 7.5: main.js and its tag ARE uploaded, so the script rows read what Ghost served of them
    if 'assets/js/main.js' not in files or files['default.hbs'].count(c['mainTag']) != 1:
        raise Void('the uploaded tree carries no main.js, or default.hbs does not carry its tag once — the script rows would prove nothing')
    # Story 7.6: the article and the WebP candidates ARE uploaded; no uploaded file writes Ghost's generator meta or Portal's
    # script, so a page carrying them has them from {{ghost_head}}; and no locales/ is uploaded, so a key is Ghost's answer
    texts = {p: b for p, b in files.items() if isinstance(b, str)}
    if c['postArticle'] not in files['post.hbs']:
        raise Void('the uploaded post.hbs carries no POST_ARTICLE — the article rows would prove nothing')
    sets = [v for b in texts.values() for v in SRCSET.findall(b)]
    if not sets or any(re.search(r'\{\{img_url(?![^}]*format="webp")[^}]*\}\}', v) for v in sets):
        raise Void('the uploaded templates carry no srcset, or a candidate that does not ask for WebP — the WebP row would prove nothing')
    if any('name="generator"' in b or 'portal.min.js' in b for b in texts.values()):
        raise Void('an uploaded file writes a generator meta or names portal.min.js — the head row would not be {{ghost_head}}\'s')
    if any(p.startswith('locales/') for p in files):
        raise Void('the uploaded tree carries locales/ — the label row reads Ghost\'s answer for a key no locale file holds')
    # Story 7.7: the customer's words ARE uploaded, each inert and none raw — so a page reading them back is the escaper's
    # doing, and the local gate's empty verdict on this tree is theirs
    hbs = [b for p, b in texts.items() if p.endswith('.hbs')]
    missing_inert = [w for w, inert in INERT.items() if not any(inert in b for b in hbs)]
    raw_left = [w for w in INERT if any(w in b for b in hbs)]
    if missing_inert or raw_left:
        raise Void(f'the uploaded templates lack the inert form of {missing_inert} or carry {raw_left} raw — the words row would prove nothing')
    portal_page = re.compile(c['portalPage'])
    st, got = g.content(f'posts/slug/{GATED.strip("/")}/?include=tags')
    gated_post = (((got or {}).get('posts') or [{}])[0])
    st2, got2 = g.content('posts/?limit=1&filter=visibility:public&include=tags')
    public_post = (((got2 or {}).get('posts') or [{}])[0])
    if st != 200 or gated_post.get('visibility') in (None, 'public'):
        raise Void(f'the Content API says {GATED} is {gated_post.get("visibility")!r} (HTTP {st}) — the gated article row needs a post that is not public')
    if st2 != 200 or public_post.get('visibility') != 'public' or not public_post.get('url'):
        raise Void(f'the Content API lists no public post (HTTP {st2}) — the public article row needs one')
    public_path = urllib.parse.urlparse(public_post['url']).path
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
        for path in dict.fromkeys(('/', '/page/2/', post_path, GATED, public_path, f'/page/{last}/', f'/page/{last + 1}/', tag1, tag2, au1, au2, missing)):   # once each: last may be 2, and the newest post is the gated one
            st, body = g.page(path)
            read[path] = (st, body)
            print(f'    read {path} -> HTTP {st}, {len(body)} bytes')
        probe_pkg = theme_package(g, THEME_NAME)
        after = {w: landed(g, sized(w)) for w in (750, 751)}
        # Story 7.6: the rendition every srcset candidate asks for, and a width no theme declares
        webp = {w: served_as(g, sized(w).replace(f'/size/w{w}/', f'/size/w{w}/format/webp/')) for w in (750, 751)}
        # ── Story 7.4: the fonts, the licences and the stylesheet, as Ghost serves them ──
        head74 = read['/'][1].split('</head>', 1)[0]
        faces = {src: fetched(g, src) for src in dict.fromkeys(FACE_SRC.findall(head74))}
        licences = {p: fetched(g, f'/{p}') for p in files if p.startswith('LICENSE-')}
        sheet_at = re.search(r'href="([^"]*/assets/css/screen\.css\?v=[^"]+)"', read['/'][1])
        sheet = fetched(g, sheet_at.group(1)) if sheet_at else (None, '', b'')
        misses = {'font': fetched(g, f'/assets/fonts/{nonce}.woff2'), 'licence': fetched(g, f'/LICENSE-{nonce}.txt'),
                  'script': fetched(g, f'/assets/js/{nonce}.js')}
        # ── Story 7.5: the script tag in the head, and the file at its address ──
        tags75 = MAIN_TAG.findall(head74)
        main_js = fetched(g, tags75[0]) if len(tags75) == 1 else (None, '', b'')
        # review (2026-10-08): "core loads on every page" is read, not inferred — the tag once in every 200 page's head
        tag_pages = {p: len(MAIN_TAG.findall(b.split('</head>', 1)[0])) for p, (st, b) in read.items() if st == 200}
    finally:
        shim.restore_and_delete(g, previous, [THEME_NAME])
    # the page each path renders, by the key `order` holds it under (a page 2 as `{file}#2`)
    pages = {'/': 'home.hbs', '/page/2/': 'index.hbs', post_path: 'post.hbs', GATED: 'post.hbs', public_path: 'post.hbs',
             tag1: 'tag.hbs', tag2: 'tag.hbs#2', au1: 'author.hbs', au2: 'author.hbs#2'}
    want = {
        '/': {'roots': site(c, 'home.hbs'), 'page_word': True, 'hostile': True},
        '/page/2/': {'roots': site(c, 'index.hbs')},
        post_path: {'roots': site(c, 'post.hbs'), 'hostile': True},
        **{path: {'roots': site(c, 'post.hbs')} for path in (GATED, public_path) if path != post_path},
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
    # ── Story 7.5's rows: main.js behind its defer tag, served as compiled ──
    compiled_main = files['assets/js/main.js'].encode('utf8')
    verdicts += [
        (len(tags75) == 1, '/', '<head> carries the theme\'s script tag once, as Ghost renders MAIN_JS_TAG: <script defer src="/assets/js/main.js?v=…"></script>',
         f'{len(tags75)} found {tags75}'),
        (main_js[0] == 200 and main_js[1].split(';')[0].strip() in JS_TYPES, '/assets/js/main.js', 'main.js answers 200 with a JavaScript content type (as served)',
         f'HTTP {main_js[0]}, {main_js[1]!r}'),
        (main_js[2] == compiled_main, '/assets/js/main.js', 'its body is the compiled main.js, byte for byte',
         f'{len(main_js[2])} bytes served, {len(compiled_main)} compiled'),
        (misses['script'][0] == 404, f'/assets/js/{nonce}.js', 'CONTROL — a script the theme does not carry answers 404', f'HTTP {misses["script"][0]}'),
        (len(tag_pages) > 1 and all(n == 1 for n in tag_pages.values()), 'every 200 page', 'each page read carries the tag once in its head — core loads on every page',
         ', '.join(f'{p}: {n}' for p, n in tag_pages.items())),
    ]
    # ── Story 7.6's rows (§75): the article, the body class, Ghost's head, Portal, WebP and the labels ──
    gated_class = f'{post_class(gated_post)} post-access-{gated_post["visibility"]}'
    templates_of = {'/': ['home-template'], '/page/2/': ['paged'], post_path: ['post-template'], GATED: ['post-template'],
                    public_path: ['post-template'], tag1: ['tag-template', f'tag-{tag}'], tag2: ['tag-template', f'tag-{tag}', 'paged'],
                    au1: ['author-template', f'author-{author}'], au2: ['author-template', f'author-{author}', 'paged']}
    portals = DATA_PORTAL.findall(read['/'][1])
    more = re.search(r'class="a1-1__more-trigger"[^>]*>\s*([^<]*?)\s*<', read['/'][1])
    verdicts += [
        (True, GATED, 'CONTROL — the Content API says the gated post is not public', f'visibility {gated_post["visibility"]!r}'),
        (True, public_path, 'CONTROL — the Content API says the newest public post is public', f'visibility {public_post["visibility"]!r}'),
        article_row(GATED, read[GATED][1], c, gated_class),
        article_row(public_path, read[public_path][1], c, post_class(public_post)),
    ]
    for path, want_tokens in templates_of.items():
        tokens = body_classes(read[path][1])
        verdicts.append((all(t in tokens for t in want_tokens) and 'post' not in tokens, path,
                         f"<body>'s class carries Ghost's template class ({' '.join(want_tokens)}) and never the bare class post",
                         ' '.join(tokens)))
    for path in dict.fromkeys(pages):
        head = read[path][1].split('</head>', 1)[0]
        gen, portal = len(GENERATOR.findall(head)), len(PORTAL_SCRIPT.findall(head))
        verdicts.append((gen == 1 and portal == 1, path, "<head> carries Ghost's generator meta once and Portal's portal.min.js script once — {{ghost_head}}'s",
                         f'generator {gen}, portal.min.js {portal}'))
    verdicts += [
        (len(portals) > 0, '/', 'CONTROL — / carries at least one data-portal, so the Portal row reads something', f'{len(portals)} found'),
        (all(portal_page.fullmatch(v) for v in portals), '/', 'every data-portal on / names a page both majors\' Portal opens (PORTAL_PAGE)',
         f'{len(portals)}: {", ".join(sorted(set(portals)))}'),
        (webp[750][:2] == (200, sized(750).replace('/size/w750/', '/size/w750/format/webp/')) and webp[750][2].split(';')[0].strip() == 'image/webp',
         sized(750).replace('/size/w750/', '/size/w750/format/webp/'), 'the WebP rendition every srcset candidate asks for answers 200 as image/webp at its own path',
         f'HTTP {webp[750][0]} at {webp[750][1]}, {webp[750][2]!r}'),
        (webp[751][:2] == (200, original), sized(751).replace('/size/w751/', '/size/w751/format/webp/'),
         'CONTROL — size/w751/format/webp/, a width no theme declares, is redirected to the original', f'HTTP {webp[751][0]} at {webp[751][1]}'),
        ((more.group(1) if more else None) == 'nav.more', '/', "A1 #1's More label prints nav.more — Ghost's answer for a key no shipped locale file holds (Story 7.12 ships en.json)",
         repr(more.group(1) if more else None)),
    ]
    # ── Story 7.7's row (§76): a customer's words, inert to gscan, read back as typed ──
    eyebrow = re.search(r'<p class="a4-13__eyebrow"[^>]*>(.*?)</p>', read['/'][1], re.S)
    shown = re.sub(r'\s+', ' ', html.unescape(eyebrow.group(1))).strip() if eyebrow else None
    verdicts.append((shown == c['typed_page'], '/', "A4 #13's eyebrow reads exactly the typed words — gscan's four brace-free error words among them, written inert",
                     repr(shown)))
    for ok, page, what, detail in verdicts[len(premise):]:
        print(f'    {"PASS" if ok else "FAIL"}  {page:<40} {what} — {detail}')
    bad = [v for v in verdicts if v[2].startswith('CONTROL') and not v[0]]
    if bad:
        raise Void('A CONTROL FAILED — nothing here is a result:\n      ' + '\n      '.join(f'{p}: {w} — {d}' for _, p, w, d in bad))
    # Story 7.8: the five pages §77's quality rows read, each with the template it renders, as Ghost served them
    rendered = {path: {'template': pages[path].split('#')[0], 'body': read[path][1]} for path in ('/', '/page/2/', post_path, tag1, au1)}
    return {'rendered': rendered, 'version': version, 'gated': gated_class, 'public': public_path, 'portals': len(portals), 'site': g.url, 'locale': locale, 'post': post_path, 'verdicts': verdicts,
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
    local = gated({name: files for name, _, files in themes})
    for name, _, _ in themes:
        clean(local, name)   # both gate clean before either uploads
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


# ── Story 7.7 (§76): Ghost 6's own checker against the gate, on three probe uploads ─────────────────────────────────
GATE_PILOT = 'inflozo-probe-gate-pilot'       # the compiled pilot theme, unscaffolded
GATE_FATAL = 'inflozo-probe-gate-fatal'       # plus a template invoking a partial it lacks
GATE_CASCADE = 'inflozo-probe-gate-cascade'   # plus a theme setting whose visibility names no key
FATAL_FILE = 'custom-probe-fatal.hbs'
PROBE_SETTING = 'probe_setting'


def probe_trees(c):
    """The three probe trees, each the COMPILED pilot theme (no scaffold) with one change."""
    files = c['files']
    pkg = json.loads(files['package.json'])
    pkg['config']['custom'] = {PROBE_SETTING: {'type': 'select', 'options': ['One', 'Two'], 'default': 'One', 'visibility': 'true'}}
    if files['default.hbs'].count('{{{body}}}') != 1:
        raise Void('default.hbs carries no single {{{body}}} — the cascade probe has nowhere to read its setting')
    return {
        GATE_PILOT: dict(files),
        GATE_FATAL: {**files, FATAL_FILE: '{{!< default}}\n{{> "no-such-partial"}}\n'},
        GATE_CASCADE: {**files, 'package.json': json.dumps(pkg, indent=2) + '\n',
                       'default.hbs': files['default.hbs'].replace('{{{body}}}', f'<i hidden>{{{{@custom.{PROBE_SETTING}}}}}</i>{{{{{{body}}}}}}', 1)},
    }


def flags(results):
    """[(code, fatal)] in code order — what Ghost's answer and the gate's raw report are compared on."""
    return sorted((r['code'], bool(r.get('fatal'))) for r in results or [])


def gate_probes(g, trees, local):
    """Each probe uploaded under its own name, never activated, deleted in a `finally` that encloses its upload, the
    active theme read back after each; Ghost 6's answer compared with the gate's own on the same files."""
    out = []
    for name in (GATE_PILOT, GATE_FATAL, GATE_CASCADE):
        six = local[name]['6']
        want_err = flags(r for r in six['raw']['results'] if r['level'] == 'error')
        want_warn = flags(r for r in six['raw']['results'] if r['level'] == 'warning')
        before = g.api('GET', 'custom_theme_settings/').get('custom_theme_settings') if name == GATE_CASCADE else None
        previous = shim.start_guard(g)
        st, body, listed = None, {}, []
        try:
            try:
                st, body = g._multipart('themes/upload/', [('file', f'{name}.zip', 'application/zip', contexts.zip_bytes(trees[name]))])
            except urllib.error.HTTPError as e:   # the fatal probe's 422 is an answer, not a failure
                st, body = e.code, json.loads(e.read() or b'{}')
            listed = [t['name'] for t in g.api('GET', 'themes/')['themes']]
            print(f'    probe {name}: HTTP {st}')
        finally:
            shim.restore_and_delete(g, previous, [name])
        active = shim.active_theme(g)
        out.append((active == previous, name, "CONTROL — the active theme read back after the probe is the site's own: no probe was activated",
                    f'{active!r} (before {previous!r})'))
        if name in (GATE_PILOT, GATE_CASCADE):
            theme = ((body or {}).get('themes') or [{}])[0]
            got_err, got_warn = flags(theme.get('errors')), flags(theme.get('warnings'))
            out += [
                (st == 200 and theme.get('name') == name, name, 'T1 answers 200 and installs it: no result is fatal', f'HTTP {st}, {theme.get("name")!r}'),
                (got_err == want_err, name, "the errors on its theme record carry the same codes and fatal flags as runGscan(files, 6)'s",
                 f'T1 {got_err} · gate {want_err}'),
                (got_warn in ([], want_warn), name, "its warnings: Ghost empties them in production (validate.js), so [] is that premise; any it returns match the gate's",
                 f'T1 {got_warn} · gate {want_warn}'),
            ]
        if name == GATE_PILOT:
            out.append((('GS050-CSS-KGWF', False) in want_err and ('GS050-CSS-KGWW', False) in want_err, name,
                         "CONTROL — the gate's raw errors carry the two GS050 widths, so the comparison reads something", f'{want_err}'))
        if name == GATE_FATAL:
            err = ((body or {}).get('errors') or [{}])[0]
            got_err = flags(((err.get('details') or {}).get('errors')))
            out += [
                (('GS005-TPL-ERR', True) in want_err, name, "CONTROL — the gate's raw errors carry GS005-TPL-ERR, fatal", f'{want_err}'),
                (st == 422 and err.get('type') == 'ThemeValidationError', name, 'T1 answers 422 ThemeValidationError: a fatal result refuses the theme',
                 f'HTTP {st}, {err.get("type")!r}'),
                (got_err == want_err, name, "its errorDetails.errors carry the gate's codes and fatal flags — GS005-TPL-ERR fatal, with the two GS050s",
                 f'T1 {got_err} · gate {want_err}'),
                (six['verdict']['blocked'], name, "gscanGate's verdict is blocked", f'{[f["code"] + " " + f.get("rule", "") for f in six["verdict"]["errors"]]}'),
                (name not in listed, name, 'GET themes/ lists no such theme after the 422', f'{len(listed)} theme(s) listed'),
            ]
        if name == GATE_CASCADE:
            after = g.api('GET', 'custom_theme_settings/').get('custom_theme_settings')
            failed = [f for f in six['verdict']['errors'] if f['code'] == 'package_check_failed']
            pj = [f for f in six['verdict']['errors'] + six['verdict']['warnings'] if (f.get('rule') or '').startswith('GS010-PJ-') and f['code'] != 'package_check_failed']
            out += [
                (('GS010-PJ-PARSE', False) in want_err and sum(c.startswith('GS010-PJ-') for c, _ in want_err) > 1, name,
                 "CONTROL — the gate's raw report carries GS010-PJ-PARSE and the cascade", f'{[c for c, _ in want_err if c.startswith("GS010-")]}'),
                (len(failed) == 1 and f'“{PROBE_SETTING}”' in failed[0]['message'] and not pj, name,
                 f'gscanGate returns one package_check_failed naming {PROBE_SETTING}, and no GS010-PJ-* finding',
                 failed[0]['message'] if failed else f'{[f["code"] for f in six["verdict"]["errors"]]}'),
                (before == after, name, "CONTROL — the active theme's custom settings read the same before and after", f'{len(before or [])} setting(s)'),
            ]
    for ok, page, what, detail in out:
        print(f'    {"PASS" if ok else "FAIL"}  {page:<40} {what} — {detail}')
    bad = [v for v in out if v[2].startswith('CONTROL') and not v[0]]
    if bad:
        raise Void('A GATE-PROBE CONTROL FAILED — nothing here is a result:\n      ' + '\n      '.join(f'{p}: {w} — {d}' for _, p, w, d in bad))
    return out


# ── Story 7.8 (§77): the quality gate against Ghost's own pages ──────────────────────────────────────────────────
QUALITY_PROBE = 'inflozo-probe-quality'   # the pilots plus a planted heading skip and a nameless link, never the site's
GHOST_TARBALL = 'https://registry.npmjs.org/ghost/-/ghost-6.58.0.tgz'   # Ghost 6.58.0's own Casper and Source, read only

# The quality gate, readPages' heading alternatives and axe-core, through Node 24 — each tree the PRODUCT gate's verdict
# (`qualityGate`, Paper's pack, the library on disk), each page axe-core's violations of QUALITY_RULES' own axe ids
# (`tools/pilot-theme.mjs`'s `axeOn`, the one CI runs). A font crosses as base64.
QUALITY = r"""
const root = process.env.ROOT
const gate = await import(`${root}/packages/theme-compiler/gate/index.ts`)
const pilots = await import(`${root}/tools/pilot-theme.mjs`)
const { REFERENCE_PACK } = await import(`${root}/packages/section-runtime/src/reference.ts`)
const chunks = []
for await (const c of process.stdin) chunks.push(c)
const job = JSON.parse(Buffer.concat(chunks).toString('utf8'))
const library = pilots.library()
const ids = pilots.axeIds(gate.QUALITY_RULES)
const out = { axeVersion: pilots.AXE_VERSION, axeCore: gate.AXE_CORE, ids, trees: {}, pages: {} }
for (const [name, enc] of Object.entries(job.trees ?? {})) {
  const files = Object.fromEntries(Object.entries(enc).map(([p, b]) => [p, typeof b === 'string' ? b : new Uint8Array(Buffer.from(b.base64, 'base64'))]))
  out.trees[name] = { verdict: gate.qualityGate(files, { pack: REFERENCE_PACK, library }), headings: Object.fromEntries(gate.readPages(files).map((p) => [p.file, p.headings])) }
}
for (const [path, body] of Object.entries(job.pages ?? {})) out.pages[path] = await pilots.axeOn(body, ids)
process.stdout.write(JSON.stringify(out))
"""


def quality(trees=None, pages=None):
    """`{axeVersion, axeCore, ids, trees: {name: {verdict, headings}}, pages: {path: [axe ids]}}` — a failed run is a Void."""
    enc = {n: {p: b if isinstance(b, str) else {'base64': base64.b64encode(b).decode()} for p, b in f.items()} for n, f in (trees or {}).items()}
    run = subprocess.run([core.node24(), '--input-type=module', '-e', QUALITY], input=json.dumps({'trees': enc, 'pages': pages or {}}),
                         capture_output=True, text=True, timeout=600, env={**os.environ, 'ROOT': ROOT})
    if run.returncode != 0:
        raise Void(f'the quality gate did not run:\n{run.stderr[-1500:]}')
    out = json.loads(run.stdout)
    if out['axeVersion'] != out['axeCore']:
        raise Void(f'axe-core {out["axeVersion"]} is installed where QUALITY_RULES follows {out["axeCore"]} — nothing it says agrees with the gate')
    return out


def said(v):
    """A verdict's findings, one line each: level, code, refs."""
    return [f'{f["level"]} {f["code"]} {",".join(f["refs"])}' for f in v['errors'] + v['warnings']]


def quality_probe_tree(files, nonce):
    """The uploaded tree plus, in post.hbs right after A24 #1's invocation (its <h1>), an <h4> carrying this run's nonce
    and an <a href="#"></a> — a heading skip and a nameless link the gate and axe must each name, and nothing else."""
    m = re.search(r'^( *)\{\{> "sections/post/[^"]+"\}\}$', files['post.hbs'], re.M)
    if not m:
        raise Void('post.hbs carries no section invocation to plant after — the probe would plant nothing')
    plant = f'{m.group(0)}\n{m.group(1)}<h4>Probe{nonce}</h4>\n{m.group(1)}<a href="#"></a>'
    return {**files, 'post.hbs': files['post.hbs'].replace(m.group(0), plant, 1)}


def levels(body):
    """A rendered page's heading levels in document order, consecutive repeats collapsed — a repeat's body, which the
    gate reads once, renders once per post."""
    seq = re.findall(r'<h([1-6])\b', re.sub(r'<(script|style)\b.*?</\1>', '', body, flags=re.S | re.I))
    return ' '.join(f'h{l}' for i, l in enumerate(seq) if i == 0 or seq[i - 1] != l)


def collapse(seq):
    words = seq.split()
    return ' '.join(w for i, w in enumerate(words) if i == 0 or words[i - 1] != w)


def quality_rows(rec, local):
    """§77's rows (1): axe-core over the five pages Ghost rendered under the compiled theme, and their heading levels
    against the gate's alternatives for each page's template."""
    tree = local['trees']['pilots']
    out = [(not tree['verdict']['errors'] and not tree['verdict']['warnings'], 'local', 'CONTROL — the gate gave the uploaded tree an empty verdict before anything uploaded',
            '; '.join(said(tree['verdict'])) or 'no finding'),
           (len(local['ids']) > 0, 'local', f'CONTROL — axe-core {local["axeVersion"]} runs QUALITY_RULES\' own axe ids', ', '.join(local['ids']))]
    axe = quality(pages={p: r['body'] for p, r in rec['rendered'].items()})['pages']
    for path, r in rec['rendered'].items():
        out.append((axe[path] == [], path, f'axe-core reports no violation of QUALITY_RULES\' axe ids on Ghost\'s rendered page ({r["template"]}), as the gate\'s empty verdict says',
                    ', '.join(axe[path]) or 'none'))
        alts = sorted({collapse(a) for a in tree['headings'].get(r['template'], [])})
        got = levels(r['body'])
        out.append((got in alts, path, f'its heading levels are one of the gate\'s alternatives for {r["template"]} (consecutive repeats collapsed)',
                    f'{got or "none"} · gate {alts}'))
    return out


def quality_probe(g, files, nonce, post_path, local):
    """§77's rows (2): the probe uploaded under its own name and activated, a post read, axe-core and the gate each naming
    exactly the two planted findings; restored and deleted in a `finally` that encloses the upload, the active theme
    read back."""
    probe = local['trees'][QUALITY_PROBE]['verdict']
    want = ['warning heading_skip post.hbs,post.hbs', 'warning name_missing post.hbs,post.hbs']
    out = [(sorted(said(probe)) == want, 'local', 'the gate reports exactly heading_skip and name_missing for post.hbs on the probe tree',
            '; '.join(said(probe)) or 'nothing')]
    tree = quality_probe_tree(files, nonce)
    previous = shim.start_guard(g)
    st, body = None, ''
    try:
        st, res = g._multipart('themes/upload/', [('file', f'{QUALITY_PROBE}.zip', 'application/zip', contexts.zip_bytes(tree))])
        if res['themes'][0]['name'] != QUALITY_PROBE:
            raise Void(f'Ghost named the upload {res["themes"][0]["name"]!r}, not {QUALITY_PROBE!r}')
        g.api('PUT', f'themes/{QUALITY_PROBE}/activate/')
        for _ in range(10):
            time.sleep(2)
            st, body = g.page(post_path)
            if f'Probe{nonce}' in body:
                break
        else:
            raise Void(f'{post_path} never served {QUALITY_PROBE} (last HTTP {st}) — nothing read there is a result')
        print(f'    read {post_path} under {QUALITY_PROBE} -> HTTP {st}, {len(body)} bytes')
    finally:
        shim.restore_and_delete(g, previous, [QUALITY_PROBE])
    active = shim.active_theme(g)
    axe = quality(pages={post_path: body})['pages'][post_path]
    out += [
        (active == previous, QUALITY_PROBE, "CONTROL — the active theme read back after the probe is the site's own", f'{active!r} (before {previous!r})'),
        (st == 200 and f'Probe{nonce}' in body, post_path, "CONTROL — the read is the probe's own: its planted heading carries this run's nonce", f'HTTP {st}'),
        (axe == ['heading-order', 'link-name'], post_path, 'axe-core reports exactly heading-order and link-name on Ghost\'s rendered probe post',
         ', '.join(axe) or 'none'),
    ]
    return out


def evidence(root, f):
    """A finding's line in the theme's own source — `file:line: text` — or None: the file it names, searched for the
    element the rule judged."""
    path = f['refs'][1] if len(f['refs']) > 1 else f['refs'][0]
    try:
        text = open(os.path.join(root, path), encoding='utf8').read()
    except OSError:
        return None
    rule, msg, detail = f.get('rule'), f['message'], f.get('detail') or ''
    level = re.search(r'a level-(\d) heading', msg)
    ident = re.search(r'the id “([^”]+)”', detail)
    at = re.search(r'at line (\d+)', detail)
    pattern = {
        'html-has-lang': r'<html(?![^>]*\blang=)[^>]*>',
        'heading-order': rf'<h{level.group(1)}\b' if level else None,
        # a link or button whose content is only tags and partials — never a picture, whose alt may name it
        'link-name': r'<a\b[^>]*>(?:\s|<(?!img\b)[^>]*>|\{\{>[^}]*\}\})*</a>',
        'button-name': r'<button\b[^>]*>(?:\s|<(?!img\b)[^>]*>|\{\{>[^}]*\}\})*</button>',
        'duplicate-id': rf'id="{re.escape(ident.group(1))}"' if ident else None,
        'one-main': r'<main\b',
        'image-alt': r'<img(?![^>]*\balt=)[^>]*>',
        'meta-viewport': r'<head\b',
        'build-leftover': r'\S',
    }.get(rule)
    if at:
        line = int(at.group(1))
    elif pattern:
        m = re.search(pattern, text, re.S)
        if not m:
            return None
        line = text.count('\n', 0, m.start()) + 1
    else:
        return None
    return f'{path}:{line}: {text.split(chr(10))[line - 1].strip()[:90]}'


GSCAN6 = r"""
const gate = await import(`${process.env.ROOT}/packages/theme-compiler/gate/index.ts`)
const { readdirSync, readFileSync } = await import('node:fs')
const { join, relative, sep } = await import('node:path')
const out = {}
for (const dir of JSON.parse(process.env.DIRS)) {
  const files = {}
  const walk = (at) => { for (const e of readdirSync(at, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name === '.git') continue; const p = join(at, e.name); if (e.isDirectory()) walk(p); else files[relative(dir, p).split(sep).join('/')] = readFileSync(p) } }
  walk(dir)
  out[dir] = (await gate.runGscan(files, 6)).results.map((r) => `${r.level} ${r.code}`)
}
process.stdout.write(JSON.stringify(out))
"""


def negative_control():
    """§77's rows (3): Ghost 6.58.0's own Casper and Source, from its npm tarball (read only), through
    `tools/quality-gate.mjs` — each fails at least one rule, every finding shown at its line in the theme's own source —
    and gscan 6.4.2 at `v6`, their own Ghost's checker, passing each 0/0. Returns `(rows, themes)`."""
    tmp = tempfile.mkdtemp(prefix='inflozo-negative-')
    try:
        tgz = os.path.join(tmp, 'ghost.tgz')
        with urllib.request.urlopen(GHOST_TARBALL, timeout=300) as r, open(tgz, 'wb') as f:
            shutil.copyfileobj(r, f)
        with tarfile.open(tgz) as t:
            members = [m for m in t.getmembers() if m.name.startswith('package/content/themes/') and m.isfile()
                       and '..' not in m.name.split('/')]
            t.extractall(tmp, members=members, filter='data')
        base = os.path.join(tmp, 'package', 'content', 'themes')
        dirs = [os.path.join(base, n) for n in ('casper', 'source')]
        run = subprocess.run([core.node24(), '--input-type=module', '-e', GSCAN6], capture_output=True, text=True, timeout=600,
                             env={**os.environ, 'ROOT': ROOT, 'DIRS': json.dumps(dirs)})
        if run.returncode != 0:
            raise Void(f'gscan did not run on Ghost\'s own themes:\n{run.stderr[-1500:]}')
        gscan6 = json.loads(run.stdout)
        rows, themes = [], {}
        for d in dirs:
            version = json.load(open(os.path.join(d, 'package.json')))['version']
            name = f'{os.path.basename(d)} {version}'
            r = subprocess.run([core.node24(), os.path.join(ROOT, 'tools', 'quality-gate.mjs'), d], capture_output=True, text=True, timeout=600, cwd=ROOT)
            if r.returncode != 0:
                raise Void(f'tools/quality-gate.mjs did not run on {name}:\n{r.stderr[-1500:]}')
            got = json.loads(r.stdout)
            findings = got['verdict']['errors'] + got['verdict']['warnings']
            rows.append((gscan6[d] == [], name, 'CONTROL — gscan 6.4.2 at v6, its own Ghost\'s checker, passes it 0/0', ', '.join(gscan6[d]) or '0/0'))
            rows.append((len(findings) > 0, name, 'it fails at least one rule of the quality gate', f'{len(findings)} finding(s)'))
            for f in findings:
                ev = evidence(d, f)
                rows.append((ev is not None, name, f'{f["level"]} {f["code"]} ({f.get("rule")}) is real: its line in the theme\'s own source', ev or f'NOT FOUND in {f["refs"]}'))
            sheet = got.get('stylesheet') or {}
            by_rule = {}
            for w in sheet.get('warnings', []):
                by_rule[w['rule']] = by_rule.get(w['rule'], 0) + 1
            themes[name] = {'findings': findings, 'sheet': sheet.get('file'), 'css': by_rule}
        return rows, themes
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ── §72 ───────────────────────────────────────────────────────────────────────
def table(rows):
    out = ['| Page | Row | Held |', '|---|---|---|']
    for ok, page, what, detail in rows:
        shown = str(detail)[:60].replace('|', '\\|')   # the detail tells the three hostile rows apart (review)
        out.append(f'| `{page}` | {what} — `{shown}` | {"yes" if ok else "**NO**"} |')
    return out


def section(rec, gates, files, c, pay, probes, local, q):
    today = datetime.date.today().isoformat()
    gline = ' · '.join(f'Ghost {g["major"]} via gscan {g["gscan"]} at `{g["checkVersion"]}` — {g["errors"]} errors / {g["warnings"]} warnings' for g in gates)
    parts = sorted(p for p in files if p.startswith('partials/'))
    templates = sorted(p for p in files if p.endswith('.hbs') and not p.startswith('partials/') and p not in ('page.hbs',))
    fonts = sorted(p for p in files if p.startswith('assets/fonts/'))
    licences = sorted(p for p in files if p.startswith('LICENSE-'))
    (tag, tag_n), (author, author_n) = rec['arch']['tag'], rec['arch']['author']
    qrows, qprobe, neg_rows, neg = q
    out = [f'## {SECTION}. The emitted-theme quality gate — axe-core on Ghost\'s own pages agreeing with `qualityGate`, a '
           f'planted probe named by both, and Ghost\'s Casper and Source as its negative control, beside the gscan gate, a '
           f'customer\'s words inert to gscan and the pilots compiled with Ghost\'s article, WebP `srcset`s, `main.js`, '
           f'Paper\'s fonts, their licences, a section\'s dark hook, every standard template and the paywall mechanism, '
           f'rendered by Ghost, T1 · {today}', '',
           f'**Command.** `{COMMAND}` — three theme uploads (the compiled pilots, then two hand-written paywall probes), each '
           'activated, the previous theme restored and the probe theme deleted in a `finally` that encloses the upload '
           '(DW-332), both read back; Story 7.8\'s quality probe (the pilots plus a planted heading skip and a nameless '
           'link), activated, then restored and deleted the same way; Story 7.7\'s three probe uploads (the compiled pilots unscaffolded, a fatal probe, a '
           'cascade probe), none activated, each deleted in a `finally` that encloses its upload and the active theme read back '
           'after each; the one `w750` rendition and the one `w750` WebP rendition Ghost saves the first time '
           'it is asked for each; no content, no setting and no key written. The picture is '
           + (f'`{rec["uploaded"]}`, uploaded by this run because T1 hosts no picture of its own (owner, 2026-10-06, '
              'Story 7.2\'s Question 4) — it stays, as Ghost\'s API deletes no picture' if rec['uploaded'] else
              f'`/content/images/{rec["picture"]}`') + '. T1 only (R-238); the Ghost 5 half is DW-326\'s, at Story 15.7. '
           "§70 to §76 are Stories 7.1's to 7.7's records; this re-runs their rows beside Story 7.8's. Ghost 6.58.0's npm "
           f"tarball (`{GHOST_TARBALL}`) is read, never installed, for Casper and Source.", '',
           '**Why.** Story 7.3\'s compiler resolves every standard template through `designate`, `synthesize` and '
           '`pageTwoStack`, writes an archive\'s designed page 2 inside `{{#is "paged"}}`, wraps `{{{body}}}` in '
           '`<main id="site-main">`, puts FR-H2\'s `noindex` guard in `default.hbs`\'s head, and leaves out an untouched '
           '`error.hbs` the library cannot fill (Question 1, ruled option 1). It writes a designed paywall as '
           '`partials/content-cta.hbs` with no explicit `{{> "content-cta"}}`, on the strength of a source reading that '
           'corrects §15b. Story 7.4\'s ships the pairing\'s pool woff2 files in `assets/fonts/`, preloads the two roman '
           'faces and writes their `@font-face` rules in `default.hbs`\'s head through one `{{asset}}` address each, puts '
           'each family\'s licence at the root, and writes `screen.css` as the token block — AD-18\'s two `--gh-font-*` '
           'variables, then A4 #13\'s dark override on its hook — the canvas\'s base, and each design\'s sheet stripped to '
           'what its placed roots reach. Story 7.5\'s writes `assets/js/main.js` — `core` and each declared module with a '
           'file, `core` alone on the pilots, whose `nav-drawer` and `member-form` have no file yet and ship at rest — behind '
           'one `defer` tag in `default.hbs`\'s head after the stylesheet, and `README.md`\'s Scripts section. Story 7.6\'s '
           'wraps the sections of every template whose matrix row opens `{{#post}}` in `POST_ARTICLE` — '
           f'`{c["postArticle"]}` — asks Ghost for WebP in every `srcset` candidate (`format="webp"`), and ships no '
           '`locales/` (Story 7.12\'s), so Ghost prints each `{{t}}` key. Story 7.7\'s gate, `gscanGate` '
           '(`@inflozo/theme-compiler/gate`), runs each Ghost major\'s own pinned gscan over a compiled theme and maps it '
           'through one table (AD-24); the runtime\'s escaper and the boundary comment write gscan\'s brace-free trigger '
           'words inert (AD-36), so the page word carried the four error words after its nonce and the layer word '
           '`currency_symbol`. '
           '`check-snapshots` holds the tree in CI; this is a real Ghost reading it. Gate — the product\'s own, `gscanGate` '
           '(gscan reads `.js` too, so `main.js` is checked; §74 and §75 said otherwise, and carry a dated correction), '
           f'with the scaffold (`cards.css`, Story 7.13\'s two widths alone — AD-18\'s lines left it, so `screen.css` '
           f'answers GS051; the stand-in `page.hbs`, Story 10.79\'s, for GS110): {gline}.', '',
           f'**The tree uploaded** ({len(files)} files): ' + ', '.join(f'`{p}`' for p in templates)
           + f', `assets/css/screen.css`, `assets/js/main.js`, `README.md`, `package.json`, {len(fonts)} font files — ' + ', '.join(f'`{p}`' for p in fonts)
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
           'carry answered 404, so each 200 read was the file\'s own; A17 #1\'s root carried no hook, so A4 #13\'s is '
           'the override\'s doing; `main.js` and its tag were in the uploaded tree, and a script the theme does not carry '
           'answered 404, so the 200 read at the tag\'s address was `main.js`\'s own; the uploaded `post.hbs` carried the '
           'article and every uploaded `srcset` candidate asked for WebP, no uploaded file wrote a generator meta or named '
           '`portal.min.js`, and no `locales/` was uploaded; the Content API said the gated post is not public and the other '
           'post is; `/` carried at least one `data-portal`; and `size/w751/format/webp/` was redirected to the original. '
           'For the paywall: the Content API says '
           'the post is not public, each read carried its own theme\'s marker, and the control theme rendered Ghost\'s own '
           'call to action. Story 7.7\'s: the uploaded templates carried each typed word\'s inert form and none raw, and the '
           'local gate gave the scaffolded tree an empty verdict on both checkers; for the three probes, the active theme read '
           'back after each was the site\'s own, the gate\'s raw report carried what each probe plants (the two `GS050`s, '
           '`GS005-TPL-ERR` fatal, `GS010-PJ-PARSE` with the cascade), and the active theme\'s custom settings read the same '
           'before and after the cascade probe. Every one held.', '',
           f'### (a) The compiled pilots — T1 `{rec["site"].replace("https://", "")}` ({rec["version"]}), locale `{rec["locale"]}`', '']
    out += table(rec['verdicts'])
    out += ['', '### (b) The paywall mechanism — two hand-written probe themes, signed out', '',
            f'Both carry `partials/content-cta.hbs` with this run\'s marker and invoke `content-cta` nowhere. `{PAYWALL}` '
            f'invokes one other partial from `default.hbs`; `{PAYWALL_CONTROL}` is the same theme with that line removed.', '']
    out += table(pay)
    g5 = {n: local[n]['5']['verdict'] for n in (GATE_PILOT, GATE_FATAL, GATE_CASCADE)}
    out += ['', "### (c) Ghost 6's own checker against the gate — three probe uploads, none activated", '',
            f'`{GATE_PILOT}` is the compiled pilot theme with no scaffold; `{GATE_FATAL}` adds `{FATAL_FILE}` invoking '
            f'`{{{{> "no-such-partial"}}}}`; `{GATE_CASCADE}` adds `config.custom.{PROBE_SETTING}`, a two-option select whose '
            '`visibility` is `"true"`, read once in `default.hbs`. Each row compares T1\'s answer with `runGscan(files, 6)` and '
            '`gscanGate` on the same files. The Ghost 5 half is DW-326\'s; gscan 4.49.7 judged the same trees locally: '
            + '; '.join(f'`{n}` {"blocked" if v["blocked"] else "not blocked"} — {", ".join(f["code"] + (" " + f["rule"] if f.get("rule") else "") for f in v["errors"] + v["warnings"]) or "nothing"}' for n, v in g5.items())
            + '.', '']
    out += table(probes)
    out += ['', "### (d) The quality gate against Ghost's own pages — the pilots as T1 renders them", '',
            'axe-core, the version `QUALITY_RULES` follows, runs `QUALITY_RULES`\' own axe ids in jsdom over `/`, `/page/2/`, a '
            'post, the busiest tag and the busiest author, as Ghost served them under the compiled theme; each page\'s heading '
            'levels are compared with `readPages`\' alternatives for its template, consecutive repeats collapsed (a repeat\'s '
            'body, which the gate reads once, renders once per post).', '']
    out += table(qrows)
    out += ['', f'### (e) The probe — `{QUALITY_PROBE}`: the pilots, plus an `<h4>` and an `<a href="#"></a>` after A24 #1\'s '
            '`<h1>` in `post.hbs`', '']
    out += table(qprobe)
    out += ['', "### (f) The negative control — Ghost 6.58.0's own Casper and Source, through `tools/quality-gate.mjs`", '',
            'Paper\'s pack and an empty library (a theme Inflozo did not compile has none, so the required set is '
            '`REQUIRED_TEMPLATES`). Every finding is shown at its line in the theme\'s own source. Their stylesheets, through '
            'the root `stylelint.config.mjs` (FR-G8\'s floor), warned: '
            + '; '.join(f'{n} (`{t["sheet"]}`) ' + (', '.join(f'`{r}` ×{k}' for r, k in sorted(t['css'].items())) or 'nothing') for n, t in neg.items())
            + ' — recorded, never gated: Ghost\'s themes are not held to Inflozo\'s floor.', '']
    out += table(neg_rows)
    cards_line = ("its `cards.min.css` hash equals the site theme's, whose `card_assets` is `true`" if rec['site_cards'] is True else
                  f"the cards hash was not compared: the site theme's `card_assets` is `{rec['site_cards']!r}`, not `true`")
    out += ['', '### What it means', '',
            '- **The quality gate reads a theme as Ghost renders it.** On the five pages read, axe-core found nothing the '
            'gate\'s empty verdict did not already say, and every page\'s heading levels were one of the gate\'s alternatives '
            'for its template. With a heading skip and a nameless link planted, axe-core on Ghost\'s own page and the gate on '
            'the files named exactly those two.',
            '- **Ghost\'s own themes pass gscan and fail this gate.** Casper and Source score 0/0 on their own Ghost\'s '
            'checker, and each fails at least one quality rule — every finding shown at its line in their source. That is '
            'the gap FR-J17 exists for: gscan certifies a Ghost theme, not a good one.',
            '- **A customer\'s words never trip Ghost\'s checker, and visitors read them as typed.** The four words gscan '
            'counts as errors with no brace at all were typed into A4 #13\'s eyebrow and `currency_symbol` into every layer '
            'name; the templates carried each with one character as its HTML code, the gate found nothing on either checker, '
            'and `/` read the eyebrow back exactly as typed.',
            '- **Ghost 6\'s own checker answers as the gate says.** On the same files, the errors on T1\'s theme record — or, '
            'for the fatal probe, in its 422 `ThemeValidationError` — carried the codes and `fatal` flags `runGscan` gave; a '
            'fatal result refused the theme and left nothing installed, while non-fatal errors installed it. T1 returned no '
            'warnings, as Ghost empties them in production, so the page switch the gate warns on is never Ghost\'s to show. '
            'The cascade probe reported every `package.json` rule broken on T1, and the gate said it as one sentence naming '
            f'`{PROBE_SETTING}`.',
            f'- **Each post\'s page sits in Ghost\'s article.** The gated post, signed out, and the newest public post '
            f'(`{rec["public"]}`) each carried one `<article>` around the page\'s sections, with the header outside, and its '
            'class was Ghost\'s `post_class` exactly as computed from the Content API\'s record — ending '
            f'` post-access-…` on the gated post (`{rec["gated"]}`) and with nothing after it on the public one. So a site '
            'owner\'s own CSS can style a members-only, featured or tagged post. Nothing in Ghost styles these classes itself.',
            '- **Ghost\'s helpers sit where Ghost expects them.** Every page\'s `<body>` carried Ghost\'s template class and '
            'never the bare `post`, and every `<head>` carried Ghost\'s generator meta and Portal\'s script once each — '
            '`{{ghost_head}}`\'s, since the theme writes neither.',
            f'- **Every `data-portal` on `/` opens a real Portal page** ({rec["portals"]} read, each matching `PORTAL_PAGE`).',
            '- **Pictures are offered as WebP.** The rendition every `srcset` candidate asks for was served at its own path '
            'as `image/webp`, while a width no theme declares was redirected to the original; `src` keeps the picture\'s own '
            'format.',
            '- **Labels go through `{{t}}`, and the language file is still to come.** A1 #1\'s More label printed `nav.more`, '
            'Ghost\'s answer for a key no shipped locale file holds; Story 7.12 ships `en.json` and its run turns it to "More". '
            'No visitor sees this: nothing deploys before Story 7.18.',
            '- **The theme\'s script reaches the page as built.** `/`\'s head carried `main.js`\'s tag once, `defer`, in the '
            'form `{{asset}}` resolves to, and its address answered with a JavaScript type and the compiled bytes — so '
            '`core` loads on every page without holding it up.',
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
            "10.107), and Ghost 5's half is DW-326's, at Story 15.7 (R-238: T3 retired). No `cards.js` was uploaded: "
            "the pilots design no card, so a real Ghost first serves it with Story 7.13's first designed card; that "
            "excluding a card drops Ghost's own script is read in source (Story 7.5's Facts 1), not on a page. What "
            "`main.js` does in a browser is `core.test.mjs`'s and §42's, not a page read here. Ghost's post labels sit on "
            "each post's own page only, never on a card in a list (Story 7.6's Question 1, ruled option 1), so no list was "
            "read for them; gscan's deprecation rules are the local gate's, not a page read. Two shapes the compiler "
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
        # Story 7.7: the scaffolded tree and the three probe trees through the product gate, before anything uploads
        trees = probe_trees(c)
        local = gated({'pilots': files, **trees})
        gates = clean(local, 'pilots')
        # Story 7.8: the quality gate over the same tree and the probe's, before anything uploads — a finding on the
        # pilots is a question for the owner (the spec's Ask First), never a result
        local_q = quality(trees={'pilots': files, QUALITY_PROBE: quality_probe_tree(files, nonce)})
        if said(local_q['trees']['pilots']['verdict']):
            raise Void(f'the quality gate names findings on the pilots ({said(local_q["trees"]["pilots"]["verdict"])}) — STOP AND ASK the owner')
        rec = record(g, contexts.zip_bytes(files), files, c, per_page, total, arch, nonce)
        pay = paywall(g, nonce)
        probes = gate_probes(g, trees, local)
        qrows = quality_rows(rec, local_q)
        qprobe = quality_probe(g, files, nonce, rec['post'], local_q)
        neg_rows, neg = negative_control()
    except (Void, RuntimeError, urllib.error.HTTPError, urllib.error.URLError, OSError, KeyError, subprocess.SubprocessError, ValueError) as err:
        detail = err.read()[:400].decode('utf8', 'replace') if isinstance(err, urllib.error.HTTPError) else ''
        print(f'\n  ** RUN VOID — nothing written. {type(err).__name__}: {err} {detail}')
        sys.exit(1)
    failed = [v for v in rec['verdicts'] + pay + probes + qrows + qprobe + neg_rows if not v[0]]
    if failed:
        print(f'\n  ** {len(failed)} row(s) did not hold — nothing written. STOP AND ASK: Ghost does not render the '
              'compiled theme as the compiler claims.')
        sys.exit(1)
    write_section(section(rec, gates, files, c, pay, probes, local, (qrows, qprobe, neg_rows, neg)))
    print(f'\n    MEASUREMENTS.md §{SECTION} written — every row held on T1, behind its controls.')
    sys.exit(0)
