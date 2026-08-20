// NFR-3 / R1 decision 5 — TWO CSP policies from ONE deployment, host-routed.
// Next 16 renamed middleware.ts to proxy.ts and runs it on the Node runtime,
// which is what a session-aware CSP needs (connect-src carries the session's
// connected Ghost origins).
import { NextResponse, type NextRequest } from 'next/server'

const APP_HOST_PREFIX = 'app.'

export function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const isApp = host.startsWith(APP_HOST_PREFIX) || req.nextUrl.pathname.startsWith('/editor')

  if (isApp) {
    // per-session nonce policy
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const ghostOrigins = 'https://ghost5.inflozo.com https://ghost6.inflozo.com'
    const csp = [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: https:`,
      `connect-src 'self' ${ghostOrigins}`,
      `frame-ancestors 'self'`,      // NOT 'none' — the editing iframe is same-origin
      `base-uri 'self'`,
      `form-action 'self'`,
    ].join('; ')
    const headers = new Headers(req.headers)
    headers.set('x-nonce', nonce)
    const res = NextResponse.next({ request: { headers } })
    res.headers.set('content-security-policy', csp)
    res.headers.set('x-inflozo-policy', 'app-nonce')
    return res
  }

  // marketing: a STATIC policy, no nonce, so the page stays prerenderable
  const res = NextResponse.next()
  res.headers.set('content-security-policy', [
    `default-src 'self'`,
    `script-src 'self'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
  ].join('; '))
  res.headers.set('x-inflozo-policy', 'marketing-static')
  return res
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
