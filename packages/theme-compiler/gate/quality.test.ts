// Story 7.8 — the emitted-theme quality gate, held to its spec's I/O matrix row by row, on the CLEAN BASE THEME made in
// memory (a core package's test opens no file, AD-1): every row below is the base plus its one change. Also: every preset
// clean in both modes with `packs.test.ts`' own control (Tangerine's white on-accent), and FR-J17's premise — the theme
// that scores 0/0 on both pinned gscans (run here through `runGscan`, never a mock) and fails this gate on each defect.
//
// The pilot theme's rows — its empty verdict, axe-core's agreement over the same pages, `themeFailures` through
// `leftovers` — are `tools/check-snapshots.mjs`'s, which compiles the pilots from disk.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRESETS, presetOf } from '@inflozo/library/packs'
import { hardToRead, pairWords, SYNTHESIS_DEFAULTS, T0, U0 } from '@inflozo/section-runtime'
import type { Pack, SynthesisLibrary } from '@inflozo/section-runtime'
import { REFERENCE_PACK } from '@inflozo/section-runtime/reference'
import { REQUIRED_TEMPLATES, requiredTemplates } from '../src/index.ts'
import { GSCAN, leftovers, OURS, qualityGate, QUALITY_RULES, readPages, runGscan } from './index.ts'
import type { Finding, Major, QualityVerdict, ThemeFiles } from './index.ts'

const MAJORS = Object.keys(GSCAN).map(Number) as Major[]
const NONE: SynthesisLibrary = () => undefined

// ─── the clean base theme ─────────────────────────────────────────────────────────────────────────────────────────

const BASE: Record<string, string> = {
  'default.hbs': `<!DOCTYPE html>
<html lang="{{@site.locale}}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{meta_title}}</title>
<link rel="stylesheet" href="{{asset "css/screen.css"}}">
{{ghost_head}}
</head>
<body class="{{body_class}}">
{{!-- Header · Header · Header 1 --}}
{{> "sections/default/header"}}
<main id="site-main">
  {{{body}}}
</main>
{{ghost_foot}}
</body>
</html>
`,
  'partials/sections/default/header.hbs': '<header><a href="{{@site.url}}">{{@site.title}}</a>{{navigation}}</header>\n',
  'index.hbs': '{{!< default}}\n\n{{!-- Post grid · Feeds · Grid --}}\n{{> "sections/index/grid"}}\n',
  'partials/sections/index/grid.hbs': '<section><h2>{{t "Latest"}}</h2>{{#foreach posts}}{{> "post-card"}}{{/foreach}}{{pagination}}</section>\n',
  'partials/post-card.hbs': '<article><h3><a href="{{url}}">{{title}}</a></h3></article>\n',
  'post.hbs': '{{!< default}}\n\n{{#post}}\n<article class="{{post_class}}">\n  {{!-- Post header · Post Header · Post header 1 --}}\n  {{> "sections/post/header"}}\n  {{content}}\n</article>\n{{/post}}\n',
  'partials/sections/post/header.hbs': '<header><h1>{{title}}</h1></header>\n',
  'tag.hbs': '{{!< default}}\n\n{{#tag}}<h1>{{name}}</h1>{{/tag}}\n',
  'author.hbs': '{{!< default}}\n\n{{#author}}<h1>{{name}}</h1>{{/author}}\n',
  'assets/css/screen.css': 'body { color: var(--text); }\n',
}
const PAPER = REFERENCE_PACK
/** The base with `over` laid on it; an `undefined` deletes a file. */
const theme = (over: Record<string, string | Uint8Array | undefined> = {}): ThemeFiles =>
  Object.fromEntries(Object.entries({ ...BASE, ...over }).filter((e): e is [string, string | Uint8Array] => e[1] !== undefined))
const gate = (over: Record<string, string | Uint8Array | undefined> = {}, pack: Pack = PAPER, library: SynthesisLibrary = NONE): QualityVerdict =>
  qualityGate(theme(over), { pack, library })
