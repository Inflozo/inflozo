import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DEVICES } from './lib/device.ts'
import { holdsCaret, KEYMAP, SINGLE_KEY, sheetRows, shortcutFor } from './lib/keymap.ts'

/* STORY 5.9 — FR-D11's map, asserted where `node --test` can reach it. The I/O matrix's KEY rows are here; the
   gestures themselves are the keyboard journey's (`tools/keyboard/journey.spec.mjs`, `pnpm keyboard` — its own step in CI's `check` job) and the
   deployed walk's (`tools/probe/run-verify-editor.cjs` from step 71).

   R-141's three tests came from `journal.test.ts` with this story, assertion for assertion — the two functions moved
   to `lib/keymap.ts` and Story 5.8's proofs moved with them. The one test that could NOT survive the move is the one
   that asserted no other key was bound: at 5.9 they are, and its replacement is the R-145 test below, which asserts
   the opposite half — that a key with nothing to press is bound by nothing and listed by nothing.

   Nothing below counts anything it could derive: the device rows walk `DEVICES`, and the deferred rows walk the map
   (standing rule 4). */

const press = (key: string, extra: Partial<Parameters<typeof shortcutFor>[0]> = {}) =>
  ({ key, metaKey: true, ctrlKey: false, shiftKey: false, ...extra })
const bare = (key: string, extra: Partial<Parameters<typeof shortcutFor>[0]> = {}) =>
  ({ key, metaKey: false, ctrlKey: false, shiftKey: false, ...extra })

// ── R-141's three, moved from journal.test.ts ──────────────────────────────────────────────────────────────────

test('R-141: ⌘Z undoes, ⇧⌘Z redoes, ⌘S saves — and Ctrl is the same three on Windows', () => {
  assert.equal(shortcutFor(press('z'), false), 'undo')
  assert.equal(shortcutFor(press('z', { shiftKey: true }), false), 'redo')
  assert.equal(shortcutFor(press('s'), false), 'save')
  assert.equal(shortcutFor(press('z', { metaKey: false, ctrlKey: true }), false), 'undo')
  assert.equal(shortcutFor(press('z', { metaKey: false, ctrlKey: true, shiftKey: true }), false), 'redo')
  assert.equal(shortcutFor(press('Z', { shiftKey: true }), false), 'redo', 'Shift makes the key uppercase')
})

test('R-141: ⌘Z is INERT with the caret in a text prop, and ⌘S is not (Story 5.3 is untouched)', () => {
  assert.equal(shortcutFor(press('z'), true), null, 'the browser\'s own undo owns the words being typed')
  assert.equal(shortcutFor(press('z', { shiftKey: true }), true), null)
  assert.equal(shortcutFor(press('s'), true), 'save', 'Save Page As is never what the press meant')
})

test('holdsCaret is the guard, and it covers a contenteditable as well as a field', () => {
  assert.equal(holdsCaret(null), false)
  assert.equal(holdsCaret({ tagName: 'DIV' }), false)
  assert.equal(holdsCaret({ tagName: 'INPUT' }), true)
  assert.equal(holdsCaret({ tagName: 'TEXTAREA' }), true)
  assert.equal(holdsCaret({ tagName: 'SELECT' }), false, 'no caret, no undo of its own')
  assert.equal(holdsCaret({ tagName: 'INPUT', type: 'checkbox' }), false, 'focus rests here after a panel control: ⌘Z must work')
  assert.equal(holdsCaret({ tagName: 'INPUT', type: 'range' }), false)
  assert.equal(holdsCaret({ tagName: 'INPUT', type: 'text' }), true)
  assert.equal(holdsCaret({ tagName: 'H1', isContentEditable: true }), true, 'Story 5.3 edits a heading in place')
  assert.equal(holdsCaret({ tagName: 'SPAN', isContentEditable: true }), true, 'and a button\'s label in a span')
})

// ── Story 5.9's own eight, plus R-147's `?` ────────────────────────────────────────────────────────────────────

