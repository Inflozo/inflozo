'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { DriftFound, DriftUnverified, PassRow, StageRow } from '@/components/editor/deploy-wizard'
import { LiveBadge, ResultChip } from '@/components/kit/badge'
import { Button, buttonClasses, IconButton } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { AlertTriangle, Bolt, Download, Pin, RollBack, X } from '@/components/kit/icons'
import { BusyLabel } from '@/components/kit/submit'
import { versionLabel, versionNumber } from '@/lib/deploy'
import { causeSentence, DRIFT_WORDS as DW, driftCount } from '@/lib/drift'
import { PREFLIGHT_WORDS } from '@/lib/preflight'
import { useSaid } from '@/lib/renders'
import {
  actSaid, chipTone, HISTORY_WORDS as HW, historyRows, pinSaid, timeLabel, type ActOutcome, type CheckOutcome, type HistoryAnswer, type HistoryRow, type PinOutcome,
} from '@/lib/retention'

/* ───────── STORY 7.22 — THE HISTORY DRAWER (FR-J7), from the export (R-74):
 *
 *   - the drawer: `S8 Deploy.dc.html` S8e `:264-350` — 420 wide at the right edge, below the 48px bar, over a scrim, opened by the
 *     bar's clock (`#deploy-history-open`) and by Ship it ▾ → History;
 *   - its header, compact rows and footer: `D2 Deploy History Completed.dc.html` D2a — the header `:53`, the compact row
 *     `:101-150` (pinned: `:129-136`, the PINNED tag and the marigold wash), the footer line `:152` — and D2c's Free limit `:283`;
 *     the Live badge D2a's `:78`;
 *   - the refusal: D2b `:158-186` — the note under the pin, its sentence `:180` and Got it `:181`; the pin stays unfilled.
 *
 * STORY 7.23a — THE FIRST THREE ROWS ARE EXPANDED (S8e `:300-323`, D2a `:75-100`): the frame's schematic thumbnail (`D2:76`,
 * drawn alike on every expanded row and aria-hidden — no record holds a version's look, and none is rendered to make one), the
 * version chip with the Live badge, PINNED or D2d's "Uploaded, not live", the time Ghost accepted it, the Changed line, the gscan
 * chip, the row's action and the pin. NO BY-LINE: the frame's "by Maya" names a person, and R-189 rules that no surface names one.
 * The rest are 7.22's compact rows, each with the quiet Roll back before its pin (FR-J9's "any retained artifact redeploys in one
 * click"; the export decides what the row is built from, so the expanded row's button, sized as drawn). D2d's row (D2 `:194-201`):
 * the sky border and wash, the chip, the wizard's own D2e line and the coral Re-activate. Story 7.23b adds the original-theme row
 * (R-290). Extrapolated in the same tokens: the loading rows (in the compact row's shape — R-98, never a spinner), the empty state
 * (UX-DR6, the limit line still under it), a failed read (one sentence where the rows go), and "on {host}" on a row of another site
 * (one list per project) — which carries no Roll back (Design Notes: its zip is that site's, and that site may be another project's
 * now).
 *
 * THE PUT-BACK (`server/deploy/put-back.ts` through the editor's `act`). Roll back opens S8e's confirm (`:337-345`), a nested
 * `<dialog>` in the wizard's switch-site confirm's shape, opened on Cancel (UX-DR14) — Cancel or Esc closes it and puts focus back on
 * the Roll back that opened it. Its Roll back says "Rolling back…" (R-98), and while the request is out Cancel and Esc do nothing
 * ("Once it starts, it finishes", S8c's rule) and the confirm and the drawer carry `data-unstoppable`, so R-192's lost-lock sweep
 * cannot close them. Re-activate needs no confirm: "Activating…" on the button. An ending is said once in the drawer's region, the
 * list is read again, and focus goes to ✕; a refusal is said under its row, in its own `role="status"` line, Ghost's detail in mono.
 * A refusal that proves the list stale (409 `live` or `elsewhere`) and a request whose fate is unknown read the list again first,
 * then say their sentence once: under the row while it still has an action, else in the drawer's region with focus on ✕.
 *
 * R-291 — THE CHECK BEFORE A ROLL BACK (FR-J16; the owner's "Check first, in this story"). The confirm still opens on Cancel and
 * sends the check at once (`check`, POST `{ deploy, act: 'check' }`); its answer is drawn in ONE `role="status"` region of the
 * confirm, between the summary row and the dropped-settings block — D3's own order, where the drift row comes before Pre-flight's
 * warning rows — in D3's own components and words, extrapolated (no frame draws a Roll back's check): while it reads, D3's running
 * row "Comparing with your live theme…" (R-98: the work in flight is said, never a spinner) and the confirm's Roll back
 * `aria-disabled` — the check is busy, not the Roll back — with Cancel and Esc still closing it (a read is cancellable; an answer
 * for an opening since closed or replaced is dropped); clean, D3c's pass row; found, D3a's row and list, its foot said of a Roll
 * back and "Download the live theme first" (`history/live`), the Roll back still allowed; couldn't verify — or the check's own
 * request failing — D3b's sky row with the cause's sentence alone (Ship it's "Shipping anyway." is not this box's) and no Add token,
 * the Roll back allowed; null (no two manifests), nothing. A check REFUSED (404, 409) closes the confirm and is handled exactly as
 * the put-back's same refusal (`settle`). Focus stays on Cancel as it lands. Re-activate runs no check: it replaces nothing.
 *
 * THE LIST IS EXACTLY WHAT IS KEPT. The route lists stored versions only (`isStoredVersion`), so a pruned version is absent —
 * never a greyed row with a dead Restore (the epic's criterion). Every word is `HISTORY_WORDS`' (R-170), its numbers `PLANS`'.
 *
 * THE PIN IS A HISTORY CONTROL (R-192's view side): it needs no edit lock and stays live in a read-only editor. A toggle with
 * `aria-pressed`; while its request is out it says "Pinning v3…" with `aria-busy` and `aria-disabled` (R-98) and every pin waits.
 * Each outcome is said once in the one polite region (UX-DR12). The server is the control (`pin_version`, FR-J7): `cap` opens D2b
 * with focus on Got it, and Got it or Esc returns focus to the pin; `gone` re-reads, so the row leaves the list.
 */

