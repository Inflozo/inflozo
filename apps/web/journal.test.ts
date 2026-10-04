import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { ProjectDoc } from '@inflozo/section-runtime'
import {
  append, autoFrom, backoffSeconds, BACKOFF_S, canRedo, canUndo, DEPTH, EMPTY_JOURNAL, flushDecision, flushed,
  flushPayload, hydratedPreset, hydrationFor, journalCleared, ownFlushLanded, labelOf, maxSeq, owedOf, PACK_KEY, panelOpen, redo, undo, unsynced,
  restingState, isSentMessage, sendBody, sentBy, sentMessage, signOutFlow, unsyncedEdits, vanishedDesign, type Journal, type OwedRecord, type SyncState,
} from './lib/journal.ts'

/* STORY 5.8 — the journal, the indicator and the backoff, asserted where `node --test` can reach them. Every row of
   the spec's matrix that is a RULE rather than a gesture is here; the gestures themselves are
   `tools/probe/run-verify-editor.cjs`'s steps 61 onward, on the deployed editor.

   R-141's THREE SHORTCUTS LEFT THIS FILE AT STORY 5.9, with `shortcutFor` and `holdsCaret` themselves: the map is
   not the journal's business, and the whole of it — Story 5.8's assertions included — is now `keymap.test.ts`.

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
  assert.deepEqual(ids(back!.docs.home!), ['a', 'b'], 'the head entry restores its `before`')
  const again = undo(back!.journal)
  assert.deepEqual(ids(again!.docs.home!), ['a'], 'and the one below it restores its own')
  assert.equal(undo(again!.journal), null, 'an empty journal undoes nothing')
})

test('redo puts back exactly what undo took, and only what was undone', () => {
  const first = edit(EMPTY_JOURNAL, 'home', doc('a'), doc('a', 'b'))
  const back = undo(first.journal)!
  assert.ok(canRedo(back.journal) && !canUndo(back.journal))
  const forward = redo(back.journal)!
  assert.deepEqual(ids(forward.docs.home!), ['a', 'b'])
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
  assert.deepEqual(flushPayload(EMPTY_JOURNAL, { home: doc('a') }), { docs: {} })
  const one = edit(EMPTY_JOURNAL, 'home', doc(), doc('a'))
  assert.equal(unsynced(one.journal), true)
})

test('a flush sends only the docs the journal names, each as it stands NOW', () => {
  const one = edit(EMPTY_JOURNAL, 'home', doc(), doc('a'))
  const two = edit(one.journal, 'site', doc(), doc('s'))
  const docs = { home: doc('a'), site: doc('s'), post: doc('untouched') }
  assert.deepEqual(Object.keys(flushPayload(two.journal, docs).docs).sort(), ['home', 'site'])
})

test('AN UNDO IS SENT TOO — it changes the document without appending an edit', () => {
  const one = edit(EMPTY_JOURNAL, 'home', doc(), doc('a'))
  const synced = flushed(one.journal, one.journal.stamp, maxSeq(one.journal))
  assert.equal(unsynced(synced), false)
  const back = undo(synced)!
  assert.equal(unsynced(back.journal), true, 'an undone edit the server still holds is work owed')
  assert.deepEqual(Object.keys(flushPayload(back.journal, { home: doc() }).docs), ['home'])
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
  assert.deepEqual(Object.keys(flushPayload(after, { home: doc('a', 'b') }).docs), ['home'])
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

test('B6: every state has its own name, the panel opens on Retrying and on R-213\'s Signed out, and on nothing else', () => {
  const states: SyncState[] = [
    { kind: 'rest', owed: true },
    { kind: 'rest', owed: false },
    { kind: 'syncing' },
    { kind: 'retrying', attempt: 1, seconds: 5 },
    { kind: 'signed-out' },
    { kind: 'fallback' },
  ]
  const labels = states.map(labelOf)
  assert.equal(new Set(labels).size, states.length, 'no two states answer to the same name')
  assert.deepEqual(states.filter(panelOpen).map((s) => s.kind), ['retrying', 'signed-out'])
  assert.equal(labelOf({ kind: 'signed-out' }), 'Signed out')
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
  assert.deepEqual(Object.keys(back.docs), ['post'], 'the entry names its own doc, so the canvas shown never enters into it')
  assert.deepEqual(ids(back.docs.post!), ['x'])
  assert.deepEqual(Object.keys(back.journal.pending), ['post'], 'and it is `post` that is owed to the server')
})

test("AD-22's round trip: undoing the last section off hands back the doc that was there, whole", () => {
  // the forward edit empties a synthesizable canvas; `committed()` (round-trip.ts) then gives it its default stack
  // back. What the JOURNAL owes is the doc as it stood BEFORE — one assignment, and the round trip is re-decided
  // from it exactly as a forward edit decides it.
  const emptied = append(EMPTY_JOURNAL, { txn: 'e1', docKey: 'tag', before: doc('only'), after: doc() })
  const back = undo(emptied.journal)!
  assert.deepEqual(ids(back.docs.tag!), ['only'], 'the section returns')
  const forward = redo(back.journal)!
  assert.deepEqual(ids(forward.docs.tag!), [], 'and redo empties it again')
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

/* ── STORY 5.17: the two halves this story adds, where the journal's own proofs live ────────────────────────────
   `'release'` is Hand over's flush, and `journalCleared` is the generation half of AD-15's clearing rule — beside
   `hydrationFor` and deliberately not inside it. */

