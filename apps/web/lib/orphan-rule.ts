import { deadlineLabel } from '../app/(app)/app/(authed)/account/deletion-rule.ts'
import { HEALTH, hostOf, ORPHAN_SNAPSHOT_DAYS } from './connect-rule.ts'

/**
 * FR-C6's ORPHAN PURGE, PURE — Story 7.20b (Epic 7, AD-33; DW-75, DW-79). When a disconnected site's
 * original theme is warned about, when it is deleted, every word the Sites section and the email say,
 * and the loop the cron drives. No Next import and no Supabase import, so `node --test` reaches every
 * branch (`orphans.test.ts`); `app/api/cron/purge-snapshots/route.ts` builds the deps and answers.
 * The shape `purge-rule.ts` set for Story 2.6 and `health-rule.ts` for 3.7.
 *
 * ONE CLOCK, ONE HOME (DW-79). The deadline is `sites.disconnected_at` + `ORPHAN_SNAPSHOT_DAYS`, computed
 * here and nowhere else — the page, the email and the job all call `orphanDeadline`/`purgeDateOf`. No SQL
 * writes the figure, and `site_snapshots.purge_after` stays FR-A5's 14-day clock alone (DW-43).
 *
 * R-285 (owner, 2026-10-27): ONE EMAIL, `ORPHAN_NOTICE_DAYS` BEFORE THE DEADLINE, and the theme is deleted
 * only once it has gone out — at the later of the deadline and the notice + `ORPHAN_NOTICE_DAYS`, so a
 * notice sent late still gives its full window, and the date it names is the real one. A download never
 * postpones anything ("proceeds whether or not the offer was taken").
 *
 * WHICH NOTICE COUNTS. `site_snapshots.orphan_notice_at` is when the notice was last sent. One older than
 * the site's latest `disconnected_at` belongs to an earlier disconnect and no longer counts, so a reconnect
 * needs no reset and a later disconnect owes a new email — the clock restarts by construction.
 */

/** R-285's window: the one email goes this many days before the deadline, and nothing is deleted sooner after it. */
export const ORPHAN_NOTICE_DAYS = 14

/**
 * THE PATH, WRITTEN ONCE. `vercel.json`'s `crons` entry and this constant are the same string or the job
 * invokes a 404 once a day for ever — `purge.test.ts` reads both and compares them, and
 * `run-verify-snapshot-orphans.py` reads it out of this file rather than carrying a copy.
 */
export const CRON_PATH = '/api/cron/purge-snapshots'

/** How many themes one due query takes. A day's disconnects are counted in ones; a second batch is a pathological day. */
export const BATCH = 25

/**
 * HOW LONG ONE RUN KEEPS TAKING BATCHES. The route exports `maxDuration = 300`; no theme is started after
 * this, which leaves the one in flight (an email's 8-second timeout, or a drain) room to finish and the
 * run time to answer. `purge-rule.ts`'s own figure, for its own reason.
 */
export const BUDGET_MS = 240_000

/** The id the Sites section carries and the email's button lands on — one string for both. */
export const SECTION_ID = 'original-themes'

const DAY_MS = 86_400_000
const time = (at: string | Date) => (at instanceof Date ? at : new Date(at)).getTime()

/** FR-C6's deadline: the disconnect plus `ORPHAN_SNAPSHOT_DAYS` (DW-79's one home). */
export function orphanDeadline(disconnectedAt: string | Date): Date {
  return new Date(time(disconnectedAt) + ORPHAN_SNAPSHOT_DAYS * DAY_MS)
}

/** Whether the stored notice belongs to THIS disconnect. A stale one (older than the latest disconnect) is no notice. */
export function noticeCounts({ disconnectedAt, noticeAt }: { disconnectedAt: string | Date; noticeAt: string | Date | null }): boolean {
  return noticeAt !== null && time(noticeAt) >= time(disconnectedAt)
}

/**
 * THE DATE THE THEME IS DELETED — the later of the deadline and the notice + `ORPHAN_NOTICE_DAYS`.
 * With no notice for this disconnect yet, it is the date the notice WILL name: sent on time (`noticeFrom`),
 * that is the deadline's own day; sent late (a send that failed for days), it is `now` + `ORPHAN_NOTICE_DAYS`.
 * So the Sites row, the email and the job never disagree about the day.
 */
