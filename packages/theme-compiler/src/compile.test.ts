// Story 7.1 — theme assembly, held to its I/O matrix on small inline designs, and then to what the compiler promises over
// EVERY file it emits: Handlebars 4.7.9 parses it, one triple-stash, no token or marker, no comment but the labels, no
// fingerprint, every partial referenced, no consumed directive, and the same bytes for shuffled input.
// Story 7.2 — `package.json`, held to its own I/O matrix, and the `size=` check on the final text.
// Story 7.3 — every standard template, synthesized where untouched: the spec's I/O matrix row by row, on the same inline
// library, which holds every design the rows need (A24 #1 may sit on `page.hbs` here, as Story 10.79 will make it).
//
// A test may load `handlebars` to parse what the compiler emitted (FR-J1); product code may not (`eslint.config.js`).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import Handlebars from 'handlebars'
import { JSDOM } from 'jsdom'
import { CONSUMED_DIRECTIVE_RE, IMAGE_SIZES, PAYWALL_TARGET } from '@inflozo/library'
import type { ControlDef, DataBinding, PropDef, SectionRegistryEntry } from '@inflozo/library'
import { pageTwoStack, synthesize, U0, U1, T0, T1 } from '@inflozo/section-runtime'
import type { DocInstance, ProjectDoc } from '@inflozo/section-runtime'
import { REFERENCE_PACK } from '@inflozo/section-runtime/reference'
import { checkPageData, checkPaywallReached, checkSizes, checkTripleStashes, compileTheme, THEME_MARKER, THEME_MARKS } from './compile.ts'
import type { CompileInput } from './compile.ts'

