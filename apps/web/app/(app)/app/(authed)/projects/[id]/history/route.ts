import { NextResponse, type NextRequest } from 'next/server'
import { hostOf } from '@/lib/connect-rule'
import { isUuid } from '@/lib/editor'
import { resolveEntitlement } from '@/lib/entitlement'
import { heavyIds, historyAnswer, type AcceptedRow, type HeavyRow } from '@/lib/retention'
import { currentUser, supabaseAdmin, supabaseServer } from '@/lib/supabase/server'
import { putBack } from '@/server/deploy/put-back'
import { PUT_BACK_IO } from '@/server/deploy/put-back-io'

/**
 * STORY 7.22 — THE HISTORY DRAWER'S ONE DOOR (FR-J7; the deploy route's pattern: `force-dynamic`, `currentUser()`, `isUuid`, a
 * plain-text refusal, `Cache-Control: no-store` on every answer).
 *
 * GET — the project's STORED versions on every site (`isStoredVersion`: `uploaded`/`live` with a zip), newest first, each with its
 * site's host, and the project's linked site — read through the USER'S OWN session, so RLS decides whose rows they are. A pruned
 * version (its pointer cleared) is simply not in the list: never a greyed row with a dead Restore (the epic's criterion).
 * STORY 7.23a: newest ACCEPTED first (`accepted_at`, DW-400), and each row's time, Changed line, dropped settings and action —
 * `lib/retention.ts`' `historyAnswer` over three reads: the listed rows, every accepted row of the project light (no manifest — the
 * predecessors, the Live rows and the newest accepted per site come from it), then the manifests and Pre-flight's facts of only
 * the rows `heavyIds` names, at most twice the cap and one per site.
 *
 * POST `{ deploy, pinned }` — a pin or an unpin. A PIN is `pin_version(deploy, user, cap)` (Story 7.22's Schema), where `cap` is
 * the plan's `history` read through `resolveEntitlement` — AD-28's one decider — and the database counts and pins in one
 * serialized step, refusing at N−1 (FR-J7's "enforced in the database"): `pinned` 200, `cap` 409, `gone` 404. An UNPIN is a plain
 * update, scoped by `user_id` and `project_id`, never refused (404 only for a row that is not there). Both are the service role's:
 * `deploys` is select-only to the tenant (AD-8) and `pin_version` is executable by the service role alone, so
 * `server-wiring.test.ts` names this file with that reason.
 *
 * POST `{ deploy, act: 'live' }` — STORY 7.23a's put-back (`server/deploy/put-back.ts` over `PUT_BACK_IO`): Roll back or
 * Re-activate, the server deciding which. 200 `{ outcome }` (`live` · `uploaded`), 404 gone, 409 `{ code }` (`elsewhere` · `live` ·
 * `disconnected` · `busy`), 422 `{ code: 'ghost_theme_refused', detail }` (Ghost's own check, never retried — VERIFY 10), 502
 * `{ code, message }` (Ghost's other answers and ours, `deployError`'s words). It runs in this request, inside `maxDuration`.
 * THE ACT BRANCH READS NO PLAN AND NO LOCK, and runs no gscan (FR-J9: a stored artefact already ran; rollback is exempt from the Pro
 * exit gating) — `put-back.test.ts` reads this branch's source and holds it so.
 *
 * NO EDIT LOCK. A pin and a put-back are history controls: they change no design, so they are live in a read-only editor
 * (R-192's view-control side). ponytail: `pin_version` scopes by the user, not by this URL's project — a deploy of another
 * of the user's projects pinned through this address pins under ITS project's count, which is still the user's own row.
 */

export const dynamic = 'force-dynamic'
/** AD-11's budget: a put-back is at most two uploads of 120 s and an activation of 15 s (`ADMIN_WRITES`), in this request */
export const maxDuration = 300

const NO_STORE = { 'Cache-Control': 'no-store' }
const no = (status: number, body: string) => new NextResponse(body, { status, headers: NO_STORE })
const json = (status: number, body: unknown) => NextResponse.json(body, { status, headers: NO_STORE })

