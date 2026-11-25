import { NextResponse, type NextRequest } from 'next/server'
import { ARTIFACT_BUCKET } from '@/lib/deploy'
import { historyCopyPath, liveFileName } from '@/lib/drift'
import { isUuid } from '@/lib/editor'
import { currentUser, supabaseAdmin, supabaseServer } from '@/lib/supabase/server'

/**
 * STORY 7.23a (R-291) — THE ROLL BACK CONFIRM'S "DOWNLOAD THE LIVE THEME FIRST": the zip the check before a Roll back read
 * (`server/deploy/put-back.ts`' `checkBeforePutBack`), before the Roll back replaces it. `deploy/live/route.ts`' pattern, copied:
 *
 * AD-13: A SHORT-LIVED SIGNED URL MINTED BY A SERVER ROUTE, NEVER BYTES THROUGH A FUNCTION BODY — a 303 to a URL Storage serves for
 * sixty seconds, named `{theme}-live.zip`.
 *
 * TWO CLIENTS. The USER'S own client reads the project and its `linked_site_id` (RLS decides whose project it is — another
 * account's is a 404, never a 403 that would confirm the id); `supabaseAdmin()` signs, because the `deploy-artifacts` bucket has no
 * Storage policy at all (server-only, AD-29), so `server-wiring.test.ts` names this file on its service-role list with that reason.
 * The object is the project × linked site's one check copy (`historyCopyPath`) — never Ship it's (`liveCopyPath`), so a resting
 * D3a's Download is never this check's zip. `?theme=` names the file alone: anything but a plain theme name (`\w.-`) is "theme". A
 * missing object (`NoSuchKey`) is a 404, any other signing failure a 502.
 */

export const dynamic = 'force-dynamic'

/** AD-13's window: long enough for a browser to follow the redirect, short enough to be useless */
const SIGNED_URL_TTL_S = 60
/** a theme's name as Ghost and `themeNameOf` write it — the only thing `?theme=` may put in a file name */
const PLAIN = /^[\w.-]{1,120}$/

const no = (status: number, body: string) => new NextResponse(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // a link the browser followed: a signed-out press goes to sign in, as Story 2.5's does
  if (!(await currentUser())) return NextResponse.redirect(new URL('/sign-in', request.url), 303)
  const projectId = (await params).id
  if (!isUuid(projectId)) return no(404, 'Not found')

  const { data: project, error } = await (await supabaseServer()).from('projects').select('linked_site_id').eq('id', projectId).maybeSingle()
  // a read that failed is ours and passing — a 502, never a 404 that says the project is not there
  if (error) {
    console.error('history/live: the project could not be read', { code: error.code })
    return no(502, 'Could not prepare that download')
  }
  if (!project || typeof project.linked_site_id !== 'string') return no(404, 'Not found')

  const asked = request.nextUrl.searchParams.get('theme') ?? ''
  const theme = PLAIN.test(asked) ? asked : 'theme'
  const { data: signed, error: signError } = await supabaseAdmin()
    .storage.from(ARTIFACT_BUCKET)
    .createSignedUrl(historyCopyPath(projectId, project.linked_site_id), SIGNED_URL_TTL_S, { download: liveFileName(theme) })
  if ((signError as { code?: string } | null)?.code === 'NoSuchKey') {
    console.error('history/live: the check\'s copy is missing', { project: projectId })
    return no(404, 'Not found')
  }
  if (signError || !signed?.signedUrl) {
    console.error('history/live: signing failed', { message: signError?.message })
    return no(502, 'Could not prepare that download')
  }
  const away = NextResponse.redirect(signed.signedUrl, 303)
  away.headers.set('Cache-Control', 'no-store')
  return away
}
