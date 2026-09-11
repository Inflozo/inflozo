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
import { sql, type Client } from './db.ts'

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
  /**
   * THE BYTES, FOR THE ONE READ THAT IS NOT JSON (Story 3.7). `GET /settings/routes/yaml/` answers
   * YAML, so `body` is null for it — `JSON.parse` fails and the catch below sets it so — and
   * FR-I4's `routes_live_sha256` is a hash OF THE FILE, not of a parse of it. It is no wider a
   * disclosure than `body` already is: both are the same response, and neither is stored (the
   * spine's Logging rule).
   */
  text: string
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

/**
 * One audit row. `detail` is an `AuditDetail` and nothing else can reach that column.
 *
 * `on` IS THE TRANSACTION THE ROW BELONGS TO, and it defaults to the pooled client because the
 * call paths write theirs outside one. DW-76's two writers do NOT: a `credential_change` row is
 * inserted INSIDE the same `begin()` as the write it describes, so a store that rolled back leaves
 * no row claiming it happened. The driver's transaction object is callable exactly as the client
 * is, which is why one parameter covers both.
 */
async function audit(
  row: {
    action: 'vault_decrypt' | 'admin_read' | 'admin_write' | 'credential_change'
    userId?: string | null
    siteId?: string | null
    route: string
    item?: string | null
    outcome: 'ok' | 'denied' | 'error'
    detail: AuditDetail
  },
  on: Client = sql(),
): Promise<void> {
  await on`
    insert into private.credential_audit (action, user_id, site_id, route, allowlist_item, outcome, detail)
    values (${row.action}, ${row.userId ?? null}, ${row.siteId ?? null}, ${row.route},
            ${row.item ?? null}, ${row.outcome}, ${on.json(row.detail)})
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
  const { kid } = parseCredential(args.secret)
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
      // THE ADMIN KEY'S PUBLIC ID HALF, WRITTEN IN THE SAME STATEMENT AS ITS REF (Story 3.6).
      // `parseCredential` above already has it and already refused a key that has none, so the
      // value is in hand and the column can never disagree with the secret behind it. It is NOT a
      // secret -- it rides in the header of every JWT `mintJwt` signs -- and it is what Manage keys
      // masks with and what FR-C8's "Moved domains?" hint matches on. NULL for `staff`, which has
      // no such column and no such use: the token is never matched, only held.
      // A STAFF STORE MUST NOT WIPE THE ADMIN KEY'S ID, which is what `coalesce` below is for:
      // `excluded` carries null for it on that path, so the existing value is KEPT rather than
      // overwritten -- the same rule the two ref columns already follow, where one kind's write
      // never touches the other's.
      const keyId = args.kind === 'admin' ? kid : null
      await tx`
        insert into private.site_credentials
               (site_id, user_id, ${tx(column.ref)}, ${tx(column.rotated)}, admin_key_id)
        values (${args.siteId}, ${args.userId}, ${created.id}, now(), ${keyId})
        on conflict (site_id) do update
          set ${tx(column.ref)} = excluded.${tx(column.ref)}, ${tx(column.rotated)} = now(),
              admin_key_id = coalesce(excluded.admin_key_id, site_credentials.admin_key_id)
      `
      await tx`
        update public.sites
           set credentials_present = credentials_present || jsonb_build_object(${args.kind}::text, true)
         where id = ${args.siteId}
      `
      // DW-76: A KEY GOING IN LEAVES A LINE, and it leaves it INSIDE this transaction. `detail`
      // says which credential and which way and holds nothing else -- `AuditDetail` is the guard.
      await audit(
        {
          action: 'credential_change',
          userId: args.userId,
          siteId: args.siteId,
          route: args.route,
          outcome: 'ok',
          detail: { kind: args.kind, direction: 'in' },
        },
        tx,
      )
      return created.id
    })
    return { ref }
  })
}

/**
 * A KEY COMES OUT. The ref is nulled and the trigger deletes the secret behind it; the rotation
 * stamp records WHEN. The row itself survives — FR-C6, the connection record outlives its
 * credentials.
 *
 * NOTHING RENDERS THAT STAMP YET, and two comments in this file used to say Story 3.6's Manage
 * keys draws it as "Key removed 15 Aug". It does not: the screen states present or absent and
 * offers **Test connection**, and a date beside a credential is the kind of claim the story
 * deliberately left to 3.7's health badge. Corrected rather than left standing (review,
 * 2026-09-09) — a comment describing a screen that was never built is what the next reader
 * trusts.
 *
 * THE SITE MUST BE THE CALLER'S, exactly as `store()` requires — the same clause, for the same
 * reason. A caller proving ownership with its own read and handing the id on is one widened
 * `select` policy away from deleting a stranger's credential, so the guard lives HERE, beside the
 * write, and not in the memory of each caller (review, 2026-09-09).
 *
 * AND `${column.rotated}` IS STAMPED ONLY WHEN A KEY ACTUALLY CAME OUT. The update matches on the
 * row, not on the kind, so without `is not null` removing a kind that was never stored stamped a
 * removal date for a credential that never existed. With it, such a call matches no row and is
 * the no-op two comments already claimed it was (review, 2026-09-09) — and it is also what makes
 * DW-76's audit row conditional, one screen down.
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
      const dropped = await tx`
        update private.site_credentials
           set ${tx(column.ref)} = null, ${tx(column.rotated)} = now()
         where site_id = ${args.siteId} and user_id = ${args.userId}
           and ${tx(column.ref)} is not null
        returning site_id
      `
      await tx`
        update public.sites
           set credentials_present = credentials_present || jsonb_build_object(${args.kind}::text, false)
         where id = ${args.siteId} and user_id = ${args.userId}
      `
      // DW-76's OTHER HALF, and the one the owner ruled into this story: a key coming out leaves a
      // line too. INSIDE the transaction, so a removal that rolled back claims nothing.
      //
      // AND ONLY WHEN ONE ACTUALLY CAME OUT. The update above matches on a ref that is NOT NULL --
      // the guard the review of 2026-09-09 added, because removing a kind that was never stored
      // stamped a removal date for a credential that never existed. An audit row is the same
      // mistake one layer up and worse: `disconnectSite` removes BOTH kinds on every press and
      // most sites hold no staff token (only Manage keys' own Add token stores one, and Epic 7
      // asks for it at first deploy), so an unconditional row would write a false "the staff
      // credential came out" line into the one record that exists to be trusted, on every
      // disconnect, for ever. That is DW-76's own argument against `vault_decrypt`, one table over.
      if (dropped.count > 0) {
        await audit(
          {
            action: 'credential_change',
            userId: args.userId,
            siteId: args.siteId,
            route: args.route,
            outcome: 'ok',
            detail: { kind: args.kind, direction: 'out' },
          },
          tx,
        )
      }
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
  let text = ''

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
    text = await response.text()
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
  return { ok, status, body, text, ...(ok ? {} : { code: ghostCode(status, error) }) }
}


/**
 * FR-C8's "Moved domains?" LOOKUP, and it lives here because `private` is reachable from this
 * module and from nowhere else (§21j, and `server-wiring.test.ts` asserts it).
 *
 * A new connect whose Admin key id matches a record the caller ALREADY HAS is the same Ghost
 * install arriving at a second address -- which is exactly the state FR-C8 designed for by killing
 * edit-URL-in-place: the customer moved domains. The hint is printed on the new card; nothing is
 * written and nothing is refused.
 *
 * `exceptSiteId` IS REQUIRED, and `<>` is why it cannot be optional: the caller stores the key
 * BEFORE it looks, so its own new record carries this very id and would always match itself -- and
 * `site_id <> null` is NULL rather than true, so a defaulted one would answer "no match" every
 * time, silently, with every check green. Scoped to the caller's own rows by `user_id`, so this can never see across
 * accounts -- two customers connecting the same Ghost is not a domain move and is none of either's
 * business.
 *
 * A NULL `admin_key_id` NEVER MATCHES. A record connected before Story 3.6 has none, and the
 * comparison is an equality, so an older record simply produces no hint -- which is the right
 * answer: a missing hint is not a wrong one.
 *
 * A LIVE TWIN OUTRANKS A DISCONNECTED ONE (DW-83, Story 3.9). Where the same Ghost has been
 * connected at three addresses, `created_at desc` alone returned the NEWEST match -- which may be
 * an old disconnected record while a live twin exists, and the two draw DIFFERENT hints: the live
 * one is `?old=live`'s "it is still connected", the disconnected one talks about the 90-day
 * safety-net copy. So the order asks "is it still connected" FIRST and only then "which is
 * newest": a hint about a record the customer can still open beats a hint about one he cannot.
 * `(s.disconnected_at is null) desc` sorts true before false, and `created_at desc` still breaks
 * the tie within each group, so the single-match case -- every case anyone has today -- is
 * unchanged. Proved by the two decoys `moved-domains` now seeds (DW-85 (1) and (2)), which is why
 * the two entries were closed together.
 */
export async function findSiteByAdminKeyId(args: {
  userId: string
  kid: string
  exceptSiteId: string
}): Promise<{ siteId: string; url: string; disconnectedAt: string | null } | null> {
  return withStore('ghost-admin/find-by-key-id', async () => {
    const [row] = await sql()<{ site_id: string; url: string; disconnected_at: string | null }[]>`
      select c.site_id, s.url, s.disconnected_at
        from private.site_credentials c
        join public.sites s on s.id = c.site_id
       where c.user_id = ${args.userId}
         and c.admin_key_id = ${args.kid}
         and c.site_id <> ${args.exceptSiteId}
       order by (s.disconnected_at is null) desc, s.created_at desc
       limit 1
    `
    return row ? { siteId: row.site_id, url: row.url, disconnectedAt: row.disconnected_at } : null
  })
}

/**
 * DW-78 CLOSES HERE — Story 3.7. Every site connected before Story 3.6 has a null `admin_key_id`,
 * so Manage keys draws "Added" with no mask beside it and FR-C8's "Moved domains?" hint can never
 * fire for that record. The value is DERIVABLE — it is the half of the stored secret in front of
 * the colon — and the ledger rejected both routes to it that were available then: a backfill inside
 * the migration would have put a `vault.decrypted_secrets` read inside a schema change, and a lazy
 * fill on the next `call()` would have put a WRITE on the read path of every Ghost call.
 *
 * THE DAILY CHECK IS THE THIRD ROUTE AND IT COSTS NOTHING: it visits every site's credentials once
 * a day anyway. So this is called once per site per check, and it is a no-op — one indexed
 * primary-key update matching nothing — on every record that already has the column filled.
 *
 * IT IS ONE STATEMENT, IN SQL, AND THE SECRET NEVER ENTERS NODE. `split_part(secret, ':', 1)` runs
 * inside the database, so the decrypted value exists only between `vault.decrypted_secrets` and the
 * column beside it — narrower than `decrypt()` above, which hands the whole credential to
 * `mintJwt`. The audit row rides the same statement as a CTE, exactly as `decrypt()`'s does, so a
 * Vault read here can no more go unrecorded than one on the call path.
 *
 * `where admin_key_id is null` IS THE WHOLE GUARD. It can never overwrite a mask that disagrees
 * with its secret, and it can never write one for `staff`, which has no such column and no such
 * use. Scoped to the caller's own row by `user_id`, the clause every write in this file carries.
 */
export async function backfillAdminKeyId(args: {
  siteId: string
  userId: string
  route: string
}): Promise<{ filled: boolean }> {
  return withStore(args.route, async () => {
    const client = sql()
    const rows = await client<{ admin_key_id: string }[]>`
      with filled as (
        update private.site_credentials c
           set admin_key_id = split_part(v.decrypted_secret, ':', 1)
          from vault.decrypted_secrets v
         where c.site_id = ${args.siteId} and c.user_id = ${args.userId}
           -- a secret with no colon has no id half, and split_part would answer the WHOLE secret
           -- into a non-secret column; store() refuses such a key, this refuses it again (review)
           and position(':' in v.decrypted_secret) > 0
           and c.admin_key_id is null
           and v.id = c.admin_key_vault_ref
        returning c.user_id, c.admin_key_id
      ), logged as (
        insert into private.credential_audit (action, user_id, site_id, route, outcome, detail)
        select 'vault_decrypt', user_id, ${args.siteId}, ${args.route}, 'ok', '{}'::jsonb
        from filled
      )
      select admin_key_id from filled
    `
    return { filled: rows.length > 0 }
  })
}

/**
 * WHAT MANAGE KEYS MAY DRAW, AND IT IS ONE NON-SECRET COLUMN OF THE CREDENTIALS ROW. The Vault refs
 * are not here and neither is any decryption: `decrypt()` above is the only thing in this file that
 * reads `vault.decrypted_secrets`, and it is private. What comes back is the Admin key's public id
 * half -- a value a customer can read off their own Ghost Admin, which is precisely the test for
 * whether something may leave here.
 *
 * IT RETURNED THE TWO ROTATION STAMPS AS WELL AND THE SCREEN DREW NEITHER. Data that crosses the
 * chokepoint for no drawn purpose is exactly what this boundary exists to refuse, and the story
 * that wants "Key removed 15 Aug" can widen it then, with a reason (review, 2026-09-09).
 *
 * IT IS THE FIFTH CHANGE THIS STORY MAKES TO THIS FILE, and the spec's Code Map counts four --
 * but its own entry for `sites/keys/page.tsx` says that page reads "the credential row through
 * `ghost-admin`", which is this. The count was about not WIDENING the chokepoint, and this does
 * not: the secret half still exists only between `decrypt()` and `mintJwt`. Recorded rather than
 * quietly added (standing rule 3).
 *
 * SCOPED TO THE CALLER'S OWN ROW by `user_id`, the same clause `store()` and `remove()` carry and
 * for the same reason: ownership belongs beside the read, not in the memory of the caller.
 */
export async function credentialsOf(args: {
  siteId: string
  userId: string
}): Promise<{ adminKeyId: string | null }> {
  return withStore('ghost-admin/credentials-of', async () => {
    const [row] = await sql()<{ admin_key_id: string | null }[]>`
      select admin_key_id
        from private.site_credentials
       where site_id = ${args.siteId} and user_id = ${args.userId}
    `
    // A SITE WITH NO CREDENTIALS ROW IS NOT AN ERROR -- it is a record whose keys have been taken
    // out, or one seeded without any. The screen draws "Not added" from `credentials_present`, and
    // this is the decoration beside it.
    return { adminKeyId: row?.admin_key_id ?? null }
  })
}
