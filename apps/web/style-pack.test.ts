import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_PRESET, PRESETS, defaultStylePack, placeholderFor } from './lib/style-pack.ts'

// `placeholderFor`'s fallback is the only thing between an unknown Style Pack and a card
// painted with `undefined` colours, and E6 is the epic that first writes a preset name an
// older deploy has never heard of. Nothing executed the branch until this file (review,
// 2026-09-05).

test('placeholderFor: a known preset returns its own colours', () => {
  assert.equal(placeholderFor(defaultStylePack()), PRESETS[DEFAULT_PRESET])
  assert.equal(placeholderFor({ preset: 'paper' }).surface, PRESETS.paper.surface)
})

test('placeholderFor: anything it does not know falls back to Paper, never to undefined', () => {
  const paper = PRESETS[DEFAULT_PRESET]
  for (const input of [
    { preset: 'aurora' }, // E6 ships a pack this build has never heard of
    { preset: '' },
    {},
    null,
    undefined,
    'paper', // not an object at all
    { preset: 42 },
  ]) {
    const pack = placeholderFor(input)
    assert.equal(pack, paper, `${JSON.stringify(input)} should fall back to Paper`)
    // The three the wireframe actually paints with — a card is never rendered empty.
    for (const key of ['surface', 'accent', 'text'] as const) assert.equal(typeof pack[key], 'string')
  }
})

test('placeholderFor: a prototype key is not a preset', () => {
  // `PRESETS['__proto__']` and `PRESETS['constructor']` are TRUTHY on an object literal, so a
  // `??` fallback never fired and the card painted `undefined`. `style_pack` is a column the
  // user's own session may write.
  for (const preset of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
    assert.equal(placeholderFor({ preset }), PRESETS[DEFAULT_PRESET], preset)
  }
})

test('the schema is loose, so E6 widening the column cannot break a 1.5 card', () => {
  const widened = { preset: 'paper', mode: 'dark', tokens: { ink: '#000' } }
  assert.equal(placeholderFor(widened), PRESETS.paper)
})
