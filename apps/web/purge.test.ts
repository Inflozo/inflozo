import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  BATCH,
  BUCKETS,
  BUDGET_MS,
  CRON_PATH,
  prefixesFor,
  runPurge,
  type PurgeDeps,
} from './app/api/cron/purge-accounts/purge-rule.ts'
/* THE BEARER COMPARE MOVED TO `lib/cron-auth.ts` WITH STORY 3.7 and every assertion below it came
   with it: AD-33's second scheduled job needs the same fail-closed door, and a copy beside the new
   route would have been a second place for the rule to be true. It is still executed here, because
   this is where it was written and where the reasons for each of its cases are recorded. */
import { authorized } from './lib/cron-auth.ts'
import { CRON_PATH as HEALTH_CRON_PATH } from './lib/health-rule.ts'
import { MAX_ROUNDS, drainPrefix, type DrainBucket } from './lib/storage-drain.ts'

/* Story 2.6 — FR-A5's purge, every part of it a test can reach. The ROUTE cannot be one of them:
   it needs a deployment, Vercel's bearer and an account whose deadline has passed, and
   `tools/probe/run-verify-account-purge.py` is where that runs against the real project (R-82).
   What is here is the door's lock, the four prefixes, the walker, the LOOP over the due accounts
   (pure over `PurgeDeps` since the review, so one failure never stopping the rest is executed
   rather than read off the source), and the two facts a fully green gate cannot otherwise see —
   that the schedule names the route, and that nothing here emails. */

const ROUTE_DIR = 'app/api/cron/purge-accounts'
const A = '11111111-1111-1111-1111-111111111111'
const P = '22222222-2222-2222-2222-222222222222'

test('the bearer is the exact one, and an unset secret is a shut door', () => {
  assert.equal(authorized('Bearer s3cret', 's3cret'), true)
  assert.equal(authorized('Bearer wrong!', 's3cret'), false, 'a wrong secret of the SAME length')
  assert.equal(authorized('Bearer s3cre', 's3cret'), false, 'a different length must not throw')
  assert.equal(authorized('Bearer s3cretttt', 's3cret'), false)
  assert.equal(authorized('s3cret', 's3cret'), false, 'the scheme is part of the header')
  assert.equal(authorized(null, 's3cret'), false, 'no Authorization header at all')
  assert.equal(
    authorized('Bearer ', ''),
    false,
    'an EMPTY CRON_SECRET must be 401, not an endpoint whose password is the empty string',
  )
  assert.equal(
    authorized('Bearer undefined', undefined),
    false,
    'an UNSET CRON_SECRET must be 401 — the purge is irreversible and this is its only guard',
  )
})

test('every prefix an account owns, in every bucket the schema gives a layout', () => {
  const withProject = prefixesFor(A, [P])
  assert.equal(withProject.length, 4)
  assert.equal(prefixesFor(A, []).length, 3, 'no project means no deploy-artifacts prefix')

  for (const [bucket, prefix] of withProject) {
    assert.ok(BUCKETS.includes(bucket as (typeof BUCKETS)[number]), `${bucket} is not one of the four`)
    assert.ok(prefix.endsWith('/'), `${bucket}: '${prefix}' does not end in '/' — a bare id also ` +
      'matches a sibling folder whose id merely starts the same')
    assert.ok(prefix === `${A}/` || prefix === `${P}/`, `${bucket}: '${prefix}' is neither id`)
  }
  // Every bucket the schema states a layout for is walked; a fifth bucket added to BUCKETS and
  // forgotten in prefixesFor would leave its objects behind for ever.
  assert.deepEqual(
    [...new Set(withProject.map(([bucket]) => bucket))].sort(),
    [...BUCKETS].sort(),
  )
  assert.equal(typeof BATCH, 'number')
  assert.ok(BATCH > 0)
})

