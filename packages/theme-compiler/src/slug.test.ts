// Story 7.1 — the partial slug and its collision rule, exactly as the spec states them (§ The partial slug), with its table.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { claim, partialSlug, sectionSlug, SLUG_MAX } from './slug.ts'

test('partialSlug: NFKD, marks dropped, lowercase, spaces and underscores to hyphens, the rest dropped, hyphens collapsed and trimmed', () => {
  const cases: [string, string][] = [
    ['Hero', 'hero'],
    ['HERO', 'hero'],
    ['Héro', 'hero'],
    ['Café Crème', 'cafe-creme'],
    ['Hero 2', 'hero-2'],
    ['post_header  big', 'post-header-big'],
    ['  -- Hero --  ', 'hero'],
    ['x --}}<p id="leak">LEAK</p>{{@site.title}}', 'x-p-idleakleakpsitetitle'],
    ['404', '404'],
    ['ﬁeld notes', 'field-notes'],
    ['🌿🌿', ''],
    ['ニュース', ''],
    ['', ''],
  ]
  for (const [name, slug] of cases) assert.equal(partialSlug(name), slug, JSON.stringify(name))
})

test(`partialSlug: cut to ${SLUG_MAX}, and a hyphen left at the cut is trimmed again`, () => {
  assert.equal(partialSlug('a'.repeat(80)), 'a'.repeat(SLUG_MAX))
  const cut = partialSlug(`${'a'.repeat(SLUG_MAX - 1)} b`)
  assert.equal(cut, 'a'.repeat(SLUG_MAX - 1), 'the hyphen at the cut is trimmed')
})

test('an empty slug falls back to the design\'s name, then its category, then `section`', () => {
  assert.equal(sectionSlug('🌿🌿', { name: 'Three Up', categoryTitle: 'Post Grids' }), 'three-up')
  assert.equal(sectionSlug('ニュース', { name: '★', categoryTitle: 'Post Grids' }), 'post-grids')
  assert.equal(sectionSlug('', { name: '★', categoryTitle: '☆' }), 'section')
  assert.equal(sectionSlug('Newsletter', { name: 'Inline Row', categoryTitle: 'Newsletter' }), 'newsletter')
})

test('the collision rule, per directory in placement order: the slug while free, else the first free -2, -3 (the spec\'s table)', () => {
  const files = (names: string[]) => {
    const taken = new Set<string>()
    return names.map((n) => claim(taken, partialSlug(n)))
  }
  assert.deepEqual(files(['Hero', 'HERO', 'Héro']), ['hero', 'hero-2', 'hero-3'])
  assert.deepEqual(files(['Hero 2', 'Hero']), ['hero-2', 'hero'])
  assert.deepEqual(files(['Hero', 'Hero 2', 'Hero']), ['hero', 'hero-2', 'hero-3'])
  assert.deepEqual(files(['404']), ['404'], 'an integer-like name stays')
  // two directories never meet: each has its own set
  const home = new Set<string>()
  const post = new Set<string>()
  assert.deepEqual([claim(home, 'hero'), claim(post, 'hero'), claim(home, 'hero')], ['hero', 'hero', 'hero-2'])
})

test('deterministic: the same name slugs alike every time, with no locale in the rule (AD-1)', () => {
  // `toLocaleLowerCase('tr')` would give a dotless ı for I; the rule never asks the locale
  assert.equal(partialSlug('TITLE'), 'title')
  assert.equal(partialSlug('İstanbul'), 'istanbul')
  assert.equal(partialSlug('Hero'), partialSlug('Hero'))
})
