import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { contrast, packTokensCss, SCALES } from '@inflozo/section-runtime'
import {
  brandSeed, choiceOf, CUSTOM_ID, hardToRead, hexOf, hexToHsv, hsvToHex, isCustom, nextCustomId, ownPacksIn, PACK_EDIT_WORDS, packOf, packRecordSchema,
  pillStep, PILL_STEPS, scrimStep, withoutDefaults, type PackRecord,
} from './lib/pack-edit.ts'
import { packChoices, pairingChoices, presetRecord } from './lib/style-pack.ts'

// Story 6.4 — the client's one home for editing a Style Pack (`lib/pack-edit.ts`): the record's strict schema and the one
// reading rule (AD-36), the custom ids, the engine's own derivation of a pack as painted, the live contrast check, the
// colour maths of the picker, and the one word list (R-170, R-237).

const choices = packChoices()
const pairings = pairingChoices()
const recordOf = (id: string) => (choices.find((c) => c.id === id) ?? assert.fail(`no preset ${id}`)).record
const paper = recordOf('paper')
const reader = { isPreset: (id: string) => choices.some((c) => c.id === id), fontsOf: (id: string) => pairings.find((p) => p.id === id)?.fonts }
const pairing = (id: string) => pairings.find((p) => p.id === id) ?? assert.fail(`no pairing ${id}`)

/** The spec's hostile values, each refused by the schema — and each with what it is, so a failure names it. */
const HOSTILE: [string, unknown][] = [
  ['an accent carrying ;}', { ...paper, light: { ...paper.light, accent: '#fff;}body{display:none' } }],
  ['a pill radius carrying ;}', { ...paper, pillRadius: '1px;}*{x:y' }],
  ['a step not in SCALES', { ...paper, width: 'huge' }],
  ['a 300-character name', { ...paper, name: 'x'.repeat(300) }],
  ['an empty name', { ...paper, name: '   ' }],
  ['a scrim outside 0–1', { ...paper, dark: { ...paper.dark, scrim: 1.5 } }],
  ['a family name for a pairing', { ...paper, pairing: "'Fraunces', serif" }],
  ['a key the editor never writes', { ...paper, brand: { accent: '#FFFFFF' } }],
  ['a colour that is not six digits', { ...paper, dark: { ...paper.dark, text: '#fff' } }],
  ['a missing mode', { ...paper, dark: undefined }],
]

test('the record schema accepts every preset\'s record and refuses each hostile value', () => {
  for (const c of choices) assert.equal(packRecordSchema.safeParse(c.record).success, true, c.id)
  for (const [why, value] of HOSTILE) assert.equal(packRecordSchema.safeParse(value).success, false, why)
  // a name is trimmed, and kept
  assert.equal(packRecordSchema.parse({ ...paper, name: '  Studio Warm ' }).name, 'Studio Warm')
})

test('ownPacksIn keeps the valid records under valid ids and drops every other — never throwing', () => {
  const good = { ...paper, name: 'Studio Warm' }
  const kept = ownPacksIn(
    {
      paper: { ...paper, light: { ...paper.light, accent: '#1E6BFF' } },
      'custom-2': good,
      // ids that are no pack
      harbor: good,
      // an OWN `__proto__` key, as a request body's JSON carries one (a literal's `__proto__:` would set the prototype)
      ...JSON.parse(`{"__proto__": ${JSON.stringify(good)}}`),
      'custom-0': good,
      'custom-x': good,
      // records the schema refuses, the pool does not hold, or the engine refuses
      tangerine: HOSTILE[0]?.[1],
      'custom-3': { ...good, pairing: 'D99' },
      'custom-4': { ...good, pillRadius: '1px;}*{x:y' },
    },
    reader,
  )
  assert.deepEqual(Object.keys(kept).sort(), ['custom-2', 'paper'])
  assert.equal(kept.paper?.light.accent, '#1E6BFF')
  // and for anything that is not a map at all, none
  for (const junk of [null, undefined, 'paper', 42, [], [good]]) assert.deepEqual(ownPacksIn(junk, reader), {}, JSON.stringify(junk))
})

test('CUSTOM_ID names a pack the project made, and nextCustomId is the smallest free number', () => {
  for (const id of ['custom-1', 'custom-12', 'custom-9999']) assert.ok(CUSTOM_ID.test(id) && isCustom(id), id)
  for (const id of ['custom-0', 'custom-', 'custom-01', 'custom-10000', 'paper', 'Custom-1', 'custom-1 ']) assert.ok(!isCustom(id), id)
  assert.equal(nextCustomId({}), 'custom-1')
  assert.equal(nextCustomId({ 'custom-1': paper, 'custom-2': paper }), 'custom-3')
  assert.equal(nextCustomId({ 'custom-2': paper, paper }), 'custom-1', 'a number an undo freed is used again')
})

