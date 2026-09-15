import { NextResponse, type NextRequest } from 'next/server'
import { currentUser } from '@/lib/supabase/server'
import { pilotImage, pilotsCanvasDocument } from '@/lib/pilots'

/**
 * THE CANVAS DOCUMENT, served whole into the pilots review's iframe (Story 4.10), and Orbit Weekly's pictures beside
 * it (`?image=<name>`).
 *
 * The document carries NO script, so it needs no nonce: the review page writes the section into it from the parent,
 * same origin. A picture is served only when its name is a file in Orbit Weekly's picture directory, read off the
 * directory — a name is never joined into a path unchecked.
 *
 * It sits beside the page and not under its layout, so it guards itself the way `controls/frame/route.ts` does —
 * BEFORE any body is built.
 */
export async function GET(request: NextRequest) {
  if (!(await currentUser())) return NextResponse.redirect(new URL('/sign-in', request.url), 303)
  const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' }
  const image = request.nextUrl.searchParams.get('image')
  if (image !== null) {
    const svg = pilotImage(image)
    if (svg === null) return new NextResponse('that picture is not in Orbit Weekly', { status: 404, headers })
    return new NextResponse(new Uint8Array(svg), {
      headers: { ...headers, 'content-type': 'image/svg+xml', 'x-content-type-options': 'nosniff' },
    })
  }
  return new NextResponse(pilotsCanvasDocument(), { headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } })
}
