import { sql } from './db.ts'

/**
 * DW-48 — THE VERIFY ROUTE'S THREE READS, AND THEY LIVE HERE FOR ONE REASON: no `apps/web` source
 * outside this directory may write SQL naming `vault.` or either `private` table, and
 * `server-wiring.test.ts` reads that out of the tree (it caught this file's contents sitting in
 * the route, 2026-09-07). Every one of them is verification scaffolding, and Story 3.2 deletes
 * this file with the route that calls it.
 *
 * All three are READS. Nothing here decrypts and nothing here returns a secret: a role name, a
 * privilege bit, audit rows whose `detail` may never hold a credential, and a count.
 */

/** Is this connection the one that can decrypt, and may it delete a secret? (§21j, executed.) */
export function grants() {
  return sql()<{ who: string; may_delete: boolean }[]>`
    select current_user as who,
           has_table_privilege(current_user, 'vault.secrets', 'DELETE') as may_delete
  `
}

/** The site's audit trail, `detail` included — the column that must never hold a credential. */
export function auditRows(siteId: string) {
  return sql()`
    select action::text, route, allowlist_item, outcome, detail, occurred_at
      from private.credential_audit
     where site_id = ${siteId}
     order by occurred_at, id
  `
}

/** Whether a Vault secret is still there — how the harness watches the trigger take one away. */
export async function secretExists(ref: string): Promise<boolean> {
  const [row] = await sql()<{ n: number }[]>`
    select count(*)::int as n from vault.secrets where id = ${ref}
  `
  return row.n > 0
}
