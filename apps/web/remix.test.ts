import { test } from 'node:test'
import assert from 'node:assert/strict'
import { NOTHING_TO_REMIX, REMIX_WORDS, UNDO_NOTE, remixAsk, remixFold, remixPicks, remixSaid, remixable } from './lib/remix.ts'

/* STORY 5.12 — Site Remix's picks and its words, asserted where `node --test` reaches them (the module is pure
   and its one import is `lib/ring.ts`, for exactly that reason). Every row of the spec's I/O matrix that is a
   number or a sentence is here; the GESTURES are the keyboard journey's (`⇧R`, the confirm, one `⌘Z`) and the
   deployed walks'. Nothing below counts anything it could derive. */

/** A library, as `remixPicks` reads one: category → the ids in it. The rings are built from it, never written
 *  down twice, so a test that says "a ring of one" really has one. */
const libraryOf = (rings: Readonly<Record<string, number>>) => {
  const ids = Object.entries(rings).flatMap(([cat, n]) => Array.from({ length: n }, (_, i) => `${cat}/${i + 1}`))
  return {
    ids,
    /** the stand-in for the library's `ringFor`: same category, in `{n}` order */
    ringAt: (designId: string) => ids.filter((id) => id.split('/')[0] === designId.split('/')[0]).map((id) => ({ id })),
  }
}

const placedIn = (...designIds: string[]) => designIds.map((designId, n) => ({ instanceId: `i${n}`, designId }))

/** A deterministic `random` with the shape `Math.random` has: a cycle of the values handed in. */
const seeded = (...values: number[]) => {
  let n = 0
  return () => values[n++ % values.length]!
}

test('every pick lands on a DIFFERENT design of the section\'s own ring, and never leaves the category', () => {
  const { ringAt } = libraryOf({ a1: 3, a4: 5, a17: 2 })
  const placed = placedIn('a1/2', 'a4/5', 'a17/1', 'a4/1')
  // every corner of the random's range, including the ones a naive `floor` gets wrong
  for (const r of [0, 0.0001, 0.25, 0.5, 0.75, 0.9999, 1]) {
    const picks = remixPicks(placed, ringAt, () => r)
    assert.equal(picks.length, placed.length, `r ${r}: every section here has somewhere to go`)
    for (const p of picks) {
      assert.notEqual(p.to, p.from, `r ${r}: a re-roll that lands where it started is not a re-roll`)
      assert.equal(p.to.split('/')[0], p.from.split('/')[0], 'a ring never leaves its category (FR-G3)')
      assert.ok(ringAt(p.from).some((e) => e.id === p.to), `r ${r}: ${p.to} is outside the ring`)
    }
    // one pick per section, each naming the section it is for
    assert.deepEqual(picks.map((p) => p.instanceId), placed.map((i) => i.instanceId))
    assert.deepEqual(picks.map((p) => p.from), placed.map((i) => i.designId))
  }
})

test('the matrix\'s "Mixed rings": a ring of one is SKIPPED, and only the sections that can move are picked', () => {
  const { ringAt } = libraryOf({ a1: 1, a4: 3, a17: 1, a22: 2 })
  const placed = placedIn('a1/1', 'a4/2', 'a17/1', 'a22/1')
  const picks = remixPicks(placed, ringAt, seeded(0.5))
  assert.deepEqual(picks.map((p) => p.instanceId), ['i1', 'i3'], 'the two at their floor are absent, not refused')
  assert.equal(remixable(placed, ringAt), 2, 'and the confirm names exactly those two')
})

test('the matrix\'s "Nothing to roll" and "Empty canvas": no picks, and nothing to count', () => {
  const { ringAt } = libraryOf({ a1: 1, a4: 1, a17: 1 })
  // today's library — every category holds one design
  const everyRingAtItsFloor = placedIn('a1/1', 'a4/1', 'a17/1')
  assert.deepEqual(remixPicks(everyRingAtItsFloor, ringAt, seeded(0.5)), [])
  assert.equal(remixable(everyRingAtItsFloor, ringAt), 0)
  // AD-22's untouched canvas: no stored instances at all, and a Remix never materialises one
  assert.deepEqual(remixPicks([], ringAt, seeded(0.5)), [])
  assert.equal(remixable([], ringAt), 0)
})

