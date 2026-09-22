/* ─────────────────────────────────────────── Story 5.9 — FR-D11's keyboard map, as ONE TABLE.
 *
 * ONE LIST, TWO READERS (R-145, owner, 2026-09-19). The key handler and the `?` shortcuts card both derive from
 * `KEYMAP` below, so a key can never be advertised without being bound, or bound without being listed. Writing the
 * live keys down twice is exactly how a card comes to promise a key that does nothing.
 *
 * A BINDING WHOSE ACTION HAS NOT BEEN BUILT IS ABSENT (R-145 — R-118 applied to a key for the first time): not
 * bound, not listed, never greyed and never captioned (UX-DR3). Such a row carries `story` and no `keys`, which is
 * the whole of the difference — nothing matches it and `sheetRows()` leaves it out. The row still exists, because
 * the alternative is losing the fact that the key is OWED: `⌘K` landed with 5.10, `[` `]` with 5.11, `⇧R` with 5.12
 * and `P` with 5.15, and `⌘⏎` lands with 7.18, each a criterion of that story, and the map is complete when 7.18
 * ships. It is the shape `lib/editor.ts`'s `CANVASES` + `CONDITIONAL` already uses: the scheme itself
 * refuses what is not offered.
 *
 * EVERY SINGLE-CHARACTER SHORTCUT IS LIVE ONLY WHILE THE SHELL HOLDS FOCUS, and never while a text field or a
 * `contenteditable` has it (UX-DR11, WCAG 2.1.4 — a Level A rule inside the AA threshold). `holdsCaret` is that
 * guard and `shortcutFor`'s `inField` is what the caller resolves it to; `⌘`-modified presses are unaffected, which
 * is R-141's line and the reason Story 5.8 could land three keys before this story. axe-core cannot see any of this
 * — the keyboard journey (`tools/keyboard/journey.spec.mjs`) is its only verifier.
 *
 * `holdsCaret` and `shortcutFor` MOVED HERE from `lib/journal.ts` at this story: the map is not the journal's
 * business, and 5.8 only kept them there because its three keys were all the map there was.
 *
 * Pure, and its two imports are `lib/device.ts` and `lib/preview.ts`, both importless — so `node --test` reaches all of it
 * (`keymap.test.ts`; the standing precedent is `kit-button.test.ts:6-7`, and the reason is that `node --test` strips
 * types but cannot load a `.tsx`).
 */

import { DEVICES } from './device.ts'
import { PREVIEW } from './preview.ts'

/** What a matched press asks the editor to do. */
export type Gesture =
  | 'undo' | 'redo' | 'save'
  | 'add' | 'duplicate' | 'remove'
  | 'prev' | 'next'
  | 'layers' | 'dark' | 'shortcuts' | 'deselect'
  | 'remix' | 'preview'
  | 'desktop' | 'tablet' | 'mobile'

export type Binding = {
  /** absent on a row whose action is not built — there is nothing for a press to ask for */
  gesture?: Gesture
  /** the card's left-hand words */
  action: string
  /** the card's mono chips, in order, as the export draws them (`Editor Sidebar Kit.dc.html:274-280`) */
  chips: readonly string[]
  /** `KeyboardEvent.key`, lowercased. ABSENT means nothing here matches it — either the action is not built
   *  (`story` below) or the gesture has a handler of its own (`deselect`, whose ladder is `editor.tsx`'s). */
  keys?: readonly string[]
  /** ⌘ on a Mac, Ctrl elsewhere — exactly one of the two. Absent means the press carries neither. */
  meta?: boolean
  /** required Shift state; absent means either. A letter's case is already carried by `key`, so a single-key letter
   *  binding must say `false` or `⇧L` would fold the Layers panel and never reach `⇧R`. */
  shift?: boolean
  /** the story that lands the action. ABSENT means it is live now. */
  story?: string
}

/**
 * FR-D11's map, in the order `EXPERIENCE.md:378-388` prints it, plus R-147's `?`. Every global binding in the
 * product is here, live or owed, and nothing else anywhere may bind a global key.
 *
 * The three device rows are DERIVED from `DEVICES` — S4a's own track, left to right — so the card's words and the
 * track's are one list and `1` `2` `3` can never fall out of step with the order on screen (standing rule 4).
 */
