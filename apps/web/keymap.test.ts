import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DEVICES } from './lib/device.ts'
import { holdsCaret, IN_PREVIEW, KEYMAP, SINGLE_KEY, sheetRows, shortcutFor } from './lib/keymap.ts'
import { PREVIEW } from './lib/preview.ts'

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
  // and the keys still owed are owed by their chips — ⌘K left this list at Story 5.10, `[` `]` at Story 5.11, ⇧R at
  // Story 5.12 and P at Story 5.15, each with the action it drives (R-145), and the last row leaves it the same way
  for (const chip of ['⌘⏎']) {
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

/* STORY 5.11 — `[` AND `]` ARE LANDED, and unlike ⌘K they are SINGLE-KEY: the whole of WCAG 2.1.4's condition
   rides on them, which is why the matrix's row "the caret in a canvas text prop or a panel field → `[` types `[`"
   is asserted here as well as walked in the keyboard journey. */
test('R-145: `[` and `]` are bound, listed, and INERT with the caret in a field (the matrix\'s most important row)', () => {
  const prev = KEYMAP.find((b) => b.gesture === 'prev')
  const next = KEYMAP.find((b) => b.gesture === 'next')
  for (const [b, key] of [[prev, '['], [next, ']']] as const) {
    assert.ok(b, `${key} has no row`)
    assert.equal(b.story, undefined, `${key}: the row is live now`)
    assert.ok(b.keys?.includes(key), `${key}: the row binds its own character`)
    assert.notEqual(b.meta, true, `${key}: it carries no modifier`)
    assert.ok(sheetRows().includes(b), `${key}: the card lists it, because it works`)
    // both sides of the caret — and OUT of a field is where it does something
    assert.equal(shortcutFor(bare(key), false), b.gesture)
    assert.equal(shortcutFor(bare(key), true), null, `${key}: in a field it types its character and changes nothing`)
    // a modifier is not it: ⌘[ is the browser's Back
    assert.equal(shortcutFor(press(key), false), null, `${key}: ⌘ is not this binding`)
    assert.ok(SINGLE_KEY.has(b.gesture!), `${key}: a single-key binding carries the focus condition`)
  }
  // `{` and `}` are the SHIFTED characters and are nobody's binding, which is what `shift: false` says
  assert.equal(shortcutFor(bare('{', { shiftKey: true }), false), null)
  assert.equal(shortcutFor(bare('}', { shiftKey: true }), false), null)
  assert.equal(shortcutFor(bare('[', { shiftKey: true }), false), null)
})

/* STORY 5.12 — `⇧R` IS LANDED, and it is the first SHIFTED single key in the map. Two rows of the matrix ride on
   the `shift: true` beside it: a bare `r` must stay a letter, and `⇧R` with a caret in a field must still type a
   capital R (the owner's own "most important step"). */
test('R-145: `⇧R` is Site Remix, a bare `r` is a letter, and in a field it types its character', () => {
  const remix = KEYMAP.find((b) => b.gesture === 'remix')
  assert.ok(remix, '⇧R has no row')
  assert.equal(remix.story, undefined, 'the row is live now')
  assert.deepEqual(remix.chips, ['⇧R'])
  assert.ok(remix.keys?.includes('r'))
  assert.equal(remix.shift, true, 'a bare `r` would otherwise be the binding too')
  assert.notEqual(remix.meta, true, 'it carries no modifier but Shift')
  assert.ok(sheetRows().includes(remix), 'the card lists it, because it works — it was deliberately missing until today')
  // Shift makes the key uppercase, and `shortcutFor` lowercases before it matches
  assert.equal(shortcutFor(bare('R', { shiftKey: true }), false), 'remix')
  assert.equal(shortcutFor(bare('r'), false), null, 'a bare `r` is nobody\'s binding')
  assert.equal(shortcutFor(bare('R', { shiftKey: true }), true), null, 'in a field it types a capital R and rolls nothing')
  // ⌘⇧R is the browser's hard reload, and it is not this
  assert.equal(shortcutFor(press('r', { shiftKey: true }), false), null)
  assert.ok(SINGLE_KEY.has('remix'), 'a single-key binding carries WCAG 2.1.4\'s focus condition')
})

/* STORY 5.15 — `P` IS LANDED, R-145's fifth owed key, and like `⇧R` it is a single key: WCAG 2.1.4's condition rides
   on it, so a `p` typed into a headline — or into the page's own email box in Preview — is a letter. Its words are
   `lib/preview.ts`'s, the pill's and the bar's too (R-170). */
test('R-145: `P` is Preview, `⇧P` is nothing, in a field it types its letter, and SINGLE_KEY holds it', () => {
  const preview = KEYMAP.find((b) => b.gesture === 'preview')
  assert.ok(preview, 'P has no row')
  assert.equal(preview.story, undefined, 'the row is live now')
  assert.deepEqual(preview.chips, ['P'])
  assert.equal(preview.action, PREVIEW, 'the card reads the one name the pill and the bar read (R-170)')
  assert.ok(preview.keys?.includes('p'))
  assert.equal(preview.shift, false, 'a capital P is typing, never the toggle')
  assert.notEqual(preview.meta, true, 'it carries no modifier')
  assert.ok(sheetRows().includes(preview), 'the card lists it, because it works')
  assert.equal(shortcutFor(bare('p'), false), 'preview')
  assert.equal(shortcutFor(bare('P', { shiftKey: true }), false), null, '⇧P is nobody\'s binding')
  assert.equal(shortcutFor(bare('p'), true), null, 'in a field it types a p and previews nothing')
  assert.equal(shortcutFor(press('p'), false), null, '⌘P is the browser\'s Print')
  assert.ok(SINGLE_KEY.has('preview'), 'a single-key binding carries WCAG 2.1.4\'s focus condition')
})

test('in Preview only P, ⌘S and the three devices act — every other binding does nothing', () => {
  // the devices walked off S4a's own track, never written down
  assert.deepEqual([...IN_PREVIEW].sort(), ['preview', 'save', ...DEVICES.map((d) => d.name)].sort())
})
