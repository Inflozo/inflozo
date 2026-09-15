// Story 4.5's I/O matrix, every row, against the sample the review page renders.
//
// The DECLARATION is the on-disk sample — `design.json` and the category's `content.json`, imported as
// data because a core package's test cannot open a file (AD-1) — so every sentence a panel prints at a
// floor, a ceiling, a greyed row or a narrowed universal is READ from it here and never written in
// this file. The markup is the sample's shape held in memory for the same reason; the on-disk
// `index.html` is validated end to end by `tools/stress/test-vocabulary.mjs` and `apps/web/controls.test.ts`.
//
// "Both emitters" means both, every time: a row that holds on the canvas and not in the theme is the
// canvas lying about what ships.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { CONTROL_CAP, UNIVERSALS, assembleEntry, categoryControlUnion, orbitWeekly, validateDesignJson } from '@inflozo/library'
import type { CategoryContent, DesignJson, IconLookup } from '@inflozo/library'
import { ICONS, filledKey, iconDrawing } from '@inflozo/library/icons'
import design from '../../library/fixtures/controls/1/design.json' with { type: 'json' }
import content from '../../library/fixtures/controls/content.json' with { type: 'json' }
import {
  addItem, defaultContent, duplicateItem, moveItem, removeItem, resetChanges, resetControl, resetSection, resolveControls,
  setContent, setControl, setData, sidebar, withData,
} from './controls.ts'
import type { ControlRow, ControlState, DataRow, PropRow } from './controls.ts'
import { editText, iconSvg, renderCanvas, renderTheme } from './index.ts'
import type { RenderInput, RichText } from './index.ts'

const doc = () => new JSDOM('<body></body>').window.document

const HTML = `<section class="cx" data-bg="base" data-spacing="comfortable" data-divider="none" data-columns="3" data-card="outlined" data-align="start" data-icons="on" data-rule="line" data-image="top" data-tint="none">
  <p class="cx__eyebrow" data-prop="eyebrow">e</p>
  <h2 class="cx__title" data-prop="heading">h</h2>
  <time class="cx__date" data-prop="nextIssue" data-prop-attr="datetime:nextIssue">d</time>
  <img class="cx__picture" data-prop-attr="src:picture;alt:pictureAlt" data-empty="hide" alt="">
  <ul class="cx__features"><li class="cx__feature" data-items="features"><span class="cx__icon" data-prop="features[].icon"></span><span class="cx__t" data-prop="features[].title">t</span></li></ul>
  <a class="cx__link" data-prop="issue.label" data-prop-attr="href:issue.link">l</a>
  <a class="cx__link" data-prop="archive.label" data-prop-attr="href:archive.link" data-empty="hide">a</a>
  <h3 data-prop="archiveHeading">f</h3>
  <ol class="cx__posts"><li class="cx__post" data-repeat="latest"><a data-bind-attr="href:url" data-bind="title">p</a></li></ol>
</section>`

const assembled = assembleEntry({
  dir: 'packages/library/fixtures/controls/1',
  design: design as unknown as DesignJson,
  content: content as unknown as CategoryContent,
  html: HTML,
  css: '',
})
if (typeof assembled === 'string') throw new Error(assembled)
const entry = assembled
const props = content.props
const start = (over: ControlState = {}): ControlState => ({ content: defaultContent(entry.contentSchema), ...over })
const rowsFor = (key: string, n = 100) => orbitWeekly.resolveSource({ ...entry.dataBindings![key]!, limit: n })

/** Render the instance through the one door both emitters read. */
function input(state: ControlState, over: Partial<RenderInput> = {}): RenderInput {
  const bindings = withData(entry.dataBindings, state.data)
  return {
    content: state.content, schema: entry.contentSchema, controlSchema: entry.controlSchema, universals: entry.universals,
    controls: state.controls, data: state.data, dataBindings: entry.dataBindings, icons: iconDrawing,
    assets: { 'feature-03': '/pool/feature-03.svg', 'feature-01': '/pool/feature-01.svg' },
    getRows: { latest: orbitWeekly.resolveSource(bindings['latest']!) },
    ...over,
  }
}
const both = (state: ControlState, over: Partial<RenderInput> = {}) => ({
  canvas: renderCanvas(doc(), HTML, input(state, over)),
  theme: renderTheme(doc(), HTML, input(state, over)).template,
})
const rootOf = (html: string) => /<section[^>]*>/.exec(html)?.[0] ?? ''
const control = (state: ControlState, name: string): ControlRow => {
  const m = sidebar(entry, state)
  const row = m.groups.flatMap((g) => g.rows).find((r) => r.kind === 'control' && r.name === name)
  assert.ok(row !== undefined, `no row for ${name}`)
  return row as ControlRow
}
const ok = <T>(r: T | string): T => {
  assert.notEqual(typeof r, 'string', `refused: ${String(r)}`)
  return r as T
}

