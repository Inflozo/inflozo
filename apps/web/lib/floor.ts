/* ─────────────────────────────────────────── Story 5.22 — the editor's responsive floor (FR-D1, UX-DR16, D4f, D8).
 *
 * TWO RULES, ONE SOURCE EACH. `PHONE` decides whether a device gets the editor at all and `COMPACT` which of the
 * editor's two shapes it gets. `globals.css`'s `phone` and `compact` custom variants carry the SAME media text, because
 * CSS cannot import this file, and `tokens.test.ts` holds the two equal.
 *
 * R-76 (owner, 2026-09-03): a phone is offered a designed notice instead of the editor, and it is a DEVICE test, never
 * a width test — a desktop at 200% browser zoom is about 720 wide and keeps the editor (WCAG 1.4.4). R-87 (2026-09-04)
 * drew the line at an 834 width; R-201 (2026-09-27) moved it to the SHORTER side under 500px, because 834 sent most
 * tablets held upright to the notice and many phones held sideways to the editor (Playwright's device list: every phone's
 * short side is at most 484, every tablet's at least 600). It is asked ONCE, as a project opens (`editor.tsx`'s gate):
 * turning the device must never swap the editor out mid-edit.
 *
 * R-202 (2026-09-27): D8's one rearrangement — the Layers icon rail, the Controls overlay, the bar's cluster in one ⋯
 * menu — applies below 1280px on a fine pointer, and at ANY width on a touch screen that is not a phone. It is asked
 * LIVE, because changing the layout remounts nothing.
 *
 * Pure and importless, like `lib/device.ts`, so `node --test` reaches the predicates (`editor.test.ts`). */

/** R-201's number: a touch screen whose shorter side is under this is a phone. */
const PHONE_SHORT_SIDE = 500
/** R-202's number: a fine-pointer window narrower than this takes D8's rearrangement. */
const COMPACT_BELOW = 1280

/** A phone — for `matchMedia`, asked once. A coarse pointer in BOTH branches: never a bare width (R-76). */
export const PHONE = `(pointer: coarse) and (width < ${PHONE_SHORT_SIDE}px), (pointer: coarse) and (height < ${PHONE_SHORT_SIDE}px)`

/** D8's rearrangement — for `matchMedia`, asked live. Every touch screen that reaches the editor, and a narrow window. */
export const COMPACT = `(pointer: coarse), (width < ${COMPACT_BELOW}px)`

/** `PHONE`, as arithmetic: portrait and landscape are the same device. */
export const isPhone = ({ coarse, width, height }: { coarse: boolean; width: number; height: number }) =>
  coarse && Math.min(width, height) < PHONE_SHORT_SIDE

/** `COMPACT`, as arithmetic: a touch screen always, a fine pointer below the line. */
export const isCompact = ({ coarse, width }: { coarse: boolean; width: number }) => coarse || width < COMPACT_BELOW
