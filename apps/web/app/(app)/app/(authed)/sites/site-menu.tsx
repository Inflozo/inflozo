'use client'

import { type MouseEvent, useRef } from 'react'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { Key, LinkOff, Refresh, Swatch } from '@/components/kit/icons'
import { useSubmitting } from '@/components/kit/submit'
import { DISCONNECT, HEALTH, KEYS, keysPath, keysPopupPath } from '@/lib/connect-rule'
import { arrowKeys, item as row, openMenu } from '@/lib/menu'
import { BRAND_COPY, brandPath, brandPopupPath } from '@/lib/probe-rule'
import { recheckConnection } from './actions'
import { DisconnectConfirm } from './disconnect-confirm'
import { PanelLink } from './panel-link'

/* ────────────────────────────── S11a's ⋯ menu and the confirm behind it (Story 3.5).

   IT IS CLOSE TO A STRAIGHT LIFT OF `project-menu.tsx`, and that is the point: the same
   `popover="auto"` menu, the same `lib/menu.ts` placement, arrow keys AND `item`
   row (it lives there, not in `project-menu.tsx` — review, 2026-09-09), the same rule above the danger row, and the same `sheet` / `title` / `openOnCancel` dialog
   vocabulary out of `components/kit/dialog.ts`. R-74 — never a second interface vocabulary beside
   this one. The frame's own numbers where they differ: 196px wide (S11 Sites.dc.html:77) against
   S3c's 160, and the broken-link glyph the frame draws on its Disconnect row (`:82`), which is the
   Kit's `LinkOff`.

   STORY 3.7 FILLED IT, AND OBEYED DW-57: IT ADDED INTO THIS MENU RATHER THAN BUILDING A SECOND
   ONE. The frame draws four rows — Re-check connection, Reconnect, Manage API keys, Disconnect;
   3.5 built the last, 3.6 the third, and 3.7 adds **Re-check connection** (the frame's own first
   row, `:78`, with the frame's own refresh glyph) and **Use this site's brand**, which is the
   owner's instruction of 2026-09-10: it used to be a coral link under the card and every other
   per-site action already lives here. It goes FIRST because it is the one item that does something
   *for* the customer rather than *about* the connection.

   THE FRAME'S **Reconnect** ROW IS STILL ABSENT FROM THIS MENU, and that is a departure recorded
   here and in `HEALTH`'s own comment (R-74): as a permanent row it would be a second name for
   **Manage API keys** directly beneath it, and a menu with two rows that open the same panel is a
   menu that teaches people not to read it. It is drawn on the UNHEALTHY CARD instead — where it is
   the recovery action, which is what the frame draws it as (`:99`) — so it appears only where it
   can act (UX-DR3).

   **Use this site's brand** IS ABSENT WHERE THERE IS NO BRAND TO OFFER, not greyed (UX-DR3); the
   card decides that with `hasBrand` and passes the boolean.

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
   AND EVERY OTHER MENU ROW IS A LINK OR A FORM, WHICH IS THE WHOLE JAVASCRIPT-OFF STORY — the shape
   `ConnectSiteButton` already is (`components/shell/shell.tsx`, and its own comment says it in
   those words). `<a href="/sites/disconnect?site=…">` and `<a href="/sites/keys?site=…">` each HAS
   a destination: with JavaScript the click opens something over this card — this dialog for
   Disconnect, the list's own `?manage=` window for Manage keys — and without it the click is a
   navigation and `sites/disconnect/page.tsx` and `sites/keys/page.tsx` serve the same surfaces as
   full pages, posting the same actions. A `<button onClick>` would have been a control that does
   nothing without a script — which is what the first Dev pass shipped, and what this acceptance
   criterion forbids. A MODIFIED click (⌘, ctrl, shift, ALT, middle) is the customer asking for a
   new tab or a saved link and is left alone on BOTH link rows, as the opener's is — alt joined that
   list at the review of 2026-09-09, having been the one gesture the guard swallowed, and it is why
   each row is a guarded `router.push` rather than a `<Link>`, whose own modifier test does not
   include alt.

   **Re-check connection IS A `<form>`, NOT AN `<a>` — BECAUSE IT MUTATES.** It writes
   `sites.health`, `last_checked_at` and the two `routes_*` columns, and possibly a notification row
   and an email; an `<a href>` that did that would mutate on a GET, which R-98's own ruling forbids
   and which a link preloader or a browser prefetch would fire on its own. So it is
   `<form action={recheckConnection}>` with the hidden `site_id` every other form on this card
   carries, and the row is the shape `account-menu.tsx`'s Sign out row already is: not a Kit button,
   so `useSubmitting()` rather than `Submit` — the present-tense label, `aria-disabled`,
   `aria-busy`, and the released in-flight ref that refuses a second press.

   `data-recheck` IS WHAT THE CARD'S STATE LINE SELECTS ON, and it is why this row needs no state
   and the card needs no client boundary: the Kit's busy behaviour already puts `aria-busy="true"`
   on a submitting control, and this popover is a DOM descendant of the card's `<article>` even
   while it is rendered in the top layer. So the state line swaps the mint line for the amber one
   with a `:has()` and nothing more (`(list)/page.tsx` carries that half).

   MANAGE KEYS' AND THE BRAND OFFER'S SHARED HALF LIVES IN `panel-link.tsx`: one control opens a
   panel over this list, so the two cannot drift, and it is where the owner's test of 2026-09-10
   put the busy state his finding 2 asked for. */

