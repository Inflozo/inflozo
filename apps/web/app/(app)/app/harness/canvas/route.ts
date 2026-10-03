import { NextResponse, type NextRequest } from 'next/server'
import { paywallSamples, samples } from '@/lib/controls-review'
import { canvasCaching } from '@/lib/canvas'
import { HARNESS } from '@/lib/harness'
import { pilotIds, pilotImage, pilotsCanvasDocument, poolFont, poolFontIs } from '@/lib/pilots'
import { presetOf } from '@inflozo/library/packs'
import { surfaceCss } from '@/lib/style-guide'
import { standIns } from '../stand-ins'

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
  // DW-275 (Story 5.24e): the Paywall's post-body sheet, kept out of the document and asked for on its first paint
  if (request.nextUrl.searchParams.get('sheet') === 'surface') {
    return new NextResponse(surfaceCss(), { headers: { ...headers, 'cache-control': caching.document, 'content-type': 'text/css; charset=utf-8' } })
  }
  // STORY 6.2 — THE POOL'S FACES, SELF-HOSTED (Appendix D §D.a rule 6, §D.b): a file is served only when its name is a file
  // `pool.json` records, read off that list — a name is never joined into a path unchecked — and kept as long as the
  // document, since its address carries its own hash (`fontHref`)
  const font = request.nextUrl.searchParams.get('font')
  if (font !== null) {
    const bytes = poolFont(font)
    if (bytes === null) return new NextResponse('that file is not in the font pool', { status: 404, headers })
    return new NextResponse(new Uint8Array(bytes), {
      headers: { ...headers, 'cache-control': poolFontIs(font, request.nextUrl.searchParams.get('h')) ? caching.font : 'no-store', 'content-type': 'font/woff2', 'x-content-type-options': 'nosniff' },
    })
  }
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
  // Story 5.20 — and the two stand-in paywalls (R-158's shape), which the harness's Paywall canvas chooses between.
  // Story 5.24e — and, when the page asked for them, the footer and post content stand-ins (`../stand-ins.ts`); the page's
  // extra headers ride the canvas's own request, so the default document every other stop counts on is unchanged
  const ring = [...samples(), ...paywallSamples(), ...(request.headers.get('x-inflozo-harness-stand-ins') === 'on' ? standIns() : [])]
  const design = request.nextUrl.searchParams.get('design')
  if (design !== null && ![...pilotIds(), ...ring.map((e) => e.id)].includes(design)) {
    return new NextResponse('that design is not in the library', { status: 404, headers })
  }
  // Story 6.2 — a preset by id, as the app's own route answers it; an unknown one is a 404
  const pack = request.nextUrl.searchParams.get('pack') ?? 'paper'
  if (presetOf(pack) === undefined) return new NextResponse('that is not a Style Pack', { status: 404, headers })
  return new NextResponse(pilotsCanvasDocument(design ?? undefined, ring, pack), {
    headers: { ...headers, 'cache-control': caching.document, 'content-type': 'text/html; charset=utf-8' },
  })
}