/** A bucket handle of the two methods the walker uses, over pages it is handed. */
function stubBucket(pages: string[][]): DrainBucket & { removed: string[][] } {
  const left = pages.map((page) => [...page])
  const removed: string[][] = []
  return {
    removed,
    async listV2() {
      const page = left.shift() ?? []
      return { data: { objects: page.map((name) => ({ name })) }, error: null }
    },
    async remove(paths) {
      removed.push(paths)
      return { error: null }
    },
  }
}

test('the walker lists and removes until the prefix is empty', async () => {
  const bucket = stubBucket([['a/1', 'a/2'], ['a/3'], []])
  assert.equal(await drainPrefix(bucket, 'a/'), 3)
  assert.deepEqual(bucket.removed, [['a/1', 'a/2'], ['a/3']], 'the FULL keys the listing returned')
})

test('a prefix that is already empty removes nothing and is not an error', async () => {
  const bucket = stubBucket([[]])
  assert.equal(await drainPrefix(bucket, 'a/'), 0)
  assert.deepEqual(bucket.removed, [])
})

test('an empty prefix is the whole bucket, and the walker refuses it before listing', async () => {
  // An empty id would make `prefixesFor` emit `/`, and a `listV2({ prefix: '/' })` is every
  // user's objects. The guard lives in the one walker every purge routes through.
  for (const prefix of ['', '/', '//']) {
    let listed = 0
    const bucket: DrainBucket = {
      async listV2() {
        listed += 1
        return { data: { objects: [{ name: 'someone-else/1' }] }, error: null }
      },
      async remove() {
        throw new Error('remove must never be reached for an empty prefix')
      },
    }
    await assert.rejects(drainPrefix(bucket, prefix), (error: Error & { step?: string }) => {
      assert.equal(error.step, 'objects')
      assert.match(error.message, /whole bucket/)
      return true
    })
    assert.equal(listed, 0, `'${prefix}' must be refused BEFORE anything is listed`)
  }
})

test('a listing that fails throws, with the account step the route logs', async () => {
  const bucket: DrainBucket = {
    async listV2() {
      return { data: null, error: { message: 'no', code: 'AccessDenied' } }
    },
    async remove() {
      throw new Error('remove must not be reached when the listing failed')
    },
  }
  await assert.rejects(drainPrefix(bucket, 'a/'), (error: Error & { step?: string; code?: string }) => {
    assert.equal(error.step, 'objects')
    assert.equal(error.code, 'AccessDenied')
    return true
  })
})

test('a removal that fails throws before the rows are touched', async () => {
  const bucket: DrainBucket = {
    async listV2() {
      return { data: { objects: [{ name: 'a/1' }] }, error: null }
    },
    async remove() {
      return { error: { message: 'nope', code: 'AccessDenied' } }
    },
  }
  await assert.rejects(drainPrefix(bucket, 'a/'), (error: Error & { step?: string }) => {
    assert.equal(error.step, 'objects')
    return true
  })
})

test('a listing that never empties stops, rather than spinning for the whole function', async () => {
  let rounds = 0
  const bucket: DrainBucket = {
    async listV2() {
      rounds += 1
      return { data: { objects: [{ name: 'a/1' }] }, error: null }
    },
    async remove() {
      return { error: null }
    },
  }
  await assert.rejects(drainPrefix(bucket, 'a/'), /after 100 rounds/)
  assert.equal(rounds, MAX_ROUNDS)
})

/**
 * The loop's dependencies as a recorder: every call in order, and a failure where asked. `due`
 * serves the queue it is given the way the route's query does, oldest first, `limit` at a time,
 * without the ids it is told to exclude, and without an account once it is deleted.
 *
 * AND A CLOCK, which moves `stepMs` each time an account is started. Every loop test runs on it
 * (DW-47): a loop that stops excluding what it tried meets the same failed account until its budget
 * is spent, and on the real clock that stalled this file for three minutes before it failed at all
 * (its control, Story 5.24b's Dev) instead of failing red at once.
 */
