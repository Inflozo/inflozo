import { ghostName } from '@inflozo/section-runtime/custom-settings'
import { PLANS } from './plan.ts'
import { DEPLOY_WORDS, fileLabel, versionLabel, versionNumber } from './deploy.ts'
import { compareManifests, labelOf, type ContentManifest } from './drift.ts'
import { droppedKeys } from './preflight.ts'

/**
 * STORY 7.22 — ARTIFACT RETENTION'S ONE RULE (FR-J7, AD-29, AD-33). Pure, like `lib/deploy.ts`: no import from `server/`, no
 * clock, no I/O — so the History drawer, the history route, `server/retention.ts`' `pruneProject`, the nightly sweep
 * (`lib/artifact-sweep.ts`) and `node --test` (`retention.test.ts`) read one rule.
 *
 * ONE DEFINITION OF A VERSION. A stored version is a `deploys` row Ghost accepted — status `uploaded` or `live` — whose zip is
 * still stored (`artifact_path` not null). The list, the count, the pin cap and the prune all read `isStoredVersion`, and
 * `pin_version()` (`supabase/migrations/20261125120000_pin_version.sql`) holds the same predicate in SQL.
 *
 * THE RULE, PER PROJECT, ACROSS EVERY SITE. Newest first by `accepted_at` — when Ghost last took the version's files (Story 7.23a,
 * DW-400: a check made before a re-link and shipped after one is the newest, not the oldest; `created_at`, the Pre-flight's time,
 * breaks a tie and stands in on a row written before the column): every pinned version is kept, plus the newest
 * `max(1, cap − pinned)` unpinned ones; the rest are prunable. So the newest version is never pruned (it is pinned, or it is the
 * first unpinned one kept), and a project whose pins reach the cap — only after a plan change, since `pin_version` stops at
 * N−1 — keeps every pin and the newest unpinned version (Story 12.4 refines it, DW-399). `cap` is `PLANS[plan].history`, the
 * plan read through `plan.ts` alone (AD-28).
 *
 * PRUNING NEVER DELETES A ROW (the spec's Never). It clears the pointer and removes the object, so the row keeps its
 * `content_manifest` (the drift baseline, R-287), its `version` (DW-372's numbers, `nextVersion`) and its verdicts.
 */

/** the plan's history cap: Free's and Pro's numbers, read from `PLANS` and never typed (standing rule 4) */
export const historyCap = (plan: keyof typeof PLANS): number => PLANS[plan].history
/** the fewest versions any plan keeps — a project holding no more than this has nothing any rule could prune */
export const FEWEST_KEPT = Math.min(...Object.values(PLANS).map((p) => p.history))

/** THE ONE PREDICATE: Ghost accepted it and its zip is still stored */
export const isStoredVersion = (row: { status?: unknown; artifact_path?: unknown }): boolean =>
  (row.status === 'uploaded' || row.status === 'live') && typeof row.artifact_path === 'string' && row.artifact_path !== ''

/** what the prune reads of a row */
export type Stored = { id: string; status: string; artifact_path: string | null; pinned: boolean; created_at: string; accepted_at?: string | null }

/** STORY 7.23a (DW-400) — NEWEST IS THE UPLOAD GHOST ACCEPTED: `accepted_at` first (a row written before the column, or never
 *  accepted, stands on its `created_at`), then `created_at`, then the id, so two reads order alike. The list, the prune and the drift
 *  baseline (`deploy-io.ts`' `baseline`, in SQL) all order this way */
export const newestFirst = <T extends { id: string; created_at: string; accepted_at?: string | null }>(a: T, b: T): number =>
  Date.parse(b.accepted_at ?? b.created_at) - Date.parse(a.accepted_at ?? a.created_at) ||
  Date.parse(b.created_at) - Date.parse(a.created_at) ||
  (a.id < b.id ? 1 : a.id > b.id ? -1 : 0)

