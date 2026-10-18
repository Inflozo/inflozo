/**
 * STORY 7.17 — FR-I4's ROUTES STEP, ITS PURE HALF (AD-1): which file is offered to the customer's Ghost, how Ghost's
 * answer reads, and what each outcome writes to the site's routes state. `server/routes-upload.ts` does the reaching —
 * reads, the upload, the read-back, the write — and decides nothing; B16 (`components/routes-fallback.tsx`) draws what
 * this file names. No import, so the card's client bundle and the T1 recorder (`record-routes.mjs --upload`, through
 * Node's type stripping) load the same rule the server runs.
 *
 * THE STATE IS FOUR `sites` COLUMNS, all server-asserted (AD-7): `routes_last_offered` (the file Inflozo last offered),
 * `routes_live_sha256` and `routes_verified_at` (what was read back, and when), and `routes_fallback` (Story 7.17's
 * migration: why B16 is up — `no_token`, `revoked` or `role` — or null). The daily check (`writePlan`) clears the cause
 * when the live file's sha is the offered one's.
 */

/** B16's three causes (EXPERIENCE F3) — the migration's `check` list, `20261018120000_routes_fallback.sql`. */
export type RoutesFallback = 'no_token' | 'revoked' | 'role'

/** A failure that writes nothing: Ghost refused the file, was busy or away, or redirected; the read-back differed; the
 *  stored routing is not one `routesYaml` emitted from a config `validateRoutes` accepts; or the project or the site is
 *  not the caller's (the chokepoint's own code for that). */
export type RoutesFailure =
  | 'ghost_refused' | 'ghost_unavailable' | 'ghost_unreachable' | 'ghost_redirected' | 'routes_unverified' | 'routes_invalid' | 'site_not_found'

/** What the step answers. `file` is the text offered; `sha256` its hash, computed by the shell (AD-1: no hashing here). */
export type RoutesOutcome =
  | { kind: 'uploaded'; file: string; sha256: string }
  | { kind: 'unchanged'; file: string; sha256: string }
  | { kind: 'fallback'; cause: RoutesFallback; file: string }
  | { kind: 'kept' }
  | { kind: 'failed'; code: RoutesFailure; detail?: string }

/** What **Verify upload** answers — `verified` carries the live file's sha. */
export type VerifyOutcome = { kind: 'verified'; sha256: string } | { kind: 'notYet' } | { kind: 'unreachable' }

/**
 * GHOST'S DEFAULT `routes.yaml` (F4): `core/server/services/route-settings/default-routes.yaml`, 130 bytes, sha256
 * `b2d675260a6071be…`, byte-identical in 6.58.0 and 5.130.6 (read in both tarballs; `routes-upload.test.ts` asserts the
 * sha). What a project at Ghost's default routing puts back over a file Inflozo put there (R-255).
 */
export const GHOST_DEFAULT_ROUTES =
  'routes:\n\ncollections:\n  /:\n    permalink: /{slug}/\n    template: index\n\ntaxonomies:\n  tag: /tag/{slug}/\n  author: /author/{slug}/\n'

/** The Admin API's one routes address: GET reads the live file (the integration key may, on both majors — §37), POST
 *  uploads one (`routes_upload`, the staff token). The daily check reads it too. */
export const ROUTES_PATH = 'settings/routes/yaml/'

/** Ghost's one routing guide, linked by B16's "Show me where ↗" on both majors (routine call 3; F6). */
export const GHOST_ROUTES_HELP = 'https://docs.ghost.org/themes/routing/'

const utf8 = (text: string) => new TextEncoder().encode(text)

/** Byte for byte — FR-I4's read-back compares raw bytes, never decoded text. */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

/**
 * WHICH FILE GOES TO GHOST — the one rule (R-255, routine call 2). `project` is `routesYaml(config)`, null at Ghost's
 * default; `live` the site's file as read (null when the read failed); `lastOffered` the file Inflozo last offered.
 *   - With a file: Ghost already holding exactly those bytes posts nothing (`unchanged` — no dated copy in Ghost, no
 *     write); otherwise it is offered, even when the live read failed (the read-back decides).
 *   - At Ghost's default: Ghost's default goes back ONLY over Inflozo's own file — a live file equal to `lastOffered`
 *     that is not already the default. Someone else's file, an unreadable one and the default itself are `kept`.
 */
export function routesToOffer(args: { project: string | null; live: Uint8Array | null; lastOffered: string | null }):
  | { kind: 'offer'; file: string }
  | { kind: 'unchanged'; file: string }
  | { kind: 'kept' } {
  const { project, live, lastOffered } = args
  if (project !== null) return live !== null && bytesEqual(live, utf8(project)) ? { kind: 'unchanged', file: project } : { kind: 'offer', file: project }
  if (live === null || lastOffered === null) return { kind: 'kept' }
  if (bytesEqual(live, utf8(GHOST_DEFAULT_ROUTES)) || !bytesEqual(live, utf8(lastOffered))) return { kind: 'kept' }
  return { kind: 'offer', file: GHOST_DEFAULT_ROUTES }
}

