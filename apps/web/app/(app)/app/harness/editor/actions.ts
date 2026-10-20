'use server'

import { headers } from 'next/headers'
import type { SafetyAnswer, SiteResult } from '@/app/(app)/app/(authed)/projects/[id]/(editor)/actions'
import { HARNESS } from '@/lib/harness'
import { DEPLOY_WORDS } from '@/lib/deploy'
import { storedSurfaces } from '@/lib/probe-rule'
import { confirmedFrom, SWITCH_WORDS, type SwitchAnswer } from '@/lib/site-switch'
import { tokenRefusal } from '@/lib/connect-rule'
import { addStaffToken, type StaffTokenIo } from '@/server/staff-token'
import { HARNESS_PROJECT, HARNESS_SITES, SURFACES } from './sites'

/**
 * DW-279 — THE KEYBOARD HARNESS'S RE-READ, the editor's `reread` seam (`recheckSite` everywhere else). The harness has no
 * database, so the real re-read is refused there and `pnpm keyboard` could only ever see the stored snapshot stay drawn;
 * a re-read that LANDS and redraws Ghost's two surfaces was proven by the hand-run live walk alone.
 *
 * It answers ONLY the harness project, ONLY under `x-inflozo-harness-site: surfaces-later` (a linked site whose stored
 * snapshot is empty) or `surfaces-gone` (the full stored snapshot, answered with the empty one), and only where the harness exists at all — a server action is an endpoint in every build, so
 * production refuses it like everything else here. Every other call is the refusal the real action gives a harness. It
 * READS `projectId`: Next drops an argument an action never uses from the request, and the journey finds the re-read by
 * its body, the project id alone.
 */
export async function harnessReread(projectId: string): Promise<SiteResult> {
  if (!HARNESS || projectId !== HARNESS_PROJECT.id) return { refused: true }
  const asked = (await headers()).get('x-inflozo-harness-site')
  // R-215 (the review of 5.24e): `surfaces-gone` answers the EMPTY snapshot — the site switched both surfaces off
  if (asked === 'surfaces-gone') return { members: null, surfaces: storedSurfaces({}) }
  if (asked !== 'surfaces-later') return { refused: true }
  return { members: null, surfaces: SURFACES }
}

/**
 * STORY 7.18b — THE HARNESS'S `switchSite`, the editor's `switchTo` seam: the harness has no database, so a switch is answered
 * here — linked, or under `x-inflozo-harness-switch: gone` refused as a site disconnected meanwhile, or under `confirm-held` as
 * if another tab had handed the site to a third project meanwhile: a confirm that named anyone else is answered with the
 * move's confirm naming that project, and the confirm that named it lands (the server's `covers`, `lib/site-switch.ts`). Only
 * the harness project, and only where the harness exists at all; everything else is refused as the real action refuses a
 * stranger.
 */
export async function harnessSwitch(projectId: string, siteId: string, session: string, confirmed: unknown): Promise<SwitchAnswer> {
  if (!HARNESS || projectId !== HARNESS_PROJECT.id || typeof session !== 'string' || session === '') return { refused: DEPLOY_WORDS.infrastructure }
  const asked = (await headers()).get('x-inflozo-harness-switch')
  if (asked === 'gone') return { refused: SWITCH_WORDS.gone }
  if (asked === 'confirm-held' && confirmedFrom(confirmed)?.heldBy !== HARNESS_SITES.other) {
    return { confirm: { same: false, heldBy: { id: HARNESS_SITES.other, name: 'Another project' }, firstLink: false, language: 'en', warnLanguage: false, confirm: true } }
  }
  void siteId
  return { ok: true }
}

/**
 * STORY 7.19 — THE HARNESS'S `addSafetyToken`, the editor's `addToken` seam: no database and no Ghost, so the REAL check runs
 * (`addStaffToken` — empty, then not `id:hex`, then Ghost's answer, then the role) over an `io` that answers as Ghost would
 * under `x-inflozo-harness-token`: `ok` an Administrator's token (kept, nothing written), `role` an Editor's, `integration`
 * the integration key's 404 `NotFoundError`, anything else the 401 of a token Ghost does not know. Each sentence is
 * `tokenRefusal`'s, the app's own. Only the harness project, and only where the harness exists at all.
 */
export async function harnessAddToken(projectId: string, token: string): Promise<SafetyAnswer> {
  if (!HARNESS || projectId !== HARNESS_PROJECT.id || typeof token !== 'string') return { refused: DEPLOY_WORDS.infrastructure }
  const asked = (await headers()).get('x-inflozo-harness-token')
  const answer = (status: number, body: unknown) => {
    const text = JSON.stringify(body)
    return { ok: status === 200, status, body, text, bytes: new TextEncoder().encode(text), ...(status === 200 ? {} : { code: status === 401 ? 'ghost_unknown_key' : 'ghost_refused' }) }
  }
  const io: StaffTokenIo = {
    fetchWithKey: async () =>
      asked === 'ok' ? answer(200, { users: [{ roles: [{ name: 'Administrator' }] }] })
      : asked === 'role' ? answer(200, { users: [{ roles: [{ name: 'Editor' }] }] })
      : asked === 'integration' ? answer(404, { errors: [{ type: 'NotFoundError' }] })
      : answer(401, { errors: [{ type: 'UnauthorizedError' }] }),
    store: async () => ({ ref: 'harness' }),
  }
  const added = await addStaffToken({ siteId: HARNESS_PROJECT.id, userId: 'harness', url: 'https://127.0.0.1:9', version: '6.58.0', token, route: 'harness' }, io)
  return added.ok ? { ok: true } : { refused: tokenRefusal(added, 'harness.example') }
}

/** STORY 7.19 — THE HARNESS'S `declineSafetyNet`: recorded, with nothing to write — or, under `x-inflozo-harness-decline: fail`,
 *  the write that did not land (`{ ok: false }`, as the real action answers one), so a journey holds that the deploy goes on.
 *  Only the harness project. */
export async function harnessDecline(projectId: string): Promise<{ ok: boolean }> {
  if ((await headers()).get('x-inflozo-harness-decline') === 'fail') return { ok: false }
  return { ok: HARNESS && projectId === HARNESS_PROJECT.id }
}
