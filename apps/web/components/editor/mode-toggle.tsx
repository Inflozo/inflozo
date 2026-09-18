'use client'

import type { Mode } from '@inflozo/section-runtime'
import { ring } from '@/components/kit/greyed'
import { Moon, Sun } from '@/components/kit/icons'

/* S4a's MODE CONTROL (`S4 Editor.dc.html:35`), as R-132 completes it — ONE button that swaps its glyph.

   The frame draws a bare sun: 28×28, an 8px radius (`rounded-sm`), a 15px glyph in the value the token layer calls
   `ink-soft`, hovering to the one it calls `paper-sunk`. It draws no dark state, no words and no accessible name, which is
   why Question 2 existed. The owner ruled one button (2026-09-18): the export's `Sun` while light, the Kit's own
   `Moon` while dark — S4a COMPLETED, not superseded, because the drawn sun is the light state.

   IT CARRIES ITS WORDS AS AN ACCESSIBLE NAME, AND THE NAME IS THE DESTINATION. UX-DR8 wants a shape to carry a
   visible word; `DESIGN.md:534-536` grants an accessible label "where the layout genuinely cannot hold one", which a
   48px bar with View as, the device switch, undo/redo and Ship it still to land in it is. `aria-pressed` says which
   state it is in; the mode now SHOWING is announced politely through the editor's one live region (`#editor-said`),
   not a second one of this control's own — the same region a completed move reads out through (UX-DR12).

   ABSENT, NEVER GREYED, on a Light-only project: `editor.tsx` does not render this at all (UX-DR3, R-118, R-128).
   Nothing here knows about `dark_enabled`, so there is no disabled state to get wrong. */

/** What the live region says once the flip has landed — the mode NOW SHOWING, never the press. */
export const modeShown = (mode: Mode) => (mode === 'dark' ? 'Dark mode' : 'Light mode')

export function ModeToggle({ mode, onMode }: { mode: Mode; onMode: (next: Mode) => void }) {
  const dark = mode === 'dark'
  // the DESTINATION, not the state: "Preview dark mode" is what pressing it does (R-132)
  const label = dark ? 'Back to light mode' : 'Preview dark mode'
  return (
    <button
      id="editor-mode"
      type="button"
      aria-label={label}
      aria-pressed={dark}
      title={label}
      onClick={() => onMode(dark ? 'light' : 'dark')}
      className={`inline-flex size-7 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk ${ring}`}
    >
      {dark ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  )
}