/** post.hbs with `body` where the post header's partial is, the header kept first. */
const post = (body: string): Record<string, string> => ({ 'partials/sections/post/header.hbs': `<header><h1>{{title}}</h1></header>\n${body}\n` })
/** A new section on post.hbs, after the header: its own boundary comment and partial. */
const section = (layer: string, body: string): Record<string, string> => ({
  'post.hbs': (BASE['post.hbs'] as string).replace('  {{content}}', `  {{!-- ${layer} · Feeds · List --}}\n  {{> "sections/post/extra"}}\n  {{content}}`),
  'partials/sections/post/extra.hbs': `${body}\n`,
})
const all = (v: QualityVerdict): Finding[] => [...v.errors, ...v.warnings]
const codes = (v: QualityVerdict): string[] => all(v).map((f) => f.code)
const clean = (v: QualityVerdict, what: string): void => assert.deepEqual(v, { blocked: false, errors: [], warnings: [] }, what)

test('a clean theme: the base, Paper\'s pack — blocked false, no error, no warning', () => {
  clean(gate(), 'the base')
})

// ─── the table ────────────────────────────────────────────────────────────────────────────────────────────────────

test('QUALITY_RULES: Inflozo\'s own faults are errors; heading_skip, name_missing, image_link_unnamed and contrast_low are warnings (Question 2, FR-E3)', () => {
  const warn = new Set(['heading_skip', 'name_missing', 'image_link_unnamed', 'contrast_low'])
  for (const [id, r] of Object.entries(QUALITY_RULES)) assert.equal(r.level, warn.has(r.code) ? 'warning' : 'error', id)
  // every axe id it names is its own id, so CI's agreement row runs exactly the rules the gate follows
  for (const [id, r] of Object.entries(QUALITY_RULES)) if ('axe' in r) assert.equal(r.axe, id)
})

// ─── the I/O matrix ───────────────────────────────────────────────────────────────────────────────────────────────

test('no lang: <html> with none, or lang="" — one language_missing error, naming default.hbs, ours', () => {
  for (const html of ['<html>', '<html lang="">']) {
    const v = gate({ 'default.hbs': (BASE['default.hbs'] as string).replace('<html lang="{{@site.locale}}">', html) })
    assert.deepEqual(codes(v), ['language_missing'], html)
    assert.equal(v.blocked, true)
    assert.equal(v.errors[0]?.detail, `default.hbs. ${OURS}`)
  }
})

test('a lang Ghost fills — <html lang="{{@site.locale}}"> — is no finding (the base)', () => clean(gate(), 'lang from Ghost'))

test('viewport: removed, maximum-scale=1, user-scalable=no — one viewport_missing error each', () => {
  const vp = '<meta name="viewport" content="width=device-width, initial-scale=1">'
  for (const [what, line] of [['removed', ''], ['maximum-scale=1', '<meta name="viewport" content="width=device-width, maximum-scale=1">'], ['user-scalable=no', '<meta name="viewport" content="width=device-width, user-scalable=no">']]) {
    const v = gate({ 'default.hbs': (BASE['default.hbs'] as string).replace(vp, line as string) })
    assert.deepEqual(codes(v), ['viewport_missing'], what)
    assert.equal(v.errors[0]?.level, 'error')
  }
})

test('a heading skip: <h1>, then <h4> in the next section\'s partial — one heading_skip warning naming the page, the layer and h1→h4', () => {
  const v = gate(section('Related', '<section><h4>Related</h4></section>'))
  assert.deepEqual([v.blocked, codes(v)], [false, ['heading_skip']])
  const [w] = v.warnings as [Finding]
  assert.equal(w.message, 'The headings skip a level in “Related”: a level-4 heading comes straight after a level-1 one.')
  assert.equal(w.detail, 'Screen-reader users move through a page by its headings, one level at a time.')
  assert.equal(w.action, 'If you emptied a title in “Related” or the section above it, type it back, or move “Related” below a section whose heading is level 3.')
  assert.deepEqual(w.refs, ['post.hbs', 'partials/sections/post/extra.hbs'])
  assert.equal(w.rule, 'heading-order')
})

test('order axe-core allows: a page opening on <h2> (the base\'s index), and a climb h3→h1 — no finding', () => {
  clean(gate(section('Climb', '<h2>a</h2><h3>b</h3><h1>c</h1>')), 'a climb')
})

