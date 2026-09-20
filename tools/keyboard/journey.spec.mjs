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
// WHAT IT CANNOT PROVE is the deployed walk's, which R-82 requires of every story anyway: the read, the session, the
// sync route and the CSP. A harness proves the wiring and never the stack — `tools/probe/run-verify-editor.cjs` runs
// the same journey on the deployed editor with a real session, from step 71.
//
// Every expectation below is the spec's I/O matrix, row for row.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

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
  // as many presses as it takes to get past the Controls sidebar, derived from the rows Layers actually holds
  const { all } = await rows(page)
  for (let n = 0; n < all.length * 2 + 14; n++) {
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
  expect((await rows(page)).all).toHaveLength(before)
  expect(await said(page)).toBe('')

  await select(page, own[0])
  await page.keyboard.press('ControlOrMeta+d')
  expect((await rows(page)).all).toHaveLength(before + 1)
  expect(await said(page)).toMatch(/duplicated/)

  // a site-wide section is ONE shared instance: its key does nothing, exactly as its row carries no Duplicate
  await select(page, site[0])
  const held = (await rows(page)).all.length
  await page.keyboard.press('ControlOrMeta+d')
  expect((await rows(page)).all).toHaveLength(held)
})

test('Del removes the selection, and a site-wide one asks first with focus on Cancel (R-115)', async ({ page }) => {
  await open(page)
  const { page: own, site } = await rows(page)

  await page.locator('section[aria-label="Canvas"]').focus()
  const before = (await rows(page)).all.length
  await page.keyboard.press('Delete')
  expect((await rows(page)).all, 'nothing selected, nothing removed').toHaveLength(before)

  await select(page, own[0])
  await page.keyboard.press('Delete')
  expect((await rows(page)).all).toHaveLength(before - 1)
  expect(await said(page)).toMatch(/removed/)
  // ⌘Z puts it back exactly, which is Story 5.8's promise and this key's control
  await page.keyboard.press('ControlOrMeta+z')
  expect((await rows(page)).all).toHaveLength(before)
  // AC3: ⇧⌘Z is found passing on the same walk — it takes the section away again, and ⌘Z brings it back
  await page.keyboard.press('ControlOrMeta+Shift+z')
  expect((await rows(page)).all).toHaveLength(before - 1)
  await page.keyboard.press('ControlOrMeta+z')
  expect((await rows(page)).all).toHaveLength(before)

  await select(page, site[0])
  await page.keyboard.press('Delete')
  const confirm = page.locator('dialog[aria-labelledby="editor-sitewide-title"]')
  await expect(confirm).toBeVisible()
  await expect(page.locator('dialog[open] [data-cancel]')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(confirm).toBeHidden()
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
  for (const dead of ['[', ']', 'P', '⇧R', '⌘⏎']) {
    expect(chips, `${dead} has nothing to press yet and must not be advertised`).not.toContain(dead)
  }
  // ⌘K joined this list at Story 5.10, which built the Section Picker it presses (R-145)
  for (const live of ['⌘K', 'L', '.', '⌘D', 'Del', '⌘Z', '⇧⌘Z', '⌘S', 'Esc', '?']) {
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
  // ⌘K LEFT THIS LIST AT STORY 5.10, which built the picker it presses — R-145's rule is that a shortcut arrives
  // with its action, so the key leaves here and gets a stop of its own below. Four are still owed.
  for (const key of ['[', ']', 'p', 'P', 'ControlOrMeta+Enter', 'Shift+R']) {
    await page.keyboard.press(key)
  }
  expect((await rows(page)).all).toHaveLength(before.rows)
  expect(await modeOf(page)).toBe(before.mode)
  expect(await deviceOf(page)).toBe(before.device)
  expect(await said(page)).toBe('')
  await expect(page.locator('dialog[open]')).toHaveCount(0)
})

/* ── Story 5.10 — ⌘K and the Section Picker (FR-D11, FR-D12, `EXPERIENCE.md:502`) ───────────────────────────────
   Four requirements in one walk: ⌘K opens it, the arrows cross the grid, Enter places, Esc closes and focus
   returns to the invoking position. The dialog is native, so the last two are the platform's — which is exactly
   why they are asserted rather than assumed. */

const picker = (page) => page.locator('dialog[open][aria-label="Add a section"]')

test('⌘K opens the Section Picker, the arrows cross the grid, Enter places and Esc returns focus', async ({ page }) => {
  await open(page)
  const before = (await rows(page)).all.length
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(picker(page)).toBeVisible()

  // the rail lists only categories this canvas can take, each with its own count, and ALL CATEGORIES carries none
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
  expect((await rows(page)).all).toHaveLength(before + 1)
  expect(await said(page)).toMatch(/added/)

  // and one ⌘Z puts it back — one gesture, one edit, one undo step (AD-15, AD-16)
  await page.keyboard.press('ControlOrMeta+z')
  expect((await rows(page)).all).toHaveLength(before)

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
  const after = await rows(page)
  expect(after.site, 'one header replaces the other — the site never gains a second').toHaveLength(before.site.length)
  expect(after.site).not.toEqual(before.site)
  expect(await said(page)).toMatch(/Site-wide group/)
  await page.keyboard.press('ControlOrMeta+z')
  expect((await rows(page)).site).toEqual(before.site)
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

test('the Layers row answers ⌥↑ / ⌥↓, and the move is announced in its own words', async ({ page }) => {
  await open(page)
  const { page: own } = await rows(page)
  expect(own.length, 'the fixture must hold two page sections to move one past the other').toBeGreaterThan(1)
  await page.locator(`[data-layer-row="${own[0]}"]`).focus()
  await page.keyboard.press('Alt+ArrowDown')
  const after = await rows(page)
  expect(after.page[1]).toBe(own[0])
  expect(await said(page)).toMatch(/\S/)
  await page.keyboard.press('Alt+ArrowUp')
  expect((await rows(page)).page[0]).toBe(own[0])

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
