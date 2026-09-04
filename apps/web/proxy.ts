// Host routing for the one deployment that serves both domains. Next 16 renamed
// middleware.ts to proxy.ts and runs it on the Node.js runtime.
// The decision itself lives in ./routing.ts, which imports nothing, so `node --test` can
// prove it — `next/server` does not resolve outside Next's own resolver.
// The CSP arrives with the first story that has a page to protect; tools/probe/csp/proxy.ts
// is its executed shape.
import { NextResponse, type NextRequest } from 'next/server'
import { route } from './routing.ts'

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const decision = route(req.headers.get('host') ?? '', pathname, search)

  switch (decision.kind) {
    case 'rewrite':
      return NextResponse.rewrite(new URL(decision.path, req.url))
    case 'redirect':
      return NextResponse.redirect(new URL(decision.url), 308)
    default:
      return NextResponse.next()
  }
}

export const config = { matcher: ['/((?!_next/|favicon.ico).*)'] }
