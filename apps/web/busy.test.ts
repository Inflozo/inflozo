import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/* THE AUDITOR FOR THE OWNER'S TEST OF STORY 3.4 — both findings, and the reason each is a test
   rather than a note. He asked for a thorough check AND for it to hold in every future story:
   "Please do a thorough check and ensure this is included in all future specs and stories."
   A rule with no check is the state that produced the findings — the loading rule was already
   written down in DESIGN.md and the busy pattern was already in three files, and neither reached
   the fourth. A propagation list cannot audit itself (standing rule 7); this walks the tree.

   READ out of the files, not imported: `node --test` strips types but cannot load `.tsx`, which
   is why every pure test in this repo lives on a `lib/*.ts` and the two that must see components
   read their source (`kit-button.test.ts` is the pattern).

   NOTHING HERE IS A COUNT. Both tests derive their subjects from the directory tree, so a new
   route or a new form is covered the day it lands rather than the day someone remembers to add
   a row (standing rule 4). */

const APP = 'app/(app)'
const AUTHED = 'app/(app)/app/(authed)'

/** Every `.tsx` under the app, so a new surface is audited without being listed. */
function tsxUnder(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...tsxUnder(path))
    else if (entry.endsWith('.tsx')) out.push(path)
  }
  return out
}

/* ── FINDING 1: "there is no way the user know if something is happening in background."

   The split was exact and it is the whole diagnosis: a form in a CLIENT component reads its own
   `useActionState` pending and every one of them said something; a form in a SERVER component has
   no hook to read and every one of them said nothing — S2c's two buttons among them. So the rule
   is on the control, not on the file: a submit control must be one that carries a busy label. */
/* LOOKED FOR AT THE CONTROL, NOT ANYWHERE IN THE FILE. The first version of this test asked
   whether the source contained a pending-ish word at all, and `restore/page.tsx` — whose Sign out
   button had no busy state whatever — passed it on the word "deleting" in a sentence about
   account deletion, three hundred lines away. A check that reads the whole file cannot tell a
   busy control from a busy neighbour, and this one exists precisely because the neighbours were
   fine. So each control is read in its own window: from `type="submit"` to the end of the element
   it opens, which is where a swapped label lives. */
const WINDOW = 500
const SAYS_SOMETHING =
  /\b(pending|checking|sending|saving|renaming|removing|deleting|duplicating|revoking|restoring|signingOut|busy)\b/

test('every submit control says it is working', () => {
  const offenders: string[] = []
  for (const file of tsxUnder(APP)) {
    // `Submit` is the control this rule is about; its own `type="submit"` is the implementation.
    if (file.endsWith('components/kit/submit.tsx')) continue
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(/type="submit"/g)) {
      const control = source.slice(match.index, match.index + WINDOW)
      if (SAYS_SOMETHING.test(control)) continue
      const line = source.slice(0, match.index).split('\n').length
      offenders.push(`${file}:${line}`)
    }
  }
  assert.deepEqual(
    offenders,
    [],
    'These files submit a form with the button unchanged — the owner\'s test of Story 3.4, ' +
      'finding 1. Use `Submit` from components/kit/submit.tsx (it takes a required `busy` label), ' +
      'or `useSubmitting()` where the control is not a Kit button:\n  ' +
      offenders.join('\n  '),
  )
})

test('the shared submit control refuses the second press and says why', () => {
  const source = readFileSync('components/kit/submit.tsx', 'utf8')
  // `aria-disabled`, never `disabled`: a disabled button loses focus to the body and stops being
  // announced, and this one is the thing the user is waiting on (greyed.ts takes the same line).
  assert.match(source, /aria-disabled=\{pending/, 'the busy control must stay in the tab order')
  assert.doesNotMatch(source, /\sdisabled=/, 'a `disabled` submit control drops out of the tab order')
  assert.match(source, /aria-busy=\{pending/, 'assistive tech is told WHY the press is refused')
  // React queues form actions, so without the released ref one double tap sends two — and a ref
  // left set makes the only control that can retry inert for good (review, 2026-09-06).
  assert.match(source, /if \(!pending\) inFlight\.current = false/, 'the in-flight ref must be released')
  assert.match(source, /busy: string/, '`busy` is required, so a control cannot ship without one')
})

/* ── FINDING 2: "I want the loading shimmer to match the cards they show."

   A `loading.tsx` covers every child segment that has none of its own, so one boundary at the top
   of `(authed)` drew the DASHBOARD's cards over Sites and over Account. The rule was already the
   project's — DESIGN.md § Loading, "skeletons matching the shape that is coming" — so what this
   asserts is the file, which is the part that was missing. */

/** The routes deliberately without one, each with its reason, so it is a decision not an omission. */
const NO_SKELETON: Record<string, string> = {
  [join(AUTHED, 'kit')]:
    'the internal component gallery, reachable only by typing the path — a skeleton of every ' +
    'control for a page that IS every control is work nobody asked for',
  [join(AUTHED, 'sites', 'connect')]:
    'no soft navigation reaches it, so a route skeleton is never what the browser shows. The ' +
    '"Connect site" opener is an <a href> whose click JavaScript turns into the sheet, and the ' +
    'wizard\'s own ?step= links are plain anchors — every remaining way in (scripts off, a ' +
    'modified click, a typed URL) is a document load with the browser\'s own progress on it',
}

test('every route the user reaches has a skeleton in its own shape', () => {
  const missing: string[] = []
  for (const file of tsxUnder(AUTHED)) {
    if (!file.endsWith('/page.tsx')) continue
    const dir = file.slice(0, -'/page.tsx'.length)
    if (dir in NO_SKELETON) continue
    if (readdirSync(dir).includes('loading.tsx')) continue
    missing.push(dir)
  }
  assert.deepEqual(
    missing,
    [],
    'These routes have no loading.tsx of their own, so they inherit a parent\'s skeleton and draw ' +
      'the wrong shape — the owner\'s test of Story 3.4, finding 2. Add one matching the cards the ' +
      'route shows, or record the route in NO_SKELETON with its reason:\n  ' + missing.join('\n  '),
  )
})

test('a skeleton draws the shape that is coming, never a spinner', () => {
  for (const file of tsxUnder(AUTHED)) {
    if (!file.endsWith('/loading.tsx')) continue
    const source = readFileSync(file, 'utf8')
    // DESIGN.md § Loading is explicit: "Never a spinner."
    assert.doesNotMatch(source, /animate-spin|role="progressbar"|Spinner/, `${file}: DESIGN.md § Loading — never a spinner.`)
    // The skeleton is decoration, so it is hidden from the reader and replaced by one sentence.
    assert.match(source, /aria-hidden/, `${file}: the drawing is decoration and must be aria-hidden.`)
    assert.match(source, /sr-only/, `${file}: a reader gets one sentence in place of the drawing.`)
  }
})
