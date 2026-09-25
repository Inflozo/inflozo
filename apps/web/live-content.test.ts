import { test } from 'node:test'
import assert from 'node:assert/strict'
import { orbitWeekly } from '@inflozo/library'
import { feedQuery, formatDate, withData } from '@inflozo/section-runtime'
import {
  addressOf, after, API_VERSION, ask, AUTHOR_FIELDS, bindingReads, FAILURES_TO_STOP, feedRead, feedShortfall, FRESH_MS,
  getShortfall, isFresh, keyOf, LIST_LIMIT, LISTS, LIVE_WORDS, named, NEVER, outcomeOf, PAGE_FIELDS, pick, POST_FIELDS,
  READ_TIMEOUT_MS, reader, REQUEST_CEILING, retriable, retried, SETTINGS, SHORTFALL, SITE_FIELDS, siteFrom, siteLinks,
  siteRows, siteTotal, slugShaped, START, startingArchive, subjectRead, TAG_FIELDS, TIER_FIELDS, wallClock, zoneOf,
  type Answer, type LiveQuery, type Reading, type Row,
} from './lib/live-content.ts'
import { liveStore, WIDTH } from './lib/live-client.ts'
import { sitePage } from './lib/canvas.ts'
import { cappedPosts, SOURCE_WORDS, siteSubjects, subjectOptions } from './lib/preview-subject.ts'

/* STORY 5.18 — the I/O matrix over the pure read layer (`lib/live-content.ts`), the one store (`lib/live-client.ts`,
   driven here by a fetch that answers what a test tells it — the network is the deployed walk's, R-82) and the page
   the canvas paints from (`lib/canvas.ts`'s `sitePage`). Every number is read from the modules — `FRESH_MS`,
   `FAILURES_TO_STOP`, `REQUEST_CEILING` — and never restated (standing rule 4); the strings are the spec's Design Notes
   table, written out ONCE, here, because the table is the contract they are held to. */

const words = (html: string) => html.replace(/<[^>]*>/g, '')

// ─── the reads ───────────────────────────────────────────────────────────────────────────────────────────────────

test('never the body: every post and page read asks for `formats=mobiledoc`, and nothing else does', () => {
  const reads: LiveQuery[] = [SETTINGS, ...Object.values(LISTS), feedRead(null, 1, 12) as LiveQuery, subjectRead({ kind: 'page', slug: 'about' }) as LiveQuery]
  for (const q of reads) {
    assert.equal(q.params['formats'] === 'mobiledoc', q.resource === 'posts' || q.resource === 'pages', keyOf(q))
  }
  const binding = bindingReads({ source: 'posts', limit: 3 })
  assert.equal(binding.newest?.params['formats'], 'mobiledoc')
})

test('one key per read: the order of its params does not move it, and it carries no key — the address does', () => {
  const a: LiveQuery = { resource: 'posts', params: { limit: '12', page: '1' } }
  const b: LiveQuery = { resource: 'posts', params: { page: '1', limit: '12' } }
  assert.equal(keyOf(a), keyOf(b))
  const KEY = '0123456789abcdef01234567ab'
  assert.ok(!keyOf(a).includes(KEY))
  const url = addressOf('https://ghost.example', a, KEY)
  assert.ok(url.startsWith('https://ghost.example/ghost/api/content/posts/?'))
  assert.equal(new URL(url).searchParams.get('key'), KEY)
  // Accept-Version is a HEADER (the store's), never a query param
  assert.equal(new URL(url).searchParams.get('accept-version'), null)
  assert.equal(API_VERSION, 'v5.0')
})

test('a slug not in Ghost\'s shape is never sent — a malformed filter is a 4xx, which counts against the customer\'s network', () => {
  for (const ok of ['archive', 'field-notes', 'ten-years-of-one-layout', 'café', 'a1', '2026']) assert.ok(slugShaped(ok), ok)
  for (const bad of ['', 'Bad', 'two words', "a'b", 'x:y', 'a--b', '-lead', 'trail-', 'a+b', 'a,b', '[x]', 'x'.repeat(192)]) {
    assert.equal(slugShaped(bad), false, bad)
    assert.equal(subjectRead({ kind: 'post', slug: bad }), null, bad)
    assert.equal(feedRead({ kind: 'tag', slug: bad }, 1, 12), null, bad)
  }
  // a shaped one is QUOTED — the exact form MEASUREMENTS §51 executed on both majors — and is a browse, never a read by slug
  assert.equal(subjectRead({ kind: 'tag', slug: 'craft' })?.params['filter'], "slug:'craft'")
  assert.equal(feedRead({ kind: 'author', slug: 'umang' }, 2, 12)?.params['filter'], "authors:'umang'")
  assert.equal(feedRead(null, 2, 12)?.params['page'], '2')
})

