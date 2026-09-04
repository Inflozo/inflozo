// The host-routing decision, kept free of `next/server` so `node --test` can reach it:
// `import 'next/server'` is unresolvable outside Next's own resolver (executed), and this
// file's four branches shipped four defects that no check could see (review, 2026-09-04).

const APEX = 'inflozo.com'
export const APP = 'app.inflozo.com'

export type Route =
  | { kind: 'rewrite'; path: string }
  | { kind: 'redirect'; url: string }
  | { kind: 'pass' }

/** `host` is the raw Host header; `search` is `''` or a leading `?`. */
export function route(host: string, pathname: string, search: string): Route {
  // Exact hosts, lowercased and without the port. `startsWith('app.')` and
  // `endsWith('inflozo.com')` also matched ghost5.inflozo.com and notinflozo.com, and the
  // 308 target was built from the header, sending www.inflozo.com/app/x to the
  // nonexistent app.www.inflozo.com.
  const h = host.toLowerCase().split(':')[0]

  // A path segment, never a prefix: `startsWith('/app')` ate /apply, which 308'd to /ly.
  const isAppPath = pathname === '/app' || pathname.startsWith('/app/')
  // `search` rides along on every branch, or the magic link's ?token= is dropped in flight.
  const stripped = `${pathname.slice(4) || '/'}${search}`

  if (h === APP) {
    // The internal prefix is not a public URL, so it canonicalises. It used to be rewritten
    // a second time, and app.inflozo.com/app 404'd as /app/app.
    return isAppPath
      ? { kind: 'redirect', url: `https://${APP}${stripped}` }
      : { kind: 'rewrite', path: `/app${pathname}${search}` }
  }

  if (h === APEX && isAppPath) {
    return { kind: 'redirect', url: `https://${APP}${stripped}` }
  }

  return { kind: 'pass' }
}