function stubDeps(
  failAt: { userId: string; step: 'projects' | 'objects' | 'suggestions' | 'user' } | null,
  queue: readonly string[] = [],
  stepMs = 1_000,
) {
  const calls: string[] = []
  const deleted = new Set<string>()
  let at = 0
  const refuse = (userId: string, step: string) => {
    if (failAt && failAt.userId === userId && failAt.step === step) {
      throw Object.assign(new Error(`${step} refused`), { step, code: 'Refused' })
    }
  }
  const deps: PurgeDeps = {
    async due(excluding, limit) {
      return queue.filter((id) => !excluding.includes(id) && !deleted.has(id)).slice(0, limit)
    },
    async projectIds(userId) {
      at += stepMs
      calls.push(`projects:${userId}`)
      refuse(userId, 'projects')
      return userId === 'u2' ? ['p2'] : []
    },
    async drain(bucket, prefix) {
      calls.push(`drain:${bucket}:${prefix}`)
      if (bucket === 'site-snapshots') refuse(prefix.slice(0, -1), 'objects')
      return 1
    },
    async anonymise(userId) {
      calls.push(`anonymise:${userId}`)
      refuse(userId, 'suggestions')
    },
    async deleteUser(userId) {
      calls.push(`delete:${userId}`)
      refuse(userId, 'user')
      deleted.add(userId)
    },
  }
  return { deps, calls, now: () => at }
}

/** A log that records rather than prints. */
function recorder() {
  const errors: unknown[][] = []
  const infos: unknown[][] = []
  return { errors, infos, log: { log: (...a: unknown[]) => infos.push(a), error: (...a: unknown[]) => errors.push(a) } }
}

test('one account is objects → suggestions → user, every prefix drained before any row moves', async () => {
  const { deps, calls, now } = stubDeps(null, ['u2'])
  const { log, infos } = recorder()
  assert.deepEqual(await runPurge(deps, log, now), { purged: 1, failed: 0 })
  assert.deepEqual(calls, [
    'projects:u2',
    'drain:assets:u2/',
    'drain:site-snapshots:u2/',
    'drain:suggestion-images:u2/',
    'drain:deploy-artifacts:p2/',
    'anonymise:u2',
    'delete:u2',
  ])
  assert.deepEqual(infos, [['purge: account removed', { userId: 'u2' }]])
})

test('one failed account never stops the rest, and the run counts it', async () => {
  // The matrix's `deleteUser fails` row: the second of three is refused, the third is still
  // reached in the SAME run, and the counts say so — the route turns `failed > 0` into a 500.
  const { deps, calls, now } = stubDeps({ userId: 'u2', step: 'user' }, ['u1', 'u2', 'u3'])
  const { log, errors } = recorder()
  assert.deepEqual(await runPurge(deps, log, now), { purged: 2, failed: 1 })
  assert.deepEqual(calls.filter((c) => c.startsWith('delete:')), ['delete:u1', 'delete:u2', 'delete:u3'])
  assert.equal(errors.length, 1)
  const [line, logged] = errors[0] as [string, Record<string, unknown>]
  assert.equal(line, 'purge: failed')
  assert.equal(logged.userId, 'u2')
  assert.equal(logged.step, 'user')
  assert.equal(logged.code, 'Refused')
  assert.ok(!('email' in logged), 'a failed account is logged by id — never by address (FR-A5)')
})

test('a refused drain leaves the rows alone, and the log names the bucket', async () => {
  // The matrix's `Storage refuses a removal` row: the walker throws `{ step: "objects" }` without
  // knowing its bucket; the loop attaches it. Nothing of that account's rows is touched.
  const { deps, calls, now } = stubDeps({ userId: 'u1', step: 'objects' }, ['u1'])
  const { log, errors } = recorder()
  assert.deepEqual(await runPurge(deps, log, now), { purged: 0, failed: 1 })
  assert.ok(!calls.includes('anonymise:u1') && !calls.includes('delete:u1'), 'rows kept for tomorrow')
  const [, logged] = errors[0] as [string, Record<string, unknown>]
  assert.equal(logged.step, 'objects')
  assert.equal(logged.bucket, 'site-snapshots')
})

