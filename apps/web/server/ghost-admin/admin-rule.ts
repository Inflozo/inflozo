import { createHmac } from 'node:crypto'

/**
 * THE ADMIN CHOKEPOINT'S PURE HALF — the mint, the write allowlist, the URL builder and the
 * Ghost-cause map. No `postgres` import, no `fetch`, no environment, so `node --test` reaches
 * every branch of it (`index.ts` beside this file reaches none of them: it needs a pooler
 * connection, a Vault secret and a real Ghost). The shape `purge-rule.ts` set for Story 2.6.
 *
 * AD-10: the Admin API is reached through this directory and nowhere else, and a JWT is minted
 * per request from a secret that lives encrypted until the moment before it signs.
 */

/** AD-24's envelope. `code` is Inflozo's, one row per cause; nothing here ever carries a key. */
export interface AdminEnvelope {
  code: string
  message: string
  detail?: string
  action?: string
}

export class AdminError extends Error implements AdminEnvelope {
  code: string
  detail?: string
  action?: string
  constructor(envelope: AdminEnvelope) {
    super(envelope.message)
    this.name = 'AdminError'
    this.code = envelope.code
    this.detail = envelope.detail
    this.action = envelope.action
  }
}

/**
 * WHAT ONE AUDIT ROW'S `detail` MAY HOLD, and this type is the whole guard: `private
 * .credential_audit.detail` is jsonb and would take a response body, a header or a key just as
 * happily. Every writer in `index.ts` builds its detail as this and nothing else.
 */
// A `type` and not an `interface`, deliberately: only a type alias gets TypeScript's implicit
// index signature, which is what lets it be handed to the driver's `sql.json()` — and `sql.json()`
// is the only shape that stores a jsonb OBJECT. Executed on the live database 2026-09-07:
// `${JSON.stringify(detail)}::jsonb` gives `jsonb_typeof = 'string'`, a JSON string scalar, so
// `detail.status` would have read undefined for ever with every check green.
export type AuditDetail = {
  status?: number
  ms: number
  ghost_type?: string
}

/**
 * A CREDENTIAL IS `kid:secret`, and the secret is HEX. Refused here — before Vault, before the
 * network — because a credential that cannot sign is a user's typo, not a Ghost refusal, and the
 * two must never share an error code (the user is told to check the key, not that Ghost said no).
 */
export function parseCredential(credential: string): { kid: string; secret: string } {
  const parts = (credential ?? '').trim().split(':')
  const [kid, secret] = parts
  if (parts.length !== 2 || !kid || !secret || !/^[0-9a-fA-F]+$/.test(secret) || secret.length % 2) {
    throw new AdminError({
      code: 'credential_malformed',
      message: 'That does not look like a Ghost key.',
      action: 'Copy the whole key from the integration, including the part before the colon.',
    })
  }
  return { kid, secret }
}

/**
 * THE MINT, EXACTLY AS THE PROBE EXECUTES IT (`tools/probe/run-verify-all.py:37-44`, run against
 * T1 6.58.0 and T3 5.130.6). Ghost's own ceiling is five minutes and this asks for all of it;
 * `now` is a parameter so the test can pin `exp - iat` without a clock.
 *
 * The secret is HEX-DECODED before it is used as the HMAC key. Signing over the ASCII of the hex
 * produces a perfectly well-formed JWT that Ghost answers `401 Invalid token: invalid signature`
 * — our bug wearing the user's error (MEASUREMENTS §37).
 */
export function mintJwt(credential: string, now = Date.now()): string {
  const { kid, secret } = parseCredential(credential)
  const b64 = (s: string) => Buffer.from(s).toString('base64url')
  const iat = Math.floor(now / 1000)
  const head = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT', kid }))
  const body = b64(JSON.stringify({ iat, exp: iat + 300, aud: '/admin/' }))
  const sig = createHmac('sha256', Buffer.from(secret, 'hex')).update(`${head}.${body}`).digest('base64url')
  return `${head}.${body}.${sig}`
}

/**
 * P8's WRITE ALLOWLIST, AS A LITERAL. Four items, and the number is a decision the owner made:
 * three further writes were proposed and declined (R-22) because the Ghost credential is
 * all-or-nothing — it reads every member's email address — and every write Inflozo grants itself
 * widens a radius Ghost cannot narrow. A fifth key is an `Ask First`, never a patch.
 *
 * Method and path shapes read at docs.ghost.org/admin-api on 2026-09-07. They are EXECUTED by
 * Epic 7 (theme upload, activate, routes) and Story 3.3 (the announcement clear), not here; what
 * this story executes is the DENIAL — the three ways a `POST posts/` is refused with no network
 * call at all.
 */
export const ADMIN_WRITES = {
  theme_upload: { method: 'POST', path: /^themes\/upload\/?$/ },
  theme_activate: { method: 'PUT', path: /^themes\/[^/]+\/activate\/?$/ },
  routes_upload: { method: 'POST', path: /^settings\/routes\/yaml\/?$/ },
  announcement_clear: {
    method: 'PUT',
    path: /^settings\/?$/,
    keys: ['announcement_content', 'announcement_visibility', 'announcement_background'],
  },
} as const