/** THE RULE: the stored versions past the cap, oldest last — every one of them unpinned, never the newest */
export function prunable<T extends Stored>(rows: readonly T[], cap: number): T[] {
  const versions = rows.filter(isStoredVersion).sort(newestFirst)
  const pinned = versions.filter((v) => v.pinned).length
  return versions.filter((v) => !v.pinned).slice(Math.max(1, cap - pinned))
}

// ── Story 7.23a — the put-back's one rule ────────────────────────────────────────────────────────────────────────────

/** WHAT A HISTORY ROW'S ACTION DOES: `reactivate` when Ghost already holds this version's files (D2d's row), else `rollback`,
 *  which uploads the stored zip again */
export type PutBack = 'reactivate' | 'rollback'

/** the newest upload Ghost accepted among these rows (`uploaded`/`live`, stored or pruned) — the caller hands one project × site's */
export const newestAccepted = <T extends { id: string; status: string; created_at: string; accepted_at?: string | null }>(rows: readonly T[]): string | null =>
  rows.filter((r) => r.status === 'uploaded' || r.status === 'live').sort(newestFirst)[0]?.id ?? null

/**
 * STORY 7.23a — WHO MAY ACT, AND WITH WHAT (the spec's Always). A row's action exists only when it is a stored version, its site
 * is the project's linked site, and it is not that site's Live row. It is RE-ACTIVATE when the row is `uploaded` and is the newest
 * upload Ghost accepted for this project × site (`newest`, `newestAccepted` over that site's rows) — Ghost holds its files under the
 * frozen name, so a `PUT activate` alone makes it live — and ROLL BACK otherwise. The drawer draws it from the route's answer and
 * `server/deploy/put-back.ts` decides it again from its own reads; the server never trusts the client's choice.
 */
export function actionOf(
  row: { id: string; status: string; artifact_path: string | null; site_id: string },
  at: { linkedSiteId: string | null; newest: string | null },
): PutBack | null {
  if (!isStoredVersion(row) || row.site_id !== at.linkedSiteId || row.status === 'live') return null
  return row.status === 'uploaded' && row.id === at.newest ? 'reactivate' : 'rollback'
}

/**
 * STORY 7.23a — THE CHANGED LINE (S8e `:302`, `:310`, `:318`; D2c's v1 `:278`), one pure function. It compares this row's manifest
 * with its PREDECESSOR's — the same project × site row holding the highest version below it, a pruned one included (its manifest is
 * kept). No predecessor: "First deploy". Either manifest null (a deploy made before Story 7.21): no line. Otherwise
 * `compareManifests`, each file named as it SHIPPED: a section partial by the manifest's own `layer` (`labelOf` with no current
 * names), a template by `fileLabel` — "added "/"removed " before one the other lacks — and every other file by `labelOf`'s kind
 * word. Deduped, in the frame's shape "Changed: A, B · added C", past three names "and {k} more", and with nothing different "No
 * changes since v{p}".
 */
