#!/usr/bin/env node
// Story 4.10's deployed walk of the pilots review page, against the DEPLOYED app and the live Supabase (R-82).
//
//   env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs) OUT_DIR=/tmp/x node tools/probe/run-verify-pilots.cjs
//
// Keys reach it through process.env only and it prints none. It signs a throwaway account in through the Auth Admin
// API (magic link → /auth/confirm), opens https://app.inflozo.com/pilots, and for EVERY pilot on the page — read off
// the page's own switcher, never listed here — at Light and Dark × Desktop, Tablet and Phone × each View as, switches
// the canvas chrome, screenshots the canvas into OUT_DIR for comparison by eye against the frames, and runs axe-core
// at WCAG 2.1 AA inside the canvas (a positive control first: an <img> with no alt must be reported). Then the
// owner's manual test rows that can be read back: the member arms, Show to, the feed pages and Latest Post's panel.
// The account is deleted in `finally`, with the user count read before and after. Copies run-verify-controls.cjs.
// Story 4.10's Fix (2026-09-15) adds the owner's three panel rulings, read off every pilot's own design.json: R-113
// (the accordions in order, nothing pinned above them, every control in the group its role names), R-114 (pills for
// the segmented controls only, each word on one line with room to spare) and R-115 (Reset this design carries its
// icon, says so when there is nothing to reset, and asks first — axe inside the open confirm). It reads each pilot's
// design.json from this checkout and imports the pill rule's widths from packages/library, so run it with Node 24, on a
// clean tree, after CI has deployed HEAD — it refuses to start otherwise, asking Vercel which commit serves the app; the
// browser draws real scrollbars, because the panel's own bar narrows the pills.
// the repo's own pinned copies (Story 4.11 made them devDependencies), resolved from the root — no machine path
const { chromium } = require('@playwright/test')
const AXE = require.resolve('axe-core/axe.min.js')
const APP = process.env.APP_URL || 'https://app.inflozo.com'
for (const key of ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'VERCEL_TOKEN', 'VERCEL_TEAM_ID']) {
  if (!process.env[key]) { console.error(`${key} is not set — read it from tools/probe/.env into this command's environment`); process.exit(2) }
}
const SB = process.env.SUPABASE_URL.replace(/\/$/, '')
const SECRET = process.env.SUPABASE_SECRET_KEY
const OUT = process.env.OUT_DIR || require('node:fs').mkdtempSync(require('node:path').join(require('node:os').tmpdir(), 'pilots-'))

const results = []
let fails = 0
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; return ok }
const note = (name, detail) => results.push(`note  ${name} — ${detail}`)

