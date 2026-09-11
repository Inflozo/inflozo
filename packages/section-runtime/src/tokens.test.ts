// The reference token contract, checked in memory. An unset custom property fails SILENTLY — the
// declaration is dropped and the element renders with whatever it inherited — so a contract nothing
// checks is decorative.
//
// This is the half that can run inside a core package. The other half reads bytes off disk (the
// design's `style.css`, and `reference-tokens.css` itself) and lives in
// `tools/stress/test-vocabulary.mjs`, because AD-1 bans `node:fs` here and the test-file exemption
// gives back only `node:test` and `node:assert`. Between them nothing about the contract is
// asserted twice and nothing is unasserted.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { REFERENCE_TOKENS, TOKEN_NAMES, TOKEN_ROWS, referenceTokensCss } from './tokens.ts'

test('every FR-E1 / Appendix D.0 row names at least one property, and no property twice', () => {
  for (const [row, props] of Object.entries(TOKEN_ROWS)) {
    assert.ok(props.length > 0, `${row} declares no property`)
    for (const p of props) assert.match(p, /^--[a-z][a-z0-9-]*$/, `${row}: "${p}" is not a custom property`)
  }
  assert.equal(new Set(TOKEN_NAMES).size, TOKEN_NAMES.length, 'a property is declared by two rows')
})

test('light and dark declare the SAME property set — never a subset', () => {
  const light = Object.keys(REFERENCE_TOKENS.light).sort()
  const dark = Object.keys(REFERENCE_TOKENS.dark).sort()
  assert.deepEqual(
    dark,
    light,
    'a property present in one mode and absent in the other resolves to nothing in exactly one mode',
  )
  assert.deepEqual(
    light,
    [...TOKEN_NAMES].sort(),
    'the values and the contract rows disagree about which properties exist',
  )
})

test('every value is non-empty, and every var(--…) inside one names a declared property', () => {
  const declared = new Set(TOKEN_NAMES)
  for (const mode of ['light', 'dark'] as const) {
    for (const [k, v] of Object.entries(REFERENCE_TOKENS[mode])) {
      assert.ok(v.trim() !== '', `${mode} ${k} has no value`)
      for (const m of v.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
        assert.ok(declared.has(m[1] as string), `${mode} ${k} reads undeclared ${m[1] as string}`)
      }
    }
  }
})

test('the emitted stylesheet declares every property, in both modes', () => {
  const css = referenceTokensCss()
  const blocks = (css.match(/:root/g) ?? []).length // derived: one declaration per property per :root block
  assert.ok(blocks > 0, 'the stylesheet has no blocks')
  for (const name of TOKEN_NAMES) {
    const occurrences = css.split(`${name}:`).length - 1
    assert.equal(occurrences, blocks, `${name} is declared ${occurrences} times across ${blocks} blocks`)
  }
  assert.ok(css.includes('prefers-color-scheme: dark'), 'the system-preference block is missing')
  assert.ok(css.includes('[data-mode="dark"]'), 'the explicit-mode block is missing')
})
