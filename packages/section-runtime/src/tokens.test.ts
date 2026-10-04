// The token engine and its contract, checked in memory. An unset custom property fails SILENTLY — the declaration is
// dropped and the element renders with whatever it inherited — so a contract nothing checks is decorative.
//
// This is the half that can run inside a core package. The other half reads bytes off disk (the designs' `style.css`,
// `reference-tokens.css` itself, and Appendix D §D.0) and lives in `tools/stress/test-vocabulary.mjs`, because AD-1 bans
// `node:fs` here and the test-file exemption gives back only `node:test` and `node:assert`. Between them nothing about
// the contract is asserted twice and nothing is unasserted.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contrast } from './colour.ts'
import { LINK_RULES, SCALES, TOKEN_NAMES, TOKEN_ROWS, packTokens, packTokensCss } from './tokens.ts'
import { REFERENCE_PACK, REFERENCE_TOKENS, referenceTokensCss } from './reference.ts'
import type { Pack, PackMode } from './tokens.ts'

/** The kits' other two drawn packs, as CALIBRATION (`a29-kit.js:13-22`; every kit carries the same values): their
 *  palettes through Paper's faces and steps, so the AA rules are held on more than the one pack they were tuned on. */
const kit = (light: Omit<PackMode, 'scrim'>, dark: Omit<PackMode, 'scrim'>): Pack =>
  ({ ...REFERENCE_PACK, light: { ...light, scrim: 0.45 }, dark: { ...dark, scrim: 0.6 } })
const PACKS: Record<string, Pack> = {
  paper: REFERENCE_PACK,
  tangerine: kit(
    { background: '#FFF4EA', surface: '#FFFFFF', text: '#2A1B12', muted: '#7A6154', border: '#EFD8C3', accent: '#E8541F', onAccent: '#FFFFFF' },
    { background: '#1E1310', surface: '#2A1B15', text: '#FDF3E7', muted: '#AA9B8E', border: '#3A2A21', accent: '#F27C4A', onAccent: '#1E1310' },
  ),
  ink: kit(
    { background: '#F5F5F7', surface: '#FFFFFF', text: '#16161A', muted: '#63636E', border: '#E3E3E8', accent: '#2F6FED', onAccent: '#FFFFFF' },
    { background: '#16161A', surface: '#1F1F25', text: '#F4F4F6', muted: '#9C9CA2', border: '#2E2E34', accent: '#5A8CF5', onAccent: '#16161A' },
  ),
}
const MODES = ['light', 'dark'] as const
const props = (...rows: string[]) => rows.flatMap((r) => TOKEN_ROWS[r]?.properties ?? assert.fail(`no row "${r}"`))

/** The block's own shape (Design Notes): the properties each block of an emitted pack declares, by its head. */
function blocks(css: string): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const chunk of css.split('\n\n')) {
    const declared = [...chunk.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1] as string)
    if (declared.length > 0) out[(chunk.split('{')[0] as string).trim()] = declared
  }
  return out
}
// what a MODE decides, and what a WIDTH decides — Design Notes' lists, held against what the engine emits
const PER_MODE = [
  ...props('palette', 'border fade', 'contrast ground', 'on-contrast text', 'accent-on-contrast', 'elevation', 'hover surface',
    'negative', 'plate', 'scrim strength', 'shadow level', 'link style'),
  '--button-fill', '--button-border', '--button-text',
]
const RESPONSIVE = ['--site-margin', '--space-section', '--space-section-compact', '--space-section-spacious']

test('every row is COMPUTED or AUTHORED, names at least one property, and no property is named twice (R-32)', () => {
  for (const [row, { source, properties }] of Object.entries(TOKEN_ROWS)) {
    assert.ok(source === 'computed' || source === 'authored', `${row} is neither computed nor authored — the third state R-32 forbids`)
    assert.ok(properties.length > 0, `${row} declares no property`)
    for (const p of properties) assert.match(p, /^--[a-z][a-z0-9-]*$/, `${row}: "${p}" is not a custom property`)
  }
  assert.equal(new Set(TOKEN_NAMES).size, TOKEN_NAMES.length, 'a property is declared by two rows')
})

