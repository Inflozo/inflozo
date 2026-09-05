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
   390: the 32px avatar in the top bar drops a 280px menu DOWN under it, with the plan badge
   in the header rather than on the Billing row.

   KEYBOARD SHORTCUTS IS ABSENT, and the frame draws it. There is no editor yet and therefore
   nothing for the sheet to list — a control that could NEVER act here is absent, not greyed
   (UX-DR3); Story 5.9 adds it back with the shortcuts it lists. Every other destination is a
   real link to the address its surface will have and answers "not found" until its epic lands.

   Light dismiss, Escape and the return of focus to the trigger are the platform's, which is
   what `popover="auto"` buys; `lib/menu.ts` supplies only the placement and the arrow keys. */

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

/* One shell renders BOTH variants — the sidebar's at 1440, the top bar's at 390, each hidden
   at the other width — so the two menus need two ids or the document carries a duplicate and
   `popovertarget` picks whichever came first. */
const MENU_ID = { sidebar: 'account-menu', topbar: 'account-menu-mobile' } as const

function Row({
  href,
  icon,
  children,
  after,
  dense,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
  after?: ReactNode
  dense: boolean
}) {
  return (
    <Link
      href={href}
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
 * the chip, `topbar` is its 390 dropdown opening down from the avatar.
 */
export function AccountMenu({
  user,
  plan,
  variant,
}: {
  user: ShellUser
  plan: PlanId
  variant: 'sidebar' | 'topbar'
}) {
  const menu = useRef<HTMLDivElement>(null)
  const id = MENU_ID[variant]
  const dense = variant === 'sidebar'
  const iconSize = dense ? 15 : 16
  const name = nameOf(user)
  const second = secondLineOf(user)

  // The rect is read on the click, before the popover is shown — see lib/menu.ts.
  const place = (event: { currentTarget: HTMLElement }) => {
    if (menu.current) {
      openMenu(menu.current, event.currentTarget, dense ? { side: 'up', align: 'left' } : { side: 'down', align: 'right' })
    }
  }

  return (
    <>
      {dense ? (
        <button
          type="button"
          popoverTarget={id}
          onClick={place}
          className={`flex w-full items-center gap-[10px] rounded p-[10px_12px] text-left transition-colors hover:bg-paper-sunk ${ring}`}
        >
          <Avatar user={user} size={30} />
          {/* The frame's chip carries a short display name and truncates only the email. Until
              E2 sets one, the EMAIL is in the name slot, so the name slot is what has to
              truncate — an untruncated address pushed the whole chip out of the 220px sidebar. */}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-ui-dense font-semibold text-ink">{name}</span>
            {second ? (
              <span className="max-w-[100px] truncate text-helper-caption text-ink-soft">{second}</span>
            ) : null}
          </span>
          <span className="ml-auto shrink-0">
            <PlanBadge plan={plan} />
          </span>
        </button>
      ) : (
        <button
          type="button"
          popoverTarget={id}
          onClick={place}
          aria-label="Account"
          className={`inline-flex size-11 items-center justify-center rounded-full ${ring}`}
        >
          <Avatar user={user} size={32} />
        </button>
      )}

      <div
        ref={menu}
        id={id}
        popover="auto"
        onKeyDown={arrowKeys}
        // See project-menu.tsx: an author `display` beats the popover's hidden UA rule, so the
        // display arrives with `open:` (Tailwind 4's `:is([open], :popover-open)`) and not before.
        className={`flex-col rounded border border-line bg-surface p-[6px] shadow-lg open:flex ${
          dense ? 'w-[240px]' : 'w-[280px]'
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
          {/* At 390 the badge sits in the header; at 1440 it rides the Billing row instead. */}
          {dense ? null : (
            <span className="ml-auto shrink-0">
              <PlanBadge plan={plan} />
            </span>
          )}
        </div>

        <Row href="/account" dense={dense} icon={<Person size={iconSize} />}>
          Account settings
        </Row>
        <Row
          href="/billing"
          dense={dense}
          icon={<Card size={iconSize} />}
          after={
            dense ? (
              <span className="ml-auto shrink-0">
                <PlanBadge plan={plan} />
              </span>
            ) : undefined
          }
        >
          Billing &amp; plan
        </Row>
        <Row href="/suggestions" dense={dense} icon={<Lightbulb size={iconSize} />}>
          Suggestions
        </Row>
        <Row href="https://inflozo.com/docs" dense={dense} icon={<Book size={iconSize} />}>
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
