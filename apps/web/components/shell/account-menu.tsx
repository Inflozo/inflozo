'use client'

import Link from 'next/link'
import { useRef, type ReactNode } from 'react'
import { FreeBadge, ProBadge } from '@/components/kit/badge'
import { ring } from '@/components/kit/greyed'
import { Book, Card, Lightbulb, Logout, Person } from '@/components/kit/icons'
import { arrowKeys, openMenu } from '@/lib/menu'
import type { PlanId } from '@/lib/plan'
import { signOut } from '@/app/(app)/app/sign-in/actions'

/* ───────────────────────────────────────────────── S3 Dashboard.dc.html — S3d, both halves.

   Desktop: the account chip at the bottom of the sidebar opens a 240px popover UPWARDS.
   390: the account row at the bottom of the ☰ DRAWER opens the same menu, 280px, also upwards.
   BOTH ROWS ARE NOW THE SAME ROW at two sizes — see the trigger below and the owner's finding 2
   of 2026-09-06, which extended the phone's ruling to the desktop: no plan badge, and the whole
   address rather than an ellipsis.

   THE PHONE'S MENU MOVED OUT OF THE TOP BAR ON THE OWNER'S RULING (2026-09-05, spec question 2,
   option 1). The frames draw an avatar in the 390 top bar AND an account row in the drawer, and
   he read the pair as one control duplicated: "there are two avatr user menu … can we remove the
   header avatar". They were not the same control — the top bar's opened the menu and the
   drawer's was a label — so removing the top one alone would have taken Account settings,
   Billing, Suggestions, Docs and Sign out off the phone. The ruling merges them instead: one
   initial on a phone, inside ☰, and it is the trigger. His two riders are here too — the row
   shows the display name if there is one and OTHERWISE THE WHOLE EMAIL, never clipped to an
   ellipsis, and the plan badge leaves that row because the menu it opens already carries it.

   KEYBOARD SHORTCUTS IS ABSENT, and the frame draws it. There is no editor yet and therefore
   nothing for the sheet to list — a control that could NEVER act here is absent, not greyed
   (UX-DR3); Story 5.9 adds it back with the shortcuts it lists. Every other destination is a
   real link to the address its surface will have and answers "not found" until its epic lands.

   Light dismiss, Escape and the return of focus to the invoker are the platform's, which is
   what `popover="auto"` buys — and a popover is in the top layer, so the drawer's menu still
   opens ABOVE the modal `<dialog>` it lives inside; `lib/menu.ts` supplies only the placement
   and the arrow keys. */

export type ShellUser = { email: string; displayName: string | null }

/** `profiles.display_name` while E2 sets it; until then the email stands in the name slot. */
export const nameOf = (user: ShellUser) => user.displayName?.trim() || user.email
export const secondLineOf = (user: ShellUser) => (user.displayName?.trim() ? user.email : null)

/**
 * The frame's avatar is Orbit Weekly's brand — the fixture PUBLICATION's, worn by its favicon
 * too — so a real user's takes the frame's other treatment: ink on paper (Maya's portfolio).
 */
export function Avatar({ user, size }: { user: ShellUser; size: 30 | 32 | 36 }) {
  const text = size === 30 ? 'text-control-label' : size === 32 ? 'text-ui-dense' : 'text-ui'
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-paper ${text}`}
    >
      {nameOf(user).trim().charAt(0).toUpperCase()}
    </span>
  )
}

export const PlanBadge = ({ plan }: { plan: PlanId }) => (plan === 'pro' ? <ProBadge /> : <FreeBadge />)

/* One shell renders BOTH variants — the sidebar's at 1440, the drawer's at 390, each hidden
   at the other width — so the two menus need two ids or the document carries a duplicate and
   `popovertarget` picks whichever came first. */
const MENU_ID = { sidebar: 'account-menu', drawer: 'account-menu-mobile' } as const

function Row({
  href,
  icon,
  children,
  after,
  dense,
  onNavigate,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
  after?: ReactNode
  dense: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-[10px] rounded-sm font-medium text-ink transition-colors hover:bg-paper ${
        dense ? 'p-[9px_12px] text-ui-dense' : 'p-[13px_12px] text-[15px]'
      } ${ring}`}
    >
      <span className="shrink-0 text-ink-soft">{icon}</span>
      {children}
      {after}
    </Link>
  )
}

/**
 * `variant` is the frame, not a preference: `sidebar` is S3d's desktop popover opening up from
 * the chip, `drawer` is the phone's, opening up from the account row inside ☰.
 *
 * `onNavigate` is the drawer's: a client-side navigation leaves a modal `<dialog>` open, so the
 * panel has to be told to close as the link is followed. Sign out needs none — it is a server
 * action that replaces the document.
 */
