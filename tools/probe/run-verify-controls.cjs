#!/usr/bin/env node
// Story 4.5's owner's manual test, executed against the DEPLOYED app and the live Supabase (R-82).
//
//   env $(grep -E '^SUPABASE_(URL|SECRET_KEY)=' tools/probe/.env | xargs) OUT_DIR=/tmp/x node tools/probe/run-verify-controls.cjs
//
// Keys reach it through process.env only and it prints none. It signs a throwaway account in through the
// Auth Admin API (magic link → /auth/confirm), walks every step of the spec's `## Owner's manual test` on
// https://app.inflozo.com/controls at 1440×900 with REAL scrollbars, runs axe-core at WCAG 2.1 AA at 1440
// and 390 with a positive control, measures the control stamp and the content re-render under 4× CPU
// throttle, and deletes the account in `finally` with the user count read before and after. Written at
// Story 4.5's Review (2026-09-13); until then the checks lived in a scratch harness nobody could re-run.
// Story 5.3 adds step 19: the sample's Eyebrow (30) and Heading (40) refuse what is typed or pasted past their limits,
// each saying so under the field — and the Heading is now the rich Text Area the canvas shares.
// Story 4.10's Fix (2026-09-15) re-shaped the panel it walks: R-113 put every control in the accordion its role
// names with nothing pinned above them, and R-115 made "Reset this design" ask first — so a step whose control now
// sits in a closed accordion opens it, and step 16 answers the confirm.
const { chromium } = require('/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright')
const AXE = '/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/axe-core@4.12.1/node_modules/axe-core/axe.min.js'
const APP = 'https://app.inflozo.com'
const SB = process.env.SUPABASE_URL.replace(/\/$/, '')
const SECRET = process.env.SUPABASE_SECRET_KEY
// no OUT_DIR: a temp directory of its own, never a folder called `undefined` in whatever directory it was run from
const OUT = process.env.OUT_DIR || require('node:fs').mkdtempSync(require('node:path').join(require('node:os').tmpdir(), 'controls-'))

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
  // stale fixtures from a killed run would balance the count silently — sweep and say so
  const all = await users()
  if (all === null) throw new Error('user list unreadable — no control for the cleanup')
  const stale = all.filter((u) => /^controls-harness-\d+@inflozo\.com$/.test(u.email || ''))
  for (const u of stale) await admin(`/admin/users/${u.id}`, { method: 'DELETE', body: '{}' })
  if (stale.length) note('swept stale fixtures', String(stale.length))
  const before = (await users()).length
  note('users before', String(before))

  const email = `controls-harness-${Date.now()}@inflozo.com`
  const created = await admin('/admin/users', { method: 'POST', body: JSON.stringify({ email, email_confirm: true }) })
  check('POST /auth/v1/admin/users', created.status === 200 && !!created.body.id, `HTTP ${created.status}`)
  const userId = created.body.id
  const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] })
  try {
    const link = await admin('/admin/generate_link', { method: 'POST', body: JSON.stringify({ type: 'magiclink', email }) })
    check('POST /auth/v1/admin/generate_link (magiclink)', link.status === 200 && !!link.body.hashed_token, `HTTP ${link.status}`)
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    page.on('pageerror', (e) => note('pageerror', String(e)))
    await page.goto(`${APP}/auth/confirm?token_hash=${link.body.hashed_token}&type=magiclink`, { waitUntil: 'networkidle' })
    check('step 1 — sign in lands on the dashboard', /app\.inflozo\.com\/(dashboard)?$/.test(page.url()) || !page.url().includes('/sign-in'), page.url())

    await page.goto(`${APP}/controls`, { waitUntil: 'networkidle' })
    const iframe = page.locator('iframe[title="The controls sample section"]')
    const frame = () => page.frames().find((f) => f.url().includes('/controls/frame')) || null
    await page.waitForFunction(() => {
      const f = document.querySelector('iframe[title="The controls sample section"]')
      return !!f?.contentDocument?.querySelector('.cx__feature .cx__icon svg')
    }, null, { timeout: 30000 })
    const aside = page.locator('aside#section-controls')
    const canvas = async () => page.evaluate(() => {
      const d = document.querySelector('iframe[title="The controls sample section"]').contentDocument
      const root = d.querySelector('#canvas > section')
      const attrs = {}
      for (const a of root.attributes) if (a.name.startsWith('data-')) attrs[a.name] = a.value
      return {
        attrs,
        eyebrow: d.querySelector('.cx__eyebrow')?.textContent,
        title: d.querySelector('.cx__title')?.textContent,
        date: d.querySelector('.cx__date')?.textContent,
        imgSrc: d.querySelector('.cx__picture')?.getAttribute('src'),
        imgShown: !!d.querySelector('.cx__picture') && !d.querySelector('.cx__picture').hidden && getComputedStyle(d.querySelector('.cx__picture')).display !== 'none',
        features: [...d.querySelectorAll('.cx__feature')].map((li) => ({ title: li.querySelector('.cx__feature-title')?.textContent, icon: li.querySelector('.cx__icon')?.innerHTML || '' })),
        latest: d.querySelectorAll('.cx__links a')[0]?.textContent,
        archiveLink: (() => { const a = [...d.querySelectorAll('.cx__links a')].find((x) => x.textContent === 'Browse the archive') || null; return a ? { text: a.textContent, href: a.getAttribute('href'), shown: !a.hidden && getComputedStyle(a).display !== 'none' } : null })(),
        archiveHead: d.querySelector('.cx__archive-head')?.textContent,
        posts: [...d.querySelectorAll('.cx__post')].map((li) => li.textContent),
        scrollRange: d.documentElement.scrollHeight - d.documentElement.clientHeight,
        barWidth: d.defaultView.innerWidth - d.documentElement.clientWidth,
      }
    })

    // ── step 2
    let c = await canvas()
    check('step 2 — sample: eyebrow', c.eyebrow === 'This week at Orbit Weekly', c.eyebrow)
    check('step 2 — sample: heading', c.title === 'Seven links, checked by hand', c.title)
    check('step 2 — sample: picture shown', c.imgShown && !!c.imgSrc, String(c.imgSrc))
    check('step 2 — sample: three feature cards with icons', c.features.length === 3 && c.features.every((f) => f.icon.includes('<svg')), JSON.stringify(c.features.map((f) => f.title)))
    check('step 2 — sample: "Read the latest issue" and "From the archive" with three titles', c.latest === 'Read the latest issue' && c.archiveHead === 'From the archive' && c.posts.length === 3, JSON.stringify(c.posts))
    const geo = await page.evaluate(() => {
      const a = document.querySelector('aside#section-controls')
      const r = a.getBoundingClientRect(); const cs = getComputedStyle(a)
      const se = document.scrollingElement
      return { right: r.right, top: r.top, height: r.height, width: r.width, radius: cs.borderTopLeftRadius, borderLeft: cs.borderLeftWidth, vw: innerWidth, vh: innerHeight, pageRange: se.scrollHeight - se.clientHeight, overflowY: cs.overflowY, asideBar: a.offsetWidth - a.clientWidth, asideRange: a.scrollHeight - a.clientHeight }
    })
    check('step 2 — panel flush right, full height, square corners', geo.right === geo.vw && geo.top === 0 && geo.height === geo.vh && geo.radius === '0px' && geo.width === 280, JSON.stringify(geo))
    check('step 2 — the page itself never scrolls', geo.pageRange === 0, `window scroll range ${geo.pageRange}px`)
    check('step 2 — the canvas scrolls inside its own frame', c.scrollRange > 0 && c.barWidth === 8, `canvas range ${c.scrollRange}px, bar ${c.barWidth}px`)
    check('step 2 — the panel scrolls on its own with a slim bar', geo.overflowY === 'auto' && (geo.asideRange === 0 || geo.asideBar === 8), `panel range ${geo.asideRange}px, bar ${geo.asideBar}px`)
    const labels = await page.evaluate(() => [...document.querySelectorAll('aside#section-controls [id$="-label"]')].map((e) => ({ text: e.textContent.trim(), inside: !!e.closest('[role="region"]') })))
    const pinned = labels.filter((l) => !l.inside).map((l) => l.text)
    // the positive control: the sample's own settings are read, inside their accordions — a panel that drew nothing, or
    // whose closed bodies were not in the page, would pin nothing too
    const read = ['Columns', 'Alignment', 'Image position', 'Show icons', 'Card style'].filter((t) => labels.some((l) => l.inside && l.text === t))
    check('step 2 — nothing pinned above the groups: every control sits inside an accordion (R-113)', pinned.length === 0 && read.length === 5, `${JSON.stringify(pinned)} pinned; ${read.length} of 5 sample settings read inside their accordions`)
    const heads = await page.evaluate(() => [...document.querySelectorAll('aside#section-controls button[aria-expanded]')].filter((b) => b.getAttribute('aria-controls')?.endsWith('-body')).map((b) => b.textContent.trim()))
    check('step 2 — headings Content, Layout, Style, Data', JSON.stringify(heads) === JSON.stringify(['Content', 'Layout', 'Style', 'Data']), JSON.stringify(heads))
    check('step 2 — "Reset this design" at the foot', (await aside.locator('button', { hasText: 'Reset this design' }).count()) === 1)
    // R-115 with nothing changed, on the one page that starts with a stored dark override: the line says it stays
    await aside.getByRole('button', { name: 'Reset this design' }).click()
    await page.waitForTimeout(150)
    const quiet = (await aside.getByRole('button', { name: 'Reset this design' }).locator('xpath=following-sibling::*[@role="status"]').innerText()).trim()
    check('step 2 — Reset this design with nothing changed asks nothing, and says the dark override stays (R-115)', !(await aside.locator('dialog').evaluate((d) => d.open)) && quiet === 'Nothing to reset: every setting is already this design\'s default. Dark overrides stay as they are.', JSON.stringify(quiet))
    const noUnits = async () => { const t = await aside.innerText(); const m = t.match(/\b\d+(\.\d+)?\s?(px|%)|#[0-9a-fA-F]{3,8}\b/); return m ? m[0] : null }
    check('step 2 — no pixel size, percentage or colour code in the panel', (await noUnits()) === null, String(await noUnits()))
    const name = await aside.locator('span.uppercase').first().textContent()
    check('step 2 — the sample\'s name at the panel top beside the panel button', name === 'Controls sample — a feature row' && (await page.getByRole('button', { name: 'Collapse controls' }).isVisible()), name)

    /** Open an accordion by its title, and leave an open one open. */
    const openGroup = async (name) => {
      const head = page.getByRole('button', { name, exact: true })
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click()
    }

    // ── step 3
    await openGroup('Layout')
    await page.getByRole('button', { name: 'Fewer Columns' }).click()
    c = await canvas()
    check('step 3 — − beside Columns re-flows to two columns', c.attrs['data-columns'] === '2', `data-columns=${c.attrs['data-columns']}`)
    const reset = page.getByRole('button', { name: 'Reset Columns' })
    check('step 3 — a reset arrow appears beside Columns, hover says "Reset Columns"', (await reset.count()) === 1 && (await reset.getAttribute('title')) === 'Reset Columns' && (await reset.locator('svg').count()) === 1 && (await reset.innerText()).trim() === '')
    await reset.click()
    c = await canvas()
    check('step 3 — pressing it restores three columns and the arrow goes away', c.attrs['data-columns'] === '3' && (await reset.count()) === 0)

    // ── step 4
    await openGroup('Layout')
    await openGroup('Style')
    const align = page.getByRole('radiogroup', { name: 'Alignment' })
    await align.getByRole('radio', { name: 'Centre' }).click()
    c = await canvas()
    const rule = page.getByRole('radiogroup', { name: 'Rule under heading' })
    const reason = await aside.locator('p', { hasText: 'Not available while the heading is centred.' }).count()
    check('step 4 — Centre centres the heading and greys "Rule under heading" with its reason', c.attrs['data-align'] === 'center' && (await rule.getAttribute('aria-disabled')) === 'true' && reason === 1, `data-align=${c.attrs['data-align']} data-rule=${c.attrs['data-rule']}`)
    await rule.getByRole('radio', { name: 'Line' }).click({ force: true })
    const afterLine = (await canvas()).attrs['data-rule']
    check('step 4 — pressing Line does nothing while centred', afterLine === c.attrs['data-rule'], `data-rule stays ${afterLine}`)
    await align.getByRole('radio', { name: 'Left' }).click()
    c = await canvas()
    check('step 4 — back at Left the rule returns as it was', c.attrs['data-align'] === 'start' && c.attrs['data-rule'] === 'line' && (await rule.getAttribute('aria-disabled')) === null)

    // ── step 5
    await openGroup('Style')
    const styleRegion = page.getByRole('region', { name: 'Style' })
    const styleLabels = await styleRegion.evaluate((r) => [...r.querySelectorAll('[id$="-label"]')].map((e) => e.textContent.trim()))
    const absentIdx = await styleRegion.evaluate((r) => { const t = r.innerText; return { tint: t.indexOf('Card tint'), note: t.indexOf('There is no image focus here.'), bg: t.indexOf('Background role'), sp: t.indexOf('Vertical spacing'), div: t.indexOf('Top divider') } })
    check('step 5 — Style: Card tint, the grey note, then Background role, Vertical spacing, Top divider', absentIdx.tint < absentIdx.note && absentIdx.note < absentIdx.bg && absentIdx.bg < absentIdx.sp && absentIdx.sp < absentIdx.div, JSON.stringify(styleLabels))
    const bg = page.getByRole('radiogroup', { name: 'Background role' })
    const sw = await bg.locator('[role=radio]').evaluateAll((els) => els.map((e) => ({ n: e.getAttribute('aria-label') || e.textContent.trim(), grey: e.getAttribute('aria-disabled') })))
    check('step 5 — five swatches, Accent and Image grey', sw.length === 5 && sw.map((s) => s.n).join(',') === 'Base,Surface,Accent,Contrast,Image' && sw[2].grey === 'true' && sw[4].grey === 'true' && sw[0].grey === null, JSON.stringify(sw))
    check('step 5 — the plain-grounds sentence under them', (await styleRegion.locator('p', { hasText: 'This design is drawn for plain grounds, so accent and image are not offered.' }).count()) === 1)
    const moons = await styleRegion.evaluate((r) => { const rows = [...r.querySelectorAll('[id$="-label"]')]; return rows.map((l) => ({ label: l.textContent.trim(), moon: l.parentElement.textContent.includes('Dark override') })) })
    check('step 5 — moon "Dark override" beside Background role, none on Card tint', moons.some((m) => m.label === 'Background role' && m.moon) && moons.some((m) => m.label === 'Card tint' && !m.moon), JSON.stringify(moons))
    await bg.getByRole('radio', { name: 'Contrast' }).click()
    c = await canvas()
    check('step 5 — Contrast turns the section dark at once', c.attrs['data-bg'] === 'contrast')
    await bg.getByRole('radio', { name: 'Accent' }).click({ force: true })
    check('step 5 — Accent does nothing', (await canvas()).attrs['data-bg'] === 'contrast')

    // ── step 6
    await openGroup('Content')
    const content = page.getByRole('region', { name: 'Content' })
    const featuresList = page.getByRole('list', { name: 'Features' })
    check('step 6 — "2–6 · 3 used" beside Features', (await content.locator('span', { hasText: /^2–6 · 3 used$/ }).count()) === 1)
    const rowShape = await featuresList.locator('li[data-row]').evaluateAll((els) => els.map((li) => ({ handle: !!li.querySelector('[data-handle]'), name: li.querySelector('button[aria-expanded]')?.textContent.trim(), more: li.querySelector('button[aria-label^="More for"]')?.textContent.trim() })))
    check('step 6 — three rows each with a handle, a name and a "…" button', rowShape.length === 3 && rowShape.every((r) => r.handle && r.name && r.more === '…'), JSON.stringify(rowShape))
    const add = page.getByRole('button', { name: '+ Add feature' })
    let presses = 0
    while ((await add.getAttribute('aria-disabled')) !== 'true' && presses < 10) { await add.click(); presses++ }
    c = await canvas()
    check('step 6 — every press adds "A new feature" with a star, until six', presses === 3 && c.features.length === 6 && c.features.slice(3).every((f) => f.title === 'A new feature' && f.icon.includes('<svg')), `${presses} presses, ${c.features.length} cards`)
    check('step 6 — then the button greys with its sentence', (await add.getAttribute('aria-disabled')) === 'true' && (await content.locator('p', { hasText: 'The row holds 6 features. Remove one to add another.' }).count()) === 1)

    // ── step 7
    const remove = async (i) => {
      const li = featuresList.locator('li[data-row]').nth(i)
      await li.getByRole('button', { name: /^More for/ }).click()
      await page.getByRole('menuitem', { name: 'Remove' }).or(page.locator('[popover]:popover-open button', { hasText: 'Remove' })).first().click()
    }
    let seen = []
    while ((await canvas()).features.length > 2) { await remove((await canvas()).features.length - 1); seen.push((await canvas()).features.length) }
    check('step 7 — cards disappear one at a time down to two', JSON.stringify(seen) === JSON.stringify([5, 4, 3, 2]), JSON.stringify(seen))
    await remove(1)
    const floor = page.getByRole('status').locator('p', { hasText: 'A feature row needs at least 2 features.' })
    check('step 7 — at two, Remove still presses and the floor sentence appears', (await canvas()).features.length === 2 && (await floor.count()) === 1)
    await page.getByRole('button', { name: 'More Columns' }).click()
    check('step 7 — the sentence goes away after the next change', (await floor.count()) === 0)
    await page.getByRole('button', { name: 'Reset Columns' }).click()

    // ── step 8 (mouse drag, then keyboard only)
    const handles = featuresList.locator('[data-handle]')
    const before8 = (await canvas()).features.map((f) => f.title)
    await handles.first().scrollIntoViewIfNeeded(); await handles.last().scrollIntoViewIfNeeded()
    const last = await handles.last().boundingBox(); const first = await handles.first().boundingBox()
    await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2)
    await page.mouse.down()
    let mid = null
    for (let k = 1; k <= 8; k++) {
      await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2 + ((first.y - last.y - 10) * k) / 8)
      if (k === 6) mid = await featuresList.evaluate((ul) => { const slot = ul.querySelector('[data-drop-slot]'); const cs = slot && getComputedStyle(slot); return { slot: !!slot, dashed: cs?.borderTopStyle, hidden: slot?.getAttribute('aria-hidden'), slid: [...ul.querySelectorAll('li[data-row]')].map((li) => li.style.translate) } })
    }
    await page.mouse.up()
    const after8 = (await canvas()).features.map((f) => f.title)
    check('step 8 — while dragging, a dashed empty box shows where it lands and the other rows slide', mid?.slot && mid.dashed === 'dashed' && mid.hidden === 'true' && mid.slid.some((t) => t && t !== '0 0px'), JSON.stringify(mid))
    check('step 8 — the cards follow the new order on drop', JSON.stringify(after8) === JSON.stringify([before8[1], before8[0]]), `${before8} → ${after8}`)
    check('step 8 — no slot after the drop', (await featuresList.locator('[data-drop-slot]').count()) === 0)
    // keyboard only from here: Tab until a handle is focused
    await page.evaluate(() => document.activeElement?.blur())
    let tabs = 0, focusedHandle = null
    while (tabs < 120) { await page.keyboard.press('Tab'); tabs++; focusedHandle = await page.evaluate(() => document.activeElement?.getAttribute('data-handle')); if (focusedHandle !== null && focusedHandle !== undefined) break }
    check('step 8 — Tab reaches a row\'s handle', focusedHandle === '0', `${tabs} tabs, handle ${focusedHandle}`)
    await page.keyboard.press('Alt+ArrowDown')
    const after8k = (await canvas()).features.map((f) => f.title)
    const said = await featuresList.locator('xpath=..').locator('p[aria-live="polite"]').textContent()
    check('step 8 — Option+Down moves the row down one place, keyboard alone', JSON.stringify(after8k) === JSON.stringify(before8), `${after8} → ${after8k}`)
    check('step 8 — the move is announced (aria-live polite)', said.trim().length > 0, said.trim())
    check('step 8 — focus follows the moved row\'s handle', (await page.evaluate(() => document.activeElement?.getAttribute('data-handle'))) === '1')

    // ── step 9
    await featuresList.locator('li[data-row]').nth(0).locator('button[aria-expanded]').click()
    const item = content.locator('[role=group][id$="-item"]')
    const iconTrigger = item.locator('button[id$="-features-icon"]')
    await iconTrigger.click()
    const iconDialog = page.locator('[popover]:popover-open[role=dialog]')
    await iconDialog.locator('section[aria-label]').first().waitFor({ timeout: 30000 })
    const styleSeg = iconDialog.getByRole('radiogroup', { name: 'Style' })
    const styleOpts = await styleSeg.locator('[role=radio]').evaluateAll((els) => els.map((e) => `${e.textContent.trim()}:${e.getAttribute('aria-checked')}`))
    const catValue = await iconDialog.locator('button[id$="-category"]').textContent().catch(() => null)
    const cats = await iconDialog.locator('section[aria-label]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
    check('step 9 — Outline · Filled · Both set to Outline, and "All categories"', JSON.stringify(styleOpts) === JSON.stringify(['Outline:true', 'Filled:false', 'Both:false']) && (catValue || (await iconDialog.innerText())).includes('All categories'), JSON.stringify(styleOpts) + ' ' + String(catValue).trim())
    check('step 9 — icons under Tabler\'s categories: Animals, Arrows, Badges…', cats.slice(0, 3).join(',') === 'Animals,Arrows,Badges', cats.slice(0, 5).join(','))
    const scrolled = await iconDialog.evaluate((d) => { const s = [...d.querySelectorAll('div')].find((e) => e.scrollHeight > e.clientHeight + 10); if (!s) return null; s.scrollTop = 300; return { top: s.scrollTop, bar: s.offsetWidth - s.clientWidth, open: d.matches(':popover-open') } })
    check('step 9 — the grid scrolls a little and the picker stays open', scrolled && scrolled.top > 0 && scrolled.open, JSON.stringify(scrolled))
    await iconDialog.locator('input[id$="-q"]').fill('heart')
    const outlineHeart = iconDialog.locator('section[aria-label="Shapes"] button[title="heart"]')
    check('step 9 — searching shows the outline heart under Shapes', (await outlineHeart.count()) === 1 && (await iconDialog.locator('button[title="heart-filled"]').count()) === 0)
    await styleSeg.getByRole('radio', { name: 'Filled' }).click()
    check('step 9 — Filled shows the solid heart instead', (await iconDialog.locator('section[aria-label="Shapes"] button[title="heart-filled"]').count()) === 1 && (await iconDialog.locator('button[title="heart"]').count()) === 0)
    await styleSeg.getByRole('radio', { name: 'Both' }).click()
    check('step 9 — Both shows the two side by side', (await outlineHeart.count()) === 1 && (await iconDialog.locator('section[aria-label="Shapes"] button[title="heart-filled"]').count()) === 1)
    check('step 9 — the foot says "Tabler Icons · MIT"', (await iconDialog.innerText()).includes('Tabler Icons · MIT'))
    const iconBefore = (await canvas()).features[0].icon
    await iconDialog.locator('button[title="heart-filled"]').click()
    const iconAfter = (await canvas()).features[0].icon
    check('step 9 — pressing the solid heart puts it on that card', iconAfter !== iconBefore && iconAfter.includes('<svg') && (await iconDialog.count()) === 0, `${iconAfter.length} chars of svg`)

    // ── step 10
    const linkTrigger = content.locator('button[id$="-issue-link"]')
    await linkTrigger.click()
    const linkDialog = page.locator('[popover]:popover-open[role=dialog]')
    await linkDialog.locator('input[id$="-issue-link-q"]').fill('night')
    const posts = linkDialog.getByRole('group', { name: 'Posts' })
    const chips = await linkDialog.getByRole('group', { name: 'Portal actions' }).locator('button').evaluateAll((els) => els.map((e) => e.textContent.trim()))
    check('step 10 — a Posts group listing the night-shift post', (await posts.locator('button', { hasText: 'The night shift at the Port of Algeciras' }).count()) === 1)
    check('step 10 — the chips Sign up · Sign in · Account · Upgrade and Ghost search', JSON.stringify(chips) === JSON.stringify(['Sign up', 'Sign in', 'Account', 'Upgrade', 'Ghost search']), JSON.stringify(chips))
    await posts.locator('button', { hasText: 'The night shift at the Port of Algeciras' }).click()
    const relCount = await linkDialog.getByRole('group', { name: 'Rel' }).locator('button[aria-pressed]').count()
    check('step 10 — after picking: "Open in new tab" and three Rel switches', (await linkDialog.getByRole('checkbox', { name: 'Open in new tab' }).count()) === 1 && relCount === 3, `rel switches ${relCount}`)
    await linkDialog.getByRole('button', { name: 'Done' }).click()
    check('step 10 — the field then shows the post', (await linkTrigger.innerText()).includes('The night shift at the Port of Algeciras'))

    // ── step 11
    await linkTrigger.click()
    await linkDialog.getByRole('button', { name: 'Upgrade' }).click()
    const noOpts = (await linkDialog.getByRole('checkbox', { name: 'Open in new tab' }).count()) === 0 && (await linkDialog.getByRole('group', { name: 'Rel' }).count()) === 0
    await linkDialog.getByRole('button', { name: 'Done' }).click()
    const t11 = await linkTrigger.innerText()
    check('step 11 — "Portal · Upgrade" with account/plans, never "upgrade", no new-tab or Rel offered', t11.includes('Portal · Upgrade') && t11.includes('account/plans') && !/\bupgrade\b/.test(t11.replace('Portal · Upgrade', '')) && noOpts, t11.replace(/\n/g, ' | '))
    await linkTrigger.click()
    await linkDialog.getByRole('button', { name: 'Ghost search' }).click()
    await linkDialog.getByRole('button', { name: 'Done' }).click()
    check('step 11 — then it reads "Ghost search"', (await linkTrigger.innerText()).includes('Ghost search'))

    // ── step 12
    const archTrigger = content.locator('button[id$="-archive-link"]')
    check('step 12 — before: "Browse the archive" is not on the section', !(await canvas()).archiveLink?.shown)
    await archTrigger.click()
    await linkDialog.locator('input[id$="-archive-link-q"]').fill('https://orbit-weekly.example/archive/')
    await linkDialog.locator('button', { hasText: 'Link to https://orbit-weekly.example/archive/' }).click()
    await linkDialog.getByRole('button', { name: 'Done' }).click()
    c = await canvas()
    check('step 12 — "Browse the archive" appears once the link is set', c.archiveLink?.shown && c.archiveLink.text === 'Browse the archive' && c.archiveLink.href === 'https://orbit-weekly.example/archive/', JSON.stringify(c.archiveLink))
    await archTrigger.click()
    await linkDialog.getByRole('button', { name: 'Remove link' }).click()
    check('step 12 — and disappears when removed', !(await canvas()).archiveLink?.shown)

    // ── step 13
    const dateInput = content.locator('input[type=date]')
    await dateInput.fill('2026-11-01')
    c = await canvas()
    check('step 13 — the section shows 2026-11-01 and the time zone Etc/UTC under the field', c.date === '2026-11-01' && (await content.innerText()).includes('Site time zone: Etc/UTC'), c.date)

    // ── step 14
    const src14 = (await canvas()).imgSrc
    await page.getByRole('button', { name: 'Replace Picture' }).click()
    const pool = page.getByRole('dialog', { name: 'Choose the picture' })
    await pool.locator('button[aria-pressed="false"]').first().click()
    check('step 14 — the section\'s picture changes', (await canvas()).imgSrc !== src14, `${src14} → ${(await canvas()).imgSrc}`)

    // ── step 15
    const newest3 = (await canvas()).posts
    await openGroup('Data')
    const data = page.getByRole('region', { name: 'Data' })
    await page.getByRole('button', { name: 'More Show' }).click(); await page.getByRole('button', { name: 'More Show' }).click()
    const newest5 = (await canvas()).posts
    await page.getByRole('radiogroup', { name: 'Order' }).getByRole('radio', { name: 'Oldest' }).click()
    c = await canvas()
    const panelTitles = await data.locator('ul[aria-label^="Posts from Ghost"] li').evaluateAll((els) => els.map((e) => e.textContent.replace('…', '').trim()))
    const greyRows = await data.locator('ul[aria-label^="Posts from Ghost"] li').evaluateAll((els) => els.every((e) => getComputedStyle(e).cursor === 'not-allowed'))
    const addPost = page.getByRole('button', { name: '+ Add post' })
    check('step 15 — five titles, oldest first (a different list from newest)', c.posts.length === 5 && newest5.length === 5 && JSON.stringify(c.posts) !== JSON.stringify(newest5) && JSON.stringify(newest5.slice(0, 3)) === JSON.stringify(newest3), JSON.stringify(c.posts))
    check('step 15 — the panel lists the same five, grey, and "+ Add post" says they come from Ghost', JSON.stringify(panelTitles) === JSON.stringify(c.posts.map((p) => p.trim())) && greyRows && (await addPost.getAttribute('aria-disabled')) === 'true' && (await data.locator('p', { hasText: 'These come from Ghost, so there is nothing to add here.' }).count()) === 1)
    process.env.EXPECT_OLDEST && note('oldest titles', JSON.stringify(c.posts))
    // R-115 with no control changed since step 5's Contrast: the Data rows are changes, named in the panel's order
    const askEl = aside.locator('dialog')
    await page.getByRole('button', { name: 'Reset this design' }).click()
    const dataAsk = await askEl.evaluate((d) => ({ open: d.open, says: d.textContent.replace(/\s+/g, ' ').trim() }))
    check('step 15 — Reset this design counts the Data group: "Background role, Show and Order"', dataAsk.open && dataAsk.says.includes('Removes your 3 changes — Background role, Show and Order — from this design.'), JSON.stringify(dataAsk))
    await askEl.getByRole('button', { name: 'Cancel' }).click()
    check('step 15 — Cancel closes it and changes nothing', !(await askEl.evaluate((d) => d.open)) && JSON.stringify((await canvas()).posts) === JSON.stringify(c.posts))

    // ── step 16
    await page.getByRole('button', { name: 'Fewer Columns' }).click()
    await align.getByRole('radio', { name: 'Centre' }).click()
    const feat16 = (await canvas()).features
    await page.getByRole('button', { name: 'Reset this design' }).click()
    const asked = await askEl.evaluate((d) => ({ open: d.open, focus: document.activeElement?.textContent.trim(), says: d.textContent.replace(/\s+/g, ' ').trim() }))
    check('step 16 — Reset this design asks first, names every change in the panel\'s order, keeps the dark override, and opens on Cancel (R-115)', asked.open && asked.focus === 'Cancel' && asked.says.includes('Removes your 5 changes — Columns, Alignment, Background role, Show and Order — from this design. Your words, pictures and dark overrides stay.'), JSON.stringify(asked))
    await askEl.getByRole('button', { name: 'Reset design' }).click()
    c = await canvas()
    check('step 16 — Reset this design: three columns, Left, Base, three posts newest first', c.attrs['data-columns'] === '3' && c.attrs['data-align'] === 'start' && c.attrs['data-bg'] === 'base' && JSON.stringify(c.posts) === JSON.stringify(newest3), JSON.stringify(c.attrs))
    check('step 16 — the words and features you changed stay', JSON.stringify(c.features) === JSON.stringify(feat16) && c.date === '2026-11-01' && (await linkTrigger.innerText()).includes('Ghost search'), `${c.features.length} features kept`)
    check('step 16 — still no pixel size, percentage or colour code with every group open', (await noUnits()) === null, String(await noUnits()))

    // ── step 17
    const wBefore = (await iframe.boundingBox()).width
    await page.getByRole('button', { name: 'Collapse controls' }).click()
    const show = page.getByRole('button', { name: 'Show controls' })
    const g17 = await page.evaluate(() => { const se = document.scrollingElement; const f = document.querySelector('iframe[title="The controls sample section"]'); const d = f.contentDocument; return { pageRange: se.scrollHeight - se.clientHeight, asideVisible: !!document.querySelector('aside#section-controls')?.offsetParent, focus: document.activeElement?.getAttribute('aria-label'), canvasRange: d.documentElement.scrollHeight - d.documentElement.clientHeight, canvasBar: d.defaultView.innerWidth - d.documentElement.clientWidth, iframeW: f.getBoundingClientRect().width } })
    check('step 17 — the panel folds to a thin strip and the section widens', !g17.asideVisible && (await show.isVisible()) && g17.iframeW > wBefore, `iframe ${wBefore} → ${g17.iframeW}`)
    check('step 17 — no extra scrollbar appears (window range 0; canvas bar only with a range)', g17.pageRange === 0 && (g17.canvasRange > 0 ? g17.canvasBar === 8 : g17.canvasBar === 0), JSON.stringify(g17))
    check('step 17 — focus moves to Show controls', g17.focus === 'Show controls', String(g17.focus))
    await page.keyboard.press('Enter')
    const g17b = await page.evaluate(() => ({ asideVisible: !!document.querySelector('aside#section-controls')?.offsetParent, focus: document.activeElement?.getAttribute('aria-label'), pageRange: document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight, w: document.querySelector('iframe[title="The controls sample section"]').getBoundingClientRect().width }))
    check('step 17 — the strip\'s button brings the panel back as it was, focus on Collapse', g17b.asideVisible && g17b.focus === 'Collapse controls' && g17b.pageRange === 0 && g17b.w === wBefore, JSON.stringify(g17b))

    // ── step 19 (Story 5.3) — a prop's character limit stops typing and a paste, and the field says which
    // The sample's Eyebrow holds 30 and its Heading 40 (`packages/library/fixtures/controls/content.json`); nothing here
    // restates the numbers — they are read off the schema through the sentence the field prints.
    await openGroup('Content')
    const eyebrowField = page.getByLabel('Eyebrow', { exact: true })
    await eyebrowField.click()
    await page.keyboard.press('End')
    await page.keyboard.type('ABCDEFGHIJKLMNOP')
    await page.waitForTimeout(300)
    const eyebrowNow = await eyebrowField.inputValue()
    check('step 19 — Eyebrow refuses the characters past its limit and says so under the field', eyebrowNow.length === 30 && (await content.locator('p', { hasText: 'Eyebrow holds 30 characters.' }).count()) === 1 && (await canvas()).eyebrow.length === 30, `${eyebrowNow.length} characters · ${JSON.stringify(eyebrowNow)}`)
    // the Heading is a Text Area, and a paste past the limit arrives cut at it
    const headingField = page.getByLabel('Heading', { exact: true })
    await headingField.click()
    await page.keyboard.press('ControlOrMeta+a')
    await headingField.evaluate((el, words) => {
      const data = new DataTransfer()
      data.setData('text/plain', words)
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
    }, 'The quick brown fox jumps over the lazy dog and keeps running')
    await page.waitForTimeout(300)
    const headingNow = await headingField.innerText()
    check('step 19 — a 60-character paste into Heading arrives cut at its limit, with the same sentence under it', headingNow.length === 40 && (await content.locator('p', { hasText: 'Heading holds 40 characters.' }).count()) === 1 && (await canvas()).title === headingNow, `${headingNow.length} characters · ${JSON.stringify(headingNow)}`)

    // ── axe at 1440 and 390, WCAG 2.1 AA, with a positive control
    const axeRun = async () => {
      await page.addScriptTag({ path: AXE })
      return page.evaluate(async () => { const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }); return r.violations.map((v) => `${v.id} (${v.nodes.length})`) })
    }
    const v1440 = await axeRun()
    check('axe WCAG 2.1 AA at 1440 — zero violations', v1440.length === 0, JSON.stringify(v1440))
    const ctrl = await page.evaluate(async () => { const img = document.createElement('img'); img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; img.id = 'axe-ctrl'; document.body.append(img); const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }); img.remove(); return r.violations.map((v) => v.id) })
    check('axe positive control — an img without alt is reported as image-alt', ctrl.includes('image-alt'), JSON.stringify(ctrl))
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(300)
    const v390 = await axeRun()
    check('axe WCAG 2.1 AA at 390 — zero violations', v390.length === 0, JSON.stringify(v390))
    await page.setViewportSize({ width: 1440, height: 900 })

    // ── step 18
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForFunction(() => !!document.querySelector('iframe[title="The controls sample section"]')?.contentDocument?.querySelector('.cx__feature .cx__icon svg'), null, { timeout: 30000 })
    c = await canvas()
    check('step 18 — reload brings everything back to the sample', c.attrs['data-columns'] === '3' && c.features.length === 3 && c.date === '2026-10-01' && c.posts.length === 3 && c.features[0].title === 'Seven links', JSON.stringify({ columns: c.attrs['data-columns'], features: c.features.map((f) => f.title), date: c.date, posts: c.posts.length }))

    // ── 4x CPU throttle: (a) control attribute in the input's own frame, (b) content re-render under 100 ms
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    const a = await page.evaluate(() => {
      const root = document.querySelector('iframe[title="The controls sample section"]').contentDocument.querySelector('#canvas > section')
      const btn = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Fewer Columns')
      let framed = false
      requestAnimationFrame(() => { framed = true })
      const was = root.dataset.columns
      const t0 = performance.now()
      btn.click()
      const t1 = performance.now()
      return { was, now: root.dataset.columns, framedBefore: framed, handlerMs: +(t1 - t0).toFixed(2) }
    })
    check('throttle 4x (a) — a control change writes data-columns synchronously in the input\'s own task, before the next frame', a.was === '3' && a.now === '2' && a.framedBefore === false, JSON.stringify(a))
    const b = await page.evaluate(() => {
      const f = document.querySelector('iframe[title="The controls sample section"]')
      const input = [...document.querySelectorAll('input')].find((i) => i.id.endsWith('-eyebrow'))
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      const runs = []
      for (const v of ['Timing one', 'Timing two', 'Timing three']) {
        const t0 = performance.now()
        set.call(input, v); input.dispatchEvent(new Event('input', { bubbles: true }))
        const t1 = performance.now()
        runs.push({ handlerMs: +(t1 - t0).toFixed(1), renderMs: +f.dataset.renderMs, painted: f.contentDocument.querySelector('.cx__eyebrow').textContent === v })
      }
      return runs
    })
    check('throttle 4x (b) — a content re-render finishes inside 100 ms (renderCanvas, data-render-ms)', b.every((r) => r.painted && r.renderMs < 100 && r.handlerMs < 100), JSON.stringify(b))
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    await page.screenshot({ path: `${OUT}/controls-review-1440.png` })
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
