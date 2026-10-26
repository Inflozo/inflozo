import { createHash } from 'node:crypto'
import { parseRoutesConfig, routesYaml, validateRoutes } from '@inflozo/section-runtime/routes'
import {
  bytesEqual, routesAnswer, routesForm, routesToOffer, routesWrite, ROUTES_PATH, type RoutesOutcome, type VerifyOutcome,
} from '../lib/routes-upload.ts'

/**
 * STORY 7.17 — FR-I4's ROUTES STEP, ON THE WIRE: `offerRoutes` uploads the project's `routes.yaml` to the site with its
 * Staff Access Token and reads it back byte for byte, and `verifyRoutes` is B16's **Verify upload**. Story 7.18a's Ship it
 * calls `offerRoutes` after activation, inside AD-19's lock, and opens B16 on a `fallback` (R-254); before 7.18a only the
 * T1 recorder uploads (`record-routes.mjs --upload`). There is no "upload now" control anywhere.
 *
 * IT DECIDES NOTHING. Which file, how Ghost's answer reads and what each outcome writes are `lib/routes-upload.ts`'s pure
 * `routesToOffer`, `routesAnswer` and `routesWrite`; this file reads, calls the chokepoint and writes. `io` is HANDED IN
 * (`site-settings.ts`'s shape): `server/routes-io.ts` is the real one — the service role and the chokepoint's `call` — so
 * this file imports neither, and `routes-upload.test.ts` runs every outcome and the order over a fake.
 *
 * THE SITE AND THE PROJECT MUST BE THE CALLER'S BEFORE GHOST IS ASKED: the service role reads past RLS, so the owned read
 * (`user_id` on both rows, a disconnected site no site) comes first and a refusal makes no call (the rule
 * `rereadSettings` set). The four routes columns are server-asserted (AD-7) — `authenticated` reads them and writes none —
 * so the write is the service role's, scoped by `user_id` the same way.
 *
 * THE ORDER: the stored routing, the project's templates and the site → the routing judged (the file must be the bytes
 * `routesYaml` emits from a config `validateRoutes` accepts — AD-36: never spliced again) → the live file (the staff
 * token when there is one, and the Admin key when there is none or the staff read fails: both may read it, §37) →
 * `routesToOffer` → the upload, `routes_upload`
 * through the chokepoint with the staff token, as `multipart/form-data` (DW-51's transport) → the read-back with the SAME
 * token (FR-I4) → `routesWrite`.
 */

/** What the step reads, already judged as the caller's: the stored routing (`config` `{}` with no row), the project's
 *  Routes Manager files, and the site's staff flag and last offered file. Null when either row is not the caller's. */
export type RoutesRead = {
  config: unknown
  yaml: string | null
  templates: string[]
  staff: boolean
  lastOffered: string | null
}

/** The chokepoint's `call()`, as much of it as the step uses — handed in, so this file never imports the chokepoint. It
 *  throws the chokepoint's `AdminError` (read here by its `code`). */
export type RoutesCall = (args: {
  siteId: string
  method?: string
  path: string
  body?: unknown
  item?: 'routes_upload'
  route: string
  kind?: 'admin' | 'staff'
}) => Promise<{ ok: boolean; status: number; body: unknown; bytes: Uint8Array }>

