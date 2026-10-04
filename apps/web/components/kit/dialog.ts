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
/* The half BOTH widths share, so a change to the paper, the corner or the shadow cannot land on
   one box and miss the other. Width and padding are each box's own. */
const box = 'max-w-[calc(100vw-20px)] rounded-lg bg-surface shadow-modal'

export const sheetBox = `w-[460px] p-[26px] ${box}`

export const sheet = `m-auto ${sheetBox} flex-col backdrop:bg-scrim open:flex`

/* STORY 3.6's WIDE PANEL — S11e Manage Keys Popup, 900 x 743 (the owner's test finding 2). It is
   the SAME vocabulary at a second width and NOT a second one (R-74): a screen whose content is a
   left column and a context rail cannot be read at 460, and the owner's words were "it is too
   long". NO PADDING HERE — the header, the body and the footer carry their own, because the
   frame's rail runs edge to edge between the two rules. `overflow-hidden` is what keeps the rail's
   tint inside the rounded corner, and the height cap is what makes the BODY scroll instead of the
   page, which is the length complaint answered. */
const panelHeight = 'max-h-[calc(100dvh-40px)] tablet:max-h-[min(743px,calc(100dvh-64px))]'
export const panelBox = `w-[900px] overflow-hidden ${panelHeight} ${box}`

export const panelSheet = `m-auto ${panelBox} flex-col backdrop:bg-scrim open:flex`

/* STORY 6.4 — S7c's EDIT PACK AND S7d's NEW PACK: the frames draw `width:520px; padding:28px` in CSS's default
   CONTENT-BOX model, so the box they show is 576 wide — 520 of content inside 28 of padding (measured on the frame). The
   app is border-box, so this sheet says `box-content`: its computed width is the frame's 520 and the box drawn is the
   frame's 576 (R-236, "exactly"). Its caps leave the same 10px gutter the other sheets leave, padding included. The same
   vocabulary — the paper, the corner, the shadow, the scrim — at the frames' own width (R-74). */
export const wideSheet = 'm-auto box-content max-h-[calc(100dvh-76px)] w-[520px] max-w-[calc(100vw-76px)] flex-col gap-5 overflow-y-auto rounded-lg bg-surface p-[28px] shadow-modal backdrop:bg-scrim open:flex'

/** The wide sheet's title: S7c's 22px at the frame's own line height, a step above the confirm's. */
export const wideTitle = 'font-display text-[22px] font-bold leading-[normal] tracking-[-0.01em] text-ink'

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
