import { NextResponse, type NextRequest } from 'next/server'
import { HARNESS } from '@/lib/harness'
import { cardsDocument } from '@/lib/style-guide'

/**
 * STORY 7.13 — the keyboard harness's Editor cards canvas: `cardsDocument`, as the app's own style-guide frame serves it at
 * `?view=cards`, one level under the harness's canvas route — so the document's `../canvas` (its faces, the pack's worn
 * ones) reaches the harness's own `/canvas`, as the app's reaches its. It does not exist unless `INFLOZO_HARNESS=1` (R-146):
 * the app's frame route guards a customer's session, and the guard is never the thing a harness weakens.
 */
export async function GET(request: NextRequest) {
  if (!HARNESS) return new NextResponse('not found', { status: 404 })
  const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' }
  const nonce = request.headers.get('x-nonce')
  if (!nonce) return new NextResponse('no x-nonce on the request — proxy.ts did not run', { status: 500, headers })
  if (request.nextUrl.searchParams.get('view') !== 'cards') return new NextResponse('not found', { status: 404, headers })
  return new NextResponse(cardsDocument(nonce, request.nextUrl.searchParams.get('card')), { headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } })
}
