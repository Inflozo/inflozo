/*
 * THE ONE DIALOG VOCABULARY. S12c is the nearest drawn confirm and every modal in the app is
 * extrapolated from it (R-74): a 460px sheet, the display title, Cancel + primary in the footer.
 * These three lived in `project-menu.tsx` and are here because a second card now needs them —
 * imported by both, never copied, so a change to the sheet cannot land on one dialog and miss
 * the other (standing rule 3).
 *
 * A plain module and not a component: what is shared is the vocabulary, not a wrapper. A
 * `<Dialog>` component would have to carry every dialog's differing body, footer and form, and
 * the two callers here have nothing in common below the sheet.
 */

/* `m-auto` IS LOAD-BEARING. The user agent centres a modal `<dialog>` with `inset:0; margin:auto`,
   and Tailwind's Preflight resets `margin:0` on `*` — so every dialog opened flush against the
   top-left corner until this was here (executed, and visible in the D4b screenshot that found it). */
export const sheet =
  'm-auto w-[460px] max-w-[calc(100vw-20px)] flex-col rounded-lg bg-surface p-[26px] shadow-modal backdrop:bg-scrim open:flex'

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
