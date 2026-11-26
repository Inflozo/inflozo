'use server'

import { headers } from 'next/headers'
import type { SafetyAnswer, SiteResult } from '@/app/(app)/app/(authed)/projects/[id]/(editor)/actions'
import { HARNESS } from '@/lib/harness'
import { BACKUP_WORDS, DEPLOY_WORDS, versionNumber } from '@/lib/deploy'
import { storedSurfaces } from '@/lib/probe-rule'
import { confirmedFrom, SWITCH_WORDS, type SwitchAnswer } from '@/lib/site-switch'
import { tokenRefusal } from '@/lib/connect-rule'
import { addStaffToken, type StaffTokenIo } from '@/server/staff-token'
import { HISTORY_WORDS, type ActOutcome, type CheckOutcome, type HistoryAnswer, type OriginalTheme, type PinOutcome } from '@/lib/retention'
import { labelOf } from '@/lib/drift'
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
export async function harnessAddToken(projectId: string, siteId: string, token: string): Promise<SafetyAnswer> {
  void siteId
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
export async function harnessDecline(projectId: string, siteId: string): Promise<{ ok: boolean }> {
  void siteId
  if ((await headers()).get('x-inflozo-harness-decline') === 'fail') return { ok: false }
  return { ok: HARNESS && projectId === HARNESS_PROJECT.id }
}

/** STORY 7.20a — THE HARNESS'S `confirmBackup`: recorded, with nothing to write. Only the harness project. */
export async function harnessConfirm(projectId: string, siteId: string): Promise<{ ok: boolean }> {
  void siteId
  return { ok: HARNESS && projectId === HARNESS_PROJECT.id }
}

/** STORY 7.20a — the snapshot row's id the harness's Theme Download answers: the journey answers Story 2.5's route for it (a
 *  'use server' file exports only actions, so the journey names the same id itself) */
const HARNESS_SNAPSHOT_ID = '00000000-0000-4000-8000-000000000720'

/** STORY 7.20a — THE HARNESS'S `downloadLiveTheme`, by `x-inflozo-harness-snapshot`: `ok` (and no header) a snapshot row's id,
 *  `marked` the "Inflozo's own" sentence, `refused` a 403's and `failed` a 502's failure sentence — the app's own words. */
export async function harnessTheme(projectId: string, siteId: string): Promise<{ ok: true; id: string } | { said: string }> {
  void siteId
  if (!HARNESS || projectId !== HARNESS_PROJECT.id) return { said: DEPLOY_WORDS.infrastructure }
  const asked = (await headers()).get('x-inflozo-harness-snapshot')
  if (asked === 'marked') return { said: BACKUP_WORDS.marked }
  if (asked === 'refused') return { said: BACKUP_WORDS.downloadFailed(403) }
  if (asked === 'failed') return { said: BACKUP_WORDS.downloadFailed(502) }
  return { ok: true, id: HARNESS_SNAPSHOT_ID }
}

/** STORY 7.20a — the live `routes.yaml` the harness's Download hands back: Ghost's own default file */
const HARNESS_LIVE_ROUTES = 'routes:\n\ncollections:\n  /:\n    permalink: /{slug}/\n    template: index\n\ntaxonomies:\n  tag: /tag/{slug}/\n  author: /author/{slug}/\n'

/** STORY 7.20a — THE HARNESS'S `downloadRoutes`: the live file, or under `x-inflozo-harness-snapshot: failed` Ghost's 502. */
export async function harnessRoutes(projectId: string, siteId: string): Promise<{ ok: true; file: string } | { said: string }> {
  void siteId
  if (!HARNESS || projectId !== HARNESS_PROJECT.id) return { said: DEPLOY_WORDS.infrastructure }
  if ((await headers()).get('x-inflozo-harness-snapshot') === 'failed') return { said: BACKUP_WORDS.downloadFailed(502) }
  return { ok: true, file: HARNESS_LIVE_ROUTES }
}

/** STORY 7.22 — the linked site's id in every Ship it shape (`layout.tsx`' `shipOf`), and the second site `two-sites` adds */
const HISTORY_SITE = HARNESS_SITES.linked
const OTHER_SITE = HARNESS_SITES.german
/** one stored version of the harness project: v{n} on day n of November 2026, at nine in the morning (accepted then too), gscan
 *  clean — with no Changed line, no dropped setting and NO ACTION, as Story 7.22's shapes stand (their journeys walk the drawer as
 *  7.22 drew it); Story 7.23a's shapes below hand each row its own */
const stored = (n: number, over: Partial<HistoryAnswer['rows'][number]> = {}): HistoryAnswer['rows'][number] => ({
  id: `00000000-0000-4000-8000-0000000722${String(n).padStart(2, '0')}`,
  version: `${n}.0.0`, status: 'uploaded', pinned: false, createdAt: `2026-11-${String(n).padStart(2, '0')}T09:00:00.000Z`,
  acceptedAt: `2026-11-${String(n).padStart(2, '0')}T09:00:00.000Z`,
  errors: 0, warnings: 0, siteId: HISTORY_SITE, host: 'harness.example', changed: null, drops: [], action: null, ...over,
})
/** STORY 7.23a — a Changed line in the frame's shape, from the drawer's own words (`changedLine` builds the real one on the server) */
const changed = (...names: string[]) => `${HISTORY_WORDS.changed}${names.join(', ')}`
/** STORY 7.23a's `rollback`: five versions on the linked site — v5 live, then v4 (the undo, emphasised), v3, v2 pinned and v1, the
 *  last two compact, each with its Roll back; v1 drops a custom setting the live v5 declares (`accent_label`) */
const ROLLBACK = [
  stored(1, { changed: HISTORY_WORDS.firstDeploy, drops: ['accent_label'], action: 'rollback' }),
  stored(2, { changed: changed('Header'), pinned: true, action: 'rollback' }),
  stored(3, { changed: `${changed('Header')} · ${HISTORY_WORDS.addedTemplate('404')}`, warnings: 2, action: 'rollback' }),
  stored(4, { changed: changed('Post Grid', 'Newsletter'), action: 'rollback' }),
  stored(5, { changed: changed('Hero', 'Footer'), status: 'live' }),
]

/**
 * STORY 7.22 — THE HARNESS'S HISTORY READ, the editor's `historyRead` seam (the route's GET everywhere else): no database, so the
 * drawer is answered by `x-inflozo-harness-history`:
 *   - `free`: three stored versions on Free's cap, v3 live, none pinned;
 *   - `free-full`: the same with v1 and v2 pinned — N−1, so pinning v3 is refused (`harnessPin`);
 *   - `pro-full`: Pro's ten, v10 live, nine pinned — the tenth's pin is refused;
 *   - `two-sites`: the linked site's v3 (live) and v1, and v2 on another site ("on de.harness.example");
 *   - `fail`: the read that failed (null);
 *   - `gone`: `free` with v1 pruned since it was listed — a journey switches to it after the drawer has read `free`, so a pin of
 *     v1 is `gone` and the re-read drops the row; `pin-fails`: `free`, every pin answering as a request that failed;
 *   - `empty`, or no header: nothing shipped yet.
 * STORY 7.23b — D2a's original-theme row (`harnessRestore` answers its press):
 *   - `original`: the linked site's saved `casper 5.9.4`, then v2 live and v1;
 *   - `original-restored`: the same after a restore — v2 demoted to D2d's row with Re-activate, nothing live (a journey switches to
 *     it while the restore is held, so the drawer's re-read draws it);
 *   - `original-unversioned`: `original` with no version kept (the mono line is the name alone);
 *   - `original-empty`: the saved original and no version — the row above "Nothing shipped yet".
 * Only the harness project, and only where the harness exists at all.
 */
export async function harnessHistory(projectId: string): Promise<HistoryAnswer | null> {
  if (!HARNESS || projectId !== HARNESS_PROJECT.id) return null
  const asked = (await headers()).get('x-inflozo-harness-history')
  const answer = (rows: HistoryAnswer['rows'], original: OriginalTheme | null = null): HistoryAnswer => ({
    linkedSiteId: HISTORY_SITE,
    liveVersion: rows.find((r) => r.status === 'live' && r.siteId === HISTORY_SITE)?.version ?? null,
    rows: [...rows].reverse(),
    original,
  })
  // Story 7.23b's shapes
  if (asked === 'original' || asked === 'original-unversioned') {
    return answer([stored(1, { changed: HISTORY_WORDS.firstDeploy, action: 'rollback' }), stored(2, { changed: changed('Hero'), status: 'live' })], ORIGINAL(asked === 'original' ? '5.9.4' : null))
  }
  if (asked === 'original-restored') {
    return answer([stored(1, { changed: HISTORY_WORDS.firstDeploy, action: 'rollback' }), stored(2, { changed: changed('Hero'), action: 'reactivate' })], ORIGINAL('5.9.4'))
  }
  if (asked === 'original-empty') return answer([], ORIGINAL('5.9.4'))
  // Story 7.23a's shapes (`harnessAct` answers each one's put-back)
  if (asked === 'rollback' || asked === 'refused' || asked === 'busy' || asked === 'disconnected') return answer(ROLLBACK)
  // `rollback` with v4 pruned since the drawer read it: a journey switches to it while v4's confirm is open
  if (asked === 'rollback-gone') return answer(ROLLBACK.filter((r) => r.version !== '4.0.0'))
  if (asked === 'uploaded') {
    return answer([
      stored(1, { changed: HISTORY_WORDS.firstDeploy, action: 'rollback' }),
      stored(2, { changed: changed('Header'), action: 'rollback' }),
      stored(3, { changed: changed('Hero'), action: 'reactivate' }),
    ])
  }
  if (asked === 'elsewhere') {
    return answer([
      stored(1, { changed: HISTORY_WORDS.firstDeploy, action: 'rollback' }),
      stored(2, { changed: HISTORY_WORDS.firstDeploy, siteId: OTHER_SITE, host: 'de.harness.example', status: 'live' }),
      stored(3, { changed: changed('Hero'), status: 'live' }),
    ])
  }
  if (asked === 'fail') return null
  if (asked === 'free' || asked === 'pin-fails') return answer([stored(1), stored(2, { warnings: 2 }), stored(3, { status: 'live' })])
  if (asked === 'gone') return answer([stored(2, { warnings: 2 }), stored(3, { status: 'live' })])
  if (asked === 'free-full') return answer([stored(1, { pinned: true }), stored(2, { pinned: true }), stored(3, { status: 'live' })])
  if (asked === 'pro-full') return answer(Array.from({ length: 10 }, (_, i) => stored(i + 1, { pinned: i < 9, ...(i === 9 ? { status: 'live' } : {}) })))
  if (asked === 'two-sites') return answer([stored(1), stored(2, { siteId: OTHER_SITE, host: 'de.harness.example', status: 'live' }), stored(3, { status: 'live' })])
  return answer([])
}

/** STORY 7.23b — the harness site's saved original: Casper, saved on November 2 (the year this one — "Archived Nov 2") */
const ORIGINAL = (version: string | null): OriginalTheme => ({
  id: '00000000-0000-4000-8000-000000000723', theme: 'casper', version, capturedAt: '2026-11-02T09:00:00.000Z', siteUrl: 'https://harness.example',
})

/** STORY 7.23b — THE HARNESS'S RESTORE ORIGINAL, the editor's `historyRestore` seam (the route's POST `{ snapshot, captured, act: 'restore' }`
 *  everywhere else), answered by `x-inflozo-harness-restore` with no database and no Ghost: `live` (and no header) and `uploaded` its
 *  endings; `refused` Ghost's own check refusing the original (the route's 422, with Ghost's detail); `gone` the route's 404;
 *  `disconnected` and `busy` its 409s; anything else a request that failed. Stateless: a journey switches the history header while
 *  the press is held, so the re-read draws what the restore left. The real restore is `put-back.test.ts`' and walk step 122's. */
export async function harnessRestore(projectId: string, snapshot: string, captured: string): Promise<ActOutcome> {
  if (!HARNESS || projectId !== HARNESS_PROJECT.id || typeof snapshot !== 'string') return { kind: 'failed' }
  // the row History drew, by its id and its capture (Story 7.23b's review): anything else is the route's 404, so a press that sent
  // the wrong row turns every journey that expects an ending red
  const drawn = ORIGINAL(null)
  if (snapshot !== drawn.id || captured !== drawn.capturedAt) return { kind: 'gone' }
  const asked = (await headers()).get('x-inflozo-harness-restore') ?? 'live'
  if (asked === 'live' || asked === 'uploaded') return { kind: asked }
  if (asked === 'refused') return { kind: 'refused', code: 'ghost_theme_refused', detail: 'The theme "casper" is not compatible or contains errors. Missing template post.hbs.' }
  if (asked === 'gone') return { kind: 'gone' }
  if (asked === 'disconnected' || asked === 'busy') return { kind: 'refused', code: asked }
  return { kind: 'failed' }
}

/** STORY 7.23a — THE HARNESS'S PUT-BACK, the editor's `historyAct` seam (the route's POST `{ deploy, act: 'live' }` everywhere else),
 *  answered by `x-inflozo-harness-history`: `rollback` and `uploaded` go live; `refused` is Ghost's own check refusing the upload
 *  (the route's 422, with Ghost's detail); `busy` a ship of the site under way, `disconnected` the linked site disconnected and
 *  `elsewhere` another site's row (the route's 409s); `gone` and `rollback-gone` the route's 404 (`rollback-gone`'s read lacks v4,
 *  so the re-read drops it); anything else a request that failed. Stateless, as `harnessPin` is: the drawer's re-read answers the same
 *  list. The real put-back is `put-back.test.ts`' and walk step 121's. Only the harness project. */
export async function harnessAct(projectId: string, deploy: string): Promise<ActOutcome> {
  if (!HARNESS || projectId !== HARNESS_PROJECT.id || typeof deploy !== 'string') return { kind: 'failed' }
  const asked = (await headers()).get('x-inflozo-harness-history')
  if (asked === 'rollback' || asked === 'uploaded') return { kind: 'live' }
  if (asked === 'refused') return { kind: 'refused', code: 'ghost_theme_refused', detail: 'The theme "inflozo-pilot-sections" is not compatible or contains errors. Missing template index.hbs.' }
  if (asked === 'busy' || asked === 'elsewhere' || asked === 'disconnected') return { kind: 'refused', code: asked }
  if (asked === 'gone' || asked === 'rollback-gone') return { kind: 'gone' }
  return { kind: 'failed' }
}

/** R-291 — the theme the harness's check reads, and the files its found drift names: two of Inflozo's changed — a section partial
 *  labelled by the manifest's own layer, a template by its canvas — and one the site added, each labelled by `labelOf` as the
 *  server labels them (no working document: the manifest's own names) */
const CHECK_THEME = 'inflozo-pilot-sections'
const CHECK_FOUND = {
  changed: [
    { path: 'partials/sections/hero-a4-13.hbs', label: labelOf({ path: 'partials/sections/hero-a4-13.hbs', entry: { sha256: '', fingerprint: 'harness-hero', layer: 'Hero', category: 'a4' } }, 'changed'), category: 'a4' },
    { path: 'home.hbs', label: labelOf({ path: 'home.hbs' }, 'changed') },
  ],
  added: [{ path: 'custom-handmade.hbs', label: labelOf({ path: 'custom-handmade.hbs' }, 'added') }],
  removed: [],
}

/** R-291 — THE HARNESS'S CHECK BEFORE A ROLL BACK, the editor's `historyCheck` seam (the route's POST `{ deploy, act: 'check' }`
 *  everywhere else), answered by `x-inflozo-harness-check`: no header (or `clean`) D3c's pass since the linked site's newest accepted
 *  version in this list (`x-inflozo-harness-history`'s), so every journey's Roll back works as before; `found` D3a's record — two
 *  changed files and one added — with its live copy kept; `found-unkept` the same past the store's size (no Download); `unverified`
 *  D3b's `role` (a token that cannot read themes); `none` null (no two manifests: nothing drawn); `fail` a request that failed (the
 *  route's 502); `busy` and `gone` the put-back's own refusals, which the check answers first. Only the harness project. */
export async function harnessCheck(projectId: string, deploy: string): Promise<CheckOutcome> {
  if (!HARNESS || projectId !== HARNESS_PROJECT.id || typeof deploy !== 'string') return { kind: 'failed' }
  const asked = (await headers()).get('x-inflozo-harness-check')
  const list = await harnessHistory(projectId)
  const since = Math.max(0, ...(list?.rows ?? []).filter((r) => r.siteId === list?.linkedSiteId).map((r) => versionNumber(r.version)).filter(Number.isFinite))
  if (asked === 'found' || asked === 'found-unkept') return { kind: 'drift', drift: { kind: 'found', since, theme: CHECK_THEME, ...CHECK_FOUND, ...(asked === 'found-unkept' ? { kept: false as const } : {}) } }
  if (asked === 'unverified') return { kind: 'drift', drift: { kind: 'unverified', cause: 'role', theme: CHECK_THEME } }
  if (asked === 'none') return { kind: 'drift', drift: null }
  if (asked === 'fail') return { kind: 'failed' }
  if (asked === 'busy') return { kind: 'refused', code: 'busy' }
  if (asked === 'gone') return { kind: 'gone' }
  return { kind: 'drift', drift: { kind: 'clean', since } }
}

/** STORY 7.22 — THE HARNESS'S PIN, the editor's `historyPin` seam: a pin under `free-full` or `pro-full` is the database's `cap`
 *  (the drawer's D2b), any press under `gone` is `gone` and under `pin-fails` a failed request; every other pin and every unpin
 *  lands. ponytail: stateless — a pin after an unpin in a full history is still
 *  refused, which no journey asks; `pin_version`'s own count is the RLS gate's and walk step 120's. Only the harness project. */
export async function harnessPin(projectId: string, deploy: string, pinned: boolean): Promise<PinOutcome> {
  if (!HARNESS || projectId !== HARNESS_PROJECT.id || typeof deploy !== 'string') return 'failed'
  const asked = (await headers()).get('x-inflozo-harness-history')
  if (asked === 'gone') return 'gone'
  if (asked === 'pin-fails') return 'failed'
  if (pinned && (asked === 'free-full' || asked === 'pro-full')) return 'cap'
  return pinned ? 'pinned' : 'unpinned'
}
