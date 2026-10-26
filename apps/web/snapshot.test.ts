// Story 7.20a — FR-J13's one capture (`server/snapshot.ts`), over an injected io: the staff read, the marker, the Admin key's
// one code, the download, and the write's order — object, then row, then the old object — with nothing half-written.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { THEME_MARKER } from '@inflozo/theme-compiler'
import { captureSnapshot, downloadPath, requestOf, STORAGE, THEMES_LIST, type SnapshotAnswer, type SnapshotIo, type SnapshotProgress } from './server/snapshot.ts'

const S = '00000000-0000-4000-8000-0000000000bb'
const U = '00000000-0000-4000-8000-0000000000cc'
const ZIP = new Uint8Array([0x50, 0x4b, 3, 4, 9, 9, 9, 9])
const json = (status: number, body: unknown): SnapshotAnswer => ({ ok: status >= 200 && status < 300, status, body, bytes: new TextEncoder().encode(JSON.stringify(body)) })
const themes = (pkg: Record<string, unknown> = { name: 'casper', version: '5.9.4' }) =>
  json(200, { themes: [{ name: 'source', active: false, package: { name: 'source' } }, { name: 'casper', active: true, package: pkg }] })
const adminError = (code: string) => Object.assign(new Error(code), { name: 'AdminError', code })

/** one world: the site, Ghost's answers in turn, the bucket, the row, and every step in order */
function world(over: {
  staff?: boolean
  site?: null
  answers?: Array<SnapshotAnswer | Error>
  current?: { id: string; storage_path: string } | null
  put?: Error
  upsert?: Error
  remove?: Error
} = {}) {
  const steps: string[] = []
  const calls: { path: string; kind: string; read?: string }[] = []
  const bucket = new Map<string, Uint8Array>()
  const rows: Record<string, unknown>[] = []
  const answers = [...(over.answers ?? [themes(), { ok: true, status: 200, body: null, bytes: ZIP }])]
  const progress: SnapshotProgress[] = []
  const io: SnapshotIo = {
    site: async () => (over.site === null ? null : { staff: over.staff ?? true }),
    call: async (args) => {
      calls.push({ path: args.path, kind: args.kind, ...(args.read ? { read: args.read } : {}) })
      const next = answers.shift()
      if (next instanceof Error) throw next
      return next as SnapshotAnswer
    },
    current: async () => over.current ?? null,
    put: async (key, bytes) => {
      if (over.put) throw over.put
      steps.push(`put:${key}`)
      bucket.set(key, bytes)
    },
    upsert: async (row) => {
      if (over.upsert) throw over.upsert
      steps.push('upsert')
      rows.push(row)
      return 'snap-1'
    },
    remove: async (key) => {
      steps.push(`remove:${key}`)
      if (over.remove) throw over.remove
      bucket.delete(key)
    },
    now: () => new Date('2026-10-26T10:00:00.000Z'),
    log: () => {},
  }
  return { io, steps, calls, bucket, rows, progress, run: () => captureSnapshot({ siteId: S, userId: U, route: 'test', progress: (p) => void progress.push(p) }, io) }
}

test('the staff token\'s capture: the list, the active theme\'s download with its own read budget, then the object BEFORE the row, and the old object removed last', async () => {
  const w = world({ current: { id: 'snap-1', storage_path: `site-snapshots/${U}/${S}/old-casper.zip` } })
  const got = await w.run()
  assert.deepEqual(got, { ok: true, id: 'snap-1', theme: 'casper', version: '5.9.4', bytes: ZIP.length })
  assert.deepEqual(w.calls, [{ path: THEMES_LIST, kind: 'staff' }, { path: 'themes/casper/download/', kind: 'staff', read: 'theme_download' }])
  const key = `${U}/${S}/20261026T100000000Z-casper.zip`
  assert.deepEqual(w.steps, [`put:${key}`, 'upsert', `remove:${U}/${S}/old-casper.zip`], 'object, row, then the old object')
  assert.deepEqual(w.rows[0], { user_id: U, site_id: S, storage_path: `site-snapshots/${key}`, theme_name: 'casper', bytes: ZIP.length, captured_at: '2026-10-26T10:00:00.000Z' })
  assert.ok(!('purge_after' in (w.rows[0] as object)) && !('download_offered_at' in (w.rows[0] as object)), 'FR-A5\'s clock is left alone')
  assert.deepEqual(w.bucket.get(key), ZIP)
  assert.deepEqual(w.progress, [{ theme: 'casper', version: '5.9.4' }, { bytes: ZIP.length }], 'B12a\'s rows told as they are learned')
})

test('a theme carrying the marker is never captured — nothing downloaded, nothing written; the same theme without it is (the control)', async () => {
  const marked = world({ answers: [themes({ name: 'inflozo-notes', version: '3.0.0', [THEME_MARKER]: true })] })
  assert.deepEqual(await marked.run(), { ok: true, marked: true })
  assert.equal(marked.calls.length, 1, 'no download')
  assert.deepEqual(marked.steps, [], 'nothing written')
  // keyed on the MARKER, never on the name: an `inflozo-` name without it is captured, `"inflozo": "true"` is not the marker
  const named = world({ answers: [themes({ name: 'inflozo-notes', version: '3.0.0', [THEME_MARKER]: 'true' }), { ok: true, status: 200, body: null, bytes: ZIP }] })
  const got = await named.run()
  assert.equal(got.ok && 'id' in got, true)
  assert.equal(named.rows.length, 1)
})

