// Story 7.22 — AD-33's artifact-retention job (`lib/artifact-sweep.ts`), its three passes over fake deps, the spec's sweep rows:
// DW-380's stranded checks, DW-374's dead zips, a project over its cap, and the controls (a check resting on the linked site, the
// drift check's live copies) untouched. The route's door, schedule and queries are read from its source below; the real run is walk
// step 120's (production, on the owner's go).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BATCH, BUDGET_MS, CRON_PATH, DEAD_AFTER_MS, overTheLeast, runSweep, type Dead, type Held, type Resting, type SweepDeps } from './lib/artifact-sweep.ts'
import { FEWEST_KEPT } from './lib/retention.ts'

const ROUTE = 'app/api/cron/prune-artifacts/route.ts'
const quiet = { log: () => {}, error: () => {} }
const job = (id: string, over: Partial<Resting> = {}): Resting => ({ id, userId: 'u', projectId: 'p', siteId: 'a', deployId: `d-${id}`, linkedSiteId: 'a', ...over })

/** Fake deps over the three passes; every call recorded in order. */
function deps(over: Partial<{ resting: Resting[] | Error; dead: Dead[] | Error; held: Held[] | Error; abandonFails: string[]; claimedFirst: string[]; dropFails: string[]; dropped: string[]; prune: Record<string, { pruned: number; failed: number } | Error> }> = {}) {
  const calls: string[] = []
  const d: SweepDeps = {
    async resting(limit) {
      calls.push(`resting:${limit}`)
      if (over.resting instanceof Error) throw over.resting
      return over.resting ?? []
    },
    async abandon(j) {
      calls.push(`abandon:${j.id}`)
      if (over.abandonFails?.includes(j.id)) throw Object.assign(new Error('x'), { code: '57014' })
      return !over.claimedFirst?.includes(j.id)
    },
    async dead(before, limit) {
      calls.push(`dead:${limit}:${before.toISOString()}`)
      if (over.dead instanceof Error) throw over.dead
      return over.dead ?? []
    },
    async drop(row) {
      calls.push(`drop:${row.id}`)
      if (over.dropFails?.includes(row.id)) throw Object.assign(new Error('x'), { code: 'storage_503' })
      return over.dropped === undefined || over.dropped.includes(row.id)
    },
    async held() {
      calls.push('held')
      if (over.held instanceof Error) throw over.held
      return over.held ?? []
    },
    async prune(p) {
      calls.push(`prune:${p.projectId}`)
      const answer = over.prune?.[p.projectId] ?? { pruned: 0, failed: 0 }
      if (answer instanceof Error) throw answer
      return answer
    },
  }
  return { d, calls }
}

test('pass 1 (DW-380): a check resting on a site its project no longer links — or on none — is abandoned; one resting on the linked site is the control, untouched', async () => {
  const { d, calls } = deps({ resting: [job('moved', { linkedSiteId: 'b' }), job('unlinked', { linkedSiteId: null }), job('here')] })
  const t = await runSweep(d, quiet)
  assert.deepEqual(calls.filter((c) => c.startsWith('abandon:')), ['abandon:moved', 'abandon:unlinked'])
  assert.equal(t.abandoned, 2)
  assert.equal(t.failed, 0)
})

test('pass 1: a stranded check a Ship it claimed since the read is left alone and not counted (the claim-first abandon, the review)', async () => {
  const { d } = deps({ resting: [job('shipped', { linkedSiteId: 'b' }), job('moved', { linkedSiteId: 'b' })], claimedFirst: ['shipped'] })
  const t = await runSweep(d, quiet)
  assert.deepEqual(t, { abandoned: 1, dropped: 0, pruned: 0, failed: 0 })
})

test('pass 2 (DW-374): the dead zips older than a day are dropped (the pointer-first `drop`); one another hand changed first is not counted', async () => {
  const now = Date.parse('2026-11-25T04:50:00Z')
  const { d, calls } = deps({ dead: [{ id: 'f1', userId: 'u', path: 'p/f1.zip' }, { id: 'f2', userId: 'u', path: 'p/f2.zip' }], dropped: ['f1'] })
  const t = await runSweep(d, quiet, () => now)
  assert.ok(calls.includes(`dead:${BATCH}:${new Date(now - DEAD_AFTER_MS).toISOString()}`), 'asked for rows a whole day old, one batch')
  assert.deepEqual(calls.filter((c) => c.startsWith('drop:')), ['drop:f1', 'drop:f2'])
  assert.equal(t.dropped, 1)
})

test('pass 3 (FR-J7): only projects holding more versions than the fewest any plan keeps are pruned — by the one rule — and their pruned rows are counted', async () => {
  const many = (projectId: string, n: number): Held[] => Array.from({ length: n }, () => ({ projectId, userId: 'u' }))
  const { d, calls } = deps({ held: [...many('over', FEWEST_KEPT + 1), ...many('at', FEWEST_KEPT)], prune: { over: { pruned: 1, failed: 0 } } })
  const t = await runSweep(d, quiet)
  assert.deepEqual(calls.filter((c) => c.startsWith('prune:')), ['prune:over'], 'a project at the fewest kept has nothing any plan prunes')
  assert.equal(t.pruned, 1)
  assert.deepEqual(overTheLeast([{ projectId: 'x', userId: 'u1' }, { projectId: 'x', userId: 'u2' }]), [], 'counted per owner and project')
})

