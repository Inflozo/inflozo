import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  deadlineLabel,
  DELETE_PHRASE,
  DELETION_WINDOW_DAYS,
  deletionSentence,
  isRestored,
  matchesPhrase,
  PURGE_WINDOW_DOC,
  RESTORED,
  RESTORED_PATH,
  RESTORED_VALUE,
  snapshotObjectKey,
} from './app/(app)/app/(authed)/account/deletion-rule.ts'

/* Story 2.5 — FR-A5's window, every pure half of it. The typed confirm decides whether the one
   irreversible thing in the product happens, the sentence tells the user what they are agreeing
   to, and the date is what the email and the page both promise. None of the three is reachable
   from a browser step without first deleting a real account, which is exactly why they are here. */

test('the phrase is exact after trimming, and never case-folded', () => {
  assert.equal(matchesPhrase(DELETE_PHRASE), true)
  assert.equal(matchesPhrase(`  ${DELETE_PHRASE}  `), true, 'surrounding space is trimmed, as the rename rule trims it')
  assert.equal(matchesPhrase('delete my acc'), false)
  assert.equal(matchesPhrase('Delete My Account'), false, 'case-folding would defeat the point of typing it')
  assert.equal(matchesPhrase('delete  my  account'), false, 'inner space is not collapsed')
  assert.equal(matchesPhrase(''), false)
})

test('the sentence has three shapes and each says the window', () => {
  const many = deletionSentence(6, 48)
  assert.match(many, /^All 6 projects, their full version history and 48 assets will be permanently deleted in 14 days\./)

  const one = deletionSentence(1, 48)
  assert.match(one, /^Your 1 project, its full version history and 48 assets will be permanently deleted in 14 days\./)

  // The third shape is also what a count that could not be READ falls back to: "0 projects" would
  // be a claim about the account, and this is true whatever the account holds.
  const empty = deletionSentence(0, 0)
  assert.match(empty, /^Everything in your account will be permanently deleted in 14 days\./)
  assert.doesNotMatch(empty, /0 projects|0 assets/)

  // The asset noun agrees with its count — the sentence is read by someone about to lose them.
  assert.match(deletionSentence(2, 1), / and 1 asset will be /)
  // And with no assets — or an asset count that could not be read — the clause is LEFT OUT:
  // "and 0 assets" would be a claim on the one irreversible confirm (review, 2026-09-07).
  assert.match(deletionSentence(1, 0), /^Your 1 project, its full version history will be permanently deleted in 14 days\./)
  assert.match(deletionSentence(3, 0), /^All 3 projects, their full version history will be permanently deleted in 14 days\./)
  assert.doesNotMatch(deletionSentence(3, 0), /0 assets/)

  // Every shape carries the two clauses the frame's "This cannot be undone." became, because for
  // fourteen days it CAN be, and the user is deciding on this sentence.
  for (const said of [many, one, empty]) {
    assert.match(said, /Your live Ghost sites stay online\./)
    assert.match(said, /Until then, signing in restores everything — after that, it cannot be undone\.$/)
  }
})

test('the sentence says the window the database will actually act on', () => {
  // The days are a parameter with a default, so a caller cannot quietly pass a different number
  // and leave the screen disagreeing with `purge_after`.
  assert.match(deletionSentence(3, 3), new RegExp(`in ${DELETION_WINDOW_DAYS} days`))
})

test('the deadline is one date shape: short month, day, year, UTC', () => {
  assert.equal(deadlineLabel('2026-09-21T10:04:23.599Z'), 'Sep 21, 2026')
  assert.equal(deadlineLabel(new Date('2026-01-02T00:00:00Z')), 'Jan 2, 2026')
  // Late UTC evening is still that day — the server renders it and the client re-renders it, and
  // a floating zone would let the two disagree about the date in the user's own email.
  assert.equal(deadlineLabel('2026-09-21T23:59:59Z'), 'Sep 21, 2026')
  // A row that came back without one must not put "Invalid Date" on the page.
  assert.equal(deadlineLabel('not a date'), 'the date in your email')
})

test('the snapshot key drops the bucket the column carries and nothing else', () => {
  assert.equal(snapshotObjectKey('site-snapshots/u1/s1/theme.zip'), 'u1/s1/theme.zip')
  // Already a key: unchanged, so calling it twice is safe.
  assert.equal(snapshotObjectKey('u1/s1/theme.zip'), 'u1/s1/theme.zip')
  // Only the LEADING prefix — a folder that happens to repeat the name stays where it is.
  assert.equal(snapshotObjectKey('site-snapshots/u1/site-snapshots/theme.zip'), 'u1/site-snapshots/theme.zip')
})

test('the restored hint round-trips, and nothing else reads as it', () => {
  const value = new URL(RESTORED_PATH, 'https://app.inflozo.com').searchParams.get(RESTORED)
  assert.equal(value, RESTORED_VALUE)
  assert.equal(isRestored(value ?? undefined), true)
  assert.equal(isRestored(undefined), false)
  assert.equal(isRestored('0'), false)
  // A repeated key arrives as an ARRAY, which is not the value.
  assert.equal(isRestored([RESTORED_VALUE, RESTORED_VALUE]), false)
})

/**
 * THE WINDOW IS DERIVED, NOT RESTATED (counts are derived, never restated). `DELETION_WINDOW_DAYS`
 * is a copy of the `interval` in the migration, and the migration is the only writer of
 * `purge_after` — so the day someone changes one, every screen and the email would keep promising
 * the other, with lint, types, the build and every browser step still green. The source is read.
 */
test('DELETION_WINDOW_DAYS is the interval the migration actually stamps', () => {
  const migration = readFileSync(new URL(PURGE_WINDOW_DOC, import.meta.url), 'utf8')
  const stamped = [...migration.matchAll(/interval '(\d+) days'/g)].map((m) => Number(m[1]))
  assert.ok(stamped.length > 0, `${PURGE_WINDOW_DOC} no longer stamps an interval — this test reads it rather than restating it`)
  for (const days of stamped) {
    assert.equal(days, DELETION_WINDOW_DAYS, `the migration stamps ${days} days and the app says ${DELETION_WINDOW_DAYS}`)
  }
})
