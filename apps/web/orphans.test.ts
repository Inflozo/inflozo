import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { deadlineLabel } from './app/(app)/app/(authed)/account/deletion-rule.ts'
import { ORPHAN_SNAPSHOT_DAYS } from './lib/connect-rule.ts'
import { orphanEmail } from './lib/orphan-email.ts'
import {
  BATCH,
  BUDGET_MS,
  decide,
  dueSince,
  ORPHAN_NOTICE_DAYS,
  orphanDeadline,
  originalRows,
  ORPHANS,
  purgeDateOf,
  runOrphans,
  SECTION_ID,
  siteLabel,
  themeLabel,
  type Orphan,
  type OrphanDeps,
} from './lib/orphan-rule.ts'

/* Story 7.20b — FR-C6's orphan purge, every part a test can reach (R-285: one email `ORPHAN_NOTICE_DAYS`
   before the deadline; deleted only once it has gone out, never sooner than its full window). The ROUTE
   needs a deployment, Vercel's bearer and a disconnected site; `tools/probe/run-verify-snapshot-orphans.py`
   is where that runs against the real project (R-82). What is here is the decision for every row of the
   spec's I/O matrix, the loop over stubs with its call order logged, the words, the email, and the
   promises only the route's source makes. */

const DAY = 86_400_000
const N = ORPHAN_SNAPSHOT_DAYS
const n = ORPHAN_NOTICE_DAYS
const NOW = new Date('2027-03-01T04:30:00Z')
const ago = (days: number) => new Date(NOW.getTime() - days * DAY).toISOString()
const iso = (d: Date) => d.toISOString()

const row = (over: Partial<Orphan> = {}): Orphan => ({
  id: 's1',
  userId: 'u1',
  siteId: 'site1',
  theme: 'casper',
  site: 'blog.example',
  disconnectedAt: ago(N - n),
  noticeAt: null,
  deleting: false,
  ...over,
})

/** A stub world over `rows`: every call recorded in order, each answer overridable per test. */
function world(
  rows: Orphan[],
  o: {
    address?: string | null
    sent?: (orphan: Orphan) => { ok: boolean; status?: number; id?: string | null }
    reread?: Record<string, string | null>
    drainFails?: string[]
    /** what the drain removed — 0 when the object is already gone */
    drained?: number
    taken?: string[]
    dueFails?: boolean
    claimThrows?: boolean
    unclaimFails?: boolean
  } = {},
) {
  const calls: string[] = []
  const deps: OrphanDeps = {
    async due(excluding, limit) {
      calls.push('due')
      if (o.dueFails) throw Object.assign(new Error('due'), { step: 'due', code: 'PGRST' })
      return rows.filter((r) => !excluding.includes(r.id)).slice(0, limit)
    },
    async claim(id, from) {
      calls.push(`claim:${id}:${from}`)
      if (o.claimThrows) throw Object.assign(new Error('claim'), { step: 'claim', code: '57014' })
      return !o.taken?.includes(id)
    },
    async unclaim(id, back) {
      calls.push(`unclaim:${id}:${back}`)
      if (o.unclaimFails) throw Object.assign(new Error('unclaim'), { step: 'unclaim', code: '57014' })
    },
    async address(userId) {
      calls.push(`address:${userId}`)
      return o.address === undefined ? 'owner@example.com' : o.address
    },
    async send({ orphan, date }) {
      calls.push(`send:${orphan.id}:${iso(date)}`)
      return o.sent?.(orphan) ?? { ok: true, id: 'resend-id' }
    },
    async disconnectedAt(siteId) {
      calls.push(`reread:${siteId}`)
      if (o.reread && siteId in o.reread) return o.reread[siteId]
      return rows.find((r) => r.siteId === siteId)?.disconnectedAt ?? null
    },
    async drain(prefix) {
      calls.push(`drain:${prefix}`)
      if (o.drainFails?.some((site) => prefix.endsWith(`/${site}/`))) {
        throw Object.assign(new Error(`remove ${prefix}: refused`), { step: 'objects', code: '403' })
      }
      return o.drained ?? 1
    },
    async remove(id) {
      calls.push(`remove:${id}`)
    },
  }
  return { deps, calls }
}

