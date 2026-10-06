// Story 7.1 — the theme serializer, rule by rule (spec § The formatting contract), on jsdom trees built the way the walk
// builds them: expressions as C0 tokens, block helpers as comment markers with their role. Then the property the whole
// story rests on — formatting never changes what renders — over every case, with a broken formatter as its control.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { formatTheme, indentBy, KEEP_NL, LINE_BUDGET } from './format.ts'
import { renderTheme, Tokens, UserText } from './index.ts'
import type { MarkerRole, RuntimeElement } from './core.ts'

const doc = () => new JSDOM('<body></body>').window.document

/** One case: a tree, the tokens and user text it was built with, and markup helpers that park as the walk parks. */
function kase() {
  const d = doc()
  const tokens = new Tokens()
  const users = new UserText()
  const mark = (expr: string, role: MarkerRole) => `<!--${tokens.put(expr, role)}-->`
  return {
    tokens,
    users,
    expr: (e: string) => tokens.put(e),
    open: (e = '{{#if x}}') => mark(e, 'open'),
    els: () => mark('{{else}}', 'else'),
    close: (e = '{{/if}}') => mark(e, 'close'),
    block: (e: string) => mark(e, 'block'),
    tree(html: string): RuntimeElement {
      const root = d.createElement('div')
      root.innerHTML = html
      return root
    },
    format: (root: RuntimeElement) => formatTheme(d, root, tokens, users),
    /** what ships: formatted, every token landed, user text substituted */
    ship: (root: RuntimeElement) => users.substitute(tokens.resolve(formatTheme(d, root, tokens, users))),
    /** what shipped before this story: the serializer's text, landed the same way */
    raw: (root: RuntimeElement) => users.substitute(tokens.resolve(root.innerHTML)),
  }
}