test('AD-15\'s flush contract: `release` sends whatever is owed, autosave off included', () => {
  const owing = edit(EMPTY_JOURNAL, 'home', doc(), doc('a')).journal
  // UNSYNCED WORK NEVER CROSSES A LOCK BOUNDARY, so Hand over flushes BEFORE it releases — and like `manual` and
  // `unload` it falls through the autosave test, because AD-15 stops the TIMER alone.
  assert.equal(flushDecision(owing, 'release', false), 'send')
  assert.equal(flushDecision(owing, 'release', true), 'send')
  assert.equal(flushDecision(owing, 'timer', false), 'nothing', 'the half this story must not have widened')
  // nothing owed is nothing to send: a release is not a keystroke, so it is not acknowledged either
  assert.equal(flushDecision(EMPTY_JOURNAL, 'release', true), 'nothing')
  assert.equal(flushDecision(EMPTY_JOURNAL, 'manual', true), 'acknowledge')
})

test('AD-15: the journal goes for EITHER reason, and the generation decides on its own', () => {
  const same = hydrationFor({ baseRevision: 9 }, 9)
  const moved = hydrationFor({ baseRevision: 9 }, 10)
  const fresh = hydrationFor(null, 0)
  // the revision half, unchanged by Story 5.17
  assert.equal(journalCleared(same, false), false)
  assert.equal(journalCleared(moved, false), true)
  assert.equal(journalCleared(fresh, false), true)
  // THE GENERATION HALF DECIDES ON ITS OWN, with no revision comparison involved — which is the whole reason it is
  // beside `hydrationFor` and not inside it: a take-over whose new holder has written nothing leaves the revisions
  // EQUAL, so a folded rule would never clear the displaced session's journal.
  assert.equal(journalCleared(same, true), true)
  assert.equal(journalCleared(moved, true), true)
  // and `hydrationFor` itself is untouched: it still answers the revision question and only that
  assert.deepEqual(same, { kind: 'local' })
})

/* ── R-214 (Story 5.24e): signing out sends, then erases, and asks first when it cannot send ─────────────────────── */

