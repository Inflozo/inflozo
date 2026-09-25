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
// Story 5.11's ring fixture — the other two designs of the same category (R-158)
import design2 from '../../library/fixtures/controls/2/design.json' with { type: 'json' }
import design3 from '../../library/fixtures/controls/3/design.json' with { type: 'json' }
import content from '../../library/fixtures/controls/content.json' with { type: 'json' }
import {
  addItem, darkOverridesInForce, defaultContent, duplicateItem, itemsShown, moveItem, removeItem, resetChanges,
  resetControl, resetSection, resolveControls, setContent, setControl, setData, sidebar, storedFor, switchControls,
  withData,
} from './controls.ts'
import type { ControlRow, ControlState, DataRow, Mode, PropRow } from './controls.ts'
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

/* Story 5.11's ring fixture, held in memory for the same reason `HTML` is: a core package's test cannot open a
   file (AD-1). The on-disk copies are validated end to end by `tools/stress/test-vocabulary.mjs` and
   `apps/web/controls.test.ts`, and the shapes below carry exactly what these tests read — the roots' declared
   controls, the features list and, on design 2, FR-D13's cap. */
const HTML2 = `<section class="cy" data-bg="surface" data-spacing="comfortable" data-divider="line" data-columns="3" data-card="outlined" data-align="start" data-icons="on" data-image="side" data-frame="none">
  <p class="cy__eyebrow" data-prop="eyebrow">e</p>
  <h2 class="cy__title" data-prop="heading">h</h2>
  <img class="cy__picture" data-prop-attr="src:picture;alt:pictureAlt" data-empty="hide" alt="">
  <ul class="cy__features"><li class="cy__feature" data-items="features" data-items-limit="2"><span class="cy__icon" data-prop="features[].icon"></span><span class="cy__t" data-prop="features[].title">t</span></li></ul>
  <a class="cy__link" data-prop="issue.label" data-prop-attr="href:issue.link">l</a>
</section>`

