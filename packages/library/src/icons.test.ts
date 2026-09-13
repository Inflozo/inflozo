// Story 4.5 — the vendored Tabler set (R-26 · R-104). What `tools/vendor-icons.py` refuses to write is
// asserted again here against what it DID write, so a hand edit to `icons/tabler.json` fails by name.
// No count appears in this file: the set is whatever the pinned Tabler version publishes.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ICON_CATEGORIES, ICONS, TABLER_LICENSE, TABLER_VERSION, filledKey, iconDrawing } from './icons.ts'
import type { IconNode } from './registry.ts'

// The platforms Ghost keeps a social field for (`P0 Editor Primitives - Spec.md:260-261`), under the
// names Tabler files them as.
const GHOST_PLATFORMS = [
  'brand-facebook', 'brand-x', 'brand-linkedin', 'brand-bluesky', 'brand-threads',
  'brand-mastodon', 'brand-tiktok', 'brand-youtube', 'brand-instagram',
]

const strictlyAscending = (list: readonly string[]) => list.every((v, i) => i === 0 || list[i - 1] < v)

const assertDrawing = (key: string, nodes: readonly IconNode[] | undefined, allowed: readonly string[]) => {
  assert.ok(nodes && nodes.length > 0, `${key} has no drawing`)
  for (const [tag, attrs] of nodes) {
    assert.equal(tag, 'path', `${key} carries a <${tag}>`)
    for (const [name, value] of Object.entries(attrs)) {
      assert.ok(allowed.includes(name), `${key} carries the attribute ${name}`)
      assert.equal(typeof value, 'string', `${key} ${name} is not a string`)
      assert.ok(!/[{}]/.test(value), `${key} ${name} carries a brace`)
    }
  }
}

test('the set is not empty and is sorted by name, and every icon has a category and string tags', () => {
  assert.ok(ICONS.length > 0)
  assert.ok(strictlyAscending(ICONS.map((icon) => icon.name)))
  for (const icon of ICONS) {
    assert.ok(icon.category.trim() !== '', `${icon.name} has no category`)
    assert.ok(icon.tags.every((tag) => typeof tag === 'string'), `${icon.name} has a tag that is not a string`)
  }
})

test('outline drawings are paths with d · fill · opacity · stroke; filled ones paths with d · fill', () => {
  assert.ok(ICONS.some((icon) => icon.filled), 'control: no icon carries a filled drawing')
  for (const icon of ICONS) {
    assertDrawing(icon.name, iconDrawing(icon.name), ['d', 'fill', 'opacity', 'stroke'])
    if (icon.filled) assertDrawing(filledKey(icon.name), iconDrawing(filledKey(icon.name)), ['d', 'fill'])
    else assert.equal(iconDrawing(filledKey(icon.name)), undefined, `${icon.name} is outline only`)
  }
})

test('the nine Ghost social platforms are Tabler brand icons', () => {
  for (const name of GHOST_PLATFORMS) {
    const icon = ICONS.find((entry) => entry.name === name)
    assert.ok(icon, `${name} is missing`)
    assert.equal(icon.category, 'Brand')
  }
})

test('the lookup: outline by name, filled by the -filled key, and nothing else', () => {
  assert.ok(iconDrawing('rocket'))
  assert.equal(iconDrawing('rocket-filled'), undefined)
  assert.ok(iconDrawing('heart'))
  assert.ok(iconDrawing('heart-filled'))
  assert.notDeepEqual(iconDrawing('heart'), iconDrawing('heart-filled'))
  for (const hostile of ['"><script>', 'constructor', '__proto__', 'constructor-filled', '__proto__-filled',
    'hasOwnProperty', '-filled', '', 'no-such-icon']) {
    assert.equal(iconDrawing(hostile), undefined, hostile)
  }
  assert.equal(iconDrawing(42 as unknown as string), undefined)
})

test('the categories are derived from the set: sorted, de-duplicated, and every one in use', () => {
  assert.ok(strictlyAscending(ICON_CATEGORIES))
  assert.deepEqual(new Set(ICON_CATEGORIES), new Set(ICONS.map((icon) => icon.category)))
})

test('the licence is MIT, verbatim, and the version is pinned', () => {
  assert.ok(TABLER_LICENSE.startsWith('MIT License'))
  assert.ok(TABLER_LICENSE.includes('Permission is hereby granted, free of charge, to any person obtaining a copy'))
  assert.match(TABLER_VERSION, /^\d+\.\d+\.\d+$/)
})
