// Story 7.22 — artifact retention's one rule (`lib/retention.ts`) and the one prune (`server/retention.ts`) over a fake io: the
// spec's I/O rows these two layers own — first version, under and over the cap, pins surviving, pins at or past the cap, two
// sites, the number after pruning, a pin meeting a prune, a failed prune, a failed plan read — and the drawer's rows and words.
// The shell's rows are `deploy-run.test.ts`', the sweep's `artifact-sweep.test.ts'`, and the database's the RLS gate's FR-J7 block.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { nextVersion, shipStateOf } from './lib/deploy.ts'
import { PLANS, type PlanId } from './lib/plan.ts'
import {
  chipTone, FEWEST_KEPT, historyCap, historyRows, HISTORY_WORDS, isStoredVersion, pinOutcomeOf, pinSaid, prunable, timeLabel, type HistoryAnswer, type Stored,
} from './lib/retention.ts'
import { pruneProject, strictPlan, type RetentionIo } from './server/retention.ts'

const P = '00000000-0000-4000-8000-0000000000aa'
const U = '00000000-0000-4000-8000-0000000000cc'
const at = (n: number) => new Date(Date.UTC(2026, 10, n, 9)).toISOString()
/** v{n}, stored, created on day n */
const v = (n: number, over: Partial<Stored> = {}): Stored => ({ id: `v${n}`, status: 'uploaded', artifact_path: `${P}/v${n}.zip`, pinned: false, created_at: at(n), ...over })
const ids = (rows: readonly { id: string }[]) => rows.map((r) => r.id)

test('one definition of a version: Ghost accepted it (uploaded or live) and its zip is still stored — nothing else', () => {
  assert.equal(isStoredVersion({ status: 'uploaded', artifact_path: 'p/a.zip' }), true)
  assert.equal(isStoredVersion({ status: 'live', artifact_path: 'p/a.zip' }), true)
  for (const status of ['compiling', 'checking', 'failed']) assert.equal(isStoredVersion({ status, artifact_path: 'p/a.zip' }), false, `${status} is no version`)
  assert.equal(isStoredVersion({ status: 'live', artifact_path: null }), false, 'a pruned version is gone from every count')
  assert.equal(isStoredVersion({ status: 'live', artifact_path: '' }), false)
})

test('the cap is the plan\'s, from PLANS — never typed — and the fewest kept is derived from every plan', () => {
  for (const plan of Object.keys(PLANS) as PlanId[]) assert.equal(historyCap(plan), PLANS[plan].history)
  assert.equal(FEWEST_KEPT, Math.min(PLANS.free.history, PLANS.pro.history))
})

test('the rule: first version and under the cap prune nothing; over it, the oldest unpinned go — newest first by created_at, never the newest', () => {
  const free = historyCap('free')
  assert.deepEqual(prunable([v(1)], free), [], 'the first version')
  assert.deepEqual(prunable([v(1), v(2), v(3)], free), [], 'under the cap: Free, 2 stored, v3 accepted — 3 stored')
  assert.deepEqual(ids(prunable([v(2), v(4), v(1), v(3)], free)), ['v1'], 'over: Free v1–v3 unpinned, v4 accepted — v1 goes, whatever order the read came in')
  assert.deepEqual(ids(prunable([v(1), v(2), v(3), v(4), v(5), v(6)], free)), ['v3', 'v2', 'v1'])
  // the control: Pro's cap keeps six
  assert.deepEqual(prunable([v(1), v(2), v(3), v(4), v(5), v(6)], historyCap('pro')), [])
})

test('pins survive and count against the same total; at or past the cap (only after a plan change) every pin stays with the newest unpinned version', () => {
  const free = historyCap('free')
  assert.deepEqual(ids(prunable([v(1, { pinned: true }), v(2), v(3), v(4)], free)), ['v2'], 'Free, v1 pinned, v2, v3, v4 accepted — v2 goes; v1 v3 v4 kept')
  assert.deepEqual(ids(prunable([v(1, { pinned: true }), v(2, { pinned: true }), v(3), v(4)], free)), ['v3'], 'two pinned: one unpinned slot, the newest')
  // pinned ≥ cap: a Pro project with nine pins that fell to Free (DW-399 refines it)
  const nine = Array.from({ length: 9 }, (_, i) => v(i + 1, { pinned: true }))
  assert.deepEqual(ids(prunable([...nine, v(10), v(11), v(12)], free)), ['v11', 'v10'], 'every pin kept and the newest unpinned (v12)')
  assert.deepEqual(prunable([...nine, v(10, { pinned: true })], free), [], 'nothing but pins: nothing is pruned')
  // the newest is never pruned, pinned or not
  assert.ok(!ids(prunable([v(1), v(2), v(3), v(4, { pinned: true })], 1)).includes('v4'))
  assert.ok(!ids(prunable([v(1), v(2), v(3), v(4)], 1)).includes('v4'))
})

