import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_PRESET, PACK_FAMILY_PREFIX, PRESETS, defaultStylePack, packFacesCss, placeholderFor, presetIdOf, siteAccentOf } from './lib/style-pack.ts'

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
   the user's own session may write (schema :1202, the `grant`), so it is re-validated on the way out. */

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

/* ───────── STORY 6.2 — THE PRESETS ARE THE LIBRARY'S (DW-15): the dashboard card and D4a's cell paint from the values the
   canvas's token block is computed from, and a pack's glyph is drawn in its own face under a family of its own. */

test('PRESETS is the library\'s twelve, in §D.d\'s order, each card colour the preset\'s own light value', async () => {
  const { PRESETS: LIBRARY } = await import('@inflozo/library/packs')
  assert.deepEqual(Object.keys(PRESETS), LIBRARY.map((p) => p.id))
  for (const p of LIBRARY) {
    const card = PRESETS[p.id]
    assert.equal(card?.name, p.name)
    assert.equal(card?.surface, p.pack.light.background, `${p.id}: FR-B1's surface is the light background`)
    assert.equal(card?.accent, p.pack.light.accent)
    assert.equal(card?.text, p.pack.light.text)
    assert.match(card?.glyphFamily ?? '', new RegExp(`^'${PACK_FAMILY_PREFIX}`), `${p.id}: the glyph is the pack face under the app's prefix`)
  }
  assert.equal(PRESETS.paper?.heading, 'Fraunces', 'R-231: Paper is Fraunces over Inter')
  assert.equal(PRESETS.paper?.body, 'Inter')
})

test('presetIdOf is placeholderFor\'s rule: a stored preset this build does not know is Paper', () => {
  assert.equal(presetIdOf({ preset: 'mono' }), 'mono')
  for (const junk of [{ preset: 'harbor' }, { preset: '__proto__' }, null, 'mono', {}]) assert.equal(presetIdOf(junk), DEFAULT_PRESET, JSON.stringify(junk))
})

test('packFacesCss declares every preset\'s heading face under the prefix, from the canvas route, and never an app face', () => {
  const css = packFacesCss('/canvas')
  const declared = [...css.matchAll(/font-family: '([^']+)'/g)].map((m) => m[1] as string)
  assert.ok(declared.length > 0)
  for (const f of declared) assert.ok(f.startsWith(PACK_FAMILY_PREFIX), f)
  for (const p of Object.values(PRESETS)) assert.ok(declared.includes(`${PACK_FAMILY_PREFIX}${p.heading}`), `${p.id}'s heading face is not declared`)
  // the app's own faces, read off its stylesheet — none may be redefined (the spec's Always)
  const app = new Set([...readFileSync(join('app', 'fonts', 'fonts.css'), 'utf8').matchAll(/font-family: '([^']+)'/g)].map((m) => m[1]))
  assert.ok(app.has('Inter'), 'the control: the app\'s own Inter was read')
  for (const f of declared) assert.ok(!app.has(f), `${f} redefines an app face`)
  for (const src of css.matchAll(/src: url\(([^)]+)\)/g)) assert.match(src[1] as string, /^\/canvas\?font=[a-z0-9-]+\.woff2&h=[0-9a-f]{12}$/)
  assert.doesNotMatch(css, /font-style: italic/, 'a heading face is roman only (§D.a rule 1)')
})

/* ───────── STORY 6.4 — a project's own packs: read through the one rule (AD-36), worn by the card, and the pool's pairings
   handed to the browser without the pool's record */

test('ownPacksOf keeps a project\'s valid own packs and drops each hostile one — a stored column is never trusted', async () => {
  const { packChoices } = await import('./lib/style-pack.ts')
  const paper = packChoices()[0]!.record
  const good = { ...paper, name: 'Studio Warm', light: { ...paper.light, accent: '#1E6BFF' } }
  const stored = {
    preset: 'custom-1',
    brand: { accent: '#2F4A3E' },
    packs: {
      'custom-1': good,
      tangerine: { ...good, name: 'Tangerine' },
      // the I/O matrix's hostile stored values, each its own record
      'custom-2': { ...good, light: { ...good.light, accent: '#fff;}body{display:none' } },
      'custom-3': { ...good, pillRadius: '1px;}*{x:y' },
      'custom-4': { ...good, pairing: 'D99' },
      'custom-5': { ...good, width: 'huge' },
      'custom-6': { ...good, name: 'x'.repeat(300) },
      harbor: good,
      // an OWN `__proto__` key, as a request body's JSON carries one (a literal's `__proto__:` would set the prototype)
      ...JSON.parse(`{"__proto__": ${JSON.stringify(good)}}`),
    },
  }
  const { ownPacksOf } = await import('./lib/style-pack.ts')
  assert.deepEqual(Object.keys(ownPacksOf(stored)).sort(), ['custom-1', 'tangerine'])
  for (const junk of [null, undefined, 'paper', {}, { packs: 'x' }, { packs: [good] }, { preset: 'paper' }]) assert.deepEqual(ownPacksOf(junk), {}, JSON.stringify(junk))
})