const admin = async (path, init = {}) => {
  const r = await fetch(`${SB}/auth/v1${path}`, { ...init, headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', ...(init.headers || {}) } })
  const text = await r.text()
  let body = {}
  try { body = text ? JSON.parse(text) : {} } catch {}
  return { status: r.status, body }
}
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
  // the panel checks compare the deployed page with this checkout's designs and pill rule, so they must be one commit: a
  // clean tree, and HEAD the very commit Vercel serves the app from — a clean commit not yet deployed proves nothing
  const { execSync } = require('node:child_process')
  const repo = require('node:path').join(__dirname, '..', '..')
  const dirty = execSync('git status --porcelain -- packages apps', { cwd: repo, encoding: 'utf8' }).trim()
  if (dirty) throw new Error(`packages/ or apps/ has uncommitted changes, so this checkout is not what ${APP} serves:\n${dirty}`)
  const head = execSync('git rev-parse HEAD', { cwd: repo, encoding: 'utf8' }).trim()
  if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_TEAM_ID) throw new Error('VERCEL_TOKEN and VERCEL_TEAM_ID are needed to match the deployment to this checkout')
  const answer = await fetch(`https://api.vercel.com/v13/deployments/${new URL(APP).host}?teamId=${process.env.VERCEL_TEAM_ID}`, { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } })
  const served = await answer.json().catch(() => ({}))
  if (!answer.ok) throw new Error(`Vercel answered ${answer.status} for ${new URL(APP).host}: ${served.error?.message ?? 'no message'}${answer.status === 401 || answer.status === 403 ? ' — check VERCEL_TOKEN and VERCEL_TEAM_ID' : ''}`)
  if (served.meta?.githubCommitSha !== head) throw new Error(`${APP} serves ${served.id ?? 'an unreadable deployment'}, built from ${served.meta?.githubCommitSha ?? 'no recorded commit'}, and this checkout is ${head}: push, wait for CI's deploy, then run this`)
  note('deployment', `${served.id} ${served.readyState}, built from ${head.slice(0, 8)} — this checkout's HEAD`)
  const { UNIVERSALS, pillWidth } = await import(require('node:url').pathToFileURL(require('node:path').join(__dirname, '..', '..', 'packages', 'library', 'src', 'vocabulary.ts')).href)
  const all = await users()
  if (all === null) throw new Error('user list unreadable — no control for the cleanup')
  const stale = all.filter((u) => /^pilots-harness-\d+@inflozo\.com$/.test(u.email || ''))
  for (const u of stale) await admin(`/admin/users/${u.id}`, { method: 'DELETE', body: '{}' })
  if (stale.length) note('swept stale fixtures', String(stale.length))
  const before = (await users()).length
  note('users before', String(before))

  const email = `pilots-harness-${Date.now()}@inflozo.com`
  const created = await admin('/admin/users', { method: 'POST', body: JSON.stringify({ email, email_confirm: true }) })
  check('POST /auth/v1/admin/users', created.status === 200 && !!created.body.id, `HTTP ${created.status}`)
  const userId = created.body.id
  let browser = null
  try {
    browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] })
    const link = await admin('/admin/generate_link', { method: 'POST', body: JSON.stringify({ type: 'magiclink', email }) })
    check('POST /auth/v1/admin/generate_link (magiclink)', link.status === 200 && !!link.body.hashed_token, `HTTP ${link.status}`)
    // bypassCSP: axe is injected into the canvas document, which the app's CSP would otherwise refuse
    const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, bypassCSP: true })
    const page = await context.newPage()
    page.on('pageerror', (e) => note('pageerror', String(e)))
    await page.goto(`${APP}/auth/confirm?token_hash=${link.body.hashed_token}&type=magiclink`, { waitUntil: 'networkidle' })
    check('step 1 — sign in lands off the sign-in page', !page.url().includes('/sign-in'), page.url())

    await page.goto(`${APP}/pilots`, { waitUntil: 'networkidle' })
    const robots = await page.locator('meta[name="robots"]').getAttribute('content')
    check('the page is noindex', /noindex/.test(robots || ''), robots)
    const iframe = page.locator('iframe[data-pilot], iframe[src="pilots/frame"]').first()
    await page.waitForFunction(() => !!document.querySelector('iframe[data-pilot]')?.contentDocument?.querySelector('#canvas > *'), null, { timeout: 30000 })
    const frame = () => page.frames().find((f) => f.url().includes('/pilots/frame'))
    const radio = (group, name) => page.locator(`#${group} [role="radio"]`, { hasText: new RegExp(`^${name}$`) })
    const settle = async (want) => {
      await page.waitForFunction((id) => document.querySelector('iframe[data-pilot]')?.dataset.pilot === id, want, { timeout: 15000 })
      await page.waitForTimeout(250)
    }
    const canvasText = async () => frame().evaluate(() => document.getElementById('canvas').innerText)
    const canvasHtml = async () => frame().evaluate(() => document.getElementById('canvas').innerHTML)

    const pilotNames = await page.locator('#pilot [role="radio"]').allInnerTexts()
    check('the switcher lists the pilots, read off the design directory', pilotNames.length > 0, pilotNames.join(' · '))

    // axe's positive control, once: the scan must see a violation that is there
    await frame().addScriptTag({ path: AXE })
    const control = await frame().evaluate(async () => {
      const probe = document.createElement('img')
      probe.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
      document.getElementById('canvas').append(probe)
      const r = await window.axe.run(document.getElementById('canvas'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] })
      probe.remove()
      return r.violations.map((v) => v.id)
    })
    check('axe positive control — an <img> with no alt is reported', control.includes('image-alt'), control.join(','))

    for (const name of pilotNames) {
      await radio('pilot', name).click()
      const id = await iframe.getAttribute('data-pilot')
      await settle(id)
      for (const mode of ['Light', 'Dark']) {
        await radio('mode', mode).click()
        for (const width of ['Desktop', 'Tablet', 'Phone']) {
          await radio('width', width).click()
          for (const visitor of ['Signed out', 'Free', 'Paid']) {
            await radio('member', visitor).click()
            await page.waitForTimeout(200)
            const slug = `${id.replace('/', '-')}-${mode}-${width}-${visitor.replace(' ', '')}`.toLowerCase()
            await iframe.screenshot({ path: `${OUT}/${slug}.png` })
            await frame().addScriptTag({ path: AXE }).catch(() => {})
            const v = await frame().evaluate(async () => {
              const canvas = document.getElementById('canvas')
              if (canvas.children.length === 0) return []
              const r = await window.axe.run(canvas, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] })
              return r.violations.map((x) => `${x.id}(${x.nodes.length})`)
            })
            check(`${name} · ${mode} · ${width} · ${visitor} — axe finds zero violations inside the canvas`, v.length === 0, v.join(', '))
          }
        }
      }
      await radio('mode', 'Light').click()
      await radio('width', 'Desktop').click()
      await radio('member', 'Signed out').click()
    }

    // ── the rows that read back ──
    const at = async (name) => { await radio('pilot', name).click(); await settle(await iframe.getAttribute('data-pilot')); await page.waitForTimeout(250) }
    if (pilotNames.includes('Rail')) {
      await at('Rail')
      const out = await canvasText()
      check('step 2 — Rail signed out: Sign in and Subscribe', /Sign in/.test(out) && /Subscribe/.test(out), out.replace(/\s+/g, ' ').slice(0, 200))
      for (const v of ['Free', 'Paid']) {
        await radio('member', v).click(); await page.waitForTimeout(250)
        const t = await canvasText()
        check(`step 3 — Rail at ${v}: Account, and no Subscribe`, /Account/.test(t) && !/Subscribe/.test(t), t.replace(/\s+/g, ' ').slice(0, 200))
      }
      await radio('member', 'Signed out').click()
    }
    if (pilotNames.includes('Three Up')) {
      await at('Three Up')
      const want = { First: [false, true], Middle: [true, true], Last: [true, false] }
      for (const [feed, [newer, older]] of Object.entries(want)) {
        await radio('feed', feed).click(); await page.waitForTimeout(250)
        const t = await canvasText()
        check(`step 7 — Three Up · ${feed}: Newer ${newer}, Older ${older}`, /Newer posts/.test(t) === newer && /Older posts/.test(t) === older)
      }
      await radio('feed', 'Empty').click(); await page.waitForTimeout(250)
      check('step 7 — Three Up · Empty: "Nothing here yet"', /Nothing here yet/.test(await canvasText()))
      await radio('feed', 'First').click()
    }
    if (pilotNames.includes('Inline Row')) {
      await at('Inline Row')
      await radio('show-to', 'Paid members').click(); await page.waitForTimeout(250)
      check('step 10 — Inline Row: Show to Paid, viewed signed out, removes the section', (await canvasHtml()).trim() === '')
      await radio('show-to', 'Everyone').click()
    }
    if (pilotNames.includes('Latest Post')) {
      await at('Latest Post')
      const t = await canvasText()
      check('step 12 — Latest Post: the newest post in the card', /The night shift at the Port of Algeciras/.test(t), t.replace(/\s+/g, ' ').slice(0, 240))
      const panel = await page.locator('aside#section-controls').innerText()
      // a row labelled exactly "Show" is the Data group's Count; "Show tag" and "Show date" are the design's own controls
      check('step 13 — Latest Post: the panel offers no number of posts (no Data group, no Show row)', !/(^|\n)\s*Show\s*(\n|$)/.test(panel) && !/(^|\n)\s*Data\s*(\n|$)/.test(panel), panel.replace(/\s+/g, ' ').slice(0, 300))
      await radio('member', 'Signed out').click()
      await radio('show-to', 'Paid members').click(); await page.waitForTimeout(250)
      check('step 13 — Latest Post: Show to Paid, viewed signed out, removes the section', (await canvasHtml()).trim() === '')
      await radio('show-to', 'Everyone').click()
    }
    // ── R-113 · R-114 · R-115 — the panel, on every pilot, against its own declaration ──
    const fs = require('node:fs')
    const path = require('node:path')
    const designOf = (id) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'packages', 'library', 'designs', id, 'design.json'), 'utf8'))
    const ORDER = ['Section Settings', 'Content', 'Layout', 'Style', 'Data']
    const TITLE = { settings: 'Section Settings', content: 'Content', layout: 'Layout', style: 'Style' }
    const aside = page.locator('aside#section-controls')
    const openGroup = async (title) => {
      const head = aside.getByRole('button', { name: title, exact: true })
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click()
    }
    for (const name of pilotNames) {
      await at(name)
      const id = await iframe.getAttribute('data-pilot')
      const design = designOf(id)
      const heads = await aside.evaluate((a) => [...a.querySelectorAll('button[aria-expanded][aria-controls$="-body"]')].map((b) => b.textContent.trim()))
      check(`R-113 · ${name} — the accordions in the panel's order`, heads.length > 0 && heads.join(' · ') === ORDER.filter((t) => heads.includes(t)).join(' · ') && heads.every((t) => ORDER.includes(t)), heads.join(' · '))
      for (const t of heads) await openGroup(t)
      const placed = await aside.evaluate((a) => [...a.querySelectorAll('[id$="-label"]')].map((e) => {
        const region = e.closest('[role="region"]')
        return { label: e.textContent.trim(), group: region ? document.getElementById(region.getAttribute('aria-labelledby'))?.textContent.trim() : null }
      }))
      const misplaced = design.controlSchema.filter((c) => !placed.some((p) => p.label === c.label && p.group === TITLE[c.group])).map((c) => `${c.label} → ${TITLE[c.group]}`)
      check(`R-113 · ${name} — nothing pinned above the groups, and every control in the group its role names`, placed.every((p) => p.group !== null) && misplaced.length === 0, misplaced.join(', ') || `${design.controlSchema.length} controls placed`)
      // the page draws the engine's order, and each field and setting its own id: every title in an accordion — a
      // field's <label for> or -label, a setting's -label — read in document order, its kind from the panel's id
      // ("…-prop-…" or "…-control-…"); a picker's dialog or popover aside. The same reader runs first on a copy of the
      // panel with a duplicate id and a field moved below the settings, so each check has seen its fault
      const readPanel = (root) => ({
        ids: [...root.querySelectorAll('[id]')].map((e) => e.id),
        rows: [...root.querySelectorAll('[role="region"] [id$="-label"], [role="region"] label[for]')].filter((e) => !e.closest('dialog, [role="dialog"], [popover]')).flatMap((e) => {
          const kind = { prop: 'words', control: 'setting' }[/^[^-]+-(prop|control)-/.exec(e.id || e.getAttribute('for'))?.[1]]
          return kind === undefined ? [] : [{ text: e.textContent.trim(), kind, group: root.querySelector(`#${CSS.escape(e.closest('[role="region"]').getAttribute('aria-labelledby'))}`)?.textContent.trim() }]
        }),
      })
      const faults = (panel) => {
        const twice = [...new Set(panel.ids.filter((x, i) => panel.ids.indexOf(x) !== i))]
        const outOfOrder = Object.entries(TITLE).flatMap(([g, title]) => {
          const want = [...design.controlSchema.filter((c) => c.group === g).map((c) => c.label), ...UNIVERSALS.filter((u) => u.group === g).map((u) => u.label)]
          const got = panel.rows.filter((r) => r.group === title && r.kind === 'setting').map((r) => r.text)
          return got.join(' · ') === want.join(' · ') ? [] : [`${title} draws ${got.join(' · ') || 'nothing'}, declared ${want.join(' · ')}`]
        })
        const content = panel.rows.filter((r) => r.group === 'Content')
        const first = content.findIndex((r) => r.kind === 'setting')
        const below = first === -1 ? [] : content.slice(first).filter((r) => r.kind === 'words').map((r) => `"${r.text}" below a setting`)
        return { twice, order: [...outOfOrder, ...below] }
      }
      // each fault in its own copy, so one plant cannot make the other's check fire: a duplicate of the LAST id (no
      // header or row title a group lookup reads), and a field's label appended after Content's settings
      const plantedIds = faults(await aside.evaluate((a, src) => {
        const copy = a.cloneNode(true)
        const withId = [...copy.querySelectorAll('[id]')]
        withId[withId.length - 1].id = withId[withId.length - 2].id
        return (0, eval)(`(${src})`)(copy)
      }, readPanel.toString()))
      const plantedOrder = faults(await aside.evaluate((a, src) => {
        const copy = a.cloneNode(true)
        const content = [...copy.querySelectorAll('[role="region"]')].find((r) => copy.querySelector(`#${CSS.escape(r.getAttribute('aria-labelledby'))}`)?.textContent.trim() === 'Content')
        const word = content?.querySelector('label[for*="-prop-"], [id*="-prop-"][id$="-label"]')
        if (word) content.lastElementChild.append(word.cloneNode(true))
        return (0, eval)(`(${src})`)(copy)
      }, readPanel.toString()))
      const drawn = await aside.evaluate((a, src) => (0, eval)(`(${src})`)(a), readPanel.toString())
      const { twice, order } = faults(drawn)
      check(`R-113 · ${name} — every id in the panel is its own`, plantedIds.twice.length > 0 && drawn.ids.length > 0 && twice.length === 0, twice.join(', ') || `${drawn.ids.length} ids; the planted duplicate was seen`)
      const hasWords = drawn.rows.some((r) => r.group === 'Content' && r.kind === 'words') && drawn.rows.some((r) => r.group === 'Content' && r.kind === 'setting')
      check(`R-113 · ${name} — the engine's order on the page: words above settings in Content, each group's settings as declared, the universal controls at their group's foot`, drawn.rows.some((r) => r.kind === 'setting') && (!hasWords || plantedOrder.order.some((o) => o.endsWith('below a setting'))) && order.length === 0, order.join('; ') || `${drawn.rows.length} rows in order${hasWords ? '; the planted field below a setting was seen' : ''}`)
      const rows = await aside.evaluate((a) => [...a.querySelectorAll('[role="radiogroup"].rounded-pill')].map((g) => ({
        label: document.getElementById(g.getAttribute('aria-labelledby'))?.textContent.trim(),
        pills: [...g.querySelectorAll('[role="radio"]')].map((b) => {
          const r = document.createRange()
          r.selectNodeContents(b)
          return { text: b.textContent.trim(), width: r.getBoundingClientRect().width, lines: new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size, room: Math.round(((b.getBoundingClientRect().width - r.getBoundingClientRect().width) / 2) * 10) / 10, clipped: b.scrollWidth > b.clientWidth }
        }),
      })))
      const cramped = rows.flatMap((row) => row.pills.filter((p) => p.lines !== 1 || p.clipped || p.room < 2).map((p) => `${row.label}: "${p.text}" ${p.lines} line(s), ${p.room} px each side`))
      check(`R-114 · ${name} — every pill holds its words on one line with 2 px to spare, the panel's own scrollbar showing`, rows.length > 0 && cramped.length === 0, cramped.join('; ') || rows.map((r) => r.label).join(', '))
      // the rule's glyph table is a measurement of this panel's type: a font or size change shows here, not silently
      const drifted = rows.flatMap((row) => row.pills.filter((p) => Math.abs(p.width - pillWidth(p.text)) > 1).map((p) => `"${p.text}" drawn ${p.width.toFixed(1)} px, the rule counts ${pillWidth(p.text)}`))
      check(`R-114 · ${name} — the pill rule's widths match what the browser drew`, drifted.length === 0, drifted.join('; '))
      const pills = rows.map((r) => r.label)
      const wrongShape = design.controlSchema.filter((c) => (c.type === 'segmented') !== pills.includes(c.label)).map((c) => `${c.label} (${c.type})`)
      check(`R-114 · ${name} — pills are the design's segmented controls and nothing else of its own`, wrongShape.length === 0, wrongShape.join(', '))
    }
    if (pilotNames.includes('Three Up')) {
      await at('Three Up')
      const reset = aside.getByRole('button', { name: 'Reset this design' })
      // a CSS locator, not a role one: a closed <dialog> is hidden, and a role locator waits for it to show
      const ask = aside.locator('dialog')
      const perRow = async () => frame().evaluate(() => document.querySelector('#canvas > *').getAttribute('data-per-row'))
      check('R-115 — "Reset this design" carries its icon', (await reset.locator('svg').count()) === 1)
      // the status line under the button, watched: a second press must take the line away and put it back, or a screen
      // reader hears nothing the second time — a count of what is on the page cannot see that
      const status = reset.locator('xpath=following-sibling::*[@role="status"]')
      await status.evaluate((s) => { window.__said = 0; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.textContent.includes('Nothing to reset')) window.__said++ }).observe(s, { childList: true, subtree: true }) })
      await reset.click()
      await page.waitForTimeout(150) // the line is set on the next frame
      check('R-115 — with nothing changed it says so and asks nothing', !(await ask.evaluate((d) => d.open)) && (await status.innerText()).trim() === 'Nothing to reset: every setting is already this design\'s default.', (await status.innerText()).trim())
      await reset.click()
      await page.waitForTimeout(150)
      const said = await status.evaluate(() => window.__said)
      check('R-115 — a second press says it again: the line leaves and comes back, and shows once', said === 2 && (await aside.getByText('Nothing to reset').count()) === 1, `announced ${said} time(s)`)
      await openGroup('Layout')
      await aside.getByRole('radiogroup', { name: 'Per row' }).getByRole('radio', { name: 'Four' }).click()
      check('R-115 — a change clears that sentence', (await perRow()) === 'four' && (await aside.getByText('Nothing to reset').count()) === 0)
      await reset.click()
      const asked = await ask.evaluate((d) => ({ open: d.open, focus: document.activeElement?.textContent.trim(), says: d.textContent.replace(/\s+/g, ' ').trim() }))
      check('R-115 — it asks first, names the one change, answers the fear, and opens on Cancel', asked.open && asked.focus === 'Cancel' && asked.says.includes('Removes your 1 change — Per row — from this design. Your words and pictures stay.'), JSON.stringify(asked))
      await page.addScriptTag({ path: AXE })
      const inDialog = await page.evaluate(async () => (await window.axe.run(document.querySelector('dialog[open]'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] })).violations.map((v) => `${v.id}(${v.nodes.length})`))
      check('R-115 — axe finds zero violations inside the open confirm', inDialog.length === 0, inDialog.join(', '))
      await page.keyboard.press('Escape')
      check('R-115 — Escape closes it and changes nothing', !(await ask.evaluate((d) => d.open)) && (await perRow()) === 'four')
      await reset.click()
      await ask.getByRole('button', { name: 'Cancel' }).click()
      check('R-115 — Cancel closes it and changes nothing', !(await ask.evaluate((d) => d.open)) && (await perRow()) === 'four')
      await reset.click()
      await ask.getByRole('button', { name: 'Reset design' }).click()
      check('R-115 — "Reset design" puts Per row back and its own reset arrow goes', !(await ask.evaluate((d) => d.open)) && (await perRow()) === 'three' && (await aside.getByRole('button', { name: 'Reset Per row' }).count()) === 0)
    }
    await page.screenshot({ path: `${OUT}/pilots-review-1600.png` })
    await context.close()
  } finally {
    if (browser) await browser.close()
    const del = userId ? await admin(`/admin/users/${userId}`, { method: 'DELETE', body: '{}' }) : { status: 'not sent, no user was created' }
    const after = (await users()).length
    check('DELETE /auth/v1/admin/users/{id} and the count is unchanged', del.status === 200 && after === before, `HTTP ${del.status}, users ${before} → ${after}`)
    console.log(results.join('\n'))
    console.log(`\n${fails} FAIL, ${results.filter((r) => r.startsWith('PASS')).length} PASS`)
    process.exitCode = fails ? 1 : 0
  }
}
main().catch((e) => { console.log(results.join('\n')); console.error('HARNESS ERROR', e); process.exitCode = 2 })
