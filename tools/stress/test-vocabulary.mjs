// The control for Story 4.1's grammar, placed where the thing it controls lives.
//
// `tools/stress/sections.js` is the EXECUTED archetype set — eight realistic sections, mean 39.1
// elements and 21.0 directives each, compiled and gated on both gscan majors for four rounds. If
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
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const REPO = join(here, '..', '..')

const { A, ORDER, source } = require('./sections.js')
const { DIRECTIVES, UNIVERSAL_CONTROLS, scanTags, validateMarkup, validateDesign } =
  await import(join(REPO, 'packages/library/src/index.ts'))
const { REFERENCE_TOKENS, TOKEN_NAMES, referenceTokensCss } =
  await import(join(REPO, 'packages/section-runtime/src/tokens.ts'))

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

check("every var(--…) the reference design reads is declared, or carries its own fallback", () => {
  const css = readFileSync(join(REPO, 'packages/library/fixtures/reference-design/style.css'), 'utf8')
  const declared = new Set(TOKEN_NAMES)
  const undeclared = []
  // `var(--x)` with no fallback must name a token; `var(--x, <fallback>)` is a design-local property
  // the design sets on the element itself (AD-3's carve-out) and is legitimately unset at the root.
  for (const m of css.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*([,)])/g)) {
    if (m[2] === ')' && !declared.has(m[1])) undeclared.push(m[1])
  }
  if (undeclared.length) {
    throw new Error(`the reference design reads ${[...new Set(undeclared)].join(', ')}, which the token contract does not declare`)
  }
  if (!/var\(/.test(css)) throw new Error('the extraction found no var(--…) at all, so it proves nothing')
})

check('the token contract is reachable in both modes and declares no empty value', () => {
  for (const mode of ['light', 'dark']) {
    const values = Object.entries(REFERENCE_TOKENS[mode])
    if (values.length !== TOKEN_NAMES.length) throw new Error(`${mode} declares ${values.length} of ${TOKEN_NAMES.length}`)
    for (const [k, v] of values) if (String(v).trim() === '') throw new Error(`${mode} ${k} is empty`)
  }
})

console.log(`\n${failed ? `${failed} of ${n} checks FAILED` : `${n} checks passed — the grammar describes what was executed.`}\n`)
process.exit(failed ? 1 : 0)
