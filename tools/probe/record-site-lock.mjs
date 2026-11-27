#!/usr/bin/env node
/**
 * STORY 7.25 — THE SITE LOCK'S RECORDER (MEASUREMENTS §92, standing rule 1): the four hypotheses `apps/web/server/site-lock.ts`'
 * `withSiteLock` rests on, executed with the app's own driver (`postgres`, through `apps/web`'s install), the product's own
 * numbers (`LOCK_WAIT_MS` and `STALLED_MS`, imported) and the product's own statements — the three local settings and
 * `pg_advisory_xact_lock(hashtextextended(…, 0))` inside one transaction on one `max: 1` connection with `prepare: false` — on a
 * PROBE KEY that names no site (`site:probe-record-site-lock-<random>`). It READS AND WRITES NO TABLE: every statement is
 * `begin`, `set_config`, the lock, `show`, `select 1`, `commit` or `rollback`.
 *   - H1: a second holder of one key gives up with `55P03` after its `lock_timeout` (the product's 30 s), while a holder of
 *     ANOTHER key takes its lock at once (the control) — and once the first commits, the key is taken at once (the control).
 *   - H2: a holder KILLED mid-hold (a child process holding the key, SIGKILLed — no goodbye on the wire, as a Vercel function
 *     killed past its budget) frees the key: a waiter takes it, and how long that took is recorded. The control: before the kill,
 *     a 2 s waiter gives up with `55P03` (the child really held it).
 *   - H3 / H3k (the Review, 2026-11-27): two holders idle `H3_IDLE_S` seconds (290: the AC's 150 left a hold's real worst case
 *     unproven — a waiter that waited `LOCK_WAIT_MS` still has 270 s of AD-11's 300, idle on this connection), one SILENT, one
 *     beating `select 1` every `KEEP_ALIVE_MS` as `withSiteLock` does. The first 290 s run found the silent one's lock LOST on the
 *     pooler (its key taken at 280 s, its COMMIT on a new session with `25P01`) and the second found it KEPT — an intermittent loss,
 *     so the product beats. H3k: the beating holder still holds near the end (a 2 s waiter gives up with `55P03`, the row's own
 *     control) and COMMITS with no `25P01`. The silent holder is asserted on the container (Postgres alone keeps it) and only
 *     OBSERVED on the pooler, where it can go either way. The role's own
 *     `statement_timeout` and `idle_in_transaction_session_timeout` are recorded, read before anything is set.
 *   - H4: `set_config('idle_in_transaction_session_timeout', …, true)` sets the idle ceiling: a holder with a 3 s ceiling left
 *     idle 8 s is ended — its key taken at once by another, and its transaction gone: its COMMIT refused, or landing on the
 *     fresh session postgres.js reconnects with Postgres' `25P01` warning (what `withSiteLock` reads as a lost lock). The control:
 *     the same holder with NO ceiling set, idle as long, still holds (a 2 s waiter gives up with `55P03`) and commits.
 * H3 failed (the Review), so `withSiteLock` runs `select 1` every 20 s while held (H3k); if H2 fails, H4 still bounds it; if both fail, STOP
 * AND SAY SO (the spec's Design Notes).
 *
 *   node tools/probe/record-site-lock.mjs --local    # a throwaway postgres:17 container: no network beyond it, writes nothing
 *   node tools/probe/record-site-lock.mjs --pooler   # the local half, then THE PRODUCTION POOLER — the owner's in-session go,
 *                                                    # in the MAIN session only; with every row held writes MEASUREMENTS §92
 *
 * THIS HEADER IS ITS HELP: any other argument (`--help` included) prints it and exits 2 before anything runs. Node 24 (it
 * imports the app's TypeScript for the two numbers through type stripping).
 *
 * THE POOLER URL IS NEVER PRINTED AND NEVER ON ARGV: `SUPABASE_DB_POOLER_URL` is read from tools/probe/.env in-process, by
 * name (never the environment), handed to the H2 child over its STDIN, and scrubbed (the URL, its password, its user) from
 * every line and cell. The connection pins the Supabase root `db.ts` pins (its PEM read out of that file, as
 * `run-verify-ghost-admin.py` reads it) with `rejectUnauthorized`. WHAT IT WRITES: with --pooler and every row held,
 * MEASUREMENTS.md §92 alone, replacing an earlier §92 of its own. The container is removed in a `finally`.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync, spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SELF = fileURLToPath(import.meta.url)
const ARGS = process.argv.slice(2)
if (!(ARGS.length === 1 && (ARGS[0] === '--local' || ARGS[0] === '--pooler'))) {
  console.error(fs.readFileSync(SELF, 'utf8').split('*/')[0])
  process.exit(2)
}
const POOLER = ARGS[0] === '--pooler'
const REPO = path.join(path.dirname(SELF), '..', '..')
const WEB = path.join(REPO, 'apps', 'web')
const MEASUREMENTS = path.join(REPO, '_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md')
const SECTION = 92
const COMMAND = `node tools/probe/record-site-lock.mjs ${ARGS[0]}`
const POSTGRES = createRequire(path.join(WEB, 'package.json')).resolve('postgres')
const postgres = createRequire(path.join(WEB, 'package.json'))('postgres')
const { KEEP_ALIVE_MS, LOCK_WAIT_MS } = await import(pathToFileURL(path.join(WEB, 'server', 'site-lock.ts')).href)
const { STALLED_MS } = await import(pathToFileURL(path.join(WEB, 'server', 'deploy', 'run.ts')).href)
const H3_IDLE_S = 290
const SHORT_MS = 2000

