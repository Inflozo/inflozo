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
  actionOf, actOutcomeOf, actSaid, changedLine, chipTone, EXPANDED, FEWEST_KEPT, heavyIds, historyAnswer, historyCap, historyRows, HISTORY_WORDS, isStoredVersion,
  newestAccepted, pinOutcomeOf, pinSaid, prunable, timeLabel, type AcceptedRow, type HeavyRow, type HistoryAnswer, type Stored,
} from './lib/retention.ts'
import { droppedKeys } from './lib/preflight.ts'
import { PREFLIGHT_WORDS } from './lib/preflight.ts'
import { DEPLOY_WORDS, deployError } from './lib/deploy.ts'
import type { ContentManifest } from './lib/drift.ts'
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
  liveVersion: null,
  rows: rows.map((r, i) => ({
    id: `d${i}`, version: `${i + 1}.0.0`, status: 'uploaded', pinned: false, createdAt: at(i + 1), acceptedAt: at(i + 1), errors: 0, warnings: 0, siteId: A, host: 'a.com',
    changed: null, drops: [], action: null, ...r,
  })),
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

// ── Story 7.23a — newest accepted, who may act, the Changed line, the route's answer and the put-back's words ─────────────

test('7.23a (DW-400): newest is the upload Ghost ACCEPTED — a version checked before newer ones and shipped after them is the newest, so the prune keeps it; the control: by `created_at` alone it would be pruned the moment Ghost took it', () => {
  const free = historyCap('free')
  // v1–v3 checked and shipped in turn; then a check made on day 0 (before a re-link) is shipped on day 9
  const late = v(0, { id: 'late', accepted_at: at(9) })
  const rows = [v(1, { accepted_at: at(1) }), v(2, { accepted_at: at(2) }), v(3, { accepted_at: at(3) }), late]
  assert.deepEqual(ids(prunable(rows, free)), ['v1'], 'the late upload is the newest: v1 goes, never it')
  // the control: with no accepted time the late upload stands on its check's time — the oldest — and is pruned
  assert.deepEqual(ids(prunable([...rows.slice(0, 3), v(0, { id: 'late' })], free)), ['late'])
  // a tie on `accepted_at` falls back to `created_at`, then the id
  assert.deepEqual(ids(prunable([v(1, { accepted_at: at(5) }), v(2, { accepted_at: at(5) }), v(3, { accepted_at: at(5) }), v(4, { accepted_at: at(5) })], free)), ['v1'])
  // the list orders the same way, and the row's time is the accepted one
  const listed = historyRows(answerOf([{ createdAt: at(1), acceptedAt: at(9) }, { createdAt: at(2), acceptedAt: at(2) }, { createdAt: at(3), acceptedAt: at(3) }]))
  assert.deepEqual(listed.map((r) => r.n), [1, 3, 2])
  assert.equal(listed[0]?.acceptedAt, at(9))
})

test('7.23a: who may act — a stored version on the linked site that is not its Live row; Re-activate when it is `uploaded` AND the newest accepted on its site, Roll back otherwise; another site\'s row, the Live row and a pruned row have none', () => {
  const row = (over: Partial<{ id: string; status: string; artifact_path: string | null; site_id: string }> = {}) => ({ id: 'v2', status: 'uploaded', artifact_path: 'p/v2.zip', site_id: A, ...over })
  assert.equal(actionOf(row(), { linkedSiteId: A, newest: 'v3' }), 'rollback')
  assert.equal(actionOf(row(), { linkedSiteId: A, newest: 'v2' }), 'reactivate', 'Ghost holds its files: the activation alone')
  assert.equal(actionOf(row({ status: 'live' }), { linkedSiteId: A, newest: 'v2' }), null, 'the Live row')
  assert.equal(actionOf(row({ site_id: B }), { linkedSiteId: A, newest: 'v2' }), null, 'another site\'s row (Design Notes)')
  assert.equal(actionOf(row(), { linkedSiteId: null, newest: 'v2' }), null, 'a project linked to no site')
  assert.equal(actionOf(row({ artifact_path: null }), { linkedSiteId: A, newest: 'v3' }), null, 'a pruned row is no version')
  assert.equal(actionOf(row({ status: 'failed' }), { linkedSiteId: A, newest: 'v2' }), null)
  // the newest accepted is read over stored AND pruned rows, by `accepted_at`
  const site = [
    { id: 'v1', status: 'uploaded', created_at: at(1), accepted_at: at(1) },
    { id: 'v2', status: 'live', created_at: at(2), accepted_at: at(8) },
    { id: 'v3', status: 'uploaded', created_at: at(3), accepted_at: at(3) },
    { id: 'v4', status: 'failed', created_at: at(9), accepted_at: null },
  ]
  assert.equal(newestAccepted(site), 'v2', 'a failed row was never accepted')
  assert.equal(newestAccepted([]), null)
})

