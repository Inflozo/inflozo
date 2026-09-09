import {
  AdminError,
  type AllowlistItem,
  type AuditDetail,
  adminUrl,
  ghostCode,
  ghostError,
  headers,
  majorOf,
  mintJwt,
  parseCredential,
  permitted,
} from './admin-rule.ts'
import { sql } from './db.ts'

/**
 * THE CHOKEPOINT (AD-10). Every Ghost Admin API call Inflozo makes goes through `call` or
 * `fetchWithKey`, and every Vault secret is written by `store` and cleared by `remove`. There is
 * no third path: no Admin call from a browser and no generic proxy endpoint — callers are server
 * actions and routes, and this module is a library they import. `server-wiring.test.ts` keeps the
 * importer list to the ones named there with a reason.
 *
 * WHAT NEVER LEAVES THIS FILE: the decrypted secret. It exists for the milliseconds between the
 * `select` below and the HMAC in `mintJwt`, and it reaches no log line, no thrown envelope, no
 * audit row and no response body. Ghost's own error carries at most its `errors[0].type`.
 *
 * WHAT ALWAYS LEAVES IT: an audit row, per decryption and per call. AD-10 F10 — the audit log is
 * the only control here that DETECTS rather than prevents, and the pre-mortem's answer to "how
 * long before anyone noticed" without it was "until a customer asked why their subscribers were
 * getting spam".
 */

export type CredentialKind = 'admin' | 'staff'

/**
 * THE TWO VAULT-HELD KINDS AND THEIR COLUMNS. `sites.content_key` is deliberately NOT here: the
 * Content API key is browser-safe by Ghost's design and is delivered to the client on purpose
 * (FR-C3), so it stays a plain column under the owner's own SELECT and never enters Vault.
 * The column names come from this literal and never from a caller.
 */
const COLUMNS: Record<CredentialKind, { ref: string; rotated: string }> = {
  admin: { ref: 'admin_key_vault_ref', rotated: 'admin_key_rotated_at' },
  staff: { ref: 'staff_token_vault_ref', rotated: 'staff_token_rotated_at' },
}

/** What one Admin API call answers with. Ghost's refusal is a RESULT, not a thrown error. */
export interface CallResult {
  ok: boolean
  status: number
  body: unknown
  code?: string
}

const TIMEOUT_MS = 15_000

/**
 * ANY FAILURE OF THE STORE IS ONE CODE, and it is never a 200. A refused pooler connection, a
 * missing variable, a permission error on `vault.*` — the caller must be able to tell "we could
 * not reach the credential" apart from "Ghost said no", because only the second is the user's to
 * fix. The driver's error carries its own text and this is where it stops.
 */
async function withStore<T>(route: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (thrown) {
    if (thrown instanceof AdminError) throw thrown
    const e = (thrown ?? {}) as { code?: string; name?: string }
    console.error('ghost-admin: credential store refused', { code: e.code ?? e.name })
    throw new AdminError({
      code: 'credential_store_unavailable',
      message: 'The credential store could not be reached.',
      detail: route,
    })
  }
}

/** One audit row. `detail` is an `AuditDetail` and nothing else can reach that column. */
async function audit(row: {
  action: 'vault_decrypt' | 'admin_read' | 'admin_write'
  userId?: string | null
  siteId?: string | null
  route: string
  item?: string | null
  outcome: 'ok' | 'denied' | 'error'
  detail: AuditDetail
}): Promise<void> {
  await sql()`
    insert into private.credential_audit (action, user_id, site_id, route, allowlist_item, outcome, detail)
    values (${row.action}, ${row.userId ?? null}, ${row.siteId ?? null}, ${row.route},
            ${row.item ?? null}, ${row.outcome}, ${sql().json(row.detail)})
  `
}

/**
 * A KEY GOES IN (AD-7). One transaction: the secret into Vault, its uuid onto the credentials
 * row, and the client-visible `credentials_present` flag flipped — three statements that must not
 * be able to half-happen, or a site claims a key it has not got.
 *
 * NO NAME on the secret. `vault.secrets.name` is UNIQUE, and a rotation would collide with the
 * key it replaces; the description carries the site and kind instead, which is what a human reads
 * in the dashboard. The OLD secret is deleted by `private.drop_vault_secrets()` on the update —
 * DW-44 — so no caller has to remember Vault.
 */
