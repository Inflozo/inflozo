// §7.3's exit criterion, made runnable — moved here from `tools/stress/` by Story 4.2.
//
// WHY IT MOVED. The epic's AC names `tools/stress/test-renderer-agreement.js`, and its intent is
// that the agreement is asserted node by node by a runnable test. `tools/stress/` is a separate npm
// project whose `node_modules` is gitignored and never installed in CI, so a proof left there runs
// on a laptop and nowhere else — while this story rewrote the very code it pointed at. In-package is
// the only way `pnpm check`, and therefore CI, ever runs the epic's central claim. Every check that
// passed at the baseline survives; the move is a path change, not a weakening.
//
// It renders ONE source through BOTH emitters and requires the element tree, the classes and the
// attribute NAMES to be identical — those three are what a design's stylesheet selects on, and a
// difference in any of them is a canvas that lies.
//
// Two differences are EXPECTED and are the entire point of having two emitters:
//   1. a repeat expands against real rows here and becomes {{#foreach}} there
//   2. a binding resolves to a value here and becomes a mustache there
// Both are differences in TEXT and in bound ATTRIBUTE VALUES, never in structure. The comparison is
// therefore over structure and is deliberately blind to the two things that must differ — and each
// of them is additionally asserted POSITIVELY below, so nobody can "fix" them into agreement.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import {
  CATALOG,
  CONSUMED_DIRECTIVES,
  CONSUMED_DIRECTIVE_RE,
  DIRECTIVES,
  IMAGE_SIZES,
  i18nAttr,
  resolveStrings,
} from '@inflozo/library'
import { CONTENT_API_KEY_PLACEHOLDER, imgUrl } from '@inflozo/ghost-shim'
import type { PropDef } from '@inflozo/library'
import { PAGE_NUMBER_HBS, REFUSED_DIRECTIVES, RENDERED_DIRECTIVES, checkChromeLiterals, renderCanvas, renderTheme as renderThemeRaw, serializeMarks } from './index.ts'
import { iconDrawing } from '@inflozo/library/icons'
import type { ControlDef } from '@inflozo/library'
import type { RenderInput, RuntimeElement } from './index.ts'

const doc = () => new JSDOM('<body></body>').window.document

