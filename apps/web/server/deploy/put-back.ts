import { snapshotObjectKey } from '../../app/(app)/app/(authed)/account/deletion-rule.ts'
import { hostOf } from '../../lib/connect-rule.ts'
import { activateAnswer, deployError, themeNotHeld, uploadAnswer, versionNumber, type DeployCode, type DeployError } from '../../lib/deploy.ts'
import { causeShown, historyCopyPath, type ContentManifest, type DriftRecord } from '../../lib/drift.ts'
import { actionOf, HISTORY_WORDS, isStoredVersion } from '../../lib/retention.ts'
import { compareLive, sendActivate, sendUpload, STALLED_MS, twice, type Called, type DeployIo } from './run.ts'

/**
 * STORY 7.23a — PUT A STORED VERSION BACK ON ITS SITE (FR-J9, FR-J8's D2d row). The History drawer's Roll back and Re-activate are
 * this one function, over an `io` handed in — `run.ts`' pattern, so this file imports neither the service role nor the chokepoint
 * and `put-back.test.ts` runs every row over a fake; `put-back-io.ts` is the real one.
 *
 * ONE ACTION. Who may act, and with what, is `lib/retention.ts`' `actionOf`, decided again here from this request's own reads (the
 * client's choice is never trusted): RE-ACTIVATE when Ghost already holds this version's files — it is the newest upload Ghost
 * accepted for this project × site — sends `PUT themes/{name}/activate/` alone; ROLL BACK uploads the stored zip again under the
 * site's frozen name, exactly as Ship it does (`sendUpload`, `sendActivate`, `uploadAnswer`, `activateAnswer` — the same requests and
 * the same reading of Ghost's answers). Ghost makes an upload under the ACTIVE name live at once (R-264), so an answer saying
 * `active` needs no activation; an upload under an inactive name is followed by one.
 *
 * WHAT IT NEVER TOUCHES (FR-J9, FR-L3, FR-J13): the working document, the edit lock, the plan and Inflozo's gscan gate. A stored
 * artefact already ran, so it needs none of them — rollback is exempt from the Pro exit gating, and from the lock. Nor
 * `routes.yaml`: a route whose template the old version lacks renders its default template (`templates.js:191`, 6.58.0), and the
 * old routes would undo collections the customer still wants (FR-I4) — so nothing beyond upload and activate reaches Ghost
 * (AD-10's list).
 *
 * THE ROW IS UPDATED, NEVER COPIED (Design Notes). The version's own `deploys` row records what Ghost did: an accepted upload stamps
 * `accepted_at` (DW-400 — the list, the prune and the drift baseline order by it, R-287), live is `live` + `activated` +
 * `activated_at` with the site's other live rows demoted, an upload left not live is `uploaded` (D2d's row). Ghost refusing changes
 * nothing. No row is inserted, copied or deleted, and nothing is pruned — a put-back adds no object.
 *
 * NO JOB ROW AND NO LOCK OF ITS OWN. A put-back is one request: at most two uploads of 120 s and an activation of 15 s, inside the
 * route's 300 s. It refuses while a ship of the same project × site is moving; the races that leaves open, and the story that
 * closes them, are named at that refusal (`busy`, below).
 *
 * THE CHECK BEFORE A ROLL BACK (R-291, the owner's Question 2: "Check first, in this story"). A Roll back replaces the theme on the
 * site, so its confirm first runs FR-J16's drift check, `checkBeforePutBack`: the same refusals in the same order (`admit`, shared),
 * then Ship it's own comparison (`run.ts`' `compareLive`) of the theme under the frozen name with this project × site's newest
 * accepted upload — R-287's baseline, as Ship it reads it. It never blocks: the customer may roll back over a found drift, and a
 * check that cannot run says "couldn't verify" and lets them go on, as Ship it does. Its file labels are the manifest's own — it
 * reads no working document. A found drift's live zip is kept at `historyCopyPath`, never Ship it's key. Re-activate runs no check:
 * it switches on files Ghost already holds and replaces nothing.
 *
 * STORY 7.23b — RESTORE ORIGINAL (FR-J13's safety net, D2a's original-theme row; R-292, the owner's Question 1, option 1):
 * `restoreOriginal` puts the linked site's one saved pre-Inflozo theme (`site_snapshots`, R-284: the theme Inflozo replaced most
 * recently) back, over the same io. It ACTIVATES THE THEME BY ITS NAME FIRST — Ghost keeps the previous theme installed beside the
 * active one (VERIFY 61) — and only when Ghost no longer holds that name (`themeNotHeld`) uploads the saved zip as `{name}.zip`,
 * then activates it. So nothing on the site is ever overwritten, and no check runs (Roll back's R-291 check compares files a restore
 * never touches). DW-389: Ghost's own Casper and Source are only ever activated — Ghost refuses `casper.zip` and `source.zip` as
 * uploads (`storage.js:53-56`) and never deletes them (`:167-170`). Its refusals are the put-back's, in the put-back's order
 * (`disconnected`, then `busy`), with nothing sent to Ghost; it reads no lock, no plan and no working document, and runs no gscan.
 * THE RECORDS: live, every `live` row on the site (any project of the user's) is demoted to `uploaded` — so Inflozo's version shows
 * as 7.23a's D2d row with Re-activate, the undo — and `activated`, `activated_at` and `accepted_at` are left as they are. NO
 * `deploys` ROW IS WRITTEN: the 7.21 criterion's "records that upload as the newest accepted one" exists because Ghost replaces the
 * files under the FROZEN name the drift check reads, and a restore activates or uploads under the ORIGINAL's name, never that one
 * (AD-19) — so the drift baseline holds, and a row carrying the snapshot's manifest would compare Inflozo's theme with the old one
 * (a false drift on every ship, which FR-J16 forbids). Ghost refusing, or the theme left not live: nothing is written.
 */

