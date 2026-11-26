'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { RollBackConfirm, versionChip } from '@/components/editor/deploy-history'
import type { HistoryRequests } from '@/components/editor/history-requests'
import { variants } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { ChevronLeft, ChevronRight, Globe, HistoryClock, RollBack } from '@/components/kit/icons'
import { Avatar } from '@/components/shell/account-menu'
import { useShellUser } from '@/components/shell/shell'
import { versionLabel } from '@/lib/deploy'
import { useSaid } from '@/lib/renders'
import { actSaid, cardTime, HISTORY_WORDS as HW, phoneCard, timeLabel, type ActOutcome, type HistoryRow, type PhoneCard } from '@/lib/retention'

/* ─────────────────────────────────────────── Story 5.22 — D4f, THE SMALL SCREEN NOTICE (`D4 Dashboard Sheets and
   Blocks.dc.html:378-430`), drawn at 390 and captioned with its condition: a phone gets it INSTEAD of the editor.

   WHAT DECIDES IT is `lib/floor.ts`'s `PHONE` (R-201: a touch screen whose shorter side is under 500px), asked once by
   `editor.tsx`'s gate as the project opens — so no lock, heartbeat, sync, IndexedDB or live read ever starts on a phone,
   because the editor that starts them is never mounted. It is a state of the project's own route, never a redirect.

   TWO OF D4f's THREE (R-118, UX-DR3): D4f offers the deploy history with a one-tap Roll back, the sites list and billing.
   The sites list is Story 5.22's and the Deploy history card Story 7.23c's (below); the Billing row arrives with Story 12.5,
   whose criteria name this notice, and until then it is ABSENT, never greyed.

   STORY 7.23c — D4f's DEPLOY HISTORY CARD (`D4 Dashboard Sheets and Blocks.dc.html:401-414`), first under "What works here" and
   above the links card: the clock tile, "Deploy history", "Live v5 · today 2:14 PM", and the bordered row with the version chip,
   its time and the 44px coral-outline Roll back to the version before it. It reads the project's History ONCE as it mounts —
   the route's GET, through the editor's own requests (`history-requests.ts`): no lock, no plan, no Ghost — and draws
   `phoneCard`'s answer (`lib/retention.ts`): the linked site's Live version and History's own undo row (`emphasis`), or
   one sentence where the line goes (nothing shipped, not linked, nothing live, a failed read). Extrapolated in the card's own
   shape: those sentences, the loading card (the tile, two bars and the row's 44px bar, `aria-busy` — never a spinner, R-98)
   and a refusal under the row. THE ROLL BACK IS 7.23a's WHOLE: one tap opens S8e's confirm on Cancel with R-291's check
   (`RollBackConfirm`, the drawer's own component — FR-J9 as built puts a Roll back behind it, and a phone is where taps land
   by accident); it reads no plan and needs no lock. Its endings are said once in this card's polite region (`actSaid`) and
   focus goes to the card's heading — a phone has no ✕ — after the card has read History again; a refusal is said under the
   row with focus back on the Roll back; a stale answer reads again first, as History does. The button is the Kit's
   coral-outline at D4f's own 44 (14 across, 13px, the `thumb` radius): `buttonClasses`' 44 is another drawing, and a class
   passed to `Button` cannot outrank its size (the Kit's own note), so the variant and the ring are the Kit's and the size D4f's.
   ONE PRESS IS 44px ON A PHONE: `globals.css`' coarse rule covers `[data-small-screen]` too, so the confirm's Cancel, Roll back
   and Download reach it as on a tablet.

   THE AVATAR IS DECORATIVE, as D4f draws it (a circle with no role), and it is the user's own initial — the Kit's
   `Avatar`, which is already `aria-hidden`. It is absent where nothing hands a user down; the keyboard harness hands its
   fixture user through the shell's own provider (DW-285), so the floor's phone stop reads it. The owner's ruling of
   2026-09-05 moved the DASHBOARD's phone avatar into ☰ because it duplicated the drawer's row; this surface has no
   drawer, so there is nothing for it to duplicate.

   THE LAPTOP IS D4f's DRAWING, in token colours (`tokens.test.ts` forbids a colour literal in a `.tsx`): its ink, coral
   and hairline are `ink`, `coral` and `line-strong` exactly, and its two grey bars — a warm grey no token carries, and
   one this file may not write (`tokens.test.ts`, comments included) — are drawn in `grey-track`, the nearest token, one
   step lighter (the rounding named here, as `ViewportChip` names its). */

