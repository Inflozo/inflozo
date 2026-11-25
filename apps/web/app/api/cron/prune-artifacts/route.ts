import { runSweep, type Dead, type Held, type Resting, type SweepDeps } from '@/lib/artifact-sweep'
import { authorized } from '@/lib/cron-auth'
import { ARTIFACT_BUCKET } from '@/lib/deploy'
import { supabaseAdmin } from '@/lib/supabase/server'
import { abandon, type AbandonIo, type DeployRow, type JobRow } from '@/server/deploy/run'
import { pruneProject } from '@/server/retention'
import { RETENTION_IO } from '@/server/retention-io'

/**
 * FR-J7's ARTIFACT RETENTION, ONCE A DAY — Epic 7, Story 7.22: AD-33's named E7 job (artifact retention), scheduled in
 * `apps/web/vercel.json` at an hour of its own. Its three passes are `lib/artifact-sweep.ts`' `runSweep`, pure and executed under
 * `node --test`; this route builds the deps:
 *   1. DW-380 — checks resting at `awaiting_ship` on a site their project no longer links, abandoned by `run.ts`' `abandon`
 *      (`start()`'s own: the object, the deploy row, the job `cancelled`);
 *   2. DW-374 — dead zips: non-version rows still naming an object, a day old, no job resting on them — pointer first, then object;
 *   3. every project past the fewest any plan keeps, pruned by the one rule (`server/retention.ts`' `pruneProject`) — the retry of
 *      an upload's prune that failed.
 * One of AD-29's deletion paths; the other two that touch `deploy-artifacts` are `pruneProject` and `run.ts`' `clear()`.
 *
 * `purge-snapshots/route.ts` IS THE PATTERN and its decisions transfer: `force-dynamic` (a cached cron response is skipped and never
 * logged), the `authorized()` door BEFORE any read with an unset `CRON_SECRET` a 401 too, `no-store` on every answer, `maxDuration`
 * stated, and a 500 whenever anything failed, because Vercel neither retries a cron nor alerts on one (DW-46).
 *
 * THE SERVICE ROLE, and `server-wiring.test.ts` names this file with its reason: the job acts for NOBODY across every account,
 * `deploys` and `deploy_jobs` are select-only to their tenant (AD-8), and the `deploy-artifacts` bucket has no Storage policy at all
 * (AD-29). Every write is scoped by the row's own `user_id`, read in the same pass.
 *
 * NEVER A NAME, A HOST, A THEME OR A KEY IN A LOG LINE — ids, steps and codes.
 */

/** A cached cron response is skipped and never logged (Vercel docs) — a sweep that did not run. */
export const dynamic = 'force-dynamic'

/** The platform's ceiling, stated rather than assumed; `BUDGET_MS` stops taking items under it. */
export const maxDuration = 300

const NO_STORE = { 'Cache-Control': 'no-store' }

/** What the log line is built from. Never a name, never a key. */
function failure(step: string, error: unknown): Error {
  const e = (error ?? {}) as { code?: string; message?: string; status?: number; statusCode?: string }
  return Object.assign(new Error(e.message ?? step), { step, code: e.code ?? e.statusCode ?? e.status })
}

type RestingRow = { id: string; user_id: string; project_id: string; site_id: string; deploy_id: string | null; projects: { linked_site_id: string | null } | null }