test('every live single key reaches its gesture with no modifier at all', () => {
  assert.equal(shortcutFor(bare('l'), false), 'layers')
  assert.equal(shortcutFor(bare('L', { shiftKey: true }), false), null, '⇧L is not L — ⇧R is Site Remix (5.12)')
  assert.equal(shortcutFor(bare('.'), false), 'dark')
  // review, 2026-09-19: an AZERTY board types a digit and `.` WITH Shift, and the character is already in `key`
  assert.equal(shortcutFor(bare('1', { shiftKey: true }), false), DEVICES[0].name)
  assert.equal(shortcutFor(bare('.', { shiftKey: true }), false), 'dark')
  assert.equal(shortcutFor(bare('!', { shiftKey: true }), false), null, 'and ⇧1 on a QWERTY board is `!`, which is no key of ours')
  // Chrome's autofill fires a keydown with no `key`
  assert.equal(shortcutFor({ metaKey: false, ctrlKey: false, shiftKey: false } as never, false), null)
  // a date field's segments take digits and Backspace
  assert.equal(holdsCaret({ tagName: 'INPUT', type: 'date' }), true)
  assert.equal(shortcutFor(bare('?', { shiftKey: true }), false), 'shortcuts', 'R-147: the layout\'s shift makes the character')
  assert.equal(shortcutFor(bare('Escape'), false), null, 'Esc is a ladder with a handler of its own, never a gesture here')
  // the three devices, walked off S4a's own track rather than written down
  for (const [n, device] of DEVICES.entries()) {
    assert.equal(shortcutFor(bare(String(n + 1)), false), device.name, `${n + 1} is ${device.label}`)
    assert.equal(shortcutFor(press(String(n + 1)), false), null, `⌘${n + 1} is not ${device.label}`)
  }
})

test('⌘D duplicates and Del removes — Backspace is the same key on a Mac', () => {
  assert.equal(shortcutFor(press('d'), false), 'duplicate')
  assert.equal(shortcutFor(bare('d'), false), null, 'a bare d is typing')
  assert.equal(shortcutFor(press('d', { shiftKey: true }), false), null)
  assert.equal(shortcutFor(bare('Delete'), false), 'remove')
  assert.equal(shortcutFor(bare('Backspace'), false), 'remove', 'the Mac key labelled Delete reports Backspace')
  assert.equal(shortcutFor(press('Delete'), false), null, '⌘Del is not Del')
})

test('WCAG 2.1.4: with the caret in ANY text, every single-character shortcut is inert', () => {
  for (const b of KEYMAP) {
    if (b.gesture === undefined || !SINGLE_KEY.has(b.gesture)) continue
    for (const key of b.keys ?? []) {
      assert.equal(shortcutFor(bare(key, { shiftKey: b.shift === true }), true), null, `${key} must do nothing while typing`)
    }
  }
  // …and the ⌘ ones are unaffected, which is R-141's line and the whole reason 5.8 could land three keys early
  assert.equal(shortcutFor(press('s'), true), 'save')
  assert.equal(shortcutFor(press('d'), true), 'duplicate')
})

test('a stray modifier is never a gesture', () => {
  assert.equal(shortcutFor(press('z', { altKey: true }), false), null, '⌥⌘Z is not ⌘Z')
  assert.equal(shortcutFor(bare('l', { altKey: true }), false), null, '⌥L is not L')
  assert.equal(shortcutFor({ key: 'z', metaKey: true, ctrlKey: true, shiftKey: false }, false), null, 'both modifiers is not one')
  assert.equal(shortcutFor(bare('y'), false), null, 'a key the map does not name')
})

// ── R-145: a key with nothing to press is bound by nothing and listed by nothing ────────────────────────────────