const HTML3 = `<section class="cz" data-bg="base" data-spacing="comfortable" data-divider="none" data-columns="2" data-card="flat" data-align="center" data-rule="line" data-stack="rows">
  <p class="cz__eyebrow" data-prop="eyebrow">e</p>
  <h2 class="cz__title" data-prop="heading">h</h2>
  <time class="cz__date" data-prop="nextIssue" data-prop-attr="datetime:nextIssue">d</time>
  <ul class="cz__features"><li class="cz__feature" data-items="features"><span class="cz__t" data-prop="features[].title">t</span></li></ul>
  <a class="cz__link" data-prop="archive.label" data-prop-attr="href:archive.link" data-empty="hide">a</a>
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
const control = (state: ControlState, name: string, mode: Mode = 'light'): ControlRow => {
  const m = sidebar(entry, state, mode)
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
  assert.deepEqual(resetChanges(entry, data), ['Count', 'Order'], 'a change to the Data group alone is a change')
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

test('R-115 — Reset this design removes exactly what its confirm names, and keeps what only another design uses', () => {
  const kept = start({ controls: { columns: '2', 'nav-position': 'left' }, data: { latest: { count: 5 }, rail: { count: 7 } } })
  assert.deepEqual(resetChanges(entry, kept), ['Columns', 'Count'], 'the confirm names this design\'s changes only')
  const reset = resetSection(entry, kept)
  assert.deepEqual(reset.controls, { 'nav-position': 'left' }, 'a control this design does not declare stays')
  assert.deepEqual(reset.data, { rail: { count: 7 } }, 'a query this design does not bind keeps its Count')
  assert.deepEqual(resetChanges(entry, reset), [])
  // the universal trio is this design's too: named, and removed
  const bg = ok(setControl(entry, start(), 'bg', 'contrast'))
  assert.deepEqual(resetChanges(entry, bg), ['Background role'])
  assert.deepEqual(resetSection(entry, bg).controls, {})
  // FR-D19 carries a universal's value under the name both designs declare: a design that narrows it away neither
  // names it nor removes it, so the design that offers it gets it back
  const narrowed = { ...entry, universals: { bg: { values: ['base', 'surface'], reason: 'Drawn for plain grounds.' } } }
  const carried = start({ controls: { bg: 'contrast', columns: '2', card: '12px' } })
  assert.deepEqual(resetChanges(narrowed, carried), ['Columns'])
  assert.deepEqual(resetSection(narrowed, carried).controls, { bg: 'contrast' }, 'the carried value stays; junk under a declared name goes')
  // R-103's locks carry a value the same way, at one value or none
  for (const values of [['surface'], []]) {
    const locked = { ...entry, universals: { bg: { values, reason: 'The ground is the design.' } } }
    assert.deepEqual(resetSection(locked, start({ controls: { bg: 'contrast', columns: '2' } })).controls, { bg: 'contrast' }, `a lock at [${values.join()}] keeps a carried value`)
  }
  // a value at this design's own default is named nowhere, so it stays too — another design's default may differ
  const atDefault = start({ controls: { columns: '3', align: 'center' }, data: { latest: { count: 3, order: 'newest' } } })
  assert.deepEqual(resetChanges(entry, atDefault), ['Alignment'])
  const cleared = resetSection(entry, atDefault)
  assert.deepEqual(cleared.controls, { columns: '3' })
  assert.deepEqual(cleared.data, { latest: { count: 3, order: 'newest' } })
  // and junk in a drawn query field goes, as junk under a declared name does
  assert.deepEqual(resetSection(entry, start({ data: { latest: { count: 'lots', order: 'newest' } } })).data, { latest: { order: 'newest' } })
  assert.deepEqual(resetSection(entry, start({ data: { latest: 'x', rail: 'y' } })).data, { rail: 'y' }, 'a drawn query\'s junk record goes; another key stays')
  assert.deepEqual(resetSection(entry, start({ data: { latest: [3, 'newest'] } as never })).data, {}, 'an array is not a record either')
  // a query field this design draws no row for is another design's: a fixed query's parked Count, a tags query's Order
  const fixed = { ...entry, dataBindings: { latest: { source: 'posts', limit: 1, fixed: true as const } } }
  assert.deepEqual(resetSection(fixed, start({ data: { latest: { count: 5 } } })).data, { latest: { count: 5 } })
  const tags = { ...entry, dataBindings: { latest: { source: 'tags' } } }
  const both = start({ data: { latest: { count: 9, order: 'oldest' } } })
  assert.deepEqual(resetChanges(tags, both), ['Count'])
  assert.deepEqual(resetSection(tags, both).data, { latest: { order: 'oldest' } })
})

test('a Count reaches an emitter only where the panel draws its Count row — never for a source Ghost returns whole', () => {
  assert.equal(withData({ plans: { source: 'tiers' } }, { plans: { count: 2 } })['plans']!.limit, undefined)
  assert.equal(withData({ tags: { source: 'tags' } }, { tags: { count: 2 } })['tags']!.limit, 2, 'the control: a tags query takes it')
})

test('row · R-108, a query the design fixes: no Count and no Order, a stored Count and Order are ignored, and both emitters render one post', () => {
  const fixed = { ...entry, dataBindings: { latest: { source: 'posts', limit: 1, order: 'published_at desc', fixed: true as const } } }
  assert.deepEqual(validateDesignJson({ ...(design as unknown as DesignJson), dataBindings: fixed.dataBindings }), [], 'the declaration validates')
  // the panel: Story 5.19's Source alone (R-108) — never a Count or an Order
  assert.deepEqual(sidebar(fixed, start()).groups.find((g) => g.id === 'data')?.rows.map((r) => (r as DataRow).control), ['source'], 'a fixed query draws Source alone')
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
  assert.ok(theme.includes('{{#get "posts" limit="1" order="published_at desc" include="tags,authors"}}'), theme)
  // the control: the same query unfixed takes the stored Count, so the flag is what held it
  const loose = { latest: { source: 'posts', limit: 1, order: 'published_at desc' } }
  assert.equal(withData(loose, stored)['latest']!.limit, 5)
  assert.ok(sidebar({ ...entry, dataBindings: loose }, start()).groups.some((g) => g.id === 'data'))
})

// ─── Story 5.19 — P0·5's Data group: Source, the tag or writer, the picked list, Count and Order ────────────────
//
// The sample's `latest` is a posts query the design leaves open (no declared filter or ids), so it offers Source; the
// fold is `withData`, the ONE door both emitters and the editor's reads go through.

const data = (over: Record<string, unknown>) => start({ data: { latest: over } })
const rowsOf = (e: typeof entry, state: ControlState) =>
  sidebar(e, state).groups.find((g) => g.id === 'data')?.rows.map((r) => r as DataRow) ?? []
const PICK = (n: number) => ({ id: `90570000000000000000000${n}`, title: `Pick ${n}` })

test('Story 5.19 · the fold, Source by Source — featured, a quoted tag or writer, and the picks in their dragged order', () => {
  const fold = (over: Record<string, unknown>) => withData(entry.dataBindings, { latest: over })['latest']!
  const declared = entry.dataBindings!['latest']!
  assert.deepEqual(fold({}), declared, 'Latest, untouched, is the declaration')
  assert.deepEqual(fold({ source: 'latest', count: 5 }), { ...declared, limit: 5 })
  assert.deepEqual(fold({ source: 'featured' }), { ...declared, filter: 'featured:true' })
  assert.deepEqual(fold({ source: 'tag', tag: 'field-notes', order: 'oldest' }), { ...declared, filter: "tag:'field-notes'", order: 'published_at asc' })
  assert.deepEqual(fold({ source: 'author', author: 'rosa-menendez', count: 2 }), { ...declared, filter: "authors:'rosa-menendez'", limit: 2 })
  // hand-picked: the ids in the dragged order, and the filter, the limit and the order dropped — the picks ARE all three
  assert.deepEqual(fold({ source: 'picked', picks: [PICK(3), PICK(1)], count: 9, order: 'oldest' }), { source: 'posts', ids: [PICK(3).id, PICK(1).id] })
  assert.deepEqual(fold({ source: 'picked' }), { source: 'posts', ids: [] }, 'nothing picked is zero items')
  // NOTHING CHOSEN IS LOST BY A SOURCE SWITCH: only the value in force is folded
  const all = { tag: 'field-notes', author: 'rosa-menendez', picks: [PICK(2)] }
  assert.equal(fold({ source: 'tag', ...all }).filter, "tag:'field-notes'")
  assert.equal(fold({ source: 'author', ...all }).filter, "authors:'rosa-menendez'")
  assert.deepEqual(fold({ source: 'picked', ...all }).ids, [PICK(2).id])
})

test('Story 5.19 · AD-36 — a value outside the grammar is ignored by the fold, so the declaration stands', () => {
  const fold = (over: Record<string, unknown>) => withData(entry.dataBindings, { latest: over })['latest']!
  const declared = entry.dataBindings!['latest']!
  for (const tag of ["x'}}{{#get \"posts\"}}", 'Field Notes', 'a"b', '', 7, null]) {
    assert.deepEqual(fold({ source: 'tag', tag }), declared, `tag ${JSON.stringify(tag)}`)
    assert.deepEqual(fold({ source: 'author', author: tag }), declared, `author ${JSON.stringify(tag)}`)
  }
  for (const source of ['everything', 'tags', {}, 3]) assert.deepEqual(fold({ source }), declared, `source ${JSON.stringify(source)}`)
  // an id that is not 24 hex digits is dropped from the picks; the good one beside it survives
  assert.deepEqual(fold({ source: 'picked', picks: [{ id: 'zz', title: 't' }, { id: `${PICK(1).id}"}}`, title: 't' }, PICK(1), 'junk'] }).ids, [PICK(1).id])
  // and the legitimate one emits, on the theme, quoted
  const theme = renderTheme(doc(), HTML, input(data({ source: 'tag', tag: 'field-notes' }))).template
  assert.ok(theme.includes(`{{#get "posts" filter="tag:'field-notes'" limit="3" order="published_at desc" include="tags,authors"}}`), theme)
})

