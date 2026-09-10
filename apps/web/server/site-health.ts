import { createHash } from 'node:crypto'
import { hostOf, keysPopupPath, HEALTH } from '@/lib/connect-rule'
import { sendEmail } from '@/lib/email'
import { healthEmail } from '@/lib/health-email'
import {
  healthOf,
  reasonSentence,
  siteHealthData,
  writePlan,
  type Health,
  type HealthReason,
  type SiteHealthData,
} from '@/lib/health-rule'
import { supabaseAdmin } from '@/lib/supabase/server'
import { APP } from '@/routing'
import { backfillAdminKeyId, call } from '@/server/ghost-admin'
import { probeSite } from '@/server/site-probe'

/**
 * FR-C5's DAILY HEALTH CHECK, ON THE WIRE — Story 3.7, and there is ONE of it.
 *
 * TWO CALLERS, ONE CODE PATH. AD-33's cron drives every connected site once a day; S11a's ⋯
 * **Re-check connection** drives one, for the customer who has just re-pasted a key and does not
 * want to wait until tomorrow. They differ only in who they act for and what they answer with —
 * the argument `server/site-probe.ts` already makes in its own header for its three callers, one
 * level up: a daily check that is not LITERALLY the check a customer can ask for is a daily check
 * nobody can reproduce when it says something surprising.
 *
 * IT CALLS `probeSite()`; IT DOES NOT RE-IMPLEMENT IT. Everything FR-C5 lists except the routes
 * read is already in that function and already executed against T1 and T3 — re-validating against
 * `GET /admin/config/`, re-detecting the version, re-running the `customThemes` probe (so
 * Preview-only sets and clears itself), and re-reading Portal and the announcement bar. This adds
 * the live `routes.yaml` read, applies `healthOf`, and then decides ONE thing: is this site healthy.
 *
 * THE DECISION IS PURE AND LIVES IN `lib/health-rule.ts`. Nothing in this file branches on what to
 * send; `healthOf`, `transitionOf` and `emailAllowed` answer, `node --test` drives all four
 * transitions and both sides of the cap, and this file does the reaching.
 *
 * A TRANSITION AND ONLY A TRANSITION WRITES A NOTIFICATION OR SENDS A MAIL. An unhealthy site
 * checked again tomorrow moves `last_checked_at` and nothing else; a site that flaps twice inside a
 * week writes two rows and sends ONE message (FR-C5's own sentence, and FR-P2's guarantee that
 * Inflozo does not nudge). Recovery stamps `resolved_at` on the row it opened — AD-25 names
 * `resolved_at` as what makes the prune exemption safe — and LEAVES `last_health_email_at` ALONE:
 * the cap is "regardless of transitions" (FR-C5), and clearing the stamp on recovery was what made
 * it unreachable (review, 2026-09-10; `writePlan`'s header in `lib/health-rule.ts`).
 *
 * THIS IS THE FIRST EMITTER OF `notifications`, SO THE `site_health` PAYLOAD IS DECLARED —
 * `siteHealthData`, beside the reasons in `lib/health-rule.ts` — AND PARSED ON WRITE (AD-25).
 * `link` is the Manage keys popup, which is what "Reconnect needed" is for; `data` is
 * `{ site_id, reason }` and carries no user text, because E13 builds its reader
 * over rows three epics wrote and a reader cannot re-escape what it did not compose. The site's
 * TITLE is user text and rides in `title`/`body`, the two columns a notification centre draws.
 *
 * THE WRITE IS THE SERVER'S. `authenticated` may update only `(title, favicon_url, updated_at)` on
 * `sites` (schema `:1198`) — `health`, `last_checked_at`, `last_health_email_at` and the two
 * `routes_*` columns are all server-asserted by AD-7 — and `notifications` has a select policy and
 * a `read_at`-only update grant and NO insert policy at all (`:907-910`, `:1156-1157`). So this
 * file joins the `supabaseAdmin()` importer list in `server-wiring.test.ts` beside `site-probe.ts`,
 * as well as the chokepoint's.
 *
 * NO MIGRATION AND NO NEW COLUMN. The state is `sites.health`; the record of the transition — what
 * happened, when, and where to go about it — is the `site_health` row AD-25 requires this epic to
 * write anyway, and the card reads its reason and date from there. Two new columns would duplicate
 * a row that has to exist, and would cost an R-99 Schema phase for the privilege.
 *
 * NEVER A CREDENTIAL, AN ADDRESS OR A SITE TITLE IN A LOG LINE (spine, Security floor). Every
 * `console.error` below names a site id and a code.
 */

