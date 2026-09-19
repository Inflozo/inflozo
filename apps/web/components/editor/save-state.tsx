'use client'

import { PersistenceIndicator, type PersistenceState } from '@/components/kit/persistence-indicator'
import { ring } from '@/components/kit/greyed'
import { labelOf, panelOpen, type SyncState } from '@/lib/journal'

/* B6 · PERSISTENCE, FIVE STATES (`B Missing Surfaces.dc.html:1351-1388`), in the editor's top bar.
 *
 * THE INDICATOR ITSELF IS STORY 1.3'S KIT COMPONENT and is not rebuilt here — mounted, handed a state and a
 * countdown. Its five-member union is the compile error for a sixth label, which is why `labelOf` below is typed
 * against it: the machine in `lib/journal.ts` and the Kit's union are checked against each other at build time
 * rather than kept in step by hand.
 *
 * WHERE IT SITS is `S4 Editor.dc.html:32` — in the 48px bar, third item, directly after the project name. S4a draws
 * a GREEN dot and the word "Saved" there; B6 governs the states and their colours, which `prd.md:1335` and
 * `EXPERIENCE.md:314` both say in so many words. Since **R-142** it is neither frame's dot: it is a Tabler glyph in a
 * filled circle, with B6's own five labels moved to the hover and to assistive tech. Since **R-144** its resting
 * state reports what is OWED — a green check when everything is on the server, a grey clock when there are edits
 * written here that are not. The Kit component carries all of that; this file places it and owns the panel.
 *
 * THE PANEL OPENS ON RETRYING AND ON NOTHING ELSE — the frame's own note and an acceptance criterion, expressed as
 * `panelOpen(state)` so there is one predicate rather than a condition written at each of two places. B6 draws it as
 * a card in a catalogue; in the bar it is ANCHORED UNDER THE INDICATOR (R-74's extrapolation rule), with its fill,
 * radius, padding, ink, type and control all the frame's verbatim.
 *
 * ITS FIRST SENTENCE IS THE REASSURANCE AND NOT THE ERROR, because the user's real question is whether they have lost
 * work. The frame's own words, kept exactly.
 *
 * ONE CONTROL, NOT TWO. B6 draws "Retry now" beside "Download a copy"; **R-140 (owner, 2026-09-19)** leaves the second
 * out — nothing in Inflozo reads such a file back in — so it is ABSENT, never greyed and never captioned (UX-DR3,
 * R-118 applied a sixth time). The reassurance sentence is untouched either way, which is what the frame drew it for.
 *
 * NO SPINNER ANYWHERE — B6's note survives both rulings untouched, and the Syncing glyph is a static arrow rather
 * than a turning one. And colour still never carries the only signal: every state has its own SHAPE as well as its
 * own hue, which is a stronger guarantee than the printed label gave (the label was the only thing keeping three of
 * B6's four dots legal, and coral against mint measured 1.04:1).
 */

/** B6's own title line, which counts the attempt rather than naming the error. The frame prints "third attempt"; the
 *  word is derived from the attempt so it is right on the first and the tenth. */
const ATTEMPTS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth']
const attemptWord = (n: number) => ATTEMPTS[Math.min(Math.max(n, 1), ATTEMPTS.length) - 1] ?? `${n}th`

export function SaveState({
  state,
  onRetry,
  retrying,
}: {
  state: SyncState
  /** B6's "Retry now": the backoff resets and the flush fires at once */
  onRetry: () => void
  /** that press is in flight — R-98's swapped label, `aria-disabled` and `aria-busy` */
  retrying: boolean
}) {
  // the Kit's union and the machine's, checked against each other by the compiler
  const label: PersistenceState = labelOf(state)
  const open = panelOpen(state)
  return (
    <span className="relative flex items-center">
      <PersistenceIndicator state={label} seconds={state.kind === 'retrying' ? state.seconds : undefined} />
      {open && state.kind === 'retrying' ? (
        <div
          id="editor-retrying"
          // B6 :1379 — `danger-tint`, 10px radius, 11/12 padding, 7px between its rows. Anchored under the indicator,
          // which is the only thing this extrapolation adds to the frame.
          className="absolute left-0 top-[calc(100%+8px)] z-20 flex w-[280px] flex-col gap-[7px] rounded-thumb bg-danger-tint p-[11px_12px] shadow-md"
        >
          <span className="text-[12px] font-semibold text-danger-panel-ink">
            Retrying, {attemptWord(state.attempt)} attempt
          </span>
          {/* THE FRAME'S OWN SENTENCE, verbatim (:1381) */}
          <span className="text-[11.5px] leading-[1.5] text-danger-panel-ink">
            Your work is safe on this device. Nothing is lost if you close the tab — we will send it when the
            connection returns.
          </span>
          <div className="flex gap-[7px] pt-[2px]">
            {/* B6 :1383 — 28px, white, the panel's own border. R-98: the label swaps and the control goes
                `aria-disabled` + `aria-busy` while the press is working, never `disabled`. */}
            <button
              type="button"
              id="editor-retry-now"
              onClick={retrying ? undefined : onRetry}
              aria-disabled={retrying || undefined}
              aria-busy={retrying || undefined}
              className={`inline-flex h-7 items-center rounded-sm border border-danger-panel-line bg-surface px-[11px] text-[11.5px] font-semibold text-danger-panel-ink ${ring}`}
            >
              {/* both labels in one grid cell, so the control is already as wide as its busy word and the press
                  moves nothing (`kit/submit.tsx`'s `BusyLabel`, the owner's ask of 2026-09-10) */}
              <span className="grid">
                <span className={`col-start-1 row-start-1 ${retrying ? 'invisible' : ''}`}>Retry now</span>
                <span className={`col-start-1 row-start-1 ${retrying ? '' : 'invisible'}`}>Retrying…</span>
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </span>
  )
}