const doc = () => new JSDOM('<body></body>').window.document

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
    html: '<header class="a1-1">\n  <a class="a1-1__brand" data-bind-attr="href:@site.url" data-bind="@site.title">Site</a>\n</header>',
  }),
  design('a3/1', 'Columns', {
    compileTarget: ['default.hbs'],
    contentSchema: { note: text('Note') },
    html: '<footer class="a3-1">\n  <p class="a3-1__note" data-prop="note">Note</p>\n</footer>',
  }),
  design('a4/13', 'Latest Post', {
    compileTarget: ['home.hbs'],
    contentSchema: { eyebrow: text('Eyebrow') },
    dataBindings: LATEST,
    html: `<section class="a4-13">
  <p class="a4-13__eyebrow" data-prop="eyebrow">Issue</p>
  <div class="a4-13__card" data-repeat="latest">
    <a class="a4-13__link" data-bind-attr="href:url">
      <img class="a4-13__picture" data-bind-attr="src:feature_image|img_url:l" data-bind-srcset="feature_image|img_url" sizes="(max-width: 767px) 108px, 434px" width="1200" height="800" alt="">
      <span class="a4-13__title" data-bind="title">Title</span>
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
    html: '<section class="a17-1">\n  <ul class="a17-1__grid">\n    <li class="a17-1__cell" data-repeat="posts" data-partial="post-card">\n      <a class="a17-1__card" data-bind-attr="href:url" data-bind="title">Title</a>\n    </li>\n  </ul>\n</section>',
  }),
  design('a22/1', 'Inline Row', {
    compileTarget: ['home.hbs', 'page.hbs', 'post.hbs'],
    contentSchema: { heading: text('Heading'), proof: { type: 'richtext', label: 'Proof', marks: ['strong'] } as PropDef },
    // A22 #1's own controls, so its root carries the ten attributes the real one does
    controlSchema: ([['align', 'center', 'start'], ['heading-size', 'large', 'display'], ['field-width', 'medium', 'wide'], ['below-field', 'note', 'nothing'], ['blurb', 'show', 'hide'], ['social-proof', 'off', 'member-count']] as const)
      .map(([name, a, b]) => ({ name, type: 'segmented', label: name, group: 'layout', values: [a, b], default: a }) as ControlDef),
    html: `<section class="a22-1">
  <h2 class="a22-1__heading" data-prop="heading">Heading</h2>
  <p class="a22-1__proof" data-prop="proof">Proof</p>
</section>`,
  }),
  design('a24/1', 'Centred', {
    // on page.hbs too, as Story 10.79 will make the real one, so the page switch's rows are testable today
    compileTarget: ['post.hbs', 'page.hbs'],
    bindingContext: ['post'],
    controlSchema: segmented([['byline', 'on', 'off'], ['tag-line', 'on', 'off']]),
    html: '<section class="a24-1">\n  <h1 class="a24-1__title" data-bind="title">Title</h1>\n</section>',
  }),
  design('a30/1', 'Card', {
    compileTarget: ['custom-signup.hbs', 'custom-signin.hbs', 'custom-member-home.hbs'],
    contentSchema: { heading: text('Heading') },
    html: '<section class="a30-1">\n  <h2 class="a30-1__heading" data-prop="heading">Join</h2>\n</section>',
  }),
  design('a32/1', 'Centred', {
    compileTarget: [PAYWALL_TARGET],
    contentSchema: { heading: text('Heading') },
    html: '<section class="a32-1">\n  <h2 class="a32-1__heading" data-prop="heading">Keep reading</h2>\n</section>',
  }),
].map((e) => [e.id, e]))

let ids = 0
const at = (designId: string, layerName: string, over: Partial<DocInstance> = {}): DocInstance => ({
  instanceId: `inst-${String(++ids).padStart(4, '0')}-zq`, layerName, designId, content: {}, controls: {}, data: {}, darkOverrides: {},
  hidden: false, memberVisibility: 'everyone', isMainFeed: false, parkedControls: {}, ...over,
})
const docOf = (...instances: DocInstance[]): ProjectDoc => ({ schemaVersion: 1, instances })
const NEWS = { heading: 'One letter a week', proof: { text: 'Join us today', marks: [{ start: 5, end: 7, mark: 'strong' }] } }

const THEME = { name: 'inflozo-field-notes', version: '1.4.0', description: 'Field Notes' }
const input = (templates: Record<string, ProjectDoc>, over: Partial<CompileInput> = {}): CompileInput => ({
  templates, library: (id) => LIB[id], pack: REFERENCE_PACK, assets: {}, postsPerPage: 12, theme: THEME, ...over,
})
const compile = (templates: Record<string, ProjectDoc>, over: Partial<CompileInput> = {}) => compileTheme(doc(), input(templates, over))

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

test('a post: the sections sit inside the block its target opens ({{#post}}), one level in', () => {
  const out = compileProject()
  assert.equal(out['post.hbs'], [
    '{{!< default}}',
    '',
    '{{#post}}',
    '  {{!-- Post header · Post Headers · Centred --}}',
    '  {{> "sections/post/post-header"}}',
    '',
    '  {{!-- Sign up box · Newsletter · Inline Row --}}',
    '  {{> "sections/shared/newsletter"}}',
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
  assert.match(bare['default.hbs'] ?? '', /<body class="\{\{body_class\}\}">\n {4}<main id="site-main">\n {6}\{\{\{body\}\}\}\n {4}<\/main>\n\n {4}\{\{ghost_foot\}\}\n {2}<\/body>/)
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
  assert.match(empty['post.hbs'] ?? '', /\{\{!-- Centred · Post Headers · Centred --\}\}\n {2}\{\{> "sections\/post\/centred"\}\}/)
})

test('byte-identical sections share one file in shared/, named after the first instance (template, then position); each label keeps its own layer name', () => {
  const out = compileProject()
  assert.ok('partials/sections/shared/newsletter.hbs' in out, Object.keys(out).join(' '))
  assert.ok(!Object.keys(out).some((p) => /sections\/(home|post)\/(newsletter|sign-up-box)/.test(p)))
  assert.match(out['home.hbs'] ?? '', /Newsletter · Newsletter · Inline Row --\}\}\n\{\{> "sections\/shared\/newsletter"\}\}/)
  assert.match(out['post.hbs'] ?? '', /Sign up box · Newsletter · Inline Row --\}\}\n {2}\{\{> "sections\/shared\/newsletter"\}\}/)
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
  assert.match(hero, /\n {16}srcset="\{\{img_url feature_image size="xs"\}\} 150w, [^\n]* 2000w">\n/)
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
  assert.throws(() => compile({}, { pageTwo: { 'tag.hbs': docOf(at('a22/1', 'Box')) } }), /^Error: tag\.hbs \(page 2\) · Box: a22\/1 compiles to home\.hbs, page\.hbs, post\.hbs, never to tag\.hbs/)
  assert.throws(() => compile({ 'about.hbs': docOf() }), /about\.hbs: this compile writes no such template — the legal files are default\.hbs, home\.hbs[^]*custom-\{name\}\.hbs/)
  // a renderer refusal (R-7) is rethrown with its place in front of the runtime's own sentence
  const paged = design('a17/3', 'Paged', { compileTarget: ['home.hbs', 'post.hbs'], bindingContext: ['posts'], html: '<section class="a17-3"><nav class="a17-3__pager"><a class="a17-3__next" data-pagination="next" href="#" data-t="pagination.older">Older</a></nav></section>' })
  assert.throws(() => compile({ 'post.hbs': docOf(at('a17/3', 'Pager')) }, { library: (id) => (id === 'a17/3' ? paged : LIB[id]) }), /^Error: post\.hbs · Pager: data-pagination restricts this design to a paginated target \(R-7\)/)
})

test('the stylesheet: the token block first, then each placed design\'s stylesheet once, in design order, under its header, and no other comment', () => {
  const css = compile(project())['assets/css/screen.css'] ?? ''
  const headers = [...css.matchAll(/\/\*[^]*?\*\//g)].map((m) => m[0])
  assert.deepEqual(headers, ['/* Tokens */', '/* Headers · Rail */', '/* Footers · Columns */', '/* Heroes · Latest Post */', '/* Post Grids · Three Up */', '/* Newsletter · Inline Row */', '/* Post Headers · Centred */'])
  assert.ok(css.startsWith('/* Tokens */\n:root {'), css.slice(0, 80))
  assert.ok(!/[ \t]$/m.test(css) && !/\n\n\n/.test(css) && css.endsWith('}\n') && !css.endsWith('\n\n'), 'trailing whitespace, a double blank line or a bad ending')
  assert.equal((css.match(/\.a22-1 \{/g) ?? []).length, 1, 'a design placed three times ships its stylesheet once')
})

// ─── what the compiler promises, over EVERY file ────────────────────────────────────────────────────────────────────

/** The text the fingerprint scan reads: `package.json` without its three named marks — FR-J10's `name`, the ruled
 *  `author` and FR-J13's marker — and every other file whole. */
function unmarked(path: string, body: string): string {
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
  const out = compile(templates, { pageTwo: projectTwo() })
  const instanceIds = Object.values(templates).flatMap((d) => d.instances.map((i) => i.instanceId))
  let triples = 0
  for (const [path, body] of Object.entries(out)) {
    assert.ok(!/[\u0000-\u001f]/.test(body.replace(/\n/g, '')), `${path}: a control character`)
    assert.ok(!/inflozo/i.test(unmarked(path, body)) && !body.includes('data-inflozo-'), `${path}: the builder's name`)
    for (const id of instanceIds) assert.ok(!body.includes(id), `${path}: the instance id ${id}`)
    assert.ok(!/\b(DW|AD|FR|NFR|R)-\d+\b|Story \d|ponytail/.test(body), `${path}: an internal reference`)
    assert.ok(!/generated by|built with/i.test(body), `${path}: a generator line`)
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
  const cards = ['video', 'toggle', 'header_v2', 'header', 'bookmark']
  const a = compile(project(), { designedCards: cards })
  const b = compile(shuffled as Record<string, ProjectDoc>, { assets: reverse({ x: '/x', y: '/y' }), theme: reverse(THEME) as typeof THEME, designedCards: [...cards].reverse() })
  assert.deepEqual(Object.keys(b), Object.keys(a))
  assert.deepEqual(Object.keys(a), [...Object.keys(a)].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)), 'code-unit path order')
  for (const k of Object.keys(a)) assert.equal(b[k], a[k], k)
})

