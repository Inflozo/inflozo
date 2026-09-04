// Host routing for the one deployment that serves both domains. Next 16 renamed
// middleware.ts to proxy.ts and runs it on the Node.js runtime.
// The CSP arrives with the first story that has a page to protect; tools/probe/csp/proxy.ts
// is its executed shape.
import { NextResponse, type NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const { pathname } = req.nextUrl

  // app.inflozo.com → the internal /app prefix. A rewrite, so the URL never changes.
  if (host.startsWith('app.')) {
    return NextResponse.rewrite(new URL(`/app${pathname}`, req.url))
  }

  // The app prefix is not a public URL on the apex — send it to the app host.
  if (pathname.startsWith('/app') && host.endsWith('inflozo.com')) {
    return NextResponse.redirect(
      new URL(pathname.slice(4) || '/', `https://app.${host}`),
      308,
    )
  }

  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next/|favicon.ico).*)'] }
