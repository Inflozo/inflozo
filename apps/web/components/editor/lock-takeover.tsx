'use client'

import type { RefObject } from 'react'
import { Button } from '@/components/kit/button'
import { BusyLabel } from '@/components/kit/submit'
import { closeOnBackdrop } from '@/components/kit/dialog'
import { LOCK_COPY } from '@/lib/lock'

/* B5c · TAKEOVER WITH UNSYNCED EDITS (`B Missing Surfaces.dc.html:1516-1538`).
 *
 * THE FRAME, AS DRAWN: 440 wide, radius 16, no padding on the box itself — the head block (20/22/14), the inset
 * danger panel (22px each side, `danger-tint`, 10 radius) and the footer (16/22/20) carry their own, which is why
 * this is `sheetBox`'s vocabulary at the frame's own width rather than `sheet` itself.
 *
 * ITS SHADOW IS THE APP'S MODAL SHADOW AND NOT THE FRAME'S, deliberately. B5c draws `lg` (.14) and `kit/dialog.ts`
 * carries the finding that "every modal and sheet in the export sits at .25, not lg's .14 — D4a, D4b and S12c all
 * draw it": this frame is the exception to a generalisation the app has already standardised on, and a confirm that
 * cast a different shadow from every other confirm would read as a different KIND of thing. One dialog vocabulary
 * (R-74's own extrapolation rule) beats one frame's value here.
 *
 * IT OPENS WITH FOCUS ON THE CANCELLING ACTION (UX-DR14, R-115, D8f). `openOnCancel` already does exactly this and
 * is not reimplemented here; **Wait** carries `data-cancel`, which is how it finds it. `autoFocus` alone does not
 * work — React applies it once and leaves no attribute for `showModal()` to find (executed, `kit/dialog.ts`).
 *
 * IT NEVER ITEMISES THE LOSS. The frame drew "Home hero — design and two controls · Footer — three link labels"
 * until the A9 correction pass of 2026-09-04, and **that detail does not exist and cannot**: the heartbeat carries
 * one number and the requester's browser has never seen the other session's journal (`EXPERIENCE.md:1042-1051`).
 *
 * THE WHOLE DANGER PANEL IS ABSENT WHEN NOTHING IS OWED — absent, not zeroed (UX-DR3). A confirm that warns in red
 * about nothing is not a warning; the take-over is still asked about, because it still ends another session.
 *
 * NOBODY IS NAMED (**R-189**): "Take over from Rosa?" is "Take over from your other session?", the body's "She has
 * edits" is "It has edits", the panel's "only in Rosa's browser" is "only in that session", and **"Or message Rosa"
 * does not exist** — there is nobody to message.
 *
 * ITS STRINGS ARE PROPS, AND THAT IS THE WHOLE OF WHAT THIS STORY OWES D8g (DW-238). Story 7.18 renders *"Take over
 * to ship?"* through this component and Story 7.26 does the same for export — one component, one vocabulary, and
 * the gate itself belongs where deploy and export are written.
 */
export function LockTakeover({
  dialog,
  heading = LOCK_COPY.takeoverTitle,
  body,
  /** AD-16's count for the OTHER session, read off its last heartbeat. 0 makes the danger panel absent. */
  owed,
  confirm = LOCK_COPY.takeOver,
  confirmBusy = LOCK_COPY.takingOver,
  taking,
  onConfirm,
}: {
  dialog: RefObject<HTMLDialogElement | null>
  heading?: string
  body: string
  owed: number
  confirm?: string
  confirmBusy?: string
  taking: boolean
  onConfirm: () => void
}) {
  return (
    <dialog
      ref={dialog}
      onClick={closeOnBackdrop}
      aria-labelledby="editor-takeover-title"
      aria-describedby="editor-takeover-body"
      className="m-auto w-[440px] max-w-[calc(100vw-20px)] flex-col overflow-hidden rounded-lg bg-surface shadow-modal backdrop:bg-scrim open:flex"
    >
      <div className="flex flex-col gap-2 px-[22px] pb-[14px] pt-5">
        <h2 id="editor-takeover-title" className="m-0 font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
          {heading}
        </h2>
        <p id="editor-takeover-body" className="text-ui-dense leading-[1.6] text-ink-soft-aa">
          {body}
        </p>
      </div>
      {owed > 0 ? (
        <div className="mx-[22px] flex flex-col gap-[7px] rounded-thumb bg-danger-tint px-[13px] py-3">
          <span className="text-control-label font-semibold text-danger-panel-ink">{LOCK_COPY.willBeLost(owed)}</span>
          {/* the frame's own second sentence, kept exactly — only the name left it */}
          <span className="text-helper-caption leading-[1.5] text-danger-panel-ink">{LOCK_COPY.lossIsFinal}</span>
        </div>
      ) : null}
      {/* the frame puts the danger fill FIRST and the way out second, and the focus still opens on the way out —
          the two are independent, and R-115 is about focus, not order */}
      <div className="flex items-center gap-[9px] px-[22px] pb-5 pt-4">
        <Button
          id="editor-takeover-confirm"
          // nothing is being lost when nothing is owed, so the confirm is not a danger FILL either (UX-DR3's
          // argument applied to the button the absent panel belongs to)
          variant={owed > 0 ? 'danger' : 'primary'}
          size={36}
          aria-disabled={taking || undefined}
          aria-busy={taking || undefined}
          onClick={taking ? undefined : onConfirm}
        >
          <BusyLabel pending={taking} busy={confirmBusy}>
            {confirm}
          </BusyLabel>
        </Button>
        <Button type="button" variant="secondary" size={36} data-cancel onClick={() => dialog.current?.close()}>
          {LOCK_COPY.wait}
        </Button>
      </div>
    </dialog>
  )
}
