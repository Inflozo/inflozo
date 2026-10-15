// Story 7.12 — §D.b's whole faces through the ONE emitter: `latin` is today's rules byte for byte, a covering family's
// faces become one whole-face rule each with no `unicode-range`, and `coverageOf` / `pairingFiles` / `preloadFiles` say
// the same thing from `pool.json`'s own records. Every expected byte count is derived from the pool, never written down.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { POOL, faceOf, pairingFaces, pairingOf, type PoolFile } from '@inflozo/library/packs'
import { coverageOf, coversScript, faceRulesCss, fontFaceCss, pairingFiles, preloadFiles } from './fonts.ts'

/** TODAY'S EMITTER, as it stood before Story 7.12 (`faceRulesCss` at c065752d) — the reference `latin` must equal. */
const today = (ids: readonly string[], url: (f: PoolFile) => string, prefix = '') =>
  ids.map(faceOf).flatMap((face) => face.files.map((f) => [
    '@font-face {',
    `  font-family: '${prefix}${face.family}';`,
    `  font-style: ${face.style};`,
    `  font-weight: ${face.weight};`,
    '  font-display: swap;',
    `  src: url(${url(f)}) format('woff2');`,
    `  unicode-range: ${POOL.subsets[f.subset]};`,
    '}',
  ].join('\n'))).join('\n')
const ids = (id: string) => [...new Set([...pairingOf(id).heading.faces, ...pairingOf(id).body.faces])]
const url = (f: PoolFile) => `canvas?font=${f.file}&h=${f.sha256.slice(0, 12)}`
/** The rules of a stylesheet, as their declarations. */
const rules = (css: string) =>
  [...css.matchAll(/@font-face \{([^}]*)\}/g)].map((m) =>
    Object.fromEntries([...(m[1] as string).matchAll(/^\s*([a-z-]+): (.+);$/gm)].map((d) => [d[1] as string, d[2] as string])))
const sum = (files: readonly { bytes: number }[]) => files.reduce((t, f) => t + f.bytes, 0)
const full = (id: string) => faceOf(id).full ?? assert.fail(`${id} has no whole face`)

test('latin is today\'s rules byte for byte, for every pairing, with and without a role or prefix', () => {
  for (const p of POOL.pairings) {
    const want = today(ids(p.id), url)
    assert.equal(fontFaceCss(p.id, url), want, p.id)
    assert.equal(fontFaceCss(p.id, url, { script: 'latin' }), want, p.id)
    assert.equal(fontFaceCss(p.id, url, { script: 'latin', prefix: 'Inflozo pack ', role: 'heading' }), today(p.heading.faces, url, 'Inflozo pack '), p.id)
    assert.equal(faceRulesCss(ids(p.id), url), want, p.id)
  }
  // the control: the reference is not blind — a covered script on the same pairing differs from it
  assert.notEqual(fontFaceCss('D1', url, { script: 'cyrillic' }), today(ids('D1'), url))
})

test('Paper under Cyrillic: Inter draws two whole faces with no unicode-range, Fraunces keeps its latin pair', () => {
  assert.equal(pairingOf('D1').heading.family, 'Fraunces')
  assert.equal(pairingOf('D1').body.family, 'Inter')
  const handed: PoolFile[] = []
  const got = rules(fontFaceCss('D1', (f) => (handed.push(f), f.file), { script: 'cyrillic' }))
  const inter = got.filter((r) => r['font-family'] === "'Inter'")
  const fraunces = got.filter((r) => r['font-family'] === "'Fraunces'")
  assert.deepEqual(inter.map((r) => r['src']), ['inter-roman', 'inter-italic'].map((id) => `url(${full(id).file}) format('woff2')`))
  assert.ok(inter.every((r) => !('unicode-range' in r)), 'a whole face carries no unicode-range')
  // the control: the uncovered family's rules are today's, ranges and all
  assert.deepEqual(fraunces.map((r) => r['unicode-range']), faceOf('fraunces-roman').files.map((f) => POOL.subsets[f.subset]))
  assert.deepEqual(handed.filter((f) => f.subset === 'full'), ['inter-roman', 'inter-italic'].map((id) => ({ subset: 'full', ...full(id) })))
  assert.equal(coversScript('Inter', 'cyrillic'), true)
  assert.equal(coversScript('Fraunces', 'cyrillic'), false)
})

