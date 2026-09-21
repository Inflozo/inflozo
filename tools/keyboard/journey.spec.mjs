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

/** The tab stops a region holds, COUNTED OFF THE PAGE: every element Tab would land on that is drawn. A closed
 *  popover's rows are `display:none`, a roving radio group's unchecked radios are `tabindex="-1"`, a hidden pill is
 *  `visibility: hidden`, and Tab passes all three by, so this does too. Nothing here is a number written down. */
const stopsIn = (page, selector) =>
  page.locator(selector).evaluate((root) =>
    [...root.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
      .filter((el) => el.tabIndex >= 0 && !el.disabled && el.checkVisibility({ visibilityProperty: true })).length)

/** Story 5.14 — the visitor View as names: its ONE visible value, never a word held in the slot for its width. */
const viewAsOf = (page) => page.locator('#editor-view-as [data-current]').innerText()

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
  for (const dead of ['P', '⌘⏎']) {
    expect(chips, `${dead} has nothing to press yet and must not be advertised`).not.toContain(dead)
  }
  // ⌘K joined this list at Story 5.10, which built the Section Picker it presses, `[` `]` at Story 5.11, which
  // built the design ring they cycle, and ⇧R at Story 5.12, which built Site Remix (R-145: a shortcut arrives
  // with the action it drives)
  for (const live of ['⌘K', '[', ']', '⇧R', 'L', '.', '⌘D', 'Del', '⌘Z', '⇧⌘Z', '⌘S', 'Esc', '?']) {
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
  // ⌘K LEFT THIS LIST AT STORY 5.10, `[` `]` AT STORY 5.11 and ⇧R AT STORY 5.12, each with the action it
  // presses — R-145's rule is that a shortcut arrives with its action, so a key leaves here and gets a stop of
  // its own below. Two are still owed.
  for (const key of ['p', 'P', 'ControlOrMeta+Enter']) {
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
  expect(await viewAsOf(page)).toBe('Anonymous')
  // S4d's marker: this canvas has been looked at as one visitor, so two are still to see
  await expect(page.locator('#editor-view-as-marker')).toHaveText('2 not viewed')
  const signedOut = await canvas.locator('#canvas').innerHTML()
  // the record made on open has been written and refused (the harness has no database) before the pick below, so the
  // refusal counted after the pick is the pick's own — the one write chain lands them in order
  await expect.poll(() => refused.length, { message: 'the write made on open is refused and logged' }).toBeGreaterThan(0)
  const beforePick = refused.length

  // Enter opens S4d's menu, and focus steps onto its first row
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
  await expect(page.locator('#editor-view-as-marker')).toHaveText('1 not viewed')
  // THE MATRIX'S "SAVE REFUSED" ROW: the harness has no database, so every write of the record is refused — and that is
  // LOGGED, never said, while the session's record stands (the marker above) and the canvas is unaffected (the repaint)
  await expect.poll(() => refused.length, { message: 'the pick\'s refused write is logged' }).toBeGreaterThan(beforePick)
  expect(await said(page), 'a refused record is never said').toMatch(/previewing a free member/i)
  await expect(page.locator('#editor-view-as-marker')).toHaveText('1 not viewed')

  // Esc closes the menu and focus returns to the trigger, with the visitor where it was
  await page.keyboard.press('Enter')
  await expect(menu).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  expect(await focused(page)).toBe('BUTTON#editor-view-as')
  expect(await viewAsOf(page)).toBe('Free member')

  // and back to Anonymous: byte for byte the signed-out render it started as
  await page.keyboard.press('Enter')
  await expect(menu.locator('[data-visitor="anonymous"]')).toBeFocused()
  await page.keyboard.press('Enter')
  expect(await viewAsOf(page)).toBe('Anonymous')
  expect(await canvas.locator('#canvas').innerHTML()).toBe(signedOut)
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
    // a key that opens a dialog (⇧R's confirm, ?'s card) is closed again, so the next key reaches the shell
    if ((await page.locator('dialog[open]').count()) > 0) await page.keyboard.press('Escape')
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
      // and they are still PAINTED — the second open draws nothing again
      painted: frames.filter((f) => (f.contentDocument?.getElementById('canvas')?.children.length ?? 0) > 0).length,
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