test('choiceOf on Paper\'s record IS packChoices()\'s Paper — the one derivation — apart from the generated header of its block', () => {
  const server = choices[0]!
  const browser = choiceOf('paper', paper, pairing(paper.pairing))
  assert.deepEqual({ ...browser, tokens: '' }, { ...server, tokens: '' })
  assert.ok(server.tokens.endsWith(browser.tokens), 'Paper\'s block is the engine\'s, under its generated header')
  assert.ok(server.tokens.startsWith('/* GENERATED'), 'the control: the server\'s Paper carries the header')
  // every other preset is the very same object shape and values, block included
  for (const c of choices.slice(1)) assert.deepEqual(choiceOf(c.id, c.record, pairing(c.record.pairing)), c, c.id)
  // an edit is painted: its block carries the edited value, and its dots follow
  const edited = choiceOf('paper', { ...paper, light: { ...paper.light, accent: '#1E6BFF' } }, pairing(paper.pairing))
  assert.match(edited.tokens, /^ {2}--accent: #1E6BFF;$/m)
  assert.equal(edited.cellDots[1], '#1E6BFF')
  assert.equal(edited.tokens, packTokensCss(packOf({ ...paper, light: { ...paper.light, accent: '#1E6BFF' } }, pairing(paper.pairing).fonts)))
})

test('hardToRead checks 6.2\'s five pairs in both modes — every preset passes, and a broken one is named', () => {
  for (const c of choices) assert.deepEqual(hardToRead(c.record), [], c.id)
  // the control: Paper with light text #DDDDDD fails text on the base and on the surface, in Light only
  const pale = { ...paper, light: { ...paper.light, text: '#DDDDDD' } }
  const hard = hardToRead(pale)
  assert.deepEqual(hard.map((p) => PACK_EDIT_WORDS.pair(p).replace(/, [\d.]+:1$/, '')), ['Text on Base in Light', 'Text on Surface in Light'])
  assert.match(PACK_EDIT_WORDS.warning(hard), /^Hard to read: Text on Base in Light, \d\.\d:1; Text on Surface in Light, \d\.\d:1\. Small text needs 4\.5:1 — you can still save\.$/)
  // on-accent on accent, dark
  assert.deepEqual(hardToRead({ ...paper, dark: { ...paper.dark, onAccent: paper.dark.accent } }).map((p) => [p.mode, p.fg, p.bg]), [['dark', 'onAccent', 'accent']])
})

test('a failing ratio is FLOORED to one decimal, so it never prints 4.5', () => {
  const muted = '#777777'
  const ratio = contrast(muted, paper.light.surface)
  // the control: this pair really is just under 4.5, where rounding would print 4.5
  assert.ok(ratio > 4.45 && ratio < 4.5, String(ratio))
  const hard = hardToRead({ ...paper, light: { ...paper.light, muted } }).find((p) => p.fg === 'muted' && p.bg === 'surface')
  assert.equal(hard?.ratio, 4.4)
  assert.match(PACK_EDIT_WORDS.pair(hard!), /, 4\.4:1$/)
})

test('withoutDefaults drops a preset\'s record equal to the library\'s, and keeps an edited one and every pack the project made', () => {
  const presets = Object.fromEntries(choices.map((c) => [c.id, c.record]))
  const edited = { ...paper, width: 'wide' as const }
  const made = { ...paper, name: 'Studio Warm' }
  assert.deepEqual(withoutDefaults({ paper: { ...paper }, mono: edited, 'custom-1': made }, presets), { mono: edited, 'custom-1': made })
  // the same record built in another key order is still the library's
  const reordered = Object.fromEntries(Object.entries(paper).reverse()) as PackRecord
  assert.deepEqual(withoutDefaults({ paper: reordered }, presets), {})
})

test('every preset colour survives hexToHsv then hsvToHex exactly', () => {
  for (const c of choices) {
    for (const mode of ['light', 'dark'] as const) {
      for (const [role, hex] of Object.entries(c.record[mode])) {
        if (role === 'scrim') continue
        assert.equal(hsvToHex(hexToHsv(hex as string)), (hex as string).toUpperCase(), `${c.id} ${mode} ${role}`)
      }
    }
  }
  // the ends: black, white and a pure hue
  assert.deepEqual(hexToHsv('#000000'), { h: 0, s: 0, v: 0 })
  assert.equal(hsvToHex({ h: 0, s: 0, v: 100 }), '#FFFFFF')
  assert.equal(hsvToHex({ h: 120, s: 100, v: 100 }), '#00FF00')
})

/* ───────── STORY 6.6 — THE BRAND SEED (FR-E5, R-241): the one rule both doors call. The spec's I/O matrix's colours — T1's
   pink, a navy, Paper's own orange, and a short hex — over every preset. */

const SITE_COLOURS = ['#FF1A75', '#1E3A8A', '#D96C3F', hexOf('#f2a') as string]

test('brandSeed: light is the accent exactly, dark reads 4.5:1 on dark Base and Surface, and no seeded on-accent reads under 4.5:1 — on every preset', () => {
  // the control: the colours really are hard cases — navy is near-invisible on a dark page, and Paper's ink misses on pink
  assert.ok(contrast('#1E3A8A', paper.dark.background) < 4.5, 'the control: navy fails on dark Base unstepped')
  assert.ok(contrast(paper.light.onAccent, '#FF1A75') < 4.5, 'the control: Paper\'s own on-accent fails on pink')
  for (const c of choices) {
    for (const accent of SITE_COLOURS) {
      const seeded = brandSeed(c.record, accent)
      const at = `${c.id} with ${accent}`
      assert.equal(seeded.light.accent, accent, at)
      assert.ok(contrast(seeded.dark.accent, c.record.dark.background) >= 4.5, `${at}: dark accent on dark Base`)
      assert.ok(contrast(seeded.dark.accent, c.record.dark.surface) >= 4.5, `${at}: dark accent on dark Surface`)
      for (const m of ['light', 'dark'] as const) assert.ok(contrast(seeded[m].onAccent, seeded[m].accent) >= 4.5, `${at}: ${m} on-accent`)
      // a seed adds no on-accent failure: whatever hardToRead finds after, it found before
      const pairs = (r: PackRecord) => hardToRead(r).map((p) => `${p.mode}:${p.fg}/${p.bg}`)
      assert.deepEqual(pairs(seeded).filter((p) => !pairs(c.record).includes(p)), [], `${at}: a new warning`)
      // the rest of the record is unchanged — every key but the two modes' accent and on-accent
      const rest = (r: PackRecord) => ({ ...r, light: { ...r.light, accent: '', onAccent: '' }, dark: { ...r.dark, accent: '', onAccent: '' } })
      assert.deepEqual(rest(seeded), rest(c.record), `${at}: something else moved`)
      assert.equal(packRecordSchema.safeParse(seeded).success, true, `${at}: the seeded record is a valid record`)
    }
  }
})

test('brandSeed: the spec\'s ruled values (R-241), computed with the engine\'s own stepToContrast', () => {
  const at = (accent: string) => {
    const s = brandSeed(paper, accent)
    return [s.light.accent, s.light.onAccent, s.dark.accent, s.dark.onAccent]
  }
  // T1's pink: Paper's ink read 4.38, so the light on-accent is stepped; the dark accent already reads, so it is kept
  assert.deepEqual(at('#FF1A75'), ['#FF1A75', '#1F1C16', '#FF1A75', '#171511'])
  // navy: lightened in dark only (R-241), and Base reads on it in light
  assert.deepEqual(at('#1E3A8A'), ['#1E3A8A', '#FBF9F5', '#5E82D9', '#171511'])
  // Paper's own orange: light kept exactly (with its own on-accent), dark is the orange itself — not Paper's tuned dark
  assert.deepEqual(at('#D96C3F'), ['#D96C3F', '#232019', '#D96C3F', '#171511'])
  // a short hex arrives expanded (`hexOf`), and the seed writes it uppercase
  assert.equal(brandSeed(paper, hexOf('#f2a') as string).light.accent, '#FF22AA')
  assert.equal(brandSeed(paper, '#ff1a75').light.accent, '#FF1A75')
})

test('brandSeed: an accent that is not #RRGGBB is a no-op — the record itself comes back', () => {
  for (const junk of ['#f2a', 'red', '', '#FF1A75;}body{x:y', 'rgb(0,0,0)', '#GGGGGG']) assert.equal(brandSeed(paper, junk), paper, junk)
  // the control: a real colour does make a new record
  assert.notEqual(brandSeed(paper, '#FF1A75'), paper)
  // a seed twice is the seed once — so the second press of either door changes nothing
  const once = brandSeed(paper, '#1E3A8A')
  assert.deepEqual(brandSeed(once, '#1E3A8A'), once)
  assert.equal(PACK_EDIT_WORDS.wearsBrand('Paper'), 'Paper already wears your brand.')
})

test('the hex field takes six digits or three, either case, with or without the hash, trimmed — and nothing else', () => {
  for (const typed of ['#1e6bff', '1E6BFF', ' #1E6BFF ', '#1E6BFF']) assert.equal(hexOf(typed), '#1E6BFF', typed)
  assert.equal(hexOf('#1af'), '#11AAFF', 'three digits expanded')
  for (const junk of ['#12', 'blue', '', '#1E6BF', '#1E6BFFF', '#GGGGGG', 'rgb(0,0,0)']) assert.equal(hexOf(junk), null, junk)
})

test('Pill radius steps 0 to 40 px then Full, and Image scrim 0–100 % by 5', () => {
  assert.equal(PILL_STEPS[0], '0px')
  assert.equal(PILL_STEPS.at(-1), '999px')
  assert.equal(pillStep('40px', 1), '999px')
  assert.equal(pillStep('999px', 1), '999px')
  assert.equal(pillStep('999px', -1), '40px')
  assert.equal(pillStep('0px', -1), '0px')
  assert.equal(pillStep('2px', 1), '3px')
  assert.equal(PACK_EDIT_WORDS.pillValue('999px'), 'Full')
  assert.equal(PACK_EDIT_WORDS.pillValue('12px'), '12 px')
  assert.equal(scrimStep(0.45, 1), 0.5)
  assert.equal(scrimStep(0.47, -1), 0.45, 'a value off the steps snaps to them')
  assert.equal(scrimStep(1, 1), 1)
  assert.equal(scrimStep(0, -1), 0)
  assert.equal(PACK_EDIT_WORDS.percent(0.45), '45 %')
})

/** Appendix C's "Every named scale in the product" rows whose level is Style Pack: each title and its values, in order. */
function appendixC(): Map<string, string[]> {
  const prd = readFileSync(join(import.meta.dirname, '..', '..', '_bmad-output', 'planning-artifacts', 'prds', 'prd-Inflozo-2026-08-17', 'prd.md'), 'utf8')
  const strip = (s: string) => s.replace(/\*\*/g, '').trim()
  return new Map(
    [...prd.matchAll(/^\| ([^|]+) \| Style Pack \| ([^|]+) \|$/gm)].map((m) => [strip(m[1] as string), strip(m[2] as string).split(' / ').map(strip)]),
  )
}

test('the rows\' titles and steps ARE Appendix C\'s Style Pack rows, and their keys are SCALES\' (R-170)', () => {
  const rows = appendixC()
  // the control: the table was read, and holds every row the panel draws
  assert.equal(rows.size, PACK_EDIT_WORDS.rows.length, `Appendix C's Style Pack rows: ${[...rows.keys()].join(', ')}`)
  for (const row of PACK_EDIT_WORDS.rows) {
    assert.deepEqual(Object.values(row.steps), rows.get(row.title), `${row.title}: the steps are not Appendix C's`)
    assert.deepEqual(Object.keys(row.steps).sort(), Object.keys(SCALES[row.key]).sort(), `${row.title}: the keys are not SCALES.${row.key}'s`)
  }
  // Site width reads Narrow · Normal · Wide and Spacing density Compact · Comfortable · Airy — the plan's, not S7a's
  assert.deepEqual(Object.values(PACK_EDIT_WORDS.rows.find((r) => r.key === 'width')!.steps), ['Narrow', 'Normal', 'Wide'])
  assert.deepEqual(Object.values(PACK_EDIT_WORDS.rows.find((r) => r.key === 'density')!.steps), ['Compact', 'Comfortable', 'Airy'])
})

test('the font rows are Heading font and Body font, the seven colours start at Base (R-237), and no drawing\'s stray word is said', () => {
  assert.equal(PACK_EDIT_WORDS.headingFont, 'Heading font')
  assert.equal(PACK_EDIT_WORDS.bodyFont, 'Body font')
  assert.deepEqual(Object.values(PACK_EDIT_WORDS.roles), ['Base', 'Surface', 'Text', 'Muted', 'Border', 'Accent', 'On-accent'])
  // the words S7a and S7c draw where the plan and the rulings name otherwise (DW-310, R-237)
  const said = JSON.stringify([
    PACK_EDIT_WORDS.rows,
    PACK_EDIT_WORDS.headingFont,
    PACK_EDIT_WORDS.bodyFont,
    PACK_EDIT_WORDS.pillRadius,
    PACK_EDIT_WORDS.roles,
    PACK_EDIT_WORDS.scrim,
  ])
  for (const stray of ['Standard', 'Spacious', 'Corners', 'Title font', 'Background', 'Contrast']) assert.ok(!said.includes(stray), stray)
})
