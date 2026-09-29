/**
 * THE PURGE'S PURE HALF — the batch size, the budget, the four prefixes and the loop. No Next
 * import and no Supabase import, so `node --test` reaches every branch of it (the route beside
 * this file reaches none of them: it needs a deployment, a bearer and a due account).
 *
 * THE BEARER COMPARE LEFT WITH STORY 3.7. It is `lib/cron-auth.ts`'s now, because AD-33's
 * second scheduled job needs the same fail-closed door and a second copy of it is a second
 * place for the rule to be true — `purge.test.ts` still executes it, from its new home.
 */

/**
 * THE PATH, WRITTEN ONCE. `vercel.json`'s `crons` entry and this constant are the same string or
 * the job invokes a 404 once a day for ever, green in every check — so `purge.test.ts` READS both
 * and compares them rather than restating either.
 */
export const CRON_PATH = '/api/cron/purge-accounts'

/**
 * How many accounts one due query takes. A solo-founder product's daily deletions are counted in
 * ones, so a second batch is a pathological day, not a normal one.
 */
export const BATCH = 25

/**
 * HOW LONG ONE RUN KEEPS TAKING BATCHES (DW-47, Story 5.24b). The route exports `maxDuration = 300`
 * (Vercel docs, `/docs/functions/configuring-functions/duration`, read 2026-08-24: the default on
 * every plan with Fluid compute; `MEASUREMENTS.md` §17 read `functionDefaultTimeout: 300` off a Pro
 * project's own config). No account is started after this, which leaves the account in flight a
 * minute to finish and the run time to answer. A function the platform kills answers no counts at
 * all (`BUDGET_MS` in `lib/health-rule.ts`, the same ceiling one job over).
 */
export const BUDGET_MS = 240_000

/**
 * WHOSE ID NAMES THE TOP FOLDER, per bucket, with the schema line each layout is stated on.
 * Three are the user's and one is the project's, and that difference is the only reason this is
 * two lists rather than one.
 */
const USER_BUCKETS = [
  'assets', //             assets/{userId}/…                    SCHEMA.sql :1549
  'site-snapshots', //     site-snapshots/{userId}/{siteId}/…   SCHEMA.sql :1555
  'suggestion-images', //  suggestion-images/{userId}/…         SCHEMA.sql :1559
] as const
const PROJECT_BUCKET = 'deploy-artifacts' // deploy-artifacts/{projectId}/…  SCHEMA.sql :430

/** All four, so a test can assert the walk covers every bucket the schema gives a layout. */
export const BUCKETS = [...USER_BUCKETS, PROJECT_BUCKET] as const

/**
 * EVERY PREFIX AN ACCOUNT OWNS, and the purge walks these rather than the rows' pointers
 * (`site_snapshots.storage_path`, `assets.path`, `suggestions.image_path`). "Everything of mine
 * is actually gone" is a statement about the BUCKETS; a pointer describes only the objects whose
 * row insert succeeded. The walk is complete by construction — an object whose row never landed
 * goes with the rest — and `snapshotObjectKey()` stays what it is, the download route's.
 *
 * Every prefix ends in `/`: `listV2({ prefix })` is a string prefix, not a path segment, so
 * `{uid}` without the slash would also match a sibling folder whose id merely starts the same.
 */
export function prefixesFor(uid: string, projectIds: readonly string[]): [string, string][] {
  return [
    ...USER_BUCKETS.map((bucket): [string, string] => [bucket, `${uid}/`]),
    ...projectIds.map((id): [string, string] => [PROJECT_BUCKET, `${id}/`]),
  ]
}

/**
 * WHAT ONE ACCOUNT'S PURGE NEEDS OF THE WORLD, and nothing more — so `node --test` drives the
 * loop below with stubs (review, 2026-09-07: the per-account `try`, the `failed` count and "one
 * failure never stops the rest" ran under no executing test; a `break` after a failure would have
 * stayed green everywhere). The route builds this from `supabaseAdmin()`; each method throws an
 * `Error` carrying `step` (`due` · `projects` · `objects` · `suggestions` · `user`) on refusal.
 */
export interface PurgeDeps {
  /** The oldest `limit` accounts past their deadline, minus every id this run already tried. */
  due(excluding: readonly string[], limit: number): Promise<string[]>
  projectIds(userId: string): Promise<string[]>
  drain(bucket: string, prefix: string): Promise<number>
  anonymise(userId: string): Promise<void>
  deleteUser(userId: string): Promise<void>
}

/**
 * THE LOOP, and the order inside it is the whole promise: objects → suggestions → user (AD-32,
 * FR-A5). Each account is its own `try`: a failure logs `{ userId, step, bucket, code, message }`
 * — never an address — and the run continues; the failed account is still due tomorrow. Returns
 * the two counts the route answers with.
 *
 * BATCHES UNTIL THE QUEUE IS EMPTY OR `BUDGET_MS` IS SPENT, EACH EXCLUDING EVERY ID ALREADY TRIED
 * (DW-47, Story 5.24b). It took one batch of the oldest deadlines, and a failed account stays at the
 * head of that queue by construction, so `BATCH` accounts that failed every day would have kept
 * every account behind them from ever being reached. A queue that cannot be read ends the run red.
 *
 * ponytail: the tried ids live for one run, in memory and in the due query's URL. An account that
 * fails slowly still spends the budget, and tomorrow's run meets it first again; and a run that
 * has tried hundreds makes a due URL long enough for the gateway to refuse, which ends the run red
 * with `step: 'due'` — loud, not silent. A `purge_attempts` column, skipped after N tries, is the
 * upgrade for both (a migration, so an R-99 Schema phase) the day a run is seen to starve.
 */
export async function runPurge(
  deps: PurgeDeps,
  log: Pick<Console, 'log' | 'error'> = console,
  now: () => number = Date.now,
): Promise<{ purged: number; failed: number }> {
  const started = now()
  const spent = () => now() - started >= BUDGET_MS
  const tried: string[] = []
  let purged = 0
  let failed = 0
  while (!spent()) {
    let batch: string[]
    try {
      batch = await deps.due(tried, BATCH)
    } catch (thrown) {
      const e = (thrown ?? {}) as { code?: string; message?: string }
      log.error('purge: failed', { step: 'due', code: e.code, message: e.message })
      return { purged, failed: failed + 1 }
    }
    // A due read that hands back an id this run already tried — an exclusion dropped, or an account whose
    // profile outlived its user — would otherwise be met again every batch until the budget was spent
    // (review, 2026-09-29): what is tried once in a run is tried once.
    batch = batch.filter((userId) => !tried.includes(userId))
    if (batch.length === 0) break
    for (const userId of batch) {
      if (spent()) break
      tried.push(userId)
      try {
        const projectIds = await deps.projectIds(userId)
        for (const [bucket, prefix] of prefixesFor(userId, projectIds)) {
          await deps.drain(bucket, prefix).catch((cause: Error) => {
            // The walker knows the prefix; only this loop knows which bucket it belongs to.
            throw Object.assign(cause, { bucket })
          })
        }
        await deps.anonymise(userId)
        await deps.deleteUser(userId)
        purged += 1
        log.log('purge: account removed', { userId })
      } catch (thrown) {
        const e = (thrown ?? {}) as { step?: string; bucket?: string; code?: string; message?: string }
        log.error('purge: failed', {
          userId,
          step: e.step ?? 'unknown',
          bucket: e.bucket,
          code: e.code,
          message: e.message,
        })
        failed += 1
      }
    }
  }
  return { purged, failed }
}
