import { snapshotDownloadPath } from '@/lib/backup-gate'
import { historyLiveDownloadPath } from '@/lib/drift'
import { historyPath } from '@/lib/editor'
import { actOutcomeOf, checkOutcomeOf, pinOutcomeOf, type ActOutcome, type CheckOutcome, type HistoryAnswer, type PinOutcome } from '@/lib/retention'

/* ───────── STORY 7.23c — HISTORY'S REQUESTS, ONE SET (moved here whole from `editor.tsx`, Stories 7.22–7.23b): the read, the pin, the
 * put-back, R-291's check and Restore original, and the two Download addresses, over the History route (`projects/[id]/history`).
 * The editor's drawer and the phone's Deploy history card (`small-screen-notice.tsx`) both use THIS, so the bodies, the logs and the
 * `/app` prefix rule (`routing.ts`' `isApp`, which the caller reads off its pathname) are one. A request that failed is logged by
 * status and answered as the readers answer it (`pinOutcomeOf`, `actOutcomeOf`, `checkOutcomeOf`). The keyboard harness names its own
 * server actions for each (`seams`: no database, no Ghost); the app passes none. What a put-back that LANDED means for the editor —
 * its `landed`, which re-reads the page when the drawer closes — stays the editor's. */

/** the keyboard harness's own answers, one per request — the editor's props of the same names */
export type HistorySeams = {
  historyRead?: (projectId: string) => Promise<HistoryAnswer | null>
  historyPin?: (projectId: string, deploy: string, pinned: boolean) => Promise<PinOutcome>
  historyAct?: (projectId: string, deploy: string) => Promise<ActOutcome>
  historyCheck?: (projectId: string, deploy: string) => Promise<CheckOutcome>
  historyRestore?: (projectId: string, snapshot: string, captured: string) => Promise<ActOutcome>
}

export type HistoryRequests = {
  /** the project's stored versions (GET), or null when the read failed */
  read: () => Promise<HistoryAnswer | null>
  /** a pin or an unpin (POST `{ deploy, pinned }`) */
  pin: (deploy: string, pinned: boolean) => Promise<PinOutcome>
  /** Story 7.23a — a put-back (POST `{ deploy, act: 'live' }`) */
  act: (deploy: string) => Promise<ActOutcome>
  /** R-291 — the drift check before a Roll back (POST `{ deploy, act: 'check' }`) */
  check: (deploy: string) => Promise<CheckOutcome>
  /** Story 7.23b — Restore original (POST `{ snapshot, captured, act: 'restore' }`) */
  restore: (snapshot: string, captured: string) => Promise<ActOutcome>
  /** R-291 — the live zip a found check kept (`history/live`), named by the theme it read */
  liveHref: (theme: string) => string
  /** Story 7.23b — the saved original's download (Story 2.5's route) */
  originalHref: (snapshot: string) => string
}

export function historyRequests({ projectId, prefix, seams = {} }: {
  projectId: string
  /** `/app` under the internal prefix, else '' — the caller's `isApp(pathname)` */
  prefix: string
  seams?: HistorySeams
}): HistoryRequests {
  const url = `${prefix}${historyPath(projectId)}`
  /** a POST to the route with a JSON body, answered with its status and parsed body (null on the network, or an answer that is none) */
  const post = async (body: object): Promise<{ status: number; body: unknown }> => {
    const answer = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null)
    return { status: answer?.status ?? 0, body: await answer?.json().catch(() => null) }
  }
  return {
    read: async () => {
      if (seams.historyRead) return seams.historyRead(projectId)
      const answer = await fetch(url, { cache: 'no-store' }).catch(() => null)
      if (answer?.ok) return (await answer.json()) as HistoryAnswer
      console.error('history: the read failed', { status: answer?.status ?? 0 })
      return null
    },
    pin: async (deploy, pinned) => {
      if (seams.historyPin) return seams.historyPin(projectId, deploy, pinned)
      const { status } = await post({ deploy, pinned })
      const outcome = pinOutcomeOf(status, pinned)
      if (outcome === 'failed') console.error('history: the pin failed', { status })
      return outcome
    },
    act: async (deploy) => {
      if (seams.historyAct) return seams.historyAct(projectId, deploy)
      const { status, body } = await post({ deploy, act: 'live' })
      const outcome = actOutcomeOf(status, body)
      if (outcome.kind === 'failed') console.error('history: the put-back failed', { status })
      return outcome
    },
    check: async (deploy) => {
      if (seams.historyCheck) return seams.historyCheck(projectId, deploy)
      const { status, body } = await post({ deploy, act: 'check' })
      const outcome = checkOutcomeOf(status, body)
      if (outcome.kind === 'failed') console.error('history: the check failed', { status })
      return outcome
    },
    restore: async (snapshot, captured) => {
      if (seams.historyRestore) return seams.historyRestore(projectId, snapshot, captured)
      const { status, body } = await post({ snapshot, captured, act: 'restore' })
      const outcome = actOutcomeOf(status, body)
      if (outcome.kind === 'failed') console.error('history: the restore failed', { status })
      return outcome
    },
    liveHref: (theme) => `${prefix}${historyLiveDownloadPath(projectId, theme)}`,
    originalHref: (snapshot) => `${prefix}${snapshotDownloadPath(snapshot)}`,
  }
}
