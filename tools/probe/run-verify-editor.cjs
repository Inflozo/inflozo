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
    const violations = []
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await context.exposeBinding('__cspReport', ({ frame }, v) => violations.push({ url: frame.url(), ...v }))
    await context.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) => window.__cspReport({ directive: e.violatedDirective, blocked: e.blockedURI, sample: e.sample, source: `${e.sourceFile}:${e.lineNumber}:${e.columnNumber}` }))
    })
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
    const tagNow = () => page.evaluate(() => {
      const t = document.querySelector('section[aria-label="Canvas"] [data-chrome="tag"]')
      if (!t) return null
      const c = getComputedStyle(t)
      return { text: t.textContent, x: t.getBoundingClientRect().left, y: t.getBoundingClientRect().top, size: c.fontSize, weight: c.fontWeight, family: c.fontFamily, color: c.color, bg: c.backgroundColor, padding: c.padding, radius: c.borderRadius, events: c.pointerEvents, visibility: c.visibility }
    })
    const rowsNow = () => page.evaluate(() => [...document.querySelectorAll('aside[aria-label="Layers"] div.overflow-y-auto > div')].map((r) => getComputedStyle(r).backgroundColor))
    const badgeNow = () => page.evaluate(() => {
      const b = [...document.querySelectorAll('section[aria-label="Canvas"] span')].find((s) => s.textContent.trim() === '✦ Pro')
      return b ? { ...b.getBoundingClientRect().toJSON(), tag: b.tagName, pressable: !!b.closest('button, a, [role="button"]'), visibility: getComputedStyle(b).visibility } : null
    })
    const marked = () => canvasFrame().evaluate(() => [...document.querySelectorAll('*')].filter((el) => [...el.attributes].some((a) => a.name.startsWith('data-inflozo-'))).length)
    const controlsAside = () => page.locator('#editor-controls')
    // R-120's outline boxes. The width is read as PAINTED PIXELS, never from computed style — computed style said 1.5px
    // of an outline Chromium painted at 1 (2026-09-17). A device-scale screenshot strip starts at the box's left edge,
    // three quarters down its visible height (below the name tag); each pixel's coral coverage is read off the green
    // channel against the section's own ground 7px inside, summed, and divided by the device pixel ratio. Decoded in a
    // page of its own, outside the CSP session, so the decoder cannot add a violation to it.
    const decoder = await browser.newPage()
    const boxNow = (which) => page.evaluate((w) => {
      const b = document.querySelector(`section[aria-label="Canvas"] [data-chrome="${w}"]`)
      if (!b) return null
      const r = b.getBoundingClientRect()
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, card: b.parentElement.getBoundingClientRect().toJSON(), shadow: getComputedStyle(b).boxShadow, events: getComputedStyle(b).pointerEvents, visibility: getComputedStyle(b).visibility, hidden: b.getAttribute('aria-hidden') }
    }, which)
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
      check(`step 10 — hover ${name}: the tag's top-left within 1px of the root's on screen (Floating UI through the scaled frame)`, tag && Math.abs(tag.x - r.x) <= 1 && Math.abs(tag.y - r.y) <= 1, `tag ${tag?.x},${tag?.y} · root ${r.x},${r.y}`)
      check(`step 10 — hover ${name}: its Layers row alone is washed`, rows[n] === WASH && rows.filter((b) => b === WASH).length === 1, rows.join(' | '))
      // for the owner's comparison with S4b
      if (id === 'a4/13') await page.screenshot({ path: `${OUT}/editor-hover-latest-post-1440x900.png` })
    }
    await page.mouse.move(120, 400) // over Layers, off the canvas
    await page.waitForTimeout(250)
    check('step 10 — leaving the canvas clears the mark, the hover box, the tag and the wash', (await marked()) === 0 && (await boxNow('hover')) === null && (await tagNow()) === null && !(await rowsNow()).includes(WASH))
    await canvasFrame().evaluate(() => document.scrollingElement.scrollTo(0, 0))

    // ── step 11 — select ──
    const hrefBefore = await canvasFrame().evaluate(() => location.href)
    await canvasFrame().locator('#canvas > *').nth(HEADER).getByRole('link', { name: 'Archive', exact: true }).first().click()
    await page.waitForTimeout(300)
    const header = await onScreen(HEADER)
    check('step 11 — a click on the header\'s Archive link selects Header — Rail, and the canvas does not navigate', header.selected && (await canvasFrame().evaluate(() => location.href)) === hrefBefore, `selected ${header.selected} · ${await canvasFrame().evaluate(() => location.href)}`)
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
    check('step 11 — scrolled 700px, the sticky header\'s selected box is still on its root\'s on-screen rect', stuck[2] === 'sticky' && Math.abs(stuck[0].y - stuck[0].card.top) < 1 && fits(stuck[1], stuck[0]), `${stuck[2]} · root ${JSON.stringify({ x: stuck[0].x, y: stuck[0].y, right: stuck[0].right, bottom: stuck[0].bottom })} · box ${JSON.stringify(stuck[1])}`)
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
    check('step 11 — R-119: on Free, selected Latest Post shows the Kit\'s "✦ Pro" span 8px inside its top-right on screen, not pressable', hero.selected && badge && badge.tag === 'SPAN' && !badge.pressable && badge.visibility === 'visible' && Math.abs(hero.right - badge.right - 8) <= 1 && Math.abs(badge.top - hero.y - 8) <= 1, `${JSON.stringify(badge)} · root right ${hero.right} top ${hero.y}`)
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
    check('step 12 — site-wide: Header — Rail · On scroll → Static stamps data-on-scroll="static"', (await attr(HEADER, 'data-on-scroll')) === 'static' && (await onScreen(HEADER)).selected)
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
    await clickOn(GRID)
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

    const session = violations.splice(0)
    check('step 5 — the scripted session — folds, /post, Back and steps 10–13\'s hover, select, edits, reset and Esc — records zero securitypolicyviolation events in either document', session.length === 0, JSON.stringify(session))
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
    check('step 8 — axe: zero violations with Three Up hovered (the name tag showing)', hoveredAxe.length === 0 && (await axePage.locator('section[aria-label="Canvas"] [data-chrome="tag"]').count()) === 1, hoveredAxe.join('; '))
    g = await gridAt()
    await axePage.mouse.click(g.x, g.y)
    await axePage.mouse.move(120, 400)
    await axePage.waitForTimeout(300)
    const selectedAxe = await axeRun()
    check('step 8 — axe: zero violations with Three Up selected (its panel mounted)', selectedAxe.length === 0 && (await axePage.locator('aside[aria-label="Section settings"]').count()) === 1, selectedAxe.join('; '))
    await axeContext.close()

    // ── step 14 — touch: a hold shows the hover, a tap selects ──
    const touchContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true })
    const touchPage = await touchContext.newPage()
    await touchPage.goto(await magic(emailA), { waitUntil: 'load' })
    await touchPage.goto(editorUrl(), { waitUntil: 'load' })
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
      const tag = document.querySelector('section[aria-label="Canvas"] [data-chrome="tag"]')
      return { hover: root.hasAttribute('data-inflozo-hover'), outline: !!document.querySelector('section[aria-label="Canvas"] [data-chrome="hover"]'), selected: root.hasAttribute('data-inflozo-selected'), tag: tag?.textContent ?? null, panel: document.querySelector('#editor-controls').getAttribute('aria-label') }
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
