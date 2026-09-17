// Story 4.11 — the render matrix's case derivation, held against the pilots with no browser (in `pnpm test`).
// The matrix itself runs in its own container (`run-matrix-gate.sh`); this is the half that runs per commit.
//
//     node tools/matrix/cases.test.mjs          (Node 24: it imports the packages' TypeScript)

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MODES, REPO, VIEWPORTS, cases, fixtureRows, packCss, packs, pilot, pilotIds, pilotsCanvasDocument } from './cases.mjs'

const rows = (id) => fixtureRows(pilot(id))
const names = (id) => rows(id).map((r) => r.name)

test('the design list is the directory, and there is something to photograph', () => {
  assert.ok(pilotIds().length > 0, 'packages/library/designs/ holds no design, so the matrix would prove nothing')
  assert.deepEqual([...new Set(cases([]).map((c) => c.id))], pilotIds())
})

test('A17 #1 paginates: the four feed rows — first, middle, partial last, empty (FR-H3 A34, FR-H4)', () => {
  assert.deepEqual(names('a17/1'), ['feed-first', 'feed-middle', 'feed-last', 'feed-empty'])
})

test('A22 #1 gates by member: a row per visitor, and a Show-to row per audience viewed by a visitor it hides from', () => {
  assert.deepEqual(names('a22/1'), ['visitor-anonymous', 'visitor-free', 'visitor-paid', 'show-to-anonymous', 'show-to-free', 'show-to-paid'])
  for (const r of rows('a22/1').filter((x) => x.visibility !== undefined)) assert.notEqual(r.member, r.visibility, `${r.name} is viewed by its own audience`)
})

test('A24 #1 is a post-context design: the style-guide post, at post.hbs (FR-H3 A33)', () => {
  assert.deepEqual(rows('a24/1'), [{ name: 'style-guide-post', target: 'post.hbs' }])
})

test('A1 #1: no feed rows and no post fixture; its markup gates by member, so the member rows are derived for it too', () => {
  assert.ok(!names('a1/1').some((n) => n.startsWith('feed-') || n.startsWith('style-guide-')), names('a1/1').join(' · '))
  assert.deepEqual(names('a1/1'), names('a22/1'))
  assert.deepEqual(names('a4/13'), [''])
})

test('every case is design × pack × mode × viewport × the design\'s own rows — counted from the axes, never stored', () => {
  const want = pilotIds().reduce((t, id) => t + packs().length * MODES.length * VIEWPORTS.length * rows(id).length, 0)
  assert.equal(cases([]).length, want)
  assert.equal(new Set(cases([]).map((c) => c.snapshot.join('/'))).size, want, 'two cases share a baseline file')
  // no file this story adds writes the total down
  const files = [...readdirSync(join(REPO, 'tools/matrix')).map((f) => join(REPO, 'tools/matrix', f)), join(REPO, 'docs/render-matrix.md')]
  for (const f of files.filter((x) => /\.(mjs|sh|md|json)$/.test(x) || x.endsWith('Dockerfile'))) {
    // a version (1.61.1), a date, a hash or a percentage is not a written-down total
    const text = readFileSync(f, 'utf8').replace(/[0-9a-f]{40,}|\d+(\.\d+)+|\d{4}-\d\d-\d\d|\d+%/g, ' ')
    assert.doesNotMatch(text, new RegExp(`\\b${want}\\b`), `${f} writes the case total down`)
  }
})

test('MATRIX_DESIGNS narrows by id or by whole category', () => {
  assert.deepEqual([...new Set(cases(['a17/1']).map((c) => c.id))], ['a17/1'])
  assert.deepEqual([...new Set(cases(['a1']).map((c) => c.id))], ['a1/1'], 'a1 must not select a17/1')
  assert.throws(() => cases(['zz/1']), /names no design/, 'a selection that matches nothing must fail, not run zero cases')
})

test('the pack axis is the token sets that exist, and the canvas document carries every one (DW-169)', () => {
  assert.ok(packs().includes('reference'))
  const doc = pilotsCanvasDocument()
  for (const p of packs()) assert.ok(doc.includes(readFileSync(packCss(p), 'utf8')), `pilotsCanvasDocument() carries no ${p} token set — widen the document before the matrix photographs it`)
})
