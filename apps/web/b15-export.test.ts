// Story 7.26 (DW-60) — B15's control row as the frame draws it (`B Missing Surfaces.dc.html:1219-1225`): Export theme zip for the
// projects that link the site — one → a link to its editor with the export asked, several → a menu of their links by name, none →
// no control — Re-check plan, and a greyed Ship it with its reason under it (P0-0). The rule is `lib/probe-rule.ts`' `exportDoor`;
// the card is a server render with server actions (`site-notices.tsx`), so its wiring is read from its source, `deploy.test.ts`' way.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { greyedProps, reason } from './components/kit/greyed.ts'
import { DEPLOY_WORDS } from './lib/deploy.ts'
import { exportAsk, exportDoor, PREVIEW_COPY } from './lib/probe-rule.ts'

const A = { id: '00000000-0000-4000-8000-0000000000a1', name: 'Field Notes' }
const B = { id: '00000000-0000-4000-8000-0000000000b2', name: 'Night Shift' }
const NOTICES = readFileSync('app/(app)/app/(authed)/sites/site-notices.tsx', 'utf8')
const MENU = readFileSync('app/(app)/app/(authed)/sites/export-menu.tsx', 'utf8')
const SITES = readFileSync('app/(app)/app/(authed)/sites/(list)/page.tsx', 'utf8')

test('the door: none → no control; one → its editor with the export asked; two → a menu of both, each by its name', () => {
  assert.equal(exportDoor([]), null)
  assert.deepEqual(exportDoor([A]), { href: `/projects/${A.id}?export=1` })
  assert.deepEqual(exportDoor([A, B]), { links: [{ id: A.id, name: A.name, href: exportAsk(A.id) }, { id: B.id, name: B.name, href: exportAsk(B.id) }] })
  assert.equal(exportAsk(A.id), `/projects/${A.id}?export=1`)
})

test('the card draws the door: one project is an ink-primary link with the frame\'s words, several the menu, none nothing — and the menu is one plain link per project', () => {
  const row = NOTICES.slice(NOTICES.indexOf('const door = exportDoor(projects)'), NOTICES.indexOf('{recheckFailed ? ('))
  assert.match(row, /\{door === null \? null : 'href' in door \? \(\s+<a id=\{`export-zip-\$\{siteId\}`\} href=\{door\.href\} className=\{buttonClasses\('primary', 36\)\}>\s+\{PREVIEW_COPY\.exportZip\}/)
  assert.match(row, /<ExportMenu siteId=\{siteId\} links=\{door\.links\} \/>/)
  // Re-check plan stays, after the export
  assert.ok(row.indexOf('PREVIEW_COPY.exportZip') < row.indexOf('PREVIEW_COPY.recheck'))
  assert.match(MENU, /\{links\.map\(\(link\) => \(\s+<a key=\{link\.id\} href=\{link\.href\}/)
  assert.match(MENU, /<span className="min-w-0 truncate">\{link\.name\}<\/span>/)
  assert.match(MENU, /popover="auto"/)
  assert.match(MENU, /onKeyDown=\{arrowKeys\}/)
  assert.match(MENU, /\{PREVIEW_COPY\.exportZip\}/)
  // the Sites page hands each card the projects that link it, its tally unchanged
  assert.match(SITES, /supabase\.from\('projects'\)\.select\('id, name, linked_site_id'\)/)
  assert.match(SITES, /const linked = projectCounts\(projects \?\? \[\]\)/)
  assert.match(SITES, /<SiteNotices site=\{site\} recheckFailed=\{recheckedId === site\.id\} projects=\{linking\.get\(site\.id\) \?\? \[\]\} \/>/)
})

test('the greyed Ship it: P0-0\'s attributes and its reason id, the sentence under it, the button\'s own word — focusable, never `disabled`', () => {
  const row = NOTICES.slice(NOTICES.indexOf('const door = exportDoor(projects)'), NOTICES.indexOf('{recheckFailed ? ('))
  assert.match(row, /const ship = `ship-blocked-\$\{siteId\}`/)
  assert.match(row, /const blocked = \{ reason: PREVIEW_COPY\.shipBlocked \}/)
  assert.match(row, /<button type="button" id=\{ship\} \{\.\.\.greyedProps\(ship, blocked\)\}/)
  assert.match(row, /\{DEPLOY_WORDS\.ship\}/)
  assert.match(row, /\{reason\(ship, blocked\)\}/)
  assert.doesNotMatch(row, /\sdisabled(?=[\s=}>/])/)
  // what those two calls draw: the reason addressed by the button
  const id = 'ship-blocked-x'
  assert.equal(greyedProps(id, { reason: PREVIEW_COPY.shipBlocked })['aria-describedby'], `${id}-reason`)
  assert.equal(renderToStaticMarkup(reason(id, { reason: PREVIEW_COPY.shipBlocked })), `<p id="${id}-reason" class="text-[11.5px] leading-[1.5] text-ink-soft">This site&#x27;s plan doesn&#x27;t accept custom themes, so Inflozo can&#x27;t ship to it.</p>`)
  assert.equal(DEPLOY_WORDS.ship, 'Ship it')
})
