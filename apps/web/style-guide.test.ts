import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { orbitWeekly } from '@inflozo/library'
import {
  DESIGNED_CARDS, ORBIT_WEEKLY_DIR, articleDocument, cardScripts, chunkUniverse, simulatedCardsCss, variationsDocument, withImages,
} from './lib/style-guide.ts'

// Story 4.4's review surface, held by the files it reads. The half of the fixture contract a core
// package cannot test — it cannot open a file — lives here: the stylesheet ORDER, the complement, the
// vendored scripts, and that every image the data names exists on disk.

const NONCE = 'dGVzdC1ub25jZQ=='
const article = articleDocument(NONCE)
const sheet = variationsDocument(NONCE)

test('the theme stylesheet loads BEFORE the simulated cards.min.css, as the browser will meet them', () => {
  for (const doc of [article, sheet]) {
    const order = [...doc.matchAll(/<style data-order="([^"]+)"/g)].map((m) => m[1])
    assert.deepEqual(order, [...order].sort(), `stylesheets out of order: ${order.join(' → ')}`)
    assert.ok(order.indexOf('2-theme') < order.indexOf('3-cards.min.css'), 'the theme must precede Ghost\'s card CSS (prd.md §7.4)')
  }
})

test('the simulated bundle is exactly the complement of the derived exclude list', () => {
  const universe = chunkUniverse('css')
  assert.ok(universe.length > 0, 'no vendored css chunks — run python3 tools/probe/record-cards.py')
  const { chunks } = simulatedCardsCss()
  const excluded = orbitWeekly.cardAssetsExclude(universe, DESIGNED_CARDS)
  assert.deepEqual([...chunks, ...excluded].sort(), [...universe].sort())
  const carried = /<style data-order="3-cards.min.css" data-chunks="([^"]*)"/.exec(article)?.[1].split(' ')
  assert.deepEqual(carried, chunks)
})

test('the four card behaviour scripts are vendored with their source, version and licence, and every script carries the nonce', () => {
  const { chunks } = cardScripts()
  for (const c of ['audio', 'gallery', 'toggle', 'video']) assert.ok(chunks.includes(c), `vendor/cards/js/${c}.js is missing (FR-Q7)`)
  for (const kind of ['css', 'js'] as const) {
    for (const c of chunkUniverse(kind)) {
      const headLines = readFileSync(join(ORBIT_WEEKLY_DIR(), 'vendor', 'cards', kind, `${c}.${kind}`), 'utf8').split('\n').slice(0, 2).join('\n')
      assert.match(headLines, new RegExp(`Vendored verbatim from Ghost \\d+\\.\\d+\\.\\d+, core/frontend/src/cards/${kind}/${c}\\.${kind}`))
      assert.match(headLines, /Ghost Foundation\. MIT licence/)
    }
  }
  assert.match(readFileSync(join(ORBIT_WEEKLY_DIR(), 'vendor', 'LICENSE-ghost.txt'), 'utf8'), /Permission is hereby granted/)
  for (const doc of [article, sheet]) {
    const tags = [...doc.matchAll(/<script\b[^>]*>/g)].map((m) => m[0])
    assert.ok(tags.length > 0)
    for (const t of tags) assert.ok(t.includes(`nonce="${NONCE}"`), `${t} carries no nonce — 'strict-dynamic' would block it silently`)
    assert.ok(doc.includes('toggleHeadingElements') && doc.includes('kg-gallery-image img'), 'the toggle and gallery scripts are not in the document')
  }
})

test('the fixture renders inside <main><article class="gh-content">, which .kg-width-* depends on', () => {
  assert.match(article, /<main><header class="gh-canvas gh-head">[^]*?<article class="gh-content">/)
  assert.match(sheet, /<main><article class="gh-content">/)
  assert.ok(article.includes(orbitWeekly.styleGuideBody('6').slice(0, 200)), 'the recorded body is not in the document byte for byte')
})

test('every image the dataset and the corpus name exists, and none is left on the reserved origin', () => {
  const origin = `${orbitWeekly.ORBIT_WEEKLY_ORIGIN}/images/`
  const data = readFileSync(join(ORBIT_WEEKLY_DIR(), 'dataset.json'), 'utf8') + readFileSync(join(ORBIT_WEEKLY_DIR(), 'corpus.json'), 'utf8')
  const named = new Set([...data.matchAll(/https:\/\/orbit-weekly\.example\/images\/([a-z0-9-]+\.svg)/g)].map((m) => m[1]))
  assert.ok(named.size > 0)
  for (const name of named) assert.ok(existsSync(join(ORBIT_WEEKLY_DIR(), 'images', name)), `images/${name} is named and does not exist`)
  for (const doc of [article, sheet]) assert.ok(!doc.includes(origin), 'an image URL on the reserved origin was not mapped')
  assert.equal(withImages('<a href="https://orbit-weekly.example/the-list/">x</a>'), '<a href="https://orbit-weekly.example/the-list/">x</a>', 'a link is not an image and is never touched')
})

test("the recordings' import module is the list on disk, not a stale one", () => {
  const dir = join(ORBIT_WEEKLY_DIR(), 'fixtures')
  const onDisk = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('ghost'))
    .flatMap((d) => readdirSync(join(dir, d.name)).filter((f) => f.endsWith('.json')).map((f) => `./${d.name}/${f}`))
    .sort()
  const imported = [...readFileSync(join(dir, 'index.ts'), 'utf8').matchAll(/from '(\.\/ghost\d\/[^']+\.json)'/g)].map((m) => m[1]).sort()
  assert.deepEqual(imported, onDisk, 'fixtures/index.ts is stale — re-run python3 tools/probe/record-cards.py')
})

test('the variation sheet shows the toggle closed as recorded, then open on the same bytes', () => {
  assert.match(sheet, /data-variant="toggle"[^]*?data-kg-toggle-state="close"[^]*?data-open-toggle/)
  assert.equal((sheet.match(/data-variant="/g) ?? []).length, orbitWeekly.variants().length + 1)
})
