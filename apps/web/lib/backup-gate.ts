/**
 * STORY 7.20a — THE BACKUP STEP'S ONE RULE (F7, `BACKUP-GATE.md`, D1d / D1d′ / D1e): which rows the gate draws for the site's
 * host, which of them can be ticked, what the shortcut covers, how many rows remain, and the footer's reason. Pure — no React,
 * no I/O — so the wizard, the keyboard harness and `backup-gate.test.ts` read one rule (R-170). Every word is
 * `BACKUP_WORDS`' (`lib/deploy.ts`); every link is Ghost's own unversioned help, never a menu path (BACKUP-GATE.md:10-25),
 * as resolved on 2026-10-26 (the spec's "Links").
 *
 * IT IS A CONSENT GATE, NOT A TECHNICAL CONTROL (AD-29): nothing here, and nothing on the server, checks that a backup exists.
 */

import { BACKUP_WORDS as B, type Host } from './deploy.ts'
import { GHOST_ROUTES_HELP } from './routes-upload.ts'

/** Ghost's help for each row (resolved 2026-10-26, each answering 200). The frame's `ghost.org/help/themes/` answers 404, so the
 *  Theme row links "Installing a theme", which says where installed themes are downloaded. */
export const HELP = {
  theme: 'https://ghost.org/help/installing-a-theme/',
  routes: GHOST_ROUTES_HELP,
  exports: 'https://ghost.org/help/exports/',
  redirects: 'https://ghost.org/help/redirects/',
  contentDirectory: 'https://docs.ghost.org/config/',
  backup: 'https://docs.ghost.org/ghost-cli/#ghost-backup',
} as const

export type RowId = 'theme' | 'routes' | 'content' | 'members' | 'redirects' | 'media' | 'database'
export type GateRow = {
  id: RowId
  name: string
  /** `routes.yaml` is set in mono, as the frame draws it */
  mono: boolean
  /** the row's chip: Inflozo's own two in coral, Ghost(Pro)'s database in grey */
  chip: { words: string; tone: 'coral' | 'grey' } | null
  body: string
  warn: string | null
  help: { words: string; href: string }
  /** false only for Ghost(Pro)'s database: nothing to take, so nothing to tick (D1e's "—") */
  tickable: boolean
  /** the row's Download, where the wizard can fetch the file (the wizard decides whether it is offered: the token, R-282) */
  download: 'theme' | 'routes' | null
}

/** THE SEVEN ROWS, in the frame's order. A self-hosted site and a host not yet known get D1d's wording, all seven tickable; a
 *  Ghost(Pro) site gets D1e's for images and the database, and the database cannot be ticked. */
export function gateRows(host: Host): readonly GateRow[] {
  const pro = host === 'ghost_pro'
  const R = B.rows
  const coral = (words: string) => ({ words, tone: 'coral' as const })
  return [
    { id: 'theme', name: R.theme.name, mono: false, chip: coral(R.theme.chip), body: R.theme.body, warn: R.theme.warn, help: { words: R.theme.help, href: HELP.theme }, tickable: true, download: 'theme' },
    { id: 'routes', name: R.routes.name, mono: true, chip: coral(R.routes.chip), body: R.routes.body, warn: null, help: { words: R.routes.help, href: HELP.routes }, tickable: true, download: 'routes' },
    { id: 'content', name: R.content.name, mono: false, chip: null, body: R.content.body, warn: R.content.warn, help: { words: R.content.help, href: HELP.exports }, tickable: true, download: null },
    { id: 'members', name: R.members.name, mono: false, chip: null, body: R.members.body, warn: null, help: { words: R.members.help, href: HELP.exports }, tickable: true, download: null },
    { id: 'redirects', name: R.redirects.name, mono: false, chip: null, body: R.redirects.body, warn: null, help: { words: R.redirects.help, href: HELP.redirects }, tickable: true, download: null },
    {
      id: 'media', name: R.media.name, mono: false, chip: null, body: pro ? R.media.pro : R.media.self, warn: R.media.warn,
      help: pro ? { words: R.media.proHelp, href: HELP.exports } : { words: R.media.selfHelp, href: HELP.contentDirectory }, tickable: true, download: null,
    },
    pro
      ? { id: 'database', name: R.database.name, mono: false, chip: { words: R.database.proChip, tone: 'grey' }, body: R.database.pro, warn: null, help: { words: R.database.proHelp, href: HELP.exports }, tickable: false, download: null }
      : { id: 'database', name: R.database.name, mono: false, chip: null, body: R.database.self, warn: null, help: { words: R.database.selfHelp, href: HELP.backup }, tickable: true, download: null },
  ]
}

