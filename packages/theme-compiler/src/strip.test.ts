// Story 7.4 — FR-G7's strip, held to the spec's matrix rows and its parser traps. The sheets are inline copies of the
// library's shapes (a core package's test opens no file, AD-1); the roots are `resolveControls`' output, as the compile
// hands them, so a forced value is read as the theme ships it.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { ControlDef } from '@inflozo/library'
import { resolveControls } from '@inflozo/section-runtime'
import { stripCss } from './strip.ts'

const seg = (name: string, values: string[], def = values[0] as string, over: Partial<ControlDef> = {}): ControlDef =>
  ({ name, type: 'segmented', label: name, group: 'layout', values, default: def, ...over }) as ControlDef

// A17 #1's shape: per-row two · three · four, three by default, and the Background universal
const A17 = { controlSchema: [seg('per-row', ['two', 'three', 'four'], 'three')], universals: { bg: { values: ['base', 'surface', 'contrast'], reason: 'x' } } }
const A17_CSS = [
  '.a17-1 { background: var(--a17-1-ground); }',
  '.a17-1[data-bg="base"] { --a17-1-ground: var(--bg-page); }',
  '.a17-1[data-bg="contrast"] { --a17-1-ground: var(--bg-contrast); }',
  '.a17-1__grid { display: grid; }',
  '.a17-1[data-per-row="two"] .a17-1__grid { grid-template-columns: repeat(2, 1fr); }',
  '.a17-1[data-per-row="four"] .a17-1__grid { grid-template-columns: repeat(4, 1fr); }',
  '',
  '@media (max-width: 1080px) {',
  '  .a17-1[data-per-row="four"] .a17-1__grid { grid-template-columns: repeat(3, 1fr); }',
  '}',
  '',
  '@media (max-width: 767px) {',
  '  .a17-1__grid, .a17-1[data-per-row="two"] .a17-1__grid, .a17-1[data-per-row="four"] .a17-1__grid { grid-template-columns: 1fr; }',
  '}',
].join('\n')
const at = (controls: Record<string, string>) => resolveControls(A17, controls)

test('A17 #1 placed only at three: every selector needing two or four on the root is gone; a list keeps the rest; an @media left empty goes', () => {
  const out = stripCss(A17_CSS, 'a17-1', [at({ 'per-row': 'three' })])
  assert.equal(out, [
    '.a17-1 { background: var(--a17-1-ground); }',
    '.a17-1[data-bg="base"] { --a17-1-ground: var(--bg-page); }',
    '.a17-1__grid { display: grid; }',
    '',
    '@media (max-width: 767px) {',
    '  .a17-1__grid { grid-template-columns: 1fr; }',
    '}',
  ].join('\n'))
  // a dark value's root rule: no instance is at contrast in light, so its rule is dead in the sheet (darkOverrideCss
  // reads the library's unstripped sheet, held in compile.test.ts)
  assert.ok(!out.includes('contrast'))
})

