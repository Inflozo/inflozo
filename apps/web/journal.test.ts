import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { ProjectDoc } from '@inflozo/section-runtime'
import {
  append, autoFrom, backoffSeconds, BACKOFF_S, canRedo, canUndo, DEPTH, EMPTY_JOURNAL, flushDecision, flushed,
  flushPayload, holdsCaret, hydrationFor, ownFlushLanded, labelOf, maxSeq, panelOpen, redo, shortcutFor, undo, unsynced,
  restingState, unsyncedEdits, vanishedDesign, type Journal, type SyncState,
} from './lib/journal.ts'

/* STORY 5.8 — the journal, the indicator, the backoff and R-141's shortcuts, asserted where `node --test` can reach
   them. Every row of the spec's matrix that is a RULE rather than a gesture is here; the gestures themselves are
   `tools/probe/run-verify-editor.cjs`'s steps 61 onward, on the deployed editor.

   Nothing below counts anything it could derive: the depth test reads `DEPTH`, the backoff test reads `BACKOFF_S`,
   and the label test walks every state of the union rather than listing five strings (standing rule 4). */

const doc = (...ids: string[]): ProjectDoc => ({
  schemaVersion: 1,
  instances: ids.map((id) => ({
    instanceId: id, layerName: id, designId: `a1/${id}`, content: {}, controls: {}, data: {},
    darkOverrides: {}, hidden: false, isMainFeed: false, memberVisibility: 'everyone',
  })),
}) as ProjectDoc

/** One edit, as `commit()` makes one: the doc either side of it. */
const edit = (j: Journal, docKey: string, before: ProjectDoc, after: ProjectDoc) =>
  append(j, { txn: `t${j.nextSeq}`, docKey, before, after })

const ids = (d: ProjectDoc) => d.instances.map((i) => i.instanceId)

// ── the journal ────────────────────────────────────────────────────────────────────────────────────────────────

test('one gesture is one transaction is one undo step (AD-16), and undo restores the whole touched doc', () => {
  const first = edit(EMPTY_JOURNAL, 'home', doc('a'), doc('a', 'b'))
  const second = edit(first.journal, 'home', doc('a', 'b'), doc('a', 'b', 'c'))
  assert.equal(second.journal.entries.length, 2, 'two gestures, two entries — never one per operation')

  const back = undo(second.journal)
  assert.deepEqual(ids(back!.doc), ['a', 'b'], 'the head entry restores its `before`')
  const again = undo(back!.journal)
  assert.deepEqual(ids(again!.doc), ['a'], 'and the one below it restores its own')
  assert.equal(undo(again!.journal), null, 'an empty journal undoes nothing')
})

test('redo puts back exactly what undo took, and only what was undone', () => {
  const first = edit(EMPTY_JOURNAL, 'home', doc('a'), doc('a', 'b'))
  const back = undo(first.journal)!
  assert.ok(canRedo(back.journal) && !canUndo(back.journal))
  const forward = redo(back.journal)!
  assert.deepEqual(ids(forward.doc), ['a', 'b'])
  assert.equal(redo(forward.journal), null, 'nothing left to redo')
})

test('an edit while undone > 0 DISCARDS the undone tail — the ordinary editor rule', () => {
  const one = edit(EMPTY_JOURNAL, 'home', doc(), doc('a'))
  const two = edit(one.journal, 'home', doc('a'), doc('a', 'b'))
  const back = undo(undo(two.journal)!.journal)!
  assert.equal(back.journal.undone, 2)

  const fresh = edit(back.journal, 'home', doc(), doc('z'))
  assert.equal(fresh.journal.undone, 0)
  assert.equal(fresh.journal.entries.length, 1, 'the two undone entries are gone, not kept beside the new one')
  assert.equal(canRedo(fresh.journal), false, 'and nothing can redo into a history the new edit replaced')
  assert.deepEqual([...fresh.dropped].sort(), [1, 2], 'both dropped seqs are named, so the device drops them too')
})

