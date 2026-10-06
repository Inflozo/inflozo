// Story 7.1 — theme assembly, held to its I/O matrix on small inline designs, and then to what the compiler promises over
// EVERY file it emits: Handlebars 4.7.9 parses it, one triple-stash, no token or marker, no comment but the labels, no
// fingerprint, every partial referenced, no consumed directive, and the same bytes for shuffled input.
//
// A test may load `handlebars` to parse what the compiler emitted (FR-J1); product code may not (`eslint.config.js`).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import Handlebars from 'handlebars'
import { JSDOM } from 'jsdom'
import { CONSUMED_DIRECTIVE_RE } from '@inflozo/library'
import type { ControlDef, DataBinding, PropDef, SectionRegistryEntry } from '@inflozo/library'
import { U0, U1, T0, T1 } from '@inflozo/section-runtime'
import type { DocInstance, ProjectDoc } from '@inflozo/section-runtime'
import { REFERENCE_PACK } from '@inflozo/section-runtime/reference'
import { compileTheme } from './compile.ts'
import type { CompileInput } from './compile.ts'

const doc = () => new JSDOM('<body></body>').window.document

// ─── a small inline library ───────────────────────────────────────────────────────────────────────────────────────

const TITLES: Record<string, string> = { a1: 'Headers', a3: 'Footers', a4: 'Heroes', a17: 'Post Grids', a22: 'Newsletter', a24: 'Post Headers' }
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
    compileTarget: ['post.hbs'],
    bindingContext: ['post'],
    html: '<section class="a24-1">\n  <h1 class="a24-1__title" data-bind="title">Title</h1>\n</section>',
  }),
].map((e) => [e.id, e]))

let ids = 0
const at = (designId: string, layerName: string, over: Partial<DocInstance> = {}): DocInstance => ({
  instanceId: `inst-${String(++ids).padStart(4, '0')}-zq`, layerName, designId, content: {}, controls: {}, data: {}, darkOverrides: {},
  hidden: false, memberVisibility: 'everyone', isMainFeed: false, parkedControls: {}, ...over,
})
const docOf = (...instances: DocInstance[]): ProjectDoc => ({ schemaVersion: 1, instances })
const NEWS = { heading: 'One letter a week', proof: { text: 'Join us today', marks: [{ start: 5, end: 7, mark: 'strong' }] } }

