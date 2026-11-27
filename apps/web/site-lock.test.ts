// Story 7.25 — the per-site advisory lock (`server/site-lock.ts`' `withSiteLock`) over a fake client: the statements in order with
// the key's text, the wait running out (55P03, 57014) as not held with the work never run, a throw from the work rethrown, a commit
// lost after the work keeping the work's value with its log line, and the client ended on every path. The real thing on a real
// Postgres and on the production pooler is `tools/probe/record-site-lock.mjs` (MEASUREMENTS §92).
import { mock, test } from 'node:test'
import assert from 'node:assert/strict'
import type { LockClient } from './server/ghost-admin/db.ts'
import { STALLED_MS } from './server/deploy/run.ts'
import { KEEP_ALIVE_MS, LOCK_WAIT_MS, withSiteLock, type SiteLockIo } from './server/site-lock.ts'

const S = '00000000-0000-4000-8000-0000000000bb'

/** A fake connection: every statement's text (values as $n) and values, in order; `answer` may fail one by its text */
function fake(answer: (text: string) => unknown = () => []) {
  const said: string[] = []
  const values: unknown[][] = []
  const logs: [string, unknown][] = []
  let ended = 0
  let connects = 0
  let notice: (n: { code: string }) => void = () => {}
  const db = Object.assign(
    (strings: TemplateStringsArray, ...vs: unknown[]) => {
      const text = strings.reduce((t, s, i) => `${t}${i === 0 ? '' : `$${i}`}${s}`, '')
      said.push(text)
      values.push(vs)
      try {
        const a = answer(text)
        return a instanceof Error ? Promise.reject(a) : Promise.resolve(a)
      } catch (e) {
        return Promise.reject(e)
      }
    },
    { end: async () => void (ended += 1) },
  )
  const io: SiteLockIo = {
    connect: (on) => {
      connects += 1
      notice = on as typeof notice
      return db as unknown as LockClient
    },
    log: (message, fields) => void logs.push([message, fields]),
  }
  return { io, said, values, logs, ended: () => ended, connects: () => connects, notice: (code: string) => notice({ code }) }
}
const pgError = (code: string) => Object.assign(new Error(code), { code })
const LOCK = "select pg_advisory_xact_lock(hashtextextended('site:' || coalesce((select url from public.sites where id = $1), $2::text), 0))"
const SETTINGS = "select set_config('lock_timeout', $1, true), set_config('statement_timeout', $2, true), set_config('idle_in_transaction_session_timeout', $3, true)"

test('withSiteLock: begin, the three local settings, the lock keyed on the site\'s ADDRESS (the id when the record is gone), the work, commit — the client ended once', async () => {
  const f = fake()
  const answer = await withSiteLock(S, async () => {
    f.said.push('run')
    return 'shipped'
  }, f.io)
  assert.deepEqual(answer, { held: true, value: 'shipped' })
  assert.deepEqual(f.said, ['begin', SETTINGS, LOCK, 'run', 'commit'])
  assert.deepEqual(f.values[1], [`${LOCK_WAIT_MS}ms`, `${LOCK_WAIT_MS + 5000}ms`, `${STALLED_MS}ms`], 'the wait, its belt 5 s past it, and the stalled-job rule\'s own idle ceiling')
  assert.deepEqual(f.values[2], [S, S], 'the address by the site\'s id, else the id itself')
  assert.equal(LOCK_WAIT_MS, 30_000)
  assert.equal(f.ended(), 1)
  assert.deepEqual(f.logs, [])
})

test('withSiteLock: the wait run out — 55P03 (lock_timeout) or 57014 (statement_timeout) on the lock — is NOT HELD, never retried: the work never runs, the transaction rolled back, the client ended; any other failure is tried once more on a fresh connection, then thrown (the control)', async () => {
  for (const code of ['55P03', '57014']) {
    const f = fake((text) => (text === LOCK ? pgError(code) : []))
    let ran = false
    const answer = await withSiteLock(S, async () => {
      ran = true
    }, f.io)
    assert.deepEqual(answer, { held: false }, code)
    assert.equal(ran, false, `${code}: the work never ran`)
    assert.deepEqual(f.said, ['begin', SETTINGS, LOCK, 'rollback'], code)
    assert.equal(f.ended(), 1, code)
    assert.equal(f.connects(), 1, `${code}: a wait that ran out is never retried`)
  }
  const other = fake((text) => (text === LOCK ? pgError('08006') : []))
  let ran = false
  await assert.rejects(withSiteLock(S, async () => {
    ran = true
  }, other.io), { code: '08006' })
  assert.equal(ran, false)
  assert.deepEqual(other.said, ['begin', SETTINGS, LOCK, 'rollback', 'begin', SETTINGS, LOCK, 'rollback'], 'tried twice, on two connections')
  assert.equal(other.connects(), 2)
  assert.equal(other.ended(), 2, 'both connections ended')
  const unconnected = fake((text) => (text === 'begin' ? pgError('ECONNREFUSED') : []))
  await assert.rejects(withSiteLock(S, async () => 1, unconnected.io), { code: 'ECONNREFUSED' })
  assert.equal(unconnected.connects(), 2)
  assert.equal(unconnected.ended(), 2)
})