/** FR-I4's live read. A GET, so no allowlist item — `ADMIN_WRITES` is untouched by this story. */
const ROUTES_PATH = 'settings/routes/yaml/'

/**
 * WHAT THE ROUTES READ RECORDS, AND WHAT IT DELIBERATELY DOES NOT COMPARE. `GET /settings/routes/
 * yaml/` answers 200 with the Admin key alone on both majors — executed on T1 6.58.0 and T3
 * 5.130.6, `MEASUREMENTS.md` §37's trailing block, 2026-09-09 — so the drift re-read needs no
 * Staff token. The bytes are hashed into `routes_live_sha256` and the read is stamped into
 * `routes_verified_at`.
 *
 * **DRIFT IS A COMPARISON AGAINST `routes_last_offered`, AND NOTHING WRITES THAT COLUMN UNTIL
 * EPIC 7.** So today this RECORDS and compares against nothing. Said here rather than shipped as a
 * comparison that silently always passes, which is a check that would go on passing the day it
 * stopped meaning anything.
 *
 * A ROUTES READ THAT FAILS DOES NOT MAKE A SITE UNHEALTHY. Health is about the credential and the
 * version; `routes.yaml` is a file that may legitimately not be readable, and both columns are
 * left exactly where they were — the same rule `probeSite` already applies to itself.
 */
async function readRoutes(siteId: string, route: string): Promise<{ sha256: string } | null> {
  try {
    const answer = await call({ siteId, path: ROUTES_PATH, route })
    if (!answer.ok) {
      console.error('site-health: routes unreadable', { siteId, code: answer.code })
      return null
    }
    // THE BYTES, NOT A PARSE OF THEM. `answer.body` is null for YAML by construction (the
    // chokepoint's `JSON.parse` fails and its catch says so), so `text` is what FR-I4 hashes.
    if (!answer.text) {
      console.error('site-health: routes empty', { siteId, code: 'routes_empty' })
      return null
    }
    return { sha256: createHash('sha256').update(answer.text).digest('hex') }
  } catch (thrown) {
    const e = (thrown ?? {}) as { code?: string; name?: string }
    console.error('site-health: routes threw', { siteId, code: e.code ?? e.name })
    return null
  }
}

type Row = {
  health: Health
  last_health_email_at: string | null
  title: string | null
  url: string
  credentials_present: { admin?: boolean } | null
  site_settings: { public_url?: string } | null
}

/**
 * ONE SITE, CHECKED.
 *
 * @returns `health` is `null` when the check COULD NOT BE MADE — a row that would not read, a site
 * with no Admin key, a Ghost that did not answer, a JWT we mis-signed (§37 says that one is our bug
 * and must never be shown as the user's), a write that would not land. The cron counts those as
 * failures so the run answers 500 and the red line is in Vercel's log (DW-46); **Re-check
 * connection** redirects with `?health=<siteId>` so the one card says the check could not finish.
 * A null is NEVER a badge and never an email: that is what keeps FR-P2's "no nudges" true when
 * somebody's Ghost is briefly offline.
 */