test('the author is asked for the palette, the fonts, a step on each scale, scrim strength and pill radius — and nothing else', () => {
  // each scale is one authored row, and every other authored row is one of the four non-step judgements
  const STEP_ROW: Record<keyof typeof SCALES, string> = {
    radius: 'radius scale', density: 'spacing density', width: 'site width', gutters: 'gutters',
    buttons: 'button style', shadow: 'shadow level', links: 'link style',
  }
  const authored = Object.entries(TOKEN_ROWS).filter(([, r]) => r.source === 'authored').map(([n]) => n).sort()
  assert.deepEqual(authored, [...Object.values(STEP_ROW), 'palette', 'fonts', 'scrim strength', 'pill radius'].sort())
  // …and the pack type asks exactly that: a step per scale, the faces, the pill, and per mode the palette's colours and a strength
  assert.deepEqual(Object.keys(REFERENCE_PACK).sort(), [...Object.keys(SCALES), 'light', 'dark', 'fonts', 'pillRadius'].sort())
  for (const mode of MODES) {
    assert.deepEqual(Object.keys(REFERENCE_PACK[mode]).sort(), ['accent', 'background', 'border', 'muted', 'onAccent', 'scrim', 'surface', 'text'])
  }
})

test('light and dark are COMPLETE and declare the same property set — the contract — for every pack', () => {
  for (const [name, pack] of Object.entries(PACKS)) {
    const t = packTokens(pack)
    for (const mode of MODES) assert.deepEqual(Object.keys(t[mode]), [...TOKEN_NAMES], `${name} ${mode} is not the contract, in its order`)
    for (const band of ['tablet', 'mobile'] as const) assert.deepEqual(Object.keys(t[band]).sort(), [...RESPONSIVE].sort(), `${name} ${band}`)
  }
  assert.deepEqual(Object.keys(REFERENCE_TOKENS.dark), Object.keys(REFERENCE_TOKENS.light), 'the reference maps disagree')
})

test('every value is non-empty, and every var(--…) inside one names a declared property', () => {
  const declared = new Set(TOKEN_NAMES)
  for (const mode of MODES) {
    for (const [k, v] of Object.entries(REFERENCE_TOKENS[mode])) {
      assert.ok(v.trim() !== '', `${mode} ${k} has no value`)
      for (const m of v.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
        assert.ok(declared.has(m[1] as string), `${mode} ${k} reads undeclared ${m[1] as string}`)
      }
    }
  }
})

test('Paper as drawn: every computed row takes Design Notes\' value, R-110 and R-112 exactly', () => {
  const want: Record<string, [string, string]> = {
    '--bg-contrast': ['#232019', '#F2EDE4'],
    '--text-on-contrast': ['#FBF9F5', '#171511'],
    '--accent-on-contrast': ['#D96C3F', '#AC512B'],
    '--bg-hover': ['#F3EFE8', '#2A261F'],
    '--plate': ['#F3EFE8', '#2A261F'],
    '--bg-elevated': ['#FFFFFF', '#2A261F'],
    '--negative': ['#D92D20', '#F04737'],
    '--border-fade': ['rgba(35, 32, 25, 0.08)', 'rgba(242, 237, 228, 0.1)'],
    '--scrim': ['rgba(35, 32, 25, 0.45)', 'rgba(23, 21, 17, 0.6)'],
    '--tag-accent': ['var(--border-hairline)', 'var(--border-hairline)'],
    '--figures-tabular': ['"tnum" 1', '"tnum" 1'],
    // Story 6.2 (R-231): Fraunces (cap .7) over Inter (cap .7275), each read off the pool's own file — it was Georgia's 3.504
    '--drop-cap-ratio': ['3.468', '3.468'],
    // R-110 (owner, 2026-09-15): the ink on the accent, both modes, as authored
    '--text-on-accent': ['#232019', '#171511'],
    '--button-text': ['#232019', '#171511'],
    // R-112 (owner, 2026-09-15): Light ink words with the accent underline, Dark the accent's own words
    '--link-color': ['#232019', '#E0805A'],
    '--link-decoration': ['underline #D96C3F', 'underline'],
    '--shadow-card': ['0 4px 16px rgba(35, 32, 25, 0.08)', 'none'],
  }
  for (const [property, [light, dark]] of Object.entries(want)) {
    assert.equal(REFERENCE_TOKENS.light[property], light, `light ${property}`)
    assert.equal(REFERENCE_TOKENS.dark[property], dark, `dark ${property}`)
  }
  assert.equal(contrast('#232019', '#D96C3F').toFixed(2), '4.77', "R-110's light ink on the accent")
  assert.equal(contrast('#171511', '#E0805A').toFixed(2), '6.43', "R-110's dark ink on the accent")
})

