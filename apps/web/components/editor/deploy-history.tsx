'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LiveBadge, ResultChip } from '@/components/kit/badge'
import { IconButton } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { AlertTriangle, Pin, X } from '@/components/kit/icons'
import { versionLabel } from '@/lib/deploy'
import { useSaid } from '@/lib/renders'
import { chipTone, HISTORY_WORDS as HW, historyRows, pinSaid, timeLabel, type HistoryAnswer, type HistoryRow, type PinOutcome } from '@/lib/retention'

/* ───────── STORY 7.22 — THE HISTORY DRAWER (FR-J7), from the export (R-74):
 *
 *   - the drawer: `S8 Deploy.dc.html` S8e `:264-350` — 420 wide at the right edge, below the 48px bar, over a scrim, opened by the
 *     bar's clock (`#deploy-history-open`) and by Ship it ▾ → History;
 *   - its header, compact rows and footer: `D2 Deploy History Completed.dc.html` D2a — the header `:53`, the compact row
 *     `:101-150` (pinned: `:129-136`, the PINNED tag and the marigold wash), the footer line `:152` — and D2c's Free limit `:283`;
 *     the Live badge D2a's `:78`;
 *   - the refusal: D2b `:158-186` — the note under the pin, its sentence `:180` and Got it `:181`; the pin stays unfilled.
 *
 * EVERY ROW IS DRAWN COMPACT, the frame's row for older versions, with the Live badge added (the spec's Design Notes): Story 7.23a
 * draws the expanded rows (thumbnail, Changed line, by-line, Roll back) and D2d, Story 7.23b the original-theme row (R-290).
 * Extrapolated in the same
 * tokens: the loading rows (in the compact row's shape — R-98, never a spinner), the empty state (UX-DR6, the limit line still
 * under it), a failed read (one sentence where the rows go), and "on {host}" on a row of another site (one list per project).
 *
 * THE LIST IS EXACTLY WHAT IS KEPT. The route lists stored versions only (`isStoredVersion`), so a pruned version is absent —
 * never a greyed row with a dead Restore (the epic's criterion). Every word is `HISTORY_WORDS`' (R-170), its numbers `PLANS`'.
 *
 * THE PIN IS A HISTORY CONTROL (R-192's view side): it needs no edit lock and stays live in a read-only editor. A toggle with
 * `aria-pressed`; while its request is out it says "Pinning v3…" with `aria-busy` and `aria-disabled` (R-98) and every pin waits.
 * Each outcome is said once in the one polite region (UX-DR12). The server is the control (`pin_version`, FR-J7): `cap` opens D2b
 * with focus on Got it, and Got it or Esc returns focus to the pin; `gone` re-reads, so the row leaves the list.
 */

type Shown = { kind: 'loading' } | { kind: 'failed' } | { kind: 'rows'; rows: HistoryRow[] }