test('nothing due is a run of nothing, not an error', async () => {
  const { deps, calls, now } = stubDeps(null)
  assert.deepEqual(await runPurge(deps, recorder().log, now), { purged: 0, failed: 0 })
  assert.deepEqual(calls, [])
})

/* DW-47 (Story 5.24b): A STARVED QUEUE. The run took one batch of the oldest deadlines, and a failed
   account stays at the head of that queue by construction, so BATCH accounts that always failed
   kept every account behind them from ever being reached, every day. */

test('BATCH always-failing accounts ahead of a good one no longer starve it: purged in the same run', async () => {
  const failing = Array.from({ length: BATCH }, (_, i) => `f${i}`)
  const { deps, now } = stubDeps(null, [...failing, 'good'])
  const projectIds = deps.projectIds
  deps.projectIds = async (userId) => {
    const ids = await projectIds(userId)
    if (userId !== 'good') throw Object.assign(new Error('always refused'), { step: 'projects', code: 'Refused' })
    return ids
  }
  const asked: number[] = []
  const due = deps.due
  deps.due = async (excluding, limit) => {
    assert.equal(limit, BATCH, 'each query takes BATCH, no more')
    asked.push(excluding.length)
    return due(excluding, limit)
  }
  const { log, errors } = recorder()
  assert.deepEqual(await runPurge(deps, log, now), { purged: 1, failed: BATCH })
  assert.equal(errors.length, BATCH, 'every failed account is still logged, as before')
  assert.deepEqual(asked, [0, BATCH, BATCH + 1], 'each query excludes every id the run tried, until nothing is due')
})

test('the clock stops the loop: no account is started once BUDGET_MS is spent', async () => {
  const STEP = 10_000
  const queue = Array.from({ length: 4 * BATCH }, (_, i) => `u${i}`)
  const { deps, calls, now } = stubDeps(null, queue, STEP)
  const reached = Math.ceil(BUDGET_MS / STEP)
  assert.ok(reached < queue.length, 'the queue outlasts the budget, or this proves nothing')
  assert.deepEqual(await runPurge(deps, recorder().log, now), { purged: reached, failed: 0 })
  assert.equal(calls.filter((call) => call.startsWith('delete:')).length, reached)
})

/* EVERY SCHEDULED JOB, DERIVED FROM THE FILE — never a count, and never a list retyped here
   (standing rule 4). This asserted `crons.length === 1` until Story 3.7 added AD-33's second job,
   which is exactly how a hardcoded total goes stale; what it asserts now is a PROPERTY of whatever
   entries the file carries, plus that each path a constant names is really one of them. AD-33's v1
   set is closed and adding a third is an `Ask First`, so the constants are the list. */
const CRON_CONSTANTS = { 'purge-accounts (Epic 2, Story 2.6)': CRON_PATH, 'site-health (Epic 3, Story 3.7)': HEALTH_CRON_PATH }