test('two placements, two values: the rules for both stay', () => {
  const out = stripCss(A17_CSS, 'a17-1', [at({ 'per-row': 'three' }), at({ 'per-row': 'two' })])
  assert.match(out, /^\.a17-1\[data-per-row="two"\] \.a17-1__grid \{/m)
  assert.ok(out.includes('  .a17-1__grid, .a17-1[data-per-row="two"] .a17-1__grid { grid-template-columns: 1fr; }'), out)
  assert.ok(!out.includes('"four"'), out)
})

test('a forced value: primary-action off forces secondary-action off, so the rule needing both off is kept', () => {
  const A4 = { controlSchema: [seg('primary-action', ['on', 'off']), seg('secondary-action', ['on', 'off'], 'on', { disabledBy: { control: 'primary-action', whenValue: 'off', inForce: 'off', reason: 'x' } })], universals: {} }
  const css = [
    '.a4-13[data-primary-action="off"][data-secondary-action="off"] .a4-13__actions { display: none; }',
    '.a4-13[data-primary-action="on"] .a4-13__x { color: red; }',
  ].join('\n')
  const root = resolveControls(A4, { 'primary-action': 'off', 'secondary-action': 'on' })
  assert.equal(root['secondary-action'], 'off', 'the forced value, as stampControls writes it')
  assert.equal(stripCss(css, 'a4-13', [root]), css.split('\n')[0])
  // the control: read from the STORED values, the rule would look dead
  assert.equal(stripCss(css, 'a4-13', [{ 'primary-action': 'off', 'secondary-action': 'on' }]), '')
})

test('what the strip cannot judge is kept whole: :not/:is/:where/:has, another operator, a name that is no control, a compound elsewhere, another at-rule', () => {
  const root = [at({ 'per-row': 'three' })]
  const kept = [
    '.a17-1:not([data-per-row="two"]) .a17-1__grid { gap: 1px; }',
    '.a17-1:is([data-per-row="two"], [data-per-row="four"]) .a17-1__grid { gap: 2px; }',
    '.a17-1:where([data-per-row="two"]) .a17-1__grid { gap: 3px; }',
    '.a17-1:has([data-per-row="two"]) .a17-1__grid { gap: 4px; }',
    '.a17-1[data-per-row^="tw"] .a17-1__grid { gap: 5px; }',
    '.a17-1[data-per-row*="ou"] .a17-1__grid { gap: 6px; }',
    '.a17-1[data-portal="signup"] .a17-1__grid { gap: 7px; }',
    '.a17-1__grid[data-per-row="two"] { gap: 8px; }',
    '.x .a17-1[data-per-row="two"] { gap: 9px; }',
    '@supports (display: grid) {\n  .a17-1[data-per-row="two"] .a17-1__grid { gap: 10px; }\n}',
    '@layer x;',
  ].join('\n')
  assert.equal(stripCss(kept, 'a17-1', root), kept)
  // the controls: the same attribute on the root compound, `=` or presence, is judged — and a value case-folded by `i`
  assert.equal(stripCss('.a17-1[data-per-row="two"] { gap: 0; }', 'a17-1', root), '')
  assert.equal(stripCss('.a17-1[data-per-row="THREE" i] { gap: 0; }', 'a17-1', root), '.a17-1[data-per-row="THREE" i] { gap: 0; }')
  assert.equal(stripCss('.a17-1[data-per-row="THREE"] { gap: 0; }', 'a17-1', root), '')
  assert.equal(stripCss('.a17-1[data-per-row] { gap: 0; }', 'a17-1', root), '.a17-1[data-per-row] { gap: 0; }')
  // a name no placed root carries is no control the strip knows of — a no-value-locked universal — so it is kept
  assert.equal(stripCss('.a17-1[data-per-row] { gap: 0; }', 'a17-1', [{}]), '.a17-1[data-per-row] { gap: 0; }')
})

test('two controls on one compound: a rule needing both is dead when no ONE root carries both, even where each root carries one (review, 2026-10-08)', () => {
  const css = '.a17-1[data-per-row="three"][data-bg="contrast"] { gap: 0; }\n.a17-1[data-per-row="three"] { gap: 1px; }'
  // each root satisfies one attribute, neither satisfies both — `roots.some(every)`, never `every(some)`
  assert.equal(stripCss(css, 'a17-1', [at({ 'per-row': 'three', bg: 'base' }), at({ 'per-row': 'two', bg: 'contrast' })]), '.a17-1[data-per-row="three"] { gap: 1px; }')
  // the control: one root carrying both keeps it
  assert.equal(stripCss(css, 'a17-1', [at({ 'per-row': 'three', bg: 'contrast' })]), css)
})

test('the parser traps: a selector over several lines, a comma inside :is() or inside a string, a brace inside a url()', () => {
  const root = [at({ 'per-row': 'three' })]
  const lines = '.a17-1__grid,\n.a17-1[data-per-row="two"]\n  .a17-1__grid,\n.a17-1[data-per-row="three"] .a17-1__cell { gap: 0; }'
  assert.equal(stripCss(lines, 'a17-1', root), '.a17-1__grid, .a17-1[data-per-row="three"] .a17-1__cell { gap: 0; }')
  const commas = '.a17-1:is(.a, .b)[data-per-row="two"] .x, .a17-1 .y[title="a, b"] { gap: 0; }'
  assert.equal(stripCss(commas, 'a17-1', root), '.a17-1 .y[title="a, b"] { gap: 0; }')
  const strings = '.a17-1[data-per-row="two"] .x::before { content: "} , {"; background: url(a/{b}.png); }\n.a17-1 .z { gap: 0; }'
  assert.equal(stripCss(strings, 'a17-1', root), '.a17-1 .z { gap: 0; }')
})

test('a sheet it cannot judge comes back unchanged: a stray }, a comment, an unclosed rule, an empty selector — and no root class', () => {
  const root = [at({ 'per-row': 'three' })]
  for (const css of [
    '.a17-1[data-per-row="two"] { gap: 0; }\n}\n.a17-1 { gap: 1px; }',
    '/* x */ .a17-1[data-per-row="two"] { gap: 0; }',
    '.a17-1[data-per-row="two"] { gap: 0;',
    '.a17-1[data-per-row="two"], { gap: 0; }',
    '.a17-1 { gap: 0; } ; .a17-1[data-per-row="two"] { gap: 0; }',
  ]) assert.equal(stripCss(css, 'a17-1', root), css, css)
  assert.equal(stripCss(A17_CSS, null, root), A17_CSS)
  // the control: the same rule, well formed, is stripped
  assert.equal(stripCss('.a17-1[data-per-row="two"] { gap: 0; }\n.a17-1 { gap: 1px; }', 'a17-1', root), '.a17-1 { gap: 1px; }')
})
