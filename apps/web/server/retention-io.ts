import { ARTIFACT_BUCKET } from '@/lib/deploy'
import { readEntitlement } from '@/lib/plan'
import type { Stored } from '@/lib/retention'
import { supabaseAdmin } from '@/lib/supabase/server'
import { strictPlan, type RetentionIo } from '@/server/retention'

/**
 * STORY 7.22 — THE PRUNE'S REAL `io` (`server/retention.ts` is handed it, so that file imports neither the service role nor the
 * plan's read, and `retention.test.ts` runs it over a fake). `deploy-io.ts`' `prune` member and the nightly sweep hand it in. It is
 * on `server-wiring.test.ts`' service-role list: `deploys` is select-only to the tenant (AD-8) and the `deploy-artifacts` bucket has
 * NO Storage policy at all (server-only, AD-29), so only the server clears a pointer or removes an object. EVERY QUERY CARRIES
 * `user_id`, the clause that stands in for the RLS the service role bypasses.
 */

const failed = (answer: { error: unknown }, what: string): void => {
  if (!answer.error) return
  const code = (answer.error as { code?: unknown; statusCode?: unknown }).code ?? (answer.error as { statusCode?: unknown }).statusCode
  console.error('retention-io: a query failed', { what, code: typeof code === 'string' ? code : undefined })
  throw Object.assign(new Error(`retention: ${what} failed`), { code: typeof code === 'string' ? code : 'error' })
}

export const RETENTION_IO: RetentionIo = {
  // AD-28's one read, through `plan.ts` — and a read that FAILED throws here, where `readEntitlement` would answer Free: a prune is
  // irreversible, so it never runs on a degraded answer (`server/retention.ts` says why)
  plan: (userId) => strictPlan((log) => readEntitlement(supabaseAdmin(), userId, log)),
  async versions({ projectId, userId }) {
    const answer = await supabaseAdmin()
      .from('deploys')
      .select('id, status, artifact_path, pinned, created_at, accepted_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .in('status', ['uploaded', 'live'])
      .not('artifact_path', 'is', null)
    failed(answer, 'versions')
    return (answer.data ?? []) as Stored[]
  },
  // the conditional clear: only an unpinned stored version still naming this object — a pin or another prune that landed first
  // changes nothing here, and its object stays
  async clear({ id, userId, path }) {
    const answer = await supabaseAdmin()
      .from('deploys')
      .update({ artifact_path: null, artifact_bytes: null })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('pinned', false)
      .eq('artifact_path', path)
      .in('status', ['uploaded', 'live'])
      .select('id')
    failed(answer, 'clear')
    return (answer.data ?? []).length === 1
  },
  async remove(path) {
    failed(await supabaseAdmin().storage.from(ARTIFACT_BUCKET).remove([path]), 'object remove')
  },
  log: (message, fields) => console.error(message, fields),
}
