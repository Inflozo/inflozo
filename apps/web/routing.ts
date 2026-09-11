// The host-routing decision, kept free of `next/server` so `node --test` can reach it:
// `import 'next/server'` is unresolvable outside Next's own resolver (executed), and this
// file's four branches shipped four defects that no check could see (review, 2026-09-04).

const APEX = 'inflozo.com'
export const APP = 'app.inflozo.com'

export type Route =
  | { kind: 'rewrite'; path: string }
  | { kind: 'redirect'; url: string }
  | { kind: 'pass' }

// A path segment, never a prefix: `startsWith('/app')` ate /apply, which 308'd to /ly.
export const isApp = (pathname: string) => pathname === '/app' || pathname.startsWith('/app/')

/**
 * The internal prefix off a path: `/app` → `/`, `/app/sites` → `/sites`, `/apply` untouched.
 * The shell asks the same question of `usePathname()`, which reports `/app/…` on localhost and
 * the public path on the app host, so the one strip lives here where `node --test` reaches it
 * (review, 2026-09-05).
 */
export const stripApp = (pathname: string) => (isApp(pathname) ? pathname.slice(4) || '/' : pathname)

/**
 * THE REQUEST'S QUERY STRING, HANDED TO THE SERVER COMPONENTS THAT CANNOT SEE IT (Story 3.8).
 *
 * A `page.tsx` is given `searchParams` and a `layout.tsx` is not — Next's own rule — and First
 * Run's redirect HAS to be decided in the layout: a `loading.tsx` lets Next flush the shell
 * before the page resolves, so a `redirect()` from inside the page can only be delivered as a
 * CLIENT navigation. Measured on a production build (Story 3.8, Dev): `/` answered 200 and the
 * customer watched the dashboard's project-card skeleton for ~150ms before the welcome screen —
 * which is the owner's own finding 2 on Story 3.4 — and with scripts off the redirect never
 * arrived at all. From the layout, above that boundary, the same `redirect()` is a real 307.
 *
 * `proxy.ts` sets it on EVERY app request, empty string included, so a value sent by a client is
 * always overwritten rather than believed. It is read with `searchHeader()` below.
 */
export const SEARCH_HEADER = 'x-inflozo-search'

/** `''` or a leading `?`, as `route()` takes it — so "is anything on the URL" is one question. */
export const hasSearch = (header: string | null | undefined): boolean => Boolean(header)

/** `host` is the raw Host header; `search` is `''` or a leading `?`. */
export function route(host: string, pathname: string, search: string): Route {
  // Exact hosts, lowercased and without the port. `startsWith('app.')` and
  // `endsWith('inflozo.com')` also matched ghost5.inflozo.com and notinflozo.com, and the
  // 308 target was built from the header, sending www.inflozo.com/app/x to the
  // nonexistent app.www.inflozo.com.
  const h = host.toLowerCase().split(':')[0]

  const isAppPath = isApp(pathname)
  // `search` rides along on every branch, or the magic link's ?token= is dropped in flight.
  const stripped = `${stripApp(pathname)}${search}`

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