export async function store(args: {
  siteId: string
  userId: string
  kind: CredentialKind
  secret: string
  route: string
}): Promise<{ ref: string }> {
  const column = COLUMNS[args.kind]
  // REFUSED BEFORE VAULT: a credential that cannot sign is a typo, and a typo stored in Vault
  // would come back out as `ghost_unreachable` on every call (found by the review, 2026-09-07).
  parseCredential(args.secret)
  return withStore(args.route, async () => {
    const ref = await sql().begin(async (tx) => {
      // THE SITE MUST BE THE CALLER'S. `user_id` on the credentials row is what the audit trail
      // and the purge cascade key on, so it is checked against `sites` rather than taken on
      // trust from a caller (review, 2026-09-07).
      const [site] = await tx<{ id: string }[]>`
        select id from public.sites where id = ${args.siteId} and user_id = ${args.userId}
      `
      if (!site) {
        throw new AdminError({ code: 'site_not_found', message: 'That site is not one of yours.' })
      }
      const [created] = await tx<{ id: string }[]>`
        select vault.create_secret(${args.secret}, null, ${`site ${args.siteId} ${args.kind}`}) as id
      `
      await tx`
        insert into private.site_credentials (site_id, user_id, ${tx(column.ref)}, ${tx(column.rotated)})
        values (${args.siteId}, ${args.userId}, ${created.id}, now())
        on conflict (site_id) do update
          set ${tx(column.ref)} = excluded.${tx(column.ref)}, ${tx(column.rotated)} = now()
      `
      await tx`
        update public.sites
           set credentials_present = credentials_present || jsonb_build_object(${args.kind}::text, true)
         where id = ${args.siteId}
      `
      return created.id
    })
    return { ref }
  })
}

/**
 * A KEY COMES OUT. The ref is nulled and the trigger deletes the secret behind it; the rotation
 * stamp records WHEN, which is what "Key removed 15 Aug" on Manage keys reads (Story 3.6). The
 * row itself survives — FR-C6, the connection record outlives its credentials.
 *
 * THE SITE MUST BE THE CALLER'S, exactly as `store()` requires — the same clause, for the same
 * reason. A caller proving ownership with its own read and handing the id on is one widened
 * `select` policy away from deleting a stranger's credential, so the guard lives HERE, beside the
 * write, and not in the memory of each caller (review, 2026-09-09).
 *
 * AND `${column.rotated}` IS STAMPED ONLY WHEN A KEY ACTUALLY CAME OUT. The update matches on the
 * row, not on the kind, so without `is not null` removing a kind that was never stored stamped a
 * removal date for a credential that never existed — and Story 3.6's Manage keys renders that
 * column as "Key removed 15 Aug". With it, such a call matches no row and is the no-op two
 * comments already claimed it was (review, 2026-09-09).
 */
export async function remove(args: {
  siteId: string
  userId: string
  kind: CredentialKind
  route: string
}): Promise<void> {
  const column = COLUMNS[args.kind]
  await withStore(args.route, async () => {
    await sql().begin(async (tx) => {
      await tx`
        update private.site_credentials
           set ${tx(column.ref)} = null, ${tx(column.rotated)} = now()
         where site_id = ${args.siteId} and user_id = ${args.userId}
           and ${tx(column.ref)} is not null
      `
      await tx`
        update public.sites
           set credentials_present = credentials_present || jsonb_build_object(${args.kind}::text, false)
         where id = ${args.siteId} and user_id = ${args.userId}
      `
    })
  })
}

/**
 * DECRYPT AND LOG IN ONE STATEMENT, so a decryption can never go unrecorded: the audit insert is
 * a CTE over the same read, not a second call that an early return or a thrown error could skip.
 * A missing credentials row and a null ref are the same answer — no secret — and both write the
 * `error` row (hence the LEFT joins: an inner join on `site_credentials` wrote nothing for a
 * site that never had a key — found by the review, 2026-09-07). A site that does not exist at
 * all has no `user_id` to attribute a row to, and writes none.
 */
async function decrypt(siteId: string, kind: CredentialKind, route: string) {
  const column = COLUMNS[kind]
  const client = sql()
  const [row] = await client<
    { url: string; ghost_version: string | null; user_id: string; decrypted_secret: string | null }[]
  >`
    with cred as (
      select s.url, s.ghost_version, s.user_id, v.decrypted_secret
      from public.sites s
      left join private.site_credentials c on c.site_id = s.id
      left join vault.decrypted_secrets v on v.id = c.${client(column.ref)}
      where s.id = ${siteId}
    ), logged as (
      insert into private.credential_audit (action, user_id, site_id, route, outcome, detail)
      select 'vault_decrypt', user_id, ${siteId}, ${route},
             case when decrypted_secret is null then 'error' else 'ok' end,
             case when decrypted_secret is null then '{"reason":"missing"}'::jsonb else '{}'::jsonb end
      from cred
    )
    select url, ghost_version, user_id, decrypted_secret from cred
  `
  return row
}

