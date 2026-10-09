// Story 7.7 — AD-23's recordings of the two pinned gscans' rule inventories, which the gate's test reads
// (`packages/theme-compiler/gate/gate.test.ts`). For each Ghost major in `GSCAN`, it writes
// `packages/theme-compiler/fixtures/gscan/rules-<version>.json` as `{ gscan, checkVersion, ghost, captured, command, rules }`,
// `rules` being `installedRules(major)` — the installed checker's own spec for its `checkVersion`: each rule's code, level,
// fatal flag and a regex rule's source. No count is written anywhere: the file is the list.
//
//     node tools/record-gscan.mjs          (Node 24: it imports the gate's TypeScript)
//
// A re-run with nothing changed rewrites nothing, `captured` included. Run it as step 2 of the bump procedure
// (`packages/theme-compiler/fixtures/gscan/README.md`), in the same commit that moves a pin.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(REPO, 'packages/theme-compiler/fixtures/gscan')
const COMMAND = 'node tools/record-gscan.mjs'
const { GSCAN, installedRules, installedVersion } = await import(join(REPO, 'packages/theme-compiler/gate/gscan.ts'))

for (const major of Object.keys(GSCAN).map(Number)) {
  const { version, checkVersion, ghost } = GSCAN[major]
  const gscan = installedVersion(major)
  if (gscan !== version) throw new Error(`gscan ${gscan} is installed for Ghost ${major} where ${version} is pinned — install the pin first`)
  const file = join(OUT, `rules-${gscan}.json`)
  const rules = installedRules(major)
  const before = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
  const same = before !== null && JSON.stringify(before.rules) === JSON.stringify(rules) && before.checkVersion === checkVersion && before.ghost === ghost
  const captured = same ? before.captured : new Date().toISOString().slice(0, 10)
  writeFileSync(file, `${JSON.stringify({ gscan, checkVersion, ghost, captured, command: COMMAND, rules }, null, 2)}\n`)
  console.log(`  ${same ? 'unchanged' : 'recorded '} ${join('packages/theme-compiler/fixtures/gscan', `rules-${gscan}.json`)} — Ghost ${ghost}, ${checkVersion}, ${Object.keys(rules).length} rules`)
}