test('the sample validates clean, so every row below is against a design the validator accepts', () => {
  assert.deepEqual(validateDesignJson(design as unknown as DesignJson, HTML), [])
})

test('the panel (R-113): Section Settings, Content, Layout, Style and Data, each control in the group its role names, nothing pinned above', () => {
  const m = sidebar(entry, start())
  assert.deepEqual(Object.keys(m), ['groups'], 'no pinned block of controls above the groups')
  // the sample declares no Section Settings control, so that accordion is not drawn
  assert.deepEqual(m.groups.map((g) => g.label), ['Content', 'Layout', 'Style', 'Data'])
  // every control sits in exactly the group it declares, once — the universals in theirs
  for (const c of [...entry.controlSchema, ...UNIVERSALS]) {
    const holders = m.groups.filter((g) => g.rows.some((r) => r.kind === 'control' && r.name === c.name)).map((g) => g.id)
    assert.deepEqual(holders, [c.group], `${c.name} sits in ${holders.join(', ')}`)
  }
  // within a group, the design's own controls in declaration order, then its universals at the foot
  const names = (id: string) => m.groups.find((g) => g.id === id)!.rows.flatMap((r) => (r.kind === 'control' ? [r.name] : []))
  assert.deepEqual(names('layout'), entry.controlSchema.filter((c) => c.group === 'layout').map((c) => c.name))
  const style = m.groups.find((g) => g.id === 'style')!
  const universals = style.rows.filter((r) => r.kind === 'control' && r.universal).map((r) => (r as ControlRow).name)
  assert.deepEqual(universals, ['bg', 'spacing', 'divider'])
  assert.ok(style.rows.slice(-universals.length).every((r) => r.kind === 'control' && r.universal), 'the trio sits at the foot')
  assert.deepEqual(style.absent, entry.absent.filter((a) => a.group === 'style').map((a) => a.note))
  // Content: the words in markup order — an item prop inside its list, never a row of its own — then its controls
  const contentRows = m.groups.find((g) => g.id === 'content')!.rows
  const props = contentRows.filter((r): r is PropRow => r.kind === 'prop')
  assert.deepEqual(props.map((r) => r.path), ['eyebrow', 'heading', 'nextIssue', 'picture', 'pictureAlt', 'features', 'issue.label', 'issue.link', 'archive.label', 'archive.link', 'archiveHeading'])
  assert.deepEqual(props.find((r) => r.path === 'features')?.list?.props.map((p) => p.path), ['features[].icon', 'features[].title'])
  assert.deepEqual(contentRows.slice(props.length).map((r) => (r as ControlRow).name), entry.controlSchema.filter((c) => c.group === 'content').map((c) => c.name))
  // a design with no query has no Data group
  assert.ok(!sidebar({ ...entry, dataBindings: {} }, start()).groups.some((g) => g.id === 'data'))
  // a control that fits no role opens the panel as Section Settings, with its absent note
  const onScroll = { name: 'on-scroll', type: 'segmented' as const, label: 'On scroll', group: 'settings' as const, values: ['static', 'sticky'], default: 'static' }
  const settled = sidebar({ ...entry, controlSchema: [...entry.controlSchema, onScroll], absent: [...entry.absent, { group: 'settings', note: 'n' }] }, start())
  assert.deepEqual(settled.groups[0], { ...settled.groups[0], id: 'settings', label: 'Section Settings', absent: ['n'] })
  assert.deepEqual(settled.groups[0]!.rows.map((r) => (r as ControlRow).name), ['on-scroll'])
  // declaration order holds even when a control is greyed by one declared AFTER it, which the resolver reaches first
  const later = { ...entry, controlSchema: [
    { ...entry.controlSchema.find((c) => c.name === 'rule')!, disabledBy: { control: 'tint', whenValue: 'strong', inForce: 'none', reason: 'r' } },
    ...entry.controlSchema.filter((c) => c.name !== 'rule'),
  ] }
  const styleOrder = sidebar(later, start()).groups.find((g) => g.id === 'style')!.rows.flatMap((r) => (r.kind === 'control' && !r.universal ? [r.name] : []))
  assert.deepEqual(styleOrder, later.controlSchema.filter((c) => c.group === 'style').map((c) => c.name))
  // and a group holding only an absent note is still drawn, so the note has somewhere to sit
  assert.ok(sidebar({ ...entry, absent: [{ group: 'settings', note: 'n' }] }, start()).groups.some((g) => g.id === 'settings'))
})