export function AccountMenu({
  user,
  plan,
  variant,
  onNavigate,
}: {
  user: ShellUser
  plan: PlanId
  variant: 'sidebar' | 'drawer'
  onNavigate?: () => void
}) {
  const menu = useRef<HTMLDivElement>(null)
  const id = MENU_ID[variant]
  const dense = variant === 'sidebar'
  const iconSize = dense ? 15 : 16
  const name = nameOf(user)
  const second = secondLineOf(user)
  // A client navigation inside a `popover="auto"` is an inside click and does not light-dismiss,
  // so the menu is told to close as a row is followed — in BOTH variants; the sidebar's showed it
  // only because every destination still 404s outside the shell (review, 2026-09-06).
  const follow = () => {
    menu.current?.hidePopover()
    onNavigate?.()
  }

  // The rect is read on the click, before the popover is shown — see lib/menu.ts. Both
  // variants open UPWARDS now: each sits at the bottom of its own column.
  const place = (event: { currentTarget: HTMLElement }) => {
    if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'up', align: 'left' })
  }

  return (
    <>
      {/* ONE ROW IN BOTH COLUMNS, at each column's size. It was two: the sidebar's carried the
          plan badge at `margin-left:auto` and truncated the name slot — which holds the EMAIL
          until E2 sets a display name — and the badge was taking the width the address needed.
          The owner ruled the desktop the way he had already ruled the phone (2026-09-06,
          finding 2): "remove the Free/Pro plan and show full email. Just like we have in
          mobile." The badge is not lost — it rides the Billing & plan row inside the menu this
          opens, in both variants. `break-all`, because an email has no spaces to break at and
          `break-words` alone leaves it overflowing. No `aria-label`: the visible name IS the
          accessible name (WCAG 2.5.3, Label in Name). This is the second place the phone's
          ruling now governs the desktop, and S3d's chip is drawn with neither — the export is
          untouched (R-74) and the spec is the record. */}
      <button
        type="button"
        popoverTarget={id}
        onClick={place}
        className={`flex w-full items-center gap-[10px] rounded text-left transition-colors hover:bg-paper-sunk ${
          dense ? 'p-[10px_12px]' : 'p-[10px]'
        } ${ring}`}
      >
        <Avatar user={user} size={dense ? 30 : 32} />
        <span
          className={`min-w-0 flex-1 font-semibold break-all text-ink ${dense ? 'text-ui-dense' : 'text-ui'}`}
        >
          {name}
        </span>
      </button>

      <div
        ref={menu}
        id={id}
        popover="auto"
        onKeyDown={arrowKeys}
        // See project-menu.tsx: an author `display` beats the popover's hidden UA rule, so the
        // display arrives with `open:` (Tailwind 4's `:is([open], :popover-open)`) and not before.
        className={`flex-col rounded border border-line bg-surface p-[6px] shadow-lg open:flex ${
          dense ? 'w-[240px]' : 'w-[280px] max-w-[calc(100vw-24px)]'
        }`}
      >
        <div
          className={`mb-1 flex items-center border-b border-line p-[10px_12px] ${dense ? 'gap-[10px]' : 'gap-3'}`}
        >
          <Avatar user={user} size={dense ? 32 : 36} />
          <span className="flex min-w-0 flex-col">
            <span className={`truncate font-semibold text-ink ${dense ? 'text-ui-dense' : 'text-[15px]'}`}>
              {name}
            </span>
            {second ? (
              <span className={`truncate text-ink-soft ${dense ? 'text-helper-caption' : 'text-control-label'}`}>
                {second}
              </span>
            ) : null}
          </span>
        </div>

        <Row href="/account" dense={dense} onNavigate={follow} icon={<Person size={iconSize} />}>
          Account settings
        </Row>
        {/* The badge rides the Billing row in BOTH menus. The 390 frame drew it in the header
            instead, and the owner's ruling took it off the drawer's account row on the grounds
            that "we are already showing it in the menu that opens along with Billing and Plan
            row" — so the row he named is the one place it lives, and no menu carries it twice. */}
        <Row
          href="/billing"
          dense={dense}
          onNavigate={follow}
          icon={<Card size={iconSize} />}
          after={
            <span className="ml-auto shrink-0">
              <PlanBadge plan={plan} />
            </span>
          }
        >
          Billing &amp; plan
        </Row>
        <Row href="/suggestions" dense={dense} onNavigate={follow} icon={<Lightbulb size={iconSize} />}>
          Suggestions
        </Row>
        <Row href="https://inflozo.com/docs" dense={dense} onNavigate={follow} icon={<Book size={iconSize} />}>
          Docs
        </Row>

        <div aria-hidden className="m-[4px_8px] h-px bg-line" />

        {/* Clearing the cookies is a write, so Sign out is 1.4's server action, not a link. */}
        <form action={signOut}>
          <button
            type="submit"
            className={`flex w-full items-center gap-[10px] rounded-sm text-left font-medium text-ink transition-colors hover:bg-paper ${
              dense ? 'p-[9px_12px] text-ui-dense' : 'p-[13px_12px] text-[15px]'
            } ${ring}`}
          >
            <span className="shrink-0 text-ink-soft">
              <Logout size={iconSize} />
            </span>
            Sign out
          </button>
        </form>
      </div>
    </>
  )
}