test('with no token stored the list is asked with the Admin key: Ghost 6\'s 403 and Ghost 5\'s 501 are ONE code, naming the request and the status; a 200 there captures with that key (the control)', async () => {
  for (const status of [403, 501]) {
    const w = world({ staff: false, answers: [json(status, { errors: [{ type: 'NoPermissionError' }] })] })
    assert.deepEqual(await w.run(), { ok: false, code: 'snapshot_needs_token', request: 'GET /ghost/api/admin/themes/', status })
    assert.deepEqual(w.calls, [{ path: THEMES_LIST, kind: 'admin' }])
    assert.deepEqual(w.steps, [])
  }
  const lifted = world({ staff: false })
  const got = await lifted.run()
  assert.equal(got.ok && 'id' in got, true, 'a future Ghost lifting the allowlist captures with the Admin key')
  assert.deepEqual(lifted.calls.map((c) => c.kind), ['admin', 'admin'])
})

test('a 401 on the stored token, a 5xx, a 403 on the download, no answer, a body that is no zip and a refused put each leave NO row', async () => {
  const cases: [string, ReturnType<typeof world>, unknown][] = [
    ['401 list', world({ answers: [json(401, {})] }), { ok: false, code: 'snapshot_token_refused', request: requestOf(THEMES_LIST), status: 401 }],
    ['503 list', world({ answers: [json(503, {})] }), { ok: false, code: 'snapshot_failed', request: requestOf(THEMES_LIST), status: 503 }],
    ['401 download', world({ answers: [themes(), json(401, {})] }), { ok: false, code: 'snapshot_token_refused', request: requestOf(downloadPath('casper')), status: 401 }],
    ['403 download', world({ answers: [themes(), json(403, {})] }), { ok: false, code: 'snapshot_failed', request: 'GET /ghost/api/admin/themes/casper/download/', status: 403 }],
    ['no answer', world({ answers: [adminError('ghost_unreachable')] }), { ok: false, code: 'snapshot_failed', request: requestOf(THEMES_LIST) }],
    ['token gone', world({ answers: [adminError('credential_missing')] }), { ok: false, code: 'snapshot_needs_token', request: requestOf(THEMES_LIST) }],
    ['not a zip', world({ answers: [themes(), { ok: true, status: 200, body: null, bytes: new TextEncoder().encode('<html>') }] }), { ok: false, code: 'snapshot_failed', request: requestOf(downloadPath('casper')), status: 200 }],
    ['no active theme', world({ answers: [json(200, { themes: [{ name: 'casper', active: false }] })] }), { ok: false, code: 'snapshot_failed', request: requestOf(THEMES_LIST), status: 200 }],
    ['put refused', world({ put: Object.assign(new Error('x'), { code: 'InvalidKey' }) }), { ok: false, code: 'snapshot_failed', request: STORAGE }],
  ]
  for (const [name, w, want] of cases) {
    assert.deepEqual(await w.run(), want, name)
    assert.deepEqual(w.rows, [], `${name}: no row`)
    assert.equal(w.bucket.size, 0, `${name}: no object`)
  }
})

test('a row that will not write takes its new object back out — nothing half-written — and the old object stays', async () => {
  const w = world({ upsert: Object.assign(new Error('x'), { code: '23503' }), current: { id: 'snap-1', storage_path: `site-snapshots/${U}/${S}/old.zip` } })
  assert.deepEqual(await w.run(), { ok: false, code: 'snapshot_failed', request: STORAGE })
  const key = `${U}/${S}/20261026T100000000Z-casper.zip`
  assert.deepEqual(w.steps, [`put:${key}`, `remove:${key}`], 'the new object out; the old one untouched')
  assert.equal(w.bucket.size, 0)
})

test('a failed removal of the OLD object is logged and the capture stands (the prefix drains sweep it later); a site not the caller\'s is asked nothing', async () => {
  const w = world({ remove: new Error('x'), current: { id: 'snap-1', storage_path: `site-snapshots/${U}/${S}/old.zip` } })
  const got = await w.run()
  assert.equal(got.ok && 'id' in got && got.id, 'snap-1')
  const gone = world({ site: null })
  assert.deepEqual(await gone.run(), { ok: false, code: 'snapshot_failed', request: requestOf(THEMES_LIST) })
  assert.deepEqual(gone.calls, [], 'Ghost is not asked for a site that is not the caller\'s')
})

test('a theme name that is no slug is never put in a path or an object key', async () => {
  const w = world({ answers: [json(200, { themes: [{ name: '../casper', active: true, package: {} }] })] })
  assert.equal((await w.run()).ok, false)
  assert.equal(w.calls.length, 1)
})

test('the capture imports neither the service role nor the chokepoint, and reuses the bucket\'s one strip (`deletion-rule.ts`)', () => {
  const code = readFileSync('server/snapshot.ts', 'utf8')
  assert.doesNotMatch(code, /supabaseAdmin|ghost-admin/)
  assert.match(code, /import \{ SNAPSHOT_BUCKET, snapshotObjectKey \} from '\.\.\/app\/\(app\)\/app\/\(authed\)\/account\/deletion-rule\.ts'/)
})