export type RoutesIo = {
  read: (a: { projectId: string; siteId: string; userId: string }) => Promise<RoutesRead | null>
  readSite: (a: { siteId: string; userId: string }) => Promise<{ lastOffered: string | null } | null>
  call: RoutesCall
  write: (a: { siteId: string; userId: string; patch: Record<string, string | null> }) => Promise<boolean>
  now: () => Date
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

/** The live file's bytes, or null when the read failed or threw — a failed read never blocks an upload (the read-back
 *  decides) and never puts Ghost's default over a file (`routesToOffer`). */
async function readLive(io: Pick<RoutesIo, 'call'>, siteId: string, route: string, kind: 'admin' | 'staff'): Promise<Uint8Array | null> {
  const answer = await liveAnswer(io, siteId, route, kind)
  return 'bytes' in answer ? answer.bytes : null
}
/** …and why it failed: Ghost's status, or no answer at all, or another chokepoint error (by its code) */
async function liveAnswer(io: Pick<RoutesIo, 'call'>, siteId: string, route: string, kind: 'admin' | 'staff'): Promise<{ bytes: Uint8Array } | { status: number } | { thrown: string }> {
  try {
    const answer = await io.call({ siteId, path: ROUTES_PATH, route, kind })
    return answer.ok ? { bytes: answer.bytes } : { status: answer.status }
  } catch (thrown) {
    return { thrown: (thrown as { name?: string; code?: string } | null)?.name === 'AdminError' ? ((thrown as { code?: string }).code ?? 'error') : 'error' }
  }
}

/**
 * STORY 7.20a — THE BACKUP STEP'S `routes.yaml` DOWNLOAD (R-282): the live file, read as `offerRoutes` reads it — with the Staff
 * Access Token when one is stored and the Admin key otherwise, the Admin key also answering a staff read that fails (§37: both
 * may read it, on both majors). It is small, so it is handed to the browser as a file, as B16's download is — not an artefact
 * under AD-13. Answers the bytes, or Ghost's status, or that Ghost did not answer.
 */
export async function liveRoutesFile(io: Pick<RoutesIo, 'call'>, args: { siteId: string; route: string; staff: boolean }): Promise<{ ok: true; bytes: Uint8Array } | { ok: false; status?: number; unreachable?: true }> {
  const staff = args.staff ? await liveAnswer(io, args.siteId, args.route, 'staff') : null
  // a site that did not answer the staff read is not asked again with the Admin key: one wait, never two (the review, 2026-10-26)
  const answer = staff !== null && ('bytes' in staff || ('thrown' in staff && staff.thrown === 'ghost_unreachable')) ? staff : await liveAnswer(io, args.siteId, args.route, 'admin')
  if ('bytes' in answer) return { ok: true, bytes: answer.bytes }
  if ('status' in answer) return { ok: false, status: answer.status }
  return answer.thrown === 'ghost_unreachable' ? { ok: false, unreachable: true } : { ok: false }
}

/** A thrown chokepoint error the step answers itself: no answer is `ghost_unreachable`, a staff token gone from the store
 *  between the read and the call is B16's `no_token`. Anything else (the store, a malformed key, a bad address) is an
 *  infrastructure failure and is thrown on, for 7.18a's job to retry (AD-20). */
function thrownOutcome(thrown: unknown, file: string): RoutesOutcome {
  const code = (thrown as { name?: string; code?: string } | null)?.name === 'AdminError' ? (thrown as { code?: string }).code : undefined
  if (code === 'ghost_unreachable') return { kind: 'failed', code: 'ghost_unreachable' }
  if (code === 'credential_missing') return { kind: 'fallback', cause: 'no_token', file }
  throw thrown
}

/** Ghost's error envelope's first entry — `admin-rule.ts`'s `ghostError`, read here without importing the chokepoint. */
const ghostError = (body: unknown) => {
  const errors = (body as { errors?: unknown } | null)?.errors
  return Array.isArray(errors) ? (errors[0] as { type?: string; message?: string } | undefined) : undefined
}

export async function offerRoutes(
  args: { projectId: string; siteId: string; userId: string; route: string },
  io: RoutesIo,
): Promise<RoutesOutcome> {
  const { siteId, userId, route } = args
  const read = await io.read(args)
  if (read === null) return { kind: 'failed', code: 'site_not_found' }
  // the stored routing judged whole before anything is offered (routine call 7): the config parses, `validateRoutes`
  // accepts it against this project's templates, and the stored file is exactly `routesYaml` of it
  const parsed = parseRoutesConfig(read.config)
  if (!parsed.ok || validateRoutes(read.config, { templates: read.templates }).length > 0) return { kind: 'failed', code: 'routes_invalid' }
  const project = routesYaml(parsed.config)
  if (project !== read.yaml) return { kind: 'failed', code: 'routes_invalid' }

  // the Admin key reads it too (§37), so a staff token that stopped working is not taken for an unreadable site (the
  // Review, 2026-10-18): without it, a file Ghost already holds would be offered and B16 would ask for a hand upload of
  // it, and Inflozo's own file would be `kept` over a project back at the default with no cause stored
  const live = (read.staff ? await readLive(io, siteId, route, 'staff') : null) ?? (await readLive(io, siteId, route, 'admin'))
  const pick = routesToOffer({ project, live, lastOffered: read.lastOffered })

  const settle = async (outcome: RoutesOutcome): Promise<RoutesOutcome> => {
    const patch = routesWrite(outcome, io.now().toISOString())
    // the outcome stands even when its state could not be written: the upload has happened or not either way, and 7.18a
    // opens B16 from what this answers. STORY 7.18a (DW-371 b): a write that throws is caught and logged too, so it never
    // turns a finished upload into a step 7.18a retries
    if (patch === null) return outcome
    let wrote = false
    try {
      wrote = await io.write({ siteId, userId, patch })
    } catch {
      wrote = false
    }
    if (!wrote) console.error('routes-upload: the outcome stands, its state was not written', { code: outcome.kind })
    return outcome
  }
  if (pick.kind === 'kept') return settle(pick)
  if (pick.kind === 'unchanged') return settle({ kind: 'unchanged', file: pick.file, sha256: sha256(pick.file) })
  if (!read.staff) return settle({ kind: 'fallback', cause: 'no_token', file: pick.file })

  let posted
  try {
    posted = await io.call({ siteId, method: 'POST', path: ROUTES_PATH, body: routesForm(pick.file), item: 'routes_upload', route, kind: 'staff' })
  } catch (thrown) {
    const outcome = thrownOutcome(thrown, pick.file)
    return outcome.kind === 'fallback' ? settle(outcome) : outcome
  }
  const answer = routesAnswer(posted.status, ghostError(posted.body)?.type)
  if ('fallback' in answer) return settle({ kind: 'fallback', cause: answer.fallback, file: pick.file })
  if ('failed' in answer) {
    const message = answer.failed === 'ghost_refused' ? ghostError(posted.body)?.message : undefined
    return { kind: 'failed', code: answer.failed, ...(message ? { detail: message } : {}) }
  }

  // the read-back, with the token that uploaded, compared as bytes
  const back = await readLive(io, siteId, route, 'staff')
  // DW-371 (a): Ghost took it; the file is written as last offered, so Verify upload can compare (`routesWrite`)
  if (back === null || !bytesEqual(back, new TextEncoder().encode(pick.file))) return settle({ kind: 'failed', code: 'routes_unverified', file: pick.file })
  return settle({ kind: 'uploaded', file: pick.file, sha256: sha256(pick.file) })
}

/**
 * B16's **Verify upload**: the live file read with the ADMIN key (routine call 4 — the integration key reads `routes.yaml`
 * on both majors, §37, which answers F3's NE-S-1) and compared, as bytes, with the file last offered. Only `verified`
 * writes (the cause cleared, the sha and the time); a read that fails is `unreachable` and never claims success.
 */
export async function verifyRoutes(args: { siteId: string; userId: string; route: string }, io: RoutesIo): Promise<VerifyOutcome> {
  const site = await io.readSite(args)
  if (site === null) return { kind: 'unreachable' }
  if (site.lastOffered === null) return { kind: 'notYet' }
  const live = await readLive(io, args.siteId, args.route, 'admin')
  if (live === null) return { kind: 'unreachable' }
  if (!bytesEqual(live, new TextEncoder().encode(site.lastOffered))) return { kind: 'notYet' }
  const outcome: VerifyOutcome = { kind: 'verified', sha256: sha256(site.lastOffered) }
  const patch = routesWrite(outcome, io.now().toISOString())
  if (patch !== null && !(await io.write({ siteId: args.siteId, userId: args.userId, patch }))) return { kind: 'unreachable' }
  return outcome
}