export function purgeDateOf(
  { disconnectedAt, noticeAt }: { disconnectedAt: string | Date; noticeAt: string | Date | null },
  now: Date = new Date(),
): Date {
  const deadline = orphanDeadline(disconnectedAt).getTime()
  const from = noticeCounts({ disconnectedAt, noticeAt }) ? time(noticeAt as string | Date) : now.getTime()
  return new Date(Math.max(deadline, from + ORPHAN_NOTICE_DAYS * DAY_MS))
}

/** The start of `at`'s UTC day — the day `deadlineLabel` names. */
const dayStart = (at: number) => Math.floor(at / DAY_MS) * DAY_MS

/**
 * WHEN THE ONE EMAIL IS OWED: from the START of the UTC day `ORPHAN_NOTICE_DAYS` before the deadline's day.
 * The job runs once a day (04:30 UTC), so a threshold at the deadline's own time of day sent the email the NEXT
 * morning for any disconnect after 04:30 UTC — most of them — and the date it named (notice + n) landed a day past
 * the deadline the Sites row had shown since the disconnect (Review, 2026-11-24). From the day's start, the on-time
 * email goes on R-285's day ("on 16 January … deleted on Jan 30") and names the deadline's own day, so the Sites
 * row's date never moves. The deletion still waits for the exact deadline and the notice's full window.
 */
export function noticeFrom(disconnectedAt: string | Date): Date {
  return new Date(dayStart(orphanDeadline(disconnectedAt).getTime()) - ORPHAN_NOTICE_DAYS * DAY_MS)
}

/**
 * The due query's bound: every disconnect that can owe a notice (or more) at `now` is at or before it —
 * `noticeFrom` reaches back to the start of a day — and `decide` says what each row is owed.
 */
export function dueSince(now: Date): Date {
  return new Date(dayStart(now.getTime()) + DAY_MS - (ORPHAN_SNAPSHOT_DAYS - ORPHAN_NOTICE_DAYS) * DAY_MS)
}

/**
 * R-285's ONE DECISION. `notice` from `noticeFrom` while no notice counts for this disconnect (late or
 * not); `purge` once a counted notice's full window and the deadline have both passed; `wait` otherwise.
 */
export function decide(
  row: { disconnectedAt: string | null; noticeAt: string | null },
  now: Date,
): 'wait' | 'notice' | 'purge' {
  if (row.disconnectedAt === null) return 'wait'
  const at = now.getTime()
  if (!noticeCounts({ disconnectedAt: row.disconnectedAt, noticeAt: row.noticeAt })) {
    return at >= noticeFrom(row.disconnectedAt).getTime() ? 'notice' : 'wait'
  }
  return at >= purgeDateOf({ disconnectedAt: row.disconnectedAt, noticeAt: row.noticeAt }, now).getTime() ? 'purge' : 'wait'
}

/**
 * EVERY WORD, ONE OBJECT (R-170). No digit and no spelled number in it — the days arrive as arguments
 * from the two constants above (standing rule 4, and `orphans.test.ts` sweeps it as `connect-rule.test.ts`
 * sweeps `KEYS`). The thing is called "original theme", the name `/restore` and the deletion email use.
 */
