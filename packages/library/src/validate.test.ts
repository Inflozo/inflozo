// The runnable check for the authoring contract.
//
// AD-36's pattern, which is also standing rule 2: every refusal is asserted with its HOSTILE case
// refused AND its legitimate neighbour still accepted. A validator that refuses everything is not
// a validator, and the first draft of the path grammar refused `@site.logo` until a fixture caught
// it. Each `refuses()` below therefore takes both.
//
// Every input is an in-memory string: `node:fs` is banned in a core package (AD-1) and the
// test-file exemption gives back only `node:test` and `node:assert`. The on-disk fixture under
// `fixtures/reference-design/` is validated by `tools/stress/test-vocabulary.mjs`, which lives
// outside the ban and is where drift between the two is caught.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CONSUMED_DIRECTIVES, CONSUMED_DIRECTIVE_RE, DIRECTIVES, guardField, parseBindSpec, parseTokenTemplate,
  safeUrl, assertBindableAttr,
} from './vocabulary.ts'
import { assembleEntry, recoverQuickControls, parseDesignDir } from './registry.ts'
import type { CategoryContent, DesignJson } from './registry.ts'
import {
  validateCategoryContent, validateDesign, validateDesignJson, validateMarkup,
} from './validate.ts'
import type { Failure } from './validate.ts'

const codes = (f: Failure[]) => f.map((x) => x.code)
const clean = (f: Failure[], what: string) =>
  assert.deepEqual(f, [], `${what} should validate clean, got: ${f.map((x) => x.message).join(' | ')}`)

// ─── a design using EVERY directive once ─────────────────────────────────────

const CONTROLS = ['cols', 'card']

const EVERY_DIRECTIVE = `
<section data-bg="surface" data-spacing="comfortable" data-divider="line"
         data-cols="3" data-card="raised" data-module="reveal" data-needs="section-above">
  <p data-prop="title" data-empty="fallback">Title</p>
  <a data-prop-attr="href:cta.url;title:cta.title">Go</a>
  <h3 data-bind="title">Post</h3>
  <img data-bind-attr="src:feature_image|img_url:m" data-bind-srcset="feature_image|img_url"
       data-empty="hide" alt="">
  <ul><li data-items="logos"><span data-prop="logos[].name">A partner</span></li></ul>
  <div data-repeat="latest" data-partial="ref-card">
    <span data-index="number">1</span>
    <span data-when="first">First</span>
    <em data-repeat="tags" data-repeat-limit="3" data-bind-style="--tag-accent:accent_color" data-bind="name">Topic</em>
    <p data-if="custom_excerpt" data-bind="custom_excerpt">Authored</p>
    <p data-else data-bind="excerpt">Generated</p>
  </div>
  <div data-members="anonymous">
    <form data-members-form="subscribe">
      <input type="email" data-t-attr="aria-label:ref.email;placeholder:ref.email_placeholder">
      <button data-t="ref.subscribe" data-t-attr="aria-label:ref.subscribe">Subscribe</button>
    </form>
  </div>
  <a data-members="free" data-bind-attr="data-portal:signup/{tier}" href="#">Upgrade</a>
  <button data-ghost-search>Search</button>
  <p data-text="Read by {total_members} readers">Read by 12,000 readers</p>
  <div data-helper="content"></div>
  <div data-target="tag.hbs"><p data-bind="tag.description">About this topic.</p></div>
  <nav>
    <a data-pagination="prev" href="#">Newer</a>
    <ol data-pagination="numbers"></ol>
    <a data-pagination="next" href="#">Older</a>
  </nav>
  <p style="--ref-accent: var(--accent)">A note.</p>
</section>`

test('the reference markup exercises every directive in the closed set', () => {
  // Derived, never a hand list — a directive added without an example here fails this line.
  for (const name of Object.keys(DIRECTIVES)) {
    assert.match(EVERY_DIRECTIVE, new RegExp(`${name}[=\\s>]`), `no example of ${name}`)
  }
})

test('a design using every directive once validates clean', () => {
  clean(validateMarkup(EVERY_DIRECTIVE, { controls: CONTROLS }), 'the reference markup')
})