export type AllowlistItem = keyof typeof ADMIN_WRITES

/**
 * WHICH SETTINGS KEYS A BODY NAMES. Ghost's `PUT settings/` takes `{ settings: [{ key, value }] }`;
 * a caller that passes the flat object instead must not slip past the guard by having no
 * `settings` array, so both shapes are read.
 */
function keysNamed(body: unknown): string[] {
  const payload = (body ?? {}) as { settings?: unknown }
  if (Array.isArray(payload.settings)) {
    return payload.settings.map((s) => String((s as { key?: unknown })?.key ?? ''))
  }
  return Object.keys(payload as object)
}

/**
 * THE MEMBERSHIP TEST. A `GET` never needs an item — reads are what the credential is for. Any
 * other method must NAME an item and match its method, its path and, where it has one, its body
 * guard. Anything else is false, and `call` turns that into a `denied` audit row and no request.
 */
export function permitted(method: string, path: string, body: unknown, item?: string): boolean {
  if (method.toUpperCase() === 'GET') return true
  if (!item || !Object.prototype.hasOwnProperty.call(ADMIN_WRITES, item)) return false
  const rule = ADMIN_WRITES[item as AllowlistItem] as {
    method: string
    path: RegExp
    keys?: readonly string[]
  }
  if (rule.method !== method.toUpperCase()) return false
  if (!rule.path.test(path.replace(/^\/+/, ''))) return false
  if (!rule.keys) return true
  const named = keysNamed(body)
  return named.length > 0 && named.every((key) => rule.keys!.includes(key))
}

/**
 * `/ghost/api/admin/` OR NOTHING (P5: the Content API is the browser's path, never the server's).
 * Resolved with `URL` rather than concatenated, and the result is checked against the base — one
 * comparison that refuses a traversal (`../content/posts/`), an absolute path and a whole other
 * origin alike, none of which a string join would have caught.
 */
export function adminUrl(siteUrl: string, path: string): string {
  const base = new URL('/ghost/api/admin/', siteUrl)
  const relative = path.replace(/^\/+/, '')
  const url = new URL(relative, base)
  // The prefix check refuses a traversal, an absolute path and another origin. The second
  // refuses a path that RE-ENTERS the API root: `/ghost/api/content/settings/` resolves inside
  // the admin base and would still put `/content/` in the URL (found by the test, 2026-09-07).
  if (!url.href.startsWith(base.href) || /(^|\/)ghost\/api\//.test(relative)) {
    throw new AdminError({
      code: 'path_not_admin',
      message: 'That is not an Admin API path.',
      detail: path,
    })
  }
  return url.href
}

/** The major from `sites.ghost_version` ('6.58.0' -> 6), or undefined while it is unknown. */
export function majorOf(version: string | null | undefined): number | undefined {
  const found = /^(\d+)\./.exec(version ?? '')
  return found ? Number(found[1]) : undefined
}

/**
 * `Accept-Version` ONLY WHEN THE VERSION IS KNOWN. Story 3.2 validates a key before any version
 * exists, and both majors answer `GET config/` 200 with no version header at all — executed by
 * this story's harness on T1 and T3 rather than assumed.
 */
export function headers(jwt: string, major?: number): Record<string, string> {
  return {
    Authorization: `Ghost ${jwt}`,
    ...(major ? { 'Accept-Version': `v${major}.0` } : {}),
  }
}

/**
 * GHOST'S CAUSES, ONE ROW PER CODE (AD-24, MEASUREMENTS §37 — executed on both majors).
 *
 * "Your Admin key expired" is a failure that DOES NOT EXIST: `api_keys` has no expiry column and
 * the docs offer regeneration, so a 401 is either the key being regenerated or its integration
 * deleted (`Unknown Admin API Key`), or Inflozo mis-signing the JWT (`Invalid token`) — which is
 * our bug and must never be shown to the user as theirs.
 */
export function ghostCode(status: number, error?: { type?: string; code?: string; message?: string }): string {
  if (status !== 401) return 'ghost_refused'
  if (error?.code === 'UNKNOWN_ADMIN_API_KEY' || /unknown admin api key/i.test(error?.message ?? '')) {
    return 'ghost_unknown_key'
  }
  if (/invalid token/i.test(error?.message ?? '')) return 'ghost_bad_signature'
  return 'ghost_unauthorized'
}

/** Ghost's error envelope is `{ errors: [{ message, type, code }] }`; only `type` is ever kept. */
export function ghostError(body: unknown): { type?: string; code?: string; message?: string } | undefined {
  const errors = (body as { errors?: unknown })?.errors
  return Array.isArray(errors) ? (errors[0] as { type?: string; code?: string; message?: string }) : undefined
}
