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
// Story 5.11 adds the RING WALK at the foot: this page carries the three fixture designs of
// `packages/library/fixtures/controls/` (R-158), which is the only ring in the repository, so carry / park /
// default, the wrap and FR-D13's item cap are proved HERE on production rather than asserted in a unit test.
// Story 5.12 adds the REMIX WALK after it (R-162): the dice, its confirm and `⇧R` are mounted here as well as in
// the editor, so this is where a re-roll is proved to really change a section's design on production — in the
// owner's own editor every ring is length 1 and the confirm says so instead.
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
    // R-136: the badge's words are its accessible name and its hover title, never printed in the row
    // VISIBLE words only: `textContent` includes the badge's SVG <title>, which is its accessible NAME and is
    // printed nowhere — reading it as print made a correct row fail. `run-verify-editor.cjs`'s `moonOn` already
    // reads it this way (Story 5.6's Review, R-136); this reader was left behind and is brought into line here.
    const moons = await styleRegion.evaluate((r) => [...r.querySelectorAll('[id$="-label"]')].map((l) => {
      const head = l.parentElement
      const shown = head.cloneNode(true)
      shown.querySelectorAll('.rounded-full').forEach((el) => el.remove())
      return { label: l.textContent.trim(), moon: head.querySelector('.rounded-full[title="Dark override"]') !== null, printed: shown.textContent.includes('Dark override') }
    }))
    check('step 5 — R-136: the moon named "Dark override" beside Background role and none on Card tint, with the words NOT printed in either row', moons.some((m) => m.label === 'Background role' && m.moon && !m.printed) && moons.some((m) => m.label === 'Card tint' && !m.moon), JSON.stringify(moons))
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
    // a pick abandoned with Escape is not there when the panel opens again: each opening starts from the stored record
    // with an empty search (review, 2026-09-18: the reset moved into `LinkPanel` when Story 5.3 split it out)
    await archTrigger.click()
    await linkDialog.getByRole('button', { name: 'Upgrade' }).click()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await archTrigger.click()
    await page.waitForTimeout(200)
    const reopened = { pressed: await linkDialog.locator('button[aria-pressed="true"]').count(), query: await linkDialog.locator('input[id$="-archive-link-q"]').inputValue(), shown: (await canvas()).archiveLink?.shown }
    check('step 12 — a pick abandoned with Escape is gone when the panel reopens, and nothing was committed', reopened.pressed === 0 && reopened.query === '' && !reopened.shown, JSON.stringify(reopened))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

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
    check('step 17 — the strip\'s button brings the panel back as it was, focus on Collapse', g17b.asideVisible && g17b.focus === 'Collapse controls' && g17b.pageRange === 0 && g17b.w === wBefore, `${JSON.stringify(g17b)} · wBefore ${wBefore} · at step 2 the page range was ${geo.pageRange} (DW-210)`)

    // ── step 19 (Story 5.3) — a prop's character limit stops typing and a paste, and the field says which
    // The limits are the sample's own (`packages/library/fixtures/controls/content.json`), read here rather than
    // restated (review, 2026-09-18: counts are derived)
    const LIMITS = require(require('node:path').join(__dirname, '../../packages/library/fixtures/controls/content.json')).props
    const [EYEBROW_MAX, HEADING_MAX] = [LIMITS.eyebrow.maxChars, LIMITS.heading.maxChars]
    await openGroup('Content')
    const eyebrowField = page.getByLabel('Eyebrow', { exact: true })
    await eyebrowField.click()
    await page.keyboard.press('End')
    await page.keyboard.type('ABCDEFGHIJKLMNOP')
    await page.waitForTimeout(300)
    const eyebrowNow = await eyebrowField.inputValue()
    check('step 19 — Eyebrow refuses the characters past its limit and says so under the field', eyebrowNow.length === EYEBROW_MAX && (await content.locator('p', { hasText: `Eyebrow holds ${EYEBROW_MAX} characters.` }).count()) === 1 && (await canvas()).eyebrow.length === EYEBROW_MAX, `${eyebrowNow.length} characters · ${JSON.stringify(eyebrowNow)}`)
    // the Heading is a Text Area: typed characters land where the caret is, which stays put — the field is not redrawn
    // under a caret while it is being typed in (review, 2026-09-18)
    const headingField = page.getByLabel('Heading', { exact: true })
    await headingField.click()
    await page.keyboard.press('End')
    await page.keyboard.type(' ab')
    await page.waitForTimeout(300)
    const typedInPanel = await headingField.evaluate((el) => {
      const sel = getSelection()
      const r = sel.getRangeAt(0).cloneRange()
      r.selectNodeContents(el)
      r.setEnd(sel.focusNode, sel.focusOffset)
      return { text: el.innerText, caret: r.toString().length, focused: document.activeElement === el }
    })
    check('step 19 — typing into the panel\'s Text Area lands at the caret and leaves it there', typedInPanel.text.endsWith(' ab') && typedInPanel.caret === typedInPanel.text.length && typedInPanel.focused && (await canvas()).title === typedInPanel.text, JSON.stringify(typedInPanel))
    // and a paste past the limit arrives cut at it
    await page.keyboard.press('ControlOrMeta+a')
    await headingField.evaluate((el, words) => {
      const data = new DataTransfer()
      data.setData('text/plain', words)
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
    }, 'The quick brown fox jumps over the lazy dog and keeps running')
    await page.waitForTimeout(300)
    const headingNow = await headingField.innerText()
    check('step 19 — a paste longer than Heading\'s limit arrives cut at it, with the same sentence under it', headingNow.length === HEADING_MAX && (await content.locator('p', { hasText: `Heading holds ${HEADING_MAX} characters.` }).count()) === 1 && (await canvas()).title === headingNow, `${headingNow.length} characters · ${JSON.stringify(headingNow)}`)
    // typed, not pasted: the rich field refuses the character at `beforeinput`, which the paste path never runs (review)
    await page.keyboard.press('End')
    await page.keyboard.type('XYZ')
    await page.waitForTimeout(300)
    const headingTyped = await headingField.innerText()
    check('step 19 — typing at Heading\'s limit is refused too, and the sentence stays', headingTyped === headingNow && (await content.locator('p', { hasText: `Heading holds ${HEADING_MAX} characters.` }).count()) === 1, `${headingTyped.length} characters · ${JSON.stringify(headingTyped)}`)

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

    /* ── STORY 5.11 — THE DESIGN RING, ON THE DEPLOYED PAGE (FR-D19, FR-D13, R-158, R-82) ───────────────────────
       `packages/library/designs/` holds ONE design per category, so the editor's own ring has nowhere to go and
       every assertion about what happens BETWEEN two designs would be vacuous there. This page carries the three
       fixture designs of `packages/library/fixtures/controls/`, which is the only ring in the repository — so
       this is where carry / park / default is proved on production, and the owner's own steps 6–12 are these. */
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForFunction(() => !!document.querySelector('iframe[title="The controls sample section"]')?.contentDocument?.querySelector('.cx__feature .cx__icon svg'), null, { timeout: 30000 })
    const rootClass = () => page.evaluate(() => document.querySelector('iframe[title="The controls sample section"]').contentDocument.querySelector('#canvas > section')?.className ?? null)
    /** The heading, WHICHEVER design is drawing it: `canvas()` reads `.cx__title`, which is design 1's own class,
     *  and the whole point of the walk below is that the words survive a design that names them differently. */
    const drawnHeading = () => page.evaluate(() => document.querySelector('iframe[title="The controls sample section"]').contentDocument.querySelector('[class$="__title"]')?.textContent ?? null)
    const drawn = (sel) => page.evaluate((s) => document.querySelector('iframe[title="The controls sample section"]').contentDocument.querySelectorAll(s).length, sel)
    const block511 = page.locator('#editor-design')
    const counter511 = page.locator('#editor-design-count')
    const tint511 = page.locator('#section-controls [id$="-control-tint"]')
    const tintValue511 = async () => ((await tint511.count()) === 0 ? null : (await tint511.locator('[role="radio"][aria-checked="true"]').innerText()).trim())

    check('ring — B1a: the Design block is at the head of the panel, the counter counts the real ring and does NOT repeat its own label (R-158, the owner\'s finding 2)',
      (await block511.count()) === 1 && (await counter511.innerText()).trim() === '1 of 3' && (await block511.locator('[data-design-tile]').count()) === 3,
      `${(await counter511.innerText()).trim()} · ${await block511.locator('[data-design-tile]').count()} tiles`)

    // the owner's step 7 — change two settings and type something recognisable
    await openGroup('Layout')
    await page.getByRole('radio', { name: 'Centre', exact: true }).first().click()
    await openGroup('Style')
    await page.getByRole('radio', { name: 'Strong', exact: true }).first().click()
    await openGroup('Content')
    const heading511 = page.getByLabel('Heading', { exact: true })
    await heading511.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('Ring words')
    await page.waitForTimeout(300)
    check('ring — the control: Alignment is Centre, Card tint is Strong and the heading is the typed words',
      (await canvas()).attrs['data-align'] === 'center' && (await canvas()).attrs['data-tint'] === 'strong' && (await canvas()).title === 'Ring words',
      JSON.stringify({ align: (await canvas()).attrs['data-align'], tint: (await canvas()).attrs['data-tint'], title: (await canvas()).title }))
    const tintWas511 = await tintValue511()

    // the owner's step 8 — ▶ swaps the design in place
    await page.locator('[data-design-step="1"]').click()
    await page.waitForTimeout(500)
    check('ring — ▶ changes the section IN PLACE: a different design renders, the counter counts on, and the position is announced politely (UX-DR12)',
      (await rootClass()) === 'cy' && (await counter511.innerText()).trim() === '2 of 3' && /^Design 2 of 3 — .+/.test((await page.locator('#controls-said').innerText()).trim()),
      `${await rootClass()} · ${(await counter511.innerText()).trim()} · ${(await page.locator('#controls-said').innerText()).trim()}`)
    check('ring — FR-D19: a setting BOTH designs declare carries, the typed words carry, and the setting only the OLD design had is gone from the panel AND off the section root',
      (await canvas()).attrs['data-align'] === 'center' && (await drawnHeading()) === 'Ring words' && (await tint511.count()) === 0
      // "parked, and at no point written to the section root": `stampControls` writes `resolveControls`' values,
      // and a control THIS design does not declare never resolves — so the attribute is gone, not merely stale
      && (await canvas()).attrs['data-tint'] === undefined,
      JSON.stringify({ align: (await canvas()).attrs['data-align'], title: await drawnHeading(), tintRows: await tint511.count(), tintAttr: (await canvas()).attrs['data-tint'] ?? null }))
    // the owner's step 10 — FR-D13's cap, and the items past it still there
    check('ring — FR-D13: the panel reads "3 items · 2 shown in this design" and the section draws two of the three',
      (await page.locator('#section-controls span', { hasText: /^3 items · 2 shown in this design$/ }).count()) === 1 && (await drawn('.cy__feature')) === 2,
      `${await drawn('.cy__feature')} drawn · ${await page.locator('#section-controls span', { hasText: /shown in this design/ }).count()} sentence(s)`)

    // the owner's step 9 — the long way round, and the parked value comes back exactly
    await page.locator('[data-design-step="1"]').click()
    await page.waitForTimeout(500)
    check('ring — ▶ again reaches the third design, which declares neither of the two the first one parked',
      (await rootClass()) === 'cz' && (await counter511.innerText()).trim() === '3 of 3' && (await tint511.count()) === 0, `${await rootClass()} · ${(await counter511.innerText()).trim()}`)
    await page.locator('[data-design-step="1"]').click()
    await page.waitForTimeout(500)
    check('ring — UX-DR5: ▶ at the end WRAPS to the first, and the parked setting comes back EXACTLY as it was left, even the long way round',
      (await rootClass()) === 'cx' && (await counter511.innerText()).trim() === '1 of 3' && (await tintValue511()) === tintWas511 && (await canvas()).attrs['data-tint'] === 'strong' && (await drawnHeading()) === 'Ring words',
      JSON.stringify({ root: await rootClass(), tint: await tintValue511(), was: tintWas511, attr: (await canvas()).attrs['data-tint'] }))
    // and ◀ is the same ring backwards
    await page.locator('[data-design-step="-1"]').click()
    await page.waitForTimeout(500)
    check('ring — ◀ wraps the other way, so neither arrow is ever a dead key', (await counter511.innerText()).trim() === '3 of 3', (await counter511.innerText()).trim())
    await page.locator('[data-design-step="1"]').click()
    await page.waitForTimeout(500)

    // THE OWNER'S TEST OF THIS PAGE (2026-09-20) took two of B1a's parts out. Both are asserted ABSENT here,
    // because a removal nobody checks comes back: the `Try a design` card (finding 3, amending R-159 — Shuffle
    // keeps one seat, the pill's) and the `Cycle designs` footer with its key chips (finding 4).
    check('ring — the block is the label, the counter, the strip and the name: no Try-a-design card and no key chips (the owner\'s findings 3 and 4)',
      (await page.locator('[data-try-design]').count()) === 0 && (await block511.locator('kbd').count()) === 0
      && !/Same words, new look|Cycle designs/.test(await block511.innerText()) && (await block511.locator('iframe').count()) === 3,
      `${await page.locator('[data-try-design]').count()} card · ${await block511.locator('kbd').count()} chips · ${await block511.locator('iframe').count()} previews`)

    // HIS FINDING 1 — `[` and `]` were advertised on this page and did nothing. They are bound here now, through
    // the editor's own `shortcutFor`, so this is the deployed proof of the key and of WCAG 2.1.4's guard on it.
    const keyFrom511 = (await counter511.innerText()).trim()
    await page.locator('#editor-design').click()
    await page.keyboard.press(']')
    await page.waitForTimeout(500)
    const keyNext511 = (await counter511.innerText()).trim()
    await page.keyboard.press('[')
    await page.waitForTimeout(500)
    check('ring — the owner\'s finding 1: `]` and `[` cycle the design on this page, and `[` comes back to where it started',
      keyNext511 !== keyFrom511 && (await counter511.innerText()).trim() === keyFrom511 && (await drawnHeading()) === 'Ring words',
      `${keyFrom511} → ${keyNext511} → ${(await counter511.innerText()).trim()}`)
    await openGroup('Content')
    await heading511.click()
    await page.keyboard.type('[]')
    await page.waitForTimeout(400)
    check('ring — WCAG 2.1.4: with the caret in the Heading field the same two keys type their characters and the design does not change',
      (await counter511.innerText()).trim() === keyFrom511 && /\[\]$/.test(await heading511.inputValue().catch(() => heading511.innerText())),
      `${(await counter511.innerText()).trim()} · ${await heading511.inputValue().catch(() => heading511.innerText())}`)

    // THE REVIEW OF 2026-09-20: an open picker OWNS `]`. The page had the caret half of WCAG 2.1.4's condition and
    // not the overlay half, so `]` swapped the design under an open picker — it goes through the editor's own
    // `singleKeyOwned` now, and this is the deployed proof. Focus rests on a picker BUTTON, not its search field, so
    // it is the overlay guard being exercised and not the caret one.
    await featuresList.locator('li[data-row]').nth(0).locator('button[aria-expanded="false"]').click().catch(() => {})
    await iconTrigger.click()
    const guardDialog511 = page.locator('[popover]:popover-open[role=dialog]')
    await guardDialog511.locator('section[aria-label]').first().waitFor({ timeout: 30000 })
    await guardDialog511.getByRole('radiogroup', { name: 'Style' }).getByRole('radio', { name: 'Filled' }).click()
    await page.keyboard.press(']')
    await page.waitForTimeout(400)
    check('ring — with a picker open `]` is the picker\'s: the design does not change and the picker stays up (the editor\'s overlay guard, shared through `singleKeyOwned`)',
      (await counter511.innerText()).trim() === keyFrom511 && (await guardDialog511.count()) === 1,
      `${(await counter511.innerText()).trim()} · popover open: ${await guardDialog511.count()}`)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // DW-209 ON THIS PAGE, proved rather than remembered: a wheel with the pointer RESTING ON THE PILL scrolls the
    // sample inside its frame. The window is made short first so the frame has a range to scroll at all — the
    // control is that range, read and asserted non-zero before the scroll is.
    await page.setViewportSize({ width: 1440, height: 480 })
    await page.waitForTimeout(500)
    const frameScroll511 = () => page.evaluate(() => { const s = document.querySelector('iframe[title="The controls sample section"]').contentDocument.scrollingElement; return { top: s.scrollTop, range: s.scrollHeight - s.clientHeight } })
    await page.evaluate(() => document.querySelector('iframe[title="The controls sample section"]').contentDocument.scrollingElement.scrollTo(0, 0))
    const pillBox511 = await page.locator('[data-section-pill]').boundingBox()
    if (pillBox511) {
      await page.mouse.move(pillBox511.x + pillBox511.width / 2, pillBox511.y + pillBox511.height / 2, { steps: 3 })
      await page.waitForTimeout(150)
      await page.mouse.wheel(0, 300)
      await page.waitForTimeout(400)
    }
    const wheeled511 = await frameScroll511()
    check('ring — DW-209: a wheel with the pointer on the section\'s pill scrolls the sample inside its frame — the pill forwards it (control: the frame had a range to scroll)',
      pillBox511 !== null && wheeled511.range > 0 && wheeled511.top > 0, JSON.stringify({ pill: pillBox511 !== null, ...wheeled511 }))
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForTimeout(400)

    // the owner's step 12 — Shuffle's ONE seat
    const pill511 = await page.evaluate(() => {
      const pill = document.querySelector('[data-section-pill]')
      return pill === null ? null : {
        count: pill.querySelector('[data-pill-count]')?.textContent ?? null,
        shuffle: pill.querySelector('[data-pill-shuffle]')?.getAttribute('aria-label') ?? null,
        titled: pill.querySelector('[data-pill-shuffle]')?.getAttribute('title') ?? null,
        words: (pill.querySelector('[data-pill-shuffle]')?.textContent ?? '').trim(),
      }
    })
    check('ring — Shuffle\'s ONE seat: the section\'s own pill carries the counter, the arrows and an ICON-ONLY Shuffle whose words are its name and its hover title',
      pill511 !== null && /^\d+ \/ 3$/.test(pill511.count ?? '') && /^Shuffle/.test(pill511.shuffle ?? '') && pill511.shuffle === pill511.titled && pill511.words === '',
      JSON.stringify(pill511))
    const wasShuffle511 = (await counter511.innerText()).trim()
    // the words as they stand NOW, not a literal: the WCAG step above deliberately typed `[]` into the Heading
    // and that character is still there — which is itself the point, so the carry is asserted against it
    const wordsShuffle511 = await drawnHeading()
    await page.locator('[data-pill-shuffle]').click()
    await page.waitForTimeout(500)
    check('ring — and it SHUFFLES: a different design of the same ring, carrying the words the same way (FR-D13)',
      (await counter511.innerText()).trim() !== wasShuffle511 && (await drawnHeading()) === wordsShuffle511 && /^Ring words/.test(wordsShuffle511 ?? ''),
      `${wasShuffle511} → ${(await counter511.innerText()).trim()} · ${JSON.stringify(wordsShuffle511)} → ${JSON.stringify(await drawnHeading())}`)
    await page.screenshot({ path: `${OUT}/controls-ring-1440.png` })

    /* ── STORY 5.12 — SITE REMIX'S DICE, ON THE DEPLOYED PAGE (FR-D17, R-162, R-163, R-82) ──────────────────────
       R-162 (owner, 2026-09-20): the dice is built in BOTH places, and this is the one where the owner — and this
       harness — can watch a section really change design, because `packages/library/designs/` holds one design per
       category and his own editor's confirm therefore says so honestly. His steps 7–9 are these.
       NO UNDO IS PROMISED HERE: the page stores nothing, so B8's "one undo, always available" line is absent
       rather than printed as a lie — the ring's own arrows are the way back. */
    const dice512 = await page.evaluate(() => {
      const b = document.getElementById('editor-remix')
      return b === null ? null : {
        label: b.getAttribute('aria-label'),
        title: b.getAttribute('title'),
        words: (b.textContent ?? '').trim(),
        faces: b.querySelectorAll('.remix-dice__face').length,
        pip: getComputedStyle(b.querySelector('.remix-dice__face--1')).backgroundImage,
      }
    })
    check('remix — R-162 / R-163: the dice is beside this page\'s heading, icon-only with its words as its accessible name and its hover title, and it is a real six-faced cube with coral pips',
      dice512 !== null && dice512.label === 'Site Remix — ⇧R' && dice512.title === dice512.label && dice512.words === '' &&
      dice512.faces === 6 && /rgb\(255, 89, 65\)/.test(dice512.pip ?? ''), JSON.stringify(dice512 && { ...dice512, pip: undefined }))

    const wasRemix512 = (await counter511.innerText()).trim()
    const wordsRemix512 = await drawnHeading()
    await page.locator('#editor-remix').click()
    await page.waitForTimeout(1600)
    const ask512 = await page.evaluate(() => {
      const d = document.querySelector('dialog[data-remix-confirm][open]')
      return d === null ? null : {
        onCancel: document.activeElement === d.querySelector('[data-cancel]'),
        title: (d.querySelector('#editor-remix-title')?.textContent ?? '').trim(),
        body: d.querySelector('#editor-remix-body')?.textContent ?? '',
        buttons: [...d.querySelectorAll('button')].map((b) => b.textContent.trim()),
        choices: d.querySelectorAll('input, [role="radio"], [role="checkbox"]').length,
      }
    })
    check('remix — the dice rolls and the confirm opens on Cancel, naming the count it would move and offering Cancel and a coral Remix (R-115, UX-DR14)',
      ask512 !== null && ask512.onCancel && ask512.title === 'Remix the sample?' &&
      /^Re-rolls 1 section on the sample to a different design in its own category\./.test(ask512.body) &&
      JSON.stringify(ask512.buttons) === JSON.stringify(['Cancel', 'Remix']) && ask512.choices === 0, JSON.stringify(ask512))
    check('remix — and it promises no undo on a page that saves nothing: B8\'s line is ABSENT here, not printed as a lie',
      ask512 !== null && !/One undo/i.test(ask512.body) &&
      (await page.evaluate(() => !/One undo/i.test(document.querySelector('dialog[data-remix-confirm][open]')?.textContent ?? ''))))
    // the owner's step 9 — Cancel changes nothing at all
    await page.locator('dialog[data-remix-confirm][open] [data-cancel]').click()
    await page.waitForTimeout(400)
    check('remix — Cancel leaves the sample exactly as it was: same design, same words',
      (await counter511.innerText()).trim() === wasRemix512 && (await drawnHeading()) === wordsRemix512,
      `${wasRemix512} → ${(await counter511.innerText()).trim()}`)

    // the owner's step 8 — Remix really re-rolls the sample through its ring, and the typed words carry
    await page.locator('#editor-remix').click()
    await page.waitForTimeout(1600)
    await page.locator('dialog[data-remix-confirm][open] [data-remix-go]').click()
    await page.waitForTimeout(600)
    check('remix — R-162: the dice really re-rolls the sample through its ring — a DIFFERENT design draws it and the words carry word for word (FR-D19, FR-G3)',
      (await counter511.innerText()).trim() !== wasRemix512 && (await drawnHeading()) === wordsRemix512 &&
      /^Design \d+ of 3 — .+/.test((await page.locator('#controls-said').innerText()).trim()),
      `${wasRemix512} → ${(await counter511.innerText()).trim()} · ${JSON.stringify(await drawnHeading())}`)

    // R-141: `⇧R` is the same control, through the page's own `shortcutFor` and never a second key table. Focus
    // is where the platform put it when the confirm closed — on the dice itself — so nothing needs pressing first.
    await page.keyboard.press('Shift+R')
    await page.waitForTimeout(1600)
    check('remix — R-145 / R-141: `⇧R` opens the very same confirm on this page — the key and the dice are one control',
      await page.evaluate(() => document.querySelector('dialog[data-remix-confirm][open]') !== null))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    // WCAG 2.1.4, the half only a real field can prove: a capital R typed into the Heading is a character
    await openGroup('Content')
    await heading511.click()
    const wasField512 = await heading511.inputValue().catch(() => heading511.innerText())
    await page.keyboard.press('Shift+R')
    await page.waitForTimeout(400)
    const nowField512 = await heading511.inputValue().catch(() => heading511.innerText())
    check('remix — WCAG 2.1.4: with the caret in the Heading field ⇧R types a capital R and rolls nothing',
      nowField512 === `${wasField512}R` && (await page.evaluate(() => document.querySelectorAll('dialog[open]').length)) === 0,
      `${JSON.stringify(wasField512)} → ${JSON.stringify(nowField512)}`)
    // the review screenshot is the page as it opens — on the FIRST design, not wherever the Shuffle above landed
    await page.locator('[data-design-tile]').first().click()
    await page.waitForTimeout(500)
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