// ─── the I/O matrix, each hostile case beside its legitimate neighbour ───────

const root = (body: string) =>
  `<section data-bg="surface" data-spacing="comfortable" data-divider="line">${body}</section>`

const refuses = (code: string, hostile: string, neighbour: string) => {
  assert.ok(codes(validateMarkup(root(hostile), { controls: [] })).includes(code),
    `${hostile} should be refused with ${code}`)
  clean(validateMarkup(root(neighbour), { controls: [] }), neighbour)
}

test('an unknown directive is refused, and the one it was misspelt from is not', () => {
  refuses('unknown-directive', '<p data-bound="title">x</p>', '<p data-bind="title">x</p>')
})

test('the retired data-prop-attr2 is refused by name, and the list form that replaced it is not', () => {
  const f = validateMarkup(root('<img data-prop-attr2="alt:img.alt" alt="">'), { controls: [] })
  assert.deepEqual(codes(f), ['retired-directive'])
  assert.match(f[0]!.message, /semicolon-separated/)
  clean(validateMarkup(root('<img data-prop-attr="src:img.src;alt:img.alt" alt="">'), { controls: [] }),
    'the list form')
})

test('a non-allow-listed bound attribute is refused; an allow-listed one is not (AD-36 3)', () => {
  refuses('bad-value',
    '<div data-bind-attr="onload:featureImage"></div>',
    '<img data-bind-attr="src:featureImage" alt="">')
  assert.ok(assertBindableAttr('style') !== null, 'style must never be bindable')
  assert.ok(assertBindableAttr('onclick') !== null, 'an event handler must never be bindable')
  assert.equal(assertBindableAttr('href'), null)
})

test('a crafted binding path is refused; Ghost\'s real path vocabulary is not (AD-36 2)', () => {
  assert.equal(typeof parseBindSpec('title"}}{{evil'), 'string')
  assert.equal(typeof parseBindSpec('a b'), 'string')
  assert.equal(typeof parseBindSpec('a\\b'), 'string')
  for (const good of ['title', '@site.logo', '@custom.accent_colour', '../title', 'primary_author.name']) {
    assert.notEqual(typeof parseBindSpec(good), 'string', `${good} is legitimate and must be accepted`)
  }
})

test('a crafted helper argument is refused; the helper\'s own vocabulary is not', () => {
  assert.equal(typeof parseBindSpec("x|img_url:'; drop"), 'string')
  assert.equal(typeof parseBindSpec('x|img_url:800"}}<script>'), 'string')
  assert.equal(typeof parseBindSpec('x|no_such_helper:m'), 'string')
  assert.equal(typeof parseBindSpec('x|img_url'), 'string', 'a helper with no argument is refused')
  assert.notEqual(typeof parseBindSpec('feature_image|img_url:m'), 'string')
  assert.notEqual(typeof parseBindSpec('published_at|date:D MMM YYYY'), 'string')
})

test('an unsafe URL scheme reduces to an inert, visible # and a legitimate URL is untouched', () => {
  assert.equal(safeUrl('javascript:alert(1)'), '#')
  assert.equal(safeUrl('JaVaScRiPt:alert(1)'), '#')
  assert.equal(safeUrl('java\nscript:alert(1)'), '#', 'rejected, never repaired')
  assert.equal(safeUrl('data:text/html,<script>'), '#')
  assert.equal(safeUrl('vbscript:msgbox'), '#')
  assert.equal(safeUrl('https://example.com/x?a=1'), 'https://example.com/x?a=1')
  assert.equal(safeUrl('mailto:hi@example.com'), 'mailto:hi@example.com')
  assert.equal(safeUrl('/about'), '/about')
  assert.equal(safeUrl('#top'), '#top')
  assert.equal(safeUrl('foo/bar:baz'), 'foo/bar:baz', 'a colon in a path is not a scheme')
})

