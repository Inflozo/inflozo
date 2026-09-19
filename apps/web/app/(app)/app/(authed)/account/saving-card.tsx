'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { Refresh } from '@/components/kit/icons'
import { setAutosave, type ActionResult } from './actions'

/* S12 Billing.dc.html — S12a's RIGHT COLUMN. THE FRAME DRAWS NO SAVING SURFACE, so this card is extrapolated from
   the drawn ones beside it exactly as `sessions-card.tsx` was (R-74): the Email card's shell (`:74-82`), its row and
   its 30px button, written in the same class strings, with a switch in place of the button where the setting is a
   state rather than an act. Label, glyph, sentence and dialog words are FR-D10's; everything they are drawn with is
   the frame's. `EXPERIENCE.md:702` is what puts it on this screen and not in the editor.

   THE SWITCH IS THE ROW'S CONTROL AND THE FORM'S FIELD AT ONCE. It is a `<button role="switch">` inside a `<form>`,
   as the Kit's `Toggle` is — but it posts rather than merely reporting, so its press submits with the value it is
   moving TO. That value rides in a hidden input rather than in a closure, so the action's `(previous, formData)`
   shape is the same one every other action on this screen takes.

   TURNING IT OFF ASKS FIRST, AND THAT IS THE WHOLE REASON THIS IS A CLIENT COMPONENT. It is the one toggle in the
   product that REMOVES a protection, and the warning has to be read BEFORE the protection goes — so it uses the
   app's one dialog vocabulary (`kit/dialog.ts`, 460px, opening on Cancel, R-115 / UX-DR14) rather than a banner
   that appears after the fact. TURNING IT BACK ON ASKS NOTHING: it is the restoring half, exactly as SHOWING a
   hidden site-wide section asks nothing.

   WHAT IT COSTS IS SAID EXACTLY, because AD-15 makes it exact: the 3-minute TIMER alone stops. Closing the tab still
   sends, and ⌘S still sends. The dialog says that and does not imply the work stops being kept.

   THE SWITCH SHOWS THE STATE IN FORCE, never the state the user last pressed: `useActionState` holds the answer, and
   a refusal leaves the switch where the server still has it and says so in the Banner beside it (the shape
   `theme-settings.tsx` uses for the same reason). */

export function SavingCard({ autosave }: { autosave: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [answered, saveAction, saving] = useActionState<ActionResult | null, FormData>(setAutosave, null)
  /** what the user has asked for, once the server has said yes — the row is otherwise the server's own value */
  const [shown, setShown] = useState(autosave)
  const wanted = useRef(autosave)

  // `sessions-card.tsx:75-85`, both halves and for both reasons: React queues form actions, so a held Enter or a
  // double click sends two; and a result the dialog was closed on is spent, or the next open starts with the last
  // attempt's sentence still on screen.
  const submitting = useRef(false)
  useEffect(() => {
    if (!saving) submitting.current = false
  }, [saving])
  useEffect(() => {
    // the switch follows the SERVER: it moves on `ok` and stays where it was on a refusal
    if (answered && 'ok' in answered) setShown(wanted.current)
  }, [answered])

  const failure = answered && 'error' in answered ? answered.error.message : null

  const once = (event: { preventDefault: () => void }) => {
    if (submitting.current) {
      event.preventDefault()
      return
    }
    submitting.current = true
  }

  /** The press. ON submits at once; OFF opens the dialog, whose confirm submits the same form value. */
  const ask = (next: boolean) => {
    wanted.current = next
    if (!next) requestAnimationFrame(() => openOnCancel(dialog.current))
  }

  return (
    <section className="flex flex-col gap-[14px] rounded-lg border border-line bg-surface p-[20px_24px] shadow-sm">
      <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft">Saving</h2>

      <div className="flex items-center gap-3 py-[2px]">
        <span className="shrink-0 text-ink-soft">
          <Refresh size={16} />
        </span>
        <span className="flex min-w-0 flex-col gap-px">
          <span id="autosave-label" className="text-ui-dense font-medium text-ink">
            Send my work to the cloud automatically
          </span>
          {/* DERIVED FROM NOTHING AND CLAIMING NOTHING PRECISE: the interval is `lib/journal.ts`'s `FLUSH_MS` and is a
              default with rationale rather than a promise, so the sentence says "every few minutes" and stays true
              if the Architect ever moves it (standing rule 4 applied to a sentence). */}
          <span className="text-helper-caption text-ink-soft">
            Your work is always kept on this device. With this on, it is also sent to the cloud every few minutes.
          </span>
        </span>

        {/* The switch and its form. Not progressive enhancement in the OFF direction — the dialog only opens through
            `showModal()` — but the ON direction is a plain submit and works with scripts off. */}
        <form
          action={saveAction}
          onSubmit={once}
          className="ml-auto flex shrink-0 items-center"
          id="autosave-form"
        >
          <input type="hidden" name="autosave" value={shown ? 'off' : 'on'} readOnly />
          <button
            type={shown ? 'button' : 'submit'}
            id="autosave"
            role="switch"
            aria-checked={shown}
            aria-labelledby="autosave-label"
            aria-busy={saving || undefined}
            onClick={(event) => {
              ask(!shown)
              // turning it OFF asks first: the dialog's own button submits this form. Turning it ON falls through to
              // the submit, where `once` runs — it must NOT run here as well, or the second call sees its own ref
              // already set and cancels the very submit it was guarding (executed, 2026-09-19).
              if (shown) event.preventDefault()
            }}
            className={`relative h-5 w-9 rounded-thumb ${ring} ${shown ? 'bg-coral' : 'bg-line-strong'}`}
          >
            <span
              aria-hidden
              className={`absolute top-[2px] size-4 rounded-full bg-surface shadow-sm ${shown ? 'right-[2px]' : 'left-[2px]'}`}
            />
          </button>
        </form>
      </div>

      {failure ? <Banner kind="error">{failure}</Banner> : null}

      <dialog
        ref={dialog}
        aria-labelledby="autosave-off-title"
        aria-describedby="autosave-off-body"
        onClick={closeOnBackdrop}
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex flex-col gap-[6px]">
          <h2 id="autosave-off-title" className={title}>
            Stop sending your work automatically?
          </h2>
          <p id="autosave-off-body" className="text-ui-dense leading-[1.55] text-ink-soft">
            Your work will still be kept on this device as you make it, and it will still be sent when you close the
            tab or press ⌘S. What stops is the regular send every few minutes — so if this browser clears its
            storage, or this computer is lost, anything not yet sent would go with it.
          </p>
        </div>
        <div className="flex justify-end gap-[10px]">
          <Button type="button" variant="secondary" size={36} data-cancel onClick={() => dialog.current?.close()}>
            Cancel
          </Button>
          {/* The confirm submits the SAME form the switch belongs to, so there is one action and one hidden field. */}
          <Button
            type="submit"
            form="autosave-form"
            variant="coral"
            size={36}
            aria-busy={saving || undefined}
            aria-disabled={saving || undefined}
            /* `once` is the FORM's guard and runs on its submit; calling it here too would set the in-flight ref and
               then read it back on the submit, which cancels the write. The dialog closes and the click falls through
               to the form named by `form="autosave-form"`. */
            onClick={() => dialog.current?.close()}
          >
            <span className="grid">
              <span className={`col-start-1 row-start-1 ${saving ? 'invisible' : ''}`}>Turn it off</span>
              <span className={`col-start-1 row-start-1 ${saving ? '' : 'invisible'}`}>Turning it off…</span>
            </span>
          </Button>
        </div>
      </dialog>
    </section>
  )
}