/** what the put-back reads of the version's row */
export type PutBackRow = {
  id: string
  project_id: string
  site_id: string
  version: string
  theme_name: string
  status: string
  artifact_path: string | null
}

export type PutBackIo = Pick<DeployIo, 'call' | 'log' | 'liveTheme'> & {
  /** `put` is the check's live copy alone (`historyCopyPath`, `replace`) */
  artifacts: Pick<DeployIo['artifacts'], 'get' | 'put'>
  deploys: Pick<DeployIo['deploys'], 'update' | 'demote'>
  /** Story 7.23b — the site's saved pre-Inflozo theme (`site_snapshots`, one row per site), the user's own, or null */
  original: (a: { siteId: string; userId: string }) => Promise<OriginalRow | null>
  /** Story 7.23b — the `site-snapshots` bucket: an object by its key (no bucket prefix — `snapshotObjectKey`), or null when the store
   *  has no such object (purged, or replaced mid-capture) */
  snapshots: { get: (key: string) => Promise<Uint8Array | null> }
  /** the row, the user's own (`user_id`), or null */
  row: (a: { deployId: string; userId: string }) => Promise<PutBackRow | null>
  /** this project × site's newest upload Ghost accepted (`uploaded`/`live`, stored or pruned), by `accepted_at` — its id, or null */
  newest: (a: { projectId: string; siteId: string; userId: string }) => Promise<string | null>
  /** R-291 — the same newest accepted upload's version and manifest: the drift baseline (R-287), `deploys.baseline` with no row
   *  excepted (a Roll back has no row of its own in flight); null when there is none */
  baseline: (a: { projectId: string; siteId: string; userId: string }) => Promise<{ version: string; content_manifest: ContentManifest | null } | null>
  /** the project's linked site with its address, whether it is disconnected and whether its token's Not now is recorded (R-278), or
   *  null when the project links none */
  linked: (a: { projectId: string; userId: string }) => Promise<{ siteId: string; url: string; disconnected: boolean; declined: boolean } | null>
  /** whether a job of this project × site is uploading — `snapshotting`, `uploading` or `activating` — and was touched after `since` */
  moving: (a: { projectId: string; siteId: string; userId: string; since: string }) => Promise<boolean>
}

/** what Restore original reads of the site's saved original — `captured_at` tells a later capture from the row History drew: the
 *  capture upserts on `site_id`, so a replaced snapshot keeps its id (Story 7.23b's review) */
export type OriginalRow = { id: string; theme_name: string | null; storage_path: string; captured_at: string }

/** a refusal with nothing sent to Ghost — the put-back's and the check's alike */
export type Refusal = 'gone' | 'elsewhere' | 'live-already' | 'disconnected' | 'busy'

/** what a put-back ended as: live, or uploaded and not live (D2d); or why nothing was sent, or Ghost's refusal (nothing changed) */
export type PutBackOutcome = 'live' | 'uploaded' | Refusal | { refused: DeployError }

/** what the check before a Roll back answers: D3's record — or null where there are not two manifests to compare (FR-J16: drift is
 *  never asserted without both; nothing is drawn) — or the put-back's own refusal, or ours */
export type CheckBefore = { drift: Exclude<DriftRecord, { kind: 'reading' }> | null } | Refusal | { refused: DeployError }

/** the audit row's route (AD-10) */
const ROUTE = 'projects/history'

