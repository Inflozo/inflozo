import { JSDOM } from 'jsdom'
import { CATALOG } from '@inflozo/library'
import { compileTheme } from '@inflozo/theme-compiler'
import { gscanGate, qualityGate } from '@inflozo/theme-compiler/gate'
import { inputsHash } from '@/lib/deploy'
import { supabaseAdmin } from '@/lib/supabase/server'
import { call } from '@/server/ghost-admin'
import { ROUTES_IO } from '@/server/routes-io'
import { offerRoutes } from '@/server/routes-upload'
import { compileInputOf } from './project-input.ts'
import type { DeployIo, DeployRow, JobRow } from './run.ts'
import { zipTheme } from './zip.ts'

/**
 * STORY 7.18a — THE DEPLOY'S REAL `io` (`run.ts` is handed it, so that file imports neither the service role nor the
 * chokepoint and `deploy-run.test.ts` runs every stage over a fake). It is on `server-wiring.test.ts`'s two lists:
 *   - THE SERVICE ROLE: `deploy_jobs`, `deploys`, `project_site_bindings` and the `deploy-artifacts` bucket are server-written
 *     by grant (the tenant may only read them, and set `cancel_requested` alone), and `sites.capability` is server-asserted
 *     (AD-7). EVERY QUERY CARRIES `user_id`, the clause that stands in for the RLS the service role bypasses, and a site
 *     read carries `disconnected_at is null` (`ROUTES_IO`'s rule).
 *   - THE CHOKEPOINT: `call()` with the Admin key for `theme_upload` (a multipart `FormData`, DW-51's transport — the second
 *     multipart write after the routes upload) and `theme_activate`; the routes step is Story 7.17's, with its own io.
 * The gates and JSDOM run here, in the one function AD-11 sizes; `gscan4` and `gscan6` are server externals
 * (`next.config.ts`) and their trees reach the route's trace (`tools/check-traces.mjs`). jsdom is BUNDLED, never an external:
 * Vercel refuses the require-of-ESM jsdom 30 is built on (the owner's test, 2026-10-19; `next.config.ts` says how).
 */

const BUCKET = 'deploy-artifacts'
const JOB_COLUMNS = 'id, project_id, user_id, site_id, stage, cancel_requested, deploy_id, error, stage_timings, updated_at'
const DEPLOY_COLUMNS = 'id, version, theme_name, status, activated, artifact_path, artifact_bytes, gscan, quality, inputs_sha256, activated_at'

/** A write or read the database refused: thrown, marked as infrastructure for `run.ts`'s retry rule. Logged by code only. */
function ok<T>(answer: { data: T; error: unknown }, what: string): T {
  if (answer.error) {
    const code = (answer.error as { code?: unknown; name?: unknown }).code ?? (answer.error as { name?: unknown }).name
    console.error('deploy-io: a query failed', { what, code: typeof code === 'string' ? code : undefined })
    throw Object.assign(new Error(`deploy: ${what} failed (${typeof code === 'string' ? code : 'error'})`), { infra: true })
  }
  return answer.data
}

const stamp = () => new Date().toISOString()

