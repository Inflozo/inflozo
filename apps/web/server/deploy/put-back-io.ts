import { ARTIFACT_BUCKET } from '@/lib/deploy'
import { supabaseAdmin } from '@/lib/supabase/server'
import { call } from '@/server/ghost-admin'
import type { PutBackIo, PutBackRow } from './put-back.ts'
import type { DeployRow } from './run.ts'

/**
 * STORY 7.23a — THE PUT-BACK'S REAL `io` (`put-back.ts` is handed it, so that file imports neither the service role nor the
 * chokepoint and `put-back.test.ts` runs every row over a fake). It is `deploy-io.ts`' own members — the row's update, the site's
 * demote, the stored zip's read and `call()` with the Admin key — plus four reads, written here rather than imported from
 * `deploy-io.ts` so the History route's function does not carry the compile (jsdom, the gates) it never runs; `put-back.test.ts`
 * holds the shared members' queries equal to `deploy-io.ts`' own. On `server-wiring.test.ts`' two lists:
 *   - THE SERVICE ROLE: `deploys` and `deploy_jobs` are server-written by grant (AD-8) and the `deploy-artifacts` bucket has no
 *     Storage policy at all (AD-29). EVERY QUERY CARRIES `user_id`, the clause that stands in for the RLS the service role bypasses.
 *   - THE CHOKEPOINT: `theme_upload` and `theme_activate`, both already on `ADMIN_WRITES` (R-22) — the same two writes Ship it sends —
 *     and R-291's check before a Roll back: one READ with the Staff Access Token, `GET themes/{name}/download/` (`liveTheme`,
 *     `deploy-io.ts`' own), so `ADMIN_WRITES` is unchanged. Its live copy goes to `deploy-artifacts` with `deploy-io.ts`' own `put`.
 */

const BUCKET = ARTIFACT_BUCKET
/** `server/snapshot.ts`' `downloadPath`, copied — that module carries the compiler's marker, which this function never needs;
 *  `put-back.test.ts` holds the two equal */
const downloadPath = (name: string): string => `themes/${encodeURIComponent(name)}/download/`

/** A read or write the database refused: thrown, logged by code only, for `twice`'s retry (AD-20) */
function ok<T>(answer: { data: T; error: unknown }, what: string): T {
  if (answer.error) {
    const code = (answer.error as { code?: unknown; name?: unknown }).code ?? (answer.error as { name?: unknown }).name
    console.error('put-back-io: a query failed', { what, code: typeof code === 'string' ? code : undefined })
    throw Object.assign(new Error(`put-back: ${what} failed (${typeof code === 'string' ? code : 'error'})`), { infra: true })
  }
  return answer.data
}

export const PUT_BACK_IO: PutBackIo = {
  async row({ deployId, userId }) {
    return ok(await supabaseAdmin().from('deploys').select('id, project_id, site_id, version, theme_name, status, artifact_path').eq('id', deployId).eq('user_id', userId).maybeSingle(), 'row') as PutBackRow | null
  },
  // `deploy-io.ts`' baseline order: newest by `accepted_at`, `created_at` breaking a tie
  async newest({ projectId, siteId, userId }) {
    const rows = ok(await supabaseAdmin().from('deploys').select('id').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).in('status', ['uploaded', 'live']).order('accepted_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(1), 'newest accepted') as { id: string }[] | null
    return rows?.[0]?.id ?? null
  },
  // R-291: `deploy-io.ts`' baseline, with no row excepted — the drift check before a Roll back compares with this upload
  async baseline({ projectId, siteId, userId }) {
    const rows = ok(await supabaseAdmin().from('deploys').select('version, content_manifest').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).in('status', ['uploaded', 'live']).order('accepted_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(1), 'drift baseline') as { version: string; content_manifest: DeployRow['content_manifest'] }[] | null
    const row = rows?.[0]
    return row === undefined ? null : { version: row.version, content_manifest: row.content_manifest ?? null }
  },
  async linked({ projectId, userId }) {
    const project = ok(await supabaseAdmin().from('projects').select('linked_site_id').eq('id', projectId).eq('user_id', userId).maybeSingle(), 'project link') as { linked_site_id: string | null } | null
    const siteId = project?.linked_site_id ?? null
    if (siteId === null) return null
    const site = ok(await supabaseAdmin().from('sites').select('url, disconnected_at, staff_token_declined_at').eq('id', siteId).eq('user_id', userId).maybeSingle(), 'linked site') as { url: string; disconnected_at: string | null; staff_token_declined_at: string | null } | null
    // R-278's grain is the site: a Not now recorded on it (the deploy GET's `declined`, `lib/deploy.ts`)
    return site === null ? null : { siteId, url: site.url, disconnected: site.disconnected_at !== null, declined: typeof site.staff_token_declined_at === 'string' }
  },
  async moving({ projectId, siteId, userId, since }) {
    const rows = ok(await supabaseAdmin().from('deploy_jobs').select('id').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).in('stage', ['snapshotting', 'uploading', 'activating']).gt('updated_at', since).limit(1), 'moving jobs') as unknown[] | null
    return (rows ?? []).length > 0
  },
  deploys: {
    async update(id, userId, patch) {
      ok(await supabaseAdmin().from('deploys').update(patch).eq('id', id).eq('user_id', userId), 'deploy update')
    },
    async demote({ siteId, userId, except }) {
      ok(await supabaseAdmin().from('deploys').update({ status: 'uploaded' }).eq('site_id', siteId).eq('user_id', userId).eq('status', 'live').neq('id', except), 'deploy demote')
    },
  },
  artifacts: {
    async put(path, bytes, opts) {
      ok(await supabaseAdmin().storage.from(BUCKET).upload(path, bytes, { contentType: 'application/zip', upsert: opts?.replace === true }), 'artifact upload')
    },
    async get(path) {
      const blob = ok(await supabaseAdmin().storage.from(BUCKET).download(path), 'artifact download') as Blob
      return new Uint8Array(await blob.arrayBuffer())
    },
  },
  call: (args) => call({ ...args, kind: 'admin' }),
  liveTheme: ({ siteId, name, route }) => call({ siteId, path: downloadPath(name), route, kind: 'staff', read: 'theme_download' }),
  log: (message, fields) => console.error(message, fields),
}
