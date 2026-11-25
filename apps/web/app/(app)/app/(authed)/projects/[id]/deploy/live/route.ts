import { NextResponse, type NextRequest } from 'next/server'
import { ARTIFACT_BUCKET } from '@/lib/deploy'
import { liveCopyPath, liveFileName } from '@/lib/drift'
import { isUuid } from '@/lib/editor'
import { currentUser, supabaseAdmin, supabaseServer } from '@/lib/supabase/server'

/**
 * STORY 7.21 — D3a'S "DOWNLOAD THE LIVE THEME FIRST": the zip the drift check read, before Overwrite and ship anyway replaces it.
 *
 * AD-13: A SHORT-LIVED SIGNED URL MINTED BY A SERVER ROUTE, NEVER BYTES THROUGH A FUNCTION BODY — Story 2.5's snapshot download
 * (`snapshots/[id]/download/route.ts`), copied: a 303 to a URL Storage serves for sixty seconds, named `{theme}-live.zip`.
 *
 * TWO CLIENTS. The USER'S own client reads the job (`deploy_jobs`' owner policy decides whose it is, as the wizard's poll is the
 * caller's), and the job must be this project's with a drift record of `found` — anything else is a 404, never a 403 that would
 * confirm the id. `supabaseAdmin()` signs, because the `deploy-artifacts` bucket has no Storage policy at all (server-only,
 * AD-29); `server-wiring.test.ts` names this file on its service-role list with that reason. The object is the project × site's one
 * live copy (`liveCopyPath`), which the check wrote before its record. A missing object (`NoSuchKey`) is a 404 — a file that is
 * permanently gone must not be a 502 inviting retries — and any other signing failure is a 502.
 */

export const dynamic = 'force-dynamic'

/** AD-13's window: long enough for a browser to follow the redirect, short enough to be useless */
const SIGNED_URL_TTL_S = 60

const no = (status: number, body: string) => new NextResponse(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // a link the browser followed: a signed-out press goes to sign in, as Story 2.5's does
  if (!(await currentUser())) return NextResponse.redirect(new URL('/sign-in', request.url), 303)
  const projectId = (await params).id
  const jobId = request.nextUrl.searchParams.get('job') ?? ''
  if (!isUuid(projectId) || !isUuid(jobId)) return no(404, 'Not found')

  const { data: job, error } = await (await supabaseServer()).from('deploy_jobs').select('project_id, site_id, stage_timings').eq('id', jobId).maybeSingle()
  // a read that failed is ours and passing — a 502, never a 404 that says the job is not there (the deploy GET's rule)
  if (error) {
    console.error('deploy/live: the job could not be read', { code: error.code })
    return no(502, 'Could not prepare that download')
  }
  const drift = (job?.stage_timings as { drift?: { kind?: unknown; theme?: unknown; kept?: unknown } } | null | undefined)?.drift
  // Story 7.22 (DW-396): a found drift whose live zip was too large to keep has no copy of its own — the key may still hold an
  // EARLIER check's copy, which is not the theme this check read, so it is never served for this job
  if (!job || job.project_id !== projectId || drift?.kind !== 'found' || drift.kept === false || typeof job.site_id !== 'string') return no(404, 'Not found')

  const theme = typeof drift.theme === 'string' && drift.theme.trim() !== '' ? drift.theme : 'theme'
  const { data: signed, error: signError } = await supabaseAdmin()
    .storage.from(ARTIFACT_BUCKET)
    .createSignedUrl(liveCopyPath(projectId, job.site_id), SIGNED_URL_TTL_S, { download: liveFileName(theme).replace(/[^\w.-]+/g, '-') })
  if ((signError as { code?: string } | null)?.code === 'NoSuchKey') {
    console.error('deploy/live: the live copy is missing', { job: jobId })
    return no(404, 'Not found')
  }
  if (signError || !signed?.signedUrl) {
    console.error('deploy/live: signing failed', { message: signError?.message })
    return no(502, 'Could not prepare that download')
  }
  const away = NextResponse.redirect(signed.signedUrl, 303)
  away.headers.set('Cache-Control', 'no-store')
  return away
}
