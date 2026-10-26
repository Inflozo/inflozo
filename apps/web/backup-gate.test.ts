// Story 7.20a — the Backup step's one rule (`lib/backup-gate.ts`), over the spec's I/O matrix as R-283 cut it: two rows, Theme
// and routes.yaml, on every host; the counts and the footer's reason; an untick after the confirm; the sub line; the links.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  confirmAvailable, GATE_ROWS, HELP, NO_TICKS, reasonOf, remaining, snapshotDownloadPath, subLineOf, toggleConfirm, toggleRow, type GateTicks,
} from './lib/backup-gate.ts'
import { BACKUP_WORDS } from './lib/deploy.ts'
import { GHOST_ROUTES_HELP } from './lib/routes-upload.ts'

test('R-283: two rows, the two things Inflozo writes — Theme and routes.yaml, in the frame\'s order, each tickable, each with its Download and its coral chip', () => {
  assert.deepEqual(GATE_ROWS.map((r) => r.id), ['theme', 'routes'])
  assert.deepEqual(GATE_ROWS.map((r) => [r.id, r.download]), [['theme', 'theme'], ['routes', 'routes']])
  assert.deepEqual(GATE_ROWS.map((r) => r.chip), ['INFLOZO REPLACES THIS', 'INFLOZO MAY OVERWRITE THIS'])
  assert.deepEqual(GATE_ROWS.filter((r) => r.mono).map((r) => r.id), ['routes'], 'routes.yaml set in mono')
  assert.equal(GATE_ROWS.find((r) => r.id === 'theme')?.warn, BACKUP_WORDS.rows.theme.warn)
  assert.equal(GATE_ROWS.find((r) => r.id === 'routes')?.warn, null)
})

test('the counts: two to tick, then the confirmation — the reason singular at one, "One confirmation left." at none, nothing once confirmed', () => {
  assert.equal(remaining(NO_TICKS), 2)
  assert.equal(reasonOf(NO_TICKS), '2 rows still to tick, then the confirmation above.')
  let t: GateTicks = toggleRow(NO_TICKS, 'theme')
  assert.equal(reasonOf(t), '1 row still to tick, then the confirmation above.')
  assert.equal(confirmAvailable(t), false)
  t = toggleRow(t, 'routes')
  assert.equal(confirmAvailable(t), true)
  assert.equal(reasonOf(t), 'One confirmation left.')
  t = toggleConfirm(t)
  assert.equal(t.confirmed, true)
  assert.equal(reasonOf(t), null, 'confirmed: Run checks is live, nothing remains to say')
})

test('the master confirm: a press while a row is owed changes nothing (greyed, R-98); unticking a row after it unticks it too', () => {
  assert.deepEqual(toggleConfirm(NO_TICKS), NO_TICKS, 'greyed: the press does nothing')
  assert.deepEqual(toggleConfirm(toggleRow(NO_TICKS, 'theme')), toggleRow(NO_TICKS, 'theme'), 'one row owed: still nothing')
  let t = toggleConfirm(toggleRow(toggleRow(NO_TICKS, 'theme'), 'routes'))
  assert.equal(t.confirmed, true)
  t = toggleRow(t, 'routes')
  assert.equal(t.confirmed, false, 'a row owed again: the confirm unticks, so Run checks greys')
  assert.equal(reasonOf(t), '1 row still to tick, then the confirmation above.')
  // the control: re-ticking the row leaves the unticked confirm unticked — nothing ticks it for the customer
  t = toggleRow(t, 'routes')
  assert.equal(t.confirmed, false)
  assert.equal(reasonOf(t), 'One confirmation left.')
})

test('every host draws the same card — the host only names the sub line', () => {
  assert.equal(subLineOf('self', 'ghost6.inflozo.com'), 'Self-hosted Ghost · ghost6.inflozo.com')
  assert.equal(subLineOf('ghost_pro', 'ghost6.inflozo.com'), 'Ghost(Pro) · ghost6.inflozo.com')
  assert.equal(subLineOf(null, 'ghost6.inflozo.com'), 'ghost6.inflozo.com')
})

test('every link is Ghost\'s own unversioned help, never a menu path — the Theme row\'s "Installing a theme" (the frame\'s answers 404), and the advice\'s exports page', () => {
  assert.deepEqual(Object.fromEntries(GATE_ROWS.map((r) => [r.id, r.help.href])), {
    theme: 'https://ghost.org/help/installing-a-theme/',
    routes: GHOST_ROUTES_HELP,
  })
  assert.equal(HELP.exports, 'https://ghost.org/help/exports/', 'the advice links Ghost\'s help on exports (R-283)')
  for (const words of [BACKUP_WORDS.advice.body, BACKUP_WORDS.leadIn, ...GATE_ROWS.map((r) => r.body)]) {
    assert.doesNotMatch(words, /Settings →|Labs|Advanced/, `${words}: no Ghost Admin menu path`)
  }
  assert.equal(snapshotDownloadPath('00000000-0000-4000-8000-000000000720'), '/snapshots/00000000-0000-4000-8000-000000000720/download')
})
