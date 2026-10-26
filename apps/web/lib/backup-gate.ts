/**
 * STORY 7.20a — THE BACKUP STEP'S ONE RULE (F7, `BACKUP-GATE.md`, D1d as R-283 cut it): the two rows the gate asks for, how
 * many remain, the footer's reason, and the ticks. Pure — no React, no I/O — so the wizard, the keyboard harness and
 * `backup-gate.test.ts` read one rule (R-170). Every word is `BACKUP_WORDS`' (`lib/deploy.ts`); every link is Ghost's own
 * unversioned help, never a menu path (BACKUP-GATE.md:10-25), as resolved on 2026-10-26 (the spec's "Links").
 *
 * R-283 (owner, 2026-10-26): THE GATE ASKS FOR THE TWO THINGS INFLOZO WRITES — the theme and `routes.yaml` — and only RECOMMENDS
 * the rest (the advice above the rows, which the wizard draws from `BACKUP_WORDS.advice`). Every host draws the same card; the
 * host names the sub line alone.
 *
 * IT IS A CONSENT GATE, NOT A TECHNICAL CONTROL (AD-29): nothing here, and nothing on the server, checks that a copy exists.
 */

import { BACKUP_WORDS as B, type Host } from './deploy.ts'
import { GHOST_ROUTES_HELP } from './routes-upload.ts'

/** Ghost's help (resolved 2026-10-26, each answering 200). The frame's `ghost.org/help/themes/` answers 404, so the Theme row
 *  links "Installing a theme", which says where installed themes are downloaded; the advice links Ghost's help on exports. */
export const HELP = {
  theme: 'https://ghost.org/help/installing-a-theme/',
  routes: GHOST_ROUTES_HELP,
  exports: 'https://ghost.org/help/exports/',
} as const

export type RowId = 'theme' | 'routes'
export type GateRow = {
  id: RowId
  name: string
  /** `routes.yaml` is set in mono, as the frame draws it */
  mono: boolean
  /** the row's coral chip — what Inflozo does to it */
  chip: string
  body: string
  warn: string | null
  help: { words: string; href: string }
  /** the row's Download (the wizard decides whether it is offered: the theme needs the token, `routes.yaml` never does, R-282) */
  download: RowId
}

/** THE TWO ROWS, in the frame's order (D1d `:262-283` and the next) */
export const GATE_ROWS: readonly GateRow[] = [
  { id: 'theme', name: B.rows.theme.name, mono: false, chip: B.rows.theme.chip, body: B.rows.theme.body, warn: B.rows.theme.warn, help: { words: B.rows.theme.help, href: HELP.theme }, download: 'theme' },
  { id: 'routes', name: B.rows.routes.name, mono: true, chip: B.rows.routes.chip, body: B.rows.routes.body, warn: null, help: { words: B.rows.routes.help, href: HELP.routes }, download: 'routes' },
]

/** The sub line under the title: the host's kind and its address, or the address alone while the kind is not known */
export const subLineOf = (host: Host, address: string): string =>
  host === 'self' ? B.sub.self(address) : host === 'ghost_pro' ? B.sub.ghost_pro(address) : B.sub.unknown(address)

/** What the customer has ticked: each row's own tick, and the master confirm */
export type GateTicks = { rows: Readonly<Partial<Record<RowId, boolean>>>; confirmed: boolean }
export const NO_TICKS: GateTicks = { rows: {}, confirmed: false }

/** The rows still to tick */
export const remaining = (ticks: GateTicks): number => GATE_ROWS.filter((r) => ticks.rows[r.id] !== true).length
/** The master confirm can be ticked once no row remains */
export const confirmAvailable = (ticks: GateTicks): boolean => remaining(ticks) === 0

/** THE FOOTER'S REASON, naming what remains — the rows, then the confirmation — and null once confirmed (Run checks is live) */
export function reasonOf(ticks: GateTicks): string | null {
  const n = remaining(ticks)
  if (n > 0) return B.remaining(n)
  return ticks.confirmed ? null : B.oneLeft
}

/** A row ticked or unticked. An untick that leaves a row owed also unticks the master confirm, so Run checks greys again. */
export function toggleRow(ticks: GateTicks, id: RowId): GateTicks {
  const next = { ...ticks, rows: { ...ticks.rows, [id]: ticks.rows[id] !== true } }
  return next.confirmed && !confirmAvailable(next) ? { ...next, confirmed: false } : next
}
/** The master confirm: a press while a row is owed does nothing (greyed, R-98); otherwise it flips */
export const toggleConfirm = (ticks: GateTicks): GateTicks => (confirmAvailable(ticks) ? { ...ticks, confirmed: !ticks.confirmed } : ticks)

/** Story 2.5's route for a site's snapshot (AD-13: a 60-second signed URL, a 303 to Storage) — the Theme Download follows it */
export const snapshotDownloadPath = (id: string): string => `/snapshots/${encodeURIComponent(id)}/download`
