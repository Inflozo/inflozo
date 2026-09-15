#!/usr/bin/env node
// Story 4.10's deployed walk of the pilots review page, against the DEPLOYED app and the live Supabase (R-82).
//
//   env $(grep -E '^SUPABASE_(URL|SECRET_KEY)=' tools/probe/.env | xargs) OUT_DIR=/tmp/x node tools/probe/run-verify-pilots.cjs
//
// Keys reach it through process.env only and it prints none. It signs a throwaway account in through the Auth Admin
// API (magic link → /auth/confirm), opens https://app.inflozo.com/pilots, and for EVERY pilot on the page — read off
// the page's own switcher, never listed here — at Light and Dark × Desktop, Tablet and Phone × each View as, switches
// the canvas chrome, screenshots the canvas into OUT_DIR for comparison by eye against the frames, and runs axe-core
// at WCAG 2.1 AA inside the canvas (a positive control first: an <img> with no alt must be reported). Then the
// owner's manual test rows that can be read back: the member arms, Show to, the feed pages and Latest Post's panel.
// The account is deleted in `finally`, with the user count read before and after. Copies run-verify-controls.cjs.
const { chromium } = require('/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright')
const AXE = '/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/axe-core@4.12.1/node_modules/axe-core/axe.min.js'
const APP = process.env.APP_URL || 'https://app.inflozo.com'
const SB = process.env.SUPABASE_URL.replace(/\/$/, '')
const SECRET = process.env.SUPABASE_SECRET_KEY
const OUT = process.env.OUT_DIR

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
  const browser = await chromium.launch()
  try {
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
    }
    await page.screenshot({ path: `${OUT}/pilots-review-1600.png` })
    await context.close()
  } finally {
    await browser.close()
    const del = await admin(`/admin/users/${userId}`, { method: 'DELETE', body: '{}' })
    const after = (await users()).length
    check('DELETE /auth/v1/admin/users/{id} and the count is unchanged', del.status === 200 && after === before, `HTTP ${del.status}, users ${before} → ${after}`)
    console.log(results.join('\n'))
    console.log(`\n${fails} FAIL, ${results.filter((r) => r.startsWith('PASS')).length} PASS`)
    process.exitCode = fails ? 1 : 0
  }
}
main().catch((e) => { console.log(results.join('\n')); console.error('HARNESS ERROR', e); process.exitCode = 2 })
