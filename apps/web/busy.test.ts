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
/* THE WALK HAS TO REACH `components/`, and the first writing of it did not — so the one control
   in the repository that ALREADY had a busy state, `account-menu.tsx`'s Sign out, was the one
   control this test could not see. Deleting its label and both aria attributes left the suite
   green (review, 2026-09-09), in the test whose whole subject is that the pattern was never
   lifted out of that file. The `submit.tsx` skip below is the tell: it names a path this walk
   could never have produced. */
const ROOTS = [APP, 'components']

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
  for (const file of ROOTS.flatMap(tsxUnder)) {
    // `Submit` is the control this rule is about; its own `type="submit"` is the implementation.
    if (file.endsWith('components/kit/submit.tsx')) continue
    const source = readFileSync(file, 'utf8')
    const controls = [...source.matchAll(/type="submit"/g)].map((m) => m.index)
    for (const match of source.matchAll(/type="submit"/g)) {
      // AND THE WINDOW STOPS AT THE NEXT SUBMIT CONTROL, so a silent one cannot be credited with
      // its neighbour's label — which is the very thing "a busy control from a busy neighbour"
      // means where two of them sit close together (review, 2026-09-09).
      const next = controls.find((i) => i > match.index)
      const control = source.slice(match.index, Math.min(match.index + WINDOW, next ?? Infinity))
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
  // THE LABEL SWAP MOVES NOTHING (the owner's ask of 2026-09-10): both labels are in the DOM in
  // one grid cell, so the control is already as wide as its busy word. `{pending ? busy : children}`
  // would satisfy every assertion above and bring the 41px jump back (review 7, 2026-09-10).
  assert.match(source, /<BusyLabel pending=\{pending\} busy=\{busy\}>/, '`Submit` must render both labels through `BusyLabel`')
  assert.match(source, /col-start-1 row-start-1/, '`BusyLabel` stacks both labels in ONE grid cell')
  // …and the one submit control that is not a `Submit` goes through the same cell.
  const keysForm = readFileSync('app/(app)/app/(authed)/sites/keys-content-form.tsx', 'utf8')
  assert.match(keysForm, /<BusyLabel /, 'the hand-written Save must use `BusyLabel` too')
})

/* ── FINDING 2: "I want the loading shimmer to match the cards they show."

   A `loading.tsx` covers every child segment that has none of its own, so one boundary at the top
   of `(authed)` drew the DASHBOARD's cards over Sites and over Account. The rule was already the
   project's — DESIGN.md § Loading, "skeletons matching the shape that is coming" — so what this
   asserts is the file, which is the part that was missing.

   AND WHERE THE FILE SITS, which is the half a first fix got wrong and the deployed-site harness
   caught. Giving `/sites` its own `loading.tsx` was not enough: `(authed)/loading.tsx` was still a
   boundary ABOVE it, so the streamed document of /sites carried the dashboard's project-card
   skeleton and then its own over the top. A skeleton scopes to exactly one route only when it
   sits in a segment with no child routes — hence `(dashboard)/` and `sites/(list)/`, two
   path-transparent route groups that changed no URL (the build's route table is identical). */

