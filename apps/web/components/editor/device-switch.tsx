'use client'

import { ring } from '@/components/kit/greyed'
import { DeviceDesktop, DeviceMobile, DeviceTablet } from '@/components/kit/icons'
import { choices, radioKeys, tabStop } from '@/components/kit/segmented'
import { DEVICES, viewportWords, type Device, type DeviceName } from '@/lib/device'

/* S4a's DEVICE TRACK and B11's VIEWPORT CHIP — the two things Story 5.7 draws, and between them they are the whole of
   the story's chrome. The table, the fit and the chip's words are `lib/device.ts`'s, which is importless so
   `editor.test.ts` can reach the arithmetic (`node --test` cannot load a `.tsx`).

   THE TRACK IS A RADIO GROUP, not three buttons: one Tab stop, the arrows move the choice, exactly as the Kit's
   `Segmented` and its swatch row do — `radioKeys` and `tabStop` are THEIRS, reused rather than written again, so every
   radio group in the app answers the arrows the same way. The Kit's `Segmented` itself is a labelled sidebar control
   with words in it and is the wrong shape for a 28px icon track, which is why this is its own component.

   IT CARRIES ITS WORDS AS AN ACCESSIBLE NAME AND A HOVER TITLE, like the sun beside it (R-136's carve-out,
   `DESIGN.md:534-536`): a 48px bar holding View as, the sun, three devices, undo/redo and Ship it cannot hold three
   more words. `onMouseDown` prevented for the same reason `ModeToggle` prevents it — the press never takes focus out
   of the canvas, so a caret in a text prop survives the change.

   NO ZOOM CONTROL, EVER (UX-DR17, UX-DR20, FR-D14). B11 drew a "Fit / 55%" picker and the correction pass deleted it:
   a second knob that changes only apparent size invites people to mistake it for the first. The chip REPORTS and
   nothing sets. */

const GLYPH: Record<DeviceName, typeof DeviceDesktop> = { desktop: DeviceDesktop, tablet: DeviceTablet, mobile: DeviceMobile }

export function DeviceSwitch({ device, onDevice }: { device: Device; onDevice: (next: Device) => void }) {
  const list = choices(DEVICES.map((d) => ({ value: d.name, label: d.label })))
  const stop = tabStop(list, device.name)
  const pick = (value: string) => {
    const next = DEVICES.find((d) => d.name === value)
    if (next) onDevice(next)
  }
  return (
    // the frame's pill fill is the value the token layer calls `paper-sunk` and its radius is `radius-sm`, both exact
    // (`S4 Editor.dc.html:36`) — no hex is written here, which `tokens.test.ts` enforces across `apps/web`
    <div
      id="editor-device"
      role="radiogroup"
      aria-label="Device"
      className="flex rounded-sm bg-paper-sunk p-[2px]"
      onKeyDown={(event) => radioKeys(event, list, pick)}
    >
      {DEVICES.map((d, i) => {
        const on = d.name === device.name
        const Glyph = GLYPH[d.name]
        return (
          <button
            key={d.name}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={d.label}
            title={d.label}
            data-device={d.name}
            tabIndex={i === stop ? 0 : -1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onDevice(d)}
            // the frame's active segment: `surface` under the house `shadow-sm`, which is the very shadow it draws
            className={`inline-flex h-[26px] w-7 items-center justify-center rounded-[6px] ${ring} ${on ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft'}`}
          >
            <Glyph size={14} />
          </button>
        )
      })}
    </div>
  )
}

/** B11's mono chip (`B Missing Surfaces.dc.html:740`), over the canvas ground. It reports and nothing sets it, and it
 *  re-reads whenever the stage does — a fold, a window resize, a device change.
 *
 *  **R-138 (owner, 2026-09-19): 4px / 4px, not the frame's 9px / 12px** — the chip is pinned to the stage's corner
 *  while the PAGE CARD moves, so a tall card rises to meet it: measured on the deployed editor at 1440 × 900, Tablet
 *  put the card's top edge 5px UNDER the chip, and Desktop with both panels folded left a 4px gap the card's shadow
 *  bled across. Tucking it into the corner is half the remedy and `editor.tsx`'s top padding is the other half — the
 *  card can no longer reach it on ANY device, which is the invariant the harness asserts rather than these numbers.
 *
 *  TWO VALUES ARE ROUNDED TO THE NEAREST TOKEN, and the rounding is named here as Story 3.8 named its own, because
 *  `tokens.test.ts` forbids a colour literal anywhere under `apps/web`: the chip's own fill is drawn as `paper`, one
 *  step lighter than the frame's, and its hairline as `line-strong`, one step darker. THE INK AND THE RADIUS ARE NOT
 *  ROUNDED — the frame's ink is exactly `ink-soft-aa` and its 24px corner is exactly `radius-pill`. */
export function ViewportChip({ device, fit }: { device: Device; fit: number }) {
  return (
    <span
      id="editor-viewport"
      // pointer-events-none on purpose: a press here lands on the ground `<section>` itself, so R-123's deselect still
      // reads `e.target === e.currentTarget` and the chip is not a fourth ground of its own
      className="pointer-events-none absolute left-1 top-1 rounded-pill border border-line-strong bg-paper px-2 py-[2px] font-mono text-[9.5px] uppercase text-ink-soft-aa"
    >
      {viewportWords(device, fit)}
    </span>
  )
}
