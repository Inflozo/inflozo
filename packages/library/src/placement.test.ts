import { test } from 'node:test'
import assert from 'node:assert/strict'
import { categoryOf, isPlaceable, NON_PLACEABLE, placementRefusal, POST_CONTENT } from './placement.ts'

// Story 5.4 — the matrix's placement rows. Neither rule can be exercised on the deployed editor, because
// `packages/library/designs/` holds no A25, A32, A33 or A34 design: this is their whole proof.

test('every non-placeable treatment is refused, and an ordinary design is not', () => {
  for (const category of NON_PLACEABLE) {
    for (const n of [1, 2, 12]) assert.equal(isPlaceable(`${category}/${n}`), false, `${category}/${n}`)
  }
  for (const id of ['a1/1', 'a4/13', 'a17/1', 'a22/1', 'a24/1', 'a25/1', 'a31/6']) {
    assert.equal(isPlaceable(id), true, id)
  }
})

test('an id that is not {category}/{n} is not placeable and has no category', () => {
  for (const id of ['', 'a32', 'A32/1', 'a32/', '../a32/1', 'a1/1/2']) {
    assert.equal(categoryOf(id), '', id)
    assert.equal(isPlaceable(id), false, id)
  }
})

test('a first Post Content is allowed; a second is refused with the sentence', () => {
  assert.equal(placementRefusal(`${POST_CONTENT}/1`, []), null)
  assert.equal(placementRefusal('a25/1', ['a24/1', 'a26/2']), null, 'a post header and a post footer are not the article')
  assert.equal(placementRefusal('a25/7', ['a24/1', 'a25/1']), 'this layout already prints the article')
  // any design of the category counts, and the one being placed is not compared with itself by id
  assert.equal(placementRefusal('a25/1', ['a25/1']), 'this layout already prints the article')
})

test('an ordinary design is unaffected, however many are already there', () => {
  assert.equal(placementRefusal('a17/1', ['a17/1', 'a17/1', 'a25/1']), null)
  assert.equal(placementRefusal('a1/1', ['a25/1']), null)
})

test('a non-placeable treatment answers no sentence: it is absent, not refused (UX-DR3)', () => {
  for (const category of NON_PLACEABLE) assert.equal(placementRefusal(`${category}/1`, ['a25/1']), null, category)
})
