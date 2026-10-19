// Story 7.1 — theme assembly, held to its I/O matrix on small inline designs, and then to what the compiler promises over
// EVERY file it emits: Handlebars 4.7.9 parses it, one triple-stash, no token or marker, no comment but the labels, no
// fingerprint, every partial referenced, no consumed directive, and the same bytes for shuffled input.
// Story 7.2 — `package.json`, held to its own I/O matrix, and the `size=` check on the final text.
// Story 7.3 — every standard template, synthesized where untouched: the spec's I/O matrix row by row, on the same inline
// library, which holds every design the rows need (A24 #1 may sit on `page.hbs` here, as Story 10.79 will make it).
// Story 7.4 — fonts, licences, the token block, the base, the strip, the hooks and AD-14's record: the spec's I/O matrix
// row by row. A core package's test opens no file (AD-1), so the font pool's bytes are made here, to the pool's lengths.
// Story 7.5 — the scripts: main.js, cards.js, Ghost's licence, README.md and the two tags, the spec's I/O matrix row by
// row. The module files and Ghost's card scripts are made here too, the chunks in record-cards.py's head shape.
// Story 7.6 — Ghost's markup: the article on every {{#post}} template, WebP candidates, and `checkGhostMarkup` and
// `checkChromeText`, each refusal called directly and the compile's own throw reached. The inline designs' text bindings
// and props hide when empty, as the library's do: FR-H8's text default would ship the authored English as a literal,
// which V1 at compile refuses (the last row).
// Story 7.12 — the locale files and the language's faces: `en.json` always, the language's file beside it, every value
// judged by `overrideRefusal`, the language refused as a path, and a non-latin script's whole faces — the spec's I/O matrix.
// Story 7.17 — FR-I5's two lints (a bundled module reading a modifier key, a `{{ghost_head}}` with an argument) and README's
// routes step, with its AD-36 pair: `ad36.test.ts` lives in the runtime, which cannot reach `compileTheme` (the compiler
// depends on the runtime), so the README sink's inert-and-legitimate pair is the last row here.
//
// A test may load `handlebars` to parse what the compiler emitted (FR-J1); product code may not (`eslint.config.js`).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import Handlebars from 'handlebars'
import { JSDOM } from 'jsdom'
import {
  bundle, bundledNames, CARDS_JS_TAG, CATALOG, englishStrings, resolveStrings, cardsCss, cardsJs, checkThemeJs, excludedChunks, KOENIG_WIDTHS, ownCardsCss, checkThemeScripts, CONSUMED_DIRECTIVE_RE, HBS_COMMENT, i18nAttr, IMAGE_SIZES, MAIN_JS_TAG, moduleFunctionName,
  MODULES, PAYWALL_TARGET, PORTAL_ACTIONS, PORTAL_PAGE, ROUTE_TEMPLATE_TARGET,
} from '@inflozo/library'
import type { ControlDef, DataBinding, PropDef, SectionRegistryEntry } from '@inflozo/library'
import { TABLER_LICENSE } from '@inflozo/library/icons'
import { pairingFaces, pairingFonts, POOL } from '@inflozo/library/packs'
import { BASE_CSS, darkOverrideCss, GSCAN_INERT, hookOf, MODE_SELECTORS, packTokensCss, pageTwoStack, sectionKey, SETTING_WORDS, srcsetExpr, synthesize, U0, U1, T0, T1, USER_SETTING_CAP } from '@inflozo/section-runtime'
import type { DocInstance, Pack, ProjectDoc } from '@inflozo/section-runtime'
import { fontFaceCss, pairingFiles, preloadFiles } from '@inflozo/section-runtime/fonts'
import { parseRoutesConfig, routesYaml } from '@inflozo/section-runtime/routes'
import { OVERRIDE_WORDS } from '@inflozo/library/override'
import { REFERENCE_PACK } from '@inflozo/section-runtime/reference'
import {
  checkChromeText, checkGhostMarkup, checkImportant, checkPageData, checkPaywallReached, checkSizes, checkTripleStashes, compileTheme, POST_ARTICLE, THEME_MARKER, THEME_MARKS, tidyLicence,
} from './compile.ts'
import type { CompiledTheme, CompileInput, CompileSetting } from './compile.ts'
import { REFUSAL, refusalOf, type RefusalKind } from './refusal.ts'

const doc = () => new JSDOM('<body></body>').window.document

/** Story 7.11 — `<body>`'s line as every theme now writes it: Ghost's class, then the owner's pin (Color scheme) as the
 *  class `MODE_SELECTORS` reads. Written out, so a change to the chain is a pin moved on purpose. */
const BODY_LINE = '<body class="{{body_class}}{{#match @custom.color_scheme "=" "Light"}} scheme-light{{else match @custom.color_scheme "=" "Dark"}} scheme-dark{{/match}}">'
/** A plant on `<body>`'s class: the line's opening, which every theme carries whatever follows `{{body_class}}`. */
const BODY_OPEN = '<body class="{{body_class}}'
/** `default.hbs` with the pin's chain taken out, once — the AD-30 rows' reading: the chain is the only place it names a mode. */
const unpinned = (shell: string): string => {
  assert.equal(shell.split(BODY_LINE).length, 2, 'the pin\'s chain is on <body>, once')
  return shell.replace(BODY_LINE, '<body class="{{body_class}}">')
}
const MODE_NAMED = /prefers-color-scheme|data-mode|scheme-(light|dark)/

// ─── a small inline library ───────────────────────────────────────────────────────────────────────────────────────

const TITLES: Record<string, string> = { a1: 'Headers', a3: 'Footers', a4: 'Heroes', a17: 'Post Grids', a22: 'Newsletter', a24: 'Post Headers', a30: 'Members Pages', a31: 'Error Pages', a32: 'Paywall / Content CTA' }
const text = (label: string): PropDef => ({ type: 'text', label }) as PropDef

function design(id: string, name: string, over: Partial<SectionRegistryEntry> & Pick<SectionRegistryEntry, 'html' | 'compileTarget'>): SectionRegistryEntry {
  const category = id.split('/')[0] as string
  return {
    id, category, categoryTitle: TITLES[category] ?? category, name, tier: 'free', bindingContext: ['none'],
    contentSchema: {}, controlSchema: [], universals: {}, absent: [], css: `/* ${id}, Story 7.1's test design — DW-1 */\n.${id.replace('/', '-')} { color: var(--text-body); }   \n\n\n\n.x { margin: 0 }\n`,
    ghostCompat: { minVersion: '5.62.0', helpers: [] }, darkCapabilities: ['tokens'], previewSeed: 'orbit-weekly',
    descriptor: { archetype: 'x', containment: 'none', ground: 'page', itemCount: 'none', mediaPlacement: 'none', emphasis: 'x' },
    ...over,
  }
}

const segmented = (rows: readonly (readonly [string, ...string[]])[]): ControlDef[] =>
  rows.map(([name, ...values]) => ({ name, type: 'segmented', label: name, group: 'layout', values, default: values[0] }) as ControlDef)

const LATEST: Record<string, DataBinding> = { latest: { source: 'posts', limit: 1, order: 'published_at desc', fixed: true } }

const LIB: Record<string, SectionRegistryEntry> = Object.fromEntries([
  design('a1/1', 'Rail', {
    compileTarget: ['default.hbs'],
    html: '<header class="a1-1">\n  <a class="a1-1__brand" data-bind-attr="href:@site.url" data-bind="@site.title" data-empty="hide">Site</a>\n</header>',
  }),
  design('a3/1', 'Columns', {
    compileTarget: ['default.hbs'],
    contentSchema: { note: text('Note') },
    html: '<footer class="a3-1">\n  <p class="a3-1__note" data-prop="note" data-empty="hide">Note</p>\n</footer>',
  }),
  design('a4/13', 'Latest Post', {
    compileTarget: ['home.hbs', ROUTE_TEMPLATE_TARGET],
    contentSchema: { eyebrow: text('Eyebrow') },
    dataBindings: LATEST,
    html: `<section class="a4-13">
  <p class="a4-13__eyebrow" data-prop="eyebrow" data-empty="hide">Issue</p>
  <div class="a4-13__card" data-repeat="latest">
    <a class="a4-13__link" data-bind-attr="href:url">
      <img class="a4-13__picture" data-bind-attr="src:feature_image|img_url:l" data-bind-srcset="feature_image|img_url" sizes="(max-width: 767px) 108px, 434px" width="1200" height="800" alt="">
      <span class="a4-13__title" data-bind="title" data-empty="hide">Title</span>
    </a>
    <pre class="a4-13__rule">*
   *  *</pre>
    <textarea class="a4-13__box" aria-hidden="true">-
      -</textarea>
  </div>
</section>`,
  }),
  design('a17/1', 'Three Up', {
    compileTarget: ['home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs'],
    bindingContext: ['posts'],
    controlSchema: segmented([['per-row', 'three', 'two']]),
    html: '<section class="a17-1">\n  <ul class="a17-1__grid">\n    <li class="a17-1__cell" data-repeat="posts" data-partial="post-card">\n      <a class="a17-1__card" data-bind-attr="href:url" data-bind="title" data-empty="hide">Title</a>\n    </li>\n  </ul>\n</section>',
  }),
  design('a22/1', 'Inline Row', {
    compileTarget: ['home.hbs', 'page.hbs', 'post.hbs', ROUTE_TEMPLATE_TARGET],
    contentSchema: { heading: text('Heading'), proof: { type: 'richtext', label: 'Proof', marks: ['strong'] } as PropDef },
    // A22 #1's own controls, so its root carries the ten attributes the real one does
    controlSchema: ([['align', 'center', 'start'], ['heading-size', 'large', 'display'], ['field-width', 'medium', 'wide'], ['below-field', 'note', 'nothing'], ['blurb', 'show', 'hide'], ['social-proof', 'off', 'member-count']] as const)
      .map(([name, a, b]) => ({ name, type: 'segmented', label: name, group: 'layout', values: [a, b], default: a }) as ControlDef),
    html: `<section class="a22-1">
  <h2 class="a22-1__heading" data-prop="heading" data-empty="hide">Heading</h2>
  <p class="a22-1__proof" data-prop="proof" data-empty="hide">Proof</p>
</section>`,
  }),
  design('a24/1', 'Centred', {
    // on page.hbs too, as Story 10.79 will make the real one, so the page switch's rows are testable today
    compileTarget: ['post.hbs', 'page.hbs'],
    bindingContext: ['post'],
    controlSchema: segmented([['byline', 'on', 'off'], ['tag-line', 'on', 'off']]),
    html: '<section class="a24-1">\n  <h1 class="a24-1__title" data-bind="title" data-empty="hide">Title</h1>\n</section>',
  }),
  design('a30/1', 'Card', {
    compileTarget: ['custom-signup.hbs', 'custom-signin.hbs', 'custom-member-home.hbs'],
    contentSchema: { heading: text('Heading') },
    html: '<section class="a30-1">\n  <h2 class="a30-1__heading" data-prop="heading" data-empty="hide">Join</h2>\n</section>',
  }),
  design('a32/1', 'Centred', {
    compileTarget: [PAYWALL_TARGET],
    contentSchema: { heading: text('Heading') },
    html: '<section class="a32-1">\n  <h2 class="a32-1__heading" data-prop="heading" data-empty="hide">Keep reading</h2>\n</section>',
  }),
].map((e) => [e.id, e]))

let ids = 0
const at = (designId: string, layerName: string, over: Partial<DocInstance> = {}): DocInstance => ({
  instanceId: `inst-${String(++ids).padStart(4, '0')}-zq`, layerName, designId, content: {}, controls: {}, data: {}, darkOverrides: {},
  hidden: false, memberVisibility: 'everyone', isMainFeed: false, parkedControls: {}, ...over,
})
const docOf = (...instances: DocInstance[]): ProjectDoc => ({ schemaVersion: 1, instances })
const NEWS = { heading: 'One letter a week', proof: { text: 'Join us today', marks: [{ start: 5, end: 7, mark: 'strong' }] } }

/** A licence as a font family's authors wrote it: CRLF, a trailing space, two final newlines — what `tidyLicence` tidies. */
const LICENCE_WORDS = (path: string) => `Copyright 2020 The ${path} Project Authors\r\n\r\nThis Font Software is licensed under the SIL Open Font License, Version 1.1. \r\n\r\n`
// Story 7.12: a face's whole file too, which a non-latin language ships (§D.b)
const POOL_FILES = Object.values(POOL.faces).flatMap((face) => [...face.files, ...(face.full === undefined ? [] : [face.full])])
/** The shell's read of the pool (Story 7.4), made in memory: each file its pool length, filled with a byte of its own name. */
const poolFonts = (path: string): Uint8Array => {
  const f = POOL_FILES.find((x) => `files/${x.file}` === path)
  if (f !== undefined) return new Uint8Array(f.bytes).fill([...f.file].reduce((n, c) => (n + c.charCodeAt(0)) % 256, 0))
  if (Object.values(POOL.families).some((family) => family.licenceFile === path)) return new TextEncoder().encode(LICENCE_WORDS(path))
  throw new Error(`the pool holds no ${path}`)
}

/** The shell's read of `packages/library/modules/` (Story 7.5), made in memory: a minimal `core`, its comment plain. */
const CORE = '// the runtime\nexport function core(win, modules) {\n  return { stop() {}, paused: [] }\n}\n'
/** A module file, as its category story writes one: its one exported function. */
const stub = (name: string) => `export function ${moduleFunctionName(name)}(el) {\n  el.hidden = false\n}\n`
/** A chunk as `tools/probe/record-cards.py` vendors it: its two-line head, then Ghost's bytes. */
const chunk = (name: string, body: string, version = '6.58.0') =>
  `/* Vendored verbatim from Ghost ${version}, core/frontend/src/cards/js/${name}.js, by \`python3 tools/probe/record-cards.py\`.\n   Copyright (c) 2013-2026 Ghost Foundation. MIT licence — the full text is vendor/LICENSE-ghost.txt. */\n${body}`
/** Story 7.13 — a stylesheet chunk, in the same head shape under `cards/css/`. */
const cssChunk = (name: string, body: string, version = '6.58.0') =>
  `/* Vendored verbatim from Ghost ${version}, core/frontend/src/cards/css/${name}.css, by \`python3 tools/probe/record-cards.py\`.\n   Copyright (c) 2013-2026 Ghost Foundation. MIT licence — the full text is vendor/LICENSE-ghost.txt. */\n${body}`
/** Ghost 6.58.0's stylesheet directory's names (the spec's Design Notes), each a stand-in carrying its own class — audio and
 *  video Ghost's `!important` too, which stays inside the copy; callout's last line unterminated, as Ghost's own is. */
const CSS_NAMES = ['audio', 'blockquote', 'bookmark', 'button', 'callout', 'collection', 'cta', 'file', 'gallery', 'header', 'header_v2', 'nft', 'product', 'signup', 'toggle', 'transistor', 'video']
const cssBody = (n: string) => `.kg-${n}-card {\n    display: block;\n}${n === 'audio' || n === 'video' ? `\n\n.kg-${n}-hide {\n    display: none !important;\n}` : ''}${n === 'callout' ? '' : '\n'}`
/** Ghost's four scripted chunks, its stylesheets and its licence as the shell reads them — the licence with CRLF, a trailing
 *  space and two final newlines, which `tidyLicence` tidies. */
const GHOST_CARDS = {
  scripts: Object.fromEntries(['audio', 'gallery', 'toggle', 'video'].map((n) => [n, chunk(n, `(function() {\n    const ${n} = document.querySelectorAll('.kg-${n}-card');\n\n})();\n`)])),
  styles: Object.fromEntries(CSS_NAMES.map((n) => [n, cssChunk(n, cssBody(n))])),
  licence: 'Copyright (c) 2013-2026 Ghost Foundation\r\n\r\nPermission is hereby granted, free of charge. \r\n\r\n',
}

const THEME = { name: 'inflozo-field-notes', version: '1.4.0', description: 'Field Notes' }
const input = (templates: Record<string, ProjectDoc>, over: Partial<CompileInput> = {}): CompileInput => ({
  templates, library: (id) => LIB[id], pack: REFERENCE_PACK, assets: {}, postsPerPage: 12, theme: THEME, pairing: 'D1', fonts: poolFonts, darkEnabled: true,
  modules: { core: CORE }, ghostCards: GHOST_CARDS, ...over,
})
/** The whole compile: every file — a font's bytes too — and AD-14's record. */
const build = (templates: Record<string, ProjectDoc>, over: Partial<CompileInput> = {}): CompiledTheme => compileTheme(doc(), input(templates, over))
/** A compile's TEXT files — every row before Story 7.4 reads templates and stylesheets; the scans below read bytes too. */
const textOf = (files: CompiledTheme['files']): Record<string, string> => Object.fromEntries(Object.entries(files).filter((e): e is [string, string] => typeof e[1] === 'string'))
const compile = (templates: Record<string, ProjectDoc>, over: Partial<CompileInput> = {}) => textOf(build(templates, over).files)

/** The project every matrix row is a slice of, and the tree the whole-output checks below read. */
function project(): Record<string, ProjectDoc> {
  return {
    'default.hbs': docOf(at('a3/1', 'Footer', { content: { note: 'Made by hand' } }), at('a1/1', 'Header')),
    'home.hbs': docOf(
      at('a4/13', 'Latest post', { content: { eyebrow: 'Issue 48' } }),
      at('a17/1', 'Post grid', { isMainFeed: true }),
      at('a22/1', 'Newsletter', { content: NEWS }),
      at('a22/1', 'Hidden one', { content: { heading: 'Never compiled' }, hidden: true }),
    ),
    'tag.hbs': docOf(at('a17/1', 'Tag feed', { isMainFeed: true })),
    'post.hbs': docOf(at('a24/1', 'Post header'), at('a22/1', 'Sign up box', { content: NEWS })),
    'page.hbs': docOf(at('a22/1', 'Gone', { hidden: true })),
  }
}
/** The project's page 2 (Story 7.3): Home's has a feed of its own, so Home's own sections stay in Home's directory. */
const projectTwo = (): Record<string, ProjectDoc> => ({ 'home.hbs': docOf(at('a17/1', 'Older posts', { isMainFeed: true })) })
const compileProject = (over: Partial<CompileInput> = {}) => compile(project(), { pageTwo: projectTwo(), ...over })
/** Home alone, with that page 2 — so its sections are not hoisted beside an `index.hbs` copy of themselves. */
const compileHome = (home: ProjectDoc, over: Partial<CompileInput> = {}) => compile({ 'home.hbs': home }, { pageTwo: projectTwo(), ...over })

// ─── the I/O matrix ───────────────────────────────────────────────────────────────────────────────────────────────