test('the width bands are the frames\' geometry: margins 72 · 40 · 20 px and Comfortable sections 96 · 80 · 64 px', () => {
  const t = packTokens(REFERENCE_PACK)
  const px = (rem: string | undefined) => parseFloat(rem ?? 'NaN') * 16
  assert.deepEqual([t.light, t.tablet, t.mobile].map((b) => px(b['--site-margin'])), [72, 40, 20])
  assert.deepEqual([t.light, t.tablet, t.mobile].map((b) => px(b['--space-section'])), [96, 80, 64])
  // A4-0's ladder for the two neighbours, and the frames' 1,296 px content at Normal
  assert.deepEqual([t.light, t.tablet, t.mobile].map((b) => px(b['--space-section-compact'])), [64, 56, 48])
  assert.deepEqual([t.light, t.tablet, t.mobile].map((b) => px(b['--space-section-spacious'])), [132, 108, 84])
  assert.equal(px(t.light['--site-width']), 1296)
})

test('every colour the engine computes for text holds 4.5:1 on its ground — Paper, and the kits\' Tangerine and Ink', () => {
  for (const [name, base] of Object.entries(PACKS)) {
    for (const buttons of ['soft', 'outline'] as const) {
      const t = packTokens({ ...base, buttons })
      for (const mode of MODES) {
        const v = t[mode]
        const on = (fg: string | undefined, bg: string | undefined, what: string) => {
          const r = contrast(fg as string, bg as string)
          assert.ok(r >= 4.5, `${name} ${mode} (${buttons}): ${what} ${fg} on ${bg} is ${r.toFixed(2)}:1`)
        }
        on(v['--text-on-contrast'], v['--bg-contrast'], 'on-contrast text')
        on(v['--accent-on-contrast'], v['--bg-contrast'], 'accent-on-contrast')
        on(v['--negative'], v['--bg-page'], 'negative on the page')
        on(v['--negative'], v['--bg-surface'], 'negative on the surface')
        // a section sits on the page ground or the surface, so a plain link and an Outline label read on both
        on(v['--link-color'], v['--bg-page'], 'the Accent link')
        on(v['--link-color'], v['--bg-surface'], 'the Accent link on the surface')
        // a Soft label sits on its own fill
        on(v['--button-text'], buttons === 'soft' ? v['--button-fill'] : v['--bg-page'], `the ${buttons} button's label`)
        if (buttons === 'outline') on(v['--button-text'], v['--bg-surface'], 'the outline button\'s label on the surface')
      }
    }
  }
})

