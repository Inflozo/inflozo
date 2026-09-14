// Story 4.9 — FR-Q6's string catalog, checked by execution on every `pnpm check`: controls first (a result whose
// control did not pass is not a result), then the machine copy.
//
// One copy of each thing, and this file restates none of them:
// - the NORMATIVE table is appendix-h1-string-catalog.md §3;
// - the MACHINE copy is packages/library/strings/catalog.json;
// - the FORMAT rules are packages/library/src/catalog.ts's `catalogFailures`;
// - Ghost's FORMAT is intl-messageformat 5.4.3, the version both majors bundle, called the way both majors' i18n.js
//   calls it (`new MessageFormat(string, locale).format(bindings)`);
// - the TOTALS are printed here and stored nowhere.
//
// What it does:
//  1. holds §3 and catalog.json equal, in order and in both directions — key, English default, marks, retired or not;
//  2. refuses a key written twice in catalog.json's bytes (JSON.parse would keep the last silently);
//  3. runs the format rules;
//  4. renders every default through intl-messageformat 5.4.3 and through the shim's `t()` with a sample value per
//     placeholder, and fails on any key where the two differ or Ghost's format throws;
//  5. prints the totals.
//
//     node tools/check-catalog.mjs          (Node 24: it imports packages/library/src/catalog.ts)

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const MessageFormat = require('intl-messageformat')
const IMF_VERSION = JSON.parse(readFileSync(require.resolve('intl-messageformat/package.json'), 'utf8')).version
const { catalogFailures, placeholdersOf } = await import(join(REPO, 'packages/library/src/catalog.ts'))
const { t } = await import(join(REPO, 'packages/ghost-shim/src/index.ts'))

const APPENDIX_PATH = '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/appendix-h1-string-catalog.md'
const CATALOG_PATH = 'packages/library/strings/catalog.json'
const APPENDIX = readFileSync(join(REPO, APPENDIX_PATH), 'utf8')
const CATALOG_TEXT = readFileSync(join(REPO, CATALOG_PATH), 'utf8')
const CATALOG = JSON.parse(CATALOG_TEXT)

const MARKS_CELL = /^(JS|a11y|prop|locked|canvas)(, (JS|a11y|prop|locked|canvas))*$/

/** §3's rows, in order. A marks cell holding prose ("as above", `comments.count_one`'s note) contributes no
 *  marks; a status cell compares as retired or not — the reason sentence is catalog.json's own. */
