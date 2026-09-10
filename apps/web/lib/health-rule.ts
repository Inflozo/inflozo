import { z } from 'zod'
import { versionVerdict } from './connect-rule.ts'

/**
 * FR-C5's WHOLE DECISION, PURE — Story 3.7. What makes a site unhealthy, what counts as a
 * transition, whether the email may go, and the loop the cron drives. No `fetch`, no Supabase, no
 * environment, so `node --test` reaches the four transitions and both sides of the 7-day cap that
 * no live Ghost can be made to produce; `server/site-health.ts` next door does the reaching. The
 * shape `admin-rule.ts` set for Story 3.1, `connect-rule.ts` for 3.2 and `purge-rule.ts` for 2.6.
 *
 * THREE ANSWERS, NOT TWO, AND THE THIRD IS THE ONE THAT MATTERS. A check answers `healthy`,
 * `unhealthy` or **null — the check could not be made** — and the third is what keeps FR-P2's "no
 * nudges" true. Only five causes make a site unhealthy: Ghost refusing the stored Admin key
 * (`ghost_unknown_key`, `ghost_unauthorized`), Inflozo no longer holding one (`credential_missing`),
 * the site answering from somewhere else (`ghost_redirected`), and the version floor
 * (`ghost_too_old`, DW-63). Everything else — a timeout, a 429, a 5xx, a settings payload that did
 * not parse, a JWT WE mis-signed (`ghost_bad_signature`, which §37 says is our bug and must never
 * be shown as the user's) — leaves `health` exactly where it was, makes the run red so the line is
 * in Vercel's log, and sends nobody an email about their own site being briefly offline.
 *
 * `HEALTH_REASONS` NAMES NO NUMBER AND NO DATE (standing rule 4, and `health-rule.test.ts` asserts
 * it): the version floor's figure is `MIN_GHOST_MAJOR`'s, the cap's is `EMAIL_CAP_DAYS`'s, and the
 * date beside a reason on the card is `deadlineLabel`'s. The wrapper that puts the two together is
 * `HEALTH.reason` in `connect-rule.ts`, where every other word of this story's copy lives.
 */

export type Health = 'healthy' | 'unhealthy'

/** `null` is "the check could not be made" — see the header. */
export type HealthAnswer = { health: Health | null; reason: string | null }

/**
 * THE FIVE CAUSES, AND EACH SAYS WHAT TO DO ABOUT IT. R-100 binds every one of them: Ghost answers
 * the same 401 to a wrong key and to another install's key, so none of these diagnoses WHY the key
 * is refused — `api_keys` carries no install identity to test against.
 */
export const HEALTH_REASONS = {
  ghost_unknown_key:
    'Ghost said no — this Admin API key no longer works. It was regenerated or removed in Ghost Admin.',
  ghost_unauthorized: 'Ghost refused this Admin API key. Paste it again from the Inflozo integration.',
  credential_missing: 'Inflozo has no Admin API key for this site any more. Paste it again to reconnect.',
  ghost_redirected:
    'Your site now answers from a different address. Connect it again at the address it uses.',
  ghost_too_old:
    'This site now runs a version of Ghost that Inflozo cannot work with. Please update Ghost, then re-check.',
} as const

export type HealthReason = keyof typeof HEALTH_REASONS

/**
 * THE SENTENCE FOR A CODE, OR NULL — `Object.hasOwn`, never `in`: a code read back out of a jsonb
 * column could be `toString`, and `'toString' in HEALTH_REASONS` is true (review, 2026-09-10).
 * Every lookup — the card's caption, the email, the notification body — goes through this one.
 */
export function reasonSentence(code: string | null | undefined): string | null {
  return code && Object.hasOwn(HEALTH_REASONS, code) ? HEALTH_REASONS[code as HealthReason] : null
}

/**
 * AD-25: THE `site_health` PAYLOAD, DECLARED ONCE BESIDE THE REASONS AND VALIDATED ON WRITE. Story
 * 3.7 is the first emitter of `notifications`, so this is the contract E13's reader (Story 13.4)
 * imports rather than re-derives: `site_id` names the site — the table is FR-B7's and has no
 * `site_id` column — and `reason` is a code from the table above or null for a cause it does not
 * name. No user text: the card and the email draw the sentence from the code.
 * `openNotice` parses it before the insert; `openHealthNotices` and `resolveNotice` read by it.
 */
export const siteHealthData = z.object({
  site_id: z.uuid(),
  reason: z.string().nullable(),
})
export type SiteHealthData = z.infer<typeof siteHealthData>

const unhealthy = (reason: HealthReason): HealthAnswer => ({ health: 'unhealthy', reason })

