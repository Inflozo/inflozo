// The control for Story 4.1's grammar, placed where the thing it controls lives.
//
// `tools/stress/sections.js` is the EXECUTED archetype set — realistic sections, one per kind, sized in
// MEASUREMENTS §14 and compiled and gated on both gscan majors since round 1. If
// the new vocabulary cannot describe them, it does not describe the thing that was proven to work,
// and no amount of documentation fixes that.
//
// It lives here and not in `packages/library` because a test in a core package cannot read a file
// (AD-1 bans `node:fs` there and the test-file exemption gives back only `node:test` and
// `node:assert`). That is also what makes it the right home for the on-disk fixture check below:
// the package test carries the reference markup in memory, this one reads the bytes, and any drift
// between them fails here.
//
// `.mjs` because `tools/stress/` is CommonJS and the packages are ESM.
//
//     node test-vocabulary.mjs

import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const REPO = join(here, '..', '..')

const { A, ORDER, source, stackFor, QUERIES, TARGET } = require('./sections.js')
const { DIRECTIVES, UNIVERSAL_CONTROLS, modeScopedOffers, modeScopedRules, rootClassOf, scanTags, validateMarkup, validateDesign } =
  await import(join(REPO, 'packages/library/src/index.ts'))
const { TOKEN_NAMES, TOKEN_ROWS } = await import(join(REPO, 'packages/section-runtime/src/tokens.ts'))
// DW-323 (Story 6.3): Paper's reference set reads the library, so it is the runtime's `./reference` subpath, never its index
const { REFERENCE_TOKENS, referenceTokensCss } = await import(join(REPO, 'packages/section-runtime/src/reference.ts'))

let failed = 0
let n = 0
const check = (label, fn) => {
  n++
  try {
    fn()
    console.log(`  ok  ${label}`)
  } catch (e) {
    failed++
    console.log(`  FAIL ${label}\n       ${e.message}`)
  }
}
const say = (f) => f.map((x) => `${x.code}: ${x.message}`).join('\n       ')

/** The root's control attributes, which is what exit construct 5 says the sidebar generates FROM
 *  `controlSchema`. Derived from the markup here because the archetypes predate `design.json`. */
function rootControls(html) {
  const [root] = scanTags(html)                       // the validator's own scan, not a second one
  const names = root ? root.attrs.map(([k]) => k).filter((k) => k.startsWith('data-')) : []
  return names
    .filter((n) => DIRECTIVES[n] === undefined)
    .map((n) => n.slice('data-'.length))
    .filter((n) => !UNIVERSAL_CONTROLS.includes(n))
}

console.log('\nStory 4.1 — the authoring vocabulary describes what was executed\n')

for (const kind of ORDER) {
  check(`the ${kind} archetype validates clean`, () => {
    const html = source({ kind, i: 1 })
    const f = validateMarkup(html, { controls: rootControls(html) })
    if (f.length) throw new Error(say(f))
  })
}

check('the control derivation is not vacuous — a control the schema omits is refused', () => {
  const html = source({ kind: 'feed', i: 1 })
  const controls = rootControls(html).slice(1)
  const f = validateMarkup(html, { controls })
  if (!f.some((x) => x.code === 'root-control-undeclared')) {
    throw new Error('a root attribute absent from controlSchema must be refused (AD-3)')
  }
})

check('every archetype is refused when a directive is misspelt', () => {
  const html = source({ kind: 'hero', i: 1 }).replace('data-prop=', 'data-props=')
  const f = validateMarkup(html, { controls: rootControls(html) })
  if (!f.some((x) => x.code === 'unknown-directive')) throw new Error('an unknown directive must be refused')
})

check('the on-disk reference fixture validates clean, end to end', () => {
  const dir = join(REPO, 'packages/library/fixtures')
  const f = validateDesign({
    html: readFileSync(join(dir, 'reference-design/index.html'), 'utf8'),
    design: JSON.parse(readFileSync(join(dir, 'reference-design/design.json'), 'utf8')),
    content: JSON.parse(readFileSync(join(dir, 'content.json'), 'utf8')),
    // and its stylesheet, so the guide's example is held to AD-3 from both sides
    css: readFileSync(join(dir, 'reference-design/style.css'), 'utf8'),
  })
  if (f.length) throw new Error(say(f))
})

// Story 4.5 — the controls sample the /controls review page renders, validated from its bytes with the
// real icon set, and Tabler's licence file checked against the copy the set carries (R-26): a core
// package serves the licence from the JSON because it cannot read a .txt, so the two must not drift.
const { iconDrawing, TABLER_LICENSE } = await import(join(REPO, 'packages/library/src/icons.ts'))

// Story 5.11 (R-158): the fixture is a RING of designs, every numbered directory — derived, never a literal `1/`
const CONTROLS_DIR = join(REPO, 'packages/library/fixtures/controls')
const controlsDesigns = () => readdirSync(CONTROLS_DIR).filter((n) => /^\d+$/.test(n)).sort((a, b) => Number(a) - Number(b))

check('every on-disk controls sample validates clean, icon defaults included', () => {
  const dir = CONTROLS_DIR
  const designs = controlsDesigns()
  if (designs.length < 2) throw new Error('the controls fixture is a ring (R-158) — fewer than two designs on disk')
  for (const n of designs) {
    const f = validateDesign({
      html: readFileSync(join(dir, `${n}/index.html`), 'utf8'),
      design: JSON.parse(readFileSync(join(dir, `${n}/design.json`), 'utf8')),
      content: JSON.parse(readFileSync(join(dir, 'content.json'), 'utf8')),
      icons: iconDrawing,
    })
    if (f.length) throw new Error(`controls/${n}: ${say(f)}`)
  }
})