test('the guard is derived from the bound field, never from a helper argument (FR-H8)', () => {
  // The round-4 defect, stated as an assertion: `{{#if format=YYYY}}` never renders, so the
  // content is silently and permanently gone. "Is there a guard?" passes while the page is empty.
  assert.equal(guardField('published_at|date:YYYY'), 'published_at')
  assert.notEqual(guardField('published_at|date:YYYY'), 'YYYY')
  assert.equal(guardField('feature_image|img_url:m'), 'feature_image')
  assert.equal(guardField('title'), 'title')
  // and a guard with nothing on the element to derive from is refused outright
  refuses('guard-without-source',
    '<time data-empty="hide">14 Mar 2026</time>',
    '<time data-bind="published_at|date:YYYY" data-empty="hide">2026</time>')
})

test('an inline style beyond AD-3\'s carve-out is refused; one custom property is not', () => {
  refuses('inline-style',
    '<p style="color: red">x</p>',
    '<p style="--tag-accent: var(--accent)">x</p>')
  refuses('inline-style',
    '<p style="--a: var(--x); display: none">x</p>',
    '<p style="--a: var(--x);">x</p>')
  // §7.3: no hex outside the Style Pack — a static custom property must consume a pack token
  refuses('inline-style',
    '<p style="--tag-accent: #2f6fed">x</p>',
    '<p style="--tag-accent: var(--accent)">x</p>')
})

test('the token form of data-bind-attr is accepted; a stray brace is refused (R-27, row 11)', () => {
  refuses('bad-value',
    '<a data-bind-attr="data-portal:signup/{tier">x</a>',
    '<a data-bind-attr="data-portal:signup/{tier}">x</a>')
  assert.equal(typeof parseTokenTemplate('a}b'), 'string')
  assert.equal(typeof parseTokenTemplate('{a b}'), 'string')
  assert.deepEqual(parseTokenTemplate('Read in {reading_time} minutes'), ['reading_time'])
})

test('a guard on a token-template binding is refused; on a plain first entry it is not', () => {
  refuses('guard-on-template',
    '<a data-bind-attr="data-portal:signup/{tier}" data-empty="hide">x</a>',
    '<a data-bind-attr="href:url;data-portal:signup/{tier}" data-empty="hide">x</a>')
})

test('the lexical shape checks: duplicates, orphan modifiers, both arms on one element, empty markup', () => {
  refuses('duplicate-attribute',
    '<p data-bind="title" data-bind="excerpt">x</p>',
    '<p data-bind="title">x</p>')
  refuses('orphan-repeat-modifier',
    '<li data-repeat-limit="3">x</li>',
    '<li data-repeat="tags" data-repeat-limit="3">x</li>')
  refuses('orphan-repeat-modifier',
    '<li data-partial="card">x</li>',
    '<li data-repeat="posts" data-partial="card">x</li>')
  refuses('if-and-else',
    '<p data-if="a" data-else data-bind="a">x</p>',
    '<p data-if="a" data-bind="a">x</p>')
  assert.deepEqual(codes(validateMarkup('', { controls: [] })), ['no-root'])
  assert.deepEqual(codes(validateMarkup('<!-- nothing -->', { controls: [] })), ['no-root'])
})

test('a data-target the design cannot compile to is refused; a declared one is not', () => {
  const opts = { controls: [], compileTarget: ['index.hbs', 'tag.hbs'] }
  assert.ok(codes(validateMarkup(root('<div data-target="page.hbs">x</div>'), opts)).includes('target-not-declared'))
  clean(validateMarkup(root('<div data-target="tag.hbs">x</div>'), opts), 'a declared target')
})

test('a declared query is referenced, and its limit is authored once (review 1)', () => {
  const dataBindings = { latest: { source: 'posts', limit: 9 } }
  assert.ok(codes(validateMarkup(root('<div data-repeat="latst">x</div>'), { controls: [], dataBindings }))
    .includes('binding-unreferenced'), 'a key typo leaves the real key unreferenced')
  assert.ok(codes(validateMarkup(root('<div data-repeat="latest" data-repeat-limit="9">x</div>'), { controls: [], dataBindings }))
    .includes('limit-authored-twice'))
  clean(validateMarkup(root('<div data-repeat="latest">x</div>'), { controls: [], dataBindings }), 'a referenced query')
  clean(validateMarkup(root('<div data-repeat="tags" data-repeat-limit="3">x</div>'), { controls: [], dataBindings: {} }),
    'a context-path repeat keeps its own limit')
})