test('a designed Home: the layout line, then each section\'s label and invocation, a blank line between; its own files in its directory, the feed every archive shares in shared/; post-card once', () => {
  const out = compileHome(project()['home.hbs'] as ProjectDoc)
  assert.equal(out['home.hbs'], [
    '{{!< default}}',
    '',
    '{{!-- Latest post · Heroes · Latest Post --}}',
    '{{> "sections/home/latest-post"}}',
    '',
    '{{!-- Post grid · Post Grids · Three Up --}}',
    '{{> "sections/shared/post-grid"}}',
    '',
    '{{!-- Newsletter · Newsletter · Inline Row --}}',
    '{{> "sections/home/newsletter"}}',
    '',
  ].join('\n'))
  assert.deepEqual(Object.keys(out).filter((p) => p.startsWith('partials/sections/home/')), ['partials/sections/home/latest-post.hbs', 'partials/sections/home/newsletter.hbs'])
  assert.equal(Object.keys(out).filter((p) => p === 'partials/post-card.hbs').length, 1)
  assert.match(out['partials/sections/shared/post-grid.hbs'] ?? '', /\{\{#foreach posts\}\}\n {6}\{\{> "post-card"\}\}\n {4}\{\{\/foreach\}\}/)
})

test('a post: the sections sit inside the block its target opens ({{#post}}), inside Ghost\'s article (Story 7.6), each a level in', () => {
  const out = compileProject()
  assert.equal(out['post.hbs'], [
    '{{!< default}}',
    '',
    '{{#post}}',
    `  ${POST_ARTICLE}`,
    '    {{!-- Post header · Post Headers · Centred --}}',
    '    {{> "sections/post/post-header"}}',
    '',
    '    {{!-- Sign up box · Newsletter · Inline Row --}}',
    '    {{> "sections/shared/newsletter"}}',
    '  </article>',
    '{{/post}}',
    '',
  ].join('\n'))
})

test('the site doc: headers before {{{body}}}, A3 footers after it, whatever order the doc stores them in', () => {
  const out = compileProject()
  const body = (out['default.hbs'] ?? '').split('\n')
  const header = body.indexOf('    {{> "sections/default/header"}}')
  const triple = body.indexOf('      {{{body}}}')
  const footer = body.indexOf('    {{> "sections/default/footer"}}')
  assert.ok(header > 0 && header < triple && triple < footer, out['default.hbs'])
  assert.ok((out['default.hbs'] ?? '').indexOf('{{asset "css/screen.css"}}') < (out['default.hbs'] ?? '').indexOf('{{ghost_head}}'), 'the stylesheet comes before ghost_head')
  assert.equal(body[header - 1], '    {{!-- Header · Headers · Rail --}}')
  // no site doc: default.hbs is still emitted, <main> around {{{body}}} and nothing else in the body
  const bare = compile({})
  // Story 7.11: <body>'s class carries the owner's pin after Ghost's (moved on purpose)
  assert.ok((bare['default.hbs'] ?? '').includes(`  ${BODY_LINE}\n    <main id="site-main">\n      {{{body}}}\n    </main>\n\n    {{ghost_foot}}\n  </body>`), bare['default.hbs'])
})

test('slugs collide: Hero, HERO and Héro on one template are hero, hero-2 and hero-3, in position order', () => {
  const heading = (h: string) => ({ content: { heading: h } })
  const out = compileHome(docOf(at('a22/1', 'Hero', heading('a')), at('a22/1', 'HERO', heading('b')), at('a22/1', 'Héro', heading('c'))))
  assert.deepEqual(Object.keys(out).filter((p) => p.startsWith('partials/sections/home/')), ['partials/sections/home/hero-2.hbs', 'partials/sections/home/hero-3.hbs', 'partials/sections/home/hero.hbs'])
  assert.deepEqual([...(out['home.hbs'] ?? '').matchAll(/\{\{> "sections\/home\/([^"]+)"\}\}/g)].map((m) => m[1]), ['hero', 'hero-2', 'hero-3'])
  assert.match(out['home.hbs'] ?? '', /\{\{!-- Héro · Newsletter · Inline Row --\}\}\n\{\{> "sections\/home\/hero-3"\}\}/)
})

test('a slug that comes out empty takes the design\'s name, then the collision rule; the label keeps the layer\'s own name', () => {
  const two = (n: string) => ({ controls: { 'per-row': 'two' }, ...(n === 'main' ? { isMainFeed: true } : {}) })
  const out = compileHome(docOf(at('a17/1', '🌿🌿', two('main')), at('a17/1', 'ニュース', two('second'))))
  assert.deepEqual([...(out['home.hbs'] ?? '').matchAll(/\{\{> "sections\/home\/([^"]+)"\}\}/g)].map((m) => m[1]), ['three-up', 'three-up-2'])
  assert.match(out['home.hbs'] ?? '', /\{\{!-- 🌿🌿 · Post Grids · Three Up --\}\}/)
  assert.match(out['home.hbs'] ?? '', /\{\{!-- ニュース · Post Grids · Three Up --\}\}/)
  // the second is a SECONDARY feed — its own query, never the page's posts
  assert.match(out['partials/sections/home/three-up-2.hbs'] ?? '', /^\{\{#get "posts" limit="12"/)
  // an empty layer name labels the section with the design's name, and slugs from it
  const empty = compile({ 'post.hbs': docOf(at('a24/1', '')) })
  assert.match(empty['post.hbs'] ?? '', /\{\{!-- Centred · Post Headers · Centred --\}\}\n {4}\{\{> "sections\/post\/centred"\}\}/)
})

test('byte-identical sections share one file in shared/, named after the first instance (template, then position); each label keeps its own layer name', () => {
  const out = compileProject()
  assert.ok('partials/sections/shared/newsletter.hbs' in out, Object.keys(out).join(' '))
  assert.ok(!Object.keys(out).some((p) => /sections\/(home|post)\/(newsletter|sign-up-box)/.test(p)))
  assert.match(out['home.hbs'] ?? '', /Newsletter · Newsletter · Inline Row --\}\}\n\{\{> "sections\/shared\/newsletter"\}\}/)
  assert.match(out['post.hbs'] ?? '', /Sign up box · Newsletter · Inline Row --\}\}\n {4}\{\{> "sections\/shared\/newsletter"\}\}/)
  // two on ONE template share a file in its own directory, named for the first
  const one = compileHome(docOf(at('a22/1', 'First', { content: NEWS }), at('a22/1', 'Second', { content: NEWS })))
  assert.deepEqual(Object.keys(one).filter((p) => p.startsWith('partials/sections/home/')), ['partials/sections/home/first.hbs'])
  assert.equal(((one['home.hbs'] ?? '').match(/sections\/home\/first/g) ?? []).length, 2)
})

test('hidden: absent from its template and from partials/; a template whose every instance is hidden is its layout line alone', () => {
  const out = compileProject()
  assert.ok(!Object.values(out).some((t) => t.includes('Never compiled') || t.includes('Hidden one')))
  assert.equal(out['page.hbs'], '{{!< default}}\n')
})

test('a hostile layer name: braces and controls are dropped, and Handlebars 4.7.9 reads the line as one comment and nothing else', () => {
  const hostile = 'x --}}<p id="leak">LEAK</p>{{@site.title}}\u0001\u0003'
  const out = compileHome(docOf(at('a22/1', hostile, { content: NEWS })))
  const line = (out['home.hbs'] ?? '').split('\n').find((l) => l.startsWith('{{!--')) ?? ''
  assert.equal(line, '{{!-- x --<p id="leak">LEAK</p>@site.title · Newsletter · Inline Row --}}')
  const body = Handlebars.parse(line).body
  assert.deepEqual(body.map((s) => s.type), ['CommentStatement'])
  // the control: with the braces left in, the same name ends the comment early and the rest is live Handlebars
  assert.ok(Handlebars.parse(`{{!-- ${hostile.replace(/[\u0000-\u001f]/g, '')} --}}`).body.some((s) => s.type === 'MustacheStatement'))
})

test('(7.7) a layer name holding gscan\'s trigger words reaches its boundary comment inert: one character of each written as its entity, no rule\'s pattern matching (AD-36)', () => {
  const layer = GSCAN_INERT.map((e) => e.witness).join(' ')
  // the control: the name as typed DOES match every pattern, so their absence below is commentPart's doing
  for (const e of GSCAN_INERT) assert.notEqual(layer.search(e.pattern), -1, `${e.rule}: the layer name does not carry its trigger`)
  const line = (compileHome(docOf(at('a22/1', layer, { content: NEWS })))['home.hbs'] ?? '').split('\n').find((l) => l.startsWith('{{!--')) ?? ''
  assert.ok(line.includes('currency&#95;symbol') && line.includes('&#47;assets/brochure.pdf'), line)
  for (const e of GSCAN_INERT) assert.equal(line.search(e.pattern), -1, `${e.rule} still matches the label: ${line}`)
  assert.deepEqual(Handlebars.parse(line).body.map((x) => x.type), ['CommentStatement'])
})

test('hostile user text ships inert in every file: braces as entities, no marker or token, and Handlebars finds the same statements as for benign text', () => {
  const words = ['{{title}}', 'C:\\{{x}}', '{{#if x}}y{{/if}}', `${U0}0${U1}`, `${T0}0${T1}`, '" \' <b>']
  const withText = (heading: string) => compile({ 'home.hbs': docOf(at('a22/1', 'Newsletter', { content: { heading, proof: heading } })), 'default.hbs': docOf(at('a3/1', 'Footer', { content: { note: heading } })) }, { pageTwo: projectTwo() })
  const benign = withText('Plain words')
  for (const w of words) {
    const out = withText(w)
    assert.deepEqual(Object.keys(out), Object.keys(benign))
    for (const [path, body] of Object.entries(out)) {
      assert.ok(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body), `${path}: a control character for ${JSON.stringify(w)}`)
      if (!path.endsWith('.hbs')) continue
      assert.deepEqual(statements(body), statements(benign[path] ?? ''), `${path}: ${JSON.stringify(w)} changed what Handlebars reads`)
    }
    assert.ok(!/\{\{(title|x|#if x)/.test(out['partials/sections/home/newsletter.hbs'] ?? ''), `${JSON.stringify(w)} reached the theme live`)
  }
  assert.match(withText('{{title}}')['partials/sections/home/newsletter.hbs'] ?? '', /&#123;&#123;title&#125;&#125;/)
})

test('the formatting contract inside a compiled section: a long start tag breaks, a short one stays, a long value stays whole, raw text is byte for byte', () => {
  const out = compileProject()
  const news = out['partials/sections/shared/newsletter.hbs'] ?? ''
  assert.ok(news.startsWith('<section\n  class="a22-1"\n  data-align="center"\n'), news)
  assert.ok(news.includes('  data-divider="none">\n  <h2 class="a22-1__heading">One letter a week</h2>'), news)
  // rich text through the ONE shared UserText keeps the marks its own category allows (the def is captured at put)
  assert.ok(news.includes('<p class="a22-1__proof">Join <strong>us</strong> today</p>'), news)
  const hero = out['partials/sections/home/latest-post.hbs'] ?? ''
  assert.match(hero, /\n {14}<img\n {16}class="a4-13__picture"\n/)
  assert.match(hero, /\n {16}srcset="\{\{img_url feature_image size="xs" format="webp"\}\} 150w, [^\n]* 2000w">\n/)
  // the <pre> and <textarea> inside a re-indented {{#get}} body keep their own lines exactly
  assert.ok(hero.includes('<pre class="a4-13__rule">*\n   *  *</pre>'), hero)
  assert.ok(hero.includes('<textarea class="a4-13__box" aria-hidden="true">-\n      -</textarea>'), hero)
  // two spaces a level, and no blank line inside any section or partial
  for (const [path, body] of Object.entries(out)) {
    if (!path.startsWith('partials/')) continue
    const lines = body.replace(/<(pre|textarea)[^]*?<\/\1>/g, '<$1>').split('\n')
    assert.ok(lines.slice(0, -1).every((l) => l !== '' && /^( {2})*\S/.test(l)), `${path}: a blank line, or an odd indent`)
  }
})

test('one design, many placements: post-card is written once; two different bodies under one data-partial name throw, naming both designs', () => {
  const out = compileProject()
  assert.ok(out['partials/post-card.hbs']?.startsWith('<li class="a17-1__cell">'))
  const other = design('a17/2', 'Other', { compileTarget: ['tag.hbs'], bindingContext: ['posts'], html: '<section class="a17-2"><ul><li class="a17-2__cell" data-repeat="posts" data-partial="post-card"><b data-bind="title">t</b></li></ul></section>' })
  assert.throws(
    () => compile({ 'home.hbs': docOf(at('a17/1', 'Grid', { isMainFeed: true })), 'tag.hbs': docOf(at('a17/2', 'Other', { isMainFeed: true })) }, { library: (id) => (id === 'a17/2' ? other : LIB[id]) }),
    /partials\/post-card\.hbs: a17\/1 and a17\/2 both declare data-partial "post-card"/,
  )
})

test('(review) the compile\'s other inputs may carry no C0 character — a string, an asset URL or the pack\'s CSS — since the formatter\'s own marks are C0 (AD-36)', () => {
  const templates = project()
  assert.throws(() => compile(templates, { strings: { 'pagination.older': `x${String.fromCharCode(5)}y` } }), /a string carries a control character/)
  assert.throws(() => compile(templates, { assets: { pic: `https://x/\u0005` } }), /an asset URL carries a control character/)
  // the control: the same inputs without the character compile
  assert.doesNotThrow(() => compile(templates, { strings: { 'pagination.older': 'xy' }, assets: { pic: 'https://x/' } }))
})

test('(review) a stylesheet header part cannot close the comment early: `*\/` is dropped until none re-forms', () => {
  const templates = project()
  const lib: Record<string, SectionRegistryEntry> = { ...LIB, 'a22/1': { ...(LIB['a22/1'] as SectionRegistryEntry), name: 'Inline **// Row */*/' } }
  const css = compile(templates, { library: (id) => lib[id] })['assets/css/screen.css'] as string
  assert.ok(!/Inline \*\*\/\/ Row|\*\/\*\//.test(css), css)
  assert.match(css, /\/\* Newsletter · Inline Row \*\//)
})

test('every refusal names its file and its layer', () => {
  assert.throws(() => compile({ 'home.hbs': docOf(at('a99/1', 'Mystery')) }), /^Error: home\.hbs · Mystery: the library holds no design "a99\/1"/)
  assert.throws(() => compile({ 'home.hbs': docOf(at('a24/1', 'Post header')) }), /^Error: home\.hbs · Post header: a24\/1 compiles to post\.hbs, page\.hbs, never to home\.hbs/)
  // a page-2 section is named as page 2's
  assert.throws(() => compile({}, { pageTwo: { 'tag.hbs': docOf(at('a22/1', 'Box')) } }), /^Error: tag\.hbs \(page 2\) · Box: a22\/1 compiles to home\.hbs, page\.hbs, post\.hbs, custom-\{name\}\.hbs, never to tag\.hbs/)
  assert.throws(() => compile({ 'about.hbs': docOf() }), /about\.hbs: this compile writes no such template — the legal files are default\.hbs, home\.hbs[^]*custom-\{name\}\.hbs/)
  // a renderer refusal (R-7) is rethrown with its place in front of the runtime's own sentence — a pager on a design that is
  // no FEED, since a feed off a paginated page is a secondary feed whose pager is never rendered (Story 7.16c)
  const paged = design('a17/3', 'Paged', { compileTarget: ['home.hbs', 'post.hbs'], bindingContext: ['none'], html: '<section class="a17-3"><nav class="a17-3__pager"><a class="a17-3__next" data-pagination="next" href="#" data-t="pagination.older">Older</a></nav></section>' })
  assert.throws(() => compile({ 'post.hbs': docOf(at('a17/3', 'Pager')) }, { library: (id) => (id === 'a17/3' ? paged : LIB[id]) }), /^Error: post\.hbs · Pager: data-pagination restricts this design to a paginated target \(R-7\)/)
})

test('the stylesheet: the token block first, then each placed design\'s stylesheet once, in design order, under its header, and no other comment', () => {
  const css = compile(project())['assets/css/screen.css'] ?? ''
  const headers = [...css.matchAll(/\/\*[^]*?\*\//g)].map((m) => m[0])
  assert.deepEqual(headers, ['/* Tokens */', '/* Base */', '/* Headers · Rail */', '/* Footers · Columns */', '/* Heroes · Latest Post */', '/* Post Grids · Three Up */', '/* Newsletter · Inline Row */', '/* Post Headers · Centred */'])
  assert.ok(css.startsWith('/* Tokens */\n:root {'), css.slice(0, 80))
  assert.ok(!/[ \t]$/m.test(css) && !/\n\n\n/.test(css) && css.endsWith('}\n') && !css.endsWith('\n\n'), 'trailing whitespace, a double blank line or a bad ending')
  assert.equal((css.match(/\.a22-1 \{/g) ?? []).length, 1, 'a design placed three times ships its stylesheet once')
})

// ─── what the compiler promises, over EVERY file ────────────────────────────────────────────────────────────────────

/** The text the fingerprint scan reads: `package.json` without its three named marks — FR-J10's `name`, the ruled
 *  `author` and FR-J13's marker — a locale file without its `credit.*` keys (Story 7.12: the catalog's locked credit, S7,
 *  each held equal to the catalog's own words), and every other file whole. */
function unmarked(path: string, body: string): string {
  if (/^locales\/[^/]+\.json$/.test(path)) {
    const rest = JSON.parse(body) as Record<string, string>
    for (const key of Object.keys(rest).filter((k) => k.startsWith('credit.'))) {
      assert.equal(rest[key], CATALOG.keys[key]?.en, `${path}: ${key} is the catalog's own words`)
      delete rest[key]
    }
    return JSON.stringify(rest, null, 2)
  }
  if (path !== 'package.json') return body
  const rest = JSON.parse(body) as Record<string, unknown>
  for (const mark of THEME_MARKS) delete rest[mark]
  return JSON.stringify(rest, null, 2)
}

test('(7.2) the fingerprint scan reads package.json with its three named marks removed, and nothing else removed', () => {
  const clean = compile(project())['package.json'] as string
  // the control: the marks are really there, so their absence from the scan is the removal's doing
  assert.match(clean, /inflozo/i)
  assert.doesNotMatch(unmarked('package.json', clean), /inflozo/i)
  const named = compile(project(), { theme: { ...THEME, description: 'Inflozo pilots' } })['package.json'] as string
  assert.match(unmarked('package.json', named), /inflozo/i, 'the builder\'s name in the description is caught')
})

/** What Handlebars reads in a file: every statement but the literal text, by kind and path, nested as it nests. */
function statements(text: string): string[] {
  type Node = { type: string; path?: { original?: unknown }; name?: { original?: unknown }; program?: { body: Node[] }; inverse?: { body: Node[] } }
  const out: string[] = []
  const walk = (nodes: readonly Node[], depth: number) => {
    for (const n of nodes) {
      if (n.type === 'ContentStatement') continue
      out.push(`${'  '.repeat(depth)}${n.type} ${String(n.path?.original ?? n.name?.original ?? '')}`)
      if (n.program !== undefined) walk(n.program.body, depth + 1)
      if (n.inverse !== undefined) walk(n.inverse.body, depth + 1)
    }
  }
  walk(Handlebars.parse(text).body as unknown as Node[], 0)
  return out
}

test('over every emitted file: it parses under Handlebars 4.7.9, carries one {{{body}}} and, with a paywall, {{{html}}} as its first line — no other triple-stash — no token, no stray comment, no fingerprint', () => {
  const templates = { ...project(), [PAYWALL_TARGET]: docOf(at('a32/1', 'Paywall')) }
  // Story 7.5: a designed toggle, so cards.js and Ghost's licence are read beside main.js and README.md — Story 7.13: and
  // cards.css with Ghost's block and this theme's rules, a divider's glyph and Tabler's licence among them
  const files = build(templates, { pageTwo: projectTwo(), cardDesigns: { toggle: { chevron: 'left' }, divider: { glyph: 'on' } } }).files
  // Story 7.4: a font is bytes, never text, so the text scans skip it — and the skip is not vacuous: the fonts are there
  const bytes = Object.entries(files).filter(([, b]) => b instanceof Uint8Array).map(([p]) => p)
  assert.ok(bytes.length > 0 && bytes.every((p) => /^assets\/fonts\/[a-z0-9-]+\.woff2$/.test(p)), bytes.join(' '))
  const out = textOf(files)
  assert.deepEqual(Object.keys(out).length + bytes.length, Object.keys(files).length)
  assert.ok(Object.keys(out).some((p) => p.startsWith('LICENSE-')), 'the licences are read as text, and meet rule 1')
  for (const p of ['assets/js/main.js', 'assets/js/cards.js', 'assets/css/cards.css', 'LICENSE-ghost.txt', 'LICENSE-tabler.txt', 'README.md']) assert.ok(p in out, `${p} is read by the scan`)
  const instanceIds = Object.values(templates).flatMap((d) => d.instances.map((i) => i.instanceId))
  let triples = 0
  for (const [path, body] of Object.entries(out)) {
    assert.ok(!/[\u0000-\u001f]/.test(body.replace(/\n/g, '')), `${path}: a control character`)
    assert.ok(!/inflozo/i.test(unmarked(path, body)) && !body.includes('data-inflozo-'), `${path}: the builder's name`)
    for (const id of instanceIds) assert.ok(!body.includes(id), `${path}: the instance id ${id}`)
    assert.ok(!/\b(DW|AD|FR|NFR|R)-\d+\b|Story \d|ponytail/.test(body), `${path}: an internal reference`)
    assert.ok(!/generated by|built with/i.test(unmarked(path, body)), `${path}: a generator line`)
    assert.ok(!CONSUMED_DIRECTIVE_RE.test(body), `${path}: a consumed directive survived`)
    assert.ok(body.endsWith('\n') && !body.endsWith('\n\n') && !/\r|\t|[ ]$/m.test(body), `${path}: rule 1`)
    if (!path.endsWith('.hbs')) continue
    assert.doesNotThrow(() => Handlebars.parse(body), path)
    triples += (body.match(/\{\{\{/g) ?? []).length
    assert.equal((body.match(/\{\{\{/g) ?? []).length, (body.match(/\}\}\}/g) ?? []).length, path)
    for (const line of body.split('\n')) {
      if (line.includes('{{!--')) assert.match(line, /^ *\{\{!-- [^{}]* · [^{}]* · [^{}]* --\}\}$/, `${path}: a comment that is no boundary label`)
    }
  }
  // AD-5: {{{body}}} in default.hbs, and its second exception, {{{html}}} as the paywall's first line (Question 2, ruled)
  assert.equal(triples, 2)
  assert.match(out['default.hbs'] ?? '', /^ {6}\{\{\{body\}\}\}$/m)
  assert.ok(out[PAYWALL_TARGET]?.startsWith('{{{html}}}\n'), out[PAYWALL_TARGET])
  // every partial is referenced, by a file that is not itself — the paywall's by Ghost's own {{content}}, and by no file
  for (const path of Object.keys(out).filter((p) => p.startsWith('partials/') && p !== PAYWALL_TARGET)) {
    const name = path.slice('partials/'.length, -'.hbs'.length)
    assert.ok(Object.entries(out).some(([p, b]) => p !== path && b.includes(`{{> "${name}"}}`)), `${path} is referenced by no file`)
  }
})

test('determinism: the same input, its templates and every object\'s keys in another order, gives the same bytes', () => {
  const reverse = <T>(o: Record<string, T>): Record<string, T> => Object.fromEntries(Object.entries(o).reverse())
  const shuffled = Object.fromEntries(Object.entries(project()).reverse().map(([file, d]) => [file, {
    schemaVersion: d.schemaVersion,
    instances: d.instances.map((i) => reverse({ ...i, content: reverse(i.content), controls: reverse(i.controls) }) as unknown as DocInstance),
  }]))
  const cards = { video: { play: 'large', bar: 'light' }, toggle: { chevron: 'left' }, header: { height: 'generous' }, bookmark: { side: 'left' } }
  const a = build(project(), { cardDesigns: cards })
  const b = build(shuffled as Record<string, ProjectDoc>, {
    assets: reverse({ x: '/x', y: '/y' }), theme: reverse(THEME) as typeof THEME, cardDesigns: reverse(Object.fromEntries(Object.entries(cards).map(([k, v]) => [k, reverse(v)]))),
    ghostCards: { ...GHOST_CARDS, styles: reverse(GHOST_CARDS.styles) },
  })
  assert.deepEqual(Object.keys(b.files), Object.keys(a.files))
  assert.deepEqual(Object.keys(a.files), [...Object.keys(a.files)].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)), 'code-unit path order')
  // Story 7.4: `deepEqual`, so a font's bytes are compared by content, never by identity
  for (const k of Object.keys(a.files)) assert.deepEqual(b.files[k], a.files[k], k)
  assert.deepEqual(b.css, a.css)
})

// ─── Story 7.2: package.json ──────────────────────────────────────────────────────────────────────────────────────

const pkgOf = (over: Partial<CompileInput> = {}): string => compile({}, over)['package.json'] as string
/** The value posts_per_page takes from a JavaScript caller, which the type does not stop. */
const anyValue = (v: unknown) => v as number

test('(7.2) a project: package.json is the spec\'s text — Casper\'s key order, engines.ghost and no ghost-api, the ruled author, card_assets true with no designed card, custom the three dark built-ins (7.11), the marker last', () => {
  const sizes = Object.entries(IMAGE_SIZES).map(([k, w]) => `      "${k}": {\n        "width": ${w}\n      }`).join(',\n')
  assert.equal(pkgOf(), [
    '{',
    '  "name": "inflozo-field-notes",',
    '  "description": "Field Notes",',
    '  "version": "1.4.0",',
    '  "engines": {',
    '    "ghost": ">=5.0.0"',
    '  },',
    '  "author": {',
    '    "name": "Inflozo",',
    '    "email": "hello@inflozo.com"',
    '  },',
    '  "keywords": [',
    '    "ghost-theme"',
    '  ],',
    '  "config": {',
    '    "posts_per_page": 12,',
    '    "image_sizes": {',
    sizes,
    '    },',
    '    "card_assets": true,',
    // Story 7.11 (moved on purpose): the three dark built-ins on every project, a Light + Dark one starting on Auto
    '    "custom": {',
    '      "color_scheme": {',
    '        "type": "select",',
    '        "options": [',
    '          "Auto",',
    '          "Light",',
    '          "Dark"',
    '        ],',
    '        "default": "Auto"',
    '      },',
    '      "dark_accent_color": {',
    '        "type": "color",',
    `        "default": "${REFERENCE_PACK.dark.accent}"`,
    '      },',
    '      "dark_logo": {',
    '        "type": "image"',
    '      }',
    '    }',
    '  },',
    '  "inflozo": true',
    '}',
    '',
  ].join('\n'))
  const parsed = JSON.parse(pkgOf()) as { engines: Record<string, string>; config: Record<string, unknown> }
  assert.deepEqual(Object.keys(parsed.engines), ['ghost'])
  assert.ok(!('license' in parsed), 'FR-J2 names no license')
  assert.deepEqual(Object.keys(parsed.config['custom'] as object), ['color_scheme', 'dark_accent_color', 'dark_logo'], 'custom is the three built-ins with no user setting')
  assert.equal(Object.keys(parsed).at(-1), THEME_MARKER)
})

test('(7.2, 7.13) designed cards: card_assets excludes their Ghost chunks, sorted in code-unit order, each name once — the header card both of its two', () => {
  const pkg = JSON.parse(pkgOf({ cardDesigns: { toggle: { chevron: 'left' }, header: { height: 'generous' } } })) as { config: { card_assets: unknown } }
  assert.deepEqual(pkg.config.card_assets, { exclude: ['header', 'header_v2', 'toggle'] })
})

test('(7.13) a stored record card_designs\' schema refuses — an unknown card, control or value, a colour control on a no-colour card, a non-object — stops the build with parseCardDesigns\' sentence; the control: its legal neighbour compiles', () => {
  assert.doesNotThrow(() => pkgOf({ cardDesigns: { callout: { emoji: 'off' } } }))
  for (const raw of ['callout', [], { nft: { x: 'y' } }, { callout: { radius: 'large' } }, { callout: { emoji: 'hidden' } }, { signup: { background: 'tint' } }, { divider: { icon: 'no-such-icon' } }]) {
    assert.throws(() => pkgOf({ cardDesigns: raw }), (e: Error) => e.message.startsWith('card designs: The card designs ') && e.message.includes('so none of them was read.'), JSON.stringify(raw))
  }
})

test('(7.2) a page size given as text or a fraction is written as the integer, a JSON number', () => {
  for (const v of ['12', 12.9]) assert.match(pkgOf({ postsPerPage: anyValue(v) }), /\n {4}"posts_per_page": 12,\n/, String(v))
})

test('(7.2) a page size that is no page size is refused, naming the value', () => {
  // `true` and `[12]` are the JavaScript values `Number` would quietly read as 1 and 12
  for (const [v, named] of [[0, '0'], [-3, '-3'], [NaN, 'NaN'], ['twelve', '"twelve"'], [Infinity, 'Infinity'], [true, 'true'], [[12], '12']] as const) {
    assert.throws(() => pkgOf({ postsPerPage: anyValue(v) }), (e: Error) => e.message.startsWith(`package.json: posts_per_page ${named} is no page size`) && e.message.includes('GS010-PJ-CONF-PPP-INT'), named)
  }
})

test('(7.2) a name Ghost\'s checker refuses is refused, naming the pattern; a version that is not plain semver is refused', () => {
  for (const name of ['Field Notes', 'inflozo--x', 'x-', 'Inflozo-x']) {
    assert.throws(() => pkgOf({ theme: { ...THEME, name } }), (e: Error) => e.message.startsWith('package.json: the theme name') && e.message.includes('^([a-z0-9]+-)*[a-z0-9]+$'), name)
  }
  for (const version of ['1.0', 'v1.0.0', '01.0.0', '1.0.0-beta']) {
    assert.throws(() => pkgOf({ theme: { ...THEME, version } }), /^Error: package\.json: the theme version .* MAJOR\.MINOR\.PATCH/, version)
  }
  // the control: the spec's own name and version, and a zero part, compile
  assert.doesNotThrow(() => pkgOf({ theme: { ...THEME, name: 'inflozo-x-2', version: '0.10.0' } }))
})

test('(7.2) hostile words in the description: the file parses and gives back the exact string, and carries no raw control character', () => {
  const description = 'A "quote", a back\\slash, a line\nbreak, \u0005 and {{title}}'
  const pkg = pkgOf({ theme: { ...THEME, description } })
  assert.equal((JSON.parse(pkg) as { description: string }).description, description)
  assert.ok(!/[\u0000-\u0009\u000b-\u001f]/.test(pkg) && pkg.split('\n').length === pkgOf().split('\n').length, 'a raw control character, or a broken line')
})

test('(7.2) the size check: a size that is no key — quoted or not — is refused naming the file and the keys; comments are not read', () => {
  const keys = Object.keys(IMAGE_SIZES).join(', ')
  assert.throws(() => checkSizes({ 'partials/x.hbs': '<img src="{{img_url x size="huge"}}">\n' }), (e: Error) => e.message.startsWith('partials/x.hbs: size="huge"') && e.message.endsWith(`${keys}.`))
  assert.throws(() => checkSizes({ 'post.hbs': '<img src="{{img_url x size=m}}">\n' }), /^Error: post\.hbs: size=m is no image size/)
  // a single-quoted key is Handlebars-legal but not the spec's spelling, and the message says double quotes
  assert.throws(() => checkSizes({ 'post.hbs': "<img src=\"{{img_url x size='m'}}\">\n" }), /size='m' is no image size.*in double quotes/)
  // the control: a key passes, and so do a size in a comment, an HTML attribute and a non-template file
  assert.doesNotThrow(() => checkSizes({
    'home.hbs': '{{!-- size="huge" · x · y --}}\n{{! size=huge }}\n<img src="{{img_url x size="m"}}" data-headline-size="huge" size="9">\n',
    'assets/css/screen.css': '/* {{img_url x size="huge"}} */\n',
  }))
})

test('(7.2) a layer named size="huge" compiles — it reaches a boundary comment, which is not read; a customer typing it compiles too', () => {
  const out = compile({ 'home.hbs': docOf(at('a22/1', 'size="huge"', { content: { heading: 'size="huge" and {{img_url x size="huge"}}' } })) })
  assert.match(out['home.hbs'] ?? '', /\{\{!-- size="huge" · Newsletter · Inline Row --\}\}/)
  // the control: the same words in a live mustache are refused
  assert.throws(() => checkSizes({ 'home.hbs': out['home.hbs']?.replace('{{!-- size="huge"', '{{img_url x size="huge"}} {{!--') ?? '' }), /size="huge" is no image size/)
})

// ─── Story 7.3: every standard template, synthesized where untouched ──────────────────────────────────────────────────

const lib = (id: string) => LIB[id]
/** A library the extra designs join: A31 #1, which the real library does not hold yet (Story 10.104). */
const withError = (id: string) => (id === 'a31/1' ? design('a31/1', 'Plain', { compileTarget: ['error.hbs'], bindingContext: ['error'], contentSchema: { title: text('Title') }, html: '<section class="a31-1">\n  <h1 class="a31-1__title" data-prop="title" data-empty="hide">Not found</h1>\n</section>' }) : LIB[id])
/** The library as it stands for `page.hbs`: A24 #1 on `post.hbs` alone (DW-191), so nothing synthesizes onto a Page. */
const postOnlyHeader = (id: string) => (id === 'a24/1' ? { ...(LIB['a24/1'] as SectionRegistryEntry), compileTarget: ['post.hbs'] } : LIB[id])
const sectionsOf = (text: string | undefined): string[] => [...(text ?? '').matchAll(/\{\{> "(sections\/[^"]+)"\}\}/g)].map((m) => m[1] as string)
const asDoc = (instances: readonly DocInstance[]): ProjectDoc => docOf(...instances)

test('(7.3) the bare compile: default, index, post, tag and author always; page.hbs where synthesis gives it a section; no home, custom, private or paywall file', () => {
  const out = compile({})
  assert.deepEqual(Object.keys(out).filter((p) => p.endsWith('.hbs') && !p.startsWith('partials/')), ['author.hbs', 'default.hbs', 'index.hbs', 'page.hbs', 'post.hbs', 'tag.hbs'])
  assert.ok(!Object.keys(out).some((p) => /^(home|private|error)\.hbs$|^custom-|content-cta/.test(p)), Object.keys(out).join(' '))
  // Question 1, ruled option 1: an untouched page.hbs or error.hbs the library leaves with no section is not emitted
  const today = compile({}, { library: postOnlyHeader })
  assert.ok(!('page.hbs' in today) && !('error.hbs' in today))
  // the control: a library that fills error.hbs emits it
  assert.match(compile({}, { library: withError })['error.hbs'] ?? '', /^\{\{!< default\}\}\n\n\{\{!-- Error message · Error Pages · Plain --\}\}\n\{\{> "sections\/error\/error-message"\}\}\n$/)
})

test('(7.3) an untouched file holds exactly its synthesize or pageTwoStack stack, in order, with designate\'s flags', () => {
  const out = compile({})
  for (const file of ['post.hbs', 'tag.hbs', 'author.hbs', 'page.hbs']) {
    const given = compile({ [file]: asDoc(synthesize(file, lib).instances) })
    assert.equal(out[file], given[file], file)
  }
  // index.hbs is pageTwoStack's for an untouched Home: the stack synthesized for index.hbs
  const given = compile({}, { pageTwo: { 'home.hbs': asDoc(pageTwoStack('home.hbs', undefined, undefined, lib).instances) } })
  assert.equal(out['index.hbs'], given['index.hbs'])
  // the synthesized feed is the MAIN feed: it lists the page's own posts, never a query of its own
  assert.match(out['partials/sections/shared/post-grid.hbs'] ?? '', /^<section[^]*\{\{#foreach posts\}\}/)
  assert.ok(!(out['partials/sections/shared/post-grid.hbs'] ?? '').includes('{{#get'))
})

test('(7.3) Home designed, page 2 following: home.hbs from the doc, index.hbs its exact copy, so the sections hoist to shared/', () => {
  const out = compile({ 'home.hbs': project()['home.hbs'] as ProjectDoc })
  assert.equal(out['index.hbs'], out['home.hbs'])
  assert.deepEqual(sectionsOf(out['home.hbs']), ['sections/shared/latest-post', 'sections/shared/post-grid', 'sections/shared/newsletter'])
})

test('(7.3) Home\'s page 2 designed: index.hbs from page 2; home.hbs from Home\'s doc, or its default stack when Home is untouched', () => {
  const two = { 'home.hbs': docOf(at('a22/1', 'Letter', { content: NEWS }), at('a17/1', 'Archive', { isMainFeed: true, controls: { 'per-row': 'two' } })) }
  const designed = compile({ 'home.hbs': docOf(at('a4/13', 'Latest', { content: { eyebrow: 'Now' } }), at('a17/1', 'Grid', { isMainFeed: true })) }, { pageTwo: two })
  assert.deepEqual(sectionsOf(designed['index.hbs']), ['sections/index/letter', 'sections/index/archive'])
  assert.deepEqual(sectionsOf(designed['home.hbs']), ['sections/home/latest', 'sections/shared/post-grid'])
  const untouched = compile({}, { pageTwo: two })
  assert.equal(untouched['home.hbs'], compile({ 'home.hbs': asDoc(synthesize('home.hbs', lib).instances) })['home.hbs'], 'Home is its default stack')
  assert.deepEqual(sectionsOf(untouched['index.hbs']), sectionsOf(designed['index.hbs']))
})

test('(7.3) a Home with no main feed: page 2 following is the default stack (R-127)', () => {
  const out = compile({ 'home.hbs': docOf(at('a22/1', 'Letter', { content: NEWS })) })
  assert.equal(out['index.hbs'], compile({})['index.hbs'])
  assert.deepEqual(sectionsOf(out['home.hbs']), ['sections/home/letter'])
})

test('(7.3) an archive\'s page 2 designed: page 2 inside {{#is "paged"}}, page 1 in its {{else}} — page 1 designed or untouched', () => {
  const pageTwo = { 'tag.hbs': docOf(at('a17/1', 'Post grid', { isMainFeed: true, controls: { 'per-row': 'two' } })) }
  const untouched = compile({}, { pageTwo })
  assert.equal(untouched['tag.hbs'], [
    '{{!< default}}',
    '',
    '{{#is "paged"}}',
    '  {{!-- Post grid · Post Grids · Three Up --}}',
    '  {{> "sections/tag/post-grid"}}',
    '{{else}}',
    '  {{!-- Post grid · Post Grids · Three Up --}}',
    '  {{> "sections/shared/post-grid"}}',
    '{{/is}}',
    '',
  ].join('\n'))
  assert.match(untouched['partials/sections/tag/post-grid.hbs'] ?? '', /data-per-row="two"/)
  const designed = compile({ 'tag.hbs': docOf(at('a17/1', 'Tag feed', { isMainFeed: true, controls: { 'per-row': 'three' } })) }, { pageTwo })
  assert.match(designed['tag.hbs'] ?? '', /^\{\{!< default\}\}\n\n\{\{#is "paged"\}\}\n {2}[^]*"sections\/tag\/post-grid"[^]*\n\{\{else\}\}\n {2}\{\{!-- Tag feed · [^]*\n\{\{\/is\}\}\n$/)
})

test('(7.3) an archive\'s page 2 following page 1: page 1 alone, with no {{#is}}', () => {
  const out = compile({ 'author.hbs': docOf(at('a17/1', 'Writer feed', { isMainFeed: true, controls: { 'per-row': 'two' } })) })
  assert.equal(out['author.hbs'], '{{!< default}}\n\n{{!-- Writer feed · Post Grids · Three Up --}}\n{{> "sections/author/writer-feed"}}\n')
  for (const [path, body] of Object.entries(compile({}))) assert.ok(!body.includes('{{#is'), `${path}: an {{#is}} with no page 2 designed`)
})

const GUARD = (contexts: string) => `    {{#is "paged"}}\n      {{#is "${contexts}"}}\n        <meta name="robots" content="noindex">\n      {{/is}}\n    {{/is}}\n    {{ghost_head}}`

test('(7.3) FR-H2\'s guard: noindex in default.hbs\'s head for exactly the page 2s with no visible feed, in the order index, tag, author — and no canonical link', () => {
  const hiddenFeed = (name: string) => docOf(at('a17/1', name, { hidden: true, isMainFeed: true }))
  // a Tag page 1 with no visible feed, page 2 following; an Author page 2 of its own with none; Home's page 2 with none
  const out = compile({ 'tag.hbs': hiddenFeed('Tag feed') }, { pageTwo: { 'author.hbs': hiddenFeed('Writer feed'), 'home.hbs': docOf(at('a22/1', 'Letter', { content: NEWS })) } })
  // Story 7.5: main.js's tag sits between the stylesheet and the guard
  assert.ok((out['default.hbs'] ?? '').includes(`<link rel="stylesheet" href="{{asset "css/screen.css"}}">\n    ${MAIN_JS_TAG}\n${GUARD('index, tag, author')}`), out['default.hbs'])
  assert.equal(((out['default.hbs'] ?? '').match(/noindex/g) ?? []).length, 1)
  // one of them: the Author page 2 alone
  assert.ok((compile({}, { pageTwo: { 'author.hbs': hiddenFeed('Writer feed') } })['default.hbs'] ?? '').includes(GUARD('author')))
  // the control: every page 2 with a visible feed carries no block at all
  const none = compile({}, { pageTwo: { 'author.hbs': docOf(at('a17/1', 'Writer feed', { isMainFeed: true })) } })
  assert.ok(!(none['default.hbs'] ?? '').includes('{{#is') && !(none['default.hbs'] ?? '').includes('noindex'), none['default.hbs'])
  for (const o of [out, none]) assert.ok(!Object.values(o).some((b) => /rel="canonical"/.test(b)), 'the theme writes no canonical link of its own')
})

test('(7.18b) `noindex` is the guard\'s own contexts, deduped and in its order: a feed-less Tag names `tag`; a theme with every feed names none — the control', () => {
  const hiddenFeed = (name: string) => docOf(at('a17/1', name, { hidden: true, isMainFeed: true }))
  const feedless = build({ 'tag.hbs': hiddenFeed('Tag feed') }, { pageTwo: { 'home.hbs': docOf(at('a17/1', 'Home two', { isMainFeed: true })) } })
  assert.deepEqual(feedless.noindex, ['tag'])
  assert.ok((feedless.files['default.hbs'] as string).includes(GUARD('tag')), 'the guard and the record are one fact')
  const every = build({}, { pageTwo: { 'home.hbs': docOf(at('a17/1', 'Home two', { isMainFeed: true })), 'author.hbs': docOf(at('a17/1', 'Writer feed', { isMainFeed: true })) } })
  assert.deepEqual(every.noindex, [])
  assert.ok(!(every.files['default.hbs'] as string).includes('noindex'))
})

test('(7.3) <main id="site-main"> appears once, wrapping {{{body}}} alone', () => {
  const out = compileProject()['default.hbs'] ?? ''
  assert.equal((out.match(/<main\b/g) ?? []).length, 1)
  assert.match(out, /\n {4}<main id="site-main">\n {6}\{\{\{body\}\}\}\n {4}<\/main>\n/)
  assert.ok(out.indexOf('sections/default/header') < out.indexOf('<main') && out.indexOf('</main>') < out.indexOf('sections/default/footer'), 'the header and footer sit outside it')
})

test('(7.3) two main-feed flags compile with designate\'s repair: one main feed, the first visible one', () => {
  const out = compileHome(docOf(at('a17/1', 'Hidden grid', { hidden: true, isMainFeed: true }), at('a17/1', 'First', { isMainFeed: true, controls: { 'per-row': 'two' } }), at('a17/1', 'Second', { isMainFeed: true, controls: { 'per-row': 'two' } })))
  assert.match(out['partials/sections/home/first.hbs'] ?? '', /\{\{#foreach posts\}\}/)
  assert.ok(!(out['partials/sections/home/first.hbs'] ?? '').includes('{{#get'), 'the first visible flagged feed is the main feed')
  assert.match(out['partials/sections/home/second.hbs'] ?? '', /^\{\{#get "posts" limit="12"/, 'the second is a secondary feed')
})

test('(7.3) a Page with a Post header: the A24 invocation inside the @page switch, the other not; the same A24 on post.hbs never guarded', () => {
  const out = compile({ 'page.hbs': docOf(at('a24/1', 'Page header'), at('a22/1', 'Page box', { content: NEWS })), 'post.hbs': docOf(at('a24/1', 'Post header')) })
  assert.equal(out['page.hbs'], [
    '{{!< default}}',
    '',
    '{{#post}}',
    `  ${POST_ARTICLE}`,
    '    {{#if @page.show_title_and_feature_image}}',
    '      {{!-- Page header · Post Headers · Centred --}}',
    '      {{> "sections/shared/page-header"}}',
    '    {{/if}}',
    '',
    '    {{!-- Page box · Newsletter · Inline Row --}}',
    '    {{> "sections/page/page-box"}}',
    '  </article>',
    '{{/post}}',
    '',
  ].join('\n'))
  for (const [path, body] of Object.entries(out)) {
    if (path !== 'page.hbs') assert.ok(!body.includes('@page'), `${path}: guarded`)
  }
  // two A24s: each is guarded
  const twice = compile({ 'page.hbs': docOf(at('a24/1', 'One'), at('a24/1', 'Two', { controls: { byline: 'off' } })) })['page.hbs'] ?? ''
  assert.equal((twice.match(/\{\{#if @page\.show_title_and_feature_image\}\}/g) ?? []).length, 2)
})

test('(7.3) a membership page: custom-signup.hbs at the root, its sections inside {{#post}}; no route file', () => {
  const out = compile({ 'custom-signup.hbs': docOf(at('a30/1', 'Join card')) })
  assert.equal(out['custom-signup.hbs'], `{{!< default}}\n\n{{#post}}\n  ${POST_ARTICLE}\n    {{!-- Join card · Members Pages · Card --}}\n    {{> "sections/custom-signup/join-card"}}\n  </article>\n{{/post}}\n`)
  assert.ok(!Object.keys(out).some((p) => p.endsWith('.yaml') || p.startsWith('members/') || p.startsWith('page-')), Object.keys(out).join(' '))
})

test('(7.3) an emptied or untouched custom, private or paywall file is not emitted; a routed custom template is its layout line alone', () => {
  const empty = compile({ 'custom-signup.hbs': docOf(), 'private.hbs': docOf(), [PAYWALL_TARGET]: docOf() })
  assert.ok(!Object.keys(empty).some((p) => /^custom-|^private\.hbs$|content-cta/.test(p)), Object.keys(empty).join(' '))
  for (const templates of [{}, { 'custom-landing.hbs': docOf() }] as Record<string, ProjectDoc>[]) {
    assert.equal(compile(templates, { routed: ['custom-landing.hbs'] })['custom-landing.hbs'], '{{!< default}}\n')
  }
})

test('(7.16b) a Routes Manager template compiles flat — no {{#post}}, no article — routed or not; emptied and routed it is its layout line', () => {
  const templates = { 'custom-landing.hbs': docOf(at('a22/1', 'Newsletter', { content: NEWS }), at('a4/13', 'Latest post')) }
  const unrouted = build(templates)
  const routed = build(templates, { routed: ['custom-landing.hbs'] })
  const file = textOf(unrouted.files)['custom-landing.hbs'] ?? ''
  // F1: a route's root carries no post, so the entry form's {{#post}} would print nothing there — the sections sit flat
  assert.match(file, /^\{\{!< default\}\}\n\n\{\{!-- Newsletter · [^\n]+ --\}\}\n\{\{> "sections\/custom-landing\/newsletter"\}\}\n\n\{\{!-- Latest post · [^\n]+ --\}\}\n\{\{> "sections\/custom-landing\/latest-post"\}\}\n$/, file)
  assert.ok(!file.includes('{{#post}}') && !file.includes('<article') && !file.includes('post_class'), file)
  // routed or not, one form (routine call 1): a route added or removed later never strands a section
  assert.equal(textOf(routed.files)['custom-landing.hbs'], file)
  // emptied and routed: the layout line alone, as Story 7.3 ruled for a routed custom template
  assert.equal(compile({ 'custom-landing.hbs': docOf() }, { routed: ['custom-landing.hbs'] })['custom-landing.hbs'], '{{!< default}}\n')
  // THE CONTROL: a membership file keeps the entry form — {{#post}} and POST_ARTICLE (R-129)
  const signup = compile({ 'custom-signup.hbs': docOf(at('a30/1', 'Join card')) })['custom-signup.hbs'] ?? ''
  assert.ok(signup.includes(`{{#post}}\n  ${POST_ARTICLE}`), signup)
  // and a design that names only membership files is refused on a Routes Manager template, by the library's one rule
  assert.throws(() => compile({ 'custom-landing.hbs': docOf(at('a30/1', 'Join card')) }), /a30\/1 compiles to custom-signup\.hbs, custom-signin\.hbs, custom-member-home\.hbs, never to custom-landing\.hbs/)
  // the target that names every Routes Manager template is a design's word, never a file the compile writes
  assert.throws(() => compile({ [ROUTE_TEMPLATE_TARGET]: docOf() }), /^Error: custom-\{name\}\.hbs: this compile writes no such template/)
})

// ── Story 7.16c — a collection's or channel's template is LISTED (`lists`): it paginates as Home does, so its first visible
//    feed is its main feed over Ghost's native posts at the flat root (F3); unlisted, a feed is a secondary feed in its own get.

/** a17/1 as the library now holds it: the brace target last, with a pager the main feed keeps and a secondary feed leaves out */
const PAGED_FEED = design('a17/1', 'Three Up', {
  compileTarget: ['home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs', ROUTE_TEMPLATE_TARGET],
  bindingContext: ['posts'],
  html: '<section class="a17-1">\n  <ul class="a17-1__grid">\n    <li class="a17-1__cell" data-repeat="posts">\n      <a class="a17-1__card" data-bind-attr="href:url" data-bind="title" data-empty="hide">Title</a>\n    </li>\n  </ul>\n  <nav class="a17-1__pager"><a class="a17-1__older" data-pagination="next" href="#" data-t="pagination.older">Older</a></nav>\n</section>',
})
const withPagedFeed = (id: string) => (id === 'a17/1' ? PAGED_FEED : LIB[id])

test('(7.16c) a listed template: its feed is designated the main feed and compiles over the native posts, flat, pager and all — unlisted, the same doc is a secondary feed', () => {
  const file = 'custom-tutorials-list.hbs'
  const templates = { [file]: docOf(at('a17/1', 'Post grid')) }
  const listed = compile(templates, { library: withPagedFeed, routed: [file], lists: { [file]: ['tutorials'] } })
  // the section the template invokes — wherever it is hoisted to (byte-identical to the archives' Post grid, it is shared/'s)
  const section = (out: Record<string, string>) => out[`partials/${/\{\{> "(sections\/[^"]+)"\}\}/.exec(out[file] ?? '')?.[1] ?? ''}.hbs`] ?? ''
  const main = section(listed)
  assert.ok(main.includes('{{#foreach posts}}') && !main.includes('{{#get'), main)
  assert.ok(main.includes('pagination.next'), 'the main feed keeps its pager')
  assert.ok(!(listed[file] ?? '').includes('{{#post}}') && !(listed[file] ?? '').includes('<article'), 'flat, the list row opens no block')
  // R-252: designed on page 1 only — one stack, no `{{#is "paged"}}` split, so Ghost serves page 1's on every page (F6)
  assert.ok(!(listed[file] ?? '').includes('{{#is'), 'no page-2 split in a listed template')
  // its theme text is Home's main feed's, byte for byte (F3: Ghost hands both the same root) — so it shares one file with the
  // archives' own Post grid, the same design at the same values
  const home = compile({ 'home.hbs': docOf(at('a17/1', 'Post grid', { isMainFeed: true })) }, { library: withPagedFeed })
  assert.equal(main, home[`partials/${/\{\{> "(sections\/[^"]+)"\}\}/.exec(home['home.hbs'] ?? '')?.[1] ?? ''}.hbs`], 'the same section on Home')
  assert.match(listed[file] ?? '', /\{\{> "sections\/shared\/post-grid"\}\}/)
  // THE CONTROL: no route lists it — a secondary feed, its own get, no pager
  const unlisted = section(compile(templates, { library: withPagedFeed, routed: [file] }))
  assert.match(unlisted, /^\{\{#get "posts" limit="12" order="published_at desc" include="tags,authors"\}\}/, unlisted)
  assert.ok(!unlisted.includes('pagination'), unlisted)
  // and a pager on an unlisted template that is no feed is R-7's refusal: the brace alone does not make a file paginate
  const pagerOnly = design('a22/2', 'Pager', { compileTarget: [ROUTE_TEMPLATE_TARGET], html: '<section class="a22-2"><nav class="a22-2__p"><a class="a22-2__n" data-pagination="next" href="#" data-t="pagination.older">Older</a></nav></section>' })
  const lib = (id: string) => (id === 'a22/2' ? pagerOnly : withPagedFeed(id))
  assert.throws(() => compile({ [file]: docOf(at('a22/2', 'Pager')) }, { library: lib }), /data-pagination restricts this design to a paginated target/)
  assert.doesNotThrow(() => compile({ [file]: docOf(at('a22/2', 'Pager')) }, { library: lib, lists: { [file]: ['tutorials'] } }))
})

test('(7.16c) the guard names each feed-less listed template\'s contexts after index, tag and author, in code order — each beside its control', () => {
  const hiddenFeed = (name: string) => docOf(at('a17/1', name, { hidden: true, isMainFeed: true }))
  const lists = { 'custom-staff-picks.hbs': ['staff-picks'], 'custom-tutorials-list.hbs': ['tutorials'], 'custom-zeta.hbs': ['b-side', 'a-side'] }
  const routed = Object.keys(lists)
  // Tag feed-less; /staff-picks/'s template feed-less (a section, no feed); /tutorials/' with a feed; zeta untouched (a shared one)
  const out = compile({
    'tag.hbs': hiddenFeed('Tag feed'),
    'custom-staff-picks.hbs': docOf(at('a22/1', 'Newsletter', { content: NEWS })),
    'custom-tutorials-list.hbs': docOf(at('a17/1', 'Post grid')),
  }, { library: withPagedFeed, routed, lists })
  assert.ok((out['default.hbs'] ?? '').includes(GUARD('tag, a-side, b-side, staff-picks')), out['default.hbs'])
  // the controls: a listed template WITH a visible feed adds none — and an UNLISTED feed-less one adds none
  const fed = compile({ 'custom-staff-picks.hbs': docOf(at('a17/1', 'Grid')) }, { library: withPagedFeed, routed: ['custom-staff-picks.hbs'], lists: { 'custom-staff-picks.hbs': ['staff-picks'] } })
  assert.ok(!(fed['default.hbs'] ?? '').includes('{{#is'), fed['default.hbs'])
  const unlisted = compile({ 'custom-staff-picks.hbs': docOf(at('a22/1', 'Newsletter', { content: NEWS })) }, { routed: ['custom-staff-picks.hbs'] })
  assert.ok(!(unlisted['default.hbs'] ?? '').includes('{{#is'), 'a static route serves no page 2 (F3)')
  // one guard, still — a single `noindex`
  assert.equal(((out['default.hbs'] ?? '').match(/noindex/g) ?? []).length, 1)
})

test('(7.16c) lists is refused on a key that is no Routes Manager file, or a context outside contextOf\'s shape (AD-36); the control compiles', () => {
  const file = 'custom-picks.hbs'
  for (const key of ['home.hbs', 'tag.hbs', 'custom-signup.hbs', ROUTE_TEMPLATE_TARGET, 'custom-x.hbs/../y']) {
    assert.throws(() => compile({}, { lists: { [key]: ['picks'] } }), /^Error: lists '[^']*': a collection or channel lists a Routes Manager template/, key)
  }
  for (const context of ['x"}}{{#each @site}}', 'index, tag', 'a/b', '', 'Picks', 'picks ', '-x', 'x--y']) {
    assert.throws(() => compile({}, { routed: [file], lists: { [file]: [context] } }), /is not a context Ghost names a collection or channel by/, JSON.stringify(context))
  }
  // the review: none of the guard's own names — `paged` would match a page 1 under its outer test, and the three archives'
  // would noindex a page 2 that has its feed — and never no context at all
  for (const context of ['paged', 'index', 'tag', 'author']) {
    assert.throws(() => compile({}, { routed: [file], lists: { [file]: [context] } }), /is a context FR-H2's guard names itself/, context)
  }
  assert.throws(() => compile({}, { routed: [file], lists: { [file]: [] } }), /names at least one context/)
  assert.doesNotThrow(() => compile({}, { routed: [file], lists: { [file]: ['picks', 'staff-picks', 'a-1', 'paged-x', 'home'] } }))
})

test('(7.3) every section hidden: a designed file\'s layout line alone, never re-synthesized', () => {
  const out = compile({ 'post.hbs': docOf(at('a24/1', 'Gone', { hidden: true })), 'tag.hbs': docOf(at('a17/1', 'Gone too', { hidden: true, isMainFeed: true })) })
  assert.equal(out['post.hbs'], '{{!< default}}\n')
  assert.equal(out['tag.hbs'], '{{!< default}}\n')
})

test('(7.3) a designed paywall: partials/content-cta.hbs opens {{{html}}}, then its section; no file invokes content-cta', () => {
  const out = compile({ [PAYWALL_TARGET]: docOf(at('a32/1', 'Paywall', { content: { heading: 'Members read on' } })) })
  assert.equal(out[PAYWALL_TARGET], '{{{html}}}\n\n{{!-- Paywall · Paywall / Content CTA · Centred --}}\n{{> "sections/content-cta/paywall"}}\n')
  assert.match(out['partials/sections/content-cta/paywall.hbs'] ?? '', /Members read on/)
  assert.ok(!Object.values(out).some((b) => /\{\{~?>\s*"?content-cta/.test(b)), 'an explicit {{> "content-cta"}} prints the paywall twice')
})

test('(7.3) a theme carrying the paywall but invoking no partial outside partials/ is refused; the control passes', () => {
  const onlyPaywall = (id: string) => (id === 'a32/1' ? LIB[id] : undefined)
  assert.throws(() => compile({ [PAYWALL_TARGET]: docOf(at('a32/1', 'Paywall')) }, { library: onlyPaywall }), /^Error: partials\/content-cta\.hbs: no template outside partials\/ invokes a partial/)
  assert.throws(() => checkPaywallReached({ [PAYWALL_TARGET]: '{{{html}}}\n{{> "sections/content-cta/x"}}\n', 'post.hbs': '{{!< default}}\n{{!-- {{> "x"}} --}}\n' }), /no template outside partials/)
  assert.doesNotThrow(() => checkPaywallReached({ [PAYWALL_TARGET]: '{{{html}}}\n', 'post.hbs': '{{> "sections/post/x"}}\n' }))
  assert.doesNotThrow(() => checkPaywallReached({ 'post.hbs': '{{!< default}}\n' }), 'no paywall, nothing to reach')
})

test('(7.3) the triple-stash rule: {{{body}}} in default.hbs and {{{html}}} as the paywall\'s first line, and nothing else', () => {
  const ok = { 'default.hbs': '<main>\n  {{{body}}}\n</main>\n', [PAYWALL_TARGET]: '{{{html}}}\n\n{{> "x"}}\n' }
  assert.doesNotThrow(() => checkTripleStashes(ok))
  // the last two are AD-5's rule 2, a mustache abutting a closing brace: no `{{{` opens, so the closes are counted apart
  for (const [path, body] of [['post.hbs', '{{{html}}}\n'], [PAYWALL_TARGET, '\n{{{html}}}\n'], [PAYWALL_TARGET, '{{{html}}}\n{{{html}}}\n'], ['default.hbs', '{{{body}}}\n{{{body}}}\n'], ['partials/x.hbs', '{{~{x}~}}\n'], ['post.hbs', '{{x}}}\n'], ['default.hbs', '{{{body}}}\n{{y}~}}\n']] as const) {
    assert.throws(() => checkTripleStashes({ ...ok, [path]: body }), /a triple-stash AD-5 does not allow/, `${path}: ${body}`)
  }
})

test('(7.3) a file no theme gets is refused, naming the legal files or where page 2 goes; a routed name that is no custom template is refused', () => {
  for (const file of ['page-about.hbs', 'members/signup.hbs', 'error-404.hbs']) {
    assert.throws(() => compile({ [file]: docOf() }), new RegExp(`^Error: ${file.replace('.', '\\.')}: this compile writes no such template — the legal files are default\\.hbs, home\\.hbs, post\\.hbs[^]*custom-\\{name\\}\\.hbs`), file)
  }
  assert.throws(() => compile({ 'index.hbs': docOf() }), /^Error: index\.hbs: Home's page 2 is handed in as pageTwo\['home\.hbs'\]/)
  for (const file of ['post.hbs', 'index.hbs', 'custom-x.hbs']) {
    assert.throws(() => compile({}, { pageTwo: { [file]: docOf() } }), new RegExp(`^Error: pageTwo\\['${file.replace('.', '\\.')}'\\]: only a paginated page 1 has a page 2 — page 2 is handed in under author\\.hbs, home\\.hbs, tag\\.hbs`), file)
  }
  assert.throws(() => compile({}, { routed: ['page.hbs'] }), /^Error: routed 'page\.hbs': a route names a custom template, custom-\{name\}\.hbs/)
})

test('(7.3) another @page property is refused, naming the file; the page switch, and a comment, are not', () => {
  for (const bad of ['{{#if @page.x}}y{{/if}}', '{{@page}}', '{{#if @page.show_title_and_feature_image.x}}y{{/if}}', '{{@page.[show]}}']) {
    assert.throws(() => checkPageData({ 'post.hbs': `${bad}\n` }), /^Error: post\.hbs: .* reads @page beyond @page\.show_title_and_feature_image/, bad)
  }
  assert.doesNotThrow(() => checkPageData({ 'page.hbs': '{{#if @page.show_title_and_feature_image}}x{{/if}}\n{{!-- @page.x --}}\n<p>@page.x</p>\n' }))
})

test('(7.3) determinism: templates, pageTwo and routed in another order give the same bytes', () => {
  const pageTwo = { 'tag.hbs': docOf(at('a17/1', 'Two', { isMainFeed: true, controls: { 'per-row': 'two' } })), 'home.hbs': docOf(at('a22/1', 'Letter', { content: NEWS })) }
  const templates = { ...project(), 'custom-signup.hbs': docOf(at('a30/1', 'Join')), [PAYWALL_TARGET]: docOf(at('a32/1', 'Paywall')) }
  const reverse = <T>(o: Record<string, T>): Record<string, T> => Object.fromEntries(Object.entries(o).reverse())
  const a = build(templates, { pageTwo, routed: ['custom-landing.hbs', 'custom-about.hbs'] })
  const b = build(reverse(templates), { pageTwo: reverse(pageTwo), routed: ['custom-about.hbs', 'custom-landing.hbs'] })
  assert.deepEqual(Object.keys(b.files), Object.keys(a.files))
  for (const k of Object.keys(a.files)) assert.deepEqual(b.files[k], a.files[k], k)
  assert.deepEqual(b.css, a.css)
  assert.ok(['custom-about.hbs', 'custom-landing.hbs', 'custom-signup.hbs', PAYWALL_TARGET, 'home.hbs'].every((f) => f in a.files), Object.keys(a.files).join(' '))
})

// ─── Story 7.4: fonts, licences, the token block, the base, the strip, the hooks and the record ───────────────────────

const fontsOf = (files: CompiledTheme['files']): string[] => Object.keys(files).filter((p) => p.startsWith('assets/fonts/'))
const preloadsOf = (head: string): string[] => [...head.matchAll(/<link rel="preload" href="\{\{asset "fonts\/([^"]+)"\}\}" as="font" type="font\/woff2" crossorigin>/g)].map((m) => m[1] as string)
const withPairing = (pairing: string): Partial<CompileInput> => ({ pairing, pack: { ...REFERENCE_PACK, fonts: pairingFonts(pairing) } as Pack })

test('(7.4) Paper\'s fonts: the pool files of D1\'s faces as fonts returned them, two roman preloads, D1\'s faces in the head, each family\'s licence at the root', () => {
  const { files } = build({})
  assert.deepEqual(fontsOf(files), [
    'assets/fonts/fraunces-roman-latin-ext.woff2', 'assets/fonts/fraunces-roman-latin.woff2',
    'assets/fonts/inter-italic-latin-ext.woff2', 'assets/fonts/inter-italic-latin.woff2',
    'assets/fonts/inter-roman-latin-ext.woff2', 'assets/fonts/inter-roman-latin.woff2',
  ])
  for (const path of fontsOf(files)) assert.deepEqual(files[path], poolFonts(`files/${path.slice('assets/fonts/'.length)}`), path)
  const shell = files['default.hbs'] as string
  assert.deepEqual(preloadsOf(shell), ['fraunces-roman-latin.woff2', 'inter-roman-latin.woff2'])
  // the faces are fontFaceCss's, one {{asset}} address per file, inside one <style> between the preloads and the stylesheet
  const faces = fontFaceCss('D1', (f) => `{{asset "fonts/${f.file}"}}`).split('\n').map((l) => `      ${l}`).join('\n')
  // Story 7.11 (moved on purpose): the settings <style> sits between the faces' element and the stylesheet
  assert.ok(shell.includes(`crossorigin>\n    <style>\n${faces}\n    </style>\n    <style>:root{\n`), shell)
  assert.ok(shell.indexOf('<style>:root{') < shell.indexOf('<link rel="stylesheet" href="{{asset "css/screen.css"}}">'), shell)
  // every preload href is, verbatim, the src of one of its faces
  const srcs = [...shell.matchAll(/src: url\((\{\{asset "fonts\/[^"]+"\}\})\) format\('woff2'\);/g)].map((m) => m[1])
  for (const file of preloadsOf(shell)) assert.equal(srcs.filter((s) => s === `{{asset "fonts/${file}"}}`).length, 1, file)
  // the style holds faces only and names no mode (AD-30): screen.css stays the one file that does — and since Story 7.11
  // default.hbs names the pin's two class names only inside <body>'s Color scheme chain
  assert.doesNotMatch(unpinned(shell), MODE_NAMED)
  // each family's licence, its words unchanged and only its whitespace tidied (CRLF, a trailing space, the extra newline)
  for (const slug of ['fraunces', 'inter']) {
    assert.equal(files[`LICENSE-${slug}.txt`], `Copyright 2020 The licences/${slug}.txt Project Authors\n\nThis Font Software is licensed under the SIL Open Font License, Version 1.1.\n`, slug)
  }
  assert.deepEqual(Object.keys(files).filter((p) => p.startsWith('LICENSE-')), ['LICENSE-fraunces.txt', 'LICENSE-inter.txt'])
  // no file names a font host (§D.a rule 6)
  for (const [path, body] of Object.entries(textOf(files))) assert.doesNotMatch(body, /fonts\.(googleapis|gstatic)\.com/, path)
})

test('(7.4) one family in both roles (D12): its two faces, one preload — the shared roman — and one licence', () => {
  const { files } = build({}, withPairing('D12'))
  assert.deepEqual(fontsOf(files).map((p) => p.replace(/^assets\/fonts\//, '')), pairingFaces('D12').flatMap((f) => f.files.map((x) => x.file)).sort())
  assert.ok(fontsOf(files).every((p) => p.includes('newsreader-')))
  assert.deepEqual(preloadsOf(files['default.hbs'] as string), ['newsreader-roman-latin.woff2'])
  assert.deepEqual(Object.keys(files).filter((p) => p.startsWith('LICENSE-')), ['LICENSE-newsreader.txt'])
})

test('(7.4) a static body family (D15): Lora\'s roman and Lato\'s four static faces ship; the preloads are Lora\'s roman and Lato\'s first roman face, 400', () => {
  const { files } = build({}, withPairing('D15'))
  assert.deepEqual(fontsOf(files).map((p) => p.replace(/^assets\/fonts\//, '')), pairingFaces('D15').flatMap((f) => f.files.map((x) => x.file)).sort())
  assert.equal(fontsOf(files).filter((p) => p.includes('/lato-')).length, pairingFaces('D15').filter((f) => f.family === 'Lato').length * Object.keys(POOL.subsets).length)
  assert.deepEqual(preloadsOf(files['default.hbs'] as string), ['lora-roman-latin.woff2', 'lato-roman-400-latin.woff2'])
  assert.deepEqual(Object.keys(files).filter((p) => p.startsWith('LICENSE-')), ['LICENSE-lato.txt', 'LICENSE-lora.txt'])
})

test('(7.4) fonts that disagree are refused, naming the pairing and the pack\'s two families; a short read is refused naming the file', () => {
  const { heading, body } = REFERENCE_PACK.fonts
  assert.throws(() => build({}, { pairing: 'D12' }), (e: Error) => e.message.includes('D12') && e.message.includes(heading.family) && e.message.includes(body.family))
  const short = (path: string) => (path === 'files/inter-italic-latin.woff2' ? poolFonts(path).subarray(1) : poolFonts(path))
  assert.throws(() => build({}, { fonts: short }), /^Error: fonts: files\/inter-italic-latin\.woff2 read \d+ bytes, and the pool records \d+/)
  // the control: the pool's own read compiles
  assert.doesNotThrow(() => build({}))
})

test('(7.4) Ghost\'s font variables: screen.css\'s :root declares both var(--gh-font-…) forms over the pack\'s lists; the canvas\'s block is not touched', () => {
  const css = compile({})['assets/css/screen.css'] as string
  assert.ok(css.includes(`  --font-heading: var(--gh-font-heading, ${REFERENCE_PACK.fonts.heading.family});\n`), css.slice(0, 2000))
  assert.ok(css.includes(`  --font-body: var(--gh-font-body, ${REFERENCE_PACK.fonts.body.family});\n`))
  // the control: the block the canvas reads names neither
  assert.doesNotMatch(packTokensCss(REFERENCE_PACK), /--gh-font/)
})

test('(7.4) the base: BASE_CSS, the canvas document\'s own, right after the token block; screen.css is css.global then each sheet in design order', () => {
  const templates = { ...project(), [PAYWALL_TARGET]: docOf(at('a32/1', 'Paywall')) }
  const { files, css } = build(templates, { pageTwo: projectTwo() })
  assert.ok(css.global.startsWith('/* Tokens */\n:root {') && css.global.endsWith(`\n\n/* Base */\n${BASE_CSS}`), css.global.slice(-200))
  assert.equal(files['assets/css/screen.css'], `${[css.global, ...Object.values(css.sheets)].join('\n\n')}\n`)
  assert.deepEqual(Object.keys(css.sheets), ['a1/1', 'a3/1', 'a4/13', 'a17/1', 'a22/1', 'a24/1', 'a32/1'], 'design order')
  for (const [id, chunk] of Object.entries(css.sheets)) assert.match(chunk, /^\/\* [^*]+ \*\/\n/, id)
})

test('(7.4) the record: every root-level template but the shell reaches the site doc\'s designs and its own; post, page and a membership template add the paywall\'s', () => {
  const templates = { ...project(), 'custom-signup.hbs': docOf(at('a30/1', 'Join')), 'custom-landing.hbs': docOf(at('a22/1', 'News', { content: NEWS })), [PAYWALL_TARGET]: docOf(at('a32/1', 'Paywall')) }
  const { files, css } = build(templates, { pageTwo: projectTwo() })
  const site = ['a1/1', 'a3/1']
  assert.deepEqual(css.reach['home.hbs'], [...site, 'a4/13', 'a17/1', 'a22/1'])
  assert.deepEqual(css.reach['post.hbs'], [...site, 'a22/1', 'a24/1', 'a32/1'])
  assert.deepEqual(css.reach['custom-signup.hbs'], [...site, 'a30/1', 'a32/1'])
  // Story 7.16b's review — a Routes Manager template opens no {{#post}}, so no {{content}} prints the paywall there (F1);
  // custom-signup.hbs above is its control
  assert.deepEqual(css.reach['custom-landing.hbs'], [...site, 'a22/1'])
  assert.deepEqual(css.reach['index.hbs'], [...site, 'a17/1'])
  assert.deepEqual(Object.keys(css.reach), Object.keys(files).filter((p) => p.endsWith('.hbs') && !p.includes('/') && p !== 'default.hbs'))
})

test('(7.4) hidden only: a design whose every instance is hidden ships no sheet', () => {
  const { files, css } = build({ 'home.hbs': docOf(at('a4/13', 'Gone', { hidden: true }), at('a17/1', 'Grid', { isMainFeed: true })) })
  assert.ok(!('a4/13' in css.sheets) && !(files['assets/css/screen.css'] as string).includes('.a4-13'))
  // the control: shown, it ships
  assert.ok('a4/13' in build({ 'home.hbs': docOf(at('a4/13', 'Here'), at('a17/1', 'Grid', { isMainFeed: true })) }).css.sheets)
})

test('(7.4) the strip in the compile: a value no placed root carries leaves the sheet; two placements keep both values', () => {
  const lib = (id: string) => (id === 'a17/1' ? { ...(LIB['a17/1'] as SectionRegistryEntry), css: '.a17-1 { gap: 0; }\n.a17-1[data-per-row="two"] .a17-1__grid { gap: 1px; }\n.a17-1[data-per-row="three"] .a17-1__grid { gap: 2px; }\n' } : LIB[id])
  const one = build({ 'home.hbs': docOf(at('a17/1', 'Grid', { isMainFeed: true })) }, { library: lib }).css.sheets['a17/1'] ?? ''
  assert.ok(one.includes('"three"') && !one.includes('"two"'), one)
  const two = build({ 'home.hbs': docOf(at('a17/1', 'Grid', { isMainFeed: true })) }, { library: lib, pageTwo: { 'tag.hbs': docOf(at('a17/1', 'Two', { isMainFeed: true, controls: { 'per-row': 'two' } })) } }).css.sheets['a17/1'] ?? ''
  assert.ok(two.includes('"three"') && two.includes('"two"'), two)
})

// A design drawn on two grounds, as AD-30's authoring rule writes them: the Background role narrowed to Base and Contrast,
// one root rule per value declaring the root's own property, and the root rule reading it.
const grounded = (e: SectionRegistryEntry): SectionRegistryEntry => {
  const root = e.id.replace('/', '-')
  return { ...e, universals: { bg: { values: ['base', 'contrast'], reason: 'two grounds' } }, css: `.${root} { background: var(--${root}-ground); }\n.${root}[data-bg="base"] { --${root}-ground: var(--bg-page); }\n.${root}[data-bg="contrast"] { --${root}-ground: var(--bg-contrast); }\n` }
}
const GROUNDED = Object.fromEntries(Object.entries(LIB).map(([id, e]) => [id, grounded(e)]))
const groundedLib = (id: string) => GROUNDED[id]
const DARK: Partial<DocInstance> = { darkOverrides: { bg: 'contrast' } }
const hooksIn = (files: CompiledTheme['files']): string[] => [...new Set(Object.values(textOf(files)).flatMap((b) => [...b.matchAll(/data-instance="([0-9a-f]{8})"/g)].map((m) => m[1] as string)))].sort()

test('(7.4) a dark override, Light + Dark: the root carries hookOf(sectionKey(its place, id)); the token block ends with its rules under MODE_SELECTORS\' two conditions; no override, no hook', () => {
  const dark = at('a22/1', 'Dark box', { content: NEWS, ...DARK })
  const plain = at('a22/1', 'Plain box', { content: { heading: 'Other' } })
  const { files, css } = build({ 'home.hbs': docOf(dark, plain) }, { library: groundedLib, pageTwo: projectTwo() })
  const key = sectionKey('home', dark.instanceId)
  const hook = hookOf(key)
  assert.match(files['partials/sections/home/dark-box.hbs'] as string, new RegExp(`\\n  data-instance="${hook}">`))
  assert.ok(!(files['partials/sections/home/plain-box.hbs'] as string).includes('data-instance'))
  assert.deepEqual(hooksIn(files), [hook])
  const tokens = css.global.split('\n\n/* Base */')[0] as string
  const rules = darkOverrideCss([{ key, entry: GROUNDED['a22/1'] as SectionRegistryEntry, state: dark }]).replace(/^\/\*[^\n]*\*\/\n/, '').trimEnd()
  assert.ok(tokens.endsWith(rules), tokens.slice(-600))
  assert.ok(tokens.includes(`${MODE_SELECTORS.explicit.map((c) => `${c} [data-instance="${hook}"]`).join(', ')} { --a22-1-ground: var(--bg-contrast); }`), tokens.slice(-600))
  // a dark value's root rule: no instance is at contrast in light, so the SHEET drops it — and the block still writes it
  assert.ok(!(css.sheets['a22/1'] ?? '').includes('contrast'), css.sheets['a22/1'])
})

test('(7.4) Light-only: no data-instance anywhere and no per-section rule; the pack\'s dark map stands', () => {
  const dark = at('a22/1', 'Dark box', { content: NEWS, ...DARK })
  const { files, css } = build({ 'home.hbs': docOf(dark) }, { library: groundedLib, pageTwo: projectTwo(), darkEnabled: false })
  assert.deepEqual(hooksIn(files), [])
  assert.ok(!css.global.includes('[data-instance'))
  assert.ok(css.global.includes(`${MODE_SELECTORS.explicit.join(', ')} {`), 'the dark map')
  // the control: Light + Dark, the same doc carries both
  const on = build({ 'home.hbs': docOf(dark) }, { library: groundedLib, pageTwo: projectTwo() })
  assert.equal(hooksIn(on.files).length, 1)
  assert.ok(on.css.global.includes('[data-instance'))
})

test('(7.4) keys by place: site, home, index (own design and the copy), tag-paged, a custom template and the paywall — the keys the editor hashes', () => {
  const site = at('a1/1', 'Header', DARK)
  const home = at('a22/1', 'Box', { content: NEWS, ...DARK })
  const index = at('a17/1', 'Older', { isMainFeed: true, ...DARK })
  const tagTwo = at('a17/1', 'Tag two', { isMainFeed: true, controls: { 'per-row': 'two' }, ...DARK })
  const custom = at('a30/1', 'Join', DARK)
  const paywall = at('a32/1', 'Paywall', DARK)
  const out = build({ 'default.hbs': docOf(site), 'home.hbs': docOf(home), 'custom-signup.hbs': docOf(custom), [PAYWALL_TARGET]: docOf(paywall) }, {
    library: groundedLib, pageTwo: { 'home.hbs': docOf(index), 'tag.hbs': docOf(tagTwo) },
  })
  const want = [['site', site], ['home', home], ['index', index], ['tag-paged', tagTwo], ['custom:custom-signup.hbs', custom], ['paywall', paywall]] as const
  assert.deepEqual(hooksIn(out.files), want.map(([k, i]) => hookOf(sectionKey(k, i.instanceId))).sort())
  // Home's page 2 as the COPY: index.hbs holds Home's instance under `index:…`, a hook apart from Home's own, so the two no
  // longer share a partial once an override is in force
  const feed = at('a17/1', 'Feed', { isMainFeed: true, ...DARK })
  const copy = build({ 'home.hbs': docOf(feed) }, { library: groundedLib })
  assert.deepEqual(hooksIn(copy.files), [hookOf(sectionKey('home', feed.instanceId)), hookOf(sectionKey('index', feed.instanceId))].sort())
  assert.notEqual(sectionsOf(copy.files['home.hbs'] as string)[0], sectionsOf(copy.files['index.hbs'] as string)[0])
})

test('(7.4) an archive\'s page 2 that follows page 1: tag.hbs\'s one markup takes the tag:… key', () => {
  const feed = at('a17/1', 'Tag feed', { isMainFeed: true, ...DARK })
  const { files } = build({ 'tag.hbs': docOf(feed) }, { library: groundedLib })
  assert.deepEqual(hooksIn(files), [hookOf(sectionKey('tag', feed.instanceId))])
  assert.ok(!hooksIn(files).includes(hookOf(sectionKey('tag-paged', feed.instanceId))))
})

test('(7.4) two hooks collide: refused naming both layer names and files, with the remedy', () => {
  // two keys whose FNV-1a hashes collide (dark-override.test.ts found them by search)
  assert.equal(hookOf(sectionKey('home', 's10161')), hookOf(sectionKey('home', 's488360')), 'the control: the keys collide')
  const pair = docOf(at('a22/1', 'First', { instanceId: 's10161', content: NEWS, ...DARK }), at('a22/1', 'Second', { instanceId: 's488360', content: NEWS, ...DARK }))
  assert.throws(() => build({ 'home.hbs': pair }, { library: groundedLib, pageTwo: projectTwo() }), (e: Error) => e.message === 'Two sections share a hidden name, so neither one\'s dark look can ship: "First" in home.hbs and "Second" in home.hbs. Delete one of them and add it again — it gets a new name.')
  // Light-only: no hook, so nothing to collide
  assert.doesNotThrow(() => build({ 'home.hbs': pair }, { library: groundedLib, pageTwo: projectTwo(), darkEnabled: false }))
})

test('(7.4) a Tabler icon: a placed section that draws one ships LICENSE-tabler.txt, byte for byte TABLER_LICENSE; none drawn, no file', () => {
  const iconRow = design('a22/9', 'Icon Row', { compileTarget: ['home.hbs'], contentSchema: { icon: { type: 'icon', label: 'Icon' } as PropDef }, html: '<section class="a22-9">\n  <span class="a22-9__icon" data-prop="icon"></span>\n</section>' })
  const lib = (id: string) => (id === 'a22/9' ? iconRow : LIB[id])
  const drawn = build({ 'home.hbs': docOf(at('a22/9', 'Icons', { content: { icon: 'star' } })) }, { library: lib }).files
  assert.equal(drawn['LICENSE-tabler.txt'], TABLER_LICENSE)
  assert.ok(Object.values(textOf(drawn)).some((b) => b.includes('<svg ')), 'the icon is drawn')
  // the controls: no icon named, and an icon on a hidden section, draw nothing and ship no licence
  assert.ok(!('LICENSE-tabler.txt' in build({ 'home.hbs': docOf(at('a22/9', 'Icons', { content: { icon: '' } })) }, { library: lib }).files))
  assert.ok(!('LICENSE-tabler.txt' in build({ 'home.hbs': docOf(at('a22/9', 'Icons', { content: { icon: 'star' }, hidden: true })) }, { library: lib }).files))
})

test('(7.4) determinism: every input in another key order — the pool read included — gives the same files, byte for byte, and the same record', () => {
  const templates = { ...project(), [PAYWALL_TARGET]: docOf(at('a32/1', 'Paywall', DARK)) }
  const reverse = <T>(o: Record<string, T>): Record<string, T> => Object.fromEntries(Object.entries(o).reverse())
  const a = build(templates, { library: groundedLib, pageTwo: projectTwo() })
  const b = build(reverse(templates), { library: groundedLib, pageTwo: reverse(projectTwo()), fonts: (p) => Uint8Array.from(poolFonts(p)) })
  assert.deepEqual(Object.keys(b.files), Object.keys(a.files))
  for (const k of Object.keys(a.files)) assert.deepEqual(b.files[k], a.files[k], k)
  assert.deepEqual(b.css, a.css)
})

// ─── Story 7.5: the scripts — main.js, cards.js, Ghost's licence, README.md and the two tags ──────────────────────────

/** A design whose markup mounts modules, one element each — `js` as `assembleEntry` recovers it, in registry order. */
const mounting = (id: string, compileTarget: string[], ...names: string[]): SectionRegistryEntry => {
  const root = id.replace('/', '-')
  return design(id, `Mounts ${names.join(' and ')}`, {
    compileTarget,
    js: MODULES.filter((m) => names.includes(m.name)).map((m) => m.name),
    html: `<section class="${root}">\n${names.map((n) => `  <div class="${root}__${n}" data-module="${n}"></div>`).join('\n')}\n</section>`,
  })
}
const MOUNTING: Record<string, SectionRegistryEntry> = Object.fromEntries([
  mounting('a12/1', ['default.hbs'], 'nav-drawer', 'lightbox'),
  mounting('a12/2', ['home.hbs', 'index.hbs'], 'lightbox', 'carousel'),
  mounting('a12/3', ['index.hbs'], 'tabs'),
  mounting('a12/4', ['tag.hbs'], 'accordion'),
  mounting('a12/5', [PAYWALL_TARGET], 'countdown'),
  mounting('a12/6', ['home.hbs'], 'lightbox'),
].map((e) => [e.id, e]))
const mountingLib = (id: string) => MOUNTING[id] ?? LIB[id]
const mainOf = (files: CompiledTheme['files']): string => files['assets/js/main.js'] as string
const headOf = (files: CompiledTheme['files']): string => (files['default.hbs'] as string).split('</head>')[0] as string
const STYLESHEET = '    <link rel="stylesheet" href="{{asset "css/screen.css"}}">'
/** Story 7.13 (AD-18): cards.css, linked before screen.css on every theme. */
const CARDS_STYLESHEET = '    <link rel="stylesheet" href="{{asset "css/cards.css"}}">'
/** README's Styles section with no card designed — the widths alone. */
const STYLES_NONE = "## Styles\n\n- `assets/css/screen.css` is this theme's own stylesheet.\n- `assets/css/cards.css` is this theme's own styling for the cards Ghost's editor puts in posts: their wide and full widths.\n"
const SCRIPTS_LINE = "- `assets/js/main.js` is this theme's own code: a small runtime and one function for each behaviour its sections use. It carries no third-party code."

test('(7.5) no module declared: main.js is bundle([]) — core alone; one defer tag after the stylesheet; README is the Scripts section alone; no cards.js, licence or cards tag', () => {
  const { files } = build(project(), { pageTwo: projectTwo() })
  assert.equal(mainOf(files), bundle([], { core: CORE }))
  assert.deepEqual(bundledNames(mainOf(files)), ['core'])
  assert.ok(headOf(files).includes(`${STYLESHEET}\n    ${MAIN_JS_TAG}\n`), headOf(files))
  assert.equal((files['default.hbs'] as string).split(MAIN_JS_TAG).length, 2, 'the tag once')
  assert.equal(files['README.md'], `## Scripts\n\n${SCRIPTS_LINE}\n\n${STYLES_NONE}`)
  for (const p of ['assets/js/cards.js', 'LICENSE-ghost.txt']) assert.ok(!(p in files), p)
  assert.ok(!(files['default.hbs'] as string).includes('js/cards.js'))
  assert.deepEqual(Object.keys(files).filter((p) => p.startsWith('assets/js/')), ['assets/js/main.js'])
})

test('(7.5) a written module: a placed design declaring lightbox, with its file, is in main.js, and its mount keeps data-module', () => {
  const modules = { core: CORE, lightbox: stub('lightbox') }
  const { files } = build({ 'home.hbs': docOf(at('a12/6', 'Gallery')) }, { library: mountingLib, modules, pageTwo: projectTwo() })
  assert.equal(mainOf(files), bundle(['lightbox'], modules))
  assert.match(mainOf(files).split('\n')[0] ?? '', / core · lightbox$/)
  assert.match(textOf(files)['partials/sections/home/gallery.hbs'] ?? '', /data-module="lightbox"/)
})

test('(7.5) the union: modules declared on the site doc, Home, Home\'s page 2, an archive\'s page 2 and the paywall — each once, in registry order', () => {
  const names = ['nav-drawer', 'lightbox', 'carousel', 'tabs', 'accordion', 'countdown']
  const modules = { core: CORE, ...Object.fromEntries(names.map((n) => [n, stub(n)])) }
  const { files } = build({
    'default.hbs': docOf(at('a12/1', 'Header bits')),
    'home.hbs': docOf(at('a12/2', 'Home bits'), at('a17/1', 'Post grid', { isMainFeed: true })),
    [PAYWALL_TARGET]: docOf(at('a12/5', 'Clock')),
  }, {
    library: mountingLib, modules,
    pageTwo: { 'home.hbs': docOf(at('a12/3', 'Tabs'), at('a17/1', 'Older', { isMainFeed: true })), 'tag.hbs': docOf(at('a12/4', 'Folds'), at('a17/1', 'Tag feed', { isMainFeed: true })) },
  })
  const registryOrder = MODULES.map((m) => m.name).filter((n) => names.includes(n))
  assert.deepEqual(bundledNames(mainOf(files)), ['core', ...registryOrder])
  assert.equal(mainOf(files), bundle(registryOrder, modules))
})

test('(7.5) it leaves with its design: deleted, or every instance hidden, its module leaves main.js — unless another placed design declares it', () => {
  const modules = { core: CORE, lightbox: stub('lightbox'), carousel: stub('carousel') }
  const compileWith = (...instances: DocInstance[]) => bundledNames(mainOf(build({ 'home.hbs': docOf(...instances) }, { library: mountingLib, modules, pageTwo: projectTwo() }).files))
  assert.deepEqual(compileWith(at('a12/2', 'Both')), ['core', 'carousel', 'lightbox'])
  assert.deepEqual(compileWith(at('a22/1', 'Letter', { content: NEWS })), ['core'], 'the declaring design deleted')
  assert.deepEqual(compileWith(at('a12/2', 'Both', { hidden: true })), ['core'], 'its every instance hidden')
  assert.deepEqual(compileWith(at('a12/2', 'Both', { hidden: true }), at('a12/6', 'Gallery')), ['core', 'lightbox'], 'another placed design keeps lightbox')
})

test('(7.5) declared, no file yet: nav-drawer is left out of main.js, its mount keeps data-module and ships at rest — no throw, no stub', () => {
  const { files } = build({ 'default.hbs': docOf(at('a12/1', 'Header bits')) }, { library: mountingLib, modules: { core: CORE, lightbox: stub('lightbox') } })
  assert.deepEqual(bundledNames(mainOf(files)), ['core', 'lightbox'])
  assert.ok(!mainOf(files).includes('navDrawer'), 'no stub')
  assert.match(textOf(files)['partials/sections/default/header-bits.hbs'] ?? '', /data-module="nav-drawer"/)
})

test('(7.5) no core: the compile throws bundle()\'s sentence', () => {
  assert.throws(() => build({}, { modules: {} }), /core\.js has no source/)
})

test('(7.5) a module\'s strings: a placed countdown carries one data-i18n-* per key its row declares, as S5 stamps it; main.js carries no countdown, which has no file', () => {
  const { files } = build({ [PAYWALL_TARGET]: docOf(at('a12/5', 'Clock')) }, { library: mountingLib })
  const partial = Object.entries(textOf(files)).find(([p, b]) => p.startsWith('partials/sections/') && b.includes('data-module="countdown"'))?.[1] ?? ''
  const keys = MODULES.find((m) => m.name === 'countdown')?.strings ?? []
  assert.ok(keys.length > 0)
  for (const key of keys) assert.equal(partial.split(`${i18nAttr(key)}=`).length, 2, `${i18nAttr(key)} once`)
  assert.deepEqual(bundledNames(mainOf(files)), ['core'])
})

test('(7.5) designed cards with scripts: cards.js is cardsJs of the scripted ones, Ghost\'s licence at the root, CARDS_JS_TAG after MAIN_JS_TAG, README\'s cards line, package.json excluding both', () => {
  const { files } = build({}, { cardDesigns: { toggle: { chevron: 'left' }, callout: { emoji: 'off' } } })
  assert.equal(files['assets/js/cards.js'], cardsJs(['toggle'], GHOST_CARDS.scripts))
  assert.equal(files['LICENSE-ghost.txt'], tidyLicence(GHOST_CARDS.licence))
  assert.equal(files['LICENSE-ghost.txt'], 'Copyright (c) 2013-2026 Ghost Foundation\n\nPermission is hereby granted, free of charge.\n')
  assert.ok(headOf(files).includes(`${STYLESHEET}\n    ${MAIN_JS_TAG}\n    ${CARDS_JS_TAG}\n`), headOf(files))
  assert.ok((files['README.md'] as string).startsWith(`## Scripts\n\n${SCRIPTS_LINE}\n- \`assets/js/cards.js\` is Ghost's own code for these cards: toggle. It is copied unchanged from Ghost 6.58.0, under the MIT licence in \`LICENSE-ghost.txt\`. This theme styles those cards itself, which switches off Ghost's own copy of their scripts, so it carries this one.\n\n## Styles\n`), files['README.md'] as string)
  assert.deepEqual((JSON.parse(files['package.json'] as string) as { config: { card_assets: unknown } }).config.card_assets, { exclude: ['callout', 'toggle'] })
  // every scripted card, in code-unit order
  assert.match(build({}, { cardDesigns: { video: { play: 'large' }, gallery: { gutter: 'tight' }, audio: { accent: 'text' }, toggle: { heading: 'small-head' } } }).files['assets/js/cards.js'] as string, /^\/\* Ghost's own scripts for these cards: audio · gallery · toggle · video — /)
})

test('(7.5, 7.13) a designed card with no script: no cards.js, no cards tag, no cards.js line — and, since 7.13, Ghost\'s licence for its stylesheet in cards.css', () => {
  const { files } = build({}, { cardDesigns: { callout: { emoji: 'off' } } })
  assert.ok(!('assets/js/cards.js' in files))
  assert.ok(!(files['default.hbs'] as string).includes(CARDS_JS_TAG))
  assert.ok(!(files['README.md'] as string).includes('cards.js'))
  assert.equal(files['LICENSE-ghost.txt'], tidyLicence(GHOST_CARDS.licence))
  // a divider alone copies nothing of Ghost's: no licence of Ghost's, and README's widths line
  const divider = build({}, { cardDesigns: { divider: { glyph: 'on' } } }).files
  assert.ok(!('LICENSE-ghost.txt' in divider))
  assert.ok((divider['README.md'] as string).endsWith(STYLES_NONE.replace('their wide and full widths.', 'their wide and full widths, and its card settings.')), divider['README.md'] as string)
})

test('(7.14) FR-Q9: the card designs emit the same whatever the sections — project()\'s sections, the same templates each an empty doc, or every section hidden carry the same cards.css, card_assets, link, cards.js and its tag; no partials/pagination.hbs (Story 10.112\'s); the control: no card designed differs', () => {
  const cardDesigns = { callout: { emoji: 'off' }, toggle: { chevron: 'left' } }
  const emptied = (docs: Record<string, ProjectDoc>): Record<string, ProjectDoc> => Object.fromEntries(Object.keys(docs).map((k) => [k, docOf()]))
  // hiding is not emptying: a doc whose every section is hidden is designed and never re-synthesized (`stacksOf`), so this
  // compile places no visible section on any template — Post's included, where cards render (Review, 2026-10-16)
  const hid = (docs: Record<string, ProjectDoc>): Record<string, ProjectDoc> => Object.fromEntries(Object.entries(docs).map(([k, d]) => [k, docOf(...d.instances.map((i) => ({ ...i, hidden: true })))]))
  const full = build(project(), { pageTwo: projectTwo(), cardDesigns }).files
  const bare = build(emptied(project()), { pageTwo: emptied(projectTwo()), cardDesigns }).files
  const hidden = build(hid(project()), { pageTwo: hid(projectTwo()), cardDesigns }).files
  const none = build(emptied(project()), { pageTwo: emptied(projectTwo()), cardDesigns: {} }).files
  const cardsOf = (files: CompiledTheme['files']): unknown => (JSON.parse(files['package.json'] as string) as { config: { card_assets: unknown } }).config.card_assets
  const linked = (files: CompiledTheme['files']): boolean => headOf(files).includes(`${CARDS_STYLESHEET}\n${STYLESHEET}\n`)
  // the premise: the compiles differ in sections. The empty docs store none, yet the theme still renders what the
  // library's own rules put on an empty template (Post's header, Home's fallback feed), so `bare` reads as "nothing the
  // user placed" (their footer, header and newsletter gone); in `hidden` no template the project stores invokes a section
  // (an archive it never stored, author's, keeps the library's feed)
  const sectionFiles = (files: CompiledTheme['files']) => Object.keys(files).filter((f) => f.startsWith('partials/sections/'))
  assert.ok(sectionFiles(full).some((f) => !sectionFiles(bare).includes(f)), JSON.stringify({ full: sectionFiles(full), bare: sectionFiles(bare) }))
  for (const file of Object.keys(project())) assert.ok(!(hidden[file] as string).includes('{{> "sections/'), `${file}: ${hidden[file] as string}`)
  assert.ok((full['post.hbs'] as string).includes('{{> "sections/'), 'the premise\'s control: the same check sees Post\'s sections in full')
  // sections everywhere: Ghost's callout and toggle chunks, their rules, both excluded, cards.css before screen.css
  const css = full['assets/css/cards.css'] as string
  assert.equal(css, cardsCss(cardDesigns, GHOST_CARDS.styles))
  assert.ok(css.includes('/* callout.css */\n') && css.includes('/* toggle.css */\n') && ownCardsCss(css).includes('.kg-callout-card div.kg-callout-emoji { display: none; }'), css)
  assert.deepEqual(cardsOf(full), { exclude: ['callout', 'toggle'] })
  assert.ok(linked(full), headOf(full))
  assert.equal(full['assets/js/cards.js'], cardsJs(['toggle'], GHOST_CARDS.scripts))
  assert.ok(headOf(full).includes(CARDS_JS_TAG), headOf(full))
  // no section the user placed, and no visible section at all: the same bytes, exclusion, link, script and licence
  for (const [label, files] of [['bare', bare], ['hidden', hidden]] as const) {
    assert.equal(files['assets/css/cards.css'], css, label)
    assert.deepEqual(cardsOf(files), cardsOf(full), label)
    assert.ok(linked(files), `${label}: ${headOf(files)}`)
    assert.equal(files['assets/js/cards.js'], full['assets/js/cards.js'], label)
    assert.ok(headOf(files).includes(CARDS_JS_TAG), `${label}: ${headOf(files)}`)
    assert.equal(files['LICENSE-ghost.txt'], full['LICENSE-ghost.txt'], label)
  }
  // R-118: the pagination half is Story 10.112's — no compile writes Ghost's pagination partial today
  for (const files of [full, bare, hidden, none]) assert.ok(!('partials/pagination.hbs' in files))
  // the control — the check reads the record: no card designed, D12's two widths alone and card_assets true
  assert.equal(none['assets/css/cards.css'], KOENIG_WIDTHS)
  assert.notEqual(none['assets/css/cards.css'], css)
  assert.equal(cardsOf(none), true)
  assert.ok(!('assets/js/cards.js' in none))
})

test('(7.5) a chunk not as vendored, or two chunks from two Ghost versions, throws naming the card', () => {
  const scripts = (over: Record<string, string>) => ({ ghostCards: { ...GHOST_CARDS, scripts: { ...GHOST_CARDS.scripts, ...over } } })
  const toggle = { toggle: { chevron: 'left' } }
  assert.throws(() => build({}, { cardDesigns: toggle, ...scripts({ toggle: '(function() {})();\n' }) }), /toggle\.js does not open with record-cards\.py's head/)
  assert.throws(() => build({}, { cardDesigns: { ...toggle, audio: { accent: 'text' } }, ...scripts({ toggle: chunk('toggle', '(function() {})();\n', '5.130.6') }) }), /toggle\.js is copied from Ghost 5\.130\.6/)
})

test('(7.5) a control character in a module source, a card script or Ghost\'s licence — a tab included — throws noC0\'s sentence', () => {
  assert.throws(() => build({}, { modules: { core: CORE.replace('  return', '\treturn') } }), /^Error: a module source carries a control character, which the theme compiler refuses/)
  assert.throws(() => build({}, { ghostCards: { ...GHOST_CARDS, scripts: { ...GHOST_CARDS.scripts, audio: `${GHOST_CARDS.scripts['audio']}\u0007` } } }), /^Error: a card script carries a control character/)
  assert.throws(() => build({}, { ghostCards: { ...GHOST_CARDS, licence: 'MIT\tLicence\n' } }), /^Error: Ghost's licence carries a control character/)
})

test('(7.5) determinism: the module files, the card scripts and the designed cards in another order give the same files, byte for byte', () => {
  const reverse = <T>(o: Record<string, T>): Record<string, T> => Object.fromEntries(Object.entries(o).reverse())
  const modules = { core: CORE, lightbox: stub('lightbox'), carousel: stub('carousel'), 'nav-drawer': stub('nav-drawer') }
  const templates = { 'default.hbs': docOf(at('a12/1', 'Header bits')), 'home.hbs': docOf(at('a12/2', 'Home bits')) }
  const cards = { video: { play: 'small' }, toggle: { chevron: 'left' }, callout: { emoji: 'off' } }
  const a = build(templates, { library: mountingLib, modules, cardDesigns: cards, pageTwo: projectTwo() })
  const b = build(templates, { library: mountingLib, modules: reverse(modules), cardDesigns: reverse(cards), ghostCards: { ...GHOST_CARDS, scripts: reverse(GHOST_CARDS.scripts) }, pageTwo: projectTwo() })
  assert.deepEqual(Object.keys(b.files), Object.keys(a.files))
  for (const k of Object.keys(a.files)) assert.deepEqual(b.files[k], a.files[k], k)
  assert.deepEqual(b.js, a.js)
})

test('(7.5) the compile\'s own output: checkThemeJs and checkThemeScripts return no sentence over the final text — and the control: a design whose markup carries a <script> makes the compile throw that sentence', () => {
  const modules = { core: CORE, lightbox: stub('lightbox') }
  for (const cardDesigns of [{}, { audio: { accent: 'text' }, callout: { emoji: 'off' }, gallery: { gutter: 'loose' } }]) {
    const out = textOf(build(project(), { library: mountingLib, modules, cardDesigns, pageTwo: projectTwo() }).files)
    assert.deepEqual(checkThemeJs(out, modules, GHOST_CARDS.scripts), [], Object.keys(cardDesigns).join())
    assert.deepEqual(checkThemeScripts(out), [], Object.keys(cardDesigns).join())
  }
  // review (2026-10-08): the throw itself, reached — the only way a script reaches a template is a design's own markup
  const scripted = design('a12/9', 'Scripted', { compileTarget: ['home.hbs'], html: '<section class="a12-9">\n  <script></script>\n</section>' })
  assert.throws(() => build({ 'home.hbs': docOf(at('a12/9', 'Bad')) }, { library: (id) => (id === 'a12/9' ? scripted : LIB[id]), modules }), /^Error: the theme's scripts: partials\/sections\/home\/bad\.hbs: "<script><\/script>" is no script/)
})

test('(7.5, review) the js record beside css: bundled is what main.js carries after core, atRest each mounted module with no file, both in registry order', () => {
  const modules = { core: CORE, lightbox: stub('lightbox') }
  const { js, files } = build({ 'default.hbs': docOf(at('a12/1', 'Header bits')), 'home.hbs': docOf(at('a12/2', 'Home bits')) }, { library: mountingLib, modules })
  assert.deepEqual(js, { bundled: ['lightbox'], atRest: MODULES.map((m) => m.name).filter((n) => ['nav-drawer', 'carousel'].includes(n)) })
  assert.deepEqual(bundledNames(mainOf(files)), ['core', ...js.bundled])
  assert.deepEqual(build(project(), { pageTwo: projectTwo() }).js, { bundled: [], atRest: [] })
})


// ─── Story 7.6: Ghost-correct markup — the spec's I/O matrix, row by row ──────────────────────────────────────────────

/** Every template's text with its Handlebars comments removed — what Ghost renders. */
const rendered = (files: Record<string, string>): [string, string][] =>
  Object.entries(files).filter(([p]) => p.endsWith('.hbs')).map(([p, b]) => [p, b.replace(HBS_COMMENT, '')])
/** A private page's design, which the real library does not hold yet — so the row reaches every template class. */
const withPrivate = (id: string) => (id === 'a33/1' ? design('a33/1', 'Lock', { compileTarget: ['private.hbs'], contentSchema: { heading: text('Heading') }, html: '<section class="a33-1">\n  <h2 class="a33-1__heading" data-prop="heading" data-empty="hide">Locked</h2>\n</section>' }) : withError(id))

test('(7.6) the article: POST_ARTICLE is Ghost\'s post_class, then Casper\'s post-access class for a visitor without access — and no class of Inflozo\'s', () => {
  assert.equal(POST_ARTICLE, '<article class="{{post_class}}{{#unless access}} post-access-{{visibility}}{{/unless}}">')
  // Handlebars reads it as the helper, then the block: nothing else is in it
  const parsed = Handlebars.parse(`${POST_ARTICLE}</article>`).body.map((n) => n.type)
  assert.deepEqual(parsed, ['ContentStatement', 'MustacheStatement', 'BlockStatement', 'ContentStatement'])
})

test('(7.6) an emptied post: its layout line alone — no block and no article', () => {
  const out = compile({ 'post.hbs': docOf(at('a24/1', 'Gone', { hidden: true }), at('a22/1', 'Gone too', { hidden: true, content: NEWS })) })
  assert.equal(out['post.hbs'], '{{!< default}}\n')
  assert.deepEqual(checkGhostMarkup(out), [])
})

test('(7.6) every other template — default, home, index, the archives, error, private and the paywall — carries no <article> and no {{post_class}}', () => {
  const templates = { ...project(), 'private.hbs': docOf(at('a33/1', 'Lock', { content: { heading: 'Members only' } })), [PAYWALL_TARGET]: docOf(at('a32/1', 'Paywall', { content: { heading: 'Read on' } })) }
  const out = compile(templates, { library: withPrivate, pageTwo: { ...projectTwo(), 'tag.hbs': docOf(at('a17/1', 'Older', { isMainFeed: true })) } })
  const files = Object.keys(out).filter((p) => p.endsWith('.hbs') && !p.startsWith('partials/sections/'))
  for (const want of ['default.hbs', 'home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs', 'error.hbs', 'private.hbs', PAYWALL_TARGET, 'post.hbs']) assert.ok(files.includes(want), `${want} was not compiled: ${files.join(' ')}`)
  for (const [path, body] of rendered(out)) {
    const carries = body.includes('<article') || body.includes('post_class')
    assert.equal(carries, path === 'post.hbs', `${path}: ${carries ? 'carries' : 'lacks'} the article`)
  }
  assert.equal((out['post.hbs']?.match(/<article\b/g) ?? []).length, 1)
  assert.deepEqual(checkGhostMarkup(out), [])
})

test('(7.6) a picture: each srcset is srcsetExpr of its path — one candidate per image_sizes key asking for WebP, in the map\'s order — on a tag with the design\'s sizes; src unchanged', () => {
  const hero = compileProject()['partials/sections/home/latest-post.hbs'] ?? ''
  const want = Object.entries(IMAGE_SIZES).map(([key, width]) => `{{img_url feature_image size="${key}" format="webp"}} ${width}w`).join(', ')
  assert.equal(srcsetExpr('feature_image'), want)
  assert.ok(hero.includes(`srcset="${want}"`), hero)
  assert.ok(hero.includes('sizes="(max-width: 767px) 108px, 434px"'), hero)
  assert.ok(hero.includes('src="{{img_url feature_image size="l"}}"'), `src keeps the picture's own format: ${hero}`)
  // the format is a constant, never the design's: a path that is not a Ghost path is refused before any format is written
  assert.throws(() => srcsetExpr('feature_image" format="png'), /AD-36/)
})

test('(7.6) a srcset without sizes: the compile throws checkGhostMarkup\'s sentence, naming the file', () => {
  const bare = (id: string) => (id === 'a4/13' ? { ...(LIB['a4/13'] as SectionRegistryEntry), html: (LIB['a4/13'] as SectionRegistryEntry).html.replace(/ sizes="[^"]*"/, '') } : LIB[id])
  assert.throws(() => compile({ 'home.hbs': docOf(at('a4/13', 'Lead', { content: { eyebrow: 'Issue 9' } })) }, { library: bare }),
    /^Error: the theme's markup: partials\/sections\/home\/lead\.hbs: <img> carries a srcset and no sizes/)
  const site = compileProject()
  const file = 'partials/sections/home/latest-post.hbs'
  const unsized = (site[file] ?? '').replace(/\n *sizes="[^"]*"/, '')
  assert.deepEqual(checkGhostMarkup({ [file]: unsized }), [`${file}: <img> carries a srcset and no sizes — without sizes the browser assumes the full viewport width and fetches the largest file (NFR-2 (1)).`])
  // a srcset that is not srcsetExpr's — the old one, with no format — is named too
  const old = (site[file] ?? '').replaceAll(' format="webp"', '')
  assert.match(checkGhostMarkup({ [file]: old }).join('\n'), /^partials\/sections\/home\/latest-post\.hbs: <img> srcset="\{\{img_url feature_image size="xs"\}\} 150w, .* 2000w" is not the theme's own/)
})

test('(7.6) Portal: a page both majors\' Portal opens passes, a bound id read as an id; anything else is named with its file and value', () => {
  const tag = (v: string) => ({ 'partials/sections/home/x.hbs': `<a href="#" data-portal="${v}">{{t "member.signup_cta"}}</a>\n` })
  for (const v of ['signup', 'account/plans', 'signup/{{id}}/monthly', 'signup/free', 'signup/', 'offers/abc123', 'signin', 'account', 'account/profile', 'account/newsletters', 'account/newsletters/help', 'account/newsletters/disabled', 'support', 'support/success', 'support/error', 'recommendations']) {
    assert.deepEqual(checkGhostMarkup(tag(v)), [], v)
  }
  for (const v of ['sigup', 'share', 'gift', 'signin/', '']) {
    assert.deepEqual(checkGhostMarkup(tag(v)).map((s) => s.split(' — ')[0]), [`partials/sections/home/x.hbs: data-portal="${v}" is no page Portal opens`], v)
  }
  // a bare attribute is the empty value
  assert.equal(checkGhostMarkup({ 'x.hbs': '<a href="#" data-portal>x</a>' }).length, 1)
  // the Link Picker's own actions are Portal pages, and a customer's words naming data-portal form no start tag
  for (const action of Object.keys(PORTAL_ACTIONS)) assert.ok(PORTAL_PAGE.test(action), action)
  assert.deepEqual(checkGhostMarkup({ 'x.hbs': '<p>data-portal="share" &lt;a data-portal="gift"&gt;</p>\n' }), [])
})

test('(7.6) a member\'s own data: a value or a hash argument naming @member is refused (AD-38); a block helper\'s condition passes', () => {
  for (const m of ['{{@member.email}}', '{{@member.name}}', '{{t "member.greeting" name=@member.name}}', '{{#if (eq tier=@member.status)}}x{{/if}}', '{{#get "posts" filter="author:{{@member.id}}"}}x{{/get}}']) {
    const got = checkGhostMarkup({ 'partials/sections/home/x.hbs': `<p>${m}</p>\n` })
    assert.equal(got.length, 1, m)
    assert.match(got[0] ?? '', /^partials\/sections\/home\/x\.hbs: .* prints a member's own data — .* \(AD-38\)/, m)
  }
  for (const m of ['{{#if @member}}a{{/if}}', '{{#if @member.paid}}a{{/if}}', '{{#if @member}}a{{else if @member.paid}}b{{/if}}', '{{^if @member}}a{{/if}}', '{{#unless @member}}a{{/unless}}']) {
    assert.deepEqual(checkGhostMarkup({ 'x.hbs': `<p>${m}</p>\n` }), [], m)
  }
  // a Handlebars comment is never read
  assert.deepEqual(checkGhostMarkup({ 'x.hbs': '{{!-- {{@member.email}} --}}\n' }), [])
})

test('(7.6) Ghost\'s helpers out of place: each is named by checkGhostMarkup; the compiled theme is clean', () => {
  const site = compileProject()
  assert.deepEqual(checkGhostMarkup(site), [])
  const shell = site['default.hbs'] ?? ''
  const head = shell.replace('    {{ghost_head}}\n', '').replace('    <link rel="stylesheet"', '    {{ghost_head}}\n    <link rel="stylesheet"')
  // Story 7.11: <body>'s line now carries the pin after {{body_class}}, so each plant on it is anchored on the line's
  // opening and asserted to change the text — a replace that finds nothing would make its row vacuous
  const plant = (from: string, to: string): string => {
    const out = shell.replace(from, to)
    assert.notEqual(out, shell, `the plant ${JSON.stringify(from)} changed nothing`)
    return out
  }
  const cases: [string, Record<string, string>, RegExp][] = [
    ['ghost_head above the stylesheet link', { ...site, 'default.hbs': head }, /^default\.hbs: \{\{ghost_head\}\} is not the last line before <\/head>/],
    ['a second ghost_foot', { ...site, 'default.hbs': shell.replace('{{ghost_foot}}', '{{ghost_foot}}\n    {{ghost_foot}}') }, /^default\.hbs: \{\{ghost_foot\}\} appears 2 times/],
    ['ghost_foot in a section', { ...site, 'partials/sections/home/newsletter.hbs': `${site['partials/sections/home/newsletter.hbs']}{{ghost_foot}}\n` }, /^partials\/sections\/home\/newsletter\.hbs: \{\{ghost_foot\}\} appears 1 time — /],
    ['post_class on <body>', { ...site, 'default.hbs': plant(BODY_OPEN, `${BODY_OPEN} {{post_class}}`) }, /^default\.hbs: \{\{post_class\}\} outside <article/],
    ['post_class outside POST_ARTICLE', { ...site, 'home.hbs': `${site['home.hbs']}<div class="{{post_class}}"></div>\n` }, /^home\.hbs: \{\{post_class\}\} outside <article/],
    ['the article removed', { ...site, 'post.hbs': (site['post.hbs'] ?? '').replace(`  ${POST_ARTICLE}\n`, '').replace('  </article>\n', '') }, /^post\.hbs: the first line inside \{\{#post\}\} is not <article/],
    ['body_class in a section', { ...site, 'partials/sections/home/newsletter.hbs': `<div class="{{body_class}}"></div>\n${site['partials/sections/home/newsletter.hbs']}` }, /^partials\/sections\/home\/newsletter\.hbs: \{\{body_class\}\} appears 1 time/],
    ['body_class off <body>', { ...site, 'default.hbs': plant(BODY_LINE, '<body>').replace('<main id="site-main">', '<main id="site-main" class="{{body_class}}">') }, /^default\.hbs: <body>'s class does not open with \{\{body_class\}\}/],
  ]
  for (const [what, files, pattern] of cases) assert.match(checkGhostMarkup(files).join('\n'), pattern, what)
  // a later story's class after it is allowed — Story 7.11's pin is one, and the compiled theme above carries it
  assert.ok(shell.includes(BODY_LINE), shell)
  assert.deepEqual(checkGhostMarkup({ ...site, 'default.hbs': plant(BODY_LINE, '<body class="{{body_class}} scheme-dark">') }), [])
})

test('(7.6) V1 at compile: a label typed into a template is named with its file; a customer\'s words, a marker, and a comment are not', () => {
  const U = (n: number) => `${U0}${n}${U1}`
  assert.deepEqual(checkChromeText(doc(), { 'default.hbs': '<a href="#site-main">Skip to content</a>\n' }), ['default.hbs: <a> "Skip to content" is a label typed into the template, which no customer can translate — it reaches a theme only through {{t}} (V1, FR-Q6).'])
  assert.match(checkChromeText(doc(), { 'partials/sections/default/header.hbs': '<img class="a1-1__logo" alt="Logo" src="{{@site.logo}}">\n' }).join(''), /^partials\/sections\/default\/header\.hbs: <img alt="Logo">/)
  // clean: {{t}}, a bound value, a marker, a Handlebars comment, a stylesheet's body, a script's, and no letter at all
  const clean = {
    'default.hbs': `<title>{{meta_title}}</title>\n<style>\n  @font-face { font-family: 'Inter'; }\n</style>\n<script>var a = 1</script>\n<a href="#">{{t "nav.more"}}</a>\n`,
    'home.hbs': `{{!< default}}\n{{!-- Latest post · Heroes · Latest Post --}}\n<p class="x">${U(0)}</p>\n<img alt="${U(1)}" src="{{img_url feature_image size="m"}}">\n<span aria-hidden="true">·</span>\n{{{body}}}\n`,
  }
  assert.deepEqual(checkChromeText(doc(), clean), [])
  // the compile's own tree carries no typed label: a customer's hostile words are markers until substitution
  assert.doesNotThrow(() => compileProject())
  // and the compile throws on its own output: a text binding's authored fallback is English no customer can translate
  const fallback = (id: string) => (id === 'a24/1' ? { ...(LIB['a24/1'] as SectionRegistryEntry), html: '<section class="a24-1">\n  <h1 class="a24-1__title" data-bind="title">Untitled</h1>\n</section>' } : LIB[id])
  assert.throws(() => compile({ 'post.hbs': docOf(at('a24/1', 'Header')) }, { library: fallback }), /^Error: the theme's markup: .*partials\/sections\/post\/header\.hbs: <h1> "Untitled" is a label typed into the template/)
})

// ─── Story 7.10: the promoted settings ────────────────────────────────────────────────────────────────────────────────

/** A Hero with every kind a section can promote — a switch, a choice, a text, a rich text and a picture — and a second
 *  design of its category that carries none of them, for the shuffle's park. */
const PROMO = design('a4/2', 'Promo', {
  compileTarget: ['home.hbs', 'index.hbs'],
  contentSchema: { headline: text('Headline'), sub: { type: 'richtext', label: 'Sub', marks: ['a'] } as PropDef, picture: { type: 'image', label: 'Picture' } as PropDef },
  controlSchema: [
    { name: 'primary-action', type: 'toggle', label: 'Primary action', group: 'content', values: ['on', 'off'], default: 'on' },
    { name: 'headline-size', type: 'segmented', label: 'Headline size', group: 'style', values: ['medium', 'large', 'display'], default: 'large' },
  ] as ControlDef[],
  css: '.a4-2 { color: var(--text-body); }\n.a4-2[data-headline-size="medium"] .a4-2__h { font-size: 1rem; }\n.a4-2[data-headline-size="large"] .a4-2__h { font-size: 2rem; }\n.a4-2[data-headline-size="display"] .a4-2__h { font-size: 3rem; }\n.a4-2[data-primary-action="off"] .a4-2__sub { display: none; }\n',
  html: `<section class="a4-2">
  <h1 class="a4-2__h" data-prop="headline" data-empty="hide">Headline</h1>
  <p class="a4-2__sub" data-prop="sub" data-empty="hide">Sub</p>
  <img class="a4-2__picture" data-prop-attr="src:picture" data-empty="hide" alt="">
</section>`,
})
const PLAIN = design('a4/3', 'Plain', {
  compileTarget: ['home.hbs', 'index.hbs'],
  contentSchema: PROMO.contentSchema,
  html: '<section class="a4-3">\n  <h1 class="a4-3__h" data-prop="headline" data-empty="hide">Headline</h1>\n</section>',
})
const PROMO_LIB: Record<string, SectionRegistryEntry> = { ...LIB, 'a4/2': PROMO, 'a4/3': PLAIN }
const SUB_WORDS = { text: 'One essay, every Thursday.', marks: [{ start: 17, end: 25, mark: 'a', href: 'https://example.com' }] }
const promoHome = (over: Partial<DocInstance> = {}) => docOf(at('a4/2', 'Latest post', {
  instanceId: 'promo-0001-zq', content: { headline: 'Big words', sub: SUB_WORDS, picture: 'asset-1' }, controls: { 'headline-size': 'display' }, ...over,
}))
let position = 0
const row = (key: string, type: CompileSetting['type'], bound_to: unknown, over: Partial<CompileSetting> = {}): CompileSetting =>
  ({ key, type, group_name: 'homepage', visibility_condition: null, bound_to, position: ++position, ...over })
const control = (controlKey: string) => ({ kind: 'control', instanceId: 'promo-0001-zq', controlKey })
const propOf = (path: string) => ({ kind: 'prop', instanceId: 'promo-0001-zq', path })
const ALL = (): CompileSetting[] => [
  row('show_the_button', 'boolean', control('primary-action')),
  row('headline_size', 'select', control('headline-size'), { visibility_condition: { key: 'show_the_button', value: true } }),
  row('sub', 'text', propOf('sub'), { group_name: 'site_wide' }),
  row('picture', 'image', propOf('picture')),
  row('accent_colour', 'color', { kind: 'token', token: 'accent' }, { group_name: 'site_wide' }),
]
const promote = (settings: readonly CompileSetting[], home = promoHome(), over: Partial<CompileInput> = {}) =>
  build({ 'home.hbs': home }, { pageTwo: projectTwo(), library: (id) => PROMO_LIB[id], assets: { 'asset-1': 'https://cdn.example/one.png' }, settings, ...over })
const custom = (t: CompiledTheme) => (JSON.parse(t.files['package.json'] as string) as { config: Record<string, unknown> }).config
/** Story 7.11 — the three dark built-ins as a Light + Dark Paper project declares them, after any user setting */
const BUILT_INS = {
  color_scheme: { type: 'select', options: ['Auto', 'Light', 'Dark'], default: 'Auto' },
  dark_accent_color: { type: 'color', default: REFERENCE_PACK.dark.accent },
  dark_logo: { type: 'image' },
}
const sectionOf = (t: CompiledTheme) => textOf(t.files)['partials/sections/home/latest-post.hbs'] ?? ''

test('(7.10) every kind compiles: config.custom carries each live setting last in config, in position order, at the start the CANVAS holds — and each key is read', () => {
  const t = promote(ALL())
  const config = custom(t)
  assert.equal(Object.keys(config).at(-1), 'custom', 'custom is last in config')
  assert.deepEqual(config['custom'], {
    show_the_button: { type: 'boolean', default: true, group: 'homepage' },
    headline_size: { type: 'select', options: ['Medium', 'Large', 'Display'], default: 'Display', group: 'homepage', visibility: 'show_the_button:true' },
    sub: { type: 'text', default: 'One essay, every Thursday.' },
    picture: { type: 'image', group: 'homepage' },
    accent_colour: { type: 'color', default: REFERENCE_PACK.light.accent },
    // Story 7.11 (moved on purpose): the three dark built-ins follow the user's settings
    ...BUILT_INS,
  })
  assert.deepEqual(t.custom, { emitted: ['show_the_button', 'headline_size', 'sub', 'picture', 'accent_colour', ...Object.keys(BUILT_INS)], parked: [] })
  const section = sectionOf(t)
  // a switch and a choice: the root's one attribute is the setting's {{#match}} reader, its {{else}} the start
  assert.ok(section.includes('data-primary-action="{{#match @custom.show_the_button true}}on{{else match @custom.show_the_button false}}off{{else}}on{{/match}}"'), section)
  assert.ok(section.includes('data-headline-size="{{#match @custom.headline_size "=" "Medium"}}medium{{else match @custom.headline_size "=" "Large"}}large{{else match @custom.headline_size "=" "Display"}}display{{else}}display{{/match}}"'), section)
  // a text: Ghost's words, the element shown only while they are words, the link's words and never the link
  assert.match(section, /\{\{#if @custom\.sub\}\}\n\s*<p class="a4-2__sub">\{\{@custom\.sub\}\}<\/p>\n\s*\{\{\/if\}\}/)
  assert.doesNotMatch(section, /example\.com|One essay/)
  // a picture: Ghost's while set, else the section's own
  assert.ok(section.includes('src="{{#if @custom.picture}}{{img_url @custom.picture}}{{else}}https://cdn.example/one.png{{/if}}"'), section)
  // the stored default and options are never read: the canvas decides (Question 1)
  const stale = ALL().map((r) => ({ ...r, default_value: 'Medium', options: [{ value: 'x', label: 'X' }] }))
  assert.equal(custom(promote(stale))['custom'] !== undefined && JSON.stringify(custom(promote(stale))), JSON.stringify(config))
})

test('(7.10) a control another greys follows its promoted controller on the live site, and keeps its own reader where the canvas forces it', () => {
  // a4/13's pair: "A secondary action needs a primary beside it" — the theme must not show it alone when Ghost turns the primary off
  const PAIR = { ...PROMO, controlSchema: [...(PROMO.controlSchema ?? []), {
    name: 'secondary-action', type: 'toggle', label: 'Secondary action', group: 'content', values: ['on', 'off'], default: 'on',
    disabledBy: { control: 'primary-action', whenValue: 'off', inForce: 'off', reason: 'A secondary action needs a primary beside it.' },
  }] as ControlDef[], css: `${PROMO.css}.a4-2[data-secondary-action="off"] .a4-2__h { display: none; }\n` }
  const lib: Record<string, SectionRegistryEntry> = { ...PROMO_LIB, 'a4/2': PAIR }
  const pair = (settings: readonly CompileSetting[], home = promoHome()) => promote(settings, home, { library: (id) => lib[id] })
  const chain = '{{#match @custom.show_the_button true}}on{{else match @custom.show_the_button false}}off{{else}}on{{/match}}'
  // the controller promoted: the dependant reads the same setting, off wherever it is off
  let t = pair([row('show_the_button', 'boolean', control('primary-action'))])
  assert.ok(sectionOf(t).includes(`data-secondary-action="${chain}"`), sectionOf(t))
  assert.ok((textOf(t.files)['assets/css/screen.css'] ?? '').includes('[data-secondary-action="off"]'), 'the strip keeps every value of a following control')
  // control: nothing promoted, both baked as today
  t = pair([])
  assert.match(sectionOf(t), /data-secondary-action="on"/)
  assert.doesNotMatch(sectionOf(t), /@custom/)
  // the dependant promoted while the canvas's primary is off: every branch is the value in force, and the key is still read
  t = pair([row('show_the_secondary', 'boolean', control('secondary-action'))], promoHome({ controls: { 'headline-size': 'display', 'primary-action': 'off' } }))
  assert.ok(sectionOf(t).includes('data-secondary-action="{{#match @custom.show_the_secondary true}}off{{else match @custom.show_the_secondary false}}off{{else}}off{{/match}}"'), sectionOf(t))
})

test('(7.10) the accent: one guarded declaration in default.hbs\'s one settings <style>, naming no mode, screen.css\'s light block reading it through var(), the dark blocks unchanged by it', () => {
  const t = promote(ALL().filter((r) => r.key === 'accent_colour'))
  const shell = textOf(t.files)['default.hbs'] ?? ''
  // Story 7.11 (moved on purpose): 7.10's guarded element became one declaration of the ONE settings <style>, and the dark
  // accent falls back to the promoted accent before the pack's
  assert.ok(shell.includes([
    '    </style>',
    '    <style>:root{',
    '      {{#if @custom.accent_colour}}--setting-accent: {{@custom.accent_colour}};{{/if}}',
    '      {{#if @custom.dark_accent_color}}--setting-dark-accent: {{@custom.dark_accent_color}};{{else if @custom.accent_colour}}--setting-dark-accent: {{@custom.accent_colour}};{{/if}}',
    '      {{#if @custom.dark_logo}}--setting-dark-logo: url("{{@custom.dark_logo}}");{{/if}}',
    '    }</style>',
    // Story 7.13 (moved on purpose): cards.css's link, before screen.css (AD-18)
    '    <link rel="stylesheet" href="{{asset "css/cards.css"}}">',
    '    <link rel="stylesheet" href="{{asset "css/screen.css"}}">',
  ].join('\n')), shell)
  assert.doesNotMatch(unpinned(shell), MODE_NAMED, 'default.hbs names no mode outside the pin\'s chain (AD-30)')
  const screen = textOf(t.files)['assets/css/screen.css'] ?? ''
  assert.ok(screen.includes(packTokensCss(REFERENCE_PACK, { ghostFonts: true, settingAccent: true }).trimEnd().split('\n').slice(0, 3).join('\n')), 'the token block is the themed one')
  assert.ok(screen.includes(`--accent: var(--setting-accent, ${REFERENCE_PACK.light.accent});`))
  // the dark blocks are byte-identical to a theme without the accent
  const without = textOf(promote([]).files)['assets/css/screen.css'] ?? ''
  const dark = (css: string) => css.slice(css.indexOf(`@media ${MODE_SELECTORS.media}`))
  assert.equal(dark(screen), dark(without))
  const bare = textOf(promote([]).files)['default.hbs'] ?? ''
  assert.ok(!without.includes('--setting-accent') && !bare.includes('--setting-accent') && !bare.includes('@custom.accent_colour'), 'the control: no accent, no declaration')
  assert.ok(bare.includes('{{#if @custom.dark_accent_color}}--setting-dark-accent: {{@custom.dark_accent_color}};{{/if}}'), 'and the dark accent has no promoted accent to fall back on')
})

test('(7.10) every value of a promoted control survives the strip, and the root carries one attribute (AD-3)', () => {
  const t = promote([row('headline_size', 'select', control('headline-size'))])
  const sheet = t.css.sheets['a4/2'] ?? ''
  for (const v of ['medium', 'large', 'display']) assert.ok(sheet.includes(`[data-headline-size="${v}"]`), v)
  // the control: unpromoted at Display, the other two sizes are cut
  const baked = promote([]).css.sheets['a4/2'] ?? ''
  assert.ok(baked.includes('[data-headline-size="display"]') && !baked.includes('[data-headline-size="medium"]'))
  assert.equal((sectionOf(t).match(/data-headline-size=/g) ?? []).length, 1)
})

test('(7.10) parked by a shuffle: neither declared nor read, a condition naming it dropped from the other setting, and the record names it', () => {
  // the section shuffled to a design without the switch, the choice or the picture; the text it still prints stays live
  const shuffled = promoHome({ designId: 'a4/3', controls: {} })
  const settings = [...ALL().filter((r) => r.key !== 'accent_colour' && r.key !== 'sub'), row('headline', 'text', propOf('headline'), { visibility_condition: { key: 'show_the_button', value: true } })]
  const t = promote(settings, shuffled)
  assert.deepEqual(custom(t)['custom'], { headline: { type: 'text', default: 'Big words', group: 'homepage' }, ...BUILT_INS })
  assert.deepEqual(t.custom, { emitted: ['headline', ...Object.keys(BUILT_INS)], parked: ['show_the_button', 'headline_size', 'picture'] })
  for (const body of Object.values(textOf(t.files))) assert.doesNotMatch(body, /@custom\.(show_the_button|headline_size|picture)\b/)
  // every setting parked: the three built-ins alone (Story 7.11, moved on purpose)
  assert.deepEqual(custom(promote(ALL().filter((r) => r.key === 'picture'), shuffled))['custom'], BUILT_INS)
})

test('(7.10) a dangling, hidden, changed or over-cap project is refused with the module\'s sentence before anything renders', () => {
  const head = [row('headline_size', 'select', control('headline-size'))]
  assert.throws(() => promote(head, docOf(at('a4/2', 'Other', { instanceId: 'someone-else' }))), { message: SETTING_WORDS.deleted('Headline size') })
  assert.throws(() => promote(head, promoHome({ hidden: true })), { message: SETTING_WORDS.hidden('Headline size') })
  assert.throws(() => promote([row('headline_size', 'boolean', control('headline-size'))]), { message: SETTING_WORDS.changed('Headline size') })
  assert.throws(() => promote([row('headline_size', 'select', { kind: 'control', instanceId: 'promo-0001-zq' })]), { message: SETTING_WORDS.changed('Headline size') }, 'a binding no reader can read')
  const quoted = { ...PROMO, controlSchema: PROMO.controlSchema.map((c) => (c.name === 'headline-size' ? { ...c, valueLabels: { display: 'Display "XL"' } } : c)) }
  assert.throws(() => promote(head, undefined, { library: (id) => (id === 'a4/2' ? quoted : PROMO_LIB[id]) }), { message: SETTING_WORDS.changed('Headline size') }, 'a label a library update made unsafe')
  // DW-351: eighteen rows stored (two promotes in one instant) — refused before the binding is even read
  const many = Array.from({ length: USER_SETTING_CAP + 1 }, (_, i) => row(`setting_${i + 1}`, 'boolean', control('primary-action')))
  assert.throws(() => promote(many), { message: SETTING_WORDS.cap })
  // a stored condition naming a one-character key: the key's own rule, so 7.7's cascade is never reached
  assert.throws(() => promote([row('s', 'boolean', control('primary-action'))]), /A key needs at least two letters/)
  assert.throws(() => promote([row('show_the_button', 'boolean', control('primary-action'), { visibility_condition: { key: 'x', value: true } })]), /Only show when must name another setting/)
  // a condition on a value its target does not offer
  assert.throws(() => promote([row('headline_size', 'select', control('headline-size')), row('show_the_button', 'boolean', control('primary-action'), { visibility_condition: { key: 'headline_size', value: 'Huge' } })]), /Choose one of Headline size's values/)
})

test('(7.10) determinism: one input, one byte string, whatever order the settings and the docs arrive in', () => {
  const a = promote(ALL())
  const b = promote([...ALL()].reverse())
  assert.deepEqual(Object.keys(a.files), Object.keys(b.files))
  for (const path of Object.keys(a.files)) assert.deepEqual(a.files[path], b.files[path], path)
})

test('(7.10) the readers and the keys are one set: a theme that would declare a key nothing reads is refused rather than shipped', () => {
  // a hand-picked secondary feed with nothing picked renders nothing at all (Story 5.19), so a setting promoted from it
  // is live — visible, its design declares the control — and has no reader
  const home = docOf(at('a17/1', 'Main feed', { isMainFeed: true }), at('a17/1', 'Picked', { instanceId: 'picked-0001-zq', data: { posts: { source: 'picked', picks: [] } } }))
  const perRow = [row('per_row', 'select', { kind: 'control', instanceId: 'picked-0001-zq', controlKey: 'per-row' })]
  assert.throws(() => promote(perRow, home), /^Error: the theme's settings: Per row is declared and nothing reads it — a setting ships with the line that reads it/)
  // the control: one post picked, and the same setting is read
  const one = docOf(at('a17/1', 'Main feed', { isMainFeed: true }), at('a17/1', 'Picked', { instanceId: 'picked-0001-zq', data: { posts: { source: 'picked', picks: [{ id: '5f0000000000000000000001', title: 'One' }] } } }))
  assert.ok(Object.values(textOf(promote(perRow, one).files)).some((b) => b.includes('{{#match @custom.per_row "=" "Three"}}three')))
})

// ─── Story 7.11: the three dark built-ins, always declared and always referenced ────────────────────────────────────

/** `default.hbs`'s one settings `<style>`, as its lines — from `<style>:root{` to `}</style>` */
const settingsStyleOf = (shell: string): string => shell.slice(shell.indexOf('<style>:root{'), shell.indexOf('}</style>') + '}</style>'.length)
const STYLE_NO_ACCENT = [
  '<style>:root{',
  '      {{#if @custom.dark_accent_color}}--setting-dark-accent: {{@custom.dark_accent_color}};{{/if}}',
  '      {{#if @custom.dark_logo}}--setting-dark-logo: url("{{@custom.dark_logo}}");{{/if}}',
  '    }</style>',
].join('\n')

test('(7.11) a Light + Dark project: config.custom is the three built-ins at their starts (Color scheme on Auto), <body> carries the pin\'s chain, the settings <style> sets the dark accent and the dark logo each guarded, and the dark blocks read them', () => {
  const t = build({}, { darkEnabled: true })
  const files = textOf(t.files)
  assert.deepEqual(custom(t)['custom'], BUILT_INS)
  assert.deepEqual(t.custom, { emitted: Object.keys(BUILT_INS), parked: [] })
  const shell = files['default.hbs'] ?? ''
  assert.ok(shell.includes(`\n  ${BODY_LINE}\n`), shell)
  assert.equal(settingsStyleOf(shell), STYLE_NO_ACCENT)
  // ONE settings <style>, after the faces' element and before the stylesheet
  assert.equal(shell.split('<style>:root{').length, 2)
  assert.ok(shell.indexOf('@font-face') < shell.indexOf('<style>:root{') && shell.indexOf('}</style>') < shell.indexOf('{{asset "css/screen.css"}}'), shell)
  // the token block is the theme's, with the dark built-ins: both dark blocks read the dark accent, and the logo rule follows each
  const screen = files['assets/css/screen.css'] ?? ''
  assert.equal((screen.match(new RegExp(`--accent: var\\(--setting-dark-accent, ${REFERENCE_PACK.dark.accent}\\);`, 'g')) ?? []).length, 2, 'both dark blocks')
  assert.equal((screen.match(/\[data-site-logo\] \{ content: var\(--setting-dark-logo\); \}/g) ?? []).length, 2, 'one rule per dark condition')
  assert.ok(screen.includes(packTokensCss(REFERENCE_PACK, { ghostFonts: true, darkSettings: true }).trimEnd().split('\n').slice(0, 3).join('\n')))
})

test('(7.11) a Light only project takes the same path: the same three entries and readers, Color scheme starting on Light (Question 1), no section hook, and the pack\'s dark map standing', () => {
  const dark = at('a22/1', 'Dark box', { content: NEWS, ...DARK })
  const [off, on] = [false, true].map((darkEnabled) => build({ 'home.hbs': docOf(dark) }, { library: groundedLib, pageTwo: projectTwo(), darkEnabled }))
  const [offFiles, onFiles] = [textOf((off as CompiledTheme).files), textOf((on as CompiledTheme).files)]
  assert.deepEqual(custom(off as CompiledTheme)['custom'], { ...BUILT_INS, color_scheme: { ...BUILT_INS.color_scheme, default: 'Light' } })
  // the one difference in package.json is that start; default.hbs is byte-identical — the readers are no special case
  assert.equal(offFiles['package.json'], (onFiles['package.json'] ?? '').replace('"default": "Auto"', '"default": "Light"'))
  assert.notEqual(offFiles['package.json'], onFiles['package.json'], 'the control: the start differs')
  assert.equal(offFiles['default.hbs'], onFiles['default.hbs'])
  // no hook, and the pack's dark map stands, reading the dark built-ins (Story 7.4's rule, unchanged)
  assert.deepEqual(hooksIn((off as CompiledTheme).files), [])
  const global = (off as CompiledTheme).css.global
  assert.ok(global.includes(`${MODE_SELECTORS.explicit.join(', ')} {`) && global.includes('--setting-dark-accent') && global.includes('[data-site-logo]'), 'the dark map, with the built-ins')
  // determinism: the same input, the same bytes
  const again = build({ 'home.hbs': docOf(dark) }, { library: groundedLib, pageTwo: projectTwo(), darkEnabled: false })
  for (const path of Object.keys((off as CompiledTheme).files)) assert.deepEqual(again.files[path], (off as CompiledTheme).files[path], path)
})

test('(7.11) the built-ins follow the user\'s settings in position order, and the record lists them all; a promoted accent is the dark accent\'s fallback before the pack\'s', () => {
  const t = promote(ALL())
  assert.deepEqual(Object.keys(custom(t)['custom'] as object), ['show_the_button', 'headline_size', 'sub', 'picture', 'accent_colour', 'color_scheme', 'dark_accent_color', 'dark_logo'])
  assert.deepEqual(t.custom.emitted, Object.keys(custom(t)['custom'] as object))
  const style = settingsStyleOf(textOf(t.files)['default.hbs'] ?? '')
  assert.ok(style.includes('{{#if @custom.dark_accent_color}}--setting-dark-accent: {{@custom.dark_accent_color}};{{else if @custom.accent_colour}}--setting-dark-accent: {{@custom.accent_colour}};{{/if}}'), style)
  // Story 7.11's review — the chain RENDERED as Ghost renders it (Handlebars 4.7.9): the Dark accent color when set, else
  // the promoted accent, else no declaration, so the token block's own var() falls back to the pack's dark accent
  const darkAccentOf = (custom: Record<string, string | null>): string => {
    const out = Handlebars.compile(style)({}, { data: { custom: { dark_logo: null, ...custom } } })
    const doc = new JSDOM(`<!DOCTYPE html><html><head>${out}</head><body></body></html>`).window.document as unknown as Page
    return ((doc.querySelector('style') as unknown as { sheet: { cssRules: ArrayLike<Rule> } }).sheet.cssRules[0] as Rule).style.getPropertyValue('--setting-dark-accent').trim()
  }
  assert.equal(darkAccentOf({ dark_accent_color: '#3366FF', accent_colour: '#123456' }), '#3366FF', 'the Dark accent color, set')
  assert.equal(darkAccentOf({ dark_accent_color: null, accent_colour: '#123456' }), '#123456', 'missing: the promoted accent')
  assert.equal(darkAccentOf({ dark_accent_color: null, accent_colour: null }), '', 'neither: no declaration — the pack\'s, in screen.css\'s var()')
  // every declared key is read, and every reader declared — the last assertion passed, so GS100 and GS090 cannot fire
  const read = new Set(Object.values(textOf(t.files)).flatMap((b) => [...b.matchAll(/@custom\.([a-z0-9_]+)/g)].map((m) => m[1] as string)))
  assert.deepEqual([...read].sort(), Object.keys(custom(t)['custom'] as object).sort())
})

test('(7.11) a user\'s key equal to a built-in is refused with the module\'s sentence, as before; the built-ins never count toward the user\'s cap', () => {
  for (const key of ['color_scheme', 'dark_accent_color', 'dark_logo']) {
    assert.throws(() => promote([row(key, 'image', propOf('picture'))]), { message: `${JSON.stringify(key)}: ${SETTING_WORDS.reserved(key)}` }, key)
  }
  // eighteen user rows are still the cap's refusal (DW-351), whatever the built-ins add
  const many = Array.from({ length: USER_SETTING_CAP + 1 }, (_, i) => row(`setting_${i + 1}`, 'boolean', control('primary-action')))
  assert.throws(() => promote(many), { message: SETTING_WORDS.cap })
  // Story 7.11's review — and a user's condition can never name one: its target is looked for among the user's own
  // settings, so a built-in is "another setting" no more than a key that does not exist (the 7.10 row's sentence)
  for (const key of ['color_scheme', 'dark_accent_color', 'dark_logo']) {
    assert.throws(() => promote([row('show_the_button', 'boolean', control('primary-action'), { visibility_condition: { key, value: 'Dark' } })]), /Only show when must name another setting/, key)
  }
})

test('(7.11) AD-30: only the token block names a mode — default.hbs names the pin\'s two class names inside <body>\'s Color scheme chain and nowhere else, and no other emitted template names one', () => {
  const t = textOf(build(project(), { pageTwo: projectTwo() }).files)
  assert.doesNotMatch(unpinned(t['default.hbs'] ?? ''), MODE_NAMED)
  for (const [path, body] of Object.entries(t)) if (path.endsWith('.hbs') && path !== 'default.hbs') assert.doesNotMatch(body, MODE_NAMED, path)
  // the control: the stylesheet does name one
  assert.match(t['assets/css/screen.css'] ?? '', MODE_NAMED)
})

test('(7.11) R-34: a design\'s comments ship as bare {{comments}}, never with a mode — the widget takes it from the colours the pin resolves', () => {
  const commentsLib = (id: string) => (id === 'a24/1' ? { ...(LIB['a24/1'] as SectionRegistryEntry), html: '<section class="a24-1">\n  <h1 class="a24-1__title" data-bind="title" data-empty="hide">Title</h1>\n  <div class="a24-1__comments" data-helper="comments"></div>\n</section>' } : LIB[id])
  const t = textOf(build({ 'post.hbs': docOf(at('a24/1', 'Header')) }, { library: commentsLib }).files)
  const all = Object.values(t).join('\n')
  assert.ok(all.includes('{{comments}}'), 'the control: the helper is emitted')
  assert.doesNotMatch(all, /\{\{comments\s+[^}]/, 'no argument on any {{comments}}')
})

/** The settings `<style>` rendered as Ghost renders it — Handlebars 4.7.9, `@custom` as Ghost's data — inside a page. */
type Page = { querySelector(s: string): unknown; querySelectorAll(s: string): ArrayLike<unknown> }
type Rule = { selectorText: string; style: { getPropertyValue(p: string): string } }
function headWith(darkLogo: string | null, darkAccent: string | null = REFERENCE_PACK.dark.accent): Page {
  const style = settingsStyleOf(textOf(build({}).files)['default.hbs'] ?? '')
  const out = Handlebars.compile(style)({}, { data: { custom: { dark_logo: darkLogo, dark_accent_color: darkAccent } } })
  return new JSDOM(`<!DOCTYPE html><html><head>${out}</head><body><p id="p">x</p></body></html>`).window.document as unknown as Page
}

test('(7.11) AD-36: a hostile Dark logo is inert in the head — written inside the url() string as entities, so no rule, element or script is created — beside a legitimate one that draws', () => {
  const legit = 'https://site.example/content/images/2026/10/dark-logo.png'
  const good = headWith(legit)
  const sheet = (d: Page) => (d.querySelector('style') as unknown as { sheet: { cssRules: ArrayLike<Rule> } }).sheet
  const rule = (d: Page) => sheet(d).cssRules[0] as Rule
  assert.equal(sheet(good).cssRules.length, 1)
  assert.match(rule(good).style.getPropertyValue('--setting-dark-logo').trim(), new RegExp(`^url\\("?${legit.replace(/[.]/g, '\\.')}"?\\)$`))
  assert.equal(rule(good).style.getPropertyValue('--setting-dark-accent').trim(), REFERENCE_PACK.dark.accent)
  for (const hostile of [
    'x");}body{display:none}</style><script>document.title="pwned"</script>',
    "x');}body{display:none}",
    'x"><img src=x onerror=alert(1)>',
  ]) {
    const d = headWith(hostile)
    assert.equal(d.querySelectorAll('style').length, 1, `${hostile}: one <style>`)
    assert.equal(d.querySelectorAll('script, img').length, 0, `${hostile}: no element`)
    assert.equal((d.querySelector('#p') as { textContent: string } | null)?.textContent, 'x', hostile)
    assert.equal(sheet(d).cssRules.length, 1, `${hostile}: no rule but :root's`)
    assert.equal(rule(d).selectorText, ':root', hostile)
  }
  // unset (Ghost forbids an image default) and hidden (null): no declaration at all, so `content` falls back to the picture
  for (const none of [null, '']) assert.equal(rule(headWith(none)).style.getPropertyValue('--setting-dark-logo'), '', String(none))
  // CEILING, executed and stated rather than hidden (found at Story 7.11's Dev): Handlebars does not escape a line break,
  // and a line break ends a CSS string, so a value carrying one DOES add a CSS rule — never an element or a script, since
  // `<` is still an entity. Ghost does not validate an image setting, but only the Administrator role (and the Owner) may
  // write `custom_theme_settings` — read in both majors' `fixtures.json`, 5.130.6 and 6.58.0: no Editor, Author,
  // Contributor or integration — and an Administrator already holds Code Injection, so no one gains a power they lack. It
  // is accepted as a stated limit (Story 7.11's Question 3, ruled option 1 (owner, 2026-10-14)); a fix turns the second count below to one.
  const broken = headWith('x\n");}#p{display:none}')
  assert.equal(broken.querySelectorAll('style').length, 1)
  assert.equal(broken.querySelectorAll('script, img').length, 0)
  assert.equal(sheet(broken).cssRules.length, 2, 'the ceiling: a line break in the value adds one CSS rule')
  // the second ceiling: Handlebars writes `=` and `&` as entities too, which a <style> never decodes, so a URL with a query
  // string reaches CSS altered and does not load (Chromium draws an empty box in dark, executed at the review) — Ghost's
  // own uploads carry neither: `ghost-storage-base`'s `getSanitizedFileName` turns every character but `[\w@.]` into `-`
  // (1.0.0 for Ghost 5.130.6, 3.0.0 for 6.58.0, read in source), under `/content/images/<year>/<month>/`
  assert.match(rule(headWith('https://x.example/a.png?w=1&h=2')).style.getPropertyValue('--setting-dark-logo'), /&#x3D;1&amp;h/)
})

// ── Story 7.12 — the locale files (FR-Q6, FR-Q8) and the language's faces (§D.b) ──────────────────────────────────────

const LOCALE_KEYS = Object.keys(CATALOG.keys).filter((k) => !(CATALOG.keys[k]?.marks ?? []).includes('canvas'))
const localesOf = (files: Record<string, string>): string[] => Object.keys(files).filter((p) => p.startsWith('locales/'))
const parsed = (text: string | undefined): Record<string, string> => JSON.parse(text ?? 'null') as Record<string, string>
const ES = { 'post.reading_time': '{minutes} min de lectura', 'nav.more': 'Más' }

test('(7.12) an en project: exactly one locale file, en.json, carrying the overrides — every key but the canvas ones, in catalog order, credit.* verbatim, retired keys kept', () => {
  const files = compile({}, { strings: resolveStrings(ES) })
  assert.deepEqual(localesOf(files), ['locales/en.json'])
  const en = parsed(files['locales/en.json'])
  assert.deepEqual(Object.keys(en), LOCALE_KEYS, 'catalog order, no canvas key')
  assert.equal(en['post.reading_time'], '{minutes} min de lectura')
  assert.equal(en['credit.built_with'], CATALOG.keys['credit.built_with']?.en)
  assert.ok(Object.keys(en).some((k) => CATALOG.keys[k]?.retired !== undefined), 'a retired key still ships (S4)')
  assert.ok(!Object.keys(en).some((k) => CATALOG.keys[k]?.marks.includes('canvas')))
  // the stress harness's shape, byte for byte
  assert.equal(files['locales/en.json'], `${JSON.stringify(en, null, 2)}\n`)
  // the control: with no strings, en.json is the catalog's English
  assert.equal(parsed(compile({})['locales/en.json'])['post.reading_time'], '{minutes} min read')
})

test('(7.12) language es with overrides: en.json the English defaults, es.json the overrides over them — equal key sets, catalog order', () => {
  const files = compile({}, { language: 'es', strings: resolveStrings(ES) })
  assert.deepEqual(localesOf(files), ['locales/en.json', 'locales/es.json'])
  const en = parsed(files['locales/en.json'])
  const es = parsed(files['locales/es.json'])
  assert.deepEqual(Object.keys(en), LOCALE_KEYS)
  assert.deepEqual(Object.keys(es), LOCALE_KEYS)
  assert.equal(en['post.reading_time'], '{minutes} min read')
  assert.equal(es['post.reading_time'], '{minutes} min de lectura')
  assert.equal(es['pagination.older'], englishStrings()['pagination.older'], 'a key not overridden is the default')
  assert.equal(es['credit.built_with'], en['credit.built_with'])
})

test('(7.12) the language is the file name exactly, case included: pt-BR writes locales/pt-BR.json, de-DE never de.json', () => {
  assert.deepEqual(localesOf(compile({}, { language: 'pt-BR' })), ['locales/en.json', 'locales/pt-BR.json'])
  assert.deepEqual(localesOf(compile({}, { language: 'de-DE' })), ['locales/de-DE.json', 'locales/en.json'])
})

test('(7.12, AD-36) a language that is a path is refused before any file is written; the legitimate code compiles', () => {
  for (const bad of ['../package', '..', 'a/b', 'en.json', ' en', '']) {
    assert.throws(() => build({}, { language: bad }), /^Error: language .*Enter a language code like pt-BR or sr-Cyrl\..*AD-36/, JSON.stringify(bad))
  }
  assert.ok(Object.hasOwn(build({}, { language: 'sr-Cyrl' }).files, 'locales/sr-Cyrl.json'), 'the control')
})

test('(7.12) a stored override the judge refuses fails the build, naming the file, the key and the sentence; its valid twin ships', () => {
  const broken = { ...englishStrings(), 'nav.more': 'Más {' }
  assert.throws(() => build({}, { language: 'es', strings: broken }), (e: Error) =>
    e.message === `locales/es.json: "nav.more" — ${OVERRIDE_WORDS.brace('{', 'Más {', [])}`)
  assert.throws(() => build({}, { strings: broken }), /^Error: locales\/en\.json: "nav\.more" — The “\{” in “Más \{”/)
  assert.equal(parsed(compile({}, { language: 'es', strings: { ...englishStrings(), 'nav.more': 'Más' } })['locales/es.json'])['nav.more'], 'Más')
  // a plural label carrying markup (DW-141), and a blank one (R-106), each refused by the same judge
  assert.throws(() => build({}, { strings: { ...englishStrings(), 'archive.posts_many': '% <b>posts</b>' } }), /"archive\.posts_many" — “<” can't be used/)
  assert.throws(() => build({}, { strings: { ...englishStrings(), 'nav.more': ' ' } }), new RegExp(OVERRIDE_WORDS.blank))
})

test('(7.12, V7) credit.* ships verbatim: an override reaching the compile fails it — and resolveStrings refuses one first', () => {
  assert.throws(() => resolveStrings({ 'credit.built_with': 'Made by me' }), /locked/)
  assert.throws(() => build({}, { strings: { ...englishStrings(), 'credit.built_with': 'Made by me' } }), /"credit\.built_with" carries an override, and credit\.\* ships verbatim/)
  // a retired key, which no surface lists, likewise
  const retired = Object.keys(CATALOG.keys).find((k) => CATALOG.keys[k]?.retired !== undefined) as string
  assert.throws(() => build({}, { strings: { ...englishStrings(), [retired]: 'x' } }), /no surface lists it/)
  // and a key the catalog does not hold
  assert.throws(() => build({}, { strings: { ...englishStrings(), 'no.such': 'x' } }), /"no\.such", which the catalog does not hold/)
})

test('(7.12) a key the handed strings leave out ships its English, and a value that is no string is refused, naming the file and the key (V3)', () => {
  const { 'nav.more': _gone, ...rest } = englishStrings()
  assert.equal(parsed(compile({}, { language: 'es', strings: rest })['locales/es.json'])['nav.more'], englishStrings()['nav.more'])
  assert.throws(() => build({}, { strings: { ...englishStrings(), 'nav.more': 7 as unknown as string } }), /^Error: locales\/en\.json: "nav\.more"'s string is not a string/)
})

test('(7.12, §D.b) Russian on Paper: Inter covers Cyrillic and ships its two whole faces, Fraunces keeps its latin pair; the preloads and the faces name the same files', () => {
  const { files } = build({}, { language: 'ru' })
  const want = pairingFiles('D1', 'cyrillic').map((f) => `assets/fonts/${f.file}`).sort()
  assert.deepEqual(fontsOf(files), want)
  assert.ok(want.some((p) => /\/inter-roman-full\.woff2$/.test(p)) && want.some((p) => /\/inter-italic-full\.woff2$/.test(p)), want.join(' '))
  assert.ok(!want.some((p) => p.includes('/inter-') && /-latin(-ext)?\.woff2$/.test(p)), 'no Inter subset file')
  assert.ok(want.includes('assets/fonts/fraunces-roman-latin.woff2') && want.includes('assets/fonts/fraunces-roman-latin-ext.woff2'))
  for (const path of fontsOf(files)) assert.deepEqual(files[path], poolFonts(`files/${path.slice('assets/fonts/'.length)}`), path)
  const shell = files['default.hbs'] as string
  assert.deepEqual(preloadsOf(shell), preloadFiles('D1', 'cyrillic'))
  assert.deepEqual(preloadsOf(shell), ['fraunces-roman-latin.woff2', 'inter-roman-full.woff2'])
  const faces = fontFaceCss('D1', (f) => `{{asset "fonts/${f.file}"}}`, { script: 'cyrillic' }).split('\n').map((l) => `      ${l}`).join('\n')
  assert.ok(shell.includes(`crossorigin>\n    <style>\n${faces}\n    </style>`), shell)
  // the control: an English Paper project ships the latin pairs, exactly as Story 7.4 wrote them
  assert.deepEqual(fontsOf(build({}).files), pairingFiles('D1').map((f) => `assets/fonts/${f.file}`).sort())
  assert.ok(!fontsOf(build({}).files).some((p) => p.endsWith('-full.woff2')))
})

test('(7.12, §D.b) Japanese on Paper: no family covers it, so every family keeps its latin pair; German stays latin', () => {
  for (const language of ['ja', 'de']) {
    assert.deepEqual(fontsOf(build({}, { language }).files), fontsOf(build({}).files), language)
  }
})


// ─── Story 7.13: cards.css, card_assets and Ghost's licence — the spec's I/O matrix as compile rows ───────────────────

const pkgCards = (files: CompiledTheme['files']): unknown => (JSON.parse(files['package.json'] as string) as { config: { card_assets: unknown } }).config.card_assets

test('(7.13) no card designed: card_assets true, cards.css D12\'s two widths alone, linked before screen.css, both before {{ghost_head}}; no licence of Ghost\'s', () => {
  for (const cardDesigns of [undefined, null, {}, { callout: { emoji: 'on' } }]) {
    const { files } = build(project(), { pageTwo: projectTwo(), ...(cardDesigns === undefined ? {} : { cardDesigns }) })
    assert.equal(pkgCards(files), true, JSON.stringify(cardDesigns))
    assert.equal(files['assets/css/cards.css'], KOENIG_WIDTHS)
    assert.ok(!('LICENSE-ghost.txt' in files))
    const head = headOf(files)
    assert.ok(head.includes(`${CARDS_STYLESHEET}\n${STYLESHEET}\n`), head)
    assert.ok(head.indexOf(CARDS_STYLESHEET) < head.indexOf('{{ghost_head}}'))
  }
})

test('(7.13) one static card: { callout: { emoji: off } } excludes callout alone; cards.css is cardsCss over Ghost\'s chunks; Ghost\'s licence; README names the block', () => {
  const cardDesigns = { callout: { emoji: 'off' } }
  const { files } = build({}, { cardDesigns })
  assert.deepEqual(pkgCards(files), { exclude: ['callout'] })
  assert.equal(files['assets/css/cards.css'], cardsCss(cardDesigns, GHOST_CARDS.styles))
  const css = files['assets/css/cards.css'] as string
  assert.ok(css.startsWith(KOENIG_WIDTHS) && css.includes(`/* callout.css */\n${cssBody('callout')}\n`), css)
  assert.match(ownCardsCss(css), /\.kg-callout-card \{ border-radius: var\(--radius-card\); \}\n/)
  assert.match(ownCardsCss(css), /\.kg-callout-card div\.kg-callout-emoji \{ display: none; \}\n$/)
  assert.equal(files['LICENSE-ghost.txt'], tidyLicence(GHOST_CARDS.licence))
  const readme = files['README.md'] as string
  assert.match(readme, /- `assets\/css\/cards\.css` styles the cards Ghost's editor puts in posts\. Its block from the comment naming Ghost to the comment "This theme's card settings" is Ghost's own stylesheet for these cards: callout, copied unchanged from Ghost 6\.58\.0 under the MIT licence in `LICENSE-ghost\.txt`\. The rest of the file is this theme's own: the cards' widths and its card settings\. `package\.json`'s `card_assets` switches off Ghost's own copy of these cards' styles\./)
})

test('(7.13) the header card excludes header AND header_v2 and copies both; a divider alone adds CSS and no name — card_assets stays true — with Tabler\'s licence for its glyph', () => {
  const header = build({}, { cardDesigns: { header: { height: 'generous' } } }).files
  assert.deepEqual(pkgCards(header), { exclude: ['header', 'header_v2'] })
  assert.ok((header['assets/css/cards.css'] as string).includes('/* header.css */\n') && (header['assets/css/cards.css'] as string).includes('/* header_v2.css */\n'))
  const divider = build({}, { cardDesigns: { divider: { glyph: 'on', icon: 'leaf' } } }).files
  assert.equal(pkgCards(divider), true)
  assert.match(divider['assets/css/cards.css'] as string, /^hr:not\(\[class\]\) \{ [^\n]*mask: url\("data:image\/svg\+xml,/m)
  assert.equal(divider['LICENSE-tabler.txt'], TABLER_LICENSE)
  // the control: the glyph off, nothing drawn, no Tabler licence (no placed section draws an icon in this project)
  assert.ok(!('LICENSE-tabler.txt' in build({}, { cardDesigns: { divider: { icon: 'leaf' } } }).files))
})

test('(7.13) scripted cards: a designed gallery and toggle copy their chunks into cards.css and their scripts into cards.js, and both are excluded', () => {
  const { files } = build({}, { cardDesigns: { gallery: { gutter: 'tight' }, toggle: { divider: 'rule' } } })
  assert.deepEqual(pkgCards(files), { exclude: ['gallery', 'toggle'] })
  assert.match(files['assets/css/cards.css'] as string, /Ghost's own styles for these cards: gallery · toggle — copied unchanged from Ghost 6\.58\.0/)
  assert.equal(files['assets/js/cards.js'], cardsJs(['gallery', 'toggle'], GHOST_CARDS.scripts))
  // the exclusion is derived from the directory: a chunk Ghost does not ship is neither excluded nor copied
  const { header_v2: _gone, ...styles } = GHOST_CARDS.styles
  const fewer = build({}, { cardDesigns: { header: { height: 'generous' } }, ghostCards: { ...GHOST_CARDS, styles } }).files
  assert.deepEqual(pkgCards(fewer), { exclude: excludedChunks({ header: { height: 'generous' } }, Object.keys(styles)) })
  assert.deepEqual(pkgCards(fewer), { exclude: ['header'] })
})

test('(7.13) no !important in a rule this theme writes — Ghost\'s own stay inside its copy; the control: one planted in a design\'s sheet, or in cards.css\'s own half, is refused', () => {
  const files = textOf(build({}, { cardDesigns: { audio: { accent: 'text' }, video: { bar: 'light' } } }).files)
  assert.match(files['assets/css/cards.css'] ?? '', /!important/, 'Ghost\'s copy keeps its own')
  assert.deepEqual(checkImportant(files), [])
  assert.deepEqual(checkImportant({ ...files, 'assets/css/cards.css': `${files['assets/css/cards.css']}.kg-audio-card { color: red !important; }\n` }), ['assets/css/cards.css carries !important outside Ghost\'s own block — a designed card is excluded, never overridden (FR-Q7)'])
  assert.equal(checkImportant({ ...files, 'default.hbs': `${files['default.hbs']}<style>.x { color: red ! important; }</style>\n` }).length, 1)
  // a comment that says it is no declaration
  assert.deepEqual(checkImportant({ ...files, 'assets/css/screen.css': `${files['assets/css/screen.css']}/* never !important */\n` }), [])
  const loud = design('a4/99', 'Loud', { compileTarget: ['home.hbs'], html: '<section class="a4-99"></section>', css: '.a4-99 { color: red !important; }\n' })
  assert.throws(() => build({ 'home.hbs': docOf(at('a4/99', 'Loud')) }, { library: (id) => (id === 'a4/99' ? loud : LIB[id]) }), /^Error: the theme's styles: assets\/css\/screen\.css carries !important/)
})

test('(7.13) a control character in a card stylesheet throws noC0\'s sentence', () => {
  assert.throws(() => build({}, { ghostCards: { ...GHOST_CARDS, styles: { ...GHOST_CARDS.styles, callout: `${GHOST_CARDS.styles['callout']}\u0007` } } }), /^Error: a card stylesheet carries a control character/)
})

// ─── Story 7.17: FR-I5's two lints, and README's routes step ─────────────────────────────────────────────────────────

/** A lightbox module whose key handler runs `code` — a module file as its category story writes one. */
const keyed = (code: string) => `export function lightbox(el, ctx) {\n  el.addEventListener('keydown', (e) => { ${code} }, { signal: ctx.signal })\n}\n`

test('(7.17) FR-I5: a bundled module reading a modifier key makes the compile throw searchKeyRefusals\' sentence; the control — one reading none, or a reader no placed design mounts — compiles', () => {
  const home = { 'home.hbs': docOf(at('a12/6', 'Gallery')) }
  for (const key of ['metaKey', 'ctrlKey', 'getModifierState']) {
    assert.throws(() => build(home, { library: mountingLib, pageTwo: projectTwo(), modules: { core: CORE, lightbox: keyed(`if (e.${key}) el.hidden = true`) } }), new RegExp(`^Error: the theme's scripts: lightbox\\.js reads ${key} — .*\\(FR-I5\\)$`), key)
  }
  // core is in every main.js, so a core that reads one refuses every theme
  assert.throws(() => build({}, { modules: { core: CORE.replace('return {', 'win.addEventListener("keydown", (e) => e.ctrlKey)\n  return {') } }), /^Error: the theme's scripts: core\.js reads ctrlKey/)
  // the controls: the same design whose module reads no modifier key — its comment may name the rule — and a reader that
  // ships in no main.js, since no placed design mounts it
  const quiet = build(home, { library: mountingLib, pageTwo: projectTwo(), modules: { core: CORE, lightbox: keyed('/* never e.metaKey */ el.hidden = true') } }).files
  assert.deepEqual(bundledNames(mainOf(quiet)), ['core', 'lightbox'])
  assert.deepEqual(bundledNames(mainOf(build({}, { modules: { core: CORE, lightbox: keyed('if (e.metaKey) el.hidden = true') } }).files)), ['core'])
})

test('(7.17) FR-I5: checkGhostMarkup\'s rule 1 names a {{ghost_head}} carrying any argument; the control — the compiled theme\'s bare one — passes, and {{ghost_foot}} is untouched', () => {
  const site = compileProject()
  assert.deepEqual(checkGhostMarkup(site), [])
  const shell = site['default.hbs'] ?? ''
  assert.equal(shell.split('    {{ghost_head}}\n').length, 2, 'the bare head once')
  assert.ok(shell.includes('    {{ghost_foot}}\n'), 'the bare foot')
  const withHead = (head: string) => ({ ...site, 'default.hbs': shell.replace('    {{ghost_head}}\n', `    ${head}\n`) })
  for (const head of ['{{ghost_head exclude="search"}}', '{{ghost_head exclude="portal,search"}}', '{{~ghost_head exclude="search"~}}', "{{ghost_head exclude='search'}}"]) {
    assert.ok(checkGhostMarkup(withHead(head)).includes(`default.hbs: ${head} carries an argument — a theme writes {{ghost_head}} bare, since an exclude switches off what Ghost writes there, its own search among it (FR-I5).`), head)
  }
  // anywhere: the count rule names a second file's head, and this rule names its argument too
  assert.match(checkGhostMarkup({ ...site, 'home.hbs': `${site['home.hbs']}{{ghost_head exclude="search"}}\n` }).join('\n'), /^home\.hbs: \{\{ghost_head exclude="search"\}\} carries an argument/m)
  // whitespace control is no argument, and no other helper is read as the head
  for (const head of ['{{~ghost_head~}}', '{{ ghost_head }}']) assert.ok(!checkGhostMarkup(withHead(head)).some((f) => f.includes('carries an argument')), head)
  assert.ok(!checkGhostMarkup({ ...site, 'default.hbs': shell.replace('    {{ghost_foot}}\n', '    {{ghost_foot exclude="x"}}\n') }).some((f) => f.includes('carries an argument')), 'the foot is not the head')
})

/** A sound config with a collection, through the Routes Manager's one parser, and its file as `routesYaml` writes it. */
const ROUTES = (() => {
  const parsed = parseRoutesConfig({ collections: [{ path: '/notes/', filter: { match: 'any', conditions: [{ field: 'tag', op: 'any', values: ['notes'] }] }, template: 'custom-notes.hbs', limit: 10 }], taxonomies: { tag: 'topic', author: 'author' } })
  assert.ok(parsed.ok)
  return routesYaml(parsed.config) as string
})()
/** README's Routes section, written out — the heading, the sentence and the file four spaces in. */
const ROUTES_SECTION = (file: string) => `## Routes\n\nGhost keeps this theme's routing outside the theme, in \`routes.yaml\`. Upload the file below wherever Ghost Admin accepts a routes file; Ghost's guide is https://docs.ghost.org/themes/routing/.\n\n${file.replace(/\n$/, '').split('\n').map((l) => `    ${l}`).join('\n')}\n`

test('(7.17) README\'s routes step: handed routes, ## Routes follows ## Styles — the sentence, then the file every line four spaces in; the control — null or omitted — is no section', () => {
  const bare = `## Scripts\n\n${SCRIPTS_LINE}\n\n${STYLES_NONE}`
  assert.equal(build(project(), { pageTwo: projectTwo(), routes: ROUTES }).files['README.md'], `${bare}\n${ROUTES_SECTION(ROUTES)}`)
  assert.ok(ROUTES.includes('\n\n'), 'the file carries blank lines, and each is four spaces in too')
  assert.equal(build(project(), { pageTwo: projectTwo(), routes: null }).files['README.md'], bare)
  assert.equal(build(project(), { pageTwo: projectTwo() }).files['README.md'], bare)
  // nothing else of the theme changes (its text files; a font is bytes, the same pool either way)
  const withRoutes = compileProject({ routes: ROUTES })
  const without = compileProject()
  assert.deepEqual(Object.keys(withRoutes).filter((p) => p !== 'README.md' && withRoutes[p] !== without[p]), [])
})

test('(7.17, AD-36) README\'s routes sink: a hostile file stays inside the indented code block or is refused; the legitimate file comes back byte for byte once the indent is taken off', () => {
  /** The README's lines after the sentence: the code block, and what Markdown would read outside it. */
  const blockOf = (readme: string): string[] => readme.split('\n\n').slice(-1)[0]?.replace(/\n$/, '').split('\n') ?? []
  // inert: a heading, an HTML block, a fence, a link reference and a list each stay four spaces in — CommonMark reads every
  // line as code, since an indented code block ends only at a line indented less, and none is
  const hostile = 'routes:\n## Owned\n<script>alert(1)</script>\n```\n# x\n```\n[a]: javascript:alert(1)\n- item\n\n  </pre>\n'
  const readme = build({}, { routes: hostile }).files['README.md'] as string
  assert.ok(readme.endsWith(ROUTES_SECTION(hostile)), readme)
  const block = blockOf(readme)
  assert.ok(block.length > 1 && block.every((l) => l.startsWith('    ')), JSON.stringify(block))
  assert.equal(readme.split('\n').filter((l) => /^#/.test(l)).length, 3, 'three headings at the margin: Scripts, Styles, Routes')
  assert.ok(!/^ {0,3}(<|```|\[)/m.test(readme), 'no HTML block, fence or link reference at the margin')
  // refused: a line ending CommonMark reads but the indent never reached (\r, \r\n), and every other C0 character
  for (const bad of ['routes:\r## Owned\n', 'routes:\r\n## Owned\r\n', 'routes:\n\t## Owned\n', 'routes:\u000b\n', `routes:${String.fromCharCode(0)}\n`, `routes:${U0}0${U1}\n`]) {
    assert.throws(() => build({}, { routes: bad }), /^Error: the routes file carries a control character, which the theme compiler refuses \(AD-36\)/, JSON.stringify(bad))
  }
  // the legitimate case: a real routesYaml file, with a collection, comes back exactly once the four spaces are taken off
  const real = blockOf(build({}, { routes: ROUTES }).files['README.md'] as string)
  assert.equal(`${real.map((l) => l.slice(4)).join('\n')}\n`, ROUTES)
  assert.match(ROUTES, /^ {2}\/notes\/:$/m)
})

// ─── Story 7.18a: the compile's customer-caused refusals, one list (DW-353, DW-358) ───────────────────────────────────

test('(7.18a) every REFUSAL class is reached for real: tagged with its class and parts, its sentence unchanged; an unclassified throw carries no tag', () => {
  const tagOf = (run: () => unknown): { kind: string; parts: Record<string, string>; message: string } => {
    try {
      run()
    } catch (e) {
      const tag = refusalOf(e)
      return { kind: tag?.kind ?? 'none', parts: { ...(tag?.parts ?? {}) }, message: (e as Error).message }
    }
    throw new Error('the compile did not refuse')
  }
  const reached = new Set<string>()
  const expect = (run: () => unknown, kind: RefusalKind, parts: Record<string, string>, message?: string | RegExp) => {
    const got = tagOf(run)
    assert.equal(got.kind, kind, got.message)
    assert.deepEqual(got.parts, parts)
    if (typeof message === 'string') assert.equal(got.message, message)
    else if (message !== undefined) assert.match(got.message, message)
    reached.add(kind)
  }
  expect(() => build({}, { language: '../package' }), 'language', { code: '../package' }, /^language "\.\.\/package": /)
  expect(() => pkgOf({ cardDesigns: { nope: {} } }), 'cardDesigns', {}, /^card designs: /)
  const many = Array.from({ length: USER_SETTING_CAP + 1 }, (_, i) => row(`setting_${i + 1}`, 'boolean', control('primary-action')))
  expect(() => promote(many), 'settingCap', {}, SETTING_WORDS.cap)
  const head = [row('headline_size', 'select', control('headline-size'))]
  expect(() => promote(head, docOf(at('a4/2', 'Other', { instanceId: 'someone-else' }))), 'settingDeleted', { setting: 'Headline size' }, SETTING_WORDS.deleted('Headline size'))
  expect(() => promote(head, promoHome({ hidden: true })), 'settingHidden', { setting: 'Headline size' }, SETTING_WORDS.hidden('Headline size'))
  // a section now on a design where the control is another kind names the section; an unreadable binding names none
  expect(() => promote([row('headline_size', 'boolean', control('headline-size'))]), 'settingChanged', { setting: 'Headline size', section: 'Latest post' }, SETTING_WORDS.changed('Headline size'))
  expect(() => promote([row('headline_size', 'select', { kind: 'control', instanceId: 'promo-0001-zq' })]), 'settingChanged', { setting: 'Headline size' }, SETTING_WORDS.changed('Headline size'))
  // nothing prints the setting: a hand-picked feed with nothing picked, and two settings stored for one prop
  const picked = docOf(at('a17/1', 'Main feed', { isMainFeed: true }), at('a17/1', 'Picked', { instanceId: 'picked-0001-zq', data: { posts: { source: 'picked', picks: [] } } }))
  expect(() => promote([row('per_row', 'select', { kind: 'control', instanceId: 'picked-0001-zq', controlKey: 'per-row' })], picked), 'settingUnread', { setting: 'Per row', why: 'unpicked' }, /^the theme's settings: Per row is declared and nothing reads it/)
  expect(() => promote([row('sub', 'text', propOf('sub')), row('sub_again', 'text', propOf('sub'))]), 'settingUnread', { setting: 'Sub', why: 'twice' }, /^the theme's settings: Sub is declared and nothing reads it/)
  const pair = docOf(at('a22/1', 'First', { instanceId: 's10161', content: NEWS, ...DARK }), at('a22/1', 'Second', { instanceId: 's488360', content: NEWS, ...DARK }))
  expect(() => build({ 'home.hbs': pair }, { library: groundedLib, pageTwo: projectTwo() }), 'darkHook', { file: 'home.hbs' }, /^Two sections share a hidden name/)
  expect(() => build({}, { language: 'es', strings: { ...englishStrings(), 'nav.more': 'Más {' } }), 'translation', { key: 'nav.more', sentence: OVERRIDE_WORDS.brace('{', 'Más {', []) }, /^locales\/es\.json: "nav\.more" — /)
  expect(() => compile({ 'home.hbs': docOf(at('a99/1', 'Mystery')) }), 'staleDesign', { file: 'home.hbs', layer: 'Mystery' }, /^home\.hbs · Mystery: the library holds no design/)
  expect(() => compile({ 'post.hbs': docOf(at('a4/13', 'Hero on a post')) }), 'staleDesign', { file: 'post.hbs', layer: 'Hero on a post' }, /compiles to .*, never to post\.hbs\.$/)
  // every class of the list was reached here — the list cannot grow a class this row does not throw
  assert.deepEqual([...reached].sort(), Object.keys(REFUSAL).sort())
  // the control: Inflozo's own refusal (a design's library defect, a file this compile never writes) carries no tag
  assert.equal(tagOf(() => compile({ 'index.hbs': docOf() })).kind, 'none')
  assert.equal(tagOf(() => build({}, { postsPerPage: 0 })).kind, 'none')
})