export async function checkSite(args: {
  siteId: string
  userId: string
  route: string
}): Promise<{ health: Health | null; reason: string | null }> {
  const undecided = (code: string) => ({ health: null, reason: code })
  const admin = supabaseAdmin()

  const { data: before, error: readError } = await admin
    .from('sites')
    .select('health, last_health_email_at, title, url, credentials_present, site_settings')
    .eq('id', args.siteId)
    .eq('user_id', args.userId)
    .is('disconnected_at', null)
    .maybeSingle<Row>()
  // FR-C6's KEPT RECORD IS NOT A SITE, so `disconnected_at` filters above rather than being
  // remembered by each caller — and a forged `site_id` reaches no row here for the same reason a
  // stranger's does: the `user_id` clause stands in for the RLS `supabaseAdmin()` bypasses.
  if (readError || !before) {
    console.error('site-health: read failed', {
      siteId: args.siteId,
      code: readError?.code ?? 'site_not_found',
    })
    return undecided(readError?.code ?? 'site_not_found')
  }

  // A PARTIALLY CREDENTIALED SITE IS A FIRST-CLASS STATE (UX-DR7), NOT A FAULT. With no Admin key
  // there is nothing to validate, so the site is not checked, not marked unhealthy, and
  // `last_checked_at` is not touched — it would otherwise claim a check that could not happen. The
  // cron's own query filters these out; this is the floor under it, so the ⋯ row obeys it too.
  if (before.credentials_present?.admin !== true) {
    return undecided('no_admin_key')
  }

  // ── FR-C2's FOUR PROBES, RE-RUN. `probeSite` writes what it always writes and catches its own
  //    failures; for a site connected before Story 3.3 this is its FIRST EVER probe, which is what
  //    makes the cron's first pass a BACKFILL rather than only a refresh (DW-62).
  const probe = await probeSite({ siteId: args.siteId, userId: args.userId, route: args.route })

  // ── DW-78: the Admin key's public id half, filled where it is null, from the key already in the
  //    store. One statement, inside the chokepoint, no-op on every record that has it. Never fatal:
  //    a missing mask is not a wrong one, and it is not what this check is about. It runs WHETHER OR
  //    NOT the probe passed, unlike the routes read below: a refused key still has an id half, and
  //    the customer who opens Manage keys from an amber card is exactly the one who needs the mask
  //    drawn beside "Added" to see which key Ghost refused (review, 2026-09-10).
  try {
    await backfillAdminKeyId({ siteId: args.siteId, userId: args.userId, route: args.route })
  } catch (thrown) {
    const e = (thrown ?? {}) as { code?: string; name?: string }
    console.error('site-health: key-id backfill failed', { siteId: args.siteId, code: e.code ?? e.name })
  }

  // ── FR-I4's live routes read. Only attempted when the credential has just worked: a probe that
  //    Ghost refused would spend a third decryption to learn the same 401 again.
  const routes = probe.ok ? await readRoutes(args.siteId, args.route) : null

  const { health, reason } = healthOf(probe, probe.version)
  if (!health) {
    console.error('site-health: undecided', { siteId: args.siteId, code: reason })
    return undecided(reason ?? 'unknown')
  }

  const now = new Date()
  // ── THE PLAN IS PURE (`lib/health-rule.ts`) and this function only carries it out.
  const { update, transition, mayEmail } = writePlan({ before, health, routes, now })

  // ── THE ROW, AS A COMPARE-AND-SET. `.eq('health', before.health)` and `.is('disconnected_at',
  //    null)`: the cron's pass and a customer's Re-check can run on one site at once, and without
  //    the first clause both read `healthy`, both see `opened`, and two rows and two emails follow;
  //    without the second, a disconnect between the read above and this write is written over
  //    (review, 2026-09-10). A write that matched nothing is the OTHER run's — undecided, and this
  //    caller says so. `.select('id')` is what makes that visible: PostgREST answers an update
  //    that hit nothing with no error and no rows (`writeSite`'s own finding, one file over).
  const { data: written, error: writeError } = await admin
    .from('sites')
    .update(update)
    .eq('id', args.siteId)
    .eq('user_id', args.userId)
    .eq('health', before.health)
    .is('disconnected_at', null)
    .select('id')
  if (writeError || !written?.length) {
    console.error('site-health: write failed', {
      siteId: args.siteId,
      code: writeError?.code ?? 'lost_race',
    })
    return undecided(writeError?.code ?? 'lost_race')
  }

  if (transition === 'opened') {
    await openNotice({ ...args, reason, at: now, row: before })
    // THE EMAIL IS LAST AND IS NEVER FATAL. `lib/email.ts` never throws and never blocks the thing
    // it reports on: the row already says the site is unhealthy, and a send that failed must not
    // undo what it reports on. THE STAMP FOLLOWS THE SEND, and only a send that landed: it exists
    // for the rolling cap alone (an unhealthy site never sends on day two — that is `transitionOf`,
    // not the stamp), so stamping a failed send would hold the cap over the one message FR-P1
    // promises for seven days (review, 2026-09-10).
    if (!mayEmail) console.log('site-health: email capped', { siteId: args.siteId })
    else if (await notify({ siteId: args.siteId, userId: args.userId, reason, at: now, row: before })) {
      const { error } = await admin
        .from('sites')
        .update({ last_health_email_at: now.toISOString() })
        .eq('id', args.siteId)
        .eq('user_id', args.userId)
      if (error) console.error('site-health: email stamp failed', { siteId: args.siteId, code: error.code })
    }
  } else if (transition === 'resolved') {
    await resolveNotice(args.siteId, args.userId, now)
  }

  return { health, reason }
}