export function SmallScreenNotice({ name, history }: { name: string; history: HistoryRequests }) {
  const user = useShellUser()
  return (
    <div data-small-screen className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <div className="flex h-[60px] shrink-0 items-center gap-2 border-b border-line pl-[6px] pr-3">
        <Link
          href="/"
          aria-label="Back to dashboard"
          title="Back to dashboard"
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-thumb text-ink transition-colors hover:bg-paper-sunk ${ring}`}
        >
          <ChevronLeft size={20} />
        </Link>
        <span className="min-w-0 truncate text-[15px] font-semibold">{name}</span>
        {user === null ? null : (
          <span className="ml-auto flex">
            <Avatar user={user} size={32} />
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-[22px] py-[26px] text-center shadow-sm">
          <svg aria-hidden width="128" height="88" viewBox="0 0 128 88" fill="none" className="shrink-0">
            <rect x="20" y="12" width="88" height="54" rx="4" strokeWidth="1.6" className="stroke-ink" />
            <rect x="10" y="70" width="108" height="5" rx="2.5" strokeWidth="1.6" className="stroke-ink" />
            <rect x="30" y="24" width="34" height="4" rx="2" className="fill-coral" />
            <rect x="30" y="34" width="52" height="3" rx="1.5" className="fill-grey-track" />
            <rect x="30" y="42" width="44" height="3" rx="1.5" className="fill-grey-track" />
            <rect x="30" y="52" width="24" height="6" rx="2" strokeWidth="1.4" className="stroke-line-strong" />
          </svg>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[22px] font-bold leading-[1.2] tracking-[-0.01em]">The editor needs a bigger screen.</h1>
            <p className="text-[13.5px] leading-[1.6] text-ink-soft-aa text-pretty">
              Dragging sections and a 280-pixel control panel don&apos;t fit on a phone yet. Open this project on a laptop or
              tablet.
            </p>
          </div>
        </div>
        <section aria-labelledby="small-screen-works" className="flex flex-col gap-[10px]">
          <h2 id="small-screen-works" className="px-[2px] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink-soft">
            What works here
          </h2>
          <DeployHistoryCard history={history} />
          <div className="flex flex-col overflow-hidden rounded border border-line bg-surface shadow-sm">
            <Link href="/sites" className={`flex h-14 items-center gap-[11px] px-[14px] transition-colors hover:bg-paper ${ring}`}>
              <span aria-hidden className="flex size-[34px] shrink-0 items-center justify-center rounded-thumb bg-paper">
                <Globe size={16} strokeWidth={1.7} className="text-ink-soft-aa" />
              </span>
              <span className="flex-1 text-[13.5px] font-semibold">Your sites</span>
              <ChevronRight size={14} strokeWidth={1.6} className="text-ink-soft" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

/** STORY 7.23c — what the card shows: its loading shape, a failed read, or `phoneCard`'s answer */
type Shown = { kind: 'loading' } | { kind: 'failed' } | PhoneCard

/** D4f's Deploy history card (`:401-414`) — see the header */
function DeployHistoryCard({ history }: { history: HistoryRequests }) {
  const [shown, setShown] = useState<Shown>({ kind: 'loading' })
  const [said, say] = useSaid()
  const now = useMemo(() => new Date(), [])
  /** the row S8e's confirm is open for, and each press (`RollBackConfirm`) */
  const [asking, setAsking] = useState<HistoryRow | null>(null)
  const [opens, setOpens] = useState(0)
  /** a refusal said under the row, Ghost's own words in mono */
  const [note, setNote] = useState<{ id: string; words: string; detail?: string } | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const rollBack = useRef<HTMLButtonElement>(null)

  /** History, read and DRAWN before it returns (`flushSync`), so focus lands on what it drew — or null when the read failed */
  const load = async (): Promise<PhoneCard | null> => {
    const answer = await history.read().catch(() => null)
    const next: Shown = answer === null ? { kind: 'failed' } : phoneCard(answer)
    flushSync(() => setShown(next))
    return next.kind === 'failed' ? null : next
  }

  useEffect(() => {
    void load()
    // once, as the notice mounts — the notice is drawn once per open (R-201's gate), so a reload reads again
  }, [])

  /** AN ENDING, SAID ONCE (UX-DR12) — the confirm's put-back or its check's refusal, in History's own words (`actSaid`), as the
   *  drawer's `settle` says them: live, on the site or gone — the card read again, focus on its heading; a stale answer (409 `live`
   *  or `elsewhere`) or one whose fate is unknown — read again, then under the row if that version is still the undo, else in the
   *  region with focus on the heading (a lost answer that landed said as live); any other refusal — under the row, nothing read
   *  again, and the confirm's close puts focus back on the Roll back */
  const settle = async (row: HistoryRow, outcome: ActOutcome): Promise<void> => {
    const words = actSaid(outcome, row.n, row.host)
    if (outcome.kind === 'live' || outcome.kind === 'uploaded' || outcome.kind === 'gone') {
      say(words)
      await load()
      heading.current?.focus()
      return
    }
    const noted = { id: row.id, words, ...(outcome.kind === 'refused' && outcome.detail !== undefined ? { detail: outcome.detail } : {}) }
    if (outcome.kind === 'failed' || (outcome.kind === 'refused' && (outcome.code === 'live' || outcome.code === 'elsewhere'))) {
      const after = await load()
      if (after?.kind !== 'live' || after.undo?.id !== row.id) {
        say(outcome.kind === 'failed' && after?.kind === 'live' && after.live.id === row.id ? HW.said.live(row.n, row.host) : words)
        heading.current?.focus()
        return
      }
      setNote(noted)
      rollBack.current?.focus()
      return
    }
    setNote(noted)
  }

  const live = shown.kind === 'live' ? shown.live : null
  const undo = shown.kind === 'live' ? shown.undo : null
  /** the line under the title: the Live version and its time, or the state's one sentence */
  const line =
    shown.kind === 'live' ? (
      <>
        {HW.live} <span className="font-mono text-[11px] [font-variant-ligatures:none]">{versionLabel(shown.live.n)}</span> · {cardTime(shown.live.acceptedAt, now)}
      </>
    ) : shown.kind === 'empty' ? HW.empty : shown.kind === 'unlinked' ? HW.unlinked : shown.kind === 'notLive' ? HW.noneLive : HW.cardFailed

  return (
    <div
      data-history-card={shown.kind}
      aria-busy={shown.kind === 'loading' || undefined}
      className="flex flex-col gap-[11px] rounded border border-line bg-surface p-[14px] shadow-sm"
    >
      {shown.kind === 'loading' ? (
        // R-98: the card that is coming, in its own shape — never a spinner
        <>
          <span className="sr-only">{HW.loading}</span>
          <div aria-hidden className="flex items-center gap-[11px]">
            <span className="size-[34px] shrink-0 rounded-thumb bg-paper" />
            <div className="flex flex-1 flex-col gap-[6px]">
              <span className="h-[13px] w-28 rounded-sm bg-paper-sunk" />
              <span className="h-[11px] w-40 rounded-sm bg-paper-sunk" />
            </div>
          </div>
          <div aria-hidden data-history-card-bar className="flex rounded-thumb border border-line px-[11px] py-[9px]">
            <span className="h-11 flex-1 rounded-thumb bg-paper-sunk" />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-[11px]">
            <span aria-hidden className="flex size-[34px] shrink-0 items-center justify-center rounded-thumb bg-paper">
              {/* D4f's hand sits at 15.5; the Kit's one clock draws it at 15 — the rounding named here, as `ViewportChip` names its */}
              <HistoryClock size={16} strokeWidth={1.7} className="text-ink-soft-aa" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <h3 ref={heading} id="small-screen-history" tabIndex={-1} className="m-0 text-[13.5px] font-semibold outline-none">
                {HW.cardTitle}
              </h3>
              <p data-history-card-line className="m-0 text-[12px] text-ink-soft-aa [text-wrap:pretty]">{line}</p>
            </div>
          </div>
          {undo === null || live === null ? null : (
            // D4f `:408-411`: the version before the Live one, its time as History draws it, and its Roll back; the row wraps the
            // button under the chip and the time where the width runs out (v10, another year, a 320 phone) — never sideways
            <div data-history-undo={versionLabel(undo.n)} className="flex flex-wrap items-center gap-[9px] rounded-thumb border border-line px-[11px] py-[9px]">
              {versionChip(undo, false)}
              <span data-history-time className="grow text-[11.5px] text-ink-soft">{timeLabel(undo.acceptedAt, now)}</span>
              <button
                ref={rollBack}
                type="button"
                data-history-act={undo.id}
                aria-haspopup="dialog"
                aria-describedby={note?.id === undo.id ? 'small-screen-history-note' : undefined}
                onClick={() => {
                  setNote(null)
                  setAsking(undo)
                  setOpens((n) => n + 1)
                }}
                className={`inline-flex h-11 shrink-0 items-center gap-[7px] whitespace-nowrap rounded-thumb px-[14px] text-[13px] font-semibold transition-colors ${variants['coral-outline']} ${ring}`}
              >
                <RollBack size={13} />
                {HW.rollBackName(undo.n)}
              </button>
              {/* a refusal, said under the row — its own polite region, there (empty, and out of the row's flow) before its words */}
              <p id="small-screen-history-note" role="status" data-history-note={undo.id} className="m-0 flex basis-full flex-col gap-[3px] text-[11.5px] leading-[1.5] text-danger-text empty:absolute [text-wrap:pretty]">
                {note?.id === undo.id ? (
                  <>
                    <span>{note.words}</span>
                    {note.detail === undefined ? null : <span data-history-detail className="break-words font-mono text-[10.5px] text-ink-soft">{note.detail}</span>}
                  </>
                ) : null}
              </p>
            </div>
          )}
        </>
      )}
      <p data-history-said aria-live="polite" className="sr-only">
        <span key={said.n}>{said.words}</span>
      </p>
      <RollBackConfirm
        asking={asking}
        opens={opens}
        live={live?.n ?? null}
        act={history.act}
        check={history.check}
        liveHref={history.liveHref}
        backTo={() => rollBack.current}
        onEnd={settle}
        onClosed={() => setAsking(null)}
      />
    </div>
  )
}