type Asked = { userId: string; projectId: string; deployId: string; now: Date }
type Admitted = { row: PutBackRow; linked: NonNullable<Awaited<ReturnType<PutBackIo['linked']>>>; at: { projectId: string; siteId: string; userId: string } }

/** 1–2, ONCE for the put-back and the check before it: the row, the user's own — this project's stored version, else it is gone
 *  (pruned, failed, or never theirs) — then the refusals, in this order, with nothing sent to Ghost */
async function admit(io: PutBackIo, a: Asked): Promise<Refusal | Admitted> {
  const row = await twice(io, 'put-back row', () => io.row({ deployId: a.deployId, userId: a.userId }))
  if (row === null || row.project_id !== a.projectId || !isStoredVersion(row)) return 'gone'
  const linked = await twice(io, 'linked site', () => io.linked({ projectId: a.projectId, userId: a.userId }))
  if (linked === null || linked.siteId !== row.site_id) return 'elsewhere'
  if (row.status === 'live') return 'live-already'
  if (linked.disconnected) return 'disconnected'
  const at = { projectId: a.projectId, siteId: row.site_id, userId: a.userId }
  const since = new Date(a.now.getTime() - STALLED_MS).toISOString()
  // ponytail: refusing while a ship MOVES leaves two races open — a ship that starts DURING a put-back, and two put-backs at once
  // (two tabs, or a reader, whom R-192 lets act) — and of two uploads of one name Ghost answers `EEXIST` (`deploy_running`) to
  // one. Story 7.25's per-site advisory lock (AD-19) closes both, and this function joins it when it lands
  if (await twice(io, 'moving jobs', () => io.moving({ ...at, since }))) return 'busy'
  return { row, linked, at }
}

/**
 * R-291 — THE DRIFT CHECK BEFORE A ROLL BACK (FR-J16), run when its confirm opens: `admit`'s refusals, then the baseline — this
 * project × site's newest accepted upload (R-287) — and, with its manifest in hand, `compareLive` on the theme under the row's
 * frozen name. No baseline, or one with no manifest: null, and nothing is read from Ghost. A found drift within the live copy's size
 * keeps the zip it read at `historyCopyPath` (overwriting — one per project × site) BEFORE it answers, so the confirm's Download
 * serves exactly that zip. R-278: a missing token on a site whose Not now is recorded is said as the decline. It writes no row and
 * reads no lock, plan or gate; an infrastructure failure, twice, is ours (`deploy_infrastructure`).
 */
export async function checkBeforePutBack(io: PutBackIo, a: Asked): Promise<CheckBefore> {
  try {
    const admitted = await admit(io, a)
    if (typeof admitted === 'string') return admitted
    const { row, linked, at } = admitted
    const baseline = await twice(io, 'drift baseline', () => io.baseline(at))
    if (baseline === null || baseline.content_manifest === null || typeof baseline.content_manifest !== 'object') return { drift: null }
    const answer = await compareLive(io, { siteId: row.site_id, userId: a.userId, theme: row.theme_name, route: ROUTE, since: versionNumber(baseline.version), manifest: baseline.content_manifest, at: { deploy: row.id } })
    if ('bytes' in answer) await twice(io, 'history copy', () => io.artifacts.put(historyCopyPath(a.projectId, row.site_id), answer.bytes, { replace: true }))
    const { record } = answer
    return { drift: record.kind === 'unverified' ? { ...record, cause: causeShown(record.cause, linked.declined) } : record }
  } catch (e) {
    io.log('put-back: the check failed', { code: (e as { code?: string } | null)?.code })
    return { refused: deployError('deploy_infrastructure', { host: '' }) }
  }
}

