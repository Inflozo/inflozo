// Story 6.5 — a section's dark override as a visitor sees it (DW-195): the hook and the token block's per-section rules,
// over the spec's I/O matrix. The design is held in memory (a core package's test opens no file, AD-1); the library's
// own designs meet the same rule through the validator (`mode-scoped-rule`), and the browser proves the two ways agree —
// the canvas re-stamping, the theme's block — element by element in `tools/keyboard/mode.spec.mjs`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BACKGROUND_ROLES } from '@inflozo/library'
import type { ControlDef } from '@inflozo/library'
import { darkHook, darkOverrideCss, HOOK_RE } from './dark-override.ts'
import type { PlacedSection } from './dark-override.ts'
import { GROUND_LINKS, MODE_SELECTORS } from './tokens.ts'

const TINT: ControlDef = { name: 'tint', type: 'segmented', label: 'Tint', group: 'style', values: ['none', 'soft', 'strong'], default: 'none', darkOverride: true }
const CSS = [
  '.sx { background: var(--sx-ground); color: var(--sx-ink); }',
  '.sx[data-bg="base"] { --sx-ground: var(--bg-page); --sx-ink: var(--text-body); }',
  '.sx[data-bg="surface"] { --sx-ground: var(--bg-surface); --sx-ink: var(--text-body); }',
  '.sx[data-bg="contrast"] { --sx-ground: var(--bg-contrast); --sx-ink: var(--text-on-contrast); }',
  '.sx[data-tint="none"] { --sx-tint: initial; }',
  '.sx[data-tint="soft"] { --sx-tint: var(--bg-hover); }',
  '.sx[data-tint="strong"] { --sx-tint: var(--plate); }',
  '.sx__words { background: var(--sx-tint); }',
].join('\n')
const entry: PlacedSection['entry'] = {
  id: 'sx/1',
  html: '<section class="sx" data-bg="base" data-spacing="comfortable" data-divider="none" data-tint="none"><p class="sx__words">w <a href="#">a</a></p></section>',
  css: CSS,
  controlSchema: [TINT],
  universals: { bg: { values: ['base', 'surface', 'contrast'], reason: 'drawn for plain grounds' } },
}
const KEY = 'home:auto-home-4'
const placed = (state: PlacedSection['state'], key = KEY, e = entry): PlacedSection => ({ key, entry: e, state })

/** A selector's specificity, for the forms the block writes: `:where()` is zero, `:not()`/`:is()`/`:has()` take their most
 *  specific argument, an attribute or a class or a pseudo-class is one B, a type one C. */
function specificity(selector: string): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0]
  const add = (s: [number, number, number]) => { out[0] += s[0]; out[1] += s[1]; out[2] += s[2] }
  const args = (inner: string) => {
    const parts: string[] = []
    let depth = 0
    let from = 0
    for (let i = 0; i < inner.length; i++) {
      if ('([' .includes(inner.charAt(i))) depth++
      else if (')]'.includes(inner.charAt(i))) depth--
      else if (inner.charAt(i) === ',' && depth === 0) { parts.push(inner.slice(from, i)); from = i + 1 }
    }
    return [...parts, inner.slice(from)]
  }
  for (let i = 0; i < selector.length;) {
    const c = selector.charAt(i)
    if (c === '[') { out[1]++; i = selector.indexOf(']', i) + 1 } else if (c === '.' || c === '#') {
      out[c === '#' ? 0 : 1]++
      for (i++; i < selector.length && /[\w-]/.test(selector.charAt(i)); i++);
    } else if (c === ':') {
      const m = /^:([\w-]+)(\()?/.exec(selector.slice(i)) as RegExpExecArray
      i += m[0].length
      if (m[2] === undefined) { out[1]++; continue }
      let depth = 1
      const from = i
      for (; depth > 0; i++) depth += selector.charAt(i) === '(' ? 1 : selector.charAt(i) === ')' ? -1 : 0
      const inner = selector.slice(from, i - 1)
      if (m[1] === 'where') continue
      if (['is', 'not', 'has'].includes(m[1] as string)) add(args(inner).map(specificity).sort((x, y) => y[0] - x[0] || y[1] - x[1] || y[2] - x[2])[0] as [number, number, number])
      else out[1]++
    } else if (/[a-z]/i.test(c)) {
      out[2]++
      for (; i < selector.length && /[\w-]/.test(selector.charAt(i)); i++);
    } else i++
  }
  return out
}
const rulesOf = (css: string) => [...css.matchAll(/^\s*([^{}\n@/][^{}\n]*?)\s*\{([^}]*)\}/gm)].map((m) => ({ selectors: (m[1] as string).trim(), body: (m[2] as string).trim() }))
const atLeast = (s: [number, number, number], floor: [number, number, number]) => s[0] > floor[0] || (s[0] === floor[0] && (s[1] > floor[1] || (s[1] === floor[1] && s[2] >= floor[2])))

