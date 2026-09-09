'use client'

import Link from 'next/link'
import { useRef, type ReactNode } from 'react'
import { FreeBadge, ProBadge } from '@/components/kit/badge'
import { ring } from '@/components/kit/greyed'
import { Book, Card, Lightbulb, Logout, Person } from '@/components/kit/icons'
import { useSubmitting } from '@/components/kit/submit'
import { arrowKeys, openMenu } from '@/lib/menu'
import type { PlanId } from '@/lib/plan'
import { nameOf, secondLineOf, type ShellUser } from '@/lib/shell-user'
import { signOut } from '@/app/(app)/app/sign-in/actions'

export type { ShellUser }

/* ───────────────────────────────────────────────── S3 Dashboard.dc.html — S3d, both halves.

   Desktop: the account chip at the bottom of the sidebar opens a 240px popover UPWARDS.
   390: the account row at the bottom of the ☰ DRAWER opens the same menu, 280px, also upwards.
   BOTH ROWS ARE NOW THE SAME ROW at two sizes, and the row is S3b's — all of it, since his
   FOURTH test (2026-09-06, finding 2): the plan badge at the end (his third test) AND the frame's
   one line with an ellipsis where it runs out (his fourth). The badge back means ~88px for the
   address in the 220px column, and no treatment fits `umngkmr@gmail.com` into 88px whole — the
   `break-all` his third test left behind wrapped it mid-word, which is what he then reported. The
   whole address is in the menu the row opens, one click away and unbroken. What settles the name
   line is spec question 5, ruled option 1: there is NO stand-in name, so with nothing in
   `display_name` the row is avatar · address on the small line · badge, and the bold name line
   simply appears the day E2 lets someone save one.

   THE PHONE'S MENU MOVED OUT OF THE TOP BAR ON THE OWNER'S RULING (2026-09-05, spec question 2,
   option 1). The frames draw an avatar in the 390 top bar AND an account row in the drawer, and
   he read the pair as one control duplicated: "there are two avatr user menu … can we remove the
   header avatar". They were not the same control — the top bar's opened the menu and the
   drawer's was a label — so removing the top one alone would have taken Account settings,
   Billing, Suggestions, Docs and Sign out off the phone. The ruling merges them instead: one
   initial on a phone, inside ☰, and it is the trigger. (His two riders that day — no badge on the
   row, and the address never clipped — were reversed by his third and fourth tests in turn; the
   paragraph above is the settled shape. The phone's row still shows the address whole, not
   because it is treated differently but because the drawer's row is the sidebar's whole width
   rather than a 220px column, which leaves the line more than the address needs.)

   KEYBOARD SHORTCUTS IS ABSENT, and the frame draws it. There is no editor yet and therefore
   nothing for the sheet to list — a control that could NEVER act here is absent, not greyed
   (UX-DR3); Story 5.9 adds it back with the shortcuts it lists. Every other destination is a
   real link to the address its surface will have and answers "not found" until its epic lands.

   Light dismiss, Escape and the return of focus to the invoker are the platform's, which is
   what `popover="auto"` buys — and a popover is in the top layer, so the drawer's menu still
   opens ABOVE the modal `<dialog>` it lives inside; `lib/menu.ts` supplies only the placement
   and the arrow keys. */

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
      {/* ONE ROW IN BOTH COLUMNS, at each column's size — S3b's chip at 1440 (30px avatar, name
          13px/600, address 11px ink-soft, badge at `margin-left:auto`) and the drawer's own at
          390 (32px avatar, name 14px/600, the same small address and the same badge).

          THE TOP LINE IS DRAWN ONLY WHEN THERE IS SOMETHING TO PUT ON IT. `display_name` is
          null until E2 builds Account settings, and the owner ruled against inventing a stand-in
          (spec question 5, option 1: "the bold name line appears by itself the day you save a
          name"). So `secondLineOf` is the whole rule: no name → one small grey line holding the
          address; a name → the frame's two lines exactly. That is also why the badge could come
          back after his finding 2 took it off — the address is on the 11px line now, not on the
          bold one, and it has the room.

          ONE LINE, AND AN ELLIPSIS WHERE IT RUNS OUT — S3b's own treatment (`max-width:100px`,
          `text-overflow: ellipsis`), and the owner's FOURTH test, finding 2. `break-all` was the
          previous ruling and it did not clip: it wrapped `umngkmr@gmail.com` mid-word onto a
          second line — "shown full but is cut off" — because the sidebar's text column is about
          88px once the 220px column, its 12px padding, the row's 12px padding, the 30px avatar,
          the 10px gap and the badge are taken out, and NO treatment fits that address into 88px
          whole. So it truncates here, and the whole address is one click away in the menu's own
          header below, which is the widest slot this address is ever given — no avatar and no
          badge beside it — and is deliberately left unbroken. The drawer at 390 gives this same
          line more than the address needs, so the truncation never fires there — one piece of
          code, two sizes. No `aria-label` and no `title`: the visible text IS the accessible name (WCAG
          2.5.3, Label in Name), the full address is in the DOM for a screen reader either way,
          and a tooltip is not a route to information — the menu is. The export is untouched
          (R-74). */}
      <button
        type="button"
        popoverTarget={id}
        onClick={place}
        className={`flex w-full items-center gap-[10px] rounded text-left transition-colors hover:bg-paper-sunk ${
          dense ? 'p-[10px_12px]' : 'p-[10px]'
        } ${ring}`}
      >
        <Avatar user={user} size={dense ? 30 : 32} />
        <span className="flex min-w-0 flex-1 flex-col">
          {second ? (
            <span className={`truncate font-semibold text-ink ${dense ? 'text-ui-dense' : 'text-ui'}`}>
              {name}
            </span>
          ) : null}
          <span className="truncate text-helper-caption text-ink-soft">{second ?? name}</span>
        </span>
        {/* The badge is on the row AND on the Billing & plan line inside the menu: he asked for
            it in both places, so the "one badge per menu" note of 2026-09-06 stands for the menu
            and is superseded for the row. */}
        <span className="ml-auto shrink-0">
          <PlanBadge plan={plan} />
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
          {/* The trigger's rule, again: no name → the address on the small line alone. THIS is
              the copy that is never truncated, and since his fourth test it is the only one:
              the menu is wider than the sidebar's column AND spends none of it on an avatar or a
              badge, so this line is always the roomiest of the three and the address the row had
              to shorten is whole one click away. `break-all` rather than a
              wrap, because an email has no spaces to break at. */}
          <span className="flex min-w-0 flex-col">
            {second ? (
              <span className={`font-semibold break-all text-ink ${dense ? 'text-ui-dense' : 'text-[15px]'}`}>
                {name}
              </span>
            ) : null}
            <span className={`break-all text-ink-soft ${dense ? 'text-helper-caption' : 'text-control-label'}`}>
              {second ?? name}
            </span>
          </span>
        </div>

        <Row href="/account" dense={dense} onNavigate={follow} icon={<Person size={iconSize} />}>
          Account settings
        </Row>
        {/* The badge rides the Billing row in BOTH menus — the 390 frame drew it in the header
            instead, and the owner named this row for it (2026-09-05). Since his third test it
            is on the trigger row as well: he asked for it in both places. */}
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
          <SignOut dense={dense} iconSize={iconSize} />
        </form>
      </div>
    </>
  )
}