test('review: the rules hold on packs Paper never exercises — a weak accent on the surface, weak text, grounds that straddle grey', () => {
  const dark = (over: Partial<PackMode>, rest: Partial<Pack> = {}) => packTokens({ ...REFERENCE_PACK, ...rest, dark: { ...REFERENCE_PACK.dark, ...over } }).dark
  // an accent that reads on the page (4.5:1 or more) and not on the lighter surface is not the link's or the label's words
  const weak = { background: '#121212', surface: '#3A3A3A', accent: '#8C8C8C' }
  assert.ok(contrast(weak.accent, weak.background) >= 4.5 && contrast(weak.accent, weak.surface) < 4.5, 'the control: the accent splits the two grounds')
  assert.equal(dark(weak)['--link-color'], REFERENCE_PACK.dark.text)
  assert.equal(dark(weak, { buttons: 'outline' })['--button-text'], REFERENCE_PACK.dark.text)
  // the band's words are stepped where even the better of background and text falls short on it
  const band = packTokens({ ...REFERENCE_PACK, light: { ...REFERENCE_PACK.light, text: '#999999' } }).light
  assert.ok(contrast(REFERENCE_PACK.light.background, '#999999') < 4.5, 'the control: the authored pair is weak')
  assert.ok(contrast(band['--text-on-contrast'] as string, band['--bg-contrast'] as string) >= 4.5)
  // grounds on either side of mid-grey: stepping for one undoes the other, so the red gives way to the better of black and white
  const grey = dark({ background: '#8A8A8A', surface: '#606060' })['--negative'] as string
  assert.ok(Math.min(contrast(grey, '#8A8A8A'), contrast(grey, '#606060')) >= 3.4, `${grey} is the best there is on both`)
  // the width bands carry a real value at every density step
  for (const density of Object.keys(SCALES.density) as Pack['density'][]) {
    const t = packTokens({ ...REFERENCE_PACK, density })
    for (const b of [t.tablet, t.mobile]) for (const [k, v] of Object.entries(b)) assert.match(String(v), /^\d+(\.\d+)?rem$/, `${density} ${k}`)
  }
})

test('the steps the drawings do not show take R-230\'s rules', () => {
  const p = REFERENCE_PACK
  const at = (over: Partial<Pack>, mode: 'light' | 'dark' = 'light') => packTokens({ ...p, ...over })[mode]
  assert.equal(at({ buttons: 'pill' })['--button-radius'], p.pillRadius, 'Pill is Solid with fully round ends')
  assert.equal(at({ buttons: 'pill' })['--button-fill'], p.light.accent)
  assert.equal(at({ radius: 'round' })['--button-radius'], '16px', 'every other button takes the radius step')
  assert.equal(at({ buttons: 'outline' })['--button-fill'], 'transparent')
  assert.equal(at({ links: 'underline' }, 'dark')['--link-color'], p.dark.text)
  assert.equal(at({ links: 'underline' }, 'dark')['--link-decoration'], 'underline')
  assert.equal(at({ shadow: 'lifted' })['--shadow-card'], '0 12px 32px rgba(35, 32, 25, 0.14)')
  assert.equal(at({ shadow: 'lifted' }, 'dark')['--shadow-card'], 'none', 'no shadow in dark at any step')
  // Compact and Airy are Comfortable × 0.75 and × 1.25, to the nearest 0.25rem
  assert.equal(at({ density: 'compact' })['--space-section'], '4.5rem')
  assert.equal(at({ density: 'airy' })['--space-section'], '7.5rem')
  assert.equal(packTokens({ ...p, density: 'airy' }).mobile['--space-section-spacious'], '6.5rem')
  // a body face without tabular figures computes `normal`
  assert.equal(at({ fonts: { ...p.fonts, body: { ...p.fonts.body, tabular: false } } })['--figures-tabular'], 'normal')
})

