import { STAFF_ROLES_OK, staffRoleOf } from '../lib/connect-rule.ts'
import { fetchWithKey, store } from './ghost-admin/index.ts'
import { AdminError, ghostError, parseCredential } from './ghost-admin/admin-rule.ts'

/**
 * STORY 7.19 — THE ONE CHECK A PASTED STAFF ACCESS TOKEN PASSES BEFORE IT IS KEPT (R-280, FR-C1, FR-C8), for its two callers:
 * the first deploy's Safety net (`addSafetyToken`, `(editor)/actions.ts`) and Manage keys (`saveKeys`, `sites/actions.ts`) —
 * one rule, one set of sentences (R-170).
 *
 * THE ORDER, and nothing is written before its last step:
 *   1. the token parses (`parseCredential`): empty is `token_empty`, not `id:hex` is `token_malformed` — Ghost is not asked;
 *   2. ONE `GET users/me/?include=roles`, signed with the token IN HAND (`fetchWithKey`, Story 3.2's path for a key not yet
 *      stored), its audit row carrying the site and the user. A GET, so `permitted()` passes it and `ADMIN_WRITES` stays four;
 *   3. a 401 is `token_unknown` — an unknown key, a bad signature, a regenerated token and another site's all answer it (R-100)
 *      — and a 404 `NotFoundError` is `token_integration`: an integration's Admin API key has no user behind it, so `me` stays
 *      literal and `findOne` finds nobody (read in source, both majors; executed on T1 by `record-staff-token.mjs`, §88);
 *   4. a role outside `STAFF_ROLES_OK` is `token_role`, carrying Ghost's own name (`staffRoleOf`; an unknown name reads below);
 *   5. any other refusal is the chokepoint's code (`ghost_refused` with its status, `ghost_unavailable`, `ghost_redirected`), and
 *      a thrown `AdminError` passes through by its code (`ghost_unreachable`, `credential_store_unavailable`, …);
 *   6. only then `store({ kind: 'staff' })`: Vault, `credentials_present.staff` and the `credential_change` row, one transaction.
 *
 * A TOKEN THAT FAILS IS NEVER STORED — no Vault secret, no flag, no `credential_change` row — and THE TOKEN NEVER REACHES A LOG:
 * it is handed to the chokepoint and to nothing else here. `io` is handed in so `staff-token.test.ts` runs every row over an
 * injected fetch and store; the real one is the chokepoint's, which is why this file is on `server-wiring.test.ts`' list.
 */

export type StaffTokenIo = { fetchWithKey: typeof fetchWithKey; store: typeof store }
const REAL: StaffTokenIo = { fetchWithKey, store }

export type StaffTokenAnswer = { ok: true } | { ok: false; code: string; role?: string; status?: number }

/** The read, as `fetchWithKey` is asked it — exported so the T1 recorder and the tests send the same path. */
export const USERS_ME = 'users/me/?include=roles'

export async function addStaffToken(
  args: { siteId: string; userId: string; url: string; version: string | null; token: string; route: string },
  io: StaffTokenIo = REAL,
): Promise<StaffTokenAnswer> {
  const token = args.token.trim()
  if (token === '') return { ok: false, code: 'token_empty' }
  try {
    parseCredential(token)
  } catch {
    return { ok: false, code: 'token_malformed' }
  }
  const major = /^(\d+)\./.exec(args.version ?? '')
  let answer: Awaited<ReturnType<typeof fetchWithKey>>
  try {
    answer = await io.fetchWithKey({
      credential: token,
      siteUrl: args.url,
      path: USERS_ME,
      route: args.route,
      siteId: args.siteId,
      userId: args.userId,
      ...(major ? { major: Number(major[1]) } : {}),
    })
  } catch (thrown) {
    if (thrown instanceof AdminError) return { ok: false, code: thrown.code }
    throw thrown
  }
  if (!answer.ok) {
    if (answer.status === 401) return { ok: false, code: 'token_unknown' }
    if (answer.status === 404 && ghostError(answer.body)?.type === 'NotFoundError') return { ok: false, code: 'token_integration' }
    const code = answer.code ?? 'ghost_refused'
    return { ok: false, code, ...(code === 'ghost_refused' ? { status: answer.status } : {}) }
  }
  const role = staffRoleOf(answer.body)
  // ponytail: a 200 with no role name reads as below Administrator — the body Ghost never sends is refused, never kept
  if (role === null || !STAFF_ROLES_OK.includes(role)) return { ok: false, code: 'token_role', ...(role === null ? {} : { role }) }
  try {
    await io.store({ siteId: args.siteId, userId: args.userId, kind: 'staff', secret: token, route: args.route })
  } catch (thrown) {
    if (thrown instanceof AdminError) return { ok: false, code: thrown.code === 'credential_malformed' ? 'token_malformed' : thrown.code }
    throw thrown
  }
  return { ok: true }
}