test(`the journal holds exactly ${DEPTH} edits: the ${DEPTH + 1}st drops the oldest and undo still reaches back ${DEPTH}`, () => {
  let j = EMPTY_JOURNAL
  for (let n = 0; n <= DEPTH; n += 1) j = edit(j, 'home', doc(`i${n}`), doc(`i${n + 1}`)).journal
  assert.equal(j.entries.length, DEPTH, 'trimmed from the head')
  assert.equal(j.entries[0]?.seq, 2, 'the oldest entry is the one that went')

  // undo every one of them, and the next press answers nothing rather than reaching further back
  let steps = 0
  let cursor: Journal = j
  for (;;) {
    const back = undo(cursor)
    if (!back) break
    cursor = back.journal
    steps += 1
  }
  assert.equal(steps, DEPTH, `undo reaches back exactly ${DEPTH} edits and no further`)
})

test('the trim names the seq it dropped, so the device never keeps an entry the journal does not', () => {
  let j = EMPTY_JOURNAL
  for (let n = 0; n < DEPTH; n += 1) j = edit(j, 'home', doc(), doc(`i${n}`)).journal
  const over = edit(j, 'home', doc(), doc('over'))
  assert.deepEqual(over.dropped, [1])
})

test('AD-16: the count is EDITS above the watermark, and it is distinct transaction ids', () => {
  const one = edit(EMPTY_JOURNAL, 'home', doc(), doc('a'))
  const two = edit(one.journal, 'post', doc(), doc('b'))
  assert.equal(unsyncedEdits(two.journal), 2)
  const after = flushed(two.journal, two.journal.stamp, maxSeq(two.journal))
  assert.equal(unsyncedEdits(after), 0, 'the watermark moved past both')
  const three = edit(after, 'home', doc('a'), doc('a', 'c'))
  assert.equal(unsyncedEdits(three.journal), 1)
})

// ── what a flush sends, and the race it must survive ───────────────────────────────────────────────────────────

test('the timer with nothing unsynced sends NOTHING — the matrix\'s own row', () => {
  assert.equal(unsynced(EMPTY_JOURNAL), false)
  assert.deepEqual(flushPayload(EMPTY_JOURNAL, { home: doc('a') }), {})
  const one = edit(EMPTY_JOURNAL, 'home', doc(), doc('a'))
  assert.equal(unsynced(one.journal), true)
})

test('a flush sends only the docs the journal names, each as it stands NOW', () => {
  const one = edit(EMPTY_JOURNAL, 'home', doc(), doc('a'))
  const two = edit(one.journal, 'site', doc(), doc('s'))
  const docs = { home: doc('a'), site: doc('s'), post: doc('untouched') }
  assert.deepEqual(Object.keys(flushPayload(two.journal, docs)).sort(), ['home', 'site'])
})

test('AN UNDO IS SENT TOO — it changes the document without appending an edit', () => {
  const one = edit(EMPTY_JOURNAL, 'home', doc(), doc('a'))
  const synced = flushed(one.journal, one.journal.stamp, maxSeq(one.journal))
  assert.equal(unsynced(synced), false)
  const back = undo(synced)!
  assert.equal(unsynced(back.journal), true, 'an undone edit the server still holds is work owed')
  assert.deepEqual(Object.keys(flushPayload(back.journal, { home: doc() })), ['home'])
})

test('AN EDIT MADE WHILE A FLUSH IS IN FLIGHT IS KEPT — the stamp is what makes that true', () => {
  const one = edit(EMPTY_JOURNAL, 'home', doc(), doc('a'))
  // the request leaves here, carrying `home`
  const sentStamp = one.journal.stamp
  const upTo = maxSeq(one.journal)
  // …and the customer types again before it lands
  const during = edit(one.journal, 'home', doc('a'), doc('a', 'b'))
  const after = flushed(during.journal, sentStamp, upTo)
  assert.equal(unsynced(after), true, 'the newer edit is still owed')
  assert.deepEqual(Object.keys(flushPayload(after, { home: doc('a', 'b') })), ['home'])
  // the control: with no edit during the flight, the success clears it
  assert.equal(unsynced(flushed(one.journal, sentStamp, upTo)), false)
})