test('Japanese: no family of the pool covers it, so every family keeps its latin pair', () => {
  for (const p of POOL.pairings) {
    assert.equal(fontFaceCss(p.id, url, { script: 'japanese' }), today(ids(p.id), url), p.id)
    const { covered, uncovered } = coverageOf(p.id, 'japanese')
    assert.equal(covered.length, 0, p.id)
    assert.ok(uncovered.every((c) => c.bytes === c.latinBytes), p.id)
  }
})

test('Vietnamese: Paper\'s two families both list it, so every rule is a whole face', () => {
  const got = rules(fontFaceCss('D1', url, { script: 'vietnamese' }))
  assert.equal(got.length, ids('D1').length)
  assert.ok(got.every((r) => !('unicode-range' in r) && /-full\.woff2/.test(r['src'] ?? '')))
  assert.equal(coverageOf('D1', 'vietnamese').uncovered.length, 0)
})

test('coverageOf: families heading first, each once with its roles, bytes from pool.json', () => {
  const pair = (id: string) => sum(faceOf(id).files)
  assert.deepEqual(coverageOf('D1', 'cyrillic'), {
    covered: [{ family: 'Inter', roles: ['body'], bytes: full('inter-roman').bytes + full('inter-italic').bytes, latinBytes: pair('inter-roman') + pair('inter-italic') }],
    uncovered: [{ family: 'Fraunces', roles: ['heading'], bytes: pair('fraunces-roman'), latinBytes: pair('fraunces-roman') }],
  })
  // under latin everything is covered and ships what it ships today
  for (const p of POOL.pairings) {
    const { covered, uncovered } = coverageOf(p.id, 'latin')
    assert.equal(uncovered.length, 0, p.id)
    assert.ok(covered.every((c) => c.bytes === c.latinBytes), p.id)
    assert.equal(sum(covered), sum(pairingFiles(p.id)), p.id)
  }
  // one family in both roles is one entry naming both
  assert.deepEqual(coverageOf('D12', 'vietnamese').covered.map((c) => [c.family, c.roles]), [[pairingOf('D12').body.family, ['heading', 'body']]])
})

test('pairingFiles and preloadFiles: what the theme ships and preloads, the same rule as the rules', () => {
  for (const p of POOL.pairings) assert.deepEqual(pairingFiles(p.id), pairingFaces(p.id).flatMap((f) => f.files), p.id)
  assert.deepEqual(pairingFiles('D1', 'cyrillic').map((f) => f.file),
    [...faceOf('fraunces-roman').files.map((f) => f.file), full('inter-roman').file, full('inter-italic').file])
  assert.deepEqual(preloadFiles('D1'), ['fraunces-roman-latin.woff2', 'inter-roman-latin.woff2'])
  assert.deepEqual(preloadFiles('D1', 'cyrillic'), ['fraunces-roman-latin.woff2', full('inter-roman').file])
  assert.deepEqual(preloadFiles('D1', 'vietnamese'), [full('fraunces-roman').file, full('inter-roman').file])
  assert.deepEqual(preloadFiles('D12', 'vietnamese'), [full(pairingOf('D12').heading.faces[0] as string).file], 'one family, one preload')
})

test('a covering family whose face has no whole face is refused, never shipped as latin; an unknown family is refused', () => {
  const face = POOL.faces['inter-roman'] ?? assert.fail('no inter-roman')
  const kept = face.full
  delete face.full
  try {
    assert.throws(() => fontFaceCss('D1', url, { script: 'cyrillic' }), /Inter covers cyrillic and the pool records no whole face/)
    assert.doesNotThrow(() => fontFaceCss('D1', url)) // the control: latin never reads it
  } finally {
    face.full = kept
  }
  assert.doesNotThrow(() => fontFaceCss('D1', url, { script: 'cyrillic' }))
  assert.throws(() => coversScript('Comic Sans', 'cyrillic'), /not a family of the pool/)
  assert.equal(coversScript('Comic Sans', 'latin'), true, 'latin is covered by every family, asked or not')
})
