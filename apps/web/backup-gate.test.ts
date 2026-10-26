// Story 7.20a — the Backup step's one rule (`lib/backup-gate.ts`), over the spec's I/O matrix: the rows per host, which can be
// ticked, the shortcut's cover and restore, the counts and the footer's reason, an untick after the confirm, and the links.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  blocksFor, confirmAvailable, gateRows, HELP, NO_TICKS, reasonOf, remaining, snapshotDownloadPath, subLineOf, toggleConfirm, toggleRow, toggleShortcut,
  type GateTicks, type RowId,
} from './lib/backup-gate.ts'
import { BACKUP_WORDS } from './lib/deploy.ts'
import { GHOST_ROUTES_HELP } from './lib/routes-upload.ts'

const ORDER: RowId[] = ['theme', 'routes', 'content', 'members', 'redirects', 'media', 'database']

test('the seven rows, in the frame\'s order — D1d\'s wording on a self-hosted site and on a host not yet known, all tickable; D1e\'s on Ghost(Pro), its database not', () => {
  for (const host of ['self', null] as const) {
    const rows = gateRows(host)
    assert.deepEqual(rows.map((r) => r.id), ORDER)
    assert.ok(rows.every((r) => r.tickable), `${host}: every row tickable`)
    assert.equal(rows.find((r) => r.id === 'media')?.body, BACKUP_WORDS.rows.media.self)
    assert.equal(rows.find((r) => r.id === 'database')?.body, BACKUP_WORDS.rows.database.self)
    assert.equal(rows.find((r) => r.id === 'database')?.chip, null)
  }
  const pro = gateRows('ghost_pro')
  assert.deepEqual(pro.map((r) => r.id), ORDER)
  const db = pro.find((r) => r.id === 'database')
  assert.equal(db?.tickable, false, 'D1e: nothing to take, nothing to tick')
  assert.deepEqual(db?.chip, { words: 'NOT YOURS TO TAKE', tone: 'grey' })
  assert.equal(pro.find((r) => r.id === 'media')?.body, BACKUP_WORDS.rows.media.pro)
  // Inflozo's own two carry the coral chips and the Downloads; routes.yaml is set in mono
  assert.deepEqual(pro.filter((r) => r.chip?.tone === 'coral').map((r) => r.id), ['theme', 'routes'])
  assert.deepEqual(pro.filter((r) => r.download !== null).map((r) => [r.id, r.download]), [['theme', 'theme'], ['routes', 'routes']])
  assert.deepEqual(pro.filter((r) => r.mono).map((r) => r.id), ['routes'])
})

test('the counts, per host: seven to tick on a self-hosted site and an unknown one, six on Ghost(Pro) (the database excluded) — with the reason singular at one', () => {
  assert.equal(remaining(gateRows('self'), NO_TICKS, 'self'), 7)
  assert.equal(remaining(gateRows(null), NO_TICKS, null), 7)
  assert.equal(remaining(gateRows('ghost_pro'), NO_TICKS, 'ghost_pro'), 6)
  assert.equal(reasonOf(gateRows('self'), NO_TICKS, 'self'), '7 rows still to tick, then the confirmation above.')
  assert.equal(reasonOf(gateRows('ghost_pro'), NO_TICKS, 'ghost_pro'), '6 rows still to tick, then the confirmation above.')
  let t: GateTicks = NO_TICKS
  const rows = gateRows('self')
  for (const id of ORDER.slice(0, 6)) t = toggleRow(rows, t, 'self', id)
  assert.equal(reasonOf(rows, t, 'self'), '1 row still to tick, then the confirmation above.')
  assert.equal(confirmAvailable(rows, t, 'self'), false)
  t = toggleRow(rows, t, 'self', 'database')
  assert.equal(confirmAvailable(rows, t, 'self'), true)
  assert.equal(reasonOf(rows, t, 'self'), 'One confirmation left.')
  t = toggleConfirm(rows, t, 'self')
  assert.equal(t.confirmed, true)
  assert.equal(reasonOf(rows, t, 'self'), null, 'confirmed: Run checks is live, nothing remains to say')
  // an untickable row cannot be ticked: Ghost(Pro)'s six are enough
  const pro = gateRows('ghost_pro')
  let p: GateTicks = NO_TICKS
  for (const id of ORDER) p = toggleRow(pro, p, 'ghost_pro', id)
  assert.equal(p.rows.database, undefined, 'the database was never ticked')
  assert.equal(confirmAvailable(pro, p, 'ghost_pro'), true)
})