test('FR-F5 — a mode-scoped control with a stored dark override carries the moon; one without does not', () => {
  const state = start({ darkOverrides: { bg: 'contrast' } })
  assert.equal(control(state, 'bg').moon, true)
  assert.equal(control(state, 'tint').moon, false, 'Card tint is mode-scoped and has no override stored')
  assert.equal(control(state, 'card').moon, false)
})

test('row · a control change is stamped identically on both emitters', () => {
  const state = ok(setControl(entry, start(), 'card', 'raised'))
  const { canvas, theme } = both(state)
  for (const html of [canvas, theme]) assert.match(rootOf(html), /data-card="raised"/)
  assert.equal(control(state, 'card').changed, true)
  const reset = resetControl(entry, state, 'card')
  assert.equal(control(reset, 'card').changed, false)
  assert.match(rootOf(renderCanvas(doc(), HTML, input(reset))), /data-card="outlined"/)
})

test('row · greyed by a dependency: the value in force on both roots, the stored value kept, and the set refused', () => {
  const rule = entry.controlSchema.find((c) => c.name === 'rule')!
  const centred = ok(setControl(entry, start({ controls: { rule: 'line' } }), 'align', 'center'))
  const row = control(centred, 'rule')
  assert.equal(row.greyed, rule.disabledBy?.reason)
  assert.equal(row.value, rule.disabledBy?.inForce)
  for (const html of Object.values(both(centred))) {
    assert.match(rootOf(html), new RegExp(`data-rule="${rule.disabledBy?.inForce}"`))
    assert.doesNotMatch(rootOf(html), /data-rule="line"/, 'the greyed control\'s stored value reached an emitter')
  }
  assert.equal(setControl(entry, centred, 'rule', 'line'), rule.disabledBy?.reason)
  assert.equal(centred.controls?.['rule'], 'line', 'the stored value is kept')
  const back = ok(setControl(entry, centred, 'align', 'start'))
  assert.equal(resolveControls(entry, back.controls)['rule'], 'line', 'and it returns when the dependency lets go')
})

test('row · a narrowed universal: the values it does not offer are greyed inside the live row, with the design\'s reason', () => {
  const reason = design.universals.bg.reason
  const row = control(start(), 'bg')
  assert.equal(row.greyed, undefined, 'the row itself is live')
  assert.equal(row.value, 'base', 'Base in force by default')
  assert.deepEqual(row.options.filter((o) => o.greyed !== undefined).map((o) => o.value), ['accent', 'image'])
  assert.ok(row.options.every((o) => o.greyed === undefined || o.greyed === reason))
  assert.equal(setControl(entry, start(), 'bg', 'accent'), reason)
  assert.match(rootOf(renderTheme(doc(), HTML, input(start({ controls: { bg: 'accent' } }))).template), /data-bg="base"/)
})

