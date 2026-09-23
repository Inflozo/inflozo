'use client'

import { useEffect, useRef, useState } from 'react'
import { PLACEHOLDERS } from '@inflozo/library'
import { BAR_POPOVER, BarMenuCard, PLACEHOLDER_ACTION, PlaceholderRow } from '@/components/editor/bar-menu'
import { ring } from '@/components/kit/greyed'
import { Braces } from '@/components/kit/icons'
import { arrowKeys, openMenu } from '@/lib/menu'

/* R-185 (the owner, 2026-09-23) — THE ONE WAY EVERY DYNAMIC PLACEHOLDER IS REACHED, existing and future.

   *"We will show a small '{}' icon near the label of the field where we can have dynamic placeholders. On click
   of that, it will show the list of placeholders we can choose and a small descriptions below each. On right
   side we will have option to copy that code and insert that code. Keep overall design clean and minimal. This
   should be done for all future placeholders and existing ones."*

   WHAT WENT. P0-1's caption `TOKENS THIS FIELD ACCEPTS`, its chip row and the grey info box under the field are
   withdrawn — for `{page_number}`, for `{members}` and for whatever comes next (`P0-1 Inline Text Toolbar.dc.html`
   :174-204, and `:197`'s "A FIELD WITH NO TOKENS SHOWS NO ROW AT ALL" with it). Nothing goes under a field any
   more. The sentence that sat in that box, about other words in braces, is withdrawn from the PRODUCT (the owner,
   the same day: "It is understood") and appears nowhere.

   WHY IT IS NOT A NEW LOOK (R-74's rule for a surface the export does not draw). The menu is the one the owner
   already agreed for Template and View as (R-171): `bar-menu.tsx`'s card — radius 12, 6px padding, `shadow-lg`, an
   11/600 uppercase heading, a list that scrolls inside the card on the Kit's slim scrollbar — and rows of a name
   at 13/500 over ONE line at 11px muted with a trailing slot. Only the rows' contents differ, which is that
   file's stated reason to exist. Placement, both-edge clamping (R-126), flip, light dismiss, Escape and focus
   return are `lib/menu.ts`'s and the platform's, as they are for every menu in the app.

   THE CARD HOLDS THE ROWS AND NOTHING ELSE — no footer, no explanatory sentence (R-185 as amended the same day:
   the menu card holds its rows and nothing else).

   THE BUTTON IS ABSENT WHERE THERE IS NOTHING TO OFFER, never greyed (UX-DR3): on page 1 that is every field but
   the Newsletter's `proofLine`, in the header and footer it is every field on every page (R-186, R-187), and on a
   field that is not typed into it is always. `placeholdersOffered` in the library is the ONE answer to "which,
   here" — the panel never decides that itself. */

export function PlaceholderMenu({
  id,
  label,
  offered,
  onInsert,
}: {
  /** the field's own id — the trigger, the menu and its heading are all named from it */
  id: string
  /** the field's name, which is how a screen reader hears WHICH field this `{}` belongs to */
  label: string
  /** `placeholdersOffered(def, { page, siteWide })`, in `PLACEHOLDERS`' order */
  offered: readonly string[]
  /** the field's own whole-or-nothing insert — `session.insert` while it is live, `replaceRange` at the end
   *  when it is not. Insert LEAVES THE MENU OPEN: it is a thing you may do more than once. */
  onInsert: (code: string) => void
}) {
  const menu = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current)
  }, [])

  // R-185's rule read the other way: a field with nothing to offer carries no button at all
  if (offered.length === 0) return null

  const copy = (code: string) => {
    // A CLIPBOARD THE BROWSER REFUSES LEAVES THE MENU USABLE AND SAYS NOTHING FALSE — no "Copied" that was not.
    // Three ways it can refuse and all three are the same answer: absent (`clipboard` is undefined outside a secure
    // context, and `?.` short-circuits the whole chain), rejected (permissions), or thrown synchronously.
    try {
      navigator.clipboard?.writeText(code).then(
        () => {
          setCopied(code)
          if (timer.current !== null) clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(null), 1600)
        },
        () => {},
      )
    } catch {
      /* said nothing, and the row is still there to press again */
    }
  }

  return (
    <>
      <button
        type="button"
        id={`${id}-placeholders`}
        // WCAG 2.5.3 does not apply — the button has no visible words — so the name says which field it belongs
        // to, which is the only thing "{}" on its own does not say (R-98's neighbourhood)
        aria-label={`Placeholders for ${label}`}
        title={`Placeholders for ${label}`}
        popoverTarget={`${id}-placeholders-menu`}
        onClick={(event) => {
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'down', align: 'left' })
        }}
        className={`-my-1 inline-flex size-5 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink ${ring}`}
      >
        <Braces size={13} />
      </button>
      <div
        ref={menu}
        id={`${id}-placeholders-menu`}
        popover="auto"
        onKeyDown={arrowKeys}
        className={BAR_POPOVER}
      >
        <BarMenuCard width="w-[min(300px,calc(100vw-16px))]" headingId={`${id}-placeholders-heading`} heading="Placeholders">
          {offered.map((token) => {
            const code = `{${token}}`
            return (
              <PlaceholderRow
                key={token}
                code={code}
                description={PLACEHOLDERS[token] ?? ''}
                actions={
                  <>
                    <button type="button" data-copy={token} onClick={() => copy(code)} className={PLACEHOLDER_ACTION}>
                      {copied === code ? 'Copied' : 'Copy'}
                    </button>
                    <button type="button" data-insert={token} onClick={() => onInsert(code)} className={PLACEHOLDER_ACTION}>
                      Insert
                    </button>
                  </>
                }
              />
            )
          })}
        </BarMenuCard>
        {/* R-98: a control that does something says so, and a colour change says nothing to a screen reader.
            Outside the card so it is never a row, and `sr-only` inside a POSITIONED parent so it cannot give
            the popover a scrollbar of its own (R-172's finding). */}
        <p role="status" className="sr-only">{copied === null ? '' : `${copied} copied`}</p>
      </div>
    </>
  )
}
