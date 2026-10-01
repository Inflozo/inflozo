// Story 5.22 — THE EDITOR'S FLOOR, BY TOUCH AND BY WIDTH (R-201, R-202, D4f, D8a, D8b), over the same harness mount the
// keyboard journey drives, and in the same gate (`bash tools/keyboard/run-keyboard-gate.sh`, `pnpm keyboard`).
//
// A POINTER IS ALLOWED HERE AND NOWHERE IN `journey.spec.mjs`, whose first test refuses one: taps, because a touch screen
// is the subject — which device gets the editor at all, and whether every target it gets is a finger's — and, since
// DW-211 (Story 5.24d), a mouse, because the section pill's ◀ ▶ and Shuffle are drawn only on a section the pointer is
// over, so no key can reach them and no gate had ever pressed them in the real editor. The devices are
// Playwright's own descriptors — the planning's evidence was their list — with `defaultBrowserType` dropped, because the
// iPhone and iPad ones default to WebKit and this gate drives the Chromium the repository installs.
//
// WHAT IT CANNOT PROVE is the deployed walk's (R-82): no lock row is ever written here (the harness has no database), so
// the phone's claim is proved by the REQUESTS it never sends, with a tablet sending them as the control; the
// `edit_locks` row itself is `tools/probe/run-verify-editor.cjs` step 97's, on production.

import { devices, expect, test } from '@playwright/test'

const HARNESS = '/app/harness/editor'
const FLOOR = await import(new URL('../../apps/web/lib/floor.ts', import.meta.url).href)

/** a descriptor, without the browser it would pick for itself */
const device = (name) => {
  const { defaultBrowserType, ...rest } = devices[name]
  return rest
}

/** every request a page makes to the lock or the sync route — the editor's mount effects' first words */
const watchMount = (page) => {
  const hits = []
  page.on('request', (r) => {
    if (/\/(lock|sync)$/.test(new URL(r.url()).pathname)) hits.push(r.url())
  })
  return hits
}

const painted = (page) => expect(page.frameLocator('iframe[title$="canvas"]').locator('#canvas > *').first()).toBeVisible()

/** THE 44px SWEEP (D8a: "every target is at least 44px"). Every visible pressable in the editor — the rule's own list,
 *  with switches — is at least 44 × 44, and each switch is D8a's 52 × 30 in a row at least 44 tall. The only things
 *  exempt are the ones the rule exempts: an inline text link, the skip link (`sr-only` until focused), and the switch. */
const sweep = (page) =>
  page.evaluate(() => {
    const root = document.querySelector('[data-editor]')
    const PRESS = 'button, a[href], summary, select, textarea, input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), [role="button"], [role="menuitem"], [role="radio"], [role="tab"], [role="option"], [role="switch"]'
    const said = (el) => `${el.tagName}${el.id ? `#${el.id}` : ''}[${el.getAttribute('aria-label') ?? el.textContent.trim().slice(0, 40)}]`
    const small = []
    let checked = 0
    for (const el of root.querySelectorAll(PRESS)) {
      if (!el.checkVisibility({ visibilityProperty: true })) continue
      if (el.matches('[data-skip-canvas]') || getComputedStyle(el).display === 'inline') continue
      const r = el.getBoundingClientRect()
      checked++
      if (el.getAttribute('role') === 'switch') {
        const row = el.parentElement.getBoundingClientRect()
        if (Math.round(r.width) !== 52 || Math.round(r.height) !== 30 || row.height < 44) small.push(`${said(el)} switch ${r.width}×${r.height} in a ${row.height} row`)
        continue
      }
      if (r.width < 44 - 0.5 || r.height < 44 - 0.5) small.push(`${said(el)} ${r.width.toFixed(1)}×${r.height.toFixed(1)}`)
    }
    return { checked, small }
  })

