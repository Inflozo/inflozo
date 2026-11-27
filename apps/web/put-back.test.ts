// Story 7.23a — the put-back (`server/deploy/put-back.ts`) over a fake io: the spec's I/O matrix rows this layer owns — Roll back
// over the live theme and over another theme, Re-activate, Ghost's 422 and its other refusals, the undo, the four refusals that send
// nothing, gone, the number after a Roll back — and the source rules: the same Ghost requests as Ship it, no plan, no lock and no
// gscan on the path, and the real io's shared queries equal `deploy-io.ts`' own. The rows and words are `retention.test.ts`', the
// route's statuses `deploy.test.ts`', the drift baseline's order `deploy-run.test.ts`' and `drift.test.ts`'.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { DEPLOY_WORDS, deployError, nextVersion } from './lib/deploy.ts'
import { contentManifest, DRIFT_WORDS, historyCopyPath, LIVE_COPY_MAX_BYTES, liveCopyPath, type ContentManifest } from './lib/drift.ts'
import { actionOf, HISTORY_WORDS, newestAccepted } from './lib/retention.ts'
import { checkBeforePutBack, putBack, restoreOriginal, type CheckBefore, type OriginalRow, type PutBackIo, type PutBackOutcome, type RestoreOutcome } from './server/deploy/put-back.ts'
import { STALLED_MS } from './server/deploy/run.ts'
import { zipTheme } from './server/deploy/zip.ts'
import type { SnapshotAnswer } from './server/snapshot.ts'

const P = '00000000-0000-4000-8000-0000000000aa'
const S = '00000000-0000-4000-8000-0000000000bb'
const OTHER = '00000000-0000-4000-8000-0000000000dd'
const U = '00000000-0000-4000-8000-0000000000cc'
const NOW = new Date('2026-11-25T12:00:00Z')
/** Story 7.23b — the linked site's saved original's id, and when it was captured (as PostgREST answers a timestamptz) */
const SNAP = '00000000-0000-4000-8000-0000000000ee'
const CAPTURED = '2026-11-01T00:00:00+00:00'

type Answer = { ok: boolean; status: number; body: unknown; text: string }
const ok = (active = false): Answer => ({ ok: true, status: 200, body: { themes: [{ name: 'inflozo-notes', active }] }, text: '' })
const bad = (status: number, body: unknown = {}, text = JSON.stringify(body)): Answer => ({ ok: false, status, body, text })
const adminError = (code: string) => Object.assign(new Error(code), { name: 'AdminError', code })

type Row = { id: string; project_id: string; site_id: string; version: string; theme_name: string; status: string; artifact_path: string | null; created_at: string; accepted_at: string | null; activated: boolean; activated_at: string | null; content_manifest?: ContentManifest | null }
const row = (n: number, over: Partial<Row> = {}): Row => ({
  id: `v${n}`, project_id: P, site_id: S, version: `${n}.0.0`, theme_name: 'inflozo-notes', status: 'uploaded', artifact_path: `${P}/v${n}.zip`,
  created_at: `2026-11-0${n}T09:00:00.000Z`, accepted_at: `2026-11-0${n}T09:00:00.000Z`, activated: true, activated_at: `2026-11-0${n}T09:00:00.000Z`, ...over,
})