test('the leak assertion is one regex, and it sees a valueless directive mid-tag (AD-34)', () => {
  assert.ok(CONSUMED_DIRECTIVE_RE.test('<p data-else class="x">'), 'a valueless directive before another attribute')
  assert.ok(CONSUMED_DIRECTIVE_RE.test('<p data-else/>'))
  assert.ok(CONSUMED_DIRECTIVE_RE.test('<p data-bind="title">'))
  assert.ok(!CONSUMED_DIRECTIVE_RE.test('<p data-elsewhere="1" data-bindings="2">'), 'a longer name is not a directive')
  assert.ok(!CONSUMED_DIRECTIVE_RE.test('<form data-members-form="subscribe" data-ghost-search>'), 'the emitted three survive on purpose')
  for (const d of CONSUMED_DIRECTIVES) assert.ok(CONSUMED_DIRECTIVE_RE.test(`<p ${d}>`), d)
})

test('an inline token a prop does not declare cannot be declared at all outside the closed set', () => {
  const bad: CategoryContent = { category: 'a22', props: { h: { type: 'text', tokens: ['unknownToken'] } } }
  assert.deepEqual(codes(validateCategoryContent(bad)), ['bad-inline-token'])
  const good: CategoryContent = { category: 'a22', props: { h: { type: 'text', tokens: ['members'] } } }
  clean(validateCategoryContent(good), 'a prop declaring {members}')
})

test('an un-allow-listed token inside a prop VALUE stays literal text — it is not refused (R-27)', () => {
  // The other half of the row above, and the half that says what the customer sees. Substitution
  // is over the prop's DECLARED tokens only, so an undeclared brace run is never a candidate for
  // it and never an error either: it stays the characters that were typed. Provable here as
  // non-refusal, because this story ships no renderer — 4.2's emitters execute the substitution.
  const withStray: CategoryContent = {
    category: 'a22',
    props: { h: { type: 'text', tokens: ['members'], default: 'Hi {members}, see {unknownToken}' } },
  }
  clean(validateCategoryContent(withStray), "a prop value carrying {unknownToken}")
})

test('a control attribute on the root is refused in both directions (AD-3)', () => {
  const withCols = '<section data-bg="s" data-spacing="c" data-divider="l" data-cols="3"></section>'
  assert.ok(codes(validateMarkup(withCols, { controls: [] })).includes('root-control-undeclared'))
  assert.ok(codes(validateMarkup(withCols, { controls: ['cols', 'gap'] })).includes('root-control-missing'))
  clean(validateMarkup(withCols, { controls: ['cols'] }), 'a root whose attributes match its schema')
})

test('the three universal controls sit on every section root', () => {
  assert.ok(codes(validateMarkup('<section data-bg="s"></section>', { controls: [] }))
    .includes('universal-control-missing'))
})

test('a content prop the category does not declare is refused (R-102), in every directive that names one', () => {
  const content: CategoryContent = {
    category: 'a4',
    props: { title: { type: 'text' }, 'cta.url': { type: 'url' }, logos: { type: 'array' }, 'logos[].alt': { type: 'text' } },
  }
  const o = { controls: [], content }
  assert.deepEqual(codes(validateMarkup(root('<p data-prop="newsletter.heading">x</p>'), o)), ['unknown-prop'])
  assert.deepEqual(codes(validateMarkup(root('<a data-prop-attr="href:cta.url;title:email.label">x</a>'), o)), ['unknown-prop'])
  assert.deepEqual(codes(validateMarkup(root('<li data-items="partners">x</li>'), o)), ['unknown-prop'])
  clean(validateMarkup(root('<p data-prop="title">x</p><a data-prop-attr="href:cta.url">x</a><li data-items="logos"></li>'), o), 'declared props')
})

test('a directive and its prop must agree in kind', () => {
  const content: CategoryContent = { category: 'a4', props: { title: { type: 'text' }, logos: { type: 'array' } } }
  const o = { controls: [], content }
  assert.deepEqual(codes(validateMarkup(root('<li data-items="title">x</li>'), o)), ['prop-type-mismatch'])
  assert.deepEqual(codes(validateMarkup(root('<p data-prop="logos">x</p>'), o)), ['prop-type-mismatch'])
  clean(validateMarkup(root('<li data-items="logos">x</li><p data-prop="title">x</p>'), o), 'matching kinds')
})

