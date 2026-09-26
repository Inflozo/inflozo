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
  CONSUMED_DIRECTIVES, CONSUMED_DIRECTIVE_RE, CONTROL_CAP, DEFAULT_LIMIT, DIRECTIVES, GHOST_ID_RE, GHOST_SLUG_RE,
  INLINE_TOKENS, PAGE_NUMBER, PILL_CHARS, PLACEHOLDERS, POST_SOURCES, POST_SOURCE_WORDS, UNIVERSALS, guardField, isIsoDate, parseBindSpec,
  parseTokenTemplate, pillRefusal, pillWidth, placeholdersOffered, safeUrl, assertBindableAttr, valueWords,
} from './vocabulary.ts'
import { assembleEntry, categoryControlUnion, parseDesignDir } from './registry.ts'
import type { CategoryContent, ControlDef, DesignJson } from './registry.ts'
import {
  memberAsks, validateCategoryContent, validateDataBinding, validateDesign, validateDesignJson, validateMarkup,
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
  <ul><li data-items="logos" data-items-limit="3"><span data-prop="logos[].name">A partner</span><span data-initials="logos[].name">AP</span></li></ul>
  <div data-repeat="latest" data-partial="ref-card">
    <span data-index="number">1</span>
    <span data-when="first">First</span>
    <em data-repeat="tags" data-repeat-limit="3" data-bind-style="--tag-accent:accent_color" data-bind="name">Topic</em>
    <p data-if="custom_excerpt" data-bind="custom_excerpt">Authored</p>
    <p data-else data-bind="excerpt">Generated</p>
  </div>
  <div data-members="anonymous">
    <form data-members-form="subscribe" data-if="@site.allow_self_signup">
      <input type="email" data-members-email data-t-attr="aria-label:member.email_placeholder;placeholder:member.email_placeholder">
      <p data-members-error></p>
      <button data-t="member.signup_cta" data-t-attr="title:post.by author=primary_author.name">Subscribe</button>
    </form>
  </div>
  <span data-if="@site.paid_members_enabled"><a data-members="free" data-bind-attr="data-portal:signup/{tier}" href="#">Upgrade</a></span>
  <button data-ghost-search>Search</button>
  <p data-text="{total_members}">12,000</p>
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

test('Story 4.7 — data-module takes a registry name and an optional width, and refuses the rest with a reason', () => {
  for (const good of ['lightbox', 'accordion:768']) {
    clean(validateMarkup(root(`<div data-module="${good}"></div>`), { controls: [] }), good)
  }
  const refusal = (v: string) => {
    const f = validateMarkup(root(`<div data-module="${v}"></div>`), { controls: [] })
    assert.deepEqual(codes(f), ['bad-value'], v)
    return f[0]!.message
  }
  assert.match(refusal('core'), /platform runtime/)
  assert.match(refusal('search-overlay'), /R-24/)
  assert.match(refusal('back-to-top'), /not in FR-G7's registry.*needs no module/)
  assert.match(refusal('accordion:0'), /whole number of CSS pixels/)
  assert.match(refusal('accordion:7.5'), /whole number of CSS pixels/)
})

test('Story 4.7 review — authored script is refused at the door: a <script>, an on* handler, a javascript: URL', () => {
  refuses('authored-script', '<div><script>alert(1)</script></div>', '<div data-module="lightbox"></div>')
  refuses('authored-script', '<a onclick="x()">x</a>', '<a data-bind-attr="href:url">x</a>')
  refuses('authored-script', '<a href="java\nscript:alert(1)">x</a>', '<a href="https://x.example/">x</a>')
  refuses('authored-script', '<img onerror="x()" alt="">', '<img data-bind-attr="alt:title" alt="">')
})

test("Story 4.7 — an authored js-enabled class is refused: core sets it on the mount, and a design never does", () => {
  refuses('js-enabled-authored', '<div class="card js-enabled">x</div>', '<div class="card js-enabled-note">x</div>')
})

test('Story 5.3 review — an authored data-inflozo-* is refused: the prefix is the editor\'s stamps and state marks', () => {
  refuses('editor-attribute', '<h2 data-inflozo-prop="title">x</h2>', '<h2 data-prop="title">x</h2>')
  refuses('editor-attribute', '<p data-inflozo-editing>x</p>', '<p data-prop="sub">x</p>')
})

// ─── Story 4.9 — the catalog at the lexical door ─────────────────────────────

test('data-t — the grammar: a key, then name=path params, and a helper argument runs to the end of the value', () => {
  clean(validateMarkup(root('<button data-t="search.trigger_label">Search</button>'), { controls: [] }), 'a plain key')
  clean(validateMarkup(root('<p data-t="post.by author=primary_author.name">By Ana</p>'), { controls: [] }), 'a param')
  clean(validateMarkup(root('<p data-t="post.updated_on date=updated_at|date:D MMM YYYY">Updated</p>'), { controls: [] }), 'a helper param')
  refuses('bad-value', '<p data-t="post.updated_on date=updated_at|date:D MMM YYYY x=title">U</p>', '<p data-t="post.updated_on date=updated_at|date:D MMM YYYY">U</p>')
  refuses('bad-value', '<p data-t="Older posts">x</p>', '<p data-t="pagination.older">x</p>')
  refuses('bad-value', '<p data-t="post.by Author=primary_author.name">x</p>', '<p data-t="post.by author=primary_author.name">x</p>')
  refuses('bad-value', '<p data-t="post.by author=primary_author.name}}{{evil">x</p>', '<p data-t="post.by author=primary_author.name">x</p>')
  refuses('bad-value', '<input data-t-attr="value:member.email_placeholder">', '<input data-t-attr="placeholder:member.email_placeholder">')
  refuses('bad-value', '<p data-t="nav.menu" data-empty="hide">x</p>', '<p data-t="nav.menu">x</p>')
  refuses('bad-value', '<p data-t="nav.menu" data-prop="label">x</p>', '<p data-t="nav.menu">x</p>')
  refuses('bad-value', '<img data-t-attr="alt:card.play_video" data-bind-attr="alt:title" alt="">', '<img data-t-attr="alt:card.play_video" data-bind-attr="src:feature_image" alt="">')
})

test('V2 — catalog-key: an unknown, retired, js or canvas key, each with its own reason', () => {
  const reason = (key: string) => {
    const f = validateMarkup(root(`<p data-t="${key}">x</p>`), { controls: [] })
    assert.deepEqual(codes(f), ['catalog-key'], key)
    return f[0]!.message
  }
  assert.match(reason('a1.menu_open'), /not in the catalog/)
  assert.match(reason('search.overlay_empty'), /retired/)
  assert.match(reason('countdown.days'), /js key/)
  assert.match(reason('comments.placeholder'), /canvas-only/)
  assert.match(reason('archive.posts_many'), /written for \{\{plural\}\}/)
  refuses('catalog-key', '<input data-t-attr="placeholder:a22.email">', '<input data-t-attr="placeholder:member.email_placeholder">')
})

test('V4 — catalog-params: exactly the placeholder set, naming what is missing or extra', () => {
  const f = validateMarkup(root('<p data-t="pagination.page_of page=pagination.page">x</p>'), { controls: [] })
  assert.deepEqual(codes(f), ['catalog-params'])
  assert.match(f[0]!.message, /misses pages/)
  const g = validateMarkup(root('<p data-t="nav.menu x=title">x</p>'), { controls: [] })
  assert.deepEqual(codes(g), ['catalog-params'])
  assert.match(g[0]!.message, /passes x/)
  refuses('catalog-params', '<p data-t="post.by">x</p>', '<p data-t="post.by author=primary_author.name">x</p>')
})

test("V1's lexical half — chrome-literal: a data-text template keeps its tokens and prints no English of its own", () => {
  refuses('chrome-literal', '<p data-text="Read by {total_members} readers">x</p>', '<p data-text="{total_members}">x</p>')
  clean(validateMarkup(root('<p data-text="{pagination.page} / {pagination.pages}">1 / 1</p>'), { controls: [] }), 'punctuation is not a word')
})

test('S6 — catalog-prop: a text prop names a live prop-marked key and carries no default', () => {
  const content = (prop: object): CategoryContent => ({ category: 'reference', title: 'Reference', props: { submitLabel: { label: 'Button text', ...prop } as never } })
  assert.deepEqual(codes(validateCategoryContent(content({ type: 'text', catalog: 'member.signup_cta' }))), [])
  assert.deepEqual(codes(validateCategoryContent(content({ type: 'richtext', catalog: 'member.signup_cta' }))), ['catalog-prop'])
  assert.deepEqual(codes(validateCategoryContent(content({ type: 'text', catalog: 'nav.menu' }))), ['catalog-prop'])
  assert.deepEqual(codes(validateCategoryContent(content({ type: 'text', catalog: 'member.signup_cta', default: 'Join' }))), ['catalog-prop'])
})

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
  // Story 5.20: a Portal ask sits behind its flag (R-4), so both sides are gated and only the brace differs
  refuses('bad-value',
    '<span data-if="@site.paid_members_enabled"><a data-bind-attr="data-portal:signup/{tier">x</a></span>',
    '<span data-if="@site.paid_members_enabled"><a data-bind-attr="data-portal:signup/{tier}">x</a></span>')
  assert.equal(typeof parseTokenTemplate('a}b'), 'string')
  assert.equal(typeof parseTokenTemplate('{a b}'), 'string')
  assert.deepEqual(parseTokenTemplate('Read in {reading_time} minutes'), ['reading_time'])
})