export function changedLine(manifest: ContentManifest | null, prev: { version: string; manifest: ContentManifest | null } | null): string | null {
  if (prev === null) return HISTORY_WORDS.firstDeploy
  if (manifest === null || prev.manifest === null) return null
  const diff = compareManifests(prev.manifest, manifest)
  const isTemplate = (path: string) => path.endsWith('.hbs') && (!path.startsWith('partials/') || path === 'partials/content-cta.hbs')
  const name = (path: string): string => {
    const entry = manifest[path] ?? prev.manifest?.[path]
    return isTemplate(path) ? (fileLabel(path) ?? labelOf({ path }, 'changed')) : labelOf({ path, ...(entry === undefined ? {} : { entry }) }, 'changed')
  }
  // each name once, a template the other lacks marked "added"/"removed"; the plain names lead, as the frame draws them
  const named: { words: string; marked: boolean }[] = []
  const add = (words: string, marked = false) => void (named.some((n) => n.words === words) || named.push({ words, marked }))
  for (const path of diff.changed) add(name(path))
  for (const path of diff.added) add(isTemplate(path) ? HISTORY_WORDS.addedTemplate(name(path)) : name(path), isTemplate(path))
  for (const path of diff.removed) add(isTemplate(path) ? HISTORY_WORDS.removedTemplate(name(path)) : name(path), isTemplate(path))
  if (named.length === 0) return HISTORY_WORDS.noChanges(versionNumber(prev.version))
  const shown = [...named.filter((n) => !n.marked), ...named.filter((n) => n.marked)].slice(0, 3)
  const plain = shown.filter((n) => !n.marked).map((n) => n.words)
  const line = [...(plain.length === 0 ? [] : [plain.join(', ')]), ...shown.filter((n) => n.marked).map((n) => n.words)].join(' · ')
  return `${HISTORY_WORDS.changed}${line}${named.length > 3 ? ` ${HISTORY_WORDS.more(named.length - 3)}` : ''}`
}

// ── the History drawer ──────────────────────────────────────────────────────────────────────────────────────────────

/** GET `projects/[id]/history`'s answer: the project's stored versions on every site, newest accepted first, the project's link,
 *  and the version live on the linked site (the Roll back confirm's "v{n} stays in history"; null when nothing is) */
export type HistoryAnswer = {
  linkedSiteId: string | null
  liveVersion: string | null
  rows: readonly {
    id: string
    version: string
    status: string
    pinned: boolean
    createdAt: string
    /** Story 7.23a — when Ghost last accepted this version's files (DW-400): the order and the time label */
    acceptedAt: string
    /** the gscan verdict's counts, or null on a row with none */
    errors: number | null
    warnings: number | null
    siteId: string
    /** the row's site's host, for "on {host}" */
    host: string
    /** Story 7.23a — `changedLine`'s, or null */
    changed: string | null
    /** Story 7.23a — the custom settings Ghost forgets if this version goes live (`droppedKeys` against the site's Live row) */
    drops: readonly string[]
    /** Story 7.23a — `actionOf`'s */
    action: PutBack | null
  }[]
}

/** a row as the route reads it, light: every `uploaded`/`live` row of the project, stored or pruned */
export type AcceptedRow = { id: string; version: string; status: string; site_id: string; created_at: string; accepted_at: string | null; artifact_path: string | null }
/** the manifest and Pre-flight's facts of a row, read only for the rows `heavyIds` names */
export type HeavyRow = { content_manifest: ContentManifest | null; preflight: { custom?: Readonly<Record<string, unknown>> | null } | null }

/** the row holding the highest version below this one, on its site (pruned rows count: their manifest is kept) */
const predecessorOf = (row: AcceptedRow, rows: readonly AcceptedRow[]): AcceptedRow | null => {
  const n = versionNumber(row.version)
  let best: AcceptedRow | null = null
  for (const r of rows) {
    const m = versionNumber(r.version)
    if (r.site_id === row.site_id && m < n && (best === null || m > versionNumber(best.version))) best = r
  }
  return best
}
/** a listed row the light read lacks sorts last (and is dropped) */
const NONE = { id: '', created_at: '1970-01-01T00:00:00Z', accepted_at: null }
const liveOn = (siteId: string, rows: readonly AcceptedRow[]) => rows.find((r) => r.site_id === siteId && r.status === 'live') ?? null

/** WHICH ROWS' MANIFESTS THE ROUTE READS: the listed ones (stored versions), each one's predecessor, and each site's Live row — at
 *  most twice the cap and one per site (the spec's bound), never the project's whole history */
export function heavyIds(rows: readonly AcceptedRow[]): string[] {
  const ids = new Set<string>()
  for (const r of rows.filter(isStoredVersion)) {
    ids.add(r.id)
    const prev = predecessorOf(r, rows)
    if (prev !== null) ids.add(prev.id)
    const live = liveOn(r.site_id, rows)
    if (live !== null) ids.add(live.id)
  }
  return [...ids]
}