test('Story 5.19 · the rows: Source, then the tag or writer or the picked list, then Count and Order — P0·5\'s order and words', () => {
  const controls = (state: ControlState) => rowsOf(entry, state).map((r) => [r.control, r.label])
  assert.deepEqual(controls(start()), [['source', 'Source'], ['count', 'Count'], ['order', 'Order']])
  assert.deepEqual(rowsOf(entry, start())[0]!.options?.map((o) => o.label), ['Latest', 'Featured', 'By tag', 'By author', 'Hand-picked'])
  assert.deepEqual(controls(data({ source: 'tag' })), [['source', 'Source'], ['tag', 'Tag'], ['count', 'Count'], ['order', 'Order']])
  assert.deepEqual(controls(data({ source: 'author' })), [['source', 'Source'], ['author', 'Author'], ['count', 'Count'], ['order', 'Order']])
  assert.deepEqual(controls(data({ source: 'picked' })), [['source', 'Source'], ['picks', 'Picked posts'], ['count', 'Count'], ['order', 'Order']])
  // Count is 1–100 and its word is Count, never Show (R-170)
  const count = rowsOf(entry, start()).find((r) => r.control === 'count')!
  assert.deepEqual([count.min, count.max, count.label], [1, 100, 'Count'])
  assert.equal(setData(entry, start(), 'latest', 'count', 101), 'Count is a number from 1 to 100.')
})

test('Story 5.19 · at Hand-picked, Count shows the number of picks and Order marks no value — both greyed with P0·5\'s sentences', () => {
  const state = data({ source: 'picked', picks: [PICK(1), PICK(2), PICK(3)], count: 5, order: 'oldest' })
  const rows = rowsOf(entry, state)
  const count = rows.find((r) => r.control === 'count')!
  const order = rows.find((r) => r.control === 'order')!
  assert.deepEqual([count.value, count.greyed], ['3', 'The list you picked is the count.'])
  assert.deepEqual([order.value, order.greyed], ['', 'The list you picked is the order — these posts render in the order you dragged them.'])
  assert.deepEqual(rows.find((r) => r.control === 'picks')?.picks, [PICK(1), PICK(2), PICK(3)])
  // a greyed row takes no value; its stored Count and Order wait, untouched, and return with Latest
  assert.equal(setData(entry, state, 'latest', 'count', 4), 'The list you picked is the count.')
  const back = ok(setData(entry, state, 'latest', 'source', 'latest'))
  assert.deepEqual(withData(entry.dataBindings, back.data)['latest'], { ...entry.dataBindings!['latest']!, limit: 5, order: 'published_at asc' })
})