/** A log that remembers every line, so no title, theme or address can reach one unseen. */
function recorder() {
  const lines: unknown[][] = []
  return { lines, log: { log: (...a: unknown[]) => lines.push(a), error: (...a: unknown[]) => lines.push(a) } }
}
const clock = () => NOW.getTime()

/* ── the dates: one clock, one home (DW-79) ── */

test('the deadline is ORPHAN_SNAPSHOT_DAYS after the disconnect; on time, the purge date IS the deadline', () => {
  const t = ago(N - n)
  assert.equal(orphanDeadline(t).getTime() - new Date(t).getTime(), N * DAY)
  // a notice sent on time — exactly deadline − n — gives a purge date of exactly the deadline
  assert.equal(iso(purgeDateOf({ disconnectedAt: t, noticeAt: iso(NOW) })), iso(orphanDeadline(t)))
  // …and with no notice yet, before the notice is due, the Sites row says the same day
  assert.equal(iso(purgeDateOf({ disconnectedAt: ago(10), noticeAt: null }, NOW)), iso(orphanDeadline(ago(10))))
  // the due query's bound holds every disconnect a notice is owed for, from the start of its day; just after it, none
  const bound = dueSince(NOW).getTime()
  assert.equal(decide({ disconnectedAt: iso(new Date(bound - 1)), noticeAt: null }, NOW), 'notice')
  assert.equal(decide({ disconnectedAt: iso(new Date(bound + 1)), noticeAt: null }, NOW), 'wait')
})

/* Review, 2026-11-24: NOW is 04:30 UTC like the job, and every `ago()` a whole number of days, so the tests above could
   never see a disconnect made at another time of day — which, under a threshold at the deadline's exact instant, got its
   email the NEXT morning, naming a date a day past the one the Sites row had shown (R-285's own example, 16 Jan → Jan 30,
   came out 17 Jan → Jan 31). */
test('the daily 04:30 UTC run: a disconnect at any time of day is emailed on the deadline\'s day − n, naming the deadline\'s own day, and the Sites row never changes its date', () => {
  for (const time of ['00:00:01', '04:29:59', '04:30:00', '10:00:00', '23:59:59']) {
    const disconnectedAt = `2026-11-01T${time}Z`
    const shown = deadlineLabel(purgeDateOf({ disconnectedAt, noticeAt: null }, new Date('2026-12-01T12:00:00Z')))
    assert.equal(shown, 'Jan 30, 2027', `${time}: the Sites row, from the disconnect`)
    let run = Date.parse('2027-01-10T04:30:00Z')
    while (decide({ disconnectedAt, noticeAt: null }, new Date(run)) !== 'notice') run += DAY
    const noticeAt = new Date(run).toISOString()
    assert.equal(noticeAt, '2027-01-16T04:30:00.000Z', `${time}: the email goes on R-285's day`)
    const named = deadlineLabel(purgeDateOf({ disconnectedAt, noticeAt }, new Date(run)))
    assert.equal(named, shown, `${time}: the email names the day the Sites row showed`)
    assert.equal(deadlineLabel(purgeDateOf({ disconnectedAt, noticeAt }, new Date(run + DAY))), shown, `${time}: …and the row still does`)
    // the purge: never before the exact deadline nor the notice's full window, and on the named day's run or the next
    let purge = run
    while (decide({ disconnectedAt, noticeAt }, new Date(purge)) !== 'purge') purge += DAY
    assert.ok(purge >= orphanDeadline(disconnectedAt).getTime() && purge >= run + n * DAY, time)
    assert.ok(['2027-01-30', '2027-01-31'].includes(new Date(purge).toISOString().slice(0, 10)), `${time}: purged ${new Date(purge).toISOString()}`)
  }
})

test('a late notice names the real date: today + ORPHAN_NOTICE_DAYS, never a day already past', () => {
  const late = ago(N + 5) // the deadline went five days ago, no notice for this disconnect
  assert.equal(iso(purgeDateOf({ disconnectedAt: late, noticeAt: iso(NOW) })), iso(new Date(NOW.getTime() + n * DAY)))
  assert.equal(iso(purgeDateOf({ disconnectedAt: late, noticeAt: null }, NOW)), iso(new Date(NOW.getTime() + n * DAY)))
})

