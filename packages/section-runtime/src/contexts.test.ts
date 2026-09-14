// Story 4.6 — FR-H7 at the one door every render passes, FR-H8's last holes, and R-2's two avatars.
//
// Every row of the story's I/O matrix, on BOTH emitters wherever the row renders. The matrix itself is
// proved against the recordings in `packages/library/src/contexts.test.ts`; this file proves the
// runtime asks it, and asks it at the right scope.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { MEDIA_FALLBACK_REFUSAL, offerBindings, validateMarkup } from '@inflozo/library'
import type { CategoryContent, PropDef } from '@inflozo/library'
import { checkBindings, initials, renderCanvas, renderTheme as renderThemeRaw } from './index.ts'
import type { RenderInput } from './index.ts'

const doc = () => new JSDOM('<body></body>').window.document

/** FR-H8: every guard is `{{#if}}` on the bound field — scanned over every theme this file emits */
const renderTheme: typeof renderThemeRaw = (d, src, input) => {
  const out = renderThemeRaw(d, src, input)
  for (const text of [out.template, ...Object.values(out.partials)]) {
    assert.ok(!/\{\{#has|\{\{#unless/.test(text), `a guard other than {{#if}} was emitted: ${text}`)
  }
  return out
}

const both = (src: string, input: RenderInput) => ({
  canvas: renderCanvas(doc(), src, input),
  theme: renderTheme(doc(), src, input).template,
})
const throwsBoth = (src: string, input: RenderInput, re: RegExp) => {
  assert.throws(() => renderCanvas(doc(), src, input), re, 'canvas')
  assert.throws(() => renderTheme(doc(), src, input), re, 'theme')
}

// ── FR-H7 ─────────────────────────────────────────────────────────────────────

test('a field in its scope renders on both emitters as it did before', () => {
  const src = '<section class="s"><article class="c" data-repeat="posts"><h2 data-bind="title">t</h2></article></section>'
  const { canvas, theme } = both(src, { target: 'index.hbs', ghost: { posts: [{ title: 'A live headline' }] } })
  assert.ok(canvas.includes('A live headline'), canvas)
  assert.ok(theme.includes('{{#foreach posts}}') && theme.includes('{{#if title}}{{title}}{{else}}t{{/if}}'), theme)
})

test('the wrapper rule: a root post field on index.hbs is refused, naming the field, the template, the scope and where it lives', () => {
  const src = '<section class="s"><h1 data-bind="title">t</h1></section>'
  for (const render of [renderCanvas, renderTheme]) {
    assert.throws(() => render(doc(), src, { target: 'index.hbs' }), (e: unknown) => {
      const m = (e as Error).message
      return /FR-H7/.test(m) && /"title"/.test(m) && /index\.hbs/.test(m) && /top level/.test(m) && /post scope/.test(m)
    })
  }
})

test('one error names every refused binding', () => {
  const src = '<section class="s"><h1 data-bind="title">t</h1><img data-bind-attr="src:feature_image" alt=""><p data-bind="excerpt">e</p></section>'
  assert.throws(() => renderTheme(doc(), src, { target: 'tag.hbs' }), (e: unknown) => {
    const m = (e as Error).message
    return ['"title"', '"feature_image"', '"excerpt"'].every((p) => m.includes(p))
  })
})

test('post and page: root title, url and feature_image bind on both, and the two theme texts are byte-identical with neither block', () => {
  const src = '<section class="s"><h1 data-bind="title">t</h1><a data-bind-attr="href:url" data-t="card.read_more">Read more</a><img data-bind-attr="src:feature_image|img_url:m" alt=""></section>'
  const post = renderTheme(doc(), src, { target: 'post.hbs' }).template
  const page = renderTheme(doc(), src, { target: 'page.hbs' }).template
  assert.equal(post, page, 'one design is one text on post.hbs and page.hbs (§7.4)')
  assert.ok(!/\{\{#post\}\}|\{\{#page\}\}/.test(post), `the section opened the block its template opens: ${post}`)
  const ghost = { title: 'Hello', url: 'https://site.example/hello/', feature_image: 'https://elsewhere.example/a.jpg' }
  for (const target of ['post.hbs', 'page.hbs']) assert.ok(renderCanvas(doc(), src, { target, ghost }).includes('Hello'), target)
})

test('a misspelt path, a list as a value and a boolean as a value are refused by name', () => {
  throwsBoth('<ul><li data-repeat="post.tagz"><span data-bind="name">n</span></li></ul>', { target: 'post.hbs' }, /"post\.tagz"/)
  throwsBoth('<p data-bind="tags">t</p>', { target: 'post.hbs' }, /a list is a repeat source/)
  throwsBoth('<p data-bind="featured">f</p>', { target: 'post.hbs' }, /a boolean is a condition/)
})

test("a query's rows are the source's scope: a {{#get}} over posts holds title on post.hbs", () => {
  const src = '<section class="s"><article class="c" data-repeat="latest"><h2 data-bind="title">t</h2></article></section>'
  const input: RenderInput = { target: 'post.hbs', dataBindings: { latest: { source: 'posts', limit: 3 } }, getRows: { latest: [{ title: 'Row one' }] } }
  const { canvas, theme } = both(src, input)
  assert.ok(canvas.includes('Row one'), canvas)
  assert.ok(theme.includes('{{#get "posts"'), theme)
})

test('the universal set: @site.title renders on default.hbs; a typo, @custom and @member refuse by name', () => {
  const ok = both('<p data-bind="@site.title">s</p>', { target: 'default.hbs', ghost: { '@site': { title: 'Orbit' } } })
  assert.ok(ok.theme.includes('{{@site.title}}'), ok.theme)
  throwsBoth('<p data-bind="@site.titel">s</p>', { target: 'default.hbs' }, /@site\.titel/)
  throwsBoth('<p data-bind="@custom.accent">s</p>', { target: 'default.hbs' }, /@custom\.accent.*FR-Q3/)
  throwsBoth('<p data-bind="@member.email">s</p>', { target: 'default.hbs' }, /@member\.email.*R-28/)
})

test('a render naming no target is not checked, as R-7 already accepts', () => {
  const { canvas, theme } = both('<h1 data-bind="title">t</h1>', { ghost: { title: 'x' } })
  assert.ok(canvas.includes('x') && theme.includes('{{title}}'))
})

test('checkBindings: every refusal for one destination, then [] for one that carries it — and it needs a destination', () => {
  const src = '<section class="s"><h1 data-bind="title">t</h1><ul><li data-repeat="tags"><a data-bind-attr="href:url"><span data-bind="name">n</span></a></li></ul></section>'
  const onIndex = checkBindings(doc(), src, { target: 'index.hbs' })
  assert.ok(onIndex.some((r) => r.includes('"title"')) && onIndex.some((r) => r.includes('"tags"')), onIndex.join('\n'))
  assert.ok(onIndex.every((r) => r.includes(' — ')), 'every refusal carries its reason')
  assert.deepEqual(checkBindings(doc(), src, { target: 'page.hbs' }), [])
  assert.throws(() => checkBindings(doc(), src, {}), /destination/)
})

test('offerBindings, as Epic 5 will call it: by version and by scope', () => {
  const threads = (version?: string) => offerBindings({ target: 'default.hbs', scope: [], version }).values.includes('@site.threads')
  assert.deepEqual([threads('6.35.0'), threads('6.36.0'), threads()], [false, true, false])
  const o = offerBindings({ target: 'post.hbs', scope: [] })
  assert.ok(o.values.includes('title') && o.repeats.includes('tags') && o.repeats.includes('authors'))
  assert.ok(!o.repeats.includes('posts') && !o.values.some((v) => v.startsWith('pagination')))
})

// ── FR-H8 ─────────────────────────────────────────────────────────────────────

test('a zero is a value: reading_time 0 on post.hbs shows "1 min read" and guards with includeZero=true', () => {
  const src = '<p class="r" data-bind="reading_time">5 min</p>'
  const { canvas, theme } = both(src, { target: 'post.hbs', ghost: { reading_time: 0 } })
  assert.ok(canvas.includes('>1 min read<'), canvas)
  assert.ok(theme.includes('{{#if reading_time includeZero=true}}{{reading_time}}{{else}}5 min{{/if}}'), theme)
  // with no target the matrix cannot type the field, so 0 still falls back, as it always has
  assert.ok(renderCanvas(doc(), src, { ghost: { reading_time: 0 } }).includes('>5 min<'))
  // a hide guard carries the hash too, and a null value is still absent
  const hidden = both('<p data-bind="reading_time" data-empty="hide">5</p>', { target: 'post.hbs', ghost: { reading_time: null } })
  assert.equal(hidden.canvas, '')
  assert.ok(hidden.theme.startsWith('{{#if reading_time includeZero=true}}'), hidden.theme)
})

test('a media fallback is refused on the validator and on the runtime with the same sentence; srcset no longer swallows it', () => {
  for (const src of [
    '<img data-bind-attr="src:feature_image|img_url:m" data-empty="fallback" src="/placeholder.jpg" alt="">',
    '<img data-bind-srcset="feature_image|img_url" data-empty="fallback" alt="">',
  ]) {
    const f = validateMarkup(`<section data-bg="base" data-spacing="compact" data-divider="none">${src}</section>`, { controls: [] })
    assert.deepEqual(f.map((x) => x.code), ['media-fallback'])
    assert.ok(f[0]?.message.includes(MEDIA_FALLBACK_REFUSAL))
    for (const render of [renderCanvas, renderTheme]) {
      assert.throws(() => render(doc(), src, {}), (e: unknown) => (e as Error).message.includes(MEDIA_FALLBACK_REFUSAL))
    }
  }
})

test('every media guard encloses its element and any srcset', () => {
  const theme = renderTheme(doc(), '<img data-bind-attr="src:feature_image|img_url:l" data-bind-srcset="feature_image|img_url" alt="">', { target: 'post.hbs' }).template
  assert.match(theme, /^\{\{#if feature_image\}\}<img[^>]*srcset="[^"]*"[^>]*>\{\{\/if\}\}$/)
})

// ── R-2 — the avatar's two forms ──────────────────────────────────────────────

const PEOPLE: Record<string, PropDef> = {
  people: { type: 'array', label: 'People' },
  'people[].name': { type: 'text', label: 'Name' },
}
const typed = '<ul class="p"><li class="m" data-items="people"><span class="av" data-initials="people[].name">??</span><span class="n" data-prop="people[].name">Name</span></li></ul>'
const textOf = (html: string) => new JSDOM(`<body>${html}</body>`).window.document.body

test('initials, typed: first and last word, identical on both emitters, through the user-text path', () => {
  assert.deepEqual(['Jane Doe', 'Madonna', 'Mary Jane Watson', '  ', ''].map(initials), ['JD', 'M', 'MW', '', ''])
  const content = { people: [{ name: 'Jane Doe' }, { name: 'Madonna' }, { name: 'Mary Jane Watson' }, { name: '' }, { name: '{{Evil}} Twin' }] }
  const { canvas, theme } = both(typed, { content, schema: PEOPLE })
  const seen = (html: string) => [...textOf(html).querySelectorAll('.av')].map((e) => e.textContent)
  // the empty name keeps the authored text; a name carrying `{{` ships inert and reads the same
  assert.deepEqual(seen(canvas), ['JD', 'M', 'MW', '??', '{T'])
  assert.deepEqual(seen(theme), seen(canvas))
  assert.ok(theme.includes('&#123;T') && !/\{\{Evil|\{T/.test(theme), `AD-5: the brace must ship as an entity: ${theme}`)
  // and an empty name hides with data-empty="hide"
  const hide = typed.replace('data-initials="people[].name"', 'data-initials="people[].name" data-empty="hide"')
  const hidden = both(hide, { content: { people: [{ name: '' }] }, schema: PEOPLE })
  for (const html of [hidden.canvas, hidden.theme]) assert.ok(!html.includes('class="av"'), html)
})

test('initials from Ghost are refused: an undeclared prop on the validator, and inside a Ghost repeat on the runtime, whatever the target', () => {
  const content: CategoryContent = { category: 'a21', props: { title: { type: 'text', label: 'T' } } }
  const f = validateMarkup('<section data-bg="base" data-spacing="compact" data-divider="none"><span data-initials="name">JD</span></section>', { controls: [], content })
  assert.deepEqual(f.map((x) => x.code), ['unknown-prop'])
  const inRepeat = '<ul><li data-repeat="authors"><span data-initials="people[].name">JD</span></li></ul>'
  for (const input of [{}, { target: 'post.hbs' }]) throwsBoth(inRepeat, input, /data-initials="people\[\]\.name" sits inside a data-repeat/)
})

test('a Ghost person with no photograph: the image hides and the name stays for the stylesheet\'s one letter', () => {
  const src = '<ul class="a"><li class="p" data-repeat="authors"><img class="av" data-bind-attr="src:profile_image|img_url:xs" alt=""><span class="n" data-bind="name">Writer</span></li></ul>'
  const input: RenderInput = { target: 'post.hbs', ghost: { authors: [{ name: 'Priya Raman', profile_image: null }] } }
  const { canvas, theme } = both(src, input)
  assert.ok(!canvas.includes('<img') && canvas.includes('>Priya Raman<'), canvas)
  assert.ok(/\{\{#if profile_image\}\}<img[^>]*src="\{\{img_url profile_image size="xs"\}\}"[^>]*>\{\{\/if\}\}/.test(theme), theme)
  assert.ok(theme.includes('{{#if name}}{{name}}{{else}}Writer{{/if}}'), theme)
})

// ── Review (2026-09-14) ───────────────────────────────────────────────────────

test('every directive that carries a Ghost path is walked: a token template, srcset, style, a helper and pagination each refuse by name', () => {
  const cases: [string, string, RegExp][] = [
    ['<a data-bind-attr="data-portal:signup/{titel}">u</a>', 'post.hbs', /"titel"/],
    ['<img data-bind-srcset="feature_imag|img_url" alt="">', 'post.hbs', /"feature_imag"/],
    ['<li data-bind-style="--x:accent_colr">t</li>', 'tag.hbs', /"accent_colr"/],
    ['<div data-helper="content"></div>', 'index.hbs', /"content"/],
    ['<ul><li data-repeat="posts"><a data-pagination="next" href="#" data-t="pagination.older">Older posts</a></li></ul>', 'index.hbs', /"pagination\.next"/],
  ]
  for (const [src, target, re] of cases) {
    throwsBoth(src, { target }, re)
    assert.ok(checkBindings(doc(), src, { target }).some((r) => re.test(r)), `${src} on ${target}`)
  }
  // and at the template's top, pagination still renders
  assert.ok(renderTheme(doc(), '<a data-pagination="next" href="#" data-t="pagination.older">Older posts</a>', { target: 'index.hbs' }).template.includes('{{page_url pagination.next}}'))
})

test('includeZero=true reaches an attribute guard, a style guard and every binding inside a repeat, on both emitters', () => {
  const src = '<section class="s"><span data-bind-style="--n:pagination.total">·</span><article data-repeat="posts"><p data-bind="reading_time">5 min</p><span data-bind-attr="title:reading_time">–</span><i data-bind-attr="title:reading_time" data-empty="hide">·</i></article></section>'
  const { canvas, theme } = both(src, { target: 'index.hbs', ghost: { pagination: { total: 0 }, posts: [{ reading_time: 0 }] } })
  assert.ok(theme.includes('{{#if pagination.total includeZero=true}}'), theme)
  assert.ok(theme.includes('{{#if reading_time includeZero=true}}{{reading_time}}{{else}}5 min{{/if}}'), theme)
  assert.ok(theme.includes('title="{{#if reading_time includeZero=true}}{{reading_time}}{{else}}{{/if}}"'), theme)
  assert.ok(/\{\{#if reading_time includeZero=true\}\}[^]*?<i title="\{\{reading_time\}\}">·<\/i>[^]*?\{\{\/if\}\}/.test(theme), theme)
  // `{{reading_time}}` is Ghost's HELPER wherever it is written, an attribute included — so the canvas prints its string there too
  assert.ok(canvas.includes('>1 min read<') && canvas.includes('<span title="1 min read">–</span>') && canvas.includes('<i title="1 min read">·</i>'), canvas)
})

test("checkBindings carries R-7's target refusals, and a query repeat needs the design's dataBindings", () => {
  const pager = '<a data-pagination="next" href="#">o</a>'
  assert.ok(checkBindings(doc(), pager, { target: 'error.hbs' }).some((r) => /R-7/.test(r)))
  assert.deepEqual(checkBindings(doc(), pager, { target: 'index.hbs' }), [])
  const query = '<article data-repeat="latest"><h2 data-bind="title">t</h2></article>'
  const dataBindings = { latest: { source: 'posts' as const, limit: 3 } }
  assert.ok(checkBindings(doc(), query, { target: 'error.hbs', dataBindings }).some((r) => /\{\{#get\}\}/.test(r)))
  assert.deepEqual(checkBindings(doc(), query, { target: 'index.hbs', dataBindings }), [])
  assert.ok(checkBindings(doc(), query, { target: 'index.hbs' }).some((r) => /"latest"/.test(r)), 'without the declaration, latest is read as a context path')
})

test('data-initials shares no element with data-bind or data-prop, and a bare reading_time that is not a number is not the helper', () => {
  const input: RenderInput = { content: { people: [{ name: 'Jane Doe' }] }, schema: PEOPLE }
  throwsBoth('<ul><li data-items="people"><span data-initials="people[].name" data-prop="people[].name">x</span></li></ul>', input, /shares <span> with data-prop/)
  throwsBoth('<span data-initials="name" data-bind="title">x</span>', input, /shares <span> with data-bind/)
  assert.ok(renderCanvas(doc(), '<p data-bind="reading_time">5</p>', { ghost: { reading_time: 'abc' } }).includes('>abc<'))
})
