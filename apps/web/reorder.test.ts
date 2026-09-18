import { test } from 'node:test'
import assert from 'node:assert/strict'
import { captureLayout, landingAt, shift, slotTop, type Layout } from './lib/reorder.ts'

// Story 5.4 — the geometry lifted out of `item-list.tsx`, which had none of its own. The owner's finding 9 of
// 2026-09-13 is what these numbers are: nothing reorders until the drop, so the slot and the slides are arithmetic
// over the rows as they stood when the press landed.

/** Four 40px rows with a 3px gap, as `P0-3`'s list and Layers both draw them: tops 0, 43, 86, 129. */
const rows = (n = 4, h = 40, gap = 3) => Array.from({ length: n }, (_, i) => ({ offsetTop: i * (h + gap), offsetHeight: h }))
const four: Layout = captureLayout(rows())

test('captureLayout: every top and height, and the gap read from the first two rows', () => {
  assert.deepEqual(four, { tops: [0, 43, 86, 129], heights: [40, 40, 40, 40], gap: 3 })
})

test('captureLayout: one row has no gap to read, and no rows is empty rather than NaN', () => {
  assert.deepEqual(captureLayout(rows(1)), { tops: [0], heights: [40], gap: 0 })
  assert.deepEqual(captureLayout([]), { tops: [], heights: [], gap: 0 })
})

test('captureLayout: rows of differing heights keep their own', () => {
  const mixed = captureLayout([{ offsetTop: 0, offsetHeight: 30 }, { offsetTop: 36, offsetHeight: 50 }])
  assert.deepEqual(mixed, { tops: [0, 36], heights: [30, 50], gap: 6 })
})

test('shift: only the rows between the origin and the landing slide, by one row plus the gap', () => {
  // row 0 dragged down to 2: rows 1 and 2 come up, row 3 stays
  assert.deepEqual([0, 1, 2, 3].map((i) => shift({ from: 0, to: 2, dy: 90 }, i, four)), [0, -43, -43, 0])
  // row 3 dragged up to 1: rows 1 and 2 go down, row 0 stays
  assert.deepEqual([0, 1, 2, 3].map((i) => shift({ from: 3, to: 1, dy: -90 }, i, four)), [0, 43, 43, 0])
  // the dragged row never shifts — it is translated by `dy` instead
  assert.equal(shift({ from: 1, to: 3, dy: 90 }, 1, four), 0)
})

test('shift: nothing moves with no drag, or while the landing is where it started', () => {
  assert.deepEqual([0, 1, 2, 3].map((i) => shift(null, i, four)), [0, 0, 0, 0])
  assert.deepEqual([0, 1, 2, 3].map((i) => shift({ from: 2, to: 2, dy: 4 }, i, four)), [0, 0, 0, 0])
})

test('slotTop: the landing row\'s own top going up, and corrected for the rows that slid going down', () => {
  assert.equal(slotTop(null, four), 0)
  assert.equal(slotTop({ from: 3, to: 1, dy: -90 }, four), 43, 'up: the landing row\'s own top')
  assert.equal(slotTop({ from: 0, to: 2, dy: 90 }, four), 86, 'down: 86 + 40 − 40, because row 2 slid up by one row')
  assert.equal(slotTop({ from: 1, to: 1, dy: 2 }, four), 43, 'at rest the slot sits under the row itself')
})

test('slotTop: rows of differing heights — the correction is the dragged row\'s height, not the landing row\'s', () => {
  const mixed = captureLayout([{ offsetTop: 0, offsetHeight: 30 }, { offsetTop: 36, offsetHeight: 50 }])
  assert.equal(slotTop({ from: 0, to: 1, dy: 60 }, mixed), 36 + 50 - 30)
})

test('landingAt: the slot is how many other rows\' middles the dragged row\'s middle has passed', () => {
  // row 0's middle starts at 20; it passes row 1's middle (63) after 43px, row 2's (106) after 86px
  assert.equal(landingAt(four, 0, 0, 0), 0)
  assert.equal(landingAt(four, 0, 42, 0), 0)
  assert.equal(landingAt(four, 0, 44, 0), 1)
  assert.equal(landingAt(four, 0, 87, 0), 2)
  assert.equal(landingAt(four, 0, 1000, 0), 3, 'dragged past the end it lands last, never off it')
})

test('landingAt: upwards, and never before the first row', () => {
  assert.equal(landingAt(four, 3, 0, 0), 3)
  assert.equal(landingAt(four, 3, -44, 0), 2)
  assert.equal(landingAt(four, 3, -1000, 0), 0)
})

test('landingAt: the pointer space is the caller\'s — only the difference is read', () => {
  assert.equal(landingAt(four, 0, 1044, 1000), 1, 'window coordinates')
  assert.equal(landingAt(four, 0, 44, 0), 1, 'and list coordinates give the same answer')
})