test('every scheduled job names a route that exists, and each runs once a day', () => {
  // A path typed twice is a cron that invokes a 404 once a day for ever, and every check stays
  // green. So both are READ and compared: the constant the handler lives at, and the schedule
  // Vercel deploys from — and the constant is checked against the file system, because a
  // route moved without its constant is the same 404 (review, 2026-09-07).
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    crons?: { path: string; schedule: string }[]
  }
  const jobs = vercel.crons ?? []
  assert.ok(jobs.length > 0, 'vercel.json carries no crons entry at all — AD-33\'s jobs would never run')

  for (const [name, path] of Object.entries(CRON_CONSTANTS)) {
    assert.ok(
      jobs.some((job) => job.path === path),
      `${name}: '${path}' is not scheduled in vercel.json, so the job never runs`,
    )
  }
  // …and no entry is scheduled that no constant names, which is the other half of the same 404.
  for (const job of jobs) {
    assert.ok(
      Object.values(CRON_CONSTANTS).includes(job.path),
      `vercel.json schedules '${job.path}', which no CRON_PATH constant names`,
    )
    assert.ok(existsSync(join('app', job.path, 'route.ts')), `no route.ts at app${job.path}`)
    const fields = job.schedule.trim().split(/\s+/)
    assert.equal(fields.length, 5, `'${job.schedule}' is not a five-field cron expression`)
    const [minute, hour, ...rest] = fields
    assert.match(minute, /^\d+$/, 'a daily job pins its minute')
    assert.match(hour, /^\d+$/, 'a daily job pins its hour')
    assert.deepEqual(rest, ['*', '*', '*'], `'${job.schedule}' does not run once a day`)
  }
  // THE TWO JOBS MUST NOT SHARE AN HOUR (the spec's own line): two cold starts in the same minute
  // is one function competing with itself for the pooler and for somebody else's Ghost.
  const hours = jobs.map((job) => job.schedule.trim().split(/\s+/)[1])
  assert.equal(new Set(hours).size, hours.length, `two scheduled jobs share an hour: ${hours.join(', ')}`)
})

test('nothing in the purge sends mail — FR-A5 says so in its last sentence', () => {
  // FR-P2's list has no purge email and FR-A5 ends by saying none is sent. An import added here
  // in some later pass would be green everywhere else; this is the only thing that sees it, so
  // it looks for any import or require whose specifier mentions mail, email or resend, in
  // either quote style (review, 2026-09-07: the first regex saw only a path ENDING in `email`).
  for (const file of [`${ROUTE_DIR}/route.ts`, `${ROUTE_DIR}/purge-rule.ts`, 'lib/storage-drain.ts']) {
    assert.doesNotMatch(
      readFileSync(file, 'utf8').replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' '),
      /(?:from\s*|import\s*\(|require\s*\()\s*["'][^"']*(?:mail|resend)[^"']*["']/i,
      `${file} imports a mail layer. The purge sends nothing (FR-A5, FR-P2).`,
    )
  }
})

test('each batch is the oldest deadlines not yet tried, and a failed account makes the run red', () => {
  // Promises only the ROUTE's source makes, and no stub can reach: the due query is bounded and
  // ordered (a missing `.order()` purges an arbitrary 25 of 40 and the rest wait a day for no
  // reason), it leaves out the ids `runPurge` hands it (without that, the loop above meets the same
  // failing accounts until the budget is spent — DW-47), the ceiling the budget sits under is
  // stated, and a run with a failed account answers 500 — Vercel neither retries nor alerts
  // (DW-46), so the red line is the alarm. "Each account is its own try" is no longer read off the
  // source: `runPurge` is executed above.
  const flat = readFileSync(`${ROUTE_DIR}/route.ts`, 'utf8')
    .replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' ')
    .replace(/\s+/g, ' ')
  assert.match(flat, /\.order\('purge_after'\)/, 'the oldest deadline must be purged first')
  assert.match(flat, /\.limit\(limit\)/, 'each query is bounded by the limit runPurge hands it, not by whatever is due')
  assert.match(
    flat,
    /const untried = excluding\.length \? profiles\.not\('user_id', 'in', `\(\$\{excluding\.join\(','\)\}\)`\) : profiles const \{ data, error \} = await untried \./,
    'the due query must leave out every id this run already tried (DW-47)',
  )
  const ceiling = /export const maxDuration = (\d+)/.exec(flat)
  assert.ok(ceiling, 'the route must state its maxDuration rather than assume the platform default')
  assert.ok(BUDGET_MS < Number(ceiling[1]) * 1000, 'the budget must end before the platform kills the run')
  assert.match(flat, /runPurge\(deps\)/, 'the route must run the loop that is tested above')
  assert.match(
    flat,
    /status: failed \? 500 : 200/,
    'a run with a failed account must answer 500 — the red line in Vercel\'s log is the only alarm',
  )
})