test('R-214: what a local record owes is the flush\'s own payload and AD-16\'s count — and a record owing nothing owes nothing', () => {
  const owing = edit(edit(EMPTY_JOURNAL, 'home', doc('a'), doc('a', 'b')).journal, 'post', doc(), doc('c')).journal
  const docs = { home: doc('a', 'b'), post: doc('c'), page: doc('d') }
  // …with what its 200 marks sent: the journal's own stamp and highest sequence, as the flush's `flushed` is handed them
  assert.deepEqual(owedOf('p1', { baseRevision: 4, docs, journal: owing }), { projectId: 'p1', base: 4, docs: { home: docs.home, post: docs.post }, edits: 2, stamp: owing.stamp, upTo: maxSeq(owing) })
  assert.equal(owedOf('p1', { baseRevision: 4, docs, journal: flushed(owing, owing.stamp, maxSeq(owing)) }), null, 'everything sent')
  assert.equal(owedOf('p1', { baseRevision: 4, docs, journal: EMPTY_JOURNAL }), null, 'never edited')
})

test('R-214: nothing owed → erase → sign out; all sent → erase → sign out; a failure asks first, and only Sign out anyway erases', async () => {
  const record = (projectId: string, edits: number): OwedRecord => ({ projectId, base: 3, docs: { home: doc('a') }, edits, stamp: 2, upTo: 2 })
  /** the flow with fakes, every call written down in the order it was made */
  const run = async (owed: OwedRecord[], sends: (r: OwedRecord) => boolean, answer?: boolean, eraseFails = false) => {
    const calls: string[] = []
    const went = await signOutFlow({
      owed: async () => {
        calls.push('owed')
        return owed
      },
      send: async (r) => {
        calls.push(`send ${r.projectId}`)
        return sends(r)
      },
      erase: async () => {
        calls.push('erase')
        if (eraseFails) throw new Error('blocked')
      },
      signOut: async () => {
        calls.push('sign out')
      },
      ask: async (edits) => {
        calls.push(`ask ${edits}`)
        if (answer === undefined) throw new Error('asked when everything was sent')
        return answer
      },
    })
    return { went, calls }
  }
  assert.deepEqual(await run([], () => true), { went: true, calls: ['owed', 'erase', 'sign out'] }, 'nothing owed')
  assert.deepEqual(await run([record('p1', 2), record('p2', 1)], () => true), { went: true, calls: ['owed', 'send p1', 'send p2', 'erase', 'sign out'] }, 'all sent')
  // the ask counts the edits that would be LOST — the unsent records' alone
  assert.deepEqual(await run([record('p1', 2), record('p2', 1)], (r) => r.projectId === 'p1', false), { went: false, calls: ['owed', 'send p1', 'send p2', 'ask 1'] }, 'Wait: no erase, no sign-out')
  assert.deepEqual(await run([record('p1', 2), record('p2', 1)], () => false, true), { went: true, calls: ['owed', 'send p1', 'send p2', 'ask 3', 'erase', 'sign out'] }, 'Sign out anyway')
  assert.deepEqual(await run([], () => true, undefined, true), { went: true, calls: ['owed', 'erase', 'sign out'] }, 'an erase that fails still signs out')
})

test('R-214: the sign-out sends the flush\'s own body WITHOUT a lock session, and only a 200 is sent', () => {
  const owing = edit(EMPTY_JOURNAL, 'home', doc('a'), doc('a', 'b')).journal
  const record = owedOf('p1', { baseRevision: 4, docs: { home: doc('a', 'b') }, journal: owing }) as OwedRecord
  // routine call 3: no `session` — the revision compare-and-set guards it, so the route's absent branch refuses nothing
  assert.deepEqual(JSON.parse(sendBody(record)), { base: 4, docs: { home: doc('a', 'b') } })
  assert.equal(sentBy(200), true)
  // another writer, no session, the server failing, and no answer at all: each "cannot send" — the ask's business
  for (const status of [409, 401, 500, 502, 503, null]) assert.equal(sentBy(status), false, String(status))
})

