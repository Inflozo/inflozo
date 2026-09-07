import { z } from 'zod'
import { authorized } from '@/app/api/cron/purge-accounts/purge-rule'
import { call, remove, store, type CredentialKind } from '@/server/ghost-admin'
import { AdminError } from '@/server/ghost-admin/admin-rule'
import { auditRows, grants, secretExists } from '@/server/ghost-admin/verify-queries'

/**
 * E3 · FR-C3 · AD-7 · AD-10 · DW-48 — THE DEPLOYED PROOF, AND NOTHING ELSE.
 *
 * Story 3.1 builds a module with no product caller: the connect wizard that stores a key is 3.2.
 * R-82 says the round trip is executed on the real infrastructure, and the parts that can only be
 * executed THERE are exactly the parts a laptop cannot reach — the Vercel function's hop to the
 * transaction pooler, `vault.create_secret` on the live project, and the trigger firing under
 * GoTrue's cascade. This machine's sandbox refuses direct writes to the live database
 * (spec-2-5:583), so a bearer-gated route driven from here is the one way to run any of it.
 *
 * IT IS VERIFICATION SCAFFOLDING AND STORY 3.2 DELETES IT (DW-48). One of its ops stores a
 * credential for a caller-supplied `site_id`, which is not a surface this product should carry a
 * day longer than the proof needs. `server-wiring.test.ts` names it as the module's only importer
 * with that reason; when the connect action becomes the caller, the harness retargets and this
 * file goes.
 *
 * THE BEARER IS THE FIRST STATEMENT, as in the purge cron: `authorized()` from `purge-rule.ts`
 * over `CRON_SECRET`, `timingSafeEqual` after a length check, and an UNSET secret is a 401 too.
 * Nothing below it runs for a caller without the header — no database read, no Ghost call.
 *
 * NO SECRET COMES BACK. Every op answers refs, counts, statuses and audit rows; the one field
 * lifted out of a Ghost response body is `config.version`, which is what the harness asserts and
 * is not a credential. The harness re-checks that no response anywhere contains a `kid:secret`.
 */

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

const uuid = z.string().uuid()
const kind = z.enum(['admin', 'staff'])

const Body = z.discriminatedUnion('op', [
  // Is this connection the one that can decrypt, and may it delete a secret? The first execution
  // of "the Vercel function reaches the pooler", which is a HYPOTHESIS until this answers.
  z.object({ op: z.literal('grants') }),
  z.object({ op: z.literal('store'), siteId: uuid, userId: uuid, kind, secret: z.string().min(1) }),
  z.object({ op: z.literal('remove'), siteId: uuid, kind }),
  z.object({
    op: z.literal('call'),
    siteId: uuid,
    method: z.string().default('GET'),
    path: z.string().min(1),
    body: z.unknown().optional(),
    item: z.string().optional(),
  }),
  z.object({ op: z.literal('audit'), siteId: uuid }),
  z.object({ op: z.literal('secret-exists'), ref: uuid }),
])

/** The AD-24 envelope, and only ever that: a thrown driver error never reaches the caller. */
function envelope(thrown: unknown) {
  if (thrown instanceof AdminError) {
    return { code: thrown.code, message: thrown.message, detail: thrown.detail, action: thrown.action }
  }
  const e = (thrown ?? {}) as { name?: string }
  console.error('ghost-admin: verify failed', { name: e.name })
  return { code: 'verify_failed', message: 'The verify route could not complete that op.' }
}

export async function POST(request: Request) {
  // BEFORE ANY OTHER STATEMENT. An unset CRON_SECRET is a 401 too (`purge-rule.ts`).
  if (!authorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401, headers: NO_STORE })
  }

  const parsed = Body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ code: 'bad_request' }, { status: 400, headers: NO_STORE })
  }
  const input = parsed.data
  const route = 'api/ghost-admin/verify'

  try {
    switch (input.op) {
      case 'grants': {
        const [row] = await grants()
        return Response.json(row, { headers: NO_STORE })
      }
      case 'store': {
        const { ref } = await store({
          siteId: input.siteId,
          userId: input.userId,
          kind: input.kind as CredentialKind,
          secret: input.secret,
          route,
        })
        return Response.json({ ref }, { headers: NO_STORE })
      }
      case 'remove': {
        await remove({ siteId: input.siteId, kind: input.kind as CredentialKind, route })
        return Response.json({ removed: true }, { headers: NO_STORE })
      }
      case 'call': {
        const result = await call({
          siteId: input.siteId,
          method: input.method,
          path: input.path,
          body: input.body,
          item: input.item as never,
          route,
        })
        // STATUSES AND ONE FIELD. `config.version` is what 3.2's version floor reads and what the
        // harness asserts; the rest of the body is discarded here rather than echoed.
        const version = (result.body as { config?: { version?: string } })?.config?.version
        return Response.json(
          { ok: result.ok, status: result.status, code: result.code, version },
          { headers: NO_STORE },
        )
      }
      case 'audit': {
        // `detail` is included on purpose: it is the column that must NEVER hold a secret, so the
        // harness reads it rather than trusting the type that builds it.
        const rows = await auditRows(input.siteId)
        return Response.json({ rows }, { headers: NO_STORE })
      }
      case 'secret-exists': {
        return Response.json({ exists: await secretExists(input.ref) }, { headers: NO_STORE })
      }
    }
  } catch (thrown) {
    return Response.json(envelope(thrown), { status: 500, headers: NO_STORE })
  }
}