// ── FR-D9's refusal ────────────────────────────────────────────────────────────────────────────────────────────

test('FR-D9: a restored doc naming a design the library no longer holds is refused WHOLE, never half-applied', () => {
  const held = (id: string) => id !== 'a1/gone'
  assert.equal(vanishedDesign(doc('a', 'b'), held), null)
  const broken = doc('a', 'gone', 'c')
  assert.equal(vanishedDesign(broken, held), 'a1/gone', 'the check names the design and answers before anything is applied')
})

// ── B6's indicator ─────────────────────────────────────────────────────────────────────────────────────────────

test('B6: every state has its own name, the panel opens on Retrying and on nothing else', () => {
  const states: SyncState[] = [
    { kind: 'rest', owed: true },
    { kind: 'rest', owed: false },
    { kind: 'syncing' },
    { kind: 'retrying', attempt: 1, seconds: 5 },
    { kind: 'fallback' },
  ]
  const labels = states.map(labelOf)
  assert.equal(new Set(labels).size, states.length, 'no two states answer to the same name')
  assert.deepEqual(states.filter(panelOpen).map((s) => s.kind), ['retrying'])
  // the resting names are B6's own, not S4a's "Saved" — the divergence the Code Map records
  assert.equal(labelOf({ kind: 'rest', owed: true }), 'Saved on this device')
  assert.equal(labelOf({ kind: 'fallback' }), 'Syncing every change to the cloud')
})

test('R-144: the resting state reports what is OWED — green with nothing to send, grey the moment there is', () => {
  // it is DERIVED from the journal, never remembered: this is what let the four-second fade go
  assert.deepEqual(restingState(EMPTY_JOURNAL), { kind: 'rest', owed: false })
  assert.equal(labelOf(restingState(EMPTY_JOURNAL)), 'Synced', 'nothing owed reads as on the server')

  const edited = append(EMPTY_JOURNAL, { txn: 't', docKey: 'home', before: doc(), after: doc('a') }).journal
  assert.deepEqual(restingState(edited), { kind: 'rest', owed: true })
  assert.equal(labelOf(restingState(edited)), 'Saved on this device', 'an edit is owed until it goes up')

  // …and a flush that lands puts it back, with no timer in between
  const sent = flushed(edited, edited.stamp, maxSeq(edited))
  assert.equal(labelOf(restingState(sent)), 'Synced')

  // an UNDO is owed too, so the circle goes grey again rather than claiming the server has it
  assert.equal(labelOf(restingState(undo(sent)!.journal)), 'Saved on this device')
})

test('the backoff is 5 · 10 · 20 · 40 · 60, capped, and never goes backwards', () => {
  const seen = BACKOFF_S.map((_, n) => backoffSeconds(n + 1))
  assert.deepEqual(seen, [...BACKOFF_S])
  assert.equal(backoffSeconds(BACKOFF_S.length + 9), BACKOFF_S[BACKOFF_S.length - 1], 'capped, however many attempts')
  assert.equal(backoffSeconds(0), BACKOFF_S[0], 'and an attempt below the first is the first')
})

// ── R-141's shortcuts ──────────────────────────────────────────────────────────────────────────────────────────

const press = (key: string, extra: Partial<Parameters<typeof shortcutFor>[0]> = {}) =>
  ({ key, metaKey: true, ctrlKey: false, shiftKey: false, ...extra })

test('R-141: ⌘Z undoes, ⇧⌘Z redoes, ⌘S saves — and Ctrl is the same three on Windows', () => {
  assert.equal(shortcutFor(press('z'), false), 'undo')
  assert.equal(shortcutFor(press('z', { shiftKey: true }), false), 'redo')
  assert.equal(shortcutFor(press('s'), false), 'save')
  assert.equal(shortcutFor(press('z', { metaKey: false, ctrlKey: true }), false), 'undo')
  assert.equal(shortcutFor(press('z', { metaKey: false, ctrlKey: true, shiftKey: true }), false), 'redo')
  assert.equal(shortcutFor(press('Z', { shiftKey: true }), false), 'redo', 'Shift makes the key uppercase')
})