test('packIdOf is the pack in force: a preset, or a custom-<n> ownPacksOf holds — anything else is Paper', async () => {
  const { packChoices, packIdOf } = await import('./lib/style-pack.ts')
  const paper = packChoices()[0]!.record
  const made = { ...paper, name: 'Studio Warm' }
  assert.equal(packIdOf({ preset: 'mono' }), 'mono')
  assert.equal(packIdOf({ preset: 'custom-2', packs: { 'custom-2': made } }), 'custom-2')
  // a custom id naming no valid pack is Paper — the I/O matrix's "a dropped custom pack is gone, and a preset naming it is Paper"
  assert.equal(packIdOf({ preset: 'custom-2', packs: {} }), DEFAULT_PRESET)
  assert.equal(packIdOf({ preset: 'custom-2', packs: { 'custom-2': { ...made, pillRadius: '1px;}*{x:y' } } }), DEFAULT_PRESET)
  for (const junk of [{ preset: 'harbor' }, { preset: '__proto__' }, null, 'mono', {}, { preset: 7 }]) assert.equal(packIdOf(junk), DEFAULT_PRESET, JSON.stringify(junk))
})

test('placeholderFor paints an own pack\'s light background, text and accent — and the site\'s accent still wins (FR-C4)', async () => {
  const { packChoices } = await import('./lib/style-pack.ts')
  const paper = packChoices()[0]!.record
  const made = { ...paper, name: 'Studio Warm', light: { ...paper.light, background: '#FFF4EA', accent: '#1E6BFF', text: '#2B1D12' } }
  const card = placeholderFor({ preset: 'custom-1', packs: { 'custom-1': made } })
  assert.deepEqual([card.name, card.surface, card.text, card.accent], ['Studio Warm', '#FFF4EA', '#2B1D12', '#1E6BFF'])
  // an edited preset paints its own values too
  assert.equal(placeholderFor({ preset: 'paper', packs: { paper: made } }).surface, '#FFF4EA')
  assert.equal(placeholderFor({ preset: 'custom-1', packs: { 'custom-1': made }, brand: { accent: '#2F4A3E' } }).accent, '#2F4A3E')
  // a hostile own record never reaches the card's style: the library's Paper paints
  assert.equal(placeholderFor({ preset: 'paper', packs: { paper: { ...made, light: { ...made.light, background: 'red;}' } } } }), PRESETS[DEFAULT_PRESET])
})

test('pairingChoices hands every pool pairing, in §D.c\'s order, with its fonts and canvas faces — and nothing of the pool\'s record', async () => {
  const { POOL } = await import('@inflozo/library/packs')
  const { pairingChoices, pairingGlyphFacesCss } = await import('./lib/style-pack.ts')
  const pairings = pairingChoices()
  // the count derived from the pool, never written here
  assert.deepEqual(pairings.map((p) => p.id), POOL.pairings.map((p) => p.id))
  for (const p of pairings) {
    assert.match(p.faces, /src: url\(canvas\?font=[a-z0-9-]+\.woff2&h=[0-9a-f]{12}\)/, p.id)
    assert.match(p.glyphFamily, new RegExp(`^'${PACK_FAMILY_PREFIX}`), p.id)
    assert.match(p.bodyGlyphFamily, new RegExp(`^'${PACK_FAMILY_PREFIX}`), p.id)
    assert.equal(p.families.length, 2)
    assert.doesNotMatch(JSON.stringify(p), /licenceFile|sha256/, `${p.id}: the pool's record rides along`)
  }
  // the glyph faces: roman only, prefixed, and never one the layout's packFacesCss already declares
  const glyphs = pairingGlyphFacesCss('/canvas')
  assert.doesNotMatch(glyphs, /font-style: italic/)
  const declared = new Set([...packFacesCss('/canvas').matchAll(/src: url\(([^)]+)\)/g)].map((m) => m[1]))
  for (const src of glyphs.matchAll(/src: url\(([^)]+)\)/g)) assert.ok(!declared.has(src[1]), `${src[1]} is declared twice`)
  // the control: every pool family is drawable — a family with no roman face here or in the layout's would be no "Ag"
  const families = new Set([...`${glyphs}\n${packFacesCss('/canvas')}`.matchAll(/font-family: '([^']+)'/g)].map((m) => m[1]))
  for (const f of Object.keys(POOL.families)) assert.ok(families.has(`${PACK_FAMILY_PREFIX}${f}`), f)
})

test('Story 6.4 (the review) — "From your site" is the linked site\'s stored brand accent, as #RRGGBB, or nothing', () => {
  assert.equal(siteAccentOf({ brand: { accent: '#2f4a3e' } }), '#2F4A3E')
  assert.equal(siteAccentOf({ brand: { accent: '#abc' } }), '#AABBCC', 'three digits expanded')
  // the control's other half: anything else is no row — never a value handed to the draft
  for (const junk of [null, undefined, 'x', {}, { brand: null }, { brand: {} }, { accent: '#2f4a3e' }, { brand: { accent: 'red' } }, { brand: { accent: '#fff;}body{display:none' } }, { brand: { accent: 7 } }])
    assert.equal(siteAccentOf(junk), null, JSON.stringify(junk))
})
