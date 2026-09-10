/**
 * WHAT THE `@modal` SLOT RENDERS WHEN NOTHING IS INTERCEPTED — which is every route under
 * `/sites` except a soft navigation to `/sites/keys?site=…`, and `/sites/keys` itself when it is
 * reached directly (a typed URL, a refresh, a new tab, a scripts-off browser).
 *
 * A parallel slot with no `default.tsx` 404s the whole segment on a hard load, so this file is not
 * optional decoration — it is what keeps the full-page route working. It renders nothing.
 */
export default function NoModal() {
  return null
}
