/* ─────────────────────────────────────────── Story 5.7 — the canvas as a viewport (FR-D8, FR-D14, R-137).
 *
 * THE WHOLE STORY IS TWO NUMBERS AND A TRANSFORM. The canvas iframe's CSS pixel size IS the device's size, so a media
 * query inside it fires at that width and `vh` resolves to that height (`prd.md:569`); the fit below is a
 * `transform: scale()` laid over it and never touches the CSS viewport, so it cannot change which breakpoint applies.
 *
 * R-137 (owner, 2026-09-19): DESKTOP IS A VIEWPORT TOO, and there is one rule for all three. The page card takes the
 * active device's size rather than the room available. Two approved frames disagreed — `S4 Editor.dc.html:63` drew the
 * card filling the height, `B Missing Surfaces.dc.html:740` drew a fixed 1440 × 900 with its chip — and the owner ruled
 * for B11a on the card's GEOMETRY and for S4a on everything else about it (the ground, the ink, the shadow, the 6px
 * radius).
 *
 * EVERY HEIGHT HERE IS READ, NEVER CHOSEN. Desktop 1440 × 900 is B11a's own chip. Tablet 834 × 1112 is the project's
 * own statement of what a tablet is, twice (`D8 Editor Below 1440.dc.html:39`, `EXPERIENCE.md:62`). Mobile 390 × 844
 * is UX-DR17's, verbatim.
 *
 * This file is pure and importless SO THE ARITHMETIC CAN BE TESTED: `node --test` strips types but cannot load a
 * `.tsx` (`kit-button.test.ts`'s note, and the reason every pure test in this repo lives on a `lib/*.ts`). The glyphs,
 * the radio group and the chip are `components/editor/device-switch.tsx`'s. */

export type DeviceName = 'desktop' | 'tablet' | 'mobile'
export type Device = { name: DeviceName; label: string; width: number; height: number }

/** B11a's own chip, `VIEWPORT 1440 × 900` — and `prd.md:66`'s carve-out narrowed to what it should always have been:
 *  900 is a NOMINAL desktop viewport, never this visitor's window. */
export const DESKTOP: Device = { name: 'desktop', label: 'Desktop', width: 1440, height: 900 }
/** `D8 Editor Below 1440.dc.html:39` — `D8a · TABLET · 834 × 1112`, and `EXPERIENCE.md:62` says the same. */
export const TABLET: Device = { name: 'tablet', label: 'Tablet', width: 834, height: 1112 }
/** UX-DR17, verbatim — and B11b draws it. */
export const MOBILE: Device = { name: 'mobile', label: 'Mobile', width: 390, height: 844 }

/** S4a's device track, left to right (`S4 Editor.dc.html:36-40`). Desktop leads: it is the resting state. */
export const DEVICES: readonly Device[] = [DESKTOP, TABLET, MOBILE]

/** THE ONE SCALE IN THE EDITOR, and nothing sets it (UX-DR17, UX-DR20: B11's drawn "Fit / 55%" picker is not built).
 *  Fitted to BOTH axes — a width-only fit would put a 1112px tablet off the bottom of the stage — and CAPPED AT 1,
 *  because `min()` without the cap magnifies a 390-wide viewport 3.7× to fill a 1440 stage and lies about size in the
 *  opposite direction. A stage measured at 0 (folded away, or before the first `ResizeObserver` callback) has no
 *  answer yet: 1 rather than Infinity. */
export const fitFor = (stage: { width: number; height: number }, device: Device) =>
  stage.width > 0 && stage.height > 0 ? Math.min(1, stage.width / device.width, stage.height / device.height) : 1

/** UX-DR17's words, in this order on purpose: the TRUE SIZE first and the shrinking second, because a scaled canvas is
 *  otherwise a lie about size. The chip draws them uppercased in CSS (`B Missing Surfaces.dc.html:740`), so the
 *  accessible string stays this sentence. */
export const viewportWords = (device: Device, fit: number) =>
  `viewport ${device.width} × ${device.height} · shown at ${Math.round(fit * 100)}%`

/** What the editor's one live region says once the device has changed — the device NOW SHOWING and its real size,
 *  never the press. `modeShown`'s shape, and announced through the same `#editor-said`. */
export const deviceShown = (device: Device) => `${device.label} — ${device.width} × ${device.height}`