export const ORPHANS = {
  /** The Sites section's h2, drawn uppercase as `/restore`'s "Your original themes" is. */
  heading: 'Original themes from disconnected sites',
  caption: (days: number | string) =>
    `The theme each of these sites had before Inflozo. Inflozo keeps it for ${days} days after you disconnect, ` +
    'then deletes it. Reconnect a site to keep its theme.',
  /** A theme Ghost gave no name — `/restore`'s own fallback. */
  unnamed: 'Original theme',
  row: (site: string, date: string) => `${site} · deleted on ${date}`,
  download: 'Download',
  emailSubject: (site: string, date: string) => `Your original theme from ${site} will be deleted on ${date}`,
  emailPreheader: (date: string) => `Download it from Inflozo before ${date}.`,
  emailHeading: (site: string, date: string) => `Your original theme from ${site} will be deleted on ${date}`,
  emailBody: (site: string, disconnected: string, theme: string, days: number | string, date: string) =>
    `When ${site} was disconnected from Inflozo on ${disconnected}, Inflozo kept the theme it had before Inflozo, ` +
    `${theme}. It keeps it for ${days} days, so on ${date} it will be permanently deleted.`,
  emailKeep: (site: string) =>
    `Want to keep it? Download it from your Sites page, or reconnect ${site} before then and Inflozo keeps it.`,
  emailButton: 'Download it from Sites',
  /** The sentence the other two app emails end on — one home (`HEALTH.emailOnly`). */
  emailOnly: HEALTH.emailOnly,
} as const

/** The theme's name as the row and the email say it. */
export const themeLabel = (name: string | null | undefined) => name?.trim() || ORPHANS.unnamed

/** What the customer calls the site — its title, else its host — on the Sites row and in the email alike (one home, R-170). */
export const siteLabel = (title: string | null | undefined, url: string) => title?.trim() || hostOf(url)

/** One `site_snapshots` row with its site, as the Sites page's originals read answers it (the caller's own session). */
export type OriginalRead = {
  id: string
  theme_name: string | null
  orphan_notice_at: string | null
  sites: { title: string | null; url: string; disconnected_at: string | null } | null
}

/**
 * THE SITES SECTION'S ROWS, from its read: the theme's label, what the customer calls the site (its title, else its host)
 * and the day it goes (`purgeDateOf`, the job's and the email's own clock). A theme whose site is connected is no row, and
 * a read that failed (`null`) is no section — the page logs it and the cards never wait on it.
 */
export function originalRows(read: readonly OriginalRead[] | null, now: Date): { id: string; theme: string; site: string; date: string }[] {
  return (read ?? []).flatMap((row) =>
    row.sites?.disconnected_at
      ? [{
          id: row.id,
          theme: themeLabel(row.theme_name),
          site: siteLabel(row.sites.title, row.sites.url),
          date: deadlineLabel(purgeDateOf({ disconnectedAt: row.sites.disconnected_at, noticeAt: row.orphan_notice_at }, now)),
        }]
      : [],
  )
}

/** One kept original theme whose site is disconnected — what the due query hands the loop. */
export type Orphan = {
  /** `site_snapshots.id` */
  id: string
  userId: string
  siteId: string
  /** `theme_name`, unlabelled */
  theme: string | null
  /** What the customer calls the site: its title, else its host. Never logged. */
  site: string
  disconnectedAt: string
  /** `orphan_notice_at` as read — the compare-and-set's `from`. */
  noticeAt: string | null
  /** `profiles.deleted_at is not null`: FR-A5's purge owns this account and the date in its email stands. */
  deleting: boolean
}

/**
 * WHAT ONE THEME NEEDS OF THE WORLD. The route builds it from `supabaseAdmin()`; each method throws an
 * `Error` carrying `step` on a refusal, except where it says it answers.
 */
export interface OrphanDeps {
  /** The oldest `limit` due themes (disconnected at or before `dueSince(now)`), minus every id this run tried. */
  due(excluding: readonly string[], limit: number): Promise<Orphan[]>
  /** Compare-and-set `orphan_notice_at` from `from` to `to`; `false` when another run moved it first. */
  claim(id: string, from: string | null, to: string): Promise<boolean>
  /** The claim put back: `to` → `back`, only while it still reads `to`. */
  unclaim(id: string, back: string | null, to: string): Promise<void>
  /** The owner's address from GoTrue's admin API, or null when there is none. */
  address(userId: string): Promise<string | null>
  /** The one email, composed and sent. Never throws: `sendEmail`'s envelope. */
  send(args: { to: string; orphan: Orphan; date: Date }): Promise<{ ok: boolean; id?: string | null; status?: number }>
  /** `sites.disconnected_at`, read again just before the drain; null when reconnected (or gone). */
  disconnectedAt(siteId: string): Promise<string | null>
  /** `drainPrefix` over `site-snapshots`; throws with `step: 'objects'`. */
  drain(prefix: string): Promise<number>
  /** The row, by id. */
  remove(id: string): Promise<void>
}

