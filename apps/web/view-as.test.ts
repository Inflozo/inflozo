import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MEMBER_STATES } from '@inflozo/library'
import { SITE } from './lib/editor.ts'
import {
  HEADING, LABEL, NOT_VIEWED, PREVIEWING, ROWS, VIEW_AS_SAID, VISITORS, afterChange, readViewed, seen, unviewed,
  type Viewed, type Visitor,
} from './lib/view-as.ts'

/* Story 5.14 — View as and its not-viewed nudge, over the one pure module the toggle, its menu, its dots, the panel's
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

test('R-170: each visitor has ONE name — S4d\'s row title — and every sentence that names it is derived from it', () => {
  // S4d's words, verbatim (R-74), and "Anonymous" is retired (R-170: "rename Anonymous to Logged out user")
  assert.equal(LABEL, 'View as')
  assert.equal(HEADING, 'Preview as')
  assert.deepEqual(VISITORS.map((v) => [ROWS[v].title, ROWS[v].caption]), [
    ['Logged out user', 'Not signed in'],
    ['Free member', 'Signed in, no subscription'],
    ['Paid member', 'Sees members-only content'],
  ])
  for (const v of VISITORS) {
    // R-124's caption and the live region say the SAME name the menu and the trigger print
    assert.equal(PREVIEWING[v], `a ${ROWS[v].title.toLowerCase()}`)
    assert.equal(VIEW_AS_SAID(v), `The canvas is previewing ${PREVIEWING[v]}.`)
    assert.ok(!/anonymous/i.test(ROWS[v].title + PREVIEWING[v] + VIEW_AS_SAID(v)), `${v} is named "Anonymous" somewhere`)
  }
  assert.equal(PREVIEWING[ANON], 'a logged out user')
  assert.equal(PREVIEWING[PAID], 'a paid member')
  // R-169: the dot's word, which is in the row for screen readers only
  assert.equal(NOT_VIEWED, 'Not viewed')
})

test('matrix "Opening": a first visit records the logged out user, and the menu dots the other two', () => {
  const record = seen([], ANON)
  assert.deepEqual(record, [ANON])
  assert.deepEqual(unviewed(record), [FREE, PAID])
})

test('matrix "Choosing Paid": the record gains the visitor, in canonical order, and one row keeps its dot', () => {
  const opened = seen([], ANON)
  const paid = seen(opened, PAID)
  assert.deepEqual(paid, [ANON, PAID])
  assert.deepEqual(unviewed(paid), [FREE], 'the menu dots the one still to look at')
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

test('matrix "All three viewed": nothing unviewed, so no row of the menu carries a dot', () => {
  const all = VISITORS.reduce<readonly Visitor[]>((r, v) => seen(r, v), [])
  assert.deepEqual(unviewed(all), [])
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
  // the menu then dots the other two again
  assert.deepEqual(unviewed(afterChange(records, 'home', 'home', FREE).home!), [ANON, PAID])
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
  assert.deepEqual(unviewed(post), [ANON, FREE], 'Post dots its own two')
  assert.deepEqual(unviewed(records.home ?? []), [], 'Home, looked at all three ways, dots nothing')
})