test('alternatives: {{#is "paged"}}<h2>{{else}}<h2>{{/is}}, and {{#if x}}<h2>{{else}}<h3>{{/if}}<h3> — no finding, each branch read on its own', () => {
  // each a page of its own, opening with the blocks (a page's first heading may be any level)
  clean(gate({ 'tag.hbs': '{{!< default}}\n{{#is "paged"}}<h2>a</h2>{{else}}<h2>b</h2>{{/is}}\n' }), 'is paged')
  clean(gate({ 'tag.hbs': '{{!< default}}\n{{#if x}}<h2>a</h2>{{else}}<h3>b</h3>{{/if}}<h3>c</h3>\n' }), 'if/else')
  // the control: under the post's <h1>, the {{else}}'s <h3> is a real skip, on its alternative alone
  const v = gate(section('Branches', '{{#if x}}<h2>a</h2>{{else}}<h3>b</h3>{{/if}}'))
  assert.deepEqual(codes(v), ['heading_skip'])
  assert.match(v.warnings[0]?.message ?? '', /a level-3 heading comes straight after a level-1 one/)
})

test('the edge: <h1>{{title}}</h1>{{content}}<h2>Related</h2> — no finding; nothing inside {{content}} or {{{html}}} is read (R-6)', () => {
  clean(gate(post('{{content}}<h2>Related</h2>')), 'the edge')
})

test('a nameless control: <a href="x"><svg aria-hidden="true">…</svg></a>, and an empty <button> — one name_missing warning each', () => {
  for (const [what, body, kind] of [['an icon link', '<a href="x"><svg aria-hidden="true"><path d="M0 0"/></svg></a>', 'link'], ['an empty button', '<button type="button"></button>', 'button']]) {
    const v = gate(section('Share', `<div>${body}</div>`))
    assert.deepEqual([v.blocked, codes(v)], [false, ['name_missing']], what as string)
    assert.equal(v.warnings[0]?.message, `A ${kind} in “Share” has no words a screen reader can say.`)
    assert.equal(v.warnings[0]?.action, 'Give it words in the section\'s settings.')
  }
})

test('names that count (axe-core 4.12.1\'s sources): text or an expression, {{t}}, aria-label, aria-labelledby naming an id with words, title, an image\'s alt inside; for a field a label or a placeholder — no finding', () => {
  for (const body of [
    '<a href="x">{{title}}</a>', '<a href="x">{{t "Read more"}}</a>', '<a href="x" aria-label="Close"><svg aria-hidden="true"></svg></a>',
    '<span id="lbl">Share</span><a href="x" aria-labelledby="lbl"><svg aria-hidden="true"></svg></a>', '<a href="x" title="Share"></a>',
    '<a href="x"><img src="a.png" alt="Logo"> </a>', '<button type="button"><img src="a.png" alt="Close"></button>',
    '<label>Email <input type="email"></label>', '<label for="em">Email</label><input id="em" type="email">',
    '<input type="email" placeholder="{{t "Your email"}}">', '<input type="submit">', '<details><summary>{{t "More"}}</summary></details>',
  ]) clean(gate(section('Names', body)), body)
})

test('a picture-only link that can be empty: <img alt="">, and alt="{{feature_image_alt}}" — one image_link_unnamed warning each, its alt as written', () => {
  for (const [alt, detail] of [['', 'Its description is empty.'], ['{{feature_image_alt}}', 'Its description is “{{feature_image_alt}}”, which can be empty.']]) {
    const v = gate(section('Cards', `<a href="{{url}}"><img src="{{feature_image}}" alt="${alt}"></a>`))
    assert.deepEqual([v.blocked, codes(v)], [false, ['image_link_unnamed']], alt as string)
    assert.equal(v.warnings[0]?.message, 'A link in “Cards” is only a picture, and the picture can be left with no description.')
    assert.equal(v.warnings[0]?.detail, detail)
    assert.equal(v.warnings[0]?.action, 'Describe the picture in the section\'s settings.')
  }
})

