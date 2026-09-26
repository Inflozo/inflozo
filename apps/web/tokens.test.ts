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

/**
 * THE ONE FILE THAT MAY CARRY A COLOUR, and it is a different vocabulary rather than a leak: a
 * Style Pack's colours belong to the USER'S SITE (`components/kit/pack-cell.tsx`), not to
 * Inflozo's chrome, so they are hex strings applied as inline `style` and can never be a
 * Tailwind class. E6 owns the column and re-sources every pack from Appendix D (DW-11);
 * Story 1.5 reads Paper early for the dashboard card's placeholder (FR-B1).
 * Named, so the exemption is one file rather than a habit.
 */
const PACK_DATA = join('lib', 'style-pack.ts')

/*
 * THE SECOND, and it is the same kind of exemption: the Nest mark's ink and its accent core
 * belong to INFLOZO'S IDENTITY, not to the app's chrome. They are the export's own SVG
 * attributes, inlined byte-for-byte under R-74 (Story 1.6) — tokenising them would be redrawing
 * the mark, which the logo README forbids, and the accent tittle is that same core colour beside
 * it. The comment there also names the dark mark's pair, for the day a dark surface exists.
 * Named, so this stays two files rather than a habit.
 */
const IDENTITY = join('components', 'kit', 'logo.tsx')

/*
 * THE THIRD, and it is the email one (Story 2.5). An email client has neither custom properties
 * nor a stylesheet it can be trusted with — `supabase/auth/magic-link.html` already carries the
 * same five values inline for exactly that reason, and this module is that template as a function.
 * So the literals stay, and the test BELOW turns them from an exemption into a checked copy: each
 * one must be a token's own value in the theme, so the day a token moves this fails rather than
 * quietly sending the old paper colour to an inbox.
 *
 * IT MOVED WITH THE SHELL IN STORY 3.7, and this is the whole reason the exemption names ONE path
 * rather than a directory: FR-P1's eighth email was `lib/deletion-email.ts` alone until the third
 * one needed the same paper, so the shell — and its five hexes with it — became
 * `lib/email-shell.ts` and BOTH emails ride it. The exemption follows the values, so the two
 * callers carry no colour at all and are scanned like every other file.
 */
const EMAIL = join('lib', 'email-shell.ts')

/*
 * THE FOURTH, and it is Ghost's (Story 5.21). The canvas draws Ghost's announcement bar and Portal's floating button
 * where Ghost puts them, and they stand in for GHOST'S page, not Inflozo's interface (FR-H5, R-74's scope): their
 * stylesheets and icons are Ghost's own, recorded on both majors and held equal to the recording by
 * `ghost-surfaces.test.ts`. Tokenising them would be redrawing Ghost. So the literals stay, and the test BELOW pays for
 * the exemption: every colour the file writes is one Ghost itself put on a page (MEASUREMENTS §55's `surfaces.json`), or
 * Ghost's own default accent, read in its source (`default-settings.json`'s `accent_color`, both majors).
 */
const GHOST = join('lib', 'ghost-surfaces.ts')

test('no .ts or .tsx under apps/web carries a colour literal', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      if (e.name === 'node_modules' || e.name === '.next') return []
      const p = join(dir, e.name)
      if (e.isDirectory()) return walk(p)
      return /\.tsx?$/.test(e.name) && !e.name.endsWith('.test.ts') && !e.name.endsWith('.d.ts') ? [p] : []
    })

  const all = walk(process.cwd())
  // The ONE exempt path, not any path ending in it: `endsWith` would have exempted a future
  // `components/lib/style-pack.ts` too, which is the habit the name was chosen against
  // (review, 2026-09-06).
  const named = [PACK_DATA, IDENTITY, EMAIL, GHOST]
  const exempt = named.map((p) => join(process.cwd(), p))
  // An exemption cannot outlive the file it names.
  for (const [i, f] of exempt.entries()) {
    assert.ok(all.includes(f), `${named[i]} is gone — delete its exemption with it`)
  }
  const files = all.filter((f) => !exempt.includes(f))
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

/**
 * THE EMAIL SHELL'S EXEMPTION, PAID FOR. `lib/email-shell.ts` may write hexes because an inbox has
 * no token layer — but every one of them must still BE a token's value, or the emails the product
 * sends itself would drift away from the product they are about, silently and for ever. The values
 * are read out of the module and looked up in the theme; neither side is restated here. Both
 * callers — the deletion confirmation and Story 3.7's reconnect notice — are covered by this one
 * assertion, because there is one shell.
 */
test('every colour the email shell writes is a token value in the theme', () => {
  const source = readFileSync(join(process.cwd(), EMAIL), 'utf8')
  const written = [...new Set(source.match(/#[0-9A-Fa-f]{6}\b/g) ?? [])]
  assert.ok(written.length > 0, `${EMAIL} carries no colour at all — delete its exemption with them`)
  const values = new Set(tokens.filter((t) => t.name.startsWith('--color-')).map((t) => t.value))
  for (const hex of written) {
    assert.ok(
      values.has(hex),
      `${EMAIL} writes ${hex}, which is no --color-* value in the theme. An email cannot read a ` +
        'custom property, so the value is copied — and a copy that is not checked is a copy that drifts.',
    )
  }
})

test('every colour Ghost\'s two surfaces write is one Ghost itself put on a page, or Ghost\'s own default accent', () => {
  const source = readFileSync(join(process.cwd(), GHOST), 'utf8')
  const written = [...new Set(source.match(/#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b|rgba?\([^)]*\)/g) ?? [])]
  assert.ok(written.length > 0, `${GHOST} carries no colour at all — delete its exemption with them`)
  // what Ghost put on T1's and T3's pages, as recorded: the bar's sheet and icon, Portal's frame sheet and icon
  const recorded = ['5', '6'].map((m) => readFileSync(join(process.cwd(), '..', '..', 'packages', 'ghost-shim', 'fixtures', `ghost${m}`, 'surfaces.json'), 'utf8')).join('\n')
  // Ghost's default accent is not on a page whose site has its own — it is `default-settings.json`'s, read in source
  const DEFAULT_ACCENT = '#FF1A75'
  for (const colour of written.filter((c) => c !== DEFAULT_ACCENT)) {
    assert.ok(recorded.includes(colour), `${GHOST} writes ${colour}, which Ghost put on no recorded page — a colour of our own in Ghost's look`)
  }
  assert.ok(source.includes(`'${DEFAULT_ACCENT}'`), 'the default accent is the one colour this test names')
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
