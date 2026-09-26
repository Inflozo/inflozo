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
// ONE STATED EXCEPTION, AND IT PRESSES NOTHING (Story 5.15): R-175's PAUSED chip is drawn on a POINTED section, and a
// keyboard cannot point. So those stops SYNTHESIZE the canvas document's own `pointerover` in the page — the event the
// editor listens for — to read what the chip looks like and where it sits; it is never the pointer device, it reaches
// no task a keyboard could not, and the selected half of the same rule is walked from the keyboard alone.
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
  expect(await dotted(page), 'an edit leaves the page viewed only as the visitor on screen').toEqual(['anonymous', 'free'])
  await pick('anonymous')
  await pick('free')
  expect(await dotted(page)).toEqual([])
  // undo is a change too: `restore()` calls `afterChange`, and nothing else checked that it does (review, 2026-09-21)
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  expect(await dotted(page), 'an undo is a change').toEqual(['anonymous', 'paid'])
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
  const after = (await rows(page)).page
  expect(after).toHaveLength(own.length + 1)
  expect(after[0]).toBe(own[0])
  expect(own, 'the new row is the second, directly under the one it was invoked from').not.toContain(after[1])
  expect(after.slice(2)).toEqual(own.slice(1))
  await page.keyboard.press('ControlOrMeta+z')
  expect((await rows(page)).page).toEqual(own)
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

  // UX-DR5: past the last wraps rather than dying — `[` from the first is the same rule backwards
  await page.keyboard.press('[')
  await expect(counter(page)).toHaveText(/^\d+ of \d+$/)
  const [at, of_] = (await counter(page).innerText()).match(/(\d+) of (\d+)/).slice(1)
  expect(at, 'a dead key at the end of a list reads as broken (UX-DR5)').toBe(of_)
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

  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press(']')
  await expect(tintRow(page), 'the design you moved to does not declare it, so the row is gone').toHaveCount(0)

  // THE LONG WAY ROUND: a parked value must survive an INTERMEDIATE design, which is why the ring holds three
  const length = Number((await counter(page).innerText()).match(/of (\d+)/)[1])
  for (let n = 1; n < length; n++) await page.keyboard.press(']')
  await expect(counter(page)).toHaveText(`1 of ${length}`)
  await expect(tintRow(page)).toHaveCount(1)
  expect(await tintValue(page), 'the parked value must come back exactly as it was left').toBe(chosen_)
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
    await page.keyboard.press(']')
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
  // R-161: no tick-box and no scope group — ABSENT, never greyed (UX-DR3, R-118)
  await expect(remixDialog(page).locator('input, [role="radio"], [role="checkbox"]')).toHaveCount(0)
  await expect(remixDialog(page)).not.toContainText(/Every page|header and footer|Style Pack/i)

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
   every centre on top of every other and the counts collapse to 1. */
test('R-164: each of the cube\'s six faces draws its own number of pips, in its own places', async ({ page }) => {
  await open(page)
  const faces = await page.locator('.remix-dice__face').evaluateAll((els) =>
    els.map((el) => {
      const cs = getComputedStyle(el)
      const box = { w: el.offsetWidth, h: el.offsetHeight }
      const sizes = cs.backgroundSize.split(',').map((v) => v.trim())
      const at = (v, span, layer) =>
        v.endsWith('%') ? ((span - layer) * parseFloat(v)) / 100 + layer / 2 : parseFloat(v) + layer / 2
      const centres = cs.backgroundPosition.split(',').map((pair, n) => {
        const [x, y] = pair.trim().split(/\s+/)
        const [sw, sh] = (sizes[n] ?? sizes[0]).split(/\s+/)
        const lw = sw === 'auto' ? box.w : parseFloat(sw)
        const lh = (sh ?? sw) === 'auto' ? box.h : parseFloat(sh ?? sw)
        return `${at(x, box.w, lw).toFixed(2)},${at(y, box.h, lh).toFixed(2)}`
      })
      return { layers: centres.length, distinct: new Set(centres).size, box }
    }),
  )
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
  const one = await ownIds(page)
  expect(one).not.toEqual(was)
  // …and page 2, which follows, shows it
  await toPageTwo(page)
  expect(await ownIds(page), 'a following page 2 is page 1 as it stands').toEqual(one)
  await expect(page.locator('#editor-layers [data-auto-generated="page-2"]')).toBeVisible()
  // (2) THE FIRST CHANGE ON PAGE 2 — a section deleted through Layers — stores page 2 and the marker goes
  const gone = one[2]
  await select(page, `index:${gone}`)
  await page.keyboard.press('Delete')
  const two = await ownIds(page)
  expect(two).toEqual(one.filter((id) => id !== gone))
  await expect(page.locator('#editor-layers [data-auto-generated]')).toHaveCount(0)
  await expect.poll(() => storedKeys(page), { message: 'the first change stores page 2 under its own key' }).toContain('index')
  // (3) PAGE 1 STILL HAS IT (R-178)
  await pagePill(page).getByRole('button', { name: TWO.BACK_TO_PAGE_ONE }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe[title$="canvas"]')).toHaveAttribute('data-page', '1')
  expect(await ownIds(page)).toEqual(one)
  // (4) a later change to page 1 does not reach page 2
  await page.locator(`[data-layer-row="home:${one[one.length - 1]}"]`).focus()
  await page.keyboard.press('Alt+ArrowUp')
  const oneLater = await ownIds(page)
  expect(oneLater).not.toEqual(one)
  await toPageTwo(page)
  expect(await ownIds(page), 'page 2 is its own now').toEqual(two)
  // (5) ⌘Z — ONE LIST FOR THE WHOLE PROJECT (Story 5.8): the first takes back page 1's move, the second page 2's
  // first change, and page 2 follows page 1 again, marker and all
  await page.locator('section[aria-label="Canvas"]').focus()
  await page.keyboard.press('ControlOrMeta+z')
  expect(await ownIds(page), 'the first ⌘Z undid page 1\'s move, which page 2 never had').toEqual(two)
  await page.keyboard.press('ControlOrMeta+z')
  expect(await ownIds(page), 'the second undid page 2\'s first change: it follows page 1 again').toEqual(one)
  await expect(page.locator('#editor-layers [data-auto-generated="page-2"]')).toHaveText(TWO.COPY_MARKER)
  // (6) REMOVING EVERY SECTION FROM PAGE 2 follows again too (AD-22)
  for (let n = 0; n < one.length; n++) {
    const left = (await rows(page)).page
    if (n > 0 && (await page.locator('#editor-layers [data-auto-generated="page-2"]').count()) > 0) break
    await select(page, left[0])
    await page.keyboard.press('Delete')
  }
  await expect(page.locator('#editor-layers [data-auto-generated="page-2"]'), 'emptied, page 2 follows page 1 again').toBeVisible()
  expect(await ownIds(page)).toEqual(one)
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
  const added = (await rows(page)).page.filter((k) => !own.includes(k))
  expect(added, 'one section placed').toHaveLength(1)
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
  expect(await canvasFrame(page).locator('style[data-order="2b-surface"]').evaluate((s) => s.media)).toBe('not all')
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