export async function putBack(io: PutBackIo, a: Asked): Promise<PutBackOutcome> {
  let host = ''
  /** the version Ghost has acted on — an upload accepted or an activation made — once it has: a record failing after that is not
   *  "nothing reached your site" (`DEPLOY_WORDS.infrastructure`) but History failing to note what did */
  let acted: number | null = null
  try {
    // 1–2. the row and the refusals, with nothing sent to Ghost
    const admitted = await admit(io, a)
    if (typeof admitted === 'string') return admitted
    const { row, linked, at } = admitted
    host = hostOf(linked.url)
    const ctx = { host, siteId: row.site_id }
    const now = a.now.toISOString()
    const action = actionOf(row, { linkedSiteId: linked.siteId, newest: await twice(io, 'newest accepted', () => io.newest(at)) })
    // the I/O matrix's "logged by code": the code alone — never Ghost's detail or the host
    const ghostSaid = (code: DeployCode, detail?: string) => {
      io.log('put-back: Ghost refused', { code })
      return { refused: deployError(code, { ...ctx, ...(detail === undefined ? {} : { detail }) }) }
    }
    /** live: this row live, activated and stamped (and accepted, after an upload); every other row live on the site demoted. Every
     *  caller `return await`s it: a bare `return goLive()` leaves the `try` before its writes fail, and the catch never hears them */
    const goLive = async (accepted: boolean): Promise<PutBackOutcome> => {
      await twice(io, 'put-back live', () => io.deploys.update(row.id, a.userId, { status: 'live', activated: true, activated_at: now, ...(accepted ? { accepted_at: now } : {}) }))
      await twice(io, 'demote', () => io.deploys.demote({ siteId: row.site_id, userId: a.userId, except: row.id }))
      return 'live'
    }
    const activation = (): Promise<Called> => sendActivate(io, { siteId: row.site_id, themeName: row.theme_name, route: ROUTE })

    // 3. RE-ACTIVATE: Ghost holds the files — the activation alone. Refused, nothing changes (the row stays D2d's)
    if (action === 'reactivate') {
      const answer = await activation()
      if ('thrown' in answer) return ghostSaid(answer.thrown)
      const activated = activateAnswer(answer)
      if ('failed' in activated) return ghostSaid(activated.failed)
      if ('ok' in activated) {
        acted = versionNumber(row.version)
        return await goLive(false)
      }
      // busy or down, as `uploadAnswer` reads the same statuses
      if (answer.status === 429 || answer.status >= 500) return ghostSaid('ghost_unavailable')
      // activation runs Ghost's own theme check too (`activate.js:55-60`): its refusal is said with Ghost's detail, never retried —
      // unless Ghost no longer holds the theme at all (`themeNotHeld`): then the spec's own rule, "otherwise re-upload", and the
      // Roll back below sends the stored zip
      if (!themeNotHeld(answer)) return ghostSaid('ghost_theme_refused', activated.detail)
    }

    // 4. ROLL BACK: the stored zip, uploaded again under the frozen name — exactly what Ship it sends
    const bytes = await twice(io, 'artifact get', () => io.artifacts.get(row.artifact_path as string))
    const posted = await sendUpload(io, { siteId: row.site_id, themeName: row.theme_name, bytes, route: ROUTE })
    if ('thrown' in posted) return ghostSaid(posted.thrown)
    const upload = uploadAnswer(posted)
    // Ghost said no (its 422 `ThemeValidationError` among them): nothing recorded, the site untouched — never retried (VERIFY 10)
    if ('failed' in upload) return ghostSaid(upload.failed, upload.detail)
    acted = versionNumber(row.version)
    // R-264: an upload under the ACTIVE name is live at once — no activation is sent
    if (upload.active) return await goLive(true)
    // accepted, under an inactive name: Ghost holds these files now (DW-400), then the activation
    await twice(io, 'put-back uploaded', () => io.deploys.update(row.id, a.userId, { status: 'uploaded', accepted_at: now }))
    const answer = await activation()
    if (!('thrown' in answer) && 'ok' in activateAnswer(answer)) return await goLive(false)
    // the theme is on the site whatever the activation answered: D2d's row, Re-activate from there
    return 'uploaded'
  } catch (e) {
    // a database or store answer, twice (AD-20's rule): ours, said as such — and once Ghost has acted, said as what it is: the
    // version reached the site and History could not record it
    io.log('put-back: infrastructure failed', { code: (e as { code?: string } | null)?.code, acted: acted === null ? 'no' : 'yes' })
    const ours = deployError('deploy_infrastructure', { host })
    return { refused: acted === null ? ours : { ...ours, message: HISTORY_WORDS.unrecorded(acted, host) } }
  }
}

/** what Restore original ended as: live, or on the site and not live; or why nothing was sent, or Ghost's refusal (nothing changed) */
export type RestoreOutcome = 'live' | 'uploaded' | 'gone' | 'disconnected' | 'busy' | { refused: DeployError }

/** DW-389: Ghost's own default themes, which it refuses as uploads (`storage.js:53-56`) and never deletes (`:167-170`) — so they are
 *  only ever activated */
const GHOST_DEFAULTS: ReadonlySet<string> = new Set(['casper', 'source'])

/**
 * STORY 7.23b — RESTORE ORIGINAL, exactly as the spec's Always states (the header says why): the project's linked site, its saved
 * original (its id must be the one asked, else `gone`), the refusals with nothing sent to Ghost, then the activation by name, and
 * only when Ghost no longer holds that name (never Casper or Source) the saved zip uploaded as `{name}.zip` and activated. Live:
 * every `live` row on the site demoted. No `deploys` row is ever written.
 */