const input = (templates: Record<string, ProjectDoc>, over: Partial<CompileInput> = {}): CompileInput => ({
  templates, library: (id) => LIB[id], pack: REFERENCE_PACK, assets: {}, postsPerPage: 12, ...over,
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

// ─── the I/O matrix ───────────────────────────────────────────────────────────────────────────────────────────────

test('a designed Home: the layout line, then each section\'s label and invocation, a blank line between; three files in its directory; post-card once', () => {
  const out = compile({ 'home.hbs': project()['home.hbs'] as ProjectDoc })
  assert.equal(out['home.hbs'], [
    '{{!< default}}',
    '',
    '{{!-- Latest post · Heroes · Latest Post --}}',
    '{{> "sections/home/latest-post"}}',
    '',
    '{{!-- Post grid · Post Grids · Three Up --}}',
    '{{> "sections/home/post-grid"}}',
    '',
    '{{!-- Newsletter · Newsletter · Inline Row --}}',
    '{{> "sections/home/newsletter"}}',
    '',
  ].join('\n'))
  assert.deepEqual(Object.keys(out).filter((p) => p.startsWith('partials/sections/')), ['partials/sections/home/latest-post.hbs', 'partials/sections/home/newsletter.hbs', 'partials/sections/home/post-grid.hbs'])
  assert.equal(Object.keys(out).filter((p) => p === 'partials/post-card.hbs').length, 1)
  assert.match(out['partials/sections/home/post-grid.hbs'] ?? '', /\{\{#foreach posts\}\}\n {6}\{\{> "post-card"\}\}\n {4}\{\{\/foreach\}\}/)
})

test('a post: the sections sit inside the block its target opens ({{#post}}), one level in', () => {
  const out = compile(project())
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
  const out = compile(project())
  const body = (out['default.hbs'] ?? '').split('\n')
  const header = body.indexOf('    {{> "sections/default/header"}}')
  const triple = body.indexOf('    {{{body}}}')
  const footer = body.indexOf('    {{> "sections/default/footer"}}')
  assert.ok(header > 0 && header < triple && triple < footer, out['default.hbs'])
  assert.ok((out['default.hbs'] ?? '').indexOf('{{asset "css/screen.css"}}') < (out['default.hbs'] ?? '').indexOf('{{ghost_head}}'), 'the stylesheet comes before ghost_head')
  assert.equal(body[header - 1], '    {{!-- Header · Headers · Rail --}}')
  // no site doc and no section: default.hbs and screen.css are still emitted
  const bare = compile({})
  assert.deepEqual(Object.keys(bare), ['assets/css/screen.css', 'default.hbs'])
  assert.match(bare['default.hbs'] ?? '', /<body class="\{\{body_class\}\}">\n {4}\{\{\{body\}\}\}\n\n {4}\{\{ghost_foot\}\}\n {2}<\/body>/)
})

test('slugs collide: Hero, HERO and Héro on one template are hero, hero-2 and hero-3, in position order', () => {
  const heading = (h: string) => ({ content: { heading: h } })
  const out = compile({ 'home.hbs': docOf(at('a22/1', 'Hero', heading('a')), at('a22/1', 'HERO', heading('b')), at('a22/1', 'Héro', heading('c'))) })
  assert.deepEqual(Object.keys(out).filter((p) => p.startsWith('partials/sections/')), ['partials/sections/home/hero-2.hbs', 'partials/sections/home/hero-3.hbs', 'partials/sections/home/hero.hbs'])
  assert.deepEqual([...(out['home.hbs'] ?? '').matchAll(/\{\{> "sections\/home\/([^"]+)"\}\}/g)].map((m) => m[1]), ['hero', 'hero-2', 'hero-3'])
  assert.match(out['home.hbs'] ?? '', /\{\{!-- Héro · Newsletter · Inline Row --\}\}\n\{\{> "sections\/home\/hero-3"\}\}/)
})

test('a slug that comes out empty takes the design\'s name, then the collision rule; the label keeps the layer\'s own name', () => {
  const out = compile({ 'home.hbs': docOf(at('a17/1', '🌿🌿', { isMainFeed: true }), at('a17/1', 'ニュース')) })
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
  const out = compile(project())
  assert.ok('partials/sections/shared/newsletter.hbs' in out, Object.keys(out).join(' '))
  assert.ok(!Object.keys(out).some((p) => /sections\/(home|post)\/(newsletter|sign-up-box)/.test(p)))
  assert.match(out['home.hbs'] ?? '', /Newsletter · Newsletter · Inline Row --\}\}\n\{\{> "sections\/shared\/newsletter"\}\}/)
  assert.match(out['post.hbs'] ?? '', /Sign up box · Newsletter · Inline Row --\}\}\n {2}\{\{> "sections\/shared\/newsletter"\}\}/)
  // two on ONE template share a file in its own directory, named for the first
  const one = compile({ 'home.hbs': docOf(at('a22/1', 'First', { content: NEWS }), at('a22/1', 'Second', { content: NEWS })) })
  assert.deepEqual(Object.keys(one).filter((p) => p.startsWith('partials/sections/')), ['partials/sections/home/first.hbs'])
  assert.equal(((one['home.hbs'] ?? '').match(/sections\/home\/first/g) ?? []).length, 2)
})

test('hidden: absent from its template and from partials/; a template whose every instance is hidden is its layout line alone', () => {
  const out = compile(project())
  assert.ok(!Object.values(out).some((t) => t.includes('Never compiled') || t.includes('Hidden one')))
  assert.equal(out['page.hbs'], '{{!< default}}\n')
})

test('a hostile layer name: braces and controls are dropped, and Handlebars 4.7.9 reads the line as one comment and nothing else', () => {
  const hostile = 'x --}}<p id="leak">LEAK</p>{{@site.title}}\u0001\u0003'
  const out = compile({ 'home.hbs': docOf(at('a22/1', hostile, { content: NEWS })) })
  const line = (out['home.hbs'] ?? '').split('\n').find((l) => l.startsWith('{{!--')) ?? ''
  assert.equal(line, '{{!-- x --<p id="leak">LEAK</p>@site.title · Newsletter · Inline Row --}}')
  const body = Handlebars.parse(line).body
  assert.deepEqual(body.map((s) => s.type), ['CommentStatement'])
  // the control: with the braces left in, the same name ends the comment early and the rest is live Handlebars
  assert.ok(Handlebars.parse(`{{!-- ${hostile.replace(/[\u0000-\u001f]/g, '')} --}}`).body.some((s) => s.type === 'MustacheStatement'))
})

test('hostile user text ships inert in every file: braces as entities, no marker or token, and Handlebars finds the same statements as for benign text', () => {
  const words = ['{{title}}', 'C:\\{{x}}', '{{#if x}}y{{/if}}', `${U0}0${U1}`, `${T0}0${T1}`, '" \' <b>']
  const withText = (heading: string) => compile({ 'home.hbs': docOf(at('a22/1', 'Newsletter', { content: { heading, proof: heading } })), 'default.hbs': docOf(at('a3/1', 'Footer', { content: { note: heading } })) })
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
  const out = compile(project())
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
  const out = compile(project())
  assert.ok(out['partials/post-card.hbs']?.startsWith('<li class="a17-1__cell">'))
  const other = design('a17/2', 'Other', { compileTarget: ['tag.hbs'], bindingContext: ['posts'], html: '<section class="a17-2"><ul><li class="a17-2__cell" data-repeat="posts" data-partial="post-card"><b data-bind="title">t</b></li></ul></section>' })
  assert.throws(
    () => compile({ 'home.hbs': docOf(at('a17/1', 'Grid', { isMainFeed: true })), 'tag.hbs': docOf(at('a17/2', 'Other', { isMainFeed: true })) }, { library: (id) => (id === 'a17/2' ? other : LIB[id]) }),
    /partials\/post-card\.hbs: a17\/1 and a17\/2 both declare data-partial "post-card"/,
  )
})

test('every refusal names its file and its layer', () => {
  assert.throws(() => compile({ 'home.hbs': docOf(at('a99/1', 'Mystery')) }), /^Error: home\.hbs · Mystery: the library holds no design "a99\/1"/)
  assert.throws(() => compile({ 'home.hbs': docOf(at('a24/1', 'Post header')) }), /^Error: home\.hbs · Post header: a24\/1 compiles to post\.hbs, never to home\.hbs/)
  assert.throws(() => compile({ 'partials/content-cta.hbs': docOf() }), /partials\/content-cta\.hbs: the paywall's partial is compiled by Story 7\.3/)
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

test('over every emitted file: it parses under Handlebars 4.7.9, carries one {{{body}}} and no other triple-stash, no token, no stray comment, no fingerprint', () => {
  const templates = project()
  const out = compile(templates)
  const instanceIds = Object.values(templates).flatMap((d) => d.instances.map((i) => i.instanceId))
  let triples = 0
  for (const [path, body] of Object.entries(out)) {
    assert.ok(!/[\u0000-\u001f]/.test(body.replace(/\n/g, '')), `${path}: a control character`)
    assert.ok(!/inflozo/i.test(body) && !body.includes('data-inflozo-'), `${path}: the builder's name`)
    for (const id of instanceIds) assert.ok(!body.includes(id), `${path}: the instance id ${id}`)
    assert.ok(!/\b(DW|AD|FR|NFR|R)-\d+\b|Story \d|ponytail/.test(body), `${path}: an internal reference`)
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
  assert.equal(triples, 1)
  assert.match(out['default.hbs'] ?? '', /^ {4}\{\{\{body\}\}\}$/m)
  // every partial is referenced, by a file that is not itself
  for (const path of Object.keys(out).filter((p) => p.startsWith('partials/'))) {
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
  const a = compile(project())
  const b = compile(shuffled as Record<string, ProjectDoc>, { assets: reverse({ x: '/x', y: '/y' }) })
  assert.deepEqual(Object.keys(b), Object.keys(a))
  assert.deepEqual(Object.keys(a), [...Object.keys(a)].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)), 'code-unit path order')
  for (const k of Object.keys(a)) assert.equal(b[k], a[k], k)
})