// ─── Story 7.2: package.json ──────────────────────────────────────────────────────────────────────────────────────

const pkgOf = (over: Partial<CompileInput> = {}): string => compile({}, over)['package.json'] as string
/** The value posts_per_page takes from a JavaScript caller, which the type does not stop. */
const anyValue = (v: unknown) => v as number

test('(7.2) a project: package.json is the spec\'s text — Casper\'s key order, engines.ghost and no ghost-api, the ruled author, card_assets true with no designed card, no custom, the marker last', () => {
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
    '    "card_assets": true',
    '  },',
    '  "inflozo": true',
    '}',
    '',
  ].join('\n'))
  const parsed = JSON.parse(pkgOf()) as { engines: Record<string, string>; config: Record<string, unknown> }
  assert.deepEqual(Object.keys(parsed.engines), ['ghost'])
  assert.ok(!('custom' in parsed.config) && !('license' in parsed), 'custom is 7.10\'s and 7.11\'s; FR-J2 names no license')
  assert.equal(Object.keys(parsed).at(-1), THEME_MARKER)
})

test('(7.2) designed cards: card_assets excludes them, sorted in code-unit order, each name once', () => {
  const pkg = JSON.parse(pkgOf({ designedCards: ['toggle', 'header_v2', 'header', 'toggle'] })) as { config: { card_assets: unknown } }
  assert.deepEqual(pkg.config.card_assets, { exclude: ['header', 'header_v2', 'toggle'] })
})