type Shown = { kind: 'loading' } | { kind: 'failed' } | { kind: 'rows'; rows: HistoryRow[]; live: number | null }
/** R-291 — the check before a Roll back, as the confirm draws it: reading, its record (null: nothing to compare), or its request failed */
type Checked = { kind: 'reading' } | Extract<CheckOutcome, { kind: 'drift' | 'failed' }>

/** D2's thumbnail (`D2 Deploy History Completed.dc.html:76`): the frame's schematic of a page, drawn alike on every expanded row */
const Thumb = () => (
  <span aria-hidden className="flex h-11 w-16 shrink-0 flex-col gap-[2px] rounded-[6px] border border-line bg-paper-raised p-[5px]">
    <span className="h-1 w-[60%] rounded-[1px] bg-ink" />
    <span className="h-[3px] w-[40%] rounded-[1px] bg-line-strong" />
    <span className="mt-[2px] flex gap-[2px]">
      <span className="h-[10px] flex-1 rounded-[2px] bg-line" />
      <span className="h-[10px] w-[14px] rounded-[2px] bg-coral-deep" />
    </span>
  </span>
)

export function DeployHistory({ projectName, read, pin, act, check, liveHref, onClose }: {
  projectName: string
  /** the project's stored versions (GET `projects/[id]/history`), or null when the read failed */
  read: () => Promise<HistoryAnswer | null>
  /** a pin or an unpin (POST), answered as its outcome */
  pin: (deploy: string, pinned: boolean) => Promise<PinOutcome>
  /** Story 7.23a — a put-back (POST `{ deploy, act: 'live' }`), answered as its outcome */
  act: (deploy: string) => Promise<ActOutcome>
  /** R-291 — the drift check before a Roll back (POST `{ deploy, act: 'check' }`), answered as its outcome */
  check: (deploy: string) => Promise<CheckOutcome>
  /** R-291 — the address of the live zip a found check kept (`history/live`), named by the theme it read */
  liveHref: (theme: string) => string
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
  /** Story 7.23a — the row whose put-back is out (every action and pin waits for it), the row S8e's confirm is open for, and the
   *  refusal said under a row */
  const [acting, setActing] = useState<string | null>(null)
  const [asking, setAsking] = useState<HistoryRow | null>(null)
  /** each press of a Roll back, so a confirm reopened before the last one's `close` event has run still opens: that event is
   *  queued, so `asking` can still hold the same row when the next press sets it (seen once in three runs of journey (b)) */
  const [opens, setOpens] = useState(0)
  const [note, setNote] = useState<{ id: string; words: string; detail?: string } | null>(null)
  const confirm = useRef<HTMLDialogElement>(null)
  /** R-291 — the check before a Roll back, and the opening it answers for: a press of a Roll back and the confirm closing each move
   *  it on, so an answer that lands for an opening since closed or replaced is dropped */
  const [checked, setChecked] = useState<Checked | null>(null)
  const checking = useRef(0)
  const reading = checked?.kind === 'reading'

  /** the list, read and DRAWN before it returns (`flushSync`), so focus lands on what it drew — its rows, or null when it failed */
  const load = async (): Promise<HistoryRow[] | null> => {
    const answer = await read().catch(() => null)
    if (answer === null) {
      setShown({ kind: 'failed' })
      say(HW.readFailed)
      return null
    }
    const live = answer.liveVersion === null ? Number.NaN : versionNumber(answer.liveVersion)
    const rows = historyRows(answer)
    flushSync(() => setShown({ kind: 'rows', rows, live: Number.isFinite(live) ? live : null }))
    return rows
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

  // S8e's confirm opens on Cancel (UX-DR14)
  useEffect(() => {
    if (asking !== null && confirm.current?.open !== true) openOnCancel(confirm.current)
  }, [asking, opens])

  const actOf = (id: string) => dialog.current?.querySelector<HTMLElement>(`[data-history-act="${id}"]`) ?? null
  /** Cancel or Esc: the confirm closes and focus goes back to the Roll back that opened it — never while its request is out */
  const cancelConfirm = () => {
    if (acting !== null) return
    confirm.current?.close()
  }

  /** THE PUT-BACK: an ending is said in the drawer's region, the list read again and focus put on ✕; a refusal is said under its row
   *  and focus goes back to the row's action */
  const putBack = async (row: HistoryRow): Promise<void> => {
    if (acting !== null || busy !== null) return
    setNote(null)
    setActing(row.id)
    const outcome: ActOutcome = await act(row.id).catch((): ActOutcome => ({ kind: 'failed' }))
    setActing(null)
    await settle(row, outcome, asking !== null)
  }

  /** R-291 — THE CHECK BEFORE A ROLL BACK, sent as its confirm opens: its record is drawn in the confirm, a failed request as D3b's
   *  unreachable row; a refusal closes the confirm and is the put-back's own (`settle`). An answer for another opening is dropped */
  const checkFirst = async (row: HistoryRow): Promise<void> => {
    const ticket = ++checking.current
    setChecked({ kind: 'reading' })
    const outcome: CheckOutcome = await check(row.id).catch((): CheckOutcome => ({ kind: 'failed' }))
    if (ticket !== checking.current) return
    if (outcome.kind === 'drift' || outcome.kind === 'failed') return setChecked(outcome)
    setChecked(null)
    await settle(row, outcome, true)
  }

  /** AN OUTCOME, SAID ONCE — a put-back's, or the check's refusal (R-291: handled exactly as the put-back's same refusal). `inConfirm`:
   *  it came from the confirm, which closes (its close puts focus back on the row's action) */
  const settle = async (row: HistoryRow, outcome: ActOutcome, inConfirm: boolean): Promise<void> => {
    const words = actSaid(outcome, row.n, row.host)
    const back = inConfirm ? row.id : null
    if (outcome.kind === 'live' || outcome.kind === 'uploaded' || outcome.kind === 'gone') {
      setAsking(null)
      confirm.current?.close()
      say(words)
      await load()
      document.getElementById('deploy-history-close')?.focus()
      return
    }
    const noted = { id: row.id, words, ...(outcome.kind === 'refused' && outcome.detail !== undefined ? { detail: outcome.detail } : {}) }
    // the list is stale (409 `live` or `elsewhere`), or the request's fate is unknown (a timeout may have landed): read it again,
    // then say the sentence once — under the row while it is still drawn with an action, else in the region with focus on ✕.
    // Ghost's refusals, `busy`, `disconnected` and ours changed nothing, so they read nothing again
    if (outcome.kind === 'failed' || (outcome.kind === 'refused' && (outcome.code === 'live' || outcome.code === 'elsewhere'))) {
      if (back !== null) confirm.current?.close()
      const rows = await load()
      const now = rows?.find((r) => r.id === row.id)
      if (now?.action == null) {
        // a request whose answer was lost but which landed: the re-read shows it live, and that is what is said
        say(outcome.kind === 'failed' && now?.live === true && now.elsewhere === null ? HW.said.live(row.n, row.host) : words)
        document.getElementById('deploy-history-close')?.focus()
        return
      }
      setNote(noted)
      actOf(row.id)?.focus()
      return
    }
    setNote(noted)
    if (back !== null) confirm.current?.close()
    else actOf(row.id)?.focus()
  }

  const toggle = async (row: HistoryRow): Promise<void> => {
    if (busy !== null || acting !== null) return
    setRefused(null)
    setBusy(row.id)
    const outcome: PinOutcome = await pin(row.id, !row.pinned).catch((): PinOutcome => 'failed')
    setBusy(null)
    say(pinSaid(outcome, row.n))
    if (outcome === 'pinned' || outcome === 'unpinned') {
      setShown((was) => (was.kind === 'rows' ? { ...was, rows: was.rows.map((r) => (r.id === row.id ? { ...r, pinned: outcome === 'pinned' } : r)) } : was))
    } else if (outcome === 'cap') {
      setRefused(row.id)
    } else if (outcome === 'gone') {
      // pruned, failed or not this user's since the list was read: read again, so it leaves the list — and focus, whose pin left
      // with it, goes to the drawer's ✕
      await load()
      document.getElementById('deploy-history-close')?.focus()
    }
  }

  const close = () => {
    if (acting === null) dialog.current?.close()
  }

  /** the version chip — on a tinted row it sits on the surface, as drawn */
  const chip = (r: HistoryRow, tinted: boolean) => (
    <span className={`inline-flex items-center rounded-pill border border-line px-2 py-px font-mono text-[11px] font-medium text-ink [font-variant-ligatures:none] ${tinted ? 'bg-surface' : ''}`}>
      {versionLabel(r.n)}
    </span>
  )
  const gscanChip = (r: HistoryRow) =>
    r.gscan === null ? null : (
      <span data-history-gscan>
        <ResultChip tone={chipTone(r.gscan)}>
          <span aria-hidden>{HW.gscan(r.gscan.errors, r.gscan.warnings)}</span>
          <span className="sr-only">{HW.gscanSaid(r.gscan.errors, r.gscan.warnings)}</span>
        </ResultChip>
      </span>
    )
  const pinnedTag = (r: HistoryRow) =>
    r.pinned ? (
      <span data-history-pinned className="inline-flex items-center rounded-pill bg-marigold-tint px-2 py-[2px] text-[10px] font-semibold uppercase text-marigold-text">
        {HW.pinnedTag}
      </span>
    ) : null
  const time = (r: HistoryRow) => <span data-history-time className="ml-auto shrink-0 text-[11px] text-ink-soft">{timeLabel(r.acceptedAt, now)}</span>
  const elsewhere = (r: HistoryRow) => (r.elsewhere === null ? null : <span data-history-site className="min-w-0 truncate text-[11px] text-ink-soft">{HW.on(r.elsewhere)}</span>)
  /** the undo's row is raised: S8e's drawer draws it (`S8 Deploy.dc.html:308`) at exactly the `shadow-md` token (`globals.css`'
   *  `--shadow-md`); D2a `:84` and D2c `:265` draw the same row at a lighter .06, and S8e's drawer frame decides */
  const raised = (r: HistoryRow) => (r.emphasis ? 'shadow-md' : '')

  /** THE ROW'S ACTION (S8e `:313`, `:321`; D2d `:199`): Re-activate on D2d's row, else Roll back — coral-outline on the row right
   *  after the Live one (the undo), quiet elsewhere — each naming its version; while its request is out, its present tense (R-98) */
  const action = (r: HistoryRow) => {
    if (r.action === null) return null
    const waiting = acting !== null || busy !== null || undefined
    if (r.action === 'reactivate') {
      const out = acting === r.id
      return (
        <Button
          variant="coral"
          size={26}
          data-history-act={r.id}
          aria-label={out ? HW.activating : HW.reactivateName(r.n)}
          aria-busy={out || undefined}
          aria-disabled={waiting}
          onClick={() => void putBack(r)}
          className="shrink-0"
        >
          <BusyLabel pending={out} busy={HW.activating}>
            <Bolt size={11} strokeWidth={1.9} />
            {HW.reactivate}
          </BusyLabel>
        </Button>
      )
    }
    return (
      <Button
        variant={r.emphasis ? 'coral-outline' : 'quiet'}
        size={26}
        weight={r.emphasis ? 'font-semibold' : 'font-medium'}
        data-history-act={r.id}
        data-emphasis={r.emphasis || undefined}
        aria-label={HW.rollBackName(r.n)}
        aria-haspopup="dialog"
        aria-disabled={waiting}
        onClick={() => {
          if (waiting) return
          setNote(null)
          setAsking(r)
          setOpens((n) => n + 1)
          void checkFirst(r)
        }}
        className="shrink-0"
      >
        <RollBack size={11} />
        {HW.rollBack}
      </Button>
    )
  }

  /** a refusal, said under its row — its own polite region, there (empty, and out of the row's flow) before its words so they are
   *  heard; Ghost's own words in mono */
  const status = (r: HistoryRow) => (
    <p role="status" data-history-note={r.id} className="m-0 flex basis-full flex-col gap-[3px] text-[11.5px] leading-[1.5] text-danger-text empty:absolute [text-wrap:pretty]">
      {note?.id === r.id ? (
        <>
          <span>{note.words}</span>
          {note.detail === undefined ? null : <span data-history-detail className="break-words font-mono text-[10.5px] text-ink-soft">{note.detail}</span>}
        </>
      ) : null}
    </p>
  )

  const row = (r: HistoryRow) => {
    const out = busy === r.id
    const capped = refused === r.id
    const pinButton = (
      <button
        type="button"
        data-history-pin={r.id}
        aria-pressed={r.pinned}
        aria-label={`${out ? (r.pinned ? HW.unpinning(r.n) : HW.pinning(r.n)) : HW.pin(r.n)}${r.elsewhere === null ? '' : ` ${HW.on(r.elsewhere)}`}`}
        title={r.pinned ? HW.unpinTitle : HW.pinTitle}
        aria-busy={out || undefined}
        aria-disabled={busy !== null || acting !== null || undefined}
        aria-describedby={capped ? 'history-refusal' : undefined}
        onClick={() => void toggle(r)}
        className={`inline-flex size-7 shrink-0 items-center justify-center rounded-sm transition-colors ${ring} ${
          r.pinned ? 'bg-marigold-tint text-marigold-glyph' : capped ? 'bg-line-soft text-ink-soft shadow-[0_0_0_2px_var(--color-surface),0_0_0_3.5px_var(--color-marigold-line)]' : 'text-ink-soft hover:bg-line-soft'
        }`}
      >
        <Pin size={14} fill={r.pinned ? 'currentColor' : 'none'} />
      </button>
    )
    const refusal = capped ? (
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
      ) : null
    const reactivate = r.action === 'reactivate'

    if (r.expanded) {
      // S8e `:300-323`, D2a `:75-100`: the Live row mint, a pinned row marigold, D2d's row sky — else the hairline alone
      const tone = r.live ? 'border-mint-line bg-mint-wash' : reactivate ? 'border-sky-line bg-sky-wash' : r.pinned ? 'border-marigold-line bg-marigold-tint-soft' : 'border-line'
      return (
        <li
          key={r.id}
          data-history-row={versionLabel(r.n)}
          data-history-expanded
          data-pinned={r.pinned || undefined}
          data-history-uploaded={reactivate || undefined}
          className={`relative flex gap-3 rounded border px-[14px] py-[13px] ${tone} ${raised(r)}`}
        >
          <Thumb />
          <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <div className="flex items-center gap-[7px]">
              {chip(r, r.live || r.pinned || reactivate)}
              {r.live ? <LiveBadge label={HW.live} /> : null}
              {pinnedTag(r)}
              {reactivate ? (
                <span data-history-uploaded-chip className="inline-flex items-center rounded-pill border border-sky-line bg-sky-tint px-2 py-[2px] text-[10px] font-semibold text-sky-ink">
                  {HW.uploadedChip}
                </span>
              ) : null}
              {elsewhere(r)}
              {time(r)}
            </div>
            {reactivate ? (
              <span data-history-line className="text-[11.5px] leading-[1.5] text-ink-soft">{HW.notLive}</span>
            ) : r.changed === null ? null : (
              <span data-history-changed className="text-[12px] leading-[1.45] text-ink-soft [text-wrap:pretty]">{r.changed}</span>
            )}
            <div className="flex items-center gap-[7px]">
              {gscanChip(r)}
              <span className="ml-auto flex items-center gap-[7px]">
                {action(r)}
                {pinButton}
              </span>
            </div>
            {status(r)}
          </div>
          {refusal}
        </li>
      )
    }
    return (
      <li
        key={r.id}
        data-history-row={versionLabel(r.n)}
        data-pinned={r.pinned || undefined}
        className={`relative flex flex-wrap items-center gap-x-2 gap-y-[6px] rounded border px-3 py-[9px] ${r.pinned ? 'border-marigold-line bg-marigold-tint-soft' : 'border-line'} ${raised(r)}`}
      >
        {chip(r, r.pinned)}
        {r.live ? <LiveBadge label={HW.live} /> : null}
        {pinnedTag(r)}
        {gscanChip(r)}
        {elsewhere(r)}
        {/* the time, the quiet Roll back and the pin keep together: a row too full for one line moves them, together, to a second */}
        <span className="ml-auto flex shrink-0 items-center gap-2">
          {time(r)}
          {action(r)}
          {pinButton}
        </span>
        {r.action === null ? null : status(r)}
        {refusal}
      </li>
    )
  }

  return (
    <dialog
      ref={dialog}
      data-deploy-history
      // Story 7.23a: while a put-back is out the drawer stays — R-192's lost-lock sweep (`editor.tsx`) skips it, and Esc and ✕ wait
      data-unstoppable={acting !== null || undefined}
      aria-labelledby="deploy-history-title"
      onClick={(event) => {
        if (acting === null) closeOnBackdrop(event)
      }}
      // D2b is closed by Esc first, and focus goes back to its pin; the next Esc closes the drawer
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return
        if (acting !== null) return void event.preventDefault()
        if (refused === null) return
        event.preventDefault()
        closeRefusal()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && acting !== null) return void event.preventDefault()
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
        <IconButton id="deploy-history-close" data-cancel label={HW.close} title={HW.close} aria-disabled={acting !== null || undefined} onClick={close}>
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
      {/* STORY 7.23a — S8e's Roll back confirm (`S8 Deploy.dc.html:337-345`), nested in the drawer in the wizard's switch-site
          confirm's shape: 410 wide, opened on Cancel (UX-DR14); the summary row is the version's chip, time and gscan chip with no
          by-line (R-189); Pre-flight's own marigold block where Ghost will forget a setting (VERIFY 76) */}
      <dialog
        ref={confirm}
        data-history-confirm
        data-unstoppable={acting !== null || undefined}
        aria-labelledby="history-confirm-title"
        aria-describedby="history-confirm-body"
        onClick={(event) => {
          // the drawer's own backdrop test must never see a click on this one
          event.stopPropagation()
          if (acting === null) closeOnBackdrop(event)
        }}
        // once it starts, it finishes (S8c's rule): the cancel is refused, and so is the keydown that would ask for it — a second Esc
        // after a refused cancel would close it anyway (the wizard's own note). Esc here is this dialog's alone
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return
          event.stopPropagation()
          if (acting !== null) event.preventDefault()
        }}
        onCancel={(event) => {
          event.stopPropagation()
          if (acting !== null) event.preventDefault()
        }}
        onClose={(event) => {
          event.stopPropagation()
          // a close event that arrives after the confirm was opened again belongs to the last opening: nothing to do
          if (confirm.current?.open === true) return
          const id = asking?.id
          setAsking(null)
          // the check this opening sent is dropped should it land now (R-291)
          checking.current++
          setChecked(null)
          // back to the Roll back that opened it (an ending moves it on to ✕ once the list is read again)
          if (id !== undefined) actOf(id)?.focus()
        }}
        // R-291: a drift list longer than the window scrolls INSIDE the confirm — the modal dialog's own `max-height` and
        // `overflow: auto` (the browser's, which `floor.spec.mjs` measures in a short window) — so nothing is drawn past it
        className="m-auto w-[410px] max-w-[calc(100vw-20px)] flex-col gap-4 rounded-lg bg-surface p-6 text-ink shadow-modal backdrop:bg-scrim open:flex"
      >
        {asking === null ? null : (
          <>
            <div className="flex flex-col gap-[5px]">
              <h3 id="history-confirm-title" className="m-0 font-display text-[19px] font-bold tracking-[-0.01em] text-ink">{HW.confirmTitle(asking.n)}</h3>
              <p id="history-confirm-body" className="m-0 text-ui-dense leading-[1.5] text-ink-soft">
                {HW.confirmBody(asking.n, shown.kind === 'rows' ? shown.live : null, asking.drops)}
              </p>
            </div>
            <div data-history-confirm-row className="flex items-center gap-2 rounded-thumb border border-line px-3 py-[9px]">
              {chip(asking, false)}
              <span className="text-[12px] text-ink-soft">{timeLabel(asking.acceptedAt, now)}</span>
              <span className="ml-auto">{gscanChip(asking)}</span>
            </div>
            {/* R-291 — the check's one region, heard once (UX-DR12) */}
            <div role="status" data-history-check={checked === null ? undefined : checked.kind === 'drift' ? (checked.drift?.kind ?? 'none') : checked.kind} className="flex flex-col gap-3 empty:hidden">
              {checked === null ? null : checked.kind === 'reading' ? (
                <StageRow tone="running" label={DW.reading} />
              ) : checked.kind === 'failed' ? (
                <DriftUnverified cause="unreachable" body={causeSentence('unreachable', { host: asking.host, theme: '' })} />
              ) : checked.drift === null ? null : checked.drift.kind === 'clean' ? (
                <div className="overflow-hidden rounded-thumb border border-line">
                  <PassRow words={DW.clean(checked.drift.since)} clean />
                </div>
              ) : checked.drift.kind === 'unverified' ? (
                <DriftUnverified cause={checked.drift.cause} body={causeSentence(checked.drift.cause, { host: asking.host, theme: checked.drift.theme, ...(checked.drift.status === undefined ? {} : { status: checked.drift.status }) })} />
              ) : (
                <>
                  <DriftFound record={checked.drift} idPrefix="history-drift" />
                  <p data-drift-foot className="m-0 text-[12px] leading-[1.55] text-ink-soft [text-wrap:pretty]">{HW.checkFoot(driftCount(checked.drift), asking.n)}</p>
                  {/* Story 7.22 (DW-396): a live zip past the store's size was not kept — no copy, so no Download; the Roll back stays */}
                  {checked.drift.kept === false ? null : (
                    <a id="history-drift-download" href={liveHref(checked.drift.theme)} className={`self-start ${buttonClasses('secondary', 40)}`}>
                      <Download size={13} />
                      {DW.download}
                    </a>
                  )}
                </>
              )}
            </div>
            {asking.drops === null || asking.drops.length === 0 ? null : (
              <div data-history-drops className="flex gap-[9px] rounded border border-marigold-line bg-marigold-tint-soft px-[13px] py-[11px]">
                <AlertTriangle size={14} strokeWidth={1.8} className="mt-px shrink-0 text-marigold-text" />
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="text-[12.5px] font-semibold text-ink">{PREFLIGHT_WORDS.dropped(asking.drops.length, asking.host)}</span>
                  <span className="text-control-label leading-[1.5] text-ink-soft">{PREFLIGHT_WORDS.droppedBody}</span>
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {asking.drops.map((name) => (
                      <li key={name} className="text-control-label leading-[1.5] text-ink">{name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-[10px]">
              <Button type="button" variant="ghost" size={38} weight="font-medium" data-cancel aria-disabled={acting !== null || undefined} onClick={cancelConfirm}>
                {HW.cancel}
              </Button>
              <Button
                type="button"
                id="history-confirm-go"
                variant="primary"
                size={38}
                // R-291: while the check reads it waits — the check is what is busy, and its running row says so
                aria-disabled={acting !== null || reading || undefined}
                aria-busy={acting === asking.id || undefined}
                onClick={() => (reading ? undefined : void putBack(asking))}
              >
                <BusyLabel pending={acting === asking.id} busy={HW.rollingBack}>
                  <RollBack size={12} />
                  {HW.rollBack}
                </BusyLabel>
              </Button>
            </div>
          </>
        )}
      </dialog>
    </dialog>
  )
}
