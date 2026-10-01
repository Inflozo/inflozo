import { NextResponse, type NextRequest } from 'next/server'
import { paywallSamples, samples } from '@/lib/controls-review'
import { canvasCaching } from '@/lib/canvas'
import { HARNESS } from '@/lib/harness'
import { pilotIds, pilotImage, pilotsCanvasDocument } from '@/lib/pilots'

/**
 * STORY 5.9 — the keyboard harness's canvas document: the app's own `/canvas` bytes (`pilotsCanvasDocument()`,
 * plus Orbit Weekly's pictures at `?image=`), PLUS Story 5.11's three fixture designs. The editor is told this
 * path through its `canvasSrc` prop rather than the real route's `currentUser()` guard being bypassed for a test:
 * the guard that protects a customer's canvas is never the thing a harness weakens.
 *
 * THE RING IS THE ONE THING THE TWO DOCUMENTS DIFFER BY (R-158). The shipped library holds one design per
 * category, so `[` and `]` would have nowhere to go on a harness carrying pilots alone and `pnpm keyboard` would
 * prove the keys are bound and nothing else. The fixture ring is NOT the shipped library (AD-35 untouched) and
 * production serves it to nobody: this route answers 404 there.
 *
 * IT DOES NOT EXIST UNLESS `INFLOZO_HARNESS=1` (R-146), which the gate sets on the `next dev` it boots and which is
 * set nowhere in production — `notFound()` above anything else, so production answers 404 and the deployed walk
 * asserts that it does.
 */
export async function GET(request: NextRequest) {
  if (!HARNESS) return new NextResponse('not found', { status: 404 })
  // what the browser may keep, and for how long: `lib/canvas.ts`'s one rule, the same call `/canvas` makes
  const caching = canvasCaching(request.nextUrl.searchParams.get('v'))
  const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' }
  const image = request.nextUrl.searchParams.get('image')
  if (image !== null) {
    const svg = pilotImage(image)
    if (svg === null) return new NextResponse('that picture is not in Orbit Weekly', { status: 404, headers })
    return new NextResponse(new Uint8Array(svg), {
      headers: { ...headers, 'cache-control': caching.image, 'content-type': 'image/svg+xml', 'x-content-type-options': 'nosniff' },
    })
  }
  // STORY 5.10, the owner's ruling of 2026-09-20 (Question 4, option 3): a PREVIEW asks for one design and is
  // served one design's stylesheet. The editor's own canvas asks for none and is served them all, because it may
  // draw any section in the document. An unknown id is a 404 like an unknown picture — never served as "all".
  // Story 5.20 — and the two stand-in paywalls (R-158's shape), which the harness's Paywall canvas chooses between
  const ring = [...samples(), ...paywallSamples()]
  const design = request.nextUrl.searchParams.get('design')
  if (design !== null && ![...pilotIds(), ...ring.map((e) => e.id)].includes(design)) {
    return new NextResponse('that design is not in the library', { status: 404, headers })
  }
  return new NextResponse(pilotsCanvasDocument(design ?? undefined, ring), {
    headers: { ...headers, 'cache-control': caching.document, 'content-type': 'text/html; charset=utf-8' },
  })
}