test('a `{{#get}}` is read at the Count\'s ceiling in both date orders; a fixed query as it is; a pick as ONE `id:[…]` read', () => {
  const dated = bindingReads({ source: 'posts', filter: 'featured:true', limit: 3 })
  assert.equal(dated.newest?.params['limit'], String(LIST_LIMIT))
  assert.equal(dated.newest?.params['order'], 'published_at desc')
  assert.equal(dated.oldest?.params['order'], 'published_at asc')
  assert.equal(dated.newest?.params['filter'], 'featured:true')
  const fixed = bindingReads({ source: 'posts', limit: 1, order: 'published_at desc', fixed: true })
  assert.equal(fixed.newest?.params['limit'], '1')
  assert.equal(keyOf(fixed.newest as LiveQuery), keyOf(fixed.oldest as LiveQuery))
  const a = '5ab100000000000000000001'
  const b = '5ab100000000000000000002'
  const picked = bindingReads({ source: 'posts', ids: [b, 'not-an-id', a] })
  assert.equal(picked.newest?.params['filter'], `id:[${b},${a}]`, 'an id not in Ghost\'s shape is never sent')
  assert.deepEqual(bindingReads({ source: 'posts', ids: ['nope'] }), { newest: null, oldest: null }, 'nothing to send is no read at all')
  assert.equal(bindingReads({ source: 'tags' }).newest?.params['include'], 'count.posts')
  // R-20: Ghost answers a pick in ITS order (§51 (h)) — the rows come back in the PICK's, and a missing id is skipped
  const look = (q: LiveQuery): Answer | undefined =>
    q.params['filter']?.startsWith('id:') ? { rows: [{ id: a, title: 'A' }, { id: b, title: 'B' }], total: 2, pages: 1 } : undefined
  const rows = siteRows({ picks: { source: 'posts', ids: [b, 'gone0000000000000000000', a] } }, reader(look), 'Etc/UTC')
  assert.deepEqual(rows['picks']?.newest.map((r) => r['id']), [b, a])
})

// ─── the outcome of a status, and the stop rule ──────────────────────────────────────────────────────────────────

test('what a status means: 2xx answers, 401 and 403 are refused, 429 asks us to wait, and anything else — or no answer — failed', () => {
  assert.equal(outcomeOf(200), 'ok')
  assert.equal(outcomeOf(401), 'refused')
  assert.equal(outcomeOf(403), 'refused')
  assert.equal(outcomeOf(429), 'wait')
  for (const s of [0, 400, 404, 500, 502, 503]) assert.equal(outcomeOf(s), 'failed', String(s))
})

test('the stop rule: a refusal and a 429 stop AT ONCE; failures stop at the third in a row; an answer clears the run', () => {
  assert.equal(after(START, 'refused').stopped, 'refused')
  assert.equal(after(START, 'wait').stopped, 'wait')
  let r: Reading = START
  for (let n = 1; n < FAILURES_TO_STOP; n++) {
    r = after(r, 'failed')
    assert.equal(r.stopped, null, `failure ${n} does not stop`)
    assert.equal(r.last, 'unanswered', 'one failure is silent')
  }
  assert.equal(after(r, 'failed').stopped, 'failing', `failure ${FAILURES_TO_STOP} in a row stops`)
  // an answer between them clears the run, so failures that are not IN A ROW never stop
  let s: Reading = START
  for (let n = 0; n < FAILURES_TO_STOP * 3; n++) s = after(after(s, 'failed'), 'ok')
  assert.equal(s.stopped, null)
  assert.equal(s.last, null)
  // the named tier: every cause but one silent failure is said aloud
  assert.equal(named('unanswered'), false)
  for (const c of ['failing', 'refused', 'wait', 'ceiling'] as const) assert.equal(named(c), true, c)
})

test('the ceiling counts reads and stops at it; choosing the site tries again — never after a refused key or the ceiling', () => {
  let r: Reading = START
  for (let n = 0; n < REQUEST_CEILING; n++) {
    const turn = ask(r)
    assert.equal(turn.go, true)
    r = after(turn.reading, 'ok')
  }
  const over = ask(r)
  assert.equal(over.go, false)
  assert.equal(over.reading.stopped, 'ceiling')
  assert.equal(retriable('ceiling'), false)
  assert.equal(retried(over.reading).stopped, 'ceiling', 'a reload starts a new session — nothing else does')
  assert.equal(retriable('refused'), false)
  assert.equal(retried(after(START, 'refused')).stopped, 'refused', 'a refused key is never asked again')
  assert.equal(retried(after(START, 'wait')).stopped, null, 'a 429 is the one "try again" away')
  const failing = after(after(after(START, 'failed'), 'failed'), 'failed')
  assert.deepEqual(retried(failing), { ...failing, stopped: null, failures: 0, last: null })
})

// ─── the store, over a fetch this test answers ───────────────────────────────────────────────────────────────────

type Reply = { status: number; body?: unknown } | 'network' | 'hang' | Promise<{ status: number; body?: unknown } | 'network'>
/** `'hang'` never answers and honours the request's `signal`, as a socket that accepted and went quiet would;
 *  a promise answers when the test resolves it, so the test can hold reads in flight and count them */