const m = (files: Record<string, string | { sha256: string; layer: string }>): ContentManifest =>
  Object.fromEntries(Object.entries(files).map(([path, f]) => [path, typeof f === 'string' ? { sha256: f, fingerprint: path } : { sha256: f.sha256, fingerprint: `id-${f.layer}`, layer: f.layer, category: 'hero' }]))

test('7.23a: the Changed line, the matrix\'s four — "First deploy" with no earlier version, a section by its SHIPPED layer and a template the earlier lacks marked "added", no line where either manifest is null, and "No changes since v1"', () => {
  const v1 = m({ 'index.hbs': 'a', 'partials/sections/home/hero.hbs': { sha256: 'h1', layer: 'Hero' }, 'package.json': 'p' })
  const v2 = m({ 'index.hbs': 'a', 'partials/sections/home/hero.hbs': { sha256: 'h2', layer: 'Hero' }, 'package.json': 'p', 'error.hbs': 'e' })
  assert.equal(changedLine(v1, null), HISTORY_WORDS.firstDeploy)
  assert.equal(changedLine(v2, { version: '1.0.0', manifest: v1 }), 'Changed: Hero · added 404 template')
  assert.equal(changedLine(null, { version: '1.0.0', manifest: v1 }), null)
  assert.equal(changedLine(v2, { version: '1.0.0', manifest: null }), null)
  assert.equal(changedLine(v1, { version: '1.0.0', manifest: v1 }), 'No changes since v1')
  // a removed template, every other file by its kind word, each name once, plain names first
  const v3 = m({ 'index.hbs': 'b', 'partials/sections/home/hero.hbs': { sha256: 'h2', layer: 'Hero' }, 'package.json': 'q', 'assets/css/screen.css': 's' })
  assert.equal(changedLine(v3, { version: '2.0.0', manifest: v2 }), `Changed: Home page 2, Theme settings, Stylesheet ${HISTORY_WORDS.more(1)}`)
  const few = m({ 'index.hbs': 'a', 'partials/sections/home/hero.hbs': { sha256: 'h2', layer: 'Hero' }, 'package.json': 'p' })
  assert.equal(changedLine(few, { version: '2.0.0', manifest: v2 }), 'Changed: removed 404 template')
  // two fonts are one name; a move (same bytes, a new path) is no change
  const fonts = m({ 'assets/fonts/a.woff2': '1', 'assets/fonts/b.woff2': '2' })
  assert.equal(changedLine(m({ 'assets/fonts/a.woff2': '9', 'assets/fonts/b.woff2': '8' }), { version: '4.0.0', manifest: fonts }), 'Changed: Font')
  assert.equal(changedLine(m({ 'assets/fonts/c.woff2': '1', 'assets/fonts/b.woff2': '2' }), { version: '4.0.0', manifest: fonts }), 'No changes since v4')
})

const accepted = (n: number, over: Partial<AcceptedRow> = {}): AcceptedRow =>
  ({ id: `v${n}`, version: `${n}.0.0`, status: 'uploaded', site_id: A, created_at: at(n), accepted_at: at(n), artifact_path: `${P}/v${n}.zip`, ...over })

