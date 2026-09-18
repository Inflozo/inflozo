import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { REFERENCE_TOKENS } from '@inflozo/section-runtime'
import { referenceSwatches } from './lib/controls-review.ts'

/* STORY 5.6 — THE FLIP, AND WHAT IT MUST NOT DO.

   The mode lives in `editor.tsx`, which `node --test` cannot load (it strips types but not `.tsx`), so the two
   halves are checked the two ways this repo already checks such a thing: the PURE half is run
   (`lib/controls-review.ts`'s swatches, and the engine's own rows in `packages/section-runtime/src/controls.test.ts`),
   and the COMPONENT half is READ out of the source, the idiom `busy.test.ts` and `kit-button.test.ts` established.

   Reading the source is exactly right for this one, because the load-bearing claim is a NEGATIVE: the flip must not
   repaint. A test that could only see the rendered output would have to prove the absence of a paint; the source
   says it in one line — `flip` sets the attribute, re-stamps and marks, and never calls `paint()`. The deployed
   harness checks the observable half (the paint counter unchanged, the caret and the selection surviving). */

const editor = readFileSync('app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx', 'utf8')
const toggle = readFileSync('components/editor/mode-toggle.tsx', 'utf8')

/** One function's body, from its declaration to the line that closes it at the same indent. */
function body(source: string, declaration: string): string {
  const at = source.indexOf(declaration)
  assert.notEqual(at, -1, `${declaration} is gone from editor.tsx — this test reads it rather than restating it`)
  const rest = source.slice(at)
  const end = rest.indexOf('\n  }\n')
  assert.notEqual(end, -1, `${declaration} has no closing line at its own indent`)
  return rest.slice(0, end)
}

test('the swatches follow the mode, so the panel\'s dots are the colours the canvas is painting', () => {
  const [light, dark] = [referenceSwatches('light'), referenceSwatches('dark')]
  assert.deepEqual(Object.keys(dark).sort(), Object.keys(light).sort(), 'every role has a colour in both modes')
  for (const [role, value] of Object.entries(dark)) assert.ok(value.length > 0, `${role} has no dark colour`)
  // the two token sets are different objects with the same property set (`tokens.ts` asserts the sets equal), so at
  // least one role must differ — otherwise this function is reading one set twice
  assert.ok(Object.keys(light).some((role) => light[role] !== dark[role]), 'the dark swatches are the light ones')
  // …and each value IS the reference token's, never a literal of this app's (`tokens.test.ts`)
  const values = Object.values(REFERENCE_TOKENS.dark)
  for (const [role, value] of Object.entries(dark)) assert.ok(values.includes(value), `${role}: ${value} is not a dark reference token`)
  assert.equal(referenceSwatches().base, light.base, 'light is the default, so every existing caller is unchanged')
})

test('the mode is ONE attribute on the canvas root, written by every paint (AD-30, tokens.ts:165-172)', () => {
  const paint = body(editor, 'const paint = ()')
  assert.match(paint, /documentElement\.setAttribute\('data-mode', now\.mode\)/)
  // …and a repaint in dark draws the DARK render: `renderSection` reads `state.controls`, so the mode's slice has to
  // reach it here too, or an edit, a section operation or a change of canvas would silently return the page to light
  assert.match(paint, /renderSection\(doc, entry, \{ \.\.\.i, controls: storedFor\(entry, i, now\.mode\) \}/)
  // no second mode signal: no class, no body attribute, no per-control `-dark` twin
  assert.doesNotMatch(editor, /data-mode-dark|-dark"|scheme-dark/, 'AD-30 forbids a second mode signal')
})

test('a flip RE-STAMPS and never repaints, so the caret, the selection and the scroll survive it', () => {
  const flip = body(editor, 'const flip = (next: Mode)')
  assert.match(flip, /setAttribute\('data-mode', next\)/, 'the flip writes the attribute')
  assert.match(flip, /restampAll\(\)/, 'and re-stamps every root through the mode\'s slice')
  assert.doesNotMatch(flip, /\bpaint\(\)/, 'a repaint would replace the DOM and take the caret with it')
  // `stampControls` strips every root `data-*` it does not own, so the state marks are re-applied after it
  const restamp = body(editor, 'const restampAll = ()')
  assert.match(restamp, /stampControls\(/)
  assert.match(restamp, /mark\(\)/, '`stampControls` strips `data-inflozo-*`, so `mark()` follows every stamp')
  assert.doesNotMatch(restamp, /\bpaint\(\)/)
  // the slice is the engine's, in the mode being shown — the whole mechanism (AD-30)
  assert.match(editor, /storedFor\(design, state, latest\.current\.mode\)/)
})

test('the control is ABSENT on a Light-only project, never disabled (UX-DR3, R-118)', () => {
  assert.match(editor, /\{darkEnabled \? <ModeToggle mode=\{mode\} onMode=\{flip\} \/> : null\}/)
  // nothing anywhere greys it: a greyed control must carry a reason, and this one could never act here. (`ring` is
  // imported from `kit/greyed`, which is where the app's one focus ring lives — hence the narrow patterns.)
  assert.doesNotMatch(toggle, /aria-disabled|\sdisabled[=}]|greyed=|type Greyed/, 'the mode control has no greyed state at all')
})

test('R-132 — one button, an accessible name that names the DESTINATION, and a press that never takes the caret', () => {
  assert.doesNotMatch(toggle, /aria-pressed=/, 'a name that changes already says the state')
  assert.match(toggle, /onMouseDown=\{\(event\) => event\.preventDefault\(\)\}/)
  assert.match(toggle, /'Back to light mode' : 'Preview dark mode'/)
  assert.match(toggle, /aria-label=\{label\}/, 'the label is the accessible name (DESIGN.md:534-536\'s carve-out)')
  assert.match(toggle, /\{dark \? <Moon size=\{15\} \/> : <Sun size=\{15\} \/>\}/, 'the export\'s sun in light, the Kit\'s moon in dark')
  // the mode now SHOWING is announced politely, through the editor's ONE live region
  assert.match(editor, /setSaid\(modeShown\(next\)\)/)
  assert.match(editor, /id="editor-said" aria-live="polite"/)
})

test('R-133 — two entry points, ONE confirm, and it opens on Cancel (R-115, UX-DR14)', () => {
  const layers = readFileSync('components/controls/layers.tsx', 'utf8')
  const sidebar = readFileSync('components/controls/sidebar.tsx', 'utf8')
  // the confirm lives in editor.tsx, beside Delete's and Hide's, and both surfaces only ASK for it
  assert.match(editor, /openOnCancel\(clearDark\.current\)/)
  assert.match(editor, /clearDarkOverrides\(doc, askDark\.pick\.instanceId\)/)
  for (const [where, source] of [['layers.tsx', layers], ['sidebar.tsx', sidebar]] as const) {
    assert.doesNotMatch(source, /clearDarkOverrides/, `${where} must not clear anything itself — one act, one dialog`)
  }
  // the panel row is ALWAYS present and says there is nothing to clear (R-12); the menu item is ABSENT (UX-DR3)
  assert.match(sidebar, /Nothing to clear: this section&apos;s dark version already follows its light one\./)
  assert.match(layers, /row\.darkOverride \? \[\{ label: 'Clear dark overrides'/)
  assert.doesNotMatch(layers, /Clear dark overrides'[^\n]*greyed/i)
})