export const KEYMAP: readonly Binding[] = [
  // Story 5.10 — R-145's first key to arrive with its action. It stays ⌘-MODIFIED and is deliberately not a
  // `SINGLE_KEY`: it carries no WCAG 2.1.4 focus condition and still fires while a popover is open. The narrowing
  // that matters is in `shortcutFor` below — ⌘K is already the LINK mark inside a field (`lib/inline.ts:230`).
  { gesture: 'add', action: 'Add section', chips: ['⌘K'], keys: ['k'], meta: true, shift: false },
  // Story 5.11 — R-145's second and third keys to arrive with their action: the design ring. SINGLE-KEY, so both
  // carry WCAG 2.1.4's condition by construction (`SINGLE_KEY` is derived below) — inert while a field or a
  // `contenteditable` holds the caret, which is what lets `[` still type a bracket into a headline. `shift: false`
  // for the same reason `L` needs it: `{` and `}` are the shifted characters and are nobody's binding.
  { gesture: 'prev', action: 'Previous design', chips: ['['], keys: ['['], shift: false },
  { gesture: 'next', action: 'Next design', chips: [']'], keys: [']'], shift: false },
  // ⌘D obeys the rules its button obeys: a site-wide section is one shared instance and has no Duplicate at all
  // (FR-D5), which is the caller's rule and not the map's.
  { gesture: 'duplicate', action: 'Duplicate section', chips: ['⌘D'], keys: ['d'], meta: true, shift: false },
  // `Backspace` is the same key on a Mac keyboard, where it is labelled Delete and reports `Backspace`. The chip is
  // what the frame draws; the binding is what the hardware sends. The owner's, R-148 (2026-09-19).
  { gesture: 'remove', action: 'Delete section', chips: ['Del'], keys: ['delete', 'backspace'], shift: false },
  { gesture: 'undo', action: 'Undo', chips: ['⌘Z'], keys: ['z'], meta: true, shift: false },
  { gesture: 'redo', action: 'Redo', chips: ['⇧⌘Z'], keys: ['z'], meta: true, shift: true },
  // ⌘S is claimed in EVERY focus state, the caret included: Save Page As is never what the press meant.
  { gesture: 'save', action: 'Save now', chips: ['⌘S'], keys: ['s'], meta: true },
  ...DEVICES.map((device, n): Binding => ({
    gesture: device.name,
    action: device.label,
    chips: [String(n + 1)],
    keys: [String(n + 1)],
    // Shift is unconstrained, as on `?`: an AZERTY layout types a digit WITH Shift, and `key` already carries the
    // character — ⇧1 on a QWERTY board arrives as `!` and matches nothing (review, 2026-09-19)
  })),
  { gesture: 'layers', action: 'Show or hide Layers', chips: ['L'], keys: ['l'], shift: false },
  // R-135: on a Light-only project there is no sun to press, and the press does nothing and announces nothing. That
  // is the editor's condition, not the map's — the card lists the key because the key exists.
  { gesture: 'dark', action: 'Light and dark', chips: ['.'], keys: ['.'] },
  // NO `keys`: `Esc` is a LADDER, not a gesture — three rungs, each announcing where it landed (EXPERIENCE § the
  // focus model (1)), and it must also reach a field, a picker and a dialog that `shortcutFor`'s guard refuses. Its
  // handler is `editor.tsx`'s `onEscape`, over `escDeselects`; the row is here so the card lists it.
  { gesture: 'deselect', action: 'Deselect', chips: ['Esc'] },
  // Story 5.15 — R-145's fifth key to arrive with its action: B3a's pill and B3b's way back are one toggle. Single-key,
  // so WCAG 2.1.4's focus condition rides on it (`SINGLE_KEY` is derived below) — a `p` typed into a headline, or into
  // the page's own email box in Preview, is a letter. `shift: false` for the same reason `L` needs it. The card's words
  // are `lib/preview.ts`'s, so the pill, this row and the bar read one name (R-170).
  { gesture: 'preview', action: PREVIEW, chips: ['P'], keys: ['p'], shift: false },
  // Story 5.12 — R-145's fourth key to arrive with its action, and the only one that is SHIFTED: `shift: true`, so
  // a bare `r` is a letter and nobody's binding. Single-key, so WCAG 2.1.4's focus condition rides on it by
  // construction (`SINGLE_KEY` is derived below) — which is what lets a capital R still be typed into a headline.
  { gesture: 'remix', action: 'Site Remix', chips: ['⇧R'], keys: ['r'], shift: true },
  { action: 'Ship it', chips: ['⌘⏎'], story: '7.18' },
  // R-147 (owner, 2026-09-19): FR-D11's fourteenth key, and the one key that teaches all the others. `S3
  // Dashboard.dc.html:362` draws it on the account menu's row, and the editor draws no account menu
  // (`shell.tsx:295-297`), so inside the editor it is the card's only door. `?` arrives as `key: '?'` — the layout's
  // own shift is already spent making the character, so Shift is deliberately unconstrained here.
  { gesture: 'shortcuts', action: 'Keyboard shortcuts', chips: ['?'], keys: ['?'] },
]

/** The card's rows: the live bindings, in the map's order. A row with a story is not here, which is R-145 in one
 *  line — the card can never advertise a key that does nothing. */
export const sheetRows = (): readonly Binding[] => KEYMAP.filter((b) => b.story === undefined)

/** The gestures a press reaches WITHOUT a modifier, derived from the table — so the caller can hold the
 *  single-character rules (WCAG 2.1.4, and a menu or dialog owning the key) without a second list of which keys
 *  they are. */
