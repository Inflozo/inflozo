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
import { IMAGE_SIZES, PORTAL_ACTIONS, safeCssColor, safeUrl } from '@inflozo/library'
import { PAGE_NUMBER_HBS, allowedMarks, assertBindableAttr, bindExpr, linkAttributes, readMarks, renderCanvas, renderTheme as renderThemeRaw } from './index.ts'
import type { MarkNode } from './index.ts'
import { iconDrawing } from '@inflozo/library/icons'
import type { IconLookup } from '@inflozo/library'
import type { RenderInput } from './index.ts'

const doc = () => new JSDOM('<body></body>').window.document

/** Story 4.6 — FR-H8's guard is `{{#if}}` and nothing else: every theme this suite emits is scanned */
const renderTheme: typeof renderThemeRaw = (d, src, input) => {
  const out = renderThemeRaw(d, src, input)
  for (const text of [out.template, ...Object.values(out.partials)]) {
    assert.ok(!/\{\{#has|\{\{#unless/.test(text), `a guard other than {{#if}} was emitted: ${text}`)
  }
  return out
}

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
    // the mark and the `url` prop share one record and one attribute function — pin the mark's half too
    for (const action of Object.keys(PORTAL_ACTIONS)) {
      const portal = render({ body: { text: 'read this', marks: [{ start: 0, end: 4, mark: 'a', portal: action }] } })
      assert.ok(portal.includes(`<a href="#" data-portal="${action}">read</a>`), portal)
    }
    const outside = render({ body: { text: 'read this', marks: [{ start: 0, end: 4, mark: 'a', portal: 'upgrade' }] } })
    assert.doesNotMatch(outside, /href=|data-portal/, `a Portal action outside the four reached a mark: ${outside}`)
    const search = render({ body: { text: 'read this', marks: [{ start: 0, end: 4, mark: 'a', search: true }] } })
    assert.match(search, /<a href="#" data-ghost-search(="")?>read<\/a>/, search) // the DOM serialises a valueless attribute as =""; the theme writes it bare
    const locked = render({ body: { ...link({}).body, plainText: true } })
    assert.ok(!/<a/.test(locked) && locked.includes('read this'), `FR-Q3's lock did not strip the mark: ${locked}`)
    const outOfRange = render({ body: { text: 'ab', marks: [{ start: 0, end: 9, mark: 'strong' }] } })
    assert.ok(!/<strong/.test(outOfRange), `a mark past the end of the text was emitted: ${outOfRange}`)
    const malformed = render({ body: { text: 'ab', marks: 'strong' as unknown as [] } })
    assert.ok(malformed.includes('ab'), `a malformed mark list threw instead of rendering the text: ${malformed}`)
  }
})

