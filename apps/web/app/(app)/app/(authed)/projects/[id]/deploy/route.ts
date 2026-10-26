import { after, NextResponse, type NextRequest } from 'next/server'
import { INTENTS, MODES, type DeployIntent, type Mode } from '@/lib/deploy'
import { isUuid } from '@/lib/editor'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { DEPLOY_IO } from '@/server/deploy/deploy-io'
import { holdsLock } from '@/server/edit-lock'
import { activate, cancel, preflight, ship, start, uploadOnlyRefused, view } from '@/server/deploy/run'

/**
 * STORY 7.18a — THE DEPLOY WIZARD'S ONE DOOR (the lock route's pattern: `force-dynamic`, `currentUser()`, `isUuid`, a
 * plain-text refusal with `Cache-Control: no-store`). POST `{ intent, session, job?, mode? }` starts a Pre-flight, a Ship it,
 * a re-activate or a Cancel; GET `?job=` is the wizard's poll (`DeployView`).
 *
 * TWO INVOCATIONS ON ONE ROW (AD-20's F-075). Each POST answers AT ONCE with the job id and the work continues in Next's
 * `after()` inside the same invocation — AD-11's 300 s (`maxDuration`) — so no artefact is ever a response body (AD-13) and
 * the wizard reads the row until it ends. A route handler, not a server action, for the flush's reason: a server action's
 * transition holds every other one in the editor while it runs.
 *
 * THE LOCK. Pre-flight, Ship it and re-activate each need this tab's session to hold a FRESH `edit_locks` row (`STALE_MS`),
 * read with the user's own client — `edit_locks` has no service-role grant — and answer 423 otherwise. A session reading
 * along takes the lock over first (D8g), in the editor. AD-19's advisory lock over the upload is Story 7.25's.
 *
 * THE WORK IS `server/deploy/run.ts`'s, over `DEPLOY_IO`; this file only judges the request, the lock and the job's stage.
 */

export const dynamic = 'force-dynamic'
/** AD-11: the deploy function's budget — Pre-flight's compile and both gates, or Ship it's upload, in one invocation. */
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
  const { intent, session, job, mode, withoutSnapshot } = body as Record<string, unknown>
  if (typeof intent !== 'string' || !(INTENTS as readonly string[]).includes(intent)) return no(400, 'Not an intent')
  if (typeof session !== 'string' || session.length === 0 || session.length > 64) return no(400, 'Bad session')
  if (intent !== 'preflight' && (typeof job !== 'string' || !isUuid(job))) return no(400, 'Bad job')
  if (intent === 'ship' && (typeof mode !== 'string' || !(MODES as readonly string[]).includes(mode))) return no(400, 'Bad mode')
  // Story 7.20a — B12b's Deploy without a snapshot: a boolean, or absent
  if (withoutSnapshot !== undefined && typeof withoutSnapshot !== 'boolean') return no(400, 'Bad withoutSnapshot')

  const act = intent as DeployIntent
  if (act !== 'cancel' && !(await holdsLock(projectId, session))) return no(423, 'This session does not hold the edit lock')

  if (act === 'preflight') {
    // the project's linked site, through the user's own session: RLS decides that the project is theirs at all
    const { data, error } = await (await supabaseServer()).from('projects').select('linked_site_id').eq('id', projectId).maybeSingle()
    if (error) return no(502, 'The project could not be read')
    if (!data) return no(404, 'Not found')
    if (typeof data.linked_site_id !== 'string') return no(409, 'No site to ship to')
    let made
    try {
      made = await start({ projectId, siteId: data.linked_site_id, userId: user.id }, DEPLOY_IO)
    } catch {
      return no(502, 'The deploy could not be started')
    }
    after(() => preflight({ jobId: made.id, userId: user.id }, DEPLOY_IO))
    return json(202, { job: made.id })
  }

  const row = await DEPLOY_IO.jobs.read(job as string, user.id).catch(() => null)
  if (row === null || row.project_id !== projectId) return no(404, 'Not found')

  if (act === 'cancel') return (await cancel({ jobId: row.id, userId: user.id }, DEPLOY_IO)) ? json(200, { job: row.id }) : no(409, 'Past cancelling')
  if (act === 'ship') {
    if (row.stage !== 'awaiting_ship') return no(409, 'Not ready to ship')
    // R-264 (a): Deploy only while this project's theme is the live one would go live the moment it uploads — refused,
    // nothing uploaded (the ▾ row and S8a's card are greyed for the same reason, `uploadOnlyBlock`)
    if (mode === 'upload' && (await uploadOnlyRefused({ projectId, siteId: row.site_id, userId: user.id }, DEPLOY_IO).catch(() => true))) {
      return no(422, 'Deploy only is blocked')
    }
    after(() => ship({ jobId: row.id, userId: user.id, mode: mode as Mode, withoutSnapshot: withoutSnapshot === true }, DEPLOY_IO))
    return json(202, { job: row.id })
  }
  // re-activate: D2e's and D2f's button, on a job that uploaded and is not live
  if (row.stage !== 'done' && row.stage !== 'failed') return no(409, 'Nothing to activate')
  after(() => activate({ jobId: row.id, userId: user.id }, DEPLOY_IO))
  return json(202, { job: row.id })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return no(401, 'Not signed in')
  const projectId = (await params).id
  const jobId = request.nextUrl.searchParams.get('job') ?? ''
  if (!isUuid(projectId) || !isUuid(jobId)) return no(404, 'Not found')
  // a read that FAILED is not a job that is gone: 404 sends the wizard back to Destination, mid-upload (the review, 2026-10-19)
  const row = await DEPLOY_IO.jobs.read(jobId, user.id).catch(() => undefined)
  if (row === undefined) return no(502, 'The deploy could not be read')
  if (row === null || row.project_id !== projectId) return no(404, 'Not found')
  const answer = await view({ jobId, userId: user.id }, DEPLOY_IO).catch((e: unknown) => {
    console.error('projects/deploy: the job could not be read', { code: (e as { code?: string } | null)?.code })
    return undefined
  })
  if (answer === undefined) return no(502, 'The deploy could not be read')
  return answer === null ? no(404, 'Not found') : json(200, answer)
}