test('R-141: ⌘Z is INERT with the caret in a text prop, and ⌘S is not (Story 5.3 is untouched)', () => {
  assert.equal(shortcutFor(press('z'), true), null, 'the browser\'s own undo owns the words being typed')
  assert.equal(shortcutFor(press('z', { shiftKey: true }), true), null)
  assert.equal(shortcutFor(press('s'), true), 'save', 'Save Page As is never what the press meant')
})

test('no OTHER key is this story\'s — the single-key map stays Story 5.9\'s entire', () => {
  for (const key of ['[', ']', '1', '2', '3', 'l', '.', 'p', 'r', 'Escape', 'k', 'd', 'Delete', 'Enter', 'y']) {
    assert.equal(shortcutFor(press(key), false), null, key)
    assert.equal(shortcutFor({ key, metaKey: false, ctrlKey: false, shiftKey: false }, false), null, `bare ${key}`)
  }
  // an unmodified z is typing, and BOTH modifiers together is not this gesture either
  assert.equal(shortcutFor({ key: 'z', metaKey: false, ctrlKey: false, shiftKey: false }, false), null)
  assert.equal(shortcutFor({ key: 'z', metaKey: true, ctrlKey: true, shiftKey: false }, false), null)
  assert.equal(shortcutFor(press('z', { altKey: true }), false), null, '⌥⌘Z is not ⌘Z')
})

test('holdsCaret is the guard, and it covers a contenteditable as well as a field', () => {
  assert.equal(holdsCaret(null), false)
  assert.equal(holdsCaret({ tagName: 'DIV' }), false)
  assert.equal(holdsCaret({ tagName: 'INPUT' }), true)
  assert.equal(holdsCaret({ tagName: 'TEXTAREA' }), true)
  assert.equal(holdsCaret({ tagName: 'SELECT' }), false, 'no caret, no undo of its own')
  assert.equal(holdsCaret({ tagName: 'INPUT', type: 'checkbox' }), false, 'focus rests here after a panel control: ⌘Z must work')
  assert.equal(holdsCaret({ tagName: 'INPUT', type: 'range' }), false)
  assert.equal(holdsCaret({ tagName: 'INPUT', type: 'text' }), true)
  assert.equal(holdsCaret({ tagName: 'H1', isContentEditable: true }), true, 'Story 5.3 edits a heading in place')
  assert.equal(holdsCaret({ tagName: 'SPAN', isContentEditable: true }), true, 'and a button\'s label in a span')
})

// ── AD-15's hydrate comparison ─────────────────────────────────────────────────────────────────────────────────

test('AD-15 / §AD1.1: the comparison is `revision` vs `base_revision` and NOTHING else', () => {
  assert.deepEqual(hydrationFor(null, 7), { kind: 'first' }, 'no local record: the server\'s doc, an empty journal')
  assert.deepEqual(hydrationFor({ baseRevision: 7 }, 7), { kind: 'local' }, 'equal: the doc AND the journal survive')
  assert.deepEqual(hydrationFor({ baseRevision: 6 }, 7), { kind: 'cloud' }, 'differing: the cloud doc wins, journal cleared')
  assert.deepEqual(hydrationFor({ baseRevision: 8 }, 7), { kind: 'cloud' }, 'and it is inequality, not "behind"')
  assert.deepEqual(hydrationFor({ baseRevision: 0 }, 0), { kind: 'local' }, 'a never-synced project is revision 0 on both sides')
})

test('the auto-generated set survives a reload, narrowed to the canvases still offered', () => {
  assert.deepEqual(autoFrom(['home', 'post', 'private'], ['home', 'post', 'tag']), ['home', 'post'])
  assert.deepEqual(autoFrom([], ['home']), [])
})

