// Story 4.9 — the catalog's own rules, S5's derivation and the override door. The machine copy is checked
// against appendix-h1 and against intl-messageformat 5.4.3 by `tools/check-catalog.mjs`, which can read files;
// here every rule fires on a synthetic catalog, and the real one holds all of them.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CATALOG, catalogFailures, catalogPropRefusal, i18nAttr, jsKeyRefusal, placeholders, resolveStrings, tKeyRefusal, tParamsRefusal,
} from './catalog.ts'
import type { Catalog, CatalogEntry } from './catalog.ts'

const cat = (keys: Record<string, CatalogEntry>, migrations: Catalog['migrations'] = []): Catalog => ({ keys, migrations })
const fails = (c: Catalog, pattern: RegExp) => {
  const f = catalogFailures(c)
  assert.ok(f.some((x) => pattern.test(x)), `expected ${pattern} in ${JSON.stringify(f)}`)
}

test('the machine copy holds every format rule', () => {
  assert.deepEqual(catalogFailures(CATALOG), [])
  // and the control: the same function is not vacuous on it
  const broken = cat({ ...CATALOG.keys, 'pagination.label': { en: '', marks: [] } })
  assert.equal(catalogFailures(broken).length, 1)
})

test('every format rule fires, naming the key', () => {
  fails(cat({ 'Pagination.Label': { en: 'x', marks: [] } }), /^Pagination\.Label .*namespace\.name/)
  fails(cat({ 'nav.menu-open': { en: 'x', marks: [] } }), /^nav\.menu-open /)
  fails(cat({ 'nav.menu': { en: 'x', marks: [] }, 'card.more': { en: 'x', marks: [] }, 'nav.close': { en: 'x', marks: [] } }), /^nav\.close .*split/)
  fails(cat({ 'nav.menu': { en: ' ', marks: [] } }), /^nav\.menu .*never empty/)
  fails(cat({ 'nav.menu': { en: '{count, plural, one {#} other {#}}', marks: [] } }), /^nav\.menu .*plain \{snake_case\}/)
  fails(cat({ 'nav.menu': { en: 'A {Name}', marks: [] } }), /plain \{snake_case\}/)
  fails(cat({ 'nav.menu': { en: "It''s", marks: [] } }), /apostrophe quoting/)
  fails(cat({ 'nav.menu': { en: "'{'", marks: [] } }), /apostrophe quoting/)
  fails(cat({ 'nav.menu': { en: 'x', marks: ['JS'] } }), /marks/)
  fails(cat({ 'nav.menu': { en: 'x', marks: ['js', 'js'] } }), /marks/)
  fails(cat({ 'credit.built_with': { en: 'x', marks: [] } }), /credit\.\* key is locked/)
  fails(cat({ 'nav.menu': { en: 'x', marks: ['locked'] } }), /no other key is/)
  fails(cat({ 'comments.placeholder': { en: 'x', marks: ['canvas', 'js'] } }), /canvas key is never js/)
  fails(cat({ 'nav.menu': { en: 'x', marks: [], retired: '' } }), /no reason/)
  fails(cat({ 'nav.menu': { en: 'x', marks: [], supersededBy: 'nav.nope' } }), /not a live key/)
  fails(cat({ 'nav.menu': { en: 'x', marks: [], supersededBy: 'nav.open' }, 'nav.open': { en: 'y', marks: [] } }), /0 migrations entries/)
  fails(cat({ 'nav.menu': { en: 'x', marks: [] }, 'nav.open': { en: 'y', marks: [] } }, [{ from: 'nav.menu', to: 'nav.open', reason: 'r', carryOverride: true }]), /not marked supersededBy/)
  fails(cat({ 'nav.menu': { en: 'x', marks: [], supersededBy: 'credit.built_with' }, 'credit.built_with': { en: 'y', marks: ['locked'] } }, [{ from: 'nav.menu', to: 'credit.built_with', reason: 'r', carryOverride: true }]), /onto a locked credit/)
  // plain text is fine, including an apostrophe that quotes nothing and a quoted word
  assert.deepEqual(catalogFailures(cat({ 'nav.menu': { en: "It's 'quoted' {count} — {author}'s", marks: [] } })), [])
})

test("S5's own example, and placeholders derived from the default", () => {
  assert.equal(i18nAttr('pagination.load_more_loading'), 'data-i18n-load-more-loading')
  assert.equal(i18nAttr('countdown.days'), 'data-i18n-days')
  assert.deepEqual(placeholders('pagination.page_of'), ['page', 'pages'])
  assert.deepEqual(placeholders('nav.menu'), [])
  assert.throws(() => placeholders('a1.menu_open'), /not a catalog key/)
})

