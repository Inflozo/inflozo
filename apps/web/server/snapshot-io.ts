import { SNAPSHOT_BUCKET } from '@/app/(app)/app/(authed)/account/deletion-rule'
import { supabaseAdmin } from '@/lib/supabase/server'
import { call } from '@/server/ghost-admin'
import type { SnapshotIo } from '@/server/snapshot'

/**
 * STORY 7.20a — THE CAPTURE'S REAL `io` (`server/snapshot.ts` is handed it, so that file imports neither the service role nor the
 * chokepoint, and its tests run over a fake). `deploy-io.ts`' `snapshot` member and `downloadLiveTheme` hand it in. It is on
 * `server-wiring.test.ts`' two lists:
 *   - THE SERVICE ROLE: `site_snapshots` is select-only for the tenant (its owner policy, no write grant) and the
 *     `site-snapshots` bucket has NO Storage policy at all, by design (AD-32: "a snapshot the client could write defeats FR-J13's
 *     whole purpose"), so only the server writes either. EVERY QUERY CARRIES `user_id`, the clause that stands in for the RLS the
 *     service role bypasses, and the site read `disconnected_at is null` (`ROUTES_IO`'s rule).
 *   - THE CHOKEPOINT: two GETs, `themes/` and `themes/{name}/download/`, with the Staff Access Token when one is stored and the
 *     Admin key otherwise (AD-10) — reads, so `ADMIN_WRITES` stays four (R-22).
 */

const failed = (answer: { error: unknown }, what: string): void => {
  if (!answer.error) return
  const code = (answer.error as { code?: unknown; statusCode?: unknown }).code ?? (answer.error as { statusCode?: unknown }).statusCode
  console.error('snapshot-io: a query failed', { what, code: typeof code === 'string' ? code : undefined })
  throw Object.assign(new Error(`snapshot: ${what} failed`), { code: typeof code === 'string' ? code : 'error' })
}

export const SNAPSHOT_IO: SnapshotIo = {
  async site({ siteId, userId }) {
    const answer = await supabaseAdmin().from('sites').select('credentials_present').eq('id', siteId).eq('user_id', userId).is('disconnected_at', null).maybeSingle()
    if (answer.error || !answer.data) {
      console.error('snapshot-io: site read refused', { code: answer.error?.code ?? 'not_found' })
      return null
    }
    return { staff: (answer.data.credentials_present as { staff?: unknown } | null)?.staff === true }
  },
  call: (args) => call({ siteId: args.siteId, path: args.path, route: args.route, kind: args.kind, ...(args.read === undefined ? {} : { read: args.read }) }),
  async current({ siteId, userId }) {
    const answer = await supabaseAdmin().from('site_snapshots').select('id, storage_path').eq('site_id', siteId).eq('user_id', userId).maybeSingle()
    failed(answer, 'snapshot read')
    return (answer.data as { id: string; storage_path: string } | null) ?? null
  },
  async put(key, bytes) {
    failed(await supabaseAdmin().storage.from(SNAPSHOT_BUCKET).upload(key, bytes, { contentType: 'application/zip', upsert: false }), 'object upload')
  },
  async upsert(row) {
    // on `site_id` (one pre-Inflozo snapshot per site record), naming only the capture's own columns: FR-A5's `purge_after` and
    // `download_offered_at` stay as they are
    const answer = await supabaseAdmin().from('site_snapshots').upsert(row, { onConflict: 'site_id' }).select('id').single()
    failed(answer, 'snapshot upsert')
    return (answer.data as { id: string }).id
  },
  async remove(key) {
    failed(await supabaseAdmin().storage.from(SNAPSHOT_BUCKET).remove([key]), 'object remove')
  },
  now: () => new Date(),
  log: (message, fields) => console.error(message, fields),
}