test('Story 5.19 · setData: every Source, the tag, the writer and the picks — and junk refused in a sentence', () => {
  let state = ok(setData(entry, start(), 'latest', 'source', 'tag'))
  state = ok(setData(entry, state, 'latest', 'tag', 'field-notes'))
  assert.equal(withData(entry.dataBindings, state.data)['latest']!.filter, "tag:'field-notes'")
  // the writer row exists only under By author: a value is set for the Source in force
  assert.equal(typeof setData(entry, state, 'latest', 'author', 'rosa-menendez'), 'string')
  state = ok(setData(entry, state, 'latest', 'source', 'picked'))
  state = ok(setData(entry, state, 'latest', 'picks', [PICK(2), PICK(1)]))
  assert.deepEqual(withData(entry.dataBindings, state.data)['latest']!.ids, [PICK(2).id, PICK(1).id])
  // past 25 nothing is blocked: the warning is the panel's, never a refusal
  const many = Array.from({ length: 30 }, (_, i) => ({ id: `9057000000000000000000${String(i + 10).padStart(2, '0')}`, title: `P${i}` }))
  assert.equal(withData(entry.dataBindings, ok(setData(entry, state, 'latest', 'picks', many)).data)['latest']!.ids?.length, 30)
  // the tag is still stored while the picks are in force — nothing chosen is lost
  assert.equal((state.data!['latest'] as Record<string, unknown>)['tag'], 'field-notes')
  for (const [control, junk] of [['source', 'all'], ['picks', [{ id: 'nope', title: 'x' }]], ['picks', 'x']] as const) {
    assert.equal(typeof setData(entry, state, 'latest', control, junk), 'string', `${control} ${JSON.stringify(junk)}`)
  }
  const tagged = ok(setData(entry, start(), 'latest', 'source', 'tag'))
  for (const junk of ["x'}}", 'Two Words', 3]) assert.equal(typeof setData(entry, tagged, 'latest', 'tag', junk), 'string')
})

test('Story 5.19 · a FIXED query (R-108) offers Source alone, and its Hand-picked holds at most its own limit', () => {
  const fixed = { ...entry, dataBindings: { latest: { source: 'posts', limit: 1, order: 'published_at desc', fixed: true as const } } }
  const picked = start({ data: { latest: { source: 'picked' } } })
  assert.deepEqual(rowsOf(fixed, picked).map((r) => r.control), ['source', 'picks'])
  assert.equal(rowsOf(fixed, picked).find((r) => r.control === 'picks')?.cap, 1)
  assert.equal(typeof setData(fixed, picked, 'latest', 'picks', [PICK(1), PICK(2)]), 'string', 'two picks do not fit one post')
  const one = ok(setData(fixed, picked, 'latest', 'picks', [PICK(1)]))
  // the fold drops `fixed` with the limit and the order — a hand-picked list is already fixed (R-20)
  assert.deepEqual(withData(fixed.dataBindings, one.data)['latest'], { source: 'posts', ids: [PICK(1).id] })
  // a stored list longer than the cap (from another design) is folded to the cap, never past it
  assert.deepEqual(withData(fixed.dataBindings, { latest: { source: 'picked', picks: [PICK(1), PICK(2)] } })['latest']!.ids, [PICK(1).id])
  // Featured, a tag and a writer fold into the fixed query as filters, its number and order unmoved
  assert.deepEqual(withData(fixed.dataBindings, { latest: { source: 'featured', count: 9 } })['latest'], { ...fixed.dataBindings.latest, filter: 'featured:true' })
  // a declared filter is the design's own and draws no Source row; a tags query offers none either
  assert.ok(!rowsOf({ ...entry, dataBindings: { latest: { source: 'posts', filter: 'tag:craft' } } }, start()).some((r) => r.control === 'source'))
  assert.ok(!rowsOf({ ...entry, dataBindings: { latest: { source: 'tags' } } }, start()).some((r) => r.control === 'source'))
})