class Void extends Error {}
const SECRETS = []
const clean = (s) => SECRETS.reduce((t, k) => t.split(k).join('<pooler>'), String(s))
const rows = []
const row = (where, what, expect, ok, got) => {
  rows.push({ where, what, expect, ok, got: clean(got) })
  console.log(`    ${ok ? 'PASS' : 'FAIL'}  [${where}] ${what} — ${clean(got)}`)
  return ok
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const codeOf = (e) => (e && typeof e === 'object' && 'code' in e ? String(e.code) : String(e?.message ?? e))

/** one connection as `lockSql()` opens it: `max: 1`, `prepare: false`, no `idle_timeout`, its notices kept */
function connect(target, notices = []) {
  return postgres(target.url, { max: 1, prepare: false, ssl: target.ssl, connect_timeout: 10, onnotice: (n) => notices.push(n.code) })
}
const settings = (db, idle) => db`select set_config('lock_timeout', ${`${LOCK_WAIT_MS}ms`}, true), set_config('statement_timeout', ${`${LOCK_WAIT_MS + 5000}ms`}, true), set_config('idle_in_transaction_session_timeout', ${`${idle}ms`}, true)`
const lock = (db, key) => db`select pg_advisory_xact_lock(hashtextextended(${key}, 0))`
/** a waiter: its own connection, the given `lock_timeout`, the key — `held` and how long THE LOCK STATEMENT took, or the code it
 *  gave up with. The clock starts once the connection is up: a fresh TLS connection to the pooler alone takes about 2 s, and the
 *  first --pooler run (2026-11-27) voided H4 on exactly that — the key taken, its holder's transaction gone, at 2103 ms connect included */
async function wait(target, key, timeoutMs) {
  const db = connect(target)
  let t0 = Date.now()
  try {
    await db`begin`
    await db`select set_config('lock_timeout', ${`${timeoutMs}ms`}, true)`
    t0 = Date.now()
    await lock(db, key)
    const ms = Date.now() - t0
    await db`commit`
    return { held: true, ms }
  } catch (e) {
    await db`rollback`.catch(() => {})
    return { held: false, ms: Date.now() - t0, code: codeOf(e) }
  } finally {
    await db.end({ timeout: 5 }).catch(() => {})
  }
}
const probeKey = () => `site:probe-record-site-lock-${crypto.randomBytes(6).toString('hex')}`

/** H2's holder: a child process given the target over STDIN (never argv), holding the key until it is killed */
function child(target, key) {
  const script = `
    const postgres = require(process.argv[1])
    let input = ''
    process.stdin.on('data', (d) => (input += d))
    process.stdin.on('end', async () => {
      const { url, ssl, key } = JSON.parse(input)
      const db = postgres(url, { max: 1, prepare: false, ssl, connect_timeout: 10, onnotice: () => {} })
      try {
        await db\`begin\`
        await db\`select pg_advisory_xact_lock(hashtextextended(\${key}, 0))\`
        process.stdout.write('held\\n')
        setInterval(() => {}, 60000)
      } catch (e) {
        process.stdout.write('failed ' + (e && e.code) + '\\n')
        process.exit(1)
      }
    })`
  const p = spawn(process.execPath, ['-e', script, POSTGRES], { stdio: ['pipe', 'pipe', 'ignore'] })
  p.stdin.end(JSON.stringify({ url: target.url, ssl: target.ssl, key }))
  const held = new Promise((resolve) => {
    let out = ''
    p.stdout.on('data', (d) => {
      out += d
      if (out.includes('\n')) resolve(out.trim())
    })
    p.on('exit', () => resolve(out.trim() || 'exited'))
  })
  return { p, held }
}

async function half(where, target) {
  // the role's own two timeouts, before anything is set (H3's record)
  const probe = connect(target)
  let role
  try {
    const [st] = await probe`show statement_timeout`
    const [it] = await probe`show idle_in_transaction_session_timeout`
    const [v] = await probe`show server_version`
    role = { statement: st.statement_timeout, idle: it.idle_in_transaction_session_timeout, version: v.server_version }
  } finally {
    await probe.end({ timeout: 5 }).catch(() => {})
  }
  console.log(`\n  ${where.toUpperCase()} — Postgres ${role.version}; the role's statement_timeout ${role.statement}, idle_in_transaction_session_timeout ${role.idle}`)

  // ── H1 ──
  {
    const key = probeKey()
    const holder = connect(target)
    try {
      await holder`begin`
      await settings(holder, STALLED_MS)
      await lock(holder, key)
      const [waited, other] = await Promise.all([wait(target, key, LOCK_WAIT_MS), (async () => {
        await sleep(1000)
        return wait(target, probeKey(), LOCK_WAIT_MS)
      })()])
      row(where, `H1 control — another key taken while ${key.slice(0, 22)}… is held`, 'held at once (< 2 s)', other.held && other.ms < 2000, `held ${other.held}, ${other.ms} ms`)
      row(where, `H1 — a second holder of the same key, lock_timeout ${LOCK_WAIT_MS} ms (LOCK_WAIT_MS)`, `55P03 after ~${LOCK_WAIT_MS / 1000} s`,
        !waited.held && waited.code === '55P03' && waited.ms >= LOCK_WAIT_MS - 500 && waited.ms < LOCK_WAIT_MS + 5000, `held ${waited.held}, code ${waited.code ?? '—'}, ${waited.ms} ms`)
      await holder`commit`
    } finally {
      await holder.end({ timeout: 5 }).catch(() => {})
    }
    const after = await wait(target, key, SHORT_MS)
    row(where, 'H1 control — the key once its holder committed', 'held at once', after.held && after.ms < 2000, `held ${after.held}, ${after.ms} ms`)
  }

  // ── H2 ──
  {
    const key = probeKey()
    const { p, held } = child(target, key)
    try {
      const said = await Promise.race([held, sleep(20_000).then(() => 'timed out')])
      if (said !== 'held') throw new Void(`H2's holder did not take its lock (${said})`)
      const before = await wait(target, key, SHORT_MS)
      row(where, 'H2 control — the child really holds the key (a 2 s waiter)', '55P03', !before.held && before.code === '55P03', `held ${before.held}, code ${before.code ?? '—'}`)
      p.kill('SIGKILL')
      const freed = await wait(target, key, LOCK_WAIT_MS)
      row(where, 'H2 — the holder SIGKILLed mid-hold (its connection dropped with no goodbye); a waiter with LOCK_WAIT_MS', 'the key freed, taken within the wait',
        freed.held, `held ${freed.held}${freed.held ? ` after ${freed.ms} ms` : `, code ${freed.code}`}`)
    } finally {
      p.kill('SIGKILL')
    }
  }

  // ── H3 and H3k ── (the Review, 2026-11-27: H3 alone FAILED on the pooler at 280 s, so `withSiteLock` beats; both holders run at
  // once on two keys — one silent, one speaking `select 1` every KEEP_ALIVE_MS as the product does — and are read at the same times)
  {
    const holders = [{ name: 'H3', beat: false }, { name: 'H3k', beat: true }].map((h) => ({ ...h, key: probeKey(), notices: [] }))
    for (const h of holders) h.db = connect(target, h.notices)
    try {
      for (const h of holders) {
        await h.db`begin`
        await settings(h.db, STALLED_MS)
        await lock(h.db, h.key)
        if (h.beat) h.timer = setInterval(() => void h.db`select 1`.catch(() => {}), KEEP_ALIVE_MS)
      }
      console.log(`    …  [${where}] H3/H3k — two holders idle ${H3_IDLE_S} s in their transactions, the second beating every ${KEEP_ALIVE_MS} ms`)
      await sleep((H3_IDLE_S - 10) * 1000)
      for (const h of holders) h.still = await wait(target, h.key, SHORT_MS)
      await sleep(10_000 - SHORT_MS)
      for (const h of holders) {
        clearInterval(h.timer)
        h.committed = 'yes'
        try {
          await h.db`commit`
        } catch (e) {
          h.committed = `no (${codeOf(e)})`
        }
      }
      const [plain, beating] = holders
      const got = (h) => `${h.still.held ? 'the key TAKEN by a 2 s waiter' : `held (waiter ${h.still.code ?? '—'})`} after ${H3_IDLE_S - 10} s; committed ${h.committed}; notices [${h.notices.join(', ') || 'none'}]`
      const kept = (h) => !h.still.held && h.still.code === '55P03' && h.committed === 'yes' && !h.notices.includes('25P01')
      // the silent holder: Postgres alone keeps it (the container, asserted). On the pooler it is OBSERVED, never asserted: of the
      // Review's two 290 s runs (2026-11-27) it lost its lock in the first (the key taken at 280 s, its COMMIT on a new session with
      // 25P01) and kept it in the second — an intermittent loss, not a fixed timeout, so it can be no one's control
      if (where === 'local') row(where, `H3 — a SILENT transaction left idle ${H3_IDLE_S} s with the lock, then COMMIT`, 'held, commits, no 25P01', kept(plain), `${got(plain)}; role statement_timeout ${role.statement}, idle_in_transaction_session_timeout ${role.idle}`)
      else row(where, `H3 (observed, not asserted) — a SILENT transaction left idle ${H3_IDLE_S} s`, 'either: it has lost its lock here once in two runs', true, `${kept(plain) ? 'KEPT' : 'LOST'}: ${got(plain)}; role statement_timeout ${role.statement}, idle_in_transaction_session_timeout ${role.idle}`)
      row(where, `H3k — the same idle with \`select 1\` every ${KEEP_ALIVE_MS} ms (\`withSiteLock\`'s beat): still held (a 2 s waiter), then COMMIT`, '55P03, commits, no 25P01', kept(beating), got(beating))
    } finally {
      for (const h of holders) {
        clearInterval(h.timer)
        await h.db.end({ timeout: 5 }).catch(() => {})
      }
    }
  }

  // ── H4 ── (a backend ended under an idle client: postgres.js reconnects for the next statement, so the holder's own COMMIT
  // either fails or lands on a fresh session with Postgres' 25P01 warning — exactly what `withSiteLock` reads as a lost lock)
  for (const ceiling of [0, 3000]) {
    const key = probeKey()
    const notices = []
    const holder = connect(target, notices)
    try {
      await holder`begin`
      await settings(holder, ceiling)
      await lock(holder, key)
      await sleep(8000)
      const other = await wait(target, key, SHORT_MS)
      let ended = 'no'
      try {
        await holder`commit`
        if (notices.includes('25P01')) ended = 'its COMMIT on a new session (25P01)'
      } catch (e) {
        ended = `its COMMIT refused (${codeOf(e)})`
      }
      if (ceiling === 0) {
        row(where, 'H4 control — NO idle ceiling set, the holder idle 8 s (a 2 s waiter)', '55P03; the holder commits', !other.held && other.code === '55P03' && ended === 'no', `held ${other.held}, code ${other.code ?? '—'}; ended ${ended}`)
      } else {
        row(where, `H4 — set_config('idle_in_transaction_session_timeout', '${ceiling}ms', true), the holder idle 8 s`, 'the holder ended: its key taken at once, its transaction gone',
          other.held && other.ms < 2000 && ended !== 'no', `held ${other.held}, ${other.ms} ms; ended ${ended}`)
      }
    } finally {
      await holder.end({ timeout: 5 }).catch(() => {})
    }
  }
  return role
}

/* ───────────────────────────── the targets ───────────────────────────── */

async function container() {
  const name = `record-site-lock-${crypto.randomBytes(4).toString('hex')}`
  const password = crypto.randomBytes(12).toString('hex')
  execFileSync('docker', ['run', '--rm', '-d', '--name', name, '-e', `POSTGRES_PASSWORD=${password}`, '-p', '127.0.0.1::5432', 'postgres:17'], { stdio: ['ignore', 'pipe', 'pipe'] })
  const stop = () => {
    try {
      execFileSync('docker', ['rm', '-f', name], { stdio: 'ignore' })
    } catch {}
  }
  try {
    const port = execFileSync('docker', ['port', name, '5432/tcp']).toString().trim().split('\n')[0].split(':').pop()
    const url = `postgres://postgres:${password}@127.0.0.1:${port}/postgres`
    for (let i = 0; ; i++) {
      const db = postgres(url, { max: 1, connect_timeout: 2, onnotice: () => {} })
      try {
        await db`select 1`
        await db.end()
        break
      } catch (e) {
        await db.end({ timeout: 1 }).catch(() => {})
        if (i > 60) throw new Void(`the container never answered (${codeOf(e)})`)
        await sleep(500)
      }
    }
    return { target: { url, ssl: false }, stop }
  } catch (e) {
    stop()
    throw e
  }
}

function pooler() {
  const env = {}
  for (const line of fs.readFileSync(path.join(REPO, 'tools/probe/.env'), 'utf8').split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line)
    if (m && m[1] === 'SUPABASE_DB_POOLER_URL' && m[2].trim()) env.url = m[2].trim().replace(/^["']|["']$/g, '')
  }
  if (!env.url) throw new Void('SUPABASE_DB_POOLER_URL is not in tools/probe/.env')
  const u = new URL(env.url)
  // an empty part is never a secret: `clean()` would split every line on '' (the Review, 2026-11-27)
  SECRETS.push(...[env.url, decodeURIComponent(u.password), u.password, decodeURIComponent(u.username), u.username].filter((x) => x.length >= 4))
  SECRETS.sort((a, b) => b.length - a.length)
  const pem = /const SUPABASE_ROOT_CA = `([^`]+)`/.exec(fs.readFileSync(path.join(WEB, 'server', 'ghost-admin', 'db.ts'), 'utf8'))?.[1]
  if (!pem) throw new Void('no SUPABASE_ROOT_CA in apps/web/server/ghost-admin/db.ts')
  return { url: env.url, ssl: { ca: pem, rejectUnauthorized: true }, host: `${u.hostname}:${u.port}` }
}

/* ───────────────────────────── §92 ───────────────────────────── */

const cell = (s) => clean(String(s)).replace(/\|/g, '\\|').replace(/`/g, "'").replace(/\s+/g, ' ').slice(0, 240)
const tableOf = (list) => ['| Where | Row | Expected | Got | Held |', '|---|---|---|---|---|', ...list.map((r) => `| ${cell(r.where)} | ${cell(r.what)} | ${cell(r.expect)} | \`${cell(r.got)}\` | ${r.ok ? 'yes' : 'no'} |`)]
const find = (where, prefix) => rows.find((r) => r.where === where && r.what.startsWith(prefix))
function section(roles, host, today) {
  const h2 = find('pooler', 'H2 — ')
  return [
    `## ${SECTION}. The per-site advisory lock on Postgres 17 and on the production pooler — a transaction-scoped \`pg_advisory_xact_lock\` on its own \`max: 1\` connection: \`lock_timeout\` bounds the wait with \`55P03\`, a killed holder frees its key, a SILENT idle transaction can lose its lock on Supavisor while one beating \`select 1\` every 20 s holds and commits, and the local idle ceiling ends an abandoned holder · production pooler · ${today}`,
    '',
    `**Why.** Story 7.25's \`withSiteLock\` (\`apps/web/server/site-lock.ts\`) rests on four hypotheses (standing rule 1); the spec's Design Notes stop the story if H2 and H3 both fail, and owe a \`select 1\` keep-alive if H3 alone does — which it did, once in two runs. **Command.** \`${COMMAND}\` — the app's own driver (postgres.js through \`apps/web\`), the product's numbers (\`LOCK_WAIT_MS\` ${LOCK_WAIT_MS} ms, \`STALLED_MS\` ${STALLED_MS} ms) and statements, each connection as \`lockSql()\` opens it (\`max: 1\`, \`prepare: false\`, no \`idle_timeout\`; on the pooler the Supabase root \`db.ts\` pins). Every key a probe key naming no site; no table read or written. The pooler URL read in-process from tools/probe/.env and never printed.`,
    '',
    `**Where.** A throwaway \`postgres:17\` container (Postgres ${roles.local?.version}; the role's \`statement_timeout\` ${roles.local?.statement}, \`idle_in_transaction_session_timeout\` ${roles.local?.idle}), then the production transaction pooler \`${cell(host)}\` (Postgres ${roles.pooler?.version}; the \`postgres\` role's \`statement_timeout\` **${roles.pooler?.statement}**, \`idle_in_transaction_session_timeout\` **${roles.pooler?.idle}**).`,
    '',
    '**The controls, each of which voids the run:** another key taken at once while one is held (H1 is the key, not the database); the key taken at once once its holder commits; the child holding its key before it is killed (a 2 s waiter gives up); the beating holder still holding near the end of its idle (H3k, a 2 s waiter gives up); a holder with NO idle ceiling still holding after the same idle (H4). The SILENT holder on the pooler is observed, not asserted (H3).',
    '',
    ...tableOf(rows),
    '',
    `- **H1 holds**: a waiter on a held key gives up with \`55P03\` after \`lock_timeout\` — the product's 30 s — and is NOT HELD in \`withSiteLock\`'s reading; the work never runs.`,
    `- **H2 holds**: a holder killed with no goodbye on the wire frees its key${h2?.got ? ` (${cell(h2.got)})` : ''} — so a Ship it killed past AD-11's budget does not hold its site past it.`,
    `- **H3 is not to be relied on through the pooler**: a SILENT transaction idle ${H3_IDLE_S} s has lost its lock there (the Review's first 290 s run, 2026-11-27: the key taken by another at 280 s, its COMMIT on a new session with \`25P01\`) and kept it (its second run), while Postgres alone keeps it (the container). An intermittent loss — the pooler, or the network between the recorder and it — so the Design Notes' remedy is built: **H3k holds** — the same idle with \`select 1\` every \`KEEP_ALIVE_MS\` (${KEEP_ALIVE_MS} ms), \`withSiteLock\`'s beat while the work runs, keeps the lock and commits with no \`25P01\`.`,
    `- **H4 holds**: \`set_config('idle_in_transaction_session_timeout', …, true)\` ends a holder idle past it, freeing its key — the belt under H2, set by \`withSiteLock\` to \`STALLED_MS\`.`,
    '- **What this does NOT say.** No product route ran and no `sites` row keyed a lock here: Ship it, the put-back and the switch under one lock on production and T1 are walk step 125\'s.',
  ].join('\n')
}
function writeSection(n, text) {
  const body = fs.readFileSync(MEASUREMENTS, 'utf8').replace(/\n+$/, '')
  const at = body.indexOf(`\n## ${n}. `)
  const head = at === -1 ? body : body.slice(0, at)
  const rest = at === -1 ? '' : body.slice(at + 1)
  const next = rest.indexOf('\n## ')
  const tail = next === -1 ? '' : rest.slice(next + 1)
  fs.writeFileSync(MEASUREMENTS, `${head.replace(/\n+$/, '')}\n\n${text.replace(/\n+$/, '')}\n${tail ? `\n${tail}\n` : ''}`)
}

/* ───────────────────────────── main ───────────────────────────── */

let code = 0
const roles = {}
let local = null
try {
  local = await container()
  roles.local = await half('local', local.target)
  local.stop()
  local = null
  if (rows.some((r) => !r.ok)) throw new Void('the local half did not hold')
  if (POOLER) {
    const target = pooler()
    roles.pooler = await half('pooler', target)
    if (rows.some((r) => !r.ok)) throw new Void('a pooler row did not hold — STOP AND REPORT (the spec\'s Design Notes: H2 failing too stops the story; H3k failing means the beat does not keep the lock)')
    writeSection(SECTION, section(roles, target.host, new Date().toISOString().slice(0, 10)))
    console.log(`\n    MEASUREMENTS.md §${SECTION} written — every row held, behind its controls.`)
  } else {
    console.log(`\n    PASS — every row held on the container. It wrote nothing; §${SECTION} is the --pooler run's.`)
  }
} catch (err) {
  console.log(`\n  ** RUN VOID — nothing written to MEASUREMENTS.md. ${clean(err instanceof Void ? err.message : err.stack ?? err)}`)
  code = 1
} finally {
  local?.stop()
}
process.exit(code)
