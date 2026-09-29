import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { SupabaseClient } from '@supabase/supabase-js'
import { contentKeyPatch, patchSite, rereadSettings, TRIES, type SettingsCall, type SiteRow } from './server/site-settings.ts'

/* STORY 5.24b — DW-65, DW-271, DW-272 and DW-84's second half, EXECUTED rather than read as source text.

   The fake below is a Supabase client over ONE stored row owned by user A, and it EVALUATES every `.eq()` the code under
   test writes — so a filter dropped from `site-settings.ts` changes what it answers, which is what makes each test here a
   control and not a restatement. `between` runs ahead of each conditional write: it is the second writer landing between
   the read and the write, which no live run can time. */

const A = 'a0000000-0000-4000-8000-00000000000a'
const B = 'b0000000-0000-4000-8000-00000000000b'
const SITE = '5170e000-0000-4000-8000-000000000001'

type Stored = SiteRow & { id: string; user_id: string; content_key: string | null }

function stored(over: Partial<Stored> = {}): Stored {
  return {
    id: SITE,
    user_id: A,
    site_settings: { public_url: 'https://ghost6.inflozo.com/' },
    credentials_present: { content: true, admin: true, staff: false },
    capability_source: 'probe',
    disconnected_at: null,
    updated_at: '2026-09-29T12:00:00.000000+00:00',
    content_key: 'old-content-key',
    ...over,
  }
}

function fakeAdmin(row: Stored, between?: (row: Stored, write: number) => void) {
  let clock = 0
  const writes = { attempted: 0 }
  // `sites_touch`: every write that lands moves `updated_at`, as the trigger does.
  const touch = () => {
    row.updated_at = new Date(Date.UTC(2026, 8, 29, 12, 0, 1 + clock++)).toISOString()
  }
  const chain = (values?: Record<string, unknown>) => {
    const filters: [string, unknown][] = []
    const matches = () => filters.filter(([column]) => column !== '__select').every(([column, value]) => (row as Record<string, unknown>)[column] === value)
    const self = {
      eq(column: string, value: unknown) {
        filters.push([column, value])
        return self
      },
      // THE COLUMN LIST IS HONOURED, as PostgREST honours it (review, 2026-09-29): `patchSite` decides every
      // patch from the columns it asked for, so a column dropped from its `READ` must reach the patch as
      // `undefined` here too — `contentKeyPatch` and the disconnect stamp read `disconnected_at`, the probe
      // reads `capability_source` — instead of the whole row quietly standing in for it.
      select(columns?: string) {
        if (columns) filters.push(['__select', columns])
        return self
      },
      maybeSingle() {
        const asked = filters.find(([column]) => column === '__select')?.[1] as string | undefined
        const matched = filters.filter(([column]) => column !== '__select').every(([column, value]) => (row as Record<string, unknown>)[column] === value)
        if (!matched) return Promise.resolve({ data: null, error: null })
        const whole = structuredClone(row) as Record<string, unknown>
        const data = asked ? Object.fromEntries(asked.split(',').map((c) => c.trim()).filter((c) => c in whole).map((c) => [c, whole[c]])) : whole
        return Promise.resolve({ data, error: null })
      },
      // An UPDATE is awaited straight off the chain (`.update(…).eq(…).select('id')`).
      then(resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) {
        between?.(row, writes.attempted)
        writes.attempted++
        const hit = matches()
        if (hit) {
          Object.assign(row, structuredClone(values))
          touch()
        }
        return Promise.resolve({ data: hit ? [{ id: row.id }] : [], error: null }).then(resolve, reject)
      },
    }
    return self
  }
  const admin = { from: () => ({ select: (columns?: string) => chain().select(columns), update: (values: Record<string, unknown>) => chain(values) }) }
  return { admin: admin as unknown as SupabaseClient, writes }
}

/** The second writer: another key merged in, and the version moved — what the daily check does to a Re-check's read. */
const otherWriter = (row: Stored) => {
  row.site_settings = { ...(row.site_settings ?? {}), members: { signup_access: 'all', paid_enabled: false } }
  row.updated_at = `2026-09-29T12:30:00.${String(Math.random()).slice(2, 8)}+00:00`
}

const brandPatch = (row: SiteRow) => ({ site_settings: { ...(row.site_settings ?? {}), brand: { accent: '#ff5a1f', logo: null, nav: [] } } })

