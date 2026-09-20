import { NextResponse, type NextRequest } from 'next/server'
import { HARNESS } from '@/lib/harness'
import { pilotIds, pilotImage, pilotsCanvasDocument } from '@/lib/pilots'

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
  /* THE BROWSER MAY KEEP THIS (the owner's ruling of 2026-09-20, Question 5). The document carries no script, no
     nonce and no user content — it is the reference tokens, the stylesheets and an empty mount, identical for every
     user until the next publish — so `private` keeps it out of shared caches and out of nobody's way. It is served
     `immutable` ONLY when the address carries the build (`?v=`, from `lib/canvas.ts`), which is what makes a publish
     picked up at once; a bare `/canvas` is never cached, so a stale document cannot be served to anything that asks
     without a version. Outside production nothing is cached at all: an edited stylesheet must never be held.
     The pictures cannot carry the build — a relative `canvas?image=x` drops the document's query when it resolves —
     so they take a short life instead, which is all a picker session needs. */
  const live = process.env.NODE_ENV === 'production'
  const versioned = request.nextUrl.searchParams.get('v') !== null
  const keep = (rule: string) => (live ? rule : 'no-store')
  const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' }
  const image = request.nextUrl.searchParams.get('image')
  if (image !== null) {
    const svg = pilotImage(image)
    if (svg === null) return new NextResponse('that picture is not in Orbit Weekly', { status: 404, headers })
    return new NextResponse(new Uint8Array(svg), {
      headers: { ...headers, 'cache-control': keep('private, max-age=600'), 'content-type': 'image/svg+xml', 'x-content-type-options': 'nosniff' },
    })
  }
  // STORY 5.10, the owner's ruling of 2026-09-20 (Question 4, option 3): a PREVIEW asks for one design and is
  // served one design's stylesheet. The editor's own canvas asks for none and is served them all, because it may
  // draw any section in the document. An unknown id is a 404 like an unknown picture — never served as "all".
  const design = request.nextUrl.searchParams.get('design')
  if (design !== null && !pilotIds().includes(design)) {
    return new NextResponse('that design is not in the library', { status: 404, headers })
  }
  return new NextResponse(pilotsCanvasDocument(design ?? undefined), {
    headers: { ...headers, 'cache-control': versioned ? keep('private, max-age=31536000, immutable') : 'no-store', 'content-type': 'text/html; charset=utf-8' },
  })
}