export function SiteMenu({ id, name, brand }: { id: string; name: string; brand: boolean }) {
  const menuId = `site-menu-${id}`
  const menu = useRef<HTMLDivElement>(null)
  const confirm = useRef<HTMLDialogElement>(null)

  /** Disconnect's own gesture test: a plain left click is ours, every other one is the browser's
      — ⌘, ctrl, shift, ALT and middle are the customer asking for a new tab or a saved link, and
      alt joined that list at the review of 2026-09-09 having been the one the guard swallowed.
      Manage keys above it makes the same test inside `PanelLink`, which is where the two rows'
      one shared behaviour now lives. */
  const plainClick = (event: MouseEvent<HTMLAnchorElement>) =>
    !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)

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
        {/* STORY 3.7's FIRST ROW — THE OWNER'S INSTRUCTION OF 2026-09-10, moved here from the card
            body. It is the SAME `PanelLink` the card's link was, with the same two addresses and
            the same busy word, so nothing about how the brand window opens changed: a plain click
            goes to `/sites?brand=…`, a window over this list; a modified click and a scripts-off
            click take `/sites/brand?site=…`, the full page. And it is the SAME two sentences —
            `BRAND_COPY.offer` and `BRAND_COPY.opening`, which Story 3.4 wrote and the harness
            already reads from `probe-rule.ts`. A copy of them in `HEALTH` would have been two homes
            for one word (standing rule 7), so the row moved and the words did not. */}
        {brand ? (
          <PanelLink
            href={brandPath(id)}
            panel={brandPopupPath(id)}
            busy={BRAND_COPY.opening}
            onOpened={() => menu.current?.hidePopover()}
            className={`${row} ${ring} hover:bg-paper`}
          >
            <span className="shrink-0 text-ink-soft">
              <Swatch size={15} />
            </span>
            {BRAND_COPY.offer}
          </PanelLink>
        ) : null}

        {/* STORY 3.7's OTHER ROW, AND IT IS THE FRAME'S OWN FIRST ITEM (`S11 Sites.dc.html:78`),
            with the frame's own circular-arrow glyph — the Kit's `Refresh`, which is that glyph
            already. A `<form>` and not a link, because it mutates; see the header. */}
        <form action={recheckConnection}>
          <input type="hidden" name="site_id" value={id} />
          <RecheckRow />
        </form>

        {/* STORY 3.6's ROW, AND IT IS THE FRAME'S OWN THIRD ITEM (`S11 Sites.dc.html:80`), with the
            frame's key glyph. It goes ABOVE the rule, into the menu 3.5 built rather than into a
            second one (DW-57).

            IT OPENS A WINDOW OVER THIS LIST, EXACTLY AS DISCONNECT BELOW IT DOES — the owner's
            test of 3.6, finding 1: "Can we show the Manage Keys as a popup on the Sites screen
            rather than a separate screen." Two rows of one menu had two behaviours, and the reason
            was an engineering one that did not survive: the panel draws the ADMIN KEY'S ID HALF,
            which lives in `private.site_credentials` and is reachable only through
            `server/ghost-admin` (AD-10, §21j), so the card cannot RENDER the panel without a
            pooler round trip per card on the busiest route in the app.

            SO THE WINDOW IS NOT RENDERED BY THIS CARD. The click is a soft navigation to
            `/sites?manage=<id>` — a parameter on the list itself — and the list renders the panel
            in a `<dialog>` over the cards only while that parameter is there: one component, one
            credential read, taken only when somebody opens it (`panel-modal.tsx` records why it is
            a parameter and not an intercepted route). The `href` and its destination are
            untouched, which is the JavaScript-off story and an acceptance criterion: with no
            script the click is a document load and `sites/keys/page.tsx` serves the same panel as
            a full page. */}
        <PanelLink
          href={keysPath(id)}
          panel={keysPopupPath(id)}
          busy={KEYS.opening}
          /* THE MENU STAYS OPEN UNTIL THE WINDOW IS THERE — the owner's test of 2026-09-10,
             finding 2: "it takes some time and while it is still not open I can click the Menu
             link again. If I do so the popup open on a blank screen instead of the Sites screen."
             It used to be hidden on the press, so the one control that could say anything about
             the wait left the screen the instant there was a wait to report. Now the row says
             `Opening…`, refuses a second press (`PanelLink`), and the popover goes when the
             navigation lands. */
          onOpened={() => menu.current?.hidePopover()}
          className={`${row} ${ring} hover:bg-paper`}
        >
          <span className="shrink-0 text-ink-soft">
            <Key size={15} />
          </span>
          {KEYS.menu}
        </PanelLink>
        {/* The frame's own rule above the danger row (`S11 Sites.dc.html:81`). It is what makes
            Disconnect read as set apart from Manage API keys above it, and the owner's manual test
            names it — "a thin line and one red item". */}
        <div aria-hidden className="m-[4px_8px] h-px bg-line" />
        <a
          href={`/sites/disconnect?site=${id}`}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (!plainClick(event)) return
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