test('7.23a: the route\'s answer — newest accepted first, each row\'s Changed line against its predecessor (a pruned one counts), the settings Ghost would forget against the site\'s Live row, the action, and the live version; the manifests read are bounded by the listed rows, their predecessors and the Live rows', () => {
  const rows = [
    accepted(1, { artifact_path: null }), // pruned: its manifest is kept, and it is v2's predecessor
    accepted(2),
    accepted(3, { status: 'live' }),
    accepted(4, { site_id: B }),
  ]
  const heavy = new Map([
    ['v1', { content_manifest: m({ 'index.hbs': 'a' }), preflight: { custom: { accent_label: 'x' } } }],
    ['v2', { content_manifest: m({ 'index.hbs': 'b' }), preflight: { custom: {} } }],
    ['v3', { content_manifest: m({ 'index.hbs': 'b' }), preflight: { custom: { accent_label: 'x', hero_size: 'Large' } } }],
    ['v4', { content_manifest: null, preflight: null }],
  ])
  assert.deepEqual(heavyIds(rows).sort(), ['v1', 'v2', 'v3', 'v4'], 'v1 is read only as v2\'s predecessor')
  assert.deepEqual(heavyIds([accepted(5, { artifact_path: null }), accepted(6, { artifact_path: null }), accepted(7)]).sort(), ['v6', 'v7'], 'an older pruned row no listed row needs is never read')
  const listed = rows.filter(isStoredVersion).map((r) => ({ id: r.id, pinned: false, errors: 0, warnings: 0, host: r.site_id === A ? 'a.com' : 'b.com' }))
  const answer = historyAnswer({ linkedSiteId: A, listed: listed.reverse(), rows, heavy })
  assert.equal(answer.liveVersion, '3.0.0')
  assert.deepEqual(answer.rows.map((r) => r.id), ['v4', 'v3', 'v2'], 'newest accepted first')
  const by = Object.fromEntries(answer.rows.map((r) => [r.id, r]))
  assert.equal(by.v2?.changed, 'Changed: Home page 2', 'compared with the pruned v1')
  assert.equal(by.v3?.changed, 'No changes since v2')
  assert.equal(by.v4?.changed, HISTORY_WORDS.firstDeploy, 'v4 is the first on its own site')
  assert.deepEqual(by.v2?.drops, ['accent_label', 'hero_size'], 'the Live v3 declares two settings v2 lacks (`droppedKeys`, Pre-flight\'s rule)')
  assert.deepEqual(by.v3?.drops, [], 'the Live row drops nothing')
  assert.deepEqual(by.v4?.drops, [], 'a row with no facts lists nothing (Pre-flight\'s own rule)')
  assert.deepEqual([by.v4?.action, by.v3?.action, by.v2?.action], [null, null, 'rollback'])
  // the drawer: the first three expanded, the undo emphasised, the dropped settings named as Ghost names them
  const drawn = historyRows(answer)
  assert.deepEqual(drawn.map((r) => [r.n, r.expanded, r.emphasis]), [[4, true, false], [3, true, false], [2, true, true]])
  assert.deepEqual(drawn[2]?.drops, ['Accent label', 'Hero size'])
  assert.equal(EXPANDED, 3)
})

test('7.23a: D2d\'s row — an `uploaded` row that is the newest accepted on the linked site answers Re-activate; once another upload is newer it is a Roll back', () => {
  const rows = [accepted(1, { status: 'live' }), accepted(2)]
  const listed = rows.map((r) => ({ id: r.id, pinned: false, errors: 0, warnings: 0, host: 'a.com' }))
  const heavy = new Map(rows.map((r) => [r.id, { content_manifest: null, preflight: null }]))
  assert.deepEqual(historyAnswer({ linkedSiteId: A, listed, rows, heavy }).rows.map((r) => r.action), ['reactivate', null])
  const later = [accepted(1, { status: 'live', accepted_at: at(9) }), accepted(2)]
  assert.deepEqual(historyAnswer({ linkedSiteId: A, listed, rows: later, heavy }).rows.map((r) => [r.id, r.action]), [['v1', null], ['v2', 'rollback']])
})

test('7.23a: the emphasised Roll back is the row right after the linked site\'s Live row — the undo — and nothing is emphasised with nothing live', () => {
  const rows = historyRows(answerOf([{ action: 'rollback' }, { action: 'rollback' }, { status: 'live' }, { action: 'rollback' }]))
  assert.deepEqual(rows.map((r) => [r.n, r.emphasis, r.expanded]), [[4, false, true], [3, false, true], [2, true, true], [1, false, false]])
  assert.deepEqual(historyRows(answerOf([{ action: 'rollback' }, { action: 'reactivate' }])).map((r) => r.emphasis), [false, false])
  // another site's Live row is not the linked site's
  assert.deepEqual(historyRows(answerOf([{ action: 'rollback' }, { status: 'live', siteId: B }])).map((r) => r.emphasis), [false, false])
})