/** THE ROUTE'S ANSWER, from its reads: each stored version with its time, Changed line, dropped settings and action */
export function historyAnswer(read: {
  linkedSiteId: string | null
  /** the stored versions with what the drawer draws of each */
  listed: readonly { id: string; pinned: boolean; errors: number | null; warnings: number | null; host: string }[]
  rows: readonly AcceptedRow[]
  heavy: ReadonlyMap<string, HeavyRow>
}): HistoryAnswer {
  const { linkedSiteId, rows, heavy } = read
  const byId = new Map(rows.map((r) => [r.id, r]))
  const newest = new Map<string, string | null>()
  const newestOn = (siteId: string) => {
    if (!newest.has(siteId)) newest.set(siteId, newestAccepted(rows.filter((r) => r.site_id === siteId)))
    return newest.get(siteId) ?? null
  }
  const live = linkedSiteId === null ? null : liveOn(linkedSiteId, rows)
  return {
    linkedSiteId,
    liveVersion: live?.version ?? null,
    rows: [...read.listed].sort((x, y) => newestFirst(byId.get(x.id) ?? NONE, byId.get(y.id) ?? NONE)).flatMap((l) => {
      const r = byId.get(l.id)
      if (r === undefined || !isStoredVersion(r)) return []
      const prev = predecessorOf(r, rows)
      const own = heavy.get(r.id)
      const liveHere = liveOn(r.site_id, rows)
      const liveCustom = liveHere === null || liveHere.id === r.id ? null : (heavy.get(liveHere.id)?.preflight?.custom ?? null)
      const ownCustom = own?.preflight === null || own?.preflight === undefined ? undefined : (own.preflight.custom ?? null)
      return [{
        id: r.id, version: r.version, status: r.status, pinned: l.pinned, createdAt: r.created_at, acceptedAt: r.accepted_at ?? r.created_at,
        errors: l.errors, warnings: l.warnings, siteId: r.site_id, host: l.host,
        changed: changedLine(own?.content_manifest ?? null, prev === null ? null : { version: prev.version, manifest: heavy.get(prev.id)?.content_manifest ?? null }),
        // Pre-flight's own rule: only where both versions carry their facts (a deploy kept before Story 7.18b lists none)
        drops: liveCustom === null || ownCustom === undefined ? [] : droppedKeys(liveCustom, ownCustom),
        action: actionOf(r, { linkedSiteId, newest: newestOn(r.site_id) }),
      }]
    }),
  }
}

/** one row as the drawer draws it: compact (D2a `:101-150`) or, for the first three, expanded (S8e `:300-323`) */
export type HistoryRow = {
  id: string
  n: number
  live: boolean
  pinned: boolean
  createdAt: string
  /** Story 7.23a — when Ghost last accepted it: the row's time (DW-400) */
  acceptedAt: string
  gscan: { errors: number; warnings: number } | null
  /** the host when the row's site is not the project's linked one (one list per project, Design Notes) — else null */
  elsewhere: string | null
  /** the row's site's host, for the outcome's words */
  host: string
  changed: string | null
  /** the dropped settings, named as Ghost names them (`ghostName`, Pre-flight's) */
  drops: readonly string[]
  action: PutBack | null
  /** S8e `:313`: the row right after the linked site's Live row draws the coral-outline Roll back — the undo */
  emphasis: boolean
  /** the first three rows are drawn expanded (S8e `:300-323`, D2a `:75-100`) */
  expanded: boolean
}

/** how many rows are drawn expanded (S8e draws three, D2a three) */
export const EXPANDED = 3

