'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/kit/button'
import { BusyLabel } from '@/components/kit/submit'
import { Lock } from '@/components/kit/icons'
import { LOCK_COPY, NUDGE_MS, RESTART_EVENTS, restartsNudge, secondsLeft } from '@/lib/lock'

/* B5b · REQUEST ARRIVES FOR THE HOLDER (`B Missing Surfaces.dc.html:1491-1513`).
 *
 * A POPOVER, NOT A MODAL, and the frame's own note is the reason: the holder is mid-sentence and must not be
 * interrupted. So nothing here traps focus, nothing dims the page behind it, and Esc does not close it — it is a
 * card that arrived, not a question that blocks. It is NOT anchored to a trigger either, which is why `lib/menu.ts`
 * is untouched: it has no invoker to sit under.
 *
 * THE FRAME, AS DRAWN: 440 wide, `surface` with the `line` hairline, 12 radius, the lg shadow, 16px of padding and
 * 13px between its three blocks — the identity row (a 32 × 32 circle, then the title and the body), the sync-position
 * strip (a 6px dot, the sentence, the mono count) and the actions (ink primary, secondary, then the countdown).
 *
 * THE AVATAR KEEPS ITS SIZE AND ITS PLACE AND LOSES ITS INITIALS (**R-189**). The mark-then-ask shape is what makes
 * the popover readable at a glance, so the circle stays; what goes is the person, because there is none — it carries
 * B5a's own padlock instead. The frame's "Dai wants to edit" becomes the ruled sentence, and the body's "unsynced
 * changes" becomes "unsynced edits" (§AD2 makes *edits* canonical, and the A9 correction pass that fixed B5c and
 * D8f never reached this frame).
 *
 * IT STATES THE SYNC POSITION BEFORE ASKING, which is the frame's whole argument: handing over is then not a gamble.
 * The count is `unsyncedEdits(journal)` — EDITS, never operations (AD-16), so a Variant Shuffle or a Site Remix is
 * ONE however many ops it cost.
 *
 * THE COUNTDOWN RESTARTS, IT DOES NOT STOP (F-079, `EXPERIENCE.md:1027`). Any interaction with this card — focus
 * included — puts §AD4's ~30 s back to the start, so a holder who is present is never hurried into a decision that
 * loses someone else's work; only a holder who is not there runs it out, and the requester's take-over is then
 * offered. A pointer resting on the card fires no events at all, so PRESENCE restarts it too (`lib/lock.ts`'s
 * `restartsNudge`, and the owner's own manual test step 6 — "leave it there… for a full minute").
 *
 * B5b PRINTS §AD4's ~30 s AND NOT THE FRAME'S "Expires in 60s": `EXPERIENCE.md:1063` rules that difference
 * explicitly NOT a finding — both are tunable defaults the Architect owns.
 */
