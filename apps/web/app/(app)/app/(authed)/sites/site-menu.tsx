'use client'

import { type MouseEvent, useRef } from 'react'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { Key, LinkOff } from '@/components/kit/icons'
import { DISCONNECT, KEYS } from '@/lib/connect-rule'
import { arrowKeys, item as row, openMenu } from '@/lib/menu'
import { DisconnectConfirm } from './disconnect-confirm'

/* ────────────────────────────── S11a's ⋯ menu and the confirm behind it (Story 3.5).

   IT IS CLOSE TO A STRAIGHT LIFT OF `project-menu.tsx`, and that is the point: the same
   `popover="auto"` menu, the same `lib/menu.ts` placement, arrow keys AND `item`
   row (it lives there, not in `project-menu.tsx` — review, 2026-09-09), the same rule above the danger row, and the same `sheet` / `title` / `openOnCancel` dialog
   vocabulary out of `components/kit/dialog.ts`. R-74 — never a second interface vocabulary beside
   this one. The frame's own numbers where they differ: 196px wide (S11 Sites.dc.html:77) against
   S3c's 160, and the broken-link glyph the frame draws on its Disconnect row (`:82`), which is the
   Kit's `LinkOff`.

   DISCONNECT IS ITS ONLY ITEM. The frame draws four — Re-check connection, Reconnect, Manage API
   keys, Disconnect — and the other three are Stories 3.6's and 3.7's. A control that could NEVER
   act is ABSENT, not greyed (UX-DR3), so they are not here at all; 3.6 and 3.7 add INTO this menu
   rather than building a second one (DW-57, amended).

   THE CONFIRM ASKS FOR NO TYPED CONFIRMATION — the owner's ruling at Question 2 (option 1,
   2026-09-09). It borrows the project-delete dialog's VISUAL vocabulary and not its typed name
   field: the 460px sheet, the centred disc, the display title, the 13px body, two equal-half
   buttons at 44. Nothing here is destroyed — FR-C6 keeps the record, the projects and the
   snapshots — so the friction matches the risk, and typing a name to undo something that undoes
   itself teaches people that our scary dialogs are not worth reading. DO NOT ADD ONE BACK.

   THE DISC WEARS THE SAME GLYPH THE MENU ROW DOES, as Delete's wears its own trash: one action,
   one symbol.

   IT OPENS WITH FOCUS ON CANCEL (EXPERIENCE.md § Destructive confirms) — `data-cancel` and
   `openOnCancel`, because `autoFocus` alone does not do it (`kit/dialog.ts` records why).

   THE SUBMIT IS A REAL `<form action={disconnectSite}>` carrying the server action's OWN dispatch,
   so React progressively enhances it and a scripts-off browser posts it natively (`project-menu.tsx`
   :52-64 is the record of what happens when a client closure is passed instead). `Submit` carries
   the required `busy` label (R-98) and its own double-submit guard, so this file needs neither a
   `useActionState` nor a ref: `disconnectSite` answers nothing and redirects.
   AND THE MENU ROW IS A LINK, WHICH IS THE WHOLE JAVASCRIPT-OFF STORY — the shape
   `ConnectSiteButton` already is (`components/shell/shell.tsx:95`, and its own comment says it in
   those words). `<a href="/sites/disconnect?site=…">` HAS a destination: with JavaScript the click
   is intercepted and this dialog opens; without it the click is a navigation and
   `sites/disconnect/page.tsx` serves the same confirm as a full page, posting the same action. A
   `<button onClick>` would have been a control that does nothing without a script — which is what
   the first Dev pass shipped, and what this acceptance criterion forbids. A MODIFIED click (⌘, ctrl,
   shift, ALT, middle) is the customer asking for a new tab or a saved link and is left alone, as
   the opener's is — alt joined that list at the review of 2026-09-09, having been the one gesture
   the guard swallowed. */