test('only stored versions enter the rule: a failed, a checking and an already-pruned row are neither counted nor pruned', () => {
  const rows = [v(1, { status: 'failed' }), v(2, { status: 'checking' }), v(3, { artifact_path: null }), v(4), v(5), v(6)]
  assert.deepEqual(prunable(rows, historyCap('free')), [], 'three stored versions: Free keeps them all')
})

test('two sites, one count per project: the versions on both sites are one list, pruned together', () => {
  const a = (n: number) => v(n, { id: `a${n}` })
  const b = (n: number) => v(n, { id: `b${n}`, created_at: new Date(Date.parse(at(n)) + 3_600_000).toISOString() })
  assert.deepEqual(ids(prunable([a(1), b(1), a(2), b(2)], historyCap('free'))), ['a1'])
})

test('the next version is the highest plus one (DW-372): pruned rows are kept, so v1–v3 pruned and v4–v6 stored make v7 — counting rows would say v4', () => {
  const rows = [1, 2, 3, 4, 5, 6].map((n) => ({ version: `${n}.0.0` }))
  assert.equal(nextVersion(rows), 7)
  assert.equal(nextVersion([]), 1, 'the first')
  assert.equal(nextVersion([{ version: '3.0.0' }, { version: '9.0.0' }, { version: 'x' }]), 10, 'a gap (a failed number) and a stray version never pull it back')
  // shipStateOf reads the same rule: the wizard's caption and the theme's package.json agree
  const ship = shipStateOf({
    projectId: P, slug: 'notes', language: 'en', rtlAckAt: null, overridden: false, sites: [], linking: [], siteId: null, site: null,
    deploys: [4, 5, 6].map((n) => ({ version: `${n}.0.0`, status: 'uploaded', activated: false, activated_at: null })), bindings: [], liveHere: false, required: [],
  })
  assert.equal(ship.n, 7, 'three rows, but the next version is v7')
})

/** A fake world for the prune: the rows, the bucket, and every call in order. `plan` throws for a failed read. */
function world(rows: Stored[], over: { plan?: PlanId | Error; clearFails?: string[]; removeFails?: string[]; pinAt?: string } = {}) {
  const table = new Map(rows.map((r) => [r.id, { ...r }]))
  const bucket = new Set(rows.flatMap((r) => (r.artifact_path ? [r.artifact_path] : [])))
  const calls: string[] = []
  const logged: string[] = []
  const io: RetentionIo = {
    plan: async () => {
      calls.push('plan')
      if (over.plan instanceof Error) throw over.plan
      return over.plan ?? 'free'
    },
    versions: async ({ projectId, userId }) => {
      calls.push(`versions:${projectId === P && userId === U}`)
      return [...table.values()].filter(isStoredVersion).map((r) => ({ ...r }))
    },
    clear: async ({ id, userId, path }) => {
      calls.push(`clear:${id}`)
      // a pin landing between the read and the clear (the matrix's "pin meets prune")
      if (id === over.pinAt) table.set(id, { ...(table.get(id) as Stored), pinned: true })
      if (over.clearFails?.includes(id)) throw Object.assign(new Error('db'), { code: '57014' })
      const row = table.get(id)
      if (userId !== U || row === undefined || row.pinned || row.artifact_path !== path || !isStoredVersion(row)) return false
      table.set(id, { ...row, artifact_path: null })
      return true
    },
    remove: async (path) => {
      calls.push(`remove:${path}`)
      if (over.removeFails?.some((id) => path.endsWith(`/${id}.zip`))) throw Object.assign(new Error('storage'), { code: 'storage_503' })
      bucket.delete(path)
    },
    log: (message) => void logged.push(message),
  }
  return { io, table, bucket, calls, logged }
}

test('the prune: the pointer clears FIRST, then the object goes; the row stays with its version; the list no longer holds it', async () => {
  const w = world([v(1), v(2), v(3), v(4)])
  const done = await pruneProject({ projectId: P, userId: U }, w.io)
  assert.deepEqual(done, { cap: historyCap('free'), pruned: ['v1'], failed: 0 })
  assert.deepEqual(w.calls, ['plan', 'versions:true', 'clear:v1', `remove:${P}/v1.zip`], 'the plan, the versions, the clear, then the object')
  assert.equal(w.table.get('v1')?.artifact_path, null, 'the pointer is null')
  assert.ok(w.table.has('v1'), 'the row is kept (its manifest, version and verdicts)')
  assert.equal(w.bucket.has(`${P}/v1.zip`), false, 'the object is gone')
  assert.deepEqual(ids([...w.table.values()].filter(isStoredVersion)), ['v2', 'v3', 'v4'], 'the drawer would list v4 v3 v2')
})