test('row · R-103\'s no-value lock: nothing marked, the sentence under it, and no data-bg on either root', () => {
  const locked = { ...entry, universals: { bg: { values: [], reason: 'Transparent over the hero is this design' } } }
  const row = sidebar(locked, start()).groups.flatMap((g) => g.rows).find((r) => r.kind === 'control' && r.name === 'bg') as ControlRow
  assert.equal(row.value, null)
  assert.equal(row.greyed, 'Transparent over the hero is this design')
  for (const role of ['base', 'accent']) assert.equal(setControl(locked, start(), 'bg', role), 'Transparent over the hero is this design')
  assert.ok(!('bg' in resolveControls(locked, { bg: 'base' })))
  const state = start({ controls: { bg: 'surface' } })
  for (const html of Object.values(both(state, { universals: locked.universals }))) {
    assert.doesNotMatch(rootOf(html), /data-bg/, `a no-value lock stamped data-bg: ${rootOf(html)}`)
    assert.match(rootOf(html), /data-spacing="comfortable"/, 'the other universals still stamp')
  }
})

test('row · stored junk is resolved away, never thrown — the default stamps and an unknown name stamps nowhere', () => {
  const state = start({ controls: { card: '12px', 'x" onload="y': 'z', columns: 3, bg: 'inherit' } })
  for (const html of Object.values(both(state))) {
    const root = rootOf(html)
    assert.match(root, /data-card="outlined"/)
    assert.match(root, /data-columns="3"/)
    assert.match(root, /data-bg="base"/)
    assert.doesNotMatch(root, /onload|data-x/)
  }
  assert.equal(control(state, 'card').changed, false)
})

test('row · Add at the ceiling is greyed with the ceiling sentence, and Duplicate is refused the same way', () => {
  let state = start()
  let refusal: string | undefined
  for (let i = 0; i <= props.features.max && refusal === undefined; i++) {
    const next = addItem(entry, state, 'features')
    if (typeof next === 'string') refusal = next
    else state = next
  }
  assert.equal(refusal, props.features.atMax, 'Add was never refused at the ceiling')
  const list = (sidebar(entry, state).groups[0]!.rows.find((r) => r.kind === 'prop' && r.path === 'features') as PropRow).list!
  assert.equal(list.count, props.features.max)
  assert.equal(list.atMax, props.features.atMax)
  assert.equal(duplicateItem(entry, state, 'features', 0), props.features.atMax)
  // a new item carries the placeholder content its item props declare — never an empty shell
  const items = state.content?.['features'] as { title: string; icon: string }[]
  assert.deepEqual(items.at(-1), { title: props['features[].title'].default, icon: props['features[].icon'].default })
})

test('row · Remove at the floor stays active, removes nothing, and answers with the floor sentence', () => {
  let state = start()
  while (((state.content?.['features'] as unknown[]) ?? []).length > props.features.min) state = ok(removeItem(entry, state, 'features', 0))
  const before = state.content?.['features']
  assert.equal(removeItem(entry, state, 'features', 0), props.features.atMin)
  assert.equal(state.content?.['features'], before, 'nothing was removed')
})

test('row · reorder moves the array and the canvas together, announces it, and refuses a position out of range', () => {
  const state = start()
  const moved = moveItem(entry, state, 'features', 2, 0)
  assert.notEqual(typeof moved, 'string')
  if (typeof moved === 'string') return
  const n = (state.content?.['features'] as unknown[]).length
  assert.equal(moved.announce, `Moved to position 1 of ${n}`)
  const titles = (html: string) => [...html.matchAll(/class="cx__t">([^<]*)</g)].map((m) => m[1])
  const was = titles(renderCanvas(doc(), HTML, input(state)))
  const now = titles(renderCanvas(doc(), HTML, input(moved.state)))
  assert.deepEqual(now, [was[2], was[0], was[1]])
  assert.equal(typeof moveItem(entry, state, 'features', 0, n), 'string')
  assert.equal(typeof moveItem(entry, state, 'features', -1, 0), 'string')
})