export async function restoreOriginal(io: PutBackIo, a: { userId: string; projectId: string; snapshotId: string; captured: string; now: Date }): Promise<RestoreOutcome> {
  let host = ''
  /** whether Ghost has acted — an activation made or an upload accepted — so a record failing after it is said as what it is */
  let acted = false
  try {
    // 1. the linked site, then its saved original — the one asked, else gone (replaced by a later capture, purged, or another site's).
    // A later capture keeps the row's id (an upsert on `site_id`), so the one History drew is its id AND its `captured_at`
    const linked = await twice(io, 'linked site', () => io.linked({ projectId: a.projectId, userId: a.userId }))
    if (linked === null) return 'gone'
    const original = await twice(io, 'original theme', () => io.original({ siteId: linked.siteId, userId: a.userId }))
    if (original === null || original.id !== a.snapshotId || Date.parse(original.captured_at) !== Date.parse(a.captured)) return 'gone'
    // a row with no name (the column is nullable; the capture always writes one) is never sent to Ghost as `null`
    if (typeof original.theme_name !== 'string' || original.theme_name === '') return 'gone'
    // 2. the put-back's refusals, in its order, with nothing sent to Ghost
    if (linked.disconnected) return 'disconnected'
    const since = new Date(a.now.getTime() - STALLED_MS).toISOString()
    // ponytail: the put-back's `busy` ceiling (`admit`) — Story 7.25's per-site advisory lock closes it, and this joins it
    if (await twice(io, 'moving jobs', () => io.moving({ projectId: a.projectId, siteId: linked.siteId, userId: a.userId, since }))) return 'busy'
    host = hostOf(linked.url)
    const ctx = { host, siteId: linked.siteId }
    const name = original.theme_name
    const ghostSaid = (code: DeployCode, detail?: string) => {
      io.log('restore: Ghost refused', { code })
      return { refused: deployError(code, { ...ctx, ...(detail === undefined ? {} : { detail }) }) }
    }
    /** live: every `live` row on the site is no longer live; nothing else is written (`return await`, as `putBack`'s `goLive`) */
    const goLive = async (): Promise<RestoreOutcome> => {
      acted = true
      await twice(io, 'demote', () => io.deploys.demote({ siteId: linked.siteId, userId: a.userId }))
      return 'live'
    }
    const activation = (): Promise<Called> => sendActivate(io, { siteId: linked.siteId, themeName: name, route: ROUTE })

    // 3. ACTIVATE FIRST: Ghost's own copy of the original, as it holds it
    const answer = await activation()
    if ('thrown' in answer) return ghostSaid(answer.thrown)
    const activated = activateAnswer(answer)
    if ('ok' in activated) return await goLive()
    if ('failed' in activated) return ghostSaid(activated.failed)
    if (answer.status === 429 || answer.status >= 500) return ghostSaid('ghost_unavailable')
    // Ghost's check (activation runs it too, `activate.js:55-60`) — or a default theme Ghost says it lacks (never seen): Ghost's words
    if (!themeNotHeld(answer) || GHOST_DEFAULTS.has(name)) return ghostSaid('ghost_theme_refused', activated.detail)

    // 4. Ghost no longer holds it: the saved zip, uploaded under the original's own name — never the frozen one (the baseline holds)
    const bytes = await twice(io, 'original zip', () => io.snapshots.get(snapshotObjectKey(original.storage_path)))
    // the store no longer has it (purged, or a capture replacing it since the read): gone, as the download's 404 — never "try again"
    if (bytes === null) return 'gone'
    const posted = await sendUpload(io, { siteId: linked.siteId, themeName: name, bytes, route: ROUTE })
    if ('thrown' in posted) return ghostSaid(posted.thrown)
    const upload = uploadAnswer(posted)
    // Ghost said no (its 422 among them): nothing changed — never retried (VERIFY 10)
    if ('failed' in upload) return ghostSaid(upload.failed, upload.detail)
    acted = true
    if (upload.active) return await goLive()
    const again = await activation()
    if (!('thrown' in again) && 'ok' in activateAnswer(again)) return await goLive()
    // on the site, not live: nothing written
    return 'uploaded'
  } catch (e) {
    io.log('restore: infrastructure failed', { code: (e as { code?: string } | null)?.code, acted: acted ? 'yes' : 'no' })
    const ours = deployError('deploy_infrastructure', { host })
    return { refused: acted ? { ...ours, message: HISTORY_WORDS.restoreUnrecorded(host) } : ours }
  }
}