test('the hook: a hash of the section\'s key, eight hex digits, only while an override of it is in force', () => {
  const on = { controls: { bg: 'base' }, darkOverrides: { bg: 'contrast' } }
  const hook = darkHook(entry, on, KEY)
  assert.match(hook ?? '', HOOK_RE)
  assert.equal(darkHook(entry, on, KEY), hook, 'the same key, the same hook — Epic 7 hashes it again for the file it compiles')
  assert.notEqual(darkHook(entry, on, 'home-2:auto-home-4'), hook, 'a doc-qualified key: Home\'s page-2 copy shares the id, never the hook')
  assert.equal(darkHook(entry, { controls: { bg: 'base' } }, KEY), undefined, 'no override, no hook')
})

test('Base → Contrast: the dark value\'s root declarations and its plain link, under MODE_SELECTORS\' two conditions, at their specificities', () => {
  const state = { controls: { bg: 'base' }, darkOverrides: { bg: 'contrast' } }
  const hook = darkHook(entry, state, KEY) as string
  const css = darkOverrideCss([placed(state)])
  const props = '--sx-ground: var(--bg-contrast); --sx-ink: var(--text-on-contrast);'
  const scoped = (c: string) => `${c} [data-instance="${hook}"]`
  assert.ok(css.includes(`@media ${MODE_SELECTORS.media} {\n  ${scoped(MODE_SELECTORS.system)} { ${props} }`), css)
  assert.ok(css.includes(`  :where(${scoped(MODE_SELECTORS.system)}) a:where(:not([class]), [class=""]) { ${GROUND_LINKS['contrast']} }`), css)
  const explicit = MODE_SELECTORS.explicit.map(scoped).join(', ')
  assert.ok(css.includes(`\n${explicit} { ${props} }`), css)
  assert.ok(css.includes(`\n:where(${explicit}) a:where(:not([class]), [class=""]) { ${GROUND_LINKS['contrast']} }`), css)
  // SPECIFICITY (Design Notes): every property rule beats the design's root rule `.sx[data-bg="base"]` (0,2,0) — at
  // (0,3,1) or above — and every link rule sits at exactly (0,0,1): above LINK_RULES' zero, below any design link rule
  const rules = rulesOf(css)
  assert.equal(rules.length, 4, 'two conditions × the properties and the link')
  assert.deepEqual(specificity('.sx[data-bg="base"]'), [0, 2, 0])
  for (const r of rules) {
    for (const s of r.selectors.startsWith(':where(') ? [r.selectors] : r.selectors.split(', :root').map((x, i) => (i === 0 ? x : `:root${x}`))) {
      const got = specificity(s)
      if (r.body.startsWith('--')) assert.ok(atLeast(got, [0, 3, 1]), `${s} is ${got.join(',')}`)
      else assert.deepEqual(got, [0, 0, 1], s)
    }
  }
  // EVERY MODE-NAMING SELECTOR IS MODE_SELECTORS': strip the scope and nothing else is left
  for (const r of rules) {
    const conditions = r.selectors.replace(/^:where\((.*)\) a:where\(:not\(\[class\]\), \[class=""\]\)$/, '$1').split(` [data-instance="${hook}"]`).map((c) => c.replace(/^, /, '')).filter(Boolean)
    for (const c of conditions) assert.ok([MODE_SELECTORS.system, ...MODE_SELECTORS.explicit].includes(c as never), c)
  }
})

