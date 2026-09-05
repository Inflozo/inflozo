import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { group, readTheme, shortName, themeFile } from './tokens.ts'

// F-110's grep, made permanent. The Claude Design export is the design authority (R-74) and
// the token layer is a TRANSCRIPTION of it — so the transcription is checked, not trusted.
// Nothing here counts anything: membership comes from the files.

const PLANNING = join(process.cwd(), '..', '..', '_bmad-output', 'planning-artifacts')
const EXPORT = join(PLANNING, 'design', 'claude-design-export', 'Inflozo')
const DESIGN_MD = join(PLANNING, 'ux-designs', 'ux-Inflozo-2026-09-03', 'DESIGN.md')

const tokens = readTheme(readFileSync(themeFile(), 'utf8'))

/** Every frame in the export, read once. */
const frames = readdirSync(EXPORT)
  .filter((f) => f.endsWith('.dc.html'))
  .map((f) => readFileSync(join(EXPORT, f), 'utf8'))

const inExport = (needle: string) => frames.some((frame) => frame.includes(needle))

test('the export has frames to check against', () => {
  assert.ok(frames.length > 0, `no .dc.html frames under ${EXPORT}`)
})

test('every colour value in the token layer occurs verbatim in the export', () => {
  const atoms = /#[0-9A-Fa-f]{6}\b|rgba?\([^)]*\)/g
  for (const { name, value } of tokens) {
    for (const atom of value.match(atoms) ?? []) {
      assert.ok(inExport(atom), `${name}: ${atom} occurs in no frame of the export`)
    }
  }
})

test('every shadow is the export’s own shadow, geometry included', () => {
  const shadows = group(tokens, '--shadow')
  assert.ok(shadows.length > 0, 'the token layer declares no shadows')
  for (const { name, value } of shadows) {
    assert.ok(inExport(value), `${name}: "${value}" occurs in no frame of the export`)
  }
})

/** DESIGN.md's front matter is the record of the NAMES. Its values carry trailing prose
    after an em dash; the name is all this test needs. */
function frontMatterKeys(section: string): string[] {
  const md = readFileSync(DESIGN_MD, 'utf8')
  const body = /^---\n([\s\S]*?)\n---/m.exec(md)
  assert.ok(body, 'DESIGN.md has no front matter')
  const lines = body[1].split('\n')
  const start = lines.findIndex((l) => l === `${section}:`)
  assert.ok(start >= 0, `DESIGN.md front matter has no ${section}: block`)
  const keys: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (!/^ {2}\S/.test(line)) break // dedent ends the block
    const key = /^ {2}([A-Za-z0-9-]+):/.exec(line)
    if (key) keys.push(key[1])
  }
  return keys
}

const twins: [string, string][] = [
  ['colors', '--color'],
  ['rounded', '--radius'],
  ['elevation', '--shadow'],
]

for (const [section, prefix] of twins) {
  test(`every DESIGN.md ${section}.* name has its ${prefix}-* twin`, () => {
    const declared = new Set(group(tokens, prefix).map((t) => shortName(t.name, prefix)))
    const missing = frontMatterKeys(section).filter((k) => !declared.has(k))
    assert.deepEqual(missing, [], `${prefix}: no token for ${section}.${missing.join(', ')}`)
  })
}

test('no .tsx under apps/web carries a hex colour literal', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      if (e.name === 'node_modules' || e.name === '.next') return []
      const p = join(dir, e.name)
      return e.isDirectory() ? walk(p) : e.name.endsWith('.tsx') ? [p] : []
    })

  const files = walk(process.cwd())
  assert.ok(files.length > 0, 'found no .tsx to scan')
  const offenders = files.flatMap((f) => {
    const hits = readFileSync(f, 'utf8').match(/#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g)
    return hits ? [`${f}: ${[...new Set(hits)].join(' ')}`] : []
  })
  assert.deepEqual(offenders, [], 'the tokens are the only colour vocabulary')
})

test('the app’s three widths are the export’s three widths', () => {
  const widths = Object.fromEntries(
    group(tokens, '--breakpoint').map((t) => [shortName(t.name, '--breakpoint'), t.value]),
  )
  assert.deepEqual(widths, { mobile: '390px', tablet: '834px', desktop: '1440px' })
})

test('app-floor is a coarse-pointer condition, never a bare width', () => {
  const css = readFileSync(themeFile(), 'utf8')
  assert.match(css, /@custom-variant coarse \(@media \(pointer: coarse\)\)/)
})
