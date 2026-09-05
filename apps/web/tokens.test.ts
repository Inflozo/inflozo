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

/** The colour forms the export uses: 6-digit hex and rgb(a). Anything else is not a
    transcription and fails loudly rather than slipping past the grep. */
const atoms = /#[0-9A-Fa-f]{6}\b|rgba?\([^)]*\)/g

test('every colour value in the token layer occurs verbatim in the export', () => {
  for (const { name, value } of tokens) {
    const found = value.match(atoms) ?? []
    if (name.startsWith('--color-')) {
      assert.equal(found.join(''), value, `${name}: "${value}" is not a hex or rgb(a) colour the export could contain`)
    }
    for (const atom of found) {
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
  assert.ok(keys.length > 0, `DESIGN.md front matter: ${section}: block parsed to no keys`)
  return keys
}

const twins: [string, string][] = [
  ['colors', '--color'],
  ['rounded', '--radius'],
  ['elevation', '--shadow'],
]

for (const [section, prefix] of twins) {
  test(`every DESIGN.md ${section}.* name has its ${prefix}-* twin, and nothing else is named`, () => {
    const declared = group(tokens, prefix).map((t) => shortName(t.name, prefix))
    const recorded = frontMatterKeys(section)
    const missing = recorded.filter((k) => !declared.includes(k))
    assert.deepEqual(missing, [], `${prefix}: no token for ${section}.${missing.join(', ')}`)
    // both ways: a name invented in CSS is as much a second vocabulary as a value
    const invented = declared.filter((k) => !recorded.includes(k))
    assert.deepEqual(invented, [], `${prefix}: ${invented.join(', ')} is not a name DESIGN.md records`)
  })
}

test('no .ts or .tsx under apps/web carries a colour literal', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      if (e.name === 'node_modules' || e.name === '.next') return []
      const p = join(dir, e.name)
      if (e.isDirectory()) return walk(p)
      return /\.tsx?$/.test(e.name) && !e.name.endsWith('.test.ts') && !e.name.endsWith('.d.ts') ? [p] : []
    })

  const files = walk(process.cwd())
  assert.ok(files.some((f) => f.endsWith('.tsx')), 'found no .tsx to scan')
  // hex in any length, and rgb(a) — the same atoms the token test accepts, so what one
  // gate allows in globals.css the other refuses everywhere else
  const literal = /#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b|rgba?\([^)]*\)/g
  const offenders = files.flatMap((f) => {
    const hits = readFileSync(f, 'utf8').match(literal)
    return hits ? [`${f}: ${[...new Set(hits)].join(' ')}`] : []
  })
  assert.deepEqual(offenders, [], 'the tokens are the only colour vocabulary')
})

test('every face the theme names is a face layout.tsx loads', () => {
  const css = readFileSync(themeFile(), 'utf8')
  const inline = /@theme inline\s*\{([\s\S]*?)\n\}/.exec(css)
  assert.ok(inline, 'globals.css has no @theme inline block')
  const faces = [...inline[1].matchAll(/var\((--font-[a-z-]+)\)/g)].map((m) => m[1])
  assert.ok(faces.length > 0, 'the inline theme names no font variable')
  const layout = readFileSync(join(process.cwd(), 'app', 'layout.tsx'), 'utf8')
  for (const face of faces) {
    assert.ok(layout.includes(`variable: '${face}'`), `${face} is read by the theme but no next/font call declares it`)
  }
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