/* ── decide: the I/O matrix, row by row ── */

test('decide — not yet due, notice due, notice late, purge due, and the full window after a late notice', () => {
  assert.equal(decide({ disconnectedAt: ago(N - n - 1), noticeAt: null }, NOW), 'wait', 'not yet due')
  assert.equal(decide({ disconnectedAt: ago(N - n), noticeAt: null }, NOW), 'notice', 'notice due, at deadline − n exactly')
  assert.equal(decide({ disconnectedAt: ago(N + 5), noticeAt: null }, NOW), 'notice', 'notice late: the deadline passed, nothing deleted')
  assert.equal(decide({ disconnectedAt: ago(N + 1), noticeAt: ago(n + 1) }, NOW), 'purge', 'purge due: deadline passed, notice n+1 days old')
  assert.equal(decide({ disconnectedAt: ago(N), noticeAt: ago(n) }, NOW), 'purge', 'on time: the deadline itself')
  assert.equal(decide({ disconnectedAt: ago(N + 30), noticeAt: ago(n - 1) }, NOW), 'wait', 'a late notice still gives its full window')
  assert.equal(decide({ disconnectedAt: ago(N - n + 3), noticeAt: ago(1) }, NOW), 'wait', 'noticed, deadline not reached')
  assert.equal(decide({ disconnectedAt: null, noticeAt: null }, NOW), 'wait', 'reconnected: no clock at all')
})

test('decide — disconnected again: a notice older than the latest disconnect no longer counts, and the clock restarts', () => {
  // the old notice went before this disconnect; the new one is owed at the NEW date, not before it
  assert.equal(decide({ disconnectedAt: ago(10), noticeAt: ago(200) }, NOW), 'wait')
  assert.equal(decide({ disconnectedAt: ago(N - n), noticeAt: ago(200) }, NOW), 'notice')
  assert.equal(decide({ disconnectedAt: ago(N + 1), noticeAt: ago(N + 2) }, NOW), 'notice', 'never purge on an earlier disconnect\'s notice')
})

/* ── runOrphans: the loop over stubs, the call order logged ── */

test('notice due: claimed, then the address, then ONE email naming the deadline; noticed 1', async () => {
  const { deps, calls } = world([row()])
  const { lines, log } = recorder()
  assert.deepEqual(await runOrphans(deps, log, clock), { noticed: 1, purged: 0, failed: 0 })
  const deadline = iso(orphanDeadline(row().disconnectedAt))
  assert.deepEqual(calls, ['due', 'claim:s1:null', 'address:u1', `send:s1:${deadline}`, 'due'])
  assert.doesNotMatch(JSON.stringify(lines), /blog\.example|casper|owner@example\.com/, 'a log line carries ids and codes only')
})

test('notice: a refused send puts the claim back, counts failed and stays owed — the claim before the send, the unclaim after it', async () => {
  const { deps, calls } = world([row()], { sent: () => ({ ok: false, status: 422 }) })
  const { lines, log } = recorder()
  assert.deepEqual(await runOrphans(deps, log, clock), { noticed: 0, purged: 0, failed: 1 })
  assert.deepEqual(calls.slice(1, 5), ['claim:s1:null', 'address:u1', `send:s1:${iso(orphanDeadline(row().disconnectedAt))}`, 'unclaim:s1:null'])
  assert.match(JSON.stringify(lines), /"step":"send","code":422/)
})

test('notice: no address puts the claim back and sends nothing', async () => {
  const { deps, calls } = world([row()], { address: null })
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 0, purged: 0, failed: 1 })
  assert.deepEqual(calls.slice(1, 4), ['claim:s1:null', 'address:u1', 'unclaim:s1:null'])
  assert.ok(!calls.some((c) => c.startsWith('send:')))
})

test('notice: a claim another run took first is not sent twice, and is no failure', async () => {
  const { deps, calls } = world([row()], { taken: ['s1'] })
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 0, purged: 0, failed: 0 })
  assert.ok(!calls.some((c) => c.startsWith('send:') || c.startsWith('address:')))
})