/** The Verification sweep's normal form: block helpers removed, every whitespace run one space. */
const neutral = (s: string) => s.replace(/\{\{#[^}]*\}\}|\{\{\/[^}]*\}\}|\{\{else\}\}/g, '').replace(/[ \t\n\f\r]+/g, ' ').trim()

/** Rule 1, over any emitted text: LF only, no tab, no trailing whitespace, no blank line. */
function lines(text: string): void {
  assert.ok(!/\r|\t/.test(text), `a CR or a tab: ${JSON.stringify(text)}`)
  assert.ok(!/[ \t]$/m.test(text), `trailing whitespace: ${JSON.stringify(text)}`)
  assert.ok(!/\n[ ]*\n/.test(text), `a blank line: ${JSON.stringify(text)}`)
}

// ─── the cases, each kept for the render-neutral property below ───────────────

const CASES: { name: string; build: (k: ReturnType<typeof kase>) => RuntimeElement; want?: string }[] = [
  {
    name: 'rule 2 — block layout nests two spaces a level, whatever the source indented',
    build: (k) => k.tree('<section class="s">\n        <div class="d">\n   <p>x</p>\n</div>\n  </section>\n'),
    want: '<section class="s">\n  <div class="d">\n    <p>x</p>\n  </div>\n</section>',
  },
  {
    name: 'rule 2 — markup between a helper and its {{else}} or close sits one level in; {{else}} and the close align with the open',
    build: (k) => k.tree(`<div class="m">
      ${k.open('{{#if logo}}')}<img src="${k.expr('{{logo}}')}" alt="">${k.els()}
      <span class="w">${k.expr('{{title}}')}</span>${k.close()}
      ${k.open('{{#if @member}}{{else}}')}<a href="#">a</a>${k.close()}
    </div>`),
    want: '<div class="m">\n  {{#if logo}}\n    <img src="{{logo}}" alt="">\n  {{else}}\n    <span class="w">{{title}}</span>\n  {{/if}}\n  {{#if @member}}{{else}}\n    <a href="#">a</a>\n  {{/if}}\n</div>',
  },
  {
    name: 'rule 3 — inline: a paragraph with words is written as the serializer writes it',
    build: (k) => k.tree('<div>\n  <p>Join <strong>us</strong>!</p>\n</div>'),
    want: '<div>\n  <p>Join <strong>us</strong>!</p>\n</div>',
  },
  {
    name: 'rule 3 — inline: two spans that touch stay touching, and so does a marker against them',
    build: (k) => k.tree(`<div>
      <button><span>a</span><span>b</span></button>
      <p>${k.open()}<span>c</span>${k.close()}<span>d</span></p>
    </div>`),
    want: '<div>\n  <button><span>a</span><span>b</span></button>\n  <p>{{#if x}}<span>c</span>{{/if}}<span>d</span></p>\n</div>',
  },
  {
    name: 'rule 3 — a gap with no whitespace keeps the element inline, so no line break is added where none was',
    build: (k) => k.tree('<ul><li>a</li>\n  <li>b</li>\n</ul>'),
    want: '<ul><li>a</li>\n  <li>b</li>\n</ul>',
  },
  {
    name: 'rule 3 — inline: a whitespace run with a line break is one line break and the indentation, the closing tag\'s at the end',
    build: (k) => k.tree('<p>one\n\n        two <b>three\n   four</b>\n      </p>'),
    want: '<p>one\n  two <b>three\n    four</b>\n</p>',
  },
  {
    name: 'rule 3 — U+00A0 is not whitespace: it renders, so it is never a gap',
    build: (k) => k.tree('<div> <span>a</span>\n</div>'),
    want: '<div>&nbsp;<span>a</span>\n</div>',
  },
  {
    name: 'rule 3 — pre, textarea, script, style and title are written verbatim',
    build: (k) => k.tree('<div>\n  <pre>  a\n\n      b  </pre>\n  <textarea>x\n   y</textarea>\n  <style>.a { b: c }\n  .d {}</style>\n</div>'),
    want: '<div>\n  <pre>  a\n\n      b  </pre>\n  <textarea>x\n   y</textarea>\n  <style>.a { b: c }\n  .d {}</style>\n</div>',
  },
  {
    name: 'rule 5 — a start tag past the budget is one attribute per line, one level deeper, `>` on the last; a shorter one stays',
    build: (k) => k.tree(`<section>
      <img class="a4-13__picture" sizes="(max-width: 767px) 108px, 434px" width="1200" height="800" alt="" loading="eager" fetchpriority="high">
      <img class="short" alt="">
    </section>`),
    want: '<section>\n  <img\n    class="a4-13__picture"\n    sizes="(max-width: 767px) 108px, 434px"\n    width="1200"\n    height="800"\n    alt=""\n    loading="eager"\n    fetchpriority="high">\n  <img class="short" alt="">\n</section>',
  },
  {
    name: 'rule 5 — measured on the FINAL text: a token and a user value are counted as they ship, and a long value stays whole',
    build: (k) => k.tree(`<div>
      <img src="${k.expr(`{{img_url feature_image size="l"}}`)}" srcset="${k.expr(Array.from({ length: 5 }, (_, i) => `{{img_url feature_image size="s${i}"}} ${i}w`).join(', '))}">
      <a href="${k.users.put('href', `https://example.com/${'x'.repeat(100)}`, 'attribute')}">go</a>
    </div>`),
    want: `<div>\n  <img\n    src="{{img_url feature_image size="l"}}"\n    srcset="${Array.from({ length: 5 }, (_, i) => `{{img_url feature_image size="s${i}"}} ${i}w`).join(', ')}">\n  <a\n    href="https://example.com/${'x'.repeat(100)}">go</a>\n</div>`,
  },
  {
    name: 'a repeat\'s block lands where it stands, moved in by its line, and a <pre> inside it keeps its own lines',
    build: (k) => {
      const body = k.format(k.tree(`<li class="r">\n  <a href="${k.expr('{{url}}')}">x</a>\n  <pre>p\n  q</pre>\n</li>`))
      return k.tree(`<section>\n  <ul>\n    ${k.block(`{{#foreach posts}}\n${indentBy(body, 1)}\n{{/foreach}}`)}\n  </ul>\n  <p>after</p>\n</section>`)
    },
    want: '<section>\n  <ul>\n    {{#foreach posts}}\n      <li class="r">\n        <a href="{{url}}">x</a>\n        <pre>p\n  q</pre>\n      </li>\n    {{/foreach}}\n  </ul>\n  <p>after</p>\n</section>',
  },
  {
    name: 'an attribute value\'s own line break survives a repeat\'s re-indentation byte for byte',
    build: (k) => {
      const body = k.format(k.tree('<li>\n  <img alt="one\ntwo" src="a">\n</li>'))
      return k.tree(`<div>\n  ${k.block(`{{#foreach posts}}\n${indentBy(body, 1)}\n{{/foreach}}`)}\n</div>`)
    },
    want: '<div>\n  {{#foreach posts}}\n    <li>\n      <img alt="one\ntwo" src="a">\n    </li>\n  {{/foreach}}\n</div>',
  },
]

for (const c of CASES) {
  test(`Story 7.1 · ${c.name}`, () => {
    const k = kase()
    const shipped = k.ship(c.build(k))
    if (c.want !== undefined) assert.equal(shipped, c.want)
    assert.ok(!shipped.includes(KEEP_NL), 'a kept line break came back')
    // rule 1 holds wherever no verbatim element or attribute value carries its own blank line or spaces
    if (!/<pre|<textarea|alt="one/.test(shipped)) lines(shipped)
  })
}

test('Story 7.1 · RENDER-NEUTRAL: every case ships what the serializer shipped, once block helpers are removed and whitespace collapsed', () => {
  for (const c of CASES) {
    const k = kase()
    const root = c.build(k)
    assert.equal(neutral(k.ship(root)), neutral(k.raw(root)), c.name)
  }
  // a raw-text element's content is byte for byte the serializer's, which the collapse above cannot see
  const k = kase()
  const pre = k.tree('<div>\n  <pre>  a\n\n      b  </pre>\n</div>')
  assert.equal(/<pre>[^]*<\/pre>/.exec(k.ship(pre))?.[0], /<pre>[^]*<\/pre>/.exec(k.raw(pre))?.[0])
})

test('Story 7.1 · the CONTROL: a formatter that puts a line break between two touching spans fails the render-neutral check', () => {
  const c = CASES.find((x) => x.name.includes('two spans that touch'))
  assert.ok(c !== undefined)
  const k = kase()
  const root = c.build(k)
  const broken = k.users.substitute(k.tokens.resolve(k.format(root).replace('</span><span', '</span>\n<span')))
  assert.notEqual(neutral(broken), neutral(k.raw(root)), 'the check passed a formatter that changed what renders')
  // and the real formatter, on the same tree, passes it
  assert.equal(neutral(k.ship(root)), neutral(k.raw(root)))
})

test('Story 7.1 · the budget is the contract\'s number, and the formatter never parses Handlebars: an expression is a token until it lands', () => {
  assert.equal(LINE_BUDGET, 120)
  const k = kase()
  const t = k.expr('{{#if a}}}}{{/if}}')
  // a brace-heavy expression the serializer never reads: formatted around, landed whole
  assert.equal(k.ship(k.tree(`<p>${t}</p>`)), '<p>{{#if a}}}}{{/if}}</p>')
})

test('Story 7.1 · a marker with no open beside it is refused, never mis-indented', () => {
  const k = kase()
  assert.throws(() => k.format(k.tree(`<div>\n  <p>x</p>${k.close()}\n</div>`)), /no open beside it/)
  assert.throws(() => k.format(k.tree(`<div>\n  ${k.open()}<p>x</p>\n</div>`)), /never closes/)
})

test('Story 7.1 · a repeat with nothing picked leaves no node, and the whitespace around it is one run: no blank line', () => {
  const src = '<section class="s">\n  <ul class="g">\n    <li data-repeat="picked"><b data-bind="title">t</b></li>\n  </ul>\n</section>'
  const theme = renderTheme(doc(), src, { dataBindings: { picked: { source: 'posts', ids: [] } } }).template
  assert.equal(theme, '<section class="s">\n  <ul class="g">\n  </ul>\n</section>')
  lines(theme)
  // the control: one pick lands its block where the repeat stood
  assert.match(renderTheme(doc(), src, { dataBindings: { picked: { source: 'posts', ids: ['5f0000000000000000000001'] } } }).template, /<ul class="g">\n {4}\{\{#get "posts"[^\n]*\n {6}\{\{#foreach posts\}\}/)
})

test('Story 7.1 (review) · a section\'s top level is block layout even where two nodes touch — the one place a line break is added, which check-snapshots holds no library design to', () => {
  const k = kase()
  assert.equal(k.ship(k.tree('<div>a</div><div>b</div>')), '<div>a</div>\n<div>b</div>')
  // a marker between them is no node: the helper lands on its own line, the markup one level in
  assert.equal(k.ship(k.tree(`${k.open()}<div>a</div>${k.close()}\n<div>b</div>`)), '{{#if x}}\n  <div>a</div>\n{{/if}}\n<div>b</div>')
})

test('Story 7.1 (review) · rule 5 measures the widest LINE of a start tag: a value holding a line break does not make a short tag long', () => {
  const k = kase()
  const value = `${'a'.repeat(70)}\n${'b'.repeat(70)}`
  const shipped = k.ship(k.tree(`<img srcset="${value}" alt="">`))
  // each line is under the budget, so the tag is not broken one attribute per line
  assert.equal(shipped, `<img srcset="${value}" alt="">`)
  // the control: the same characters on one line pass the budget, and the tag breaks
  assert.match(k.ship(k.tree(`<img srcset="${'a'.repeat(141)}" alt="">`)), /^<img\n  srcset=/)
})
