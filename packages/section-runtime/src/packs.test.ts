// Story 6.2 — the twelve presets and the pool's faces, checked in memory: every preset through 6.1's one door, the AA
// sheet per preset and mode (Appendix D: "AA on every token pairing used by the library"), one Paper, and the faces'
// emitter. The half that reads bytes — §D.d and §D.c against the data, every file's sha256, the budget, the licences
// and the font hosts — is `tools/stress/test-vocabulary.mjs`'s, because AD-1 bans `node:fs` here.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRESETS, POOL, REFERENCE_PACKS, pairingOf, presetOf } from '@inflozo/library/packs'
import { contrast } from './colour.ts'
import { fontFaceCss } from './fonts.ts'
import { REFERENCE_PACK } from './reference.ts'
import { AA_PAIRS, packTokens } from './tokens.ts'
import type { Pack } from './tokens.ts'

const MODES = ['light', 'dark'] as const
const pack = (id: string) => (presetOf(id) ?? assert.fail(`no preset "${id}"`)).pack as Pack
/** a role as the sheet prints it: `onAccent` → `on-accent` */
const said = (role: string) => role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

/** The AA sheet (the spec's Always): text and muted on the background and on the surface, on-accent on the accent —
 *  every failing pair named by pack, mode and pair. Story 6.4: the pairs are `AA_PAIRS`, the one list the Style Pack
 *  editor's live warning reads too. */
function sheet(id: string, p: Pack): string[] {
  const out: string[] = []
  for (const mode of MODES) {
    const m = p[mode]
    for (const { fg, bg } of AA_PAIRS) {
      const ratio = contrast(m[fg], m[bg])
      if (ratio < 4.5) out.push(`${id} ${mode}: ${said(fg)} on ${said(bg)} is ${ratio.toFixed(2)}:1 (${m[fg]} on ${m[bg]})`)
    }
  }
  return out
}

test('Story 6.4: AA_PAIRS is 6.2\'s five pairs — text and muted on the background and the surface, on-accent on the accent', () => {
  assert.deepEqual(AA_PAIRS.map(({ fg, bg }) => `${said(fg)} on ${said(bg)}`), [
    'text on background', 'text on surface', 'muted on background', 'muted on surface', 'on-accent on accent',
  ])
})

test('there are presets, in §D.d\'s order, Paper first, with unique ids and the reference packs among them', () => {
  assert.ok(PRESETS.length > 0, 'the library holds no preset')
  assert.equal(PRESETS[0]?.id, 'paper')
  assert.equal(new Set(PRESETS.map((p) => p.id)).size, PRESETS.length, 'two presets share an id')
  for (const id of REFERENCE_PACKS) assert.ok(presetOf(id), `REFERENCE_PACKS names "${id}", which is not a preset`)
})

test('every preset goes through packTokens — 6.1\'s one door — and its pairing is a pool pairing', () => {
  for (const p of PRESETS) {
    assert.doesNotThrow(() => packTokens(p.pack as Pack), p.id)
    assert.doesNotThrow(() => pairingOf(p.pairing), p.id)
  }
})

test('the AA sheet holds for every preset in both modes — and a preset that breaks it is named', () => {
  const failed = PRESETS.flatMap((p) => sheet(p.id, p.pack as Pack))
  assert.deepEqual(failed, [])
  // the control: Tangerine's on-accent swapped for white, which reads 3.97:1 on its #E8450A (Design Notes)
  const tangerine = pack('tangerine')
  const white = { ...tangerine, light: { ...tangerine.light, onAccent: '#FFFFFF' } }
  const caught = sheet('tangerine', white)
  assert.equal(caught.length, 1, JSON.stringify(caught))
  assert.match(caught[0] as string, /^tangerine light: on-accent on accent is 3\.\d\d:1/)
})

test('every colour the engine computes for text keeps 6.1\'s 4.5:1 on every preset, at the preset\'s own steps', () => {
  for (const p of PRESETS) {
    const t = packTokens(p.pack as Pack)
    for (const mode of MODES) {
      const v = t[mode]
      const on = (fg: string | undefined, bg: string | undefined, what: string) => {
        const r = contrast(fg as string, bg as string)
        assert.ok(r >= 4.5, `${p.id} ${mode}: ${what} ${fg} on ${bg} is ${r.toFixed(2)}:1`)
      }
      on(v['--text-on-contrast'], v['--bg-contrast'], 'on-contrast text')
      on(v['--accent-on-contrast'], v['--bg-contrast'], 'accent-on-contrast')
      for (const ground of ['--bg-page', '--bg-surface']) {
        on(v['--negative'], v[ground], `negative on ${ground}`)
        on(v['--link-color'], v[ground], `the link on ${ground}`)
        // an Outline label is drawn on the section's ground; every other button on its own fill
        on(v['--button-text'], v['--button-fill'] === 'transparent' ? v[ground] : v['--button-fill'], `the ${p.pack.buttons} button's label`)
      }
    }
  }
})