test('a guard on a token-template binding is refused; on a plain first entry it is not', () => {
  refuses('guard-on-template',
    '<span data-if="@site.paid_members_enabled"><a data-bind-attr="data-portal:signup/{tier}" data-empty="hide">x</a></span>',
    '<span data-if="@site.paid_members_enabled"><a data-bind-attr="href:url;data-portal:signup/{tier}" data-empty="hide">x</a></span>')
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
  // Story 5.11 — the AUTHORED list's cap is a modifier too: with nothing to modify it would ship verbatim
  refuses('orphan-items-limit',
    '<li data-items-limit="2">x</li>',
    '<li data-items="logos" data-items-limit="2">x</li>')
  refuses('orphan-items-limit',
    '<li data-repeat="tags" data-items-limit="2">x</li>',
    '<li data-items="logos" data-items-limit="2">x</li>')
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
  assert.ok(!CONSUMED_DIRECTIVE_RE.test('<input data-members-email><p data-members-error>'), "Portal's form attributes survive (Story 4.10)")
  for (const d of CONSUMED_DIRECTIVES) assert.ok(CONSUMED_DIRECTIVE_RE.test(`<p ${d}>`), d)
})

test('an inline token a prop does not declare cannot be declared at all outside the closed set', () => {
  const bad: CategoryContent = { category: 'a22', title: 'A22 designs', props: { h: { type: 'text', label: 'Heading', tokens: ['unknownToken'] } } }
  assert.deepEqual(codes(validateCategoryContent(bad)), ['bad-inline-token'])
  const good: CategoryContent = { category: 'a22', title: 'A22 designs', props: { h: { type: 'text', label: 'Heading', tokens: ['members'] } } }
  clean(validateCategoryContent(good), 'a prop declaring {members}')
})

test('R-182 — {page_number} is never DECLARED: every text prop accepts it already (Story 5.16a)', () => {
  const declared: CategoryContent = { category: 'a22', title: 'A22 designs', props: { h: { type: 'text', label: 'Heading', tokens: [PAGE_NUMBER] } } }
  const out = validateCategoryContent(declared)
  assert.deepEqual(codes(out), ['bad-inline-token'])
  assert.ok(out[0]?.message.includes('R-182'), `the refusal must name the ruling that explains it: ${out[0]?.message}`)
  // …and it is not silently promoted into the per-prop universe either: R-27's closed set is still the three
  assert.ok(!(INLINE_TOKENS as readonly string[]).includes(PAGE_NUMBER), 'INLINE_TOKENS is R-27\'s PER-FIELD set and stays at three')
})

test('R-185 — a placeholder with no one-line description cannot ship (Story 5.16a)', () => {
  // The refusal that keeps R-185's "for all future placeholders" from decaying into a note: the {} menu
  // prints PLACEHOLDERS[token], so a token without a line is a row that explains nothing. Fired here over a
  // token that IS in the closed set but whose description has been taken away, which is exactly the shape a
  // later story adding a fourth token would arrive in.
  const kept = { ...PLACEHOLDERS }
  const tokens = INLINE_TOKENS.filter((t) => PLACEHOLDERS[t] === undefined)
  assert.deepEqual(tokens, [], 'every token in the closed set carries its own line today')
  assert.ok(typeof PLACEHOLDERS[PAGE_NUMBER] === 'string' && PLACEHOLDERS[PAGE_NUMBER] !== '', '{page_number} carries one too')
  // the refusal itself, over a described token whose line is removed for the length of this assertion
  const mutable = PLACEHOLDERS as Record<string, string | undefined>
  delete mutable['term']
  try {
    const out = validateCategoryContent({ category: 'a22', title: 'A22 designs', props: { h: { type: 'text', label: 'Heading', tokens: ['term'] } } })
    assert.deepEqual(codes(out), ['no-placeholder-description'])
    assert.ok(out[0]?.message.includes('R-185'), out[0]?.message)
  } finally {
    mutable['term'] = kept['term']
  }
  clean(validateCategoryContent({ category: 'a22', title: 'A22 designs', props: { h: { type: 'text', label: 'Heading', tokens: ['term'] } } }), 'the line put back')
})

test('R-186 · R-187 — which placeholders a field offers, HERE, is one function (Story 5.16a)', () => {
  const plain = { type: 'text' } as const
  const withOwn = { type: 'richtext', tokens: ['members'] } as const
  // page 1: nothing is offered that the prop did not declare — R-186's whole point
  assert.deepEqual(placeholdersOffered(plain, { page: 1 }), [])
  assert.deepEqual(placeholdersOffered(withOwn, { page: 1 }), ['members'])
  // page 2: the page number joins, in PLACEHOLDERS' order
  assert.deepEqual(placeholdersOffered(plain, { page: 2 }), [PAGE_NUMBER])
  assert.deepEqual(placeholdersOffered(withOwn, { page: 2 }), ['members', PAGE_NUMBER])
  // R-187: a site-wide section never offers it, on page 2 or anywhere — but keeps its own
  assert.deepEqual(placeholdersOffered(plain, { page: 2, siteWide: true }), [])
  assert.deepEqual(placeholdersOffered(withOwn, { page: 2, siteWide: true }), ['members'])
  // no page at all (/pilots, /controls) is page 1's answer, and a field that is not typed into offers nothing
  assert.deepEqual(placeholdersOffered(plain, {}), [])
  for (const type of ['image', 'url', 'icon', 'date'] as const) {
    assert.deepEqual(placeholdersOffered({ type }, { page: 2 }), [], `${type} takes no placeholder`)
  }
  assert.deepEqual(placeholdersOffered(undefined, { page: 2 }), [])
})

test('an un-allow-listed token inside a prop VALUE stays literal text — it is not refused (R-27)', () => {
  // The other half of the row above, and the half that says what the customer sees. Substitution
  // is over the prop's DECLARED tokens only, so an undeclared brace run is never a candidate for
  // it and never an error either: it stays the characters that were typed. Provable here as
  // non-refusal, because this story ships no renderer — 4.2's emitters execute the substitution.
  const withStray: CategoryContent = {
    category: 'a22', title: 'A22 designs',
    props: { h: { type: 'text', label: 'Heading', tokens: ['members'], default: 'Hi {members}, see {unknownToken}' } },
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
    category: 'a4', title: 'A4 designs',
    props: { title: { type: 'text', label: 'L' }, 'cta.url': { type: 'url', label: 'L' }, logos: { type: 'array', label: 'L' }, 'logos[].alt': { type: 'text', label: 'L' } },
  }
  const o = { controls: [], content }
  assert.deepEqual(codes(validateMarkup(root('<p data-prop="newsletter.heading">x</p>'), o)), ['unknown-prop'])
  assert.deepEqual(codes(validateMarkup(root('<a data-prop-attr="href:cta.url;title:email.label">x</a>'), o)), ['unknown-prop'])
  assert.deepEqual(codes(validateMarkup(root('<li data-items="partners">x</li>'), o)), ['unknown-prop'])
  clean(validateMarkup(root('<p data-prop="title">x</p><a data-prop-attr="href:cta.url">x</a><li data-items="logos"></li>'), o), 'declared props')
})