test('a step that does not exist, or a colour that is not #rrggbb, is refused by name', () => {
  // refused at the type (the typecheck fails the day `huge` becomes a step) and at run time
  // @ts-expect-error — 'huge' is not a width step
  assert.throws(() => packTokens({ ...REFERENCE_PACK, width: 'huge' }), /width: "huge" is not a step — narrow · normal · wide/)
  assert.throws(() => packTokens({ ...REFERENCE_PACK, light: { ...REFERENCE_PACK.light, accent: 'orange' } }), /light accent: "orange" is not a #rrggbb colour/)
  assert.throws(() => packTokens({ ...REFERENCE_PACK, dark: { ...REFERENCE_PACK.dark, scrim: 2 } }), /dark scrim/)
  // the free strings cannot close the declaration, the rule or the <style> the block is written into
  assert.throws(() => packTokens({ ...REFERENCE_PACK, pillRadius: '9px; } body { color: red' }), /pillRadius/)
  const family = (f: string): Pack => ({ ...REFERENCE_PACK, fonts: { ...REFERENCE_PACK.fonts, heading: { family: f, capHeight: 0.7 } } })
  assert.throws(() => packTokens(family('Georgia</style><script>x()</script>')), /heading font/)
  assert.throws(() => packTokens(family('Georgia; } :root { --bg-page: red')), /heading font/)
  assert.doesNotThrow(() => packTokens(family('"Libre Caslon Text", Georgia, serif')))
  assert.doesNotThrow(() => packTokens(family("'Señor Sans v2.0', serif")))
  // an open quote would swallow the declaration after it; a newline has no place in one
  for (const f of ['"Georgia', "Georgia', serif", 'Georgia,\nserif', ' ', ',']) assert.throws(() => packTokens(family(f)), /heading font/, JSON.stringify(f))
  assert.doesNotThrow(() => packTokens({ ...REFERENCE_PACK, pillRadius: '0' }))
  // a stored pack is JSON (Story 6.4): a missing part or a wrong type is refused by name, never by a TypeError
  const broken = (over: object) => () => packTokens({ ...REFERENCE_PACK, ...over } as unknown as Pack)
  assert.throws(broken({ fonts: undefined }), /^Error: fonts: missing/)
  assert.throws(broken({ dark: null }), /^Error: dark: missing/)
  assert.throws(broken({ fonts: { heading: REFERENCE_PACK.fonts.heading } }), /^Error: body font: missing/)
  assert.throws(broken({ fonts: { ...REFERENCE_PACK.fonts, body: { ...REFERENCE_PACK.fonts.body, tabular: 'false' } } }), /body font: tabular "false"/)
})

test('the block: :root declares every property, the dark blocks exactly the per-mode set, each width band exactly the responsive set', () => {
  const DARK = ['@media (prefers-color-scheme: dark)', ':root[data-mode="dark"]']
  const BANDS = ['@media (max-width: 1023px)', '@media (max-width: 767px)']
  for (const [name, pack] of Object.entries(PACKS)) {
    const b = blocks(packTokensCss(pack))
    assert.deepEqual(Object.keys(b).sort(), [':root', ...DARK, ...BANDS].sort(), `${name}: the blocks are not the block's shape`)
    assert.deepEqual(b[':root'], [...TOKEN_NAMES], `${name}: :root is not the whole contract`)
    for (const head of DARK) assert.deepEqual([...(b[head] ?? [])].sort(), [...PER_MODE].sort(), `${name}: ${head} is not the per-mode set`)
    for (const head of BANDS) assert.deepEqual([...(b[head] ?? [])].sort(), [...RESPONSIVE].sort(), `${name}: ${head} is not the responsive set`)
    // WHAT THE NARROWING MAY DROP: a property the dark blocks leave out must have the same value in both modes, or dark
    // would silently draw the light one
    const t = packTokens(pack)
    for (const p of TOKEN_NAMES.filter((n) => !PER_MODE.includes(n))) assert.equal(t.dark[p], t.light[p], `${name}: ${p} differs by mode and is not redeclared in dark`)
  }
  // and the reference stylesheet is Paper through the same door, under its header
  assert.ok(referenceTokensCss().endsWith(packTokensCss(REFERENCE_PACK)))
})

test('every pack\'s block ends with R-173\'s link rule — there is no other way to emit one', () => {
  for (const [name, pack] of Object.entries(PACKS)) {
    for (const links of Object.keys(SCALES.links) as Pack['links'][]) {
      assert.ok(packTokensCss({ ...pack, links }).trimEnd().endsWith(LINK_RULES), `${name} (${links}) does not end with LINK_RULES`)
    }
  }
})

test('R-173: a plain link reads the pack\'s two link tokens, at zero specificity, and keeps its ground\'s words where a section recolours', () => {
  const rules = LINK_RULES.split('\n')
  assert.ok(rules.length > 0 && rules.every((l) => l.includes('a:not([class])')), 'no rule for a plain link')
  // ZERO SPECIFICITY: strip every balanced `:where(…)` and nothing but spaces may be left, so any design selector wins
  const unwhere = (selector: string) => {
    let out = ''
    for (let i = 0; i < selector.length; i++) {
      if (selector.startsWith(':where(', i)) {
        let depth = 0
        let j = i + ':where'.length
        for (; j < selector.length; j++) {
          if (selector[j] === '(') depth++
          else if (selector[j] === ')' && --depth === 0) break
        }
        i = j
      } else out += selector[i]
    }
    return out.trim()
  }
  for (const rule of rules) assert.equal(unwhere(rule.slice(0, rule.indexOf('{'))), '', `not zero-specificity: ${rule}`)
  // THE TOKENS, never a colour: the link row's own two names, read from the contract rather than written here
  const [color, decoration] = props('link style') as [string, string]
  const plain = rules.find((r) => r.startsWith(':where(a:not([class]), a[class=""])'))
  assert.ok(plain?.includes(`color: var(${color})`) && plain.includes(`text-decoration: var(${decoration})`), plain)
  assert.ok(!rules.some((r) => /#[0-9a-f]{3,8}\b|rgb\(/i.test(r)), 'a link rule writes a colour instead of reading a token')
  // NEVER INVISIBLE: on each ground a section recolours, the words keep the ground's own colour
  for (const ground of ['contrast', 'accent', 'image']) {
    assert.ok(rules.some((r) => r.includes(`[data-bg="${ground}"]`) && r.includes('color: inherit')), `a link on ${ground} keeps the page's link colour`)
    // DW-224: there the words take the ground's colour, so the underline is the link's only sign — forced, whatever
    // `--link-decoration` a pack sets (WCAG 1.4.1)
    assert.ok(rules.some((r) => r.includes(`[data-bg="${ground}"]`) && r.includes('text-decoration-line: underline')), `a link on ${ground} can lose its underline`)
  }
  // DW-224: an anchor with `class=""` is a plain link too, and every rule reaches it
  for (const r of rules) assert.ok(r.slice(0, r.indexOf('{')).includes('a[class=""]'), `class="" escapes: ${r}`)
  // and every var(--…) the rules read is a declared token
  for (const name of LINK_RULES.match(/var\((--[a-z-]+)\)/g) ?? []) {
    assert.ok(TOKEN_NAMES.includes(name.slice(4, -1)), `${name} is not a token`)
  }
})

test('R-229: the link rule stays DOCUMENT-WIDE, so a plain link in a post\'s body takes the pack\'s look too', () => {
  // DW-224, built as the owner ruled (2026-10-03): no selector scopes the rule out of `{{content}}` — none names the post
  // body, and none carries a `:not(…)` beyond the one that says what a plain link is
  for (const rule of LINK_RULES.split('\n')) {
    const selector = rule.slice(0, rule.indexOf('{'))
    assert.doesNotMatch(selector, /gh-content/, `a link rule names the post body: ${rule}`)
    assert.doesNotMatch(selector.replaceAll('a:not([class])', ''), /:not\(/, `a link rule scopes itself with a :not(…): ${rule}`)
  }
})