test('a pin that lands first keeps its row and its zip: the conditional clear changes nothing, so nothing is removed (the matrix\'s "pin meets prune")', async () => {
  const w = world([v(1), v(2), v(3), v(4)], { pinAt: 'v1' })
  const done = await pruneProject({ projectId: P, userId: U }, w.io)
  assert.deepEqual(done.pruned, [])
  assert.ok(!w.calls.some((c) => c.startsWith('remove:')), 'no object is removed for a row the clear did not change')
  assert.equal(w.table.get('v1')?.artifact_path, `${P}/v1.zip`)
  assert.equal(w.bucket.has(`${P}/v1.zip`), true, 'pinned and kept — never pinned without its object')
})

test('a row\'s failure is logged by code and counted, and never stops the rest; a clear that failed removes nothing', async () => {
  const w = world([v(1), v(2), v(3), v(4), v(5), v(6)], { clearFails: ['v1'], removeFails: ['v2'] })
  const done = await pruneProject({ projectId: P, userId: U }, w.io)
  assert.deepEqual(done.pruned, ['v3'])
  assert.equal(done.failed, 2)
  assert.ok(!w.calls.includes(`remove:${P}/v1.zip`), 'no object goes for a pointer that was not cleared')
  assert.equal(w.bucket.has(`${P}/v1.zip`), true)
  assert.equal(w.logged.filter((l) => l === 'retention: a version was not pruned').length, 2)
})

test('a plan that cannot be read prunes NOTHING — never a degraded Free over a Pro project\'s versions — and the throw is the caller\'s to log', async () => {
  const w = world([v(1), v(2), v(3), v(4), v(5)], { plan: Object.assign(new Error('plan'), { code: 'plan_unread' }) })
  await assert.rejects(pruneProject({ projectId: P, userId: U }, w.io), { code: 'plan_unread' })
  assert.deepEqual(w.calls, ['plan'], 'nothing read, nothing cleared, nothing removed')
  // the control: Pro, read, keeps all five
  const pro = world([v(1), v(2), v(3), v(4), v(5)], { plan: 'pro' })
  assert.deepEqual((await pruneProject({ projectId: P, userId: U }, pro.io)).pruned, [])
})

// ── the drawer's rows and words ─────────────────────────────────────────────────────────────────────────────────────

const A = 'site-a'
const B = 'site-b'
const answerOf = (rows: Partial<HistoryAnswer['rows'][number]>[], linked: string | null = A): HistoryAnswer => ({
  linkedSiteId: linked,
  rows: rows.map((r, i) => ({ id: `d${i}`, version: `${i + 1}.0.0`, status: 'uploaded', pinned: false, createdAt: at(i + 1), errors: 0, warnings: 0, siteId: A, host: 'a.com', ...r })),
})

test('the drawer\'s rows: stored versions only, newest first, the Live one marked, the gscan counts kept, and "on {host}" only where the row\'s site is not the linked one', () => {
  const rows = historyRows(answerOf([
    { status: 'live' },
    { status: 'failed' },
    { siteId: B, host: 'b.com', pinned: true },
    { errors: null, warnings: null },
    { version: 'nonsense' },
  ]))
  assert.deepEqual(rows.map((r) => r.n), [4, 3, 1], 'newest first; a failed row and a row with no number are never drawn')
  assert.deepEqual(rows.map((r) => r.live), [false, false, true])
  assert.deepEqual(rows.map((r) => r.elsewhere), [null, 'b.com', null], 'two sites: the other site\'s row says where it is')
  assert.equal(rows[1]?.pinned, true)
  assert.equal(rows[0]?.gscan, null, 'no verdict, no chip')
  assert.deepEqual(rows[2]?.gscan, { errors: 0, warnings: 0 })
  assert.deepEqual(historyRows(answerOf([], null)), [], 'nothing shipped')
  assert.deepEqual(historyRows(answerOf([{}], null)).map((r) => r.elsewhere), ['a.com'], 'no linked site: every row names its site')
})

test('a pin\'s outcome from the route\'s status: 200 pinned or unpinned, 409 cap, 404 gone, anything else failed — and what each says, once', () => {
  assert.equal(pinOutcomeOf(200, true), 'pinned')
  assert.equal(pinOutcomeOf(200, false), 'unpinned')
  assert.equal(pinOutcomeOf(409, true), 'cap')
  assert.equal(pinOutcomeOf(404, true), 'gone')
  for (const status of [0, 400, 401, 500, 502]) assert.equal(pinOutcomeOf(status, true), 'failed')
  assert.equal(pinSaid('cap', 3), HISTORY_WORDS.refusal, 'the refusal is D2b\'s own sentence')
  assert.equal(pinSaid('pinned', 3), 'v3 pinned.')
  assert.equal(pinSaid('unpinned', 3), 'v3 unpinned.')
  assert.match(pinSaid('gone', 3), /^v3 /)
  assert.match(pinSaid('failed', 3), /v3/)
})

