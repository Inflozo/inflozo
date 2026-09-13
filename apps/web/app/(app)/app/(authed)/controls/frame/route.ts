import { NextResponse, type NextRequest } from 'next/server'
import { currentUser } from '@/lib/supabase/server'
import { canvasDocument, poolImage } from '@/lib/controls-review'

/**
 * THE CANVAS DOCUMENT, served whole into the controls review's iframe (Story 4.5), and the sample's
 * picture pool beside it (`?image=<asset id>`).
 *
 * The document carries NO script, so unlike `style-guide/frame` it needs no nonce: the review page
 * writes the section into it from the parent, same origin. A picture is served only when its id is in
 * the pool, which is read off the directory — an id is never joined into a path unchecked.
 *
 * It sits beside the page and not under its layout, so it guards itself the way
 * `style-guide/frame/route.ts` does — BEFORE any body is built.
 */
export async function GET(request: NextRequest) {
  if (!(await currentUser())) return NextResponse.redirect(new URL('/sign-in', request.url), 303)
  const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' }
  const image = request.nextUrl.searchParams.get('image')
  if (image !== null) {
    const svg = poolImage(image)
    if (svg === null) return new NextResponse('that picture is not in the sample pool', { status: 404, headers })
    return new NextResponse(new Uint8Array(svg), {
      headers: { ...headers, 'content-type': 'image/svg+xml', 'x-content-type-options': 'nosniff' },
    })
  }
  return new NextResponse(canvasDocument(), { headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } })
}
