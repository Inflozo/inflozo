'use client'

import { useRef, useState, type MouseEvent } from 'react'
import { closeOnBackdrop, openOnCancel } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { Plus, X } from '@/components/kit/icons'
import { type Step } from '@/lib/connect-rule'
import { ConnectWizard } from './connect-wizard'

/* ───────── S11 Sites.dc.html — S11a's "Connect site" button (:57) and S11b behind it (:131-155).

   THE OPENER IS A LINK, AND THAT IS THE WHOLE JAVASCRIPT-OFF STORY. `<a href="/sites/connect">`
   goes to the full-page pair when nothing intercepts it; with JavaScript the click opens the sheet
   instead, so there is one control with one destination rather than a button that does nothing
   without a script.

   THE SHEET IS 520 WIDE and its own box rather than `kit/dialog.ts`'s 460 `sheet` — the frame draws
   520 and 28px padding, and `new-project-sheet.tsx` set the precedent for a dialog whose width is
   its frame's. What IS shared is the behaviour: `openOnCancel` (every confirm opens with focus on
   the way out) and `closeOnBackdrop` (a native `<dialog>` does Escape and Cancel, not the backdrop).

   Escape, Cancel, ✕ and the backdrop all close it with NOTHING SENT: the wizard's own form is the
   only thing that posts. EVERY OPEN IS A FRESH WIZARD — `key={opens}` remounts it, so a reopened
   sheet starts at the handshake with no last-attempt banner, field error or typed key in it (the
   sibling sheet's finding, review 2026-09-05; here, review 2026-09-08). A SUCCESSFUL connect closes
   it from the outside: the action redirects to `/sites`, the page re-renders with one more card,
   and `sites/page.tsx` keys this component on the number of cards, so the open sheet is unmounted
   rather than left standing over the list with the keys still in it (review, 2026-09-08). */

export function ConnectSiteButton() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<Step>('integration')
  const [opens, setOpens] = useState(0)

  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    // A modified click is the user asking for a new tab, and the full page is what should open.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    setStep('integration')
    setOpens((n) => n + 1)
    openOnCancel(dialog.current)
  }

  const close = () => dialog.current?.close()

  return (
    <>
      {/* ONE element and therefore ONE dialog. Drawn full width at 390 — where the frame puts the
          action first — and as S11a's 36px coral button from `tablet` up; two instances behind a
          breakpoint would put two dialogs carrying the same id into the same document. */}
      <a
        href="/sites/connect"
        onClick={open}
        className={`inline-flex h-12 w-full items-center justify-center gap-[7px] rounded bg-coral-text text-[15px] font-semibold text-surface transition-colors hover:bg-coral-text-hover tablet:h-9 tablet:w-auto tablet:px-4 tablet:text-ui-dense ${ring}`}
      >
        <Plus size={14} />
        Connect site
      </a>
      <dialog
        ref={dialog}
        aria-labelledby="connect-site-title"
        onClick={closeOnBackdrop}
        onClose={() => setStep('integration')}
        // `m-auto`: Preflight resets the user agent's centring margin — see kit/dialog.ts.
        className="m-auto w-[520px] max-w-[calc(100vw-20px)] flex-col gap-5 rounded-lg bg-surface p-[28px] shadow-modal backdrop:bg-scrim open:flex"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="connect-site-title" className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
              Connect your Ghost site
            </h2>
            <p className="text-ui-dense text-ink-soft">Same quick handshake as onboarding.</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className={`mt-1 shrink-0 text-ink-soft transition-colors hover:text-ink ${ring}`}
          >
            <X size={16} />
          </button>
        </div>
        <ConnectWizard key={opens} variant="dialog" step={step} onStep={setStep} onCancel={close} />
      </dialog>
    </>
  )
}
