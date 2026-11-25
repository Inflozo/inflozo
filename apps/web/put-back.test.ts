// Story 7.23a — the put-back (`server/deploy/put-back.ts`) over a fake io: the spec's I/O matrix rows this layer owns — Roll back
// over the live theme and over another theme, Re-activate, Ghost's 422 and its other refusals, the undo, the four refusals that send
// nothing, gone, the number after a Roll back — and the source rules: the same Ghost requests as Ship it, no plan, no lock and no
// gscan on the path, and the real io's shared queries equal `deploy-io.ts`' own. The rows and words are `retention.test.ts`', the
// route's statuses `deploy.test.ts`', the drift baseline's order `deploy-run.test.ts`' and `drift.test.ts`'.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DEPLOY_WORDS, deployError, nextVersion } from './lib/deploy.ts'
import { actionOf, HISTORY_WORDS, newestAccepted } from './lib/retention.ts'
import { putBack, type PutBackIo, type PutBackOutcome } from './server/deploy/put-back.ts'
import { STALLED_MS } from './server/deploy/run.ts'

const P = '00000000-0000-4000-8000-0000000000aa'
const S = '00000000-0000-4000-8000-0000000000bb'
const OTHER = '00000000-0000-4000-8000-0000000000dd'
const U = '00000000-0000-4000-8000-0000000000cc'
const NOW = new Date('2026-11-25T12:00:00Z')

type Answer = { ok: boolean; status: number; body: unknown; text: string }
const ok = (active = false): Answer => ({ ok: true, status: 200, body: { themes: [{ name: 'inflozo-notes', active }] }, text: '' })
const bad = (status: number, body: unknown = {}, text = JSON.stringify(body)): Answer => ({ ok: false, status, body, text })
const adminError = (code: string) => Object.assign(new Error(code), { name: 'AdminError', code })

type Row = { id: string; project_id: string; site_id: string; version: string; theme_name: string; status: string; artifact_path: string | null; created_at: string; accepted_at: string | null; activated: boolean; activated_at: string | null }
const row = (n: number, over: Partial<Row> = {}): Row => ({
  id: `v${n}`, project_id: P, site_id: S, version: `${n}.0.0`, theme_name: 'inflozo-notes', status: 'uploaded', artifact_path: `${P}/v${n}.zip`,
  created_at: `2026-11-0${n}T09:00:00.000Z`, accepted_at: `2026-11-0${n}T09:00:00.000Z`, activated: true, activated_at: `2026-11-0${n}T09:00:00.000Z`, ...over,
})

/** One world: v1–v3 on the linked site (v3 live) unless told otherwise, the bucket, Ghost's answers and every call, in order. */
function world(over: {
  rows?: Row[]
  upload?: Array<Answer | Error>
  activate?: Array<Answer | Error>
  linked?: { siteId: string; url: string; disconnected: boolean } | null
  moving?: boolean
  getFails?: number
  updateFails?: number
} = {}) {
  const rows = new Map((over.rows ?? [row(1), row(2), row(3, { status: 'live' })]).map((r) => [r.id, { ...r }]))
  const bucket = new Map([...rows.values()].flatMap((r) => (r.artifact_path ? [[r.artifact_path, new TextEncoder().encode(`zip of ${r.id}`)] as const] : [])))
  const calls: { method?: string; path: string; item?: string; body?: unknown; route: string }[] = []
  const reads: string[] = []
  const logs: [string, unknown][] = []
  const upload = [...(over.upload ?? [ok()])]
  const activations = [...(over.activate ?? [ok()])]
  let getFails = over.getFails ?? 0
  let updateFails = over.updateFails ?? 0
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
    linked: async () => {
      reads.push('linked')
      return over.linked !== undefined ? over.linked : { siteId: S, url: 'https://ghost6.inflozo.com', disconnected: false }
    },
    moving: async ({ since }) => {
      reads.push(`moving:${since}`)
      return over.moving ?? false
    },
    deploys: {
      update: async (id, _u, patch) => {
        if (updateFails-- > 0) throw Object.assign(new Error('database'), { infra: true, code: 'PGRST000' })
        rows.set(id, { ...(rows.get(id) as Row), ...(patch as Partial<Row>) })
      },
      demote: async ({ siteId, except }) => {
        for (const [k, r] of rows) if (k !== except && r.site_id === siteId && r.status === 'live') rows.set(k, { ...r, status: 'uploaded' })
      },
    },
    artifacts: {
      get: async (path) => {
        if (getFails-- > 0) throw Object.assign(new Error('storage'), { infra: true, code: 'storage_503' })
        return bucket.get(path) as Uint8Array
      },
    },
    call: async (args) => {
      calls.push(args)
      const next = args.item === 'theme_upload' ? upload.shift() : activations.shift()
      if (next instanceof Error) throw next
      return next ?? ok()
    },
    log: (message, fields) => void logs.push([message, fields]),
  }
  const put = (deployId: string): Promise<PutBackOutcome> => putBack(io, { userId: U, projectId: P, deployId, now: NOW })
  return { io, rows, bucket, calls, reads, logs, put }
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

// ── the source rules ─────────────────────────────────────────────────────────────────────────────────────────────────

const flat = (path: string) => readFileSync(path, 'utf8').replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ')
const HISTORY_ROUTE = 'app/(app)/app/(authed)/projects/[id]/history/route.ts'

test('no lock, no plan, no gscan: the put-back module, its io and the route\'s act branch name none of `holdsLock`, `resolveEntitlement`, `readEntitlement`, a plan, `gscanGate` or `qualityGate`; the control: the pin branch beside it reads the plan', () => {
  const route = flat(HISTORY_ROUTE)
  const act = route.slice(route.indexOf('if (act !== undefined) {'), route.indexOf('if (typeof pinned !== \'boolean\')'))
  assert.ok(act.includes('putBack(PUT_BACK_IO'), 'the act branch is the put-back')
  const banned = /holdsLock|resolveEntitlement|readEntitlement|entitlement|caps\.|gscanGate|qualityGate|gscan\(|edit-lock/
  for (const [what, text] of [['put-back.ts', flat('server/deploy/put-back.ts')], ['put-back-io.ts', flat('server/deploy/put-back-io.ts')], ['the act branch', act]] as const) {
    assert.doesNotMatch(text, banned, `${what} consults a lock, a plan or a gate`)
  }
  // the control: the same test sees the pin branch's plan read
  assert.match(route.slice(route.indexOf('if (typeof pinned !== \'boolean\')')), /resolveEntitlement/)
  assert.match(route, /export const maxDuration = 300/)
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
  // each table query, up to its `ok()` label
  const queries = io.split('supabaseAdmin().from(').slice(1).map((q) => q.slice(0, q.indexOf("), '") + 1))
  // every `supabaseAdmin()` in the io is one of the queries checked — none escapes the split — and there is at least one
  assert.equal(queries.length + (io.match(/supabaseAdmin\(\)\.storage\./g) ?? []).length, (io.match(/supabaseAdmin\(\)/g) ?? []).length, 'every service-role call is checked')
  assert.ok(queries.length > 0)
  for (const q of queries) assert.match(q, /\.eq\('user_id', userId\)/, q.slice(0, 80))
  // the newest accepted is the drift baseline's order
  assert.match(io, /\.order\('accepted_at', \{ ascending: false, nullsFirst: false \}\)\.order\('created_at', \{ ascending: false \}\)\.limit\(1\)/)
})