export function LockRequest({
  /** AD-16's count for THIS session — what Hand over will send first */
  owed,
  onHandOver,
  onKeep,
  /** Hand over is in flight: the flush goes out BEFORE the release (R-98's swapped label) */
  handingOver,
  /** the flush refused, so the lock was NOT released and this card stays */
  failed,
  /** the countdown ran out with nobody there */
  onExpire,
}: {
  owed: number
  onHandOver: () => void
  onKeep: () => void
  handingOver: boolean
  failed: boolean
  onExpire: () => void
}) {
  const card = useRef<HTMLDivElement>(null)
  const started = useRef(Date.now())
  const inside = useRef(false)
  const [left, setLeft] = useState(() => Math.round(NUDGE_MS / 1000))
  /* THE EXPIRY IS HELD IN A REF AND THE EFFECT RUNS ONCE, and that is not tidiness — it is the bug it prevents.
     The caller's `onExpire` is a new function on every render of the editor, and the editor re-renders on every
     heartbeat; with the callback in the deps the effect tore down and rebuilt, putting `started` back to now every
     ~15 s, so a ~30 s countdown could never reach zero and the take-over was unreachable. */
  const expire = useRef(onExpire)
  expire.current = onExpire

  useEffect(() => {
    const el = card.current
    if (!el) return
    started.current = Date.now()
    inside.current = false
    // F-079: the restart is the SAME rule for every one of these, so they share one handler and `lib/lock.ts` owns
    // the list. `focusin` and not `focus`, because focus does not bubble and the card is not the focusable thing.
    const again = (event: Event) => {
      if (restartsNudge(event.type)) started.current = Date.now()
    }
    for (const type of RESTART_EVENTS) el.addEventListener(type, again)
    const enter = () => { inside.current = true }
    const leave = () => { inside.current = false }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    const tick = setInterval(() => {
      // a pointer resting on the card is an interaction that fires nothing: presence restarts the timer too
      if (restartsNudge('tick', inside.current)) started.current = Date.now()
      const seconds = secondsLeft(started.current, Date.now())
      setLeft(seconds)
      // once: the card unmounts on the dismissal, but a tick before it does must not expire a second time
      if (seconds === 0) {
        clearInterval(tick)
        expire.current()
      }
    }, 1000)
    return () => {
      clearInterval(tick)
      for (const type of RESTART_EVENTS) el.removeEventListener(type, again)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
    // mounted with the request and torn down with it — the countdown's whole lifetime
  }, [])

  return (
    <div
      ref={card}
      id="editor-lock-ask"
      // not a `<dialog>` and not `role="dialog"`: it takes no focus and blocks nothing. It is announced through the
      // editor's second, ASSERTIVE region (UX-DR12) rather than by being one.
      className="fixed right-4 top-[62px] z-30 flex w-[440px] flex-col gap-[13px] rounded border border-line bg-surface p-4 shadow-lg"
    >
      <div className="flex items-start gap-[11px]">
        {/* R-189: the circle keeps its 32 × 32 and its place, and carries the Kit's `Lock` where initials were */}
        <span aria-hidden className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-ink text-surface">
          <Lock size={15} />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[13.5px] font-semibold">{LOCK_COPY.askTitle}</span>
          <span className="text-control-label leading-[1.55] text-ink-soft-aa">{LOCK_COPY.askBody}</span>
        </div>
      </div>
      {/* the sync position, stated BEFORE the ask. Mint with nothing owed, the neutral line-strong dot otherwise —
          colour never carries the only signal, so the sentence says which it is either way */}
      <div className="flex items-center gap-[9px] rounded-thumb border border-line bg-paper-raised px-3 py-[10px]">
        <span aria-hidden className={`size-[6px] shrink-0 rounded-pill ${owed === 0 ? 'bg-mint' : 'bg-line-strong'}`} />
        <span className="flex-1 text-control-label">{owed === 0 ? LOCK_COPY.allSynced : LOCK_COPY.willSend(owed)}</span>
        <span className="font-mono text-[10.5px] text-ink-soft-aa">{LOCK_COPY.pending(owed)}</span>
      </div>
      {failed ? (
        // AD-15's flush contract: unsynced work never crosses a lock boundary, so a refused flush keeps the lock and
        // the card says so rather than closing over a silent failure.
        <span className="text-control-label leading-[1.55] text-danger-text">{LOCK_COPY.handOverFailed}</span>
      ) : null}
      <div className="flex items-center gap-[9px]">
        <Button
          id="editor-lock-hand-over"
          variant="primary"
          size={36}
          aria-disabled={handingOver || undefined}
          aria-busy={handingOver || undefined}
          onClick={handingOver ? undefined : onHandOver}
        >
          <BusyLabel pending={handingOver} busy={LOCK_COPY.handingOver}>
            {LOCK_COPY.handOver}
          </BusyLabel>
        </Button>
        {/* R-98 asks every control that starts work to say so, and this one answers by GOING: the request is dismissed
            in the same press and the whole card unmounts, so a busy label would never get a frame to render in. Hand
            over above keeps its label swap because it stays — its flush must land before the lock is let go. */}
        <Button id="editor-lock-keep" variant="secondary" size={36} onClick={onKeep}>
          {LOCK_COPY.keep}
        </Button>
        <span className="flex-1" />
        <span className="text-[11.5px] text-ink-soft">{LOCK_COPY.expires(left)}</span>
      </div>
    </div>
  )
}
