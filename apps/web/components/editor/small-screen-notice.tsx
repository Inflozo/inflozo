'use client'

import Link from 'next/link'
import { ring } from '@/components/kit/greyed'
import { ChevronLeft, ChevronRight, Globe } from '@/components/kit/icons'
import { Avatar } from '@/components/shell/account-menu'
import { useShellUser } from '@/components/shell/shell'

/* ─────────────────────────────────────────── Story 5.22 — D4f, THE SMALL SCREEN NOTICE (`D4 Dashboard Sheets and
   Blocks.dc.html:378-430`), drawn at 390 and captioned with its condition: a phone gets it INSTEAD of the editor.

   WHAT DECIDES IT is `lib/floor.ts`'s `PHONE` (R-201: a touch screen whose shorter side is under 500px), asked once by
   `editor.tsx`'s gate as the project opens — so no lock, heartbeat, sync, IndexedDB or live read ever starts on a phone,
   because the editor that starts them is never mounted. It is a state of the project's own route, never a redirect.

   ONE ROW, NOT THREE (R-118, UX-DR3): D4f offers the deploy history with a one-tap Roll back, the sites list and
   billing, and only the sites list exists today. The Deploy history card arrives with Story 7.23 and the Billing row with
   Story 12.5, whose criteria name this notice; until then they are ABSENT, never greyed.

   THE AVATAR IS DECORATIVE, as D4f draws it (a circle with no role), and it is the user's own initial — the Kit's
   `Avatar`, which is already `aria-hidden`. It is absent where nothing hands a user down; the keyboard harness hands its
   fixture user through the shell's own provider (DW-285), so the floor's phone stop reads it. The owner's ruling of
   2026-09-05 moved the DASHBOARD's phone avatar into ☰ because it duplicated the drawer's row; this surface has no
   drawer, so there is nothing for it to duplicate.

   THE LAPTOP IS D4f's DRAWING, in token colours (`tokens.test.ts` forbids a colour literal in a `.tsx`): its ink, coral
   and hairline are `ink`, `coral` and `line-strong` exactly, and its two grey bars — a warm grey no token carries, and
   one this file may not write (`tokens.test.ts`, comments included) — are drawn in `grey-track`, the nearest token, one
   step lighter (the rounding named here, as `ViewportChip` names its). */

export function SmallScreenNotice({ name }: { name: string }) {
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
