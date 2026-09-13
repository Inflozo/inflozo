import { NextResponse, type NextRequest } from 'next/server'
import { currentUser } from '@/lib/supabase/server'
import { articleDocument, variationsDocument } from '@/lib/style-guide'

/**
 * THE FIXTURE DOCUMENT, served whole into the review pages' iframes (Story 4.4).
 *
 * A route and not a `srcdoc`, for the nonce: Ghost's card scripts must run under `'strict-dynamic'`,
 * so each carries this request's nonce — and a nonce written into the PARENT document's markup (a
 * `srcdoc` attribute is markup) is one an injected fragment could read back, which
 * `app/(app)/app/layout.tsx` refuses for the whole app. Here the nonce sits only on this document's
 * own `<script>` elements, exactly where Next puts its own.
 *
 * It sits beside the page and not under its layout, so it guards itself the way
 * `snapshots/[id]/download/route.ts` does: a route handler answers with a response of its own.
 */
export async function GET(request: NextRequest) {
  if (!(await currentUser())) return NextResponse.redirect(new URL('/sign-in', request.url), 303)
  const nonce = request.headers.get('x-nonce') ?? ''
  const view = request.nextUrl.searchParams.get('view')
  const html = view === 'variations' ? variationsDocument(nonce) : articleDocument(nonce)
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