// ─── design.json ─────────────────────────────────────────────────────────────

const DESIGN: DesignJson = {
  name: 'Reference',
  tier: 'free',
  bindingContext: ['posts'],
  compileTarget: ['index.hbs'],
  controlSchema: [
    { name: 'cols', type: 'stepper', values: ['2', '3'], default: '3' },
    { name: 'card', type: 'segmented', values: ['flat', 'raised'], default: 'raised' },
    { name: 'gap', type: 'segmented', values: ['tight', 'normal', 'loose'], default: 'normal' },
    { name: 'meta', type: 'named-select', values: ['none', 'date'], default: 'date' },
    { name: 'image', type: 'segmented', values: ['top', 'side'], default: 'top' },
    { name: 'rule', type: 'segmented', values: ['none', 'line'], default: 'none' },
  ],
  ghostCompat: { minVersion: '5.0.0', helpers: ['foreach'] },
  darkCapabilities: ['tokens'],
  previewSeed: 'orbit-weekly',
  descriptor: {
    archetype: 'feed', containment: 'none', ground: 'surface',
    itemCount: 'many', mediaPlacement: 'top', emphasis: 'the first card is flagged',
  },
}

const design = (over: Partial<DesignJson> = {}): DesignJson => ({ ...DESIGN, ...over })

test('a sound design.json validates clean', () => {
  clean(validateDesignJson(design()), 'the reference design.json')
})

test('bindingContext: page is refused and the ten legal values are named (FR-G3)', () => {
  const f = validateDesignJson(design({ bindingContext: ['page' as 'post'] }))
  assert.deepEqual(codes(f), ['bad-binding-context'])
  assert.match(f[0]!.message, /none · post · posts · tag · tags · author · authors · tiers · error · private/)
  assert.match(f[0]!.message, /a page and a post are the SAME resource/)
  clean(validateDesignJson(design({ bindingContext: ['post'] })), 'bindingContext: post')
})

test('a design declaring pagination cannot list a non-paginated target (R-7)', () => {
  const markup = root('<a data-pagination="next" href="#">Older</a>')
  const f = validateDesignJson(design({ compileTarget: ['index.hbs', 'error.hbs'] }), markup)
  assert.ok(codes(f).includes('pagination-target'))
  clean(validateDesignJson(design({ compileTarget: ['index.hbs', 'tag.hbs'] }), markup),
    'pagination on paginated targets')
})

test('a design performing a {{#get}} excludes error.hbs and private.hbs (R-7)', () => {
  const gets = { latest: { source: 'posts', limit: 9 } }
  assert.ok(codes(validateDesignJson(design({ dataBindings: gets, compileTarget: ['private.hbs'] })))
    .includes('get-target'))
  clean(validateDesignJson(design({ dataBindings: gets })), 'a {{#get}} on index.hbs')
})

test('a query is declared by key and validated, never written into an attribute (AD-36)', () => {
  assert.ok(codes(validateDesignJson(design({ dataBindings: { x: { source: 'posts', limit: 5000 } } })))
    .includes('bad-get-limit'))
  assert.ok(codes(validateDesignJson(design({ dataBindings: { x: { source: 'sqlite_master' } } })))
    .includes('bad-get-source'))
  assert.ok(codes(validateDesignJson(design({ dataBindings: { x: { source: 'posts', order: 'x; drop' } } })))
    .includes('bad-get-order'))
  clean(validateDesignJson(design({
    dataBindings: { x: { source: 'posts', filter: 'featured:true', limit: 9, order: 'published_at desc' } },
  })), 'a declared, validated query')
})

test('a hand-written quickControls[] is refused; the recovered one is the first five, in order', () => {
  const f = validateDesignJson(design({ quickControls: ['cols'] as never }))
  assert.deepEqual(codes(f), ['quick-controls-authored'])
  assert.deepEqual(recoverQuickControls(DESIGN.controlSchema), ['cols', 'card', 'gap', 'meta', 'image'])
  clean(validateDesignJson(design()), 'a design.json with no quickControls')
})