// ── (1) and the markup sink, on the one place marks are READ from markup: a paste (Story 5.3) ──
test('AD-36 — a pasted img onerror, script, javascript: link and span style arrive as text; b, i, u and an https link survive where allowed', () => {
  const window = new JSDOM('').window.document.defaultView
  const html = '<b>Bold</b> <i>it</i> <u>un</u> <a href="https://x.example/">ok</a> <a href="javascript:window.__pwned=1">bad</a><img src="/x" onerror="window.__pwned=2"><script>window.__pwned=3</script><span style="color:red">red</span>'
  // DOMParser's document is inert: nothing in it runs or loads
  const body = new window.DOMParser().parseFromString(html, 'text/html').body as unknown as MarkNode
  const schema = { body: { type: 'richtext', label: 'Body', marks: ['strong', 'em', 'u', 'a'] } } as unknown as RenderInput['schema']
  const pasted = readMarks(body, allowedMarks(schema?.['body']), true)
  assert.equal((window as unknown as { __pwned?: unknown }).__pwned, undefined, 'the parsed paste ran something')
  assert.equal(pasted.text, 'Bold it un ok badred')
  for (const out of [
    renderCanvas(doc(), '<p data-prop="body">x</p>', { content: { body: pasted }, schema }),
    renderTheme(doc(), '<p data-prop="body">x</p>', { content: { body: pasted }, schema }).template,
  ]) {
    assert.doesNotMatch(out, /<img|<script|<span|style=|onerror|javascript:/, `a paste vector reached markup: ${out}`)
    // ...and the legitimate case still works
    assert.ok(out.includes('<strong>Bold</strong> <em>it</em> <u>un</u> <a href="https://x.example/">ok</a> badred'), out)
  }
  // a field allowing only links keeps only the https link; a field allowing none keeps only the words
  assert.deepEqual(readMarks(body, ['a'], true).marks, [{ start: 11, end: 13, mark: 'a', href: 'https://x.example/' }])
  assert.deepEqual(readMarks(body, allowedMarks({ type: 'text', label: 'Headline' }), false), { text: 'Bold it un ok badred' })
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

// ── AD-5's ONE deliberate exception, proved narrow (Story 5.16a). `PAGE_NUMBER_HBS` is the only string this
//    codebase splices into user text unescaped. Each vector asserts the attack is inert AND that the
//    legitimate case still works, which is what stops a "fix" from closing the feature instead of the hole. ──
const pageSchema = { h: { type: 'richtext', label: 'H' } } as unknown as RenderInput['schema']
const pageTheme = (text: string) => renderTheme(doc(), '<p data-prop="h">x</p>', { schema: pageSchema, content: { h: text } }).template

test('AD-5 exception — a typed {{page_number}} emits the constant BETWEEN entities, never a triple-stache', () => {
  // The interleaving is the whole mechanism: substituting first would emit `&#123;&#123;…` and lose the
  // expression; escaping first would emit `{{{…}}}`, a triple-stache that ships unescaped HTML on the site.
  const out = pageTheme('Page {{page_number}}')
  assert.ok(out.includes(`Page &#123;${PAGE_NUMBER_HBS}&#125;`), `the braces the user typed must stay entities: ${out}`)
  assert.ok(!/\{\{\{/.test(out), `a triple-stache reached the output: ${out}`)
  // and the legitimate case still works beside it
  assert.ok(pageTheme('Page {page_number}').includes(`Page ${PAGE_NUMBER_HBS}`), pageTheme('Page {page_number}'))
})

test('AD-5 exception — a typed Handlebars path ships fully escaped; only OUR constant is ever raw', () => {
  const out = pageTheme('{{@root.pagination.page}} and {{pagination.page}}')
  assert.ok(!/\{\{[^&]/.test(out), `user-typed Handlebars reached the output live: ${out}`)
  assert.ok(out.includes('&#123;&#123;@root.pagination.page&#125;&#125;'), out)
  // the constant is a MODULE constant and cannot carry a character the user typed: prove the one raw
  // string in the output is exactly it, and nothing else
  const live = pageTheme('{{@root.pagination.page}} {page_number}').split('{{').length - 1
  // derived from the constant, never written down: it is one string and its own mustache count
  assert.equal(live, PAGE_NUMBER_HBS.split('{{').length - 1, 'the only live mustaches are the one constant\'s')
})

test('AD-5 exception — {page_number} in a link\'s attributes is NOT substituted, on either emitter', () => {
  // `escapeUserText` is called in exactly two places and only the text one substitutes. A link record is
  // never token-substituted, so a page number in an href or a title is the characters the user typed.
  const src = '<a data-prop="h" data-prop-attr="href:link">x</a>'
  const content = { h: 'words', link: { href: 'https://ok.example/{page_number}', newTab: true } }
  const theme = renderTheme(doc(), src, { schema: pageSchema, content, tokens: { page_number: '2' } }).template
  const canvas = renderCanvas(doc(), src, { schema: pageSchema, content, tokens: { page_number: '2' } })
  for (const [name, out] of [['theme', theme], ['canvas', canvas]] as const) {
    assert.ok(out.includes('https://ok.example/&#123;page_number&#125;') || out.includes('https://ok.example/{page_number}'),
      `${name} must keep the href's braces as typed, never substituted: ${out}`)
    assert.ok(!out.includes('https://ok.example/2'), `${name} substituted into an attribute sink: ${out}`)
    assert.ok(!/href="[^"]*\{\{/.test(out), `${name} put a live mustache in an href: ${out}`)
  }
})

test('AD-5 exception — {page_number} in a module string override is NOT substituted into its data-i18n-* attribute, on either emitter', () => {
  // The THIRD attribute sink, found at review: `stampStrings` parks a customer's S5 override through `UserText`
  // for a `data-i18n-*` attribute. Executed before the fix, the theme emitted the guarded constant raw inside it.
  const src = '<section class="s"><div class="cd" data-module="countdown">·</div></section>'
  const input = { strings: { 'countdown.ended': 'ended on page {page_number}' }, tokens: { page_number: '2' } }
  const theme = renderTheme(doc(), src, input).template
  const canvas = renderCanvas(doc(), src, input)
  assert.ok(theme.includes('data-i18n-ended="ended on page &#123;page_number&#125;"'), theme)
  assert.ok(!/data-i18n-[a-z]+="[^"]*\{\{/.test(theme), `a live mustache reached a data-i18n-* attribute: ${theme}`)
  assert.ok(canvas.includes('data-i18n-ended="ended on page {page_number}"'), canvas)
})

test('AD-5 exception — a C0 character beside the token is still dropped, and the token still substitutes', () => {
  const out = pageTheme('Page\u0000 {page_number}\u0007!')
  assert.ok(out.includes(`Page ${PAGE_NUMBER_HBS}!`), `the C0 characters must be dropped, the token kept: ${JSON.stringify(out)}`)
  assert.ok(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(out), `a control character survived: ${JSON.stringify(out)}`)
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

test('a list-form attribute binding guards on its URL entry and emits every entry', () => {
  const listed = compile('<a data-bind-attr="href:url;title:custom_excerpt" data-empty="hide">x</a>')
  assert.ok(
    /\{\{#if url\}\}/.test(listed) && !/\{\{#if custom_excerpt\}\}/.test(listed),
    `list-form guard is not on the URL entry: ${listed}`,
  )
  assert.ok(
    /href="\{\{url\}\}"/.test(listed) && /title="\{\{custom_excerpt\}\}"/.test(listed),
    `list form dropped an entry: ${listed}`,
  )
})

// ═══ Story 4.5 — every new sink, closed by allow-list in the shared core ═══
// Each vector is asserted inert on BOTH emitters beside the legitimate case that must still work.

const linkSrc = '<a class="l" data-prop="label" data-prop-attr="href:link">x</a>'
const linkOn = (link: unknown) => ({
  canvas: renderCanvas(doc(), linkSrc, { content: { label: 'Go', link } }),
  theme: renderTheme(doc(), linkSrc, { content: { label: 'Go', link } }).template,
})

test('AD-36 · a Portal action outside the four is an unset link; the four still compile, Upgrade as account/plans', () => {
  for (const hostile of ['upgrade', 'signup/x" onclick="y', '__proto__', 'constructor']) {
    for (const html of Object.values(linkOn({ portal: hostile }))) {
      assert.doesNotMatch(html, /data-portal|onclick|href=/, `${hostile} reached the link: ${html}`)
    }
  }
  for (const action of ['signup', 'signin', 'account', 'account/plans']) {
    for (const html of Object.values(linkOn({ portal: action }))) assert.ok(html.includes(`href="#" data-portal="${action}"`), html)
  }
})

test('AD-36 · a javascript: link record is #, and an https one is untouched', () => {
  for (const html of Object.values(linkOn({ href: 'JaVaScRiPt:alert(1)' }))) assert.ok(html.includes('href="#"') && !/javascript/i.test(html), html)
  for (const html of Object.values(linkOn({ href: 'https://ok.example/a?b=1' }))) assert.ok(html.includes('href="https://ok.example/a?b=1"'), html)
})

test('AD-36 · a search that is not exactly true is an unset link; true opens Ghost search', () => {
  for (const bad of ['true', 1, 'data-x', null]) {
    for (const html of Object.values(linkOn({ search: bad }))) assert.doesNotMatch(html, /data-ghost-search|href=/, html)
  }
  for (const html of Object.values(linkOn({ search: true }))) assert.ok(html.includes('href="#" data-ghost-search'), html)
})

test('AD-36 · a rel outside the list is dropped and the three it offers survive, sorted', () => {
  assert.deepEqual(linkAttributes({ href: '/a', rel: ['nofollow', 'noopener" onclick="x', 'opener', 'sponsored'] }), { href: '/a', rel: 'nofollow sponsored' })
  for (const html of Object.values(linkOn({ href: '/a', rel: ['x" onclick="y', 'noreferrer'] }))) {
    assert.ok(html.includes('rel="noreferrer"') && !html.includes('onclick'), html)
  }
})

const iconSrc = '<span class="i" data-prop="icon"></span>'
const iconOn = (icon: unknown, icons: IconLookup = iconDrawing) => {
  const input: RenderInput = { content: { icon }, schema: { icon: { type: 'icon', label: 'Icon' } }, icons }
  return { canvas: renderCanvas(doc(), iconSrc, input), theme: renderTheme(doc(), iconSrc, input).template }
}

test('AD-36 · an icon name carrying markup is an empty slot; a name in the set draws', () => {
  for (const hostile of ['"><script>alert(1)</script>', 'rocket" onload="x', '{{@site.title}}', '__proto__']) {
    for (const html of Object.values(iconOn(hostile))) assert.equal(html, '<span class="i"></span>', `${hostile}: ${html}`)
  }
  for (const html of Object.values(iconOn('rocket'))) assert.match(html, /^<span class="i"><svg [^>]*><path d="[^"]+"><\/path>/)
})

test('AD-36 · a lookup handing back a hostile d or an extra attribute draws nothing; a sound drawing draws', () => {
  const lookups: IconLookup[] = [
    () => [['path', { d: 'M0 0"></path><script>alert(1)</script><path d="' }]],
    () => [['path', { d: 'M0 0h24', onload: 'alert(1)' }]],
    () => [['path', { d: 'M0 0h24', stroke: 'url(javascript:x)' }]],
    () => [['script', { d: 'M0 0' }]],
    () => [['path', { d: '{{@site.title}}' }]],
    () => [['path', { d: 'M0 0', fill: 'currentColor', stroke: 'none' }]],
  ]
  // the last is legitimate in outline; asked for as a FILLED key a stroke is not an attribute it may carry
  for (const [i, icons] of lookups.entries()) {
    const name = i === lookups.length - 1 ? 'heart-filled' : 'rocket'
    for (const html of Object.values(iconOn(name, icons))) assert.equal(html, '<span class="i"></span>', `lookup ${i}: ${html}`)
  }
  const sound: IconLookup = () => [['path', { d: 'M0 0h24', fill: 'currentColor', stroke: 'none', opacity: '.5' }]]
  for (const html of Object.values(iconOn('rocket', sound))) assert.ok(html.includes('<path d="M0 0h24" fill="currentColor" opacity=".5" stroke="none"></path>'), html)
})

test('AD-36 · a no-value-locked universal writes no attribute, whatever is stored or authored; a narrowed one writes its value', () => {
  const src = '<section class="s" data-bg="accent" data-spacing="comfortable" data-divider="none"><p>x</p></section>'
  const locked: RenderInput = { controlSchema: [], universals: { bg: { values: [], reason: 'r' } }, controls: { bg: 'surface' } }
  for (const html of [renderCanvas(doc(), src, locked), renderTheme(doc(), src, locked).template]) {
    assert.doesNotMatch(html, /data-bg/, html)
    assert.match(html, /data-spacing="comfortable"/)
  }
  const narrowed: RenderInput = { controlSchema: [], universals: { bg: { values: ['base', 'surface'], reason: 'r' } }, controls: { bg: 'surface' } }
  assert.match(renderTheme(doc(), src, narrowed).template, /data-bg="surface"/)
})

test('AD-36 · an item title carrying {{title}} ships inert in the theme and literal on the canvas', () => {
  const src = '<ul><li data-items="items"><span data-prop="items[].title">t</span></li></ul>'
  const input: RenderInput = { content: { items: [{ title: 'Notes on {{title}}' }, { title: 'ok' }] }, schema: { items: { type: 'array', label: 'Items' }, 'items[].title': { type: 'text', label: 'Title' } } }
  const theme = renderTheme(doc(), src, input).template
  assert.ok(theme.includes('Notes on &#123;&#123;title&#125;&#125;') && !/\{\{title\}\}/.test(theme), theme)
  assert.ok(renderCanvas(doc(), src, input).includes('Notes on {{title}}'))
  assert.ok(theme.includes('>ok<'))
})

test('AD-36 · a stored control name carrying a quote is stamped nowhere; a schema name that is not a control name refuses', () => {
  const src = '<section class="s" data-card="flat"><p>x</p></section>'
  const input: RenderInput = {
    controlSchema: [{ name: 'card', type: 'segmented', label: 'Card', group: 'style', values: ['flat', 'raised'], default: 'flat' }],
    controls: { 'card" onload="alert(1)': 'raised', card: 'raised"><script>' },
  }
  for (const html of [renderCanvas(doc(), src, input), renderTheme(doc(), src, input).template]) {
    assert.doesNotMatch(html, /onload|script/, html)
    assert.match(html, /data-card="flat"/)
  }
  // …and a name the page or Ghost owns (Portal's members actions, the visitor's mode, Koenig's, a translation's)
  for (const name of ['card" onload="x', 'items', 'Card', 'portal', 'mode', 'members-signout', 'kg-width', 'i18n-days']) {
    const bad: RenderInput = { controlSchema: [{ ...input.controlSchema![0]!, name }] }
    assert.throws(() => renderCanvas(doc(), src, bad), /AD-36: control/)
    assert.throws(() => renderTheme(doc(), src, bad), /AD-36: control/)
  }
  // and a schema VALUE that is not a closed value never becomes an attribute
  const hostileValue: RenderInput = { controlSchema: [{ ...input.controlSchema![0]!, values: ['{{x}}'], default: '{{x}}' }] }
  assert.doesNotMatch(renderTheme(doc(), src, hostileValue).template, /\{\{x\}\}|data-card/)
})

// ── Story 4.9 — a string override is USER TEXT on its way into an attribute Handlebars parses. S5 stamps a module's js
//    keys on its mount from the handed strings, and an override may carry a brace, so the theme writes each one
//    through `UserText`: `{` becomes `&#123;`, Handlebars sees no mustache, the browser decodes the entity, and
//    `core` reads `{count}` intact. ──
test('AD-36 / AD-5 — a string override carrying {{#each}} ships inert on the mount, and {count} still substitutes in core', () => {
  const src = '<section class="s"><div class="cd" data-module="countdown">·</div></section>'
  const theme = renderTheme(doc(), src, { strings: { 'countdown.ended': '{{#each}}x' } }).template
  assert.ok(theme.includes('data-i18n-ended="&#123;&#123;#each&#125;&#125;x"'), theme)
  assert.ok(!theme.includes('{{#each'), `a live block helper reached the .hbs: ${theme}`)
  // the legitimate case beside it: the browser decodes the attribute, and core's translate (modules/core.js,
  // proved on the shipped bytes by modules/core.test.mjs) substitutes {count} in what it reads
  const mount = new JSDOM(`<body>${theme}</body>`).window.document.querySelector('.cd')
  const days = mount?.getAttribute('data-i18n-days') ?? ''
  assert.equal(days, '{count} days')
  assert.equal(mount?.getAttribute('data-i18n-ended'), '{{#each}}x', 'the browser decodes what the theme wrote')
  const coreTranslate = (text: string, params: Record<string, unknown>) =>
    text.replace(/\{([A-Za-z0-9_]+)\}/g, (whole, name: string) => (Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : whole))
  assert.equal(coreTranslate(days, { count: 3 }), '3 days')
  // and the canvas, which puts its output into a DOM, shows the user their own braces as characters
  assert.ok(renderCanvas(doc(), src, { strings: { 'countdown.ended': '{{#each}}x' } }).includes('data-i18n-ended="{{#each}}x"'))
})

// ── Story 4.10 — the new value grammars: a condition path, a member state, the valueless arms and Portal's two
//    attributes, the render's member and show-to, and a fixed query. Each hostile value refuses before it reaches
//    any syntax, and its legitimate neighbour still renders. ──
test('AD-36 (2) · a crafted condition, member state or valueless attribute refuses; the legitimate ones render', () => {
  const hostile: [string, RegExp][] = [
    ['<p data-if="title}}{{#each @site}}x">·</p>', /AD-36: data-if/],
    ['<p data-if="title&quot; onload=&quot;x">·</p>', /AD-36: data-if/],
    ['<p data-members="paid}}{{evil">·</p>', /AD-36: data-members/],
    ['<p data-members="comped">·</p>', /AD-36: data-members/],
    ['<div><p data-if="title">·</p><p data-else="{{title}}">·</p></div>', /AD-36: data-else/],
    ['<form data-members-form="subscribe"><input data-members-email="{{@member.email}}"></form>', /AD-36: data-members-email/],
    ['<p data-members-error="x">·</p>', /AD-36: data-members-error/],
  ]
  for (const [src, re] of hostile) {
    assert.throws(() => renderCanvas(doc(), src, { ghost: { title: 't' } }), re, `canvas: ${src}`)
    assert.throws(() => renderTheme(doc(), src, {}), re, `theme: ${src}`)
  }
  const ok = renderTheme(doc(), '<div><p data-if="title">·</p><p data-else>–</p><b data-members="free">·</b><form data-members-form="signup"><input data-members-email><p data-members-error></p></form></div>', {}).template
  assert.ok(ok.includes('{{#if title}}<p>·</p>{{else}}<p>–</p>{{/if}}') && ok.includes('{{#if @member}}{{#if @member.paid}}{{else}}<b>·</b>{{/if}}{{/if}}') && ok.includes('data-members-email=""'), ok)
})

test('AD-36 · a member or show-to that is not a closed state refuses on both emitters; the closed ones render', () => {
  const src = '<section class="s"><p>·</p></section>'
  for (const bad of [{ member: 'everyone' }, { member: 'comped' }, { member: '{{@member}}' }, { visibility: 'members' }, { visibility: 'paid}}' }]) {
    for (const render of [renderCanvas, renderTheme]) {
      assert.throws(() => render(doc(), src, bad as RenderInput), /is not a (member state|visitor the canvas previews)/, JSON.stringify(bad))
    }
  }
  for (const member of ['anonymous', 'free', 'paid'] as const) assert.doesNotThrow(() => renderCanvas(doc(), src, { member, visibility: 'everyone' }))
})

test('AD-36 · a fixed flag that is not exactly true is refused at emission, and a hand-picked list cannot be fixed', () => {
  const src = '<ul><li data-repeat="latest"><span data-bind="title">·</span></li></ul>'
  const at = (b: Record<string, unknown>) => () => renderTheme(doc(), src, { dataBindings: { latest: b as never } })
  assert.throws(at({ source: 'posts', limit: 1, order: 'published_at desc', fixed: 'true' }), /bad-get-fixed/)
  assert.throws(at({ source: 'posts', ids: ['a1'], fixed: true }), /bad-get-fixed/)
  assert.throws(at({ source: 'posts', limit: 1, fixed: true }), /bad-get-fixed/)
  assert.ok(at({ source: 'posts', limit: 1, order: 'published_at desc', fixed: true })().template.includes('{{#get "posts" limit="1" order="published_at desc" include="tags,authors"}}'))
})

// ── Story 5.19 — the Data group's Source: a stored value reaches a {{#get}} hash ONLY through the fold's grammar ──────
// A crafted slug, id or source is IGNORED by the fold, so the declaration (or the default) is emitted; and the same value
// handed to the emitter directly as a query is REFUSED by name, never interpolated. The legitimate value emits, quoted.
test('AD-36 · a crafted Source value is inert through the fold, refused when handed as a query, and the legitimate one emits', () => {
  const src = '<ul><li data-repeat="latest"><span data-bind="title">·</span></li></ul>'
  const declared = { latest: { source: 'posts', limit: 3, order: 'published_at desc' } }
  const theme = (data: Record<string, unknown>) => renderTheme(doc(), src, { dataBindings: declared, data: { latest: data } }).template
  const plain = theme({})
  assert.ok(plain.includes('{{#get "posts" limit="3" order="published_at desc" include="tags,authors"}}'), plain)
  for (const crafted of [
    { source: 'tag', tag: "x'}}{{#get \"posts\" limit=\"all\"}}" },
    { source: 'author', author: 'x" }}<script>alert(1)</script>' },
    { source: 'picked', picks: [{ id: '5f00"}}<script>', title: 't' }, { id: 'not-24-hex', title: 't' }] },
    { source: 'featured}}{{#get "tiers"' },
  ]) {
    const out = theme(crafted)
    assert.ok(!/script|limit="all"|tiers/.test(out), `a crafted value reached the theme: ${out}`)
    if (crafted.source !== 'picked') assert.equal(out, plain, `the fold did not ignore ${JSON.stringify(crafted)}`)
  }
  // …handed to the emitter directly, as a declaration or as a secondary feed's query, it is refused BY NAME
  const feedSrc = '<section class="s"><ul><li data-repeat="posts"><span data-bind="title">·</span></li></ul></section>'
  for (const query of [
    { source: 'posts', filter: "tag:'x'}}{{…'" },
    { source: 'posts', ids: ['5f00"}}<script>'] },
    { source: 'posts', filter: 'tag:x"' },
    { source: 'posts', limit: 500 },
  ]) {
    assert.throws(() => renderTheme(doc(), src, { dataBindings: { latest: query } }), /AD-36|TEMPLATE-level|bad-get/, JSON.stringify(query))
    for (const render of [renderCanvas, renderTheme]) {
      assert.throws(() => render(doc(), feedSrc, { feed: { query, rows: [] } }), /AD-36|TEMPLATE-level|bad-get/, `feed ${JSON.stringify(query)}`)
    }
  }
  // a secondary feed is a posts query or nothing
  assert.throws(() => renderTheme(doc(), feedSrc, { feed: { query: { source: 'tiers' } } }), /posts query/)
  // …and the legitimate values emit, quoted, on both paths
  assert.ok(theme({ source: 'tag', tag: 'field-notes' }).includes(`filter="tag:'field-notes'"`))
  assert.ok(theme({ source: 'author', author: 'rosa-menendez' }).includes(`filter="authors:'rosa-menendez'"`))
  const good = renderTheme(doc(), feedSrc, { feed: { query: { source: 'posts', limit: 6, order: 'published_at asc', filter: "tag:'craft'" } } }).template
  assert.ok(good.startsWith(`{{#get "posts" filter="tag:'craft'" limit="6" order="published_at asc" include="tags,authors"}}{{#if posts}}`), good)
})