test('7.23a: the undo is the linked site\'s NEXT row after its Live row — another site\'s rows between are skipped — and only as a Roll back; the control: with none between, the row right after', () => {
  const between = historyRows(answerOf([{ action: 'rollback' }, { siteId: B, host: 'b.com' }, { status: 'live' }]))
  assert.deepEqual(between.map((r) => [r.n, r.emphasis]), [[3, false], [2, false], [1, true]], 'v2 is another site\'s: v1 is the undo')
  const none = historyRows(answerOf([{ action: 'rollback' }, { status: 'live' }]))
  assert.deepEqual(none.map((r) => [r.n, r.emphasis]), [[2, false], [1, true]])
})

test('7.23a: D2d\'s row is drawn expanded wherever it falls — below three newer rows of another site it keeps its chip and line; the control: a Roll back row in the same place is compact', () => {
  const newer = [{ siteId: B, host: 'b.com' }, { siteId: B, host: 'b.com' }, { siteId: B, host: 'b.com' }]
  const d2d = historyRows(answerOf([{ action: 'reactivate' }, ...newer]))
  assert.deepEqual(d2d.map((r) => [r.n, r.expanded]), [[4, true], [3, true], [2, true], [1, true]])
  const rollback = historyRows(answerOf([{ action: 'rollback' }, ...newer]))
  assert.deepEqual(rollback.map((r) => [r.n, r.expanded]), [[4, true], [3, true], [2, true], [1, false]])
})

test('7.23a: the confirm never promises "nothing is lost" when nobody knows — a row (or the Live row) kept before Story 7.18b has no Pre-flight facts, so its drops are UNKNOWN (null) and the body stops at "stays in history."; the control: facts that declare no settings are known, and nothing is lost', () => {
  const rows = [accepted(1), accepted(2, { status: 'live' })]
  const listed = rows.map((r) => ({ id: r.id, pinned: false, errors: 0, warnings: 0, host: 'a.com' }))
  const drops = (v1: HeavyRow['preflight'], v2: HeavyRow['preflight']) =>
    historyAnswer({ linkedSiteId: A, listed, rows, heavy: new Map([['v1', { content_manifest: null, preflight: v1 }], ['v2', { content_manifest: null, preflight: v2 }]]) }).rows.find((r) => r.id === 'v1')?.drops
  assert.equal(drops(null, { custom: { accent_label: 'x' } }), null, 'v1 kept before 7.18b: unknown')
  assert.equal(drops({ custom: {} }, null), null, 'the Live row kept before 7.18b: unknown')
  const unknown = historyRows(historyAnswer({ linkedSiteId: A, listed, rows, heavy: new Map([['v1', { content_manifest: null, preflight: null }], ['v2', { content_manifest: null, preflight: { custom: {} } }]]) })).find((r) => r.n === 1)
  assert.ok(unknown)
  assert.equal(unknown.drops, null, 'drawn as unknown, never as an empty list')
  assert.equal(HISTORY_WORDS.confirmBody(1, 2, unknown.drops), 'Your live site switches to v1 instantly. v2 stays in history.')
  // the control: `custom` null is known — the theme declares none
  assert.deepEqual(drops({ custom: null }, { custom: null }), [])
  assert.equal(HISTORY_WORDS.confirmBody(1, 2, drops({ custom: null }, { custom: null }) ?? null), 'Your live site switches to v1 instantly. v2 stays in history — nothing is lost.')
  assert.deepEqual(drops({ custom: null }, { custom: { accent_label: 'x' } }), ['accent_label'], 'a theme declaring none drops every key the Live one declares')
  // the Live row itself drops nothing, whatever its facts
  assert.deepEqual(historyAnswer({ linkedSiteId: A, listed, rows, heavy: new Map() }).rows.find((r) => r.id === 'v2')?.drops, [])
})

test('7.23a: "v{n} stays in history" only of a version that IS kept — a Live row since pruned answers no live version; the control: the same Live row stored', () => {
  const listed = [{ id: 'v1', pinned: false, errors: 0, warnings: 0, host: 'a.com' }]
  const heavy = new Map<string, HeavyRow>()
  assert.equal(historyAnswer({ linkedSiteId: A, listed, rows: [accepted(1), accepted(2, { status: 'live', artifact_path: null })], heavy }).liveVersion, null)
  assert.equal(historyAnswer({ linkedSiteId: A, listed, rows: [accepted(1), accepted(2, { status: 'live' })], heavy }).liveVersion, '2.0.0')
})