test('Contrast → Base: the plain link takes the pack\'s link look again; a design\'s own control (`tint`) writes its set and no link', () => {
  const back = darkOverrideCss([placed({ controls: { bg: 'contrast' }, darkOverrides: { bg: 'base' } })])
  assert.match(back, /--sx-ground: var\(--bg-page\); --sx-ink: var\(--text-body\);/)
  assert.ok(back.includes(`a:where(:not([class]), [class=""]) { ${GROUND_LINKS['base']} }`))
  const tint = darkOverrideCss([placed({ controls: { tint: 'none' }, darkOverrides: { tint: 'strong' } })])
  assert.match(tint, /\{ --sx-tint: var\(--plate\); \}/)
  assert.doesNotMatch(tint, /a:where/, 'only the Background\'s ground moves a plain link')
  // strong → none: the `initial` set, so every reader falls back to the light look's
  assert.match(darkOverrideCss([placed({ controls: { tint: 'strong' }, darkOverrides: { tint: 'none' } })]), /\{ --sx-tint: initial; \}/)
  // both at once: one rule, both sets
  assert.match(darkOverrideCss([placed({ controls: { bg: 'base', tint: 'none' }, darkOverrides: { bg: 'contrast', tint: 'soft' } })]), /\{ --sx-tint: var\(--bg-hover\); --sx-ground: var\(--bg-contrast\); --sx-ink: var\(--text-on-contrast\); \}/)
})

test('nothing in force writes nothing: no section, no override, one this design does not offer, one parked under another design, one equal to the light value', () => {
  assert.equal(darkOverrideCss([]), '')
  assert.equal(darkOverrideCss([placed({ controls: { bg: 'contrast' } })]), '')
  const offered = { controls: { bg: 'base' }, darkOverrides: { bg: 'accent' } }
  assert.equal(darkOverrideCss([placed(offered)]), '')
  assert.equal(darkHook(entry, offered, KEY), undefined, 'the hook follows the same rule (darkOverridesInForce)')
  const parked = { controls: { bg: 'base' }, parkedControls: { 'other/1': { controls: {}, darkOverrides: { bg: 'contrast' } } } }
  assert.equal(darkOverrideCss([placed(parked)]), '')
  assert.equal(darkHook(entry, parked, KEY), undefined)
  assert.equal(darkOverrideCss([placed({ controls: { bg: 'surface' }, darkOverrides: { bg: 'surface' } })]), '', 'an override equal to its light value changes nothing')
  assert.equal(darkHook(entry, { controls: { bg: 'surface' }, darkOverrides: { bg: 'surface' } }, KEY), undefined, '…so it carries no hook either: a hook exactly where the block has a rule')
})

test('refused by name, never skipped: two sections on one hook, a stylesheet that breaks the rule, a value with no root rule', () => {
  const on = { controls: { bg: 'base' }, darkOverrides: { bg: 'contrast' } }
  // one key twice, and two keys whose FNV-1a hashes collide (found by search: both a0cdad06)
  assert.throws(() => darkOverrideCss([placed(on), placed(on)]), /"home:auto-home-4" and "home:auto-home-4" share the hook .*handed twice/)
  assert.equal(darkHook(entry, on, 'home:s10161'), darkHook(entry, on, 'home:s488360'), 'the control: the two keys collide')
  assert.throws(() => darkOverrideCss([placed(on, 'home:s10161'), placed(on, 'home:s488360')]), /"home:s10161" and "home:s488360" share the hook a0cdad06 — their keys collide/)
  // …and a section with no override in force has no hook, so it can collide with nothing
  assert.doesNotThrow(() => darkOverrideCss([placed(on, 'home:s10161'), placed({ controls: { bg: 'base' } }, 'home:s488360')]))
  // a value the stylesheet never states: refused, naming the design and the value
  const lacking = { ...entry, css: CSS.replace('.sx[data-bg="contrast"] { --sx-ground: var(--bg-contrast); --sx-ink: var(--text-on-contrast); }', '') }
  assert.throws(() => darkOverrideCss([placed(on, KEY, lacking)]), /sx\/1.*data-bg="contrast"/)
  // AD-36: a root rule whose value could close the <style> the block is written into never reaches it
  const hostile = { ...entry, css: CSS.replace('--sx-ink: var(--text-on-contrast);', '--sx-ink: "</style><script>x()</script>";') }
  assert.throws(() => darkOverrideCss([placed(on, KEY, hostile)]), /sx\/1's stylesheet breaks the authoring rule/)
})

test('GROUND_LINKS answers every Background value the vocabulary has, and no other', () => {
  assert.deepEqual(Object.keys(GROUND_LINKS).sort(), [...BACKGROUND_ROLES].sort())
})