test('R-214: a 200 the sign-out got is told to the open editor as its own flush\'s answer — and only a well-formed one is read', () => {
  const owing = edit(edit(EMPTY_JOURNAL, 'home', doc('a'), doc('a', 'b')).journal, 'post', doc(), doc('c')).journal
  const record = owedOf('p1', { baseRevision: 4, docs: { home: doc('a', 'b'), post: doc('c') }, journal: owing }) as OwedRecord
  const told = sentMessage(record, { revision: 5 })
  assert.deepEqual(told, { type: 'sent', project: 'p1', base: 4, revision: 5, stamp: owing.stamp, upTo: maxSeq(owing) })
  // what the editor then does with it is its own 200's step, and it leaves nothing owed of what was sent
  assert.equal(unsynced(flushed(owing, told.stamp, told.upTo)), false)
  assert.equal(isSentMessage(told), true)
  for (const junk of [null, 'sent', { ...told, type: 'released' }, { ...told, project: 7 }, { ...told, base: '4' }, { ...told, upTo: 1.5 }]) {
    assert.equal(isSentMessage(junk), false, JSON.stringify(junk))
  }
})

/* ── STORY 6.3: a Style Pack change is an edit, and a transaction may hold the pack beside a doc ─────────────────────
   FR-D9 lists "Style Pack changes" in the undo history, §AD1 counts one as an edit, and R-161's grouped undo arrives with
   Site Remix's Both: the canvas's doc and the pack in ONE transaction, undone whole. */

/** A pack change, as `commitPack` journals it: the preset ids either side, under its own key. */
const packEdit = (j: Journal, before: string, after: string, txn = `t${j.nextSeq}`) => append(j, { txn, docKey: PACK_KEY, before, after })

test('6.3: a pack change undoes to the preset before and redoes to the one after — one entry, one edit', () => {
  const switched = packEdit(EMPTY_JOURNAL, 'paper', 'tangerine').journal
  assert.equal(unsyncedEdits(switched), 1)
  const back = undo(switched)!
  assert.deepEqual(back, { journal: back.journal, docs: {}, preset: 'paper' }, 'the preset comes back, and no doc does')
  assert.deepEqual(Object.keys(back.journal.pending), [PACK_KEY], 'the pack is owed to the server again')
  const forward = redo(back.journal)!
  assert.equal(forward.preset, 'tangerine')
  assert.deepEqual(forward.docs, {})
})

test('6.3: a two-entry transaction — Remix\'s Both — counts one edit, undoes whole and redoes whole', () => {
  const before = edit(EMPTY_JOURNAL, 'home', doc(), doc('a')).journal
  const designs = append(before, { txn: 'both', docKey: 'home', before: doc('a'), after: doc('b') }).journal
  const both = packEdit(designs, 'paper', 'neon', 'both').journal
  assert.equal(unsyncedEdits(both), 2, 'the earlier edit and the Both — never three')
  const back = undo(both)!
  assert.deepEqual(ids(back.docs.home!), ['a'], 'one ⌘Z puts the designs back…')
  assert.equal(back.preset, 'paper', '…and the pack, in the same press')
  assert.equal(back.journal.undone, 2, 'the pointer moved past both entries')
  assert.deepEqual(Object.keys(back.journal.pending).sort(), ['home', PACK_KEY].sort())
  const earlier = undo(back.journal)!
  assert.deepEqual(ids(earlier.docs.home!), [], 'the next ⌘Z is the edit before it, whole')
  assert.equal(earlier.preset, undefined)
  const again = redo(earlier.journal)!
  assert.deepEqual(ids(again.docs.home!), ['a'])
  const forward = redo(again.journal)!
  assert.deepEqual(ids(forward.docs.home!), ['b'], 'redo takes the Both whole too')
  assert.equal(forward.preset, 'neon')
  assert.equal(forward.journal.undone, 0)
})

test(`6.3: the depth counts TRANSACTIONS — ${DEPTH} of them, two-entry ones included — and a trim never splits one`, () => {
  let j = packEdit(EMPTY_JOURNAL, 'paper', 'mono', 'grouped').journal
  j = append(j, { txn: 'grouped', docKey: 'home', before: doc(), after: doc('g') }).journal
  for (let n = 1; n < DEPTH; n += 1) j = edit(j, 'home', doc(`i${n}`), doc(`i${n + 1}`)).journal
  assert.equal(new Set(j.entries.map((e) => e.txn)).size, DEPTH, 'every transaction kept at the depth')
  assert.equal(j.entries.length, DEPTH + 1, 'the grouped one holds two entries')
  const over = edit(j, 'home', doc(), doc('over'))
  assert.deepEqual([...over.dropped].sort(), [1, 2], 'the oldest transaction went, both of its entries')
  assert.ok(!over.journal.entries.some((e) => e.txn === 'grouped'), 'never half of it')
})

