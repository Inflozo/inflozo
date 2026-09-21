import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MEMBER_STATES } from '@inflozo/library'
import { SITE } from './lib/editor.ts'
import {
  HEADING, LABEL, NOT_VIEWED, PREVIEWING, ROWS, VALUE, VIEW_AS_SAID, VISITORS, afterChange, markerWords, readViewed, seen,
  unviewed, type Viewed, type Visitor,
} from './lib/view-as.ts'

/* Story 5.14 — View as and its not-viewed nudge, over the one pure module the toggle, its menu, its marker, the panel's
   caption and the live region all read (`lib/view-as.ts`). Every row of the spec's I/O matrix that is not a pixel is
   here; the pixels are the deployed walk's (`run-verify-editor.cjs` step 90) and the keyboard's `pnpm keyboard`'s.

   THE VISITORS ARE NEVER WRITTEN DOWN in this file: they are asked of the library's `MEMBER_STATES`, so a visitor the
   vocabulary gains joins every assertion below by construction (standing rule 4). */

const [ANON, FREE, PAID] = VISITORS as [Visitor, Visitor, Visitor]

test('the visitors are the library\'s member states without the audience "everyone", in the vocabulary\'s own order', () => {
  assert.deepEqual([...VISITORS], MEMBER_STATES.filter((s) => s !== 'everyone'))
  assert.equal(VISITORS.length, MEMBER_STATES.length - 1)
  assert.ok(!(VISITORS as readonly string[]).includes('everyone'), 'everyone is an audience, never a visitor')
  // B9's "only": no tier and no comped row — comped and Ghost 6's gift preview as Paid (Ghost's `status !== 'free'`)
  for (const status of ['comped', 'gift']) assert.ok(!(VISITORS as readonly string[]).includes(status), `${status} is not a visitor of its own`)
})

test('every visitor has its words — the trigger value, S4d\'s row, the caption\'s phrase — and the frame\'s wording', () => {
  for (const v of VISITORS) {
    assert.ok(VALUE[v].length > 0, `${v} has no trigger value`)
    assert.ok(ROWS[v].title.length > 0 && ROWS[v].caption.length > 0, `${v} has no menu row`)
    assert.ok(PREVIEWING[v].length > 0, `${v} has no caption phrase`)
    assert.equal(VIEW_AS_SAID(v), `The canvas is previewing ${PREVIEWING[v]}.`)
  }
  // S4a and S4d, verbatim (R-74): the trigger says Anonymous, the menu row says Logged out user
  assert.equal(LABEL, 'View as')
  assert.equal(HEADING, 'Preview as')
  assert.equal(NOT_VIEWED, 'Not viewed')
  assert.deepEqual(VISITORS.map((v) => VALUE[v]), ['Anonymous', 'Free member', 'Paid member'])
  assert.deepEqual(VISITORS.map((v) => [ROWS[v].title, ROWS[v].caption]), [
    ['Logged out user', 'Not signed in'],
    ['Free member', 'Signed in, no subscription'],
    ['Paid member', 'Sees members-only content'],
  ])
  // R-124's caption keeps its own words, now read from here (`sidebar.tsx` imports this one list)
  assert.equal(PREVIEWING[PAID], 'a paying member')
  assert.equal(PREVIEWING[FREE], 'a free member')
})

test('matrix "Opening": a first visit records Anonymous and the marker reads "2 not viewed"', () => {
  const record = seen([], ANON)
  assert.deepEqual(record, [ANON])
  assert.equal(markerWords(unviewed(record).length), '2 not viewed')
  assert.deepEqual(unviewed(record), [FREE, PAID])
})

test('matrix "Choosing Paid": the record gains the visitor, in canonical order, and the marker counts down', () => {
  const opened = seen([], ANON)
  const paid = seen(opened, PAID)
  assert.deepEqual(paid, [ANON, PAID])
  assert.equal(markerWords(unviewed(paid).length), '1 not viewed')
  assert.deepEqual(unviewed(paid), [FREE], 'the menu names the one still to look at')
  // canonical order whatever order they were looked at in
  assert.deepEqual(seen(seen([], PAID), ANON), [ANON, PAID])
})

