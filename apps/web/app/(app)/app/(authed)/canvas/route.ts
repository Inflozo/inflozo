import { NextResponse, type NextRequest } from 'next/server'
import { currentUser } from '@/lib/supabase/server'
import { pilotIds, pilotImage, pilotsCanvasDocument } from '@/lib/pilots'

/**
 * THE CANVAS DOCUMENT, served whole into the editor's iframe and the pilots review's (Story 4.10, one URL since Story
 * 5.1 — it was the pilots page's own frame route), and Orbit Weekly's pictures beside it (`?image=<name>`). One URL, so both pages emit
 * byte-identical markup: a picture's relative `canvas?image=` resolves the same from either.
 *
 * The document carries NO script, so it needs no nonce: the page framing it writes the sections in from the parent,
 * same origin. A picture is served only when its name is a file in Orbit Weekly's picture directory, read off the
 * directory — a name is never joined into a path unchecked.
 *
 * It sits beside the pages and not under their layouts, so it guards itself the way `controls/frame/route.ts` does —
 * BEFORE any body is built.
 */
export async function GET(request: NextRequest) {
  if (!(await currentUser())) return NextResponse.redirect(new URL('/sign-in', request.url), 303)
  /* THE BROWSER MAY KEEP THIS (the owner's ruling of 2026-09-20, Question 5). The document carries no script, no
     nonce and no user content — it is the reference tokens, the stylesheets and an empty mount, identical for every
     user until the next publish — so `private` keeps it out of shared caches and out of nobody's way. It is served
     `immutable` ONLY when the address carries the build (`?v=`, from `lib/canvas.ts`), which is what makes a publish
     picked up at once; a bare `/canvas` is never cached, so a stale document cannot be served to anything that asks
     without a version. Outside production nothing is cached at all: an edited stylesheet must never be held.
     The pictures cannot carry the build — a relative `canvas?image=x` drops the document's query when it resolves —
     so they take a short life instead, which is all a picker session needs. */
  const live = process.env.NODE_ENV === 'production'
  // a build, not merely a `v`: an empty one or the local fallback `dev` is never kept for a year (review, 2026-09-20)
  const v = request.nextUrl.searchParams.get('v')
  const versioned = !!v && v !== 'dev'
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