test('one Paper: REFERENCE_PACK is the library\'s Paper preset — Fraunces over Inter (R-231)', () => {
  assert.equal(REFERENCE_PACK, pack('paper'))
  assert.equal(REFERENCE_PACK.fonts.heading.family, "'Fraunces', serif")
  assert.equal(REFERENCE_PACK.fonts.body.family, "'Inter', sans-serif")
})

test('a preset\'s fonts are its pairing\'s: family lists, the roman faces\' cap heights and tnum, from the pool', () => {
  for (const p of PRESETS) {
    const pairing = pairingOf(p.pairing)
    const fonts = (p.pack as Pack).fonts
    assert.ok(fonts.heading.family.startsWith(`'${pairing.heading.family}', `), `${p.id} heading`)
    assert.ok(fonts.body.family.startsWith(`'${pairing.body.family}', `), `${p.id} body`)
    const roman = POOL.faces[pairing.body.faces.find((f) => POOL.faces[f]?.style === 'normal') ?? '']
    assert.equal(fonts.body.tabular, roman?.tnum, `${p.id} tabular`)
    assert.equal(fonts.body.capHeight, roman?.capHeight, `${p.id} body cap`)
    // the heading's too (review): it is `--drop-cap-ratio`'s input
    assert.equal(fonts.heading.capHeight, POOL.faces[pairing.heading.faces.find((f) => POOL.faces[f]?.style === 'normal') ?? '']?.capHeight, `${p.id} heading cap`)
  }
})

/** The `@font-face` rules of a stylesheet, as their declarations. */
const rules = (css: string) =>
  [...css.matchAll(/@font-face \{([^}]*)\}/g)].map((m) =>
    Object.fromEntries([...(m[1] as string).matchAll(/^\s*([a-z-]+): (.+);$/gm)].map((d) => [d[1] as string, d[2] as string])))

test('fontFaceCss emits exactly the pool\'s files for a pairing — one rule each, swap, the subset\'s range, the address given', () => {
  for (const pairing of POOL.pairings) {
    const css = fontFaceCss(pairing.id, (f) => `canvas?font=${f.file}`)
    const files = [...new Set([...pairing.heading.faces, ...pairing.body.faces])].flatMap((id) => POOL.faces[id]?.files ?? [])
    const got = rules(css)
    assert.deepEqual(got.map((r) => r['src']), files.map((f) => `url(canvas?font=${f.file}) format('woff2')`), pairing.id)
    for (const [i, r] of got.entries()) {
      assert.equal(r['font-display'], 'swap', pairing.id)
      assert.equal(r['unicode-range'], POOL.subsets[files[i]?.subset ?? ''], `${pairing.id} ${files[i]?.file}`)
      assert.match(r['font-weight'] ?? '', /^\d{3}( \d{3})?$/, pairing.id)
      assert.match(r['font-style'] ?? '', /^(normal|italic)$/, pairing.id)
    }
  }
  // the heading role alone is the heading's faces, roman only (§D.a rule 1)
  const heading = rules(fontFaceCss('D1', (f) => f.file, { role: 'heading' }))
  assert.ok(heading.length > 0 && heading.every((r) => r['font-family'] === "'Fraunces'" && r['font-style'] === 'normal'))
})

test('a prefixed family is never a family a document declares unprefixed — the app\'s own Inter is never redefined', () => {
  const families = new Set(Object.keys(POOL.families))
  for (const pairing of POOL.pairings) {
    for (const r of rules(fontFaceCss(pairing.id, (f) => f.file, { prefix: 'Inflozo pack ' }))) {
      const family = (r['font-family'] ?? '').replace(/^'|'$/g, '')
      assert.ok(family.startsWith('Inflozo pack '), family)
      assert.ok(!families.has(family) && family !== 'Inter', `${family} is a family the app or a canvas declares`)
    }
  }
})