function appendixRows(md) {
  const start = md.indexOf('\n## 3. The catalog')
  const end = md.indexOf('\n## 4.', start)
  if (start === -1 || end === -1) throw new Error(`${APPENDIX_PATH} has no "## 3. The catalog" section followed by "## 4."`)
  const rows = []
  for (const line of md.slice(start, end).split('\n')) {
    if (!/^\| `[a-z]/.test(line)) continue
    const cells = line.split('|').slice(1, -1).map((c) => c.trim())
    const marks = MARKS_CELL.test(cells[2] ?? '') ? cells[2].split(', ').map((m) => m.toLowerCase()) : []
    rows.push({ key: cells[0].slice(1, -1), en: cells[1], marks, retired: /^\*\*retired\*\*/.test(cells[3] ?? '') })
  }
  return rows
}

/** 1 — the two copies, in order, in both directions, each difference naming the key and the file. */
function copyFailures(rows, catalog) {
  const out = []
  const keys = Object.keys(catalog.keys)
  const inAppendix = new Set(rows.map((r) => r.key))
  for (const r of rows) if (!Object.hasOwn(catalog.keys, r.key)) out.push(`${r.key} — in ${APPENDIX_PATH} and missing from ${CATALOG_PATH}`)
  for (const k of keys) if (!inAppendix.has(k)) out.push(`${k} — in ${CATALOG_PATH} and missing from ${APPENDIX_PATH}`)
  const both = rows.filter((r) => Object.hasOwn(catalog.keys, r.key))
  const order = keys.filter((k) => inAppendix.has(k))
  both.forEach((r, i) => {
    if (order[i] !== r.key) out.push(`${r.key} — ${APPENDIX_PATH} has it at position ${i + 1} and ${CATALOG_PATH} has ${order[i]} there; the copies are held in order`)
  })
  for (const r of both) {
    const e = catalog.keys[r.key]
    if (e.en !== r.en) out.push(`${r.key} — the English default differs: ${APPENDIX_PATH} says ${JSON.stringify(r.en)}, ${CATALOG_PATH} says ${JSON.stringify(e.en)}`)
    if (JSON.stringify(e.marks) !== JSON.stringify(r.marks)) out.push(`${r.key} — the marks differ: ${APPENDIX_PATH} ${JSON.stringify(r.marks)}, ${CATALOG_PATH} ${JSON.stringify(e.marks)}`)
    if ((e.retired !== undefined) !== r.retired) out.push(`${r.key} — ${r.retired ? `${APPENDIX_PATH} marks it retired and ${CATALOG_PATH} does not` : `${CATALOG_PATH} marks it retired and ${APPENDIX_PATH} does not`}`)
  }
  const seen = new Set()
  for (const r of rows) {
    if (seen.has(r.key)) out.push(`${r.key} — written twice in ${APPENDIX_PATH}`)
    seen.add(r.key)
  }
  return out
}

/** 2 — a key written twice in the bytes, which JSON.parse would silently collapse. */
function duplicateFailures(text) {
  const out = []
  const seen = new Set()
  for (const m of text.matchAll(/^\s*"([a-z][a-z0-9]*\.[^"]+)":\s*\{/gm)) {
    if (seen.has(m[1])) out.push(`${m[1]} — written twice in ${CATALOG_PATH}; JSON.parse keeps the last and drops the first silently`)
    seen.add(m[1])
  }
  return out
}

/** 4 — Ghost's render against the shim's, per key, with a sample value per placeholder. */
function agreementFailures(catalog) {
  const out = []
  const english = Object.fromEntries(Object.entries(catalog.keys).map(([k, e]) => [k, e.en]))
  for (const [key, e] of Object.entries(catalog.keys)) {
    const params = Object.fromEntries(placeholdersOf(e.en).map((p, i) => [p, i % 2 === 0 ? `<${p}>` : 7 + i]))
    const shim = t(key, params, english)
    let ghost
    try {
      ghost = new MessageFormat(e.en, 'en').format(params)
    } catch (err) {
      out.push(`${key} — intl-messageformat ${IMF_VERSION} throws on ${JSON.stringify(e.en)}: ${err.message} (on a live site: "An error occurred", or a whole-page 500 where the constructor throws)`)
      continue
    }
    if (ghost !== shim) out.push(`${key} — Ghost renders ${JSON.stringify(ghost)} and the shim renders ${JSON.stringify(shim)}`)
  }
  return out
}

let failed = 0
const check = (label, fn) => {
  try {
    const note = fn()
    console.log(`  ok  ${label}${note ? ` — ${note}` : ''}`)
  } catch (e) {
    failed++
    console.log(`  FAIL ${label}\n       ${String(e.message).split('\n').join('\n       ')}`)
  }
}
const mustFail = (failures, pattern, what) => {
  if (!failures.some((f) => pattern.test(f))) throw new Error(`${what} was not caught — got ${JSON.stringify(failures)}`)
  return failures.find((f) => pattern.test(f))
}
const clone = () => JSON.parse(CATALOG_TEXT)
const ROWS = appendixRows(APPENDIX)

console.log('\nStory 4.9 — the string catalog\n')
if (IMF_VERSION !== '5.4.3') {
  console.log(`check-catalog: intl-messageformat is ${IMF_VERSION}, and both Ghost majors bundle 5.4.3 — a check under any other version checks nothing`)
  process.exit(1)
}

// ── controls: each check, handed its broken subject, fails naming it ──────────────────────────────────────
check('control — a key removed from catalog.json is named, with the file', () => {
  const c = clone()
  delete c.keys['pagination.older']
  return mustFail(copyFailures(ROWS, c), /^pagination\.older — in .* missing from packages\/library\/strings\/catalog\.json/, 'a removed key')
})
check('control — a default changed in one copy only is named, with both files', () => {
  const c = clone()
  c.keys['nav.menu'].en = 'Menu!'
  return mustFail(copyFailures(ROWS, c), /^nav\.menu — the English default differs/, 'a changed default')
})
check('control — a key moved out of order, a mark dropped and a retirement lifted are each named', () => {
  const c = clone()
  const { 'pagination.label': first, ...rest } = c.keys
  c.keys = { ...rest, 'pagination.label': first }
  c.keys['countdown.days'].marks = []
  delete c.keys['search.overlay_empty'].retired
  const f = copyFailures(ROWS, c)
  mustFail(f, /^pagination\.label — .*in order/, 'a moved key')
  mustFail(f, /^countdown\.days — the marks differ/, 'a dropped mark')
  return mustFail(f, /^search\.overlay_empty — .*retired/, 'a lifted retirement')
})
check('control — a key written twice in the bytes is named', () =>
  mustFail(duplicateFailures(CATALOG_TEXT.replace('"nav.close":', '"nav.menu":')), /^nav\.menu — written twice/, 'a duplicate key'))
for (const [label, en, pattern] of [
  ["an apostrophe-quoted default ''", "It''s here", /Ghost renders "It's here" and the shim renders "It''s here"/],
  ['an ICU plural', '{count, plural, one {#} other {#}}', /throws/],
  ["an ICU-escaped brace '{'", "'{'", /throws/],
]) {
  check(`control — agreement: ${label} fails, naming the key and showing both renders or the throw`, () => {
    const c = clone()
    c.keys['nav.more'].en = en
    mustFail(catalogFailures(c), /^nav\.more /, `${label} under the format rules`)
    return mustFail(agreementFailures(c), new RegExp(`^nav\\.more — .*${pattern.source}`), label)
  })
}
check('control — a credit.* key without its lock fails the format rules', () => {
  const c = clone()
  c.keys['credit.built_with'].marks = []
  return mustFail(catalogFailures(c), /^credit\.built_with /, 'an unlocked credit key')
})

// ── the subject ───────────────────────────────────────────────────────────────────────────────────────────
check(`appendix-h1 §3 and catalog.json are one table, in order, in both directions`, () => {
  if (ROWS.length === 0) throw new Error(`no rows parsed out of ${APPENDIX_PATH} §3`)
  const f = [...copyFailures(ROWS, CATALOG), ...duplicateFailures(CATALOG_TEXT)]
  if (f.length) throw new Error(f.join('\n'))
})
check('every format rule holds (S1, S3, S7, the removal rule)', () => {
  const f = catalogFailures(CATALOG)
  if (f.length) throw new Error(f.join('\n'))
})
check(`every default renders under intl-messageformat ${IMF_VERSION} exactly as the shim's t() renders it`, () => {
  const f = agreementFailures(CATALOG)
  if (f.length) throw new Error(f.join('\n'))
})

// ── the totals, printed and stored nowhere ────────────────────────────────────────────────────────────────
const namespaces = new Map()
for (const [key, e] of Object.entries(CATALOG.keys)) {
  const ns = key.slice(0, key.indexOf('.'))
  const row = namespaces.get(ns) ?? { keys: 0, js: 0, a11y: 0, prop: 0, locked: 0, canvas: 0, retired: 0, placeholders: 0 }
  row.keys++
  for (const m of e.marks) row[m]++
  if (e.retired !== undefined) row.retired++
  if (placeholdersOf(e.en).length > 0) row.placeholders++
  namespaces.set(ns, row)
}
const total = { keys: 0, js: 0, a11y: 0, prop: 0, locked: 0, canvas: 0, retired: 0, placeholders: 0 }
const cols = Object.keys(total)
console.log(`\n  ${'namespace'.padEnd(12)}${cols.map((c) => c.padStart(13)).join('')}`)
for (const [ns, row] of namespaces) {
  for (const c of cols) total[c] += row[c]
  console.log(`  ${ns.padEnd(12)}${cols.map((c) => String(row[c]).padStart(13)).join('')}`)
}
console.log(`  ${'total'.padEnd(12)}${cols.map((c) => String(total[c]).padStart(13)).join('')}`)
console.log(`  listed in the Translations surface: ${total.keys - total.locked} (every key but the locked ones); in every locale file: ${total.keys - total.canvas} (every key but the canvas ones); migrations: ${CATALOG.migrations.length}`)

if (failed) {
  console.log(`\ncheck-catalog: FAIL — ${failed} check(s) failed\n`)
  process.exit(1)
}
console.log(`\ncheck-catalog: PASS — ${total.keys} keys in ${namespaces.size} namespaces agree with appendix-h1 and render under intl-messageformat ${IMF_VERSION}\n`)