test('a directive and its prop must agree in kind', () => {
  const content: CategoryContent = { category: 'a4', title: 'A4 designs', props: { title: { type: 'text', label: 'L' }, logos: { type: 'array', label: 'L' } } }
  const o = { controls: [], content }
  assert.deepEqual(codes(validateMarkup(root('<li data-items="title">x</li>'), o)), ['prop-type-mismatch'])
  assert.deepEqual(codes(validateMarkup(root('<p data-prop="logos">x</p>'), o)), ['prop-type-mismatch'])
  clean(validateMarkup(root('<li data-items="logos">x</li><p data-prop="title">x</p>'), o), 'matching kinds')
})

// ─── Story 4.6 — FR-H8's media rule and R-2's typed initials ─────────────────

test('data-empty="fallback" on a media binding is refused; hide, and fallback on text, are not (FR-H8)', () => {
  refuses('media-fallback',
    '<img data-bind-attr="src:feature_image|img_url:m" data-empty="fallback" alt="">',
    '<img data-bind-attr="src:feature_image|img_url:m" data-empty="hide" alt="">')
  refuses('media-fallback',
    '<img data-bind-srcset="feature_image|img_url" data-empty="fallback" alt="">',
    '<img data-bind-srcset="feature_image|img_url" alt="">')
  refuses('media-fallback',
    '<a data-bind-attr="title:title;href:url" data-empty="fallback">x</a>',
    '<img data-bind-attr="alt:title" data-empty="fallback" alt="x">')
  // exactly this refusal, alone
  assert.deepEqual(codes(validateMarkup(root('<video data-bind-attr="poster:feature_image" data-empty="fallback"></video>'), { controls: [] })), ['media-fallback'])
})

test('a guard sits on the URL entry when there is one, so a template entry before it is not refused', () => {
  refuses('guard-on-template',
    '<a data-bind-attr="title:signup/{tier}" data-empty="hide">x</a>',
    '<span data-if="@site.paid_members_enabled"><a data-bind-attr="data-portal:signup/{tier};href:url" data-empty="hide">x</a></span>')
})

test('data-initials takes a declared TEXT prop — a Ghost field name the category never declared is refused (R-2)', () => {
  const content: CategoryContent = {
    category: 'a21', title: 'A21 designs',
    props: { people: { type: 'array', label: 'L' }, 'people[].name': { type: 'text', label: 'L' }, 'people[].bio': { type: 'richtext', label: 'L' } },
  }
  const o = { controls: [], content }
  assert.deepEqual(codes(validateMarkup(root('<span data-initials="name">JD</span>'), o)), ['unknown-prop'])
  assert.deepEqual(codes(validateMarkup(root('<li data-items="people"><span data-initials="people[].bio">JD</span></li>'), o)), ['prop-type-mismatch'])
  clean(validateMarkup(root('<li data-items="people"><span data-initials="people[].name" data-empty="hide">JD</span></li>'), o), 'initials over a typed name')
  refuses('bad-value', '<span data-initials="people[].na me">x</span>', '<span data-initials="people[].name">x</span>')
})

// ─── design.json ─────────────────────────────────────────────────────────────

