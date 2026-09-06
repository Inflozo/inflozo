import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// READ out of the files, not imported: `node --test` strips types but cannot load `.tsx`, which
// is why every pure test in this repo lives on a `lib/*.ts`. The contract is still worth pinning.
//
// S1a's passkey button shipped at 600 against a frame that draws 500. The weight was passed as a
// `className`, and a `className` cannot win: both are plain utilities in the same `@layer
// utilities`, Tailwind emits `font-medium` BEFORE `font-semibold`, and the later rule takes it.
// The markup carried both classes, so a grep of the served HTML said the patch had landed and
// only a computed style showed it had not (review, 2026-09-06).

const BUTTON = 'components/kit/button.tsx'
const PASSKEY = 'app/(app)/app/sign-in/passkey-button.tsx'
const WEIGHT = /font-(?:thin|light|normal|medium|semibold|bold|extrabold|black)/g

test('buttonClasses emits the weight it was given, and no second one beside it', () => {
  const source = readFileSync(BUTTON, 'utf8')
  const template = /export const buttonClasses =[\s\S]*?`([^`]*)`/.exec(source)
  assert.ok(template, `${BUTTON}: buttonClasses's class template was not found`)
  assert.match(template[1], /\$\{weight\}/, 'the weight must be interpolated, not hardcoded')
  assert.deepEqual(
    template[1].match(WEIGHT),
    null,
    `${BUTTON}: a literal font-weight beside \${weight} is a second class every caller silently loses to.`,
  )
})

test("a frame's own weight goes through the Kit, never through className", () => {
  const source = readFileSync(PASSKEY, 'utf8')
  assert.match(source, /weight="font-medium"/, `${PASSKEY}: S1a draws this label at 500.`)
  const classNames = [...source.matchAll(/className="([^"]*)"/g)].map((m) => m[1])
  for (const value of classNames) {
    assert.deepEqual(
      value.match(WEIGHT),
      null,
      `${PASSKEY}: className "${value}" carries a font-weight. It will lose to the Kit's own — pass \`weight\` instead.`,
    )
  }
})