/** One world: v1–v3 on the linked site (v3 live) unless told otherwise, the bucket, Ghost's answers and every call, in order. */
function world(over: {
  rows?: Row[]
  upload?: Array<Answer | Error>
  activate?: Array<Answer | Error>
  linked?: { siteId: string; url: string; disconnected: boolean; declined?: boolean } | null
  moving?: boolean
  getFails?: number
  updateFails?: number
  /** R-291: the live theme's answers, in order, to the check's read */
  live?: Array<SnapshotAnswer | Error>
  baselineFails?: number
  /** Story 7.23b: the linked site's saved original (default: Casper, saved under the user's own prefix), and its reads failing */
  original?: OriginalRow | null
  originalFails?: number
  demoteFails?: number
  /** Story 7.23b's review: the row stands but the store has no object under its key */
  objectGone?: boolean
  /** Story 7.25: the site's lock not held within its wait (or not taken at all); by default held at once */
  lock?: 'held' | 'never' | 'throws'
} = {}) {
  const rows = new Map((over.rows ?? [row(1), row(2), row(3, { status: 'live' })]).map((r) => [r.id, { ...r }]))
  const bucket = new Map<string, Uint8Array>([...rows.values()].flatMap((r) => (r.artifact_path ? [[r.artifact_path, new TextEncoder().encode(`zip of ${r.id}`)] as const] : [])))
  const calls: { method?: string; path: string; item?: string; body?: unknown; route: string }[] = []
  const reads: string[] = []
  const logs: [string, unknown][] = []
  const upload = [...(over.upload ?? [ok()])]
  const activations = [...(over.activate ?? [ok()])]
  let getFails = over.getFails ?? 0
  let updateFails = over.updateFails ?? 0
  let baselineFails = over.baselineFails ?? 0
  const lives = [...(over.live ?? [])]
  /** every live read the check made (the theme's name), and every object it put with its options */
  const liveReads: string[] = []
  const puts: { path: string; opts: unknown }[] = []
  /** Story 7.23b: the saved original, the `site-snapshots` bucket, every key read from it, and every row update (a restore writes none) */
  const original = over.original === undefined ? { id: SNAP, theme_name: 'casper', storage_path: `site-snapshots/${U}/${S}/20261101T000000000Z-casper.zip`, captured_at: CAPTURED } : over.original
  const snapshots = new Map<string, Uint8Array>(original === null || over.objectGone ? [] : [[original.storage_path.replace(/^site-snapshots\//, ''), new TextEncoder().encode(`saved ${original.theme_name}`)]])
  const snapshotReads: string[] = []
  const updates: string[] = []
  let originalFails = over.originalFails ?? 0
  let demoteFails = over.demoteFails ?? 0
  const io: PutBackIo = {
    row: async ({ deployId, userId }) => {
      reads.push('row')
      const r = rows.get(deployId)
      return r === undefined || userId !== U ? null : { id: r.id, project_id: r.project_id, site_id: r.site_id, version: r.version, theme_name: r.theme_name, status: r.status, artifact_path: r.artifact_path }
    },
    newest: async ({ projectId, siteId }) => {
      reads.push('newest')
      return newestAccepted([...rows.values()].filter((r) => r.project_id === projectId && r.site_id === siteId))
    },
    baseline: async ({ projectId, siteId }) => {
      reads.push('baseline')
      if (baselineFails-- > 0) throw Object.assign(new Error('database'), { infra: true, code: 'PGRST000' })
      const id = newestAccepted([...rows.values()].filter((r) => r.project_id === projectId && r.site_id === siteId))
      const r = id === null ? undefined : rows.get(id)
      return r === undefined ? null : { version: r.version, content_manifest: r.content_manifest ?? null }
    },
    linked: async () => {
      reads.push('linked')
      return over.linked !== undefined ? (over.linked === null ? null : { declined: false, ...over.linked }) : { siteId: S, url: 'https://ghost6.inflozo.com', disconnected: false, declined: false }
    },
    moving: async ({ since }) => {
      reads.push(`moving:${since}`)
      return over.moving ?? false
    },
    original: async ({ siteId, userId }) => {
      reads.push('original')
      if (originalFails-- > 0) throw Object.assign(new Error('database'), { infra: true, code: 'PGRST000' })
      return siteId === S && userId === U ? original : null
    },
    snapshots: {
      get: async (key) => {
        snapshotReads.push(key)
        // the real io's answer for no such object (`NoSuchKey`): null
        return snapshots.get(key) ?? null
      },
    },
    deploys: {
      update: async (id, _u, patch) => {
        updates.push(id)
        if (updateFails-- > 0) throw Object.assign(new Error('database'), { infra: true, code: 'PGRST000' })
        rows.set(id, { ...(rows.get(id) as Row), ...(patch as Partial<Row>) })
      },
      // with no `except`, every live row on the site (Story 7.23b's restore) — the real io's own rule, held by the source test
      demote: async ({ siteId, except }) => {
        if (demoteFails-- > 0) throw Object.assign(new Error('database'), { infra: true, code: 'PGRST000' })
        for (const [k, r] of rows) if (k !== except && r.site_id === siteId && r.status === 'live') rows.set(k, { ...r, status: 'uploaded' })
      },
    },
    artifacts: {
      get: async (path) => {
        if (getFails-- > 0) throw Object.assign(new Error('storage'), { infra: true, code: 'storage_503' })
        return bucket.get(path) as Uint8Array
      },
      put: async (path, bytes, opts) => {
        puts.push({ path, opts })
        bucket.set(path, bytes)
      },
    },
    liveTheme: async ({ name }) => {
      liveReads.push(name)
      const next = lives.shift() ?? ({ ok: false, status: 404, body: {}, bytes: new Uint8Array() } as SnapshotAnswer)
      if (next instanceof Error) throw next
      return next
    },
    call: async (args) => {
      calls.push(args)
      const next = args.item === 'theme_upload' ? upload.shift() : activations.shift()
      if (next instanceof Error) throw next
      return next ?? ok()
    },
    log: (message, fields) => void logs.push([message, fields]),
    // Story 7.25: the lock's key is a read of its own, recorded in `reads` beside the body's own reads
    lock: async (siteId, run) => {
      reads.push(`lock:${siteId}`)
      if (over.lock === 'throws') throw Object.assign(new Error('connect'), { code: 'ECONNREFUSED' })
      if (over.lock === 'never') return { held: false }
      const value = await run()
      reads.push('unlock')
      return { held: true, value }
    },
  }
  const put = (deployId: string): Promise<PutBackOutcome> => putBack(io, { userId: U, projectId: P, deployId, now: NOW })
  const check = (deployId: string): Promise<CheckBefore> => checkBeforePutBack(io, { userId: U, projectId: P, deployId, now: NOW })
  const restore = (snapshotId = SNAP, userId = U, captured = CAPTURED): Promise<RestoreOutcome> => restoreOriginal(io, { userId, projectId: P, snapshotId, captured, now: NOW })
  return { io, rows, bucket, calls, reads, logs, put, check, restore, liveReads, puts, snapshotReads, updates }
}

const snapshotOf = (w: ReturnType<typeof world>) => JSON.stringify([...w.rows.values()])

test('Roll back over the live theme: v2\'s stored zip uploaded as {theme_name}.zip; Ghost answers `active`, so no PUT (R-264); v2 live with accepted_at and activated_at now, v3 demoted — the row updated, never copied, and nothing pruned', async () => {
  const w = world({ upload: [ok(true)] })
  assert.equal(await w.put('v2'), 'live')
  assert.equal(w.calls.length, 1, 'one upload, no activation')
  const [call] = w.calls
  assert.equal(call?.method, 'POST')
  assert.equal(call?.path, 'themes/upload/')
  assert.equal(call?.item, 'theme_upload')
  assert.equal(call?.route, 'projects/history')
  const file = (call?.body as FormData).get('file') as File
  assert.equal(file.name, 'inflozo-notes.zip', 'under the frozen name')
  assert.equal(new TextDecoder().decode(new Uint8Array(await file.arrayBuffer())), 'zip of v2', 'the stored artefact, as it was')
  const v2 = w.rows.get('v2') as Row
  assert.deepEqual([v2.status, v2.activated, v2.accepted_at, v2.activated_at], ['live', true, NOW.toISOString(), NOW.toISOString()])
  assert.equal(w.rows.get('v3')?.status, 'uploaded', 'the site\'s other live row is demoted')
  assert.equal(w.rows.size, 3, 'no row inserted, copied or deleted')
  assert.equal(w.bucket.size, 3, 'no object added or removed')
  // the version numbers are untouched: the next ship is still v4
  assert.equal(nextVersion([...w.rows.values()]), 4)
  // and v2 is now the newest accepted — the drift baseline (R-287) and the list's top
  assert.equal(newestAccepted([...w.rows.values()]), 'v2')
})

test('Roll back, theme not active: upload, then PUT activate → live; the activation refused → v2 `uploaded` with accepted_at now (D2d\'s row, Re-activate from there) — the outcome says so', async () => {
  const w = world()
  assert.equal(await w.put('v2'), 'live')
  assert.deepEqual(w.calls.map((c) => `${c.method} ${c.path}`), ['POST themes/upload/', 'PUT themes/inflozo-notes/activate/'])
  assert.equal(w.rows.get('v2')?.status, 'live')
  assert.equal(w.rows.get('v3')?.status, 'uploaded')

  const refused = world({ activate: [bad(422, { errors: [{ message: 'Theme is not compatible' }] })] })
  assert.equal(await refused.put('v2'), 'uploaded')
  const v2 = refused.rows.get('v2') as Row
  assert.deepEqual([v2.status, v2.accepted_at], ['uploaded', NOW.toISOString()])
  assert.equal(refused.rows.get('v3')?.status, 'live', 'nothing demoted: Ghost made nothing live')
  // the drawer's next read: v2 is the newest accepted and `uploaded`, so it is D2d's Re-activate
  assert.equal(actionOf(v2, { linkedSiteId: S, newest: newestAccepted([...refused.rows.values()]) }), 'reactivate')
  for (const thrown of [adminError('ghost_unreachable'), adminError('write_not_allowed')]) {
    const w2 = world({ activate: [thrown] })
    assert.equal(await w2.put('v2'), 'uploaded', `${(thrown as { code: string }).code} at the activation: the theme is on the site`)
  }
})

test('Re-activate: v3 `uploaded` and the newest accepted — `PUT activate` only, no upload; v3 live, the others demoted, accepted_at unchanged; Ghost refusing again changes nothing and is said with its detail', async () => {
  const rows = () => [row(1), row(2, { status: 'live', accepted_at: '2026-11-02T09:00:00.000Z' }), row(3, { activated: false, activated_at: null })]
  const w = world({ rows: rows() })
  assert.equal(await w.put('v3'), 'live')
  assert.deepEqual(w.calls.map((c) => `${c.method} ${c.path}`), ['PUT themes/inflozo-notes/activate/'], 'the activation alone')
  const v3 = w.rows.get('v3') as Row
  assert.deepEqual([v3.status, v3.activated, v3.activated_at, v3.accepted_at], ['live', true, NOW.toISOString(), '2026-11-03T09:00:00.000Z'])
  assert.equal(w.rows.get('v2')?.status, 'uploaded')

  const again = world({ rows: rows(), activate: [bad(422, { errors: [{ type: 'ThemeValidationError', message: 'Theme is not compatible or contains errors.' }] })] })
  const before = snapshotOf(again)
  assert.deepEqual(await again.put('v3'), { refused: deployError('ghost_theme_refused', { host: 'ghost6.inflozo.com', siteId: S, detail: 'Theme is not compatible or contains errors.' }) })
  assert.equal(snapshotOf(again), before, 'the row unchanged — still D2d\'s')
  for (const [answer, code] of [[bad(401), 'ghost_key_refused'], [bad(403, { errors: [{ type: 'HostLimitError' }] }), 'ghost_plan_refused']] as const) {
    const w2 = world({ rows: rows(), activate: [answer] })
    const out = await w2.put('v3')
    assert.equal(typeof out === 'object' ? out.refused.code : out, code)
    assert.equal(w2.rows.get('v3')?.status, 'uploaded')
  }
})

test('Re-activate when Ghost no longer holds the theme — its activation refused with a `ValidationError` (`activate.js:46-54`, both majors): the stored zip is uploaded under the frozen name, then activated, and the row goes live with accepted_at stamped; a 429/5xx is Ghost unavailable; the control: a `ThemeValidationError` is still Ghost\'s check refusing, with its detail', async () => {
  const rows = () => [row(1), row(2, { status: 'live', accepted_at: '2026-11-02T09:00:00.000Z' }), row(3, { activated: false, activated_at: null })]
  const missing = bad(422, { errors: [{ type: 'ValidationError', message: 'inflozo-notes cannot be activated because it was not found in the theme directory.' }] })
  const w = world({ rows: rows(), activate: [missing, ok()], upload: [ok(false)] })
  assert.equal(await w.put('v3'), 'live')
  assert.deepEqual(w.calls.map((c) => `${c.method} ${c.path}`), ['PUT themes/inflozo-notes/activate/', 'POST themes/upload/', 'PUT themes/inflozo-notes/activate/'], 'one upload after the refused activation, then the activation')
  const file = (w.calls[1]?.body as FormData).get('file') as File
  assert.equal(new TextDecoder().decode(new Uint8Array(await file.arrayBuffer())), 'zip of v3', 'the stored artefact, under the frozen name')
  const v3 = w.rows.get('v3') as Row
  assert.deepEqual([v3.status, v3.activated, v3.accepted_at, v3.activated_at], ['live', true, NOW.toISOString(), NOW.toISOString()])
  assert.equal(w.rows.get('v2')?.status, 'uploaded', 'the site\'s other live row demoted')

  for (const answer of [bad(503), bad(429), bad(500, {}, 'Internal Server Error')]) {
    const busy = world({ rows: rows(), activate: [answer] })
    const before = snapshotOf(busy)
    const out = await busy.put('v3')
    assert.equal(typeof out === 'object' ? out.refused.code : out, 'ghost_unavailable', `${answer.status} on Re-activate`)
    assert.equal(busy.calls.length, 1, 'nothing uploaded')
    assert.equal(snapshotOf(busy), before)
  }

  // the control: Ghost's own check refusing (a `ThemeValidationError`) is never a re-upload
  const check = world({ rows: rows(), activate: [bad(422, { errors: [{ type: 'ThemeValidationError', message: 'Theme is not compatible or contains errors.' }] })] })
  assert.deepEqual(await check.put('v3'), { refused: deployError('ghost_theme_refused', { host: 'ghost6.inflozo.com', siteId: S, detail: 'Theme is not compatible or contains errors.' }) })
  assert.equal(check.calls.length, 1, 'no upload')
})

test('Ghost refuses the upload — 422 `ThemeValidationError`: nothing recorded, the site untouched, never retried, Ghost\'s detail kept (VERIFY 10); the control: the same Roll back accepted goes live', async () => {
  const w = world({ upload: [bad(422, { errors: [{ type: 'ThemeValidationError', message: 'Theme is not compatible or contains errors.', context: 'Missing template index.hbs' }] })] })
  const before = snapshotOf(w)
  const out = await w.put('v1')
  assert.ok(typeof out === 'object')
  assert.equal(out.refused.code, 'ghost_theme_refused')
  assert.equal(out.refused.detail, 'Theme is not compatible or contains errors. Missing template index.hbs')
  assert.equal(w.calls.length, 1, 'one upload, never retried, and no activation')
  assert.equal(snapshotOf(w), before, 'no row changes')
  const control = world()
  assert.equal(await control.put('v1'), 'live')
})

test('Ghost\'s other failures — 401, the plan\'s limit, unreachable, EEXIST: nothing recorded beyond what Ghost accepted, each said as `deployError`\'s code', async () => {
  const cases: [Answer | Error, string][] = [
    [bad(401), 'ghost_key_refused'],
    [bad(403, { errors: [{ type: 'HostLimitError' }] }), 'ghost_plan_refused'],
    [adminError('ghost_unreachable'), 'ghost_unreachable'],
    [bad(500, {}, "EEXIST: file already exists, mkdir '/var/lib/ghost/content/themes/inflozo-notes'"), 'deploy_running'],
    [bad(503), 'ghost_unavailable'],
  ]
  for (const [answer, code] of cases) {
    const w = world({ upload: [answer] })
    const before = snapshotOf(w)
    const out = await w.put('v2')
    assert.ok(typeof out === 'object', code)
    assert.equal(out.refused.code, code)
    assert.equal(out.refused.message, deployError(code as never, { host: 'ghost6.inflozo.com', siteId: S }).message)
    assert.equal(snapshotOf(w), before, `${code}: no row changes`)
  }
})

test('the undo: after rolling back to v2, Roll back v3 puts v3 live again — the list returns to v3, v2, …', async () => {
  const w = world({ upload: [ok(true), ok(true)] })
  assert.equal(await w.put('v2'), 'live')
  assert.equal(await w.put('v3'), 'live')
  assert.equal(w.rows.get('v3')?.status, 'live')
  assert.equal(w.rows.get('v2')?.status, 'uploaded')
  assert.equal(newestAccepted([...w.rows.values()]), 'v3')
  assert.equal(w.calls.length, 2)
})

test('the refusals that send nothing to Ghost: gone (not the user\'s, another project\'s, pruned, failed), elsewhere (another site\'s row, or no link), live (the Live row), disconnected, busy (a ship moving within STALLED_MS) — in that order', async () => {
  const gone = world({ rows: [row(1, { project_id: OTHER }), row(2, { artifact_path: null }), row(3, { status: 'failed' })] })
  for (const id of ['v1', 'v2', 'v3', 'v9']) assert.equal(await gone.put(id), 'gone', id)
  // not the user's: the fake scopes `row` by the user, as the real io's `.eq('user_id', userId)` does (the source test below)
  const someoneElse = world()
  assert.equal(await putBack(someoneElse.io, { userId: 'someone-else', projectId: P, deployId: 'v2', now: NOW }), 'gone', 'another user\'s row')
  const other = world({ rows: [row(1, { site_id: OTHER }), row(2, { status: 'live' })] })
  assert.equal(await other.put('v1'), 'elsewhere')
  const unlinked = world({ linked: null })
  assert.equal(await unlinked.put('v2'), 'elsewhere', 'a project linked to no site')
  const live = world()
  assert.equal(await live.put('v3'), 'live-already')
  // the order: the Live row on a disconnected site is still `live`; another site's row on one is still `elsewhere`
  const disconnected = () => world({ linked: { siteId: S, url: 'https://ghost6.inflozo.com', disconnected: true } })
  const liveOff = disconnected()
  assert.equal(await liveOff.put('v3'), 'live-already')
  const off = disconnected()
  assert.equal(await off.put('v2'), 'disconnected')
  const busy = world({ moving: true })
  assert.equal(await busy.put('v2'), 'busy')
  assert.ok(busy.reads.includes(`moving:${new Date(NOW.getTime() - STALLED_MS).toISOString()}`), 'moving within STALLED_MS of now')
  const worlds = { gone, someoneElse, other, unlinked, live, liveOff, off, busy }
  for (const [name, w] of Object.entries(worlds)) assert.equal(w.calls.length, 0, `${name}: nothing sent to Ghost`)
})

test('the server decides the action: a press on a row that is no longer the newest accepted is a Roll back (an upload), never the activation the drawer drew', async () => {
  // the drawer drew v3 as D2d's Re-activate; meanwhile v2 was accepted later
  const w = world({ rows: [row(2, { status: 'live', accepted_at: '2026-11-09T09:00:00.000Z' }), row(3)], upload: [ok(true)] })
  assert.equal(await w.put('v3'), 'live')
  assert.deepEqual(w.calls.map((c) => c.item), ['theme_upload'])
})

test('an infrastructure failure (the store, twice) is ours, said as such — nothing reached Ghost', async () => {
  const w = world({ getFails: 2 })
  const out = await w.put('v2')
  assert.ok(typeof out === 'object')
  assert.equal(out.refused.code, 'deploy_infrastructure')
  assert.equal(out.refused.message, DEPLOY_WORDS.infrastructure, 'before Ghost acted: "before anything reached your site" is true')
  assert.equal(w.calls.length, 0)
  assert.deepEqual(w.logs.at(-1), ['put-back: infrastructure failed', { code: undefined, acted: 'no' }])
  // AD-20's rule: once is retried
  assert.equal(await world({ getFails: 1 }).put('v2'), 'live')
})

test('a record failing AFTER Ghost acted (the accepted active upload, then the row\'s update refused twice) says the version reached the site and History could not record it — never "before anything reached your site"', async () => {
  const w = world({ upload: [ok(true)], updateFails: 2 })
  const out = await w.put('v2')
  assert.ok(typeof out === 'object')
  assert.equal(out.refused.code, 'deploy_infrastructure')
  assert.equal(out.refused.message, HISTORY_WORDS.unrecorded(2, 'ghost6.inflozo.com'))
  assert.equal(HISTORY_WORDS.unrecorded(2, 'ghost6.inflozo.com'), "v2 reached ghost6.inflozo.com, but History couldn't record it. Try again.")
  assert.equal(w.calls.length, 1, 'Ghost took the upload')
  assert.deepEqual(w.logs.at(-1), ['put-back: infrastructure failed', { code: undefined, acted: 'yes' }])
  // and after a Re-activate Ghost made: the same
  const re = world({ rows: [row(2, { status: 'live', accepted_at: '2026-11-02T09:00:00.000Z' }), row(3)], updateFails: 2 })
  const after = await re.put('v3')
  assert.equal(typeof after === 'object' ? after.refused.message : after, HISTORY_WORDS.unrecorded(3, 'ghost6.inflozo.com'))
})

test('Ghost\'s refusals are logged by code — the code alone, never Ghost\'s detail or the host (the I/O matrix); the control: a Roll back that lands logs no refusal', async () => {
  const w = world({ upload: [bad(422, { errors: [{ type: 'ThemeValidationError', message: 'Theme is not compatible or contains errors.' }] })] })
  await w.put('v2')
  assert.deepEqual(w.logs, [['put-back: Ghost refused', { code: 'ghost_theme_refused' }]])
  const unavailable = world({ upload: [bad(503)] })
  await unavailable.put('v2')
  assert.deepEqual(unavailable.logs, [['put-back: Ghost refused', { code: 'ghost_unavailable' }]])
  const landed = world({ upload: [ok(true)] })
  assert.equal(await landed.put('v2'), 'live')
  assert.deepEqual(landed.logs, [])
})

// ── R-291: the drift check before a Roll back (`checkBeforePutBack`) ─────────────────────────────────────────────────────

/** the theme Inflozo shipped as v3 — a section partial (its layer named in the manifest), a template, the settings, a read me — and
 *  its manifest, made by the drift check's own rule */
const SHIPPED: Record<string, string> = {
  'partials/sections/home/hero.hbs': '<section class="hero">Version 3</section>\n',
  'home.hbs': '{{!< default}}\n{{> sections/home/hero}}\n',
  'package.json': '{"name":"inflozo-notes","version":"3.0.0"}\n',
  'README.md': 'An Inflozo theme.\n',
}
const SECTIONS = { 'partials/sections/home/hero.hbs': { id: 'inst-hero', layer: 'Front hero', category: 'a4' } }
const shipped = (): Promise<ContentManifest> => contentManifest(SHIPPED, SECTIONS)
const liveOf = (files: Record<string, string>): SnapshotAnswer => ({ ok: true, status: 200, body: null, bytes: zipTheme(files) })
const ghostSays = (status: number): SnapshotAnswer => ({ ok: false, status, body: {}, bytes: new Uint8Array() })
/** v1–v3 on the linked site, v3 live and the newest accepted, each carrying v3's manifest as its own (only the baseline's is read) */
const checked = async (over: Parameters<typeof world>[0] = {}) => {
  const manifest = await shipped()
  return world({ rows: [row(1, { content_manifest: manifest }), row(2, { content_manifest: manifest }), row(3, { status: 'live', content_manifest: manifest })], ...over })
}
/** the site, edited outside Inflozo: the section and the template changed, a template added, the read me gone */
const EDITED: Record<string, string> = {
  ...Object.fromEntries(Object.entries(SHIPPED).filter(([p]) => p !== 'README.md')),
  'partials/sections/home/hero.hbs': '<section class="hero">Edited in Ghost</section>\n',
  'home.hbs': '{{!< default}}\n{{> sections/home/hero}}\n<p>by hand</p>\n',
  'custom-handmade.hbs': '{{!< default}}\n<p>made in Ghost</p>\n',
}

test('R-291: the check refuses exactly as the put-back does, in the same order — gone, elsewhere, live, disconnected, busy — and nothing reaches Ghost: no live read, no call, no copy put', async () => {
  const gone = await checked({ rows: [row(1, { project_id: OTHER }), row(2, { artifact_path: null }), row(3, { status: 'failed' })] })
  for (const id of ['v1', 'v2', 'v3', 'v9']) assert.equal(await gone.check(id), 'gone', id)
  const someoneElse = await checked()
  assert.equal(await checkBeforePutBack(someoneElse.io, { userId: 'someone-else', projectId: P, deployId: 'v2', now: NOW }), 'gone', 'another user\'s row')
  const other = await checked({ rows: [row(1, { site_id: OTHER }), row(2, { status: 'live' })] })
  assert.equal(await other.check('v1'), 'elsewhere')
  const unlinked = await checked({ linked: null })
  assert.equal(await unlinked.check('v2'), 'elsewhere')
  const live = await checked()
  assert.equal(await live.check('v3'), 'live-already')
  const off = await checked({ linked: { siteId: S, url: 'https://ghost6.inflozo.com', disconnected: true } })
  assert.equal(await off.check('v3'), 'live-already', 'the order: the Live row on a disconnected site is still `live`')
  assert.equal(await off.check('v2'), 'disconnected')
  const busy = await checked({ moving: true })
  assert.equal(await busy.check('v2'), 'busy')
  assert.ok(busy.reads.includes(`moving:${new Date(NOW.getTime() - STALLED_MS).toISOString()}`), 'moving within STALLED_MS of now')
  for (const [name, w] of Object.entries({ gone, someoneElse, other, unlinked, live, off, busy })) {
    assert.deepEqual([w.liveReads.length, w.calls.length, w.puts.length], [0, 0, 0], `${name}: nothing read from or sent to Ghost, nothing kept`)
    assert.ok(!w.reads.includes('baseline'), `${name}: no baseline read`)
  }
  // the control: the same world admitted reads the baseline and the live theme
  const admitted = await checked({ live: [liveOf(SHIPPED)] })
  assert.deepEqual(await admitted.check('v2'), { drift: { kind: 'clean', since: 3 } })
  assert.deepEqual(admitted.liveReads, ['inflozo-notes'])
})

test('R-291 (FR-J16): drift is never asserted without two manifests in hand — no accepted upload, or one whose manifest is null (made before Story 7.21), answers null and Ghost is never read', async () => {
  const before = world({ live: [liveOf(EDITED)] })
  assert.deepEqual(await before.check('v2'), { drift: null }, 'the baseline v3 has no manifest')
  assert.equal(before.liveReads.length, 0)
  const nulled = world({ rows: [row(1), row(2), row(3, { status: 'live', content_manifest: null })], live: [liveOf(EDITED)] })
  assert.deepEqual(await nulled.check('v2'), { drift: null })
  assert.deepEqual([nulled.liveReads.length, nulled.puts.length, nulled.calls.length], [0, 0, 0])
  // the control: the same baseline with its manifest reads the live theme
  const control = await checked({ live: [liveOf(EDITED)] })
  assert.equal(((await control.check('v2')) as { drift: { kind: string } }).drift.kind, 'found')
})

test('R-291: clean — the live theme under the row\'s frozen name equals the newest accepted upload: D3c since THAT version (after a Roll back to v2, since v2), nothing kept, nothing sent', async () => {
  const w = await checked({ live: [liveOf(SHIPPED)] })
  assert.deepEqual(await w.check('v1'), { drift: { kind: 'clean', since: 3 } })
  assert.deepEqual(w.liveReads, ['inflozo-notes'], 'the theme under the frozen name, read once')
  assert.deepEqual([w.puts.length, w.calls.length], [0, 0], 'nothing kept, nothing sent: the check reads')
  // after a Roll back to v2 the baseline is v2 — the newest accepted (R-287, DW-400)
  const after = await checked({ upload: [ok(true)], live: [liveOf(SHIPPED)] })
  assert.equal(await after.put('v2'), 'live')
  assert.deepEqual(await after.check('v3'), { drift: { kind: 'clean', since: 2 } })
})

test('R-291: found — each file named as the MANIFEST names it (its own layer, no working document), the live zip kept at the check\'s own key BEFORE it answers, overwriting, and never Ship it\'s key (DW-396); past the store\'s size, `kept: false` and nothing put', async () => {
  const w = await checked({ live: [liveOf(EDITED)] })
  const answer = await w.check('v2')
  assert.deepEqual(answer, {
    drift: {
      kind: 'found', since: 3, theme: 'inflozo-notes',
      changed: [{ path: 'home.hbs', label: 'Home' }, { path: 'partials/sections/home/hero.hbs', label: 'Front hero', category: 'a4' }],
      added: [{ path: 'custom-handmade.hbs', label: DRIFT_WORDS.labels.addedTemplate }],
      removed: [{ path: 'README.md', label: DRIFT_WORDS.labels.readMe }],
    },
  })
  assert.deepEqual(w.puts, [{ path: historyCopyPath(P, S), opts: { replace: true } }], 'one put, at the check\'s own key, replacing the last')
  assert.equal(historyCopyPath(P, S), `${P}/live/${S}-history.zip`)
  assert.notEqual(historyCopyPath(P, S), liveCopyPath(P, S), 'never Ship it\'s key: a resting D3a\'s Download keeps its own zip')
  assert.deepEqual(w.bucket.get(historyCopyPath(P, S)), zipTheme(EDITED), 'the zip this check read, as it came')
  assert.equal(w.calls.length, 0, 'nothing sent to Ghost')
  assert.equal('kept' in ((answer as { drift: object }).drift), false, 'a zip within the size is kept, and its record carries no `kept`')
  // past the store's size (a hand-added file of random bytes, which no deflate shrinks): the record says so, and nothing is put — a
  // put the store refuses would refuse again
  const bytes = zipTheme({ ...EDITED, 'assets/huge.bin': randomBytes(LIVE_COPY_MAX_BYTES) })
  assert.ok(bytes.length > LIVE_COPY_MAX_BYTES, 'the planted zip is past the limit')
  const huge = await checked({ live: [{ ok: true, status: 200, body: null, bytes }] })
  const unkept = await huge.check('v2')
  assert.equal(typeof unkept === 'object' && 'drift' in unkept && unkept.drift?.kind === 'found' ? unkept.drift.kept : 'not found', false)
  assert.equal(huge.puts.length, 0, 'nothing put past the size')
})

test('R-291: every cause maps as Ship it\'s check maps it, the check never throws and keeps nothing — no token, a refused token, a role that cannot read themes, the theme gone (400/404), Ghost unreachable or answering 5xx, a zip that is not one; R-278: a missing token on a site whose Not now is recorded is the decline (the control: the same site undeclined is `no_token`)', async () => {
  const thrown = (code: string) => Object.assign(new Error(code), { name: 'AdminError', code })
  const cases: [SnapshotAnswer | Error, unknown][] = [
    [thrown('credential_missing'), { kind: 'unverified', cause: 'no_token', theme: 'inflozo-notes' }],
    [ghostSays(401), { kind: 'unverified', cause: 'token_refused', theme: 'inflozo-notes' }],
    [ghostSays(403), { kind: 'unverified', cause: 'role', theme: 'inflozo-notes' }],
    [ghostSays(400), { kind: 'unverified', cause: 'missing', theme: 'inflozo-notes' }],
    [ghostSays(404), { kind: 'unverified', cause: 'missing', theme: 'inflozo-notes' }],
    [thrown('ghost_unreachable'), { kind: 'unverified', cause: 'unreachable', theme: 'inflozo-notes' }],
    [new Error('a timeout'), { kind: 'unverified', cause: 'unreachable', theme: 'inflozo-notes' }],
    [ghostSays(502), { kind: 'unverified', cause: 'unreachable', theme: 'inflozo-notes', status: 502 }],
    [{ ok: true, status: 200, body: null, bytes: new TextEncoder().encode('<html>not a zip</html>') }, { kind: 'unverified', cause: 'unreadable', theme: 'inflozo-notes' }],
  ]
  for (const [answer, want] of cases) {
    const w = await checked({ live: [answer] })
    assert.deepEqual(await w.check('v2'), { drift: want }, JSON.stringify(want))
    assert.deepEqual([w.puts.length, w.calls.length], [0, 0])
  }
  const declined = await checked({ live: [thrown('credential_missing')], linked: { siteId: S, url: 'https://ghost6.inflozo.com', disconnected: false, declined: true } })
  assert.deepEqual(await declined.check('v2'), { drift: { kind: 'unverified', cause: 'declined', theme: 'inflozo-notes' } })
  // the decline changes the missing token's words alone: a refused token on the same site is still refused
  const refusedThere = await checked({ live: [ghostSays(401)], linked: { siteId: S, url: 'https://ghost6.inflozo.com', disconnected: false, declined: true } })
  assert.deepEqual(await refusedThere.check('v2'), { drift: { kind: 'unverified', cause: 'token_refused', theme: 'inflozo-notes' } })
})

test('R-291: an infrastructure failure, twice, is ours — `deploy_infrastructure`, logged by code — and once is retried; nothing reached Ghost', async () => {
  const w = await checked({ baselineFails: 2, live: [liveOf(SHIPPED)] })
  const out = await w.check('v2')
  assert.ok(typeof out === 'object' && 'refused' in out)
  assert.equal(out.refused.code, 'deploy_infrastructure')
  assert.equal(out.refused.message, DEPLOY_WORDS.infrastructure)
  assert.deepEqual([w.liveReads.length, w.calls.length], [0, 0])
  assert.deepEqual(w.logs.at(-1), ['put-back: the check failed', { code: undefined }])
  assert.deepEqual(await (await checked({ baselineFails: 1, live: [liveOf(SHIPPED)] })).check('v2'), { drift: { kind: 'clean', since: 3 } })
})

// ── Story 7.23b — Restore original (R-292: activate the original by its name first; upload the saved zip only when Ghost no longer
// holds it, never Casper or Source; live demotes every live row on the site; no `deploys` row is ever written) ──────────────────

const theme = (name: string, over: Partial<OriginalRow> = {}): OriginalRow => ({ id: SNAP, theme_name: name, storage_path: `site-snapshots/${U}/${S}/20261101T000000000Z-${name}.zip`, captured_at: CAPTURED, ...over })
const notHeld = (name: string) => bad(422, { errors: [{ type: 'ValidationError', message: `${name} cannot be activated because it was not found in the theme directory.` }] })
const refusedCheck = bad(422, { errors: [{ type: 'ThemeValidationError', message: 'Theme is not compatible or contains errors.', context: 'Missing template post.hbs' }] })
/** what a restore may change: the rows' statuses, nothing else */
const recordOf = (w: ReturnType<typeof world>) => JSON.stringify([...w.rows.values()].map(({ status: _s, ...rest }) => rest))

test('7.23b · Ghost holds it (Casper): `PUT themes/casper/activate/` ALONE → live; every live row on the site demoted (v3 `uploaded`, its `activated`, `activated_at` and `accepted_at` untouched) — no row inserted, no row updated, no upload, so v3 is D2d\'s Re-activate (the undo) and the drift baseline holds', async () => {
  const w = world()
  const record = recordOf(w)
  assert.equal(await w.restore(), 'live')
  assert.deepEqual(w.calls.map((c) => `${c.method} ${c.path}`), ['PUT themes/casper/activate/'], 'the activation alone')
  assert.deepEqual([w.calls[0]?.item, w.calls[0]?.route], ['theme_activate', 'projects/history'])
  assert.deepEqual([...w.rows.values()].map((r) => r.status), ['uploaded', 'uploaded', 'uploaded'], 'nothing of Inflozo\'s is live on the site')
  assert.equal(recordOf(w), record, 'activated, activated_at, accepted_at and the manifests untouched')
  assert.deepEqual(w.updates, [], 'no deploys row written — never `accepted_at`')
  assert.equal(w.rows.size, 3, 'no row inserted')
  assert.deepEqual(w.snapshotReads, [], 'the saved zip is not read when Ghost holds the theme')
  const v3 = w.rows.get('v3') as Row
  assert.equal(actionOf(v3, { linkedSiteId: S, newest: newestAccepted([...w.rows.values()]) }), 'reactivate', 'D2d\'s row: one press back to Inflozo')
  assert.equal(newestAccepted([...w.rows.values()]), 'v3', 'the drift baseline (R-287) is still v3')
  // the undo: Re-activate on v3 — the activation of the frozen name alone, Inflozo's files as Ghost kept them
  assert.equal(await w.put('v3'), 'live')
  assert.deepEqual(w.calls.slice(1).map((c) => `${c.method} ${c.path}`), ['PUT themes/inflozo-notes/activate/'])
  assert.equal(w.rows.get('v3')?.status, 'live')
})

test('7.23b · Ghost no longer holds a non-default original (deleted in Ghost Admin): the saved zip — read by its key without the bucket — uploaded as `{name}.zip`, then activated → live; an upload Ghost makes live at once needs no activation; the activation refused after the upload is `uploaded`, nothing written', async () => {
  const w = world({ original: theme('edition'), activate: [notHeld('edition'), ok()], upload: [ok(false)] })
  assert.equal(await w.restore(), 'live')
  assert.deepEqual(w.calls.map((c) => `${c.method} ${c.path}`), ['PUT themes/edition/activate/', 'POST themes/upload/', 'PUT themes/edition/activate/'])
  assert.deepEqual(w.snapshotReads, [`${U}/${S}/20261101T000000000Z-edition.zip`], '`snapshotObjectKey` strips the bucket')
  const file = (w.calls[1]?.body as FormData).get('file') as File
  assert.equal(file.name, 'edition.zip', 'under the original\'s own name — never the frozen one')
  assert.equal(new TextDecoder().decode(new Uint8Array(await file.arrayBuffer())), 'saved edition', 'the saved copy, as it was')
  assert.equal(w.rows.get('v3')?.status, 'uploaded')
  assert.deepEqual(w.updates, [])

  const atOnce = world({ original: theme('edition'), activate: [notHeld('edition')], upload: [ok(true)] })
  assert.equal(await atOnce.restore(), 'live')
  assert.equal(atOnce.calls.length, 2, 'live at once: no second activation')

  const notLive = world({ original: theme('edition'), activate: [notHeld('edition'), bad(422, { errors: [{ type: 'ValidationError', message: 'busy' }] })], upload: [ok(false)] })
  const before = snapshotOf(notLive)
  assert.equal(await notLive.restore(), 'uploaded')
  assert.equal(snapshotOf(notLive), before, 'nothing written: Inflozo\'s version is still live')
  assert.deepEqual(notLive.updates, [])
})

test('7.23b · DW-389: Casper and Source are only ever activated — a `ValidationError` for either (never seen: Ghost never deletes them) is Ghost\'s words with nothing uploaded; never `casper.zip` or `source.zip`', async () => {
  for (const name of ['casper', 'source']) {
    const w = world({ original: theme(name), activate: [notHeld(name)], upload: [ok(true)] })
    const before = snapshotOf(w)
    const out = await w.restore()
    assert.ok(typeof out === 'object', name)
    assert.equal(out.refused.code, 'ghost_theme_refused')
    assert.equal(out.refused.detail, `${name} cannot be activated because it was not found in the theme directory.`, 'Ghost\'s words')
    assert.deepEqual(w.calls.map((c) => c.item), ['theme_activate'], `${name}: no upload`)
    assert.deepEqual(w.snapshotReads, [])
    assert.equal(snapshotOf(w), before)
  }
  // the control: the same refusal for a theme that is not Ghost's own uploads the saved zip
  const control = world({ original: theme('casper-fork'), activate: [notHeld('casper-fork'), ok()], upload: [ok(false)] })
  assert.equal(await control.restore(), 'live')
  assert.deepEqual(control.calls.map((c) => c.item), ['theme_activate', 'theme_upload', 'theme_activate'])
})

test('7.23b · Ghost\'s check refuses (422 `ThemeValidationError`) at the activation or at the upload: nothing changes, its detail kept, never retried', async () => {
  const atActivation = world({ original: theme('old-magazine'), activate: [refusedCheck] })
  const before = snapshotOf(atActivation)
  const out = await atActivation.restore()
  assert.deepEqual(out, { refused: deployError('ghost_theme_refused', { host: 'ghost6.inflozo.com', siteId: S, detail: 'Theme is not compatible or contains errors. Missing template post.hbs' }) })
  assert.equal(atActivation.calls.length, 1, 'no upload, no retry')
  assert.equal(snapshotOf(atActivation), before)

  const atUpload = world({ original: theme('old-magazine'), activate: [notHeld('old-magazine')], upload: [refusedCheck] })
  const was = snapshotOf(atUpload)
  const refused = await atUpload.restore()
  assert.ok(typeof refused === 'object')
  assert.equal(refused.refused.code, 'ghost_theme_refused')
  assert.equal(refused.refused.detail, 'Theme is not compatible or contains errors. Missing template post.hbs')
  assert.deepEqual(atUpload.calls.map((c) => c.item), ['theme_activate', 'theme_upload'], 'one upload, never retried, no activation after it')
  assert.equal(snapshotOf(atUpload), was)
  assert.deepEqual(atUpload.logs, [['restore: Ghost refused', { code: 'ghost_theme_refused' }]], 'logged by code')
})

test('7.23b · Ghost\'s other answers — 401, 429/5xx, unreachable — are `deployError`\'s, nothing written; a 429/5xx at the activation is never a re-upload', async () => {
  const cases: [Answer | Error, string][] = [
    [bad(401), 'ghost_key_refused'],
    [bad(429), 'ghost_unavailable'],
    [bad(503), 'ghost_unavailable'],
    [adminError('ghost_unreachable'), 'ghost_unreachable'],
  ]
  for (const [answer, code] of cases) {
    const w = world({ original: theme('edition'), activate: [answer] })
    const before = snapshotOf(w)
    const out = await w.restore()
    assert.ok(typeof out === 'object', code)
    assert.equal(out.refused.code, code)
    assert.equal(out.refused.message, deployError(code as never, { host: 'ghost6.inflozo.com', siteId: S }).message)
    assert.equal(w.calls.length, 1, `${code}: nothing uploaded`)
    assert.equal(snapshotOf(w), before)
  }
})

test('7.23b · the original already live (switched back by hand in Ghost Admin): the activation answers live, and any stale live row is demoted', async () => {
  const w = world()
  assert.equal(await w.restore(), 'live')
  assert.equal(w.rows.get('v3')?.status, 'uploaded')
  // nothing live left to demote: still live, still no write but the (empty) demote
  assert.equal(await w.restore(), 'live')
  assert.deepEqual(w.updates, [])
})

test('7.23b · the refusals that send nothing to Ghost: gone (no link, no snapshot, a snapshot replaced since the read, another user\'s), then disconnected, then busy (a ship moving within STALLED_MS) — in the put-back\'s order', async () => {
  const unlinked = world({ linked: null })
  assert.equal(await unlinked.restore(), 'gone', 'no linked site')
  const none = world({ original: null })
  assert.equal(await none.restore(), 'gone', 'no snapshot')
  const replaced = world()
  assert.equal(await replaced.restore('00000000-0000-4000-8000-0000000000ff'), 'gone', 'another row since History was read (purged, then captured again)')
  // Story 7.23b's review: a later capture UPSERTS on `site_id`, so the row keeps its id — its `captured_at` is what moved. The
  // control: the same instant written another way (the editor's ISO string) is the row History drew
  const recaptured = world({ original: theme('edition', { captured_at: '2026-11-20T08:00:00+00:00' }) })
  assert.equal(await recaptured.restore(SNAP, U, CAPTURED), 'gone', 'replaced by a later capture since History was read: same id, later capture')
  assert.equal(await world().restore(SNAP, U, '2026-11-01T00:00:00.000Z'), 'live', 'the control: the capture History drew')
  // a row with no name is never sent to Ghost as `null` (the column is nullable)
  const nameless = world({ original: theme('casper', { theme_name: null }) })
  assert.equal(await nameless.restore(), 'gone', 'no name')
  const someoneElse = world()
  assert.equal(await someoneElse.restore(SNAP, 'someone-else'), 'gone', 'another user\'s: the fake scopes by user as the real io does')
  // the order: a replaced snapshot on a disconnected site is still gone; a busy disconnected site is disconnected
  const goneOff = world({ linked: { siteId: S, url: 'https://ghost6.inflozo.com', disconnected: true } })
  assert.equal(await goneOff.restore('00000000-0000-4000-8000-0000000000ff'), 'gone')
  const off = world({ linked: { siteId: S, url: 'https://ghost6.inflozo.com', disconnected: true }, moving: true })
  assert.equal(await off.restore(), 'disconnected')
  const busy = world({ moving: true })
  assert.equal(await busy.restore(), 'busy')
  assert.ok(busy.reads.includes(`moving:${new Date(NOW.getTime() - STALLED_MS).toISOString()}`), 'moving within STALLED_MS of now')
  for (const [name, w] of Object.entries({ unlinked, none, replaced, recaptured, nameless, someoneElse, goneOff, off, busy })) {
    assert.equal(w.calls.length, 0, `${name}: nothing sent to Ghost`)
    assert.deepEqual(w.updates, [], `${name}: nothing written`)
  }
})

test('7.23b · infrastructure: a read failing twice before Ghost acted is ours ("before anything reached your site"); once is retried; the demote failing twice AFTER Ghost acted says the original reached the site and History could not record it', async () => {
  const before = world({ originalFails: 2 })
  const out = await before.restore()
  assert.ok(typeof out === 'object')
  assert.equal(out.refused.message, DEPLOY_WORDS.infrastructure)
  assert.equal(before.calls.length, 0)
  assert.equal(await world({ originalFails: 1 }).restore(), 'live')
  const after = world({ demoteFails: 2 })
  const unrecorded = await after.restore()
  assert.ok(typeof unrecorded === 'object')
  assert.equal(unrecorded.refused.code, 'deploy_infrastructure')
  assert.equal(unrecorded.refused.message, HISTORY_WORDS.restoreUnrecorded('ghost6.inflozo.com'))
  assert.equal(HISTORY_WORDS.restoreUnrecorded('ghost6.inflozo.com'), "Your original theme reached ghost6.inflozo.com, but History couldn't record it. Try again.")
  assert.deepEqual(after.logs.at(-1), ['restore: infrastructure failed', { code: undefined, acted: 'yes' }])
})

test('7.23b · the saved zip is no longer in the store (purged, or a capture replacing it since the read) when Ghost no longer holds the theme: gone, never "try again" — nothing uploaded, nothing written; the control: the object there is uploaded', async () => {
  const w = world({ original: theme('edition'), activate: [notHeld('edition')], objectGone: true })
  const before = snapshotOf(w)
  assert.equal(await w.restore(), 'gone')
  assert.deepEqual(w.calls.map((c) => c.item), ['theme_activate'], 'the activation alone: no upload')
  assert.equal(snapshotOf(w), before)
  const control = world({ original: theme('edition'), activate: [notHeld('edition'), ok()], upload: [ok(false)] })
  assert.equal(await control.restore(), 'live')
  // the real io reads Storage's `NoSuchKey` (`statusCode` "404") as null, and only that
  const io = readFileSync('server/deploy/put-back-io.ts', 'utf8')
  assert.match(io, /if \(missing\?\.code === 'NoSuchKey' \|\| missing\?\.statusCode === '404'\) return null\n\s*const blob = ok\(answer, 'original download'\)/)
})

// ── the source rules ─────────────────────────────────────────────────────────────────────────────────────────────────

const flat = (path: string) => readFileSync(path, 'utf8').replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ')
const HISTORY_ROUTE = 'app/(app)/app/(authed)/projects/[id]/history/route.ts'

test('no lock, no plan, no gscan: the put-back module, its io and the route\'s act branch name none of `holdsLock`, `resolveEntitlement`, `readEntitlement`, a plan, `gscanGate` or `qualityGate`; the control: the pin branch beside it reads the plan', () => {
  const route = flat(HISTORY_ROUTE)
  const act = route.slice(route.indexOf('if (act !== undefined) {'), route.indexOf('if (typeof pinned !== \'boolean\')'))
  assert.ok(act.includes('putBack(PUT_BACK_IO'), 'the act branch is the put-back')
  // R-291: …and the check before a Roll back, in the same branch, so the same rule reads it
  assert.ok(act.includes('checkBeforePutBack(PUT_BACK_IO'), 'the act branch is the check too')
  const banned = /holdsLock|resolveEntitlement|readEntitlement|entitlement|caps\.|gscanGate|qualityGate|gscan\(|edit-lock/
  for (const [what, text] of [['put-back.ts', flat('server/deploy/put-back.ts')], ['put-back-io.ts', flat('server/deploy/put-back-io.ts')], ['the act branch', act]] as const) {
    assert.doesNotMatch(text, banned, `${what} consults a lock, a plan or a gate`)
  }
  // the control: the same test sees the pin branch's plan read
  assert.match(route.slice(route.indexOf('if (typeof pinned !== \'boolean\')')), /resolveEntitlement/)
  assert.match(route, /export const maxDuration = 300/)
})

test('7.23b · no lock, no plan, no gscan, no working document, no deploys write: `restoreOriginal` and the route\'s restore branch name none of them — the control: the same test sees the pin branch\'s plan read', () => {
  const back = flat('server/deploy/put-back.ts')
  const restore = back.slice(back.indexOf('export async function restoreOriginal('))
  assert.ok(restore.includes('sendActivate(io, {') && restore.includes('sendUpload(io, {'), 'the restore is this function')
  const route = flat(HISTORY_ROUTE)
  const branch = route.slice(route.indexOf("if (act === 'restore') {"), route.indexOf("if (typeof deploy !== 'string'"))
  assert.ok(branch.includes('restoreOriginal(PUT_BACK_IO'), 'the restore branch is the restore')
  assert.ok(route.indexOf("if (act === 'restore') {") < route.indexOf("if (typeof deploy !== 'string'"), 'checked before `deploy`, which it does not carry')
  const banned = /holdsLock|resolveEntitlement|readEntitlement|entitlement|caps\.|gscanGate|qualityGate|gscan\(|edit-lock|readProject|compileInputOf|\.read\(/
  for (const [what, text] of [['restoreOriginal', restore], ['the restore branch', branch]] as const) assert.doesNotMatch(text, banned, `${what} consults a lock, a plan, a gate or the document`)
  assert.doesNotMatch(restore, /deploys\.update|\.insert\(|accepted_at|content_manifest|offerRoutes|routes\.yaml/, 'no deploys row written, no routes')
  assert.match(restore, /io\.deploys\.demote\(\{ siteId: linked\.siteId, userId: a\.userId \}\)/, 'every live row on the site: no `except`')
  assert.match(restore, /GHOST_DEFAULTS\.has\(name\)/, 'DW-389')
  assert.match(back, /const GHOST_DEFAULTS: ReadonlySet<string> = new Set\(\['casper', 'source'\]\)/)
  assert.match(route.slice(route.indexOf("if (typeof pinned !== 'boolean')")), /resolveEntitlement/, 'the control')
})

test('the put-back sends exactly what Ship it sends: both reach Ghost through `sendUpload` and `sendActivate` and read the answers with `uploadAnswer` and `activateAnswer`; it never prunes, inserts, removes or uploads routes', () => {
  const run = flat('server/deploy/run.ts')
  const back = flat('server/deploy/put-back.ts')
  for (const name of ['sendUpload(io, {', 'sendActivate(io, {', 'uploadAnswer(', 'activateAnswer(']) {
    assert.ok(run.includes(name), `ship uses ${name}`)
    assert.ok(back.includes(name), `the put-back uses ${name}`)
  }
  assert.doesNotMatch(run.slice(run.indexOf('export async function ship(')), /new FormData\(\)|themes\/upload\//, 'ship builds no request of its own')
  assert.doesNotMatch(back, /\.prune|\.insert\(|\.remove\(|offerRoutes|routes\.yaml|settings\/routes/, 'no prune, no row inserted or removed, no routes upload')
})

test('the real io\'s shared members query as `deploy-io.ts`\' own do — the row\'s update, the site\'s demote and the stored zip\'s read — and every query carries `user_id`', () => {
  const io = flat('server/deploy/put-back-io.ts')
  const deploy = flat('server/deploy/deploy-io.ts')
  // each member read from its own block (`deploys: {`, `artifacts: {`) — `jobs` has an `update` too
  const member = (text: string, block: string, head: string) => {
    const at = text.indexOf(head, text.indexOf(block))
    return text.slice(at, text.indexOf('}', text.indexOf(')', at + head.length)) + 1)
  }
  for (const [block, head] of [['deploys: {', 'async update(id, userId, patch) {'], ['deploys: {', 'async demote({ siteId, userId, except }) {'], ['artifacts: {', 'async get(path) {']] as const) {
    assert.ok(io.includes(head), head)
    assert.equal(member(io, block, head), member(deploy, block, head), `${head} matches deploy-io.ts`)
  }
  // Story 7.23b — the demote whole, its optional `except` included (the member read above stops at its first brace)
  const demote = (text: string) => text.slice(text.indexOf('async demote({ siteId, userId, except }) {'), text.indexOf("'deploy demote')") + 16)
  assert.equal(demote(io), demote(deploy), 'the demote is the same in both files')
  assert.match(demote(io), /ok\(await \(except === undefined \? live : live\.neq\('id', except\)\), 'deploy demote'\)/, 'with no `except`, every live row on the site')
  // each table query, up to its `ok()` label
  const queries = io.split('supabaseAdmin().from(').slice(1).map((q) => q.slice(0, q.indexOf("), '") + 1))
  // every `supabaseAdmin()` in the io is one of the queries checked — none escapes the split — and there is at least one
  assert.equal(queries.length + (io.match(/supabaseAdmin\(\)\.storage\./g) ?? []).length, (io.match(/supabaseAdmin\(\)/g) ?? []).length, 'every service-role call is checked')
  assert.ok(queries.length > 0)
  for (const q of queries) assert.match(q, /\.eq\('user_id', userId\)/, q.slice(0, 80))
  // the newest accepted is the drift baseline's order
  assert.match(io, /\.order\('accepted_at', \{ ascending: false, nullsFirst: false \}\)\.order\('created_at', \{ ascending: false \}\)\.limit\(1\)/)
})

test('R-291: the check\'s real io members query and call as `deploy-io.ts`\' own — the baseline without its `except` (a Roll back has no row in flight), the live read with the Staff Access Token and the download\'s budget, the immutable put — and `downloadPath` is `snapshot.ts`\' own, copied so the History route carries no compiler', () => {
  const io = flat('server/deploy/put-back-io.ts')
  const deploy = flat('server/deploy/deploy-io.ts')
  const between = (text: string, head: string, tail: string) => {
    const at = text.indexOf(head)
    assert.ok(at > -1, head)
    return text.slice(at, text.indexOf(tail, at) + tail.length)
  }
  const tail = 'content_manifest: row.content_manifest ?? null }'
  const theirs = between(deploy, 'async baseline({ projectId, siteId, userId, except }) {', tail)
  assert.ok(theirs.includes(".neq('id', except)"), 'deploy-io.ts\' baseline excepts the job\'s own row')
  assert.equal(between(io, 'async baseline({ projectId, siteId, userId }) {', tail), theirs.replace(', except }) {', ' }) {').replace(".neq('id', except)", ''))
  const live = "liveTheme: ({ siteId, name, route }) => call({ siteId, path: downloadPath(name), route, kind: 'staff', read: 'theme_download' }),"
  assert.ok(deploy.includes(live) && io.includes(live), 'the same read, with the staff token')
  const put = 'async put(path, bytes, opts) {'
  assert.equal(between(io, put, "'artifact upload')"), between(deploy, put, "'artifact upload')"))
  const arrow = (text: string) => between(text, 'downloadPath = (name: string): string =>', '/download/`')
  assert.equal(arrow(io), arrow(flat('server/snapshot.ts')))
  assert.doesNotMatch(io, /from '@\/server\/snapshot'|from '\.\.\/snapshot/, 'not imported: that module carries the compiler\'s marker')
  // R-278: the decline is read on the site, the grain the wizard reads it at
  assert.match(io, /\.select\('url, disconnected_at, staff_token_declined_at'\)/)
})

test('R-291: the check\'s ONLY write is its own live copy — `historyCopyPath`, replacing — never Ship it\'s key and never a stored version\'s; it calls `compareLive` and compares nothing itself', () => {
  const back = flat('server/deploy/put-back.ts')
  const puts = back.match(/io\.artifacts\.put\([^)]*\)/g) ?? []
  assert.deepEqual(puts, ['io.artifacts.put(historyCopyPath(a.projectId, row.site_id)'], 'one put, at the check\'s own key')
  assert.match(back, /io\.artifacts\.put\(historyCopyPath\(a\.projectId, row\.site_id\), answer\.bytes, \{ replace: true \}\)/)
  assert.doesNotMatch(back, /liveCopyPath/, 'never Ship it\'s key')
  assert.match(back, /await compareLive\(io, \{/)
  assert.doesNotMatch(back, /liveManifest|compareManifests|unzipTheme/, 'no comparison of its own')
})

// ── Story 7.25 — the site's lock over the put-back and Restore original ──

test('7.25: the put-back and Restore original each ENTER THE SITE\'S LOCK before their reads — keyed on the project\'s linked site, read once for the key — and leave it after; the body\'s own reads run again inside, so its answers are unchanged', async () => {
  const back = world({ upload: [ok(true)] })
  assert.equal(await back.put('v2'), 'live')
  assert.deepEqual(back.reads.slice(0, 3), ['linked', `lock:${S}`, 'row'], 'the key read, the lock, then the body from its first read')
  assert.equal(back.reads.at(-1), 'unlock', 'every read and write inside')
  assert.equal(back.reads.filter((r) => r === 'linked').length, 2, 'the link read again inside')
  const restore = world()
  assert.equal(await restore.restore(), 'live')
  assert.deepEqual(restore.reads.slice(0, 3), ['linked', `lock:${S}`, 'linked'])
  assert.equal(restore.reads.at(-1), 'unlock')
  // a project linked to no site runs the body unlocked, which answers it as before
  const unlinked = world({ linked: null })
  assert.equal(await unlinked.put('v2'), 'elsewhere')
  assert.equal(await unlinked.restore(), 'gone')
  assert.ok(!unlinked.reads.some((r) => r.startsWith('lock:')), 'no site, no lock')
  // the check before a Roll back takes none: it writes nothing to Ghost
  const check = world({ rows: [row(1), row(2, { content_manifest: {} as ContentManifest }), row(3, { status: 'live' })] })
  await check.check('v1')
  assert.ok(!check.reads.some((r) => r.startsWith('lock:')), 'the check holds no lock')
})

test('7.25: the site\'s lock NOT HELD within its wait — the put-back and Restore original answer `busy`, with nothing sent to Ghost and nothing written; the lock not taken at all is ours, nothing sent', async () => {
  for (const [name, act] of [['put-back', (w: ReturnType<typeof world>) => w.put('v2')], ['restore', (w: ReturnType<typeof world>) => w.restore()]] as const) {
    const w = world({ lock: 'never' })
    const before = snapshotOf(w)
    assert.equal(await act(w), 'busy', name)
    assert.equal(w.calls.length, 0, `${name}: nothing sent`)
    assert.deepEqual(w.updates, [], `${name}: nothing written`)
    assert.equal(snapshotOf(w), before)
    assert.ok(!w.reads.includes('row') && !w.reads.includes('original'), `${name}: the body never ran`)
    const down = world({ lock: 'throws' })
    assert.deepEqual(await act(down), { refused: deployError('deploy_infrastructure', { host: '' }) }, `${name}: ours`)
    assert.equal(down.calls.length, 0)
  }
})

test('7.25 (the Review): a switch that lands DURING THE WAIT — the project now linked to another site — answers `busy` from inside the lock, nothing sent: the site it would write to is not the one it locked; the control: no switch, the same version on the other site is `elsewhere` as before', async () => {
  const switched = (w: ReturnType<typeof world>) => {
    const { linked, lock } = w.io
    w.io.lock = async (siteId, run) => {
      w.io.linked = async (a) => {
        const was = await linked(a)
        return was === null ? null : { ...was, siteId: OTHER }
      }
      return lock(siteId, run)
    }
  }
  // the put-back: a version of the OTHER site, which the project is linked to once the wait is over
  const back = world({ rows: [row(1), row(2, { site_id: OTHER }), row(3, { status: 'live' })], upload: [ok(true)] })
  switched(back)
  assert.equal(await back.put('v2'), 'busy')
  assert.ok(back.reads.includes(`lock:${S}`), 'the lock taken was the first site\'s')
  assert.equal(back.calls.length, 0, 'nothing sent')
  assert.deepEqual(back.updates, [], 'nothing written')
  const control = world({ rows: [row(1), row(2, { site_id: OTHER }), row(3, { status: 'live' })], upload: [ok(true)] })
  assert.equal(await control.put('v2'), 'elsewhere', 'the control: no switch')
  const restore = world()
  switched(restore)
  assert.equal(await restore.restore(), 'busy')
  assert.equal(restore.calls.length, 0, 'nothing sent')
  assert.ok(!restore.reads.includes('original'), 'refused before the original is read')
})

test('7.25: `moving` is held as before — inside the lock a ship still moving (one killed mid-span) still refuses `busy`, nothing sent', async () => {
  const w = world({ moving: true })
  assert.equal(await w.put('v2'), 'busy')
  assert.equal(await w.restore(), 'busy')
  assert.ok(w.reads.includes(`lock:${S}`), 'refused from inside the lock')
  assert.equal(w.calls.length, 0)
})

test('7.25: two Roll backs at once serialize — the second re-reads inside and finds its version live already', async () => {
  const w = world({ upload: [ok(true), ok(true)] })
  let tail: Promise<unknown> = Promise.resolve()
  w.io.lock = async (siteId, run) => {
    const before = tail
    let release = () => {}
    tail = new Promise<void>((r) => (release = r))
    await before
    try {
      return { held: true, value: await run() }
    } finally {
      release()
    }
  }
  assert.deepEqual(await Promise.all([w.put('v2'), w.put('v2')]), ['live', 'live-already'])
  assert.equal(w.calls.filter((c) => c.item === 'theme_upload').length, 1, 'one upload')
})
