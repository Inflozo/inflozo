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

/* ───────── STORY 3.4 — FR-C4's `brand` in the column. The dashboard card wearing the customer's
   own accent is the whole visible result of "Use your brand", and the value it paints with is one
   the user's own session may write (schema :1201), so it is re-validated on the way out. */

test('a site brand repaints the card accent, and changes nothing else about the pack', () => {
  const paper = PRESETS[DEFAULT_PRESET]
  const pack = placeholderFor({ preset: 'paper', brand: { accent: '#FF1A75', nav: [] } })
  assert.equal(pack.accent, '#FF1A75')
  // Only the accent moves: the surface, the text colour and the pack's own name are the preset's.
  assert.equal(pack.surface, paper.surface)
  assert.equal(pack.text, paper.text)
  assert.equal(pack.name, paper.name)
})

test('a brand accent that is not a colour is ignored, never painted', () => {
  const paper = PRESETS[DEFAULT_PRESET]
  for (const hostile of ['red;background:url(x)', 'red', '#GGG', 'rgb(0,0,0)', '', null, 7, {}]) {
    // Identity, not deep equality: nothing was spread, so it is the preset itself.
    assert.equal(placeholderFor({ preset: 'paper', brand: { accent: hostile } }), paper,
      `${JSON.stringify(hostile)} must not reach an inline style`)
  }
})

test('a brand of any shape at all costs the pack neither its preset nor its colours', () => {
  const paper = PRESETS[DEFAULT_PRESET]
  // A strict `brand` shape here would fail the WHOLE parse and drop the preset with it, so a junk
  // brand would REPAINT a card rather than be ignored. It is typed `unknown` for exactly this.
  for (const junk of [null, undefined, 'brand', 42, [], { accent: undefined }]) {
    assert.equal(placeholderFor({ preset: 'paper', brand: junk }), paper, JSON.stringify(junk))
  }
  // And an unknown preset still falls back to Paper with the brand's accent on top of it.
  assert.equal(placeholderFor({ preset: 'aurora', brand: { accent: '#FF1A75' } }).surface, paper.surface)
  assert.equal(placeholderFor({ preset: 'aurora', brand: { accent: '#FF1A75' } }).accent, '#FF1A75')
})

test('a pack that lost its preset keeps its brand accent — the parse must not throw the brand away', () => {
  const paper = PRESETS[DEFAULT_PRESET]
  // THE MIRROR OF THE TEST ABOVE, and it was false until review 3 (2026-09-08). `preset` is
  // required, so each of these fails `safeParse` — and `brand` used to be read out of that failed
  // parse, so the accent went with the preset and the card silently reverted to Paper. `useBrand`
  // merges `{ ...pack, brand }` over whatever the column holds, and `style_pack` is in the caller's
  // own UPDATE grant, so a pack with no preset is a thing this column can really carry.
  for (const packless of [
    { brand: { accent: '#FF1A75' } },
    { preset: 7, brand: { accent: '#FF1A75' } },
    { preset: null, brand: { accent: '#FF1A75' } },
  ]) {
    const pack = placeholderFor(packless)
    assert.equal(pack.accent, '#FF1A75', JSON.stringify(packless))
    // The preset is still Paper's — losing the preset is expected; losing the brand was the bug.
    assert.equal(pack.surface, paper.surface)
    assert.equal(pack.name, paper.name)
  }
  // A column holding something that is not an object at all still costs nothing.
  for (const junk of [null, undefined, 'paper', 42, [], ['brand']]) {
    assert.equal(placeholderFor(junk), paper, JSON.stringify(junk))
  }
})
