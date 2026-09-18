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
// press on its words is now the start of editing.
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
        header: { h: box(header)?.height, rule: css(header)?.borderBottomWidth, bg: css(header)?.backgroundColor },
        name: { text: name?.textContent, size: css(name)?.fontSize, weight: css(name)?.fontWeight, family: css(name)?.fontFamily },
        layers: { w: box(layers)?.width, rule: css(layers)?.borderRightWidth, bg: css(layers)?.backgroundColor, title: layers?.textContent },
        ground: css(canvas)?.backgroundColor,
        card: card && { left: box(card).left - box(canvas).left, right: box(canvas).right - box(card).right, top: box(card).top - box(canvas).top, bottom: box(canvas).bottom - box(card).bottom, width: box(card).width, radius: css(card).borderRadius, shadow: css(card).boxShadow },
        controls: { w: box(controls)?.width, rule: css(controls)?.borderLeftWidth, pad: css(controls)?.paddingTop, bg: css(controls)?.backgroundColor, label: pageLabel?.textContent, labelTop: box(pageLabel)?.top - box(controls)?.top, labelSize: css(pageLabel)?.fontSize, labelWeight: css(pageLabel)?.fontWeight, labelCase: css(pageLabel)?.textTransform },
        rows: [...(layers?.querySelectorAll('div.overflow-y-auto > div > span:last-child') ?? [])].map((s) => s.textContent),
        buttonsInLayers: layers?.querySelectorAll('button').length,
        windowScrolls: document.documentElement.scrollHeight > innerHeight,
      }
    })
    check('step 2 — one <main>, and none of the dashboard\'s sidebar, phone bar or drawer', shape.mains === 1 && shape.shellNav === 0 && shape.menuButton === 0, JSON.stringify({ mains: shape.mains, nav: shape.shellNav, menu: shape.menuButton }))
    check('step 2 — the bar: 48px with its 1px rule on paper, the back link to /', shape.header.h === 48 && shape.header.rule === '1px' && shape.header.bg === 'rgb(247, 245, 242)' && shape.back === '/', JSON.stringify(shape.header) + ` back=${shape.back}`)
    check('step 2 — the project name: 13px, 600, Inter', shape.name.text === 'Pilot sections' && shape.name.size === '13px' && shape.name.weight === '600' && /Inter/i.test(shape.name.family), JSON.stringify(shape.name))
    check('step 2 — Layers: 240px, right rule, paper, "THIS PAGE · HOME"', shape.layers.w === 240 && shape.layers.rule === '1px' && shape.layers.bg === 'rgb(247, 245, 242)' && /this page · home/i.test(shape.layers.title), JSON.stringify({ ...shape.layers, title: undefined }))
    check('step 2 — Layers lists the stack in canvas order, not interactive but its one fold', shape.rows.join(' | ') === stackOf('home').map(([, name]) => name).join(' | ') && shape.buttonsInLayers === 1, `${shape.rows.join(' | ')} · buttons ${shape.buttonsInLayers}`)
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
    const [{ pilot }, { sidebar, defaultContent }] = await Promise.all([
      import(require('node:url').pathToFileURL(path.join(REPO, 'apps/web/lib/pilots.ts')).href),
      import(require('node:url').pathToFileURL(path.join(REPO, 'packages/section-runtime/src/index.ts')).href),
    ])
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
    const rowsNow = () => page.evaluate(() => [...document.querySelectorAll('aside[aria-label="Layers"] div.overflow-y-auto > div')].map((r) => getComputedStyle(r).backgroundColor))
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

    // ── steps 16–25 — Story 5.3's inline editing, inside the CSP session ──
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
    check('step 19 — Link on a selection touching a link opens the panel filled with that link\'s own record', filled.includes('Sign up'), JSON.stringify(filled))
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
    const lockedTitle = await canvasFrame().evaluate((n) => {
      const el = document.querySelectorAll('#canvas > *')[n].querySelector('.a4-13__title')
      return { editable: el.isContentEditable, editables: document.querySelectorAll('[contenteditable]').length }
    }, HERO)
    check('step 23 — a click on the card\'s post title shows P0-1\'s pill naming the field, in a chrome host, and nothing becomes editable', pill && pill.text === 'Post title — set in Ghost' && !pill.pressable && pill.events === 'none' && !lockedTitle.editable && lockedTitle.editables === 0, `${JSON.stringify(pill)} · ${JSON.stringify(lockedTitle)}`)
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
    await caretInto(HERO, '.a4-13__action--primary')
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

    const session = violations.splice(0)
    check('step 5 — the scripted session — folds, /post, Back, steps 10–13\'s and 15\'s hover, select, edits, reset, Esc and scrolling, and steps 16–26\'s typing, marks, links, paste, line breaks, a button\'s label, the lock pill, the scrolling toolbar and the panel\'s own field — records zero securitypolicyviolation events in either document', session.length === 0, JSON.stringify(session))
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
    await page.waitForTimeout(300)
    const recorded = violations.splice(0)
    check('step 5 — control: the recorder sees those two eval refusals, so its zero above is a result', recorded.filter((v) => /script-src/.test(v.directive) && /eval/.test(v.blocked)).length >= 2, JSON.stringify(recorded))

    // ── step 6 — the scheme ──
    for (const key of ['post', 'page', 'tag', 'author', 'error']) {
      const r = await context.request.get(editorUrl(key), { maxRedirects: 0 })
      check(`step 6 — /${key} answers 200`, r.status() === 200, `HTTP ${r.status()}`)
    }
    const home = await context.request.get(editorUrl('home'), { maxRedirects: 0 })
    // `endsWith`: the app's redirects are written for the app host, so on localhost the location has no /app prefix
    check('step 6 — /home answers 308 to /projects/<id>', home.status() === 308 && new URL(home.headers().location, APP).pathname.endsWith(`/projects/${P}`), `HTTP ${home.status()} → ${home.headers().location}`)
    for (const key of ['index', 'private', 'paywall', 'cards', 'custom-x', 'nonsense']) {
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
    await page.goto(editorUrl('post'), { waitUntil: 'load' })
    await painted('post')
    await page.goBack({ waitUntil: 'load' })
    await painted('home')
    const backHome = { url: page.url(), rows: await page.locator('aside[aria-label="Layers"] div.overflow-y-auto > div > span:last-child').allInnerTexts() }
    check('step 6 — Back from /post lands on /projects/<id> showing Home\'s sections', backHome.url === editorUrl() && backHome.rows.length === stackOf('home').length, JSON.stringify(backHome))
    await page.goBack({ waitUntil: 'load' })
    check('step 6 — Back again lands on Projects', page.url() === projectsUrl, page.url())

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
main().catch((e) => { console.log(results.join('\n')); console.error('HARNESS ERROR', e); process.exitCode = 2 })
