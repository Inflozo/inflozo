/* ─────────────────────────────────────────── Story 5.15 — Preview's words (FR-D20, B3a · B3b, R-170).
 *
 * ONE NAME, WRITTEN ONCE (R-170): the pill, the `?` card's row, the floating bar's name and the announcement all read
 * `PREVIEW`, and the way back is `BACK` on the bar's button and in its announcement. "Preview dark mode" (the sun's
 * name) and "Preview as" (View as's heading) use the verb for other things, and they stay.
 *
 * IMPORTLESS ON PURPOSE, like `lib/device.ts`: `lib/keymap.ts` reads `PREVIEW` for the card's row and must stay
 * reachable by `node --test`, which strips types but cannot load a `.tsx`. */

/** The mode's one name — B3a's pill, the card's row and B3b's bar. */
export const PREVIEW = 'Preview'
/** B3b's way back. */
export const BACK = 'Back to editing'
/** B3a's chip, drawn in literal capitals. */
export const PAUSED = 'PAUSED'
/** DW-229 (Story 5.24e): what the chip MEANS, said to a screen reader — the chip is `aria-hidden` chrome, so a selected
 *  section holding a part still had nothing it could hear. In 5.24a's words (its routine call 6), led by the chip's own. */
export const PAUSED_SAID = `${PAUSED} — this part moves by itself on your site; it holds still while you design, and Preview runs it`
/** What `#editor-said` says on the way in, and how to leave. */
export const PREVIEW_SAID = 'Preview. Press Escape or P to come back.'
/** What `#editor-said` says on the way out. */
export const BACK_SAID = 'Back to editing.'
