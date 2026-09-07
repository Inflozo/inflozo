import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { sheet, title } from './components/kit/dialog.ts'

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

// THE DIALOG VOCABULARY, now that two cards share it (`components/kit/dialog.ts`). It is a plain
// module, so unlike the two above it is IMPORTED rather than read — but the class string is still
// what is pinned, because the sheet is the one place the modal's scrim, shadow and centring are
// decided and a silent edit there moves every dialog in the app at once.
test('the shared dialog sheet keeps the scrim, the shadow and the centring margin', () => {
  for (const token of ['m-auto', 'shadow-modal', 'backdrop:bg-scrim', 'open:flex']) {
    assert.ok(sheet.includes(token), `kit/dialog.ts: the sheet must keep ${token}.`)
  }
})

// The lift itself: `project-menu.tsx` owes its dialogs to `kit/dialog.ts` and carries no copy of
// the sheet, the title or the `showModal()` ceremony — a re-copy is how two dialogs stop matching.
test('the project menu imports the dialog vocabulary and keeps no copy of it', () => {
  const menu = readFileSync('app/(app)/app/(authed)/project-menu.tsx', 'utf8')
  assert.match(menu, /from '@\/components\/kit\/dialog'/)
  for (const copied of ['shadow-modal', 'backdrop:bg-scrim', 'showModal(', 'font-display text-[20px]']) {
    assert.ok(!menu.includes(copied), `project-menu.tsx: ${copied} belongs in kit/dialog.ts only.`)
  }
  for (const token of ['font-display', 'text-[20px]', 'text-ink']) {
    assert.ok(title.includes(token), `kit/dialog.ts: the title must keep ${token}.`)
  }
  // A keyboard-activated submit is a click at (0,0) on the button; only a click whose target is
  // the <dialog> itself may be read as the backdrop (executed, second review 2026-09-07).
  const dialog = readFileSync('components/kit/dialog.ts', 'utf8')
  assert.match(
    dialog,
    /if \(event\.target !== event\.currentTarget\) return[\s\S]*?getBoundingClientRect/,
    'kit/dialog.ts: closeOnBackdrop must refuse a click on a child before it measures geometry.',
  )
})
