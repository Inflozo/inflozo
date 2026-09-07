import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { currentUser, supabaseAdmin, supabaseServer } from '@/lib/supabase/server'
import { snapshotObjectKey, SNAPSHOT_BUCKET } from '../../../(authed)/account/deletion-rule'

/**
 * FR-J13's pre-Inflozo theme, handed back while FR-A5's window is open — the Download beside each
 * row on `/restore`.
 *
 * AD-13: A SHORT-LIVED SIGNED URL MINTED BY A SERVER ROUTE, NEVER BYTES THROUGH A FUNCTION BODY
 * (spine `:185`). The route answers `303` to a URL Storage itself will serve for sixty seconds;
 * nothing of ours proxies a zip.
 *
 * TWO CLIENTS, AND WHICH DOES WHAT IS THE WHOLE SECURITY OF THIS FILE.
 *
 *   The USER'S own client reads the row, so `site_snapshots_owner_read` (schema `:856-861`) is
 *   what decides whose snapshot it is. Nothing here compares a `user_id`: RLS answers, and a row
 *   that is not the caller's simply is not there.
 *
 *   `supabaseAdmin()` mints the URL, because the `site-snapshots` BUCKET has no policy at all by
 *   design (AD-32, schema `:1553-1555`) — "a snapshot the client could write defeats FR-J13's
 *   whole purpose" — and the service role is therefore its only reader. This is the SECOND
 *   privileged read the docstring of `lib/supabase/server.ts` foresaw, and `server-wiring.test.ts`
 *   names this file in its `allowed` list with that reason. It never touches a user ROW.
 *
 * A ROW THAT IS NOT THE CALLER'S IS A 404, never a 403: a 403 would confirm the id exists. So is a
 * row whose OBJECT is gone (`NoSuchKey` — read off the wire, 2026-09-07: Storage answers HTTP 400
 * with `statusCode "404"` and that code): a file that is permanently missing must not be a 502
 * inviting retries that never succeed.
 *
 * THE FILE IS NAMED FOR ITS SITE. Storage would serve every one as `theme.zip`, and a person with
 * two sites choosing which original theme to keep needs the download to say which is which.
 */

const idSchema = z.string().uuid()

/** AD-13's window. Long enough for a browser to follow the redirect, short enough to be useless. */
const SIGNED_URL_TTL_S = 60

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const notFound = new NextResponse('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })

  // `currentUser()`, not `signedIn()`: a route handler answers with a response of its own rather
  // than throwing a page redirect, and 303 is the right one for a link the browser followed.
  if (!(await currentUser())) {
    return NextResponse.redirect(new URL('/sign-in', request.url), 303)
  }

  const asked = idSchema.safeParse((await params).id)
  if (!asked.success) return notFound

  const supabase = await supabaseServer()
  const { data: snapshot, error } = await supabase
    .from('site_snapshots')
    .select('storage_path, theme_name, sites(title)')
    .eq('id', asked.data)
    .maybeSingle()
  if (error) console.error('snapshot: read failed', { code: error.code })
  if (!snapshot?.storage_path) return notFound

  const site = (snapshot.sites as unknown as { title: string | null } | null)?.title?.trim() || 'site'
  const theme = snapshot.theme_name?.trim() || 'original-theme'
  const filename = `${site}-${theme}.zip`.replace(/[^\w.-]+/g, '-')

  // The column carries `site-snapshots/{userId}/{siteId}/…`; the Storage API takes the bucket and
  // the key separately, so the prefix comes off in the ONE place that strips it.
  const { data: signed, error: signError } = await supabaseAdmin()
    .storage.from(SNAPSHOT_BUCKET)
    .createSignedUrl(snapshotObjectKey(snapshot.storage_path), SIGNED_URL_TTL_S, { download: filename })
  if ((signError as { code?: string } | null)?.code === 'NoSuchKey') {
    console.error('snapshot: object missing', { id: asked.data })
    return notFound
  }
  if (signError || !signed?.signedUrl) {
    console.error('snapshot: signing failed', { message: signError?.message })
    return new NextResponse('Could not prepare that download', {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  // ponytail: 60-second signed URLs; a streamed proxy the day a snapshot exceeds a browser's
  // patience.
  const away = NextResponse.redirect(signed.signedUrl, 303)
  away.headers.set('Cache-Control', 'no-store')
  return away
}