/**
 * IS THIS SITE HEALTHY. `probe` is `probeSite`'s own summary — a code, never a value — and
 * `version` is the version it re-detected off `GET /admin/config/`.
 *
 * THE VERSION RULE IS CONNECT'S, CALLED AND NOT RESTATED (DW-63). `versionVerdict` is the one
 * floor; a 200 that reports NO version is not a floor failure and not a credential failure, so it
 * is undecided rather than a badge — the same rule the rest of this function follows.
 */
export function healthOf(
  probe: { ok: boolean; code?: string },
  version: string | null | undefined,
): HealthAnswer {
  if (!probe.ok) {
    const code = probe.code ?? ''
    return reasonSentence(code) ? unhealthy(code as HealthReason) : { health: null, reason: code || null }
  }
  const verdict = versionVerdict(version)
  if (!verdict.ok) {
    return verdict.code === 'ghost_too_old' ? unhealthy('ghost_too_old') : { health: null, reason: verdict.code }
  }
  return { health: 'healthy', reason: null }
}

/**
 * A TRANSITION AND ONLY A TRANSITION. `opened` writes the `site_health` notification row and may
 * send; `resolved` stamps `resolved_at` on the open one and clears the cap. Everything else — the
 * same state twice, or a check that could not be made — is `null`, which is FR-C5's own sentence
 * about a flapping site and the reason an unhealthy site sends nothing on day two.
 */
export function transitionOf({ was, now }: { was: Health; now: Health | null }): 'opened' | 'resolved' | null {
  if (!now || now === was) return null
  return now === 'unhealthy' ? 'opened' : 'resolved'
}

/**
 * FR-C5's CAP, IN DAYS, AND IT IS THE ONLY NUMBER IN THIS FILE. `HEALTH_REASONS` may not name it
 * and the copy in `connect-rule.ts` may not either (standing rule 4).
 */
export const EMAIL_CAP_DAYS = 7

/**
 * ONE EMAIL PER SITE PER ROLLING SEVEN DAYS, AND ONLY ON THE WAY DOWN. THE STAMP SURVIVES
 * RECOVERY: FR-C5's own sentence is "regardless of transitions, at most one health email per site
 * per rolling 7 days", and a recovery that cleared `last_health_email_at` made the cap unreachable
 * — every `opened` follows a `resolved`, so the stamp was always null by the time it was read and
 * a site that flapped inside one week sent two emails (review, 2026-09-10; the spec's frozen
 * "recovery clears" bullet is Question 2 for the owner). A genuine second outage a fortnight later
 * is past the rolling window anyway, which is all the clear was for. Two transitions inside one
 * week therefore write two notification rows and send ONE message — FR-P2's guarantee that
 * Inflozo does not nudge.
 */
export function emailAllowed({
  transition,
  lastEmailAt,
  now,
}: {
  transition: 'opened' | 'resolved' | null
  lastEmailAt: string | Date | null | undefined
  now: Date
}): boolean {
  if (transition !== 'opened') return false
  if (!lastEmailAt) return true
  const sent = lastEmailAt instanceof Date ? lastEmailAt : new Date(lastEmailAt)
  // A stamp that is not a date is no stamp: it must not silence the one email FR-P1 promises.
  if (Number.isNaN(sent.getTime())) return true
  return now.getTime() - sent.getTime() >= EMAIL_CAP_DAYS * 86_400_000
}

/**
 * WHAT ONE DECIDED CHECK WRITES, AND WHAT IT THEN DOES — pure, so the wiring `server/site-health.ts`
 * used to carry inline runs under `node --test`: the review of 2026-09-10 showed that changing
 * `if (transition === 'opened')` to `if (health === 'unhealthy')` — a daily email for every
 * unhealthy site, FR-P2's forbidden nudge — failed nothing.
 *
 * `update` is the `sites` patch: `health`, the stamp, the two routes columns only behind a read
 * that answered. `last_health_email_at` IS NOT IN IT: the stamp is written by the caller after a
 * send that LANDED, because a stamp for an email nobody received would hold the cap over the one
 * message FR-P1 promises for seven days (the same review). It is never cleared — see `emailAllowed`.
 */
export function writePlan(args: {
  before: { health: Health; last_health_email_at: string | null }
  health: Health
  routes: { sha256: string } | null
  now: Date
}): {
  update: Record<string, string>
  transition: 'opened' | 'resolved' | null
  mayEmail: boolean
} {
  const transition = transitionOf({ was: args.before.health, now: args.health })
  const mayEmail = emailAllowed({ transition, lastEmailAt: args.before.last_health_email_at, now: args.now })
  const stamp = args.now.toISOString()
  return {
    update: {
      health: args.health,
      last_checked_at: stamp,
      ...(args.routes ? { routes_live_sha256: args.routes.sha256, routes_verified_at: stamp } : {}),
    },
    transition,
    mayEmail,
  }
}

