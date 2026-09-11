import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  BLANK_DOOR,
  CONNECT_DOOR,
  FIRST_RUN,
  FIRST_RUN_DOORS,
  needsSiteCount,
  showsFirstRun,
  STARTER_DOOR,
  type FirstRunState,
} from './lib/first-run.ts'
import { hasSearch } from './routing.ts'

/* Story 3.8 — First Run's whole I/O matrix, and the one thing a pure test cannot see: that the two
   surfaces drawing the starter door really read its sentences from one module.

   READ out of the files, not imported, for the source assertions: `node --test` strips types but
   cannot load a `.tsx` (`busy.test.ts` is the idiom). */

const AUTHED = join('app', '(app)', 'app', '(authed)')
const DASHBOARD = join(AUTHED, '(dashboard)', 'layout.tsx')
const START_LAYOUT = join(AUTHED, 'start', 'layout.tsx')
const READER = join('server', 'first-run.ts')
const SHEET = join(AUTHED, 'new-project-sheet.tsx')
const DOORS = join(AUTHED, 'start', 'doors.tsx')
const START = join(AUTHED, 'start', 'page.tsx')

const source = (file: string) => readFileSync(file, 'utf8')
const literally = (text: string) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

/** The state, with the row's own overrides — nothing but the row's difference is written out. */
const state = (over: Partial<FirstRunState> = {}): FirstRunState => ({
  unread: false,
  projects: 0,
  sites: 0,
  hasQuery: false,
  ...over,
})

test('the matrix: First Run is an account with no project, no site, and nothing on the URL', () => {
  // FIRST SIGN-IN — the one row that redirects.
  assert.equal(showsFirstRun(state()), true)

  // HAS A PROJECT. And the sites read is never made at all: the rule's own cheap half says so,
  // which is what the dashboard asks before it spends a round trip.
  assert.equal(needsSiteCount({ unread: false, projects: 1, hasQuery: false }), false)
  assert.equal(showsFirstRun(state({ projects: 1, sites: null })), false)
  // …and a project beats a site count of zero however it arrives.
  assert.equal(showsFirstRun(state({ projects: 1 })), false)

  // HAS A SITE ONLY — the dashboard's S3b empty screen, not the welcome screen.
  assert.equal(showsFirstRun(state({ sites: 1 })), false)
  assert.equal(showsFirstRun(state({ sites: 10 })), false)

  // PROJECTS READ FAILED. An unread account is not an empty one — the dashboard's own scar
  // (`page.tsx`, review 2026-09-05), and never a redirect.
  assert.equal(needsSiteCount({ unread: true, projects: 0, hasQuery: false }), false)
  assert.equal(showsFirstRun(state({ unread: true, sites: null })), false)
  // Even if a count somehow came back beside the error, the error decides.
  assert.equal(showsFirstRun(state({ unread: true, sites: 0 })), false)

  // SITES READ FAILED — `null`, and the safe side is the page that already works.
  assert.equal(showsFirstRun(state({ sites: null })), false)

  // RESTORED / SIGN-OUT-FAILED / ANYTHING AT ALL on the URL: the redirect never swallows a hint,
  // and one rule needs no list of hints to keep in step with.
  assert.equal(showsFirstRun(state({ hasQuery: true })), false)
  assert.equal(needsSiteCount({ unread: false, projects: 0, hasQuery: true }), false)

  // DISCONNECTED ONLY — a disconnected record is not a site (FR-C6), so the count is 0 and the
  // three doors are what an account with nothing connected sees. The filter that makes that true
  // is the dashboard's and is asserted below.
  assert.equal(showsFirstRun(state({ sites: 0 })), true)
})

test('needsSiteCount is the rule’s own cheap half, never a second opinion beside it', () => {
  // Whenever the count is not worth reading, no value of it can turn the answer true — which is
  // the property that lets the page gate the read on this and still have ONE decider.
  for (const over of [{ unread: true }, { hasQuery: true }, { projects: 3 }]) {
    const partial = { unread: false, projects: 0, hasQuery: false, ...over }
    assert.equal(needsSiteCount(partial), false, JSON.stringify(over))
    for (const sites of [0, 1, null]) {
      assert.equal(showsFirstRun({ ...partial, sites }), false, `${JSON.stringify(over)} sites=${sites}`)
    }
  }
})

