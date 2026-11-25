import { FEWEST_KEPT } from './retention.ts'

/**
 * STORY 7.22 — AD-33's ARTIFACT-RETENTION JOB, PURE (FR-J7, AD-29; DW-374, DW-380). The loop the nightly cron
 * (`app/api/cron/prune-artifacts/route.ts`) drives, over deps it builds — no Next import and no Supabase import, so `node --test`
 * reaches every branch (`artifact-sweep.test.ts`). `lib/orphan-rule.ts`' shape.
 *
 * THREE PASSES, IN ORDER, each its own `try` per item — a failure logs ids, a step and a code (never a name, a host or a key),
 * counts, and never stops the rest; the item is due again tomorrow. A pass whose read fails ends that pass red and the next runs.
 *   1. DW-380 — a check RESTING at `awaiting_ship` on a site that is not its project's link any more (or none): nothing can ship
 *      it, so it is abandoned as `start()` abandons one — its object, its deploy row, the job `cancelled` (`run.ts`' `abandon`).
 *   2. DW-374 — a DEAD ZIP: a `deploys` row that is no version (not `uploaded`/`live`) still naming an object, older than
 *      `DEAD_AFTER_MS`, with no job resting on it (a refused Ship it, a failed upload): its pointer cleared first, then its object
 *      removed; the row stays (its verdicts are the record of what happened).
 *   3. FR-J7 — every project holding more stored versions than the fewest any plan keeps is pruned by the ONE rule
 *      (`server/retention.ts`' `pruneProject`): this is the retry of a prune that failed after an upload.
 * THE CONTROLS ARE NEVER TOUCHED: a check resting on the project's linked site, the drift check's live copies (`live/`, which no
 * row names) and `site-snapshots` (another bucket). The sweep touches only objects a `deploys` row names.
 */

/** THE PATH, WRITTEN ONCE — `vercel.json`'s `crons` entry and this are the same string or the job invokes a 404 once a day for
 *  ever (`purge.test.ts` reads both) */
export const CRON_PATH = '/api/cron/prune-artifacts'

/** No item is started after this; the route exports `maxDuration = 300` (`orphan-rule.ts`' figure, for its reason) */
export const BUDGET_MS = 240_000

/** How many rows one pass reads. ponytail: one batch per pass per night — a backlog past it drains over the nights that follow */
export const BATCH = 200

/** A non-version zip younger than this may still be on its way somewhere (a Pre-flight's own artefact while it checks): a day */
export const DEAD_AFTER_MS = 86_400_000

/** pass 1's row: a resting job, and the site its project links now (null for none) */
export type Resting = { id: string; userId: string; projectId: string; siteId: string; deployId: string | null; linkedSiteId: string | null }
/** pass 2's row */
export type Dead = { id: string; userId: string; path: string }
/** pass 3's row: one stored version, by its project */
export type Held = { projectId: string; userId: string }

export interface SweepDeps {
  /** jobs resting at `awaiting_ship` off their project's link (the route pages past the ones on it), with that link as it stands */
  resting(limit: number): Promise<Resting[]>
  /** the job claimed off `awaiting_ship` (only if it is still there), then `run.ts`' `abandon`: the object, the deploy row, the job
   *  `cancelled`; false when a Ship it claimed it first — nothing then is touched */
  abandon(job: Resting): Promise<boolean>
  /** non-version rows naming an object, created before `before`, that no job NOT AT REST names (resting at `awaiting_ship`, or a
   *  Ship it under way, which reads the zip after leaving `awaiting_ship`) */
  dead(before: Date, limit: number): Promise<Dead[]>
  /** the conditional clear (still this object, still no version), then — only when it changed the row — the object's removal;
   *  true when it dropped one */
  drop(row: Dead): Promise<boolean>
  /** one entry per stored version, by project */
  held(): Promise<Held[]>
  /** `pruneProject` over the real io; answers how many of its rows failed, and throws when its plan or versions read did */
  prune(project: Held): Promise<{ pruned: number; failed: number }>
}

export type SweepTotals = { abandoned: number; dropped: number; pruned: number; failed: number }

/** The projects worth pruning: those holding more stored versions than the fewest any plan keeps — a project at or under that can
 *  hold nothing any rule prunes (every plan keeps at least that many) */
export function overTheLeast(held: readonly Held[]): Held[] {
  const counts = new Map<string, { project: Held; n: number }>()
  for (const h of held) {
    const key = `${h.userId}/${h.projectId}`
    const seen = counts.get(key)
    counts.set(key, { project: seen?.project ?? h, n: (seen?.n ?? 0) + 1 })
  }
  return [...counts.values()].filter((c) => c.n > FEWEST_KEPT).map((c) => c.project)
}

const codeOf = (e: unknown): string | number | undefined => {
  const err = (e ?? {}) as { code?: string | number; status?: number }
  return err.code ?? err.status
}

/** THE LOOP: the three passes in order, under `BUDGET_MS`. Any failure counts, and the route answers 500 for any (DW-46: Vercel
 *  neither retries nor alerts a cron, so the red line is the alarm). */
export async function runSweep(
  deps: SweepDeps,
  log: Pick<Console, 'log' | 'error'> = console,
  now: () => number = Date.now,
): Promise<SweepTotals> {
  const started = now()
  const spent = () => now() - started >= BUDGET_MS
  const t: SweepTotals = { abandoned: 0, dropped: 0, pruned: 0, failed: 0 }
  const failed = (step: string, ids: Record<string, string | null>, e: unknown) => {
    t.failed += 1
    log.error('prune-artifacts: failed', { step, ...ids, code: codeOf(e) })
  }

  // 1 · DW-380 — the checks nothing can ship any more
  try {
    for (const job of await deps.resting(BATCH)) {
      if (spent()) break
      // the control: a check resting on the project's linked site is the customer's next Ship it
      if (job.linkedSiteId === job.siteId) continue
      try {
        if (!(await deps.abandon(job))) continue
        t.abandoned += 1
        log.log('prune-artifacts: a stranded check abandoned', { job: job.id, project: job.projectId })
      } catch (e) {
        failed('abandon', { job: job.id, project: job.projectId }, e)
      }
    }
  } catch (e) {
    failed('resting', {}, e)
  }

  // 2 · DW-374 — the zips no version names
  if (!spent()) {
    try {
      for (const row of await deps.dead(new Date(now() - DEAD_AFTER_MS), BATCH)) {
        if (spent()) break
        try {
          if (!(await deps.drop(row))) continue
          t.dropped += 1
          // an irreversible delete leaves its line: ids only
          log.log('prune-artifacts: a dead zip dropped', { deploy: row.id })
        } catch (e) {
          failed('drop', { deploy: row.id }, e)
        }
      }
    } catch (e) {
      failed('dead', {}, e)
    }
  }

  // 3 · FR-J7 — every project past the fewest kept, pruned by the one rule
  if (!spent()) {
    try {
      for (const project of overTheLeast(await deps.held())) {
        if (spent()) break
        try {
          const done = await deps.prune(project)
          t.pruned += done.pruned
          if (done.pruned > 0) log.log('prune-artifacts: versions pruned', { project: project.projectId, pruned: done.pruned })
          // each row's own failure is `pruneProject`'s log line; here it counts, so the run answers red
          t.failed += done.failed
        } catch (e) {
          failed('prune', { project: project.projectId }, e)
        }
      }
    } catch (e) {
      failed('held', {}, e)
    }
  }
  return t
}