check("Tabler's licence ships verbatim beside the set, and the set carries the same text", () => {
  const onDisk = readFileSync(join(REPO, 'packages/library/icons/LICENSE-tabler.txt'), 'utf8')
  if (onDisk !== TABLER_LICENSE) throw new Error('LICENSE-tabler.txt and tabler.json\'s licence differ — re-run python3 tools/vendor-icons.py')
  if (!/Permission is hereby granted, free of charge/.test(onDisk)) throw new Error('the licence file is not the MIT licence')
})

check('the fixture exercises every directive in the closed set', () => {
  const html = readFileSync(join(REPO, 'packages/library/fixtures/reference-design/index.html'), 'utf8')
  const missing = Object.keys(DIRECTIVES).filter((n) => !new RegExp(`${n}[=\\s>]`).test(html))
  if (missing.length) throw new Error(`no example of ${missing.join(', ')}`)
})

// ── Story 4.9 — the fixtures speak the catalog: no invented key, and no English outside it ─────────────────
const { checkChromeLiterals, renderTheme } = await import(join(REPO, 'packages/section-runtime/src/index.ts'))
// jsdom from the runtime package that declares it — tools/stress/node_modules is never installed in CI
const { JSDOM } = createRequire(join(REPO, 'packages/section-runtime/package.json'))('jsdom')
const jsdoc = () => new JSDOM('<body></body>').window.document

check('no archetype prints a chrome literal (V1\'s tree half) and no fixture carries an invented key', () => {
  for (const kind of ORDER) {
    const literals = checkChromeLiterals(jsdoc(), source({ kind, i: 1 }))
    if (literals.length) throw new Error(`${kind}: ${literals.join(' · ')}`)
  }
  // the reference design too (review 4.9): its `data-index` sample digit is replaced text, not a literal. An invented
  // key is V2's, which validateMarkup already ran over both fixtures above — no hand-list of old prefixes here.
  const ref = checkChromeLiterals(jsdoc(), readFileSync(join(REPO, 'packages/library/fixtures/reference-design/index.html'), 'utf8'))
  if (ref.length) throw new Error(`reference-design: ${ref.join(' · ')}`)
  // the control: the check sees a literal when one is there
  if (checkChromeLiterals(jsdoc(), '<nav aria-label="Main"><a href="#">Older</a></nav>').length !== 2) throw new Error('the chrome-literal check is vacuous')
})

check('every controls sample renders with a named target and raises no chrome literal', () => {
  const dir = CONTROLS_DIR
  const content = JSON.parse(readFileSync(join(dir, 'content.json'), 'utf8'))
  const defaults = Object.fromEntries(Object.entries(content.props).filter(([k, p]) => !k.includes('[]') && p.default !== undefined).map(([k, p]) => [k, p.default]))
  for (const n of controlsDesigns()) {
    const design = JSON.parse(readFileSync(join(dir, `${n}/design.json`), 'utf8'))
    const html = readFileSync(join(dir, `${n}/index.html`), 'utf8')
    for (const target of design.compileTarget) {
      renderTheme(jsdoc(), html, { target, schema: content.props, content: defaults, controlSchema: design.controlSchema, universals: design.universals, dataBindings: design.dataBindings, icons: iconDrawing })
    }
    if (checkChromeLiterals(jsdoc(), html).length) throw new Error(`controls/${n}: ${checkChromeLiterals(jsdoc(), html).join(' · ')}`)
  }
})

// Story 5.24c (DW-125): a render that names its template checks every binding against the context matrix (FR-H7), which
// a render naming none cannot. Each archetype renders at its own target with its own queries; the control is a render
// the matrix refuses, a feed at post.hbs, so a target that stopped being checked would fail here.
check('every archetype renders at its own target with its own queries, and a feed at post.hbs is still refused', () => {
  const refused = []
  for (const kind of ORDER) {
    try {
      renderTheme(jsdoc(), source({ kind, i: 1 }), { target: TARGET[kind], dataBindings: QUERIES[kind] })
    } catch (e) {
      refused.push(`${kind} at ${TARGET[kind]}: ${e.message.split('\n').slice(0, 2).join(' ')}`)
    }
  }
  if (refused.length) throw new Error(refused.join('\n       '))
  let control = null
  try { renderTheme(jsdoc(), source({ kind: 'feed', i: 1 }), { target: 'post.hbs' }) } catch (e) { control = e }
  if (!/"posts" is not available/.test(control?.message ?? '')) throw new Error(`the control rendered: a feed at post.hbs must be refused (FR-H7) — ${control?.message ?? 'no error'}`)
})

// review 5.24c: `build.js` runs by hand and gscan has no rule for it, so R-7's filter is held here — the error template's
// stack carries no kind that declares a query, and every other template's carries them all
check('the stress stack keeps every query-carrying kind off error.hbs (R-7), and off nothing else', () => {
  const kinds = (file) => new Set(stackFor(file, 40).map((s) => s.kind))
  const queried = Object.keys(QUERIES)
  const onError = queried.filter((k) => kinds('error').has(k))
  if (onError.length) throw new Error(`error.hbs would carry a {{#get}} from ${onError.join(', ')}`)
  const offIndex = queried.filter((k) => !kinds('index').has(k))
  if (offIndex.length) throw new Error(`the control: index.hbs lost ${offIndex.join(', ')}`)
})

