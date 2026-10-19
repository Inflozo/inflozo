import { isStale, rowFrom } from '@/lib/lock'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * STORY 7.18b — DOES THIS TAB'S SESSION HOLD THE PROJECT'S EDIT LOCK, FRESH? One helper for every write that needs the lock
 * outside the sync and lock routes: the deploy route's Pre-flight, Ship it and re-activate (Story 7.18a, where it was born as
 * `holds`), and choosing the site (`switchSite`). Read through the user's OWN session — `edit_locks` has no service-role grant
 * (MEASUREMENTS §50), and RLS scopes the row to the caller's project — and judged by `lib/lock.ts`' own rule (`STALE_MS`).
 */
export async function holdsLock(projectId: string, session: string, client?: Awaited<ReturnType<typeof supabaseServer>>): Promise<boolean> {
  // a server action hands its own quiet client (R-213: a bare `supabaseServer()` writes cookies inside an action)
  const { data, error } = await (client ?? (await supabaseServer()))
    .from('edit_locks')
    .select('holder_session_id, lock_generation, unsynced_edits, heartbeat_at, nudge_requested_by, nudge_requested_at')
    .eq('project_id', projectId)
    .maybeSingle()
  if (error) console.error('edit-lock: the lock could not be read', { code: error.code })
  const row = error || !data ? null : rowFrom(data, Date.now())
  return row !== null && !isStale(row) && row.holderSessionId === session
}
