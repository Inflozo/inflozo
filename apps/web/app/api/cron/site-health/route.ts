import { authorized } from '@/lib/cron-auth'
import { BATCH, runHealthChecks, type HealthDeps } from '@/lib/health-rule'
import { supabaseAdmin } from '@/lib/supabase/server'
import { checkSite } from '@/server/site-health'

/**
 * FR-C5's DAILY CHECK, ONCE A DAY — Epic 3, Story 3.7. Every connected site is re-validated
 * against its own Ghost and its owner is told, once, when one needs attention. Nothing has
 * re-validated a stored credential since connect: `sites.health` has read `healthy` on every row
 * since Story 1.2 created the column, and the population most at risk is precisely the population
 * that deployed once and stopped signing in.
 *
 * AD-33's ONE CRON FOR EPIC 3, at the home the spine names, scheduled in `apps/web/vercel.json`
 * beside the purge job's and at a different hour so the two never share a cold start. Vercel
 * invokes it with `GET` on the production deployment URL and `routing.ts`'s `route()` passes any
 * non-`/app` path straight through, so the apex reaches the same handler — which is what
 * `run-verify-site-health.py` calls.
 *
 * `apps/web/app/api/cron/purge-accounts/route.ts` IS THE PATTERN AND EVERY ONE OF ITS DECISIONS
 * TRANSFERS: `force-dynamic` because a cached cron response is skipped and never logged (Vercel
 * docs) — a check that did not run; the `authorized()` compare BEFORE any database read, with an
 * unset `CRON_SECRET` a 401 too; `Cache-Control: no-store` on every answer; each site its own
 * `try`; and a 500 whenever anything failed, because Vercel neither retries a cron nor alerts on
 * one, so the red line in its log is the only alarm that exists until NFR-9's Sentry lands (DW-46).
 * The loop itself is `runHealthChecks()` in `lib/health-rule.ts`, pure over `HealthDeps`, so "each
 * site is its own try" is EXECUTED under `node --test` rather than read off this file; this route
 * only builds the deps and answers.
 *
 * THE FIRST RUN IS A BACKFILL, NOT ONLY A REFRESH (DW-62). The select is ordered
 * `last_checked_at` nulls first — which is the index the schema already draws (`:176`) — so the two
 * sites the owner connected before the probes existed are the first ones checked, and their
 * capability, Portal, announcement and brand are populated for the first time.
 *
 * A SITE WITH NO ADMIN KEY IS SKIPPED, NOT FAILED. `credentials_present->>admin` filters here and
 * `checkSite` refuses again on its own: a partially credentialed site is a first-class state
 * (UX-DR7), and marking one unhealthy would be Inflozo calling its own design an error.
 *
 * NEVER A CREDENTIAL, AN ADDRESS OR A SITE TITLE IN A LOG LINE (spine, Security floor). This route
 * logs counts and codes; `runHealthChecks` logs a site id and a code.
 *
 * ponytail: no lock and no claim column — an overlapping run re-checks a site that has just been
 * checked, which is idempotent; a claim column the day two runs are observed to cost something.
 */

/** A cached cron response is skipped and never logged (Vercel docs) — a check that did not run. */
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

const ROUTE = 'cron/site-health'

export async function GET(request: Request) {
  // BEFORE ANY DATABASE READ. An unset CRON_SECRET is a 401 too (`lib/cron-auth.ts`).
  if (!authorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401, headers: NO_STORE })
  }

  const admin = supabaseAdmin()
  // A DISCONNECTED RECORD IS NEVER SELECTED — FR-C6's kept record is not a site — and the index
  // the schema draws for exactly this query is `sites (last_checked_at) where disconnected_at is
  // null` (`:176`).
  const { data: due, error: dueError } = await admin
    .from('sites')
    .select('id, user_id')
    .is('disconnected_at', null)
    .eq('credentials_present->>admin', 'true')
    .order('last_checked_at', { ascending: true, nullsFirst: true })
    .limit(BATCH)
  if (dueError) {
    console.error('site-health: failed', { step: 'due', code: dueError.code })
    return Response.json({ checked: 0, unhealthy: 0, failed: 1 }, { status: 500, headers: NO_STORE })
  }

  const deps: HealthDeps = {
    check: ({ siteId, userId }) => checkSite({ siteId, userId, route: ROUTE }),
  }

  const counts = await runHealthChecks(
    deps,
    (due ?? []).map((row) => ({ siteId: row.id, userId: row.user_id })),
  )
  return Response.json(counts, { status: counts.failed ? 500 : 200, headers: NO_STORE })
}