export const DEPLOY_IO: DeployIo = {
  read: (a) => compileInputOf(a, supabaseAdmin()),
  compile: (input) => compileTheme(new JSDOM('<body></body>').window.document, input),
  gscan: (files, major) => gscanGate(files, major),
  quality: (files, input) => qualityGate(files, { pack: input.pack, library: input.library }),
  zip: zipTheme,
  // the release: the build's own version (`next.config.ts`' `INFLOZO_CANVAS_V`, the commit `vercel build` ran on — read
  // there with `||` because the CLI-built deployment carries `VERCEL_GIT_COMMIT_SHA` as an EMPTY string, and `??` would
  // hash every release alike)
  hash: (reads) => inputsHash(reads, process.env.INFLOZO_CANVAS_V || process.env.VERCEL_GIT_COMMIT_SHA || 'dev'),
  jobs: {
    async insert(row) {
      return ok(await supabaseAdmin().from('deploy_jobs').insert({ ...row, stage: 'queued' }).select(JOB_COLUMNS).single(), 'job insert') as JobRow
    },
    async read(id, userId) {
      return ok(await supabaseAdmin().from('deploy_jobs').select(JOB_COLUMNS).eq('id', id).eq('user_id', userId).maybeSingle(), 'job read') as JobRow | null
    },
    async update(id, userId, patch) {
      ok(await supabaseAdmin().from('deploy_jobs').update({ ...patch, updated_at: stamp() }).eq('id', id).eq('user_id', userId), 'job update')
    },
    async claim(id, userId, from, patch) {
      const rows = ok(await supabaseAdmin().from('deploy_jobs').update({ ...patch, updated_at: stamp() }).eq('id', id).eq('user_id', userId).eq('stage', from).select('id'), 'job claim')
      return Array.isArray(rows) && rows.length === 1
    },
    async resting({ projectId, siteId, userId }) {
      return (ok(await supabaseAdmin().from('deploy_jobs').select(JOB_COLUMNS).eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).eq('stage', 'awaiting_ship'), 'resting jobs') ?? []) as JobRow[]
    },
  },
  deploys: {
    async insert(row) {
      return ok(await supabaseAdmin().from('deploys').insert(row).select(DEPLOY_COLUMNS).single(), 'deploy insert') as DeployRow
    },
    async read(id, userId) {
      return ok(await supabaseAdmin().from('deploys').select(DEPLOY_COLUMNS).eq('id', id).eq('user_id', userId).maybeSingle(), 'deploy read') as DeployRow | null
    },
    async update(id, userId, patch) {
      ok(await supabaseAdmin().from('deploys').update(patch).eq('id', id).eq('user_id', userId), 'deploy update')
    },
    async remove(id, userId) {
      ok(await supabaseAdmin().from('deploys').delete().eq('id', id).eq('user_id', userId), 'deploy delete')
    },
    async demote({ siteId, userId, except }) {
      ok(await supabaseAdmin().from('deploys').update({ status: 'uploaded' }).eq('site_id', siteId).eq('user_id', userId).eq('status', 'live').neq('id', except), 'deploy demote')
    },
    async liveProject({ siteId, userId }) {
      const rows = ok(await supabaseAdmin().from('deploys').select('project_id').eq('site_id', siteId).eq('user_id', userId).eq('activated', true).order('activated_at', { ascending: false }).limit(1), 'live project') as { project_id: string }[] | null
      return rows?.[0]?.project_id ?? null
    },
    async previous({ projectId, siteId, userId, except }) {
      let q = supabaseAdmin().from('deploys').select('version').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).eq('activated', true)
      if (except !== undefined) q = q.neq('id', except)
      const rows = ok(await q.order('activated_at', { ascending: false }).limit(1), 'previous deploy') as { version: string }[] | null
      const n = Number(/^(\d+)\.0\.0$/.exec(rows?.[0]?.version ?? '')?.[1])
      return Number.isFinite(n) && n > 0 ? n : null
    },
  },
  artifacts: {
    async put(path, bytes) {
      ok(await supabaseAdmin().storage.from(BUCKET).upload(path, bytes, { contentType: 'application/zip', upsert: true }), 'artifact upload')
    },
    async get(path) {
      const blob = ok(await supabaseAdmin().storage.from(BUCKET).download(path), 'artifact download') as Blob
      return new Uint8Array(await blob.arrayBuffer())
    },
    async remove(path) {
      ok(await supabaseAdmin().storage.from(BUCKET).remove([path]), 'artifact remove')
    },
  },
  async bind({ projectId, siteId, userId, themeName, at }) {
    const made = await supabaseAdmin().from('project_site_bindings').insert({ project_id: projectId, user_id: userId, site_id: siteId, theme_name: themeName, first_upload_at: at })
    if (!made.error) return 'ok'
    if (made.error.code !== '23505') ok(made, 'binding insert')
    // a concurrent first upload of this project claimed it first: the same name is the same claim
    const there = ok(await supabaseAdmin().from('project_site_bindings').select('theme_name').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).maybeSingle(), 'binding read') as { theme_name: string } | null
    return there?.theme_name === themeName ? 'ok' : 'taken'
  },
  async capability({ siteId, userId, refused }) {
    const sites = supabaseAdmin().from('sites')
    if (refused) ok(await sites.update({ capability: 'preview_only', capability_source: 'deploy_error' }).eq('id', siteId).eq('user_id', userId).is('disconnected_at', null), 'capability')
    // FR-C2: a successful deploy clears a mark a refused one set — never a probe's or the owner's own answer
    else ok(await sites.update({ capability: 'full', capability_source: null }).eq('id', siteId).eq('user_id', userId).eq('capability_source', 'deploy_error'), 'capability')
  },
  call: (args) => call({ ...args, kind: 'admin' }),
  offerRoutes: (a) => offerRoutes(a, ROUTES_IO),
  async routesFile({ siteId, userId }) {
    const row = ok(await supabaseAdmin().from('sites').select('routes_last_offered').eq('id', siteId).eq('user_id', userId).maybeSingle(), 'routes file') as { routes_last_offered: string | null } | null
    return row?.routes_last_offered ?? null
  },
  english: (key) => (Object.hasOwn(CATALOG.keys, key) ? CATALOG.keys[key]?.en : undefined),
  now: () => new Date(),
  log: (message, fields) => console.error(message, fields),
}