/** The routes deliberately without one, each with its reason, so it is a decision not an omission. */
const NO_SKELETON: Record<string, string> = {
  [join(APP, 'app', 'sign-in')]:
    'not a list of cards but ONE card the page draws whole, and nothing stands above it: since ' +
    'the route groups landed there is no loading.tsx anywhere on its path, so it inherits no ' +
    'shape at all — which is what this rule is about. R-98\'s words are "every route the user ' +
    'reaches", so it is recorded here rather than left outside the walk',
  [join(APP, 'app', 'restore')]:
    'the same, and it is reached only by the shell\'s own redirect for a pending account ' +
    '(`deletion-rule.ts`\'s RESTORE_PATH); one card, no list, and no boundary above it',
  [join(AUTHED, 'kit')]:
    'the internal component gallery, reachable only by typing the path — a skeleton of every ' +
    'control for a page that IS every control is work nobody asked for. It now inherits NOTHING ' +
    'rather than the dashboard\'s cards, which is the point of the route groups',
  [join(AUTHED, 'style-guide')]:
    'Story 4.4\'s internal fixture review, the kit\'s sibling and exempt for the kit\'s reason: nothing ' +
    'links to it, so it is reached only by typing the path — a document load with the browser\'s own ' +
    'progress on it, never a soft navigation that would show a route skeleton',
  [join(AUTHED, 'controls')]:
    'Story 4.5\'s internal controls review, the style guide\'s sibling and exempt for the kit\'s reason: ' +
    'nothing links to it, so it is reached only by typing the path — a document load with the ' +
    'browser\'s own progress on it, never a soft navigation that would show a route skeleton',
  [join(AUTHED, 'pilots')]:
    'Story 4.10\'s internal pilots review, `/controls`\' sibling and exempt for the kit\'s reason (R-98): nothing ' +
    'links to it, so it is reached only by typing the path — a document load with the browser\'s own progress on ' +
    'it, never a soft navigation that would show a route skeleton',
  [join(AUTHED, 'style-guide', 'variations')]:
    'the same page\'s variation sheet, reached only from a plain <a href> on the page above it — a ' +
    'document load, never a soft navigation',
  [join(AUTHED, 'sites', 'connect')]:
    'no soft navigation reaches it, so a route skeleton is never what the browser shows. The ' +
    '"Connect site" opener is an <a href> whose click JavaScript turns into the sheet, and the ' +
    'wizard\'s own ?step= links are plain anchors — every remaining way in (scripts off, a ' +
    'modified click, a typed URL) is a document load with the browser\'s own progress on it',
  [join(AUTHED, 'sites', 'keys')]:
    'Story 3.6, and NOTHING SOFT-NAVIGATES HERE. S11a\'s ⋯ "Manage API keys" is a PanelLink: its ' +
    'href is this route, so a typed URL, a modified click, a refresh, a shared link and a ' +
    'scripts-off browser all land here as document loads with the browser\'s own progress on ' +
    'them, and a plain click goes to /sites?manage=… instead — the window over the list, whose ' +
    'skeleton is keys-skeleton.tsx inside the list page\'s own <Suspense> (the owner\'s test of ' +
    '3.6, findings 2, 3 and 5: a popup that is a parameter on a route the URL never leaves)',
  [join(AUTHED, '[...unbuilt]')]:
    'Story 3.9\'s catch-all, and the ONE route whose skeleton would be a defect rather than an ' +
    'omission: a loading.tsx is a Suspense boundary, so Next commits the status line before the ' +
    'page runs and this route\'s notFound() would land inside an already-successful 200 (R-98\'s ' +
    'second effect, DW-67). There is also nothing to stream — it calls notFound() and nothing else',
  [join(AUTHED, 'sites', 'disconnect')]:
    'the same, one row down: S11a\'s ⋯ "Disconnect" is an <a href="/sites/disconnect?site=…"> whose ' +
    'click JavaScript turns into the card\'s <dialog>, and it is a PLAIN anchor and not a <Link>, so ' +
    'nothing soft-navigates here either. One card the page draws whole, reached only by a document ' +
    'load (scripts off, a modified click, a typed URL) with the browser\'s own progress on it',
  [join(APP, 'app', 'harness', 'editor')]:
    'Story 5.9\'s keyboard harness (R-146), and it is not a route the user reaches AT ALL: it answers notFound() ' +
    'unless INFLOZO_HARNESS=1, which only `tools/keyboard/run-keyboard-gate.sh` sets. A loading.tsx would also be ' +
    'the defect DW-67 names — a Suspense boundary commits the 200 before notFound() runs',
  [join(APP, 'app', 'harness', 'editor', '[template]')]:
    'Story 5.20: the same harness on another canvas, and the same reason — the editor is the harness layout\'s, so this ' +
    'page renders nothing, and it refuses a segment the scheme does not know with notFound(), which a boundary above ' +
    'it would turn into a committed 200',
  [join(AUTHED, 'projects', '[id]', '(editor)')]:
    'Story 5.1\'s editor, and a loading.tsx here would be a defect: both editor pages render nothing, and the ' +
    'editor\'s skeleton — its own shape, bar, both panels and the page card — is the Suspense fallback inside ' +
    '`projects/[id]/(editor)/layout.tsx`, BELOW `[id]/layout.tsx`\'s 404 guard. A loading.tsx is a boundary ABOVE ' +
    'the guard, so a stranger\'s project id would stream an editor skeleton under a committed 200 (R-98\'s second ' +
    'effect, DW-67). The `(editor)` group is Story 5.6\'s R-131: it changed no URL, and it is what lets ' +
    '`settings/` have a skeleton of its own without standing over the editor',
  [join(AUTHED, 'projects', '[id]', '(editor)', '[template]')]:
    'the same editor on another canvas, and the same reason — plus this segment\'s own layout 308s `home` and ' +
    '404s every segment that is not a canvas, which a boundary above it would turn into a 200',
}

