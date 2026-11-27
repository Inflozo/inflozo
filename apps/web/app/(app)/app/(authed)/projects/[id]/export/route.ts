import { after, NextResponse, type NextRequest } from 'next/server'
import { isUuid } from '@/lib/editor'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { DEPLOY_IO } from '@/server/deploy/deploy-io'
import { holdsLock } from '@/server/edit-lock'
import { compileBudget, exportTheme, exportView, startExport } from '@/server/deploy/run'

/**
 * STORY 7.26 — THE EXPORT'S ONE DOOR (FR-J12), the deploy route's pattern (`projects/[id]/deploy/route.ts`): `force-dynamic`,
 * `currentUser()`, `isUuid`, plain-text refusals with `Cache-Control: no-store`. POST `{ session }` starts an export; GET `?job=` is
 * the export window's poll (`ExportView`).
 *
 * ONE INVOCATION (AD-11, AD-13). The POST answers at once with the job id, and the work — the compile, both pinned gscans, the
 * quality gate, the zip put at the project's one export object, the `exports` row and the freeze — runs in Next's `after()` inside
 * the same invocation (`maxDuration` 300). No zip is ever a response body: the window follows `export/download`'s signed URL.
 *
 * THE LOCK. An export needs this tab's session to hold a FRESH `edit_locks` row (`holdsLock`, the user's own client), as Run checks
 * does — FR-J12's "export requires the edit lock" — and answers 423 otherwise, before anything is counted or inserted. A session
 * reading along takes the lock over first (D8g in export words), in the editor. No site's advisory lock: nothing is sent to a Ghost.
 *
 * THE BUDGET (R-295, Story 7.25): `compileBudget`, the same count and code (`compile_budget`) as Run checks', asked for the export's
 * sentence — 429 with AD-24's envelope as JSON; a count that cannot be read is a 502 and nothing is handed on. No plan, entitlement
 * or project-cap state is asked: every plan exports, a project with no site included (Stories 12.3 and 12.4 add their gates here).
 *
 * THE WORK IS `server/deploy/run.ts`'s (`startExport`, `exportTheme`, `exportView`), over `DEPLOY_IO`.
 */

export const dynamic = 'force-dynamic'
/** AD-11: the compile, both gscans and the quality gate in one invocation */
export const maxDuration = 300

const no = (status: number, body: string) => new NextResponse(body, { status, headers: { 'Cache-Control': 'no-store' } })
const json = (status: number, body: unknown) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

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
  const { session } = body as Record<string, unknown>
  if (typeof session !== 'string' || session.length === 0 || session.length > 64) return no(400, 'Bad session')

  // the project, through the user's own session: RLS decides that it is theirs at all
  const { data, error } = await (await supabaseServer()).from('projects').select('id').eq('id', projectId).maybeSingle()
  if (error) return no(502, 'The project could not be read')
  if (!data) return no(404, 'Not found')
  if (!(await holdsLock(projectId, session))) return no(423, 'This session does not hold the edit lock')

  const budget = await compileBudget({ userId: user.id, for: 'export' }, DEPLOY_IO).catch((e: unknown) => {
    console.error('projects/export: the compile budget could not be read', { code: (e as { code?: string } | null)?.code })
    return undefined
  })
  if (budget === undefined) return no(502, 'The compile budget could not be read')
  if (budget !== null) return json(429, budget)
  let made
  try {
    made = await startExport({ projectId, userId: user.id }, DEPLOY_IO)
  } catch {
    return no(502, 'The export could not be started')
  }
  after(() => exportTheme({ jobId: made.id, userId: user.id }, DEPLOY_IO))
  return json(202, { job: made.id })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return no(401, 'Not signed in')
  const projectId = (await params).id
  const jobId = request.nextUrl.searchParams.get('job') ?? ''
  if (!isUuid(projectId) || !isUuid(jobId)) return no(404, 'Not found')
  // a read that FAILED is not a job that is gone (the deploy GET's rule): 502, never a 404
  const row = await DEPLOY_IO.jobs.read(jobId, user.id).catch(() => undefined)
  if (row === undefined) return no(502, 'The export could not be read')
  // this project's export alone: a deploy's row (a site) is the deploy route's
  if (row === null || row.project_id !== projectId || row.site_id !== null) return no(404, 'Not found')
  const answer = await exportView({ jobId, userId: user.id }, DEPLOY_IO).catch((e: unknown) => {
    console.error('projects/export: the job could not be read', { code: (e as { code?: string } | null)?.code })
    return undefined
  })
  if (answer === undefined) return no(502, 'The export could not be read')
  return answer === null ? no(404, 'Not found') : json(200, answer)
}