test('6.3: a pack-only flush sends the preset and no doc; a doc entry keeps the docs; nothing owed sends nothing', () => {
  const switched = packEdit(EMPTY_JOURNAL, 'paper', 'tangerine').journal
  assert.deepEqual(flushPayload(switched, { home: doc('a') }, 'tangerine'), { docs: {}, preset: 'tangerine' })
  const both = edit(switched, 'home', doc(), doc('a')).journal
  assert.deepEqual(flushPayload(both, { home: doc('a') }, 'tangerine'), { docs: { home: doc('a') }, preset: 'tangerine' })
  assert.deepEqual(flushPayload(edit(EMPTY_JOURNAL, 'home', doc(), doc('a')).journal, { home: doc('a') }, 'tangerine'), { docs: { home: doc('a') } }, 'the pack is sent only when owed')
  assert.deepEqual(flushPayload(EMPTY_JOURNAL, {}, 'paper'), { docs: {} })
  // the record a sign-out sends: a record owing only its pack owes, and its body carries the preset
  const record = owedOf('p1', { baseRevision: 3, docs: {}, journal: switched, preset: 'tangerine' }) as OwedRecord
  assert.deepEqual(record, { projectId: 'p1', base: 3, docs: {}, preset: 'tangerine', edits: 1, stamp: switched.stamp, upTo: maxSeq(switched) })
  assert.deepEqual(JSON.parse(sendBody(record)), { base: 3, docs: {}, preset: 'tangerine' })
})

test('6.3: our own tab-close flush is recognised with a pending pack only when the server holds this device\'s preset', () => {
  const switched = packEdit(EMPTY_JOURNAL, 'paper', 'tangerine').journal
  const local = { baseRevision: 4, docs: { home: doc('a') }, journal: switched, preset: 'tangerine' }
  assert.equal(ownFlushLanded(local, 5, { home: doc('a') }, 'tangerine'), true, 'base + 1 and the pack is ours')
  assert.equal(ownFlushLanded(local, 5, { home: doc('a') }, 'neon'), false, 'another session chose another pack')
  assert.equal(ownFlushLanded(local, 5, { home: doc('a') }), false, 'a server pack nobody read is never ours')
  // a record from before 6.3 holds no preset: an owed pack cannot be in it, and an owed doc is judged as it always was
  const before63 = { baseRevision: 4, docs: { home: doc('a') }, journal: edit(EMPTY_JOURNAL, 'home', doc(), doc('a')).journal }
  assert.equal(ownFlushLanded(before63, 5, { home: doc('a') }, 'paper'), true)
})

test('6.3: a hydrate treats the pack as it treats the docs — kept with an equal revision, the server\'s otherwise, and a record from before 6.3 holds none', () => {
  const known = (id: string) => ['paper', 'tangerine', 'mono'].includes(id)
  const same = hydrationFor({ baseRevision: 4 }, 4)
  assert.equal(hydratedPreset(same, { preset: 'tangerine' }, 'paper', known), 'tangerine', 'reload, unsynced: the switched pack')
  assert.equal(hydratedPreset(hydrationFor({ baseRevision: 4 }, 5), { preset: 'tangerine' }, 'mono', known), 'mono', 'another session moved the revision')
  assert.equal(hydratedPreset(same, {}, 'mono', known), 'mono', 'a record written before 6.3: the server\'s pack')
  assert.equal(hydratedPreset(hydrationFor(null, 0), null, 'mono', known), 'mono', 'no record at all')
  assert.equal(hydratedPreset(same, { preset: 'harbor' }, 'paper', known), 'paper', 'an id this build does not hold is no pack')
})