/**
 * **Re-check connection**'s ROW, AND IT IS A CHILD OF ITS OWN `<form>` — `useFormStatus` reads the
 * form it sits INSIDE, so a row rendered by `SiteMenu` beside the form would read nothing
 * (`components/kit/submit.tsx`'s header is the record). `account-menu.tsx`'s Sign out row is the
 * same shape for the same reason: not a Kit `Button`, so `useSubmitting()` rather than `Submit`.
 *
 * `aria-disabled` AND NOT `disabled`: a disabled control loses focus to the body and stops being
 * announced, and this one is the thing the customer is waiting on. `guard` refuses the second press
 * instead — React queues form actions, so without it one impatient double tap sends two checks.
 *
 * `data-recheck` IS THE HOOK THE CARD'S STATE LINE READS (see `SiteMenu`'s header). It is on the
 * BUTTON, beside the `aria-busy` the hook sets, because those two together are what "this card is
 * being checked right now" means in the DOM — and nothing else in the card can be busy in that way.
 */
function RecheckRow() {
  const { pending, guard } = useSubmitting()
  return (
    <button
      type="submit"
      data-recheck
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      onClick={guard}
      className={`${row} ${ring} hover:bg-paper ${pending ? 'text-ink-soft' : ''}`}
    >
      <span className="shrink-0 text-ink-soft">
        <Refresh size={15} />
      </span>
      {pending ? HEALTH.recheckBusy : HEALTH.recheck}
    </button>
  )
}
