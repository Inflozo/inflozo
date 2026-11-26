import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

// STORY 7.23c's review — HISTORY'S REQUESTS, CALLED RATHER THAN READ. `history-requests.ts` is the one set the editor's drawer and the
// phone's Deploy history card both send through, and every journey reaches it through the harness's seams, which answer first — so
// its own fetch branches ran nowhere but the deployed walk. Here each request goes out against a stubbed `fetch` and its method,
// address and body are read back: a put-back is `act: 'live'` and only that, a check `act: 'check'`. The hook maps tsconfig's `@/`
// alias (Node's own resolver does not know it), as `frame-guard.test.ts`' does.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) return { url: new URL(`./${specifier.slice(2)}.ts`, import.meta.url).href, shortCircuit: true }
    return nextResolve(specifier, context)
  },
})

const PROJECT = '11111111-1111-4111-8111-111111111111'
const DEPLOY = '22222222-2222-4222-8222-222222222222'

type Sent = { url: string; method: string; body: unknown }

/** the requests `historyRequests` sends with no seams, each answered `status` with `body` */
async function sent(run: (h: Awaited<ReturnType<typeof requests>>) => Promise<unknown>, status = 200, body: unknown = {}): Promise<{ calls: Sent[]; answer: unknown }> {
  const calls: Sent[] = []
  const was = globalThis.fetch
  globalThis.fetch = (async (url: string, init: RequestInit = {}) => {
    calls.push({ url: String(url), method: init.method ?? 'GET', body: init.body === undefined ? undefined : JSON.parse(String(init.body)) })
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
  try {
    return { calls, answer: await run(await requests()) }
  } finally {
    globalThis.fetch = was
  }
}
const requests = async (prefix = '/app') => (await import('./components/editor/history-requests.ts')).historyRequests({ projectId: PROJECT, prefix })

test('7.23c review: History\'s requests — the read is a GET of the route; a put-back POSTs `act: \'live\'`, the check `act: \'check\'`, a pin `{ deploy, pinned }`, a restore `{ snapshot, captured, act: \'restore\' }` — each to the route under the caller\'s prefix', async () => {
  const route = `/app/projects/${PROJECT}/history`
  const read = await sent((h) => h.read(), 200, { linkedSiteId: null, liveVersion: null, rows: [], original: null })
  assert.deepEqual(read.calls, [{ url: route, method: 'GET', body: undefined }])
  assert.deepEqual(read.answer, { linkedSiteId: null, liveVersion: null, rows: [], original: null })

  const act = await sent((h) => h.act(DEPLOY), 200, { outcome: 'live' })
  assert.deepEqual(act.calls, [{ url: route, method: 'POST', body: { deploy: DEPLOY, act: 'live' } }], 'a put-back is act: live, and only that')
  const check = await sent((h) => h.check(DEPLOY), 200, { drift: null })
  assert.deepEqual(check.calls, [{ url: route, method: 'POST', body: { deploy: DEPLOY, act: 'check' } }], 'a check is act: check, never a put-back')

  const pin = await sent((h) => h.pin(DEPLOY, true))
  assert.deepEqual(pin.calls, [{ url: route, method: 'POST', body: { deploy: DEPLOY, pinned: true } }])
  const restore = await sent((h) => h.restore(DEPLOY, '2026-11-26T00:00:00.000Z'), 200, { outcome: 'live' })
  assert.deepEqual(restore.calls, [{ url: route, method: 'POST', body: { snapshot: DEPLOY, captured: '2026-11-26T00:00:00.000Z', act: 'restore' } }])

  // the prefix is the caller's (`isApp(pathname)`): on the app's own host the route has none
  const bare = await (await requests('')).liveHref('inflozo-x')
  assert.ok(bare.startsWith(`/projects/${PROJECT}/history/live`), bare)
  assert.ok((await (await requests()).liveHref('inflozo-x')).startsWith(`/app/projects/${PROJECT}/history/live`))
})

test('7.23c review: History\'s requests — a failed read answers null and a lost request is `failed`, never a throw', async () => {
  const read = await sent((h) => h.read(), 500)
  assert.equal(read.answer, null)
  const was = globalThis.fetch
  globalThis.fetch = (async () => { throw new TypeError('network') }) as typeof fetch
  try {
    const h = await requests()
    assert.equal(await h.read(), null)
    assert.deepEqual(await h.act(DEPLOY), { kind: 'failed' })
    assert.deepEqual(await h.check(DEPLOY), { kind: 'failed' })
  } finally {
    globalThis.fetch = was
  }
})