/**
 * HOW GHOST'S ANSWER TO THE UPLOAD READS (F3, read in both majors' source). A 401 is a token that stopped working —
 * regenerated or its user gone. A 403 `NoPermissionError` is a staff account below Administrator: only the Owner's and an
 * Administrator's tokens hold `setting: edit`, so "a non-Owner connection" (FR-I4) reads as that (routine call 1); a 403
 * of any other type is not Ghost's permission answer (a firewall's, say) and is a refusal. A redirect, a 429 or a 5xx
 * and every other status are the chokepoint's own codes. A refused upload stores nothing (F2).
 */
export function routesAnswer(status: number, ghostType?: string): { ok: true } | { fallback: RoutesFallback } | { failed: RoutesFailure } {
  if (status >= 200 && status < 300) return { ok: true }
  if (status === 401) return { fallback: 'revoked' }
  if (status === 403 && ghostType === 'NoPermissionError') return { fallback: 'role' }
  if (status >= 300 && status < 400) return { failed: 'ghost_redirected' }
  if (status === 429 || status >= 500) return { failed: 'ghost_unavailable' }
  return { failed: 'ghost_refused' }
}

/**
 * THE ROUTES STATE EACH OUTCOME WRITES — null for one that writes nothing (`kept`, every failure, Verify's `notYet` and
 * `unreachable`). `at` is the shell's clock (AD-1).
 *   - uploaded or unchanged: the file, its sha, now, and no cause — Ghost holds what Inflozo offered.
 *   - fallback: the file offered and the cause B16 names; what was read stays as it was.
 *   - verified: the live sha, now, and no cause — the offered file is untouched, it is what was compared.
 */
export function routesWrite(outcome: RoutesOutcome | VerifyOutcome, at: string): Record<string, string | null> | null {
  switch (outcome.kind) {
    case 'uploaded':
    case 'unchanged':
      return { routes_last_offered: outcome.file, routes_live_sha256: outcome.sha256, routes_verified_at: at, routes_fallback: null }
    case 'fallback':
      return { routes_last_offered: outcome.file, routes_fallback: outcome.cause }
    case 'verified':
      return { routes_live_sha256: outcome.sha256, routes_verified_at: at, routes_fallback: null }
    default:
      return null
  }
}

/** The file chip's size, as the frame's "1.4 KB": bytes below 1,024, else kilobytes to one place. Locale-free (AD-1).
 *  `ponytail:` "1 bytes" for a one-byte file, which no `routes.yaml` is. */
export const sizeLabel = (bytes: number): string => (bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`)

/** The file's byte length, as Ghost stores it (UTF-8). */
export const byteLength = (text: string): number => utf8(text).length

/** The card's download (routine call 10): a `data:` address, so no route is added and nothing new is stored. */
export const downloadHref = (file: string): string => `data:application/yaml;charset=utf-8,${encodeURIComponent(file)}`

/** Is a stored cause one B16 draws — `routes_fallback` is server-written, and this is the reader's guard anyway. */
export const isFallback = (value: unknown): value is RoutesFallback => value === 'no_token' || value === 'revoked' || value === 'role'

/** EVERY SENTENCE B16 SAYS (R-170). The no-token case is the frame's copy verbatim (`B Missing Surfaces.dc.html:1229-1270`);
 *  revoked and role change only the body, the secondary button and the footnote (F3). */
export const ROUTES_FALLBACK_WORDS = {
  title: 'Upload routes.yaml yourself',
  body: {
    no_token:
      "We normally upload this for you. Uploading a routing file needs a Staff Access Token from the site Owner or an Administrator, and this project doesn't have one — so this once you will need to do it by hand. It takes about a minute.",
    revoked:
      "We normally upload this for you, but this site's Staff Access Token has stopped working — so this once you will need to do it by hand. It takes about a minute.",
    role:
      "We normally upload this for you, but this site's Staff Access Token belongs to a staff account that can't write settings. Only an Owner's or an Administrator's token can — so this once you will need to do it by hand. It takes about a minute.",
  },
  download: 'Download the file we generated',
  file: 'routes.yaml',
  find: 'In Ghost, find the routes upload for your version',
  where: 'Show me where ↗',
  verifyStep: 'Come back and press Verify — we check that your collections resolve',
  verify: 'Verify upload',
  verifying: 'Verifying…',
  /** the secondary button per cause — role has none: a token cannot be given a role (F3) */
  button: { no_token: 'Add the token instead', revoked: 'Update the token', role: null },
  footnote: { no_token: 'Adding the token makes this automatic from now on.', revoked: 'Updating the token makes this automatic again.', role: null },
  verified: 'Ghost has your routes.yaml. Your routing is live.',
  notYet: "Ghost doesn't have this file yet. Upload it, then press Verify upload again.",
  unreachable: "We couldn't reach your site to check. Press Verify upload again in a moment.",
} as const