test('Story 5.19 · the main feed\'s Data group is D5c\'s: Count greyed at the page size in force, and no Source or Order', () => {
  const main = { ...entry, dataBindings: {}, feed: { kind: 'main' as const, postsPerPage: 12 } }
  const rows = rowsOf(main, start())
  assert.deepEqual(rows.map((r) => [r.control, r.value, r.greyed]), [['count', '12', "This feed is sized by your theme's Posts per page."]])
  assert.equal(typeof setData(main, start(), 'posts', 'count', 5), 'string')
  // a SECONDARY feed's rows are the same functions over data.posts and its base query
  const secondary = { ...entry, dataBindings: {}, feed: { kind: 'secondary' as const, base: { source: 'posts', limit: 12, order: 'published_at desc' } } }
  assert.deepEqual(rowsOf(secondary, start()).map((r) => [r.key, r.control, r.value]), [['posts', 'source', 'latest'], ['posts', 'count', '12'], ['posts', 'order', 'newest']])
  const three = ok(setData(secondary, start(), 'posts', 'count', 3))
  assert.deepEqual(three.data, { posts: { count: 3 } })
})

test('Story 5.19 · Reset names and removes every changed Data row — the Source, the tag, the picks — and keeps what is not drawn', () => {
  let state = ok(setData(entry, start(), 'latest', 'source', 'tag'))
  state = ok(setData(entry, state, 'latest', 'tag', 'field-notes'))
  state = ok(setData(entry, state, 'latest', 'count', 5))
  assert.deepEqual(resetChanges(entry, state), ['Source', 'Tag', 'Count'])
  assert.deepEqual(resetSection(entry, state).data, {})
  // picks drawn under Hand-picked go with a reset; a tag stored beside them is not drawn there, so it waits
  const picked = data({ source: 'picked', picks: [PICK(1)], tag: 'field-notes' })
  assert.deepEqual(resetChanges(entry, picked), ['Source', 'Picked posts'])
  assert.deepEqual(resetSection(entry, picked).data, { latest: { tag: 'field-notes' } })
})

// ─── Story 5.6 — FR-D7's mode, every row of the spec's I/O matrix the engine owns ────────────────────────────────
//
// `bg` (Background role) is a UNIVERSAL this sample narrows to base · surface · contrast, and `tint` is the sample's
// OWN `darkOverride: true` control — so both kinds of mode-scoped control are exercised, which is what proves the
// engine keys on the DECLARATION and never on the name `bg`.

test('FR-D7 — the mode picks the stored slice: a dark override in dark, the light value in light, and nothing else moves', () => {
  const state = start({ controls: { bg: 'base', columns: '2' }, darkOverrides: { bg: 'contrast' } })
  assert.equal(storedFor(entry, state)['bg'], 'base', 'light reads `controls`')
  assert.equal(storedFor(entry, state, 'dark')['bg'], 'contrast', 'dark reads the override')
  assert.equal(storedFor(entry, state, 'dark')['columns'], '2', 'a control that is not mode-scoped is one value for both')
  // and the ONE door both emitters read produces the dark render from that slice alone — no mode inside it (AD-30)
  assert.equal(resolveControls(entry, storedFor(entry, state))['bg'], 'base')
  assert.equal(resolveControls(entry, storedFor(entry, state, 'dark'))['bg'], 'contrast')
  for (const html of [both(state).canvas, both(state).theme]) assert.match(rootOf(html), /data-bg="base"/)
  const dark = { ...state, controls: storedFor(entry, state, 'dark') }
  for (const html of [both(dark).canvas, both(dark).theme]) assert.match(rootOf(html), /data-bg="contrast"/)
})

test('FR-D7 — a design\'s OWN mode-scoped control works the same way, so nothing is special-cased to `bg`', () => {
  const state = start({ controls: { tint: 'none' }, darkOverrides: { tint: 'strong' } })
  assert.equal(storedFor(entry, state, 'dark')['tint'], 'strong')
  assert.equal(control(state, 'tint', 'dark').value, 'strong')
  assert.equal(control(state, 'tint').value, 'none', 'light is untouched')
  assert.equal(control(state, 'tint').moon, true, 'the moon shows whichever mode is being viewed')
})

test('FR-D7 — in dark a mode-scoped write lands in `darkOverrides` and one that is not mode-scoped lands in `controls`', () => {
  const scoped = ok(setControl(entry, start({ controls: { bg: 'base' } }), 'bg', 'contrast', 'dark'))
  assert.deepEqual(scoped.darkOverrides, { bg: 'contrast' })
  assert.deepEqual(scoped.controls, { bg: 'base' }, 'the light page keeps what it had')
  const plain = ok(setControl(entry, start(), 'card', 'raised', 'dark'))
  assert.deepEqual(plain.controls, { card: 'raised' })
  assert.equal(plain.darkOverrides, undefined)
  // in LIGHT a mode-scoped write is the ordinary one
  const light = ok(setControl(entry, start({ darkOverrides: { bg: 'contrast' } }), 'bg', 'surface'))
  assert.deepEqual(light.controls, { bg: 'surface' })
  assert.deepEqual(light.darkOverrides, { bg: 'contrast' }, 'the dark override is not touched by a light write')
  // and a value this design narrows away is refused in dark exactly as in light (FR-F7)
  assert.equal(setControl(entry, start(), 'bg', 'accent', 'dark'), entry.universals!['bg']!.reason)
})