/** What the customer calls this site, for the two notification columns and the email's subject. */
const label = (row: Row) => row.title?.trim() || hostOf(row.site_settings?.public_url || row.url)

/**
 * AD-25's `site_health` ROW. ITS PAYLOAD IS `siteHealthData` in `lib/health-rule.ts` — declared
 * beside the reasons because Story 3.7 is the first emitter, PARSED here before the insert, and
 * the same schema the card's reader and `resolveNotice` read by, so the writer and its readers
 * cannot drift apart (review, 2026-09-10: they each spelled the shape for themselves).
 *
 * NEVER FATAL. The row is a record of something that has already happened to `sites.health`; an
 * insert that would not land is a line in the log, not a check that failed.
 */
async function openNotice(args: {
  siteId: string
  userId: string
  reason: string | null
  at: Date
  row: Row
}): Promise<void> {
  const { error } = await supabaseAdmin()
    .from('notifications')
    .insert({
      user_id: args.userId,
      kind: 'site_health',
      title: `${HEALTH.unhealthy} — ${label(args.row)}`,
      // THE SAME SENTENCE THE CARD'S CAPTION SHOWS, out of the one reason table, so E13's reader
      // and the Sites card cannot tell the customer two different things about one outage. A cause
      // the table does not name has no sentence and the row carries none: `body` is nullable and a
      // reader that invents one would be claiming what was never decided.
      body: reasonSentence(args.reason),
      // The Manage keys WINDOW, not the full page: "Reconnect needed" exists to be acted on, and
      // `keysPopupPath` is the one place that address is written (standing rule 7).
      link: keysPopupPath(args.siteId),
      data: siteHealthData.parse({ site_id: args.siteId, reason: args.reason }),
    })
  if (error) console.error('site-health: notice insert failed', { siteId: args.siteId, code: error.code })
}

/**
 * RECOVERY RESOLVES. `resolved_at` on the open row is what AD-25 says makes the prune exemption
 * safe rather than unbounded, and it is what stops E13's reader showing a fixed connection as a
 * live problem. Every open row for this site is stamped, not only the newest: two rows open at once
 * is a state nothing writes today, and closing one and leaving the other would be a bug that hides.
 */
async function resolveNotice(siteId: string, userId: string, at: Date): Promise<void> {
  const { error } = await supabaseAdmin()
    .from('notifications')
    .update({ resolved_at: at.toISOString() })
    .eq('user_id', userId)
    .eq('kind', 'site_health')
    .is('resolved_at', null)
    // `data->>site_id` — `siteHealthData`'s own key, because the site a `site_health` row is about
    // lives in its payload: the table is FR-B7's and has no `site_id` column, and adding one would
    // be the migration this story is specified not to need.
    .eq(`data->>${'site_id' satisfies keyof SiteHealthData}`, siteId)
  if (error) console.error('site-health: notice resolve failed', { siteId, code: error.code })
}

/**
 * FR-P1's THIRD EMAIL, SENT ONCE PER TRANSITION AND CAPPED BY `emailAllowed`. The address comes
 * from GoTrue's admin API because the cron acts for NOBODY — there is no session to read one from —
 * and it is used to build a request header and nothing else: no address reaches a log line (spine,
 * Security floor), which is why the failure path below prints a status and a boolean.
 */
async function notify(args: {
  siteId: string
  userId: string
  reason: string | null
  at: Date
  row: Row
}): Promise<boolean> {
  const { data, error } = await supabaseAdmin().auth.admin.getUserById(args.userId)
  const to = data?.user?.email
  if (error || !to) {
    console.error('site-health: no address', { siteId: args.siteId, code: error?.code ?? 'no_address' })
    return false
  }
  const sent = await sendEmail({
    to,
    ...healthEmail({
      site: label(args.row),
      reason: args.reason as HealthReason | null,
      at: args.at,
      keysUrl: `https://${APP}${keysPopupPath(args.siteId)}`,
    }),
  })
  if (sent.ok) console.log('site-health: email sent', { siteId: args.siteId, id: sent.id })
  else console.error('site-health: email failed', { siteId: args.siteId, status: sent.status })
  return sent.ok
}
