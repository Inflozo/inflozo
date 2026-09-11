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
  CONSUMED_DIRECTIVES,
  CONSUMED_DIRECTIVE_RE,
} from '@inflozo/library'
import type { PropDef } from '@inflozo/library'
import { REFUSED_DIRECTIVES, RENDERED_DIRECTIVES, renderCanvas, renderTheme } from './index.ts'
import type { RenderInput, RuntimeElement } from './index.ts'

const doc = () => new JSDOM('<body></body>').window.document

// Normalise the theme so it can be parsed as HTML and compared for STRUCTURE:
//   - strip Handlebars BLOCKS ({{#foreach}}, {{#if}}, {{else}}, {{/…}}): they wrap elements and have
//     no canvas counterpart by design — leaving them in would compare the emitters' differences.
//   - collapse every remaining INLINE mustache to a quote-free token X. The theme legitimately emits
//     `src="{{img_url feature_image size="800"}}"` — valid Handlebars that gscan passes 0/0, but NOT
//     valid HTML, so a raw parse mistakes the inner `size="800"` for a stray attribute. Canvas values
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
       <img class="card__img" data-bind-attr="src:feature_image|img_url:800" data-empty="hide">
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
  const src = `<section class="c"><img class="m" data-bind-attr="src:feature_image|img_url:800" data-empty="hide"><h2 class="t" data-bind="title">t</h2></section>`
  const { canvas } = bothWays(src, { ghost: { title: 'Only a title' } }) // no feature_image
  assert.ok(!/<img/.test(canvas), `canvas kept a media element with no data: ${canvas}`)
  assert.ok(/Only a title/.test(canvas), `canvas lost the sibling that DOES have data: ${canvas}`)
  const { theme } = bothWays(src, { ghost: { title: 'x', feature_image: 'y' } })
  assert.ok(/\{\{#if feature_image\}\}/.test(theme), `theme guard is not on the bound field: ${theme}`)
})

// ── The list form of data-bind-attr: every entry lands on both emitters, and the guard is the FIRST
//    entry's field. ──
test("data-bind-attr list form — the guard is the first entry's field, and a later null sets nothing", () => {
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
    `guard is not on the FIRST entry: ${theme}`,
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
    title: { type: 'richtext', marks: ['strong', 'em'] },
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
  const schema: Record<string, PropDef> = { title: { type: 'richtext', marks: ['strong', 'em'] } }
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
  const schema: Record<string, PropDef> = { sub: { type: 'richtext', tokens: ['members'] } }
  const { canvas, theme } = bothWays(`<p data-prop="sub">s</p>`, {
    schema,
    content: { sub: { text: '{members} readers, {n} left' } },
    tokens: { members: '12,000', n: '3' },
  })
  assert.ok(canvas.includes('12,000 readers'), `the declared token did not substitute: ${canvas}`)
  assert.ok(canvas.includes('{n} left'), `an undeclared token must stay literal text: ${canvas}`)
  assert.ok(theme.includes('12,000 readers'), `the declared token did not substitute: ${theme}`)
  assert.ok(theme.includes('&#123;n&#125; left'), `an undeclared token must ship inert: ${theme}`)
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
  const media = renderTheme(doc(), `<img data-bind-attr="src:feature_image|img_url:800">`, {}).template
  assert.ok(/\{\{#if feature_image\}\}/.test(media), `media did not default to hide: ${media}`)
  assert.ok(/src="\{\{img_url feature_image size="800"\}\}"/.test(media), `the attribute was guarded: ${media}`)
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
const everyDirectiveSrc = `<section class="all" data-module="cards">
     <h1 class="h" data-prop="title" data-empty="hide">t</h1>
     <a class="a" data-prop-attr="href:link">l</a>
     <article class="c" data-repeat="posts" data-repeat-limit="2" data-partial="card">
       <h2 data-bind="title">t</h2>
       <img data-bind-attr="src:feature_image|img_url:800">
       <li data-bind-style="--tag-accent:accent_color">x</li>
     </article>
   </section>`

test('no rendered directive survives — every member of RENDERED_DIRECTIVES is in the fixture', () => {
  for (const d of RENDERED_DIRECTIVES) {
    assert.ok(everyDirectiveSrc.includes(`${d}=`), `the leak fixture does not exercise ${d}`)
  }
  const input: RenderInput = {
    content: { title: 'T', link: '/x' },
    ghost: { posts: [{ title: 'a', feature_image: '/a.jpg', accent_color: '#fff' }, { title: 'b' }, { title: 'c' }] },
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
  // the limit is honoured on the canvas: three rows, limit 2, two articles
  assert.equal((canvas.match(/<article/g) ?? []).length, 2, `the canvas ignored data-repeat-limit: ${canvas}`)
  // a repeat modifier with no repeat to modify is refused, never left in
  assert.throws(() => renderCanvas(doc(), '<div data-partial="x">y</div>', {}), /modifies a data-repeat/)
  assert.throws(() => renderTheme(doc(), '<div data-repeat-limit="3">y</div>', {}), /modifies a data-repeat/)
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