function fakeFetch(reply: (url: URL) => Reply) {
  const calls: URL[] = []
  const was = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    calls.push(url)
    const asked = reply(url)
    const r = await (asked === 'hang'
      ? new Promise<never>((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason ?? new Error('aborted'))))
      : asked)
    if (r === 'network') throw new TypeError('Failed to fetch')
    return new Response(JSON.stringify(r.body ?? {}), { status: r.status, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
  return { calls, restore: () => (globalThis.fetch = was) }
}
const settingsBody = { settings: { title: 'Ghost5', url: 'https://ghost5.example/', timezone: 'Etc/UTC', navigation: [{ label: 'Home', url: '/' }] } }
const postsBody = (n: number) => ({ posts: Array.from({ length: n }, (_, i) => ({ id: `p${i}`, slug: `p-${i}`, title: `P${i}`, published_at: '2026-09-01T00:00:00.000Z' })), meta: { pagination: { page: 1, pages: 1, limit: 12, total: n } } })

test('freshness is one comparison: an answer is fresh for FRESH_MS after it landed, and stale from then on', () => {
  assert.equal(isFresh(1000, 1000 + FRESH_MS - 1), true)
  assert.equal(isFresh(1000, 1000 + FRESH_MS), false)
})

test('fresh: a key read in the last minute is served from memory with NO request; two consumers asking at once share ONE', async () => {
  const net = fakeFetch(() => ({ status: 200, body: settingsBody }))
  try {
    let clock = 0
    const s = liveStore('https://ghost5.example', 'k', () => clock, words)
    await Promise.all([s.ensure([SETTINGS]), s.ensure([SETTINGS])])
    assert.equal(net.calls.length, 1, 'two consumers, one key: one request')
    clock += FRESH_MS - 1
    await s.ensure([SETTINGS])
    assert.equal(net.calls.length, 1, 'fresh: no request')
    assert.equal(s.peek(SETTINGS)?.rows[0]?.['title'], 'Ghost5')
    // STALE: served at once — `peek` still answers — and revalidated ONCE, in the background, never awaited
    clock += 2
    const asked = s.ensure([SETTINGS])
    const again = s.ensure([SETTINGS])
    assert.ok(s.peek(SETTINGS) !== undefined, 'a stale key is shown at once')
    await asked
    await again
    await new Promise((r) => setTimeout(r, 10))
    assert.equal(net.calls.length, 2, 'one background revalidation, however many ask')
    // the request carries the key in its address and the version in its header — the header is not in the URL
    assert.equal(net.calls[0]?.searchParams.get('key'), 'k')
  } finally {
    net.restore()
  }
})

test('stale, and the revalidation fails: the failure is COUNTED, and what is in hand stays in hand', async () => {
  let down = false
  const net = fakeFetch(() => (down ? 'network' : { status: 200, body: settingsBody }))
  try {
    let clock = 0
    const s = liveStore('https://ghost5.example', 'k', () => clock, words)
    await s.ensure([SETTINGS])
    down = true
    clock += FRESH_MS
    await s.ensure([SETTINGS])
    await new Promise((r) => setTimeout(r, 10))
    assert.equal(net.calls.length, 2, 'the stale key was revalidated once')
    assert.deepEqual({ failures: s.reading().failures, last: s.reading().last, stopped: s.reading().stopped }, { failures: 1, last: 'unanswered', stopped: null })
    assert.equal(s.peek(SETTINGS)?.rows[0]?.['title'], 'Ghost5', 'the stale answer is still what a paint reads')
  } finally {
    net.restore()
  }
})

test('a refused key costs EXACTLY ONE request, even when a page asks for many reads at once — and is never retried', async () => {
  const net = fakeFetch(() => ({ status: 401, body: { errors: [{ message: 'Unknown Content API Key' }] } }))
  try {
    const s = liveStore('https://ghost5.example', 'wrong', Date.now, words)
    await s.ensure([SETTINGS, ...Object.values(LISTS), feedRead(null, 1, 12) as LiveQuery])
    assert.equal(net.calls.length, 1)
    assert.equal(s.reading().stopped, 'refused')
    s.retry()
    await s.ensure([SETTINGS])
    assert.equal(net.calls.length, 1, 'choosing the site again cannot send a refused key')
  } finally {
    net.restore()
  }
})

test('three failures in a row stop reading; a 429 stops at once; a network error is a failure — and nothing is cached', async () => {
  for (const [reply, stopped, cost] of [
    ['network', 'failing', FAILURES_TO_STOP],
    [{ status: 503 }, 'failing', FAILURES_TO_STOP],
    [{ status: 429, body: { errors: [{ message: 'Too many attempts.' }] } }, 'wait', 1],
  ] as const) {
    const net = fakeFetch(() => reply)
    try {
      const s = liveStore('https://ghost5.example', 'k', Date.now, words)
      await s.ensure([SETTINGS, ...Object.values(LISTS), feedRead(null, 1, 12) as LiveQuery])
      assert.equal(s.reading().stopped, stopped, JSON.stringify(reply))
      assert.equal(net.calls.length, cost, `${JSON.stringify(reply)}: ${cost} request(s), never a burst`)
      assert.equal(s.peek(SETTINGS), undefined)
    } finally {
      net.restore()
    }
  }
})

test('the ceiling stops reading, and a 200 that is not the shape asked for is a failed read', async () => {
  const net = fakeFetch(() => ({ status: 200, body: { nothing: true } }))
  try {
    const s = liveStore('https://ghost5.example', 'k', Date.now, words)
    await s.ensure([SETTINGS])
    assert.equal(s.peek(SETTINGS), undefined)
    assert.equal(s.reading().last, 'unanswered')
  } finally {
    net.restore()
  }
  assert.equal(READ_TIMEOUT_MS, 5_000, "Ghost's own per-{{#get}} budget (appendix-b1 §5) — a tuning, stated in the spec")
})

test('a site that accepts the connection and never answers is ONE failed read after READ_TIMEOUT_MS — `ensure` resolves, so the canvas can paint sample content', async () => {
  // review (2026-09-24): without the request's `signal`, a quiet socket would hold `ensure` — and every later paint —
  // for the whole session. This test waits the real timeout once; it is the one that fails if the signal goes.
  const net = fakeFetch(() => 'hang')
  try {
    const s = liveStore('https://ghost5.example', 'k', Date.now, words)
    const t0 = Date.now()
    await s.ensure([SETTINGS])
    assert.ok(Date.now() - t0 >= READ_TIMEOUT_MS - 50, 'it waited the timeout')
    assert.equal(net.calls.length, 1)
    assert.deepEqual({ last: s.reading().last, stopped: s.reading().stopped }, { last: 'unanswered', stopped: null })
    assert.equal(s.peek(SETTINGS), undefined)
  } finally {
    net.restore()
  }
})

test('reads go one at a time until the site has answered, then up to WIDTH at once, and one at a time again after a failure', async () => {
  const held: { url: URL; resolve: (r: { status: number; body?: unknown } | 'network') => void }[] = []
  const net = fakeFetch((url) => new Promise((resolve) => held.push({ url, resolve })))
  const tick = () => new Promise((r) => setTimeout(r, 5))
  /** an answer in the shape the read asked for — `pick` refuses any other as a failed read */
  const answer = (h: { url: URL; resolve: (r: { status: number; body?: unknown } | 'network') => void } | undefined) => {
    const resource = h?.url.pathname.split('/').filter(Boolean).at(-1) ?? ''
    h?.resolve({ status: 200, body: resource === 'settings' ? settingsBody : { [resource]: [{ id: 'x', slug: 'x', title: 'X', name: 'X' }], meta: { pagination: { page: 1, pages: 1, limit: 12, total: 1 } } } })
  }
  try {
    const s = liveStore('https://ghost5.example', 'k', Date.now, words)
    const all = [SETTINGS, ...Object.values(LISTS), feedRead(null, 1, 12) as LiveQuery, feedRead(null, 2, 12) as LiveQuery, subjectRead({ kind: 'post', slug: 'a' }) as LiveQuery]
    assert.ok(all.length > WIDTH + 1, 'enough reads to see the bound')
    const done = s.ensure(all)
    await tick()
    assert.equal(net.calls.length, 1, 'an unproven key: one read in flight')
    answer(held.shift())
    await tick()
    assert.equal(net.calls.length, 1 + WIDTH, 'answered once: up to WIDTH in flight — the bound a mid-session failure can cost')
    // two of them fail: what was in flight stays in flight (never retried), and NOTHING new goes out beside it while
    // the run of failures stands — a site gone down mid-session costs what was already out, never more
    held.shift()?.resolve('network')
    held.shift()?.resolve('network')
    await tick()
    assert.equal(net.calls.length, 1 + WIDTH, 'after a failure no new read joins the ones in flight')
    assert.equal(s.reading().failures, 2)
    // an answer clears the run, and the rest go out again
    answer(held.shift())
    await tick()
    assert.equal(s.reading().failures, 0, 'an answer cleared the run')
    assert.ok(net.calls.length > 1 + WIDTH, 'and reading widened again')
    while (held.length > 0 || net.calls.length < all.length) {
      answer(held.shift())
      await tick()
    }
    await done
    assert.equal(net.calls.length, all.length)
  } finally {
    net.restore()
  }
})

// ─── the whitelist ───────────────────────────────────────────────────────────────────────────────────────────────

test('the whitelist is the dataset\'s own row shapes, field for field — the canvas can read nothing else', () => {
  const keys = (row: object, drop: string[] = []) => Object.keys(row).filter((k) => !drop.includes(k)).sort()
  assert.deepEqual([...SITE_FIELDS].sort(), keys(orbitWeekly.site()))
  assert.deepEqual([...POST_FIELDS].sort(), keys(orbitWeekly.subject('post'), ['tags', 'authors', 'primary_tag', 'primary_author']))
  assert.deepEqual([...PAGE_FIELDS].sort(), keys(orbitWeekly.subject('page'), ['tags', 'authors', 'primary_tag', 'primary_author']))
  assert.deepEqual([...TAG_FIELDS].sort(), keys(orbitWeekly.tags()[0] as object, ['count']))
  assert.deepEqual([...AUTHOR_FIELDS].sort(), keys(orbitWeekly.authors()[0] as object, ['count']))
  assert.deepEqual([...TIER_FIELDS].sort(), keys(orbitWeekly.tiers()[0] as object))
  for (const never of NEVER) {
    for (const fields of [SITE_FIELDS, POST_FIELDS, PAGE_FIELDS, TAG_FIELDS, AUTHOR_FIELDS, TIER_FIELDS]) assert.ok(!(fields as readonly string[]).includes(never), never)
  }
})

test('no body, no code injection and no key ever reaches a row — even where a future Ghost sends them', () => {
  const KEY = 'feedfacefeedfacefeedfacefe'
  const hostile = {
    id: 'x', slug: 'x', title: 'X', html: '<p>body</p>', plaintext: 'body', lexical: '{}', mobiledoc: '{}',
    codeinjection_head: '<script>1</script>', codeinjection_foot: '<script>2</script>', key: KEY, uuid: 'u', comments: true,
    feature_image_caption: 'A <em>2004</em> capture, <a href="https://x.example">linked</a>.',
    tags: [{ id: 't', slug: 'craft', name: 'Craft', meta_title: 'no', count: { posts: 9 } }],
    authors: [{ id: 'a', slug: 'umang', name: 'Umang', email: 'no@example.com' }],
    primary_tag: { id: 't', slug: 'craft', name: 'Craft', codeinjection_head: 'no' },
  }
  const answer = pick('posts', { posts: [hostile], meta: { pagination: { total: 1, pages: 1 } } }, words) as Answer
  const row = answer.rows[0] as Row
  const flat = JSON.stringify(answer)
  for (const f of ['html', 'plaintext', 'lexical', 'mobiledoc', 'codeinjection_head', 'codeinjection_foot', 'key', 'uuid', 'comments', 'meta_title', 'email']) {
    assert.ok(!flat.includes(`"${f}"`), `${f} reached a row`)
  }
  assert.ok(!flat.includes(KEY) && !flat.includes('<script>') && !flat.includes('<p>'))
  // the caption, which Ghost stores as HTML (§31a), is reduced to its words
  assert.equal(row['feature_image_caption'], 'A 2004 capture, linked.')
  assert.equal((row['primary_tag'] as Row)['slug'], 'craft')
  assert.deepEqual((row['tags'] as Row[])[0], { id: 't', slug: 'craft', name: 'Craft', count: { posts: 9 } })
  // the site's settings: `codeinjection_*` dropped, a menu item is a label and an address and nothing else
  const site = pick('settings', { settings: { ...settingsBody.settings, codeinjection_head: '<script>x</script>', lang: 'en', navigation: [{ label: 'Home', url: '/', onclick: 'x' }] } }, words) as Answer
  assert.ok(!JSON.stringify(site).includes('codeinjection') && !JSON.stringify(site).includes('onclick'))
  assert.deepEqual((site.rows[0] as Row)['navigation'], [{ label: 'Home', url: '/' }])
  // a body that is not the shape asked for is no answer at all
  assert.equal(pick('posts', { pages: [] }, words), null)
  assert.equal(pick('settings', { settings: [] }, words), null)
})

// ─── DW-98: the site's own clock ─────────────────────────────────────────────────────────────────────────────────

test('DW-98: a timestamp is handed over on the SITE\'s wall clock, per value — so a date across a DST boundary prints what Ghost prints', () => {
  // New York leaves EST (UTC-5) for EDT (UTC-4) at 07:00Z on 8 March 2026
  assert.equal(wallClock('2026-03-08T06:30:00.000Z', 'America/New_York'), '2026-03-08T01:30:00.000Z')
  assert.equal(wallClock('2026-03-08T07:30:00.000Z', 'America/New_York'), '2026-03-08T03:30:00.000Z')
  // a post published late in the evening in New York is dated THAT day on the site — the shim prints it so
  const late = wallClock('2026-07-19T02:00:00.000Z', 'America/New_York')
  assert.equal(formatDate(late), 'Jul 18, 2026')
  assert.equal(formatDate('2026-07-19T02:00:00.000Z'), 'Jul 19, 2026', 'the control: unmoved, UTC says the 19th')
  // the sample's zone moves nothing, and a zone this runtime does not know is the UTC instant, never an error
  assert.equal(wallClock('2026-07-19T02:00:00.000Z', 'Etc/UTC'), '2026-07-19T02:00:00.000Z')
  assert.equal(wallClock('2026-07-19T02:00:00.000Z', 'Not/AZone'), '2026-07-19T02:00:00.000Z')
  assert.equal(wallClock(null, 'Etc/UTC'), null)
  assert.equal(orbitWeekly.site().timezone, 'Etc/UTC')
})

// ─── R-193 ───────────────────────────────────────────────────────────────────────────────────────────────────────

test('R-193: an untouched archive starts on the tag or writer with the MOST posts, a tie to the name first in the alphabet', () => {
  const t = (name: string, posts: number) => ({ name, slug: name.toLowerCase().replace(/ /g, '-'), count: { posts } })
  // the owner's own Ghost 5 site, as the spec's Code Map read it
  assert.equal(startingArchive([t('Archive', 5), t('Craft', 9), t('Field Notes', 8), t('Interviews', 5), t('Systems', 6), t('Tooling', 7)])?.['name'], 'Craft')
  assert.equal(startingArchive([t('Tom Whitlock', 10), t('Priya Raman', 11), t('Umang', 12)])?.['name'], 'Umang')
  assert.equal(startingArchive([t('Interviews', 5), t('Archive', 5)])?.['name'], 'Archive', 'a tie goes to the name first in the alphabet')
  assert.equal(startingArchive([t('news', 1), t('News', 1), t('apple', 1)])?.['name'], 'apple', 'case does not decide the alphabet')
  assert.equal(startingArchive([]), null)
})

// ─── the page the canvas paints from ─────────────────────────────────────────────────────────────────────────────

/** A connected site, answered from memory: 5 posts, two tags (Craft 3, Archive 2), one writer. */
function fakeSite(opts: { tags?: boolean; missing?: string } = {}) {
  const post = (i: number, tag: string) => ({
    id: `p${i}`, slug: `post-${i}`, title: `Post ${i}`, url: `https://ghost5.example/post-${i}/`, published_at: `2026-09-0${i}T12:00:00.000Z`,
    reading_time: 1, tags: [{ id: tag, slug: tag, name: tag }], authors: [{ id: 'u', slug: 'umang', name: 'Umang' }],
  })
  const posts = [1, 2, 3, 4, 5].map((i) => post(i, i <= 3 ? 'craft' : 'archive'))
  const tags = opts.tags === false ? [] : [{ id: 'craft', slug: 'craft', name: 'Craft', count: { posts: 3 } }, { id: 'archive', slug: 'archive', name: 'Archive', count: { posts: 2 } }]
  const body = (q: LiveQuery): unknown => {
    const f = q.params['filter'] ?? ''
    if (q.resource === 'settings') return settingsBody
    if (q.resource === 'tags') return { tags: f.startsWith('slug:') ? tags.filter((t) => f === `slug:'${t.slug}'`) : tags, meta: { pagination: { total: tags.length, pages: 1 } } }
    if (q.resource === 'authors') return { authors: [{ id: 'u', slug: 'umang', name: 'Umang', count: { posts: 5 } }], meta: { pagination: { total: 1, pages: 1 } } }
    if (q.resource === 'pages') return { pages: [], meta: { pagination: { total: 0, pages: 1 } } }
    const matched = f.startsWith('slug:') ? posts.filter((p) => f === `slug:'${p.slug}'`) : f.startsWith('tags:') ? posts.filter((p) => f === `tags:'${p.tags[0]?.slug}'`) : posts
    return { posts: matched.slice(0, Number(q.params['limit'] ?? 15)), meta: { pagination: { total: matched.length, pages: 1 } } }
  }
  return (q: LiveQuery): Answer | undefined => (opts.missing !== undefined && keyOf(q).startsWith(opts.missing) ? undefined : pick(q.resource, body(q), words) ?? undefined)
}
const page = (file: string, stored: orbitWeekly.Subject | null, look = fakeSite(), queries: Parameters<typeof sitePage>[1]['queries'] = {}, perPage = orbitWeekly.postsPerPage()) =>
  sitePage(look, { file, stored, page: 1, pageFile: file, targets: [file, 'default.hbs'], queries, perPage })

test('a render is ONE SOURCE THROUGHOUT: a page is ready only when every read it needs is in hand — otherwise it lists them', () => {
  const home = page('home.hbs', null)
  assert.ok('ready' in home)
  const ctx = home.ready.contexts['home.hbs']
  assert.equal((ctx?.ghost['posts'] as unknown[]).length, 5)
  assert.deepEqual(ctx?.ghost['@site'], (pick('settings', settingsBody, words) as Answer).rows[0])
  assert.equal(ctx?.site.currentUrl, '/')
  // the header's context carries @site and no list — exactly what `templateContext('default.hbs')` hands the sample
  assert.equal(home.ready.contexts['default.hbs']?.ghost['posts'], undefined)
  // with the feed not in hand, the page is not ready and says which read it needs
  const missing = page('home.hbs', null, fakeSite({ missing: 'posts/' }))
  assert.ok('need' in missing && missing.need.some((q) => q.resource === 'posts'))
})

test('R-193 on the page: an untouched Tag canvas renders the site\'s fullest tag, its own posts, at its own address', () => {
  const tag = page('tag.hbs', null)
  assert.ok('ready' in tag)
  assert.deepEqual(tag.ready.subject, { kind: 'tag', slug: 'craft', source: 'site' })
  const ctx = tag.ready.contexts['tag.hbs']
  assert.equal((ctx?.ghost['tag'] as Row)['slug'], 'craft')
  assert.equal((ctx?.ghost['posts'] as unknown[]).length, 3)
  assert.equal(ctx?.site.currentUrl, '/tag/craft/')
  // a site with no tags of its own: the page previews the sample's, and says why
  assert.deepEqual(page('tag.hbs', null, fakeSite({ tags: false })), { nothing: 'tag' })
})

test('a subject belongs to the source it was chosen from: the other source\'s is the starting subject SILENTLY, a gone one SAYS so', () => {
  // an unmarked (sample) subject while the site shows — the site's starting subject, and no "no longer there"
  const sample = page('tag.hbs', { kind: 'tag', slug: orbitWeekly.subject('tag').slug })
  assert.ok('ready' in sample)
  assert.deepEqual({ slug: sample.ready.subject?.slug, fellBack: sample.ready.fellBack }, { slug: 'craft', fellBack: false })
  // a site subject its own source holds
  const chosen = page('tag.hbs', { kind: 'tag', slug: 'archive', source: 'site' })
  assert.ok('ready' in chosen)
  assert.equal(chosen.ready.subject?.slug, 'archive')
  assert.equal((chosen.ready.contexts['tag.hbs']?.ghost['posts'] as unknown[]).length, 2)
  // …and one it answered `[]` for: the starting subject, and FR-D22's sentence
  const gone = page('tag.hbs', { kind: 'tag', slug: 'deleted-tag', source: 'site' })
  assert.ok('ready' in gone)
  assert.deepEqual({ slug: gone.ready.subject?.slug, fellBack: gone.ready.fellBack }, { slug: 'craft', fellBack: true })
  // the Post canvas starts on the style-guide entry on the site's content too, with the site around it
  const post = page('post.hbs', null)
  assert.ok('ready' in post)
  assert.equal(post.ready.subject?.slug, orbitWeekly.subject('post').slug)
  // DW-230: a chosen post carries its own address, so the header marks what Ghost marks there
  const own = page('post.hbs', { kind: 'post', slug: 'post-2', source: 'site' })
  assert.ok('ready' in own)
  assert.equal(own.ready.contexts['post.hbs']?.site.currentUrl, '/post-2/')
  assert.equal(own.ready.contexts['post.hbs']?.ghost['title'], 'Post 2')
})

test('zero is an answer, never back-filled: an empty list renders empty, and its pagination says so', () => {
  const empty = (q: LiveQuery): Answer | undefined =>
    q.resource === 'posts' ? { rows: [], total: 0, pages: 1 } : fakeSite()(q)
  const home = page('home.hbs', null, empty)
  assert.ok('ready' in home)
  assert.deepEqual(home.ready.contexts['home.hbs']?.ghost['posts'], [])
  assert.deepEqual(home.ready.contexts['home.hbs']?.ghost['pagination'], { page: 1, pages: 1, limit: orbitWeekly.postsPerPage(), total: 0 })
  // a `{{#get}}` over nothing is `[]` too
  assert.deepEqual(siteRows({ latest: { source: 'posts', limit: 1, order: 'published_at desc', fixed: true } }, reader(empty), 'Etc/UTC')['latest'], { newest: [], oldest: [] })
})

test('the site\'s lists in D5e\'s shape: the style-guide entry first, then the site\'s own rows, and the capped line past 100', () => {
  const look = fakeSite()
  const source = siteSubjects(look, 'Etc/UTC')
  const posts = subjectOptions(source, 'post')
  assert.equal(posts[0]?.slug, orbitWeekly.subject('post').slug)
  assert.deepEqual(posts.slice(1).map((r) => r.slug), ['post-1', 'post-2', 'post-3', 'post-4', 'post-5'])
  assert.deepEqual(subjectOptions(source, 'page').map((r) => r.slug), [orbitWeekly.subject('page').slug], 'a site with no pages lists the style-guide page alone')
  const links = siteLinks(reader(look), 'Etc/UTC')
  assert.equal(links.posts.length, 5)
  assert.equal(links.capped, undefined)
  const many = (q: LiveQuery): Answer | undefined => (keyOf(q) === keyOf(LISTS.post) ? { rows: [{ id: 'x', title: 'X', slug: 'x' }], total: 250, pages: 3 } : look(q))
  assert.equal(siteLinks(reader(many), 'Etc/UTC').capped, "Showing your newest 100 posts. Paste an older post's address to link it.")
  // D5e's own line, from the same count (review, 2026-09-24)
  assert.equal(cappedPosts(many), LIVE_WORDS.capped)
  assert.equal(cappedPosts(look), null)
  assert.equal(cappedPosts(() => undefined), null, 'a list not in hand is not capped')
})

test('a binding\'s size on the site is the list\'s own total, or for a pick the ids Ghost holds — the number the panel\'s note prints', () => {
  const a = '5ab100000000000000000001'
  const b = '5ab100000000000000000002'
  const look = (q: LiveQuery): Answer | undefined =>
    q.params['filter']?.startsWith('id:') ? { rows: [{ id: a }], total: 1, pages: 1 } : q.resource === 'posts' ? { rows: [{ id: 'x' }], total: 7, pages: 1 } : undefined
  assert.equal(siteTotal({ source: 'posts', limit: 3 }, reader(look)), 7, 'the total, not the rows in hand')
  assert.equal(siteTotal({ source: 'posts', ids: [a, b] }, reader(look)), 1, 'a pick counts the ids Ghost answered')
  assert.equal(siteTotal({ source: 'tags', limit: 3 }, reader(look)), 0, 'a list not in hand counts nothing')
  assert.equal(siteTotal({ source: 'nothing', limit: 3 }, reader(look)), 0, 'a resource Ghost has not got is no read')
  assert.equal(zoneOf({ timezone: 'Asia/Kolkata' }), 'Asia/Kolkata')
  assert.equal(zoneOf(undefined), 'Etc/UTC')
})

// ─── the server truth, and the words ─────────────────────────────────────────────────────────────────────────────

test('the linked site as server truth: disconnected, no key, plain http — each unreadable with its own reason — or readable', () => {
  const origin = (u: string) => (u.startsWith('https://') ? u.replace(/\/+$/, '') : null)
  const host = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const row = { url: 'https://ghost5.example', title: 'Ghost5', content_key: 'k', disconnected_at: null }
  assert.deepEqual(siteFrom(row, origin, host), { title: 'Ghost5', origin: 'https://ghost5.example', key: 'k' })
  // Story 3.5 nulls the key AND keeps the link on a disconnect: the reason is the disconnect, not the key
  assert.deepEqual(siteFrom({ ...row, content_key: null, disconnected_at: '2026-09-01' }, origin, host), { title: 'Ghost5', unreadable: 'disconnected' })
  assert.deepEqual(siteFrom({ ...row, content_key: null }, origin, host), { title: 'Ghost5', unreadable: 'no_key' })
  assert.deepEqual(siteFrom({ ...row, url: 'http://ghost5.example' }, origin, host), { title: 'Ghost5', unreadable: 'http' })
  // R-170's fallback: the host where the site has no title
  assert.deepEqual(siteFrom({ ...row, title: '  ' }, origin, host), { title: 'ghost5.example', origin: 'https://ghost5.example', key: 'k' })
  // an address that does not normalise is no site at all — connect wrote it normalised, so this is a data defect
  assert.equal(siteFrom({ ...row, url: 'not an address' }, origin, host), null)
})

test('the panel\'s note: a list that cannot fill the section says so — zero included — and a short page 2 is ordinary pagination', () => {
  assert.equal(feedShortfall('tag', 5, 1, 12), 'This tag has 5 posts; this section shows up to 12 per page.')
  assert.equal(feedShortfall('site', 1, 1, 12), 'This site has 1 post; this section shows up to 12 per page.')
  assert.equal(feedShortfall('author', 0, 1, 12), 'This author has no posts yet, so this section shows its empty state.')
  assert.equal(feedShortfall('site', 12, 1, 12), null, 'a full page is no shortfall')
  assert.equal(feedShortfall('site', 13, 2, 12), null, 'a list that runs to page 2 is ordinary pagination')
  assert.equal(getShortfall('posts', 2, 3), 'This site has 2 posts for this section; it shows up to 3.')
  assert.equal(getShortfall('posts', 1, 3), 'This site has 1 post for this section; it shows up to 3.')
  assert.equal(getShortfall('tags', 0, 5), 'This site has no tags for this section yet.')
  assert.equal(getShortfall('posts', 3, 3), null)
  assert.equal(SHORTFALL.get(0, 'authors', 4), 'This site has no authors for this section yet.')
})

test('every string equals the spec\'s Design Notes table (R-170: one name — the site\'s own — in every one)', () => {
  const S = 'Ghost5'
  assert.equal(SOURCE_WORDS.lead, 'Previewing with:')
  assert.equal(SOURCE_WORDS.sample, 'Sample content')
  assert.equal(LIVE_WORDS.heading, 'SOURCE')
  assert.equal(LIVE_WORDS.cause('unanswered', S), 'Ghost5 not answering')
  assert.equal(LIVE_WORDS.cause('failing', S), 'Ghost5 not answering')
  assert.equal(LIVE_WORDS.cause('refused', S), 'key refused')
  assert.equal(LIVE_WORDS.cause('wait', S), 'Ghost5 asked us to wait')
  assert.equal(LIVE_WORDS.cause('ceiling', S), 'paused for this session')
  assert.equal(LIVE_WORDS.sentence('unanswered', S), "Ghost5 didn't answer, so this page is showing sample content. Choose Ghost5 to try again.")
  assert.equal(LIVE_WORDS.sentence('failing', S), "Ghost5 hasn't answered three times in a row, so Inflozo has stopped asking for now and this page is showing sample content. Choose Ghost5 to try again.")
  assert.equal(LIVE_WORDS.sentence('refused', S), "Ghost5 doesn't recognise the Content API key Inflozo has for it, so this page is showing sample content. Update the key in Sites, under Manage keys.")
  assert.equal(LIVE_WORDS.sentence('wait', S), 'Ghost5 is turning requests away because it has had too many, so this page is showing sample content. This usually clears within an hour; choose Ghost5 to try again.')
  assert.equal(LIVE_WORDS.sentence('ceiling', S), `Inflozo has asked Ghost5 for content ${REQUEST_CEILING} times since you opened this project and has stopped, so it never floods your site. Reload the page to start again; until then this page is showing sample content.`)
  assert.equal(LIVE_WORDS.unreadable('disconnected', S), 'Inflozo is no longer connected to Ghost5. Reconnect it from Sites to preview with its content.')
  assert.equal(LIVE_WORDS.unreadable('no_key', S), 'Inflozo has no Content API key for Ghost5. Add one in Sites, under Manage keys.')
  assert.equal(LIVE_WORDS.unreadable('http', S), "Ghost5's address starts with http://, and a browser won't read it from Inflozo's secure page.")
  assert.equal(LIVE_WORDS.nothing('tag', S), 'Ghost5 has no tags yet, so this page is previewing a sample tag.')
  assert.equal(LIVE_WORDS.nothing('author', S), 'Ghost5 has no authors yet, so this page is previewing a sample author.')
  assert.equal(LIVE_WORDS.capped, 'Showing your newest 100 posts.')
  assert.equal(LIVE_WORDS.pasteOlder, "Paste an older post's address to link it.")
  assert.equal(LIVE_WORDS.showing(S), 'Previewing with Ghost5.')
  assert.equal(LIVE_WORDS.showingSample, 'Previewing with sample content.')
  assert.equal(LIVE_WORDS.toSample, 'Preview with sample content')
  // the numbers in them are the module's own, never restated
  assert.equal(FAILURES_TO_STOP, 3)
  assert.equal(LIST_LIMIT, 100)
})

// ─── Story 5.19 — the INSTANCE's queries: folded, read once per distinct query, and sized by the project ──────────

test('Story 5.19 · each section\'s FOLDED queries are read once per distinct query — two sections asking alike share one request', () => {
  const asked: LiveQuery[] = []
  const look = (q: LiveQuery): Answer | undefined => {
    asked.push(q)
    return undefined
  }
  const declared = { latest: { source: 'posts', limit: 3, order: 'published_at desc' } }
  const tagged = withData(declared, { latest: { source: 'tag', tag: 'craft' } })
  const feed = { posts: feedQuery({ bindingContext: ['posts'] }, { isMainFeed: false, data: { posts: { source: 'featured' } } }, 'home.hbs', 12)! }
  const view = page('home.hbs', null, look, { a: tagged, b: tagged, c: feed })
  assert.ok('need' in view)
  const keys = view.need.map(keyOf)
  assert.equal(new Set(keys).size, keys.length, 'the page lists each read once')
  // the folded tag query is ONE read per date order, shared by both sections, and carries its quoted filter and include
  const tag = view.need.filter((q) => q.params['filter'] === "tag:'craft'")
  assert.deepEqual(tag.map((q) => q.params['order']).sort(), ['published_at asc', 'published_at desc'])
  assert.ok(tag.every((q) => q.params['include'] === 'tags,authors' && q.params['formats'] === 'mobiledoc'))
  assert.ok(view.need.some((q) => q.params['filter'] === 'featured:true'), 'the secondary feed\'s own query is asked')
  assert.ok(asked.length > 0)
  // a hand-picked list is ONE `filter=id:[…]` read, and a pick not in Ghost's id shape is never sent
  const picks = withData(declared, { latest: { source: 'picked', picks: [{ id: '6a86b5fb6444934864da3283', title: 'a' }, { id: 'nope', title: 'b' }] } })
  assert.deepEqual(bindingReads(picks['latest']!).newest?.params['filter'], 'id:[6a86b5fb6444934864da3283]')
})

test('Story 5.19 · the main feed is sized by the PROJECT\'s posts_per_page on the site, as on the sample — a value other than 12', () => {
  const three = page('home.hbs', null, fakeSite(), {}, 3)
  assert.ok('ready' in three)
  const ctx = three.ready.contexts['home.hbs']!
  assert.equal((ctx.ghost['posts'] as unknown[]).length, 3)
  assert.deepEqual(ctx.ghost['@config'], { posts_per_page: 3 })
  assert.equal((ctx.ghost['pagination'] as { limit: number }).limit, 3)
  // the control: the sample at the same size
  assert.equal((orbitWeekly.templateContext('home.hbs', 'first', undefined, 3).ghost['posts'] as unknown[]).length, 3)
})