test('FR-F4 — a reset empties the map the mode names, and the other one is left alone', () => {
  const state = start({ controls: { bg: 'surface' }, darkOverrides: { bg: 'contrast' } })
  const inDark = resetControl(entry, state, 'bg', 'dark')
  assert.deepEqual(inDark.darkOverrides, {}, 'the override is forgotten')
  assert.deepEqual(inDark.controls, { bg: 'surface' }, 'the row returns to the light value')
  assert.equal(control(inDark, 'bg', 'dark').moon, false, 'and the moon goes')
  const inLight = resetControl(entry, state, 'bg')
  assert.deepEqual(inLight.controls, {}, 'the light value is forgotten')
  assert.deepEqual(inLight.darkOverrides, { bg: 'contrast' }, 'the dark override STAYS (FR-F4)')
  assert.equal(control(inLight, 'bg').moon, true)
  // a control that is not mode-scoped resets its light value in either mode
  const plain = start({ controls: { card: 'raised' } })
  assert.deepEqual(resetControl(entry, plain, 'card', 'dark').controls, {})
  // Review: in dark with NO override, the arrow the row shows is the light value's, so pressing it must do something
  const lightOnly = start({ controls: { bg: 'surface' } })
  assert.equal(control(lightOnly, 'bg', 'dark').changed, true)
  assert.deepEqual(resetControl(entry, lightOnly, 'bg', 'dark').controls, {}, 'never a dead arrow')
  // and an override EQUAL to the default is still a change in dark: it carries the moon, so it carries its reset
  const toDefault = start({ controls: { bg: 'surface' }, darkOverrides: { bg: 'base' } })
  assert.equal(control(toDefault, 'bg', 'dark').moon, true)
  assert.equal(control(toDefault, 'bg', 'dark').changed, true)
})

test('FR-F7 — an override the design will not take is resolved away, carries no moon, and is still stored (FR-D19)', () => {
  // `accent` is one of Background role's values and NOT one this design offers (its `universals` narrowing)
  const state = start({ controls: { bg: 'base' }, darkOverrides: { bg: 'accent' } })
  assert.equal(resolveControls(entry, storedFor(entry, state, 'dark'))['bg'], 'base', 'the default stands, never `accent`')
  assert.equal(control(state, 'bg', 'dark').moon, false, 'no moon for a value nothing could stamp')
  // Review: with a light value that is NOT the default, the dark render FOLLOWS LIGHT rather than falling to the default
  const lit = start({ controls: { bg: 'surface' }, darkOverrides: { bg: 'accent' } })
  assert.equal(resolveControls(entry, storedFor(entry, lit, 'dark'))['bg'], 'surface')
  assert.equal(control(state, 'bg').moon, false)
  assert.deepEqual(darkOverridesInForce(entry, state), [])
  assert.deepEqual(state.darkOverrides, { bg: 'accent' }, 'and it is still stored — another design may offer it')
})

test('FR-D7 — an override under a name nothing declares mode-scoped is ignored in both modes and stays stored', () => {
  // `spacing` is a universal with no `darkOverride`; `nonsense` is declared by nothing at all
  const state = start({ darkOverrides: { spacing: 'compact', nonsense: 'x' } })
  for (const mode of ['light', 'dark'] as const) {
    assert.equal(storedFor(entry, state, mode)['spacing'], undefined)
    assert.equal(storedFor(entry, state, mode)['nonsense'], undefined)
    assert.equal(control(state, 'spacing', mode).moon, false)
    assert.equal(resolveControls(entry, storedFor(entry, state, mode))['spacing'], 'comfortable')
  }
  assert.deepEqual(darkOverridesInForce(entry, state), [])
  assert.deepEqual(state.darkOverrides, { spacing: 'compact', nonsense: 'x' })
})

test('FR-D7 — a design whose mode-scoped control is locked to no value (R-103) has nothing to override and no moon', () => {
  const locked = { ...entry, universals: { ...entry.universals, bg: { values: [], reason: 'This design paints its own ground.' } } }
  const state = start({ darkOverrides: { bg: 'contrast' } })
  assert.equal(storedFor(locked, state, 'dark')['bg'], undefined, 'Review: the slice takes only an override in force, so a refused one follows light')
  assert.equal(resolveControls(locked, storedFor(locked, state, 'dark'))['bg'], undefined, 'R-103: no entry at all')
  assert.deepEqual(darkOverridesInForce(locked, state), [], 'nothing offered means nothing an emitter could use')
  assert.equal(control(state, 'bg', 'dark').moon, true, 'the design that DOES offer it still shows the moon')
})