test('the master confirm: a press while a row is owed changes nothing (greyed, R-98); unticking a row after it unticks it too', () => {
  const rows = gateRows('self')
  assert.deepEqual(toggleConfirm(rows, NO_TICKS, 'self'), NO_TICKS, 'greyed: the press does nothing')
  let t: GateTicks = NO_TICKS
  for (const id of ORDER) t = toggleRow(rows, t, 'self', id)
  t = toggleConfirm(rows, t, 'self')
  assert.equal(t.confirmed, true)
  t = toggleRow(rows, t, 'self', 'members')
  assert.equal(t.confirmed, false, 'a row owed again: the confirm unticks, so Run checks greys')
  assert.equal(remaining(rows, t, 'self'), 1)
  // the control: re-ticking a row that leaves nothing owed keeps an unticked confirm unticked (nothing ticks it for the customer)
  t = toggleRow(rows, t, 'self', 'members')
  assert.equal(t.confirmed, false)
})

test('the shortcut covers every row and leaves each row\'s own tick; unticked, each row is as it was — and it exists only where the frame draws it', () => {
  const rows = gateRows('self')
  let t = toggleRow(rows, NO_TICKS, 'self', 'theme')
  t = toggleRow(rows, t, 'self', 'members')
  const own = t.rows
  t = toggleShortcut(rows, t, 'self')
  assert.equal(t.shortcut, true)
  assert.equal(remaining(rows, t, 'self'), 0)
  assert.equal(reasonOf(rows, t, 'self'), 'One confirmation left.')
  assert.deepEqual(t.rows, own, 'each row\'s own tick kept under the cover')
  t = toggleConfirm(rows, t, 'self')
  assert.equal(t.confirmed, true)
  t = toggleShortcut(rows, t, 'self')
  assert.deepEqual(t.rows, own, 'unticked: nothing the customer ticked is lost')
  assert.equal(remaining(rows, t, 'self'), 5)
  assert.equal(t.confirmed, false, 'rows owed again: the confirm unticks')
  // an unknown host draws the shortcut too; Ghost(Pro) has none, and a shortcut there covers nothing
  assert.equal(remaining(gateRows(null), toggleShortcut(gateRows(null), NO_TICKS, null), null), 0)
  const pro = gateRows('ghost_pro')
  assert.deepEqual(toggleShortcut(pro, NO_TICKS, 'ghost_pro'), NO_TICKS)
  assert.equal(remaining(pro, { ...NO_TICKS, shortcut: true }, 'ghost_pro'), 6, 'the control: a stray flag covers nothing on Ghost(Pro)')
})

test('the blocks and the sub line per host: the shortcut self-hosted, Ghost(Pro)\'s sky block there, both on an unknown host', () => {
  assert.deepEqual(blocksFor('self'), { shortcut: true, pro: false })
  assert.deepEqual(blocksFor('ghost_pro'), { shortcut: false, pro: true })
  assert.deepEqual(blocksFor(null), { shortcut: true, pro: true }, 'F7: both paths offered, neither assumed')
  assert.equal(subLineOf('self', 'ghost6.inflozo.com'), 'Self-hosted Ghost · ghost6.inflozo.com')
  assert.equal(subLineOf('ghost_pro', 'ghost6.inflozo.com'), 'Ghost(Pro) · ghost6.inflozo.com')
  assert.equal(subLineOf(null, 'ghost6.inflozo.com'), 'ghost6.inflozo.com')
})

test('every link is Ghost\'s own unversioned help, never a menu path — the Theme row\'s the resolved "Installing a theme" (the frame\'s answers 404)', () => {
  const links = Object.fromEntries(gateRows('self').map((r) => [r.id, r.help.href]))
  assert.deepEqual(links, {
    theme: 'https://ghost.org/help/installing-a-theme/',
    routes: GHOST_ROUTES_HELP,
    content: 'https://ghost.org/help/exports/',
    members: 'https://ghost.org/help/exports/',
    redirects: 'https://ghost.org/help/redirects/',
    media: 'https://docs.ghost.org/config/',
    database: 'https://docs.ghost.org/ghost-cli/#ghost-backup',
  })
  const pro = Object.fromEntries(gateRows('ghost_pro').map((r) => [r.id, r.help.href]))
  assert.equal(pro.media, HELP.exports)
  assert.equal(pro.database, HELP.exports)
  assert.ok(!Object.values(links).includes('https://ghost.org/help/themes/'), 'the frame\'s 404 is gone')
  for (const row of gateRows(null)) assert.doesNotMatch(`${row.body} ${row.help.words}`, /Settings →|Labs|Advanced/, `${row.id}: no Ghost Admin menu path`)
  assert.equal(snapshotDownloadPath('00000000-0000-4000-8000-000000000720'), '/snapshots/00000000-0000-4000-8000-000000000720/download')
})