test('7.23a: the put-back\'s outcome from the route\'s answer — 200 live/uploaded, 404 gone, 409 its four codes, 422 Ghost\'s check with its detail, 502 the code and message — and anything else a request that failed; each said once in its own words', () => {
  assert.deepEqual(actOutcomeOf(200, { outcome: 'live' }), { kind: 'live' })
  assert.deepEqual(actOutcomeOf(200, { outcome: 'uploaded' }), { kind: 'uploaded' })
  assert.deepEqual(actOutcomeOf(404, null), { kind: 'gone' })
  for (const code of ['elsewhere', 'live', 'disconnected', 'busy']) assert.deepEqual(actOutcomeOf(409, { code }), { kind: 'refused', code })
  assert.deepEqual(actOutcomeOf(409, { code: 'other' }), { kind: 'failed' })
  assert.deepEqual(actOutcomeOf(422, { code: 'ghost_theme_refused', detail: 'Missing index.hbs' }), { kind: 'refused', code: 'ghost_theme_refused', detail: 'Missing index.hbs' })
  const key = deployError('ghost_key_refused', { host: 'a.com' })
  assert.deepEqual(actOutcomeOf(502, { code: key.code, message: key.message }), { kind: 'refused', code: key.code, message: key.message })
  for (const [status, body] of [[0, null], [500, null], [200, {}], [502, {}]] as const) assert.deepEqual(actOutcomeOf(status, body), { kind: 'failed' })
  assert.equal(actSaid({ kind: 'live' }, 2, 'a.com'), 'v2 is live on a.com.')
  assert.equal(actSaid({ kind: 'uploaded' }, 2, 'a.com'), "v2 is on a.com but isn't live yet.")
  assert.equal(actSaid({ kind: 'gone' }, 2, 'a.com'), HISTORY_WORDS.said.gone(2))
  assert.equal(actSaid({ kind: 'refused', code: 'ghost_theme_refused', detail: 'x' }, 1, 'a.com'), HISTORY_WORDS.ghostRefused(1))
  assert.equal(actSaid({ kind: 'refused', code: 'disconnected' }, 1, 'a.com'), 'Reconnect a.com in Sites to roll back.')
  assert.equal(actSaid({ kind: 'refused', code: 'busy' }, 1, 'a.com'), 'A deploy to a.com is under way. Try again when it ends.')
  assert.equal(actSaid({ kind: 'refused', code: key.code, message: key.message }, 1, 'a.com'), key.message, 'Ghost\'s other answers: `deployError`\'s words')
  assert.equal(actSaid({ kind: 'failed' }, 1, 'a.com'), HISTORY_WORDS.actFailed(1))
})

test('7.23a: the words — S8e\'s tooltip and S4d\'s caption whole, the confirm\'s title and its three bodies (nothing live; the frame\'s; ending at "stays in history." where Ghost will forget a setting), D2d\'s chip and the wizard\'s own line and busy word', () => {
  assert.equal(HISTORY_WORDS.tooltip, 'History — every version, one click back')
  assert.equal(HISTORY_WORDS.menuCaption, 'Versions, gscan reports, rollback')
  assert.equal(HISTORY_WORDS.open, 'History', 'the clock\'s name stays')
  assert.equal(HISTORY_WORDS.confirmTitle(4), 'Roll back to v4?')
  assert.equal(HISTORY_WORDS.confirmBody(4, 5, []), 'Your live site switches to v4 instantly. v5 stays in history — nothing is lost.')
  assert.equal(HISTORY_WORDS.confirmBody(4, 5, ['Accent label']), 'Your live site switches to v4 instantly. v5 stays in history.')
  assert.equal(HISTORY_WORDS.confirmBody(4, null, []), 'Your live site switches to v4 instantly.')
  assert.equal(HISTORY_WORDS.uploadedChip, 'Uploaded, not live')
  assert.equal(HISTORY_WORDS.notLive, DEPLOY_WORDS.notLiveTitle)
  assert.equal(HISTORY_WORDS.activating, DEPLOY_WORDS.activating)
  assert.equal(HISTORY_WORDS.rollingBack, 'Rolling back…')
  assert.equal(HISTORY_WORDS.rollBackName(3), 'Roll back to v3')
  // Pre-flight's own rule, one function for both callers
  assert.deepEqual(droppedKeys({ a: 1, b: 2 }, { a: 1 }), ['b'])
  assert.deepEqual(droppedKeys({ a: 1 }, null), ['a'])
  assert.match(PREFLIGHT_WORDS.dropped(1, 'a.com'), /^Ghost will forget 1 setting on a\.com$/)
})