test('a picture-only link that is never empty: NFR-5\'s chain, {{@site.title}}, {{t …}}, a literal, a name, a guard — no finding', () => {
  for (const alt of ['{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}', '{{@site.title}}', '{{t "Home"}}', 'Our logo', '{{name}}']) {
    clean(gate(section('Cards', `<a href="{{url}}"><img src="{{feature_image}}" alt="${alt}"></a>`)), alt)
  }
  clean(gate(section('Cards', '{{#if feature_image_alt}}<a href="{{url}}"><img src="{{feature_image}}" alt="{{feature_image_alt}}"></a>{{/if}}')), 'guarded')
})

test('picture-only in one branch: <a>{{#if @site.logo}}<img alt="">{{else}}{{@site.title}}{{/if}}</a> — one image_link_unnamed, for the logo branch', () => {
  const v = gate(section('Logo', '<a href="{{@site.url}}">{{#if @site.logo}}<img src="{{@site.logo}}" alt="">{{else}}{{@site.title}}{{/if}}</a>'))
  assert.deepEqual(codes(v), ['image_link_unnamed'])
})

test('the figure case: a captioned feature image under the page\'s <h1>{{title}}</h1>, alt NFR-5\'s chain — no finding (Casper ships it)', () => {
  clean(gate(post('<figure><img src="{{feature_image}}" alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}"><figcaption>{{feature_image_caption}}</figcaption></figure>')), 'the figure')
})

test('no alt attribute: <img src="…"> anywhere — one alt_missing error', () => {
  const v = gate(post('<p><img src="a.png"></p>'))
  assert.deepEqual([v.blocked, codes(v)], [true, ['alt_missing']])
  assert.equal(v.errors[0]?.detail, `<img> in partials/sections/post/header.hbs. ${OURS}`)
})

test('an inline handler: onclick, or any on*, on any element — one inline_script error', () => {
  for (const body of ['<div onclick="go()">x</div>', '<a href="x" onMouseOver="y()">x</a>']) {
    const v = gate(post(body))
    assert.deepEqual([v.blocked, codes(v)], [true, ['inline_script']], body)
  }
})

test('an inline style: style="color: red" is one inline_style error; style="{{#if f}}--p: {{f}}{{/if}}" is none (AD-3)', () => {
  assert.deepEqual(codes(gate(post('<div style="color: red">x</div>'))), ['inline_style'])
  clean(gate(post('<div style="{{#if f}}--p: {{f}}{{/if}}">x</div>')), 'one bound custom property')
  clean(gate(post('<div style="--ref: var(--accent)">x</div>')), 'one pack token')
})

test('a missing template: the theme without tag.hbs — one template_missing error naming tag.hbs', () => {
  const v = gate({ 'tag.hbs': undefined })
  assert.deepEqual([v.blocked, codes(v)], [true, ['template_missing']])
  assert.equal(v.errors[0]?.message, 'Your theme is missing tag.hbs, which every theme Inflozo builds carries.')
  assert.deepEqual(v.errors[0]?.refs, ['tag.hbs'])
})

test('filled by the library: a library whose synthesis fills page.hbs, and no page.hbs — one template_missing; with no library, none', () => {
  const pageIds = new Set((SYNTHESIS_DEFAULTS['page.hbs'] ?? []).map((r) => r.designId))
  assert.ok(pageIds.size > 0, 'page.hbs has no Synthesis Default, so this row reads nothing')
  const fills: SynthesisLibrary = (id) => (pageIds.has(id) ? { compileTarget: ['page.hbs'], contentSchema: {}, bindingContext: [] } : undefined)
  assert.deepEqual(requiredTemplates(NONE), [...REQUIRED_TEMPLATES].sort())
  assert.ok(requiredTemplates(fills).includes('page.hbs'))
  const v = gate({}, PAPER, fills)
  assert.deepEqual(codes(v), ['template_missing'])
  assert.match(v.errors[0]?.message ?? '', /page\.hbs/)
})