/**
 * THE CALL. Decrypt (and log it) → the allowlist → mint → fetch → log the outcome. A write that
 * the allowlist does not admit never reaches the network: it is a `denied` row and a thrown
 * envelope, which is the difference between "Inflozo may do four things to your Ghost" being a
 * promise and being a sentence in a document.
 */
export async function call(args: {
  siteId: string
  method?: string
  path: string
  body?: unknown
  item?: AllowlistItem
  route: string
}): Promise<CallResult> {
  const row = await withStore(args.route, () => decrypt(args.siteId, 'admin', args.route))
  if (!row?.decrypted_secret) {
    throw new AdminError({
      code: 'credential_missing',
      message: 'This site has no Admin API key stored.',
      action: 'Add the key again from Manage keys.',
    })
  }
  return fetchWithKey({
    credential: row.decrypted_secret,
    siteUrl: row.url,
    major: majorOf(row.ghost_version),
    siteId: args.siteId,
    userId: row.user_id,
    method: args.method,
    path: args.path,
    body: args.body,
    item: args.item,
    route: args.route,
  })
}

/**
 * THE SAME CALL WITH THE KEY IN HAND, which is what Story 3.2 needs: connect validates a key the
 * user has just typed, against a site that has no row yet — so `site_id` is null on its audit row
 * and the row is still written. `call` is this function with a decryption in front of it.
 */
export async function fetchWithKey(args: {
  credential: string
  siteUrl: string
  method?: string
  path: string
  body?: unknown
  item?: AllowlistItem
  route: string
  major?: number
  siteId?: string | null
  userId?: string | null
}): Promise<CallResult> {
  const method = (args.method ?? 'GET').toUpperCase()
  const action = method === 'GET' ? 'admin_read' : 'admin_write'
  const common = {
    userId: args.userId ?? null,
    siteId: args.siteId ?? null,
    route: args.route,
    item: args.item ?? null,
  }

  if (!permitted(method, args.path, args.body, args.item)) {
    await withStore(args.route, () =>
      audit({ ...common, action: 'admin_write', outcome: 'denied', detail: { ms: 0 } }),
    )
    throw new AdminError({
      code: 'write_not_allowed',
      message: 'Inflozo is not allowed to make that change to your Ghost site.',
      detail: `${method} ${args.path}`,
    })
  }

  const url = adminUrl(args.siteUrl, args.path)
  // MINTED OUTSIDE THE TRY BELOW: a `credential_malformed` must stay its own code. Inside it,
  // the catch would have logged it as "ghost unreachable" and thrown that (review, 2026-09-07).
  const jwt = mintJwt(args.credential)
  // A GET carries no body (fetch throws a TypeError for one, which the catch below would have
  // called "ghost unreachable"), and a redirect is ANSWERED, never followed: the bearer must not
  // be re-sent to wherever a 3xx points (review, 2026-09-07).
  const payload = method === 'GET' || args.body === undefined ? undefined : JSON.stringify(args.body)
  const started = Date.now()
  let status = 0
  let body: unknown

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...headers(jwt, args.major),
        ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: payload,
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    status = response.status
    const text = await response.text()
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = null
    }
  } catch (thrown) {
    // DNS, TLS, a refused connection or the fifteen seconds — one code, because all four are
    // "your Ghost did not answer" and none of them is a credential problem.
    const e = (thrown ?? {}) as { name?: string }
    console.error('ghost-admin: ghost unreachable', { name: e.name })
    await withStore(args.route, () =>
      audit({ ...common, action, outcome: 'error', detail: { ms: Date.now() - started } }),
    )
    throw new AdminError({
      code: 'ghost_unreachable',
      message: 'Your Ghost site did not answer.',
      action: 'Check the site is online and try again.',
    })
  }

  const ok = status >= 200 && status < 300
  const error = ok ? undefined : ghostError(body)
  const detail: AuditDetail = { status, ms: Date.now() - started, ...(error?.type ? { ghost_type: error.type } : {}) }
  await withStore(args.route, () =>
    audit({ ...common, action, outcome: ok ? 'ok' : 'error', detail }),
  )
  // The BODY is returned to the caller and stored nowhere: Story 3.3 computes one boolean from a
  // settings read and discards it (the spine's Logging rule).
  return { ok, status, body, ...(ok ? {} : { code: ghostCode(status, error) }) }
}