/** WHICH BLOCKS SHOW above the rows: the `ghost backup` shortcut on a self-hosted site, Ghost(Pro)'s sky block and ink line in
 *  its place there, and BOTH — the sky block first — on a host not yet known (F7: "both paths offered, neither assumed") */
export const blocksFor = (host: Host): { shortcut: boolean; pro: boolean } => ({ shortcut: host !== 'ghost_pro', pro: host !== 'self' })

/** The sub line under the title: the host's kind and its address, or the address alone while the kind is not known */
export const subLineOf = (host: Host, address: string): string =>
  host === 'self' ? B.sub.self(address) : host === 'ghost_pro' ? B.sub.ghost_pro(address) : B.sub.unknown(address)

/** What the customer has ticked: each row's own tick, the shortcut, and the master confirm. Ticking the shortcut covers every
 *  row and leaves each row's own tick as it was, so unticking it returns them — nothing the customer ticked is lost. */
export type GateTicks = { rows: Readonly<Partial<Record<RowId, boolean>>>; shortcut: boolean; confirmed: boolean }
export const NO_TICKS: GateTicks = { rows: {}, shortcut: false, confirmed: false }

/** The tickable rows still to tick — none while the shortcut covers them (it exists only where `blocksFor` draws it) */
export function remaining(rows: readonly GateRow[], ticks: GateTicks, host: Host): number {
  if (ticks.shortcut && blocksFor(host).shortcut) return 0
  return rows.filter((r) => r.tickable && ticks.rows[r.id] !== true).length
}
/** The master confirm can be ticked once no row remains */
export const confirmAvailable = (rows: readonly GateRow[], ticks: GateTicks, host: Host): boolean => remaining(rows, ticks, host) === 0

/** THE FOOTER'S REASON, naming what remains — the rows, then the confirmation — and null once confirmed (Run checks is live) */
export function reasonOf(rows: readonly GateRow[], ticks: GateTicks, host: Host): string | null {
  const n = remaining(rows, ticks, host)
  if (n > 0) return B.remaining(n)
  return ticks.confirmed ? null : B.oneLeft
}

/** A row ticked or unticked. An untick that leaves a row owed also unticks the master confirm, so Run checks greys again. */
export function toggleRow(rows: readonly GateRow[], ticks: GateTicks, host: Host, id: RowId): GateTicks {
  const row = rows.find((r) => r.id === id)
  if (row === undefined || !row.tickable) return ticks
  return settle(rows, { ...ticks, rows: { ...ticks.rows, [id]: ticks.rows[id] !== true } }, host)
}
/** The shortcut ticked or unticked (each row's own tick kept); unticked with rows owed, the master confirm unticks too */
export function toggleShortcut(rows: readonly GateRow[], ticks: GateTicks, host: Host): GateTicks {
  if (!blocksFor(host).shortcut) return ticks
  return settle(rows, { ...ticks, shortcut: !ticks.shortcut }, host)
}
/** The master confirm: a press while a row is owed does nothing (greyed, R-98); otherwise it flips */
export function toggleConfirm(rows: readonly GateRow[], ticks: GateTicks, host: Host): GateTicks {
  if (!confirmAvailable(rows, ticks, host)) return ticks
  return { ...ticks, confirmed: !ticks.confirmed }
}
const settle = (rows: readonly GateRow[], ticks: GateTicks, host: Host): GateTicks =>
  ticks.confirmed && !confirmAvailable(rows, ticks, host) ? { ...ticks, confirmed: false } : ticks

/** Story 2.5's route for a site's snapshot (AD-13: a 60-second signed URL, a 303 to Storage) — the Theme Download follows it */
export const snapshotDownloadPath = (id: string): string => `/snapshots/${encodeURIComponent(id)}/download`
