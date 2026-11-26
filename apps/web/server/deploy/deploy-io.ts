import { JSDOM } from 'jsdom'
import { CATALOG } from '@inflozo/library'
import { compileTheme } from '@inflozo/theme-compiler'
import { gscanGate, qualityGate } from '@inflozo/theme-compiler/gate'
import { ARTIFACT_BUCKET, inputsHash } from '@/lib/deploy'
import { supabaseAdmin } from '@/lib/supabase/server'
import { call } from '@/server/ghost-admin'
import { ROUTES_IO } from '@/server/routes-io'
import { offerRoutes } from '@/server/routes-upload'
import { pruneProject } from '@/server/retention'
import { RETENTION_IO } from '@/server/retention-io'
import { captureSnapshot, downloadPath } from '@/server/snapshot'
import { SNAPSHOT_IO } from '@/server/snapshot-io'
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
 *     multipart write after the routes upload) and `theme_activate`; the routes step is Story 7.17's, with its own io. Story
 *     7.21 adds one READ with the Staff Access Token: the drift check's `GET themes/{bound}/download/` (`liveTheme`).
 * The gates and JSDOM run here, in the one function AD-11 sizes; `gscan4` and `gscan6` are server externals
 * (`next.config.ts`) and their trees reach the route's trace (`tools/check-traces.mjs`). jsdom is BUNDLED, never an external:
 * Vercel refuses the require-of-ESM jsdom 30 is built on (the owner's test, 2026-10-19; `next.config.ts` says how).
 */

const BUCKET = ARTIFACT_BUCKET
const JOB_COLUMNS = 'id, project_id, user_id, site_id, stage, cancel_requested, deploy_id, error, stage_timings, updated_at'
const DEPLOY_COLUMNS = 'id, version, theme_name, status, activated, artifact_path, artifact_bytes, gscan, quality, inputs_sha256, activated_at, accepted_at, preflight'

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
    // Story 7.23b: with no `except`, every live row on the site — Restore original's, after which no Inflozo theme is live there
    async demote({ siteId, userId, except }) {
      const live = supabaseAdmin().from('deploys').update({ status: 'uploaded' }).eq('site_id', siteId).eq('user_id', userId).eq('status', 'live')
      ok(await (except === undefined ? live : live.neq('id', except)), 'deploy demote')
    },
    // R-264 (a) reads the record truthfully: the site's latest activated deploy that is STILL `live` — Story 7.23b's Restore original
    // demotes every live row on the site, after which no project's theme is live there and Deploy only is offered again
    async liveProject({ siteId, userId }) {
      const rows = ok(await supabaseAdmin().from('deploys').select('project_id').eq('site_id', siteId).eq('user_id', userId).eq('activated', true).eq('status', 'live').order('activated_at', { ascending: false }).limit(1), 'live project') as { project_id: string }[] | null
      return rows?.[0]?.project_id ?? null
    },
    async previousCustom({ projectId, siteId, userId, except }) {
      let q = supabaseAdmin().from('deploys').select('preflight').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).eq('activated', true)
      if (except !== undefined) q = q.neq('id', except)
      const rows = ok(await q.order('activated_at', { ascending: false }).limit(1), 'previous custom') as { preflight: { custom?: unknown } | null }[] | null
      const custom = rows?.[0]?.preflight?.custom
      return typeof custom === 'object' && custom !== null && !Array.isArray(custom) ? (custom as Record<string, unknown>) : null
    },
    // Story 7.21 — R-287's drift baseline: the newest upload Ghost accepted (`uploaded` or `live`), never the job's own. Story 7.23a
    // (DW-400): newest by `accepted_at` — a Roll back's upload of an older version is the newest accepted — as `lib/retention.ts`'
    // `newestFirst` orders, `created_at` breaking a tie. ponytail: a row with no `accepted_at` sorts last here (`nulls last`) and
    // by its `created_at` in `lib/retention.ts`. Code older than the column writes one — and it ran AFTER the column existed too:
    // production served the Schema push (the pre-7.23a `run.ts`, which writes `uploaded`/`live` with no `accepted_at`) between
    // the Schema's apply and the Dev deploy (R-99's window). The migration's backfill (`coalesce(activated_at, created_at)`,
    // re-runnable) is what closes those rows, and the Review counts them after the deploy
    async baseline({ projectId, siteId, userId, except }) {
      const rows = ok(await supabaseAdmin().from('deploys').select('version, content_manifest').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).in('status', ['uploaded', 'live']).neq('id', except).order('accepted_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(1), 'drift baseline') as { version: string; content_manifest: DeployRow['content_manifest'] }[] | null
      const row = rows?.[0]
      return row === undefined ? null : { version: row.version, content_manifest: row.content_manifest ?? null }
    },
    // Story 7.23b's review: only while this project's latest activated deploy on the site is still `live` — a Restore original (or
    // another project's ship to the site) demotes it, and the site then serves another theme, never "still serving v2". The latest
    // activated row is always the live one while any is: every activation stamps `activated_at`, and a demote stamps nothing
    async previous({ projectId, siteId, userId, except }) {
      const rows = ok(await supabaseAdmin().from('deploys').select('id, version, status').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).eq('activated', true).order('activated_at', { ascending: false }).limit(2), 'previous deploy') as { id: string; version: string; status: string }[] | null
      if (rows?.[0]?.status !== 'live') return null
      const n = Number(/^(\d+)\.0\.0$/.exec(rows.find((r) => r.id !== except)?.version ?? '')?.[1])
      return Number.isFinite(n) && n > 0 ? n : null
    },
  },
  artifacts: {
    // STORY 7.22 — IMMUTABLE (NFR-4): `upsert: false`, so a put over an existing key is refused (409 "The resource already exists",
    // executed on production's bucket at 7.22's Dev with a new key as the control). `replace` is Story 7.21's live copy alone
    // (`{projectId}/live/{siteId}.zip`), the one fixed key each found drift overwrites. ponytail: a put that landed but whose answer
    // was lost meets its own object on AD-20's retry and fails the job as ours — the upgrade reads the key back on a 409
    async put(path, bytes, opts) {
      ok(await supabaseAdmin().storage.from(BUCKET).upload(path, bytes, { contentType: 'application/zip', upsert: opts?.replace === true }), 'artifact upload')
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
  // DW-374: the project's link NOW and the job's own site's address — owned by `user_id`, a disconnected site included (its
  // address is still the one the sentence names)
  async link({ projectId, siteId, userId }) {
    const [project, was] = await Promise.all([
      supabaseAdmin().from('projects').select('linked_site_id').eq('id', projectId).eq('user_id', userId).maybeSingle(),
      supabaseAdmin().from('sites').select('url').eq('id', siteId).eq('user_id', userId).maybeSingle(),
    ])
    const linked = (ok(project, 'project link') as { linked_site_id: string | null } | null)?.linked_site_id ?? null
    const wasUrl = (ok(was, 'job site') as { url: string } | null)?.url ?? null
    if (linked === null) return { now: null, was: wasUrl }
    if (linked === siteId) return { now: { id: linked, url: wasUrl ?? '' }, was: wasUrl }
    const now = ok(await supabaseAdmin().from('sites').select('id, url').eq('id', linked).eq('user_id', userId).maybeSingle(), 'linked site') as { id: string; url: string } | null
    return { now: now ?? { id: linked, url: '' }, was: wasUrl }
  },
  // Story 7.20a — FR-J13's first upload, per site record: any binding for the site among the user's projects
  async siteBound({ siteId, userId }) {
    const rows = ok(await supabaseAdmin().from('project_site_bindings').select('project_id').eq('site_id', siteId).eq('user_id', userId).limit(1), 'site bindings') as unknown[] | null
    return (rows ?? []).length > 0
  },
  // Story 7.22 — the one prune, with its own real io (`retention-io.ts`, on `server-wiring.test.ts`' service-role list): the plan read
  // through `plan.ts` (a failed read prunes nothing), then the conditional clears and only then the objects
  prune: (a) => pruneProject(a, RETENTION_IO),
  // Story 7.20a — the one capture, with its own real io (the staff token's reads and the `site-snapshots` writes are
  // `snapshot-io.ts`', on `server-wiring.test.ts`' two lists), so `run.ts` stays off the chokepoint
  snapshot: (a) => captureSnapshot(a, SNAPSHOT_IO),
  call: (args) => call({ ...args, kind: 'admin' }),
  // Story 7.21 — the drift check's read: the capture's download, under the bound name, with the Staff Access Token and the
  // download's own read budget — a read, so `ADMIN_WRITES` is unchanged (R-22)
  liveTheme: ({ siteId, name, route }) => call({ siteId, path: downloadPath(name), route, kind: 'staff', read: 'theme_download' }),
  offerRoutes: (a) => offerRoutes(a, ROUTES_IO),
  async routesFile({ siteId, userId }) {
    const row = ok(await supabaseAdmin().from('sites').select('routes_last_offered').eq('id', siteId).eq('user_id', userId).maybeSingle(), 'routes file') as { routes_last_offered: string | null } | null
    return row?.routes_last_offered ?? null
  },
  english: (key) => (Object.hasOwn(CATALOG.keys, key) ? CATALOG.keys[key]?.en : undefined),
  now: () => new Date(),
  log: (message, fields) => console.error(message, fields),
}