test('every other design.json refusal fires, and its neighbour does not', () => {
  const only = (over: Record<string, unknown>, code: string) =>
    assert.ok(codes(validateDesignJson({ ...DESIGN, ...over } as DesignJson)).includes(code), `${code} should fire`)
  only({ id: 'a17/1' }, 'id-authored')
  only({ tier: 'gold' }, 'bad-tier')
  only({ bindingContext: [] }, 'binding-context-missing')
  only({ bindingContext: ['posts', 'posts'] }, 'duplicate-context')
  only({ compileTarget: [] }, 'compile-target-missing')
  only({ compileTarget: ['index.hbs', 'index.hbs'] }, 'duplicate-target')
  only({ compileTarget: ['any'] }, 'bad-compile-target')
  only({ dataBindings: { x: { source: 'posts', filter: 'tag:{{evil}}' } } }, 'bad-get-filter')
  only({ dataBindings: { 'my key': { source: 'posts' } } }, 'bad-get-key')
  only({ dataBindings: { posts: { source: 'posts' } } }, 'bad-get-key')
  only({ dataBindings: { picks: { source: 'posts', ids: [] } } }, 'bad-get-ids')
  only({ dataBindings: { picks: { source: 'posts', ids: ['abc'], limit: 3 } } }, 'bad-get-ids')
  only({ controlSchema: [{ name: 'Cols', type: 'stepper', values: ['2'], default: '2' }] }, 'bad-control-name')
  only({ controlSchema: [
    { name: 'cols', type: 'stepper', values: ['2'], default: '2' },
    { name: 'cols', type: 'stepper', values: ['2'], default: '2' },
  ] }, 'duplicate-control')
  only({ controlSchema: [{ name: 'rule', type: 'toggle', values: ['on', 'off'], default: 'on',
    disabledBy: { control: 'align', whenValue: 'center', reason: 'r' } }] }, 'dependency-unknown')
  only({ controlSchema: [{ name: 'rule', type: 'toggle', values: ['on', 'off'], default: 'on',
    disabledBy: { control: 'rule', whenValue: 'off', reason: 'r' } }] }, 'dependency-self')
  only({ controlSchema: [
    { name: 'align', type: 'segmented', values: ['start', 'center'], default: 'start' },
    { name: 'rule', type: 'toggle', values: ['on', 'off'], default: 'on',
      disabledBy: { control: 'align', whenValue: 'middle', reason: 'r' } },
  ] }, 'dependency-value')
  only({ previewSeed: '' }, 'preview-seed-missing')
  only({ ghostCompat: undefined }, 'ghost-compat-missing')
  only({ ghostCompat: { minVersion: 'banana', helpers: [] } }, 'bad-min-version')
  only({ ghostCompat: { minVersion: '5.0.0', helpers: 'foreach' } }, 'ghost-compat-helpers')
  only({ descriptor: { ...DESIGN.descriptor, ground: '' } }, 'descriptor-missing')
  only({ descriptor: undefined }, 'descriptor-missing')
  // and the neighbours: a hand-picked order, and the reference design.json
  clean(validateDesignJson(design({ dataBindings: { picks: { source: 'posts', ids: ['a1', 'b2', 'c3'] } } })),
    'a hand-picked order (R-20)')
  clean(validateDesignJson(design()), 'the reference design.json')
})