const DESIGN: DesignJson = {
  name: 'Reference',
  tier: 'free',
  bindingContext: ['posts'],
  compileTarget: ['index.hbs'],
  controlSchema: [
    { name: 'cols', type: 'stepper', label: 'Columns', group: 'layout', values: ['2', '3'], default: '3' },
    { name: 'card', type: 'segmented', label: 'Card style', group: 'style', values: ['flat', 'raised'], default: 'raised' },
    { name: 'gap', type: 'segmented', label: 'Gap', group: 'style', values: ['tight', 'normal', 'loose'], default: 'normal' },
    { name: 'meta', type: 'named-select', label: 'Meta', group: 'content', values: ['none', 'date'], default: 'date' },
    { name: 'image', type: 'segmented', label: 'Image position', group: 'layout', values: ['top', 'side'], default: 'top' },
    { name: 'rule', type: 'segmented', label: 'Rule', group: 'style', values: ['none', 'line'], default: 'none' },
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

/** One sound control of each shape, so a refusal test changes exactly the field it is about. */
const ctl = (over: Partial<ControlDef> = {}): ControlDef =>
  ({ name: 'cols', type: 'stepper', label: 'Columns', group: 'layout', values: ['2', '3'], default: '2', ...over })
const toggle = (over: Partial<ControlDef> = {}): ControlDef =>
  ({ name: 'rule', type: 'toggle', label: 'Rule', group: 'style', values: ['on', 'off'], default: 'on', ...over })
const align = (over: Partial<ControlDef> = {}): ControlDef =>
  ({ name: 'align', type: 'segmented', label: 'Alignment', group: 'layout', values: ['start', 'center'], default: 'start', ...over })

test('a sound design.json validates clean', () => {
  clean(validateDesignJson(design()), 'the reference design.json')
})

test('bindingContext: page is refused and the ten legal values are named (FR-G3)', () => {
  const f = validateDesignJson(design({ bindingContext: ['page' as 'post'] }))
  assert.deepEqual(codes(f), ['bad-binding-context'])
  assert.match(f[0]!.message, /none · post · posts · tag · tags · author · authors · tiers · error · private/)
  assert.match(f[0]!.message, /a page and a post are the SAME resource/)
  // with `post.hbs` beside it: since Story 5.10 a design that binds `post` and compiles only to `index.hbs` is
  // refused by `context-unreachable`, and rightly — the resource is not there (appendix B1 §3)
  clean(validateDesignJson(design({ bindingContext: ['post'], compileTarget: ['post.hbs'] })), 'bindingContext: post')
})

/* STORY 5.10 — the `bindingContext` half of FR-D12's filter, refused at assembly so it can never hide a design
   silently from the Section Picker's rail. The table is `placement.ts`'s `CONTEXTS_BY_TARGET`, cited to
   `appendix-b1-template-contexts.md` §3 (the master matrix), §3a (the wrapper rule) and §5 (the `{{#get}}` column),
   with R-7 keeping §5 off the two templates that must not query the database. */
test('a design whose contexts fit NONE of its own targets is refused; one target that works is enough', () => {
  const f = validateDesignJson(design({ bindingContext: ['post'], compileTarget: ['index.hbs', 'tag.hbs'] }))
  assert.deepEqual(codes(f), ['context-unreachable'])
  assert.match(f[0]!.message, /vanish from the Section Picker silently/)
  // R-7: §5's resources are withheld from error.hbs and private.hbs, so a posts feed there is unreachable
  assert.deepEqual(codes(validateDesignJson(design({ bindingContext: ['posts'], compileTarget: ['error.hbs'] }))), ['context-unreachable'])
  clean(validateDesignJson(design({ bindingContext: ['error'], compileTarget: ['error.hbs'] })), 'the error page binds its own context')
  // §5 puts `tags` on every template that may run a get, including default.hbs, which carries nothing natively
  clean(validateDesignJson(design({ bindingContext: ['tags'], compileTarget: ['default.hbs'] })), 'a {{#get}} resource on the wrapper')
  clean(validateDesignJson(design({ bindingContext: ['none'], compileTarget: ['default.hbs', 'private.hbs'] })), 'a design that binds nothing fits anywhere')
  // one target that works is enough — the story's own framing of the rule
  clean(validateDesignJson(design({ bindingContext: ['post'], compileTarget: ['post.hbs', 'index.hbs'] })), 'one reachable target')
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

test('R-114 — pills are for short choices: two to four, each at most PILL_CHARS characters and fitting its pill; a longer choice is a named-select', () => {
  const span = { values: ['off', 'span'], default: 'off', valueLabels: { span: 'Spans two columns' } }
  alone({ controlSchema: [align(span)] }, 'pill-words')
  assert.match(validateDesignJson(design({ controlSchema: [align(span)] }))[0]!.message, new RegExp(`"Spans two columns" is longer than ${PILL_CHARS} characters`))
  clean(validateDesignJson(design({ controlSchema: [align({ ...span, type: 'named-select' })] })), 'the same choice as a dropdown')
  // a short phrase that fits is a pill — the owner's measure is characters, not words
  clean(validateDesignJson(design({ controlSchema: [align({ valueLabels: { start: 'Flush left', center: 'Centred' } })] })), 'Flush left · Centred')
  clean(validateDesignJson(design({ controlSchema: [align({ values: ['off', 'member-count'], default: 'off' })] })), 'an unlabelled value prints as its words, Member count, which fits two pills')
  alone({ controlSchema: [align({ values: ['off', 'name-and-reading-time'], default: 'off' })] }, 'pill-words')
  // MEASURED, NOT COUNTED: two eleven-letter words, one fits three pills and one does not
  const three = (word: string) => align({ values: ['a', 'b', 'c'], default: 'a', valueLabels: { a: word, b: 'Two', c: 'Three' } })
  alone({ controlSchema: [three('Wholesomely')] }, 'pill-words')
  assert.match(validateDesignJson(design({ controlSchema: [three('Wholesomely')] }))[0]!.message, /"Wholesomely" is wider than one of 3 pills/)
  clean(validateDesignJson(design({ controlSchema: [three('Comfortable')] })), 'Comfortable fits one of three pills')
  // the track (233) and the room (2 px a side) are pinned at their boundaries, not only by real words: 54 px fits one
  // of four pills and 55 px does not, and 74 px misses one of three — together they hold the room at 4 and the track
  // at 232–233, which decide every whole-pixel width alike
  const four = (word: string) => align({ values: ['a', 'b', 'c', 'd'], default: 'a', valueLabels: { a: word, b: 'B', c: 'C', d: 'D' } })
  assert.deepEqual([pillWidth('aaaaaarrr'), pillWidth('aaaaaaak'), pillWidth('aaaaaaaaaar')], [54, 55, 74])
  clean(validateDesignJson(design({ controlSchema: [four('aaaaaarrr')] })), '54 px in one of four pills')
  alone({ controlSchema: [four('aaaaaaak')] }, 'pill-words')
  alone({ controlSchema: [three('aaaaaaaaaar')] }, 'pill-words')
  alone({ controlSchema: [align({ values: ['a', 'b', 'c', 'd', 'e'], default: 'a' })] }, 'pill-words')
  alone({ controlSchema: [align({ values: ['only'], default: 'only' })] }, 'pill-words')
  alone({ controlSchema: [align({ valueLabels: { start: ' ' } })] }, 'pill-words')
  // junk values are their grammar's refusal, not a crash and not a pill's
  alone({ controlSchema: [align({ values: [3 as unknown as string, 'start'], default: 'start' })] }, 'control-values')
  // and JSON's other non-strings: a pattern test reads 2 as "2" and true as "true", so each passed its grammar before
  alone({ controlSchema: [ctl({ values: [2, 3] as unknown as string[], default: 2 as unknown as string })] }, 'control-values')
  alone({ controlSchema: [align({ values: [true, 'start'] as unknown as string[], default: 'start' })] }, 'control-values')
  // a value's words are its own label, never one a plain object inherits — `constructor` is a legal kebab value
  assert.equal(valueWords({}, 'constructor'), 'Constructor')
  clean(validateDesignJson(design({ controlSchema: [align({ values: ['constructor', 'start'], default: 'start' })] })), 'an inherited name is not a label')
  // the widths are the ones the browser drew in the deployed panel (2026-09-15)
  assert.deepEqual(['Comfortable', 'Wholesomely', 'Spans two columns', 'Compact', 'Mammoth'].map(pillWidth), [73, 80, 114, 53, 58])
  // the vocabulary obeys its own rule, and a toggle, a stepper and a dropdown are not pills
  for (const u of UNIVERSALS) {
    if (u.type === 'segmented') assert.equal(pillRefusal(u.values.map((v) => valueWords(u.valueLabels, v))), null, u.name)
  }
  clean(validateDesignJson(design({ controlSchema: [ctl({ values: ['2', '3', '4', '5', '6'] }), toggle(), align({ name: 'long', type: 'named-select', values: ['a', 'b', 'c', 'd', 'e'], default: 'a' })] })), 'no pill rule outside a segmented control')
})

test('JSON null anywhere in design.json or content.json is refused by its path, before any check reads through it', () => {
  const no = null as never
  for (const [over, at] of [
    [{ controlSchema: [align({ valueLabels: no })] }, 'controlSchema[0].valueLabels'],
    [{ controlSchema: [align({ disabledBy: no })] }, 'controlSchema[0].disabledBy'],
    [{ controlSchema: [no] }, 'controlSchema[0]'],
    [{ universals: { bg: no } }, 'universals.bg'],
    [{ dataBindings: { latest: no } }, 'dataBindings.latest'],
  ] as const) {
    const f = validateDesign({ html: EVERY_DIRECTIVE, design: design(over as Partial<DesignJson>) })
    assert.deepEqual(codes(f), ['json-null'], at)
    assert.deepEqual(codes(validateDesignJson(design(over as Partial<DesignJson>))), ['json-null'], `${at}, design.json on its own`)
    assert.match(f[0]!.message, new RegExp(`design\\.json carries null at ${at.replace(/[[\].]/g, '\\$&')}\\.`))
  }
  const content = { category: 'a17', title: 'A17 designs', props: { title: no } } as unknown as CategoryContent
  assert.deepEqual(codes(validateDesign({ html: EVERY_DIRECTIVE, design: design(), content })), ['json-null'])
  assert.deepEqual(codes(validateCategoryContent(content)), ['json-null'])
})

test('R-113 — a design.json carrying quickControls[] is told there are none', () => {
  alone({ quickControls: ['cols'] } as Partial<DesignJson>, 'quick-controls-withdrawn')
})

test('Story 5.19 — a query that is NOT a declaration (a secondary feed\'s) is the same grammar with the key rule not asked', () => {
  const feed = { source: 'posts', limit: 12, order: 'published_at desc' }
  assert.deepEqual(validateDataBinding('posts', feed).map((f) => f.code), ['bad-get-key'], 'the control: as a declaration, `posts` is no key')
  assert.deepEqual(validateDataBinding('posts', feed, { declared: false }), [])
  // every OTHER rule is still asked
  assert.deepEqual(validateDataBinding('posts', { ...feed, limit: 500 }, { declared: false }).map((f) => f.code), ['bad-get-limit'])
  assert.deepEqual(validateDataBinding('posts', { source: 'posts', filter: 'tag:{{x}}' }, { declared: false }).map((f) => f.code), ['bad-get-filter'])
  assert.deepEqual(validateDataBinding('posts', { source: 'posts', ids: [] }, { declared: false }).map((f) => f.code), ['bad-get-ids'])
})

test('Story 5.19 — the Source vocabulary and the two grammars the fold emits', () => {
  assert.deepEqual([...POST_SOURCES], ['latest', 'featured', 'tag', 'author', 'picked'])
  assert.deepEqual(POST_SOURCES.map((v) => POST_SOURCE_WORDS[v]), ['Latest', 'Featured', 'By tag', 'By author', 'Hand-picked'])
  for (const slug of ['craft', 'field-notes', 'a_b', '2026']) assert.ok(GHOST_SLUG_RE.test(slug), slug)
  for (const slug of ["x'", 'Field', 'a b', '', 'é', 'x"}}']) assert.ok(!GHOST_SLUG_RE.test(slug), slug)
  assert.ok(GHOST_ID_RE.test('6a86b5fb6444934864da3283'))
  for (const id of ['6A86B5FB6444934864DA3283', '6a86b5fb6444934864da328', 'zz', "6a86b5fb6444934864da3283'"]) assert.ok(!GHOST_ID_RE.test(id), id)
  // DW-112: Ghost's default limit is the vocabulary's now
  assert.deepEqual(DEFAULT_LIMIT, { posts: 15, tags: 15, authors: 15, tiers: 'all' })
})

test('every other design.json refusal fires, and its neighbour does not', () => {
  const only = (over: Record<string, unknown>, code: string) =>
    assert.ok(codes(validateDesignJson({ ...DESIGN, ...over } as DesignJson)).includes(code), `${code} should fire`)
  only({ id: 'a17/1' }, 'id-authored')
  only({ tier: 'gold' }, 'bad-tier')
  only({ surface: 'signupp' }, 'bad-surface')
  only({ surface: 1 }, 'bad-surface')
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
  // R-108 (Story 4.10): a fixed query — true only, never beside ids, and only with both a limit and an order
  only({ dataBindings: { latest: { source: 'posts', limit: 1, order: 'published_at desc', fixed: 'yes' } } }, 'bad-get-fixed')
  only({ dataBindings: { picks: { source: 'posts', ids: ['abc'], fixed: true } } }, 'bad-get-fixed')
  only({ dataBindings: { latest: { source: 'posts', limit: 1, fixed: true } } }, 'bad-get-fixed')
  only({ dataBindings: { latest: { source: 'posts', order: 'published_at desc', fixed: true } } }, 'bad-get-fixed')
  only({ controlSchema: [ctl({ name: 'Cols' })] }, 'bad-control-name')
  only({ controlSchema: [ctl({ name: 'items' })] }, 'bad-control-name')
  only({ controlSchema: [ctl(), ctl()] }, 'duplicate-control')
  only({ controlSchema: [toggle({ disabledBy: { control: 'align', whenValue: 'center', reason: 'r', inForce: 'off' } })] }, 'dependency-unknown')
  only({ controlSchema: [toggle({ disabledBy: { control: 'rule', whenValue: 'off', reason: 'r', inForce: 'off' } })] }, 'dependency-self')
  only({ controlSchema: [
    align(),
    toggle({ disabledBy: { control: 'align', whenValue: 'middle', reason: 'r', inForce: 'off' } }),
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
  clean(validateDesignJson(design({ dataBindings: { latest: { source: 'posts', limit: 1, order: 'published_at desc', fixed: true } } })),
    'a query the design fixes at one post (R-108)')
  clean(validateDesignJson(design()), 'the reference design.json')
})

/* STORY 5.10 — the category's DISPLAY NAME lives beside its props, because the Section Picker's rail needs one and
   the category directory is the only place it can live without a second list that can drift from it. */
test('content.json: a category needs a title, and the bare id is not one', () => {
  const props = { h: { type: 'text', label: 'L' } } as CategoryContent['props']
  for (const title of [undefined, '', '   ', 'a17', 42]) {
    assert.deepEqual(codes(validateCategoryContent({ category: 'a17', title, props } as unknown as CategoryContent)), ['category-title'], JSON.stringify(title))
  }
  clean(validateCategoryContent({ category: 'a17', title: 'Post Grids', props }), 'a real display name')
})

test('content.json refusals: marks, tokens, orphan items, unsafe defaults, the category id', () => {
  const only = (props: CategoryContent['props'], code: string, category = 'a22') =>
    assert.ok(codes(validateCategoryContent({ category, title: 'Reference', props })).includes(code), `${code} should fire`)
  only({ h: { type: 'richtext', label: 'L', marks: ['script'] } }, 'bad-mark')
  only({ h: { type: 'text', label: 'L', marks: ['strong'] } }, 'marks-on-plain-prop')
  only({ u: { type: 'url', label: 'L', tokens: ['members'] } }, 'tokens-on-non-text')
  only({ 'logos[].alt': { type: 'text', label: 'L' } }, 'orphan-item-prop')
  only({ logos: { type: 'text', label: 'L' }, 'logos[].alt': { type: 'text', label: 'L' } }, 'orphan-item-prop')
  only({ u: { type: 'url', label: 'L', default: 'javascript:alert(1)' } }, 'unsafe-default-url')
  only({ u: { type: 'url', label: 'L', default: { href: 'javascript:alert(1)' } } }, 'unsafe-default-url')
  only({ u: { type: 'url', label: 'L', default: { portal: 'upgrade' } } }, 'unset-default-link')
  only({ u: { type: 'url', label: 'L', default: { search: 'yes' } } }, 'unset-default-link')
  only({ u: { type: 'url', label: 'L', default: { href: '' } } }, 'unset-default-link')
  only({}, 'bad-category', 'A-22')
  clean(validateCategoryContent({ category: 'a22', title: 'A22 designs', props: {
    h: { type: 'richtext', label: 'Heading', marks: ['strong', 'em', 'u', 'a'], tokens: ['members'] },
    u: { type: 'url', label: 'Link', default: 'https://example.com/' },
    logos: { type: 'array', label: 'Logos' }, 'logos[].alt': { type: 'text', label: 'Description' },
  } }), 'a sound content.json')
})

test('a universal control may not be redeclared per design (R-23)', () => {
  const f = validateDesignJson(design({
    controlSchema: [ctl({ name: 'spacing', type: 'segmented', values: ['compact', 'spacious'], default: 'compact' })],
  }))
  assert.deepEqual(codes(f), ['universal-control-redeclared'])
})

test('a control must be closed-valued, and its default must be one of its values', () => {
  assert.deepEqual(codes(validateDesignJson(design({ controlSchema: [ctl({ values: [], default: '3' })] }))), ['control-open-valued'])
  assert.deepEqual(codes(validateDesignJson(design({ controlSchema: [ctl({ default: '4' })] }))), ['control-default'])
})

test('a control dependency carries its reason (R-33)', () => {
  assert.deepEqual(codes(validateDesignJson(design({
    controlSchema: [align(), toggle({ disabledBy: { control: 'align', whenValue: 'center', reason: '', inForce: 'off' } })],
  }))), ['dependency-without-reason'])
})

// ─── Story 4.5 — the control vocabulary, each refusal fired ALONE ────────────
// `test-vocabulary.mjs` derives the refusal list from `validate.ts` and fails on a code with no test,
// and each case below asserts the one code it is about and nothing else, so a fixture that trips a
// second rule is a failing test rather than a quiet pass.

const alone = (over: Partial<DesignJson>, code: string) =>
  assert.deepEqual(codes(validateDesignJson(design(over))), [code], `only ${code} should fire`)

test('a control outside the five types, or with no label or group, is refused', () => {
  alone({ controlSchema: [ctl({ type: 'text' as ControlDef['type'] })] }, 'control-type')
  alone({ controlSchema: [ctl({ label: '' })] }, 'control-label')
  alone({ controlSchema: [ctl({ group: 'arrangement' as ControlDef['group'] })] }, 'control-group')
  assert.match(validateDesignJson(design({ controlSchema: [ctl({ group: 'arrangement' as ControlDef['group'] })] }))[0]!.message, /which is Layout now/)
  alone({ controlSchema: [ctl({ group: 'data' as ControlDef['group'] })] }, 'control-group')
  assert.match(validateDesignJson(design({ controlSchema: [ctl({ group: 'data' as ControlDef['group'] })] }))[0]!.message, /dataBindings entry, never a control/)
  for (const group of ['settings', 'content', 'layout', 'style'] as const) clean(validateDesignJson(design({ controlSchema: [ctl({ group })] })), `a control in ${group}`)
  clean(validateDesignJson(design({ controlSchema: [ctl(), toggle(), align()] })), 'three sound controls')
})

test("values that break their type's grammar are refused, and each type's legal set is not", () => {
  alone({ controlSchema: [toggle({ values: ['yes', 'no'], default: 'yes' })] }, 'control-values')
  alone({ controlSchema: [ctl({ values: ['2', '4'] })] }, 'control-values')
  alone({ controlSchema: [ctl({ values: ['3', '2'], default: '3' })] }, 'control-values')
  alone({ controlSchema: [ctl({ values: ['12px', '24px'], default: '12px' })] }, 'control-values')
  alone({ controlSchema: [align({ values: ['#ff0000', 'start'] })] }, 'control-values')
  alone({ controlSchema: [ctl({ name: 'tint', type: 'swatch-row', group: 'style', values: ['base', 'none'], default: 'base' })] }, 'control-values')
  alone({ controlSchema: [align({ valueLabels: { start: 'Left', middle: 'Middle' } })] }, 'value-label-unknown')
  clean(validateDesignJson(design({ controlSchema: [
    ctl({ values: ['2', '3', '4'] }), toggle(), align({ valueLabels: { start: 'Left', center: 'Centre' } }),
    ctl({ name: 'tint', type: 'swatch-row', group: 'style', values: ['base', 'surface'], default: 'base' }),
    ctl({ name: 'meta', type: 'named-select', group: 'style', values: ['none', 'author-date'], default: 'none' }),
  ] })), 'every type at its own grammar')
})

test('Inherit, or any CSS-wide word, is refused anywhere in a declaration (FR-F2, R-23)', () => {
  alone({ controlSchema: [align({ values: ['start', 'inherit'] })] }, 'css-wide-keyword')
  alone({ controlSchema: [align(), toggle({ disabledBy: { control: 'align', whenValue: 'center', reason: 'r', inForce: 'off' } }),
    ctl({ name: 'fit', type: 'segmented', group: 'style', values: ['cover', 'unset'], default: 'cover' })] }, 'css-wide-keyword')
})

test('more than the cap of own controls is refused; the universals and the cap itself are not', () => {
  const many = (n: number) => Array.from({ length: n }, (_, i) => align({ name: `c${i}`, label: `Control ${i}` }))
  alone({ controlSchema: many(CONTROL_CAP + 1) }, 'control-cap')
  clean(validateDesignJson(design({ controlSchema: many(CONTROL_CAP), universals: { divider: { values: ['none', 'line'], reason: 'r' } } })), 'exactly the cap, with a universal narrowed')
})

test('a dependency cycle is refused, and a chain is not', () => {
  const dep = (control: string) => ({ control, whenValue: 'center', reason: 'r', inForce: 'start' })
  alone({ controlSchema: [align({ name: 'a', disabledBy: dep('b') }), align({ name: 'b', disabledBy: dep('a') })] }, 'dependency-cycle')
  clean(validateDesignJson(design({ controlSchema: [align({ name: 'a' }), align({ name: 'b', disabledBy: dep('a') }), align({ name: 'c', disabledBy: dep('b') })] })), 'a chain')
})

test('R-113 — inside one group, a control greyed by another is declared after it; across groups the order is the panel\'s', () => {
  const dep = (control: string) => ({ control, whenValue: 'center', reason: 'r', inForce: 'start' })
  alone({ controlSchema: [align({ name: 'b', disabledBy: dep('a') }), align({ name: 'a' })] }, 'dependency-order')
  clean(validateDesignJson(design({ controlSchema: [align({ name: 'a' }), align({ name: 'b', disabledBy: dep('a') })] })), 'the greying control first')
  clean(validateDesignJson(design({ controlSchema: [align({ name: 'b', group: 'style', disabledBy: dep('a') }), align({ name: 'a' })] })), 'a dependency across groups')
})

test('a greyed control renders one of its own values', () => {
  alone({ controlSchema: [align(), toggle({ disabledBy: { control: 'align', whenValue: 'center', reason: 'r', inForce: 'none' } })] }, 'dependency-in-force')
})

test('a universal narrowing is a subset with a reason and a default it offers; an empty list is the no-value lock (R-103)', () => {
  alone({ universals: { bg: { values: ['base', 'none'], reason: 'r' } } }, 'universal-narrowing')
  alone({ universals: { bg: { values: ['base', 'surface'], reason: '' } } }, 'universal-reason')
  alone({ universals: { spacing: { values: ['compact', 'spacious'], reason: 'r' } } }, 'universal-default')
  alone({ universals: { bg: { values: [], default: 'base', reason: 'r' } } }, 'universal-default')
  alone({ universals: { tone: { values: ['a'], reason: 'r' } } }, 'universal-unknown')
  // an Inherit in a narrowing is also outside the universal's values, so it cannot fire alone there
  assert.deepEqual(codes(validateDesignJson(design({ universals: { divider: { values: ['none', 'line'], default: 'inherit', reason: 'r' } } }))), ['css-wide-keyword', 'universal-default'])
  clean(validateDesignJson(design({ universals: {
    bg: { values: ['base', 'surface', 'contrast'], reason: 'This design is drawn for plain grounds.' },
    spacing: { values: ['compact', 'spacious'], default: 'compact', reason: 'r' },
  } })), 'a narrowing with its reason')
  clean(validateDesignJson(design({ universals: { bg: { values: [], reason: 'Transparent over the hero is this design' } } })), "R-103's no-value lock")
})

test('an absent note names its group and says why', () => {
  alone({ absent: [{ group: 'style', note: '' }] }, 'absent-note')
  alone({ absent: [{ group: 'arrangement' as 'style', note: 'n' }] }, 'absent-note')
  for (const group of ['settings', 'content', 'layout', 'style', 'data'] as const) clean(validateDesignJson(design({ absent: [{ group, note: 'n' }] })), `an absent note in ${group}`)
  clean(validateDesignJson(design({ absent: [{ group: 'style', note: 'There is no image focus here.' }] })), 'a sound absent note')
})

test('a root value outside its offered set, and a no-value-locked universal on the root, are refused', () => {
  const html = (bg: string, cols = '3') => `<section ${bg} data-spacing="comfortable" data-divider="none" data-cols="${cols}"></section>`
  const controlValues = { cols: ['2', '3'], bg: ['base', 'surface'], spacing: ['compact', 'comfortable', 'spacious'], divider: ['none', 'line', 'fade'] }
  const opts = { controls: ['cols'], controlValues }
  assert.deepEqual(codes(validateMarkup(html('data-bg="base"', '12px'), opts)), ['root-control-value'])
  assert.deepEqual(codes(validateMarkup(html('data-bg="accent"'), opts)), ['root-control-value'])
  clean(validateMarkup(html('data-bg="surface"'), opts), 'a root at offered values')
  const locked = { ...opts, controlValues: { ...controlValues, bg: [] } }
  assert.deepEqual(codes(validateMarkup(html('data-bg="base"'), locked)), ['universal-locked-on-root'])
  clean(validateMarkup(html(''), locked), 'a no-value-locked root with no data-bg')
  // and names alone — the stress archetypes' form — still check nothing about values
  clean(validateMarkup(html('data-bg="whatever"', 'x'), { controls: ['cols'] }), 'names only')
})

test('content.json: a prop needs a label and a known type; an array its bounds and sentences; an icon and a date their shapes', () => {
  const only = (props: CategoryContent['props'], code: string, icons?: (n: string) => readonly [] | undefined) =>
    assert.deepEqual(codes(validateCategoryContent({ category: 'a5', title: 'A5 designs', props }, icons)), [code], `only ${code} should fire`)
  const set = (n: string) => (n === 'star' || n === 'heart-filled' ? [] as const : undefined)
  only({ h: { type: 'text', label: '' } }, 'prop-label')
  only({ h: { type: 'color' as 'text', label: 'Colour' } }, 'prop-type')
  only({ f: { type: 'array', label: 'Features', min: 4, max: 2, atMin: 'a', atMax: 'b' } }, 'array-bounds')
  only({ f: { type: 'array', label: 'Features', min: 2, max: 6, atMin: 'a', atMax: 'b', default: [] } }, 'array-bounds')
  only({ t: { type: 'text', label: 'Title', max: 6 } }, 'array-bounds')
  only({ f: { type: 'array', label: 'Features', min: 2, max: 6, atMin: 'a' } }, 'array-sentence')
  only({ f: { type: 'array', label: 'Features', min: 2, atMax: 'b' } }, 'array-sentence')
  only({ n: { type: 'url', label: 'Link', maxChars: 30 } }, 'max-chars-type')
  only({ n: { type: 'text', label: 'Eyebrow', maxChars: 0 } }, 'max-chars-value')
  only({ n: { type: 'richtext', label: 'Heading', maxChars: 2.5 } }, 'max-chars-value')
  only({ n: { type: 'text', label: 'Eyebrow', maxChars: 4, default: 'Five!' } }, 'max-chars-default')
  only({ n: { type: 'richtext', label: 'Heading', maxChars: 4, default: { text: 'Five!' } } }, 'max-chars-default')
  // review (2026-09-18): a catalog-linked field starts from the catalog's words — "Subscribe" is nine — so a shorter limit would refuse every keystroke
  only({ n: { type: 'text', label: 'Button', catalog: 'member.signup_cta', maxChars: 4 } }, 'max-chars-catalog')
  clean(validateCategoryContent({ category: 'a5', title: 'A5 designs', props: { n: { type: 'text', label: 'Button', catalog: 'member.signup_cta', maxChars: 9 } }}), 'a catalog string that fits its limit')
  only({ i: { type: 'icon', label: 'Icon', default: 'rocketship' } }, 'icon-default', set)
  only({ i: { type: 'icon', label: 'Icon', default: '"><script>' } }, 'icon-default')
  only({ d: { type: 'date', label: 'Next issue', default: '1 October 2026' } }, 'date-default')
  only({ d: { type: 'date', label: 'Next issue', default: '2026-02-30' } }, 'date-default')
  clean(validateCategoryContent({ category: 'a5', title: 'A5 designs', props: {
    f: { type: 'array', label: 'Features', min: 2, max: 6, atMin: 'a', atMax: 'b', item: 'feature', default: [{}, {}] },
    'f[].icon': { type: 'icon', label: 'Icon', default: 'star' },
    g: { type: 'icon', label: 'Badge', default: 'heart-filled' },
    d: { type: 'date', label: 'Next issue', default: '2028-02-29' },
    e: { type: 'text', label: 'Eyebrow', maxChars: 5, default: 'Five!' },
    h: { type: 'richtext', label: 'Heading', maxChars: 40 },
  } }, set), 'a sound array, icon, date and two limits')
})

test('data-prop takes an icon and a date prop as well as text', () => {
  const content: CategoryContent = { category: 'a5', title: 'A5 designs', props: { i: { type: 'icon', label: 'Icon' }, d: { type: 'date', label: 'Day' }, u: { type: 'url', label: 'Link' } } }
  clean(validateMarkup(root('<span data-prop="i"></span><time data-prop="d">x</time>'), { controls: [], content }), 'icon and date via data-prop')
  assert.deepEqual(codes(validateMarkup(root('<span data-prop="u">x</span>'), { controls: [], content })), ['prop-type-mismatch'])
})

test("a category's control union is generated from its designs, and one name with two value sets is refused (R-53)", () => {
  const a = { id: 'a5/1', controlSchema: [ctl(), align()] }
  const b = { id: 'a5/2', controlSchema: [align(), toggle()] }
  const union = categoryControlUnion([a, b])
  assert.ok(Array.isArray(union), String(union))
  assert.deepEqual(union.map((c) => c.name), ['cols', 'align', 'rule'])
  const c = { id: 'a5/3', controlSchema: [ctl({ values: ['2', '3', '4'] })] }
  const refused = categoryControlUnion([a, b, c])
  assert.equal(typeof refused, 'string')
  assert.match(String(refused), /a5\/1/)
  assert.match(String(refused), /a5\/3/)
  // a named value set compares as a set — pill order is only where the pills sit — and a stepper's in order
  assert.ok(Array.isArray(categoryControlUnion([a, { id: 'a24/1', controlSchema: [align({ values: ['center', 'start'] })] }])), 'Left · Centre and Centre · Left are one set')
  assert.equal(typeof categoryControlUnion([a, { id: 'a24/1', controlSchema: [ctl({ values: ['3', '2'], default: '3' })] }]), 'string', 'a stepper in another order is another control')
  // one name, one type: a named-select named like a segmented control is refused, whatever its values
  assert.match(String(categoryControlUnion([a, { id: 'a5/5', controlSchema: [align({ type: 'named-select' })] }])), /"align" is a segmented in a5\/1 and a named-select in a5\/5/)
  // R-113: one name, one group
  const moved = categoryControlUnion([a, { id: 'a5/4', controlSchema: [align({ group: 'style' })] }])
  assert.match(String(moved), /"align" sits in layout in a5\/1 and in style in a5\/4/)
})

// ─── assembly ────────────────────────────────────────────────────────────────

test('an entry is assembled from the path, the design, the category content and the files', () => {
  const content: CategoryContent = { category: 'a17', title: 'A17 designs', props: { title: { type: 'text', label: 'L' } } }
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
  assert.ok(!('quickControls' in e), 'nothing is pinned above the groups, so the entry recovers no Quick Controls (R-113)')
  assert.deepEqual(parseDesignDir('a3/12'), { category: 'a3', n: '12' })
  assert.equal(parseDesignDir('a3'), null)
  assert.deepEqual(e.js, ['reveal'], "FR-G3's js is read from the markup's data-module")
})

test("Story 4.7 — js is the markup's declared modules in registry order, omitted when none, and a bad one refuses assembly", () => {
  const content: CategoryContent = { category: 'a17', title: 'A17 designs', props: {} }
  const at = (html: string) => assembleEntry({ dir: 'designs/a17/2', design: design(), content, html, css: '' })
  const two = at('<section data-module="lightbox"><div data-module="carousel:768"></div><p data-module="lightbox"></p></section>')
  assert.ok(typeof two !== 'string', String(two))
  if (typeof two !== 'string') assert.deepEqual(two.js, ['carousel', 'lightbox'])
  const none = at('<section></section>')
  assert.ok(typeof none !== 'string' && !('js' in none), 'an entry declaring no module carries no js at all')
  assert.match(String(at('<section data-module="search-overlay"></section>')), /R-24/)
})

test('a content.json from another category is refused (R-102)', () => {
  const e = assembleEntry({
    dir: 'designs/a3/4', design: design(),
    content: { category: 'a22', title: 'A22 designs', props: {} }, html: '<section></section>', css: '',
  })
  assert.equal(typeof e, 'string')
  assert.match(String(e), /never crosses a category boundary/)
})

test('validateDesign runs design.json, content.json and markup as one', () => {
  const content: CategoryContent = {
    category: 'a17', title: 'A17 designs',
    props: {
      title: { type: 'text', label: 'Title' }, 'cta.url': { type: 'url', label: 'Link' }, 'cta.title': { type: 'text', label: 'Link title' },
      logos: { type: 'array', label: 'Logos' }, 'logos[].name': { type: 'text', label: 'Name' },
    },
  }
  const f = validateDesign({
    html: EVERY_DIRECTIVE,
    design: design({
      controlSchema: [
        { name: 'cols', type: 'stepper', label: 'Columns', group: 'layout', values: ['2', '3'], default: '3' },
        { name: 'card', type: 'segmented', label: 'Card style', group: 'style', values: ['flat', 'raised'], default: 'raised' },
      ],
      compileTarget: ['index.hbs', 'tag.hbs'],
      dataBindings: { latest: { source: 'posts', limit: 9 } },
      bindingContext: ['posts', 'tags'],
    }),
    content,
  })
  clean(f, 'the reference design end to end')
})

test('AD-3 from the stylesheet\'s side: every [data-…] a rule selects on is a declared control or a universal, at a value it offers', () => {
  const said = (css: string) => codes(validateDesign({ html: EVERY_DIRECTIVE, design: design({ controlSchema: [align()] }), css })).filter((c) => c.startsWith('stylesheet-'))
  assert.deepEqual(said('.s[data-align="center"] .x{} .s[data-bg="contrast"]{} .s[data-align]{} /* [data-meta="off"] is only words */'), [])
  // what a stylesheet may select on that no control can be named: Portal's form, Ghost's link, a Koenig card, the
  // visitor's mode; and a value matched as CSS matches it — unquoted, case-folded by i, by prefix
  assert.deepEqual(said('form[data-members-form="signup"] [data-members-email]{} a[data-portal]{} :root[data-mode="dark"] .x{} .kg-toggle-card[data-kg-toggle-state="close"]{} [data-Align="CENTER" i]{} [data-align^="cen"]{} [data-align=start]{}'), [])
  // a string is not a selector, and a "/*" inside one opens no comment
  assert.deepEqual(said('.x::after{content:"[data-foo] /*"} .s[data-align="start"]{}'), [])
  assert.deepEqual(said('.x::after{content:"/*"} .x[data-old-name="x"]{} /* note */'), ['stylesheet-control-undeclared'])
  // Story 4.10's rename, half done: the control is byline now, and one rule still selects on meta
  assert.deepEqual(said('.s[data-byline="off"] .m, .s[data-meta="off"] .m { display: none }'), ['stylesheet-control-undeclared', 'stylesheet-control-undeclared'])
  assert.deepEqual(said('[*|data-old-name]{} [data\\-older]{}'), ['stylesheet-control-undeclared', 'stylesheet-control-undeclared'])
  assert.deepEqual(said(".s[data-align='middle']{} .s[data-align='middle'] .x{}"), ['stylesheet-control-value'], 'one selector is named once')
  assert.deepEqual(said('[data-align="center"]{} [data-align="middle"]{}'), ['stylesheet-control-value'], 'every value of a control is read, not its first')
  assert.deepEqual(said('[data-align=middle]{} [data-align="flush left"]{} [data-align^="mid"]{}'), ['stylesheet-control-value', 'stylesheet-control-value', 'stylesheet-control-value'])
  // every operator as CSS reads it: each first line matches an offered value, each second matches none
  assert.deepEqual(said('[data-align|="center"]{} [data-align~="center"]{} [data-align$="ter"]{} [data-align*="nte"]{} [data-align="cente\\r"]{} [data-align="\\63 enter"]{}'), [])
  assert.deepEqual(said('[data-align|="cen"]{} [data-align~="cent"]{} [data-align$="cen"]{} [data-align*="xyz"]{} [data-align^=""]{}').length, 5)
  // HTML matches attribute names in any case; a translation's attributes are Ghost's; a comment left open runs to the end
  assert.deepEqual(said('.x[DATA-meta="off"]{} .y[Data-Meta]{}'), ['stylesheet-control-undeclared', 'stylesheet-control-undeclared'])
  assert.deepEqual(said('[data-i18n-key]{} .x{} /* left open [data-old="x"]'), [])
  // a string ends at its line, so an unclosed one hides nothing on the next
  assert.deepEqual(said('.x::after{content:"never closed\n.x[data-old="x"]{}'), ['stylesheet-control-undeclared'])
  // a string carries across an escaped newline, as CSS's does, so the rule after it is read
  assert.deepEqual(said('.a::after{content:"x\\\ny"} .b[data-meta="off"]{}'), ['stylesheet-control-undeclared'])
  // an escape in the name is decoded too, and one past U+10FFFF is U+FFFD, never a throw
  assert.deepEqual(said('[data-\\61 lign="middle"]{}'), ['stylesheet-control-value'])
  assert.deepEqual(said('[data-align="\\110000"]{} [data-\\110000]{}'), ['stylesheet-control-value', 'stylesheet-control-undeclared'])
  // Portal's members actions are Ghost's, never a control's
  assert.deepEqual(said('[data-members-signout]{} [data-members-plan="x"]{}'), [])
  // (linear time on hostile input is timed by tools/check-snapshots.mjs — a core package reads no clock, AD-1)
})

test('a control is never named like an attribute the page or Ghost owns', () => {
  for (const name of ['mode', 'portal', 'kg-card', 'i18n-key', 'members-signout']) alone({ controlSchema: [align({ name })] }, 'bad-control-name')
})

test('an authored date is a real calendar day in YYYY-MM-DD, and nothing else', () => {
  for (const good of ['2026-10-01', '2028-02-29', '2000-02-29']) assert.ok(isIsoDate(good), good)
  for (const bad of ['2026-02-29', '1900-02-29', '2026-13-01', '2026-10-1', '2026-10-01T00:00:00Z', '', 20261001, null]) assert.ok(!isIsoDate(bad), String(bad))
})

test("Portal's form attributes are directives that take no value (Story 4.10)", () => {
  const form = (attrs: string) => root(`<form data-members-form="subscribe" data-if="@site.allow_self_signup"><input type="email" ${attrs}><p data-members-error></p></form>`)
  clean(validateMarkup(form('data-members-email'), { controls: [] }), 'the email input Portal submits')
  for (const bad of ['data-members-email="x"']) {
    assert.deepEqual(codes(validateMarkup(form(bad), { controls: [] })), ['bad-value'], bad)
  }
  assert.deepEqual(codes(validateMarkup(root('<p data-members-error="oops"></p>'), { controls: [] })), ['bad-value'])
  assert.equal(DIRECTIVES['data-members-email']?.emitted, true)
  assert.equal(DIRECTIVES['data-members-error']?.emitted, true)
})


// ─── Story 5.20 — R-4 and FR-H6, where every design is assembled ─────────────────────────────────────────────────

test('member-ask-ungated (R-4): an ask to join sits inside a data-if on the site\'s OWN flag for it — on itself or around it', () => {
  // a free ask: a subscribe or sign-up form, a Portal signup, a bound signup to the free tier
  refuses('member-ask-ungated',
    '<form data-members-form="subscribe"><input type="email" data-members-email></form>',
    '<form data-members-form="subscribe" data-if="@site.allow_self_signup"><input type="email" data-members-email></form>')
  refuses('member-ask-ungated',
    '<p><a data-portal="signup" href="#">Join</a></p>',
    '<div data-if="@site.allow_self_signup"><p><a data-portal="signup" href="#">Join</a></p></div>')
  // a paid ask: a tier's signup, an offer, the upgrade
  for (const action of ['signup/abc/monthly', 'account/plans', 'offers/xyz']) {
    refuses('member-ask-ungated',
      `<a data-portal="${action}" href="#">Go</a>`,
      `<span data-if="@site.paid_members_enabled"><a data-portal="${action}" href="#">Go</a></span>`)
  }
  refuses('member-ask-ungated',
    '<a data-bind-attr="data-portal:signup/{id}/monthly" href="#">Go</a>',
    '<span data-if="@site.paid_members_enabled"><a data-bind-attr="data-portal:signup/{id}/monthly" href="#">Go</a></span>')
})

test('member-ask-ungated: the WRONG flag, members_enabled, a tier count or the else arm never satisfies it; sign-in asks nothing', () => {
  const fails = (html: string) => codes(validateMarkup(root(html), { controls: [] })).includes('member-ask-ungated')
  assert.ok(fails('<div data-if="@site.paid_members_enabled"><a data-portal="signup" href="#">x</a></div>'), 'a free ask behind the paid flag')
  assert.ok(fails('<div data-if="@site.allow_self_signup"><a data-portal="account/plans" href="#">x</a></div>'), 'a paid ask behind the free flag')
  assert.ok(fails('<div data-if="@site.members_enabled"><a data-portal="signup" href="#">x</a></div>'), 'members_enabled is not the flag')
  assert.ok(fails('<div data-if="tiers"><a data-portal="signup" href="#">x</a></div>'), 'a tier count is not the flag')
  // the else arm renders when the flag is FALSE — the ask there is ungated by construction
  assert.ok(fails('<p data-if="@site.allow_self_signup">on</p><p data-else><a data-portal="signup" href="#">x</a></p>'))
  // a closing tag ends the gate: an ask after the gated element is outside it
  assert.ok(fails('<div data-if="@site.allow_self_signup"><p>in</p></div><a data-portal="signup" href="#">x</a>'))
  // asks nobody to join: sign in, account, a sign-in form
  for (const quiet of ['<a data-portal="signin" href="#">x</a>', '<a data-portal="account" href="#">x</a>', '<form data-members-form="signin"><input type="email" data-members-email></form>']) {
    clean(validateMarkup(root(quiet), { controls: [] }), quiet)
  }
})

test('memberAsks: the one reader of which asks a design makes, with the data-if paths around each', () => {
  const asks = memberAsks(root('<div data-if="@site.paid_members_enabled"><img alt="" src="x"><a data-portal="account/plans" href="#">x</a></div><form data-members-form="signup" data-if="@site.allow_self_signup"></form><a data-portal="signin" href="#">y</a>'))
  assert.deepEqual(asks.map((a) => [a.tag, a.ask, a.gates]), [
    ['a', 'paid', ['@site.paid_members_enabled']],
    ['form', 'free', ['@site.allow_self_signup']],
  ])
})

test('tiers-unfiltered (FR-H6): every tiers query carries type:paid and visibility:public at its top level', () => {
  const bad = (filter?: string) => codes(validateDataBinding('plans', { source: 'tiers', ...(filter === undefined ? {} : { filter }) }))
  for (const filter of [undefined, 'type:paid', 'visibility:public', 'type:paid,visibility:public', 'type:paid+visibility:public,visibility:none']) {
    assert.ok(bad(filter).includes('tiers-unfiltered'), `${String(filter)} was not refused`)
  }
  for (const filter of ['type:paid+visibility:public', 'visibility:public+type:paid', 'type:paid+visibility:public+slug:-old']) {
    assert.deepEqual(bad(filter), [], filter)
  }
  // no other source is touched
  assert.deepEqual(codes(validateDataBinding('latest', { source: 'posts', limit: 3 })), [])
})

test('paywall-target (FR-H6): the partial is the paywall category\'s ONE target, and no other category may declare it', () => {
  const at = (compileTarget: string[]) => design({ compileTarget })
  const content = (category: string): CategoryContent => ({ category, title: `${category} designs`, props: {} })
  const run = (d: DesignJson, category: string) => codes(validateDesign({ html: EVERY_DIRECTIVE, design: d, content: content(category) }))
  // another category targets the partial
  assert.ok(run(at(['partials/content-cta.hbs']), 'a22').includes('paywall-target'))
  // a paywall beside another target, and a paywall without it
  assert.ok(codes(validateDesignJson(at(['partials/content-cta.hbs', 'post.hbs']))).includes('paywall-target'))
  assert.ok(run(at(['post.hbs']), 'a32').includes('paywall-target'))
  // A32 and its stand-ins, at the partial alone, pass
  for (const category of ['a32', 'paywall']) assert.ok(!run(at(['partials/content-cta.hbs']), category).includes('paywall-target'), category)
  // and every other category keeps its own targets
  assert.ok(!run(at(['home.hbs']), 'a22').includes('paywall-target'))
})