test('the passes run in order — stranded checks first, so a zip they freed is no dead zip to drop twice — and each item\'s failure counts and never stops the rest', async () => {
  const { d, calls } = deps({
    resting: [job('a', { linkedSiteId: 'b' }), job('b', { linkedSiteId: 'b' })],
    abandonFails: ['a'],
    dead: [{ id: 'f1', userId: 'u', path: 'p/f1.zip' }, { id: 'f2', userId: 'u', path: 'p/f2.zip' }],
    dropFails: ['f1'],
    held: Array.from({ length: FEWEST_KEPT + 1 }, () => ({ projectId: 'p', userId: 'u' })),
    prune: { p: { pruned: 1, failed: 2 } },
  })
  const t = await runSweep(d, quiet)
  const order = calls.map((c) => c.split(':')[0])
  assert.ok(order.lastIndexOf('abandon') < order.indexOf('dead') && order.lastIndexOf('drop') < order.indexOf('held'), calls.join(' '))
  assert.deepEqual(t, { abandoned: 1, dropped: 1, pruned: 1, failed: 1 + 1 + 2 }, 'one abandon, one drop and two of the prune\'s rows failed')
})

test('a pass whose read fails counts and the next pass still runs; a prune whose plan read failed counts (nothing pruned there)', async () => {
  const { d, calls } = deps({
    resting: new Error('db'),
    dead: new Error('db'),
    held: Array.from({ length: FEWEST_KEPT + 1 }, () => ({ projectId: 'p', userId: 'u' })),
    prune: { p: Object.assign(new Error('plan'), { code: 'plan_unread' }) },
  })
  const t = await runSweep(d, quiet)
  assert.ok(calls.includes('held') && calls.includes('prune:p'))
  assert.equal(t.failed, 3)
})

test('the budget: no item is started once BUDGET_MS is spent — the rest wait a night', async () => {
  let clock = 0
  const { d, calls } = deps({ resting: [job('a', { linkedSiteId: null }), job('b', { linkedSiteId: null })] })
  const abandon = d.abandon.bind(d)
  d.abandon = async (j) => {
    const claimed = await abandon(j)
    clock += BUDGET_MS
    return claimed
  }
  await runSweep(d, quiet, () => clock)
  assert.deepEqual(calls.filter((c) => c.startsWith('abandon:')), ['abandon:a'])
  assert.ok(!calls.includes('held'), 'no pass starts past the budget')
})

test('the route: the door before any read, `force-dynamic`, the ceiling stated past the budget, `runSweep` run, a 500 when anything failed — and the queries keep the controls', () => {
  const flat = readFileSync(ROUTE, 'utf8').replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ')
  assert.ok(flat.indexOf('authorized(request.headers.get') < flat.indexOf('supabaseAdmin()'), 'the CRON_SECRET door comes before any read')
  assert.match(flat, /export const dynamic = 'force-dynamic'/)
  const ceiling = /export const maxDuration = (\d+)/.exec(flat)
  assert.ok(ceiling && BUDGET_MS < Number(ceiling[1]) * 1000)
  assert.match(flat, /runSweep\(deps\)/)
  assert.match(flat, /status: totals\.failed \? 500 : 200/)
  assert.match(flat, /'Cache-Control': 'no-store'/)
  assert.match(flat, /await abandon\(io, /, 'pass 1 is run.ts\'s own abandon')
  assert.match(flat, /pruneProject\(project, RETENTION_IO\)/, 'pass 3 is the one prune')
  // the dead zips: never a version, never one a resting check names, and the clear re-checks both before the object goes
  assert.match(flat, /\.not\('status', 'in', '\(uploaded,live\)'\) \.not\('artifact_path', 'is', null\) \.lt\('created_at', before\.toISOString\(\)\)/)
  // …every job NOT AT REST holds its zip — a Ship it under way reads it after leaving awaiting_ship (the review, 2026-11-25)
  assert.match(flat, /from\('deploy_jobs'\)\.select\('id, deploy_id'\)\.in\('stage', \[\.\.\.MOVING, 'awaiting_ship'\]\)/)
  // pass 1 claims the job off awaiting_ship before `abandon` touches its row or its object
  assert.match(flat, /update\(\{ stage: 'cancelled', [^}]*\}\) \.eq\('id', job\.id\) \.eq\('user_id', job\.userId\) \.eq\('stage', 'awaiting_ship'\)/)
  assert.ok(flat.indexOf(".eq('stage', 'awaiting_ship') .select('id')") < flat.indexOf('await abandon(io, '), 'the claim comes first')
  // every cross-account read pages past the Data API's max_rows until an empty page: none is one bare read
  for (const step of ['resting', 'dead held', 'dead', 'held']) assert.match(flat, new RegExp(`\\.range\\(from, to\\)[^;]*'${step}'`), `${step} pages`)
  assert.match(flat, /if \(!data\?\.length\) break/, 'a page stops only when EMPTY')
  assert.match(flat, /\.eq\('artifact_path', row\.path\) \.not\('status', 'in', '\(uploaded,live\)'\) \.select\('id'\)/)
  // nothing here lists a prefix: an object no row names (the live copies under `live/`) is never touched
  assert.doesNotMatch(flat, /listV2|drainPrefix|\/live\//)
  assert.equal(CRON_PATH, '/api/cron/prune-artifacts')
})