test.describe('R-201 · a phone gets D4f, never the editor', () => {
  test.use(device('iPhone 13'))

  test('the notice, drawn to D4f, and not one request to the lock or the sync route — a tablet, the control, sends them', async ({ page, browser, baseURL }) => {
    const hits = watchMount(page)
    await page.goto(HARNESS)
    expect(await page.evaluate((q) => matchMedia(q).matches, FLOOR.PHONE), 'the descriptor is a phone by R-201').toBe(true)
    await expect(page.locator('[data-small-screen] h1')).toHaveText('The editor needs a bigger screen.')
    await expect(page.locator('[data-small-screen]')).toContainText(
      "Dragging sections and a 280-pixel control panel don't fit on a phone yet. Open this project on a laptop or tablet.",
    )
    await expect(page.locator('[data-small-screen] h2')).toHaveText(/what works here/i)
    // ONE row today (R-118): the sites list. Deploy history and Billing arrive with 7.23 and 12.5 — absent, never greyed
    const rows = page.locator('[data-small-screen] section a')
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toHaveText('Your sites')
    await expect(rows.first()).toHaveAttribute('href', '/sites')
    expect((await rows.first().boundingBox()).height, 'the row is 56px').toBe(56)
    await expect(page.locator('[data-small-screen] a[aria-label="Back to dashboard"]')).toHaveAttribute('href', '/')
    await expect(page.locator('[data-small-screen]')).not.toContainText(/deploy history|billing/i)
    // DW-285: the decorative avatar, the user's own initial at D4f's 32px — the harness hands its fixture user through the
    // shell's own provider, as the app's shell does, so the gate reads what only the deployed walk read before
    const avatar = page.locator('[data-small-screen] span.rounded-full[aria-hidden]')
    await expect(avatar).toHaveText('H')
    const disc = await avatar.boundingBox()
    expect([disc.width, disc.height], 'the avatar is D4f\'s 32 × 32').toEqual([32, 32])
    // NOTHING OF THE EDITOR MOUNTED: no editor root, no canvas, and no lock or sync request in the seconds after
    await expect(page.locator('[data-editor]')).toHaveCount(0)
    await expect(page.locator('iframe[title$="canvas"]')).toHaveCount(0)
    await page.waitForTimeout(3000)
    expect(hits, 'a phone never starts the lock, the heartbeat or the sync').toEqual([])
    // …and no IndexedDB either: the local store is opened by the editor's effects, which never ran (review, 2026-09-27)
    // (`next dev` keeps a debug channel of its own in IndexedDB; only Inflozo's `inflozo-doc-*` counts)
    expect(await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name).filter((n) => /^inflozo-/.test(n))), 'a phone opens no database').toEqual([])
    // no sideways scroll at 390, measured against clientWidth (an `isMobile` innerWidth grows to fit overflow)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

    // THE CONTROL: the same page on a tablet mounts the editor, and its mount effects do call the lock route
    const tablet = await browser.newContext({ ...device('iPad Pro 11'), baseURL })
    const other = await tablet.newPage()
    const control = watchMount(other)
    await other.goto(HARNESS)
    await painted(other)
    await expect.poll(() => control.length, { message: 'a tablet mounts the editor, whose effects ask for the lock' }).toBeGreaterThan(0)
    await expect.poll(() => other.evaluate(async () => (await indexedDB.databases()).filter((d) => /^inflozo-/.test(d.name)).length), { message: 'and open the local store' }).toBeGreaterThan(0)
    await tablet.close()
  })

  test('turning the phone keeps the notice: the decision was made as the project opened', async ({ page }) => {
    const hits = watchMount(page)
    await page.goto(HARNESS)
    await expect(page.locator('[data-small-screen]')).toBeVisible()
    await page.setViewportSize({ width: 844, height: 390 })
    await page.waitForTimeout(500)
    await expect(page.locator('[data-small-screen]')).toBeVisible()
    await expect(page.locator('[data-editor]')).toHaveCount(0)
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.locator('[data-small-screen]')).toBeVisible()
    expect(hits).toEqual([])
  })
})

