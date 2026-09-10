/**
 * THE PURGE'S PURE HALF — the batch size, the four prefixes and the loop. No Next
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
 * How many accounts one invocation takes. The function has 300 seconds (Vercel docs,
 * `/docs/functions/configuring-functions/duration`, read 2026-08-24: the default on every plan
 * with Fluid compute, and no `maxDuration` is exported) and a solo-founder product's daily
 * deletions are counted in ones; this is a guard against a pathological day, not a normal one,
 * and the run is reconciliation-based, so the 26th account is simply due tomorrow.
 */
export const BATCH = 25

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
 * `Error` carrying `step` (`projects` · `objects` · `suggestions` · `user`) on refusal.
 */
export interface PurgeDeps {
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
 */
export async function runPurge(
  deps: PurgeDeps,
  due: readonly string[],
  log: Pick<Console, 'log' | 'error'> = console,
): Promise<{ purged: number; failed: number }> {
  let purged = 0
  let failed = 0
  for (const userId of due) {
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
  return { purged, failed }
}
