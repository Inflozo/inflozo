import type { Locked } from '../lib/deploy.ts'
import { STALLED_MS } from './deploy/run.ts'
import { lockSql, type LockClient, type LockNotice } from './ghost-admin/db.ts'

/**
 * STORY 7.25 — THE PER-SITE ADVISORY LOCK (AD-19). Every path that changes what a Ghost serves runs inside `withSiteLock`: Ship it
 * and Re-activate (`run.ts`, through `DeployIo.lock`), History's Roll back, Re-activate and Restore original (`put-back.ts`, through
 * `PutBackIo.lock`), and the site switch (`lib/site-switch.ts`' `switchWith`, through `SwitchIo.lock`). Ghost has no lock of its own:
 * two uploads of one name at once answer `200` and a raw `500 EEXIST` (VERIFY 39, MEASUREMENTS §25f), and theme activation is
 * globally stateful — so two writers to one Ghost SERIALIZE here rather than interleave, and a rate limit is not a mutex.
 *
 * THE KEY IS THE SITE'S ADDRESS, never its id: `sites.url`, `normaliseSiteUrl`'s lowercased origin — 7.24's "one Ghost"
 * (`server/deploy/held-names.ts`). Two Inflozo accounts connected to one Ghost hold two site records with one address, and theme
 * activation is per Ghost, not per account. What one address cannot see is what `heldNamesIn` cannot: one Ghost reached under two
 * addresses. A site record that is gone falls back to its id, and the work answers it as it would unlocked.
 *
 * THE SPAN IS THE DECISIONS' READS, not "uploading and activating only" (AD-20's F-075 sentence): each holder takes the lock BEFORE
 * the reads its decisions rest on — the link (DW-379), the free name (7.24's race), R-264 (a)'s live project — because a read taken
 * before the lock may be stale by the time it is acted on. Ship it holds it over its whole invocation after its first read; the
 * put-back and Restore original over their whole body; the switch over its read, plan and write. Pre-flight, the check before a
 * Roll back and every read take none.
 *
 * HOW IT IS HELD. A transaction-scoped `pg_advisory_xact_lock` — the pooler is in transaction mode, so a session-level lock would not
 * survive — on its OWN connection (`db.ts`' `lockSql()`: `sql()`'s one connection is the one every `call()` decrypts through, so a
 * transaction held there would wait on its own upload). In one transaction, in this order: the three local settings, the lock, the
 * work, the commit; the client ended in `finally`.
 *   - `lock_timeout` = `LOCK_WAIT_MS`: a waiter gives up after it (`55P03`), and `statement_timeout` 5 s past it is the belt
 *     (`57014`). Either is NOT HELD: `run` never runs. Never retried, and never a longer wait.
 *   - `idle_in_transaction_session_timeout` = `STALLED_MS`, the stalled-job rule's own number: a holder whose death the pooler
 *     never noticed still frees the site within it.
 *   - A throw from `run` is rolled back and rethrown unchanged. A transaction that fails AFTER `run` returned — the connection
 *     lost — is logged `site-lock: the lock was lost` and `run`'s value returned: finished work never becomes a failure.
 *
 * WHY 30 s: a typical span is about 13 s — a 3.9 s compile and 8.8 s to upload and activate (MEASUREMENTS §21) — so twice that, and a
 * waiter that waited it out still has 270 s of AD-11's 300 for its own work.
 *
 * THE HYPOTHESES IT RESTS ON (standing rule 1), executed by `tools/probe/record-site-lock.mjs` on a `postgres:17` container and on
 * the production pooler (MEASUREMENTS §92):
 *   - H1: `lock_timeout` bounds an advisory-lock wait, with `55P03`, while a holder of another key takes its lock at once;
 *   - H2: a holder killed mid-hold — its connection dropped — frees the key through the pooler;
 *   - H3: the pooler keeps a transaction left idle (the span, with no statement on this connection) open and commits it;
 *   - H4: `set_config(…, true)` sets the idle ceiling, which ends an abandoned holder.
 * If H3 fails, the hold runs `select 1` every 20 s; if H2 fails, H4 still bounds it.
 */

/** how long a writer waits for a site another writer holds — the one place the number lives */
export const LOCK_WAIT_MS = 30_000

/** `lock_not_available` (`lock_timeout`) and `query_canceled` (`statement_timeout`): the wait ran out */
const NOT_HELD: ReadonlySet<string> = new Set(['55P03', '57014'])
/** `no_active_sql_transaction`: the warning a COMMIT draws on a session that is not the one the lock was taken on */
const NO_TRANSACTION = '25P01'

export type SiteLockIo = {
  /** a fresh connection for this hold, its notices handed back (`lockSql`) */
  connect: (onnotice: (notice: LockNotice) => void) => LockClient
  log: (message: string, fields: Record<string, string>) => void
}
const REAL: SiteLockIo = { connect: lockSql, log: (message, fields) => console.error(message, fields) }

export async function withSiteLock<T>(siteId: string, run: () => Promise<T>, io: SiteLockIo = REAL): Promise<Locked<T>> {
  let lost = false
  const db = io.connect((notice) => {
    if (notice.code === NO_TRANSACTION) lost = true
  })
  try {
    try {
      await db`begin`
      await db`select set_config('lock_timeout', ${`${LOCK_WAIT_MS}ms`}, true), set_config('statement_timeout', ${`${LOCK_WAIT_MS + 5000}ms`}, true), set_config('idle_in_transaction_session_timeout', ${`${STALLED_MS}ms`}, true)`
      await db`select pg_advisory_xact_lock(hashtextextended('site:' || coalesce((select url from public.sites where id = ${siteId}), ${siteId}::text), 0))`
    } catch (e) {
      await db`rollback`.catch(() => {})
      if (NOT_HELD.has(String((e as { code?: unknown } | null)?.code))) return { held: false }
      throw e
    }
    let value: T
    try {
      value = await run()
    } catch (e) {
      await db`rollback`.catch(() => {})
      throw e
    }
    try {
      await db`commit`
    } catch {
      lost = true
    }
    if (lost) io.log('site-lock: the lock was lost', { site: siteId })
    return { held: true, value }
  } finally {
    await db.end({ timeout: 5 }).catch(() => {})
  }
}
