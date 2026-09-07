import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BATCH, BUCKETS, CRON_PATH, authorized, prefixesFor } from './app/api/cron/purge-accounts/purge-rule.ts'
import { MAX_ROUNDS, drainPrefix, type DrainBucket } from './lib/storage-drain.ts'

/* Story 2.6 — FR-A5's purge, every part of it a test can reach. The ROUTE cannot be one of them:
   it needs a deployment, Vercel's bearer and an account whose deadline has passed, and
   `tools/probe/run-verify-account-purge.py` is where that runs against the real project (R-82).
   What is here is the door's lock, the four prefixes, the walker, and the two facts a fully green
   gate cannot otherwise see — that the schedule names the route, and that nothing here emails. */

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

test('the schedule names the route, and it runs once a day', () => {
  // A path typed twice is a cron that invokes a 404 once a day for ever, and every check stays
  // green. So both are READ and compared: the constant the handler lives at, and the schedule
  // Vercel deploys from.
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    crons?: { path: string; schedule: string }[]
  }
  assert.equal(vercel.crons?.length, 1, 'vercel.json must carry exactly one crons entry (AD-33)')
  const [job] = vercel.crons
  assert.equal(job.path, CRON_PATH)
  const fields = job.schedule.trim().split(/\s+/)
  assert.equal(fields.length, 5, `'${job.schedule}' is not a five-field cron expression`)
  const [minute, hour, ...rest] = fields
  assert.match(minute, /^\d+$/, 'a daily job pins its minute')
  assert.match(hour, /^\d+$/, 'a daily job pins its hour')
  assert.deepEqual(rest, ['*', '*', '*'], `'${job.schedule}' does not run once a day`)
})

test('nothing in the purge sends mail — FR-A5 says so in its last sentence', () => {
  // FR-P2's list has no purge email and FR-A5 ends by saying none is sent. An import added here
  // in some later pass would be green everywhere else; this is the only thing that sees it.
  for (const file of [`${ROUTE_DIR}/route.ts`, `${ROUTE_DIR}/purge-rule.ts`, 'lib/storage-drain.ts']) {
    assert.doesNotMatch(
      readFileSync(file, 'utf8').replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' '),
      /from\s*'[^']*(?:lib\/)?(?:deletion-)?email(?:\.ts)?'/,
      `${file} imports the email layer. The purge sends nothing (FR-A5, FR-P2).`,
    )
  }
})

test('the run is a batch of the oldest deadlines, and one failure never stops the rest', () => {
  // The ROUTE needs a deployment, Vercel's bearer and a due account, so three of the matrix's
  // rows have no unit test that could reach them — a batch bigger than BATCH, a `deleteUser` that
  // fails, a Storage removal that is refused. Each is a promise the SOURCE makes, and each fails
  // silently: a missing `.order()` purges an arbitrary 25 of 40 and the rest wait a day for no
  // reason; a `try` around the whole loop instead of around each account stops the run at the
  // first bad account; a 200 on a failed run is a purge that quietly became retention, and
  // Vercel neither retries nor alerts (DW-46).
  const route = readFileSync(`${ROUTE_DIR}/route.ts`, 'utf8').replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' ')
  const flat = route.replace(/\s+/g, ' ')
  assert.match(flat, /\.order\('purge_after'\)/, 'the oldest deadline must be purged first')
  assert.match(flat, /\.limit\(BATCH\)/, 'the run is bounded by BATCH, not by whatever is due')
  assert.match(
    flat,
    /status: failed \? 500 : 200/,
    'a run with a failed account must answer 500 — the red line in Vercel\'s log is the only alarm',
  )
  // The `try` opens INSIDE the loop over the due accounts, not around it.
  const loop = flat.indexOf('for (const { user_id')
  assert.ok(loop >= 0, 'the loop over the due accounts was not found')
  assert.ok(
    flat.slice(loop).indexOf('try {') < flat.slice(loop).indexOf('catch'),
    'each account must be its own try — one failure leaves the rest due today, not tomorrow',
  )
  assert.match(
    flat,
    /console\.error\('purge: failed', \{ userId,/,
    'a failed account is logged by id and step — never by address (FR-A5 leaves no trace behind)',
  )
})
