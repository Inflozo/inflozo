// AD-36's vectors, as a runnable check — moved here from `tools/stress/` by Story 4.2, for the
// reason `agreement.test.ts` gives: a proof in `tools/stress/` never runs in CI.
//
// Each of these was EXECUTED against this pipeline in Round 4 and worked. They are the regression
// test for the one invariant they share: an untrusted value never reaches an interpreting sink
// un-validated. AD-36's own rule is that the test is part of the invariant, and every check asserts
// the vector is inert AND that the legitimate case still works — a guard that blocks everything is
// not a guard, and the first draft of the path grammar refused `@site.logo` until a fixture caught it.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { IMAGE_SIZES, safeCssColor, safeUrl } from '@inflozo/library'
import { assertBindableAttr, bindExpr, renderCanvas, renderTheme } from './index.ts'
import type { RenderInput } from './index.ts'

const doc = () => new JSDOM('<body></body>').window.document

/** render the way a real compile does: the theme emitter, with R2-5's substitution pass run over
 *  the output (which `renderTheme` does itself when no shared `UserText` is handed in). */
const compile = (src: string, content: RenderInput['content'] = {}) =>
  renderTheme(doc(), src, { content }).template

// ── (1) a user-supplied URL reaches href with no scheme validation ───────────────
// Round 4:  content.link='javascript:alert(document.domain)' -> <a href="javascript:...">
test('javascript: in a user link is neutralised', () => {
  const out = compile('<a data-prop-attr="href:link">x</a>', { link: 'javascript:alert(document.domain)' })
  assert.ok(!/href="javascript:/i.test(out), `javascript: reached href: ${out}`)
  assert.ok(/href="#"/.test(out), `expected the inert # fallback, got: ${out}`)
})

test('data:, vbscript:, case, control-char and whitespace evasions all neutralised', () => {
  for (const [bad, why] of [
    ['data:text/html,<script>alert(1)</scr' + 'ipt>', 'data: document'],
    ['vbscript:msgbox(1)', 'vbscript:'],
    ['JaVaScRiPt:alert(1)', 'mixed case'],
    ['java\nscript:alert(1)', 'newline inside the scheme'],
    ['javascript:alert(1)', 'leading control character'],
    ['  javascript:alert(1)', 'leading whitespace'],
  ] as const) {
    assert.equal(safeUrl(bad), '#', `${why} survived: ${JSON.stringify(safeUrl(bad))}`)
  }
})

test('ordinary and relative links are untouched', () => {
  for (const good of [
    'https://ok.example/a?b=1#c',
    'http://ok.example',
    'mailto:a@b.example',
    '/about',
    '#top',
    'img/x.png',
    'tel:+441234567890',
  ]) {
    assert.equal(safeUrl(good), good, `legitimate URL was mangled: ${good}`)
  }
  const rel = compile('<a data-prop-attr="href:link">x</a>', { link: '/about' })
  assert.ok(/href="\/about"/.test(rel), `relative link broken: ${rel}`)
})

// ── (2) a design author breaks out of a helper argument into raw theme text ──────
// Round 4:  size:800"}}<script>alert(1)</script>{{"  ->  a live <script> in the emitted .hbs
test('a crafted helper argument is refused at compile time', () => {
  const attack = 'src:featureImage|img_url:m"}}<script>alert(1)</scr' + 'ipt>{{"'
  assert.throws(
    () => compile(`<img data-bind-attr='${attack}'>`),
    /AD-36/,
    'helper-arg breakout was NOT refused',
  )
})

test('quote-in-arg, brace-in-path and unknown-helper are all refused', () => {
  assert.throws(() => bindExpr('a|img_url:m"x'), /AD-36/, 'a quote in the arg must be refused')
  assert.throws(() => bindExpr('a}}{{b'), /AD-36/, 'a path containing braces must be refused')
  assert.throws(() => bindExpr('a|nosuch:1'), /AD-36/, 'an unknown helper must be refused')
})

// ── Story 4.3: `img_url:800` is not a looseness, it is a live defect ────────────
// Ghost generates a rendition per declared `image_sizes` key and returns the ORIGINAL for anything
// else, reporting nothing — so a 4000px photograph serves behind a 300px card on the customer's
// site. The grammar therefore narrows to FR-J2's five keys, and the refusal NAMES them, because the
// failure it prevents is invisible. `800` was a width, and a width was never a key.
test('a size that is not an image_sizes key is refused, naming the five keys', () => {
  for (const bad of ['800', '1600', 'medium', 'XL']) {
    assert.throws(
      () => bindExpr(`feature_image|img_url:${bad}`),
      (e: unknown) => {
        const m = (e as Error).message
        assert.match(m, /AD-36/)
        for (const k of Object.keys(IMAGE_SIZES)) assert.ok(m.includes(k), `the refusal must name "${k}": ${m}`)
        return true
      },
      `img_url:${bad} must be refused — Ghost has no rendition for it and says nothing`,
    )
  }
  // and the legitimate case still works — every key, through the same parse (AD-36's paired test)
  for (const k of Object.keys(IMAGE_SIZES)) {
    assert.equal(bindExpr(`feature_image|img_url:${k}`), `{{img_url feature_image size="${k}"}}`)
  }
})

test('the legitimate binding vocabulary is unchanged', () => {
  assert.equal(bindExpr('featureImage|img_url:m'), '{{img_url featureImage size="m"}}')
  assert.equal(bindExpr('publishedAt|date:YYYY'), '{{date publishedAt format="YYYY"}}')
  assert.equal(bindExpr('post.title'), '{{post.title}}')
  assert.equal(bindExpr('@site.logo'), '{{@site.logo}}')
})

// ── (3) a design may name any attribute, including an event handler ──────────────
// Round 4:  data-bind-attr="onload:featureImage"  ->  <div onload="{{featureImage}}">
test('event handlers, style and formaction are not bindable', () => {
  assert.throws(
    () => compile('<div data-bind-attr="onload:featureImage">x</div>'),
    /AD-36/,
    'onload binding was NOT refused',
  )
  for (const bad of ['onerror', 'onclick', 'ONLOAD', 'style', 'formaction', 'xlink:href']) {
    assert.throws(() => assertBindableAttr(bad), /AD-36/, `${bad} must not be bindable`)
  }
})

test('legitimate attribute bindings still emit', () => {
  const good = compile('<img data-bind-attr="src:featureImage">')
  assert.ok(/src="\{\{featureImage\}\}"/.test(good), `legitimate attribute binding broke: ${good}`)
})

// ── (4) a Ghost tag colour carries extra CSS declarations onto the customer's live site ──
// Round 4 / §21e: `red;}body{display:none`, `#fff;background:url(x)`, `#fff;width:100vw` and
// `#f00;/* c */color:red` were all accepted on BOTH live majors. A character filter that got lucky
// twice is not a CSS validator, so the value is PARSED and anything else falls back to the token.
test('AD-36 (4) — a hostile bound colour falls back to the pack token', () => {
  for (const hostile of [
    'red;}body{display:none',
    '#fff;background:url(x)',
    '#fff;width:100vw',
    '#f00;/* c */color:red',
    'url(https://evil.example/x)',
    'var(--anything)',
    'rgb(0,0,0);position:fixed',
    'expression(alert(1))',
  ]) {
    const v = safeCssColor(hostile, '--accent')
    assert.equal(v, 'var(--accent)', `a hostile colour survived the parser: ${JSON.stringify(v)}`)
  }
  // ...on the canvas, end to end, which is the half a build-time gate can actually reach
  const canvas = renderCanvas(doc(), '<li data-bind-style="--tag-accent:accent_color">t</li>', {
    ghost: { accent_color: 'red;}body{display:none' },
  })
  assert.ok(
    canvas.includes('style="--tag-accent: var(--accent)"'),
    `the canvas let a hostile colour into a CSS declaration: ${canvas}`,
  )
  assert.ok(!/display:none/.test(canvas), `extra declarations reached the canvas: ${canvas}`)
})

test('AD-36 (4) — a legitimate bound colour still works, in every form Ghost stores', () => {
  for (const good of ['#f0f', '#F0F0F0', '#11223344', 'rgb(255, 0, 255)', 'rgba(1,2,3,0.5)', 'hsl(300 100% 50%)']) {
    assert.equal(safeCssColor(good, '--accent'), good, `a legitimate colour was refused: ${good}`)
  }
  const canvas = renderCanvas(doc(), '<li data-bind-style="--tag-accent:accent_color">t</li>', {
    ghost: { accent_color: '#f0f' },
  })
  assert.ok(canvas.includes('style="--tag-accent: #f0f"'), `a legitimate colour was lost: ${canvas}`)
  // the theme emits AD-3's stated legal form; the value arrives at Ghost's render, which AD-36's
  // own note says no build-time gate can reach
  const theme = renderTheme(doc(), '<li data-bind-style="--tag-accent:accent_color">t</li>', {}).template
  assert.ok(
    theme.includes('style="{{#if accent_color}}--tag-accent: {{accent_color}}{{/if}}"'),
    `theme form changed: ${theme}`,
  )
})

// ── (2) again, on the three directive values that used to be interpolated into `{{#foreach}}` and
//    `{{> "…"}}` unvalidated (Story 4.2 review): the library's own grammar refuses each, by name.
test('AD-36 (2) — a crafted repeat source, limit or partial name is refused, never interpolated', () => {
  for (const src of [
    `<ul><li data-repeat='posts}}<script>alert(1)</script>{{#foreach x'>x</li></ul>`,
    `<ul><li data-repeat="posts" data-repeat-limit='3"}}<script>'>x</li></ul>`,
    `<ul><li data-repeat="posts" data-partial='p"}}<script>'>x</li></ul>`,
    `<ul><li data-repeat="posts" data-repeat-limit="abc">x</li></ul>`,
    `<ul><li data-repeat="posts" data-repeat-limit="0">x</li></ul>`,
  ]) {
    assert.throws(() => renderTheme(doc(), src, {}), /AD-36/, `theme accepted ${src}`)
    assert.throws(() => renderCanvas(doc(), src, { ghost: { posts: [{}] } }), /AD-36/, `canvas accepted ${src}`)
  }
  // ...and the legitimate case still works, with the limit carried and the partial extracted
  const good = renderTheme(doc(), `<ul><li data-repeat="posts" data-repeat-limit="3" data-partial="card">x</li></ul>`, {})
  assert.ok(good.template.includes('{{#foreach posts limit="3"}}'), good.template)
  assert.ok(good.template.includes('{{> "card"}}'), good.template)
  assert.equal(good.partials['card'], '<li>x</li>')
  assert.throws(
    () => renderTheme(doc(), `<ul><li data-repeat="posts" data-partial="card">x</li><li data-repeat="tags" data-partial="card">y</li></ul>`, {}),
    /declared twice/,
  )
})

// ── (1) on the one sink user MARKS introduce: the `a` mark's href, on both emitters ──
test('AD-36 (1) — an `a` mark is scheme-checked, its rel is an allow-list, and the lock strips it', () => {
  const schema = { body: { type: 'richtext', marks: ['a', 'strong'] } } as unknown as RenderInput['schema']
  const link = (extra: object) => ({
    body: { text: 'read this', marks: [{ start: 0, end: 4, mark: 'a', href: 'javascript:alert(1)', ...extra }] },
  })
  for (const render of [
    (c: RenderInput['content']) => renderCanvas(doc(), '<p data-prop="body">x</p>', { content: c, schema }),
    (c: RenderInput['content']) => renderTheme(doc(), '<p data-prop="body">x</p>', { content: c, schema }).template,
  ]) {
    assert.ok(render(link({})).includes('<a href="#">read</a>'), `a javascript: href survived a mark: ${render(link({}))}`)
    const out = render(link({ href: 'https://ok.example/', newTab: true, rel: ['sponsored', 'evil'] }))
    assert.ok(out.includes('<a href="https://ok.example/" target="_blank" rel="noreferrer sponsored">read</a>'), out)
    const locked = render({ body: { ...link({}).body, plainText: true } })
    assert.ok(!/<a/.test(locked) && locked.includes('read this'), `FR-Q3's lock did not strip the mark: ${locked}`)
    const outOfRange = render({ body: { text: 'ab', marks: [{ start: 0, end: 9, mark: 'strong' }] } })
    assert.ok(!/<strong/.test(outOfRange), `a mark past the end of the text was emitted: ${outOfRange}`)
    const malformed = render({ body: { text: 'ab', marks: 'strong' as unknown as [] } })
    assert.ok(malformed.includes('ab'), `a malformed mark list threw instead of rendering the text: ${malformed}`)
  }
})

test('AD-36 (4) — a separator-valid but CSS-invalid colour falls back rather than being dropped', () => {
  for (const bad of ['rgb(1/2/3)', 'rgb(1 2 3 4)', 'rgb(1,2,3,)', 'rgb(1,2)', 'hsl(1 2)', 'rgb(1, 2 3)']) {
    assert.equal(safeCssColor(bad, '--accent'), 'var(--accent)', `accepted ${bad}`)
  }
  for (const good of ['rgb(1 2 3 / 50%)', 'rgb(1 2 3)', 'hsl(120deg 50% 50% / 0.5)', 'rgba(1, 2, 3, 0.5)']) {
    assert.equal(safeCssColor(good, '--accent'), good, `refused ${good}`)
  }
})

// ── what already held, re-asserted so a future change cannot quietly undo it ──
test('AD-5 still holds — user braces ship as entities, never as a mustache', () => {
  const out = compile('<p data-prop="title">x</p>', {
    title: 'Notes on {{@site.title}} and {{#if @member}}x{{/if}}',
  })
  assert.ok(!/\{\{[^&]/.test(out), `AD-5 regression: a live mustache reached the output: ${out}`)
})

test('AD-4 still holds — a quote in a user value cannot break the attribute', () => {
  const q = compile('<a data-prop-attr="href:link">x</a>', {
    link: 'https://ok.example/"onclick="alert(1)',
  })
  assert.ok(!/onclick="alert/.test(q), `AD-4 regression: attribute break-out: ${q}`)
})

// ── FR-H8 — a media guard is on the BOUND FIELD, never on a helper argument ──────
// Not AD-36, but it lives in the same file because it is the same compiler and the same class of
// mistake: a value pulled back out of a built string instead of being carried through.
test('a date-helper text binding guards on the field, not on "format"', () => {
  const dated = compile('<time data-bind="published_at|date:YYYY" data-empty="hide">x</time>')
  assert.ok(/\{\{#if published_at\}\}/.test(dated), `guard is not on the bound field: ${dated}`)
  assert.ok(!/\{\{#if format/.test(dated), `guard was built from the helper argument: ${dated}`)
})

test('an img_url attribute binding still guards on the field', () => {
  const img = compile('<img data-bind-attr="src:feature_image|img_url:m" data-empty="hide">')
  assert.ok(/\{\{#if feature_image\}\}/.test(img), `attribute guard regressed: ${img}`)
})

test('a plain field binding still guards correctly', () => {
  const plain = compile('<p data-bind="title" data-empty="hide">x</p>')
  assert.ok(/\{\{#if title\}\}/.test(plain), `plain guard regressed: ${plain}`)
})

test('a list-form attribute binding guards on the FIRST field and emits every entry', () => {
  const listed = compile('<a data-bind-attr="href:url;title:custom_excerpt" data-empty="hide">x</a>')
  assert.ok(
    /\{\{#if url\}\}/.test(listed) && !/\{\{#if custom_excerpt\}\}/.test(listed),
    `list-form guard is not on the first field: ${listed}`,
  )
  assert.ok(
    /href="\{\{url\}\}"/.test(listed) && /title="\{\{custom_excerpt\}\}"/.test(listed),
    `list form dropped an entry: ${listed}`,
  )
})
