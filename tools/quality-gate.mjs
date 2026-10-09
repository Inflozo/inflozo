// Story 7.8 — the quality gate over ANY Ghost theme directory: FR-J17's negative control's door. Ghost's own Casper and
// Source pass gscan at 0/0 and must each fail at least one rule of `qualityGate`, every finding real against their source
// (the spec's § The negative control). Also the stylesheet half: the root `stylelint.config.mjs` over the theme's
// `screen.css` (`assets/built/` where Ghost's themes build it, else `assets/css/`), recorded beside the verdict.
//
//     node tools/quality-gate.mjs <theme-dir>       (Node 24: it imports the gate's TypeScript)
//
// Prints one JSON object — `{ theme, verdict, stylesheet }` — on stdout; exits 0 whatever the verdict says, 2 when the
// directory cannot be read. The pack is Paper's (`REFERENCE_PACK`) and the library is EMPTY: a theme Inflozo did not
// compile has no library, so the required set is `REQUIRED_TEMPLATES` alone.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = process.argv[2]
if (!dir || !statSync(dir, { throwIfNoEntry: false })?.isDirectory()) {
  console.error('usage: node tools/quality-gate.mjs <theme-dir>')
  process.exit(2)
}
const { qualityGate } = await import(join(REPO, 'packages/theme-compiler/gate/index.ts'))
const { REFERENCE_PACK } = await import(join(REPO, 'packages/section-runtime/src/reference.ts'))

/** Text where the gate reads text, bytes otherwise; never `node_modules` or `.git`. */
const TEXTUAL = /\.(?:hbs|css|js|json|md|txt|yaml|yml|html)$/
const files = {}
const walk = (at) => {
  for (const e of readdirSync(at, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue
    const p = join(at, e.name)
    if (e.isDirectory()) walk(p)
    else files[relative(dir, p).split(sep).join('/')] = TEXTUAL.test(e.name) ? readFileSync(p, 'utf8') : new Uint8Array(readFileSync(p))
  }
}
walk(dir)

const verdict = qualityGate(files, { pack: REFERENCE_PACK, library: () => undefined })

// the stylesheet half, through the one CSS floor (FR-G8); stylelint reads the pin from the working directory
process.chdir(REPO)
const stylelint = (await import('stylelint')).default
const sheet = ['assets/built/screen.css', 'assets/css/screen.css'].find((p) => typeof files[p] === 'string')
let stylesheet = null
if (sheet !== undefined) {
  const [r] = (await stylelint.lint({ code: files[sheet], codeFilename: join(REPO, 'packages/library/fixtures/quality-gate-probe.css') })).results
  stylesheet = { file: sheet, warnings: r.warnings.map((w) => ({ line: w.line, rule: w.rule, text: w.text })) }
}
console.log(JSON.stringify({ theme: dir, verdict, stylesheet }, null, 2))
