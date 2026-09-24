import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { ProjectDoc } from '@inflozo/section-runtime'
import {
  displacedBy, duration, edits, HEARTBEAT_MS, isStale, LOCK_COPY, NUDGE_MS, nextGeneration, partyOf, RESTART_EVENTS,
  heldElsewhere, restartsNudge, rowFrom, secondsLeft, STALE_MS, stillAsking, type LockRow,
} from './lib/lock.ts'
import { append, EMPTY_JOURNAL, hydrationFor, journalCleared, unsyncedEdits, type Journal } from './lib/journal.ts'

/* STORY 5.17 — FR-D18's edit lock, asserted where `node --test` can reach it. Every row of the spec's I/O matrix
   that is a RULE rather than a gesture is here; the gestures themselves are `tools/probe/run-verify-lock.cjs`'s, on
   the deployed editor, and the database half is `supabase/tests/rls.sql`'s F4.

   Nothing below writes a number it could derive: the staleness test reads `STALE_MS`, the countdown reads
   `NUDGE_MS`, the restart test walks `RESTART_EVENTS`, and the copy tests read `LOCK_COPY` (standing rule 4). */

const MINE = 'tab-a'
const THEIRS = 'tab-b'

const row = (over: Partial<LockRow> = {}): LockRow => ({
  holderSessionId: THEIRS,
  generation: 3,
  unsyncedEdits: 0,
  ageMs: 0,
  nudgeRequestedBy: null,
  nudgeAgeMs: null,
  request: null,
  ...over,
})

// ── the matrix's staleness, generation and party rows ──────────────────────────────────────────────────────────

test('matrix "Stale lock": no row at all and a row nobody has beaten for §AD4\'s window are both free', () => {
  assert.equal(isStale(null), true, 'the first opener: there is no row')
  assert.equal(isStale(row({ ageMs: 0 })), false)
  assert.equal(isStale(row({ ageMs: STALE_MS })), false, 'exactly at the window is still alive')
  assert.equal(isStale(row({ ageMs: STALE_MS + 1 })), true)
  // the heartbeat has to fit inside the window several times over, or a single missed beat would look like a
  // session that has gone. Derived from the two constants, never restated.
  assert.ok(STALE_MS >= HEARTBEAT_MS * 3, 'a stale lock must survive more than one missed beat')
})

test('AD-15: a holder change advances the generation by exactly one', () => {
  assert.equal(nextGeneration(1), 2)
  assert.equal(nextGeneration(7), 8)
})

test('AD-15: DISPLACED is decided by the generation alone — no revision comparison is involved', () => {
  assert.equal(displacedBy(3, 4), true, 'the generation moved past the one this session held')
  assert.equal(displacedBy(3, 3), false, 'the same generation is the same session')
  // a take-over whose new holder has written nothing leaves the revisions equal, which is exactly why the two
  // halves of AD-15's clearing rule are independent
  assert.equal(journalCleared(hydrationFor({ baseRevision: 9 }, 9), true), true)
  assert.equal(journalCleared(hydrationFor({ baseRevision: 9 }, 9), false), false)
  // and the revision half still fires on its own, unchanged by this story
  assert.equal(journalCleared(hydrationFor({ baseRevision: 9 }, 10), false), true)
  assert.equal(journalCleared(hydrationFor(null, 0), false), true, 'no local record: the server\'s doc, an empty journal')
})

test('the four parties, and a session that GAVE the lock away is a reader rather than displaced', () => {
  assert.equal(partyOf(row({ holderSessionId: MINE }), MINE, 3, false), 'holder')
  assert.equal(partyOf(row(), MINE, null, false), 'reader')
  assert.equal(partyOf(row(), MINE, null, true), 'requesting')
  assert.equal(partyOf(row({ generation: 4 }), MINE, 3, false), 'displaced')
  // Hand over clears the held generation deliberately: giving it away is not being taken from
  assert.equal(partyOf(row({ generation: 4 }), MINE, null, false), 'reader')
  // and the holder is the holder however the generation moved — the row says whose it is
  assert.equal(partyOf(row({ holderSessionId: MINE, generation: 9 }), MINE, 3, true), 'holder')
})

test('matrix "Keep editing": the row answers my own request, and a cleared column ends it', () => {
  assert.equal(stillAsking(row({ nudgeRequestedBy: MINE }), MINE), true)
  assert.equal(stillAsking(row({ nudgeRequestedBy: null }), MINE), false, 'Keep editing cleared the columns')
  assert.equal(stillAsking(row({ nudgeRequestedBy: THEIRS }), MINE), false, 'somebody else asked after me')
  assert.equal(stillAsking(null, MINE), false, 'the row has vanished: the lock is free')
})

// ── F-079: the countdown RESTARTS, it does not stop ────────────────────────────────────────────────────────────