test('(7.2) a card name Ghost 5 would read as glob syntax is refused, naming the name and the alphabet', () => {
  for (const card of ['x|*', 'Bookmark', '']) {
    assert.throws(() => pkgOf({ designedCards: ['toggle', card] }), (e: Error) => e.message.startsWith('package.json: ') && e.message.includes(JSON.stringify(card)) && e.message.includes('a-z0-9_'), card)
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
const withError = (id: string) => (id === 'a31/1' ? design('a31/1', 'Plain', { compileTarget: ['error.hbs'], bindingContext: ['error'], contentSchema: { title: text('Title') }, html: '<section class="a31-1">\n  <h1 class="a31-1__title" data-prop="title">Not found</h1>\n</section>' }) : LIB[id])
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
  assert.ok((out['default.hbs'] ?? '').includes(`<link rel="stylesheet" href="{{asset "css/screen.css"}}">\n${GUARD('index, tag, author')}`), out['default.hbs'])
  assert.equal(((out['default.hbs'] ?? '').match(/noindex/g) ?? []).length, 1)
  // one of them: the Author page 2 alone
  assert.ok((compile({}, { pageTwo: { 'author.hbs': hiddenFeed('Writer feed') } })['default.hbs'] ?? '').includes(GUARD('author')))
  // the control: every page 2 with a visible feed carries no block at all
  const none = compile({}, { pageTwo: { 'author.hbs': docOf(at('a17/1', 'Writer feed', { isMainFeed: true })) } })
  assert.ok(!(none['default.hbs'] ?? '').includes('{{#is') && !(none['default.hbs'] ?? '').includes('noindex'), none['default.hbs'])
  for (const o of [out, none]) assert.ok(!Object.values(o).some((b) => /rel="canonical"/.test(b)), 'the theme writes no canonical link of its own')
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
    '  {{#if @page.show_title_and_feature_image}}',
    '    {{!-- Page header · Post Headers · Centred --}}',
    '    {{> "sections/shared/page-header"}}',
    '  {{/if}}',
    '',
    '  {{!-- Page box · Newsletter · Inline Row --}}',
    '  {{> "sections/page/page-box"}}',
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
  assert.equal(out['custom-signup.hbs'], '{{!< default}}\n\n{{#post}}\n  {{!-- Join card · Members Pages · Card --}}\n  {{> "sections/custom-signup/join-card"}}\n{{/post}}\n')
  assert.ok(!Object.keys(out).some((p) => p.endsWith('.yaml') || p.startsWith('members/') || p.startsWith('page-')), Object.keys(out).join(' '))
})

test('(7.3) an emptied or untouched custom, private or paywall file is not emitted; a routed custom template is its layout line alone', () => {
  const empty = compile({ 'custom-signup.hbs': docOf(), 'private.hbs': docOf(), [PAYWALL_TARGET]: docOf() })
  assert.ok(!Object.keys(empty).some((p) => /^custom-|^private\.hbs$|content-cta/.test(p)), Object.keys(empty).join(' '))
  for (const templates of [{}, { 'custom-landing.hbs': docOf() }] as Record<string, ProjectDoc>[]) {
    assert.equal(compile(templates, { routed: ['custom-landing.hbs'] })['custom-landing.hbs'], '{{!< default}}\n')
  }
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
  const a = compile(templates, { pageTwo, routed: ['custom-landing.hbs', 'custom-about.hbs'] })
  const b = compile(reverse(templates), { pageTwo: reverse(pageTwo), routed: ['custom-about.hbs', 'custom-landing.hbs'] })
  assert.deepEqual(Object.keys(b), Object.keys(a))
  for (const k of Object.keys(a)) assert.equal(b[k], a[k], k)
  assert.ok(['custom-about.hbs', 'custom-landing.hbs', 'custom-signup.hbs', PAYWALL_TARGET, 'home.hbs'].every((f) => f in a), Object.keys(a).join(' '))
})
