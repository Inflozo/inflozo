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
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const REPO = join(here, '..', '..')

const { A, ORDER, source } = require('./sections.js')
const { DIRECTIVES, UNIVERSAL_CONTROLS, validateMarkup, validateDesign } =
  await import(join(REPO, 'packages/library/src/index.ts'))

let failed = 0
const check = (label, fn) => {
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
  const open = html.slice(html.indexOf('<'))
  const tag = open.slice(0, open.indexOf('>'))
  const names = [...tag.matchAll(/\s(data-[\w-]+)\s*=/g)].map((m) => m[1])
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
  })
  if (f.length) throw new Error(say(f))
})

check('the fixture exercises every directive in the closed set', () => {
  const html = readFileSync(join(REPO, 'packages/library/fixtures/reference-design/index.html'), 'utf8')
  const missing = Object.keys(DIRECTIVES).filter((n) => !new RegExp(`${n}[=\\s>]`).test(html))
  if (missing.length) throw new Error(`no example of ${missing.join(', ')}`)
})

check('no archetype still carries the retired data-prop-attr2', () => {
  for (const kind of ORDER) {
    if (source({ kind, i: 1 }).includes('data-prop-attr2')) throw new Error(`${kind} still uses it`)
  }
  if (Object.keys(A).length !== ORDER.length) throw new Error('ORDER and A have drifted apart')
})

const n = ORDER.length + 5
console.log(`\n${failed ? `${failed} of ${n} checks FAILED` : `${n} checks passed — the grammar describes what was executed.`}\n`)
process.exit(failed ? 1 : 0)