test('invalid markup: a link inside a link, one literal id twice, two <main>, a stray end tag — one markup_invalid error each, naming the page and the file', () => {
  for (const [what, body, pattern] of [
    ['a link inside a link', '<a href="1">a<a href="2">x</a></a>', /a stray <\/a>/],
    ['one id twice', '<div id="same">a</div><div id="same">b</div>', /the id “same”/],
    ['two <main>', '<main>x</main>', /2 <main> elements/],
    ['a stray end tag', '<div>x</span></div>', /a stray <\/span>/],
    ['a button in a link', '<a href="1"><button type="button">x</button></a>', /<button> inside <a>/],
  ] as const) {
    const v = gate(post(body))
    assert.deepEqual([v.blocked, codes(v)], [true, ['markup_invalid']], what)
    assert.equal(v.errors[0]?.message, 'Part of your theme isn\'t valid HTML, so browsers would rebuild it differently from your design.')
    assert.match(v.errors[0]?.detail ?? '', pattern, what)
    assert.equal(v.errors[0]?.refs[0], 'post.hbs', what)
  }
  // parse5's own code and line, where it has one: a duplicate attribute, on the header partial's first line
  const v = gate(post('<div class="a" class="b">x</div>'))
  assert.deepEqual(codes(v), ['markup_invalid'])
  assert.equal(v.errors[0]?.detail, `duplicate-attribute at line 2, in partials/sections/post/header.hbs. ${OURS}`)
})

test('a start tag\'s alternatives: <html lang="x"{{#match a "b"}} class="c"{{else}} class="d"{{/match}}> — no finding: only the first branch is read', () => {
  clean(gate({ 'default.hbs': (BASE['default.hbs'] as string).replace('<html lang="{{@site.locale}}">', '<html lang="{{@site.locale}}"{{#match @custom.color_scheme "Dark"}} class="dark-mode"{{else match @custom.color_scheme "Auto"}} class="auto-color"{{/match}}>') }), 'Casper\'s <html>')
})

test('build leftovers: a consumed directive attribute, an expression token, a user-text marker, a partial no template reaches — one build_leftover error each', () => {
  for (const [what, over, said] of [
    ['a directive', post('<p data-prop="title">x</p>'), 'a directive attribute (data-prop)'],
    ['a token', { 'assets/css/screen.css': `body { color: ${T0}0x; }\n` }, 'an expression token'],
    ['a marker', post(`<p>${U0}3</p>`), 'a user-text marker'],
    ['an orphan', { 'partials/orphan.hbs': '<p>x</p>\n' }, 'a partial no template uses'],
  ] as const) {
    const v = gate(over)
    assert.deepEqual(codes(v).filter((c) => c === 'build_leftover'), ['build_leftover'], what)
    assert.match(v.errors.find((f) => f.code === 'build_leftover')?.detail ?? '', new RegExp(`^${said.replace(/[()]/g, '\\$&')}, in `), what)
  }
  // a customer's words naming a directive are words, never an attribute (their `<` ships as `&lt;`)
  assert.deepEqual(leftovers(theme(post('<p> data-prop="title" &lt;p data-bind="x"&gt;</p>'))), [])
  assert.deepEqual(leftovers(theme()), [])
})

test('the paywall: partials/content-cta.hbs holding a nameless link — read as its own fragment: one name_missing; never an orphan', () => {
  const v = gate({ 'partials/content-cta.hbs': '{{{html}}}\n\n<aside><h2>{{t "Subscribe"}}</h2><a href="#/portal/signup"></a></aside>\n' })
  assert.deepEqual(codes(v), ['name_missing'])
  assert.deepEqual(v.warnings[0]?.refs, ['partials/content-cta.hbs', 'partials/content-cta.hbs'])
})

test('contrast, every preset: each in both modes — no finding; Tangerine\'s white on-accent (packs.test.ts\' own control) is caught', () => {
  assert.ok(PRESETS.length > 0)
  for (const p of PRESETS) clean(gate({}, p.pack as Pack), p.id)
  const tangerine = (presetOf('tangerine') ?? assert.fail('no Tangerine')).pack as Pack
  const v = gate({}, { ...tangerine, light: { ...tangerine.light, onAccent: '#FFFFFF' } })
  assert.deepEqual(codes(v), ['contrast_low'])
  assert.match(v.warnings[0]?.message ?? '', /^Hard to read: On-accent on Accent in Light, 3\.\d:1\. Small text needs 4\.5:1 — it still ships\.$/)
})