const fail = (step: string, code?: string | number) => Object.assign(new Error(step), { step, code })

/**
 * THE LOOP, in `runPurge`'s shape: batches until the queue is empty or `BUDGET_MS` is spent, each
 * excluding every id already tried, and each theme its own `try` — a failure logs ids, a step and a
 * code (never an address, a title or a theme name), counts, and never stops the rest; the theme is due
 * again tomorrow. A queue that cannot be read ends the run red.
 *
 * A NOTICE IS CLAIMED BEFORE IT IS SENT, so two overlapping runs never send twice, and the claim is put
 * back when the address or the send fails, so tomorrow owes it again.
 * ponytail: a function killed between the claim and the send, or an unclaim that itself fails, leaves a
 * notice recorded that never went out — logged loudly in the second case, invisible in the first. A
 * `notice_id` from Resend stored beside the stamp is the upgrade the day that is observed.
 *
 * A PURGE RE-READS THE SITE FIRST: null (reconnected) or a different disconnect is skipped untouched.
 * Then objects before rows (AD-32): a failed drain leaves the row. ponytail: a reconnect landing in the
 * milliseconds between the re-read and the row delete loses that theme; a lock would be the upgrade.
 */
export async function runOrphans(
  deps: OrphanDeps,
  log: Pick<Console, 'log' | 'error'> = console,
  now: () => number = Date.now,
): Promise<{ noticed: number; purged: number; failed: number }> {
  const started = now()
  const spent = () => now() - started >= BUDGET_MS
  const tried: string[] = []
  let noticed = 0
  let purged = 0
  let failed = 0
  while (!spent()) {
    let batch: Orphan[]
    try {
      batch = await deps.due(tried, BATCH)
    } catch (thrown) {
      const e = (thrown ?? {}) as { code?: string }
      log.error('purge-snapshots: failed', { step: 'due', code: e.code })
      return { noticed, purged, failed: failed + 1 }
    }
    batch = batch.filter((row) => !tried.includes(row.id))
    if (batch.length === 0) break
    for (const row of batch) {
      if (spent()) break
      tried.push(row.id)
      const ids = { snapshotId: row.id, siteId: row.siteId, userId: row.userId }
      if (row.deleting) continue
      const at = new Date(now())
      const action = decide(row, at)
      try {
        if (action === 'notice') {
          const stamp = at.toISOString()
          if (!(await deps.claim(row.id, row.noticeAt, stamp))) {
            log.log('purge-snapshots: notice already claimed', ids)
            continue
          }
          try {
            const to = await deps.address(row.userId)
            if (!to) throw fail('address', 'no_address')
            const sent = await deps.send({ to, orphan: row, date: purgeDateOf({ disconnectedAt: row.disconnectedAt, noticeAt: stamp }, at) })
            if (!sent.ok) throw fail('send', sent.status)
            noticed += 1
            log.log('purge-snapshots: notice sent', { ...ids, id: sent.id ?? null })
          } catch (thrown) {
            await deps.unclaim(row.id, row.noticeAt, stamp).catch((cause: { code?: string }) => {
              log.error('purge-snapshots: unclaim failed — a notice is recorded that never went out', { ...ids, code: cause?.code })
            })
            throw thrown
          }
        } else if (action === 'purge') {
          const current = await deps.disconnectedAt(row.siteId)
          if (current === null || time(current) !== time(row.disconnectedAt)) {
            log.log('purge-snapshots: reconnected, skipped', ids)
            continue
          }
          await deps.drain(`${row.userId}/${row.siteId}/`)
          await deps.remove(row.id)
          purged += 1
          log.log('purge-snapshots: original theme removed', ids)
        }
      } catch (thrown) {
        const e = (thrown ?? {}) as { step?: string; code?: string | number; message?: string }
        log.error('purge-snapshots: failed', { ...ids, step: e.step ?? 'unknown', code: e.code })
        failed += 1
      }
    }
  }
  return { noticed, purged, failed }
}
