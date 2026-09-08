'use client'

import { useRef, useState } from 'react'
import { closeOnBackdrop } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { X } from '@/components/kit/icons'
import { CONNECT_SITE_DIALOG, type Step } from '@/lib/connect-rule'
import { ConnectWizard } from './connect-wizard'

/* ───────── S11 Sites.dc.html — S11b (:131-155), the sheet behind S11a's "Connect site" (:57).

   THE OPENER IS IN THE SHELL AND THE SHEET IS HERE, which is exactly how the dashboard's New
   project sheet is built (`shell.tsx`'s button, `new-project-sheet.tsx`'s dialog): the top bar
   lives in the layout and the page owns what the button opens, so the DOM id in
   `CONNECT_SITE_DIALOG` is the only thing the two share. The owner's finding 5 put the button in
   that bar; before it, opener and sheet were one component on the page.

   THE OPENER IS A LINK, AND THAT IS THE WHOLE JAVASCRIPT-OFF STORY. `<a href="/sites/connect">`
   goes to the full-page pair when nothing intercepts it; with JavaScript the click opens this
   sheet instead, so there is one control with one destination rather than a button that does
   nothing without a script.

   THE SHEET IS 520 WIDE and its own box rather than `kit/dialog.ts`'s 460 `sheet` — the frame
   draws 520 and 28px padding, and `new-project-sheet.tsx` set the precedent for a dialog whose
   width is its frame's. What IS shared is the behaviour: `openOnCancel` (the opener's, in the
   shell) and `closeOnBackdrop`. Its height is now the same at both steps (`connect-wizard.tsx`),
   so it is capped against the viewport rather than left to grow past a short one.

   Escape, Cancel, ✕ and the backdrop all close it with NOTHING SENT: the wizard's own form is the
   only thing that posts. EVERY OPEN IS A FRESH WIZARD — `key={opens}`, bumped as the sheet
   closes, so a reopened sheet starts at the handshake with no last-attempt banner, field error or
   typed key in it (the sibling sheet's finding, review 2026-09-05; here, review 2026-09-08). A
   SUCCESSFUL connect closes it from the outside: the action redirects to `/sites`, the page
   re-renders with one more card, and `sites/page.tsx` keys this component on the number of cards,
   so the open sheet is unmounted rather than left standing over the list with the keys still in
   it (review, 2026-09-08). */

export function ConnectSiteDialog() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<Step>('integration')
  const [opens, setOpens] = useState(0)

  const close = () => dialog.current?.close()

  return (
    <dialog
      ref={dialog}
      id={CONNECT_SITE_DIALOG}
      aria-labelledby="connect-site-title"
      onClick={closeOnBackdrop}
      onClose={() => {
        setStep('integration')
        setOpens((n) => n + 1)
      }}
      // `m-auto`: Preflight resets the user agent's centring margin — see kit/dialog.ts.
      className="m-auto max-h-[calc(100dvh-20px)] w-[520px] max-w-[calc(100vw-20px)] flex-col gap-5 overflow-y-auto rounded-lg bg-surface p-[28px] shadow-modal backdrop:bg-scrim open:flex"
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
  )
}
