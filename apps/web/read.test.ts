// Story 7.18b (DW-378) — Ship it's state from the stored rows (`shipStateOf`, `lib/deploy.ts`, re-exported by the editor's
// `read.ts` beside the reads that feed it): until now the keyboard harness replaced it everywhere, so nothing ran it.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shipStateOf, themeNameOf } from './lib/deploy.ts'

const P = 'p-this'
const SITE = '00000000-0000-4000-8000-0000000000bb'
const base = (over: Partial<Parameters<typeof shipStateOf>[0]> = {}): Parameters<typeof shipStateOf>[0] => ({
  projectId: P, slug: 'field-notes', language: 'en', rtlAckAt: null, overridden: false, siteId: SITE,
  site: { url: 'https://ghost6.inflozo.com', ghost_version: '6.58.0', capability: 'full', capability_source: null, disconnected_at: null, site_settings: { locale: 'en' } },
  deploys: [], binding: null, liveHere: false, required: ['index.hbs', 'post.hbs'],
  sites: [], linking: [], ...over,
})

test('a site never shipped to: v1, "your current theme", the theme named from the slug, the site with its source and locale', () => {
  const s = shipStateOf(base())
  assert.deepEqual(s.site, { id: SITE, host: 'ghost6.inflozo.com', url: 'https://ghost6.inflozo.com', version: '6.58.0', capability: 'full', source: null, locale: 'en' })
  assert.equal(s.n, 1)
  assert.equal(s.prev, null)
  assert.equal(s.shipped, false)
  assert.equal(s.themeName, themeNameOf('field-notes'))
  assert.deepEqual(s.required, ['index.hbs', 'post.hbs'])
  assert.equal(s.language, 'en')
  assert.equal(s.rtlAckAt, null)
})

test('n counts this project\'s uploads to the site plus one; prev is its LATEST activated deploy; the binding\'s frozen name wins; liveHere passes through', () => {
  const s = shipStateOf(base({
    deploys: [
      { version: '1.0.0', status: 'uploaded', activated: true, activated_at: '2026-10-01T00:00:00Z' },
      { version: '2.0.0', status: 'live', activated: true, activated_at: '2026-10-02T00:00:00Z' },
      { version: '3.0.0', status: 'uploaded', activated: false, activated_at: null },
    ],
    binding: { theme_name: 'inflozo-field-notes-2' },
    liveHere: true,
  }))
  assert.equal(s.n, 4)
  assert.equal(s.prev, 2, 'the latest ACTIVATED one, not the last uploaded')
  assert.equal(s.shipped, true)
  assert.equal(s.themeName, 'inflozo-field-notes-2')
  assert.equal(s.liveHere, true)
})

test('a disconnected site is no site — and never "live here"; no linked site likewise', () => {
  const gone = shipStateOf(base({ site: { ...base().site, disconnected_at: '2026-10-10T00:00:00Z' }, liveHere: true }))
  assert.equal(gone.site, null)
  assert.equal(gone.liveHere, false)
  // …but the LINK stands (the Review): the picker plans a switch from the link the server reads, so a project still linked to a
  // disconnected site is no first link on either side
  assert.equal(gone.linkedSiteId, SITE)
  assert.equal(shipStateOf(base({ siteId: null, site: null })).linkedSiteId, null)
  assert.equal(shipStateOf(base({ overridden: true })).overridden, true)
  assert.equal(shipStateOf(base({ siteId: null, site: null })).site, null)
})

test('Preview-only by each source: a refused upload\'s `deploy_error` mark, and a probe\'s — the wizard tells them apart (R-270)', () => {
  const refused = shipStateOf(base({ site: { ...base().site, capability: 'preview_only', capability_source: 'deploy_error' } }))
  assert.equal(refused.site?.capability, 'preview_only')
  assert.equal(refused.site?.source, 'deploy_error')
  const probed = shipStateOf(base({ site: { ...base().site, capability: 'preview_only', capability_source: 'probe' } }))
  assert.equal(probed.site?.source, 'probe')
  // the control: anything but the one word reads as full
  assert.equal(shipStateOf(base({ site: { ...base().site, capability: 'junk' } })).site?.capability, 'full')
})

test('the sites list: every connected site with the OTHER project that links it (heldBy); this project\'s own site is never held; junk rows dropped', () => {
  const s = shipStateOf(base({
    sites: [
      { id: SITE, title: 'Ghost 6', url: 'https://ghost6.inflozo.com', capability: 'full', capability_source: null, site_settings: { locale: 'en' } },
      { id: 'site-b', title: 'Blog', url: 'https://blog.example.com', capability: 'preview_only', capability_source: 'deploy_error', site_settings: { locale: 'de' } },
      { id: 'site-c', title: null, url: 'https://c.example.com', capability: 'full', capability_source: null, site_settings: null },
      { id: 'site-d', title: 'No address', url: '' },
    ],
    linking: [{ id: P, name: 'This', linked_site_id: SITE }, { id: 'p-a', name: 'Field Notes', linked_site_id: 'site-b' }],
  }))
  assert.deepEqual(s.sites, [
    { id: SITE, title: 'Ghost 6', host: 'ghost6.inflozo.com', url: 'https://ghost6.inflozo.com', capability: 'full', source: null, locale: 'en', heldBy: null },
    { id: 'site-b', title: 'Blog', host: 'blog.example.com', url: 'https://blog.example.com', capability: 'preview_only', source: 'deploy_error', locale: 'de', heldBy: { id: 'p-a', name: 'Field Notes' } },
    { id: 'site-c', title: '', host: 'c.example.com', url: 'https://c.example.com', capability: 'full', source: null, locale: null, heldBy: null },
  ])
  // STORY 7.18c (DW-381, R-276): a failed read is NULL, never none — either read failing; the picker says so in place of a list
  assert.equal(shipStateOf(base({ sites: null, linking: null })).sites, null)
  assert.equal(shipStateOf(base({ sites: null })).sites, null, 'the sites read failed')
  assert.equal(shipStateOf(base({ linking: null })).sites, null, 'the linking read failed: no row could say who holds it')
  // the control: a read that succeeded with no site is an empty list, as 7.18b drew it
  assert.deepEqual(shipStateOf(base({ sites: [], linking: [] })).sites, [])
})
