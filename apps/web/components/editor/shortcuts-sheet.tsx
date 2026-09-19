'use client'

import type { RefObject } from 'react'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { sheetRows } from '@/lib/keymap'

/* ─────────────────────────────────────────── Story 5.9 — the `?` card (R-147).
 *
 * THE SHEET ITSELF HAS NO FRAME and is extrapolated from the two that do (R-74): the app's ONE dialog vocabulary
 * (`kit/dialog.ts` — a 460px sheet, the display title, `openOnCancel`) wrapped around `Editor Sidebar
 * Kit.dc.html:274-280`'s shortcut rows, read verbatim — the action at 12.5px/500 on the left and its keys as mono
 * chips on the right (11px, ink-soft, 1px line, 5px radius, `1px 6px`, surface), `8px 0` padding, a hairline between
 * and none under the last. `reconcile-designs-decisions.md` records the gap the same way R-133's two surfaces were.
 *
 * ITS ROWS ARE `sheetRows()` AND NOTHING ELSE (R-145): the card lists exactly the keys that work, because it and the
 * key handler are two readers of one table. A key whose action has not been built is absent from both — never
 * greyed, never captioned.
 *
 * `Esc`, the focus trap and the RETURN OF FOCUS to whatever opened it are the platform's, which is what `showModal()`
 * buys; `openOnCancel` puts the opening focus on Close, as every dialog in the app does.
 */
export function ShortcutsSheet({ dialog }: { dialog: RefObject<HTMLDialogElement | null> }) {
  const rows = sheetRows()
  return (
    <dialog
      ref={dialog}
      // NO id: the shell renders the account menu TWICE (the sidebar's at 1440 and the drawer's at 390, each hidden
      // at the other width), so an id here would be a duplicate in the document. The harness and the deployed walk
      // find it by this attribute, and the title is the accessible name through `aria-label`.
      data-shortcuts-sheet
      onClick={closeOnBackdrop}
      aria-label="Keyboard shortcuts"
      className={`${sheet} gap-[18px]`}
    >
      <h2 className={title}>
        Keyboard shortcuts
      </h2>
      <div className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.action}
            data-shortcut-row={row.action}
            className="flex items-center justify-between gap-4 border-b border-line py-2 last:border-b-0"
          >
            <span className="text-[12.5px] font-medium">{row.action}</span>
            <span className="flex shrink-0 gap-1">
              {row.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[5px] border border-line bg-surface px-[6px] py-px font-mono text-helper-caption text-ink-soft"
                >
                  {chip}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="secondary" size={36} data-cancel onClick={() => dialog.current?.close()}>
          Close
        </Button>
      </div>
    </dialog>
  )
}

/** One door for every opener — the editor's `?` and the account menu's row — so the two can never open it two ways. */
export const openShortcuts = (dialog: RefObject<HTMLDialogElement | null>) => openOnCancel(dialog.current)
