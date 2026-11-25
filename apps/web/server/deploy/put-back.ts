import { hostOf } from '../../lib/connect-rule.ts'
import { activateAnswer, deployError, uploadAnswer, type DeployCode, type DeployError } from '../../lib/deploy.ts'
import { actionOf, isStoredVersion } from '../../lib/retention.ts'
import { sendActivate, sendUpload, STALLED_MS, twice, type Called, type DeployIo } from './run.ts'

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
 * route's 300 s. It refuses while a ship of the same project × site is moving. ponytail: a ship that starts DURING a put-back can
 * still race it, and Ghost answers `EEXIST` (`deploy_running`) to one of them — AD-19's per-site advisory lock, Story 7.25's, closes
 * that race, and this function joins it when it lands.
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

export type PutBackIo = Pick<DeployIo, 'call' | 'log'> & {
  artifacts: Pick<DeployIo['artifacts'], 'get'>
  deploys: Pick<DeployIo['deploys'], 'update' | 'demote'>
  /** the row, the user's own (`user_id`), or null */
  row: (a: { deployId: string; userId: string }) => Promise<PutBackRow | null>
  /** this project × site's newest upload Ghost accepted (`uploaded`/`live`, stored or pruned), by `accepted_at` — its id, or null */
  newest: (a: { projectId: string; siteId: string; userId: string }) => Promise<string | null>
  /** the project's linked site with its address and whether it is disconnected, or null when the project links none */
  linked: (a: { projectId: string; userId: string }) => Promise<{ siteId: string; url: string; disconnected: boolean } | null>
  /** whether a job of this project × site is uploading — `snapshotting`, `uploading` or `activating` — and was touched after `since` */
  moving: (a: { projectId: string; siteId: string; userId: string; since: string }) => Promise<boolean>
}

/** what a put-back ended as: live, or uploaded and not live (D2d); or why nothing was sent, or Ghost's refusal (nothing changed) */
export type PutBackOutcome = 'live' | 'uploaded' | 'gone' | 'elsewhere' | 'live-already' | 'disconnected' | 'busy' | { refused: DeployError }

/** the audit row's route (AD-10) */
const ROUTE = 'projects/history'

export async function putBack(io: PutBackIo, a: { userId: string; projectId: string; deployId: string; now: Date }): Promise<PutBackOutcome> {
  let host = ''
  try {
    // 1. the row, the user's own — and this project's stored version, else it is gone (pruned, failed, or never theirs)
    const row = await twice(io, 'put-back row', () => io.row({ deployId: a.deployId, userId: a.userId }))
    if (row === null || row.project_id !== a.projectId || !isStoredVersion(row)) return 'gone'
    // 2. the refusals, with nothing sent to Ghost
    const linked = await twice(io, 'linked site', () => io.linked({ projectId: a.projectId, userId: a.userId }))
    if (linked === null || linked.siteId !== row.site_id) return 'elsewhere'
    if (row.status === 'live') return 'live-already'
    if (linked.disconnected) return 'disconnected'
    const at = { projectId: a.projectId, siteId: row.site_id, userId: a.userId }
    const since = new Date(a.now.getTime() - STALLED_MS).toISOString()
    if (await twice(io, 'moving jobs', () => io.moving({ ...at, since }))) return 'busy'
    host = hostOf(linked.url)
    const ctx = { host, siteId: row.site_id }
    const now = a.now.toISOString()
    const action = actionOf(row, { linkedSiteId: linked.siteId, newest: await twice(io, 'newest accepted', () => io.newest(at)) })
    const ghostSaid = (code: DeployCode, detail?: string) => ({ refused: deployError(code, { ...ctx, ...(detail === undefined ? {} : { detail }) }) })
    /** live: this row live, activated and stamped (and accepted, after an upload); every other row live on the site demoted */
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
      // activation runs Ghost's own theme check too (`activate.js:55-60`): its refusal is said with Ghost's detail, never retried
      if ('notLive' in activated) return ghostSaid('ghost_theme_refused', activated.detail)
      return goLive(false)
    }

    // 4. ROLL BACK: the stored zip, uploaded again under the frozen name — exactly what Ship it sends
    const bytes = await twice(io, 'artifact get', () => io.artifacts.get(row.artifact_path as string))
    const posted = await sendUpload(io, { siteId: row.site_id, themeName: row.theme_name, bytes, route: ROUTE })
    if ('thrown' in posted) return ghostSaid(posted.thrown)
    const upload = uploadAnswer(posted)
    // Ghost said no (its 422 `ThemeValidationError` among them): nothing recorded, the site untouched — never retried (VERIFY 10)
    if ('failed' in upload) return ghostSaid(upload.failed, upload.detail)
    // R-264: an upload under the ACTIVE name is live at once — no activation is sent
    if (upload.active) return goLive(true)
    // accepted, under an inactive name: Ghost holds these files now (DW-400), then the activation
    await twice(io, 'put-back uploaded', () => io.deploys.update(row.id, a.userId, { status: 'uploaded', accepted_at: now }))
    const answer = await activation()
    if (!('thrown' in answer) && 'ok' in activateAnswer(answer)) return goLive(false)
    // the theme is on the site whatever the activation answered: D2d's row, Re-activate from there
    return 'uploaded'
  } catch (e) {
    // a database or store answer, twice (AD-20's rule): ours, said as such
    io.log('put-back: infrastructure failed', { code: (e as { code?: string } | null)?.code })
    return { refused: deployError('deploy_infrastructure', { host }) }
  }
}
