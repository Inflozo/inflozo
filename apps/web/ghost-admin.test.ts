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