test('DW-65: a second writer landing between the read and the write loses nothing — both keys are in the row', async () => {
  const row = stored()
  const { admin, writes } = fakeAdmin(row, (r, write) => {
    if (write === 0) otherWriter(r)
  })
  const result = await patchSite(admin, { siteId: SITE, userId: A }, brandPatch)
  assert.equal(result.ok, true)
  // The first write matched nothing (the version moved), so it re-read and re-patched ONTO the other writer's row.
  assert.equal(writes.attempted, 2)
  assert.deepEqual(Object.keys(row.site_settings ?? {}).sort(), ['brand', 'members', 'public_url'])
})

test('DW-65: a writer that loses every race gives up after TRIES, having written nothing of its own', async () => {
  const row = stored()
  const { admin, writes } = fakeAdmin(row, otherWriter)
  const result = await patchSite(admin, { siteId: SITE, userId: A }, brandPatch)
  assert.deepEqual(result, { ok: false, code: 'contended' })
  assert.equal(writes.attempted, TRIES)
  assert.equal('brand' in (row.site_settings ?? {}), false, 'a contended write must change nothing')
})

test('patchSite answers only for the caller’s own row, and a refusal writes nothing', async () => {
  const row = stored()
  const before = structuredClone(row)
  const { admin, writes } = fakeAdmin(row)
  assert.deepEqual(await patchSite(admin, { siteId: SITE, userId: B }, brandPatch), { ok: false, code: 'no_such_site' })
  assert.deepEqual(await patchSite(admin, { siteId: SITE, userId: A }, () => null), { ok: false, code: 'refused' })
  assert.equal(writes.attempted, 0)
  assert.deepEqual(row, before)
})

test('DW-84: the Content save refuses a record disconnected since, and keeps a key stored from another tab', async () => {
  // THE I/O MATRIX'S RACE: Disconnect stamped the row between the screen's draw and this save.
  const gone = stored({ disconnected_at: '2026-09-29T12:10:00.000000+00:00', content_key: null, credentials_present: { content: false, admin: false, staff: false } })
  const before = structuredClone(gone)
  const refused = fakeAdmin(gone)
  assert.deepEqual(await patchSite(refused.admin, { siteId: SITE, userId: A }, contentKeyPatch('new-content-key')), { ok: false, code: 'refused' })
  assert.deepEqual(gone, before, 'the disconnected row gained a key')

  // THE CROSS-TAB TWIN: `store()` flipped `admin` in its own transaction between this save's read and its write.
  const live = stored({ credentials_present: { content: false, admin: false, staff: false } })
  const raced = fakeAdmin(live, (r, write) => {
    if (write === 0) {
      r.credentials_present = { ...(r.credentials_present ?? {}), admin: true }
      r.updated_at = '2026-09-29T12:20:00.000001+00:00'
    }
  })
  assert.equal((await patchSite(raced.admin, { siteId: SITE, userId: A }, contentKeyPatch('new-content-key'))).ok, true)
  assert.equal(live.content_key, 'new-content-key')
  assert.deepEqual(live.credentials_present, { content: true, admin: true, staff: false })
})

test('DW-272: the re-read refuses a site that is not the caller’s before Ghost is asked anything', async () => {
  const payload = {
    settings: [
      { key: 'accent_color', value: '#ff5a1f' },
      { key: 'members_signup_access', value: 'all' },
      { key: 'paid_members_enabled', value: false },
    ],
  }
  const asked: string[] = []
  const call: SettingsCall = async ({ siteId, path }) => {
    asked.push(`${siteId} ${path}`)
    return { ok: true, body: payload }
  }

  // USER B holds A's site id (a `projects.linked_site_id` he wrote): no decryption, no request, no write.
  const row = stored()
  const before = structuredClone(row)
  const theirs = fakeAdmin(row)
  assert.equal(await rereadSettings({ admin: theirs.admin, call, route: 'test' }, B, SITE), null)
  assert.deepEqual(asked, [], 'call() was reached for a site that is not the caller’s')
  assert.equal(theirs.writes.attempted, 0)
  assert.deepEqual(row, before)

  // THE POSITIVE CONTROL: the owner's own re-read asks once, and merges the payload's keys over what was there.
  const mine = fakeAdmin(row)
  const read = await rereadSettings({ admin: mine.admin, call, route: 'test' }, A, SITE)
  assert.deepEqual(asked, [`${SITE} settings/`])
  assert.equal(read?.surfaces.accent, '#ff5a1f')
  assert.deepEqual(read?.members, { signup_access: 'all', paid_enabled: false })
  assert.equal((row.site_settings as { public_url?: string }).public_url, 'https://ghost6.inflozo.com/')
})