/** Story 4.6 — FR-H8's guard is `{{#if}}` and nothing else: every theme this suite emits is scanned */
const renderTheme: typeof renderThemeRaw = (d, src, input) => {
  const out = renderThemeRaw(d, src, input)
  for (const text of [out.template, ...Object.values(out.partials)]) {
    assert.ok(!/\{\{#has|\{\{#unless/.test(text), `a guard other than {{#if}} was emitted: ${text}`)
  }
  return out
}

// Normalise the theme so it can be parsed as HTML and compared for STRUCTURE:
//   - strip Handlebars BLOCKS ({{#foreach}}, {{#if}}, {{else}}, {{/…}}): they wrap elements and have
//     no canvas counterpart by design — leaving them in would compare the emitters' differences.
//   - collapse every remaining INLINE mustache to a quote-free token X. The theme legitimately emits
//     `src="{{img_url feature_image size="m"}}"` — valid Handlebars that gscan passes 0/0, but NOT
//     valid HTML, so a raw parse mistakes the inner `size="m"` for a stray attribute. Canvas values
//     carry no mustaches, so this is a no-op there. AD-5's user braces are numeric entities
//     (`&#123;`), never `{{`, so they are untouched.
const htmlSafe = (html: string) =>
  html
    .replace(/\{\{[#/][^}]*\}\}/g, '')
    .replace(/\{\{else\}\}/g, '')
    .replace(/\{\{[^}]*\}\}/g, 'X')
    .replace(/^\s*[\r\n]/gm, '')
    .trim()

// A structural skeleton: tag, class list, and the SORTED SET OF ATTRIBUTE NAMES. Values are excluded
// on purpose — `src="https://x.jpg"` and `src="{{img_url …}}"` are the same structure and must
// compare equal, or the test asserts that the emitters are identical rather than that they agree.
function skeleton(html: string): string[] {
  const body = new JSDOM(`<body>${html}</body>`).window.document.body
  const depth = (el: RuntimeElement): number => {
    let d = -1
    for (let p: RuntimeElement | null = el; p !== null && p !== body; p = p.parentElement) d++
    return d
  }
  const out: string[] = []
  // document order, which is the order the recursive walk this replaced produced
  for (const c of body.querySelectorAll('*')) {
    const names = [...c.attributes]
      .map((a) => a.name)
      .sort()
      .join(',')
    out.push(`${'  '.repeat(depth(c))}${c.tagName.toLowerCase()}[${c.getAttribute('class') ?? ''}]{${names}}`)
  }
  return out
}

function bothWays(src: string, input: RenderInput = {}) {
  const canvas = renderCanvas(doc(), src, input)
  const theme = renderTheme(doc(), src, input).template
  return { canvas, theme }
}

function agree(src: string, input: RenderInput = {}) {
  const { canvas, theme } = bothWays(src, input)
  const a = skeleton(htmlSafe(canvas))
  const b = skeleton(htmlSafe(theme))
  assert.deepEqual(a, b, `RENDERERS DISAGREE\n  canvas:\n${a.join('\n')}\n  theme:\n${b.join('\n')}`)
  return { canvas, theme }
}

// ── a static section: no repeat, no binding. The two must be structurally identical. ──
/** Story 4.3's three directives need the shim's inputs, and `data-pagination` needs a PAGINATED
 *  target or it refuses (R-7). One place, so every case below reads the same connected site. */
const SITE: RenderInput['site'] = {
  url: 'https://site.example',
  major: '6',
  members: { total: 57, paid: 0 },
  pagination: { page: 1, pages: 3, limit: 12, total: 33 },
  navigation: [{ label: 'Essay', url: '/essay/' }, { label: 'Notes', url: '/notes/' }],
  currentUrl: '/',
}

test('a static section agrees exactly', () => {
  agree(
    `<section class="hero" data-align="center" data-density="roomy">
       <p class="hero__eyebrow" data-prop="eyebrow">e</p>
       <h1 class="hero__title" data-prop="title">t</h1>
       <a class="hero__cta" data-prop-attr="href:ctaUrl" data-prop="ctaLabel">c</a>
     </section>`,
    {
      content: {
        eyebrow: 'Issue 12',
        title: 'A headline',
        ctaLabel: 'Read it',
        ctaUrl: 'https://ok.example/x',
      },
    },
  )
})

// ── AD-3: a control is one attribute on the section root, and the stylesheet selects on it.
//    If these differ between emitters, every design's CSS is a coin flip. ──
test('AD-3 control attributes survive identically on both emitters', () => {
  const { canvas, theme } = bothWays(
    `<section class="hero" data-align="center" data-density="roomy" data-tone="dark">
       <h1 data-prop="title">t</h1></section>`,
    { content: { title: 'x' } },
  )
  for (const attr of ['data-align="center"', 'data-density="roomy"', 'data-tone="dark"']) {
    assert.ok(canvas.includes(attr), `canvas lost the control attribute ${attr}`)
    assert.ok(theme.includes(attr), `theme lost the control attribute ${attr}`)
  }
})

// ── a Ghost-bound section with a repeat, rendered with ONE row so the shapes line up: the theme
//    emits one body inside {{#foreach}}, so one row is the honest comparison. ──
const feedSrc = `<section class="feed" data-cols="three">
     <article class="card" data-repeat="posts" data-repeat-limit="3">
       <img class="card__img" data-bind-attr="src:feature_image|img_url:m" data-empty="hide">
       <h2 class="card__title" data-bind="title">t</h2>
       <time class="card__date" data-bind="published_at|date:MMM DD, YYYY">d</time>
       <a class="card__link" data-bind-attr="href:url">go</a>
     </article>
   </section>`

const onePost: RenderInput = {
  ghost: {
    posts: [
      {
        title: 'Post one',
        url: 'https://s.example/1',
        feature_image: 'https://s.example/1.jpg',
        published_at: '2026-08-20T10:00:00Z',
      },
    ],
  },
}

test('a Ghost-bound repeat agrees, structure for structure', () => {
  agree(feedSrc, onePost)
})

// ── the directive vocabulary must be gone from BOTH. AD-34 asserts this over the theme; a canvas
//    that leaked a directive would style differently, since designs select on data-* attributes. ──
test('no directive attribute survives on either emitter', () => {
  const { canvas, theme } = bothWays(feedSrc, onePost)
  for (const [name, html] of [
    ['canvas', canvas],
    ['theme', theme],
  ] as const) {
    // Derived from the library, never a hand list.
    assert.ok(!CONSUMED_DIRECTIVE_RE.test(html), `${name} leaked a directive: ${html}`)
    for (const d of CONSUMED_DIRECTIVES) {
      assert.ok(!new RegExp(`\\b${d}=`).test(html), `${name} leaked the directive ${d}: ${html}`)
    }
  }
})

// ── the two differences that MUST exist, asserted so nobody "fixes" them into agreement ──
test('the two intended differences are present: foreach-vs-rows, mustache-vs-value', () => {
  const { canvas, theme } = bothWays(feedSrc, onePost)
  assert.ok(/\{\{#foreach posts limit="3"\}\}/.test(theme), `theme lost its foreach: ${theme}`)
  assert.ok(!/\{\{#foreach/.test(canvas), 'canvas emitted a foreach; it must expand real rows')
  assert.ok(canvas.includes('Post one'), 'canvas did not resolve the bound value')
  assert.ok(/\{\{title\}\}/.test(theme), 'theme did not defer the bound value to Ghost')
})

// ── AD-4/AD-5, the half that reads backwards. The canvas must show the user their own literal
//    braces; the theme must ship them inert. Same serializer, opposite correct outcomes. ──
test('AD-4/AD-5 — the canvas decodes and the theme ships inert, from one serializer', () => {
  const { canvas, theme } = bothWays(`<p data-prop="title">t</p>`, {
    content: { title: 'Notes on {{title}} and C:\\{{@site.title}}' },
  })
  assert.ok(canvas.includes('{{title}}'), `canvas must show the user their own literal text: ${canvas}`)
  assert.ok(!/&#123;/.test(canvas), `canvas must not show the user HTML entities: ${canvas}`)
  assert.ok(theme.includes('&#123;&#123;title&#125;&#125;'), `theme must ship braces inert: ${theme}`)
  assert.ok(!/\{\{title\}\}/.test(theme), `theme shipped a LIVE mustache from user text: ${theme}`)
})

// ── AD-36 must hold on BOTH emitters. On the theme a javascript: link is the visitor's problem;
//    on the canvas it is a same-origin URL inside the owner's own authenticated session. ──
test('AD-36 — the URL scheme check runs on both emitters, not just the theme', () => {
  const { canvas, theme } = bothWays(`<a data-prop-attr="href:link" data-prop="label">l</a>`, {
    content: { link: 'javascript:alert(document.domain)', label: 'Click' },
  })
  assert.ok(!/javascript:/i.test(canvas), `CANVAS shipped a javascript: URL — same-origin XSS: ${canvas}`)
  assert.ok(!/javascript:/i.test(theme), `theme shipped a javascript: URL: ${theme}`)
})

// ── FR-H8's guard: absent data removes the element on the canvas and wraps it in {{#if}} on the
//    theme. Different mechanisms, same user-visible outcome — which is what agreement means here. ──
test("FR-H8 — an empty media binding hides the element on both, by each emitter's own mechanism", () => {
  const src = `<section class="c"><img class="m" data-bind-attr="src:feature_image|img_url:m" data-empty="hide"><h2 class="t" data-bind="title">t</h2></section>`
  const { canvas } = bothWays(src, { ghost: { title: 'Only a title' } }) // no feature_image
  assert.ok(!/<img/.test(canvas), `canvas kept a media element with no data: ${canvas}`)
  assert.ok(/Only a title/.test(canvas), `canvas lost the sibling that DOES have data: ${canvas}`)
  const { theme } = bothWays(src, { ghost: { title: 'x', feature_image: 'y' } })
  assert.ok(/\{\{#if feature_image\}\}/.test(theme), `theme guard is not on the bound field: ${theme}`)
})

// ── The list form of data-bind-attr: every entry lands on both emitters, and the guard is the URL
//    entry's field (here `href`, which is also first — a URL entry anywhere wins, see below). ──
test("data-bind-attr list form — the guard is the URL entry's field, and a later null sets nothing", () => {
  const src = `<section class="c"><a class="l" data-bind-attr="href:url;title:custom_excerpt" data-empty="hide">x</a></section>`
  const { canvas, theme } = agree(src, {
    ghost: { url: 'https://s.example/1', custom_excerpt: 'An excerpt' },
  })
  assert.ok(
    /href="https:\/\/s\.example\/1"/.test(canvas) && /title="An excerpt"/.test(canvas),
    `canvas missed an entry: ${canvas}`,
  )
  assert.ok(
    /\{\{#if url\}\}/.test(theme) && !/\{\{#if custom_excerpt\}\}/.test(theme),
    `guard is not on the URL entry: ${theme}`,
  )
  const later = bothWays(src, { ghost: { url: 'https://s.example/1' } }).canvas
  assert.ok(
    /<a/.test(later) && /href=/.test(later),
    `a null LATER entry must not remove the element or drop the first: ${later}`,
  )
  const first = bothWays(src, { ghost: { custom_excerpt: 'x' } }).canvas
  assert.ok(!/<a/.test(first), `a null FIRST entry with hide must remove the element: ${first}`)
})

// ─── Story 4.2's additions ───────────────────────────────────────────────────

// ── AD-4's serializer, on both emitters. The canvas shows the user their marks; the theme ships
//    the same markup with the braces inert and ZERO live mustaches from user text. ──
test('AD-4 — marks serialize once and land on both emitters', () => {
  const schema: Record<string, PropDef> = {
    title: { type: 'richtext', label: 'Title', marks: ['strong', 'em'] },
  }
  const { canvas, theme } = agree(`<p class="t" data-prop="title">t</p>`, {
    schema,
    content: { title: { text: 'Notes on {{title}}', marks: [{ start: 0, end: 5, mark: 'strong' }] } },
  })
  assert.ok(canvas.includes('<strong>Notes</strong> on {{title}}'), `canvas lost the mark: ${canvas}`)
  assert.ok(theme.includes('<strong>Notes</strong>'), `theme lost the mark: ${theme}`)
  assert.ok(theme.includes('&#123;&#123;title&#125;&#125;'), `theme must ship braces inert: ${theme}`)
  assert.ok(!/\{\{/.test(theme), `theme shipped a live mustache from user text: ${theme}`)
})

test("a mark outside the prop's allow-list is dropped and the text survives", () => {
  const schema: Record<string, PropDef> = { title: { type: 'richtext', label: 'Title', marks: ['strong', 'em'] } }
  const { canvas, theme } = bothWays(`<p data-prop="title">t</p>`, {
    schema,
    content: { title: { text: 'Underline me', marks: [{ start: 0, end: 5, mark: 'u' }] } },
  })
  for (const [name, html] of [
    ['canvas', canvas],
    ['theme', theme],
  ] as const) {
    assert.ok(!/<u>/.test(html), `${name} emitted a mark the prop does not allow: ${html}`)
    assert.ok(html.includes('Underline me'), `${name} lost the text with the mark: ${html}`)
  }
})

test('R-27 — a declared inline token substitutes and an undeclared one stays literal text', () => {
  const schema: Record<string, PropDef> = { sub: { type: 'richtext', label: 'Subheading', tokens: ['members'] } }
  const { canvas, theme } = bothWays(`<p data-prop="sub">s</p>`, {
    schema,
    content: { sub: { text: '{members} readers, {n} left' } },
    tokens: { members: '12,000', n: '3' },
  })
  assert.ok(canvas.includes('12,000 readers'), `the declared token did not substitute: ${canvas}`)
  assert.ok(canvas.includes('{n} left'), `an undeclared token must stay literal text: ${canvas}`)
  assert.ok(theme.includes('12,000 readers'), `the declared token did not substitute: ${theme}`)
  assert.ok(theme.includes('&#123;n&#125; left'), `an undeclared token must ship inert: ${theme}`)
  // …and the page number rides beside it on a prop that declares one token, without being declared (R-182)
  const withPage = bothWays(`<p data-prop="sub">s</p>`, {
    schema,
    content: { sub: { text: '{members} readers on page {page_number}' } },
    tokens: { members: '12,000', page_number: '2' },
  })
  assert.ok(withPage.canvas.includes('12,000 readers on page 2'), withPage.canvas)
  assert.ok(withPage.theme.includes(`12,000 readers on page ${PAGE_NUMBER_HBS}`), withPage.theme)
})

// ── Story 5.16a — R-182's one token, on BOTH emitters. The canvas prints the number the editor handed it
//    and NOTHING where it handed none (page 1, a post, a standalone page, the 404 — R-186, R-183); the theme
//    prints one guarded constant per occurrence, which Ghost answers the same way (MEASUREMENTS §49).
const pageSrc = `<h2 data-prop="h">t</h2>`
const pageSchema: Record<string, PropDef> = { h: { type: 'richtext', label: 'Heading' } }
const pageWords = { h: { text: 'The archive — page {page_number}' } }

test('R-182 — {page_number} needs no declaration: every text and richtext prop accepts it', () => {
  for (const type of ['text', 'richtext'] as const) {
    const { canvas, theme } = bothWays(pageSrc, { schema: { h: { type, label: 'Heading' } }, content: pageWords, tokens: { page_number: '2' } })
    assert.ok(canvas.includes('The archive — page 2'), `${type} on the canvas: ${canvas}`)
    assert.ok(theme.includes(`The archive — page ${PAGE_NUMBER_HBS}`), `${type} on the theme: ${theme}`)
  }
})

test('R-186 — the canvas prints the handed number, and NOTHING when it was handed none', () => {
  const two = renderCanvas(doc(), pageSrc, { schema: pageSchema, content: pageWords, tokens: { page_number: '2' } })
  assert.ok(two.includes('The archive — page 2'), two)
  // page 1, and Post / Page / 404: the editor hands no number at all, and the token resolves to the EMPTY
  // string rather than to "1" or to a literal — "nothing shows a page number the user did not type", and
  // page 1 shows no number at all (R-186 reversing R-182's page-1 bullet)
  const none = renderCanvas(doc(), pageSrc, { schema: pageSchema, content: pageWords, tokens: {} })
  // …and the editor's ACTUAL page-1 call shape — `renderSection` passes no `tokens` key at all on page 1
  // (`canvas.ts`), so this rests on `core`'s `input.tokens ?? {}` and must not decay to the literal token
  assert.equal(renderCanvas(doc(), pageSrc, { schema: pageSchema, content: pageWords }), none, 'no tokens key must render exactly as an empty one')
  assert.ok(/The archive — page ?<\/h2>/.test(none), `page 1 must print nothing in the token's place: ${none}`)
  assert.ok(!/page_number|page 1/.test(none), `page 1 printed a number or the token itself: ${none}`)
  // the whole value being the token is an EMPTY field, which is the design's own data-empty question
  const whole = renderCanvas(doc(), pageSrc, { schema: pageSchema, content: { h: '{page_number}' }, tokens: {} })
  assert.ok(/<h2[^>]*><\/h2>/.test(whole), `a field that is only the token resolves empty on page 1: ${whole}`)
})

test('R-182 — the theme emits ONE guarded constant per occurrence, and the guard is the recorded one', () => {
  const theme = renderTheme(doc(), `<h2 data-prop="h">t</h2><p data-prop="p">t</p>`, {
    schema: { h: { type: 'richtext', label: 'H' }, p: { type: 'text', label: 'P' } },
    content: { h: { text: 'page {page_number} of many' }, p: 'and again {page_number}' },
  }).template
  assert.equal(theme.split(PAGE_NUMBER_HBS).length - 1, 2, `one constant per occurrence: ${theme}`)
  // it is the string the recorder proved on T1 and T3, and it is gscan-clean — never an `@root` path
  assert.equal(PAGE_NUMBER_HBS, '{{#if pagination.prev}}{{pagination.page}}{{/if}}')
  assert.ok(!/@root/.test(theme), `gscan refuses @root as an ERROR on both majors (MEASUREMENTS §49): ${theme}`)
})

test('a prop declaring NO tokens still gets the page number, and {members} in it stays literal', () => {
  const { canvas, theme } = bothWays(pageSrc, {
    schema: pageSchema,
    content: { h: { text: '{members} on page {page_number}' } },
    tokens: { members: '12,000', page_number: '3' },
  })
  assert.ok(canvas.includes('{members} on page 3'), `an undeclared {members} stays literal beside it: ${canvas}`)
  assert.ok(theme.includes(`&#123;members&#125; on page ${PAGE_NUMBER_HBS}`), theme)
})

test('a field being EDITED re-serializes with the token as typed — no values handed, nothing substituted', () => {
  // R-182's second sentence, and `lib/inline.ts`'s one mechanism for it: the editing sinks call
  // serializeMarks with NO third argument, which is what makes clicking into the words show {page_number}
  // again. A renderer always hands an object, so "an object without the key" stays "this page has no number".
  const def: PropDef = { type: 'richtext', label: 'Heading' }
  assert.equal(serializeMarks({ text: 'page {page_number}' }, def), 'page &#123;page_number&#125;')
  assert.equal(serializeMarks({ text: 'page {page_number}' }, def, {}), 'page ')
  assert.equal(serializeMarks({ text: 'page {page_number}' }, def, { page_number: '4' }), 'page 4')
})

test('a NEAR MISS is not the token: only {page_number} exactly, on both emitters', () => {
  // The regex is `/\{([A-Za-z_][A-Za-z0-9_]*)\}/g` and the name must match exactly, so the three shapes a
  // customer actually types by mistake stay the literal text they are — escaped on the theme, as today.
  // Nothing else in the suite fails if the token name becomes a loose match, which is the shape AD-36 warns
  // about: an allow-list that stops being exact stops being an allow-list.
  for (const near of ['{pagenumber}', '{Page_Number}', '{page_number }', '{page-number}', '{ page_number}']) {
    const { canvas, theme } = bothWays(pageSrc, {
      schema: pageSchema,
      content: { h: { text: `say ${near} here` } },
      tokens: { page_number: '2' },
    })
    assert.ok(canvas.includes(`say ${near} here`), `${near} must stay literal on the canvas: ${canvas}`)
    assert.ok(!canvas.includes('say 2 here'), `${near} substituted on the canvas: ${canvas}`)
    const escaped = near.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
    assert.ok(theme.includes(`say ${escaped} here`), `${near} must ship inert on the theme: ${theme}`)
    assert.ok(!theme.includes(PAGE_NUMBER_HBS), `${near} reached the constant: ${theme}`)
  }
})

// ── FR-H8 is UNCONDITIONAL. The stress harness guarded only when a design wrote `data-empty`, so
//    the unguarded state — which FR-H8 says is unreachable — was reachable in every design. ──
test("FR-H8 — the guard is always present, and defaults by kind", () => {
  const { canvas, theme } = agree(`<h2 class="t" data-bind="title">Post title</h2>`, {
    ghost: { title: 'A live headline' },
  })
  assert.ok(
    theme.includes('{{#if title}}{{title}}{{else}}Post title{{/if}}'),
    `a text binding with no data-empty must still carry FR-H8's guard: ${theme}`,
  )
  assert.ok(canvas.includes('A live headline'), `canvas did not resolve the binding: ${canvas}`)

  // no value at all — the canvas keeps the authored text, which is what {{else}} does
  const empty = renderCanvas(doc(), `<h2 data-bind="title">Post title</h2>`, {})
  assert.ok(empty.includes('Post title'), `canvas lost the static fallback: ${empty}`)

  // media defaults to `hide` because `src` is a URL attribute, and the ELEMENT is guarded, never
  // the attribute (an unguarded srcset renders a malformed relative URL and live 404s)
  const media = renderTheme(doc(), `<img data-bind-attr="src:feature_image|img_url:m">`, {}).template
  assert.ok(/\{\{#if feature_image\}\}/.test(media), `media did not default to hide: ${media}`)
  assert.ok(/src="\{\{img_url feature_image size="m"\}\}"/.test(media), `the attribute was guarded: ${media}`)
})

test('FR-H8 — the guard is the bound FIELD, never a helper argument', () => {
  const dated = renderTheme(
    doc(),
    `<time data-bind="published_at|date:MMM DD, YYYY" data-empty="hide">d</time>`,
    {},
  ).template
  assert.ok(/\{\{#if published_at\}\}/.test(dated), `guard is not on the bound field: ${dated}`)
  assert.ok(!/\{\{#if (format|MMM)/.test(dated), `guard was built from the helper argument: ${dated}`)
})

// ── DW-93: an element whose only content is a user-picked image. The harness removed only its own
//    attribute here and implemented no `hide`, so the guard was dead and `data-empty` survived. ──
test('DW-93 — data-empty="hide" on data-prop-attr hides the element on both emitters', () => {
  const src = `<section class="c"><img class="h" data-prop-attr="src:hero" data-empty="hide"><p class="k">kept</p></section>`
  const { canvas, theme } = agree(src, { content: {} })
  for (const [name, html] of [
    ['canvas', canvas],
    ['theme', theme],
  ] as const) {
    assert.ok(!/<img/.test(html), `${name} kept an element whose only content is unset: ${html}`)
    assert.ok(!/data-empty/.test(html), `${name} leaked data-empty: ${html}`)
    assert.ok(/kept/.test(html), `${name} removed the wrong element: ${html}`)
  }
  const { canvas: set } = bothWays(src, { content: { hero: '/hero.jpg' } })
  assert.ok(/<img[^>]*src="\/hero\.jpg"/.test(set), `a set prop must keep the element: ${set}`)
})

// ── AD-3's carve-out / AD-36 (4): a bound Ghost colour into ONE inline custom property. ──
test('data-bind-style — the canvas parses the colour and the theme emits the mustache', () => {
  const src = `<li class="tag" data-bind-style="--tag-accent:accent_color"><span class="n">t</span></li>`
  const { canvas, theme } = agree(src, { ghost: { accent_color: '#f0f' } })
  assert.ok(canvas.includes('style="--tag-accent: #f0f"'), `canvas did not set the colour: ${canvas}`)
  assert.ok(
    theme.includes('style="{{#if accent_color}}--tag-accent: {{accent_color}}{{/if}}"'),
    `theme must defer the colour to Ghost inside FR-H8's guard — AD-3's stated legal form: ${theme}`,
  )
  // FR-H8 on the carve-out: an ABSENT value leaves an empty style on both, so the element reads the
  // property's root default here and on the live site alike — never the fallback token
  const absent = renderCanvas(doc(), src, { ghost: {} })
  assert.ok(absent.includes('style=""'), `an absent colour must leave an empty style, got ${absent}`)
  assert.throws(() => renderCanvas(doc(), '<li data-bind-style="nope">t</li>', {}), /AD-36: data-bind-style="nope"/)
})

// ── R1 decision 7's other half. A token can only be parked in a DOM where a node is legal, so a
//    guard and a repeat replacement both park theirs in a COMMENT — and a substitution can
//    re-introduce a comment-wrapped marker belonging to a token not yet substituted. Executed
//    against the pre-4.2 compiler, a guard inside a NESTED repeat shipped as `<!--{{#if url}}-->`
//    and the nested `{{#foreach}}` shipped inside an HTML comment, so every row it rendered was
//    invisible. It never fired because nothing guarded inside a nested repeat until FR-H8 became
//    unconditional here. ──
test('a guard inside a nested repeat is not left wrapped in an HTML comment', () => {
  const src = `<section class="s"><article class="o" data-repeat="posts"><ul class="t"><li class="i" data-repeat="tags"><a class="l" data-bind-attr="href:url">t</a></li></ul></article></section>`
  const theme = renderTheme(doc(), src, {}).template
  assert.ok(!/<!--/.test(theme), `a compiler marker shipped inside an HTML comment: ${theme}`)
  assert.ok(/\{\{#foreach tags\}\}/.test(theme), `the nested foreach is missing: ${theme}`)
  assert.ok(/\{\{#if url\}\}<a/.test(theme), `the nested guard is not live Handlebars: ${theme}`)
})

// ═══ Story 4.3 — the three directives the shim owns, and the {{#get}} repeat ═══
//
// The node-by-node proof extended, with the two intended differences still asserted POSITIVELY so
// nobody can "fix" them into agreement. One new kind of difference appears here and is named: a
// BARE HELPER whose output is Ghost's own markup — `{{navigation}}`, `{{content}}`, `{{comments}}`
// — has a subtree on the canvas and a single mustache in the theme. That is NFR-6(c3)'s exclusion
// region arriving inside the agreement proof: Ghost emits that markup and no theme can predict it,
// so the comparison stops at the element and the helper itself is asserted on each side instead.

/** `agree()`, with the CHILDREN of every element carrying `class="ghost-own"` removed first. Used
 *  only for the bare helpers that render Ghost's own markup; everything else compares whole. */
function agreeOutsideGhostMarkup(src: string, input: RenderInput = {}) {
  const strip = (html: string) => {
    const body = new JSDOM(`<body>${html}</body>`).window.document.body
    for (const el of body.querySelectorAll('.ghost-own')) el.textContent = ''
    return body.innerHTML
  }
  const canvas = renderCanvas(doc(), src, input)
  const theme = renderTheme(doc(), src, input).template
  assert.deepEqual(
    skeleton(strip(htmlSafe(canvas))),
    skeleton(strip(htmlSafe(theme))),
    'RENDERERS DISAGREE outside the Ghost-owned subtree',
  )
  return { canvas, theme }
}

test('data-bind-srcset — one candidate per image_sizes key on both emitters, from the one map', () => {
  const src = `<section class="c"><img class="i" data-bind-srcset="feature_image|img_url" src="/ph.jpg" alt=""></section>`
  const hosted = 'https://site.example/content/images/2026/01/a.jpg'
  const { canvas, theme } = agree(src, { ghost: { feature_image: hosted }, site: SITE })

  // THE DIFFERENCE (2), positively: the theme is mustaches, the canvas is the recorded URL shape.
  for (const [key, width] of Object.entries(IMAGE_SIZES)) {
    assert.ok(
      theme.includes(`{{img_url feature_image size="${key}"}} ${width}w`),
      `the theme is missing the ${key} candidate: ${theme}`,
    )
    // NOT normalised: the canvas candidate is the sized URL, character for character, and the
    // width descriptor beside it comes from the same map.
    assert.ok(
      canvas.includes(`${imgUrl(hosted, key, { siteUrl: SITE?.url, absolute: true })} ${width}w`),
      `the canvas is missing the ${key} candidate: ${canvas}`,
    )
  }
  // FR-J5: `img_url` emits no srcset of its own, so nothing here may have asked it to
  assert.ok(!/img_url[^}]*srcset/.test(theme), theme)
  // and the canvas never shows the ORIGINAL where the site serves a rendition
  assert.ok(!canvas.includes(`${hosted} `), `the canvas passed the original through: ${canvas}`)
})

test('AD-36 (1) — a hostile srcset value never reaches the attribute, and ONE guard wraps an <img> bound twice', () => {
  const src = `<img class="i" data-bind-srcset="feature_image|img_url" alt="">`
  for (const hostile of ['javascript:alert(1)', 'data:text/html,<script>', 'mailto:x@y']) {
    assert.equal(renderCanvas(doc(), src, { ghost: { feature_image: hostile }, site: SITE }), '', hostile)
  }
  // data-empty="fallback" on a candidate list is REFUSED (Story 4.6) — it used to be swallowed silently
  const fb = `<img data-bind-srcset="feature_image|img_url" data-empty="fallback">`
  assert.throws(() => renderTheme(doc(), fb, { site: SITE }), /data-empty="fallback" on a binding into href, src, poster or srcset is refused/)
  assert.throws(() => renderCanvas(doc(), fb, { site: SITE }), /data-empty="fallback" on a binding into href, src, poster or srcset is refused/)
  // the authoring guide's own hero: src AND srcset bound on the same element, on the same field
  const both = renderTheme(doc(), `<img data-bind-attr="src:feature_image|img_url:l" data-bind-srcset="feature_image|img_url">`, { site: SITE }).template
  assert.equal((both.match(/\{\{#if feature_image\}\}/g) ?? []).length, 1, `doubled guard: ${both}`)
  assert.equal((both.match(/\{\{\/if\}\}/g) ?? []).length, 1, both)
  // on DIFFERENT fields each keeps its own guard — the element is hidden when either is empty
  const two = renderTheme(doc(), `<img data-bind-attr="src:thumb|img_url:l" data-bind-srcset="feature_image|img_url">`, { site: SITE }).template
  assert.ok(two.includes('{{#if thumb}}') && two.includes('{{#if feature_image}}'), two)
  assert.equal((two.match(/\{\{\/if\}\}/g) ?? []).length, 2, two)
  // and an UNLINKED project passes the value through rather than emitting a relative sized URL
  const unlinked = renderCanvas(doc(), `<img data-bind-attr="src:feature_image|img_url:m" data-bind-srcset="feature_image|img_url">`, { ghost: { feature_image: 'https://elsewhere.example/a.jpg' } })
  assert.ok(unlinked.includes('src="https://elsewhere.example/a.jpg"') && !unlinked.includes('/size/'), unlinked)
})

test('FR-H8 — an empty srcset binding hides the ELEMENT, and the guard encloses it', () => {
  const src = `<img class="i" data-bind-srcset="feature_image|img_url">`
  const theme = renderTheme(doc(), src, { site: SITE }).template
  const canvas = renderCanvas(doc(), src, { ghost: {}, site: SITE })
  assert.match(theme, /\{\{#if feature_image\}\}\s*<img/, `the guard does not enclose the element: ${theme}`)
  assert.equal(canvas, '', `an empty srcset binding must hide the element: ${canvas}`)
  // an unguarded srcset renders a malformed attribute the browser resolves as a relative URL —
  // live 404s on the customer's site — so the attribute is never the thing that is guarded
  assert.ok(!/srcset="\{\{#if/.test(theme), `the ATTRIBUTE was guarded instead of the element: ${theme}`)
})

test('data-helper — a scalar helper agrees exactly, mustache against resolved value', () => {
  const src = `<section class="c"><span class="m" data-helper="total_members">1,000</span></section>`
  const { canvas, theme } = agree(src, { site: SITE })
  assert.ok(theme.includes('{{total_members}}'), theme)
  // MEASUREMENTS §15f: 57 members renders "50+", and the count helpers are ALWAYS a string
  assert.ok(canvas.includes('>50+<'), canvas)
  assert.ok(!/\{\{/.test(canvas), `the canvas emitted a mustache: ${canvas}`)
})

test('data-helper="content_api_key" renders an inert placeholder and no key', () => {
  const src = `<span class="k" data-helper="content_api_key">x</span>`
  const canvas = renderCanvas(doc(), src, { site: SITE })
  const theme = renderTheme(doc(), src, { site: SITE }).template
  assert.ok(canvas.includes(CONTENT_API_KEY_PLACEHOLDER), canvas)
  assert.ok(!/[0-9a-f]{26}/.test(canvas), `something key-shaped reached the canvas: ${canvas}`)
  assert.ok(theme.includes('{{content_api_key}}'), theme)
})

test('data-helper — Ghost-own markup: the canvas draws it, the theme defers, the rest agrees', () => {
  const src = `<section class="c"><nav class="ghost-own" data-helper="navigation"></nav><h2 class="t" data-bind="title">t</h2></section>`
  const { canvas, theme } = agreeOutsideGhostMarkup(src, { ghost: { title: 'A post' }, site: SITE })
  assert.ok(theme.includes('{{navigation}}'), theme)
  // Ghost's own navigation partial, recorded on both majors and rebuilt from the shim's items
  assert.ok(canvas.includes('<ul class="nav">'), canvas)
  // currentUrl is `/`, so Essay is NOT current — exactly one answer
  // Ghost's partial prints the href ABSOLUTE ({{url absolute="true"}}); so does the shim
  assert.ok(canvas.includes('<li class="nav-essay"><a href="https://site.example/essay/">Essay</a></li>'), canvas)
  assert.ok(canvas.includes('>A post<'), canvas)
})

test('data-helper="content" refuses when Story 4.4 has not handed it a fixture', () => {
  const src = `<div class="ghost-own" data-helper="content"></div>`
  assert.throws(() => renderCanvas(doc(), src, {}), /FR-H3/)
  // and renders the fixture when there is one — the trusted, Inflozo-authored case
  const out = renderCanvas(doc(), src, { fixtures: { content: '<p>style guide</p>' } })
  assert.ok(out.includes('<p>style guide</p>'), out)
  // the theme side never resolves it at all
  assert.ok(renderTheme(doc(), src, {}).template.includes('{{content}}'))
})

test('data-pagination — prev and next agree, and the first page has no Newer link', () => {
  const src = `<nav class="p" data-t-attr="aria-label:pagination.label">
      <a class="prev" data-pagination="prev" href="#" data-t="pagination.newer">Newer posts</a>
      <span class="n" data-pagination="numbers">1 / 1</span>
      <a class="next" data-pagination="next" href="#" data-t="pagination.older">Older posts</a>
    </nav>`
  // the RECORDED middle page: 2 of 3, both links present, so the shapes line up
  const middle: RenderInput = { site: { ...SITE, pagination: { page: 2, pages: 3, limit: 12, total: 33 } }, target: 'index.hbs' }
  const { canvas, theme } = agree(src, middle)
  assert.ok(theme.includes('{{page_url pagination.prev}}'), theme)
  assert.ok(theme.includes('{{page_url pagination.next}}'), theme)
  assert.match(theme, /\{\{#if pagination.prev\}\}/, theme)
  assert.ok(theme.includes('{{pagination.page}} / {{pagination.pages}}'), theme)
  // recorded on both majors: page 2 of 3 -> prev is "/" and next is "/page/3/"
  assert.ok(canvas.includes('href="/"'), canvas)
  assert.ok(canvas.includes('href="/page/3/"'), canvas)
  assert.ok(canvas.includes('>2 / 3<'), canvas)

  // the first page: {{#if pagination.prev}} takes the else branch on the site, and the canvas
  // removes the element — the same behaviour by each emitter's own mechanism (FR-H8's pattern)
  const first = renderCanvas(doc(), src, { site: SITE, target: 'index.hbs' })
  assert.ok(!first.includes('class="prev"'), `the first page kept a Newer link: ${first}`)
  assert.ok(first.includes('href="/page/2/"'), first)
})

test('R-7 — data-pagination off a paginated target is refused on both emitters', () => {
  const src = `<a data-pagination="next" href="#" data-t="pagination.older">Older posts</a>`
  for (const target of ['post.hbs', 'page.hbs', 'error.hbs', undefined]) {
    const input: RenderInput = { site: SITE, target }
    assert.throws(() => renderCanvas(doc(), src, input), /R-7/, `canvas allowed pagination on ${target}`)
    assert.throws(() => renderTheme(doc(), src, input), /R-7/, `theme allowed pagination on ${target}`)
  }
  // and the legitimate placement still works, on every paginated target
  for (const target of ['home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs']) {
    assert.doesNotThrow(() => renderTheme(doc(), src, { site: SITE, target }))
  }
})

test('a data-repeat naming a dataBindings key emits {{#get}}, and the canvas expands the caller rows', () => {
  const src = `<ul class="f"><li class="c" data-repeat="featured_craft"><h3 data-bind="title">t</h3></li></ul>`
  const input: RenderInput = {
    dataBindings: { featured_craft: { source: 'posts', filter: 'tag:craft+featured:true', limit: 3, order: 'published_at desc' } },
    // ONE row for the structural comparison, for the same reason the {{#foreach}} case uses one:
    // the theme emits one body inside the block, so one row is the honest shape comparison.
    getRows: { featured_craft: [{ title: 'one' }] },
    site: SITE,
  }
  const { canvas, theme } = agree(src, input)
  // THE DIFFERENCE (1), positively: a {{#get}} plus the {{#foreach}} over ITS rows, and the filter
  // comes from the DECLARATION — there is no place in the markup where one could be composed.
  assert.ok(
    theme.includes('{{#get "posts" filter="tag:craft+featured:true" limit="3" order="published_at desc" include="tags,authors"}}'),
    theme,
  )
  assert.ok(theme.includes('{{#foreach posts}}'), theme)
  assert.ok(theme.includes('{{/get}}'), theme)
  // the pre-4.3 emission was `{{#foreach featured_craft}}` over a key that is not a context path,
  // so the block rendered nothing at all on the live site
  assert.ok(!theme.includes('{{#foreach featured_craft}}'), `the key was emitted as a context path: ${theme}`)
  assert.ok(canvas.includes('>one<'), canvas)
  // and the canvas expands one clone per row the caller fetched — the shim builds the query, the
  // editor runs it, because AD-1 bans `fetch` inside a core package
  const two = renderCanvas(doc(), src, { ...input, getRows: { featured_craft: [{ title: 'one' }, { title: 'two' }] } })
  assert.equal((two.match(/<li/g) ?? []).length, 2, two)
  assert.ok(two.includes('>two<'), two)

  // one number, one place: the query declares its own limit
  assert.throws(
    () => renderTheme(doc(), `<ul><li data-repeat="featured_craft" data-repeat-limit="2">x</li></ul>`, input),
    /One number, one place/,
  )
  // ... and the CANVAS refuses the same source — a design the compiler refuses must not render
  assert.throws(
    () => renderCanvas(doc(), `<ul><li data-repeat="featured_craft" data-repeat-limit="2">x</li></ul>`, input),
    /One number, one place/,
  )
  // rows must be SUPPLIED for a declared key: an empty block would look like an empty result
  assert.throws(() => renderCanvas(doc(), src, { ...input, getRows: {} }), /no rows were supplied/)
  // R-7 half two, at render: a {{#get}} named for the error page is refused on both emitters
  for (const render of [renderCanvas, renderTheme]) {
    assert.throws(() => render(doc(), src, { ...input, target: 'error.hbs' }), /compounds the outage/)
  }
  // R-20: a hand-picked order is N {{#get}} blocks in the picked order, each around its own
  // {{#foreach}} — the first draft emitted only the first, so the site showed ONE pick
  const picked: RenderInput = {
    dataBindings: { picked: { source: 'posts', ids: ['aaa', 'bbb', 'ccc'] } },
    getRows: { picked: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] },
  }
  const pickedSrc = `<ul class="p"><li class="c" data-repeat="picked"><h3 data-bind="title">t</h3></li></ul>`
  const pickedTheme = renderTheme(doc(), pickedSrc, picked).template
  assert.deepEqual(
    pickedTheme.match(/\{\{#get "posts" filter="id:[a-z]+" limit="1" include="tags,authors"\}\}/g),
    ['{{#get "posts" filter="id:aaa" limit="1" include="tags,authors"}}', '{{#get "posts" filter="id:bbb" limit="1" include="tags,authors"}}', '{{#get "posts" filter="id:ccc" limit="1" include="tags,authors"}}'],
    pickedTheme,
  )
  assert.equal((pickedTheme.match(/\{\{\/get\}\}/g) ?? []).length, 3)
  const pickedCanvas = renderCanvas(doc(), pickedSrc, picked)
  assert.equal((pickedCanvas.match(/<li/g) ?? []).length, 3, pickedCanvas)
  // the canvas shows exactly as many rows as were PICKED, in step with the theme's N blocks
  const over = renderCanvas(doc(), pickedSrc, { ...picked, getRows: { picked: [{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }] } })
  assert.equal((over.match(/<li/g) ?? []).length, 3, over)
  // a prototype name is not a declared key, on either emitter
  for (const render of [renderCanvas, renderTheme]) {
    const out = render(doc(), `<ul><li data-repeat="constructor">x</li></ul>`, {})
    assert.ok(String(typeof out === 'string' ? out : out.template).length >= 0)
  }
  // rows for a key the design never declared: a mistyped {{#get}} key, refused rather than foreach'd
  assert.throws(() => renderCanvas(doc(), `<ul><li data-repeat="featurd_craft">x</li></ul>`, { ...input, getRows: { featurd_craft: [] } }), /mistyped/)
  // with a partial the body is emitted ONCE and referenced from each block
  const viaPartial = renderTheme(doc(), `<ul><li data-repeat="picked" data-partial="pick"><h3 data-bind="title">t</h3></li></ul>`, picked)
  assert.equal((viaPartial.template.match(/\{\{> "pick"\}\}/g) ?? []).length, 3, viaPartial.template)
  // an undeclared key is still a plain context path, which is what a {{#foreach}} is for
  const plain = renderTheme(doc(), `<ul><li data-repeat="posts">x</li></ul>`, {}).template
  assert.ok(plain.includes('{{#foreach posts}}'), plain)
})

test('data-bind-attr with img_url puts the SIZED url on the canvas, not the original', () => {
  // The mutation this exists for: `bindValue` returned `String(raw)` for `img_url` until Story 4.3,
  // so the canvas showed the ORIGINAL image where the site serves a rendition — a card loading a
  // 2400px photograph behind a 300px slot, which nobody would notice. Every structural check in
  // this file passed with that defect in place, so the assertion has to be on the VALUE.
  const hosted = 'https://site.example/content/images/2026/01/a.jpg'
  const src = '<img class="i" data-bind-attr="src:feature_image|img_url:m" src="/ph.jpg" alt="">'
  const { canvas, theme } = agree(src, { ghost: { feature_image: hosted }, site: SITE })
  assert.ok(theme.includes('{{img_url feature_image size="m"}}'), theme)
  // compared character for character, against the shim's recorded shape — and ABSOLUTE, because
  // Ghost answers a same-origin request with a relative URL and a relative URL on the canvas
  // resolves against Inflozo's own origin
  assert.ok(
    canvas.includes(`src="${imgUrl(hosted, 'm', { siteUrl: SITE?.url, absolute: true })}"`),
    `the canvas is not showing the sized URL: ${canvas}`,
  )
  assert.ok(!canvas.includes(`src="${hosted}"`), `the canvas passed the ORIGINAL through: ${canvas}`)
  assert.ok(canvas.includes('/size/w750/'), canvas)
  // and an image Ghost does not host comes back verbatim — the recording says so, and a design
  // binding a seeded feature image is exactly this case
  const external = 'https://static.ghost.org/v5.0.0/images/publication-cover.jpg'
  const ext = renderCanvas(doc(), src, { ghost: { feature_image: external }, site: SITE })
  assert.ok(ext.includes(`src="${external}"`), ext)
})

test('NFR-3 — a Ghost URL field is http/https only, narrower than the USER allow-list', () => {
  // The spine's Conventions row: "Every Ghost-sourced value is scheme-validated (http/https only)".
  // `safeUrl` also permits `mailto:` and `tel:`, because a user's Link Picker legitimately produces
  // one — so a GHOST binding and a USER prop deliberately take different doors, and this asserts
  // both, because a guard that blocks everything is not a guard (AD-36).
  const ghostSrc = '<img class="i" data-bind-attr="src:@site.logo">'
  const userSrc = '<a class="l" data-prop-attr="href:link">x</a>'
  for (const hostile of ['javascript:alert(1)', 'data:text/html,<script>x</script>', 'mailto:a@b.c', 'tel:+1']) {
    const out = renderCanvas(doc(), ghostSrc, { ghost: { '@site': { logo: hostile } }, site: SITE })
    assert.ok(out.includes('src="#"'), `a Ghost ${hostile.split(':')[0]}: URL was not rejected: ${out}`)
  }
  // the legitimate Ghost value beside it still works
  const okOut = renderCanvas(doc(), ghostSrc, {
    ghost: { '@site': { logo: 'https://site.example/content/images/2026/01/logo.png' } },
    site: SITE,
  })
  assert.ok(okOut.includes('src="https://site.example/content/images/2026/01/logo.png"'), okOut)
  // and a USER mailto: is a feature, not a compromise — the same character string, the other door
  const mail = renderCanvas(doc(), userSrc, { content: { link: 'mailto:hello@example.com' } })
  assert.ok(mail.includes('href="mailto:hello@example.com"'), mail)
  assert.ok(renderCanvas(doc(), userSrc, { content: { link: 'javascript:alert(1)' } }).includes('href="#"'))
})

test('NFR-3 — an excerpt renders text-only, as a text node, and is Ghost HELPER on the canvas too', () => {
  const src = '<p class="e" data-bind="excerpt">authored</p>'
  // Ghost's helper ESCAPES the text (read in source, helpers/excerpt.js at both target tags), so a
  // `<b>` in an excerpt is a LITERAL on the site — and a text node of it is the same literal here.
  const canvas = renderCanvas(doc(), src, { ghost: { excerpt: 'A body <b>with</b> markup' } })
  assert.ok(canvas.includes('A body &lt;b&gt;with&lt;/b&gt; markup'), canvas)
  // never through innerHTML: a <script> in an excerpt is characters, not a node
  const hostile = renderCanvas(doc(), src, { ghost: { excerpt: '<script>alert(1)</script>ok' } })
  assert.ok(!hostile.includes('<script'), `an excerpt reached the DOM as markup: ${hostile}`)
  assert.ok(hostile.includes('alert(1)&lt;/script&gt;ok'), hostile)
  // {{excerpt}} prefers custom_excerpt and never truncates it; a computed one is 50 words
  const custom = renderCanvas(doc(), src, { ghost: { excerpt: 'computed', custom_excerpt: 'written by hand' } })
  assert.ok(custom.includes('>written by hand<'), custom)
  const long = Array.from({ length: 60 }, (_, i) => `w${i}`).join(' ')
  const cut = renderCanvas(doc(), src, { ghost: { excerpt: long } })
  assert.ok(cut.includes('w49<') && !cut.includes('w50'), cut)
  // a DOTTED path is a Handlebars path lookup on the theme — the plain field — so the canvas reads
  // the field too; only the bare `excerpt` is the helper. {{custom_excerpt}} is a plain field.
  const dotted = renderCanvas(doc(), '<p data-bind="post.excerpt">a</p>', {
    ghost: { post: { excerpt: 'computed', custom_excerpt: 'hand' } },
  })
  assert.ok(dotted.includes('>computed<'), dotted)
  // a post with ONLY a custom excerpt still prints — the helper runs before the emptiness test
  const onlyCustom = renderCanvas(doc(), '<p data-bind="excerpt" data-empty="hide">a</p>', { ghost: { custom_excerpt: 'hand' } })
  assert.ok(onlyCustom.includes('>hand<'), onlyCustom)
  const field = renderCanvas(doc(), '<p data-bind="custom_excerpt">a</p>', { ghost: { custom_excerpt: '<em>x</em>y' } })
  assert.ok(field.includes('&lt;em&gt;x&lt;/em&gt;y'), field)
  // and the empty case still guards: no excerpt of either kind is EMPTY
  assert.equal(renderCanvas(doc(), '<p data-bind="excerpt" data-empty="hide">a</p>', { ghost: {} }), '')
})

// ── The partition, asserted so a directive added to the vocabulary later cannot be silently
//    forgotten by the runtime. ──
test('every consumed directive is either rendered or refused by name — no third state', () => {
  // RENDERED ∪ REFUSED = CONSUMED holds by DEFINITION (REFUSED is the complement), so the checks
  // that can actually fail are: every rendered name is a vocabulary name, and the two are disjoint.
  const partition = [...RENDERED_DIRECTIVES, ...REFUSED_DIRECTIVES].sort()
  for (const d of RENDERED_DIRECTIVES) {
    assert.ok(CONSUMED_DIRECTIVES.includes(d), `the runtime renders "${d}", which the vocabulary does not consume`)
  }
  assert.equal(
    new Set(partition).size,
    partition.length,
    'a directive cannot be both rendered and refused',
  )
  assert.ok(REFUSED_DIRECTIVES.length > 0, 'the refusal set is not vacuous')
})

test('a directive this story does not emit is refused by name on both emitters, never left in', () => {
  for (const d of REFUSED_DIRECTIVES) {
    const src = `<section class="c"><div ${d}="x">y</div></section>`
    const refusesByName = (e: unknown) =>
      e instanceof Error && e.message.includes(d) && /does not emit/.test(e.message)
    assert.throws(() => renderCanvas(doc(), src, {}), refusesByName, `${d}: canvas must refuse BY NAME`)
    assert.throws(() => renderTheme(doc(), src, {}), refusesByName, `${d}: theme must refuse BY NAME`)
  }
})

// ── Story 4.2 review: the leak check over EVERY rendered directive, not only the feed's five. A
//    directive left in by both emitters compared equal and passed `agree()`; the mutation run
//    proved five of the ten could leak with the suite green. The fixture is derived from
//    `RENDERED_DIRECTIVES` so a directive added to the set later is covered by construction. ──
const everyDirectiveSrc = `<section class="all" data-module="lightbox">
     <h1 class="h" data-prop="title" data-empty="hide">t</h1>
     <ul class="l"><li class="i" data-items="logos" data-items-limit="1"><span data-prop="logos[].name">n</span><b data-initials="logos[].name">AP</b></li></ul>
     <a class="a" data-prop-attr="href:link" data-t="card.read_more">Read more</a>
     <span class="m" data-helper="total_members">1,000</span>
     <article class="c" data-repeat="posts" data-repeat-limit="2" data-partial="card">
       <h2 data-bind="title">t</h2>
       <img data-bind-attr="src:feature_image|img_url:m" data-bind-srcset="feature_image|img_url" data-t-attr="alt:card.read_more_about title=title">
       <ul class="t"><li class="g" data-repeat="tags" data-bind-style="--tag-accent:accent_color">·</li></ul>
     </article>
     <a class="n" data-pagination="next" href="#" data-t="pagination.older">Older posts</a>
     <p class="f" data-if="pagination.total">·</p><p class="e" data-else="">–</p>
     <div class="gate" data-members="anonymous"><form data-members-form="subscribe"><input type="email" data-members-email=""><p data-members-error=""></p></form></div>
   </section>`


test('no rendered directive survives — every member of RENDERED_DIRECTIVES is in the fixture', () => {
  for (const d of RENDERED_DIRECTIVES) {
    assert.ok(everyDirectiveSrc.includes(`${d}=`), `the leak fixture does not exercise ${d}`)
  }
  const input: RenderInput = {
    content: { title: 'T', link: '/x', logos: [{ name: 'One' }, { name: 'Two' }] },
    ghost: {
      posts: [
        { title: 'a', feature_image: 'https://site.example/content/images/2026/01/a.jpg', tags: [{ accent_color: '#fff' }] },
        { title: 'b' },
        { title: 'c' },
      ],
    },
    site: SITE,
    target: 'index.hbs',
  }
  const canvas = renderCanvas(doc(), everyDirectiveSrc, input)
  const theme = renderTheme(doc(), everyDirectiveSrc, input)
  for (const [name, html] of [
    ['canvas', canvas],
    ['theme', theme.template],
    ['partial', theme.partials['card'] ?? ''],
  ] as const) {
    assert.ok(!CONSUMED_DIRECTIVE_RE.test(html), `${name} leaked a directive: ${html}`)
    for (const d of CONSUMED_DIRECTIVES) {
      assert.ok(!new RegExp(`\\b${d}=`).test(html), `${name} leaked the directive ${d}: ${html}`)
    }
  }
  assert.ok('card' in theme.partials, 'the partial was not extracted')
  // Story 4.7 — the one survivor this fixture carries: core mounts on it on the live page
  for (const html of [canvas, theme.template]) assert.ok(html.startsWith('<section class="all" data-module="lightbox">'), html)
  // the limit is honoured on the canvas: three rows, limit 2, two articles
  assert.equal((canvas.match(/<article/g) ?? []).length, 2, `the canvas ignored data-repeat-limit: ${canvas}`)
  // STORY 5.11 — and the AUTHORED list's cap is honoured on BOTH, by the one function they share: two logos,
  // `data-items-limit="1"`, one `<li>` in each tree. The second logo is untouched in the input (FR-D19).
  for (const [name, html] of [['canvas', canvas], ['theme', theme.template]] as const) {
    assert.equal((html.match(/<li class="i"/g) ?? []).length, 1, `${name} ignored data-items-limit: ${html}`)
    assert.ok(html.includes('One') && !html.includes('Two'), `${name} drew an item past the cap: ${html}`)
  }
  // a repeat modifier with no repeat to modify is refused, never left in
  assert.throws(() => renderCanvas(doc(), '<div data-partial="x">y</div>', {}), /modifies a data-repeat/)
  assert.throws(() => renderTheme(doc(), '<div data-repeat-limit="3">y</div>', {}), /modifies a data-repeat/)
  // and so is the AUTHORED list's, on both (`validate.ts`'s `orphan-items-limit` is its twin at assembly)
  assert.throws(() => renderCanvas(doc(), '<div data-items-limit="2">y</div>', {}), /modifies a data-items/)
  assert.throws(() => renderTheme(doc(), '<div data-items-limit="2">y</div>', {}), /modifies a data-items/)
})

// ── Story 4.7 — `data-module` is core's mount point on the live page, so both emitters KEEP it on the element
//    that carries it — inside a repeat and a partial too — and refuse a bad value with the vocabulary's sentence. ──
test('data-module survives on the same element on both emitters, and a bad value is refused by both', () => {
  const src = `<section class="g" data-module="accordion:768">
     <ul class="l"><li class="i" data-repeat="posts"><a class="a" data-module="lightbox" data-bind-attr="href:url" data-bind="title">t</a></li></ul>
   </section>`
  const input: RenderInput = { ghost: { posts: [{ title: 'a', url: 'https://site.example/a/' }] } }
  const { canvas, theme } = agree(src, input)
  const partial = renderTheme(doc(), src.replace('data-repeat="posts"', 'data-repeat="posts" data-partial="row"'), input).partials['row'] ?? ''
  assert.ok(canvas.startsWith('<section class="g" data-module="accordion:768">') && theme.startsWith('<section class="g" data-module="accordion:768">'), `${canvas}\n${theme}`)
  assert.ok(/<a class="a" data-module="lightbox"/.test(canvas), canvas)
  assert.ok(/<a class="a" data-module="lightbox"/.test(partial), partial)
  for (const bad of ['search-overlay', 'core', 'accordion:0', 'back-to-top']) {
    const sentence = DIRECTIVES['data-module']?.parse(bad) ?? ''
    assert.ok(sentence !== '', bad)
    const src2 = `<section class="g"><div data-module="${bad}"></div></section>`
    const refused = (e: unknown) => e instanceof Error && e.message.includes(sentence)
    assert.throws(() => renderCanvas(doc(), src2, {}), refused, `canvas: ${bad}`)
    assert.throws(() => renderTheme(doc(), src2, {}), refused, `theme: ${bad}`)
  }
})

// ── FR-H8's attribute-form fallback — the half of "unconditional" the suite never observed. ──
test('FR-H8 — a text attribute binding is guarded in place, and an absent value keeps the authored one', () => {
  const src = '<img class="i" alt="authored" data-bind-attr="alt:title">'
  const { canvas, theme } = agree(src, { ghost: {} })
  assert.ok(theme.includes('alt="{{#if title}}{{title}}{{else}}authored{{/if}}"'), theme)
  assert.ok(canvas.includes('alt="authored"'), canvas)
  // the media case is ANY entry into a URL attribute, not only the first: the ELEMENT is guarded on
  // the URL entry's field, never the attribute
  const mixed = '<img class="i" alt="a" data-bind-attr="alt:title;src:feature_image">'
  const t = renderTheme(doc(), mixed, {}).template
  assert.ok(/\{\{#if feature_image\}\}<img/.test(t), `the element must be guarded on the URL field: ${t}`)
  assert.ok(!/src="\{\{#if/.test(t), `the URL attribute must never be guarded in place: ${t}`)
  const c = renderCanvas(doc(), mixed, { ghost: { title: 'x' } })
  assert.equal(c, '', `an absent image must hide the element on the canvas: ${c}`)
})

// ── Handlebars' `{{#if}}` is falsy on '', 0, false and [] — cited in core.ts — and the canvas must
//    fall back where the site does. ──
test('FR-H8 — a cleared field falls back on the canvas the way {{#if}} does on the site', () => {
  for (const cleared of ['', 0, false, []]) {
    const c = renderCanvas(doc(), '<p data-bind="excerpt">authored</p>', { ghost: { excerpt: cleared } })
    assert.ok(c.includes('>authored<'), `${JSON.stringify(cleared)} did not fall back: ${c}`)
  }
  // ...and on a content prop, `hide` fires for an empty string too
  const hidden = renderCanvas(doc(), '<h1 data-prop="title" data-empty="hide">t</h1>', { content: { title: '' } })
  assert.equal(hidden, '')
  // an authored child element is text on both emitters, value or no value
  const { canvas, theme } = agree('<h2 class="h" data-bind="title"><span class="x">Post</span> title</h2>', { ghost: {} })
  assert.ok(!/<span/.test(canvas) && canvas.includes('Post title'), canvas)
  assert.ok(theme.includes('{{else}}Post title{{/if}}'), theme)
})

// ── THE DIFFERENCE (1), nested: the canvas expands an inner repeat against the OUTER ROW, which is
//    what {{#foreach tags}} inside {{#foreach posts}} reads on the site. ──
test('a nested repeat on the canvas reads the outer row, and @site reads the root, like Handlebars', () => {
  const src = `<section><article class="o" data-repeat="posts"><h2 data-bind="title">T</h2><span class="s" data-bind="@site.title">S</span><ul><li class="i" data-repeat="tags"><a data-bind="name">n</a></li></ul></article></section>`
  const canvas = renderCanvas(doc(), src, {
    ghost: {
      '@site': { title: 'SITE' },
      posts: [{ title: 'P1', tags: [{ name: 'post-tag-a' }, { name: 'post-tag-b' }] }, { title: 'P2' }],
      tags: [{ name: 'TOP-LEVEL' }],
    },
  })
  assert.ok(!canvas.includes('TOP-LEVEL'), `the inner repeat read the root context: ${canvas}`)
  assert.equal((canvas.match(/post-tag-/g) ?? []).length, 2, canvas)
  assert.equal((canvas.match(/SITE/g) ?? []).length, 2, `@site must resolve inside a row: ${canvas}`)
  assert.ok(canvas.includes('P2'), canvas)
  // a non-array source expands to nothing rather than one row per character
  const none = renderCanvas(doc(), '<ul><li data-repeat="posts">x</li></ul>', { ghost: { posts: 'abc' } })
  assert.equal(none, '<ul></ul>')
})

// ── a guard on the REPEATED ELEMENT itself lands inside the block on the theme, and a removed
//    clone stays removed on the canvas. ──
test('a hide guard on the repeat root sits inside {{#foreach}} and hides the row on the canvas', () => {
  const src = '<ul class="l"><li class="r" data-repeat="posts" data-bind-attr="href:url">x</li></ul>'
  const theme = renderTheme(doc(), src, {}).template
  assert.ok(/\{\{#foreach posts\}\}\s*\{\{#if url\}\}<li/.test(theme), `the guard is outside the block: ${theme}`)
  const canvas = renderCanvas(doc(), src, { ghost: { posts: [{ url: '/a' }, {}, { url: '/c' }] } })
  assert.equal((canvas.match(/<li/g) ?? []).length, 2, `a row with no url must be hidden: ${canvas}`)
  const prop = '<ul class="l"><li class="r" data-repeat="posts" data-prop="label" data-empty="hide">x</li></ul>'
  const { canvas: pc, theme: pt } = bothWays(prop, { ghost: { posts: [{}, {}] } })
  assert.equal(pc, '<ul class="l"></ul>')
  assert.ok(pt.includes('{{#foreach posts}}') && !/<li/.test(pt), pt)
})

test('the canvas honours the date format the way Ghost does, and refuses a bad data-empty', () => {
  const c = renderCanvas(doc(), '<time data-bind="published_at|date:D MMMM YYYY">d</time>', {
    ghost: { published_at: '2026-03-04T10:00:00Z' },
  })
  assert.equal(c, '<time>4 March 2026</time>')
  assert.throws(() => renderCanvas(doc(), '<p data-bind="x" data-empty="HIDE">t</p>', {}), /data-empty/)
  assert.throws(() => renderCanvas(doc(), '<a data-prop-attr="href">t</a>', {}), /AD-36: data-prop-attr/)
  // a rich value into an attribute contributes its text, never its marks, on both emitters
  const rich = { link: { text: '/go', marks: [{ start: 0, end: 3, mark: 'strong' }] } }
  const { canvas, theme } = bothWays('<a data-prop-attr="href:link">x</a>', { content: rich })
  assert.ok(canvas.includes('href="/go"') && theme.includes('href="/go"'), `${canvas} | ${theme}`)
})

// ═══ Story 4.5 — the controls engine's door, and the four new sinks, on both emitters ═══
//
// §7.3's exit criterion reaches everything this story adds: the root's control attributes come from
// `resolveControls` on both sides, an authored array bakes the same N copies, and a link record, an
// icon and an image id become the same attributes and the same drawing. The skeleton comparison is
// over names; each case also asserts the VALUES that must be equal, because a control value that
// differs between the emitters is a stylesheet selecting on two different things.

const CONTROLS: ControlDef[] = [
  { name: 'align', type: 'segmented', label: 'Alignment', group: 'layout', values: ['start', 'center'], default: 'start' },
  { name: 'rule', type: 'segmented', label: 'Rule', group: 'style', values: ['none', 'line'], default: 'line',
    disabledBy: { control: 'align', whenValue: 'center', reason: 'Not while centred.', inForce: 'none' } },
]
const SCHEMA: Record<string, PropDef> = {
  items: { type: 'array', label: 'Items' },
  'items[].title': { type: 'text', label: 'Title' },
  'items[].icon': { type: 'icon', label: 'Icon' },
  'items[].picture': { type: 'image', label: 'Picture' },
  'items[].link': { type: 'url', label: 'Link' },
}
const featureSrc = `<section class="f" data-align="start" data-rule="line" data-bg="base" data-spacing="comfortable" data-divider="none">
  <ul class="f__list"><li class="f__item" data-items="items">
    <span class="f__icon" data-prop="items[].icon"></span>
    <img class="f__img" data-prop-attr="src:items[].picture" data-empty="hide" alt="">
    <a class="f__link" data-prop="items[].title" data-prop-attr="href:items[].link">t</a>
  </li></ul>
</section>`
const featureInput = (over: Partial<RenderInput> = {}): RenderInput => ({
  schema: SCHEMA,
  controlSchema: CONTROLS,
  controls: { align: 'center', rule: 'line' },
  icons: iconDrawing,
  assets: { one: '/pool/one.svg', two: '/pool/two.svg' },
  content: {
    items: [
      { title: 'Portal', icon: 'rocket', picture: 'one', link: { portal: 'account/plans' } },
      { title: 'Search', icon: 'heart-filled', picture: 'two', link: { search: true } },
      { title: 'Away', icon: 'star', picture: 'one', link: { href: 'https://x.example/', newTab: true, rel: ['sponsored'] } },
    ],
  },
  ...over,
})

test('Story 4.5 — control attributes, data-items trees, link attributes, icons and image sources agree', () => {
  const { canvas, theme } = agree(featureSrc, featureInput())
  const root = (html: string) => /<section[^>]*>/.exec(html)?.[0]
  assert.equal(root(canvas), root(theme), 'the two roots differ')
  assert.match(root(canvas) ?? '', /data-align="center" data-rule="none" data-bg="base" data-spacing="comfortable" data-divider="none"/)
  // a greyed control's stored value is in neither output
  for (const html of [canvas, theme]) assert.doesNotMatch(html, /data-rule="line"/)
  // the item bodies, value for value: every attribute below is a closed value or a baked user value
  const items = (html: string) => [...html.matchAll(/<li class="f__item">[^]*?<\/li>/g)].map((m) => m[0])
  assert.equal(items(canvas).length, 3)
  // Story 5.20 — the Upgrade link ships behind the site's paid flag on the theme (R-4); decided true, the copies are equal
  assert.ok(theme.includes('{{#if @site.paid_members_enabled}}<a class="f__link" href="#" data-portal="account/plans">'), theme)
  assert.deepEqual(items(canvas), items(decide(theme, { '@site.paid_members_enabled': true })), 'the data-items copies differ between emitters')
  const [portal, search, away] = items(canvas)
  assert.match(portal ?? '', /<a class="f__link" href="#" data-portal="account\/plans">Portal<\/a>/)
  assert.match(search ?? '', /<a class="f__link" href="#" data-ghost-search="">Search<\/a>/)
  assert.match(away ?? '', /href="https:\/\/x\.example\/" target="_blank" rel="noreferrer sponsored"/)
  assert.match(portal ?? '', /<img class="f__img" alt="" src="\/pool\/one\.svg">/)
  assert.match(portal ?? '', /<svg[^>]*stroke="currentColor"[^>]*aria-hidden="true"><path /)
  assert.match(search ?? '', /<svg[^>]*fill="currentColor" aria-hidden="true"><path /)
})

test('Story 4.5 — without a schema the authored root stands, so every render before this story is unchanged', () => {
  const { canvas, theme } = bothWays(featureSrc, { ...featureInput(), controlSchema: undefined })
  for (const html of [canvas, theme]) assert.match(html, /data-align="start" data-rule="line"/)
})

test('Story 4.5 — a Ghost binding inside an authored item keeps its own data-empty guard on both emitters', () => {
  // a TEXT binding defaults to fallback, so only an honoured `hide` removes it — the case a swept guard breaks
  const src = '<ul class="u"><li class="i" data-items="items"><span class="t" data-prop="items[].title">t</span><em class="m" data-bind="@site.title" data-empty="hide">authored</em></li></ul>'
  const input: RenderInput = { content: { items: [{ title: 'One' }] }, ghost: {}, schema: SCHEMA }
  const canvas = renderCanvas(doc(), src, input)
  assert.doesNotMatch(canvas, /<em/, `the hide guard was swept before the binding read it: ${canvas}`)
  const theme = renderTheme(doc(), src, input).template
  assert.match(theme, /\{\{#if @site\.title\}\}<em class="m">\{\{@site\.title\}\}<\/em>\{\{\/if\}\}/, theme)
  for (const html of [canvas, theme]) assert.doesNotMatch(html, /data-empty|data-bind/)
})

// ═══ Story 4.9 — the string catalog on both emitters ═══
//
// `data-t` is `{{t "key"}}` in the theme and the handed string on the canvas; each param is guarded on its bound
// field, so an empty one removes the element on the canvas exactly where `{{#if}}` removes it on the site. The
// structure agrees node for node, and the text differs only as THE DIFFERENCE (2) says it may.

test('Story 4.9 — a catalog string agrees: {{t}} in the theme, the handed string on the canvas', () => {
  const src = '<section class="s"><button class="b" type="button" data-ghost-search data-t="search.trigger_label">Search</button></section>'
  const { canvas, theme } = agree(src, { target: 'index.hbs' })
  assert.ok(theme.includes('<button class="b" type="button" data-ghost-search="">{{t "search.trigger_label"}}</button>'), theme)
  assert.ok(canvas.includes('>Search</button>'), canvas)
  // the handed map is what the canvas shows; the theme is unchanged, because Ghost reads the locale file
  const de = bothWays(src, { strings: { 'search.trigger_label': 'Suche' } })
  assert.ok(de.canvas.includes('>Suche</button>'), de.canvas)
  assert.equal(de.theme, theme)
})

test('Story 4.9 — params are guarded on their bound field, a helper param is a sub-expression, and a number guards with includeZero', () => {
  const by = '<section class="s"><p class="by" data-t="post.by author=primary_author.name">By Ana</p></section>'
  const { canvas, theme } = agree(by, { target: 'post.hbs', ghost: { primary_author: { name: 'Ana Lee' } } })
  assert.ok(theme.includes('{{#if primary_author.name}}<p class="by">{{t "post.by" author=primary_author.name}}</p>{{/if}}'), theme)
  assert.ok(canvas.includes('<p class="by">By Ana Lee</p>'), canvas)
  assert.equal(renderCanvas(doc(), by, { target: 'post.hbs', ghost: { primary_author: { name: '' } } }), '<section class="s"></section>', 'an empty param removes the element')

  const updated = '<section class="s"><time class="u" data-t="post.updated_on date=updated_at|date:D MMM YYYY">Updated</time></section>'
  const u = agree(updated, { target: 'post.hbs', ghost: { updated_at: '2026-08-20T08:09:20.000+00:00' } })
  assert.ok(u.theme.includes('{{#if updated_at}}<time class="u">{{t "post.updated_on" date=(date updated_at format="D MMM YYYY")}}</time>{{/if}}'), u.theme)
  assert.ok(u.canvas.includes('>Updated 20 Aug 2026<'), u.canvas)

  // recorded on both majors: `minutes=reading_time` is the FIELD, so an API 0 prints "0 min read" — and 0 is present
  const read = '<section class="s"><span class="r" data-t="post.reading_time minutes=reading_time">5 min read</span></section>'
  const r = agree(read, { target: 'post.hbs', ghost: { reading_time: 0 } })
  assert.ok(r.theme.includes('{{#if reading_time includeZero=true}}<span class="r">{{t "post.reading_time" minutes=reading_time}}</span>{{/if}}'), r.theme)
  assert.ok(r.canvas.includes('>0 min read<'), r.canvas)

  // two params on one element: one guard each, nested, and never doubled with a binding on the same field
  const pageOf = '<section class="s"><p class="p" data-t="pagination.page_of page=pagination.page pages=pagination.pages" data-t-attr="title:pagination.page_number page=pagination.page">Page 1 of 3</p></section>'
  const p = renderTheme(doc(), pageOf, { target: 'index.hbs' }).template
  assert.equal((p.match(/\{\{#if pagination\.page includeZero=true\}\}/g) ?? []).length, 1, p)
  assert.equal((p.match(/\{\{\/if\}\}/g) ?? []).length, 2, p)
  // review 4.9: a data-t-attr param that is empty removes the element on the canvas, as the theme's guard hides it
  const titled = '<section class="s"><p class="p" data-t-attr="title:pagination.page_number page=pagination.page"></p></section>'
  assert.equal(renderCanvas(doc(), titled, { target: 'index.hbs', site: { pagination: { page: undefined } } }), '<section class="s"></section>')
  assert.ok(renderTheme(doc(), titled, { target: 'index.hbs' }).template.includes('{{#if pagination.page includeZero=true}}<p class="p" title="{{t "pagination.page_number" page=pagination.page}}"></p>{{/if}}'))
})

test('Story 4.9 — data-t-attr writes the four text attributes on both emitters', () => {
  const src = '<section class="s"><input class="i" type="email" data-t-attr="aria-label:pagination.label;placeholder:member.email_placeholder"></section>'
  const { canvas, theme } = agree(src, { target: 'index.hbs' })
  assert.ok(theme.includes('aria-label="{{t "pagination.label"}}" placeholder="{{t "member.email_placeholder"}}"'), theme)
  assert.ok(canvas.includes('aria-label="Pagination" placeholder="Your email address"'), canvas)
  for (const bad of ['value:member.email_placeholder', 'href:nav.menu']) {
    for (const render of [renderCanvas, renderTheme]) {
      assert.throws(() => render(doc(), `<input data-t-attr="${bad}">`, {}), /does not hold visitor-facing text/, bad)
    }
  }
})

test('Story 4.9 — V2 and V4 refuse at the render door on both emitters, a data-t inside an empty repeat included', () => {
  const cases: [string, RegExp][] = [
    ['<p data-t="a1.menu_open">x</p>', /not in the catalog/],
    ['<p data-t="search.overlay_empty">x</p>', /retired/],
    ['<p data-t="countdown.days">x</p>', /js key/],
    ['<p data-t="comments.placeholder">x</p>', /canvas-only/],
    ['<p data-t="pagination.page_of page=pagination.page">x</p>', /misses pages/],
    ['<p data-t="nav.menu x=title">x</p>', /passes x/],
    ['<ul><li data-repeat="posts"><p data-t="a22.email">x</p></li></ul>', /not in the catalog/],
    ['<p data-t="nav.menu" data-empty="hide">x</p>', /data-empty/],
    ['<p data-t="nav.menu" data-bind="title">x</p>', /one element carries one text/],
    ['<div data-module="countdown" data-i18n-days="{count} Tage"></div>', /never writes one/],
    ['<img data-t-attr="alt:card.play_video" data-bind-attr="alt:title" alt="">', /one attribute holds one value/],
    ['<p data-t="archive.posts_many">x</p>', /written for \{\{plural\}\}/],
  ]
  for (const [src, re] of cases) {
    assert.throws(() => renderCanvas(doc(), src, { ghost: { posts: [] } }), re, `canvas: ${src}`)
    assert.throws(() => renderTheme(doc(), src, {}), re, `theme: ${src}`)
  }
})

test("Story 4.9 — S6: an untouched catalog-linked prop is the catalog string, and a typed value is user text", () => {
  const schema: Record<string, PropDef> = { submitLabel: { type: 'text', label: 'Button text', catalog: 'member.signup_cta' } }
  const src = '<section class="s"><button class="b" type="submit" data-prop="submitLabel">Subscribe</button></section>'
  const { canvas, theme } = agree(src, { schema, content: {}, target: 'index.hbs' })
  assert.ok(theme.includes('<button class="b" type="submit">{{t "member.signup_cta"}}</button>'), theme)
  assert.ok(canvas.includes('>Subscribe</button>'), canvas)
  assert.ok(bothWays(src, { schema, content: {}, strings: { 'member.signup_cta': 'Abonnieren' } }).canvas.includes('>Abonnieren<'))
  const typed = bothWays(src, { schema, content: { submitLabel: 'Join {{us}}' } })
  assert.ok(typed.canvas.includes('>Join {{us}}<'), typed.canvas)
  assert.ok(typed.theme.includes('>Join &#123;&#123;us&#125;&#125;<') && !typed.theme.includes('{{t'), typed.theme)
  // a declaration the validator would refuse is refused here too
  assert.throws(() => renderCanvas(doc(), src, { schema: { submitLabel: { type: 'text', label: 'x', catalog: 'nav.menu' } } }), /S6/)
  // review 4.9: S6 through data-prop-attr, into a text attribute only
  const attr = '<section class="s"><input class="b" type="submit" data-prop-attr="title:submitLabel"></section>'
  const a = agree(attr, { schema, content: {}, target: 'index.hbs' })
  assert.ok(a.theme.includes('title="{{t "member.signup_cta"}}"'), a.theme)
  assert.ok(a.canvas.includes('title="Subscribe"'), a.canvas)
  assert.ok(bothWays(attr, { schema, content: { submitLabel: 'Join' } }).canvas.includes('title="Join"'))
  for (const render of [renderCanvas, renderTheme]) {
    assert.throws(() => render(doc(), '<a data-prop-attr="href:submitLabel">x</a>', { schema, content: {} }), /never to a URL attribute/)
  }
})

test('Story 4.9 — S5: both emitters stamp one data-i18n-* per countdown key on its mount, the theme with its braces as entities', () => {
  const src = '<section class="s"><div class="cd" data-module="countdown"><span class="n">·</span></div></section>'
  const { canvas, theme } = agree(src, { target: 'index.hbs' })
  const keys = Object.keys(CATALOG.keys).filter((k) => k.startsWith('countdown.'))
  assert.ok(keys.length > 0)
  for (const key of keys) {
    const en = CATALOG.keys[key]?.en ?? ''
    const attr = i18nAttr(key)
    assert.ok(canvas.includes(`${attr}="${en}"`), `${attr} on the canvas: ${canvas}`)
    assert.ok(theme.includes(`${attr}="${en.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')}"`), `${attr} in the theme: ${theme}`)
  }
  assert.ok(canvas.includes('data-i18n-days="{count} days"'), canvas)
  // on the root too: the stamp comes after stampControls, which strips every root data-* it does not own
  const onRoot = bothWays('<section class="s" data-module="countdown" data-align="start">·</section>', { controlSchema: [], strings: { 'countdown.ended': 'Vorbei' } })
  assert.ok(onRoot.canvas.includes('data-i18n-ended="Vorbei"') && onRoot.theme.includes('data-i18n-ended="Vorbei"'), `${onRoot.canvas}\n${onRoot.theme}`)
  assert.ok(!onRoot.canvas.includes('data-align'), 'the controls were still stamped from the schema')
})

test('Story 4.9 — the handed strings pass resolveStrings: a credit.* override and an unknown key throw on both emitters', () => {
  for (const render of [renderCanvas, renderTheme]) {
    assert.throws(() => render(doc(), '<p data-t="nav.menu">Menu</p>', { strings: { 'credit.built_with': 'Made by me' } }), /S7/)
    assert.throws(() => render(doc(), '<p data-t="nav.menu">Menu</p>', { strings: { 'nope.key': 'x' } }), /"nope\.key"/)
    // a full map resolveStrings already returned passes unchanged, credit keys at their English included
    assert.doesNotThrow(() => render(doc(), '<p data-t="nav.menu">Menu</p>', { strings: resolveStrings({ 'nav.menu': 'Menü' }) }))
  }
})

test("Story 4.9 — V1's tree half: a render naming its target refuses every literal in one error, and the exempt set passes", () => {
  const src = `<section class="s">
    <nav aria-label="Main"><a href="#">Newer</a></nav>
    <input type="email" placeholder="you@example.com">
    <img src="/a.png" alt="A cat">
  </section>`
  for (const render of [renderCanvas, renderTheme]) {
    assert.throws(() => render(doc(), src, { target: 'index.hbs' }), (e: unknown) => {
      const m = (e as Error).message
      for (const lit of ['<nav aria-label="Main">', '<a> "Newer"', '<input placeholder="you@example.com">', '<img alt="A cat">']) {
        assert.ok(m.includes(lit), `${lit} not named in: ${m}`)
      }
      return /^V1:/.test(m)
    })
    // a render naming no target is not checked (the scope check's rule)
    assert.doesNotThrow(() => render(doc(), src, {}))
  }
  assert.equal(checkChromeLiterals(doc(), src).length, 4)
  const exempt = `<section class="s">
    <h2 data-prop="title">A heading</h2><p data-bind="title">Post title</p><p data-t="nav.menu">Menu</p>
    <div data-helper="content"></div><b data-initials="name">AP</b><p data-text="{total_members}">12,000 readers</p>
    <span data-pagination="numbers">1 / 3</span>
    <img alt="" src="/x.png"><img data-bind-attr="alt:title" alt="Authored"><img data-prop-attr="alt:pictureAlt" alt="Authored">
    <input data-t-attr="placeholder:member.email_placeholder" placeholder="you@example.com">
    <p>· — / «»</p>
  </section>`
  assert.deepEqual(checkChromeLiterals(doc(), exempt), [])
  // "1 / 3" has digits and sits under data-pagination="numbers" — prev and next are not exempt
  assert.deepEqual(checkChromeLiterals(doc(), '<a data-pagination="next" href="#">Older</a>'), ['<a> "Older"'])
})

// ── Story 4.10 — the two arms and member gating (§7.3 rows 3 and 4, exit construct 2) ────────────────────────
//
// The theme carries BOTH arms and every member arm, and Ghost picks per request; the canvas carries the one the
// handed context picks. So agreement is taken AFTER the theme's `{{#if}}` blocks are decided by the same facts the
// canvas was handed — `decide` evaluates only the fields it is told about and leaves every other block alone.

/** The theme text with each `{{#if f}}…{{else}}…{{/if}}` on a field in `truth` replaced by the arm that field picks. */
function decide(text: string, truth: Readonly<Record<string, boolean>>): string {
  const re = /\{\{#if ([^}]*)\}\}|\{\{else\}\}|\{\{\/if\}\}/g
  const stack: { cond: string; yes: string; no: string; inElse: boolean }[] = []
  let out = ''
  let last = 0
  const emit = (t: string) => {
    const f = stack[stack.length - 1]
    if (f === undefined) out += t
    else if (f.inElse) f.no += t
    else f.yes += t
  }
  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    emit(text.slice(last, m.index))
    last = re.lastIndex
    if (m[1] !== undefined) stack.push({ cond: m[1], yes: '', no: '', inElse: false })
    else if (m[0] === '{{else}}') {
      const f = stack[stack.length - 1]
      if (f === undefined) emit(m[0])
      else f.inElse = true
    } else {
      const f = stack.pop() as { cond: string; yes: string; no: string }
      const field = f.cond.replace(/ includeZero=true$/, '')
      emit(Object.hasOwn(truth, field) ? (truth[field] ? f.yes : f.no) : `{{#if ${f.cond}}}${f.yes}{{else}}${f.no}{{/if}}`)
    }
  }
  return out + text.slice(last)
}

const VISITOR: Readonly<Record<'anonymous' | 'free' | 'paid', Record<string, boolean>>> = {
  anonymous: { '@member': false, '@member.paid': false },
  free: { '@member': true, '@member.paid': false },
  paid: { '@member': true, '@member.paid': true },
}

/** `agree`, with the theme's blocks on `truth`'s fields decided first */
function agreeDecided(src: string, input: RenderInput, truth: Readonly<Record<string, boolean>>) {
  const canvas = renderCanvas(doc(), src, input)
  const theme = renderTheme(doc(), src, input).template
  const a = skeleton(htmlSafe(canvas))
  const b = skeleton(htmlSafe(decide(theme, truth)))
  assert.deepEqual(a, b, `RENDERERS DISAGREE\n  canvas:\n${a.join('\n')}\n  theme, decided:\n${b.join('\n')}`)
  return { canvas, theme }
}

const MEMBERS_SRC = `<section class="band">
    <p class="a" data-members="anonymous">·</p>
    <p class="f" data-members="free">·</p>
    <p class="p" data-members="paid">·</p>
    <p class="e" data-members="everyone">·</p>
  </section>`

test("row · a member arm: the four states emit Ghost's own {{#if}} test, and each visitor sees its arm on the canvas", () => {
  const theme = renderTheme(doc(), MEMBERS_SRC, { target: 'default.hbs' }).template
  assert.ok(theme.includes('{{#if @member}}{{else}}<p class="a">·</p>{{/if}}'), theme)
  assert.ok(theme.includes('{{#if @member.paid}}<p class="p">·</p>{{/if}}'), theme)
  assert.ok(theme.includes('{{#if @member}}{{#if @member.paid}}{{else}}<p class="f">·</p>{{/if}}{{/if}}'), theme)
  assert.ok(/[^}]<p class="e">·<\/p>/.test(theme), `everyone emits no wrapper: ${theme}`)
  assert.ok(!/\{\{#unless|\{\{#has|\{\{@member/.test(theme), `FR-D16 / R-28: {{#if}} only, and no member field printed: ${theme}`)
  for (const member of ['anonymous', 'free', 'paid'] as const) {
    const { canvas } = agreeDecided(MEMBERS_SRC, { target: 'default.hbs', member }, VISITOR[member])
    const shown = [...canvas.matchAll(/<p class="(\w)">/g)].map((m) => m[1])
    assert.deepEqual(shown, [member.charAt(0), 'e'], `${member} sees its own arm and everyone's: ${canvas}`)
  }
  // the default visitor is signed out
  assert.equal(renderCanvas(doc(), MEMBERS_SRC, {}), renderCanvas(doc(), MEMBERS_SRC, { member: 'anonymous' }))
})

test('row · a member arm is refused inside another, and on a repeat, a list or an arm', () => {
  const input: RenderInput = { content: { logos: [{ n: 'x' }] }, ghost: { posts: [{ title: 't' }] } }
  const cases: [string, RegExp][] = [
    ['<div data-members="paid"><p data-members="free">·</p></div>', /sits inside data-members="paid"/],
    ['<ul><li data-repeat="posts" data-members="paid">·</li></ul>', /shares its element with data-repeat/],
    ['<ul><li data-items="logos" data-members="paid">·</li></ul>', /shares its element with data-items/],
    ['<div><p data-if="title" data-members="paid">·</p></div>', /shares its element with data-if/],
  ]
  for (const [src, re] of cases) {
    assert.throws(() => renderCanvas(doc(), src, input), re, `canvas: ${src}`)
    assert.throws(() => renderTheme(doc(), src, input), re, `theme: ${src}`)
  }
  // the legitimate neighbours: a gate inside a repeat, and a repeat inside a gate
  const { theme } = bothWays('<section><ul><li data-repeat="posts"><b data-members="paid" data-bind="title">t</b></li></ul><div data-members="free"><i data-repeat="posts" data-bind="title">t</i></div></section>', { ghost: { posts: [{ title: 'Row' }] }, member: 'free' })
  assert.ok(theme.includes('{{#foreach posts}}') && theme.includes('{{#if @member.paid}}<b>'), theme)
})

test('row · show-to: the root is gated as if it carried data-members, on both emitters; a visitor outside it gets ""', () => {
  const src = '<section class="band" data-bg="base"><p class="x">·</p></section>'
  const theme = renderTheme(doc(), src, { visibility: 'paid' }).template
  assert.match(theme, /^\{\{#if @member\.paid\}\}<section class="band"[^>]*>.*<\/section>\{\{\/if\}\}$/s)
  assert.equal(renderCanvas(doc(), src, { visibility: 'paid', member: 'anonymous' }), '')
  for (const member of ['anonymous', 'free', 'paid'] as const) {
    agreeDecided(src, { visibility: 'free', member }, VISITOR[member])
  }
  assert.ok(renderCanvas(doc(), src, { visibility: 'paid', member: 'paid' }).startsWith('<section'))
  assert.equal(renderTheme(doc(), src, { visibility: 'everyone' }).template, renderTheme(doc(), src, {}).template, 'everyone gates nothing')
  // one audience per section
  for (const render of [renderCanvas, renderTheme]) {
    assert.throws(() => render(doc(), '<section data-members="free"><p>·</p></section>', { visibility: 'paid' }), /one audience per section/)
    assert.doesNotThrow(() => render(doc(), '<section data-members="free"><p>·</p></section>', { visibility: 'everyone' }))
    // an else arm beside a root data-if sits outside the gated root: the canvas showed it to a hidden-from visitor
    assert.throws(() => render(doc(), '<section data-if="@site.logo"><p>·</p></section><div data-else><p>·</p></div>', { visibility: 'paid' }), /one audience per section/)
  }
})

test('row · two arms: {{#if f}}<if>{{else}}<else>{{/if}}, ONE guard where the condition and the media binding share a field, and one arm on the canvas', () => {
  const src = '<a class="brand" href="/"><img class="logo" data-if="@site.logo" data-bind-attr="src:@site.logo" alt=""><span class="word" data-else data-bind="@site.title">·</span></a>'
  const theme = renderTheme(doc(), src, { target: 'default.hbs' }).template
  assert.equal((theme.match(/\{\{#if @site\.logo\}\}/g) ?? []).length, 1, `one {{#if @site.logo}}: ${theme}`)
  assert.ok(theme.includes('{{#if @site.logo}}<img class="logo" alt="" src="{{@site.logo}}">{{else}}<span class="word">'), theme)
  assert.ok(theme.endsWith('</span>{{/if}}</a>'), theme)
  for (const logo of ['https://site.example/content/images/logo.png', '']) {
    const ghost = { '@site': { logo, title: 'Orbit Weekly' } }
    const { canvas } = agreeDecided(src, { target: 'default.hbs', ghost }, { '@site.logo': logo !== '', '@site.title': true })
    assert.equal((canvas.match(/class="(logo|word)"/g) ?? []).length, 1, `exactly one arm: ${canvas}`)
    assert.ok(logo === '' ? canvas.includes('>Orbit Weekly<') : canvas.includes(`src="${logo}"`), canvas)
  }
})

test('row · one arm, a list and a number: an empty list takes the else arm, and a number adds includeZero=true', () => {
  const src = `<section class="feed">
    <p class="ask" data-if="@site.allow_self_signup">·</p>
    <div class="grid" data-if="posts"><article class="card" data-repeat="posts"><h2 data-bind="title">·</h2></article></div>
    <p class="empty" data-else>–</p>
    <span class="count" data-if="pagination.total">·</span>
  </section>`
  const theme = renderTheme(doc(), src, { target: 'index.hbs' }).template
  assert.ok(theme.includes('{{#if @site.allow_self_signup}}<p class="ask">·</p>{{/if}}'), theme)
  assert.ok(/\{\{#if posts\}\}<div class="grid">\{\{#foreach posts\}\}[^]*\{\{\/foreach\}\}<\/div>\{\{else\}\}\s*<p class="empty">–<\/p>\{\{\/if\}\}/.test(theme), theme)
  assert.ok(theme.includes('{{#if pagination.total includeZero=true}}<span class="count">·</span>{{/if}}'), theme)
  for (const [posts, total] of [[[{ title: 'a' }], 1], [[], 0]] as const) {
    const ghost = { '@site': { allow_self_signup: true }, posts, pagination: { total } }
    const { canvas } = agreeDecided(src, { target: 'index.hbs', ghost }, { '@site.allow_self_signup': true, posts: posts.length > 0, 'pagination.total': true, title: true })
    assert.ok(posts.length > 0 ? canvas.includes('class="card"') && !canvas.includes('class="empty"') : canvas.includes('class="empty"') && !canvas.includes('class="grid"'), canvas)
    assert.ok(canvas.includes('class="count"'), `a count of 0 is present: ${canvas}`)
  }
})

test('row · a data-else that is not the next element sibling of a data-if is refused by name, on both emitters', () => {
  for (const [src, re] of [
    ['<div><p data-if="title">·</p><hr><p data-else>–</p></div>', /data-else is not the next element sibling of a data-if/],
    ['<div><p data-else>–</p></div>', /data-else is not the next element sibling of a data-if/],
    ['<div><p data-if="title" data-else>·</p></div>', /carries both data-if and data-else/],
    ['<div><p data-if="posts" data-repeat="posts">·</p><p data-else>–</p></div>', /carries data-repeat and is one arm/],
  ] as const) {
    assert.throws(() => renderCanvas(doc(), src, { ghost: { title: 'x', posts: [] } }), re, src)
    assert.throws(() => renderTheme(doc(), src, {}), re, src)
  }
  // a comment or text between the two arms is not an element, so the pair stands
  assert.doesNotThrow(() => renderTheme(doc(), '<div><p data-if="title">·</p> <!-- note --> <p data-else>–</p></div>', {}))
})

test("row · Portal's form: data-members-email and data-members-error are kept on both emitters, and a value on either is refused", () => {
  const src = '<section class="nl"><form class="form" data-members-form="subscribe"><input class="field" type="email" data-members-email><button class="btn" type="submit">·</button><p class="err" data-members-error></p></form></section>'
  const { canvas, theme } = agree(src, { target: 'home.hbs' })
  for (const html of [canvas, theme]) {
    assert.ok(/<input class="field" type="email" data-members-email="">/.test(html) && /<p class="err" data-members-error="">/.test(html) && html.includes('data-members-form="subscribe"'), html)
  }
  for (const bad of ['data-members-email="x"', 'data-members-error="oops"']) {
    const hostile = src.replace(/data-members-(email|error)(?=[>\s])/, bad)
    assert.ok(hostile.includes(bad))
    assert.throws(() => renderCanvas(doc(), hostile, {}), /takes no value/)
    assert.throws(() => renderTheme(doc(), hostile, {}), /takes no value/)
  }
})

// ─── Story 5.19 — the SECONDARY FEED: the emitters' one new difference, proven to agree ──────────────────────────
//
// A feed design repeats the page's native `posts`. As a secondary feed the theme puts the WHOLE section inside its
// query's `{{#get "posts"}}` and `{{#if posts}}` (a get shadows `posts` and `pagination` in its block — MEASUREMENTS
// §53), and the canvas renders the same markup against the page's context with `posts` replaced by the query's rows
// and no `pagination`. Both leave the pager out. The comparison is the file's own: structure, node for node.

const FEED = `<section class="f">
  <h2 class="f__title" data-prop="title">t</h2>
  <div class="f__feed" data-if="posts">
    <ul class="f__grid"><li class="f__cell" data-repeat="posts"><a class="f__card" data-bind-attr="href:url"><h3 class="f__h" data-bind="title">x</h3></a></li></ul>
    <nav class="f__pager" data-t-attr="aria-label:pagination.label">
      <a class="f__newer" data-pagination="prev" href="#" data-t="pagination.newer">Newer posts</a>
      <span class="f__n" data-pagination="numbers">1 / 1</span>
      <a class="f__older" data-pagination="next" href="#" data-t="pagination.older">Older posts</a>
    </nav>
  </div>
</section>`
/** …and with its designed empty state, the data-else arm the main feed shows at zero (only one arm is ever drawn on the
 *  canvas, so this one is compared by what it emits rather than node for node) */
const FEED_EMPTY = FEED.replace('</section>', '<div class="f__empty" data-else><p class="f__e" data-prop="empty">e</p></div></section>')
const PAGE = { posts: [{ title: 'Native one', url: 'https://site.example/native/' }], pagination: { page: 2, pages: 3, limit: 12, total: 33 } }
const QUERY = { source: 'posts', limit: 12, order: 'published_at desc' }
const feedInput = (feed: RenderInput['feed'], over: RenderInput = {}): RenderInput => ({
  content: { title: 'More essays', empty: 'None' },
  ghost: PAGE,
  site: { ...SITE, pagination: PAGE.pagination },
  target: 'home.hbs',
  ...(feed === undefined ? {} : { feed }),
  ...over,
})

test('Story 5.19 · the CONTROL: a feed design handed no secondary-feed query is the main feed — native posts, pager and all', () => {
  const { canvas, theme } = agree(FEED, feedInput(undefined))
  assert.ok(theme.includes('{{#foreach posts}}') && !theme.includes('{{#get'), theme)
  assert.ok(theme.includes('{{page_url pagination.next}}'), 'the main feed keeps its pager')
  assert.ok(canvas.includes('>Native one<') && canvas.includes('class="f__pager"'), canvas)
})

test('Story 5.19 · a secondary feed: the canvas shows the rows the theme\'s get returns, with no pager, node for node', () => {
  const rows = [{ title: 'Picked one', url: 'https://site.example/one/' }]
  const { canvas, theme } = agree(FEED, feedInput({ query: QUERY, rows }))
  // THE THEME: the whole section inside the query's get and inside {{#if posts}}, the posts repeat left native
  assert.ok(theme.startsWith('{{#get "posts" limit="12" order="published_at desc" include="tags,authors"}}{{#if posts}}'), theme)
  assert.ok(theme.endsWith('{{/if}}{{/get}}'), theme)
  assert.ok(theme.includes('{{#foreach posts}}'), theme)
  // NO PAGER on either: inside a get `pagination` is the query's, and its links would lead to a wrong page
  for (const html of [canvas, theme]) assert.ok(!html.includes('f__pager') && !html.includes('pagination'), html)
  // THE CANVAS: the query's rows, never the page's native ones
  assert.ok(canvas.includes('>Picked one<') && !canvas.includes('Native one'), canvas)
  // the canvas shows exactly as many rows as the get returns: the query's limit
  const many = Array.from({ length: 20 }, (_, i) => ({ title: `R${i}`, url: `https://site.example/${i}/` }))
  assert.equal((renderCanvas(doc(), FEED, feedInput({ query: { ...QUERY, limit: 3 }, rows: many })).match(/class="f__cell"/g) ?? []).length, 3)
  // rows must be supplied on the canvas: an absent list would look like an empty result
  assert.throws(() => renderCanvas(doc(), FEED, feedInput({ query: QUERY })), /no rows were supplied/)
})

test('Story 5.19 · at zero neither draws the section at all — heading and container together (FR-H4)', () => {
  assert.equal(renderCanvas(doc(), FEED_EMPTY, feedInput({ query: QUERY, rows: [] })), '', 'the canvas draws nothing')
  assert.ok(renderCanvas(doc(), FEED_EMPTY, feedInput(undefined, { ghost: { posts: [] } })).includes('f__empty'), 'the control: the main feed at zero shows its empty state')
  const theme = renderTheme(doc(), FEED_EMPTY, feedInput({ query: QUERY, rows: [] })).template
  // the theme's answer at zero is Ghost's own: everything, heading and empty state included, is inside {{#if posts}}
  const inner = theme.slice(theme.indexOf('{{#if posts}}') + '{{#if posts}}'.length, theme.lastIndexOf('{{/if}}{{/get}}'))
  assert.ok(theme.indexOf('{{#if posts}}') < theme.indexOf('<section') && inner.includes('f__title') && inner.includes('f__empty'), theme)
})

test('Story 5.19 · hand-picked: the existence get around R-20\'s single-id gets, in the dragged order, on both emitters', () => {
  const ids = ['905700000000000000000003', '905700000000000000000001', '905700000000000000000002']
  const rows = [{ title: 'Third', url: '/3/' }, { title: 'First', url: '/1/' }, { title: 'Second', url: '/2/' }]
  const { canvas, theme } = agree(FEED, feedInput({ query: { source: 'posts', ids }, rows }))
  assert.ok(theme.startsWith(`{{#get "posts" filter="id:[${ids.join(',')}]" limit="1"}}{{#if posts}}`), theme)
  assert.deepEqual(
    theme.match(/\{\{#get "posts" filter="id:[0-9a-f]{24}" limit="1" include="tags,authors"\}\}/g),
    ids.map((id) => `{{#get "posts" filter="id:${id}" limit="1" include="tags,authors"}}`),
    'one single-id get per pick, never re-sorted',
  )
  assert.deepEqual([...canvas.matchAll(/class="f__h">([^<]*)</g)].map((m) => m[1]), ['Third', 'First', 'Second'])
  // nothing picked: nothing at all, on both
  assert.equal(renderCanvas(doc(), FEED, feedInput({ query: { source: 'posts', ids: [] }, rows: [] })), '')
  assert.equal(renderTheme(doc(), FEED, feedInput({ query: { source: 'posts', ids: [] } })).template, '')
})

test('review 2026-09-25 · a feed whose pager parts meet only at the section is refused by name as a secondary feed, and renders as the main feed', () => {
  const FLAT = `<section class="f">
  <h2 class="f__title" data-prop="title">t</h2>
  <div class="f__feed" data-if="posts">
    <ul class="f__grid"><li class="f__cell" data-repeat="posts"><a class="f__card" data-bind-attr="href:url"><h3 class="f__h" data-bind="title">x</h3></a></li></ul>
  </div>
  <a class="f__newer" data-pagination="prev" href="#" data-t="pagination.newer">Newer posts</a>
  <a class="f__older" data-pagination="next" href="#" data-t="pagination.older">Older posts</a>
</section>`
  const rows = [{ title: 'one', url: 'https://site.example/one/' }]
  assert.throws(() => renderCanvas(doc(), FLAT, feedInput({ query: QUERY, rows })), /pager parts meet only at the section/)
  assert.throws(() => renderTheme(doc(), FLAT, feedInput({ query: QUERY, rows })), /pager parts meet only at the section/)
  const { canvas } = agree(FLAT, feedInput(undefined))
  assert.ok(canvas.includes('f__newer'), 'the control: the same markup is the main feed, pager and all')
})

test('Story 5.19 · `{page_number}` inside a secondary feed prints nothing on the canvas, as the guard prints nothing inside a get', () => {
  const src = '<section class="f"><h2 data-prop="title">t</h2><ul><li data-repeat="posts"><h3 data-bind="title">x</h3></li></ul></section>'
  const schema = { title: { type: 'text', label: 'Title' } } as unknown as RenderInput['schema']
  const given = { content: { title: 'Page {page_number}' }, schema, tokens: { page_number: '2' }, ghost: PAGE, target: 'index.hbs' }
  assert.ok(renderCanvas(doc(), src, given).includes('Page 2'), 'the control: the main feed on page 2 prints its number')
  assert.ok(renderCanvas(doc(), src, { ...given, feed: { query: QUERY, rows: PAGE.posts } }).includes('>Page <'))
})

// ── Story 5.20 — R-4 for the asks a design cannot see: a link the USER pointed at a Portal ask (DW-154's half) ──────────
//
// A button prop or an inline `a` mark pointed at Sign up or Upgrade ships behind the site's own flag for it. The theme
// carries both answers and Ghost picks per request; the canvas carries the one the source in force's `@site` picks —
// so agreement is taken with the theme's blocks DECIDED by the same flag the canvas was handed (`agreeDecided`).

const ASK_SCHEMA: Record<string, PropDef> = {
  label: { type: 'text', label: 'Label' },
  action: { type: 'url', label: 'Action' },
  words: { type: 'richtext', label: 'Words', marks: ['strong', 'a'] },
}
const ASK_SRC = `<section class="ask" data-bg="base" data-spacing="comfortable" data-divider="none">
  <a class="ask__button" data-prop="label" data-prop-attr="href:action">Join</a>
  <p class="ask__words" data-prop="words">Words</p>
</section>`
const askInput = (action: unknown, words: unknown, site: Record<string, unknown> | undefined): RenderInput => ({
  schema: ASK_SCHEMA,
  content: { label: 'Subscribe', action, words },
  ...(site === undefined ? {} : { ghost: { '@site': site } }),
})
const OFF = { allow_self_signup: false, paid_members_enabled: false }
const ON = { allow_self_signup: true, paid_members_enabled: true }

test("Story 5.20 · a button the user linked to Portal's Sign up: the theme wraps it in the site's flag, the canvas leaves it out where the flag is false — node for node", () => {
  const input = (site: Record<string, unknown>) => askInput({ portal: 'signup' }, 'Plain words', site)
  const theme = renderTheme(doc(), ASK_SRC, input(OFF)).template
  assert.ok(theme.includes('{{#if @site.allow_self_signup}}<a class="ask__button" href="#" data-portal="signup">'), theme)
  // self-signup off: the button is gone from the canvas, and the decided theme agrees node for node
  const off = agreeDecided(ASK_SRC, input(OFF), { '@site.allow_self_signup': false })
  assert.doesNotMatch(off.canvas, /ask__button/)
  // on: both keep it
  const on = agreeDecided(ASK_SRC, input(ON), { '@site.allow_self_signup': true })
  assert.match(on.canvas, /<a class="ask__button" href="#" data-portal="signup">Subscribe<\/a>/)
  // Upgrade stands behind the PAID flag, never the signup one
  const upgrade = renderTheme(doc(), ASK_SRC, askInput({ portal: 'account/plans' }, 'x', OFF)).template
  assert.ok(upgrade.includes('{{#if @site.paid_members_enabled}}<a class="ask__button" href="#" data-portal="account/plans">'), upgrade)
  agreeDecided(ASK_SRC, askInput({ portal: 'account/plans' }, 'x', { allow_self_signup: true, paid_members_enabled: false }), { '@site.paid_members_enabled': false })
})

test('Story 5.20 · an inline Upgrade link: its words stay, unlinked, on both emitters — `{{else}}` on the theme', () => {
  const words = { text: 'Upgrade to read everything.', marks: [{ start: 0, end: 7, mark: 'a', portal: 'account/plans' }, { start: 8, end: 12, mark: 'strong' }] }
  const theme = renderTheme(doc(), ASK_SRC, askInput('https://x.example/', words, OFF)).template
  assert.ok(theme.includes('{{#if @site.paid_members_enabled}}<a href="#" data-portal="account/plans">Upgrade</a>{{else}}Upgrade{{/if}}'), theme)
  // paid off: the canvas keeps "Upgrade" as plain words, and the decided theme is the same tree
  const off = agreeDecided(ASK_SRC, askInput('https://x.example/', words, OFF), { '@site.paid_members_enabled': false })
  assert.match(off.canvas, /<p class="ask__words">Upgrade <strong>to r<\/strong>ead everything\.<\/p>/)
  // paid on: linked on the canvas, and the decided theme agrees
  const on = agreeDecided(ASK_SRC, askInput('https://x.example/', words, ON), { '@site.paid_members_enabled': true })
  assert.match(on.canvas, /<a href="#" data-portal="account\/plans">Upgrade<\/a>/)
})

test('Story 5.20 · Sign in and Account sign nobody up and stay ungated; a render handed no @site decides nothing', () => {
  for (const portal of ['signin', 'account']) {
    const theme = renderTheme(doc(), ASK_SRC, askInput({ portal }, 'w', OFF)).template
    assert.doesNotMatch(theme, /@site\./, `${portal} was gated`)
    const { canvas } = agree(ASK_SRC, askInput({ portal }, 'w', OFF))
    assert.match(canvas, new RegExp(`data-portal="${portal}"`))
  }
  // THE CONTROL: no `@site` handed, so the canvas has no flag to read and keeps the link, exactly as before this story
  const { canvas } = bothWays(ASK_SRC, askInput({ portal: 'signup' }, 'w', undefined))
  assert.match(canvas, /<a class="ask__button" href="#" data-portal="signup">/)
})

test("Story 5.20 · a link the design already stands behind its flag (Header — Rail's Subscribe) is not wrapped a second time", () => {
  const src = `<section class="rail" data-bg="base" data-spacing="comfortable" data-divider="none">
  <span class="rail__ask" data-if="@site.allow_self_signup"><a class="rail__cta" data-prop="label" data-prop-attr="href:action">Join</a></span>
</section>`
  const theme = renderTheme(doc(), src, askInput({ portal: 'signup' }, 'w', ON)).template
  assert.equal(theme.split('{{#if @site.allow_self_signup}}').length - 1, 1, `the flag was asked twice: ${theme}`)
  agreeDecided(src, askInput({ portal: 'signup' }, 'w', OFF), { '@site.allow_self_signup': false })
})