test.describe('R-201 · a phone held SIDEWAYS as the project opens is still a phone (the matrix\'s 844 × 390)', () => {
  test.use({ ...device('iPhone 13'), viewport: { width: 844, height: 390 } })

  test('the notice, never the editor, and not one request to the lock or the sync route', async ({ page }) => {
    const hits = watchMount(page)
    await page.goto(HARNESS)
    expect(await page.evaluate((q) => matchMedia(q).matches, FLOOR.PHONE), 'its SHORT side, 390, is under 500').toBe(true)
    await expect(page.locator('[data-small-screen] h1')).toHaveText('The editor needs a bigger screen.')
    await expect(page.locator('[data-editor]')).toHaveCount(0)
    await page.waitForTimeout(2000)
    expect(hits, 'a phone never starts the lock, the heartbeat or the sync').toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
})

test.describe('D8a · a large tablet held sideways (1366 × 1024): a touch screen ALWAYS gets the compact layout', () => {
  test.use({ viewport: { width: 1366, height: 1024 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })

  test('compact at a width a mouse would get the full editor at, never the notice, with D8a\'s 56px bar and rail and a 44px ⋯', async ({ page }) => {
    await page.goto(HARNESS)
    await painted(page)
    expect(await page.evaluate((q) => matchMedia(q).matches, FLOOR.PHONE), 'its short side is 1024: no phone').toBe(false)
    expect(await page.evaluate((q) => matchMedia(q).matches, FLOOR.COMPACT), 'a coarse pointer is compact at any width').toBe(true)
    expect((await page.locator('header').boundingBox()).height).toBe(56)
    expect((await page.locator('[data-icon-rail]').boundingBox()).width).toBe(56)
    const more = await page.locator('#editor-more').boundingBox()
    expect([more.width, more.height]).toEqual([44, 44])
    await expect(page.locator('#editor-mode')).toBeHidden()
    await expect(page.locator('#editor-layers')).toBeHidden()
    await expect(page.locator('#editor-controls')).toBeHidden()
    const rest = await sweep(page)
    expect(rest.small, `at rest (${rest.checked} checked)`).toEqual([])
  })
})

for (const name of ['iPad Mini', 'iPad Pro 11']) {
  test.describe(`D8a · ${name}: a touch screen that is not a phone gets the compact editor, every target 44px`, () => {
    test.use(device(name))

    test('the compact shape, and the 44px sweep at rest, with ⋯ open, over Layers, and over Controls with every group open', async ({ page }) => {
      await page.goto(HARNESS)
      await painted(page)
      expect(await page.evaluate((q) => matchMedia(q).matches, FLOOR.PHONE)).toBe(false)
      expect(await page.evaluate((q) => matchMedia(q).matches, FLOOR.COMPACT)).toBe(true)
      // D8a: a 56px bar and a 56px rail, the cluster collapsed into ⋯, both panels overlays drawn only when opened
      expect((await page.locator('header').boundingBox()).height).toBe(56)
      expect((await page.locator('[data-icon-rail]').boundingBox()).width).toBe(56)
      await expect(page.locator('#editor-more')).toBeVisible()
      await expect(page.locator('#editor-mode')).toBeHidden()
      await expect(page.locator('#editor-layers')).toBeHidden()
      await expect(page.locator('#editor-controls')).toBeHidden()
      // the rail's thumbs are D8a's 34 × 24
      const thumb = await page.locator('[data-rail-row] span').first().boundingBox()
      expect([Math.round(thumb.width), Math.round(thumb.height)]).toEqual([34, 24])

      const rest = await sweep(page)
      expect(rest.small, `at rest (${rest.checked} checked)`).toEqual([])

      // ⋯ and its rows — D8a's "five items at 44px"
      await page.locator('#editor-more').tap()
      await expect(page.locator('#editor-more-menu')).toBeVisible()
      const menu = await sweep(page)
      expect(menu.small, `with ⋯ open (${menu.checked} checked)`).toEqual([])
      await page.keyboard.press('Escape')

      // Layers over the canvas
      await page.locator('[data-icon-rail] button[aria-label="Show layers"]').tap()
      await expect(page.locator('#editor-layers')).toBeVisible()
      const layers = await sweep(page)
      expect(layers.small, `with Layers open (${layers.checked} checked)`).toEqual([])
      await page.locator('#editor-layers button[aria-label="Close layers"]').tap()
      await expect(page.locator('#editor-layers')).toBeHidden()

      // every section's own panel, chosen from the rail, every group open — so each control the fixture draws is swept
      const sections = await page.locator('[data-rail-row]').count()
      for (let n = 0; n < sections; n++) {
        await page.locator('[data-rail-row]').nth(n).tap()
        await expect(page.locator('#editor-controls')).toBeVisible()
        for (let guard = 0; guard < 14; guard++) {
          const closed = page.locator('#editor-controls button[aria-expanded="false"]')
          if ((await closed.count()) === 0) break
          await closed.first().tap()
        }
        const each = await sweep(page)
        expect(each.small, `over Controls for section ${n + 1} of ${sections} (${each.checked} checked)`).toEqual([])
        await page.locator('[data-scrim]').tap({ position: { x: 20, y: 200 } })
        await expect(page.locator('#editor-controls')).toBeHidden()
      }

      // a tap on a section: it is chosen and Controls slides over the page — and the tap's own click never lands on
      // the overlay it opened (the scrim, or a control that is now under the finger)
      const chip = await page.locator('#editor-viewport').innerText()
      const at = await page.evaluate(() => {
        const f = document.querySelector('section[aria-label="Canvas"] iframe')
        // the rail's presses revealed each section in turn, so the page is scrolled: back to its top first
        f.contentWindow.scrollTo(0, 0)
        const fr = f.getBoundingClientRect()
        const k = fr.width / f.offsetWidth
        const root = f.contentDocument.querySelectorAll('#canvas > *')[1].getBoundingClientRect()
        // the LEFT of the section, where the scrim will be: a click that followed the tap would land on it and close
        // the overlay it opened — executed with the guard taken out, 2026-09-27 (the click reached the scrim)
        return { x: fr.left + (root.left + root.width * 0.15) * k, y: fr.top + (root.top + 30) * k }
      })
      await page.evaluate(() => {
        window.__clicks = 0
        document.addEventListener('click', () => window.__clicks++, true)
      })
      await page.touchscreen.tap(at.x, at.y)
      await expect(page.locator('#editor-controls')).toBeVisible()
      await page.waitForTimeout(600)
      await expect(page.locator('#editor-controls'), 'still open: the opening tap\'s click did not close it').toBeVisible()
      expect(await page.evaluate(() => window.__clicks), 'the tap that opened the overlay fired no click into the editor').toBe(0)
      await expect(page.locator('#editor-controls')).toHaveAttribute('aria-label', 'Section settings')
      expect(await page.locator('#editor-viewport').innerText(), 'the overlay never resizes the canvas').toBe(chip)
      // every group open, so each control the panel draws is swept, switches included
      for (let guard = 0; guard < 12; guard++) {
        const closed = page.locator('#editor-controls button[aria-expanded="false"]')
        if ((await closed.count()) === 0) break
        await closed.first().tap()
      }
      const panel = await sweep(page)
      expect(panel.small, `over Controls (${panel.checked} checked)`).toEqual([])
      // the scrim closes it, and the section stays chosen
      await page.locator('[data-scrim]').tap({ position: { x: 20, y: 200 } })
      await expect(page.locator('#editor-controls')).toBeHidden()
      await expect(page.locator('[data-rail-row][aria-current="true"]')).toHaveCount(1)

      // the surfaces the sweeps above never open (review, 2026-09-27): the Section Picker — its Add, its category
      // rail and its search — and the two bar menus, Template and View as
      // from the keyboard: `next dev`'s own floating button sits over the rail's foot in the harness
      await page.locator('[data-rail-add]').focus()
      await page.keyboard.press('Enter')
      await expect(page.locator('dialog[open][aria-label="Add a section"] [data-picker-grid]')).toBeVisible()
      await page.waitForTimeout(1500)
      const picker = await sweep(page)
      expect(picker.small, `with the Section Picker open (${picker.checked} checked)`).toEqual([])
      await page.keyboard.press('Escape')
      await expect(page.locator('dialog[open][aria-label="Add a section"]')).toHaveCount(0)
      for (const trigger of ['#editor-template', '#editor-view-as']) {
        await page.locator(trigger).tap()
        await expect(page.locator(`${trigger}-menu`)).toBeVisible()
        const menu = await sweep(page)
        expect(menu.small, `with ${trigger} open (${menu.checked} checked)`).toEqual([])
        await page.keyboard.press('Escape')
        await expect(page.locator(`${trigger}-menu`)).toBeHidden()
      }
    })
  })
}

test.describe('DW-211 · the section pill\'s ◀ ▶ and Shuffle in the real editor, pressed with a mouse (1280 × 720)', () => {
  test.use({ viewport: { width: 1280, height: 720 }, hasTouch: false })

  test('Next and Previous step the ring and say so, Shuffle lands on another design, and one ⌘Z takes it back', async ({ page }) => {
    await page.goto(HARNESS)
    await painted(page)
    // the ringed section: the harness's last page section, whose category is the fixture ring (R-158)
    const own = await page.locator('[data-layer-row]').evaluateAll((els) => els.map((e) => e.dataset.layerRow).filter((k) => !k.startsWith('site:')))
    await page.locator(`[data-layer-row="${own.at(-1)}"] button`).first().click()
    const count = page.locator('#editor-design-count')
    await expect(count, 'the control: the ringed section is chosen, at its first design').toHaveText(/^1 of 3$/)
    const root = page.frameLocator('iframe[title$="canvas"]').locator('#canvas > [data-inflozo-selected]')
    /** the pointer over the section's root brings its pill; then the pill's own button, by its words */
    const press = async (control) => {
      await root.hover()
      const pill = page.locator('[data-section-pill]')
      await expect(pill, 'the pill is drawn on the pointed section').toHaveCount(1)
      await pill.locator(control).click()
    }
    await press('[aria-label^="Next design"]')
    await expect(count).toHaveText('2 of 3')
    await expect(page.locator('#editor-said')).toHaveText(/^Design 2 of 3 — .+/)
    await press('[aria-label^="Previous design"]')
    await expect(count).toHaveText('1 of 3')
    await press('[data-pill-shuffle]')
    await expect(count, 'Shuffle lands on another design of the ring').not.toHaveText(/^1 of/)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('ControlOrMeta+z')
    await expect(count, 'one ⌘Z takes the Shuffle back').toHaveText('1 of 3')
  })
})

test.describe('R-202 · the line is 1280, on a fine pointer', () => {
  test.use({ viewport: { width: 1279, height: 800 }, hasTouch: false })

  test('1279 is compact and 1280 is not, live and with nothing remounted', async ({ page }) => {
    await page.goto(HARNESS)
    await painted(page)
    // NOTHING READS OR BLOCKS BROWSER ZOOM (FR-D14, UX-DR17, WCAG 1.4.4): the viewport allows every scale
    const meta = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(meta).toContain('width=device-width')
    expect(meta, 'no maximum-scale and no user-scalable').not.toMatch(/maximum-scale|user-scalable/)
    await expect(page.locator('#editor-more')).toBeVisible()
    await expect(page.locator('[data-icon-rail]')).toBeVisible()
    await expect(page.locator('#editor-layers')).toBeHidden()
    // D8b: the pointer changes only target sizes (D8:33) — a 44px rail of 32px items with 26 × 19 thumbs, and a 28px ⋯
    const rail = await page.locator('[data-icon-rail]').boundingBox()
    const item = await page.locator('[data-rail-row]').first().boundingBox()
    const thumb = await page.locator('[data-rail-row] span').first().boundingBox()
    const more = await page.locator('#editor-more').boundingBox()
    expect([rail.width, item.width, item.height, more.width, more.height]).toEqual([44, 32, 32, 28, 28])
    expect([Math.round(thumb.width), Math.round(thumb.height)]).toEqual([26, 19])
    // "Hover states are live here" (D8b): a rail item lights under the pointer
    const lit = page.locator('[data-rail-row]').nth(1)
    const rest = await lit.evaluate((e) => getComputedStyle(e).backgroundColor)
    await lit.hover()
    await expect.poll(() => lit.evaluate((e) => getComputedStyle(e).backgroundColor), { message: 'hover lights the item' }).not.toBe(rest)
    // a click on it opens Controls over the canvas, the scrim starting where the rail ends; a click on the scrim closes it
    await lit.click()
    await expect(page.locator('#editor-controls')).toBeVisible()
    const scrim = await page.locator('[data-scrim]').boundingBox()
    expect(Math.round(scrim.x), 'the scrim stops at the rail').toBe(Math.round(rail.x + rail.width))
    await page.locator('[data-scrim]').click({ position: { x: 20, y: 200 } })
    await expect(page.locator('#editor-controls')).toBeHidden()
    await expect(lit, 'the selection is kept').toHaveAttribute('aria-current', 'true')
    await page.frameLocator('iframe[title$="canvas"]').locator('body').evaluate((b) => { b.dataset.kept = 'yes' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page.locator('#editor-more')).toBeHidden()
    await expect(page.locator('#editor-mode')).toBeVisible()
    await expect(page.locator('#editor-layers')).toBeVisible()
    await expect(page.locator('#editor-controls')).toBeVisible()
    await expect(page.locator('[data-icon-rail]')).toHaveCount(0)
    expect(await page.frameLocator('iframe[title$="canvas"]').locator('body').evaluate((b) => b.dataset.kept)).toBe('yes')
  })
})

test.describe('D5d · page 2 on a tablet: the pill\'s two parts are 44px, and the ground grows so nothing meets the card', () => {
  test.use(device('iPad Pro 11'))

  test('the pill at 44, clear of the page card and the chip; the source pill at 44, clear of the card below', async ({ page }) => {
    await page.goto(HARNESS)
    await painted(page)
    const names = await page.locator('[data-rail-row]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
    await page.locator('[data-rail-row]').nth(names.findIndex((n) => /Three Up/.test(n))).tap()
    await expect(page.locator('#editor-controls')).toBeVisible()
    await page.locator('#editor-controls [data-page-row] [role="radio"]', { hasText: '2' }).tap()
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '2')
    await page.locator('[data-scrim]').tap({ position: { x: 20, y: 200 } })
    await expect(page.locator('#editor-controls')).toBeHidden()
    const box = (s) => page.locator(s).first().boundingBox()
    const meets = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
    const [words, back] = await Promise.all(['[data-page-two-pill] > span', '[data-page-two-pill] > button'].map(box))
    expect([Math.round(words.height), Math.round(back.height)], 'both parts are a finger\'s 44').toEqual([44, 44])
    const [pill, chip, card, source] = await Promise.all(['[data-page-two-pill]', '#editor-viewport', 'section[aria-label="Canvas"] > div', '#editor-source'].map(box))
    expect(meets(pill, card), 'the pill meets the page card').toBe(false)
    expect(meets(pill, chip), 'the pill meets the chip').toBe(false)
    expect(meets(source, card), 'the source pill meets the page card').toBe(false)
  })
})

test.describe('D5d · the page-2 pill and the chip share one row, and never meet', () => {
  test.use({ viewport: { width: 720, height: 900 }, hasTouch: false })

  test('at 720 the pill clears the chip on every device — centred where the chip leaves room, and right of it where it does not', async ({ page }) => {
    await page.goto(HARNESS)
    await painted(page)
    // page 2 is offered on the main feed's panel: chosen from the rail, where the harness's post grid carries the flag
    const names = await page.locator('[data-rail-row]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
    const grid = names.findIndex((n) => /Three Up/.test(n))
    expect(grid, 'the harness Home carries the post grid').toBeGreaterThan(-1)
    await page.locator('[data-rail-row]').nth(grid).click()
    await expect(page.locator('#editor-controls')).toBeVisible()
    await page.locator('#editor-controls [data-page-row] [role="radio"]', { hasText: '2' }).click()
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '2')
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor-controls')).toBeHidden()
    const meets = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
    const devicesOnTrack = await page.locator('#editor-device [role="radio"]').count()
    for (const width of [720, 560]) {
      await page.setViewportSize({ width, height: 900 })
      for (let n = 0; n < devicesOnTrack; n++) {
        await page.locator('section[aria-label="Canvas"]').focus()
        await page.keyboard.press(String(n + 1))
        await page.waitForTimeout(250)
        // the card is the ground's FIRST element child, as it always is (the chip and the pill come after it)
        const [pill, chip, card] = await Promise.all(['[data-page-two-pill]', '#editor-viewport', 'section[aria-label="Canvas"] > div'].map((s) => page.locator(s).first().boundingBox()))
        expect(meets(pill, chip), `${width}, device ${n + 1}: the pill meets the chip`).toBe(false)
        expect(meets(pill, card), `${width}, device ${n + 1}: the pill meets the page card`).toBe(false)
        // "centred, or slid right of the chip" (the matrix's row): the grid centres it while the chip leaves room either
        // side, and otherwise starts it after the chip — at 560 there is never room, so it must have slid
        const stage = await page.locator('section[aria-label="Canvas"]').boundingBox()
        const centred = Math.abs(pill.x + pill.width / 2 - (stage.x + stage.width / 2)) < 2
        const slid = pill.x >= chip.x + chip.width
        expect(centred || slid, `${width}, device ${n + 1}: centred, or right of the chip`).toBe(true)
        if (width === 560) expect(slid, 'too narrow to centre: it slides right of the chip').toBe(true)
      }
    }
  })
})

/** The bar, measured: the centred group against the last thing drawn on its left and the first on its right, and every
 *  visible control inside the window. The columns are the header's two in-flow `div`s either side of `#editor-centre`. */
const barMeasure = (page) =>
  page.evaluate(() => {
    const header = document.querySelector('header')
    const group = document.getElementById('editor-centre').getBoundingClientRect()
    const shown = (el) => el.checkVisibility() && el.getBoundingClientRect().width > 0
    const [left, right] = [header.children[1], header.children[3]].map((col) => [...col.querySelectorAll('*')].filter(shown).map((el) => el.getBoundingClientRect()))
    const width = document.documentElement.clientWidth
    // the skip link is `sr-only` until focused — a 1px box the platform may park at -1 — so it is not a drawn control
    const outside = [...header.querySelectorAll('button:not([data-skip-canvas]), a[href]')].filter(shown)
      .filter((el) => { const r = el.getBoundingClientRect(); return r.left < 0 || r.right > width + 0.5 })
      .map((el) => `${el.tagName}[${el.getAttribute('aria-label') ?? el.textContent.trim().slice(0, 24)}] ${JSON.stringify(el.getBoundingClientRect().toJSON())}`)
    return {
      leftEnd: Math.max(...left.map((r) => r.right)),
      rightStart: Math.min(...right.map((r) => r.left)),
      group: [group.left, group.right],
      outside,
    }
  })

test.describe('the bar at every width from 720, either pointer, on Home and on the Paywall: the centred group meets neither side', () => {
  for (const [pointer, widths] of [['fine', [720, 900, 1100, 1279, 1280, 1440]], ['touch', [768, 834, 1024, 1366]]]) {
    test(`${pointer}: ${widths.join(', ')}`, async ({ browser, baseURL }) => {
      for (const width of widths) {
        for (const path of ['', '/paywall']) {
          const context = await browser.newContext({ baseURL, viewport: { width, height: 900 }, hasTouch: pointer === 'touch', isMobile: pointer === 'touch' })
          const page = await context.newPage()
          await page.goto(`${HARNESS}${path}`)
          await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', path ? 'paywall' : 'home')
          const m = await barMeasure(page)
          const at = `${pointer} ${width} ${path || '/'}`
          expect(m.leftEnd, `${at}: the left side ends before the group`).toBeLessThanOrEqual(m.group[0] + 0.5)
          expect(m.rightStart, `${at}: the right side starts after the group`).toBeGreaterThanOrEqual(m.group[1] - 0.5)
          expect(m.outside, `${at}: no control of the bar is outside the window`).toEqual([])
          await context.close()
        }
      }
    })
  }
})

/** The Section Picker's grid as a width draws it: its column count, and per design whether its name and its tier tag
 *  are whole. The card's footer is its last child: the name's span first, the category and tier tag last (`Card`). */
async function pickerAt(browser, baseURL, options) {
  const context = await browser.newContext({ baseURL, ...options })
  const page = await context.newPage()
  await page.goto(HARNESS)
  await painted(page)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  const grid = page.locator('dialog[open][aria-label="Add a section"] [data-picker-grid]')
  await expect(grid).toBeVisible()
  // a card takes its span once its preview has drawn and reported its shape (`spanFor`)
  await page.waitForTimeout(1500)
  const read = await grid.evaluate((g) => ({
    columns: getComputedStyle(g).gridTemplateColumns.split(' ').length,
    cards: Object.fromEntries([...g.children].map((card) => {
      const foot = card.lastElementChild
      const name = foot.firstElementChild.firstElementChild
      const tags = foot.lastElementChild
      const [tier, track] = [tags.lastElementChild.getBoundingClientRect(), tags.getBoundingClientRect()]
      return [card.querySelector('[data-cell]').dataset.design, {
        name: name.scrollWidth <= name.clientWidth + 0.5,
        tier: tier.left >= track.left - 0.5 && tier.right <= track.right + 0.5,
      }]
    })),
  }))
  await context.close()
  return read
}

test.describe('R-203 · the Section Picker below 1280: fewer, wider cards, each keeping its name, its Add and its tier tag', () => {
  test('four columns at full width, two below 1280 and on the iPad Pro 11, one where two would cut the names — and nothing cut that full width shows whole', async ({ browser, baseURL }) => {
    const full = await pickerAt(browser, baseURL, { viewport: { width: 1440, height: 900 } })
    expect(full.columns, 'S5a as the owner re-shaped it (R-153): four columns').toBe(4)
    for (const [label, options, columns] of [
      ['1279', { viewport: { width: 1279, height: 900 } }, 2],
      ['900', { viewport: { width: 900, height: 900 } }, 2],
      ['iPad Pro 11', device('iPad Pro 11'), 2],
      ['iPad Mini', device('iPad Mini'), 1],
      ['720', { viewport: { width: 720, height: 900 } }, 1],
      ['640', { viewport: { width: 640, height: 900 } }, 1],
    ]) {
      const at = await pickerAt(browser, baseURL, options)
      expect(at.columns, `${label}: the number of columns`).toBe(columns)
      for (const [id, card] of Object.entries(at.cards)) {
        expect(card.tier, `${label}: ${id}'s Free or Pro tag is whole`).toBe(true)
        // a name too long for the widest card is cut at full width too (the harness's fixture ring); every other is whole
        if (full.cards[id]?.name) expect(card.name, `${label}: ${id}'s name, whole at full width, is whole here`).toBe(true)
      }
    }
  })
})
