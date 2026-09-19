import { NextResponse, type NextRequest } from 'next/server'
import { HARNESS } from '@/lib/harness'
import { pilotImage, pilotsCanvasDocument } from '@/lib/pilots'

/**
 * STORY 5.9 — the keyboard harness's canvas document, and it is the SAME BYTES the app's own `/canvas` serves
 * (`pilotsCanvasDocument()`, plus Orbit Weekly's pictures at `?image=`). The editor is told this path through its
 * `canvasSrc` prop rather than the real route's `currentUser()` guard being bypassed for a test: the guard that
 * protects a customer's canvas is never the thing a harness weakens.
 *
 * IT DOES NOT EXIST UNLESS `INFLOZO_HARNESS=1` (R-146), which the gate sets on the `next dev` it boots and which is
 * set nowhere in production — `notFound()` above anything else, so production answers 404 and the deployed walk
 * asserts that it does.
 */
export async function GET(request: NextRequest) {
  if (!HARNESS) return new NextResponse('not found', { status: 404 })
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
