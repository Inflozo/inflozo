import { NextResponse, type NextRequest } from 'next/server'
import { ARTIFACT_BUCKET, exportPath, themeNameFor } from '@/lib/deploy'
import { isUuid } from '@/lib/editor'
import { signedAnswer, signInAnswer } from '@/lib/signed-download'
import { currentUser, supabaseAdmin, supabaseServer } from '@/lib/supabase/server'

/**
 * STORY 7.26 — THE EXPORT'S DOWNLOAD (FR-J12, AD-13): the project's newest export, as a SHORT-LIVED SIGNED URL minted here, never
 * bytes through a function body — `deploy/live`'s shape (Story 7.21), named `inflozo-{slug}.zip`, the name Ghost gives an uploaded
 * theme (VERIFY 30).
 *
 * TWO CLIENTS. The USER'S own client reads the project and its newest `exports` row (RLS: the owner's read alone decides whose export
 * it is) — none is a 404, never a 403 that would confirm the id. `supabaseAdmin()` signs, because the `deploy-artifacts` bucket has
 * no Storage policy at all (server-only, AD-29); `server-wiring.test.ts` names this file on its service-role list with that reason.
 * The object is the project's one export (`exportPath`), which each export replaces, so the newest row always names it. A missing
 * object (`NoSuchKey`) is a 404 — a file that is gone must not be a 502 inviting retries — and any other signing failure a 502.
 *
 * Asked by the editor's follower (`Accept: application/json`, `lib/signed-download.ts`), it answers `200 { url }` and a signed-out
 * ask `401`, so the window says a 404, a 502 or the sign-in under its button and the editor stays; asked as a link, a 303.
 */

export const dynamic = 'force-dynamic'

/** AD-13's window: long enough for a browser to follow the redirect, short enough to be useless */
const SIGNED_URL_TTL_S = 60

const no = (status: number, body: string) => new NextResponse(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await currentUser())) return signInAnswer(request)
  const projectId = (await params).id
  if (!isUuid(projectId)) return no(404, 'Not found')

  const db = await supabaseServer()
  const [project, exported] = await Promise.all([
    db.from('projects').select('slug').eq('id', projectId).maybeSingle(),
    db.from('exports').select('version').eq('project_id', projectId).order('created_at', { ascending: false }).limit(1),
  ])
  // a read that failed is ours and passing — a 502, never a 404 that says the export is not there
  if (project.error || exported.error) {
    console.error('export/download: the export could not be read', { code: project.error?.code ?? exported.error?.code })
    return no(502, 'Could not prepare that download')
  }
  if (!project.data || (exported.data ?? []).length === 0) return no(404, 'Not found')

  // the export's name: the base rule with nothing held (`themeNameFor`, the one derivation of a name)
  const name = themeNameFor({ slug: String(project.data.slug), bound: null, held: [] })
  const { data: signed, error: signError } = await supabaseAdmin()
    .storage.from(ARTIFACT_BUCKET)
    .createSignedUrl(exportPath(projectId), SIGNED_URL_TTL_S, { download: `${name}.zip` })
  if ((signError as { code?: string } | null)?.code === 'NoSuchKey') {
    console.error('export/download: the export object is missing', { project: projectId })
    return no(404, 'Not found')
  }
  if (signError || !signed?.signedUrl) {
    console.error('export/download: signing failed', { message: signError?.message })
    return no(502, 'Could not prepare that download')
  }
  return signedAnswer(request, signed.signedUrl)
}
