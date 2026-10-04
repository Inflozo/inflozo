// Story 5.9 — THE KEYBOARD JOURNEY (NFR-6(d), R-146), over the harness mount of the real editor.
//
//   bash tools/keyboard/run-keyboard-gate.sh          — or `pnpm keyboard`, and CI runs the same script as its own
//                                                        step in the `check` job, which `deploy` needs (R-116), so a
//                                                        red journey publishes nothing. Never inside `pnpm check`
//                                                        itself: `vercel build` runs that a second time, browserless.
//
// IT DRIVES WITH THE KEYBOARD AND NOTHING ELSE. NFR-6(d) says "run with no pointer events": the context has no touch
// (`playwright.config.mjs`) and the first test below reads THIS FILE and fails if a mouse or tap API appears in it, so
// the claim is checked rather than remembered. `focus()` is allowed and used only to enter a region whose tab path
// another test has already proved — it moves focus the way a script does, not the way a pointer does.
//
// ONE STATED EXCEPTION: EVENTS SYNTHESIZED IN THE PAGE, NEVER THE POINTER DEVICE (Story 5.15). R-175's PAUSED chip is
// drawn on a POINTED section, and a keyboard cannot point, so those stops SYNTHESIZE the canvas document's own
// `pointerover` — the event the editor listens for — to read what the chip looks like and where it sits; Story 5.23a's
// hover-through-a-paint stop and 5.21's strip point the same way. THREE PRESSES are synthesized the same way, each for a
// claim no key can reach: Preview's click and ground press, which must select nothing; 5.23a's press that starts an
// inline session the keyed paint must then redraw; and DW-182's (Story 5.24d), which starts a session on the fixture
// ring's heading to type past its limit and to lose the window — the same press (`startHeading`) DW-241's inline arm
// starts its field with (Story 5.24e). None reaches a task a keyboard could not: the canvas
// has no keyboard path into inline editing (FR-D1), and every selection here is walked from the keyboard alone.
//
// WHAT IT CANNOT PROVE is the deployed walk's, which R-82 requires of every story anyway: the read, the session, the
// sync route and the CSP. A harness proves the wiring and never the stack — `tools/probe/run-verify-editor.cjs` runs
// the same journey on the deployed editor with a real session, from step 71.
//
// Every expectation below is the spec's I/O matrix, row for row.

import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import diePips from '../probe/die-pips.cjs'

/* KEYBOARD ONLY BELOW */

const HARNESS = '/app/harness/editor'

/** Nothing is counted here (standing rule 4): the rows, the devices and the card's keys all come from the page. */
const described = () =>
  ((d) => {
    if (!d) return 'nothing'
    const label = d.getAttribute('aria-label')
    return `${d.tagName}${d.id ? `#${d.id}` : ''}${label ? `[${label}]` : ''}`
  })(document.activeElement)

const focused = (page) => page.evaluate(described)

/** The editor, painted: the canvas document has drawn its sections and Layers has its rows. */
async function open(page) {
  await page.goto(HARNESS)
  const canvas = page.frameLocator('iframe[title$="canvas"]')
  await expect(canvas.locator('#canvas > *').first()).toBeVisible()
  await expect(page.locator('[data-layer-row]').first()).toBeVisible()
  // focus starts on the body, so the FIRST Tab is really the first Tab
  await page.locator('body').focus()
  return canvas
}

/** The canvas document's mode attribute — Story 5.6's one signal, and what `.` has to move. */
const modeOf = (page) => page.frameLocator('iframe[title$="canvas"]').locator('html').getAttribute('data-mode')

/** Which device the track says is showing, read off S4a's own radio group. */
const deviceOf = (page) => page.locator('#editor-device [role="radio"][aria-checked="true"]').getAttribute('aria-label')

const said = (page) => page.locator('#editor-said').innerText()

/** R-210 (Story 5.23b): a section operation paints the canvas at once and the panels a frame later, so a check that reads a
 *  panel in the instant after one first lets the panels settle — two frames and a moment more — and checks nothing
 *  different; a check that expects the panel to CHANGE polls for it. The 5.23b render-count stops wait for the renders
 *  themselves instead (`rendersSettle`, DW-292): a fixed moment let a late tile be counted as the gesture's. */
const panelsSettle = (page) =>
  page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 150)))))

/** The tab stops a region holds, COUNTED OFF THE PAGE: every element Tab would land on that is drawn. A closed
 *  popover's rows are `display:none`, a roving radio group's unchecked radios are `tabindex="-1"`, a hidden pill is
 *  `visibility: hidden`, and Tab passes all three by, so this does too. Nothing here is a number written down. */
const stopsIn = (page, selector) =>
  page.locator(selector).evaluate((root) =>
    [...root.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
      .filter((el) => el.tabIndex >= 0 && !el.disabled && el.checkVisibility({ visibilityProperty: true })).length)

/** Story 5.14 — the visitor View as names: its ONE visible value, never a word held in the slot for its width. */
const viewAsOf = (page) => page.locator('#editor-view-as [data-current]').innerText()

/** R-169 — the menu's rows that carry the coral not-viewed dot, by visitor. Read from the DOM whether or not the menu is
 *  open: a closed popover's rows are still in the document, only not drawn. */
const dotted = (page) =>
  page.locator('#editor-view-as-menu [data-visitor]').evaluateAll((rows) =>
    rows.filter((r) => r.querySelector('[data-not-viewed]')).map((r) => r.dataset.visitor))

/** The Layers rows, by their `{doc}:{instanceId}` key — a site-wide row is the one whose doc is `site`. */
async function rows(page) {
  const keys = await page.locator('[data-layer-row]').evaluateAll((els) => els.map((e) => e.dataset.layerRow))
  return { all: keys, site: keys.filter((k) => k.startsWith('site:')), page: keys.filter((k) => !k.startsWith('site:')) }
}

/** The selection, as the editor shows it: the row takes S4's coral tint and the Controls panel becomes the
 *  SECTION's rather than the page's — the sidebar is "the second way to do everything" (FR-D1). */
const chosen = (page, key) =>
  Promise.all([
    expect(page.locator(`[data-layer-row="${key}"]`)).toHaveClass(/bg-coral-tint/),
    expect(page.locator('#editor-controls')).toHaveAttribute('aria-label', 'Section settings'),
  ])

/* THE CANVAS HAS NO KEYBOARD PATH INTO INLINE EDITING, and that is the design rather than a gap: a press on a text
   prop is what starts it (Story 5.3), and the keyboard's way into a text prop is THE PANEL — "the second way to do
   everything" (FR-D1, `EXPERIENCE.md:456`). The editing stamps are lifted out of the DOM in the same task they are
   painted (`takeStamps`), so there is nothing in the canvas document to find them by either.

   So the two conditions are reached where each really lives. UX-DR11's subject is a `contenteditable` IN THE CANVAS
   DOCUMENT holding the caret, which is made here directly — the guard is `holdsCaret` over whatever holds the caret,
   and it cannot tell one contenteditable from another. Everything that needs a live EDITING SESSION — the Esc
   ladder's first rung, ⌥F10, the mark toolbar — is driven through the panel's rich Text Area, which runs the very
   same controller (`lib/inline.ts`). The canvas's own session is walked with a real caret on the deployed editor. */
async function caretIntoCanvas(page) {
  await page.frameLocator('iframe[title$="canvas"]').locator('#canvas').evaluate((root) => {
    const el = [...root.querySelectorAll('*')].find((e) => e.children.length === 0 && (e.textContent ?? '').trim())
    if (!el) throw new Error('the canvas painted no words to put a caret in')
    el.setAttribute('contenteditable', 'true')
    el.focus()
    const range = el.ownerDocument.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = el.ownerDocument.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  })
}

/** Every collapsed group in the panel, opened from the keyboard — a control row is otherwise unreachable. */
async function openEveryGroup(page) {
  for (let guard = 0; guard < 12; guard++) {
    const collapsed = page.locator('#editor-controls button[aria-expanded="false"]')
    if ((await collapsed.count()) === 0) return
    const id = await collapsed.first().evaluate((el) => el.id)
    const group = page.locator(`#editor-controls button[id="${id}"]`)
    await group.focus()
    await page.keyboard.press('Enter')
    await expect(group).toHaveAttribute('aria-expanded', 'true')
  }
}

/** The panel's first collapsed group, opened from the keyboard — every field in the panel lives inside one. */
async function openGroup(page) {
  // pinned by id BEFORE it is opened: `.first()` re-resolves, and once this group is expanded the same locator would
  // point at the NEXT collapsed one and read "false" for ever
  const id = await page.locator('#editor-controls button[aria-expanded="false"]').first().evaluate((el) => el.id)
  const group = page.locator(`#editor-controls button[id="${id}"]`)
  await group.focus()
  await page.keyboard.press('Enter')
  await expect(group).toHaveAttribute('aria-expanded', 'true')
}

/** Select a section with the keyboard alone: focus its Layers row and press Enter (Story 5.4's row key). */
async function select(page, key) {
  await page.locator(`[data-layer-row="${key}"]`).focus()
  await page.keyboard.press('Enter')
  await chosen(page, key)
}

// ── the control: this file really is keyboard-only ──────────────────────────────────────────────────────────────

test('the journey uses no pointer at all', () => {
  const source = readFileSync(fileURLToPath(import.meta.url), 'utf8')
  // EVERYTHING BELOW THE SENTINEL, HELPERS INCLUDED — a pointer hidden in a helper would be a pointer all the same.
  // The names below carry no leading dot, so the list this test reads is never what it finds.
  // `indexOf`, never `lastIndexOf`: the needle is on this line too, and the last one starts the scan BELOW the helpers
  const body = source.slice(source.indexOf('KEYBOARD ONLY BELOW'))
  for (const name of ['click(', 'dblclick(', 'tap(', 'hover(', 'mouse.', 'dragTo(']) {
    expect(body, `NFR-6(d): the keyboard journey must use no pointer — found .${name}`).not.toContain(`.${name}`)
  }
})

// ── the first Tab, D8c's skip link, and the canvas as ONE stop ──────────────────────────────────────────────────

test('D8c: the skip link is the first stop, is drawn only while focused, and skips PAST the canvas', async ({ page }) => {
  await open(page)
  const skip = page.locator('[data-skip-canvas]')
  // at rest it is not drawn: `sr-only` gives it a 1px clip, so its box is the tell
  const resting = await skip.boundingBox()
  expect(resting.width).toBeLessThan(4)

  await page.keyboard.press('Tab')
  expect(await focused(page)).toBe('BUTTON')
  await expect(skip).toBeFocused()
  await expect(skip).toHaveText('Skip the canvas')
  const shown = await skip.boundingBox()
  expect(shown.height).toBe(30)
  expect(shown.width).toBeGreaterThan(80)
  // the frame's ring AND its shadow together, the corrected 2px coral (A7 item 7)
  const shadow = await skip.evaluate((el) => getComputedStyle(el).boxShadow)
  expect(shadow).toContain('rgb(194, 56, 31)')

  // the second Tab takes it away again
  await page.keyboard.press('Tab')
  expect((await skip.boundingBox()).width).toBeLessThan(4)

  // pressed, it lands on the Controls sidebar's first control — PAST the canvas, not at it
  await skip.focus()
  await page.keyboard.press('Enter')
  expect(await focused(page)).toBe('BUTTON[Collapse controls]')
})

test('UX-DR9: the canvas is ONE tab stop between Layers and Controls, and no link inside the site is a stop', async ({ page }) => {
  await open(page)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('tabindex', '-1')
  const stops = []
  // AS MANY PRESSES AS THERE ARE STOPS UP TO THE CONTROLS SIDEBAR'S TOGGLE, COUNTED OFF THE PAGE (standing rule 4):
  // the header's own focusable controls, Layers' (every row's two among them), the canvas container with anything
  // drawn inside it, and the Controls sidebar's. It was `rows * 2 + 14` until Story 5.14 — a hand count of the header
  // that the next control in the bar (View as) made one short. Exact, so the walk can never wrap round to the canvas.
  const budget = (await stopsIn(page, 'header')) + (await stopsIn(page, '#editor-layers')) +
    1 + (await stopsIn(page, 'section[aria-label="Canvas"]')) + (await stopsIn(page, '#editor-controls'))
  for (let n = 0; n < budget; n++) {
    await page.keyboard.press('Tab')
    stops.push(await page.evaluate(() => {
      const d = document.activeElement
      if (!d) return 'nothing'
      if (d.tagName === 'IFRAME') return 'INSIDE THE CANVAS'
      const label = d.getAttribute('aria-label')
      return `${d.tagName}${d.id ? `#${d.id}` : ''}${label ? `[${label}]` : ''}`
    }))
  }
  expect(stops, 'the embedded document must be out of sequential navigation').not.toContain('INSIDE THE CANVAS')
  const canvas = stops.indexOf('SECTION[Canvas]')
  expect(canvas, 'the canvas container is a stop of its own').toBeGreaterThan(-1)
  expect(stops.filter((s) => s === 'SECTION[Canvas]')).toHaveLength(1)
  expect(stops.indexOf('BUTTON[Collapse layers]'), 'Layers comes first').toBeLessThan(canvas)
  expect(stops.indexOf('BUTTON[Collapse controls]'), 'the Controls sidebar comes after').toBeGreaterThan(canvas)
})

// ── the eight live keys ─────────────────────────────────────────────────────────────────────────────────────────

test('L folds and unfolds Layers, and focus follows the button that replaced the one pressed', async ({ page }) => {
  await open(page)
  await page.locator('#editor-canvas-anchor, section[aria-label="Canvas"]').first().focus()
  await page.keyboard.press('l')
  await expect(page.locator('#editor-layers')).toBeHidden()
  expect(await focused(page)).toBe('BUTTON[Show layers]')
  await page.keyboard.press('l')
  await expect(page.locator('#editor-layers')).toBeVisible()
  expect(await focused(page)).toBe('BUTTON[Collapse layers]')
})

test('5.22 · at full width the folded Layers rail is D8\'s rail: a row selects and reveals its section into the DOCKED Controls, no overlay, and + opens the picker', async ({ page }) => {
  await open(page)
  await page.locator('#editor-canvas-anchor, section[aria-label="Canvas"]').first().focus()
  await page.keyboard.press('l')
  await expect(page.locator('#editor-layers')).toBeHidden()
  const rows = page.locator('[data-rail-row]')
  expect(await rows.count(), 'a row per section').toBeGreaterThan(1)
  await rows.nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(rows.nth(1)).toHaveAttribute('aria-current', 'true')
  await expect(page.locator('#editor-controls')).toBeVisible()
  await expect(page.locator('#editor-controls')).toHaveAttribute('aria-label', 'Section settings')
  await expect(page.locator('[data-scrim]'), 'docked, not an overlay').toHaveCount(0)
  expect(await page.locator('section[aria-label="Canvas"]').evaluate((s) => s.closest('[inert]') !== null), 'the page is live').toBe(false)
  await page.locator('[data-rail-add]').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('dialog[open][aria-label="Add a section"]')).toBeVisible()
  await page.keyboard.press('Escape')
})

test('. flips the canvas between light and dark, and says which is showing', async ({ page }) => {
  await open(page)
  expect(await modeOf(page)).toBe('light')
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('.')
  expect(await modeOf(page)).toBe('dark')
  expect(await said(page)).toMatch(/dark/i)
  await page.keyboard.press('.')
  expect(await modeOf(page)).toBe('light')
})

test('1 2 3 change the device, and each announces the device now showing', async ({ page }) => {
  await open(page)
  const track = page.locator('#editor-device [role="radio"]')
  const labels = await track.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
  await page.locator('section[aria-label="Canvas"]').focus()
  // every device on the track, in the track's own order — never a list written here
  for (const [n, label] of labels.entries()) {
    await page.keyboard.press(String(n + 1))
    expect(await deviceOf(page), `${n + 1} is ${label}`).toBe(label)
  }
  // and back to the first, so a second press of an earlier key is not swallowed
  await page.keyboard.press('1')
  expect(await deviceOf(page)).toBe(labels[0])
  expect(await said(page)).toContain(labels[0])
})

test('⌘D duplicates the SELECTION, and a site-wide section has no Duplicate at all (FR-D5)', async ({ page }) => {
  await open(page)
  const before = (await rows(page)).all.length
  const { page: own, site } = await rows(page)

  // nothing selected: nothing happens and nothing is announced
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+d')
  await panelsSettle(page)
  expect((await rows(page)).all).toHaveLength(before)
  expect(await said(page)).toBe('')

  await select(page, own[0])
  await page.keyboard.press('ControlOrMeta+d')
  // R-210: Layers follows the canvas a frame later — the check waits for it, and checks nothing different
  await expect.poll(async () => (await rows(page)).all).toHaveLength(before + 1)
  expect(await said(page)).toMatch(/duplicated/)

  // DW-205 (Story 5.24e): the SAME sentence again is heard again — a new node in the polite region. Setting a region's
  // words to what they already were changes nothing a screen reader can hear, which is how the second ⌘D was silent
  await page.evaluate(() => {
    window.__saidNodes = 0
    new MutationObserver((records) => {
      for (const r of records) window.__saidNodes += r.addedNodes.length
    }).observe(document.getElementById('editor-said'), { childList: true, subtree: true, characterData: true })
  })
  const first = await said(page)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+d')
  await expect.poll(async () => (await rows(page)).all).toHaveLength(before + 2)
  expect(await said(page), 'the control: the second ⌘D says exactly what the first did').toBe(first)
  // ONE new node — the sentence's own — and no more: a repeat is one announcement, never a burst
  await expect.poll(() => page.evaluate(() => window.__saidNodes), { message: 'and the region gained a node, so it is announced' }).toBe(1)
  await page.waitForTimeout(300)
  expect(await page.evaluate(() => window.__saidNodes), 'exactly one').toBe(1)

  // a site-wide section is ONE shared instance: its key does nothing, exactly as its row carries no Duplicate
  await select(page, site[0])
  const held = (await rows(page)).all.length
  await page.keyboard.press('ControlOrMeta+d')
  await panelsSettle(page)
  expect((await rows(page)).all).toHaveLength(held)
})

test('Del removes the selection, and a site-wide one asks first with focus on Cancel (R-115)', async ({ page }) => {
  await open(page)
  const { page: own, site } = await rows(page)

  await page.locator('section[aria-label="Canvas"]').focus()
  const before = (await rows(page)).all.length
  await page.keyboard.press('Delete')
  await panelsSettle(page)
  expect((await rows(page)).all, 'nothing selected, nothing removed').toHaveLength(before)

  await select(page, own[0])
  await page.keyboard.press('Delete')
  // R-210: Layers follows the canvas a frame later — each check waits for it, and checks nothing different
  await expect.poll(async () => (await rows(page)).all).toHaveLength(before - 1)
  expect(await said(page)).toMatch(/removed/)
  // ⌘Z puts it back exactly, which is Story 5.8's promise and this key's control
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(async () => (await rows(page)).all).toHaveLength(before)
  // AC3: ⇧⌘Z is found passing on the same walk — it takes the section away again, and ⌘Z brings it back
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect.poll(async () => (await rows(page)).all).toHaveLength(before - 1)
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(async () => (await rows(page)).all).toHaveLength(before)

  await select(page, site[0])
  await page.keyboard.press('Delete')
  const confirm = page.locator('dialog[aria-labelledby="editor-sitewide-title"]')
  await expect(confirm).toBeVisible()
  await expect(page.locator('dialog[open] [data-cancel]')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(confirm).toBeHidden()
  await panelsSettle(page)
  expect((await rows(page)).all, 'Cancel leaves the doc untouched').toHaveLength(before)
})

// ── WCAG 2.1.4, and it is the single most important stop on this walk ───────────────────────────────────────────

test('UX-DR11: typing "dark" into a headline on the canvas changes nothing but the headline', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])
  const device = await deviceOf(page)

  await caretIntoCanvas(page)
  await page.keyboard.type('dark')
  expect(await modeOf(page), 'the canvas must not flip while the word "dark" is typed').toBe('light')
  expect(await deviceOf(page), 'and the device must not change').toBe(device)

  await page.keyboard.type('123.?l')
  expect(await modeOf(page)).toBe('light')
  expect(await deviceOf(page)).toBe(device)
  expect(await page.locator('#editor-layers').isVisible(), 'L must not fold Layers while typing').toBe(true)
})

test('UX-DR11: the same keys typed into a PANEL field are characters and nothing else', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])
  await openGroup(page)
  const field = page.locator('#editor-controls input[type="text"]:visible').first()
  await field.focus()
  await expect(field, 'a field nothing focused would prove nothing').toBeFocused()
  const was = await field.inputValue()
  await page.keyboard.type('.1l')
  expect(await modeOf(page)).toBe('light')
  await expect(field).toHaveValue(`${was}.1l`)
})

test('a key pressed with a menu open belongs to the menu', async ({ page }) => {
  await open(page)
  const { all } = await rows(page)
  const more = page.locator(`[data-layer-row="${all[0]}"] button[aria-label^="More for"]`)
  await more.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator(':popover-open')).toBeVisible()
  await page.keyboard.press('.')
  expect(await modeOf(page), 'the menu owns the key while it is up').toBe('light')
  await page.keyboard.press('Escape')
  await expect(page.locator(':popover-open')).toHaveCount(0)
})

// ── the Esc ladder, three rungs ─────────────────────────────────────────────────────────────────────────────────

test('§7.3(1): Esc steps outward one rung per press, and each says where it landed', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])

  // RUNG 1 — the caret in a text prop: editing ends and the section STAYS selected (Story 5.3, already built). Driven
  // through the panel's rich Text Area, which is the keyboard's way into a text prop and runs the same controller.
  await openGroup(page)
  const rich = page.locator('#editor-controls [contenteditable="true"]').first()
  await rich.focus()
  await page.keyboard.type('x')
  await page.keyboard.press('Escape')
  await chosen(page, own[0])

  // and the same key with the caret in the CANVAS document leaves the selection alone too
  await caretIntoCanvas(page)
  await page.keyboard.press('Escape')
  await chosen(page, own[0])

  // RUNG 2 — a selection, not editing: deselected, and focus RESTS on the canvas container
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Escape')
  await expect(page.locator(`[data-layer-row="${own[0]}"]`)).not.toHaveClass(/bg-coral-tint/)
  await expect(page.locator('#editor-controls')).toHaveAttribute('aria-label', 'Page settings')
  expect(await focused(page)).toBe('SECTION[Canvas]')
  expect(await said(page)).toMatch(/Nothing selected/i)

  // RUNG 3 — the container, nothing selected: focus leaves the canvas for the chrome
  await page.keyboard.press('Escape')
  expect(await focused(page)).toBe('BUTTON[Collapse controls]')
  expect(await said(page)).toMatch(/Focus left/i)

  // and from the chrome there is nothing left to step out of
  await page.keyboard.press('Escape')
  expect(await focused(page)).toBe('BUTTON[Collapse controls]')
})

// ── Story 6.2 — S4a's Style Pack card and S7a's roster, looking only ──────────────────────────────────────────────────

test('6.2 · Tab reaches Change on the rest panel, Enter opens the presets with the current one named, and Back and Esc return to Change', async ({ page }) => {
  await open(page)
  // the presets as the library holds them — read off its data, never a list or a count written here (standing rule 4)
  const presets = JSON.parse(readFileSync(fileURLToPath(new URL('../../packages/library/packs/packs.json', import.meta.url)), 'utf8')).presets
  const panel = page.locator('#editor-controls')
  await expect(panel).toHaveAttribute('aria-label', 'Page settings')
  await expect(panel.locator('[data-style-pack-card]')).toContainText(presets[0].name)
  await expect(panel.getByText('Nothing selected')).toBeVisible()

  // the panel's first stop is its fold; the next is Change
  await page.locator('#editor-controls [aria-label="Collapse controls"]').focus()
  await page.keyboard.press('Tab')
  const change = page.locator('#style-pack-change')
  await expect(change).toBeFocused()
  await page.keyboard.press('Enter')

  // S7a: the back button takes the focus, the head reads Style Pack, and every preset is a cell in §D.d's order
  await expect(page.locator('#style-pack-back')).toBeFocused()
  await expect(page.locator('#editor-panel-name')).toHaveText('Style Pack')
  const cells = panel.locator('[data-style-pack-roster] [data-style-pack]')
  await expect(cells).toHaveCount(presets.length)
  expect(await cells.evaluateAll((els) => els.map((e) => e.dataset.stylePack))).toEqual(presets.map((p) => p.id))
  // the current one — the harness's project is a fresh one, Paper — is named "Current", and no other is
  const named = cells.filter({ hasText: 'Current' })
  await expect(named).toHaveCount(1)
  await expect(named).toHaveAttribute('data-style-pack', 'paper')
  // Story 6.3: the cells switch, and the list is ONE tab stop — the pack in force (the design ring's pattern). Story 6.4:
  // the LISTBOX is — its Edit pack doors, "+ New pack" and the rows are stops of their own, after it
  expect(await stopsIn(page, '[data-style-pack-roster] [role="listbox"]')).toBe(1)

  // the back button returns, focus on Change
  await page.locator('#style-pack-back').focus()
  await page.keyboard.press('Enter')
  await expect(change).toBeFocused()
  await expect(panel.locator('[data-style-pack-roster]')).toHaveCount(0)
  await expect(page.locator('#editor-panel-name')).toHaveText('Page')

  // and so does Esc, from anywhere in the list — and the ladder takes nothing from that press
  await page.keyboard.press('Enter')
  await expect(page.locator('#style-pack-back')).toBeFocused()
  await expect(panel).toHaveAttribute('aria-label', 'Style Pack')
  await page.keyboard.press('Escape')
  await expect(change).toBeFocused()
  await expect(panel.locator('[data-style-pack-card]')).toBeVisible()
  // from OUTSIDE the panel too (review): focus soon leaves the list — the Layers list here
  await page.keyboard.press('Enter')
  await expect(page.locator('#style-pack-back')).toBeFocused()
  await page.locator('[data-layer-row]').first().focus()
  await page.keyboard.press('Escape')
  await expect(change).toBeFocused()
  await expect(panel.locator('[data-style-pack-roster]')).toHaveCount(0)

  // reading along (R-192): the list is a view, so Change still opens it while another window holds the lock
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-lock': 'reader' })
  await open(page)
  await expect(page.locator('#editor-add-section'), 'the control: this window really is reading along').toBeDisabled()
  await expect(change).toBeEnabled()
  await change.focus()
  await page.keyboard.press('Enter')
  await expect(cells).toHaveCount(presets.length)
  // Story 6.3 (R-192): and every cell is greyed and unclickable — the list is a view, choosing is an edit
  // (a fieldset's `disabled` reaches each cell — `:disabled`, and out of the Tab order — never its own `disabled` property)
  for (const cell of await cells.all()) await expect(cell).toBeDisabled()
})

// ── Story 6.3 — the pack-switcher moment (S7b, FR-E2, FR-D9, UX-DR12, UX-DR15) ───────────────────────────────────────────

const PACK = await import(new URL('../../apps/web/lib/pack-switch.ts', import.meta.url).href)
const REMIX = await import(new URL('../../apps/web/lib/remix.ts', import.meta.url).href)
/** the presets as the library holds them, in §D.d's order — read off its data, never a list or a count written here */
const PRESETS = () => JSON.parse(readFileSync(fileURLToPath(new URL('../../packages/library/packs/packs.json', import.meta.url)), 'utf8')).presets
const presetOf = (id) => PRESETS().find((p) => p.id === id)

/** the pack the canvas WEARS, as the frame says once a switch has landed, and the token its `<html>` resolves */
const wears = (page) => page.locator('iframe[title$="canvas"]').getAttribute('data-pack')
const bgPage = (page) =>
  page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html) => getComputedStyle(html).getPropertyValue('--bg-page').trim().toUpperCase())

/** EVERY VIEW TRANSITION THE CANVAS DOCUMENT RUNS, recorded as it becomes ready: each animation the browser runs on its
 *  pseudo-elements, by pseudo-element and duration. A wrapper installed on the canvas document itself, where the editor
 *  calls it, so the transition is the browser's own — or `skipped` where a later press superseded it. */
const recordTransitions = (page) =>
  page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html) => {
    const doc = html.ownerDocument
    const win = doc.defaultView
    const real = doc.startViewTransition.bind(doc)
    win.__transitions = []
    doc.startViewTransition = (update) => {
      const t = real(update)
      const seen = { animations: null, finished: false }
      win.__transitions.push(seen)
      t.ready.then(
        () => {
          seen.animations = doc.getAnimations().filter((a) => /view-transition/.test(a.effect?.pseudoElement ?? '')).map((a) => ({ pseudo: a.effect.pseudoElement, duration: a.effect.getTiming().duration }))
        },
        () => {
          seen.animations = 'skipped'
        },
      )
      t.finished.then(() => {
        seen.finished = true
      })
      return t
    }
  })
const transitions = (page) => page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html) => html.ownerDocument.defaultView.__transitions)

/** The list opened from Change, and focus walked by Tab onto its ONE stop — the pack in force */
async function intoList(page) {
  await page.locator('#style-pack-change').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#style-pack-back')).toBeFocused()
  for (let n = 0; n < 3; n++) {
    if (await page.evaluate(() => document.activeElement?.getAttribute('aria-selected') === 'true')) return
    await page.keyboard.press('Tab')
  }
  expect(await page.evaluate(() => document.activeElement?.closest('[data-style-pack-roster]') !== null), 'Tab never reached the list').toBe(true)
}
const option = (page, id) => page.locator(`#editor-controls [data-style-pack="${id}"]`)
const undoArrow = (page) => page.locator('#editor-undo')

test('6.3 · the list from the keyboard: the arrows move focus and switch nothing, Enter crossfades the canvas in 300 ms behind S7b\'s pill and says the pack; ⌘Z and ⇧⌘Z', async ({ page }) => {
  await open(page)
  const [paper, target] = [PRESETS()[0], PRESETS()[3]]
  expect(await wears(page), 'the harness opens on Paper').toBe(paper.id)
  expect(await bgPage(page)).toBe(paper.light.background.toUpperCase())
  await intoList(page)
  await expect(option(page, paper.id)).toBeFocused()
  // ↓ is one row down the three columns: focus moves, nothing is chosen, nothing is journaled (an arrow is never an edit)
  await page.keyboard.press('ArrowDown')
  await expect(option(page, target.id)).toBeFocused()
  await expect(option(page, paper.id)).toHaveAttribute('aria-selected', 'true')
  await expect(undoArrow(page), 'the control: no edit was made by an arrow').toHaveAttribute('aria-disabled', 'true')
  expect(await wears(page)).toBe(paper.id)

  await recordTransitions(page)
  await page.keyboard.press('Enter')
  // S7b: from the press the pill names the pack being tried on, and the panel already shows it Current, ringed
  await expect(page.locator('[data-pack-pill]')).toHaveText(PACK.PACK_WORDS.trying(target.name))
  await expect(page.locator('[data-pack-pill]')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('[data-style-pack-current]')).toContainText(target.name)
  await expect(option(page, target.id)).toHaveAttribute('aria-selected', 'true')
  await expect(option(page, target.id).filter({ hasText: 'Current' })).toHaveCount(1)
  // …and once landed the canvas wears it, the pill has gone and `#editor-said` says which pack is on (UX-DR12)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', target.id)
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(target.name))
  await expect(page.locator('[data-pack-pill]')).toHaveCount(0)
  expect(await bgPage(page), "the canvas's own token is the pack's").toBe(target.light.background.toUpperCase())
  // ONE view transition of the canvas document itself, every animation on its three pseudo-elements 300 ms (FR-E2)
  const [run, ...more] = await transitions(page)
  expect(more, 'one press, one transition').toEqual([])
  expect(run.finished).toBe(true)
  expect(new Set(run.animations.map((a) => a.pseudo)), 'the old picture fades under the new across the whole canvas').toEqual(
    new Set(['::view-transition-group(root)', '::view-transition-old(root)', '::view-transition-new(root)']),
  )
  for (const a of run.animations) expect(a.duration, a.pseudo).toBe(300)
  // the switch keys its rules on the canvas's <html> for the switch alone: at rest the document carries nothing
  expect(await page.frameLocator('iframe[title$="canvas"]').locator('html').getAttribute('data-inflozo-switching')).toBe(null)
  // the list's one stop followed the pack in force
  expect(await stopsIn(page, '[data-style-pack-roster] [role="listbox"]')).toBe(1)
  await expect(option(page, target.id)).toHaveAttribute('tabindex', '0')

  // the pack in force pressed again: nothing — no entry, no pill, no word
  const before = await transitions(page)
  await page.keyboard.press('Enter')
  await panelsSettle(page)
  expect(await transitions(page)).toEqual(before)
  // ONE edit: one ⌘Z takes it back to Paper, crossfaded and said; ⇧⌘Z brings it forward the same way
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', paper.id)
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(paper.name))
  await expect(page.locator('[data-style-pack-current]')).toContainText(paper.name)
  await expect(undoArrow(page), 'one switch was one edit').toHaveAttribute('aria-disabled', 'true')
  expect(await bgPage(page)).toBe(paper.light.background.toUpperCase())
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', target.id)
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(target.name))
  expect((await transitions(page)).length, 'the undo and the redo crossfade too').toBe(3)
})

test('6.3 · two quick presses: the canvas lands on the second, never on the first after it, and says only the second', async ({ page }) => {
  await open(page)
  const [, first, , second] = PRESETS()
  await intoList(page)
  await recordTransitions(page)
  // → and Enter, then → → and Enter, before the first has landed
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(option(page, second.id)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(second.name))
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', second.id)
  await expect(page.locator('[data-pack-pill]')).toHaveCount(0)
  await panelsSettle(page)
  expect(await wears(page)).toBe(second.id)
  expect(await bgPage(page)).toBe(second.light.background.toUpperCase())
  expect(await page.locator('#editor-said').innerText(), 'one announcement, the second\'s').toBe(PACK.PACK_WORDS.said(second.name))
  // two edits: two ⌘Z, the first back to the first pack
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', first.id)
})

test('6.3 · prefers-reduced-motion: the same switch, instant — no animation runs — and the same announcement (UX-DR15)', async ({ page }) => {
  await open(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((h) => h.ownerDocument.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches), 'the control: the canvas document is asked for less motion').toBe(true)
  const target = PRESETS()[1]
  await intoList(page)
  await recordTransitions(page)
  await page.keyboard.press('ArrowRight')
  await expect(option(page, target.id)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(target.name))
  expect(await bgPage(page)).toBe(target.light.background.toUpperCase())
  const [run] = await transitions(page)
  expect(run.animations, 'the canvas sheet\'s degrade: the three pseudo-elements run no animation').toEqual([])
})

test('6.3 · a switch is kept on this device with the docs: a reload opens in it, silently, and ⌘Z still undoes it (§AD1.1)', async ({ page }) => {
  const PROJECT = '00000000-0000-4000-8000-000000000009'
  await open(page)
  const [paper, , , target] = PRESETS()
  await intoList(page)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(target.name))
  // the device's record holds the pack beside the docs (the harness has no database, so it is owed and never sent)
  const heldPack = () => page.evaluate((id) => new Promise((resolve) => {
    const req = indexedDB.open('inflozo-doc-harness')
    req.onerror = () => resolve(null)
    req.onsuccess = () => {
      const get = req.result.transaction('meta', 'readonly').objectStore('meta').get(id)
      get.onsuccess = () => { req.result.close(); resolve(get.result?.preset ?? null) }
      get.onerror = () => { req.result.close(); resolve(null) }
    }
  }), PROJECT)
  await expect.poll(heldPack, 'the switch is written to the device').toBe(target.id)
  await page.reload()
  await expect(page.frameLocator('iframe[title$="canvas"]').locator('#canvas > *').first()).toBeVisible()
  // asked for in the server's pack (Paper's address), and corrected to the device's at once — a correction says nothing
  expect(await page.locator('iframe[title$="canvas"]').getAttribute('src')).not.toContain('pack=')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', target.id)
  expect(await bgPage(page)).toBe(target.light.background.toUpperCase())
  await expect(page.locator('[data-style-pack-card]')).toContainText(target.name)
  expect(await page.locator('#editor-said').innerText(), 'a hydrate\'s correction is silent').not.toContain(PACK.PACK_WORDS.name)
  await expect(page.locator('[data-pack-pill]')).toHaveCount(0)
  // the journal came back with it: one ⌘Z is the switch
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', paper.id)
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(paper.name))
})

test('6.3 · a browser without View Transitions gets the same switch, instant, and the same announcement — never a removed affordance', async ({ page }) => {
  await open(page)
  const target = PRESETS()[1]
  // the API taken away on the canvas document, where the editor asks for it
  await page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html) => {
    html.ownerDocument.startViewTransition = undefined
  })
  await intoList(page)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', target.id)
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(target.name))
  expect(await bgPage(page)).toBe(target.light.background.toUpperCase())
  await expect(page.locator('[data-pack-pill]')).toHaveCount(0)
})

test('6.3 · a project stored in Mono opens in Mono (DW-325): the card, the list, the canvas, the swatches and a Section Picker card', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-pack': 'mono' })
  await open(page)
  const mono = presetOf('mono')
  await expect(page.locator('[data-style-pack-card]')).toContainText(mono.name)
  // the canvas document was ASKED FOR in Mono (Paper's address never carries a pack), and wears it
  expect(await page.locator('iframe[title$="canvas"]').getAttribute('src')).toContain('pack=mono')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', 'mono')
  expect(await bgPage(page)).toBe(mono.light.background.toUpperCase())
  await intoList(page)
  await expect(option(page, 'mono')).toHaveAttribute('aria-selected', 'true')
  await expect(option(page, 'mono')).toBeFocused()
  await page.keyboard.press('Escape')
  // the Background role's dots are Mono's: each the canvas's own token for its role
  await select(page, (await rows(page)).page[0])
  await openEveryGroup(page)
  const dots = await page.evaluate((tokens) => {
    const doc = document.querySelector('iframe[title$="canvas"]').contentDocument
    const probe = document.createElement('span')
    document.body.append(probe)
    const norm = (c) => {
      probe.style.color = ''
      probe.style.color = c.trim()
      return getComputedStyle(probe).color
    }
    const group = [...document.querySelectorAll('#editor-controls [role="radiogroup"]')]
      .find((g) => /Background/.test(document.getElementById(g.getAttribute('aria-labelledby'))?.textContent ?? ''))
    const out = [...(group?.querySelectorAll('[role="radio"][data-role]') ?? [])]
      .filter((b) => tokens[b.dataset.role] !== undefined)
      .map((b) => ({ role: b.dataset.role, dot: norm(getComputedStyle(b.querySelector('span')).backgroundColor), canvas: norm(getComputedStyle(doc.documentElement).getPropertyValue(tokens[b.dataset.role])) }))
    probe.remove()
    return out
  }, REVIEW.ROLE_TOKENS)
  expect(dots.length, 'the control: the role offers coloured dots').toBeGreaterThan(1)
  for (const d of dots) expect(d.dot, d.role).toBe(d.canvas)
  // review, 2026-10-04 — the design ring's tiles wear Mono too (they had no check: `pack` taken off the picker stayed green)
  await selectRinged(page)
  await expect(page.locator('#editor-design iframe').first()).toHaveAttribute('src', /pack=mono/)
  // a Section Picker card wears Mono too: its frame is asked for in Mono and resolves Mono's token
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  const card = page.locator('dialog[open] iframe').first()
  await expect(card).toHaveAttribute('src', /pack=mono/)
  // null-safe (review, 2026-10-04): a card's frame has no document for a moment, and a throw inside `poll` is not retried
  await expect.poll(() => card.evaluate((f) => { const root = f.contentDocument?.documentElement; return root ? getComputedStyle(root).getPropertyValue('--bg-page').trim().toUpperCase() : '' })).toBe(mono.light.background.toUpperCase())
})

test('6.3 · Remix\'s Re-roll what (B8): Style Pack re-rolls the pack in one ⌘Z, Both re-rolls the designs and the pack in one ⌘Z', async ({ page }) => {
  await open(page)
  await selectRinged(page)
  const design = await designName(page).innerText()
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page)).toBeVisible()
  // B8's group: Style Pack · Designs · Both, opening on Designs where a ring moves, with no "Re-roll where" (R-161)
  const choices = remixDialog(page).locator('[data-remix-what] input[type="radio"]')
  expect(await choices.evaluateAll((els) => els.map((e) => e.value))).toEqual(REMIX.REMIX_CHOICES.map((c) => c.value))
  await expect(remixDialog(page).locator('[data-remix-what] legend')).toHaveText(REMIX.REROLL_WHAT)
  await expect(remixDialog(page).locator('[data-remix-choice]')).toHaveText(REMIX.REMIX_CHOICES.map((c) => c.label))
  await expect(remixDialog(page).locator('input[value="designs"]')).toBeChecked()
  await expect(remixDialog(page)).not.toContainText(/Every page|header and footer|Re-roll where/i)
  // the group is one stop before the buttons: Shift+Tab from Cancel reaches the checked card, ← chooses Style Pack
  await page.keyboard.press('Shift+Tab')
  await expect(remixDialog(page).locator('input[value="designs"]')).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(remixDialog(page).locator('input[value="pack"]')).toBeChecked()
  await expect(page.locator('#editor-remix-body'), 'the sentence follows the choice').toHaveText(REMIX.remixPackAsk)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(page.locator('[data-remix-go]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-said')).toHaveText(/^Remixed the Style Pack — .+\.$/)
  const pack = await wears(page)
  expect(pack, 'a different pack').not.toBe(PRESETS()[0].id)
  expect(await page.locator('#editor-said').innerText()).toBe(REMIX.remixPackSaid(presetOf(pack).name))
  await expect(designName(page), 'every section keeps its design').toHaveText(design)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', PRESETS()[0].id)
  await expect(undoArrow(page), 'one re-roll, one ⌘Z').toHaveAttribute('aria-disabled', 'true')

  // BOTH — the designs and the pack in ONE transaction: one press, one ⌘Z puts both back
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page).locator('input[value="designs"]')).toBeChecked()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('ArrowRight')
  await expect(remixDialog(page).locator('input[value="both"]')).toBeChecked()
  await expect(page.locator('#editor-remix-body')).toHaveText(/^Re-rolls the Style Pack, and [1-9]\d* sections? on Home to a different design in its own category\. Your text, images and settings stay\.$/)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-said')).toHaveText(/^Remixed the Style Pack — .+ — and [1-9]\d* sections? on Home\.$/)
  await expect(designName(page)).not.toHaveText(design)
  expect(await wears(page)).not.toBe(PRESETS()[0].id)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', PRESETS()[0].id)
  await expect(designName(page), 'one ⌘Z restores both').toHaveText(design)
  await expect(undoArrow(page), 'Both was one edit').toHaveAttribute('aria-disabled', 'true')
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect(designName(page), 'and one ⇧⌘Z takes both forward').not.toHaveText(design)
  // polled (review, 2026-10-04): the docs repaint in the redo's own task, the pack is worn inside the view transition's
  // update a frame later — read at once it was still Paper on CI (run 37178794057)
  await expect.poll(() => wears(page)).not.toBe(PRESETS()[0].id)
})

test('6.3 · Remix where no ring moves (the Post canvas): Re-roll what opens on Style Pack, Designs and Both greyed with the reason, Remix live, one ⌘Z', async ({ page }) => {
  await page.goto(`${HARNESS}/post`)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  const paper = PRESETS()[0]
  expect(await wears(page)).toBe(paper.id)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page)).toBeVisible()
  await expect(remixDialog(page).locator('input[value="pack"]'), 'nothing here has a second design, so the pack is chosen').toBeChecked()
  for (const value of ['designs', 'both']) {
    await expect(remixDialog(page).locator(`input[value="${value}"]`)).toBeDisabled()
    await expect(remixDialog(page).locator(`[data-remix-choice="${value}"]`)).toHaveAttribute('aria-disabled', 'true')
  }
  // greyed WITH the reason (UX-DR3), and the group is described by it
  await expect(remixDialog(page).locator('#editor-remix-what-reason')).toHaveText(REMIX.NO_RING_MOVES)
  await expect(remixDialog(page).locator('[data-remix-what]')).toHaveAttribute('aria-describedby', 'editor-remix-what-reason')
  await expect(page.locator('#editor-remix-body')).toHaveText(REMIX.remixPackAsk)
  // Remix is live: the confirm opens on Cancel, and Tab reaches it
  await expect(page.locator('dialog[open] [data-cancel]')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.locator('[data-remix-go]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-said')).toHaveText(/^Remixed the Style Pack — .+\.$/)
  const pack = await wears(page)
  expect(pack, 'a different pack').not.toBe(paper.id)
  expect(await page.locator('#editor-said').innerText()).toBe(REMIX.remixPackSaid(presetOf(pack).name))
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', paper.id)
  await expect(undoArrow(page), 'one re-roll, one ⌘Z').toHaveAttribute('aria-disabled', 'true')
})

/** A FACE THAT TAKES `ms` TO ARRIVE: every `?font=` request held that long (routing also turns the HTTP cache off, so no
 *  face can skip it), and the canvas document's view transitions timed — when each was asked for, when its picture was
 *  ready to animate, whether the new pack's families were in at that moment (`document.fonts.check` over the families the
 *  `1b-faces` rules declare, latin text) and whether S7b's pill was still up. */
async function holdFaces(page, ms) {
  await page.route((url) => url.searchParams.has('font'), async (route) => {
    await new Promise((done) => setTimeout(done, ms))
    await route.continue()
  })
}
const facesIn = (doc) =>
  [...new Set([...(doc.querySelector('style[data-order="1b-faces"]')?.textContent ?? '').matchAll(/font-family:\s*'([^']+)'/g)].map((m) => m[1]))]
    .every((family) => doc.fonts.check(`16px '${family}'`, 'Ag'))
const timeTransitions = (page) =>
  page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html, facesInSource) => {
    const doc = html.ownerDocument
    const win = doc.defaultView
    const facesIn = new Function(`return (${facesInSource})`)()
    const real = doc.startViewTransition.bind(doc)
    win.__timed = []
    doc.startViewTransition = (update) => {
      const seen = { asked: win.performance.now(), ready: null, faces: null, pill: null }
      win.__timed.push(seen)
      const t = real(update)
      t.ready.then(
        () => {
          seen.ready = win.performance.now()
          seen.faces = facesIn(doc)
          seen.pill = win.parent.document.querySelector('[data-pack-pill]') !== null
        },
        () => {
          seen.ready = 'skipped'
        },
      )
      return t
    }
  }, facesIn.toString())
const timed = (page) => page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html) => html.ownerDocument.defaultView.__timed)

test('6.3 · a pack this browser has never drawn: the canvas holds its picture while the faces load, the pill up, then crossfades in them', async ({ page }) => {
  await open(page)
  const target = PRESETS()[1]
  const HOLD = 500
  expect(HOLD, 'the control: this hold is inside the wait').toBeLessThan(PACK.FACES_WAIT_MS)
  await holdFaces(page, HOLD)
  await intoList(page)
  await timeTransitions(page)
  await page.keyboard.press('ArrowRight')
  await expect(option(page, target.id)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-pack-pill]')).toHaveText(PACK.PACK_WORDS.trying(target.name))
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(target.name))
  const [run, ...more] = await timed(page)
  expect(more, 'one press, one transition').toEqual([])
  expect(run.ready - run.asked, 'the old picture was held while the faces loaded').toBeGreaterThanOrEqual(HOLD - 50)
  expect(run.faces, 'the crossfade began in the new pack\'s faces').toBe(true)
  expect(run.pill, 'S7b\'s pill stood the whole wait').toBe(true)
  expect(await bgPage(page)).toBe(target.light.background.toUpperCase())
})

test('6.3 · faces slower than FACES_WAIT_MS: the crossfade goes on without them and a late face swaps in on arrival', async ({ page }) => {
  await open(page)
  const target = PRESETS()[1]
  const HOLD = PACK.FACES_WAIT_MS * 3
  await holdFaces(page, HOLD)
  await intoList(page)
  await timeTransitions(page)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(target.name))
  const [run] = await timed(page)
  expect(run.ready - run.asked, 'it waited FACES_WAIT_MS').toBeGreaterThanOrEqual(PACK.FACES_WAIT_MS - 50)
  expect(run.ready - run.asked, 'and went on long before the faces came').toBeLessThan(HOLD - PACK.FACES_WAIT_MS / 2)
  expect(run.faces, 'the control: the faces were NOT in when it went on').toBe(false)
  await expect(page.locator('[data-pack-pill]')).toHaveCount(0)
  expect(await bgPage(page)).toBe(target.light.background.toUpperCase())
  // `font-display: swap`: the late face arrives and is drawn, with no second switch
  await expect
    .poll(() => page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html, src) => new Function(`return (${src})`)()(html.ownerDocument), facesIn.toString()), { timeout: HOLD * 2 })
    .toBe(true)
  expect((await timed(page)).length, 'one transition, no second').toBe(1)
})

// ── Story 6.4 — editing a pack (FR-E3; S7a's pencils and rows, S7c, S7d; R-236, R-237) ────────────────────────────────────

const EDIT = await import(new URL('../../apps/web/lib/pack-edit.ts', import.meta.url).href)
const TOKENS = await import(new URL('../../packages/section-runtime/src/tokens.ts', import.meta.url).href)
/** the one word list (R-170): every sentence and name below is the app's own */
const W = EDIT.PACK_EDIT_WORDS
/** the font pool as built — its pairings and their families, read off its data, never written here */
const POOL = () => JSON.parse(readFileSync(fileURLToPath(new URL('../../packages/library/fonts/pool.json', import.meta.url)), 'utf8'))
/** a preset's authored record, as `packs.json` holds it without its id — what Edit pack opens on */
const recordOf = (id) => {
  const { id: _id, ...record } = presetOf(id)
  return record
}
/** the canvas document's own value for one token */
const tokenOf = (page, name) =>
  page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html, n) => getComputedStyle(html).getPropertyValue(n).trim(), name)
const packEditor = (page) => page.locator('dialog[data-pack-editor][open]')
const swatchOf = (page, mode, role) => page.locator(`[data-swatch="${mode}-${role}"]`)
const pickerOf = (page) => page.locator('#pack-picker')
const door = (page, id) => page.locator(`[data-edit-pack="${id}"]`)
/** Tab, one stop at a time, until `locator` holds focus — within as many stops as the page has (counted off it) */
async function tabOnto(page, locator, back = false) {
  const budget = (await stopsIn(page, 'body')) + 2
  for (let n = 0; n < budget && !(await locator.evaluate((el) => el === document.activeElement)); n++) await page.keyboard.press(back ? 'Shift+Tab' : 'Tab')
  await expect(locator).toBeFocused()
}
/** Edit pack, opened from a pack's own door — reached by Tab from the list, never by a pointer */
async function intoEdit(page, id) {
  await intoList(page)
  await tabOnto(page, door(page, id))
  await page.keyboard.press('Enter')
  await expect(packEditor(page)).toBeVisible()
}
/** a colour typed into the picker of one swatch, applied with Enter, the picker closed with Esc. The Tab path into the
 *  swatches and the picker is the first 6.4 stop's; this enters it with `focus()`. */
async function typeHex(page, mode, role, hex) {
  await swatchOf(page, mode, role).focus()
  await page.keyboard.press('Enter')
  await expect(pickerOf(page)).toBeVisible()
  await expect(page.locator('#pack-picker-hex')).toBeFocused()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type(hex)
  await page.keyboard.press('Enter')
  await page.keyboard.press('Escape')
  await expect(pickerOf(page)).toBeHidden()
  await expect(swatchOf(page, mode, role)).toBeFocused()
}
const savePack = async (page) => {
  await page.locator('[data-save-pack]').focus()
  await page.keyboard.press('Enter')
}
/** the device's own record of the harness project, read once the editor has opened its database (IndexedDB is per origin,
 *  and the harness names its own): the own-pack map stored beside the docs, and how many transactions the journal holds */
const held = (page) =>
  page.evaluate((id) => new Promise((resolve, reject) => {
    const req = indexedDB.open('inflozo-doc-harness')
    req.onerror = () => reject(req.error)
    req.onsuccess = () => {
      const db = req.result
      const tx = db.transaction(['meta', 'journal'], 'readonly')
      const meta = tx.objectStore('meta').get(id)
      const entries = tx.objectStore('journal').index('byProject').count(id)
      tx.oncomplete = () => { db.close(); resolve({ packs: meta.result?.packs ?? {}, entries: entries.result }) }
      tx.onerror = () => { db.close(); reject(tx.error) }
    }
  }), '00000000-0000-4000-8000-000000000009')
/** a cell's or the Current card's accent dot, as drawn */
const accentDot = (root) => root.locator('span[aria-hidden] > span').nth(1).evaluate((s) => getComputedStyle(s).backgroundColor)

test('6.4 · Tab from the list reaches the pack\'s pencil; Edit pack opens on the first swatch; a swatch opens the picker, the hex field moves it, the square and the hue strip take the arrows; Esc closes the picker, then the dialog, focus back on the pencil', async ({ page }) => {
  await open(page)
  const paper = recordOf('paper')
  await intoList(page)
  await expect(option(page, 'paper')).toBeFocused()
  // the first stop after the list is the doors', the pack in force's own first — outside the listbox (an option holds none)
  await page.keyboard.press('Tab')
  await expect(door(page, 'paper')).toBeFocused()
  await expect(door(page, 'paper')).toHaveAccessibleName(W.edit(paper.name))
  expect(await page.locator('[data-style-pack-roster] [role="listbox"] :is(button:not([role="option"]), [data-edit-pack], #style-pack-new)').count(), 'no door inside the listbox').toBe(0)
  await page.keyboard.press('Enter')
  await expect(packEditor(page)).toBeVisible()
  await expect(page.locator('#pack-editor-title')).toHaveText(W.editTitle)
  await expect(page.locator('#pack-editor-subtitle')).toHaveText(W.editSubtitle)
  await expect(page.locator('#pack-name')).toHaveValue(paper.name)
  // focus starts on the first swatch, and the seven colours per mode are the one list's, Base first (R-237)
  await expect(swatchOf(page, 'light', 'background')).toBeFocused()
  await expect(swatchOf(page, 'light', 'background')).toHaveAccessibleName(W.swatch(W.roles.background, W.modes.light, paper.light.background, false))
  for (const mode of ['light', 'dark']) {
    const names = await packEditor(page).locator(`[data-swatch^="${mode}-"]`).evaluateAll((els) => els.map((e) => e.getAttribute('aria-label').split(',')[0]))
    expect(names, mode).toEqual(Object.values(W.roles))
  }
  // Tab walks the swatches in order — Base, Surface, Text, Muted, Border, then Accent
  for (let n = 0; n < Object.keys(W.roles).indexOf('accent'); n++) await page.keyboard.press('Tab')
  await expect(swatchOf(page, 'light', 'accent')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(pickerOf(page)).toBeVisible()
  const hex = page.locator('#pack-picker-hex')
  await expect(hex, 'the hex field is the exact path, and focus starts there').toBeFocused()
  await expect(hex).toHaveAccessibleName(W.hexField(W.roles.accent, W.modes.light))
  await expect(swatchOf(page, 'light', 'accent')).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('#1E6BFF')
  await expect(swatchOf(page, 'light', 'accent')).toHaveAccessibleName(W.swatch(W.roles.accent, W.modes.light, '#1E6BFF', false))
  // a colour that is not one is refused in words, and the swatch keeps its last valid colour
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('blue')
  await page.keyboard.press('Enter')
  await expect(page.locator('#pack-picker-hex-error')).toHaveText(W.notColour)
  await expect(swatchOf(page, 'light', 'accent')).toHaveAccessibleName(W.swatch(W.roles.accent, W.modes.light, '#1E6BFF', false))
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('#1af')
  await page.keyboard.press('Enter')
  await expect(hex, 'three digits are expanded').toHaveValue('#11AAFF')
  await expect(page.locator('#pack-picker-hex-error')).toHaveCount(0)
  // the hue strip and the square, a Shift+Tab and two back: 1 a press, 10 with ⇧
  await page.keyboard.press('Shift+Tab')
  const hue = page.locator('[data-picker-hue]')
  await expect(hue).toBeFocused()
  await expect(hue).toHaveAccessibleName(W.hue(W.roles.accent, W.modes.light))
  const h0 = Number(await hue.getAttribute('aria-valuenow'))
  await page.keyboard.press('ArrowRight')
  await expect(hue).toHaveAttribute('aria-valuenow', String(h0 + 1))
  await page.keyboard.press('Shift+ArrowRight')
  await expect(hue).toHaveAttribute('aria-valuenow', String(h0 + 11))
  await page.keyboard.press('Shift+Tab')
  const square = page.locator('[data-picker-square]')
  await expect(square).toBeFocused()
  await expect(square).toHaveAccessibleName(W.square(W.roles.accent, W.modes.light))
  const s0 = Number(await square.getAttribute('aria-valuenow'))
  await page.keyboard.press('ArrowLeft')
  await expect(square).toHaveAttribute('aria-valuenow', String(s0 - 1))
  const v0 = await square.getAttribute('aria-valuetext')
  await page.keyboard.press('ArrowDown')
  await expect(square).not.toHaveAttribute('aria-valuetext', v0)
  // the swatch and the field followed every move
  await expect(swatchOf(page, 'light', 'accent')).not.toHaveAccessibleName(/#11AAFF/)
  expect(await hex.inputValue()).toBe((await swatchOf(page, 'light', 'accent').getAttribute('aria-label')).split(', ')[2])
  // the first Esc closes the picker, focus back on its swatch; the second closes the dialog, focus back on the pencil
  await page.keyboard.press('Escape')
  await expect(pickerOf(page)).toBeHidden()
  await expect(packEditor(page)).toBeVisible()
  await expect(swatchOf(page, 'light', 'accent')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(packEditor(page)).toHaveCount(0)
  await expect(door(page, 'paper')).toBeFocused()
  // discarded: nothing journaled, and the canvas untouched
  await expect(undoArrow(page)).toHaveAttribute('aria-disabled', 'true')
  expect(await tokenOf(page, '--accent')).toBe(paper.light.accent)
})

test('6.4 · Save pack is ONE edit: the canvas\'s --accent restyles in place with no pill, "Changed Paper." once landed, the cell follows; ⌘Z and ⇧⌘Z follow; an unchanged draft saves nothing', async ({ page }) => {
  await open(page)
  const paper = recordOf('paper')
  await intoEdit(page, 'paper')
  await typeHex(page, 'light', 'accent', '#1E6BFF')
  await timeTransitions(page)
  await savePack(page)
  await expect(page.locator('#editor-said')).toHaveText(W.changed(paper.name))
  await expect(packEditor(page)).toHaveCount(0)
  await expect(door(page, 'paper')).toBeFocused()
  expect(await tokenOf(page, '--accent')).toBe('#1E6BFF')
  // IN PLACE: the same document at Paper's address, ONE crossfade — and S7b's pill, a switch's alone, never stood
  expect(await wears(page)).toBe('paper')
  expect(await page.locator('iframe[title$="canvas"]').getAttribute('src')).not.toContain('pack=')
  const [run, ...more] = await timed(page)
  expect(more, 'one edit, one restyle').toEqual([])
  expect(run.pill, 'an edit is no switch: no "Trying on…"').toBe(false)
  // Paper's cell and the Current card wear its own accent now
  expect(await accentDot(option(page, 'paper'))).toBe('rgb(30, 107, 255)')
  expect(await accentDot(page.locator('[data-style-pack-current]'))).toBe('rgb(30, 107, 255)')
  // one edit: ⌘Z puts Paper's own accent back and says the pack (the look in force changed); ⇧⌘Z blue again
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(paper.name))
  await expect.poll(() => tokenOf(page, '--accent')).toBe(paper.light.accent)
  await expect(undoArrow(page), 'a Save pack is one edit').toHaveAttribute('aria-disabled', 'true')
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect.poll(() => tokenOf(page, '--accent')).toBe('#1E6BFF')
  // saved again with nothing changed: it closes and makes no entry — the one ⌘Z is still the Save's, and the last
  await page.keyboard.press('Enter')
  await expect(packEditor(page)).toBeVisible()
  await savePack(page)
  await expect(packEditor(page)).toHaveCount(0)
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => tokenOf(page, '--accent'), 'the ⌘Z is still the Save\'s').toBe(paper.light.accent)
  await expect(undoArrow(page), 'the unchanged save made no entry').toHaveAttribute('aria-disabled', 'true')
})

test('6.4 · the warning: Text #DDDDDD raises it in words with each failing swatch marked, it is said once per change of pairs — never per move — and Save pack still saves', async ({ page }) => {
  await open(page)
  const paper = recordOf('paper')
  const hard = { ...paper, light: { ...paper.light, text: '#DDDDDD' } }
  await intoEdit(page, 'paper')
  await expect(page.locator('[data-pack-warning]'), 'the control: Paper reads').toHaveCount(0)
  await typeHex(page, 'light', 'text', '#DDDDDD')
  const words = W.warning(EDIT.hardToRead(hard))
  await expect(page.locator('[data-pack-warning]')).toHaveText(words)
  // in words, and a glyph and "hard to read" on the swatch — never colour alone (UX-DR8)
  await expect(swatchOf(page, 'light', 'text')).toHaveAccessibleName(W.swatch(W.roles.text, W.modes.light, '#DDDDDD', true))
  await expect(swatchOf(page, 'light', 'text').locator('[data-hard]')).toHaveCount(1)
  await expect(swatchOf(page, 'light', 'background').locator('[data-hard]')).toHaveCount(0)
  await expect(page.locator('[data-pack-warning-said]')).toHaveText(words)
  // LIVE, NOT CHATTY: ten moves through the square keep the same pairs failing — the banner follows each, the line says
  // nothing new (a polite region would otherwise read a ratio per move)
  await swatchOf(page, 'light', 'text').focus()
  await page.keyboard.press('Enter')
  await expect(pickerOf(page)).toBeVisible()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(page.locator('[data-picker-square]')).toBeFocused()
  await page.locator('[data-pack-warning-said]').evaluate((el) => {
    window.__said = 0
    new MutationObserver(() => (window.__said += 1)).observe(el, { childList: true, characterData: true, subtree: true })
  })
  const banner = await page.locator('[data-pack-warning]').innerText()
  for (let n = 0; n < 10; n++) await page.keyboard.press('ArrowDown')
  await expect(page.locator('[data-pack-warning]'), 'the banner follows the draft').not.toHaveText(banner)
  await expect(page.locator('[data-pack-warning]')).toContainText(W.pair(EDIT.hardToRead(hard)[0]).split(',')[0])
  expect(await page.evaluate(() => window.__said), 'said nothing while the same pairs failed').toBe(0)
  await page.keyboard.press('Escape')
  // Save pack stays live and saves: a warning, never a block
  await savePack(page)
  await expect(page.locator('#editor-said')).toHaveText(W.changed(paper.name))
  await expect(packEditor(page)).toHaveCount(0)
  expect(EDIT.hardToRead({ ...paper, light: { ...paper.light, text: await tokenOf(page, '--text-body') } }).length, 'what was saved is the hard-to-read text').toBeGreaterThan(0)
})

test('6.4 · an own pack\'s edit is kept on this device with the docs: a reload opens in it, silently, and ⌘Z still undoes it (§AD1.1)', async ({ page }) => {
  await open(page)
  const paper = recordOf('paper')
  await intoEdit(page, 'paper')
  await typeHex(page, 'light', 'accent', '#1E6BFF')
  await savePack(page)
  await expect(page.locator('#editor-said')).toHaveText(W.changed(paper.name))
  // the device's record holds the whole map beside the docs (the harness has no database, so it is owed and never sent)
  await expect.poll(async () => (await held(page)).packs.paper?.light?.accent, 'the edit is written to the device').toBe('#1E6BFF')
  await page.reload()
  await expect(page.frameLocator('iframe[title$="canvas"]').locator('#canvas > *').first()).toBeVisible()
  // asked for at Paper's address, and corrected to the device's own Paper at once — a correction says nothing
  await expect.poll(() => tokenOf(page, '--accent')).toBe('#1E6BFF')
  expect(await page.locator('#editor-said').innerText(), 'a hydrate\'s correction is silent').not.toContain(W.changed(paper.name))
  await expect(page.locator('[data-pack-pill]')).toHaveCount(0)
  // the journal came back with it: one ⌘Z is the edit
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => tokenOf(page, '--accent')).toBe(paper.light.accent)
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(paper.name))
})

test('6.4 · + New pack: it starts from the look in force; with no name it refuses; named, it joins the roster after the presets, ringed, and wears the canvas — ONE transaction, one ⌘Z removes it', async ({ page }) => {
  await open(page)
  const paper = recordOf('paper')
  await intoList(page)
  const create = page.locator('#style-pack-new')
  await tabOnto(page, create)
  await expect(create).toHaveAccessibleName(W.newPack)
  await page.keyboard.press('Enter')
  await expect(page.locator('#pack-editor-title')).toHaveText(W.newTitle)
  await expect(page.locator('#pack-editor-subtitle')).toHaveText(W.newSubtitle)
  const name = page.locator('#pack-name')
  await expect(name).toBeFocused()
  await expect(name).toHaveValue('')
  await expect(name).toHaveAttribute('placeholder', W.placeholder)
  await expect(swatchOf(page, 'light', 'accent'), 'the look in force').toHaveAccessibleName(W.swatch(W.roles.accent, W.modes.light, paper.light.accent, false))
  await expect(page.getByRole('button', { name: W.reset }), 'a pack the project makes has no defaults to reset to').toHaveCount(0)
  // no name, or only spaces: refused in the field's own words, focus back on it, nothing saved
  for (const typed of ['', '   ']) {
    await name.focus()
    await page.keyboard.press('ControlOrMeta+a')
    if (typed) await page.keyboard.type(typed)
    await savePack(page)
    await expect(page.locator('#pack-name-error')).toHaveText(W.nameNeeded)
    await expect(name).toBeFocused()
    await expect(packEditor(page)).toBeVisible()
  }
  await expect(undoArrow(page)).toHaveAttribute('aria-disabled', 'true')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('Studio Warm')
  await expect(page.locator('#pack-name-error'), 'typing clears the refusal').toHaveCount(0)
  await typeHex(page, 'light', 'background', '#FFF4EA')
  await savePack(page)
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said('Studio Warm'))
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', 'custom-1')
  expect(await bgPage(page)).toBe('#FFF4EA')
  // after the twelve, by number, ringed and Current
  const ids = await page.locator('#editor-controls [data-style-pack]').evaluateAll((els) => els.map((e) => e.dataset.stylePack))
  expect(ids).toEqual([...PRESETS().map((p) => p.id), 'custom-1'])
  await expect(option(page, 'custom-1')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('[data-style-pack-current]')).toContainText('Studio Warm')
  await expect(door(page, 'custom-1')).toHaveAccessibleName(W.edit('Studio Warm'))
  // its own door is the dashed name: it opens Edit pack with focus on Pack name, where renaming happens
  await door(page, 'custom-1').focus()
  await page.keyboard.press('Enter')
  await expect(name).toBeFocused()
  await expect(name).toHaveValue('Studio Warm')
  await page.keyboard.press('Escape')
  // ONE transaction: one ⌘Z removes the pack AND puts Paper back
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', 'paper')
  await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(paper.name))
  await expect(option(page, 'custom-1')).toHaveCount(0)
  await expect(undoArrow(page), 'the New pack was one edit').toHaveAttribute('aria-disabled', 'true')
  expect(await bgPage(page)).toBe(paper.light.background.toUpperCase())
})

test('6.4 · the rows are Appendix C\'s words; Site width → Wide moves --site-width in one edit; the pairing menu lists the pool and moves --font-heading once its faces are in', async ({ page }) => {
  await open(page)
  await intoList(page)
  // the titles and steps, in order — the one word list's (and `pack-edit.test.ts` holds that list to Appendix C)
  const groups = await page.locator('[data-style-pack-rows] [role="radiogroup"]').evaluateAll((gs) =>
    gs.map((g) => ({ title: document.getElementById(g.getAttribute('aria-labelledby')).textContent, steps: [...g.querySelectorAll('[role="radio"]')].map((r) => r.textContent) })))
  expect(groups).toEqual(W.rows.map((r) => ({ title: r.title, steps: Object.values(r.steps) })))
  await expect(page.locator('#style-pack-heading-font')).toContainText(W.headingFont)
  await expect(page.locator('#style-pack-body-font')).toContainText(W.bodyFont)
  await expect(page.locator('#style-pack-pill-label')).toHaveText(W.pillRadius)
  // Site width: its one stop is the step in force; → selects the next, one edit
  const width = W.rows.find((r) => r.key === 'width')
  await tabOnto(page, page.locator('#style-pack-width [role="radio"][aria-checked="true"]'))
  await expect(page.locator('#style-pack-width [aria-checked="true"]')).toHaveText(width.steps.normal)
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('#style-pack-width [aria-checked="true"]')).toHaveText(width.steps.wide)
  await expect(page.locator('#editor-said')).toHaveText(W.row(width.title, width.steps.wide))
  await expect.poll(() => tokenOf(page, '--site-width')).toBe(TOKENS.SCALES.width.wide)
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => tokenOf(page, '--site-width'), 'one press, one edit').toBe(TOKENS.SCALES.width.normal)
  await expect(undoArrow(page)).toHaveAttribute('aria-disabled', 'true')

  // the pairing menu, from Heading font: every pool pairing, "Ag" in its heading face, the one in force checked
  const pool = POOL()
  await tabOnto(page, page.locator('#style-pack-heading-font'), true)
  await page.keyboard.press('Enter')
  const menu = page.locator('#style-pack-pairings')
  await expect(menu).toBeVisible()
  await expect(menu.locator('ul')).toHaveAccessibleName(W.pairings)
  await expect(menu.locator('li')).toHaveCount(pool.pairings.length)
  await expect(menu.locator('[aria-current="true"]')).toBeFocused()
  await expect(menu.locator('[aria-current="true"]')).toContainText(pool.pairings.find((p) => p.id === presetOf('paper').pairing).heading.family)
  const lora = pool.pairings.find((p) => p.heading.family === 'Lora')
  const wanted = menu.locator('button').filter({ hasText: lora.heading.family })
  for (let n = 0; n < pool.pairings.length && !(await wanted.evaluate((el) => el === document.activeElement)); n++) await page.keyboard.press('ArrowDown')
  await expect(wanted).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-said')).toHaveText(W.pairing(lora.heading.family, lora.body.family))
  // once landed the canvas wears the pairing, its heading face is in, and both rows name it
  expect(await tokenOf(page, '--font-heading')).toBe(`'${lora.heading.family}', ${pool.families[lora.heading.family].fallback}`)
  await expect.poll(() => page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html, f) => html.ownerDocument.fonts.check(`16px '${f}'`, 'Ag'), lora.heading.family)).toBe(true)
  await expect(page.locator('#style-pack-heading-font')).toContainText(lora.heading.family)
  await expect(page.locator('#style-pack-body-font')).toContainText(lora.body.family)
  await expect(page.locator('#style-pack-heading-font')).toBeFocused()
})

test('6.4 · a project stored in a pack it made opens in it: the card, the list and the canvas (Paper\'s address, its own block before the first paint), and a Section Picker card wears it', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-pack': 'custom-1' })
  await open(page)
  const ocean = presetOf('ocean').light
  await expect(page.locator('[data-style-pack-card]')).toContainText('Harness Pack')
  expect(await page.locator('iframe[title$="canvas"]').getAttribute('src'), 'asked for at Paper\'s address').not.toContain('pack=')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', 'custom-1')
  expect(await tokenOf(page, '--accent')).toBe(ocean.accent)
  await intoList(page)
  await expect(option(page, 'custom-1')).toHaveAttribute('aria-selected', 'true')
  await expect(option(page, 'custom-1')).toBeFocused()
  await page.keyboard.press('Escape')
  // a Section Picker card is asked for at Paper's address and wears the pack's own tokens
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  const card = page.locator('dialog[open] iframe').first()
  await expect(card).not.toHaveAttribute('src', /pack=/)
  const cardToken = (name) => card.evaluate((f, n) => { const root = f.contentDocument?.documentElement; return root ? getComputedStyle(root).getPropertyValue(n).trim().toUpperCase() : '' }, name)
  await expect.poll(() => cardToken('--accent'), 'the control: the card is not Paper').toBe(ocean.accent.toUpperCase())
  await expect.poll(() => cardToken('--bg-page')).toBe(recordOf('paper').light.background.toUpperCase())
})

test('6.4 · reading along (R-192): every pencil, the custom name, "+ New pack", both font rows and every row are disabled, and nothing opens', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-lock': 'reader', 'x-inflozo-harness-pack': 'custom-1' })
  await open(page)
  await expect(page.locator('#editor-add-section'), 'the control: this window really is reading along').toBeDisabled()
  await page.locator('#style-pack-change').focus()
  await page.keyboard.press('Enter')
  const doors = page.locator('[data-edit-pack]')
  expect(await doors.count()).toBe(PRESETS().length + 1)
  for (const d of await doors.all()) await expect(d).toBeDisabled()
  await expect(page.locator('#style-pack-new')).toBeDisabled()
  await expect(page.locator('#style-pack-heading-font')).toBeDisabled()
  await expect(page.locator('#style-pack-body-font')).toBeDisabled()
  for (const r of await page.locator('[data-style-pack-rows] [role="radio"], #style-pack-pill button').all()) await expect(r).toBeDisabled()
  // and none of them is a stop: Tab passes the whole block by (`:disabled`, which a fieldset's disabling is — never the
  // element's own `disabled`, which stays false inside one)
  expect(await page.locator('[data-style-pack-roster]').evaluate((root) =>
    [...root.querySelectorAll('a[href], button, input, [tabindex]')].filter((el) => el.tabIndex >= 0 && !el.matches(':disabled') && el.checkVisibility()).length)).toBe(0)
  await expect(packEditor(page)).toHaveCount(0)
})

test('6.4 · prefers-reduced-motion: an edit restyles instantly — no animation runs — and says the same', async ({ page }) => {
  await open(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await intoList(page)
  await recordTransitions(page)
  const radius = W.rows.find((r) => r.key === 'radius')
  await tabOnto(page, page.locator('#style-pack-radius [role="radio"][aria-checked="true"]'))
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('#editor-said')).toHaveText(W.row(radius.title, radius.steps.round))
  await expect.poll(() => tokenOf(page, '--radius-card')).toBe(TOKENS.SCALES.radius.round)
  const [run] = await transitions(page)
  expect(run.animations, 'the canvas sheet\'s degrade: nothing animates').toEqual([])
})

test('6.4 · Edit another pack: Tangerine\'s pencil while Paper is in force — stored, its cell\'s dots take the colour, the canvas neither changes nor restyles, "Changed Tangerine.", and one ⌘Z', async ({ page }) => {
  await open(page)
  const [paper, tangerine] = [recordOf('paper'), recordOf('tangerine')]
  await intoList(page)
  const was = await accentDot(option(page, 'tangerine'))
  await tabOnto(page, door(page, 'tangerine'))
  await page.keyboard.press('Enter')
  await expect(packEditor(page)).toBeVisible()
  await expect(page.locator('#pack-name')).toHaveValue(tangerine.name)
  await typeHex(page, 'light', 'accent', '#1E6BFF')
  await recordTransitions(page)
  await savePack(page)
  await expect(page.locator('#editor-said')).toHaveText(W.changed(tangerine.name))
  await expect(packEditor(page)).toHaveCount(0)
  await expect(door(page, 'tangerine')).toBeFocused()
  await expect.poll(async () => (await held(page)).packs.tangerine?.light?.accent, 'packs.tangerine is stored').toBe('#1E6BFF')
  await expect.poll(() => accentDot(option(page, 'tangerine')), 'its cell\'s dots take the colour').toBe('rgb(30, 107, 255)')
  // the pack in force is still Paper: the canvas keeps Paper's accent, and no restyle ran
  expect(await wears(page)).toBe('paper')
  expect(await tokenOf(page, '--accent')).toBe(paper.light.accent)
  await panelsSettle(page)
  expect(await transitions(page), 'no restyle, no transition').toEqual([])
  // one edit: one ⌘Z gives Tangerine its own colour back, and leaves nothing to undo
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => accentDot(option(page, 'tangerine'))).toBe(was)
  await expect(undoArrow(page), 'a Save pack is one edit').toHaveAttribute('aria-disabled', 'true')
  expect(await transitions(page), 'its undo restyles nothing either').toEqual([])
})

test('6.4 · Discard: Cancel and ✕, each after a colour changed in the draft, journal nothing and leave the canvas as it was, focus back on the pencil; a New pack cancelled gives focus back to "+ New pack"', async ({ page }) => {
  await open(page)
  const paper = recordOf('paper')
  await intoList(page)
  await tabOnto(page, door(page, 'paper'))
  for (const [what, way] of [[W.cancel, (d) => d.locator('[data-cancel]')], ['✕', (d) => d.getByRole('button', { name: W.close })]]) {
    await expect(door(page, 'paper')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(packEditor(page)).toBeVisible()
    await typeHex(page, 'light', 'accent', '#1E6BFF')
    await expect(swatchOf(page, 'light', 'accent'), `${what}: the control — the draft changed`).toHaveAccessibleName(W.swatch(W.roles.accent, W.modes.light, '#1E6BFF', false))
    await way(packEditor(page)).focus()
    await page.keyboard.press('Enter')
    await expect(packEditor(page), `${what} closes it`).toHaveCount(0)
    await expect(door(page, 'paper'), `${what}: focus back on the pencil`).toBeFocused()
    await expect(undoArrow(page), `${what}: nothing journaled`).toHaveAttribute('aria-disabled', 'true')
    expect(await tokenOf(page, '--accent'), `${what}: the canvas untouched`).toBe(paper.light.accent)
  }
  expect((await held(page)).entries, 'the journal holds nothing').toBe(0)
  // reopened, the draft starts from the pack again: the thrown-away colour is gone
  await page.keyboard.press('Enter')
  await expect(swatchOf(page, 'light', 'accent')).toHaveAccessibleName(W.swatch(W.roles.accent, W.modes.light, paper.light.accent, false))
  await page.keyboard.press('Escape')
  await expect(packEditor(page)).toHaveCount(0)
  // a New pack cancelled: no pack, no entry, focus back on "+ New pack"
  const create = page.locator('#style-pack-new')
  await tabOnto(page, create)
  await page.keyboard.press('Enter')
  await expect(page.locator('#pack-editor-title')).toHaveText(W.newTitle)
  await page.keyboard.type('Studio Warm')
  await packEditor(page).locator('[data-cancel]').focus()
  await page.keyboard.press('Enter')
  await expect(packEditor(page)).toHaveCount(0)
  await expect(create).toBeFocused()
  await expect(option(page, 'custom-1')).toHaveCount(0)
  await expect(undoArrow(page)).toHaveAttribute('aria-disabled', 'true')
})

test('6.4 · Reset to defaults: Paper edited and saved, reopened — Reset puts the library\'s whole record in the draft, name included; Save pack drops packs.paper, the canvas goes back to the library\'s accent, "Changed Paper.", and it is one edit', async ({ page }) => {
  await open(page)
  const paper = recordOf('paper')
  await intoEdit(page, 'paper')
  const name = page.locator('#pack-name')
  await name.focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('Paper Blue')
  await typeHex(page, 'light', 'accent', '#1E6BFF')
  await savePack(page)
  await expect(page.locator('#editor-said')).toHaveText(W.changed('Paper Blue'))
  await expect.poll(async () => (await held(page)).packs.paper?.name, 'the control: Paper holds an own record').toBe('Paper Blue')
  // reopened on the own record
  await expect(door(page, 'paper')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(name).toHaveValue('Paper Blue')
  await packEditor(page).getByRole('button', { name: W.reset }).focus()
  await page.keyboard.press('Enter')
  // the draft is the library's record, all of it: the name and every colour of both modes
  await expect(name).toHaveValue(paper.name)
  for (const mode of ['light', 'dark']) {
    for (const role of Object.keys(W.roles)) {
      await expect(swatchOf(page, mode, role)).toHaveAccessibleName(W.swatch(W.roles[role], W.modes[mode], paper[mode][role], false))
    }
  }
  expect(await tokenOf(page, '--accent'), 'the draft alone: the canvas waits for Save pack').toBe('#1E6BFF')
  await savePack(page)
  await expect(page.locator('#editor-said')).toHaveText(W.changed(paper.name))
  await expect.poll(() => tokenOf(page, '--accent')).toBe(paper.light.accent)
  await expect.poll(async () => 'paper' in (await held(page)).packs, 'packs.paper is removed').toBe(false)
  await expect(door(page, 'paper')).toHaveAccessibleName(W.edit(paper.name))
  // one edit: ⌘Z brings the edited Paper back, name and colour
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => tokenOf(page, '--accent')).toBe('#1E6BFF')
  await expect.poll(async () => (await held(page)).packs.paper?.name).toBe('Paper Blue')
})

test('6.4 · Paste: refused, focus lands on the hex field with "Press ⌘V…"; allowed, the clipboard\'s #2F4A3E fills the field and the swatch follows', async ({ page, context }) => {
  await open(page)
  await intoEdit(page, 'paper')
  await swatchOf(page, 'light', 'accent').focus()
  await page.keyboard.press('Enter')
  const hex = page.locator('#pack-picker-hex')
  await expect(hex).toBeFocused()
  const paste = pickerOf(page).getByRole('button', { name: W.paste })
  // REFUSED: this context holds no clipboard permission, so the browser answers `readText` with NotAllowedError
  expect(await page.evaluate(async () => (await navigator.permissions.query({ name: 'clipboard-read' })).state), 'the control: not granted').not.toBe('granted')
  await page.keyboard.press('Tab')
  await expect(paste).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(hex, 'refused: the field takes a ⌘V instead').toBeFocused()
  await expect(page.locator('#pack-picker-hex-hint')).toHaveText(W.pasteFallback)
  // ALLOWED: the clipboard holds a colour, and Paste takes it
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.evaluate(() => navigator.clipboard.writeText('#2F4A3E'))
  await page.keyboard.press('Tab')
  await expect(paste).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(hex).toHaveValue('#2F4A3E')
  await expect(swatchOf(page, 'light', 'accent')).toHaveAccessibleName(W.swatch(W.roles.accent, W.modes.light, '#2F4A3E', false))
  await expect(page.locator('#pack-picker-hex-hint')).toHaveCount(0)
})

test('6.4 · From your site: no linked site, no row; a linked site\'s stored accent is offered, and Enter on it makes it the draft\'s colour', async ({ page }) => {
  await open(page)
  await intoEdit(page, 'paper')
  await swatchOf(page, 'light', 'accent').focus()
  await page.keyboard.press('Enter')
  await expect(pickerOf(page)).toBeVisible()
  await expect(pickerOf(page).locator('[data-from-site]'), 'no linked site: no row').toHaveCount(0)
  await expect(pickerOf(page)).not.toContainText(W.fromSite)
  // a linked site — the harness's, whose stored accent is the fixture's own
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'members-off' })
  await open(page)
  const accent = EDIT.hexOf(LIB.orbitWeekly.site().accent_color)
  expect(accent, 'the control: the linked site has an accent').not.toBe(null)
  // Border, because the fixture's accent IS Paper's (a press there would change nothing), and no AA pair reads Border
  expect(accent, 'and it is not the colour already there').not.toBe(recordOf('paper').light.border)
  await intoEdit(page, 'paper')
  await swatchOf(page, 'light', 'border').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#pack-picker-hex')).toBeFocused()
  const dot = pickerOf(page).locator('[data-from-site]')
  await expect(dot).toHaveAccessibleName(`${W.fromSite}, ${accent}`)
  await page.keyboard.press('Shift+Tab')
  await expect(dot).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#pack-picker-hex')).toHaveValue(accent)
  await expect(swatchOf(page, 'light', 'border')).toHaveAccessibleName(W.swatch(W.roles.border, W.modes.light, accent, false))
})

test('6.4 · a pairing whose faces are slower than FACES_WAIT_MS: the words and --font-heading land after the wait, without them, and the late face swaps in on arrival with no second restyle', async ({ page }) => {
  await open(page)
  const pool = POOL()
  const lora = pool.pairings.find((p) => p.heading.family === 'Lora')
  const HOLD = PACK.FACES_WAIT_MS * 3
  await intoList(page)
  await holdFaces(page, HOLD)
  await timeTransitions(page)
  await tabOnto(page, page.locator('#style-pack-heading-font'))
  await page.keyboard.press('Enter')
  const menu = page.locator('#style-pack-pairings')
  await expect(menu.locator('[aria-current="true"]')).toBeFocused()
  const wanted = menu.locator('button').filter({ hasText: lora.heading.family })
  for (let n = 0; n < pool.pairings.length && !(await wanted.evaluate((el) => el === document.activeElement)); n++) await page.keyboard.press('ArrowDown')
  await expect(wanted).toBeFocused()
  const pressed = Date.now()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-said')).toHaveText(W.pairing(lora.heading.family, lora.body.family), { timeout: HOLD })
  expect(Date.now() - pressed, 'the words waited FACES_WAIT_MS').toBeGreaterThanOrEqual(PACK.FACES_WAIT_MS - 50)
  const [run, ...more] = await timed(page)
  expect(more, 'one edit, one restyle').toEqual([])
  expect(run.ready - run.asked, 'it waited FACES_WAIT_MS').toBeGreaterThanOrEqual(PACK.FACES_WAIT_MS - 50)
  expect(run.ready - run.asked, 'and went on long before the faces came').toBeLessThan(HOLD - PACK.FACES_WAIT_MS / 2)
  expect(run.faces, 'the control: the faces were NOT in when it went on').toBe(false)
  expect(await tokenOf(page, '--font-heading')).toBe(`'${lora.heading.family}', ${pool.families[lora.heading.family].fallback}`)
  // `font-display: swap`: released, the late face arrives and is drawn, with no second restyle
  await expect
    .poll(() => page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate((html, src) => new Function(`return (${src})`)()(html.ownerDocument), facesIn.toString()), { timeout: HOLD * 2 })
    .toBe(true)
  expect((await timed(page)).length, 'one transition, no second').toBe(1)
})

test('6.4 · Remix\'s Style Pack draws from the whole roster, own packs included: Paper in force, the project\'s own pack last, the top of the draw lands on it, and one ⌘Z puts Paper back', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-pack': 'custom-1' })
  await open(page)
  await intoList(page)
  await expect(option(page, 'custom-1')).toBeFocused()
  const ids = await page.locator('#editor-controls [data-style-pack]').evaluateAll((els) => els.map((e) => e.dataset.stylePack))
  expect(ids.at(-1), 'the control: the project\'s own pack is the roster\'s last').toBe('custom-1')
  // Paper in force: the arrows to its cell, then Enter
  for (let n = 0; n < ids.length && !(await option(page, 'paper').evaluate((el) => el === document.activeElement)); n++) await page.keyboard.press('ArrowLeft')
  await expect(option(page, 'paper')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', 'paper')
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page)).toBeVisible()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('ArrowLeft')
  await expect(remixDialog(page).locator('input[value="pack"]')).toBeChecked()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(page.locator('[data-remix-go]')).toBeFocused()
  // the draw is uniform over every pack but the one in force: its top end is the roster's last
  await page.evaluate(() => {
    Math.random = () => 0.9999
  })
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', 'custom-1')
  await expect(page.locator('#editor-said')).toHaveText(REMIX.remixPackSaid('Harness Pack'))
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('iframe[title$="canvas"]'), 'one ⌘Z puts Paper back').toHaveAttribute('data-pack', 'paper')
})

/* ── R-236 (owner, 2026-10-04): THE BUILD MATCHES ITS DRAWINGS, VALUE FOR VALUE. Every value the spec's "Built from" table
   gives — sizes, radii, paddings, type, colours, shadows — read off the computed style of each built state at 1440 and
   held to the table. The frames draw in CSS's default content-box, so a size here is the frame's own `width`/`height`,
   the box the app draws `box-content` where the frame's padding or hairline sits outside it. The colours are the frames'
   hexes (`S7 Style Packs.dc.html`, `Editor Sidebar Kit.dc.html`), as a computed style prints them. ── */

const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`
const FRAME = {
  paperSunk: rgb('#EFECE7'), inkSoft: rgb('#6E6A64'), line: rgb('#E7E2DB'), lineStrong: rgb('#C9C2B8'), coral: rgb('#FF5941'),
  coralDeep: rgb('#E84B34'), coralText: rgb('#C2381F'), coralTint: rgb('#FFEDE8'), ink: rgb('#1C1B1A'), inkHover: rgb('#33312E'),
  surface: rgb('#FFFFFF'), paper: rgb('#F7F5F2'), white: rgb('#FFFFFF'), clear: 'rgba(0, 0, 0, 0)',
  sm: 'rgba(28, 27, 26, 0.06) 0px 1px 2px 0px', lg: 'rgba(28, 27, 26, 0.14) 0px 12px 40px 0px', modal: 'rgba(28, 27, 26, 0.25) 0px 12px 40px 0px',
  swatch: 'rgba(28, 27, 26, 0.14) 0px 0px 0px 1px inset', hairline: 'rgba(28, 27, 26, 0.12) 0px 0px 0px 1px inset',
  thumb: 'rgba(0, 0, 0, 0.4) 0px 1px 3px 0px', hueThumb: 'rgba(0, 0, 0, 0.35) 0px 1px 3px 0px', scrim: 'rgba(28, 27, 26, 0.4)',
  focus: 'rgb(194, 56, 31) 0px 0px 0px 2px',
}
/** every named property of one element's computed style, held to the table at once — and named, so a miss says where */
async function holds(locator, what, expected, pseudo = null) {
  await expect(locator, `${what} is drawn`).toHaveCount(1)
  const got = await locator.evaluate((el, [names, p]) => {
    const cs = getComputedStyle(el, p)
    return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n)]))
  }, [Object.keys(expected), pseudo])
  // Tailwind composes a shadow from layered properties, so the computed value carries empty transparent layers before the
  // drawn one: the drawn layers are what a frame's shadow is compared with
  const drawn = (v) => v.split(/,(?![^(]*\))/).map((l) => l.trim()).filter((l) => l !== 'rgba(0, 0, 0, 0) 0px 0px 0px 0px').join(', ') || 'none'
  for (const [name, want] of Object.entries(expected)) expect(name === 'box-shadow' ? drawn(got[name]) : got[name], `${what}: ${name}`).toBe(want)
}
/** a box's edges against another's — where a frame places one part inside another */
const inset = (inner, outer) =>
  Promise.all([inner.boundingBox(), outer.boundingBox()]).then(([i, o]) => ({ top: Math.round(i.y - o.y), right: Math.round(o.x + o.width - (i.x + i.width)), left: Math.round(i.x - o.x) }))
const border = (width, style, color, sides = ['top', 'right', 'bottom', 'left']) =>
  Object.fromEntries(sides.flatMap((s) => [[`border-${s}-width`, width], [`border-${s}-style`, style], [`border-${s}-color`, color]]))
const radius = (r) => Object.fromEntries(['top-left', 'top-right', 'bottom-right', 'bottom-left'].map((c) => [`border-${c}-radius`, r]))
const padding = (v, h = v) => ({ 'padding-top': v, 'padding-bottom': v, 'padding-left': h, 'padding-right': h })
const type = (size, weight, colour) => ({ 'font-size': size, ...(weight ? { 'font-weight': weight } : {}), ...(colour ? { color: colour } : {}) })
/** a border a frame draws at a fraction of a pixel, as Chromium draws it — in whole device pixels (executed: S7a's 1.5px
 *  "+ New pack" computes 1px at 1×, as the frame itself does in the same browser) */
const snapped = (px) => `${Math.max(1, Math.floor(px))}px`

test.describe('R-236 — built from the drawings, at the frames\' own 1440', () => {
test.use({ viewport: { width: 1440, height: 900 } })

test('R-236 · the Style Pack panel, the pairing menu, Edit pack, New pack, the colour picker and the warning match the "Built from" table, value for value', async ({ page }) => {
  // the pack the project made is in force (its custom cell drawn), and a linked site offers its accent ("From your site")
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-pack': 'custom-1', 'x-inflozo-harness-site': 'members-off' })
  await open(page)
  expect(page.viewportSize().width, 'the table is S7a\'s, S7c\'s and S7d\'s, drawn at 1440').toBe(1440)
  await intoList(page)

  // ── the panel (S7a) ──
  // the circle is the button's drawing, not its box (a touch screen's 44px rule grows the box, never the circle)
  const pencil = door(page, 'paper').locator('span').first()
  await holds(pencil, 'a preset cell\'s pencil', { width: '15px', height: '15px', 'box-sizing': 'content-box', ...border('1px', 'solid', FRAME.lineStrong), 'background-color': FRAME.surface })
  expect(parseFloat(await pencil.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)), 'a circle').toBeGreaterThanOrEqual(7.5)
  const placed = await inset(pencil, option(page, 'paper'))
  expect([placed.top, placed.right], 'the pencil: 4px from the cell\'s top and right').toEqual([4, 4])
  await holds(pencil.locator('svg'), 'the pencil\'s glyph', { width: '8px', height: '8px', 'stroke-width': '2px', color: FRAME.inkSoft })
  await holds(option(page, 'custom-1').locator('span[aria-hidden]').first(), 'a custom cell\'s "Ag"', type('14px'))
  const named = door(page, 'custom-1')
  await holds(named.locator('span span').first(), 'a custom cell\'s name', { ...type('10.5px', '600'), ...border('1px', 'dashed', FRAME.lineStrong, ['bottom']), cursor: 'text' })
  await holds(named.locator('svg'), 'a custom cell\'s pencil', { width: '11px', height: '11px', 'stroke-width': '1.5px', color: FRAME.inkSoft })
  await holds(named.locator('span').first(), 'its name and pencil', { 'column-gap': '4px' })
  const line = option(page, 'custom-1').locator('span.flex.items-center').first()
  const [laid, under] = await Promise.all([named.boundingBox(), line.boundingBox()])
  expect([Math.round(laid.x), Math.round(laid.y)], 'the name button lies over the cell\'s own name line').toEqual([Math.round(under.x), Math.round(under.y)])
  const create = page.locator('#style-pack-new')
  await holds(create, '+ New pack', { ...border(snapped(1.5), 'dashed', FRAME.lineStrong), ...radius('8px'), color: FRAME.inkSoft, 'row-gap': '3px' })
  await holds(create.locator('span').first(), '"+"', type('16px'))
  await holds(create.locator('span').nth(1), '"New pack"', type('10px', '600'))
  await holds(page.locator('[data-style-pack-rows]'), 'the rows block', { ...border('1px', 'solid', FRAME.line, ['top']), 'padding-top': '7px', 'row-gap': '6px' })
  for (const id of ['#style-pack-heading-font', '#style-pack-body-font']) {
    const row = page.locator(id)
    await holds(row, `${id}`, { height: '40px', ...padding('6px', '10px'), 'column-gap': '9px', ...border('1px', 'solid', FRAME.line), ...radius('8px'), 'background-color': FRAME.surface })
    await holds(row.locator('span').first(), `${id} "Aa"`, { ...type('14px'), width: '20px' })
    await holds(row.locator('span span').first(), `${id}'s name`, type('10px', null, FRAME.inkSoft))
    await holds(row.locator('span span').nth(1), `${id}'s family`, type('12px', '600'))
    await holds(row.locator('svg'), `${id}'s chevron`, { width: '12px', 'stroke-width': '1.5px', color: FRAME.inkSoft })
  }
  for (const r of W.rows) {
    const group = page.locator(`#style-pack-${r.key}`)
    await holds(page.locator(`#style-pack-${r.key}-label`), `${r.title}'s name`, type('11.5px', '500', FRAME.inkSoft))
    await holds(group.locator('..'), `${r.title}'s row`, { 'row-gap': '4px' })
    await holds(group, `${r.title}'s track`, { 'background-color': FRAME.paperSunk, ...radius('24px'), ...padding('2px') })
    await holds(group.locator('[aria-checked="false"]').first(), `${r.title}'s step`, { ...padding('3px', '0px'), ...radius('20px'), ...type('11px', '500', FRAME.inkSoft) })
    await holds(group.locator('[aria-checked="true"]'), `${r.title}'s chosen step`, { ...type('11px', '600', FRAME.ink), 'background-color': FRAME.surface, 'box-shadow': FRAME.sm })
  }
  await expect(page.locator('#style-pack-buttons [role="radio"]').last(), 'Button style has four steps, Pill last').toHaveText(W.rows.find((r) => r.key === 'buttons').steps.pill)
  await holds(page.locator('#style-pack-pill-label'), 'Pill radius\'s name', type('11.5px', '500', FRAME.inkSoft))
  await holds(page.locator('#style-pack-pill'), 'Pill radius\'s stepper', { ...border('1px', 'solid', FRAME.line), ...radius('8px'), 'background-color': FRAME.surface })
  for (const b of await page.locator('#style-pack-pill button').all()) await holds(b, 'a − or +', { width: '26px', height: '28px' })
  // the pack wears Full, the cap: its + is the Kit's placeholder-grey there, and the − the stepper's ink-soft
  await holds(page.locator('#style-pack-pill button').first(), 'the live −', { color: FRAME.inkSoft })
  await holds(page.locator('#style-pack-pill button').last(), 'the + at its cap', { color: FRAME.lineStrong })
  await holds(page.locator('#style-pack-pill span'), 'Pill radius\'s value', { 'min-width': '32px', ...type('13px', '600'), 'font-variant-numeric': 'tabular-nums' })

  // ── the pairing menu (the Kit's dropdown, as wide as the font row it opens from) ──
  await page.locator('#style-pack-heading-font').focus()
  await page.keyboard.press('Enter')
  const list = page.locator('#style-pack-pairings ul')
  await expect(list).toBeVisible()
  await holds(list, 'the pairing menu', { 'background-color': FRAME.surface, ...border('1px', 'solid', FRAME.line), ...radius('12px'), 'box-shadow': FRAME.lg, ...padding('6px'), 'row-gap': '1px' })
  expect(Math.round((await list.boundingBox()).width), 'as wide as its font row').toBe(Math.round((await page.locator('#style-pack-heading-font').boundingBox()).width))
  const active = list.locator('[aria-current="true"]')
  await holds(active, 'the pairing in force', { ...padding('7px', '10px'), ...radius('8px'), 'background-color': FRAME.coralTint })
  await holds(active.locator('svg').last(), 'its check', { width: '13px', color: FRAME.coralDeep })
  await holds(list.locator('button:not([aria-current])').first(), 'a pairing', { ...padding('7px', '10px'), ...radius('8px') })
  await holds(active.locator('span span').first(), 'a pairing\'s "Ag"', { ...type('14px'), width: '20px' })
  await holds(active.locator('span span span').first(), 'its heading family', type('12px', '600'))
  await holds(active.locator('span span span').nth(1), 'its body family', type('10px', null, FRAME.inkSoft))
  await page.keyboard.press('Escape')

  // ── Edit pack (S7c) — opened on a preset, so Reset to defaults is drawn ──
  await door(page, 'paper').focus()
  await page.keyboard.press('Enter')
  const dialog = packEditor(page)
  await expect(dialog).toBeVisible()
  await holds(dialog, 'Edit pack', { width: '520px', 'box-sizing': 'content-box', ...padding('28px'), ...radius('16px'), 'background-color': FRAME.surface, 'box-shadow': FRAME.modal, 'row-gap': '20px' })
  await holds(dialog, 'its scrim', { 'background-color': FRAME.scrim }, '::backdrop')
  expect(Math.round((await dialog.boundingBox()).width), 'the 576 the frame draws: 520 inside 28 a side').toBe(576)
  await holds(page.locator('#pack-editor-title'), 'the title', { ...type('22px', '700', FRAME.ink), 'letter-spacing': '-0.22px' })
  expect(await page.locator('#pack-editor-title').evaluate((el) => getComputedStyle(el).fontFamily), 'Bricolage Grotesque').toMatch(/bricolage/i)
  await holds(page.locator('#pack-editor-subtitle'), 'the subtitle', { ...type('13px', null, FRAME.inkSoft), 'line-height': '19.5px' })
  await holds(page.locator('#pack-editor-title').locator('..'), 'title over subtitle', { 'row-gap': '5px' })
  await holds(dialog.getByRole('button', { name: W.close }).locator('svg'), 'the ✕', { width: '16px', height: '16px', 'stroke-width': '1.5px' })
  await holds(dialog.getByRole('button', { name: W.close }), 'the ✕\'s place', { color: FRAME.inkSoft, 'margin-top': '4px' })
  await holds(page.locator('label[for="pack-name"]').locator('..'), 'Pack name\'s label', type('12px', '500', FRAME.inkSoft))
  await holds(page.locator('#pack-name').locator('..'), 'label over field', { 'row-gap': '6px' })
  await holds(page.locator('#pack-name'), 'Pack name', { height: '40px', 'box-sizing': 'content-box', ...border('1px', 'solid', FRAME.line), ...radius('8px'), ...padding('0px', '12px'), ...type('13px'), 'caret-color': FRAME.coral })
  await page.locator('#pack-name').focus()
  await holds(page.locator('#pack-name'), 'Pack name, focused (S7d)', { ...border('1px', 'solid', FRAME.coralText), 'box-shadow': FRAME.focus })
  const rows = dialog.locator('[data-swatch="light-background"]').locator('xpath=../../..')
  await holds(rows, 'the swatch rows', { 'row-gap': '14px' })
  const lightRow = dialog.locator('[data-swatch="light-background"]').locator('xpath=../..')
  await holds(lightRow, 'a mode\'s row', { 'column-gap': '12px' })
  await holds(lightRow.locator('> span'), 'the mode\'s word', { width: '34px', ...type('11px', '600', FRAME.inkSoft) })
  const grid = dialog.locator('[data-swatch="light-background"]').locator('..')
  await holds(grid, 'the seven columns', { 'column-gap': '4px' })
  expect((await grid.evaluate((g) => getComputedStyle(g).gridTemplateColumns)).split(' ').length, 'seven equal columns').toBe(Object.keys(W.roles).length)
  const swatch = dialog.locator('[data-swatch="light-background"]')
  await holds(swatch, 'a swatch\'s column', { 'row-gap': '5px' })
  await holds(swatch.locator('span').first(), 'a swatch', { width: '36px', height: '36px', ...radius('10px'), 'box-shadow': FRAME.swatch })
  await holds(swatch.locator('span').last(), 'a swatch\'s name', { ...type('9.5px', null, FRAME.inkSoft), 'white-space': 'nowrap' })
  await holds(dialog.locator('#pack-scrim-light-label').locator('..').locator('..').locator('> span').first(), 'Image scrim\'s name', type('12px', '500', FRAME.inkSoft))
  await holds(dialog.locator('#pack-scrim-light-label'), 'Image scrim\'s mode word', { width: '34px', ...type('11px', '600', FRAME.inkSoft) })
  await holds(dialog.locator('#pack-scrim-light'), 'Image scrim\'s stepper', { ...border('1px', 'solid', FRAME.line), ...radius('8px'), 'background-color': FRAME.surface })
  const footer = dialog.locator('[data-save-pack]').locator('..')
  await holds(footer, 'the footer', { 'column-gap': '10px' })
  await holds(dialog.getByRole('button', { name: W.reset }), 'Reset to defaults', { height: '38px', ...padding('0px', '12px'), ...type('12px', '500', FRAME.inkSoft), 'background-color': FRAME.clear, ...radius('10px') })
  await holds(dialog.locator('[data-cancel]'), 'Cancel', { height: '38px', ...padding('0px', '16px'), ...type('13px', '500', FRAME.inkSoft), 'background-color': FRAME.clear, ...radius('10px') })
  await holds(dialog.locator('[data-save-pack]'), 'Save pack', { height: '38px', ...padding('0px', '22px'), ...type('13px', '600', FRAME.surface), 'background-color': FRAME.ink, ...radius('10px') })
  const cancel = await dialog.locator('[data-cancel]').boundingBox()
  const reset = await dialog.getByRole('button', { name: W.reset }).boundingBox()
  expect(cancel.x - (reset.x + reset.width), 'Cancel is pushed right').toBeGreaterThan(10)

  // ── the colour picker (S7d), from Accent, with the site's accent offered ──
  await swatchOf(page, 'light', 'accent').focus()
  await page.keyboard.press('Enter')
  const card = page.locator('[data-picker]')
  await expect(card).toBeVisible()
  await holds(card, 'the picker', { width: '206px', 'box-sizing': 'content-box', ...padding('12px'), ...border('1px', 'solid', FRAME.line), ...radius('12px'), 'box-shadow': FRAME.modal, 'row-gap': '10px' })
  const square = page.locator('[data-picker-square]')
  await holds(square, 'the square', { width: '206px', height: '112px', ...radius('8px') })
  await holds(square.locator('span'), 'its thumb', { width: '14px', height: '14px', 'box-sizing': 'content-box', 'border-top-color': FRAME.white, 'box-shadow': FRAME.thumb })
  const hue = page.locator('[data-picker-hue]')
  await holds(hue, 'the hue strip', { height: '12px', ...radius('6px') })
  await holds(hue.locator('span'), 'its thumb', { width: '16px', height: '16px', 'box-sizing': 'content-box', 'border-top-color': FRAME.white, 'box-shadow': FRAME.hueThumb })
  for (const thumb of [square.locator('span'), hue.locator('span')]) await holds(thumb, 'a thumb\'s white ring', { 'border-top-width': snapped(2.5), 'border-top-style': 'solid' })
  const site = page.locator('[data-from-site]')
  await holds(site.locator('..'), '"From your site"', { 'column-gap': '7px' })
  await holds(site.locator('..').locator('span'), 'its words', type('10px', null, FRAME.inkSoft))
  await holds(site, 'its dot', { width: '16px', height: '16px' })
  const hexRow = page.locator('#pack-picker-hex').locator('../..')
  await holds(hexRow, 'the hex row', { ...border('1px', 'solid', FRAME.line, ['top']), 'padding-top': '10px', 'column-gap': '7px' })
  await holds(hexRow.locator('> span'), 'its swatch', { width: '22px', height: '22px', ...radius('6px'), 'box-shadow': FRAME.hairline })
  await holds(page.locator('#pack-picker-hex'), 'the hex field', { height: '30px', 'box-sizing': 'content-box', ...border('1px', 'solid', FRAME.coralText), ...radius('8px'), ...padding('0px', '9px'), ...type('12px') })
  expect(await page.locator('#pack-picker-hex').evaluate((el) => getComputedStyle(el).fontFamily), 'mono').toMatch(/mono/i)
  const paste = page.getByRole('button', { name: W.paste })
  await holds(paste, 'Paste', { width: '30px', height: '30px', 'box-sizing': 'content-box', ...radius('8px'), ...border('1px', 'solid', FRAME.line), 'background-color': FRAME.surface })
  await holds(paste.locator('svg'), 'its clipboard', { width: '13px', 'stroke-width': '1.5px', color: FRAME.inkSoft })
  await page.keyboard.press('Escape')

  // ── the warning (the Kit's notice banner) and a failing swatch's glyph ──
  await typeHex(page, 'light', 'text', '#DDDDDD')
  const banner = page.locator('[data-pack-warning] > div')
  await holds(banner, 'the warning', { ...radius('10px'), ...padding('11px', '13px'), ...type('12.5px'), 'line-height': '18.75px' })
  const glyph = swatchOf(page, 'light', 'text').locator('[data-hard]')
  await holds(glyph, 'a failing swatch\'s glyph', { width: '15px', height: '15px', 'box-sizing': 'content-box', ...border('1px', 'solid', FRAME.lineStrong), 'background-color': FRAME.surface })
  const at = await inset(glyph, swatchOf(page, 'light', 'text').locator('span').first())
  expect([at.top, at.right], 'at the swatch\'s top-right, as S7a\'s cells carry their pencils').toEqual([4, 4])
  await page.keyboard.press('Escape')
  await expect(packEditor(page)).toHaveCount(0)

  // ── New pack (S7d): its title, its subtitle and its name refusal ──
  await page.locator('#style-pack-new').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#pack-editor-title')).toHaveText(W.newTitle)
  await holds(page.locator('#pack-editor-title'), 'New pack\'s title', type('22px', '700'))
  await savePack(page)
  await holds(page.locator('#pack-name-error'), 'the name\'s refusal', type('11px'))
  await expect(page.getByRole('button', { name: W.reset })).toHaveCount(0)
})
})

// ── R-147's card ────────────────────────────────────────────────────────────────────────────────────────────────

test('R-147: ? opens the card, it lists exactly the keys that work, and Esc returns focus', async ({ page }) => {
  await open(page)
  const sheet = page.locator('dialog[data-shortcuts-sheet]')
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('?')
  await expect(sheet).toBeVisible()
  await expect(page.locator('dialog[open] [data-cancel]')).toBeFocused()

  const listed = await page.locator('[data-shortcut-row]').evaluateAll((els) => els.map((e) => e.dataset.shortcutRow))
  expect(listed.length).toBeGreaterThan(0)
  const chips = await page.locator('[data-shortcut-row] span span').allInnerTexts()
  // R-145: a key whose action is not built is ABSENT — not greyed, not captioned, not listed
  for (const dead of ['⌘⏎']) {
    expect(chips, `${dead} has nothing to press yet and must not be advertised`).not.toContain(dead)
  }
  // ⌘K joined this list at Story 5.10, which built the Section Picker it presses, `[` `]` at Story 5.11, which
  // built the design ring they cycle, ⇧R at Story 5.12, which built Site Remix, and P at Story 5.15, which built
  // Preview (R-145: a shortcut arrives with the action it drives)
  for (const live of ['⌘K', '[', ']', '⇧R', 'P', 'L', '.', '⌘D', 'Del', '⌘Z', '⇧⌘Z', '⌘S', 'Esc', '?']) {
    expect(chips, `${live} works and must be listed`).toContain(live)
  }
  await expect(sheet).not.toContainText(/not yet|coming|soon|unavailable/i)

  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  expect(await focused(page), 'the platform returns focus to where it was').toBe('SECTION[Canvas]')
})

test('R-145: a deferred key does nothing and announces nothing', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])
  const before = { rows: (await rows(page)).all.length, mode: await modeOf(page), device: await deviceOf(page) }
  await page.locator('section[aria-label="Canvas"]').focus()
  // ⌘K LEFT THIS LIST AT STORY 5.10, `[` `]` AT STORY 5.11, ⇧R AT STORY 5.12 and P AT STORY 5.15, each with the
  // action it presses — R-145's rule is that a shortcut arrives with its action, so a key leaves here and gets a
  // stop of its own below. One is still owed.
  for (const key of ['ControlOrMeta+Enter']) {
    await page.keyboard.press(key)
  }
  expect((await rows(page)).all).toHaveLength(before.rows)
  expect(await modeOf(page)).toBe(before.mode)
  expect(await deviceOf(page)).toBe(before.device)
  expect(await said(page)).toBe('')
  await expect(page.locator('dialog[open]')).toHaveCount(0)
})

/* ── Story 5.14 — View as (FR-D16, S4a, S4d) ───────────────────────────────────────────────────────────────────────
   The harness has no database, so the looked-at record's write is REFUSED here — the matrix's "Save refused" row, on
   every commit: the session's record stands, the canvas is unaffected, and nothing is said about it. */

test('View as: Tab reaches it, Enter opens S4d\'s menu, ↓ moves, Enter picks — the canvas repaints and says so — and Esc gives focus back', async ({ page }) => {
  // the matrix's "Save refused" row is read below: listened for from the start, so the write made on open is heard too
  const refused = []
  page.on('console', (m) => { if (m.type() === 'warning' && /looked-at record was not saved/.test(m.text())) refused.push(m.text()) })
  const canvas = await open(page)
  // Tab reaches it — within as many presses as the bar has stops, counted off the page
  const bar = await stopsIn(page, 'header')
  for (let n = 0; n < bar && (await focused(page)) !== 'BUTTON#editor-view-as'; n++) await page.keyboard.press('Tab')
  expect(await focused(page), 'View as is in the tab order, in the bar').toBe('BUTTON#editor-view-as')
  // R-170: the logged-out visitor is "Logged out user" on the button, as in the menu
  expect(await viewAsOf(page)).toBe('Logged out user')
  // R-169: this canvas has been looked at as one visitor, so the menu dots the other two — and nothing is in the bar
  await expect(page.locator('#editor-view-as-marker')).toHaveCount(0)
  expect(await dotted(page)).toEqual(['free', 'paid'])
  const signedOut = await canvas.locator('#canvas').innerHTML()
  // the record made on open has been written and refused (the harness has no database) before the pick below, so the
  // refusal counted after the pick is the pick's own — the one write chain lands them in order
  await expect.poll(() => refused.length, { message: 'the write made on open is refused and logged' }).toBeGreaterThan(0)
  const beforePick = refused.length

  // Enter opens S4d's menu, and focus steps onto its CHECKED row (R-171: both bar menus open on it) — here the first
  await page.keyboard.press('Enter')
  const menu = page.locator('#editor-view-as-menu')
  await expect(menu).toBeVisible()
  await expect(menu.locator('[data-visitor]')).toHaveCount(3)
  await expect(page.locator('#editor-view-as')).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.locator('[data-visitor]').first()).toBeFocused()
  // ↓ moves to the next row
  await page.keyboard.press('ArrowDown')
  const second = await menu.locator('[data-visitor]').nth(1).getAttribute('data-visitor')
  await expect(menu.locator('[data-visitor]').nth(1)).toBeFocused()

  // Enter picks it: the menu closes, focus is back on the trigger, the canvas has REPAINTED as that visitor and the
  // choice is announced through the editor's one live region
  await page.keyboard.press('Enter')
  await expect(menu).toBeHidden()
  expect(await focused(page)).toBe('BUTTON#editor-view-as')
  expect(await viewAsOf(page)).toBe('Free member')
  expect(second).toBe('free')
  expect(await said(page)).toMatch(/previewing a free member/i)
  expect(await canvas.locator('#canvas').innerHTML(), 'a members-aware section re-renders for a signed-in visitor').not.toBe(signedOut)
  expect(await dotted(page), 'one visitor is left to look at').toEqual(['paid'])
  // THE MATRIX'S "SAVE REFUSED" ROW: the harness has no database, so every write of the record is refused — and that is
  // LOGGED, never said, while the session's record stands (the dots above) and the canvas is unaffected (the repaint)
  await expect.poll(() => refused.length, { message: 'the pick\'s refused write is logged' }).toBeGreaterThan(beforePick)
  expect(await said(page), 'a refused record is never said').toMatch(/previewing a free member/i)
  expect(await dotted(page), 'the session\'s record stands after the refusal').toEqual(['paid'])

  // Esc closes the menu and focus returns to the trigger, with the visitor where it was — and while it is open, the one
  // row left carries R-169's dot, drawn, with its word in the row for a screen reader
  await page.keyboard.press('Enter')
  await expect(menu).toBeVisible()
  await expect(menu.locator('[data-visitor="paid"] [data-not-viewed]')).toBeVisible()
  await expect(menu.locator('[data-visitor="paid"]')).toContainText('Not viewed')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  expect(await focused(page)).toBe('BUTTON#editor-view-as')
  expect(await viewAsOf(page)).toBe('Free member')

  // and back to the logged out user: the list opens on its checked row, Free (R-171), ↑ steps to the first, Enter
  // picks it — byte for byte the signed-out render it started as
  await page.keyboard.press('Enter')
  await expect(menu.locator('[data-visitor="free"]')).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(menu.locator('[data-visitor="anonymous"]')).toBeFocused()
  await page.keyboard.press('Enter')
  expect(await viewAsOf(page)).toBe('Logged out user')
  expect(await canvas.locator('#canvas').innerHTML()).toBe(signedOut)
})

test('R-167: an edit brings the other visitors\' dots back, and so does the undo of it', async ({ page }) => {
  await open(page)
  const pick = async (visitor) => {
    await page.locator('#editor-view-as').focus()
    await page.keyboard.press('Enter')
    // `openMenu` focuses the current row a frame after opening — wait for it, or it takes the focus back
    await expect(page.locator('#editor-view-as-menu [aria-current="true"]')).toBeFocused()
    await page.locator(`#editor-view-as-menu [data-visitor="${visitor}"]`).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-view-as-menu')).toBeHidden()
  }
  await pick('free')
  await pick('paid')
  expect(await dotted(page), 'all three looked at').toEqual([])
  const { page: own } = await rows(page)
  await select(page, own[0])
  await page.keyboard.press('Delete')
  // R-210: View as's record follows the canvas a frame later — the check waits for it, and checks nothing different
  await expect.poll(() => dotted(page), { message: 'an edit leaves the page viewed only as the visitor on screen' }).toEqual(['anonymous', 'free'])
  await pick('anonymous')
  await pick('free')
  expect(await dotted(page)).toEqual([])
  // undo is a change too: `restore()` calls `afterChange`, and nothing else checked that it does (review, 2026-09-21)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => dotted(page), { message: 'an undo is a change' }).toEqual(['anonymous', 'paid'])
})

test('no key binds View as: every single key leaves the visitor where it was (FR-D11 — R-145\'s table gains no row)', async ({ page }) => {
  await open(page)
  const was = await viewAsOf(page)
  // every printable character and the named keys a single-key shortcut could hide behind — the character range is
  // the list, never the map's own keys, so a binding added to the map later is pressed here too
  const keys = [...[...Array(94).keys()].map((n) => String.fromCharCode(33 + n)), 'Space', 'Enter', 'Delete', 'Backspace']
  for (const key of keys) {
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(key)
    // a key that opens a dialog (⇧R's confirm, ?'s card) is closed again, so the next key reaches the shell — and so is
    // Preview, which `p` enters since Story 5.15 and Esc leaves
    if ((await page.locator('dialog[open]').count()) > 0 || (await page.locator('#editor-preview-bar').count()) > 0) await page.keyboard.press('Escape')
    expect(await viewAsOf(page), `${key} changed the visitor`).toBe(was)
    expect(await said(page), `${key} announced a visitor`).not.toMatch(/The canvas is previewing/)
  }
  await expect(page.locator('#editor-view-as-menu')).toBeHidden()
  // and the `?` card, which lists exactly the keys that work (R-145), has no row for it
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('?')
  const sheet = page.locator('dialog[open][data-shortcuts-sheet]')
  await expect(sheet).toBeVisible()
  await expect(sheet).not.toContainText(/view as|preview as|visitor/i)
  await page.keyboard.press('Escape')
})

/* ── Story 5.10 — ⌘K and the Section Picker (FR-D11, FR-D12, `EXPERIENCE.md:502`) ───────────────────────────────
   Four requirements in one walk: ⌘K opens it, the arrows cross the grid, Enter places, Esc closes and focus
   returns to the invoking position. The dialog is native, so the last two are the platform's — which is exactly
   why they are asserted rather than assumed. */

const picker = (page) => page.locator('dialog[open][aria-label="Add a section"]')

/* WHERE it lands, not only THAT it lands (review, 2026-09-20): every other placement check compares lengths, so an
   insert that always appended would have passed them all. FR-D12: a section lands where it was invoked. */
test('a section added with ⌘K from a selected section lands directly after it, not at the end', async ({ page }) => {
  await open(page)
  const own = (await rows(page)).page
  expect(own.length, 'the control: there is a section AFTER the first, so "after it" and "at the end" differ').toBeGreaterThan(1)
  await page.locator(`[data-layer-row="${own[0]}"]`).focus()
  await page.keyboard.press('Enter')
  await chosen(page, own[0])
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(picker(page)).toBeVisible()
  // a canvas design, never a site-wide one: that one goes to the Site-wide group wherever it was invoked (R-152)
  await picker(page).locator('[data-cell]:not([aria-label*="Site-wide"])').first().focus()
  await page.keyboard.press('Enter')
  await expect(picker(page)).toHaveCount(0)
  // R-210: Layers follows the canvas a frame later — the check waits for it, and checks nothing different
  await expect.poll(async () => (await rows(page)).page).toHaveLength(own.length + 1)
  const after = (await rows(page)).page
  expect(after[0]).toBe(own[0])
  expect(own, 'the new row is the second, directly under the one it was invoked from').not.toContain(after[1])
  expect(after.slice(2)).toEqual(own.slice(1))
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(async () => (await rows(page)).page).toEqual(own)
})

test('⌘K opens the Section Picker, the arrows cross the grid, Enter places and Esc returns focus', async ({ page }) => {
  await open(page)
  const before = (await rows(page)).all.length
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(picker(page)).toBeVisible()

  // the rail lists only categories this canvas can take, each with its own count, under an `All sections` row that carries what is offered here (R-154)
  const rail = picker(page).locator('[role="radiogroup"] [role="radio"]')
  expect(await rail.count(), 'the picker must offer at least one category on Home').toBeGreaterThan(0)
  // the owner's test of 2026-09-20: the rail's first row is "All sections" with its own derived count, and the
  // heading under it is `CATEGORIES` — S5a's `ALL CATEGORIES` is that row's job now
  await expect(picker(page)).toContainText('CATEGORIES')
  await expect(picker(page)).not.toContainText('ALL CATEGORIES')
  await expect(picker(page).locator('[role="radio"]').first()).toContainText('All sections')
  // and the pack left the meta line with it
  await expect(picker(page)).not.toContainText(/shown in your pack/i)
  // R-150: the rail footer's Free only switch is NOT built — absent, never greyed
  await expect(picker(page)).not.toContainText(/free only/i)

  // the grid's one Tab stop, then the arrows. Since the owner's test of 2026-09-20 the grid is a REAL grid of
  // four columns, which runs ACROSS its rows in DOM order — so the neighbouring card is one step RIGHT, and one
  // step DOWN is a whole row. A SITE-WIDE card is deliberately not the one walked from — picking one REPLACES the
  // site's header rather than adding a section (R-152), which is its own assertion below.
  const cells = picker(page).locator('[data-cell]:not([aria-label*="Site-wide"])')
  const total = await cells.count()
  expect(total, 'the grid must draw at least two page cards to walk between').toBeGreaterThan(1)
  await cells.first().focus()
  const first = await page.evaluate(() => document.activeElement?.dataset.design)
  await page.keyboard.press('ArrowRight')
  const second = await page.evaluate(() => document.activeElement?.dataset.design)
  expect(second, 'ArrowRight moves to the next card').not.toBe(first)
  await page.keyboard.press('ArrowLeft')
  expect(await page.evaluate(() => document.activeElement?.dataset.design)).toBe(first)
  // and ↓ is the other axis: a whole row of the grid, which on a short library is the last card it holds
  await page.keyboard.press('ArrowDown')
  expect(await page.evaluate(() => document.activeElement?.dataset.design), 'ArrowDown crosses a row').not.toBe(first)
  await cells.first().focus()

  // Enter places: one section more, the picker closed behind it, and the placement announced politely
  await page.keyboard.press('Enter')
  await expect(picker(page)).toHaveCount(0)
  // R-210: Layers follows the canvas a frame later — each check waits for it, and checks nothing different
  await expect.poll(async () => (await rows(page)).all).toHaveLength(before + 1)
  expect(await said(page)).toMatch(/added/)

  // and one ⌘Z puts it back — one gesture, one edit, one undo step (AD-15, AD-16)
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(async () => (await rows(page)).all).toHaveLength(before)

  // Esc closes and the platform returns focus to whatever opened it
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(picker(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(picker(page)).toHaveCount(0)
  expect(await focused(page), 'focus returns to the invoking position').toBe('SECTION[Canvas]')
  expect((await rows(page)).all).toHaveLength(before)
})

test('R-152: a site-wide card carries the globe, and a second one REPLACES the first in one ⌘Z-able edit', async ({ page }) => {
  await open(page)
  const before = await rows(page)
  await page.locator('#editor-add-section').focus()
  await page.keyboard.press('Enter')
  await expect(picker(page)).toBeVisible()
  const card = picker(page).locator('[data-cell][aria-label*="Site-wide"]').first()
  // the words are one string: the globe's hover title IS the card's accessible name (R-152)
  const words = 'Site-wide — shows on every template'
  expect(await card.getAttribute('aria-label')).toContain(words)
  await expect(picker(page).locator(`[title="${words}"]`).first()).toBeAttached()
  // and in the owner's own words there is no sentence, toast or banner about it anywhere
  await expect(picker(page)).not.toContainText(/shows on every template\./)

  await card.focus()
  await page.keyboard.press('Enter')
  await expect(picker(page)).toHaveCount(0)
  // R-210: Layers follows the canvas a frame later — each check waits for it, and checks nothing different
  await expect.poll(async () => (await rows(page)).site).not.toEqual(before.site)
  const after = await rows(page)
  expect(after.site, 'one header replaces the other — the site never gains a second').toHaveLength(before.site.length)
  expect(after.site).not.toEqual(before.site)
  expect(await said(page)).toMatch(/Site-wide group/)
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(async () => (await rows(page)).site).toEqual(before.site)
})

test('⌘K with the caret in a field does NOT open the picker — it is the link mark there', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])
  await openEveryGroup(page)
  // the panel's own rich Text Area runs the same controller the canvas does (`lib/inline.ts`)
  const field = page.locator('#editor-controls [contenteditable="true"], #editor-controls textarea, #editor-controls input[type="text"]').first()
  await field.focus()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(page.locator('dialog[open]')).toHaveCount(0)
  // and a contenteditable IN THE CANVAS DOCUMENT, which is where the caret usually is
  await caretIntoCanvas(page)
  await page.keyboard.press('ControlOrMeta+k')
  await expect(page.locator('dialog[open]')).toHaveCount(0)
})

// ── keyboard completeness: every drag has a keyboard path, and the toolbar is reachable ─────────────────────────

test("the picker is KEPT once opened, so a second ⌘K shows the pictures already drawn (the owner's ruling of 2026-09-20)", async ({ page }) => {
  await open(page)
  // nothing is carried by an editor that has never opened it
  expect(await page.locator('dialog[aria-label="Add a section"]').count(), 'a resting editor holds no picker at all').toBe(0)

  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(picker(page)).toBeVisible()
  await expect.poll(() => page.locator('dialog[aria-label="Add a section"] iframe').count()).toBeGreaterThan(0)
  // THE PICTURES ARE DRAWN BEFORE THE PICKER CLOSES — the claim is about pictures ALREADY drawn. Pressing Esc while a
  // frame is still loading (a cold `next dev` compiles the preview route on its first request) left the second open
  // reading 0 of 7 painted: in CI on 7a421892 and again on a cold harness, Story 5.16's Dev, 2026-09-22
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('dialog[aria-label="Add a section"] iframe')]
    .every((f) => (f.contentDocument?.getElementById('canvas')?.children.length ?? 0) > 0)), { timeout: 30_000 }).toBe(true)
  // mark the frames that exist now; if the picker is thrown away the marks go with them
  const drawn = await page.evaluate(() => {
    const frames = [...document.querySelectorAll('dialog[aria-label="Add a section"] iframe')]
    frames.forEach((f, n) => { f.dataset.keptMark = String(n) })
    return frames.length
  })

  await page.keyboard.press('Escape')
  await expect(picker(page)).toHaveCount(0)
  // closed, but KEPT: the dialog is still in the tree, hidden, with its frames alive
  expect(await page.locator('dialog[aria-label="Add a section"]').count(), 'the picker is kept after it closes').toBe(1)

  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(picker(page)).toBeVisible()
  const kept = await page.evaluate(() => {
    const frames = [...document.querySelectorAll('dialog[aria-label="Add a section"] iframe')]
    return {
      marked: frames.filter((f) => f.dataset.keptMark !== undefined).length,
      // and they are still PAINTED — the second open draws nothing again (the marked ones: a card scrolled near later
      // may add a frame of its own)
      painted: frames.filter((f) => f.dataset.keptMark !== undefined && (f.contentDocument?.getElementById('canvas')?.children.length ?? 0) > 0).length,
    }
  })
  expect(kept.marked, 'every preview frame survived the close — none was re-created').toBe(drawn)
  expect(kept.painted, 'and every one is still drawn, so the second open waits for nothing').toBe(drawn)
})

test("choosing a Layers row scrolls the canvas to that section, with air above it (the owner's ruling of 2026-09-20)", async ({ page }) => {
  await open(page)
  const all = (await rows(page)).all
  const GAP = 24

  const scrollY = () => page.evaluate(() => document.querySelector('section[aria-label="Canvas"] iframe').contentWindow.scrollY)
  /** How far the section of a given row sits below the canvas's top edge, right now. The scroll is SMOOTH, so every
   *  assertion POLLS this rather than reading it once — a value read mid-animation is not the resting one. */
  const topOf = (key) => page.evaluate((k) => {
    const f = document.querySelector('section[aria-label="Canvas"] iframe')
    const n = [...document.querySelectorAll('[data-layer-row]')].findIndex((r) => r.dataset.layerRow === k)
    const root = f.contentDocument.querySelectorAll('#canvas > *')[n]
    return root ? Math.round(root.getBoundingClientRect().top) : null
  }, key)

  // BOTH ENDS OF THE WALK ARE DERIVED, and each exclusion is a real case rather than a fixture quirk. A STICKY
  // section (a site-wide header) travels with the viewport, so it is in view wherever the page is and the reveal
  // leaves it alone. A section near the document's END cannot be brought to the top at all — the browser runs out
  // of scroll and clamps — so asserting the gap on it would assert the wrong thing.
  const walk = await page.evaluate((keys) => {
    const f = document.querySelector('section[aria-label="Canvas"] iframe')
    const d = f.contentDocument.documentElement
    const room = d.scrollHeight - d.clientHeight
    const bodies = f.contentDocument.querySelectorAll('#canvas > *')
    const list = [...document.querySelectorAll('[data-layer-row]')].map((r) => r.dataset.layerRow)
    let near = null
    let far = null
    let sticky = null
    keys.forEach((k) => {
      const root = bodies[list.indexOf(k)]
      if (!root) return
      if (['sticky', 'fixed'].includes(f.contentWindow.getComputedStyle(root).position)) { sticky ??= k; return }
      const top = root.getBoundingClientRect().top + f.contentWindow.scrollY
      if (top + 24 <= room) { near ??= k; far = k }
    })
    return { near, far, sticky, room }
  }, all)
  expect(walk.room, 'the fixture canvas must be taller than its viewport for this to mean anything').toBeGreaterThan(0)
  expect(walk.far, 'the fixture must hold a section below the fold that is not at the very end').not.toBeNull()
  expect(walk.near, 'and one above it to come back to').not.toBeNull()
  expect(walk.far).not.toBe(walk.near)

  expect(await scrollY()).toBe(0)
  await select(page, walk.far)
  await expect.poll(scrollY, { message: 'the canvas scrolled to the chosen section' }).toBeGreaterThan(0)
  // THE WHOLE OF THE RULING, IN ONE NUMBER: it comes to rest exactly that much below the top edge — in view, and
  // not against it
  await expect.poll(() => topOf(walk.far), { message: 'the chosen section settles a little below the top edge' }).toBe(GAP)

  // and back up, so the reveal is a real scroll rather than a one-way trip
  await select(page, walk.near)
  await expect.poll(() => topOf(walk.near)).toBe(GAP)

  // a STICKY section is already in view wherever the page is, so choosing it moves nothing at all
  if (walk.sticky) {
    const before = await scrollY()
    await select(page, walk.sticky)
    await page.waitForTimeout(600)
    expect(await scrollY(), 'a sticky section is in view by construction — the reveal must not nudge the page').toBe(before)
  }
})

test('the Layers row answers ⌥↑ / ⌥↓, and the move is announced in its own words', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  expect(own.length, 'the fixture must hold two page sections to move one past the other').toBeGreaterThan(1)
  await page.locator(`[data-layer-row="${own[0]}"]`).focus()
  await page.keyboard.press('Alt+ArrowDown')
  // R-210: Layers follows the canvas a frame later — each check waits for it, and checks nothing different; the row
  // takes its focus back in the move's own commit, so the next key finds it
  await expect.poll(async () => (await rows(page)).page[1]).toBe(own[0])
  expect(await said(page)).toMatch(/\S/)
  await expect(page.locator(`[data-layer-row="${own[0]}"]`)).toBeFocused()
  await page.keyboard.press('Alt+ArrowUp')
  await expect.poll(async () => (await rows(page)).page[0]).toBe(own[0])

  // THE OTHER DRAG SURFACE, the item list's handle, is NOT walked here and cannot be: no section in the harness
  // fixture draws an item list (executed at review, 2026-09-19 — every row selected, every group opened, no
  // `[data-handle]`). Its ⌥↑ / ⌥↓ is Story 4.5's and is walked on the deployed /pilots page by
  // `tools/probe/run-verify-controls.cjs`.
})

test('§7.3(3): ⌥F10 reaches the mark toolbar, ← → move between marks, Esc restores the selection', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])
  await openGroup(page)
  const rich = page.locator('#editor-controls [contenteditable="true"]').first()
  await rich.focus()
  await page.keyboard.press('ControlOrMeta+a')
  // THE TOOLBAR APPEARING IS THE SIGNAL, not a sleep: `lib/inline.ts`'s `report` runs on `selectionchange`, and until
  // it has run the controller holds no selection for ⌥F10 to raise the toolbar over (executed — without this the key
  // arrived first and did nothing).
  const toolbar = page.locator('[role="toolbar"][aria-label="Text formatting"]')
  await expect(toolbar).toBeVisible()
  const held = await page.evaluate(() => document.getSelection()?.toString() ?? '')
  expect(held.length, 'there must be a live text selection for the toolbar to act on').toBeGreaterThan(0)

  await page.keyboard.press('Alt+F10')
  await page.waitForFunction(() => document.activeElement?.closest('[role="toolbar"]') !== null)
  const first = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
  expect(first, 'focus moves INTO the toolbar').toBeTruthy()
  await page.keyboard.press('ArrowRight')
  const next = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
  expect(next, 'the roving tabindex moves between marks').not.toBe(first)

  await page.keyboard.press('Escape')
  expect(await page.evaluate(() => document.getSelection()?.toString() ?? ''), 'Esc restores the exact selection').toBe(held)
})

// ── DW-167: the settings panel's reset wiring, its confirm and its Esc ──────────────────────────────────────────

test('DW-167: the panel\'s reset asks first, opens on Cancel, and Esc leaves the section untouched', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])

  // with nothing changed it says so under itself rather than asking (R-12)
  const reset = page.locator('#editor-controls button', { hasText: 'Reset this design' })
  await reset.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-controls').getByText('Nothing to reset')).toBeVisible()
  await expect(page.locator('dialog[open]')).toHaveCount(0)

  // CHANGE ONE CONTROL from the keyboard, and the same press now asks. A CONTROL and not a content prop:
  // `resetChanges` counts control and data rows, which is what decides whether the press asks or says there is
  // nothing to reset.
  await openEveryGroup(page)
  // a pill row's words ARE its label (R-114's rows print them), so the choice is read as text
  const pill = page.locator('#editor-controls [role="radio"][tabindex="0"]').first()
  await pill.focus()
  const wasPill = await page.evaluate(() => document.activeElement?.textContent?.trim())
  await page.keyboard.press('ArrowRight')
  const changed = await page.evaluate(() => document.activeElement?.textContent?.trim())
  expect(changed, 'the arrow must really move the choice — the Kit\'s own `radioKeys`').not.toBe(wasPill)

  await reset.focus()
  await page.keyboard.press('Enter')
  const confirm = page.locator('dialog[open]')
  await expect(confirm).toBeVisible()
  await expect(confirm).toContainText('Reset this design?')
  await expect(page.locator('dialog[open] [data-cancel]')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('dialog[open]')).toHaveCount(0)

  // AND THE CHANGE IS STILL THERE: the same press asks again, which it could only do while something is changed
  await reset.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('dialog[open]')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('dialog[open]')).toHaveCount(0)
})

/* ── Story 5.11 — THE DESIGN RING (FR-D19, FR-D13, R-145, R-158) ───────────────────────────────────────────────
   `[` and `]` are the third and fourth of R-145's owed keys to arrive with their action, and the FIRST that are
   single-key: the whole of WCAG 2.1.4's condition rides on them, which is why the last expectation below — `[`
   typing a bracket into a panel field and changing nothing — is the most important one on this page.

   IT WALKS A REAL RING. The shipped library holds one design per category, so the harness carries the three
   fixture designs of `packages/library/fixtures/controls/` (R-158) and one section of that category: design 1
   declares `tint` and design 2 does not, so parking and restoring are a real declaration rather than a mock. */

/** The one section here whose category holds more than one design — the LAST of the page's own rows, because the
 *  harness appends the fixture ring after the pilots. Asserted rather than assumed: a reordering that broke it
 *  would otherwise make every expectation below vacuous. */
async function selectRinged(page) {
  const own = (await rows(page)).page
  const key = own[own.length - 1]
  await select(page, key)
  await expect(
    page.locator('#editor-design-count'),
    'the harness must carry a section whose category holds a ring, or this stop proves nothing',
  ).not.toHaveText('1 of 1')
  return key
}

const counter = (page) => page.locator('#editor-design-count')
const tintRow = (page) => page.locator('#editor-controls [id$="-control-tint"]')
const tintValue = (page) => tintRow(page).locator('[role="radio"][aria-checked="true"]').innerText()
const imageRow = (page) => page.locator('#editor-controls [id$="-control-image"]')
const imageValue = (page) => imageRow(page).locator('[role="radio"][aria-checked="true"]').innerText()

test('R-145: `]` moves to the next design and announces its position, `[` comes back', async ({ page }) => {
  const canvas = await open(page)
  await selectRinged(page)
  await expect(counter(page)).toHaveText(/^1 of \d+$/)
  const first = await page.locator('#editor-design-name').innerText()

  // The settle lives 180ms, and on a loaded runner the awaits below outlast it — CI's red on 95b3f568 was exactly
  // that (the attribute came and went before the first poll). So watch from BEFORE the key: the frame records that
  // it saw the attribute, and the assertion reads the record rather than racing the fade.
  await canvas.locator('body').evaluate((b) => {
    const d = b.ownerDocument
    d.defaultView.__swapSeen = 0
    new MutationObserver(() => {
      if (d.querySelector('[data-inflozo-swapped]')) d.defaultView.__swapSeen++
    }).observe(d, { attributes: true, childList: true, subtree: true })
  })
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press(']')
  await expect(counter(page)).toHaveText(/^2 of \d+$/)
  await expect(page.locator('#editor-design-name')).not.toHaveText(first)
  // EXPERIENCE.md:878's settle: the swapped root carries `data-inflozo-swapped` for the fade's own 180ms and then
  // loses it — at rest the canvas is still the site (review, 2026-09-20: nothing had asserted either half)
  const swapped = canvas.locator('[data-inflozo-swapped]')
  await expect
    .poll(() => canvas.locator('body').evaluate((b) => b.ownerDocument.defaultView.__swapSeen), 'the incoming root carries the settle')
    .toBeGreaterThan(0)
  await expect(swapped, 'and loses it when the fade is over').toHaveCount(0, { timeout: 2000 })
  // UX-DR12: the position AND the design, politely
  expect(await said(page)).toMatch(/^Design 2 of \d+ — .+/)

  await page.keyboard.press('[')
  await expect(counter(page)).toHaveText(/^1 of \d+$/)
  await expect(page.locator('#editor-design-name')).toHaveText(first)

  // UX-DR5: past the last wraps rather than dying — `[` from the first is the same rule backwards. R-210: the counter is
  // the panel's, which follows the canvas a frame later — the check waits for it, and checks nothing different
  const of_ = (await counter(page).innerText()).match(/of (\d+)/)[1]
  await page.keyboard.press('[')
  await expect(counter(page), 'a dead key at the end of a list reads as broken (UX-DR5)').toHaveText(`${of_} of ${of_}`)
})

test('FR-D19: a setting only the design you LEAVE has is parked, and comes back exactly', async ({ page }) => {
  await open(page)
  await selectRinged(page)
  // `tint` is design 1's alone in the fixture ring, and it is the library's only dark-override control
  await expect(tintRow(page), 'the first design declares Card tint').toHaveCount(1)
  const style = page.locator('#editor-controls button[id$="-group-style"]')
  await style.focus()
  await page.keyboard.press('Enter')
  const was = await tintValue(page)
  await tintRow(page).locator('[role="radio"][tabindex="0"]').focus()
  await page.keyboard.press('ArrowRight')
  const chosen_ = await tintValue(page)
  expect(chosen_, 'the control really changed, or nothing below is parked').not.toBe(was)

  // STORY 5.23 (R-205) — AND A SETTING THE NEXT DESIGN SHARES: Image position, which the second design declares and the
  // third does not. As built at 5.11 it travelled on to the second design and was put aside against IT when the third
  // lacked it, so the first came back on its default; every design now remembers itself, so it comes back as it was left
  const layout = page.locator('#editor-controls button[id$="-group-layout"]')
  if ((await layout.getAttribute('aria-expanded')) !== 'true') {
    await layout.focus()
    await page.keyboard.press('Enter')
  }
  const imageWas = await imageValue(page)
  await imageRow(page).locator('[role="radio"][tabindex="0"]').focus()
  await page.keyboard.press('ArrowRight')
  const imageChosen = await imageValue(page)
  expect(imageChosen, 'Image position really changed, or nothing below is remembered').not.toBe(imageWas)

  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press(']')
  await expect(tintRow(page), 'the design you moved to does not declare it, so the row is gone').toHaveCount(0)
  await expect(imageRow(page), 'the design you moved to SHARES Image position, so its row stays').toHaveCount(1)

  // THE LONG WAY ROUND: a parked value must survive an INTERMEDIATE design, which is why the ring holds three
  const length = Number((await counter(page).innerText()).match(/of (\d+)/)[1])
  for (let n = 1; n < length; n++) await page.keyboard.press(']')
  await expect(counter(page)).toHaveText(`1 of ${length}`)
  await expect(tintRow(page)).toHaveCount(1)
  expect(await tintValue(page), 'the parked value must come back exactly as it was left').toBe(chosen_)
  expect(await imageValue(page), 'a SHARED setting comes back exactly as it was left too (R-205)').toBe(imageChosen)
})

test("EXPERIENCE.md:503 — `← →` cross the thumbnail strip, mirroring `[` and `]`", async ({ page }) => {
  await open(page)
  await selectRinged(page)
  const strip = page.locator('[data-design-strip]')
  await expect(strip).toHaveCount(1)
  const marked = strip.locator('[role="option"][tabindex="0"]')
  await marked.focus()
  const from = await page.evaluate(() => document.activeElement?.dataset.designTile)
  await page.keyboard.press('ArrowRight')
  const to = await page.evaluate(() => document.activeElement?.dataset.designTile)
  expect(to, 'the arrow must move focus across the strip').not.toBe(from)
  // and pressing the focused tile is the swap
  await page.keyboard.press('Enter')
  await expect(counter(page)).toHaveText(/^2 of \d+$/)
})

test('WCAG 2.1.4: with the caret in a field `[` types a bracket and the design does not change', async ({ page }) => {
  await open(page)
  await selectRinged(page)
  const before = await counter(page).innerText()
  await openGroup(page)
  const field = page.locator('#editor-controls input[type="text"]:visible').first()
  await field.focus()
  await expect(field, 'a field nothing focused would prove nothing').toBeFocused()
  const was = await field.inputValue()
  await page.keyboard.type('[]')
  await expect(field).toHaveValue(`${was}[]`)
  await expect(counter(page), 'the most important row of this story\'s matrix').toHaveText(before)

  // and in a canvas contenteditable, which is where the caret usually is
  await caretIntoCanvas(page)
  await page.keyboard.type('[]')
  await expect(counter(page)).toHaveText(before)
})

/* THE PANEL BLOCK IS THE LABEL, THE COUNTER, THE STRIP AND THE NAME — and nothing else (the owner's test of the
   deployed page, 2026-09-20, findings 2, 3 and 4). The `Try a design` card and the `Cycle designs` footer were
   both built and both removed; Shuffle's one seat is the section's pill, which is pointer-only and therefore
   `run-verify-controls.cjs`'s to press, not this file's (`:128` refuses a mouse API anywhere in it).

   So what this stop guards is that removing them cost the KEYBOARD nothing: every design in the ring is still
   reachable by `]` alone, and one `⌘Z` still undoes one step. */
test('the block carries no Shuffle card and no key chips, and `]` alone still reaches every design in one-edit steps', async ({ page }) => {
  await open(page)
  await selectRinged(page)
  await expect(page.locator('[data-try-design]'), 'the panel\'s Shuffle card is gone (finding 3)').toHaveCount(0)
  await expect(page.locator('#editor-design kbd'), 'the `Cycle designs` footer is gone (finding 4)').toHaveCount(0)
  await expect(counter(page), 'the counter no longer says the word its label says (finding 2)').not.toHaveText(/Design/)

  const start = await counter(page).innerText()
  const length = Number(start.match(/of (\d+)/)[1])
  expect(length, 'a ring of one would make every expectation below vacuous').toBeGreaterThan(1)
  await page.locator('section[aria-label="Canvas"]').focus()
  const seen = new Set([start])
  for (let n = 1; n < length; n++) {
    const was = await counter(page).innerText()
    await page.keyboard.press(']')
    // R-210: the counter is the panel's, which follows the canvas a frame later — read once it has moved
    await expect(counter(page)).not.toHaveText(was)
    seen.add(await counter(page).innerText())
  }
  expect(seen.size, 'every design in the ring is reachable by the key alone').toBe(length)
  // ONE EDIT PER STEP: a press is one gesture, so one ⌘Z puts one back (AD-15, AD-16)
  await page.keyboard.press('ControlOrMeta+z')
  await expect(counter(page)).toHaveText(`${length - 1} of ${length}`)
  expect(await said(page)).toMatch(/^Design \d+ of \d+ — .+/)
})

/* The matrix's "site-wide section" row. A site-wide section is ONE shared instance, which is why FR-D5 takes its
   Duplicate away — and the ring is the case where that reasoning does NOT apply: which design an instance is drawn
   as is the same question wherever it compiles, so the Design block is drawn for it exactly as it is for a page
   section, counting by its RING and never by its doc. `apply` then writes whichever doc the selection names, which
   is the one line every operation in this editor shares.

   `a1/1` is a ring of one today, so this stop cannot swap it; what it CAN prove is the thing a carve-out copied
   from `duplicate`'s arm would break — that the block is there at all, and answers by the ring. */
test('FR-D5 does not reach the ring: a site-wide section has the same Design block, counting by its ring and not its doc', async ({ page }) => {
  await open(page)
  const { site } = await rows(page)
  expect(site.length, 'the harness must carry a site-wide section, or this stop proves nothing').toBeGreaterThan(0)
  await select(page, site[0])
  await expect(page.locator('#editor-design'), 'the block is drawn for a site-wide section too').toHaveCount(1)
  await expect(counter(page)).toHaveText(/^\d+ of \d+$/)
  await expect(page.locator('#editor-design-name')).not.toBeEmpty()

  // and it reads the RING: this one holds a single design, so the block says so in the same words a page section
  // with one design uses — absent arrows, never greyed ones (UX-DR3, R-118)
  const [at, of_] = (await counter(page).innerText()).match(/(\d+) of (\d+)/).slice(1)
  if (of_ === '1') {
    await expect(page.locator('#editor-design [data-design-step]')).toHaveCount(0)
    await expect(page.locator('#editor-design-note')).toHaveText(/one design/)
  } else {
    expect(Number(at)).toBeLessThanOrEqual(Number(of_))
    await expect(page.locator('#editor-design [data-design-step]')).toHaveCount(2)
  }
})

/* ── DW-182 (Story 5.24d) — TWO RULES OF THE CANVAS'S EDITING SESSION, reached at last. The pilots declare no limit, but the
   fixture ring's heading does (`packages/library/fixtures/controls/content.json`), and a lost window CAN be simulated: the
   guard asks the TOP page `document.hasFocus()`, which the page can answer for itself. The session starts as a pointer
   starts it — the canvas document's own press, synthesized (the header's third) — and the keys type. */
const RING_CONTENT = JSON.parse(readFileSync(new URL('../../packages/library/fixtures/controls/content.json', import.meta.url), 'utf8'))
/** The selected ring fixture's heading, its editing session started as a pointer starts it — the canvas document's own
 *  press, synthesized (the header's third) — with the caret in it. Its words, or null where no session started. */
const startHeading = (page) =>
  canvasFrame(page).locator('#canvas').evaluate((c, words) => {
    const root = c.querySelector(':scope > [data-inflozo-selected]')
    const el = [...root.querySelectorAll('*')].filter((e) => e.textContent.trim() === words).at(-1)
    if (!el) return null
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }))
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }))
    // a synthesized press has no default action, so the caret a real one would leave is given by hand
    el.focus()
    return el.hasAttribute('data-inflozo-editing') && el.ownerDocument.activeElement === el ? el.textContent : null
  }, RING_CONTENT.props.heading.default)

test('DW-182: past the heading\'s limit the canvas says so and the words stay at the limit; a lost window keeps the session, and a blur once it is back ends it', async ({ page }) => {
  const heading = RING_CONTENT.props.heading
  await open(page)
  await selectRinged(page)
  const started = await startHeading(page)
  expect(started, 'the control: a press on the heading starts a session that holds the caret').toBe(heading.default)
  const editing = canvasFrame(page).locator('[data-inflozo-editing]')
  // past the limit: every character after the fortieth is refused, and the pill says so in the field's own words
  await page.keyboard.type('x'.repeat(heading.maxChars - heading.default.length + 5))
  const note = () => canvasFrame(page).locator('body').evaluate((body) =>
    [...body.ownerDocument.querySelectorAll('[data-inflozo-chrome]')]
      .flatMap((h) => [...(h.shadowRoot?.querySelectorAll('[data-chrome="note"]') ?? [])]).map((n) => n.textContent.trim()))
  await expect.poll(note, 'the limit\'s pill').toEqual([`${heading.label} holds ${heading.maxChars} characters.`])
  expect(await editing.evaluate((el) => el.textContent.length), 'the words stay at the limit').toBe(heading.maxChars)
  // DW-256 (Story 5.24e): and the pill draws its shadow (P0-1 :142). In the chrome's shadow root Tailwind's four shadow
  // variables are unregistered, so `shadow-md` computed to `none` until the host declared them. The control: the same
  // class in the editor's own document computes a shadow, so `none` in the layer is the layer's doing and not the class's
  const shadowOf = await canvasFrame(page).locator('body').evaluate((body) => {
    const pill = [...body.ownerDocument.querySelectorAll('[data-inflozo-chrome]')]
      .flatMap((h) => [...(h.shadowRoot?.querySelectorAll('[data-chrome="note"]') ?? [])])[0]
    return pill ? getComputedStyle(pill).boxShadow : null
  })
  const probe = await page.evaluate(() => {
    const el = document.createElement('div')
    el.className = 'shadow-md'
    document.body.append(el)
    const shadow = getComputedStyle(el).boxShadow
    el.remove()
    return shadow
  })
  expect(probe, 'the control: shadow-md draws a shadow in the editor\'s own document').not.toBe('none')
  expect(shadowOf, 'the limit pill in the chrome layer draws its shadow').not.toBe('none')
  // a window that lost focus (another tab, another app) keeps the session
  await page.evaluate(() => { document.hasFocus = () => false })
  await editing.evaluate((el) => el.blur())
  await expect(editing, 'the window was lost, not the field: the session stays').toHaveCount(1)
  // …and once the window is back, a blur ends it
  await page.evaluate(() => { delete document.hasFocus })
  await editing.evaluate((el) => { el.focus(); el.blur() })
  await expect(editing, 'focus that moved away within the window ends it').toHaveCount(0)
})

/* ── Story 5.12 — SITE REMIX (FR-D17, R-145, R-161, R-163) ──────────────────────────────────────────────────
   `⇧R` is R-145's fourth owed key to arrive with its action, and the first SHIFTED single key — so the last
   stop below, a capital R typed into a panel field while nothing rolls, is the one the owner called the most
   important step of his own test.

   The whole re-roll is ONE transaction, which is FR-D17's hard requirement and the reason R-161 scoped the dice
   to the canvas you are on: one press, one `⌘Z`, asserted here rather than reasoned about.

   SINCE R-164 THE ORDER IS QUESTION FIRST, ROLL SECOND: a press opens the confirm AT ONCE, and the cube tumbles
   only on the confirmed Remix, with the canvas landing as it settles. Every stop below asserts that order, because
   the first build had it the other way round and the owner asked for this one. */

const remixDialog = (page) => page.locator('dialog[data-remix-confirm][open]')
const designName = (page) => page.locator('#editor-design-name')

test('R-164: ⇧R opens the confirm AT ONCE on Cancel, and Esc leaves the canvas untouched', async ({ page }) => {
  await open(page)
  await selectRinged(page)
  const before = { design: await designName(page).innerText(), counter: await counter(page).innerText(), said: await said(page) }
  const resting = await page.locator('.remix-dice__cube').evaluate((el) => getComputedStyle(el).transform)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Shift+R')

  // R-164: THE QUESTION COMES FIRST. Nothing has been decided, so nothing animates — the confirm is up inside a
  // frame rather than after the cube's ~900ms, which is the whole of what the owner asked to be turned round.
  await expect(remixDialog(page)).toBeVisible({ timeout: 250 })
  expect(
    await page.locator('.remix-dice__cube').evaluate((el) => getComputedStyle(el).transform),
    'and the cube has not moved: the roll belongs to the confirmed Remix',
  ).toBe(resting)
  await expect(page.locator('dialog[open] [data-cancel]'), 'an irreversible confirm opens on cancel (R-115)').toBeFocused()
  // the count is DERIVED and named in the sentence (standing rule 4); a zero here would make the stop vacuous
  const sentence = await page.locator('#editor-remix-body').innerText()
  expect(sentence).toMatch(/^Re-rolls [1-9]\d* sections? on Home to a different design in its own category\./)
  await expect(page.locator('[data-remix-go]'), 'there is something to remix, so the coral button is there').toHaveCount(1)
  // R-161: no tick-box and no "Re-roll where" — ABSENT, never greyed (UX-DR3, R-118). Story 6.3: B8's "Re-roll what" is
  // the one group, its three radio cards opening on Designs where a ring moves
  await expect(remixDialog(page).locator('input[type="checkbox"], [role="checkbox"]')).toHaveCount(0)
  await expect(remixDialog(page).locator('input[type="radio"]')).toHaveCount(REMIX.REMIX_CHOICES.length)
  await expect(remixDialog(page).locator('input[value="designs"]')).toBeChecked()
  await expect(remixDialog(page)).not.toContainText(/Every page|header and footer|Re-roll where/i)

  // THE DIALOG OWNS THE KEY while it is up (the matrix's own row): `remix` is a SINGLE_KEY, so `onShortcut`'s
  // owner selector is `:popover-open, dialog[open]` and a second ⇧R is refused before it reaches the dice
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page), 'one dialog, and the press did not stack a second roll behind it').toHaveCount(1)
  await expect(page.locator('dialog[open] [data-cancel]'), 'and it did not move focus either').toBeFocused()

  await page.keyboard.press('Escape')
  await expect(remixDialog(page)).toHaveCount(0)
  // FOCUS COMES BACK TO THE DICE, and it is said rather than left to the user agent: `onMouseDown` is prevented on
  // the button, so a mouse-opened confirm would otherwise restore focus to whatever held it — `<body>` at worst
  await expect(page.locator('#editor-remix'), 'Cancel returns focus to the control that opened it').toBeFocused()
  expect(await designName(page).innerText(), 'Cancel changes nothing').toBe(before.design)
  expect(await counter(page).innerText()).toBe(before.counter)
  expect(await said(page), 'and announces nothing').toBe(before.said)
})

/* THE MATRIX'S "RE-PRESS MID-ROLL", as R-164 leaves it: the cube is in the air only AFTER a confirmed Remix, and
   a press landing there must not re-open the question over a re-roll already on its way. The guard is the dice's
   own rolling flag; without it the second `transitionend` would fire `onRemix` twice and cost two `⌘Z` presses. */
test('a press while the cube is in the air is ignored — one roll, one re-roll', async ({ page }) => {
  await open(page)
  await selectRinged(page)
  const was = await designName(page).innerText()
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page)).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.locator('[data-remix-go]')).toBeFocused()
  await page.keyboard.press('Enter')
  // the control: the cube really is still running, so this stop is not passing on a roll that already landed
  await expect(remixDialog(page), 'the confirm is gone and the die is running').toHaveCount(0)
  expect(await designName(page).innerText(), 'and the canvas has not changed yet — the roll IS the wait').toBe(was)

  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page), 'a press mid-roll opens nothing').toHaveCount(0)

  // it lands once, and one ⌘Z is still the whole of it
  await expect(designName(page)).not.toHaveText(was)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(designName(page), 'one press, one undo — the ignored press wrote nothing').toHaveText(was)

  // and nothing is stuck: the dice still answers afterwards
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page), 'the rolling flag came off when the cube settled').toBeVisible()
})

test('FR-D17: Remix re-rolls the canvas in ONE transaction — one press, one ⌘Z, and the count announced', async ({ page }) => {
  await open(page)
  await selectRinged(page)
  const was = await designName(page).innerText()
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page)).toBeVisible()
  // from Cancel, the next stop is the coral primary — the dialog is two buttons and a line of words
  await page.keyboard.press('Tab')
  await expect(page.locator('[data-remix-go]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(remixDialog(page)).toHaveCount(0)

  // R-164: THE CUBE RUNS WHILE THE RE-ROLL ARRIVES, and the canvas lands as it settles — so the die is turning
  // for exactly as long as the remix takes, which is what the owner asked for
  const spun = await page.locator('.remix-dice__cube').evaluate((el) => getComputedStyle(el).transitionDuration)
  expect(parseFloat(spun), 'the roll is the ~900ms one, not the app\'s usual 160').toBeGreaterThan(0.5)
  await expect(designName(page), 'every section with somewhere to go is drawn as a different design').not.toHaveText(was)
  // UX-DR12 / EXPERIENCE.md:541 — a polite canvas-status announcement, never a toast
  expect(await said(page)).toMatch(/^Remixed [1-9]\d* sections? on Home\.$/)
  // NO TOAST (B8 drew one): the count is spoken through the editor's one POLITE region and is never drawn, so
  // the sentence exists nowhere a reader can see it
  await expect(page.locator('#editor-said')).toHaveClass(/sr-only/)
  await expect(page.locator('#editor-said')).toHaveAttribute('aria-live', 'polite')

  // ONE press, ONE undo (AD-15, AD-16): the whole re-roll is one journal entry
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(designName(page), 'one ⌘Z puts the whole canvas back exactly').toHaveText(was)
})

/* THE SIX FACES MUST BE SIX DIFFERENT FACES, and this stop exists because they were not (R-164, the owner's
   own report: "the dice should show different number dots on each face"). Every pip is a gradient LAYER, and a
   layer defaults to `background-size: auto` — the full 18px box — at which size a percentage `background-position`
   resolves to `(box - layer) x pct` = 0 and all six faces drew ONE centred dot.

   IT MEASURES THE RESOLVED GEOMETRY, NEVER THE RULE. Reading `background-size` back would assert the CSS it was
   handed; this computes where each pip actually lands from the box and the layer, so removing the size line puts
   every centre on top of every other and the counts collapse to 1. The measurement is `tools/probe/die-pips.cjs`, the ONE
   copy both deployed walks run too (DW-216). */
test('R-164: each of the cube\'s six faces draws its own number of pips, in its own places', async ({ page }) => {
  await open(page)
  const faces = await page.locator('.remix-dice__face').evaluateAll(diePips)
  expect(faces.length, 'six faces, and the roll draws every one of them').toBe(6)
  for (const [n, face] of faces.entries()) {
    expect(face.layers, `face ${n + 1} draws ${n + 1} pips`).toBe(n + 1)
    // the regression in one line: with the layer the size of the face, every centre is the same centre
    expect(face.distinct, `face ${n + 1}'s pips must land in ${n + 1} different places`).toBe(n + 1)
  }
  // and the die is still the 18px the pip positions were drawn for
  for (const face of faces) expect(face.box.w).toBe(18)
})

test('WCAG 2.1.4: with the caret in a field ⇧R types a capital R and nothing rolls', async ({ page }) => {
  await open(page)
  await selectRinged(page)
  const before = await counter(page).innerText()
  await openGroup(page)
  const field = page.locator('#editor-controls input[type="text"]:visible').first()
  await field.focus()
  await expect(field, 'a field nothing focused would prove nothing').toBeFocused()
  const value = await field.inputValue()
  await page.keyboard.press('Shift+R')
  await expect(field, "the owner's own most important step").toHaveValue(`${value}R`)
  await expect(remixDialog(page)).toHaveCount(0)
  await expect(counter(page)).toHaveText(before)
})


/* MOTION DEGRADES, AND IT COSTS NOTHING TO PROVE. `globals.css`'s reduced-motion block flattens every transition
   in the app document to 0.01ms — the cube's included — and the confirmed re-roll lands on that transition's own
   `transitionend` and on nothing else (R-164: the confirm itself waits on no motion). So a reader who asks for no
   motion gets the re-roll AT ONCE by construction:
   there is no timer anywhere to keep in step with the CSS and none to wait out. Both halves are asserted here.

   `emulateMedia` rather than `test.use({ reducedMotion })`: the option is a CONTEXT one and this journey's context
   is the gate's, so it was silently ignored — `matchMedia(...).matches` read false and the cube still transitioned
   for 900ms (executed 2026-09-20, which is the only reason this comment exists rather than a green vacuous test). */
test('prefers-reduced-motion: the cube does not tumble, and the re-roll lands at once', async ({ page }) => {
  await open(page)
  await selectRinged(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const motion = await page.locator('.remix-dice__cube').evaluate((el) => ({
    asked: matchMedia('(prefers-reduced-motion: reduce)').matches,
    duration: getComputedStyle(el).transitionDuration,
  }))
  expect(motion.asked, 'the control: the emulation really reached the page').toBe(true)
  expect(parseFloat(motion.duration), "the roll is flattened by the app's one reduced-motion rule").toBeLessThan(0.05)

  const was = await designName(page).innerText()
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Shift+R')
  await expect(remixDialog(page), 'the confirm opens at once here as it does everywhere (R-164)').toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.locator('[data-remix-go]')).toBeFocused()
  await page.keyboard.press('Enter')
  // the re-roll rides the SAME flattened transition, so a reader who asked for no motion waits for nothing —
  // there is no timer anywhere to wait out, which is the whole reason it is an event and not a `setTimeout`
  await expect(designName(page), 'and the canvas lands immediately').not.toHaveText(was)
})

/* ── Story 5.15 — BEHAVIOURS HOLD STILL WHILE DESIGNING, AND PREVIEW RUNS THEM (FR-D20, B3a · B3b, R-174, R-175) ────
   `P` is R-145's fifth owed key to arrive with its action. The editor runs `core` itself against the canvas window
   (DW-136), so what these stops read is `core`'s own doing: the `js-enabled` class on each mount, and the PAUSED chip
   drawn from the mounts `core` held still. */

const bar = (page) => page.locator('#editor-preview-bar')
const back = (page) => page.locator('#editor-preview-bar button').first()

/** Whether `core` put each declared mount in its JavaScript branch: the two pilots' and controls fixture 1's list. */
const branches = (page) =>
  page.frameLocator('iframe[title$="canvas"]').locator('body').evaluate((body) =>
    Object.fromEntries(['.a1-1__bar', '.a22-1__form', '.cx__features'].map((s) => [s, body.ownerDocument.querySelector(s)?.classList.contains('js-enabled') ?? null])))

/** Every element of the canvas's chrome layer matching a selector — the layer's shadow roots are not in the document. */
const inChrome = (page, selector) =>
  page.frameLocator('iframe[title$="canvas"]').locator('body').evaluate((body, sel) =>
    [...body.ownerDocument.querySelectorAll('[data-inflozo-chrome]')].flatMap((h) => [...(h.shadowRoot?.querySelectorAll(sel) ?? [])]).length, selector)

/** Every element in the canvas document carrying a `data-inflozo-*` attribute: the page at rest carries none. */
const marked = (page) =>
  page.frameLocator('iframe[title$="canvas"]').locator('body').evaluate((body) =>
    [...body.ownerDocument.querySelectorAll('*')].filter((el) => [...el.attributes].some((a) => a.name.startsWith('data-inflozo-'))).length)

/* R-175's chip is drawn on a POINTED section, and pointing is the one thing a keyboard cannot do. So the hover is
   SYNTHESIZED as the canvas document's own `pointerover` on the element — the very event `editor.tsx` listens for —
   and never driven through the pointer device: the first test's rule, that no pointer API drives this journey, holds.
   The SELECTED half of the same rule is walked from the keyboard (a Layers row and Enter). */
const pointAt = (page, selector) =>
  page.frameLocator('iframe[title$="canvas"]').locator(selector).first().evaluate((el) => {
    el.scrollIntoView({ block: 'center' })
    el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }))
  })
/** …and the pointer leaving the canvas, as `pointerout` with no `relatedTarget` */
const pointAway = (page) =>
  page.frameLocator('iframe[title$="canvas"]').locator('body').evaluate((body) =>
    body.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', clientX: 0, clientY: 0, relatedTarget: null })))

test('Preview: P goes in, and Back to editing, Esc and P each come back — focus in and out, said both ways (R-170)', async ({ page }) => {
  await open(page)
  const pill = page.locator('#editor-preview')
  await expect(pill, "B3a: the pill is drawn in the bar at rest").toBeVisible()
  // R-170: ONE name — the pill's, the card's row's (asserted in R-147's stop above) and the bar's
  await expect(pill).toHaveAccessibleName('Preview')
  await expect(pill).toHaveAttribute('aria-keyshortcuts', 'P')
  // the pill LEADS nothing: it is the right-hand cluster's last control, where B3a draws it beside the ship button
  expect(await page.locator('#editor-theme-settings').evaluate((el) => el.parentElement.lastElementChild.id)).toBe('editor-preview')
  const ways = [
    ['Back to editing', () => page.keyboard.press('Enter')],
    ['Esc', () => page.keyboard.press('Escape')],
    ['P', () => page.keyboard.press('p')],
  ]
  for (const [way, leave] of ways) {
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('p')
    await expect(bar(page)).toBeVisible()
    await expect(bar(page)).toHaveAttribute('aria-label', 'Preview')
    await expect(back(page), 'focus lands on Back to editing').toBeFocused()
    await expect(back(page)).toHaveAccessibleName('Back to editing')
    expect(await said(page)).toBe('Preview. Press Escape or P to come back.')
    await leave()
    await expect(bar(page), `${way} comes back`).toHaveCount(0)
    await expect(page.locator('header')).toBeVisible()
    expect(await focused(page), `${way}: focus returns to where it was`).toBe('SECTION[Canvas]')
    expect(await said(page)).toBe('Back to editing.')
  }
  // the matrix's fallback: with focus nowhere (the body) when Preview began, it comes back to the pill, never to nothing
  await page.evaluate(() => document.activeElement?.blur())
  expect(await focused(page), 'the control: nothing holds focus').toBe('BODY')
  await page.keyboard.press('p')
  await expect(back(page)).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(pill, 'focus with nowhere to return to lands on the pill').toBeFocused()
})

test('Preview hides every piece of editing chrome — never unmounted, so a selection comes back whole — and shows B3b\'s bar', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])
  const device = await deviceOf(page)
  // the viewport the fit is taken over, read off B11's chip before Preview hides it
  const [dw, dh] = (await page.locator('#editor-viewport').innerText()).match(/(\d+) × (\d+)/).slice(1).map(Number)
  await pointAt(page, '.a22-1')
  await expect(page.locator('[data-section-pill]'), 'the control: a hovered section shows its pill').toBeVisible()
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('p')
  await expect(bar(page)).toBeVisible()
  for (const region of ['header', '#editor-layers', '#editor-controls', '[data-skip-canvas]', '#editor-viewport', '#editor-source', '[data-section-pill]']) {
    await expect(page.locator(region).first(), `${region} is hidden in Preview`).toBeHidden()
  }
  // HIDDEN, NEVER UNMOUNTED: the bar and both asides are still in the document, holding what they held
  for (const region of ['header', '#editor-layers', '#editor-controls']) await expect(page.locator(region)).toHaveCount(1)
  await expect(page.locator('#editor-controls')).toHaveAttribute('aria-label', 'Section settings')
  // the page IS the site: no outline, tag or badge layer, and no state mark on any root
  expect(await inChrome(page, '*')).toBe(0)
  expect(await marked(page)).toBe(0)
  // the stage is the whole window, and the card is R-137's fit of the device into it — one fit, never a zoom
  const view = page.viewportSize()
  const stage = await page.locator('section[aria-label="Canvas"]').boundingBox()
  expect(stage).toEqual({ x: 0, y: 0, width: view.width, height: view.height })
  const card = await page.locator('section[aria-label="Canvas"] > div').first().boundingBox()
  const fit = Math.min(1, view.width / dw, view.height / dh)
  expect(Math.abs(card.width - dw * fit)).toBeLessThan(1)
  expect(Math.abs(card.height - dh * fit)).toBeLessThan(1)
  // B3b: the way back, a divider and the three devices, the one showing lit — the top bar's own track, counted off it
  await expect(bar(page).locator('[role="radio"]')).toHaveCount(await page.locator('#editor-device [role="radio"]').count())
  await expect(bar(page).locator('[role="radio"][aria-checked="true"]')).toHaveAttribute('aria-label', device)
  await expect(bar(page).locator('[role="radiogroup"]')).toHaveAttribute('id', 'editor-preview-device')
  // A PRESS IN PREVIEW SELECTS NOTHING (review): a click on ANOTHER section — the canvas document's own `click`, which
  // the editor listens for, synthesized as the hover above is — and a primary press on the ground beside the page
  // (Mobile, so there is ground) both leave the selection where it was. Read on the way back, when the panel shows.
  await page.keyboard.press('3')
  await page.frameLocator('iframe[title$="canvas"]').locator('.a1-1').first().evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 })))
  await page.locator('section[aria-label="Canvas"]').evaluate((el) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' })))
  await expect(bar(page), 'still in Preview').toBeVisible()
  // and on the way back everything is as it was: the section still selected, with its panel
  await page.keyboard.press('Escape')
  await chosen(page, own[0])
  await expect(page.locator('#editor-layers')).toBeVisible()
  expect(await deviceOf(page)).toBe('Mobile')
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('1')
  expect(await deviceOf(page)).toBe(device)
  // A FOLDED PANEL'S RAIL IS HIDDEN TOO (review): fold Layers, go in, and the 44px rail with its Show button is gone
  // with the rest, so the stage is still the whole window
  await page.keyboard.press('l')
  await expect(page.getByRole('button', { name: 'Show layers' }), 'the control: the rail shows while editing').toBeVisible()
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('p')
  await expect(bar(page)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Show layers' }), 'the rail is hidden in Preview').toBeHidden()
  expect(await page.locator('section[aria-label="Canvas"]').boundingBox()).toEqual({ x: 0, y: 0, width: view.width, height: view.height })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Show layers' }), 'and back when editing').toBeVisible()
})

test('R-174 · FR-G7(4): while designing every mount the table holds still is AT REST, and Preview runs every one', async ({ page }) => {
  await open(page)
  const rest = { '.a1-1__bar': false, '.a22-1__form': false, '.cx__features': false }
  const running = { '.a1-1__bar': true, '.a22-1__form': true, '.cx__features': true }
  expect(await branches(page), 'at rest is the no-JavaScript branch, mount by mount').toEqual(rest)
  // A REPAINT, NEVER A RELOAD, each way: the canvas document survives (a stamp on its window), while every section root
  // is a new node — `core` stopped over the old ones and started over these
  const stamp = () => page.frameLocator('iframe[title$="canvas"]').locator('body').evaluate((body) => {
    body.ownerDocument.defaultView.__sameDocument = true
    for (const root of body.ownerDocument.querySelectorAll('#canvas > *')) root.__painted = 'before'
  })
  const repainted = () => page.frameLocator('iframe[title$="canvas"]').locator('body').evaluate((body) => ({
    sameDocument: body.ownerDocument.defaultView.__sameDocument === true,
    oldRoots: [...body.ownerDocument.querySelectorAll('#canvas > *')].filter((root) => root.__painted === 'before').length,
  }))
  await stamp()
  expect((await repainted()).oldRoots, 'the control: every root carries the stamp, so "none left" can fail').toBeGreaterThan(0)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('p')
  await expect.poll(() => branches(page), { message: 'Preview runs everything the build carries' }).toEqual(running)
  expect(await repainted(), 'in: one repaint of the same document').toEqual({ sameDocument: true, oldRoots: 0 })
  await stamp()
  expect((await repainted()).oldRoots).toBeGreaterThan(0)
  await page.keyboard.press('Escape')
  await expect.poll(() => branches(page), { message: 'and back to editing, every one is at rest again' }).toEqual(rest)
  expect(await repainted(), 'out: one repaint of the same document').toEqual({ sameDocument: true, oldRoots: 0 })

  // THE ONE VISIBLE CONSEQUENCE ON THE OWNER'S PAGES: at Mobile, Rail lists its links while you design and shows its
  // menu button only in Preview (`a1/1/style.css`'s ≤767 block keys on `js-enabled`)
  const header = (page) => page.frameLocator('iframe[title$="canvas"]').locator('body').evaluate((body) => {
    const doc = body.ownerDocument
    const shown = (s) => doc.defaultView.getComputedStyle(doc.querySelector(s)).display !== 'none'
    return { menu: shown('.a1-1__menu'), links: shown('.a1-1__nav') }
  })
  const devices = await page.locator('#editor-device [role="radio"]').count()
  await page.keyboard.press(String(devices))
  await expect.poll(() => header(page)).toEqual({ menu: false, links: true })
  await page.keyboard.press('p')
  await expect.poll(() => header(page)).toEqual({ menu: true, links: false })
  // …and pressing that menu button does nothing yet: no `nav-drawer` file exists, so its mount runs the no-op stand-in
  // (FR-G7(2)) — the button stays shut, the links stay hidden, and Preview stays on
  const menu = page.frameLocator('iframe[title$="canvas"]').locator('.a1-1__menu')
  await menu.focus()
  await expect(menu, 'the control: the press lands on the button').toBeFocused()
  await page.keyboard.press('Enter')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  expect(await header(page)).toEqual({ menu: true, links: false })
  await expect(bar(page), 'and Preview is still on').toBeVisible()
  await page.keyboard.press('Escape')
  await expect.poll(() => header(page)).toEqual({ menu: false, links: true })
})

test('R-175: a pointed section whose held-still part moves by itself carries B3a\'s PAUSED chip — and no other part does', async ({ page }) => {
  await open(page)
  const chips = () => inChrome(page, '[data-chrome="paused"]')
  expect(await chips(), 'none at rest: the page at rest is the site').toBe(0)
  expect(await marked(page)).toBe(0)

  // THE FIRST HALF: the pilots' parts wait for a press — the phone menu and the sign-up form — so a pointed Rail or
  // Inline Row shows its outline and name tag and NO chip
  for (const root of ['.a1-1', '.a22-1']) {
    await pointAt(page, root)
    await expect.poll(() => inChrome(page, '[data-chrome="tag"]'), { message: `the control: ${root} really is pointed at` }).toBe(1)
    expect(await chips(), `${root} carries no PAUSED chip`).toBe(0)
  }

  // THE SECOND HALF: controls fixture 1's list declares `marquee`, which the table holds still and which moves by
  // itself — the one such part CI can put on a canvas
  await pointAt(page, '.cx__features')
  await expect.poll(chips, { message: 'exactly one chip, on the list' }).toBe(1)
  const look = await page.evaluate(() => {
    const f = document.querySelector('section[aria-label="Canvas"] iframe')
    const fr = f.getBoundingClientRect()
    const k = fr.width / f.offsetWidth
    const doc = f.contentDocument
    const find = (sel) => [...doc.querySelectorAll('[data-inflozo-chrome]')].map((h) => h.shadowRoot?.querySelector(sel)).find(Boolean) ?? null
    const onScreen = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { left: fr.left + r.left * k, top: fr.top + r.top * k, right: fr.left + r.right * k, bottom: fr.top + r.bottom * k }
    }
    const chip = find('[data-chrome="paused"]')
    const c = doc.defaultView.getComputedStyle(chip)
    const glyph = chip.querySelector('svg')
    const pill = document.querySelector('[data-section-pill]')?.getBoundingClientRect()
    return {
      words: chip.textContent, hidden: chip.getAttribute('aria-hidden'), events: c.pointerEvents, visibility: c.visibility,
      size: c.fontSize, weight: c.fontWeight, tracking: c.letterSpacing, family: c.fontFamily,
      ink: c.color, fill: c.backgroundColor, line: c.borderTopColor, radius: c.borderRadius, padding: c.padding, gap: c.gap,
      glyph: glyph && { size: glyph.getAttribute('width'), stroke: glyph.getAttribute('stroke-width') },
      chip: onScreen(chip), list: onScreen(doc.querySelector('.cx__features')), tag: onScreen(find('[data-chrome="tag"]')),
      pill: pill && { left: pill.left, top: pill.top, right: pill.right, bottom: pill.bottom },
    }
  })
  // B3a `:658-660`: "PAUSED" in literal capitals at 9.5/600 tracked .02em, the 9px pause glyph at a 2.4 stroke, `2px 8px`
  // and a 5px gap on the pill radius — in `ViewportChip`'s two rounded colours, B3a's #F4F1EC and #D8D2C7 being `paper`
  // (rgb 247 245 242) and `line-strong` (rgb 201 194 184), and its ink #6B6459 exactly `ink-soft-aa`
  expect(look.words).toBe('PAUSED')
  expect(look).toMatchObject({ hidden: 'true', events: 'none', visibility: 'visible', size: '9.5px', weight: '600', radius: '24px', padding: '2px 8px', gap: '5px' })
  expect(Math.abs(parseFloat(look.tracking) - 9.5 * 0.02)).toBeLessThan(0.01)
  expect(look.family).toMatch(/Inter/)
  expect([look.ink, look.fill, look.line]).toEqual(['rgb(107, 100, 89)', 'rgb(247, 245, 242)', 'rgb(201, 194, 184)'])
  expect(look.glyph).toEqual({ size: '9', stroke: '2.4' })
  // 8px inside the list's bottom-left corner, on screen — the section's top corners belong to the tag and the pill
  expect(Math.abs(look.chip.left - look.list.left - 8), JSON.stringify(look)).toBeLessThanOrEqual(1)
  expect(Math.abs(look.list.bottom - look.chip.bottom - 8), JSON.stringify(look)).toBeLessThanOrEqual(1)
  const meets = (a, b) => !!a && !!b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  expect(look.tag, 'the control: the name tag is drawn').not.toBeNull()
  expect(look.pill, 'the control: the section pill is drawn').not.toBeNull()
  expect(meets(look.chip, look.tag), 'clear of the name tag').toBe(false)
  expect(meets(look.chip, look.pill), 'clear of the section pill').toBe(false)

  // gone when the pointer leaves — and back on the SELECTED section, chosen from the keyboard
  await pointAway(page)
  await expect.poll(chips).toBe(0)
  const own = (await rows(page)).page
  await select(page, own[own.length - 1])
  await expect.poll(chips, { message: 'a selected section carries it too' }).toBe(1)

  // THE MATRIX'S "REPAINT AND RESTAMP" ROW. A restamp — a mode flip — keeps the nodes, so `core`'s handle and its
  // `paused` stand and the chip stays on the SAME list; a repaint — a change of visitor — stops `core` and starts it
  // over NEW nodes, and the chip is drawn again from the new handle's `paused`, the list still at rest
  const list = page.frameLocator('iframe[title$="canvas"]').locator('.cx__features')
  await list.evaluate((el) => { el.__painted = 'before' })
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('.')
  expect(await modeOf(page), 'the control: the mode really flipped').toBe('dark')
  await expect.poll(chips, { message: 'a restamp keeps the chip' }).toBe(1)
  expect(await list.evaluate((el) => el.__painted), 'on the same node').toBe('before')
  await page.keyboard.press('.')
  expect(await modeOf(page)).toBe('light')
  await page.locator('#editor-view-as').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-view-as-menu [aria-current="true"]')).toBeFocused()
  await page.locator('#editor-view-as-menu [data-visitor="free"]').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-view-as-menu')).toBeHidden()
  expect(await list.evaluate((el) => el.__painted ?? 'new'), 'the control: the visitor repainted the canvas').toBe('new')
  await expect.poll(chips, { message: 'a repaint draws the chip again, on the new node' }).toBe(1)
  expect((await branches(page))['.cx__features'], 'and the new list is at rest too').toBe(false)

  // and none in Preview, pointed or selected
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('p')
  await expect(bar(page)).toBeVisible()
  await pointAt(page, '.cx__features')
  expect(await chips(), 'nothing is pointed at in Preview').toBe(0)
  expect(await marked(page)).toBe(0)
  await page.keyboard.press('Escape')
  await expect.poll(chips, { message: 'the selection comes back with its chip' }).toBe(1)
})

test('in Preview only P, Esc, 1 2 3 and ⌘S act — L . [ ? do nothing — and the page\'s own email box takes a p', async ({ page }) => {
  const canvas = await open(page)
  await selectRinged(page)
  // ONE EDIT BEFORE PREVIEW, so a ⌘Z that reached the journal from in there would visibly take it back
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press(']')
  await expect(counter(page), 'the control: the edit landed').toHaveText(/^2 of \d+$/)
  const before = { design: await counter(page).innerText(), mode: await modeOf(page), rows: (await rows(page)).all.length }
  await page.keyboard.press('p')
  await expect(bar(page)).toBeVisible()
  // the ring's own section is selected, so `[` `]`, Del, ⌘D, ⌘Z and ⇧⌘Z would each change the page if they reached it
  const dead = ['l', '.', '[', ']', '?', 'Shift+R', 'Delete', 'ControlOrMeta+d', 'ControlOrMeta+k', 'ControlOrMeta+z', 'ControlOrMeta+Shift+z']
  for (const key of dead) await page.keyboard.press(key)
  await expect(bar(page), 'still in Preview').toBeVisible()
  await expect(page.locator('dialog[open]'), 'no card, no confirm and no picker opened').toHaveCount(0)
  expect(await modeOf(page), '. did not flip the page').toBe(before.mode)
  // the devices DO act, from the keyboard as from the bar's own buttons, and both tracks agree
  const labels = await page.locator('#editor-device [role="radio"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
  for (const [n, label] of labels.entries()) {
    await page.keyboard.press(String(n + 1))
    await expect(bar(page).locator('[role="radio"][aria-checked="true"]'), `${n + 1} is ${label}`).toHaveAttribute('aria-label', label)
    expect(await deviceOf(page)).toBe(label)
  }
  await page.keyboard.press('1')
  // ⌘S DOES act in there: the edit made before Preview is owed, so the save sends it. The harness has no database, so the
  // write itself is refused — the SEND is what is asserted, and it is the only request this test makes
  const sent = page.waitForRequest((r) => r.method() === 'POST' && new URL(r.url()).pathname.endsWith('/sync'), { timeout: 5000 })
  await page.keyboard.press('ControlOrMeta+s')
  await sent
  await expect(bar(page), 'and Preview stays on').toBeVisible()
  // a link in the page goes nowhere: Enter on one is its click, which Preview still stops (AD-21) — given the time a
  // navigation would need to start, so "the same address" is a reading that could have failed
  const address = await canvas.locator('body').evaluate((b) => b.ownerDocument.location.href)
  const link = canvas.locator('.a1-1__items a[href]').first()
  // the control (standing rule 2): the link points somewhere ELSE, so "the same address" is a reading that could fail
  expect(await link.evaluate((a) => a.href), 'the control: the link leads away from the canvas').not.toBe(address)
  await link.focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(300)
  expect(await canvas.locator('body').evaluate((b) => b.ownerDocument.location.href), 'the link did not navigate the canvas').toBe(address)
  await expect(bar(page)).toBeVisible()
  // the page's own field in Preview is a visitor's: a `p` is a letter there, and nothing leaves Preview
  const field = canvas.locator('.a22-1__field')
  await field.focus()
  await page.keyboard.type('p@example.com')
  await expect(field).toHaveValue('p@example.com')
  await expect(bar(page)).toBeVisible()
  // …and its submit goes nowhere: AD-21's trap holds in Preview too
  await page.keyboard.press('Enter')
  await page.waitForTimeout(300)
  expect(await canvas.locator('body').evaluate((b) => b.ownerDocument.location.href), 'the submit did not navigate the canvas').toBe(address)
  // Esc leaves from the page's own field too, and nothing the keys pressed in Preview happened
  await page.keyboard.press('Escape')
  await expect(bar(page)).toHaveCount(0)
  await expect(page.locator('#editor-layers'), 'L did not fold Layers').toBeVisible()
  await expect(counter(page), '[ and ] did not change the design, and ⌘Z did not take the edit before Preview back').toHaveText(before.design)
  expect((await rows(page)).all, 'Del and ⌘D did not touch the page').toHaveLength(before.rows)
  // the control for ⌘Z's silence in there: back to editing, the same key does take that edit back
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(counter(page)).toHaveText(/^1 of \d+$/)
})

test('a module\'s own dialog in the page owns the first Esc in Preview, and the next one comes back', async ({ page }) => {
  const canvas = await open(page)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('p')
  await expect(bar(page)).toBeVisible()
  // what a future lightbox does in Preview: a modal `<dialog>` in the page, focus inside it
  await canvas.locator('body').evaluate((body) => {
    const d = body.ownerDocument.createElement('dialog')
    d.id = 'probe-dialog'
    d.innerHTML = '<button type="button">A page control</button>'
    body.append(d)
    d.showModal()
    d.querySelector('button').focus()
  })
  await expect(canvas.locator('#probe-dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(canvas.locator('#probe-dialog'), 'the first Esc is the dialog\'s').toBeHidden()
  await expect(bar(page), 'and Preview is still on').toBeVisible()
  await page.keyboard.press('Escape')
  await expect(bar(page), 'the next Esc comes back').toHaveCount(0)
})

test('WCAG 2.1.4: with the caret in a panel field or on the canvas, `p` types a p and nothing previews', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])
  await openGroup(page)
  const field = page.locator('#editor-controls input[type="text"]:visible').first()
  await field.focus()
  await expect(field, 'a field nothing focused would prove nothing').toBeFocused()
  const was = await field.inputValue()
  await page.keyboard.type('p')
  await expect(field).toHaveValue(`${was}p`)
  await expect(bar(page)).toHaveCount(0)
  // and in a canvas contenteditable, where the caret usually is
  await caretIntoCanvas(page)
  await page.keyboard.type('p')
  await expect(bar(page)).toHaveCount(0)
})

/* ── Story 5.16 — PAGE 2 (FR-D21, D5d, R-176 to R-180) ──────────────────────────────────────────────────────────
   The harness Home carries CI's one main feed (the post grid the Synthesis Defaults designate), so page 2 is walked on
   every commit: entered from D5d's row on the main feed's panel, left by the pill or the row, and edited like page 1.
   Every expectation that is a value — the rows page 2 lists, its pager, the address the header is told, the words — is
   DERIVED from the library's own `templateContext` and `lib/page-two.ts`, read from this checkout, never written here. */

const LIB = await import(new URL('../../packages/library/src/index.ts', import.meta.url).href)
const TWO = await import(new URL('../../apps/web/lib/page-two.ts', import.meta.url).href)

/** The page the canvas painted last — `editor.tsx` writes it beside `painted`. */
const pageOf = (page) => page.locator('iframe[title$="canvas"]').getAttribute('data-page')
/** D5d's row on the panel, and its radios. */
const pageRow = (page) => page.locator('#editor-controls [data-page-row]')
/** The pill at the ground's top, while page 2 is shown. */
const pagePill = (page) => page.locator('[data-page-two-pill]')

/** The harness's own local record (IndexedDB is per origin, and the harness names its own database): the doc keys it
 *  STORES. A page 2 that follows page 1 stores nothing, so its key is absent until the first change made on it. */
const storedKeys = (page) =>
  page.evaluate(() => new Promise((resolve, reject) => {
    const open = indexedDB.open('inflozo-doc-harness')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      const get = db.transaction('meta', 'readonly').objectStore('meta').get('00000000-0000-4000-8000-000000000009')
      get.onerror = () => reject(get.error)
      get.onsuccess = () => {
        resolve(Object.keys(get.result?.docs ?? {}))
        db.close()
      }
    }
  }))

/** The page's own rows, by instance id — a page-2 row's key is `index:<id>`, page 1's `home:<id>`. */
const ownIds = async (page) => (await rows(page)).page.map((k) => k.split(':').slice(1).join(':'))

/** The main feed's Layers row, found by what it carries: the one section whose panel draws D5d's row. */
async function feedRow(page) {
  for (const key of (await rows(page)).page) {
    await select(page, key)
    if ((await pageRow(page).count()) > 0) return key
  }
  throw new Error('no section on this page carries the Preview page row — the harness Home has lost its main feed')
}

/** Into page 2 from the keyboard alone: the main feed's panel, its row's checked radio, → */
async function toPageTwo(page) {
  await feedRow(page)
  await pageRow(page).locator('[role="radio"][aria-checked="true"]').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '2')
}

test('Page 2: the main feed\'s row enters it, and page 2 is an EXACT copy of page 1 at /page/2/ — nothing stored', async ({ page }) => {
  const canvas = await open(page)
  const one = await ownIds(page)
  const key = await feedRow(page)
  // D5d's row: "Preview page", 1 and 2, 1 on — at the panel's foot, above "Reset this design"
  await expect(pageRow(page)).toContainText(TWO.PREVIEW_PAGE)
  // R-181: the note under the row says page 2 stands for every later page, and the group reads it as its description
  const note = pageRow(page).locator('[id$="-page-note"]')
  await expect(note).toHaveText(TWO.LATER_PAGES)
  expect(await pageRow(page).locator('[role="radiogroup"]').getAttribute('aria-describedby'), 'the row is described by its note').toBe(await note.getAttribute('id'))
  await expect(pageRow(page).locator('[role="radio"]')).toHaveText(['1', '2'])
  await expect(pageRow(page).locator('[role="radio"][aria-checked="true"]')).toHaveText('1')
  const footTop = await page.locator('#editor-controls button', { hasText: 'Reset this design' }).evaluate((b) => b.getBoundingClientRect().top)
  expect((await pageRow(page).boundingBox()).y, 'the row sits above the foot').toBeLessThan(footTop)
  // no other section of the page carries it (R-176's "Not offered: any other section")
  for (const other of (await rows(page)).page.filter((k) => k !== key)) {
    await select(page, other)
    await expect(pageRow(page), `${other} is not the main feed`).toHaveCount(0)
  }
  await select(page, key)
  // ONE REPAINT, never a reload: the canvas document is marked, and so is every section root
  await canvas.locator('body').evaluate((b) => {
    b.ownerDocument.defaultView.__before = true
    for (const root of b.querySelectorAll('#canvas > *')) root.dataset.before = ''
  })
  expect(await canvas.locator('#canvas > [data-before]').count(), 'the control: the roots carry the mark').toBeGreaterThan(0)
  await pageRow(page).locator('[role="radio"][aria-checked="true"]').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '2')
  expect(await canvas.locator('body').evaluate((b) => b.ownerDocument.defaultView.__before), 'the canvas document is the same one').toBe(true)
  await expect(canvas.locator('#canvas > [data-before]'), 'every section root was painted anew').toHaveCount(0)
  expect(await said(page)).toBe(TWO.ENTERED_SAID)
  // focus STAYS on the row, now on 2 — the panel is the same section's across the switch
  await expect(pageRow(page).locator('[role="radio"][aria-checked="true"]')).toBeFocused()
  await expect(pageRow(page).locator('[role="radio"][aria-checked="true"]')).toHaveText('2')
  // AN EXACT COPY: every section of page 1, in order, under page 2's own key — and the marker says so
  expect(await ownIds(page)).toEqual(one)
  expect((await rows(page)).page.every((k) => k.startsWith('index:'))).toBe(true)
  await expect(page.locator('#editor-layers [data-auto-generated="page-2"]')).toHaveText(TWO.COPY_MARKER)
  await expect(page.locator('#editor-layers')).toContainText(`This page · Home · ${TWO.PAGE_TWO_WORDS}`, { ignoreCase: true })
  // …rendered at index.hbs with page 2's context, DERIVED: its rows, "2 / 5" with BOTH links, and its address
  const ctx = LIB.orbitWeekly.templateContext('index.hbs', 'second')
  const posts = ctx.ghost.posts.map((p) => p.title)
  await expect(canvas.locator('.a17-1__post-title')).toHaveText(posts)
  const pager = ctx.ghost.pagination
  await expect(canvas.locator('[class$="__numbers"]')).toHaveText(`${pager.page} / ${pager.pages}`)
  await expect(canvas.locator('.a17-1__newer')).toHaveAttribute('href', '/')
  await expect(canvas.locator('.a17-1__older')).toHaveAttribute('href', `/page/${pager.page + 1}/`)
  // THE HEADER IS TOLD /page/2/, so the menu's `/` item carries no `nav-current` (Ghost's exact match, `utils.js:61`)
  expect(ctx.site.currentUrl).toBe('/page/2/')
  const home = LIB.orbitWeekly.site().navigation.find((i) => i.url === '/')
  const cls = `.nav-${home.label.toLowerCase()}`
  expect(await canvas.locator(cls).count(), 'the control: the header draws the Home item').toBeGreaterThan(0)
  for (const c of await canvas.locator(cls).evaluateAll((els) => els.map((e) => e.className))) expect(c).not.toContain('nav-current')
  // NOTHING IS STORED: page 2 follows page 1, so no edit was made and the device holds no page-2 doc
  await expect(page.locator('#editor-undo')).toHaveAttribute('aria-disabled', 'true')
  expect(await storedKeys(page)).not.toContain('index')
  // and back on page 1 the same header marks Home again
  await pagePill(page).getByRole('button', { name: TWO.BACK_TO_PAGE_ONE }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '1')
  expect(await canvas.locator(cls).first().getAttribute('class')).toContain('nav-current')
})

test('Page 2 follows page 1 until its first change, which stores it; page 1 never follows back; ⌘Z and emptying follow again', async ({ page }) => {
  await open(page)
  const was = await ownIds(page)
  expect(was.length, 'the control: the harness Home has sections enough to move and remove').toBeGreaterThan(2)
  // (1) ON PAGE 1, a change: the second section moves down one
  await page.locator(`[data-layer-row="home:${was[1]}"]`).focus()
  await page.keyboard.press('Alt+ArrowDown')
  // R-210: Layers follows the canvas a frame later — each read below waits for it, and checks nothing different
  await expect.poll(() => ownIds(page)).not.toEqual(was)
  const one = await ownIds(page)
  // …and page 2, which follows, shows it
  await toPageTwo(page)
  expect(await ownIds(page), 'a following page 2 is page 1 as it stands').toEqual(one)
  await expect(page.locator('#editor-layers [data-auto-generated="page-2"]')).toBeVisible()
  // (2) THE FIRST CHANGE ON PAGE 2 — a section deleted through Layers — stores page 2 and the marker goes
  const gone = one[2]
  await select(page, `index:${gone}`)
  await page.keyboard.press('Delete')
  await expect.poll(() => ownIds(page)).toEqual(one.filter((id) => id !== gone))
  const two = await ownIds(page)
  await expect(page.locator('#editor-layers [data-auto-generated]')).toHaveCount(0)
  await expect.poll(() => storedKeys(page), { message: 'the first change stores page 2 under its own key' }).toContain('index')
  // (3) PAGE 1 STILL HAS IT (R-178)
  await pagePill(page).getByRole('button', { name: TWO.BACK_TO_PAGE_ONE }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '1')
  await expect.poll(() => ownIds(page)).toEqual(one)
  // (4) a later change to page 1 does not reach page 2
  await page.locator(`[data-layer-row="home:${one[one.length - 1]}"]`).focus()
  await page.keyboard.press('Alt+ArrowUp')
  await expect.poll(() => ownIds(page)).not.toEqual(one)
  await toPageTwo(page)
  await expect.poll(() => ownIds(page), { message: 'page 2 is its own now' }).toEqual(two)
  // (5) ⌘Z — ONE LIST FOR THE WHOLE PROJECT (Story 5.8): the first takes back page 1's move, the second page 2's
  // first change, and page 2 follows page 1 again, marker and all
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => ownIds(page), { message: 'the first ⌘Z undid page 1\'s move, which page 2 never had' }).toEqual(two)
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => ownIds(page), { message: 'the second undid page 2\'s first change: it follows page 1 again' }).toEqual(one)
  await expect(page.locator('#editor-layers [data-auto-generated="page-2"]')).toHaveText(TWO.COPY_MARKER)
  // (6) REMOVING EVERY SECTION FROM PAGE 2 follows again too (AD-22)
  for (let n = 0; n < one.length; n++) {
    const left = (await rows(page)).page
    if (n > 0 && (await page.locator('#editor-layers [data-auto-generated="page-2"]').count()) > 0) break
    await select(page, left[0])
    await page.keyboard.press('Delete')
    // R-210: the rows follow a frame later — the next pass reads them once this delete has landed
    await expect.poll(async () => (await rows(page)).page).not.toEqual(left)
  }
  await expect(page.locator('#editor-layers [data-auto-generated="page-2"]'), 'emptied, page 2 follows page 1 again').toBeVisible()
  await expect.poll(() => ownIds(page)).toEqual(one)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '2')
})

test('R-180: a site-wide section changed on page 2 asks first — Cancel changes nothing, the confirm reaches page 1; Hide keeps FR-D5\'s words', async ({ page }) => {
  const canvas = await open(page)
  await toPageTwo(page)
  const { site } = await rows(page)
  const header = site[0]
  await select(page, header)
  const name = (await page.locator(`[data-layer-row="${header}"] button[aria-label^="More for "]`).getAttribute('aria-label')).slice('More for '.length)
  await openEveryGroup(page)
  // a pill row of the header's own, and the root attribute it writes (AD-3)
  const row = page.locator('#editor-controls [id$="-control-nav-position"]')
  const attr = () => canvas.locator('[data-nav-position]').first().getAttribute('data-nav-position')
  const before = await attr()
  const checked = await row.locator('[role="radio"][aria-checked="true"]').innerText()
  await row.locator('[role="radio"][aria-checked="true"]').focus()
  await page.keyboard.press('ArrowRight')
  const dialog = page.locator('dialog[open]')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('h2')).toHaveText(TWO.SITE_WIDE_ASK.title(name))
  await expect(dialog).toContainText(TWO.SITE_WIDE_ASK.body)
  await expect(page.locator('dialog[open] [data-cancel]'), 'it opens on Cancel').toBeFocused()
  // CANCEL CHANGES NOTHING — not the canvas, not the panel, not the undo arrow
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  expect(await attr()).toBe(before)
  await expect(row.locator('[role="radio"][aria-checked="true"]'), 'the panel still shows the value in force').toHaveText(checked)
  await expect(page.locator('#editor-undo')).toHaveAttribute('aria-disabled', 'true')
  // CHANGE IT EVERYWHERE lands it
  await row.locator('[role="radio"][aria-checked="true"]').focus()
  await page.keyboard.press('ArrowRight')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: TWO.SITE_WIDE_ASK.confirm })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(dialog).toHaveCount(0)
  const changed = await attr()
  expect(changed, 'the confirmed change lands on the canvas').not.toBe(before)
  // A SECOND CHANGE DOES NOT ASK: the section asked once on this visit to page 2
  await row.locator('[role="radio"][aria-checked="true"]').focus()
  await page.keyboard.press('ArrowRight')
  await expect(dialog).toHaveCount(0)
  const last = await attr()
  expect(last).not.toBe(changed)
  // …and it reached PAGE 1: one header for the whole site (FR-D5)
  await pagePill(page).getByRole('button', { name: TWO.BACK_TO_PAGE_ONE }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '1')
  expect(await attr(), 'page 1 carries the header as page 2 changed it').toBe(last)
  // NOTHING NEW ASKS ON PAGE 1
  await select(page, header)
  await openEveryGroup(page)
  await row.locator('[role="radio"][aria-checked="true"]').focus()
  await page.keyboard.press('ArrowRight')
  await expect(dialog, 'page 1 asks nothing').toHaveCount(0)
  // A FRESH VISIT TO PAGE 2 ASKS AGAIN — the asks are forgotten when page 2 is left
  await toPageTwo(page)
  await select(page, header)
  await openEveryGroup(page)
  await row.locator('[role="radio"][aria-checked="true"]').focus()
  await page.keyboard.press('ArrowRight')
  await expect(dialog, 'the next visit asks again').toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  // HIDE ON PAGE 2 asks with FR-D5's own words, as it does on every page
  await page.locator(`[data-layer-row="${header}"]`).focus()
  await page.keyboard.press(' ')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('h2')).toHaveText(`Hide ${name}?`)
  await expect(dialog).toContainText('This section is site-wide: it is one shared thing that appears on every template of your site')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})

test('the pill: its words, focus to the canvas and "Back to page 1." — the row leaves too, keeping focus; Preview shows no pill', async ({ page }) => {
  await open(page)
  await toPageTwo(page)
  const pill = pagePill(page)
  await expect(pill).toBeVisible()
  await expect(pill).toContainText(TWO.PAGE_TWO_WORDS)
  // "Page 2" is WORDS, and "Back to page 1" is the one control, named by its own words (WCAG 2.5.3)
  await expect(pill.getByRole('button')).toHaveCount(1)
  await expect(pill.getByRole('button')).toHaveAccessibleName(TWO.BACK_TO_PAGE_ONE)
  // PREVIEW ON PAGE 2 SHOWS PAGE 2 WITH NO PILL, and comes back to page 2 with it
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('p')
  await expect(bar(page)).toBeVisible()
  await expect(pill).toBeHidden()
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '2')
  // NO PAGE 3 (R-177): Enter on "Older posts →" is its click, and nothing navigates — read 300ms later, so a navigation
  // would have had time to start
  const canvas = page.frameLocator('iframe[title$="canvas"]')
  const address = await canvas.locator('body').evaluate((b) => b.ownerDocument.location.href)
  const older = canvas.locator('.a17-1__older')
  expect(await older.evaluate((a) => a.href), 'the control: the link leads away from the canvas').not.toBe(address)
  await older.focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(300)
  expect(await canvas.locator('body').evaluate((b) => b.ownerDocument.location.href), 'Older posts did not navigate the canvas').toBe(address)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '2')
  await page.keyboard.press('Escape')
  await expect(pill).toBeVisible()
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '2')
  // the pill's way back: page 1, focus on the canvas, and it is said
  await pill.getByRole('button').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '1')
  await expect(pill).toHaveCount(0)
  expect(await focused(page)).toBe('SECTION[Canvas]')
  expect(await said(page)).toBe(TWO.LEFT_SAID)
  // the row's way back keeps focus ON the row, now on 1
  await toPageTwo(page)
  await pageRow(page).locator('[role="radio"][aria-checked="true"]').focus()
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '1')
  await expect(pageRow(page).locator('[role="radio"][aria-checked="true"]')).toHaveText('1')
  await expect(pageRow(page).locator('[role="radio"][aria-checked="true"]')).toBeFocused()
  expect(await said(page)).toBe(TWO.LEFT_SAID)
})

test('no key changes the page, the `?` card lists none, and on page 2 the Tab budget is still counted off the page (FR-D21)', async ({ page }) => {
  await open(page)
  await toPageTwo(page)
  // nothing selected, so Delete and Backspace have nothing to act on
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('Escape')
  const keys = [...[...Array(94).keys()].map((n) => String.fromCharCode(33 + n)), 'Space', 'Enter', 'Delete', 'Backspace']
  for (const key of keys) {
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(key)
    if ((await page.locator('dialog[open]').count()) > 0 || (await page.locator('#editor-preview-bar').count()) > 0) await page.keyboard.press('Escape')
    expect(await pageOf(page), `${key} changed the page`).toBe('2')
  }
  // `l` folded Layers along the way; the walk below starts from the panels as they were
  if (!(await page.locator('#editor-layers').isVisible())) {
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('l')
  }
  await expect(page.locator('#editor-layers')).toBeVisible()
  // the `?` card, which lists exactly the keys that work (R-145), has no row for a page
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('?')
  const sheet = page.locator('dialog[open][data-shortcuts-sheet]')
  await expect(sheet).toBeVisible()
  await expect(sheet).not.toContainText(/page 2|preview page|back to page/i)
  await page.keyboard.press('Escape')
  // UX-DR9 ON PAGE 2: the budget counted off the page — the pill's one button among the canvas's stops — and the walk
  // passes the canvas container once, the pill after it, and never a stop inside the site. It starts ON the shell's
  // first stop, D8c's skip link: a blur leaves the browser's sequential-navigation point where focus was, so only a
  // focus at the top really starts the walk at the top — and the link is one of the header's own stops, counted
  await page.locator('[data-skip-canvas]').focus()
  const budget = (await stopsIn(page, 'header')) + (await stopsIn(page, '#editor-layers')) +
    1 + (await stopsIn(page, 'section[aria-label="Canvas"]')) + (await stopsIn(page, '#editor-controls'))
  const stops = []
  for (let n = 0; n < budget - 1; n++) {
    await page.keyboard.press('Tab')
    stops.push(await page.evaluate(() => {
      const d = document.activeElement
      if (!d) return 'nothing'
      if (d.tagName === 'IFRAME') return 'INSIDE THE CANVAS'
      if (d.closest('[data-page-two-pill]')) return 'PILL'
      const label = d.getAttribute('aria-label')
      return `${d.tagName}${d.id ? `#${d.id}` : ''}${label ? `[${label}]` : ''}`
    }))
  }
  expect(stops).not.toContain('INSIDE THE CANVAS')
  const at = stops.indexOf('SECTION[Canvas]')
  expect(at).toBeGreaterThan(-1)
  expect(stops.filter((s) => s === 'PILL')).toHaveLength(1)
  expect(stops.indexOf('PILL'), 'the pill comes after the canvas container').toBeGreaterThan(at)
  expect(stops.indexOf('BUTTON[Collapse controls]')).toBeGreaterThan(stops.indexOf('PILL'))
})

test('page 2 stops being offered while it is shown — page 1 loses its main feed to a redo — and the canvas goes back to page 1 and says why', async ({ page }) => {
  await open(page)
  // page 1's main feed deleted, and put back: the history now holds a change that takes it away again
  const feed = await feedRow(page)
  await page.keyboard.press('Delete')
  await expect(page.locator(`[data-layer-row="${feed}"]`), 'the control: the feed is gone from page 1').toHaveCount(0)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator(`[data-layer-row="${feed}"]`)).toHaveCount(1)
  // onto page 2, and the redo — ONE LIST FOR THE WHOLE PROJECT (Story 5.8) — deletes page 1's feed from there
  await toPageTwo(page)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect(page.locator('iframe[title$="canvas"]'), 'never a paint of a page that does not exist').toHaveAttribute('data-page', '1')
  await expect(pagePill(page)).toHaveCount(0)
  expect(await said(page)).toMatch(new RegExp(`^${TWO.BACK_TO_PAGE_ONE}: `))
  // and page 1 really has no main feed, so no section's panel offers page 2 (R-176)
  for (const key of (await rows(page)).page) {
    await select(page, key)
    await expect(pageRow(page), `${key} offers no page 2`).toHaveCount(0)
  }
})

// ── Story 5.19 — THE MAIN FEED AND P0·5's DATA GROUP (FR-H2, D5c) ────────────────────────────────────────────────
//
// The harness Home's post grid is its main feed (derived from the Synthesis Defaults, above). Every word below is read
// from the one list that prints it — `lib/data-group.ts` and the engine's `DATA_WORDS` — never written here (R-170).

const WORDS = await import(new URL('../../apps/web/lib/data-group.ts', import.meta.url).href)
const RUNTIME = await import(new URL('../../packages/section-runtime/src/index.ts', import.meta.url).href)

/** The one Layers row carrying D5c's chip — the main feed — and how many carry one at all. */
const chipRow = (page) => page.locator('[data-layer-row]:has([data-main-feed-chip])')
const mainKey = (page) => chipRow(page).getAttribute('data-layer-row')
const nameOf = async (page, key) => (await page.locator(`[data-layer-row="${key}"] button[aria-label^="More for "]`).getAttribute('aria-label')).slice('More for '.length)

/** A popover menu row, reached from the keyboard: ↓ until the focused row reads `label` — never a pointer. */
async function menuTo(page, label) {
  // the popover opens and takes focus a frame after the key (review, 2026-09-25: CI pressed ↓ before it had)
  await page.locator(':popover-open').first().waitFor()
  // …and FOCUS reaches its current row a frame later still (R-171's `openMenu`): on the runner at Story 5.21's `c7a40bce`
  // ten ↓ went to the Source trigger, whose words are its value ("Latest"), before focus entered the menu — so wait for the
  // focused element to be inside the open popover. Every menu wraps (`lib/menu.ts`), so any starting row reaches `label`.
  await page.waitForFunction(() => [...document.querySelectorAll(':popover-open')].some((p) => p.contains(document.activeElement)))
  const seen = []
  for (let guard = 0; guard < 12; guard++) {
    const at = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
    if (at === label) return
    seen.push(at)
    await page.keyboard.press('ArrowDown')
  }
  // the error names what was focused and what the open popovers hold, so a red run on a runner can be read
  const state = await page.evaluate(() => ({
    active: `${document.activeElement?.tagName}#${document.activeElement?.id}`,
    popovers: [...document.querySelectorAll(':popover-open')].map((p) => `${p.id}: ${[...p.querySelectorAll('li,button,[role=option],[role=menuitem]')].map((r) => r.textContent.trim()).filter(Boolean).slice(0, 12).join(' | ')}`),
  }))
  throw new Error(`no menu row reads "${label}" — focused ${JSON.stringify(seen)} — ${JSON.stringify(state)}`)
}

/** A Layers row's `⋯` item, by keyboard: the `⋯`, Enter, ↓ to the item, Enter. */
async function rowItem(page, key, label) {
  await page.locator(`[data-layer-row="${key}"] button[aria-label^="More for "]`).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator(':popover-open')).toBeVisible()
  await menuTo(page, label)
  await page.keyboard.press('Enter')
}

/** The `⋯` menu's words for a row, read and closed again. */
async function rowMenuWords(page, key) {
  await page.locator(`[data-layer-row="${key}"] button[aria-label^="More for "]`).focus()
  await page.keyboard.press('Enter')
  const words = await page.locator(':popover-open li').allInnerTexts()
  await page.keyboard.press('Escape')
  return words.map((w) => w.trim())
}

/** ⌘K from the main feed, and Three Up placed under it: the key of the row it lands on. */
async function placeSecondGrid(page) {
  const own = (await rows(page)).page
  await select(page, await mainKey(page))
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(picker(page)).toBeVisible()
  await picker(page).locator('[data-cell][data-design="a17/1"]').first().focus()
  await page.keyboard.press('Enter')
  await expect(picker(page)).toHaveCount(0)
  // R-210: Layers follows the canvas a frame later — the check waits for it, and checks nothing different
  await expect.poll(async () => (await rows(page)).page.filter((k) => !own.includes(k)), { message: 'one section placed' }).toHaveLength(1)
  const added = (await rows(page)).page.filter((k) => !own.includes(k))
  return added[0]
}

/** The Data accordion opened on the selected section, from the keyboard. */
async function openData(page) {
  const group = page.locator('#editor-controls button[aria-expanded]').filter({ hasText: /^Data$/i })
  await expect(group).toHaveCount(1)
  if ((await group.getAttribute('aria-expanded')) === 'false') {
    await group.focus()
    await page.keyboard.press('Enter')
  }
  await expect(page.locator('#editor-controls [data-data-group]')).toBeVisible()
  return page.locator('#editor-controls [data-data-group]')
}

const canvasFrame = (page) => page.frameLocator('iframe[title$="canvas"]')

test('5.19 · ⌘K places a second Three Up, which lands SECONDARY — no chip, no pager — with a Data group of its own', async ({ page }) => {
  await open(page)
  const main = await mainKey(page)
  expect(main, 'the control: the harness Home has its main feed').not.toBeNull()
  await expect(chipRow(page)).toHaveCount(1)
  const added = await placeSecondGrid(page)
  expect(await said(page), 'a secondary feed is announced as an ordinary placement').toBe(`${await nameOf(page, added)} added`)
  await expect(chipRow(page)).toHaveCount(1)
  expect(await mainKey(page), 'the main feed stays where it was').toBe(main)
  // the canvas: two grids, and ONE pager — the secondary feed draws none
  await expect(canvasFrame(page).locator('#canvas section.a17-1')).toHaveCount(2)
  await expect(canvasFrame(page).locator('#canvas .a17-1__pager')).toHaveCount(1)
  // its Data group: Source Latest, Count at the page size, Order Newest — P0·5's rows over its own query
  await select(page, added)
  const data = await openData(page)
  await expect(data.locator('button[id$="-source"]')).toContainText('Latest')
  await expect(data.locator('[role="group"][id$="-count"]')).toContainText('12')
  await expect(data.locator('[role="radio"][aria-checked="true"]')).toHaveText('Newest')
  // the MAIN feed's Data group is D5c's: its Count alone, greyed at the page size, with the sentence
  await select(page, main)
  const mainData = await openData(page)
  await expect(mainData).toContainText(RUNTIME.DATA_WORDS.mainCount)
  await expect(mainData.locator('button[id$="-source"]')).toHaveCount(0)
  await expect(mainData.locator('[role="radiogroup"]')).toHaveCount(0)
  await expect(page.locator('#editor-panel-main-feed')).toHaveText(WORDS.MAIN_FEED)
  // ONE ⌘Z takes the placement away
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator(`[data-layer-row="${added}"]`)).toHaveCount(0)
})

test('5.19 · Make this the main feed moves the chip in ONE edit, said aloud; Delete hands it on, and one ⌘Z brings both back', async ({ page }) => {
  await open(page)
  const main = await mainKey(page)
  const added = await placeSecondGrid(page)
  // offered on the secondary feed, second in its menu after Hide (R-126); absent on the main feed and a non-feed row
  expect(await rowMenuWords(page, added)).toEqual(['Hide', WORDS.MAKE_MAIN_FEED, 'Rename', 'Duplicate', 'Delete'])
  expect(await rowMenuWords(page, main)).not.toContain(WORDS.MAKE_MAIN_FEED)
  const other = (await rows(page)).page.find((k) => k !== main && k !== added)
  expect(await rowMenuWords(page, other)).not.toContain(WORDS.MAKE_MAIN_FEED)

  await rowItem(page, added, WORDS.MAKE_MAIN_FEED)
  await expect.poll(() => mainKey(page)).toBe(added)
  expect(await said(page)).toBe(WORDS.NOW_MAIN(await nameOf(page, added)))
  await expect(canvasFrame(page).locator('#canvas .a17-1__pager'), 'still one pager — now the new main feed\'s').toHaveCount(1)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => mainKey(page), { message: 'one ⌘Z undoes the reassignment' }).toBe(main)

  // Delete the main feed: the next visible feed below takes the flag IN THE SAME EDIT, and the sentence says both
  const mainName = await nameOf(page, main)
  await select(page, main)
  await page.keyboard.press('Delete')
  await expect(page.locator(`[data-layer-row="${main}"]`)).toHaveCount(0)
  await expect.poll(() => mainKey(page)).toBe(added)
  expect(await said(page)).toBe(WORDS.withTransfer(`${mainName} removed`, await nameOf(page, added)))
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => mainKey(page), { message: 'one ⌘Z restores the feed AND its flag' }).toBe(main)
  await expect(chipRow(page)).toHaveCount(1)
})

test('5.19 · ⌘D on the main feed gives a copy that is never the main feed', async ({ page }) => {
  await open(page)
  const main = await mainKey(page)
  const before = (await rows(page)).page
  await select(page, main)
  await page.keyboard.press('ControlOrMeta+d')
  await expect.poll(async () => (await rows(page)).page.length).toBe(before.length + 1)
  await expect(chipRow(page)).toHaveCount(1)
  expect(await mainKey(page)).toBe(main)
  await expect(canvasFrame(page).locator('#canvas .a17-1__pager'), 'the copy draws no pager of its own').toHaveCount(1)
})

// DW-257 (Story 5.24d) — THE MAIN-FEED RULE'S OTHER DOORS, on every commit. The server door is `read.ts`'s `designateAll`,
// which the harness now opens through too (its Home carries no flag of its own: the stops above see the rule's choice).
// The local hydrate is the second door, and the paint's edit read the third.
test('DW-257: the local hydrate is a door the rule stands at — a kept copy with no main feed opens with exactly one', async ({ page }) => {
  const PROJECT = '00000000-0000-4000-8000-000000000009'
  await open(page)
  await expect(chipRow(page), 'the control: the harness Home opens with its main feed').toHaveCount(1)
  // the editor's own record of this project, written as it opened: every Home flag taken off, as a copy kept on a device
  // from before the rule holds it, and the first row renamed, so the reload is seen to open from THIS copy
  const kept = 'Kept on this device'
  const unflag = () => page.evaluate(({ id, name }) => new Promise((resolve, reject) => {
    const req = indexedDB.open('inflozo-doc-harness')
    req.onerror = () => reject(req.error)
    req.onsuccess = () => {
      const db = req.result
      const store = db.transaction('meta', 'readwrite').objectStore('meta')
      const get = store.get(id)
      get.onerror = () => reject(get.error)
      get.onsuccess = () => {
        const row = get.result
        if (!row?.docs?.home) { db.close(); resolve(false); return }
        row.docs.home.instances = row.docs.home.instances.map((i, n) => ({ ...i, isMainFeed: false, ...(n === 0 ? { layerName: name } : {}) }))
        const put = store.put(row)
        put.onerror = () => reject(put.error)
        put.onsuccess = () => { db.close(); resolve(true) }
      }
    }
  }), { id: PROJECT, name: kept })
  await expect.poll(unflag, 'the editor has written its local record').toBe(true)
  await page.reload()
  await expect(canvasFrame(page).locator('#canvas > *').first()).toBeVisible()
  await expect(page.locator('[data-layer-row]').filter({ hasText: kept }), 'the control: the reload opened from the kept copy').toHaveCount(1)
  await expect(chipRow(page), 'repaired as it entered: exactly one main feed').toHaveCount(1)
})

test('DW-257: an edit that needs a read no press made asks for it exactly once — a secondary feed set to By tag, on the site\'s content', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'surfaces' })
  await answeringSite(page)
  const asked = []
  page.on('request', (r) => {
    if (r.method() === 'GET' && r.url().includes('/ghost/api/content/')) asked.push(r.url())
  })
  await open(page)
  await expect(page.locator('iframe[title$="canvas"]'), 'the control: the page is drawn from the site').toHaveAttribute('data-source', 'site')
  // a secondary feed — the main feed's copy, whose own query is one the page already read
  const main = await mainKey(page)
  const own = (await rows(page)).page
  await select(page, main)
  await page.keyboard.press('ControlOrMeta+d')
  await expect.poll(async () => (await rows(page)).page.length).toBe(own.length + 1)
  const copy = (await rows(page)).page.find((k) => !own.includes(k))
  await select(page, copy)
  const data = await openData(page)
  // THE EDIT: its Source set to By tag — a tag filter no press has read
  const tagged = (url) => /[?&]filter=tag(%3A|:)/.test(url)
  await data.locator('button[id$="-source"]').focus()
  await page.keyboard.press('Enter')
  await menuTo(page, LIB.POST_SOURCE_WORDS.tag)
  await page.keyboard.press('Enter')
  await expect(data.locator('button[id$="-source"]')).toContainText(LIB.POST_SOURCE_WORDS.tag)
  await expect.poll(() => asked.filter(tagged).length, 'the paint asked for the read the edit needs').toBeGreaterThan(0)
  await expect(page.locator('iframe[title$="canvas"]'), 'and drew the page from the site when it landed — never dropped whole to the sample').toHaveAttribute('data-source', 'site')
  await page.waitForTimeout(1500)
  // the feed's query in both orders (the panel's Order reads either): each a read of its own, and each asked ONCE
  const reads = asked.filter(tagged)
  expect(reads, 'each read the edit needs, asked exactly once').toEqual([...new Set(reads)])
})

test('5.19 · Source and the picked list from the keyboard: Hand-picked, three picks, and ⌥↓ moves one — announced', async ({ page }) => {
  await open(page)
  const added = await placeSecondGrid(page)
  await select(page, added)
  const data = await openData(page)
  // Source → Hand-picked: Enter opens P0·5's select on its value, ↓ to the choice, Enter
  await data.locator('button[id$="-source"]').focus()
  await page.keyboard.press('Enter')
  await menuTo(page, LIB.POST_SOURCE_WORDS.picked)
  await page.keyboard.press('Enter')
  await expect(data.locator('button[id$="-source"]')).toContainText(LIB.POST_SOURCE_WORDS.picked)
  await expect(data.locator('[data-picked-list]')).toContainText(WORDS.NO_PICKS)
  // nothing picked is zero items: the secondary feed leaves the canvas, heading and all, and its row stays
  await expect(canvasFrame(page).locator('#canvas section.a17-1')).toHaveCount(1)
  await expect(page.locator(`[data-layer-row="${added}"]`)).toHaveCount(1)
  // Count and Order grey with P0·5's sentences
  await expect(data).toContainText(RUNTIME.DATA_WORDS.pickedCount)
  await expect(data).toContainText(RUNTIME.DATA_WORDS.pickedOrder)
  // three picks, each from the search: Enter opens it on its field, Tab reaches the first match, Enter picks
  const search = data.locator('button[id$="-search"]')
  for (let n = 0; n < 3; n++) {
    await search.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator(':popover-open input[type="search"]')).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Escape')
  }
  await expect(data.locator('[data-picked-count]')).toHaveText(WORDS.PICKED(3))
  const picks = () => data.locator('[data-pick] span.truncate').allInnerTexts()
  const drawn = () => canvasFrame(page).locator('#canvas section.a17-1').nth(1).locator('.a17-1__post-title').allInnerTexts()
  const first = await picks()
  expect(await drawn(), 'the canvas draws the picks in the picked order').toEqual(first)
  // ⌥↓ on the first handle: it moves one down, the move is said in P0·3's words, and the canvas follows
  await data.locator('[data-pick-handle="0"]').focus()
  await page.keyboard.press('Alt+ArrowDown')
  await expect.poll(picks).toEqual([first[1], first[0], first[2]])
  await expect(data.locator('[data-picked-list] [aria-live="polite"]')).toHaveText(RUNTIME.movedTo(1, 3))
  await expect.poll(drawn).toEqual([first[1], first[0], first[2]])
  await expect(data.locator('[data-pick-handle="1"]'), 'focus follows the moved pick').toBeFocused()
  // a switch of Source loses nothing: Latest, then Hand-picked again, and the picks are as they were
  await data.locator('button[id$="-source"]').focus()
  await page.keyboard.press('Enter')
  await menuTo(page, LIB.POST_SOURCE_WORDS.latest)
  await page.keyboard.press('Enter')
  await data.locator('button[id$="-source"]').focus()
  await page.keyboard.press('Enter')
  await menuTo(page, LIB.POST_SOURCE_WORDS.picked)
  await page.keyboard.press('Enter')
  await expect.poll(picks).toEqual([first[1], first[0], first[2]])
})

test('5.19 · AD-37: the canvas at rest carries no chrome — the MAIN FEED chip is drawn only on a selected or pointed main feed', async ({ page }) => {
  await open(page)
  expect(await marked(page), 'at rest the page is the site').toBe(0)
  expect(await inChrome(page, '[data-chrome="main-feed"]')).toBe(0)
  await select(page, await mainKey(page))
  await expect.poll(() => inChrome(page, '[data-chrome="main-feed"]'), { message: 'selected: the chip on its outline' }).toBe(1)
  await page.keyboard.press('Escape')
  await expect.poll(() => inChrome(page, '[data-chrome="main-feed"]'), { message: 'deselected: gone' }).toBe(0)
  // a section that is not the main feed never carries it
  const main = await mainKey(page)
  await select(page, (await rows(page)).page.find((k) => k !== main))
  expect(await inChrome(page, '[data-chrome="main-feed"]')).toBe(0)
  // pointed (synthesized, as R-175's stop does): drawn beside the name tag, never over it (R-125)
  await pointAt(page, '.a17-1')
  await expect.poll(() => inChrome(page, '[data-chrome="tag"]')).toBe(1)
  await expect.poll(() => inChrome(page, '[data-chrome="main-feed"]')).toBe(1)
  const overlap = await canvasFrame(page).locator('body').evaluate((body) => {
    const host = [...body.ownerDocument.querySelectorAll('[data-inflozo-chrome]')].find((h) => h.shadowRoot?.querySelector('[data-chrome="main-feed"]'))
    const chip = host.shadowRoot.querySelector('[data-chrome="main-feed"]').getBoundingClientRect()
    const tag = host.shadowRoot.querySelector('[data-chrome="tag"]').getBoundingClientRect()
    return chip.left < tag.right && tag.left < chip.right && chip.top < tag.bottom && tag.top < chip.bottom
  })
  expect(overlap, 'the chip never covers the name tag').toBe(false)
})

test('5.19 · the first feed placed on a page with none lands as the MAIN feed, and says so', async ({ page }) => {
  await open(page)
  const main = await mainKey(page)
  // delete the harness Home's only feed: zero feeds, allowed — no chip anywhere
  await select(page, main)
  await page.keyboard.press('Delete')
  await expect(page.locator(`[data-layer-row="${main}"]`)).toHaveCount(0)
  await expect(chipRow(page)).toHaveCount(0)
  // ⌘K from the first section left, and Three Up placed: it takes the flag in the placement's own edit
  const own = (await rows(page)).page
  await select(page, own[0])
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(picker(page)).toBeVisible()
  await picker(page).locator('[data-cell][data-design="a17/1"]').first().focus()
  await page.keyboard.press('Enter')
  await expect(picker(page)).toHaveCount(0)
  // R-210: Layers follows the canvas a frame later — the check waits for it, and checks nothing different
  await expect.poll(async () => (await rows(page)).page.some((k) => !own.includes(k)), { message: 'one section placed' }).toBe(true)
  const added = (await rows(page)).page.find((k) => !own.includes(k))
  await expect.poll(() => mainKey(page)).toBe(added)
  expect(await said(page)).toBe(WORDS.ADDED_AS_MAIN(await nameOf(page, added)))
  await expect(canvasFrame(page).locator('#canvas .a17-1__pager'), 'the new main feed draws the pager').toHaveCount(1)
  // one ⌘Z takes the placement away, flag and all
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator(`[data-layer-row="${added}"]`)).toHaveCount(0)
  await expect(chipRow(page)).toHaveCount(0)
})

// ── Story 5.20 — THE PAYWALL CANVAS, A TEMPLATE SURFACE (R-146's walk of the wiring; the stack is the deployed walk's) ──

const PAYWALL = await import(new URL('../../apps/web/lib/paywall.ts', import.meta.url).href)
const P = PAYWALL.PAYWALL_WORDS
const surfaceBox = (page) => canvasFrame(page).locator('[data-inflozo-box]')

/** Template ▾, then End — the Template surfaces group is the menu's last — and Enter: one soft navigation, the editor
 *  mounted across it, and the Paywall canvas painted. */
async function openPaywall(page) {
  await open(page)
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  // the menu opens ON ITS CHECKED ROW a frame after the key (R-171) — the next key waits for it, as `menuTo` does
  await expect(page.locator('[data-canvas="home"]')).toBeFocused()
  await page.keyboard.press('End')
  await expect(page.locator('[data-canvas="paywall"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/app\/harness\/editor\/paywall$/)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'paywall')
}

/** View as, from the keyboard: open its menu and step to `visitor`'s row. */
async function viewAs(page, visitor) {
  await page.locator('#editor-view-as').focus()
  await page.keyboard.press('Enter')
  const menu = page.locator('#editor-view-as-menu')
  await expect(menu).toBeVisible()
  // the menu takes focus ON ITS CHECKED ROW a frame after the key (R-171): step only once a row holds it
  await expect(menu.locator('[data-visitor]:focus')).toHaveCount(1)
  for (let n = 0; n < 4 && (await page.evaluate(() => document.activeElement?.getAttribute('data-visitor'))) !== visitor; n++) await page.keyboard.press('ArrowDown')
  await expect(menu.locator(`[data-visitor="${visitor}"]`)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(menu).toBeHidden()
}

test('5.20 · Template ▾ → Paywall: the ink bar says so, Layers holds C3a\'s card alone, and a logged out user meets the cut and Ghost\'s own box', async ({ page }) => {
  await openPaywall(page)
  // the bar: ink, NOT A PAGE SECTION, Back to post — and no Remix and no Preview (FR-D17, the spec's bar)
  await expect(page.locator('header[data-surface]')).toHaveCount(1)
  await expect(page.locator('[data-surface-chip]')).toHaveText(P.chip)
  await expect(page.locator('#paywall-back')).toHaveText(P.back)
  await expect(page.locator('#editor-remix')).toHaveCount(0)
  await expect(page.locator('#editor-preview')).toHaveCount(0)
  // the switcher's row: R-130's "Empty" while the paywall is untouched, in the Template surfaces group
  await expect(page.locator('#editor-template-surfaces')).toHaveText(P.group)
  await expect(page.locator('[data-canvas="paywall"] [data-mark="empty"]')).toHaveCount(1)
  // Layers: no rows, no "+ Add section", and C3a's card with the sample's own tier line — and no admin link (no site)
  await expect(page.locator('[data-layer-row]')).toHaveCount(0)
  await expect(page.locator('#editor-add-section')).toHaveCount(0)
  await expect(page.locator('[data-paywall-how]')).toContainText(P.howHeading)
  await expect(page.locator('[data-tier-line]')).toHaveText(PAYWALL.tierLine(LIB.orbitWeekly.tiers()))
  await expect(page.locator('[data-tiers-link]')).toHaveCount(0)
  // the strip: the cut, and the article above it is context
  await expect(page.locator('[data-paywall-showing]')).toHaveText(`${P.showingLead} ${P.showing(false)}`)
  await expect(page.locator('[data-paywall-strip]')).toContainText(P.context(false))
  // the canvas: the cut marker's two labels, then Ghost's own box in Ghost's own words (MEASUREMENTS §54)
  await expect(canvasFrame(page).locator('[data-inflozo-cut-label]')).toHaveText(P.cut)
  await expect(canvasFrame(page).locator('[data-inflozo-cut-note]')).toHaveText(P.below)
  await expect(surfaceBox(page).locator('aside.gh-post-upgrade-cta h2')).toHaveText('This post is for paying subscribers only')
  await expect(surfaceBox(page).locator('a[data-portal="signup"]')).toHaveText('Subscribe now')
  await expect(surfaceBox(page).locator('a[data-portal="signin"]')).toHaveText('Sign in')
  // the article is context, at C3a's 55% — and the box wears the sample's own accent, Orbit Weekly's
  expect(await canvasFrame(page).locator('[data-inflozo-dim] > p').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('0.55')
  expect((await surfaceBox(page).locator('.gh-post-upgrade-cta-content').getAttribute('style')).toLowerCase()).toContain(String(LIB.orbitWeekly.site().accent_color).toLowerCase())
  // the panel: "Paywall", and Ghost's own paywall said so
  await expect(page.locator('#editor-panel-name')).toHaveText(P.panel)
  await expect(page.locator('#paywall-untouched')).toHaveText(P.untouched)
})

test('5.20 · View as walks the three visitors: Ghost\'s own box for each who may not read, and S4d\'s gated label for the paid member (R-199)', async ({ page }) => {
  await openPaywall(page)
  await viewAs(page, 'free')
  await expect(surfaceBox(page).locator('a[data-portal="account/plans"]')).toHaveText('Upgrade your account')
  await expect(canvasFrame(page).locator('[data-inflozo-gated]')).toHaveCount(0)
  await viewAs(page, 'paid')
  // the whole post: no cut, no box, the label where the locked part begins — and the strip says so
  await expect(canvasFrame(page).locator('[data-inflozo-cut]')).toHaveCount(0)
  await expect(surfaceBox(page)).toHaveCount(0)
  await expect(canvasFrame(page).locator('[data-inflozo-gated]')).toHaveText(P.gated)
  await expect(page.locator('[data-paywall-showing]')).toHaveText(`${P.showingLead} ${P.showing(true)}`)
  await viewAs(page, 'anonymous')
  await expect(surfaceBox(page).locator('a[data-portal="signup"]')).toHaveText('Subscribe now')
})

test('5.20 · choosing a stand-in from untouched is ONE edit — the strip and the head count it, ▶ steps the ring, a setting changes it, and one ⌘Z per edit returns Ghost\'s own box', async ({ page }) => {
  await openPaywall(page)
  const tiles = page.locator('[data-design-tile]')
  const ring = await tiles.count()
  expect(ring, 'the harness hands in two stand-ins (R-158)').toBeGreaterThan(1)
  // Review 5.20 — ◀ from untouched chooses the LAST design, ▶ the first (`stepDesign`'s surface branch), one edit each
  await page.locator('[data-design-step="-1"]').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-panel-position')).toHaveText(`${ring} / ${ring}`)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('#paywall-untouched')).toHaveText(P.untouched)
  // the strip is one tab stop — its first tile where nothing is chosen yet — and Enter chooses
  await page.locator('[data-design-tile][tabindex="0"]').focus()
  await page.keyboard.press('Enter')
  const first = await tiles.first().getAttribute('aria-label')
  await expect(page.locator('#editor-said')).toHaveText(`Design 1 of ${ring} — ${first}`)
  await expect(page.locator('[data-paywall-design]')).toHaveText(P.design(1, ring, first))
  await expect(page.locator('#editor-panel-position')).toHaveText(`1 / ${ring}`)
  await expect(surfaceBox(page).locator('aside.gh-post-upgrade-cta')).toHaveCount(0)
  await expect(surfaceBox(page).locator(':scope > *')).toHaveCount(1)
  // Review 5.20 — ⌘D, Delete and P are refused on a surface: still one instance, no preview bar, the ink bar stays
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+d')
  await page.keyboard.press('Delete')
  await page.keyboard.press('p')
  await expect(surfaceBox(page).locator(':scope > *')).toHaveCount(1)
  await expect(page.locator('#paywall-untouched')).toHaveCount(0)
  await expect(page.locator('#editor-preview-bar')).toHaveCount(0)
  await expect(page.locator('header[data-surface]')).toHaveCount(1)
  // ▶ steps the ring, one edit
  await page.locator('[data-design-step="1"]').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-panel-position')).toHaveText(`2 / ${ring}`)
  // a setting: the layout group's segmented control, one step along
  await openEveryGroup(page)
  const radio = page.locator('#editor-controls [role="radiogroup"] [role="radio"][tabindex="0"]').first()
  const was = await radio.getAttribute('aria-label')
  await radio.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('#editor-controls [role="radiogroup"] [role="radio"][aria-checked="true"]').first()).not.toHaveAttribute('aria-label', was ?? '')
  // three edits, three ⌘Z — and the last one is Ghost's own box again, untouched
  await page.locator('section[aria-label="Canvas"]').focus()
  for (let n = 0; n < 3; n++) await page.keyboard.press('ControlOrMeta+z')
  await expect(surfaceBox(page).locator('aside.gh-post-upgrade-cta')).toHaveCount(1)
  await expect(page.locator('#paywall-untouched')).toHaveText(P.untouched)
  await expect(page.locator('#editor-panel-position')).toHaveCount(0)
})

test('5.20 · members off: C3b\'s card in R-198\'s words; Re-check says "Re-checking…" with aria-busy and never disabled, and its refusal is said', async ({ page }) => {
  // the harness's members-off site, asked for by header; its Re-check is refused (no database, 5.14's precedent), and
  // held for a moment on the wire so the busy state is really on screen to be read
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'members-off' })
  await page.route('**/app/harness/editor/paywall', async (route) => {
    if (route.request().method() === 'POST' && route.request().headers()['next-action']) await new Promise((r) => setTimeout(r, 700))
    await route.continue()
  })
  await page.goto(`${HARNESS}/paywall`)
  const card = page.locator('[data-paywall-off]')
  await expect(card).toBeVisible()
  await expect(card).toContainText(P.offTitle)
  await expect(card).toContainText(P.offBody('Harness site'))
  await expect(card).toContainText(P.offStep1)
  await expect(card).toContainText(P.offStep2)
  await expect(page.locator('[data-members-off-chip]')).toHaveText(P.offChip)
  // the page card is hidden under it, and the strip is not drawn
  await expect(page.locator('[data-paywall-strip]')).toHaveCount(0)
  const recheck = page.locator('#paywall-recheck')
  // the canvas re-checks on open by itself ("we re-check whenever you open this screen"): the press waits for that one
  await expect(recheck).toHaveText(P.recheck)
  await expect(card.locator('[role="status"]'), 'the re-check on open was refused too, and said so').toHaveText(P.refused('Harness site'))
  await recheck.focus()
  await page.keyboard.press('Enter')
  await expect(recheck).toHaveText(P.rechecking)
  await expect(recheck).toHaveAttribute('aria-busy', 'true')
  await expect(recheck).not.toHaveAttribute('disabled', /.*/)
  await expect(card.locator('[role="status"]')).toHaveText(P.refused('Harness site'))
  await expect(recheck).toHaveText(P.recheck)
  await expect(page.locator('#editor-said')).toHaveText(P.refused('Harness site'))
})

test('5.20 · Back to post leaves the surface: the bar is paper again, the stylesheet is off, and Home carries no paywall chrome at rest', async ({ page }) => {
  await openPaywall(page)
  await page.locator('#paywall-back').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  await expect(page.locator('header[data-surface]')).toHaveCount(0)
  // DW-275 (Story 5.24e): the sheet is the `<link>` the first Paywall paint put in, switched off again here
  expect(await canvasFrame(page).locator('[data-order="2b-surface"]').evaluate((s) => s.media)).toBe('not all')
  await expect(canvasFrame(page).locator('[data-inflozo-cut], [data-inflozo-dim], [data-inflozo-box], [data-inflozo-gated]')).toHaveCount(0)
  // and Home, from the switcher's first row
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="post"]')).toBeFocused()
  await page.keyboard.press('Home')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'home')
  await expect(canvasFrame(page).locator('[data-inflozo-cut], [data-inflozo-dim], [data-inflozo-box], [data-inflozo-gated]')).toHaveCount(0)
  expect(await marked(page), 'at rest the page is the site').toBe(0)
})


test('5.20 · members off, on Sample content: the sample paywall and no card; and a placed sign-up section says members are off (FR-H6)', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'members-off' })
  await page.goto(`${HARNESS}/paywall`)
  await expect(page.locator('[data-paywall-off]')).toBeVisible()
  // B9's pill → Sample content: a view, never an edit — and the card is about the site's content, so it goes
  await page.locator('#editor-source').focus()
  await page.keyboard.press('Enter')
  await page.locator('#editor-source-menu:popover-open').waitFor()
  for (let n = 0; n < 8 && (await page.evaluate(() => document.activeElement?.getAttribute('data-source-row'))) !== 'sample'; n++) await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-paywall-off]')).toHaveCount(0)
  await expect(surfaceBox(page).locator('aside.gh-post-upgrade-cta')).toHaveCount(1)
  await expect(page.locator('[data-tier-line]')).toHaveText(PAYWALL.tierLine(LIB.orbitWeekly.tiers()))
  // Home: the Newsletter band asks a visitor to join, so its panel carries the line — in 5.18's note shape
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="paywall"]')).toBeFocused()
  await page.keyboard.press('Home')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'home')
  const band = await page.locator('[data-layer-row]', { hasText: 'Inline Row' }).first().getAttribute('data-layer-row')
  await select(page, band)
  await expect(page.locator('[data-member-ask]')).toHaveText(P.ask('Harness site'))
  // a section that asks nothing carries no line
  const quiet = await page.locator('[data-layer-row]', { hasText: 'Three Up' }).first().getAttribute('data-layer-row')
  await select(page, quiet)
  await expect(page.locator('[data-member-ask]')).toHaveCount(0)
})

test('5.20 · reading along (R-192): the design choice is greyed and unclickable, while View as, Re-check and Back to post still work', async ({ page }) => {
  // another tab holds the lock (the harness's reader header), and the site's record says members are off
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-lock': 'reader' })
  await page.goto(`${HARNESS}/paywall`)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'paywall')
  const tile = page.locator('[data-design-tile]').first()
  await expect(tile).toBeDisabled()
  await expect(page.locator('[data-design-step="1"]')).toBeDisabled()
  // a look is not an edit: View as still previews the paid member's whole post
  await viewAs(page, 'paid')
  await expect(canvasFrame(page).locator('[data-inflozo-gated]')).toHaveText(P.gated)
  // and the way back is a navigation
  await page.locator('#paywall-back').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  // Re-check is a look too: pressable reading along, and refused here with its sentence (no database)
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-lock': 'reader', 'x-inflozo-harness-site': 'members-off' })
  await page.goto(`${HARNESS}/paywall`)
  const recheck = page.locator('#paywall-recheck')
  await expect(recheck).toHaveText(P.recheck)
  await expect(recheck).toBeEnabled()
  await recheck.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-paywall-off] [role="status"]')).toHaveText(P.refused('Harness site'))
})

// ── Story 5.21 — GHOST'S TWO SURFACES ON THE CANVAS (R-146's walk of the wiring; the stack and a real Ghost are the
//    deployed walks'). The harness's `surfaces` site carries Ghost's announcement bar — to logged-out visitors and free
//    members — and Portal's button on; its address answers nothing, so the canvas paints the sample while both shims draw
//    from the CONNECTION's snapshot. The editor's re-read on open is refused here (no database), leaving the snapshot drawn.

const GS = await import(new URL('../../apps/web/lib/ghost-surfaces.ts', import.meta.url).href)
/** the harness site's announcement, as its words print (`harness/editor/layout.tsx`'s `SURFACES_SITE`) */
const SHIM_WORDS = 'Fixture announcement — seeded for VERIFY 21.'
/** its accent — the sample's own, as the harness hands it — as the browser computes a background */
const SHIM_ACCENT = ((hex) => `rgb(${[1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)).join(', ')})`)(LIB.orbitWeekly.site().accent_color)

async function openSurfaces(page, path = '') {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'surfaces' })
  await page.goto(`${HARNESS}${path}`)
  await expect(canvasFrame(page).locator('#canvas > *').first()).toBeVisible()
  await expect(page.locator('[data-layer-row]').first()).toBeVisible()
  await page.locator('body').focus()
}

/** Both shims as the canvas document holds them — read in the page; the button lives in a shadow root. */
const shims = (page) =>
  canvasFrame(page).locator('body').evaluate((body) => {
    const doc = body.ownerDocument
    const strip = doc.querySelector('[data-ghost-surface="announcement-bar"]')
    const host = doc.querySelector('[data-ghost-surface="portal-button"]')
    const frame = host?.shadowRoot?.querySelector('.gh-portal-triggerbtn-iframe') ?? null
    const bar = strip?.querySelector('.gh-announcement-bar') ?? null
    return {
      surfaces: doc.querySelectorAll('[data-ghost-surface]').length,
      stripFirst: strip !== null && doc.body.firstElementChild === strip,
      stripHeight: strip ? strip.getBoundingClientRect().height : null,
      canvasTop: doc.getElementById('canvas').getBoundingClientRect().top + doc.defaultView.scrollY,
      words: bar?.querySelector('.gh-announcement-bar-content')?.textContent ?? null,
      background: bar ? getComputedStyle(bar).backgroundColor : null,
      close: bar?.querySelector('button')?.getAttribute('aria-label') ?? null,
      buttonAtEnd: host !== null && doc.body.lastElementChild === host,
      buttonShown: frame !== null && getComputedStyle(frame).display !== 'none',
      container: host?.shadowRoot?.querySelector('.gh-portal-triggerbtn-container')?.className ?? null,
      label: host?.shadowRoot?.querySelector('.gh-portal-triggerbtn-label')?.textContent ?? null,
      inert: [strip, host].filter(Boolean).every((el) => el.inert && getComputedStyle(el).pointerEvents === 'none'),
    }
  })

test('5.21 · Ghost\'s strip is the canvas body\'s first child and #canvas starts at its bottom; Portal\'s button is fixed at the end — both inert, zero data-inflozo-* at rest', async ({ page }) => {
  await openSurfaces(page)
  const s = await shims(page)
  expect(s.surfaces, 'NFR-6(c3): [data-ghost-surface] finds the two shims and nothing else').toBe(2)
  expect(s.stripFirst, 'the strip is the body\'s FIRST child, before #canvas — where Ghost prepends its root').toBe(true)
  expect(s.canvasTop, '#canvas begins at the strip\'s bottom edge: the design is pushed down, not changed').toBeCloseTo(s.stripHeight, 1)
  expect(s.stripHeight, 'a one-line bar is Ghost\'s 48px').toBeCloseTo(48, 0)
  expect(s.words).toBe(SHIM_WORDS)
  expect(s.background, 'the words on the site\'s accent').toBe(SHIM_ACCENT)
  expect(s.close, 'Ghost\'s ✕, drawn and doing nothing').toBe('close')
  expect(s.buttonAtEnd, 'Portal\'s host is appended at the end of the body, outside #canvas').toBe(true)
  expect(s.buttonShown).toBe(true)
  expect(s.container).toBe('gh-portal-triggerbtn-container with-label')
  expect(s.label).toBe(' Subscribe ')
  expect(s.inert, 'both roots are inert and let every press through').toBe(true)
  // the strip's sheet is Ghost's own, once, in <head> — and it is not a surface
  expect(await canvasFrame(page).locator(`style[${GS.SHEET}]`).count()).toBe(1)
  expect(await canvasFrame(page).locator(`style[${GS.SHEET}]`).evaluate((s) => s.textContent)).toBe(GS.ANNOUNCEMENT_CSS)
  expect(await marked(page), 'at rest the page is the site: the shims carry no data-inflozo-*').toBe(0)
})

test('5.21 · a press passes through both shims: the point on the strip is the ground (R-123), the point on the button is the section beneath', async ({ page }) => {
  await openSurfaces(page)
  const hits = await canvasFrame(page).locator('body').evaluate((body) => {
    const doc = body.ownerDocument
    const strip = doc.querySelector('[data-ghost-surface="announcement-bar"]').getBoundingClientRect()
    const button = doc.querySelector('[data-ghost-surface="portal-button"]').shadowRoot.querySelector('.gh-portal-triggerbtn-container').getBoundingClientRect()
    const at = (x, y) => doc.elementFromPoint(x, y)
    const onStrip = at(strip.x + 200, strip.y + strip.height / 2)
    const onButton = at(button.x + button.width / 2, button.y + button.height / 2)
    return {
      strip: onStrip?.tagName ?? null,
      stripSurface: !!onStrip?.closest('[data-ghost-surface]'),
      button: onButton?.closest('#canvas > *')?.tagName ?? null,
      buttonSurface: !!onButton?.closest('[data-ghost-surface]') || onButton === doc.querySelector('[data-ghost-surface="portal-button"]'),
    }
  })
  expect(hits.stripSurface, 'nothing on the strip can be hit').toBe(false)
  expect(['BODY', 'HTML']).toContain(hits.strip)
  expect(hits.buttonSurface, 'nothing on the button can be hit').toBe(false)
  expect(hits.button, 'the section under the button takes the point').not.toBeNull()
})

test('5.21 · View as: the strip follows the audience (logged out and free, not paid) and the button takes Portal\'s member look for a member', async ({ page }) => {
  await openSurfaces(page)
  const want = { anonymous: [true, 'gh-portal-triggerbtn-container with-label', ' Subscribe '], free: [true, 'gh-portal-triggerbtn-container halo', null], paid: [false, 'gh-portal-triggerbtn-container halo', null] }
  for (const visitor of ['free', 'paid', 'anonymous']) {
    await viewAs(page, visitor)
    await expect.poll(async () => (await shims(page)).stripFirst, visitor).toBe(want[visitor][0])
    const s = await shims(page)
    expect(s.container, visitor).toBe(want[visitor][1])
    expect(s.label, visitor).toBe(want[visitor][2])
    // no strip, no push: #canvas starts at the very top
    if (!want[visitor][0]) expect(s.canvasTop, `${visitor}: no strip, and the header at the very top`).toBe(0)
  }
})

test('5.21 · devices: no button at 390 and the strip wraps; the button at 834 — a media query, so no repaint', async ({ page }) => {
  await openSurfaces(page)
  await canvasFrame(page).locator('body').evaluate((b) => { b.ownerDocument.defaultView.__before = b.ownerDocument.querySelector('[data-ghost-surface]') })
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('3')
  await expect.poll(async () => (await shims(page)).buttonShown, 'Portal draws no button below 640px').toBe(false)
  const phone = await shims(page)
  expect(phone.stripFirst).toBe(true)
  expect(phone.stripHeight, 'the words wrap, as Ghost\'s do').toBeGreaterThan(48)
  expect(phone.canvasTop).toBeCloseTo(phone.stripHeight, 1)
  await page.keyboard.press('2')
  await expect.poll(async () => (await shims(page)).buttonShown, 'at 834 the button is back').toBe(true)
  expect((await shims(page)).stripHeight).toBeCloseTo(48, 0)
  await page.keyboard.press('1')
  expect(await canvasFrame(page).locator('body').evaluate((b) => b.ownerDocument.defaultView.__before === b.ownerDocument.querySelector('[data-ghost-surface]')), 'the same strip node: a device change repaints nothing').toBe(true)
})

test('5.21 · dark mode, Preview and page 2 leave both as they were; Layers, Undo and the device\'s record are untouched', async ({ page }) => {
  await openSurfaces(page)
  const layers = (await rows(page)).all
  const kept = await storedKeys(page)
  const before = await shims(page)
  await page.locator('section[aria-label="Canvas"]').focus()
  // dark: one attribute and a re-stamp, never a repaint — the same strip node, the same look (it is Ghost's, not the pack's)
  await canvasFrame(page).locator('body').evaluate((b) => { b.ownerDocument.defaultView.__strip = b.ownerDocument.querySelector('[data-ghost-surface]') })
  await page.keyboard.press('.')
  await expect.poll(() => modeOf(page)).toBe('dark')
  expect(await shims(page)).toEqual(before)
  expect(await canvasFrame(page).locator('body').evaluate((b) => b.ownerDocument.defaultView.__strip === b.ownerDocument.querySelector('[data-ghost-surface]'))).toBe(true)
  await page.keyboard.press('.')
  await expect.poll(() => modeOf(page)).toBe('light')
  // Preview: the site, as a visitor meets it — both drawn, and still inert
  await page.keyboard.press('p')
  await expect(page.locator('#editor-preview-bar')).toBeVisible()
  expect(await shims(page)).toEqual(before)
  await page.keyboard.press('Escape')
  await expect(page.locator('#editor-preview-bar')).toHaveCount(0)
  // page 2: a repaint, and both drawn again exactly as on page 1
  await toPageTwo(page)
  expect(await shims(page)).toEqual(before)
  await pagePill(page).getByRole('button', { name: TWO.BACK_TO_PAGE_ONE }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '1')
  // a look is never an edit: no Layers row for either shim, nothing to undo, nothing stored
  expect((await rows(page)).all).toEqual(layers)
  await expect(page.locator('#editor-undo')).toHaveAttribute('aria-disabled', 'true')
  expect(await storedKeys(page)).toEqual(kept)
})

test('5.21 · Sample content keeps both (the connection\'s, not the content\'s); the Paywall shows neither, and Home draws them again', async ({ page }) => {
  await openSurfaces(page)
  await page.locator('#editor-source').focus()
  await page.keyboard.press('Enter')
  await page.locator('#editor-source-menu:popover-open').waitFor()
  for (let n = 0; n < 8 && (await page.evaluate(() => document.activeElement?.getAttribute('data-source-row'))) !== 'sample'; n++) await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-source', 'sample')
  expect((await shims(page)).surfaces).toBe(2)
  // Template ▾ → Paywall: a template surface, never a page Ghost prepends a bar to
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="home"]')).toBeFocused()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'paywall')
  await expect.poll(async () => (await shims(page)).surfaces).toBe(0)
  await page.locator('#paywall-back').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  expect((await shims(page)).surfaces, 'a page canvas draws them again').toBe(2)
})

test('5.21 · #canvas is byte-identical with and without a connected site — the shims sit outside it', async ({ page }) => {
  const canvasHtml = () => canvasFrame(page).locator('#canvas').evaluate((c) => c.innerHTML)
  await open(page)
  const bare = await canvasHtml()
  expect((await shims(page)).surfaces, 'the control: an unlinked project draws no shim').toBe(0)
  await openSurfaces(page)
  expect((await shims(page)).surfaces).toBe(2)
  expect(await canvasHtml()).toBe(bare)
})

test('5.21 · a selected sticky header keeps its outline on its own box while the strip scrolls away and the header sticks (pinned only while stuck)', async ({ page }) => {
  await openSurfaces(page)
  await select(page, (await rows(page)).site[0])
  const outlineOnHeader = () =>
    canvasFrame(page).locator('body').evaluate((body) => {
      const doc = body.ownerDocument
      const header = doc.querySelector('#canvas > [data-inflozo-selected]')
      const box = [...doc.querySelectorAll('[data-inflozo-chrome]')].map((h) => h.shadowRoot?.querySelector('[data-chrome="selected"]')).find(Boolean)
      if (!header || !box) return null
      const h = header.getBoundingClientRect()
      const o = box.getBoundingClientRect()
      return { sticky: getComputedStyle(header).position, headerTop: h.top, dx: Math.abs(o.left - h.left), dy: Math.abs(o.top - h.top), dw: Math.abs(o.width - h.width), dh: Math.abs(o.height - h.height), layer: box.getRootNode().host.getAttribute('data-inflozo-chrome') }
    })
  const scrollTo = (y) => canvasFrame(page).locator('body').evaluate((b, top) => b.ownerDocument.defaultView.scrollTo(0, top), y)
  // at rest the header sits under the strip, not yet stuck: its chrome scrolls with the page
  await expect.poll(async () => (await outlineOnHeader())?.layer).toBe('page')
  const rest = await outlineOnHeader()
  expect(rest.sticky, 'the harness header is sticky — the case this rule is for').toBe('sticky')
  expect(rest.headerTop).toBeCloseTo((await shims(page)).stripHeight, 0)
  for (const [y, layer] of [[20, 'page'], [300, 'view'], [0, 'page']]) {
    await scrollTo(y)
    await expect.poll(async () => (await outlineOnHeader())?.layer, `scrolled to ${y}`).toBe(layer)
    await page.waitForTimeout(100)
    const at = await outlineOnHeader()
    for (const d of ['dx', 'dy', 'dw', 'dh']) expect(at[d], `scrolled to ${y}: the outline is on the header (${d})`).toBeLessThanOrEqual(1)
  }
})

test('5.21 · the editor re-reads the site ONCE per opening — reading along too (R-192) — and the Paywall\'s re-check on entry stays; no site, no read', async ({ page }) => {
  // a server action's POST body is its arguments, so the re-read (`recheckSite(projectId)`) is the one whose body is the
  // project id alone — `setViewedStates` sends its rows beside it. The harness has no database, so each is refused.
  const PROJECT = '00000000-0000-4000-8000-000000000009'
  let rereads = 0
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.headers()['next-action'] && r.postData() === JSON.stringify([PROJECT])) rereads++
  })
  // the control: an unlinked project reads nothing
  await open(page)
  await page.waitForTimeout(1500)
  expect(rereads, 'no site, no re-read').toBe(0)
  // reading along, on a connected site: the one re-read as it opens, and the snapshot stays drawn when it is refused
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'surfaces', 'x-inflozo-harness-lock': 'reader' })
  await page.goto(HARNESS)
  await expect(canvasFrame(page).locator('#canvas > *').first()).toBeVisible()
  await expect.poll(() => rereads, 'one re-read as the editor opens, reading along').toBe(1)
  expect((await shims(page)).surfaces, 'the refusal leaves the stored snapshot drawn').toBe(2)
  // soft navigations are not openings: Post and back to Home read nothing more
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="home"]')).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  await page.waitForTimeout(1000)
  expect(rereads, 'a change of canvas is not an opening').toBe(1)
  // the Paywall's own re-check on entry stays — one more
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="post"]')).toBeFocused()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'paywall')
  await expect.poll(() => rereads, 'entering the Paywall re-checks').toBe(2)
  // an editor opened ON the Paywall makes the one read that serves both
  rereads = 0
  await page.goto(`${HARNESS}/paywall`)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'paywall')
  await expect.poll(() => rereads, 'opened on the Paywall: the one read').toBe(1)
  await page.waitForTimeout(1500)
  expect(rereads, 'opened on the Paywall: one read, never two').toBe(1)
})

// DW-279 (Story 5.24d) — A RE-READ THAT LANDS, seen by the harness at last. `surfaces-later` is the linked site with an EMPTY
// stored snapshot, and the harness's own re-read (`harness/editor/actions.ts`, the editor's `reread` seam) answers it
// with both surfaces. The answer is HELD until the empty snapshot has painted, so it can only reach the canvas through
// the re-read's own redraw: unheld, it lands before the first paint, `paint()` draws it, and cutting the redraw stays
// green (executed at Story 5.24d's Create).
test('DW-279: a re-read that lands redraws Ghost\'s strip and button over a canvas painted without them', async ({ page }) => {
  const PROJECT = '00000000-0000-4000-8000-000000000009'
  let release
  const answer = new Promise((go) => { release = go })
  let rereads = 0
  await page.route('**/app/harness/editor**', async (route) => {
    const r = route.request()
    // the re-read is the action whose body is the project id alone (5.21's stop above)
    if (r.method() === 'POST' && r.headers()['next-action'] && r.postData() === JSON.stringify([PROJECT])) {
      rereads++
      await answer
    }
    await route.continue()
  })
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'surfaces-later' })
  await page.goto(HARNESS)
  await expect(canvasFrame(page).locator('#canvas > *').first()).toBeVisible()
  await expect.poll(() => rereads, 'the one re-read as the editor opens, held').toBe(1)
  expect((await shims(page)).surfaces, 'the control: the stored snapshot is empty, so the canvas painted no surface').toBe(0)
  // R-215 (DW-277, Story 5.24e): and Layers lists no Ghost surface the site does not show — no group at all yet
  await expect(page.locator('[data-ghost-rows]'), 'no From your Ghost site group while the snapshot shows nothing').toHaveCount(0)
  release()
  await expect.poll(async () => (await shims(page)).surfaces, 'the answer landed and the re-read drew both surfaces').toBe(2)
  // …and once the answer shows both, both rows are listed
  await expect.poll(async () => (await rows(page)).all.filter((k) => k.startsWith('ghost:')), 'both rows, once the site shows both').toEqual(GS.GHOST_ROWS.map((r) => `ghost:${r.id}`))
  const drawn = await shims(page)
  expect(drawn.words, 'the strip carries the answer\'s words').toBe(SHIM_WORDS)
  expect(drawn.stripFirst && drawn.buttonAtEnd && drawn.buttonShown, 'each where Ghost puts it').toBe(true)
})

test('5.21 · From your Ghost site (the owner\'s finding): two Layers rows name the shims; Enter chooses one and lets the section go; Space hides it in this browser, Preview shows it anyway; a synthesized pointer over the strip draws the tag', async ({ page }) => {
  await openSurfaces(page)
  const ghostRows = (await rows(page)).all.filter((k) => k.startsWith('ghost:'))
  expect(ghostRows, 'one row per surface, under the group').toEqual(GS.GHOST_ROWS.map((r) => `ghost:${r.id}`))
  await expect(page.locator('[data-ghost-rows]')).toContainText(GS.GHOST_WORDS.group)
  await expect(page.locator('[data-ghost-rows]')).toContainText(GS.GHOST_WORDS.line)
  const stripRow = page.locator('[data-layer-row="ghost:announcement-bar"]')
  // a section chosen first, then the strip's row: ONE selection — the section is let go, the row takes the tint
  const header = (await rows(page)).site[0]
  await select(page, header)
  await stripRow.focus()
  await page.keyboard.press('Enter')
  await expect(stripRow).toHaveClass(/bg-coral-tint/)
  await expect(page.locator(`[data-layer-row="${header}"]`)).not.toHaveClass(/bg-coral-tint/)
  // …and the selected outline is on the strip's own box
  const outlineOffStrip = () =>
    canvasFrame(page).locator('body').evaluate((body) => {
      const doc = body.ownerDocument
      const s = doc.querySelector('[data-ghost-surface="announcement-bar"]')?.getBoundingClientRect()
      const b = [...doc.querySelectorAll('[data-inflozo-chrome]')].map((h) => h.shadowRoot?.querySelector('[data-chrome="selected"]')).find(Boolean)?.getBoundingClientRect()
      return s && b ? Math.abs(b.top - s.top) + Math.abs(b.left - s.left) + Math.abs(b.width - s.width) + Math.abs(b.height - s.height) : null
    })
  await expect.poll(outlineOffStrip, 'the selected outline sits on the strip').toBeLessThanOrEqual(3)
  // Space hides it: the strip gone, #canvas at the very top, the button kept, said — and nothing edited
  const kept = await storedKeys(page)
  await page.keyboard.press(' ')
  await expect.poll(async () => (await shims(page)).stripFirst).toBe(false)
  const hidden = await shims(page)
  expect(hidden.canvasTop, 'no strip, the header at the very top').toBe(0)
  expect(hidden.buttonShown, 'the button is its own row').toBe(true)
  await expect(page.locator('#editor-said')).toHaveText(GS.GHOST_WORDS.hidden('Announcement bar'))
  await expect(stripRow.locator('button').first(), 'a hidden row reads as hidden').toHaveClass(/text-ink-soft/)
  await expect(page.locator('#editor-undo')).toHaveAttribute('aria-disabled', 'true')
  expect(await storedKeys(page), 'hidden is this browser\'s, never the doc\'s').toEqual(kept)
  // a reload keeps it hidden — this browser's list
  await page.reload()
  await expect(canvasFrame(page).locator('#canvas > *').first()).toBeVisible()
  await expect.poll(async () => (await shims(page)).surfaces, 'kept across a reload').toBe(1)
  expect((await shims(page)).stripFirst).toBe(false)
  // Preview is the site as a visitor meets it: the strip is back; leaving Preview hides it again
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('p')
  await expect(page.locator('#editor-preview-bar')).toBeVisible()
  await expect.poll(async () => (await shims(page)).stripFirst, 'Preview shows a hidden shim').toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.locator('#editor-preview-bar')).toHaveCount(0)
  await expect.poll(async () => (await shims(page)).stripFirst).toBe(false)
  // Space shows it again
  await stripRow.focus()
  await page.keyboard.press(' ')
  await expect.poll(async () => (await shims(page)).stripFirst).toBe(true)
  await expect(page.locator('#editor-said')).toHaveText(GS.GHOST_WORDS.shown('Announcement bar'))
  // the pointer over the strip — synthesized as the canvas document's own `pointermove`, as `pointAt` synthesizes a
  // `pointerover` — draws the tag sections get, with the group's words; the row takes the wash
  await canvasFrame(page).locator('body').evaluate((body) => {
    const doc = body.ownerDocument
    const r = doc.querySelector('[data-ghost-surface="announcement-bar"]').getBoundingClientRect()
    doc.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', clientX: r.left + 200, clientY: r.top + r.height / 2 }))
  })
  const tagWords = () =>
    canvasFrame(page).locator('body').evaluate((body) => [...body.ownerDocument.querySelectorAll('[data-inflozo-chrome]')].map((h) => h.shadowRoot?.querySelector('[data-chrome="tag"]')?.textContent).find(Boolean) ?? null)
  await expect.poll(tagWords).toBe(GS.GHOST_WORDS.tag('Announcement bar'))
  // the class itself, never its `hover:` twin every row carries (the review of 5.24e: the bare pattern always passed)
  await expect(stripRow).toHaveClass(/(^|\s)bg-coral-wash(\s|$)/)
  // the Paywall has no rows — no shim draws there
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="home"]')).toBeFocused()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'paywall')
  await expect(page.locator('[data-ghost-rows]')).toHaveCount(0)
})


// ── Story 5.22 — THE COMPACT EDITOR (R-202, D8b), FROM THE KEYBOARD. A 1440 display at 200% zoom is a 720 CSS px window
//    with a fine pointer, and it keeps the editor, rearranged: the icon rail, Controls and Layers as overlays, the bar's
//    right-hand cluster collapsed into one ⋯ — mounted and hidden, so every ⋯ row presses the control's own handler
//    (R-141), in the control's own words (R-170). The touch half, and the phone's notice, are `floor.spec.mjs`'s.

const KEYS = await import(new URL('../../apps/web/lib/keymap.ts', import.meta.url).href)
const FLOOR = await import(new URL('../../apps/web/lib/floor.ts', import.meta.url).href)

/** The compact editor, painted: the canvas has drawn its sections and the rail has its items (Layers is not drawn) */
async function openCompact(page) {
  await page.goto(HARNESS)
  await expect(canvasFrame(page).locator('#canvas > *').first()).toBeVisible()
  await expect(page.locator('[data-rail-row]').first()).toBeVisible()
  await page.locator('body').focus()
}

/** the ringed section, chosen from the RAIL — the last page section, as `selectRinged` finds it in Layers */
async function railRinged(page) {
  const item = page.locator('[data-rail-row]').last()
  await item.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#editor-controls')).toBeVisible()
  await expect(counter(page), 'the harness must carry a section whose category holds a ring').not.toHaveText('1 of 1')
  return item
}

/** the ⋯ menu's rows, as its buttons and links print them — a greyed row (R-192) inside its fieldset included */
const moreRows = (page) => page.locator('#editor-more-menu li :is(button, a)')
/** a keyboard walk to `target`, one Tab at a time, within as many stops as the page has (counted off it) */
async function tabTo(page, target) {
  const budget = (await stopsIn(page, 'body')) + 2
  for (let n = 0; n < budget; n++) {
    if ((await focused(page)) === target) return
    await page.keyboard.press('Tab')
  }
  expect(await focused(page), `Tab never reached ${target}`).toBe(target)
}

test.describe('Story 5.22 — D8b: the compact editor at 720 × 900, a fine pointer', () => {
  test.use({ viewport: { width: 720, height: 900 } })

  test('the width is R-202\'s: the window is compact, the rail stands where Layers did, the cluster is mounted and hidden', async ({ page }) => {
    await openCompact(page)
    expect(await page.evaluate((q) => matchMedia(q).matches, FLOOR.COMPACT), 'a 720 window is below the line').toBe(true)
    expect(await page.evaluate((q) => matchMedia(q).matches, FLOOR.PHONE), 'and a fine pointer is never a phone (R-76)').toBe(false)
    await expect(page.locator('[data-icon-rail]')).toBeVisible()
    await expect(page.locator('#editor-layers')).toBeHidden()
    await expect(page.locator('#editor-controls')).toBeHidden()
    await expect(page.locator('#editor-more')).toBeVisible()
    for (const id of ['#editor-remix', '#editor-mode', '#editor-device', '#editor-theme-settings', '#editor-preview']) {
      await expect(page.locator(id), `${id} is collapsed into ⋯`).toBeHidden()
      await expect(page.locator(id), `${id} stays MOUNTED, so its row presses it`).toHaveCount(1)
    }
    // the rail: Show layers, then one button per section the page paints — each named by its layer name
    const rail = await page.locator('[data-rail-row]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
    const layerNames = await page.locator('[data-layer-row] > button:not([aria-label])').evaluateAll((els) => els.map((e) => e.textContent.trim()))
    expect(rail.length, 'a rail item per section').toBeGreaterThan(0)
    for (const name of rail) expect(layerNames, `${name} is a layer's own name`).toContain(name)
  })

  test('Tab reaches ⋯, and its rows arrow and act — each in its control\'s own words, pressing its control\'s handler', async ({ page }) => {
    await openCompact(page)
    await tabTo(page, 'BUTTON#editor-more[More editor actions]')
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-more-menu')).toBeVisible()
    // R-170: the rows' words ARE the controls' — read off the controls themselves, never written here
    const words = await page.evaluate(() => ({
      remix: document.getElementById('editor-remix').getAttribute('aria-label').replace(' — ', ''),
      mode: document.getElementById('editor-mode').getAttribute('aria-label'),
      device: document.querySelector('#editor-device [aria-checked="true"]').getAttribute('aria-label'),
      theme: document.getElementById('editor-theme-settings').textContent.trim(),
      preview: document.getElementById('editor-preview').textContent.trim(),
    }))
    const chip = (gesture) => KEYS.KEYMAP.find((b) => b.gesture === gesture).chips.join('')
    await expect(moreRows(page)).toHaveText([
      words.remix,
      `${words.mode}${chip('dark')}`,
      `Device — ${words.device}`,
      // Story 6.3 — the list's own name (R-170), before Theme settings (DW-322)
      PACK.PACK_WORDS.name,
      words.theme,
      words.preview,
    ])
    // the Theme settings row goes where the bar's own link goes, not only reads as it does (review, 2026-09-27)
    expect(await moreRows(page).nth(4).evaluate((a) => a.tagName)).toBe('A')
    await expect(moreRows(page).nth(4)).toHaveAttribute('href', await page.locator('#editor-theme-settings').getAttribute('href'))
    // opened ON its first row, and the arrows walk the rows
    await expect(moreRows(page).first()).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expect(moreRows(page).nth(2)).toBeFocused()
    // the Device row is `pickDevice` to the NEXT device: the track moves, the live region says so, and focus is back on ⋯
    const track = await page.locator('#editor-device [role="radio"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-more-menu')).toBeHidden()
    expect(await deviceOf(page)).toBe(track[1])
    expect(await said(page)).toContain(track[1])
    await expect(page.locator('#editor-more')).toBeFocused()
    await page.keyboard.press('Enter')
    // `openMenu` steps into the menu on the NEXT frame, so a key before that would land on ⋯ itself
    await expect(moreRows(page).first()).toBeFocused()
    await expect(moreRows(page).nth(2), 'one row, reading the device now showing').toHaveText(`Device — ${track[1]}`)
    // the dark row is the sun's `flip`: the canvas's one mode signal moves, and the row now reads the way back
    await page.keyboard.press('ArrowDown')
    await expect(moreRows(page).nth(1)).toBeFocused()
    await page.keyboard.press('Enter')
    expect(await modeOf(page)).toBe('dark')
    await page.keyboard.press('Enter')
    await expect(moreRows(page).first()).toBeFocused()
    await expect(moreRows(page).nth(1)).toHaveText(`${await page.locator('#editor-mode').getAttribute('aria-label')}${chip('dark')}`)
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor-more')).toBeFocused()
    // the Preview row is B3a's pill: Preview comes, and Esc brings focus back to ⋯
    await page.keyboard.press('Enter')
    await expect(moreRows(page).first()).toBeFocused()
    await page.keyboard.press('End')
    await expect(moreRows(page).last()).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-preview-bar')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor-preview-bar')).toHaveCount(0)
    await expect(page.locator('#editor-more')).toBeFocused()
  })

  test('Remix from ⋯: the confirm is VISIBLE though the dice is collapsed, the re-roll lands at once, and one ⌘Z takes it back', async ({ page }) => {
    await openCompact(page)
    await railRinged(page)
    const was = await designName(page).innerText()
    await page.locator('#editor-more').focus()
    await page.keyboard.press('Enter')
    await expect(moreRows(page).first()).toBeFocused()
    // ONE OVERLAY AT A TIME (D8:283): the bar menu opening closed the Controls overlay the rail had opened
    await expect(page.locator('#editor-controls')).toBeHidden()
    await expect(page.locator('[data-scrim]')).toHaveCount(0)
    await page.keyboard.press('Enter')
    // executed at planning: a `<dialog>` under a `display: none` ancestor opens invisible and still modal — so it is
    // portalled to the editor's root, and here it is drawn
    await expect(remixDialog(page)).toBeVisible()
    expect(await remixDialog(page).evaluate((d) => d.getBoundingClientRect().width), 'drawn, not a 0 × 0 modal').toBeGreaterThan(100)
    await expect(page.locator('dialog[open] [data-cancel]')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-remix-go]')).toBeFocused()
    await page.keyboard.press('Enter')
    // a hidden die fires no `transitionend`: nothing rolls, and the re-roll lands at once
    await expect(designName(page)).not.toHaveText(was)
    expect(await said(page)).toMatch(/^Remixed [1-9]\d* sections? on Home\.$/)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('ControlOrMeta+z')
    await expect(designName(page), 'one transaction, one undo').toHaveText(was)
  })

  test('6.3 · ⋯ → Style Pack opens the Controls overlay on the list, a cell switches the canvas, and Esc closes it (DW-322)', async ({ page }) => {
    await openCompact(page)
    const target = PRESETS()[2]
    await tabTo(page, 'BUTTON#editor-more[More editor actions]')
    await page.keyboard.press('Enter')
    await expect(moreRows(page).first()).toBeFocused()
    const row = moreRows(page).filter({ hasText: new RegExp(`^${PACK.PACK_WORDS.name}$`) })
    await expect(row).toHaveCount(1)
    while (!(await row.evaluate((el) => el === document.activeElement))) await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    // the overlay, on the list: its head says the one name, and focus is on its way back
    await expect(page.locator('#editor-controls')).toBeVisible()
    await expect(page.locator('#editor-controls')).toHaveAttribute('aria-label', PACK.PACK_WORDS.name)
    await expect(page.locator('#style-pack-back')).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(option(page, PRESETS()[0].id)).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-pack', target.id)
    await expect(page.locator('#editor-said')).toHaveText(PACK.PACK_WORDS.said(target.name))
    // Esc closes the overlay and gives focus back to ⋯, which opened it
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor-controls')).toBeHidden()
    await expect(page.locator('#editor-more')).toBeFocused()
  })

  test('6.4 · ⋯ → Style Pack shows the rows under the list, and a pencil opens Edit pack over the editor, inside the window', async ({ page }) => {
    await openCompact(page)
    await tabTo(page, 'BUTTON#editor-more[More editor actions]')
    await page.keyboard.press('Enter')
    const row = moreRows(page).filter({ hasText: new RegExp(`^${PACK.PACK_WORDS.name}$`) })
    while (!(await row.evaluate((el) => el === document.activeElement))) await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-controls')).toBeVisible()
    // the rows scroll under the list in the overlay — every one of them
    await expect(page.locator('[data-style-pack-rows] [role="radiogroup"]')).toHaveCount(W.rows.length)
    await expect(page.locator('#style-pack-heading-font')).toBeVisible()
    // Tab: the back button, the list's one stop, then the pack in force's own door
    await tabOnto(page, door(page, 'paper'))
    await page.keyboard.press('Enter')
    await expect(packEditor(page)).toBeVisible()
    await expect(swatchOf(page, 'light', 'background')).toBeFocused()
    // the same dialog at every width: S7c's 576 fits a 720 window whole
    const box = await packEditor(page).boundingBox()
    expect(box.x, 'inside the window').toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(720)
    expect(Math.round(box.width)).toBe(576)
    await page.keyboard.press('Escape')
    await expect(packEditor(page)).toHaveCount(0)
    await expect(door(page, 'paper')).toBeFocused()
  })

  test('a rail item selects its section and Controls opens OVER the page, which does not move; Esc closes it and gives focus back', async ({ page }) => {
    await openCompact(page)
    const chip = await page.locator('#editor-viewport').innerText()
    const stage = await page.locator('section[aria-label="Canvas"]').evaluate((s) => s.getBoundingClientRect().toJSON())
    await tabTo(page, `BUTTON[${await page.locator('[data-rail-row]').nth(1).getAttribute('aria-label')}]`)
    const item = page.locator('[data-rail-row]').nth(1)
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-controls')).toBeVisible()
    await expect(page.locator('#editor-controls')).toHaveAttribute('aria-label', 'Section settings')
    await expect(item).toHaveAttribute('aria-current', 'true')
    await expect(page.locator('[data-scrim]')).toBeVisible()
    // the scrim covers the canvas column and stops AT THE RAIL's edge — "the one thing that survives the overlay is the
    // way back to another section" (D8:298)
    const [scrim, rail] = await Promise.all(['[data-scrim]', '[data-icon-rail]'].map((s) => page.locator(s).boundingBox()))
    expect(Math.round(scrim.x), 'the scrim starts where the rail ends').toBe(Math.round(rail.x + rail.width))
    expect(await page.locator('section[aria-label="Canvas"]').evaluate((s) => s.closest('[inert]') !== null), 'the page behind is inert').toBe(true)
    // the overlay covers the canvas and never resizes it: the fit, and so the chip's words, are what they were (D8:161)
    expect(await page.locator('#editor-viewport').innerText()).toBe(chip)
    expect(await page.locator('section[aria-label="Canvas"]').evaluate((s) => s.getBoundingClientRect().toJSON())).toEqual(stage)
    await expect(item, 'focus stays on the rail, the way back to another section').toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor-controls')).toBeHidden()
    await expect(page.locator('[data-scrim]')).toHaveCount(0)
    await expect(item, 'the selection is kept').toHaveAttribute('aria-current', 'true')
    await expect(item, 'and focus is back on what opened it').toBeFocused()
    // the selected section's own rail item opens it again
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-controls')).toBeVisible()
    // and its own Close does what Esc did: the overlay goes, the selection stays, focus goes back to what opened it
    await page.locator('#editor-controls button[aria-label="Close controls"]').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-controls')).toBeHidden()
    await expect(item, 'the selection is kept').toHaveAttribute('aria-current', 'true')
    await expect(item, 'and focus is back on the rail item that opened it').toBeFocused()
  })

  test('L opens the Layers overlay onto its close button, and a row hands the overlay to Controls', async ({ page }) => {
    await openCompact(page)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('l')
    await expect(page.locator('#editor-layers')).toBeVisible()
    expect(await focused(page)).toBe('BUTTON[Close layers]')
    // L again closes it, and focus goes back to the canvas that opened it
    await page.keyboard.press('l')
    await expect(page.locator('#editor-layers')).toBeHidden()
    expect(await focused(page)).toBe('SECTION[Canvas]')
    // a row's Enter: the section is chosen, Layers goes with its row and Controls comes, on its close button
    await page.keyboard.press('l')
    const key = (await rows(page)).page[0]
    await page.locator(`[data-layer-row="${key}"]`).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-layers')).toBeHidden()
    await expect(page.locator('#editor-controls')).toBeVisible()
    await expect(page.locator('#editor-controls')).toHaveAttribute('aria-label', 'Section settings')
    expect(await focused(page)).toBe('BUTTON[Close controls]')
    // Esc: the sheet's rung first — the section stays chosen — then rung 2 lets it go
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor-controls')).toBeHidden()
    expect(await focused(page), 'back to the canvas, where L was pressed').toBe('SECTION[Canvas]')
    await expect(page.locator('[data-rail-row][aria-current="true"]')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-rail-row][aria-current="true"]')).toHaveCount(0)
  })

  test('D8c: the skip link lands in Controls — the overlay opens on its close button', async ({ page }) => {
    await openCompact(page)
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-skip-canvas]')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-controls')).toBeVisible()
    expect(await focused(page)).toBe('BUTTON[Close controls]')
  })

  test('crossing 1280 is live: the overlay closes, both panels dock, and the selection, the journal and the canvas survive', async ({ page }) => {
    await openCompact(page)
    // an EDIT first, so there is a journal to keep: the ringed section's `]` — one design swap, one ⌘Z (R-145)
    await railRinged(page)
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor-controls')).toBeHidden()
    const was = await designName(page).textContent()
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(']')
    await expect(designName(page)).not.toHaveText(was)
    const swapped = await designName(page).textContent()
    // the overlay open as the line is crossed, as the matrix's row has it
    await page.locator('[data-rail-row][aria-current="true"]').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-controls')).toBeVisible()
    // `textContent`, never `innerText`: the panel prints the name uppercase in CSS, and `toHaveText` reads the words
    const chosenName = await page.locator('#editor-panel-name').textContent()
    // the canvas's own scroll, and a mark on its document that a reload would wipe. The scroll is read once it has
    // SETTLED, never straight after `scrollTo`: the page moves a few pixels on its own a frame later (executed: 240 read at
    // once, then 238–261 with no crossing at all — CI's red on db6965a9), and that is the page, not the line being crossed
    await canvasFrame(page).locator('body').evaluate((b) => {
      b.dataset.kept = 'yes'
      b.ownerDocument.defaultView.scrollTo(0, 240)
    })
    const scrollOf = () => canvasFrame(page).locator('body').evaluate((b) => b.ownerDocument.defaultView.scrollY)
    await expect
      .poll(async () => {
        const was = await scrollOf()
        await page.waitForTimeout(200)
        return was > 0 && (await scrollOf()) === was
      }, { message: 'the page is long enough to scroll, and its scroll settles' })
      .toBe(true)
    const scrolled = await scrollOf()
    await page.setViewportSize({ width: 1280, height: 900 })
    await expect(page.locator('#editor-more')).toBeHidden()
    await expect(page.locator('[data-icon-rail]')).toHaveCount(0)
    await expect(page.locator('#editor-layers')).toBeVisible()
    await expect(page.locator('#editor-controls')).toBeVisible()
    await expect(page.locator('[data-scrim]')).toHaveCount(0)
    await expect(page.locator('#editor-panel-name'), 'the selection survived the change of layout').toHaveText(chosenName)
    expect(await canvasFrame(page).locator('body').evaluate((b) => b.dataset.kept), 'the canvas document was never reloaded').toBe('yes')
    expect(await canvasFrame(page).locator('body').evaluate((b) => b.ownerDocument.defaultView.scrollY), 'and it kept its scroll').toBe(scrolled)
    // THE JOURNAL CROSSED THE LINE TOO: the swap made below 1280 is still the design, and one ⌘Z at 1280 takes it back
    await expect(designName(page)).toHaveText(swapped)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('ControlOrMeta+z')
    await expect(designName(page), 'the edit made in the compact layout is undone in the full one').toHaveText(was)
    await page.setViewportSize({ width: 720, height: 900 })
    await expect(page.locator('#editor-controls'), 'and back below the line, no overlay is left open').toBeHidden()
  })

  test('UX-DR3 on a Light-only project: the bar has no sun, so ⋯ has no dark row', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-inflozo-harness-dark': 'off' })
    await openCompact(page)
    await expect(page.locator('#editor-mode')).toHaveCount(0)
    await page.locator('#editor-more').focus()
    await page.keyboard.press('Enter')
    await expect(moreRows(page).first()).toBeFocused()
    const rowWords = await moreRows(page).allInnerTexts()
    expect(rowWords.some((w) => /dark mode|light mode/i.test(w)), JSON.stringify(rowWords)).toBe(false)
    expect(rowWords.length, 'and the others are all there').toBeGreaterThan(2)
  })

  test('the Paywall\'s ⋯: no Site Remix and no Preview — a template surface has neither — and Back to post, a link', async ({ page }) => {
    await page.goto(`${HARNESS}/paywall`)
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'paywall')
    await page.locator('#editor-more').focus()
    await page.keyboard.press('Enter')
    await expect(moreRows(page).first()).toBeFocused()
    const words = await moreRows(page).allInnerTexts()
    expect(words.some((w) => /Remix|^Preview\s*P?$/.test(w.trim())), JSON.stringify(words)).toBe(false)
    const back = moreRows(page).last()
    await expect(back).toHaveText(P.back)
    expect(await back.evaluate((a) => a.tagName)).toBe('A')
    await expect(back).toHaveAttribute('href', /\/post$/)
    // and it navigates, as the bar's own does
    await page.keyboard.press('End')
    await expect(back).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  })

  test('a 60-character name truncates with an ellipsis before the centred group, which stays centred', async ({ page }) => {
    await openCompact(page)
    const m = await page.evaluate(() => {
      const name = document.querySelector('header span.truncate')
      name.firstChild.nodeValue = 'A sixty character project name that runs on and on past it!!'
      const header = document.querySelector('header').getBoundingClientRect()
      const group = document.getElementById('editor-centre').getBoundingClientRect()
      const left = document.getElementById('editor-history').getBoundingClientRect()
      return { clipped: name.scrollWidth > name.clientWidth, ellipsis: getComputedStyle(name).textOverflow, room: group.left - left.right, off: (group.left + group.right) / 2 - (header.left + header.right) / 2 }
    })
    expect(m.clipped && m.ellipsis === 'ellipsis', JSON.stringify(m)).toBe(true)
    expect(m.room, 'the left column ends before the group').toBeGreaterThan(0)
    expect(Math.abs(m.off), 'and the group is still centred on the bar').toBeLessThan(2)
  })

  test('R-203: the Section Picker at 720 is ONE column, and the arrows walk it — the next card is both below and next', async ({ page }) => {
    await openCompact(page)
    const before = (await rows(page)).all.length
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('ControlOrMeta+k')
    await expect(picker(page)).toBeVisible()
    expect(await picker(page).locator('[data-picker-grid]').evaluate((g) => getComputedStyle(g).gridTemplateColumns.split(' ').length), 'one column where two would cut the names').toBe(1)
    // the site-wide card is not walked from, for the reason the full-width journey gives (R-152)
    const cells = picker(page).locator('[data-cell]:not([aria-label*="Site-wide"])')
    expect(await cells.count(), 'at least two page cards to walk between').toBeGreaterThan(1)
    await cells.first().focus()
    const first = await page.evaluate(() => document.activeElement?.dataset.design)
    await page.keyboard.press('ArrowDown')
    const below = await page.evaluate(() => document.activeElement?.dataset.design)
    expect(below, 'ArrowDown moves to the card below').not.toBe(first)
    await page.keyboard.press('ArrowUp')
    expect(await page.evaluate(() => document.activeElement?.dataset.design)).toBe(first)
    await page.keyboard.press('ArrowRight')
    expect(await page.evaluate(() => document.activeElement?.dataset.design), 'in one column the next card is also the one below').toBe(below)
    // Enter places, and one ⌘Z takes it back, as at full width
    await page.keyboard.press('Enter')
    await expect(picker(page)).toHaveCount(0)
    // R-210: Layers follows the canvas a frame later — each check waits for it, and checks nothing different
    await expect.poll(async () => (await rows(page)).all).toHaveLength(before + 1)
    await page.keyboard.press('ControlOrMeta+z')
    await expect.poll(async () => (await rows(page)).all).toHaveLength(before)
  })

  test('R-192 reading along: the Remix row and the rail\'s + are greyed and skipped, while the rail, the overlays and the views stay live', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-inflozo-harness-lock': 'reader' })
    await openCompact(page)
    await expect(page.locator('[data-rail-add]')).toBeDisabled()
    await page.locator('#editor-more').focus()
    await page.keyboard.press('Enter')
    await expect(moreRows(page).first(), 'Site Remix edits, so it greys').toBeDisabled()
    await expect(moreRows(page).nth(1), 'the menu opens on the first row that can act').toBeFocused()
    await page.keyboard.press('ArrowUp')
    await expect(moreRows(page).last(), 'and the arrows never land on the greyed one').toBeFocused()
    // every OTHER row changes the view, never the doc, so each stays live — and each still acts (R-192's live list)
    const count = await moreRows(page).count()
    for (let n = 1; n < count; n++) await expect(moreRows(page).nth(n), `row ${n + 1} is a view, so it stays live`).toBeEnabled()
    const track = await page.locator('#editor-device [role="radio"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
    await page.locator('#editor-more-menu li button', { hasText: 'Device — ' }).focus()
    await page.keyboard.press('Enter')
    expect(await deviceOf(page), 'the device row moves the device while reading along').toBe(track[1])
    await page.keyboard.press('Enter')
    await expect(moreRows(page).nth(1)).toBeFocused()
    await page.keyboard.press('Enter')
    expect(await modeOf(page), 'and the dark row flips the mode').toBe('dark')
    await page.keyboard.press('Enter')
    // `openMenu` steps into the menu on the NEXT frame: a key pressed before that would land on ⋯ itself
    await expect(moreRows(page).nth(1)).toBeFocused()
    await page.keyboard.press('End')
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-preview-bar'), 'and the Preview row previews').toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor-preview-bar')).toHaveCount(0)
    await page.locator('[data-rail-row]').first().focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-controls'), 'picking a section is a look, never an edit').toBeVisible()
    // …and the other overlay: L opens Layers while reading along, as "Show layers" does
    await page.keyboard.press('Escape')
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('l')
    await expect(page.locator('#editor-layers'), 'L opens the Layers overlay while reading along').toBeVisible()
  })
})

test('Story 5.22 — a confirm open in a panel as the window crosses 1280 closes with it, never left modal and unseen', async ({ page }) => {
  // the gate's own 1280: the full editor, with the Controls panel docked
  await open(page)
  const { page: own } = await rows(page)
  await select(page, own[0])
  // DW-167's reset confirm lives INSIDE the panel, so it needs a change to ask about (that test's own route to it)
  await openEveryGroup(page)
  const pill = page.locator('#editor-controls [role="radio"][tabindex="0"]').first()
  await pill.focus()
  await page.keyboard.press('ArrowRight')
  const reset = page.locator('#editor-controls button', { hasText: 'Reset this design' })
  await reset.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('dialog[open]')).toBeVisible()
  // below the line the panel is an overlay that is not open, so its aside is `hidden`: a modal left open under it is
  // 0 × 0 and blocks every press (executed) — so it closes, as the Cancel it would have been
  await page.setViewportSize({ width: 720, height: 900 })
  await expect(page.locator('#editor-more')).toBeVisible()
  await expect(page.locator('dialog[open]'), 'no confirm is left open where nothing draws it').toHaveCount(0)
  // and the editor answers: ⋯ opens onto its first row
  await page.locator('#editor-more').focus()
  await page.keyboard.press('Enter')
  await expect(moreRows(page).first()).toBeFocused()
})

/* ── Story 5.23a — THE CANVAS REDRAWS ONLY WHAT CHANGED (R-206, R-208, DW-215) ────────────────────────────────────────
   On the harness's LONG Home — asked for by header, so every stop above keeps the default fixture — each section root is
   tagged with an expando before a gesture: a node the paint kept still carries its tag, a node it made carries none. So
   "that section's nodes are new and every other root is the same node in the same place" is read off the canvas itself.
   After the matrix's gestures, a full repaint (`P` `P`) must draw exactly what the keyed paints left, node for node; and
   DW-215's Remix over several sections is undone by ONE ⌘Z. The mechanism's gate, on every commit — the frame times are
   NFR-1's manual trace (`tools/perf/fps-trace.mjs`), never CI's. */

/** FR-D14's long page and NFR-1's (`prd.md` §5 FR-D14, §6 NFR-1): the section count both are measured on. */
const LONG_HOME = 40

/** Every section root tagged with its place — an expando on the node itself, which only a node a paint KEPT carries on. */
const tagRoots = (page) =>
  canvasFrame(page).locator('#canvas').evaluate((c) => {
    for (const [n, el] of [...c.children].entries()) el.__keyed = n
    return c.children.length
  })
/** Each root's tag in canvas order: the place it was tagged at, or null for a node a paint made since. */
const tagsOf = (page) => canvasFrame(page).locator('#canvas').evaluate((c) => [...c.children].map((el) => el.__keyed ?? null))
/** The selected section's place among the roots. */
const selectedPlace = (page) => canvasFrame(page).locator('#canvas').evaluate((c) => [...c.children].findIndex((el) => el.hasAttribute('data-inflozo-selected')))
/** 0 … n-1: every root still where it was tagged. */
const kept = (n) => [...Array(n).keys()]
/** …with the root at `at` and the one after it changing places. */
const swapped = (n, at) => kept(n).toSpliced(at, 2, at + 1, at)
/** Every root a node the last paint made — a whole-page repaint. */
const allNew = (tags) => tags.length > 0 && tags.every((t) => t === null)

/** The first setting in the selected section's Style group that is its group's tab stop — pinned by the label its group
 *  is named by (the radios carry no name but their words) — with the place of its checked radio. Opens Style first. */
async function styleSetting(page) {
  const style = page.locator('#editor-controls button[id$="-group-style"]')
  if ((await style.getAttribute('aria-expanded')) !== 'true') {
    await style.focus()
    await page.keyboard.press('Enter')
    await expect(style).toHaveAttribute('aria-expanded', 'true')
  }
  const label = await page.evaluate(() =>
    document.querySelector('#editor-controls [id$="-group-style-body"] [role="radio"][tabindex="0"]')?.closest('[role="radiogroup"]')?.getAttribute('aria-labelledby') ?? null)
  expect(label, "the section's Style group holds a setting to change").not.toBeNull()
  const group = `#editor-controls [role="radiogroup"][aria-labelledby="${label}"]`
  return {
    stop: page.locator(`${group} [role="radio"][tabindex="0"]`),
    checked: () => page.locator(`${group} [role="radio"]`).evaluateAll((radios) => radios.findIndex((r) => r.getAttribute('aria-checked') === 'true')),
  }
}

/** Each design whose markup OPENS WITH A COMMENT, by its root's first class, with the comment's words — read off the
 *  library and its fixtures, so nothing here names a design. Since Story 5.24c (DW-159) the set is the CONTROL: these are
 *  the sections whose drawing exercised the drop. */
const folded = (words) => words.replace(/\s+/g, ' ').trim()
const OPENING_COMMENTS = (() => {
  const lib = new URL('../../packages/library/', import.meta.url)
  return Object.fromEntries(['designs', 'fixtures/controls'].flatMap((dir) =>
    readdirSync(new URL(dir, lib), { recursive: true })
      .filter((file) => String(file).endsWith('index.html'))
      .flatMap((file) => {
        const opening = readFileSync(new URL(`${dir}/${file}`, lib), 'utf8').match(/^\s*<!--([\s\S]*?)-->\s*<[a-z]+[^>]*\bclass="([^"\s]+)/)
        return opening === null ? [] : [[opening[2], folded(opening[1])]]
      })))
})()
/** A part OWNS every top-level node it parses to (Story 5.23a) — and since Story 5.24c (DW-159) a design's comment is
 *  drawn by NEITHER emitter, so the one top-level node a part parses to is its root. The pin that read each root's
 *  opening comment back (5.23a) lost its observable there; what it holds now is DW-159 on the live canvas: no comment
 *  node anywhere under #canvas, with the control that sections whose FILE opens with a comment were drawn. */
const commentsKept = (page) =>
  canvasFrame(page).locator('#canvas').evaluate((c, openings) => {
    let drawn = 0
    for (const el of c.children) if (openings[el.classList[0]] !== undefined) drawn++
    const lost = []
    const walker = c.ownerDocument.createTreeWalker(c, 128 /* NodeFilter.SHOW_COMMENT */)
    while (walker.nextNode() !== null) lost.push(walker.currentNode.data.replace(/\s+/g, ' ').trim().slice(0, 40))
    return { drawn, lost }
  }, OPENING_COMMENTS)

/** A LINKED SITE THAT ANSWERS (Story 5.23a). The harness's linked site (`SURFACES_SITE`) answers nothing, so no read ever
 *  lands in the harness. Here every Content API read is answered from the bundled sample, whose rows are the Content
 *  API's own shape (`live-content.test.ts` holds the whitelist to them): filtered by slug, tag, writer or id, ordered by
 *  date and paged, as Ghost does. `revise()` retitles the newest post from then on, so a read that lands afterwards
 *  carries words no drawing made before it holds; `finished()` counts the answers the page has received. `capped`: the
 *  site holds more posts than the newest `LIST_LIMIT` the posts list reads, so DW-248's search at Ghost is live — and it
 *  answers one post no list holds, titled `found(term)`. */
const SAMPLE = JSON.parse(readFileSync(new URL('../../packages/library/orbit-weekly/dataset.json', import.meta.url), 'utf8'))
const LIVE = await import(new URL('../../apps/web/lib/live-content.ts', import.meta.url).href)
async function answeringSite(page, { capped = false } = {}) {
  const newest = SAMPLE.posts.toSorted((a, b) => b.published_at.localeCompare(a.published_at))[0]
  const revised = `${newest.title} (revised)`
  let posts = SAMPLE.posts
  let finished = 0
  const found = (term) => `${term} — found at Ghost`
  page.on('requestfinished', (r) => {
    if (r.url().includes('/ghost/api/content/') && r.method() === 'GET') finished++
  })
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }
  await page.route('**/ghost/api/content/**', (route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    const url = new URL(route.request().url())
    const resource = url.pathname.split('/').filter(Boolean).at(-1)
    const q = Object.fromEntries(url.searchParams)
    if (resource === 'settings') return route.fulfill({ json: { settings: SAMPLE.site }, headers: cors })
    const all = { posts, pages: [SAMPLE.subjects.page], tags: SAMPLE.tags, authors: SAMPLE.authors, tiers: SAMPLE.tiers }[resource] ?? []
    const [, field, value = ''] = /^(\w+):(.*)$/.exec(q.filter ?? '') ?? []
    // DW-248's search at Ghost (`title:~'term'`): ONE post the newest `LIST_LIMIT` in hand do not hold, titled by its term
    if (resource === 'posts' && field === 'title') {
      const post = { ...newest, id: 'found-at-ghost', slug: 'found-at-ghost', title: found(value.replace(/^~'|'$/g, '')) }
      return route.fulfill({ json: { posts: [post], meta: { pagination: { page: 1, limit: Number(q.limit ?? 15), pages: 1, total: 1 } } }, headers: cors })
    }
    const among = value.replace(/^\[|\]$/g, '').split(',').map((v) => v.replace(/^'|'$/g, ''))
    const rows = all.filter((r) =>
      field === 'slug' ? among.includes(r.slug)
      : field === 'id' ? among.includes(r.id)
      : field === 'tags' ? (r.tags ?? []).some((t) => among.includes(t.slug))
      : field === 'authors' ? (r.authors ?? []).some((a) => among.includes(a.slug))
      : field === 'visibility' ? r.visibility === value
      : true)
    const dated = rows.every((r) => typeof r.published_at === 'string')
    // `include=count.posts` on a tag or a writer: each row's post count, as Ghost adds it
    const counted = (q.include ?? '').split(',').includes('count.posts') && (resource === 'tags' || resource === 'authors')
      ? rows.map((r) => ({ ...r, count: { posts: posts.filter((p) => (p[resource] ?? []).some((t) => t.slug === r.slug)).length } }))
      : rows
    const ordered = dated ? counted.toSorted((a, b) => (q.order?.endsWith('asc') ? 1 : -1) * a.published_at.localeCompare(b.published_at)) : counted
    const limit = q.limit === 'all' ? Math.max(1, ordered.length) : Number(q.limit ?? 15)
    const at = Number(q.page ?? 1)
    const asked = Object.fromEntries(Object.entries(q).filter(([k]) => k !== 'key'))
    const total = ordered.length + (capped && LIVE.keyOf({ resource, params: asked }) === LIVE.keyOf(LIVE.LISTS.post) ? 500 : 0)
    const pagination = { page: at, limit, pages: Math.max(1, Math.ceil(total / limit)), total }
    return route.fulfill({ json: { [resource]: ordered.slice((at - 1) * limit, at * limit), meta: { pagination } }, headers: cors })
  })
  return {
    newest: newest.title,
    revised,
    revise: () => {
      posts = SAMPLE.posts.map((p) => (p.id === newest.id ? { ...p, title: revised } : p))
    },
    finished: () => finished,
    found,
  }
}

/** The canvas as it stands, cloned into the canvas window to compare against later. */
const snapshot = (page) => canvasFrame(page).locator('#canvas').evaluate((c) => { c.ownerDocument.defaultView.__snapshot = c.cloneNode(true) })
/** null while `#canvas` equals the snapshot node for node (`isEqualNode`); otherwise the FIRST differing child, named. */
const differs = (page) =>
  canvasFrame(page).locator('#canvas').evaluate((c) => {
    const was = c.ownerDocument.defaultView.__snapshot
    if (c.isEqualNode(was)) return null
    const n = [...Array(Math.max(c.childNodes.length, was.childNodes.length)).keys()].find((i) => !c.childNodes[i]?.isEqualNode(was.childNodes[i] ?? null))
    const say = (node) => (node === undefined ? 'nothing' : node.nodeType === 1 ? node.outerHTML.slice(0, 240) : `${node.nodeName} ${JSON.stringify((node.textContent ?? '').slice(0, 120))}`)
    return `child ${n} of ${c.childNodes.length} (was ${was.childNodes.length}) — now ${say(c.childNodes[n])} — was ${say(was.childNodes[n])}`
  })

test.describe('Story 5.23a — the canvas redraws only what changed, on the long Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-inflozo-harness-home': String(LONG_HOME) })
  })

  test('a design change replaces one section, a move moves one, and hide, show, duplicate, delete, place, undo and redo touch only theirs; a control stamped in place and a flip are drawn fresh; then a full repaint equals it all node for node', async ({ page }) => {
    await open(page)
    const own = async () => (await rows(page)).page
    expect(await own(), 'the harness built the long Home').toHaveLength(LONG_HOME)
    const canvasStop = page.locator('section[aria-label="Canvas"]')
    const count = async (n) => expect.poll(async () => (await tagsOf(page)).length).toBe(n)

    // ── A DESIGN CHANGE — `]`, `[`, the panel's ◀ ▶ and a thumbnail: that section's nodes new, every other root in place
    await selectRinged(page)
    const ringed = await selectedPlace(page)
    let n = await tagRoots(page)
    await canvasStop.focus()
    await page.keyboard.press(']')
    await expect(counter(page)).toHaveText(/^2 of \d+$/)
    expect(await tagsOf(page), '`]`: that section alone is new').toEqual(kept(n).toSpliced(ringed, 1, null))
    await tagRoots(page)
    await page.keyboard.press('[')
    await expect(counter(page)).toHaveText(/^1 of \d+$/)
    expect(await tagsOf(page), '`[`: that section alone is new').toEqual(kept(n).toSpliced(ringed, 1, null))
    await tagRoots(page)
    await page.locator('[data-design-step="1"]').focus()
    await page.keyboard.press('Enter')
    await expect(counter(page)).toHaveText(/^2 of \d+$/)
    expect(await tagsOf(page), "the panel's ▶: that section alone is new").toEqual(kept(n).toSpliced(ringed, 1, null))
    await tagRoots(page)
    await page.locator('[data-design-step="-1"]').focus()
    await page.keyboard.press('Enter')
    await expect(counter(page)).toHaveText(/^1 of \d+$/)
    expect(await tagsOf(page), "the panel's ◀: that section alone is new").toEqual(kept(n).toSpliced(ringed, 1, null))
    await tagRoots(page)
    await page.locator('[data-design-strip] [role="option"][tabindex="0"]').focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await expect(counter(page)).toHaveText(/^2 of \d+$/)
    expect(await tagsOf(page), 'a thumbnail: that section alone is new').toEqual(kept(n).toSpliced(ringed, 1, null))

    // ── A MOVE — ⌥↓ and ⌥↑ on a Layers row: nothing rendered, every root the same node, the moved one a place on — and a
    //    section whose FILE opens with a comment (the controls fixtures do) is drawn without it (DW-159)
    const [, second, third, fourth, , sixth] = await own()
    await select(page, fourth)
    const from = await selectedPlace(page)
    n = await tagRoots(page)
    await page.locator(`[data-layer-row="${fourth}"]`).focus()
    await page.keyboard.press('Alt+ArrowDown')
    await expect.poll(async () => (await own()).indexOf(fourth)).toBe(4)
    expect(await tagsOf(page), '⌥↓: every root the same node, the moved one a place on').toEqual(swapped(n, from))
    const carried = await commentsKept(page)
    const movedClass = await canvasFrame(page).locator('#canvas').evaluate((c, at) => c.children[at].classList[0], from + 1)
    expect(Object.keys(OPENING_COMMENTS), 'the control: the section moved opens with a comment').toContain(movedClass)
    expect(carried.lost, 'DW-159: a design\'s comment is drawn by neither emitter — none on the canvas after a move').toEqual([])
    await page.keyboard.press('Alt+ArrowUp')
    await expect.poll(async () => (await own()).indexOf(fourth)).toBe(3)
    expect(await tagsOf(page), '⌥↑: every root the same node, back in its place').toEqual(kept(n))

    // ── HIDE AND SHOW — Space on a row: its nodes go, then come back new; ⌘Z and ⇧⌘Z touch that section alone
    await select(page, second)
    const at = await selectedPlace(page)
    n = await tagRoots(page)
    await page.locator(`[data-layer-row="${second}"]`).focus()
    await page.keyboard.press(' ')
    await count(n - 1)
    expect(await tagsOf(page), 'hidden: its root goes and no other').toEqual(kept(n).toSpliced(at, 1))
    await page.keyboard.press(' ')
    await count(n)
    expect(await tagsOf(page), 'shown: its root comes back new and no other').toEqual(kept(n).toSpliced(at, 1, null))
    await tagRoots(page)
    await page.keyboard.press('ControlOrMeta+z')
    await count(n - 1)
    expect(await tagsOf(page), '⌘Z of the show: its root goes and no other').toEqual(kept(n).toSpliced(at, 1))
    await page.keyboard.press('ControlOrMeta+Shift+z')
    await count(n)
    expect(await tagsOf(page), '⇧⌘Z: its root comes back new and no other').toEqual(kept(n).toSpliced(at, 1, null))

    // ── DUPLICATE — ⌘D: one new root directly after the selection; ⌘Z takes it away again
    await select(page, second)
    n = await tagRoots(page)
    await page.keyboard.press('ControlOrMeta+d')
    await count(n + 1)
    expect(await tagsOf(page), '⌘D: one new root after it, no other replaced').toEqual(kept(n).toSpliced(at + 1, 0, null))
    await page.keyboard.press('ControlOrMeta+z')
    await count(n)
    expect(await tagsOf(page), '⌘Z of the duplicate: the copy goes and no other').toEqual(kept(n))

    // ── DELETE — Del: the selection's nodes go; ⌘Z brings them back new, ⇧⌘Z takes them again, ⌘Z once more
    await select(page, second)
    await page.keyboard.press('Delete')
    await count(n - 1)
    expect(await tagsOf(page), 'Del: its root goes and no other').toEqual(kept(n).toSpliced(at, 1))
    await page.keyboard.press('ControlOrMeta+z')
    await count(n)
    expect(await tagsOf(page), '⌘Z of the delete: its root back new, no other').toEqual(kept(n).toSpliced(at, 1, null))
    await page.keyboard.press('ControlOrMeta+Shift+z')
    await count(n - 1)
    expect(await tagsOf(page), '⇧⌘Z of the delete: its root goes again').toEqual(kept(n).toSpliced(at, 1))
    await page.keyboard.press('ControlOrMeta+z')
    await count(n)

    // ── PLACE — ⌘K and Enter: the placed section's nodes come, directly after the selection; ⌘Z takes them away
    await select(page, third)
    const after = await selectedPlace(page)
    n = await tagRoots(page)
    await canvasStop.focus()
    await page.keyboard.press('ControlOrMeta+k')
    await expect(picker(page)).toBeVisible()
    await picker(page).locator('[data-cell]:not([aria-label*="Site-wide"])').first().focus()
    await page.keyboard.press('Enter')
    await expect(picker(page)).toHaveCount(0)
    await count(n + 1)
    expect(await tagsOf(page), 'placed: one new root after the selection, no other replaced').toEqual(kept(n).toSpliced(after + 1, 0, null))
    await page.keyboard.press('ControlOrMeta+z')
    await count(n)
    expect(await tagsOf(page), '⌘Z of the placement: it goes and no other').toEqual(kept(n))

    // ── A CONTROL STAMPED IN PLACE keeps its node — and the NEXT paint draws that section fresh, while another section's
    //    ⌥↓ moves only that one
    await select(page, fourth)
    const stamped = await selectedPlace(page)
    n = await tagRoots(page)
    let setting = await styleSetting(page)
    let was = await setting.checked()
    await setting.stop.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(setting.checked, 'the arrow moved the setting').not.toBe(was)
    expect(await tagsOf(page), 'a control is stamped in place: every root the same node (the fast path)').toEqual(kept(n))
    await select(page, sixth)
    const mover = await selectedPlace(page)
    expect(mover, 'the control: the section moved is not the one stamped, nor next to it').toBeGreaterThan(stamped + 1)
    await page.locator(`[data-layer-row="${sixth}"]`).focus()
    await page.keyboard.press('Alt+ArrowDown')
    await expect.poll(async () => (await own()).indexOf(sixth)).toBe(6)
    expect(await tagsOf(page), 'the next paint: the stamped section fresh, the moved one a place on, every other the same node').toEqual(swapped(n, mover).toSpliced(stamped, 1, null))
    // …and an UNDO BACK TO THE DRAWN VALUE: the stored section equals its drawing again, but the root was stamped since —
    // only its dropped record keeps the stamp off the page
    await select(page, fourth)
    n = await tagRoots(page)
    setting = await styleSetting(page)
    was = await setting.checked()
    await setting.stop.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(setting.checked, 'the arrow moved the setting').not.toBe(was)
    expect(await tagsOf(page), 'stamped in place again: every root the same node').toEqual(kept(n))
    await canvasStop.focus()
    await page.keyboard.press('ControlOrMeta+z')
    await expect.poll(setting.checked, 'the undo put the setting back').toBe(was)
    expect(await tagsOf(page), '⌘Z of a stamped control: that section drawn fresh, every other root the same node').toEqual(kept(n).toSpliced(stamped, 1, null))

    // ── A FLIP AND A FLIP BACK, then an edit: the render context is as drawn, yet every section is drawn fresh — the
    //    flip re-stamped every root outside the paint, so every record was dropped
    n = await tagRoots(page)
    await canvasStop.focus()
    await page.keyboard.press('.')
    expect(await modeOf(page)).toBe('dark')
    expect(await tagsOf(page), 'a flip is a re-stamp, never a repaint (Story 5.6)').toEqual(kept(n))
    await page.keyboard.press('.')
    expect(await modeOf(page)).toBe('light')
    await page.locator(`[data-layer-row="${sixth}"]`).focus()
    await page.keyboard.press('Alt+ArrowUp')
    await expect.poll(async () => (await own()).indexOf(sixth)).toBe(5)
    expect(allNew(await tagsOf(page)), 'after a flip and back, the next paint draws every section fresh').toBe(true)

    // ── AGREEMENT — a full repaint (Preview in and out) draws exactly what the keyed paints left, node for node
    await expect(canvasFrame(page).locator('[data-inflozo-swapped]'), 'the swap settle is over, so the snapshot is at rest').toHaveCount(0)
    await snapshot(page)
    await tagRoots(page)
    await canvasStop.focus()
    await page.keyboard.press('p')
    await expect(bar(page)).toBeVisible()
    await page.keyboard.press('p')
    await expect(bar(page)).toHaveCount(0)
    expect(allNew(await tagsOf(page)), 'the control: Preview in and out is a whole-page repaint').toBe(true)
    expect(await differs(page), 'the full repaint equals the keyed canvas, node for node').toBeNull()
    // and the one walk both paints take drops every design's comment (DW-159) — which no comparison between the two could see
    const whole = await commentsKept(page)
    expect(whole.drawn, 'the control: the long Home draws sections whose file opens with a comment').toBeGreaterThan(0)
    expect(whole.lost, 'no design\'s comment is on the canvas after the full repaint').toEqual([])
  })

  test('a pointed-at section the paint keeps stays pointed at — its outline and pill with it — and one the paint redraws is let go', async ({ page }) => {
    // the pointer resting on a section (synthesized, as R-175's stop does). A full repaint gave the browser a NEW node under
    // a resting pointer, and its own `pointerover` hovered it again; a KEPT node gets no such word, so the paint keeps the
    // hover itself — or the outline and the pill would vanish under a pointer that never moved (executed at 5.23a's Dev)
    await open(page)
    await selectRinged(page)
    const ringed = await selectedPlace(page)
    expect(ringed, 'a section above the ringed one to point at (`:nth-child` is 1-based, the place 0-based)').toBeGreaterThan(0)
    await pointAt(page, `#canvas > :nth-child(${ringed})`)
    const hoveredAt = () => canvasFrame(page).locator('#canvas').evaluate((c) => [...c.children].findIndex((el) => el.hasAttribute('data-inflozo-hover')))
    await expect.poll(hoveredAt, 'the control: the section above the ringed one is pointed at').toBe(ringed - 1)
    await expect(page.locator('[data-section-pill]')).toHaveCount(1)
    const n = await tagRoots(page)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(']')
    await expect(counter(page)).toHaveText(/^2 of \d+$/)
    expect(await tagsOf(page), '`]` redrew the ringed section alone').toEqual(kept(n).toSpliced(ringed, 1, null))
    expect(await hoveredAt(), 'the pointed section was kept, and so is its hover').toBe(ringed - 1)
    await expect(page.locator('[data-section-pill]'), 'and its pill').toHaveCount(1)
    // …and the section the paint REDRAWS is let go, as every paint has let go a replaced root
    await pointAt(page, `#canvas > :nth-child(${ringed + 1})`)
    await expect.poll(hoveredAt, 'the control: the ringed section itself is pointed at').toBe(ringed)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('[')
    await expect(counter(page)).toHaveText(/^1 of \d+$/)
    expect(await hoveredAt(), 'the pointed section was redrawn: its hover is let go').toBe(-1)
    await expect(page.locator('[data-section-pill]')).toHaveCount(0)
  })

  test('an inline editing session that changes nothing still has its section drawn fresh when it ends — every other root kept', async ({ page }) => {
    // THE SESSION WRITES ITS SECTION'S DOM ITSELF (`lib/inline.ts`), so its drawing is dropped when it starts, and the paint
    // that ends it draws the section fresh — even when the words are as they were, when the record's signature would still
    // match. Pinned here because the production walk was the only place it was read (review, 2026-09-28): without the drop
    // in `startEditing`, every automated gate stayed green. The session starts as the pointer starts it — a primary press on
    // a stamped element, the canvas document's own `pointerdown` and `mousedown` synthesized as R-175's hover is, never a
    // pointer API — and Esc's first rung ends it.
    await open(page)
    await selectRinged(page)
    const ringed = await selectedPlace(page)
    const n = await tagRoots(page)
    const started = await canvasFrame(page).locator('#canvas').evaluate((c, at) => {
      const root = c.children[at]
      for (const el of root.querySelectorAll('h1, h2, h3, h4, p, a, span, li')) {
        el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }))
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
        // …and the press is released, or the editor holds every repaint for a click that never comes
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }))
        if (el.hasAttribute('data-inflozo-editing')) return el.tagName.toLowerCase()
      }
      return null
    }, ringed)
    expect(started, 'the control: a press on a stamped element of the ringed section starts a session').not.toBeNull()
    await page.keyboard.press('Escape')
    await expect(canvasFrame(page).locator('[data-inflozo-editing]'), 'Esc ends the session').toHaveCount(0)
    await expect.poll(async () => await tagsOf(page), 'the section the session wrote is drawn fresh; every other root is kept').toEqual(kept(n).toSpliced(ringed, 1, null))
  })

  test('DW-215: Remix re-rolls several sections, and ONE ⌘Z restores every one of them exactly — no other root is replaced', async ({ page }) => {
    await open(page)
    await snapshot(page)
    const n = await tagRoots(page)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('Shift+R')
    await expect(remixDialog(page)).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-remix-go]')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect.poll(() => said(page)).toMatch(/^Remixed \d+ sections? on Home\.$/)
    const rolled = Number((await said(page)).match(/\d+/)[0])
    expect(rolled, 'SEVERAL sections re-rolled, or this is one ⌘Z for one section').toBeGreaterThan(1)
    const tags = await tagsOf(page)
    expect(tags.filter((t) => t === null), 'exactly the re-rolled sections are new').toHaveLength(rolled)
    expect(tags, 'every other root is the same node, in its place').toEqual(kept(n).map((i) => (tags[i] === null ? null : i)))
    await page.keyboard.press('ControlOrMeta+z')
    await expect.poll(() => differs(page), 'ONE ⌘Z puts the whole page back, node for node').toBeNull()
    expect(await tagsOf(page), 'and only the re-rolled sections were drawn again — no other root replaced').toEqual(tags)
  })

  test('every whole-page change repaints the whole page: a flip then an edit, View as, page 2, another canvas and a subject', async ({ page }) => {
    await open(page)
    const canvasStop = page.locator('section[aria-label="Canvas"]')
    const own = (await rows(page)).page
    // the mode: a flip is a re-stamp, and the edit after it paints the page in the other mode
    await tagRoots(page)
    await canvasStop.focus()
    await page.keyboard.press('.')
    await page.locator(`[data-layer-row="${own[0]}"]`).focus()
    await page.keyboard.press('Alt+ArrowDown')
    await expect.poll(async () => allNew(await tagsOf(page)), 'the mode').toBe(true)
    await page.keyboard.press('Alt+ArrowUp')
    await canvasStop.focus()
    await page.keyboard.press('.')
    // View as
    await tagRoots(page)
    await viewAs(page, 'free')
    await expect.poll(async () => allNew(await tagsOf(page)), 'View as').toBe(true)
    // page 2, and back
    await tagRoots(page)
    await toPageTwo(page)
    await expect.poll(async () => allNew(await tagsOf(page)), 'page 2').toBe(true)
    await tagRoots(page)
    await pageRow(page).locator('[role="radio"][aria-checked="true"]').focus()
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '1')
    await expect.poll(async () => allNew(await tagsOf(page)), 'page 1 again').toBe(true)
    // another canvas: Template ▾ → Post
    await tagRoots(page)
    await page.locator('#editor-template').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-canvas="home"]')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
    await expect.poll(async () => allNew(await tagsOf(page)), 'another canvas').toBe(true)
    // a subject: D5e's next row
    await tagRoots(page)
    await page.locator('#editor-source').focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => [...document.querySelectorAll(':popover-open')].some((p) => p.contains(document.activeElement)))
    const current = await page.evaluate(() => document.querySelector('#editor-source-menu [data-subject-row][aria-current="true"]')?.getAttribute('data-subject-row') ?? null)
    for (let guard = 0; guard < 12; guard++) {
      const on = await page.evaluate(() => document.activeElement?.getAttribute('data-subject-row') ?? null)
      if (on !== null && on !== current) break
      await page.keyboard.press('ArrowDown')
    }
    await page.keyboard.press('Enter')
    await expect.poll(async () => allNew(await tagsOf(page)), 'a subject').toBe(true)
  })

  test('a source chosen repaints the whole page', async ({ page }) => {
    // the linked harness site (it never answers, so the page is the sample either way), then Sample content — this
    // header replaces the long Home's, which a source does not need
    await openSurfaces(page)
    await tagRoots(page)
    await page.locator('#editor-source').focus()
    await page.keyboard.press('Enter')
    await page.locator('#editor-source-menu:popover-open').waitFor()
    for (let n = 0; n < 8 && (await page.evaluate(() => document.activeElement?.getAttribute('data-source-row'))) !== 'sample'; n++) await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-source', 'sample')
    await expect.poll(async () => allNew(await tagsOf(page)), 'a source').toBe(true)
  })

  test('a read that lands repaints the whole page: a background revalidation lands, and the next paint draws every section fresh with what it read', async ({ page }) => {
    // the page's clock is the test's to move, so the minute a read stays fresh can pass without waiting for it
    await page.clock.install()
    // the long Home, and the linked harness site — which answers here (`answeringSite`), so reads really land
    await page.setExtraHTTPHeaders({ 'x-inflozo-harness-home': String(LONG_HOME), 'x-inflozo-harness-site': 'surfaces' })
    const site = await answeringSite(page)
    await open(page)
    const shows = (words) => canvasFrame(page).locator('#canvas').evaluate((c, w) => c.textContent.includes(w), words)
    // THE CONTROL: the page is drawn from the site's reads, not the sample — or nothing below has landed at all
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-source', 'site')
    expect(await shows(site.newest), "the control: the site's newest post is on the page").toBe(true)
    // and on the site's content a move still moves one section: while nothing lands, every drawing is kept
    const [, second] = (await rows(page)).page
    await select(page, second)
    const at = await selectedPlace(page)
    let n = await tagRoots(page)
    await page.locator(`[data-layer-row="${second}"]`).focus()
    await page.keyboard.press('Alt+ArrowDown')
    await expect.poll(async () => (await rows(page)).page.indexOf(second)).toBe(2)
    expect(await tagsOf(page), 'nothing landed: ⌥↓ keeps every root and moves one').toEqual(swapped(n, at))
    // THE LANDING: the site retitles its newest post, the reads in hand go stale, and the Picker's cards ask for their rows
    // — served from memory at once and revalidated in the background, which never paints by itself (`lib/live-client.ts`)
    site.revise()
    const asked = site.finished()
    await page.clock.setSystemTime(Date.now() + LIVE.FRESH_MS + 1000)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('ControlOrMeta+k')
    await expect(picker(page)).toBeVisible()
    await expect.poll(site.finished, 'the Picker revalidated the reads it shares with the page').toBeGreaterThan(asked)
    // the answers are in the page; a moment more and the store has written them (a few microtasks after each arrives)
    await page.waitForTimeout(500)
    await page.keyboard.press('Escape')
    await expect(picker(page)).toHaveCount(0)
    expect(await shows(site.revised), 'a read landing in the background paints nothing by itself').toBe(false)
    // THE NEXT PAINT — an edit that moves one section back — redraws the whole page, and shows what landed
    n = await tagRoots(page)
    await page.locator(`[data-layer-row="${second}"]`).focus()
    await page.keyboard.press('Alt+ArrowUp')
    await expect.poll(async () => (await rows(page)).page.indexOf(second)).toBe(1)
    expect(allNew(await tagsOf(page)), 'a read landed since the last paint: the next one repaints the whole page').toBe(true)
    expect(await shows(site.revised), 'and the page shows what landed').toBe(true)
  })

  test('the Paywall keeps its own page write: written whole on every paint, none of its nodes kept', async ({ page }) => {
    await openPaywall(page)
    await tagRoots(page)
    await page.locator('[data-design-tile][tabindex="0"]').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-panel-position')).toHaveText(/^1 \/ \d+$/)
    await expect.poll(async () => allNew(await tagsOf(page)), 'the Paywall surface').toBe(true)
  })
})

/* ── Story 5.23b — THE PANELS REDRAW ONLY WHAT CHANGED, AND THE CANVAS COMES FIRST (R-208, R-210) ─────────────────────
   On the long Home each part that redraws only what touched it carries React's own `<Profiler>`, whose callback counts its
   commits by id in `window.__inflozoRenders` in the gate's development build (`lib/renders.ts`'s `counted`; production
   never writes). So "a gesture redraws its own parts and no other" is read off the page: the counts are emptied before a
   gesture and read after its own end — which, since R-210, is a frame after the canvas for any change to a section, so
   each stop waits for the panel to settle first. The parts: a Layers row (`layers-row`), a rail row (`rail-row`), the
   Controls panel's Design block (`design`) and its settings (`settings`), the canvas chrome (`chrome`) and the pill
   (`pill`). A drag is pointer-only, so its counts are the story's scratch pointer probe, never this file's.

   Then R-210's two guarantees, each driven in ONE TASK so no frame can fall between: a press on the settings panel still
   drawn for the design just replaced writes nothing, and an urgent render landing between two edits loses neither. */

/** Every part's commits since the last `resetRenders`, by its `<Profiler>` id — a part that did not render is absent. */
const renders = (page) => page.evaluate(() => ({ ...(window.__inflozoRenders ?? {}) }))
const resetRenders = (page) => page.evaluate(() => { window.__inflozoRenders = {} })
/** DW-292 — RENDERS SETTLED, the condition a render count means, never a fixed moment. The Design block's tiles commit
 *  LATE inside `<Profiler id="design">`: each preview frame loads, paints and re-renders its card on its own time, so after
 *  `panelsSettle`'s two frames and 150 ms a tile the SELECTION started could still land after `resetRenders` and be
 *  counted as the gesture's — red on CI on unchanged code (5.24a's push), and 2 runs in 4 on a warm server here. So first
 *  every Design-block tile on screen has its frame drawn, then the counts hold still for three frame-plus-50 ms ticks. */
const rendersSettle = (page) =>
  page.evaluate(async () => {
    const tick = () => new Promise((done) => requestAnimationFrame(() => setTimeout(done, 50)))
    const by = Date.now() + 15000
    const onScreen = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight }
    // a tile's frame is drawn once `SectionPreview` has measured its section: until then it is `visibility: hidden`
    const tilesDrawn = () => [...document.querySelectorAll('#editor-design [data-design-tile]')].filter(onScreen)
      .every((tile) => { const frame = tile.parentElement?.querySelector('iframe'); return !!frame && frame.style.visibility !== 'hidden' })
    while (!tilesDrawn()) {
      if (Date.now() > by) throw new Error('the Design block\'s tiles never all drew')
      await tick()
    }
    let last = JSON.stringify(window.__inflozoRenders ?? {})
    for (let still = 0; still < 3;) {
      if (Date.now() > by) throw new Error('the editor never stopped rendering')
      await tick()
      const now = JSON.stringify(window.__inflozoRenders ?? {})
      still = now === last ? still + 1 : 0
      last = now
    }
  })
/** The root at a place among the canvas's sections, as `pointAt` takes it (`:nth-child` is 1-based, the place 0-based). */
const rootAt = (place) => `#canvas > :nth-child(${place + 1})`

test.describe('Story 5.23b — the panels redraw only what changed, on the long Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-inflozo-harness-home': String(LONG_HOME) })
  })

  test('a hover redraws at most the two Layers rows whose wash changed, and the chrome — the Controls panel does not', async ({ page }) => {
    await open(page)
    const own = (await rows(page)).page
    expect(own, 'the harness built the long Home').toHaveLength(LONG_HOME)
    // a section selected, so a Controls panel is drawn that the hover must leave alone
    await select(page, own[1])
    const at = await selectedPlace(page)
    await rendersSettle(page)
    await resetRenders(page)
    await pointAt(page, rootAt(at + 1))
    await expect(page.locator('[data-section-pill]'), 'the control: the section is pointed at').toHaveCount(1)
    await expect(page.locator('[data-layer-row].bg-coral-wash'), 'and its Layers row carries the wash').toHaveCount(1)
    await rendersSettle(page)
    const drawn = await renders(page)
    expect(drawn['layers-row'] ?? 0, 'at most the two rows whose wash changed').toBeLessThanOrEqual(2)
    expect(drawn['layers-row'] ?? 0, 'the pointed row itself').toBeGreaterThanOrEqual(1)
    expect(drawn['chrome'] ?? 0, 'the chrome draws the hover').toBeGreaterThanOrEqual(1)
    expect(drawn['settings'] ?? 0, 'the Controls panel does not redraw').toBe(0)
    expect(drawn['design'] ?? 0, 'nor its Design block').toBe(0)
  })

  test('a selection redraws the two rows whose selection changed, the Controls panel and the chrome', async ({ page }) => {
    await open(page)
    const own = (await rows(page)).page
    await select(page, own[1])
    await rendersSettle(page)
    await resetRenders(page)
    await select(page, own[2])
    await rendersSettle(page)
    const drawn = await renders(page)
    expect(drawn['layers-row'] ?? 0, 'the two rows whose selection changed, and no other').toBeLessThanOrEqual(2)
    expect(drawn['layers-row'] ?? 0, 'the newly chosen row').toBeGreaterThanOrEqual(1)
    expect(drawn['settings'] ?? 0, 'the Controls panel draws the new section').toBeGreaterThanOrEqual(1)
    expect(drawn['chrome'] ?? 0, 'the chrome draws the new selection').toBeGreaterThanOrEqual(1)
  })

  test('a control change redraws the Controls panel in the same frame (FR-F4) and no Layers row', async ({ page }) => {
    await open(page)
    await selectRinged(page)
    const setting = await styleSetting(page)
    const was = await setting.checked()
    await setting.stop.focus()
    await rendersSettle(page)
    await resetRenders(page)
    // the render that commits the change shows it: read after the press with no frame in between, only the microtasks
    // React flushes a key's own update in
    const shown = await page.evaluate(async () => {
      const radio = document.activeElement
      radio.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
      for (let n = 0; n < 3; n++) await Promise.resolve()
      return [...radio.closest('[role="radiogroup"]').querySelectorAll('[role="radio"]')].findIndex((r) => r.getAttribute('aria-checked') === 'true')
    })
    expect(shown, 'FR-F4: the panel shows the change in the render that commits it').not.toBe(was)
    await rendersSettle(page)
    const drawn = await renders(page)
    expect(drawn['settings'] ?? 0, 'the Controls panel redraws').toBeGreaterThanOrEqual(1)
    expect(drawn['layers-row'] ?? 0, 'no Layers row').toBe(0)
  })

  test('⌥↓ on the selected row redraws at most the two rows that swapped — the Controls panel does not', async ({ page }) => {
    await open(page)
    const own = (await rows(page)).page
    const fourth = own[3]
    await select(page, fourth)
    await rendersSettle(page)
    await resetRenders(page)
    await page.locator(`[data-layer-row="${fourth}"]`).focus()
    await page.keyboard.press('Alt+ArrowDown')
    await expect.poll(async () => (await rows(page)).page.indexOf(fourth)).toBe(4)
    await rendersSettle(page)
    const drawn = await renders(page)
    expect(drawn['layers-row'] ?? 0, 'at most the two rows that swapped').toBeLessThanOrEqual(2)
    expect(drawn['settings'] ?? 0, 'the Controls panel does not redraw').toBe(0)
    expect(drawn['design'] ?? 0, 'nor its Design block').toBe(0)
  })

  test('`]` on the ringed section redraws the Controls panel and at most its own row — no other row', async ({ page }) => {
    await open(page)
    await selectRinged(page)
    await rendersSettle(page)
    await resetRenders(page)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press(']')
    await expect(counter(page)).toHaveText(/^2 of \d+$/)
    await rendersSettle(page)
    const drawn = await renders(page)
    expect(drawn['settings'] ?? 0, 'the Controls panel draws the new design').toBeGreaterThanOrEqual(1)
    expect(drawn['layers-row'] ?? 0, 'at most the section\'s own row').toBeLessThanOrEqual(1)
  })

  test('the rail at 1100: a hover redraws no rail row, and a selection redraws its two', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 900 })
    await openCompact(page)
    const own = (await rows(page)).page
    await expect(page.locator('[data-icon-rail]'), 'the control: below 1280 the rail stands where Layers did').toBeVisible()
    // a first selection from the rail, so the second changes two rows; its overlay closed again, the selection kept
    await page.locator(`[data-rail-row="${own[1]}"]`).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator(`[data-rail-row="${own[1]}"]`)).toHaveAttribute('aria-current', 'true')
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor-controls')).toBeHidden()
    const at = await selectedPlace(page)
    await rendersSettle(page)
    await resetRenders(page)
    await pointAt(page, rootAt(at + 1))
    await expect(page.locator('[data-section-pill]'), 'the control: the section is pointed at').toHaveCount(1)
    await rendersSettle(page)
    expect((await renders(page))['rail-row'] ?? 0, 'the hover redraws no rail row').toBe(0)
    await resetRenders(page)
    await page.locator(`[data-rail-row="${own[2]}"]`).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator(`[data-rail-row="${own[2]}"]`)).toHaveAttribute('aria-current', 'true')
    await rendersSettle(page)
    const drawn = (await renders(page))['rail-row'] ?? 0
    expect(drawn, 'the selection redraws its two rail rows').toBeLessThanOrEqual(2)
    expect(drawn, 'the newly chosen one').toBeGreaterThanOrEqual(1)
  })

  test('R-210: a press on the settings panel still drawn for the design just replaced writes nothing — the section keeps the new design\'s values', async ({ page }) => {
    await open(page)
    await selectRinged(page)
    // Image position: the first design and the second share it, so the second CARRIES the first's value (FR-D19) — a
    // write from the old panel would carry the pressed value instead
    const layout = page.locator('#editor-controls button[id$="-group-layout"]')
    if ((await layout.getAttribute('aria-expanded')) !== 'true') {
      await layout.focus()
      await page.keyboard.press('Enter')
    }
    await expect(imageRow(page), 'the first design declares Image position').toHaveCount(1)
    // a value STORED on the first design, so the second carries it (a default is not carried: each design has its own)
    const initial = await imageValue(page)
    await imageRow(page).locator('[role="radio"][tabindex="0"]').focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => imageValue(page), 'the control: the first press is written').not.toBe(initial)
    const was = await imageValue(page)
    await imageRow(page).locator('[role="radio"][tabindex="0"]').focus()
    // ONE TASK: `]` swaps the design, and the arrow presses the radio the panel still draws for the design just replaced
    // (a key synthesized in the page: the editor's own listeners hear it exactly as a key, and no pointer is involved)
    const drawnFor = await page.evaluate(() => {
      const press = (target, key) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      press(document.querySelector('section[aria-label="Canvas"]'), ']')
      const shown = document.querySelector('#editor-design-count')?.textContent?.trim()
      press(document.activeElement, 'ArrowRight')
      return shown
    })
    expect(drawnFor, 'the control: the arrow was pressed on the panel drawn for the first design').toMatch(/^1 of \d+$/)
    await expect(counter(page)).toHaveText(/^2 of \d+$/)
    await expect(imageRow(page), 'the second design shares Image position').toHaveCount(1)
    expect(await imageValue(page), 'nothing was written from the old panel: the second design carries the value as it was').toBe(was)
    // …and a press on the panel as it is drawn now IS written — the stop can see a write
    await imageRow(page).locator('[role="radio"][tabindex="0"]').focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => imageValue(page), 'the control: a press on the current panel lands').not.toBe(was)
  })

  test('R-210: a key after a section operation never lands before it, and neither edit is lost — `]`, a device key, then Space on another row', async ({ page }) => {
    await open(page)
    await selectRinged(page)
    const other = (await rows(page)).page[1]
    const n = await tagRoots(page)
    await page.locator('section[aria-label="Canvas"]').focus()
    // `]` paints the canvas in its own task and holds what it hands React for the next (`lib/renders.ts`'s `canvasFirst`).
    // The press's task ends — a microtask, as between two keys — and `2`'s device, an URGENT update, reaches React before
    // that next task: it must hand the design change over FIRST, so its render shows both. Then Space hides another
    // section, and the editor must make that second edit against the newest doc.
    const between = await page.evaluate(async (row) => {
      const press = (target, key) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      const settle = async () => { for (let k = 0; k < 3; k++) await Promise.resolve() }
      const counterNow = () => document.querySelector('#editor-design-count')?.textContent?.trim() ?? null
      const stage = document.querySelector('section[aria-label="Canvas"]')
      const canvas = document.querySelector('iframe[title$="canvas"]').contentDocument.getElementById('canvas')
      const ringed = canvas.querySelector(':scope > [data-inflozo-selected]')
      press(stage, ']')
      // CANVAS FIRST: the ringed section's drawing is replaced in the key's own task, before any render
      const canvasFirst = ringed !== null && !ringed.isConnected && canvas.querySelector(':scope > [data-inflozo-selected]') !== null
      await settle()
      const held = counterNow()
      press(stage, '2')
      await settle()
      const seen = {
        canvasFirst,
        held,
        device: document.querySelector('#editor-device [role="radio"][aria-checked="true"]')?.getAttribute('data-device') ?? null,
        counter: counterNow(),
      }
      press(document.querySelector(`[data-layer-row="${row}"]`), ' ')
      return seen
    }, other)
    expect(between.canvasFirst, 'R-210: `]` redrew the canvas in its own task').toBe(true)
    expect(between.held, 'R-210: …and its panel waits for the next task').toMatch(/^1 of \d+$/)
    expect(between.device, "the device key's urgent render landed").toBe('tablet')
    expect(between.counter, 'and it handed the design change over first — nothing set later lands before it').toMatch(/^2 of \d+$/)
    // BOTH edits are in the doc: the ringed section on its second design, and the other section hidden
    await expect(counter(page), 'the design change was not lost').toHaveText(/^2 of \d+$/)
    await expect.poll(async () => (await tagsOf(page)).length, 'the hide was not lost').toBe(n - 1)
    await expect(page.locator(`[data-layer-row="${other}"] [popover] button`).first(), 'its row offers Show').toHaveText('Show')
    // and one ⌘Z each takes them back in order: the hide, then the design
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('ControlOrMeta+z')
    await expect.poll(async () => (await tagsOf(page)).length).toBe(n)
    // ⌘Z is the other door (`restore`): the canvas takes the design back in the key's own task, and the panel still reads
    // the design it undoes once the key's own microtasks have run — an urgent update would have drawn it there
    const undone = await page.evaluate(async () => {
      const canvas = document.querySelector('iframe[title$="canvas"]').contentDocument.getElementById('canvas')
      const ringed = canvas.querySelector(':scope > [data-inflozo-selected]')
      document.querySelector('section[aria-label="Canvas"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true }))
      const canvasFirst = ringed !== null && !ringed.isConnected
      for (let k = 0; k < 3; k++) await Promise.resolve()
      return { canvasFirst, counter: document.querySelector('#editor-design-count')?.textContent?.trim() ?? null }
    })
    expect(undone.canvasFirst, 'R-210: ⌘Z redrew the canvas in its own task').toBe(true)
    expect(undone.counter, 'R-210: …and the panel follows a frame later').toMatch(/^2 of \d+$/)
    await expect(counter(page)).toHaveText(/^1 of \d+$/)
  })

  test('R-210: a press on the settings panel still drawn with the values an undo took back writes nothing — the undo stands', async ({ page }) => {
    // The same section on the same design, but the panel a frame behind holds the values ⌘Z just undid; a press there
    // hands up the OLD state whole with one value changed, and writing it would put the undone value back. The guard
    // compares what the panel drew with what the canvas holds (review, 2026-09-28). Background has five values, so the
    // stale press lands on a THIRD one — with two, the arrow from the undone value would wrap back to the value in force.
    await open(page)
    await selectRinged(page)
    const style = page.locator('#editor-controls button[id$="-group-style"]')
    if ((await style.getAttribute('aria-expanded')) !== 'true') {
      await style.focus()
      await page.keyboard.press('Enter')
    }
    const bg = page.locator('#editor-controls [id$="-control-bg"]')
    const bgValue = () => bg.locator('[role="radio"][aria-checked="true"]').innerText()
    await expect(bg).toHaveCount(1)
    const initial = await bgValue()
    await bg.locator('[role="radio"][tabindex="0"]').focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(bgValue, 'the control: the first press is written').not.toBe(initial)
    const second = await bgValue()
    await bg.locator('[role="radio"][tabindex="0"]').focus()
    // ONE TASK: ⌘Z takes the value back on the canvas, and the arrow presses the radio the panel still draws with the
    // value just undone
    const undone = await page.evaluate(async () => {
      const press = (target, key, init = {}) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
      const radio = document.activeElement
      press(document.querySelector('section[aria-label="Canvas"]'), 'z', { ctrlKey: true })
      for (let k = 0; k < 3; k++) await Promise.resolve()
      const shown = document.querySelector('#editor-controls [id$="-control-bg"] [role="radio"][aria-checked="true"]')?.textContent?.trim()
      press(radio, 'ArrowRight')
      return shown
    })
    expect(undone, 'the control: the arrow was pressed on the panel still showing the value undone').toBe(second)
    await panelsSettle(page)
    await expect.poll(bgValue, 'nothing was written from the old panel: the undo stands').toBe(initial)
    // …and a press on the panel as it is drawn now IS written
    await bg.locator('[role="radio"][tabindex="0"]').focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(bgValue, 'the control: a press on the current panel lands').toBe(second)
  })

  test('R-210: a second key on a row still a frame behind is made against the newest doc — two ⌥↓ move two places, two Space show again', async ({ page }) => {
    // The Layers rows follow a section operation a task later (the hand-over), so a row's `at` and `hidden` can be a
    // frame behind the doc when the next key lands — a key repeat, or a quick double press. `on.move` re-bases the
    // displacement on where the section IS, and `onToggleHidden` reads `hidden` from the newest doc; each key here is
    // dispatched in one task with only microtasks between, before any row could land (review, 2026-09-28).
    await open(page)
    const own = (await rows(page)).page
    const fourth = own[3]
    const n = await tagRoots(page)
    await select(page, fourth)
    await panelsSettle(page)
    await page.evaluate(async (row) => {
      const press = (key, init = {}) => document.querySelector(`[data-layer-row="${row}"]`).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
      const settle = async () => { for (let k = 0; k < 3; k++) await Promise.resolve() }
      press('ArrowDown', { altKey: true })
      await settle()
      press('ArrowDown', { altKey: true })
    }, fourth)
    await expect.poll(async () => (await rows(page)).page.indexOf(fourth), 'two ⌥↓ in one task move the section two places, not one').toBe(5)
    await panelsSettle(page)
    await page.evaluate(async (row) => {
      const press = (key) => document.querySelector(`[data-layer-row="${row}"]`).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      press(' ')
      for (let k = 0; k < 3; k++) await Promise.resolve()
      press(' ')
    }, fourth)
    await panelsSettle(page)
    await expect.poll(async () => (await tagsOf(page)).length, 'the second Space shows what the first hid').toBe(n)
    await expect(page.locator(`[data-layer-row="${fourth}"] [popover] button`).first(), 'its row offers Hide again').toHaveText('Hide')
  })

  test('R-210: a server call in flight never holds the panels — the rows land while the site is still being re-read, and while the looked-at record is still being written', async ({ page }) => {
    // Next's server actions are router transitions, and React renders every pending transition together: a section
    // operation handed to React as one waited for whatever server call was in flight (the deployed walk's step 94 found it;
    // Layers 2.2 s and 3.8 s behind the canvas on the harness with each answer held 2 s). Here every server action is held
    // until the stop lets it go, as a slow production round trip would hold it.
    let holding = false
    const waiting = []
    let finished = 0
    const isAction = (request) => request.method() === 'POST' && request.headers()['next-action'] !== undefined
    page.on('requestfinished', (request) => {
      if (isAction(request)) finished++
    })
    await page.route('**/app/harness/editor**', async (route) => {
      if (holding && isAction(route.request())) await new Promise((go) => waiting.push(go))
      await route.continue()
    })
    const letGo = () => {
      holding = false
      for (const go of waiting.splice(0)) go()
    }
    // (a) the linked harness site: opening the editor re-reads it (`recheck`), and that read is held
    holding = true
    await openSurfaces(page)
    await expect.poll(() => waiting.length, 'the control: the opening re-read of the linked site is in flight, held').toBeGreaterThan(0)
    const own = (await rows(page)).page
    await page.locator(`[data-layer-row="${own[0]}"]`).focus()
    await page.keyboard.press('Alt+ArrowDown')
    await expect.poll(async () => (await rows(page)).page[1], 'the moved row lands while that read is still held').toBe(own[0])
    expect(waiting.length, '…and it still is').toBeGreaterThan(0)
    letGo()
    // (b) R-167: two other visitors looked at, their writes through; then an edit that makes them unviewed again sends the
    // record in the SAME task as the section operation — and that write is held
    await expect.poll(() => finished, 'the re-read answered').toBeGreaterThan(0)
    for (const visitor of ['free', 'paid']) {
      const done = finished
      await page.locator('#editor-view-as').focus()
      await page.keyboard.press('Enter')
      await expect(page.locator('#editor-view-as-menu [aria-current="true"]')).toBeFocused()
      await page.locator(`#editor-view-as-menu [data-visitor="${visitor}"]`).focus()
      await page.keyboard.press('Enter')
      await expect(page.locator('#editor-view-as-menu')).toBeHidden()
      await expect.poll(() => finished, `the record of ${visitor} written`).toBeGreaterThan(done)
    }
    const gone = (await rows(page)).page[0]
    await select(page, gone)
    holding = true
    await page.keyboard.press('Delete')
    await expect.poll(async () => (await rows(page)).page.includes(gone), 'the deleted row goes while the record is still being written').toBe(false)
    expect(waiting.length, 'the control: the write the Delete sent is held').toBeGreaterThan(0)
    letGo()
  })

  test('the chrome\'s layer follows a control\'s restamp in place — On scroll → Static moves the selected box from the fixed layer to the scrolling one', async ({ page }) => {
    // Story 5.21's rule: a stuck root's chrome is drawn in the viewport's layer, any other in the page's. The chrome is a
    // `memo` part since 5.23b and asks `pinned` only when it renders, so a control change that restamps the root WITHOUT a
    // new node must make it ask again — the deployed walk's step 12 found it missing. (A flip restamps in place too, but no
    // mode-scoped control can move a root today: they are colours, so there is nothing a flip could be driven with here.)
    const canvas = await open(page)
    const header = (await rows(page)).site[0]
    await select(page, header)
    await openEveryGroup(page)
    const onScroll = page.locator('#editor-controls [id$="-control-on-scroll"]')
    await expect(onScroll, 'the header carries On scroll').toHaveCount(1)
    const checked = onScroll.locator('[role="radio"][aria-checked="true"]')
    /** the value chosen from the keyboard, one arrow at a time — each press a control change, as a customer's is */
    const setOnScroll = async (words) => {
      const all = await onScroll.locator('[role="radio"]').allInnerTexts()
      const want = all.indexOf(words)
      expect(want, `On scroll offers ${words}`).toBeGreaterThan(-1)
      for (let n = 0; n < all.length; n++) {
        const at = all.indexOf(await checked.innerText())
        if (at === want) break
        await checked.focus()
        await page.keyboard.press(at < want ? 'ArrowRight' : 'ArrowLeft')
      }
      await expect(checked).toHaveText(words)
    }
    const hostOfSelected = () =>
      canvas.locator('body').evaluate((body) =>
        [...body.ownerDocument.querySelectorAll('[data-inflozo-chrome]')].find((h) => h.shadowRoot?.querySelector('[data-chrome="selected"]'))?.getAttribute('data-inflozo-chrome') ?? null)
    await setOnScroll('Shrink')
    // scrolled, the sticky header is STUCK and its box is drawn in the viewport's layer — the control
    await canvas.locator('body').evaluate((body) => body.ownerDocument.scrollingElement.scrollTo(0, 700))
    await expect.poll(hostOfSelected, 'the control: scrolled, the stuck header\'s box is in the fixed layer').toBe('view')
    // the control change restamps the root in place: Static scrolls with the page, and so does its box
    await setOnScroll('Static')
    await expect(canvas.locator('[data-on-scroll]').first()).toHaveAttribute('data-on-scroll', 'static')
    await expect.poll(hostOfSelected, 'a control change: Static moves the box to the scrolling layer').toBe('page')
    // …and back: Sticky, still scrolled, sticks again and its box returns to the fixed layer
    await setOnScroll('Sticky')
    await expect.poll(hostOfSelected, 'Sticky moves it back to the fixed layer').toBe('view')
  })
})

// ── Story 5.24b (DW-91): the app's error page, on a screen ─────────────────────────────────────────────────────────

test('Story 5.24b (DW-91) — the app\'s error page names its tab "Something went wrong · Inflozo", over its own heading', async ({ page }) => {
  // `/app/harness/error` throws on purpose and exists only under INFLOZO_HARNESS=1 (R-146), so what draws is
  // `app/(app)/app/error.tsx`, the boundary for the whole `/app` segment. The boundary REPLACES the document and no
  // `metadata` export runs for it, so the tab's words are the boundary's own effect: delete that line and this is red
  // (executed at 5.24b's Dev). Story 3.9 fixed the title and checked it once, by hand, on a build nobody starts.
  await page.goto('/app/harness/error')
  await expect(page.getByRole('heading', { level: 1, name: 'We couldn’t show that just now.' })).toBeVisible()
  await expect(page).toHaveTitle('Something went wrong · Inflozo')
})

// ── Story 5.24e — the sweep: the editor ───────────────────────────────────────────────────────────────────────────

const JOURNAL = await import(new URL('../../apps/web/lib/journal.ts', import.meta.url).href)
const LOCK = await import(new URL('../../apps/web/lib/lock.ts', import.meta.url).href)
/** the harness's project, whose id names the lock's channel and this browser's records */
const HARNESS_PROJECT_ID = '00000000-0000-4000-8000-000000000009'
const saveState = (page) => page.locator('#editor-save-state [role="status"]')
const SUBJECT_WORDS = await import(new URL('../../apps/web/lib/preview-subject.ts', import.meta.url).href)
const EDITOR_WORDS = await import(new URL('../../apps/web/lib/editor.ts', import.meta.url).href)

test('R-213 (Story 5.24e): a save refused for sign-in says Signed out with a Sign in link and no Retry now, keeps trying on its backoff, and lands at once on a visit back — a dropped connection, a 422, a 502, a 404 and a 400 stay Retrying', async ({ page, context }) => {
  await open(page)
  const { page: own } = await rows(page)
  // the sync route, answered here: dropped, a status, or the write landing — every request written down with its moment
  let answer = 'drop'
  const sent = []
  await page.route('**/sync', (route) => {
    sent.push({ at: Date.now(), answer })
    return answer === 'drop' ? route.abort()
      : answer === 'landed' ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ applied: true, revision: 1 }) })
      : route.fulfill({ status: answer, body: 'refused' })
  })
  await select(page, own[0])
  await page.keyboard.press('ControlOrMeta+d')
  await expect(saveState(page)).toHaveText('Saved on this device')
  // the stop's own control: a dropped connection is Retrying, and B6 says the connection
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+s')
  await expect(saveState(page)).toHaveText('Retrying')
  await expect(page.locator('#editor-retrying')).toContainText('when the connection returns')
  // R-213: the session has ended — the sixth state, R-213's sentence, the Sign in link, and no Retry now
  answer = 401
  await page.locator('#editor-retry-now').focus()
  await page.keyboard.press('Enter')
  await expect(saveState(page)).toHaveText(JOURNAL.SIGNED_OUT_COPY.title)
  await expect(page.locator('#editor-signed-out')).toContainText(JOURNAL.SIGNED_OUT_COPY.held)
  await expect(page.locator('#editor-retry-now'), 'no Retry now: it could only meet the same 401').toHaveCount(0)
  // …and the backoff keeps trying underneath, with no visit back: a further request, answered 401 again, still Signed out
  const tried = sent.length
  await expect.poll(() => sent.length, { message: 'the backoff tries again while Signed out', timeout: (JOURNAL.BACKOFF_S[0] + 3) * 1000 }).toBeGreaterThan(tried)
  await expect(saveState(page)).toHaveText(JOURNAL.SIGNED_OUT_COPY.title)
  const signIn = page.locator('#editor-sign-in')
  await expect(signIn).toHaveText(JOURNAL.SIGNED_OUT_COPY.signIn)
  await expect(signIn).toHaveAttribute('target', '_blank')
  expect(await signIn.getAttribute('href')).toMatch(/\/sign-in$/)
  // Enter on it opens the sign-in page in a new tab, and this tab — which may hold the only copy — stays where it is
  const where = page.url()
  const tab = context.waitForEvent('page')
  await signIn.focus()
  await page.keyboard.press('Enter')
  await (await tab).close()
  expect(page.url()).toBe(where)
  // signed in elsewhere: coming back to this tab tries AT ONCE — Synced well inside the next backoff, from exactly one
  // request after the visit back
  answer = 'landed'
  const back = Date.now()
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await expect(saveState(page)).toHaveText('Synced', { timeout: 1500 })
  expect(Date.now() - back, 'well inside the backoff: the visit back sent it, not the clock').toBeLessThan(1500)
  expect(sent.filter((r) => r.at >= back).length, 'exactly one request after the visit back').toBe(1)
  await expect(page.locator('#editor-signed-out')).toHaveCount(0)
  // a refusal a sign-in cannot cure stays Retrying (DW-304, Story 7.18) — the server failing, and the route refusing
  await select(page, own[0])
  await page.keyboard.press('ControlOrMeta+d')
  for (const status of [422, 502, 404, 400]) {
    answer = status
    const answered = page.waitForResponse((r) => new URL(r.url()).pathname.endsWith('/sync') && r.status() === status)
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('ControlOrMeta+s')
    await answered
    await expect(saveState(page), `${status} is Retrying`).toHaveText('Retrying')
    await expect(page.locator('#editor-signed-out'), `${status} is never Signed out`).toHaveCount(0)
  }
})

test('R-227 (Story 5.24e): signed out while this device holds no copy — after a sign-out in another tab erased it — the panel says the work is only in this tab, never R-213\'s "safe on this device"', async ({ context }) => {
  const a = await context.newPage()
  await open(a)
  const { page: own } = await rows(a)
  await a.route('**/sync', (route) => route.fulfill({ status: 401, body: 'Not signed in' }))
  // R-214's erase, the real way: a second tab of this browser deletes the database, and the editor's own `versionchange`
  // lets go of it and falls back (FR-D10) — every later change goes straight to the cloud
  const b = await context.newPage()
  await b.goto('/app/harness/error')
  await b.evaluate(() => new Promise((done) => {
    const erase = indexedDB.deleteDatabase('inflozo-doc-harness')
    erase.onsuccess = erase.onerror = () => done(null)
  }))
  await expect(saveState(a), 'the control: the editor holds nothing on this device now').toHaveText(JOURNAL.labelOf({ kind: 'fallback' }))
  // an edit in fallback goes straight to the cloud, and meets the 401
  await select(a, own[0])
  await a.keyboard.press('ControlOrMeta+d')
  await expect(saveState(a)).toHaveText(JOURNAL.SIGNED_OUT_COPY.title)
  await expect(a.locator('#editor-signed-out')).toContainText(JOURNAL.SIGNED_OUT_COPY.fallback)
  await expect(a.locator('#editor-signed-out')).not.toContainText(JOURNAL.SIGNED_OUT_COPY.held)
})

test('R-214 (Story 5.24e): a sign-out in another tab that SENT this editor\'s owed work is taken as this editor\'s own 200 — its next save carries the new base, never a conflict', async ({ context }) => {
  const a = await context.newPage()
  await open(a)
  const bodies = []
  await a.route('**/sync', async (route) => {
    bodies.push(JSON.parse(route.request().postData() ?? '{}'))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ applied: true, revision: 100 + bodies.length }) })
  })
  // one edit owed, on this browser's disk, as the sign-out tab will find it
  await select(a, (await rows(a)).page[0])
  await a.keyboard.press('ControlOrMeta+d')
  await expect(saveState(a)).toHaveText('Saved on this device')
  await expect.poll(() => pendingOnDisk(a), 'the control: the edit is owed on this browser\'s disk').not.toEqual([])
  // the sign-out, in a second tab: it reads the owed record off the disk and, its send answered 200 at revision 7, says
  // so on the project's channel — the message `sign-out.tsx` posts, built here from the same record
  const b = await context.newPage()
  await b.goto('/app/harness/error')
  /** the message, posted from the sign-out's tab: at the record's own base, or `past` it — a base this editor does not hold */
  const tell = (past, revision) => b.evaluate(([project, channel, past, revision]) => new Promise((done) => {
    const asked = indexedDB.open('inflozo-doc-harness')
    asked.onsuccess = () => {
      const db = asked.result
      const tx = db.transaction(['meta', 'journal'], 'readonly')
      const meta = tx.objectStore('meta').get(project)
      const entries = tx.objectStore('journal').index('byProject').getAll(project)
      tx.oncomplete = () => {
        db.close()
        const m = meta.result
        const upTo = entries.result.reduce((high, e) => Math.max(high, e.seq), m.synced ?? 0)
        const message = { type: 'sent', project, base: m.baseRevision + past, revision, stamp: m.stamp, upTo }
        const open = new BroadcastChannel(channel)
        open.postMessage(message)
        open.close()
        done(message)
      }
    }
  }), [HARNESS_PROJECT_ID, JOURNAL.SENT_CHANNEL(HARNESS_PROJECT_ID), past, revision])
  // sent from a base this editor does not hold — someone else's record, or an answer it has moved past: ignored, so the
  // indicator stays as it was and the edit is still owed (the review, 2026-10-02)
  await tell(1, 9)
  await a.waitForTimeout(1000)
  await expect(saveState(a), 'a foreign base is not this editor\'s 200').toHaveText('Saved on this device')
  expect(await pendingOnDisk(a), 'and the edit is still owed').not.toEqual([])
  const told = await tell(0, 7)
  expect(told.base, 'the control: the record was the editor\'s, at its base').toBeGreaterThan(-1)
  // taken as its own 200: the owed edit is sent, so the indicator rests green with nothing sent from here
  await expect(saveState(a)).toHaveText('Synced')
  expect(bodies, 'the editor sent nothing itself').toHaveLength(0)
  // its next save carries the base the sign-out's send made
  await select(a, (await rows(a)).page[0])
  await a.keyboard.press('ControlOrMeta+d')
  await a.locator('section[aria-label="Canvas"]').focus()
  await a.keyboard.press('ControlOrMeta+s')
  await expect.poll(() => bodies.length).toBe(1)
  expect(bodies[0].base, 'the announced revision, never the base the sign-out moved past').toBe(7)
})

/** The pending doc keys every project record on this browser's disk still owes — the harness user's own database. */
const pendingOnDisk = (page) =>
  page.evaluate(() => new Promise((done) => {
    const asked = indexedDB.open('inflozo-doc-harness')
    asked.onsuccess = () => {
      const db = asked.result
      const all = db.transaction('meta').objectStore('meta').getAll()
      all.onsuccess = () => {
        db.close()
        done(all.result.flatMap((row) => Object.keys(row.pending ?? {})))
      }
    }
  }))

test('DW-203 (Story 5.24e): a tab reading along beside the holder in ONE browser adopts nothing, sends nothing when hidden, and the holder\'s owed work survives', async ({ context }) => {
  const a = await context.newPage()
  await open(a)
  const before = (await rows(a)).all.length
  await select(a, (await rows(a)).page[0])
  await a.keyboard.press('ControlOrMeta+d')
  await expect(saveState(a)).toHaveText('Saved on this device')
  expect(await pendingOnDisk(a), 'the control: the holder owes its edit, on this browser\'s disk').not.toEqual([])
  // B reads along in the same browser — so it shares A's IndexedDB — and the real holder elsewhere would answer its write
  // with 423, which is how a reader at HEAD dropped the holder's own record
  const b = await context.newPage()
  await b.setExtraHTTPHeaders({ 'x-inflozo-harness-lock': 'reader' })
  const sent = []
  b.on('request', (r) => r.method() === 'POST' && new URL(r.url()).pathname.endsWith('/sync') && sent.push(r.url()))
  await b.route('**/sync', (route) => route.fulfill({ status: 423, body: 'Another session holds this project' }))
  await open(b)
  await expect(b.locator('#editor-lock-bar')).toBeVisible()
  // its ⌘S — the save key of a tab that does not hold the lock — sends nothing, once it has hydrated (the indicator is drawn)
  await expect(saveState(b)).toHaveCount(1)
  await b.locator('section[aria-label="Canvas"]').focus()
  await b.keyboard.press('ControlOrMeta+s')
  await b.waitForTimeout(1000)
  expect(sent, 'a tab reading along sends no /sync on ⌘S').toEqual([])
  // B shows its OWN state: the server's page, nothing owed — never the holder's unsent journal
  expect((await rows(b)).all, 'B draws the server\'s page, not the holder\'s unsent one').toHaveLength(before)
  await expect(saveState(b)).toHaveText('Synced')
  // hidden, it sends nothing
  await b.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await b.waitForTimeout(1000)
  expect(sent, 'nor when hidden').toEqual([])
  expect(await pendingOnDisk(a), 'the holder\'s owed work is still on this browser\'s disk').not.toEqual([])
})

test('DW-225 (Story 5.24e): only the lock\'s holder records what was looked at — a window reading along changes View as and writes nothing', async ({ context }) => {
  // a write of the looked-at record is a server action whose body carries the rows' `states`
  const records = (r) => r.method() === 'POST' && r.headers()['next-action'] !== undefined && (r.postData() ?? '').includes('"states"')
  const a = await context.newPage()
  const b = await context.newPage()
  const fromA = []
  const fromB = []
  a.on('request', (r) => records(r) && fromA.push(r))
  b.on('request', (r) => records(r) && fromB.push(r))
  await open(a)
  await b.setExtraHTTPHeaders({ 'x-inflozo-harness-lock': 'reader' })
  await open(b)
  await expect(b.locator('#editor-lock-bar')).toBeVisible()
  // what opening wrote (the holder's first look) has gone out by now; only View as is counted from here
  await a.waitForTimeout(1500)
  const opened = { a: fromA.length, b: fromB.length }
  await viewAs(b, 'paid')
  await b.waitForTimeout(1500)
  expect(fromB.length - opened.b, 'a window reading along records nothing').toBe(0)
  // the control: the holder's own View as change records one
  await viewAs(a, 'paid')
  await expect.poll(() => fromA.length - opened.a, { message: 'the holder records its look' }).toBe(1)
})

test('DW-241 (Story 5.24e): losing the lock closes every menu, confirm and picker the holder had open — the bar is up and nothing stays open over it', async ({ page }) => {
  // the lock route answers as the holder's own row, then as taken over by another session at the next generation
  let taken = false
  const row = (holder, generation) => ({ holderSessionId: holder, generation, unsyncedEdits: 0, ageMs: 0, nudgeRequestedBy: null, nudgeAgeMs: null, request: null, beat: null })
  await page.route('**/lock', (route) => {
    const { session } = JSON.parse(route.request().postData() ?? '{}')
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(taken ? { row: row('another-session', 2), held: false, won: false } : { row: row(session, 1), held: true, won: true }),
    })
  })
  /** the journal's length when Edit pack's draft was changed, for the check that losing the lock journaled nothing */
  let journalled = 0
  const openers = {
    'the Section Picker (⌘K)': async () => {
      await page.locator('section[aria-label="Canvas"]').focus()
      await page.keyboard.press('ControlOrMeta+k')
      await expect(picker(page)).toBeVisible()
    },
    'a Layers row\'s ⋯ menu': async () => {
      await page.locator('[data-layer-row] button[aria-label^="More for"]').first().focus()
      await page.keyboard.press('Enter')
      await expect(page.locator('[popover]:popover-open')).toHaveCount(1)
    },
    'Site Remix\'s confirm (⇧R)': async () => {
      await page.locator('section[aria-label="Canvas"]').focus()
      await page.keyboard.press('Shift+R')
      await expect(remixDialog(page)).toBeVisible()
    },
    'an inline field being typed in': async () => {
      await selectRinged(page)
      expect(await startHeading(page), 'the control: a session holds the caret').toBe(RING_CONTENT.props.heading.default)
      await page.keyboard.type('xy')
      await expect(canvasFrame(page).locator('[data-inflozo-editing]')).toHaveCount(1)
    },
    // Story 6.4's "Lock lost mid-dialog": the dialog closes with every other, and its draft goes with it
    'Edit pack, a colour changed in its draft': async () => {
      await intoEdit(page, 'paper')
      await typeHex(page, 'light', 'accent', '#1E6BFF')
      await expect(swatchOf(page, 'light', 'accent'), 'the control: the draft changed').toHaveAccessibleName(/#1E6BFF/)
      journalled = (await held(page)).entries
    },
  }
  for (const [what, opener] of Object.entries(openers)) {
    taken = false
    await open(page)
    // held first, confirmed by the server: a session that never held cannot be taken from
    await expect.poll(() => page.evaluate(() => document.getElementById('editor-lock-bar') === null)).toBe(true)
    await opener()
    taken = true
    // another session takes over: the lock's own channel tells this tab to read the row now
    await page.evaluate((id) => new BroadcastChannel(`inflozo-lock-${id}`).postMessage('took-over'), HARNESS_PROJECT_ID)
    await expect(page.locator('#editor-lock-bar'), `${what}: the bar is up`).toBeVisible()
    await expect(page.locator(':popover-open'), `${what}: no menu is left open`).toHaveCount(0)
    await expect(page.locator('dialog[open]'), `${what}: no confirm or picker is left open`).toHaveCount(0)
    await expect(canvasFrame(page).locator('[data-inflozo-editing]'), `${what}: no field is left being typed in`).toHaveCount(0)
    // what only VIEWS stays live (R-192): the devices still switch
    const device = page.locator('#editor-device button[data-device]').first()
    await expect(device, `${what}: a view control is still live`).toBeEnabled()
    expect(await device.getAttribute('aria-disabled'), `${what}: and not greyed`).not.toBe('true')
    if (what.startsWith('Edit pack')) {
      // the draft is dropped: no form is left in the dialog, nothing was journaled or kept, and the canvas is as it was
      await expect(page.locator('dialog[data-pack-editor] #pack-name'), `${what}: the draft is dropped`).toHaveCount(0)
      const after = await held(page)
      expect(after.entries, `${what}: nothing journaled`).toBe(journalled)
      expect('paper' in after.packs, `${what}: nothing kept`).toBe(false)
      expect(await tokenOf(page, '--accent'), `${what}: the canvas untouched`).toBe(recordOf('paper').light.accent)
    }
  }
})

test('DW-244 (Story 5.24e): a live row near its staleness edge is asked about AT the edge — the next lock call comes a quarter-second past it, never a heartbeat later', async ({ page }) => {
  // another session's live row, five seconds from stale, answered to every call
  const row = { holderSessionId: 'another-session', generation: 1, unsyncedEdits: 0, ageMs: LOCK.STALE_MS - 5000, nudgeRequestedBy: null, nudgeAgeMs: null, request: null, beat: null }
  const calls = []
  await page.route('**/lock', (route) => {
    calls.push(Date.now())
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ row, held: false, won: false }) })
  })
  await open(page)
  await expect(page.locator('#editor-lock-bar'), 'the control: the row was answered and landed — this tab reads along').toBeVisible()
  const edge = LOCK.edgePoll(row, false)
  expect(edge, 'the control: the row is well inside a heartbeat of its edge').toBeLessThan(LOCK.HEARTBEAT_MS - 5000)
  // the first call a second or more after the opening's (`next dev`'s StrictMode sends two at once)
  const later = () => calls.filter((t) => t - calls[0] > 1000)
  await expect.poll(() => later().length, { timeout: LOCK.HEARTBEAT_MS - 3000, message: 'a lock call came before the heartbeat' }).toBeGreaterThan(0)
  const gap = later()[0] - calls[0]
  expect(gap, 'asked at the edge').toBeGreaterThanOrEqual(edge - 250)
  expect(gap, 'and not a heartbeat later').toBeLessThan(edge + 2500)
})

test('DW-242 (Story 5.24e): a holder\'s own reload paints no frame of the reader\'s bar, and a genuine reader has it from its first', async ({ browser }) => {
  /** every animation frame from the document's start: is the reading-along bar in the page? */
  const sample = () => {
    window.__barFrames = []
    const look = () => {
      window.__barFrames.push(document.getElementById('editor-lock-bar') !== null)
      requestAnimationFrame(look)
    }
    requestAnimationFrame(look)
  }
  const frames = async (self) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.addInitScript(sample)
    // the harness's reader row names `harness-another-tab`: in the self arm THIS tab carries that id, as a holder's
    // reload keeps its `sessionStorage` (`lib/lock.ts`'s TAB_SESSION_KEY)
    if (self) await page.addInitScript(() => sessionStorage.setItem('inflozo-lock-session', 'harness-another-tab'))
    await page.setExtraHTTPHeaders({ 'x-inflozo-harness-lock': 'reader' })
    await open(page)
    await page.waitForTimeout(500)
    const seen = await page.evaluate(() => window.__barFrames)
    await context.close()
    return seen
  }
  const reader = await frames(false)
  const first = reader.indexOf(true)
  expect(first, 'the control: a genuine reader is greyed').toBeGreaterThan(-1)
  expect(reader.slice(first).every(Boolean), 'and stays greyed from its first greyed frame').toBe(true)
  const self = await frames(true)
  expect(self.length, 'frames were sampled').toBeGreaterThan(10)
  expect(self.filter(Boolean), 'the holder\'s own reload: not one frame of the reader\'s bar').toHaveLength(0)
})

test('DW-223 (Story 5.24e): a subject picked and the page reloaded at once — before its write answered — comes back as the pick, and is sent again', async ({ page }) => {
  // the pick's write is HELD: a server action whose body names a slug never answers, so the reload lands while it is in
  // flight — the moment a pick used to be lost in
  const held = []
  await page.route('**/app/harness/editor/post', (route) => {
    const r = route.request()
    if (r.method() === 'POST' && r.headers()['next-action'] !== undefined && (r.postData() ?? '').includes('"slug"')) {
      held.push(r.url())
      return
    }
    return route.continue()
  })
  await page.goto(`${HARNESS}/post`)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  const pill = page.locator('#editor-source')
  const before = await pill.innerText()
  // D5e's next row, from the keyboard
  await pill.focus()
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => [...document.querySelectorAll(':popover-open')].some((p) => p.contains(document.activeElement)))
  const current = await page.evaluate(() => document.querySelector('#editor-source-menu [data-subject-row][aria-current="true"]')?.getAttribute('data-subject-row') ?? null)
  for (let guard = 0; guard < 12; guard++) {
    const on = await page.evaluate(() => document.activeElement?.getAttribute('data-subject-row') ?? null)
    if (on !== null && on !== current) break
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter')
  // the pill's words read as the page draws them (`innerText`) on both sides, so the comparison is like for like
  await expect.poll(() => pill.innerText(), { message: 'the control: the pick is on the pill' }).not.toBe(before)
  const picked = await pill.innerText()
  await expect.poll(() => held.length, { message: 'its write left, and is held' }).toBeGreaterThan(0)
  const sent = held.length
  await page.reload()
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  await expect.poll(() => pill.innerText(), { message: 'the reload brought the pick back' }).toBe(picked)
  await expect.poll(() => held.length, { message: 'and sent it again' }).toBeGreaterThan(sent)
})

test('DW-223 (the review of 5.24e): a pick whose write got NO answer says so in the sentence that is true of it — kept in this tab, sent again on a reload — and the pick still waits', async ({ page }) => {
  // the pick's write is DROPPED: the connection goes mid-call, so the action throws rather than answers
  await page.route('**/app/harness/editor/post', (route) => {
    const r = route.request()
    return r.method() === 'POST' && r.headers()['next-action'] !== undefined && (r.postData() ?? '').includes('"slug"') ? route.abort() : route.continue()
  })
  await page.goto(`${HARNESS}/post`)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  const pill = page.locator('#editor-source')
  const before = await pill.innerText()
  // D5e's next row, from the keyboard — the DW-223 stop's walk
  await pill.focus()
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => [...document.querySelectorAll(':popover-open')].some((p) => p.contains(document.activeElement)))
  const current = await page.evaluate(() => document.querySelector('#editor-source-menu [data-subject-row][aria-current="true"]')?.getAttribute('data-subject-row') ?? null)
  for (let guard = 0; guard < 12; guard++) {
    const on = await page.evaluate(() => document.activeElement?.getAttribute('data-subject-row') ?? null)
    if (on !== null && on !== current) break
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter')
  await expect.poll(() => pill.innerText(), { message: 'the control: the pick is on the pill' }).not.toBe(before)
  await expect(page.locator('#editor-said')).toHaveText(SUBJECT_WORDS.SAVE_UNANSWERED)
  // and it is true: the pick is still waiting in this tab's store, for the reload that sends it again
  const waiting = await page.evaluate((key) => sessionStorage.getItem(key), SUBJECT_WORDS.PENDING_KEY(HARNESS_PROJECT_ID, EDITOR_WORDS.templateKeyOf('post')))
  expect(JSON.parse(waiting ?? 'null')?.kind, 'the pick waits in sessionStorage').toBe('post')
})

test('the review of 5.24e: a backoff whose turn finds no lock to send under is over — taken over from while Retrying, the indicator leaves Retrying on that turn', async ({ page }) => {
  // DW-241's lock route: the holder's own row, then taken over by another session at the next generation
  let taken = false
  const row = (holder, generation) => ({ holderSessionId: holder, generation, unsyncedEdits: 0, ageMs: 0, nudgeRequestedBy: null, nudgeAgeMs: null, request: null, beat: null })
  await page.route('**/lock', (route) => {
    const { session } = JSON.parse(route.request().postData() ?? '{}')
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(taken ? { row: row('another-session', 2), held: false, won: false } : { row: row(session, 1), held: true, won: true }),
    })
  })
  await page.route('**/sync', (route) => route.abort())
  await open(page)
  await expect.poll(() => page.evaluate(() => document.getElementById('editor-lock-bar') === null)).toBe(true)
  await select(page, (await rows(page)).page[0])
  await page.keyboard.press('ControlOrMeta+d')
  await expect(saveState(page)).toHaveText('Saved on this device')
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+s')
  await expect(saveState(page)).toHaveText('Retrying')
  // taken over from mid-backoff: read-only, and the journal dropped — the backoff's clock is still running
  taken = true
  await page.evaluate((id) => new BroadcastChannel(`inflozo-lock-${id}`).postMessage('took-over'), HARNESS_PROJECT_ID)
  await expect(page.locator('#editor-lock-bar')).toBeVisible()
  await expect(saveState(page), 'the control: the take-over itself leaves the backoff counting').toHaveText('Retrying')
  // its turn comes, finds nothing this session may send, and ends: never Retrying for good
  await expect(saveState(page)).not.toHaveText('Retrying', { timeout: (JOURNAL.BACKOFF_S[0] + 3) * 1000 })
  await expect(page.locator('#editor-retrying')).toHaveCount(0)
})

test('DW-248 (Story 5.24e): the title search at Ghost is the posts list\'s alone — a term typed in the pill on the Post canvas asks once, on the Tag canvas nothing', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'surfaces' })
  await answeringSite(page, { capped: true })
  const searches = []
  page.on('request', (r) => {
    const filter = r.method() === 'GET' && r.url().includes('/ghost/api/content/posts/') ? new URL(r.url()).searchParams.get('filter') : null
    if (filter?.startsWith('title:~')) searches.push(filter)
  })
  /** D5e's search, typed into and left long past the pause the search waits for */
  const typeInPill = async (term, { capped = false } = {}) => {
    await page.locator('#editor-source').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#editor-source-search')).toBeFocused()
    // the capped line stands until a search at Ghost is in force, and not while it is (the review of 5.24e)
    if (capped) await expect(page.locator('[data-source-capped]'), 'the capped line, before a term').toBeVisible()
    await page.keyboard.type(term)
    await page.waitForTimeout(LIVE.SEARCH_DEBOUNCE_MS + 1200)
    if (capped) await expect(page.locator('[data-source-capped]'), 'no capped line while the search at Ghost is in force').toHaveCount(0)
    await page.keyboard.press('Escape')
  }
  await page.goto(`${HARNESS}/post`)
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
  await expect(page.locator('iframe[title$="canvas"]'), 'the control: drawn from the site').toHaveAttribute('data-source', 'site')
  await typeInPill('ab', { capped: true })
  expect(searches, 'the control: on the Post canvas the capped posts list\'s term is one read at Ghost').toEqual(["title:~'ab'"])
  // the Tag canvas: its pill lists tags, which are never searched at Ghost
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="post"]')).toBeFocused()
  for (let guard = 0; guard < 6 && !(await page.locator('[data-canvas="tag"]').evaluate((el) => el === document.activeElement)); guard++) await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'tag')
  await expect(page.locator('iframe[title$="canvas"]'), 'the control: the Tag canvas is drawn from the site too').toHaveAttribute('data-source', 'site')
  await typeInPill('cd')
  expect(searches, 'a tag\'s term is never a posts search').toEqual(["title:~'ab'"])
})

test('DW-273 (the review of 5.24e): the linked site\'s Ghost major reaches the Paywall canvas — on a Ghost 5 site the untouched box is Ghost 5\'s own, and 6\'s with no site', async ({ page }) => {
  const accent = LIB.orbitWeekly.site().accent_color
  const boxes = ['5', '6'].map((major) => RUNTIME.contentCta({ visibility: 'paid', member: false, accent, major }))
  /** the box the canvas drew, beside each major's own as the canvas document parses it — like for like */
  const drawn = () =>
    surfaceBox(page).evaluate((box, [five, six]) => {
      const parsed = (html) => Object.assign(box.ownerDocument.createElement('div'), { innerHTML: html }).innerHTML
      return { box: box.innerHTML, five: parsed(five), six: parsed(six) }
    }, boxes)
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'ghost-5' })
  await openPaywall(page)
  const onFive = await drawn()
  expect(onFive.five, 'the control: the two majors draw two boxes (§54)').not.toBe(onFive.six)
  expect(onFive.box, 'a Ghost 5 site gets 5\'s box').toBe(onFive.five)
  // no site: 6's, as before
  await page.setExtraHTTPHeaders({})
  await openPaywall(page)
  const unlinked = await drawn()
  expect(unlinked.box, 'no site gets 6\'s').toBe(unlinked.six)
})

// R-215 (the review of 5.24e) — SHOWN, THEN NOT. `surfaces-gone` is the surfaces site whose re-read answers the empty
// snapshot, held here until the strip is pointed at, so the answer takes a pointed-at row away. What the editor let go of
// is seen when the surface comes back: the Paywall's own re-read on entry, under `surfaces-later`, answers both again — and
// back on Home the strip's row carries no wash, because nothing points at it. (A CHOSEN row is let go by the same block,
// and no journey can see that half: the only second re-read is the Paywall's, and entering the Paywall lets every
// selection go by itself.)
test('R-215 (the review of 5.24e): a pointed-at Ghost row the re-read no longer shows is let go — when the surface comes back its row is not washed', async ({ page }) => {
  let release
  const answer = new Promise((go) => { release = go })
  let rereads = 0
  await page.route('**/app/harness/editor**', async (route) => {
    const r = route.request()
    // the re-read is the action whose body is the project id alone (5.21's stop); the opening's is held
    if (r.method() === 'POST' && r.headers()['next-action'] && r.postData() === JSON.stringify([HARNESS_PROJECT_ID]) && ++rereads === 1) await answer
    await route.continue()
  })
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'surfaces-gone' })
  await page.goto(HARNESS)
  await expect(canvasFrame(page).locator('#canvas > *').first()).toBeVisible()
  await expect.poll(() => rereads, 'the one re-read as the editor opens, held').toBe(1)
  expect((await shims(page)).surfaces, 'the control: the stored snapshot shows both').toBe(2)
  // the pointer over the strip, synthesized as the 5.21 stop synthesizes it: its row takes the wash
  const stripRow = page.locator('[data-layer-row="ghost:announcement-bar"]')
  await canvasFrame(page).locator('body').evaluate((body) => {
    const doc = body.ownerDocument
    const r = doc.querySelector('[data-ghost-surface="announcement-bar"]').getBoundingClientRect()
    doc.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', clientX: r.left + 200, clientY: r.top + r.height / 2 }))
  })
  // the wash as a class of its own: every row carries `hover:bg-coral-wash`, which a bare match would take for it
  const WASHED = /(^|\s)bg-coral-wash(\s|$)/
  await expect(stripRow, 'the control: the pointed-at row is washed').toHaveClass(WASHED)
  // the answer lands: the site shows neither surface now, so neither is drawn and the group is gone
  release()
  await expect.poll(async () => (await shims(page)).surfaces, 'the answer landed: no surface').toBe(0)
  await expect(page.locator('[data-ghost-rows]')).toHaveCount(0)
  // the surfaces come back — the Paywall's re-read on entry, answered with both — and Home lists both rows again
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'surfaces-later' })
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="home"]')).toBeFocused()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'paywall')
  await expect.poll(() => rereads, 'entering the Paywall re-checks').toBe(2)
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="paywall"]')).toBeFocused()
  await page.keyboard.press('Home')
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'home')
  await expect.poll(async () => (await rows(page)).all.filter((k) => k.startsWith('ghost:')), 'both rows, once the site shows both again').toEqual(GS.GHOST_ROWS.map((r) => `ghost:${r.id}`))
  await expect(stripRow, 'nothing points at the strip: its row is not washed').not.toHaveClass(WASHED)
})

/** every `title:~` read the page sends Ghost, as DW-248's stops count them */
const searchesOf = (page) => {
  const searches = []
  page.on('request', (r) => {
    const filter = r.method() === 'GET' && r.url().includes('/ghost/api/content/posts/') ? new URL(r.url()).searchParams.get('filter') : null
    if (filter?.startsWith('title:~')) searches.push(filter)
  })
  return searches
}

test('DW-248 (the review of 5.24e): the Link Picker\'s search is one read at Ghost whose found post is listed, with no capped line while it is in force — and a pasted address is no search', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'surfaces' })
  const site = await answeringSite(page, { capped: true })
  const searches = searchesOf(page)
  await open(page)
  await expect(page.locator('iframe[title$="canvas"]'), 'the control: drawn from the site').toHaveAttribute('data-source', 'site')
  // the first section whose panel holds a link control, found on the page — never named here
  const link = page.locator('#editor-controls button[popovertarget$="-link"]').first()
  for (const key of (await rows(page)).all.filter((k) => !k.startsWith('ghost:'))) {
    await select(page, key)
    await openEveryGroup(page)
    if ((await link.count()) > 0) break
  }
  await expect(link, 'the harness must carry a section with a link control').toHaveCount(1)
  await link.focus()
  await page.keyboard.press('Enter')
  const panel = page.locator('[role="dialog"]:popover-open')
  await expect(panel.locator('input[type="search"]')).toBeFocused()
  await expect(panel.locator('[data-link-capped]'), 'the capped line, before a term').toBeVisible()
  await page.keyboard.type('zq')
  await expect.poll(() => searches, 'the term is one read at Ghost').toEqual(["title:~'zq'"])
  await expect(panel, 'and the post it found is listed').toContainText(site.found('zq'))
  await expect(panel.locator('[data-link-capped]'), 'no capped line while the search at Ghost is in force').toHaveCount(0)
  // a pasted address is no search: nothing more is asked, and the line is back
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText('https://example.com/zq-elsewhere')
  await page.waitForTimeout(LIVE.SEARCH_DEBOUNCE_MS + 1200)
  expect(searches, 'an address is never a posts search').toEqual(["title:~'zq'"])
  await expect(panel.locator('[data-link-capped]')).toBeVisible()
})

test('DW-248 (the review of 5.24e): the Data group\'s hand-picked search is one read at Ghost whose found post is listed, with no capped line while it is in force', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-site': 'surfaces' })
  const site = await answeringSite(page, { capped: true })
  const searches = searchesOf(page)
  await open(page)
  await expect(page.locator('iframe[title$="canvas"]'), 'the control: drawn from the site').toHaveAttribute('data-source', 'site')
  // a secondary feed, Hand-picked — the 5.19 stop's walk
  await select(page, await placeSecondGrid(page))
  const data = await openData(page)
  await data.locator('button[id$="-source"]').focus()
  await page.keyboard.press('Enter')
  await menuTo(page, LIB.POST_SOURCE_WORDS.picked)
  await page.keyboard.press('Enter')
  await expect(data.locator('button[id$="-source"]')).toContainText(LIB.POST_SOURCE_WORDS.picked)
  await data.locator('button[id$="-search"]').focus()
  await page.keyboard.press('Enter')
  const panel = page.locator('[role="dialog"]:popover-open')
  await expect(panel.locator('input[type="search"]')).toBeFocused()
  await expect(panel.locator('[data-picks-capped]'), 'the capped line, before a term').toBeVisible()
  await page.keyboard.type('zx')
  await expect.poll(() => searches, 'the term is one read at Ghost').toEqual(["title:~'zx'"])
  await expect(panel, 'and the post it found is listed').toContainText(site.found('zx'))
  await expect(panel.locator('[data-picks-capped]'), 'no capped line while the search at Ghost is in force').toHaveCount(0)
})

test('DW-290 (Story 5.24e): after the paint and before any gesture the canvas already holds the chrome\'s faces — and no chrome is drawn', async ({ page }) => {
  await open(page)
  const faces = () => canvasFrame(page).locator('body').evaluate((body) =>
    [...body.ownerDocument.fonts].filter((f) => f.family.replace(/["']/g, '').startsWith('inflozo-chrome')).length)
  await expect.poll(faces, { message: 'the chrome\'s faces, added in idle time' }).toBeGreaterThan(0)
  expect(await canvasFrame(page).locator('[data-inflozo-chrome]').count(), 'and not one chrome host: preparing draws nothing').toBe(0)
})

const PREVIEW_WORDS = await import(new URL('../../apps/web/lib/preview.ts', import.meta.url).href)

test('DW-229 · DW-226 (Story 5.24e): the selected list\'s held part is SAID once in the Controls panel and the Rail\'s is not — and a part declared to run only below a width is chipped at Mobile and not at Desktop', async ({ page }) => {
  await open(page)
  const chips = () => inChrome(page, '[data-chrome="paused"]')
  const own = (await rows(page)).page
  const said = page.locator('#editor-controls [data-paused-said]')
  // the fixture ring's section (the last page row) holds its `marquee` still
  await select(page, own[own.length - 1])
  await expect.poll(chips, { message: 'the control: the list carries its chip' }).toBe(1)
  await expect(said, 'DW-229: said once, for a screen reader').toHaveCount(1)
  await expect(said).toHaveText(PREVIEW_WORDS.PAUSED_SAID)
  // the Rail's part waits for a press, so there is nothing to say
  await select(page, (await rows(page)).site[0])
  await expect(said).toHaveCount(0)
  // DW-226: the same part declared to run only BELOW 768 — at Desktop it never moves on the site, so it is not paused
  await page.frameLocator('iframe[title$="canvas"]').locator('.cx__features').evaluate((el) => el.setAttribute('data-module', 'marquee:768'))
  await select(page, own[own.length - 1])
  await panelsSettle(page)
  expect(await chips(), 'no chip at Desktop').toBe(0)
  await expect(said).toHaveCount(0)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('3')
  await expect.poll(chips, { message: 'and one at Mobile, where it runs' }).toBe(1)
})

test('DW-281 (Story 5.24e): every Layers row and every rail tile draws its own kind\'s picture — S4\'s five at 1440, D8\'s at 1024', async ({ page, browser }) => {
  /** the picture a row's kind is drawn with, read off the harness's own layer names ("A17 — Three Up"): S4 draws five,
   *  and every other kind (the fixture ring's among them) draws Hero's */
  const expected = (name) => ({ A1: 'header', A4: 'hero', A17: 'grid', A22: 'newsletter', A3: 'footer' })[name.split(' — ')[0]] ?? 'hero'
  await page.setViewportSize({ width: 1440, height: 900 })
  await open(page)
  const drawn = await page.locator('[data-layer-row]').evaluateAll((rows) =>
    rows.map((r) => ({ name: r.querySelector('button')?.textContent?.trim() ?? '', glyph: r.querySelector('[data-glyph]')?.getAttribute('data-glyph') ?? null })))
  expect(drawn.length, 'the control: Layers has rows').toBeGreaterThan(1)
  expect(new Set(drawn.map((d) => d.glyph)).size, 'the harness shows more than one kind, so one picture for all would fail').toBeGreaterThan(1)
  for (const { name, glyph } of drawn) expect(glyph, `${name}'s row`).toBe(expected(name))
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(page.locator('[data-rail-row]').first()).toBeVisible()
  const tiles = await page.locator('[data-rail-row]').evaluateAll((all) =>
    all.map((t) => ({ name: t.getAttribute('aria-label').replace(/, hidden$/, ''), glyph: t.querySelector('[data-glyph]')?.getAttribute('data-glyph') ?? null })))
  for (const { name, glyph } of tiles) expect(glyph, `${name}'s tile`).toBe(expected(name))
  // the Footer's picture, on the harness's stand-in footer — A3 ships no design until Story 9.9. In a context of its own:
  // this one's editor opens from the copy its first open kept on the device, which has no footer
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, extraHTTPHeaders: { 'x-inflozo-harness-stand-ins': 'on' } })
  const standing = await context.newPage()
  await open(standing)
  const footer = await standing.locator('[data-layer-row^="site:"]').last().evaluate((r) =>
    ({ name: r.querySelector('button')?.textContent?.trim() ?? '', glyph: r.querySelector('[data-glyph]')?.getAttribute('data-glyph') ?? null }))
  await context.close()
  expect(footer.name, 'the control: the site band ends with the stand-in footer').toMatch(/^A3 — /)
  expect(footer.glyph, `${footer.name}'s row`).toBe('footer')
})

test('DW-187 (Story 5.24e): ⌥↑ on a site-wide footer does nothing at its band\'s end — the footer stays below the header, so Layers\' order stays the page\'s', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-stand-ins': 'on' })
  await open(page)
  const { site, page: own } = await rows(page)
  expect(site, 'the control: the header, then the stand-in footer').toHaveLength(2)
  // the key is live: a page row moves down one
  await page.locator(`[data-layer-row="${own[0]}"]`).focus()
  await page.keyboard.press('Alt+ArrowDown')
  await expect.poll(async () => (await rows(page)).page[1], { message: 'the control: ⌥↓ moves a page row' }).toBe(own[0])
  // …and ⌥↑ on the footer, at the top of its band, moves nothing
  await page.locator(`[data-layer-row="${site[1]}"]`).focus()
  await page.keyboard.press('Alt+ArrowUp')
  await panelsSettle(page)
  expect((await rows(page)).site, 'the footer stayed below the header').toEqual(site)
  // and the page agrees: the header's section is the canvas's first, the footer's its last
  const order = await page.frameLocator('iframe[title$="canvas"]').locator('#canvas').evaluate((c) => [...c.children].length)
  expect(order, 'the canvas still draws every section').toBeGreaterThan(2)
  await select(page, site[0])
  await expect.poll(() => selectedPlace(page), { message: 'the header\'s section is the canvas\'s first' }).toBe(0)
  await select(page, site[1])
  await expect.poll(() => selectedPlace(page), { message: 'the footer\'s section is the canvas\'s last' }).toBe(order - 1)
})

const REVIEW = await import(new URL('../../apps/web/lib/controls-review.ts', import.meta.url).href)

test('DW-198 (Story 5.24e): the Background role\'s dots are the colours the canvas paints in the mode showing — light, and after `.` dark', async ({ page }) => {
  await open(page)
  await select(page, (await rows(page)).page[0])
  await openEveryGroup(page)
  /** each dot against the canvas's own token for its role, in the mode the canvas shows; colours normalised by one probe */
  const compare = () => page.evaluate((tokens) => {
    const doc = document.querySelector('iframe[title$="canvas"]').contentDocument
    const probe = document.createElement('span')
    document.body.append(probe)
    const norm = (c) => {
      probe.style.color = ''
      probe.style.color = c.trim()
      return getComputedStyle(probe).color
    }
    const group = [...document.querySelectorAll('#editor-controls [role="radiogroup"]')]
      .find((g) => /Background/.test(document.getElementById(g.getAttribute('aria-labelledby'))?.textContent ?? ''))
    const dots = [...(group?.querySelectorAll('[role="radio"][data-role]') ?? [])]
      .filter((b) => tokens[b.dataset.role] !== undefined)
      .map((b) => ({
        role: b.dataset.role,
        dot: norm(getComputedStyle(b.querySelector('span')).backgroundColor),
        canvas: norm(getComputedStyle(doc.documentElement).getPropertyValue(tokens[b.dataset.role])),
      }))
    probe.remove()
    return { mode: doc.documentElement.getAttribute('data-mode'), dots }
  }, REVIEW.ROLE_TOKENS)
  const light = await compare()
  expect(light.mode).toBe('light')
  expect(light.dots.length, 'the control: the role offers coloured dots').toBeGreaterThan(1)
  for (const d of light.dots) expect(d.dot, `light: ${d.role}`).toBe(d.canvas)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('.')
  await expect.poll(async () => (await compare()).mode).toBe('dark')
  const dark = await compare()
  expect(dark.dots.map((d) => d.canvas), 'the control: the canvas\'s dark tokens are other colours than its light ones').not.toEqual(light.dots.map((d) => d.canvas))
  for (const d of dark.dots) expect(d.dot, `dark: ${d.role}`).toBe(d.canvas)
})

test('DW-282 (Story 5.24e): a design declaring a prop and a control of one name draws both read-only rows with no duplicate key', async ({ page }) => {
  const duplicate = []
  page.on('console', (m) => { if (/Encountered two children with the same key/.test(m.text())) duplicate.push(m.text()) })
  await page.setExtraHTTPHeaders({ 'x-inflozo-harness-lock': 'reader' })
  await open(page)
  // a22/1, the Inline Row, declares a `blurb` prop and a `blurb` control — reading along, both rows are wrapped read-only
  const inline = await page.locator('[data-layer-row]').evaluateAll((all) =>
    all.find((r) => /Inline Row/.test(r.textContent ?? ''))?.dataset.layerRow ?? null)
  expect(inline, 'the control: the Inline Row is on the harness Home').not.toBeNull()
  await select(page, inline)
  await openEveryGroup(page)
  await panelsSettle(page)
  expect(duplicate, 'React warns of no duplicate key').toEqual([])
})

test.describe('DW-207 (Story 5.24e): the Section Picker\'s three leftovers', () => {
  /** the picker opened from the canvas with ⌘K */
  const openPicker = async (page) => {
    await page.locator('section[aria-label="Canvas"]').focus()
    await page.keyboard.press('ControlOrMeta+k')
    await expect(picker(page)).toBeVisible()
  }
  const refusal = (page) => picker(page).locator('p[role="status"]')

  test('R-37\'s refusal clears as soon as the customer types a search', async ({ page }) => {
    // the stand-in post content layout (`harness/stand-ins.ts`) makes R-37's one refusal reachable with no database
    await page.setExtraHTTPHeaders({ 'x-inflozo-harness-stand-ins': 'on' })
    await page.goto(`${HARNESS}/post`)
    await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'post')
    const add = async () => {
      await openPicker(page)
      await picker(page).locator('[data-cell][data-design="a25/1"]').focus()
      await page.keyboard.press('Enter')
    }
    await add()
    await expect(picker(page), 'the first one is placed').toHaveCount(0)
    await add()
    await expect(refusal(page), 'the control: the second is refused, in the picker').toContainText('this layout already prints the article')
    await page.locator('#picker-search').focus()
    await page.keyboard.type('g')
    await expect(refusal(page), 'typing a search lets it go').toHaveText('')
  })

  test('a category chosen, then a search typed: the rail\'s checked row is All sections, as the header says', async ({ page }) => {
    await open(page)
    await openPicker(page)
    const all = picker(page).locator('[role="radio"]').first()
    await expect(all).toHaveAttribute('aria-checked', 'true')
    // the rail's one tab stop, then ↓ to the first category
    await all.focus()
    await page.keyboard.press('ArrowDown')
    await expect(all, 'the control: a category is chosen').toHaveAttribute('aria-checked', 'false')
    await page.locator('#picker-search').focus()
    await page.keyboard.type('grid')
    await expect(all, 'a search is over every section, so All sections is the checked row').toHaveAttribute('aria-checked', 'true')
    await expect(picker(page).locator('h2')).toHaveText('All sections')
  })

  test('⌘K inside the picker comes back to its search with the words selected', async ({ page }) => {
    await open(page)
    await openPicker(page)
    await page.locator('#picker-search').focus()
    await page.keyboard.type('grid')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(page.locator('#picker-search'), 'the control: focus has left the search').not.toBeFocused()
    await page.keyboard.press('ControlOrMeta+k')
    await expect(page.locator('#picker-search')).toBeFocused()
    expect(await page.locator('#picker-search').evaluate((el) => [el.selectionStart, el.selectionEnd]), 'the words selected, from the first to the last').toEqual([0, 4])
  })
})

test('DW-275 (Story 5.24e): the Paywall\'s post-body sheet is no part of the canvas document — Home has none, and the first Paywall paint brings it, styled, at the cut', async ({ page }) => {
  await open(page)
  await expect(canvasFrame(page).locator('[data-order="2b-surface"]'), 'Home\'s canvas carries no post-body sheet').toHaveCount(0)
  // THE SHEET IS HELD IN FLIGHT, and a paint is asked for meanwhile — View as, whose change of visitor is a repaint
  // (`chooseVisitor`), where `.` is only a re-stamp: none may draw the article before its sheet is in force, or the
  // article is drawn unstyled and the cut measured on it
  let asked = false
  let release
  const held = new Promise((done) => { release = done })
  await page.route((url) => url.searchParams.get('sheet') === 'surface', async (route) => {
    asked = true
    await held
    await route.continue()
  })
  await canvasFrame(page).locator('body').evaluate((body) => {
    const doc = body.ownerDocument
    doc.defaultView.__unstyled = 0
    new doc.defaultView.MutationObserver(() => {
      if (doc.querySelector('.gh-content') && !doc.querySelector('[data-order="2b-surface"]')?.sheet) doc.defaultView.__unstyled++
    }).observe(doc, { subtree: true, childList: true })
  })
  // to the Paywall: the switcher's last row
  await page.locator('#editor-template').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-canvas="home"]')).toBeFocused()
  await page.keyboard.press('End')
  await expect(page.locator('[data-canvas="paywall"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect.poll(() => asked, { message: 'the control: the Paywall asked for its sheet' }).toBe(true)
  const visitor = await viewAsOf(page)
  await viewAs(page, 'paid')
  expect(await viewAsOf(page), 'the control: the visitor changed — a repaint asked for — while the sheet was in flight').not.toBe(visitor)
  await panelsSettle(page)
  release()
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-painted', 'paywall')
  expect(await canvasFrame(page).locator('body').evaluate((b) => b.ownerDocument.defaultView.__unstyled), 'no article was drawn before its sheet').toBe(0)
  const look = await canvasFrame(page).locator('body').evaluate((body) => {
    const doc = body.ownerDocument
    const sheet = doc.querySelector('[data-order="2b-surface"]')
    const cut = doc.querySelector('[data-inflozo-cut], [data-inflozo-gated]')?.getBoundingClientRect()
    return {
      tag: sheet?.tagName ?? null, media: sheet?.media ?? null,
      grid: getComputedStyle(doc.querySelector('.gh-content')).display,
      cut: cut ? cut.top : null, height: doc.defaultView.innerHeight, scrolled: doc.defaultView.scrollY,
    }
  })
  expect(look.tag, 'the sheet is linked in, beside the document').toBe('LINK')
  expect(look.media, 'and on, for the surface').toBe('all')
  expect(look.grid, 'the article is drawn with it — never unstyled').toBe('grid')
  expect(look.scrolled, 'the canvas opened at the cut, measured on the styled article').toBeGreaterThan(0)
  expect(look.cut !== null && look.cut >= 0 && look.cut <= look.height, JSON.stringify(look)).toBe(true)
})

test('DW-303 (Story 5.24e): under `next dev`\'s StrictMode the connect wizard\'s Connect sends its action — never stuck on "Connecting…"', async ({ page }) => {
  // the browser's content-key check reaches a Ghost first: answered here, CORS and all, as a real one answers it
  await page.route('https://harness-ghost.example/ghost/api/content/settings/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET' },
      body: JSON.stringify({ settings: {} }),
    }))
  // the action's POST is aborted: what is asserted is that it LEAVES (the harness has no database to connect to)
  await page.route('**/app/harness/connect', (route) => (route.request().method() === 'POST' ? route.abort() : route.continue()))
  await page.goto('/app/harness/connect')
  // hydrated: Next's own route announcer is in the page, or the form would post natively and prove nothing
  await page.locator('next-route-announcer').waitFor({ state: 'attached' })
  await page.locator('#s2b-api-url').fill('https://harness-ghost.example')
  await page.locator('#s2b-admin-key').fill(`${'a'.repeat(24)}:${'b'.repeat(64)}`)
  await page.locator('#s2b-content-key').fill('c'.repeat(26))
  const sent = page.waitForRequest((r) => r.method() === 'POST' && r.headers()['next-action'] !== undefined, { timeout: 15_000 })
  await page.locator('form button[type="submit"]').focus()
  await page.keyboard.press('Enter')
  await sent
})