test('row · an authored array renders N copies on both emitters, identical trees, per-item props from item i', () => {
  const state = start()
  const n = (state.content?.['features'] as unknown[]).length
  const { canvas, theme } = both(state)
  const shape = (html: string) => [...html.matchAll(/<li class="cx__feature">[^]*?<\/li>/g)].map((m) => m[0].replace(/>[^<]*</g, '><'))
  assert.equal(shape(canvas).length, n)
  assert.deepEqual(shape(canvas), shape(theme), 'the two trees differ')
  const first = (state.content?.['features'] as { title: string }[])[0]!.title
  assert.ok(canvas.includes(`>${first}<`) && theme.includes(`>${first}<`))
  const none = both(start({ content: { ...defaultContent(entry.contentSchema), features: [] } }))
  for (const html of Object.values(none)) assert.doesNotMatch(html, /cx__feature"/, 'zero items renders nothing')
  // a list inside a list, or inside a Ghost repeat, refuses by name
  for (const src of ['<ul><li data-items="features"><ul><li data-items="features">x</li></ul></li></ul>', '<ol><li data-repeat="posts"><ul><li data-items="features">x</li></ul></li></ol>']) {
    for (const render of [renderCanvas, renderTheme]) assert.throws(() => render(doc(), src, { content: state.content, ghost: { posts: [{}] } }), /data-items="features" sits inside/)
  }
  // and the reverse: a Ghost repeat inside an item would bake one {{#get}} per item
  for (const src of ['<ul><li data-items="features"><ol><li data-repeat="posts">x</li></ol></li></ul>', '<ul><li data-items="features"><ul><li data-items="features">x</li></ul></li></ul>']) {
    for (const render of [renderCanvas, renderTheme]) assert.throws(() => render(doc(), src, { content: state.content, ghost: { posts: [{}] } }), /data-items="features" (contains|sits inside)/)
  }
})

// review: the runtime's attribute grammar is the last gate on a drawing, and it was proved on three icons —
// a Tabler bump that ships a value shape the grammar refuses would draw empty slots with nothing red
test('every vendored icon, outline and filled, passes the runtime\'s attribute grammar and draws', () => {
  let drawn = 0
  for (const icon of ICONS) {
    for (const key of icon.filled ? [icon.name, filledKey(icon.name)] : [icon.name]) {
      const svg = iconSvg(key, iconDrawing)
      assert.ok(svg !== null && svg.includes('<path'), `${key} did not draw`)
      drawn++
    }
  }
  assert.ok(drawn > ICONS.length, 'the filled drawings were not walked')
})

test('row · a Portal link: href="#" data-portal on both emitters, never upgrade; an action outside the four is unset', () => {
  const link = (v: unknown) => both(ok(setContent(entry, start(), 'issue.link', v)))
  for (const html of Object.values(link({ portal: 'account/plans' }))) {
    assert.match(html, /<a class="cx__link" href="#" data-portal="account\/plans">/)
  }
  for (const html of Object.values(link({ portal: 'upgrade' }))) {
    assert.doesNotMatch(html, /data-portal/)
    assert.doesNotMatch(html, /<a class="cx__link" href=/, 'an unset link carried an href')
  }
})

test('row · Ghost search: href="#" data-ghost-search; any other search value is unset', () => {
  const link = (v: unknown) => both(ok(setContent(entry, start(), 'issue.link', v)))
  for (const html of Object.values(link({ search: true }))) assert.match(html, /href="#" data-ghost-search=""/)
  for (const bad of ['true', 1, {}]) {
    for (const html of Object.values(link({ search: bad }))) assert.doesNotMatch(html, /data-ghost-search/)
  }
})

test('row · an external link: target and rel from the record, javascript: becomes #, an unknown rel is dropped', () => {
  const link = (v: unknown) => both(ok(setContent(entry, start(), 'issue.link', v)))
  for (const html of Object.values(link({ href: 'https://x.example/', newTab: true, rel: ['sponsored', 'evil'] }))) {
    assert.match(html, /href="https:\/\/x\.example\/" target="_blank" rel="noreferrer sponsored"/)
  }
  for (const html of Object.values(link({ href: 'javascript:alert(1)' }))) {
    assert.match(html, /<a class="cx__link" href="#">/)
    assert.doesNotMatch(html, /javascript:/)
  }
  // a Portal record's newTab and rel could never act, so they are not compiled
  for (const html of Object.values(link({ portal: 'signup', newTab: true, rel: ['nofollow'] }))) assert.doesNotMatch(html, /target=|rel=/)
})

test('row · FR-F8: an unset destination hides its element on both emitters, and it appears once set', () => {
  for (const html of Object.values(both(start()))) assert.ok(!html.includes(props['archive.label'].default), `the archive link rendered with no destination: ${html}`)
  const set = ok(setContent(entry, start(), 'archive.link', { href: 'https://orbit-weekly.example/archive/' }))
  for (const html of Object.values(both(set))) assert.ok(html.includes(`href="https://orbit-weekly.example/archive/">${props['archive.label'].default}<`), html)
})

test('row · an icon: Tabler\'s drawing in its own wrapper, inline, once, aria-hidden and identical on both emitters', () => {
  const withIcon = (icon: string) => ok(setContent(entry, start(), 'features[].icon', icon, 0))
  for (const [name, wrapper] of [['rocket', /<svg[^>]*fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">/], ['heart-filled', /<svg[^>]*viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">/]] as const) {
    const { canvas, theme } = both(withIcon(name))
    const svg = (html: string) => /<span class="cx__icon">(<svg[^]*?<\/svg>)<\/span>/.exec(html)?.[1] ?? ''
    assert.match(svg(canvas), wrapper)
    assert.equal(svg(canvas), svg(theme), `${name} differs between emitters`)
    assert.equal(svg(canvas).split('<path ').length - 1, iconDrawing(name)!.length, 'every path once')
    assert.doesNotMatch(canvas + theme, /<use|sprite|font-family/)
  }
  // a name not in the set is an empty slot
  for (const html of Object.values(both(withIcon('"><script>')))) {
    assert.match(html, /<span class="cx__icon"><\/span>/)
    assert.doesNotMatch(html, /<script/)
  }
  // a drawing whose path attributes fail validation is not emitted
  const hostile: IconLookup = (n) => (n === 'rocket' ? [['path', { d: 'M0 0"/><script>alert(1)</script>' }]] : iconDrawing(n))
  const extra: IconLookup = (n) => (n === 'rocket' ? [['path', { d: 'M0 0h24', onload: 'alert(1)' }]] : iconDrawing(n))
  for (const icons of [hostile, extra]) {
    for (const html of Object.values(both(withIcon('rocket'), { icons }))) assert.match(html, /<span class="cx__icon"><\/span>[^]*<span class="cx__icon"><svg/)
  }
  // a design with an icon prop rendered without the lookup refuses by name
  for (const render of [renderCanvas, renderTheme]) {
    assert.throws(() => render(doc(), HTML, { ...input(start()), icons: undefined }), /"features\[\]\.icon" is an icon prop/)
  }
})

test('row · an image resolves its asset id through assets on both emitters; an id with no entry, or a URL, is unset', () => {
  for (const html of Object.values(both(start()))) assert.match(html, /<img class="cx__picture" alt="[^"]*" src="\/pool\/feature-03\.svg">/)
  for (const v of ['feature-99', 'https://evil.example/x.png']) {
    for (const html of Object.values(both(ok(setContent(entry, start(), 'picture', v))))) assert.doesNotMatch(html, /cx__picture/, `${v} rendered`)
  }
})

test('row · a date is printed unconverted in datetime and as text; anything but YYYY-MM-DD is unset', () => {
  for (const html of Object.values(both(start()))) assert.match(html, new RegExp(`<time class="cx__date" datetime="${props.nextIssue.default}">${props.nextIssue.default}</time>`))
  for (const html of Object.values(both(ok(setContent(entry, start(), 'nextIssue', '1 October 2026'))))) {
    assert.match(html, /<time class="cx__date">d<\/time>/, 'an unset date keeps the authored text and sets no datetime')
  }
})

test('row · editing text that carries marks moves the marks with it', () => {
  const v: RichText = { text: 'Hello world', marks: [{ start: 6, end: 11, mark: 'strong' }] }
  assert.deepEqual((editText(v, 'Hello, world') as RichText).marks, [{ start: 7, end: 12, mark: 'strong' }])
  // cut through: what survives is kept; nothing left is dropped
  assert.deepEqual((editText(v, 'Hello wo') as RichText).marks, [{ start: 6, end: 8, mark: 'strong' }])
  assert.deepEqual((editText(v, 'Hello ') as RichText).marks, [])
  // typed inside a mark grows it; a plain string stays a plain string
  assert.deepEqual((editText(v, 'Hello wo-rld') as RichText).marks, [{ start: 6, end: 12, mark: 'strong' }])
  assert.equal(editText('plain', 'plainer'), 'plainer')
})

test('row · the Ghost-sourced Count: the canvas shows that many rows and the theme\'s {{#get}} carries the limit', () => {
  const declared = entry.dataBindings!['latest']!.limit!
  const five = ok(setData(entry, start(), 'latest', 'count', declared + 2))
  const canvas = renderCanvas(doc(), HTML, input(five, { getRows: { latest: rowsFor('latest') } }))
  assert.equal((canvas.match(/class="cx__post"/g) ?? []).length, declared + 2)
  assert.match(renderTheme(doc(), HTML, input(five)).template, new RegExp(`\\{\\{#get "posts"[^}]*limit="${declared + 2}"`))
  for (const junk of [0, 101, 3.5]) {
    assert.equal(typeof setData(entry, start(), 'latest', 'count', junk), 'string')
    assert.equal(withData(entry.dataBindings, { latest: { count: junk } })['latest']!.limit, declared, `${junk} was not ignored`)
  }
  // Order folds in as a date order; a hand-picked binding has neither
  const oldest = ok(setData(entry, five, 'latest', 'order', 'oldest'))
  assert.match(renderTheme(doc(), HTML, input(oldest)).template, /order="published_at asc"/)
  const picked = { ...entry, dataBindings: { latest: { source: 'posts', ids: ['905700000000000000000001'] } } }
  assert.equal(sidebar(picked, start()).groups.find((g) => g.id === 'data'), undefined, 'a hand-picked list alone draws no Data group')
  assert.equal(typeof setData(picked, start(), 'latest', 'count', 5), 'string')
})

test('row · the cap: more own controls than CONTROL_CAP is refused, and the universals and the Data group are not counted', () => {
  const own = (n: number) => Array.from({ length: n }, (_, i) => ({ ...design.controlSchema[2]!, name: `c${i}` }))
  const at = validateDesignJson({ ...(design as unknown as DesignJson), controlSchema: own(CONTROL_CAP) as DesignJson['controlSchema'] })
  assert.ok(!at.some((f) => f.code === 'control-cap'), 'the cap itself is legal, with the trio narrowed and a query declared')
  const over = validateDesignJson({ ...(design as unknown as DesignJson), controlSchema: own(CONTROL_CAP + 1) as DesignJson['controlSchema'] })
  assert.ok(over.some((f) => f.code === 'control-cap'))
})

test('row · one name, one value set: the category union refuses two, naming both designs (R-53)', () => {
  const other = { id: 'controls/2', controlSchema: [{ ...entry.controlSchema[0]!, values: ['1', '2'] }] }
  const refused = categoryControlUnion([entry, other])
  assert.equal(typeof refused, 'string')
  assert.match(String(refused), /controls\/1/)
  assert.match(String(refused), /controls\/2/)
  assert.ok(Array.isArray(categoryControlUnion([entry, { id: 'controls/2', controlSchema: [entry.controlSchema[0]!] }])))
})

test('row · Reset this design: every control and data control back to its default, the words, items and dark overrides stay', () => {
  let state = start({ darkOverrides: { bg: 'contrast' } })
  state = ok(setControl(entry, state, 'columns', '2'))
  state = ok(setControl(entry, state, 'align', 'center'))
  state = ok(setData(entry, state, 'latest', 'count', 5))
  state = ok(setData(entry, state, 'latest', 'order', 'oldest'))
  state = ok(setContent(entry, state, 'eyebrow', 'Changed words'))
  state = ok(addItem(entry, state, 'features'))
  const reset = resetSection(entry, state)
  const m = sidebar(entry, reset)
  const rows = m.groups.flatMap((g) => g.rows)
  assert.ok(rows.every((r) => r.kind === 'prop' || !(r as ControlRow | DataRow).changed), 'something is still changed')
  assert.deepEqual(resolveControls(entry, reset.controls), resolveControls(entry, {}))
  assert.equal(reset.content, state.content, 'the words and the items stay')
  assert.equal(reset.darkOverrides, state.darkOverrides, 'the stored dark overrides stay')
})

test('R-115 — what Reset this design would undo: nothing at the defaults, a data-only change, and a greyed row\'s stored value, in the panel\'s order', () => {
  assert.deepEqual(resetChanges(entry, start()), [], 'nothing to reset at the defaults, so the panel asks nothing')
  const data = ok(setData(entry, ok(setData(entry, start(), 'latest', 'count', 5)), 'latest', 'order', 'oldest'))
  assert.deepEqual(resetChanges(entry, data), ['Show', 'Order'], 'a change to the Data group alone is a change')
  // Rule under heading set away from its default, then greyed by Alignment: its row offers no reset, but reset clears it
  const greyed = ok(setControl(entry, ok(setControl(entry, start(), 'rule', 'none')), 'align', 'center'))
  assert.equal(control(greyed, 'rule').changed, false, 'the greyed row carries no reset of its own')
  assert.deepEqual(resetChanges(entry, greyed), ['Alignment', 'Rule under heading'])
  // a stored value equal to the default is not a change, and junk is not one either
  assert.deepEqual(resetChanges(entry, start({ controls: { columns: '3', card: '12px' } })), [])
  assert.deepEqual(resetChanges(entry, resetSection(entry, greyed)), [])
  // the panel's order, not the declaration's: Columns is declared first, and Content is drawn above Layout
  assert.deepEqual(resetChanges(entry, ok(setControl(entry, ok(setControl(entry, start(), 'columns', '2')), 'icons', 'off'))), ['Show icons', 'Columns'])
})

test('R-115 — Reset this design removes exactly what its confirm names: another design\'s parked values stay (FR-D17)', () => {
  const parked = start({ controls: { columns: '2', 'nav-position': 'left' }, data: { latest: { count: 5 }, rail: { count: 7 } } })
  assert.deepEqual(resetChanges(entry, parked), ['Columns', 'Show'], 'the confirm names this design\'s changes only')
  const reset = resetSection(entry, parked)
  assert.deepEqual(reset.controls, { 'nav-position': 'left' }, 'a control this design does not declare is parked, not reset')
  assert.deepEqual(reset.data, { rail: { count: 7 } }, 'a query this design does not draw keeps its Count')
  assert.deepEqual(resetChanges(entry, reset), [])
})

test('row · R-108, a query the design fixes: no Show and no Order, a stored Count and Order are ignored, and both emitters render one post', () => {
  const fixed = { ...entry, dataBindings: { latest: { source: 'posts', limit: 1, order: 'published_at desc', fixed: true as const } } }
  assert.deepEqual(validateDesignJson({ ...(design as unknown as DesignJson), dataBindings: fixed.dataBindings }), [], 'the declaration validates')
  // the panel: nothing to draw, so the Data group is absent — Story 5.19 adds Which post
  assert.equal(sidebar(fixed, start()).groups.find((g) => g.id === 'data'), undefined, 'a fixed query alone draws no Data group')
  for (const control of ['count', 'order'] as const) {
    assert.equal(typeof setData(fixed, start(), 'latest', control, control === 'count' ? 5 : 'oldest'), 'string', `${control} is refused`)
  }
  // the fold: a Count and an Order stored under the same key by another design never reach the query
  const stored = { latest: { count: 5, order: 'oldest' } }
  assert.deepEqual(withData(fixed.dataBindings, stored)['latest'], fixed.dataBindings.latest)
  const state = start({ data: stored })
  const canvas = renderCanvas(doc(), HTML, input(state, { dataBindings: fixed.dataBindings, getRows: { latest: rowsFor('latest', 5) } }))
  assert.equal((canvas.match(/class="cx__post"/g) ?? []).length, 1, `the canvas showed more than one post: ${canvas}`)
  const theme = renderTheme(doc(), HTML, input(state, { dataBindings: fixed.dataBindings })).template
  assert.ok(theme.includes('{{#get "posts" limit="1" order="published_at desc"}}'), theme)
  // the control: the same query unfixed takes the stored Count, so the flag is what held it
  const loose = { latest: { source: 'posts', limit: 1, order: 'published_at desc' } }
  assert.equal(withData(loose, stored)['latest']!.limit, 5)
  assert.ok(sidebar({ ...entry, dataBindings: loose }, start()).groups.some((g) => g.id === 'data'))
})