test('V2 and V4 — each refusal with its own reason', () => {
  assert.equal(tKeyRefusal('search.trigger_label'), null)
  assert.match(tKeyRefusal('a1.menu_open')?.message ?? '', /not in the catalog/)
  assert.match(tKeyRefusal('search.overlay_empty')?.message ?? '', /retired/)
  assert.match(tKeyRefusal('countdown.days')?.message ?? '', /js key/)
  assert.match(tKeyRefusal('comments.placeholder')?.message ?? '', /canvas-only/)
  const superseded = cat({ 'nav.menu': { en: 'x', marks: [], supersededBy: 'nav.open' }, 'nav.open': { en: 'y', marks: [] } })
  assert.match(tKeyRefusal('nav.menu', superseded)?.message ?? '', /superseded by "nav\.open"/)
  assert.match(tKeyRefusal('archive.posts_many')?.message ?? '', /written for \{\{plural\}\}/, 'a % default is derived as a plural string, never marked')
  assert.equal(tKeyRefusal('member.read_so_far')?.message.includes('js key'), true, 'the js reason comes first for "About {percent}% read"')
  for (const k of ['a1.menu_open', 'search.overlay_empty', 'countdown.days', 'comments.placeholder', 'archive.posts_many']) assert.equal(tKeyRefusal(k)?.code, 'catalog-key')
  assert.equal(tParamsRefusal('pagination.page_of', ['page', 'pages']), null)
  const r = tParamsRefusal('pagination.page_of', ['page'])
  assert.equal(r?.code, 'catalog-params')
  assert.match(r?.message ?? '', /misses pages/)
  assert.match(tParamsRefusal('nav.menu', ['x'])?.message ?? '', /takes exactly no param .*passes x/)
})

test('S6 — a catalog-linked prop is text, names a live prop key, and carries no default', () => {
  assert.equal(catalogPropRefusal('submitLabel', { type: 'text', label: 'Button text', catalog: 'member.signup_cta' } as never), null)
  assert.match(catalogPropRefusal('p', { type: 'richtext', catalog: 'member.signup_cta' })?.message ?? '', /only a text prop/)
  assert.match(catalogPropRefusal('p', { type: 'text', catalog: 'nav.menu' })?.message ?? '', /does not mark prop/)
  assert.match(catalogPropRefusal('p', { type: 'text', catalog: 'nope.key' })?.message ?? '', /not a live catalog key/)
  assert.match(catalogPropRefusal('p', { type: 'text', catalog: 'member.signup_cta', default: 'Join' })?.message ?? '', /default beside/)
  assert.equal(catalogPropRefusal('p', { type: 'text', catalog: 'nav.menu' })?.code, 'catalog-prop')
  assert.equal(catalogPropRefusal('p', { type: 'text' }), null)
  assert.equal(jsKeyRefusal('countdown.days'), null)
  assert.match(jsKeyRefusal('nav.menu') ?? '', /not a js key/)
  assert.match(jsKeyRefusal('search.overlay_empty') ?? '', /not live/)
})

test("resolveStrings is the one door: S7 and an unknown key throw, and a migration carries an override forward", () => {
  const english = resolveStrings({})
  assert.equal(english['member.signup_cta'], 'Subscribe')
  assert.equal(resolveStrings({ 'member.signup_cta': 'Abonnieren' })['member.signup_cta'], 'Abonnieren')
  assert.throws(() => resolveStrings({ 'credit.built_with': 'x' }), /S7/)
  assert.throws(() => resolveStrings({ 'nope.key': 'x' }), /"nope\.key"/)
  assert.throws(() => resolveStrings({ 'nav.menu': 3 }), /not a string/)
  const synthetic = cat(
    {
      'pagination.end_of_feed': { en: "You're all caught up", marks: ['js'], supersededBy: 'pagination.feed_complete' },
      'pagination.feed_complete': { en: 'That is everything', marks: ['js'] },
      'pagination.old_label': { en: 'Old', marks: [], supersededBy: 'pagination.new_label' },
      'pagination.new_label': { en: 'New', marks: [] },
    },
    [
      { from: 'pagination.end_of_feed', to: 'pagination.feed_complete', reason: 'meaning change', carryOverride: true },
      { from: 'pagination.old_label', to: 'pagination.new_label', reason: 'carrying it would be wrong', carryOverride: false },
    ],
  )
  assert.deepEqual(catalogFailures(synthetic), [])
  const carried = resolveStrings({ 'pagination.end_of_feed': 'Fertig', 'pagination.old_label': 'Alt' }, synthetic)
  assert.equal(carried['pagination.feed_complete'], 'Fertig', 'carryOverride copies the override to the new key')
  assert.equal(carried['pagination.end_of_feed'], 'Fertig', 'and leaves the old override in place (S1)')
  assert.equal(carried['pagination.new_label'], 'New', 'carryOverride false falls back to the English default')
  const kept = resolveStrings({ 'pagination.end_of_feed': 'Fertig', 'pagination.feed_complete': 'Schon übersetzt' }, synthetic)
  assert.equal(kept['pagination.feed_complete'], 'Schon übersetzt', 'an override the new key already has is never replaced')
})