test('content.json refusals: marks, tokens, orphan items, unsafe defaults, the category id', () => {
  const only = (props: CategoryContent['props'], code: string, category = 'a22') =>
    assert.ok(codes(validateCategoryContent({ category, props })).includes(code), `${code} should fire`)
  only({ h: { type: 'richtext', marks: ['script'] } }, 'bad-mark')
  only({ h: { type: 'text', marks: ['strong'] } }, 'marks-on-plain-prop')
  only({ u: { type: 'url', tokens: ['members'] } }, 'tokens-on-non-text')
  only({ 'logos[].alt': { type: 'text' } }, 'orphan-item-prop')
  only({ logos: { type: 'text' }, 'logos[].alt': { type: 'text' } }, 'orphan-item-prop')
  only({ u: { type: 'url', default: 'javascript:alert(1)' } }, 'unsafe-default-url')
  only({}, 'bad-category', 'A-22')
  clean(validateCategoryContent({ category: 'a22', props: {
    h: { type: 'richtext', marks: ['strong', 'em', 'u', 'a'], tokens: ['members'] },
    u: { type: 'url', default: 'https://example.com/' },
    logos: { type: 'array' }, 'logos[].alt': { type: 'text' },
  } }), 'a sound content.json')
})

test('a universal control may not be redeclared per design (R-23)', () => {
  const f = validateDesignJson(design({
    controlSchema: [{ name: 'spacing', type: 'segmented', values: ['a', 'b'], default: 'a' }],
  }))
  assert.ok(codes(f).includes('universal-control-redeclared'))
})

test('a control must be closed-valued, and its default must be one of its values', () => {
  assert.ok(codes(validateDesignJson(design({
    controlSchema: [{ name: 'cols', type: 'text', values: [], default: '3' }],
  }))).includes('control-open-valued'))
  assert.ok(codes(validateDesignJson(design({
    controlSchema: [{ name: 'cols', type: 'stepper', values: ['2', '3'], default: '4' }],
  }))).includes('control-default'))
})

test('a control dependency carries its reason (R-33)', () => {
  assert.ok(codes(validateDesignJson(design({
    controlSchema: [
      { name: 'align', type: 'segmented', values: ['start', 'center'], default: 'start' },
      {
        name: 'rule', type: 'segmented', values: ['none', 'line'], default: 'none',
        disabledBy: { control: 'align', whenValue: 'center', reason: '' },
      },
    ],
  }))).includes('dependency-without-reason'))
})

// ─── assembly ────────────────────────────────────────────────────────────────

test('an entry is assembled from the path, the design, the category content and the files', () => {
  const content: CategoryContent = { category: 'a17', props: { title: { type: 'text' } } }
  const e = assembleEntry({
    dir: 'packages/library/designs/a17/1', design: design(), content,
    html: EVERY_DIRECTIVE, css: '.x{}',
  })
  assert.ok(typeof e !== 'string', 'assembly should succeed')
  if (typeof e === 'string') return
  assert.equal(e.id, 'a17/1')
  assert.equal(e.category, 'a17')
  assert.equal(e.contentSchema, content.props, 'contentSchema is the CATEGORY\'s union')
  assert.equal(e.descriptor, DESIGN.descriptor, 'the entry carries the tuple FR-G5 asserts over')
  assert.deepEqual(e.quickControls, ['cols', 'card', 'gap', 'meta', 'image'])
  assert.deepEqual(parseDesignDir('a3/12'), { category: 'a3', n: '12' })
  assert.equal(parseDesignDir('a3'), null)
})

test('a content.json from another category is refused (R-102)', () => {
  const e = assembleEntry({
    dir: 'designs/a3/4', design: design(),
    content: { category: 'a22', props: {} }, html: '<section></section>', css: '',
  })
  assert.equal(typeof e, 'string')
  assert.match(String(e), /never crosses a category boundary/)
})

test('validateDesign runs design.json, content.json and markup as one', () => {
  const content: CategoryContent = {
    category: 'a17',
    props: {
      title: { type: 'text' }, 'cta.url': { type: 'url' }, 'cta.title': { type: 'text' },
      logos: { type: 'array' }, 'logos[].name': { type: 'text' },
    },
  }
  const f = validateDesign({
    html: EVERY_DIRECTIVE,
    design: design({
      controlSchema: [
        { name: 'cols', type: 'stepper', values: ['2', '3'], default: '3' },
        { name: 'card', type: 'segmented', values: ['flat', 'raised'], default: 'raised' },
      ],
      compileTarget: ['index.hbs', 'tag.hbs'],
      dataBindings: { latest: { source: 'posts', limit: 9 } },
      bindingContext: ['posts', 'tags'],
    }),
    content,
  })
  clean(f, 'the reference design end to end')
})