test('a skeleton sits where it covers one route and no sibling', () => {
  const overreaching: string[] = []
  for (const file of tsxUnder(APP)) {
    if (!file.endsWith('/loading.tsx')) continue
    const dir = file.slice(0, -'/loading.tsx'.length)
    // Any page.tsx BELOW this directory is a route this boundary also stands over — which is how
    // /sites came to stream the dashboard's cards before its own.
    const below = tsxUnder(dir).filter((f) => f.endsWith('/page.tsx') && f.slice(0, -'/page.tsx'.length) !== dir)
    if (below.length) overreaching.push(`${file} also covers ${below.join(', ')}`)
  }
  assert.deepEqual(
    overreaching,
    [],
    'These skeletons stand over routes that are not their own, so those routes stream this shape ' +
      'before their own — the owner\'s test of Story 3.4, finding 2, and the half a first fix ' +
      'missed. Move the page and its loading.tsx into a route group (a parenthesised directory, ' +
      'which changes no URL) so the boundary has no children:\n  ' + overreaching.join('\n  '),
  )
})

test('every route the user reaches has a skeleton in its own shape', () => {
  const missing: string[] = []
  for (const file of tsxUnder(APP)) {
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

/* ── AND THE HALF THIS AUDITOR COULD NOT SEE, found by the owner instead of by it (his test of
   Story 3.6, 2026-09-10, finding 2): "it takes some time and while it is still not open I can
   click the Menu link again. If I do so the popup open on a blank screen instead of the Sites
   screen."

   The submit test above walks `type="submit"`, so it audits every control that posts a FORM and
   no control that starts a NAVIGATION — and S11a's ⋯ "Manage API keys" was one of those: a bare
   `router.push` inside an `onClick`, with two server round trips behind it and nothing on screen
   through them. R-98 says "every control that starts work says so", and a navigation that has to
   read a credential row is work. `useTransition` is what such a control has in place of
   `useFormStatus`; `panel-link.tsx` is the one that has it.

   `router.replace` IS DELIBERATELY NOT AUDITED. The two in the tree are a search field clearing
   its own `?q=` and a dialog closing itself — neither starts work, and neither has anywhere to
   show a busy state if it did. */
test('every control that starts a navigation says it is working', () => {
  const offenders: string[] = []
  for (const file of ROOTS.flatMap(tsxUnder)) {
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(/router\.push\(/g)) {
      // Read in the control's OWN window, as the submit rule is — the same reason: a file with a
      // busy neighbour is not a control that says anything.
      const control = source.slice(Math.max(0, match.index - WINDOW), match.index + WINDOW)
      if (/useTransition|isPending|\bpending\b/.test(control)) continue
      offenders.push(`${file}:${source.slice(0, match.index).split('\n').length}`)
    }
  }
  assert.deepEqual(
    offenders,
    [],
    'These controls start a navigation with nothing on screen to say so — the owner\'s test of ' +
      'Story 3.6, finding 2. Wrap the push in `useTransition` and swap the label while it is ' +
      'pending (`panel-link.tsx` is the pattern):\n  ' + offenders.join('\n  '),
  )
})

test('a skeleton draws the shape that is coming, never a spinner', () => {
  for (const file of tsxUnder(APP)) {
    if (!file.endsWith('/loading.tsx')) continue
    const source = readFileSync(file, 'utf8')
    // DESIGN.md § Loading is explicit: "Never a spinner."
    assert.doesNotMatch(source, /animate-spin|role="progressbar"|Spinner/, `${file}: DESIGN.md § Loading — never a spinner.`)
    // The skeleton is decoration, so it is hidden from the reader and replaced by one sentence.
    assert.match(source, /aria-hidden/, `${file}: the drawing is decoration and must be aria-hidden.`)
    assert.match(source, /sr-only/, `${file}: a reader gets one sentence in place of the drawing.`)
  }
})