test('seen keeps THE SAME ARRAY when nothing changes, so the caller writes nothing', () => {
  const record = [ANON, FREE] as const
  assert.equal(seen(record, FREE), record, 'already viewed: the identical array, not a copy')
  const grown = seen(record, PAID)
  assert.notEqual(grown, record)
  assert.deepEqual(record, [ANON, FREE], 'and it never mutates the record it was handed')
})

test('matrix "All three viewed": nothing unviewed, and the marker is ABSENT — null, never "0 not viewed"', () => {
  const all = VISITORS.reduce<readonly Visitor[]>((r, v) => seen(r, v), [])
  assert.deepEqual(unviewed(all), [])
  assert.equal(markerWords(0), null)
  assert.equal(markerWords(unviewed(all).length), null)
})

test('the marker\'s words at 2, 1 and 0', () => {
  assert.equal(markerWords(2), '2 not viewed')
  assert.equal(markerWords(1), '1 not viewed')
  assert.equal(markerWords(0), null)
})

test('matrix "Reload" and "Stored junk": the record comes back in canonical order, junk dropped, each visitor once', () => {
  assert.deepEqual(readViewed([PAID, ANON, FREE]), [ANON, FREE, PAID])
  assert.deepEqual(readViewed([ANON, 'everyone', 'comped', 'gift', 'Paid', 7, null, ANON]), [ANON])
  for (const raw of [null, undefined, 'anonymous', 3, {}, { 0: 'anonymous' }]) assert.deepEqual(readViewed(raw), [], JSON.stringify(raw))
  assert.deepEqual(readViewed([]), [])
})

test('matrix "A change" (R-167): an edit to the canvas on screen leaves it viewed only as the visitor on screen', () => {
  const records: Viewed = { home: [ANON, FREE, PAID], post: [ANON, FREE] }
  assert.deepEqual(afterChange(records, 'home', 'home', FREE), { home: [FREE] })
  // the marker then reads "2 not viewed" again
  assert.equal(markerWords(unviewed(afterChange(records, 'home', 'home', FREE).home!).length), '2 not viewed')
  // only the canvas that changed is returned: Post is untouched
  assert.equal('post' in afterChange(records, 'home', 'home', FREE), false)
  // a canvas already at [visitor] does not change, so nothing is written
  assert.deepEqual(afterChange({ home: [PAID] }, 'home', 'home', PAID), {})
  // a canvas with no record yet gains one
  assert.deepEqual(afterChange({}, 'home', 'home', ANON), { home: [ANON] })
})

test('R-167: a header or footer edit re-records the canvas on screen and EMPTIES every other canvas\'s record — returning only what changes', () => {
  const records: Viewed = { home: [ANON, FREE], post: [ANON, FREE, PAID], tag: [], author: [PAID] }
  const changed = afterChange(records, SITE.key, 'home', ANON)
  assert.deepEqual(changed, { home: [ANON], post: [], author: [] })
  // Tag's record is already empty, so it is NOT returned — no row is written for it
  assert.equal('tag' in changed, false)
  // a canvas with no record at all is not invented
  assert.equal('page' in changed, false)
  // the site doc itself is never a canvas with a record
  assert.equal(SITE.key in changed, false)
  // and when nothing needs to change, nothing is returned
  assert.deepEqual(afterChange({ home: [ANON], post: [] }, SITE.key, 'home', ANON), {})
})

test('R-167: an undo that restores a canvas NOT on screen leaves it viewed as nobody', () => {
  assert.deepEqual(afterChange({ home: [ANON, FREE, PAID], post: [ANON] }, 'home', 'post', ANON), { home: [] })
  assert.deepEqual(afterChange({ post: [ANON] }, 'home', 'post', ANON), {}, 'a canvas with no record stays without one')
})

test('matrix "Canvas switch": each canvas counts its own record', () => {
  const records: Viewed = { home: [ANON, FREE, PAID] }
  const post = seen(records.post ?? [], PAID)
  assert.deepEqual(post, [PAID])
  assert.equal(markerWords(unviewed(post).length), '2 not viewed')
  assert.equal(markerWords(unviewed(records.home ?? []).length), null)
})