test('“any query string” is the whole rule — no list of hints to keep in step with', () => {
  // What the proxy hands a layout is `route()`'s own `search`: '' or a leading '?'. `restoreAccount`
  // lands on `/?restored=1` and a failed sign-out on `/?signed-out-failed=1`, and both sentences
  // are ON the dashboard — so the redirect must never swallow one, whatever it is called.
  assert.equal(hasSearch(''), false)
  assert.equal(hasSearch(null), false)
  assert.equal(hasSearch(undefined), false)
  for (const search of ['?restored=1', '?signed-out-failed=1', '?q=', '?anything=else']) {
    assert.equal(hasSearch(search), true, search)
  }
  // A bare `/?` is NOT a query string: WHATWG URL drops it, so the proxy hands `''` and the redirect
  // fires. There is no typed escape hatch and the rule promises none (review, 2026-09-11).
  assert.equal(new URL('http://a/?').search, '')
  assert.equal(hasSearch(new URL('http://a/?').search), false)
})

test('S2a’s words are the module’s, in the frame’s order, with Recommended on the first', () => {
  assert.deepEqual([...FIRST_RUN_DOORS], [CONNECT_DOOR, STARTER_DOOR, BLANK_DOOR])
  assert.equal(FIRST_RUN.heading, "Let's make your Ghost site gorgeous.")
  assert.equal(FIRST_RUN.footer, 'You can do all of this later.')
  assert.equal(FIRST_RUN.recommended, 'Recommended')
  // The one door that cannot act yet is the one with a reason — UX-DR3, and greyed.ts refuses to
  // grey a control without one.
  assert.deepEqual(
    FIRST_RUN_DOORS.filter((door) => door.reason).map((door) => door.title),
    [STARTER_DOOR.title],
  )
  // Departure 3: the shipped voice is British. The frame writes "colors".
  assert.match(CONNECT_DOOR.consequence, /colours/)
  // Departure 2: no count is typed into the module beyond the roster's own word (standing rule 4).
  assert.doesNotMatch(FIRST_RUN.heading + FIRST_RUN.footer, /\d/)
})

test('one home for the starter door’s sentences — neither surface keeps a copy', () => {
  for (const file of [SHEET, DOORS]) {
    const text = source(file)
    assert.match(text, /from '@\/lib\/first-run'/, `${file}: the starter door's words live in lib/first-run.ts`)
    assert.match(text, /\bSTARTER_DOOR\b/, `${file}: it must draw the shared door, not its own`)
    for (const sentence of [STARTER_DOOR.consequence, STARTER_DOOR.reason]) {
      assert.doesNotMatch(
        text,
        literally(sentence),
        `${file} holds its own copy of “${sentence}”. Two surfaces draw the starter door and they ` +
          'cannot be allowed to disagree about what a starter is — import it.',
      )
    }
  }
})

