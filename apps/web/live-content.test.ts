import { test } from 'node:test'
import assert from 'node:assert/strict'
import { orbitWeekly, PAYWALL_TARGET } from '@inflozo/library'
import { feedQuery, formatDate, withData } from '@inflozo/section-runtime'
import {
  addressOf, after, API_VERSION, ask, AUTHOR_FIELDS, bindingReads, FAILURES_TO_STOP, feedRead, feedShortfall, FRESH_MS,
  getShortfall, isFresh, keyOf, LIST_LIMIT, LISTS, LIVE_WORDS, named, NEVER, outcomeOf, PAGE_FIELDS, PAYWALL_FILE, pick, POST_FIELDS, PUBLIC_TIERS,
  READ_TIMEOUT_MS, reader, REQUEST_CEILING, retriable, retried, SEARCH_DEBOUNCE_MS, SEARCH_LIMIT, SEARCH_SHARE, SEARCH_TERM, searchRead,
  searchSpent, SETTINGS, SHORTFALL, SITE_FIELDS, siteFrom, siteLinks, siteWith,
  siteRows, siteTotal, slugShaped, START, startingArchive, subjectRead, TAG_FIELDS, TIER_FIELDS, wallClock, withFound, zoneOf,
  searchFor, searchInForce, type Answer, type LiveQuery, type Look, type Reading, type Row,
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
  assert.equal(binding.newest[0]?.params['formats'], 'mobiledoc')
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
  // DW-258: ONE grammar, the library's — an import keeps `--` and edge hyphens, and nothing past Latin-1 survives slugify
  for (const ok of ['archive', 'field-notes', 'ten-years-of-one-layout', 'café', 'a1', '2026', 'a--b', '-lead', 'trail-', 'x'.repeat(191)]) assert.ok(slugShaped(ok), ok)
  for (const bad of ['', 'Bad', 'two words', "a'b", 'x:y', 'a+b', 'a,b', '[x]', 'x'.repeat(192), '中文', 'ā']) {
    assert.equal(slugShaped(bad), false, bad)
    assert.equal(subjectRead({ kind: 'post', slug: bad }), null, bad)
    assert.equal(feedRead({ kind: 'tag', slug: bad }, 1, 12), null, bad)
  }
  // a shaped one is QUOTED — the exact form MEASUREMENTS §51 executed on both majors — and is a browse, never a read by slug
  assert.equal(subjectRead({ kind: 'tag', slug: 'craft' })?.params['filter'], "slug:'craft'")
  assert.equal(feedRead({ kind: 'author', slug: 'umang' }, 2, 12)?.params['filter'], "authors:'umang'")
  assert.equal(feedRead(null, 2, 12)?.params['page'], '2')
})

test('a `{{#get}}` is read at the Count\'s ceiling in both date orders; a fixed query as it is; a pick as `id:[…]` reads', () => {
  const dated = bindingReads({ source: 'posts', filter: 'featured:true', limit: 3 })
  assert.equal(dated.newest[0]?.params['limit'], String(LIST_LIMIT))
  assert.equal(dated.newest[0]?.params['order'], 'published_at desc')
  assert.equal(dated.oldest[0]?.params['order'], 'published_at asc')
  assert.equal(dated.newest[0]?.params['filter'], 'featured:true')
  const fixed = bindingReads({ source: 'posts', limit: 1, order: 'published_at desc', fixed: true })
  assert.equal(fixed.newest[0]?.params['limit'], '1')
  assert.equal(keyOf(fixed.newest[0] as LiveQuery), keyOf(fixed.oldest[0] as LiveQuery))
  const a = '5ab100000000000000000001'
  const b = '5ab100000000000000000002'
  const picked = bindingReads({ source: 'posts', ids: [b, 'not-an-id', a] })
  assert.equal(picked.newest[0]?.params['filter'], `id:[${a},${b}]`, 'an id not in Ghost\'s shape is never sent')
  assert.equal(picked.newest.length, 1, 'picks within LIST_LIMIT are ONE read (DW-259 chunks past it)')
  // Story 5.19: the ids are read SORTED — Ghost's own order is re-ordered by the pick below, so a pick moved to a new
  // place asks for the very same key and costs no request
  assert.equal(keyOf(bindingReads({ source: 'posts', ids: [a, b] }).newest[0] as LiveQuery), keyOf(picked.newest[0] as LiveQuery))
  assert.deepEqual(bindingReads({ source: 'posts', ids: ['nope'] }), { newest: [], oldest: [] }, 'nothing to send is no read at all')
  assert.equal(bindingReads({ source: 'tags' }).newest[0]?.params['include'], 'count.posts')
  // R-20: Ghost answers a pick in ITS order (§51 (h)) — the rows come back in the PICK's, and a missing id is skipped
  const look = (q: LiveQuery): Answer | undefined =>
    q.params['filter']?.startsWith('id:') ? { rows: [{ id: a, title: 'A' }, { id: b, title: 'B' }], total: 2, pages: 1 } : undefined
  const rows = siteRows({ picks: { source: 'posts', ids: [b, 'gone0000000000000000000', a] } }, reader(look), 'Etc/UTC')
  assert.deepEqual(rows['picks']?.newest.map((r) => r['id']), [b, a])
})