test('AD-15: work crosses no lock boundary — only ANOTHER holder refuses a save; a free lock and an unknown tab never do', () => {
  assert.equal(heldElsewhere(THEIRS, MINE), true, 'taken over from: the orphaned work is refused')
  assert.equal(heldElsewhere(MINE, MINE), false, 'the holder saves')
  assert.equal(heldElsewhere(null, MINE), false, 'a free lock: a reload, a closing tab, a hand-over mid-flight')
  // a tab that has not learned its id yet is not a stranger — refusing it would drop real work through the displaced flow
  assert.equal(heldElsewhere(THEIRS, ''), false)
  assert.equal(heldElsewhere(THEIRS, null), false)
  assert.equal(heldElsewhere(THEIRS, undefined), false)
})

test('F-079: every interaction with the popover restarts the countdown — focus included', () => {
  for (const type of RESTART_EVENTS) assert.equal(restartsNudge(type), true, type)
  // `focus` does not bubble, so the card listens for `focusin`; naming the wrong one is the bug this asserts against
  assert.ok(RESTART_EVENTS.includes('focusin'), 'focus must restart it (F-079 in so many words)')
  assert.equal(restartsNudge('blur'), false)
  assert.equal(restartsNudge('scroll'), false)
  // A POINTER RESTING ON THE CARD FIRES NOTHING, and the owner's manual test step 6 leaves it there for a minute:
  // presence restarts it too, which is what the tick passes.
  assert.equal(restartsNudge('tick', true), true)
  assert.equal(restartsNudge('tick', false), false)
})

test('the countdown is §AD4\'s ~30 s, counted down in whole seconds and never below zero', () => {
  const at = 1_000_000
  assert.equal(secondsLeft(at, at), NUDGE_MS / 1000)
  assert.equal(secondsLeft(at, at + 1000), NUDGE_MS / 1000 - 1)
  assert.equal(secondsLeft(at, at + NUDGE_MS), 0)
  assert.equal(secondsLeft(at, at + NUDGE_MS * 10), 0, 'a holder who was away never sees a negative number')
})

// ── AD-16: the count is EDITS, and a Remix is one ──────────────────────────────────────────────────────────────

const doc = (...ids: string[]): ProjectDoc => ({
  schemaVersion: 1,
  instances: ids.map((id) => ({
    instanceId: id, layerName: id, designId: `a1/${id}`, content: {}, controls: {}, data: {},
    darkOverrides: {}, hidden: false, isMainFeed: false, memberVisibility: 'everyone',
  })),
}) as ProjectDoc

test('AD-16: a Site Remix of any size is ONE edit in every string this story prints', () => {
  // `remixFold` folds the whole re-roll to ONE `commit`, and `commit` is the only caller of `append` — so the
  // journal sees one transaction however many sections moved. This is that property, expressed where it is read.
  let j: Journal = EMPTY_JOURNAL
  const remixed = doc('a', 'b', 'c', 'd', 'e', 'f')
  j = append(j, { txn: 'one-remix', docKey: 'home', before: doc('a', 'b', 'c', 'd', 'e', 'f'), after: remixed }).journal
  assert.equal(unsyncedEdits(j), 1, 'six sections re-rolled, one edit')
  assert.equal(edits(unsyncedEdits(j)), '1 unsynced edit')
  // …and nothing this story prints is an operation count: the only number any string takes is this one
  assert.equal(LOCK_COPY.willBeLost(unsyncedEdits(j)), '1 unsynced edit will be lost')
})

test('the plural is derived, so the owner\'s own one-edit walk reads correctly', () => {
  assert.equal(edits(0), '0 unsynced edits')
  assert.equal(edits(1), '1 unsynced edit')
  assert.equal(edits(14), '14 unsynced edits')
  assert.equal(LOCK_COPY.noResponse(1), 'No response; that session has 1 unsynced edit')
  assert.equal(LOCK_COPY.willSend(1), '1 unsynced edit will be sent first')
  assert.equal(LOCK_COPY.displaced(1), 'This session had 1 unsynced edit; they were not included.')
})

// ── R-189 and R-190: the strings the owner ruled, and the words that may not appear ─────────────────────────────

test('R-190: the word is `unsynced` and `unsaved` appears in NO string of this story', () => {
  const words = JSON.stringify(Object.values(LOCK_COPY).map((v) => (typeof v === 'function' ? v(7, true) : v)))
  assert.doesNotMatch(words, /unsaved/i, 'the indicator on the same screen says "Saved on this device"')
  assert.match(words, /unsynced/)
})