export const SINGLE_KEY: ReadonlySet<Gesture> = new Set(
  KEYMAP.filter((b) => b.meta !== true && b.gesture !== undefined).map((b) => b.gesture as Gesture),
)

/** Story 5.15 — the gestures that act IN PREVIEW: `P` itself, `⌘S`, and the three devices B3b's bar carries, because
 *  checking a behaviour at 390 is the main reason to be in there. Every other binding does nothing while the editing
 *  chrome it drives is hidden. `Esc` is the ladder's (`editor.tsx`'s `onEscape`), never a gesture. */
export const IN_PREVIEW: ReadonlySet<Gesture> = new Set<Gesture>(['preview', 'save', ...DEVICES.map((d) => d.name)])

/** Does this element own the caret — a form field, or anything `contenteditable`? */
/*  ONLY A FIELD WITH TEXT IN IT (Story 5.8's review): a checkbox, a range, a colour well or a `<select>` has no caret
 *  and no undo of its own, and focus RESTS on one after every panel control is used — so counting them made ⌘Z dead
 *  exactly when it is most wanted, straight after changing a control. */
// the date and time kinds too: their segments take digits and Backspace, so `1` must not change the device there
const TEXTUAL = ['', 'text', 'search', 'url', 'email', 'number', 'password', 'tel', 'date', 'time', 'datetime-local', 'month', 'week']
export const holdsCaret = (el: { tagName?: string; type?: string; isContentEditable?: boolean } | null | undefined): boolean =>
  !!el &&
  (el.isContentEditable === true ||
    el.tagName === 'TEXTAREA' ||
    (el.tagName === 'INPUT' && TEXTUAL.includes((el.type ?? '').toLowerCase())))

/** The OTHER half of a single-key press's condition, beside `holdsCaret`: a press something else already owns.
 *  An open dialog or popover owns the key (a Layers `⋯` menu, a picker — the menu owns `]` while it is up), a
 *  `<select>` has type-ahead, a press already handled says so, and a held key is one press, not one per repeat tick.
 *  `editor.tsx`'s `onShortcut` is this rule with ⌘Z's and ⌘S's exceptions beside it; `/controls` binds `[` `]`
 *  through it too (review of Story 5.11, 2026-09-20: that page had the caret half and not this one, so `]` swapped
 *  the design under an open picker). `docs` are every document the overlay could be in — the page's and the frame's. */
export const singleKeyOwned = (
  e: { defaultPrevented: boolean; repeat: boolean },
  focused: readonly ({ tagName?: string } | null | undefined)[],
  docs: readonly ({ querySelector: (s: string) => unknown } | null | undefined)[],
): boolean =>
  e.defaultPrevented ||
  e.repeat ||
  focused.some((el) => el?.tagName === 'SELECT') ||
  docs.some((d) => !!d?.querySelector(':popover-open, dialog[open]'))

/**
 * The gesture a key press is, or null for every other press. `inField` is `holdsCaret` over whatever holds the caret
 * — in the editor document OR in the canvas document, which is why the caller resolves it and this does not.
 *
 * THE GUARD SPLITS ON THE MODIFIER, and that split is R-141's and WCAG 2.1.4's at once. A single-character binding
 * is refused outright while a caret is in a field: typing the word "dark" must never flip the canvas to dark. A
 * ⌘-modified one is refused only where the browser's own gesture is the better owner — ⌘Z, because the browser's
 * undo owns the words being typed and taking it would break Story 5.3's inline editing. ⌘S and ⌘D are claimed in
 * every focus state.
 */
export function shortcutFor(
  e: { key: string; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey?: boolean },
  inField: boolean,
): Gesture | null {
  // Chrome's autofill fires a keydown with no `key` at all
  if (e.altKey === true || typeof e.key !== 'string') return null
  // exactly one of the two, so ⌃⌘Z and a stray AltGr combination are not this gesture
  const cmd = e.metaKey !== e.ctrlKey
  const key = e.key.toLowerCase()
  for (const b of KEYMAP) {
    if (b.gesture === undefined || !b.keys?.includes(key)) continue
    if ((b.meta === true) !== cmd) continue
    if (b.shift !== undefined && b.shift !== e.shiftKey) continue
    if (!inField) return b.gesture
    // In a field: every single-character binding is inert (2.1.4), and of the ⌘ ones only these three give way.
    // `add` is Story 5.10's: ⌘K is ALREADY the link mark with a caret in a field (`lib/inline.ts:230`), and a field
    // that does not permit a link returns there WITHOUT `preventDefault` on purpose, so the key would otherwise fall
    // through to the picker instead of to the browser. The fix belongs in this shared function, never in a caller.
    return b.meta === true && b.gesture !== 'undo' && b.gesture !== 'redo' && b.gesture !== 'add' ? b.gesture : null
  }
  return null
}
