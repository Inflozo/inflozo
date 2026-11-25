import { PLANS } from './plan.ts'
import { DEPLOY_WORDS, versionLabel, versionNumber } from './deploy.ts'

/**
 * STORY 7.22 — ARTIFACT RETENTION'S ONE RULE (FR-J7, AD-29, AD-33). Pure, like `lib/deploy.ts`: no import from `server/`, no
 * clock, no I/O — so the History drawer, the history route, `server/retention.ts`' `pruneProject`, the nightly sweep
 * (`lib/artifact-sweep.ts`) and `node --test` (`retention.test.ts`) read one rule.
 *
 * ONE DEFINITION OF A VERSION. A stored version is a `deploys` row Ghost accepted — status `uploaded` or `live` — whose zip is
 * still stored (`artifact_path` not null). The list, the count, the pin cap and the prune all read `isStoredVersion`, and
 * `pin_version()` (`supabase/migrations/20261125120000_pin_version.sql`) holds the same predicate in SQL.
 *
 * THE RULE, PER PROJECT, ACROSS EVERY SITE. Newest first by `created_at`: every pinned version is kept, plus the newest
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
export type Stored = { id: string; status: string; artifact_path: string | null; pinned: boolean; created_at: string }

/** newest first by `created_at`, the id breaking a tie so two reads order alike */
const newestFirst = <T extends { id: string; created_at: string }>(a: T, b: T): number =>
  Date.parse(b.created_at) - Date.parse(a.created_at) || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0)

/** THE RULE: the stored versions past the cap, oldest last — every one of them unpinned, never the newest */
export function prunable<T extends Stored>(rows: readonly T[], cap: number): T[] {
  const versions = rows.filter(isStoredVersion).sort(newestFirst)
  const pinned = versions.filter((v) => v.pinned).length
  return versions.filter((v) => !v.pinned).slice(Math.max(1, cap - pinned))
}

// ── the History drawer ──────────────────────────────────────────────────────────────────────────────────────────────

/** GET `projects/[id]/history`'s answer: the project's stored versions on every site, newest first, and the project's link */
export type HistoryAnswer = {
  linkedSiteId: string | null
  rows: readonly {
    id: string
    version: string
    status: string
    pinned: boolean
    createdAt: string
    /** the gscan verdict's counts, or null on a row with none */
    errors: number | null
    warnings: number | null
    siteId: string
    /** the row's site's host, for "on {host}" */
    host: string
  }[]
}

/** one compact row as the drawer draws it (D2a `:101-150`) */
export type HistoryRow = {
  id: string
  n: number
  live: boolean
  pinned: boolean
  createdAt: string
  gscan: { errors: number; warnings: number } | null
  /** the host when the row's site is not the project's linked one (one list per project, Design Notes) — else null */
  elsewhere: string | null
}

/** the answer, as rows: stored versions only (a route that sent anything else is never drawn), newest first */
export function historyRows(answer: HistoryAnswer): HistoryRow[] {
  return answer.rows
    .filter((r) => isStoredVersion({ status: r.status, artifact_path: 'stored' }))
    .map((r) => ({ ...r, created_at: r.createdAt }))
    .sort(newestFirst)
    .flatMap((r) => {
      const n = versionNumber(r.version)
      if (!Number.isFinite(n)) return []
      return [{
        id: r.id, n, live: r.status === 'live', pinned: r.pinned, createdAt: r.createdAt,
        gscan: r.errors === null || r.warnings === null ? null : { errors: r.errors, warnings: r.warnings },
        elsewhere: r.siteId === answer.linkedSiteId ? null : r.host,
      }]
    })
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
  /** the clock's name and tooltip, and Ship it ▾'s row — "every version, one click back" is S8e's once Story 7.23's Roll back lands */
  open: 'History',
  /** S4d's row caption, without "rollback" until Story 7.23 builds it */
  menuCaption: 'Versions, gscan reports',
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
  },
} as const

/** what the polite region says for a pin's outcome (the refusal is D2b's own sentence) */
export const pinSaid = (outcome: PinOutcome, n: number): string =>
  outcome === 'cap' ? HISTORY_WORDS.refusal : HISTORY_WORDS.said[outcome](n)
