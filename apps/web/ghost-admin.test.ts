import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { AdminError } from './server/ghost-admin/admin-rule.ts'
import { fetchWithKey, store } from './server/ghost-admin/index.ts'

/* Story 3.1 (review) — the ORDER inside the chokepoint, proved without a pooler or a Ghost.
   With SUPABASE_DB_POOLER_URL unset, anything that reaches the store throws
   `credential_store_unavailable`, and anything that reaches the network throws
   `ghost_unreachable`; so a `credential_malformed` out of these two proves the refusal came
   BEFORE both. The round trip itself runs on the deployed site (R-82). */

delete process.env.SUPABASE_DB_POOLER_URL
const NIL = '00000000-0000-0000-0000-000000000000'

test('a malformed credential is refused before it can reach Vault', async () => {
  await assert.rejects(
    store({ siteId: NIL, userId: NIL, kind: 'admin', secret: 'not-a-ghost-key', route: 'test' }),
    (error: AdminError) => error.code === 'credential_malformed',
  )
})

test('a malformed credential is refused before the network, and is not reported as Ghost being down', async () => {
  await assert.rejects(
    fetchWithKey({ credential: 'not-a-ghost-key', siteUrl: 'https://ghost.example', path: 'config/', route: 'test' }),
    (error: AdminError) => error.code === 'credential_malformed',
  )
})

/* Story 7.18b (DW-378) — `fetchWithKey` USES its item's budget: until now only `timeoutFor`'s values were tested, so a call that
   kept the old flat 15 s would pass. The fetch is injected (the global, put back after) and so is the signal's timer, which
   records the budget each fetch is handed; the address is a public IP literal, so the resolver answers with no network. The
   audit row after the answer is refused here (no pooler), which the call reports — the budget was already seen. */
test('Story 7.18b (DW-378): the theme upload\'s fetch is handed two minutes, every other call fifteen seconds', async () => {
  const KEY = '6512a1b2c3d4e5f60718293a:' + 'ab'.repeat(32)
  const seen: number[] = []
  const original = AbortSignal.timeout
  const timeout = original.bind(AbortSignal)
  const realFetch = globalThis.fetch
  // the audit row after the answer must never reach a real database, whatever the shell holds (the Review)
  const pooler = process.env.SUPABASE_DB_POOLER_URL
  delete process.env.SUPABASE_DB_POOLER_URL
  AbortSignal.timeout = (ms: number) => (seen.push(ms), timeout(ms))
  globalThis.fetch = (async () => new Response('{"themes":[]}', { status: 200 })) as typeof fetch
  try {
    const form = new FormData()
    form.append('file', new Blob([new Uint8Array([80, 75, 5, 6])], { type: 'application/zip' }), 'inflozo-x.zip')
    const budget = async (args: { method: string; path: string; body?: unknown; item?: 'theme_upload' | 'theme_activate' }) => {
      seen.length = 0
      await fetchWithKey({ credential: KEY, siteUrl: 'https://93.184.215.14', route: 'test', major: 6, ...args }).catch(() => undefined)
      assert.equal(seen.length, 1, `${args.path}: one fetch, one signal`)
      return seen[0] as number
    }
    const upload = await budget({ method: 'POST', path: 'themes/upload/', body: form, item: 'theme_upload' })
    assert.ok(upload > 115_000 && upload <= 120_000, `upload: ${upload}`)
    const activate = await budget({ method: 'PUT', path: 'themes/inflozo-x/activate/', item: 'theme_activate' })
    assert.ok(activate > 10_000 && activate <= 15_000, `activate: ${activate}`)
    const read = await budget({ method: 'GET', path: 'site/' })
    assert.ok(read > 10_000 && read <= 15_000, `read: ${read}`)
  } finally {
    AbortSignal.timeout = original
    globalThis.fetch = realFetch
    if (pooler !== undefined) process.env.SUPABASE_DB_POOLER_URL = pooler
  }
})