test('DW-259 · a hand-picked list past LIST_LIMIT is read in chunks of it, each its own key — every pick comes back, in PICK order', () => {
  // 150 distinct picks in an order no sort gives, and one picked twice (the theme's per-id gets draw it twice too)
  const id = (n: number) => `5ab1${String(n).padStart(20, '0')}`
  const distinct = Array.from({ length: LIST_LIMIT + 50 }, (_, i) => id((i * 37) % (LIST_LIMIT + 50)))
  const ids = [...distinct, distinct[7] as string]
  /** Ghost: a read answers at most LIST_LIMIT rows (6's `maxLimit`), in ITS order — not the pick's */
  const asked = new Map<string, LiveQuery>()
  const ghost = (q: LiveQuery): Answer => {
    const want = /^id:\[(.*)\]$/.exec(q.params['filter'] ?? '')?.[1]?.split(',') ?? []
    return { rows: want.toSorted().reverse().slice(0, Math.min(LIST_LIMIT, Number(q.params['limit']))).map((i) => ({ id: i, title: i })), total: want.length, pages: 1 }
  }
  const look = (q: LiveQuery): Answer | undefined => {
    asked.set(keyOf(q), q)
    return ghost(q)
  }
  const b = { source: 'posts', ids }
  assert.deepEqual(siteRows({ picks: b }, reader(look), 'Etc/UTC')['picks']?.newest.map((r) => r['id']), ids, 'all of them, in the pick\'s order')
  assert.equal(siteTotal(b, reader(look)), ids.length)
  // the reads: de-duplicated, sorted and chunked — so ceil(150 / LIST_LIMIT) of them, none asking past LIST_LIMIT ids
  const chunks = [...asked.values()].map((q) => /^id:\[(.*)\]$/.exec(q.params['filter'] ?? '')?.[1]?.split(',') ?? [])
  assert.equal(chunks.length, Math.ceil(distinct.length / LIST_LIMIT))
  assert.ok(chunks.every((c) => c.length <= LIST_LIMIT))
  assert.deepEqual(chunks.flat(), distinct.toSorted(), 'each id once, sorted — a pick dragged to a new place asks for the same keys')
  // a chunk not landed: no rows are known and nothing counts yet — and the walk asks for exactly what is missing
  const late = keyOf([...asked.values()][1] as LiveQuery)
  const half = reader((q) => (keyOf(q) === late ? undefined : ghost(q)))
  assert.equal(siteTotal(b, half), 0, 'siteTotal is 0 until every chunk has landed')
  assert.deepEqual(half.need.map(keyOf), [late])
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
    assert.equal(s.version(), 0, 'Story 5.23a: nothing written yet')
    await Promise.all([s.ensure([SETTINGS]), s.ensure([SETTINGS])])
    assert.equal(net.calls.length, 1, 'two consumers, one key: one request')
    assert.equal(s.version(), 1, 'Story 5.23a: a read that lands is one more answer in hand — the canvas repaints on it')
    clock += FRESH_MS - 1
    await s.ensure([SETTINGS])
    assert.equal(net.calls.length, 1, 'fresh: no request')
    assert.equal(s.version(), 1, 'a fresh hit writes nothing')
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
    assert.equal(s.version(), 2, 'Story 5.23a: a background revalidation that lands counts too — "the next paint shows it"')
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
    assert.equal(s.version(), 1, 'Story 5.23a: a failed read writes nothing, so nothing repaints for it')
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

// ─── DW-248 (Story 5.24e) — a title search AT GHOST while the posts list is capped ───────────────────────────────

test('DW-248 · a search is ONE `title:~` read per term: trimmed, its quotes escaped as nql-lang\'s STRING token reads them, and the order ALWAYS sent', () => {
  const q = searchRead('posts', `  it's "quoted" \\ slug:[a,b]  `)
  assert.equal(q?.resource, 'posts')
  // `['](\\['"]|[^'"])+?[']` (nql-lang 0.6.3 and 0.7.0): inside the string a quote is a backslash and the quote; an
  // unescaped one ends it, and the rest is a 400 that Ghost counts against the customer's own network
  assert.equal(q?.params['filter'], `title:~'it\\'s \\"quoted\\" \\ slug:[a,b]'`)
  // ALWAYS an order: sent none, Ghost 5's `slugFilterOrder` turns the `slug:[…]` it finds anywhere in a filter — inside
  // the term too — into raw SQL (`input/posts.js:94-97`)
  assert.equal(q?.params['order'], 'published_at desc')
  assert.equal(q?.params['limit'], String(SEARCH_LIMIT))
  assert.equal(q?.params['formats'], 'mobiledoc', 'never the body')
  assert.equal(SEARCH_LIMIT, 15, 'the spec\'s number of rows a search brings')
  // each term is its own key, the trimmed term's
  assert.equal(keyOf(searchRead('posts', 'ghost') as LiveQuery), keyOf(searchRead('posts', '  ghost ') as LiveQuery))
  assert.notEqual(keyOf(searchRead('posts', 'ghost') as LiveQuery), keyOf(searchRead('posts', 'ghosts') as LiveQuery))
})

test('DW-248 · the bounds: a term under 2 characters or over 100 is no read at all — counted in characters, after the trim', () => {
  const { min, max } = SEARCH_TERM
  assert.deepEqual({ min, max }, { min: 2, max: 100 }, 'the spec\'s bounds')
  for (const t of ['', '   ', 'a', ` ${'x'.repeat(min - 1)}  `, 'x'.repeat(max + 1), '😀']) assert.equal(searchRead('posts', t), null, JSON.stringify(t))
  for (const t of ['x'.repeat(min), 'x'.repeat(max), ` ${'x'.repeat(max)} `, '😀😀', `${"'".repeat(max)}`]) assert.ok(searchRead('posts', t) !== null, JSON.stringify(t))
})

test('DW-248 · searches have their own share of the ceiling: past SEARCH_SHARE a search does not go out, nothing stops, and the canvas reads on', async () => {
  assert.equal(SEARCH_SHARE, REQUEST_CEILING / 5)
  assert.equal(SEARCH_DEBOUNCE_MS, 300, 'a tuning, stated in the spec')
  const s = searchRead('posts', 'ghost') as LiveQuery
  let r: Reading = START
  for (let n = 0; n < SEARCH_SHARE; n++) {
    assert.equal(searchSpent(r), false)
    const turn = ask(r, s)
    assert.equal(turn.go, true)
    r = after(turn.reading, 'ok')
  }
  assert.equal(searchSpent(r), true)
  assert.deepEqual(ask(r, s), { go: false, reading: r }, 'the share is spent: no search goes out, and reading does not stop')
  assert.equal(ask(r, LISTS.post).go, true, 'the canvas\'s own reads still go')
  assert.equal(ask(r).go, true)
  // through the store: a search costs one request and is cached under its own key — and, its rows being in no render
  // context, it writes nothing the canvas repaints for (`version()`)
  const net = fakeFetch(() => ({ status: 200, body: postsBody(2) }))
  try {
    const store = liveStore('https://ghost5.example', 'k', Date.now, words)
    await store.ensure([s])
    assert.equal(net.calls.length, 1)
    assert.equal(net.calls[0]?.searchParams.get('filter'), "title:~'ghost'")
    assert.equal(store.peek(s)?.rows.length, 2)
    assert.equal(store.reading().searches, 1)
    assert.equal(store.version(), 0, 'a search landing repaints nothing')
    await store.ensure([LISTS.post])
    assert.equal(store.version(), 1, 'the control: a list landing does')
  } finally {
    net.restore()
  }
})

test('DW-248 · the share counts searches left to SEND: the one that spends it is still sent, and its rows are kept', () => {
  const q = searchRead('posts', 'zed') as LiveQuery
  const found: Answer = { rows: [], total: 0, pages: 1 }
  const none: Look = () => undefined
  const landed: Look = (x) => (keyOf(x) === keyOf(q) ? found : undefined)
  const left: Reading = { ...START, searches: SEARCH_SHARE - 1 }
  assert.deepEqual(searchFor(none, left, 'zed', true), q, 'one search left: it is sent')
  const spent: Reading = ask(left, q).reading
  assert.equal(searchSpent(spent), true)
  assert.deepEqual(searchFor(landed, spent, 'zed', true), q, 'the search that spent the share: its answer is in hand, and KEPT')
  assert.equal(searchFor(none, spent, 'zed', true), null, 'past the share, a new term is no read')
  assert.equal(searchFor(landed, left, 'zed', false), null, 'a list that is not capped is never searched at Ghost')
  assert.equal(searchFor(none, left, 'z', true), null, 'nor is a term under the bounds')
})

test('DW-248 · the capped line steps aside only for a search that is coming or has come — never one that settled with nothing', () => {
  const q = searchRead('posts', 'zed') as LiveQuery
  const none: Look = () => undefined
  const landed: Look = (x) => (keyOf(x) === keyOf(q) ? { rows: [], total: 0, pages: 1 } : undefined)
  assert.equal(searchInForce(none, START, q, null), true, 'pending: about to be sent, or in flight')
  assert.equal(searchInForce(landed, START, q, keyOf(q)), true, 'landed, whatever settled before')
  assert.equal(searchInForce(none, START, q, keyOf(q)), false, 'settled with no answer: the line comes back')
  assert.equal(searchInForce(none, { ...START, stopped: 'failing' }, q, null), false, 'reading stopped: nothing will land')
  assert.equal(searchInForce(none, START, null, null), false, 'no search at all')
})

test('DW-248 · the rows a search found join the posts list in hand BY ID — the list\'s own first, none twice — for every reader of the list', () => {
  const p = (id: string, day: string) => ({ id, slug: `s-${id}`, title: `T ${id}`, url: `https://ghost5.example/${id}/`, published_at: `2026-0${day}T00:00:00.000Z` })
  const list: Answer = { rows: [p('a', '9-02'), p('b', '9-01')], total: 250, pages: 3 }
  const found: Answer = { rows: [p('b', '9-01'), p('z', '1-05')], total: 2, pages: 1 }
  const q = searchRead('posts', 'zed') as LiveQuery
  const look = (x: LiveQuery): Answer | undefined => (keyOf(x) === keyOf(LISTS.post) ? list : keyOf(x) === keyOf(q) ? found : undefined)
  const merged = withFound(look, q)
  assert.deepEqual(merged(LISTS.post)?.rows.map((r) => r['id']), ['a', 'b', 'z'])
  assert.equal(merged(LISTS.post)?.total, 250, 'the site\'s own count stands — the list is still capped')
  // D5e's subjects, the Link Picker's posts and the pickers' rows all read the list through a `Look`
  assert.deepEqual(subjectOptions(siteSubjects(merged, 'Etc/UTC'), 'post').slice(1).map((r) => r.slug), ['s-a', 's-b', 's-z'])
  assert.deepEqual(siteLinks(reader(merged), 'Etc/UTC').posts.map((r) => r.id), ['a', 'b', 'z'])
  // no search, or one not landed: the list exactly as it is; every other read passes through untouched
  assert.equal(withFound(look, null)(LISTS.post), list)
  assert.equal(withFound(look, searchRead('posts', 'not landed'))(LISTS.post), list)
  assert.equal(merged(q), found)
  assert.equal(merged(LISTS.tag), undefined)
  // the chosen subject's own read joins too, once — so a post picked from a search keeps its row (D5e's pill label)
  const own = subjectRead({ kind: 'post', slug: 's-z' }) as LiveQuery
  const subjectToo = (x: LiveQuery): Answer | undefined => (keyOf(x) === keyOf(own) ? { rows: [p('z', '1-05')], total: 1, pages: 1 } : look(x))
  assert.deepEqual(withFound(subjectToo, q, own)(LISTS.post)?.rows.map((r) => r['id']), ['a', 'b', 'z'])
  assert.deepEqual(withFound(subjectToo, null, own)(LISTS.post)?.rows.map((r) => r['id']), ['a', 'b', 'z'])
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
  // DW-270: a post's or a page's `tiers` is a RELATION, mapped as tags and authors are — through TIER_FIELDS, held to the
  // dataset's tier row just above — and none of their FIELDS; the dataset's entries carry none, so the lists the two
  // lines before drop hide nothing
  for (const fields of [POST_FIELDS, PAGE_FIELDS]) assert.ok(!(fields as readonly string[]).includes('tiers'))
  for (const entry of [orbitWeekly.subject('post'), orbitWeekly.subject('page'), ...orbitWeekly.posts()]) assert.equal(Object.hasOwn(entry, 'tiers'), false)
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

/** DW-250 — THE EDITOR'S `request()` LOOP over a cache this test fills: each round asks, at once, every read the walk
 *  still needs — on the first, beside the surfaces the editor always asks (`SURFACES`: the settings and the lists) —
 *  the next walk reads them, and the page paints once a walk misses nothing. The count is the round trips before the
 *  first paint. A read asked twice is the editor's "did not answer" and fails here. */
function rounds(file: string, stored: orbitWeekly.Subject | null, site = fakeSite()) {
  const cache = new Map<string, Answer | undefined>()
  const peek: Look = (q) => cache.get(keyOf(q))
  for (let n = 0; n < 5; n++) {
    const view = sitePage(peek, { file, stored, page: 1, pageFile: file, targets: [file, 'default.hbs'], queries: {}, perPage: orbitWeekly.postsPerPage() })
    if (!('need' in view)) return { n, view }
    const ask = new Map((n === 0 ? [...view.need, SETTINGS, ...Object.values(LISTS)] : view.need).map((q) => [keyOf(q), q]))
    for (const [k, q] of ask) {
      assert.ok(!cache.has(k), `round ${n + 1} asks ${k} again`)
      cache.set(k, site(q))
    }
  }
  assert.fail(`${file} never painted`)
}

test('DW-250 · a stored Tag or Author paints after ONE round trip, as Home and a stored Post do — a gone one after two', () => {
  assert.equal(rounds('home.hbs', null).n, 1)
  assert.equal(rounds('post.hbs', { kind: 'post', slug: 'post-2', source: 'site' }).n, 1)
  // the stored subject is the likely answer while R-193's list is in flight: its own row and its archive's first page
  // are asked in the same round as the list (three rounds at 5.24d's HEAD)
  for (const [file, stored] of [['tag.hbs', { kind: 'tag', slug: 'archive', source: 'site' }], ['author.hbs', { kind: 'author', slug: 'umang', source: 'site' }]] as const) {
    const at = rounds(file, stored)
    assert.equal(at.n, 1, file)
    assert.ok('ready' in at.view)
    assert.deepEqual({ slug: at.view.ready.subject?.slug, fellBack: at.view.ready.fellBack }, { slug: stored.slug, fellBack: false }, file)
  }
  // a stored tag the site no longer holds: the guess costs its `200 []` reads, then the fullest tag's page — two rounds
  const gone = rounds('tag.hbs', { kind: 'tag', slug: 'deleted-tag', source: 'site' })
  assert.equal(gone.n, 2)
  assert.ok('ready' in gone.view)
  assert.deepEqual({ slug: gone.view.ready.subject?.slug, fellBack: gone.view.ready.fellBack }, { slug: 'craft', fellBack: true })
  // `{ nothing }` is judged once the subject is resolved, never on the guess
  assert.deepEqual(rounds('tag.hbs', { kind: 'tag', slug: 'archive', source: 'site' }, fakeSite({ tags: false })).view, { nothing: 'tag' })
  // the control: an untouched Tag cannot guess, so it still waits on R-193's list first
  assert.equal(rounds('tag.hbs', null).n, 2)
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

test('Story 5.21: the site as the editor is handed it — the snapshot Ghost\'s surfaces are drawn from on every site that is not disconnected, the members record where there is one', () => {
  const settings = {
    members: { signup_access: 'all', paid_enabled: true },
    announcement: { content: '<p>Hi</p>', background: 'accent', visibility: '["visitors"]' },
    portal_button: true,
    brand: { accent: '#3832e5' },
  }
  const readable = { title: 'Ghost6', origin: 'https://ghost6.example', key: 'k' }
  const handed = siteWith(readable, settings)
  assert.ok(handed !== null && 'origin' in handed)
  assert.deepEqual(handed.members, { signup_access: 'all', paid_enabled: true })
  assert.deepEqual(handed.surfaces?.announcement, { content: '<p>Hi</p>', background: 'accent', visibility: ['visitors'] })
  assert.equal(handed.surfaces?.portal.button, true)
  // a connected site the browser cannot read — no key, plain http — still has its snapshot: it is the connection's
  for (const why of ['no_key', 'http'] as const) assert.ok(siteWith({ title: 'x', unreadable: why }, settings)?.surfaces !== undefined, why)
  // a disconnected site is no connection: no snapshot, so no shim — the members record still travels, as before
  const gone = siteWith({ title: 'x', unreadable: 'disconnected' }, settings)
  assert.ok(gone !== null && gone.surfaces === undefined && gone.members !== undefined)
  // no linked site is null; a site with no members record carries none
  assert.equal(siteWith(null, settings), null)
  assert.equal(siteWith(readable, {})?.members, undefined)
  assert.ok(siteWith(readable, {})?.surfaces !== undefined, 'a snapshot with nothing in it is still handed — it draws nothing')
  // DW-273 (Story 5.24e): the site row's `ghost_version` reaches `major` through `versionVerdict` — the Paywall's untouched
  // box is the linked site's own; a version not yet read, or none the canvas has a recording of, draws 6's
  assert.equal(siteWith(readable, settings, '5.130.6')?.major, '5')
  assert.equal(siteWith(readable, settings, '6.58.0')?.major, '6')
  for (const unknown of [null, undefined, '', 'nonsense', '4.48.0', '7.0.0']) assert.equal(siteWith(readable, settings, unknown)?.major, undefined, String(unknown))
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
  // a hand-picked list within LIST_LIMIT is ONE `filter=id:[…]` read, and a pick not in Ghost's id shape is never sent
  const picks = withData(declared, { latest: { source: 'picked', picks: [{ id: '6a86b5fb6444934864da3283', title: 'a' }, { id: 'nope', title: 'b' }] } })
  assert.deepEqual(bindingReads(picks['latest']!).newest[0]?.params['filter'], 'id:[6a86b5fb6444934864da3283]')
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


test('Story 5.20 · the paywall\'s partial: the style-guide article at the ROOT as a paid post open to the site\'s public paid tiers, access by the visitor — and the one tiers read, made there alone', () => {
  // the library's target, imported since DW-258 (Story 5.24e) — one spelling, still asserted
  assert.equal(PAYWALL_FILE, PAYWALL_TARGET)
  assert.deepEqual(PUBLIC_TIERS, { resource: 'tiers', params: { filter: 'visibility:public' } })
  const base = fakeSite()
  const tiersBody = { tiers: [
    { id: 'f', name: 'Free', slug: 'free', type: 'free', visibility: 'public', active: true },
    { id: 'g', name: 'Ghost5', slug: 'ghost5', type: 'paid', visibility: 'public', active: true },
  ] }
  const asked: string[] = []
  const look = (q: LiveQuery): Answer | undefined => {
    asked.push(keyOf(q))
    return q.resource === 'tiers' ? (pick('tiers', tiersBody, words) ?? undefined) : base(q)
  }
  const at = (visitor: 'anonymous' | 'free' | 'paid') =>
    sitePage(look, { file: PAYWALL_FILE, stored: null, page: 1, pageFile: PAYWALL_FILE, targets: [PAYWALL_FILE], queries: {}, perPage: 12, visitor })
  const anon = at('anonymous')
  assert.ok('ready' in anon)
  const ctx = anon.ready.contexts[PAYWALL_FILE]!.ghost
  assert.equal(ctx['slug'], orbitWeekly.subject('post').slug, 'the body is the style-guide fixture, never a real post (FR-H4)')
  assert.equal(ctx['visibility'], 'paid')
  assert.equal(ctx['access'], false)
  assert.deepEqual((ctx['tiers'] as { slug: string }[]).map((t) => t.slug), ['ghost5'], 'open to the PAID public tiers — the free one is no tier a paid post is open to')
  assert.ok(asked.includes(keyOf(PUBLIC_TIERS)))
  for (const [visitor, access] of [['free', false], ['paid', true]] as const) {
    const v = at(visitor)
    assert.ok('ready' in v)
    assert.equal(v.ready.contexts[PAYWALL_FILE]!.ghost['access'], access, visitor)
  }
  // and no other page asks for the tiers
  asked.length = 0
  page('home.hbs', null, look)
  assert.ok(asked.length > 0 && !asked.includes(keyOf(PUBLIC_TIERS)))
})

test('DW-270 · a `tiers` post: the reads Ghost re-checks per visitor ask for its tiers, the whitelist keeps them through TIER_FIELDS, and the paid visitor reads it whole', () => {
  // Ghost's relation sends a tier's WHOLE row (`products.*`, `models/post.js:140-148`); the mapper keeps a `tiers` post's
  // PAID tiers (`mappers/posts.js:68-70` on 5, `:86-88` on 6) — and sends `tiers` only to a read that asked for them
  const tier = {
    id: 't-pro', name: 'Pro', slug: 'pro', type: 'paid', active: true, visibility: 'public', description: null, monthly_price: 500,
    yearly_price: 5000, currency: 'usd', trial_days: 0, welcome_page_url: '/welcome/', monthly_price_id: 'price_m', yearly_price_id: 'price_y',
  }
  const tiered = { id: 'p9', slug: 'tiered', title: 'Tiered', url: 'https://ghost5.example/tiered/', published_at: '2026-09-09T12:00:00.000Z', visibility: 'tiers' }
  const base = fakeSite()
  const look = (q: LiveQuery): Answer | undefined => {
    // the stored post's own read, and Home's feed: the one `tiers` post, its tiers where the read asked for them
    if (q.resource !== 'posts' || !(q.params['filter'] === "slug:'tiered'" || (q.params['filter'] === undefined && q.params['page'] === '1'))) return base(q)
    const sent = (q.params['include'] ?? '').split(',').includes('tiers')
    return pick('posts', { posts: [{ ...tiered, ...(sent ? { tiers: [tier] } : {}) }], meta: { pagination: { total: 1, pages: 1 } } }, words) ?? undefined
  }
  const at = (file: 'post.hbs' | 'home.hbs', visitor: 'anonymous' | 'free' | 'paid') =>
    sitePage(look, { file, stored: file === 'post.hbs' ? { kind: 'post', slug: 'tiered', source: 'site' } : null, page: 1, pageFile: file, targets: [file], queries: {}, perPage: 12, visitor })
  for (const [visitor, access] of [['paid', true], ['free', false], ['anonymous', false]] as const) {
    const post = at('post.hbs', visitor)
    assert.ok('ready' in post)
    assert.equal(post.ready.contexts['post.hbs']?.ghost['access'], access, `${visitor} on the post's own canvas`)
    const home = at('home.hbs', visitor)
    assert.ok('ready' in home)
    assert.equal((home.ready.contexts['home.hbs']?.ghost['posts'] as Row[])[0]?.['access'], access, `${visitor} in Home's feed`)
  }
  // the include rides exactly the reads `assemble`'s `seen()` re-reads `access` over — the subject's own row and a list page
  for (const q of [subjectRead({ kind: 'post', slug: 'x' }), subjectRead({ kind: 'page', slug: 'x' }), feedRead(null, 1, 12), feedRead({ kind: 'tag', slug: 'x' }, 2, 12)]) {
    assert.equal(q?.params['include'], 'tags,authors,tiers', keyOf(q as LiveQuery))
  }
  assert.equal(subjectRead({ kind: 'tag', slug: 'x' })?.params['include'], 'count.posts', 'a taxonomy has no tiers')
  // …and not a `{{#get}}`'s, which no visitor re-reads and which stays the theme's own `POSTS_INCLUDE` (no shim re-record)
  assert.equal(bindingReads({ source: 'posts', limit: 3 }).newest[0]?.params['include'], 'tags,authors')
  // the whitelist: through TIER_FIELDS, as a tag's and a writer's are — `monthly_price_id` and the rest dropped
  const row = pick('posts', { posts: [{ ...tiered, tiers: [tier] }] }, words)?.rows[0] as Row
  assert.deepEqual(row['tiers'], [Object.fromEntries(TIER_FIELDS.filter((f) => Object.hasOwn(tier, f)).map((f) => [f, (tier as Record<string, unknown>)[f]]))])
  for (const dropped of ['monthly_price_id', 'yearly_price_id', 'welcome_page_url']) assert.ok(!JSON.stringify(row).includes(dropped), dropped)
  // a row Ghost sent no tiers for carries none — the rule then blocks it, as Ghost's own `!post.tiers` does
  assert.equal(Object.hasOwn(pick('posts', { posts: [tiered] }, words)?.rows[0] ?? {}, 'tiers'), false)
})