check('no archetype still carries the retired data-prop-attr2', () => {
  for (const kind of ORDER) {
    if (source({ kind, i: 1 }).includes('data-prop-attr2')) throw new Error(`${kind} still uses it`)
  }
  if (Object.keys(A).length !== ORDER.length) throw new Error('ORDER and A have drifted apart')
})

check('every refusal code the validator can return has a test that it fires', () => {
  // Derived from the source, never a hand list — a code added without a test fails this line.
  const src = readFileSync(join(REPO, 'packages/library/src/validate.ts'), 'utf8')
  const tests = readFileSync(join(REPO, 'packages/library/src/validate.test.ts'), 'utf8')
  // Story 4.9: the catalog's refusals carry their code in catalog.ts and reach `push` by value, so both are read
  const catalogSrc = readFileSync(join(REPO, 'packages/library/src/catalog.ts'), 'utf8')
  const codes = [...new Set([...src.matchAll(/push\(out, '([a-z-]+)'/g), ...catalogSrc.matchAll(/code: '([a-z-]+)'/g)].map((m) => m[1]))]
  if (!codes.includes('catalog-key')) throw new Error('the extraction missed the catalog codes')
  const untested = codes.filter((c) => !tests.includes(`'${c}'`))
  if (untested.length) throw new Error(`no test fires ${untested.join(', ')}`)
  if (codes.length < 10) throw new Error('the code extraction found too few codes to be real')
})

// ── Story 4.2's reference token contract, checked against the BYTES ─────────────────────────────
// An unset custom property fails SILENTLY: the declaration is dropped and the element renders with
// whatever it inherited. So the contract is decorative unless something asserts that what a design
// READS is what the token block DECLARES. The in-memory half of this is
// `packages/section-runtime/src/tokens.test.ts`; this half reads the files, for the same reason the
// reference markup is checked here — AD-1 bans `node:fs` inside a core package's test.

check('the emitted reference-tokens.css has not drifted from the contract', () => {
  const onDisk = readFileSync(join(REPO, 'packages/section-runtime/reference-tokens.css'), 'utf8')
  if (onDisk !== referenceTokensCss()) {
    throw new Error('reference-tokens.css is stale — regenerate it from src/tokens.ts')
  }
})

// Story 6.1's review widened this from the reference design alone to every stylesheet that reads the block: a misspelt
// `--site-margin` in a pilot, a fixture or the post-body stand-in was caught by nothing.
check('every var(--…) a design, a fixture or the post-body stand-in reads is declared, or carries its own fallback', () => {
  const declared = new Set(TOKEN_NAMES)
  // `var(--x)` with no fallback must name a token; `var(--x, <fallback>)` is a design-local property
  // the design sets on the element itself (AD-3's carve-out) and is legitimately unset at the root.
  // Story 6.5: or a property the stylesheet's OWN mode-scoped root rules declare — every offered value of a mode-scoped
  // control declares the same set on the root (`mode-scoped-rule`), so it is declared by construction, read through the
  // validator's own reader
  const ownDeclared = (file, css) => {
    const dir = dirname(join(REPO, file))
    if (!existsSync(join(dir, 'design.json'))) return new Set()
    const d = JSON.parse(readFileSync(join(dir, 'design.json'), 'utf8'))
    const read = modeScopedRules(css, rootClassOf(readFileSync(join(dir, 'index.html'), 'utf8')), modeScopedOffers(d.controlSchema, d.universals))
    return new Set([...read.rules.values()].flatMap((byValue) => [...byValue.values()].flatMap((ds) => ds.map(([p]) => p))))
  }
  const undeclaredIn = (css, own = new Set()) => [...new Set([...css.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*([,)])/g)].filter((m) => m[2] === ')' && !declared.has(m[1]) && !own.has(m[1])).map((m) => m[1]))]
  const sheets = ['designs', 'fixtures'].flatMap((d) => readdirSync(join(REPO, 'packages/library', d), { recursive: true })
    .filter((f) => String(f).endsWith('style.css')).map((f) => join('packages/library', d, String(f))))
  sheets.push('apps/web/lib/style-guide.ts') // THEME_CSS, read as bytes: the app is not importable from here
  const bad = []
  for (const file of sheets) {
    const css = readFileSync(join(REPO, file), 'utf8')
    if (!/var\(/.test(css)) throw new Error(`${file}: the extraction found no var(--…) at all, so it proves nothing`)
    const undeclared = undeclaredIn(css, ownDeclared(file, css))
    if (undeclared.length) bad.push(`${file} reads ${undeclared.join(', ')}`)
  }
  if (bad.length) throw new Error(`${bad.join('; ')} — which the token contract does not declare`)
  // the control: a misspelt token must be named, and one with a fallback must not; nor one the root rules declare
  if (undeclaredIn('a{padding:var(--site-margn);gap:var(--own, 1px)}').join() !== '--site-margn') throw new Error('the extraction is not a control')
  if (undeclaredIn('a{color:var(--s-ink);background:var(--s-inq)}', new Set(['--s-ink'])).join() !== '--s-inq') throw new Error('the own-declared reading is not a control')
  console.log(`      swept ${sheets.length} stylesheets`)
})