test('contrast, a customer\'s pack: Text on Base below 4.5:1 in Light — one contrast_low warning in the Style Pack editor\'s own words, never an error (FR-E3)', () => {
  const pack = { ...PAPER, light: { ...PAPER.light, text: '#767676' } }
  const hard = hardToRead(pack)
  assert.equal(hard.length, 1, 'the row\'s premise: one pair fails, Text on Base')
  const v = gate({}, pack)
  assert.deepEqual([v.blocked, v.errors, codes(v)], [false, [], ['contrast_low']])
  assert.equal(v.warnings[0]?.message, `Hard to read: ${pairWords(hard[0] as (typeof hard)[number])}. Small text needs 4.5:1 — it still ships.`)
  assert.match(v.warnings[0]?.message ?? '', /^Hard to read: Text on Base in Light, 4\.3:1\./)
  assert.equal(v.warnings[0]?.action, 'Change one of the two colours in the Style Pack.')
})

test('Ghost\'s own markup: {{navigation}}, {{pagination}}, {{ghost_head}}, {{ghost_foot}} — never read as the theme\'s (the base carries all four)', () => {
  const pages = readPages(theme())
  for (const p of pages) assert.doesNotMatch(p.text, /\{\{|\}\}/, `${p.file}: a mustache reached the parser`)
  clean(gate(), 'the base')
})

test('readPages: each page assembled once — the layout around {{{body}}}, partials in place — with its heading alternatives', () => {
  const pages = readPages(theme(section('Branches', '{{#if x}}<h2>a</h2>{{else}}<h3>b</h3>{{/if}}')))
  assert.deepEqual(pages.map((p) => p.file), ['author.hbs', 'index.hbs', 'post.hbs', 'tag.hbs'])
  const p = pages.find((x) => x.file === 'post.hbs')
  assert.deepEqual(p?.headings, ['h1 h2', 'h1 h3'])
  assert.match(p?.text ?? '', /<main id="site-main">[^]*<h1>x<\/h1>[^]*<\/main>/)
})

// ─── the premise ──────────────────────────────────────────────────────────────────────────────────────────────────
// `review-st2-theme-quality.md:144-161`'s files, with the spec's two additions: an <h6> after the <h1> (FR-J17 states
// <h4>→<h1>→<h6>) and a pack whose Light text and background are #eeeeee on #ffffff.

const PREMISE: Record<string, string> = {
  'package.json': `${JSON.stringify({ name: 'awful', version: '1.0.0', author: { email: 'hello@inflozo.com' }, keywords: ['ghost-theme'], config: { posts_per_page: 12, card_assets: true } }, null, 2)}\n`,
  'index.hbs': '{{!< default}}\n<h4>Posts</h4>\n{{#foreach posts}}\n<div onclick="go()"><h1><a href="{{url}}"><img src="{{feature_image}}"></a></h1><h6>{{title}}</h6><div>{{excerpt}}</div></div>\n{{/foreach}}\n',
  'default.hbs': '<!DOCTYPE html>\n<html>\n<head><title>{{meta_title}}</title>{{ghost_head}}</head>\n<body class="{{body_class}}"><div>{{{body}}}</div>{{ghost_foot}}</body>\n</html>\n',
  'page.hbs': '{{!< default}}\n{{#post}}{{#if @page.show_title_and_feature_image}}<h1>{{title}}</h1>{{/if}}{{content}}{{/post}}\n',
  'post.hbs': '{{!< default}}\n{{#post}}<h1>{{title}}</h1>{{content}}{{/post}}\n',
  'assets/css/screen.css': 'body{color:#eee;background:#fff}\n.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n',
}
const PREMISE_PACK: Pack = { ...PAPER, light: { ...PAPER.light, text: '#eeeeee', background: '#ffffff' } }

