import { authorized } from '@/lib/cron-auth'
import { sitesPath } from '@/lib/connect-rule'
import { sendEmail } from '@/lib/email'
import { orphanEmail } from '@/lib/orphan-email'
import { dueSince, runOrphans, SECTION_ID, siteLabel, themeLabel, type Orphan, type OrphanDeps } from '@/lib/orphan-rule'
import { drainPrefix } from '@/lib/storage-drain'
import { supabaseAdmin } from '@/lib/supabase/server'
import { APP } from '@/routing'
import { SNAPSHOT_BUCKET } from '../../../(app)/app/(authed)/account/deletion-rule'

/**
 * FR-C6's SNAPSHOT ORPHAN PURGE, ONCE A DAY — Epic 7, Story 7.20b (AD-33's E7 job, moved from E3 by the
 * owner on 2026-09-09; DW-75). A disconnected site's original theme (Story 7.20a's capture) is announced
 * by one email `ORPHAN_NOTICE_DAYS` before its deadline (R-285) and deleted once that email's full window
 * and the deadline have both passed — whether or not it was downloaded. One of AD-29's five deletion
 * paths, built where AD-33 puts it, scheduled in `apps/web/vercel.json` at an hour of its own.
 *
 * `purge-accounts/route.ts` IS THE PATTERN and every one of its decisions transfers: `force-dynamic`
 * (a cached cron response is skipped and never logged), the `authorized()` door BEFORE any read with an
 * unset `CRON_SECRET` a 401 too, `no-store` on every answer, `maxDuration` stated, and a 500 whenever
 * anything failed, because Vercel neither retries a cron nor alerts on one (DW-46). The loop and every
 * date are `lib/orphan-rule.ts`'s, pure and executed under `node --test`; this route builds the deps.
 *
 * THE DEADLINE IS DERIVED, NEVER READ FROM SQL (DW-79): the due query asks for disconnects at or before
 * `dueSince(now)` and `decide` says what each row is owed. `site_snapshots.purge_after` is FR-A5's.
 *
 * THE SERVICE ROLE, and `server-wiring.test.ts` names this file with its reason: the job acts for NOBODY,
 * `site_snapshots` is select-only to its tenant, the `site-snapshots` bucket has no policy at all
 * (AD-32), and the owner's address is GoTrue's admin API by definition.
 *
 * NEVER AN ADDRESS, A KEY, A SITE TITLE OR A THEME NAME IN A LOG LINE — ids, steps and codes.
 */

/** A cached cron response is skipped and never logged (Vercel docs) — a purge that did not run. */
export const dynamic = 'force-dynamic'

/** The platform's ceiling, stated rather than assumed; `BUDGET_MS` stops taking themes under it. */
export const maxDuration = 300

const NO_STORE = { 'Cache-Control': 'no-store' }

/** What the log line is built from. Never an address, never a key. */
function failure(step: string, error: unknown): Error {
  const e = (error ?? {}) as { code?: string; message?: string; status?: number }
  return Object.assign(new Error(e.message ?? step), { step, code: e.code ?? e.status })
}

type DueRow = {
  id: string
  user_id: string
  site_id: string
  theme_name: string | null
  orphan_notice_at: string | null
  sites: { title: string | null; url: string; disconnected_at: string | null } | null
}

export async function GET(request: Request) {
  // BEFORE ANY READ. An unset CRON_SECRET is a 401 too (`lib/cron-auth.ts`).
  if (!authorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401, headers: NO_STORE })
  }

  const admin = supabaseAdmin()
  const since = dueSince(new Date()).toISOString()
  const link = `https://${APP}${sitesPath()}#${SECTION_ID}`

  const deps: OrphanDeps = {
    // ONE INNER-JOINED READ, OLDEST DISCONNECT FIRST: `sites!inner` with a filter on the embed keeps only
    // the themes whose site was disconnected at or before `since`, and `order('sites(disconnected_at)')`
    // orders the PARENT rows by the to-one embed (postgrest-js 2.115.0's own "Order parent table by a
    // referenced table"). A connected site never matches: its `disconnected_at` is null.
    async due(excluding, limit) {
      const rows = admin
        .from('site_snapshots')
        .select('id, user_id, site_id, theme_name, orphan_notice_at, sites!inner(title, url, disconnected_at)')
      // ponytail: every id this run tried rides the URL, and the due set holds ~ORPHAN_NOTICE_DAYS of noticed
      // themes waiting out their window — a few hundred of those outgrow the gateway's URL limit and `due` fails
      // the run red. Keyset paging on (disconnected_at, id) is the upgrade, the day that many are waiting.
      const untried = excluding.length ? rows.not('id', 'in', `(${excluding.join(',')})`) : rows
      const { data, error } = await untried
        .lte('sites.disconnected_at', since)
        .order('sites(disconnected_at)')
        .limit(limit)
      if (error) throw failure('due', error)
      const due = ((data ?? []) as unknown as DueRow[]).filter((row) => row.sites?.disconnected_at)
      if (!due.length) return []
      // An account waiting to be deleted is FR-A5's: neither notice nor purge, and its email's date stands.
      const { data: profiles, error: profilesError } = await admin
        .from('profiles')
        .select('user_id, deleted_at')
        .in('user_id', [...new Set(due.map((row) => row.user_id))])
      if (profilesError) throw failure('profiles', profilesError)
      const deleting = new Set((profiles ?? []).filter((p) => p.deleted_at !== null).map((p) => p.user_id))
      return due.map(
        (row): Orphan => ({
          id: row.id,
          userId: row.user_id,
          siteId: row.site_id,
          theme: row.theme_name,
          site: siteLabel(row.sites?.title, row.sites?.url ?? ''),
          disconnectedAt: row.sites?.disconnected_at as string,
          noticeAt: row.orphan_notice_at,
          deleting: deleting.has(row.user_id),
        }),
      )
    },
    async claim(id, from, to) {
      const update = admin.from('site_snapshots').update({ orphan_notice_at: to }).eq('id', id)
      const { data, error } = await (from === null ? update.is('orphan_notice_at', null) : update.eq('orphan_notice_at', from)).select('id')
      if (error) throw failure('claim', error)
      return (data ?? []).length === 1
    },
    async unclaim(id, back, to) {
      const { error } = await admin.from('site_snapshots').update({ orphan_notice_at: back }).eq('id', id).eq('orphan_notice_at', to)
      if (error) throw failure('unclaim', error)
    },
    async address(userId) {
      const { data, error } = await admin.auth.admin.getUserById(userId)
      if (error) throw failure('address', error)
      return data?.user?.email ?? null
    },
    async send({ to, orphan, date }) {
      return sendEmail({
        to,
        ...orphanEmail({ site: orphan.site, theme: themeLabel(orphan.theme), date, disconnected: orphan.disconnectedAt, url: link }),
      })
    },
    async disconnectedAt(siteId) {
      const { data, error } = await admin.from('sites').select('disconnected_at').eq('id', siteId).maybeSingle()
      if (error) throw failure('reread', error)
      return data?.disconnected_at ?? null
    },
    drain: (prefix) => drainPrefix(admin.storage.from(SNAPSHOT_BUCKET), prefix),
    async remove(id) {
      const { error } = await admin.from('site_snapshots').delete().eq('id', id)
      if (error) throw failure('row', error)
    },
  }

  const { noticed, purged, failed } = await runOrphans(deps)
  return Response.json({ noticed, purged, failed }, { status: failed ? 500 : 200, headers: NO_STORE })
}