test('FR-D7 — `darkOverridesInForce` is the panel\'s moon, exactly, for both kinds of mode-scoped control', () => {
  const state = start({ darkOverrides: { bg: 'contrast', tint: 'soft' } })
  assert.deepEqual(darkOverridesInForce(entry, state), ['tint', 'bg'], 'declaration order: the design\'s own, then the universals')
  for (const name of ['bg', 'tint']) assert.equal(control(state, name).moon, true, name)
  const moons = sidebar(entry, state).groups.flatMap((g) => g.rows.flatMap((r) => (r.kind === 'control' && r.moon ? [r.name] : [])))
  assert.deepEqual([...moons].sort(), [...darkOverridesInForce(entry, state)].sort())
  assert.deepEqual(darkOverridesInForce(entry, start()), [])
})

// ─── Story 5.11 — carry / park / default, and FR-D13's per-design item cap ──────────────────────────────────
//
// THE THREE FIXTURE DESIGNS ARE THE ONLY RING IN THE REPOSITORY (R-158): design 1 declares `tint` and `rule`,
// design 2 declares neither and adds `frame`, design 3 declares `rule` and adds `stack` — so every arm of the
// rule, and a parked value surviving an INTERMEDIATE design, is a real declaration rather than a mock.

const ringEntry = (n: '1' | '2' | '3') => {
  const built = assembleEntry({
    dir: `packages/library/fixtures/controls/${n}`,
    design: (n === '1' ? design : n === '2' ? design2 : design3) as unknown as DesignJson,
    content: content as unknown as CategoryContent,
    html: n === '1' ? HTML : n === '2' ? HTML2 : HTML3,
    css: '',
  })
  if (typeof built === 'string') throw new Error(built)
  return built
}
const d1 = ringEntry('1')
const d2 = ringEntry('2')
const d3 = ringEntry('3')
const withId = (e: typeof d1) => ({ id: e.id, controlSchema: e.controlSchema, universals: e.universals })

test('a control BOTH designs declare carries its value, in light and in dark', () => {
  const state: ControlState = { controls: { align: 'center', columns: '4' }, darkOverrides: { bg: 'contrast' } }
  const next = switchControls(withId(d1), withId(d2), state)
  assert.equal(next.controls['align'], 'center')
  assert.equal(next.controls['columns'], '4')
  // a universal is declared by every design, so it can never park
  assert.equal(next.darkOverrides['bg'], 'contrast')
  assert.deepEqual(next.parkedControls, {})
})

test('a control only the OUTGOING design declares parks against ITS design id, its dark override with it', () => {
  const state: ControlState = { controls: { tint: 'strong', align: 'center' }, darkOverrides: { tint: 'soft', bg: 'contrast' } }
  const next = switchControls(withId(d1), withId(d2), state)
  assert.equal(next.controls['tint'], undefined, 'the outgoing design\'s own control is not left on the instance')
  assert.equal(next.darkOverrides['tint'], undefined, 'and neither is its dark override (AD-30)')
  assert.deepEqual(next.parkedControls, { 'controls/1': { controls: { tint: 'strong' }, darkOverrides: { tint: 'soft' } } })
  // nothing else moved
  assert.equal(next.controls['align'], 'center')
  assert.equal(next.darkOverrides['bg'], 'contrast')
})

test('a control only the INCOMING design declares is left unstored, so it resolves to its own default', () => {
  const next = switchControls(withId(d1), withId(d2), { controls: { align: 'center' } })
  assert.equal(next.controls['frame'], undefined, 'nothing is written for a control the customer has not touched')
  assert.equal(resolveControls(d2, next.controls)['frame'], 'none', "and it resolves to the incoming design's declared default")
})

test('THE ROUND TRIP: 1 → 2 → 3 → 1 restores every parked value exactly, dark override included, and clears the record', () => {
  const start_: ControlState = { controls: { tint: 'strong', rule: 'none', align: 'center' }, darkOverrides: { tint: 'soft' } }
  const one = switchControls(withId(d1), withId(d2), start_)
  // ON THE WAY OUT: parked against design 1, and nothing of it is readable on design 2
  assert.equal(resolveControls(d2, one.controls)['tint'], undefined)
  // THE INTERMEDIATE DESIGN: design 3 declares neither, so the record is still design 1's and untouched
  const two = switchControls(withId(d2), withId(d3), { ...one })
  assert.deepEqual(two.parkedControls['controls/1'], { controls: { tint: 'strong', rule: 'none' }, darkOverrides: { tint: 'soft' } })
  // AND HOME
  const back = switchControls(withId(d3), withId(d1), { ...two })
  assert.equal(back.controls['tint'], 'strong')
  assert.equal(back.controls['rule'], 'none')
  assert.equal(back.darkOverrides['tint'], 'soft')
  assert.deepEqual(back.parkedControls, {}, 'a restore clears the record, so a doc cannot keep a stale second copy')
  assert.equal(back.controls['align'], 'center', 'and the carried control never left')
})