test('notice late: the email goes now, dated today + n, and nothing is deleted', async () => {
  const { deps, calls } = world([row({ disconnectedAt: ago(N + 5) })])
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 1, purged: 0, failed: 0 })
  assert.ok(calls.includes(`send:s1:${iso(new Date(NOW.getTime() + n * DAY))}`), calls.join(' '))
  assert.ok(!calls.some((c) => c.startsWith('drain:') || c.startsWith('remove:')))
})

test('disconnected again: the stale notice is claimed FROM its own value and a new email goes', async () => {
  const stale = ago(N + 40)
  const { deps, calls } = world([row({ noticeAt: stale })])
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 1, purged: 0, failed: 0 })
  assert.equal(calls[1], `claim:s1:${stale}`)
})

test('purge due: re-read, then the prefix drained, then the row — objects before rows', async () => {
  const { deps, calls } = world([row({ disconnectedAt: ago(N + 1), noticeAt: ago(n + 1) })])
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 0, purged: 1, failed: 0 })
  assert.deepEqual(calls, ['due', 'reread:site1', 'drain:u1/site1/', 'remove:s1', 'due'])
})

test('purge: the object already gone — the drain removes 0, and the row is still deleted', async () => {
  const { deps, calls } = world([row({ disconnectedAt: ago(N + 1), noticeAt: ago(n + 1) })], { drained: 0 })
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 0, purged: 1, failed: 0 })
  assert.deepEqual(calls, ['due', 'reread:site1', 'drain:u1/site1/', 'remove:s1', 'due'])
})

test('purge: a refused drain leaves the row, counts failed and is due again tomorrow', async () => {
  const { deps, calls } = world([row({ disconnectedAt: ago(N + 1), noticeAt: ago(n + 1) })], { drainFails: ['site1'] })
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 0, purged: 0, failed: 1 })
  assert.ok(!calls.includes('remove:s1'))
})

test('purge: a reconnected site (null, or a different disconnect at the re-read) is skipped untouched', async () => {
  for (const reread of [null, ago(3)]) {
    const { deps, calls } = world([row({ disconnectedAt: ago(N + 1), noticeAt: ago(n + 1) })], { reread: { site1: reread } })
    assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 0, purged: 0, failed: 0 })
    assert.deepEqual(calls, ['due', 'reread:site1', 'due'], String(reread))
  }
})

test('an account waiting to be deleted is skipped: neither notice nor purge', async () => {
  const { deps, calls } = world([
    row({ id: 'a', deleting: true }),
    row({ id: 'b', siteId: 'site2', disconnectedAt: ago(N + 1), noticeAt: ago(n + 1), deleting: true }),
  ])
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 0, purged: 0, failed: 0 })
  assert.deepEqual(calls, ['due', 'due'])
})

test('a failure never stops the rest: a refused drain, then a notice and a purge behind it still happen', async () => {
  const { deps, calls } = world(
    [
      row({ id: 'bad', siteId: 'siteBad', disconnectedAt: ago(N + 2), noticeAt: ago(n + 2) }),
      row({ id: 'tell', siteId: 'siteTell' }),
      row({ id: 'gone', siteId: 'siteGone', disconnectedAt: ago(N + 1), noticeAt: ago(n + 1) }),
    ],
    { drainFails: ['siteBad'] },
  )
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 1, purged: 1, failed: 1 })
  assert.ok(calls.includes('remove:gone') && calls.some((c) => c.startsWith('send:tell:')), calls.join(' '))
})

test('notice: a claim that throws counts failed, sends nothing and puts nothing back', async () => {
  const { deps, calls } = world([row()], { claimThrows: true })
  const { lines, log } = recorder()
  assert.deepEqual(await runOrphans(deps, log, clock), { noticed: 0, purged: 0, failed: 1 })
  assert.deepEqual(calls, ['due', 'claim:s1:null', 'due'])
  assert.match(JSON.stringify(lines), /"step":"claim","code":"57014"/)
})

test('notice: a put-back that itself fails is logged loudly as a notice recorded that never went out, and counts failed', async () => {
  const { deps, calls } = world([row()], { sent: () => ({ ok: false, status: 0 }), unclaimFails: true })
  const { lines, log } = recorder()
  assert.deepEqual(await runOrphans(deps, log, clock), { noticed: 0, purged: 0, failed: 1 })
  assert.ok(calls.includes('unclaim:s1:null'), calls.join(' '))
  assert.match(JSON.stringify(lines), /unclaim failed — a notice is recorded that never went out/)
  assert.match(JSON.stringify(lines), /"step":"send","code":0/, 'the send\'s own failure is what the run counts')
})