type Read = {
  id: string
  pinned: boolean
  gscan: { errors?: unknown[]; warnings?: unknown[] } | null
  sites: { url: string } | null
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return no(401, 'Not signed in')
  const projectId = (await params).id
  if (!isUuid(projectId)) return no(404, 'Not found')

  const sb = await supabaseServer()
  const [project, versions, accepted] = await Promise.all([
    sb.from('projects').select('linked_site_id').eq('id', projectId).maybeSingle(),
    sb.from('deploys')
      .select('id, pinned, gscan, sites(url)')
      .eq('project_id', projectId)
      .in('status', ['uploaded', 'live'])
      .not('artifact_path', 'is', null),
    // every upload Ghost accepted for the project, stored or pruned — light: the order, the predecessors, the Live rows
    sb.from('deploys')
      .select('id, version, status, site_id, created_at, accepted_at, artifact_path')
      .eq('project_id', projectId)
      .in('status', ['uploaded', 'live']),
  ])
  if (project.error || versions.error || accepted.error) {
    console.error('projects/history: the history could not be read', { code: project.error?.code ?? versions.error?.code ?? accepted.error?.code })
    return no(502, 'The history could not be read')
  }
  if (!project.data) return no(404, 'Not found')
  const rows = (accepted.data ?? []) as AcceptedRow[]
  const ids = heavyIds(rows)
  const heavy = ids.length === 0 ? { data: [], error: null } : await sb.from('deploys').select('id, content_manifest, preflight').in('id', ids)
  if (heavy.error) {
    console.error('projects/history: the manifests could not be read', { code: heavy.error.code })
    return no(502, 'The history could not be read')
  }
  const count = (list: unknown[] | undefined) => (Array.isArray(list) ? list.length : null)
  const answer = historyAnswer({
    linkedSiteId: typeof project.data.linked_site_id === 'string' ? project.data.linked_site_id : null,
    listed: ((versions.data ?? []) as unknown as Read[]).map((r) => ({
      id: r.id,
      pinned: r.pinned === true,
      errors: r.gscan === null ? null : count(r.gscan.errors),
      warnings: r.gscan === null ? null : count(r.gscan.warnings),
      host: hostOf(r.sites?.url ?? ''),
    })),
    rows,
    heavy: new Map(((heavy.data ?? []) as (HeavyRow & { id: string })[]).map(({ id, ...h }) => [id, h])),
  })
  return json(200, answer)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return no(401, 'Not signed in')
  const projectId = (await params).id
  if (!isUuid(projectId)) return no(404, 'Not found')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return no(400, 'Not JSON')
  }
  if (typeof body !== 'object' || body === null) return no(400, 'Not an object')
  const { deploy, pinned, act } = body as Record<string, unknown>
  if (typeof deploy !== 'string' || !isUuid(deploy)) return no(400, 'Bad deploy')

  // ── the act branch: Story 7.23a's put-back. No plan, no lock, no gscan (the header says why) ──
  if (act !== undefined) {
    if (act !== 'live') return no(400, 'Bad act')
    const outcome = await putBack(PUT_BACK_IO, { userId: user.id, projectId, deployId: deploy, now: new Date() })
    if (outcome === 'live' || outcome === 'uploaded') return json(200, { outcome })
    if (outcome === 'gone') return no(404, 'Not found')
    if (outcome === 'live-already') return json(409, { code: 'live' })
    if (typeof outcome === 'string') return json(409, { code: outcome })
    const { code, message, detail } = outcome.refused
    if (code === 'ghost_theme_refused') return json(422, { code, ...(detail === undefined ? {} : { detail }) })
    return json(502, { code, message })
  }
  // ── the pin branch (Story 7.22) ──

  if (typeof pinned !== 'boolean') return no(400, 'Bad pinned')

  if (!pinned) {
    // unpinning is always allowed, by design — nobody can trap themselves (FR-J7)
    const { data, error } = await supabaseAdmin()
      .from('deploys')
      .update({ pinned: false })
      .eq('id', deploy)
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .select('id')
    if (error) {
      console.error('projects/history: the unpin failed', { code: error.code })
      return no(502, 'The pin could not be changed')
    }
    return (data ?? []).length === 1 ? json(200, { pinned: false }) : no(404, 'Not found')
  }

  // AD-28: the plan's number, from the one resolver — handed to the database, which counts and pins in one step
  const { caps } = await resolveEntitlement(user.id)
  const { data, error } = await supabaseAdmin().rpc('pin_version', { p_deploy: deploy, p_user: user.id, p_cap: caps.history })
  if (error) {
    console.error('projects/history: the pin failed', { code: error.code })
    return no(502, 'The pin could not be changed')
  }
  if (data === 'cap') return no(409, 'One version has to stay unpinned')
  if (data === 'gone') return no(404, 'Not found')
  return data === 'pinned' ? json(200, { pinned: true }) : no(502, 'The pin could not be changed')
}