test('a name NEITHER design declares is left exactly where it is — it is a third design\'s to mean', () => {
  const next = switchControls(withId(d2), withId(d3), { controls: { unknownName: 'x' }, darkOverrides: { alsoUnknown: 'y' } })
  assert.equal(next.controls['unknownName'], 'x')
  assert.equal(next.darkOverrides['alsoUnknown'], 'y')
  assert.deepEqual(next.parkedControls, {})
})

test('switching to the design already in force changes nothing at all', () => {
  const state: ControlState = { controls: { tint: 'strong' }, parkedControls: { 'controls/2': { controls: { frame: 'box' }, darkOverrides: {} } } }
  const next = switchControls(withId(d1), withId(d1), state)
  assert.deepEqual(next.controls, { tint: 'strong' })
  assert.deepEqual(next.parkedControls, { 'controls/2': { controls: { frame: 'box' }, darkOverrides: {} } })
})

test('a restored value wins over a carried one, and it happens once', () => {
  // `rule` is declared by designs 1 and 3 and not by 2: parked leaving 1, defaulted on 3, and changed there
  const out = switchControls(withId(d1), withId(d2), { controls: { rule: 'none' } })
  const on3 = switchControls(withId(d2), withId(d3), { ...out, controls: { ...out.controls } })
  const changed: ControlState = { ...on3, controls: { ...on3.controls, rule: 'line' } }
  const home_ = switchControls(withId(d3), withId(d1), changed)
  assert.equal(home_.controls['rule'], 'none', 'the value design 1 was left with is what design 1 gets back')
  assert.deepEqual(home_.parkedControls, {})
})

test('junk in the stored maps is ignored rather than thrown, as every other read of a stored record is', () => {
  const next = switchControls(withId(d1), withId(d2), { controls: 'nonsense' as unknown as Record<string, unknown>, parkedControls: { 'controls/1': null as unknown as { controls: Record<string, unknown>; darkOverrides: Record<string, unknown> } } })
  assert.deepEqual(next.controls, {})
  assert.deepEqual(next.parkedControls, {})
})

test('FR-D13: the panel reports what THIS design draws, and the items past it are untouched', () => {
  // the category authors three features; design 2 declares `data-items-limit="2"` and the others declare none
  const listOf = (e: typeof d1) => {
    const row = sidebar(e, start()).groups.flatMap((g) => g.rows).find((r): r is PropRow => r.kind === 'prop' && r.path === 'features')
    assert.ok(row?.list, 'the features list is drawn')
    return row.list
  }
  assert.equal(listOf(d1).count, 3)
  assert.equal(listOf(d1).shown, 3, 'a design with no cap shows everything')
  assert.equal(listOf(d2).count, 3, 'the instance still holds three: a cap is a render rule, never a storage one')
  assert.equal(listOf(d2).shown, 2)
  assert.equal(itemsShown(d2.html, 'features'), 2)
  assert.equal(itemsShown(d1.html, 'features'), undefined)
  assert.equal(itemsShown(d2.html, 'notAList'), undefined)
})

test('the item cap renders on BOTH emitters, and the same number of copies', () => {
  const state = start()
  const canvasHtml = renderCanvas(doc(), d2.html, { content: state.content, schema: d2.contentSchema, controlSchema: d2.controlSchema, universals: d2.universals, icons: iconDrawing, target: 'home.hbs' })
  const themeHtml = renderTheme(doc(), d2.html, { content: state.content, schema: d2.contentSchema, controlSchema: d2.controlSchema, universals: d2.universals, icons: iconDrawing, target: 'home.hbs' }).template
  for (const [name, html] of [['canvas', canvasHtml], ['theme', themeHtml]] as const) {
    assert.equal((html.match(/class="cy__feature"/g) ?? []).length, 2, `${name}: ${html}`)
    assert.ok(html.includes('Every Thursday') === false, `${name} drew the third item`)
  }
  // and the uncapped design draws all three, so the cap is the difference and not the markup
  const all = renderCanvas(doc(), d1.html, { content: state.content, schema: d1.contentSchema, controlSchema: d1.controlSchema, universals: d1.universals, icons: iconDrawing, target: 'home.hbs', dataBindings: d1.dataBindings, getRows: { latest: [] } })
  assert.equal((all.match(/class="cx__feature"/g) ?? []).length, 3)
})