check('the token contract is reachable in both modes and declares no empty value', () => {
  for (const mode of ['light', 'dark']) {
    const values = Object.entries(REFERENCE_TOKENS[mode])
    if (values.length !== TOKEN_NAMES.length) throw new Error(`${mode} declares ${values.length} of ${TOKEN_NAMES.length}`)
    for (const [k, v] of values) if (String(v).trim() === '') throw new Error(`${mode} ${k} is empty`)
  }
})

/* ── Story 6.1 — R-32's "no third state", held between the code and the PRD ──────────────────────────────────────
   Appendix D §D.0 is the normative half: every row of the engine's `TOKEN_ROWS` appears there, marked as the code marks
   it and naming the same properties, and no §D.0 row is missing from the code. A new token enters both in one commit,
   so either alone turns this red. The table is cut out of prd.md between `### D.0` and `### D.a`, the precedent
   `apps/web/plan.test.ts` and `tools/check-catalog.mjs` set for reading a PRD table. */
function d0Rows(prd) {
  const from = prd.indexOf('\n### D.0 ')
  const to = prd.indexOf('\n### D.a ', from)
  if (from === -1 || to === -1) throw new Error('prd.md has no "### D.0" followed by "### D.a" — the table cannot be cut out')
  const strip = (cell) => cell.replace(/[*`]/g, '').trim()
  return prd.slice(from, to).split('\n')
    .filter((l) => l.startsWith('|') && !/^\|\s*-/.test(l))
    .map((l) => l.split('|').slice(1, -1))
    .filter((cells) => strip(cells[0] ?? '') !== 'Row')
    .map((cells) => ({ row: strip(cells[0] ?? ''), source: strip(cells[1] ?? ''), properties: (cells[2] ?? '').match(/--[a-z0-9-]+/g) ?? [] }))
}
function d0Drift(rows, tokenRows) {
  const out = []
  const inPrd = new Map(rows.map((r) => [r.row, r]))
  for (const [row, { source, properties }] of Object.entries(tokenRows)) {
    const d = inPrd.get(row)
    if (d === undefined) out.push(`"${row}" is a row of TOKEN_ROWS and not of §D.0`)
    else if (d.source !== source) out.push(`"${row}" is ${source} in TOKEN_ROWS and ${d.source || 'unmarked'} in §D.0`)
    else if (d.properties.join(' ') !== properties.join(' ')) out.push(`"${row}" names ${properties.join(' ')} in TOKEN_ROWS and ${d.properties.join(' ') || 'nothing'} in §D.0`)
  }
  for (const r of rows) if (!Object.hasOwn(tokenRows, r.row)) out.push(`"${r.row}" is a row of §D.0 and not of TOKEN_ROWS`)
  if (rows.length !== new Set(rows.map((r) => r.row)).size) out.push('§D.0 lists a row twice')
  return out
}
check('Appendix D §D.0 and the engine\'s TOKEN_ROWS name the same rows, marked alike — no third state (R-32)', () => {
  const prd = readFileSync(join(REPO, '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md'), 'utf8')
  const rows = d0Rows(prd)
  if (rows.length === 0) throw new Error('§D.0 parsed as an empty table, so this check would pass whatever the code said')
  const drift = d0Drift(rows, TOKEN_ROWS)
  if (drift.length) throw new Error(drift.join('\n       '))
  // the control: one row's mark flipped, one row dropped, one invented, one property renamed and one row listed twice
  // must each be named
  const [first, ...rest] = rows
  const flipped = { ...first, source: first.source === 'computed' ? 'authored' : 'computed' }
  const renamed = { ...first, properties: [...first.properties.slice(0, -1), '--renamed'] }
  const caught = [d0Drift([flipped, ...rest], TOKEN_ROWS), d0Drift(rest, TOKEN_ROWS), d0Drift([...rows, { row: 'invented', source: 'computed', properties: [] }], TOKEN_ROWS),
    d0Drift([renamed, ...rest], TOKEN_ROWS), d0Drift([...rows, first], TOKEN_ROWS)]
  if (caught.some((d) => d.length !== 1)) throw new Error(`the comparison is not a control: ${JSON.stringify(caught)}`)
  console.log(`      §D.0 and TOKEN_ROWS agree on ${rows.length} rows`)
})

/* ── Story 6.2 — Appendix D held in CI: §D.d ↔ the presets, §D.c ↔ the pool, every file ↔ its sha256 ─────────────────
   The PRD is the normative half again (DW-11): §D.d authors the twelve and `packages/library/packs/packs.json` holds them
   as data; §D.c declares the thirty pairings and `packages/library/fonts/pool.json` is what `tools/fonts/build-pool.py`
   built from it. Each table is cut out of prd.md by heading, as §D.0 is above; each comparison runs both ways, and each
   check carries a control that must fail it, so an empty parse or a blind comparison is never a pass. */
const PRD_TEXT = () => readFileSync(join(REPO, '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md'), 'utf8')
const PACKS_JSON = JSON.parse(readFileSync(join(REPO, 'packages/library/packs/packs.json'), 'utf8'))
const POOL_DIR = join(REPO, 'packages/library/fonts')
const POOL_JSON = JSON.parse(readFileSync(join(POOL_DIR, 'pool.json'), 'utf8'))
const cut = (prd, from, to) => {
  const a = prd.indexOf(`\n### ${from} `)
  const b = a === -1 ? -1 : prd.indexOf(to, a + 1)
  if (a === -1 || b === -1) throw new Error(`prd.md has no "### ${from}" closed by ${JSON.stringify(to)} — the table cannot be cut out`)
  return prd.slice(a, b)
}
/** Every table in a section, as rows of cells keyed by the table's own header. */
const tables = (section) => {
  const out = []
  let head = null
  for (const line of section.split('\n')) {
    if (!line.startsWith('|')) { head = null; continue }
    const cells = line.split('|').slice(1, -1).map((c) => c.replace(/`/g, '').trim())
    if (/^-+$/.test(cells[0] ?? '')) continue
    if (head === null) { head = cells; out.push({ head, rows: [] }); continue }
    out.at(-1).rows.push(Object.fromEntries(head.map((h, i) => [h, cells[i] ?? ''])))
  }
  return out
}
const ROLES = { Background: 'background', Surface: 'surface', Text: 'text', Muted: 'muted', Border: 'border', Accent: 'accent', 'On-accent': 'onAccent', Scrim: 'scrim' }
const LEVELS = { Pairing: 'pairing', 'Pill radius': 'pillRadius', Radius: 'radius', Density: 'density', Width: 'width', Gutters: 'gutters', Buttons: 'buttons', Shadow: 'shadow', Links: 'links' }

/** §D.d as `{ reference, presets: [{ id, name, …levels, light, dark }] }`, the shape packs.json carries. */
function ddPresets(prd) {
  const section = cut(prd, 'D.d', '\n---')
  const [palette, levels] = [tables(section).find((t) => t.head[1] === 'Mode'), tables(section).find((t) => t.head[1] === 'Id')]
  if (!palette || !levels) throw new Error('§D.d carries no palette table (Pack | Mode | …) or no pack-level table (Pack | Id | …)')
  const presets = levels.rows.map((r) => {
    const p = { id: r.Id, name: r.Pack }
    for (const [h, k] of Object.entries(LEVELS)) p[k] = r[h]
    for (const mode of ['light', 'dark']) {
      const row = palette.rows.find((x) => x.Pack === r.Pack && x.Mode === mode)
      p[mode] = row ? Object.fromEntries(Object.entries(ROLES).map(([h, k]) => [k, k === 'scrim' ? Number(row[h]) : row[h]])) : null
    }
    return p
  })
  const ref = /\*\*The reference packs\*\*[^\n]*\n?[^\n]*?((?:`[a-z]+`(?: · )?)+)/.exec(section)
  return { reference: ref ? [...ref[1].matchAll(/`([a-z]+)`/g)].map((m) => m[1]) : [], presets, paletteRows: palette.rows.length }
}
function ddDrift(dd, data) {
  const out = []
  const flat = (p) => Object.entries(p).flatMap(([k, v]) => (v !== null && typeof v === 'object' ? Object.entries(v).map(([r, x]) => [`${k} ${r}`, x]) : [[k, v]]))
  const ids = (list) => list.map((p) => p.id)
  if (ids(dd.presets).join() !== ids(data.presets).join()) out.push(`the order or the ids differ: §D.d ${ids(dd.presets).join(' ')} · packs.json ${ids(data.presets).join(' ')}`)
  for (const [where, a, b] of [['§D.d', dd.presets, data.presets], ['packs.json', data.presets, dd.presets]]) {
    for (const p of a) {
      const q = b.find((x) => x.id === p.id)
      if (!q) { out.push(`${p.id} is a preset of ${where} and not of the other`); continue }
      const other = new Map(flat(q))
      for (const [k, v] of flat(p)) if (!other.has(k) || other.get(k) !== v) out.push(`${p.id} ${k}: ${where} ${JSON.stringify(v)}, the other ${JSON.stringify(other.get(k))}`)
    }
  }
  if (dd.reference.join() !== data.reference.join()) out.push(`the reference packs: §D.d ${dd.reference.join(' · ') || 'none'}, packs.json ${data.reference.join(' · ')}`)
  return [...new Set(out)]
}
check('Appendix D §D.d and packages/library/packs/ hold the same twelve, in the same order, both ways (DW-11)', () => {
  const dd = ddPresets(PRD_TEXT())
  if (dd.presets.length === 0 || dd.paletteRows === 0 || dd.reference.length === 0) throw new Error('§D.d parsed as an empty table (or no reference packs), so this check would pass whatever the data said')
  const drift = ddDrift(dd, PACKS_JSON)
  if (drift.length) throw new Error(drift.join('\n       '))
  // the control: one dark accent changed, one preset dropped, the reference packs reordered — each named
  const [first, ...rest] = PACKS_JSON.presets
  const changed = { ...PACKS_JSON, presets: [{ ...first, dark: { ...first.dark, accent: '#000001' } }, ...rest] }
  const caught = [ddDrift(dd, changed), ddDrift(dd, { ...PACKS_JSON, presets: rest }), ddDrift(dd, { ...PACKS_JSON, reference: [...PACKS_JSON.reference].reverse() })]
  if (!caught[0].some((d) => d.includes(`${first.id} dark accent`)) || caught[1].length === 0 || caught[2].length !== 1) throw new Error(`the comparison is not a control: ${JSON.stringify(caught)}`)
  console.log(`      §D.d and packs.json agree on ${dd.presets.length} presets; the reference packs ${dd.reference.join(' · ')}`)
})

/** §D.c as the builder reads it: per pairing, each role's family, type, and range (+ italic) or weights. */
function dcPairings(prd) {
  const table = tables(cut(prd, 'D.c', '\n### ')).find((t) => t.head[0] === '#')
  if (!table) throw new Error('§D.c carries no pool table')
  const face = (cell) => {
    const t = cell.replace(/–/g, '-')
    if (t.startsWith('V')) {
      const r = [...t.matchAll(/wght (\d+)-(\d+)/g)].map((m) => [Number(m[1]), Number(m[2])])
      return { type: 'V', range: r[0] ?? null, ...(t.includes('+ italic') ? { italic: r[1] ?? r[0] ?? null } : {}) }
    }
    return { type: 'S', weights: (t.split('·')[1] ?? '').match(/\d+i?/g) ?? [] }
  }
  return table.rows.map((r) => ({ id: r['#'], name: r.Pairing, files: Number(r.Files),
    heading: { family: r['Heading family'], ...face(r['Heading face · weights']) }, body: { family: r['Body family'], ...face(r['Body face · weights']) } }))
}
function dcDrift(rows, pool) {
  const out = []
  const key = (p) => JSON.stringify({ id: p.id, name: p.name, heading: decl(p.heading), body: decl(p.body) })
  const decl = (r) => ({ family: r.family, type: r.type, range: r.range, italic: r.italic, weights: r.weights })
  const inPool = new Map(pool.pairings.map((p) => [p.id, p]))
  for (const r of rows) {
    const p = inPool.get(r.id)
    if (!p) out.push(`${r.id} is a pairing of §D.c and not of pool.json`)
    else if (key(r) !== key(p)) out.push(`${r.id}: §D.c ${key(r)} — pool.json ${key(p)} (re-run tools/fonts/build-pool.py)`)
    else if (new Set([...p.heading.faces, ...p.body.faces]).size !== r.files) out.push(`${r.id}: §D.c's Files column says ${r.files}, the pool built ${new Set([...p.heading.faces, ...p.body.faces]).size} faces`)
  }
  for (const p of pool.pairings) if (!rows.some((r) => r.id === p.id)) out.push(`${p.id} is a pairing of pool.json and not of §D.c`)
  return out
}
check('Appendix D §D.c and packages/library/fonts/pool.json declare the same pairings — families, face type, range or weights — both ways', () => {
  const rows = dcPairings(PRD_TEXT())
  if (rows.length === 0) throw new Error('§D.c parsed as an empty table, so this check would pass whatever the pool held')
  const drift = dcDrift(rows, POOL_JSON)
  if (drift.length) throw new Error(drift.join('\n       '))
  // the control: one body range moved in the PRD, one pairing missing from the pool
  const first = rows.find((r) => r.body.range)
  if (!first) throw new Error('§D.c has no variable body to build the control from')
  const rest = rows.filter((r) => r !== first)
  const moved = [{ ...first, body: { ...first.body, range: [first.body.range[0], first.body.range[1] + 100] } }, ...rest]
  if (dcDrift(moved, POOL_JSON).length !== 1 || dcDrift(rows, { ...POOL_JSON, pairings: POOL_JSON.pairings.slice(1) }).length !== 1) throw new Error('the comparison is not a control')
  console.log(`      §D.c and pool.json agree on ${rows.length} pairings`)
})

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')
const poolFiles = (pool) => Object.values(pool.faces).flatMap((f) => f.files)
/** Every way the files on disk differ from what `pool` records of them. */
function fileFaults(pool) {
  const files = poolFiles(pool)
  const bad = []
  for (const f of files) {
    let buf
    try { buf = readFileSync(join(POOL_DIR, 'files', f.file)) } catch { bad.push(`${f.file} is missing`); continue }
    if (sha256(buf) !== f.sha256) bad.push(`${f.file}: sha256 ${sha256(buf)}, pool.json records ${f.sha256}`)
    else if (buf.length !== f.bytes) bad.push(`${f.file}: ${buf.length} bytes, pool.json records ${f.bytes}`)
  }
  const named = new Set(files.map((f) => f.file))
  for (const f of readdirSync(join(POOL_DIR, 'files'))) if (!named.has(f)) bad.push(`${f} sits in files/ and pool.json declares no face of it`)
  return bad
}
check('every pool.json file is on disk with its sha256, and no other file sits in packages/library/fonts/files/', () => {
  const files = poolFiles(POOL_JSON)
  if (files.length === 0) throw new Error('pool.json records no file, so this check proves nothing')
  const bad = fileFaults(POOL_JSON)
  if (bad.length) throw new Error(`${bad.join('\n       ')}\n       — the pool is built by uv run tools/fonts/build-pool.py, never by hand`)
  // the controls, through the comparison itself (review): a record whose hash is another's, and a record that drops a
  // face — so its files sit on disk undeclared — are each named
  const [id, face] = Object.entries(POOL_JSON.faces)[0]
  const wrong = { ...POOL_JSON, faces: { ...POOL_JSON.faces, [id]: { ...face, files: face.files.map((f) => ({ ...f, sha256: sha256(f.sha256) })) } } }
  const { [id]: _dropped, ...fewer } = POOL_JSON.faces
  if (fileFaults(wrong).length !== face.files.length || fileFaults({ ...POOL_JSON, faces: fewer }).length !== face.files.length) throw new Error('the file comparison is not a control')
  console.log(`      ${files.length} files, every one its recorded sha256`)
})

/** D.a rule 5 as Design Notes reads it: at most five faces per pairing, at most 200 KB of LATIN files (§D.a). */
function overBudget(pool) {
  return pool.pairings.flatMap((p) => {
    const faces = [...new Set([...p.heading.faces, ...p.body.faces])].map((id) => pool.faces[id])
    const latin = faces.reduce((t, f) => t + (f?.files.find((x) => x.subset === 'latin')?.bytes ?? Infinity), 0)
    return [...(faces.length > 5 ? [`${p.id} ${p.name}: ${faces.length} faces, more than 5`] : []), ...(latin > 200_000 ? [`${p.id} ${p.name}: ${(latin / 1000).toFixed(1)} KB of latin files, more than 200 KB`] : [])]
  })
}
check('every pairing keeps §D.a rule 5\'s budget as read: ≤ 5 faces and ≤ 200 KB of latin files', () => {
  const over = overBudget(POOL_JSON)
  if (over.length) throw new Error(over.join('\n       '))
  const [p] = POOL_JSON.pairings
  const big = { ...POOL_JSON, faces: { ...POOL_JSON.faces, [p.heading.faces[0]]: { ...POOL_JSON.faces[p.heading.faces[0]], files: [{ subset: 'latin', bytes: 300_000 }] } } }
  if (overBudget(big).length === 0) throw new Error('the budget is not a control: a 300 KB face passed')
  const many = { ...POOL_JSON, pairings: [{ ...p, body: { ...p.body, faces: Object.keys(POOL_JSON.faces).slice(0, 6) } }] }
  if (!overBudget(many).some((m) => m.includes('faces, more than'))) throw new Error('the budget is not a control: six faces passed')
  const heaviest = POOL_JSON.pairings.map((x) => [x.id, [...new Set([...x.heading.faces, ...x.body.faces])].reduce((t, id) => t + POOL_JSON.faces[id].files.find((f) => f.subset === 'latin').bytes, 0)]).sort((a, b) => b[1] - a[1])[0]
  console.log(`      the heaviest pairing, ${heaviest[0]}, is ${(heaviest[1] / 1000).toFixed(1)} KB of latin`)
})

function licenceFaults(pool) {
  const out = []
  for (const [family, f] of Object.entries(pool.families)) {
    if (f.licence !== 'OFL' && f.licence !== 'APACHE2') out.push(`${family}: licence ${f.licence}, neither OFL nor Apache 2.0 (§D.a rule 7)`)
    let text = ''
    try { text = readFileSync(join(POOL_DIR, f.licenceFile), 'utf8') } catch { out.push(`${family}: no licence file at ${f.licenceFile}`) }
    if (text && !(f.licence === 'OFL' ? /SIL OPEN FONT LICENSE/i : /Apache License/i).test(text)) out.push(`${family}: ${f.licenceFile} is not the ${f.licence} text`)
  }
  return out
}
check('every family is OFL or Apache 2.0, its licence text beside the files — and nothing else sits in licences/', () => {
  const faults = licenceFaults(POOL_JSON)
  const kept = new Set(Object.values(POOL_JSON.families).map((f) => f.licenceFile.split('/')[1]))
  for (const f of readdirSync(join(POOL_DIR, 'licences'))) if (!kept.has(f)) faults.push(`licences/${f} belongs to no family of the pool`)
  if (faults.length) throw new Error(faults.join('\n       '))
  const [name, fam] = Object.entries(POOL_JSON.families)[0]
  if (licenceFaults({ families: { [name]: { ...fam, licence: 'UFL' } } }).length === 0) throw new Error('the licence check is not a control')
  console.log(`      ${Object.keys(POOL_JSON.families).length} families, every one OFL or Apache 2.0`)
})

function roleFaults(pool) {
  return pool.pairings.flatMap((p) => {
    const styles = (r) => r.faces.map((id) => pool.faces[id]?.style)
    return [...(styles(p.heading).some((s) => s !== 'normal') ? [`${p.id}: a heading face is not roman (§D.a rule 1)`] : []),
      ...(!styles(p.body).includes('normal') || !styles(p.body).includes('italic') ? [`${p.id}: the body lacks a roman or an italic (§D.a rule 2)`] : [])]
  })
}
check('heading faces are roman only and every body has a roman and a true italic (§D.a rules 1–2)', () => {
  const faults = roleFaults(POOL_JSON)
  if (faults.length) throw new Error(faults.join('\n       '))
  const [p, ...rest] = POOL_JSON.pairings
  if (roleFaults({ ...POOL_JSON, pairings: [{ ...p, body: { ...p.body, faces: p.body.faces.filter((id) => POOL_JSON.faces[id].style === 'normal') } }, ...rest] }).length !== 1) throw new Error('the role check is not a control')
})

// §D.a rule 6 and the spec's Always: nothing the app, a package or the matrix ships names Google's font hosts
const HOSTS = /fonts\.(?:googleapis|gstatic)\.com/
const BINARY = /\.(png|woff2?|ttf|otf|ico|jpe?g|gif|webp)$/i
check('no tracked file under apps/web, packages or tools/matrix names a Google font host', () => {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'apps/web', 'packages', 'tools/matrix'], { cwd: REPO, encoding: 'utf8' }).split('\n').filter((f) => f && !BINARY.test(f))
  if (files.length === 0) throw new Error('git listed no file, so the sweep proves nothing')
  const naming = files.filter((f) => { try { return HOSTS.test(readFileSync(join(REPO, f), 'utf8')) } catch { return false } })
  if (naming.length) throw new Error(`${naming.join(', ')} name a Google font host — every face is the pool's own (§D.a rule 6)`)
  if (!HOSTS.test("@import url('https://fonts.gstatic.com/s/x.woff2')") || HOSTS.test('Google Fonts')) throw new Error('the host pattern is not a control')
  console.log(`      swept ${files.length} tracked files`)
})

// Story 6.1 (FR-F2, FR-G4) — sections span the site width: every design's stylesheet reads the pack's `--site-width`,
// so a Narrow or Wide pack moves every section's content column at once
check('every design reads var(--site-width), so a pack\'s site width reaches every section', () => {
  const DESIGNS = join(REPO, 'packages/library/designs')
  const isDir = (p) => { try { return statSync(p).isDirectory() } catch { return false } }
  const sheets = readdirSync(DESIGNS).filter((c) => isDir(join(DESIGNS, c))).flatMap((c) =>
    readdirSync(join(DESIGNS, c)).filter((n) => /^\d+$/.test(n) && isDir(join(DESIGNS, c, n))).map((n) => ({ id: `${c}/${n}`, css: readFileSync(join(DESIGNS, c, n, 'style.css'), 'utf8') })))
  if (sheets.length === 0) throw new Error('the sweep found no design at all, so it proves nothing')
  const reads = (css) => /var\(\s*--site-width\s*\)/.test(css.replace(/\/\*[\s\S]*?\*\//g, ''))
  if (reads('/* var(--site-width) */ .x { max-width: 1152px }') || !reads('.x { max-width: var(--site-width) }')) throw new Error('the sweep is not a control')
  const missing = sheets.filter((s) => !reads(s.css)).map((s) => s.id)
  if (missing.length) throw new Error(`${missing.join(', ')} never read var(--site-width) — a section spans the site width (FR-F2)`)
  console.log(`      swept ${sheets.length} designs, every one reads --site-width`)
})

/* ── Story 5.16a, R-188: THE CHECK THAT SHOUTS THE DAY THE NOTE STOPS BEING TRUE ────────────────────────────
   `{page_number}` emits ONE constant on the theme, `{{#if pagination.prev}}{{pagination.page}}{{/if}}`, and
   Handlebars resolves it against the CURRENT context. Inside a `{{#foreach}}` that context is the row, not the
   page, so the constant would print empty on the site while the canvas printed the number — the two emitters
   disagreeing, which is the one thing §7.3 exists to prevent. The `@root`-qualified spelling survives the block
   and gscan refuses it as an ERROR on both majors (MEASUREMENTS §49), so the constant cannot reach for it.

   No design does this today, and `docs/section-authoring.md` says so — which is a claim about the whole library
   with nothing behind it, and this project has been bitten by exactly that shape before. The owner ruled the
   remedy himself (2026-09-23, R-188, Question 4's option 1): *"Leave the written note, and add a check that
   shouts the day it stops being true."* It forbids nothing. It fails the day somebody puts an editable prop
   inside a repeat, and hands them the note so they decide on purpose.

   COUNTS ARE DERIVED, NEVER WRITTEN DOWN (standing rule 4): the sweep reports what it walked, and refuses to
   pass if it walked nothing — a sweep over an empty set is not a result. */
check('no editable prop sits inside a data-repeat, so {page_number} can never reach a {{#foreach}} (R-188)', () => {
  const DESIGNS = join(REPO, 'packages/library/designs')
  const isDir = (p) => { try { return statSync(p).isDirectory() } catch { return false } }
  const files = readdirSync(DESIGNS).sort().flatMap((category) =>
    isDir(join(DESIGNS, category))
      ? readdirSync(join(DESIGNS, category))
          .filter((d) => /^\d+$/.test(d) && isDir(join(DESIGNS, category, d)))
          .sort((a, b) => Number(a) - Number(b))
          .map((d) => ({ id: `${category}/${d}`, path: join(DESIGNS, category, d, 'index.html') }))
      : [])
  if (files.length === 0) throw new Error('the sweep found no design at all, so it proves nothing')
  let repeats = 0
  const caught = []
  for (const { id, path } of files) {
    const doc = new JSDOM(readFileSync(path, 'utf8')).window.document
    repeats += doc.querySelectorAll('[data-repeat]').length
    // `closest` answers the subtree question AND the element's own case — a repeat root that carries a prop
    // is the same hazard, and `agreement.test.ts` proves the runtime accepts that shape
    for (const el of doc.querySelectorAll('[data-prop], [data-prop-attr]')) {
      const rep = el.closest('[data-repeat]')
      if (rep) caught.push(`${id}: ${el.tagName.toLowerCase()}[data-prop="${el.getAttribute('data-prop') ?? el.getAttribute('data-prop-attr')}"] inside data-repeat="${rep.getAttribute('data-repeat')}"`)
    }
  }
  if (repeats === 0) throw new Error('the sweep found no data-repeat at all, so it would pass whatever the designs did — it is not a control')
  if (caught.length) {
    throw new Error(
      `an editable prop now sits inside a data-repeat, which is the one place {page_number} cannot work:\n       ` +
      caught.join('\n       ') +
      `\n       On the theme a repeat becomes {{#foreach}}, whose context is the ROW, so the page-number constant ` +
      `prints empty there while the canvas prints the number. Read "Where {page_number} does not reach" in ` +
      `docs/section-authoring.md and decide on purpose: either this prop does not take a page number, or the ` +
      `rule changes and this check changes with it. It is a note with a check behind it (R-188), not a ban.`,
    )
  }
  console.log(`      swept ${files.length} designs, ${repeats} data-repeat elements, 0 editable props inside one`)
})

console.log(`\n${failed ? `${failed} of ${n} checks FAILED` : `${n} checks passed — the grammar describes what was executed.`}\n`)
process.exit(failed ? 1 : 0)