/** the answer, as rows: stored versions only (a route that sent anything else is never drawn), newest accepted first */
export function historyRows(answer: HistoryAnswer): HistoryRow[] {
  const rows = answer.rows
    .filter((r) => isStoredVersion({ status: r.status, artifact_path: 'stored' }))
    .map((r) => ({ ...r, created_at: r.createdAt, accepted_at: r.acceptedAt ?? null }))
    .sort(newestFirst)
    .flatMap((r) => {
      const n = versionNumber(r.version)
      if (!Number.isFinite(n)) return []
      return [{
        id: r.id, n, live: r.status === 'live', pinned: r.pinned, createdAt: r.createdAt, acceptedAt: r.acceptedAt ?? r.createdAt,
        gscan: r.errors === null || r.warnings === null ? null : { errors: r.errors, warnings: r.warnings },
        elsewhere: r.siteId === answer.linkedSiteId ? null : r.host,
        host: r.host,
        changed: r.changed ?? null,
        drops: (r.drops ?? []).map(ghostName),
        action: r.action ?? null,
        emphasis: false,
        expanded: false,
      }]
    })
  const live = rows.findIndex((r) => r.live && r.elsewhere === null)
  const next = live < 0 ? undefined : rows[live + 1]
  return rows.map((r, i) => ({ ...r, expanded: i < EXPANDED, emphasis: r === next && r.action === 'rollback' }))
}

/** a pin's outcome, as the route answers it: 200 pinned or unpinned, 409 `cap`, 404 `gone`, anything else `failed` */
export type PinOutcome = 'pinned' | 'unpinned' | 'cap' | 'gone' | 'failed'
export const pinOutcomeOf = (status: number, pinned: boolean): PinOutcome =>
  status === 200 ? (pinned ? 'pinned' : 'unpinned') : status === 409 ? 'cap' : status === 404 ? 'gone' : 'failed'

/** the gscan chip's tone: clean at 0 · 0, warned with any warning, failed with any error (a stored version has none) */
export const chipTone = (g: { errors: number; warnings: number }): 'clean' | 'warned' | 'failed' =>
  g.errors > 0 ? 'failed' : g.warnings > 0 ? 'warned' : 'clean'

/** THE ROW'S TIME, as D2a draws it: "Today · 2:14 PM", "Aug 28 · 9:02 AM", and the year once it is not this one — in the viewer's
 *  own time zone (`timeZone` is the test's) */
export function timeLabel(at: string, now: Date, timeZone?: string): string {
  const when = new Date(at)
  if (Number.isNaN(when.getTime())) return ''
  const zone = timeZone === undefined ? {} : { timeZone }
  // ICU writes a narrow no-break space before AM/PM; the frame's is a plain space
  const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', ...zone }).format(when).replace(/\s/g, ' ')
  const day = (d: Date) => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', ...zone }).format(d)
  if (day(when) === day(now)) return `${HISTORY_WORDS.today} · ${clock}`
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', ...zone })
  const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', ...(year.format(when) === year.format(now) ? {} : { year: 'numeric' }), ...zone }).format(when)
  return `${date} · ${clock}`
}

/**
 * EVERY WORD THE DRAWER SAYS (R-170, one list). Its numbers come from `PLANS`, never typed. The frame's words where it draws them
 * (D2a's header `:53` and footer `:152`, D2b's sentence and Got it `:180-181`, the pin's two titles); the rest extrapolated in
 * the same voice: the busy and said forms (R-98, UX-DR12), the empty state (UX-DR6), a failed read and "on {host}".
 */
