/*
 * THE ONE DIALOG VOCABULARY. S12c is the nearest drawn confirm and every modal in the app is
 * extrapolated from it (R-74): a 460px sheet, the display title, Cancel + primary in the footer.
 * These three lived in `project-menu.tsx` and are here because a second card now needs them —
 * imported by both, never copied, so a change to the sheet cannot land on one dialog and miss
 * the other (propagate, never localise).
 *
 * A plain module and not a component: what is shared is the vocabulary, not a wrapper. A
 * `<Dialog>` component would have to carry every dialog's differing body, footer and form, and
 * the two callers here have nothing in common below the sheet.
 */

/* `m-auto` IS LOAD-BEARING. The user agent centres a modal `<dialog>` with `inset:0; margin:auto`,
   and Tailwind's Preflight resets `margin:0` on `*` — so every dialog opened flush against the
   top-left corner until this was here (executed, and visible in the D4b screenshot that found it). */
/* THE BOX ITSELF, WITHOUT THE DIALOG. A confirm that appears BOTH in a `<dialog>` and on its own
   route — Story 3.5's disconnect is the first — cannot reuse `sheet`, because `open:flex` and
   `backdrop:` mean nothing on a plain element and `open:flex` would leave the page's box with no
   `display` at all. So the shared half is named once and the two callers add what is theirs. The
   review of 2026-09-09 found the page had hand-copied these tokens and ALREADY diverged
   (`max-w-full` against the `calc` below), which is the drift this file exists to prevent. */
export const sheetBox =
  'w-[460px] max-w-[calc(100vw-20px)] rounded-lg bg-surface p-[26px] shadow-modal'

export const sheet = `m-auto ${sheetBox} flex-col backdrop:bg-scrim open:flex`

export const title = 'font-display text-[20px] font-bold tracking-[-0.01em] text-ink'

/**
 * EVERY CONFIRM OPENS WITH FOCUS ON CANCEL (EXPERIENCE.md § Destructive confirms), and the
 * `autoFocus` prop alone does not do it: React applies it once at mount and does not leave the
 * `autofocus` ATTRIBUTE in the DOM, so `showModal()` — which looks for that attribute — fell
 * through to the first focusable control instead. Executed: the rename dialog opened on its name
 * field. So the cancelling control says which one it is with `data-cancel` and the dialog is
 * told, every time.
 */
export function openOnCancel(dialog: HTMLDialogElement | null) {
  if (!dialog) return
  dialog.showModal()
  dialog.querySelector<HTMLElement>('[data-cancel]')?.focus()
}

/**
 * A CLICK ON THE BACKDROP CLOSES THE DIALOG — the matrices promise "Cancel / Escape / backdrop"
 * and a native modal `<dialog>` does the first two on its own but not the third. The `::backdrop`
 * is the dialog element itself as far as events go, so the test is GEOMETRY, not `target`: a click
 * whose point lies outside the sheet's box is a click on the backdrop. Testing `target ===
 * currentTarget` would also close on the sheet's own 26px padding, which is not what anyone meant.
 * Goes on the `<dialog>` as `onClick`; `closedby="any"` would do it natively but is not yet in
 * every browser the product supports (review, 2026-09-07).
 *
 * BUT THE TARGET IS CHECKED FIRST: a click activated from the KEYBOARD — Enter in the field (the
 * form's implicit submission fires a click on the default button), Space on Save — arrives with
 * `clientX = clientY = 0`, which the geometry alone reads as "outside the sheet", and the dialog
 * closed on the very submit it was meant to show the result of. Executed in Chromium (second
 * review, 2026-09-07: `target=save x=0 y=0 detail=0`). Only a click whose target is the `<dialog>`
 * itself can be the backdrop; a click on anything inside it is never one.
 */
export function closeOnBackdrop(event: {
  clientX: number
  clientY: number
  target: EventTarget | null
  currentTarget: HTMLDialogElement
}) {
  if (event.target !== event.currentTarget) return
  const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect()
  const { clientX: x, clientY: y } = event
  if (x < left || x > right || y < top || y > bottom) event.currentTarget.close()
}
