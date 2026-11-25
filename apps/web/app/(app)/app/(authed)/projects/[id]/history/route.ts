import { NextResponse, type NextRequest } from 'next/server'
import { hostOf } from '@/lib/connect-rule'
import { isUuid } from '@/lib/editor'
import { resolveEntitlement } from '@/lib/entitlement'
import type { HistoryAnswer } from '@/lib/retention'
import { currentUser, supabaseAdmin, supabaseServer } from '@/lib/supabase/server'

/**
 * STORY 7.22 — THE HISTORY DRAWER'S ONE DOOR (FR-J7; the deploy route's pattern: `force-dynamic`, `currentUser()`, `isUuid`, a
 * plain-text refusal, `Cache-Control: no-store` on every answer).
 *
 * GET — the project's STORED versions on every site (`isStoredVersion`: `uploaded`/`live` with a zip), newest first, each with its
 * site's host, and the project's linked site — read through the USER'S OWN session, so RLS decides whose rows they are. A pruned
 * version (its pointer cleared) is simply not in the list: never a greyed row with a dead Restore (the epic's criterion).
 *
 * POST `{ deploy, pinned }` — a pin or an unpin. A PIN is `pin_version(deploy, user, cap)` (Story 7.22's Schema), where `cap` is
 * the plan's `history` read through `resolveEntitlement` — AD-28's one decider — and the database counts and pins in one
 * serialized step, refusing at N−1 (FR-J7's "enforced in the database"): `pinned` 200, `cap` 409, `gone` 404. An UNPIN is a plain
 * update, scoped by `user_id` and `project_id`, never refused (404 only for a row that is not there). Both are the service role's:
 * `deploys` is select-only to the tenant (AD-8) and `pin_version` is executable by the service role alone, so
 * `server-wiring.test.ts` names this file with that reason.
 *
 * NO EDIT LOCK. A pin is a history control, as Story 7.23's Roll back will be: it changes no design, so it is live in a read-only
 * editor (R-192's view-control side). ponytail: `pin_version` scopes by the user, not by this URL's project — a deploy of another
 * of the user's projects pinned through this address pins under ITS project's count, which is still the user's own row.
 */

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const no = (status: number, body: string) => new NextResponse(body, { status, headers: NO_STORE })
const json = (status: number, body: unknown) => NextResponse.json(body, { status, headers: NO_STORE })

type Read = {
  id: string
  version: string
  status: string
  pinned: boolean
  created_at: string
  gscan: { errors?: unknown[]; warnings?: unknown[] } | null
  site_id: string
  sites: { url: string } | null
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return no(401, 'Not signed in')
  const projectId = (await params).id
  if (!isUuid(projectId)) return no(404, 'Not found')

  const sb = await supabaseServer()
  const [project, versions] = await Promise.all([
    sb.from('projects').select('linked_site_id').eq('id', projectId).maybeSingle(),
    sb.from('deploys')
      .select('id, version, status, pinned, created_at, gscan, site_id, sites(url)')
      .eq('project_id', projectId)
      .in('status', ['uploaded', 'live'])
      .not('artifact_path', 'is', null)
      .order('created_at', { ascending: false }),
  ])
  if (project.error || versions.error) {
    console.error('projects/history: the history could not be read', { code: project.error?.code ?? versions.error?.code })
    return no(502, 'The history could not be read')
  }
  if (!project.data) return no(404, 'Not found')
  const count = (list: unknown[] | undefined) => (Array.isArray(list) ? list.length : null)
  const answer: HistoryAnswer = {
    linkedSiteId: typeof project.data.linked_site_id === 'string' ? project.data.linked_site_id : null,
    rows: ((versions.data ?? []) as unknown as Read[]).map((r) => ({
      id: r.id,
      version: r.version,
      status: r.status,
      pinned: r.pinned === true,
      createdAt: r.created_at,
      errors: r.gscan === null ? null : count(r.gscan.errors),
      warnings: r.gscan === null ? null : count(r.gscan.warnings),
      siteId: r.site_id,
      host: hostOf(r.sites?.url ?? ''),
    })),
  }
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
  const { deploy, pinned } = body as Record<string, unknown>
  if (typeof deploy !== 'string' || !isUuid(deploy)) return no(400, 'Bad deploy')
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