export const HISTORY_WORDS = {
  /** the clock's name, and Ship it ▾'s row */
  open: 'History',
  /** S8e `:280`, the clock's tooltip — true since Story 7.23a's Roll back */
  tooltip: 'History — every version, one click back',
  /** S4d `:387`, the ▾ row's caption */
  menuCaption: 'Versions, gscan reports, rollback',
  title: (project: string) => `History — ${project}`,
  close: 'Close history',
  loading: 'Loading history…',
  /** UX-DR6 — the limit line still shows under it */
  empty: 'Nothing shipped yet',
  /** D2a/D2c's footer: both plans' numbers from `PLANS`, and why they are a real bound */
  limit: `Pro keeps the last ${PLANS.pro.history} versions. Free keeps the last ${PLANS.free.history}. Older versions are removed, not hidden — an Inflozo theme can't be rebuilt later, so this is how far back you can go.`,
  readFailed: "Couldn't load your history. Close it and open it again to try once more.",
  /** the Live badge's word (`LiveBadge` takes it) */
  live: 'Live',
  pinnedTag: 'Pinned',
  /** the gscan chip as D2a draws it (`:105`), and the same counts in words for a screen reader (the wizard's own sentence) */
  gscan: (errors: number, warnings: number) => `${errors} · ${warnings}`,
  gscanSaid: DEPLOY_WORDS.checkedMeta,
  today: 'Today',
  on: (host: string) => `on ${host}`,
  /** the pin's name (a toggle: `aria-pressed` says which way it is) and the frame's two titles */
  pin: (n: number) => `Pin ${versionLabel(n)}`,
  pinTitle: 'Pin this version',
  unpinTitle: 'Pinned — unpin',
  /** R-98's present tense, while the request is out */
  pinning: (n: number) => `Pinning ${versionLabel(n)}…`,
  unpinning: (n: number) => `Unpinning ${versionLabel(n)}…`,
  /** D2b `:180`, `:181` */
  refusal: 'One version has to stay unpinned so your next deploy has somewhere to go. Unpin another first.',
  gotIt: 'Got it',
  /** UX-DR12 — each outcome said once, politely */
  said: {
    pinned: (n: number) => `${versionLabel(n)} pinned.`,
    unpinned: (n: number) => `${versionLabel(n)} unpinned.`,
    gone: (n: number) => `${versionLabel(n)} is no longer kept, so it has left the list.`,
    failed: (n: number) => `The pin on ${versionLabel(n)} didn't change. Try again.`,
    /** Story 7.23a — a put-back's two endings */
    live: (n: number, host: string) => `${versionLabel(n)} is live on ${host}.`,
    uploaded: (n: number, host: string) => `${versionLabel(n)} is on ${host} but isn't live yet.`,
  },
  // ── Story 7.23a — the expanded rows, Roll back, Re-activate and the confirm (S8e `:300-345`, D2a `:75-100`, D2d `:194-201`) ──
  /** S8e `:313`, `:321` — each button names its version (and its host, on a row of another site) */
  rollBack: 'Roll back',
  rollBackName: (n: number) => `Roll back to ${versionLabel(n)}`,
  rollingBack: 'Rolling back…',
  /** D2d `:197`, `:198`, `:199` — the line is the wizard's own D2e title (R-170) */
  uploadedChip: 'Uploaded, not live',
  notLive: DEPLOY_WORDS.notLiveTitle,
  reactivate: 'Re-activate',
  reactivateName: (n: number) => DEPLOY_WORDS.reactivate(n),
  activating: DEPLOY_WORDS.activating,
  /** S8e `:338-344` — the body stops at "stays in history." where Ghost will forget a setting (Design Notes), and says only the
   *  switch where nothing is live on the site */
  confirmTitle: (n: number) => `Roll back to ${versionLabel(n)}?`,
  confirmBody: (n: number, live: number | null, drops: boolean) =>
    live === null
      ? `Your live site switches to ${versionLabel(n)} instantly.`
      : `Your live site switches to ${versionLabel(n)} instantly. ${versionLabel(live)} stays in history${drops ? '.' : ' — nothing is lost.'}`,
  cancel: DEPLOY_WORDS.cancel,
  /** the Changed line (`changedLine`) — the frame's shape */
  changed: 'Changed: ',
  addedTemplate: (label: string) => `added ${label} template`,
  removedTemplate: (label: string) => `removed ${label} template`,
  more: (k: number) => `and ${k} more`,
  noChanges: (p: number) => `No changes since ${versionLabel(p)}`,
  firstDeploy: 'First deploy',
  /** the refusals, each said under its row (UX-DR12): Ghost's own check, and the four the server answers 409 */
  ghostRefused: (n: number) => `Ghost's own theme check refused ${versionLabel(n)}, so nothing on your site changed.`,
  refused: {
    elsewhere: (n: number) => `${versionLabel(n)} was made for another site. Switch this project to that site to roll back there.`,
    live: (n: number) => `${versionLabel(n)} is already live.`,
    disconnected: (host: string) => `Reconnect ${host} in Sites to roll back.`,
    busy: (host: string) => `A deploy to ${host} is under way. Try again when it ends.`,
  },
  actFailed: (n: number) => `${versionLabel(n)} didn't go back on your site. Try again.`,
} as const