// ── who may flush, and when nothing goes out at all ────────────────────────────────────────────────────────────

test('AD-15: autosave off stops THE TIMER ALONE — ⌘S and the tab closing still send', () => {
  const owed = append(EMPTY_JOURNAL, { txn: 't', docKey: 'home', before: doc(), after: doc('a') }).journal
  assert.equal(flushDecision(owed, 'timer', true), 'send')
  assert.equal(flushDecision(owed, 'timer', false), 'nothing', 'the timer, and only the timer, is what stops')
  assert.equal(flushDecision(owed, 'manual', false), 'send', '⌘S still sends')
  assert.equal(flushDecision(owed, 'unload', false), 'send', 'and so does the tab going')
  assert.equal(flushDecision(owed, 'change', false), 'send', 'as does fallback mode, which has nowhere local to put it')
})

test('nothing owed means NO REQUEST AT ALL — except ⌘S, which is always acknowledged', () => {
  for (const why of ['timer', 'change', 'retry', 'unload'] as const) {
    assert.equal(flushDecision(EMPTY_JOURNAL, why, true), 'nothing', why)
  }
  assert.equal(flushDecision(EMPTY_JOURNAL, 'manual', true), 'acknowledge', 'a press that does nothing visible reads as broken')
  assert.equal(flushDecision(EMPTY_JOURNAL, 'manual', false), 'acknowledge', 'and autosave has nothing to do with it')
})

// ── the two matrix rows about WHICH doc comes back ─────────────────────────────────────────────────────────────

test('undo across canvases restores the doc the TRANSACTION touched, not the one being looked at', () => {
  // the last edit was on `post`; the customer has since moved to `home`
  const onPost = append(EMPTY_JOURNAL, { txn: 'p1', docKey: 'post', before: doc('x'), after: doc('x', 'y') })
  const back = undo(onPost.journal)!
  assert.equal(back.docKey, 'post', 'the entry names its own doc, so the canvas shown never enters into it')
  assert.deepEqual(ids(back.doc), ['x'])
  assert.deepEqual(Object.keys(back.journal.pending), ['post'], 'and it is `post` that is owed to the server')
})

test("AD-22's round trip: undoing the last section off hands back the doc that was there, whole", () => {
  // the forward edit empties a synthesizable canvas; `committed()` (round-trip.ts) then gives it its default stack
  // back. What the JOURNAL owes is the doc as it stood BEFORE — one assignment, and the round trip is re-decided
  // from it exactly as a forward edit decides it.
  const emptied = append(EMPTY_JOURNAL, { txn: 'e1', docKey: 'tag', before: doc('only'), after: doc() })
  const back = undo(emptied.journal)!
  assert.deepEqual(ids(back.doc), ['only'], 'the section returns')
  const forward = redo(back.journal)!
  assert.deepEqual(ids(forward.doc), [], 'and redo empties it again')
})

test('a tab-close flush of our own is recognised on the way back in, and another session\'s write never is', () => {
  const a = { instances: [{ x: 1, y: undefined }] }
  const local = { baseRevision: 4, docs: { home: a, post: { instances: [] } }, journal: { ...EMPTY_JOURNAL, pending: { home: 1 } } }
  const sameReordered = { home: JSON.parse('{"instances":[{"x":1}]}') }
  assert.equal(ownFlushLanded(local, 5, sameReordered), true, 'base + 1 and the owed doc is ours')
  assert.equal(ownFlushLanded(local, 6, sameReordered), false, 'two revisions on: somebody else wrote as well')
  assert.equal(ownFlushLanded(local, 5, { home: { instances: [] } }), false, 'the control: a different doc is another session')
  assert.equal(ownFlushLanded(local, 5, {}), false)
  assert.equal(ownFlushLanded({ ...local, journal: EMPTY_JOURNAL }, 5, sameReordered), false, 'nothing was owed, so it was not us')
})