test('withSiteLock (the Review, AD-20): a lock that could not be TAKEN the first time — the connection, not the wait — is taken on a fresh connection, and the work runs once', async () => {
  let first = true
  const f = fake((text) => {
    if (text === 'begin' && first) {
      first = false
      return pgError('ECONNRESET')
    }
    return []
  })
  let runs = 0
  const answer = await withSiteLock(S, async () => {
    runs += 1
    return 'shipped'
  }, f.io)
  assert.deepEqual(answer, { held: true, value: 'shipped' })
  assert.equal(runs, 1)
  assert.deepEqual(f.said, ['begin', 'rollback', 'begin', SETTINGS, LOCK, 'commit'])
  assert.equal(f.connects(), 2)
  assert.equal(f.ended(), 2, 'the failed connection ended, then the held one')
  assert.deepEqual(f.logs, [])
})

test('withSiteLock: a throw from the work is rolled back and rethrown UNCHANGED — no commit, the client ended', async () => {
  const f = fake()
  const thrown = new Error('the work')
  await assert.rejects(withSiteLock(S, async () => {
    throw thrown
  }, f.io), (e) => e === thrown)
  assert.deepEqual(f.said, ['begin', SETTINGS, LOCK, 'rollback'])
  assert.equal(f.ended(), 1)
  // …and a rollback that itself fails still rethrows the work's own error
  const dead = fake((text) => (text === 'rollback' ? pgError('08006') : []))
  await assert.rejects(withSiteLock(S, async () => {
    throw thrown
  }, dead.io), (e) => e === thrown)
  assert.equal(dead.ended(), 1)
})

test('withSiteLock: finished work never becomes a failure — a commit that fails (the connection lost), or lands on a session with no transaction (25P01), keeps the work\'s value and logs "site-lock: the lock was lost"; the control: a clean commit logs nothing', async () => {
  const failed = fake((text) => (text === 'commit' ? pgError('08006') : []))
  assert.deepEqual(await withSiteLock(S, async () => 'done', failed.io), { held: true, value: 'done' })
  assert.deepEqual(failed.logs, [['site-lock: the lock was lost', { site: S }]])
  assert.equal(failed.ended(), 1)
  const reconnected = fake()
  const answer = await withSiteLock(S, async () => {
    reconnected.notice('25P01')
    return 'done'
  }, reconnected.io)
  assert.deepEqual(answer, { held: true, value: 'done' })
  assert.deepEqual(reconnected.logs, [['site-lock: the lock was lost', { site: S }]])
  const clean = fake()
  await withSiteLock(S, async () => {
    clean.notice('01000') // any other notice is not a lost lock
    return 'done'
  }, clean.io)
  assert.deepEqual(clean.logs, [])
})

test('withSiteLock holds ONE connection of its own per hold — `db.ts`\' `lockSql()` — never `sql()`\'s pooled one, and never a session-level lock', async () => {
  const { readFileSync } = await import('node:fs')
  // the code alone: the header names `sql()` to say why not
  const source = readFileSync('server/site-lock.ts', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
  assert.match(source, /connect: lockSql/)
  assert.doesNotMatch(source, /\bsql\(\)|pg_advisory_lock\(|pg_try_advisory/)
  const db = readFileSync('server/ghost-admin/db.ts', 'utf8')
  const lockSql = db.slice(db.indexOf('export function lockSql('), db.indexOf('export function sql('))
  assert.match(lockSql, /max: 1,/)
  assert.match(lockSql, /prepare: false,/)
  assert.match(lockSql, /ssl: \{ ca: SUPABASE_ROOT_CA, rejectUnauthorized: true \}/)
  assert.doesNotMatch(lockSql, /idle_timeout/, 'postgres.js ends an idle connection inside an open transaction')
  assert.doesNotMatch(lockSql, /client = /, 'a fresh client per hold, never the cached one')
})

test('withSiteLock (the Review, H3): the hold SPEAKS while the work runs — `select 1` every KEEP_ALIVE_MS, since a transaction left silent 280 s has lost its lock through the pooler (once in two runs, MEASUREMENTS §92) — and stops once the work ends, thrown or returned; the control: work shorter than a beat sends none', async () => {
  assert.equal(KEEP_ALIVE_MS, 20_000)
  mock.timers.enable({ apis: ['setInterval'] })
  try {
    const f = fake()
    let finish = (_: string) => {}
    const held = withSiteLock(S, () => new Promise<string>((r) => (finish = r)), f.io)
    await new Promise((r) => setImmediate(r))
    assert.deepEqual(f.said, ['begin', SETTINGS, LOCK])
    mock.timers.tick(KEEP_ALIVE_MS)
    mock.timers.tick(KEEP_ALIVE_MS)
    assert.deepEqual(f.said.slice(3), ['select 1', 'select 1'], 'one beat each 20 s')
    finish('shipped')
    assert.deepEqual(await held, { held: true, value: 'shipped' })
    mock.timers.tick(KEEP_ALIVE_MS * 3)
    assert.deepEqual(f.said.slice(3), ['select 1', 'select 1', 'commit'], 'no beat after the work')
    // a throw stops it too
    const t = fake()
    let fail = (_: Error) => {}
    const thrown = withSiteLock(S, () => new Promise<string>((_, j) => (fail = j)), t.io)
    await new Promise((r) => setImmediate(r))
    mock.timers.tick(KEEP_ALIVE_MS)
    fail(new Error('the work'))
    await assert.rejects(thrown)
    mock.timers.tick(KEEP_ALIVE_MS * 3)
    assert.deepEqual(t.said.slice(3), ['select 1', 'rollback'])
    // the control: a span shorter than a beat
    const quick = fake()
    await withSiteLock(S, async () => 'done', quick.io)
    mock.timers.tick(KEEP_ALIVE_MS * 3)
    assert.deepEqual(quick.said, ['begin', SETTINGS, LOCK, 'commit'])
  } finally {
    mock.timers.reset()
  }
})
