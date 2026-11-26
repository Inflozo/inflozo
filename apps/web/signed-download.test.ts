// Story 7.23b (DW-391) — one way to follow a signed download (`lib/signed-download.ts`): the routes' two answers by `Accept`, and
// `followSigned` over a fake fetch — each failure a sentence for under the button, never the page. The routes' use of the helper is
// `deploy.test.ts`'; the four Downloads in the browser are journeys 7.23b (e).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BACKUP_WORDS } from './lib/deploy.ts'
import { followSigned, followsHere, signedAnswer, signInAnswer, SIGNED_WORDS, type FollowIo } from './lib/signed-download.ts'

const SIGNED = 'https://store.example/object/sign/site-snapshots/u/s/casper.zip?token=t'
const asked = (accept?: string) => new Request('https://app.inflozo.com/snapshots/x/download', accept === undefined ? {} : { headers: { accept } })

test('a route\'s signed URL: `200 { url }` to the follower (`Accept: application/json`), else the 303 a link follows — both never cached', async () => {
  const json = signedAnswer(asked('application/json'), SIGNED)
  assert.equal(json.status, 200)
  assert.deepEqual(await json.json(), { url: SIGNED })
  assert.equal(json.headers.get('cache-control'), 'no-store')
  for (const accept of [undefined, 'text/html,application/xhtml+xml,*/*;q=0.8']) {
    const link = signedAnswer(asked(accept), SIGNED)
    assert.equal(link.status, 303, `a link (${accept ?? 'no Accept'})`)
    assert.equal(link.headers.get('location'), SIGNED)
    assert.equal(link.headers.get('cache-control'), 'no-store')
  }
})

test('a route asked signed out: `401` to the follower, else the 303 to sign in (Story 2.5\'s) a link follows', async () => {
  const json = signInAnswer(asked('application/json'))
  assert.equal(json.status, 401)
  assert.equal(json.headers.get('location'), null)
  const link = signInAnswer(asked())
  assert.equal(link.status, 303)
  assert.equal(link.headers.get('location'), 'https://app.inflozo.com/sign-in')
})

/** a fake browser: the fetch's answer, what was asked, what was opened and logged */
function browser(answer: Partial<Awaited<ReturnType<FollowIo['fetch']>>> | Error) {
  const asks: { href: string; init: RequestInit }[] = []
  const opened: string[] = []
  const logs: [string, Record<string, number>][] = []
  const io: FollowIo = {
    fetch: async (href, init) => {
      asks.push({ href, init })
      if (answer instanceof Error) throw answer
      return { ok: false, status: 0, redirected: false, url: href, json: async () => null, ...answer }
    },
    open: (url) => void opened.push(url),
    log: (message, fields) => void logs.push([message, fields]),
  }
  return { io, asks, opened, logs }
}

test('followSigned: 200 `{ url }` opens the signed URL (an attachment — the page stays) and says nothing; it asks for JSON, never cached', async () => {
  const b = browser({ ok: true, status: 200, json: async () => ({ url: SIGNED }) })
  assert.equal(await followSigned('/app/snapshots/x/download', b.io), null)
  assert.deepEqual(b.opened, [SIGNED])
  assert.deepEqual(b.asks.map((a) => [a.href, (a.init.headers as Record<string, string>).accept, a.init.cache]), [['/app/snapshots/x/download', 'application/json', 'no-store']])
  assert.deepEqual(b.logs, [])
})

test('followSigned: each failure is one sentence for under the button, logged by status, and nothing is opened — 404 gone; 401 or a fetch sent on to `/sign-in` signed out; a 502, the network, or an answer with no URL couldn\'t prepare it', async () => {
  const cases: [Parameters<typeof browser>[0], string, number][] = [
    [{ status: 404 }, SIGNED_WORDS.gone, 404],
    [{ status: 401 }, SIGNED_WORDS.signedOut, 401],
    [{ ok: true, status: 200, redirected: true, url: 'https://app.inflozo.com/sign-in', json: async () => { throw new Error('html') } }, SIGNED_WORDS.signedOut, 200],
    [{ ok: true, status: 200, redirected: true, url: 'http://localhost:3000/app/sign-in' }, SIGNED_WORDS.signedOut, 200],
    [{ status: 502 }, SIGNED_WORDS.failed, 502],
    [new Error('offline'), SIGNED_WORDS.failed, 0],
    [{ ok: true, status: 200, json: async () => ({}) }, SIGNED_WORDS.failed, 200],
    [{ ok: true, status: 200, json: async () => { throw new Error('not json') } }, SIGNED_WORDS.failed, 200],
  ]
  for (const [answer, words, status] of cases) {
    const b = browser(answer)
    assert.equal(await followSigned('/x', b.io), words, JSON.stringify(answer instanceof Error ? answer.message : answer.status))
    assert.deepEqual(b.opened, [], 'the page stays: nothing opened')
    assert.deepEqual(b.logs, [['download: the signed link was not followed', { status }]])
  }
  // the control: a redirect that lands on the URL itself is not a sign-in
  const control = browser({ ok: true, status: 200, redirected: true, url: 'https://app.inflozo.com/sign-in-help', json: async () => ({ url: SIGNED }) })
  assert.equal(await followSigned('/x', control.io), null)
})

test('the words: three sentences in one list, and "Preparing…" the Backup step\'s own (R-170); a modified press is the browser\'s', () => {
  assert.equal(SIGNED_WORDS.preparing, BACKUP_WORDS.preparing)
  assert.equal(new Set([SIGNED_WORDS.gone, SIGNED_WORDS.signedOut, SIGNED_WORDS.failed]).size, 3)
  const press = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }
  assert.equal(followsHere(press), true)
  for (const k of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const) assert.equal(followsHere({ ...press, [k]: true }), false, k)
  assert.equal(followsHere({ ...press, button: 1 }), false)
})
