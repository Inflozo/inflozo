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

    // The app's OWN modules, read from this checkout — every expectation below is derived from them and from the
    // seed's fixture, never restated here (standing rule 4). Read before step 2, because the top bar's shape is one
    // of them since Story 5.5.
    const [{ pilot, carriesMemberVisibility }, { sidebar, defaultContent, isSynthesizable, synthesize }, { CANVASES, canvasesOf, isMembership, templateKeyOf }, { UNIVERSALS }, DEVICE] = await Promise.all([
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/pilots.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'packages/section-runtime/src/index.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/editor.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'packages/library/src/index.ts')).href),
      // Story 5.7's device table, its fit and the chip's words — read from the app's own module, so a size, a word or
      // a device added later joins this walk without an edit here (standing rule 4)
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/device.ts')).href),
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
    const page = await context.newPage()
    page.on('pageerror', (e) => note('pageerror', String(e)))
    await page.goto(await magic(emailA), { waitUntil: 'load' })
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
      const pageLabel = controls?.querySelector('span')
      return {
        mains: document.querySelectorAll('main').length,
        shellNav: document.querySelectorAll('nav[aria-label="Sections"]').length,
        menuButton: document.querySelectorAll('button[aria-label="Menu"], dialog[aria-label="Menu"]').length,
        back: header?.querySelector('a[aria-label="Back to dashboard"]')?.getAttribute('href'),
        // Story 5.5 — D5a's centred group: the switcher ALONE. R-130 removed the marker chip, so this must now be
        // false on EVERY canvas, untouched ones included — step 42 asserts that where it used to read two markers.
        switcher: header?.querySelector('#editor-template')?.textContent,
        switcherBox: box(header?.querySelector('#editor-template')),
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
    // D5a (:37-39): the switcher is CENTRED in the bar, and Home is designed on this project, so no marker chip
    check('step 2 — D5b\'s switcher reads "Template · Home", centred in the bar, and the bar carries no marker chip at all (R-130)', shape.switcher === `Template${CANVASES.home.label}` && !!shape.switcherBox && !!shape.headerBox && Math.abs((shape.switcherBox.left + shape.switcherBox.right) / 2 - (shape.headerBox.left + shape.headerBox.right) / 2) < 2 && shape.switcherBox.height === 32 && shape.marker === false, JSON.stringify({ switcher: shape.switcher, box: shape.switcherBox, marker: shape.marker }))
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
    const roots = async () => canvasFrame().evaluate(() => [...document.querySelectorAll('#canvas > *')].map((e) => e.outerHTML))
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
      return f.evaluate(() => document.querySelector('#canvas > *')?.outerHTML)
    }
    for (const [key, designs] of ['home', 'post'].map((k) => [k, stackOf(k).map(([id]) => id)])) {
      check(`step 4 — ${key}: one root per section, in stack order`, editorRoots[key].length === designs.length, `${editorRoots[key].length} roots`)
      for (const [n, id] of designs.entries()) {
        // /pilots draws each design at its first compileTarget; a1/1 → default.hbs, the others' first is this canvas
        const want = await pilotsRoot(id)
        check(`step 4 — ${key} · ${id} (${designName(id)}): outerHTML equals /pilots' at Desktop · Light · Signed out · Everyone · First`, !!want && editorRoots[key][n] === want, diff(editorRoots[key][n] ?? '', want ?? ''))
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
    const MODE_SCOPED = UNIVERSALS.filter((u) => u.darkOverride === true).map((u) => u.name)
    const homeStack = stackOf('home')
    const nth = (id) => homeStack.findIndex(([d]) => d === id)
    const [HEADER, HERO, GRID] = [nth(TEMPLATES.site[0][0]), nth('a4/13'), nth('a17/1')]
    const layerOf = (n) => homeStack[n][1]
    const groupsOf = (id) => {
      const entry = pilot(id)
      return sidebar(entry, { content: defaultContent(entry.contentSchema), controls: {}, data: {}, darkOverrides: {} }).groups.map((g) => g.label)
    }
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
      return { left: fr.left + r.left * s, top: fr.top + r.top * s, right: fr.left + r.right * s, bottom: fr.top + r.bottom * s, card: f.parentElement.getBoundingClientRect().toJSON(), host: el.getRootNode().host.getAttribute('data-inflozo-chrome'), text: el.textContent, tag: el.tagName, pressable: !!el.closest('button, a, [role="button"]'), size: c.fontSize, weight: c.fontWeight, family: c.fontFamily, color: c.color, bg: c.backgroundColor, padding: c.padding, radius: c.borderRadius, events: c.pointerEvents, visibility: c.visibility, shadow: c.boxShadow, hidden: el.getAttribute('aria-hidden'), faces: [...doc.fonts].filter((f) => f.family.replace(/^"|"$/g, '').startsWith('inflozo-chrome ')).map((f) => `${f.family.replace(/^"|"$/g, '')}: ${f.status}`) }
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
      head: a.querySelector('span')?.textContent,
      headCase: a.querySelector('span') && getComputedStyle(a.querySelector('span')).textTransform,
      groups: [...a.querySelectorAll('button[aria-expanded][aria-controls$="-body"]')].map((b) => b.textContent.trim()),
      // the panel's foot is TWO controls since R-133 (Story 5.6): "Reset this design", then "Clear dark overrides"
      // directly under it, in the same shape — so the last two are read in order rather than only the last
      foot: [...a.querySelectorAll('button')].filter((b) => !b.closest('dialog')).map((b) => b.textContent.trim()).filter(Boolean).slice(-2).join(' · '),
      chip: a.textContent.includes('4 / 18'),
      empty: a.textContent.includes('Nothing selected'),
    }))
    const railPanel = await panelOf()
    check('step 11 — "Section settings", headed HEADER — RAIL, R-113\'s groups for the design in order, Reset this design and R-133\'s Clear dark overrides at the foot in that order, no "4 / 18"', railPanel.label === 'Section settings' && railPanel.head === layerOf(HEADER) && railPanel.headCase === 'uppercase' && railPanel.groups.join(' · ') === groupsOf(homeStack[HEADER][0]).join(' · ') && railPanel.foot === 'Reset this design · Clear dark overrides' && !railPanel.chip && !railPanel.empty && (await page.getByText('4 / 18').count()) === 0, JSON.stringify(railPanel))
    await clickOn(GRID)
    const moved = [await onScreen(HEADER), await onScreen(GRID), await panelOf()]
    check('step 11 — clicking Three Up moves the selection and the panel', !moved[0].selected && moved[1].selected && moved[2].head === layerOf(GRID) && moved[2].groups.join(' · ') === groupsOf(homeStack[GRID][0]).join(' · '), JSON.stringify(moved[2]))
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
    check('step 26 — a field that declares no token has no token row', (await controlsAside().getByText('TOKENS THIS FIELD ACCEPTS').count()) === 0)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
    // Esc in the panel's field ends its session and hands focus back to the panel, and the section stays selected — the
    // controller's `keep` branch, the one path where Esc blurs a field (review, 2026-09-18)
    const panelEsc = await page.evaluate(() => ({ inField: document.activeElement?.getAttribute('role') === 'textbox', toolbar: document.querySelector('[role="toolbar"][aria-label="Text formatting"]') !== null }))
    check('step 26 — Escape in the panel\'s Text Area ends editing, leaves the field and keeps the section selected', !panelEsc.inField && !panelEsc.toolbar && (await onScreen(GRID)).selected, JSON.stringify(panelEsc))

    // the token row: P0-1's chips under the one pilot field that declares a token
    await clickOn(NEWS)
    await openGroup('Content')
    const proof = controlsAside().getByLabel('Social proof line', { exact: true })
    await proof.fill('Join readers')
    await proof.evaluate((el) => el.setSelectionRange(5, 5))
    const chips = await controlsAside().locator('button', { hasText: '{members}' }).allInnerTexts()
    await controlsAside().locator('button', { hasText: '{members}' }).first().click()
    await page.waitForTimeout(300)
    const proofNow = await proof.inputValue()
    check('step 26 — P0-1\'s token row names the field\'s tokens, and a chip inserts its token at the cursor', (await controlsAside().getByText('TOKENS THIS FIELD ACCEPTS').count()) === 1 && chips.join(' · ') === '{members}' && proofNow === 'Join {members}readers' && (await wordsOf(NEWS, '.a22-1__proof')) === proofNow, `${JSON.stringify(proofNow)} · chips ${JSON.stringify(chips)}`)

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
      const list = document.getElementById('editor-layers').lastElementChild
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
      const list = aside.lastElementChild
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
    check('step 30 — `Space` again brings it back, and the key never scrolled the panel', (await rootCount()) === before30 && (await page.evaluate(() => document.getElementById('editor-layers').lastElementChild.scrollTop)) === 0)

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
    check('step 37 — set to Paid members the section leaves the canvas, its Layers row stays, and the control says which visitor the canvas previews', (await rootCount()) === before30 - 1 && (await page.locator('#editor-layers [data-layer-row]').count()) === B7.rows.length && /not signed in/.test(gated), `roots ${await rootCount()} of ${before30}`)
    await controlsAside().getByRole('button', { name: 'Member visibility', exact: false }).first().click()
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Everyone', exact: true }).click()
    await page.waitForTimeout(500)
    check('step 37 — back to Everyone and the section returns', (await rootCount()) === before30)
    // the canvas previews a visitor who is not signed in, so "Logged out" IS drawn and the second hint stays away
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
          rows: [...pop.querySelectorAll('button[data-canvas]')].map((b) => ({
            key: b.dataset.canvas,
            name: b.querySelector('[data-name]').textContent,
            dot: dot(b),
            word: b.querySelector('[data-word]').textContent,
            checked: b.getAttribute('aria-current') === 'true',
            indent: getComputedStyle(b).paddingLeft,
          })),
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
    const wrong = d5b.rows.filter((r) => r.dot !== wantMark(r.key) || r.word !== WORD_OF[wantMark(r.key)])
    check('step 40 — R-130\'s three marks, each with its own word: a designed canvas is a FILLED dot and no word, an auto-generated one a hollow dot and "Auto-generated", and one that is never auto-built the circle-off glyph and "Empty" — never a shape without its word', wrong.length === 0, JSON.stringify({ wrong, rows: d5b.rows }))
    check('step 40 — the current canvas takes the check, and only it', d5b.rows.filter((r) => r.checked).length === 1 && d5b.rows.find((r) => r.checked)?.name === CANVASES.home.label, JSON.stringify(d5b.rows.filter((r) => r.checked)))
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
        // first of the right-hand cluster: nothing pressable sits to its right but the way into Theme settings
        after: [...el.parentElement.children].map((c) => c.id),
      }
    })
    check('step 46 — R-132: S4a\'s mode control is ONE 28×28 button with the export\'s 15px sun, right of centre, first of the right-hand cluster', sun !== null && sun.tag === 'BUTTON' && sun.width === 28 && sun.height === 28 && sun.glyph === 15 && sun.rays === 1 && sun.radius === '8px' && sun.rightOfCentre && sun.after[0] === 'editor-mode', JSON.stringify(sun))
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
    // Story 5.7: and the DEVICE TRACK is untouched by any of it — R-135 scopes dark and nothing else, so the track is
    // beside the sun rather than part of it, and a Light-only project previews on a phone exactly as every other does
    const litDevice = await page.evaluate(() => {
      const track = document.getElementById('editor-device')
      if (!track) return null
      const cluster = track.parentElement
      return {
        radios: [...track.querySelectorAll('[role="radio"]')].map((b) => b.getAttribute('aria-label')),
        checked: track.querySelector('[aria-checked="true"]')?.getAttribute('aria-label') ?? null,
        first: cluster?.firstElementChild === track,
      }
    })
    check('step 53 — on a Light-only project the DEVICE TRACK is unaffected: all three devices, Desktop in force, and it now LEADS the right-hand cluster the absent sun has left', litDevice !== null && litDevice.radios.join(' | ') === LABELS.join(' | ') && litDevice.checked === DEVICE.DESKTOP.label && litDevice.first === true, JSON.stringify(litDevice))
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
    const RESTING58 = JOURNAL58.labelOf({ kind: 'rest' })
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
      const dot = ind?.querySelector('span[aria-hidden]')
      const undo = document.getElementById('editor-undo')
      const redo = document.getElementById('editor-redo')
      const box = (el) => el && (({ width, height }) => ({ w: Math.round(width), h: Math.round(height) }))(el.getBoundingClientRect())
      const track = document.getElementById('editor-device')
      const history = document.getElementById('editor-history')
      return {
        label: ind?.textContent ?? null,
        dotColour: dot && getComputedStyle(dot).backgroundColor,
        // B6's note: "never a spinner". Nothing in the bar may animate or carry one.
        spinners: document.querySelectorAll('#editor-save-state [class*="animate"], #editor-save-state svg circle').length,
        afterTrack: track?.nextElementSibling?.id ?? null,
        gap: history && getComputedStyle(history).columnGap,
        undo: undo && { ...box(undo), radius: getComputedStyle(undo).borderTopLeftRadius, opacity: getComputedStyle(undo).opacity, disabled: undo.getAttribute('aria-disabled'), label: undo.getAttribute('aria-label'), tabbable: undo.tabIndex >= 0 },
        redo: redo && { ...box(redo), radius: getComputedStyle(redo).borderTopLeftRadius, opacity: getComputedStyle(redo).opacity, disabled: redo.getAttribute('aria-disabled'), label: redo.getAttribute('aria-label'), tabbable: redo.tabIndex >= 0 },
        panel: document.getElementById('editor-retrying') !== null,
      }
    })

    // ── step 61 — B6 at rest and S4a's pair, both drawn as the frames draw them ──
    const topBar = await topBarNow()
    check('step 61 — B6 at rest: the resting label, a GREY dot, no spinner (S4a draws "Saved" in green; B6 governs the words and the colours — the Code Map\'s recorded divergence)',
      topBar.label === RESTING58 && topBar.dotColour === 'rgb(201, 194, 184)' && topBar.spinners === 0, JSON.stringify(topBar))
    check('step 61 — S4a:41-43: two 28 × 28 buttons, 8px radius, 2px apart, immediately right of the device track',
      topBar.afterTrack === 'editor-history' && topBar.gap === '2px' && topBar.undo?.w === 28 && topBar.undo?.h === 28 && topBar.undo?.radius === '8px' && topBar.redo?.w === 28 && topBar.redo?.h === 28, JSON.stringify(topBar))
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
    check('step 62 — FR-D10: the indicator still reads the resting label — the write is off the interaction path and nothing claims the cloud', afterEdit58.label === RESTING58, afterEdit58.label)

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
    check('step 66 — ⌘S: the indicator goes Syncing → Synced (B6\'s two in-flight labels, and never a spinner)',
      labels58.includes(JOURNAL58.labelOf({ kind: 'syncing' })) && labels58.includes(JOURNAL58.labelOf({ kind: 'synced' })), JSON.stringify(labels58))
    // B6's "Fades to the resting label after a few seconds" is read LIVE rather than off the recording: it is a state
    // the indicator RESTS in, so asking what it says NOW is the stronger question and cannot be missed by a mutation
    // frame that batched two changes into one.
    const settled66 = await page.waitForFunction((resting) => document.querySelector('#editor-save-state [role="status"]')?.textContent === resting, RESTING58, { timeout: 15000 }).then(() => true, () => false)
    check('step 66 — and it fades to the resting label after a few seconds (B6\'s fourth transition)', settled66, await page.locator('#editor-save-state [role="status"]').innerText())
    check('step 66 — and it really wrote: projects.revision advanced by exactly one and the stored doc is the edited one',
      flushedRevision58 === beforeSave58 + 1 && Array.isArray(flushedDoc58?.instances), `revision ${beforeSave58} → ${flushedRevision58} · ${flushedDoc58?.instances?.length} instances`)

    // ── step 67 — FR-D9's whole promise: the work AND the history survive a reload ──
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
        label: document.querySelector('#editor-save-state [role="status"]')?.textContent ?? null,
        spinners: el.querySelectorAll('[class*="animate"]').length,
      }
    })
    check('step 69 — B6: the panel opens on Retrying, at the frame\'s own fill, radius and padding, with the countdown beside it',
      panel58 && panel58.fill === 'rgb(253, 236, 236)' && panel58.radius === '10px' && panel58.padding === '11px 12px' && /Retrying · \d+s/.test(panel58.label ?? ''), JSON.stringify(panel58))
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

    // Story 5.8's steps have been EDITING, and since this story an edit reaches the stored doc — so the seed is handed
    // back before steps 6, 6b and 7, which read it. Same `freshLoad` the rest of the walk uses.
    await freshLoad()

    const session = violations.splice(0)
    check('step 5 — the scripted session — folds, /post, Back, steps 10–13\'s and 15\'s hover, select, edits, reset, Esc and scrolling, and Story 5.3\'s typing, marks, links, paste, line breaks, a button\'s label, the lock pill, the scrolling toolbar, the panel\'s own field and the press on nothing, Story 5.5\'s switcher, its soft navigations and the whole round trip, Story 5.6\'s mode flips, dark authoring, resets, both clear entry points and the Theme settings screen, Story 5.7\'s device changes, folds, arrows and the 40-section fixture, and Story 5.8\'s edits, undos, redos, ⌘Z, ⇧⌘Z, ⌘S, its two reloads and its Retrying panel — records zero securitypolicyviolation events in either document', session.length === 0, JSON.stringify(session))
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
    // WAITED FOR, not slept at: each report is an `exposeBinding` round-trip, and a fixed 300ms lost both of them once
    // on a loaded machine (2026-09-18) — which under standing rule 2 would have voided step 5's zero for the whole run.
    // Waiting weakens nothing: the control still fails if the refusals never reach the recorder.
    const evals = () => violations.filter((v) => /script-src/.test(v.directive) && /eval/.test(v.blocked))
    for (let i = 0; i < 40 && evals().length < 2; i++) await page.waitForTimeout(100)
    const recorded = violations.splice(0)
    check('step 5 — control: the recorder sees those two eval refusals, so its zero above is a result', recorded.filter((v) => /script-src/.test(v.directive) && /eval/.test(v.blocked)).length >= 2, JSON.stringify(recorded))

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
      canvases: document.querySelectorAll('section[aria-label="Canvas"]').length,
    }))
    check('step 70 — FR-D10: with no IndexedDB the editor still opens and paints, and the indicator says exactly what is true — never the resting label',
      fallbackBar.canvases === 1 && fallbackBar.label === FALLBACK_LABEL58 && fallbackBar.label !== RESTING58, JSON.stringify(fallbackBar))
    check('step 70 — that context records zero CSP violations of its own', noIdbViolations.length === 0, JSON.stringify(noIdbViolations))
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
    const axe = await axePage.evaluate(async (tags) => (await window.axe.run(document, { runOnly: tags })).violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' · ')}`), WCAG)
    check('step 8 — axe-core finds zero WCAG 2.1 AA violations on the editor at 1440, the canvas included', axe.length === 0, axe.join('; '))
    // twice more (Story 5.2): with Three Up hovered, and with it selected
    const gridAt = async () => {
      const fr = await axePage.locator('section[aria-label="Canvas"] iframe').boundingBox()
      const f = axePage.frames().find((x) => x !== axePage.mainFrame())
      const r = await f.evaluate((n) => { const el = document.querySelectorAll('#canvas > *')[n]; el.scrollIntoView({ block: 'start' }); const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + 200 } }, stackOf('home').findIndex(([d]) => d === 'a17/1'))
      const s = fr.width / 1440
      return { x: fr.x + r.x * s, y: fr.y + r.y * s }
    }
    const axeRun = () => axePage.evaluate(async (tags) => (await window.axe.run(document, { runOnly: tags })).violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' · ')}`), WCAG)
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
    check('step 8 — axe: zero violations with Three Up selected (its panel mounted)', selectedAxe.length === 0 && (await axePage.locator('aside[aria-label="Section settings"]').count()) === 1, selectedAxe.join('; '))
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
    check('step 8 — axe: zero violations with S4b\'s pill showing and a Layers row\'s ⋯ menu open', layersAxe.length === 0 && (await axePage.locator('[data-section-pill]').count()) === 1 && (await axePage.locator('[popover]:popover-open').count()) === 1, layersAxe.join('; '))
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
