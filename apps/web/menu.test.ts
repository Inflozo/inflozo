import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextIndex } from './lib/menu.ts'

// The account menu is five items, the ⋯ menu three; `count` is whatever the menu renders.
test('Down and Up move one item and wrap at both ends', () => {
  assert.equal(nextIndex(5, 0, 1), 1)
  assert.equal(nextIndex(5, 3, 1), 4)
  assert.equal(nextIndex(5, 4, 1), 0, 'Down from the last item wraps to the first')
  assert.equal(nextIndex(5, 4, -1), 3)
  assert.equal(nextIndex(5, 0, -1), 4, 'Up from the first item wraps to the last')
})

// The guard that a dropped `+ count` takes away: `-1` is a real index in JS and `items[-1]`
// is `undefined`, so the failure is a throw rather than a wrong item.
test('every answer is a real index of the menu', () => {
  for (const count of [1, 2, 3, 5]) {
    for (let at = -1; at < count; at++) {
      for (const step of [1, -1] as const) {
        const next = nextIndex(count, at, step)
        assert.ok(
          Number.isInteger(next) && next >= 0 && next < count,
          `nextIndex(${count}, ${at}, ${step}) = ${next}, which is not an index of ${count} items`,
        )
      }
    }
  }
})

test('from nowhere in particular, Down opens on the first item and Up on the last', () => {
  assert.equal(nextIndex(3, -1, 1), 0)
  assert.equal(nextIndex(3, -1, -1), 2)
})

// One item: both keys stay where they are rather than leaving the menu.
test('a one-item menu goes nowhere', () => {
  assert.equal(nextIndex(1, 0, 1), 0)
  assert.equal(nextIndex(1, 0, -1), 0)
})