export async function GET(request: Request) {
  // BEFORE ANY READ. An unset CRON_SECRET is a 401 too (`lib/cron-auth.ts`).
  if (!authorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401, headers: NO_STORE })
  }
  const admin = supabaseAdmin()

  // `abandon`'s world, and no more: the deploy row read and removed, its object removed, the job cancelled — each scoped by the
  // row's own user (`run.ts`' `clear`, which `start()` runs for a new Pre-flight)
  const io: AbandonIo = {
    deploys: {
      async read(id, userId) {
        const { data, error } = await admin.from('deploys').select('id, artifact_path').eq('id', id).eq('user_id', userId).maybeSingle()
        if (error) throw failure('deploy read', error)
        return data as DeployRow | null
      },
      async remove(id, userId) {
        const { error } = await admin.from('deploys').delete().eq('id', id).eq('user_id', userId)
        if (error) throw failure('deploy remove', error)
      },
    },
    artifacts: {
      async remove(path) {
        const { error } = await admin.storage.from(ARTIFACT_BUCKET).remove([path])
        if (error) throw failure('object remove', error)
      },
    },
    jobs: {
      async update(id, userId, patch) {
        const { error } = await admin.from('deploy_jobs').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId)
        if (error) throw failure('job update', error)
      },
    },
    log: (message, fields) => console.error(message, fields),
  }

  const deps: SweepDeps = {
    async resting(limit) {
      const { data, error } = await admin
        .from('deploy_jobs')
        .select('id, user_id, project_id, site_id, deploy_id, projects(linked_site_id)')
        .eq('stage', 'awaiting_ship')
        .order('updated_at')
        .limit(limit)
      if (error) throw failure('resting', error)
      return ((data ?? []) as unknown as RestingRow[]).map((r): Resting => ({
        id: r.id, userId: r.user_id, projectId: r.project_id, siteId: r.site_id, deployId: r.deploy_id,
        linkedSiteId: r.projects?.linked_site_id ?? null,
      }))
    },
    async abandon(job) {
      // the job as `clear` reads it: its id, its owner and the deploy it names
      await abandon(io, { id: job.id, user_id: job.userId, project_id: job.projectId, site_id: job.siteId, deploy_id: job.deployId } as JobRow)
    },
    async dead(before, limit) {
      const [rows, resting] = await Promise.all([
        admin
          .from('deploys')
          .select('id, user_id, artifact_path')
          .not('status', 'in', '(uploaded,live)')
          .not('artifact_path', 'is', null)
          .lt('created_at', before.toISOString())
          .order('created_at')
          .limit(limit),
        // the control: a check resting on the linked site (pass 1 left only those) keeps its zip — it is the next Ship it
        admin.from('deploy_jobs').select('deploy_id').eq('stage', 'awaiting_ship'),
      ])
      if (rows.error) throw failure('dead', rows.error)
      if (resting.error) throw failure('dead resting', resting.error)
      const held = new Set((resting.data ?? []).map((j) => j.deploy_id))
      return ((rows.data ?? []) as { id: string; user_id: string; artifact_path: string }[])
        .filter((r) => !held.has(r.id))
        .map((r): Dead => ({ id: r.id, userId: r.user_id, path: r.artifact_path }))
    },
    async drop(row) {
      // the pointer first, and only while the row still names this object and is still no version — a row that became one, or
      // that another hand cleared, keeps whatever it holds now
      const { data, error } = await admin
        .from('deploys')
        .update({ artifact_path: null, artifact_bytes: null })
        .eq('id', row.id)
        .eq('user_id', row.userId)
        .eq('artifact_path', row.path)
        .not('status', 'in', '(uploaded,live)')
        .select('id')
      if (error) throw failure('clear', error)
      if ((data ?? []).length !== 1) return false
      const removed = await admin.storage.from(ARTIFACT_BUCKET).remove([row.path])
      if (removed.error) throw failure('object remove', removed.error)
      return true
    },
    async held() {
      // ponytail: one row per stored version across every account, read whole — bounded by the caps (ten a project at most once
      // pruned); keyset paging is the upgrade the day that outgrows one read
      const { data, error } = await admin.from('deploys').select('project_id, user_id').in('status', ['uploaded', 'live']).not('artifact_path', 'is', null)
      if (error) throw failure('held', error)
      return ((data ?? []) as { project_id: string; user_id: string }[]).map((r): Held => ({ projectId: r.project_id, userId: r.user_id }))
    },
    async prune(project) {
      const done = await pruneProject(project, RETENTION_IO)
      return { pruned: done.pruned.length, failed: done.failed }
    },
  }

  const totals = await runSweep(deps)
  return Response.json(totals, { status: totals.failed ? 500 : 200, headers: NO_STORE })
}
