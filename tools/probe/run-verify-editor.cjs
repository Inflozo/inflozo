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
// Settings, hiding and then removing every page section, and a reload starting from the stored doc. Step 8's axe runs
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
    const [{ pilot, carriesMemberVisibility }, { sidebar, defaultContent, isSynthesizable, synthesize }, { CANVASES, canvasesOf, isMembership, templateKeyOf }] = await Promise.all([
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/pilots.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'packages/section-runtime/src/index.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/editor.ts')).href),
    ])

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
        card: card && { left: box(card).left - box(canvas).left, right: box(canvas).right - box(card).right, top: box(card).top - box(canvas).top, bottom: box(canvas).bottom - box(card).bottom, width: box(card).width, radius: css(card).borderRadius, shadow: css(card).boxShadow },
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
    check('step 2 — the page card: 24 from the top, 28 each side, flush at the bottom, 864 wide, 6px top radius, the page shadow', c && c.top === 24 && c.left === 28 && c.right === 28 && c.bottom === 0 && c.width === 864 && c.radius === '6px 6px 0px 0px' && /rgba\(28, 27, 26, 0\.1\) 0px 4px 16px/.test(c.shadow), JSON.stringify(c))
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
      foot: [...a.querySelectorAll('button')].filter((b) => !b.closest('dialog')).map((b) => b.textContent.trim()).filter(Boolean).pop(),
      chip: a.textContent.includes('4 / 18'),
      empty: a.textContent.includes('Nothing selected'),
    }))
    const railPanel = await panelOf()
    check('step 11 — "Section settings", headed HEADER — RAIL, R-113\'s groups for the design in order, Reset this design at the foot, no "4 / 18"', railPanel.label === 'Section settings' && railPanel.head === layerOf(HEADER) && railPanel.headCase === 'uppercase' && railPanel.groups.join(' · ') === groupsOf(homeStack[HEADER][0]).join(' · ') && railPanel.foot === 'Reset this design' && !railPanel.chip && !railPanel.empty && (await page.getByText('4 / 18').count()) === 0, JSON.stringify(railPanel))
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
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    await clickOn(HERO)
    check('step 11 — R-119 control: A set to pro_active through the service key, Latest Post selected shows no badge', (pro.status === 200 || pro.status === 204) && (await onScreen(HERO)).selected && (await badgeNow()) === null, `HTTP ${pro.status}`)
    const back = await call('/rest/v1', `/entitlements?user_id=eq.${ids[0]}`, { method: 'PATCH', body: JSON.stringify({ state: plan }) })
    if (back.status === 200 || back.status === 204) entitlementBack = null
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')

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

    await page.reload({ waitUntil: 'load' })
    await painted('home')
    check('step 12 — a reload shows the stored values', (await attr(GRID, 'data-per-row')) === 'three' && (await attr(HEADER, 'data-on-scroll')) === 'shrink' && !(await canvasFrame().evaluate((n) => document.querySelectorAll('#canvas > *')[n].textContent, HERO)).includes(typed))

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
    const scrollCase = async (label, n, pointerY) => {
      const r0 = await onScreen(n)
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
    await scrollCase('Three Up selected', GRID, 860)
    // (a) hover: nothing selected, the pointer held still on Three Up while the content moves under it
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await scrollCase('Three Up hovered, the pointer still', GRID, 860)
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
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
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
    await page.mouse.click(ghostWords.x, ghostWords.y)
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

    // the edits live in memory for the session: a reload starts from the stored docs again (saving is Story 5.8's)
    await page.reload({ waitUntil: 'load' })
    await painted('home')
    const reloadedWords = { title: await wordsOf(GRID, TITLE), heroSub: await markupOf(HERO, HERO_SUB), button: await wordsOf(NEWS, '.a22-1__button') }
    check('step 26 — a reload starts from the stored docs: this session\'s typing, marks and links are gone', !reloadedWords.title.includes(' and summer') && !/<(strong|em|u|a|br)\b/.test(reloadedWords.heroSub) && reloadedWords.button.trim() === 'Subscribe', JSON.stringify(reloadedWords))

    // ── step 27 — a press on NOTHING deselects, as Esc does (R-123 and its amendment, owner, 2026-09-18) ──
    // Three grounds in two documents: the editor's own around the page card, the empty space below the Layers rows, and
    // the canvas's below the last section. The Controls panel, a Layers row and the top bar are not grounds.
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
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
    await page.goto(editorUrl('custom-signup'), { waitUntil: 'load' })
    await painted('custom-signup')
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
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')

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
    check('step 30 — nothing is persisted before Story 5.8: the stored doc still holds every instance, unhidden', (await docNow())?.instances?.length === TEMPLATES.home.length && (await docNow())?.instances?.every((i) => i.hidden === undefined || i.hidden === false), JSON.stringify(await docNow()))
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
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')

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
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')

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
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
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

    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')

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

    // ── step 39 — a reload starts from the stored doc: nothing here was persisted (Story 5.8 saves) ──
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    check('step 39 — a reload brings every section back, unhidden and in its stored order and name', (await pageNames()).join(' | ') === stackOf('home').map(([, name]) => name).join(' | ') && (await rootCount()) === before30, (await pageNames()).join(' | '))

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
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')

    const session = violations.splice(0)
    check('step 5 — the scripted session — folds, /post, Back, steps 10–13\'s and 15\'s hover, select, edits, reset, Esc and scrolling, and Story 5.3\'s typing, marks, links, paste, line breaks, a button\'s label, the lock pill, the scrolling toolbar, the panel\'s own field and the press on nothing, and Story 5.5\'s switcher, its soft navigations and the whole round trip — records zero securitypolicyviolation events in either document', session.length === 0, JSON.stringify(session))
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
    const bad = await call('/rest/v1', '/project_templates', { method: 'POST', body: JSON.stringify({ project_id: P, user_id: ids[0], template_key: 'tag', doc: { schemaVersion: 1, instances: [{ instanceId: 'bad-1', layerName: 'Wrong canvas', designId: postOnly[0], content: {}, controls: {}, data: {}, darkOverrides: {} }] } }) })
    check('step 6b — a tag row placing a post-only design is written', bad.status === 201, `HTTP ${bad.status}`)
    await page.goto(editorUrl(), { waitUntil: 'load' })
    const loud = await page.locator('h1').first().innerText().catch(() => '')
    const canvases = await page.locator('section[aria-label="Canvas"]').count()
    check('step 6b — the editor shows the error boundary and no canvas, never a partly drawn one', /couldn.t show that/i.test(loud) && canvases === 0, `h1 ${JSON.stringify(loud)} · canvases ${canvases}`)
    const unbad = await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.tag`, { method: 'DELETE' })
    check('step 6b — the bad row is removed and Home paints again', unbad.status === 200 || unbad.status === 204, `HTTP ${unbad.status}`)
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')

    // ── step 7 — scroll ──
    await page.goto(editorUrl(), { waitUntil: 'load' })
    await painted('home')
    const box = await page.locator('section[aria-label="Canvas"]').boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(600)
    const scroll = { window: await page.evaluate(() => ({ scrollHeight: document.documentElement.scrollHeight, innerHeight, scrollY })), canvas: await canvasFrame().evaluate(() => document.scrollingElement.scrollTop) }
    check('step 7 — the window cannot scroll, and the wheel over the canvas scrolls the canvas document', scroll.window.scrollHeight === scroll.window.innerHeight && scroll.window.scrollY === 0 && scroll.canvas > 0, JSON.stringify(scroll))
    await context.close()

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
