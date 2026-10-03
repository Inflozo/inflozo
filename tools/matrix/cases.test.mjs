// Story 4.11 — the render matrix's case derivation, held against the pilots with no browser (in `pnpm test`).
// The matrix itself runs in its own container (`run-matrix-gate.sh`); this is the half that runs per commit.
//
//     node tools/matrix/cases.test.mjs          (Node 24: it imports the packages' TypeScript)

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MODES, REPO, SPECIMENS, VIEWPORTS, carriesMemberVisibility, cases, fixtureRows, packs, pilot, pilotIds, pilotsCanvasDocument, presetPack, specimenDocument, specimenMarkup } from './cases.mjs'

const { REFERENCE_PACKS, pairingOf } = await import(join(REPO, 'packages/library/src/packs.ts'))
const rt = await import(join(REPO, 'packages/section-runtime/src/index.ts'))

const rows = (id) => fixtureRows(pilot(id))
const names = (id) => rows(id).map((r) => r.name)

test('the design list is the directory, and there is something to photograph', () => {
  assert.ok(pilotIds().length > 0, 'packages/library/designs/ holds no design, so the matrix would prove nothing')
  assert.deepEqual([...new Set(cases([]).filter((c) => !c.pairing).map((c) => c.id))], pilotIds())
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

test('DW-171 — the Show-to arms are the editor\'s: a design has them exactly when its category carries Member visibility', () => {
  for (const id of pilotIds()) {
    assert.equal(rows(id).some((r) => r.visibility !== undefined), carriesMemberVisibility(id), `${id}: the matrix's Show-to arms disagree with the editor's rule`)
  }
})

test('A1 #1 gates by member and draws no Show to: visitor rows only. A4 #13 draws Show to and gates nothing: its base row beside them', () => {
  assert.deepEqual(names('a1/1'), ['visitor-anonymous', 'visitor-free', 'visitor-paid'])
  assert.deepEqual(names('a4/13'), ['', 'show-to-anonymous', 'show-to-free', 'show-to-paid'])
  for (const r of rows('a4/13').filter((x) => x.visibility !== undefined)) assert.notEqual(r.member, r.visibility, `${r.name} is viewed by its own audience`)
})

test('every case is design × pack × mode × viewport × the design\'s own rows, plus a specimen per pairing — counted from the axes, never stored', () => {
  const want = pilotIds().reduce((t, id) => t + packs().length * MODES.length * VIEWPORTS.length * rows(id).length, 0) + SPECIMENS().length
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

test('the pack axis is the owner\'s reference packs, REFERENCE_PACKS (R-234, DW-169), and each case\'s document carries its pack\'s block and faces', () => {
  assert.deepEqual(packs(), [...REFERENCE_PACKS])
  assert.deepEqual([...new Set(cases([]).filter((c) => !c.pairing).map((c) => c.pack))], [...REFERENCE_PACKS])
  const paper = readFileSync(join(REPO, 'packages/section-runtime/reference-tokens.css'), 'utf8')
  for (const p of packs()) {
    const doc = pilotsCanvasDocument(undefined, [], p)
    assert.ok(doc.includes(p === 'paper' ? paper : rt.packTokensCss(presetPack(p))), `${p}'s document carries no ${p} token block`)
    assert.match(doc, /<style data-order="1b-faces">@font-face \{/, `${p}'s document carries no faces`)
    assert.doesNotMatch(doc, /fonts\.(googleapis|gstatic)\.com/)
  }
})

test('DW-317: a reference pack sits off Paper\'s step on buttons and on gutters, so the pilots\' newest tokens are photographed', () => {
  const paper = presetPack('paper')
  const off = (row) => packs().filter((p) => presetPack(p)[row] !== paper[row])
  assert.ok(off('buttons').length > 0, `every reference pack draws ${paper.buttons} buttons, as Paper does`)
  assert.ok(off('gutters').length > 0, `every reference pack has ${paper.gutters} gutters, as Paper does`)
  // and the tokens really differ there — the move from --text-on-accent to --button-text is observable
  const t = (p) => rt.packTokens(presetPack(p)).light
  assert.ok(off('buttons').some((p) => t(p)['--button-text'] !== t(p)['--text-on-accent'] || t(p)['--button-fill'] !== t(p)['--accent']))
  assert.ok(off('gutters').some((p) => t(p)['--space-gutter'] !== t(p)['--space-gap']))
})

test('R-233: one specimen per pairing of the pool, each Paper, light, at 1440 — a heading, bold and italic, figures and latin-ext', () => {
  const specimens = cases([]).filter((c) => c.pairing)
  assert.deepEqual(specimens.map((c) => c.pairing), SPECIMENS())
  for (const c of specimens) {
    assert.deepEqual([c.pack, c.mode, c.viewport.name], ['paper', 'light', VIEWPORTS[0].name], c.id)
    const doc = specimenDocument(c.pairing)
    assert.match(doc, /font-family: '/, `${c.id}: no faces`)
    assert.ok(doc.includes(`--font-heading: '${pairingOf(c.pairing).heading.family}'`), `${c.id}: the token block does not name the pairing's heading face`)
  }
  const markup = specimenMarkup(SPECIMENS()[0])
  for (const part of ['<h1', '<strong>', '<em>', 'font-feature-settings', /[ŁąęłńśźżŐŞşČĞ]/]) assert.ok(typeof part === 'string' ? (markup + specimenDocument(SPECIMENS()[0])).includes(part) : part.test(markup), String(part))
  assert.deepEqual([...new Set(cases(['specimens']).map((c) => c.category))], ['specimens'], 'MATRIX_DESIGNS=specimens narrows to them')
})