test('more than one batch: every theme past BATCH is reached, each tried once, and a batch of waiting themes never hides a due one', async () => {
  const many = Array.from({ length: BATCH + 1 }, (_, i) => row({ id: `s${i}`, siteId: `site${i}` }))
  const one = world(many)
  assert.deepEqual(await runOrphans(one.deps, recorder().log, clock), { noticed: BATCH + 1, purged: 0, failed: 0 })
  assert.equal(one.calls.filter((c) => c === 'due').length, 3, 'a full batch, the one left over, then the empty queue')
  const waiting = Array.from({ length: BATCH }, (_, i) => row({ id: `w${i}`, siteId: `w${i}`, disconnectedAt: ago(N - n + 3), noticeAt: ago(1) }))
  const two = world([...waiting, row({ id: 'last', siteId: 'siteLast' })])
  assert.deepEqual(await runOrphans(two.deps, recorder().log, clock), { noticed: 1, purged: 0, failed: 0 })
  assert.ok(two.calls.some((c) => c.startsWith('send:last:')), two.calls.join(' '))
})

test('a queue that cannot be read ends the run red', async () => {
  const { deps } = world([row()], { dueFails: true })
  assert.deepEqual(await runOrphans(deps, recorder().log, clock), { noticed: 0, purged: 0, failed: 1 })
})

test('the clock stops the loop: no theme is started once BUDGET_MS is spent', async () => {
  let t = NOW.getTime()
  const { deps, calls } = world([row({ id: 'a' }), row({ id: 'b', siteId: 'site2' })])
  const ticking = () => (t += BUDGET_MS / 2)
  assert.deepEqual(await runOrphans(deps, recorder().log, ticking), { noticed: 0, purged: 0, failed: 0 })
  assert.deepEqual(calls, ['due'])
})

/* ── the words and the email ── */

/** Every string an object holds, functions called with a placeholder — `connect-rule.test.ts`'s `wordsOf`. */
function wordsOf(held: unknown): string[] {
  if (typeof held === 'string') return [held]
  if (typeof held === 'function') return [String((held as (x: string) => unknown)('x'))]
  if (Array.isArray(held)) return held.flatMap(wordsOf)
  if (held && typeof held === 'object') return Object.values(held).flatMap(wordsOf)
  return []
}

test('ORPHANS holds every word, names no number, and calls the thing "original theme"', () => {
  const words = wordsOf(ORPHANS).join(' ')
  assert.ok(!/\d/.test(words), `ORPHANS names a number: ${words}`)
  const spelled = /\b(one|two|three|four|five|six|seven|eight|nine|ten|fourteen|ninety)\b/i
  assert.ok(!spelled.test(words), `ORPHANS spells a number out: ${words}`)
  assert.equal(ORPHANS.heading, 'Original themes from disconnected sites')
  assert.match(ORPHANS.caption(N), new RegExp(`keeps it for ${N} days after you disconnect`))
  assert.equal(ORPHANS.row('blog.example', 'Jan 30, 2027'), 'blog.example · deleted on Jan 30, 2027')
  assert.equal(themeLabel('  '), 'Original theme')
  assert.equal(siteLabel('  ', 'https://blog.example/'), 'blog.example')
  assert.equal(siteLabel(' Blog ', 'https://blog.example/'), 'Blog')
  assert.equal(ORPHANS.emailOnly, "This is the only email we'll send about this.")
})