export function DeployHistory({ projectName, read, pin, onClose }: {
  projectName: string
  /** the project's stored versions (GET `projects/[id]/history`), or null when the read failed */
  read: () => Promise<HistoryAnswer | null>
  /** a pin or an unpin (POST), answered as its outcome */
  pin: (deploy: string, pinned: boolean) => Promise<PinOutcome>
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  /** what had focus when the drawer opened — the clock, or Ship it's ▾ after its menu closed — where Esc and ✕ put it back */
  const opener = useRef<Element | null>(null)
  const [shown, setShown] = useState<Shown>({ kind: 'loading' })
  /** the row whose pin is out (every pin waits for it) */
  const [busy, setBusy] = useState<string | null>(null)
  /** the row whose pin the server refused at the cap: D2b sits under it */
  const [refused, setRefused] = useState<string | null>(null)
  const [said, say] = useSaid()
  const now = useMemo(() => new Date(), [])

  const load = async (): Promise<void> => {
    const answer = await read().catch(() => null)
    if (answer === null) {
      setShown({ kind: 'failed' })
      say(HW.readFailed)
      return
    }
    setShown({ kind: 'rows', rows: historyRows(answer) })
  }

  useEffect(() => {
    opener.current = document.activeElement
    if (dialog.current?.open !== true) openOnCancel(dialog.current)
    void load()
    // one read per opening: the editor mounts a fresh drawer each time it opens, so closing and reopening asks again
  }, [])

  // D2b opens with focus on Got it
  useEffect(() => {
    if (refused !== null) document.getElementById('history-got-it')?.focus()
  }, [refused])

  const pinOf = (id: string) => dialog.current?.querySelector<HTMLElement>(`[data-history-pin="${id}"]`) ?? null
  const closeRefusal = () => {
    const id = refused
    setRefused(null)
    if (id !== null) pinOf(id)?.focus()
  }

  const toggle = async (row: HistoryRow): Promise<void> => {
    if (busy !== null) return
    setRefused(null)
    setBusy(row.id)
    const outcome: PinOutcome = await pin(row.id, !row.pinned).catch((): PinOutcome => 'failed')
    setBusy(null)
    say(pinSaid(outcome, row.n))
    if (outcome === 'pinned' || outcome === 'unpinned') {
      setShown((was) => (was.kind === 'rows' ? { kind: 'rows', rows: was.rows.map((r) => (r.id === row.id ? { ...r, pinned: outcome === 'pinned' } : r)) } : was))
    } else if (outcome === 'cap') {
      setRefused(row.id)
    } else if (outcome === 'gone') {
      // pruned, failed or not this user's since the list was read: read again, so it leaves the list — and focus, whose pin left
      // with it, goes to the drawer's ✕
      await load()
      document.getElementById('deploy-history-close')?.focus()
    }
  }

  const close = () => dialog.current?.close()

  const row = (r: HistoryRow) => {
    const out = busy === r.id
    const note = refused === r.id
    return (
      <li
        key={r.id}
        data-history-row={versionLabel(r.n)}
        data-pinned={r.pinned || undefined}
        className={`relative flex items-center gap-2 rounded border px-3 py-[9px] ${r.pinned ? 'border-marigold-line bg-marigold-tint-soft' : 'border-line'}`}
      >
        <span className={`inline-flex items-center rounded-pill border border-line px-2 py-px font-mono text-[11px] font-medium text-ink [font-variant-ligatures:none] ${r.pinned ? 'bg-surface' : ''}`}>
          {versionLabel(r.n)}
        </span>
        {r.live ? <LiveBadge label={HW.live} /> : null}
        {r.pinned ? (
          <span data-history-pinned className="inline-flex items-center rounded-pill bg-marigold-tint px-2 py-[2px] text-[10px] font-semibold uppercase text-marigold-text">
            {HW.pinnedTag}
          </span>
        ) : null}
        {r.gscan === null ? null : (
          <span data-history-gscan>
            <ResultChip tone={chipTone(r.gscan)}>
              <span aria-hidden>{HW.gscan(r.gscan.errors, r.gscan.warnings)}</span>
              <span className="sr-only">{HW.gscanSaid(r.gscan.errors, r.gscan.warnings)}</span>
            </ResultChip>
          </span>
        )}
        {r.elsewhere === null ? null : <span data-history-site className="min-w-0 truncate text-[11px] text-ink-soft">{HW.on(r.elsewhere)}</span>}
        <span className="ml-auto shrink-0 text-[11px] text-ink-soft">{timeLabel(r.createdAt, now)}</span>
        <button
          type="button"
          data-history-pin={r.id}
          aria-pressed={r.pinned}
          aria-label={`${out ? (r.pinned ? HW.unpinning(r.n) : HW.pinning(r.n)) : HW.pin(r.n)}${r.elsewhere === null ? '' : ` ${HW.on(r.elsewhere)}`}`}
          title={r.pinned ? HW.unpinTitle : HW.pinTitle}
          aria-busy={out || undefined}
          aria-disabled={busy !== null || undefined}
          aria-describedby={note ? 'history-refusal' : undefined}
          onClick={() => void toggle(r)}
          className={`inline-flex size-7 shrink-0 items-center justify-center rounded-sm transition-colors ${ring} ${
            r.pinned ? 'bg-marigold-tint text-marigold-glyph' : note ? 'bg-line-soft text-ink-soft shadow-[0_0_0_2px_var(--color-surface),0_0_0_3.5px_var(--color-marigold-line)]' : 'text-ink-soft hover:bg-line-soft'
          }`}
        >
          <Pin size={14} fill={r.pinned ? 'currentColor' : 'none'} />
        </button>
        {note ? (
          /* D2b `:176-185`: under the pin, right-aligned, its arrow pointing up at it */
          <div
            id="history-refusal"
            data-history-refusal
            className="absolute right-2 top-full z-10 mt-[9px] flex w-[296px] max-w-[calc(100%-16px)] gap-[10px] rounded border border-marigold-line bg-marigold-tint-soft px-[14px] py-[13px] shadow-popover"
          >
            <AlertTriangle size={15} strokeWidth={1.8} className="mt-[2px] shrink-0 text-marigold-glyph" />
            <div className="flex flex-1 flex-col gap-[10px]">
              <span className="text-[12.5px] leading-[1.55] text-marigold-text [text-wrap:pretty]">{HW.refusal}</span>
              <button
                id="history-got-it"
                type="button"
                onClick={closeRefusal}
                className={`h-[30px] self-start rounded-thumb border border-marigold-line bg-surface px-[14px] text-[12.5px] font-semibold text-marigold-text transition-colors hover:bg-marigold-tint ${ring}`}
              >
                {HW.gotIt}
              </button>
            </div>
            <span aria-hidden className="absolute -top-[5px] right-4 size-[9px] rotate-45 border-l border-t border-marigold-line bg-marigold-tint-soft" />
          </div>
        ) : null}
      </li>
    )
  }

  return (
    <dialog
      ref={dialog}
      data-deploy-history
      aria-labelledby="deploy-history-title"
      onClick={closeOnBackdrop}
      // D2b is closed by Esc first, and focus goes back to its pin; the next Esc closes the drawer
      onCancel={(event) => {
        if (event.target !== event.currentTarget || refused === null) return
        event.preventDefault()
        closeRefusal()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || refused === null) return
        event.preventDefault()
        event.stopPropagation()
        closeRefusal()
      }}
      onClose={(event) => {
        if (event.target !== event.currentTarget) return
        const back = opener.current
        onClose()
        if (back instanceof HTMLElement && back.isConnected) back.focus()
      }}
      // S8e's drawer: 420 at the right edge below the 48px bar — 56px on a touch screen (`editor.tsx`' `coarse:h-14`) — the scrim
      // from the bar down (D2a `:48`, ink at .25)
      className="fixed top-12 right-0 bottom-0 left-auto m-0 h-auto max-h-none w-[420px] max-w-full flex-col overflow-hidden border-0 bg-surface p-0 text-ink shadow-modal backdrop:top-12 backdrop:bg-ink/25 open:flex coarse:top-14 coarse:backdrop:top-14"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 id="deploy-history-title" className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-soft">
          {HW.title(projectName)}
        </h2>
        <IconButton id="deploy-history-close" data-cancel label={HW.close} title={HW.close} onClick={close}>
          <X size={16} />
        </IconButton>
      </div>
      <div className="flex flex-1 flex-col gap-[9px] overflow-y-auto p-[14px]">
        {shown.kind === 'loading' ? (
          // R-98: the rows that are coming, in the compact row's own shape — never a spinner
          <ol data-history-loading aria-busy="true" className="m-0 flex list-none flex-col gap-[9px] p-0">
            <li className="sr-only">{HW.loading}</li>
            {[0, 1, 2].map((i) => (
              <li key={i} aria-hidden className="flex h-12 items-center gap-2 rounded border border-line px-3">
                <span className="h-[18px] w-9 rounded-pill bg-paper-sunk" />
                <span className="h-4 w-10 rounded-pill bg-paper-sunk" />
                <span className="ml-auto h-3 w-24 rounded-sm bg-paper-sunk" />
                <span className="size-7 rounded-sm bg-paper-sunk" />
              </li>
            ))}
          </ol>
        ) : shown.kind === 'failed' ? (
          <p data-history-failed className="m-0 px-1 py-[6px] text-[12.5px] leading-[1.55] text-ink [text-wrap:pretty]">{HW.readFailed}</p>
        ) : shown.rows.length === 0 ? (
          // UX-DR6: nothing shipped yet — and the limit line below still states the bound
          <p data-history-empty className="m-0 px-1 py-[6px] text-[12.5px] font-semibold text-ink">{HW.empty}</p>
        ) : (
          <ol aria-labelledby="deploy-history-title" className="m-0 flex list-none flex-col gap-[9px] p-0">
            {shown.rows.map(row)}
          </ol>
        )}
        <p data-history-limit className="m-0 mt-auto px-1 py-[6px] text-[11px] leading-[1.55] text-ink-soft [text-wrap:pretty]">{HW.limit}</p>
      </div>
      <p data-history-said aria-live="polite" className="sr-only">
        <span key={said.n}>{said.words}</span>
      </p>
    </dialog>
  )
}
