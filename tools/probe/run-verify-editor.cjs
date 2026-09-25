#!/usr/bin/env node
// Story 5.1's deployed walk of the editor, against the DEPLOYED app and the live Supabase (R-82).
//
//   env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs) OUT_DIR=/tmp/x node tools/probe/run-verify-editor.cjs
//   APP_ORIGIN=http://localhost:3000 APP_PREFIX=/app …   # a local `next start`: no Vercel check, and not a deployed result
//
// Node 24 (it imports the seed, which reads the app's own TypeScript). Keys reach it through process.env only and it
// prints none. Two throwaway accounts through the Auth Admin API: A is seeded with `seed-editor-project.mjs` ("Pilot
// sections": site a1/1, home a4/13 · a17/1 · a22/1, post a24/1) and B gets one bare project. A signs in by magic link,
// then the spec's nine Verification steps: Projects → the card → the editor and S4a's measured regions (screenshots
// into OUT_DIR for the owner's comparison); zero `data-inflozo-*` at rest with a planted attribute as the count's control;
// every section root's outerHTML equal to `/pilots`' render of the same design; the CSP session (headers, an init script
// reporting `securitypolicyviolation` from every frame, folds, `/post`, Back) with `new Function('')` run by a script
// carrying each document's own nonce as the control; the scheme's statuses, the identical 404s and Back; the canvas
// scrolling under the wheel while the window cannot; axe-core at WCAG 2.1 AA after its positive control; and the
// skeleton's sentence in the raw stream. Both accounts are deleted in `finally`, with the user count read before and
// after. Refuses to start on a dirty tree or unless Vercel serves HEAD. Shape: run-verify-pilots.cjs.
//
// Story 5.2 adds steps 10–14 — hover, select (with R-119's Pro badge and its entitlement control), edits, Esc and touch —
// run INSIDE step 5's CSP session so its zero covers every gesture, and step 8's axe twice more, hovered and selected.
// Every on-screen measure maps a canvas rect through the iframe's own rect and scale, and an outline's width is read as
// painted pixels from a device-scale screenshot (R-120), with a 1px hover line as the control for the 1.5px one; the expectations (layer names,
// each design's accordions) come from the seed's fixture and `sidebar()`, never restated here. A's entitlement row is
// read before the control and restored in `finally`.
//
// Story 5.2's review (2026-09-17) adds: the tag's Inter read as LOADED faces in the canvas document, not the requested
// stack (step 10); a press that does nothing else — focus, text selection and a middle click — and the sticky header's
// box in the fixed layer (step 11); On scroll → Static moving that box to the scrolling layer (step 12); a finger that
// moves being a scroll, and the touch context's own CSP zero (step 14).
//
// Story 5.8 adds steps 61-70 and INVERTS four older ones. Steps 12, 26 and 39 used to assert that a reload threw
// the session away; since this story it keeps it, so each now asserts what survives AND drops this user's IndexedDB
// database to take the same reading again — the control, and the reset that lets every later step meet the seed
// unchanged. Step 30's "nothing is persisted" became "one gesture is one undoable edit" (AD-16), because what reaches
// the SERVER is now steps 66-68's subject and the 3-minute timer can fire at any point of a walk this long.
// Story 5.3 adds steps 16–26 — typing and moving between fields, P0-1's toolbar and its keys, a narrowed field, links,
// AD-36's paste vectors, line breaks, a submit button's label, R-122's lock pill, the Esc ladder, the toolbar hiding
// while the canvas scrolls, and the panel's own rich field, its token row, catalog words and the theme's own words — all inside step 5's CSP session; step 8's axe runs twice more, with the toolbar showing and
// with the link panel open; step 14 gains a tap into a text prop; and step 13 presses the section's top padding, because a
// press on its words is now the start of editing. Its review adds step 27: R-123's press on nothing, in each of its three grounds.
// Story 5.4 adds steps 28–39, all inside step 5's CSP session so its zero covers them: B7's two groups and their DERIVED
// counts (the canvases `lib/editor.ts` opens, and the page group's own rows — never a number written here), a press on a
// row, D8e's four states with the ring on the ROW, Hide/Show from the ⋯ menu and `Space` (R-126), `⌥`-arrows with the announce read from `#editor-said`, the
// drag proving nothing reorders until the drop, the `⋯` menu and the rename dialog, the two kinds of singleton (no
// Duplicate on a site-wide row, and one confirm for both its Delete and its Hide, reached from the row AND the pill),
// S4b's pill measured against the section's corner and against R-119's Pro tag (R-125), the pointer crossing onto the
// pill keeping the hover, the pill hiding from the first scroll, R-124's Member visibility at the head of Section
// Settings, hiding and then removing every page section, and a reload KEEPING the session and its history (5.8). Step 8's axe runs
// once more with the pill showing and a row's menu open. Every Layers row is found by `[data-layer-row]`, which is
// `{doc}:{instanceId}`.
// Story 5.5 adds steps 40-45, inside step 5's session: D5b's switcher read row by row (order, R-130's THREE marks each
// with its own word, the check on the current canvas, the Membership group collapsing and opening under its chevron,
// and R-128's two ABSENT rows); the
// editor's FIRST SOFT NAVIGATION, proved by a stamp on the editor window AND one on the canvas document surviving the
// change of canvas, with the selection and the Controls panel cleared (DW-176's close); the synthesized stack against
// what the library can actually place, DERIVED; a membership canvas opening empty and unmarked; AD-22's whole round
// trip — materialise on a rename, back to untouched when the last section goes, unchanged when every one is merely
// hidden; and the site-wide confirm's DERIVED template count. THE OWNER'S TEST (2026-09-18) moved two of these: R-130
// took the marker chip out of the top bar, so the marker has ONE place and step 2 now asserts the bar carries none on
// any canvas; and the Membership heading became a button, because it drew a chevron that did nothing.
// Step 6 gains the three membership segments (200) and
// keeps `index` and `private` at 404, and its Back walk is now a SOFT-navigation walk. Step 38's second half changed
// with the story: emptying Home now returns it to its Synthesis Default stack rather than to nothing.
// Story 5.6 adds steps 46-53, inside step 5's session: S4a's sun measured at its drawn size and place with R-132's
// accessible name; the flip painting the canvas dark from `data-mode` alone with EVERY SECTION ROOT THE SAME NODE (no
// repaint) and the selection, the scroll and the announcement with it; a dark Background-role change moving that root
// in dark only, with the moon and its words on the row and the light canvas untouched; a control that is not
// mode-scoped being one value for both; reset in each mode (the override forgotten in dark, the light value forgotten
// and the override KEPT in light); R-133's two entry points opening the ONE confirm in the document, the `⋯` item
// absent on a section with no override and the panel row saying so instead; and FR-D7's Light-only half against the
// STORED docs — an override planted through the service key (the editor's own write goes through 5.8's journal, so a planted row is how a STORED override is reached), the sun
// ABSENT, the canvas light, the stored map byte-identical, and every override reapplying exactly on the way back.
// R-131's screen is read for D6a's two rows, D6b's greyed row with its reason, the DERIVED count, and the ABSENCE of
// every other row D6a draws; steps 2, 6 and 9 are unchanged, which is the control that the `(editor)` route-group
// move changed no URL and no status.
// Story 5.7 adds steps 54-60, inside step 5's session: S4a's device track measured at its drawn size, place and inks with
// R-136's names; each device's iframe as a REAL CSS VIEWPORT in both axes (`100vh` measured, a media query answering at
// that width) with the fit as a transform over it, R-137's card — device-sized, centred, a 6px radius on all four corners
// — and UX-DR17's chip; the ABSENCE of any zoom, fit or percentage control; a fold re-fitting without touching the true
// size or repainting; a device change repainting NOTHING (same nodes, same stamps, the selection, the chrome re-placed,
// the caret mid-word); R-123's ground beside a letterboxed phone; the arrows moving the device; and FR-D14's two clauses
// this story owns — no cap, and no main-thread task over 5s on a 40-section planted doc (NFR-1's fps gate is Story
// 5.23's, manual-only). STEP 2 CHANGED WITH R-137: the page card is no longer flush with the bottom at a top-only
// radius, it is Desktop's 1440 x 900 fitted, centred, rounded all round — the one change the owner is asked to expect.
// Story 5.9 adds steps 71-80, inside step 5's CSP session, and they are the journey `pnpm keyboard` runs over a
// harness mount (`tools/keyboard/journey.spec.mjs`, R-146) — here with a real session, a real read, the real canvas
// route and the real policy, because a harness proves the wiring and never the stack (R-82, NFR-6(d)): D8c's skip
// link measured at its drawn place, size, radius and corrected 2px ring and gone again when it loses focus; the
// iframe's `tabindex="-1"` and the canvas as EXACTLY ONE stop between Layers and the Controls sidebar, with no link
// of the customer's own site in the order; `L`, `.` and `1` `2` `3` each calling the handler its own button calls,
// with the fold's focus move and the iframe's real width as the proof; ⌘D and Del on the SELECTION, FR-D5's
// site-wide section refusing the first and opening the one confirm on Cancel for the second; WCAG 2.1.4 with a REAL
// caret placed by a press — the state the harness cannot reach, because the canvas has no keyboard path into inline
// editing (FR-D1); the Esc ladder's three rungs with that same caret, each announcement read from `#editor-said`;
// R-147's card measured against `Editor Sidebar Kit.dc.html:274-280` and listing exactly the keys that work (R-145);
// every deferred key inert; `/harness/editor` and `/harness/canvas` 404 in production; and S3d's account-menu row
// opening the SAME card, row for row. Step 8's axe runs once more with the card open.
// Story 5.10 adds steps 81-85, inside the same session: S5a's picker measured where it is drawn (the 22px inset, the
// 240px rail on 16/12 with its right rule, R-154's `All sections` row over `CATEGORIES`, each count derived, `Find a section…` and its ⌘K chip, the
// meta line's one template, the 16px column gap) with R-150's `Free only` switch absent and R-151's ONE dark button;
// FR-D12's filter proved by opening the SAME picker on Home and on Post and reading two different rails, each count
// derived over its own canvas and nothing greyed; every card's preview a LIVE render in an `inert`, uniquely titled
// frame at Desktop width (R-137, NFR-1) — which is what keeps R-149 at one rule on one element; R-152's globe with its
// hover title and the same words in the card's accessible name, a second site-wide design REPLACING the first in one
// ⌘Z-able transaction, announced politely and with no sentence, toast or banner anywhere; and S4b's hairline and
// pressed "+ Add section" pill measured on a hovered gap, placing one section there and ⌘K refusing to open with a
// REAL caret in a canvas text prop, which is the story's most important line (`lib/inline.ts:230`). Step 8's axe runs
// once more with the picker open, asserting NO SECOND NODE EXCEPTION is needed.
// Story 5.13 adds step 89, inside the same session, and it opens with the MEASUREMENT because R-166 is a ruling about
// geometry: B9's pill at the canvas foot, dashed with its grey dot, at 24px, its box never intersecting the page
// card's at Desktop, Tablet OR Mobile, with R-139's 32px ground unmoved either side; R-118's absences on Home (no
// subject named, not a control, no menu at all); D5e opening upward with the style-guide entry first and ticked, its
// search taking focus and narrowing to exactly what `filterSubjects` answers with nothing fetched, and the has-image
// marker as WORDS on exactly the rows that carry one; FR-H8's structural claim BY HAND — one article's picture with
// its srcset, another's whole `<figure>` ABSENT; the choice surviving a reload as the `project_template_prefs` row it
// has been waiting for since day one; the Tag canvas rendering ITS OWN posts and no others, which it did not before
// this story; and a planted subject that no row holds rendering the fixture, saying so in `#editor-said` and in the
// menu, with the stored value KEPT. Every expectation is derived from `lib/preview-subject.ts` and the library's own
// `templateContext`, never restated here. It also carries the owner's finding of 2026-09-21, which belongs to EVERY
// menu in the app rather than to this one: a menu with its own scrolling list must not close when that list scrolls.
// Story 5.14 adds step 90, inside the same session, and CHANGES STEP 2: S4a's centred group is now Template AND View as,
// so it is the GROUP that is measured against the bar and not the switcher alone. Step 90 reads the trigger (R-170's
// one name, NO eye since R-171, 32px, no aria-label, "Anonymous" nowhere) and S4d's menu (the heading, exactly three rows and no
// tier or comped row, the current row highlighted and no tick since R-172, 260 wide and centred under the trigger); repaints as Paid,
// Free and back to the logged out user with Rail's actions and the Inline Row's slot read by their own classes and
// `#editor-said` announcing each; walks R-169's coral dots 2 → 1 → none on exactly the rows still to look at, each dot
// 8px in `coral-deep` with its word held for a screen reader, and NO marker in the bar; reads the
// `project_template_prefs.member_states_viewed` row back — the column's first writer — and a reload that brings no dot
// back; presses every printable key at the canvas and moves no visitor; sets the newsletter to Paid members, which is
// ONE EDIT that brings the dots back (R-167) and a section LEFT OUT for Free with the caption naming the visitor
// (R-168); switches to Post keeping the visitor and dotting Post's own record; and opens ⌘K under Paid to find the
// Inline Row's card signed in. The trigger is measured clear of the right-hand cluster at 1440 and 1280, and a project
// name at its limit clear of the group beside the widest canvas label (the name's `max-w` grew for View as). Every
// expectation is `apps/web/lib/view-as.ts`'s, never restated here; step 37's caption reads the same module. Step 8's
// axe runs once more with the menu open and its dots in it. R-171 (the owner, 2026-09-21) made the Template list look
// like View as's, so step 40 now reads each row's Tabler glyph, its one line (`lib/editor.ts`'s own words), the state
// mark TRAILING the name with its word heard and not printed, the current row highlighted (R-172), and the list scrolling inside
// its card; step 43 opens it on 404, its last row, and finds that row focused and scrolled into view; and step 90
// presses the canvas with each of the bar's menus open, which must close it (the owner's finding: the canvas is another
// document, and a popover's light dismiss never heard a press there). R-172, the same day: the row in force is highlighted
// with the coral tint and no row carries a tick, read in steps 40 and 90; and step 40 finds the popover itself never
// scrolling — the owner's "two scrollbars", whose second belonged to the popover. R-173, the same day: step 20's pasted
// link is read for the pack's link style — ink words and the accent underline, not the browser's blue.
// Story 5.15 adds step 91, inside step 5's session, because the editor now RUNS `core` against the canvas window on every
// paint (DW-136), and "code in the editor's realm acting on that window raises no violation" is reasoned until this walk
// executes it (standing rule 1): at rest every held-still mount at rest (no js-enabled) and no PAUSED chip; Rail and the
// Inline Row hovered and selected with no chip (R-175: both parts wait for a press — the chip's own look is the
// keyboard journey's, on controls fixture 1, since the shipped library holds no part that moves by itself); B3a's pill
// measured where it is drawn; Preview by the pill with the chrome hidden, the page 1:1 in the 1440 × 900 window, every
// mount running and B3b's bar measured; a hover, a click, a link, a submit and typing in Preview, none of which leaves
// the canvas; at Mobile the header's menu button only in Preview; and the way back by Back to editing, `Esc` and `P`.
// Step 5 gains its negative control — `eval` called from the editor on the canvas window must throw `EvalError` — and
// its sentence names the Preview session; step 4 compares with `core`'s `js-enabled` taken off both sides; step 8 scans
// Preview; steps 77 and 78 find `P` live and only `⌘⏎` owed; and step 90's key sweep leaves Preview after `p`.
// Story 5.16 adds step 92, inside step 5's session: PAGE 2. The seeded Home carries no main feed (it predates the flag),
// so the post grid is planted as one through the service key after the editor has gone, and every row is put back at
// the end. D5d's row measured on the main feed's panel and absent from every other; page 2 entered from it, an exact
// copy of page 1 under page 2's key with D5d's marker, rendered at index.hbs with page 2's context — its rows, "2 / 5"
// with both links, and a header told /page/2/, so Home carries no nav-current — all derived from `templateContext`;
// NOTHING stored; D5d's pill measured and never meeting the card or the chip at three devices in a 1440 and a 1280
// window; "Older posts" navigating nowhere; the first change on page 2 writing an `index` row while the `home` row stays
// byte-identical (R-178, read back from Supabase); a reload opening on page 1 with page 2's own design read back from the
// stored row; R-180's ask on the header, Cancel changing nothing and Change it everywhere changing the `site` row; the Tag
// canvas's page 2 being its tag's own last page and a change there writing `tag-paged`; and the Author canvas offering
// no row (R-176). Step 8 scans axe once more on page 2, with the pill showing.
// Story 5.16a weaves step 93 through step 92, because the offer IS a fact about the page on screen and the section's
// own stamp: on page 1 no field carries a `{}` button and the one that declares a token lists it alone; on page 2 that
// field lists BOTH and a field with none lists `{page_number}`; the site-wide header carries no button even there
// (R-187); Insert puts the code in and the canvas prints the page being painted; clicking into the words shows the
// token again and leaving shows the number; and page 1's words are untouched. Step 26's token row became the same
// menu — P0-1's chip row is withdrawn (R-185) and nothing is drawn under a field anywhere.
// Story 5.19 adds step 94, inside step 5's session: THE MAIN FEED AND P0·5's DATA GROUP, on the sample. The seeded Home
// predates the flag, so it opens with its post grid REPAIRED into the main feed and nothing stored (reading writes
// nothing, AD-22), and is stored repaired by the next edit. D5c's chip at rest (none), on a hovered feed beside the name
// tag and never over it, on a selected one and at the panel head; the main feed's greyed Count; a second Three Up placed
// SECONDARY — no chip, no pager — and walked through every Source with the canvas read against the app's own
// `sampleRows`/`rowsFor` over the runtime's `feedQuery`; Make this the main feed, Delete, Hide then Show, Duplicate, and
// the only feed deleted and hidden, each ONE gesture and ONE Undo; FR-H2's archive note on the Tag canvas and never on
// Home; Latest Post's Source alone and its one pick; and a CRAFTED stored value, planted through the service key, that
// the fold ignores and the canvas never prints. STEP 11 CHANGED WITH IT: the main feed's panel now carries D5c's Data
// group (its greyed Count), so the groups it is compared with are `sidebar()`'s with the role the editor hands it.
const { chromium, request: pwRequest } = require('@playwright/test')
const fs = require('node:fs')
const path = require('node:path')
const AXE = require.resolve('axe-core/axe.min.js')
const APP = process.env.APP_ORIGIN || 'https://app.inflozo.com'
const PREFIX = process.env.APP_PREFIX ?? ''
const LOCAL = Boolean(process.env.APP_ORIGIN)
for (const key of ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', ...(LOCAL ? [] : ['VERCEL_TOKEN', 'VERCEL_TEAM_ID'])]) {
  if (!process.env[key]) { console.error(`${key} is not set — read it from tools/probe/.env into this command's environment`); process.exit(2) }
}
const SB = process.env.SUPABASE_URL.replace(/\/$/, '')
const SECRET = process.env.SUPABASE_SECRET_KEY
const OUT = process.env.OUT_DIR || fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'editor-'))
const REPO = path.join(__dirname, '..', '..')
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
// Under the internal prefix a bare `/` is `/app` (Next 308s the trailing slash away)
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const at = (p) => `${APP}${PREFIX}${PREFIX && p === '/' ? '' : p}`

const results = []
let fails = 0
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; return ok }
const note = (name, detail) => results.push(`note  ${name} — ${detail}`)

const call = async (base, p, init = {}) => {
  const r = await fetch(`${SB}${base}${p}`, { ...init, headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) } })
  const text = await r.text()
  let body = {}
  try { body = text ? JSON.parse(text) : {} } catch {}
  return { status: r.status, body }
}
const admin = (p, init) => call('/auth/v1', p, init)
const users = async () => {
  const out = []
  for (let page = 1; ; page++) {
    const { status, body } = await admin(`/admin/users?page=${page}&per_page=200`)
    if (status !== 200) return null
    if (!body.users || body.users.length === 0) return out
    out.push(...body.users)
  }
}

async function main() {
  if (!LOCAL) {
    const { execSync } = require('node:child_process')
    const dirty = execSync('git status --porcelain -- packages apps tools/probe', { cwd: REPO, encoding: 'utf8' }).trim()
    if (dirty) throw new Error(`packages/, apps/ or tools/probe/ has uncommitted changes, so this checkout is not what ${APP} serves:\n${dirty}`)
    const head = execSync('git rev-parse HEAD', { cwd: REPO, encoding: 'utf8' }).trim()
    const answer = await fetch(`https://api.vercel.com/v13/deployments/${new URL(APP).host}?teamId=${process.env.VERCEL_TEAM_ID}`, { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } })
    const served = await answer.json().catch(() => ({}))
    if (!answer.ok) throw new Error(`Vercel answered ${answer.status} for ${new URL(APP).host}: ${served.error?.message ?? 'no message'}`)
    if (served.meta?.githubCommitSha !== head) throw new Error(`${APP} serves ${served.id ?? 'an unreadable deployment'}, built from ${served.meta?.githubCommitSha ?? 'no recorded commit'}, and this checkout is ${head}: push, wait for CI's deploy, then run this`)
    note('deployment', `${served.id} ${served.readyState}, built from ${head.slice(0, 8)} — this checkout's HEAD`)
  } else note('LOCAL RUN', `${APP}${PREFIX} — not a deployed result`)

  const { seed, TEMPLATES } = await import(require('node:url').pathToFileURL(path.join(__dirname, 'seed-editor-project.mjs')).href)
  // Story 5.14 — View as's pure module: every visitor, name and sentence steps 37 and 90 expect is its own, never restated
  const VA = await import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/view-as.ts')).href)
  const all = await users()
  if (all === null) throw new Error('user list unreadable — no control for the cleanup')
  const stale = all.filter((u) => /^editor-harness-[ab]-\d+@inflozo\.com$/.test(u.email || ''))
  for (const u of stale) await admin(`/admin/users/${u.id}`, { method: 'DELETE', body: '{}' })
  if (stale.length) note('swept stale fixtures', String(stale.length))
  const before = (await users()).length
  note('users before', String(before))

  const stamp = Date.now()
  const emailA = `editor-harness-a-${stamp}@inflozo.com`
  const emailB = `editor-harness-b-${stamp}@inflozo.com`
  const ids = []
  let browser = null
  let entitlementBack = null
  try {
    // ── step 1 — the fixtures ──
    for (const email of [emailA, emailB]) {
      const made = await admin('/admin/users', { method: 'POST', body: JSON.stringify({ email, email_confirm: true }) })
      check(`step 1 — account ${email.includes('-a-') ? 'A' : 'B'} created`, made.status === 200 && !!made.body.id, `HTTP ${made.status}`)
      ids.push(made.body.id)
    }
    const seeded = await seed({ email: emailA })
    check('step 1 — A seeded with "Pilot sections"', seeded.created === true, seeded.id)
    const again = await seed({ email: emailA })
    check('step 1 — a second seed writes nothing and names the same project', again.created === false && again.id === seeded.id)
    const tpl = await call('/rest/v1', `/project_templates?project_id=eq.${seeded.id}&select=template_key`)
    check('step 1 — three project_templates rows: site, home, post', tpl.body.map?.((r) => r.template_key).sort().join(',') === 'home,post,site', JSON.stringify(tpl.body))
    const bare = await call('/rest/v1', '/projects', { method: 'POST', body: JSON.stringify({ user_id: ids[1], name: 'Bare', slug: 'bare', style_pack: { preset: 'paper' } }) })
    const B = bare.body[0]?.id
    check('step 1 — B has one bare project', bare.status === 201 && UUID.test(B || ''), `HTTP ${bare.status}`)
    // without B's project the identical-404 check would compare `/projects/undefined`, a 404 for the wrong reason
    if (!UUID.test(B || '')) throw new Error('B has no project, so step 6 has no other-user control — stopping')
    const P = seeded.id
    // the expectations below are derived from the seed's fixture, never restated here
    const stackOf = (key) => [...TEMPLATES.site, ...TEMPLATES[key]]
    const magic = async (email) => {
      const link = await admin('/admin/generate_link', { method: 'POST', body: JSON.stringify({ type: 'magiclink', email }) })
      if (link.status !== 200 || !link.body.hashed_token) throw new Error(`generate_link answered HTTP ${link.status} — the session cannot start`)
      return at(`/auth/confirm?token_hash=${link.body.hashed_token}&type=magiclink`)
    }
    const editorUrl = (key) => at(key ? `/projects/${P}/${key}` : `/projects/${P}`)

    /* STORY 5.17 — HAND THE LOCK BACK BEFORE A CONTEXT GOES, or the next one opens as a READER.
     *
     * This walk runs five browser contexts on ONE project, each closed before the next opens — and since FR-D18 that
     * is five editing sessions of one person, which the lock exists to reduce to one. `context.close()` does not wait
     * for the release the editor sends on `pagehide`, and a lock whose tab merely CLOSED is still live for §AD4's
     * ~60 s, so the next context is a reader and every edit it makes is refused. That is the lock working exactly as
     * it should; what a real second device does is wait the window out or take over, and what this walk does instead
     * is release, which costs no time. Through the app's own route under the page's own session, because
     * `edit_locks` is invisible to the service key (MEASUREMENTS.md §50). */
    const handBack = (p) =>
      p.evaluate(async (url) => {
        const id = sessionStorage.getItem('inflozo-lock-session')
        if (!id) return
        await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ intent: 'release', session: id }) })
      }, `${PREFIX}/projects/${P}/lock`).catch(() => {})

    // The app's OWN modules, read from this checkout — every expectation below is derived from them and from the
    // seed's fixture, never restated here (standing rule 4). Read before step 2, because the top bar's shape is one
    // of them since Story 5.5.
    const [{ pilot, carriesMemberVisibility }, { sidebar, defaultContent, isSynthesizable, synthesize, designate, parseDoc }, { CANVASES, canvasesOf, isMembership, templateKeyOf }, LIB, DEVICE, PV] = await Promise.all([
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/pilots.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'packages/section-runtime/src/index.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/editor.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'packages/library/src/index.ts')).href),
      // Story 5.7's device table, its fit and the chip's words — read from the app's own module, so a size, a word or
      // a device added later joins this walk without an edit here (standing rule 4)
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/device.ts')).href),
      // Story 5.15's words for step 91 — read HERE with the rest, so a path or type-strip failure surfaces before the
      // throwaway accounts and the CSP session are spent (review)
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/preview.ts')).href),
    ])
    const DEVICE_DESKTOP = DEVICE.DESKTOP
    const LABELS = DEVICE.DEVICES.map((d) => d.label)

    browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] })
    // THE CSP CONTEXT: never bypassCSP. Every frame reports a violation to Node through a binding, so one survives the
    // navigations it spans.
    const recorder = async (ctx, into) => {
      await ctx.exposeBinding('__cspReport', ({ frame }, v) => into.push({ url: frame.url(), ...v }))
      await ctx.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (e) => window.__cspReport({ directive: e.violatedDirective, blocked: e.blockedURI, sample: e.sample, source: `${e.sourceFile}:${e.lineNumber}:${e.columnNumber}` }))
      })
    }
    const violations = []
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    // ATTACHED BEFORE THE FIRST PAGE, and never to be dropped again: Story 5.4's DW-183 retry commit deleted this line
    // by accident and its withdrawal did not restore it, so step 5's zero was vacuous and its control failed for two
    // runs while the retry took the blame (review, 2026-09-18). Without it `violations` has no writer.
    await recorder(context, violations)
    // R-188 (Story 5.16a): step 93 presses the placeholder menu's Copy and reads the tick it answers with.
    // Headless Chromium refuses `clipboard.writeText` without this, and the component is deliberately silent
    // when the clipboard refuses — so WITHOUT the grant the check would fail on a browser default rather than
    // on the product. Granting only adds a capability; nothing else in the walk reads the clipboard.
    await context.grantPermissions(['clipboard-write'], { origin: APP })
    const page = await context.newPage()
    page.on('pageerror', (e) => note('pageerror', String(e)))
    await page.goto(await magic(emailA), { waitUntil: 'load' })
    // ONE RETRY ON A NAVIGATION (Story 5.9's review): four runs in a row died on a 30s `page.goto` timeout, each at
    // a different line, while curl had the same URL in a quarter of a second. After the magic link, which is
    // single-use and must never be asked for twice.
    const steady = (p) => { const go = p.goto.bind(p); p.goto = (url, o) => go(url, o).catch(() => go(url, o)); return p }
    steady(page)
    check('step 1 — A signs in', !page.url().includes('/sign-in'), page.url())

    const openCard = async () => {
      await page.getByRole('link', { name: 'Pilot sections', exact: true }).click()
      await page.waitForURL((u) => u.pathname.endsWith(`/projects/${P}`), { timeout: 30000 })
      // on localhost the app's links carry no /app prefix (routing.ts), so a local run re-enters under it
      if (LOCAL && page.url() !== editorUrl()) await page.goto(editorUrl(), { waitUntil: 'load' })
    }
    const canvasFrame = () => {
      const f = page.frames().find((f) => f !== page.mainFrame() && /\/canvas$/.test(new URL(f.url()).pathname))
      if (!f) throw new Error(`no /canvas frame on ${page.url()} — frames: ${page.frames().map((f) => f.url()).join(', ')}`)
      return f
    }
    const painted = (key) => page.waitForFunction((k) => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.painted === k, key, { timeout: 30000 })

    /* STORY 5.8's ONE RESET, and the walk needs it in four places.
     *
     * Before this story a reload threw the session away, and two thirds of this file leans on that: step 33 wants the
     * seed's row ORDER, step 40 wants its names, step 53 wants its stored overrides. Since 5.8 a reload KEEPS what the
     * customer did — which is the story — so a walk that wants the seed has to say so, and this is how it says it:
     * drop this user's own IndexedDB database, then load. It is deliberately the CUSTOMER'S OWN door and not a
     * back door: nothing here writes the database, so a bug that stopped the editor reading it would be visible as
     * step 12, 26 and 39 failing rather than hidden by a fixture.
     *
     * Every caller is a place that follows edits and wants the seed. The three steps that assert the SURVIVING
     * document call it as their own control, one reading either side. */
    const dropLocal = () => page.evaluate((u) => new Promise((done) => {
      const req = indexedDB.deleteDatabase(`inflozo-doc-${u}`)
      req.onsuccess = req.onerror = req.onblocked = () => done(true)
    }), ids[0]).catch(() => null)
    /** LEAVE THE EDITOR AND LET ITS LAST FLUSH LAND (Story 5.8). Navigating away fires the editor's own tab-close
     *  flush — a `keepalive` POST of whatever it holds — so anything this walk PLANTS in the stored doc must be
     *  planted AFTER the editor has gone, or the departing page overwrites it a moment later. Executed: step 52's
     *  planted override vanished exactly this way. */
    const leaveEditor = async () => {
      await dropLocal()
      await page.goto('about:blank')
      await page.waitForTimeout(600)
    }
    /** The seed's rows, read ONCE before anything has edited them — what `freshLoad` puts back. */
    const SEED_DOCS = (await call('/rest/v1', `/project_templates?project_id=eq.${P}&select=template_key,doc`)).body ?? []
    const freshLoad = async (key) => {
      // THE SERVER HALF, and it is the half Story 5.8 made necessary: the editor now FLUSHES, so by the time a later
      // step asks for "the stored doc" the stored doc may legitimately be a previous step's typing. Both halves go
      // back — the seed's rows through the service key, and this user's own database — so a step that wants the seed
      // gets the seed however long the walk has been running and however often the 3-minute timer has fired.
      // `projects.revision` is NOT put back and cannot be (`guard_revision` is monotonic against every writer); with
      // no local record the hydrate takes the server's docs regardless, which is §AD1.1's third row.
      //
      // THE ORDER IS LOAD-BEARING, and getting it wrong cost a run. Leaving the editor fires ITS OWN tab-close flush
      // (`visibilitychange` → a `keepalive` POST), so a seed written before the page was left arrived FIRST and the
      // departing editor's own document overwrote it a moment later. So: drop the device copy, LEAVE THE EDITOR, let
      // that last flush land, and only then put the seed back.
      await leaveEditor()
      // WRITTEN AND THEN READ BACK, up to three times, rather than written after a sleep chosen by guess: the
      // departing editor's keepalive POST is a race this walk cannot see the end of, and a seed that lost it would
      // fail a later step for a reason that has nothing to do with the step.
      for (let attempt = 0; attempt < 3; attempt++) {
        await page.waitForTimeout(400)
        for (const row of SEED_DOCS) {
          await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.${encodeURIComponent(row.template_key)}`, { method: 'PATCH', body: JSON.stringify({ doc: row.doc }) })
        }
        const back = (await call('/rest/v1', `/project_templates?project_id=eq.${P}&select=template_key,doc`)).body ?? []
        const same = SEED_DOCS.every((row) => JSON.stringify(back.find((r) => r.template_key === row.template_key)?.doc) === JSON.stringify(row.doc))
        if (same) break
        if (attempt === 2) note('freshLoad', 'the seed could not be restored in three attempts — a later step may fail for that reason and not its own')
      }
      await page.goto(editorUrl(key), { waitUntil: 'load' })
      await painted(key ?? 'home')
    }

    // ── step 2 — Projects → the card → the editor ──
    await page.goto(at('/'), { waitUntil: 'load' })
    await openCard()
    await painted('home')
    check('step 2 — the card opens /projects/<id>', page.url() === editorUrl(), page.url())
    const status = (await context.request.get(editorUrl(), { maxRedirects: 0 })).status()
    check('step 2 — /projects/<id> answers 200', status === 200, `HTTP ${status}`)
    const shape = await page.evaluate(() => {
      const box = (el) => el && el.getBoundingClientRect()
      const css = (el) => el && getComputedStyle(el)
      const main = document.querySelector('main')
      const header = main?.querySelector('header')
      const layers = document.querySelector('aside[aria-label="Layers"]')
      const canvas = document.querySelector('section[aria-label="Canvas"]')
      const card = canvas?.firstElementChild
      const controls = document.querySelector('aside[aria-label="Page settings"]')
      const name = header?.querySelector('span')
      const pageLabel = controls?.querySelector('#editor-panel-name')
      return {
        mains: document.querySelectorAll('main').length,
        shellNav: document.querySelectorAll('nav[aria-label="Sections"]').length,
        menuButton: document.querySelectorAll('button[aria-label="Menu"], dialog[aria-label="Menu"]').length,
        back: header?.querySelector('a[aria-label="Back to dashboard"]')?.getAttribute('href'),
        // Story 5.5 — D5a's centred group: the switcher ALONE. R-130 removed the marker chip, so this must now be
        // false on EVERY canvas, untouched ones included — step 42 asserts that where it used to read two markers.
        switcher: header?.querySelector('#editor-template')?.textContent,
        switcherBox: box(header?.querySelector('#editor-template')),
        // Story 5.14 — S4a's centred GROUP is Template AND View as, and it is the group that is centred in the bar
        groupBox: box(header?.querySelector('#editor-centre')),
        groupHolds: [...(header?.querySelector('#editor-centre')?.querySelectorAll('#editor-template, #editor-view-as') ?? [])].map((b) => b.id),
        headerBox: box(header),
        marker: header?.querySelector('[data-auto-generated]') !== null,
        header: { h: box(header)?.height, rule: css(header)?.borderBottomWidth, bg: css(header)?.backgroundColor },
        name: { text: name?.textContent, size: css(name)?.fontSize, weight: css(name)?.fontWeight, family: css(name)?.fontFamily },
        layers: { w: box(layers)?.width, rule: css(layers)?.borderRightWidth, bg: css(layers)?.backgroundColor, title: layers?.textContent },
        ground: css(canvas)?.backgroundColor,
        card: card && { left: box(card).left - box(canvas).left, right: box(canvas).right - box(card).right, top: box(card).top - box(canvas).top, bottom: box(canvas).bottom - box(card).bottom, width: box(card).width, height: box(card).height, radius: css(card).borderRadius, shadow: css(card).boxShadow, pad: css(canvas).paddingTop, padBottom: css(canvas).paddingBottom },
        controls: { w: box(controls)?.width, rule: css(controls)?.borderLeftWidth, pad: css(controls)?.paddingTop, bg: css(controls)?.backgroundColor, label: pageLabel?.textContent, labelTop: box(pageLabel)?.top - box(controls)?.top, labelSize: css(pageLabel)?.fontSize, labelWeight: css(pageLabel)?.fontWeight, labelCase: css(pageLabel)?.textTransform },
        rows: [...(layers?.querySelectorAll('[data-layer-row]') ?? [])].map((r) => r.querySelector('button')?.textContent),
        // Story 5.4: every row is interactive — a name button and a ⋯ (R-126). `:scope >` only: each row also holds
        // its own ⋯ MENU, whose rows are buttons too (and whose popover keeps them out of the a11y tree until opened).
        rowControls: [...(layers?.querySelectorAll('[data-layer-row]') ?? [])].map((r) => r.querySelectorAll(':scope > button, :scope > span > button').length),
        rowGrips: [...(layers?.querySelectorAll('[data-layer-row]') ?? [])].filter((r) => r.querySelector('span[aria-hidden] svg')).length,
        buttonsInLayers: layers?.querySelectorAll('button').length,
        windowScrolls: document.documentElement.scrollHeight > innerHeight,
      }
    })
    check('step 2 — one <main>, and none of the dashboard\'s sidebar, phone bar or drawer', shape.mains === 1 && shape.shellNav === 0 && shape.menuButton === 0, JSON.stringify({ mains: shape.mains, nav: shape.shellNav, menu: shape.menuButton }))
    check('step 2 — the bar: 48px with its 1px rule on paper, the back link to /', shape.header.h === 48 && shape.header.rule === '1px' && shape.header.bg === 'rgb(247, 245, 242)' && shape.back === '/', JSON.stringify(shape.header) + ` back=${shape.back}`)
    // S4a (:33): the centred GROUP — Template, then View as — is what is centred in the bar, since Story 5.14 built the
    // group's second control; R-130 took D5a's marker CHIP out of it, and Home is designed on this project, so none
    check('step 2 — S4a\'s centred group holds D5b\'s "Template · Home" and then View as, the GROUP is centred in the bar, the switcher is 32px, and the bar carries no D5a marker chip (R-130)', shape.switcher === `Template${CANVASES.home.label}` && JSON.stringify(shape.groupHolds) === JSON.stringify(['editor-template', 'editor-view-as']) && !!shape.groupBox && !!shape.headerBox && Math.abs((shape.groupBox.left + shape.groupBox.right) / 2 - (shape.headerBox.left + shape.headerBox.right) / 2) < 2 && shape.switcherBox?.height === 32 && shape.marker === false, JSON.stringify({ switcher: shape.switcher, holds: shape.groupHolds, group: shape.groupBox, marker: shape.marker }))
    check('step 2 — the project name: 13px, 600, Inter', shape.name.text === 'Pilot sections' && shape.name.size === '13px' && shape.name.weight === '600' && /Inter/i.test(shape.name.family), JSON.stringify(shape.name))
    check('step 2 — Layers: 240px, right rule, paper, "THIS PAGE · HOME"', shape.layers.w === 240 && shape.layers.rule === '1px' && shape.layers.bg === 'rgb(247, 245, 242)' && /this page · home/i.test(shape.layers.title), JSON.stringify({ ...shape.layers, title: undefined }))
    check('step 2 — Layers lists the stack in canvas order', shape.rows.join(' | ') === stackOf('home').map(([, name]) => name).join(' | '), shape.rows.join(' | '))
    check('step 2 — R-126: every row carries a name button and a ⋯ and NOTHING else, plus a pointer-only grip that is no tab stop', shape.rowControls.length === stackOf('home').length && shape.rowControls.every((n) => n === 2) && shape.rowGrips === shape.rowControls.length, `${JSON.stringify(shape.rowControls)} · grips ${shape.rowGrips} · buttons ${shape.buttonsInLayers}`)
    check('step 2 — the canvas ground #EDEAE6', shape.ground === 'rgb(237, 234, 230)', shape.ground)
    const c = shape.card
    // R-137 (owner, 2026-09-19, Story 5.7): the card is DESKTOP'S 1440 x 900 FITTED, centred in the ground with a 6px
    // radius on all four corners — not `height:100%` standing on the bottom of the window. Its ground, ink, shadow and
    // radius are S4a's still. Every number below is DERIVED from the device rather than written down: the two axes
    // carry the same fit, and the card is centred in the room below the stage's padding (32px top since R-138, the same at the bottom since R-139).
    const fitW = c && c.width / DEVICE_DESKTOP.width
    check('step 2 — R-137: the page card is Desktop 1440 x 900 FITTED — one fit on both axes, 28 each side, a 6px radius on ALL FOUR corners, the page shadow', c && Math.abs(c.height / DEVICE_DESKTOP.height - fitW) < 0.002 && fitW > 0 && fitW <= 1 && c.left === 28 && c.right === 28 && c.radius === '6px' && /rgba\(28, 27, 26, 0\.1\) 0px 4px 16px/.test(c.shadow), `${JSON.stringify(c)} · fit ${fitW}`)
    check('step 2 — R-137: it is CENTRED in the ground, with ground below it — the card no longer stands on the bottom of the window', c && c.bottom > 0 && Math.abs((c.top - parseFloat(c.pad)) - (c.bottom - parseFloat(c.padBottom))) < 1.5, JSON.stringify({ top: c?.top, pad: c?.pad, bottom: c?.bottom, padBottom: c?.padBottom }))
    check('step 2 — S4a\'s 864 survives as the WIDTH the stage allows at 1440 (1440 - 240 - 280 - 56), so the fit is width-bound here', c && c.width === 864, String(c?.width))
    check('step 2 — Controls: 280px, left rule, 16px padding, paper, PAGE 13/600 uppercase at 16px from the top', shape.controls.w === 280 && shape.controls.rule === '1px' && shape.controls.pad === '16px' && shape.controls.bg === 'rgb(247, 245, 242)' && shape.controls.label === 'Page' && shape.controls.labelSize === '13px' && shape.controls.labelWeight === '600' && shape.controls.labelCase === 'uppercase' && Math.abs(shape.controls.labelTop - 16) < 2, JSON.stringify(shape.controls))
    // the mouse is where the card was clicked, over the canvas now, and a section painted under a resting pointer is
    // hovered (Story 5.2): move it onto Layers so "at rest" is at rest
    await page.mouse.move(120, 400)
    await page.waitForTimeout(250)
    // the roots are read BEFORE any screenshot: Playwright's screenshot leaves `style=""` on a focusable input (executed)
    /* STORY 5.15: `js-enabled` is `core`'s, set on a mount it RUNS and never authored. While designing the editor holds
       every module that is not edit-safe at rest (R-174) and `/pilots` draws the JavaScript-on look, so the class comes
       off BOTH sides — on every mount, so both sides' class attributes are serialised the same way — before they are
       compared. Step 91 reads the class where it means something. */
    const unclassed = () => [...document.querySelectorAll('#canvas > *')].map((e) => {
      const c = e.cloneNode(true)
      for (const el of [c, ...c.querySelectorAll('[data-module]')]) if (el.hasAttribute('data-module')) el.classList.remove('js-enabled')
      return c.outerHTML
    })
    const roots = async () => canvasFrame().evaluate(unclassed)
    const homeRoots = await roots()
    await page.screenshot({ path: `${OUT}/editor-home-1440x900.png` })

    // ── step 3 — rest, and its controls ──
    // Since R-120 the chrome stylesheet paints nothing (the outlines are drawn outside the frame), so its control is that
    // the document carries the file as it is in this checkout; the count's control is a planted attribute it must see.
    const chromeCss = fs.readFileSync(path.join(REPO, 'apps/web/lib/canvas-chrome.css'), 'utf8')
    const rest = await canvasFrame().evaluate(() => {
      const count = () => [...document.querySelectorAll('*')].filter((el) => [...el.attributes].some((a) => a.name.startsWith('data-inflozo-'))).length
      const marked = count()
      const root = document.querySelector('#canvas > *')
      root.setAttribute('data-inflozo-selected', '')
      const planted = count()
      root.removeAttribute('data-inflozo-selected')
      return { marked, planted, sheet: document.querySelector('style[data-order="4-editor"]')?.textContent ?? null }
    })
    check('step 3 — control: the canvas document carries this checkout\'s chrome stylesheet, and the count sees a planted data-inflozo-selected', rest.sheet === chromeCss && rest.planted === rest.marked + 1, JSON.stringify({ ...rest, sheet: rest.sheet === chromeCss ? 'equal' : rest.sheet }))
    check('step 3 — at rest, no element in the canvas document carries a data-inflozo-* attribute', rest.marked === 0, `${rest.marked} marked`)

    // ── step 4 — faithful: each root equals /pilots' render of the same design ──
    const diff = (a, b) => {
      if (a === b) return `${a.length} chars, equal`
      let i = 0
      while (a[i] === b[i]) i++
      return `${a.length} / ${b.length} chars, first difference at ${i}: editor …${a.slice(Math.max(0, i - 60), i + 60)}… /pilots …${b.slice(Math.max(0, i - 60), i + 60)}…`
    }
    const designName = (id) => JSON.parse(fs.readFileSync(path.join(REPO, 'packages/library/designs', id, 'design.json'), 'utf8')).name
    const editorRoots = { home: homeRoots }
    await page.goto(editorUrl('post'), { waitUntil: 'load' })
    await painted('post')
    editorRoots.post = await roots()
    await page.screenshot({ path: `${OUT}/editor-post-1440x900.png` })
    const pilotsPage = await context.newPage()
    await pilotsPage.goto(at('/pilots'), { waitUntil: 'load' })
    await pilotsPage.waitForFunction(() => !!document.querySelector('iframe[data-pilot]')?.contentDocument?.querySelector('#canvas > *'), null, { timeout: 30000 })
    const pilotsRoot = async (id) => {
      await pilotsPage.locator('#pilot [role="radio"]', { hasText: new RegExp(`^${designName(id)}$`) }).click()
      await pilotsPage.waitForFunction((want) => document.querySelector('iframe[data-pilot]')?.dataset.pilot === want, id)
      await pilotsPage.waitForTimeout(250)
      const f = pilotsPage.frames().find((x) => x !== pilotsPage.mainFrame())
      return f.evaluate(unclassed).then((all) => all[0])
    }
    /* STORY 5.18 — DW-230: THE PAGE'S OWN ADDRESS IS HANDED TO EVERY SECTION, and on the Post canvas that is the post's
       own path, where Ghost marks NO menu item current (`utils.js:61`, an exact match only). /pilots draws a site-wide
       design at `default.hbs`, whose address is `/`, so its header marks Home. That ONE class is DW-230's whole
       difference: it is taken off both sides for the comparison, and asserted on its own below — the editor's header
       on Post marks nothing, /pilots' marks Home — so the equality still covers every other byte. */
    const unmarked = (html) => html.replace(/ nav-current(?=["\s])/g, '')
    const currentIn = (html) => [...html.matchAll(/class="nav-([a-z0-9-]+)[^"]*\bnav-current\b/g)].map((m) => m[1])
    for (const [key, designs] of ['home', 'post'].map((k) => [k, stackOf(k).map(([id]) => id)])) {
      check(`step 4 — ${key}: one root per section, in stack order`, editorRoots[key].length === designs.length, `${editorRoots[key].length} roots`)
      for (const [n, id] of designs.entries()) {
        // /pilots draws each design at its first compileTarget; a1/1 → default.hbs, the others' first is this canvas
        const want = await pilotsRoot(id)
        const got = editorRoots[key][n] ?? ''
        const addressed = key !== 'home' && currentIn(want ?? '').length > 0
        check(`step 4 — ${key} · ${id} (${designName(id)}): outerHTML equals /pilots' at Desktop · Light · Signed out · Everyone · First, core's js-enabled taken off both${addressed ? ', nav-current aside (DW-230, below)' : ''}`,
          !!want && (addressed ? unmarked(got) === unmarked(want) : got === want), diff(addressed ? unmarked(got) : got, addressed ? unmarked(want ?? '') : want ?? ''))
        if (addressed) {
          check(`step 4 — DW-230: on the ${key} canvas the header marks NO menu item current, as Ghost marks none on a post's own address — where /pilots' header, drawn at \`/\`, marks ${currentIn(want).join(', ')}`,
            currentIn(got).length === 0, JSON.stringify({ editor: currentIn(got), pilots: currentIn(want) }))
        }
      }
    }
    await pilotsPage.close()
    if (violations.length) note('violations recorded while reading /pilots (not the acceptance session)', JSON.stringify(violations.splice(0)))

    // ── step 5 — CSP ──
    for (const [label, url] of [['/projects/<id>', editorUrl()], ['/canvas', at('/canvas')]]) {
      const r = await context.request.get(url, { maxRedirects: 0 })
      const csp = r.headers()['content-security-policy'] || ''
      check(`step 5 — ${label}: the app nonce policy, frame-ancestors 'self', no 'unsafe-eval'`, r.status() === 200 && /'nonce-[^']+'/.test(csp) && /'strict-dynamic'/.test(csp) && /frame-ancestors 'self'/.test(csp) && !/unsafe-eval/.test(csp) && r.headers()['x-inflozo-policy'] === 'app-nonce', `HTTP ${r.status()} · ${r.headers()['x-inflozo-policy']} · ${csp}`)
    }
    // the acceptance session: open, fold and restore both panels, open /post, Back
    violations.splice(0)
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    const cardWidth = () => page.evaluate(() => document.querySelector('section[aria-label="Canvas"]').firstElementChild.getBoundingClientRect().width)
    const iframeScale = () => page.evaluate(() => document.querySelector('section[aria-label="Canvas"] iframe').style.transform)
    for (const [panel, collapse, show] of [['Layers', 'Collapse layers', 'Show layers'], ['Controls', 'Collapse controls', 'Show controls']]) {
      const [w0, s0] = [await cardWidth(), await iframeScale()]
      await page.getByRole('button', { name: collapse }).click()
      await page.waitForTimeout(300)
      const folded = await page.evaluate((label) => {
        const rail = document.activeElement
        return { focus: rail?.getAttribute('aria-label'), railWidth: rail?.parentElement.getBoundingClientRect().width, buttons: rail?.parentElement.querySelectorAll('button').length }
      }, show)
      const [w1, s1] = [await cardWidth(), await iframeScale()]
      check(`step 5 — ${panel} folds to a 44px rail with one Show button, focus on it, the card widens and re-scales`, folded.focus === show && folded.railWidth === 44 && folded.buttons === 1 && w1 > w0 && s1 !== s0, `${JSON.stringify(folded)} · card ${w0} → ${w1} · ${s0} → ${s1}`)
      await page.getByRole('button', { name: show }).click()
      await page.waitForTimeout(300)
      const focus = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
      check(`step 5 — ${panel} restores, focus back on its collapse toggle, the card as it was`, focus === collapse && (await cardWidth()) === w0, `focus ${focus}`)
    }
    // a PLAIN goto: this line exists so the Back below lands on the editor, and `freshLoad` puts an about:blank
    // in the history between the two. Nothing has edited anything yet either, so the seed is already the stored doc.
    await page.goto(editorUrl('post'), { waitUntil: 'load' })
    await painted('post')
    await page.goBack({ waitUntil: 'load' })
    await painted('home')

    // ── steps 10–13 — Story 5.2's gestures, inside the CSP session ──
    // The counts are DERIVED (standing rule 4) and nothing here is written down. Story 5.5 changed what the card's
    // number MEANS: not every canvas, but every canvas that will actually ship — the synthesizable ones, plus any
    // other with a doc of its own. "Pilot sections" links no site (so no Private row) and has designed no membership
    // canvas, so that is its synthesizable canvases, computed the way `editor.tsx` computes it.
    const OFFERED = canvasesOf(false)
    const TEMPLATE_COUNT = OFFERED.filter((key) => isSynthesizable(CANVASES[key].file)).length
    /** The rows `synthesize` really produces for a canvas, against the library on disk — the harness's expectation for
     *  an untouched canvas, derived rather than listed so it follows Epics 9 and 10 (DW-191 closes itself here). */
    const heldBy = (id) => { try { return pilot(id) } catch { return undefined } }
    const autoStack = (key) => synthesize(CANVASES[key].file, heldBy).instances
    // Story 5.6 — the LIBRARY's mode-scoped control names, derived from the vocabulary rather than written here: the
    // engine keys on each control's own `darkOverride` declaration and never on the name `bg` (standing rule 4)
    const MODE_SCOPED = LIB.UNIVERSALS.filter((u) => u.darkOverride === true).map((u) => u.name)
    const homeStack = stackOf('home')
    const nth = (id) => homeStack.findIndex(([d]) => d === id)
    const [HEADER, HERO, GRID] = [nth(TEMPLATES.site[0][0]), nth('a4/13'), nth('a17/1')]
    const layerOf = (n) => homeStack[n][1]
    // Story 5.19 — the seed's Home as `read.ts` hands it out, through `designate`: its one post grid is the MAIN FEED (the
    // seed predates the flag, as the owner's Pilot sections do), and a main feed's panel carries D5c's Data group — its
    // Count, greyed at the project's page size — so its groups are `sidebar()`'s with the role the editor hands it
    const PER_PAGE = (await call('/rest/v1', `/projects?id=eq.${P}&select=posts_per_page`)).body?.[0]?.posts_per_page
    const MAIN_DESIGN = designate(parseDoc(SEED_DOCS.find((r) => r.template_key === 'home')?.doc, 'home'), CANVASES.home.file, heldBy).instances.find((i) => i.isMainFeed)?.designId
    if (typeof PER_PAGE !== 'number' || MAIN_DESIGN === undefined) throw new Error(`the seed's page size (${PER_PAGE}) or its main feed (${MAIN_DESIGN}) is unreadable — step 11 and step 94 have nothing to compare with`)
    const groupsOf = (id) => {
      const entry = pilot(id)
      const role = id === MAIN_DESIGN ? { ...entry, feed: { kind: 'main', postsPerPage: PER_PAGE } } : entry
      return sidebar(role, { content: defaultContent(entry.contentSchema), controls: {}, data: {}, darkOverrides: {} }).groups.map((g) => g.label)
    }
    /** S4c's category word under the panel's heading (Story 5.11), from the LIBRARY's own entry rather than a
     *  word written down here — the category a design belongs to is `assembleEntry`'s to say. */
    const categoryOfNth = (n) => pilot(homeStack[n][0]).categoryTitle
    // one root's rect on screen, the frame's scale, and its chrome as the canvas document computes it
    const onScreen = (n) => page.evaluate((n) => {
      const f = document.querySelector('section[aria-label="Canvas"] iframe')
      const fr = f.getBoundingClientRect()
      const s = fr.width / f.offsetWidth
      const root = f.contentDocument.querySelectorAll('#canvas > *')[n]
      const r = root.getBoundingClientRect()
      return { x: fr.left + r.left * s, y: fr.top + r.top * s, right: fr.left + r.right * s, bottom: fr.top + r.bottom * s, w: r.width * s, h: r.height * s, s, card: f.parentElement.getBoundingClientRect().toJSON(), hover: root.hasAttribute('data-inflozo-hover'), selected: root.hasAttribute('data-inflozo-selected') }
    }, n)
    const reveal = (n) => canvasFrame().evaluate((n) => document.querySelectorAll('#canvas > *')[n].scrollIntoView({ block: 'start' }), n)
    // the middle of the root's visible part, below the sticky header's reach
    const pointAt = async (n) => {
      const r = await onScreen(n)
      const top = Math.max(r.y, r.card.top)
      const bottom = Math.min(r.y + r.h, r.card.bottom)
      return { x: r.x + r.w / 2, y: n === HEADER ? r.y + Math.min(r.h, bottom - r.y) / 2 : top + (bottom - top) * 0.6 }
    }
    const hoverOn = async (n) => { await reveal(n); await page.waitForTimeout(150); const p = await pointAt(n); await page.mouse.move(p.x, p.y, { steps: 4 }); await page.waitForTimeout(250) }
    const clickOn = async (n) => { await reveal(n); await page.waitForTimeout(150); const p = await pointAt(n); await page.mouse.click(p.x, p.y); await page.waitForTimeout(250) }
    // Chrome lives in the canvas document since the owner's finding: the editor's elements portalled into the shadow
    // roots of `[data-inflozo-chrome]` hosts on its body. Each is found there and its rect mapped to the screen.
    const chromeNow = (selector) => page.evaluate((sel) => {
      const f = document.querySelector('section[aria-label="Canvas"] iframe')
      const doc = f?.contentDocument
      if (!doc) return null
      let el = null
      for (const host of doc.querySelectorAll('[data-inflozo-chrome]')) el ??= host.shadowRoot?.querySelector(sel) ?? null
      if (!el) return null
      const fr = f.getBoundingClientRect()
      const s = fr.width / f.offsetWidth
      const r = el.getBoundingClientRect()
      const c = doc.defaultView.getComputedStyle(el)
      return { left: fr.left + r.left * s, top: fr.top + r.top * s, right: fr.left + r.right * s, bottom: fr.top + r.bottom * s, card: f.parentElement.getBoundingClientRect().toJSON(), host: el.getRootNode().host.getAttribute('data-inflozo-chrome'), text: el.textContent, transform: c.textTransform, tag: el.tagName, pressable: !!el.closest('button, a, [role="button"]'), size: c.fontSize, weight: c.fontWeight, family: c.fontFamily, color: c.color, bg: c.backgroundColor, padding: c.padding, radius: c.borderRadius, events: c.pointerEvents, visibility: c.visibility, shadow: c.boxShadow, hidden: el.getAttribute('aria-hidden'), faces: [...doc.fonts].filter((f) => f.family.replace(/^"|"$/g, '').startsWith('inflozo-chrome ')).map((f) => `${f.family.replace(/^"|"$/g, '')}: ${f.status}`) }
    }, selector)
    const tagNow = async () => {
      const t = await chromeNow('[data-chrome="tag"]')
      return t && { ...t, x: t.left, y: t.top }
    }
    const badgeNow = () => chromeNow('[data-chrome="pro"] span')
    const rowsNow = () => page.evaluate(() => [...document.querySelectorAll('aside[aria-label="Layers"] [data-layer-row]')].map((r) => getComputedStyle(r).backgroundColor))
    const marked = () => canvasFrame().evaluate(() => [...document.querySelectorAll('*')].filter((el) => [...el.attributes].some((a) => a.name.startsWith('data-inflozo-'))).length)
    const controlsAside = () => page.locator('#editor-controls')
    // R-120's outline boxes. The width is read as PAINTED PIXELS, never from computed style — computed style said 1.5px
    // of an outline Chromium painted at 1 (2026-09-17). A device-scale screenshot strip starts at the box's left edge,
    // three quarters down its visible height (below the name tag); each pixel's coral coverage is read off the green
    // channel against the section's own ground 7px inside, summed, and divided by the device pixel ratio. Decoded in a
    // page of its own, outside the CSP session, so the decoder cannot add a violation to it.
    const decoder = await browser.newPage()
    const boxNow = (which) => chromeNow(`[data-chrome="${which}"]`)
    const paintedWidth = async (which) => {
      const b = await boxNow(which)
      if (!b) return null
      const top = Math.max(b.top, b.card.top)
      const bottom = Math.min(b.bottom, b.card.bottom)
      const clip = { x: Math.floor(b.left), y: Math.floor(top + (bottom - top) * 0.75), width: 8, height: 1 }
      const png = await page.screenshot({ scale: 'device', clip })
      return decoder.evaluate(async ({ b64, css }) => {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const g = c.getContext('2d')
        g.drawImage(img, 0, 0)
        const px = [...Array(img.width).keys()].map((x) => [...g.getImageData(x, 0, 1, 1).data.slice(0, 3)])
        const dpr = img.width / css
        const ground = px[px.length - 1]
        const cover = px.map((p) => Math.min(1, Math.max(0, (ground[1] - p[1]) / (ground[1] - 89))))
        return { width: cover.reduce((a, b) => a + b, 0) / dpr, dpr, first: `rgb(${px[0].join(', ')})`, ground: `rgb(${ground.join(', ')})`, readable: ground[1] - 89 > 100 }
      }, { b64: png.toString('base64'), css: clip.width })
    }
    const fits = (b, r) => !!b && Math.abs(b.left - r.x) <= 1 && Math.abs(b.top - r.y) <= 1 && Math.abs(b.right - r.right) <= 1 && Math.abs(b.bottom - r.bottom) <= 1
    let hoverControl = false
    const WASH = 'rgba(255, 89, 65, 0.4)'
    const TINT = 'rgb(255, 237, 232)'

    // ── step 10 — hover ──
    for (const [n, [id, name]] of homeStack.entries()) {
      await hoverOn(n)
      const r = await onScreen(n)
      const tag = await tagNow()
      const rows = await rowsNow()
      const box = await boxNow('hover')
      const line = await paintedWidth('hover')
      const oneLine = !!line && line.readable && line.first === 'rgb(255, 89, 65)' && Math.abs(line.width - 1) <= 0.1
      if (oneLine) hoverControl = true
      check(`step 10 — hover ${name}: the hover box covers the root's on-screen rect, all four edges within 1px, aria-hidden and never pressed`, r.hover && fits(box, r) && box.events === 'none' && box.hidden === 'true' && box.visibility === 'visible' && (await boxNow('selected')) === null, `${JSON.stringify(box)} · root ${JSON.stringify({ x: r.x, y: r.y, right: r.right, bottom: r.bottom })}`)
      check(`step 10 — hover ${name}: its line paints 1.00 ± 0.1px of coral (painted pixels — the control for step 11's 1.5)`, oneLine, JSON.stringify(line))
      check(`step 10 — hover ${name}: the tag reads the layer name in S4b's styles`, tag && tag.text === name && tag.size === '11px' && tag.weight === '600' && /Inter/i.test(tag.family) && tag.color === 'rgb(255, 255, 255)' && tag.bg === 'rgb(194, 56, 31)' && tag.padding === '3px 9px' && tag.radius === '0px 0px 6px' && tag.events === 'none' && tag.visibility === 'visible', JSON.stringify(tag))
      check(`step 10 — hover ${name}: the tag's top-left within 1px of the root's on screen`, tag && Math.abs(tag.x - r.x) <= 1 && Math.abs(tag.y - r.y) <= 1, `tag ${tag?.x},${tag?.y} · root ${r.x},${r.y}`)
      check(`step 10 — hover ${name}: its Layers row alone is washed`, rows[n] === WASH && rows.filter((b) => b === WASH).length === 1, rows.join(' | '))
      // for the owner's comparison with S4b
      if (id === 'a4/13') await page.screenshot({ path: `${OUT}/editor-hover-latest-post-1440x900.png` })
    }
    // computed `font-family` is the REQUESTED stack, true whether or not a face loaded: the faces are read instead. A
    // `… Fallback` family is `next/font`'s `local()` metric stand-in, which errors on a machine without that font.
    const inter = await tagNow()
    const shipped = (inter?.faces ?? []).filter((f) => !/ Fallback: /.test(f))
    check('step 10 — the tag\'s Inter is the editor\'s, added to the canvas document as `inflozo-chrome …` faces that have all loaded', !!inter && /^"inflozo-chrome Inter"/.test(inter.family) && shipped.length > 0 && shipped.every((f) => / loaded$/.test(f)), JSON.stringify({ family: inter?.family, faces: inter?.faces }))
    await page.mouse.move(120, 400) // over Layers, off the canvas
    await page.waitForTimeout(250)
    check('step 10 — leaving the canvas clears the mark, the hover box, the tag and the wash', (await marked()) === 0 && (await boxNow('hover')) === null && (await tagNow()) === null && !(await rowsNow()).includes(WASH))
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 0))

    // ── step 11 — select ──
    const hrefBefore = await canvasFrame().evaluate(() => location.href)
    const archive = canvasFrame().locator('#canvas > *').nth(HEADER).getByRole('link', { name: 'Archive', exact: true }).first()
    await archive.click()
    await page.waitForTimeout(300)
    const header = await onScreen(HEADER)
    check('step 11 — a click on the header\'s Archive link selects Header — Rail, and the canvas does not navigate', header.selected && (await canvasFrame().evaluate(() => location.href)) === hrefBefore, `selected ${header.selected} · ${await canvasFrame().evaluate(() => location.href)}`)
    // and does nothing else (the spec's Always line): `mousedown` prevented keeps focus on the canvas body and starts no
    // text selection; `auxclick` prevented keeps a middle click from opening the link in a page of its own
    const pressed = await canvasFrame().evaluate(() => ({ active: document.activeElement === null || document.activeElement === document.body, collapsed: document.getSelection().isCollapsed }))
    const opened = []
    const onPage = (p) => opened.push(p.url())
    context.on('page', onPage)
    await archive.click({ button: 'middle' })
    await page.waitForTimeout(500)
    context.off('page', onPage)
    check('step 11 — a press does nothing else: focus stays on the canvas body, no text is selected, and a middle click on Archive opens no page, navigates nowhere and keeps the selection', pressed.active && pressed.collapsed && opened.length === 0 && (await canvasFrame().evaluate(() => location.href)) === hrefBefore && (await onScreen(HEADER)).selected, JSON.stringify({ pressed, opened, href: await canvasFrame().evaluate(() => location.href) }))
    await page.mouse.move(120, 400)
    await page.waitForTimeout(200)
    const sel = await onScreen(HEADER)
    const selBox = await boxNow('selected')
    const selLine = await paintedWidth('selected')
    check('step 11 — the selected box covers the root\'s on-screen rect, all four edges within 1px, and the Layers row is coral tint', sel.selected && fits(selBox, sel) && selBox.events === 'none' && selBox.visibility === 'visible' && (await boxNow('hover')) === null && (await rowsNow())[HEADER] === TINT, `${JSON.stringify(selBox)} · root ${JSON.stringify({ x: sel.x, y: sel.y, right: sel.right, bottom: sel.bottom })} · row ${(await rowsNow())[HEADER]}`)
    check('step 11 — the selected line paints 1.50 ± 0.1px of coral, counted only because a hover line measured 1.00 first', hoverControl && !!selLine && selLine.readable && selLine.first === 'rgb(255, 89, 65)' && Math.abs(selLine.width - 1.5) <= 0.1, `control ${hoverControl} · ${JSON.stringify(selLine)}`)
    await hoverOn(HEADER)
    check('step 11 — hovering the selection keeps its 1.5px box alone, and shows the name tag', (await boxNow('hover')) === null && fits(await boxNow('selected'), await onScreen(HEADER)) && (await tagNow())?.text === layerOf(HEADER))
    await page.mouse.move(120, 400)
    await page.waitForTimeout(200)
    // the Prevents line of AD-21 (rect-tracked overlays break on sticky roots): the header is sticky, so scrolling the
    // canvas keeps its root on screen while the page moves, and the anchor loop must keep the box on it
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 700))
    await page.waitForTimeout(300)
    const stuck = [await onScreen(HEADER), await boxNow('selected'), await canvasFrame().evaluate((n) => getComputedStyle(document.querySelectorAll('#canvas > *')[n]).position, HEADER)]
    check('step 11 — scrolled 700px, the sticky header\'s selected box is still on its root\'s on-screen rect, drawn from the fixed layer', stuck[2] === 'sticky' && Math.abs(stuck[0].y - stuck[0].card.top) < 1 && fits(stuck[1], stuck[0]) && stuck[1]?.host === 'view', `${stuck[2]} · host ${stuck[1]?.host} · root ${JSON.stringify({ x: stuck[0].x, y: stuck[0].y, right: stuck[0].right, bottom: stuck[0].bottom })} · box ${JSON.stringify(stuck[1])}`)
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 0))
    await page.waitForTimeout(200)
    const panelOf = () => controlsAside().evaluate((a) => ({
      label: a.getAttribute('aria-label'),
      // STORY 5.11: the head is TWO elements — the instance's layer name, and S4c's CATEGORY WORD beneath it — so
      // each is read by its own name. `a.querySelector('span')` used to be the label and is now the wrapper round
      // both, which is an unstyled node whose textContent runs the two together ("Header - RailHeaders").
      head: a.querySelector('#editor-panel-name')?.textContent,
      category: a.querySelector('#editor-panel-category')?.textContent ?? null,
      headCase: a.querySelector('#editor-panel-name') && getComputedStyle(a.querySelector('#editor-panel-name')).textTransform,
      groups: [...a.querySelectorAll('button[aria-expanded][aria-controls$="-body"]')].map((b) => b.textContent.trim()),
      // the panel's foot is TWO controls since R-133 (Story 5.6): "Reset this design", then "Clear dark overrides"
      // directly under it, in the same shape — so the last two are read in order rather than only the last
      foot: [...a.querySelectorAll('button')].filter((b) => !b.closest('dialog')).map((b) => b.textContent.trim()).filter(Boolean).slice(-2).join(' · '),
      chip: a.textContent.includes('4 / 18'),
      empty: a.textContent.includes('Nothing selected'),
    }))
    const railPanel = await panelOf()
    check('step 11 — "Section settings", headed HEADER — RAIL with S4c\'s category word beneath it (Story 5.11), R-113\'s groups for the design in order, Reset this design and R-133\'s Clear dark overrides at the foot in that order, no "4 / 18"', railPanel.label === 'Section settings' && railPanel.head === layerOf(HEADER) && railPanel.category === categoryOfNth(HEADER) && railPanel.headCase === 'uppercase' && railPanel.groups.join(' · ') === groupsOf(homeStack[HEADER][0]).join(' · ') && railPanel.foot === 'Reset this design · Clear dark overrides' && !railPanel.chip && !railPanel.empty && (await page.getByText('4 / 18').count()) === 0, JSON.stringify(railPanel))
    await clickOn(GRID)
    const moved = [await onScreen(HEADER), await onScreen(GRID), await panelOf()]
    check('step 11 — clicking Three Up moves the selection and the panel, category word and all', !moved[0].selected && moved[1].selected && moved[2].head === layerOf(GRID) && moved[2].category === categoryOfNth(GRID) && moved[2].groups.join(' · ') === groupsOf(homeStack[GRID][0]).join(' · '), JSON.stringify(moved[2]))
    const entitlement = await call('/rest/v1', `/entitlements?user_id=eq.${ids[0]}&select=state`)
    const plan = entitlement.body?.[0]?.state ?? 'free'
    check('step 11 — control: account A reads as Free before the Pro badge is looked for', plan === 'free', JSON.stringify(entitlement.body))
    await clickOn(HERO)
    const hero = await onScreen(HERO)
    const badge = await badgeNow()
    await page.mouse.move(120, 400)
    await page.waitForTimeout(200)
    // for the owner's comparison with S4c and B10
    await page.screenshot({ path: `${OUT}/editor-selected-latest-post-free-1440x900.png` })
    check('step 11 — R-119: on Free, selected Latest Post shows the Kit\'s "✦ Pro" span on one line, 8px inside its top-right on screen, not pressable', hero.selected && badge && badge.tag === 'SPAN' && !badge.pressable && badge.visibility === 'visible' && badge.bottom - badge.top < 24 && Math.abs(hero.right - badge.right - 8) <= 1 && Math.abs(badge.top - hero.y - 8) <= 1, `${JSON.stringify(badge)} · root right ${hero.right} top ${hero.y}`)
    await clickOn(GRID)
    check('step 11 — R-119: Three Up (free) shows no badge', (await badgeNow()) === null)
    await clickOn(HERO)
    const shown = (await badgeNow()) !== null
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    check('step 11 — R-119: Esc takes the badge away with the selection', shown && (await badgeNow()) === null && !(await onScreen(HERO)).selected)
    entitlementBack = plan
    const pro = await call('/rest/v1', `/entitlements?user_id=eq.${ids[0]}`, { method: 'PATCH', body: JSON.stringify({ state: 'pro_active' }) })
    await freshLoad()
    await clickOn(HERO)
    check('step 11 — R-119 control: A set to pro_active through the service key, Latest Post selected shows no badge', (pro.status === 200 || pro.status === 204) && (await onScreen(HERO)).selected && (await badgeNow()) === null, `HTTP ${pro.status}`)
    const back = await call('/rest/v1', `/entitlements?user_id=eq.${ids[0]}`, { method: 'PATCH', body: JSON.stringify({ state: plan }) })
    if (back.status === 200 || back.status === 204) entitlementBack = null
    await freshLoad()

    // ── step 12 — edits ──
    const openGroup = async (title) => {
      const head = controlsAside().getByRole('button', { name: title, exact: true })
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click()
    }
    const attr = (n, name) => canvasFrame().evaluate(([n, name]) => document.querySelectorAll('#canvas > *')[n].getAttribute(name), [n, name])
    await clickOn(GRID)
    await canvasFrame().evaluate((n) => { window.__gridRoot = document.querySelectorAll('#canvas > *')[n] }, GRID)
    await openGroup('Layout')
    await controlsAside().getByRole('radiogroup', { name: 'Per row' }).getByRole('radio', { name: 'Two' }).click()
    await page.waitForTimeout(200)
    const stamped = await canvasFrame().evaluate((n) => { const r = document.querySelectorAll('#canvas > *')[n]; return { perRow: r.getAttribute('data-per-row'), same: r === window.__gridRoot, selected: r.hasAttribute('data-inflozo-selected') } }, GRID)
    check('step 12 — Three Up · Per row → Two stamps data-per-row="two" on the same root node, still selected', stamped.perRow === 'two' && stamped.same && stamped.selected, JSON.stringify(stamped))
    await clickOn(HERO)
    await openGroup('Content')
    const typed = 'Hello from the harness'
    await controlsAside().getByLabel('Headline', { exact: true }).fill(typed)
    await page.waitForTimeout(250)
    const headline = await canvasFrame().evaluate((n) => document.querySelectorAll('#canvas > *')[n].textContent, HERO)
    check('step 12 — Latest Post · Headline typed: the canvas headline follows, and the section stays selected', headline.includes(typed) && (await onScreen(HERO)).selected, headline.replace(/\s+/g, ' ').slice(0, 160))
    await clickOn(HEADER)
    await openGroup('Section Settings')
    await controlsAside().getByRole('radiogroup', { name: 'On scroll' }).getByRole('radio', { name: 'Static' }).click()
    await page.waitForTimeout(200)
    // the layer is chosen per render from the root's computed position (`pinned`), so the stamp moves the box
    const staticBox = await boxNow('selected')
    check('step 12 — site-wide: Header — Rail · On scroll → Static stamps data-on-scroll="static", and its selected box moves from the fixed layer to the scrolling one', (await attr(HEADER, 'data-on-scroll')) === 'static' && (await onScreen(HEADER)).selected && staticBox?.host === 'page' && fits(staticBox, await onScreen(HEADER)), `host ${staticBox?.host}`)
    await clickOn(GRID)
    const ask = controlsAside().locator('dialog')
    await controlsAside().getByRole('button', { name: 'Reset this design' }).click()
    await page.waitForTimeout(150)
    const dialogOpen = await ask.evaluate((d) => d.open)
    // ── step 13 (b) — Esc with the reset dialog open belongs to the dialog ──
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    check('step 13 — with the reset dialog open, Esc closes the dialog and keeps the selection', dialogOpen && !(await ask.evaluate((d) => d.open)) && (await onScreen(GRID)).selected && (await attr(GRID, 'data-per-row')) === 'two')
    await controlsAside().getByRole('button', { name: 'Reset this design' }).click()
    await ask.getByRole('button', { name: 'Reset design' }).click()
    await page.waitForTimeout(250)
    check('step 12 — Reset this design → Reset design restores data-per-row="three", still selected (DW-167\'s wiring, in the editor)', (await attr(GRID, 'data-per-row')) === 'three' && (await onScreen(GRID)).selected)

    // ── step 13 — Esc from the canvas, then rest ──
    // Story 5.3: on the section's TOP PADDING, not its words — a press on a text prop of the selected section starts editing,
    // and Esc would then end that rather than the selection
    await clickOn(GRID)
    const gridPad = await onScreen(GRID)
    await page.mouse.click(gridPad.x, gridPad.y + 6)
    await page.waitForTimeout(200)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    const rested = await panelOf()
    check('step 13 — Esc from the canvas deselects, and the panel shows PAGE over the empty state', rested.label === 'Page settings' && rested.head === 'Page' && rested.empty && (await controlsAside().getByText('Click any section on the canvas — its controls appear here.').count()) === 1, JSON.stringify(rested))
    await page.mouse.move(120, 400)
    await page.waitForTimeout(200)
    check('step 13 — after hovering, selecting and Esc, no element in the canvas document carries a data-inflozo-* attribute', (await marked()) === 0)

    // STORY 5.8 INVERTS THIS STEP, and the inversion IS the story. It used to read "a reload shows the STORED values":
    // nothing persisted a canvas edit, so a reload threw the session away. Since 5.8 every `commit()` is written to this
    // browser's IndexedDB, the hydrate keeps the local document while `projects.revision` still matches the local
    // `base_revision`, and the reload comes back to WHAT THE CUSTOMER DID. The control that this is a real assertion and
    // not a tautology is the SECOND half, below: with the local database dropped, the very same reload shows the stored
    // values again — the two readings differ, and the local store is what separates them.
    await page.reload({ waitUntil: 'load' })
    await painted('home')
    const survived = {
      perRow: await attr(GRID, 'data-per-row'), onScroll: await attr(HEADER, 'data-on-scroll'),
      typed: (await canvasFrame().evaluate((n) => document.querySelectorAll('#canvas > *')[n].textContent, HERO)).includes(typed),
    }
    // `data-per-row` is 'three' on BOTH readings, and deliberately so: the Reset above put it back, which is itself an
    // edit this journal holds. The two readings are separated by the HEADLINE and by `data-on-scroll`, which the stored
    // doc has never carried.
    check('step 12 — Story 5.8: a reload comes back to the LOCAL document — the typed words and the changed control are still there', survived.typed && survived.perRow === 'three' && survived.onScroll === 'static', JSON.stringify(survived))
    // AND THE SESSION IS RESET HERE, deliberately, so every step below meets the seed exactly as it did before this
    // story: drop this user's local database and reload. It is also the control above — the same navigation, the other
    // reading — and it is why steps 13 to 60 need no edit for 5.8.
    await freshLoad()
    check('step 12 — CONTROL: with the local database dropped, the same reload shows the STORED values again', (await attr(GRID, 'data-per-row')) === 'three' && (await attr(HEADER, 'data-on-scroll')) === 'shrink' && !(await canvasFrame().evaluate((n) => document.querySelectorAll('#canvas > *')[n].textContent, HERO)).includes(typed))

    // ── step 15 — the outlines stay on their section while the canvas scrolls (the owner's finding, 2026-09-17) ──
    // What he saw: scrolling, "the outline jumps out of sync and seems to move over nearby sections a bit". The canvas
    // scrolls on the compositor; chrome positioned from the main thread arrives a frame after the content it follows.
    // The instrument is pixels from the compositor's own frames (CDP screencast) during a synthetic scroll gesture:
    // blue markers placed IN the canvas document at the root's top and bottom edges scroll with the content, so they are
    // where the root is drawn in each frame, and the coral line nearest a marker edge is where its box was drawn. At rest
    // the two agree (the control); in sync means within 3px in every frame. The markers are the probe's, removed after.
    const screencast = await context.newCDPSession(page)
    const film = async (gesture) => {
      const shots = []
      const onFrame = (e) => { shots.push(e.data); screencast.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}) }
      screencast.on('Page.screencastFrame', onFrame)
      await screencast.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })
      await page.waitForTimeout(250)
      await gesture()
      await page.waitForTimeout(400)
      await screencast.send('Page.stopScreencast')
      screencast.off('Page.screencastFrame', onFrame)
      return shots
    }
    const MARK_X = 500 // frame px from the root's left: clear of the name tag (top-left) and the Pro badge (top-right)
    const markEdges = (n) => canvasFrame().evaluate(([n, x]) => {
      document.querySelectorAll('[data-probe-marker]').forEach((e) => e.remove())
      const r = document.querySelectorAll('#canvas > *')[n].getBoundingClientRect()
      for (const top of [r.top + scrollY, r.bottom + scrollY - 6]) {
        const m = document.createElement('div')
        m.setAttribute('data-probe-marker', '')
        m.style.cssText = `position:absolute;left:${r.left + x}px;top:${top}px;width:60px;height:6px;background:#0000ff;z-index:2147483646;pointer-events:none`
        document.body.append(m)
      }
    }, [n, MARK_X])
    const unmark = () => canvasFrame().evaluate(() => document.querySelectorAll('[data-probe-marker]').forEach((e) => e.remove()))
    // per frame, the smallest distance from a marker's outer edge to the nearest coral row in a column clear of it
    const drift = (shots, box) => decoder.evaluate(async ({ shots, box }) => {
      const out = []
      for (const b64 of shots) {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const k = img.width / box.viewport
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const g = c.getContext('2d')
        g.drawImage(img, 0, 0)
        const column = (x) => g.getImageData(Math.round(x * k), 0, 1, img.height).data
        const [A, B] = [column(box.markerX), column(box.lineX)]
        const blue = (y) => A[y * 4] < 40 && A[y * 4 + 1] < 40 && A[y * 4 + 2] > 200
        const coral = (y) => Math.abs(B[y * 4] - 255) < 14 && Math.abs(B[y * 4 + 1] - 89) < 20 && Math.abs(B[y * 4 + 2] - 65) < 20
        const from = Math.ceil(box.top * k) + 1
        const to = Math.floor(box.bottom * k) - 1
        // each marker is a run of blue rows; the top marker's upper edge is the root's top, the bottom marker's lower edge
        // its bottom, so a run is scored by whichever of its two edges has a coral row nearer
        const edges = []
        for (let y = from; y < to; y++) if (blue(y) && !blue(y - 1)) edges.push(y)
        for (let y = from; y < to; y++) if (!blue(y) && blue(y - 1)) edges.push(y)
        const corals = []
        for (let y = from; y < to; y++) if (coral(y)) corals.push(y)
        if (edges.length === 0) continue
        out.push(Math.min(...edges.map((e) => (corals.length ? Math.min(...corals.map((y) => Math.abs(y - e))) : 999) / k)))
      }
      return out
    }, { shots, box })
    const scrollCase = async (label, n) => {
      const r0 = await onScreen(n)
      // 40px above the CARD's bottom edge, never a fixed y: since R-137 the card is the device's size and ends well above
      // the window's 900, so the old 860 rested on the ground and hovered nothing (review, 2026-09-19)
      const pointerY = r0.card.bottom - 40
      const lineX = r0.card.left + 600
      const markerX = r0.card.left + (MARK_X + 30) * r0.s
      // the root's top edge starts low in the card, so it stays in view while the gesture scrolls the content up
      await canvasFrame().evaluate(([n, s, cardH]) => {
        const r = document.querySelectorAll('#canvas > *')[n].getBoundingClientRect()
        document.scrollingElement.scrollTo(0, r.top + scrollY - (cardH - 150) / s)
      }, [n, r0.s, r0.card.height])
      await page.waitForTimeout(300)
      await markEdges(n)
      await page.mouse.move(700, pointerY)
      await page.waitForTimeout(300)
      const box = { viewport: 1440, markerX, lineX, top: r0.card.top, bottom: r0.card.bottom }
      const still = await drift(await film(async () => {}), box)
      const moving = await drift(await film(() => screencast.send('Input.synthesizeScrollGesture', { x: 700, y: pointerY, yDistance: -500, speed: 1200, gestureSourceType: 'mouse' })), box)
      await unmark()
      const control = still.length > 0 && Math.max(...still) <= 3
      check(`step 15 — ${label}: control at rest, the line lies on the marker (≤ 3px)`, control, still.map((v) => v.toFixed(1)).join(' '))
      check(`step 15 — ${label}: while the canvas scrolls, the line stays on its section in every captured frame (≤ 3px)`, control && moving.length >= 5 && Math.max(...moving) <= 3, `${moving.length} frames · worst ${Math.max(0, ...moving).toFixed(1)}px · ${moving.map((v) => v.toFixed(0)).join(' ')}`)
    }
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 0))
    await page.waitForTimeout(200)
    // (b) static: Three Up selected, the pointer resting on it
    await clickOn(GRID)
    await scrollCase('Three Up selected', GRID)
    // (a) hover: nothing selected, the pointer held still on Three Up while the content moves under it
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await scrollCase('Three Up hovered, the pointer still', GRID)
    // (b) sticky: Header — Rail selected; stuck at the top, its box's top line must stay on the card's top edge
    await page.mouse.move(120, 400)
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 0))
    await page.waitForTimeout(200)
    await clickOn(HEADER)
    await page.mouse.move(700, 600)
    await page.waitForTimeout(200)
    const head = await onScreen(HEADER)
    const stuckShots = await film(() => screencast.send('Input.synthesizeScrollGesture', { x: 700, y: 600, yDistance: -500, speed: 1200, gestureSourceType: 'mouse' }))
    const stuckRows = await decoder.evaluate(async ({ shots, x, top }) => {
      const out = []
      for (const b64 of shots) {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const k = img.width / 1440
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const g = c.getContext('2d')
        g.drawImage(img, 0, 0)
        const d = g.getImageData(Math.round(x * k), Math.round(top * k), 1, Math.round(6 * k)).data
        out.push([...Array(d.length / 4).keys()].some((i) => Math.abs(d[i * 4] - 255) < 14 && Math.abs(d[i * 4 + 1] - 89) < 20))
      }
      return out
    }, { shots: stuckShots, x: head.card.left + 600, top: head.card.top })
    const scrolled = await canvasFrame().evaluate(() => scrollY)
    check('step 15 — Header — Rail selected (sticky): its box\'s top line is on the card\'s top edge in every captured frame of the scroll', scrolled > 100 && stuckRows.length >= 5 && stuckRows.every(Boolean), `scrolled ${scrolled} · ${stuckRows.length} frames · ${stuckRows.map((v) => (v ? 'y' : 'n')).join('')}`)
    await page.keyboard.press('Escape')
    await page.mouse.move(120, 400)
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 0))
    await page.waitForTimeout(200)

    // ── Story 5.3's inline editing steps, inside the CSP session ──
    // Every gesture is a real press or key on the deployed editor: the caret the browser places under the pointer, the
    // toolbar's own buttons, a paste event carrying AD-36's vectors, and the canvas scrolling under the wheel.
    await freshLoad()
    const NEWS = nth('a22/1')
    const TITLE = '.a17-1__title'
    const GRID_SUB = '.a17-1__sub'
    const HERO_SUB = '.a4-13__sub'
    const HEADLINE = '.a4-13__headline'
    // a word's on-screen rect inside one section, or the last character's when `word` is null — the canvas is scrolled to
    // it first, and every edge is mapped through the frame's own rect and the fit
    const textIn = (target, n, selector, word, reveal = true) => target.evaluate(([n, selector, word, reveal]) => {
      const f = document.querySelector('section[aria-label="Canvas"] iframe')
      const d = f.contentDocument
      const el = d.querySelectorAll('#canvas > *')[n].querySelector(selector)
      if (!el) return null
      if (reveal) el.scrollIntoView({ block: 'center' })
      const walk = d.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      const nodes = []
      while (walk.nextNode()) nodes.push(walk.currentNode)
      const range = d.createRange()
      if (word === null) {
        const last = nodes[nodes.length - 1]
        range.setStart(last, Math.max(0, last.data.length - 1))
        range.setEnd(last, last.data.length)
      } else if (word === 'first') {
        range.setStart(nodes[0], 0)
        range.setEnd(nodes[0], 1)
      } else {
        const holder = nodes.find((t) => t.data.includes(word))
        if (!holder) return null
        range.setStart(holder, holder.data.indexOf(word))
        range.setEnd(holder, holder.data.indexOf(word) + word.length)
      }
      const b = range.getBoundingClientRect()
      const fr = f.getBoundingClientRect()
      const s = fr.width / f.offsetWidth
      return {
        left: fr.left + b.left * s, right: fr.left + b.right * s, top: fr.top + b.top * s, bottom: fr.top + b.bottom * s,
        x: fr.left + (b.left + b.width / 2) * s, y: fr.top + (b.top + b.height / 2) * s,
        endX: fr.left + (b.right - 1) * s, startX: fr.left + (b.left + 1) * s,
      }
    }, [n, selector, word, reveal])
    const textAt = (n, selector, word, reveal) => textIn(page, n, selector, word, reveal)
    const caretInto = async (n, selector, where = null) => {
      const at = await textAt(n, selector, where)
      await page.mouse.click(where === 'first' ? at.startX : at.endX, at.y)
      await page.waitForTimeout(150)
      return at
    }
    const pickWord = async (n, selector, word) => {
      const at = await textAt(n, selector, word)
      await page.mouse.dblclick(at.x, at.y)
      await page.waitForTimeout(200)
      return at
    }
    const markupOf = (n, selector) => canvasFrame().evaluate(([n, selector]) => document.querySelectorAll('#canvas > *')[n].querySelector(selector)?.innerHTML ?? null, [n, selector])
    const wordsOf = (n, selector) => canvasFrame().evaluate(([n, selector]) => document.querySelectorAll('#canvas > *')[n].querySelector(selector)?.textContent ?? null, [n, selector])
    const editingNow = () => canvasFrame().evaluate(() => {
      const el = document.activeElement
      return { tag: el?.tagName ?? null, className: el?.className ?? null, editable: el?.isContentEditable === true, selected: document.getSelection()?.toString() ?? '', editables: document.querySelectorAll('[contenteditable]').length }
    })
    const bar = page.locator('[role="toolbar"][aria-label="Text formatting"]')
    const barNow = () => page.evaluate(() => {
      const el = document.querySelector('[role="toolbar"][aria-label="Text formatting"]')
      if (!el) return null
      const r = el.getBoundingClientRect()
      const c = getComputedStyle(el)
      return {
        left: r.left, right: r.right, top: r.top, bottom: r.bottom, visibility: c.visibility, radius: c.borderRadius, bg: c.backgroundColor, shadow: c.boxShadow, padding: c.padding,
        buttons: [...el.querySelectorAll('button')].map((b) => ({ name: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed'), disabled: b.getAttribute('aria-disabled'), w: b.getBoundingClientRect().width, family: getComputedStyle(b.firstElementChild ?? b).fontFamily })),
      }
    })
    const linkDialog = page.locator('#canvas-inline-link')

    // ── step 16 — typing, and moving between fields ──
    await clickOn(GRID)
    await openGroup('Content')
    await canvasFrame().evaluate((n) => {
      const root = document.querySelectorAll('#canvas > *')[n]
      window.__root = root
      window.__title = root.querySelector('.a17-1__title')
    }, GRID)
    await caretInto(GRID, TITLE)
    const caretIn = await editingNow()
    check('step 16 — a click inside the selected Three Up\'s title puts the caret in it and makes it editable, with the section still selected', caretIn.editable && /a17-1__title/.test(caretIn.className ?? '') && (await onScreen(GRID)).selected, JSON.stringify(caretIn))
    await page.keyboard.type(' and summer')
    await page.waitForTimeout(250)
    const typedTitle = await wordsOf(GRID, TITLE)
    const panelTitle = await controlsAside().getByLabel('Title', { exact: true }).innerText()
    check('step 16 — the canvas title takes what is typed, and the panel\'s Title field shows the same words', typedTitle.endsWith(' and summer') && panelTitle.endsWith(' and summer'), `${JSON.stringify(typedTitle)} · panel ${JSON.stringify(panelTitle)}`)
    await caretInto(GRID, GRID_SUB)
    await page.keyboard.type(' Two')
    await page.waitForTimeout(250)
    const movedFields = await canvasFrame().evaluate((n) => {
      const root = document.querySelectorAll('#canvas > *')[n]
      return { same: root === window.__root, sameTitle: root.querySelector('.a17-1__title') === window.__title, title: root.querySelector('.a17-1__title').textContent, sub: root.querySelector('.a17-1__sub').textContent, editing: document.activeElement?.className ?? '' }
    }, GRID)
    check('step 16 — a press into the sub moves the caret there and repaints nothing: the title keeps its words and both nodes are the ones the paint made', movedFields.same && movedFields.sameTitle && movedFields.title.endsWith(' and summer') && movedFields.sub.endsWith(' Two') && /a17-1__sub/.test(movedFields.editing), JSON.stringify(movedFields))
    const editedBox = await canvasFrame().evaluate(() => {
      const el = document.activeElement
      const c = getComputedStyle(el)
      return { mark: el.hasAttribute('data-inflozo-editing'), outline: c.outlineStyle, width: c.outlineWidth, bg: c.backgroundColor, shadow: c.boxShadow }
    })
    check('step 16 — the field being typed in wears the keyed editing mark and no browser focus ring', editedBox.mark && (editedBox.outline === 'none' || editedBox.width === '0px') && /rgba\(194, 56, 31/.test(`${editedBox.bg} ${editedBox.shadow}`), JSON.stringify(editedBox))
    check('step 16 — the canvas carries no data-inflozo-prop: the stamps were lifted off at the paint', (await canvasFrame().evaluate(() => document.querySelectorAll('[data-inflozo-prop], [data-inflozo-item], [data-inflozo-ghost]').length)) === 0)
    // review (2026-09-18): the pilots share prop names (`sub`), and a press on ANOTHER section's words — read while the
    // button is still down, before its click selects that section and the repaint repairs the page — must edit nothing
    const heroSubBefore = await wordsOf(HERO, HERO_SUB)
    const crossPoint = await textAt(HERO, HERO_SUB, 'about')
    await page.mouse.move(crossPoint.x, crossPoint.y)
    await page.mouse.down()
    await page.waitForTimeout(150)
    const held = await canvasFrame().evaluate(([n, selector]) => {
      const root = document.querySelectorAll('#canvas > *')[n]
      return { editablesInHero: root.querySelectorAll('[contenteditable]').length, sub: root.querySelector(selector).textContent }
    }, [HERO, HERO_SUB])
    await page.mouse.up()
    await page.waitForTimeout(300)
    check('step 16 — a press held on an unselected section\'s words edits nothing there: no caret, and its words are its own', held.editablesInHero === 0 && held.sub === heroSubBefore && (await onScreen(HERO)).selected, JSON.stringify({ held, heroSubBefore }))
    await clickOn(GRID)

    // ── step 17 — the toolbar ──
    await pickWord(GRID, TITLE, 'spring')
    const bar17 = await barNow()
    const spring = await textAt(GRID, TITLE, 'spring')
    check('step 17 — P0-1\'s bar: Bold, Italic, Underline, Link and Remove link in that order, Remove link disabled, on white with the 10px radius, the md shadow and 3px padding', bar17
      && bar17.buttons.map((b) => b.name).join(' · ') === 'Bold · Italic · Underline · Link · Remove link'
      && bar17.buttons[4].disabled === 'true' && bar17.buttons.every((b) => Math.round(b.w) === 30)
      && bar17.bg === 'rgb(255, 255, 255)' && bar17.radius === '10px' && bar17.padding === '3px'
      && /rgba\(28, 27, 26, 0\.08\) 0px 4px 16px/.test(bar17.shadow) && /Georgia/.test(bar17.buttons[0].family), JSON.stringify(bar17))
    check('step 17 — it is centred on the selection\'s on-screen rect within 1px, its bottom 8 ± 1px above it', bar17 && Math.abs((bar17.left + bar17.right) / 2 - (spring.left + spring.right) / 2) <= 1 && Math.abs(spring.top - bar17.bottom - 8) <= 1, `bar ${JSON.stringify({ left: bar17?.left, right: bar17?.right, bottom: bar17?.bottom })} · word ${JSON.stringify({ left: spring.left, right: spring.right, top: spring.top })}`)
    await bar.getByRole('button', { name: 'Bold', exact: true }).click()
    await page.waitForTimeout(200)
    const boldedTitle = await markupOf(GRID, TITLE)
    check('step 17 — Bold wraps the selected word and shows pressed', boldedTitle.includes('<strong>spring</strong>') && (await barNow()).buttons[0].pressed === 'true', boldedTitle)
    await bar.getByRole('button', { name: 'Bold', exact: true }).click()
    await page.waitForTimeout(200)
    check('step 17 — Bold again removes exactly that', !(await markupOf(GRID, TITLE)).includes('<strong>'), await markupOf(GRID, TITLE))
    await page.keyboard.press('ControlOrMeta+i')
    await page.waitForTimeout(200)
    check('step 17 — ⌘I over the selection wraps it in <em>', (await markupOf(GRID, TITLE)).includes('<em>spring</em>'), await markupOf(GRID, TITLE))
    await page.keyboard.press('Alt+F10')
    await page.waitForTimeout(150)
    const onBold = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    const onUnderline = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)
    check('step 17 — ⌥F10 focuses Bold, the arrows move to Underline and Enter applies it', onBold === 'Bold' && onUnderline === 'Underline' && (await markupOf(GRID, TITLE)).includes('<u>'), `${onBold} → ${onUnderline} · ${await markupOf(GRID, TITLE)}`)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    const backInText = await editingNow()
    check('step 17 — Escape in the toolbar returns to the text with the selection it acted on', backInText.editable && backInText.selected === 'spring', JSON.stringify(backInText))

    // ── step 18 — narrowed fields ──
    await clickOn(HERO)
    await pickWord(HERO, HERO_SUB, 'letter')
    const narrowed = await barNow()
    check('step 18 — Latest Post\'s sub permits links alone: the bar shows Link and Remove link, in that order, and nothing else', narrowed && narrowed.buttons.map((b) => b.name).join(' · ') === 'Link · Remove link', JSON.stringify(narrowed?.buttons))
    const headlineBefore = await markupOf(HERO, HEADLINE)
    await pickWord(HERO, HEADLINE, 'personal')
    await page.keyboard.press('ControlOrMeta+b')
    await page.waitForTimeout(200)
    check('step 18 — its headline permits no mark: no toolbar, and ⌘B changes nothing', (await barNow()) === null && (await markupOf(HERO, HEADLINE)) === headlineBefore, `${await markupOf(HERO, HEADLINE)}`)

    // ── step 19 — links ──
    await pickWord(HERO, HERO_SUB, 'letter')
    await bar.getByRole('button', { name: 'Link', exact: true }).click()
    await page.waitForTimeout(300)
    const linkOpen = await linkDialog.evaluate((el) => el.matches(':popover-open'))
    const searchFocused = await page.evaluate(() => document.activeElement?.id)
    check('step 19 — Link opens P0-1\'s popover at the selection, with its search focused', linkOpen && searchFocused === 'canvas-inline-q', `${linkOpen} · focus ${searchFocused}`)
    await page.keyboard.type('night')
    await page.waitForTimeout(250)
    await linkDialog.getByRole('button', { name: /night shift/ }).click()
    await linkDialog.getByRole('button', { name: 'Done', exact: true }).click()
    await page.waitForTimeout(300)
    const linkedSub = await markupOf(HERO, HERO_SUB)
    const hrefBeforeClick = await canvasFrame().evaluate(() => location.href)
    const anchor = await textAt(HERO, HERO_SUB, 'letter')
    await page.mouse.click(anchor.x, anchor.y)
    await page.waitForTimeout(250)
    check('step 19 — the words become one link carrying the chosen post, and a click on it navigates nowhere', /<a href="https:\/\/[^"]*the-night-shift-at-the-port-of-algeciras\/">letter<\/a>/.test(linkedSub) && (await canvasFrame().evaluate(() => location.href)) === hrefBeforeClick, linkedSub)
    await pickWord(HERO, HERO_SUB, 'small')
    await bar.getByRole('button', { name: 'Link', exact: true }).click()
    await page.waitForTimeout(300)
    await linkDialog.getByRole('button', { name: 'Sign up', exact: true }).click()
    await linkDialog.getByRole('button', { name: 'Done', exact: true }).click()
    await page.waitForTimeout(300)
    check('step 19 — a Portal action becomes the inert anchor the shim reads', (await markupOf(HERO, HERO_SUB)).includes('<a href="#" data-portal="signup">small</a>'), await markupOf(HERO, HERO_SUB))
    await caretInto(HERO, HERO_SUB, 'first')
    await page.keyboard.type('x')
    await page.waitForTimeout(250)
    const afterTyping = await markupOf(HERO, HERO_SUB)
    check('step 19 — typing at the start of the field leaves both link records whole', /the-night-shift-at-the-port-of-algeciras\/">letter<\/a>/.test(afterTyping) && afterTyping.includes('<a href="#" data-portal="signup">small</a>') && afterTyping.startsWith('x'), afterTyping)
    await pickWord(HERO, HERO_SUB, 'letter')
    const removeOn = (await barNow()).buttons.find((b) => b.name === 'Remove link')
    await bar.getByRole('button', { name: 'Remove link', exact: true }).click()
    await page.waitForTimeout(250)
    const unlinked = await markupOf(HERO, HERO_SUB)
    check('step 19 — a selection inside a link enables Remove link, which removes that anchor and keeps the words', removeOn.disabled !== 'true' && !unlinked.includes('the-night-shift') && unlinked.includes('letter') && unlinked.includes('data-portal="signup"'), unlinked)
    await pickWord(HERO, HERO_SUB, 'small')
    await bar.getByRole('button', { name: 'Link', exact: true }).click()
    await page.waitForTimeout(300)
    const filled = await linkDialog.evaluate((el) => [...el.querySelectorAll('button[aria-pressed="true"]')].map((b) => b.textContent.trim()))
    const reopenedQuery = await page.locator('#canvas-inline-q').inputValue()
    check('step 19 — Link on a selection touching a link opens the panel filled with that link\'s own record, and the last search cleared', filled.includes('Sign up') && reopenedQuery === '', `${JSON.stringify(filled)} · query ${JSON.stringify(reopenedQuery)}`)
    // Escape in the panel commits nothing and returns to the text with the selection intact (the matrix's "Add a link"
    // row; review, 2026-09-18)
    const beforeEsc = await markupOf(HERO, HERO_SUB)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    const afterEsc = await editingNow()
    check('step 19 — Escape in the link panel closes it, commits nothing and returns to the text with the selection intact', !(await linkDialog.evaluate((el) => el.matches(':popover-open'))) && (await markupOf(HERO, HERO_SUB)) === beforeEsc && afterEsc.editable && afterEsc.selected === 'small', JSON.stringify(afterEsc))
    await pickWord(HERO, HERO_SUB, 'small')
    await bar.getByRole('button', { name: 'Link', exact: true }).click()
    await page.waitForTimeout(300)
    const beforePress = await markupOf(HERO, HERO_SUB)
    const pressPoint = await textAt(HERO, HERO_SUB, 'about')
    await page.mouse.click(pressPoint.x, pressPoint.y)
    await page.waitForTimeout(300)
    check('step 19 — a press on the canvas closes the panel and commits nothing', !(await linkDialog.evaluate((el) => el.matches(':popover-open'))) && (await markupOf(HERO, HERO_SUB)) === beforePress, await markupOf(HERO, HERO_SUB))

    // ── step 20 — paste ──
    const PASTE = '<b>Bold</b> <i>it</i> <u>un</u> <a href="https://x.example/">ok</a> <a href="javascript:window.__pwned=1">bad</a><img src="/x" onerror="window.__pwned=2"><script>window.__pwned=3</scr' + 'ipt><span style="color:red">red</span>'
    const pasteInto = (html) => canvasFrame().evaluate((html) => {
      const el = document.activeElement
      const data = new DataTransfer()
      data.setData('text/html', html)
      data.setData('text/plain', 'plain')
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
    }, html)
    await clickOn(GRID)
    await caretInto(GRID, GRID_SUB)
    await page.keyboard.press('ControlOrMeta+a')
    await pasteInto(PASTE)
    await page.waitForTimeout(300)
    const pastedGrid = await markupOf(GRID, GRID_SUB)
    const pwned = [await page.evaluate(() => window.__pwned), await canvasFrame().evaluate(() => window.__pwned)]
    check('step 20 — a paste into a four-mark field keeps bold, italic, underline and the https link, and everything else as its text', pastedGrid === '<strong>Bold</strong> <em>it</em> <u>un</u> <a href="https://x.example/">ok</a> badred', pastedGrid)
    check('step 20 — no script ran and no image loaded, in either document', pwned.every((v) => v === undefined) && !/<img|<script|<span|style=|javascript:/.test(pastedGrid), JSON.stringify(pwned))
    // R-173: a plain link is drawn in the pack's link style from the deployed token block — Paper's light base ground is
    // ink words with the accent underline, never the browser's blue (the grounds and dark are the unit test's and the
    // harness sweep's; this proves the rule reaches the deployed canvas)
    const pastedLook = await canvasFrame().evaluate(([n, selector]) => {
      const root = document.querySelectorAll('#canvas > *')[n]
      const cs = getComputedStyle(root.querySelector(`${selector} a[href="https://x.example/"]`))
      const ground = (root.matches('[data-bg]') ? root : root.querySelector('[data-bg]'))?.getAttribute('data-bg')
      return { color: cs.color, line: cs.textDecorationLine, lineColor: cs.textDecorationColor, ground, mode: document.documentElement.getAttribute('data-mode') }
    }, [GRID, GRID_SUB])
    check('step 20 — the pasted link is ink words with the accent underline on the light base ground, not the browser\'s blue (R-173)', pastedLook.color === 'rgb(35, 32, 25)' && pastedLook.line === 'underline' && pastedLook.lineColor === 'rgb(217, 108, 63)', JSON.stringify(pastedLook))
    await clickOn(HERO)
    await caretInto(HERO, HERO_SUB)
    await page.keyboard.press('ControlOrMeta+a')
    await pasteInto(PASTE)
    await page.waitForTimeout(300)
    check('step 20 — into a field that permits links alone, only the link survives', (await markupOf(HERO, HERO_SUB)) === 'Bold it un <a href="https://x.example/">ok</a> badred', await markupOf(HERO, HERO_SUB))

    // ── step 21 — line breaks ──
    await clickOn(GRID)
    await openGroup('Content')
    await caretInto(GRID, GRID_SUB)
    await page.keyboard.press('Shift+Enter')
    await page.keyboard.type('Second line')
    await page.waitForTimeout(250)
    const broken = await markupOf(GRID, GRID_SUB)
    const panelSub = await controlsAside().getByLabel('Sub', { exact: true }).innerText()
    check('step 21 — Shift+Enter in a Text Area stores a line break and both the canvas and the panel show two lines', /<br>Second line/.test(broken) && panelSub.includes('\n'), `${broken} · panel ${JSON.stringify(panelSub)}`)
    // and Enter alone — `insertParagraph`, not `insertLineBreak` — is the same line break, never a paragraph (review, 2026-09-18)
    await page.keyboard.press('Enter')
    await page.keyboard.type('Third')
    await page.waitForTimeout(250)
    const brokenTwice = await markupOf(GRID, GRID_SUB)
    check('step 21 — Enter in a Text Area is the same line break, and no block element appears', /<br>Second line<br>Third/.test(brokenTwice) && !/<(p|div)\b/.test(brokenTwice), brokenTwice)
    await clickOn(HERO)
    const headlineWas = await markupOf(HERO, HEADLINE)
    await caretInto(HERO, HEADLINE)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)
    check('step 21 — Enter in a Text Field inserts nothing', (await markupOf(HERO, HEADLINE)) === headlineWas, await markupOf(HERO, HEADLINE))

    // ── step 22 — a button's label ──
    await clickOn(NEWS)
    await canvasFrame().evaluate(() => {
      window.__submitted = false
      document.addEventListener('submit', () => { window.__submitted = true }, true)
    })
    const hrefWas = await canvasFrame().evaluate(() => location.href)
    await caretInto(NEWS, '.a22-1__button')
    await page.keyboard.type('! now')
    await page.waitForTimeout(300)
    const buttonWords = await wordsOf(NEWS, '.a22-1__button')
    check('step 22 — a submit button\'s label takes the caret and the typing, spaces included, and nothing submits or navigates', buttonWords.trim() === 'Subscribe! now' && (await canvasFrame().evaluate(() => window.__submitted)) === false && (await canvasFrame().evaluate(() => location.href)) === hrefWas, JSON.stringify(buttonWords))

    // ── step 23 — Ghost's own words (R-122) ──
    await clickOn(HERO)
    const ghostWords = await textAt(HERO, '.a4-13__title', null)
    await page.mouse.click(ghostWords.x, ghostWords.y)
    await page.waitForTimeout(300)
    const pill = await chromeNow('[data-chrome="note"]')
    // P0-1 :138-147, through `place()`'s `above`: centred on its words within 1px, its bottom 8 ± 1px above them (review)
    const titleBox = await canvasFrame().evaluate((n) => {
      const r = document.querySelectorAll('#canvas > *')[n].querySelector('.a4-13__title').getBoundingClientRect()
      return { left: r.left, right: r.right, top: r.top }
    }, HERO)
    const frameBox = await page.evaluate(() => { const f = document.querySelector('section[aria-label="Canvas"] iframe'); const fr = f.getBoundingClientRect(); return { left: fr.left, top: fr.top, s: fr.width / f.offsetWidth } })
    const titleOnScreen = { left: frameBox.left + titleBox.left * frameBox.s, right: frameBox.left + titleBox.right * frameBox.s, top: frameBox.top + titleBox.top * frameBox.s }
    const pillPlaced = pill && Math.abs((pill.left + pill.right) / 2 - (titleOnScreen.left + titleOnScreen.right) / 2) <= 1 && Math.abs(titleOnScreen.top - pill.bottom - 8) <= 1
    check('step 23 — the pill sits centred over the title, its bottom 8px above the words', pillPlaced, `pill ${JSON.stringify(pill && { left: pill.left, right: pill.right, bottom: pill.bottom })} · title ${JSON.stringify(titleOnScreen)}`)
    const lockedTitle = await canvasFrame().evaluate((n) => {
      const el = document.querySelectorAll('#canvas > *')[n].querySelector('.a4-13__title')
      return { editable: el.isContentEditable, editables: document.querySelectorAll('[contenteditable]').length }
    }, HERO)
    check('step 23 — a click on the card\'s post title shows P0-1\'s pill naming the field, in a chrome host, and nothing becomes editable', pill && pill.text === 'Post title — set in Ghost' && !pill.pressable && pill.events === 'none' && !lockedTitle.editable && lockedTitle.editables === 0, `${JSON.stringify(pill)} · ${JSON.stringify(lockedTitle)}`)
    // the same click while another field is being typed in: that field ends and repaints, and the pill still shows
    // (review, 2026-09-18: the repaint used to arrive after the pill and take it away)
    await caretInto(HERO, HEADLINE)
    await page.keyboard.type('q')
    await page.waitForTimeout(200)
    // read again, never reused: `caretInto` reveals the headline, and in R-137's shorter card that scrolls the title (review)
    const ghostWordsNow = await textAt(HERO, '.a4-13__title', null)
    await page.mouse.click(ghostWordsNow.x, ghostWordsNow.y)
    await page.waitForTimeout(400)
    const pillAfterEditing = await chromeNow('[data-chrome="note"]')
    const editablesAfter = await canvasFrame().evaluate(() => document.querySelectorAll('[contenteditable]').length)
    check('step 23 — a click on a Ghost word while another field is being edited ends that field and still shows the pill', pillAfterEditing !== null && pillAfterEditing.text === 'Post title — set in Ghost' && editablesAfter === 0 && (await wordsOf(HERO, HEADLINE)).includes('q'), `${JSON.stringify(pillAfterEditing && pillAfterEditing.text)} · editables ${editablesAfter}`)
    // the owner's rule (2026-09-18): NOTHING Ghost fills is ever editable, and each names itself — not the hero's title alone
    for (const [n, selector, name] of [[HERO, '.a4-13__tag', 'Tag name'], [HERO, '.a4-13__date', 'Publish date'], [GRID, '.a17-1__post-title', 'Post title'], [GRID, '.a17-1__excerpt', 'Post excerpt']]) {
      if (!(await onScreen(n)).selected) await clickOn(n)
      const words = await textAt(n, selector, null)
      await page.mouse.click(words.x, words.y)
      await page.waitForTimeout(300)
      const shown = await chromeNow('[data-chrome="note"]')
      check(`step 23 — ${selector} is Ghost's: the pill names it and nothing becomes editable`, shown !== null && shown.text === `${name} — set in Ghost` && (await canvasFrame().evaluate(() => document.querySelectorAll('[contenteditable]').length)) === 0, `${JSON.stringify(shown && shown.text)}`)
    }
    await clickOn(HERO)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
    check('step 23 — Escape deselects and the pill goes with the selection', !(await onScreen(HERO)).selected && (await chromeNow('[data-chrome="note"]')) === null)

    // ── step 24 — Esc and focus ──
    await clickOn(GRID)
    await caretInto(GRID, TITLE)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
    const afterFirstEsc = await editingNow()
    check('step 24 — Esc while editing ends the editing and keeps the section selected', afterFirstEsc.editables === 0 && (await onScreen(GRID)).selected, JSON.stringify(afterFirstEsc))
    // at rest means at rest: the pointer off the canvas, so no root carries the hover mark and the chrome layer is gone
    await page.mouse.move(120, 400)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
    const rest53 = await canvasFrame().evaluate(() => ({
      marked: [...document.querySelectorAll('*')].filter((el) => [...el.attributes].some((a) => a.name.startsWith('data-inflozo-'))).length,
      editables: document.querySelectorAll('[contenteditable]').length,
    }))
    check('step 24 — the second Esc deselects, and the canvas document carries no data-inflozo-* attribute and no contenteditable', !(await onScreen(GRID)).selected && rest53.marked === 0 && rest53.editables === 0, JSON.stringify(rest53))
    await clickOn(GRID)
    await caretInto(GRID, TITLE)
    await openGroup('Layout')
    await page.waitForTimeout(250)
    check('step 24 — focus moving to the panel ends the editing and keeps the selection', (await canvasFrame().evaluate(() => document.querySelectorAll('[contenteditable]').length)) === 0 && (await onScreen(GRID)).selected)
    const gridPadding = await onScreen(GRID)
    await page.mouse.click(gridPadding.x, gridPadding.y + 6)
    await page.waitForTimeout(200)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
    check('step 24 — a press on the section\'s padding takes focus back to the canvas, so Esc deselects', !(await onScreen(GRID)).selected)

    // ── step 25 — the toolbar hides while the canvas scrolls ──
    await clickOn(GRID)
    await pickWord(GRID, TITLE, 'spring')
    const barPlaced = await barNow()
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(80)
    const whileScrolling = await barNow()
    await page.waitForTimeout(400)
    const afterScrolling = await barNow()
    const wordNow = await textAt(GRID, TITLE, 'spring', false)
    check('step 25 — the toolbar hides from the first scroll and returns centred on the selection\'s new rect within 1px', !!barPlaced && barPlaced.visibility === 'visible' && whileScrolling.visibility === 'hidden'
      && afterScrolling.visibility === 'visible' && Math.abs((afterScrolling.left + afterScrolling.right) / 2 - (wordNow.left + wordNow.right) / 2) <= 1 && Math.abs(wordNow.top - afterScrolling.bottom - 8) <= 1,
      `${JSON.stringify({ before: barPlaced?.visibility, during: whileScrolling?.visibility, after: afterScrolling?.visibility })} · bar ${afterScrolling?.left},${afterScrolling?.bottom} · word ${wordNow.left},${wordNow.top}`)
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    await page.mouse.move(120, 400)
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 0))
    await page.waitForTimeout(200)


    // ── step 26 — the panel's rich field, the token row, and the words that are nobody's to type ──
    await clickOn(GRID)
    await openGroup('Content')
    const noteWas = await markupOf(GRID, '.a17-1__note')
    await controlsAside().getByLabel('Note', { exact: true }).dblclick({ position: { x: 40, y: 14 } })
    await page.waitForTimeout(250)
    const panelBar = await barNow()
    await bar.getByRole('button', { name: 'Italic', exact: true }).click()
    await page.waitForTimeout(300)
    const noteNow = await markupOf(GRID, '.a17-1__note')
    check('step 26 — the panel\'s Text Area raises the same toolbar over the field, and Italic pressed there shows on the canvas', !!panelBar && !/<em>/.test(noteWas) && /<em>/.test(noteNow), `${JSON.stringify(panelBar && panelBar.buttons.map((b) => b.name))} · ${noteNow}`)
    // R-185 (Story 5.16a) withdrew P0-1's chip row: a field that offers nothing carries no {} button, and nothing
    // at all is drawn under a field any more. On the Post canvas there is no page 2, so nothing offers a page number.
    check('step 26 — R-185: a field that offers no placeholder has no {} button, and nothing is drawn under it',
      (await controlsAside().getByRole('button', { name: /^Placeholders for / }).count()) === 0 &&
      (await controlsAside().getByText('TOKENS THIS FIELD ACCEPTS').count()) === 0)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
    // Esc in the panel's field ends its session and hands focus back to the panel, and the section stays selected — the
    // controller's `keep` branch, the one path where Esc blurs a field (review, 2026-09-18)
    const panelEsc = await page.evaluate(() => ({ inField: document.activeElement?.getAttribute('role') === 'textbox', toolbar: document.querySelector('[role="toolbar"][aria-label="Text formatting"]') !== null }))
    check('step 26 — Escape in the panel\'s Text Area ends editing, leaves the field and keeps the section selected', !panelEsc.inField && !panelEsc.toolbar && (await onScreen(GRID)).selected, JSON.stringify(panelEsc))

    // R-185's MENU, on the one pilot field that declares a token of its own: the {} button beside its label, its
    // rows, and Insert putting the code in at the cursor — the behaviour P0-1's withdrawn chip row carried
    await clickOn(NEWS)
    await openGroup('Content')
    const proof = controlsAside().getByLabel('Social proof line', { exact: true })
    await proof.fill('Join readers')
    await proof.evaluate((el) => el.setSelectionRange(5, 5))
    await controlsAside().getByRole('button', { name: 'Placeholders for Social proof line', exact: true }).click()
    await page.waitForTimeout(300)
    const rows26 = await page.evaluate(() => {
      const card = [...document.querySelectorAll('[popover]')].find((el) => el.matches(':popover-open'))
      if (!card) return null
      return {
        heading: card.querySelector('p')?.textContent.trim() ?? null,
        // R-188: the actions are glyphs, so the NAME is `title` — and the description must not be cropped
        rows: [...card.querySelectorAll('li')].map((li) => ({
          code: li.querySelector('[data-code]')?.textContent.trim(),
          caption: li.querySelector('[data-caption]')?.textContent.trim(),
          actions: [...li.querySelectorAll('button')].map((b) => b.getAttribute('title')),
          words: [...li.querySelectorAll('button')].map((b) => b.textContent.trim()).join(''),
          clipped: (() => {
            const c = li.querySelector('[data-caption]')
            return c === null || c.scrollWidth > c.clientWidth || getComputedStyle(c).textOverflow === 'ellipsis'
          })(),
        })),
      }
    })
    await page.locator('[popover]:popover-open button[data-insert="members"]').click()
    await page.waitForTimeout(400)
    /* NO Escape here, and that is R-188 finding 3 rather than a tidy-up: Insert now closes the menu itself, so an
       Escape would reach the PAGE and deselect the section — which takes the settings panel away and leaves the
       next line reading a field that no longer exists. It did exactly that on the first run of this walk after the
       fix (step 26, `locator.inputValue` 30s timeout), and step 93's own copy of the sequence had already been
       corrected: two callers, one changed. */
    const menuAfterInsert26 = await page.locator('[popover]:popover-open').count()
    await page.waitForTimeout(250)
    const proofNow = await proof.inputValue()
    const underNow26 = await controlsAside().evaluate((el) => ({ caption: (el.textContent.match(/TOKENS THIS FIELD ACCEPTS/g) ?? []).length, braces: (el.textContent.match(/else in braces/gi) ?? []).length }))
    // the expectation is the library's own, never written here (standing rule 4)
    const want26 = LIB.placeholdersOffered(pilot(TEMPLATES.home[TEMPLATES.home.length - 1][0]).contentSchema.proofLine, { page: 1 })
      .map((t) => ({ code: `{${t}}`, caption: LIB.PLACEHOLDERS[t], actions: ['Copy', 'Insert'], words: '', clipped: false }))
    check('step 26 — R-185 · R-188: the {} button beside the label opens "Placeholders", each row the code over its WHOLE description with Copy and Insert as named glyphs, Insert puts the code in at the cursor AND closes the list — with NOTHING under the field',
      rows26 !== null && rows26.heading === 'Placeholders' && JSON.stringify(rows26.rows) === JSON.stringify(want26) &&
      menuAfterInsert26 === 0 &&
      proofNow === 'Join {members}readers' && (await wordsOf(NEWS, '.a22-1__proof')) === proofNow &&
      underNow26.caption === 0 && underNow26.braces === 0,
      `${JSON.stringify(proofNow)} · ${JSON.stringify({ rows26, want26, underNow26, menuAfterInsert26 })}`)

    // catalog words: an empty value keeps the catalog's words, and leaving without typing changes nothing
    await clickOn(HERO)
    await openGroup('Content')
    const catalogWas = await wordsOf(HERO, '.a4-13__action--primary')
    const fillOf = () => canvasFrame().evaluate((n) => {
      const el = document.querySelectorAll('#canvas > *')[n].querySelector('.a4-13__action--primary')
      const s = getComputedStyle(el)
      return { fill: s.backgroundColor, radius: s.borderRadius, editing: el.hasAttribute('data-inflozo-editing') }
    }, HERO)
    const fillWas = await fillOf()
    await caretInto(HERO, '.a4-13__action--primary')
    await page.waitForTimeout(200)
    const fillNow = await fillOf()
    // the editing haze is a ring on a button-styled link: its own fill and radius stay (review, 2026-09-18)
    check('step 26 — the editing haze leaves a button-styled link its own fill and radius', fillNow.editing && !fillWas.editing && fillNow.fill === fillWas.fill && fillNow.radius === fillWas.radius, `${JSON.stringify(fillWas)} → ${JSON.stringify(fillNow)}`)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    check('step 26 — a catalog-linked label left without typing keeps the catalog\'s words and an empty value', catalogWas === 'Subscribe' && (await wordsOf(HERO, '.a4-13__action--primary')) === 'Subscribe' && (await controlsAside().getByLabel('Primary action text', { exact: true }).inputValue()) === '', `${JSON.stringify(catalogWas)} · panel ${JSON.stringify(await controlsAside().getByLabel('Primary action text', { exact: true }).inputValue())}`)

    // the theme's own words (`data-t`) are the Translations surface's (Story 7.12): a click does nothing at all
    await clickOn(HEADER)
    const signIn = await textAt(HEADER, '.a1-1__signin', null)
    await page.mouse.click(signIn.x, signIn.y)
    await page.waitForTimeout(300)
    check('step 26 — a click on the theme\'s own words starts no editing and shows no pill', (await canvasFrame().evaluate(() => document.querySelectorAll('[contenteditable]').length)) === 0 && (await chromeNow('[data-chrome="note"]')) === null && (await onScreen(HEADER)).selected)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // STORY 5.8 INVERTS THIS STEP TOO, and step 12's note is its record: this used to read "a reload starts from the
    // stored docs", because nothing persisted a canvas edit. Since 5.8 the TYPING, THE MARKS AND THE LINK all come
    // back — which is FR-D9's whole promise, on Story 5.3's own gestures rather than on a control.
    await page.reload({ waitUntil: 'load' })
    await painted('home')
    const keptWords = { title: await wordsOf(GRID, TITLE), heroSub: await markupOf(HERO, HERO_SUB), button: await wordsOf(NEWS, '.a22-1__button') }
    check('step 26 — Story 5.8: a reload comes back to what was TYPED — the words, the marks and the link all survive', keptWords.title.includes(' and summer') && /<(strong|em|u|a|br)\b/.test(keptWords.heroSub) && keptWords.button.trim() !== 'Subscribe', JSON.stringify(keptWords))
    // …and the session is reset again, so every step below meets the seed exactly as it did before this story. The same
    // navigation with the local database gone is also the control: the two readings differ, and the local store is the
    // only thing between them.
    await freshLoad()
    const reloadedWords = { title: await wordsOf(GRID, TITLE), heroSub: await markupOf(HERO, HERO_SUB), button: await wordsOf(NEWS, '.a22-1__button') }
    check('step 26 — CONTROL: with the local database dropped, the same reload starts from the stored docs again', !reloadedWords.title.includes(' and summer') && !/<(strong|em|u|a|br)\b/.test(reloadedWords.heroSub) && reloadedWords.button.trim() === 'Subscribe', JSON.stringify(reloadedWords))

    // ── step 27 — a press on NOTHING deselects, as Esc does (R-123 and its amendment, owner, 2026-09-18) ──
    // Three grounds in two documents: the editor's own around the page card, the empty space below the Layers rows, and
    // the canvas's below the last section. The Controls panel, a Layers row and the top bar are not grounds.
    await freshLoad()
    await clickOn(GRID)
    const gutter = await page.evaluate(() => {
      const stage = document.querySelector('section[aria-label="Canvas"]')
      const s = stage.getBoundingClientRect()
      const card = stage.firstElementChild.getBoundingClientRect()
      return { x: (s.left + card.left) / 2, y: card.top + 80, room: card.left - s.left }
    })
    await page.mouse.click(gutter.x, gutter.y)
    await page.waitForTimeout(300)
    const afterGutter = await panelOf()
    check('step 27 — a press on the editor\'s ground beside the page card deselects, and the panel goes back to Page settings', gutter.room > 0 && !(await onScreen(GRID)).selected && afterGutter.label === 'Page settings' && afterGutter.empty, `${JSON.stringify(gutter)} · ${JSON.stringify(afterGutter.label)}`)
    // the panel, Layers and the top bar are not nothing: the selection survives them (EXPERIENCE § the focus model (2))
    await clickOn(GRID)
    await openGroup('Layout')
    await page.waitForTimeout(250)
    check('step 27 — a press in the panel is not a press on nothing: the section stays selected', (await onScreen(GRID)).selected && (await panelOf()).label === 'Section settings')
    // the Layers panel's own ground, below its rows (R-123 as amended, 2026-09-18) — and a row is not ground
    const layersGround = await page.evaluate(() => {
      // Story 5.4 re-anchored this: the list's last ELEMENT CHILD is no longer a row, so the ground is read from
      // the last ROW, exactly as `controls/layers.tsx` reads it
      const list = document.querySelector('#editor-layers [data-layers-list]')
      const r = list.getBoundingClientRect()
      const rows = [...list.querySelectorAll('[data-layer-row]')]
      const last = rows[rows.length - 1].getBoundingClientRect()
      const at = { x: r.left + r.width / 2, y: last.bottom + 40 }
      // what the re-anchoring is for: the list's last element child is the rename dialog, so neither it nor its rect
      // is the last ROW (R-126 retired B7's footed note; the dialog is what remains after it)
      const lastChildIsNotTheRows = !list.lastElementChild.contains(rows[rows.length - 1])
      return { rows: rows.length, lastChildIsNotTheRows, room: r.bottom - last.bottom, isGround: document.elementFromPoint(at.x, at.y) === list, at }
    })
    await page.mouse.click(layersGround.at.x, layersGround.at.y)
    await page.waitForTimeout(300)
    check('step 27 — a press on the empty space below the Layers rows deselects too, read from the last ROW and not the list\'s last child', layersGround.isGround && layersGround.lastChildIsNotTheRows && layersGround.room > 40 && !(await onScreen(GRID)).selected && (await panelOf()).label === 'Page settings', JSON.stringify(layersGround))
    await clickOn(GRID)
    // its OWN row: R-123's rule is that the press keeps the selection, and pressing another row would move it
    const layersRow = await page.evaluate((n) => {
      const r = document.querySelectorAll('#editor-layers [data-layer-row]')[n].getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }, GRID)
    await page.mouse.click(layersRow.x, layersRow.y)
    await page.waitForTimeout(250)
    check('step 27 — a press on a Layers row is not a press on nothing: the section stays selected', (await onScreen(GRID)).selected && (await panelOf()).label === 'Section settings')
    // nor is a group heading or B7's footed note: only the empty space BELOW THE ROWS lets the selection go
    // (B7's footed note was the second of these until R-126 removed it; step 28 asserts it is gone)
    for (const [what, starts] of [['a group heading', 'This page · ']]) {
      const at = await page.evaluate((s) => {
        const el = [...document.querySelectorAll('#editor-layers span')].find((n) => n.textContent.startsWith(s))
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      }, starts)
      await page.mouse.click(at.x, at.y)
      await page.waitForTimeout(250)
      check(`step 27 — a press on ${what} is not a press on nothing either: the section stays selected`, (await onScreen(GRID)).selected && (await panelOf()).label === 'Section settings', JSON.stringify(at))
    }
    // the canvas's own ground needs a canvas with ROOM below its last section. Until Story 5.5 that was `tag`, which
    // now opens on its Synthesis Default stack; a membership canvas is EMPTY BY CONSTRUCTION (never synthesized), so
    // the room below the site header is real there and stays real however the library grows.
    await freshLoad('custom-signup')
    await clickOn(0)
    const belowLast = await page.evaluate(() => {
      const f = document.querySelector('section[aria-label="Canvas"] iframe')
      const fr = f.getBoundingClientRect()
      const s = fr.width / f.offsetWidth
      const d = f.contentDocument
      const roots = [...d.querySelectorAll('#canvas > *')]
      const last = roots[roots.length - 1].getBoundingClientRect()
      const at = { x: last.left + last.width / 2, y: last.bottom + 80 }
      const under = d.elementFromPoint(at.x, at.y)
      return { sections: roots.length, under: under?.tagName ?? null, inSection: roots.some((r) => r.contains(under)), insideFrame: at.y * s < fr.height, screen: { x: fr.left + at.x * s, y: fr.top + at.y * s } }
    })
    await page.mouse.click(belowLast.screen.x, belowLast.screen.y)
    await page.waitForTimeout(300)
    check('step 27 — on the canvas, a press on the ground below the last section deselects it too', belowLast.insideFrame && !belowLast.inSection && !(await onScreen(0)).selected && (await panelOf()).label === 'Page settings', JSON.stringify(belowLast))

    // ── Story 5.4's steps, inside the CSP session ──────────────────────────────────────────────────────────────────
    // Layers as B7 draws it, every row's four states and keys, the two kinds of singleton, and S4b's pill.
    await freshLoad()

    // ── step 28 — B7 as R-126 amends it: two groups of one shape, a hairline between, both counts derived ──
    const layersShape = () => page.evaluate(() => {
      const aside = document.getElementById('editor-layers')
      const list = aside.querySelector('[data-layers-list]')
      const rows = [...list.querySelectorAll('[data-layer-row]')]
      const css = (el) => el && getComputedStyle(el)
      const headings = [...list.querySelectorAll('span')].map((x) => x.textContent.trim())
      // R-126: the site group is the page group's own shape, divided from it by a hairline and carrying no glyph
      const siteGroup = rows[0].parentElement.parentElement
      const groups = [...list.children].filter((c) => c.querySelector('[data-layer-row]'))
      // the owner's complaint was a WRAPPED heading, so its height is measured and not assumed: both groups draw the
      // same heading row now, so one line means the two are the same height
      const headRow = (g) => g.firstElementChild.getBoundingClientRect().height
      return {
        rows: rows.map((r) => ({ name: r.querySelector('button')?.textContent, key: r.getAttribute('data-layer-row'), tab: r.getAttribute('tabindex') })),
        inSite: rows.filter((r) => siteGroup.contains(r)).length,
        site: { divider: css(siteGroup).borderBottomWidth, bg: css(siteGroup).backgroundColor, shadow: css(siteGroup).boxShadow, glyphs: siteGroup.querySelectorAll('svg').length - siteGroup.querySelectorAll('[data-layer-row] svg').length },
        headings,
        groups: groups.length,
        headHeights: groups.map(headRow),
        noteGone: list.textContent.includes('changes it on all') === false,
        mono: [...list.querySelectorAll('span')].filter((x) => /mono/i.test(css(x).fontFamily)).map((x) => x.textContent.trim()),
      }
    })
    const B7 = await layersShape()
    check('step 28 — R-126: the Site-wide group is the page group\'s own shape — no card, no shadow, no glyph — divided from it by one hairline, and the site doc\'s rows are the ones in it', B7.inSite === TEMPLATES.site.length && B7.site.divider === '1px' && B7.site.bg === 'rgba(0, 0, 0, 0)' && B7.site.shadow === 'none' && B7.site.glyphs === 0 && B7.groups === 2, JSON.stringify(B7.site) + ` · inSite ${B7.inSite} · groups ${B7.groups}`)
    check('step 28 — R-126: the Site-wide heading and its template count sit on ONE line — the same height as the page group\'s heading, which never wrapped', B7.headHeights.length === 2 && Math.abs(B7.headHeights[0] - B7.headHeights[1]) <= 1 && B7.headHeights[0] < 28, JSON.stringify(B7.headHeights))
    check('step 28 — SITE-WIDE beside a derived template count on ONE line (R-126), then THIS PAGE · HOME beside its own row count', B7.headings.includes('Site-wide') && B7.headings.some((h) => /^This page · Home$/i.test(h)) && B7.mono.includes(`${TEMPLATE_COUNT} templates`) && B7.mono.includes(String(TEMPLATES.home.length)), JSON.stringify({ headings: B7.headings, mono: B7.mono }))
    check('step 28 — R-126: B7\'s footed note is gone, its count already carried by the Site-wide heading', B7.noteGone, JSON.stringify({ noteGone: B7.noteGone }))
    check('step 28 — roving tabindex: exactly one row is a tab stop', B7.rows.filter((r) => r.tab === '0').length === 1 && B7.rows.filter((r) => r.tab === '-1').length === B7.rows.length - 1, JSON.stringify(B7.rows.map((r) => r.tab)))

    // ── step 29 — a press on a row selects, and D8e's four states ──
    const rowAt = (n) => page.locator('#editor-layers [data-layer-row]').nth(n)
    const rowState = (n) => rowAt(n).evaluate((r) => ({
      bg: getComputedStyle(r).backgroundColor,
      shadow: getComputedStyle(r).boxShadow,
      words: getComputedStyle(r.querySelector('button')).color,
      weight: getComputedStyle(r.querySelector('button')).fontWeight,
      // R-126: the row's ONLY control is the ⋯; Hide/Show moved into its menu
      // `:scope >` only: the row also holds its ⋯ MENU, whose rows are buttons in the DOM whether or not it is open
      controls: [...r.querySelectorAll(':scope > button')].map((b) => b.getAttribute('aria-label') ?? b.textContent.trim()),
      size: getComputedStyle(r.querySelector('button')).fontSize,
    }))
    await page.keyboard.press('Escape')
    await rowAt(GRID).getByRole('button', { name: layerOf(GRID), exact: true }).click()
    await page.waitForTimeout(300)
    const pressed29 = [await onScreen(GRID), await panelOf(), await rowState(GRID)]
    check('step 29 — a press on a Layers row selects that section, coral-tints the row and heads the panel with its name (R-123: the press does not deselect)', pressed29[0].selected && pressed29[1].head === layerOf(GRID) && pressed29[2].bg === TINT && pressed29[2].weight === '600', JSON.stringify({ selected: pressed29[0].selected, head: pressed29[1].head, row: pressed29[2] }))
    // D8e: the ring is drawn ON THE ROW, over whichever state it is already in. It is `focus-visible`, so focus has
    // to ARRIVE BY KEYBOARD as it does in the owner's test (Tab, then the arrows): a programmatic `.focus()` whose
    // last user interaction was the press above draws no ring, and correctly so.
    await rowAt(GRID).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(150)
    const focusedSelected = await rowState(GRID)
    check('step 29 — D8e: a focused-and-selected row reads as both — the coral tint with the 2px ring on the ROW', focusedSelected.bg === TINT && /rgb\(194, 56, 31\) 0px 0px 0px 2px/.test(focusedSelected.shadow), JSON.stringify(focusedSelected))
    await hoverOn(HERO)
    const washed = await rowState(HERO)
    check('step 29 — D8e: a hovered section washes its row; R-126: the row carries the ⋯ and nothing else', washed.bg === WASH && washed.controls.join(' · ') === `${layerOf(HERO)} · More for ${layerOf(HERO)}`, JSON.stringify(washed))
    check('step 29 — R-126: the row\'s name is drawn at the smaller caption size, so it has the width to say itself', pressed29[2].size === '11px' && (await rowAt(GRID).locator('button').first().evaluate((b) => b.scrollWidth <= b.clientWidth)), `${pressed29[2].size} · ${JSON.stringify(washed.controls)}`)

    // ── step 30 — Hide from the ⋯ menu (R-126): the section leaves the canvas and the row stays ──
    const menuOf = async (n) => {
      await rowAt(n).getByRole('button', { name: `More for ${layerOf(n)}`, exact: true }).click()
      await page.waitForTimeout(250)
      return page.locator(`#layers-menu-${B7.rows[n].key.replace(':', '-')} button`).allInnerTexts()
    }
    const fromMenu = async (n, label) => {
      await rowAt(n).getByRole('button', { name: `More for ${layerOf(n)}`, exact: true }).click()
      await page.waitForTimeout(250)
      await page.getByRole('button', { name: label, exact: true }).click()
      await page.waitForTimeout(400)
    }
    const docNow = async () => (await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)).body?.[0]?.doc
    const rootCount = () => canvasFrame().evaluate(() => document.querySelectorAll('#canvas > *').length)
    const before30 = await rootCount()
    await fromMenu(GRID, 'Hide')
    const hidden30 = await rowState(GRID)
    check('step 30 — Hide from the ⋯ menu takes the section off the canvas; its row stays with ink-soft words (R-126: that, and the menu now saying Show, is what reads as hidden)', (await rootCount()) === before30 - 1 && (await page.locator('#editor-layers [data-layer-row]').count()) === B7.rows.length && hidden30.words === 'rgb(110, 106, 100)', JSON.stringify({ roots: await rootCount(), before: before30, row: hidden30 }))
    const menu30 = await menuOf(GRID)
    await page.keyboard.press('Escape')
    check('step 30 — a hidden row\'s menu leads with Show, not Hide', menu30[0] === 'Show', menu30.join(' · '))
    // STORY 5.8: "nothing is persisted" stopped being true here, and what replaced it is stronger — the hide is ONE
    // transaction in the journal, so ONE press of undo takes it back however many operations it cost (AD-16). What
    // reaches the SERVER is steps 66 to 68's subject and is no longer asserted from this step, because the 3-minute
    // timer can legitimately fire at any point of a walk this long.
    check('step 30 — AD-16: hiding a section is ONE undoable edit — the left arrow wakes and one press is all it takes', (await page.locator('#editor-undo').getAttribute('aria-disabled')) === null, await page.locator('#editor-undo').getAttribute('aria-disabled'))
    await fromMenu(GRID, 'Show')
    check('step 30 — Show brings the section back', (await rootCount()) === before30)
    // UX-DR10's keyboard path to the same toggle: `Space` on the ROW
    await rowAt(GRID).focus()
    await page.keyboard.press(' ')
    await page.waitForTimeout(400)
    const spaced30 = await rowState(GRID)
    check('step 30 — `Space` on a focused row still hides it (UX-DR10): R-126 took the eye off the row, and a KEY costs no width', (await rootCount()) === before30 - 1 && spaced30.words === 'rgb(110, 106, 100)', JSON.stringify({ roots: await rootCount(), before: before30, row: spaced30 }))
    await page.keyboard.press(' ')
    await page.waitForTimeout(400)
    check('step 30 — `Space` again brings it back, and the key never scrolled the panel', (await rootCount()) === before30 && (await page.evaluate(() => document.querySelector('#editor-layers [data-layers-list]').scrollTop)) === 0)

    // ── step 31 — ⌥↓ moves the section, focus follows, and the move is announced politely ──
    const pageNames = () => page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row]')].map((r) => r.querySelector('button').textContent))
    const canvasClasses = () => canvasFrame().evaluate(() => [...document.querySelectorAll('#canvas > *')].map((e) => e.className))
    const names31 = await pageNames()
    const classes31 = await canvasClasses()
    await rowAt(GRID).focus()
    await page.keyboard.down('Alt')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.up('Alt')
    await page.waitForTimeout(400)
    const moved31 = { names: await pageNames(), classes: await canvasClasses(), said: await page.locator('#editor-said').innerText(), focus: await page.evaluate(() => document.activeElement?.getAttribute('data-layer-row')) }
    const swapped = [...names31]
    swapped.splice(GRID, 2, names31[GRID + 1], names31[GRID])
    check('step 31 — ⌥↓ moves the section one place, the canvas repaints in the new order and focus follows the row', moved31.names.join(' | ') === swapped.join(' | ') && moved31.classes.join(' | ') !== classes31.join(' | ') && moved31.focus === B7.rows[GRID].key, `${moved31.names.join(' | ')} · focus ${moved31.focus}`)
    check('step 31 — the move is announced politely in moveSection\'s own words', moved31.said === `Moved to position ${GRID - TEMPLATES.site.length + 2} of ${TEMPLATES.home.length}`, JSON.stringify(moved31.said))
    await page.keyboard.down('Alt')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.up('Alt')
    await page.waitForTimeout(400)
    check('step 31 — ⌥↑ puts it back, and ⌥↑ at the first position does nothing', (await pageNames()).join(' | ') === names31.join(' | '))
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(150)
    check('step 31 — ↑ moves focus between rows without moving anything', (await page.evaluate(() => document.activeElement?.getAttribute('data-layer-row'))) === B7.rows[GRID - 1].key && (await pageNames()).join(' | ') === names31.join(' | '))

    // ── step 32 — the drag: nothing reorders until the drop, and a dashed slot the row's height ──
    const gripAt = async (n) => {
      const r = await rowAt(n).locator('span[aria-hidden]').first().boundingBox()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    }
    const from32 = await gripAt(GRID)
    const to32 = await gripAt(GRID + 1)
    await page.mouse.move(from32.x, from32.y)
    await page.mouse.down()
    await page.mouse.move(to32.x, to32.y + 4, { steps: 8 })
    await page.waitForTimeout(200)
    const dragging32 = await page.evaluate(() => {
      const slot = document.querySelector('#editor-layers [data-drop-slot]')
      const rows = [...document.querySelectorAll('#editor-layers [data-layer-row]')]
      return {
        slot: slot && { h: slot.getBoundingClientRect().height, dashed: getComputedStyle(slot).borderTopStyle, events: getComputedStyle(slot).pointerEvents },
        rowH: rows[0].getBoundingClientRect().height,
        translated: rows.filter((r) => getComputedStyle(r).translate !== 'none').length,
        names: rows.map((r) => r.querySelector('button').textContent),
      }
    })
    check('step 32 — while dragging: a dashed slot the row\'s own height, rows translated aside, and NOTHING reordered in the list or on the canvas', !!dragging32.slot && dragging32.slot.dashed === 'dashed' && dragging32.slot.events === 'none' && Math.abs(dragging32.slot.h - dragging32.rowH) <= 1 && dragging32.translated > 0 && dragging32.names.join(' | ') === names31.join(' | ') && (await canvasClasses()).join(' | ') === classes31.join(' | '), JSON.stringify(dragging32))
    await page.mouse.up()
    await page.waitForTimeout(400)
    check('step 32 — on the drop the list and the canvas both take the new order, and the slot goes', (await pageNames()).join(' | ') === swapped.join(' | ') && (await canvasClasses()).join(' | ') !== classes31.join(' | ') && (await page.locator('#editor-layers [data-drop-slot]').count()) === 0, (await pageNames()).join(' | '))
    // Story 5.8: the reorder SURVIVES a reload now, so the seed's order is asked for rather than assumed
    await freshLoad()

    // ── step 33 — the ⋯ menu, the rename dialog, and the two kinds of singleton ──
    const pageMenu = await menuOf(GRID)
    // the owner's finding of 2026-09-18: a 210px menu right-aligned to a ⋯ in the 240px Layers panel hung off the
    // LEFT edge of the window. `openMenu` clamps both edges now, so no part of any menu is cut off.
    const menuBox = await page.locator(`#layers-menu-${B7.rows[GRID].key.replace(':', '-')} ul`).boundingBox()
    check('step 33 — the ⋯ menu is wholly on screen: no edge past the window on either side (the owner\'s finding)', menuBox.x >= 0 && menuBox.x + menuBox.width <= 1440 && menuBox.y >= 0, JSON.stringify(menuBox))
    await page.keyboard.press('Escape')
    const siteMenu = await menuOf(HEADER)
    await page.keyboard.press('Escape')
    check('step 33 — R-126: a page row\'s ⋯ holds Hide · Rename · Duplicate · Delete; a SITE-WIDE row\'s holds Hide · Rename · Delete and no Duplicate (FR-D5)', pageMenu.join(' · ') === 'Hide · Rename · Duplicate · Delete' && siteMenu.join(' · ') === 'Hide · Rename · Delete', `page ${pageMenu.join(' · ')} · site ${siteMenu.join(' · ')}`)
    await rowAt(HERO).getByRole('button', { name: `More for ${layerOf(HERO)}`, exact: true }).click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Rename', exact: true }).click()
    await page.waitForTimeout(300)
    const renameFocus = await page.evaluate(() => document.activeElement?.textContent)
    await page.locator('#layers-rename-name').fill('')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await page.waitForTimeout(250)
    const blank = await page.locator('dialog[aria-labelledby="layers-rename-title"]').evaluate((d) => ({ open: d.open, text: d.textContent }))
    check('step 33 — the rename dialog opens on Cancel and refuses a blank name without closing', renameFocus === 'Cancel' && blank.open && /Give this section a name\./.test(blank.text), `focus ${JSON.stringify(renameFocus)} · ${JSON.stringify(blank.open)}`)
    await page.locator('#layers-rename-name').fill('Top of the page')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await page.waitForTimeout(400)
    await rowAt(HERO).getByRole('button', { name: 'Top of the page', exact: true }).click()
    await page.waitForTimeout(300)
    check('step 33 — the renamed row and the panel\'s heading both read the new name', (await pageNames())[HERO] === 'Top of the page' && (await panelOf()).head === 'Top of the page', JSON.stringify(await pageNames()))
    // Duplicate lands directly after its original, with the same name; Delete takes it away
    await rowAt(NEWS).getByRole('button', { name: `More for ${layerOf(NEWS)}`, exact: true }).click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Duplicate', exact: true }).click()
    await page.waitForTimeout(500)
    const dup = { names: await pageNames(), roots: await rootCount() }
    check('step 33 — Duplicate lands a copy directly after its original, on the list and on the canvas', dup.names.length === B7.rows.length + 1 && dup.names[NEWS] === layerOf(NEWS) && dup.names[NEWS + 1] === layerOf(NEWS) && dup.roots === before30 + 1, `${dup.names.join(' | ')} · roots ${dup.roots}`)
    await rowAt(NEWS + 1).getByRole('button', { name: `More for ${layerOf(NEWS)}`, exact: true }).click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.waitForTimeout(500)
    check('step 33 — Delete takes the copy away again, and the page group\'s count follows', (await pageNames()).length === B7.rows.length && (await rootCount()) === before30)

    // ── step 34 — a site-wide section asks first, naming every template ──
    await fromMenu(HEADER, 'Hide')
    const asked = await page.locator('dialog[aria-labelledby="editor-sitewide-title"]').evaluate((d) => ({ open: d.open, text: d.textContent.replace(/\s+/g, ' ') }))
    const askFocus = await page.evaluate(() => document.activeElement?.textContent)
    check('step 34 — Hide on a site-wide row asks first, opening on Cancel and naming every template', asked.open && askFocus === 'Cancel' && new RegExp(`all ${TEMPLATE_COUNT} templates`).test(asked.text) && /site-wide/i.test(asked.text), `${JSON.stringify(asked)} · focus ${JSON.stringify(askFocus)}`)
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page.waitForTimeout(300)
    const stillShown = await menuOf(HEADER)
    await page.keyboard.press('Escape')
    check('step 34 — Cancel changes nothing: the section is still drawn and its menu still says Hide', (await rootCount()) === before30 && stillShown[0] === 'Hide', stillShown.join(' · '))
    // Story 5.8: the edits above survive a reload now, so the seed is asked for (see `freshLoad`)
    await freshLoad()

    // ── step 35 — S4b's pill: three controls, its corner, and the hover it must not lose ──
    const pillNow = () => page.evaluate(() => {
      const el = document.querySelector('[data-section-pill]')
      if (!el) return null
      const c = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, bg: c.backgroundColor, border: c.borderTopWidth, radius: c.borderTopLeftRadius, pad: c.padding, shadow: c.boxShadow, visibility: c.visibility, buttons: [...el.querySelectorAll('button')].map((b) => b.getAttribute('aria-label')), grips: el.querySelectorAll('span[aria-hidden] svg').length }
    })
    await hoverOn(GRID)
    const pill35 = await pillNow()
    const grid35 = await onScreen(GRID)
    check('step 35 — S4b: a white pill on the hairline, radius 24, 3px padding and the md shadow, carrying Duplicate, Delete and the grip and NOTHING else (R-118)', pill35 && pill35.bg === 'rgb(255, 255, 255)' && pill35.border === '1px' && pill35.radius === '24px' && pill35.pad === '3px' && /rgba\(28, 27, 26, 0\.08\)/.test(pill35.shadow) && pill35.buttons.join(' · ') === `Duplicate ${layerOf(GRID)} · Delete ${layerOf(GRID)}` && pill35.grips === 1, JSON.stringify(pill35))
    check('step 35 — S4b: 10px inside the hovered section\'s top-right on screen', pill35 && Math.abs(grid35.right - pill35.right - 10) <= 1 && Math.abs(pill35.top - grid35.y - 10) <= 1, `pill ${JSON.stringify({ right: pill35?.right, top: pill35?.top })} · root right ${grid35.right} top ${grid35.y}`)
    await page.mouse.move((pill35.left + pill35.right) / 2, (pill35.top + pill35.bottom) / 2, { steps: 4 })
    await page.waitForTimeout(300)
    check('step 35 — the pointer moving from the iframe onto the pill keeps the hover and the pill (the null-relatedTarget trap)', (await pillNow()) !== null && (await onScreen(GRID)).hover, `pill ${(await pillNow()) !== null} · hover ${(await onScreen(GRID)).hover}`)
    await page.mouse.move(120, 400)
    await page.waitForTimeout(300)
    check('step 35 — leaving the pill for a panel lets the hover go, and the pill with it', (await pillNow()) === null && !(await onScreen(GRID)).hover)
    // R-125: the Pro tag keeps the corner, the pill sits to its left
    await clickOn(HERO)
    await hoverOn(HERO)
    const [pill125, badge125, hero125] = [await pillNow(), await badgeNow(), await onScreen(HERO)]
    await page.screenshot({ path: `${OUT}/editor-pill-and-pro-tag-1440x900.png` })
    check('step 35 — R-125: the Pro tag is still 8px inside the section\'s top-right (R-119 untouched) and the pill sits to its LEFT, not overlapping', !!pill125 && !!badge125 && Math.abs(hero125.right - badge125.right - 8) <= 1 && Math.abs(badge125.top - hero125.y - 8) <= 1 && pill125.right <= badge125.left && badge125.left - pill125.right <= 10, `pill ${JSON.stringify({ right: pill125?.right })} · badge ${JSON.stringify({ left: badge125?.left, right: badge125?.right, top: badge125?.top })} · root ${JSON.stringify({ right: hero125.right, top: hero125.y })}`)
    // the pill's Duplicate and Delete, and a site-wide section's absent Duplicate
    await hoverOn(GRID)
    await page.locator(`[data-section-pill] button[aria-label="Duplicate ${layerOf(GRID)}"]`).click()
    await page.waitForTimeout(500)
    check('step 35 — the pill\'s Duplicate copies the section directly below, as the row\'s menu does', (await pageNames())[GRID + 1] === layerOf(GRID) && (await rootCount()) === before30 + 1)
    await hoverOn(GRID + 1)
    await page.locator(`[data-section-pill] button[aria-label="Delete ${layerOf(GRID)}"]`).click()
    await page.waitForTimeout(500)
    check('step 35 — and its bin removes it again', (await rootCount()) === before30 && (await pageNames()).length === B7.rows.length)
    // EITHER GRIP DRIVES THE SAME REORDER (review, 2026-09-18): the pill's grip, held past the next section's screen
    // middle, draws the dashed slot in Layers with nothing reordered, and one move lands on the drop — the second
    // entry point to the one `moveSection`, checked as step 32 checks the first
    await hoverOn(GRID)
    const namesP = await pageNames()
    const classesP = await canvasClasses()
    const gripP = await page.locator('[data-section-pill] span[aria-hidden]').boundingBox()
    const nextP = await onScreen(GRID + 1)
    await page.mouse.move(gripP.x + gripP.width / 2, gripP.y + gripP.height / 2)
    await page.mouse.down()
    await page.mouse.move(gripP.x + gripP.width / 2, (nextP.y + nextP.bottom) / 2 + 12, { steps: 10 })
    await page.waitForTimeout(200)
    const draggingP = await page.evaluate(() => ({ slot: !!document.querySelector('#editor-layers [data-drop-slot]'), lifted: [...document.querySelectorAll('#editor-layers [data-layer-row]')].filter((r) => getComputedStyle(r).rotate !== 'none').length }))
    check('step 35 — the pill\'s grip: while held, Layers draws the dashed slot, no row is lifted (the section is what moves), and nothing is reordered', draggingP.slot && draggingP.lifted === 0 && (await pageNames()).join(' | ') === namesP.join(' | ') && (await canvasClasses()).join(' | ') === classesP.join(' | '), JSON.stringify(draggingP))
    await page.mouse.up()
    await page.waitForTimeout(400)
    const swappedP = [...namesP]
    swappedP.splice(GRID, 2, namesP[GRID + 1], namesP[GRID])
    check('step 35 — on the drop the list and the canvas both take the new order, and the move is announced', (await pageNames()).join(' | ') === swappedP.join(' | ') && (await canvasClasses()).join(' | ') !== classesP.join(' | ') && /^Moved to position/.test(await page.locator('#editor-said').innerText()), (await pageNames()).join(' | '))
    await freshLoad()
    await hoverOn(HEADER)
    check('step 35 — a site-wide section\'s pill has no Duplicate (FR-D5), and its bin asks first', (await pillNow())?.buttons.join(' · ') === `Delete ${layerOf(HEADER)}`, JSON.stringify((await pillNow())?.buttons))
    await page.locator(`[data-section-pill] button[aria-label="Delete ${layerOf(HEADER)}"]`).click()
    await page.waitForTimeout(400)
    check('step 35 — the pill\'s bin on a site-wide section opens the SAME confirm, on Cancel', await page.locator('dialog[aria-labelledby="editor-sitewide-title"]').evaluate((d) => d.open) && (await page.evaluate(() => document.activeElement?.textContent)) === 'Cancel')
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page.waitForTimeout(250)

    // ── step 36 — the pill hides from the first canvas scroll and is placed again 150ms after the last ──
    await hoverOn(GRID)
    const placed36 = await pillNow()
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(60)
    const scrolling36 = await pillNow()
    await page.waitForTimeout(700)
    const settled36 = await pillNow()
    const grid36 = await onScreen(GRID)
    /* WHAT "ON ITS SECTION" MEANS ONCE THE CORNER HAS SCROLLED OFF. The pill is kept inside the canvas card, the way
       P0-1's toolbar is kept inside the window — which is what the matrix row asks for in so many words ("like P0-1's
       toolbar"). So a section whose top is above the card draws the pill at the card's edge and NOT 10px below a
       corner nobody can see. The claim that survives both cases, and the one the owner's test 13 states, is
       CONTAINMENT: the pill sits within the part of its own section that is on screen, never over another one. The
       10px corner itself is step 35's check, at rest, where the corner is in view. */
    const card36 = await page.locator('section[aria-label="Canvas"] iframe').boundingBox()
    const within = (p, r, box) => p.left >= Math.max(r.left, box.x) - 1 && p.right <= Math.min(r.right, box.x + box.width) + 1
      && p.top >= Math.max(r.top, box.y) - 1 && p.bottom <= Math.min(r.bottom, box.y + box.height) + 1
    check('step 36 — the pill hides from the first canvas scroll and is placed again on its own section when the scroll settles', !!placed36 && placed36.visibility === 'visible' && scrolling36?.visibility === 'hidden' && settled36?.visibility === 'visible' && Math.abs(grid36.right - settled36.right - 10) <= 1 && within(settled36, { left: grid36.x, right: grid36.right, top: grid36.y, bottom: grid36.bottom }, card36), `${JSON.stringify({ placed: placed36?.visibility, scrolling: scrolling36?.visibility, settled: settled36?.visibility })} · pill ${JSON.stringify({ left: settled36?.left, right: settled36?.right, top: settled36?.top, bottom: settled36?.bottom })} · root ${JSON.stringify({ left: grid36.x, right: grid36.right, top: grid36.y, bottom: grid36.bottom })}`)
    /* And the same claim PER FRAME, which is what "never between the two" means (the epic context's direction to
       measure the pill against step 15's scroll capture). A sampler in the page reads, on every animation frame of a
       real wheel scroll, whether the pill is hidden and — when it is not — how far its own corner is from the corner
       of whatever section is hovered at that instant. 3px is step 15's own tolerance for the same class of measure;
       the drift this rule exists to prevent was 8–15px (the owner's finding, Story 5.2). */
    await hoverOn(GRID)
    const [frames] = await Promise.all([
      page.evaluate(async () => {
        const f = document.querySelector('section[aria-label="Canvas"] iframe')
        const out = []
        const read = () => {
          const el = document.querySelector('[data-section-pill]')
          if (!el) return out.push(null)
          if (getComputedStyle(el).visibility === 'hidden') return out.push('hidden')
          const root = f.contentDocument.querySelector('[data-inflozo-hover]')
          if (!root) return out.push(null)
          const fr = f.getBoundingClientRect()
          const s = fr.width / f.offsetWidth
          const [r, p] = [root.getBoundingClientRect(), el.getBoundingClientRect()]
          // how far the pill lies OUTSIDE the on-screen part of the section it is anchored to — 0 while it is on it.
          // Containment, not the 10px corner: a section scrolled half off draws the pill at the card's edge, which is
          // still on that section (the clamp, "like P0-1's toolbar"). This catches the drift the rule exists for:
          // a pill left over the WRONG section, or floating off every section, while the canvas moved under it.
          const box = { left: Math.max(fr.left + r.left * s, fr.left), right: Math.min(fr.left + r.right * s, fr.right), top: Math.max(fr.top + r.top * s, fr.top), bottom: Math.min(fr.top + r.bottom * s, fr.bottom) }
          return out.push(Math.max(0, box.left - p.left, p.right - box.right, box.top - p.top, p.bottom - box.bottom))
        }
        await new Promise((done) => {
          let n = 0
          const tick = () => { read(); if (++n < 100) requestAnimationFrame(tick); else done() }
          requestAnimationFrame(tick)
        })
        return out
      }),
      (async () => { for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 180); await page.waitForTimeout(60) } })(),
    ])
    const off = frames.filter((v) => typeof v === 'number')
    check('step 36 — per frame of a real scroll, the pill is either hidden or wholly on its own section (≤ 3px, step 15\'s tolerance) — never between the two', frames.length > 30 && frames.includes('hidden') && off.length > 0 && Math.max(...off) <= 3, `${frames.length} frames · ${frames.filter((v) => v === 'hidden').length} hidden · ${off.length} placed · worst ${Math.max(0, ...off).toFixed(1)}px outside its section`)

    // Story 5.8: the edits above survive a reload now, so the seed is asked for (see `freshLoad`)
    await freshLoad()

    // ── step 37 — R-124: Member visibility is the panel's first Section-settings row, and Layers draws none of it ──
    check('step 37 — control: the register gives Newsletter the row and Three Up none, so this step has both halves', carriesMemberVisibility('a22/1') === true && carriesMemberVisibility('a17/1') === false)
    await clickOn(NEWS)
    await openGroup('Section Settings')
    await page.waitForTimeout(250)
    const audience = await controlsAside().evaluate((a) => {
      // the Accordion wraps its children in one column div, so the panel's first Section-settings row is two deep
      const body = a.querySelector('[id$="-group-settings-body"]')
      const first = body?.firstElementChild?.firstElementChild
      return { label: first?.querySelector('span')?.textContent, value: first?.querySelector('button')?.textContent, hints: [...(first?.querySelectorAll('span') ?? [])].map((x) => x.textContent).filter((t) => /sees|previewing/.test(t)) }
    })
    check('step 37 — R-124: Member visibility is the FIRST row of Section Settings, reading Everyone, with its drawn hint — and nothing about it in Layers', audience.label === 'Member visibility' && audience.value === 'Everyone' && audience.hints.some((h) => /Who sees the whole section\./.test(h)) && !(await page.locator('#editor-layers').innerText()).includes('Member visibility'), JSON.stringify(audience))
    await controlsAside().getByRole('button', { name: 'Member visibility', exact: false }).first().click()
    await page.waitForTimeout(250)
    const options = await page.locator('ul[aria-label="Member visibility"]').allInnerTexts()
    await page.getByRole('button', { name: 'Paid members', exact: true }).click()
    await page.waitForTimeout(500)
    const gated = await controlsAside().evaluate((a) => a.textContent)
    check('step 37 — R-114: a named SELECT with A22\'s four values, not a pill row', /Everyone/.test(options.join(' ')) && /Logged out/.test(options.join(' ')) && /Free members/.test(options.join(' ')) && /Paid members/.test(options.join(' ')) && (await controlsAside().getByRole('radiogroup', { name: 'Member visibility' }).count()) === 0, options.join(' | ').replace(/\n/g, ' '))
    check('step 37 — set to Paid members the section leaves the canvas, its Layers row stays, and the control says which visitor the canvas previews', (await rootCount()) === before30 - 1 && (await page.locator('#editor-layers [data-layer-row]').count()) === B7.rows.length && gated.includes(VA.PREVIEWING.anonymous), `roots ${await rootCount()} of ${before30}`)
    await controlsAside().getByRole('button', { name: 'Member visibility', exact: false }).first().click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Everyone', exact: true }).click()
    await page.waitForTimeout(500)
    check('step 37 — back to Everyone and the section returns', (await rootCount()) === before30)
    // the canvas previews the logged out user (View as's default), so "Logged out" IS drawn and the second hint stays away
    // (review, 2026-09-18: the hint used to claim the section was not drawn for every audience but Everyone)
    await controlsAside().getByRole('button', { name: 'Member visibility', exact: false }).first().click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Logged out', exact: true }).click()
    await page.waitForTimeout(500)
    check('step 37 — set to Logged out, the audience the canvas previews, the section stays drawn and the control adds no second line', (await rootCount()) === before30 && !/previewing/.test(await controlsAside().evaluate((a) => a.textContent)), `roots ${await rootCount()} of ${before30}`)
    await controlsAside().getByRole('button', { name: 'Member visibility', exact: false }).first().click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Everyone', exact: true }).click()
    await page.waitForTimeout(500)

    // ── step 38 — hide every page section, then remove them all (EXPERIENCE § State Patterns, UX-DR6) ──
    for (const n of TEMPLATES.home.map((_, i) => i + TEMPLATES.site.length)) await fromMenu(n, 'Hide')
    check('step 38 — every page section hidden: the canvas draws only the site-wide sections and every row stays', (await rootCount()) === TEMPLATES.site.length && (await page.locator('#editor-layers [data-layer-row]').count()) === B7.rows.length)
    for (let i = 0; i < TEMPLATES.home.length; i++) {
      await rowAt(TEMPLATES.site.length).getByRole('button', { name: /^More for / }).click()
      await page.waitForTimeout(250)
      await page.getByRole('button', { name: 'Delete', exact: true }).click()
      await page.waitForTimeout(350)
    }
    const emptied = await layersShape()
    // STORY 5.5 CHANGED THIS OUTCOME, and that change IS AD-22: taking the last section off a synthesizable canvas
    // returns it to UNTOUCHED, so Home re-renders its Synthesis Default stack and the marker comes back. The
    // expectation is the stack `synthesize` really produces against the library on disk, derived — not a number.
    const backHomeRows = autoStack('home').map((i) => i.layerName)
    check('step 38 — the last section off Home returns it to UNTOUCHED: the Synthesis Default stack re-renders and the marker comes back (AD-22, R-130)', emptied.rows.length === TEMPLATES.site.length + backHomeRows.length && emptied.mono.includes(String(backHomeRows.length)) && (await rootCount()) === TEMPLATES.site.length + backHomeRows.length && (await page.locator('#editor-layers [data-auto-generated="layers"]').count()) === 1 && (await page.locator('header [data-auto-generated]').count()) === 0, JSON.stringify({ rows: emptied.rows.length, mono: emptied.mono, want: backHomeRows }))

    // ── step 39 — Story 5.8: the reload keeps the session, AND its history ──
    // Inverted by this story for step 12's reason. The assertion is the one FR-D9 actually promises and the one that is
    // stable whatever steps 30 to 38 left behind: the HISTORY survived the document load, so the left arrow is awake
    // and the customer can still walk back through everything they did before they reloaded.
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    check('step 39 — FR-D9: the journal survives a document load — undo still reaches back through everything steps 30–38 did', (await page.locator('#editor-undo').getAttribute('aria-disabled')) === null, await page.locator('#editor-undo').getAttribute('aria-disabled'))
    // …and the session is reset for the steps below, which is also the control: the same navigation with the local
    // database gone brings the STORED doc back and puts both arrows to sleep.
    await freshLoad()
    check('step 39 — CONTROL: with the local database dropped, the reload brings every section back, unhidden and in its stored order and name, and both arrows sleep', (await pageNames()).join(' | ') === stackOf('home').map(([, name]) => name).join(' | ') && (await rootCount()) === before30 && (await page.locator('#editor-undo').getAttribute('aria-disabled')) === 'true', (await pageNames()).join(' | '))

    // ── step 40 — D5b, row by row: the order, R-130's three marks with their words, the check, the group's chevron,
    //    and R-128's two absent rows ──
    const readMenu = async () => {
      await page.locator('#editor-template').click()
      await page.waitForTimeout(300)
      return page.evaluate(() => {
        const pop = document.getElementById('editor-template-menu')
        // R-130 gave the third state an ICON, which has no border to read — so the row states what it is and this
        // asks it, rather than inferring 'filled' from any element that happens to have no computed border.
        const dot = (b) => b.querySelector('[data-mark]')?.getAttribute('data-mark')
        return {
          open: pop.matches(':popover-open'),
          width: pop.firstElementChild.getBoundingClientRect().width,
          group: (() => {
            const h = document.getElementById('editor-template-membership')
            return h && { tag: h.tagName, expanded: h.getAttribute('aria-expanded'), controls: h.getAttribute('aria-controls') }
          })(),
          rows: [...pop.querySelectorAll('button[data-canvas]')].map((b) => {
            const name = b.querySelector('[data-name]')
            const mark = b.querySelector('[data-mark]')
            const word = b.querySelector('[data-word]')
            const wb = word?.getBoundingClientRect()
            return {
              key: b.dataset.canvas,
              name: name.textContent,
              // R-171: the row's head is its canvas's glyph, and its one line sits under the name
              glyph: b.firstElementChild?.tagName.toLowerCase() === 'svg' && !b.firstElementChild.hasAttribute('data-mark'),
              caption: b.querySelector('[data-caption]')?.textContent ?? null,
              dot: dot(b),
              // the mark TRAILS the name now, in the slot the printed word held
              trails: !!mark && !!(name.compareDocumentPosition(mark) & Node.DOCUMENT_POSITION_FOLLOWING),
              // and its word is a screen reader's: in the row, with a box of at most a pixel
              word: word?.textContent ?? '',
              heard: !word || (wb.width <= 1 && wb.height <= 1),
              checked: b.getAttribute('aria-current') === 'true',
              // R-172: no row carries a tick — the Kit's check is the one polyline a row could hold
              tick: !!b.querySelector('polyline'),
              tint: getComputedStyle(b).backgroundColor,
              indent: getComputedStyle(b).paddingLeft,
            }
          }),
          // the owner's "two scrollbars": the popover itself never scrolls — only the list inside its card does
          popoverScrolls: pop.scrollHeight > pop.clientHeight + 1 || pop.offsetWidth > pop.clientWidth + 1,
          heading: document.getElementById('editor-template-heading')?.textContent ?? null,
          // the list scrolls INSIDE the card, which stops at 420px or 70% of the window
          list: (() => {
            const ul = pop.querySelector('ul')
            const card = pop.firstElementChild.getBoundingClientRect()
            return { card: Math.round(card.height), bottom: card.bottom, vh: innerHeight, client: ul.clientHeight, scroll: ul.scrollHeight, overflowY: getComputedStyle(ul).overflowY }
          })(),
          groups: [...pop.querySelectorAll('ul[aria-labelledby]')].map((g) => document.getElementById(g.getAttribute('aria-labelledby'))?.textContent.trim()),
          text: pop.textContent,
          rules: pop.querySelectorAll('hr').length,
        }
      })
    }
    const d5b = await readMenu()
    const offeredNames = OFFERED.map((key) => CANVASES[key].label)
    check('step 40 — D5b: the menu opens at 284 and lists every canvas this project offers, in the frame\'s own order', d5b.open && d5b.width === 284 && d5b.rows.map((r) => r.name).join(' · ') === offeredNames.join(' · '), `${d5b.width} · ${d5b.rows.map((r) => r.name).join(' · ')}`)
    // THE WORD IS NOT OPTIONAL, and the expectation is DERIVED: a canvas is designed here iff the seed wrote a row
    // for it, auto-generated iff it is synthesizable and undesigned, and "Empty" otherwise — the third state D5b does
    // not draw (never-synthesized and not yet designed: R-129's three and Private).
    const wantMark = (key) => (Object.keys(TEMPLATES).includes(templateKeyOf(key)) ? 'designed' : isSynthesizable(CANVASES[key].file) ? 'auto' : 'empty')
    const WORD_OF = { designed: '', auto: 'Auto-generated', empty: 'Empty' }
    const wrong = d5b.rows.filter((r) => r.dot !== wantMark(r.key) || r.word !== WORD_OF[wantMark(r.key)] || !r.trails || !r.heard)
    check('step 40 — R-130\'s three marks, since R-171 TRAILING the name with their words heard and not printed: a designed canvas a FILLED dot, an auto-generated one a hollow dot and "Auto-generated", one never auto-built the circle-off glyph and "Empty"', wrong.length === 0, JSON.stringify({ wrong, rows: d5b.rows }))
    // R-171 (owner, 2026-09-21): the Template list looks like View as's — a glyph at the head of every row, the canvas's
    // one line under its name (`lib/editor.ts`'s own words, never restated), a heading, and the current row
    // highlighted with no tick (R-172, which reversed R-171's tick on both menus)
    check('step 40 — R-171: every row leads with its canvas\'s glyph and carries its one line under the name, under a "Templates" heading',
      d5b.heading === 'Templates' && d5b.rows.every((r) => r.glyph && r.caption === CANVASES[r.key].caption), JSON.stringify({ heading: d5b.heading, rows: d5b.rows.map((r) => ({ key: r.key, glyph: r.glyph, caption: r.caption })) }))
    check('step 40 — R-172: the current canvas is HIGHLIGHTED — the coral tint — and only it, and no row carries a tick', d5b.rows.filter((r) => r.checked).length === 1 && d5b.rows.find((r) => r.checked)?.name === CANVASES.home.label && d5b.rows.every((r) => r.tint === (r.checked ? TINT : 'rgba(0, 0, 0, 0)') && !r.tick), JSON.stringify(d5b.rows.map((r) => ({ key: r.key, checked: r.checked, tint: r.tint, tick: r.tick }))))
    check('step 40 — a list longer than the card SCROLLS inside it, and the popover around it never does (ONE scrollbar): the card stops at 420px (or 70% of the window) and ends inside the window',
      d5b.popoverScrolls === false && d5b.list.overflowY === 'auto' && d5b.list.card <= Math.min(420, Math.round(d5b.list.vh * 0.7)) + 1 && d5b.list.bottom <= d5b.list.vh && (d5b.list.scroll <= d5b.list.client || d5b.list.card >= Math.min(420, Math.round(d5b.list.vh * 0.7)) - 1),
      JSON.stringify({ ...d5b.list, popoverScrolls: d5b.popoverScrolls }))
    const memberRows = d5b.rows.filter((r, n) => isMembership(OFFERED[n]))
    check('step 40 — R-129\'s three membership canvases sit under a "Membership" heading, indented', d5b.groups.includes('Membership') && memberRows.length === OFFERED.filter(isMembership).length && memberRows.every((r) => r.indent === '31px'), JSON.stringify({ groups: d5b.groups, member: memberRows }))
    check('step 40 — R-128: no "+ New template", no FROM THE ROUTES MANAGER heading and no rule — they arrive with Story 7.16', !/New template/i.test(d5b.text) && !/ROUTES MANAGER/i.test(d5b.text) && d5b.rules === 0, JSON.stringify({ rules: d5b.rules, text: d5b.text.slice(0, 200) }))
    // THE OWNER'S SECOND FINDING (2026-09-18): the heading drew a chevron and nothing happened. It is a button now,
    // so the group shuts and opens, and the rows are GONE while it is shut rather than merely hidden — a hidden button
    // is still one `arrowKeys` would step onto.
    check('step 40 — the Membership heading is a real control: a button, expanded, owning the rows it shows', d5b.group?.tag === 'BUTTON' && d5b.group.expanded === 'true' && d5b.group.controls === 'editor-template-membership-rows', JSON.stringify(d5b.group))
    await page.locator('#editor-template-membership').click()
    await page.waitForTimeout(250)
    const shut = await page.evaluate(() => ({
      expanded: document.getElementById('editor-template-membership').getAttribute('aria-expanded'),
      rows: document.querySelectorAll('#editor-template-menu button[data-canvas]').length,
      heading: document.getElementById('editor-template-membership')?.textContent.trim(),
    }))
    check('step 40 — pressing the chevron COLLAPSES the group: its three rows leave the menu and the heading stays', shut.expanded === 'false' && shut.rows === OFFERED.length - OFFERED.filter(isMembership).length && shut.heading === 'Membership', JSON.stringify(shut))
    await page.locator('#editor-template-membership').click()
    await page.waitForTimeout(250)
    const reopened = await page.evaluate(() => ({
      expanded: document.getElementById('editor-template-membership').getAttribute('aria-expanded'),
      rows: document.querySelectorAll('#editor-template-menu button[data-canvas]').length,
    }))
    check('step 40 — pressing it again EXPANDS the group, and every canvas is offered once more', reopened.expanded === 'true' && reopened.rows === OFFERED.length, JSON.stringify(reopened))
    check('step 40 — FR-D6: no Private row at all — absent, not greyed — for a project whose site has not asked for one', !d5b.rows.some((r) => r.name === CANVASES.private.label) && !OFFERED.includes('private'), d5b.rows.map((r) => r.name).join(' · '))
    // Escape closes it and returns focus to the trigger — the platform's, not ours — so the next step opens it again
    // rather than toggling a menu that was left showing
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)

    // ── step 41 — the editor's FIRST SOFT NAVIGATION (DW-176) ──
    // Two stamps, and both must survive: one on the editor window, one on the CANVAS document. A document load clears
    // the first; re-creating the iframe clears the second. Together they are "the editor stayed mounted".
    await page.evaluate(() => { window.__soft = 'editor' })
    await canvasFrame().evaluate(() => { document.documentElement.dataset.soft = 'canvas' })
    // something selected, so DW-176's own code — the `[key]` effect that nulls the selection — is walked
    await rowAt(GRID).getByRole('button', { name: layerOf(GRID), exact: true }).click()
    await page.waitForTimeout(300)
    const selectedBefore = (await panelOf()).head
    // `load` and NOT `framenavigated`: Next's client router pushes a history entry, which Playwright reports as a
    // same-document `framenavigated` on the main frame — so that event fires for a soft navigation too and is no
    // test at all (executed 2026-09-18, it counted 1 while both stamps survived). The document's `load` event fires
    // only for a real document load, and the two stamps below are the other half of the proof.
    let documentLoads = 0
    const countLoad = () => documentLoads++
    page.on('load', countLoad)
    await page.locator('#editor-template').click()
    await page.waitForTimeout(300)
    await page.locator('#editor-template-menu button[data-canvas="tag"]').click()
    await painted('tag')
    await page.waitForTimeout(400)
    page.off('load', countLoad)
    const soft = await page.evaluate(() => ({
      editor: window.__soft,
      canvas: document.querySelector('section[aria-label="Canvas"] iframe').contentDocument.documentElement.dataset.soft,
      url: location.pathname,
      switcher: document.getElementById('editor-template').textContent,
      selected: document.querySelectorAll('[data-inflozo-selected]').length,
      panel: document.querySelector('#editor-controls')?.textContent,
    }))
    check('step 41 — DW-176: the switcher is a SOFT navigation — no document load, the editor window and the canvas document both survive, and the address is the new canvas', documentLoads === 0 && soft.editor === 'editor' && soft.canvas === 'canvas' && soft.url.endsWith(`/projects/${P}/tag`), JSON.stringify({ documentLoads, ...soft, panel: undefined }))
    check('step 41 — DW-176: the selection and the Controls panel clear as the new canvas paints', selectedBefore === layerOf(GRID) && soft.selected === 0 && /Nothing selected/.test(soft.panel ?? ''), JSON.stringify({ before: selectedBefore, selected: soft.selected }))
    check('step 41 — the switcher now names the canvas it moved to', soft.switcher === `Template${CANVASES.tag.label}`, soft.switcher)

    // ── step 42 — the untouched canvas: the Synthesis Default stack, and D5a's marker in its ONE place (R-130) ──
    const markers = () => page.evaluate(() => [...document.querySelectorAll('[data-auto-generated]')].map((el) => ({ where: el.dataset.autoGenerated, words: el.textContent })))
    const WORDS = 'Auto-generated — edit anything to make it yours'
    const tagMarkers = await markers()
    // R-130: ONE place, not two. The bar's chip is gone, so the count is 1 AND the surviving one is the Layers row —
    // a bare `=== 1` would still pass if the chip had stayed and the row had gone, which is the opposite change.
    check('step 42 — R-130: the marker reads its one sentence in its ONE place, the head of Layers, and the top bar carries none', tagMarkers.length === 1 && tagMarkers[0].where === 'layers' && tagMarkers[0].words === WORDS, JSON.stringify(tagMarkers))
    const tagWant = autoStack('tag').map((i) => i.layerName)
    check('step 42 — the untouched Tag canvas opens on exactly the Synthesis Default rows the library can place, and Layers counts them', (await pageNames()).slice(TEMPLATES.site.length).join(' | ') === tagWant.join(' | ') && (await rootCount()) === TEMPLATES.site.length + tagWant.length, `${(await pageNames()).join(' | ')} · want ${tagWant.join(' | ')}`)
    // and a canvas whose every default row the library cannot place is STILL marked — the site-wide sections and the note
    await page.locator('#editor-template').click()
    await page.waitForTimeout(300)
    await page.locator('#editor-template-menu button[data-canvas="error"]').click()
    await painted('error')
    await page.waitForTimeout(400)
    const errWant = autoStack('error').map((i) => i.layerName)
    check('step 42 — a canvas with every default row dropped still says it is auto-generated, and draws the site-wide sections alone', (await markers()).length === 1 && (await rootCount()) === TEMPLATES.site.length + errWant.length && (await pageNames()).length === TEMPLATES.site.length + errWant.length, `roots ${await rootCount()} · want ${errWant.length} page rows`)

    // ── step 43 — a membership canvas is NEVER synthesized: empty, and unmarked ──
    await page.locator('#editor-template').click()
    await page.waitForTimeout(300)
    // R-171: the list is taller than its card, and 404 is its LAST row — so opening it on 404 must land ON that row,
    // focused and scrolled into view (`scrollTop` above 0 is the proof it moved: the list opens at its top otherwise)
    const onCurrent43 = await page.evaluate(() => {
      const ul = document.querySelector('#editor-template-menu ul')
      const row = document.querySelector('#editor-template-menu button[aria-current="true"]')
      const u = ul.getBoundingClientRect()
      const r = row.getBoundingClientRect()
      return { key: row.dataset.canvas, focused: document.activeElement === row, inView: r.top >= u.top - 1 && r.bottom <= u.bottom + 1, scrolled: ul.scrollTop }
    })
    check('step 43 — R-171: on 404, the list\'s last row, the Template list opens ON the checked row, focused and scrolled into view',
      onCurrent43.key === 'error' && onCurrent43.focused && onCurrent43.inView && onCurrent43.scrolled > 0, JSON.stringify(onCurrent43))
    await page.locator('#editor-template-menu button[data-canvas="custom-signup"]').click()
    await painted('custom-signup')
    await page.waitForTimeout(400)
    check('step 43 — R-129\'s Signup canvas opens EMPTY with no marker anywhere: a custom template is never auto-built', (await markers()).length === 0 && (await rootCount()) === TEMPLATES.site.length && (await pageNames()).length === TEMPLATES.site.length, `roots ${await rootCount()} · rows ${(await pageNames()).length} · markers ${(await markers()).length}`)

    // ── step 44 — AD-22's round trip, on the Tag canvas ──
    await page.locator('#editor-template').click()
    await page.waitForTimeout(300)
    await page.locator('#editor-template-menu button[data-canvas="tag"]').click()
    await painted('tag')
    await page.waitForTimeout(400)
    const FIRST = TEMPLATES.site.length // the first PAGE row, whichever rows the Synthesis Defaults produced
    const tagRow = async (label) => {
      await page.locator('#editor-layers [data-layer-row]').nth(FIRST).getByRole('button', { name: /^More for / }).click()
      await page.waitForTimeout(250)
      await page.getByRole('button', { name: label, exact: true }).click()
      await page.waitForTimeout(400)
    }
    await tagRow('Rename')
    await page.fill('#layers-rename-name', 'My tag feed')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await page.waitForTimeout(400)
    const afterEdit = await readMenu()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    check('step 44 — the first edit MATERIALISES: the marker goes, and the switcher\'s Tag mark fills and loses its word', (await markers()).length === 0 && afterEdit.rows.find((r) => r.checked)?.dot === 'designed' && afterEdit.rows.find((r) => r.checked)?.word === '', JSON.stringify(afterEdit.rows.find((r) => r.checked)))
    // hide every page row: still designed, no marker (FR-D5)
    for (let i = 0; i < tagWant.length; i++) {
      await page.locator('#editor-layers [data-layer-row]').nth(FIRST + i).getByRole('button', { name: /^More for / }).click()
      await page.waitForTimeout(250)
      await page.getByRole('button', { name: 'Hide', exact: true }).click()
      await page.waitForTimeout(350)
    }
    check('step 44 — FR-D5: HIDING every section is not emptying — the rows stay, nothing re-synthesizes and no marker comes back', (await markers()).length === 0 && (await pageNames()).length === TEMPLATES.site.length + tagWant.length && (await rootCount()) === TEMPLATES.site.length, `rows ${(await pageNames()).length} · roots ${await rootCount()} · markers ${(await markers()).length}`)
    // and now remove them: the canvas goes BACK to untouched
    for (let i = 0; i < tagWant.length; i++) await tagRow('Delete')
    await page.waitForTimeout(300)
    const round = await readMenu()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    check('step 44 — AD-22: the last section off returns Tag to UNTOUCHED — the default stack re-renders, the marker returns and the mark hollows again', (await markers()).length === 1 && (await pageNames()).slice(TEMPLATES.site.length).join(' | ') === tagWant.join(' | ') && round.rows.find((r) => r.checked)?.dot === 'auto' && round.rows.find((r) => r.checked)?.word === 'Auto-generated', JSON.stringify({ rows: await pageNames(), dot: round.rows.find((r) => r.checked) }))

    // ── step 45 — the site-wide confirm's DERIVED template count ──
    await page.locator('#editor-layers [data-layer-row]').nth(0).getByRole('button', { name: /^More for / }).click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.waitForTimeout(400)
    const confirmWords = await page.locator('dialog[aria-labelledby="editor-sitewide-title"]').innerText()
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page.waitForTimeout(300)
    check('step 45 — the site-wide confirm names the templates that will actually SHIP, derived from the canvases this project offers', confirmWords.includes(`changes all ${TEMPLATE_COUNT} templates`) && TEMPLATE_COUNT < OFFERED.length, `${JSON.stringify(confirmWords)} · offered ${OFFERED.length} · shipping ${TEMPLATE_COUNT}`)
    await freshLoad()

    // ── Story 5.6's steps, inside the CSP session ────────────────────────────────────────────────────────────────
    // FR-D7, R-131, R-132, R-133. Every expectation is DERIVED: the mode-scoped control and the value pressed come
    // from the pilot's own `sidebar()` model, and the project count from `darkOverrideCount` over the stored docs.

    const bgRow = (design) => {
      const row = sidebar(pilot(design), { content: {}, controls: {}, data: {}, darkOverrides: {} })
        .groups.flatMap((g) => g.rows)
        .find((r) => r.kind === 'control' && r.moon === false && MODE_SCOPED.includes(r.name))
      if (!row) throw new Error(`${design} draws no mode-scoped control, so there is nothing for Story 5.6 to author`)
      // a value this design OFFERS and that is not the one in force, so a change is really a change
      const to = row.options.find((o) => o.greyed === undefined && o.value !== row.value)
      if (!to) throw new Error(`${design}'s ${row.name} offers only one value, so it cannot be overridden`)
      return { name: row.name, label: row.label, from: row.value, to }
    }
    const attrOf = (n, name) => canvasFrame().evaluate(([n, name]) => document.querySelectorAll('#canvas > *')[n].getAttribute(name), [n, name])
    const canvasMode = () => canvasFrame().evaluate(() => document.documentElement.getAttribute('data-mode'))
    const modeButton = () => page.locator('#editor-mode')
    const asideGroup = async (title) => {
      const head = controlsAside().getByRole('button', { name: title, exact: true })
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click()
      await page.waitForTimeout(150)
    }
    /** The row's moon and its words, as the panel draws them.
     *  BY THE LABEL SPAN'S OWN ID, never by text: every Kit control writes its title into `<span id="…-label">` inside
     *  the head span, and a search by textContent alone matched the HEAD when there was no badge beside the title
     *  (the head's text IS the title then) and the title span when there was — so `parentElement` was the whole
     *  control in one case and the head in the other, and the control's own swatch glyphs read as a moon.
     *  AND THE MOON IS ITS WORDS — as its ACCESSIBLE NAME and its hover `title` since R-136 (owner, 2026-09-19)
     *  took the printed words off the row, so the badge is read by its name and its round ink chip, never by
     *  "an svg is somewhere in this row", which the reset arrow and the Image swatch both satisfy. */
    const moonOn = (label) => controlsAside().evaluate((a, label) => {
      const span = [...a.querySelectorAll('span[id$="-label"]')].find((s) => s.textContent === label)
      const head = span?.parentElement
      if (head === undefined || head === null) return null
      // VISIBLE words only: `textContent` includes the badge's SVG <title>, which is its accessible NAME and is not
      // printed anywhere — reading it as print made a correct row fail (Review, 2026-09-19)
      const shown = head.cloneNode(true)
      shown.querySelectorAll('.rounded-full').forEach((el) => el.remove())
      const chip = head.querySelector('.rounded-full')
      // the name is the SVG <title> the Kit writes, and the hover title is on the chip itself — both must be the words
      const named = chip?.querySelector('title')?.textContent ?? null
      return { words: shown.textContent, name: named, hover: chip?.getAttribute('title') ?? null, moon: named === 'Dark override' && chip?.querySelector('svg') !== undefined && chip?.querySelector('svg') !== null }
    }, label)

    // ── step 46 — S4a's sun, at its drawn place and size, and nothing else right of centre ──
    const sun = await page.evaluate(() => {
      const el = document.getElementById('editor-mode')
      if (!el) return null
      const r = el.getBoundingClientRect()
      const bar = el.closest('header').getBoundingClientRect()
      const svg = el.querySelector('svg')
      return {
        name: el.getAttribute('aria-label'), pressed: el.getAttribute('aria-pressed'), tag: el.tagName,
        width: Math.round(r.width), height: Math.round(r.height), glyph: svg ? Math.round(svg.getBoundingClientRect().width) : 0,
        rays: el.querySelectorAll('circle').length, radius: getComputedStyle(el).borderTopLeftRadius,
        rightOfCentre: r.left > bar.left + bar.width / 2,
        // the cluster's order, ids only: since Story 5.12 the DICE leads it (R-135's own reason — the sun is not
        // rendered at all on a Light-only project, so a dice after it would move), the sun comes next, and nothing
        // pressable sits to its right but the device track and the way into Theme settings
        after: [...el.parentElement.children].map((c) => c.id).filter(Boolean),
      }
    })
    check('step 46 — R-132: S4a\'s mode control is ONE 28×28 button with the export\'s 15px sun, right of centre, directly after Story 5.12\'s dice at the head of the right-hand cluster', sun !== null && sun.tag === 'BUTTON' && sun.width === 28 && sun.height === 28 && sun.glyph === 15 && sun.rays === 1 && sun.radius === '8px' && sun.rightOfCentre && sun.after.slice(0, 2).join(' ') === 'editor-remix editor-mode', JSON.stringify(sun))
    check('step 46 — R-132: an accessible name naming the DESTINATION, and NO `aria-pressed` beside a name that already changes (Review)', sun?.pressed == null && sun?.name === 'Preview dark mode', `${sun?.pressed} · ${JSON.stringify(sun?.name)}`)
    check('step 46 — the canvas opens in light, from the one mode signal `tokens.ts` reserves for it (AD-30)', (await canvasMode()) === 'light', String(await canvasMode()))

    // ── step 47 — the flip: dark, and NOTHING REPAINTED ──
    await clickOn(GRID)
    await canvasFrame().evaluate(() => {
      window.__nodes = [...document.querySelectorAll('#canvas > *')]
      document.scrollingElement.scrollTo(0, 260)
    })
    await page.waitForTimeout(200)
    // read where the canvas ACTUALLY sits rather than asserting the number asked for: a short canvas clamps a scroll,
    // and the claim is that the flip does not move it
    const [litGround, scrolledTo] = await canvasFrame().evaluate(() => [getComputedStyle(document.body).backgroundColor, Math.round(document.scrollingElement.scrollTop)])
    await modeButton().click()
    await page.waitForTimeout(300)
    const flipped = await canvasFrame().evaluate(() => ({
      mode: document.documentElement.getAttribute('data-mode'),
      // the SAME nodes: `mountSections` would have replaced every one of them
      same: [...document.querySelectorAll('#canvas > *')].every((el, n) => el === window.__nodes[n]),
      ground: getComputedStyle(document.body).backgroundColor,
      scroll: Math.round(document.scrollingElement.scrollTop),
      selected: document.querySelectorAll('[data-inflozo-selected]').length,
    }))
    check('step 47 — pressing the sun paints the canvas dark from `data-mode` alone, and NOTHING IS REPAINTED: every section root is the same node', flipped.mode === 'dark' && flipped.same && flipped.ground !== litGround, `${JSON.stringify(flipped)} · light ground ${litGround}`)
    check('step 47 — the selection and the scroll position both survive the flip (R-123: the top bar never deselects)', flipped.selected === 1 && flipped.scroll === scrolledTo && scrolledTo > 0, JSON.stringify({ selected: flipped.selected, scroll: flipped.scroll, was: scrolledTo }))
    const inDark = await page.evaluate(() => ({ name: document.getElementById('editor-mode').getAttribute('aria-label'), pressed: document.getElementById('editor-mode').getAttribute('aria-pressed'), said: document.getElementById('editor-said').textContent }))
    check('step 47 — R-132: the sun became a moon, its name now names light, and the mode SHOWING is announced politely', inDark.name === 'Back to light mode' && inDark.pressed === null && inDark.said === 'Dark mode', JSON.stringify(inDark))
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 0))
    await page.waitForTimeout(200)
    // Review, AC 3: THE CARET. A press on the sun used to move focus into the editor, which ENDS an inline edit
    // (`inline.ts` focusout) and repaints — the roots-are-the-same-node read above cannot see that, since it starts no edit
    await caretInto(GRID, TITLE)
    const caretOf = () => canvasFrame().evaluate(() => ({ editable: document.activeElement?.isContentEditable === true, offset: document.getSelection()?.focusOffset ?? null, mode: document.documentElement.getAttribute('data-mode') }))
    const caretBefore = await caretOf()
    await modeButton().click()
    await page.waitForTimeout(300)
    const caretAfter = await caretOf()
    check('step 47 — a caret in a text prop SURVIVES the flip: still editing, the same offset, and the mode did flip', caretBefore.editable && caretAfter.editable && caretAfter.offset === caretBefore.offset && caretAfter.mode !== caretBefore.mode, `${JSON.stringify(caretBefore)} → ${JSON.stringify(caretAfter)}`)
    await modeButton().click()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)

    // ── step 48 — authoring a dark override: dark only, with the moon and its words ──
    const BG = bgRow(homeStack[GRID][0])
    await clickOn(GRID)
    await canvasFrame().evaluate(() => { window.__nodes = [...document.querySelectorAll('#canvas > *')] })
    await asideGroup('Style')
    const beforeBg = await attrOf(GRID, `data-${BG.name}`)
    await controlsAside().getByRole('radiogroup', { name: BG.label }).getByRole('radio', { name: BG.to.label }).click()
    await page.waitForTimeout(300)
    const authored = await page.evaluate(([n, name]) => {
      const r = document.querySelector('section[aria-label="Canvas"] iframe').contentDocument.querySelectorAll('#canvas > *')[n]
      return { value: r.getAttribute(`data-${name}`), same: r === document.querySelector('section[aria-label="Canvas"] iframe').contentDocument.defaultView.__nodes[n] }
    }, [GRID, BG.name])
    check(`step 48 — in dark, ${BG.label} → ${BG.to.label} stamps the same root in place: data-${BG.name}="${BG.to.value}"`, authored.value === BG.to.value && authored.same, JSON.stringify(authored))
    check('step 48 — FR-F5 with R-136: the row carries the moon badge, its words are its NAME and its hover title, and they are NOT printed in the row', (await moonOn(BG.label))?.moon === true && (await moonOn(BG.label))?.hover === 'Dark override' && !/Dark override/.test((await moonOn(BG.label))?.words ?? ''), JSON.stringify(await moonOn(BG.label)))
    await modeButton().click()
    await page.waitForTimeout(300)
    check('step 48 — back in light the root returns to the value it had: THE LIGHT PAGE WAS NOT TOUCHED', (await canvasMode()) === 'light' && (await attrOf(GRID, `data-${BG.name}`)) === beforeBg, `${await attrOf(GRID, `data-${BG.name}`)} · was ${beforeBg}`)
    check('step 48 — and the moon STAYS on the row, because an override is stored whatever mode is being shown', (await moonOn(BG.label))?.moon === true, JSON.stringify(await moonOn(BG.label)))

    // ── step 48 (b) — A REPAINT IN DARK DRAWS THE DARK RENDER ──
    // Found at Dev by reading `paint()`: the mode picks the slice handed to the one door in `restampAll` and in
    // `onChange`, and it has to do the same where `renderSection` is called, or any repaint — a content edit, a
    // section operation, a change of canvas — would silently put the page back into light while dark is shown.
    // A RENAME is the repaint used here because it changes no control of its own: `onRename` → `apply` → `paint`.
    await modeButton().click()
    await page.waitForTimeout(300)
    await rowAt(GRID).getByRole('button', { name: /^More for / }).click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Rename', exact: true }).click()
    await page.waitForTimeout(300)
    await page.fill('#layers-rename-name', 'Repainted in dark')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await page.waitForTimeout(500)
    const repainted = { mode: await canvasMode(), value: await attrOf(GRID, `data-${BG.name}`) }
    check('step 48 — a REPAINT while dark is shown keeps the dark render: the override is stamped again, never the light value', repainted.mode === 'dark' && repainted.value === BG.to.value, `${JSON.stringify(repainted)} · want ${BG.to.value}, light was ${beforeBg}`)
    await clickOn(GRID)

    // ── step 49 — a control that is NOT mode-scoped, and reset in each mode ── (dark is showing, from 48 (b))
    await asideGroup('Layout')
    const PLAIN = await controlsAside().getByRole('radiogroup', { name: 'Per row' }).count()
    if (PLAIN > 0) {
      await controlsAside().getByRole('radiogroup', { name: 'Per row' }).getByRole('radio', { name: 'Two' }).click()
      await page.waitForTimeout(250)
      const darkPlain = await attrOf(GRID, 'data-per-row')
      await modeButton().click()
      await page.waitForTimeout(300)
      check('step 49 — a control that is not mode-scoped is ONE value for both modes: changed in dark, it is changed in light too', darkPlain === 'two' && (await attrOf(GRID, 'data-per-row')) === 'two' && (await moonOn('Per row'))?.moon === false, `${darkPlain} · light ${await attrOf(GRID, 'data-per-row')}`)
      await modeButton().click()
      await page.waitForTimeout(300)
    } else note('step 49', `${homeStack[GRID][0]} draws no Per row control, so the not-mode-scoped row is proved in controls.test.ts alone`)
    // reset in DARK: the override is forgotten and the row follows light again
    await asideGroup('Style')
    await controlsAside().getByRole('button', { name: `Reset ${BG.label}`, exact: true }).click()
    await page.waitForTimeout(300)
    check('step 49 — FR-F4 in dark: "Reset ' + BG.label + '" forgets the OVERRIDE, the row follows the light value, and the moon goes', (await attrOf(GRID, `data-${BG.name}`)) === beforeBg && (await moonOn(BG.label))?.moon === false, `${await attrOf(GRID, `data-${BG.name}`)} · was ${beforeBg}`)
    // and in LIGHT the dark override is KEPT: put one back, flip to light, reset there
    await controlsAside().getByRole('radiogroup', { name: BG.label }).getByRole('radio', { name: BG.to.label }).click()
    await page.waitForTimeout(250)
    await modeButton().click()
    await page.waitForTimeout(300)
    const lightTo = (await controlsAside().getByRole('radiogroup', { name: BG.label }).getByRole('radio', { name: BG.to.label }).count()) > 0
    // standing rule 2: a missing control is a FAIL, never a silent skip
    check('step 49 — the light panel offers the value the reset-in-light check presses', lightTo)
    if (lightTo) {
      await controlsAside().getByRole('radiogroup', { name: BG.label }).getByRole('radio', { name: BG.to.label }).click()
      await page.waitForTimeout(250)
      await controlsAside().getByRole('button', { name: `Reset ${BG.label}`, exact: true }).click()
      await page.waitForTimeout(300)
      check('step 49 — FR-F4 in light: the LIGHT value is forgotten and the dark override STAYS (its moon is still on the row)', (await attrOf(GRID, `data-${BG.name}`)) === beforeBg && (await moonOn(BG.label))?.moon === true, JSON.stringify(await moonOn(BG.label)))
    }

    // ── step 50 — R-133: two entry points, ONE confirm ──
    const clearDialog = page.locator('dialog[aria-labelledby="editor-cleardark-title"]')
    await controlsAside().getByRole('button', { name: 'Clear dark overrides', exact: true }).click()
    await page.waitForTimeout(250)
    const fromPanel = await page.evaluate(() => {
      const d = document.querySelector('dialog[aria-labelledby="editor-cleardark-title"]')
      return d === null ? null : { open: d.open, words: d.innerText.replace(/\s+/g, ' '), focus: document.activeElement?.textContent }
    })
    check('step 50 — R-115: the panel\'s row asks first, names the count, and opens with focus on Cancel (UX-DR14)', fromPanel?.open === true && /1 setting/.test(fromPanel.words) && fromPanel.focus === 'Cancel', JSON.stringify(fromPanel))
    await clearDialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page.waitForTimeout(250)
    check('step 50 — Cancel changes nothing: the override is still stored and its moon is still on the row', (await moonOn(BG.label))?.moon === true && !(await clearDialog.evaluate((d) => d.open)))

    // ── step 51 — R-133's second entry point: the ⋯ menu, and its ABSENCE ──
    const menuItems = async (n) => {
      await rowAt(n).getByRole('button', { name: /^More for / }).click()
      await page.waitForTimeout(250)
      const items = await page.evaluate(() => [...document.querySelectorAll('[popover]')].filter((p) => p.matches(':popover-open')).flatMap((p) => [...p.querySelectorAll('button')].map((b) => b.textContent.trim())))
      return items
    }
    const withOverride = await menuItems(GRID)
    check('step 51 — R-133: the ⋯ of a section carrying an override offers "Clear dark overrides", below Hide, and R-126\'s Hide/Show still LEADS the menu', withOverride[0] === 'Hide' && withOverride.includes('Clear dark overrides'), withOverride.join(' · '))
    // scoped to the OPEN popover: the same words are on the panel's row and on the dialog's confirm button
    await page.locator('[popover]:popover-open').getByRole('button', { name: 'Clear dark overrides', exact: true }).click()
    await page.waitForTimeout(300)
    const sameConfirm = await page.evaluate(() => {
      const all = [...document.querySelectorAll('dialog[aria-labelledby="editor-cleardark-title"]')]
      return { dialogs: all.length, open: all.filter((d) => d.open).length, words: all.find((d) => d.open)?.innerText.replace(/\s+/g, ' ') }
    })
    check('step 51 — R-133: BOTH entry points open the SAME confirm — there is exactly one in the document, as Delete\'s and Hide\'s is', sameConfirm.dialogs === 1 && sameConfirm.open === 1 && sameConfirm.words === fromPanel?.words, JSON.stringify(sameConfirm))
    await clearDialog.getByRole('button', { name: 'Clear dark overrides', exact: true }).click()
    await page.waitForTimeout(400)
    check('step 51 — confirmed, that section\'s dark version follows its light one again and the moon goes', (await attrOf(GRID, `data-${BG.name}`)) === beforeBg && (await moonOn(BG.label))?.moon === false, `${await attrOf(GRID, `data-${BG.name}`)} · ${JSON.stringify(await moonOn(BG.label))}`)
    const noOverride = await menuItems(HERO)
    check('step 51 — R-133/UX-DR3: on a section with no override the item is ABSENT from the menu — not greyed, gone (the shape Duplicate uses)', !noOverride.includes('Clear dark overrides') && noOverride[0] === 'Hide', noOverride.join(' · '))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await clickOn(HERO)
    await controlsAside().getByRole('button', { name: 'Clear dark overrides', exact: true }).click()
    await page.waitForTimeout(300)
    const saysSo = await controlsAside().evaluate((a) => ({ open: !!document.querySelector('dialog[aria-labelledby="editor-cleardark-title"]')?.open, words: a.innerText.replace(/\s+/g, ' ') }))
    check('step 51 — R-12: with nothing to clear the panel\'s row SAYS SO under itself rather than asking, and stays live', saysSo.open === false && /Nothing to clear/.test(saysSo.words), JSON.stringify({ open: saysSo.open, said: /Nothing to clear[^.]*\./.exec(saysSo.words)?.[0] }))

    // ── step 52 — R-131's Theme settings screen: D6a's two rows, and every other row of D6a ABSENT ──
    // The override is planted through the service key, because this step's subject is a STORED override and not one this
    // session made — the editor's own write goes through 5.8's journal and would be this session's. So
    // this is the only way to prove "every stored override is untouched" across a mode change and a reload, and the
    // only way to give the project-level count something real to derive.
    const BG_HERO = bgRow(homeStack[HERO][0])
    // THE SEED FIRST, so the doc this step plants INTO is the one `homeStack` was derived from. Since Story 5.8 the
    // stored doc can legitimately be an earlier step's editing, and an override planted under a control the section
    // no longer carries counts as none. `freshLoad` also leaves the editor with NOTHING pending, which is what makes
    // the `leaveEditor` below a clean departure rather than one more flush.
    await freshLoad()
    const homeRow = await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)
    // the editor goes FIRST, so its tab-close flush cannot land on top of the plant (`leaveEditor`)
    await leaveEditor()
    const plantedDoc = JSON.parse(JSON.stringify(homeRow.body?.[0]?.doc ?? null))
    plantedDoc.instances[0].darkOverrides = { [BG_HERO.name]: BG_HERO.to.value }
    const plant = await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home`, { method: 'PATCH', body: JSON.stringify({ doc: plantedDoc }) })
    check('step 52 — an override is planted on Home\'s first section through the service key, so the STORED half can be read', plant.status === 200 || plant.status === 204, `HTTP ${plant.status}`)
    const storedOverrides = async () => {
      const r = await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)
      return r.body?.[0]?.doc?.instances?.[0]?.darkOverrides
    }
    const settingsUrl = at(`/projects/${P}/settings`)
    // `BusyLabel` keeps both labels in one grid cell, so a segment's accessible name carries its busy word too: the
    // pill is read and pressed by its form value, never by an exact name
    const segment = (value) => page.locator(`button[name="dark"][value="${value}"]`)
    const readSettings = () => page.evaluate(() => ({
      pill: [...document.querySelectorAll('[role="group"][aria-label="This project"] button')].map((b) => ({ value: b.getAttribute('value'), label: b.querySelector('span span')?.textContent, pressed: b.getAttribute('aria-pressed') })),
      caption: document.body.innerText.includes('Every Style Pack ships a hand-paired dark palette, so dark is already paid for.'),
      row: document.querySelector('[data-clear-row]')?.innerText.replace(/\s+/g, ' '),
      greyed: document.querySelector('[data-clear-row]')?.hasAttribute('data-greyed'),
      clearRefuses: document.querySelector('[data-clear-row] button[type="submit"]')?.getAttribute('aria-disabled'),
      // the Kit's `MoonBadge` names itself with an SVG `<title>`, where D6a's own markup uses `aria-label`: both are
      // the accessible name, so the badge is read either way rather than by the frame's spelling
      moonLabel: (() => {
        const el = document.querySelector('[data-clear-row] [role="img"]')
        return el === null ? null : (el.getAttribute('aria-label') ?? el.querySelector('title')?.textContent ?? null)
      })(),
      reason: document.body.innerText.includes('Switch to Light + Dark to use or clear them.'),
      kept: document.body.innerText.includes('The overrides are kept, not discarded'),
      // R-118 a fourth time: everything else D6a draws is ABSENT — not greyed and not captioned
      restOfD6a: ['Posts per page', 'Site basics', 'Accent colour', 'Credits', 'OF 17', 'Navigation', 'Social accounts', 'Translations', 'Code injection'].filter((w) => document.body.innerText.includes(w)),
    }))
    await page.goto(settingsUrl, { waitUntil: 'load' })
    // Review: `load` can land while React's streamed rows still sit in their HIDDEN holder — `querySelector` finds them
    // there and `body.innerText` does not, so the caption read false beside a pill read true. Wait for the words SHOWN.
    await page.getByText('Every Style Pack ships a hand-paired dark palette').waitFor({ state: 'visible' })
    const settings = await readSettings()
    check('step 52 — R-131: /projects/<id>/settings draws D6a\'s mode block — "This project" as Light only | Light + Dark, with its caption verbatim', settings.pill.map((b) => b.label).join(' | ') === 'Light only | Light + Dark' && settings.pill[1].pressed === 'true' && settings.caption, JSON.stringify(settings.pill))
    check('step 52 — R-131: D6a\'s clear row carries the moon labelled "Dark override" and a DERIVED count, live while the project is Light + Dark', settings.moonLabel === 'Dark override' && /1 section carries a dark override/.test(settings.row ?? '') && settings.greyed === false && settings.clearRefuses === null, JSON.stringify({ row: settings.row, greyed: settings.greyed, refuses: settings.clearRefuses }))
    check('step 52 — R-118 a fourth time: every other row and group D6a draws is ABSENT from the screen — not greyed and not captioned', settings.restOfD6a.length === 0 && !settings.reason && !settings.kept, settings.restOfD6a.join(' · '))

    // ── step 53 — FR-D7's Light-only half, against the STORED docs, and back again ──
    await segment('off').click()
    await page.waitForTimeout(2000)
    const lightOnly = await readSettings()
    check('step 53 — D6b: switched to Light only the clear row GREYS WITH ITS REASON, and says the overrides are kept rather than discarded', lightOnly.pill[0].pressed === 'true' && lightOnly.greyed === true && lightOnly.clearRefuses === 'true' && lightOnly.reason && lightOnly.kept, JSON.stringify({ pressed: lightOnly.pill.map((b) => b.pressed), greyed: lightOnly.greyed, refuses: lightOnly.clearRefuses }))
    // Review: the greyed Clear PRESSED — the button refuses, and (scripts off, or a hand-made POST) so does the action
    // `force`: Playwright will not click an `aria-disabled` control, and a person can. Then the form submitted PAST the
    // button (`requestSubmit()` runs no click handler) — which is what scripts-off does — so the ACTION's refusal is read too
    await page.locator('[data-clear-row] button').click({ force: true })
    await page.waitForTimeout(800)
    await page.locator('[data-clear-row]').evaluate((row) => row.closest('form').requestSubmit())
    await page.waitForTimeout(2000)
    check('step 53 — D6b: pressing the greyed Clear deletes NOTHING', JSON.stringify(await storedOverrides()) === JSON.stringify({ [BG_HERO.name]: BG_HERO.to.value }), JSON.stringify(await storedOverrides()))
    // Review: BACK is a soft navigation, and the editor is a sibling route — the sun must be gone without a reload
    await page.locator('a[aria-label^="Back to "]').click()
    // a LOCAL run's links carry no /app prefix (`openCard`'s note), so Back lands on a 404 and the walk died here
    if (LOCAL) { await page.waitForTimeout(1500); if (page.url() !== editorUrl()) await page.goto(editorUrl(), { waitUntil: 'load' }) }
    await painted('home')
    check('step 53 — a SOFT navigation back to the editor already shows no sun (the action revalidates the project, not one page)', (await page.evaluate(() => document.getElementById('editor-mode') !== null)) === false)
    // `dropLocal`, NOT `freshLoad`: steps 52 and 53 stand on an override PLANTED in the stored doc, and
    // `freshLoad` puts the seed back — which would wipe the very row this step is about. The device copy is
    // still dropped, so the hydrate takes the server's doc (§AD1.1's third row) and reads the plant.
    await dropLocal()
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    const noSun = await page.evaluate(() => document.getElementById('editor-mode') !== null)
    const litMode = await canvasMode()
    const keptStored = await storedOverrides()
    check('step 53 — FR-D7 on a Light-only project: the sun is ABSENT from the bar rather than disabled, and the canvas is light', noSun === false && litMode === 'light', `control ${noSun ? 'present' : 'absent'} · mode ${litMode}`)
    // Story 5.9's review: and `.` does NOTHING here — the one arm of the key the harness fixture cannot reach, because
    // it is dark-enabled. Executed rather than matched in the source: the canvas stays light and nothing is announced.
    await page.locator('section[aria-label="Canvas"]').focus()
    const saidLit = await page.evaluate(() => document.getElementById('editor-said')?.textContent ?? '')
    await page.keyboard.press('.')
    await page.waitForTimeout(400)
    const afterDot = { mode: await canvasMode(), said: await page.evaluate(() => document.getElementById('editor-said')?.textContent ?? '') }
    check('step 53 — R-135: `.` on a Light-only project changes nothing and announces nothing', afterDot.mode === 'light' && afterDot.said === saidLit, JSON.stringify(afterDot))
    // Story 5.7: and the DEVICE TRACK is untouched by any of it — R-135 scopes dark and nothing else, so the track is
    // beside the sun rather than part of it, and a Light-only project previews on a phone exactly as every other does
    const litDevice = await page.evaluate(() => {
      const track = document.getElementById('editor-device')
      if (!track) return null
      const cluster = track.parentElement
      return {
        radios: [...track.querySelectorAll('[role="radio"]')].map((b) => b.getAttribute('aria-label')),
        checked: track.querySelector('[aria-checked="true"]')?.getAttribute('aria-label') ?? null,
        // STORY 5.12: the seat the absent sun leaves is taken by the DICE, not by the track — which is the whole
        // reason the dice leads the cluster (R-135): a control placed after the sun moves on a Light-only project,
        // and this is the assertion that proves the dice does not
        order: [...(cluster?.children ?? [])].map((c) => c.id).filter(Boolean),
      }
    })
    check('step 53 — on a Light-only project the DEVICE TRACK is unaffected: all three devices, Desktop in force, and the dice still LEADS the cluster with the track directly after it — the dice\'s seat does not move when the sun goes (R-135, Story 5.12)', litDevice !== null && litDevice.radios.join(' | ') === LABELS.join(' | ') && litDevice.checked === DEVICE.DESKTOP.label && litDevice.order.slice(0, 2).join(' ') === 'editor-remix editor-device', JSON.stringify(litDevice))
    // R-135 (owner, 2026-09-19): and the editor says nothing else about dark either — both clears are ABSENT, so it
    // cannot delete what Theme settings has just greyed with the reason that it is kept
    await clickOn(HERO)
    await asideGroup('Style')
    const inPanel = await controlsAside().getByRole('button', { name: 'Clear dark overrides', exact: true }).count()
    const inMenu = await menuItems(HERO)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    check('step 53 — R-135: on a Light-only project BOTH editor entry points are absent — the panel row and the ⋯ item, not greyed', inPanel === 0 && !inMenu.includes('Clear dark overrides'), JSON.stringify({ inPanel, inMenu }))
    check('step 53 — AD-17: NOTHING WAS DELETED by the mode change — the stored override is byte-identical', JSON.stringify(keptStored) === JSON.stringify({ [BG_HERO.name]: BG_HERO.to.value }), JSON.stringify(keptStored))
    await page.goto(settingsUrl, { waitUntil: 'load' })
    await segment('on').click()
    await page.waitForTimeout(2000)
    // `dropLocal`, NOT `freshLoad`: steps 52 and 53 stand on an override PLANTED in the stored doc, and
    // `freshLoad` puts the seed back — which would wipe the very row this step is about. The device copy is
    // still dropped, so the hydrate takes the server's doc (§AD1.1's third row) and reads the plant.
    await dropLocal()
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    await clickOn(HERO)
    await asideGroup('Style')
    const backOn = { sun: await page.evaluate(() => document.getElementById('editor-mode') !== null), moon: (await moonOn(BG_HERO.label))?.moon }
    await modeButton().click()
    await page.waitForTimeout(300)
    check('step 53 — Light + Dark again: the sun is back and the stored override REAPPLIES EXACTLY — nothing was thrown away while dark was off', backOn.sun && backOn.moon === true && (await attrOf(HERO, `data-${BG_HERO.name}`)) === BG_HERO.to.value, `${JSON.stringify(backOn)} · stamped ${await attrOf(HERO, `data-${BG_HERO.name}`)} · want ${BG_HERO.to.value}`)
    await modeButton().click()
    await page.waitForTimeout(300)

    // ── step 53 (b) — D6a's project-level Clear, and its derived count going with it ──
    await page.goto(settingsUrl, { waitUntil: 'load' })
    await page.getByText('Every Style Pack ships a hand-paired dark palette').waitFor({ state: 'visible' })
    // R-134 (owner, 2026-09-19): the widest destructive act in the product asks first, names the count, opens on Cancel.
    // The count is DERIVED from the row's own sentence, never written here (standing rule 4)
    const stored = /(\d+) sections? carr/.exec((await readSettings()).row ?? '')
    const saysCount = stored === null ? null : Number(stored[1]) === 1 ? 'One section' : `All ${stored[1]} sections`
    await page.locator('[data-clear-row] button[type="submit"]').click()
    await page.waitForTimeout(400)
    const projectAsk = await page.evaluate(() => {
      const d = document.querySelector('dialog[aria-labelledby="cleardark-project-title"]')
      return d === null ? null : { open: d.open, text: d.innerText.replace(/\s+/g, ' '), focus: document.activeElement?.textContent?.trim() ?? null }
    })
    check('step 53 — R-134: D6a\'s Clear ASKS FIRST, names the count and opens with focus on Cancel (R-115, UX-DR14)', projectAsk?.open === true && /Clear dark overrides\?/.test(projectAsk.text) && saysCount !== null && projectAsk.text.includes(saysCount) && projectAsk.focus === 'Cancel', JSON.stringify(projectAsk))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(800)
    check('step 53 — R-134: Cancel changes nothing — every override is still stored', JSON.stringify(await storedOverrides()) === JSON.stringify({ [BG_HERO.name]: BG_HERO.to.value }), JSON.stringify(await storedOverrides()))
    await page.locator('[data-clear-row] button[type="submit"]').click()
    await page.waitForTimeout(400)
    await page.locator('dialog[aria-labelledby="cleardark-project-title"] button', { hasText: 'Clear overrides' }).click()
    await page.waitForTimeout(2500)
    const afterClear = await readSettings()
    const clearedStored = await storedOverrides()
    // R-12, the shape the panel row uses: with nothing left to clear it SAYS so rather than asking again
    await page.locator('[data-clear-row] button[type="submit"]').click()
    await page.waitForTimeout(500)
    const atZero = await page.evaluate(() => ({ asked: document.querySelector('dialog[aria-labelledby="cleardark-project-title"]')?.open === true, said: document.querySelector('[data-clear-row]')?.parentElement?.innerText ?? '' }))
    check('step 53 — R-134/R-12: with nothing to clear the project row SAYS so rather than asking', atZero.asked === false && /Nothing to clear/.test(atZero.said), JSON.stringify(atZero))
    check('step 53 — D6a\'s Clear empties every section\'s overrides across every canvas, and the DERIVED count goes with them', /No sections carry a dark override/.test(afterClear.row ?? '') && JSON.stringify(clearedStored) === '{}', `${JSON.stringify(afterClear.row)} · stored ${JSON.stringify(clearedStored)}`)
    await freshLoad()

    // ─────────────────────────────────────────── Story 5.7 — DEVICE PREVIEW, AND THE CANVAS AS A VIEWPORT ───
    // Steps 54–60, inside step 5's CSP session so its zero covers every one of them. Every expectation is DERIVED
    // from `apps/web/lib/device.ts` — the table, the fit and the chip's words — so a device, a size or a word that
    // changes there changes this walk with it and is never restated here (standing rule 4). The editor is freshly
    // loaded here, from step 53 (b)'s last two lines.
    const deviceButton = (name) => page.locator(`#editor-device button[data-device="${name}"]`)
    /** everything the canvas IS right now: the frame's real CSS viewport, its box, the fit on it, the chip and the card */
    const viewportNow = () => page.evaluate(() => {
      const stage = document.querySelector('section[aria-label="Canvas"]')
      const f = stage.querySelector('iframe')
      const card = stage.firstElementChild
      const chip = document.getElementById('editor-viewport')
      const cs = getComputedStyle(stage)
      const sr = stage.getBoundingClientRect()
      const cr = card.getBoundingClientRect()
      // `100vh` INSIDE the canvas, measured rather than assumed: the whole claim is that vh resolves to the device's
      // height. The probe is appended and removed in this one task, so nothing is ever observable on the page.
      const probe = f.contentDocument.createElement('div')
      probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:100vh;pointer-events:none;visibility:hidden'
      f.contentDocument.body.append(probe)
      const vh = probe.getBoundingClientRect().height
      probe.remove()
      return {
        // innerWidth/innerHeight, not clientWidth: the canvas scrolls internally, so a scrollbar is inside the viewport
        inner: { w: f.contentWindow.innerWidth, h: f.contentWindow.innerHeight },
        vh,
        // a media query inside the canvas answers at THAT width, which is the reason the CSS size is the device's
        narrow: f.contentWindow.matchMedia('(max-width: 600px)').matches,
        box: { w: f.offsetWidth, h: f.offsetHeight },
        attrW: f.dataset.width,
        transform: f.style.transform,
        chip: chip?.textContent ?? null,
        // R-138: the two boxes, in viewport coordinates, so the walk can assert they never meet
        chipBox: chip && (({ left, top, right, bottom }) => ({ left, top, right, bottom }))(chip.getBoundingClientRect()),
        cardBox: { left: cr.left, top: cr.top, right: cr.right, bottom: cr.bottom },
        chipCase: chip && getComputedStyle(chip).textTransform,
        chipEvents: chip && getComputedStyle(chip).pointerEvents,
        chipPressable: chip !== null && chip.closest('button, a, [role="button"], input') !== null,
        said: document.getElementById('editor-said')?.textContent ?? null,
        card: { w: cr.width, h: cr.height, radius: getComputedStyle(card).borderRadius, left: cr.left - sr.left, right: sr.right - cr.right, top: cr.top - sr.top, bottom: sr.bottom - cr.bottom, pad: parseFloat(cs.paddingTop), padBottom: parseFloat(cs.paddingBottom) },
        // the ROOM AVAILABLE — the stage's content box, which is what the fit is computed against
        stage: { w: sr.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), h: sr.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) },
      }
    })

    // ── step 54 — S4a's device track (`S4 Editor.dc.html:36-40`), at its drawn size, place and inks ──
    const track = await page.evaluate(() => {
      const el = document.getElementById('editor-device')
      if (!el) return null
      const sun = document.getElementById('editor-mode')
      const c = getComputedStyle(el)
      return {
        role: el.getAttribute('role'), label: el.getAttribute('aria-label'),
        bg: c.backgroundColor, radius: c.borderTopLeftRadius, pad: c.paddingTop,
        // "IMMEDIATELY right of the sun" (:35 then :36), read as document order and not as a coordinate
        afterSun: sun?.nextElementSibling?.id ?? null,
        buttons: [...el.querySelectorAll('button')].map((b) => {
          const s = getComputedStyle(b)
          const r = b.getBoundingClientRect()
          const svg = b.querySelector('svg')
          return {
            name: b.getAttribute('aria-label'), title: b.getAttribute('title'), role: b.getAttribute('role'),
            checked: b.getAttribute('aria-checked'), tab: b.tabIndex,
            w: Math.round(r.width), h: Math.round(r.height), radius: s.borderTopLeftRadius,
            bg: s.backgroundColor, shadow: s.boxShadow, ink: s.color,
            glyph: svg ? Math.round(svg.getBoundingClientRect().width) : 0, stroke: svg?.getAttribute('stroke-width') ?? null,
          }
        }),
      }
    })
    const onSeg = track?.buttons.filter((b) => b.checked === 'true') ?? []
    check('step 54 — S4a\'s device track sits IMMEDIATELY right of the sun and is a WAI-ARIA radio group, one per device in the frame\'s order', track?.afterSun === 'editor-device' && track.role === 'radiogroup' && track.label === 'Device' && track.buttons.map((b) => b.name).join(' | ') === LABELS.join(' | ') && track.buttons.every((b) => b.role === 'radio'), JSON.stringify({ afterSun: track?.afterSun, role: track?.role, names: track?.buttons.map((b) => b.name) }))
    check('step 54 — the pill: #EFECE7 (`paper-sunk`), an 8px radius and 2px of padding', track?.bg === 'rgb(239, 236, 231)' && track.radius === '8px' && track.pad === '2px', JSON.stringify({ bg: track?.bg, radius: track?.radius, pad: track?.pad }))
    check('step 54 — every segment is 28 x 26 at a 6px radius, carrying a 14px glyph at the house 1.5px stroke', track?.buttons.every((b) => b.w === 28 && b.h === 26 && b.radius === '6px' && b.glyph === 14 && b.stroke === '1.5'), JSON.stringify(track?.buttons.map((b) => [b.w, b.h, b.radius, b.glyph, b.stroke])))
    check('step 54 — the ACTIVE segment is Desktop, white with the frame\'s own shadow and the ink ink; every other is #6E6A64 on nothing', onSeg.length === 1 && onSeg[0].name === DEVICE.DESKTOP.label && onSeg[0].bg === 'rgb(255, 255, 255)' && /rgba\(28, 27, 26, 0\.06\) 0px 1px 2px/.test(onSeg[0].shadow) && onSeg[0].ink === 'rgb(28, 27, 26)' && track.buttons.filter((b) => b.checked !== 'true').every((b) => b.ink === 'rgb(110, 106, 100)' && b.bg === 'rgba(0, 0, 0, 0)'), JSON.stringify(track?.buttons.map((b) => [b.name, b.checked, b.bg, b.ink])))
    check('step 54 — R-136\'s carve-out: each segment carries its word as its accessible name AND as its hover title, because a 48px bar cannot hold three', track?.buttons.every((b) => b.title === b.name && LABELS.includes(b.name)), JSON.stringify(track?.buttons.map((b) => [b.name, b.title])))
    check('step 54 — ONE Tab stop for the whole group, on the value in force (the Kit\'s `tabStop`, reused rather than rewritten)', track?.buttons.filter((b) => b.tab === 0).length === 1 && (track.buttons.find((b) => b.tab === 0) ?? {}).checked === 'true', JSON.stringify(track?.buttons.map((b) => [b.name, b.tab])))

    // ── step 55 — each device IS a viewport: the frame's CSS pixels, `100vh`, the media query, the card and the chip ──
    // FR-D14 and `prd.md:569`: the CSS size is the device's own and the fit is a transform OVER it, so nothing here
    // can change which breakpoint applies inside the canvas.
    // Desktop LAST, so every press in this loop is a real change and each one's announcement is a result
    for (const d of [...DEVICE.DEVICES.slice(1), DEVICE.DEVICES[0]]) {
      await deviceButton(d.name).click()
      await page.waitForTimeout(400)
      const v = await viewportNow()
      // `fitFor` reads width/height: handed `{ w, h }` it answers 1 for every stage, and every fit check below fails on a
      // correct product (review, 2026-09-19)
      const fit = DEVICE.fitFor({ width: v.stage.w, height: v.stage.h }, d)
      check(`step 55 — ${d.label}: the iframe's CSS viewport is ${d.width} x ${d.height} in BOTH axes, \`100vh\` resolves to ${d.height}, and \`data-width\` says so`, v.inner.w === d.width && v.inner.h === d.height && v.box.w === d.width && v.box.h === d.height && Math.round(v.vh) === d.height && v.attrW === String(d.width), JSON.stringify({ inner: v.inner, box: v.box, vh: v.vh, attrW: v.attrW }))
      // read as a NUMBER: the fit is a float, and a string compare would turn a 1e-15 measuring difference into a FAIL
      const scaled = /^scale\(([\d.]+)\)$/.exec(v.transform)
      check(`step 55 — ${d.label}: the only scale on it is a TRANSFORM — the fit of both axes, never a changed width`, scaled !== null && Math.abs(Number(scaled[1]) - fit) < 1e-6, `${v.transform} · want scale(${fit})`)
      check(`step 55 — ${d.label}: a media query inside the canvas answers at ${d.width}, not at the window's width`, v.narrow === (d.width <= 600), `(max-width: 600px) matched ${v.narrow} at ${d.width}`)
      check(`step 55 — ${d.label}: R-137's card is that viewport fitted — ${d.width} x ${d.height} at the fit, centred in the ground with a 6px radius on all four corners`, Math.abs(v.card.w - d.width * fit) < 1 && Math.abs(v.card.h - d.height * fit) < 1 && v.card.radius === '6px' && Math.abs((v.card.top - v.card.pad) - (v.card.bottom - v.card.padBottom)) < 1.5 && v.card.bottom >= v.card.padBottom - 0.5 && v.card.padBottom > 0 && Math.abs(v.card.left - v.card.right) < 1.5, JSON.stringify(v.card))
      check(`step 55 — ${d.label}: UX-DR17's chip reads the TRUE SIZE first and the shrinking second, uppercased in CSS so the sentence is what is read out`, v.chip === DEVICE.viewportWords(d, fit) && v.chipCase === 'uppercase', `${JSON.stringify(v.chip)} · want ${JSON.stringify(DEVICE.viewportWords(d, fit))} · ${v.chipCase}`)
      check(`step 55 — ${d.label}: the change is announced politely through the editor's ONE live region`, v.said === DEVICE.deviceShown(d), `${JSON.stringify(v.said)} · want ${JSON.stringify(DEVICE.deviceShown(d))}`)
      check(`step 55 — ${d.label}: the fit is capped at 1 and the whole viewport is in shot in both axes`, fit > 0 && fit <= 1 && v.card.w <= v.stage.w + 1 && v.card.h <= v.stage.h + 1, JSON.stringify({ fit, card: [v.card.w, v.card.h], stage: [v.stage.w, v.stage.h] }))
      // R-138 (owner, 2026-09-19), and it is the INVARIANT that is asserted, never the two offsets that deliver it:
      // the chip is pinned to the stage's corner while the card moves, so before the ruling a height-bound card rose
      // under it — Tablet by 5px on a 1440 x 900 laptop, and folded Desktop to within 4px. The chip tucked to 4px/4px
      // and the stage's 32px of top padding are the remedy TOGETHER; either alone leaves a case that touches.
      const clear = v.chipBox && v.cardBox ? v.cardBox.top - v.chipBox.bottom : null
      check(`step 55 — ${d.label}: R-138 — the chip NEVER overlaps the page card, and the card's top edge clears it`, v.chipBox !== null && !(v.chipBox.left < v.cardBox.right && v.chipBox.right > v.cardBox.left && v.chipBox.top < v.cardBox.bottom && v.chipBox.bottom > v.cardBox.top) && clear > 0, `chip ${JSON.stringify(v.chipBox)} · card ${JSON.stringify(v.cardBox)} · clearance ${clear}px`)
      check(`step 55 — ${d.label}: NOTHING SETS THE SCALE — the chip is pointer-transparent and is in no button (UX-DR17, UX-DR20)`, v.chipEvents === 'none' && v.chipPressable === false, JSON.stringify({ events: v.chipEvents, pressable: v.chipPressable }))
    }
    // B11's drawn "Fit / 55%" picker is NOT built: nothing pressable in the editor offers a scale
    const zoomControls = await page.evaluate(() => [...document.querySelectorAll('button, a, input, select, [role="button"], [role="slider"], [role="radio"]')]
      .map((el) => `${el.getAttribute('aria-label') ?? ''} ${el.textContent ?? ''}`.trim())
      .filter((t) => /\bzoom\b|\bfit\b|\d+\s?%/i.test(t)))
    check('step 55 — UX-DR17/UX-DR20: there is NO zoom, fit or percentage control anywhere in the editor — the chip reports and nothing sets', zoomControls.length === 0, zoomControls.join(' · '))

    // ── step 56 — the fit recomputes when THE ROOM changes; the true size does not ──
    // Desktop, because on this 1440 stage Desktop is the width-bound one: folding Layers gives the fit 196px more to
    // work with, which is exactly what the chip exists to report.
    await deviceButton(DEVICE.DESKTOP.name).click()
    await page.waitForTimeout(400)
    const beforeFold = await viewportNow()
    await canvasFrame().evaluate(() => { window.__nodes = [...document.querySelectorAll('#canvas > *')] })
    await page.getByRole('button', { name: 'Collapse layers' }).click()
    await page.waitForTimeout(400)
    const afterFold = await viewportNow()
    const pctOf = (chip) => Number(/(\d+)%/.exec(chip ?? '')?.[1] ?? NaN)
    const sizeOf = (chip) => /viewport \d+ × \d+/i.exec(chip ?? '')?.[0] ?? null
    check('step 56 — a fold gives the canvas more room: the card grows, the chip\'s percentage goes UP, and the TRUE SIZE in front of it does not move', afterFold.stage.w > beforeFold.stage.w && afterFold.card.w > beforeFold.card.w && pctOf(afterFold.chip) > pctOf(beforeFold.chip) && sizeOf(afterFold.chip) === sizeOf(beforeFold.chip) && sizeOf(beforeFold.chip) !== null, `${JSON.stringify(beforeFold.chip)} → ${JSON.stringify(afterFold.chip)}`)
    check('step 56 — and the frame\'s CSS viewport did NOT move with it: the room changed, the device did not', afterFold.inner.w === DEVICE.DESKTOP.width && afterFold.inner.h === DEVICE.DESKTOP.height, JSON.stringify(afterFold.inner))
    check('step 56 — a re-fit is NOT a repaint: every section root is still the same node', await canvasFrame().evaluate(() => [...document.querySelectorAll('#canvas > *')].every((el, n) => el === window.__nodes[n])))
    // R-138's nearest miss was a FOLDED Desktop (4px, before the ruling), so the invariant is read here too (review)
    check('step 56 — R-138 with Layers folded: the larger card still clears the chip', afterFold.chipBox !== null && afterFold.cardBox.top - afterFold.chipBox.bottom > 0, `${afterFold.chipBox && afterFold.cardBox.top - afterFold.chipBox.bottom}px`)
    // R-139: the owner's "I do not see the desktop floating" — a folded Desktop is the state he was looking at
    check('step 56 — R-139 with Layers folded: Desktop still ends a full bottom padding above the window\'s edge', afterFold.card.padBottom > 0 && afterFold.card.bottom >= afterFold.card.padBottom - 0.5, JSON.stringify(afterFold.card))
    await page.getByRole('button', { name: 'Show layers' }).click()
    await page.waitForTimeout(400)

    // ── step 57 — A DEVICE CHANGE IS A STYLE CHANGE, NEVER A REPAINT ──
    await clickOn(GRID)
    await canvasFrame().evaluate(() => {
      window.__nodes = [...document.querySelectorAll('#canvas > *')]
      document.scrollingElement.scrollTo(0, 240)
    })
    await page.waitForTimeout(250)
    const scrolledWas = await canvasFrame().evaluate(() => Math.round(document.scrollingElement.scrollTop))
    const stampsBefore = await canvasFrame().evaluate(() => document.querySelectorAll('[data-inflozo-prop], [data-inflozo-ghost]').length)
    const rootsBefore = await canvasFrame().evaluate(() => document.querySelectorAll('#canvas > *').length)
    await deviceButton(DEVICE.MOBILE.name).click()
    await page.waitForTimeout(500)
    const changed = await canvasFrame().evaluate(() => ({
      same: [...document.querySelectorAll('#canvas > *')].every((el, n) => el === window.__nodes[n]),
      roots: document.querySelectorAll('#canvas > *').length,
      selected: document.querySelectorAll('[data-inflozo-selected]').length,
      scroll: Math.round(document.scrollingElement.scrollTop),
      // the stamps are LIFTED into memory at each paint and never painted, so a repaint would put a fresh set on the
      // page and this count would rise off zero
      stamped: document.querySelectorAll('[data-inflozo-prop], [data-inflozo-ghost]').length,
    }))
    check('step 57 — pressing a device REPAINTS NOTHING: every section root is the same node object, and the selection and its mark survive', changed.same && changed.roots === rootsBefore && changed.selected === 1, JSON.stringify(changed))
    check('step 57 — the stamps are untouched, because the canvas DOM is untouched (a repaint would re-stamp and lift them again)', changed.stamped === stampsBefore && stampsBefore === 0, `${changed.stamped} · was ${stampsBefore}`)
    // NO SCROLL RESTORATION is the story's own rule — re-laying the page out at 390 moves the scroll and nothing
    // invents a policy for it. What must not happen is the canvas jumping back to the top, which a reload would do.
    check('step 57 — the canvas did not jump back to the top (the frame was never reloaded)', changed.scroll > 0 && scrolledWas > 0, `${changed.scroll} · was ${scrolledWas}`)
    const selectedAfter = await onScreen(GRID)
    const outlineAfter = await boxNow('selected')
    check('step 57 — the chrome re-places on the next frame: the selected outline is back over its root at the new fit', outlineAfter !== null && Math.abs(outlineAfter.left - selectedAfter.x) < 2 && Math.abs(outlineAfter.top - selectedAfter.y) < 2, JSON.stringify({ box: outlineAfter && [outlineAfter.left, outlineAfter.top], root: [selectedAfter.x, selectedAfter.y] }))

    // the caret, which is the reason `DeviceSwitch` prevents its own mousedown: a press that took focus out of the
    // canvas would end the edit through `inline.ts`'s focusout, and the roots-are-the-same-node read cannot see that
    await deviceButton(DEVICE.DESKTOP.name).click()
    await page.waitForTimeout(400)
    await caretInto(GRID, TITLE)
    const caretHere = () => canvasFrame().evaluate(() => ({ editable: document.activeElement?.isContentEditable === true, offset: document.getSelection()?.focusOffset ?? null }))
    const caretWas = await caretHere()
    await deviceButton(DEVICE.TABLET.name).click()
    await page.waitForTimeout(400)
    const caretIs = await caretHere()
    const tabletNow = await viewportNow()
    check('step 57 — a caret mid-word SURVIVES a device change: still editing, the same offset, and the device did change', caretWas.editable && caretIs.editable && caretWas.offset > 0 && caretIs.offset === caretWas.offset && tabletNow.inner.w === DEVICE.TABLET.width, `${JSON.stringify(caretWas)} → ${JSON.stringify(caretIs)} · ${tabletNow.inner.w}`)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)

    // ── step 58 — R-123 on a LETTERBOXED card: the ground beside it is still nothing ──
    await deviceButton(DEVICE.MOBILE.name).click()
    await page.waitForTimeout(400)
    await clickOn(GRID)
    // the control: without a selection to lose, "deselected" below is vacuous (review)
    const selectedFirst = (await onScreen(GRID)).selected
    const letterbox = await page.evaluate(() => {
      const stage = document.querySelector('section[aria-label="Canvas"]')
      const s = stage.getBoundingClientRect()
      const card = stage.firstElementChild.getBoundingClientRect()
      return { x: (s.left + card.left) / 2, y: card.top + card.height / 2, room: card.left - s.left }
    })
    await page.mouse.click(letterbox.x, letterbox.y)
    await page.waitForTimeout(400)
    const afterLetterbox = await panelOf()
    check('step 58 — R-123: with a phone-shaped card there is real ground each side, and a press on it deselects exactly as the ground below the last section does', letterbox.room > 100 && selectedFirst && !(await onScreen(GRID)).selected && afterLetterbox.label === 'Page settings' && afterLetterbox.empty, `${JSON.stringify(letterbox)} · ${JSON.stringify(afterLetterbox.label)}`)

    // ── step 59 — the keyboard: one Tab stop, the arrows move the choice ──
    await page.locator('#editor-device button[tabindex="0"]').focus()
    const arrowed = []
    for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft']) {
      await page.keyboard.press(key)
      await page.waitForTimeout(350)
      arrowed.push(await page.evaluate(() => {
        const on = document.querySelector('#editor-device button[aria-checked="true"]')
        return { device: on?.dataset.device ?? null, focused: document.activeElement === on, width: document.querySelector('section[aria-label="Canvas"] iframe').offsetWidth }
      }))
    }
    const order = DEVICE.DEVICES.map((d) => d.name)
    const from = order.indexOf(DEVICE.MOBILE.name)
    const want = [order[(from + 1) % order.length], order[(from + 2) % order.length], order[(from + 1) % order.length]]
    check('step 59 — the Kit\'s `radioKeys`: the arrows move the device without the mouse, the focus follows the choice, and the canvas resizes with it', arrowed.map((a) => a.device).join(' → ') === want.join(' → ') && arrowed.every((a) => a.focused) && arrowed.every((a, i) => a.width === DEVICE.DEVICES.find((d) => d.name === want[i]).width), JSON.stringify(arrowed) + ' · want ' + want.join(' → '))
    await deviceButton(DEVICE.DESKTOP.name).click()
    await page.waitForTimeout(400)

    // ── step 60 — FR-D14: NOTHING CAPS SECTIONS, and a device change blocks the main thread for no more than 5s ──
    // The fixture is planted through the service key, because 40 sections are not a gesture anybody makes. Its 40
    // instances are the seeded stack cycled with fresh ids, so every design is one this project already reads.
    // NFR-1's 60fps / p95 / 50ms gate is NOT owed here — it is manual-only on the reference laptop at 4x throttle and
    // is Story 5.23's. The 5s LOCKUP BOUND is FR-D14's own pass/fail condition and is measurable, so it is owed here.
    const homeBefore = await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)
    const homeDoc = homeBefore.body?.[0]?.doc ?? null
    const FIXTURE = 40
    const rootsAtSeed = await canvasFrame().evaluate(() => document.querySelectorAll('#canvas > *').length)
    const big = JSON.parse(JSON.stringify(homeDoc))
    // `hidden: false` on every one: a hidden instance renders '' and has no root, so leaving the flag as it is would
    // make the expectation below depend on what an earlier step hid
    big.instances = Array.from({ length: FIXTURE }, (_, i) => ({ ...homeDoc.instances[i % homeDoc.instances.length], instanceId: crypto.randomUUID(), layerName: `Section ${i + 1}`, hidden: false }))
    // the editor goes FIRST, for step 52's reason: a departing page's flush would land on top of the fixture. After
    // `rootsAtSeed`, which needs the live canvas.
    await leaveEditor()
    const planted = await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home`, { method: 'PATCH', body: JSON.stringify({ doc: big }) })
    check(`step 60 — a ${FIXTURE}-section doc is planted through the service key (40 sections are not a gesture anybody makes)`, planted.status === 200 || planted.status === 204, `HTTP ${planted.status}`)
    // `dropLocal`, NOT `freshLoad`: the 40-section fixture IS the stored doc for this step, and `freshLoad` puts the
    // seed back over it. The device copy still goes, so the hydrate reads the plant (§AD1.1's third row).
    await dropLocal()
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    // `buffered`, so the 40-section LOAD is in the buffer too — the AC is "loads and changes device" (review). And THE
    // CONTROL: an 80ms busy loop on a timer (the page's own task, never the evaluate's) must be recorded, or a longest
    // of 0ms is an observer that saw nothing and not a result (standing rule 2).
    await page.evaluate(() => new Promise((done) => {
      window.__long = []
      window.__obs = new PerformanceObserver((list) => window.__long.push(...list.getEntries().map((e) => e.duration)))
      window.__obs.observe({ type: 'longtask', buffered: true })
      setTimeout(() => { const t = performance.now(); while (performance.now() - t < 80); setTimeout(done, 100) }, 0)
    }))
    check('step 60 — control: the long-task observer records a deliberate 80ms task, so a small longest below is a measurement', await page.evaluate(() => window.__long.some((d) => d >= 50)), await page.evaluate(() => window.__long.map(Math.round).join(' ')))
    const bigRoots = await canvasFrame().evaluate(() => document.querySelectorAll('#canvas > *').length)
    await deviceButton(DEVICE.MOBILE.name).click()
    await page.waitForTimeout(1500)
    await deviceButton(DEVICE.DESKTOP.name).click()
    await page.waitForTimeout(1500)
    const longest = await page.evaluate(() => { window.__obs.disconnect(); return Math.max(0, ...window.__long) })
    // DERIVED from what is actually on this canvas: the roots the seed drew, less Home's own drawn instances, plus 40
    const bigStack = rootsAtSeed - homeDoc.instances.filter((i) => !i.hidden).length + FIXTURE
    check(`step 60 — FR-D14: NOTHING CAPS SECTIONS PER TEMPLATE — all ${FIXTURE} planted sections plus the site-wide ones are drawn`, bigRoots === bigStack, `${bigRoots} roots · want ${bigStack}`)
    check('step 60 — FR-D14\'s lockup bound: no main-thread task over 5s while a device change lands on that canvas (slower is acceptable, a lockup is not)', longest < 5000, `longest long task ${Math.round(longest)}ms`)
    note('step 60', `NFR-1's 60fps / p95 <= 16.7ms / no-task-over-50ms gate is NOT asserted here — manual-only at 4x throttle on the reference laptop, Story 5.23 (longest task this run: ${Math.round(longest)}ms)`)
    // the fixture is put back before anything else reads this canvas
    const restored = await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home`, { method: 'PATCH', body: JSON.stringify({ doc: homeDoc }) })
    check('step 60 — the planted fixture is removed and Home is the doc it was, so every later step reads the seed', (restored.status === 200 || restored.status === 204) && JSON.stringify((await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)).body?.[0]?.doc) === JSON.stringify(homeDoc), `HTTP ${restored.status}`)

    // ── Story 5.8's steps, inside step 5's CSP session ────────────────────────────────────────────────────────────
    //
    // THE SESSION IS RESET FIRST, and both halves matter. The steps above have been editing this canvas for several
    // minutes and every one of those edits is now journalled and pending — which is the story working, and which would
    // make every expectation below depend on what step 43 happened to type. So the home doc goes back to the seed, the
    // revision goes back to 0 through the service key (the only thing that may set it backwards), and the browser's own
    // database for this user is deleted. From here the walk stands on a known base.
    //
    // Every label, depth and interval below is READ FROM `lib/journal.ts` — the module the app itself uses — so a
    // default the Architect moves changes this walk with it and is never restated here (standing rule 4).
    const JOURNAL58 = await import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/journal.ts')).href)
    // R-144 split the resting state in two, so there are two resting names and the walk reads both
    const SYNCED58 = JOURNAL58.labelOf({ kind: 'rest', owed: false })
    const OWED58 = JOURNAL58.labelOf({ kind: 'rest', owed: true })
    const FALLBACK_LABEL58 = JOURNAL58.labelOf({ kind: 'fallback' })

    const revisionNow58 = async () => (await call('/rest/v1', `/projects?id=eq.${P}&select=revision`)).body?.[0]?.revision ?? null
    const homeDocNow58 = async () => (await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)).body?.[0]?.doc ?? null
    // THE REVISION IS NOT PUT BACK, and it cannot be: `guard_revision` makes it monotonic against EVERY writer, the
    // service role included (`schema:1292-1303`). By the time this walk reaches here the 3-minute timer has legitimately
    // flushed at least once, so whatever the revision is now is this walk's baseline and step 66 measures its move from
    // there. Only the LOCAL database is reset, which is all these steps need: every expectation below is read off the
    // screen rather than off the seed.
    await freshLoad()
    const seedRevision58 = await revisionNow58()
    check('step 61 — the local database is dropped and the editor hydrates from the cloud: both arrows asleep, the revision read as this walk\'s baseline', Number.isInteger(seedRevision58) && (await page.locator('#editor-undo').getAttribute('aria-disabled')) === 'true', `revision ${seedRevision58}`)

    /** B6's indicator and S4a's arrows, as the bar actually draws them. */
    const topBarNow = () => page.evaluate(() => {
      const ind = document.querySelector('#editor-save-state [role="status"]')
      // R-142: the state is an icon in a filled circle now, and `data-sync-state` is the circle naming itself
      const circle = document.querySelector('#editor-save-state [data-sync-state]')
      const glyph = circle?.querySelector('svg')
      const undo = document.getElementById('editor-undo')
      const redo = document.getElementById('editor-redo')
      const box = (el) => el && (({ width, height }) => ({ w: Math.round(width), h: Math.round(height) }))(el.getBoundingClientRect())
      const history = document.getElementById('editor-history')
      const saveState = document.getElementById('editor-save-state')
      return {
        label: ind?.textContent ?? null,
        state: circle?.getAttribute('data-sync-state') ?? null,
        // the hover name, which is where B6's words went (R-142)
        title: circle?.getAttribute('title') ?? null,
        fill: circle && getComputedStyle(circle).backgroundColor,
        circle: box(circle),
        radius: circle && getComputedStyle(circle).borderRadius,
        // THE GLYPH ITSELF, by its own path data — so a state that silently lost its icon, or two states that
        // came to share one, fail here rather than passing on the colour alone (which is the whole of R-142)
        glyphPaths: glyph ? [...glyph.querySelectorAll('path')].map((x) => x.getAttribute('d')).join(' | ') : null,
        glyphColour: glyph && getComputedStyle(glyph).color,
        // B6's note survives both rulings: "never a spinner". Nothing here may animate.
        spinners: [...document.querySelectorAll('#editor-save-state *')].filter((el) => {
          const c = getComputedStyle(el)
          return c.animationName !== 'none' || c.transitionProperty.includes('transform')
        }).length,
        // R-143: the pair sits immediately AFTER the indicator now, not after the device track
        afterSaveState: saveState?.nextElementSibling?.id ?? null,
        afterTrack: document.getElementById('editor-device')?.nextElementSibling?.id ?? null,
        gap: history && getComputedStyle(history).columnGap,
        undo: undo && { ...box(undo), radius: getComputedStyle(undo).borderTopLeftRadius, opacity: getComputedStyle(undo).opacity, disabled: undo.getAttribute('aria-disabled'), label: undo.getAttribute('aria-label'), tabbable: undo.tabIndex >= 0 },
        redo: redo && { ...box(redo), radius: getComputedStyle(redo).borderTopLeftRadius, opacity: getComputedStyle(redo).opacity, disabled: redo.getAttribute('aria-disabled'), label: redo.getAttribute('aria-label'), tabbable: redo.tabIndex >= 0 },
        panel: document.getElementById('editor-retrying') !== null,
      }
    })

    // ── step 61 — R-142's circle, R-144's green rest, and R-143's moved pair ──
    // The GLYPH is asserted by its own path data, read out of `packages/library/icons/tabler.json` — the file the
    // component was generated from — so the five states cannot silently come to share an icon, which is the one
    // way R-142's guarantee could rot (standing rule 4: derived, never retyped).
    const TABLER58 = JSON.parse(require('node:fs').readFileSync(path.join(REPO, 'packages/library/icons/tabler.json'), 'utf8')).icons
    const glyph58 = (n) => TABLER58[n].outline.filter(([el]) => el === 'path').map(([, a]) => a.d).join(' | ')
    const topBar = await topBarNow()
    check('step 61 — R-144: with nothing owed the indicator rests GREEN and says Synced — not the grey it showed before the ruling',
      topBar.state === SYNCED58 && topBar.fill === 'rgb(21, 122, 88)' && topBar.label === SYNCED58, JSON.stringify(topBar))
    // the radius is DERIVED, not written down: `rounded-full` is this project's 24px pill alias and NOT Tailwind's
    // infinite radius (DESIGN.md's own note), so what makes it round is the radius reaching half the box — which
    // stays true whatever the token is set to (standing rule 4)
    check('step 61 — R-142: it is a 16px CIRCLE carrying Tabler `check` in white, and its name is on the hover',
      topBar.circle?.w === 16 && topBar.circle?.h === 16 && parseFloat(topBar.radius ?? '0') >= topBar.circle.w / 2 && topBar.glyphPaths === glyph58('check') && topBar.glyphColour === 'rgb(255, 255, 255)' && topBar.title === SYNCED58, JSON.stringify(topBar))
    check('step 61 — B6\'s note survives both rulings: NOTHING in the indicator animates or spins', topBar.spinners === 0, String(topBar.spinners))
    check('step 61 — R-143: the undo/redo pair sits immediately AFTER the indicator, and no longer after the device track',
      topBar.afterSaveState === 'editor-history' && topBar.afterTrack !== 'editor-history', JSON.stringify({ afterSaveState: topBar.afterSaveState, afterTrack: topBar.afterTrack }))
    check('step 61 — and the buttons themselves are still S4a:41-43\'s: two 28 × 28, 8px radius, 2px apart',
      topBar.gap === '2px' && topBar.undo?.w === 28 && topBar.undo?.h === 28 && topBar.undo?.radius === '8px' && topBar.redo?.w === 28 && topBar.redo?.h === 28, JSON.stringify(topBar))
    check('step 61 — nothing to undo or redo yet: both at opacity .35, both aria-disabled and both still in the tab order (never `disabled`)',
      topBar.undo?.opacity === '0.35' && topBar.redo?.opacity === '0.35' && topBar.undo?.disabled === 'true' && topBar.redo?.disabled === 'true' && topBar.undo?.tabbable && topBar.redo?.tabbable, JSON.stringify(topBar))
    check('step 61 — B6\'s panel exists in NO state but Retrying', topBar.panel === false, JSON.stringify(topBar))

    // ── step 62 — one gesture wakes undo, and the indicator keeps its resting claim ──
    // ONE EDIT THE SPEC'S OWN MATRIX NAMES: a section deleted through the Layers row's menu, which is many operations
    // and exactly one transaction (AD-16). Its layer name is read back afterwards, which is what proves the whole doc
    // came back and not a shape of it.
    // THE WALK'S OWN HELPERS, never a second selector: `pageNames` reads the Layers rows and `fromMenu` opens a row's
    // ⋯ and presses an item, both already used by Story 5.4's steps. `NEWS` is a PAGE row, so Delete asks nothing —
    // a site-wide one would open FR-D5's confirm, which is step 34's subject and not this one's.
    const namesNow58 = pageNames
    const before58 = await namesNow58()
    const victim58 = before58[NEWS]
    await fromMenu(NEWS, 'Delete')
    const afterDelete58 = await namesNow58()
    const afterEdit58 = await topBarNow()
    check('step 62 — one gesture removes the section and wakes undo; redo stays asleep',
      afterDelete58.length === before58.length - 1 && afterEdit58.undo?.disabled === null && afterEdit58.undo?.opacity === '1' && afterEdit58.redo?.disabled === 'true', `${before58.length} → ${afterDelete58.length} · ${JSON.stringify(afterEdit58)}`)
    check('step 62 — R-144: one edit turns the circle GREY with Tabler `clock` — the work is here and the server has not got it, which is the whole point of the ruling',
      afterEdit58.state === OWED58 && afterEdit58.fill === 'rgb(110, 106, 100)' && afterEdit58.glyphPaths === glyph58('clock') && afterEdit58.title === OWED58, JSON.stringify(afterEdit58))
    check('step 62 — and it is a different GLYPH, not only a different colour — R-142\'s whole guarantee', afterEdit58.glyphPaths !== glyph58('check'), afterEdit58.glyphPaths)

    // ── step 63 — the arrows: one press each way, for however many operations the gesture cost (AD-16) ──
    await page.locator('#editor-undo').click()
    await page.waitForTimeout(500)
    const undone58 = await namesNow58()
    check(`step 63 — ONE press of the left arrow brings "${victim58}" back, whole`, JSON.stringify(undone58) === JSON.stringify(before58), JSON.stringify(undone58))
    await page.locator('#editor-redo').click()
    await page.waitForTimeout(500)
    check('step 63 — ONE press of the right arrow takes it away again', JSON.stringify(await namesNow58()) === JSON.stringify(afterDelete58))

    // ── step 64 — R-141: ⌘Z and ⇧⌘Z do EXACTLY what the arrows do (one handler, not a second implementation) ──
    const CMD58 = process.platform === 'darwin' ? 'Meta' : 'Control'
    await page.locator('#editor-history').click({ position: { x: 1, y: 1 } }).catch(() => {})
    await page.keyboard.press(`${CMD58}+z`)
    await page.waitForTimeout(500)
    check('step 64 — R-141: ⌘Z undoes, identically to the arrow', JSON.stringify(await namesNow58()) === JSON.stringify(before58))
    await page.keyboard.press(`${CMD58}+Shift+z`)
    await page.waitForTimeout(500)
    check('step 64 — R-141: ⇧⌘Z redoes, identically to the arrow', JSON.stringify(await namesNow58()) === JSON.stringify(afterDelete58))
    // LEFT REDONE on purpose: steps 66 and 67 need a journal with something IN FORCE and something to undo

    // ── step 65 — ⌘Z is INERT with the caret in a text prop: Story 5.3's inline editing is untouched ──
    // The editor must do NOTHING here — the browser's own undo owns the words being typed. Through Story 5.3's own
    // helpers and on a section that really carries a stamped prop: `clickOn` selects, `caretInto` puts the caret in
    // Three Up's title exactly as step 16 does. The claim is NEGATIVE, so what is measured is the SECTION COUNT —
    // which ⌘Z would change if the editor had taken the key.
    await clickOn(GRID)
    await page.waitForTimeout(300)
    await caretInto(GRID, TITLE)
    await page.keyboard.type('ZZZ')
    await page.waitForTimeout(400)
    const typing58 = { sections: (await namesNow58()).length, words: await wordsOf(GRID, TITLE) }
    check('step 65 — control: the caret really is in a text prop and the letters went in', /ZZZ/.test(typing58.words ?? ''), JSON.stringify(typing58))
    await page.keyboard.press(`${CMD58}+z`)
    await page.waitForTimeout(600)
    const after58 = { sections: (await namesNow58()).length, words: await wordsOf(GRID, TITLE) }
    check('step 65 — R-141: with the caret in a text prop, \u2318Z does NOT undo the editor\'s last change — the section count is untouched and Story 5.3 keeps the gesture',
      after58.sections === typing58.sections, JSON.stringify({ after: after58, whileTyping: typing58 }))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)

    // ── step 66 — ⌘S: the flush, and the row is really there ──
    await page.locator('header').click({ position: { x: 2, y: 2 } }).catch(() => {})
    const labels58 = []
    const watching58 = page.evaluate(() => new Promise((done) => {
      const seen = []
      const el = document.querySelector('#editor-save-state [role="status"]')
      const obs = new MutationObserver(() => { const t = el.textContent; if (t !== seen[seen.length - 1]) seen.push(t) })
      obs.observe(el, { childList: true, subtree: true, characterData: true })
      setTimeout(() => { obs.disconnect(); done(seen) }, 8000)
    }))
    // read HERE and not at step 61: this walk is long enough for the 3-minute timer to have flushed in between, which
    // is the feature working and would otherwise make the +1 below arithmetic about the wrong number
    const beforeSave58 = await revisionNow58()
    await page.keyboard.press(`${CMD58}+s`)
    labels58.push(...(await watching58))
    const flushedRevision58 = await revisionNow58()
    const flushedDoc58 = await homeDocNow58()
    check('step 66 — ⌘S: the indicator passes through Syncing and lands on Synced, and never a spinner',
      labels58.includes(JOURNAL58.labelOf({ kind: 'syncing' })) && labels58.includes(SYNCED58), JSON.stringify(labels58))
    // B6's "Fades to the resting label after a few seconds" is read LIVE rather than off the recording: it is a state
    // the indicator RESTS in, so asking what it says NOW is the stronger question and cannot be missed by a mutation
    // frame that batched two changes into one.
    // R-144: there is no four-second fade any more. The flush empties `pending`, so the resting state simply
    // reads GREEN — and it STAYS green until the next edit, which is the state B6 could only show for 4s.
    const settled66 = await page.waitForFunction((synced) => document.querySelector('#editor-save-state [data-sync-state]')?.getAttribute('data-sync-state') === synced, SYNCED58, { timeout: 15000 }).then(() => true, () => false)
    const rested66 = await topBarNow()
    check('step 66 — R-144: after the save the circle goes GREEN and STAYS there — no timer, no fade back to grey',
      settled66 && rested66.state === SYNCED58 && rested66.glyphPaths === glyph58('check'), JSON.stringify(rested66))
    check('step 66 — and it really wrote: projects.revision advanced by exactly one and the stored doc is the edited one',
      flushedRevision58 === beforeSave58 + 1 && Array.isArray(flushedDoc58?.instances), `revision ${beforeSave58} → ${flushedRevision58} · ${flushedDoc58?.instances?.length} instances`)

    // ── step 66b — THE REVIEW'S FINDING: a TAB SWITCH is `hidden` too, and the editor must not conflict with itself ──
    // Undo then redo is an edit that owes something and leaves the document exactly as it was, so steps 67-69 read
    // the same names. `visibilityState` is overridden because a headless page never really hides.
    const owe58 = async () => {
      await page.locator('#editor-undo').click(); await page.waitForTimeout(350)
      await page.locator('#editor-redo').click(); await page.waitForTimeout(350)
    }
    const stateIs58 = (want) => page.waitForFunction((w) => document.querySelector('#editor-save-state [data-sync-state]')?.getAttribute('data-sync-state') === w, want, { timeout: 15000 }).then(() => true, () => false)
    const beforeHide58 = await revisionNow58()
    await owe58()
    const owedBeforeHide58 = (await topBarNow()).state
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    const hidSynced58 = await stateIs58(SYNCED58)
    await page.evaluate(() => { delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange')) })
    check('step 66b — hiding the tab with an edit owed sends it, and the editor HEARS the answer: grey, then green',
      owedBeforeHide58 === OWED58 && hidSynced58 && (await revisionNow58()) === beforeHide58 + 1, `${owedBeforeHide58} → synced ${hidSynced58} · revision ${beforeHide58} → ${await revisionNow58()}`)
    await owe58()
    await page.keyboard.press(`${CMD58}+s`)
    const backSynced58 = await stateIs58(SYNCED58)
    const selfConflict58 = await page.locator('dialog[open]').count()
    check('step 66b — and the next ⌘S after coming back is an ordinary save: no "changed somewhere else" against its own write',
      backSynced58 && selfConflict58 === 0 && (await revisionNow58()) === beforeHide58 + 2, `dialogs ${selfConflict58} · revision → ${await revisionNow58()}`)

    // ── step 66c — the sync route's own refusals, asked directly from the signed-in page ──
    const post58 = (body) => page.evaluate(async ([b, id]) => {
      const r = await fetch(`${location.pathname.startsWith('/app/') ? '/app' : ''}/projects/${id}/sync`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) })
      return r.status
    }, [body, P])
    const rev66c = await revisionNow58()
    const doc66c = await homeDocNow58()
    const stale66c = await post58({ base: rev66c - 1, docs: { home: { ...doc66c, instances: [] } } })
    const bad66c = await post58({ base: rev66c, docs: { home: { nonsense: true } } })
    const key66c = await post58({ base: rev66c, docs: { 'custom:nope': doc66c } })
    const already66c = await post58({ base: rev66c - 1, docs: { home: doc66c } })
    check('step 66c — a stale base with a DIFFERENT doc is a 409, a doc the schema refuses and a key the table refuses are 422s, and none of them wrote',
      stale66c === 409 && bad66c === 422 && key66c === 422 && (await revisionNow58()) === rev66c && JSON.stringify(await homeDocNow58()) === JSON.stringify(doc66c), JSON.stringify({ stale66c, bad66c, key66c }))
    check('step 66c — a stale base carrying EXACTLY what the server holds is not a conflict: 200, and still nothing written (the control is the 409 above)',
      already66c === 200 && (await revisionNow58()) === rev66c, `HTTP ${already66c}`)

    // ── step 67 — FR-D9's whole promise: the work AND the history survive a reload ──
    // SINCE THE REVIEW it reloads WITH AN EDIT OWED, which is what a person does: the reload itself fires the tab-close
    // flush, the revision moves under the page, and the journal used to be cleared for it.
    await owe58()
    const namesBeforeReload58 = await namesNow58()
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    const afterReload58 = { names: await namesNow58(), topBar: await topBarNow() }
    check('step 67 — a reload comes back to the LOCAL document, not the cloud one (the revisions agree, so both survive)',
      JSON.stringify(afterReload58.names) === JSON.stringify(namesBeforeReload58), JSON.stringify(afterReload58.names))
    check('step 67 — and the history survived with it: the left arrow is awake and the right one sleeps — the journal kept its entries AND its pointer', afterReload58.topBar.undo?.disabled === null && afterReload58.topBar.redo?.disabled === 'true', JSON.stringify(afterReload58.topBar))
    // FR-D9'S WHOLE PROMISE, walked rather than asserted in one press: the head of the journal after step 65 is the
    // TYPING, so the first presses take letters back off the title and the deletion is further down. Undo is pressed
    // until the section returns — which is exactly what the owner's manual test does, and what "the arrow still brings
    // it back with everything you had typed into it" means. The bound is the journal's own depth, read from the module.
    let reachedBack58 = await namesNow58()
    let presses58 = 0
    while (reachedBack58.length <= namesBeforeReload58.length && presses58 < JOURNAL58.DEPTH) {
      if ((await page.locator('#editor-undo').getAttribute('aria-disabled')) === 'true') break
      await page.locator('#editor-undo').click()
      await page.waitForTimeout(350)
      reachedBack58 = await namesNow58()
      presses58 += 1
    }
    check('step 67 — FR-D9: undo reaches THROUGH the reload and brings the deleted section back, with everything that was typed after it',
      reachedBack58.length === namesBeforeReload58.length + 1 && reachedBack58.includes(victim58), `${presses58} presses · ${JSON.stringify(reachedBack58)}`)

    // ── step 68 — §AD1.1's second row: another writer moves the revision, and the journal is CLEARED ──
    // The service role is the second writer — the only role that may set `revision` to anything at all — which is
    // exactly what a second tab's flush looks like to this one.
    const moved58 = await call('/rest/v1', `/projects?id=eq.${P}`, { method: 'PATCH', body: JSON.stringify({ revision: (await revisionNow58()) + 1 }) })
    check('step 68 — a second writer advances projects.revision', moved58.status === 200 || moved58.status === 204, `HTTP ${moved58.status}`)
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    const cleared58 = await topBarNow()
    check('step 68 — AD-15: the cloud doc replaces the local one and the JOURNAL IS CLEARED — both arrows are asleep again',
      cleared58.undo?.disabled === 'true' && cleared58.redo?.disabled === 'true', JSON.stringify(cleared58))
    check('step 68 — and the canvas shows the CLOUD document: the section ⌘S sent is the one on screen',
      JSON.stringify(await namesNow58()) === JSON.stringify(namesBeforeReload58), JSON.stringify(await namesNow58()))

    // ── step 69 — B6's Retrying panel: ONE control (R-140), and Retry now recovers ──
    // The connection is failed at the route rather than at the network, so nothing else in the session is affected and
    // the failure is exactly the one the editor must survive: the flush cannot reach the server.
    await page.route('**/projects/*/sync', (r) => r.abort('failed'))
    // HIDE rather than Delete, and on `GRID`: this step needs ONE unsynced edit and nothing about which one. Three Up
    // is on the canvas whatever steps 62 to 68 left behind, where the Newsletter row may be deleted or restored.
    await fromMenu(GRID, 'Hide')
    await page.keyboard.press(`${CMD58}+s`)
    await page.waitForFunction(() => /Retrying/.test(document.querySelector('#editor-save-state [role="status"]')?.textContent ?? ''), null, { timeout: 15000 })
    const panel58 = await page.evaluate(() => {
      const el = document.getElementById('editor-retrying')
      if (!el) return null
      const cs = getComputedStyle(el)
      const controls = [...el.querySelectorAll('button, a, [role="button"]')]
      return {
        fill: cs.backgroundColor, radius: cs.borderTopLeftRadius, padding: `${cs.paddingTop} ${cs.paddingLeft}`,
        // B6's own note: "its first sentence is the reassurance rather than the error"
        first: el.children[0]?.textContent ?? null,
        reassurance: el.children[1]?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
        controls: controls.map((c) => c.textContent.replace(/\s+/g, ' ').trim()),
        // since R-142 the countdown has nowhere to be printed, so it rides in the NAME — the hover and the
        // announcement both carry it, and this reads both
        label: document.querySelector('#editor-save-state [role="status"]')?.textContent ?? null,
        title: document.querySelector('#editor-save-state [data-sync-state]')?.getAttribute('title') ?? null,
        glyphPaths: [...(document.querySelector('#editor-save-state [data-sync-state] svg')?.querySelectorAll('path') ?? [])].map((x) => x.getAttribute('d')).join(' | '),
        spinners: el.querySelectorAll('[class*="animate"]').length,
      }
    })
    check('step 69 — B6: the panel opens on Retrying, at the frame\'s own fill, radius and padding, with the countdown in the HOVER and the state ALONE in the live region (the review: a countdown in `role=status` is announced every second)',
      panel58 && panel58.fill === 'rgb(253, 236, 236)' && panel58.radius === '10px' && panel58.padding === '11px 12px' && panel58.label === 'Retrying' && /Retrying · \d+s/.test(panel58.title ?? ''), JSON.stringify(panel58))
    check('step 69 — R-142: and the circle wears Tabler `exclamation-mark` — its own glyph, not a recoloured one',
      panel58?.glyphPaths === glyph58('exclamation-mark'), panel58?.glyphPaths)
    check('step 69 — B6: its first line counts the attempt and its SECOND is the reassurance, never the error',
      /^Retrying, \w+ attempt$/.test(panel58?.first ?? '') && /^Your work is safe on this device\./.test(panel58?.reassurance ?? ''), JSON.stringify(panel58))
    check('step 69 — R-140 (owner, 2026-09-19): the panel carries "Retry now" AND NO SECOND CONTROL — "Download a copy" is ABSENT, never greyed',
      panel58?.controls.length === 1 && /^Retry now/.test(panel58.controls[0]), JSON.stringify(panel58?.controls))
    check('step 69 — and no spinner anywhere in it', panel58?.spinners === 0, String(panel58?.spinners))
    await page.unroute('**/projects/*/sync')
    await page.locator('#editor-retry-now').click()
    await page.waitForFunction(() => document.getElementById('editor-retrying') === null, null, { timeout: 20000 })
    const recovered58 = await topBarNow()
    check('step 69 — Retry now: the panel closes, the indicator leaves Retrying and nothing was lost',
      recovered58.panel === false && recovered58.label !== null && !/Retrying/.test(recovered58.label), JSON.stringify(recovered58))

    // ── step 69b — THE REVIEW'S DEPLOYED WALK: a request that NEVER ANSWERS is a failure too, not "Syncing" for good ──
    let stalled58 = null
    await page.route('**/projects/*/sync', (r) => { stalled58 = r })   // held: neither continued nor aborted
    await owe58()
    await page.keyboard.press(`${CMD58}+s`)
    const gaveUp58 = await page.waitForFunction(() => document.getElementById('editor-retrying') !== null, null, { timeout: 30000 }).then(() => true, () => false)
    await page.unroute('**/projects/*/sync')
    await stalled58?.abort().catch(() => {})
    await page.locator('#editor-retry-now').click().catch(() => {})
    const unstuck58 = await stateIs58(SYNCED58)
    check('step 69b — a sync request that never answers becomes Retrying within its own time limit, and Retry now then lands it',
      gaveUp58 && unstuck58, JSON.stringify({ gaveUp58, unstuck58 }))

    // ── Story 5.9's steps — FR-D11's MAP ON THE DEPLOYED EDITOR, inside step 5's CSP session ─────────────────────
    //
    // THE JOURNEY `pnpm keyboard` RUNS, on the real stack (R-82, NFR-6(d)) — its map, ladder and card; the panel-field
    // 2.1.4 row, the ⌥-arrows, ⌥F10 and the reset wiring are steps 31, 17 and 12-13's above and are not walked twice; the
    // panel-field 2.1.4 row and the menu-owns-the-key row are the harness journey's alone. `tools/keyboard/journey.spec.mjs` drives
    // a harness mount with fixture props and proves the WIRING; these steps prove it with a real session, a real read,
    // the real canvas route and the real policy. Neither replaces the other — R-146 says so in as many words.
    //
    // The seed goes back first, for Story 5.8's own reason: the steps above have been deleting and retrying, and every
    // expectation below is about the SEED's stack.
    await freshLoad()

    // ── step 71 — D8c's skip link: the first stop, drawn only while focused, and it skips PAST the canvas ──
    const skip59 = page.locator('[data-skip-canvas]')
    const atRest59 = await skip59.boundingBox()
    await page.evaluate(() => document.body.focus())
    await page.keyboard.press('Tab')
    const focusedSkip59 = await page.evaluate(() => document.activeElement?.dataset?.skipCanvas !== undefined)
    const drawn59 = await skip59.evaluate((el) => {
      const b = el.getBoundingClientRect()
      const c = getComputedStyle(el)
      return { left: Math.round(b.left), top: Math.round(b.top), height: Math.round(b.height), radius: c.borderRadius, shadow: c.boxShadow, words: el.textContent.trim() }
    })
    check('step 71 — D8c: the FIRST Tab lands on "Skip the canvas", and nothing is drawn for it at rest',
      focusedSkip59 && atRest59.width < 4 && drawn59.words === 'Skip the canvas', JSON.stringify({ focusedSkip59, atRest59, drawn59 }))
    // `D8 Editor Below 1440.dc.html:338` — left 10, top 9, 30 high, 12 radius, and A7 item 7's corrected 2px ring
    check('step 71 — D8c: the pill is at its drawn place, size, radius and ring',
      drawn59.left === 10 && drawn59.top === 9 && drawn59.height === 30 && drawn59.radius === '12px' && /rgb\(194,\s*56,\s*31\)/.test(drawn59.shadow), JSON.stringify(drawn59))
    await page.keyboard.press('Tab')
    check('step 71 — and it is gone again the moment it loses focus', (await skip59.boundingBox()).width < 4)
    await skip59.focus()
    await page.keyboard.press('Enter')
    check('step 71 — pressed, focus lands PAST the canvas, on the Controls sidebar\'s first control (`EXPERIENCE.md:444-449`)',
      await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Collapse controls'),
      await page.evaluate(() => document.activeElement?.outerHTML?.slice(0, 120)))

    // ── step 72 — UX-DR9: the canvas is ONE tab stop, and the rendered site is not in the order at all ──
    check('step 72 — the iframe carries tabindex="-1", so the whole embedded document leaves sequential navigation',
      (await page.locator('section[aria-label="Canvas"] iframe').getAttribute('tabindex')) === '-1')
    await page.evaluate(() => document.body.focus())
    const stops59 = []
    for (let i = 0; i < (await pageNames()).length * 2 + 16; i++) {
      await page.keyboard.press('Tab')
      stops59.push(await page.evaluate(() => {
        const d = document.activeElement
        if (!d) return 'nothing'
        if (d.tagName === 'IFRAME') return 'INSIDE THE CANVAS'
        return `${d.tagName}${d.id ? '#' + d.id : ''}${d.getAttribute('aria-label') ? '[' + d.getAttribute('aria-label') + ']' : ''}`
      }))
    }
    const canvasStops59 = stops59.filter((x) => x === 'SECTION[Canvas]')
    const at59 = stops59.indexOf('SECTION[Canvas]')
    check('step 72 — UX-DR9: the canvas contributes EXACTLY ONE stop, between Layers and the Controls sidebar, and no link inside the customer\'s own site is a stop',
      canvasStops59.length === 1 && !stops59.includes('INSIDE THE CANVAS') &&
      stops59.indexOf('BUTTON[Collapse layers]') > -1 && stops59.indexOf('BUTTON[Collapse layers]') < at59 &&
      stops59.indexOf('BUTTON[Collapse controls]') > at59, JSON.stringify(stops59))

    // ── step 73 — the single keys, each calling the handler its own button calls (R-141's rule) ──
    const modeNow59 = () => canvasFrame().evaluate(() => document.documentElement.dataset.mode)
    const deviceNow59 = () => page.evaluate(() => document.querySelector('#editor-device [role="radio"][aria-checked="true"]')?.getAttribute('aria-label'))
    const saidNow59 = () => page.evaluate(() => document.getElementById('editor-said')?.textContent ?? '')
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('l')
    await page.waitForTimeout(250)
    const folded59 = await page.evaluate(() => ({ hidden: document.getElementById('editor-layers')?.hidden, focus: document.activeElement?.getAttribute('aria-label') }))
    await page.keyboard.press('l')
    await page.waitForTimeout(250)
    const unfolded59 = await page.evaluate(() => ({ hidden: document.getElementById('editor-layers')?.hidden, focus: document.activeElement?.getAttribute('aria-label') }))
    check('step 73 — `L` folds and unfolds Layers through `useFold`, so focus lands on the button that replaced the one it pressed',
      folded59.hidden === true && folded59.focus === 'Show layers' && unfolded59.hidden === false && unfolded59.focus === 'Collapse layers', JSON.stringify({ folded59, unfolded59 }))
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('.')
    await page.waitForTimeout(300)
    const dark59 = await modeNow59()
    const saidDark59 = await saidNow59()
    await page.keyboard.press('.')
    await page.waitForTimeout(300)
    check('step 73 — `.` flips the canvas to dark and back, and each mode now showing is announced politely (R-132)',
      dark59 === 'dark' && (await modeNow59()) === 'light' && /dark/i.test(saidDark59), JSON.stringify({ dark59, saidDark59, back: await modeNow59() }))
    const devices59 = []
    for (const [n, d] of DEVICE.DEVICES.entries()) {
      await page.keyboard.press(String(n + 1))
      await page.waitForTimeout(300)
      devices59.push({ pressed: n + 1, want: d.label, got: await deviceNow59(), width: await page.evaluate(() => document.querySelector('section[aria-label="Canvas"] iframe').offsetWidth) })
    }
    check('step 73 — `1` `2` `3` are S4a\'s own track, in its order, and the iframe really takes each device\'s width',
      devices59.every((x, i) => x.got === x.want && x.width === DEVICE.DEVICES[i].width), JSON.stringify(devices59))
    await page.keyboard.press('1')
    await page.waitForTimeout(300)

    // ── step 74 — ⌘D and Del act on the SELECTION and obey the rules their buttons obey (FR-D5) ──
    const beforeKeys59 = await pageNames()
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    // BEFORE AND AFTER, never `=== ''`: the polite region is never emptied, so it still holds step 73's device — the
    // review's first complete run failed here on every press for that reason and no other
    const quiet59 = await saidNow59()
    await page.keyboard.press(`${CMD58}+d`)
    await page.keyboard.press('Delete')
    await page.waitForTimeout(400)
    check('step 74 — with NOTHING selected both keys do nothing and announce nothing',
      JSON.stringify(await pageNames()) === JSON.stringify(beforeKeys59) && (await saidNow59()) === quiet59, JSON.stringify({ names: await pageNames(), said: await saidNow59(), quiet59 }))
    await page.locator(`#editor-layers [data-layer-row]`).nth(beforeKeys59.length > 1 ? 1 : 0).focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(250)
    await page.keyboard.press(`${CMD58}+d`)
    await page.waitForTimeout(500)
    const duped59 = await pageNames()
    check('step 74 — ⌘D duplicates the selected PAGE section, announced politely', duped59.length === beforeKeys59.length + 1 && /duplicated/.test(await saidNow59()), JSON.stringify({ duped59, said: await saidNow59() }))
    await page.keyboard.press(`${CMD58}+z`)
    await page.waitForTimeout(500)
    check('step 74 — control: ⌘Z takes the copy away again, so the key really went through the one `onDuplicate`', JSON.stringify(await pageNames()) === JSON.stringify(beforeKeys59))
    // a site-wide section: no Duplicate at all, and Delete opens the ONE confirm on Cancel
    await page.locator('#editor-layers [data-layer-row^="site:"]').first().focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(250)
    const siteNames59 = await page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row^="site:"]')].length)
    await page.keyboard.press(`${CMD58}+d`)
    await page.waitForTimeout(400)
    check('step 74 — FR-D5: a site-wide section is one shared instance, so ⌘D does nothing on it — exactly as its row carries no Duplicate',
      (await page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row^="site:"]')].length)) === siteNames59)
    await page.keyboard.press('Delete')
    await page.waitForTimeout(500)
    const asked59 = await page.evaluate(() => {
      const d = document.querySelector('dialog[open][aria-labelledby="editor-sitewide-title"]')
      return d ? { open: true, onCancel: document.activeElement === d.querySelector('[data-cancel]') } : { open: false }
    })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    check('step 74 — FR-D5 / R-115: Del on a site-wide section opens the ONE confirm with focus on Cancel, and Escape leaves the doc untouched',
      asked59.open && asked59.onCancel && (await page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row^="site:"]')].length)) === siteNames59, JSON.stringify(asked59))

    // ── step 75 — WCAG 2.1.4 WITH A REAL CARET IN THE CANVAS, which only the deployed walk can reach ──
    // The harness makes an element `contenteditable` directly, because the canvas has no KEYBOARD path into inline
    // editing (FR-D1: the panel is the keyboard's way into a text prop). Here the caret is placed by a real press
    // through Story 5.3's own helpers, so this is the state a customer is actually in when they type the word.
    await freshLoad()
    await clickOn(GRID)
    await page.waitForTimeout(300)
    await caretInto(GRID, TITLE)
    const wasMode59 = await modeNow59()
    const wasDevice59 = await deviceNow59()
    const wasNames59 = await pageNames()
    await page.keyboard.type('dark 123')
    await page.waitForTimeout(500)
    const typed59 = await wordsOf(GRID, TITLE)
    check('step 75 — control: the caret really is in a text prop on the canvas and the word went in', /dark 123/.test(typed59 ?? ''), JSON.stringify({ typed59 }))
    check('step 75 — UX-DR11 / WCAG 2.1.4: typing "dark 123" into a headline flips nothing, changes no device and moves no section',
      (await modeNow59()) === wasMode59 && (await deviceNow59()) === wasDevice59 && JSON.stringify(await pageNames()) === JSON.stringify(wasNames59),
      JSON.stringify({ mode: await modeNow59(), device: await deviceNow59() }))

    // ── step 76 — §7.3(1): the Esc ladder, three rungs, with that same real caret ──
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    const rung1_59 = await page.evaluate(() => document.querySelector('aside[aria-label="Section settings"]') !== null)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    const rung2_59 = await page.evaluate(() => ({
      deselected: document.querySelector('aside[aria-label="Page settings"]') !== null,
      onCanvas: document.activeElement === document.querySelector('section[aria-label="Canvas"]'),
      said: document.getElementById('editor-said')?.textContent ?? '',
    }))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    const rung3_59 = await page.evaluate(() => ({
      focus: document.activeElement?.getAttribute('aria-label'),
      said: document.getElementById('editor-said')?.textContent ?? '',
    }))
    check('step 76 — rung 1: Esc ends the editing and the section STAYS selected (Story 5.3, already built)', rung1_59)
    check('step 76 — rung 2: Esc deselects, focus RESTS on the canvas container, and it says so', rung2_59.deselected && rung2_59.onCanvas && /nothing selected/i.test(rung2_59.said), JSON.stringify(rung2_59))
    check('step 76 — rung 3: Esc takes focus out of the canvas into the chrome, and says that too', rung3_59.focus === 'Collapse controls' && /focus left/i.test(rung3_59.said), JSON.stringify(rung3_59))

    // ── step 77 — R-147's card, measured against the Kit, and R-145's absences ──
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('?')
    await page.waitForTimeout(400)
    const card59 = await page.evaluate(() => {
      const d = document.querySelector('dialog[open][data-shortcuts-sheet]')
      if (!d) return null
      const rows = [...d.querySelectorAll('[data-shortcut-row]')]
      const chip = rows[0]?.querySelector('span span')
      const c = chip ? getComputedStyle(chip) : null
      const action = rows[0]?.querySelector('span')
      const a = action ? getComputedStyle(action) : null
      return {
        onCancel: document.activeElement === d.querySelector('[data-cancel]'),
        actions: rows.map((r) => r.dataset.shortcutRow),
        chips: rows.flatMap((r) => [...r.querySelectorAll('span span')].map((x) => x.textContent)),
        chipFont: c && { size: c.fontSize, radius: c.borderRadius, padding: `${c.paddingTop} ${c.paddingLeft}`, mono: /mono/i.test(c.fontFamily) || /JetBrains/i.test(c.fontFamily) },
        actionFont: a && { size: a.fontSize, weight: a.fontWeight },
        lastHairline: rows.length ? getComputedStyle(rows[rows.length - 1]).borderBottomWidth : null,
        words: d.textContent,
      }
    })
    // `Editor Sidebar Kit.dc.html:274-280`: the action at 12.5px/500, the chips mono 11px at a 5px radius and `1px 6px`,
    // and NO hairline under the last row
    check('step 77 — R-147: `?` opens the card, focus moves in on Cancel, and its rows match the Kit',
      card59 !== null && card59.onCancel && card59.actionFont.size === '12.5px' && card59.actionFont.weight === '500' &&
      card59.chipFont.size === '11px' && card59.chipFont.radius === '5px' && card59.chipFont.padding === '1px 6px' && card59.chipFont.mono &&
      card59.lastHairline === '0px', JSON.stringify(card59 && { ...card59, words: undefined }))
    // Story 5.10: ⌘K MOVED FROM THE FIRST LIST TO THE SECOND, because this story built the picker it presses (R-145)
    // Story 5.11: `[` AND `]` MOVED FROM THE FIRST LIST TO THE SECOND, because this story bound them (R-145)
    // Story 5.12: ⇧R MOVED, because this story built Site Remix — it was deliberately missing until today
    // Story 5.15: P MOVED, because this story built Preview — `lib/preview.ts`'s one name is the card's row too (R-170)
    check('step 77 — R-145: the card lists exactly the keys that WORK — P as "Preview", no ⌘⏎ — and never greys or captions one',
      card59 !== null && ['⌘⏎'].every((k) => !card59.chips.includes(k)) && card59.actions.includes('Preview') &&
      ['⌘K', '[', ']', '⇧R', 'P', 'L', '.', '⌘D', 'Del', '⌘Z', '⇧⌘Z', '⌘S', 'Esc', '?'].every((k) => card59.chips.includes(k)) &&
      !/not yet|coming soon|unavailable/i.test(card59.words), JSON.stringify(card59 && card59.chips))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    check('step 77 — Esc closes the card and the platform returns focus to where it was', await page.evaluate(() => document.querySelector('dialog[open][data-shortcuts-sheet]') === null && document.activeElement === document.querySelector('section[aria-label="Canvas"]')))

    // ── step 78 — R-145: a key whose action has not been built does nothing at all ──
    const beforeDead59 = { names: await pageNames(), mode: await modeNow59(), device: await deviceNow59(), said: await saidNow59() }
    await page.locator('section[aria-label="Canvas"]').focus()
    // ⌘K left this loop at Story 5.10 and has steps 81-85 of its own, ⇧R at Story 5.12 with step 88 and P at Story
    // 5.15 with step 91; `[` and `]` stay because with nothing selected they still do nothing, which is ⌘D's own rule
    for (const key of ['[', ']', `${CMD58}+Enter`]) await page.keyboard.press(key)
    await page.waitForTimeout(500)
    check('step 78 — R-145: `[`, `]` and ⌘⏎ change nothing, announce nothing and open nothing — ⌘⏎ absent, never greyed',
      JSON.stringify(await pageNames()) === JSON.stringify(beforeDead59.names) && (await modeNow59()) === beforeDead59.mode &&
      (await deviceNow59()) === beforeDead59.device && (await saidNow59()) === beforeDead59.said &&
      (await page.evaluate(() => document.querySelectorAll('dialog[open], :popover-open').length)) === 0,
      JSON.stringify(beforeDead59))

    /* ── Story 5.10 — THE SECTION PICKER, steps 81-85, inside step 5's one CSP session ────────────────────────────
       S5a measured where it is drawn, the filter proved by opening the SAME picker on two canvases, R-152's globe and
       its replacement, and the placement as ONE undo step. Every edit below is undone before the walk moves on, and
       `freshLoad()` after step 80 is the belt to that brace. */
    const pickerOpen59 = () => page.evaluate(() => document.querySelector('dialog[open][aria-label="Add a section"]') !== null)
    const railNow59 = () => page.evaluate(() => [...document.querySelectorAll('dialog[open][aria-label="Add a section"] [role="radio"]')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()))
    const cardsNow59 = () => page.evaluate(() => [...document.querySelectorAll('dialog[open][aria-label="Add a section"] [data-cell]')].map((c) => c.dataset.design))

    // ── step 81 — ⌘K opens it, and S5a's panel is measured where it is drawn ──
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+k`)
    await page.waitForTimeout(1200)
    const panel510 = await page.evaluate(() => {
      const d = document.querySelector('dialog[open][aria-label="Add a section"]')
      if (!d) return null
      const b = d.getBoundingClientRect()
      const c = getComputedStyle(d)
      const rail = d.querySelector('[id="picker-categories"]')?.parentElement
      const r = rail && getComputedStyle(rail)
      const heading = [...d.querySelectorAll('p')].find((p) => p.textContent.trim() === 'CATEGORIES')
      const allRow = d.querySelector('[role="radio"]')
      const search = d.querySelector('#picker-search')
      const grid = d.querySelector('[data-picker-grid]')
      const g = grid && getComputedStyle(grid)
      return {
        inset: [Math.round(b.left), Math.round(b.top), Math.round(innerWidth - b.right), Math.round(innerHeight - b.bottom)],
        radius: c.borderTopLeftRadius, shadow: c.boxShadow, display: c.display, overflow: c.overflow,
        railWidth: r && r.width, railPad: r && `${r.paddingTop} ${r.paddingLeft}`, railRule: r && r.borderRightWidth,
        heading: heading ? heading.textContent.trim() : null,
        headingHasNumber: heading ? /\d/.test(heading.textContent) : null,
        placeholder: search && search.placeholder,
        chip: d.querySelector('kbd') && d.querySelector('kbd').textContent.trim(),
        // the owner's test of 2026-09-20: "All sections" is the rail's first row, with its own DERIVED count
        allRow: allRow && { words: allRow.textContent.trim(), first: allRow === d.querySelectorAll('[role="radio"]')[0] },
        meta: [...d.querySelectorAll('p')].map((p) => p.textContent.trim()).find((t) => /^\d+ designs?\b/.test(t)) ?? null,
        columnGap: g && g.columnGap,
        // R-150: the rail footer's Free only toggle is NOT built — absent, never greyed
        freeOnly: /free only/i.test(d.textContent),
        // R-151: R-132's ONE button, at the segmented's drawn position, and no two-button pair
        modeButtons: d.querySelectorAll('#picker-mode').length,
        close: d.querySelector('button[aria-label="Close the section picker"]') !== null,
      }
    })
    // `S5 Section Picker.dc.html:29-37, :88` — inset 22 on every side, --radius-lg, --shadow-modal, a 240px rail on
    // 16px/12px with a right rule, and a 16px gap. The heading is `CATEGORIES` and still carries no number of its
    // own, because the row ABOVE it is the one that counts (the owner's test of 2026-09-20)
    check('step 81 — ⌘K opens S5a: the 22px-inset panel, the 240px rail, `CATEGORIES` with no number, `Find a section…` and its ⌘K chip',
      panel510 !== null && panel510.inset.every((n) => Math.abs(n - 22) <= 1) && panel510.radius === '16px' &&
      panel510.display === 'flex' && panel510.overflow === 'hidden' && panel510.railWidth === '240px' &&
      panel510.railPad === '16px 12px' && panel510.railRule === '1px' && panel510.heading === 'CATEGORIES' &&
      panel510.headingHasNumber === false && panel510.placeholder === 'Find a section…' && panel510.chip === '⌘K' &&
      panel510.columnGap === '16px' && panel510.close, JSON.stringify(panel510))
    check('step 81 — the rail\'s FIRST row is `All sections` with its own derived count (the owner\'s test of 2026-09-20)',
      panel510 !== null && panel510.allRow !== null && panel510.allRow.first === true &&
      /^All sections\s*\d+$/.test(panel510.allRow.words), JSON.stringify(panel510 && panel510.allRow))
    check('step 81 — R-150 and R-151: no `Free only` switch anywhere in the rail, and the dark control is ONE button',
      panel510 !== null && panel510.freeOnly === false && panel510.modeButtons === 1, JSON.stringify(panel510 && { freeOnly: panel510.freeOnly, modeButtons: panel510.modeButtons }))
    // and the pack left the line on the same test: every preview is in his own pack by construction
    check('step 81 — the meta line is the COUNT alone, and never names a pack again',
      panel510 !== null && /^\d+ designs?( · dark mode)?$/.test(panel510.meta ?? '') && !/pack/i.test(panel510.meta ?? ''),
      JSON.stringify(panel510 && panel510.meta))

    // ── step 82 — FR-D12: only what can work is offered, and the rail is DERIVED per canvas ──
    const homeRail510 = await railNow59()
    const homeCards510 = await cardsNow59()
    check('step 82 — every category in the rail carries a count, and every card drawn is a design the library really holds',
      homeRail510.length > 0 && homeRail510.every((r) => /\d+$/.test(r)) && homeCards510.length > 0 && homeCards510.every((id) => /^a\d+\/\d+$/.test(id)),
      JSON.stringify({ homeRail510, homeCards510 }))
    check('step 82 — the count beside each category is the number of its cards, derived over THIS canvas (standing rule 4)',
      homeRail510.every((row) => {
        const n = Number(/(\d+)$/.exec(row)[1])
        return n > 0 && n <= homeCards510.length
      }) && homeRail510.filter((row) => !/^All sections/.test(row)).reduce((t, row) => t + Number(/(\d+)$/.exec(row)[1]), 0) === homeCards510.length,
      JSON.stringify({ homeRail510, cards: homeCards510.length }))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    check('step 82 — Esc closes it and the platform returns focus to the invoking position',
      !(await pickerOpen59()) && (await page.evaluate(() => document.activeElement === document.querySelector('section[aria-label="Canvas"]'))))

    // the SAME picker on the Post canvas: a different list, nothing greyed and no explanation (UX-DR3, R-33)
    await freshLoad('post')
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+k`)
    await page.waitForTimeout(1200)
    const postRail510 = await railNow59()
    const postCards510 = await cardsNow59()
    const greyed510 = await page.evaluate(() => {
      const d = document.querySelector('dialog[open][aria-label="Add a section"]')
      return d ? d.querySelectorAll('[aria-disabled="true"], [disabled]').length : -1
    })
    check('step 82 — FR-D12: the Post canvas offers a DIFFERENT list, and the home-only categories are simply not there',
      postRail510.length > 0 && JSON.stringify(postRail510) !== JSON.stringify(homeRail510) &&
      postCards510.some((id) => !homeCards510.includes(id)) && homeCards510.some((id) => !postCards510.includes(id)),
      JSON.stringify({ homeRail510, postRail510 }))
    check('step 82 — and nothing in it is greyed or captioned: what cannot work is ABSENT (UX-DR3)', greyed510 === 0, `${greyed510} greyed nodes`)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await freshLoad()

    // ── step 83 — the preview is the canvas's own render, in an `inert` frame at Desktop width (NFR-1, R-137, R-149) ──
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+k`)
    await page.waitForTimeout(2500)
    const previews510 = await page.evaluate(() => {
      const d = document.querySelector('dialog[open][aria-label="Add a section"]')
      const frames = [...d.querySelectorAll('iframe')]
      return {
        frames: frames.length,
        cards: d.querySelectorAll('[data-cell]').length,
        allInert: frames.every((f) => f.inert === true),
        allTitled: frames.every((f) => (f.title ?? '').trim() !== ''),
        uniqueTitles: new Set(frames.map((f) => f.title)).size === frames.length,
        atDesktop: frames.every((f) => f.getBoundingClientRect().width > 0 && Number(getComputedStyle(f).width.replace('px', '')) === 1440),
        painted: frames.filter((f) => (f.contentDocument?.getElementById('canvas')?.children.length ?? 0) > 0).length,
        focusable: frames.filter((f) => (f.contentDocument?.querySelectorAll('a[href], button, input, [tabindex]').length ?? 0) > 0).length,
        // the owner's ruling of 2026-09-20 (option 3): ONE design's stylesheet per frame, not the library's. The
        // emitted `/* {id} */` marker is the count, read out of the frame's own document.
        narrowed: frames.map((f) => {
          const sheet = f.contentDocument?.querySelector('[data-order="3-pilots"]')?.textContent ?? ''
          return { asked: new URL(f.src, location.href).searchParams.get('design'), sheets: (sheet.match(/\/\* [a-z0-9]+\/\d+ \*\//g) ?? []).length }
        }),
      }
    })
    // R-137: the frame's CSS pixel size IS the device's, so the design's own media queries fire and the miniature is
    // the canvas's render fitted by a transform — never a shadow root at card width
    check('step 83 — every preview is a LIVE render in an `inert`, titled frame at Desktop width, and every card has one',
      previews510.frames === previews510.cards && previews510.frames > 0 && previews510.allInert && previews510.allTitled &&
      previews510.uniqueTitles && previews510.atDesktop && previews510.painted === previews510.frames, JSON.stringify(previews510))
    // THE PAYLOAD, as the owner ruled it on 2026-09-20: each preview asks for its own design and is served exactly
    // one stylesheet. Before this the frame carried EVERY design's, so the parse cost grew with the square of the
    // library — on this library, 50,577 bytes a frame against ~16,000.
    check('step 83 — every preview asks for ITS OWN design and is served exactly one stylesheet, never the library\'s',
      previews510.narrowed.length > 0 && previews510.narrowed.every((n) => n.asked !== null && n.sheets === 1),
      JSON.stringify(previews510.narrowed))

    // AND THE BROWSER MAY KEEP THEM (the owner's ruling of 2026-09-20, Question 5): the address carries the build,
    // so the document is `immutable` — a second ⌘K costs nothing — while a bare `/canvas`, which carries no build,
    // is never cached and so can never be served stale. Read from the deployed origin, not from a header we wrote.
    const keeping510 = await page.evaluate(async () => {
      const f = document.querySelector('dialog[open][aria-label="Add a section"] iframe')
      const one = await fetch(f.src, { credentials: 'same-origin' })
      const bare = await fetch(new URL(f.src.split('?')[0], location.href).href, { credentials: 'same-origin' })
      return { versioned: one.headers.get('cache-control'), bare: bare.headers.get('cache-control'), src: f.src }
    })
    check('step 83 — a preview page carries the build in its address and may be KEPT; a page without one never is',
      /immutable/.test(keeping510.versioned ?? '') && /private/.test(keeping510.versioned ?? '') &&
      /no-store/.test(keeping510.bare ?? '') &&
      // A BUILD, not merely a `v`: production once served `?v=` (empty) and nothing was kept (review, 2026-09-20)
      /[?&]v=[0-9a-f]{7,}(&|$)/.test(keeping510.src), JSON.stringify(keeping510))

    // R-149 stays ONE rule on ONE element: `inert` takes the preview frames out of the accessibility tree entirely
    check('step 83 — `inert` is what keeps R-149 at one exception: nothing inside a preview frame is focusable to axe',
      previews510.allInert, JSON.stringify(previews510))

    // THE OWNER'S TEST OF 2026-09-20, guarded where he found it: four columns, and a card's SHAPE says what the
    // section is — a band two columns wide, a feed two rows tall, everything between one tile. And the `Add` he
    // found cut off is now in the footer strip, an icon between the name and the tier badge, centred on the card.
    const grid510 = await page.evaluate(() => {
      const d = document.querySelector('dialog[open][aria-label="Add a section"]')
      const g = d.querySelector('[data-picker-grid]')
      const tracks = getComputedStyle(g).gridTemplateColumns.split(' ')
      const unit = parseFloat(tracks[0])
      const cards = [...g.children]
      const heights = cards.map((c) => c.getBoundingClientRect().height)
      const row = Math.min(...heights)
      return {
        columns: tracks.length,
        shapes: cards.map((c) => {
          const box = c.getBoundingClientRect()
          return {
            id: c.querySelector('[data-cell]')?.dataset.design,
            // the gap is the grid's own, so a two-column card is two tracks plus one gap wide
            cols: Math.round((box.width + 16) / (unit + 16)),
            rows: Math.round((box.height + 16) / (row + 16)),
          }
        }),
        strips: cards.map((c) => {
          const add = c.querySelector('[data-cell]')
          const box = c.getBoundingClientRect()
          const seat = add.getBoundingClientRect()
          return {
            // centred on the CARD, not on what is left over beside the name
            centred: Math.abs((seat.left + seat.width / 2) - (box.left + box.width / 2)) <= 1,
            // in the FOOTER — the card's last child — which is what a short preview can no longer crop
            inStrip: c.lastElementChild.contains(add),
            whole: seat.top >= box.top && seat.bottom <= box.bottom,
            words: (add.textContent ?? '').trim(),
            glyph: add.querySelector('svg') !== null,
          }
        }),
      }
    })
    check('step 83 — the grid is FOUR columns (the owner\'s test of 2026-09-20), and every card spans one or two of them',
      grid510.columns === 4 && grid510.shapes.every((c) => c.cols === 1 || c.cols === 2), JSON.stringify(grid510.shapes))
    check('step 83 — a BAND spans two columns and a FEED two rows, so neither is drawn as a sliver',
      grid510.shapes.some((c) => c.cols === 2) && grid510.shapes.some((c) => c.rows === 2), JSON.stringify(grid510.shapes))
    check('step 83 — the `Add` is an ICON in the footer strip, centred on the card and whole — never cropped by a short preview',
      grid510.strips.length > 0 && grid510.strips.every((s) => s.centred && s.inStrip && s.glyph && s.words === '' && s.whole),
      JSON.stringify(grid510.strips))

    // THE PICKER IS KEPT ONCE OPENED (the same ruling's other half): closing it leaves the dialog in the tree,
    // hidden, with every preview alive — so a second ⌘K, which is what a customer does once per section they add,
    // draws nothing again.
    await page.evaluate(() => {
      const frames = [...document.querySelectorAll('dialog[aria-label="Add a section"] iframe')]
      frames.forEach((f, n) => { f.dataset.keptMark = String(n) })
      return frames.length
    })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    const restingPicker510 = await page.evaluate(() => document.querySelectorAll('dialog[aria-label="Add a section"]').length)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+k`)
    await page.waitForTimeout(500)
    const kept510 = await page.evaluate(() => {
      const frames = [...document.querySelectorAll('dialog[open][aria-label="Add a section"] iframe')]
      return {
        frames: frames.length,
        marked: frames.filter((f) => f.dataset.keptMark !== undefined).length,
        painted: frames.filter((f) => (f.contentDocument?.getElementById('canvas')?.children.length ?? 0) > 0).length,
      }
    })
    check('step 83 — the picker is KEPT once opened: a second ⌘K finds every preview still there and still drawn',
      restingPicker510 === 1 && kept510.frames > 0 && kept510.marked === kept510.frames && kept510.painted === kept510.frames,
      JSON.stringify({ restingPicker510, ...kept510 }))

    // ── step 84 — R-152: the globe before the press, the replacement, and ONE undo step (AD-15, AD-16) ──
    const siteCard510 = await page.evaluate(() => {
      const d = document.querySelector('dialog[open][aria-label="Add a section"]')
      const cell = [...d.querySelectorAll('[data-cell]')].find((c) => (c.getAttribute('aria-label') ?? '').includes('Site-wide'))
      if (!cell) return null
      const card = cell.closest('div')
      const globe = card.querySelector('[title*="every template"]')
      return {
        design: cell.dataset.design,
        label: cell.getAttribute('aria-label'),
        globeTitle: globe ? globe.getAttribute('title') : null,
        globeGlyph: !!(globe && globe.querySelector('svg')),
        // R-152 in the owner's own words: no sentence, no toast, no banner ANYWHERE in the picker
        sentence: /shows on every template\./.test(d.textContent) || /added to every template/i.test(d.textContent),
      }
    })
    check('step 84 — R-152: a site-wide card carries the Kit\'s globe with a hover title and the SAME words in its accessible name — and no sentence anywhere',
      siteCard510 !== null && siteCard510.globeGlyph && siteCard510.globeTitle === 'Site-wide — shows on every template' &&
      siteCard510.label.includes(siteCard510.globeTitle) && siteCard510.sentence === false, JSON.stringify(siteCard510))
    const beforeSite510 = await page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row^="site:"]')].map((r) => r.dataset.layerRow))
    await page.locator(`dialog[open] [data-cell][data-design="${siteCard510.design}"]`).click()
    await page.waitForTimeout(800)
    const afterSite510 = await page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row^="site:"]')].map((r) => r.dataset.layerRow))
    const said510 = await saidNow59()
    check('step 84 — a second site-wide design in the same category REPLACES the first, in one transaction',
      afterSite510.length === beforeSite510.length && JSON.stringify(afterSite510) !== JSON.stringify(beforeSite510), JSON.stringify({ beforeSite510, afterSite510 }))
    check('step 84 — the placement is announced politely, naming the Site-wide group, and the picker has closed behind it',
      /Site-wide group/.test(said510) && !(await pickerOpen59()), JSON.stringify({ said510 }))
    check('step 84 — and the only thing said aloud is that announcement: no toast, no banner, no visible sentence (R-152)',
      (await page.evaluate(() => !/shows on every template|added to every template/i.test(document.body.innerText))))
    await page.keyboard.press(`${CMD58}+z`)
    await page.waitForTimeout(600)
    check('step 84 — one ⌘Z puts the old site-wide section back — one gesture, one edit, one undo step (AD-15, AD-16)',
      JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row^="site:"]')].map((r) => r.dataset.layerRow))) === JSON.stringify(beforeSite510))

    // ── step 85 — the "+" on the hovered gap places at THAT gap, and ⌘K with a caret does not open at all ──
    const beforePage510 = await pageNames()
    const gapAt510 = await page.evaluate((n) => {
      const f = document.querySelector('section[aria-label="Canvas"] iframe')
      const fr = f.getBoundingClientRect()
      const s = fr.width / f.offsetWidth
      const b = f.contentDocument.querySelectorAll('#canvas > *')[n].getBoundingClientRect()
      return { x: Math.round(fr.left + (b.left + b.width / 2) * s), y: Math.round(fr.top + (b.top + b.height / 2) * s) }
    }, 0)
    await page.mouse.move(gapAt510.x, gapAt510.y)
    await page.waitForTimeout(400)
    const hairline510 = await canvasFrame().evaluate(() => {
      const el = document.querySelector('[data-inflozo-insert]')
      if (!el) return null
      const a = getComputedStyle(el, '::after')
      return { bg: a.backgroundColor, height: a.height, bottom: a.bottom, animation: a.animationName, position: a.position }
    })
    // S4b`:181`: 2px of `--color-coral` on the section's own bottom edge, breathing through the `addline` OPACITY pulse
    check('step 85 — the hovered gap paints S4b\'s 2px coral hairline inside the canvas, breathing in opacity',
      hairline510 !== null && hairline510.height === '2px' && hairline510.bg === 'rgb(255, 89, 65)' &&
      hairline510.bottom === '-1px' && hairline510.animation === 'addline' && hairline510.position === 'absolute', JSON.stringify(hairline510))
    const pill510 = await page.evaluate(() => {
      const b = document.querySelector('[data-add-section]')
      if (!b) return null
      const c = getComputedStyle(b)
      return { words: b.textContent.trim(), radius: c.borderTopLeftRadius, border: `${c.borderTopWidth} ${c.borderTopColor}`, padding: `${c.paddingTop} ${c.paddingLeft}`, size: c.fontSize, weight: c.fontWeight, animation: c.animationName }
    })
    check('step 85 — and S4b\'s pressed "+ Add section" pill sits on it, drawn as the frame draws it',
      pill510 !== null && pill510.words === '+ Add section' && pill510.radius === '24px' && pill510.border === '1px rgb(255, 89, 65)' &&
      pill510.padding === '4px 11px' && pill510.size === '11px' && pill510.weight === '600' && pill510.animation === 'addline', JSON.stringify(pill510))
    await page.locator('[data-add-section]').click()
    await page.waitForTimeout(2000)
    const firstCard510 = (await cardsNow59()).find((id) => id !== siteCard510.design)
    await page.locator(`dialog[open] [data-cell][data-design="${firstCard510}"]`).click()
    await page.waitForTimeout(800)
    const placed510 = await pageNames()
    check('step 85 — Add places ONE section at the invoked gap, the picker closes and the placement is announced',
      placed510.length === beforePage510.length + 1 && /added/.test(await saidNow59()) && !(await pickerOpen59()),
      JSON.stringify({ beforePage510, placed510 }))
    await page.keyboard.press(`${CMD58}+z`)
    await page.waitForTimeout(600)
    check('step 85 — control: one ⌘Z takes it away again, so the insert really went through the one `commit`',
      JSON.stringify(await pageNames()) === JSON.stringify(beforePage510))
    // THE NARROWING, WITH A REAL CARET IN THE CANVAS — the one thing only the deployed walk can reach (`inline.ts:230`)
    // the caret the way steps 16-22 take one (`caretInto`): the hand-rolled click here never produced a caret, so
    // `editing510` — this check's own control — was false and the step proved nothing (review, 2026-09-20)
    await clickOn(GRID)
    await caretInto(GRID, TITLE)
    const editing510 = await canvasFrame().evaluate(() => document.activeElement?.isContentEditable === true)
    await page.keyboard.press(`${CMD58}+k`)
    await page.waitForTimeout(500)
    check('step 85 — ⌘K with a real caret in a canvas text prop does NOT open the picker: it is the LINK mark there (inline.ts:230)',
      editing510 && !(await pickerOpen59()), JSON.stringify({ editing510, open: await pickerOpen59() }))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await freshLoad()

    /* ── step 86 — STORY 5.11, THE DESIGN RING, AND WHAT IT LOOKS LIKE WHERE THERE IS NOWHERE TO GO ──────────
       The shipped library holds ONE design per category, so every ring on this project has length 1 and this
       step is a test of ABSENCE (UX-DR3, R-118, and R-158 in the owner's own words): the counter says where it
       is, one sentence says why there is nothing to press, and not one of the four doors is drawn. The RULE
       itself — carry / park / default over a real ring — is `run-verify-controls.cjs`'s, on `/controls`. */
    await clickOn(GRID)
    await page.waitForTimeout(300)
    const ring511 = await page.evaluate(() => {
      const block = document.getElementById('editor-design')
      if (!block) return null
      return {
        counter: document.getElementById('editor-design-count')?.textContent ?? null,
        name: document.getElementById('editor-design-name')?.textContent ?? null,
        note: document.getElementById('editor-design-note')?.textContent ?? null,
        arrows: block.querySelectorAll('[data-design-step]').length,
        strip: block.querySelectorAll('[data-design-strip]').length,
        tryCard: block.querySelectorAll('[data-try-design]').length,
        chips: [...block.querySelectorAll('kbd')].map((k) => k.textContent),
        // B1a: the block sits ABOVE the settings groups and inside none of them (FR-F3)
        // the GROUPS, by the selector `panelOf` uses — not `[aria-expanded]`, whose first match in this panel is the
        // head's own Collapse button and therefore PRECEDES the block, which is how this read first answered false
        aboveGroups: !block.closest('[role="region"]')
          && !!document.querySelector('#editor-controls button[aria-expanded][aria-controls$="-body"]')
          && (block.compareDocumentPosition(document.querySelector('#editor-controls button[aria-expanded][aria-controls$="-body"]')) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      }
    })
    check('step 86 — B1a: the Design block is at the head of the panel, above every settings group and inside none (FR-F3)',
      ring511 !== null && ring511.aboveGroups, JSON.stringify(ring511))
    // the owner's test of the deployed page (2026-09-20, finding 2): the counter prints the NUMBER and the label
    // beside it prints the word — the block was saying "Design" twice
    check('step 86 — with one design in the ring the counter still says where it is, without repeating its own label, and one plain sentence says why there is nothing to press (R-12, R-158)',
      ring511 !== null && ring511.counter === '1 of 1' && /one design/.test(ring511.note ?? '') && (ring511.name ?? '') !== '', JSON.stringify(ring511))
    // findings 3 and 4 took the Try-a-design card and the `Cycle designs` footer out EVERYWHERE, so the last two
    // clauses now guard against their return rather than against a ring of one
    check('step 86 — ABSENT, NEVER GREYED (UX-DR3): no arrows and no thumbnail strip where the ring holds one — and no Try-a-design card and no key chips at all',
      ring511 !== null && ring511.arrows === 0 && ring511.strip === 0 && ring511.tryCard === 0 && ring511.chips.length === 0, JSON.stringify(ring511))
    // S4b + S6's pill gives the same answer: the counter, the arrows and Shuffle arrive with the ring, not before
    await page.mouse.move(120, 400)
    await clickOn(GRID)
    const pill511 = await page.evaluate(() => {
      const pill = document.querySelector('[data-section-pill]')
      return pill === null ? null : {
        count: pill.querySelectorAll('[data-pill-count]').length,
        shuffle: pill.querySelectorAll('[data-pill-shuffle]').length,
        labels: [...pill.querySelectorAll('button')].map((b) => b.getAttribute('aria-label')),
      }
    })
    check('step 86 — and the section\'s own pill agrees: no counter, no ◀ ▶ and no Shuffle, and the three controls Story 5.4 built are untouched',
      pill511 !== null && pill511.count === 0 && pill511.shuffle === 0 && pill511.labels.every((l) => !/design|Shuffle/i.test(l ?? '')), JSON.stringify(pill511))
    // the keys: bound, listed, and doing nothing where there is nothing to do (⌘D's own rule)
    const before511 = await saidNow59()
    const design511 = await page.evaluate(() => document.getElementById('editor-design-name')?.textContent ?? null)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('[')
    await page.keyboard.press(']')
    await page.waitForTimeout(400)
    check('step 86 — `[` and `]` with one design in the ring do nothing and announce nothing — no flicker, no error (the matrix\'s "ring of one")',
      (await page.evaluate(() => document.getElementById('editor-design-name')?.textContent ?? null)) === design511 && (await saidNow59()) === before511,
      JSON.stringify({ design511, said: await saidNow59() }))
    await page.keyboard.press('?')
    await page.waitForTimeout(400)
    const chips511 = await page.evaluate(() => [...document.querySelectorAll('dialog[open][data-shortcuts-sheet] [data-shortcut-row] span span')].map((s) => s.textContent))
    check('step 86 — R-145: the `?` card now lists **Previous design `[`** and **Next design `]`**, which were deliberately missing until this story',
      chips511.includes('[') && chips511.includes(']'), JSON.stringify(chips511))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // ── step 87 — DW-209, PROVED RATHER THAN REMEMBERED: a wheel with the pointer RESTING ON A PILL scrolls the canvas ──
    // Both pills forward their wheel (`section-pill.tsx` → `wheelToFrame`). Step 15's own pass wheels at x=700 and may
    // or may not land on a pill, which is exactly why DW-209 failed "most runs" — so this puts the pointer ON each pill
    // by its box and reads the canvas document's scrollTop before and after (the review of 2026-09-20: nothing did).
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 0))
    await hoverOn(GRID)
    const canvasTop511 = () => canvasFrame().evaluate(() => document.scrollingElement.scrollTop)
    const wheelOver511 = async (selector) => {
      const box = await page.locator(selector).boundingBox()
      if (!box) return null
      const before = await canvasTop511()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 })
      await page.waitForTimeout(150)
      await page.mouse.wheel(0, 300)
      await page.waitForTimeout(400)
      return (await canvasTop511()) - before
    }
    const overPill511 = await wheelOver511('[data-section-pill]')
    check('step 87 — DW-209: a wheel with the pointer on the section\'s quick-action pill scrolls the canvas — the pill forwards it',
      overPill511 !== null && overPill511 > 0, overPill511 === null ? 'no pill under the pointer' : `${overPill511}px`)
    await hoverOn(GRID)
    const overAdd511 = await wheelOver511('[data-add-section]')
    check('step 87 — and the same with the pointer on the "+ Add section" pill, the one the hypothesis named',
      overAdd511 !== null && overAdd511 > 0, overAdd511 === null ? 'no add pill under the pointer' : `${overAdd511}px`)
    await page.mouse.move(120, 400)
    await freshLoad()

    /* ── step 88 — STORY 5.12, SITE REMIX: THE DICE, AND THE HONEST ANSWER IT GIVES ON THIS PROJECT ──────────
       The shipped library holds ONE design per category (R-158), so every ring on this project has length 1 and
       nothing here can move — which is exactly what the confirm has to SAY rather than pretend (R-12's shape,
       as R-134 already answers an empty "Clear dark overrides"). The re-roll ITSELF is proved where a ring
       exists: on the deployed `/controls` (`run-verify-controls.cjs`, R-162) and on every commit by
       `pnpm keyboard` over the harness's fixture ring. */
    const dice512 = await page.evaluate(() => {
      const b = document.getElementById('editor-remix')
      if (!b) return null
      const cluster = b.parentElement
      const sun = document.getElementById('editor-mode')
      return {
        label: b.getAttribute('aria-label'),
        title: b.getAttribute('title'),
        // ICON-ONLY (R-163): no words are printed beside it, so its name and its title are all it has
        words: (b.textContent ?? '').trim(),
        // R-135: the dice LEADS the cluster, so its seat is the same on a Light-only project as on this one
        first: cluster?.firstElementChild === b,
        // R-135 again: on a Light-only project there IS no sun, which is the whole reason the dice leads
        beforeSun: sun === null || (b.compareDocumentPosition(sun) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        sun: sun !== null,
        // the cube is six faces in 3D, in TOKEN colours — never a hex in a `.tsx` (`tokens.test.ts:125`)
        faces: b.querySelectorAll('.remix-dice__face').length,
        preserved: getComputedStyle(b.querySelector('.remix-dice__cube')).transformStyle,
        pip: getComputedStyle(b.querySelector('.remix-dice__face--1')).backgroundImage,
        // R-164: WHERE THE PIPS LAND, not the rule that placed them. Each pip is a gradient layer, and a layer at
        // `background-size: auto` fills the whole face — at which size a percentage position resolves to
        // `(box - layer) x pct` = 0 and all six faces draw ONE centred dot. That shipped, and the owner saw it.
        pips: [...b.querySelectorAll('.remix-dice__face')].map((f) => {
          const cs = getComputedStyle(f)
          const sizes = cs.backgroundSize.split(',').map((v) => v.trim())
          const at = (v, span, layer) =>
            v.endsWith('%') ? ((span - layer) * parseFloat(v)) / 100 + layer / 2 : parseFloat(v) + layer / 2
          const centres = cs.backgroundPosition.split(',').map((pair, n) => {
            const [x, y] = pair.trim().split(/\s+/)
            const [sw, sh] = (sizes[n] ?? sizes[0]).split(/\s+/)
            const lw = sw === 'auto' ? f.offsetWidth : parseFloat(sw)
            const lh = (sh ?? sw) === 'auto' ? f.offsetHeight : parseFloat(sh ?? sw)
            return `${at(x, f.offsetWidth, lw).toFixed(2)},${at(y, f.offsetHeight, lh).toFixed(2)}`
          })
          return new Set(centres).size
        }),
      }
    })
    check('step 88 — R-163: the dice is in the top bar, LEADS the right-hand cluster ahead of the sun, and is icon-only with its words as its accessible name and its hover title',
      dice512 !== null && dice512.label === 'Site Remix — ⇧R' && dice512.title === dice512.label && dice512.words === '' &&
      dice512.first && dice512.beforeSun, JSON.stringify(dice512 && { ...dice512, pip: undefined }))
    check('step 88 — and it is a real cube: six faces in 3D, its pips drawn in the coral the token layer names',
      dice512 !== null && dice512.faces === 6 && dice512.preserved === 'preserve-3d' &&
      /rgb\(255, 89, 65\)/.test(dice512.pip ?? ''), JSON.stringify(dice512 && { faces: dice512.faces, preserved: dice512.preserved, pip: dice512.pip }))
    check('step 88 — R-164: each face draws its OWN number of pips, in its own places — measured where they land, not read off the rule',
      JSON.stringify(dice512 && dice512.pips) === JSON.stringify([1, 2, 3, 4, 5, 6]), JSON.stringify(dice512 && dice512.pips))

    // R-164: THE QUESTION COMES FIRST — the press opens the confirm at once, and the cube rolls only on a
    // confirmed Remix. A quarter of a second is far less than the die's own ~900ms, so a build that still rolled
    // before asking would fail here rather than be waited out.
    const beforeDice512 = { names: await pageNames(), said: await saidNow59() }
    await page.locator('#editor-remix').click()
    check('step 88 — R-164: the press opens the confirm AT ONCE, before anything rolls',
      await page.waitForSelector('dialog[data-remix-confirm][open]', { timeout: 250 }).then(() => true).catch(() => false))
    const ask512 = await page.evaluate(() => {
      const d = document.querySelector('dialog[data-remix-confirm][open]')
      return d === null ? null : {
        onCancel: document.activeElement === d.querySelector('[data-cancel]'),
        title: d.querySelector('#editor-remix-title')?.textContent ?? '',
        body: d.querySelector('#editor-remix-body')?.textContent ?? '',
        buttons: [...d.querySelectorAll('button')].map((b) => b.textContent.trim()),
        // R-161: B8's "Re-roll what", "Every page" and "Include the header and footer" are ABSENT, not greyed
        choices: d.querySelectorAll('input, [role="radio"], [role="checkbox"]').length,
        greyed: d.querySelectorAll('[aria-disabled="true"], :disabled').length,
      }
    })
    check('step 88 — pressing the dice opens the ONE confirm with focus on Cancel (R-115, UX-DR14)',
      ask512 !== null && ask512.onCancel && /^Remix Home\?$/.test(ask512.title.trim()), JSON.stringify(ask512))
    check('step 88 — R-158 / R-12: on this project every category holds one design, so the dialog says there is nothing to remix and carries CLOSE ALONE — never a greyed Remix',
      ask512 !== null && /nothing to remix yet/.test(ask512.body) && ask512.buttons.length === 1 && ask512.buttons[0] === 'Close' &&
      ask512.greyed === 0, JSON.stringify(ask512 && { body: ask512.body, buttons: ask512.buttons, greyed: ask512.greyed }))
    check('step 88 — R-161: no "Re-roll what" group, no "Every page" and no header-and-footer tick-box — absent, not greyed (UX-DR3, R-118)',
      ask512 !== null && ask512.choices === 0 && !/Every page|header and footer|Style Pack/i.test(ask512.body), JSON.stringify(ask512 && { choices: ask512.choices }))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    check('step 88 — Close leaves the doc, the journal and the announcement exactly as they were',
      JSON.stringify(await pageNames()) === JSON.stringify(beforeDice512.names) && (await saidNow59()) === beforeDice512.said &&
      (await page.evaluate(() => document.querySelectorAll('dialog[open]').length)) === 0,
      JSON.stringify({ said: await saidNow59(), was: beforeDice512.said }))

    // `⇧R` IS THE SAME CONTROL (R-141): the key presses the dice, so the confirm and the roll are one handler
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('Shift+R')
    check('step 88 — R-145: `⇧R` opens the very same confirm, at once — the key and the dice are one control',
      await page.waitForSelector('dialog[data-remix-confirm][open]', { timeout: 250 }).then(() => true).catch(() => false))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // WCAG 2.1.4 WITH A REAL CARET IN THE CANVAS, which only the deployed walk can reach — the owner's own
    // "most important step". Step 75's shape, with the one key this story bound.
    await clickOn(GRID)
    await page.waitForTimeout(300)
    await caretInto(GRID, TITLE)
    const wasWords512 = await wordsOf(GRID, TITLE)
    await page.keyboard.press('Shift+R')
    await page.waitForTimeout(900)
    const typed512 = await wordsOf(GRID, TITLE)
    check('step 88 — WCAG 2.1.4: with a REAL caret in a headline on the canvas, ⇧R types a capital R and rolls nothing (the owner\'s own most important step)',
      (typed512 ?? '').length === (wasWords512 ?? '').length + 1 && /R/.test(typed512 ?? '') &&
      (await page.evaluate(() => document.querySelectorAll('dialog[open]').length)) === 0,
      JSON.stringify({ was: wasWords512, typed: typed512 }))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await freshLoad()

    /* ── step 89 — STORY 5.13, THE CONTENT-SOURCE PILL AND THE PREVIEW SUBJECT (FR-D15, FR-D22) ───────────────
       Every expectation here is DERIVED from the two pure modules the surface reads — `apps/web/lib/preview-subject.ts`
       for the words and the rows, and the library's own `templateContext` for what an archive renders — so a word, a
       row or a count that changes there changes this walk with it and is never restated (standing rule 4).

       THE FIRST THING MEASURED IS THE GEOMETRY, because R-166 is a ruling about geometry and R-164's rule is that
       such a ruling is proved by measuring it: the pill's box must not intersect the page card's box at Desktop,
       Tablet OR Mobile, which is R-138's own invariant asked of a second thing in that ground. */
    const SUBJ = await import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/preview-subject.ts')).href)
    const OW513 = await import(require('node:url').pathToFileURL(path.join(REPO, 'packages/library/src/orbit-weekly.ts')).href)
    const SRC513 = SUBJ.bundledSource()
    const POSTS513 = SUBJ.subjectOptions(SRC513, 'post')
    const meets = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

    const sourcePill = () => page.evaluate(() => {
      const el = document.getElementById('editor-source')
      if (!el) return null
      const stage = document.querySelector('section[aria-label="Canvas"]')
      const card = stage.firstElementChild
      const cs = getComputedStyle(el)
      const dot = el.querySelector('[data-dot]')
      const pr = el.getBoundingClientRect()
      const cr = card.getBoundingClientRect()
      return {
        tag: el.tagName,
        words: el.textContent.replace(/\s+/g, ' ').trim(),
        source: el.querySelector('[data-source]')?.textContent ?? null,
        subject: el.querySelector('[data-subject]')?.textContent ?? null,
        has: el.dataset.hasSubject,
        border: cs.borderStyle,
        radius: cs.borderRadius,
        height: Math.round(pr.height),
        dot: dot && getComputedStyle(dot).backgroundColor,
        glyphs: el.querySelectorAll('svg').length,
        box: { left: pr.left, top: pr.top, right: pr.right, bottom: pr.bottom },
        cardBox: { left: cr.left, top: cr.top, right: cr.right, bottom: cr.bottom },
        // the page card must still be this ground's `firstElementChild` — how the harness and step 27's gutter find it
        cardIsCard: card.querySelector('iframe') !== null,
        menu: document.getElementById('editor-source-menu') !== null,
      }
    })
    const canvasWords = () => canvasFrame().evaluate(() => document.getElementById('canvas').textContent)
    /** FR-H8's media guard, at the element: `a24/1` wraps its picture in a `<figure data-if="feature_image">`, so a
     *  subject with no picture loses the WHOLE element rather than gaining an empty one. */
    const featureNow = () => canvasFrame().evaluate(() => {
      const fig = document.querySelector('#canvas .a24-1__figure')
      const img = document.querySelector('#canvas .a24-1__image')
      return { figure: fig !== null, img: img !== null, srcset: img?.getAttribute('srcset') ?? null, src: img?.getAttribute('src') ?? null }
    })

    await freshLoad()
    const pill513Home = await sourcePill()
    check('step 89 — B9: a pill at the canvas foot says what the canvas is made of — dashed, a grey dot, and the words the pure module owns',
      pill513Home !== null && pill513Home.source === SUBJ.SOURCE_WORDS.sample && pill513Home.words.startsWith(SUBJ.SOURCE_WORDS.lead) &&
      pill513Home.border === 'dashed' && pill513Home.dot === 'rgb(201, 194, 184)' && /^24px$/.test(pill513Home.radius.split(' ')[0]),
      JSON.stringify(pill513Home && { ...pill513Home, box: undefined, cardBox: undefined }))
    check('step 89 — R-166: it is built at 24px, and the page card is still this ground\'s firstElementChild',
      pill513Home !== null && pill513Home.height === 24 && pill513Home.cardIsCard, JSON.stringify(pill513Home && { height: pill513Home.height, cardIsCard: pill513Home.cardIsCard }))
    check('step 89 — R-118: Home renders no single resource, so the pill names no subject, is not a control and has nothing to open',
      pill513Home !== null && pill513Home.has === 'false' && pill513Home.subject === null && pill513Home.tag === 'SPAN' &&
      pill513Home.glyphs === 0 && pill513Home.menu === false, JSON.stringify(pill513Home && { has: pill513Home.has, tag: pill513Home.tag, glyphs: pill513Home.glyphs, menu: pill513Home.menu }))

    // R-166 / R-138, MEASURED AT EVERY DEVICE — the step that matters most on the owner's own list
    const clear513 = []
    for (const name of ['desktop', 'tablet', 'mobile']) {
      await deviceButton(name).click()
      await page.waitForTimeout(400)
      const p = await sourcePill()
      clear513.push({ name, meets: p && meets(p.box, p.cardBox), gap: p && Math.round(p.box.top - p.cardBox.bottom) })
    }
    check('step 89 — R-166 / R-138: the pill\'s box never intersects the page card\'s box, at Desktop, Tablet or Mobile — measured from the rects',
      clear513.every((d) => d.meets === false && d.gap >= 0), JSON.stringify(clear513))
    // and the card did NOT shrink to make room: `py-8` is untouched, which is the other half of R-166
    const ground513 = await page.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('section[aria-label="Canvas"]'))
      return { top: cs.paddingTop, bottom: cs.paddingBottom }
    })
    check('step 89 — R-139 is untouched: the ground is still 32px top and bottom, so no page card lost a pixel at any size',
      ground513.top === '32px' && ground513.bottom === '32px', JSON.stringify(ground513))
    await deviceButton('desktop').click()
    await page.waitForTimeout(300)

    // ── the Post canvas: the pill NAMES the subject, and D5e opens ──
    await page.goto(editorUrl('post'), { waitUntil: 'load' })
    await painted('post').catch(() => null)
    await page.waitForTimeout(400)
    const pill513Post = await sourcePill()
    check('step 89 — FR-D22: on a canvas that renders one article the pill also NAMES it, and untouched that is the fixture',
      pill513Post !== null && pill513Post.has === 'true' && pill513Post.tag === 'BUTTON' && pill513Post.subject === POSTS513[0].title &&
      pill513Post.source === SUBJ.SOURCE_WORDS.sample, JSON.stringify(pill513Post && { has: pill513Post.has, tag: pill513Post.tag, subject: pill513Post.subject }))
    check('step 89 — and it still clears the page card here, where the card is a post rather than a feed',
      pill513Post !== null && !meets(pill513Post.box, pill513Post.cardBox), JSON.stringify(pill513Post && { box: pill513Post.box, cardBox: pill513Post.cardBox }))

    await page.locator('#editor-source').click()
    await page.waitForTimeout(500)
    const menu513 = await page.evaluate(() => {
      const m = document.getElementById('editor-source-menu')
      if (m === null || !m.matches(':popover-open')) return null
      const rows = [...m.querySelectorAll('[data-subject-row]')]
      return {
        heading: m.querySelector('#editor-source-heading')?.textContent ?? null,
        focus: document.activeElement?.id ?? null,
        rows: rows.length,
        first: rows[0]?.querySelector('[data-name]')?.textContent ?? null,
        firstWords: (rows[0]?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        checked: rows.filter((r) => r.getAttribute('aria-current') === 'true').map((r) => r.dataset.subjectRow),
        // D5e's own caption: the marker never travels alone, so "has image" is real text in the row
        marked: rows.filter((r) => /has image/.test(r.textContent)).map((r) => r.dataset.subjectRow),
        dated: rows.filter((r) => /^\d{1,2} [A-Z][a-z]{2} \d{4}$/.test(r.querySelector('[data-meta]')?.textContent ?? '')).length,
        // R-118: there is no SOURCE group and nothing greyed anywhere in it
        sourceGroup: /\bSOURCE\b/.test(m.textContent),
        greyed: m.querySelectorAll('[aria-disabled="true"], :disabled').length,
        help: m.textContent.includes('different shapes'),
      }
    })
    check('step 89 — D5e opens upward on the press, the style-guide entry FIRST with its caption and its tick, and every other row is the source\'s own',
      menu513 !== null && menu513.rows === POSTS513.length && menu513.first === POSTS513[0].title &&
      menu513.firstWords.includes(POSTS513[0].caption) && JSON.stringify(menu513.checked) === JSON.stringify([POSTS513[0].slug]) &&
      menu513.dated === POSTS513.length - 1 && menu513.help, JSON.stringify(menu513))
    check('step 89 — the has-image marker is WORDS and it is on exactly the rows that carry a picture (D5e\'s own caption)',
      menu513 !== null && JSON.stringify(menu513.marked) === JSON.stringify(POSTS513.filter((r) => r.hasImage && r.caption === null).map((r) => r.slug)),
      JSON.stringify(menu513 && { marked: menu513.marked.length, want: POSTS513.filter((r) => r.hasImage && r.caption === null).length }))
    check('step 89 — R-118: no SOURCE group, nothing greyed, and the search takes the focus',
      menu513 !== null && menu513.sourceGroup === false && menu513.greyed === 0 && menu513.focus === 'editor-source-search', JSON.stringify(menu513 && { sourceGroup: menu513.sourceGroup, greyed: menu513.greyed, focus: menu513.focus }))

    /* THE MENU'S OWN LIST SCROLLS, AND SCROLLING IT DOES NOT CLOSE IT (the owner's finding, 2026-09-21).
       `openMenu` arms a CAPTURING `scroll` listener on `window`, and capture reaches the scroll of every
       element, not only the document's — so a menu with 53 rows shut itself the moment its list moved.
       The control is in the assertion: `moved` must be non-zero, or a menu that refused to scroll at all
       would pass this stop by standing still. */
    const scrolled513 = await page.evaluate(async () => {
      const list = document.querySelector('#editor-source-menu ul')
      const before = list.scrollTop
      // the list is moved by assignment: what is proved is that its `scroll` EVENT no longer closes the menu, and
      // `overflows` is what says a wheel would move it (a synthetic WheelEvent scrolls nothing — review, 2026-09-21)
      list.scrollTop = before + 120
      await new Promise((r) => setTimeout(r, 250))
      return {
        overflows: list.scrollHeight > list.clientHeight,
        moved: list.scrollTop - before,
        open: document.getElementById('editor-source-menu')?.matches(':popover-open') === true,
      }
    })
    check('step 89 — the menu\'s own list scrolls and scrolling it does NOT close the menu (a capturing window listener hears every element\'s scroll)',
      scrolled513.overflows && scrolled513.moved > 0 && scrolled513.open, JSON.stringify(scrolled513))
    // AND THE OTHER HALF (the review, 2026-09-21): the ground moving STILL closes it — the guard that ignores the
    // menu's own scroll must not have become one that ignores every scroll. `openMenu` is every menu in the app.
    const outside513 = await page.evaluate(async () => {
      document.dispatchEvent(new Event('scroll'))
      await new Promise((r) => setTimeout(r, 250))
      return document.getElementById('editor-source-menu')?.matches(':popover-open') === true
    })
    check('step 89 — and a scroll OUTSIDE the menu still closes it, so a fixed-position menu never floats away from its pill', outside513 === false, JSON.stringify({ open: outside513 }))
    await page.locator('#editor-source').click()
    await page.waitForTimeout(500)

    // the search is pure and client-side: nothing is fetched, and the count is the pure module's own answer
    const QUERY513 = 'archive'
    const requests513 = []
    const watch513 = (r) => requests513.push(r.url())
    page.on('request', watch513)
    await page.locator('#editor-source-search').fill(QUERY513)
    await page.waitForTimeout(400)
    page.off('request', watch513)
    // "nothing is fetched" means no DATA went out for it — a stray prefetch of another route is Next's and not the
    // search's, so the claim is scoped to the two places rows could possibly come from
    const fetched513 = requests513.filter((u) => /supabase|\/api\//.test(u))
    const narrowed513 = await page.evaluate(() => document.querySelectorAll('#editor-source-menu [data-subject-row]').length)
    check('step 89 — typing narrows the list to exactly what `filterSubjects` answers, and nothing is fetched to do it',
      narrowed513 === SUBJ.filterSubjects(POSTS513, QUERY513).length && narrowed513 > 0 && narrowed513 < POSTS513.length &&
      fetched513.length === 0, JSON.stringify({ narrowed: narrowed513, want: SUBJ.filterSubjects(POSTS513, QUERY513).length, fetched: fetched513 }))

    // ── THE STRUCTURAL CLAIM, BY HAND (R-165): two subjects, two genuinely different pages ──
    const WITH513 = POSTS513.find((r) => r.caption === null && r.hasImage)
    const WITHOUT513 = POSTS513.find((r) => r.caption === null && !r.hasImage)
    await page.locator('#editor-source-search').fill('')
    await page.waitForTimeout(200)
    await page.locator(`#editor-source-menu [data-subject-row="${WITH513.slug}"]`).click()
    await page.waitForTimeout(600)
    const withPic513 = await featureNow()
    const saidPick513 = await saidNow59()
    check('step 89 — choosing an article repaints the canvas at once: its picture is there with its srcset, and the pill\'s second half names it',
      withPic513.figure && withPic513.img && (withPic513.srcset ?? '').length > 0 &&
      (await sourcePill()).subject === WITH513.title, JSON.stringify({ ...withPic513, said: saidPick513 }))
    check('step 89 — and the choice is announced politely through the editor\'s one live region, never a toast',
      saidPick513 === SUBJ.SUBJECT_SAID({ kind: 'post', slug: WITH513.slug }, POSTS513) &&
      (await page.evaluate(() => document.querySelectorAll('[role="alert"], [data-toast]').length)) === 0, JSON.stringify({ said: saidPick513 }))

    /* A PICKER CARD WEARS THE CANVAS'S SUBJECT, AND REPAINTS WHEN IT CHANGES (the review's finding, 2026-09-21:
       the card's paint effect did not depend on the subject, and the picker is kept mounted, so a card drawn once
       kept the old article). The control is the FIRST reading: the card must have drawn the picture before the
       second reading's absence means anything. */
    const cardFigure513 = async () => {
      await page.locator('section[aria-label="Canvas"]').focus()
      await page.keyboard.press(`${CMD58}+k`)
      await page.waitForTimeout(1200)
      // every card is walked into view, so the lazy ones draw — no design id is written down here
      for (const cell of await page.locator('dialog[open][aria-label="Add a section"] [data-cell]').all()) await cell.scrollIntoViewIfNeeded()
      await page.waitForTimeout(1500)
      const seen = await page.evaluate(() => [...document.querySelectorAll('dialog[open][aria-label="Add a section"] iframe')]
        .map((f) => f.contentDocument).filter((d) => d && d.querySelector('[class^="a24-1"]'))
        .map((d) => d.querySelector('.a24-1__figure') !== null))
      await page.keyboard.press('Escape')
      await page.waitForTimeout(400)
      return seen
    }
    const cardWith513 = await cardFigure513()

    await page.locator('#editor-source').click()
    await page.waitForTimeout(500)
    await page.locator(`#editor-source-menu [data-subject-row="${WITHOUT513.slug}"]`).click()
    await page.waitForTimeout(600)
    const noPic513 = await featureNow()
    check('step 89 — FR-H8: an article with no picture loses the WHOLE element — not an empty box, not a gap. Two articles, two different pages.',
      noPic513.figure === false && noPic513.img === false && (await sourcePill()).subject === WITHOUT513.title,
      JSON.stringify({ with: withPic513, without: noPic513 }))
    const cardWithout513 = await cardFigure513()
    check('step 89 — a picker card previews the article the canvas is previewing, and repaints when it changes (the card was already drawn)',
      cardWith513.length > 0 && cardWith513.every((f) => f === true) && cardWithout513.length > 0 && cardWithout513.every((f) => f === false),
      JSON.stringify({ with: cardWith513, without: cardWithout513 }))

    // ── the choice is a STATED, STORED one: it survives a reload, and it is per canvas ──
    await page.waitForTimeout(1200)
    await page.reload({ waitUntil: 'load' })
    await page.waitForTimeout(1200)
    const afterReload513 = await sourcePill()
    check('step 89 — the choice survives a reload: `project_template_prefs.preview_subject`, its first writer and its first reader',
      afterReload513 !== null && afterReload513.subject === WITHOUT513.title && (await featureNow()).figure === false, JSON.stringify(afterReload513 && { subject: afterReload513.subject }))
    const stored513 = (await call('/rest/v1', `/project_template_prefs?project_id=eq.${P}&template_key=eq.post&select=template_key,preview_subject,user_id`)).body ?? []
    check('step 89 — and it is the row the schema has been holding since day one, against this user',
      stored513.length === 1 && stored513[0].preview_subject?.slug === WITHOUT513.slug && stored513[0].preview_subject?.kind === 'post' && stored513[0].user_id === ids[0],
      JSON.stringify(stored513))

    // ── THE ARCHIVE, WHICH WAS WRONG BEFORE ANYBODY CHOSE ANYTHING ──
    await page.goto(editorUrl('tag'), { waitUntil: 'load' })
    await page.waitForTimeout(1200)
    const tagFixture513 = OW513.fixtureSubject('tag.hbs')
    const tagCtx513 = OW513.templateContext('tag.hbs', 'first', tagFixture513)
    const tagRows513 = SUBJ.subjectOptions(SRC513, 'tag')
    const tagPill513 = await sourcePill()
    const tagText513 = await canvasWords()
    const mine513 = tagCtx513.ghost.posts.map((p) => p.title)
    const others513 = OW513.posts().map((p) => p.title).filter((t) => !mine513.includes(t))
    check('step 89 — the Tag canvas names its tag, untouched, and the tag it names is the fixture the library derives',
      tagPill513 !== null && tagPill513.has === 'true' && tagPill513.subject === tagRows513.find((r) => r.slug === tagFixture513.slug).title,
      JSON.stringify(tagPill513 && { subject: tagPill513.subject, want: tagFixture513.slug }))
    check('step 89 — AND IT RENDERS THAT TAG\'S OWN POSTS: every post on the page carries the tag, and no post that does not is drawn. Before this story it drew the whole site.',
      mine513.every((t) => tagText513.includes(t)) && !others513.some((t) => tagText513.includes(t)),
      JSON.stringify({ missing: mine513.filter((t) => !tagText513.includes(t)), strangers: others513.filter((t) => tagText513.includes(t)).slice(0, 3), total: tagCtx513.ghost.pagination.total }))
    // and each canvas remembers its OWN subject — the Post canvas's choice did not follow us here
    check('step 89 — the preference is PER CANVAS: the article chosen on Post is not what the Tag canvas is showing',
      tagPill513 !== null && tagPill513.subject !== WITHOUT513.title, JSON.stringify(tagPill513 && { tag: tagPill513.subject, post: WITHOUT513.title }))
    // choosing a different tag re-filters the page
    const otherTag513 = tagRows513.find((r) => r.slug !== tagFixture513.slug)
    await page.locator('#editor-source').click()
    await page.waitForTimeout(500)
    await page.locator(`#editor-source-menu [data-subject-row="${otherTag513.slug}"]`).click()
    await page.waitForTimeout(800)
    const other513 = OW513.templateContext('tag.hbs', 'first', { kind: 'tag', slug: otherTag513.slug }).ghost.posts.map((p) => p.title)
    const otherText513 = await canvasWords()
    check('step 89 — choosing a different tag re-filters the page to THAT tag\'s posts',
      other513.every((t) => otherText513.includes(t)) && (await sourcePill()).subject === otherTag513.title,
      JSON.stringify({ tag: otherTag513.slug, missing: other513.filter((t) => !otherText513.includes(t)) }))

    // ── A SUBJECT THAT IS GONE: the fixture renders, the canvas is never empty, and it SAYS SO ──
    await page.goto('about:blank')
    await page.waitForTimeout(400)
    await call('/rest/v1', '/project_template_prefs', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ project_id: P, user_id: ids[0], template_key: 'post', preview_subject: { kind: 'post', slug: 'a-post-that-was-deleted' } }),
    })
    await page.goto(editorUrl('post'), { waitUntil: 'load' })
    await page.waitForTimeout(1400)
    const gone513 = await sourcePill()
    const goneSaid513 = await saidNow59()
    check('step 89 — FR-D22: a stored subject that no row holds renders the FIXTURE — the canvas is never empty — and the fallback is announced',
      gone513 !== null && gone513.subject === POSTS513[0].title && goneSaid513 === SUBJ.GONE({ kind: 'post', slug: 'a-post-that-was-deleted' }),
      JSON.stringify({ subject: gone513 && gone513.subject, said: goneSaid513 }))
    await page.locator('#editor-source').click()
    await page.waitForTimeout(500)
    const goneMenu513 = await page.evaluate(() => document.querySelector('#editor-source-menu [data-subject-gone]')?.textContent ?? null)
    check('step 89 — and the menu says it too, where the choice was made',
      goneMenu513 === SUBJ.GONE({ kind: 'post', slug: 'a-post-that-was-deleted' }), JSON.stringify({ menu: goneMenu513 }))
    const kept513 = (await call('/rest/v1', `/project_template_prefs?project_id=eq.${P}&template_key=eq.post&select=preview_subject`)).body ?? []
    check('step 89 — the stored value is KEPT, not deleted: a resource that comes back brings the choice back with it',
      kept513[0]?.preview_subject?.slug === 'a-post-that-was-deleted', JSON.stringify(kept513))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // the walk leaves the project as it found it — the docs to `freshLoad`, the preferences to none
    await call('/rest/v1', `/project_template_prefs?project_id=eq.${P}`, { method: 'DELETE' })
    await freshLoad()

    /* ── step 90 — STORY 5.14, VIEW AS AND THE NUDGE THAT NAMES WHAT I HAVE NOT LOOKED AT (FR-D16, R-167 to R-170) ───
       Every name, visitor and count below is DERIVED from `apps/web/lib/view-as.ts` — the one module the trigger, its
       menu, its dots, R-124's caption and the live region all read — and never restated here (standing rule 4). The
       owner amended S4d on this story's deployed build (2026-09-21): R-169 moved the reminder from a "2 not viewed"
       marker beside the button to a coral dot on each unviewed row of the menu, and R-170 gave each visitor ONE name,
       the menu row's title, so "Anonymous" is gone. The two members-aware pilots are read by their own classes: Rail
       (`a1/1`, the site-wide header) and the Inline Row (`a22/1`, on Home). On both of them Free and Paid draw the same
       thing, so a section whose Member visibility separates the two is the only place they can be told apart before
       Epics 9 and 10 — which is what R-168's half of this step uses. It opens on a CLEAN record: every
       `project_template_prefs` row of the project goes first. */
    const [ANON90, FREE90, PAID90] = VA.VISITORS
    /** R-170: a visitor's one name, the menu row's title — the trigger prints it too */
    const name90 = (v) => VA.ROWS[v].title
    const bar90 = () => page.evaluate(() => {
      const box = (el) => (el ? el.getBoundingClientRect().toJSON() : null)
      const header = document.querySelector('header')
      const trig = document.getElementById('editor-view-as')
      const group = document.getElementById('editor-centre')
      const hb = box(header)
      const gb = box(group)
      // the bar's own words: every leaf OUTSIDE a popover, so an open menu's rows are never read as the bar
      const bare = [...(header?.querySelectorAll('*') ?? [])].filter((el) => el.children.length === 0 && !el.closest('[popover]')).map((el) => el.textContent).join(' ')
      return {
        value: trig?.querySelector('[data-current]')?.textContent ?? null,
        // innerText leaves out the two names held `invisible` for the slot's width, as the accessible name does
        name: (trig?.innerText ?? '').replace(/\s+/g, ' ').trim(),
        label: trig?.getAttribute('aria-label') ?? null,
        describedBy: trig?.getAttribute('aria-describedby') ?? null,
        // R-171 took the eye off the trigger: its one glyph is the chevron
        glyphs: trig ? trig.querySelectorAll('svg').length : null,
        eye: trig ? [...trig.querySelectorAll('svg path')].some((p) => p.getAttribute('d') === 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z') : null,
        groupOff: gb && hb ? (gb.left + gb.right) / 2 - (hb.left + hb.right) / 2 : null,
        template: box(document.getElementById('editor-template'))?.left ?? null,
        // R-169: S4d's marker is not built — nothing sits beside the trigger, and no word of it is in the bar
        marker: document.getElementById('editor-view-as-marker') !== null || /not viewed/i.test(bare),
        anonymous: /anonymous/i.test(bare),
        // the control for the two absences above: the same reading DOES find the bar's words
        reads: bare.includes('View as') && bare.includes('Template'),
        trigBox: box(trig),
        // S4a's right-hand cluster: the dice, the sun, the device track, Theme settings and, since Story 5.15, B3a's
        // Preview pill last — measured 44px of room at 1280 in the harness (2026-09-22), meeting the group near 1190
        clusterBox: box(document.getElementById('editor-theme-settings')?.parentElement),
      }
    })
    /** R-169's dots, by visitor — read from the document whether or not the menu is open: a closed popover's rows are
     *  still in it, only not drawn */
    const dots90 = () => page.evaluate(() => [...document.querySelectorAll('#editor-view-as-menu [data-visitor]')]
      .filter((r) => r.querySelector('[data-not-viewed]')).map((r) => r.dataset.visitor))
    const menu90 = () => page.evaluate((word) => {
      const m = document.getElementById('editor-view-as-menu')
      if (!m || !m.matches(':popover-open')) return null
      const tb = document.getElementById('editor-view-as').getBoundingClientRect()
      const mb = m.getBoundingClientRect()
      const h = document.getElementById('editor-view-as-heading')
      const rows = [...m.querySelectorAll('[data-visitor]')]
      const dotted = rows.filter((r) => r.querySelector('[data-not-viewed]'))
      return {
        heading: h?.textContent ?? null,
        upper: h ? getComputedStyle(h).textTransform : null,
        width: Math.round(mb.width),
        centreOff: (mb.left + mb.right) / 2 - (tb.left + tb.right) / 2,
        below: mb.top >= tb.bottom,
        visitors: rows.map((r) => r.dataset.visitor),
        titles: rows.map((r) => r.querySelector('[data-name]')?.textContent ?? null),
        words: rows.map((r) => r.textContent.replace(/\s+/g, ' ').trim()),
        current: rows.filter((r) => r.getAttribute('aria-current') === 'true').map((r) => r.dataset.visitor),
        // a tick would be the row's one polyline (the three glyphs are paths and circles) — R-172 draws none
        checked: rows.filter((r) => r.querySelector('polyline')).map((r) => r.dataset.visitor),
        dots: dotted.map((r) => r.dataset.visitor),
        // the dot as DRAWN, and its word: in the row for a screen reader, and printed nowhere (a box of at most 1px)
        dotLook: dotted.map((r) => {
          const d = r.querySelector('[data-not-viewed]')
          const b = d.getBoundingClientRect()
          const w = [...r.querySelectorAll('span')].find((s) => s.textContent === word)
          const wb = w?.getBoundingClientRect()
          return { w: b.width, h: b.height, bg: getComputedStyle(d).backgroundColor, word: !!w && wb.width <= 1 && wb.height <= 1 }
        }),
        // R-172: the current row takes the coral tint in place of S4d's tick
        tint: rows.filter((r) => r.getAttribute('aria-current') === 'true').map((r) => getComputedStyle(r).backgroundColor),
      }
    }, VA.NOT_VIEWED)
    const openMenu90 = async () => {
      if ((await menu90()) === null) {
        await page.locator('#editor-view-as').click()
        await page.waitForTimeout(350)
      }
      return menu90()
    }
    const closeMenu90 = async () => {
      if ((await menu90()) !== null) {
        await page.keyboard.press('Escape')
        await page.waitForTimeout(200)
      }
    }
    const pick90 = async (v) => {
      await openMenu90()
      await page.locator(`#editor-view-as-menu [data-visitor="${v}"]`).click()
      await page.waitForTimeout(600)
    }
    /** what the two members-aware pilots drew: Rail's action links and the Inline Row's slot */
    const members90 = () => canvasFrame().evaluate(() => ({
      rail: [...document.querySelectorAll('#canvas .a1-1__signin, #canvas .a1-1__cta')].map((a) => a.textContent.trim()),
      form: document.querySelectorAll('#canvas .a22-1__form').length,
      signed: [...document.querySelectorAll('#canvas .a22-1__signed-title')].map((x) => x.textContent.trim()),
    }))
    const signedIn90 = (m) => m.rail.includes('Account') && !m.rail.includes('Sign in') && m.form === 0 && m.signed.includes('Signed in')
    const signedOut90 = (m) => m.rail.includes('Sign in') && !m.rail.includes('Account') && m.form > 0 && m.signed.length === 0
    const meets90 = (a, b) => !!a && !!b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
    const same90 = (a, b) => JSON.stringify(a) === JSON.stringify(b)
    const storedViewed90 = async (key) => (await call('/rest/v1', `/project_template_prefs?project_id=eq.${P}&template_key=eq.${key}&select=member_states_viewed,user_id`)).body ?? []

    await call('/rest/v1', `/project_template_prefs?project_id=eq.${P}`, { method: 'DELETE' })
    await freshLoad()
    await page.mouse.move(120, 400)

    // ── opening: S4a's trigger, the centred group, and nothing beside it ──
    const open90 = await bar90()
    check('step 90 — the trigger reads "View as" and R-170\'s "Logged out user" at 32px, with NO eye since R-171 (its one glyph the chevron), named by its own words (no aria-label, WCAG 2.5.3), and "Anonymous" is nowhere in the bar',
      open90.value === name90(ANON90) && open90.name === `${VA.LABEL} ${name90(ANON90)}` && open90.glyphs === 1 && open90.eye === false &&
      open90.trigBox?.height === 32 && open90.label === null && open90.reads && open90.anonymous === false,
      JSON.stringify({ value: open90.value, name: open90.name, glyphs: open90.glyphs, eye: open90.eye, h: open90.trigBox?.height, label: open90.label, reads: open90.reads, anonymous: open90.anonymous }))
    check('step 90 — R-169: no marker beside the trigger and no "not viewed" anywhere in the bar, the trigger described by nothing, and the canvas the signed-out render (Rail offers Sign in, the Inline Row its form)',
      open90.reads && open90.marker === false && open90.describedBy === null && signedOut90(await members90()),
      JSON.stringify({ reads: open90.reads, marker: open90.marker, describedBy: open90.describedBy, canvas: await members90() }))
    const offsets90 = [[name90(ANON90), open90.groupOff]]

    // ── the group stays centred and the trigger clear of the right-hand cluster, at 1440 and at 1280 ──
    const clear90 = []
    for (const width of [1440, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(400)
      const b = await bar90()
      clear90.push({ width, meets: meets90(b.trigBox, b.clusterBox), room: b.trigBox && b.clusterBox && Math.round(b.clusterBox.left - b.trigBox.right), groupOff: b.groupOff })
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForTimeout(400)
    check('step 90 — at 1440 and 1280 the group stays centred and the trigger never meets the right-hand cluster',
      clear90.every((c) => c.meets === false && c.room > 0 && Math.abs(c.groupOff) < 2), JSON.stringify(clear90))

    // ── and the LEFT cluster never runs under the group: a project name at its limit, beside the widest canvas label ──
    const labels90 = Object.values(CANVASES).map((c) => c.label)
    const room90 = []
    for (const width of [1440, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(400)
      room90.push({ width, ...(await page.evaluate((labels) => {
        // React's OWN text nodes are borrowed and given back, so nothing it renders afterwards is left detached
        const nameText = document.querySelector('header > span.truncate')?.firstChild
        const labelText = document.querySelector('#editor-template span.font-semibold')?.firstChild
        if (!nameText || !labelText) return { room: null }
        const [name, label] = [nameText.nodeValue, labelText.nodeValue]
        nameText.nodeValue = 'An exceptionally long project name that runs far past any sensible length for a publication'
        const leftEnds = document.getElementById('editor-history').getBoundingClientRect().right
        // the widest label is whichever pushes the centred group furthest left — measured, never named here
        const widest = labels.map((l) => {
          labelText.nodeValue = l
          return { l, left: document.getElementById('editor-centre').getBoundingClientRect().left }
        }).sort((a, b) => a.left - b.left)[0]
        nameText.nodeValue = name
        labelText.nodeValue = label
        return { widest: widest.l, room: Math.round(widest.left - leftEnds) }
      }, labels90)) })
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForTimeout(400)
    check('step 90 — a project name at its limit still ends clear of the centred group beside the widest canvas label, at 1440 and 1280',
      room90.every((r) => r.room !== null && r.room >= 8), JSON.stringify(room90))

    // ── S4d's menu, and R-169's dots in it ──
    const shown90 = await openMenu90()
    check('step 90 — S4d: "Preview as" (drawn uppercase), then exactly the three visitors in order, each with its one name and caption — no tier row and no comped row (B9: "only")',
      shown90 !== null && shown90.heading === VA.HEADING && shown90.upper === 'uppercase' &&
      same90(shown90.visitors, VA.VISITORS) && same90(shown90.titles, VA.VISITORS.map(name90)) &&
      VA.VISITORS.every((v, n) => shown90.words[n].includes(VA.ROWS[v].caption)) && !shown90.words.some((w) => /comped|tier|supporter|patron/i.test(w)),
      JSON.stringify(shown90))
    check('step 90 — R-172: the current row is HIGHLIGHTED with the coral tint and no row carries a tick; the menu is 260 wide and centred under the trigger (S4d :399)',
      shown90 !== null && same90(shown90.current, [ANON90]) && same90(shown90.checked, []) &&
      shown90.tint.every((t) => t === TINT) && shown90.width === 260 && Math.abs(shown90.centreOff) < 1 && shown90.below,
      JSON.stringify(shown90 && { current: shown90.current, checked: shown90.checked, tint: shown90.tint, width: shown90.width, centreOff: shown90.centreOff }))
    check('step 90 — R-169: each unviewed row, and only those, carries ONE coral dot — 8px, coral-deep — with its word "Not viewed" in the row for a screen reader and printed nowhere',
      shown90 !== null && same90(shown90.dots, VA.unviewed([ANON90])) &&
      shown90.dotLook.every((d) => d.w === 8 && d.h === 8 && d.bg === 'rgb(232, 75, 52)' && d.word === true),
      JSON.stringify(shown90 && { dots: shown90.dots, look: shown90.dotLook }))

    // ── THE OWNER'S FINDING (2026-09-21): a press on the CANVAS closes an open menu, as a press anywhere else does. The
    //    canvas is another document, so the platform's light dismiss never heard it; both of the bar's menus, open
    //    first (the control), then pressed away ──
    const canvasPress90 = async () => {
      const f = await page.locator('section[aria-label="Canvas"] iframe').boundingBox()
      await page.mouse.click(f.x + f.width / 2, f.y + f.height - 12)
      await page.waitForTimeout(300)
    }
    const viewAsWasOpen90 = (await menu90()) !== null
    await canvasPress90()
    const viewAsClosed90 = (await menu90()) === null
    await page.locator('#editor-template').click()
    await page.waitForTimeout(300)
    const templateWasOpen90 = await page.evaluate(() => document.getElementById('editor-template-menu').matches(':popover-open'))
    await canvasPress90()
    const templateClosed90 = await page.evaluate(() => !document.getElementById('editor-template-menu').matches(':popover-open'))
    check('step 90 — a press on the canvas closes an open menu — View as\'s and Template\'s — as a press anywhere else in the editor does',
      viewAsWasOpen90 && viewAsClosed90 && templateWasOpen90 && templateClosed90,
      JSON.stringify({ viewAsWasOpen90, viewAsClosed90, templateWasOpen90, templateClosed90 }))

    // ── Paid: repainted as a paid member, announced, and one dot left ──
    await pick90(PAID90)
    const paid90 = await bar90()
    const paidCanvas90 = await members90()
    check('step 90 — Paid: Rail\'s Sign in and Subscribe become Account, the Inline Row\'s form becomes "Signed in", the trigger names the visitor, and #editor-said announces it',
      signedIn90(paidCanvas90) && paid90.value === name90(PAID90) && (await saidNow59()) === VA.VIEW_AS_SAID(PAID90),
      JSON.stringify({ canvas: paidCanvas90, value: paid90.value, said: await saidNow59() }))
    offsets90.push([name90(PAID90), paid90.groupOff])
    check('step 90 — one dot is left, on exactly the one visitor still to look at', same90((await openMenu90())?.dots, VA.unviewed([ANON90, PAID90])),
      JSON.stringify((await menu90())?.dots))

    // ── Free: the same as Paid on these pilots, and the last dot goes ──
    await pick90(FREE90)
    const free90 = await bar90()
    check('step 90 — Free: the same signed-in render (both pilots draw Free and Paid alike), and announced',
      signedIn90(await members90()) && free90.value === name90(FREE90) && (await saidNow59()) === VA.VIEW_AS_SAID(FREE90),
      JSON.stringify({ value: free90.value, said: await saidNow59() }))
    offsets90.push([name90(FREE90), free90.groupOff])
    const allSeen90 = await openMenu90()
    check('step 90 — with all three looked at, no row of the menu carries a dot', allSeen90 !== null && allSeen90.dots.length === 0, JSON.stringify(allSeen90 && allSeen90.dots))

    // ── the logged out user: back again ──
    await pick90(ANON90)
    const anon90 = await bar90()
    check('step 90 — back to the logged out user: the signed-out render', signedOut90(await members90()) && anon90.value === name90(ANON90), JSON.stringify(await members90()))
    offsets90.push([`${name90(ANON90)}, again`, anon90.groupOff])
    check('step 90 — the centred group is centred to within 2px in all three visitors, and Template never moved',
      offsets90.every(([, off]) => off !== null && Math.abs(off) < 2) && [paid90, free90, anon90].every((b) => b.template === open90.template),
      JSON.stringify({ offsets: offsets90, template: [open90, paid90, free90, anon90].map((b) => b.template) }))

    // ── the record is REAL: the stored row holds all three, and a reload keeps every dot away ──
    let stored90 = []
    for (let i = 0; i < 20; i++) {
      stored90 = await storedViewed90('home')
      if (same90(stored90[0]?.member_states_viewed, VA.VISITORS)) break
      await page.waitForTimeout(500)
    }
    check('step 90 — `project_template_prefs.member_states_viewed` holds all three for Home, against this user — the column\'s first writer',
      stored90.length === 1 && same90(stored90[0].member_states_viewed, VA.VISITORS) && stored90[0].user_id === ids[0],
      JSON.stringify(stored90))
    await pick90(PAID90)
    await page.reload({ waitUntil: 'load' })
    await painted('home')
    await page.waitForTimeout(600)
    const reloaded90 = await bar90()
    const reloadedDots90 = await dots90()
    check('step 90 — a reload puts View as back to the logged out user (a mode, never stored), and the menu carries no dot: the record came back from the database',
      reloaded90.value === name90(ANON90) && reloadedDots90.length === 0 && reloaded90.marker === false && signedOut90(await members90()),
      JSON.stringify({ value: reloaded90.value, dots: reloadedDots90 }))

    // ── no key binds it (FR-D11): every printable character and the named keys, pressed on the canvas ──
    const keys90 = [...[...Array(94).keys()].map((n) => String.fromCharCode(33 + n)), 'Space', 'Enter', 'Delete', 'Backspace']
    const moved90 = []
    for (const key of keys90) {
      await page.locator('section[aria-label="Canvas"]').focus()
      await page.keyboard.press(key)
      // a dialog is closed again so the next key reaches the shell — and so is Preview, which `p` enters since Story 5.15
      if ((await page.locator('dialog[open]').count()) > 0 || (await page.locator('#editor-preview-bar').count()) > 0) await page.keyboard.press('Escape')
      const now = await bar90()
      if (now.value !== name90(ANON90) || /The canvas is previewing/.test(await saidNow59())) moved90.push(key)
    }
    check('step 90 — no key changes the visitor: every printable character and Space, Enter, Delete and Backspace leave View as where it was', moved90.length === 0 && (await menu90()) === null, JSON.stringify(moved90))
    // the keys moved the mode, the device and the folds, which are session state: a reload puts them back
    await page.reload({ waitUntil: 'load' })
    await painted('home')
    await page.waitForTimeout(600)
    check('step 90 — and the record still holds: nothing the keys did was a change to the page, so no dot came back', (await dots90()).length === 0, JSON.stringify(await dots90()))

    // ── R-168 and R-167 together: a section set to Paid members, and the edit that set it ──
    const roots90 = await rootCount()
    await clickOn(NEWS)
    await openGroup('Section Settings')
    await page.waitForTimeout(250)
    await controlsAside().getByRole('button', { name: 'Member visibility', exact: false }).first().click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Paid members', exact: true }).click()
    await page.waitForTimeout(600)
    check('step 90 — R-167: one edit brings the reminder back — the other two rows are dotted again, the page now viewed only as the visitor on screen',
      same90((await openMenu90())?.dots, VA.unviewed([ANON90])), JSON.stringify((await menu90())?.dots))
    await closeMenu90()
    const caption90 = async () => ((await controlsAside().innerText()).match(/The canvas is previewing[^\n]*/) ?? [null])[0]
    const layerRows90 = await page.locator('#editor-layers [data-layer-row]').count()
    await pick90(FREE90)
    const freeGated90 = { roots: await rootCount(), caption: await caption90(), rows: await page.locator('#editor-layers [data-layer-row]').count() }
    check('step 90 — R-168: set to Paid members, the section is LEFT OUT for a free member, its Layers row stays, and the panel\'s caption names the visitor in its one name',
      freeGated90.roots === roots90 - 1 && freeGated90.rows === layerRows90 && (freeGated90.caption ?? '').includes(VA.PREVIEWING[FREE90]),
      JSON.stringify({ ...freeGated90, before: roots90 }))
    await pick90(PAID90)
    const paidGated90 = { roots: await rootCount(), caption: await caption90() }
    check('step 90 — and for a paid member it is drawn, with no caption', paidGated90.roots === roots90 && paidGated90.caption === null, JSON.stringify(paidGated90))
    await controlsAside().getByRole('button', { name: 'Member visibility', exact: false }).first().click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Everyone', exact: true }).click()
    await page.waitForTimeout(600)

    // ── a canvas switch keeps the visitor, and the menu dots THAT canvas's own record ──
    await page.locator('#editor-template').click()
    await page.waitForTimeout(300)
    await page.locator('#editor-template-menu [data-canvas="post"]').click()
    await painted('post')
    await page.waitForTimeout(800)
    const post90 = await bar90()
    const postDots90 = await dots90()
    check('step 90 — Home → Post: View as is unchanged, Post records the visitor, and the menu dots Post\'s own record',
      post90.value === name90(PAID90) && same90(postDots90, VA.unviewed([PAID90])) && (await members90()).rail.includes('Account'),
      JSON.stringify({ value: post90.value, dots: postDots90, rail: (await members90()).rail }))

    // ── ⌘K under Paid: the Inline Row's card is drawn as a paid member sees it ──
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+k`)
    await page.waitForTimeout(1200)
    for (const cell of await page.locator('dialog[open][aria-label="Add a section"] [data-cell]').all()) await cell.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1500)
    const cards90 = await page.evaluate(() => [...document.querySelectorAll('dialog[open][aria-label="Add a section"] iframe')]
      .map((f) => f.contentDocument).filter((d) => d && d.querySelector('.a22-1'))
      .map((d) => ({ form: d.querySelectorAll('.a22-1__form').length, signed: [...d.querySelectorAll('.a22-1__signed-title')].map((x) => x.textContent.trim()) })))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    check('step 90 — a ⌘K card for the Inline Row under Paid shows "Signed in" and no form: the picker previews as the canvas does',
      cards90.length > 0 && cards90.every((c) => c.form === 0 && c.signed.includes('Signed in')), JSON.stringify(cards90))

    // the walk leaves the project as it found it — the records to none, the docs to `freshLoad`
    await call('/rest/v1', `/project_template_prefs?project_id=eq.${P}`, { method: 'DELETE' })
    await freshLoad()

    /* ── step 91 — Story 5.15: behaviours hold still while designing, and Preview runs them (FR-D20, B3a · B3b, R-174,
       R-175, DW-136) ─────────────────────────────────────────────────────────────────────────────────────────────────
       INSIDE STEP 5's CSP SESSION, so its zero covers `core` running from the editor against the canvas window in BOTH
       modes — "code in the editor's realm acting on the canvas window compiles nothing there" is reasoned, and this is
       where it is executed (standing rule 1); its negative control, `eval` called from the editor on the canvas window,
       is step 5's, after the zero is read. The SHIPPED LIBRARY HOLDS NO HELD-STILL PART THAT MOVES BY ITSELF — the pilots'
       `nav-drawer` and `member-form` both wait for a press — so no chip is drawn anywhere here (R-175), and the chip's
       own look is the keyboard journey's, in CI, on controls fixture 1. Every word is the app's own. */
    const chips91 = () => canvasFrame().evaluate(() => [...document.querySelectorAll('[data-inflozo-chrome]')].reduce((n, h) => n + (h.shadowRoot?.querySelectorAll('[data-chrome="paused"]').length ?? 0), 0))
    const branches91 = () => canvasFrame().evaluate(() => ({
      bar: document.querySelector('.a1-1__bar')?.classList.contains('js-enabled') ?? null,
      form: document.querySelector('.a22-1__form')?.classList.contains('js-enabled') ?? null,
      mounts: document.querySelectorAll('#canvas [data-module]').length,
      enabled: document.querySelectorAll('#canvas .js-enabled').length,
    }))
    const header91 = () => canvasFrame().evaluate(() => {
      const shown = (s) => getComputedStyle(document.querySelector(s)).display !== 'none'
      return { menu: shown('.a1-1__menu'), links: shown('.a1-1__nav') }
    })
    const chrome91 = () => page.evaluate(() => ({
      bar: document.getElementById('editor-preview-bar') !== null,
      header: document.querySelector('header')?.checkVisibility() ?? null,
      layers: document.getElementById('editor-layers')?.checkVisibility() ?? null,
      controls: document.getElementById('editor-controls')?.checkVisibility() ?? null,
      chip: document.getElementById('editor-viewport')?.checkVisibility() ?? null,
      source: document.getElementById('editor-source')?.checkVisibility() ?? null,
      hosts: document.querySelector('section[aria-label="Canvas"] iframe').contentDocument.querySelectorAll('[data-inflozo-chrome]').length,
      marks: [...document.querySelector('section[aria-label="Canvas"] iframe').contentDocument.querySelectorAll('*')].filter((el) => [...el.attributes].some((a) => a.name.startsWith('data-inflozo-'))).length,
      // an id, else a name, else the words: the canvas container is `Canvas`, Back to editing is its words
      focus: ((d) => d?.id || d?.getAttribute('aria-label') || (d?.textContent ?? '').replace(/\s+/g, ' ').trim() || d?.tagName)(document.activeElement),
    }))
    const alpha = (colour, a) => new RegExp(`(?:/ |, )${String(a).replace('.', '\\.')}\\)$`).test(colour)

    // ── at rest: every held-still mount at rest, and no chip ──
    const rest91 = await branches91()
    check('step 91 — at rest, every mount the table holds still is AT REST: Rail\'s bar and the Inline Row\'s form carry no js-enabled, and no PAUSED chip exists (R-174, FR-G7(4), R-175)',
      rest91.mounts > 0 && rest91.bar === false && rest91.form === false && rest91.enabled === 0 && (await chips91()) === 0, JSON.stringify(rest91))

    // ── R-175: Rail and the Inline Row, hovered and then selected — their parts wait for a press ──
    for (const n of [HEADER, NEWS]) {
      await hoverOn(n)
      const hovered = { tag: (await tagNow())?.text ?? null, chips: await chips91() }
      await clickOn(n)
      const selected = { selected: (await onScreen(n)).selected, chips: await chips91() }
      check(`step 91 — R-175: ${layerOf(n)} hovered and then selected carries NO PAUSED chip — its part waits for a press`,
        hovered.tag === layerOf(n) && hovered.chips === 0 && selected.selected && selected.chips === 0, JSON.stringify({ hovered, selected }))
    }
    await page.keyboard.press('Escape')
    await page.mouse.move(120, 400)
    await page.waitForTimeout(300)

    // ── B3a's pill, measured where it is drawn ──
    const pill91 = await page.evaluate(() => {
      const b = document.getElementById('editor-preview')
      if (!b) return null
      const c = getComputedStyle(b)
      const word = b.querySelector('span.font-semibold')
      const cap = b.querySelector('span[aria-hidden]')
      const svg = b.querySelector('svg')
      const [w, k] = [getComputedStyle(word), getComputedStyle(cap)]
      return {
        last: b.parentElement.lastElementChild === b && b.parentElement === document.getElementById('editor-theme-settings')?.parentElement,
        label: b.getAttribute('aria-label'), keys: b.getAttribute('aria-keyshortcuts'), pressed: b.getAttribute('aria-pressed'),
        fill: c.backgroundColor, line: `${c.borderTopWidth} ${c.borderTopColor}`, radius: c.borderRadius, padding: c.padding, gap: c.gap,
        word: { text: word?.textContent, size: w.fontSize, weight: w.fontWeight },
        cap: { text: cap?.textContent, size: k.fontSize, mono: /mono/i.test(k.fontFamily), fill: k.backgroundColor, ink: k.color, radius: k.borderRadius, padding: k.padding },
        eye: { size: svg?.getAttribute('width'), stroke: svg?.getAttribute('stroke-width'), ink: getComputedStyle(svg).color },
      }
    })
    // `B Missing Surfaces.dc.html:645-649` — white, a 1px line (#E7E2DB), the pill radius, `4px 10px 4px 8px`, a 7px gap; the
    // eye 13px at 1.6 in #6E6A64; "Preview" 12/600; the mono P cap 10px on #EFECE7 in #6B6459, a 4px radius and `1px 5px`
    check('step 91 — B3a: the Preview pill is the right-hand cluster\'s last control, as drawn — eye · "Preview" · the P cap — named by its word with aria-keyshortcuts="P" and no aria-pressed',
      pill91 !== null && pill91.last && pill91.label === null && pill91.keys === 'P' && pill91.pressed === null &&
      pill91.fill === 'rgb(255, 255, 255)' && pill91.line === '1px rgb(231, 226, 219)' && pill91.radius === '24px' && pill91.padding === '4px 10px 4px 8px' && pill91.gap === '7px' &&
      pill91.word.text === PV.PREVIEW && pill91.word.size === '12px' && pill91.word.weight === '600' &&
      pill91.cap.text === 'P' && pill91.cap.size === '10px' && pill91.cap.mono && pill91.cap.fill === 'rgb(239, 236, 231)' && pill91.cap.ink === 'rgb(107, 100, 89)' && pill91.cap.radius === '4px' && pill91.cap.padding === '1px 5px' &&
      pill91.eye.size === '13' && pill91.eye.stroke === '1.6' && pill91.eye.ink === 'rgb(110, 106, 100)', JSON.stringify(pill91))

    // ── in, by the pill: B3b, the chrome gone, and every module running ──
    await freshLoad()
    await clickOn(GRID)
    const chosen91 = layerOf(GRID)
    await page.mouse.move(120, 400)
    await page.locator('#editor-preview').click()
    await page.waitForTimeout(700)
    const in91 = await chrome91()
    const card91 = await page.evaluate(() => document.querySelector('section[aria-label="Canvas"]').firstElementChild.getBoundingClientRect().toJSON())
    const said91 = await saidNow59()
    check('step 91 — the pill goes in: every piece of editing chrome is hidden (the bar, Layers, Controls, the fit chip, the source pill, the chrome layer, every state mark), B3b\'s bar is shown with focus on Back to editing, and it is said',
      in91.bar && in91.header === false && in91.layers === false && in91.controls === false && in91.chip === false && in91.source === false && in91.hosts === 0 && in91.marks === 0 &&
      in91.focus.startsWith(PV.BACK) && said91 === PV.PREVIEW_SAID, JSON.stringify({ ...in91, said: said91 }))
    check('step 91 — the stage is the whole window: in a 1440 × 900 window the page is 1:1, edge to edge (R-137\'s fit, B3b)',
      card91.left === 0 && card91.top === 0 && card91.width === DEVICE_DESKTOP.width && card91.height === DEVICE_DESKTOP.height, JSON.stringify(card91))
    const preview91 = await branches91()
    check('step 91 — Preview runs everything the build carries: every declared mount carries js-enabled, the two pilots\' no-op stand-ins included (FR-G7(2))',
      preview91.mounts > 0 && preview91.enabled === preview91.mounts && preview91.bar === true && preview91.form === true, JSON.stringify(preview91))
    const bar91 = await page.evaluate(() => {
      const b = document.getElementById('editor-preview-bar')
      const c = getComputedStyle(b)
      const r = b.getBoundingClientRect()
      const back = b.querySelector('button')
      const bc = getComputedStyle(back)
      const esc = back.querySelector('span[aria-hidden]')
      const ec = getComputedStyle(esc)
      const divider = b.querySelector(':scope > span[aria-hidden]')
      const dc = getComputedStyle(divider)
      return {
        role: b.getAttribute('role'), label: b.getAttribute('aria-label'), left: r.left, bottom: innerHeight - r.bottom,
        fill: c.backgroundColor, radius: c.borderRadius, padding: c.padding, gap: c.gap, shadow: c.boxShadow,
        back: { h: back.getBoundingClientRect().height, radius: bc.borderRadius, padding: bc.padding, size: bc.fontSize, weight: bc.fontWeight, ink: bc.color, keys: back.getAttribute('aria-keyshortcuts'), glyph: `${back.querySelector('svg')?.getAttribute('width')}/${back.querySelector('svg')?.getAttribute('stroke-width')}` },
        esc: { text: esc.textContent, hidden: esc.getAttribute('aria-hidden'), size: ec.fontSize, mono: /mono/i.test(ec.fontFamily), fill: ec.backgroundColor, radius: ec.borderRadius, padding: ec.padding },
        divider: { w: divider.getBoundingClientRect().width, h: divider.getBoundingClientRect().height, fill: dc.backgroundColor },
        devices: [...b.querySelectorAll('[role="radio"]')].map((d) => ({ label: d.getAttribute('aria-label'), on: d.getAttribute('aria-checked') === 'true', w: d.getBoundingClientRect().width, h: d.getBoundingClientRect().height, fill: getComputedStyle(d).backgroundColor })),
      }
    })
    // `B Missing Surfaces.dc.html:700-710` — ink, the pill radius, 5px padding, a 2px gap and B3b's .24 shadow (`modal`'s .25)
    // at 18px off the window's bottom-left; Back to editing 34px high at a 20px radius and `0 15px`, the 14px slashed eye at
    // 1.7, 13/600 white words and the mono `esc` cap at 10.5px on white .16; a 1px × 20px divider at white .18; the three
    // devices at 34px, the current one on white .14
    check('step 91 — B3b: the floating bar as drawn — ink, 18px off the bottom-left, Back to editing with its esc cap, the divider and the three devices, the current one lit',
      bar91.role === 'toolbar' && bar91.label === PV.PREVIEW && bar91.left === 18 && bar91.bottom === 18 &&
      bar91.fill === 'rgb(28, 27, 26)' && bar91.radius === '24px' && bar91.padding === '5px' && bar91.gap === '2px' && /rgba\(28, 27, 26, 0\.25\) 0px 12px 40px/.test(bar91.shadow) &&
      bar91.back.h === 34 && bar91.back.radius === '20px' && bar91.back.padding === '0px 15px' && bar91.back.size === '13px' && bar91.back.weight === '600' && bar91.back.ink === 'rgb(255, 255, 255)' && bar91.back.keys === 'Escape' && bar91.back.glyph === '14/1.7' &&
      bar91.esc.text === 'esc' && bar91.esc.hidden === 'true' && bar91.esc.size === '10.5px' && bar91.esc.mono && alpha(bar91.esc.fill, 0.16) && bar91.esc.radius === '4px' && bar91.esc.padding === '2px 6px' &&
      bar91.divider.w === 1 && bar91.divider.h === 20 && alpha(bar91.divider.fill, 0.18) &&
      JSON.stringify(bar91.devices.map((d) => d.label)) === JSON.stringify(LABELS) && bar91.devices.every((d) => d.w === 34 && d.h === 34) &&
      bar91.devices.filter((d) => d.on).map((d) => d.label).join() === DEVICE_DESKTOP.label && bar91.devices.every((d) => (d.on ? alpha(d.fill, 0.14) : d.fill === 'rgba(0, 0, 0, 0)')),
      JSON.stringify(bar91))

    // ── a press in Preview reaches the page, and never leaves the canvas ──
    const href91 = await canvasFrame().evaluate(() => location.href)
    await hoverOn(GRID)
    const hoveredIn91 = await chrome91()
    await clickOn(GRID)
    const clickedIn91 = await chrome91()
    check('step 91 — in Preview a hover and a click select and outline NOTHING: no chrome layer, no state mark, no chip',
      hoveredIn91.hosts === 0 && hoveredIn91.marks === 0 && clickedIn91.hosts === 0 && clickedIn91.marks === 0 && (await chips91()) === 0, JSON.stringify({ hoveredIn91, clickedIn91 }))
    const link91 = await canvasFrame().evaluate(() => {
      const a = document.querySelector('.a1-1__items a[href]')
      a.scrollIntoView({ block: 'center' })
      const r = a.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, href: a.href }
    })
    const frameBox91 = await page.locator('section[aria-label="Canvas"] iframe').boundingBox()
    // through the fit, which is 1 in Preview's 1440 × 900 window, and never assumed to be
    const k91 = frameBox91.width / DEVICE_DESKTOP.width
    await page.mouse.click(frameBox91.x + link91.x * k91, frameBox91.y + link91.y * k91)
    await page.waitForTimeout(600)
    const afterLink91 = await canvasFrame().evaluate(() => location.href)
    await canvasFrame().evaluate(() => document.querySelector('.a22-1__field').scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(200)
    const field91 = await canvasFrame().evaluate(() => { const r = document.querySelector('.a22-1__field').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    await page.mouse.click(frameBox91.x + field91.x * k91, frameBox91.y + field91.y * k91)
    await page.keyboard.type('preview@example.com')
    const typed91 = await canvasFrame().evaluate(() => document.querySelector('.a22-1__field').value)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(800)
    const afterSubmit91 = { href: await canvasFrame().evaluate(() => location.href), bar: (await chrome91()).bar }
    check('step 91 — a link and a submit in Preview leave the page where it is (AD-21), while the page\'s own field takes typing — a p included — and Preview stays on',
      afterLink91 === href91 && link91.href !== href91 && typed91 === 'preview@example.com' && afterSubmit91.href === href91 && afterSubmit91.bar, JSON.stringify({ href91, link91, afterLink91, typed91, afterSubmit91 }))

    // ── Mobile: the header's JavaScript branch only in Preview ──
    await page.locator(`#editor-preview-device [role="radio"][aria-label="${DEVICE.MOBILE.label}"]`).click()
    await page.waitForTimeout(700)
    const mobileIn91 = { header: await header91(), device: await page.evaluate(() => document.querySelector('#editor-device [aria-checked="true"]')?.getAttribute('aria-label')) }
    await page.locator('#editor-preview-bar button').first().click()
    await page.waitForTimeout(700)
    const out91 = await chrome91()
    const mobileOut91 = { header: await header91(), branches: await branches91(), panel: await page.evaluate(() => document.getElementById('editor-controls')?.getAttribute('aria-label')), head: await page.evaluate(() => document.getElementById('editor-panel-name')?.textContent), said: await saidNow59() }
    check('step 91 — at Mobile Rail shows its menu button and hides its links only in Preview; back to editing it lists its links again and shows no menu button, and B3b\'s device is the top bar\'s (one control, R-141)',
      mobileIn91.header.menu === true && mobileIn91.header.links === false && mobileIn91.device === DEVICE.MOBILE.label &&
      mobileOut91.header.menu === false && mobileOut91.header.links === true, JSON.stringify({ mobileIn91, mobileOut91 }))
    check('step 91 — Back to editing comes back: the chrome is shown, every held-still mount is at rest again, the selection made before Preview is still selected with its panel, focus is back on the pill, and it is said',
      out91.bar === false && out91.header && out91.layers && out91.controls && mobileOut91.branches.enabled === 0 &&
      mobileOut91.panel === 'Section settings' && mobileOut91.head === chosen91 && out91.focus === 'editor-preview' && mobileOut91.said === PV.BACK_SAID,
      JSON.stringify({ out91, mobileOut91 }))

    // ── `P` and `Esc` are the other two ways, and a key that is not one of Preview's does nothing there ──
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('p')
    await page.waitForTimeout(600)
    const byKey91 = await chrome91()
    for (const key of ['l', '.', '[', '?']) await page.keyboard.press(key)
    await page.waitForTimeout(400)
    const deadIn91 = { bar: (await chrome91()).bar, dialogs: await page.evaluate(() => document.querySelectorAll('dialog[open]').length), mode: await modeNow59() }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(600)
    const byEsc91 = await chrome91()
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('p')
    await page.waitForTimeout(500)
    await page.keyboard.press('p')
    await page.waitForTimeout(600)
    const byP91 = await chrome91()
    check('step 91 — `P` goes in, `Esc` and `P` come back, focus returning to the canvas each time, and in Preview L . [ ? do nothing',
      byKey91.bar && byKey91.focus.startsWith(PV.BACK) && deadIn91.bar && deadIn91.dialogs === 0 && deadIn91.mode === 'light' &&
      byEsc91.bar === false && byEsc91.layers && byEsc91.focus === 'Canvas' && byP91.bar === false && byP91.focus === 'Canvas',
      JSON.stringify({ byKey91, deadIn91, byEsc91, byP91 }))
    // the walk leaves the device where it found it — the next steps measure at Desktop
    await page.keyboard.press('1')
    await page.waitForTimeout(400)
    await freshLoad()

    /* ── step 92 — Story 5.16: PAGE 2, SEEN AND DESIGNED (FR-D21, D5d, R-176 to R-180) ──────────────────────────────
       INSIDE STEP 5's CSP SESSION, so its zero covers page 2 in and out. The seeded Home carries NO main feed — it was
       seeded before the flag (`seed-editor-project.mjs`), which is exactly the owner's Pilot sections — so `isMainFeed`
       is PLANTED on its post grid through the service key, after the editor has gone (step 52's pattern), and the seed
       and every row page 2 wrote are taken back at the end. Since Story 5.19 the editor repairs an unflagged Home as it
       reads it (`designate`, step 94), so the plant is exactly what the rule gives; it stays so that the stored `home`
       row page 2 is compared against carries the flag itself. Every value below is derived from the app's own modules and
       the library's `templateContext`, never written here: the rows page 2 lists, its pager, its address, its words. */
    const PT = await import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/page-two.ts')).href)
    const LIBW = LIB // one binding for the library, read at the top with the rest
    const OW = LIBW.orbitWeekly
    const rowOf92 = async (key) => (await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.${encodeURIComponent(key)}&select=doc`)).body?.[0]?.doc ?? null
    const pageNow92 = () => page.locator('section[aria-label="Canvas"] iframe').getAttribute('data-page')
    const waitPage92 = (n) => page.waitForFunction((v) => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.page === v, String(n), { timeout: 30000 })
    const saidNow92 = () => page.evaluate(() => document.getElementById('editor-said')?.textContent ?? '')
    const pollRow92 = async (key, test) => {
      for (let i = 0; i < 40; i++) {
        const doc = await rowOf92(key)
        if (test(doc)) return doc
        await page.waitForTimeout(500)
      }
      return rowOf92(key)
    }
    // THE FEED IS THE SYNTHESIS DEFAULTS' OWN: the Home row that table designates, read from the library on disk
    const FEED92 = autoStack('home').find((i) => i.isMainFeed)?.designId
    const seedHome92 = SEED_DOCS.find((r) => r.template_key === 'home')
    const plantedHome92 = { ...seedHome92.doc, instances: seedHome92.doc.instances.map((i) => ({ ...i, isMainFeed: i.designId === FEED92 })) }
    await leaveEditor()
    await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home`, { method: 'PATCH', body: JSON.stringify({ doc: plantedHome92 }) })
    check('step 92 — the control: the post grid is planted as Home\'s main feed, and no `index` row exists yet',
      (await rowOf92('home'))?.instances?.filter((i) => i.isMainFeed).map((i) => i.designId).join(',') === FEED92 && (await rowOf92('index')) === null, FEED92)
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    const gridAt92 = homeStack.findIndex(([d]) => d === FEED92)
    await rowAt(gridAt92).locator('button').first().click()
    await page.waitForTimeout(400)
    // D5d's ROW (`:429`): label left, the track right, 34 × 26 items at 12px, the current one white at 12/600 — at the
    // panel's foot, above "Reset this design", on the main feed and on no other section
    const row92 = () => page.evaluate(() => {
      const row = document.querySelector('#editor-controls [data-page-row]')
      if (!row) return null
      const label = row.querySelector('span')
      const track = row.querySelector('[role="radiogroup"]')
      const items = [...row.querySelectorAll('[role="radio"]')]
      const reset = [...document.querySelectorAll('#editor-controls button')].find((b) => b.textContent.includes('Reset this design'))
      const box = (el) => el.getBoundingClientRect()
      return {
        words: label.textContent, labelLeft: box(label).left < box(track).left, trackRight: Math.abs(box(track).right - box(row).right) < 1,
        items: items.map((i) => ({ text: i.textContent, w: box(i).width, h: box(i).height, size: getComputedStyle(i).fontSize, weight: getComputedStyle(i).fontWeight, bg: getComputedStyle(i).backgroundColor, checked: i.getAttribute('aria-checked') })),
        track: { bg: getComputedStyle(track).backgroundColor, radius: getComputedStyle(track).borderRadius, padding: getComputedStyle(track).padding },
        aboveReset: reset ? box(row).bottom <= box(reset).top : false,
        // R-181: the owner's note under the row, read by the group as its description
        note: row.querySelector('[id$="-page-note"]')?.textContent ?? null,
        describedBy: track.getAttribute('aria-describedby') !== null && track.getAttribute('aria-describedby') === row.querySelector('[id$="-page-note"]')?.id,
      }
    })
    const r92 = await row92()
    check('step 92 — D5d :429: the main feed\'s panel ends, above "Reset this design", with "Preview page" left and the 1 · 2 track right, 34 × 26 items at 12px, 1 on — and R-181\'s note under it, as the group\'s description',
      r92 !== null && r92.words === PT.PREVIEW_PAGE && r92.labelLeft && r92.trackRight && r92.aboveReset && r92.items.map((i) => i.text).join(',') === '1,2' &&
      r92.note === PT.LATER_PAGES && r92.describedBy &&
      r92.items.every((i) => Math.round(i.w) === 34 && Math.round(i.h) === 26 && i.size === '12px') && r92.items[0].checked === 'true' && r92.items[0].weight === '600' &&
      r92.items[0].bg === 'rgb(255, 255, 255)' && r92.track.radius === '24px' && r92.track.padding === '3px', JSON.stringify(r92))
    // R-176 — no other section of the page carries it
    let others92 = 0
    for (const n of homeStack.map((_, i) => i).filter((i) => i !== gridAt92)) {
      await rowAt(n).locator('button').first().click()
      await page.waitForTimeout(250)
      others92 += await page.locator('#editor-controls [data-page-row]').count()
    }
    check('step 92 — R-176: no other section\'s panel carries the row', others92 === 0, `${others92} rows`)
    await rowAt(gridAt92).locator('button').first().click()
    await page.waitForTimeout(300)

    /* ── step 93 — Story 5.16a: `{page_number}` AND R-185's PLACEHOLDER MENU, woven through step 92's page 2 ──────
       It rides here rather than standing alone because the offer IS a fact about the page on screen (R-186) and the
       section's own stamp (R-187), and step 92 is the only place that has both. Every expectation is derived from the
       library — `placeholdersOffered` and `PLACEHOLDERS` — never written here. Read-only in the two places that run
       before page 2 forks; the one insert waits until page 2 is already its own design. */
    const menu93 = async (label) => {
      const aside = controlsAside()
      const trigger = aside.getByRole('button', { name: `Placeholders for ${label}`, exact: true })
      if ((await trigger.count()) === 0) return null
      await trigger.first().click()
      await page.waitForTimeout(300)
      const read = await page.evaluate(() => {
        const card = [...document.querySelectorAll('[popover]')].find((el) => el.matches(':popover-open'))
        if (!card) return null
        const heading = card.querySelector('p')
        return {
          heading: heading?.textContent.trim() ?? null,
          rows: [...card.querySelectorAll('li')].map((li) => ({
            code: li.querySelector('[data-code]')?.textContent.trim() ?? null,
            caption: li.querySelector('[data-caption]')?.textContent.trim() ?? null,
            // R-188 finding 1: the buttons are glyphs, so their name arrives as `title` (the hover label the
            // owner asked for) — reading it here asserts the tooltip exists as well as naming the action
            actions: [...li.querySelectorAll('button')].map((b) => b.getAttribute('title')),
            words: [...li.querySelectorAll('button')].map((b) => b.textContent.trim()).join(''),
            // R-188 finding 4: the description is NOT cropped — no overflow, and no ellipsis rule on it
            clipped: (() => {
              const c = li.querySelector('[data-caption]')
              return c === null || c.scrollWidth > c.clientWidth || getComputedStyle(c).textOverflow === 'ellipsis'
            })(),
          })),
          // R-185 as amended: the card holds its rows and NOTHING else — no footer, no explanatory sentence
          extras: [...card.querySelector('ul').parentElement.children].filter((el) => el.tagName !== 'P' && el.tagName !== 'UL').length,
        }
      })
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
      return read
    }
    /* R-185 withdrew everything under the field. The sentence about other words in braces is withdrawn from the
       PRODUCT, so it is asserted absent from the whole panel rather than from one field. */
    const underField93 = () => controlsAside().evaluate((el) => ({
      caption: (el.textContent.match(/TOKENS THIS FIELD ACCEPTS/g) ?? []).length,
      braces: (el.textContent.match(/else in braces/gi) ?? []).length,
    }))
    const want93 = (def, where) => LIBW.placeholdersOffered(def, where)
      .map((t) => ({ code: `{${t}}`, caption: LIBW.PLACEHOLDERS[t], actions: ['Copy', 'Insert'], words: '', clipped: false }))
    // the Newsletter is the one seeded section with a token of its own, and the one step 92 deletes from page 2 below
    const newsAt92 = homeStack.findIndex(([d]) => d === TEMPLATES.home[TEMPLATES.home.length - 1][0])
    const gridSchema93 = pilot('a17/1').contentSchema
    const newsSchema93 = pilot(TEMPLATES.home[TEMPLATES.home.length - 1][0]).contentSchema
    // PAGE 1 — R-186: nothing offers a page number, and the one field with a token of its own lists that token ALONE
    await openGroup('Content')
    await page.waitForTimeout(250)
    const gridOne93 = await menu93('Eyebrow')
    const under93 = await underField93()
    await rowAt(newsAt92).locator('button').first().click()
    await page.waitForTimeout(300)
    await openGroup('Content')
    await page.waitForTimeout(250)
    const newsOne93 = await menu93('Social proof line')
    check('step 93 — R-186: on page 1 a field with no token of its own carries NO {} button at all, and nothing is drawn under any field (R-185)',
      gridOne93 === null && under93.caption === 0 && under93.braces === 0, JSON.stringify({ gridOne93, under93 }))
    check('step 93 — R-186: on page 1 the one field that declares a token lists that token ALONE — no page-number row',
      newsOne93 !== null && newsOne93.heading === 'Placeholders' && JSON.stringify(newsOne93.rows) === JSON.stringify(want93(newsSchema93.proofLine, { page: 1 })) && newsOne93.extras === 0,
      JSON.stringify(newsOne93))
    await rowAt(gridAt92).locator('button').first().click()
    await page.waitForTimeout(300)

    const homeBefore92 = JSON.stringify(await rowOf92('home'))
    await page.locator('#editor-controls [data-page-row] [role="radio"]', { hasText: '2' }).click()
    await waitPage92(2)
    await page.waitForTimeout(400)
    // PAGE 2 FOLLOWS PAGE 1: every section of page 1, in order, rendered at index.hbs with page 2's context — DERIVED
    const ctx92 = OW.templateContext('index.hbs', 'second')
    const page92 = await canvasFrame().evaluate(() => ({
      titles: [...document.querySelectorAll('.a17-1__post-title')].map((t) => t.textContent.trim()),
      numbers: document.querySelector('.a17-1__numbers')?.textContent.trim() ?? null,
      newer: document.querySelector('.a17-1__newer')?.getAttribute('href') ?? null,
      older: document.querySelector('.a17-1__older')?.getAttribute('href') ?? null,
      home: [...document.querySelectorAll('.nav-home')].map((li) => li.className),
    }))
    const layers92 = await page.evaluate(() => ({
      marker: document.querySelector('#editor-layers [data-auto-generated="page-2"]')?.textContent ?? null,
      heading: [...document.querySelectorAll('#editor-layers [data-layers-list] span')].map((x) => x.textContent.trim()).find((t) => /^This page ·/i.test(t)) ?? null,
      names: [...document.querySelectorAll('#editor-layers [data-layer-row]')].map((r) => r.getAttribute('data-layer-row').split(':')[0]),
    }))
    check('step 92 — Page 2 follows page 1: an EXACT copy of it — every section, in order, under page 2\'s key — with D5d\'s marker in its words',
      JSON.stringify(await pageNames()) === JSON.stringify(stackOf('home').map(([, name]) => name)) && layers92.names.filter((k) => k !== 'site').every((k) => k === 'index') &&
      layers92.marker === PT.COPY_MARKER && /^This page · Home · Page 2$/i.test(layers92.heading ?? ''), JSON.stringify(layers92))
    check('step 92 — rendered at index.hbs with page 2\'s context: its rows, "2 / 5" with a Newer AND an Older link (FR-D21\'s middle page), derived from templateContext',
      JSON.stringify(page92.titles) === JSON.stringify(ctx92.ghost.posts.map((p) => p.title)) && page92.numbers === `${ctx92.ghost.pagination.page} / ${ctx92.ghost.pagination.pages}` &&
      page92.newer === '/' && page92.older === `/page/${ctx92.ghost.pagination.page + 1}/`, JSON.stringify({ page92, want: ctx92.ghost.posts.length }))
    check('step 92 — DW-218: the header is told /page/2/, so Rail\'s Home link carries no nav-current, exactly as Ghost marks it (`utils.js:61`)',
      ctx92.site.currentUrl === '/page/2/' && page92.home.length > 0 && page92.home.every((c) => !c.includes('nav-current')), JSON.stringify(page92.home))
    check('step 92 — entering says "Page 2." and stores nothing: no `index` row, and the home row untouched',
      (await saidNow92()) === PT.ENTERED_SAID && (await rowOf92('index')) === null && JSON.stringify(await rowOf92('home')) === homeBefore92, await saidNow92())
    // D5d's PILL (`:388-396`): ink, a 10px radius, 4px padding and gap, the modal's .25 — "Page 2" as words on white at
    // .08 and "Back to page 1" the one control, 30px, in the frame's warm grey — with no coral
    const pill92 = await page.evaluate(() => {
      const p = document.querySelector('[data-page-two-pill]')
      if (!p) return null
      const cs = getComputedStyle(p)
      const [words, back] = [...p.children]
      return {
        bg: cs.backgroundColor, radius: cs.borderRadius, padding: cs.padding, gap: cs.gap, shadow: cs.boxShadow,
        words: words.textContent.trim(), wordsTag: words.tagName, wordsH: words.getBoundingClientRect().height, wordsBg: getComputedStyle(words).backgroundColor,
        back: back.textContent.trim(), backTag: back.tagName, backH: back.getBoundingClientRect().height, backColor: getComputedStyle(back).color,
        glyphs: p.querySelectorAll('svg').length, coral: /194, 56, 31|255, 89, 65/.test([cs.backgroundColor, getComputedStyle(words).color, getComputedStyle(back).color].join(' ')),
      }
    })
    check('step 92 — D5d :388-396: the pill is ink at a 10px radius with 4px padding and gap and the .25 shadow, "Page 2" WORDS then "Back to page 1" the 30px button, and no coral',
      pill92 !== null && pill92.bg === 'rgb(28, 27, 26)' && pill92.radius === '10px' && pill92.padding === '4px' && pill92.gap === '4px' && /0\.25\)/.test(pill92.shadow) &&
      pill92.words === PT.PAGE_TWO_WORDS && pill92.wordsTag === 'SPAN' && Math.round(pill92.wordsH) === 30 && /\/ 0\.08\)|, 0\.08\)/.test(pill92.wordsBg) &&
      pill92.back === PT.BACK_TO_PAGE_ONE && pill92.backTag === 'BUTTON' && Math.round(pill92.backH) === 30 && /\/ 0\.66\)|, 0\.66\)/.test(pill92.backColor) && pill92.glyphs === 2 && !pill92.coral,
      JSON.stringify(pill92))
    // R-138 EXTENDED: the pill never meets the page card or the viewport chip, at all three devices, at 1440 and 1280
    const meets92 = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
    const clear92 = []
    for (const width of [1440, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      for (const [n, device] of DEVICE.DEVICES.entries()) {
        await page.locator('section[aria-label="Canvas"]').focus()
        await page.keyboard.press(String(n + 1))
        await page.waitForTimeout(400)
        const at = await page.evaluate(() => {
          const r = (s) => document.querySelector(s)?.getBoundingClientRect().toJSON() ?? null
          return { pill: r('[data-page-two-pill]'), card: r('section[aria-label="Canvas"] > div'), chip: r('#editor-viewport') }
        })
        clear92.push({ width, device: device.label, card: at.pill && at.card ? !meets92(at.pill, at.card) : false, chip: at.pill && at.chip ? !meets92(at.pill, at.chip) : false, gap: at.pill && at.card ? Math.round(at.card.top - at.pill.bottom) : null })
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('1')
    await page.waitForTimeout(400)
    check('step 92 — the pill never meets the page card or the viewport chip, at Desktop, Tablet and Mobile, in a 1440 and a 1280 window',
      clear92.length === 2 * DEVICE.DEVICES.length && clear92.every((c) => c.card && c.chip), JSON.stringify(clear92))
    // "Older posts →" never navigates: links on the canvas are prevented, so there is no page 3 (R-177)
    const olderUrl92 = await canvasFrame().evaluate(() => location.href)
    await canvasFrame().locator('.a17-1__older').click()
    await page.waitForTimeout(400)
    check('step 92 — "Older posts →" on page 2 navigates nowhere: no page 3, and the canvas is still page 2',
      (await canvasFrame().evaluate(() => location.href)) === olderUrl92 && (await pageNow92()) === '2', await pageNow92())
    // ── step 93 — PAGE 2 OFFERS IT, and a field with a token of its own lists BOTH. Read-only: page 2 has not
    //    forked yet, and opening a menu writes nothing.
    await rowAt(newsAt92).locator('button').first().click()
    await page.waitForTimeout(300)
    await openGroup('Content')
    await page.waitForTimeout(250)
    const newsTwo93 = await menu93('Social proof line')
    check('step 93 — R-186: on page 2 a field that declares a token lists BOTH — its own and {page_number} — each with its own line and Copy + Insert, and the card holds nothing else',
      newsTwo93 !== null && newsTwo93.heading === 'Placeholders' && JSON.stringify(newsTwo93.rows) === JSON.stringify(want93(newsSchema93.proofLine, { page: 2 })) && newsTwo93.extras === 0,
      JSON.stringify({ got: newsTwo93, want: want93(newsSchema93.proofLine, { page: 2 }) }))
    // R-187 — THE HEADER NEVER OFFERS IT, on page 2 or anywhere: it is one object on every page (R-180)
    await rowAt(HEADER).locator('button').first().click()
    await page.waitForTimeout(300)
    await openGroup('Content')
    await page.waitForTimeout(250)
    const headerButtons93 = await controlsAside().getByRole('button', { name: /^Placeholders for / }).count()
    check('step 93 — R-187: no field of the site-wide header carries a {} button, even on page 2 — it is on every page of the site',
      headerButtons93 === 0, `${headerButtons93} buttons`)
    await rowAt(gridAt92).locator('button').first().click()
    await page.waitForTimeout(300)

    // THE FIRST CHANGE ON PAGE 2 — the newsletter section deleted from Layers — STORES page 2 under `index`, and the home
    // row is BYTE-IDENTICAL before and after (R-178's proof, read back from Supabase)
    const bandAt92 = newsAt92
    await rowAt(bandAt92).getByRole('button', { name: /^More for / }).click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.waitForTimeout(500)
    const markerGone92 = (await page.locator('#editor-layers [data-auto-generated]').count()) === 0
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+s`)
    const index92 = await pollRow92('index', (d) => d !== null)
    const wantIndex92 = TEMPLATES.home.slice(0, -1).map(([d]) => d)
    check('step 92 — R-178: the first change on page 2 writes an `index` row — the copy without the section — and the marker goes',
      markerGone92 && JSON.stringify(index92?.instances?.map((i) => i.designId)) === JSON.stringify(wantIndex92), JSON.stringify({ markerGone92, index: index92?.instances?.map((i) => i.designId) }))
    check('step 92 — R-178: the `home` row is byte-identical before and after — nothing done on page 2 changed page 1',
      JSON.stringify(await rowOf92('home')) === homeBefore92, 'home row compared as stored JSON')
    // A RELOAD with the device's copy dropped reads page 2 back from the STORED row, and the editor opens on page 1
    await dropLocal()
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    const opensOn92 = await pageNow92()
    await rowAt(gridAt92).locator('button').first().click()
    await page.waitForTimeout(300)
    await page.locator('#editor-controls [data-page-row] [role="radio"]', { hasText: '2' }).click()
    await waitPage92(2)
    await page.waitForTimeout(400)
    const reloaded92 = await page.evaluate(() => ({
      marker: document.querySelectorAll('#editor-layers [data-auto-generated]').length,
      rows: [...document.querySelectorAll('#editor-layers [data-layer-row]')].map((r) => r.getAttribute('data-layer-row').split(':')[0]),
    }))
    check('step 92 — a reload opens on page 1, and page 2 is its OWN design, read back from the stored `index` row (no marker, the section still gone)',
      opensOn92 === '1' && reloaded92.marker === 0 && reloaded92.rows.filter((k) => k === 'index').length === wantIndex92.length, JSON.stringify({ opensOn92, reloaded92 }))

    /* ── step 93 — THE INSERT, AND THE NUMBER ON THE CANVAS. It waits until here because page 2 is now its own
       design, so a content change writes the `index` row step 92 has already proved and disturbs nothing. */
    await openGroup('Content')
    await page.waitForTimeout(250)
    const eyebrowWas93 = await wordsOf(GRID, '.a17-1__eyebrow')
    const gridTwo93 = await menu93('Eyebrow')
    check('step 93 — R-186 · R-185: on page 2 a field with no token of its own offers {page_number} alone, as its code over one line with Copy and Insert',
      gridTwo93 !== null && gridTwo93.heading === 'Placeholders' && JSON.stringify(gridTwo93.rows) === JSON.stringify(want93(gridSchema93.eyebrow, { page: 2 })) && gridTwo93.extras === 0,
      JSON.stringify({ got: gridTwo93, want: want93(gridSchema93.eyebrow, { page: 2 }) }))
    const eyebrow93 = controlsAside().getByLabel('Eyebrow', { exact: true })
    await eyebrow93.fill('The archive — page ')
    await page.waitForTimeout(300)
    await controlsAside().getByRole('button', { name: 'Placeholders for Eyebrow', exact: true }).click()
    await page.waitForTimeout(300)
    /* ── R-188, the owner's test of this menu (2026-09-23). Findings 2 and 5 are read while it is open, before
       the Insert that now closes it (finding 3). Copy's tick is a GLYPH swap and its tooltip changes with it,
       so both are read; the hover is read as a real computed background before and during :hover, never as a
       class name — Chrome answers these in `color(srgb …)`, so the assertion is inequality, never a parse. */
    const copyBtn93 = page.locator('[popover]:popover-open button[data-copy="page_number"]')
    const rowOfMenu93 = page.locator('[popover]:popover-open li').first()
    const bgRested93 = await rowOfMenu93.evaluate((el) => getComputedStyle(el).backgroundColor)
    await rowOfMenu93.hover()
    await page.waitForTimeout(250)
    const bgHovered93 = await rowOfMenu93.evaluate((el) => getComputedStyle(el).backgroundColor)
    check('step 93 — R-188 finding 5: a placeholder row answers the pointer, the way every other menu row does',
      bgRested93 !== bgHovered93, JSON.stringify({ bgRested93, bgHovered93 }))
    const copyBefore93 = await copyBtn93.evaluate((b) => ({ title: b.getAttribute('title'), paths: b.querySelectorAll('path').length }))
    await copyBtn93.click()
    await page.waitForTimeout(300)
    const copyAfter93 = await copyBtn93.evaluate((b) => ({ title: b.getAttribute('title'), paths: b.querySelectorAll('path').length }))
    await page.waitForTimeout(2200)
    const copyBack93 = await copyBtn93.evaluate((b) => ({ title: b.getAttribute('title'), paths: b.querySelectorAll('path').length }))
    check('step 93 — R-188 finding 2: Copy answers with a TICK — one path where copy has two — and is Copy again after two seconds',
      copyBefore93.title === 'Copy' && copyBefore93.paths === 2
      && copyAfter93.title === 'Copied' && copyAfter93.paths === 1
      && copyBack93.title === 'Copy' && copyBack93.paths === 2,
      JSON.stringify({ copyBefore93, copyAfter93, copyBack93 }))
    await page.locator('[popover]:popover-open button[data-insert="page_number"]').click()
    await page.waitForTimeout(400)
    const inserted93 = await eyebrow93.inputValue()
    // R-188 finding 3: Insert CLOSES the list — no Escape is pressed here, and none is needed
    const menuAfterInsert93 = await page.locator('[popover]:popover-open').count()
    check('step 93 — R-188 finding 3: Insert closes the list, so the words it just changed are visible again',
      menuAfterInsert93 === 0, JSON.stringify({ menuAfterInsert93 }))
    await page.waitForTimeout(400)
    // R-182 on the canvas: the number the editor handed this paint — page 2's own, from `templateContext`
    const painted93 = await wordsOf(GRID, '.a17-1__eyebrow')
    check('step 93 — Insert puts {page_number} in the field, and the CANVAS prints the page being painted — 2 on page 2 (R-182)',
      inserted93 === 'The archive — page {page_number}' && painted93 === `The archive — page ${ctx92.ghost.pagination.page}`,
      JSON.stringify({ inserted93, painted93 }))
    // …and clicking into the words shows the TOKEN again, so it can be seen and edited (R-182's second sentence)
    await caretInto(GRID, '.a17-1__eyebrow')
    await page.waitForTimeout(300)
    const editing93 = await wordsOf(GRID, '.a17-1__eyebrow')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    const rested93 = await wordsOf(GRID, '.a17-1__eyebrow')
    check('step 93 — R-182: clicking into the words shows the token as typed, and the number is back when the edit ends',
      editing93 === inserted93 && rested93 === painted93, JSON.stringify({ editing93, rested93 }))
    // review, 2026-09-23 — THE RICH FIELD'S INSERT LANDS AT THE CARET, not at the end. A `richtext` field's editing
    // session ends when focus leaves it and the `{}` button takes focus, so the field holds the session alive across
    // the menu (the link panel's pattern) and Insert goes where the caret was. Proved from the START of the Title,
    // where "at the caret" and "at the end" cannot be confused; the row is page 2's own and step 92 discards it.
    const title93 = controlsAside().getByRole('textbox', { name: 'Title', exact: true })
    const titleWas93 = (await title93.textContent()) ?? ''
    await title93.click()
    await page.keyboard.press('Control+Home')
    await page.waitForTimeout(200)
    await controlsAside().getByRole('button', { name: 'Placeholders for Title', exact: true }).click()
    await page.waitForTimeout(300)
    await page.locator('[popover]:popover-open button[data-insert="page_number"]').click()
    await page.waitForTimeout(400)
    const titleNow93 = (await title93.textContent()) ?? ''
    const focusAfterInsert93 = await page.evaluate(() => document.activeElement?.getAttribute('role') ?? null)
    check('step 93 — review: Insert on a RICH field lands at the caret — the token at the START of the Title, not its end — and the words have focus again',
      titleNow93 === `{page_number}${titleWas93}` && focusAfterInsert93 === 'textbox', JSON.stringify({ titleWas93, titleNow93, focusAfterInsert93 }))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    // …and page 1 was never touched: it is a different doc, and it still says what the seed says
    await page.getByRole('button', { name: PT.BACK_TO_PAGE_ONE, exact: true }).click()
    await waitPage92(1)
    await page.waitForTimeout(400)
    const pageOne93 = await wordsOf(GRID, '.a17-1__eyebrow')
    const backButtons93 = await controlsAside().getByRole('button', { name: /^Placeholders for / }).count()
    check('step 93 — R-186 · R-179: page 1\'s words are untouched — no number and no gap — and its fields offer nothing again',
      pageOne93 === eyebrowWas93 && backButtons93 === 0, JSON.stringify({ pageOne93, eyebrowWas93, backButtons93 }))
    // back to page 2, where step 92's R-180 test expects to be
    await page.locator('#editor-controls [data-page-row] [role="radio"]', { hasText: '2' }).click()
    await waitPage92(2)
    await page.waitForTimeout(400)
    // R-180 — THE HEADER CHANGED ON PAGE 2 ASKS FIRST, in FR-D5's dialog adapted; Cancel changes nothing, Change it
    // everywhere changes the `site` row — every page, page 1 included
    const siteBefore92 = JSON.stringify(await rowOf92('site'))
    await rowAt(HEADER).locator('button').first().click()
    await page.waitForTimeout(300)
    const headerName92 = TEMPLATES.site[0][1]
    await openGroup('Layout')
    await page.waitForTimeout(250)
    const navRow92 = controlsAside().getByRole('radiogroup', { name: 'Nav position' })
    const pickOther92 = async () => {
      const off = navRow92.locator('[role="radio"][aria-checked="false"]').first()
      const value = (await off.textContent()).trim()
      await off.click()
      await page.waitForTimeout(400)
      return value
    }
    // review, 2026-09-22 — A SECOND DOOR INTO THE HOLD: typing on the canvas. The header's own words are a text prop, and
    // `commit()` holds every door alike; the journey drives the panel's radio only, so this is the one place the inline
    // door is proved. Cancel puts the typed character back.
    const ctaBefore92 = await wordsOf(HEADER, '.a1-1__cta')
    await caretInto(HEADER, '.a1-1__cta')
    await page.keyboard.type('q')
    await page.waitForTimeout(400)
    const askTyped92 = await page.evaluate(() => document.querySelector('dialog[open]')?.querySelector('h2')?.textContent.trim() ?? null)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    check('step 92 — R-180: typing into the header on the canvas while on page 2 asks first too, and Cancel puts the words back',
      askTyped92 === PT.SITE_WIDE_ASK.title(headerName92) && (await wordsOf(HEADER, '.a1-1__cta')) === ctaBefore92 && (await page.locator('dialog[open]').count()) === 0,
      JSON.stringify({ askTyped92, cta: await wordsOf(HEADER, '.a1-1__cta'), ctaBefore92 }))
    await rowAt(HEADER).locator('button').first().click()
    await page.waitForTimeout(300)
    await openGroup('Layout')
    await page.waitForTimeout(250)
    await pickOther92()
    const ask92 = await page.evaluate(() => {
      const d = document.querySelector('dialog[open]')
      return d ? { title: d.querySelector('h2')?.textContent.trim(), body: d.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim(), focus: document.activeElement?.hasAttribute('data-cancel') } : null
    })
    check('step 92 — R-180: the first change to the header on page 2 asks first — "Change {name} everywhere?" — opening on Cancel',
      ask92 !== null && ask92.title === PT.SITE_WIDE_ASK.title(headerName92) && ask92.body === PT.SITE_WIDE_ASK.body && ask92.focus === true, JSON.stringify(ask92))
    await page.locator('dialog[open]').getByRole('button', { name: PT.SITE_WIDE_ASK.cancel, exact: true }).click()
    await page.waitForTimeout(400)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+s`)
    await page.waitForTimeout(1500)
    check('step 92 — R-180: Cancel changes nothing — the `site` row is as it was', JSON.stringify(await rowOf92('site')) === siteBefore92)
    await pickOther92()
    await page.locator('dialog[open]').getByRole('button', { name: PT.SITE_WIDE_ASK.confirm, exact: true }).click()
    await page.waitForTimeout(400)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+s`)
    const site92 = await pollRow92('site', (d) => JSON.stringify(d) !== siteBefore92)
    // the value is the design's own vocabulary, read from the library, and it is no longer the seed's
    const navDef92 = pilot(TEMPLATES.site[0][0]).controlSchema.find((c) => c.name === 'nav-position')
    const navSeed92 = JSON.parse(siteBefore92)?.instances?.[0]?.controls?.['nav-position'] ?? navDef92.default
    const navValue92 = site92?.instances?.[0]?.controls?.['nav-position'] ?? null
    check('step 92 — R-180: Change it everywhere changes the `site` row — the header on every page, page 1 included',
      JSON.stringify(site92) !== siteBefore92 && navValue92 !== navSeed92 && navDef92.values.includes(navValue92), JSON.stringify({ navSeed92, navValue92 }))
    // review, 2026-09-22 — R-167 ON PAGE 2 ROUND-TRIPS THROUGH THE SERVER ACTION: the page-2 key keeps a "looked at"
    // record of its own (`index`, accepted by `setViewedStates` since this story), and the header change made here ran
    // page 1's record out in the same batch. Read back from Supabase, never inferred from the screen.
    await page.waitForTimeout(1500)
    const viewed92 = async (key) => (await call('/rest/v1', `/project_template_prefs?project_id=eq.${P}&template_key=eq.${key}&select=member_states_viewed`)).body?.[0]?.member_states_viewed ?? null
    const [viewedIndex92, viewedHome92] = [await viewed92('index'), await viewed92('home')]
    check('step 92 — R-167: page 2 keeps its own "looked at" record under `index`, written through the server action; the header change ran page 1\'s out',
      Array.isArray(viewedIndex92) && viewedIndex92.length === 1 && (viewedHome92 === null || viewedHome92.length === 0), JSON.stringify({ viewedIndex92, viewedHome92 }))
    const asksAgain92 = await (async () => {
      await pickOther92()
      return page.locator('dialog[open]').count()
    })()
    check('step 92 — R-180: the header\'s next change on this visit asks nothing', asksAgain92 === 0, `${asksAgain92} dialogs`)
    await page.getByRole('button', { name: PT.BACK_TO_PAGE_ONE, exact: true }).click()
    await waitPage92(1)
    await page.waitForTimeout(300)
    check('step 92 — Back to page 1 is said, focus goes to the canvas, and the pill is gone',
      (await saidNow92()) === PT.LEFT_SAID && (await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) === 'Canvas' && (await page.locator('[data-page-two-pill]').count()) === 0,
      await saidNow92())
    // A CHANGE OF CANVAS IS PAGE 1 — viewing page 2 is session state: Home left ON page 2 by the Template switcher (a
    // soft navigation, step 41's) opens the Tag canvas on page 1
    await rowAt(gridAt92).locator('button').first().click()
    await page.waitForTimeout(300)
    await page.locator('#editor-controls [data-page-row] [role="radio"]', { hasText: '2' }).click()
    await waitPage92(2)
    await page.locator('#editor-template').click()
    await page.waitForTimeout(300)
    await page.locator('#editor-template-menu button[data-canvas="tag"]').click()
    await painted('tag')
    await page.waitForTimeout(400)
    check('step 92 — a change of canvas made on page 2 opens the next canvas on page 1, with no pill', (await pageNow92()) === '1' && (await page.locator('[data-page-two-pill]').count()) === 0, await pageNow92())
    // THE ARCHIVES — the Tag canvas previews its fixture tag, whose own posts run to a second page: page 2 is THAT tag's
    // page 2, and a change there writes `tag-paged` while page 1 of the archive stays untouched. UNTOUCHED IS
    // BYTE-IDENTICAL, NOT ABSENT: step 44's round trip leaves a `tag` row holding the default stack (step 6b's note),
    // so page 1's row is read before the change and compared after it, exactly as the `home` row is above (R-178)
    const tagBefore92 = JSON.stringify(await rowOf92('tag'))
    const tagSubject92 = OW.fixtureSubject('tag.hbs')
    const tagCtx92 = OW.templateContext('tag.hbs', 'second', tagSubject92)
    const tagRows92 = await page.locator('#editor-layers [data-layer-row]').evaluateAll((els) => els.map((r) => r.getAttribute('data-layer-row')))
    const tagGrid92 = tagRows92.findIndex((k) => !k.startsWith('site:'))
    await rowAt(tagGrid92).locator('button').first().click()
    await page.waitForTimeout(300)
    await page.locator('#editor-controls [data-page-row] [role="radio"]', { hasText: '2' }).click()
    await waitPage92(2)
    await page.waitForTimeout(400)
    const tag92 = await canvasFrame().evaluate(() => ({
      titles: [...document.querySelectorAll('.a17-1__post-title')].map((t) => t.textContent.trim()),
      numbers: document.querySelector('.a17-1__numbers')?.textContent.trim() ?? null,
      older: document.querySelector('.a17-1__older') !== null,
      newer: document.querySelector('.a17-1__newer')?.getAttribute('href') ?? null,
    }))
    check('step 92 — the Tag canvas\'s page 2 is its tag\'s own last page: its posts, "2 / 2", a Newer link to the archive and no Older link',
      OW.feedPages('tag.hbs', tagSubject92) === 2 && JSON.stringify(tag92.titles) === JSON.stringify(tagCtx92.ghost.posts.map((p) => p.title)) &&
      tag92.numbers === `2 / ${tagCtx92.ghost.pagination.pages}` && tag92.older === false && tag92.newer === `/tag/${tagSubject92.slug}/`, JSON.stringify(tag92))
    await openGroup('Layout')
    await page.waitForTimeout(250)
    await controlsAside().getByRole('radiogroup', { name: 'Per row' }).locator('[role="radio"][aria-checked="false"]').first().click()
    await page.waitForTimeout(400)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+s`)
    const tagPaged92 = await pollRow92('tag-paged', (d) => d !== null)
    const tagAfter92 = JSON.stringify(await rowOf92('tag'))
    check('step 92 — R-178: a change on the Tag canvas\'s page 2 writes a `tag-paged` row, and page 1 of the archive — its `tag` row, or its absence — is byte-identical before and after',
      tagPaged92 !== null && (tagPaged92.instances?.length ?? 0) > 0 && tagAfter92 === tagBefore92,
      JSON.stringify({ tagPaged: tagPaged92?.instances?.map((i) => i.controls), tagRow: tagBefore92 === 'null' ? 'absent' : 'present', same: tagAfter92 === tagBefore92 }))
    // PAGE 2 STOPS BEING OFFERED when the subject changes to a tag whose posts fit one page: page 1 at once, the reason
    // said, and page 2's own design KEPT (the `tag-paged` row is untouched)
    const oneTag92 = OW.tags().find((t) => OW.feedPages('tag.hbs', { kind: 'tag', slug: t.slug }) === 1)
    await page.locator('#editor-source').click()
    await page.waitForTimeout(500)
    await page.locator(`#editor-source-menu [data-subject-row="${oneTag92.slug}"]`).click()
    await page.waitForTimeout(800)
    const tagPagedAfter92 = await rowOf92('tag-paged')
    check('step 92 — R-176: choosing a tag whose posts fit one page takes the canvas back to page 1 at once and says why; page 2\'s own design is kept',
      oneTag92 !== undefined && (await pageNow92()) === '1' && (await saidNow92()).includes(`${PT.BACK_TO_PAGE_ONE}: `) &&
      JSON.stringify(tagPagedAfter92) === JSON.stringify(tagPaged92) && (await page.locator('#editor-controls [data-page-row]').count()) === 0,
      JSON.stringify({ tag: oneTag92?.slug, page: await pageNow92(), said: await saidNow92() }))
    // …and the way back: Home, left on page 1 and switched to from the Tag canvas's page 2, opens on page 1 too
    await page.locator('#editor-template').click()
    await page.waitForTimeout(300)
    await page.locator('#editor-template-menu button[data-canvas="home"]').click()
    await painted('home')
    await page.waitForTimeout(400)
    check('step 92 — and the way back: the Tag canvas left on its page 2 brings Home back on page 1', (await pageNow92()) === '1', await pageNow92())
    // …and the Author canvas offers NO page 2: every writer's posts fit on one page (R-176)
    await page.goto(editorUrl('author'), { waitUntil: 'load' })
    await painted('author')
    const authorRows92 = await page.locator('#editor-layers [data-layer-row]').evaluateAll((els) => els.map((r) => r.getAttribute('data-layer-row')))
    await rowAt(authorRows92.findIndex((k) => !k.startsWith('site:'))).locator('button').first().click()
    await page.waitForTimeout(300)
    check('step 92 — R-176: the Author canvas offers no row, because its writer\'s posts fit on one page',
      OW.feedPages('author.hbs', OW.fixtureSubject('author.hbs')) === 1 && (await page.locator('#editor-controls [data-page-row]').count()) === 0 && (await page.locator('#editor-controls').getAttribute('aria-label')) === 'Section settings')
    // THE WALK LEAVES THE PROJECT AS IT FOUND IT: page 2's rows and records gone, and the seed — the planted feed with it
    await leaveEditor()
    await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=in.(index,tag-paged,author-paged)`, { method: 'DELETE' })
    await call('/rest/v1', `/project_template_prefs?project_id=eq.${P}`, { method: 'DELETE' })
    await freshLoad()
    check('step 92 — restored: no page-2 row left, and the home row is the seed again (no planted feed)',
      (await rowOf92('index')) === null && (await rowOf92('tag-paged')) === null && JSON.stringify(await rowOf92('home')) === JSON.stringify(seedHome92.doc))

    /* ── step 94 — Story 5.19: THE MAIN FEED AND P0·5's DATA GROUP (FR-H2, D5c, AD-27(d), AD-36) ─────────────────────
       INSIDE STEP 5's CSP SESSION, on the sample: the seeded project links no site, and the live walk takes the same
       group over T1 and T3. Every word is `lib/data-group.ts`'s or the engine's, and every row the canvas must draw is
       the app's own `sampleRows`/`rowsFor` over the runtime's own `feedQuery` — never restated here. Each gesture is ONE
       Undo (Story 5.8), pressed on the bar's own Undo as the owner's test presses it. The project is handed back as the
       walk found it: the seed, and the Tag canvas's row as it was. */
    const [W94, RT94, CV94] = await Promise.all([
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/data-group.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'packages/section-runtime/src/index.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/canvas.ts')).href),
    ])
    const WORD94 = LIB.POST_SOURCE_WORDS
    const CLS94 = MAIN_DESIGN.replace('/', '-')
    const HERO_DESIGN94 = homeStack[HERO][0]
    const HERO_CLS94 = HERO_DESIGN94.replace('/', '-')
    const HERO_KEY94 = Object.keys(pilot(HERO_DESIGN94).dataBindings ?? {})[0]
    const seedHome94 = SEED_DOCS.find((r) => r.template_key === 'home').doc
    const tagBefore94 = await rowOf92('tag')
    /** what the canvas must draw for a secondary feed storing `posts`: the runtime's own fold, then the app's own rows */
    const expected94 = (posts) => {
      const q = RT94.feedQuery(pilot(MAIN_DESIGN), { isMainFeed: false, data: { posts } }, CANVASES.home.file, PER_PAGE)
      return CV94.rowsFor(q, CV94.sampleRows({ posts: q }).posts).map((r) => r.title)
    }
    const feeds94 = () => canvasFrame().evaluate((c) => [...document.querySelectorAll(`#canvas > .${c}`)].map((s) => ({
      titles: [...s.querySelectorAll(`.${c}__post-title`)].map((t) => t.textContent.trim()),
      pager: s.querySelector(`.${c}__pager`) !== null,
    })), CLS94)
    const heroCard94 = () => canvasFrame().evaluate((c) => document.querySelector(`#canvas > .${c} .${c}__title`)?.textContent.trim() ?? null, HERO_CLS94)
    const rows94 = () => page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row]')].map((r) => ({
      key: r.getAttribute('data-layer-row'), name: r.querySelector('button')?.textContent ?? '', chip: r.querySelector('[data-main-feed-chip]') !== null,
    })))
    const chips94 = async () => (await rows94()).filter((r) => r.chip).map((r) => r.key)
    const nameOf94 = async (key) => (await rows94()).find((r) => r.key === key)?.name ?? null
    const row94 = (key) => page.locator(`#editor-layers [data-layer-row="${key}"]`)
    /** a value that settles: read until `test` holds, then once more — the answer is the read, whichever way it went */
    const until94 = async (read, test) => {
      for (let i = 0; i < 24; i++) {
        if (test(await read())) break
        await page.waitForTimeout(250)
      }
      return read()
    }
    const same94 = (a) => (b) => JSON.stringify(a) === JSON.stringify(b)
    const select94 = async (key) => { await row94(key).locator('button').first().click(); await page.waitForTimeout(400) }
    const menu94 = async (key) => {
      await row94(key).getByRole('button', { name: /^More for / }).click()
      await page.waitForTimeout(250)
      return (await page.locator(':popover-open li').allInnerTexts()).map((w) => w.trim()).filter(Boolean)
    }
    const shut94 = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
    const act94 = async (key, label) => {
      await menu94(key)
      await page.locator(':popover-open').getByRole('button', { name: label, exact: true }).click()
      await page.waitForTimeout(600)
    }
    const undo94 = async () => { await page.locator('#editor-undo').click(); await page.waitForTimeout(600) }
    const data94 = async () => {
      const head = page.locator('#editor-controls button[aria-expanded]').filter({ hasText: /^Data$/ })
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click()
      await page.waitForTimeout(250)
      return page.locator('#editor-controls [data-data-group]')
    }
    const source94 = async (word) => {
      await (await data94()).locator('button[id$="-source"]').click()
      await page.waitForTimeout(250)
      await page.locator(':popover-open').getByRole('button', { name: word, exact: true }).click()
      await page.waitForTimeout(700)
    }
    const picks94 = async () => (await data94()).locator('[data-pick] span.truncate').allInnerTexts()
    const off94 = async () => {
      const b = await page.locator('aside[aria-label="Layers"]').boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height - 12)
      await page.waitForTimeout(250)
    }
    // the chip itself, inside the chrome's positioned wrapper: its words, and the CSS that uppercases them
    const chip94 = () => chromeNow('[data-chrome="main-feed"] [data-main-feed-chip]')
    const flags94 = async () => ((await rowOf92('home'))?.instances ?? []).filter((i) => i.isMainFeed === true).map((i) => i.instanceId)
    const idOf94 = (key) => key.slice(key.indexOf(':') + 1)

    // ── WRITTEN BEFORE THE RULE: the seed stores no flag, the editor repairs it as it reads, and reading writes nothing
    const gridKey94 = await rowAt(GRID).getAttribute('data-layer-row')
    const heroKey94 = await rowAt(HERO).getAttribute('data-layer-row')
    const gridName94 = await nameOf94(gridKey94)
    const chips0 = await chips94()
    await page.waitForTimeout(1500)
    check('step 94 — WRITTEN BEFORE THE RULE: the seeded Home stores no main feed, the editor opens with its post grid repaired into one — D5c\'s chip on that row alone — and reading writes nothing (AD-22)',
      (await flags94()).length === 0 && same94([gridKey94])(chips0) && JSON.stringify(await rowOf92('home')) === JSON.stringify(seedHome94),
      JSON.stringify({ chips: chips0, grid: gridKey94, stored: await flags94() }))

    // ── D5c's chip: none at rest; on a pointed feed beside the name tag and never over it; on a selected one; the panel head
    await off94()
    const rest94 = await chip94()
    await hoverOn(GRID)
    const [hov94, tag94h] = [await chip94(), await tagNow()]
    const over94 = hov94 !== null && tag94h !== null && hov94.left < tag94h.right && tag94h.left < hov94.right && hov94.top < tag94h.bottom && tag94h.top < hov94.bottom
    check('step 94 — AD-37: at rest the canvas carries no MAIN FEED chip; pointed at, the main feed carries D5c\'s words, uppercased by CSS, beside the name tag and never over it (R-125)',
      rest94 === null && hov94 !== null && hov94.text === W94.MAIN_FEED && hov94.transform === 'uppercase' && tag94h !== null && !over94,
      JSON.stringify({ rest: rest94, chip: hov94 && { left: hov94.left, top: hov94.top, right: hov94.right, bottom: hov94.bottom, text: hov94.text, transform: hov94.transform }, tag: tag94h && { left: tag94h.left, top: tag94h.top, right: tag94h.right, bottom: tag94h.bottom } }))
    await hoverOn(HERO)
    check('step 94 — a pointed section that is no feed never carries it', (await chip94()) === null)
    await clickOn(GRID)
    await off94()
    const head94 = await page.locator('#editor-panel-main-feed').textContent().catch(() => null)
    check('step 94 — D5c: selected, the main feed keeps the chip on its outline with the pointer gone, and carries it beside its name at the head of the panel',
      (await chip94()) !== null && head94 === W94.MAIN_FEED && (await panelOf()).head === gridName94, JSON.stringify({ head: head94, name: (await panelOf()).head }))
    const mainData94 = await data94()
    const mainText94 = (await mainData94.innerText()).replace(/\s+/g, ' ')
    check('step 94 — D5c: the main feed\'s Data group is its Count alone, greyed at the project\'s page size with its sentence — no Source and no Order',
      mainText94.includes(RT94.DATA_WORDS.mainCount) && (await mainData94.locator('[role="group"][id$="-count"]').innerText()).includes(String(PER_PAGE)) &&
      (await mainData94.locator('button[id$="-source"]').count()) === 0 && (await mainData94.locator('[role="radiogroup"]').count()) === 0, mainText94.slice(0, 200))
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    check('step 94 — deselected, the chip goes with the selection', (await chip94()) === null && !(await onScreen(GRID)).selected)

    // ── PLACE ANOTHER FEED: ⌘K from the main feed lands a second Three Up SECONDARY
    await select94(gridKey94)
    const before94 = (await rows94()).map((r) => r.key)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(`${CMD58}+k`)
    await page.waitForTimeout(2000)
    await page.locator(`dialog[open] [data-cell][data-design="${MAIN_DESIGN}"]`).first().click()
    await page.waitForTimeout(900)
    const added94 = (await rows94()).map((r) => r.key).filter((k) => !before94.includes(k))
    const newKey94 = added94[0] ?? '(none)'
    const newName94 = await nameOf94(newKey94)
    const placed94 = await until94(feeds94, (f) => f.length === 2)
    check('step 94 — a second Three Up placed on Home lands SECONDARY: said as an ordinary placement, no chip of its own, and ONE pager — the main feed\'s',
      added94.length === 1 && (await until94(saidNow92, (v) => v === `${newName94} added`)) === `${newName94} added` && same94([gridKey94])(await chips94()) && placed94.map((f) => f.pager).join() === 'true,false',
      JSON.stringify({ added: added94, said: await saidNow92(), chips: await chips94(), pagers: placed94.map((f) => f.pager) }))
    check('step 94 — …drawing the sample\'s newest posts at the project\'s page size, the base `feedQuery` gives it', same94(expected94({}))(placed94[1]?.titles), JSON.stringify(placed94[1]?.titles))
    await select94(newKey94)
    const d94 = await data94()
    check('step 94 — its Data group is P0·5\'s: Source Latest, Count at the page size, Order Newest',
      (await d94.locator('button[id$="-source"]').innerText()).includes(WORD94.latest) && (await d94.locator('[role="group"][id$="-count"]').innerText()).includes(String(PER_PAGE)) &&
      (await d94.locator('[role="radio"][aria-checked="true"]').innerText()).trim() === 'Newest')

    // ── P0·5's DATA GROUP ON THE SAMPLE, every Source, the canvas read against the app's own rows each time
    const startTag94 = W94.optionsOf(LIB.orbitWeekly.tags())[0]
    const startAuthor94 = W94.optionsOf(LIB.orbitWeekly.authors())[0]
    const stored94 = { source: 'tag', tag: startTag94.slug }
    await source94(WORD94.tag)
    const tagBtn94 = await (await data94()).locator('button[id$="-tag"]').innerText()
    const byTag94 = await until94(feeds94, (f) => same94(expected94(stored94))(f[1]?.titles))
    check(`step 94 — By tag starts on the sample's fullest tag, "${startTag94.name}" beside "${W94.postsCount(startTag94.count)}" (R-193's order), and the canvas draws its posts, newest first`,
      tagBtn94.includes(startTag94.name) && tagBtn94.includes(W94.postsCount(startTag94.count)) && same94(expected94(stored94))(byTag94[1]?.titles), JSON.stringify({ tagBtn94, drawn: byTag94[1]?.titles }))
    const d94b = await data94()
    await d94b.getByRole('radio', { name: 'Oldest' }).click()
    for (let n = PER_PAGE; n > 3; n--) {
      await d94b.getByRole('button', { name: 'Fewer Count' }).click()
      await page.waitForTimeout(60)
    }
    Object.assign(stored94, { order: 'oldest', count: 3 })
    const three94 = await until94(feeds94, (f) => same94(expected94(stored94))(f[1]?.titles))
    check('step 94 — Order Oldest and Count 3: the tag\'s three oldest', same94(expected94(stored94))(three94[1]?.titles) && three94[1]?.titles.length === 3, JSON.stringify(three94[1]?.titles))
    await source94(WORD94.author)
    Object.assign(stored94, { source: 'author', author: startAuthor94.slug })
    const authorBtn94 = await (await data94()).locator('button[id$="-author"]').innerText()
    const byAuthor94 = await until94(feeds94, (f) => same94(expected94(stored94))(f[1]?.titles))
    check(`step 94 — By author starts on the sample's fullest writer, "${startAuthor94.name}", keeping Count and Order`, authorBtn94.includes(startAuthor94.name) && same94(expected94(stored94))(byAuthor94[1]?.titles), JSON.stringify({ authorBtn94, drawn: byAuthor94[1]?.titles }))
    await source94(WORD94.featured)
    stored94.source = 'featured'
    const featured94 = await until94(feeds94, (f) => same94(expected94(stored94))(f[1]?.titles))
    check('step 94 — Featured: the sample\'s featured posts, oldest first, three', same94(expected94(stored94))(featured94[1]?.titles), JSON.stringify(featured94[1]?.titles))
    await source94(WORD94.picked)
    const dz94 = await data94()
    const zero94 = await until94(feeds94, (f) => f.length === 1)
    const dzText94 = (await dz94.innerText()).replace(/\s+/g, ' ')
    check('step 94 — Hand-picked with nothing picked is ZERO items: the section leaves the canvas, heading and all, its Layers row stays, and the list says so',
      zero94.length === 1 && (await row94(newKey94).count()) === 1 && dzText94.includes(W94.NO_PICKS), JSON.stringify({ sections: zero94.length }))
    check('step 94 — P0·5: Count and Order grey at Hand-picked with its two sentences, and Order marks neither value (R-69)',
      dzText94.includes(RT94.DATA_WORDS.pickedCount) && dzText94.includes(RT94.DATA_WORDS.pickedOrder) && (await dz94.locator('[role="radio"][aria-checked="true"]').count()) === 0, dzText94.slice(0, 260))
    for (let n = 0; n < 3; n++) {
      await (await data94()).locator('button[id$="-search"]').click()
      await page.waitForTimeout(300)
      await page.locator(':popover-open ul li button').first().click()
      await page.waitForTimeout(400)
      await shut94()
    }
    // the search offers the sample's posts in their own order, none already picked: the first three, each in turn
    const want94 = W94.searchPosts(LIB.orbitWeekly.posts().map((p) => ({ id: p.id, title: p.title })), '', []).slice(0, 3).map((p) => p.title)
    const picked94 = await until94(feeds94, (f) => same94(want94)(f[1]?.titles))
    check('step 94 — three picks from "Search posts to add": "3 picked", and the canvas draws exactly them, in the picked order',
      (await (await data94()).locator('[data-picked-count]').innerText()) === W94.PICKED(3) && same94(want94)(await picks94()) && same94(want94)(picked94[1]?.titles),
      JSON.stringify({ picks: await picks94(), drawn: picked94[1]?.titles }))
    await (await data94()).locator('[data-pick-handle="0"]').focus()
    await page.keyboard.press('Alt+ArrowDown')
    const moved94 = [want94[1], want94[0], want94[2]]
    const after94 = await until94(feeds94, (f) => same94(moved94)(f[1]?.titles))
    const live94 = await (await data94()).locator('[data-picked-list] [aria-live="polite"]').textContent()
    const focus94 = await page.evaluate(() => document.activeElement?.getAttribute('data-pick-handle') ?? null)
    check('step 94 — ⌥↓ moves a pick one down, says so in P0·3\'s words, keeps the focus on it, and the canvas follows (DW-116)',
      same94(moved94)(await picks94()) && live94 === RT94.movedTo(1, 3) && focus94 === '1' && same94(moved94)(after94[1]?.titles), JSON.stringify({ picks: await picks94(), live94, focus94 }))
    await source94(WORD94.tag)
    const backTag94 = [await (await data94()).locator('button[id$="-tag"]').innerText(), (await until94(feeds94, (f) => same94(expected94({ ...stored94, source: 'tag' }))(f[1]?.titles)))[1]?.titles]
    await source94(WORD94.picked)
    check('step 94 — a Source switch loses nothing: By tag brings back its tag, oldest, three; Hand-picked brings back the picks in their moved order',
      backTag94[0].includes(startTag94.name) && same94(expected94({ ...stored94, source: 'tag' }))(backTag94[1]) && same94(moved94)(await picks94()), JSON.stringify({ backTag94, picks: await picks94() }))

    // ── REASSIGN, DELETE, HIDE, DUPLICATE — each ONE gesture and ONE Undo
    const newMenu94 = await menu94(newKey94)
    await shut94()
    const mainMenu94 = await menu94(gridKey94)
    await shut94()
    const heroMenu94 = await menu94(heroKey94)
    await shut94()
    check('step 94 — D5c\'s "Make this the main feed" is SECOND in a secondary feed\'s ⋯, after Hide (R-126), and absent on the main feed and on a section that is no feed (UX-DR3)',
      same94(['Hide', W94.MAKE_MAIN_FEED, 'Rename', 'Duplicate', 'Delete'])(newMenu94) && !mainMenu94.includes(W94.MAKE_MAIN_FEED) && !heroMenu94.includes(W94.MAKE_MAIN_FEED),
      JSON.stringify({ newMenu94, mainMenu94, heroMenu94 }))
    await act94(newKey94, W94.MAKE_MAIN_FEED)
    const re94 = await until94(feeds94, (f) => f.map((x) => x.pager).join() === 'false,true')
    check('step 94 — Make this the main feed moves the chip in ONE edit, said aloud; the pager moves with it, and the old main feed draws the newest posts as a fixed list',
      same94([newKey94])(await until94(chips94, same94([newKey94]))) && (await until94(saidNow92, (v) => v === W94.NOW_MAIN(newName94))) === W94.NOW_MAIN(newName94) &&
      re94.map((f) => f.pager).join() === 'false,true' && same94(expected94({}))(re94[0]?.titles), JSON.stringify({ chips: await chips94(), said: await saidNow92(), pagers: re94.map((f) => f.pager) }))
    await undo94()
    check('step 94 — one Undo puts the chip back, and the picks are as they were', same94([gridKey94])(await until94(chips94, same94([gridKey94]))) && same94(moved94)((await until94(feeds94, (f) => same94(moved94)(f[1]?.titles)))[1]?.titles))
    await act94(gridKey94, 'Delete')
    const del94 = await until94(feeds94, (f) => f.length === 1)
    const delSaid94 = W94.withTransfer(`${gridName94} removed`, newName94)
    check('step 94 — Delete on the main feed hands the flag to the next feed below IN THE SAME EDIT, and says both sentences',
      (await row94(gridKey94).count()) === 0 && same94([newKey94])(await chips94()) && (await until94(saidNow92, (v) => v === delSaid94)) === delSaid94 && del94.length === 1 && del94[0].pager,
      JSON.stringify({ chips: await chips94(), said: await saidNow92(), feeds: del94.map((f) => f.pager) }))
    await undo94()
    check('step 94 — one Undo restores the feed AND its flag', (await row94(gridKey94).count()) === 1 && same94([gridKey94])(await until94(chips94, same94([gridKey94]))))
    await act94(gridKey94, 'Hide')
    const hideSaid94 = await until94(saidNow92, (v) => v === W94.NOW_MAIN(newName94))
    const hiddenMenu94 = await menu94(gridKey94)
    await shut94()
    check('step 94 — Hide on the main feed hands the flag on, saying only "{name} is now the main feed.", and a hidden row is never offered the flag',
      same94([newKey94])(await chips94()) && hideSaid94 === W94.NOW_MAIN(newName94) && hiddenMenu94[0] === 'Show' && !hiddenMenu94.includes(W94.MAKE_MAIN_FEED), JSON.stringify({ chips: await chips94(), said: hideSaid94, hiddenMenu94 }))
    await act94(gridKey94, 'Show')
    check('step 94 — showing it again never takes the flag back', same94([newKey94])(await chips94()), JSON.stringify(await chips94()))
    await undo94()
    await undo94()
    check('step 94 — two Undos put the chip back on the post grid, shown', same94([gridKey94])(await until94(chips94, same94([gridKey94]))) && (await until94(feeds94, (f) => f.length === 2)).length === 2)
    const beforeDup94 = (await rows94()).map((r) => r.key)
    await act94(gridKey94, 'Duplicate')
    const copy94 = (await rows94()).map((r) => r.key).filter((k) => !beforeDup94.includes(k))
    check('step 94 — Duplicate on the main feed gives a copy that is never the main feed, and no second pager (DW-194)',
      copy94.length === 1 && same94([gridKey94])(await chips94()) && (await until94(feeds94, (f) => f.length === 3)).filter((f) => f.pager).length === 1, JSON.stringify({ copy94, chips: await chips94() }))
    await undo94()
    await act94(newKey94, 'Delete')
    check('step 94 — deleting a secondary feed moves nothing and says only its own sentence', same94([gridKey94])(await chips94()) && (await until94(saidNow92, (v) => v === `${newName94} removed`)) === `${newName94} removed`, await saidNow92())
    await act94(gridKey94, 'Hide')
    check('step 94 — hiding the ONLY feed keeps its flag, hidden (5.16\'s rule), and Home never carries the archive note — its page 2 is another file',
      same94([gridKey94])(await chips94()) && (await page.locator('[data-feedless-note]').count()) === 0)
    await undo94()
    await act94(gridKey94, 'Delete')
    check('step 94 — deleting the ONLY feed is allowed: no chip anywhere, no feed on the canvas', (await until94(chips94, (c) => c.length === 0)).length === 0 && (await until94(feeds94, (f) => f.length === 0)).length === 0)
    await undo94()
    check('step 94 — one Undo brings it back as the main feed', same94([gridKey94])(await until94(chips94, same94([gridKey94]))))

    // ── LATEST POST: R-108's Source alone, and Hand-picked holding its own limit
    await select94(heroKey94)
    const hd94 = await data94()
    check('step 94 — R-108: Latest Post\'s Data group offers Source alone — no Count, no Order',
      (await hd94.locator('button[id$="-source"]').count()) === 1 && (await hd94.locator('[role="group"][id$="-count"]').count()) === 0 && (await hd94.locator('[role="radiogroup"]').count()) === 0)
    await source94(WORD94.picked)
    await (await data94()).locator('button[id$="-search"]').click()
    await page.waitForTimeout(300)
    const heroPick94 = (await page.locator(':popover-open ul li button').first().innerText()).trim()
    await page.locator(':popover-open ul li button').first().click()
    await page.waitForTimeout(700)
    const heroNow94 = await until94(heroCard94, (t) => t === heroPick94)
    const held94 = await page.evaluate(() => {
      const b = document.querySelector('#editor-controls [data-data-group] button[id$="-search"]')
      return b && { disabled: b.getAttribute('aria-disabled'), reason: document.getElementById(b.getAttribute('aria-describedby') ?? '')?.textContent ?? null }
    })
    check('step 94 — a fixed query\'s Hand-picked holds its own limit: one pick, the card shows it, and the search greys with its reason',
      heroNow94 === heroPick94 && (await (await data94()).locator('[data-picked-count]').innerText()) === W94.PICKED(1) && held94?.disabled === 'true' && held94?.reason === W94.HOLDS(pilot(HERO_DESIGN94).name, 1),
      JSON.stringify({ heroNow94, heroPick94, held94 }))
    await source94(WORD94.latest)
    const heroQ94 = pilot(HERO_DESIGN94).dataBindings[HERO_KEY94]
    const newest94 = CV94.rowsFor(heroQ94, CV94.sampleRows({ [HERO_KEY94]: heroQ94 })[HERO_KEY94])[0]?.title
    check('step 94 — Latest again shows the newest post, and the pick waits in its own field', (await until94(heroCard94, (t) => t === newest94)) === newest94, String(await heroCard94()))

    // ── FR-H2's ARCHIVE CASE on the Tag canvas: its only feed hidden says so at the head of Layers
    await page.goto(editorUrl('tag'), { waitUntil: 'load' })
    await painted('tag')
    const tagMain94 = (await until94(chips94, (c) => c.length === 1))[0]
    check('step 94 — the Tag canvas opens with its post grid the main feed', tagMain94 !== undefined, JSON.stringify(await chips94()))
    if (tagMain94 !== undefined) {
      await act94(tagMain94, 'Hide')
      const note94 = await until94(() => page.locator('[data-feedless-note]').textContent().catch(() => null), (t) => t === W94.FEEDLESS('Tag'))
      check('step 94 — its only feed hidden, the Tag canvas says so at the head of Layers — and the hidden feed keeps the flag', note94 === W94.FEEDLESS('Tag') && same94([tagMain94])(await chips94()), JSON.stringify(note94))
      await act94(tagMain94, 'Show')
      const gone94 = await until94(() => page.locator('[data-feedless-note]').count(), (n) => n === 0)
      await undo94()
      await undo94()
      check('step 94 — the note goes the moment a feed shows again, and two Undos leave the Tag page as it was',
        gone94 === 0 && (await until94(() => page.locator('[data-feedless-note]').count(), (n) => n === 0)) === 0 && same94([tagMain94])(await chips94()))
    }

    // ── …AND THE NEXT EDIT STORES THE REPAIR: leaving flushes Home, whose row now carries the flag on its post grid alone
    await leaveEditor()
    const stored94b = await pollRow92('home', (doc) => (doc?.instances ?? []).some((i) => i.isMainFeed === true))
    check('step 94 — the repair is STORED with the next edit of that canvas: the `home` row carries the flag on the post grid alone',
      same94([idOf94(gridKey94)])((stored94b?.instances ?? []).filter((i) => i.isMainFeed === true).map((i) => i.instanceId)), JSON.stringify(stored94b?.instances?.map((i) => [i.designId, i.isMainFeed])))

    // ── AD-36: a CRAFTED stored value, planted through the service key after the editor has gone (step 52's pattern)
    const MARK94 = 'INFLOZO-CRAFTED-94'
    const CRAFT94 = `x'}}{{#get "members"}}${MARK94}{{/get}}`
    const valid94 = LIB.orbitWeekly.posts()[2]
    const crafted94 = {
      ...seedHome94,
      instances: seedHome94.instances.flatMap((i) =>
        i.designId === HERO_DESIGN94 ? [{ ...i, data: { [HERO_KEY94]: { source: 'picked', picks: [{ id: CRAFT94, title: CRAFT94 }, { id: valid94.id, title: valid94.title }] } } }]
        : i.designId === MAIN_DESIGN ? [
          i,
          { ...i, instanceId: `${i.instanceId}-crafted`, layerName: 'Crafted feed', isMainFeed: false, data: { posts: { source: 'tag', tag: CRAFT94, count: CRAFT94, order: CRAFT94 } } },
          // and a pick in Ghost's own id shape that the sample does not hold: drawn as nothing, its row kept with a note
          { ...i, instanceId: `${i.instanceId}-lacking`, layerName: 'Lacking feed', isMainFeed: false, data: { posts: { source: 'picked', picks: [{ id: 'f'.repeat(24), title: 'A post the sample lacks' }, { id: valid94.id, title: valid94.title }] } } },
        ]
        : [i]),
    }
    await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home`, { method: 'PATCH', body: JSON.stringify({ doc: crafted94 }) })
    // read back by VALUE, not by its serialisation: `jsonb` stores an object's keys in its own order
    const back94 = (await rowOf92('home'))?.instances ?? []
    check('step 94 — the control: the crafted values are stored as written',
      back94.some((i) => i.instanceId.endsWith('-crafted') && i.data?.posts?.tag === CRAFT94) && back94.some((i) => i.data?.[HERO_KEY94]?.picks?.[0]?.id === CRAFT94), JSON.stringify(back94.map((i) => i.instanceId)))
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    const cf94 = await until94(feeds94, (f) => f.length === 3)
    const html94 = await canvasFrame().evaluate(() => document.documentElement.outerHTML)
    check('step 94 — AD-36: the fold IGNORES a crafted tag, Count and Order — that feed draws the default query, the newest posts at the page size — and drops a crafted pick while the valid one shows; nothing crafted reaches the canvas',
      cf94.length === 3 && same94(expected94({}))(cf94[1].titles) && !cf94[1].pager && (await until94(heroCard94, (t) => t === valid94.title)) === valid94.title && !html94.includes(MARK94) && !html94.includes("x'}}"),
      JSON.stringify({ drawn: cf94.map((f) => f.titles.length), hero: await heroCard94() }))
    check('step 94 — a pick the sample does not hold draws NOTHING — the feed draws the one it does hold, never re-sorted — and draws no pager',
      same94([valid94.title])(cf94[2]?.titles) && !cf94[2]?.pager, JSON.stringify(cf94[2]))
    const lackingKey94 = (await rows94()).find((r) => r.name === 'Lacking feed')?.key
    if (lackingKey94 !== undefined) {
      await select94(lackingKey94)
      const notes94 = await (await data94()).locator('[data-pick]').evaluateAll((els) => els.map((e) => e.querySelector('[data-pick-note]')?.textContent ?? null))
      check('step 94 — …and its row STAYS in the picked list, saying so: "Not in the sample content."', same94([W94.PICK_LACKING('sample'), null])(notes94), JSON.stringify(notes94))
    } else check('step 94 — the lacking feed has its Layers row', false, JSON.stringify(await rows94()))
    const craftedKey94 = (await rows94()).find((r) => r.name === 'Crafted feed')?.key
    if (craftedKey94 !== undefined) {
      await select94(craftedKey94)
      const cd94 = (await (await data94()).innerText()).replace(/\s+/g, ' ')
      check('step 94 — …and the panel prints none of it: By tag with no tag chosen, Count and Order at the base', !cd94.includes(MARK94) && cd94.includes(WORD94.tag) && (await (await data94()).locator('[role="group"][id$="-count"]').innerText()).includes(String(PER_PAGE)), cd94.slice(0, 200))
    } else check('step 94 — the crafted feed has its Layers row', false, JSON.stringify(await rows94()))

    // THE WALK LEAVES THE PROJECT AS IT FOUND IT: the seed, and the Tag canvas's row as it was before this step
    await leaveEditor()
    if (tagBefore94 === null) await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.tag`, { method: 'DELETE' })
    else await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.tag`, { method: 'PATCH', body: JSON.stringify({ doc: tagBefore94 }) })
    await freshLoad()
    check('step 94 — restored: the home row is the seed again, and the Tag canvas stores what it stored before this step',
      JSON.stringify(await rowOf92('home')) === JSON.stringify(seedHome94) && JSON.stringify(await rowOf92('tag')) === JSON.stringify(tagBefore94))

    // ── step 79 — the harness does NOT exist in production (R-146) ──
    for (const path of ['/harness/editor', '/harness/canvas']) {
      const r = await context.request.get(at(path), { maxRedirects: 0 })
      check(`step 79 — R-146: ${path} answers 404 on the deployed site — the keyboard harness is the gate's alone`, r.status() === 404, `HTTP ${r.status()}`)
    }

    // ── step 80 — S3's account-menu row, on the dashboard, opening the same card ──
    const menuPage59 = steady(await context.newPage())
    await menuPage59.goto(at('/'), { waitUntil: 'load' })
    await menuPage59.locator('[popovertarget="account-menu"]').click()
    await menuPage59.waitForTimeout(400)
    const row59 = await menuPage59.evaluate(() => {
      const b = document.querySelector('#account-menu [data-shortcuts-open]')
      if (!b) return null
      const chip = b.querySelector('span:last-child')
      const c = getComputedStyle(chip)
      return { words: b.textContent.replace(/\s+/g, ' ').trim(), chip: chip.textContent.trim(), size: c.fontSize, radius: c.borderRadius, padding: `${c.paddingTop} ${c.paddingLeft}`, glyph: !!b.querySelector('svg') }
    })
    // `S3 Dashboard.dc.html:362` — the glyph, the words, and a mono `?` chip at `margin-left:auto`, 11px / 5px / `1px 5px`
    check('step 80 — S3d: the account menu carries **Keyboard shortcuts** with its glyph and its `?` chip, as drawn — the row Story 1.5 left for this story',
      row59 !== null && /Keyboard shortcuts/.test(row59.words) && row59.chip === '?' && row59.glyph && row59.size === '11px' && row59.radius === '5px' && row59.padding === '1px 5px', JSON.stringify(row59))
    await menuPage59.locator('#account-menu [data-shortcuts-open]').press('Enter')
    await menuPage59.waitForTimeout(400)
    const sameCard59 = await menuPage59.evaluate(() => {
      const d = document.querySelector('dialog[open][data-shortcuts-sheet]')
      return d ? [...d.querySelectorAll('[data-shortcut-row]')].map((r) => r.dataset.shortcutRow) : null
    })
    check('step 80 — and it opens THE SAME card, row for row (one list, two readers)',
      sameCard59 !== null && JSON.stringify(sameCard59) === JSON.stringify(card59 && card59.actions), JSON.stringify(sameCard59))
    await menuPage59.close()

    // Story 5.8's steps have been EDITING, and since this story an edit reaches the stored doc — so the seed is handed
    // back before steps 6, 6b and 7, which read it. Same `freshLoad` the rest of the walk uses.
    await freshLoad()

    // SCOPED TO THE EDITOR AND THE CANVAS, as step 14's and step 70's are: step 80 opens the Projects page inside this
    // session, and that page's zod JIT probe is a recorded violation of its own (DW-201) — the review's first complete
    // run failed here on that one event and no other
    const session = violations.splice(0).filter((v) => /\/(projects\/|canvas$)/.test(new URL(v.url).pathname))
    check('step 5 — the scripted session — folds, /post, Back, steps 10–13\'s and 15\'s hover, select, edits, reset, Esc and scrolling, and Story 5.3\'s typing, marks, links, paste, line breaks, a button\'s label, the lock pill, the scrolling toolbar, the panel\'s own field and the press on nothing, Story 5.5\'s switcher, its soft navigations and the whole round trip, Story 5.6\'s mode flips, dark authoring, resets, both clear entry points and the Theme settings screen, Story 5.7\'s device changes, folds, arrows and the 40-section fixture, Story 5.8\'s edits, undos, redos, ⌘Z, ⇧⌘Z, ⌘S, its two reloads and its Retrying panel, and Story 5.9\'s whole keyboard map — the skip link, the Tab walk, `L`, `.`, `1` `2` `3`, ⌘D, Del, the Esc ladder, the `?` card and every deferred key, and Story 5.12\'s dice, its roll, its confirm and `⇧R`, and Story 5.13\'s pill, its menu, its search, its two picks, its reload and its planted fallback, and Story 5.14\'s View as — its menu, its three visitors, its reloads, every key pressed at it, the Member visibility it gates and the canvas switch it survives — and Story 5.15\'s `core`, run from the editor against the canvas window while designing and in Preview, and Preview itself — in by the pill and by `P`, out by Back to editing, `Esc` and `P`, at Desktop and at Mobile, with a link, a submit and typing pressed in it — and Story 5.16\'s page 2, entered from D5d\'s row on Home and on Tag, edited, reloaded, measured at three devices in two windows, its header\'s R-180 ask cancelled and confirmed, and left by its pill — and Story 5.19\'s main feed, its chip pointed at and selected, a second feed placed, reassigned, deleted, hidden, shown, duplicated and undone, P0·5\'s Data group through every Source with three picks moved by ⌥↓, Latest Post\'s one pick, the Tag canvas\'s archive note and a crafted stored value — records zero securitypolicyviolation events in either document', session.length === 0, JSON.stringify(session))
    // the control: a script carrying each document's OWN nonce runs new Function(''). The editor's nonce is read off its
    // own scripts; the canvas document has none, so the frame is reloaded and its nonce read off that response's policy.
    // The test runs on a TIMER, never inside the evaluate: V8 lets code run during a DevTools evaluation generate code
    // from strings, so a synchronous `new Function` there answered 'allowed' under the very policy that refused zod's
    // probe on load (executed 2026-09-17). The timer's task is the page's own.
    const evalIn = async (frame, nonce) => {
      await frame.evaluate((n) => {
        delete window.__evalResult
        const s = document.createElement('script')
        s.nonce = n
        s.textContent = "setTimeout(() => { try { new Function(''); window.__evalResult = 'allowed' } catch (e) { window.__evalResult = e.name } }, 0)"
        document.head.append(s)
        s.remove()
      }, nonce)
      return frame.waitForFunction(() => window.__evalResult, null, { timeout: 5000 }).then((h) => h.jsonValue(), () => 'the nonce script did not run')
    }
    const editorEval = await evalIn(page.mainFrame(), await page.evaluate(() => document.querySelector('script[nonce]')?.nonce))
    const [reloaded] = await Promise.all([
      page.waitForResponse((r) => /\/canvas$/.test(new URL(r.url()).pathname)),
      canvasFrame().evaluate(() => location.reload()),
    ])
    await page.waitForTimeout(500)
    const canvasEval = await evalIn(canvasFrame(), /'nonce-([^']+)'/.exec((await reloaded.allHeaders())['content-security-policy'] || '')?.[1])
    check('step 5 — control: new Function(\'\') throws EvalError in the editor document, from a script carrying its nonce', editorEval === 'EvalError', editorEval)
    check('step 5 — control: new Function(\'\') throws EvalError in the canvas document, from a script carrying its nonce', canvasEval === 'EvalError', canvasEval)
    /* STORY 5.15's NEGATIVE CONTROL (the spec's Verification, standing rule 1). `eval`, reached from the EDITOR'S realm on
       the canvas window — the road a canvas-side wrapper evaluating `bundle`'s strings would have needed (DW-136's
       "likely shape") — is refused by the CANVAS's policy: the realm of the function called decides. That is why `core`
       is imported and run from the editor's own bundle, and it is what makes step 91's zero a result rather than a
       blind spot: code acting on that window is not exempt from its policy, it simply compiles nothing there. Run on a
       TIMER from a script carrying the editor's own nonce, for `evalIn`'s reason. Executed first in Chromium 149 against a
       local page pair carrying this policy (2026-09-22, Story 5.15's Dev): `EvalError`, reported by the child. */
    const crossEval = await (async () => {
      await page.evaluate((n) => {
        delete window.__crossEval
        const s = document.createElement('script')
        s.nonce = n
        s.textContent = "setTimeout(() => { try { document.querySelector('section[aria-label=Canvas] iframe').contentWindow.eval('1'); window.__crossEval = 'allowed' } catch (e) { window.__crossEval = e.name } }, 0)"
        document.head.append(s)
        s.remove()
      }, await page.evaluate(() => document.querySelector('script[nonce]')?.nonce))
      return page.waitForFunction(() => window.__crossEval, null, { timeout: 5000 }).then((h) => h.jsonValue(), () => 'the nonce script did not run')
    })()
    check('step 5 — control (Story 5.15): eval(\'1\') called from the editor on the canvas window throws EvalError under the canvas\'s policy — nothing is compiled in the canvas from the editor\'s side either', crossEval === 'EvalError', crossEval)
    // WAITED FOR, not slept at: each report is an `exposeBinding` round-trip, and a fixed 300ms lost both of them once
    // on a loaded machine (2026-09-18) — which under standing rule 2 would have voided step 5's zero for the whole run.
    // Waiting weakens nothing: the control still fails if the refusals never reach the recorder.
    // WAITED FOR PER DOCUMENT, not by a bare count. Both refusals really happen — the two checks above read the
    // EvalError each document threw — but the two binding round-trips are independent and the canvas document's has
    // been the slower one, arriving after a flat count had already given up (twice, 2026-09-19). Counting to two
    // also cannot tell "both documents refused" from "the editor refused twice", which is the thing this control is
    // for. So it waits for one from EACH, and still fails if either never comes.
    const evals = () => violations.filter((v) => /script-src/.test(v.directive) && /eval/.test(v.blocked))
    const fromBoth = () => {
      const seen = evals()
      return seen.some((v) => /\/canvas$/.test(new URL(v.url).pathname)) && seen.some((v) => !/\/canvas$/.test(new URL(v.url).pathname))
    }
    for (let i = 0; i < 100 && !fromBoth(); i++) await page.waitForTimeout(100)
    const both = fromBoth()
    const recorded = violations.splice(0)
    check('step 5 — control: the recorder sees an eval refusal from EACH document, so its zero above is a result', both, JSON.stringify(recorded))

    // ── step 6 — the scheme ──
    // every canvas this project offers answers 200 — derived from `lib/editor.ts`, so a canvas a later story opens
    // joins this walk without an edit here (Story 5.5 added R-129's three membership segments this way)
    for (const key of OFFERED.filter((k) => k !== 'home')) {
      const r = await context.request.get(editorUrl(key), { maxRedirects: 0 })
      check(`step 6 — /${key} answers 200`, r.status() === 200, `HTTP ${r.status()}`)
    }
    const home = await context.request.get(editorUrl('home'), { maxRedirects: 0 })
    // `endsWith`: the app's redirects are written for the app host, so on localhost the location has no /app prefix
    check('step 6 — /home answers 308 to /projects/<id>', home.status() === 308 && new URL(home.headers().location, APP).pathname.endsWith(`/projects/${P}`), `HTTP ${home.status()} → ${home.headers().location}`)
    // `index` is 404 PERMANENTLY (R-127: page 2 has no canvas), `private` is 404 because this project's site has not
    // asked for one — a canvas the switcher does not offer must not be reachable by typing its address either
    for (const key of ['index', 'private', 'paywall', 'cards', 'custom-x', 'custom-nonsense', 'nonsense']) {
      const r = await context.request.get(editorUrl(key), { maxRedirects: 0 })
      check(`step 6 — /${key} answers 404`, r.status() === 404 && /Page not found/.test(await r.text()), `HTTP ${r.status()}`)
    }
    const fourOhFour = async (id) => {
      const r = await context.request.get(at(`/projects/${id}`), { maxRedirects: 0 })
      const body = await r.text()
      return { status: r.status(), title: /<title>([^<]*)<\/title>/.exec(body)?.[1], heading: /<h1[^>]*>([^<]*)<\/h1>/.exec(body)?.[1] }
    }
    const answers = [await fourOhFour(B), await fourOhFour(require('node:crypto').randomUUID()), await fourOhFour('abc')]
    // R-131 (Review): `settings/page.tsx` sits UNDER its own `loading.tsx` boundary, so the parent guard is the only thing
    // between a stranger and a streamed 200 — and steps 2/6/9 never asked this route
    const settingsAnswers = [await fourOhFour(`${B}/settings`), await fourOhFour(`${require('node:crypto').randomUUID()}/settings`), await fourOhFour('abc/settings')]
    check('step 6 — the same three on /settings answer the SAME real 404, above the settings skeleton', settingsAnswers.every((a) => JSON.stringify(a) === JSON.stringify(answers[0])), JSON.stringify(settingsAnswers))
    check('step 6 — B\'s project, a random uuid and abc answer identical real 404s', answers.every((a) => a.status === 404 && JSON.stringify(a) === JSON.stringify(answers[0])), JSON.stringify(answers))
    const stranger = await pwRequest.newContext()
    for (const [label, url, want] of [['/projects/<id>', editorUrl(), 307], ['/canvas', at('/canvas'), 303]]) {
      const r = await stranger.get(url, { maxRedirects: 0 })
      check(`step 6 — signed out, ${label} answers ${want} to /sign-in`, r.status() === want && /\/sign-in$/.test(new URL(r.headers().location, APP).pathname), `HTTP ${r.status()} → ${r.headers().location}`)
    }
    await stranger.dispose()
    await page.goto(at('/'), { waitUntil: 'load' })
    const projectsUrl = page.url()
    await openCard()
    await painted('home')
    // STORY 5.5 MAKES THIS WALK SOFT, which is DW-176's whole point: every canvas change below is the switcher's own
    // push, not a `page.goto`, so browser Back walks a history the editor built without ever reloading. The stamps
    // prove it — one on the editor window, one on the canvas document — and they must survive the whole walk.
    await page.evaluate(() => { window.__soft = 'editor' })
    await canvasFrame().evaluate(() => { document.documentElement.dataset.soft = 'canvas' })
    const pressRow = async (key) => {
      await page.locator('#editor-template').click()
      await page.waitForTimeout(300)
      await page.locator(`#editor-template-menu button[data-canvas="${key}"]`).click()
      await painted(key)
      await page.waitForTimeout(300)
    }
    await pressRow('post')
    await pressRow('tag')
    await page.goBack()
    await painted('post')
    await page.goBack()
    await painted('home')
    const backHome = {
      url: page.url(),
      rows: await page.locator('aside[aria-label="Layers"] [data-layer-row]').all().then((r) => r.length),
      ...(await page.evaluate(() => ({ editor: window.__soft, canvas: document.querySelector('section[aria-label="Canvas"] iframe').contentDocument.documentElement.dataset.soft }))),
    }
    check('step 6 — two soft pushes and two Backs land on /projects/<id> showing Home\'s sections, with the editor never reloaded', backHome.url === editorUrl() && backHome.rows === stackOf('home').length && backHome.editor === 'editor' && backHome.canvas === 'canvas', JSON.stringify(backHome))
    await page.goBack({ waitUntil: 'load' })
    // A LOCAL RUN CANNOT MAKE THIS WALK, and the reason is `openCard`'s: off the app host the card's link carries no
    // `/app` prefix, so the local re-entry leaves an unprefixed 404 in the history between the editor and Projects —
    // and Chromium aborts a Back out of that error document. Skipped there and stated, never skipped on the deployed
    // run, which is the result R-82 asks for (executed 2026-09-18).
    if (LOCAL && page.url() !== projectsUrl) note('step 6 — Back again lands on Projects', `not assertable on a LOCAL run: openCard re-enters under the prefix, leaving ${page.url()} in the history`)
    else check('step 6 — Back again lands on Projects', page.url() === projectsUrl, page.url())

    // ── step 6b — a bad doc is loud, never a partly drawn canvas (the matrix's "Bad doc" row; review, 2026-09-17) ──
    // A `tag` row placing a24/1, which compiles to post.hbs alone: `editorData` throws for the whole project, so even
    // Home shows the app's error boundary and no canvas. Production replaces the thrown sentence with a digest, so the
    // boundary and the absence of a canvas are what a deployed run can read. The row is removed again afterwards.
    const [postOnly] = TEMPLATES.post
    // UPSERT, not INSERT. Since Story 5.8 the editor WRITES `project_templates`, so by the time this walk reaches
    // here a `tag` row may legitimately exist from a step that designed that canvas — and a plain POST answers 409.
    const badDoc = { schemaVersion: 1, instances: [{ instanceId: 'bad-1', layerName: 'Wrong canvas', designId: postOnly[0], content: {}, controls: {}, data: {}, darkOverrides: {} }] }
    const bad = await call('/rest/v1', '/project_templates', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ project_id: P, user_id: ids[0], template_key: 'tag', doc: badDoc }) })
    check('step 6b — a tag row placing a post-only design is written', bad.status === 200 || bad.status === 201, `HTTP ${bad.status}`)
    // `dropLocal` and not `freshLoad`: a bad doc means the canvas NEVER paints, so waiting for one would be the
    // harness timing out on the very state this step exists to read
    await dropLocal()
    await page.goto(editorUrl(), { waitUntil: 'load' })
    const loud = await page.locator('h1').first().innerText().catch(() => '')
    const canvases = await page.locator('section[aria-label="Canvas"]').count()
    check('step 6b — the editor shows the error boundary and no canvas, never a partly drawn one', /couldn.t show that/i.test(loud) && canvases === 0, `h1 ${JSON.stringify(loud)} · canvases ${canvases}`)
    const unbad = await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.tag`, { method: 'DELETE' })
    check('step 6b — the bad row is removed and Home paints again', unbad.status === 200 || unbad.status === 204, `HTTP ${unbad.status}`)
    await freshLoad()

    // ── step 7 — scroll ──
    await freshLoad()
    const box = await page.locator('section[aria-label="Canvas"]').boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(600)
    const scroll = { window: await page.evaluate(() => ({ scrollHeight: document.documentElement.scrollHeight, innerHeight, scrollY })), canvas: await canvasFrame().evaluate(() => document.scrollingElement.scrollTop) }
    check('step 7 — the window cannot scroll, and the wheel over the canvas scrolls the canvas document', scroll.window.scrollHeight === scroll.window.innerHeight && scroll.window.scrollY === 0 && scroll.canvas > 0, JSON.stringify(scroll))
    await handBack(page)
    await context.close()

    // ── step 70 — FR-D10's honest fallback, in its OWN context ──
    // IN ITS OWN CONTEXT because the only way to model "this browser has no IndexedDB" is an init script, and an init
    // script cannot be taken off a page again — leaving it on would silently disable the local store for every step
    // after it. Its own recorder, so its own zero is its own result.
    const noIdbViolations = []
    const noIdb = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await recorder(noIdb, noIdbViolations)
    await noIdb.addInitScript(() => {
      Object.defineProperty(window, 'indexedDB', { configurable: true, get() { throw new Error('site data is switched off in this browser') } })
    })
    const noIdbPage = await noIdb.newPage()
    await noIdbPage.goto(await magic(emailA), { waitUntil: 'load' })
    await noIdbPage.goto(editorUrl(), { waitUntil: 'load' })
    await noIdbPage.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.painted === 'home', null, { timeout: 30000 })
    const fallbackBar = await noIdbPage.evaluate(() => ({
      label: document.querySelector('#editor-save-state [role="status"]')?.textContent ?? null,
      state: document.querySelector('#editor-save-state [data-sync-state]')?.getAttribute('data-sync-state') ?? null,
      glyphPaths: [...(document.querySelector('#editor-save-state [data-sync-state] svg')?.querySelectorAll('path') ?? [])].map((x) => x.getAttribute('d')).join(' | '),
      canvases: document.querySelectorAll('section[aria-label="Canvas"]').length,
    }))
    check('step 70 — FR-D10: with no IndexedDB the editor still opens and paints, and the indicator says exactly what is true — never either resting state',
      fallbackBar.canvases === 1 && fallbackBar.state === FALLBACK_LABEL58 && fallbackBar.label === FALLBACK_LABEL58 && fallbackBar.state !== SYNCED58 && fallbackBar.state !== OWED58, JSON.stringify(fallbackBar))
    check('step 70 — R-142: it is GREY like "Saved on this device" and told apart from it by its GLYPH, never by its colour',
      fallbackBar.glyphPaths === glyph58('upload') && fallbackBar.glyphPaths !== glyph58('clock'), fallbackBar.glyphPaths)
    // AND THE FALLBACK'S ONE CLAIM IS TRUE, not only printed (the review): an edit here really goes up, with no ⌘S
    const beforeNoIdb = await revisionNow58()
    // Hide or Show from the first PAGE row's ⋯ menu — whichever it offers — is one ordinary edit with no dialog
    await noIdbPage.locator('#editor-layers [data-layer-row]').nth(GRID).getByRole('button', { name: /^More for / }).click()
    await noIdbPage.waitForTimeout(250)
    await noIdbPage.getByRole('button', { name: /^(Hide|Show)$/ }).first().click()
    const noIdbEdit = async () => {
      await noIdbPage.waitForTimeout(3000)
      return revisionNow58()
    }
    const afterNoIdb = await noIdbEdit()
    // …and put back, so the axe pass below still finds Three Up on the canvas: a second change, a second revision
    await noIdbPage.locator('#editor-layers [data-layer-row]').nth(GRID).getByRole('button', { name: /^More for / }).click()
    await noIdbPage.waitForTimeout(250)
    await noIdbPage.getByRole('button', { name: /^(Hide|Show)$/ }).first().click()
    const restoredNoIdb = await noIdbEdit()
    check('step 70 — "Syncing every change to the cloud" is true: one change, no ⌘S, and projects.revision moved',
      afterNoIdb === beforeNoIdb + 1 && restoredNoIdb === beforeNoIdb + 2, `revision ${beforeNoIdb} → ${afterNoIdb} → ${restoredNoIdb}`)
    // scoped to the editor and the canvas exactly as step 14's `touchSession()` is: the magic link lands on `/`, whose
    // own violation (zod's JIT probe, DW below) is not this context's subject
    const noIdbOwn = noIdbViolations.filter((v) => /\/(projects\/|canvas$)/.test(new URL(v.url).pathname))
    check('step 70 — that context records zero CSP violations of its own in the editor or the canvas', noIdbOwn.length === 0, JSON.stringify(noIdbViolations))
    await handBack(noIdbPage)
    await noIdb.close()

    // ── step 8 — axe, in its own context (bypassCSP: axe is injected, which the policy would refuse) ──
    const axeContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, bypassCSP: true })
    const axePage = await axeContext.newPage()
    await axePage.goto(await magic(emailA), { waitUntil: 'load' })
    await axePage.goto(editorUrl(), { waitUntil: 'load' })
    await axePage.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.painted === 'home', null, { timeout: 30000 })
    for (const f of axePage.frames()) await f.addScriptTag({ path: AXE })
    const control = await axePage.evaluate(async (tags) => {
      const probe = document.createElement('img')
      probe.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
      document.querySelector('aside[aria-label="Page settings"]').append(probe)
      const r = await window.axe.run(document, { runOnly: tags })
      probe.remove()
      return r.violations.map((v) => v.id)
    }, WCAG)
    check('step 8 — axe positive control: an <img> with no alt is reported', control.includes('image-alt'), control.join(','))
    // R-149 (owner, 2026-09-19): ONE axe rule is excepted on ONE element. The canvas iframe carries `tabIndex={-1}` so
    // the canvas is a single tab stop (UX-DR9), and `frame-focusable-content` refuses that attribute on any frame
    // whose document holds a focusable element. Everything in the canvas has a keyboard route through Layers and the
    // panel, which `tools/keyboard/journey.spec.mjs` proves on every commit. The filter below drops that rule's node
    // for that iframe ALONE — the same rule on any other frame, and every other rule on this one, still fails.
    const axe = await axePage.evaluate(async (tags) => (await window.axe.run(document, { runOnly: tags })).violations.map((v) => v.id !== 'frame-focusable-content' ? v : { ...v, nodes: v.nodes.filter((n) => document.querySelector(n.target[0]) !== document.querySelector('section[aria-label="Canvas"] iframe')) }).filter((v) => v.nodes.length > 0).map((v) => `${v.id}(${v.nodes.length}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' · ')}`), WCAG)
    check('step 8 — axe-core finds zero WCAG 2.1 AA violations on the editor at 1440, the canvas included', axe.length === 0, axe.join('; '))
    // twice more (Story 5.2): with Three Up hovered, and with it selected
    const gridAt = async () => {
      const fr = await axePage.locator('section[aria-label="Canvas"] iframe').boundingBox()
      const f = axePage.frames().find((x) => x !== axePage.mainFrame())
      const r = await f.evaluate((n) => { const el = document.querySelectorAll('#canvas > *')[n]; el.scrollIntoView({ block: 'start' }); const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + 200 } }, stackOf('home').findIndex(([d]) => d === 'a17/1'))
      const s = fr.width / 1440
      return { x: fr.x + r.x * s, y: fr.y + r.y * s }
    }
    const axeRun = () => axePage.evaluate(async (tags) => (await window.axe.run(document, { runOnly: tags })).violations.map((v) => v.id !== 'frame-focusable-content' ? v : { ...v, nodes: v.nodes.filter((n) => document.querySelector(n.target[0]) !== document.querySelector('section[aria-label="Canvas"] iframe')) }).filter((v) => v.nodes.length > 0).map((v) => `${v.id}(${v.nodes.length}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' · ')}`), WCAG)
    let g = await gridAt()
    await axePage.waitForTimeout(150)
    await axePage.mouse.move(g.x, g.y, { steps: 3 })
    await axePage.waitForTimeout(300)
    const hoveredAxe = await axeRun()
    check('step 8 — axe: zero violations with Three Up hovered (the name tag showing)', hoveredAxe.length === 0 && (await axePage.frameLocator('section[aria-label="Canvas"] iframe').locator('[data-chrome="tag"]').count()) === 1, hoveredAxe.join('; '))
    g = await gridAt()
    await axePage.mouse.click(g.x, g.y)
    await axePage.mouse.move(120, 400)
    await axePage.waitForTimeout(300)
    const selectedAxe = await axeRun()
    // STORY 5.11: the panel that is mounted here carries B1a's Design block, so this run IS the block's axe run —
    // stated rather than assumed, because a block that failed to draw would otherwise leave the zero meaningless
    check('step 8 — axe: zero violations with Three Up selected (its panel mounted, B1a\'s Design block with it)',
      selectedAxe.length === 0 && (await axePage.locator('aside[aria-label="Section settings"]').count()) === 1 && (await axePage.locator('#editor-design').count()) === 1, selectedAxe.join('; '))
    // twice more (Story 5.3): with the mark toolbar showing over a word, and with its link panel open
    const springAxe = await textIn(axePage, stackOf('home').findIndex(([d]) => d === 'a17/1'), '.a17-1__title', 'spring')
    await axePage.mouse.dblclick(springAxe.x, springAxe.y)
    await axePage.waitForTimeout(300)
    const toolbarAxe = await axeRun()
    check('step 8 — axe: zero violations with P0-1\'s toolbar showing over a selected word', toolbarAxe.length === 0 && (await axePage.locator('[role="toolbar"][aria-label="Text formatting"]').count()) === 1, toolbarAxe.join('; '))
    await axePage.locator('[role="toolbar"] button[aria-label="Link"]').click()
    await axePage.waitForTimeout(400)
    const linkAxe = await axeRun()
    check('step 8 — axe: zero violations with the link panel open at the selection', linkAxe.length === 0 && (await axePage.locator('#canvas-inline-link').evaluate((el) => el.matches(':popover-open'))), linkAxe.join('; '))
    // Story 5.4's own state: the hover pill showing, a Layers row focused and its ⋯ menu open
    await axePage.keyboard.press('Escape')
    await axePage.keyboard.press('Escape')
    await axePage.mouse.move(g.x, g.y, { steps: 3 })
    await axePage.waitForTimeout(300)
    // the ⋯ is opened BY KEYBOARD and never by a press: a pointer on it leaves the iframe, and leaving the section
    // takes the hover and the pill with it (step 35's own rule) — the two states could not otherwise be axed together
    const moreAxe = axePage.locator('#editor-layers [data-layer-row]').nth(1).getByRole('button', { name: /^More for / })
    await moreAxe.focus()
    await axePage.keyboard.press('Enter')
    await axePage.waitForTimeout(400)
    const layersAxe = await axeRun()
    check('step 8 — axe: zero violations with S4b\'s pill showing (Story 5.11\'s ring group included) and a Layers row\'s ⋯ menu open', layersAxe.length === 0 && (await axePage.locator('[data-section-pill]').count()) === 1 && (await axePage.locator('[popover]:popover-open').count()) === 1, layersAxe.join('; '))
    // Story 5.9's own state: R-147's shortcuts card open over the editor
    await axePage.keyboard.press('Escape')
    await axePage.locator('section[aria-label="Canvas"]').focus()
    await axePage.keyboard.press('?')
    await axePage.waitForTimeout(400)
    const cardAxe = await axeRun()
    check('step 8 — axe: zero violations with R-147\'s shortcuts card open', cardAxe.length === 0 && (await axePage.locator('dialog[open][data-shortcuts-sheet]').count()) === 1, cardAxe.join('; '))
    await axePage.keyboard.press('Escape')
    await axePage.waitForTimeout(300)
    // Story 5.14's own state: S4d's menu open, with R-169's not-viewed dots and their screen-reader words in it
    await axePage.locator('#editor-view-as').focus()
    await axePage.keyboard.press('Enter')
    await axePage.waitForTimeout(400)
    const viewAsAxe = await axeRun()
    const viewAsShown = await axePage.evaluate(() => ({
      open: document.getElementById('editor-view-as-menu')?.matches(':popover-open') === true,
      dots: document.querySelectorAll('#editor-view-as-menu [data-not-viewed]').length,
    }))
    check('step 8 — axe: zero violations with S4d\'s menu open and its not-viewed dots in it (R-169)',
      viewAsAxe.length === 0 && viewAsShown.open && viewAsShown.dots > 0, `${JSON.stringify(viewAsShown)} · ${viewAsAxe.join('; ')}`)
    await axePage.keyboard.press('Escape')
    await axePage.waitForTimeout(300)

    /* STORY 5.10 — THE PICKER OPEN, AND NO SECOND NODE EXCEPTION (R-149). This is the story's own exit criterion: its
       preview frames are `inert`, so `frame-focusable-content` has nothing to report on them and the filter above —
       one rule, one element, the canvas iframe — is the only exception on the page. The frames are given time to
       paint first, because an empty frame would prove nothing about the render inside it, and axe is injected into
       each one so the previews are scanned rather than skipped. */
    await axePage.locator('section[aria-label="Canvas"]').focus()
    await axePage.keyboard.press(`${CMD58}+k`)
    await axePage.waitForTimeout(3000)
    for (const f of axePage.frames()) await f.addScriptTag({ path: AXE }).catch(() => {})
    const pickerShown = await axePage.locator('dialog[open][aria-label="Add a section"]').count()
    const pickerAxe = await axeRun()
    check('step 8 — axe: zero violations with the Section Picker open, WITH NO EXCEPTION BEYOND R-149\'s ONE (the `inert` preview frames are what buy it)',
      pickerAxe.length === 0 && pickerShown === 1, `${pickerShown} picker · ${pickerAxe.join('; ')}`)
    await axePage.keyboard.press('Escape')
    await axePage.waitForTimeout(400)
    // Story 5.15's own state: Preview — every editing surface hidden, B3b's bar the one piece of chrome, and every
    // module running in the page. A repaint writes the canvas's markup and never reloads its document, so axe stays in it.
    await axePage.locator('section[aria-label="Canvas"]').focus()
    await axePage.keyboard.press('p')
    await axePage.waitForTimeout(600)
    const previewShown = await axePage.evaluate(() => ({ bar: document.getElementById('editor-preview-bar') !== null, header: document.querySelector('header')?.checkVisibility() ?? null }))
    const previewAxe = await axeRun()
    check('step 8 — axe: zero violations in Preview, with B3b\'s bar the one piece of chrome and the editing chrome hidden',
      previewAxe.length === 0 && previewShown.bar && previewShown.header === false, `${JSON.stringify(previewShown)} · ${previewAxe.join('; ')}`)
    await axePage.keyboard.press('Escape')
    await axePage.waitForTimeout(400)
    /* STORY 5.16's own state: PAGE 2, with D5d's pill over the ground and D5d's row on the feed's panel. The main feed is
       planted for it as step 92 plants it — after this editor has gone, so its departing flush cannot overwrite it — and
       the seed's own Home is put back before the context closes. Axe is injected again: the reload is a new document. */
    // this context's OWN device copy goes first, or the reload hydrates it (the revisions agree) and never reads the plant
    await axePage.evaluate((u) => new Promise((done) => {
      const req = indexedDB.deleteDatabase(`inflozo-doc-${u}`)
      req.onsuccess = req.onerror = req.onblocked = () => done(true)
    }), ids[0]).catch(() => null)
    await axePage.goto('about:blank')
    await axePage.waitForTimeout(600)
    const seedHome8 = SEED_DOCS.find((r) => r.template_key === 'home')
    const feed8 = autoStack('home').find((i) => i.isMainFeed)?.designId
    await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home`, { method: 'PATCH', body: JSON.stringify({ doc: { ...seedHome8.doc, instances: seedHome8.doc.instances.map((i) => ({ ...i, isMainFeed: i.designId === feed8 })) } }) })
    await axePage.goto(editorUrl(), { waitUntil: 'load' })
    await axePage.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.painted === 'home', null, { timeout: 30000 })
    await axePage.locator('#editor-layers [data-layer-row]').nth(homeStack.findIndex(([d]) => d === feed8)).locator('button').first().click()
    await axePage.waitForTimeout(400)
    await axePage.locator('#editor-controls [data-page-row] [role="radio"]', { hasText: '2' }).click()
    await axePage.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.page === '2', null, { timeout: 30000 })
    await axePage.waitForTimeout(400)
    for (const f of axePage.frames()) await f.addScriptTag({ path: AXE }).catch(() => {})
    const pageTwoShown = await axePage.evaluate(() => ({ pill: document.querySelector('[data-page-two-pill]') !== null, row: document.querySelector('#editor-controls [data-page-row]') !== null }))
    const pageTwoAxe = await axeRun()
    check('step 8 — axe: zero violations on PAGE 2, with D5d\'s pill over the ground and its row on the main feed\'s panel (Story 5.16)',
      pageTwoAxe.length === 0 && pageTwoShown.pill && pageTwoShown.row, `${JSON.stringify(pageTwoShown)} · ${pageTwoAxe.join('; ')}`)
    // released BEFORE the page leaves the app's origin: `about:blank` has neither this session's `sessionStorage`
    // nor a relative URL to post to
    await handBack(axePage)
    await axePage.goto('about:blank')
    await axePage.waitForTimeout(600)
    await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home`, { method: 'PATCH', body: JSON.stringify({ doc: seedHome8.doc }) })
    await axeContext.close()

    // ── step 14 — touch: a hold shows the hover, a tap selects ──
    const touchContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true })
    // the spine: every gesture an Epic 5 story adds runs under the recorder. Touch needs a context of its own, so it
    // carries the same recorder; the EvalError control is step 5's, in the same run
    const touchViolations = []
    await recorder(touchContext, touchViolations)
    const touchPage = await touchContext.newPage()
    await touchPage.goto(await magic(emailA), { waitUntil: 'load' })
    await touchPage.goto(editorUrl(), { waitUntil: 'load' })
    // the landing is the dashboard, whose DW-174 report can land after its `load`: only the editor's and the canvas's count
    const touchSession = () => touchViolations.filter((v) => /\/(projects\/|canvas$)/.test(new URL(v.url).pathname))
    await touchPage.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.painted === 'home', null, { timeout: 30000 })
    const heroN = stackOf('home').findIndex(([d]) => d === 'a4/13')
    const heroPoint = await touchPage.evaluate((n) => {
      const f = document.querySelector('section[aria-label="Canvas"] iframe')
      const fr = f.getBoundingClientRect()
      const s = fr.width / f.offsetWidth
      const b = f.contentDocument.querySelectorAll('#canvas > *')[n].getBoundingClientRect()
      return { x: Math.round(fr.left + (b.left + b.width / 2) * s), y: Math.round(fr.top + (b.top + b.height * 0.6) * s) }
    }, heroN)
    const cdp = await touchContext.newCDPSession(touchPage)
    const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points })
    const touchState = () => touchPage.evaluate((n) => {
      const root = document.querySelector('section[aria-label="Canvas"] iframe').contentDocument.querySelectorAll('#canvas > *')[n]
      const inChrome = (sel) => [...root.ownerDocument.querySelectorAll('[data-inflozo-chrome]')].map((h) => h.shadowRoot?.querySelector(sel)).find(Boolean) ?? null
      const tag = inChrome('[data-chrome="tag"]')
      return { hover: root.hasAttribute('data-inflozo-hover'), outline: !!inChrome('[data-chrome="hover"]'), selected: root.hasAttribute('data-inflozo-selected'), tag: tag?.textContent ?? null, panel: document.querySelector('#editor-controls').getAttribute('aria-label') }
    }, heroN)
    await touch('touchStart', [heroPoint])
    await touchPage.waitForTimeout(600)
    const holding = await touchState()
    await touch('touchEnd', [])
    await touchPage.waitForTimeout(300)
    const lifted = await touchState()
    check('step 14 — a touch held 600ms on Latest Post shows its outline and tag, and nothing is selected', holding.hover && holding.outline && holding.tag === stackOf('home')[heroN][1] && !holding.selected && !lifted.selected && lifted.panel === 'Page settings', JSON.stringify({ holding, lifted }))
    await touch('touchStart', [heroPoint])
    await touchPage.waitForTimeout(50)
    await touch('touchEnd', [])
    await touchPage.waitForTimeout(400)
    const tapped = await touchState()
    check('step 14 — a 50ms tap selects it', tapped.selected && tapped.panel === 'Section settings', JSON.stringify(tapped))
    // a finger that moves past the slop is a scroll, not a press: no hover, no tap, whatever the browser fires on its lift
    await touchPage.keyboard.press('Escape')
    await touchPage.waitForTimeout(200)
    const cleared = await touchState()
    await touch('touchStart', [heroPoint])
    await touchPage.waitForTimeout(100)
    await touch('touchMove', [{ x: heroPoint.x, y: heroPoint.y + 30 }])
    await touchPage.waitForTimeout(600)
    await touch('touchEnd', [])
    await touchPage.waitForTimeout(300)
    const slid = await touchState()
    check('step 14 — after Esc, a finger that moves 30px before lifting shows no hover and selects nothing', !cleared.selected && !slid.hover && !slid.outline && !slid.selected && slid.panel === 'Page settings', JSON.stringify({ cleared, slid }))
    // Story 5.3: a tap selects, and a tap inside a text prop of the SELECTED section starts editing there
    await touch('touchStart', [heroPoint])
    await touchPage.waitForTimeout(50)
    await touch('touchEnd', [])
    await touchPage.waitForTimeout(400)
    const headlineTap = await touchPage.evaluate((n) => {
      const f = document.querySelector('section[aria-label="Canvas"] iframe')
      const fr = f.getBoundingClientRect()
      const s = fr.width / f.offsetWidth
      const el = f.contentDocument.querySelectorAll('#canvas > *')[n].querySelector('.a4-13__headline')
      el.scrollIntoView({ block: 'center' })
      const b = el.getBoundingClientRect()
      return { x: Math.round(fr.left + (b.left + 20) * s), y: Math.round(fr.top + (b.top + b.height / 2) * s) }
    }, heroN)
    await touch('touchStart', [headlineTap])
    await touchPage.waitForTimeout(50)
    await touch('touchEnd', [])
    await touchPage.waitForTimeout(400)
    const tappedInto = await touchPage.evaluate(() => {
      const d = document.querySelector('section[aria-label="Canvas"] iframe').contentDocument
      const at = d.activeElement
      return { editable: at?.isContentEditable === true, className: at?.className ?? '', collapsed: d.getSelection()?.isCollapsed === true, inside: at ? at.contains(d.getSelection()?.anchorNode ?? null) : false }
    })
    check('step 14 — a tap inside the selected section\'s headline starts editing it, with a collapsed caret in it', tappedInto.editable && /a4-13__headline/.test(tappedInto.className) && tappedInto.collapsed && tappedInto.inside, JSON.stringify(tappedInto))
    await touchPage.keyboard.press('Escape')
    await touchPage.waitForTimeout(200)
    check('step 14 — the touch context records zero securitypolicyviolation events in the editor or the canvas across the hold, the tap and the moving finger', touchSession().length === 0, JSON.stringify(touchViolations))
    await handBack(touchPage)
    await touchContext.close()

    // ── step 9 — the skeleton streams first ──
    const streamContext = await browser.newContext()
    await (await streamContext.newPage()).goto(await magic(emailA), { waitUntil: 'load' })
    // Whether the fallback streams at all is a race between the docs read and the first flush — a fast read renders the
    // editor straight into the shell, which is correct. So up to five opens: the skeleton must stream ahead of the editor
    // in at least one (its HTML, `>Opening…`, never the same words inside the flight data), and the dashboard's cards
    // must stream in none.
    const opens = []
    for (let n = 0; n < 5; n++) {
      const raw = await (await streamContext.request.get(editorUrl(), { maxRedirects: 0 })).text()
      const sentence = raw.indexOf('>Opening the editor for')
      const editor = raw.indexOf('aria-label="Canvas"')
      opens.push({ sentence, editor, dashboard: raw.includes('Loading projects') })
      if (sentence > -1 && sentence < editor) break
    }
    await streamContext.close()
    check('step 9 — the raw stream carries the skeleton\'s sr-only sentence ahead of the editor, and never the dashboard\'s cards', opens.some((o) => o.sentence > -1 && o.sentence < o.editor) && opens.every((o) => !o.dashboard), JSON.stringify(opens))
  } finally {
    if (browser) await browser.close()
    if (entitlementBack !== null) {
      const restored = await call('/rest/v1', `/entitlements?user_id=eq.${ids[0]}`, { method: 'PATCH', body: JSON.stringify({ state: entitlementBack }) })
      check('finally — A\'s entitlement restored after the Pro control', restored.status === 200 || restored.status === 204, `HTTP ${restored.status}`)
    }
    const dels = []
    for (const id of ids) if (id) dels.push((await admin(`/admin/users/${id}`, { method: 'DELETE', body: '{}' })).status)
    const afterList = await users()
    const after = afterList ? afterList.length : null
    check('DELETE both accounts and the user count is unchanged', dels.length === 2 && dels.every((s) => s === 200) && after === before, `HTTP ${dels.join(', ')}, users ${before} → ${after ?? 'unreadable'}`)
    console.log(results.join('\n'))
    console.log(`\n${fails} FAIL, ${results.filter((r) => r.startsWith('PASS')).length} PASS · screenshots in ${OUT}`)
    process.exitCode = fails ? 1 : 0
  }
}
// a Playwright timeout prints its call log, request headers included: a cookie line carries the throwaway account's
// session, so those lines are stripped before anything reaches a log (review, 2026-09-18)
main().catch((e) => { console.log(results.join('\n')); console.error('HARNESS ERROR', String(e && e.stack ? e.stack : e).replace(/^.*cookie.*$/gim, '  [a header line stripped]')); process.exitCode = 2 })