test('the email names the site, the theme, both dates and the button — and escapes a hostile title', () => {
  const url = `https://app.inflozo.com/sites#${SECTION_ID}`
  const mail = orphanEmail({
    site: '<img src=x onerror=alert(1)>',
    theme: 'ca"sper & co',
    date: new Date('2027-01-30T04:30:00Z'),
    disconnected: '2026-11-01T09:00:00Z',
    url,
  })
  assert.doesNotMatch(mail.html, /<img src=x/, 'the title must never reach the HTML as markup')
  assert.match(mail.html, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.match(mail.html, /ca&quot;sper &amp; co/)
  assert.equal(mail.subject, 'Your original theme from <img src=x onerror=alert(1)> will be deleted on Jan 30, 2027')
  assert.match(mail.text, /disconnected from Inflozo on Nov 1, 2026/)
  assert.match(mail.text, new RegExp(`keeps it for ${N} days, so on Jan 30, 2027 it will be permanently deleted`))
  assert.match(mail.html, /Download it from Sites/)
  assert.ok(mail.html.includes(`href="${url}"`), 'the button links to the Sites section, never to a signed file')
  assert.match(mail.html, /This is the only email we'll send about this\./)
})

/* ── promises only the route's source makes ── */

test('the route: the door before any read, the service role built after it, the loop run, and 500 when anything failed', () => {
  const flat = readFileSync('app/api/cron/purge-snapshots/route.ts', 'utf8')
    .replace(/\/\*[^]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/\s+/g, ' ')
  const door = flat.indexOf('authorized(request.headers.get(\'authorization\'), process.env.CRON_SECRET)')
  assert.ok(door > -1 && door < flat.indexOf('supabaseAdmin()', flat.indexOf('export async function GET')), 'the door comes first')
  assert.match(flat, /export const dynamic = 'force-dynamic'/)
  const ceiling = /export const maxDuration = (\d+)/.exec(flat)
  assert.ok(ceiling && BUDGET_MS < Number(ceiling[1]) * 1000, 'the budget ends before the platform kills the run')
  assert.match(flat, /\.lte\('sites\.disconnected_at', since\)/, 'the due set is derived from dueSince, never a figure')
  assert.match(flat, /sites!inner\(title, url, disconnected_at\)/)
  assert.match(flat, /\.order\('sites\(disconnected_at\)'\)/, 'oldest disconnect first')
  assert.match(flat, /drainPrefix\(admin\.storage\.from\(SNAPSHOT_BUCKET\), prefix\)/)
  assert.match(flat, /runOrphans\(deps\)/)
  assert.match(flat, /site: siteLabel\(row\.sites\?\.title, row\.sites\?\.url \?\? ''\)/, 'the email names the site as the Sites row does')
  assert.match(flat, /status: failed \? 500 : 200/)
  assert.doesNotMatch(flat, /interval|\b90\b|\b14\b/, 'no figure of the clock in the route')
})

/* ── the Sites section: its rows, and a failed read is no section ── */

test('the Sites rows: a disconnected site\'s theme with its date, title else host, in the order read; a connected site\'s theme is no row', () => {
  const read = [
    { id: 'x', theme_name: 'casper', orphan_notice_at: null, sites: { title: 'Blog', url: 'https://x.example', disconnected_at: ago(30) } },
    { id: 'y', theme_name: null, orphan_notice_at: ago(4), sites: { title: '  ', url: 'https://y.example/', disconnected_at: ago(N - n + 4) } },
    { id: 'z', theme_name: 'source', orphan_notice_at: null, sites: { title: 'Live', url: 'https://z.example', disconnected_at: null } },
  ]
  assert.deepEqual(originalRows(read, NOW), [
    { id: 'x', theme: 'casper', site: 'Blog', date: 'Apr 30, 2027' },
    { id: 'y', theme: 'Original theme', site: 'y.example', date: 'Mar 11, 2027' },
  ])
  // the date is the job's own: purgeDateOf, the same day the email names
  assert.equal(iso(purgeDateOf({ disconnectedAt: ago(30), noticeAt: null }, NOW)), '2027-04-30T04:30:00.000Z')
})

test('page read fails: no section (the page logs it and passes null), and the cards never wait on it', () => {
  assert.deepEqual(originalRows(null, NOW), [])
  const page = readFileSync('app/(app)/app/(authed)/sites/(list)/page.tsx', 'utf8').replace(/\s+/g, ' ')
  assert.match(page, /if \(originalsError\) console\.error\('sites: original themes read failed', \{ code: originalsError\.code \}\)/)
  assert.match(page, /const kept = originalRows\(originalsError \? null : /)
  assert.match(page, /if \(!rows\.length\) return null/, 'no row, no section')
  // the read joins the one Promise.all and its error is a value, never a throw that would take the cards with it
  assert.match(page, /\{ data: originals, error: originalsError \}, \] = await Promise\.all\(/)
})