/**
 * "no message or confirmation popup … no idea whether they are actually signing out" — the
 * owner's third test, finding 2. He ruled question 6 option 1: say it is working, confirm it
 * happened, and DO NOT add a confirm window ("signing out by accident costs one magic link").
 * So this row says `Signing out…` while the action is in flight and `signOut` lands on
 * `/sign-in?signed-out=1`, where S1's card shows the mint Banner that says it finished.
 *
 * `useFormStatus` is the form's OWN status and needs no state of its own to go wrong — which is
 * why it has to be a child of the `<form>` rather than part of `AccountMenu`.
 *
 * `aria-disabled` and not `disabled`: a disabled button loses focus to the body and stops being
 * announced, and this one is the thing the user is waiting on. The click is refused here instead
 * — `useActionState`-style queuing would otherwise send a second sign-out for one impatient
 * double tap.
 */
function SignOut({ dense, iconSize }: { dense: boolean; iconSize: number }) {
  // THE HOOK IS THIS ROW'S OWN LOGIC, MOVED — not a new one. Every line of it was written here
  // (the released ref, the click guard, `aria-disabled` over `disabled`) and every line of it was
  // reachable only from this file, which is why every form in a SERVER component shipped with no
  // busy state at all and the owner found it on Story 3.4. The markup stays here because this row
  // is not a Kit button; the behaviour lives in `components/kit/submit.tsx` with `Submit`, which
  // is the same thing wearing one.
  const { pending, guard } = useSubmitting()
  return (
    <button
      type="submit"
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      onClick={guard}
      className={`flex w-full items-center gap-[10px] rounded-sm text-left font-medium text-ink transition-colors hover:bg-paper ${
        dense ? 'p-[9px_12px] text-ui-dense' : 'p-[13px_12px] text-[15px]'
      } ${pending ? 'text-ink-soft' : ''} ${ring}`}
    >
      <span className="shrink-0 text-ink-soft">
        <Logout size={iconSize} />
      </span>
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