test('a section whose ring does not hold its own design is skipped — a non-placeable treatment, and a vanished one', () => {
  // `ringFor` answers `[]` for a non-placeable treatment, which is how one is never re-rolled (no second list)
  assert.deepEqual(remixPicks(placedIn('a1/1'), () => [], seeded(0.5)), [])
  // and a design the library no longer holds: the ring has members, but not the one the instance names, so there
  // is no declaration to decide what carries and `switchDesign` would refuse it anyway
  const vanished = libraryOf({ a1: 3 })
  assert.deepEqual(remixPicks(placedIn('a1/9'), vanished.ringAt, seeded(0.5)), [])
  assert.equal(remixable(placedIn('a1/9'), vanished.ringAt), 0)
})

test('the count IS the picks, so the dice can never say six and move five (standing rule 4)', () => {
  const { ringAt } = libraryOf({ a1: 4, a4: 1, a17: 6, a22: 2 })
  const placed = placedIn('a1/1', 'a4/1', 'a17/3', 'a22/2', 'a1/4')
  for (const r of [0, 0.3, 0.7, 0.9999]) {
    assert.equal(remixable(placed, ringAt), remixPicks(placed, ringAt, () => r).length)
  }
})

test('a seeded random is deterministic, and a different draw really lands elsewhere (AD-1: the caller owns the entropy)', () => {
  const { ringAt } = libraryOf({ a1: 6, a4: 6, a17: 6 })
  const placed = placedIn('a1/1', 'a4/1', 'a17/1')
  const once = remixPicks(placed, ringAt, seeded(0.1, 0.5, 0.9))
  assert.deepEqual(remixPicks(placed, ringAt, seeded(0.1, 0.5, 0.9)), once, 'the same draw gives the same picks')
  const other = remixPicks(placed, ringAt, seeded(0.9, 0.1, 0.5))
  assert.notDeepEqual(other, once, 'and a different draw does not')
  // the draw advances PER SECTION: three sections must not all be handed the same number
  assert.equal(new Set(once.map((p) => p.to.split('/')[1])).size > 1, true)
})

test('the sentences carry singular and plural, name the canvas, and the count is never restated', () => {
  assert.match(remixAsk(1, 'Home'), /^Re-rolls 1 section on Home to a different design in its own category\./)
  assert.match(remixAsk(6, 'Home'), /^Re-rolls 6 sections on Home to a different design in its own category\./)
  // B8's own second sentence, kept word for word
  assert.ok(remixAsk(6, 'Post').endsWith('Your text, images and settings stay — only the arrangements change.'))
  assert.equal(remixSaid(1, 'Home'), 'Remixed 1 section on Home.')
  assert.equal(remixSaid(6, '404'), 'Remixed 6 sections on 404.')
  // R-12's shape: it says why there is nothing to press, and it names no number at all
  assert.doesNotMatch(NOTHING_TO_REMIX, /\d/)
  assert.match(NOTHING_TO_REMIX, /nothing to remix yet/)
  // the icon-only control carries its key in its words (R-163, `DESIGN.md:534-536`'s carve-out)
  assert.equal(REMIX_WORDS, 'Site Remix — ⇧R')
  assert.equal(UNDO_NOTE, 'One undo, always available')
})

test('the fold is all or nothing: every pick lands in ONE next doc, and a refusal on the last writes none (FR-D17, FR-D9)', () => {
  // the editor commits what the fold returns ONCE, so N picks in one returned doc IS one journal entry and one ⌘Z —
  // the keyboard journey can only prove that at N = 1, because its harness holds one ringed section (review, 2026-09-20)
  const doc = Object.freeze({ a: 'a1/1', b: 'a4/1' }) as Readonly<Record<string, string>>
  const picks = [
    { instanceId: 'a', from: 'a1/1', to: 'a1/2' },
    { instanceId: 'b', from: 'a4/1', to: 'a4/3' },
  ]
  const switchOne = (d: Readonly<Record<string, string>>, p: { instanceId: string; to: string }) => ({ ...d, [p.instanceId]: p.to })
  assert.deepEqual(remixFold(doc, picks, switchOne), { a: 'a1/2', b: 'a4/3' })
  // CONTROL: the second pick refuses — the sentence comes back, not a half-applied doc, and the input is untouched
  const refused = remixFold(doc, picks, (d, p) => (p.instanceId === 'b' ? 'No.' : switchOne(d, p)))
  assert.equal(refused, 'No.')
  assert.deepEqual(doc, { a: 'a1/1', b: 'a4/1' })
  assert.equal(remixFold(doc, [], switchOne), doc, 'no picks, the same doc')
})