test('R-145: every deferred row names its story, binds nothing and is not on the card', () => {
  const deferred = KEYMAP.filter((b) => b.story !== undefined)
  assert.ok(deferred.length > 0, 'the map must still name the keys that are owed')
  const listed = new Set(sheetRows())
  for (const b of deferred) {
    assert.equal(b.keys, undefined, `${b.action}: a row with a story must bind nothing`)
    assert.equal(b.gesture, undefined, `${b.action}: a row with a story has no gesture to ask for`)
    assert.ok(!listed.has(b), `${b.action}: the card must not advertise a key that does nothing`)
    assert.match(b.story as string, /^\d+\.\d+$/, `${b.action}: name the story that lands it`)
  }
  // and the keys still owed are owed by their chips — ⌘K left this list at Story 5.10, which built the picker it
  // presses (R-145: a shortcut arrives with the action it drives), and each of the four below leaves it the same way
  for (const chip of ['[', ']', 'P', '⇧R', '⌘⏎']) {
    assert.ok(deferred.some((b) => b.chips.includes(chip)), `${chip} is owed and must stay named`)
    assert.ok(!sheetRows().some((b) => b.chips.includes(chip)), `${chip} must not be on the card`)
  }
})

/* STORY 5.10 — ⌘K IS LANDED, AND NARROWED IN THE SHARED FUNCTION. It is the first of R-145's five owed keys to
   arrive with its action, and the narrowing is the whole of the risk: `⌘K` is ALREADY the link mark inside a text
   field (`lib/inline.ts:230`), and a field that does not permit a link returns there WITHOUT `preventDefault` on
   purpose — so without this the picker would have swallowed the key on its way to the browser. */
test('⌘K is bound, listed, and yields to a caret in a field — the link mark keeps it there', () => {
  const add = KEYMAP.find((b) => b.gesture === 'add')
  assert.ok(add && add.story === undefined && add.keys?.includes('k') && add.meta === true, 'the row is live and ⌘-modified')
  assert.deepEqual(add?.chips, ['⌘K'])
  assert.ok(sheetRows().some((b) => b.gesture === 'add'), 'the card lists it, because it works')
  // both sides of the caret
  assert.equal(shortcutFor({ key: 'k', metaKey: true, ctrlKey: false, shiftKey: false }, false), 'add')
  assert.equal(shortcutFor({ key: 'k', metaKey: false, ctrlKey: true, shiftKey: false }, false), 'add', 'Ctrl elsewhere')
  assert.equal(shortcutFor({ key: 'k', metaKey: true, ctrlKey: false, shiftKey: false }, true), null, 'in a field ⌘K is the link mark')
  // ⇧⌘K is not it, and a bare k is not it — it carries no single-key focus condition either way
  assert.equal(shortcutFor({ key: 'k', metaKey: true, ctrlKey: false, shiftKey: true }, false), null)
  assert.equal(shortcutFor({ key: 'k', metaKey: false, ctrlKey: false, shiftKey: false }, false), null)
  assert.ok(!SINGLE_KEY.has('add'), 'it stays ⌘-modified, so WCAG 2.1.4 has no condition to impose')
  // and the three keys that do NOT give way to a caret still do not (the guard narrowed, never widened)
  assert.equal(shortcutFor({ key: 's', metaKey: true, ctrlKey: false, shiftKey: false }, true), 'save')
  assert.equal(shortcutFor({ key: 'd', metaKey: true, ctrlKey: false, shiftKey: false }, true), 'duplicate')
})

test('the card is derived from the map, and the map is the only binder', () => {
  const rows = sheetRows()
  assert.deepEqual([...rows], KEYMAP.filter((b) => b.story === undefined), 'one list, two readers')
  for (const b of rows) {
    assert.ok(b.action.trim() !== '' && b.chips.length > 0, `${b.action}: a row needs words and at least one chip`)
    assert.ok(b.gesture !== undefined, `${b.action}: a live row must name what it does`)
  }
  // EVERY gesture a press can produce is a row of the card: nothing is bound that is not listed
  for (const b of KEYMAP) {
    if (b.keys === undefined) continue
    assert.ok(rows.includes(b), `${b.action}: bound but not listed`)
  }
  // `deselect` is the one live row with no keys here, and the comment beside it says why (the Esc ladder)
  const unbound = rows.filter((b) => b.keys === undefined)
  assert.deepEqual(unbound.map((b) => b.gesture), ['deselect'])
})
