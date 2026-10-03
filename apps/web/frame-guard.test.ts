import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { NextRequest } from 'next/server.js'

// DW-117, DW-162 — THE THREE FRAME ROUTES, CALLED RATHER THAN READ. Each is a route handler beside its page and outside
// the `(authed)` layout, so its own first line is its only guard; until Story 5.24d the tests read that line back as text.
// Here each `GET` is called with a real `NextRequest`, signed out and signed in.
//
// THE ONLY TEST THAT REGISTERS A MODULE HOOK, and why: a route is written for Next's bundler. `next` ships no `exports`
// map, so a bare `next/server` does not resolve under Node (its `server.js` does), and `@/` is tsconfig's alias, not
// Node's. The hook maps exactly those names, and `@/lib/supabase/server` to THIS file, whose `currentUser` the tests set
// — `mock.module` resolves the name first and fails the same way.
let user: { id: string } | null = null
export const currentUser = async () => user

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'next/server') return nextResolve('next/server.js', context)
    if (specifier === '@/lib/supabase/server') return { url: import.meta.url, shortCircuit: true }
    if (specifier.startsWith('@/')) return { url: new URL(`./${specifier.slice(2)}.ts`, import.meta.url).href, shortCircuit: true }
    return nextResolve(specifier, context)
  },
})

const FILES: Record<string, string> = {
  '/app/controls/frame': './app/(app)/app/(authed)/controls/frame/route.ts',
  '/app/style-guide/frame': './app/(app)/app/(authed)/style-guide/frame/route.ts',
  '/app/canvas': './app/(app)/app/(authed)/canvas/route.ts',
}

// imported inside a test, never at the top level: each route imports this file back, and a top-level await on it would
// wait for itself
async function get(address: string, o: { nonce?: boolean } = {}): Promise<Response> {
  const url = new URL(address, 'http://localhost')
  const file = FILES[url.pathname]
  assert.ok(file, `no route file for ${url.pathname}`)
  const { GET } = await import(file)
  return GET(new NextRequest(url, { headers: o.nonce === false ? {} : { 'x-nonce': 'n' } }))
}

const as = async <T>(who: typeof user, run: () => Promise<T>) => {
  user = who
  try {
    return await run()
  } finally {
    user = null
  }
}

test('signed out, every frame route answers 303 to /sign-in', async () => {
  // each route's other branches too — a picture, one design, the variation sheet: the guard stands before all of them
  const asked = [...Object.keys(FILES), '/app/canvas?image=x', '/app/canvas?design=a1%2F1', '/app/controls/frame?image=x', '/app/style-guide/frame?view=variations']
  for (const path of asked) {
    const answer = await get(path)
    assert.equal(answer.status, 303, `${path} answered ${answer.status} to a stranger`)
    assert.ok(answer.headers.get('location')?.endsWith('/sign-in'), `${path} sent a stranger to ${answer.headers.get('location')}`)
  }
})

test('signed in, every frame route answers its document', async () => {
  await as({ id: 'someone' }, async () => {
    for (const path of Object.keys(FILES)) {
      const answer = await get(path)
      assert.equal(answer.status, 200, `${path} answered ${answer.status}`)
      assert.match(answer.headers.get('content-type') ?? '', /^text\/html/, path)
    }
  })
})

test('style-guide/frame serves both views, and refuses a request proxy.ts never stamped with a nonce', async () => {
  await as({ id: 'someone' }, async () => {
    const variations = await get('/app/style-guide/frame?view=variations')
    assert.equal(variations.status, 200)
    assert.match(await variations.text(), /data-variant=/, 'the variations view is not the variation sheet')
    const bare = await get('/app/style-guide/frame', { nonce: false })
    assert.equal(bare.status, 500, 'a document without a nonce would block every card script with no error anywhere')
  })
})

// DW-208 — the canvas route asked about its own caching: a unit row hands `canvasCaching` its `live` explicitly, so only
// a request through the route reaches the default the two routes rely on
test('the canvas route keeps a built document a year in production, and nothing outside it', async () => {
  const env = process.env as Record<string, string | undefined>
  const was = env.NODE_ENV
  // an `undefined` written into process.env is stored as the string "undefined", so an unset value is deleted
  const put = (mode: string | undefined) => (mode === undefined ? delete env.NODE_ENV : (env.NODE_ENV = mode))
  const caching = async (mode: string) => {
    put(mode)
    try {
      return (await as({ id: 'someone' }, () => get('/app/canvas?v=abc123'))).headers.get('cache-control')
    } finally {
      put(was)
    }
  }
  assert.equal(await caching('production'), 'private, max-age=31536000, immutable')
  assert.equal(await caching('development'), 'no-store')
})

// Story 6.2's review — THE ROUTE'S OWN ANSWERS for a pool face and a preset, which no check executed: lose the `?font=`
// branch and every canvas falls back to `serif` behind `font-display: swap` with every other test green
test('the canvas route serves a pool face as woff2, kept a year only under its own hash, and refuses a path, an unknown file and an unknown pack', async () => {
  const { POOL } = await import('@inflozo/library/packs')
  const { fontHref } = await import('./lib/style-pack.ts')
  const file = Object.values(POOL.faces)[0]?.files[0]
  assert.ok(file, 'the pool records no file, so this test proves nothing')
  const env = process.env as Record<string, string | undefined>
  const was = env.NODE_ENV
  env.NODE_ENV = 'production'
  try {
    await as({ id: 'someone' }, async () => {
      const face = await get(fontHref('/app/canvas')(file))
      assert.equal(face.status, 200)
      assert.equal(face.headers.get('content-type'), 'font/woff2')
      assert.equal(face.headers.get('x-content-type-options'), 'nosniff')
      assert.equal(face.headers.get('cache-control'), 'private, max-age=31536000, immutable')
      assert.equal(Buffer.from(await face.arrayBuffer()).subarray(0, 4).toString('latin1'), 'wOF2')
      // no hash, or another file's: served, never kept
      for (const h of ['', '&h=000000000000']) assert.equal((await get(`/app/canvas?font=${file.file}${h}`)).headers.get('cache-control'), 'no-store', h)
      for (const name of ['../x', '..%2F..%2Fpackage.json', 'nope.woff2', '']) assert.equal((await get(`/app/canvas?font=${name}`)).status, 404, name)
      const mono = await get('/app/canvas?pack=mono')
      assert.equal(mono.status, 200)
      assert.notEqual(await mono.text(), await (await get('/app/canvas')).text(), 'Mono was served as Paper')
      assert.equal((await get('/app/canvas?pack=harbor')).status, 404)
    })
  } finally {
    if (was === undefined) delete env.NODE_ENV
    else env.NODE_ENV = was
  }
})