/** what the polite region says for a pin's outcome (the refusal is D2b's own sentence) */
export const pinSaid = (outcome: PinOutcome, n: number): string =>
  outcome === 'cap' ? HISTORY_WORDS.refusal : HISTORY_WORDS.said[outcome](n)

/** STORY 7.23a — A PUT-BACK'S OUTCOME, as the route answers it (POST `{ deploy, act: 'live' }`): 200 `{ outcome }`, 404 gone, 409
 *  `{ code }` (`elsewhere` · `live` · `disconnected` · `busy`), 422 Ghost's own check with its `detail`, 502 `{ code, message }`
 *  (Ghost's other answers, `deployError`'s words), anything else a request that failed */
export type ActOutcome =
  | { kind: 'live' }
  | { kind: 'uploaded' }
  | { kind: 'gone' }
  | { kind: 'refused'; code: string; message?: string; detail?: string }
  | { kind: 'failed' }

export function actOutcomeOf(status: number, body: unknown): ActOutcome {
  const b = (typeof body === 'object' && body !== null ? body : {}) as { outcome?: unknown; code?: unknown; message?: unknown; detail?: unknown }
  const text = (v: unknown) => (typeof v === 'string' && v !== '' ? v : undefined)
  if (status === 200 && (b.outcome === 'live' || b.outcome === 'uploaded')) return { kind: b.outcome }
  if (status === 404) return { kind: 'gone' }
  const code = text(b.code)
  if (status === 409 && code !== undefined && Object.hasOwn(HISTORY_WORDS.refused, code)) return { kind: 'refused', code }
  if (status === 422 && code === 'ghost_theme_refused') return { kind: 'refused', code, ...(text(b.detail) === undefined ? {} : { detail: text(b.detail) }) }
  if (status === 502 && code !== undefined) return { kind: 'refused', code, ...(text(b.message) === undefined ? {} : { message: text(b.message) }) }
  return { kind: 'failed' }
}

/** WHAT A PUT-BACK'S OUTCOME SAYS (UX-DR12, once): an ending in the drawer's polite region, a refusal under its row */
export function actSaid(outcome: ActOutcome, n: number, host: string): string {
  switch (outcome.kind) {
    case 'live':
    case 'uploaded':
      return HISTORY_WORDS.said[outcome.kind](n, host)
    case 'gone':
      return HISTORY_WORDS.said.gone(n)
    case 'failed':
      return HISTORY_WORDS.actFailed(n)
    case 'refused':
      if (outcome.code === 'ghost_theme_refused') return HISTORY_WORDS.ghostRefused(n)
      if (outcome.code === 'elsewhere' || outcome.code === 'live') return HISTORY_WORDS.refused[outcome.code](n)
      if (outcome.code === 'disconnected' || outcome.code === 'busy') return HISTORY_WORDS.refused[outcome.code](host)
      return outcome.message ?? HISTORY_WORDS.actFailed(n)
  }
}
