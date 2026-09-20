import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CYCLE_WORDS, NEXT_WORDS, ONE_DESIGN, PREVIOUS_WORDS, SHUFFLE_WORDS, STRIP_COLUMNS, STRIP_ROWS, STRIP_TILES,
  TRY_TITLE, TRY_WORDS, announce, pillPosition, position, shownInThisDesign, shuffleTo, step, strip,
} from './lib/ring.ts'

/* STORY 5.11 — the design ring's own arithmetic and words, asserted where `node --test` reaches them (the module
   is pure and importless for exactly that reason, as `lib/picker.ts` and `lib/device.ts` are). The GESTURES are
   the keyboard journey's and the deployed walk's; what is here is every row of the I/O matrix that is a number or
   a sentence. Nothing counts anything it could derive. */

test('the counter is 1-based in both shapes, and the panel and the pill agree', () => {
  assert.equal(position(0, 18), 'Design 1 of 18')
  assert.equal(position(6, 18), 'Design 7 of 18')
  assert.equal(position(0, 1), 'Design 1 of 1', 'the one-design case still says where it is')
  assert.equal(pillPosition(6, 18), '7 / 18')
  assert.equal(pillPosition(0, 1), '1 / 1')
  // the same index and the same length can never read as two different places
  for (const at of [0, 3, 17]) assert.equal(position(at, 18).replace('Design ', '').replace(' of ', ' / '), pillPosition(at, 18))
})

test('UX-DR12: the polite sentence names the position AND the design', () => {
  assert.equal(announce(7, 18, 'Image Backdrop'), 'Design 8 of 18 — Image Backdrop')
})

test('UX-DR5: the ring WRAPS in both directions, and a ring of one has nowhere to go', () => {
  assert.equal(step(2, 3, 1), 0, 'past the last wraps to the first')
  assert.equal(step(0, 3, -1), 2, 'before the first wraps to the last')
  assert.equal(step(0, 3, 1), 1)
  assert.equal(step(2, 3, -1), 1)
  assert.equal(step(0, 1, 1), 0)
  assert.equal(step(0, 1, -1), 0)
  assert.equal(step(0, 0, 1), 0, 'an empty ring is arithmetic that must not divide by nothing')
  // several steps of the same key land where counting says they do
  let at = 0
  for (let n = 0; n < 7; n++) at = step(at, 3, 1)
  assert.equal(at, 1)
})

test('Shuffle lands on a DIFFERENT design, wherever the random falls, and never with one design', () => {
  assert.equal(shuffleTo(1, 0, () => 0.5), null, 'a ring of one has no Shuffle at all (UX-DR3)')
  assert.equal(shuffleTo(0, 0, () => 0.5), null)
  for (const length of [2, 3, 8, 18]) {
    for (let at = 0; at < length; at++) {
      const seen = new Set<number>()
      // every corner of the random's range, including the ones a naive `floor` gets wrong
      for (const r of [0, 0.0001, 0.25, 0.5, 0.75, 0.9999, 1]) {
        const to = shuffleTo(length, at, () => r)
        assert.notEqual(to, null)
        assert.notEqual(to, at, `length ${length}, at ${at}, r ${r}: Shuffle must move`)
        assert.ok(to! >= 0 && to! < length, `length ${length}, at ${at}, r ${r}: ${to} is outside the ring`)
        seen.add(to!)
      }
      assert.ok(seen.size > 1 || length === 2, `length ${length}, at ${at}: the whole range gave one answer`)
    }
  }
})

test('every design of the ring is reachable by Shuffle, so nothing is stranded', () => {
  const length = 4
  const reached = new Set<number>()
  for (let n = 0; n < length - 1; n++) reached.add(shuffleTo(length, 1, () => n / (length - 1))!)
  assert.deepEqual([...reached].sort(), [0, 2, 3])
})

test("the strip's capacity is its own grid multiplied out, never a number in prose", () => {
  assert.equal(STRIP_TILES, STRIP_COLUMNS * STRIP_ROWS)
  assert.equal(STRIP_COLUMNS, 4, 'B1a draws four columns')
})

test('a ring that fits is drawn whole, with no +N tile', () => {
  const ring = Array.from({ length: STRIP_TILES }, (_, n) => n)
  const { tiles, from, more } = strip(ring, 3)
  assert.deepEqual(tiles, ring)
  assert.equal(from, 0)
  assert.equal(more, 0)
})

test('a longer ring shows the first tiles and a +N — and slides so the ACTIVE tile is always on screen', () => {
  const ring = Array.from({ length: 18 }, (_, n) => n)
  const head = strip(ring, 0)
  assert.equal(head.tiles.length, STRIP_TILES)
  assert.equal(head.from, 0)
  assert.equal(head.more, 18 - STRIP_TILES, 'B1a\'s "twelve of the eighteen", derived')
  assert.deepEqual(head.tiles[0], 0)
  // past the strip's end, the window slides just far enough
  const late = strip(ring, STRIP_TILES)
  assert.equal(late.from, 1)
  assert.ok(late.tiles.includes(STRIP_TILES))
  const last = strip(ring, 17)
  assert.equal(last.from, 18 - STRIP_TILES)
  assert.ok(last.tiles.includes(17))
  // and every index in the ring is somewhere in its own strip: nothing is unreachable
  for (let at = 0; at < ring.length; at++) assert.ok(strip(ring, at).tiles.includes(at), `design ${at} is off its own strip`)
})

test("FR-D13's sentence names both numbers, and reads for one item too", () => {
  assert.equal(shownInThisDesign(3, 2), '3 items · 2 shown in this design')
  assert.equal(shownInThisDesign(8, 3), '8 items · 3 shown in this design')
  assert.equal(shownInThisDesign(1, 1), '1 item · 1 shown in this design')
})

test('every word a control carries is plain English, and each names its key where it has one', () => {
  assert.match(PREVIOUS_WORDS, /^Previous design — \[$/)
  assert.match(NEXT_WORDS, /^Next design — \]$/)
  assert.ok(SHUFFLE_WORDS.startsWith('Shuffle'), 'the pill\'s icon-only control carries its words as its name (R-159)')
  assert.equal(CYCLE_WORDS, 'Cycle designs')
  assert.equal(TRY_TITLE, 'Try a design')
  assert.equal(TRY_WORDS, 'Same words, new look')
  // R-12: with one design the block still says something true rather than going quiet
  assert.match(ONE_DESIGN, /one design/)
  for (const words of [PREVIOUS_WORDS, NEXT_WORDS, SHUFFLE_WORDS, CYCLE_WORDS, TRY_TITLE, TRY_WORDS, ONE_DESIGN]) {
    assert.doesNotMatch(words, /layout|variant|variation/i, 'Appendix H: "Design" is the only word')
  }
})