test('the three doors each reach the thing that is already built', () => {
  const doors = source(DOORS)
  // Connect: a PLAIN anchor into 3.2's full-page handshake. Not a `<Link>` — `busy.test.ts`'s
  // NO_SKELETON entry for /sites/connect says no soft navigation reaches it, and a `<Link>` here
  // would make that reason false without a single test going red.
  assert.match(doors, /<a href="\/sites\/connect"/, 'the Recommended door must be a plain <a> into the handshake')
  assert.doesNotMatch(doors, /from 'next\/link'/, '/sites/connect is reached by a document load, never a soft navigation')
  // Blank: the sheet the dashboard opens, by the shell's own opener.
  assert.match(doors, /openNewProject/, 'the Blank door opens the dashboard\'s sheet, not a copy of it')
  assert.match(source(START), /<NewProjectSheet /, 'the route must render the sheet the Blank door opens')
  // Starter: greyed WITH the reason, through the kit — never a tooltip and never a local grey.
  assert.match(doors, /greyedProps\(/, 'the starter door is greyed through components/kit/greyed.ts')
  assert.match(doors, /reason\(/, 'a greyed control shows its reason in the helper-caption slot')
  assert.doesNotMatch(doors, /\btitle=|Tooltip/, 'UX-DR3: the reason is a sentence under the control, never a tooltip')
})

test('the dashboard asks the rule, and asks Postgres for the one count the rule needs', () => {
  const layout = source(DASHBOARD)
  const reader = source(READER)
  assert.match(layout, /showsFirstRun\(/, 'the redirect is decided by the rule, not by a branch here')
  assert.match(layout, /redirect\('\/start'\)/, 'First Run is its own route, so it gets its own skeleton')
  // AND IT IS THE LAYOUT, NOT THE PAGE. `(dashboard)/loading.tsx` is a Suspense boundary, so a
  // redirect from inside the page is delivered as a CLIENT navigation — measured on a production
  // build: 200, the project-card skeleton for ~150ms, and nothing at all with scripts off.
  assert.doesNotMatch(
    source(join(AUTHED, '(dashboard)', 'page.tsx')),
    /redirect\(/,
    'a redirect from the page is flushed after the shell and cannot be a 307 — it belongs in layout.tsx',
  )
  // FR-C6: a disconnected record is a record Inflozo kept, and it is not a site.
  assert.match(reader, /\.is\('disconnected_at', null\)/, 'a disconnected record must not count as a site')
  // No row crosses the wire for a count.
  assert.match(reader, /count: 'exact', head: true/, 'the site count is a head count')
  // The rule is fed the whole URL, not the hints this page happens to know the names of — and a
  // layout is not given `searchParams`, so the proxy hands it over and nothing else may.
  assert.match(layout, /hasSearch\(head\.get\(SEARCH_HEADER\)\)/, 'ANY query string suppresses the redirect')
  // NOTHING IS REMEMBERED — the owner's Question 1 ruling. A mark against the account is the
  // option he did not take, so no such column or metadata key may appear here.
  for (const text of [layout, reader]) assert.doesNotMatch(text, /first_run|firstRunSeen|user_metadata\.first/, 'First Run stores nothing')
})

test('the proxy is the ONLY writer of the search header, so a client cannot send one', () => {
  // Every .ts/.tsx in the app, read: a second `.set(SEARCH_HEADER` anywhere would let a value a
  // client sent be believed, and the review sentence that made this claim had no check behind it.
  const files = readdirSync('.', { recursive: true, encoding: 'utf8' }).filter(
    (f) => /\.tsx?$/.test(f) && !f.endsWith('.test.ts') && !f.startsWith('node_modules') && !f.startsWith('.next'),
  )
  assert.ok(files.length > 20, `expected the app's sources, got ${files.length}`)
  const writers = files.filter((f) => /\.set\(\s*SEARCH_HEADER\b/.test(source(f)))
  assert.deepEqual(writers, ['proxy.ts'])
  assert.match(source('proxy.ts'), /if \(isApp\) headers\.set\(SEARCH_HEADER, search\)/, 'set on every app request, empty included')
})

test('/start guards its other side: an account with anything is sent back to Projects', () => {
  // Executed on app.inflozo.com before this existed (review, 2026-09-11): a project made from the
  // welcome screen's own Blank door left the customer on the three doors, and a typed `/start`
  // drew them over an account with work. The layout, not the page — `start/loading.tsx` is a
  // Suspense boundary, the same measurement as the dashboard's.
  const layout = source(START_LAYOUT)
  assert.match(layout, /!showsFirstRun\(/, 'the reverse of the one rule, not a second rule')
  assert.match(layout, /readFirstRun\(false\)/, 'a query string on /start means nothing')
  assert.match(layout, /redirect\('\/'\)/, 'an account with a project or a site is sent to Projects')
  assert.doesNotMatch(source(START), /redirect\(/, 'the guard belongs above the loading boundary, never in the page')
  // ONE reader for both layouts, so there is one decider and not two restatements of the reads.
  assert.match(source(DASHBOARD), /from '@\/server\/first-run'/)
  assert.match(layout, /from '@\/server\/first-run'/)
})