export function SiteMenu({ id, name }: { id: string; name: string }) {
  const menuId = `site-menu-${id}`
  const menu = useRef<HTMLDivElement>(null)
  const confirm = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        popoverTarget={menuId}
        aria-label={`Options for ${name}`}
        onClick={(event) => {
          // The ⋯ sits at the card's right edge, so the menu hangs leftwards and down from it.
          // The rect is read here because the popover is still `display:none` (see lib/menu.ts).
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'down', align: 'right' })
        }}
        className={`rounded-sm px-1 font-semibold tracking-[2px] text-ink-soft transition-colors hover:text-ink [&:has(+:popover-open)]:text-ink ${ring}`}
      >
        ⋯
      </button>

      <div
        ref={menu}
        id={menuId}
        popover="auto"
        onKeyDown={arrowKeys}
        // `open:flex` and never a bare `flex`: any author `display` beats the user agent's
        // `[popover]:not(:popover-open){display:none}` and the menu renders inside every card.
        className="w-[196px] flex-col rounded border border-line bg-surface p-[6px] shadow-lg open:flex"
      >
        {/* STORY 3.6's ROW, AND IT IS THE FRAME'S OWN THIRD ITEM (`S11 Sites.dc.html:80`), with the
            frame's key glyph. It goes ABOVE the rule, into the menu 3.5 built rather than into a
            second one (DW-57). Re-check connection and Reconnect are Story 3.7's and are still
            ABSENT rather than greyed (UX-DR3).

            IT IS A PLAIN LINK THAT NAVIGATES, AND THAT IS THE ONE PLACE THIS ROW DIFFERS FROM
            DISCONNECT BELOW IT. Disconnect's click is intercepted into the card's `<dialog>`
            because everything its confirm draws is already on this card. Manage keys is not: it
            draws the ADMIN KEY'S ID HALF, which lives in `private.site_credentials` and is
            reachable only through `server/ghost-admin` (AD-10, §21j). Rendering it here would put
            a chokepoint read on the Sites list — one pooler round trip per card, on the busiest
            route in the app — and rendering it WITHOUT that value would give the dialog a
            different Admin row from the route's, which is exactly the drift "one component for
            both" exists to prevent. So there is one surface, `/sites/keys?site=…`, and this row
            goes to it. A modified click already opened it in a new tab; now every click does.
            (Recorded in the spec's Change Log — the Code Map named both shapes.) */}
        <a href={`/sites/keys?site=${id}`} className={`${row} ${ring} hover:bg-paper`}>
          <span className="shrink-0 text-ink-soft">
            <Key size={15} />
          </span>
          {KEYS.menu}
        </a>
        {/* The frame's own rule above the danger row (`S11 Sites.dc.html:81`). It is what makes
            Disconnect read as set apart from Manage API keys above it, and the owner's manual test
            names it — "a thin line and one red item". */}
        <div aria-hidden className="m-[4px_8px] h-px bg-line" />
        <a
          href={`/sites/disconnect?site=${id}`}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
            if (!confirm.current) return
            event.preventDefault()
            // The menu is a popover and has to go before the modal opens.
            menu.current?.hidePopover()
            openOnCancel(confirm.current)
          }}
          className={`${row} ${ring} text-danger-text hover:bg-danger-tint`}
        >
          <span className="shrink-0 text-danger">
            <LinkOff size={15} />
          </span>
          {DISCONNECT.menu}
        </a>
      </div>

      <dialog
        ref={confirm}
        onClick={closeOnBackdrop}
        aria-labelledby={`disconnect-${id}-title`}
        className={`${sheet} gap-5`}
      >
        <DisconnectConfirm
          id={id}
          name={name}
          cancel={
            <Button
              type="button"
              variant="secondary"
              size={44}
              data-cancel
              className="w-full"
              onClick={() => confirm.current?.close()}
            >
              {DISCONNECT.cancel}
            </Button>
          }
        />
      </dialog>
    </>
  )
}
