import { NextResponse, type NextRequest } from 'next/server'
import { currentUser } from '@/lib/supabase/server'
import { canvasCaching } from '@/lib/canvas'
import { pilotIds, pilotImage, pilotsCanvasDocument, poolFont, poolFontIs } from '@/lib/pilots'
import { presetOf } from '@inflozo/library/packs'
import { surfaceCss } from '@/lib/style-guide'

/**
 * THE CANVAS DOCUMENT, served whole into the editor's iframe and the pilots review's (Story 4.10, one URL since Story
 * 5.1 — it was the pilots page's own frame route), and Orbit Weekly's pictures beside it (`?image=<name>`). One URL, so both pages emit
 * byte-identical markup: a picture's relative `canvas?image=` resolves the same from either.
 *
 * The document carries NO script, so it needs no nonce: the page framing it writes the sections in from the parent,
 * same origin. A picture is served only when its name is a file in Orbit Weekly's picture directory, read off the
 * directory — a name is never joined into a path unchecked.
 *
 * Since Story 6.2 it also serves the font pool's files (`?font=<file>`, the pool's own list) and draws the document in
 * any preset (`?pack=<id>`), so every canvas loads the theme's own faces from this app and never from a font host.
 *
 * It sits beside the pages and not under their layouts, so it guards itself the way `controls/frame/route.ts` does —
 * BEFORE any body is built.
 */
export async function GET(request: NextRequest) {
  if (!(await currentUser())) return NextResponse.redirect(new URL('/sign-in', request.url), 303)
  // what the browser may keep, and for how long: `lib/canvas.ts`'s one rule, which the harness's copy calls too
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
  const design = request.nextUrl.searchParams.get('design')
  if (design !== null && !pilotIds().includes(design)) {
    return new NextResponse('that design is not in the library', { status: 404, headers })
  }
  // STORY 6.2 — A PRESET BY ID (`/pilots`' Pack menu): the document carries that preset's block and faces. STORY 6.3 —
  // the editor's canvas asks for its project's pack ONCE per mount (none for Paper, whose address is unchanged) and a
  // switch restyles the document in place; an unknown id is a 404, never served as Paper
  const pack = request.nextUrl.searchParams.get('pack') ?? 'paper'
  if (presetOf(pack) === undefined) return new NextResponse('that is not a Style Pack', { status: 404, headers })
  return new NextResponse(pilotsCanvasDocument(design ?? undefined, [], pack), {
    headers: { ...headers, 'cache-control': caching.document, 'content-type': 'text/html; charset=utf-8' },
  })
}