test('R-189: nobody is named, and "Or message Rosa" does not exist', () => {
  const words = JSON.stringify(Object.values(LOCK_COPY).map((v) => (typeof v === 'function' ? v(7, true) : v)))
  for (const name of ['Rosa', 'Dai', 'message ']) assert.doesNotMatch(words, new RegExp(name, 'i'), name)
  // it says WHERE, never WHO — the three sentences the owner ruled, verbatim
  assert.equal(LOCK_COPY.reading, 'You are editing this site somewhere else — you are reading along here')
  assert.equal(LOCK_COPY.askTitle, 'Your other session wants to edit')
  assert.equal(LOCK_COPY.takeoverTitle, 'Take over from your other session?')
  // and the displaced session reads "THIS session", because the sentence is read by the session it is about
  assert.match(LOCK_COPY.displaced(2), /^This session had/)
})

test('§AD2: the user-visible word is "edits", never "changes"', () => {
  const words = JSON.stringify(Object.values(LOCK_COPY).map((v) => (typeof v === 'function' ? v(7, true) : v)))
  assert.doesNotMatch(words, /changes/i, 'B5a and B5b drew "changes"; §AD2 makes "edits" canonical everywhere')
})

test('B5c\'s second sentence is ABSENT when nothing is owed — absent, never empty (UX-DR3)', () => {
  assert.equal(LOCK_COPY.takeoverBody(240_000, true), 'That session has not responded for 4 minutes. It has edits that never reached the server.')
  assert.equal(LOCK_COPY.takeoverBody(240_000, false), 'That session has not responded for 4 minutes.')
})

test('the duration is the time since the request was sent, in the unit that reads plainly', () => {
  assert.equal(duration(1000), '1 second')
  assert.equal(duration(30_000), '30 seconds')
  assert.equal(duration(89_000), '89 seconds')
  assert.equal(duration(90_000), '2 minutes')
  assert.equal(duration(60_000 * 4), '4 minutes')
  assert.equal(duration(0), '1 second', 'never "0 seconds": something did happen')
})

// ── the wire: one mapping of the row, shared by the route and the first paint ───────────────────────────────────

test('the row maps once, and the two ages are measured on the server rather than trusted to two clocks', () => {
  const now = Date.parse('2026-09-23T12:00:00.000Z')
  const mapped = rowFrom(
    {
      holder_session_id: THEIRS,
      lock_generation: 4,
      unsynced_edits: 7,
      heartbeat_at: '2026-09-23T11:59:50.000Z',
      nudge_requested_by: MINE,
      nudge_requested_at: '2026-09-23T11:59:30.000Z',
    },
    now,
  )
  assert.deepEqual(mapped, {
    holderSessionId: THEIRS,
    generation: 4,
    unsyncedEdits: 7,
    ageMs: 10_000,
    nudgeRequestedBy: MINE,
    nudgeAgeMs: 30_000,
    request: `${MINE}@2026-09-23T11:59:30.000Z`,
  })
  assert.equal(isStale(mapped), false)
})

test('matrix "Keep editing" answers ONE request: the same tab asking again is a NEW request, and reaches the holder', () => {
  const at = (nudged: string | null, by: string | null = MINE) =>
    rowFrom(
      {
        holder_session_id: THEIRS,
        lock_generation: 2,
        unsynced_edits: 0,
        heartbeat_at: '2026-09-24T07:00:00.000Z',
        nudge_requested_by: by,
        nudge_requested_at: nudged,
      },
      Date.parse('2026-09-24T07:00:05.000Z'),
    ).request
  const first = at('2026-09-24T07:00:01.000Z')
  assert.notEqual(first, null)
  assert.equal(at('2026-09-24T07:00:01.000Z'), first, 'the same request read twice is the same request')
  // THE DEFECT THIS TEST EXISTS FOR: keyed by the session, this second ask equalled the first, so a holder that had
  // pressed Keep editing once was never shown it — and the requester was offered a take-over for it
  assert.notEqual(at('2026-09-24T07:00:40.000Z'), first, 'the same tab asking again is a different request')
  assert.notEqual(at('2026-09-24T07:00:01.000Z', 'tab-c'), first, 'another tab asking at the same moment is too')
  assert.equal(at(null, null), null, 'a cleared row has no request waiting')
})

test('a row with no nudge, and a clock that ran backwards, both map without lying', () => {
  const now = Date.parse('2026-09-23T12:00:00.000Z')
  const mapped = rowFrom(
    {
      holder_session_id: MINE,
      lock_generation: 1,
      unsynced_edits: 0,
      // a heartbeat stamped in the FUTURE (clock skew between two devices) must never read as a negative age
      heartbeat_at: '2026-09-23T12:00:30.000Z',
      nudge_requested_by: null,
      nudge_requested_at: null,
    },
    now,
  )
  assert.equal(mapped.ageMs, 0)
  assert.equal(mapped.nudgeRequestedBy, null)
  assert.equal(mapped.nudgeAgeMs, null)
  assert.equal(mapped.request, null)
})

// AD-15's flush contract — `'release'` flushing before it releases — is asserted in `journal.test.ts`, beside
// the three matrix rows `flushDecision` already answers.