test('the words: the limit line prints BOTH plans\' numbers from PLANS and why they are a real bound; D2b\'s sentence and Got it as drawn; no other digit typed', () => {
  assert.equal(HISTORY_WORDS.limit, `Pro keeps the last ${PLANS.pro.history} versions. Free keeps the last ${PLANS.free.history}. Older versions are removed, not hidden — an Inflozo theme can't be rebuilt later, so this is how far back you can go.`)
  assert.equal(HISTORY_WORDS.refusal, 'One version has to stay unpinned so your next deploy has somewhere to go. Unpin another first.')
  assert.equal(HISTORY_WORDS.gotIt, 'Got it')
  assert.equal(HISTORY_WORDS.empty, 'Nothing shipped yet')
  assert.equal(HISTORY_WORDS.title('Field Notes'), 'History — Field Notes')
  assert.equal(HISTORY_WORDS.pin(9), 'Pin v9')
  assert.equal(HISTORY_WORDS.pinning(9), 'Pinning v9…')
  assert.equal(HISTORY_WORDS.unpinning(9), 'Unpinning v9…')
  // every digit in the list is a number handed in or one PLANS holds
  const fixed = Object.entries(HISTORY_WORDS).flatMap(([k, w]) => (typeof w === 'string' && k !== 'limit' ? [w] : []))
  for (const w of fixed) assert.doesNotMatch(w, /\d/, `"${w}" types a number`)
  assert.equal(chipTone({ errors: 0, warnings: 0 }), 'clean')
  assert.equal(chipTone({ errors: 0, warnings: 2 }), 'warned')
  assert.equal(chipTone({ errors: 1, warnings: 0 }), 'failed')
})

test('the row\'s time, as D2a draws it: "Today · 2:14 PM" on the day, "Aug 28 · 9:02 AM" this year, and the year once it is not this one', () => {
  const zone = 'UTC'
  const now = new Date('2026-11-25T18:00:00Z')
  assert.equal(timeLabel('2026-11-25T14:14:00Z', now, zone), 'Today · 2:14 PM')
  assert.equal(timeLabel('2026-08-28T09:02:00Z', now, zone), 'Aug 28 · 9:02 AM')
  assert.equal(timeLabel('2025-08-28T09:02:00Z', now, zone), 'Aug 28, 2025 · 9:02 AM')
  assert.equal(timeLabel('not a date', now, zone), '')
  // the viewer's own zone decides the day: 1:30 the next morning in Kolkata is not "Today" there
  assert.equal(timeLabel('2026-11-25T20:00:00Z', now, 'Asia/Kolkata'), 'Nov 26 · 1:30 AM')
})

test('the job\'s plan read refuses AD-28\'s degradation: a read that logged its failure throws `plan_unread` (and the line is still logged) — a read that worked answers its plan (the control)', async () => {
  const lines: unknown[][] = []
  const log = { error: (...line: unknown[]) => void lines.push(line) }
  // `readEntitlement`'s own shape: a failed read logs one line and answers Free
  await assert.rejects(strictPlan(async (l) => (l.error('entitlement: read failed', { code: 'XX000' }), 'free'), log), { code: 'plan_unread' })
  assert.deepEqual(lines, [['entitlement: read failed', { code: 'XX000' }]])
  assert.equal(await strictPlan(async () => 'pro', log), 'pro')
  assert.equal(await strictPlan(async () => 'free', log), 'free', 'an absent row is Free, read — not a failure')
})

test('the REAL clear (`server/retention-io.ts`) carries every condition the fake above holds — this user\'s, unpinned, still a stored version, still naming THIS object — so a pin or another prune that landed first keeps its zip (the review: the fake alone proved only that `pruneProject` reads a false)', () => {
  const flat = readFileSync('server/retention-io.ts', 'utf8').replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ')
  const clear = /async clear\(\{ id, userId, path \}\) \{(.*?)\n?return \(answer\.data/.exec(flat)?.[1] ?? ''
  for (const condition of [".update({ artifact_path: null, artifact_bytes: null })", ".eq('id', id)", ".eq('user_id', userId)", ".eq('pinned', false)", ".eq('artifact_path', path)", ".in('status', ['uploaded', 'live'])", ".select('id')"]) {
    assert.ok(clear.includes(condition), `the clear keeps ${condition}`)
  }
  // the versions read is the same predicate as `isStoredVersion`, scoped to the user
  assert.match(flat, /\.eq\('project_id', projectId\) \.eq\('user_id', userId\) \.in\('status', \['uploaded', 'live'\]\) \.not\('artifact_path', 'is', null\)/)
})
