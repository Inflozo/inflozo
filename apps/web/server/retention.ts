import type { PlanId } from '../lib/plan.ts'
import { historyCap, prunable, type Stored } from '../lib/retention.ts'

/**
 * STORY 7.22 — THE ONE PRUNE (FR-J7, AD-29): a project's stored versions past its plan's cap lose their zip. Two callers and one
 * rule: `ship()` once Ghost accepts an upload (`server/deploy/run.ts`, through `deploy-io.ts`' `prune` member, best effort) and the
 * nightly sweep (`app/api/cron/prune-artifacts`), which retries a prune that failed. `io` is HANDED IN — `snapshot.ts`' pattern —
 * so this file imports neither the service role nor the plan's read, and `retention.test.ts` runs every row over a fake;
 * `server/retention-io.ts` is the real one, on `server-wiring.test.ts`' service-role list.
 *
 * THE CAP IS THE PLAN'S, READ THROUGH `plan.ts` ALONE (AD-28): `readEntitlement(supabaseAdmin(), userId)`, a job's read. A read
 * that FAILED is not Free here: AD-28 degrades a failed read to Free so a page still draws, but a prune is irreversible, and a
 * Pro project pruned to Free's cap on a passing database error loses versions that cannot be rebuilt. So `io.plan` throws on a
 * failed read and nothing is pruned; the sweep tries again the next night.
 *
 * THE POINTER CLEARS FIRST, THEN THE OBJECT GOES (the spec's Design Notes — the opposite of AD-32's objects-before-rows, for the
 * opposite failure). The clear is conditional: `artifact_path` and `artifact_bytes` go null only where the row is still unpinned
 * and still names that object, and only a row the update changed has its object removed. So a pin that lands between the two
 * steps finds the row `gone` (`pin_version` re-checks the pointer) instead of pinning an empty version, and a pin that landed
 * first keeps its row and its zip. THE ROW STAYS: its `content_manifest` (the drift baseline, R-287), `version` (DW-372) and
 * verdicts survive. ponytail: a clear that lands and a removal that fails twice leaks that one object, named by no row — the
 * upgrade is a prefix sweep over `deploy-artifacts/{projectId}/` with `drainPrefix`, skipping `live/` and every named key.
 */

export type RetentionIo = {
  /** the user's plan through `plan.ts`' `readEntitlement`; THROWS when the read failed (never a degraded Free here) */
  plan: (userId: string) => Promise<PlanId>
  /** the project's stored versions on every site (`isStoredVersion`'s rows), owned by `user_id` */
  versions: (a: { projectId: string; userId: string }) => Promise<Stored[]>
  /** the conditional clear: `artifact_path`/`artifact_bytes` null where the row is this user's, unpinned, still a stored version and
   *  still names `path`; true when it changed the row */
  clear: (a: { id: string; userId: string; path: string }) => Promise<boolean>
  /** the object out of `deploy-artifacts`, by its key */
  remove: (path: string) => Promise<void>
  log: (message: string, fields: Record<string, string | number | undefined>) => void
}

export type Pruned = { cap: number; pruned: string[]; failed: number }

/** AD-28's read (`plan.ts`' `readEntitlement`, handed in with its log) WITHOUT its degradation: a read that logged a failure throws
 *  `plan_unread` instead of answering Free — the prune runs on a plan that was read, or not at all */
export async function strictPlan(read: (log: Pick<Console, 'error'>) => Promise<PlanId>, log: Pick<Console, 'error'> = console): Promise<PlanId> {
  let refused = false
  const plan = await read({
    error: (...line: unknown[]) => {
      refused = true
      log.error(...line)
    },
  })
  if (refused) throw Object.assign(new Error('retention: the plan could not be read'), { code: 'plan_unread' })
  return plan
}

/** THE PRUNE: the cap, the stored versions, `prunable`, then each one cleared and only then its object removed. A row's failure
 *  is logged by code and counted, and never stops the rest; a failed plan or versions read throws (nothing is pruned). */
export async function pruneProject(a: { projectId: string; userId: string }, io: RetentionIo): Promise<Pruned> {
  const cap = historyCap(await io.plan(a.userId))
  const pruned: string[] = []
  let failed = 0
  for (const v of prunable(await io.versions(a), cap)) {
    const path = v.artifact_path as string
    try {
      // a pin that landed first, or another prune that got here first, leaves nothing to remove
      if (!(await io.clear({ id: v.id, userId: a.userId, path }))) continue
      await io.remove(path)
      pruned.push(v.id)
    } catch (e) {
      failed += 1
      io.log('retention: a version was not pruned', { project: a.projectId, deploy: v.id, code: (e as { code?: string } | null)?.code })
    }
  }
  return { cap, pruned, failed }
}
