'use client'

import { Button } from '@/components/kit/button'
import { BusyLabel } from '@/components/kit/submit'
import { Lock } from '@/components/kit/icons'
import { LOCK_COPY } from '@/lib/lock'

/* B5a · READ-ONLY (`B Missing Surfaces.dc.html:1469-1487`) — the reader's whole affordance.
 *
 * THE FRAME, AS IT IS DRAWN: a 38px strip above the canvas, `paper-sunk` with the `line` hairline under it, 12px of
 * side padding and 9px between its parts — a 13px padlock, the sentence at 12px, and the request on the right.
 *
 * TWO DEVIATIONS, BOTH INSIDE R-74. The frame draws the request as a `<span>` with `cursor:pointer`, which is a
 * drawing shortcut for a button; it is the Kit's own secondary at its 32px size, so it takes the app's one focus
 * ring and its one hover rather than a second vocabulary. And the frame's bar names a PERSON — "**Rosa** is editing
 * this site" — which **R-189** withdrew: a project carries one `user_id` and team seats are out of v1, so the other
 * editing context is always the same person and every string says WHERE, never WHO. The shape, the escalation and
 * the treatment are the frame's; only the words are ruled.
 *
 * R-98: the press SAYS IT IS WORKING — `aria-disabled` + `aria-busy` + the label swap, never `disabled`, and both
 * labels sit in one grid cell (`BusyLabel`) so the bar does not shift by the width of a word mid-press.
 *
 * IT IS ALSO WHAT D8g WILL REUSE VERBATIM when Story 7.18 lands Ship it (DW-238).
 */
export function LockBar({
  asking,
  onRequest,
  /** the reader has asked and nobody answered: B5c's opener sits in the bar's place (R-98's own rule — there is no
   *  new surface for a waiting state, and none is drawn) */
  unanswered,
  notice,
  hidden,
}: {
  asking: boolean
  onRequest: () => void
  unanswered: { words: string; onTakeOver: () => void } | null
  /** a session that has just been TAKEN OVER FROM reads what it lost here, in the ruled sentence — SHOWN, not only
   *  announced (EXPERIENCE.md F2's "revived former holder" is a surface, and "told plainly, the next time anyone
   *  looks at it"). Absent when nothing was lost, as B5c's danger panel is (UX-DR3). */
  notice?: string | null
  hidden?: boolean
}) {
  return (
    <div
      id="editor-lock-bar"
      hidden={hidden}
      className="flex h-[38px] shrink-0 items-center gap-[9px] border-b border-line bg-paper-sunk px-3"
    >
      <Lock size={13} className="shrink-0 text-ink-soft-aa" />
      {/* the sentence is the bar's own live text and is deliberately NOT a live region: the assertive notices are
          the editor's second region, and a bar that announced itself on every render would shout at every paint */}
      {/* the sentence carries an id because the dimmed settings panel is DESCRIBED by it: that is what tells a
          screen-reader user why nothing in the panel responds, and it is why the panel needs no `aria-disabled` of
          its own — which is not a global ARIA attribute and would be `aria-allowed-attr` on a landmark. */}
      <span id="editor-lock-reason" className="flex-1 truncate text-control-label text-ink-soft-aa">
        {unanswered ? unanswered.words : (notice ?? LOCK_COPY.reading)}
      </span>
      {unanswered ? (
        <Button id="editor-lock-take-over" variant="danger-outline" size={32} onClick={unanswered.onTakeOver}>
          {LOCK_COPY.takeOver}
        </Button>
      ) : (
        <Button
          id="editor-lock-request"
          variant="secondary"
          size={32}
          aria-disabled={asking || undefined}
          aria-busy={asking || undefined}
          onClick={asking ? undefined : onRequest}
        >
          <BusyLabel pending={asking} busy={LOCK_COPY.requesting}>
            {LOCK_COPY.request}
          </BusyLabel>
        </Button>
      )}
    </div>
  )
}