/**
 * THE OPEN `site_health` ROW PER SITE, joined in memory the way `projectCounts` already is — one
 * read per Sites render for the whole list rather than one per card. Newest first is the caller's
 * order; the first row a site is named in wins, so a site that somehow carries two open rows draws
 * the current one.
 *
 * `data` IS READ THROUGH `siteHealthData`, the one declared shape: `notifications.data` is jsonb
 * and the client may mark a row read, so nothing here trusts it — a row that is not one is skipped.
 */
export function openHealthNotices(
  rows: readonly { data: unknown; created_at: string }[] | null | undefined,
): Map<string, { reason: string | null; at: string }> {
  const found = new Map<string, { reason: string | null; at: string }>()
  for (const row of rows ?? []) {
    const parsed = siteHealthData.safeParse(row?.data)
    if (!parsed.success || found.has(parsed.data.site_id)) continue
    found.set(parsed.data.site_id, { reason: parsed.data.reason, at: row.created_at })
  }
  return found
}

/* ───────── AD-33's CRON, ITS PATH AND ITS LOOP.

   THE PATH IS WRITTEN ONCE. `vercel.json`'s `crons` entry and this constant are the same string or
   the job invokes a 404 once a day for ever, green in every check — so `purge.test.ts` READS both
   and compares them rather than restating either, over every entry the file carries. It lives here
   rather than in the route because a `route.ts` may export only Next's own names, and because
   `run-verify-site-health.py` reads it out of the app instead of carrying its own copy. */
export const CRON_PATH = '/api/cron/site-health'

/**
 * How many sites one invocation checks. Each is two or three round trips to somebody else's Ghost
 * and the function has 300 seconds (Vercel docs, the default on every plan with Fluid compute), so
 * this is a guard against a pathological day rather than a normal one — the run is
 * reconciliation-based and ordered `last_checked_at` nulls first, so the hundred-and-first site is
 * simply first tomorrow.
 * ponytail: one batch, oldest first, no claim column — an overlapping run re-checks a site that
 * has just been checked, which is idempotent; a claim column the day the batch is observed to
 * starve, which is DW-47's own trigger one job over. THE CEILING, NAMED (review, 2026-09-10): an
 * UNDECIDED site never moves `last_checked_at` — a stamp would claim a check that could not be
 * made — so it stays at the head of this ordering, and `BATCH` such sites (every one of them a
 * Ghost that is offline today) would keep every site behind them unchecked. An `attempted_at`
 * column the day that is observed; it is a migration, so it is an R-99 Schema phase.
 */
export const BATCH = 100

/**
 * HOW LONG ONE RUN MAY SPEND CHECKING BEFORE IT STOPS AND SAYS SO. A site is up to three calls at
 * the chokepoint's timeout, so a bad day is BATCH times that — far past the function's limit —
 * and a function the platform kills answers no 500 and no counts, which is exactly the day the red
 * line exists for (DW-46). Under the limit with room for the response; the sites not reached are
 * counted as failed, logged by number, and first tomorrow (oldest-first).
 */
export const BUDGET_MS = 240_000

/** What one site's check needs of the world, and nothing more. The route builds this. */
export interface HealthDeps {
  /** Answers `null` when the check could not be made — never throws for that; throws for a fault. */
  check(site: { siteId: string; userId: string }): Promise<{ health: Health | null; reason: string | null }>
}

/**
 * THE LOOP, AND EACH SITE IS ITS OWN `try` — `runPurge`'s shape, for the reason its own review
 * recorded: "one failure never stops the rest" ran under no executing test until the loop was pure
 * over a deps interface. A site that could not be decided is counted as `failed` too, so the run
 * answers 500 and the red line is in Vercel's log (DW-46 until NFR-9's Sentry).
 *
 * THE LOG LINE CARRIES A SITE ID AND A CODE AND NOTHING ELSE — never an address, never a title,
 * never a credential (spine, Security floor).
 */
export async function runHealthChecks(
  deps: HealthDeps,
  sites: readonly { siteId: string; userId: string }[],
  log: Pick<Console, 'log' | 'error'> = console,
  deadline: number = Date.now() + BUDGET_MS,
): Promise<{ checked: number; unhealthy: number; failed: number }> {
  let checked = 0
  let unhealthy = 0
  let failed = 0
  for (const [index, site] of sites.entries()) {
    // OUT OF TIME IS A RED RUN, NOT A KILLED ONE: the rest are failed by count and the run answers.
    if (Date.now() > deadline) {
      log.error('site-health: out of time', { left: sites.length - index })
      failed += sites.length - index
      break
    }
    try {
      const answer = await deps.check(site)
      if (!answer.health) {
        log.error('site-health: undecided', { siteId: site.siteId, code: answer.reason })
        failed += 1
        continue
      }
      checked += 1
      if (answer.health === 'unhealthy') unhealthy += 1
    } catch (thrown) {
      const e = (thrown ?? {}) as { code?: string; name?: string }
      log.error('site-health: failed', { siteId: site.siteId, code: e.code ?? e.name })
      failed += 1
    }
  }
  return { checked, unhealthy, failed }
}
