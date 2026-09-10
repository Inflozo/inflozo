import { authorized } from '@/lib/cron-auth'
import { supabaseAdmin } from '@/lib/supabase/server'
import { drainPrefix } from '@/lib/storage-drain'
import { BATCH, runPurge, type PurgeDeps } from './purge-rule'

/**
 * FR-A5's LAST SENTENCE, once a day (Epic 2, Story 2.6): the account whose fourteen days ran out
 * is removed for good. Story 2.5 opened the window and holds the door; nothing closed it, and an
 * account pending for ever is exactly the indefinite retention FR-A5 forbids.
 *
 * AD-33's ONE CRON FOR EPIC 2, at the home the spine names (`:354-359`), scheduled in
 * `apps/web/vercel.json` beside it. Vercel invokes it with `GET` on the production deployment URL
 * and `routing.ts`'s `route()` passes any non-`/app` path straight through, so the apex reaches
 * the same handler — which is what `run-verify-account-purge.py` calls.
 *
 * OBJECTS BEFORE ROWS, BY PREFIX, IN ALL FOUR BUCKETS (AD-32). A row deleted first orphans its
 * object in a bucket with no policy, where nothing can ever find it again. The walk is driven by
 * the PREFIX and not by the rows' pointers, so an object whose row insert never landed goes too.
 *
 * SUGGESTIONS ARE ANONYMISED, NEVER DELETED (FR-A5). The cascade would null `user_id` on its own
 * — `on delete set null`, schema `:629` — but nothing would stamp `anonymized_at` or drop the
 * image, and the image is the reason the order matters: it is taken down with the account's other
 * objects, one step earlier.
 *
 * THEN GOTRUE, NOT SQL. `DELETE /admin/users/{id}` is the one documented way to remove a user,
 * the client is already in the app, and the Postgres cascade off `auth.users` fires under any
 * deleter — every `references auth.users(id) on delete cascade` in the schema empties itself
 * (executed on the live project by the harness's `rows-gone` step, 2026-09-07). A `security
 * definer` function would be a migration for a job the service role already can do.
 *
 * THE THIRD PRIVILEGED READER, and `server-wiring.test.ts` names it: this route acts for NOBODY,
 * so no session could make its reads, and `deleteUser` is an admin-API call by definition.
 *
 * 500 WHENEVER ANYTHING FAILED. Vercel neither retries a cron nor alerts on one, so the red line
 * in its log is the only alarm that exists until NFR-9's Sentry lands (DW-46); a 200 that hides a
 * failed account is a purge that quietly became retention. The loop itself is `runPurge()` in
 * `purge-rule.ts`, pure over `PurgeDeps`, so "each account is its own try" is EXECUTED under
 * `node --test` rather than read off this file; this route only builds the deps and answers.
 *
 * ponytail: no lock and no claim column — an overlapping run meets empty listings, an idempotent
 * update and a 404; a claim column the day two runs are observed to cost something (DW-47 names
 * the day BATCH permanently failing accounts would starve the rest).
 */

/** A cached cron response is skipped and never logged (Vercel docs) — a purge that did not run. */
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

/** What the log line is built from. Never an address, never a key. */
function failure(step: string, error: unknown): Error {
  const e = (error ?? {}) as { code?: string; message?: string; status?: number }
  return Object.assign(new Error(e.message ?? step), { step, code: e.code ?? e.status })
}

export async function GET(request: Request) {
  // BEFORE ANY DATABASE READ. An unset CRON_SECRET is a 401 too (`lib/cron-auth.ts`, which
  // Story 3.7 lifted this compare into so both scheduled jobs share one door).
  if (!authorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401, headers: NO_STORE })
  }

  const admin = supabaseAdmin()
  // The index the schema draws for exactly this query: `profiles (purge_after) where deleted_at
  // is not null` (`:125`). A restored account has both columns null (`restore_account()`, Story
  // 2.5) and is invisible here by construction, never by a check.
  const { data: due, error: dueError } = await admin
    .from('profiles')
    .select('user_id')
    .not('deleted_at', 'is', null)
    .lte('purge_after', new Date().toISOString())
    .order('purge_after')
    .limit(BATCH)
  if (dueError) {
    console.error('purge: failed', { step: 'due', code: dueError.code, message: dueError.message })
    return Response.json({ purged: 0, failed: 1 }, { status: 500, headers: NO_STORE })
  }

  const deps: PurgeDeps = {
    async projectIds(userId) {
      const { data, error } = await admin.from('projects').select('id').eq('user_id', userId)
      if (error) throw failure('projects', error)
      return (data ?? []).map((p) => p.id)
    },
    drain: (bucket, prefix) => drainPrefix(admin.storage.from(bucket), prefix),
    async anonymise(userId) {
      const { error } = await admin
        .from('suggestions')
        .update({
          user_id: null,
          anonymized_at: new Date().toISOString(),
          image_path: null,
          image_approved: false,
        })
        .eq('user_id', userId)
      if (error) throw failure('suggestions', error)
    },
    async deleteUser(userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      if (error) throw failure('user', error)
    },
  }

  const { purged, failed } = await runPurge(deps, (due ?? []).map((row) => row.user_id))
  return Response.json({ purged, failed }, { status: failed ? 500 : 200, headers: NO_STORE })
}
