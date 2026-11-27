// Story 7.24 — the names already held on one Ghost (`server/deploy/held-names.ts`): every OTHER project's binding to any site
// record at the address of a site the caller owns, in any account — over a fake client that applies each filter to its rows
// and records every query, so a query that lost a clause, or one that should never have been sent, shows here.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { SupabaseClient } from '@supabase/supabase-js'
import { heldNamesIn } from './server/deploy/held-names.ts'

type Row = Record<string, unknown>
const T1 = 'https://ghost6.inflozo.com'
const ME = 'user-me'
const OTHER = 'user-other'
const P = 'project-this'

function fakeDb(tables: Record<string, Row[]>, log: string[], fail?: string): SupabaseClient {
  const from = (table: string) => {
    const filters: ((r: Row) => boolean)[] = []
    const seen: string[] = []
    const answer = () => {
      log.push(`${table}: ${seen.join(' ')}`)
      if (fail === table) return { data: null, error: { code: 'XX000' } }
      return { data: (tables[table] ?? []).filter((r) => filters.every((f) => f(r))), error: null }
    }
    const q = {
      select: () => q,
      eq: (c: string, v: unknown) => (seen.push(`${c}=${String(v)}`), filters.push((r) => r[c] === v), q),
      neq: (c: string, v: unknown) => (seen.push(`${c}!=${String(v)}`), filters.push((r) => r[c] !== v), q),
      in: (c: string, vs: unknown[]) => (seen.push(`${c} in ${vs.join(',')}`), filters.push((r) => vs.includes(r[c])), q),
      is: (c: string, v: unknown) => (seen.push(`${c} is ${String(v)}`), filters.push((r) => (r[c] ?? null) === v), q),
      maybeSingle: async () => {
        const a = answer()
        return { ...a, data: a.data?.[0] ?? null }
      },
      then: (resolve: (v: unknown) => void) => resolve(answer()),
    }
    return q
  }
  return { from } as unknown as SupabaseClient
}

const world = () => ({
  sites: [
    { id: 'site-mine', user_id: ME, url: T1 },
    // another account's record of the SAME Ghost, and a disconnected record of it (its themes are still on the Ghost)
    { id: 'site-theirs', user_id: OTHER, url: T1 },
    { id: 'site-old', user_id: OTHER, url: T1, disconnected_at: '2026-11-01T00:00:00Z' },
    // another Ghost altogether
    { id: 'site-elsewhere', user_id: OTHER, url: 'https://blog.example.com' },
  ],
  project_site_bindings: [
    { project_id: 'project-theirs', site_id: 'site-theirs', theme_name: 'inflozo-name-test' },
    { project_id: 'project-gone', site_id: 'site-old', theme_name: 'inflozo-archive' },
    { project_id: 'project-far', site_id: 'site-elsewhere', theme_name: 'inflozo-elsewhere' },
    // this project's own — never held against itself
    { project_id: P, site_id: 'site-mine', theme_name: 'inflozo-mine' },
    // another of my own projects on my record of the Ghost
    { project_id: 'project-sibling', site_id: 'site-mine', theme_name: 'inflozo-sibling' },
  ],
})

test('7.24: every other project\'s name on the same Ghost, in any account — a disconnected record\'s included, this project\'s own and another address\'s excluded, sorted', async () => {
  const log: string[] = []
  const held = await heldNamesIn(fakeDb(world(), log), { siteId: 'site-mine', userId: ME, projectId: P })
  assert.deepEqual(held, ['inflozo-archive', 'inflozo-name-test', 'inflozo-sibling'])
  assert.ok(held.includes('inflozo-name-test'), 'another account\'s same-url binding is held')
  assert.ok(held.includes('inflozo-archive'), 'a disconnected record\'s binding is held')
  assert.ok(!held.includes('inflozo-mine'), 'this project\'s own is never held')
  assert.ok(!held.includes('inflozo-elsewhere'), 'another address\'s is not held')
  assert.deepEqual([...held].sort(), held, 'sorted')
  // the first query is the CALLER's own site; the bindings exclude this project
  assert.equal(log[0], `sites: id=site-mine user_id=${ME} disconnected_at is null`)
  assert.equal(log[1], `sites: url=${T1}`)
  assert.equal(log[2], `project_site_bindings: site_id in site-mine,site-theirs,site-old project_id!=${P}`)
  assert.equal(log.length, 3)
})

test('7.24: a site that is not the caller\'s answers no names and sends no second query; the same name held twice is one', async () => {
  const log: string[] = []
  assert.deepEqual(await heldNamesIn(fakeDb(world(), log), { siteId: 'site-theirs', userId: ME, projectId: P }), [])
  assert.equal(log.length, 1, 'nothing past the ownership read')
  // the control: the owner of that record reads it
  assert.deepEqual(await heldNamesIn(fakeDb(world(), []), { siteId: 'site-theirs', userId: OTHER, projectId: 'project-theirs' }), ['inflozo-archive', 'inflozo-mine', 'inflozo-sibling'])
  const twice = world()
  twice.project_site_bindings.push({ project_id: 'project-again', site_id: 'site-old', theme_name: 'inflozo-name-test' })
  assert.deepEqual(await heldNamesIn(fakeDb(twice, []), { siteId: 'site-mine', userId: ME, projectId: P }), ['inflozo-archive', 'inflozo-name-test', 'inflozo-sibling'])
})

test('7.24: a failed query throws, marked as infrastructure for the run\'s retry (AD-20)', async () => {
  for (const table of ['sites', 'project_site_bindings']) {
    await assert.rejects(heldNamesIn(fakeDb(world(), [], table), { siteId: 'site-mine', userId: ME, projectId: P }), (e: unknown) => (e as { infra?: unknown }).infra === true)
  }
})

test('7.24 (the review): the caller\'s own record DISCONNECTED answers no names and sends no second query — its key no longer connected, the reason the names may be read is gone', async () => {
  const w = world()
  w.sites[0] = { ...w.sites[0], disconnected_at: '2026-11-20T00:00:00Z' }
  const log: string[] = []
  assert.deepEqual(await heldNamesIn(fakeDb(w, log), { siteId: 'site-mine', userId: ME, projectId: P }), [])
  assert.equal(log.length, 1, 'nothing past the ownership read')
  // the control: the same record connected reads the names
  assert.ok((await heldNamesIn(fakeDb(world(), []), { siteId: 'site-mine', userId: ME, projectId: P })).length > 0)
})
