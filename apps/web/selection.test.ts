import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { ProjectDoc } from '@inflozo/section-runtime'
import { escDeselects, hold, HOLD_IDLE, HOLD_MS, rootFrom, sectionRoots, SLOP_PX, withState, type HoldEvent, type HoldState } from './lib/selection.ts'

// Story 5.2's pure half, with plain objects standing in for the canvas document's elements.

type El = { name: string; parentElement: El | null; tagName?: string; isContentEditable?: boolean; open?: boolean; matches?: (s: string) => boolean }
const el = (name: string, parentElement: El | null = null, more: Partial<El> = {}): El => ({ name, parentElement, ...more })

test('sectionRoots: a gated section (an empty render) has no root, and the next render takes the next child', () => {
  const [a, c] = [el('a'), el('c')]
  assert.deepEqual(sectionRoots(['<header>', '', '<section>'], { children: [a, c] }), [a, null, c])
  assert.deepEqual(sectionRoots(['', ''], { children: [] }), [null, null])
  assert.deepEqual(sectionRoots([], { children: [a] }), [])
})

test('rootFrom: the root a target sits in, the root itself, and null for the ground', () => {
  const mount = el('mount')
  const root = el('root', mount)
  const other = el('other', mount)
  const link = el('a', el('nav', root))
  const roots = [root, null, other]
  assert.equal(rootFrom(link, roots), root)
  assert.equal(rootFrom(root, roots), root)
  assert.equal(rootFrom(other, roots), other)
  assert.equal(rootFrom(mount, roots), null, 'the mount under the last section is not a section')
  assert.equal(rootFrom(null, roots), null)
})

test('escDeselects: false inside a field, a select, contenteditable, an open popover or an open dialog; true elsewhere', () => {
  const body = el('body', null, { tagName: 'BODY' })
  assert.equal(escDeselects(body), true)
  assert.equal(escDeselects(el('button', body, { tagName: 'BUTTON' })), true, 'a panel button')
  assert.equal(escDeselects(null), true)
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT', 'input']) assert.equal(escDeselects(el('f', body, { tagName })), false, tagName)
  assert.equal(escDeselects(el('span', el('p', body, { isContentEditable: true }), { tagName: 'SPAN' })), false, 'contenteditable')
  const dialog = el('dialog', body, { tagName: 'DIALOG', open: true })
  assert.equal(escDeselects(el('cancel', dialog, { tagName: 'BUTTON' })), false, 'the reset confirm')
  assert.equal(escDeselects(el('cancel', el('dialog', body, { tagName: 'DIALOG', open: false }), { tagName: 'BUTTON' })), true, 'a closed dialog')
  const popover = el('pop', body, { tagName: 'DIV', matches: (s) => s === ':popover-open' })
  assert.equal(escDeselects(el('option', popover, { tagName: 'BUTTON' })), false, 'an open picker')
  assert.equal(escDeselects(el('option', el('pop', body, { tagName: 'DIV', matches: () => false }), { tagName: 'BUTTON' })), true, 'a closed one')
})

test('withState: replaces the one instance\'s four slices, and touches no other instance, doc or field', () => {
  const inst = (instanceId: string) => ({ instanceId, layerName: instanceId, designId: 'a1/1', content: { a: 1 }, controls: { b: 'x' }, data: {}, darkOverrides: {} })
  const docs: Record<string, ProjectDoc> = {
    site: { schemaVersion: 1, instances: [inst('h')] },
    home: { schemaVersion: 1, instances: [inst('one'), inst('two')] },
  }
  const next = withState(docs, 'home', 'two', { content: { a: 2 }, controls: { b: 'y' }, data: { q: 1 }, darkOverrides: { d: 'z' } })
  assert.notEqual(next, docs)
  assert.equal(next.site, docs.site)
  assert.equal(next.home?.instances[0], docs.home?.instances[0])
  assert.deepEqual(next.home?.instances[1], { instanceId: 'two', layerName: 'two', designId: 'a1/1', content: { a: 2 }, controls: { b: 'y' }, data: { q: 1 }, darkOverrides: { d: 'z' } })
  assert.deepEqual(docs.home?.instances[1]?.controls, { b: 'x' }, 'the input is not mutated')
  const empty = withState(docs, 'site', 'h', {})
  assert.deepEqual(empty.site?.instances[0], { ...inst('h'), content: {}, controls: {}, data: {}, darkOverrides: {} }, 'an absent slice is stored empty, as the schema needs')
  assert.throws(() => withState(docs, 'post', 'two', {}), /no post doc/)
  assert.throws(() => withState(docs, 'home', 'h', {}), /no instance h/)
})

const run = (events: HoldEvent[], from: HoldState = HOLD_IDLE) => {
  let s = from
  const out: (string | null)[] = []
  for (const e of events) {
    const [next, o] = hold(s, e)
    s = next
    out.push(o)
  }
  return { s, out }
}

test('hold: a tap selects, and its click is not swallowed', () => {
  const { s, out } = run([{ type: 'down', x: 5, y: 5, t: 0 }, { type: 'up', t: 80 }, { type: 'click' }])
  assert.deepEqual(out, [null, 'tap', null])
  assert.deepEqual(s, HOLD_IDLE)
})

test('hold: 500 ms without moving shows the hover, never selects, and swallows the click its lift fires', () => {
  const { out } = run([{ type: 'down', x: 5, y: 5, t: 0 }, { type: 'move', x: 5 + SLOP_PX, y: 5, t: 100 }, { type: 'timer', t: HOLD_MS - 1 }, { type: 'timer', t: HOLD_MS }, { type: 'up', t: 600 }, { type: 'click' }])
  assert.deepEqual(out, [null, null, null, 'hover', null, 'swallow'])
})

test('hold: a lift after 500 ms whose timer never ran is still a hold', () => {
  const { out } = run([{ type: 'down', x: 0, y: 0, t: 0 }, { type: 'up', t: HOLD_MS + 50 }, { type: 'click' }])
  assert.deepEqual(out, [null, 'hover', 'swallow'])
})

test('hold: a hold with no click after it does not swallow the next tap\'s click', () => {
  const { out } = run([{ type: 'down', x: 0, y: 0, t: 0 }, { type: 'timer', t: HOLD_MS }, { type: 'up', t: 700 }, { type: 'down', x: 0, y: 0, t: 2000 }, { type: 'up', t: 2050 }, { type: 'click' }])
  assert.deepEqual(out, [null, 'hover', null, null, 'tap', null])
})

test('hold: moving more than 10 px cancels — no hover, no tap', () => {
  const { out } = run([{ type: 'down', x: 0, y: 0, t: 0 }, { type: 'move', x: 8, y: 8, t: 50 }, { type: 'timer', t: HOLD_MS }, { type: 'up', t: 600 }, { type: 'click' }])
  assert.deepEqual(out, [null, null, null, null, null])
})

test('hold: a cancelled pointer shows nothing', () => {
  const { out } = run([{ type: 'down', x: 0, y: 0, t: 0 }, { type: 'cancel' }, { type: 'timer', t: HOLD_MS }, { type: 'up', t: 600 }])
  assert.deepEqual(out, [null, null, null, null])
})