// Executed at Story 7.8's Dev: the review's files verbatim score 0 ERRORS and ONE WARNING on both pinned gscans —
// GS051-CUSTOM-FONTS, no `--gh-font-heading`/`--gh-font-body` in the stylesheet (the review recorded 0/0, running 6.4.2 at
// both specs, the pairing AD-34 calls wrong). A warning deploys, so the premise stands; with Ghost's two font variables
// declared — AD-18's forms, which every compiled theme carries — both score it 0/0. FR-J17 carries the dated correction.
test('the premise: both pinned gscans pass FR-J17\'s theme — 0 errors, one warning GS051-CUSTOM-FONTS; 0/0 once it declares Ghost\'s two font variables', async () => {
  const fonts = { ...PREMISE, 'assets/css/screen.css': `${PREMISE['assets/css/screen.css']}body { font-family: var(--gh-font-body, serif); }\nh1 { font-family: var(--gh-font-heading, serif); }\n` }
  for (const major of MAJORS) {
    assert.deepEqual((await runGscan(PREMISE, major)).results.map((r) => `${r.level} ${r.code}`), ['warning GS051-CUSTOM-FONTS'], `gscan ${GSCAN[major].version}`)
    assert.deepEqual((await runGscan(fonts, major)).results.map((r) => `${r.level} ${r.code}`), [], `gscan ${GSCAN[major].version}, with the font variables`)
  }
})

test('the premise: the gate reports each defect FR-J17 names — no lang, no viewport, h1→h6, no alt, a picture-only link, an onclick, no tag.hbs or author.hbs, 1.5:1 text — blocked', () => {
  const v = qualityGate(PREMISE, { pack: PREMISE_PACK, library: NONE })
  assert.equal(v.blocked, true)
  assert.deepEqual(v.errors.map((f) => `${f.code}${f.code === 'template_missing' ? ` ${f.refs[0]}` : ''}`), [
    'language_missing', 'alt_missing', 'inline_script', 'viewport_missing', 'template_missing author.hbs', 'template_missing tag.hbs',
  ])
  assert.deepEqual([...new Set(v.warnings.map((f) => f.code))], ['contrast_low', 'heading_skip', 'image_link_unnamed'])
  assert.equal(v.warnings.find((f) => f.code === 'heading_skip')?.message, 'The headings skip a level on this page: a level-6 heading comes straight after a level-1 one.')
  assert.ok(v.warnings.some((f) => f.message.startsWith('Hard to read: Text on Base in Light, 1.1:1.')))
})

// ─── the gate fails, and determinism ──────────────────────────────────────────────────────────────────────────────

test('the gate fails: a template handed as bytes — one quality_check_failed, blocked, no stack; a font\'s bytes are skipped, never an error', () => {
  const v = gate({ 'post.hbs': new TextEncoder().encode(BASE['post.hbs']) })
  assert.deepEqual(v, { blocked: true, errors: [{ code: 'quality_check_failed', message: 'We couldn\'t check your theme, so nothing was sent to your site.', action: 'Try again in a moment.', level: 'error', fatal: false, refs: [] }], warnings: [] })
  clean(gate({ 'assets/fonts/inter-latin.woff2': new Uint8Array([0, 1, 2, 3]) }), 'a font')
  // a pack that is no pack is the same one finding, never a throw
  assert.deepEqual(codes(qualityGate(theme(), { pack: {} as Pack, library: NONE })), ['quality_check_failed'])
})

test('determinism: the same files twice, keys in another order — equal verdicts, plain JSON', () => {
  const files = theme({ ...section('Related', '<h4>x</h4><a href="x"></a>'), 'tag.hbs': undefined })
  const reversed = Object.fromEntries(Object.entries(files).reverse())
  const a = qualityGate(files, { pack: PAPER, library: NONE })
  assert.ok(all(a).length >= 3, 'the row reads too little')
  assert.deepEqual(qualityGate(reversed, { pack: PAPER, library: NONE }), a)
  assert.deepEqual(JSON.parse(JSON.stringify(a)), a)
})

test('a message never names a file to the customer but template_missing\'s; no finding is fatal (Ghost never refuses an upload for these)', () => {
  const seen = [
    ...all(qualityGate(PREMISE, { pack: PREMISE_PACK, library: NONE })),
    ...all(gate({ ...section('X', '<h4>a</h4><a href="x"></a><img src="a"><div style="color:red" onclick="x">y</div>'), 'tag.hbs': undefined })),
  ]
  for (const f of seen) {
    if (f.code !== 'template_missing') assert.doesNotMatch(f.message, /\.hbs\b/, `${f.code}: ${f.message}`)
    assert.equal(f.fatal, false)
  }
})
